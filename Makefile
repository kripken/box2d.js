# Makefile for generating a Box2D library using Emscripten.

# You'll likely need to edit these for your particular directory layout.
LLVM=~/Dev/llvm-emscripten/cbuild/bin
EMSCRIPTEN=~/Dev/emscripten
EMCC=$(EMSCRIPTEN)/emcc

OBJECTS = \
Box2D_v2.2.1/Box2D/Collision/b2BroadPhase.bc \
Box2D_v2.2.1/Box2D/Collision/b2CollideCircle.bc \
Box2D_v2.2.1/Box2D/Collision/b2CollideEdge.bc \
Box2D_v2.2.1/Box2D/Collision/b2CollidePolygon.bc \
Box2D_v2.2.1/Box2D/Collision/b2Collision.bc \
Box2D_v2.2.1/Box2D/Collision/b2Distance.bc \
Box2D_v2.2.1/Box2D/Collision/b2DynamicTree.bc \
Box2D_v2.2.1/Box2D/Collision/b2TimeOfImpact.bc \
Box2D_v2.2.1/Box2D/Collision/Shapes/b2ChainShape.bc \
Box2D_v2.2.1/Box2D/Collision/Shapes/b2CircleShape.bc \
Box2D_v2.2.1/Box2D/Collision/Shapes/b2EdgeShape.bc \
Box2D_v2.2.1/Box2D/Collision/Shapes/b2PolygonShape.bc \
Box2D_v2.2.1/Box2D/Common/b2BlockAllocator.bc \
Box2D_v2.2.1/Box2D/Common/b2Draw.bc \
Box2D_v2.2.1/Box2D/Common/b2Math.bc \
Box2D_v2.2.1/Box2D/Common/b2Settings.bc \
Box2D_v2.2.1/Box2D/Common/b2StackAllocator.bc \
Box2D_v2.2.1/Box2D/Common/b2Timer.bc \
Box2D_v2.2.1/Box2D/Dynamics/b2Body.bc \
Box2D_v2.2.1/Box2D/Dynamics/b2ContactManager.bc \
Box2D_v2.2.1/Box2D/Dynamics/b2Fixture.bc \
Box2D_v2.2.1/Box2D/Dynamics/b2Island.bc \
Box2D_v2.2.1/Box2D/Dynamics/b2World.bc \
Box2D_v2.2.1/Box2D/Dynamics/b2WorldCallbacks.bc \
Box2D_v2.2.1/Box2D/Dynamics/Contacts/b2ChainAndCircleContact.bc \
Box2D_v2.2.1/Box2D/Dynamics/Contacts/b2ChainAndPolygonContact.bc \
Box2D_v2.2.1/Box2D/Dynamics/Contacts/b2CircleContact.bc \
Box2D_v2.2.1/Box2D/Dynamics/Contacts/b2Contact.bc \
Box2D_v2.2.1/Box2D/Dynamics/Contacts/b2ContactSolver.bc \
Box2D_v2.2.1/Box2D/Dynamics/Contacts/b2EdgeAndCircleContact.bc \
Box2D_v2.2.1/Box2D/Dynamics/Contacts/b2EdgeAndPolygonContact.bc \
Box2D_v2.2.1/Box2D/Dynamics/Contacts/b2PolygonAndCircleContact.bc \
Box2D_v2.2.1/Box2D/Dynamics/Contacts/b2PolygonContact.bc \
Box2D_v2.2.1/Box2D/Dynamics/Joints/b2DistanceJoint.bc \
Box2D_v2.2.1/Box2D/Dynamics/Joints/b2FrictionJoint.bc \
Box2D_v2.2.1/Box2D/Dynamics/Joints/b2GearJoint.bc \
Box2D_v2.2.1/Box2D/Dynamics/Joints/b2Joint.bc \
Box2D_v2.2.1/Box2D/Dynamics/Joints/b2MouseJoint.bc \
Box2D_v2.2.1/Box2D/Dynamics/Joints/b2PrismaticJoint.bc \
Box2D_v2.2.1/Box2D/Dynamics/Joints/b2PulleyJoint.bc \
Box2D_v2.2.1/Box2D/Dynamics/Joints/b2RevoluteJoint.bc \
Box2D_v2.2.1/Box2D/Dynamics/Joints/b2RopeJoint.bc \
Box2D_v2.2.1/Box2D/Dynamics/Joints/b2WeldJoint.bc \
Box2D_v2.2.1/Box2D/Dynamics/Joints/b2WheelJoint.bc \
Box2D_v2.2.1/Box2D/Rope/b2Rope.bc

all: box2d.js box2d.min.js

%.bc: %.cpp
	$(EMCC) -IBox2D_v2.2.1 $< -o $@

box2d.clean.h:
	cpp -x c++ -DEM_NO_LIBCPP -IBox2D_v2.2.1 root.h > box2d.clean.h

box2d_bindings.cpp: box2d.clean.h
	python $(EMSCRIPTEN)/tools/bindings_generator.py box2d_bindings box2d.clean.h -- '{ "ignored": "b2Shape::m_type,b2BroadPhase::RayCast,b2BroadPhase::UpdatePairs,b2BroadPhase::Query,b2DynamicTree::RayCast,b2DynamicTree::Query,b2ChainShape::m_nextVertex,b2ChainShape::m_hasNextVertex,b2EdgeShape::m_hasVertex3,b2EdgeShape::m_vertex2,b2EdgeShape::m_vertex3,b2Mat22,b2Mat33" }' > bindings.out

box2d_bindings.bc: box2d_bindings.cpp
	$(EMCC) -IBox2D_v2.2.1 -include root.h $< -o $@

box2d.bc: $(OBJECTS) box2d_bindings.bc
	$(LLVM)/llvm-link -o $@ $(OBJECTS) box2d_bindings.bc

box2d.js: box2d.bc
	$(EMCC) -O2 -s INLINING_LIMIT=0 --closure 0 --js-transform "python bundle.py" $< -o $@

# TODO: Find out why advanced breaks us
box2d.min.js: box2d.js
	java -Xmx1024m -jar ~/Dev/closure-compiler-read-only/build/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js box2d.js --js_output_file box2d.min.js

clean:
	rm box2d.js box2d.min.js box2d.bc $(OBJECTS) box2d_bindings.cpp box2d_bindings.bc box2d.clean.h

