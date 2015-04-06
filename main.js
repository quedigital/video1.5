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
		"video": {
			export: "videojs"
		}
	}
});

//require(["nodejs-toc", "video-manager", "video", "toc-tree", "popcorn", "popcorn.timebase", "video-overlay", "bootstrap", "coach-marks"], function (metadata, VideoManager) {
require(["nodejs-toc", "video-manager", "video", "toc-tree", "popcorn", "popcorn.timebase", "video-overlay", "bootstrap"], function (metadata, VideoManager) {

	var coachMarksShown = false;

	$(".toc").TOCTree({ data: metadata.toc });
	
	var v = $("#video .overlay").VideoOverlay();

	$('.level.tree-toggler').click(function () {
		$(this).parents("li").children('ul.tree').toggle(300);
	});
	
	$(window).resize(onResize);
		
	$(".trackalert").addClass("hidden");
	
	var video = $("video");
	video[0].addEventListener('loadeddata', function() {
		console.log("loadeddata");
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
	
	function onToggleTOC () {
		var contentsVisible = $("#contents .well").is(":visible");
        var resourcesVisible = $("#sidebar #resources").is(":visible");
        var videoSize = 12 - (contentsVisible ? 0 : 3) - (resourcesVisible ? 3 : 0);

		if (contentsVisible) {
			$("#contents").removeClass("col-xs-3").addClass("col-xs-0");
		} else {
			$("#contents").removeClass("col-xs-0").addClass("col-xs-3");
		}
        $("#video").removeClass("col-xs-6 col-xs-9").addClass("col-xs-" + videoSize);

        $("#contents .well").toggle("slide");

		onResize();
	}

    function onToggleResources () {
        var contentsVisible = $("#contents .well").is(":visible");
        var resourcesVisible = $("#sidebar #resources").is(":visible");
        var videoSize = 12 - (contentsVisible ? 3 : 0) - (resourcesVisible ? 0 : 3);

        if (resourcesVisible) {
            $("#sidebar").removeClass("col-xs-3").addClass("col-xs-0");
        } else {
            $("#sidebar").removeClass("col-xs-0").addClass("col-xs-3");
        }
        $("#video").removeClass("col-xs-6 col-xs-9").addClass("col-xs-" + videoSize);

        $("#sidebar #resources").toggle("slide", { direction: "right", done: onResize });

        //onResize();
    }

    function onPlayVideo (element, depth, src) {
	    var showAllMarkers = $(".show-all-markers").hasClass("active");

		VideoManager.playFromTOC(depth, { showAllMarkers: showAllMarkers });
	}
		
	$(".show-all-markers").click(onShowAllMarkers);
	$("#toc-toggler").click(onToggleTOC);
    $("#resource-toggler").click(onToggleResources);
	$("a[data-toggle='tab']").on("shown.bs.tab", onResize);
//	$(".sandbox").click(onShowSandbox);
	$(".toc").on("playvideo", onPlayVideo);

	$("body").tooltip();

	videojs("main_video", { "controls": true, "autoplay": false, "preload": "auto" });

	VideoManager.initialize(metadata.toc, "#video video", videojs("main_video"), metadata.markers);
	
	//VideoManager.loadFirstVideo();
	VideoManager.loadMostRecentVideo();
	
});