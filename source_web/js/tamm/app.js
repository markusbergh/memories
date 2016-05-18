/**
 * App
 * This file contains the initializer for application
 *
 * Author
 * Markus Bergh, 2016
 */

import $ from 'jquery';

import PubSub from 'tamm/utils/pubsub';
import Transition from 'tamm/modules/transition';
import Section from 'tamm/modules/section';
import Slider from 'tamm/modules/slider';
import Nav from 'tamm/modules/nav';
import Model from 'tamm/model';

import 'tamm/utils/utils';

let App = function() {
    let slider = null,
        transition = null,
        section = null,
        navigation = null,
        support_touch = false;

    function setResize() {
        $(window).smartresize(function() {
            resizeHandler();
        });
    }

    function resizeHandler(callback) {
        let $slider = $('.app-slider'),
            $slider_images = $slider.find('img');

        $slider_images.each(function() {
            let $image = $(this),
                $container = $image.parent(),
                imageAspect = 1.5,
                containerW = $container.width(),
                containerH = $container.height(),
                containerAspect = containerW / containerH;

            if(containerAspect < imageAspect) {
                $image.css({
                    width: 'auto',
                    height: containerH,
                    top: 0,
                    left: -(containerH*imageAspect-containerW) / 2
                });
            } else {
                $image.css({
                    width: containerW,
                    height: 'auto',
                    top: -(containerW/imageAspect-containerH) / 2,
                    left: 0
                });
            }
        });

        if(typeof callback === 'function') {
            callback();
        }
    }

    function orientationChanged() {
        switch(window.orientation) {
            case -90:
            case 90:
                window.scrollTo(0, 0);
                break;
            default:
                break;
        }
    }

    function addEvents() {
        // Custom events for application
        addCustomEvents();

        // Orientation
        window.addEventListener('orientationchange', orientationChanged);

        // Image size handling for resize event
        setResize();
    }

    function addCustomEvents() {
        // Listen for initial image fade
        PubSub.subscribe('/tamm/initial/image/faded', function() {
            navigation.showHeaderElements();
        });

        // Listen for transition show
        PubSub.subscribe('/tamm/transition/show', function() {
            transition.show();
        });

        // Listen for transition hide
        PubSub.subscribe('/tamm/transition/hide', function() {
            transition.hide();
        });

        // Listen for section create
        PubSub.subscribe('/tamm/section/create', function(s) {
            section = new Section({ section: s });
        });

        // Listen for section show
        PubSub.subscribe('/tamm/section/show', function() {
            section.show();
        });

        // Listen for section hide
        PubSub.subscribe('/tamm/section/hide', function() {
            section.hide();
        });

        // Listen for image size handling
        PubSub.subscribe('/tamm/image/resize', function(callback) {
            resizeHandler(callback);
        });
    }

    function createSlider() {
        slider = new Slider('', {
            supportsTouch: support_touch
        });

        slider.init();
    }

    function createNavigation() {
        navigation = new Nav();
        navigation.hideHeaderElements();
    }

    function touchSupport() {
        // Touch support check
        support_touch = 'ontouchstart' in window || !!navigator.msMaxTouchPoints;

        if(support_touch) {
            $('html').addClass('touch');
        }
    }

    function init() {
        // Check support of touch
        touchSupport();

        // Get application data
        Model.load(function() {
            // Create slider
            createSlider();

            // Create navigation
            createNavigation();

            // Add custom event listeners
            addEvents();

            // Transition (singleton)
            transition = Transition;

            // Initial call to resize
            resizeHandler();
        });
    }

    init();
};

export default App;
