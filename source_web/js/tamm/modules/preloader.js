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

let $preloader = $('.preloader-wrapper'),
    max_width_text = 0,
    $preloader_text = null;

let Preloader = function() {
    let $progress = $('.progress');

    this.max_width_text = max_width_text;
    this.$preloader = $preloader;
    this.$preloader_text = $preloader_text;

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
        if(max_width_text) {
            let perentage = current_progress / $(window).width();

            $preloader_text.find('.preloader-text-item-secondary').css({
                width: perentage * max_width_text
            });
        } else {
            $progress.css({
                width: current_progress
            }).addClass('running');
        }
    }

    function hide(imageLoaded) {
        if(!max_width_text) {
            $progress.transition({
                width: '100%'
            }, 300, () => {
                $preloader.addClass('hidden');

                $progress.css({
                    width: 0
                });

                PubSub.publish('/tamm/image/loaded', [imageLoaded], self);
            }).removeClass('running');
        } else {
            $preloader_text.transition({
                width: max_width_text
            }, 300, () => {
                $preloader.addClass('hidden');

                PubSub.publish('/tamm/image/loaded', [imageLoaded], self);
            });
        }
    }

    function show() {
        $preloader_text = $('.preloader-text');
        max_width_text = $preloader_text.width();

        $preloader.removeClass('hidden');

        if(!max_width_text) {
            $progress.css({
                width: 0
            });
        }
    }

    init();
};

export default Preloader;
