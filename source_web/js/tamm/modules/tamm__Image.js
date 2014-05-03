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
        'tamm/utils/tamm__PubSub'
  ],

    function($, PubSub) {

      var TAMMImage = function() {

            var request,
                image,
                self = this,
                transitionEnd = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend',
                $preloader = $('.preloader-wrapper'),
                $progress = $('.progress');

            var resizeHandler = function(callback) {

                var $obj = $('.app-slider'),
                    $imgs = $obj.find("img");

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

            this.base64Encode = function(inputStr) {
                 var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
                 var outputStr = "";
                 var i = 0;

                 while (i < inputStr.length) {
                     //all three "& 0xff" added below are there to fix a known bug
                     //with bytes returned by xhr.responseText
                     var byte1 = inputStr.charCodeAt(i++) & 0xff;
                     var byte2 = inputStr.charCodeAt(i++) & 0xff;
                     var byte3 = inputStr.charCodeAt(i++) & 0xff;

                     var enc1 = byte1 >> 2;
                     var enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);

                     var enc3, enc4;
                     if (isNaN(byte2)) {
                         enc3 = enc4 = 64;
                     } else {
                         enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
                         if (isNaN(byte3)) {
                             enc4 = 64;
                         } else {
                             enc4 = byte3 & 63;
                         }
                     }

                     outputStr += b64.charAt(enc1) + b64.charAt(enc2) + b64.charAt(enc3) + b64.charAt(enc4);
                  }

                  return outputStr;
              };

              this.load = function(imageURI) {
                  request = new XMLHttpRequest();
                  request.onloadstart = this.onStart;
                  request.onprogress = this.onProgress;
                  request.onload = this.onLoad;
                  request.onloadend = this.onLoadEnded;

                  request.open("GET", imageURI, true);
                  request.overrideMimeType('text/plain; charset=x-user-defined');
                  request.send(null);
              };

              this.onStart = function() {
                  $preloader.removeClass('hidden');

                  $progress.css({
                      width: 0
                  });
              };

              this.onProgress = function(e) {
                  var percentage = e.loaded / e.total;
                  var frameWidth = $(window).width();

                  $progress.css({
                      width: frameWidth * percentage
                  }).addClass('running');
              };

              this.onLoad = function() {
                  image = new Image();
                  image.src = "data:image/jpeg;base64," + self.base64Encode(request.responseText);

                  var canvas = document.createElement("canvas");
                      canvas.width = image.width;
                      canvas.height = image.height;
                      colorSum = 0;

                  var ctx = canvas.getContext("2d");
                  ctx.drawImage(image,0,0);

                  var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
                  var data = imageData.data;
                  var r,g,b,avg;

                  for(var x = 0, len = data.length; x < len; x+=4) {
                      r = data[x];
                      g = data[x+1];
                      b = data[x+2];

                      avg = Math.floor((r+g+b)/3);
                      colorSum += avg;
                  }

                  var brightness = Math.floor(colorSum / (image.width*image.height));
              };

              this.onLoadEnded = function() {
                  $progress.transition({
                      width: '100%'
                  }, 300, function() {
                      $preloader.addClass('hidden');

                      $progress.css({
                        width: 0
                      });

                      PubSub.publish('/tamm/image/loaded', [image], self);
                  }).removeClass('running');
              };

              this.initialize = function() { };

              this.resizeHandler = function(callback) {
                resizeHandler(callback);
              };

      };

      return TAMMImage;

    }
);