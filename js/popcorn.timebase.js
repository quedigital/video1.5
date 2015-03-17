(function (Popcorn) {  
	Popcorn.plugin("timebase", {
		_setup : function (track) {
		},
		
		frame: function (event, track) {
			if ($(track.el).hasClass("hidden")) {
				track._natives.show(track);
			}
		},
		
		_teardown: function (track) {
		},
		
		start: function (event, track) {
		},
		
		end: function (event, track) {
			if (!$(track.el).hasClass("hidden")) {
				track._natives.hide(track);
			}
		},
		
		show: function (track) {
			var vo = $("#video .overlay").VideoOverlay("instance");
			vo.add({ id: track.id, text: track.text, callback: track.callback });

			$(track.el).css( { transform: "translateX(500px)" } );
			$(track.el).removeClass("hidden");
			setTimeout(function () {
				$(track.el).css( { transform: "translateX(0)" } );
			}, 0);
		},
		
		hide: function (track) {
			var vo = $("#video .overlay").VideoOverlay("instance");
			vo.remove(track.id);
			
			$(track.el).removeClass("hidden").css( { transform: "translateX(0)" } ).css( { transform: "translateX(500px)" } ).animate( { _dummy: 0 }, { duration: 500, done: function (anim) { $(anim.elem).addClass("hidden"); } });
		}
	});
})(Popcorn);