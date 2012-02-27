// js -m -n -e "load('box2d.js')" test.js

function clock() {
  return Date.now();
}

var DEBUG = 0;

var WARMUP = 64;
var FRAMES = 256;
var ITERATIONS = WARMUP + FRAMES;

var e_count = 40;

function bench() {
  var gravity = new Box2D.b2Vec2(0.0, -10.0);

  var world = new Box2D.b2World(gravity);
  world.SetAllowSleeping(false);

  var bd = new Box2D.b2BodyDef();
  var ground = world.CreateBody(bd);

  var shape0 = new Box2D.b2EdgeShape();
  shape0.Set(new Box2D.b2Vec2(-40.0, 0.0), new Box2D.b2Vec2(40.0, 0.0));
  ground.CreateFixture(shape0, 0.0);

  var topBody;

  var a = 0.5;
  var shape = new Box2D.b2PolygonShape();
  shape.SetAsBox(a, a);

  var x = new Box2D.b2Vec2(-7.0, 0.75);
  var y = new Box2D.b2Vec2();
  var deltaX = new Box2D.b2Vec2(0.5625, 1);
  var deltaY = new Box2D.b2Vec2(1.125, 0.0);

  for (var i = 0; i < e_count; ++i) {
    y.set_x(x.get_x());
    y.set_y(x.get_y());

    for (var j = i; j < e_count; ++j) {
      var bd = new Box2D.b2BodyDef();
      bd.set_type(Box2D.b2_dynamicBody);
      bd.set_position(y);
      var body = world.CreateBody(bd);
      body.CreateFixture(shape, 5.0);

      topBody = body;

      y.op_add(deltaY);
    }

    x.op_add(deltaX);
  }

  var times = []
  for (var i = 0; i < ITERATIONS; ++i) {
    var start = clock();
    world.Step(1.0/60.0, 3, 3);
    var end = clock();
    times.push(end - start);
    if (DEBUG) print([topBody.GetPosition().get_y(), topBody.GetMass()]);
  }

  // Slice off the warmup frames.
  times = times.slice(WARMUP)
  print(times);

  var total = 0;
  for (var i = 0; i < times.length; ++i) {
    total += times[i];
  }
  print(total/FRAMES);
}

bench();
