/*
 * T A M M - Archive
 * This file contains grid for archive
 *
 * Usage: var archive = new Archive(elem, {});
 *
 * Author
 * Markus Bergh, 2014
 */

define([
		'jquery',
		'transit',
        'masonry',
        'tamm/utils/tamm__PubSub'
	],

    function($, transit, Masonry, PubSub) {

		/*
		 * Constructor
		 */
		var Archive = function(elem, options) {
			this.elem = elem;
			this.$elem = $(elem);
			this.options = options;

			// This next line takes advantage of HTML5 data attributes
			// to support customization of the plugin on a per-element
			// basis. For example,
			// <div class=item" data-plugin-options="{"message":"Goodbye World!"}"></div>
			this.metadata = this.$elem.data( "plugin-options" );
		};

		/*
		 * Prototype
		 */
		Archive.prototype = {
			defaults: {
                $grid: $('<div />'),
                $grid_item: null
			},

			init: function() {
				var self = this;

				// Introduce defaults that can be extended either globally or using an object literal.
				this.config = $.extend({}, this.defaults, this.options, this.metadata);

				return self;
			},

            create: function() {
                var self = this;

                self.load(function(data) {

                    var content = null;

                    for(var index in data) {
                        var item = data[index];
                        var thumbnail = item.thumbnail;

                        self.config.$grid_item = $('<div />');
                        self.config.$grid.append(
                            self.config.$grid_item.addClass('archive-item')
                        ).addClass('archive-wrapper');

                        var image = new Image();
                        image.src = thumbnail;
                        self.config.$grid_item.append(
                            image
                        );

                        self.config.$grid_item.css({
                            opacity: 0,
                            perspective: 300,
                            rotateX: 15
                        });
                    }

                    content = self.config.$grid;

                    if(self.config.onReady != null) {
                        self.config.onReady(content);
                    }

                    var msnry = new Masonry(self.config.$grid[0], {
                        itemSelector: '.archive-item'
                    });

                });
            },

            load: function(callback) {
                var self = this;

                $.getJSON('/data/memories.json', function(data) {
                    callback(data);
                });

                return self;
            },

            show: function() {
                var self = this;

                var delay = 0;

                $.each(self.config.$grid.children(), function(i, elem) {
                    console.log(elem);

                    $(elem).transition({
                        opacity: 1,
                        rotateX: 0
                    }, delay * 100);

                    delay++;
                });

                return self;
            }
		};

		/*
		 * Defaults
		 */
		Archive.defaults = Archive.prototype.defaults;

		$.fn.Archive = function(options) {
			return this.each(function() {
				new Archive(this, options).init();
			});
		};

		return Archive;
	}
);