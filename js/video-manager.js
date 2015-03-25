define(["bootstrap-dialog", "bootstrap-notify"], function (BootstrapDialog) {

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

	var VideoManager = {
		initialize: function (toc, el, player, markers) {
			this.toc = toc;
			this.markers = markers;
			this.player = player;

			this.pop = Popcorn(el, { frameAnimation: true });
			
			this.player.on("ended", $.proxy(this.onVideoEnded, this));
			
			this.currentIndex = undefined;

			this.trackID = 0;
		},

		loadFirstVideo: function () {
			var index = this.getFirstVideoFromTOC();

			this.playFromTOC(index, { pause: true });
		},

		playFirstVideo: function () {
			var index = this.getFirstVideoFromTOC();
			
			this.playFromTOC(index);
		},
		
		playFromTOC: function (index, options) {
			while (!this.toc[index].video) {
				index++;
			}
			
			var src = "video/" + this.toc[index].video;
			
			this.player.src({ type: "video/mp4", src: src });

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
		
		advanceTOC: function () {
			if (this.currentIndex < this.toc.length - 1) {
				this.playFromTOC(this.currentIndex + 1);
			}
		},
		
		onVideoEnded: function () {
			this.advanceTOC();
		},
		
		updateUI: function () {
			$(".nav-list.toc a").removeClass("active animated tada");
			$(".nav-list.toc a").eq(this.currentIndex).hide(0).addClass("active animated slideInLeft").show(0);
		},
		
		onShowSandbox: function (event) {
			this.player.pause();
		
			var wh = $(window).outerHeight();
		
			var title = $(event.target).text();
	
			var contents;	
			
			if (title == "Sandbox 1") {
				contents = '<iframe src="http://pearson.programmr.com/embed.php?action=tf&amp;path=pearson/files/jquerybook/listing2_1" width="100%" height="' + (wh * .75) + '" frameborder="0"></iframe>';
			} else {
				contents = '<iframe src="http://pearson.programmr.com/embed.php?action=tf&amp;path=pearson/files/jquerybook/listing2_2" width="100%" height="' + (wh * .75) + '" frameborder="0"></iframe>';
			}
		
			BootstrapDialog.show({
				title: title,
				message: contents,
				size: BootstrapDialog.SIZE_WIDE
			});
		},
		
		addMarkers: function (showAllMarkers) {
			var curDepth = this.toc[this.currentIndex].depth;

			var container = $("#assets .scroller");
			
			container.empty();
			
			for (var i = 0; i < this.markers.length; i++) {
				var m = this.markers[i];

				if (m.depth == curDepth) {
					var el = $("<div>", { class: "alert trackalert" }).attr("role", "alert");
					if (!showAllMarkers) el.addClass("hidden");

					var txt = m.type == "epub" ? "Click here to read more." : m.text;

					$("<span>", {class: "badge", text: String(m.start).toHHMMSS()}).appendTo(el);
					$("<span>", {text: " " + txt}).appendTo(el);

					switch (m.type) {
						case "code":
							el.addClass("alert-danger");
							break;
						case "sandbox":
							el.addClass("alert-info");
							break;
						case "quiz":
							el.addClass("alert-warning");
							break;
						case "files":
							el.addClass("alert-success");
							break;
						case "epub":
							el.addClass("alert-success");
							break;
					}

					el.click($.proxy(this.onClickMarker, this, i));

					container.append(el);

					if (!m.elements) m.elements = {};
					m.elements.alert = el;
				}
			}
		},
		
		addTriggersForThisVideo: function () {
			var curDepth = this.toc[this.currentIndex].depth;
			
			for (var i = 0; i < this.markers.length; i++) {
				var m = this.markers[i];
				if (m.depth == curDepth) {
					var el = m.elements ? m.elements.alert : undefined;
					this.pop.timebase( { start: m.start, end: m.end, alert: el, id: this.trackID++, text: m.text,
						callback: $.proxy(this.onClickMarker, this, i) } );
				}
			}
		},

		removeAllTriggers: function () {
			for (var i = 0; i < this.trackID; i++) {
				this.pop.removeTrackEvent(i);
			}

			this.trackID = 0;
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
                    var contents = '<iframe src="epubs/' + m.src + '/oebps/html/' + m.page + '" width="100%" height="__window height__" frameborder="0"></iframe>';

                    var wh = $(window).outerHeight();
                    contents = contents.replace("__window height__", (wh * .75));

                    BootstrapDialog.show({
                        title: "Read More…",
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
		}
			
	};
	
	return VideoManager;
	
});