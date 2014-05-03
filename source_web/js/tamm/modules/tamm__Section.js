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
		'tamm/utils/tamm__PubSub',
		'tamm/modules/tamm__About',
		'tamm/modules/tamm__Archive'
	],

    function($, transit, PubSub, CoreAbout, CoreArchive) {

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
				$section_content: $('<div />'),
				$section_data: null
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

				switch(self.config.section) {
					case 'about':
						self.config.$section_data = new CoreAbout('', {
							onReady: function(data) {
								self.onSectionReady(data);
							}
						}).init();

						self.config.$section_content_wrapper.addClass('about');
						self.config.$section_content.addClass('about');
					break;
					case 'archive':
						self.config.$section_data = new CoreArchive('', {
							onReady: function(data) {
								self.onSectionReady(data);
							}
						}).init();

						self.config.$section_content_wrapper.addClass('archive');
						self.config.$section_content.addClass('archive');
					break;
				}

				self.config.$section_data.create();

				return self;
			},

			onSectionReady: function(data) {
				var self = this;

				self.config.$section_content_wrapper.append(
					self.config.$section_content.empty().append(
						data
					).addClass('section-content')
				).addClass('section-content-wrapper');

				return self;
			},

			show: function() {
				var self = this;

				self.config.$section.transition({
					opacity: 1
				}, 700);

				if(self.config.$section_data.show) {
					self.config.$section_data.show();
				}

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