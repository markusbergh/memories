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
		'tamm/modules/tamm__Nav'
	],

    function($, Snap, PubSub, CoreUtils, CoreImage, CoreTransition, CoreSection, CoreSlider, CoreNav) {

        var TAMMain = function() {

        	var coreImage = null,
        		coreUtils = null,
                coreSlider = null,
                coreTransition = null,
                coreSection = null,
                coreNav = null;

        	var setResize = function() {
        		$(window).smartresize(function() {
        			coreImage.resizeHandler();
	  			});
        	};

            this.initialize = function() {

                // Touch support check
                var supportsTouch = 'ontouchstart' in window || !!navigator.msMaxTouchPoints;

                // Image size handling
            	coreImage = new CoreImage();
                coreImage.resizeHandler();

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

                // Listen for initial image fade
                PubSub.subscribe('/tamm/initial/image/faded', function(e) {
                    coreNav.showHeaderElements();
                });

                // Listen for transition
                PubSub.subscribe('/tamm/transition/show', function(e) {
                    coreTransition.show();
                });

                PubSub.subscribe('/tamm/transition/hide', function(e) {
                    coreTransition.hide();
                });

                PubSub.subscribe('/tamm/section/create', function(e) {
                    coreSection = new CoreSection('', {
                        section: e
                    }).init();
                });

                PubSub.subscribe('/tamm/section/show', function(e) {
                    coreSection.show();
                });

                PubSub.subscribe('/tamm/section/hide', function(e) {
                    coreSection.hide();
                });
            };

        };

        return TAMMain;
	}
);