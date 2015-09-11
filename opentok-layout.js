/*!
 *  opentok-layout-js (http://github.com/aullman/opentok-layout-js)
 *
 *  Automatic layout of video elements (publisher and subscriber) minimising
 *  white-space for the OpenTok on WebRTC API.
 *
 *  @Author: Adam Ullman (http://github.com/aullman)
 *  @Copyright (c) 2014 Adam Ullman
 *  @License: Released under the MIT license (http://opensource.org/licenses/MIT)
**/

// TODO: don't rely on internal OT.$ API.
// in CommonJS context, this should be a `require()`d dependency.
// in browser globals context, ...? (when using bower, there are dependencies that it has handled
// for you, so these might be safe to assume)

/*globals jQuery */
if (typeof module === 'undefined' || typeof module.exports === 'undefined') {
  exports = window;
}

(function($) {
    var positionElement = function positionElement(elem, x, y, width, height, animate) {
        var targetPosition = {
            left: x + 'px',
            top: y + 'px',
            width: width + 'px',
            height: height + 'px'
        };

        var fixAspectRatio = function () {
            var sub = elem.querySelector('.OT_root');
            if (sub) {
                // If this is the parent of a subscriber or publisher then we need
                // to force the mutation observer on the publisher or subscriber to
                // trigger to get it to fix it's layout
                var oldWidth = sub.style.width;
                sub.style.width = width + 'px';
                // sub.style.height = height + 'px';
                sub.style.width = oldWidth || '';
            }
        };

        if (animate && $) {
            console.log('animate');
            $(elem).stop();
            $(elem).animate(targetPosition, animate.duration || 200, animate.easing || 'swing',
              function () {
                fixAspectRatio();
                if (animate.complete) animate.complete.call(this);
            });
        } else {
            elem.style.left = targetPosition.left;
            elem.style.top = targetPosition.top;
            elem.style.width = targetPosition.width;
            elem.style.height = targetPosition.height;
        }
        fixAspectRatio();
    };

    var getCSSNumber = function (elem, prop) {
        var cssStr = window.getComputedStyle(elem)[prop];
        return cssStr ? parseInt(cssStr, 10) : 0;
    };

    // Really cheap UUID function
    var cheapUUID = function() {
      return (Math.random() * 100000000).toFixed(0);
    };

    var getHeight = function (elem) {
      return elem.clientHeight;
    };

    var getWidth = function (elem) {
        return elem.clientWidth;
    };

    // Use default values if it is not already set in val
    var defaults = function (val, def) {
      var res = {},
        key;
      for (key in val) {
        if (val.hasOwnProperty(key)) {
          res[key] = val[key];
        }
      }
      for (key in def) {
        if (def.hasOwnProperty(key) && !res.hasOwnProperty(key)) {
          res[key] = def[key];
        }
      }
      return res;
    };

    var getBestDimensions = function getBestDimensions(minRatio, maxRatio, count, Width, Height) {
        var maxArea,
            targetCols,
            targetRows,
            targetHeight,
            targetWidth,
            tWidth,
            tHeight;

        // Iterate through every possible combination of rows and columns
        // and see which one has the least amount of whitespace
        for (var i=1; i <= count; i++) {
            var cols = i;
            var rows = Math.ceil(count / cols);

            // Try taking up the whole height and width
            tHeight = Math.floor( Height/rows );
            tWidth = Math.floor(Width/cols);

            var tRatio = tHeight/tWidth;
            if (tRatio > maxRatio) {
                // We went over decrease the height
                tRatio = maxRatio;
                tHeight = tWidth * tRatio;
            } else if (tRatio < minRatio) {
                // We went under decrease the width
                tRatio = minRatio;
                tWidth = tHeight / tRatio;
            }

            var area = (tWidth*tHeight) * count;

            // If this width and height takes up the most space then we're going with that
            if (maxArea === undefined || (area > maxArea)) {
                maxArea = area;
                targetHeight = tHeight;
                targetWidth = tWidth;
                targetCols = cols;
                targetRows = rows;
            }
        }
        return {
            maxArea: maxArea,
            targetCols: targetCols,
            targetRows: targetRows,
            targetHeight: targetHeight,
            targetWidth: targetWidth
        };
    };

    var getVidRatio = function (video) {
      if (video && video.videoHeight && video.videoWidth) {
          return video.videoHeight/video.videoWidth;
      }
      return 3/4;   // Use the default video ratio
    };

    var arrange = function arrange(children, Width, Height, offsetLeft, offsetTop, fixedRatio,
      minRatio, maxRatio, animate) {
        var count = children.length;

        if (fixedRatio) {
            // Use the ratio of the first video element we find
            var video = children.length > 0 && children[0].querySelector('video');
            minRatio = maxRatio = getVidRatio(video);
        }
        var dimensions = getBestDimensions(minRatio, maxRatio, count, Width, Height);

        var spacesInLastRow = (dimensions.targetRows * dimensions.targetCols) - count,
            lastRowMargin = (spacesInLastRow * dimensions.targetWidth / 2),
            lastRowIndex = (dimensions.targetRows - 1) * dimensions.targetCols,
            firstRowMarginTop = ((Height - (dimensions.targetRows * dimensions.targetHeight)) / 2),
            firstColMarginLeft = ((Width - (dimensions.targetCols * dimensions.targetWidth)) / 2);

        // Loop through each stream in the container and place it inside
        var x = 0,
            y = 0;
        for (var i=0; i < children.length; i++) {
            var elem = children[i];
            if (i % dimensions.targetCols === 0) {
                // We are the first element of the row
                x = firstColMarginLeft;
                if (i === lastRowIndex) x += lastRowMargin;
                y += i === 0 ? firstRowMarginTop : dimensions.targetHeight;
            } else {
                x += dimensions.targetWidth;
            }

            elem.style.position = 'absolute';
            var actualWidth = dimensions.targetWidth - getCSSNumber(elem, 'paddingLeft') -
                            getCSSNumber(elem, 'paddingRight') -
                            getCSSNumber(elem, 'marginLeft') -
                            getCSSNumber(elem, 'marginRight') -
                            getCSSNumber(elem, 'borderLeft') -
                            getCSSNumber(elem, 'borderRight');

             var actualHeight = dimensions.targetHeight - getCSSNumber(elem, 'paddingTop') -
                            getCSSNumber(elem, 'paddingBottom') -
                            getCSSNumber(elem, 'marginTop') -
                            getCSSNumber(elem, 'marginBottom') -
                            getCSSNumber(elem, 'borderTop') -
                            getCSSNumber(elem, 'borderBottom');

            positionElement(elem, x+offsetLeft, y+offsetTop, actualWidth, actualHeight, animate);
        }
    };

    var isDisplayed = function (element) {
        return window.getComputedStyle(element).display !== 'none';
    };

    var layout = function layout(container, opts) {
        if (!isDisplayed(container)) {
          return;
        }
        var id = container.getAttribute('id');
        if (!id) {
            id = 'OT_' + cheapUUID();
            container.setAttribute('id', id);
        }

        var Height = getHeight(container) -
                    getCSSNumber(container, 'borderTop') -
                    getCSSNumber(container, 'borderBottom'),
            Width = getWidth(container) -
                    getCSSNumber(container, 'borderLeft') -
                    getCSSNumber(container, 'borderRight'),
            availableRatio = Height/Width,
            offsetLeft = 0,
            offsetTop = 0,
            bigOffsetTop = 0,
            bigOffsetLeft = 0,
            bigRatio,
            bigOnes = Array.prototype.filter.call(
                container.querySelectorAll('#' + id + '>.' + opts.bigClass),
                isDisplayed),
            smallOnes = Array.prototype.filter.call(
                container.querySelectorAll('#' + id + '>*:not(.' + opts.bigClass + ')'),
                isDisplayed);

        if (bigOnes.length > 0 && smallOnes.length > 0) {
            var bigVideo = bigOnes[0].querySelector('video');
            bigRatio = getVidRatio(bigVideo);
            var bigWidth, bigHeight;

            if (availableRatio > bigRatio) {
                // We are tall, going to take up the whole width and arrange
                // small guys at the bottom
                bigWidth = Width;
                bigHeight = Math.min(Math.floor(Height * opts.bigPercentage), Width * bigRatio);
                offsetTop = bigHeight;
                bigOffsetTop = Height - offsetTop;
            } else {
                // We are wide, going to take up the whole height and arrange the small guys
                // on the right
                bigHeight = Height;
                bigWidth = Math.min(Width * opts.bigPercentage, Math.floor(bigHeight / bigRatio));
                offsetLeft = bigWidth;
                bigOffsetLeft = Width - offsetLeft;
            }
            if (opts.bigFirst) {
              arrange(bigOnes, bigWidth, bigHeight, 0, 0, opts.bigFixedRatio, opts.bigMinRatio,
                opts.bigMaxRatio, opts.animate);
              arrange(smallOnes, Width - offsetLeft, Height - offsetTop, offsetLeft, offsetTop,
                opts.fixedRatio, opts.minRatio, opts.maxRatio, opts.animate);
            } else {
              arrange(smallOnes, Width - offsetLeft, Height - offsetTop, 0, 0, opts.fixedRatio,
                opts.minRatio, opts.maxRatio, opts.animate);
              arrange(bigOnes, bigWidth, bigHeight, bigOffsetLeft, bigOffsetTop, opts.bigFixedRatio,
                opts.bigMinRatio, opts.bigMaxRatio, opts.animate);
            }
        } else if (bigOnes.length > 0 && smallOnes.length === 0) {
            // We only have one bigOne just center it
            arrange(bigOnes, Width, Height, 0, 0, opts.bigFixedRatio, opts.bigMinRatio,
              opts.bigMaxRatio, opts.animate);
        } else {
            arrange(smallOnes, Width - offsetLeft, Height - offsetTop, offsetLeft, offsetTop,
              opts.fixedRatio, opts.minRatio, opts.maxRatio, opts.animate);
        }
    };

    exports.initLayoutContainer = function(container, opts) {
        opts = defaults(opts || {}, {
            maxRatio: 3/2,
            minRatio: 9/16,
            fixedRatio: false,
            animate: false,
            bigClass: 'OT_big',
            bigPercentage: 0.8,
            bigFixedRatio: false,
            bigMaxRatio: 3/2,
            bigMinRatio: 9/16,
            bigFirst: true
        });
        container = typeof(container) === 'string' ? document.querySelector(container) : container;

        layout(container, opts);

        return {
            layout: layout.bind(null, container, opts)
        };
    };

})(window.hasOwnProperty('jQuery') ? jQuery : undefined);
