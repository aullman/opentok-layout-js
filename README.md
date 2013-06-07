layout-container
================

Automatic layout of video elements (publisher and subscriber) minimising white-space for the OpenTok on WebRTC API. This is intended for use with the OpenTok on WebRTC JS API.

It automatically detects when an element is added or when the container is resized and it adjusts the layout of its' children accordingly.

Demo
----

[Demo of layout container in action](http://opentok.github.io/layout-container "Layout-container Demo")

Dependencies
-------

The <a href="http://www.tokbox.com/opentok">OpenTok for WebRTC JS API</a> is required.

Usage
-----

You just need to call `TB.initLayoutContainer` and pass it the element you want it to layout. It works best if you set the position of the element to be absolute or relative.

```javascript
TB.initLayoutContainer(document.getElementById("layout"));
```

In an OpenTok application you would do something like:

```html
<html>
<head>
    <title>Layout Container Example</title>
    <script src="http://www-dev.tokbox.com/webrtc/v2.0/js/TB.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="js/layoutContainer.js" type="text/javascript" charset="utf-8"></script>
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
    
    // Initialize the layout container
    TB.initLayoutContainer(layoutContainer);
    
    // Below is a normal hello world OpenTok application
    // The layout container will detect elements getting added and
    // adjust the layout accordingly
    var sessionId = "mySessionId";
    var token = "myToken";
    var apiKey = "myAPIKey";
    
    var subscribeToStreams = function(streams) {
        for (var i=0; i < streams.length; i++) {
            if (session.connection.connectionId != streams[i].connection.connectionId) {
                var subCont = document.createElement("div");
                subCont.setAttribute("id", streams[i].stream.streamId);
                layoutContainer.appendChild(subCont);
                session.subscribe(streams[i], streams[i].stream.streamId);
            }
        }
    };
    
    var session = TB.initSession(sessionId);
    session.on({
        sessionConnected: function(event){
            subscribeToStreams(event.streams);
            session.publish("publisherContainer");
        },
        streamCreated: function(event){
            subscribeToStreams(event.streams);
        }
    }).connect(apiKey, token);
</script>
</html>
```

Now anything you put into the layout container will automatically be positioned so that it is within

Animations
-------

You can add fancy animations with CSS transitions. This will work in all browsers that support the OpenTok on WebRTC API. eg.

```css
#layout > div {
    -webkit-transition-property: width, height, left, top;
    -webkit-transition-duration: 0.5s;
    -webkit-transition-timing-function: ease-out;
    -moz-transition-property: width, height, left, top;
    -moz-transition-duration: 0.5s;
    transition-property: width, height, left, top;
    transition-duration: 0.5s;
    transition-timing-function: ease-out;
}
```