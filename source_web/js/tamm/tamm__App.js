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
            	coreImage = new CoreImage();

                // Set image size
            	coreImage.resizeHandler(function() {
                    // When image has size set initialize slider
                    coreSlider = new CoreSlider();
                    coreSlider.initialize();

                    // And navigation...
                    coreNav = new CoreNav();
                    coreNav.initialize();
                });

            	/**
            	 * Resize handler for image sizes
            	 */
            	setResize();
            };

        };

        return TAMMain;
	}
);