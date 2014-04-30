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
		'tamm/utils/tamm__Utils',
        'tamm/modules/tamm__Image',
        'tamm/modules/tamm__Slider',
		'tamm/modules/tamm__Nav'
	],

    function($, CoreUtils, CoreImage, CoreSlider, CoreNav) {

        var TAMMain = function() {

        	var coreImage = null,
        		coreUtils = null,
                coreSlider = null,
                coreNav = null;

        	var setResize = function() {
        		$(window).smartresize(function() {
        			coreImage.resizeHandler();
	  			});
        	};

            this.initialize = function() {
                var supportsTouch = 'ontouchstart' in window || !!navigator.msMaxTouchPoints;

            	coreImage = new CoreImage();
                coreImage.resizeHandler();

                coreSlider = new CoreSlider('', {
                    supportsTouch: supportsTouch
                });

                // Initialize
                coreSlider.init();

                coreNav = new CoreNav();
                coreNav.initialize();

            	/**
            	 * Resize handler for image sizes
            	 */
            	setResize();
            };

        };

        return TAMMain;
	}
);