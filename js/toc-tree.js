define(["jquery.ui"], function () {

	// case-insensitive search (found on web)
	$.extend($.expr[":"], {
		"containsNC": function (elem, i, match, array) {
			return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
		}
	});

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

				li.attr("id", d.id).attr("data-index", i);

				var a = $("<a href='#'>");
				var sp = $("<span>", { class: "desc", html: " " + d.desc });

				switch (d.type) {
					case "quiz":
						a.addClass("quiz");
						break;
				}

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
			this.element.find("li:containsNC('" + term + "')").show(300);
			this.element.find("li:not(:containsNC('" + term + "'))").hide(300);
		},

		markStarted: function (index) {
			var el = this.element.find("[data-index=" + index + "]");
			var a = el.find("a");
			var checked = a.find("i.checked");
			checked.remove();
			a.append("<i class='checked fa fa-adjust fa-flip-horizontal fa-lg'></i>");
		},

		markCompleted: function (index) {
			var el = this.element.find("[data-index=" + index + "]");
			var a = el.find("a");
			var checked = a.find("i.checked");
			checked.remove();
			a.append("<i class='checked fa fa-check-circle fa-lg'></i>");

			a.find("span.desc").addClass("completed");
		},

		setStatus: function (items) {
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (item.completed)
					this.markCompleted(i);
				else if (item.started)
					this.markStarted(i);
			}
		}
	});
});
