define(["jquery.ui"], function () {

	$.widget("que.TOCTree", {

		options: {},

		_create: function () {
			this.refresh();
		},

		refresh: function () {
			if (!this.options || !this.options.data) return;

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

				li.attr("id", d.id);

				var a = $("<a href='#'>");
				var sp = $("<span>", { html: " " + d.desc });

				if (d.short) {
					var short = $("<span>", { class: "level tree-toggler" });

					// kludge for quiz coloring
					if (d.short.indexOf("question") != -1) {
						short.addClass("quiz-background");
					}

					short.html(d.short);

					a.append(short);

					if (d.timestamp) {
						var time = $("<span>", { class: "timestamp", text: d.timestamp });
						a.append(time);
					}
				}

				a.append(sp);

				a.appendTo(linkholder);

				if (d.callback)
					a.click(d.callback);
				else
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
				case "data":
					this.options["data"] = value;
					this.refresh();
				default:
					//this.options[ key ] = value;
					break;
			}

			this._super( "_setOption", key, value );
		},

		search: function (term) {
			this.element.find("li:contains('" + term + "')").show(300);
			this.element.find("li:not(:contains('" + term + "'))").hide(300);
		}
	});
});
