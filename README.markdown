box2d.js
========


**Demo: http://kripken.github.io/box2d.js/webgl_demo/box2d.html**

**Example code to give you an idea of the API: https://github.com/kripken/box2d.js/blob/master/webgl_demo/box2d.html#L14**

box2d.js is a direct port of the Box2D 2D physics engine to JavaScript, using Emscripten. The source code is translated directly to JavaScript, without human rewriting, so functionality should be identical to the original Box2D.

box2d.js is zlib licensed, just like Box2D.

Discussion takes place on IRC at #emscripten on Mozilla's server (irc.mozilla.org)


Details
-------

The automatically generated bindings have been tested to the extent that can be found in the examples in the 'testbed'. For general notes on using the bindings, see the [ammo.js](https://github.com/kripken/ammo.js) project (a port of Bullet to JavaScript using Emscripten), many of the details of wrapping classes and so forth are identical.

It seems to be running ok on at least the following:

* Desktop PC (Linux) - Chrome22, Opera12, Firefox16
* Desktop PC (OSX) - Chrome22, Opera12, Firefox16
* Desktop PC (Win7) - Chrome22, Opera12, Firefox16
* iOS 5 - Safari, Chrome, Dolphin
* Android ICS - Chrome18
* Android JB - Chrome18, Dolphin9



Testbed
-------

The html5canvas_demo folder contains an example web page and script files to reproduce the original Box2D testbed, with similar controls and features.

**Demo: http://www.iforce2d.net/embox2d/testbed.html**

Like the original C++ version, the testbed is set up so that adding another test scene is easy. Look in the tests folder and find the template.js file....

1. Copy template.js and rename it.
2. In the renamed file, replace all occurrences of 'embox2dTest_template' with your test name.
3. Fill in the setup function.
4. Optionally, fill in the other functions.
5. Include the new file at the beginning of testbed.html with the other tests.
6. Add the new test option to the "testNumber" select box in test.html

Building
--------

    % git submodule update --init
    % make

This fetches emscripten and uses it to compile a version of the Box2D source code stored within the box2d.js git. This source code has been modified to add constructors to some objects to ensure that emscripten will generate bindings for them.

Usage (non-embind bindings)
-----

<span style="color:#900">The current bindings are likely to be superceded by the new "embind" bindings in the incoming branch, which fixes a lot of limitations in the current bindings. The following section explains some of the basics of using the non-embind bindings.</span>

<span style="color:#f00;font-weight:bold">Note:</span> To improve readability all code snippets below assume that everything in the 'Box2D' namespace has been made available! (Check the 'using' function in `html5canvas_demo/embox2d-helpers.js` for details.)

### Class member variable access

The values of public member variables of Box2D classes (mostly the definition classes) can be set and accessed using the generated functions, which will be the variable name prefixed with `set_` or `get_`, eg.

    //C++
    circleShape.m_radius = 2;

    //javascript
    circleShape.set_m_radius( 2 );

### Vector manipulation

b2Vec2 vectors can be created like:

    var myVec = new b2Vec2( 1.2, 3.4 );

As mentioned above, the individual components of vectors can be obtained with the `get_x()` and `get_y()` functions.

Vectors can be assigned with the = operator but if you are coming from a C++ background, you may be caught out by the fact that this does not result in two independent variables. To get the same behavior as the original C++ assignment you can copy the components like:

    var anotherVec = new b2Vec2( vec.get_x(), vec.get_y() );

Alternatively the assignment, addition and subtraction operators can be replaced with the functions below (however, experience shows these to be somewhat dodgy...)

    operator       name in JS
    --------       ----------
        =            op_set
        +            op_add
        -            op_sub

### Creating a world

A typical world can be created like:

    var world = new b2World( new b2Vec2(0.0, -10.0) );

### Creating bodies

A static body can be created like:

    var groundBody = world.CreateBody( new b2BodyDef() );

... and dynamic/kinematic bodies like:

    var bodyDef = new b2BodyDef();
    bodyDef.set_type( b2_dynamicBody );
    var dynamicBody = world.CreateBody( bodyDef );

### Creating fixtures

A circle fixture with density 1 and default values for everything else (friction, restitution etc):

    var circleShape = new b2CircleShape();
    circleShape.set_m_radius( 0.5 );
    body.CreateFixture( circleShape, 1.0 );

A circle fixture with some more specific settings:

    var fixtureDef = new b2FixtureDef();
    fixtureDef.set_density( 2.5 );
    fixtureDef.set_friction( 0.6 );
    fixtureDef.set_shape( circleShape );
    body.CreateFixture( fixtureDef );

An edge shape:

    var edgeShape = new b2EdgeShape();
    edgeShape.Set( new b2Vec2( -20, 3 ), new b2Vec2( 20, 7 ) );
    fixtureDef.set_shape( edgeShape );
    body.CreateFixture( fixtureDef );

Creating polygon shapes seems to be somewhat messy with the current bindings, so the recommended way is to use the `createPolygonShape` helper function in embox2d-helpers.js:

    var verts = [];
    verts.push( new b2Vec2( 7,-1 ) );
    verts.push( new b2Vec2( 8,-2 ) );
    verts.push( new b2Vec2( 9, 3 ) );
    verts.push( new b2Vec2( 7, 1 ) );
    var polygonShape = createPolygonShape( verts );
    fixtureDef.set_shape( polygonShape );
    body.CreateFixture( fixtureDef );

Likewise for chain shapes: <span style="color:#900">*Edit: seems to be a problem with this, best to avoid chain shapes for now*</span>

    var chainShape = createChainShape( verts, true ); //true for closed loop, false for open chain
    fixtureDef.set_shape( chainShape );
    body.CreateFixture( fixtureDef );

### Creating joints

Example revolute joint:

    var jointDef = new b2RevoluteJointDef();
    jointDef.set_bodyA( body1 );
    jointDef.set_bodyB( body2 );
    jointDef.set_localAnchorA( new b2Vec2( 1, 2 ) );
    jointDef.set_localAnchorB( new b2Vec2( 3, 4 ) );
    jointDef.set_collideConnected( true );
    var revoluteJoint = Box2D.castObject( world.CreateJoint( jointDef ), b2WheelJoint );

### Using debug draw

The customizeVTable function can be used to replace the functions of a b2Draw object:

    var debugDraw = new Box2D.b2Draw();

    Box2D.customizeVTable(debugDraw, [{
        original: Box2D.b2Draw.prototype.DrawSegment,
        replacement:
            function(thsPtr, vert1Ptr, vert2Ptr, colorPtr ) {
                setColorFromDebugDrawCallback( colorPtr );
                drawSegment( vert1Ptr, vert2Ptr );
            }
    }]);

    world.SetDebugDraw( myDebugDraw );

The first parameter given to the callback function (`thsPtr` in the example above) will be the object emscripten uses to store the class itself and can be ignored. The other parameters will also be pointers to data inside emscripten's innards, so you'll need to wrap them to get the data type you are looking for. Here are the two functions mentioned above, as an example of how you would wrap the passed `b2Color` and `b2Vec2` parameters and use them in your drawing. This example is to draw on a HTML5 canvas:

    function setColorFromDebugDrawCallback( colorPtr ) {
        var color = Box2D.wrapPointer( colorPtr, b2Color );
        var red = (color.get_r() * 255) | 0;
        var green = (color.get_g() * 255) | 0;
        var blue = (color.get_b() * 255) | 0;

        var colorStr = red + "," + green + "," + blue;
        context.fillStyle = "rgba(" + colorStr + ",0.5)";
        context.strokeStyle = "rgb(" + colorStr + ")";
    }

    function drawSegment( vert1Ptr, vert2Ptr ) {
        var vert1 = Box2D.wrapPointer( vert1Ptr, b2Vec2 );
        var vert2 = Box2D.wrapPointer( vert2Ptr, b2Vec2 );

        context.beginPath();
        context.moveTo( vert1.get_x(), vert1.get_y() );
        context.lineTo( vert2.get_x(), vert2.get_y() );
        context.stroke();
    }

Accessing the vertex arrays passed to other functions such as DrawPolygon are somewhat more tricky - please see the embox2d-html5canvas-debugDraw.js source for an example.

### Using collision events

Contact listener callbacks are also implemented with customizeVTable.

    listener = new b2ContactListener();

    Box2D.customizeVTable(listener, [{
        original: Box2D.b2ContactListener.prototype.BeginContact,
        replacement:
            function (thsPtr, contactPtr) {
                var contact = Box2D.wrapPointer( contactPtr, b2Contact );
                var fixtureA = contact.GetFixtureA();
                var fixtureB = contact.GetFixtureB();

                // now do what you wish with the fixtures
            }
    }])

    world.SetContactListener( listener );

### Using world callbacks

Callbacks for other uses such as world querying and raycasting can also be implemented with customizeVTable. Here is the callback used in the 'testbed' to find the fixture that the mouse cursor is over when the left button is clicked:

    myQueryCallback = new b2QueryCallback();

    Box2D.customizeVTable(myQueryCallback, [{
        original: Box2D.b2QueryCallback.prototype.ReportFixture,
        replacement:
            function(thsPtr, fixturePtr) {
                var ths = Box2D.wrapPointer( thsPtr, b2QueryCallback );
                var fixture = Box2D.wrapPointer( fixturePtr, b2Fixture );
                if ( fixture.GetBody().GetType() != Box2D.b2_dynamicBody ) //mouse cannot drag static bodies around
                    return true;
                // at this point we know the mouse is inside the AABB of this fixture,
                // but we need to check if it's actually inside the fixture as well
                if ( ! fixture.TestPoint( ths.m_point ) )
                    return true;
                ths.m_fixture = fixture;
                return false;
            }
    }]);

The callback is used like:

    myQueryCallback.m_fixture = null;
    myQueryCallback.m_point = new b2Vec2( mouseX, mouseY );

    world.QueryAABB( myQueryCallback, aabb ); // the AABB is a tiny square around the current mouse position

    if ( myQueryCallback.m_fixture ) {
        //do something with the fixture that was clicked
    }

