/*
* T A M M - Slider
* This file contains the image slider
*
* Usage: var slider = new Slider(elem, {});
*
* Author
* Markus Bergh, 2014
*/

import $ from 'jquery';
import Snap from 'snapsvg';
import 'jquery.transit';

import Model from 'tamm/model';
import PubSub from 'tamm/utils/pubsub';
import Image from 'tamm/modules/image';

/*
* Constructor
*/
let Slider = function(elem, options) {
    this.elem = elem;
    this.$elem = $(elem);
    this.options = options;
    this.currentIndex = 0;
    this.numImages = null;
    this.coreImage = new Image();
    this.onImageLoaded = null;
    this.isLoadedFromArchive = false;
    this.hasAnimatedPaginationNext = false;
    this.hasAnimatedPaginationPrev = false;
    this.preloaderTarget = null;
};

/*
* Prototype
*/
Slider.prototype = {
    defaults: {
        $slider: $('.app-slider'),
        $slider_image_wrapper: $('.app-slider-image-wrapper'),
        $slider_action: $('.app-slider-action'),
        $slider_action_next: $('.app-slider-action.next'),
        $slider_action_next_path: null,
        $slider_action_next_svg: null,
        $slider_action_next_paper: null,
        $slider_action_prev: $('.app-slider-action.prev'),
        $slider_action_prev_path: null,
        $slider_action_prev_svg: null,
        $slider_action_prev_paper: null,
        $slider_image: null,
        $slider_image_current: null,
        $slider_caption: $('.app-slider-caption-text span'),
        $preloader: $('.preloader-wrapper'),
        $progress: $('.progress'),
        $preloader_text: $('.preloader-text')
    },

    init: function() {
        var self = this;

        // Introduce defaults that can be extended either globally or using an object literal.
        this.config = $.extend({}, this.defaults, this.options, this.metadata);

        /**
        * Get url and load correct image
        */
        self.getURL();

        /**
        * Add event to action links
        */
        self.addListener();

        /**
        * Keyboard event
        */
        self.addKeyboard();

        /**
        * Vector arrows
        */
        self.loadSVG();

        /**
        * Listener for loading from archive
        */
        PubSub.subscribe('/tamm/archive/image/load', function(data) {
            self.isLoadedFromArchive = true;

            self.currentIndex = parseInt(data.id, 10);
            self.preloaderTarget = data.target;

            self.load();
        });

        return self;
    },

    getURL: function() {
        var self = this;

        // Get photo index from url
        var url = document.URL;
        var lastPart = url.split("/").pop();

        // If index wasn't found we set a default one
        if(lastPart.length == 0) {
            history.pushState({}, '', '/photos/' + (self.currentIndex + 1));
        } else {
            // Otherwise set index from url
            self.currentIndex = parseInt(lastPart, 10) - 1;
        }

        // Load image
        self.load();

        return self;
    },

    load: function(callback, inverse) {
        var self = this;

        if(this.onImageLoaded) {
            PubSub.unsubscribe(this.onImageLoaded);
        }

        this.onImageLoaded = PubSub.subscribe('/tamm/image/loaded', function(image) {

            // Reset preloader target
            self.preloaderTarget = null;

            // Create image container
            self.config.$slider_image = $('<div />');

            if(typeof callback != 'function') {
                if(self.isLoadedFromArchive) {
                    self.isLoadedFromArchive = false;

                    self.config.$slider_image_current = $('.app-slider-image');
                    self.config.$slider_image_current.remove();

                    PubSub.publish('/tamm/archive/hide');
                }

                // Style for initial image
                self.config.$slider_image.css({
                    opacity: 0,
                    scale: 1.3
                });

                // Animate out preloader
                self.config.$preloader.css({ height: 0 });
                self.config.$preloader.transition({
                    opacity: 0
                }, 600, function() {
                    self.config.$preloader.removeAttr('style');
                    self.config.$preloader.addClass('top');
                    self.config.$progress.addClass('top');
                });

                // Set class
                $('html').addClass('loaded-and-ready');

            } else {
                // Style for paginating images
                self.config.$slider_image.css({
                    x: inverse ? '-100%' : '100%',
                    perspective: 1500,
                    rotateY: inverse ? -25 : 25,
                    scale: 0.5
                });
            }

            // Add image to slider
            self.config.$slider.append(
                self.config.$slider_image_wrapper.append(
                    self.config.$slider_image.append(
                        image
                    ).addClass('app-slider-image')
                )
            );

            // Do resizing
            PubSub.publish('/tamm/image/resize');

            // If call was passed
            if(typeof callback == 'function') {
                self.config.$slider_caption.transition({
                    opacity: 0,
                    perspective: 300,
                    rotateY: inverse ? 15 : -15
                }, 300, 'in-out', function() {
                    self.config.$slider_caption.text(images[self.currentIndex].caption);
                    self.config.$slider_caption.css({
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
                    self.config.$slider_image.transition({
                        opacity: 1,
                        scale: 1
                    }, 500, 'out', function() {
                        // Dispatch event
                        PubSub.publish('/tamm/initial/image/faded');

                        // Remove preloader text elements
                        self.config.$preloader_text.remove();

                        // Set pagination
                        self.setPagination();

                        // Show caption
                        self.config.$slider_caption.removeClass('hidden');

                        self.config.$slider_caption.text(images[self.currentIndex].caption);
                        self.config.$slider_caption.transition({
                            opacity: 1
                        }, 300);

                    });
                }], self);
            }
        });

        if(typeof callback == 'function') {
            self.config.$preloader.removeAttr('style');
            self.config.$progress.removeAttr('style');
        } else {
            if(!self.isLoadedFromArchive) {

                // Fullscreen preloader
                self.config.$preloader.css({
                    top: 0,
                    bottom: 'auto',
                    height: '100%'
                });

                self.config.$progress.css({
                    top: 0,
                    bottom: 'auto',
                    height: '100%'
                });

                self.config.$preloader_text.css({
                    opacity: 0
                }).transition({
                    opacity: 1
                }, 500);

            }
        }

        var images = Model.data;
        self.numImages = images.length;

        // Depending on viewport size we load different image quality
        var mql = window.matchMedia("screen and (max-width: 765px)");
        var imageSource = null;
        if(mql.matches) {
            imageSource = images[self.currentIndex].image_medium;
        } else {
            imageSource = images[self.currentIndex].image;
        }

        self.coreImage.load(
            imageSource,
            self.preloaderTarget
        );

        return self;
    },

    setPagination: function() {
        var self = this;

        // Some logic with previous button
        if(self.currentIndex > 0) {
            self.config.$slider_action_prev.removeClass('hidden');
            if(!self.hasAnimatedPaginationPrev) {
                self.hasAnimatedPaginationPrev = true;
                self.onAnimatePaginationPrev();
            }
        } else {
            self.config.$slider_action_prev.addClass('hidden');
            self.hasAnimatedPaginationPrev = false;
        }

        // Some logic with next button
        if((self.currentIndex + 1) == self.numImages) {
            self.config.$slider_action_next.addClass('hidden');
            self.hasAnimatedPaginationNext = false;
        } else {
            self.config.$slider_action_next.removeClass('hidden');
            if(!self.hasAnimatedPaginationNext) {
                self.hasAnimatedPaginationNext = true;
                self.onAnimatePaginationNext();
            }
        }

        // Update url to current image index
        history.pushState({}, '', '/photos/' + (self.currentIndex + 1));

        return self;
    },

    addListener: function() {
        var self = this;

        self.config.$slider_action.on('click', function(e) {
            e.preventDefault();

            var $action = $(this);

            // If slider is not running
            if($('.slider-is-running').length <= 0) {
                // Check which navigation was clicked
                if($action.hasClass('prev')) {
                    if(self.currentIndex > 0) {
                        self.prev();
                    }
                } else {
                    if((self.currentIndex + 1) < self.numImages) {
                        self.next();
                    }
                }

                // Set pagination
                self.setPagination();
            }
        });

        return self;
    },

    addKeyboard: function() {
        var self = this;

        $('body').keydown(function(e) {
            if($('.slider-is-running').length <= 0 && $('.loaded-and-ready').length > 0) {
                if(e.keyCode == 37) {
                    if(self.currentIndex > 0) {
                        self.prev();
                    }
                } else if(e.keyCode == 39) {
                    if((self.currentIndex + 1) < self.numImages) {
                        self.next();
                    }
                }

                self.setPagination();
            }
        });

        return self;
    },

    next: function() {
        var self = this;

        // Increase count
        self.currentIndex++;

        // Set class for preventing double click
        $('html').addClass('slider-is-running');

        // Load next image with callback
        self.load(function() {

            // Animate out current image
            var $current = self.config.$slider.find('.app-slider-image').eq(0);

            // Animation is different for touch devices
            $current.transition({
                x: self.config.supportsTouch ? '-100%' : '0',
                perspective: 1000,
                rotateY: self.config.supportsTouch ? 0 : 35,
                scale: self.config.supportsTouch ? 1 : 0.5
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

        return self;
    },

    prev: function() {
        var self = this;

        self.currentIndex--;

        // Set class for preventing double click
        $('html').addClass('slider-is-running');

        // Load image with callback
        self.load(function() {

            // Animate out current image
            var $current = self.config.$slider.find('.app-slider-image').eq(0);

            // Animation is different for touch devices
            $current.transition({
                x: self.config.supportsTouch ? '100%' : '0%',
                perspective: 1000,
                rotateY: self.config.supportsTouch ? 0 : -35,
                scale: self.config.supportsTouch ? 1 : 0.5
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

        }, true); // Inverted pagination

        return self;
    },

    loadSVG: function() {
        var self = this;

        self.config.$slider_action_next_paper = new Snap('#app-slider-action-next-arrow');
        self.config.$slider_action_prev_paper = new Snap('#app-slider-action-prev-arrow');

        self.config.$slider_action_next_svg = 'M30.258,28.711c-8.049,7.354-16.095,14.707-24.143,22.053C2.8,53.792-2.14,48.875,1.188,45.837 c7.162-6.542,14.323-13.082,21.485-19.624C15.475,19.445,8.279,12.669,1.079,5.899C-2.2,2.818,2.74-2.103,6.008,0.975 c8.083,7.603,16.166,15.206,24.25,22.809C31.595,25.047,31.629,27.463,30.258,28.711z';
        self.config.$slider_action_next_path = self.config.$slider_action_next_paper.path(self.config.$slider_action_next_svg).attr({
            stroke: '#fff',
            fill: '#fff'
        });

        self.config.$slider_action_prev_svg = 'M1.016,23.002C9.065,15.649,17.11,8.295,25.159,0.95 c3.314-3.028,8.254,1.888,4.927,4.927C22.924,12.419,15.762,18.958,8.6,25.5c7.199,6.768,14.395,13.544,21.595,20.314 c3.279,3.081-1.661,8.002-4.93,4.924c-8.083-7.603-16.166-15.206-24.25-22.809C-0.321,26.666-0.355,24.25,1.016,23.002z';
        self.config.$slider_action_prev_path = self.config.$slider_action_prev_paper.path(self.config.$slider_action_prev_svg).attr({
            stroke: '#fff',
            fill: '#fff'
        });

        return self;
    },

    onAnimatePaginationNext: function(e) {
        var self = this;

        self.config.$slider_action_next_paper.clear();

        var line = self.config.$slider_action_next_paper.path(self.config.$slider_action_next_svg).attr({
            stroke: '#fff',
            fill: 'none'
        });

        var length = line.getTotalLength();

        line.attr({
            strokeDasharray: length + ' ' + length
        });

        Snap.animate(length, 0, function(val) {
            line.attr({
                strokeDashoffset: val
            })
        }, 300, function() {
            line.animate({
                fill: '#fff'
            }, 300);
        });

        return self;
    },

    onAnimatePaginationPrev: function(e) {
        var self = this;

        self.config.$slider_action_prev_paper.clear();

        var line = self.config.$slider_action_prev_paper.path(self.config.$slider_action_prev_svg).attr({
            stroke: '#fff',
            fill: 'none'
        });

        var length = line.getTotalLength();

        line.attr({
            strokeDasharray: length + ' ' + length
        });

        Snap.animate(length, 0, function(val) {
            line.attr({
                strokeDashoffset: val
            })
        }, 300, function() {
            line.animate({
                fill: '#fff'
            }, 300);
        });

        return self;
    }
};

/*
* Defaults
*/
Slider.defaults = Slider.prototype.defaults;

$.fn.Slider = function(options) {
    return this.each(function() {
        new Slider(this, options).init();
    });
};

export default Slider;
