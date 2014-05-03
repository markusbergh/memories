/*
 * T A M M - About
 * This file contains the seciton for about
 *
 * Usage: var about = new About(elem, {});
 *
 * Author
 * Markus Bergh, 2014
 */

define([
		'jquery',
		'transit',
        'tamm/utils/tamm__PubSub'
	],

    function($, transit, PubSub) {

		/*
		 * Constructor
		 */
		var About = function(elem, options) {
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
		About.prototype = {
			defaults: {

			},

			init: function() {
				var self = this;

				// Introduce defaults that can be extended either globally or using an object literal.
				this.config = $.extend({}, this.defaults, this.options, this.metadata);

				return self;
			},

            create: function() {
            	var self = this;

            	var title = $('<h2 />').text('These are my memories');
				var description = $('<p>This is where you can see what I see, and what I capture as a moment in my life. Beautiful thrilling moments. And these are my memories.</p><p>Enjoy.</p>');

				var content = title.add(description);

				if(self.config.onReady != null) {
					self.config.onReady(content);
				}

				return  self;
            }
		};

		/*
		 * Defaults
		 */
		About.defaults = About.prototype.defaults;

		$.fn.About = function(options) {
			return this.each(function() {
				new About(this, options).init();
			});
		};

		return About;
	}
);