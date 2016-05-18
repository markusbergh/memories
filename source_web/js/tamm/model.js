/*
* Model
* This file contains the model for application
*
* Usage: var memories = Memories.getInstance();
*
* Author
* Markus Bergh, 2016
*/

import $ from 'jquery';

let instance = null;

function Memories() {
    if(instance !== null) {
        throw new Error('Cannot instantiate more than one Memories, use Memories.getInstance()');
    }

    this.initialize();
}

Memories.prototype = {
    /*
    * Constructor
    */
    initialize: function() {
        this.data = [];
    },

    load: function(callback) {
        var self = this;

        $.getJSON('/data/memories.json', function(data) {
            data = data.reverse();

            for(let prop in data) {
                if(data.hasOwnProperty(prop)) {
                    let memory = data[prop];

                    self.data[prop] = {
                        image: memory.image,
                        image_medium: memory.image_medium,
                        thumbnail: memory.thumbnail,
                        caption: memory.caption
                    };
                }
            }

            if(typeof callback === 'function') {
                callback();
            }
        });
    },

    get: function() {
        return this.data;
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

export default Memories.getInstance();
