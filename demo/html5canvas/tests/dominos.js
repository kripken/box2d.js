
var embox2dTest_dominos = function() {
    //constructor
}

embox2dTest_dominos.prototype.setNiceViewCenter = function() {
    //called once when the user changes to this test from another test
    PTM = 26;
    setViewCenterWorld( new b2Vec2(0,8), true );
}

embox2dTest_dominos.prototype.setup = function() {
    //set up the Box2D scene here - the world is already created
    
    var shape = new b2EdgeShape();
    shape.Set(new b2Vec2(-40.0, 0.0), new b2Vec2(40.0, 0.0));
    
    var ground = world.CreateBody(new b2BodyDef());
    ground.CreateFixture(shape, 0.0);
    
    shape = new b2PolygonShape();
    shape.SetAsBox(6.0, 0.25, new b2Vec2(-1.5, 10.0), 0);
    ground.CreateFixture(shape, 0.0);
    
    shape.SetAsBox(7.0, 0.25, new b2Vec2(1.0, 6.0), 0.3);
    ground.CreateFixture(shape, 0.0);
    
    shape.SetAsBox(0.25, 1.5, new b2Vec2(-7.0, 4.0), 0.0);
    ground.CreateFixture(shape, 0.0);
    
    //dominos
    {
        var shape = new b2PolygonShape();
        shape.SetAsBox(0.1, 1.0);
    
        var fd = new b2FixtureDef();
        fd.set_shape(shape);
        fd.set_density(20.0);
        fd.set_friction(0.1);
    
        for (var i = 0; i < 10; ++i)
        {
            var bd = new b2BodyDef();
            // bd.set_type(b2_dynamicBody);
            bd.set_type(Module.b2_dynamicBody);
            bd.set_position(new b2Vec2(-6.0 + 1.0 * i, 11.25));
            var body = world.CreateBody(bd);
            body.CreateFixture(fd);
        }
    }
     
    var jd = new b2RevoluteJointDef();
        
    //see-saw
    var seesawBody;
    {
        var shape = new b2PolygonShape();
        shape.SetAsBox(6.0, 0.125);
    
        var bd = new b2BodyDef();
        // bd.set_type(b2_dynamicBody);
        bd.set_type(Module.b2_dynamicBody);
        bd.set_position(new b2Vec2(-0.9, 1.0));
        bd.set_angle(-0.15);
    
        seesawBody = world.CreateBody(bd);
        seesawBody.CreateFixture(shape, 10.0);
        
        var anchor = new b2Vec2(-2.0, 1.0);
        jd.Initialize(ground, seesawBody, anchor);
        jd.set_collideConnected(true);
        world.CreateJoint(jd);
    }
    
    //pendulum
    {
        var shape = new b2PolygonShape();
        shape.SetAsBox(0.25, 0.25);
    
        var bd = new b2BodyDef();
        // bd.set_type(b2_dynamicBody);
        bd.set_type(Module.b2_dynamicBody);
        bd.set_position(new b2Vec2(-10.0, 15.0));
        var b4 = world.CreateBody(bd);
        b4.CreateFixture(shape, 10.0);
        
        anchor.Set(-7.0, 15.0);
        jd.Initialize(ground, b4, anchor);
        world.CreateJoint(jd);
    }    
    
    //cradle holding balls
    var cradleBody;
    {
        var bd = new b2BodyDef();
        // bd.set_type(b2_dynamicBody);
        bd.set_type(Module.b2_dynamicBody);
        bd.set_position(new b2Vec2(6.5, 3.0));
        cradleBody = world.CreateBody(bd);
    
        var shape = new b2PolygonShape();
        var fd = new b2FixtureDef();
    
        fd.set_shape(shape);
        fd.set_density(10.0);
        fd.set_friction(0.1);
    
        shape.SetAsBox(1.0, 0.1, new b2Vec2(0.0, -0.9), 0.0);
        cradleBody.CreateFixture(fd);
    
        shape.SetAsBox(0.1, 1.0, new b2Vec2(-0.9, 0.0), 0.0);
        cradleBody.CreateFixture(fd);
    
        shape.SetAsBox(0.1, 1.0, new b2Vec2(0.9, 0.0), 0.0);
        cradleBody.CreateFixture(fd);
    
        anchor.Set(6.0, 2.0);
        jd.Initialize(ground, cradleBody, anchor);
        world.CreateJoint(jd);
    }
    
    //lid on top of cradle
    var lidBody;
    {
        var shape = new b2PolygonShape();
        shape.SetAsBox(1.0, 0.1);
    
        var bd = new b2BodyDef();
        // bd.set_type(b2_dynamicBody);
        bd.set_type(Module.b2_dynamicBody);
        bd.set_position(new b2Vec2(6.5, 4.1));
        lidBody = world.CreateBody(bd);
        lidBody.CreateFixture(shape, 30.0);
    
        anchor.Set(7.5, 4.0);
        jd.Initialize(cradleBody, lidBody, anchor);
        world.CreateJoint(jd);
    }
    
    //prop to support cradle
    var propBody;
    {
        var shape = new b2PolygonShape();
        shape.SetAsBox(0.1, 1.0);
    
        var bd = new b2BodyDef();
        // bd.set_type(b2_dynamicBody);
        bd.set_type(Module.b2_dynamicBody);
        bd.set_position(new b2Vec2(7.4, 1.0));
    
        propBody = world.CreateBody(bd);
        propBody.CreateFixture(shape, 10.0);
    }
    
    var djd = new b2DistanceJointDef();
    djd.set_bodyA(seesawBody);
    djd.set_bodyB(propBody);
    djd.set_localAnchorA(new b2Vec2(6.0, 0.0));
    djd.set_localAnchorB(new b2Vec2(0.0, -1.0));
    var wpA = copyVec2(seesawBody.GetWorldPoint(djd.get_localAnchorA()));
    var wpB = copyVec2(propBody.GetWorldPoint(djd.get_localAnchorB()));
    
    //wpB.op_sub(wpA); wtf... why does op_add work fine but op_sub does nothing?
    var d = new b2Vec2( wpB.get_x() - wpA.get_x(), wpB.get_y() - wpA.get_y() );
    
    djd.set_length(d.Length());
    world.CreateJoint(djd);
    
    //balls
    {
        var radius = 0.2;
    
        var shape = new b2CircleShape();
        shape.set_m_radius(radius);
    
        for (var i = 0; i < 4; ++i)
        {
            var bd = new b2BodyDef();
            // bd.set_type(b2_dynamicBody);
            bd.set_type(Module.b2_dynamicBody);
            bd.set_position(new b2Vec2(5.9 + 2.0 * radius * i, 2.4));
            var body = world.CreateBody(bd);
            body.CreateFixture(shape, 10.0);
        }
    }
}
