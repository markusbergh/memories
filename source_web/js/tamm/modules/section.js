/**
 * Section
 * This file contains the section container for subpages
 *
 * Author
 * Markus Bergh, 2016
 */

import $ from 'jquery';
import 'jquery.transit';

import PubSub from 'tamm/utils/pubsub';
import About from 'tamm/modules/about';
import Archive from 'tamm/modules/archive';
import Contact from 'tamm/modules/contact';

let $app = $('main'),
    $section = $('<div />'),
    $section_content_wrapper = $('<div />'),
    $section_content = $('<div />'),
    $section_data = null,
    $section_preloader = $('<div />'),
    $section_preloader_progress = $('<div />');

let Section = function(options) {
    let section = options.section;

    function init() {
        create();
    }

    function create() {
        let callback;

        $section_content_wrapper = $('<div />');
        $section_content = $('<div />');

        $app.append(
            $section.empty().append(
                $section_content_wrapper
            ).addClass('section').css({
                opacity: 0,
                'z-index': window.Z_INDEX_SECTION
            })
        );

        switch(section) {
            case 'about':
                $section_data = new About();

                callback = function(data) {
                    onSectionReady(data);
                };

                $section_content_wrapper.addClass('about');
                $section_content.addClass('about');
                break;
            case 'archive':
                $section_data = new Archive();

                callback = function(data) {
                    onSectionReady(data);
                };

                // Create preloader for archive
                $section_content_wrapper.append(
                    $section_preloader.append(
                        $section_preloader_progress.css({
                            width: 0
                        }).addClass('archive-preloader-progress')
                    ).addClass('archive-preloader')
                );

                // Listen for event
                PubSub.subscribe('/tamm/archive/load', function() {
                    $section_preloader.addClass('running');
                });

                // Set progress of loading archive
                PubSub.subscribe('/tamm/archive/progress', function(progress) {
                    $section_preloader_progress.css({
                        width: progress
                    });
                });

                // When archive is loaded and ready
                PubSub.subscribe('/tamm/archive/loaded', function() {
                    $section_preloader.css({
                        width: '100%'
                    }).transition({
                        opacity: 0
                    }, 600, function() {
                        $section_preloader.remove();
                    });
                });

                $section_content_wrapper.addClass('archive');
                $section_content.addClass('archive');

                break;
            case 'contact':
                $section_data = new Contact();

                callback = function(data) {
                    onSectionReady(data);
                };

                $section_content_wrapper.addClass('contact');
                $section_content.addClass('contact');
                break;
            default:
                break;
        }

        $section_data.create(callback);
    }

    function onSectionReady(data) {
        $section_content_wrapper.append(
            $section_content.empty().append(
                data
            ).addClass('section-content')
        ).addClass('section-content-wrapper');
    }

    function destroy() {
        $section.remove();
    }

    this.show = function() {
        $section.transition({
            opacity: 1
        }, 700);

        if($section_data.show) {
            $section_data.show();
        }
    };

    this.hide = function() {
        $section.transition({
            opacity: 0
        }, 700, function() {
            PubSub.publish('/tamm/transition/hide');
            destroy();
        });
    };

    init();
};

export default Section;
