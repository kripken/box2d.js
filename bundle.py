import os, sys

bundle = open(sys.argv[1], 'a')
bundle.write(open('box2d_glue.js', 'r').read())
bundle.write('''

this['Box2D'] = Module; // With or without a closure, the proper usage is Box2D.*

''')
bundle.close()

