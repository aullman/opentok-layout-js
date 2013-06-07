(function() {
    var observeChildChange = function observe(element, onChange) {
        observer = new MutationObserver(function(mutations) {
            var removedNodes = [];
            var addedNodes = [];

            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    addedNodes = addedNodes.concat(Array.prototype.slice.call(mutation.addedNodes));                        
                }
                if (mutation.removedNodes.length) {
                    removedNodes = removedNodes.concat(Array.prototype.slice.call(mutation.removedNodes));
                }
            });

            if (addedNodes.length || removedNodes.length) {
                setTimeout(function() {
                    onChange(addedNodes, removedNodes);
                });
            }
        });

        observer.observe(element, {
            attributes:false,
            childList:true,
            characterData:false,
            subtree:false
        });

        return observer;
    };
    
    var positionElement = function(elem, x, y, width, height) {
        var targetPosition = {
            left: x + "px",
            top: y + "px",
            width: width + "px",
            height: height + "px"
        };
        OT.$.css(elem, targetPosition);
    };
    
    var layout = function(container) {
        var count = container.children.length,
            Height = parseInt(OT.$.height(container), 10),
            Width = parseInt(OT.$.width(container), 10),
            availableRatio = Height / Width,
            vidRatio;
        
        var tryVidRatio = function(vidRatio) {
            var minDiff,
                targetCols,
                targetRows;
            for (var i=1; i <= count; i++) {
                var cols = i;
                var rows = Math.ceil(count / cols);
                var ratio = rows/cols * vidRatio;
                var ratio_diff = Math.abs(availableRatio - ratio);
                if (minDiff == undefined || (ratio_diff < minDiff)) {
                    minDiff = ratio_diff;
                    targetCols = cols;
                    targetRows = rows;
                }
            };
            return {
                minDiff: minDiff,
                targetCols: targetCols,
                targetRows: targetRows,
                ratio: vidRatio
            };
        };
        
        // Try all video ratios between 4x3 (landscape) and 2x3 (portrait)
        // Just a brute force approach to figuring out the best ratio
        var incr = 75/2000,
            max = 3/2,
            testRatio,
            i;
        for (i=3/4; i <= max; i=OT.$.roundFloat(i+incr, 5)) {
            testRatio = tryVidRatio(i);
            if (!vidRatio || testRatio.minDiff < vidRatio.minDiff) vidRatio = testRatio;
        }

        if ((vidRatio.targetRows/vidRatio.targetCols) * vidRatio.ratio > availableRatio) {
            targetHeight = Math.floor( Height/vidRatio.targetRows );
            targetWidth = Math.floor( targetHeight/vidRatio.ratio );
        } else {
            targetWidth = Math.floor( Width/vidRatio.targetCols );
            targetHeight = Math.floor( targetWidth*vidRatio.ratio );
        }

        var spacesInLastRow = (vidRatio.targetRows * vidRatio.targetCols) - count,
            lastRowMargin = (spacesInLastRow * targetWidth / 2),
            lastRowIndex = (vidRatio.targetRows - 1) * vidRatio.targetCols,
            firstRowMarginTop = ((Height - (vidRatio.targetRows * targetHeight)) / 2),
            firstColMarginLeft = ((Width - (vidRatio.targetCols * targetWidth)) / 2);

        // Loop through each stream in the container and place it inside
        var x = 0,
            y = 0;
        for (i=0; i < container.children.length; i++) {
            var elem = container.children[i];
            if (i % vidRatio.targetCols == 0) {
                // We are the first element of the row
                x = firstColMarginLeft;
                if (i == lastRowIndex) x += lastRowMargin;
                y += i == 0 ? firstRowMarginTop : targetHeight;
            } else {
                x += targetWidth;
            }

            OT.$.css(elem, "position", "absolute");
            var actualWidth = targetWidth - parseInt(OT.$.css(elem, "paddingLeft"), 10) -
                            parseInt(OT.$.css(elem, "paddingRight"), 10) -
                            parseInt(OT.$.css(elem, "marginLeft"), 10) - 
                            parseInt(OT.$.css(elem, "marginRight"), 10);

             var actualHeight = targetHeight - parseInt(OT.$.css(elem, "paddingTop"), 10) -
                            parseInt(OT.$.css(elem, "paddingBottom"), 10) -
                            parseInt(OT.$.css(elem, "marginTop"), 10) - 
                            parseInt(OT.$.css(elem, "marginBottom"), 10);

            positionElement(elem, x, y, actualWidth, actualHeight);
        }
     };
     
     TB.initLayoutContainer = function(container) {
        var container = typeof(container) == "string" ? OT.$(elId) : container;
        
        OT.onLoad(function() {
            observeChildChange(container, function() {
                layout(container);
            });
            OT.$.observeStyleChanges(container, ['width', 'height'], function() {
                layout(container);
            });
            layout(container);
        });
    };
})();