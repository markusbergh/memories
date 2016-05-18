/**
 * About
 * This file contains the about section
 *
 * Author
 * Markus Bergh, 2016
 */

import $ from 'jquery';
import 'jquery.transit';

let About = function() {
    let $title,
        $description,
        $content;

    this.create = function(callback) {
        $title = $('<h2 />').text('These are my memories');
        $description = $(`<p>This is where you can see what I see, and what I capture
                             as a moment in my life. Beautiful thrilling moments.
                             And these are my memories.</p>
                             <p>Enjoy.</p>`);

        $content = $title.add($description);

        if(typeof callback === 'function') {
            callback($content);
        }
    };
};

export default About;
