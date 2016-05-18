/**
 * Contact
 * This file contains the contact section
 *
 * Author
 * Markus Bergh, 2016
 */

import $ from 'jquery';
import 'jquery.transit';

let Contact = function() {
    let $content = $('<ul />'),
        items = [
            {
                link: 'mailto:hi@markusbergh.se',
                label: 'Mail'
            },
            {
                link: 'http://se.linkedin.com/in/markusbergh',
                label: 'LinkedIn'
            },
            {
                link: 'http://twitter.com/markusbergh/',
                label: 'Twitter'
            },
            {
                link: 'http://instagram.com/markusbergh/',
                label: 'Instagram'
            }
        ];

    this.create = function(callback) {
        $content.empty();

        for(let index in items) {
            if({}.hasOwnProperty.call(items, index)) {
                let item = items[index];

                $content.append(
                    $(`<li>
                           <a href="${item.link}" target="_blank">
                               ${item.label}
                           </a>
                       </li>`)
                );
            }
        }

        if(typeof callback === 'function') {
            callback($content);
        }
    };
};

export default Contact;
