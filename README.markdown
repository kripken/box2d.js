box2d.js
========


**Demo: http://syntensity.com/static/box2d.html**

**Example code to give you an idea of the API: https://github.com/kripken/box2d.js/blob/master/webgl_demo/box2d.html#L14**

box2d.js is a direct port of the Box2D 2D physics engine to JavaScript, using Emscripten. The source code is translated directly to JavaScript, without human rewriting, so functionality should be identical to the original Box2D.

box2d.js is zlib licensed, just like Box2D.

Discussion takes place on IRC at #emscripten on Mozilla's server (irc.mozilla.org)


Details
-------

The automatically generated bindings have not been tested much beyond making sure the WebGL demo works properly.

For general notes on using the bindings, see the ammo.js project (a port of Bullet to JavaScript using Emscripten), many of the details of wrapping classes and so forth are identical.

