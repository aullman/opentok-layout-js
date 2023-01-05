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

// in CommonJS context, this should be a `require()`d dependency.
// in browser globals context, ...? (when using bower, there are dependencies that it has handled
// for you, so these might be safe to assume)

import getLayout from './getLayout'
import layout from './layout'
import type { Options, LayoutContainer } from 'opentok-layout-js'

declare global {
  interface Window {
    HTMLElement: typeof HTMLElement;
  }
}

module.exports = function initLayoutContainer(container: HTMLElement | Options, opts: Options): LayoutContainer {
  const win = (opts && opts.window) || (typeof window === 'undefined' ? undefined : window);
  container = typeof container === 'string' ? win.document.querySelector(container) : container;
  if (!(typeof (win && win.HTMLElement) === 'undefined' || container instanceof win.HTMLElement) && !opts) {
    // container is actually the options
    opts = container as Options;
  } else if (!opts) {
    opts = {};
  }

  return {
    layout: layout.bind(this, container, opts),
    getLayout: getLayout.bind(this, opts),
  };
};
