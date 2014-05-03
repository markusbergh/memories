/*
 * T A M M - Transition
 * This file contains transition animation
 *
 * Usage: var transition = new Transition();
 *
 * Author
 * Markus Bergh
 * 2014
 */

define([
		'jquery',
		'snapsvg',
		'tamm/utils/tamm__PubSub'
	],

	function($, Snap, PubSub) {

		var instance = null,
			s = null,
			curtain = null;

	    function Transition() {
	        if(instance !== null) {
	            throw new Error("Cannot instantiate more than one Transition, use Transition.getInstance()");
	        }

	        this.init();
	    };

	    Transition.prototype = {
	    	defaults: {
	    		$elem: $('#transition')
	    	},

	    	init: function() {
	    		var self = this;

	    		s = Snap('#transition');

                curtain = s.path('m 75,-80 155,0 0,225 C 90,85 100,30 75,-80 z');
                curtain.attr({
                    'fill': 'white'
                });

                return self;
	    	},

	        show: function() {
	        	var self = this;

	        	self.defaults.$elem.css({
                    'z-index': window.Z_INDEX_TRANSITION,
                    'display': 'block'
                });

                curtain.animate({
                    path: 'm 40,-80 190,0 -305,290 C -100,140 0,0 40,-80 z'
                }, 700, mina.easeout, function() {
                	PubSub.publish('/tamm/section/show', [], this);
                });

                return self;
	        },

	        hide: function() {
	        	var self = this;

	        	curtain.animate({
	        		path: 'm 75,-80 155,0 0,225 C 90,85 100,30 75,-80 z'
	        	}, 700, mina.easein, function() {
	        		self.defaults.$elem.removeAttr('style');
	        	});

	        	return self;
	        }
	    };

	    Transition.getInstance = function() {
	        // summary:
	        //      Gets an instance of the singleton. It is better to use
	        if(instance === null) {
	            instance = new Transition();
	        }
	        return instance;
	    };

	    return Transition.getInstance();

	}
);