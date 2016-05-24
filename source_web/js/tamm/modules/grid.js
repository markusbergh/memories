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
    loaded_images = 0,
    $current_grid_item = null,
    $current_slider_image = null,
    $current_slider_image_wrapper = null;

const PATH_DATA = '/data/memories.json',
      EVENTS = {
          LOAD: '/tamm/grid/load'
      },
      $grid = $('<div />'),
      $grid_container = $('<div />'),
      $grid_left_column = $('<div />'),
      $grid_right_column = $('<div />'),
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
    $.getJSON(PATH_DATA, handleGridLoadComplete);
}

function handleGridLoadComplete(data) {
    addGridContent();

    // Get current image
    $current_slider_image_wrapper = $('.app-slider-image');
    $current_slider_image = $('.app-slider-image img');

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

function handleGridItemClick(ev) {
    ev.preventDefault();

    let $current_grid_item = $(this);

    $current_grid_item.css({
        position: 'absolute'
    }).transition({
        width: '100%',
        height: '100%'
    }, 800, 'easeInOutQuint');
}

function createGridItem(item, index, current_index) {
    let thumbnail = item.image_medium,
        $grid_item = $('<a />');

    $grid_item.addClass('grid-item');
    $grid_item.attr('href', '#');
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
        $current_slider_image.removeAttr('style');
        $current_grid_item.append($current_slider_image);

        $grid_container.css({
            zIndex: 99
        });
    });
}

function addGridContent() {
    $grid_container.addClass('grid-container');
    $grid.addClass('grid');

    $grid_container.append(
        $grid.append(
            $grid_left_column.addClass('grid-column grid-column--left'),
            $grid_right_column.addClass('grid-column grid-column--right')
        )
    );

    $main.append($grid_container);
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