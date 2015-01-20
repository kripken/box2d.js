    
var DEGTORAD = 0.0174532925199432957;
var RADTODEG = 57.295779513082320876;

var MOVE_LEFT =     0x01;
var MOVE_RIGHT =    0x02;

var embox2dTest_car = function() {
    this.rearWheelJoint = null;
    this.moveFlags = 0;
    this.carBody = null;    
}

embox2dTest_car.prototype.setNiceViewCenter = function() {
    PTM = 28;
    setViewCenterWorld( new b2Vec2(0,1), true );
}

embox2dTest_car.prototype.setup = function() {
    
    var ground = world.CreateBody( new b2BodyDef() );
    
    //ground
    {
        var shape = new b2EdgeShape();

        var fd = new b2FixtureDef();
        fd.set_shape(shape);
        fd.set_density(0.0);
        fd.set_friction(0.6);

        shape.Set(new b2Vec2(-20.0, 0.0), new b2Vec2(20.0, 0.0));
        ground.CreateFixture(fd);

        //error
        var hs = [0.25, 1.0, 4.0, 0.0, 0.0, -1.0, -2.0, -2.0, -1.25, 0.0];

        x = 20.0;
        y1 = 0.0;
        var dx = 5.0;

        for (var i = 0; i < 10; ++i)
        {
                var y2 = hs[i];
                shape.Set( new b2Vec2(x, y1), new b2Vec2(x + dx, y2));
                ground.CreateFixture(fd);
                
                y1 = y2;
                x += dx;
        }

        //error

        for (var i = 0; i < 10; ++i)
        {
                var y2 = hs[i];
                shape.Set( new b2Vec2(x, y1), new b2Vec2(x + dx, y2));
                ground.CreateFixture(fd);
                y1 = y2;
                x += dx;
        }

        shape.Set(new b2Vec2(x, 0.0), new b2Vec2(x + 40.0, 0.0));
        ground.CreateFixture(fd);

        x += 80.0;
        shape.Set(new b2Vec2(x, 0.0), new b2Vec2(x + 40.0, 0.0));
        ground.CreateFixture(fd);

        x += 40.0;
        shape.Set(new b2Vec2(x, 0.0), new b2Vec2(x + 10.0, 5.0));
        ground.CreateFixture(fd);

        x += 20.0;
        shape.Set(new b2Vec2(x, 0.0), new b2Vec2(x + 40.0, 0.0));
        ground.CreateFixture(fd);

        x += 40.0;
        shape.Set(new b2Vec2(x, 0.0), new b2Vec2(x, 20.0));
        ground.CreateFixture(fd);
    }       

    // Teeter
    {
        var bd = new b2BodyDef();
        bd.set_position(new b2Vec2(140.0, 1.0));
        // bd.set_type(b2_dynamicBody);
        bd.set_type(Module.b2_dynamicBody);
        var body = world.CreateBody(bd);

        var box = new b2PolygonShape();
        box.SetAsBox(10.0, 0.25);
        body.CreateFixture(box, 1);

        var jd = new b2RevoluteJointDef();
        jd.Initialize(ground, body, body.GetPosition());
        jd.set_lowerAngle(-8 * DEGTORAD);
        jd.set_upperAngle( 8 * DEGTORAD);
        jd.set_enableLimit(true);
        world.CreateJoint(jd);

        body.ApplyAngularImpulse(100.0, true);
    }
    
    // Bridge
    {
        var N = 20;
        shape = new b2PolygonShape();
        shape.SetAsBox(1.0, 0.125);

        var fd = new b2FixtureDef();
        fd.set_shape( shape );
        fd.set_density( 1.0 );
        fd.set_friction( 0.6 );

        var jd = new b2RevoluteJointDef();

        var prevBody = ground;
        var bd = new b2BodyDef();
        // bd.set_type(b2_dynamicBody);
        bd.set_type(Module.b2_dynamicBody);
        for (var i = 0; i < N; ++i)
        {                    
            bd.set_position( new b2Vec2(161.0 + 2.0 * i, -0.125) );
            var body = world.CreateBody(bd);
            body.CreateFixture(fd);

            var anchor = new b2Vec2(160.0 + 2.0 * i, -0.125);
            jd.Initialize(prevBody, body, anchor);
            world.CreateJoint(jd);

            prevBody = body;
        }

        var anchor = new b2Vec2(160.0 + 2.0 * N, -0.125);
        jd.Initialize(prevBody, ground, anchor);
        world.CreateJoint(jd);
    }
    
    // Boxes
    {
        var box = new b2PolygonShape();
        box.SetAsBox(0.5, 0.5);

        var bd = new b2BodyDef();
        // bd.set_type(b2_dynamicBody);
        bd.set_type(Module.b2_dynamicBody);

        for (var i = 0; i < 5; i++) {
            bd.set_position(new b2Vec2(230.0, i + 0.5));
            world.CreateBody(bd).CreateFixture(box, 0.5);
        }
    }
    
    //car
    {
        var carVerts = [];
        carVerts.push( new b2Vec2(-1.5, -0.5) );
        carVerts.push( new b2Vec2(1.5, -0.5) );
        carVerts.push( new b2Vec2(1.5, 0.0) );
        carVerts.push( new b2Vec2(0.0, 0.9) );
        carVerts.push( new b2Vec2(-1.15, 0.9) );
        carVerts.push( new b2Vec2(-1.5, 0.2) );
        var chassisShape = new createPolygonShape(carVerts);
        
        var circleShape = new b2CircleShape();
        circleShape.set_m_radius(0.4);
    
        var bd = new b2BodyDef();
        // bd.set_type(b2_dynamicBody);
        bd.set_type(Module.b2_dynamicBody);
        bd.set_position( new b2Vec2(0,1) );
        this.carBody = world.CreateBody(bd);
        this.carBody.CreateFixture(chassisShape, 1);
        
        var fd = new b2FixtureDef();
        fd.set_shape(circleShape);
        fd.set_density(1.0);
        fd.set_friction(0.9);
        
        bd.set_position( new b2Vec2(-1.0, 0.35) );
        var wheelBody1 = world.CreateBody(bd);
        wheelBody1.CreateFixture(fd);

        bd.set_position( new b2Vec2(1.0, 0.4) );
        var wheelBody2 = world.CreateBody(bd);
        wheelBody2.CreateFixture(fd);                
        
        var m_hz = 4.0;
        var m_zeta = 0.7;
        var m_speed = 50.0;
        
        var jd = new b2WheelJointDef();
        var axis = new b2Vec2(0.0, 1.0);

        jd.Initialize(this.carBody, wheelBody1, wheelBody1.GetPosition(), axis);
        jd.set_motorSpeed(0.0);
        jd.set_maxMotorTorque(20.0);
        jd.set_enableMotor(true);
        jd.set_frequencyHz(m_hz);
        jd.set_dampingRatio(m_zeta);
        this.rearWheelJoint = Box2D.castObject( world.CreateJoint(jd), b2WheelJoint );

        jd.Initialize(this.carBody, wheelBody2, wheelBody2.GetPosition(), axis);
        //jd.set_motorSpeed(0.0);
        //jd.set_maxMotorTorque(10.0);
        jd.set_enableMotor(false);
        jd.set_frequencyHz(m_hz);
        jd.set_dampingRatio(m_zeta);
        wheelJoint2 = Box2D.castObject( world.CreateJoint(jd), b2WheelJoint );
    }
}

embox2dTest_car.prototype.updateMotorSpeed = function() {
    if ( (this.moveFlags & MOVE_LEFT) == MOVE_LEFT )
        this.rearWheelJoint.SetMotorSpeed(50);
    else if ( (this.moveFlags & MOVE_RIGHT) == MOVE_RIGHT )
        this.rearWheelJoint.SetMotorSpeed(-50);
    else
        this.rearWheelJoint.SetMotorSpeed(0);
}

embox2dTest_car.prototype.step = function() {
    this.updateMotorSpeed();

    //move camera to follow car
    var pos = this.carBody.GetPosition();
    var vel = this.carBody.GetLinearVelocity();
    var futurePos = new b2Vec2( pos.get_x() + 0.15 * vel.get_x(), pos.get_y() + 0.15 * vel.get_y() );
    setViewCenterWorld( futurePos );
}

embox2dTest_car.prototype.onKeyDown = function(canvas, evt) {
    if ( evt.keyCode == 74 ) {//j
        this.moveFlags |= MOVE_LEFT;
        this.updateMotorSpeed();
    }
    else if ( evt.keyCode == 75 ) {//k
        this.moveFlags |= MOVE_RIGHT;
        this.updateMotorSpeed();
    }
}

embox2dTest_car.prototype.onKeyUp = function(canvas, evt) {    
    if ( evt.keyCode == 74 ) {//j
        this.moveFlags &= ~MOVE_LEFT;
        this.updateMotorSpeed();
    }
    else if ( evt.keyCode == 75 ) {//k
        this.moveFlags &= ~MOVE_RIGHT;
        this.updateMotorSpeed();
    }
}
