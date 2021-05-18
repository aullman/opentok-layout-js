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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var getBestDimensions = function getBestDimensions(minRatio, maxRatio, Width, Height, count, maxWidth, maxHeight) {
  var maxArea = void 0;
  var targetCols = void 0;
  var targetRows = void 0;
  var targetHeight = void 0;
  var targetWidth = void 0;
  var tWidth = void 0;
  var tHeight = void 0;
  var tRatio = void 0;

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
    } else if (tRatio < minRatio) {
      // We went under decrease the width
      tRatio = minRatio;
      tWidth = tHeight / tRatio;
    }

    tWidth = Math.min(maxWidth, tWidth);
    tHeight = Math.min(maxHeight, tHeight);

    var area = tWidth * tHeight * count;

    // If this width and height takes up the most space then we're going with that
    if (maxArea === undefined || area >= maxArea) {
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

var getLayout = function getLayout(opts, elements) {
  var maxRatio = opts.maxRatio,
      minRatio = opts.minRatio,
      fixedRatio = opts.fixedRatio,
      containerWidth = opts.containerWidth,
      containerHeight = opts.containerHeight,
      _opts$offsetLeft = opts.offsetLeft,
      offsetLeft = _opts$offsetLeft === undefined ? 0 : _opts$offsetLeft,
      _opts$offsetTop = opts.offsetTop,
      offsetTop = _opts$offsetTop === undefined ? 0 : _opts$offsetTop,
      _opts$alignItems = opts.alignItems,
      alignItems = _opts$alignItems === undefined ? 'center' : _opts$alignItems,
      _opts$maxWidth = opts.maxWidth,
      maxWidth = _opts$maxWidth === undefined ? Infinity : _opts$maxWidth,
      _opts$maxHeight = opts.maxHeight,
      maxHeight = _opts$maxHeight === undefined ? Infinity : _opts$maxHeight,
      _opts$scaleLastRow = opts.scaleLastRow,
      scaleLastRow = _opts$scaleLastRow === undefined ? true : _opts$scaleLastRow;

  var ratios = elements.map(function (element) {
    return element.height / element.width;
  });
  var count = ratios.length;

  var dimensions = void 0;

  if (!fixedRatio) {
    dimensions = getBestDimensions(minRatio, maxRatio, containerWidth, containerHeight, count, maxWidth, maxHeight);
  } else {
    // Use the ratio of the first video element we find to approximate
    var ratio = ratios.length > 0 ? ratios[0] : null;
    dimensions = getBestDimensions(ratio, ratio, containerWidth, containerHeight, count, maxWidth, maxHeight);
  }

  // Loop through each stream in the container and place it inside
  var x = 0;
  var y = 0;
  var rows = [];
  var row = void 0;
  var boxes = [];
  // Iterate through the children and create an array with a new item for each row
  // and calculate the width of each row so that we know if we go over the size and need
  // to adjust
  for (var i = 0; i < ratios.length; i += 1) {
    if (i % dimensions.targetCols === 0) {
      // This is a new row
      row = {
        ratios: [],
        width: 0,
        height: 0
      };
      rows.push(row);
    }
    var _ratio = ratios[i];
    row.ratios.push(_ratio);
    var targetWidth = dimensions.targetWidth;
    var targetHeight = dimensions.targetHeight;
    // If we're using a fixedRatio then we need to set the correct ratio for this element
    if (fixedRatio) {
      targetWidth = targetHeight / _ratio;
    }
    row.width += targetWidth;
    row.height = targetHeight;
  }
  // Calculate total row height adjusting if we go too wide
  var totalRowHeight = 0;
  var remainingShortRows = 0;
  for (var _i = 0; _i < rows.length; _i += 1) {
    row = rows[_i];
    if (row.width > containerWidth) {
      // Went over on the width, need to adjust the height proportionally
      row.height = Math.floor(row.height * (containerWidth / row.width));
      row.width = containerWidth;
    } else if (row.width < containerWidth && row.height < maxHeight) {
      remainingShortRows += 1;
    }
    totalRowHeight += row.height;
  }
  if (scaleLastRow && totalRowHeight < containerHeight && remainingShortRows > 0) {
    // We can grow some of the rows, we're not taking up the whole height
    var remainingHeightDiff = containerHeight - totalRowHeight;
    totalRowHeight = 0;
    for (var _i2 = 0; _i2 < rows.length; _i2 += 1) {
      row = rows[_i2];
      if (row.width < containerWidth) {
        // Evenly distribute the extra height between the short rows
        var extraHeight = remainingHeightDiff / remainingShortRows;
        if (extraHeight / row.height > (containerWidth - row.width) / row.width) {
          // We can't go that big or we'll go too wide
          extraHeight = Math.floor((containerWidth - row.width) / row.width * row.height);
        }
        row.width += Math.floor(extraHeight / row.height * row.width);
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
      y = (containerHeight - totalRowHeight) / 2;
      break;
  }
  // Iterate through each row and place each child
  for (var _i3 = 0; _i3 < rows.length; _i3 += 1) {
    row = rows[_i3];
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
        rowMarginLeft = (containerWidth - row.width) / 2;
        break;
    }
    x = rowMarginLeft;
    var _targetHeight = void 0;
    for (var j = 0; j < row.ratios.length; j += 1) {
      var _ratio2 = row.ratios[j];

      var _targetWidth = dimensions.targetWidth;
      _targetHeight = row.height;
      // If we're using a fixedRatio then we need to set the correct ratio for this element
      if (fixedRatio) {
        _targetWidth = Math.floor(_targetHeight / _ratio2);
      } else if (_targetHeight / _targetWidth !== dimensions.targetHeight / dimensions.targetWidth) {
        // We grew this row, we need to adjust the width to account for the increase in height
        _targetWidth = Math.floor(dimensions.targetWidth / dimensions.targetHeight * _targetHeight);
      }

      boxes.push({
        left: x + offsetLeft,
        top: y + offsetTop,
        width: _targetWidth,
        height: _targetHeight
      });
      x += _targetWidth;
    }
    y += _targetHeight;
  }
  return boxes;
};

var getVideoRatio = function getVideoRatio(element) {
  return element.height / element.width;
};

module.exports = function (opts, elements) {
  var _opts$maxRatio = opts.maxRatio,
      maxRatio = _opts$maxRatio === undefined ? 3 / 2 : _opts$maxRatio,
      _opts$minRatio = opts.minRatio,
      minRatio = _opts$minRatio === undefined ? 9 / 16 : _opts$minRatio,
      _opts$fixedRatio = opts.fixedRatio,
      fixedRatio = _opts$fixedRatio === undefined ? false : _opts$fixedRatio,
      _opts$bigPercentage = opts.bigPercentage,
      bigPercentage = _opts$bigPercentage === undefined ? 0.8 : _opts$bigPercentage,
      _opts$bigFixedRatio = opts.bigFixedRatio,
      bigFixedRatio = _opts$bigFixedRatio === undefined ? false : _opts$bigFixedRatio,
      _opts$bigMaxRatio = opts.bigMaxRatio,
      bigMaxRatio = _opts$bigMaxRatio === undefined ? 3 / 2 : _opts$bigMaxRatio,
      _opts$bigMinRatio = opts.bigMinRatio,
      bigMinRatio = _opts$bigMinRatio === undefined ? 9 / 16 : _opts$bigMinRatio,
      _opts$bigFirst = opts.bigFirst,
      bigFirst = _opts$bigFirst === undefined ? true : _opts$bigFirst,
      _opts$containerWidth = opts.containerWidth,
      containerWidth = _opts$containerWidth === undefined ? 640 : _opts$containerWidth,
      _opts$containerHeight = opts.containerHeight,
      containerHeight = _opts$containerHeight === undefined ? 480 : _opts$containerHeight,
      _opts$alignItems2 = opts.alignItems,
      alignItems = _opts$alignItems2 === undefined ? 'center' : _opts$alignItems2,
      _opts$bigAlignItems = opts.bigAlignItems,
      bigAlignItems = _opts$bigAlignItems === undefined ? 'center' : _opts$bigAlignItems,
      _opts$smallAlignItems = opts.smallAlignItems,
      smallAlignItems = _opts$smallAlignItems === undefined ? 'center' : _opts$smallAlignItems,
      _opts$maxWidth2 = opts.maxWidth,
      maxWidth = _opts$maxWidth2 === undefined ? Infinity : _opts$maxWidth2,
      _opts$maxHeight2 = opts.maxHeight,
      maxHeight = _opts$maxHeight2 === undefined ? Infinity : _opts$maxHeight2,
      _opts$smallMaxWidth = opts.smallMaxWidth,
      smallMaxWidth = _opts$smallMaxWidth === undefined ? Infinity : _opts$smallMaxWidth,
      _opts$smallMaxHeight = opts.smallMaxHeight,
      smallMaxHeight = _opts$smallMaxHeight === undefined ? Infinity : _opts$smallMaxHeight,
      _opts$bigMaxWidth = opts.bigMaxWidth,
      bigMaxWidth = _opts$bigMaxWidth === undefined ? Infinity : _opts$bigMaxWidth,
      _opts$bigMaxHeight = opts.bigMaxHeight,
      bigMaxHeight = _opts$bigMaxHeight === undefined ? Infinity : _opts$bigMaxHeight,
      _opts$scaleLastRow2 = opts.scaleLastRow,
      scaleLastRow = _opts$scaleLastRow2 === undefined ? true : _opts$scaleLastRow2,
      _opts$bigScaleLastRow = opts.bigScaleLastRow,
      bigScaleLastRow = _opts$bigScaleLastRow === undefined ? true : _opts$bigScaleLastRow;


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
  var smallOnes = elements.filter(function (element) {
    return !element.big;
  });
  var bigBoxes = [];
  var smallBoxes = [];
  if (bigOnes.length > 0 && smallOnes.length > 0) {
    var bigWidth = void 0;
    var bigHeight = void 0;
    var showBigFirst = bigFirst === true;

    if (availableRatio > getVideoRatio(bigOnes[0])) {
      // We are tall, going to take up the whole width and arrange small
      // guys at the bottom
      bigWidth = containerWidth;
      bigHeight = Math.floor(containerHeight * bigPercentage);
      offsetTop = bigHeight;
      bigOffsetTop = containerHeight - offsetTop;
      if (bigFirst === 'column') {
        showBigFirst = false;
      } else if (bigFirst === 'row') {
        showBigFirst = true;
      }
    } else {
      // We are wide, going to take up the whole height and arrange the small
      // guys on the right
      bigHeight = containerHeight;
      bigWidth = Math.floor(containerWidth * bigPercentage);
      offsetLeft = bigWidth;
      bigOffsetLeft = containerWidth - offsetLeft;
      if (bigFirst === 'column') {
        showBigFirst = true;
      } else if (bigFirst === 'row') {
        showBigFirst = false;
      }
    }
    if (showBigFirst) {
      bigBoxes = getLayout({
        containerWidth: bigWidth,
        containerHeight: bigHeight,
        offsetLeft: 0,
        offsetTop: 0,
        fixedRatio: bigFixedRatio,
        minRatio: bigMinRatio,
        maxRatio: bigMaxRatio,
        alignItems: bigAlignItems,
        maxWidth: bigMaxWidth,
        maxHeight: bigMaxHeight,
        scaleLastRow: bigScaleLastRow
      }, bigOnes);
      smallBoxes = getLayout({
        containerWidth: containerWidth - offsetLeft,
        containerHeight: containerHeight - offsetTop,
        offsetLeft: offsetLeft,
        offsetTop: offsetTop,
        fixedRatio: fixedRatio,
        minRatio: minRatio,
        maxRatio: maxRatio,
        alignItems: smallAlignItems,
        maxWidth: smallMaxWidth,
        maxHeight: smallMaxHeight,
        scaleLastRow: scaleLastRow
      }, smallOnes);
    } else {
      smallBoxes = getLayout({
        containerWidth: containerWidth - offsetLeft,
        containerHeight: containerHeight - offsetTop,
        offsetLeft: 0,
        offsetTop: 0,
        fixedRatio: fixedRatio,
        minRatio: minRatio,
        maxRatio: maxRatio,
        alignItems: smallAlignItems,
        maxWidth: smallMaxWidth,
        maxHeight: smallMaxHeight,
        scaleLastRow: scaleLastRow
      }, smallOnes);
      bigBoxes = getLayout({
        containerWidth: bigWidth,
        containerHeight: bigHeight,
        offsetLeft: bigOffsetLeft,
        offsetTop: bigOffsetTop,
        fixedRatio: bigFixedRatio,
        minRatio: bigMinRatio,
        alignItems: bigAlignItems,
        maxWidth: bigMaxWidth,
        maxHeight: bigMaxHeight,
        scaleLastRow: bigScaleLastRow
      }, bigOnes);
    }
  } else if (bigOnes.length > 0 && smallOnes.length === 0) {
    // We only have one bigOne just center it
    bigBoxes = getLayout({
      containerWidth: containerWidth,
      containerHeight: containerHeight,
      fixedRatio: bigFixedRatio,
      minRatio: bigMinRatio,
      maxRatio: bigMaxRatio,
      alignItems: bigAlignItems,
      maxWidth: bigMaxWidth,
      maxHeight: bigMaxHeight,
      scaleLastRow: bigScaleLastRow
    }, bigOnes);
  } else {
    smallBoxes = getLayout({
      containerWidth: containerWidth - offsetLeft,
      containerHeight: containerHeight - offsetTop,
      offsetLeft: offsetLeft,
      offsetTop: offsetTop,
      fixedRatio: fixedRatio,
      minRatio: minRatio,
      maxRatio: maxRatio,
      alignItems: alignItems,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      scaleLastRow: scaleLastRow
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
    } else {
      boxes[idx] = smallBoxes[smallBoxesIdx];
      smallBoxesIdx += 1;
    }
  });
  return boxes;
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var getLayout = __webpack_require__(0);

module.exports = function (container, opts) {
  function css(el, propertyName, value) {
    if (value) {
      // We are setting one css property
      el.style[propertyName] = value;
      return NaN;
    }
    if ((typeof propertyName === 'undefined' ? 'undefined' : _typeof(propertyName)) === 'object') {
      // We are setting several CSS properties at once
      Object.keys(propertyName).forEach(function (key) {
        css(el, key, propertyName[key]);
      });
      return NaN;
    }
    // We are getting the css property
    var computedStyle = (opts && opts.window || window).getComputedStyle(el);
    var currentValue = computedStyle.getPropertyValue(propertyName);

    if (currentValue === '') {
      currentValue = el.style[propertyName];
    }

    return currentValue;
  }

  var filterDisplayNone = function filterDisplayNone(element) {
    return css(element, 'display') !== 'none';
  };

  function height(el) {
    if (el.offsetHeight > 0) {
      return el.offsetHeight + 'px';
    }
    return css(el, 'height');
  }

  function width(el) {
    if (el.offsetWidth > 0) {
      return el.offsetWidth + 'px';
    }
    return css(el, 'width');
  }

  var positionElement = function positionElement(elem, x, y, w, h, animate, onLayout) {
    var _this = this;

    var targetPosition = {
      left: x + 'px',
      top: y + 'px',
      width: w + 'px',
      height: h + 'px'
    };

    var fixAspectRatio = function fixAspectRatio() {
      var sub = elem.querySelector('.OT_root');
      if (sub) {
        // If this is the parent of a subscriber or publisher then we need
        // to force the mutation observer on the publisher or subscriber to
        // trigger to get it to fix it's layout
        var oldWidth = sub.style.width;
        sub.style.width = w + 'px';
        // sub.style.height = height + 'px';
        sub.style.width = oldWidth || '';
      }
    };

    if (animate && typeof $ !== 'undefined') {
      $(elem).stop();
      $(elem).animate(targetPosition, animate.duration || 200, animate.easing || 'swing', function () {
        fixAspectRatio();
        if (animate.complete) animate.complete.call(_this);
        if (onLayout) {
          onLayout(elem, {
            left: x,
            top: y,
            width: w,
            height: h
          });
        }
      });
    } else {
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

  var _opts$animate = opts.animate,
      animate = _opts$animate === undefined ? false : _opts$animate,
      _opts$bigClass = opts.bigClass,
      bigClass = _opts$bigClass === undefined ? 'OT_big' : _opts$bigClass,
      _opts$ignoreClass = opts.ignoreClass,
      ignoreClass = _opts$ignoreClass === undefined ? 'OT_ignore' : _opts$ignoreClass;


  if (css(container, 'display') === 'none') {
    return;
  }
  var id = container.getAttribute('id');
  if (!id) {
    id = 'OT_' + cheapUUID();
    container.setAttribute('id', id);
  }

  opts.containerHeight = getHeight(container) - getCSSNumber(container, 'borderTop') - getCSSNumber(container, 'borderBottom');
  opts.containerWidth = getWidth(container) - getCSSNumber(container, 'borderLeft') - getCSSNumber(container, 'borderRight');

  var children = Array.prototype.filter.call(container.querySelectorAll('#' + id + '>*:not(.' + ignoreClass + ')'), filterDisplayNone);
  var elements = children.map(function (element) {
    var res = getChildDims(element);
    res.big = element.classList.contains(bigClass);
    return res;
  });

  var boxes = getLayout(opts, elements);
  boxes.forEach(function (box, idx) {
    var elem = children[idx];
    css(elem, 'position', 'absolute');
    var actualWidth = box.width - getCSSNumber(elem, 'paddingLeft') - getCSSNumber(elem, 'paddingRight') - getCSSNumber(elem, 'marginLeft') - getCSSNumber(elem, 'marginRight') - getCSSNumber(elem, 'borderLeft') - getCSSNumber(elem, 'borderRight');

    var actualHeight = box.height - getCSSNumber(elem, 'paddingTop') - getCSSNumber(elem, 'paddingBottom') - getCSSNumber(elem, 'marginTop') - getCSSNumber(elem, 'marginBottom') - getCSSNumber(elem, 'borderTop') - getCSSNumber(elem, 'borderBottom');

    positionElement(elem, box.left, box.top, actualWidth, actualHeight, animate, opts.onLayout);
  });
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

// in CommonJS context, this should be a `require()`d dependency.
// in browser globals context, ...? (when using bower, there are dependencies that it has handled
// for you, so these might be safe to assume)

var getLayout = __webpack_require__(0);
var layout = __webpack_require__(1);

module.exports = function initLayoutContainer(container, opts) {
  var win = opts && opts.window || (typeof window === 'undefined' ? undefined : window);
  container = typeof container === 'string' ? win.document.querySelector(container) : container;
  if (!(typeof (win && win.HTMLElement) === 'undefined' || container instanceof win.HTMLElement) && !opts) {
    // container is actually the options
    opts = container;
  } else if (!opts) {
    opts = {};
  }

  return {
    layout: layout.bind(this, container, opts),
    getLayout: getLayout.bind(this, opts)
  };
};

/***/ })
/******/ ]);
});