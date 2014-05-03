/*
 * T A M M - Model
 * This file contains the model for application
 *
 * Usage: var memories = Memories.getInstance();
 *
 * Author
 * Markus Bergh, 2014
 */

define([
		'jquery'
	],

	function($) {
	    var instance = null;

	    function Memories() {
	        if(instance !== null) {
	            throw new Error("Cannot instantiate more than one Memories, use Memories.getInstance()");
	        }

	        this.initialize();
	    }

	    Memories.prototype = {
	    	/*
			 * Constructor
			 */
	        initialize: function() {
	        	var self = this;

               	self.data = [];

                return self;
	        },

	        load: function(callback) {
	        	var self = this;

	        	$.getJSON('/data/memories.json', function(data) {
                	for(var index in data) {
                		var memory = data[index];
                		self.data[index] = {
                			image: memory.image,
                			thumbnail: memory.thumbnail
                		};
                	}

                	if(typeof callback == 'function') {
                		callback();
                	}
                });

                return self;
	        },

	        get: function() {
	        	var self = this;

	        	return self.data;
	        }
	    };

	    Memories.getInstance = function() {
	        // summary:
	        //      Gets an instance of the singleton. It is better to use
	        if(instance === null) {
	            instance = new Memories();
	        }
	        return instance;
	    };

	    return Memories.getInstance();
	}
);