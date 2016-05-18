/**
 * Model
 * This file contains the model for application
 *
 * Author
 * Markus Bergh, 2016
 */

import $ from 'jquery';

// Block level variables for class state store
const singleton = Symbol(),
      singletonEnforcer = Symbol();

// Data
let data = {};

class Memories {
    /**
     * @param {Object} enforcer The symbol reference for class
     */
    constructor(enforcer) {
        if(enforcer !== singletonEnforcer) {
            throw new Error('Cannot construct singleton');
        }
    }

    static load(callback) {
        $.getJSON('/data/memories.json', function(response) {
            let reversed = response.reverse();

            for(let index in reversed) {
                if(reversed.hasOwnProperty(index)) {
                    let memory = reversed[index];

                    data[index] = {
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
    }

    static get data() {
        return data;
    }

    /**
     * @returns {Class} Singleton
     */
    static get instance() {
        if (!this[singleton]) {
            this[singleton] = new Memories(singletonEnforcer);
        }
        return this[singleton];
    }
}

export default Memories;
