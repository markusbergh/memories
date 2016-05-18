/*
* TAMM - Navigation
* This file contains the navigation
*
* Usage: var nav = new Nav(elem, {});
*
* Author
* Markus Bergh, 2016
*/

import $ from 'jquery';
import 'jquery.transit';

import PubSub from 'tamm/utils/pubsub';

/*
 * Constructor
 */
let Navigation = function(elem, options) {
    this.elem = elem;
    this.$elem = $(elem);
    this.options = options;
    this.transitionEnd = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend';
};

/*
 * Prototype
 */
Navigation.prototype = {
    defaults: {
        $nav: $('nav[role="navigation"]'),
        $nav_items: $('nav[role="navigation"] ul a'),
        $nav_toggle: $('#nav-toggle'),
        $nav_title: $('.logo'),
        $nav_years: $('.years-of-memories')
    },

    init: function() {
        // Introduce defaults that can be extended either globally or using an object literal.
        this.config = $.extend({}, this.defaults, this.options, this.metadata);

        // Hide visually
        this.defaults.$nav.removeClass('hidden').addClass('visuallyhidden');

        // Add listeners
        this.addListenerForNavItems();
        this.addListenerForToggle();

        PubSub.subscribe('/tamm/navigation/reset', function() {
            this.reset();
        });
    },

    addListenerForNavItems: function() {
        let self = this;

        self.config.$nav_items.on('click', function(e) {
            e.preventDefault();

            let $nav_item = $(this);

            // Inverted style for toggle
            self.config.$nav_toggle.addClass('inverted');

            // Change toggle event
            self.changeListenerToClosingSection();

            // Publish event(s)
            PubSub.publish('/tamm/transition/show');

            // Create section-
            PubSub.publish('/tamm/section/create', [$nav_item.data('section')], this);
        });

        return self;
    },

    addListenerForToggle: function() {
        var self = this;

        this.config.$nav_toggle.unbind();
        this.config.$nav_toggle.on('click', function(e) {
            e.preventDefault;

            // Animate icon to close state
            $(this).toggleClass('close');

            // Toggle menu
            self.toggle();
        });
    },

    toggle: function() {
        var self = this;

        // Navigation links
        var $nav_links = self.defaults.$nav.find('a');

        // Set some initial styling
        $nav_links.css({
            opacity: 0,
            scale: 0.8,
            perspective: '100px',
            rotateX: '45deg'
        });

        // Hide/show navigation
        self.config.$nav.toggleClass('visuallyhidden');

        // When wrapper has faded in
        self.config.$nav.one(self.transitionEnd, function(e) {
            var propertyName = e.originalEvent.propertyName;
            var style = window.getComputedStyle($nav_links[0], null);

            if(style.opacity <= 0) {
                var delay = 0;

                $.each($nav_links, function(i, elem) {
                    var $link = $(elem);

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

        return self;
    },

    changeListenerToClosingSection: function() {
        this.config.$nav_toggle.unbind();

        this.config.$nav_toggle.on('click', () => {
            // Default style for toggle
            this.config.$nav_toggle.removeClass('inverted');

            // Default toggle action
            this.addListenerForToggle();

            // Publish event
            PubSub.publish('/tamm/section/hide');
        });
    },

    reset: function() {
        // Default toggle action
        this.addListenerForToggle();

        // Default color and state
        this.config.$nav_toggle.removeClass('close');
        this.config.$nav_toggle.removeClass('inverted');

        // Hide menu
        this.config.$nav.addClass('visuallyhidden');
    },

    hideHeaderElements: function() {
        this.config.$nav_years.css({
            opacity: 0
        });

        this.config.$nav_title.css({
            opacity: 0
        });

        this.config.$nav_toggle.css({
            opacity: 0
        });
    },

    showHeaderElements: function() {
        this.config.$nav_years.transition({
            opacity: 1,
            delay: 600
        }, 500);

        this.config.$nav_title.transition({
            opacity: 1,
            delay: 300
        }, 500);

        this.config.$nav_toggle.transition({
            opacity: 1
        }, 500);
    }
};

/*
* Defaults
*/
Navigation.defaults = Navigation.prototype.defaults;

$.fn.Navigation = function(options) {
    return this.each(function() {
        new Navigation(this, options).init();
    });
};

export default Navigation;
