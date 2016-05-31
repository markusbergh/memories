/**
 * Main
 * This file contains the entry script for application
 *
 * Author
 * Markus Bergh, 2016
 */

import $ from 'jquery';
import App from 'tamm/app';

$(() => {
    // Defaults z-index
    window.Z_INDEX_TRANSITION = 499;

    // Kick in application
    App();

    // Add class for script support
    $('html').removeClass('no-js')
             .addClass('js');
});
