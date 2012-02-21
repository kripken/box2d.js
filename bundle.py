import os, sys

bundle = open(sys.argv[1], 'a')
bundle.write(open('box2d_bindings.js', 'r').read())
bundle.write('''

this['Box2D'] = Module; // With or without a closure, the proper usage is Box2D.*

// Additional bindings that the bindings generator does not automatically generate (like enums)

Module['b2_staticBody']    = 0;
Module['b2_kinematicBody'] = 1;
Module['b2_dynamicBody']   = 2;

''')
bundle.close()

