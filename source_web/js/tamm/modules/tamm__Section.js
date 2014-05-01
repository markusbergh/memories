/*
 * T A M M - Section
 * This file contains the section container for subpages
 *
 * Usage: var section = new Section(elem, {});
 *
 * Author
 * Markus Bergh, 2014
 */

define([
		'jquery',
		'transit',
		'../utils/tamm__PubSub'
	],

    function($, transit, PubSub) {

		/*
		 * Constructor
		 */
		var Section = function(elem, options) {
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
		Section.prototype = {
			defaults: {
				$app: $('main'),
				$section: $('<div />'),
				$section_content_wrapper: $('<div />'),
				$section_content: $('<div />')
			},

			init: function() {
				var self = this;

				// Introduce defaults that can be extended either globally or using an object literal.
				this.config = $.extend({}, this.defaults, this.options, this.metadata);

				self.create();

				return self;
			},

			create: function() {
				var self = this;

				self.config.$app.append(
					self.config.$section.append(
						self.config.$section_content_wrapper
					).addClass('section').css({
						opacity: 0,
						'z-index': window.Z_INDEX_SECTION
					})
				);

				// Add some dummy content
				var title = $('<h2 />');
				var description = $('<p>This is where you can see what I see, and what I capture as a moment in my life. Beautiful thrilling moments. And these are my memories.</p><p>Enjoy.</p>');

				self.config.$section_content_wrapper.append(
					self.config.$section_content.empty().append(
						title.text('These are my memories'),
						description
					).addClass('section-content')
				).addClass('section-content-wrapper');

				return self;
			},

			show: function() {
				var self = this;

				self.config.$section.transition({
					opacity: 1
				}, 700);

				return self;
			},

			hide: function() {
				var self = this;

				self.config.$section.transition({
					opacity: 0
				}, 700, function() {
					PubSub.publish('/tamm/transition/hide');
					self.destroy();
				});

				return self;
			},

			destroy: function() {
				var self = this;

				self.config.$section.remove();

				return self;
			}
		};

		/*
		 * Defaults
		 */
		Section.defaults = Section.prototype.defaults;

		$.fn.Section = function(options) {
			return this.each(function() {
				new Section(this, options).init();
			});
		};

		return Section;
	}
);