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
    const transition_end = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend';

    let $nav = $('nav[role="navigation"]'),
        $nav_items = $('nav[role="navigation"] ul a'),
        $nav_toggle = $('#nav-toggle'),
        $nav_title = $('.logo'),
        $nav_years = $('.years-of-memories'),
        $grid_toggle = $('#grid-toggle');

    function init() {
        // Hide visually
        $nav.removeClass('hidden')
            .addClass('visuallyhidden');

        addEvents();
    }

    function addEvents() {
        // Add listeners
        addListenerForToggle();
        addListenerForNavItems();

        // Add custom events
        addCustomEvents();
    }

    function addCustomEvents() {
        PubSub.subscribe('/tamm/navigation/reset', function() {
            reset();
        });
    }

    function addListenerForNavItems() {
        $nav_items.on('click', handleNavItemClick);
    }

    function handleNavItemClick(ev) {
        ev.preventDefault();

        let $nav_item = $(this);

        // Inverted style for toggle
        $nav_toggle.addClass('inverted');

        // Change toggle event
        changeListenerToClosingSection();

        // Publish event(s)
        PubSub.publish('/tamm/transition/show');
        PubSub.publish('/tamm/section/create', [
            $nav_item.data('section')
        ], this);
    }

    function addListenerForToggle() {
        $nav_toggle.unbind();
        $nav_toggle.on('click', handleNavToggleClick);

        $grid_toggle.on('click', handleGridToggleClick);
    }

    function handleNavToggleClick(ev) {
        ev.preventDefault();

        // Animate icon to close state
        $(this).toggleClass('close');

        // Toggle menu
        toggle();
    }

    function handleGridToggleClick(ev) {
        ev.preventDefault();

        PubSub.publish('/tamm/grid/load');
    }

    function toggle() {
        // Navigation links
        let $nav_links = $nav.find('a');

        // Set some initial styling
        $nav_links.css({
            opacity: 0,
            scale: 0.8,
            perspective: '100px',
            rotateX: '45deg'
        });

        // Hide/show navigation
        $nav.toggleClass('visuallyhidden');

        // When wrapper has faded in
        $nav.one(transition_end, function() {
            let style = window.getComputedStyle($nav_links[0], null);

            if(style.opacity <= 0) {
                let delay = 0;

                $.each($nav_links, function(i, elem) {
                    let $link = $(elem);

                    $link.transition({
                        opacity: 1,
                        scale: 1,
                        rotateX: '0deg',
                        delay: delay * 100
                    }, 300);

                    delay++;
                });
            }
        });
    }

    function changeListenerToClosingSection() {
        $nav_toggle.unbind();

        $nav_toggle.on('click', () => {
            // Default style for toggle
            $nav_toggle.removeClass('inverted');

            // Default toggle action
            addListenerForToggle();

            // Publish event
            PubSub.publish('/tamm/section/hide');
        });
    }

    function reset() {
        // Default toggle action
        addListenerForToggle();

        // Default color and state
        $nav_toggle.removeClass('close');
        $nav_toggle.removeClass('inverted');

        // Hide menu
        $nav.addClass('visuallyhidden');
    }

    this.hideHeaderElements = function() {
        $nav_years.css({
            opacity: 0
        });

        $nav_title.css({
            opacity: 0
        });

        $nav_toggle.css({
            opacity: 0
        });
    };

    this.showHeaderElements = function() {
        $nav_years.transition({
            opacity: 1,
            delay: 600
        }, 500);

        $nav_title.transition({
            opacity: 1,
            delay: 300
        }, 500);

        $nav_toggle.transition({
            opacity: 1
        }, 500);
    };

    init();
};

export default Navigation;
