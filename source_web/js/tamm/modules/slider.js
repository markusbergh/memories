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

let $slider = $('.app-slider'),
    $slider_image_wrapper = $('.app-slider-image-wrapper'),
    $slider_action = $('.app-slider-action'),
    $slider_action_next = $('.app-slider-action.next'),
    $slider_action_next_svg = null,
    $slider_action_next_paper = null,
    $slider_action_prev = $('.app-slider-action.prev'),
    $slider_action_prev_svg = null,
    $slider_action_prev_paper = null,
    $slider_image = null,
    $slider_image_current = null,
    $slider_caption = $('.app-slider-caption-text span'),
    $preloader = $('.preloader-wrapper'),
    $progress = $('.progress'),
    $preloader_text = $('.preloader-text'),
    supportsTouch = false;

let Slider = function(options) {
    let currentIndex = 0,
        numImages = null,
        coreImage = new Image(),
        onImageLoaded = null,
        isLoadedFromArchive = false,
        hasAnimatedPaginationNext = false,
        hasAnimatedPaginationPrev = false,
        preloaderTarget = null;

    supportsTouch = options.supportsTouch;

    function init() {
        /**
        * Get url and load correct image
        */
        getURL();

        /**
        * Add event to action links
        */
        addListener();

        /**
        * Keyboard event
        */
        addKeyboard();

        /**
        * Vector arrows
        */
        loadSVG();

        /**
        * Listener for loading from archive
        */
        PubSub.subscribe('/tamm/archive/image/load', function(data) {
            isLoadedFromArchive = true;

            currentIndex = parseInt(data.id, 10);
            preloaderTarget = data.target;

            load();
        });
    }

    function getURL() {
        // Get photo index from url
        let url = document.URL,
            lastPart = url.split('/').pop();

        // If index wasn't found we set a default one
        if(lastPart.length === 0) {
            history.pushState({}, '', '/photos/' + (currentIndex + 1));
        } else {
            // Otherwise set index from url
            currentIndex = parseInt(lastPart, 10) - 1;
        }

        // Load image
        load();
    }

    function load(callback, inverse) {
        if(onImageLoaded) {
            PubSub.unsubscribe(onImageLoaded);
        }

        let images = Model.data,
            // Depending on viewport size we load different image quality
            mql = window.matchMedia('screen and (max-width: 765px)'),
            imageSource = null;

        numImages = Object.keys(images).length;

        onImageLoaded = PubSub.subscribe('/tamm/image/loaded', function(image) {
            // Reset preloader target
            preloaderTarget = null;

            // Create image container
            $slider_image = $('<div />');

            if(typeof callback !== 'function') {
                if(isLoadedFromArchive) {
                    isLoadedFromArchive = false;

                    $slider_image_current = $('.app-slider-image');
                    $slider_image_current.remove();

                    PubSub.publish('/tamm/archive/hide');
                }

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
                    $preloader.addClass('top');
                    $progress.addClass('top');
                });

                // Set class
                $('html').addClass('loaded-and-ready');
            } else {
                // Style for paginating images
                $slider_image.css({
                    x: inverse ? '-100%' : '100%',
                    perspective: 1500,
                    rotateY: inverse ? -25 : 25,
                    scale: 0.5
                });
            }

            // Add image to slider
            $slider.append(
                $slider_image_wrapper.append(
                    $slider_image.append(
                        image
                    ).addClass('app-slider-image')
                )
            );

            // Do resizing
            PubSub.publish('/tamm/image/resize');

            // If call was passed
            if(typeof callback === 'function') {
                $slider_caption.transition({
                    opacity: 0,
                    perspective: 300,
                    rotateY: inverse ? 15 : -15
                }, 300, 'in-out', function() {
                    $slider_caption.text(images[currentIndex].caption);
                    $slider_caption.css({
                        perspective: 300,
                        rotateY: inverse ? -15 : 15
                    }).transition({
                        opacity: 1,
                        rotateY: 0
                    }, 300, 'in-out');
                });

                // Invoke callback
                callback.apply();
            } else {
                // Otherwise just do some size handling and fade in
                PubSub.publish('/tamm/image/resize', [function() {
                    $slider_image.transition({
                        opacity: 1,
                        scale: 1
                    }, 500, 'out', function() {
                        // Dispatch event
                        PubSub.publish('/tamm/initial/image/faded');

                        // Remove preloader text elements
                        $preloader_text.remove();

                        // Set pagination
                        setPagination();

                        // Show caption
                        $slider_caption.removeClass('hidden');

                        $slider_caption.text(images[currentIndex].caption);
                        $slider_caption.transition({
                            opacity: 1
                        }, 300);
                    });
                }], this);
            }
        });

        if(typeof callback === 'function') {
            $preloader.removeAttr('style');
            $progress.removeAttr('style');
        } else if(!isLoadedFromArchive) {
            // Fullscreen preloader
            $preloader.css({
                top: 0,
                bottom: 'auto',
                height: '100%'
            });

            $progress.css({
                top: 0,
                bottom: 'auto',
                height: '100%'
            });

            $preloader_text.css({
                opacity: 0
            }).transition({
                opacity: 1
            }, 500);
        }

        if(mql.matches) {
            imageSource = images[currentIndex].image_medium;
        } else {
            imageSource = images[currentIndex].image;
        }

        coreImage.load(
            imageSource,
            preloaderTarget
        );
    }

    function setPagination() {
        // Some logic with previous button
        if(currentIndex > 0) {
            $slider_action_prev.removeClass('hidden');
            if(!hasAnimatedPaginationPrev) {
                hasAnimatedPaginationPrev = true;
                onAnimatePaginationPrev();
            }
        } else {
            $slider_action_prev.addClass('hidden');
            hasAnimatedPaginationPrev = false;
        }

        // Some logic with next button
        if(currentIndex + 1 === numImages) {
            $slider_action_next.addClass('hidden');
            hasAnimatedPaginationNext = false;
        } else {
            $slider_action_next.removeClass('hidden');
            if(!hasAnimatedPaginationNext) {
                hasAnimatedPaginationNext = true;
                onAnimatePaginationNext();
            }
        }

        // Update url to current image index
        history.pushState({}, '', '/photos/' + (currentIndex + 1));
    }

    function addListener() {
        $slider_action.on('click', function(e) {
            e.preventDefault();

            let $action = $(this);

            // If slider is not running
            if($('.slider-is-running').length <= 0) {
                // Check which navigation was clicked
                if($action.hasClass('prev')) {
                    if(currentIndex > 0) {
                        prev();
                    }
                } else if(currentIndex + 1 < numImages) {
                    next();
                }

                // Set pagination
                setPagination();
            }
        });
    }

    function addKeyboard() {
        $('body').keydown(function(e) {
            if($('.slider-is-running').length <= 0 && $('.loaded-and-ready').length > 0) {
                if(e.keyCode === 37) {
                    if(currentIndex > 0) {
                        prev();
                    }
                } else if(e.keyCode === 39) {
                    if(currentIndex + 1 < numImages) {
                        next();
                    }
                }

                setPagination();
            }
        });
    }

    function next() {
        // Increase count
        currentIndex++;

        // Set class for preventing double click
        $('html').addClass('slider-is-running');

        // Load next image with callback
        load(function() {
            // Animate out current image
            let $current = $slider.find('.app-slider-image').eq(0);

            // Animation is different for touch devices
            $current.transition({
                x: supportsTouch ? '-100%' : '0',
                perspective: 1000,
                rotateY: supportsTouch ? 0 : 35,
                scale: supportsTouch ? 1 : 0.5
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

    function prev() {
        currentIndex--;

        // Set class for preventing double click
        $('html').addClass('slider-is-running');

        // Load image with callback
        load(function() {
            // Animate out current image
            let $current = $slider.find('.app-slider-image').eq(0);

            // Animation is different for touch devices
            $current.transition({
                x: supportsTouch ? '100%' : '0%',
                perspective: 1000,
                rotateY: supportsTouch ? 0 : -35,
                scale: supportsTouch ? 1 : 0.5
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

    function onAnimatePaginationNext() {
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

    function onAnimatePaginationPrev() {
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

    init();
};

export default Slider;
