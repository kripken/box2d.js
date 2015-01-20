
var embox2dTest_fallingShapes = function() {
}

embox2dTest_fallingShapes.prototype.setNiceViewCenter = function() {
    PTM = 32;
    setViewCenterWorld( new b2Vec2(0,0), true );
}

embox2dTest_fallingShapes.prototype.setup = function() {

    var NUMRANGE = [];    
    while (NUMRANGE.length < 20)
        NUMRANGE.push(NUMRANGE.length+1);
    bodies = [null]; // Indexes start from 1
    
    var bd_ground = new b2BodyDef();
    var groundBody = world.CreateBody(bd_ground);

    //ground edges
    var shape0 = new b2EdgeShape();
    shape0.Set(new b2Vec2(-40.0, -6.0), new b2Vec2(40.0, -6.0));
    groundBody.CreateFixture(shape0, 0.0);
    shape0.Set(new b2Vec2(-9.0, -6.0), new b2Vec2(-9.0, -4.0));
    groundBody.CreateFixture(shape0, 0.0);
    shape0.Set(new b2Vec2(9.0, -6.0), new b2Vec2(9.0, -4.0));
    groundBody.CreateFixture(shape0, 0.0);

    var cshape = new b2CircleShape();
    cshape.set_m_radius(0.5);

    //falling shapes
    var ZERO = new b2Vec2(0, 0);
    var temp = new b2Vec2(0, 0);
    NUMRANGE.forEach(function(i) {
        var bd = new b2BodyDef();
        // bd.set_type(b2_dynamicBody);
        bd.set_type(Module.b2_dynamicBody);
        bd.set_position(ZERO);
        var body = world.CreateBody(bd);
        var randomValue = Math.random();
        if ( randomValue < 0.2 )
            body.CreateFixture(cshape, 1.0);
        else
            body.CreateFixture(createRandomPolygonShape(0.5), 1.0);
        temp.Set(16*(Math.random()-0.5), 4.0 + 2.5*i);
        body.SetTransform(temp, 0.0);
        body.SetLinearVelocity(ZERO);
        body.SetAwake(1);
        body.SetActive(1);
    });
    
    //static polygon and chain shapes
    {
        var verts = [];
        verts.push( new b2Vec2( 7,-1) );
        verts.push( new b2Vec2( 8,-2) );
        verts.push( new b2Vec2( 9, 3) );
        verts.push( new b2Vec2( 7, 1) );
        var polygonShape = createPolygonShape(verts);
        groundBody.CreateFixture(polygonShape, 0.0);
        
        //mirror vertices in x-axis and use for chain shape
        for (var i = 0; i < verts.length; i++)
            verts[i].set_x( -verts[i].get_x() );
        verts.reverse();
        var chainShape = createChainShape(verts, true);//true for closed loop *** some problem with this atm
        // polygonShape = createPolygonShape(verts);
        groundBody.CreateFixture(chainShape, 0.0);
    }
}
