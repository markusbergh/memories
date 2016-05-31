/**
 * Image
 * This file contains the image handling
 *
 * Author
 * Markus Bergh, 2016
 */

import $ from 'jquery';

import PubSub from 'tamm/utils/pubsub';
import Preloader from 'tamm/modules/preloader';

const EVENTS = {
    SHOW: '/tamm/preloader/show',
    HIDE: '/tamm/preloader/hide',
    PROGRESS: '/tamm/preloader/progress'
};

let SlideImage = function() {
    let request,
        image,
        target,
        preloader = new Preloader();

    function base64Encode(inputStr) {
        let b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
            outputStr = '',
            i = 0;

        while(i < inputStr.length) {
            // All three "& 0xff" added below are there to fix a known bug
            // With bytes returned by xhr.responseText
            let byte1 = inputStr.charCodeAt(i++) & 0xff,
                byte2 = inputStr.charCodeAt(i++) & 0xff,
                byte3 = inputStr.charCodeAt(i++) & 0xff,
                enc1 = byte1 >> 2,
                enc2 = (byte1 & 3) << 4 | byte2 >> 4,
                enc3,
                enc4;

            if (isNaN(byte2)) {
                enc3 = enc4 = 64;
            } else {
                enc3 = (byte2 & 15) << 2 | byte3 >> 6;
                if (isNaN(byte3)) {
                    enc4 = 64;
                } else {
                    enc4 = byte3 & 63;
                }
            }

            outputStr = outputStr + (b64.charAt(enc1) + b64.charAt(enc2) +
                                     b64.charAt(enc3) + b64.charAt(enc4));
        }

        return outputStr;
    }

    function onStart() {
        PubSub.publish(EVENTS.SHOW);
    }

    function onProgress(e) {
        let percentage = e.loaded / e.total,
            frameWidth = target ? target.width() : $(window).width();

        PubSub.publish(EVENTS.PROGRESS, [frameWidth * percentage], this);
    }

    function onLoadEnded() {
        PubSub.publish(EVENTS.HIDE, [image], this);
    }

    this.onLoad = function() {
        image = new Image();
        image.src = 'data:image/jpeg;base64,' + base64Encode(request.responseText);
    };

    this.load = function(imageURI) {
        request = new XMLHttpRequest();
        request.onloadstart = onStart;
        request.onprogress = onProgress;
        request.onload = this.onLoad;
        request.onloadend = onLoadEnded;

        request.open('GET', imageURI, true);
        request.overrideMimeType('text/plain; charset=x-user-defined');
        request.send(null);
    };
};

export default SlideImage;
