requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-2.1.3.min",
		"jquery.ui": "jquery-ui.min",
		"bootstrap": "bootstrap",
		"bootstrap-notify": "bootstrap-notify.min",
		"bootstrap-dialog": "bootstrap-dialog.min",
		"imagesloaded": "imagesloaded.pkgd.min",
		"popcorn": "popcorn-complete.min",
		"bootstrap-toolkit": "bootstrap-toolkit.min",
		"video": "video.dev"
        //"coach-marks": "/widgets/js/coach-marks"
	},
	
	shim: {
		"jquery": {
			export: "$"
		},
		"jquery.ui": {
			export: "$"
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
		"video": {
			export: "videojs"
		}
	}
});

//require(["nodejs-toc", "video-manager", "video", "toc-tree", "popcorn", "popcorn.timebase", "video-overlay", "bootstrap", "coach-marks"], function (metadata, VideoManager) {
require(["nodejs-toc", "video-manager", "video", "toc-tree", "popcorn", "popcorn.timebase", "video-overlay", "bootstrap", "bootstrap-toolkit"], function (metadata, VideoManager) {

	var coachMarksShown = false;

	$(".toc").TOCTree({ data: metadata.toc });

	$(".resource-list").TOCTree();//{ data: metadata.temp_markers });
	
	var v = $("#video .overlay").VideoOverlay();

	$('.level.tree-toggler').click(function () {
		$(this).parents("li").children('ul.tree').toggle(300);
	});
	
	$(window).resize(onResize);
		
	$(".trackalert").addClass("hidden");
	
	var video = $("video");
	video[0].addEventListener('loadeddata', function () {
		initialize();
	}, false);

	var iframe = $("#main_iframe");
	iframe[0].addEventListener('load', function () {
		initialize();
	}, false);

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
		var vh = $("#video").outerHeight();
		
		$("#contents").outerHeight(wh - 50);
		$("#video").outerHeight(wh - 50);
		$("#sidebar").outerHeight(wh - 50);

        $.each($("#sidebar .scroller"), function (index, el) {
            var t = $(el).offset().top;
            // NOTE: this isn't sizing quite right:
            $(el).outerHeight(wh - t - 5);
        });

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
		var md = ResponsiveBootstrapToolkit.is(">=md")

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

		onResize();
	}

    function onToggleResources () {
	    var contentsVisible =$("#contents .scroller").is(":visible");
	    var resourcesVisible = $("#sidebar").is(":visible");

	    resizePanes(contentsVisible, !resourcesVisible);

        $("#sidebar").toggle("slide", { direction: "right", done: onResize });

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
			$(".toc > li > ul").show(300);
		}
	}

	function onSearch () {
		var term = $("#query").val();
		$(".toc").TOCTree("search", term);
	}
		
	$(".show-all-markers").click(onShowAllMarkers);
	$("#toc-toggler").click(onToggleTOC);
    $("#resource-toggler").click(onToggleResources);
	$("a[data-toggle='tab']").on("shown.bs.tab", onResize);
	$(".toc").on("playvideo", onPlayVideo);
	$(".resource-list").on("playvideo", onClickMarker);
	$("#collapse-button").click(expandOrCollapse);
	$(".search-button").click(onSearch);

	$("body").tooltip();

	videojs("main_video", { "controls": true, "autoplay": false, "preload": "auto" });

	VideoManager.initialize(metadata.toc, "#video video", videojs("main_video"), metadata.markers);
	
	//VideoManager.loadFirstVideo();
	VideoManager.loadMostRecentVideo();

	resizePanes(true, false);
});