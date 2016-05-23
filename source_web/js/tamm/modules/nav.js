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

        $.getJSON('/data/memories.json', function(archive) {
            var $grid = $('<div />'),
                $grid_container = $('<div />'),
                $left_column = $('<div />'),
                $right_column = $('<div />');

            $grid_container.addClass('grid_container');
            $grid.addClass('grid');

            $grid_container.append(
                $grid.append(
                    $left_column.addClass('grid_column column_left'),
                    $right_column.addClass('grid_column column_right')
                )
            );

            $('body').append($grid_container);

            archive.reverse();

            // Get photo index from url
            let url = document.URL,
                current_index = url.split('/').pop() - 1,
                total_images = archive.length,
                images_loaded = 0;

            for(let index in archive) {
                if(archive.hasOwnProperty(index)) {

                    let item = archive[index],
                        thumbnail = item.image_medium,
                        image = new Image(),
                        $grid_item = $('<a />');

                    if(index != current_index) {
                        $grid_item.append(image);
                    }

                    $grid_item.addClass('grid_item');

                    image.src = thumbnail;

                    image.onload = function() {
                        images_loaded++;
                        if(images_loaded === total_images) {

                            var $current_grid_item = $grid.find('a:empty');

                            if(!isVisibleInView($current_grid_item[0])) {
                                $(window).scrollTop($current_grid_item.offset().top - $current_grid_item.height() / 2);
                            }

                            $('.app-slider-image img').transition({
                                top: 0,
                                left: 0,
                                x: $current_grid_item.offset().left,
                                y: $current_grid_item.offset().top - $(window).scrollTop(),
                                width:  $current_grid_item.width(),
                                height: $current_grid_item.height()
                            }, 800, 'easeInOutQuint', function() {
                                $('.app-slider-image img').removeAttr('style');
                                $current_grid_item.append($('.app-slider-image img'));
                            });

                        }
                    }

                    if(index % 2 === 0) {
                        $left_column.append($grid_item);
                    } else {
                        $right_column.append($grid_item);
                    }
                }
            }
        });
    }

    function isVisibleInView(elem) {
        var $elem = $(elem);
        var $window = $(window);

        var docViewTop = $window.scrollTop();
        var docViewBottom = docViewTop + $window.height();

        var elemTop = $elem.offset().top;
        var elemBottom = elemTop + $elem.height();

        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
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
