/**
 * Navigation
 * This file contains the navigation
 *
 * Author
 * Markus Bergh, 2016
 */

import $ from 'jquery';
import 'jquery.transit';

import PubSub from 'tamm/utils/pubsub';

let Navigation = function() {
    let $nav_title = $('.logo'),
        $nav_years = $('.years-of-memories'),
        $grid_toggle = $('#grid-toggle');

    function init() {
        addEvents();
    }

    function addEvents() {
        PubSub.subscribe('/tamm/grid/toggle/show', showGridToggle);

        // Add listeners
        addListenerForToggle();
    }

    function addListenerForToggle() {
        $grid_toggle.on('click', handleGridToggleClick);
    }

    function hideGridToggle() {
        $grid_toggle.transition({
            opacity: 0
        }, 400, function() {
            $grid_toggle.css({
                display: 'none'
            });
        });
    }

    function showGridToggle() {
        $grid_toggle.css({
            display: 'block'
        });

        $grid_toggle.transition({
            opacity: 1
        }, 400);
    }

    function handleGridToggleClick(ev) {
        ev.preventDefault();

        hideGridToggle();

        PubSub.publish('/tamm/grid/load');
        PubSub.publish('/tamm/slider/caption/hide');
        PubSub.publish('/tamm/slider/pagination/hide');
    }

    this.hideHeaderElements = function() {
        $nav_years.css({
            opacity: 0
        });

        $nav_title.css({
            opacity: 0
        });
    };

    this.showHeaderElements = function() {
        $nav_title.transition({
            opacity: 1
        }, 500);

        $nav_years.transition({
            opacity: 1
        }, 500);
    };

    init();
};

export default Navigation;
