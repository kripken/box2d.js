
Object.prototype.hasOwnProperty = function(property) {
    return typeof(this[property]) !== 'undefined'
};



function loadBodyFromRUBE(bodyJso, world) {
    if ( ! bodyJso.hasOwnProperty('type') ) {
        console.log("Body does not have a 'type' property");
        return null;
    }    

    var bd = new Box2D.b2BodyDef();
    if ( bodyJso.type == 2 )
        bd.set_type(Box2D.b2_dynamicBody);
    else if ( bodyJso.type == 1 )
        bd.set_type(Box2D.b2_kinematicBody);
    else
        bd.set_type(Box2D.b2_staticBody);

    bd.set_angle(bodyJso.angle || 0);
    bd.set_angularVelocity(bodyJso.angularVelocity || 0);
    bd.set_angularDamping(bodyJso.angularDamping || 0);
    bd.set_awake(bodyJso.awake || false);
    bd.set_bullet(bodyJso.bullet || false);
    bd.set_fixedRotation(bodyJso.fixedRotation || false);
    bd.set_linearDamping(bodyJso.linearDamping || false);

    if ( bodyJso.hasOwnProperty('linearVelocity') && bodyJso.linearVelocity instanceof Object )
        bd.set_linearVelocity(parseVec( bodyJso.linearVelocity ));
    else
        bd.set_linearVelocity(new Box2D.b2Vec2(0,0));

    if ( bodyJso.hasOwnProperty('position') && bodyJso.position instanceof Object )
        bd.set_position(parseVec(bodyJso.position ));
    else
        bd.set_position(new Box2D.b2Vec2(0,0));

    if (bodyJso.hasOwnProperty('gravityScale') && !isNaN(parseFloat(bodyJso.gravityScale)) && isFinite(bodyJso.gravityScale)) {
        bd.set_gravityScale(bodyJso.gravityScale);
    } else {
        bd.set_gravityScale(1);
    }

    var body = world.CreateBody(bd);


    var md = new Box2D.b2MassData();
    md.set_mass(bodyJso['massData-mass'] || 0);
    if ( bodyJso.hasOwnProperty('massData-center') && bodyJso['massData-center'] instanceof Object )
        md.set_center(parseVec(bodyJso['massData-center']));
    else
        md.set_center(new Box2D.b2Vec2(0,0));

    md.set_I(bodyJso['massData-I'] || 0);

    body.SetMassData(md);
    
    
    if ( bodyJso.hasOwnProperty('fixture') ) {
        for (var k = 0; k < bodyJso['fixture'].length; k++) {
            var fixtureJso = bodyJso['fixture'][k];
            loadFixtureFromRUBE(body, fixtureJso);
        }
    }
    if ( bodyJso.hasOwnProperty('name') )
        body.name = bodyJso.name;
    if ( bodyJso.hasOwnProperty('customProperties') )
        body.customProperties = bodyJso.customProperties;
    return body;
}

function loadFixtureFromRUBE(body, fixtureJso) {    
    var fd = new Box2D.b2FixtureDef();
    fd.set_density(fixtureJso.density || 0);
    fd.set_friction(fixtureJso.friction || 0);
    fd.set_restitution(fixtureJso.restitution || 0);
    fd.set_isSensor(fixtureJso.sensor || 0);
    
    var filter = new Box2D.b2Filter();

    filter.set_categoryBits(fixtureJso['filter-categoryBits'] || 1);
    filter.set_maskBits(fixtureJso['filter-maskBits'] || 65535);
    filter.set_groupIndex(fixtureJso['filter-groupIndex'] || 0);

    fd.set_filter(filter);

    if (fixtureJso.hasOwnProperty('circle')) {
        
        var shape = new Box2D.b2CircleShape();

        shape.set_m_radius(fixtureJso.circle.radius || 0);
        if ( fixtureJso.circle.center )
            shape.set_m_p(parseVec(fixtureJso.circle.center)); 
        else 
            shape.set_m_p(new Box2D.b2Vec2(0, 0));

        fd.set_shape(shape);
      
        var fixture = body.CreateFixture(fd);        
        if ( fixtureJso.name )
            fixture.name = fixtureJso.name;
    }
    else if (fixtureJso.hasOwnProperty('polygon')) {
       
        var verts = [];
        for (var v = 0; v < fixtureJso.polygon.vertices.x.length; v++) {
           verts.push( new Box2D.b2Vec2( fixtureJso.polygon.vertices.x[v], fixtureJso.polygon.vertices.y[v] ) );
       }

         
        var shape = createPolygonShape(verts);

        fd.set_shape(shape);
        

        var fixture = body.CreateFixture(fd);   
             
        if ( fixture && fixtureJso.name )
            fixture.name = fixtureJso.name;
    }
    else if (fixtureJso.hasOwnProperty('chain')) {
        
        var verts = [];
        for (var v = 0; v < fixtureJso.chain.vertices.x.length; v++) 
            verts.push(new Box2D.b2Vec2(fixtureJso.chain.vertices.x[v], fixtureJso.chain.vertices.y[v]));


        shape = createChainShape(verts);
        fd.set_shape(shape);
       
        var fixture = body.CreateFixture(fd);        
        if ( fixtureJso.name )
           fixture.name = fixtureJso.name;

    }
    else {
        console.log("Could not find shape type for fixture");
    }
}

function getVectorValue(val) {
    if ( val instanceof Object )
        return val;
    else
        return { x:0, y:0 };
}

function parseVec(obj) {
    if (obj instanceof Object)
      return new Box2D.b2Vec2(obj.x || 0, obj.y || 0);
    else
      return new Box2D.b2Vec2(0,0);
}



function loadJointFromRUBE(jointJso, world, loadedBodies)
{
    if ( ! jointJso.hasOwnProperty('type') ) {
        console.log("Joint does not have a 'type' property");
        return null;
    }    
    if ( jointJso.bodyA >= loadedBodies.length ) {
        console.log("Index for bodyA is invalid: " + jointJso.bodyA );
        return null;
    }    
    if ( jointJso.bodyB >= loadedBodies.length ) {
        console.log("Index for bodyB is invalid: " + jointJso.bodyB );
        return null;
    }
    
    var joint = null;
    
    if ( jointJso.type == "revolute" ) {
        var jd = new Box2D.b2RevoluteJointDef();
        jd.set_bodyA(loadedBodies[jointJso.bodyA]);
        jd.set_bodyB(loadedBodies[jointJso.bodyB]);
        jd.set_collideConnected(jointJso.collideConnected || false);
        jd.set_localAnchorA(parseVec(jointJso.anchorA));
        jd.set_localAnchorB(parseVec(jointJso.anchorB));
        jd.set_enableLimit(jointJso.enableLimit || false);
        jd.set_enableMotor(jointJso.enableMotor || false);
        jd.set_lowerAngle(jointJso.lowerLimit || 0);
        jd.set_maxMotorTorque(jointJso.maxMotorTorque || 0);
        jd.set_motorSpeed(jointJso.motorSpeed || 0);
        jd.set_referenceAngle(jointJso.refAngle || 0);
        jd.set_upperAngle(jointJso.upperLimit || 0);

        joint = world.CreateJoint(jd);
    }
    else if ( jointJso.type == "distance") {
        var jd = new Box2D.b2DistanceJointDef();
        jd.set_bodyA(loadedBodies[jointJso.bodyA]);
        jd.set_bodyB(loadedBodies[jointJso.bodyB]);
        jd.set_collideConnected(jointJso.collideConnected || false);
        jd.set_localAnchorA(parseVec(jointJso.anchorA));
        jd.set_localAnchorB(parseVec(jointJso.anchorB));
        jd.set_dampingRatio(jointJso.dampingRatio || 0);
        jd.set_frequencyHz(jointJso.frequency || 0);
        jd.set_length(jointJso.length || 0);
        
        joint = world.CreateJoint(jd);
    } 
    else if ( jointJso.type == "rope") {
        var jd = new Box2D.b2RopeJointDef();

        jd.set_bodyA(loadedBodies[jointJso.bodyA]);
        jd.set_bodyB(loadedBodies[jointJso.bodyB]);
        jd.set_collideConnected(jointJso.collideConnected || false);
        jd.set_localAnchorA(parseVec(jointJso.anchorA));
        jd.set_localAnchorB(parseVec(jointJso.anchorB));
        jd.set_maxLength(jointJso.maxLength || 0);
        joint = world.CreateJoint(jd);
    }
    else if ( jointJso.type == "motor") {
        if (Box2D.b2MotorJointDef){
            var jd = new Box2D.b2MotorJointDef();

            jd.set_bodyA(loadedBodies[jointJso.bodyA]);
            jd.set_bodyB(loadedBodies[jointJso.bodyB]);
            jd.set_collideConnected(jointJso.collideConnected || false);

            jd.set_linearOffset(parseVec(jointJso.anchorA));
            jd.set_angularOffset(jointJso.refAngle || 0);
            jd.set_maxForce(jointJso.maxForce || 0);
            jd.set_maxTorque(jointJso.maxTorque || 0);
            jd.set_correctionFactor(jointJso.correctionFactor || 0);    

            joint = world.CreateJoint(jd);
        } else {
            console.log("This version of box2d doesn't support motor joints");
        }
    }
    else if ( jointJso.type == "prismatic" ) {
        var jd = new Box2D.b2PrismaticJointDef();
        jd.set_bodyA(loadedBodies[jointJso.bodyA]);
        jd.set_bodyB(loadedBodies[jointJso.bodyB]);
        jd.set_collideConnected(jointJso.collideConnected || false);
        jd.set_localAnchorA(parseVec(jointJso.anchorA));
        jd.set_localAnchorB(parseVec(jointJso.anchorB));
        jd.set_enableLimit(jointJso.enableLimit || false);
        jd.set_enableMotor(jointJso.enableMotor || false);
        jd.set_localAxisA(parseVec(jointJso.localAxisA));
        jd.set_lowerTranslation(jointJso.lowerLimit || 0);
        jd.set_maxMotorForce(jointJso.maxMotorForce || 0);
        jd.set_motorSpeed(jointJso.motorSpeed || 0);
        jd.set_referenceAngle(jointJso.refAngle || 0);
        jd.set_upperTranslation(jointJso.upperLimit || 0);        
        joint = world.CreateJoint(jd);
    }
    else if ( jointJso.type == "wheel" ) {

        var jd = new Box2D.b2WheelJointDef();
        jd.set_bodyA(loadedBodies[jointJso.bodyA]);
        jd.set_bodyB(loadedBodies[jointJso.bodyB]);
        jd.set_collideConnected(jointJso.collideConnected || false);
        jd.set_localAnchorA(parseVec(jointJso.anchorA));
        jd.set_localAnchorB(parseVec(jointJso.anchorB));
        jd.set_enableMotor(jointJso.enableMotor || false);
        jd.set_localAxisA(parseVec(jointJso.localAxisA));
        jd.set_maxMotorTorque(jointJso.maxMotorTorque || 0);
        jd.set_motorSpeed(jointJso.motorSpeed || 0);
        jd.set_dampingRatio(jointJso.springDampingRatio || 0);
        jd.set_frequencyHz(jointJso.springFrequency || 0);
        joint = world.CreateJoint(jd);

    }
    else if ( jointJso.type == "friction" ) {
        var jd = new Box2D.b2FrictionJointDef();
        
        jd.set_bodyA(loadedBodies[jointJso.bodyA]);
        jd.set_bodyB(loadedBodies[jointJso.bodyB]);
        jd.set_collideConnected(jointJso.collideConnected || false);
        jd.set_localAnchorA(parseVec(jointJso.anchorA));
        jd.set_localAnchorB(parseVec(jointJso.anchorB));
        jd.set_maxForce(jointJso.maxForce || 0);
        jd.set_maxTorque(jointJso.maxTorque || 0);
        joint = world.CreateJoint(jd);
    }
    else if ( jointJso.type == "weld" ) {
        var jd = new Box2D.b2WeldJointDef();
        
        jd.set_bodyA(loadedBodies[jointJso.bodyA]);
        jd.set_bodyB(loadedBodies[jointJso.bodyB]);
        jd.set_collideConnected(jointJso.collideConnected || false);
        jd.set_localAnchorA(parseVec(jointJso.anchorA));
        jd.set_localAnchorB(parseVec(jointJso.anchorB));
        jd.set_referenceAngle(jointJso.refAngle || 0);
        jd.set_dampingRatio(jointJso.dampingRatio || 0);
        jd.set_frequencyHz(jointJso.frequency || 0);
        joint = world.CreateJoint(jd);
    }
    else {
        console.log("Unsupported joint type: " + jointJso.type);
        console.log(jointJso);
    }
    if ( joint && jointJso.name )
        joint.name = jointJso.name;
    return joint;
}

function makeClone(obj) {
  var newObj = (obj instanceof Array) ? [] : {};
  for (var i in obj) {
    if (obj[i] && typeof obj[i] == "object") 
      newObj[i] = makeClone(obj[i]);
    else
        newObj[i] = obj[i];
  }
  return newObj;
};


//mainly just a convenience for the testbed - uses global 'world' variable
function loadSceneFromRUBE(worldJso) {
    return loadSceneIntoWorld(worldJso, world);
}

//load the scene into an already existing world variable
function loadSceneIntoWorld(worldJso, world) {
    var success = true;
    
    var loadedBodies = [];
    if ( worldJso.hasOwnProperty('body') ) {
        for (var i = 0; i < worldJso.body.length; i++) {
            var bodyJso = worldJso.body[i];
            var body = loadBodyFromRUBE(bodyJso, world);
            if ( body )
                loadedBodies.push( body );
            else
                success = false;
        }
    }
    
    var loadedJoints = [];
    if ( worldJso.hasOwnProperty('joint') ) {
        for (var i = 0; i < worldJso.joint.length; i++) {
            var jointJso = worldJso.joint[i];
            var joint = loadJointFromRUBE(jointJso, world, loadedBodies);
            if ( joint )
                loadedJoints.push( joint );
            //else
            //    success = false;
        }
    }
    
    
    return success;
}

//create a world variable and return it if loading succeeds
function loadWorldFromRUBE(worldJso) {
    var gravity = new Box2D.b2Vec2(0,0);
    if ( worldJso.hasOwnProperty('gravity') && worldJso.gravity instanceof Object )
        gravity.SetV( worldJso.gravity );
    var world = new Box2D.b2World( gravity );
    if ( ! loadSceneIntoWorld(worldJso, world) )
        return false;
    return world;
}

function getNamedBodies(world, name) {
    var bodies = [];
    for (b = world.m_bodyList; b; b = b.m_next) {
        if ( b.name == name )
            bodies.push(b);
    }
    return bodies;
}

function getNamedFixtures(world, name) {
    var fixtures = [];
    for (var b = world.m_bodyList; b; b = b.m_next) {
        for (var f = b.m_fixtureList; f; f = f.m_next) {
            if ( f.name == name )
                fixtures.push(f);
        }
    }
    return fixtures;
}

function getNamedJoints(world, name) {
    var joints = [];
    for (var j = world.m_jointList; j; j = j.m_next) {
        if ( j.name == name )
            joints.push(j);
    }
    return joints;
}

//custom properties
function getBodiesByCustomProperty(world, propertyType, propertyName, valueToMatch) {
    var bodies = [];
    for (var b = world.m_bodyList; b; b = b.m_next) {
        if ( ! b.hasOwnProperty('customProperties') )
            continue;
        for (var i = 0; i < b.customProperties.length; i++) {
            if ( ! b.customProperties[i].hasOwnProperty("name") )
                continue;
            if ( ! b.customProperties[i].hasOwnProperty(propertyType) )
                continue;
            if ( b.customProperties[i].name == propertyName &&
                 b.customProperties[i][propertyType] == valueToMatch)
                bodies.push(b);
        }        
    }
    return bodies;
}

function hasCustomProperty(item, propertyType, propertyName) {
    if ( !item.hasOwnProperty('customProperties') )
        return false;
    for (var i = 0; i < item.customProperties.length; i++) {
        if ( ! item.customProperties[i].hasOwnProperty("name") )
            continue;
        if ( ! item.customProperties[i].hasOwnProperty(propertyType) )
            continue;
        return true;
    }
    return false;
}

function getCustomProperty(item, propertyType, propertyName, defaultValue) {
    if ( !item.hasOwnProperty('customProperties') )
        return defaultValue;
    for (var i = 0; i < item.customProperties.length; i++) {
        if ( ! item.customProperties[i].hasOwnProperty("name") )
            continue;
        if ( ! item.customProperties[i].hasOwnProperty(propertyType) )
            continue;
        if ( item.customProperties[i].name == propertyName )
            return item.customProperties[i][propertyType];
    }
    return defaultValue;
}











