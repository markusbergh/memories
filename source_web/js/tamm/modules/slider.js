/**
 * Slider
 * This file contains the image slider
 *
 * Author
 * Markus Bergh, 2016
 */

import $ from 'jquery';
import Snap from 'snapsvg';
import 'jquery.transit';

import Model from 'tamm/model';
import PubSub from 'tamm/utils/pubsub';
import Image from 'tamm/modules/image';

let $slider_action_next_svg = null,
    $slider_action_next_paper = null,
    $slider_action_prev_svg = null,
    $slider_action_prev_paper = null,
    $slider_image = null,
    $grid_container = null,
    $current_grid_item_image = null,
    supports_touch = false,
    current_index = 0,
    current_target = null,
    total_images = 0,
    image_loaded_event = null,
    has_animated_pagination_next = false,
    has_animated_pagination_prev = false,
    image = new Image();

const $slider = $('.app-slider'),
      $slider_image_wrapper = $('.app-slider-image-wrapper'),
      $slider_action = $('.app-slider-action'),
      $slider_action_next = $('.app-slider-action.next'),
      $slider_action_prev = $('.app-slider-action.prev'),
      $slider_caption = $('.app-slider-caption-text span'),
      $preloader = $('.preloader-wrapper'),
      $progress = $('.progress'),
      $body = $('body'),
      $html = $('html');

let Slider = function(options) {
    supports_touch = options.supports_touch;

    function init() {
        // Get url and load correct image
        getURL();

        // Add event to action links
        setupEvents();

        // Vector arrows
        loadSVG();
    }

    init();
};

function setupEvents() {
    $slider_action.on('click', handleSliderActionClick);

    setupKeyboard();

    PubSub.subscribe('/tamm/grid/image/load', handleLoadFromArchive);
    PubSub.subscribe('/tamm/slider/pagination/hide', hidePagination);
    PubSub.subscribe('/tamm/slider/caption/hide', hideCaption);
}

function getURL() {
    // Get photo index from url
    let url = document.URL,
        last_part = url.split('/').pop();

    // If index wasn't found we set a default one
    if(last_part.length === 0) {
        history.pushState({}, '', '/photos/' + (current_index + 1));
    } else {
        // Otherwise set index from url
        current_index = parseInt(last_part, 10) - 1;
    }

    // And then load the image
    load();
}

function handleLoadFromArchive(data) {
    // Get grid
    $grid_container = $('.grid-container');

    // Get index of image
    current_index = parseInt(data.id, 10);
    current_target = data.target;

    animateThumbImageFromGrid(current_target);
}

function animateThumbImageFromGrid(target) {
    let $current_grid_item = target,
        $current_slider_image_wrapper = $('.app-slider-image-wrapper'),
        current_width = $current_grid_item.width(),
        current_height = $current_grid_item.height(),
        left_pos = $current_grid_item.offset().left,
        top_pos = $current_grid_item.offset().top -
                  $current_slider_image_wrapper.offset().top;

    $current_grid_item_image = $current_grid_item.find('img');

    $current_slider_image_wrapper.css({
        display: 'block'
    });

    $slider_image.append(
        $current_grid_item_image.css({
            width: current_width,
            height: current_height,
            left: left_pos,
            top: top_pos
        })
    );

    $current_grid_item_image.transition({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    }, 800, 'easeInOutQuint', function() {
        let images = Model.data,
            image_source = images[current_index].image,
            image_caption = images[current_index].caption;

        handleAnimateThumbImageFromGridComplete(image_source, image_caption);
    });
}

function handleAnimateThumbImageFromGridComplete(image_source, image_caption) {
    $grid_container.remove();

    // Clear any previous event listener
    if(image_loaded_event) {
        PubSub.unsubscribe(image_loaded_event);
    }

    // Load fullscreen image
    image.load(
        image_source
    );

    image_loaded_event = PubSub.subscribe('/tamm/image/loaded', function(image_loaded) {
        handleImageLoadedFromGrid(image_loaded, image_caption);
    });
}

function handleImageLoadedFromGrid(image_loaded, image_caption) {
    let $image = $(image_loaded);

    setCursorDefault();

    $slider_image.append($image);

    $image.css({
        opacity: 0
    });

    $image.transition({
        opacity: 1
    }, 300, function() {
        $current_grid_item_image.remove();
    });

    // Set caption text and show it
    updateSliderCaption(image_caption);

    // Handle pagination
    setupPagination();

    // Show toggle for archive
    PubSub.publish('/tamm/grid/toggle/show');
}

function load(callback, inverse) {
    setCursorProgress();

    if(image_loaded_event) {
        PubSub.unsubscribe(image_loaded_event);
    }

    let images = Model.data,
        // Depending on viewport size we load different image quality
        mql = window.matchMedia('screen and (max-width: 765px)'),
        image_source = null;

    total_images = Object.keys(images).length;

    image_loaded_event = PubSub.subscribe('/tamm/image/loaded', function(image_loaded) {
        handleImageLoaded(images, image_loaded, callback, inverse);
    });

    if(typeof callback === 'function') {
        $preloader.removeAttr('style');
        $progress.removeAttr('style');
    }

    if(mql.matches) {
        image_source = images[current_index].image_medium;
    } else {
        image_source = images[current_index].image;
    }

    image.load(
        image_source
    );
}

function handleImageLoaded(images, image_loaded, callback, inverse) {
    setCursorDefault();

    // Create image container
    $slider_image = $('<div />');

    // Add image to slider
    $slider.append(
        $slider_image_wrapper.append(
            $slider_image.append(
                image_loaded
            ).addClass('app-slider-image')
        )
    );

    if(typeof callback !== 'function') {
        initialImageLoaded();

        $slider_image.transition({
            opacity: 1,
            scale: 1
        }, 500, 'out', function() {
            // Dispatch event
            PubSub.publish('/tamm/initial/image/faded');

            // Set pagination
            setupPagination();

            // Set caption text and show it
            updateSliderCaption(images[current_index].caption);
        });
    } else {
        // Style for paginating images
        $slider_image.css({
            x: inverse ? '-100%' : '100%',
            perspective: 1500,
            rotateY: inverse ? -25 : 25,
            scale: 0.5
        });

        // Update caption text while pagination
        updateSliderCaptionWithTransition(images[current_index].caption, inverse);

        // Invoke callback
        callback.apply();
    }
}

function updateSliderCaption(image_caption) {
    $slider_caption.removeClass('hidden');
    $slider_caption.text(image_caption);
    $slider_caption.transition({
        opacity: 1
    }, 300, function() {
        $slider_caption.removeAttr('style');
    });
}

function updateSliderCaptionWithTransition(caption, inverse) {
    $slider_caption.transition({
        opacity: 0,
        perspective: 300,
        rotateY: inverse ? 15 : -15
    }, 300, 'in-out', function() {
        $slider_caption.text(caption);
        $slider_caption.css({
            perspective: 300,
            rotateY: inverse ? -15 : 15
        }).transition({
            opacity: 1,
            rotateY: 0
        }, 300, 'in-out', function() {
            $slider_caption.removeAttr('style');
        });
    });
}

function initialImageLoaded() {
    // Style for initial image
    $slider_image.css({
        opacity: 0,
        scale: 1.3
    });

    // Animate out preloader
    $preloader.css({ height: 0 });
    $preloader.transition({
        opacity: 0
    }, 600, function() {
        $preloader.removeAttr('style');
        $preloader.removeClass('center');
        $preloader.addClass('top');
        $progress.addClass('top');
    });

    // Set class
    $html.addClass('loaded-and-ready');
}

function setupPagination() {
    // Some logic with previous button
    if(current_index > 0) {
        $slider_action_prev.removeClass('hidden');
        if(!has_animated_pagination_prev) {
            has_animated_pagination_prev = true;
            animateInPrevNavigation();
        }
    } else {
        $slider_action_prev.addClass('hidden');
        has_animated_pagination_prev = false;
    }

    // Some logic with next button
    if(current_index + 1 === total_images) {
        $slider_action_next.addClass('hidden');
        has_animated_pagination_next = false;
    } else {
        $slider_action_next.removeClass('hidden');
        if(!has_animated_pagination_next) {
            has_animated_pagination_next = true;
            animateInNextPagination();
        }
    }

    // Update url to current image index
    history.pushState({}, '', '/photos/' + (current_index + 1));
}

function hidePagination() {
    $slider_action_prev.addClass('hidden');
    $slider_action_next.addClass('hidden');
}

function hideCaption() {
    $slider_caption.transition({
        opacity: 0
    }, 300, function() {
        $slider_caption.addClass('hidden');
    });
}

function setupKeyboard() {
    $body.keydown(handleKeyDown);
}

function handleKeyDown(ev) {
    if($('.slider-is-running').length <= 0 &&
       $('.loaded-and-ready').length > 0) {
        if(ev.keyCode === 37) {
            if(current_index > 0) {
                goPrev();
            }
        } else if(ev.keyCode === 39) {
            if(current_index + 1 < total_images) {
                goNext();
            }
        }

        setupPagination();
    }
}

function handleSliderActionClick(ev) {
    ev.preventDefault();

    let $action = $(this);

    // If slider is not running
    if($('.slider-is-running').length <= 0) {
        // Check which navigation was clicked
        if($action.hasClass('prev')) {
            if(current_index > 0) {
                goPrev();
            }
        } else if(current_index + 1 < total_images) {
            goNext();
        }

        // Set pagination
        setupPagination();
    }
}

function goNext() {
    // Increase count
    current_index++;

    // Set class for preventing double click
    $('html').addClass('slider-is-running');

    // Load next image with callback
    load(function() {
        // Animate out current image
        let $current = $slider.find('.app-slider-image').eq(0);

        // Animation is different for touch devices
        $current.transition({
            x: supports_touch ? '-100%' : '0',
            perspective: 1000,
            rotateY: supports_touch ? 0 : 35,
            scale: supports_touch ? 1 : 0.5
        }, 1000, 'in-out', function() {
            // When done, remove image
            $current.remove();

            // Enable pagination
            $('html').removeClass('slider-is-running');
        });

        // Animate in next image
        $current.next().transition({
            x: '0',
            scale: 1,
            rotateY: 0
        }, 700, 'in-out');
    });
}

function goPrev() {
    current_index--;

    // Set class for preventing double click
    $('html').addClass('slider-is-running');

    // Load image with callback
    load(function() {
        // Animate out current image
        let $current = $slider.find('.app-slider-image').eq(0);

        // Animation is different for touch devices
        $current.transition({
            x: supports_touch ? '100%' : '0%',
            perspective: 1000,
            rotateY: supports_touch ? 0 : -35,
            scale: supports_touch ? 1 : 0.5
        }, 1000, 'in-out', function() {
            $current.remove();

            // Enable pagination
            $('html').removeClass('slider-is-running');
        });

        // Animate in next image
        $current.next().transition({
            x: '0%',
            scale: 1,
            rotateY: 0,
            perspective: 1000
        }, 700, 'in-out');
        // Inverted pagination
    }, true);
}

function loadSVG() {
    $slider_action_next_paper = new Snap('#app-slider-action-next-arrow');
    $slider_action_prev_paper = new Snap('#app-slider-action-prev-arrow');

    $slider_action_next_svg = `M30.258,28.711c-8.049,7.354-16.095,14.707-24.143,22.053C2.8,53.792-2.14,48.875,1.188,45.837 c7.162-6.542,14.323-13.082,21.485-19.624C15.475,19.445,8.279,12.669,1.079,5.899C-2.2,2.818,2.74-2.103,6.008,0.975 c8.083,7.603,16.166,15.206,24.25,22.809C31.595,25.047,31.629,27.463,30.258,28.711z`;

    $slider_action_next_paper.path($slider_action_next_svg).attr({
        stroke: '#fff',
        fill: '#fff'
    });

    $slider_action_prev_svg = `M1.016,23.002C9.065,15.649,17.11,8.295,25.159,0.95 c3.314-3.028,8.254,1.888,4.927,4.927C22.924,12.419,15.762,18.958,8.6,25.5c7.199,6.768,14.395,13.544,21.595,20.314 c3.279,3.081-1.661,8.002-4.93,4.924c-8.083-7.603-16.166-15.206-24.25-22.809C-0.321,26.666-0.355,24.25,1.016,23.002z`;

    $slider_action_prev_paper.path($slider_action_prev_svg).attr({
        stroke: '#fff',
        fill: '#fff'
    });
}

function animateInNextPagination() {
    $slider_action_next_paper.clear();

    let line = $slider_action_next_paper.path($slider_action_next_svg)
                                        .attr({
                                            stroke: '#fff',
                                            fill: 'none'
                                        }), length = line.getTotalLength();

    line.attr({
        strokeDasharray: length + ' ' + length
    });

    Snap.animate(length, 0, function(val) {
        line.attr({
            strokeDashoffset: val
        });
    }, 300, function() {
        line.animate({
            fill: '#fff'
        }, 300);
    });
}

function animateInPrevNavigation() {
    $slider_action_prev_paper.clear();

    let line = $slider_action_prev_paper.path($slider_action_prev_svg)
                                        .attr({
                                            stroke: '#fff',
                                            fill: 'none'
                                        }), length = line.getTotalLength();

    line.attr({
        strokeDasharray: length + ' ' + length
    });

    Snap.animate(length, 0, function(val) {
        line.attr({
            strokeDashoffset: val
        });
    }, 300, function() {
        line.animate({
            fill: '#fff'
        }, 300);
    });
}

function setCursorProgress() {
    $body.css('cursor', 'progress');
}

function setCursorDefault() {
    $body.css('cursor', 'default');
}

export default Slider;
