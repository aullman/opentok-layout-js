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

if (typeof module === 'undefined' || typeof module.exports === 'undefined') {
  exports = window;
}

(function() {
    var getCSSNumber = function (elem, prop) {
        var cssStr = elem.style[prop];
        return cssStr ? parseInt(cssStr, 10) : 0;
    };

    // Really cheap UUID function
    var cheapUUID = function() {
      return (Math.random() * 100000000).toFixed(0);
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

    var isDisplayed = function (element) {
        return window.getComputedStyle(element).display !== 'none';
    };

    var getHeight = function (elem) {
      return elem.clientHeight;
    };

    var getWidth = function (elem) {
      return elem.clientWidth;
    };

    // This is the core of the layout container. It essentially just brute force tries all possible
    // combinations of rows and columns and checks which one will take up the most space.
    var getBestDimensions = function (minRatio, maxRatio, count, Width, Height) {
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
      // Use the default video ratio
      return 3/4;
    };

    var sizeElements = function (children, Width, Height, fixedRatio,minRatio, maxRatio) {
        var count = children.length,
            dimensions;

        if (fixedRatio) {
          // Use the ratio of the first video element we find
          var video = children.length > 0 && children[0].querySelector('video');
          minRatio = maxRatio = getVidRatio(video);
        }
        dimensions = getBestDimensions(minRatio, maxRatio, count, Width, Height);

        for (var i=0; i < children.length; i++) {
            var elem = children[i];

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

            elem.style.width = actualWidth + 'px';
            elem.style.height = actualHeight + 'px';
        }
    };

    var layout = function (container, opts) {
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
              // We are tall, going to take up the whole width and arrange small
              // guys at the bottom
              bigWidth = Width;
              bigHeight = Math.min(Math.floor(Height * opts.bigPercentage), Width * bigRatio);
              offsetTop = bigHeight;
              bigOffsetTop = Height - offsetTop;
          } else {
              // We are wide, going to take up the whole height and arrange
              // the small guys on the right
              container.style.flexDirection = 'column';
              bigHeight = Height;
              bigWidth = Math.min(Width * opts.bigPercentage, Math.floor(bigHeight / bigRatio));
              offsetLeft = bigWidth;
              bigOffsetLeft = Width - offsetLeft;
          }
          for (var i=0; i < bigOnes.length; i++) {
            bigOnes[i].style.order = opts.bigFirst ? -1 : 1;
          }
          sizeElements(smallOnes, Width - offsetLeft, Height - offsetTop, opts.fixedRatio,
            opts.minRatio, opts.maxRatio, opts.animate);
          sizeElements(bigOnes, bigWidth, bigHeight, opts.bigFixedRatio,
            opts.bigMinRatio, opts.bigMaxRatio, opts.animate);
        } else if (bigOnes.length > 0 && smallOnes.length === 0) {
          // We only have one bigOne just center it
          sizeElements(bigOnes, Width, Height, opts.bigFixedRatio, opts.bigMinRatio,
            opts.bigMaxRatio, opts.animate);
        } else {
          sizeElements(smallOnes, Width - offsetLeft, Height - offsetTop,
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

      container.style.display = 'flex';
      container.style.flexDirection = 'row';
      container.style.flexWrap = 'wrap';
      container.style.justifyContent = 'center';
      container.style.alignItems = 'center';
      container.style.alignContent = 'center';

      layout(container, opts);

      return {
        layout: layout.bind(null, container, opts)
      };
    };
})();
