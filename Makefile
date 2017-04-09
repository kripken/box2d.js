# Makefile for generating a Box2D library using Emscripten.
#
# build with       emmake make
#

# For placing path overrides.. this path is hidden from git
-include Makefile.local

LATEST = Box2D_v2.3.1
STABLE = Box2D_v2.2.1
PYTHON=$(ENV) python
VERSION := stable
BUILD := min

LINK_OPTS = -s MODULARIZE=1 -s 'EXPORT_NAME="Box2D"' -s NO_FILESYSTEM=1 -s EXPORT_BINDINGS=1 -s RESERVED_FUNCTION_POINTERS=20 --post-js box2d_glue.js --memory-init-file 0 -s NO_EXIT_RUNTIME=1 glue_stub.cpp

ifeq ($(BUILD), debug)
	OPTS = -O0 -g2
	LINK_OPTS += -g -s NO_FILESYSTEM=1 -s ASSERTIONS=2 -s DEMANGLE_SUPPORT=1
else
	OPTS = -Os
	LINK_OPTS += -O3 --llvm-lto 1 --closure 1
endif

ifeq ($(VERSION), latest)
	ACTIVE = $(LATEST)
	OBJECTS = \
	$(ACTIVE)/Box2D/Dynamics/Joints/b2MotorJoint.bc
else ifeq ($(VERSION), stable)
	ACTIVE = $(STABLE)
else
	ACTIVE = $(VERSION)
endif


OBJECTS += \
$(ACTIVE)/Box2D/Collision/b2BroadPhase.bc \
$(ACTIVE)/Box2D/Collision/b2CollideCircle.bc \
$(ACTIVE)/Box2D/Collision/b2CollideEdge.bc \
$(ACTIVE)/Box2D/Collision/b2CollidePolygon.bc \
$(ACTIVE)/Box2D/Collision/b2Collision.bc \
$(ACTIVE)/Box2D/Collision/b2Distance.bc \
$(ACTIVE)/Box2D/Collision/b2DynamicTree.bc \
$(ACTIVE)/Box2D/Collision/b2TimeOfImpact.bc \
$(ACTIVE)/Box2D/Collision/Shapes/b2ChainShape.bc \
$(ACTIVE)/Box2D/Collision/Shapes/b2CircleShape.bc \
$(ACTIVE)/Box2D/Collision/Shapes/b2EdgeShape.bc \
$(ACTIVE)/Box2D/Collision/Shapes/b2PolygonShape.bc \
$(ACTIVE)/Box2D/Common/b2BlockAllocator.bc \
$(ACTIVE)/Box2D/Common/b2Draw.bc \
$(ACTIVE)/Box2D/Common/b2Math.bc \
$(ACTIVE)/Box2D/Common/b2Settings.bc \
$(ACTIVE)/Box2D/Common/b2StackAllocator.bc \
$(ACTIVE)/Box2D/Common/b2Timer.bc \
$(ACTIVE)/Box2D/Dynamics/b2Body.bc \
$(ACTIVE)/Box2D/Dynamics/b2ContactManager.bc \
$(ACTIVE)/Box2D/Dynamics/b2Fixture.bc \
$(ACTIVE)/Box2D/Dynamics/b2Island.bc \
$(ACTIVE)/Box2D/Dynamics/b2World.bc \
$(ACTIVE)/Box2D/Dynamics/b2WorldCallbacks.bc \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2ChainAndCircleContact.bc \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2ChainAndPolygonContact.bc \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2CircleContact.bc \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2Contact.bc \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2ContactSolver.bc \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2EdgeAndCircleContact.bc \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2EdgeAndPolygonContact.bc \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2PolygonAndCircleContact.bc \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2PolygonContact.bc \
$(ACTIVE)/Box2D/Dynamics/Joints/b2DistanceJoint.bc \
$(ACTIVE)/Box2D/Dynamics/Joints/b2FrictionJoint.bc \
$(ACTIVE)/Box2D/Dynamics/Joints/b2GearJoint.bc \
$(ACTIVE)/Box2D/Dynamics/Joints/b2Joint.bc \
$(ACTIVE)/Box2D/Dynamics/Joints/b2MouseJoint.bc \
$(ACTIVE)/Box2D/Dynamics/Joints/b2PrismaticJoint.bc \
$(ACTIVE)/Box2D/Dynamics/Joints/b2PulleyJoint.bc \
$(ACTIVE)/Box2D/Dynamics/Joints/b2RevoluteJoint.bc \
$(ACTIVE)/Box2D/Dynamics/Joints/b2RopeJoint.bc \
$(ACTIVE)/Box2D/Dynamics/Joints/b2WeldJoint.bc \
$(ACTIVE)/Box2D/Dynamics/Joints/b2WheelJoint.bc \
$(ACTIVE)/Box2D/Rope/b2Rope.bc


all: box2d.js box2d.wasm.js

%.bc: %.cpp
	$(CXX) $(OPTS) -I$(ACTIVE) $< -o $@

box2d.bc: $(OBJECTS)
	$(CXX) $(OPTS) -I$(ACTIVE) -o $@ $(OBJECTS)

box2d_glue.cpp: $(ACTIVE).idl
	$(PYTHON) $(EMSCRIPTEN)/tools/webidl_binder.py $(ACTIVE).idl box2d_glue

box2d_glue.h: box2d_glue.cpp

box2d.js: box2d.bc box2d_glue.cpp box2d_glue.h
	$(CXX) $(LINK_OPTS) -I$(ACTIVE) $< -o build/$(ACTIVE)_$(BUILD).js

box2d.wasm.js: box2d.bc box2d_glue.cpp box2d_glue.h
	$(CXX) $(LINK_OPTS) -I$(ACTIVE) $< -o build/$(ACTIVE)_$(BUILD).wasm.js -s WASM=1

clean: remove
	rm -f $(OBJECTS)
	rm -f box2d.bc box2d_bindings.cpp box2d_bindings.bc box2d.clean.h box2d_glue.js box2d_glue.cpp WebIDLGrammar.pkl parser.out

