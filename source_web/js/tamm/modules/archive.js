/**
 * Archive
 * This file contains grid for archive
 *
 * Author
 * Markus Bergh, 2016
 */

import $ from 'jquery';
import Masonry from 'masonry-layout';
import 'jquery.transit';

import PubSub from 'tamm/utils/pubsub';

let Archive = function() {
    let $grid = $('<div />'),
        $grid_item,
        $content,
        loaded_images = 0,
        total_images,
        on_ready,
        self = this;

    function init() {
        addEvents();
    }

    function addEvents() {
        addCustomEvents();
    }

    function addCustomEvents() {
        PubSub.subscribe('/tamm/archive/hide', function() {
            self.hide();
        });
    }

    function load(callback) {
        $.getJSON('/data/memories.json', function(data) {
            callback(data);
        });
    }

    function handleImageLoaded() {
        loaded_images++;

        let percentage = loaded_images / total_images;

        PubSub.publish('/tamm/archive/progress', [
            percentage * $(window).width()
        ], this);

        if(loaded_images === total_images) {
            $content = $grid;

            if(typeof on_ready === 'function') {
                on_ready($content);
            }

            PubSub.publish('/tamm/archive/loaded');

            new Masonry($grid[0], {
                itemSelector: '.archive-item'
            });
        }
    }

    function handleGridItemClick(ev) {
        ev.preventDefault();

        let index = $(this).index(),
            data = {};

        $.each($grid.find('a'), function(i, elem) {
            let $item = $(elem);

            if(i !== index) {
                $item.transition({
                    opacity: 0.75
                }, 300);
            }
        });

        data.id = $(this).data('id') - 1;
        data.target = $(this);

        // Load image
        PubSub.publish('/tamm/archive/image/load', [data], this);
    }

    function createGridItem(item, index) {
        let thumbnail = item.thumbnail,
            image = new Image();

        $grid_item = $('<a />');
        $grid_item.data('id', total_images - index);
        $grid_item.attr('href', '#');

        // Initial appearance
        $grid.append(
            $grid_item.css({
                opacity: 0,
                perspective: 800,
                rotateX: 25
            }).addClass('archive-item')
        ).addClass('archive-wrapper');

        // Click event
        $grid_item.on('click', handleGridItemClick);

        // Add image to grid item
        $grid_item.append(
            image
        );

        // Handle image loaded
        image.onload = handleImageLoaded;
        image.src = thumbnail;
    }

    this.create = function(callback) {
        load(function(data) {
            total_images = data.length;

            // Save callback
            on_ready = callback;

            // Create grid
            $grid = $('<div />');

            // Send load event
            PubSub.publish('/tamm/archive/load');

            // For each grid item
            for(let index in data) {
                if({}.hasOwnProperty.call(data, index)) {
                    let item = data[index];
                    createGridItem(item, index);
                }
            }
        });
    };

    this.show = function() {
        let delay = 0;

        $.each($grid.children(), function(i, elem) {
            $(elem).transition({
                opacity: 1,
                rotateX: 0
            }, delay * 0);

            delay++;
        });
    };

    this.hide = function() {
        PubSub.publish('/tamm/navigation/reset');
        PubSub.publish('/tamm/section/hide');
    };

    init();
};

export default Archive;
