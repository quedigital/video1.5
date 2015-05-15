define(["bootstrap-dialog", "database", "bootstrap-notify", "videojs", "videojs-markers"], function (BootstrapDialog, Database) {

	String.prototype.toHHMMSS = function () {
		var sec_num = parseInt(this, 10);
		var hours   = Math.floor(sec_num / 3600);
		var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		var seconds = sec_num - (hours * 3600) - (minutes * 60);

		if (hours < 10) { hours   = "0" + hours; }
		if (minutes < 10) { minutes = "0" + minutes; }
		if (seconds < 10) { seconds = "0" + seconds; }
		
		var time = (hours == "00" ? "" : hours + ":")
			+ (minutes == "00" && hours == "00" ? "" : minutes)
			+ ":" + seconds;
		
		return time;
	};

	function URLWithoutHash (url) {
		var n = url.lastIndexOf("#");
		if (n != -1) return url.substr(0, n);
		else return url;
	}


	videojs.BackButton = videojs.Button.extend({});

	videojs.BackButton.prototype.buttonText = 'Back 10';

	videojs.BackButton.prototype.buildCSSClass = function (){
		return 'vjs-back-button ' + videojs.Button.prototype.buildCSSClass.call(this);
	};

	videojs.BackButton.prototype.onClick = function (){
		var t = this.player().currentTime();
		this.player().currentTime(t - 10);
	};

	var VideoManager = {
		initialize: function (toc, el, player, markers, db) {
			this.toc = toc;
			this.el = el;
			this.markers = markers;
			this.player = player;
			this.iFrameReady = false;

			Database.initialize(toc);
			$(".toc").TOCTree("setStatus", Database.getItems());

			this.updateProgress();

			this.pop = Popcorn(el, { frameAnimation: true });

			var backButton = new videojs.BackButton(this.player);
			this.player.controlBar.addChild(backButton);

			this.player.on("play", $.proxy(this.onVideoStarted, this));
			this.player.on("ended", $.proxy(this.onVideoEnded, this));
			this.player.on("timeupdate", $.proxy(this.saveCurrentVideoTime, this));

			this.player.markers({
				markerStyle: {
					"width": "8px",
					"background-color": "rgb(218, 197, 93)"
				},
				markerTip: {
					display: true,
					text: function (marker) {
						console.log(marker.class);
						return "Marker: " + marker.text;
					}
				}
			});

			this.currentIndex = undefined;

			this.trackID = 1;
		},

		getCurrentIndex: function () {
			return this.currentIndex;
		},

		saveCurrentVideoIndex: function () {
			Database.saveCurrentIndex(this.currentIndex);
		},

		saveCurrentVideoTime: function () {
			var t = this.player.currentTime();
			Database.saveCurrentTime(t);
		},

		getCurrentVideoTime: function () {
			return Database.getCurrentTime();
		},

		loadMostRecentVideo: function () {
			var index = Database.getCurrentIndex();

			if (index == undefined) {
				this.loadFirstVideo();
			} else {
				this.playFromTOC(index, { pause: true, time: this.getCurrentVideoTime() } );
			}
		},

		loadFirstVideo: function () {
			var index = this.getFirstVideoFromTOC();

			if (index == undefined) {
				index = 0;
			}

			this.playFromTOC(index, { pause: true });
		},

		playFirstVideo: function () {
			var index = this.getFirstVideoFromTOC();
			
			this.playFromTOC(index);
		},
		
		playFromTOC: function (index, options) {
			if (options.skipToNextSource) {
				while (index < this.toc.length && URLWithoutHash(this.toc[index].src) == options.previousSource) {
					index++;
				}

				if (index >= this.toc.length) return;
			}

			// if this is iframe content, open it now; otherwise, it's video
			if (this.toc[index].src) {
				this.playExtraFromTOC(index, options);
				return;
			}

			while (index < this.toc.length && !this.toc[index].video) {
				index++;
			}

			if (index >= this.toc.length) return;

			var src = "video/" + this.toc[index].video;

			if (window.location.hostname == "localhost") {
				src = "https://video15.firebaseapp.com/" + src;
			}

			this.player.src({ type: "video/mp4", src: src });

			if (options && options.time) {
				this.player.currentTime(options.time);
			}

			$("#main_iframe").hide();
			$("#main_video").show();

			if (options && options.pause) {
			} else {
				this.player.play();
			}

			this.currentIndex = index;
			
			this.updateUI();

			var showAllMarkers = options && options.showAllMarkers;

			this.addMarkers(showAllMarkers);

			this.removeAllTriggers();
			this.addTriggersForThisVideo();

			this.saveCurrentVideoIndex();
		},

		playExtraFromTOC: function (index, options) {
			this.iFrameReady = false;

			if (options.doNotLoad != true) {
				var sel = $(".text-holder *").not("#main_iframe");
				sel.remove();
//				$("iframe[id != 'main_iframe']").remove();
				$("#main_iframe").attr( { src: this.toc[index].src, "data-index": index } ).show();
				$("#main_video").hide();
				this.player.pause();
			}

			this.currentIndex = index;

			this.updateUI();

			var showAllMarkers = options && options.showAllMarkers;

			this.addMarkers(showAllMarkers);

			this.removeAllTriggers();
			this.addTriggersForThisVideo();

			this.saveCurrentVideoIndex();
		},
		
		getFirstVideoFromTOC: function () {
			for (var i = 0; i < this.toc.length; i++) {
				var d = this.toc[i];
				if (d.video) {
					return i;
				}
			}
		
			return undefined;
		},
		
		advanceTOC: function (options) {
			if (this.currentIndex < this.toc.length - 1) {
				this.playFromTOC(this.currentIndex + 1, options);
			}
		},

		onVideoStarted: function () {
			this.markItemStarted(this.currentIndex);
		},

		onVideoEnded: function () {
			this.markItemCompleted(this.currentIndex);

			this.advanceTOC();
		},

		onPageScrolledToEnd: function () {
			this.markItemCompleted(this.currentIndex);

			var previousSrc = URLWithoutHash(this.toc[this.currentIndex].src);

			//this.advanceTOC( { previousSource: previousSrc, skipToNextSource: true } );
			this.advanceTOC( { previousSource: previousSrc, skipToNextSource: true, doNotLoad: true } );
		},

		markItemStarted: function (index) {
			var completed = Database.getItemProperty(this.currentIndex, "completed");
			if (!completed) {
				Database.setItemProperty(this.currentIndex, "started", true);
				$(".toc").TOCTree("markStarted", index);
			}
		},

		markCurrentItemStarted: function () {
			this.markItemStarted(this.currentIndex);
		},

		markItemCompleted: function (index) {
			Database.setItemProperty(this.currentIndex, "completed", true);
			$(".toc").TOCTree("markCompleted", index);

			this.updateProgress();
		},

		updateUI: function () {
			$(".nav-list.toc a").removeClass("active animated tada");
			$(".nav-list.toc a").eq(this.currentIndex).hide(0).addClass("active animated slideInLeft").show(0);
		},

		updateProgress: function () {
			var pct = Math.round(Database.getPercentageComplete() * 100);
			$("#completed-progress").css("width", pct);
			// this is used by .progress::after (works on all browsers?)
			$(".progress").attr("data-progress", pct + "% Complete");
		},

		addTimelineMarkers: function () {
			var curDepth = this.toc[this.currentIndex].depth;

			var mz = [];

			for (var i = 0; i < this.markers.length; i++) {
				var m = this.markers[i];

				if (m.depth == curDepth) {
					var txt = m.type == "epub" ? (m.text ? m.text : "Click here to read more") : m.text;

					var item = {time: m.start, text: txt};

					mz.push(item);
				}
			}

			this.player.markers.reset(mz);
		},
		
		addMarkers: function (showAllMarkers) {
			this.addTimelineMarkers();

			var curDepth = this.toc[this.currentIndex].depth;

			var data = [];
			var counter = 0;
			
			for (var i = 0; i < this.markers.length; i++) {
				var m = this.markers[i];

				if (m.depth == curDepth) {
					var item = {};

					var txt = m.type == "epub" ? (m.text ? m.text : "Click here to read more") : m.text;

					item.depth = (counter++).toString();

					switch (m.type) {
						case "epub":
							item.short = "<i class='fa fa-book'></i>";
							break;
						case "files":
						case "code":
							item.short = "<i class='fa fa-file-code-o'></i>";
							break;
						case "extra":
							item.short = "<i class='fa fa-question-circle'></i>";
							break;
						case "sandbox":
							item.short = "<i class='fa fa-desktop'></i>";
							break;
						default:
							console.log(m.type);
							break;
					}

					item.desc = txt;
					item.callback = $.proxy(this.onClickMarker, this, i);
					item.timestamp = String(m.start).toHHMMSS();
					item.id = i;

					data.push(item);
/*

//					var el = $("<div>", { class: "alert trackalert" }).attr("role", "alert");
					var el = $("<div>", { class: "trackalert" });
					if (!showAllMarkers) el.addClass("x-hidden");


					var r = $("<div>", { class: "row"}).appendTo(el);

					var d1 = $("<div>", { class: "col-xs-9" }).appendTo(r);
					var d2 = $("<div>", { class: "col-xs-3" }).appendTo(r);

					var defaultPlacement = true;

					switch (m.type) {
						case "code":
							//el.addClass("alert-danger");
							break;
						case "sandbox":
							//el.addClass("alert-info");
							break;
						case "quiz":
							//el.addClass("alert-warning");
							break;
						case "files":
							//el.addClass("alert-danger");
							break;
						case "epub":
							var coverURL = "epubs/" + m.src + "/OEBPS/html/graphics/" + m.cover;

							//el.addClass("alert-success");

							var cover = $("<img>", { src: coverURL, class: "tiny-thumbnail" });
							d2.append(cover);

							break;
						case "extra":
							//el.addClass("alert-danger");
							break;
					}

					$("<span>", {class: "badge", text: String(m.start).toHHMMSS()}).appendTo(d1);

					$("<span>", {html: " " + txt}).appendTo(d1);

					el.click($.proxy(this.onClickMarker, this, i));

					container.append(el);

					if (!m.elements) m.elements = {};
					m.elements.alert = el;
*/
					m.alert = i;
				}
			}

			if (data.length) {
				$(".resource-list").TOCTree("option", "data", data);
			}
		},
		
		addTriggersForThisVideo: function () {
			var curDepth = this.toc[this.currentIndex].depth;
			
			for (var i = 0; i < this.markers.length; i++) {
				var m = this.markers[i];
				if (m.depth == curDepth) {
					//var el = m.elements ? m.elements.alert : undefined;
					this.pop.timebase( { start: m.start, end: m.end, alert: m.alert, id: this.trackID++, text: m.text,
						callback: $.proxy(this.onClickMarker, this, i) } );
				}
			}
		},

		removeAllTriggers: function () {
			for (var i = 0; i < this.trackID; i++) {
				console.log("removing " + i);
				this.pop.removeTrackEvent(i);
			}

			delete this.pop;

			this.pop = Popcorn(this.el, { frameAnimation: true });

			this.trackID = 1;
		},
		
		onClickMarker: function (index) {
			this.player.pause();
			
			var me = this;
			
			var m = this.markers[index];
			
			switch (m.type) {
				case "code":
					var contents = m.html;
					
					BootstrapDialog.show({
						title: "Code Listing",
						message: contents,
						size: BootstrapDialog.SIZE_WIDE,
						onshown: function (dialog) {
							dialog.getModalBody().find(".code-listing").prepend('<span class="btn-clipboard">Copy</span>');
							dialog.getModalBody().find(".btn-clipboard").click($.proxy(me.onClipboard, me));
        			    },
					});
					
					break;
					
				case "sandbox":
					var contents = m.html;
					
					var wh = $(window).outerHeight();
					contents = contents.replace("__window height__", (wh * .75));
					
					BootstrapDialog.show({
						title: "Sandbox",
						message: contents,
						size: BootstrapDialog.SIZE_WIDE,
					});
					
					break;
					
				case "quiz":
					var contents = "Quiz goes here.";
					
					BootstrapDialog.show({
						title: "Quiz",
						message: contents,
						size: BootstrapDialog.SIZE_WIDE,
					});
					
					break;
					
				case "files":
					var contents = "<ul><li>File1.cpp</li><li>File2.cpp</li><li>Data_input.txt</li></ul>";
					
					BootstrapDialog.show({
						title: "Project Files",
						message: contents,
						size: BootstrapDialog.SIZE_WIDE,
						buttons: [ { label: 'Download All', action: $.proxy(me.onDownload, me) } ]
					});
					
					break;
					
                case "epub":
	                var coverURL = "epubs/" + m.src + "/OEBPS/html/graphics/" + m.cover;
	                var cover = "<img class='img-thumbnail' src='" + coverURL + "'/>";

	                var contents = '<div class="row"><div class="col-xs-2"><a class="center-block text-center" href="https://www.informit.com/store/learning-node.js-a-hands-on-guide-to-building-web-applications-9780321910578" target="_blank">' + cover + '<p class="small">Link to the Book</p></a></div><div class="col-xs-10"><iframe src="epubs/' + m.src + '/OEBPS/html/' + m.page + '" width="100%" height="__window height__" frameborder="0"></iframe></div></div>';
	                var wh = $(window).outerHeight();
	                contents = contents.replace("__window height__", (wh * .75));

                    BootstrapDialog.show({
                        title: "<span class='lead'>Read more.</span> An excerpt from <strong>" + m.title + "</strong>",
	                    message: contents,
                        size: BootstrapDialog.SIZE_WIDE
	                    /* To inject CSS:
	                    onshown: function (dialogRef) {
		                    var frm = $("iframe")[0].contentDocument;
		                    var otherhead = frm.getElementsByTagName("head")[0];
		                    var link = frm.createElement("link");
		                    link.setAttribute("rel", "stylesheet");
		                    link.setAttribute("type", "text/css");
		                    link.setAttribute("href", "http://fonts.googleapis.com/css?family=Bitter");
		                    otherhead.appendChild(link);
		                    var body = frm.getElementsByTagName("body")[0];
		                    console.log(body);
	                    }*/
                    });

                    break;

				case "extra":
					var contents = '<iframe src="' + m.src + '" width="100%" height="__window height__" frameborder="0"></frame>';

					var wh = $(window).outerHeight();
					contents = contents.replace("__window height__", (wh * .75));

					BootstrapDialog.show({
						title: "Try This…",
						message: contents,
						size: BootstrapDialog.SIZE_WIDE
					});

					break;
			}
		},
		
		onClipboard: function (event) {
			event.stopPropagation();
		
			$.notify({
				// options
				message: 'Code copied to clipboard.',
			},{
				// settings
				type: 'info',
				allow_dismiss: false,
				delay: 3000,
				z_index: 5000,
				animate: {
					enter: 'animated fadeInDown',
					exit: 'animated fadeOutUp'
				},			
			});		
		},
		
		onDownload: function (event) {
			$.notify({
				// options
				message: 'Downloaded.',
			}, {
				// settings
				type: 'success',
				allow_dismiss: false,
				delay: 3000,
				z_index: 5000,
				animate: {
					enter: 'animated fadeInDown',
					exit: 'animated fadeOutUp'
				},
			});
		},

		isShowingAll: function () {
			return this.pop.SHOWING_ALL;
		},

		getNextSection: function () {
			// return the title of the next entry with a different src (ie, a different section)
			var curSrc = URLWithoutHash(this.toc[this.currentIndex].src);

			for (var i = this.currentIndex + 1; i < this.toc.length; i++) {
				var nextSrc = URLWithoutHash(this.toc[i].src);
				if (nextSrc != curSrc) {
					return { index: i, title: this.toc[i].desc, src: nextSrc };
				}
			}

			return null;
		}
			
	};
	
	return VideoManager;
	
});