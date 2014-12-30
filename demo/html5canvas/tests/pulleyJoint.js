var embox2dTest_pulleyJoint = function() {
}

embox2dTest_pulleyJoint.prototype.setNiceViewCenter = function() {
    PTM = 12.5;
    setViewCenterWorld( new b2Vec2(0,17.5), true );
}

embox2dTest_pulleyJoint.prototype.setup = function() {
    var y = 16.0;
    var L = 12.0;
    var a = 1.0;
    var b = 2.0;

    {
        var bd = new b2BodyDef();
        var ground = world.CreateBody(bd);

        var edge = new b2EdgeShape();
        edge.Set(new b2Vec2(-40.0, 0.0), new b2Vec2(40.0, 0.0));
        ground.CreateFixture(edge, 0.0);

        var circle = new b2CircleShape();
        circle.set_m_radius(2.0);
        
        circle.set_m_p( new b2Vec2(-10.0, y + b + L));
        ground.CreateFixture(circle, 0.0);
    
        circle.set_m_p( new b2Vec2(10.0, y + b + L));
        ground.CreateFixture(circle, 0.0);
    }

    {
        var shape = new b2PolygonShape();
        shape.SetAsBox(a, b);

        var bd = new b2BodyDef();
        // bd.set_type(b2_dynamicBody);
        bd.set_type(Module.b2_dynamicBody);

        bd.set_position( new b2Vec2(-10.0, y));
        var body1 = world.CreateBody(bd);
        body1.CreateFixture(shape, 5.0);

        bd.set_position( new b2Vec2(10.0, y));
        var body2 = world.CreateBody(bd);
        body2.CreateFixture(shape, 5.0);

        var pulleyDef = new b2PulleyJointDef();
        var anchor1 = new b2Vec2(-10.0, y + b);
        var anchor2 = new b2Vec2(10.0, y + b);
        var groundAnchor1 = new b2Vec2(-10.0, y + b + L);
        var groundAnchor2 = new b2Vec2(10.0, y + b + L);
        pulleyDef.Initialize(body1, body2, groundAnchor1, groundAnchor2, anchor1, anchor2, 1.5);

        world.CreateJoint(pulleyDef);
    }
}