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

    var getHeight = function (elem) {
        // NOTE: internal OT.$ API
        var heightStr = OT.$.height(elem);
        return heightStr ? parseInt(heightStr, 10) : 0;
    };

    var getWidth = function (elem) {
        // NOTE: internal OT.$ API
        var widthStr = OT.$.width(elem);
        return widthStr ? parseInt(widthStr, 10) : 0;
    };

    var arrange = function arrange(children, Width, Height, offsetLeft, offsetTop, fixedRatio,
      minRatio, maxRatio) {
        var count = children.length,
            availableRatio = Height / Width,
            vidRatio;

        var getBestDimensions = function getBestDimensions(minRatio, maxRatio) {
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
                targetWidth: targetWidth,
                ratio: vidRatio
            };
        };

        if (!fixedRatio) {
            vidRatio = getBestDimensions(minRatio, maxRatio);
        } else {
            // Use the ratio of the first video element we find
            var video = children.length > 0 && children[0].querySelector('video');
            if (video && video.videoHeight && video.videoWidth) {
                vidRatio = getBestDimensions(video.videoHeight/video.videoWidth,
                    video.videoHeight/video.videoWidth);
            }
            else {
                vidRatio = getBestDimensions(3/4, 3/4);   // Use the default video ratio
            }
        }

        for (var i=0; i < children.length; i++) {
            var elem = children[i];

            var actualWidth = vidRatio.targetWidth - getCSSNumber(elem, 'paddingLeft') -
                            getCSSNumber(elem, 'paddingRight') -
                            getCSSNumber(elem, 'marginLeft') -
                            getCSSNumber(elem, 'marginRight') -
                            getCSSNumber(elem, 'borderLeft') -
                            getCSSNumber(elem, 'borderRight');

             var actualHeight = vidRatio.targetHeight - getCSSNumber(elem, 'paddingTop') -
                            getCSSNumber(elem, 'paddingBottom') -
                            getCSSNumber(elem, 'marginTop') -
                            getCSSNumber(elem, 'marginBottom') -
                            getCSSNumber(elem, 'borderTop') -
                            getCSSNumber(elem, 'borderBottom');

            elem.style.width = actualWidth + 'px';
            elem.style.height = actualHeight + 'px';
        }
    };

    var filterDisplayNone = function (element) {
        // NOTE: internal OT.$ API
        return OT.$.css(element, 'display') !== 'none';
    };

    var layout = function layout(container, opts) {
        // NOTE: internal OT.$ API
        if (OT.$.css(container, 'display') === 'none') {
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
                filterDisplayNone),
            smallOnes = Array.prototype.filter.call(
                container.querySelectorAll('#' + id + '>*:not(.' + opts.bigClass + ')'),
                filterDisplayNone);

        if (bigOnes.length > 0 && smallOnes.length > 0) {
            var bigVideo = bigOnes[0].querySelector('video');
            if (bigVideo && bigVideo.videoHeight && bigVideo.videoWidth) {
                bigRatio = bigVideo.videoHeight / bigVideo.videoWidth;
            } else {
                bigRatio = 3 / 4;
            }
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
                bigHeight = Height;
                bigWidth = Math.min(Width * opts.bigPercentage, Math.floor(bigHeight / bigRatio));
                offsetLeft = bigWidth;
                bigOffsetLeft = Width - offsetLeft;
            }
            for (var i=0; i < bigOnes.length; i++) {
              bigOnes[i].style.order = opts.bigFirst ? -1 : 1;
            }
            arrange(smallOnes, Width - offsetLeft, Height - offsetTop, 0, 0, opts.fixedRatio,
              opts.minRatio, opts.maxRatio, opts.animate);
            arrange(bigOnes, bigWidth, bigHeight, bigOffsetLeft, bigOffsetTop, opts.bigFixedRatio,
              opts.bigMinRatio, opts.bigMaxRatio, opts.animate);
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
        // NOTE: internal OT.$ API
        opts = OT.$.defaults(opts || {}, {
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
        // NOTE: internal OT.$ API
        container = typeof(container) === 'string' ? OT.$(container) : container;

        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        container.style.flexWrap = 'wrap';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';

        // TODO: should we add event hooks to external globals like this?
        // this could be left as a responsibility of the user, and i think that would be more sound
        // the OT.onLoad() method has (publicly) undefined behavior
        OT.onLoad(function() {
            layout(container, opts);
        });

        return {
            layout: layout.bind(null, container, opts)
        };
    };

    // NOTE: deprecated API, will be removed in next major version
    OT.initLayoutContainer = exports.initLayoutContainer;

})();
