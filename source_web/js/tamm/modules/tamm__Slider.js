/*
 * Slider
 * This file contains the image slider for site
 *
 * Author
 * Markus Bergh
 * 2014
 */

define([
		'jquery',
		'transit'
	],

    function($) {

    	var TAMMSlider = function() {

            var currentIndex = 0;

    		this.defaults = {
    			slider: $('.app-slider'),
    			slider_images: $('.app-slider-image'),
                slider_action: $('.app-slider-action')
    		};

    		this.next = function() {
    			var $current = this.defaults.slider.find('.current');

    			$current.removeClass('current').transition({
    				x: '-100%'
    			}, 1000, 'in-out', function() {
                    $(this).removeClass('current');
                });

    			$current.next().addClass('current').transition({
    				x: '0'
    			}, 700, 'in-out');

                currentIndex++;
    		};

    		this.prev = function() {
                var $current = this.defaults.slider.find('.current');

                $current.removeClass('current').transition({
                    x: '100%'
                }, 1000, 'in-out', function() {
                    $(this).removeClass('current');
                });

                $current.prev().addClass('current').transition({
                    x: '0'
                }, 700, 'in-out');

                currentIndex--;
    		};


    		this.initialize = function() {
    			var self = this;

    			/**
    			 * Fade in first image
    			 */
    			var $current = this.defaults.slider.find('.current');
    			$current.css({
    				scale: 1.4,
    				opacity: 1
    			});

    			$current.transition({
    				scale: 1,
    				opacity: 1
    			}, 500, 'out');

    			/**
    			 * Add event to action links
    			 */
    			$('.app-slider-action').on('click', function(e) {
    				e.preventDefault();

    				var $action = $(this);

					if($action.hasClass('prev')) {
						self.prev();
					} else {
						self.next();
					}

                    if(currentIndex > 0) {
                        $('.app-slider-action.prev').removeClass('hidden');
                    } else {
                        $('.app-slider-action.prev').addClass('hidden');
                    }

                    if(currentIndex == self.defaults.slider_images.length - 1) {
                        $('.app-slider-action.next').addClass('hidden');
                    } else {
                        $('.app-slider-action.next').removeClass('hidden');
                    }
    			});
    		};

    	};

    	return TAMMSlider;

    }
);