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
		'tamm/tamm__Model',
		'tamm/utils/tamm__PubSub',
		'tamm/modules/tamm__Image'
	],

    function($, transit, Model, PubSub, CoreImage) {

		/*
		 * Constructor
		 */
		var Slider = function(elem, options) {
			this.elem = elem;
			this.$elem = $(elem);
			this.options = options;
			this.currentIndex = 0;
			this.numImages = 10;
			this.coreImage = new CoreImage();
			this.onImageLoaded = null;
			this.isLoadedFromArchive = false;

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
				$slider_image_wrapper: $('.app-slider-image-wrapper'),
				$slider_action: $('.app-slider-action'),
				$slider_action_next: $('.app-slider-action.next'),
				$slider_action_prev: $('.app-slider-action.prev'),
				$slider_image: null,
				$slider_image_current: null,
				$preloader: $('.preloader-wrapper'),
                $progress: $('.progress'),
                $preloader_text: $('.preloader-text')
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

    			/**
    			 * Keyboard event
    			 */
    			self.addKeyboard();

    			PubSub.subscribe('/tamm/archive/image/load', function(index) {
    				self.isLoadedFromArchive = true;

    				self.currentIndex = parseInt(index, 10);
    				self.load();
    			});

				return self;
			},

			getURL: function() {
				var self = this;

				// Get photo index from url
				var url = document.URL;
				var lastPart = url.split("/").pop();

				// If index wasn't found we set a default one
				if(lastPart.length == 0) {
					history.pushState({}, '', '/photos/' + (self.currentIndex + 1));
				} else {
					// Otherwise set index from url
					self.currentIndex = parseInt(lastPart, 10) - 1;
				}

                // Load image
				self.load();

				return self;
			},

			load: function(callback, inverse) {
				var self = this;

				if(this.onImageLoaded) {
					PubSub.unsubscribe(this.onImageLoaded);
				}

				this.onImageLoaded = PubSub.subscribe('/tamm/image/loaded', function(image) {

					// Create image container
					self.config.$slider_image = $('<div />');

					if(typeof callback != 'function') {
						if(self.isLoadedFromArchive) {
							self.isLoadedFromArchive = false;

							self.config.$slider_image_current = $('.app-slider-image');
							self.config.$slider_image_current.remove();

							PubSub.publish('/tamm/archive/hide');
						}

						// Style for initial image
						self.config.$slider_image.css({
							opacity: 0,
							scale: 1.3
						});

						// Animate out preloader
						self.config.$preloader.css({ height: 0 });
						self.config.$preloader.transition({
							opacity: 0
						}, 600, function() {
							self.config.$preloader.removeAttr('style');
							self.config.$preloader.addClass('top');
							self.config.$progress.addClass('top');
						});

						// Set class
						$('html').addClass('loaded-and-ready');

					} else {
						self.config.$slider_image_current = $('.app-slider-image');
						if(self.config.$slider_image_current.length > 0) {

						}

						// Style for paginating images
						self.config.$slider_image.css({
							x: inverse ? '-100%' : '100%',
							perspective: 1500,
							rotateY: inverse ? -25 : 25,
							scale: 0.5
						});
					}

					// Add image to slider
					self.config.$slider.append(
						self.config.$slider_image_wrapper.append(
							self.config.$slider_image.append(
								image
							).addClass('app-slider-image')
						)
					);

					self.coreImage.resizeHandler();

					// If call was passed, use it
					if(typeof callback == 'function') {
						callback.apply();
					} else {
						// Otherwise just do some size handling and fade in
	                	self.coreImage.resizeHandler(function() {
	                		self.config.$slider_image.transition({
								opacity: 1,
								scale: 1
							}, 500, 'out', function() {

								// Dispatch event
								PubSub.publish('/tamm/initial/image/faded');

								// Set pagination
								self.setPagination();
							});
	                	});
					}
				});

				if(typeof callback == 'function') {
					self.config.$preloader.removeAttr('style');
					self.config.$progress.removeAttr('style');
				} else {
					if(!self.isLoadedFromArchive) {
						self.config.$preloader.css({
							top: 0,
							bottom: 'auto',
							height: '100%'
						});

						self.config.$progress.css({
							top: 0,
							bottom: 'auto',
							height: '100%'
						});

						self.config.$preloader_text.css({
							opacity: 0
						}).transition({
							opacity: 1
						}, 500);
					}
				}

				var images = Model.get();
				this.coreImage.load(
					images[self.currentIndex].image
				);

				return self;
			},

			setPagination: function() {
				var self = this;

				// Some logic with previous button
				if(self.currentIndex > 0) {
                    self.config.$slider_action_prev.removeClass('hidden');
                } else {
                    self.config.$slider_action_prev.addClass('hidden');
                }

                // Some logic with next button
                if((self.currentIndex + 1) == self.numImages) {
                    self.config.$slider_action_next.addClass('hidden');
                } else {
                    self.config.$slider_action_next.removeClass('hidden');
                }

                // Update url to current image index
                history.pushState({}, '', '/photos/' + (self.currentIndex + 1));

				return self;
			},

			addListener: function() {
				var self = this;

    			self.config.$slider_action.on('click', function(e) {
    				e.preventDefault();

    				var $action = $(this);

    				// If slider is not running
    				if($('.slider-is-running').length <= 0) {
    					// Check which navigation was clicked
    					if($action.hasClass('prev')) {
    						if(self.currentIndex > 0) {
								self.prev();
							}
						} else {
							if((self.currentIndex + 1) < self.numImages) {
								self.next();
							}
						}

						// Set pagination
						self.setPagination();
    				}
    			});

    			return self;
			},

			addKeyboard: function() {
				var self = this;

				$('body').keydown(function(e) {
					if($('.slider-is-running').length <= 0) {

						if(e.keyCode == 37) {
							self.prev();
						} else if(e.keyCode == 39) {
							self.next();
						}

						self.setPagination();
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

	            // Load next image with callback
	            self.load(function() {

	            	// Animate out current image
		            var $current = self.config.$slider.find('.app-slider-image').eq(0);

		            // Animation is different for touch devices
					$current.transition({
						x: self.config.supportsTouch ? '-100%' : '0',
						perspective: 1000,
						rotateY: self.config.supportsTouch ? 0 : 35,
						scale: self.config.supportsTouch ? 1 : 0.5
					}, 1000, 'in-out', function() {
						// When done, remove image
						$current.remove();

						// Enable pagination
						$('html').removeClass('slider-is-running');
		            });

					// Animate in next image
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

	            // Load image with callback
	            self.load(function() {

	            	// Animate out current image
	            	var $current = self.config.$slider.find('.app-slider-image').eq(0);

					// Animation is different for touch devices
	            	$current.transition({
		                x: self.config.supportsTouch ? '100%' : '0%',
		                perspective: 1000,
						rotateY: self.config.supportsTouch ? 0 : -35,
						scale: self.config.supportsTouch ? 1 : 0.5
		            }, 1000, 'in-out', function() {
		                $current.remove();

		                // Enable pagination
						$('html').removeClass('slider-is-running');
		            });

	            	// Animate in next image
		            $current.next().transition({
		                x: '0%',
		                scale: 1,
		                rotateY: 0,
		                perspective: 1000
		            }, 700, 'in-out');

	            }, true); // Inverted pagination

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