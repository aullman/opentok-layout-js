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

(function() {
    var positionElement = function positionElement(elem, x, y, width, height, animate) {
        var targetPosition = {
            left: x + "px",
            top: y + "px",
            width: width + "px",
            height: height + "px"
        };
        
        var fixAspectRatio = function () {
            var sub = elem.querySelector(".OT_root");
            if (sub) {
                // If this is the parent of a subscriber or publisher then we need
                // to force the mutation observer on the publisher or subscriber to
                // trigger to get it to fix it's layout
                var oldWidth = sub.style.width;
                sub.style.width = width + "px";
                // sub.style.height = height + "px";
                sub.style.width = oldWidth || "";
            }
        };
        
        if (animate && $) {
            $(elem).stop();
            $(elem).animate(targetPosition, animate.duration || 200, animate.easing || "swing", function () {
                fixAspectRatio();
                if (animate.complete) animate.complete.call(this);
            });
        } else {
            OT.$.css(elem, targetPosition);
        }
        fixAspectRatio();
    };
    
    var getCSSNumber = function (elem, prop) {
        var cssStr = OT.$.css(elem, prop);
        return cssStr ? parseInt(cssStr, 10) : 0;
    };
    
    var getHeight = function (elem) {
        var heightStr = OT.$.height(elem);
        return heightStr ? parseInt(heightStr, 10) : 0;
    };
    
    var getWidth = function (elem) {
        var widthStr = OT.$.width(elem);
        return widthStr ? parseInt(widthStr, 10) : 0;
    };
    
    var arrange = function arrange(children, Width, Height, offsetLeft, offsetTop, fixedRatio, minRatio, maxRatio, animate) {
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

                tRatio = tHeight/tWidth;
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
            var video = children.length > 0 && children[0].querySelector("video");
            if (video && video.videoHeight && video.videoWidth) {
                vidRatio = getBestDimensions(video.videoHeight/video.videoWidth,
                    video.videoHeight/video.videoWidth);
            }
            else {
                vidRatio = getBestDimensions(3/4, 3/4);   // Use the default video ratio
            }
        }

        var spacesInLastRow = (vidRatio.targetRows * vidRatio.targetCols) - count,
            lastRowMargin = (spacesInLastRow * vidRatio.targetWidth / 2),
            lastRowIndex = (vidRatio.targetRows - 1) * vidRatio.targetCols,
            firstRowMarginTop = ((Height - (vidRatio.targetRows * vidRatio.targetHeight)) / 2),
            firstColMarginLeft = ((Width - (vidRatio.targetCols * vidRatio.targetWidth)) / 2);

        // Loop through each stream in the container and place it inside
        var x = 0,
            y = 0;
        for (var i=0; i < children.length; i++) {
            var elem = children[i];
            if (i % vidRatio.targetCols === 0) {
                // We are the first element of the row
                x = firstColMarginLeft;
                if (i == lastRowIndex) x += lastRowMargin;
                y += i === 0 ? firstRowMarginTop : vidRatio.targetHeight;
            } else {
                x += vidRatio.targetWidth;
            }

            OT.$.css(elem, "position", "absolute");
            var actualWidth = vidRatio.targetWidth - getCSSNumber(elem, "paddingLeft") -
                            getCSSNumber(elem, "paddingRight") -
                            getCSSNumber(elem, "marginLeft") - 
                            getCSSNumber(elem, "marginRight") -
                            getCSSNumber(elem, "borderLeft") -
                            getCSSNumber(elem, "borderRight");

             var actualHeight = vidRatio.targetHeight - getCSSNumber(elem, "paddingTop") -
                            getCSSNumber(elem, "paddingBottom") -
                            getCSSNumber(elem, "marginTop") - 
                            getCSSNumber(elem, "marginBottom") -
                            getCSSNumber(elem, "borderTop") - 
                            getCSSNumber(elem, "borderBottom");

            positionElement(elem, x+offsetLeft, y+offsetTop, actualWidth, actualHeight, animate);
        }
    };
    
    var filterDisplayNone = function (element) {
        return OT.$.css(element, "display") !== "none";
    };
    
    var layout = function layout(container, opts, fixedRatio) {
        if (OT.$.css(container, "display") === "none") {
            return;
        }
        var id = container.getAttribute("id");
        if (!id) {
            id = "OT_" + OT.$.uuid();
            container.setAttribute("id", id);
        }
        
        var Height = getHeight(container) - 
                    getCSSNumber(container, "borderTop") - 
                    getCSSNumber(container, "borderBottom"),
            Width = getWidth(container) -
                    getCSSNumber(container, "borderLeft") -
                    getCSSNumber(container, "borderRight"),
            availableRatio = Height/Width,
            offsetLeft = 0,
            offsetTop = 0,
            bigOffsetTop = 0,
            bigOffsetLeft = 0,
            bigOnes = Array.prototype.filter.call(
                container.querySelectorAll("#" + id + ">." + opts.bigClass), 
                filterDisplayNone),
            smallOnes = Array.prototype.filter.call(
                container.querySelectorAll("#" + id + ">*:not(." + opts.bigClass + ")"),
                filterDisplayNone);
        
        if (bigOnes.length > 0 && smallOnes.length > 0) {
            var bigVideo = bigOnes[0].querySelector("video");
            if (bigVideo && bigVideo.videoHeight && bigVideo.videoWidth) {
                bigRatio = bigVideo.videoHeight / bigVideo.videoWidth;
            } else {
                bigRatio = 3 / 4;
            }
            var bigWidth, bigHeight;
            
            if (availableRatio > bigRatio) {
                // We are tall, going to take up the whole width and arrange small guys at the bottom
                bigWidth = Width;
                bigHeight = Math.min(Math.floor(Height * opts.bigPercentage), Width * bigRatio);
                offsetTop = bigHeight;
                bigOffsetTop = Height - offsetTop;
            } else {
                // We are wide, going to take up the whole height and arrange the small guys on the right
                bigHeight = Height;
                bigWidth = Math.min(Width * opts.bigPercentage, Math.floor(bigHeight / bigRatio));
                offsetLeft = bigWidth;
                bigOffsetLeft = Width - offsetLeft;
            }
            if (opts.bigFirst) {
              arrange(bigOnes, bigWidth, bigHeight, 0, 0, opts.bigFixedRatio, opts.bigMinRatio, opts.bigMaxRatio, opts.animate);
              arrange(smallOnes, Width - offsetLeft, Height - offsetTop, offsetLeft, offsetTop, opts.fixedRatio, opts.minRatio, opts.maxRatio, opts.animate);
            } else {
              arrange(smallOnes, Width - offsetLeft, Height - offsetTop, 0, 0, opts.fixedRatio, opts.minRatio, opts.maxRatio, opts.animate);
              arrange(bigOnes, bigWidth, bigHeight, bigOffsetLeft, bigOffsetTop, opts.bigFixedRatio, opts.bigMinRatio, opts.bigMaxRatio, opts.animate);
            }
        } else if (bigOnes.length > 0 && smallOnes.length === 0) {
            // We only have one bigOne just center it
            arrange(bigOnes, Width, Height, 0, 0, opts.bigFixedRatio, opts.bigMinRatio, opts.bigMaxRatio, opts.animate);
        } else {
            arrange(smallOnes, Width - offsetLeft, Height - offsetTop, offsetLeft, offsetTop, opts.fixedRatio, opts.minRatio, opts.maxRatio, opts.animate);
        }
     };
     
     if (!TB) {
         throw new Error("You must include the OpenTok for WebRTC JS API before the layout-container library");
     }
     TB.initLayoutContainer = function(container, opts) {
         opts = OT.$.defaults(opts || {}, {maxRatio: 3/2, minRatio: 9/16, fixedRatio: false, animate: false, bigClass: "OT_big", bigPercentage: 0.8, bigFixedRatio: false, bigMaxRatio: 3/2, bigMinRatio: 9/16, bigFirst: true});
         container = typeof(container) == "string" ? OT.$(container) : container;
        
         OT.onLoad(function() {
             layout(container, opts);
         });
        
         return {
             layout: layout.bind(null, container, opts)
         };
     };
})();