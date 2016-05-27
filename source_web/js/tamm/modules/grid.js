/**
 * Grid
 * This file contains the grid for archive
 *
 * Author
 * Markus Bergh, 2016
 */

import $ from 'jquery';
import 'jquery.transit';

import PubSub from 'tamm/utils/pubsub';

let total_images = 0,
    loaded_images = null,
    $header = $('.header'),
    $current_grid_item = null,
    $current_slider_image = null,
    $current_slider_image_wrapper = null,
    $grid = null,
    $grid_text = null,
    $grid_container = null,
    $grid_left_column = null,
    $grid_right_column = null;

const PATH_DATA = '/data/memories.json',
      EVENTS = {
          LOAD: '/tamm/grid/load'
      },
      $main = $('main');

let Grid = function() {
    function init() {
        setupEvents();
    }

    init();
};

function setupEvents() {
    PubSub.subscribe(EVENTS.LOAD, handleGridLoad);
}

function handleGridLoad() {
    $('body').css('cursor', 'progress');

    $grid = $('<div />');
    $grid_text = $('<div />');
    $grid_container = $('<div />');
    $grid_left_column = $('<div />');
    $grid_right_column = $('<div />');

    $.getJSON(PATH_DATA, handleGridLoadComplete);
}

function handleGridLoadComplete(data) {
    // Add containers
    addGridContent();

    // Invert colors
    $header.addClass('inverted');

    // Get current image
    $current_slider_image_wrapper = $('.app-slider-image-wrapper');
    $current_slider_image = $('.app-slider-image img');

    // Reset load count
    loaded_images = 0;

    // Reverse content
    data.reverse();

    // Get photo index from url
    let url = document.URL,
        current_index = url.split('/').pop() - 1;

    total_images = data.length;

    for(let index in data) {
        if(data.hasOwnProperty(index)) {
            let item = data[index],
                num_index = parseInt(index, 10);

            createGridItem(item, num_index, current_index);
        }
    }
}

function addGridContent() {
    $grid_container.addClass('grid-container');
    $grid.addClass('grid');

    let $title = $('<h2 />').text('These are my memories'),
        $description = $(`<p>This is where you can see what I see, and what I capture
                             as a moment in my life. Beautiful thrilling moments.
                             And these are my memories.</p>
                             <p>Enjoy.</p>`);

    $grid_container.append(
        $grid_text.append(
            $title,
            $description
        ).addClass('grid-text'),
        $grid.append(
            $grid_left_column.addClass('grid-column grid-column--left'),
            $grid_right_column.addClass('grid-column grid-column--right')
        )
    );

    $main.append($grid_container);
}

function handleGridItemClick(ev) {
    ev.preventDefault();

    $('body').css('cursor', 'progress');

    let $current_grid_item = $(this);

    // Invert colors
    $header.removeClass('inverted');

    PubSub.publish('/tamm/grid/image/load', [{
        id: $current_grid_item.data('id'),
        target: $current_grid_item
    }]);
}

function createGridItem(item, index, current_index) {
    let thumbnail = item.image_medium,
        $grid_item = $('<a />');

    $grid_item.addClass('grid-item');
    $grid_item.attr('href', '#');
    $grid_item.data('id', index);
    $grid_item.on('click', handleGridItemClick);

    if(index % 2 === 0) {
        $grid_left_column.append($grid_item);
    } else {
        $grid_right_column.append($grid_item);
    }

    createGridItemImage($grid_item, index, current_index, thumbnail);
}

function createGridItemImage($grid_item, index, current_index, thumbnail) {
    let image = new Image();

    if(index !== current_index) {
        $grid_item.append(image);
    }

    image.onload = function() {
        loaded_images++;

        if(loaded_images === total_images) {
            $current_grid_item = $grid.find('a:empty');

            if(!isVisibleInView($current_grid_item[0])) {
                scrollToGridItem();
            }

            animateCurrentFullscreenImage();
        }
    };

    image.src = thumbnail;
}

function scrollToGridItem() {
    $(window).scrollTop(
        $current_grid_item.offset().top -
        $current_grid_item.height() / 2
    );
}

function animateCurrentFullscreenImage() {
    $current_slider_image.transition({
        top: 0,
        left: 0,
        x: $current_grid_item.offset().left,
        y: $current_grid_item.offset().top - $(window).scrollTop(),
        width: $current_grid_item.width(),
        height: $current_grid_item.height()
    }, 800, 'easeInOutQuint', function() {
        $('body').css('cursor', 'default');

        $current_slider_image.removeAttr('style');
        $current_grid_item.append($current_slider_image);

        $current_slider_image_wrapper.css({
            display: 'none'
        });
    });
}

function isVisibleInView(elem) {
    let $elem = $(elem),
        $window = $(window),
        doc_view_top = $window.scrollTop(),
        doc_view_bottom = doc_view_top + $window.height(),
        elemTop = $elem.offset().top,
        elemBottom = elemTop + $elem.height();

    return elemBottom <= doc_view_bottom && elemTop >= doc_view_top;
}

export default Grid;
