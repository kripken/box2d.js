var embox2dTest_pyramid = function() {
}

embox2dTest_pyramid.prototype.setNiceViewCenter = function() {
    PTM = 20;
    setViewCenterWorld( new b2Vec2(0,7.5), true );
}

embox2dTest_pyramid.prototype.setup = function() {
    
    {
        var ground = world.CreateBody(new b2BodyDef());

        var shape = new b2EdgeShape();
        shape.Set(new b2Vec2(-40.0, 0.0), new b2Vec2(40.0, 0.0));
        ground.CreateFixture(shape, 0.0);
    }

    {
        var a = 0.5;
        var shape = new b2PolygonShape();
        shape.SetAsBox(a, a);

        var x = new b2Vec2(-7.5, 0.75);
        var y = new b2Vec2();
        var deltaX = new b2Vec2(0.5625, 1.25);
        var deltaY = new b2Vec2(1.125, 0.0);

        var bd = new b2BodyDef();
        // bd.set_type( b2_dynamicBody );
        bd.set_type( Module.b2_dynamicBody );

        for (var i = 0; i < 15; ++i) {
            y = copyVec2(x);

            for (var j = i; j < 15; ++j)
            {
                bd.set_position(y);                        
                world.CreateBody(bd).CreateFixture(shape, 5.0);
                y.op_add(deltaY);
            }

            x.op_add(deltaX);
        }
    }
}