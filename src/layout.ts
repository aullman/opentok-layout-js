/// <reference path="../types/opentok-layout-js.d.ts" />

import { Options, Element, OnLayout, Animate, AnimateProps } from 'opentok-layout-js';
import getLayout from './getLayout';

export default (container: HTMLElement, opts: Options) => {
  function css(el: HTMLElement, propertyName: Record<string, string>): typeof NaN
  function css(el: HTMLElement, propertyName: string, value: string): typeof NaN
  function css(el: HTMLElement, propertyName: string): string
  function css(el: HTMLElement, propertyName: string | Record<string, string>, value?: string) {
    if (typeof propertyName === 'string' && value) {
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

  const positionElement = function positionElement(elem: HTMLElement, x: number, y: number, w: number, h: number, animate: Animate, onLayout: OnLayout) {
    const targetPosition = {
      left: `${x}px`,
      top: `${y}px`,
      width: `${w}px`,
      height: `${h}px`,
    };

    const fixAspectRatio = function fixAspectRatio() {
      const sub = elem.querySelector('.OT_root') as HTMLElement;
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
      const animateProps: AnimateProps = typeof animate === 'boolean' ? { duration: 200, easing: 'swing' } : animate;
      $(elem).animate(targetPosition, animateProps.duration, animateProps.easing,
        () => {
          fixAspectRatio();
          if (animateProps.complete) animateProps.complete.call(this);
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

  const getChildDims = function getChildDims(child: HTMLVideoElement | HTMLElement): Omit<Element, 'big'> {
    if (child) {
      if ((child as HTMLVideoElement).videoHeight && (child as HTMLVideoElement).videoWidth) {
        return {
          height: (child as HTMLVideoElement).videoHeight,
          width: (child as HTMLVideoElement).videoWidth,
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

  const getCSSNumber = function getCSSNumber(elem: HTMLElement, prop: string) {
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
    fixedRatioClass = 'OT_fixedRatio',
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
    - getCSSNumber(container, 'border-top')
    - getCSSNumber(container, 'border-bottom');
  opts.containerWidth = getWidth(container)
    - getCSSNumber(container, 'border-left')
    - getCSSNumber(container, 'border-right');

  const children: HTMLElement[] = Array.prototype.filter.call(
    container.querySelectorAll(`#${id}>*:not(.${ignoreClass})`),
    filterDisplayNone
  );
  const elements: Element[] = children.map((element) => {
    return {
      ...getChildDims(element),
      big: element.classList.contains(bigClass),
      fixedRatio: element.classList.contains(fixedRatioClass),
    };
  });

  const layout = getLayout(opts, elements);
  layout.boxes.forEach((box, idx) => {
    const elem = children[idx];
    css(elem, 'position', 'absolute');
    const actualWidth = box.width
      - getCSSNumber(elem, 'margin-left')
      - getCSSNumber(elem, 'margin-right')
      - (css(elem, 'box-sizing') !== 'border-box'
        ? (getCSSNumber(elem, 'padding-left')
          + getCSSNumber(elem, 'padding-right')
          + getCSSNumber(elem, 'border-left')
          + getCSSNumber(elem, 'border-right'))
        : 0);

    const actualHeight = box.height
      - getCSSNumber(elem, 'margin-top')
      - getCSSNumber(elem, 'margin-bottom')
      - (css(elem, 'box-sizing') !== 'border-box'
        ? (getCSSNumber(elem, 'padding-top')
          + getCSSNumber(elem, 'padding-bottom')
          + getCSSNumber(elem, 'border-top')
          + getCSSNumber(elem, 'border-bottom'))
        : 0);

    positionElement(elem, box.left, box.top, actualWidth, actualHeight,
      animate, opts.onLayout);
  });
};
