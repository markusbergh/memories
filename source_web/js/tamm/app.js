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
import Slider from 'tamm/modules/slider';
import Nav from 'tamm/modules/nav';
import Grid from 'tamm/modules/grid';
import Model from 'tamm/model';

import 'tamm/utils/utils';

let App = function() {
    let transition = null,
        section = null,
        navigation = null,
        support_touch = false;

    function handleOrientationChanged() {
        switch(window.orientation) {
            case -90:
            case 90:
                window.scrollTo(0, 0);
                break;
            default:
                break;
        }
    }

    function setupEvents() {
        // Custom events for application
        addCustomEvents();

        // Orientation
        window.addEventListener('orientationchange', handleOrientationChanged);
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

        // Listen for section show
        PubSub.subscribe('/tamm/section/show', function() {
            section.show();
        });

        // Listen for section hide
        PubSub.subscribe('/tamm/section/hide', function() {
            section.hide();
        });
    }

    function createSlider() {
        Slider({
            supports_touch: support_touch
        });
    }

    function createNavigation() {
        navigation = new Nav();
        navigation.hideHeaderElements();
    }

    function createGrid() {
        Grid();
    }

    function checkTouchSupport() {
        // Touch support check
        support_touch = 'ontouchstart' in window || !!navigator.msMaxTouchPoints;

        if(support_touch) {
            $('html').addClass('touch');
        }
    }

    function init() {
        // Decide whether touch or not
        checkTouchSupport();

        // Get application data
        Model.load(function() {
            createSlider();
            createNavigation();
            createGrid();

            // Add custom event listeners
            setupEvents();

            // Transition
            transition = Transition;
        });
    }

    init();
};

export default App;
