const getLayout = require('./getLayout');

module.exports = (container, opts) => {
  function css(el, propertyName, value) {
    if (value) {
      // We are setting one css property
      el.style[propertyName] = value;
      return NaN;
    }
    if (typeof propertyName === 'object') {
      // We are setting several CSS properties at once
      Object.keys(propertyName).forEach((key) => {
        css(el, key, propertyName[key]);
      });
      return NaN;
    }
    // We are getting the css property
    const computedStyle = ((opts && opts.window) || window).getComputedStyle(el);
    let currentValue = computedStyle.getPropertyValue(propertyName);

    if (currentValue === '') {
      currentValue = el.style[propertyName];
    }

    return currentValue;
  }

  const filterDisplayNone = element => css(element, 'display') !== 'none';

  function height(el) {
    if (el.offsetHeight > 0) {
      return `${el.offsetHeight}px`;
    }
    return css(el, 'height');
  }

  function width(el) {
    if (el.offsetWidth > 0) {
      return `${el.offsetWidth}px`;
    }
    return css(el, 'width');
  }

  const positionElement = function positionElement(elem, x, y, w, h, animate, onLayout) {
    const targetPosition = {
      left: `${x}px`,
      top: `${y}px`,
      width: `${w}px`,
      height: `${h}px`,
    };

    const fixAspectRatio = function fixAspectRatio() {
      const sub = elem.querySelector('.OT_root');
      if (sub) {
        // If this is the parent of a subscriber or publisher then we need
        // to force the mutation observer on the publisher or subscriber to
        // trigger to get it to fix it's layout
        const oldWidth = sub.style.width;
        sub.style.width = `${w}px`;
        // sub.style.height = height + 'px';
        sub.style.width = oldWidth || '';
      }
    };

    if (animate && typeof $ !== 'undefined') {
      $(elem).stop();
      $(elem).animate(targetPosition, animate.duration || 200, animate.easing || 'swing',
        () => {
          fixAspectRatio();
          if (animate.complete) animate.complete.call(this);
          if (onLayout) {
            onLayout(elem, {
              left: x,
              top: y,
              width: w,
              height: h,
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
          height: h,
        });
      }
    }
    fixAspectRatio();
  };

  const getChildDims = function getChildDims(child) {
    if (child) {
      if (child.videoHeight && child.videoWidth) {
        return {
          height: child.videoHeight,
          width: child.videoWidth,
        };
      }
      const video = child.querySelector('video');
      if (video && video.videoHeight && video.videoWidth) {
        return {
          height: video.videoHeight,
          width: video.videoWidth,
        };
      }
    }
    return {
      height: 480,
      width: 640,
    };
  };

  const getCSSNumber = function getCSSNumber(elem, prop) {
    const cssStr = css(elem, prop);
    return cssStr ? parseInt(cssStr, 10) : 0;
  };

  // Really cheap UUID function
  const cheapUUID = function cheapUUID() {
    return (Math.random() * 100000000).toFixed(0);
  };

  const getHeight = function getHeight(elem) {
    const heightStr = height(elem);
    return heightStr ? parseInt(heightStr, 10) : 0;
  };

  const getWidth = function getWidth(elem) {
    const widthStr = width(elem);
    return widthStr ? parseInt(widthStr, 10) : 0;
  };

  const {
    animate = false,
    bigClass = 'OT_big',
    ignoreClass = 'OT_ignore',
  } = opts;

  if (css(container, 'display') === 'none') {
    return;
  }
  let id = container.getAttribute('id');
  if (!id) {
    id = `OT_${cheapUUID()}`;
    container.setAttribute('id', id);
  }

  opts.containerHeight = getHeight(container)
    - getCSSNumber(container, 'borderTop')
    - getCSSNumber(container, 'borderBottom');
  opts.containerWidth = getWidth(container)
    - getCSSNumber(container, 'borderLeft')
    - getCSSNumber(container, 'borderRight');

  const children = Array.prototype.filter.call(
    container.querySelectorAll(`#${id}>*:not(.${ignoreClass})`),
    filterDisplayNone
  );
  const elements = children.map((element) => {
    const res = getChildDims(element);
    res.big = element.classList.contains(bigClass);
    return res;
  });

  const boxes = getLayout(opts, elements);
  boxes.forEach((box, idx) => {
    const elem = children[idx];
    css(elem, 'position', 'absolute');
    const actualWidth = box.width - getCSSNumber(elem, 'paddingLeft')
      - getCSSNumber(elem, 'paddingRight')
      - getCSSNumber(elem, 'marginLeft')
      - getCSSNumber(elem, 'marginRight')
      - getCSSNumber(elem, 'borderLeft')
      - getCSSNumber(elem, 'borderRight');

    const actualHeight = box.height - getCSSNumber(elem, 'paddingTop')
      - getCSSNumber(elem, 'paddingBottom')
      - getCSSNumber(elem, 'marginTop')
      - getCSSNumber(elem, 'marginBottom')
      - getCSSNumber(elem, 'borderTop')
      - getCSSNumber(elem, 'borderBottom');

    positionElement(elem, box.left, box.top, actualWidth, actualHeight,
      animate, opts.onLayout);
  });
};
