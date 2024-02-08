(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["initLayoutContainer"] = factory();
	else
		root["initLayoutContainer"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference path="../types/opentok-layout-js.d.ts" />
exports.__esModule = true;
var getBestDimensions = function (minRatio, maxRatio, Width, Height, count, maxWidth, maxHeight, evenRows) {
    var maxArea;
    var targetCols;
    var targetRows;
    var targetHeight;
    var targetWidth;
    var tWidth;
    var tHeight;
    var tRatio;
    // Iterate through every possible combination of rows and columns
    // and see which one has the least amount of whitespace
    for (var i = 1; i <= count; i += 1) {
        var cols = i;
        var rows = Math.ceil(count / cols);
        // Try taking up the whole height and width
        tHeight = Math.floor(Height / rows);
        tWidth = Math.floor(Width / cols);
        tRatio = tHeight / tWidth;
        if (tRatio > maxRatio) {
            // We went over decrease the height
            tRatio = maxRatio;
            tHeight = tWidth * tRatio;
        }
        else if (tRatio < minRatio) {
            // We went under decrease the width
            tRatio = minRatio;
            tWidth = tHeight / tRatio;
        }
        tWidth = Math.min(maxWidth, tWidth);
        tHeight = Math.min(maxHeight, tHeight);
        var area = (tWidth * tHeight) * count;
        // If this width and height takes up the most space then we're going with that
        if (maxArea === undefined || (area >= maxArea)) {
            if (evenRows && area === maxArea && ((cols * rows) % count) > ((targetRows * targetCols) % count)) {
                // We have the same area but there are more left over spots in the last row
                // Let's keep the previous one
                continue;
            }
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
        ratio: targetHeight / targetWidth
    };
};
var getLayout = function (opts, elements) {
    var maxRatio = opts.maxRatio, minRatio = opts.minRatio, fixedRatio = opts.fixedRatio, containerWidth = opts.containerWidth, containerHeight = opts.containerHeight, _a = opts.offsetLeft, offsetLeft = _a === void 0 ? 0 : _a, _b = opts.offsetTop, offsetTop = _b === void 0 ? 0 : _b, _c = opts.alignItems, alignItems = _c === void 0 ? 'center' : _c, _d = opts.maxWidth, maxWidth = _d === void 0 ? Infinity : _d, _e = opts.maxHeight, maxHeight = _e === void 0 ? Infinity : _e, _f = opts.scaleLastRow, scaleLastRow = _f === void 0 ? true : _f, _g = opts.evenRows, evenRows = _g === void 0 ? true : _g;
    var ratios = elements.map(function (element) { return element.height / element.width; });
    var count = ratios.length;
    var dimensions;
    if (!fixedRatio) {
        dimensions = getBestDimensions(minRatio, maxRatio, containerWidth, containerHeight, count, maxWidth, maxHeight, evenRows);
    }
    else {
        // Use the ratio of the first video element we find to approximate
        var ratio = ratios.length > 0 ? ratios[0] : null;
        dimensions = getBestDimensions(ratio, ratio, containerWidth, containerHeight, count, maxWidth, maxHeight, evenRows);
    }
    // Loop through each stream in the container and place it inside
    var x = 0;
    var y = 0;
    var rows = [];
    var row;
    var boxes = [];
    // Iterate through the children and create an array with a new item for each row
    // and calculate the width of each row so that we know if we go over the size and need
    // to adjust
    for (var i = 0; i < ratios.length; i += 1) {
        if (i % dimensions.targetCols === 0) {
            // This is a new row
            row = {
                ratios: [],
                elements: [],
                width: 0,
                height: 0
            };
            rows.push(row);
        }
        var ratio = ratios[i];
        var element = elements[i];
        row.elements.push(element);
        row.ratios.push(ratio);
        var targetWidth = dimensions.targetWidth;
        var targetHeight = dimensions.targetHeight;
        // If we're using a fixedRatio then we need to set the correct ratio for this element
        if (fixedRatio || element.fixedRatio) {
            targetWidth = targetHeight / ratio;
        }
        row.width += targetWidth;
        row.height = targetHeight;
    }
    // Calculate total row height adjusting if we go too wide
    var totalRowHeight = 0;
    var remainingShortRows = 0;
    for (var i = 0; i < rows.length; i += 1) {
        row = rows[i];
        if (row.width > containerWidth) {
            // Went over on the width, need to adjust the height proportionally
            row.height = Math.floor(row.height * (containerWidth / row.width));
            row.width = containerWidth;
        }
        else if (row.width < containerWidth && row.height < maxHeight) {
            remainingShortRows += 1;
        }
        totalRowHeight += row.height;
    }
    if (scaleLastRow && totalRowHeight < containerHeight && remainingShortRows > 0) {
        // We can grow some of the rows, we're not taking up the whole height
        var remainingHeightDiff = containerHeight - totalRowHeight;
        totalRowHeight = 0;
        for (var i = 0; i < rows.length; i += 1) {
            row = rows[i];
            if (row.width < containerWidth) {
                // Evenly distribute the extra height between the short rows
                var extraHeight = remainingHeightDiff / remainingShortRows;
                if ((extraHeight / row.height) > ((containerWidth - row.width) / row.width)) {
                    // We can't go that big or we'll go too wide
                    extraHeight = Math.floor(((containerWidth - row.width) / row.width) * row.height);
                }
                row.width += Math.floor((extraHeight / row.height) * row.width);
                row.height += extraHeight;
                remainingHeightDiff -= extraHeight;
                remainingShortRows -= 1;
            }
            totalRowHeight += row.height;
        }
    }
    switch (alignItems) {
        case 'start':
            y = 0;
            break;
        case 'end':
            y = containerHeight - totalRowHeight;
            break;
        case 'center':
        default:
            y = ((containerHeight - (totalRowHeight)) / 2);
            break;
    }
    // Iterate through each row and place each child
    for (var i = 0; i < rows.length; i += 1) {
        row = rows[i];
        var rowMarginLeft = void 0;
        switch (alignItems) {
            case 'start':
                rowMarginLeft = 0;
                break;
            case 'end':
                rowMarginLeft = containerWidth - row.width;
                break;
            case 'center':
            default:
                rowMarginLeft = ((containerWidth - row.width) / 2);
                break;
        }
        x = rowMarginLeft;
        var targetHeight = void 0;
        for (var j = 0; j < row.ratios.length; j += 1) {
            var ratio = row.ratios[j];
            var element = row.elements[j];
            var targetWidth = dimensions.targetWidth;
            targetHeight = row.height;
            // If we're using a fixedRatio then we need to set the correct ratio for this element
            if (fixedRatio || element.fixedRatio) {
                targetWidth = Math.floor(targetHeight / ratio);
            }
            else if ((targetHeight / targetWidth)
                !== (dimensions.targetHeight / dimensions.targetWidth)) {
                // We grew this row, we need to adjust the width to account for the increase in height
                targetWidth = Math.floor((dimensions.targetWidth / dimensions.targetHeight) * targetHeight);
            }
            boxes.push({
                left: x + offsetLeft,
                top: y + offsetTop,
                width: targetWidth,
                height: targetHeight
            });
            x += targetWidth;
        }
        y += targetHeight;
    }
    return boxes;
};
var getVideoRatio = function (element) { return element.height / element.width; };
exports["default"] = (function (opts, elements) {
    var _a = opts.maxRatio, maxRatio = _a === void 0 ? 3 / 2 : _a, _b = opts.minRatio, minRatio = _b === void 0 ? 9 / 16 : _b, _c = opts.fixedRatio, fixedRatio = _c === void 0 ? false : _c, _d = opts.bigPercentage, bigPercentage = _d === void 0 ? 0.8 : _d, _e = opts.minBigPercentage, minBigPercentage = _e === void 0 ? 0 : _e, _f = opts.bigFixedRatio, bigFixedRatio = _f === void 0 ? false : _f, _g = opts.bigMaxRatio, bigMaxRatio = _g === void 0 ? 3 / 2 : _g, _h = opts.bigMinRatio, bigMinRatio = _h === void 0 ? 9 / 16 : _h, _j = opts.bigFirst, bigFirst = _j === void 0 ? true : _j, _k = opts.containerWidth, containerWidth = _k === void 0 ? 640 : _k, _l = opts.containerHeight, containerHeight = _l === void 0 ? 480 : _l, _m = opts.alignItems, alignItems = _m === void 0 ? 'center' : _m, _o = opts.bigAlignItems, bigAlignItems = _o === void 0 ? 'center' : _o, _p = opts.smallAlignItems, smallAlignItems = _p === void 0 ? 'center' : _p, _q = opts.maxWidth, maxWidth = _q === void 0 ? Infinity : _q, _r = opts.maxHeight, maxHeight = _r === void 0 ? Infinity : _r, _s = opts.smallMaxWidth, smallMaxWidth = _s === void 0 ? Infinity : _s, _t = opts.smallMaxHeight, smallMaxHeight = _t === void 0 ? Infinity : _t, _u = opts.bigMaxWidth, bigMaxWidth = _u === void 0 ? Infinity : _u, _v = opts.bigMaxHeight, bigMaxHeight = _v === void 0 ? Infinity : _v, _w = opts.scaleLastRow, scaleLastRow = _w === void 0 ? true : _w, _x = opts.bigScaleLastRow, bigScaleLastRow = _x === void 0 ? true : _x, _y = opts.evenRows, evenRows = _y === void 0 ? true : _y;
    var availableRatio = containerHeight / containerWidth;
    var offsetLeft = 0;
    var offsetTop = 0;
    var bigOffsetTop = 0;
    var bigOffsetLeft = 0;
    var bigIndices = [];
    var bigOnes = elements.filter(function (element, idx) {
        if (element.big) {
            bigIndices.push(idx);
            return true;
        }
        return false;
    });
    var smallOnes = elements.filter(function (element) { return !element.big; });
    var bigBoxes = [];
    var smallBoxes = [];
    var areas = {};
    if (bigOnes.length > 0 && smallOnes.length > 0) {
        var bigWidth = void 0;
        var bigHeight = void 0;
        var showBigFirst = bigFirst === true;
        if (availableRatio > getVideoRatio(bigOnes[0])) {
            // We are tall, going to take up the whole width and arrange small
            // guys at the bottom
            bigWidth = containerWidth;
            bigHeight = Math.floor(containerHeight * bigPercentage);
            if (minBigPercentage > 0) {
                // Find the best size for the big area
                var bigDimensions = void 0;
                if (!bigFixedRatio) {
                    bigDimensions = getBestDimensions(bigMinRatio, bigMaxRatio, bigWidth, bigHeight, bigOnes.length, bigMaxWidth, bigMaxHeight, evenRows);
                }
                else {
                    // Use the ratio of the first video element we find to approximate
                    var ratio = bigOnes[0].height / bigOnes[0].width;
                    bigDimensions = getBestDimensions(ratio, ratio, bigWidth, bigHeight, bigOnes.length, bigMaxWidth, bigMaxHeight, evenRows);
                }
                bigHeight = Math.max(containerHeight * minBigPercentage, Math.min(bigHeight, bigDimensions.targetHeight * bigDimensions.targetRows));
                // Don't awkwardly scale the small area bigger than we need to and end up with floating
                // videos in the middle
                var smallBoxes_1 = getLayout({
                    containerWidth: containerWidth,
                    containerHeight: containerHeight - bigHeight,
                    offsetLeft: 0,
                    offsetTop: 0,
                    fixedRatio: fixedRatio,
                    minRatio: minRatio,
                    maxRatio: maxRatio,
                    alignItems: smallAlignItems,
                    maxWidth: smallMaxWidth,
                    maxHeight: smallMaxHeight,
                    scaleLastRow: scaleLastRow,
                    evenRows: evenRows
                }, smallOnes);
                var smallHeight_1 = 0;
                var currentTop_1 = undefined;
                smallBoxes_1.forEach(function (box) {
                    if (currentTop_1 !== box.top) {
                        currentTop_1 = box.top;
                        smallHeight_1 += box.height;
                    }
                });
                bigHeight = Math.max(bigHeight, containerHeight - smallHeight_1);
            }
            offsetTop = bigHeight;
            bigOffsetTop = containerHeight - offsetTop;
            if (bigFirst === 'column') {
                showBigFirst = false;
            }
            else if (bigFirst === 'row') {
                showBigFirst = true;
            }
        }
        else {
            // We are wide, going to take up the whole height and arrange the small
            // guys on the right
            bigHeight = containerHeight;
            bigWidth = Math.floor(containerWidth * bigPercentage);
            if (minBigPercentage > 0) {
                // Find the best size for the big area
                var bigDimensions = void 0;
                if (!bigFixedRatio) {
                    bigDimensions = getBestDimensions(bigMinRatio, bigMaxRatio, bigWidth, bigHeight, bigOnes.length, bigMaxWidth, bigMaxHeight, evenRows);
                }
                else {
                    // Use the ratio of the first video element we find to approximate
                    var ratio = bigOnes[0].height / bigOnes[0].width;
                    bigDimensions = getBestDimensions(ratio, ratio, bigWidth, bigHeight, bigOnes.length, bigMaxWidth, bigMaxHeight, evenRows);
                }
                bigWidth = Math.max(containerWidth * minBigPercentage, Math.min(bigWidth, bigDimensions.targetWidth * bigDimensions.targetCols));
                // Don't awkwardly scale the small area bigger than we need to and end up with floating
                // videos in the middle
                var smallBoxes_2 = getLayout({
                    containerWidth: containerWidth - bigWidth,
                    containerHeight: containerHeight,
                    offsetLeft: 0,
                    offsetTop: 0,
                    fixedRatio: fixedRatio,
                    minRatio: minRatio,
                    maxRatio: maxRatio,
                    alignItems: smallAlignItems,
                    maxWidth: smallMaxWidth,
                    maxHeight: smallMaxHeight,
                    scaleLastRow: scaleLastRow,
                    evenRows: evenRows
                }, smallOnes);
                var smallWidth_1 = 0;
                var currentWidth_1 = 0;
                var top_1 = 0;
                smallBoxes_2.forEach(function (box) {
                    if (box.top !== top_1) {
                        currentWidth_1 = 0;
                        top_1 = box.top;
                    }
                    currentWidth_1 += box.width;
                    smallWidth_1 = Math.max(smallWidth_1, currentWidth_1);
                });
                bigWidth = Math.max(bigWidth, containerWidth - smallWidth_1);
            }
            offsetLeft = bigWidth;
            bigOffsetLeft = containerWidth - offsetLeft;
            if (bigFirst === 'column') {
                showBigFirst = true;
            }
            else if (bigFirst === 'row') {
                showBigFirst = false;
            }
        }
        if (showBigFirst) {
            areas.big = {
                top: 0,
                left: 0,
                width: bigWidth,
                height: bigHeight
            };
            areas.small = {
                top: offsetTop,
                left: offsetLeft,
                width: containerWidth - offsetLeft,
                height: containerHeight - offsetTop
            };
        }
        else {
            areas.big = {
                left: bigOffsetLeft,
                top: bigOffsetTop,
                width: bigWidth,
                height: bigHeight
            };
            areas.small = {
                top: 0,
                left: 0,
                width: containerWidth - offsetLeft,
                height: containerHeight - offsetTop
            };
        }
    }
    else if (bigOnes.length > 0 && smallOnes.length === 0) {
        // We only have one bigOne just center it
        areas.big = {
            top: 0,
            left: 0,
            width: containerWidth,
            height: containerHeight
        };
    }
    else {
        areas.small = {
            top: offsetTop,
            left: offsetLeft,
            width: containerWidth - offsetLeft,
            height: containerHeight - offsetTop
        };
    }
    if (areas.big) {
        bigBoxes = getLayout({
            containerWidth: areas.big.width,
            containerHeight: areas.big.height,
            offsetLeft: areas.big.left,
            offsetTop: areas.big.top,
            fixedRatio: bigFixedRatio,
            minRatio: bigMinRatio,
            maxRatio: bigMaxRatio,
            alignItems: bigAlignItems,
            maxWidth: bigMaxWidth,
            maxHeight: bigMaxHeight,
            scaleLastRow: bigScaleLastRow,
            evenRows: evenRows
        }, bigOnes);
    }
    if (areas.small) {
        smallBoxes = getLayout({
            containerWidth: areas.small.width,
            containerHeight: areas.small.height,
            offsetLeft: areas.small.left,
            offsetTop: areas.small.top,
            fixedRatio: fixedRatio,
            minRatio: minRatio,
            maxRatio: maxRatio,
            alignItems: areas.big ? smallAlignItems : alignItems,
            maxWidth: areas.big ? smallMaxWidth : maxWidth,
            maxHeight: areas.big ? smallMaxHeight : maxHeight,
            scaleLastRow: scaleLastRow,
            evenRows: evenRows
        }, smallOnes);
    }
    var boxes = [];
    var bigBoxesIdx = 0;
    var smallBoxesIdx = 0;
    // Rebuild the array in the right order based on where the bigIndices should be
    elements.forEach(function (element, idx) {
        if (bigIndices.indexOf(idx) > -1) {
            boxes[idx] = bigBoxes[bigBoxesIdx];
            bigBoxesIdx += 1;
        }
        else {
            boxes[idx] = smallBoxes[smallBoxesIdx];
            smallBoxesIdx += 1;
        }
    });
    return { boxes: boxes, areas: areas };
});


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference path="../types/opentok-layout-js.d.ts" />
/*!
 *  opentok-layout-js (http://github.com/aullman/opentok-layout-js)
 *
 *  Automatic layout of video elements (publisher and subscriber) minimising
 *  white-space for the OpenTok on WebRTC API.
 *
 *  @Author: Adam Ullman (http://github.com/aullman)
 *  @Copyright (c) 2014 Adam Ullman
 *  @License: Released under the MIT license (http://opensource.org/licenses/MIT)
 * */
exports.__esModule = true;
// in CommonJS context, this should be a `require()`d dependency.
// in browser globals context, ...? (when using bower, there are dependencies that it has handled
// for you, so these might be safe to assume)
var getLayout_1 = __webpack_require__(0);
var layout_1 = __webpack_require__(2);
module.exports = function initLayoutContainer(container, opts) {
    var win = (opts && opts.window) || (typeof window === 'undefined' ? undefined : window);
    container = typeof container === 'string' ? win.document.querySelector(container) : container;
    if (!(typeof (win && win.HTMLElement) === 'undefined' || container instanceof win.HTMLElement) && !opts) {
        // container is actually the options
        opts = container;
    }
    else if (!opts) {
        opts = {};
    }
    return {
        layout: layout_1["default"].bind(this, container, opts),
        getLayout: getLayout_1["default"].bind(this, opts)
    };
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference path="../types/opentok-layout-js.d.ts" />
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var getLayout_1 = __webpack_require__(0);
exports["default"] = (function (container, opts) {
    function css(el, propertyName, value) {
        if (typeof propertyName === 'string' && value) {
            // We are setting one css property
            el.style[propertyName] = value;
            return NaN;
        }
        if (typeof propertyName === 'object') {
            // We are setting several CSS properties at once
            Object.keys(propertyName).forEach(function (key) {
                css(el, key, propertyName[key]);
            });
            return NaN;
        }
        // We are getting the css property
        var computedStyle = ((opts && opts.window) || window).getComputedStyle(el);
        var currentValue = computedStyle.getPropertyValue(propertyName);
        if (currentValue === '') {
            currentValue = el.style[propertyName];
        }
        return currentValue;
    }
    var filterDisplayNone = function (element) { return css(element, 'display') !== 'none'; };
    function height(el) {
        if (el.offsetHeight > 0) {
            return "".concat(el.offsetHeight, "px");
        }
        return css(el, 'height');
    }
    function width(el) {
        if (el.offsetWidth > 0) {
            return "".concat(el.offsetWidth, "px");
        }
        return css(el, 'width');
    }
    var positionElement = function positionElement(elem, x, y, w, h, animate, onLayout) {
        var _this = this;
        var targetPosition = {
            left: "".concat(x, "px"),
            top: "".concat(y, "px"),
            width: "".concat(w, "px"),
            height: "".concat(h, "px")
        };
        var fixAspectRatio = function fixAspectRatio() {
            var sub = elem.querySelector('.OT_root');
            if (sub) {
                // If this is the parent of a subscriber or publisher then we need
                // to force the mutation observer on the publisher or subscriber to
                // trigger to get it to fix it's layout
                var oldWidth = sub.style.width;
                sub.style.width = "".concat(w, "px");
                // sub.style.height = height + 'px';
                sub.style.width = oldWidth || '';
            }
        };
        if (animate && typeof $ !== 'undefined') {
            $(elem).stop();
            var animateProps_1 = typeof animate === 'boolean' ? { duration: 200, easing: 'swing' } : animate;
            $(elem).animate(targetPosition, animateProps_1.duration, animateProps_1.easing, function () {
                fixAspectRatio();
                if (animateProps_1.complete)
                    animateProps_1.complete.call(_this);
                if (onLayout) {
                    onLayout(elem, {
                        left: x,
                        top: y,
                        width: w,
                        height: h
                    });
                }
            });
        }
        else {
            css(elem, targetPosition);
            if (!elem.classList.contains('ot-layout')) {
                elem.classList.add('ot-layout');
            }
            if (onLayout) {
                onLayout(elem, {
                    left: x,
                    top: y,
                    width: w,
                    height: h
                });
            }
        }
        fixAspectRatio();
    };
    var getChildDims = function getChildDims(child) {
        if (child) {
            if (child.videoHeight && child.videoWidth) {
                return {
                    height: child.videoHeight,
                    width: child.videoWidth
                };
            }
            var video = child.querySelector('video');
            if (video && video.videoHeight && video.videoWidth) {
                return {
                    height: video.videoHeight,
                    width: video.videoWidth
                };
            }
        }
        return {
            height: 480,
            width: 640
        };
    };
    var getCSSNumber = function getCSSNumber(elem, prop) {
        var cssStr = css(elem, prop);
        return cssStr ? parseInt(cssStr, 10) : 0;
    };
    // Really cheap UUID function
    var cheapUUID = function cheapUUID() {
        return (Math.random() * 100000000).toFixed(0);
    };
    var getHeight = function getHeight(elem) {
        var heightStr = height(elem);
        return heightStr ? parseInt(heightStr, 10) : 0;
    };
    var getWidth = function getWidth(elem) {
        var widthStr = width(elem);
        return widthStr ? parseInt(widthStr, 10) : 0;
    };
    var _a = opts.animate, animate = _a === void 0 ? false : _a, _b = opts.bigClass, bigClass = _b === void 0 ? 'OT_big' : _b, _c = opts.ignoreClass, ignoreClass = _c === void 0 ? 'OT_ignore' : _c, _d = opts.fixedRatioClass, fixedRatioClass = _d === void 0 ? 'OT_fixedRatio' : _d;
    if (css(container, 'display') === 'none') {
        return;
    }
    var id = container.getAttribute('id');
    if (!id) {
        id = "OT_".concat(cheapUUID());
        container.setAttribute('id', id);
    }
    opts.containerHeight = getHeight(container)
        - getCSSNumber(container, 'border-top')
        - getCSSNumber(container, 'border-bottom');
    opts.containerWidth = getWidth(container)
        - getCSSNumber(container, 'border-left')
        - getCSSNumber(container, 'border-right');
    var children = Array.prototype.filter.call(container.querySelectorAll("#".concat(id, ">*:not(.").concat(ignoreClass, ")")), filterDisplayNone);
    var elements = children.map(function (element) {
        return __assign(__assign({}, getChildDims(element)), { big: element.classList.contains(bigClass), fixedRatio: element.classList.contains(fixedRatioClass) });
    });
    var layout = (0, getLayout_1["default"])(opts, elements);
    layout.boxes.forEach(function (box, idx) {
        var elem = children[idx];
        css(elem, 'position', 'absolute');
        var actualWidth = box.width
            - getCSSNumber(elem, 'margin-left')
            - getCSSNumber(elem, 'margin-right')
            - (css(elem, 'box-sizing') !== 'border-box'
                ? (getCSSNumber(elem, 'padding-left')
                    + getCSSNumber(elem, 'padding-right')
                    + getCSSNumber(elem, 'border-left')
                    + getCSSNumber(elem, 'border-right'))
                : 0);
        var actualHeight = box.height
            - getCSSNumber(elem, 'margin-top')
            - getCSSNumber(elem, 'margin-bottom')
            - (css(elem, 'box-sizing') !== 'border-box'
                ? (getCSSNumber(elem, 'padding-top')
                    + getCSSNumber(elem, 'padding-bottom')
                    + getCSSNumber(elem, 'border-top')
                    + getCSSNumber(elem, 'border-bottom'))
                : 0);
        positionElement(elem, box.left, box.top, actualWidth, actualHeight, animate, opts.onLayout);
    });
});


/***/ })
/******/ ]);
});