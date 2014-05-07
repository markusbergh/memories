/*
 * T A M M - Preloader
 * This file contains the preloader for images
 *
 * Usage: var preloader = new Preloader(elem, {});
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
		var Preloader = function(elem, options) {
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
		Preloader.prototype = {
			defaults: {
				$preloader: $('.preloader-wrapper'),
                $progress: $('.progress'),
                $text: $('.progress-text'),
                $target: null
			},

			init: function() {
				var self = this;

				// Introduce defaults that can be extended either globally or using an object literal.
				this.config = $.extend({}, this.defaults, this.options, this.metadata);

				PubSub.subscribe('/tamm/preloader/show', function() {
					self.show();
				});

				PubSub.subscribe('/tamm/preloader/progress', function(data) {
					self.progress(data);
				});

				PubSub.subscribe('/tamm/preloader/hide', function(imageLoaded) {
					self.hide(imageLoaded);
				});

				return self;
			},

            show: function() {
            	var self = this;

            	self.config.$preloader.removeClass('hidden');

				self.config.$progress.css({
					width: 0
				});

				return  self;
            },

            progress: function(progress) {
            	var self = this;

            	self.config.$progress.css({
                	width: progress
                }).addClass('running');

            	return self;
            },

            hide: function(imageLoaded) {
            	var self = this;

				self.config.$progress.transition({
					width: '100%'
				}, 300, function() {
					self.config.$preloader.addClass('hidden');

					self.config.$progress.css({
						width: 0
					});

					PubSub.publish('/tamm/image/loaded', [imageLoaded], self);
				}).removeClass('running');

            	return self;
            },

            destroy: function() {
            	var self = this;

            	return self;
            },
		};

		/*
		 * Defaults
		 */
		Preloader.defaults = Preloader.prototype.defaults;

		$.fn.Preloader = function(options) {
			return this.each(function() {
				new Preloader(this, options).init();
			});
		};

		return Preloader;
	}
);