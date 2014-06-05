opentok-layout-js
================

Automatic layout of video elements (publisher and subscriber) minimising white-space for the OpenTok on WebRTC API. This is intended for use with the OpenTok on WebRTC JS API.

It automatically detects when an element is added or when the container is resized and it adjusts the layout of its' children accordingly.

Demo
----

[Demo of layout container in action](http://aullman.github.io/opentok-layout-js/ "Layout-container Demo")

Dependencies
-------

The <a href="http://www.tokbox.com/opentok">OpenTok for WebRTC JS API</a> is required.

Usage
-----

Call `TB.initLayoutContainer` and pass it the element you want it to layout. It works best if you set the position of the element to be absolute or relative. You will then be returned an object with a layout method that you can call to layout the page.

```javascript
var layout = TB.initLayoutContainer(document.getElementById("layout"), {
    maxRatio: 3/2,     // The narrowest ratio that will be used (default 2x3)
    minRatio: 9/16,      // The widest ratio that will be used (default 16x9)
    fixedRatio: false,  // If this is true then the aspect ratio of the video is maintained and minRatio and maxRatio are ignored (default false)
    animate: false      // Whether to use jQuery animate when positioning (default false)
    bigClass: "OT_big", // The class to add to elements that should be sized bigger
    bigPercentage: 0.8  // The maximum percentage of space the big ones should take up
    bigFixedRatio: false, // fixedRatio for the big ones
    bigMaxRatio: 3/2,     // The narrowest ratio to use for the big elements (default 2x3)
    bigMinRatio: 9/16,     // The widest ratio to use for the big elements (default 16x9)
    bigFirst: true        // Whether to place the big one in the top left (true) or bottom right
});
layout.layout()
```

In an OpenTok application you would do something like:

```html
<html>
<head>
    <title>Layout Container Example</title>
    <script src="http://static.opentok.com/webrtc/v2.2/js/TB.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="js/opentok-layout.min.js" type="text/javascript" charset="utf-8"></script>
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
    var layout = TB.initLayoutContainer(layoutContainer).layout;
    
    // Below is a normal hello world OpenTok application for v2.2 of the API
    // The layout container will redraw when the layout mtehod is called and
    // adjust the layout accordingly
    var sessionId = "mySessionId";
    var token = "myToken";
    var apiKey = "myAPIKey";
    
    var session = TB.initSession(sessionId);
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

If you want to use the animate property you will need to include the jQuery library and set the animate option to true and it will use the default values for animate (duration=200, easing="swing"). You can also specify your own values and a completion handler. For more details about the jQuery animate property see the [jQuery documentation](http://api.jquery.com/animate/).

```javascript
var layout = TB.initLayoutContainer(document.getElementById("layout"), {
  animate: {
    duration: 500,
    easing: "linear",
    complete: function() {
      console.log('finished moving ' + this);
    }
  }
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
