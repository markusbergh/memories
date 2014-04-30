/*
 * Navigation
 * This file contains the navigation for site
 *
 * Author
 * Markus Bergh
 * 2014
 */

define([
		'jquery',
		'transit'
	],

    function($) {

    	var TAMMNav = function() {

    		this.defaults = {
                $nav: $('nav[role="navigation"]'),
                $toggle: $('#nav-toggle')
    		};

            var transitionEnd = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend';

    		this.initialize = function() {
    			var self = this;

                /**
                 * Toggle menu button
                 */
                self.defaults.$toggle.on('click', function(e) {
                    e.preventDefault;

                    var $action = $(this);
                    $action.toggleClass('close');

                    /**
                     * Hide all links by default
                     */
                    var $links = self.defaults.$nav.find('a');

                    $links.css({
                        opacity: 0,
                        scale: 0.8,
                        perspective: '100px',
                        rotateX: '45deg'
                    });

                    self.defaults.$nav.one(transitionEnd, function(e) {
                        var propertyName = e.originalEvent.propertyName;
                        var style = window.getComputedStyle($links[0], null);

                        if(style.opacity <= 0) {
                            var delay = 0;

                            $.each($links, function(i, elem) {
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

                    self.defaults.$nav.toggleClass('hidden');
                });
    		};

    	};

    	return TAMMNav;

    }
);