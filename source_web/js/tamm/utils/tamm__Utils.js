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

    // If transitions are not support we fallback, if wanted, to JavaScript animations
    $.fn.supportTransition = function () {
        var b = document.body || document.documentElement,
        s = b.style,
        p = 'transition',
        v = '';
        if(typeof s[p] == 'string') {
            return true;
        }

        // Tests for vendor specific prop
        v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
        p = p.charAt(0).toUpperCase() + p.substr(1);

        for(var i=0; i<v.length; i++) {
            if(typeof s[v[i] + p] == 'string') { return true; }
        }

        return false;
    };

    /* http://jsfiddle.net/Skateside/5dKc7/5/ */
    $.fn.supportCss = function(selector) {
        var doc = document,
            el = doc.createElement('style'),
            supported = false,
            theRules;

        // IE seems to need a type to recognise a stylesheet.
        el.type = 'text\/css';

        // This ASSUMES that IE will always give stylesheets a styleSheet method.
        // Watch this space for errors.
        if (el.styleSheet) {
            el.styleSheet.cssText = selector + '{}';
            // May as well save some typing.
            if(el.styleSheet.cssRules) {
                theRules = el.styleSheet.cssRules;
            } else {
                //Need to try/catch here since IE6 + 7 throws an error
                try{
                    theRules = el.styleSheet.rules;
                } catch(e) {
                    //Since I can't check rules I will say unsupported since that safest
                    //Don't do anything unsafe like apply crazy conflicting styling when not supported!
                    return supported;
                }
            }

            // IE7 and 8 map '::before' to ':before' so we can't simply
            // check that our selector is the same as the returned one.
            // The selectorText of any unrecognised selector is 'UNKNOWN' and
            // unrecognised Pseudo-elements come back as ':unknown', so we can
            // check for that.
            if(theRules) {
                supported = (theRules && theRules[0] && theRules[0].selectorText && theRules[0].selectorText.toLowerCase().indexOf('unknown') < 0);
            }
        } else {
            // Standards-based browsers need the stylesheet to be appended to the
            // DOM, but they will allow us to simply give the style tag some text.
            el.appendChild(doc.createTextNode(selector + '{}'));
            doc.body.appendChild(el);
            supported = !!el.sheet.cssRules.length;
            doc.body.removeChild(el);
        }

        // Clean up after ourselves and give us the results.
        el = null;
        return supported;
    };

    /*
     * Use CSS 'transform' with jQuery
     * https://github.com/zachstronaut/jquery-css-transform/blob/master/jquery-css-transform.js
     */
    (function ($) {
        // Monkey patch jQuery 1.3.1+ css() method to support CSS 'transform'
        // property uniformly across Safari/Chrome/Webkit, Firefox 3.5+, IE 9+, and Opera 11+.
        // 2009-2011 Zachary Johnson www.zachstronaut.com
        // Updated 2011.05.04 (May the fourth be with you!)
        function getTransformProperty(element)
        {
            // Try transform first for forward compatibility
            // In some versions of IE9, it is critical for msTransform to be in
            // this list before MozTranform.
            var properties = ['transform', 'WebkitTransform', 'msTransform', 'MozTransform', 'OTransform'];
            var p;
            while (p = properties.shift())
            {
                if (typeof element.style[p] != 'undefined')
                {
                    return p;
                }
            }

            // Default to transform also
            return 'transform';
        }

        var _propsObj = null;

        var proxied = $.fn.css;
        $.fn.css = function (arg, val)
        {
            // Temporary solution for current 1.6.x incompatibility, while
            // preserving 1.3.x compatibility, until I can rewrite using CSS Hooks
            if (_propsObj === null)
            {
                if (typeof $.cssProps != 'undefined')
                {
                    _propsObj = $.cssProps;
                }
                else if (typeof $.props != 'undefined')
                {
                    _propsObj = $.props;
                }
                else
                {
                    _propsObj = {}
                }
            }

            // Find the correct browser specific property and setup the mapping using
            // $.props which is used internally by jQuery.attr() when setting CSS
            // properties via either the css(name, value) or css(properties) method.
            // The problem with doing this once outside of css() method is that you
            // need a DOM node to find the right CSS property, and there is some risk
            // that somebody would call the css() method before body has loaded or any
            // DOM-is-ready events have fired.
            if
            (
                typeof _propsObj['transform'] == 'undefined'
                &&
                (
                    arg == 'transform'
                    ||
                    (
                        typeof arg == 'object'
                        && typeof arg['transform'] != 'undefined'
                    )
                )
            )
            {
                _propsObj['transform'] = getTransformProperty(this.get(0));
            }

            // We force the property mapping here because jQuery.attr() does
            // property mapping with jQuery.props when setting a CSS property,
            // but curCSS() does *not* do property mapping when *getting* a
            // CSS property.  (It probably should since it manually does it
            // for 'float' now anyway... but that'd require more testing.)
            //
            // But, only do the forced mapping if the correct CSS property
            // is not 'transform' and is something else.
            if (_propsObj['transform'] != 'transform')
            {
                // Call in form of css('transform' ...)
                if (arg == 'transform')
                {
                    arg = _propsObj['transform'];

                    // User wants to GET the transform CSS, and in jQuery 1.4.3
                    // calls to css() for transforms return a matrix rather than
                    // the actual string specified by the user... avoid that
                    // behavior and return the string by calling jQuery.style()
                    // directly
                    if (typeof val == 'undefined' && jQuery.style)
                    {
                        return jQuery.style(this.get(0), arg);
                    }
                }

                // Call in form of css({'transform': ...})
                else if
                (
                    typeof arg == 'object'
                    && typeof arg['transform'] != 'undefined'
                )
                {
                    arg[_propsObj['transform']] = arg['transform'];
                    delete arg['transform'];
                }
            }

            return proxied.apply(this, arguments);
        };
    })(jQuery);

    /* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
     * http://benalman.com/
     * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */

    (function($) {

        var o = $({});

        $.subscribe = function() {
            o.on.apply(o, arguments);
        };

        $.unsubscribe = function() {
            o.off.apply(o, arguments);
        };

        $.publish = function() {
            o.trigger.apply(o, arguments);
        };

    }(jQuery));

    /*
     * screenfull.js - v.1.1.1
     * https://github.com/sindresorhus/screenfull.js
     * MIT © Sindre Sorhus
     */
    (function (window, document) {
        'use strict';

        var keyboardAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element, // IE6 throws without typeof check

            fn = (function () {
                var val, valLength;
                var fnMap = [
                    [
                        'requestFullscreen',
                        'exitFullscreen',
                        'fullscreenElement',
                        'fullscreenEnabled',
                        'fullscreenchange',
                        'fullscreenerror'
                    ],
                    // new WebKit
                    [
                        'webkitRequestFullscreen',
                        'webkitExitFullscreen',
                        'webkitFullscreenElement',
                        'webkitFullscreenEnabled',
                        'webkitfullscreenchange',
                        'webkitfullscreenerror'

                    ],
                    // old WebKit (Safari 5.1)
                    [
                        'webkitRequestFullScreen',
                        'webkitCancelFullScreen',
                        'webkitCurrentFullScreenElement',
                        'webkitCancelFullScreen',
                        'webkitfullscreenchange',
                        'webkitfullscreenerror'

                    ],
                    [
                        'mozRequestFullScreen',
                        'mozCancelFullScreen',
                        'mozFullScreenElement',
                        'mozFullScreenEnabled',
                        'mozfullscreenchange',
                        'mozfullscreenerror'
                    ],
                    [
                        'msRequestFullscreen',
                        'msExitFullscreen',
                        'msFullscreenElement',
                        'msFullscreenEnabled',
                        'MSFullscreenChange',
                        'MSFullscreenError'
                    ]
                ];
                var i = 0;
                var l = fnMap.length;
                var ret = {};

                for (; i < l; i++) {
                    val = fnMap[i];
                    if (val && val[1] in document) {
                        for (i = 0, valLength = val.length; i < valLength; i++) {
                            ret[fnMap[0][i]] = val[i];
                        }
                        return ret;
                    }
                }
                return false;
            })(),

            screenfull = {
                request: function (elem) {
                    var request = fn.requestFullscreen;

                    elem = elem || document.documentElement;

                    // Work around Safari 5.1 bug: reports support for
                    // keyboard in fullscreen even though it doesn't.
                    // Browser sniffing, since the alternative with
                    // setTimeout is even worse.
                    if (/5\.1[\.\d]* Safari/.test(navigator.userAgent)) {
                        elem[request]();
                    } else {
                        elem[request](keyboardAllowed && Element.ALLOW_KEYBOARD_INPUT);
                    }
                },
                exit: function () {
                    document[fn.exitFullscreen]();
                },
                toggle: function (elem) {
                    if (this.isFullscreen) {
                        this.exit();
                    } else {
                        this.request(elem);
                    }
                },
                onchange: function () {},
                onerror: function () {},
                raw: fn
            };

        if (!fn) {
            window.screenfull = false;
            return;
        }

        Object.defineProperties(screenfull, {
            isFullscreen: {
                get: function () {
                    return !!document[fn.fullscreenElement];
                }
            },
            element: {
                enumerable: true,
                get: function () {
                    return document[fn.fullscreenElement];
                }
            },
            enabled: {
                enumerable: true,
                get: function () {
                    // Coerce to boolean in case of old WebKit
                    return !!document[fn.fullscreenEnabled];
                }
            }
        });

        document.addEventListener(fn.fullscreenchange, function (e) {
            screenfull.onchange.call(screenfull, e);
        });

        document.addEventListener(fn.fullscreenerror, function (e) {
            screenfull.onerror.call(screenfull, e);
        });

        window.screenfull = screenfull;

    })(window, document);

    /*
     * Check if element is in viewport
     */
    $.fn.isElementInViewport = function(el) {
        var rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
        );
    };

    /**
     * Debounced Resize() jQuery Plugin
     * Author: Paul Irish
     */
    (function($,sr){

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