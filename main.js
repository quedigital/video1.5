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
	},
	
	shim: {
		"jquery": {
			export: "$",
		},
		"jquery.ui": {
			export: "$",
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
			export: "Popcorn",
		},
		"popcorn.timebase": {
			export: "Popcorn",
			deps: ['popcorn']
		},
		"popcorn.toc": {
			export: "Popcorn",
			deps: ['popcorn']
		},
		"video": {
			export: "videojs"
		}
	},
});

require(["nodejs-toc", "bootstrap-dialog", "video", "toc-tree", "popcorn", "popcorn.timebase", "popcorn.toc", "video-overlay", "bootstrap", "bootstrap-notify"], function (toc, BootstrapDialog) {
	$(".toc").TOCTree({ data: toc });
	
	var v = $("#video .overlay").VideoOverlay();

	$('.level.tree-toggler').click(function () {
		$(this).parents("li").children('ul.tree').toggle(300);
	});
	
	$(window).resize(onResize);
		
	var pop = Popcorn("#video video", { frameAnimation: true });
	pop.timebase( { start: 5, end: 15, el: ".alert1", id: "code1", text: "Click here for the code" } );
	pop.timebase( { start: 8, end: 12, el: ".alert1a", id: "sandbox1", text: "Click here to try it out", callback: onShowSandbox } );
	pop.timebase( { start: 12, end: 15, el: ".alert1b", id: "sandbox2", text: "Click here to try out this code too", callback: onShowSandbox } );
	pop.timebase( { start: 20, end: 25, el: ".alert2", id: "quiz1", text: "Click here for self-check" } );
	pop.timebase( { start: 22, end: 27, el: ".alert3", id: "project1", text: "Click here for project files" } );
	pop.timebase( { start: 23, end: 30, el: ".alert4", id: "read1", text: "Click here to read more" } );

	pop.toc( { start: 1, end: 3, index: 0 } );
	pop.toc( { start: 3, end: 8, index: 1 } );
	pop.toc( { start: 8, end: 11, index: 2 } );
	pop.toc( { start: 11, end: 12, index: 3 } );
	pop.toc( { start: 12, end: 15, index: 4 } );
	pop.toc( { start: 15, end: 19, index: 5 } );
	pop.toc( { start: 19, end: 23, index: 6 } );
	pop.toc( { start: 23, end: 30, index: 7 } );
	
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
	}
	
	function onResize () {
		var wh = $(window).outerHeight();
		var vh = $("#video").outerHeight();
		
		$("#contents").outerHeight(wh - 50);
		$("#sidebar").outerHeight(wh - 50);
		
		$.each($("#sidebar .scroller"), function (index, el) {
			var t = $(el).offset().top;
			// NOTE: this isn't sizing quite right:
			$(el).outerHeight(wh - t - 5);
		});
		
		$("#video video").css("max-height", wh - 50);
	}
	
	function onClipboard (event) {
		event.stopPropagation();
		
		$.notify({
			// options
			message: 'Code copied to clipboard.',
		},{
			// settings
			type: 'info',
			allow_dismiss: false,
			delay: 3000,
			animate: {
				enter: 'animated fadeInDown',
				exit: 'animated fadeOutUp'
			},			
		});		
	}

	function onDownload (event) {
		event.stopPropagation();
		
		$.notify({
			// options
			message: 'Downloaded.',
		},{
			// settings
			type: 'success',
			allow_dismiss: false,
			delay: 3000,
			animate: {
				enter: 'animated fadeInDown',
				exit: 'animated fadeOutUp'
			},			
		});		
	}
	
	function onShowAllMarkers () {
		if ($(".trackalert").hasClass("hidden")) {
			$(".trackalert").css( { transform: "translateX(0)" } ).removeClass("hidden");
		} else {
			$(".trackalert").css( { transform: "translateX(0)" } ).addClass("hidden");
		}
	}
	
	function onToggleTOC () {
		var vis = $("#contents .well").is(":visible");

		if (vis) {
			$("#contents").removeClass("col-xs-3").addClass("col-xs-0");
			$("#video").removeClass("col-xs-6").addClass("col-xs-9");
		} else {
			$("#contents").removeClass("col-xs-0").addClass("col-xs-3");
			$("#video").removeClass("col-xs-9").addClass("col-xs-6");
		}
		
		$("#contents .well").toggle("slide");
	}
	
	function onShowSandbox (event) {
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
	}
	
	function getFirstVideoFromTOC () {
		for (var i = 0; i < toc.length; i++) {
			var d = toc[i];
			if (d.video) {
				return "video/" + d.video;
			}
		}
		
		return undefined;
	}
	
	function playFirstVideo () {
		var src = getFirstVideoFromTOC();
		
		var player = videojs("main_video");
		
		player.src({ type: "video/mp4", src: src });
	}
	
	function onPlayVideo (element, src) {
		var player = videojs("main_video");
		
		player.src({ type: "video/mp4", src: src });
		player.play();
	}
		
	$(".btn-clipboard").click(onClipboard);
	$(".btn-download").click(onDownload);
	$(".show-all-markers").click(onShowAllMarkers);
	$("#toc-toggler").click(onToggleTOC);
	$("a[data-toggle='tab']").on("shown.bs.tab", onResize);
	$(".sandbox").click(onShowSandbox);
	$(".toc").on("playvideo", onPlayVideo);

	videojs("main_video", { "controls": true, "autoplay": false, "preload": "auto" });
	
	playFirstVideo();
});