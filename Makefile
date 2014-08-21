# Makefile for generating a Box2D library using Emscripten.
#
# build with       emmake make
#

# For placing path overrides.. this path is hidden from git
-include Makefile.local

PYTHON=$(ENV) python

OPTS = -Os
LINK_OPTS = -O3 --llvm-lto 1 -s NO_FILESYSTEM=1 -s NO_BROWSER=1

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
	$(CXX) $(OPTS) -IBox2D_v2.2.1 $< -o $@

box2d.bc: $(OBJECTS)
	$(CXX) $(OPTS) -IBox2D_v2.2.1 -o $@ $(OBJECTS)

box2d_glue.cpp: box2d.idl
	$(PYTHON) $(EMSCRIPTEN)/tools/webidl_binder.py box2d.idl box2d_glue

box2d_glue.h: box2d_glue.cpp

box2d.js: box2d.bc box2d_glue.cpp box2d_glue.h
	$(CXX) $(LINK_OPTS) -IBox2D_v2.2.1 -s EXPORT_BINDINGS=1 -s RESERVED_FUNCTION_POINTERS=20 --post-js box2d_glue.js --js-transform "python bundle.py" --closure 1 --memory-init-file 0 -s NO_EXIT_RUNTIME=1 glue_stub.cpp $< -o $@

clean:
	rm -f box2d.js box2d.bc $(OBJECTS) box2d_bindings.cpp box2d_bindings.bc box2d.clean.h box2d_glue.js box2d_glue.cpp WebIDLGrammar.pkl parser.out

