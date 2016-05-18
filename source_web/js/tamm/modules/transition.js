/**
 * Transition
 * This file contains transition animation
 *
 * Author
 * Markus Bergh, 2016
 */

import $ from 'jquery';
import Snap from 'snapsvg';

import PubSub from 'tamm/utils/pubsub';

let instance = null,
    s = null,
    curtain = null;

function Transition() {
    let $elem = $('#transition');

    if(instance !== null) {
        throw new Error(`Cannot instantiate more than one Transition,
                         use Transition.getInstance()`);
    }

    function init() {
        s = Snap('#transition');

        curtain = s.path('m 75,-80 155,0 0,225 C 90,85 100,30 75,-80 z');
        curtain.attr({
            fill: 'white'
        });
    }

    this.show = function() {
        $elem.css({
            'z-index': window.Z_INDEX_TRANSITION,
            display: 'block'
        });

        curtain.animate({
            path: 'm 40,-80 190,0 -305,290 C -100,140 0,0 40,-80 z'
        }, 700, mina.easeout, function() {
            PubSub.publish('/tamm/section/show', [], this);
        });
    };

    this.hide = function() {
        curtain.animate({
            path: 'm 75,-80 155,0 0,225 C 90,85 100,30 75,-80 z'
        }, 700, mina.easein, function() {
            $elem.removeAttr('style');
        });
    };

    init();
}

Transition.getInstance = function() {
    // summary:
    //      Gets an instance of the singleton. It is better to use
    if(instance === null) {
        instance = new Transition();
    }
    return instance;
};

export default Transition.getInstance();
