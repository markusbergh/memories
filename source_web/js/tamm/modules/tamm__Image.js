/*
 * T A M M - Image
 * This file contains the image handling
 *
 * Author
 * Markus Bergh
 * 2014
 */

define([
    'jquery',
    'tamm/utils/tamm__PubSub',
    'tamm/modules/tamm__Preloader'
  ],

    function($, PubSub, CorePreloader) {

      var TAMMImage = function() {

            var request,
                image,
                self = this,
                transitionEnd = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend',
                corePreloader = new CorePreloader('', {}).init();

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
                  // SHow preloader
                  PubSub.publish('/tamm/preloader/show');
              };

              this.onProgress = function(e) {
                  // Calculation
                  var percentage = e.loaded / e.total;
                  var frameWidth = $(window).width();

                  // Update progress
                  PubSub.publish('/tamm/preloader/progress', [frameWidth * percentage], this);
              };

              this.onLoad = function() {
                  image = new Image();
                  image.src = "data:image/jpeg;base64," + self.base64Encode(request.responseText);
              };

              this.onLoadEnded = function() {
                  // Hide preloader
                  PubSub.publish('/tamm/preloader/hide', [image], this);
              };

              this.initialize = function() { };

      };

      return TAMMImage;

    }
);