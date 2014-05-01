define(['jquery'], function($) {

    // Usage: Logger.log('inside coolFunc',this,arguments);
    // http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
    window.Logger = {};
    window.Logger.log = function() {
        Logger.history = Logger.history || [];
        Logger.history.push(arguments);
        if(window.console) {
            console.log(Array.prototype.slice.call(arguments));
        }
    };

    // Portrait-to-landscape scaling bugfix
    // Original code from http://www.blog.highub.com/mobile-2/a-fix-for-iphone-viewport-scale-bug/
    // Rewritten version by @mathias, @cheeaun and @jdalton
    (function(doc) {

        var addEvent = 'addEventListener',
            type = 'gesturestart',
            qsa = 'querySelectorAll',
            scales = [1, 1],
            meta = qsa in doc ? doc[qsa]('meta[name=viewport]') : [];

        function fix() {
            meta.content = 'width=device-width,minimum-scale=' + scales[0] + ',maximum-scale=' + scales[1];
            doc.removeEventListener(type, fix, true);
        }

        if ((meta = meta[meta.length - 1]) && addEvent in doc) {
            fix();
            scales = [0.25, 1.6];
            doc[addEvent](type, fix, true);
        }

    }(document));

    /**
     * Debounced Resize() jQuery Plugin
     * Author: Paul Irish
     */
    (function($, sr){

      // debouncing function from John Hann
      // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
      var debounce = function (func, threshold, execAsap) {
          var timeout;

          return function debounced () {
              var obj = this, args = arguments;
              function delayed () {
                  if (!execAsap)
                      func.apply(obj, args);
                  timeout = null;
              };

              if (timeout)
                  clearTimeout(timeout);
              else if (execAsap)
                  func.apply(obj, args);

              timeout = setTimeout(delayed, threshold || 100);
          };
      }
      // smartresize
      jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

    })(jQuery,'smartresize');

});