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

const getLayout = require('./getLayout');
const layout = require('./layout');

module.exports = function initLayoutContainer(container, opts) {
  const win = (opts && opts.window) || (typeof window === 'undefined' ? undefined : window);
  container = typeof container === 'string' ? win.document.querySelector(container) : container;
  if (!(typeof (win && win.HTMLElement) === 'undefined' || container instanceof win.HTMLElement) && !opts) {
    // container is actually the options
    opts = container;
  } else if (!opts) {
    opts = {};
  }

  return {
    layout: layout.bind(this, container, opts),
    getLayout: getLayout.bind(this, opts),
  };
};
