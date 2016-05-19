$(document).ready(function() {
    var window_width = $(window).width();
    var window_height = $(window).height();
    var is_fullscreen = false;
    var initial_props = {};

    var $grid_item = $('.grid_item');
    $grid_item.on('click', handleGridItemClick);

    $(document).on('click', '.close_btn', handleCloseClick);

    function handleCloseClick(ev) {
        ev.preventDefault();

        zoomOut(ev.currentTarget);
    }

    function handleGridItemClick(ev) {
        ev.preventDefault();

        zoomIn(this);
    }

    function zoomIn(target) {
        var $target = $(target),
            $image = $(target).find('img'),
            $parent = $image.parent(),
            $clone = null,
            $clone_image = null;

        $('body').append('<div id="clone"><a href="#" class="close_btn">Close</a></div>');

        $clone = $('#clone');

        $clone.css({
            width: $parent.width(),
            height: $parent.height(),
            left: Math.floor($parent.position().left),
            top: Math.floor($parent.position().top)
        });

        initial_props = {
            width: $parent.width(),
            height: $parent.height(),
            x: Math.floor($parent.position().left),
            y: Math.floor($parent.position().top),
        };

        $clone.append(
            $image.clone()
        );

        $clone_image = $('#clone').find('img');

        var image_width = $clone.width(),
            image_height= $clone.height(),
            width_ratio = window_width / image_width,
            height_ratio = window_height / image_height,
            ratio = width_ratio;

        if (width_ratio * image_height > window_height) {
            ratio = height_ratio;
        }

        $clone.css({
            transformOrigin: '0 0'
        }).transition({
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            x: 0,
            y: 0,
        }, 1000 * 3/4, "easeInOutQuint");
    }

    function zoomOut(target) {
        var $clone = $(target).parent();

        $clone.css({
            transformOrigin: '0 0'
        }).transition({
            left: 0,
            top: 0,
            width: initial_props.width,
            height: initial_props.height,
            x: initial_props.x,
            y: initial_props.y,
        }, 1000 * 3/4, "easeInOutQuint", function() {
            $clone.remove();
        });
    }
});
