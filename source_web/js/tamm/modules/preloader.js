/**
 * Preloader
 * This file contains the preloader for images
 *
 * Author
 * Markus Bergh, 2016
 */

import $ from 'jquery';
import 'jquery.transit';

import PubSub from 'tamm/utils/pubsub';

const $progress = $('.progress'),
      $preloader = $('.preloader-wrapper');

let Preloader = function() {
    function init() {
        addEvents();
    }

    function addEvents() {
        addCustomEvents();
    }

    function addCustomEvents() {
        PubSub.subscribe('/tamm/preloader/show', function() {
            show();
        });

        PubSub.subscribe('/tamm/preloader/progress', function(data) {
            progress(data);
        });

        PubSub.subscribe('/tamm/preloader/hide', function(imageLoaded) {
            hide(imageLoaded);
        });
    }

    function progress(current_progress) {
        $progress.css({
            width: current_progress
        }).addClass('running');
    }

    function hide(imageLoaded) {
        $progress.transition({
            width: '100%'
        }, 300, function() {
            hidePreloaderComplete(imageLoaded);
        }).removeClass('running');
    }

    function hidePreloaderComplete(imageLoaded) {
        $preloader.addClass('hidden');

        $progress.css({
            width: 0
        });

        PubSub.publish('/tamm/image/loaded', [imageLoaded]);
    }

    function show() {
        $preloader.removeClass('hidden');

        $progress.css({
            width: 0
        });
    }

    init();
};

export default Preloader;
