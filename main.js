requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-2.1.3.min",
		"jquery.ui": "jquery-ui.min",
		"jquery.json": "jquery.json.min",
		"jquery.onscreen": "jquery.onscreen.min",
		"bootstrap": "bootstrap",
		"bootstrap-notify": "bootstrap-notify.min",
		"bootstrap-dialog": "bootstrap-dialog.min",
		"imagesloaded": "imagesloaded.pkgd.min",
		"popcorn": "popcorn-complete.min",
		"bootstrap-toolkit": "bootstrap-toolkit.min",
		"videojs": "video.dev",
		"videojs-markers": "videojs-markers"
        //"coach-marks": "/widgets/js/coach-marks"
	},
	
	shim: {
		"jquery": {
			export: "$"
		},
		"jquery.ui": {
			export: "$"
		},
		"jquery.json": {
			export: "$",
			deps: ['jquery']
		},
		"jquery.onscreen": {
			export: "$",
			deps: ['jquery']
		},
		"bootstrap": {
			export: "$",
			deps: ['jquery']
		},
		"bootstrap-notify": {
			export: "$",
			deps: ['bootstrap']
		},
		"bootstrap-dialog": {
			deps: ['bootstrap']
		},
		"popcorn": {
			export: "Popcorn"
		},
		"popcorn.timebase": {
			export: "Popcorn",
			deps: ['popcorn']
		},
		"bootstrap-toolkit": {
			export: "$",
			deps: ["jquery"]
		},
		"videojs": {
			export: "videojs",
			deps: ["jquery"]
		},
		"videojs-markers": {
			deps: ["videojs", "jquery"]
		}
	}
});

//require(["nodejs-toc", "video-manager", "video", "toc-tree", "popcorn", "popcorn.timebase", "video-overlay", "bootstrap", "coach-marks"], function (metadata, VideoManager) {
require(["video-manager", "bootstrap-dialog", "videojs", "toc-tree", "popcorn", "popcorn.timebase", "video-overlay", "bootstrap", "bootstrap-toolkit", "jquery.onscreen"], function (VideoManager, BootstrapDialog) {

	var coachMarksShown = false;
	var projectManifest;

	var v = $("#video .overlay").VideoOverlay();

	$(window).resize(onResize);
		
	$(".trackalert").addClass("hidden");
	
	var video = $("video");
	video[0].addEventListener('loadeddata', function () {
		initialize();
	}, false);

	$("#main_iframe").on("load", onIFrameLoaded);

	function onScrollContent () {
		if (!VideoManager.iFrameReady) return;

		VideoManager.markCurrentItemStarted();

		// keep the toc for the currently visible iframe section in view
		var onscreen = $("iframe:onScreen");
		if (onscreen.length) {
			var index = onscreen.last().attr("data-index");
			$(".toc li").removeClass("active");
			$(".toc li[data-index=" + index + "]").addClass("active");
			var entry = $(".toc li.active");
			var scroller = $("#contents-pane .scroller");
			var t = scroller.scrollTop();
			var h = scroller.height();
			var p = entry.offset().top;
			var desired_top = (h * .5);// - entry.height();
			var adj = p - desired_top;
			var dest = (t + adj);
			var currTarget = scroller.attr("data-scrolltarget");
			var diff = (currTarget - dest);
			if (currTarget == undefined || Math.abs(diff) > 20) {
				scroller.attr("data-scrolltarget", dest);
				scroller.stop().animate({ scrollTop: dest }, 1000);
			}
		}

		// check for auto-advance
		var h_container = $("#video").scrollTop() + $("#video").height();
		var h_scroller = $("#video .text-holder").height();

		if (h_container > h_scroller - 50) {
			var obj = VideoManager.getNextSection();

			var iframe = $('<iframe id="next_iframe" frameborder="0"></iframe>');
			iframe.attr( { "src": obj.src, "data-index": obj.index });
			$(".text-holder").append(iframe);

			VideoManager.iFrameReady = false;

			iframe.on("load", onIFrameLoaded);

			VideoManager.onPageScrolledToEnd();
		}
	}

	function onIFrameLoaded (event) {
		initialize();

		var path = getAbsolutePath();

		var iframe = $(event.target);

		// add our own stylesheet for additional styles
		var $head = iframe.contents().find("head");
		$head.append($("<link/>",
			{ rel: "stylesheet", href: path + "/css/main.css", type: "text/css" }));

		var obj = VideoManager.getNextSection();

		function URLWithoutPage (url) {
			var n = url.lastIndexOf("/");
			if (n != -1) return url.substr(0, n);
			else return url;
		}

		if (obj) {
			// find image links within figures

			var figs = iframe.contents().find("figure a img");
			figs.each(function (index, item) {
				var captionTitle = $(item).parents("figure").find(".caption-title");
				var title = "Image";
				if (captionTitle.length) {
					title = captionTitle.text();
				}

				var a = $(item).parent("a");
				var fullpath = iframe[0].contentWindow.location.href;
				var path = URLWithoutPage(fullpath);

				a.click(function (event) {
					event.preventDefault();

					var contents = '<iframe src="' + path + "/" + a.attr("href") + '" width="100%" height="__window height__" frameborder="0"></frame>';

					var wh = $(window).outerHeight();
					contents = contents.replace("__window height__", (wh * .75));

					BootstrapDialog.show({
						title: title,
						message: contents,
						size: BootstrapDialog.SIZE_WIDE
					});
				});
			});

			// add a next button
			/*
			var a = $('<a href="" class="button button-a"><h4>Next Up </h4>' + obj.title + '</a>');
			a.click(function (event) {
				event.preventDefault();
				onPlayVideo(a, obj.index);
			});

			iframe.contents().find("body").append(a);
			*/

			var h = iframe.contents().find("html").outerHeight();

			// turn off scrolling on the iframe's content
			iframe.contents().find("html").css("overflow", "hidden");

			iframe.height(h);

			// kludge to get the scroll thumb to show up again on Mac Chrome
			/*
			$("#video").css("overflow", "visible");
			setTimeout(function () {
				$("#video").css("overflow", "scroll");
			}, 0);
			*/
		}

		VideoManager.iFrameReady = true;
	}

	function getAbsolutePath () {
		var loc = window.location;
		var pathName = loc.pathname.substring(0, loc.pathname.lastIndexOf('/'));
		return loc.origin + pathName;
	}

	function initialize () {
		onResize();
		
		// NOTE: started using opacity too since the tab panels were overriding "invisible"
		$("#main").removeClass("invisible").css("opacity", 1);

		/*
		if (!coachMarksShown) {
			$("#coach-marks").CoachMarks().CoachMarks("instance").open();
			coachMarksShown = true;
		}
		*/
	}
	
	function onResize () {
		var wh = $(window).outerHeight();

		$("#contents").outerHeight(wh - 50);
		$("#video").outerHeight(wh - 50);
		$("#sidebar").outerHeight(wh - 50);

		// kludge to subtract main menu bar and course progress
		$("#contents .scroller").height(wh - 50 - 50);

		$("#main_video").css("max-height", wh - 50);
	}
	
	function onShowAllMarkers () {
		$(".trackalert").toggleClass("show-all");

		if ($(".trackalert").hasClass("hidden")) {
			$(".trackalert").css( { transform: "translateX(0)" } ).removeClass("hidden");
		} else {
			$(".trackalert").css( { transform: "translateX(0)" } ).addClass("hidden");
		}
	}

	function resizePanes (contentsVisible, resourcesVisible) {
		var md = ResponsiveBootstrapToolkit.is(">=md");

		// xs = 3, 6, 3
		// md = 3, 7, 2

		var contentsSize = 3, resourcesSize = md ? 2 : 3;

		var videoSize = 12 - (contentsVisible ? contentsSize : 0) - (resourcesVisible ? resourcesSize : 0);

		if (contentsVisible) {
			$("#contents").removeClass("col-xs-0").addClass("col-xs-" + contentsSize);
		} else {
			$("#contents").removeClass("col-xs-3").addClass("col-xs-0");
		}

		if (resourcesVisible) {
			$("#sidebar").removeClass("col-xs-0").addClass("col-xs-" + resourcesSize);
		} else {
			$("#sidebar").removeClass("col-xs-3 col-xs-2").addClass("col-xs-0");
		}

		$("#video").removeClass("col-xs-6 col-xs-7 col-xs-8 col-xs-9 col-xs-11 col-xs-12").addClass("col-xs-" + videoSize);
	}
	
	function onToggleTOC () {
		var contentsVisible =$("#contents .scroller").is(":visible");
		var resourcesVisible = $("#sidebar").is(":visible");

		resizePanes(!contentsVisible, resourcesVisible);

        $("#contents .scroller").toggle("slide");
		$("#toc-toggler").toggleClass("open");

		onResize();
	}

    function onToggleResources () {
	    var contentsVisible =$("#contents .scroller").is(":visible");
	    var resourcesVisible = $("#sidebar").is(":visible");

	    resizePanes(contentsVisible, !resourcesVisible);

        $("#sidebar").toggle("slide", { direction: "right", done: onResize });
	    $("#resource-toggler").toggleClass("open");

        //onResize();
    }

    function onPlayVideo (element, depth) {
	    var showAllMarkers = $(".show-all-markers").hasClass("active");

		VideoManager.playFromTOC(depth, { showAllMarkers: showAllMarkers });
	}

	function onClickMarker (element, depth) {
		console.log("here we are");
		console.log(element);
		console.log(depth);
	}

	function expandOrCollapse () {
		var vis = $(".toc > li > ul").is(":visible");

		if (vis) {
			$("#collapse-button i").removeClass("fa-caret-up").addClass("fa-caret-down");
			$(".toc > li > ul").hide(300);
		} else {
			$("#collapse-button i").removeClass("fa-caret-down").addClass("fa-caret-up");
			//$(".toc > li > ul").show(300);
			// expand all
			$(".toc li ul").show(300);
		}
	}

	function onSearch () {
		var term = $("#query").val();
		$(".toc").TOCTree("search", term);
	}

	function onClearSearch () {
		$("#query").val("");
		$(".toc").TOCTree("search", "");
	}

	function convertHabitatTOCtoMetadata (data) {
		var links = $(data).find("a");

		var metadata = links.map(function (index, item) {
			var a = $(item);
			return {
				desc: a.text(),
				src: projectManifest.folder + "/" + a.attr("href")
			};
		});

		return metadata;
	}

	function onLoadedTOC (metadata) {
		$(".toc").TOCTree({ data: metadata.toc });

		$(".resource-list").TOCTree();

		VideoManager.initialize(metadata.toc, "#video video", videojs("main_video"), metadata.markers);

		//VideoManager.loadFirstVideo();
		VideoManager.loadMostRecentVideo();
	}

	function onHabitatTOCLoaded (data) {
		$(".toc").TOCTree({ type: "habitat", data: data });

		var metadata = convertHabitatTOCtoMetadata(data);

		VideoManager.initialize(metadata, "#video video", videojs("main_video"), []);

		initialize();

		VideoManager.loadMostRecentVideo();
	}

	function loadContentPerManifest () {
		switch (projectManifest.type) {
			case "metadata":
				require([projectManifest.folder + "/nodejs-toc.js"], onLoadedTOC);
				break;
			case "habitat":
				$.get(projectManifest.folder + "/toc.xhtml", onHabitatTOCLoaded);
				break;
		}
	}

	function loadManifest () {
		require(["manifest.js"], function (manifest) {
			setManifest(manifest);
		});
	}

	function setManifest (manifest) {
		projectManifest = manifest;

		loadContentPerManifest();
	}

	$("#video").scroll(onScrollContent);

	$(".show-all-markers").click(onShowAllMarkers);
	$("#toc-toggler").click(onToggleTOC);
    $("#resource-toggler").click(onToggleResources);
	$("a[data-toggle='tab']").on("shown.bs.tab", onResize);
	$(".toc").on("playvideo", onPlayVideo);
	$(".resource-list").on("playvideo", onClickMarker);
	$("#collapse-button").click(expandOrCollapse);
	$(".search-button").click(onSearch);
	$("#query").on("input", onSearch);
	$("#clear-search-button").click(onClearSearch);
	$("#account-button").click(function () { window.open("//memberservices.informit.com/my_account/index.aspx"); });

	$("body").tooltip();

	videojs("main_video", { "controls": true, "autoplay": false, "preload": "auto" });

	resizePanes(true, false);

	loadManifest();
});