/*
* TAMM - Section
* This file contains the section container for subpages
*
* Usage: var section = new Section(elem, {});
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

/*
* Constructor
*/
var Section = function(elem, options) {
    this.elem = elem;
    this.$elem = $(elem);
    this.options = options;
};

/*
* Prototype
*/
Section.prototype = {
    defaults: {
        $app: $('main'),
        $section: $('<div />'),
        $section_content_wrapper: $('<div />'),
        $section_content: $('<div />'),
        $section_data: null,
        $section_preloader: $('<div />'),
        $section_preloader_progress: $('<div />')
    },

    init: function() {
        var self = this;

        // Introduce defaults that can be extended either globally or using an object literal.
        this.config = $.extend({}, this.defaults, this.options, this.metadata);

        self.create();

        return self;
    },

    create: function() {
        var self = this;

        self.config.$section_content_wrapper = $('<div />');
        self.config.$section_content = $('<div />');

        self.config.$app.append(
            self.config.$section.empty().append(
                self.config.$section_content_wrapper
            ).addClass('section').css({
                opacity: 0,
                'z-index': window.Z_INDEX_SECTION
            })
        );

        var callback;

        switch(self.config.section) {
        case 'about':
            self.config.$section_data = new About();

            callback = function(data) {
                self.onSectionReady(data);
            };

            self.config.$section_content_wrapper.addClass('about');
            self.config.$section_content.addClass('about');
            break;
        case 'archive':
            self.config.$section_data = new Archive();

            callback = function(data) {
                self.onSectionReady(data);
            };

            // Create preloader for archive
            self.config.$section_content_wrapper.append(
                self.config.$section_preloader.append(
                    self.config.$section_preloader_progress.css({
                        width: 0
                    }).addClass('archive-preloader-progress')
                ).addClass('archive-preloader')
            );

            // Listen for event
            PubSub.subscribe('/tamm/archive/load', function(progress) {
                self.config.$section_preloader.addClass('running');
            });

            // Set progress of loading archive
            PubSub.subscribe('/tamm/archive/progress', function(progress) {
                self.config.$section_preloader_progress.css({
                    width: progress
                });
            });

            // When archive is loaded and ready
            PubSub.subscribe('/tamm/archive/loaded', function() {
                self.config.$section_preloader.css({
                    width: '100%'
                }).transition({
                    opacity: 0
                }, 600, function() {
                    self.config.$section_preloader.remove();
                });
            });

            self.config.$section_content_wrapper.addClass('archive');
            self.config.$section_content.addClass('archive');
            break;
        case 'contact':
            self.config.$section_data = new Contact();

            callback = function(data) {
                self.onSectionReady(data);
            };

            self.config.$section_content_wrapper.addClass('contact');
            self.config.$section_content.addClass('contact');
            break;
        }

        self.config.$section_data.create(callback);

        return self;
    },

    onSectionReady: function(data) {
        var self = this;

        self.config.$section_content_wrapper.append(
            self.config.$section_content.empty().append(
                data
            ).addClass('section-content')
        ).addClass('section-content-wrapper');

        return self;
    },

    show: function() {
        var self = this;

        self.config.$section.transition({
            opacity: 1
        }, 700);

        if(self.config.$section_data.show) {
            self.config.$section_data.show();
        }

        return self;
    },

    hide: function() {
        var self = this;

        self.config.$section.transition({
            opacity: 0
        }, 700, function() {
            PubSub.publish('/tamm/transition/hide');
            self.destroy();
        });

        return self;
    },

    destroy: function() {
        var self = this;

        self.config.$section.remove();

        return self;
    }
};

/*
* Defaults
*/
Section.defaults = Section.prototype.defaults;

$.fn.Section = function(options) {
    return this.each(function() {
        new Section(this, options).init();
    });
};

export default Section;
