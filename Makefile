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

LINK_OPTS = -s MODULARIZE=1 -s 'EXPORT_NAME="Box2D"' -s NO_FILESYSTEM=1 -s ENVIRONMENT=web -s EXPORT_BINDINGS=1 -s RESERVED_FUNCTION_POINTERS=20 --post-js box2d_glue.js --memory-init-file 0 -s NO_EXIT_RUNTIME=1 glue_stub.cpp -s NO_FILESYSTEM=1 -s EXPORTED_RUNTIME_METHODS=[]

ifeq ($(BUILD), debug)
	OPTS = -O0 -g2
	LINK_OPTS += -g -s ASSERTIONS=2 -s DEMANGLE_SUPPORT=1
else
	OPTS = -O3
	LINK_OPTS += -O3 --llvm-lto 1 --closure 1 -s IGNORE_CLOSURE_COMPILER_ERRORS=1
endif

ifeq ($(VERSION), latest)
	ACTIVE = $(LATEST)
	OBJECTS = \
	$(ACTIVE)/Box2D/Dynamics/Joints/b2MotorJoint.o
else ifeq ($(VERSION), stable)
	ACTIVE = $(STABLE)
else
	ACTIVE = $(VERSION)
endif


OBJECTS += \
$(ACTIVE)/Box2D/Collision/b2BroadPhase.o \
$(ACTIVE)/Box2D/Collision/b2CollideCircle.o \
$(ACTIVE)/Box2D/Collision/b2CollideEdge.o \
$(ACTIVE)/Box2D/Collision/b2CollidePolygon.o \
$(ACTIVE)/Box2D/Collision/b2Collision.o \
$(ACTIVE)/Box2D/Collision/b2Distance.o \
$(ACTIVE)/Box2D/Collision/b2DynamicTree.o \
$(ACTIVE)/Box2D/Collision/b2TimeOfImpact.o \
$(ACTIVE)/Box2D/Collision/Shapes/b2ChainShape.o \
$(ACTIVE)/Box2D/Collision/Shapes/b2CircleShape.o \
$(ACTIVE)/Box2D/Collision/Shapes/b2EdgeShape.o \
$(ACTIVE)/Box2D/Collision/Shapes/b2PolygonShape.o \
$(ACTIVE)/Box2D/Common/b2BlockAllocator.o \
$(ACTIVE)/Box2D/Common/b2Draw.o \
$(ACTIVE)/Box2D/Common/b2Math.o \
$(ACTIVE)/Box2D/Common/b2Settings.o \
$(ACTIVE)/Box2D/Common/b2StackAllocator.o \
$(ACTIVE)/Box2D/Common/b2Timer.o \
$(ACTIVE)/Box2D/Dynamics/b2Body.o \
$(ACTIVE)/Box2D/Dynamics/b2ContactManager.o \
$(ACTIVE)/Box2D/Dynamics/b2Fixture.o \
$(ACTIVE)/Box2D/Dynamics/b2Island.o \
$(ACTIVE)/Box2D/Dynamics/b2World.o \
$(ACTIVE)/Box2D/Dynamics/b2WorldCallbacks.o \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2ChainAndCircleContact.o \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2ChainAndPolygonContact.o \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2CircleContact.o \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2Contact.o \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2ContactSolver.o \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2EdgeAndCircleContact.o \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2EdgeAndPolygonContact.o \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2PolygonAndCircleContact.o \
$(ACTIVE)/Box2D/Dynamics/Contacts/b2PolygonContact.o \
$(ACTIVE)/Box2D/Dynamics/Joints/b2DistanceJoint.o \
$(ACTIVE)/Box2D/Dynamics/Joints/b2FrictionJoint.o \
$(ACTIVE)/Box2D/Dynamics/Joints/b2GearJoint.o \
$(ACTIVE)/Box2D/Dynamics/Joints/b2Joint.o \
$(ACTIVE)/Box2D/Dynamics/Joints/b2MouseJoint.o \
$(ACTIVE)/Box2D/Dynamics/Joints/b2PrismaticJoint.o \
$(ACTIVE)/Box2D/Dynamics/Joints/b2PulleyJoint.o \
$(ACTIVE)/Box2D/Dynamics/Joints/b2RevoluteJoint.o \
$(ACTIVE)/Box2D/Dynamics/Joints/b2RopeJoint.o \
$(ACTIVE)/Box2D/Dynamics/Joints/b2WeldJoint.o \
$(ACTIVE)/Box2D/Dynamics/Joints/b2WheelJoint.o \
$(ACTIVE)/Box2D/Rope/b2Rope.o


all: box2d.js box2d.wasm.js

%.o: %.cpp
	$(CXX) $(OPTS) -I$(ACTIVE) $< -o $@ -fno-exceptions -fno-rtti

box2d.o: $(OBJECTS)
	$(CXX) $(OPTS) -I$(ACTIVE) -o $@ $(OBJECTS)

box2d_glue.cpp: $(ACTIVE).idl
	$(PYTHON) $(EMSCRIPTEN)/tools/webidl_binder.py $(ACTIVE).idl box2d_glue

box2d_glue.h: box2d_glue.cpp

box2d.js: box2d.o box2d_glue.cpp box2d_glue.h
	$(CXX) $(LINK_OPTS) -I$(ACTIVE) $< -o build/$(ACTIVE)_$(BUILD).js -s WASM=0 -fno-rtti

box2d.wasm.js: box2d.o box2d_glue.cpp box2d_glue.h
	$(CXX) $(LINK_OPTS) -I$(ACTIVE) $< -o build/$(ACTIVE)_$(BUILD).wasm.js -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -fno-rtti

clean:
	rm -f $(OBJECTS)
	rm -f box2d.o box2d_bindings.cpp box2d_bindings.o box2d.clean.h box2d_glue.js box2d_glue.cpp WebIDLGrammar.pkl parser.out

