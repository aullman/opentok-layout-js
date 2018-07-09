const getLayout = require('./getLayout');

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
  const computedStyle = getComputedStyle(el);
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

const positionElement = function positionElement(elem, x, y, w, h, animate) {
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

  if (animate && $) {
    $(elem).stop();
    $(elem).animate(targetPosition, animate.duration || 200, animate.easing || 'swing',
      () => {
        fixAspectRatio();
        if (animate.complete) animate.complete.call(this);
      });
  } else {
    css(elem, targetPosition);
    if (!elem.classList.contains('ot-layout')) {
      elem.classList.add('ot-layout');
    }
  }
  fixAspectRatio();
};

const getVideoRatio = function getVideoRatio(elem) {
  if (!elem) {
    return 3 / 4;
  }
  const video = elem.querySelector('video');
  if (video && video.videoHeight && video.videoWidth) {
    return video.videoHeight / video.videoWidth;
  }
  if (elem.videoHeight && elem.videoWidth) {
    return elem.videoHeight / elem.videoWidth;
  }
  return 3 / 4;
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

const arrange = function arrange(children, containerWidth, containerHeight, offsetLeft, offsetTop,
  fixedRatio, minRatio, maxRatio, animate) {
  const boxes = getLayout({
    containerWidth,
    containerHeight,
    minRatio,
    maxRatio,
    fixedRatio,
  }, children.map(child => getVideoRatio(child)));

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

    positionElement(elem, box.left + offsetLeft, box.top + offsetTop, actualWidth, actualHeight,
      animate);
  });
};

module.exports = (container, opts) => {
  const {
    maxRatio = 3 / 2,
    minRatio = 9 / 16,
    fixedRatio = false,
    animate = false,
    bigClass = 'OT_big',
    bigPercentage = 0.8,
    bigFixedRatio = false,
    bigMaxRatio = 3 / 2,
    bigMinRatio = 9 / 16,
    bigFirst = true,
  } = opts;
  let {
    containerWidth = 640,
    containerHeight = 480,
  } = opts;

  if (css(container, 'display') === 'none') {
    return;
  }
  let id = container.getAttribute('id');
  if (!id) {
    id = `OT_${cheapUUID()}`;
    container.setAttribute('id', id);
  }

  containerHeight = getHeight(container)
    - getCSSNumber(container, 'borderTop')
    - getCSSNumber(container, 'borderBottom');
  containerWidth = getWidth(container)
    - getCSSNumber(container, 'borderLeft')
    - getCSSNumber(container, 'borderRight');
  const availableRatio = containerHeight / containerWidth;
  let offsetLeft = 0;
  let offsetTop = 0;
  let bigOffsetTop = 0;
  let bigOffsetLeft = 0;
  const bigOnes = Array.prototype.filter.call(
    container.querySelectorAll(`#${id}>.${bigClass}`),
    filterDisplayNone
  );
  const smallOnes = Array.prototype.filter.call(
    container.querySelectorAll(`#${id}>*:not(.${bigClass})`),
    filterDisplayNone
  );

  if (bigOnes.length > 0 && smallOnes.length > 0) {
    let bigWidth;
    let
      bigHeight;

    if (availableRatio > getVideoRatio(bigOnes[0])) {
      // We are tall, going to take up the whole width and arrange small
      // guys at the bottom
      bigWidth = containerWidth;
      bigHeight = Math.floor(containerHeight * bigPercentage);
      offsetTop = bigHeight;
      bigOffsetTop = containerHeight - offsetTop;
    } else {
      // We are wide, going to take up the whole height and arrange the small
      // guys on the right
      bigHeight = containerHeight;
      bigWidth = Math.floor(containerWidth * bigPercentage);
      offsetLeft = bigWidth;
      bigOffsetLeft = containerWidth - offsetLeft;
    }
    if (bigFirst) {
      arrange(bigOnes, bigWidth, bigHeight, 0, 0, bigFixedRatio, bigMinRatio,
        bigMaxRatio, animate);
      arrange(smallOnes, containerWidth - offsetLeft, containerHeight - offsetTop, offsetLeft,
        offsetTop, fixedRatio, minRatio, maxRatio, animate);
    } else {
      arrange(smallOnes, containerWidth - offsetLeft, containerHeight - offsetTop, 0, 0, fixedRatio,
        minRatio, maxRatio, animate);
      arrange(bigOnes, bigWidth, bigHeight, bigOffsetLeft, bigOffsetTop,
        bigFixedRatio, bigMinRatio, bigMaxRatio, animate);
    }
  } else if (bigOnes.length > 0 && smallOnes.length === 0) {
    // We only have one bigOne just center it
    arrange(bigOnes, containerWidth, containerHeight, 0, 0, bigFixedRatio, bigMinRatio,
      bigMaxRatio, animate);
  } else {
    arrange(smallOnes, containerWidth - offsetLeft, containerHeight - offsetTop, offsetLeft,
      offsetTop, fixedRatio, minRatio, maxRatio, animate);
  }
};
