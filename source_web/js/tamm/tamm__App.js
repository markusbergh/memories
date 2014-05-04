/*
 * App
 * This file contains the initializer for site
 *
 * Author
 * Markus Bergh
 * 2014
 */

define([
		'jquery',
        'snapsvg',
        'tamm/utils/tamm__PubSub',
        'tamm/utils/tamm__Utils',
        'tamm/modules/tamm__Image',
        'tamm/modules/tamm__Transition',
        'tamm/modules/tamm__Section',
        'tamm/modules/tamm__Slider',
		'tamm/modules/tamm__Nav',
        'tamm/tamm__Model'
	],

    function($, Snap, PubSub, CoreUtils, CoreImage, CoreTransition, CoreSection, CoreSlider, CoreNav, Model) {

        var TAMMain = function() {

        	var coreImage = null,
        		coreUtils = null,
                coreSlider = null,
                coreTransition = null,
                coreSection = null,
                coreNav = null;

        	var setResize = function() {
        		$(window).smartresize(function() {
        			self.resizeHandler();
	  			});
        	};

            var resizeHandler = function(callback) {
                var $obj = $('.app-slider'),
                    $imgs = $obj.find("img");

                $imgs.each(function(){

                  var $img = $(this);

                  var $container = $img.parent();

                  var imageAspect = 1.5;
                  var containerW = $container.width();
                      var containerH = $container.height();
                      var containerAspect = containerW/containerH;

                      if(containerAspect < imageAspect) {
                        $img.css({
                            width: 'auto',
                            height: containerH,
                            top: 0,
                            left: -(containerH*imageAspect-containerW)/2
                        });
                      } else {
                        $img.css({
                            width: containerW,
                            height: 'auto',
                            top: -(containerW/imageAspect-containerH)/2,
                            left: 0
                        });
                      }
                });

                if(typeof callback == 'function') {
                  callback();
                }
            };

            this.initialize = function() {
                var self = this;

                // Touch support check
                var supportsTouch = 'ontouchstart' in window || !!navigator.msMaxTouchPoints;
                if(supportsTouch) {
                    $('html').addClass('touch');
                }

                // Get application data
                Model.load(function() {
                    // Image slider
                    coreSlider = new CoreSlider('', {
                        supportsTouch: supportsTouch
                    }).init();

                    // Navigation
                    coreNav = new CoreNav('', {}).init();
                    coreNav.hideHeaderElements();

                    // Transition singleton
                    coreTransition = CoreTransition;

                    // Image size handling for resize event
                    setResize();
                    resizeHandler();

                    // Listen for initial image fade
                    PubSub.subscribe('/tamm/initial/image/faded', function(e) {
                        coreNav.showHeaderElements();
                    });

                    // Listen for transition
                    PubSub.subscribe('/tamm/transition/show', function(e) {
                        coreTransition.show();
                    });

                    // Listen for transition
                    PubSub.subscribe('/tamm/transition/hide', function(e) {
                        coreTransition.hide();
                    });

                    // Listen for section
                    PubSub.subscribe('/tamm/section/create', function(section) {
                        coreSection = new CoreSection('', {
                            section: section
                        }).init();
                    });

                    // Listen for section
                    PubSub.subscribe('/tamm/section/show', function(e) {
                        coreSection.show();
                    });

                    // Listen for section
                    PubSub.subscribe('/tamm/section/hide', function(e) {
                        coreSection.hide();
                    });

                    // Listen for image size handling
                    PubSub.subscribe('/tamm/image/resize', function(callback) {
                        resizeHandler(callback);
                    });

                });

                return self;
            };

        };

        return TAMMain;
	}
);