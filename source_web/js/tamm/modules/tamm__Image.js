/*
 * Image
 * This file contains the image handling for site
 *
 * Author
 * Markus Bergh
 * 2014
 */

define([
		'jquery',
	],

    function($) {

    	var TAMMImage = function() {

    		var resizeHandler = function(callback) {

    			var $obj = $('.app-slider');
				var $imgs = $obj.find("img");

				$imgs.each(function(){

					var $img = $(this);

					var $container = $img.parent();

					var imageAspect = 1.5;
					var containerW = $container.width();
			        var containerH = $container.height();
			        var containerAspect = containerW/containerH;

			        if(containerAspect < imageAspect) {
			        	$img.css({
			            	width: 'auto',
							height: containerH,
							top:0,
							left:-(containerH*imageAspect-containerW)/2
			            });
			        } else {
			        	$img.css({
			            	width: containerW,
							height: 'auto',
							top:-(containerW/imageAspect-containerH)/2,
							left:0
			            });
			        }

				});

				if(typeof callback == 'function') {
					callback();
				}
    		};

    		this.initialize = function() { };

    		this.resizeHandler = function(callback) {
    			resizeHandler(callback);
    		};

    	};

    	return TAMMImage;

    }
);