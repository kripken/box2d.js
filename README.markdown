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

Building
--------

    % git submodule update --init
    % make

This fetches emscripten and uses it to compile a version of the Box2D source code stored within the box2d.js git. This source code has been modified to add constructors to some objects to ensure that emscripten will generate bindings for them.

Using collision events
----------------------

    var world    = new Box2D.b2World(new b2Vec2(0 , 0)),
        listener = new Box2D.b2ContactListener

    Box2D.customizeVTable(listener, [{
      original: Box2D.b2ContactListener.prototype.BeginContact,
      replacement: function (ths, contact) {
        c = Box2D.wrapPointer(contact, Box2D.b2Contact)
        a = c.GetFixtureA()
        b = c.GetFixtureB()

        # now do what you wish with a and b.
      }
    }])

    world.SetContactListener(listener)
