
var embox2dTest_ropeJoint = function() {
    //constructor
}

embox2dTest_ropeJoint.prototype.setNiceViewCenter = function() {
    PTM = 24;
    setViewCenterWorld( new b2Vec2(0,8), true );
}

embox2dTest_ropeJoint.prototype.setup = function() {
    //set up the Box2D scene here - the world is already created
    var ground = world.CreateBody(new b2BodyDef());
    {
        var shape = new b2EdgeShape();
        shape.Set(new b2Vec2(-40.0, 0.0), new b2Vec2(40.0, 0.0));
        ground.CreateFixture(shape, 0.0);
    }

    {
        var shape = new b2PolygonShape();
        shape.SetAsBox(0.5, 0.125);

        var fd = new b2FixtureDef();
        fd.set_shape(shape);
        fd.set_density(20.0);
        fd.set_friction(0.2);
        fd.get_filter().set_categoryBits(0x0001);
        fd.get_filter().set_maskBits(0xFFFF & ~0x0002);

        var jd = new b2RevoluteJointDef();
        jd.set_collideConnected(false);

        var N = 10;
        var y = 15.0;
        var ropeDef = new b2RopeJointDef();
        ropeDef.get_localAnchorA().Set(0.0, y);

        var prevBody = ground;
        for (var i = 0; i < N; ++i)
        {
            var bd = new b2BodyDef();
            // bd.set_type(b2_dynamicBody);
            bd.set_type(Module.b2_dynamicBody);
            bd.set_position(new b2Vec2(0.5 + 1.0 * i, y));
            if (i == N - 1)
            {
                shape.SetAsBox(1.5, 1.5);
                fd.set_density = 100.0;
                fd.get_filter().set_categoryBits(0x0002);
                bd.set_position(new b2Vec2(1.0 * i, y));
                bd.set_angularDamping(0.4);
            }

            var body = world.CreateBody(bd);

            body.CreateFixture(fd);

            var anchor = new b2Vec2(i, y);
            jd.Initialize(prevBody, body, anchor);
            world.CreateJoint(jd);

            prevBody = body;
        }

        ropeDef.set_localAnchorB(new b2Vec2(0,0));

        var extraLength = 0.01;
        ropeDef.set_maxLength(N - 1.0 + extraLength);
        ropeDef.set_bodyB(prevBody);
    }

    {
        ropeDef.set_bodyA(ground);
        world.CreateJoint(ropeDef);
    }
}
