/*
 * T A M M - Slider
 * This file contains the image slider
 *
 * Usage: var slider = new Slider(elem, {});
 *
 * Author
 * Markus Bergh, 2014
 */

define([
		'jquery',
		'transit',
		'./tamm__Image'
	],

    function($, transit, CoreImage) {

		/*
		 * Constructor
		 */
		var Slider = function(elem, options) {
			this.elem = elem;
			this.$elem = $(elem);
			this.options = options;
			this.currentIndex = 0;
			this.numImages = 10;

			// This next line takes advantage of HTML5 data attributes
			// to support customization of the plugin on a per-element
			// basis. For example,
			// <div class=item" data-plugin-options="{"message":"Goodbye World!"}"></div>
			this.metadata = this.$elem.data( "plugin-options" );
		};

		/*
		 * Prototype
		 */
		Slider.prototype = {
			defaults: {
				$slider: $('.app-slider'),
				$slider_action: $('.app-slider-action'),
				$slider_image: null,
				$spinner: $('.spinner-wrapper')
			},

			init: function() {
				var self = this;

				// Introduce defaults that can be extended either globally or using an object literal.
				this.config = $.extend({}, this.defaults, this.options, this.metadata);

				/**
				 * Get url and load correct image
				 */
				self.getURL();

				/**
    			 * Add event to action links
    			 */
    			self.addListener();

				return self;
			},

			getURL: function() {
				var self = this;

				var url = document.URL;
				var lastPart = url.split("/").pop();

				if(lastPart.length == 0) {
                	history.pushState({}, '', '/photos/' + (self.currentIndex + 1));
				} else {
					self.currentIndex = parseInt(lastPart, 10) - 1;
				}

				if(self.currentIndex > 0) {
                    $('.app-slider-action.prev').removeClass('hidden');
                } else {
                    $('.app-slider-action.prev').addClass('hidden');
                }

                if((self.currentIndex + 1) == self.numImages) {
                    $('.app-slider-action.next').addClass('hidden');
                } else {
                    $('.app-slider-action.next').removeClass('hidden');
                }

				self.load();

				return self;
			},

			load: function(callback, inverse) {
				var self = this;

				// Present spinner
				self.config.$spinner.removeClass('hidden');

				var image = new Image();

				// On load we present image
				image.onload = function() {
					var coreImage = new CoreImage();
					coreImage.resizeHandler();

					// Hide spinner
					self.config.$spinner.addClass('hidden');

					if(typeof callback == 'function') {
						callback.apply();
					} else {
	                	coreImage.resizeHandler(function() {
	                		self.config.$slider_image.transition({
								opacity: 1,
								scale: 1
							}, 500, 'out');
	                	});
					}

					history.pushState({}, '', '/photos/' + (self.currentIndex + 1));
				};

				// Set source
				if((self.currentIndex + 1) < 10) {
					image.src = '/static/photos/tamm_image_0' + (self.currentIndex + 1) + '.jpg';
				} else {
					image.src = '/static/photos/tamm_image_' + (self.currentIndex + 1) + '.jpg';
				}

				self.config.$slider_image = $('<div />');

				if(typeof callback != 'function') {
					self.config.$slider_image.css({
						opacity: 0,
						scale: 1.3
					});
				} else {
					self.config.$slider_image.css({
						x: inverse ? '-100%' : '100%',
						perspective: 1500,
						rotateY: inverse ? -25 : 25,
						scale: 0.5
					});
				}

				self.config.$slider.append(
					self.config.$slider_image.append(
						image
					).addClass('app-slider-image')
				);

				return self;
			},

			addListener: function() {
				var self = this;

    			self.config.$slider_action.on('click', function(e) {
    				e.preventDefault();

    				var $action = $(this);

    				if($('.slider-is-running').length <= 0) {
    					if($action.hasClass('prev')) {
							self.prev();
						} else {
							self.next();
						}

	                    if(self.currentIndex > 0) {
	                        $('.app-slider-action.prev').removeClass('hidden');
	                    } else {
	                        $('.app-slider-action.prev').addClass('hidden');
	                    }

	                    if((self.currentIndex + 1) == self.numImages) {
	                        $('.app-slider-action.next').addClass('hidden');
	                    } else {
	                        $('.app-slider-action.next').removeClass('hidden');
	                    }

	                    // Update url
	                    history.pushState({}, '', '/photos/' + (self.currentIndex + 1));
    				}
    			});

    			return self;
			},

			next: function() {
				var self = this;

				// Increase count
	            self.currentIndex++;

	            // Set class for preventing double click
	            $('html').addClass('slider-is-running');

	            // Load next image
	            self.load(function() {
	            	// Animate out current
		            var $current = self.config.$slider.find('.app-slider-image').eq(0);

		            console.log(self.config.supportsTouch);

					$current.transition({
						x: self.config.supportsTouch ? '-100%' : '0%',
						perspective: 1000,
						rotateY: self.config.supportsTouch ? 0 : 20,
						scale: self.config.supportsTouch ? 1 : 1.2
					}, 1000, 'in-out', function() {
						$current.remove();

						// Enable pagination
						$('html').removeClass('slider-is-running');
		            });

					// Animate in next
					$current.next().transition({
						x: '0',
						scale: 1,
						rotateY: 0
					}, 700, 'in-out');
	            });

	            return self;
			},

	    	prev: function() {
	    		var self = this;

	            self.currentIndex--;

	            // Set class for preventing double click
	            $('html').addClass('slider-is-running');

	            self.load(function() {
	            	var $current = self.config.$slider.find('.app-slider-image').eq(0);

	            	$current.transition({
		                x: self.config.supportsTouch ? '100%' : '0%',
						perspective: 1000,
						rotateY: self.config.supportsTouch ? 0 : -20,
						scale: self.config.supportsTouch ? 1 : 1.2
		            }, 1000, 'in-out', function() {
		                $current.remove();

		                // Enable pagination
						$('html').removeClass('slider-is-running');
		            });

		            $current.next().transition({
		                x: '0%',
		                scale: 1,
		                rotateY: 0,
		                perspective: 1000
		            }, 700, 'in-out');

	            }, true);

	            return self;
			}
		};

		/*
		 * Defaults
		 */
		Slider.defaults = Slider.prototype.defaults;

		$.fn.Slider = function(options) {
			return this.each(function() {
				new Slider(this, options).init();
			});
		};

		return Slider;
	}
);