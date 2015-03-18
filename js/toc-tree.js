define(["jquery.ui"], function () {

	$.widget("que.TOCTree", {

		options: {},

		_create: function () {
			this.element.empty();
			
			var depths = [];
			var last_depth = undefined;
			var current_ul;
			
			for (var i = 0; i < this.options.data.length; i++) {
				var d = this.options.data[i];
				
				var depth = d.depth.split(",");
				
				depth = $.map(depth, function (el, index) { return parseInt(el); });
				
				var li, linkholder;
				
				if (depth[0] != last_depth) {
					li = $("<li>");
					this.element.append(li);
					
					var lbl = $("<label>", { class: "tree-toggler nav-header" });
					li.append(lbl);
					linkholder = lbl;
					
					var ul = $("<ul>", { class: "nav nav-list tree" });				
					li.append(ul);
					
					current_ul = ul;
				} else {
					li = $("<li>");
					li.appendTo(current_ul);
					
					linkholder = li;
				}
					
				var a = $("<a href='#'>");
				var sp = $("<span>", { text: " " + d.desc });
				
				if (d.short) {
					var short = $("<span>", { class: "level tree-toggler" });
					short.html(d.short);
					a.append(short);
				}

				a.append(sp);
				
				a.appendTo(linkholder);
				
				a.click($.proxy(this.launchVideo, this, i));
					
				last_depth = depth[0];
			}
		},
		
		launchVideo: function (index) {
			this.element.trigger("playvideo", index);
		},
		
		_destroy: function () {
		},

		_setOption: function ( key, value ) {
			switch (key) {
				default:
					//this.options[ key ] = value;
					break;
			}

			this._super( "_setOption", key, value );
		}
	});
});
