var embox2dTest_balancedMobile = function() {
}

embox2dTest_balancedMobile.prototype.setNiceViewCenter = function() {
    PTM = 42;
    setViewCenterWorld( new b2Vec2(0,1), true );
}

embox2dTest_balancedMobile.prototype.setup = function() {

    // Create ground body.
    var bodyDef = new b2BodyDef();
    bodyDef.set_position(new b2Vec2(0.0, 4.0));
    var ground = world.CreateBody(bodyDef);

    var a = 0.5;
    var h = new b2Vec2(0.0, a);

    var root = AddNode(ground, new b2Vec2(0,0), 0, 3.0, a);

    var jointDef = new b2RevoluteJointDef();
    jointDef.set_bodyA(ground);
    jointDef.set_bodyB(root);
    jointDef.set_localAnchorA(new b2Vec2(0,0));
    jointDef.set_localAnchorB(h);
    world.CreateJoint(jointDef);
}

function AddNode(parent, localAnchor, depth, offset, a)
{
    var density = 20.0;
    var h = new b2Vec2(0.0, a);

    var p = copyVec2(parent.GetPosition());
    p.op_add(localAnchor);
    //p.op_sub(h); wtf... why does op_add work fine but op_sub does nothing?
    p.set_x( p.get_x() - h.get_x() );
    p.set_y( p.get_y() - h.get_y() );

    var bodyDef = new b2BodyDef();
    bodyDef.set_type(b2_dynamicBody);
    bodyDef.set_position(p);
    var body = world.CreateBody(bodyDef);

    var shape = new b2PolygonShape();
    shape.SetAsBox(0.25 * a, a);
    body.CreateFixture(shape, density);

    if (depth == 4)
    {
        return body;
    }

    shape.SetAsBox(offset, 0.25 * a, new b2Vec2(0, -a), 0.0);
    body.CreateFixture(shape, density);

    var a1 = new b2Vec2(offset, -a);
    var a2 = new b2Vec2(-offset, -a);
    var body1 = AddNode(body, a1, depth + 1, 0.5 * offset, a);
    var body2 = AddNode(body, a2, depth + 1, 0.5 * offset, a);

    var jointDef = new b2RevoluteJointDef();
    jointDef.set_bodyA(body);
    jointDef.set_localAnchorB(h);

    jointDef.set_localAnchorA(a1);
    jointDef.set_bodyB(body1);
    world.CreateJoint(jointDef);

    jointDef.set_localAnchorA(a2);
    jointDef.set_bodyB(body2);
    world.CreateJoint(jointDef);

    return body;
}
