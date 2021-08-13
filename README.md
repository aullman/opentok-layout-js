[![Demo of Layout Container](https://github.com/aullman/opentok-layout-js/raw/master/layout-demo.gif)](https://aullman.github.io/opentok-layout-js/ "Layout-container Demo")

opentok-layout-js
================

Automatic layout of video elements (publisher and subscriber) minimising white-space for the OpenTok on WebRTC API. This is intended for use with the OpenTok on WebRTC JS API but can be used for any case where you're trying to fit multiple videos into a box. It could possibly be used for Photos as well.

It automatically detects when an element is added or when the container is resized and it adjusts the layout of its' children accordingly. It can also arrange items with different aspect ratios and maintain their aspect ratios without cropping.

The difference between this layout algorithm and other similar photo layout algorithms, such as the [Flickr Justified Layout](https://github.com/flickr/justified-layout) algorithm, is that this has a constrained height as well as width. The assumption is that when you're viewing video you want all videos to be visible at the same time. You don't want to scroll down to continue to view the list. So this algorithm fits everything inside a box and tries to minimize the amount of whitespace.

Demo
----

[Demo of layout container in action](https://aullman.github.io/opentok-layout-js/ "Layout-container Demo")

Dependencies
-------

The <a href="http://www.tokbox.com/opentok">OpenTok for WebRTC JS API</a> is required.

Usage
-----

Call `initLayoutContainer` and pass it the element you want it to layout. It works best if you set the position of the element to be absolute or relative. You will then be returned an object with a layout method that you can call to layout the elements inside.

```javascript
const initLayoutContainer = require('opentok-layout-js');
const options = {
    maxRatio: 3/2,             // The narrowest ratio that will be used (default 2x3)
    minRatio: 9/16,            // The widest ratio that will be used (default 16x9)
    fixedRatio: false,         // If this is true then the aspect ratio of the video is maintained and minRatio and maxRatio are ignored (default false)
    scaleLastRow: true,        // If there are less elements on the last row then we can scale them up to take up more space
    alignItems: 'center',      // Can be 'start', 'center' or 'end'. Determines where to place items when on a row or column that is not full
    bigClass: "OT_big",        // The class to add to elements that should be sized bigger
    bigPercentage: 0.8,        // The maximum percentage of space the big ones should take up
    minBigPercentage: 0,       // If this is set then it will scale down the big space if there is left over whitespace down to this minimum size
    bigFixedRatio: false,      // fixedRatio for the big ones
    bigScaleLastRow: true,     // scale last row for the big elements
    bigAlignItems: 'center',   // How to align the big items
    smallAlignItems: 'center', // How to align the small row or column of items if there is a big one
    maxWidth: Infinity,        // The maximum width of the elements
    maxHeight: Infinity,       // The maximum height of the elements
    smallMaxWidth: Infinity,   // The maximum width of the small elements
    smallMaxHeight: Infinity,  // The maximum height of the small elements
    bigMaxWidth: Infinity,     // The maximum width of the big elements
    bigMaxHeight: Infinity,    // The maximum height of the big elements
    bigMaxRatio: 3/2,          // The narrowest ratio to use for the big elements (default 2x3)
    bigMinRatio: 9/16,         // The widest ratio to use for the big elements (default 16x9)
    bigFirst: true,            // Whether to place the big one in the top left (true) or bottom right (false).
                               // You can also pass 'column' or 'row' to change whether big is first when you are in a row (bottom) or a column (right) layout
    animate: true,             // Whether you want to animate the transitions using jQuery (not recommended, use CSS transitions instead)
    window: window,            // Lets you pass in your own window object which should be the same window that the element is in
    ignoreClass: 'OT_ignore',  // Elements with this class will be ignored and not positioned. This lets you do things like picture-in-picture
    onLayout: null,            // A function that gets called every time an element is moved or resized, (element, { left, top, width, height }) => {} 
};
const layout = initLayoutContainer(document.getElementById("layout"), options);
layout.layout();
```

The other way to use this library is to just use the `getLayout()` method to get the layout data and position the elements yourself. `getLayout()` takes an array of objects with a width and height property along with a `big` property indicating whether it should be treated as a bigger element. eg.

```javascript
const layout = initLayoutContainer(options);
const boxes = layout.getLayout([
    {
        width: 640,     // The native width of this element (eg. subscriber.videoWidth())
        height: 480,    // The native height of this element (eg. subscriber.videoHeight())
        big: false      // Whether to treat this element as a bigger element
    }
]);
```

It will return an array of boxes which will be in the same order as the array you passed in. Each element in the array will look like:

```javascript
{
    width,
    height,
    top,
    left
}
```

Examples
----

### Cropping videos to fit best.

In this example we crop the videos to take up the most space in the window.

```javascript
initLayoutContainer(document.getElementById("layout"));
```

![Cropping videos to fit best](https://github.com/aullman/opentok-layout-js/raw/master/standard-cropping.png)

### Respecting different aspect ratios

In this example we are respecting the native aspect ratio of multiple different videos.

```javascript
initLayoutContainer(document.getElementById("layout"), {
  fixedRatio: true
});
```

![Respecting different aspect ratios](https://github.com/aullman/opentok-layout-js/raw/master/standard-fixed-ratio.png)

### Some big videos

This example has 2 big videos focused and the other 4 small.

![Some big videos](https://github.com/aullman/opentok-layout-js/raw/master/2-big-4-small.png)

## Some big respecting aspect ratios

This example has 2 big and we're respecting the native aspect ratios of the different videos.

![Some big respecting aspect ratios](https://github.com/aullman/opentok-layout-js/raw/master/2-bit-4-small-fixed-ratio.png)


## Using in an OpenTok Application

In an OpenTok application you would do something like:

```html
<html>
<head>
    <title>Layout Container Example</title>
    <script src="http://static.opentok.com/v2/js/opentok.min.js"></script>
    <script src="js/opentok-layout.min.js"></script>
    <style type="text/css" media="screen">
        #layoutContainer {
            width: 320px;
            height: 240px;
            background-color: #DDD;
            position:relative;
        }
    </style>
</head>
<body>
    <div id="layoutContainer">
        <div id="publisherContainer"></div>
    </div>
</body>
<script type="text/javascript" charset="utf-8">
    var layoutContainer = document.getElementById("layoutContainer");

    // Initialize the layout container and get a reference to the layout method
    var layout = initLayoutContainer(layoutContainer).layout;

    // Below is a normal hello world OpenTok application for v2 of the API
    // The layout container will redraw when the layout mtehod is called and
    // adjust the layout accordingly
    var sessionId = "mySessionId";
    var token = "myToken";
    var apiKey = "myAPIKey";

    var session = OT.initSession(sessionId);
    session.on("streamCreated", function(event){
        session.subscribe(event.stream, "layoutContainer", {
            insertMode: "append"
        });
        layout();
    }).connect(apiKey, token, function (err) {
        if (!err) {
            session.publish("publisherContainer");
            layout();
        }
    });
</script>
</html>
```

Now any time you call the `layout` method the layout container will automatically be positioned and sized so that it minimises the white-space within the box given.

Resizing the Window
---------------

You want to call the layout method any time the size of the layout container changes. If the size of the container varies depending on the size of the window you may need to do:

```javascript
var resizeTimeout;
window.onresize = function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function () {
    layout();
  }, 20);
};
```

This throttles calling layout so that it's not called over an over again when you're resizing the window.

Animations
-------

If you want to animate things you can use CSS3 transitions on the children. eg.

```css
.container > * {
  transition-property: all;
  transition-duration: 0.5s;
}
```

This library adds an `ot-layout` className to elements once they have been layed out. This allows you to specify an initial transition for new elements being added like so:

```css
.container > * {
    width: 0;
    height: 0;
    opacity: 0;
}

.container > *.ot-layout {
    opacity: 1;
}
```

This will make the elements be size 0x0 with opacity 0 when they are first added. Then when they have the `ot-layout` className added they will grow to the right size and fade in. You can see this effect in the [demo](https://aullman.github.io/opentok-layout-js/ "Layout-container Demo").

Then if you want elements to fade out you can remove the `ot-layout` class from them before removing them from the DOM. Like so:

```javascript
session.on('streamDestroyed', (event) => {
  event.preventDefault();
  session.getSubscribersForStream(event.stream).forEach((subscriber) => {
    subscriber.element.classList.remove('ot-layout');
    setTimeout(() => {
      subscriber.destroy();
      layout();
    }, 200);
  });
});
```

Big Elements
--------

If you add the `bigClass` to elements in the layout container they will be treated differently. They are essentially in a layout container of their own which takes up `bigPercentage` of the space and has it's own settings for ratios (`bigMaxRatio`, `bigMinRatio`, `bigFixedRatio`).

You can have multiple elements which are treated as big elements which allow you to have all kinds of different layouts.

To see how this works try the [demo](https://aullman.github.io/opentok-layout-js "Layout-container Demo") and double click on elements.


Padding, Margins and Borders
----------

The Layout Container will take into account the padding, margins and borders on it's children. If you want spacing between elements simply give them a margin or padding and they will be spaced accordingly.
