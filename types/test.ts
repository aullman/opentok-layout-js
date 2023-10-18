/// <reference path="opentok-layout-js.d.ts" />

import initLayoutContainer, { Options } from "opentok-layout-js";

/* eslint-disable */


const options: Options = {
  maxRatio: 3/2,
  minRatio: 9/16,
  fixedRatio: false,
  alignItems: 'center',
  bigClass: "OT_big",
  bigPercentage: 0.8,
  bigFixedRatio: false,
  bigAlignItems: 'center',
  smallAlignItems: 'center',
  maxWidth: Infinity,
  maxHeight: Infinity,
  smallMaxWidth: Infinity,
  smallMaxHeight: Infinity,
  bigMaxWidth: Infinity,
  bigMaxHeight: Infinity,
  bigMaxRatio: 3/2,
  bigMinRatio: 9/16,
  bigFirst: true,
  animate: true,
  window: window,
  ignoreClass: 'OT_ignore',
  scaleLastRow: true,
  bigScaleLastRow: true,
};

const target = document.createElement('div');

const layout = initLayoutContainer(target, options)

layout.layout();

const boxes = layout.getLayout([
  {
      width: 640,     // The native width of this element (eg. subscriber.videoWidth())
      height: 480,    // The native height of this element (eg. subscriber.videoHeight())
      big: false      // Whether to treat this element as a bigger element
  }
]);
