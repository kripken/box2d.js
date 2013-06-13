# Makefile for generating a Box2D library using Emscripten.

# For placing path overrides.. this path is hidden from git
-include Makefile.local

PYTHON=$(ENV) python

O = Box2D_v2.2.1/Box2D
OBJECTS = \
$(O)/Collision/b2BroadPhase.bc \
$(O)/Collision/b2CollideCircle.bc \
$(O)/Collision/b2CollideEdge.bc \
$(O)/Collision/b2CollidePolygon.bc \
$(O)/Collision/b2Collision.bc \
$(O)/Collision/b2Distance.bc \
$(O)/Collision/b2DynamicTree.bc \
$(O)/Collision/b2TimeOfImpact.bc \
$(O)/Collision/Shapes/b2ChainShape.bc \
$(O)/Collision/Shapes/b2CircleShape.bc \
$(O)/Collision/Shapes/b2EdgeShape.bc \
$(O)/Collision/Shapes/b2PolygonShape.bc \
$(O)/Common/b2BlockAllocator.bc \
$(O)/Common/b2Draw.bc \
$(O)/Common/b2Math.bc \
$(O)/Common/b2Settings.bc \
$(O)/Common/b2StackAllocator.bc \
$(O)/Common/b2Timer.bc \
$(O)/Dynamics/b2Body.bc \
$(O)/Dynamics/b2ContactManager.bc \
$(O)/Dynamics/b2Fixture.bc \
$(O)/Dynamics/b2Island.bc \
$(O)/Dynamics/b2World.bc \
$(O)/Dynamics/b2WorldCallbacks.bc \
$(O)/Dynamics/Contacts/b2ChainAndCircleContact.bc \
$(O)/Dynamics/Contacts/b2ChainAndPolygonContact.bc \
$(O)/Dynamics/Contacts/b2CircleContact.bc \
$(O)/Dynamics/Contacts/b2Contact.bc \
$(O)/Dynamics/Contacts/b2ContactSolver.bc \
$(O)/Dynamics/Contacts/b2EdgeAndCircleContact.bc \
$(O)/Dynamics/Contacts/b2EdgeAndPolygonContact.bc \
$(O)/Dynamics/Contacts/b2PolygonAndCircleContact.bc \
$(O)/Dynamics/Contacts/b2PolygonContact.bc \
$(O)/Dynamics/Joints/b2DistanceJoint.bc \
$(O)/Dynamics/Joints/b2FrictionJoint.bc \
$(O)/Dynamics/Joints/b2GearJoint.bc \
$(O)/Dynamics/Joints/b2Joint.bc \
$(O)/Dynamics/Joints/b2MouseJoint.bc \
$(O)/Dynamics/Joints/b2PrismaticJoint.bc \
$(O)/Dynamics/Joints/b2PulleyJoint.bc \
$(O)/Dynamics/Joints/b2RevoluteJoint.bc \
$(O)/Dynamics/Joints/b2RopeJoint.bc \
$(O)/Dynamics/Joints/b2WeldJoint.bc \
$(O)/Dynamics/Joints/b2WheelJoint.bc \
$(O)/Rope/b2Rope.bc

all: box2d.js

%.bc: %.cpp
	$(CXX) -IBox2D_v2.2.1 $< -o $@

# Note: might need -xc++ on some compiler versions (no space)
box2d.clean.h:
	cpp -x c++ -DEM_NO_LIBCPP -IBox2D_v2.2.1 root.h > box2d.clean.h

box2d_bindings.cpp: box2d.clean.h
	$(PYTHON) ../emscripten/tools/bindings_generator.py box2d_bindings box2d.clean.h -- '{ "ignored": "b2Shape::m_type,b2BroadPhase::RayCast,b2BroadPhase::UpdatePairs,b2BroadPhase::Query,b2DynamicTree::RayCast,b2DynamicTree::Query,b2ChainShape::m_nextVertex,b2ChainShape::m_hasNextVertex,b2EdgeShape::m_hasVertex3,b2EdgeShape::m_vertex2,b2EdgeShape::m_vertex3,b2Mat22,b2Mat33" }' > bindings.out

box2d_bindings.bc: box2d_bindings.cpp
	$(CXX) -IBox2D_v2.2.1 -include root.h $< -o $@

box2d.bc: $(OBJECTS) box2d_bindings.bc
	$(CXX) -o $@ $(OBJECTS) box2d_bindings.bc

box2d.js: box2d.bc
	$(CXX) -O2 -s ASM_JS=1 -s EXPORT_BINDINGS=1 -s RESERVED_FUNCTION_POINTERS=20 --js-transform "python bundle.py" $< -o $@

clean:
	rm -f box2d.js box2d.bc $(OBJECTS) box2d_bindings.cpp box2d_bindings.bc bindings.out box2d.clean.h

