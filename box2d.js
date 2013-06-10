// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
  Module.test;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (typeof module === "object") {
  module.exports = Module;
}
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
function jsCall() {
  var args = Array.prototype.slice.call(arguments);
  return Runtime.functionPointers[args[0]].apply(null, args.slice(1));
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,Math.min(Math.floor((value)/(+(4294967296))), (+(4294967295)))>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
var awaitingMemoryInitializer = false;
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
    runPostSets();
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
  awaitingMemoryInitializer = false;
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 23168;
__ATINIT__ = __ATINIT__.concat([
]);
var __ZTVN10__cxxabiv120__si_class_type_infoE;
var __ZTVN10__cxxabiv117__class_type_infoE;
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,152,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,168,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,8,1,0,0,248,0,0,0,44,0,0,0,58,0,0,0,74,0,0,0,174,0,0,0,86,1,0,0,190,1,0,0,18,1,0,0,104,2,0,0,116,0,0,0,214,0,0,0,154,0,0,0,18,1,0,0,254,0,0,0,78,1,0,0,0,1,0,0,248,1,0,0,130,0,0,0,160,0,0,0,90,0,0,0,212,0,0,0,244,1,0,0,220,1,0,0,44,0,0,0,120,0,0,0,250,1,0,0,160,0,0,0,60,0,0,0,120,0,0,0,50,0,0,0,72,1,0,0,156,0,0,0,178,0,0,0,210,1,0,0,84,1,0,0,174,0,0,0,68,0,0,0,56,0,0,0,52,2,0,0,170,0,0,0,118,1,0,0,166,0,0,0,84,0,0,0,208,0,0,0,42,0,0,0,130,1,0,0,82,0,0,0,96,0,0,0,222,1,0,0,188,0,0,0,142,1,0,0,16,1,0,0,44,0,0,0,52,0,0,0,246,0,0,0,124,0,0,0,42,0,0,0,202,0,0,0,60,0,0,0,102,0,0,0,22,1,0,0,34,1,0,0,216,0,0,0,198,0,0,0,152,0,0,0,68,0,0,0,114,1,0,0,88,0,0,0,62,0,0,0,6,2,0,0,38,2,0,0,190,0,0,0,240,0,0,0,132,0,0,0,96,1,0,0,152,0,0,0,52,0,0,0,64,0,0,0,108,1,0,0,218,0,0,0,138,0,0,0,150,1,0,0,46,0,0,0,78,0,0,0,54,0,0,0,202,0,0,0,56,1,0,0,28,1,0,0,66,1,0,0,250,0,0,0,28,2,0,0,60,0,0,0,248,0,0,0,88,1,0,0,0,1,0,0,66,2,0,0,222,0,0,0,72,2,0,0,2,1,0,0,168,0,0,0,116,0,0,0,56,0,0,0,56,0,0,0,80,2,0,0,70,0,0,0,190,0,0,0,148,0,0,0,74,0,0,0,42,0,0,0,72,0,0,0,62,2,0,0,76,0,0,0,162,1,0,0,178,1,0,0,50,0,0,0,70,0,0,0,46,0,0,0,50,0,0,0,126,1,0,0,60,0,0,0,166,0,0,0,198,0,0,0,188,1,0,0,60,1,0,0,56,2,0,0,40,2,0,0,170,1,0,0,136,1,0,0,222,0,0,0,94,1,0,0,64,0,0,0,212,0,0,0,120,1,0,0,106,1,0,0,98,2,0,0,136,0,0,0,68,0,0,0,88,1,0,0,146,0,0,0,106,2,0,0,62,0,0,0,42,0,0,0,148,0,0,0,88,0,0,0,208,0,0,0,164,0,0,0,86,0,0,0,130,0,0,0,108,0,0,0,92,0,0,0,166,0,0,0,72,0,0,0,238,0,0,0,14,1,0,0,84,0,0,0,96,0,0,0,58,1,0,0,148,1,0,0,210,1,0,0,170,1,0,0,94,0,0,0,118,0,0,0,62,1,0,0,54,1,0,0,82,0,0,0,200,1,0,0,74,0,0,0,242,1,0,0,128,1,0,0,120,0,0,0,134,0,0,0,224,0,0,0,50,0,0,0,46,0,0,0,38,1,0,0,46,1,0,0,46,0,0,0,240,0,0,0,20,1,0,0,208,0,0,0,118,0,0,0,46,0,0,0,254,0,0,0,54,1,0,0,42,0,0,0,72,0,0,0,50,0,0,0,64,1,0,0,44,0,0,0,42,0,0,0,214,0,0,0,142,1,0,0,164,1,0,0,2,1,0,0,214,0,0,0,62,0,0,0,140,0,0,0,174,0,0,0,138,0,0,0,116,0,0,0,76,0,0,0,46,0,0,0,76,0,0,0,216,1,0,0,100,2,0,0,56,0,0,0,72,0,0,0,100,0,0,0,168,1,0,0,2,2,0,0,80,0,0,0,144,1,0,0,174,0,0,0,78,1,0,0,194,1,0,0,72,0,0,0,16,1,0,0,80,1,0,0,246,0,0,0,42,0,0,0,152,1,0,0,196,0,0,0,32,2,0,0,106,0,0,0,56,0,0,0,208,1,0,0,246,1,0,0,228,0,0,0,112,0,0,0,42,0,0,0,78,0,0,0,52,0,0,0,0,2,0,0,84,0,0,0,158,0,0,0,198,0,0,0,60,1,0,0,238,0,0,0,94,2,0,0,72,0,0,0,134,0,0,0,222,0,0,0,232,0,0,0,116,0,0,0,196,1,0,0,76,1,0,0,46,0,0,0,44,0,0,0,48,0,0,0,42,0,0,0,204,0,0,0,94,0,0,0,66,0,0,0,218,0,0,0,186,0,0,0,146,0,0,0,112,1,0,0,86,0,0,0,206,1,0,0,212,1,0,0,230,0,0,0,188,0,0,0,94,1,0,0,38,1,0,0,168,1,0,0,44,0,0,0,54,0,0,0,248,0,0,0,78,2,0,0,238,1,0,0,14,2,0,0,82,0,0,0,118,0,0,0,126,0,0,0,210,0,0,0,200,0,0,0,14,1,0,0,90,2,0,0,118,1,0,0,56,1,0,0,126,0,0,0,62,0,0,0,254,1,0,0,20,2,0,0,216,0,0,0,244,0,0,0,42,0,0,0,46,0,0,0,82,0,0,0,150,0,0,0,58,0,0,0,110,0,0,0,70,0,0,0,30,1,0,0,186,1,0,0,182,0,0,0,88,0,0,0,42,0,0,0,44,0,0,0,52,0,0,0,54,0,0,0,134,1,0,0,166,1,0,0,204,0,0,0,42,1,0,0,78,0,0,0,110,0,0,0,162,0,0,0,202,1,0,0,64,0,0,0,236,0,0,0,46,0,0,0,158,0,0,0,54,0,0,0,218,0,0,0,124,1,0,0,100,0,0,0,142,0,0,0,58,1,0,0,110,1,0,0,168,0,0,0,74,0,0,0,160,0,0,0,160,1,0,0,230,1,0,0,232,1,0,0,164,0,0,0,188,0,0,0,138,1,0,0,238,0,0,0,52,0,0,0,138,0,0,0,104,1,0,0,108,0,0,0,242,0,0,0,70,0,0,0,180,0,0,0,44,0,0,0,90,1,0,0,72,1,0,0,48,0,0,0,206,0,0,0,140,1,0,0,60,0,0,0,172,1,0,0,226,0,0,0,90,0,0,0,216,0,0,0,44,0,0,0,44,0,0,0,154,1,0,0,76,0,0,0,206,0,0,0,214,1,0,0,220,0,0,0,88,0,0,0,186,0,0,0,142,0,0,0,192,0,0,0,122,0,0,0,106,0,0,0,226,0,0,0,98,1,0,0,42,0,0,0,44,0,0,0,196,0,0,0,252,1,0,0,50,0,0,0,186,0,0,0,122,0,0,0,86,1,0,0,66,0,0,0,150,0,0,0,198,1,0,0,62,0,0,0,48,0,0,0,66,0,0,0,56,0,0,0,92,2,0,0,60,0,0,0,116,1,0,0,46,0,0,0,110,1,0,0,186,0,0,0,28,1,0,0,184,0,0,0,188,0,0,0,80,0,0,0,50,0,0,0,164,0,0,0,54,0,0,0,186,0,0,0,54,0,0,0,236,1,0,0,22,1,0,0,234,0,0,0,46,0,0,0,196,0,0,0,232,0,0,0,176,1,0,0,12,1,0,0,210,0,0,0,4,1,0,0,122,0,0,0,212,0,0,0,184,0,0,0,84,0,0,0,140,1,0,0,224,0,0,0,50,0,0,0,226,0,0,0,242,0,0,0,50,1,0,0,44,0,0,0,56,0,0,0,70,0,0,0,100,0,0,0,66,0,0,0,92,0,0,0,84,0,0,0,58,0,0,0,46,0,0,0,42,0,0,0,92,0,0,0,64,0,0,0,134,1,0,0,10,1,0,0,184,0,0,0,48,0,0,0,52,1,0,0,94,0,0,0,164,0,0,0,36,1,0,0,162,0,0,0,66,0,0,0,48,0,0,0,106,0,0,0,54,0,0,0,176,0,0,0,108,2,0,0,44,0,0,0,68,0,0,0,82,1,0,0,44,0,0,0,100,0,0,0,98,1,0,0,98,0,0,0,152,0,0,0,154,0,0,0,206,0,0,0,188,0,0,0,44,1,0,0,122,1,0,0,172,1,0,0,74,0,0,0,132,1,0,0,206,0,0,0,138,0,0,0,72,0,0,0,86,0,0,0,156,0,0,0,144,0,0,0,158,0,0,0,58,0,0,0,132,0,0,0,124,0,0,0,252,0,0,0,48,0,0,0,100,0,0,0,88,2,0,0,62,0,0,0,136,0,0,0,74,2,0,0,96,0,0,0,54,0,0,0,124,0,0,0,122,0,0,0,182,1,0,0,94,0,0,0,24,2,0,0,68,0,0,0,68,0,0,0,188,1,0,0,192,0,0,0,254,0,0,0,60,2,0,0,186,1,0,0,64,0,0,0,76,0,0,0,152,0,0,0,218,0,0,0,156,0,0,0,16,1,0,0,44,1,0,0,80,0,0,0,36,2,0,0,198,0,0,0,160,0,0,0,42,0,0,0,142,0,0,0,240,1,0,0,10,2,0,0,116,0,0,0,72,0,0,0,144,0,0,0,192,1,0,0,172,0,0,0,146,0,0,0,92,1,0,0,166,0,0,0,82,1,0,0,48,0,0,0,16,2,0,0,244,0,0,0,98,0,0,0,190,0,0,0,92,0,0,0,240,0,0,0,234,1,0,0,56,0,0,0,122,0,0,0,118,0,0,0,64,2,0,0,48,1,0,0,172,0,0,0,218,1,0,0,102,0,0,0,130,0,0,0,204,0,0,0,64,0,0,0,26,1,0,0,74,1,0,0,54,2,0,0,106,0,0,0,76,2,0,0,92,0,0,0,178,0,0,0,18,2,0,0,18,1,0,0,42,2,0,0,92,1,0,0,48,1,0,0,58,0,0,0,228,0,0,0,86,2,0,0,202,0,0,0,148,0,0,0,124,0,0,0,192,0,0,0,52,0,0,0,120,0,0,0,176,0,0,0,70,0,0,0,154,0,0,0,78,0,0,0,246,0,0,0,50,0,0,0,84,1,0,0,44,2,0,0,138,0,0,0,98,0,0,0,42,0,0,0,96,2,0,0,36,1,0,0,94,0,0,0,108,0,0,0,158,1,0,0,64,1,0,0,52,1,0,0,132,0,0,0,166,0,0,0,62,0,0,0,40,1,0,0,84,0,0,0,74,1,0,0,112,0,0,0,198,0,0,0,206,0,0,0,96,0,0,0,68,0,0,0,70,0,0,0,4,2,0,0,68,1,0,0,114,0,0,0,2,1,0,0,102,0,0,0,74,0,0,0,100,0,0,0,48,2,0,0,202,0,0,0,234,0,0,0,108,0,0,0,250,0,0,0,136,0,0,0,154,1,0,0,104,0,0,0,10,1,0,0,102,1,0,0,104,0,0,0,74,0,0,0,200,1,0,0,236,0,0,0,200,0,0,0,252,0,0,0,226,0,0,0,78,0,0,0,28,1,0,0,144,0,0,0,46,1,0,0,50,1,0,0,128,0,0,0,164,0,0,0,102,0,0,0,42,0,0,0,48,0,0,0,236,0,0,0,52,0,0,0,128,0,0,0,194,0,0,0,76,0,0,0,178,0,0,0,52,0,0,0,170,0,0,0,146,0,0,0,214,0,0,0,58,0,0,0,132,0,0,0,90,0,0,0,156,0,0,0,42,0,0,0,110,0,0,0,218,1,0,0,204,0,0,0,112,0,0,0,44,0,0,0,66,0,0,0,102,2,0,0,98,0,0,0,64,0,0,0,92,0,0,0,96,0,0,0,200,0,0,0,42,0,0,0,78,0,0,0,50,2,0,0,170,0,0,0,194,0,0,0,170,0,0,0,216,1,0,0,70,1,0,0,68,1,0,0,46,2,0,0,14,1,0,0,138,1,0,0,180,0,0,0,140,0,0,0,60,0,0,0,82,0,0,0,94,0,0,0,112,0,0,0,72,0,0,0,172,0,0,0,144,0,0,0,180,0,0,0,182,1,0,0,244,0,0,0,68,1,0,0,120,0,0,0,220,0,0,0,112,0,0,0,186,0,0,0,214,1,0,0,48,0,0,0,136,1,0,0,242,0,0,0,10,1,0,0,70,0,0,0,50,0,0,0,60,0,0,0,234,0,0,0,22,2,0,0,172,0,0,0,178,0,0,0,110,2,0,0,60,0,0,0,134,0,0,0,178,0,0,0,118,0,0,0,76,0,0,0,92,0,0,0,90,0,0,0,178,0,0,0,156,1,0,0,88,0,0,0,160,1,0,0,62,1,0,0,112,0,0,0,168,0,0,0,174,1,0,0,6,1,0,0,64,0,0,0,106,0,0,0,50,0,0,0,42,0,0,0,184,0,0,0,6,1,0,0,62,1,0,0,114,0,0,0,116,0,0,0,46,0,0,0,124,0,0,0,204,1,0,0,220,0,0,0,196,0,0,0,42,0,0,0,96,0,0,0,134,0,0,0,192,0,0,0,146,0,0,0,102,1,0,0,104,0,0,0,26,1,0,0,154,0,0,0,182,0,0,0,150,0,0,0,72,0,0,0,54,0,0,0,230,0,0,0,58,0,0,0,86,1,0,0,250,0,0,0,232,0,0,0,34,1,0,0,108,0,0,0,226,1,0,0,142,0,0,0,248,0,0,0,162,1,0,0,176,0,0,0,182,0,0,0,212,0,0,0,56,0,0,0,66,0,0,0,104,0,0,0,98,0,0,0,142,0,0,0,86,0,0,0,102,0,0,0,110,0,0,0,58,0,0,0,66,0,0,0,62,0,0,0,102,0,0,0,60,0,0,0,118,0,0,0,202,1,0,0,100,1,0,0,42,0,0,0,20,1,0,0,98,0,0,0,190,0,0,0,42,1,0,0,30,2,0,0,58,2,0,0,128,0,0,0,178,1,0,0,42,0,0,0,246,0,0,0,66,1,0,0,196,0,0,0,8,2,0,0,50,0,0,0,70,0,0,0,162,0,0,0,90,0,0,0,106,0,0,0,140,0,0,0,156,0,0,0,172,0,0,0,82,0,0,0,146,1,0,0,182,0,0,0,94,0,0,0,68,0,0,0,154,0,0,0,196,1,0,0,252,0,0,0,116,1,0,0,48,0,0,0,194,1,0,0,114,0,0,0,150,0,0,0,12,1,0,0,44,0,0,0,208,1,0,0,210,0,0,0,12,2,0,0,82,2,0,0,56,0,0,0,46,0,0,0,240,0,0,0,242,0,0,0,44,0,0,0,62,0,0,0,172,0,0,0,90,0,0,0,42,0,0,0,150,0,0,0,162,0,0,0,210,0,0,0,170,0,0,0,176,0,0,0,68,0,0,0,32,1,0,0,190,1,0,0,188,0,0,0,180,1,0,0,70,1,0,0,156,1,0,0,204,0,0,0,24,1,0,0,52,0,0,0,70,0,0,0,74,1,0,0,176,0,0,0,100,0,0,0,86,0,0,0,48,0,0,0,90,0,0,0,194,0,0,0,220,1,0,0,192,1,0,0,42,1,0,0,208,0,0,0,184,1,0,0,86,0,0,0,126,1,0,0,56,0,0,0,230,0,0,0,202,0,0,0,158,0,0,0,78,0,0,0,194,0,0,0,64,0,0,0,196,0,0,0,180,0,0,0,154,0,0,0,122,1,0,0,90,1,0,0,86,0,0,0,126,0,0,0,60,1,0,0,126,0,0,0,62,0,0,0,92,0,0,0,132,0,0,0,24,1,0,0,204,1,0,0,114,0,0,0,58,0,0,0,96,1,0,0,58,0,0,0,66,0,0,0,176,1,0,0,148,0,0,0,180,0,0,0,76,0,0,0,124,0,0,0,24,1,0,0,138,0,0,0,26,2,0,0,182,0,0,0,80,0,0,0,108,0,0,0,72,1,0,0,174,1,0,0,130,0,0,0,44,0,0,0,44,0,0,0,60,0,0,0,164,0,0,0,114,0,0,0,84,2,0,0,146,1,0,0,104,1,0,0,148,1,0,0,146,0,0,0,158,0,0,0,34,2,0,0,132,0,0,0,116,0,0,0,100,0,0,0,166,1,0,0,78,1,0,0,128,1,0,0,168,0,0,0,32,1,0,0,152,1,0,0,228,1,0,0,136,0,0,0,86,0,0,0,110,0,0,0,224,1,0,0,110,0,0,0,144,0,0,0,128,0,0,0,104,0,0,0,30,1,0,0,232,0,0,0,244,0,0,0,158,1,0,0,200,0,0,0,136,0,0,0,80,0,0,0,134,0,0,0,98,0,0,0,176,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,76,0,0,0,0,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,109,95,102,105,120,116,117,114,101,67,111,117,110,116,32,62,32,48,0,0,0,0,0,0,32,32,106,100,46,109,97,120,77,111,116,111,114,84,111,114,113,117,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,101,110,97,98,108,101,76,105,109,105,116,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,32,32,106,100,46,106,111,105,110,116,50,32,61,32,106,111,105,110,116,115,91,37,100,93,59,10,0,0,0,0,0,0,32,32,106,100,46,109,97,120,70,111,114,99,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,98,50,86,101,99,50,32,103,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,32,32,32,32,102,100,46,102,105,108,116,101,114,46,109,97,115,107,66,105,116,115,32,61,32,117,105,110,116,49,54,40,37,100,41,59,10,0,0,0,48,32,60,61,32,105,66,32,38,38,32,105,66,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,102,105,120,116,117,114,101,45,62,109,95,98,111,100,121,32,61,61,32,116,104,105,115,0,32,32,106,100,46,109,111,116,111,114,83,112,101,101,100,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,32,32,106,100,46,103,114,111,117,110,100,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,32,32,106,100,46,106,111,105,110,116,49,32,61,32,106,111,105,110,116,115,91,37,100,93,59,10,0,0,0,0,0,0,118,101,114,116,101,120,67,111,117,110,116,32,60,61,32,56,0,0,0,0,0,0,0,0,32,32,32,32,102,100,46,102,105,108,116,101,114,46,99,97,116,101,103,111,114,121,66,105,116,115,32,61,32,117,105,110,116,49,54,40,37,100,41,59,10,0,0,0,0,0,0,0,105,65,32,33,61,32,40,45,49,41,0,0,0,0,0,0,109,95,119,111,114,108,100,45,62,73,115,76,111,99,107,101,100,40,41,32,61,61,32,102,97,108,115,101,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,66,111,100,121,46,99,112,112,0,0,32,32,106,100,46,101,110,97,98,108,101,77,111,116,111,114,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,32,32,106,100,46,103,114,111,117,110,100,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,109,109,111,110,47,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,46,99,112,112,0,0,97,108,112,104,97,48,32,60,32,49,46,48,102,0,0,0,32,32,32,32,102,100,46,105,115,83,101,110,115,111,114,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,99,104,105,108,100,50,32,33,61,32,40,45,49,41,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,108,105,110,101,97,114,68,97,109,112,105,110,103,41,32,38,38,32,98,100,45,62,108,105,110,101,97,114,68,97,109,112,105,110,103,32,62,61,32,48,46,48,102,0,0,0,0,0,0,0,99,111,117,110,116,32,62,61,32,51,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,120,105,115,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,32,32,106,100,46,114,101,102,101,114,101,110,99,101,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,109,97,120,76,101,110,103,116,104,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,77,111,117,115,101,32,106,111,105,110,116,32,100,117,109,112,105,110,103,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,46,10,0,0,32,32,106,100,46,108,101,110,103,116,104,32,61,32,37,46,49,53,108,101,102,59,10,0,99,104,105,108,100,49,32,33,61,32,40,45,49,41,0,0,116,121,112,101,65,32,61,61,32,98,50,95,100,121,110,97,109,105,99,66,111,100,121,32,124,124,32,116,121,112,101,66,32,61,61,32,98,50,95,100,121,110,97,109,105,99,66,111,100,121,0,0,0,0,0,0,32,32,32,32,102,100,46,100,101,110,115,105,116,121,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,105,115,116,97,110,99,101,46,99,112,112,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,109,109,111,110,47,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,46,99,112,112,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,97,110,103,117,108,97,114,68,97,109,112,105,110,103,41,32,38,38,32,98,100,45,62,97,110,103,117,108,97,114,68,97,109,112,105,110,103,32,62,61,32,48,46,48,102,0,0,0,0,0,112,32,61,61,32,101,110,116,114,121,45,62,100,97,116,97,0,0,0,0,0,0,0,0,97,114,101,97,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,0,99,104,105,108,100,73,110,100,101,120,32,60,32,109,95,99,111,117,110,116,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,48,32,60,32,99,111,117,110,116,32,38,38,32,99,111,117,110,116,32,60,32,51,0,0,100,32,43,32,104,32,42,32,107,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,0,0,0,0,112,99,45,62,112,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,83,104,97,112,101,115,47,98,50,80,111,108,121,103,111,110,83,104,97,112,101,46,99,112,112,0,0,109,95,110,111,100,101,115,91,112,114,111,120,121,73,100,93,46,73,115,76,101,97,102,40,41,0,0,0,0,0,0,0,115,116,97,99,107,67,111,117,110,116,32,60,32,115,116,97,99,107,83,105,122,101,0,0,32,32,32,32,102,100,46,114,101,115,116,105,116,117,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,99,97,99,104,101,45,62,99,111,117,110,116,32,60,61,32,51,0,0,0,0,0,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,97,110,103,117,108,97,114,86,101,108,111,99,105,116,121,41,0,0,109,95,101,110,116,114,121,67,111,117,110,116,32,62,32,48,0,0,0,0,0,0,0,0,98,108,111,99,107,67,111,117,110,116,32,42,32,98,108,111,99,107,83,105,122,101,32,60,61,32,98,50,95,99,104,117,110,107,83,105,122,101,0,0,109,95,118,101,114,116,101,120,67,111,117,110,116,32,62,61,32,51,0,0,0,0,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,109,95,99,111,117,110,116,32,45,32,49,0,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,98,50,73,115,86,97,108,105,100,40,100,101,102,45,62,100,97,109,112,105,110,103,82,97,116,105,111,41,32,38,38,32,100,101,102,45,62,100,97,109,112,105,110,103,82,97,116,105,111,32,62,61,32,48,46,48,102,0,0,0,0,0,0,0,32,32,98,50,71,101,97,114,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,97,46,120,32,62,61,32,48,46,48,102,32,38,38,32,97,46,121,32,62,61,32,48,46,48,102,0,0,0,0,0,0,48,32,60,61,32,116,121,112,101,65,32,38,38,32,116,121,112,101,66,32,60,32,98,50,83,104,97,112,101,58,58,101,95,116,121,112,101,67,111,117,110,116,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,83,104,97,112,101,115,47,98,50,67,104,97,105,110,83,104,97,112,101,46,99,112,112,0,0,0,0,98,45,62,73,115,65,99,116,105,118,101,40,41,32,61,61,32,116,114,117,101,0,0,0,32,32,98,50,87,104,101,101,108,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,32,32,32,32,102,100,46,102,114,105,99,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,32,32,98,50,87,101,108,100,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,109,95,99,111,117,110,116,0,0,0,32,32,98,50,82,111,112,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,97,110,103,108,101,41,0,0,0,0,109,95,101,110,116,114,121,67,111,117,110,116,32,60,32,98,50,95,109,97,120,83,116,97,99,107,69,110,116,114,105,101,115,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,46,99,112,112,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,98,50,95,98,108,111,99,107,83,105,122,101,115,0,0,0,0,0,48,46,48,102,32,60,61,32,108,111,119,101,114,32,38,38,32,108,111,119,101,114,32,60,61,32,105,110,112,117,116,46,109,97,120,70,114,97,99,116,105,111,110,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,80,117,108,108,101,121,74,111,105,110,116,46,99,112,112,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,84,105,109,101,79,102,73,109,112,97,99,116,46,99,112,112,0,99,111,117,110,116,32,62,61,32,50,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,32,32,106,100,46,99,111,108,108,105,100,101,67,111,110,110,101,99,116,101,100,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,0,32,32,98,50,80,117,108,108,101,121,74,111,105,110,116,68,101,102,32,106,100,59,10,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,46,99,112,112,0,98,50,73,115,86,97,108,105,100,40,100,101,102,45,62,102,114,101,113,117,101,110,99,121,72,122,41,32,38,38,32,100,101,102,45,62,102,114,101,113,117,101,110,99,121,72,122,32,62,61,32,48,46,48,102,0,47,47,32,68,117,109,112,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,102,111,114,32,116,104,105,115,32,106,111,105,110,116,32,116,121,112,101,46,10,0,0,98,50,73,115,86,97,108,105,100,40,114,97,116,105,111,41,0,0,0,0,0,0,0,0,32,32,32,32,98,111,100,105,101,115,91,37,100,93,45,62,67,114,101,97,116,101,70,105,120,116,117,114,101,40,38,102,100,41,59,10,0,0,0,0,32,32,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,77,111,117,115,101,74,111,105,110,116,46,99,112,112,0,0,0,0,0,112,111,105,110,116,67,111,117,110,116,32,61,61,32,49,32,124,124,32,112,111,105,110,116,67,111,117,110,116,32,61,61,32,50,0,0,0,0,0,0,115,95,105,110,105,116,105,97,108,105,122,101,100,32,61,61,32,116,114,117,101,0,0,0,32,32,32,32,102,100,46,115,104,97,112,101,32,61,32,38,115,104,97,112,101,59,10,0,109,95,106,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,0,0,0,0,0,0,48,32,60,32,109,95,110,111,100,101,67,111,117,110,116,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,74,111,105,110,116,46,99,112,112,0,0,32,32,32,32,98,50,70,105,120,116,117,114,101,68,101,102,32,102,100,59,10,0,0,0,10,0,0,0,0,0,0,0,32,32,125,10,0,0,0,0,110,111,100,101,45,62,73,115,76,101,97,102,40,41,32,61,61,32,102,97,108,115,101,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,71,101,97,114,74,111,105,110,116,46,99,112,112,0,0,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,78,101,120,116,86,101,114,116,101,120,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,32,32,123,10,0,0,0,0,109,95,110,111,100,101,67,111,117,110,116,32,43,32,102,114,101,101,67,111,117,110,116,32,61,61,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,105,115,116,97,110,99,101,46,104,0,0,0,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,80,114,101,118,86,101,114,116,101,120,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,46,99,112,112,0,0,71,101,116,72,101,105,103,104,116,40,41,32,61,61,32,67,111,109,112,117,116,101,72,101,105,103,104,116,40,41,0,0,48,32,60,61,32,102,114,101,101,73,110,100,101,120,32,38,38,32,102,114,101,101,73,110,100,101,120,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,0,109,95,98,111,100,121,67,111,117,110,116,32,60,32,109,95,98,111,100,121,67,97,112,97,99,105,116,121,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,110,101,120,116,86,101,114,116,101,120,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,32,32,98,111,100,105,101,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,66,111,100,121,40,38,98,100,41,59,10,0,0,0,0,0,0,0,32,32,98,50,68,105,115,116,97,110,99,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,0,0,0,0,98,100,45,62,108,105,110,101,97,114,86,101,108,111,99,105,116,121,46,73,115,86,97,108,105,100,40,41,0,0,0,0,109,95,101,110,116,114,121,67,111,117,110,116,32,61,61,32,48,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,0,0,0,109,95,99,111,110,116,97,99,116,67,111,117,110,116,32,60,32,109,95,99,111,110,116,97,99,116,67,97,112,97,99,105,116,121,0,0,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,112,114,101,118,86,101,114,116,101,120,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,32,32,98,100,46,103,114,97,118,105,116,121,83,99,97,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,97,97,98,98,46,117,112,112,101,114,66,111,117,110,100,32,61,61,32,110,111,100,101,45,62,97,97,98,98,46,117,112,112,101,114,66,111,117,110,100,0,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,0,0,109,95,106,111,105,110,116,67,111,117,110,116,32,60,32,109,95,106,111,105,110,116,67,97,112,97,99,105,116,121,0,0,32,32,32,32,115,104,97,112,101,46,67,114,101,97,116,101,67,104,97,105,110,40,118,115,44,32,37,100,41,59,10,0,32,32,98,100,46,97,99,116,105,118,101,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,0,0,0,48,32,60,32,115,105,122,101,0,0,0,0,0,0,0,0,97,97,98,98,46,108,111,119,101,114,66,111,117,110,100,32,61,61,32,110,111,100,101,45,62,97,97,98,98,46,108,111,119,101,114,66,111,117,110,100,0,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,0,0,0,0,101,100,103,101,46,76,101,110,103,116,104,83,113,117,97,114,101,100,40,41,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,32,42,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,73,115,108,97,110,100,46,104,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,32,32,32,32,98,50,67,104,97,105,110,83,104,97,112,101,32,115,104,97,112,101,59,10,0,0,0,0,0,0,0,0,32,32,98,100,46,98,117,108,108,101,116,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,0,0,0,110,111,100,101,45,62,104,101,105,103,104,116,32,61,61,32,104,101,105,103,104,116,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,109,109,111,110,47,98,50,77,97,116,104,46,104,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,66,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,32,32,115,104,97,112,101,46,83,101,116,40,118,115,44,32,37,100,41,59,10,0,32,32,98,100,46,102,105,120,101,100,82,111,116,97,116,105,111,110,32,61,32,98,111,111,108,40,37,100,41,59,10,0,109,95,110,111,100,101,115,91,99,104,105,108,100,50,93,46,112,97,114,101,110,116,32,61,61,32,105,110,100,101,120,0,32,32,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,0,0,0,0,100,101,102,45,62,114,97,116,105,111,32,33,61,32,48,46,48,102,0,0,0,0,0,0,32,32,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,0,0,0,98,50,73,115,86,97,108,105,100,40,100,101,102,45,62,109,97,120,70,111,114,99,101,41,32,38,38,32,100,101,102,45,62,109,97,120,70,111,114,99,101,32,62,61,32,48,46,48,102,0,0,0,0,0,0,0,100,101,102,45,62,98,111,100,121,65,32,33,61,32,100,101,102,45,62,98,111,100,121,66,0,0,0,0,0,0,0,0,32,32,32,32,118,115,91,37,100,93,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,32,32,98,100,46,97,119,97,107,101,32,61,32,98,111,111,108,40,37,100,41,59,10,0,109,95,116,121,112,101,66,32,61,61,32,101,95,114,101,118,111,108,117,116,101,74,111,105,110,116,32,124,124,32,109,95,116,121,112,101,66,32,61,61,32,101,95,112,114,105,115,109,97,116,105,99,74,111,105,110,116,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,46,99,112,112,0,0,0,0,0,0,0,0,109,95,110,111,100,101,115,91,99,104,105,108,100,49,93,46,112,97,114,101,110,116,32,61,61,32,105,110,100,101,120,0,98,50,73,115,86,97,108,105,100,40,116,111,114,113,117,101,41,32,38,38,32,116,111,114,113,117,101,32,62,61,32,48,46,48,102,0,0,0,0,0,109,95,102,105,120,116,117,114,101,66,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,112,111,108,121,103,111,110,0,0,0,0,0,109,95,102,105,120,116,117,114,101,66,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,99,105,114,99,108,101,0,0,0,0,0,0,109,97,110,105,102,111,108,100,45,62,112,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,0,0,0,0,0,0,48,32,60,61,32,116,121,112,101,50,32,38,38,32,116,121,112,101,50,32,60,32,98,50,83,104,97,112,101,58,58,101,95,116,121,112,101,67,111,117,110,116,0,0,0,0,0,0,32,32,32,32,98,50,86,101,99,50,32,118,115,91,37,100,93,59,10,0,0,0,0,0,32,32,98,100,46,97,108,108,111,119,83,108,101,101,112,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,48,32,60,61,32,99,104,105,108,100,50,32,38,38,32,99,104,105,108,100,50,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,32,32,98,100,46,97,110,103,117,108,97,114,68,97,109,112,105,110,103,32,61,32,37,46,49,53,108,101,102,59,10,0,109,95,98,111,100,121,67,111,117,110,116,32,62,32,48,0,116,111,105,73,110,100,101,120,66,32,60,32,109,95,98,111,100,121,67,111,117,110,116,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,0,0,48,32,60,61,32,110,111,100,101,73,100,32,38,38,32,110,111,100,101,73,100,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,0,0,0,0,32,32,32,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,115,104,97,112,101,59,10,0,0,0,0,0,0,48,32,60,61,32,112,114,111,120,121,73,100,32,38,38,32,112,114,111,120,121,73,100,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,0,0,0,48,32,60,61,32,99,104,105,108,100,49,32,38,38,32,99,104,105,108,100,49,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,32,32,98,100,46,108,105,110,101,97,114,68,97,109,112,105,110,103,32,61,32,37,46,49,53,108,101,102,59,10,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,0,0,0,0,114,46,76,101,110,103,116,104,83,113,117,97,114,101,100,40,41,32,62,32,48,46,48,102,0,0,0,0,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,86,101,114,116,101,120,51,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,110,111,100,101,45,62,104,101].concat([105,103,104,116,32,61,61,32,48,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,67,111,108,108,105,100,101,80,111,108,121,103,111,110,46,99,112,112,0,0,0,0,0,0,0,32,32,98,100,46,97,110,103,117,108,97,114,86,101,108,111,99,105,116,121,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,121,110,97,109,105,99,84,114,101,101,46,104,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,86,101,114,116,101,120,48,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,99,104,105,108,100,50,32,61,61,32,40,45,49,41,0,0,32,32,98,100,46,108,105,110,101,97,114,86,101,108,111,99,105,116,121,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,98,111,100,105,101,115,32,61,32,78,85,76,76,59,10,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,51,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,32,32,98,100,46,97,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,98,100,45,62,112,111,115,105,116,105,111,110,46,73,115,86,97,108,105,100,40,41,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,87,111,114,108,100,46,99,112,112,0,109,95,105,110,100,101,120,32,61,61,32,48,0,0,0,0,109,95,110,111,100,101,115,91,105,110,100,101,120,93,46,112,97,114,101,110,116,32,61,61,32,40,45,49,41,0,0,0,106,111,105,110,116,115,32,61,32,78,85,76,76,59,10,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,50,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,73,115,108,97,110,100,46,99,112,112,0,0,0,0,0,0,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,99,104,97,105,110,45,62,109,95,99,111,117,110,116,0,0,0,0,32,32,98,100,46,112,111,115,105,116,105,111,110,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,98,50,70,114,101,101,40,98,111,100,105,101,115,41,59,10,0,0,0,0,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,49,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,106,32,60,32,98,50,95,98,108,111,99,107,83,105,122,101,115,0,0,0,0,0,0,0,109,95,110,111,100,101,115,91,66,45,62,112,97,114,101,110,116,93,46,99,104,105,108,100,50,32,61,61,32,105,65,0,32,32,98,100,46,116,121,112,101,32,61,32,98,50,66,111,100,121,84,121,112,101,40,37,100,41,59,10,0,0,0,0,32,32,106,100,46,109,97,120,77,111,116,111,114,70,111,114,99,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,51,32,60,61,32,99,111,117,110,116,32,38,38,32,99,111,117,110,116,32,60,61,32,56,0,0,0,0,0,0,0,0,98,50,70,114,101,101,40,106,111,105,110,116,115,41,59,10,0,0,0,0,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,48,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,48,32,60,61,32,105,69,32,38,38,32,105,69,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,32,32,98,50,66,111,100,121,68,101,102,32,98,100,59,10,0,0,0,0,0,0,0,0,109,95,118,101,114,116,105,99,101,115,32,61,61,32,95,95,110,117,108,108,32,38,38,32,109,95,99,111,117,110,116,32,61,61,32,48,0,0,0,0,48,32,60,61,32,105,68,32,38,38,32,105,68,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,125,10,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,65,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,32,32,98,50,69,100,103,101,83,104,97,112,101,32,115,104,97,112,101,59,10,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,121,110,97,109,105,99,84,114,101,101,46,99,112,112,0,0,108,111,119,101,114,32,60,61,32,117,112,112,101,114,0,0,116,97,114,103,101,116,32,62,32,116,111,108,101,114,97,110,99,101,0,0,0,0,0,0,114,97,116,105,111,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,32,32,106,100,46,114,97,116,105,111,32,61,32,37,46,49,53,108,101,102,59,10,0,0,100,101,102,45,62,116,97,114,103,101,116,46,73,115,86,97,108,105,100,40,41,0,0,0,109,95,110,111,100,101,115,91,67,45,62,112,97,114,101,110,116,93,46,99,104,105,108,100,50,32,61,61,32,105,65,0,123,10,0,0,0,0,0,0,102,97,108,115,101,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,112,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,109,95,116,121,112,101,65,32,61,61,32,101,95,114,101,118,111,108,117,116,101,74,111,105,110,116,32,124,124,32,109,95,116,121,112,101,65,32,61,61,32,101,95,112,114,105,115,109,97,116,105,99,74,111,105,110,116,0,0,0,0,0,0,0,48,32,60,61,32,101,100,103,101,49,32,38,38,32,101,100,103,101,49,32,60,32,112,111,108,121,49,45,62,109,95,118,101,114,116,101,120,67,111,117,110,116,0,0,0,0,0,0,98,50,73,115,86,97,108,105,100,40,102,111,114,99,101,41,32,38,38,32,102,111,114,99,101,32,62,61,32,48,46,48,102,0,0,0,0,0,0,0,109,95,73,32,62,32,48,46,48,102,0,0,0,0,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,112,111,108,121,103,111,110,0,0,0,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,101,100,103,101,0,0,0,0,0,0,0,0,32,32,106,111,105,110,116,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,74,111,105,110,116,40,38,106,100,41,59,10,0,0,0,0,0,0,32,32,106,100,46,108,101,110,103,116,104,66,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,0,32,32,106,100,46,117,112,112,101,114,84,114,97,110,115,108,97,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,112,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,98,50,74,111,105,110,116,42,42,32,106,111,105,110,116,115,32,61,32,40,98,50,74,111,105,110,116,42,42,41,98,50,65,108,108,111,99,40,37,100,32,42,32,115,105,122,101,111,102,40,98,50,74,111,105,110,116,42,41,41,59,10,0,0,48,32,60,61,32,116,121,112,101,49,32,38,38,32,116,121,112,101,49,32,60,32,98,50,83,104,97,112,101,58,58,101,95,116,121,112,101,67,111,117,110,116,0,0,0,0,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,99,105,114,99,108,101,0,0,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,114,97,100,105,117,115,32,61,32,37,46,49,53,108,101,102,59,10,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,99,104,97,105,110,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,70,105,120,116,117,114,101,46,99,112,112,0,0,0,0,0,0,0,48,32,60,61,32,105,71,32,38,38,32,105,71,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,109,95,116,121,112,101,32,61,61,32,98,50,95,100,121,110,97,109,105,99,66,111,100,121,0,0,0,0,0,0,0,0,73,115,76,111,99,107,101,100,40,41,32,61,61,32,102,97,108,115,101,0,0,0,0,0,116,111,105,73,110,100,101,120,65,32,60,32,109,95,98,111,100,121,67,111,117,110,116,0,109,95,110,111,100,101,67,111,117,110,116,32,61,61,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,32,32,106,100,46,100,97,109,112,105,110,103,82,97,116,105,111,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,32,32,106,100,46,117,112,112,101,114,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,32,32,106,100,46,108,101,110,103,116,104,65,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,0,32,32,106,100,46,108,111,119,101,114,84,114,97,110,115,108,97,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,109,95,112,114,111,120,121,67,111,117,110,116,32,61,61,32,48,0,0,0,0,0,0,0,98,50,66,111,100,121,42,42,32,98,111,100,105,101,115,32,61,32,40,98,50,66,111,100,121,42,42,41,98,50,65,108,108,111,99,40,37,100,32,42,32,115,105,122,101,111,102,40,98,50,66,111,100,121,42,41,41,59,10,0,0,0,0,0,32,32,32,32,98,50,67,105,114,99,108,101,83,104,97,112,101,32,115,104,97,112,101,59,10,0,0,0,0,0,0,0,48,32,60,61,32,105,70,32,38,38,32,105,70,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,102,111,117,110,100,0,0,0,32,32,106,100,46,102,114,101,113,117,101,110,99,121,72,122,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,32,32,106,100,46,108,111,119,101,114,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,32,32,106,100,46,109,97,120,84,111,114,113,117,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,109,95,119,111,114,108,100,45,62,83,101,116,71,114,97,118,105,116,121,40,103,41,59,10,0,0,0,0,0,0,0,0,32,32,32,32,102,100,46,102,105,108,116,101,114,46,103,114,111,117,112,73,110,100,101,120,32,61,32,105,110,116,49,54,40,37,100,41,59,10,0,0,48,32,60,61,32,105,67,32,38,38,32,105,67,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,100,101,110,32,62,32,48,46,48,102,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,67,111,108,108,105,100,101,69,100,103,101,46,99,112,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,102,108,111,97,116,51,50,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,77,101,116,114,105,99,40,41,32,99,111,110,115,116,0,0,0,0,118,111,105,100,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,87,105,116,110,101,115,115,80,111,105,110,116,115,40,98,50,86,101,99,50,32,42,44,32,98,50,86,101,99,50,32,42,41,32,99,111,110,115,116,0,0,0,0,0,0,98,50,86,101,99,50,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,67,108,111,115,101,115,116,80,111,105,110,116,40,41,32,99,111,110,115,116,0,0,0,0,0,0,0,102,108,111,97,116,51,50,32,98,50,83,101,112,97,114,97,116,105,111,110,70,117,110,99,116,105,111,110,58,58,69,118,97,108,117,97,116,101,40,105,110,116,51,50,44,32,105,110,116,51,50,44,32,102,108,111,97,116,51,50,41,32,99,111,110,115,116,0,0,0,0,0,102,108,111,97,116,51,50,32,98,50,83,101,112,97,114,97,116,105,111,110,70,117,110,99,116,105,111,110,58,58,70,105,110,100,77,105,110,83,101,112,97,114,97,116,105,111,110,40,105,110,116,51,50,32,42,44,32,105,110,116,51,50,32,42,44,32,102,108,111,97,116,51,50,41,32,99,111,110,115,116,0,0,0,0,0,0,0,0,99,111,110,115,116,32,98,50,86,101,99,50,32,38,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,58,58,71,101,116,86,101,114,116,101,120,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,118,105,114,116,117,97,108,32,98,111,111,108,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,58,58,82,97,121,67,97,115,116,40,98,50,82,97,121,67,97,115,116,79,117,116,112,117,116,32,42,44,32,99,111,110,115,116,32,98,50,82,97,121,67,97,115,116,73,110,112,117,116,32,38,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,0,0,0,118,105,114,116,117,97,108,32,118,111,105,100,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,58,58,67,111,109,112,117,116,101,77,97,115,115,40,98,50,77,97,115,115,68,97,116,97,32,42,44,32,102,108,111,97,116,51,50,41,32,99,111,110,115,116,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,86,97,108,105,100,97,116,101,40,41,32,99,111,110,115,116,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,82,97,121,67,97,115,116,40,84,32,42,44,32,99,111,110,115,116,32,98,50,82,97,121,67,97,115,116,73,110,112,117,116,32,38,41,32,99,111,110,115,116,32,91,84,32,61,32,98,50,87,111,114,108,100,82,97,121,67,97,115,116,87,114,97,112,112,101,114,93,0,0,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,86,97,108,105,100,97,116,101,83,116,114,117,99,116,117,114,101,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,86,97,108,105,100,97,116,101,77,101,116,114,105,99,115,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,0,0,0,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,71,101,116,77,97,120,66,97,108,97,110,99,101,40,41,32,99,111,110,115,116,0,0,0,0,0,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,67,111,109,112,117,116,101,72,101,105,103,104,116,40,105,110,116,51,50,41,32,99,111,110,115,116,0,118,111,105,100,32,42,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,71,101,116,85,115,101,114,68,97,116,97,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,99,111,110,115,116,32,98,50,65,65,66,66,32,38,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,71,101,116,70,97,116,65,65,66,66,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,118,105,114,116,117,97,108,32,98,111,111,108,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,82,97,121,67,97,115,116,40,98,50,82,97,121,67,97,115,116,79,117,116,112,117,116,32,42,44,32,99,111,110,115,116,32,98,50,82,97,121,67,97,115,116,73,110,112,117,116,32,38,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,71,101,116,67,104,105,108,100,69,100,103,101,40,98,50,69,100,103,101,83,104,97,112,101,32,42,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,0,118,105,114,116,117,97,108,32,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,67,111,109,112,117,116,101,65,65,66,66,40,98,50,65,65,66,66,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,0,0,118,111,105,100,32,98,50,83,105,109,112,108,101,120,58,58,82,101,97,100,67,97,99,104,101,40,99,111,110,115,116,32,98,50,83,105,109,112,108,101,120,67,97,99,104,101,32,42,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,118,111,105,100,32,98,50,70,105,120,116,117,114,101,58,58,68,101,115,116,114,111,121,40,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,0,0,0,0,118,111,105,100,32,98,50,70,105,120,116,117,114,101,58,58,67,114,101,97,116,101,80,114,111,120,105,101,115,40,98,50,66,114,111,97,100,80,104,97,115,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,0,0,0,115,116,97,116,105,99,32,118,111,105,100,32,98,50,67,111,110,116,97,99,116,58,58,68,101,115,116,114,111,121,40,98,50,67,111,110,116,97,99,116,32,42,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,115,116,97,116,105,99,32,98,50,67,111,110,116,97,99,116,32,42,98,50,67,111,110,116,97,99,116,58,58,67,114,101,97,116,101,40,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,83,111,108,118,101,84,79,73,40,99,111,110,115,116,32,98,50,84,105,109,101,83,116,101,112,32,38,44,32,105,110,116,51,50,44,32,105,110,116,51,50,41,0,0,0,0,0,0,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,65,100,100,40,98,50,67,111,110,116,97,99,116,32,42,41,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,65,100,100,40,98,50,74,111,105,110,116,32,42,41,0,0,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,65,100,100,40,98,50,66,111,100,121,32,42,41,0,0,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,68,114,97,119,83,104,97,112,101,40,98,50,70,105,120,116,117,114,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,67,111,108,111,114,32,38,41,0,0,0,0,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,83,111,108,118,101,84,79,73,40,99,111,110,115,116,32,98,50,84,105,109,101,83,116,101,112,32,38,41,0,0,0,0,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,83,111,108,118,101,40,99,111,110,115,116,32,98,50,84,105,109,101,83,116,101,112,32,38,41,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,68,101,115,116,114,111,121,74,111,105,110,116,40,98,50,74,111,105,110,116,32,42,41,0,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,68,101,115,116,114,111,121,66,111,100,121,40,98,50,66,111,100,121,32,42,41,0,0,0,0,0,98,50,74,111,105,110,116,32,42,98,50,87,111,114,108,100,58,58,67,114,101,97,116,101,74,111,105,110,116,40,99,111,110,115,116,32,98,50,74,111,105,110,116,68,101,102,32,42,41,0,0,0,0,0,0,0,98,50,66,111,100,121,32,42,98,50,87,111,114,108,100,58,58,67,114,101,97,116,101,66,111,100,121,40,99,111,110,115,116,32,98,50,66,111,100,121,68,101,102,32,42,41,0,0,118,111,105,100,32,98,50,83,119,101,101,112,58,58,65,100,118,97,110,99,101,40,102,108,111,97,116,51,50,41,0,0,98,50,74,111,105,110,116,58,58,98,50,74,111,105,110,116,40,99,111,110,115,116,32,98,50,74,111,105,110,116,68,101,102,32,42,41,0,0,0,0,115,116,97,116,105,99,32,118,111,105,100,32,98,50,74,111,105,110,116,58,58,68,101,115,116,114,111,121,40,98,50,74,111,105,110,116,32,42,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,0,0,0,0,115,116,97,116,105,99,32,98,50,74,111,105,110,116,32,42,98,50,74,111,105,110,116,58,58,67,114,101,97,116,101,40,99,111,110,115,116,32,98,50,74,111,105,110,116,68,101,102,32,42,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,98,50,66,111,100,121,58,58,98,50,66,111,100,121,40,99,111,110,115,116,32,98,50,66,111,100,121,68,101,102,32,42,44,32,98,50,87,111,114,108,100,32,42,41,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,65,99,116,105,118,101,40,98,111,111,108,41,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,84,121,112,101,40,98,50,66,111,100,121,84,121,112,101,41,0,0,0,0,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,68,101,115,116,114,111,121,70,105,120,116,117,114,101,40,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,82,101,115,101,116,77,97,115,115,68,97,116,97,40,41,0,0,0,0,98,50,70,105,120,116,117,114,101,32,42,98,50,66,111,100,121,58,58,67,114,101,97,116,101,70,105,120,116,117,114,101,40,99,111,110,115,116,32,98,50,70,105,120,116,117,114,101,68,101,102,32,42,41,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,84,114,97,110,115,102,111,114,109,40,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,102,108,111,97,116,51,50,41,0,0,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,77,97,115,115,68,97,116,97,40,99,111,110,115,116,32,98,50,77,97,115,115,68,97,116,97,32,42,41,0,0,0,0,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,118,111,105,100,32,98,50,80,111,115,105,116,105,111,110,83,111,108,118,101,114,77,97,110,105,102,111,108,100,58,58,73,110,105,116,105,97,108,105,122,101,40,98,50,67,111,110,116,97,99,116,80,111,115,105,116,105,111,110,67,111,110,115,116,114,97,105,110,116,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,0,0,0,0,0,0,0,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,58,58,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,41,0,0,0,0,0,0,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,58,58,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,0,0,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,41,0,0,0,0,0,0,0,0,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,0,0,0,0,102,108,111,97,116,51,50,32,98,50,83,101,112,97,114,97,116,105,111,110,70,117,110,99,116,105,111,110,58,58,73,110,105,116,105,97,108,105,122,101,40,99,111,110,115,116,32,98,50,83,105,109,112,108,101,120,67,97,99,104,101,32,42,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,83,119,101,101,112,32,38,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,83,119,101,101,112,32,38,44,32,102,108,111,97,116,51,50,41,0,0,0,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,58,58,126,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,40,41,0,0,0,118,111,105,100,32,42,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,58,58,65,108,108,111,99,97,116,101,40,105,110,116,51,50,41,0,118,111,105,100,32,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,58,58,70,114,101,101,40,118,111,105,100,32,42,41,0,0,0,0,0,118,111,105,100,32,98,50,80,117,108,108,101,121,74,111,105,110,116,68,101,102,58,58,73,110,105,116,105,97,108,105,122,101,40,98,50,66,111,100,121,32,42,44,32,98,50,66,111,100,121,32,42,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,102,108,111,97,116,51,50,41,0,0,118,111,105,100,32,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,58,58,83,101,116,76,105,109,105,116,115,40,102,108,111,97,116,51,50,44,32,102,108,111,97,116,51,50,41,0,0,0,0,0,0,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,58,58,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,58,58,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,40,41,0,0,0,0,118,111,105,100,32,42,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,58,58,65,108,108,111,99,97,116,101,40,105,110,116,51,50,41,0,118,111,105,100,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,58,58,70,114,101,101,40,118,111,105,100,32,42,44,32,105,110,116,51,50,41,0,0,0,0,0,0,118,111,105,100,32,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,58,58,83,101,116,76,105,109,105,116,115,40,102,108,111,97,116,51,50,44,32,102,108,111,97,116,51,50,41,0,0,0,0,0,0,0,118,111,105,100,32,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,58,58,83,101,116,77,97,120,84,111,114,113,117,101,40,102,108,111,97,116,51,50,41,0,0,0,0,0,118,111,105,100,32,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,58,58,83,101,116,77,97,120,70,111,114,99,101,40,102,108,111,97,116,51,50,41,0,0,0,0,0,0,118,111,105,100,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,58,58,83,101,116,40,99,111,110,115,116,32,98,50,83,104,97,112,101,32,42,44,32,105,110,116,51,50,41,0,0,0,0,0,0,0,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,58,58,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,40,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,68,101,102,32,42,41,0,0,118,111,105,100,32,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,58,58,73,110,105,116,105,97,108,105,122,101,86,101,108,111,99,105,116,121,67,111,110,115,116,114,97,105,110,116,115,40,41,0,0,0,118,111,105,100,32,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,58,58,83,111,108,118,101,86,101,108,111,99,105,116,121,67,111,110,115,116,114,97,105,110,116,115,40,41,0,0,0,0,0,0,0,0,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,0,0,118,111,105,100,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,58,58,83,101,116,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,98,50,80,117,108,108,101,121,74,111,105,110,116,58,58,98,50,80,117,108,108,101,121,74,111,105,110,116,40,99,111,110,115,116,32,98,50,80,117,108,108,101,121,74,111,105,110,116,68,101,102,32,42,41,0,0,98,111,111,108,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,77,111,118,101,80,114,111,120,121,40,105,110,116,51,50,44,32,99,111,110,115,116,32,98,50,65,65,66,66,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,41,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,70,114,101,101,78,111,100,101,40,105,110,116,51,50,41,0,0,0,0,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,66,97,108,97,110,99,101,40,105,110,116,51,50,41,0,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,68,101,115,116,114,111,121,80,114,111,120,121,40,105,110,116,51,50,41,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,65,108,108,111,99,97,116,101,78,111,100,101,40,41,0,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,73,110,115,101,114,116,76,101,97,102,40,105,110,116,51,50,41,0,0,0,98,50,77,111,117,115,101,74,111,105,110,116,58,58,98,50,77,111,117,115,101,74,111,105,110,116,40,99,111,110,115,116,32,98,50,77,111,117,115,101,74,111,105,110,116,68,101,102,32,42,41,0,0,0,0,0,118,105,114,116,117,97,108,32,118,111,105,100,32,98,50,77,111,117,115,101,74,111,105,110,116,58,58,73,110,105,116,86,101,108,111,99,105,116,121,67,111,110,115,116,114,97,105,110,116,115,40,99,111,110,115,116,32,98,50,83,111,108,118,101,114,68,97,116,97,32,38,41,0,0,0,0,0,0,0,0,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,67,114,101,97,116,101,67,104,97,105,110,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,0,0,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,67,114,101,97,116,101,76,111,111,112,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,0,0,0,98,50,71,101,97,114,74,111,105,110,116,58,58,98,50,71,101,97,114,74,111,105,110,116,40,99,111,110,115,116,32,98,50,71,101,97,114,74,111,105,110,116,68,101,102,32,42,41,0,0,0,0,0,0,0,0,118,111,105,100,32,98,50,71,101,97,114,74,111,105,110,116,58,58,83,101,116,82,97,116,105,111,40,102,108,111,97,116,51,50,41,0,0,0,0,0,118,111,105,100,32,98,50,70,105,110,100,73,110,99,105,100,101,110,116,69,100,103,101,40,98,50,67,108,105,112,86,101,114,116,101,120,32,42,44,32,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,44,32,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,0,0,0,0,0,102,108,111,97,116,51,50,32,98,50,69,100,103,101,83,101,112,97,114,97,116,105,111,110,40,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,44,32,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,0,0,0,0,98,50,86,101,99,50,32,67,111,109,112,117,116,101,67,101,110,116,114,111,105,100,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,0,0,118,111,105,100,32,98,50,67,111,108,108,105,100,101,69,100,103,101,65,110,100,67,105,114,99,108,101,40,98,50,77,97,110,105,102,111,108,100,32,42,44,32,99,111,110,115,116,32,98,50,69,100,103,101,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,67,105,114,99,108,101,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,118,111,105,100,32,98,50,84,105,109,101,79,102,73,109,112,97,99,116,40,98,50,84,79,73,79,117,116,112,117,116,32,42,44,32,99,111,110,115,116,32,98,50,84,79,73,73,110,112,117,116,32,42,41,0,0,118,111,105,100,32,98,50,68,105,115,116,97,110,99,101,40,98,50,68,105,115,116,97,110,99,101,79,117,116,112,117,116,32,42,44,32,98,50,83,105,109,112,108,101,120,67,97,99,104,101,32,42,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,73,110,112,117,116,32,42,41,0,0,0,0,0,0,136,83,0,0,78,0,0,0,4,1,0,0,150,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,83,0,0,42,0,0,0,62,0,0,0,184,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,83,0,0,42,0,0,0,42,0,0,0,42,0,0,0,42,0,0,0,20,1,0,0,210,0,0,0,48,0,0,0,42,0,0,0,42,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,83,0,0,168,0,0,0,254,0,0,0,56,0,0,0,82,0,0,0,44,0,0,0,42,0,0,0,86,0,0,0,148,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,83,0,0,58,0,0,0,74,0,0,0,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,83,0,0,70,0,0,0,40,1,0,0,134,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,84,0,0,62,0,0,0,190,0,0,0,174,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,84,0,0,54,0,0,0,236,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,84,0,0,80,0,0,0,70,1,0,0,228,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,84,0,0,90,1,0,0,66,0,0,0,58,1,0,0,150,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,84,0,0,52,1,0,0,102,0,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,84,0,0,182,0,0,0,152,0,0,0,144,1,0,0,38,1,0,0,48,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,84,0,0,82,0,0,0,222,0,0,0,68,0,0,0,78,0,0,0,76,0,0,0,136,0,0,0,166,0,0,0,48,0,0,0,4,1,0,0,88,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,84,0,0,90,0,0,0,46,1,0,0,94,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,84,0,0,112,1,0,0,0,1,0,0,54,0,0,0,66,0,0,0,68,0,0,0,54,0,0,0,88,1,0,0,114,1,0,0,164,1,0,0,168,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,84,0,0,120,0,0,0,230,0,0,0,174,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,84,0,0,106,1,0,0,216,0,0,0,72,0,0,0,84,0,0,0,104,0,0,0,44,1,0,0,160,0,0,0,130,0,0,0,108,1,0,0,152,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,84,0,0,206,1,0,0,120,1,0,0,78,0,0,0,88,0,0,0,50,1,0,0,82,1,0,0,58,0,0,0,84,0,0,0,198,1,0,0,190,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,84,0,0,110,0,0,0,250,0,0,0,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,84,0,0,88,0,0,0,234,0,0,0,252,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,84,0,0,180,0,0,0,220,0,0,0,104,0,0,0,100,1,0,0,64,0,0,0,42,0,0,0,84,0,0,0,74,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,84,0,0,192,0,0,0,144,0,0,0,80,0,0,0,80,0,0,0,98,0,0,0,96,0,0,0,6,1,0,0,80,0,0,0,180,1,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,84,0,0,140,0,0,0,114,0,0,0,82,0,0,0,70,2,0,0,54,0,0,0,66,0,0,0,42,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,84,0,0,212,1,0,0,156,0,0,0,52,0,0,0,48,0,0,0,64,1,0,0,42,0,0,0,194,0,0,0,200,0,0,0,132,1,0,0,148,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,85,0,0,126,0,0,0,80,1,0,0,56,0,0,0,50,0,0,0,36,1,0,0,76,1,0,0,92,1,0,0,8,1,0,0,124,1,0,0,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,85,0,0,108,0,0,0,8,1,0,0,162,0,0,0,76,1,0,0,68,0,0,0,50,0,0,0,52,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,85,0,0,224,0,0,0,184,1,0,0,76,0,0,0,58,0,0,0,48,1,0,0,128,0,0,0,158,0,0,0,184,0,0,0,66,1,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,85,0,0,170,0,0,0,88,0,0,0,60,0,0,0,62,0,0,0,84,1,0,0,30,1,0,0,238,0,0,0,114,0,0,0,162,0,0,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,85,0,0,194,0,0,0,12,1,0,0,46,0,0,0,52,0,0,0,208,0,0,0,56,1,0,0,64,0,0,0,54,1,0,0])
.concat([26,1,0,0,140,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,85,0,0,80,0,0,0,56,0,0,0,142,0,0,0,68,2,0,0,66,0,0,0,68,0,0,0,44,0,0,0,82,0,0,0,0,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,57,98,50,67,111,110,116,97,99,116,0,0,0,0,0,0,55,98,50,83,104,97,112,101,0,0,0,0,0,0,0,0,55,98,50,74,111,105,110,116,0,0,0,0,0,0,0,0,54,98,50,68,114,97,119,0,50,53,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,0,0,50,52,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,0,0,0,0,50,51,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,0,0,0,0,0,50,51,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,0,0,0,0,50,50,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,0,0,0,0,0,50,49,98,50,68,101,115,116,114,117,99,116,105,111,110,76,105,115,116,101,110,101,114,0,49,55,98,50,82,97,121,67,97,115,116,67,97,108,108,98,97,99,107,0,0,0,0,0,49,55,98,50,67,111,110,116,97,99,116,76,105,115,116,101,110,101,114,0,0,0,0,0,49,54,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,0,0,0,0,0,0,49,54,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,0,0,0,0,49,53,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,0,0,0,0,0,0,0,49,53,98,50,81,117,101,114,121,67,97,108,108,98,97,99,107,0,0,0,0,0,0,0,49,53,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,0,0,0,0,0,0,0,49,53,98,50,68,105,115,116,97,110,99,101,74,111,105,110,116,0,0,0,0,0,0,0,49,53,98,50,67,111,110,116,97,99,116,70,105,108,116,101,114,0,0,0,0,0,0,0,49,53,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,0,0,0,0,49,52,98,50,80,111,108,121,103,111,110,83,104,97,112,101,0,0,0,0,0,0,0,0,49,51,98,50,80,117,108,108,101,121,74,111,105,110,116,0,49,51,98,50,67,105,114,99,108,101,83,104,97,112,101,0,49,50,98,50,87,104,101,101,108,74,111,105,110,116,0,0,49,50,98,50,77,111,117,115,101,74,111,105,110,116,0,0,49,50,98,50,67,104,97,105,110,83,104,97,112,101,0,0,49,49,98,50,87,101,108,100,74,111,105,110,116,0,0,0,49,49,98,50,82,111,112,101,74,111,105,110,116,0,0,0,49,49,98,50,71,101,97,114,74,111,105,110,116,0,0,0,49,49,98,50,69,100,103,101,83,104,97,112,101,0,0,0,0,0,0,0,72,80,0,0,0,0,0,0,88,80,0,0,0,0,0,0,104,80,0,0,128,83,0,0,0,0,0,0,0,0,0,0,120,80,0,0,168,83,0,0,0,0,0,0,0,0,0,0,160,80,0,0,184,83,0,0,0,0,0,0,0,0,0,0,200,80,0,0,120,83,0,0,0,0,0,0,0,0,0,0,240,80,0,0,0,0,0,0,0,81,0,0,0,0,0,0,16,81,0,0,0,0,0,0,32,81,0,0,0,0,0,0,40,81,0,0,200,83,0,0,0,0,0,0,0,0,0,0,72,81,0,0,200,83,0,0,0,0,0,0,0,0,0,0,104,81,0,0,200,83,0,0,0,0,0,0,0,0,0,0,136,81,0,0,200,83,0,0,0,0,0,0,0,0,0,0,168,81,0,0,200,83,0,0,0,0,0,0,0,0,0,0,200,81,0,0,0,0,0,0,224,81,0,0,0,0,0,0,248,81,0,0,0,0,0,0,16,82,0,0,216,83,0,0,0,0,0,0,0,0,0,0,40,82,0,0,200,83,0,0,0,0,0,0,0,0,0,0,64,82,0,0,216,83,0,0,0,0,0,0,0,0,0,0,88,82,0,0,0,0,0,0,112,82,0,0,216,83,0,0,0,0,0,0,0,0,0,0,136,82,0,0,216,83,0,0,0,0,0,0,0,0,0,0,160,82,0,0,0,0,0,0,184,82,0,0,200,83,0,0,0,0,0,0,0,0,0,0,208,82,0,0,208,83,0,0,0,0,0,0,0,0,0,0,232,82,0,0,216,83,0,0,0,0,0,0,0,0,0,0,248,82,0,0,208,83,0,0,0,0,0,0,0,0,0,0,8,83,0,0,216,83,0,0,0,0,0,0,0,0,0,0,24,83,0,0,216,83,0,0,0,0,0,0,0,0,0,0,40,83,0,0,208,83,0,0,0,0,0,0,0,0,0,0,56,83,0,0,216,83,0,0,0,0,0,0,0,0,0,0,72,83,0,0,216,83,0,0,0,0,0,0,0,0,0,0,88,83,0,0,216,83,0,0,0,0,0,0,0,0,0,0,104,83,0,0,208,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,32,0,0,0,64,0,0,0,96,0,0,0,128,0,0,0,160,0,0,0,192,0,0,0,224,0,0,0,0,1,0,0,64,1,0,0,128,1,0,0,192,1,0,0,0,2,0,0,128,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(8))>>2)]=(288);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(12))>>2)]=(224);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(16))>>2)]=(130);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(20))>>2)]=(290);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(24))>>2)]=(52);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(28))>>2)]=(42);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(32))>>2)]=(46);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(36))>>2)]=(60);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(8))>>2)]=(288);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(12))>>2)]=(336);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(16))>>2)]=(130);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(20))>>2)]=(290);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(24))>>2)]=(52);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(28))>>2)]=(44);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(32))>>2)]=(48);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(36))>>2)]=(74);
HEAP32[((21368)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21376)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21384)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21400)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21416)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21432)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21448)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21456)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21464)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21472)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21480)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21496)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21512)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21528)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21544)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21560)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21568)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21576)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21584)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21600)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21616)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21632)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21640)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21656)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21672)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21680)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21696)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21712)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21728)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21744)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21760)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21776)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21792)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21808)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21824)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21840)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
}
if (!awaitingMemoryInitializer) runPostSets();
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  function ___gxx_personality_v0() {
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      function ExitStatus() {
        this.name = "ExitStatus";
        this.message = "Program terminated with exit(" + status + ")";
        this.status = status;
        Module.print('Exit Status: ' + status);
      };
      ExitStatus.prototype = new Error();
      ExitStatus.prototype.constructor = ExitStatus;
      exitRuntime();
      ABORT = true;
      throw new ExitStatus();
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  var _sqrtf=Math.sqrt;
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  var _sinf=Math.sin;
  var _cosf=Math.cos;
  var _floorf=Math.floor;
  function ___cxa_pure_virtual() {
      ABORT = true;
      throw 'Pure virtual function called!';
    }
  var _llvm_va_start=undefined;
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,createFileHandle:function (stream, fd) {
        if (typeof stream === 'undefined') {
          stream = null;
        }
        if (!fd) {
          if (stream && stream.socket) {
            for (var i = 1; i < 64; i++) {
              if (!FS.streams[i]) {
                fd = i;
                break;
              }
            }
            assert(fd, 'ran out of low fds for sockets');
          } else {
            fd = Math.max(FS.streams.length, 64);
            for (var i = FS.streams.length; i < fd; i++) {
              FS.streams[i] = null; // Keep dense
            }
          }
        }
        // Close WebSocket first if we are about to replace the fd (i.e. dup2)
        if (FS.streams[fd] && FS.streams[fd].socket && FS.streams[fd].socket.close) {
          FS.streams[fd].socket.close();
        }
        FS.streams[fd] = stream;
        return fd;
      },removeFileHandle:function (fd) {
        FS.streams[fd] = null;
      },joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureRoot();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === 10) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        FS.createDevice(devFolder, 'tty', input, output);
        FS.createDevice(devFolder, 'null', function(){}, function(){});
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          isTerminal: !stdinOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stdoutOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stderrOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        // TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_NORMAL) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  function _send(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      info.sender(HEAPU8.subarray(buf, buf+len));
      return len;
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
          return _send(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  Module["_strlen"] = _strlen;
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }function _vprintf(format, va_arg) {
      return _printf(format, HEAP32[((va_arg)>>2)]);
    }
  function _llvm_va_end() {}
  var _atan2f=Math.atan2;
  function __ZNK12b2WheelJoint13GetDefinitionEP15b2WheelJointDef() {
  Module['printErr']('missing function: _ZNK12b2WheelJoint13GetDefinitionEP15b2WheelJointDef'); abort(-1);
  }
  var _llvm_memset_p0i8_i64=_memset;
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
  function _llvm_eh_exception() {
      return HEAP32[((_llvm_eh_exception.buf)>>2)];
    }
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  function ___resumeException(ptr) {
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr;
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = HEAP32[((_llvm_eh_exception.buf)>>2)];
      if (throwntype == -1) throwntype = HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return ((asm["setTempRet0"](typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm["setTempRet0"](throwntype),thrown)|0);
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=type
      HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=destructor
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (Browser.initted) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(name.lastIndexOf('.')+1)];
        }
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/.exec(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      }};
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vif(index,a1,a2) {
  try {
    Module["dynCall_vif"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viifii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viifii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viifi(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viifi"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_if(index,a1) {
  try {
    return Module["dynCall_if"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viffif(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viffif"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_fif(index,a1,a2) {
  try {
    return Module["dynCall_fif"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viff(index,a1,a2,a3) {
  try {
    Module["dynCall_viff"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiiiif(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiiiiif"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vifff(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_vifff"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiif(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiif"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iif(index,a1,a2) {
  try {
    return Module["dynCall_iif"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vifii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_vifii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_fi(index,a1) {
  try {
    return Module["dynCall_fi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_fiiiif(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_fiiiif"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_i(index) {
  try {
    return Module["dynCall_i"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_ifff(index,a1,a2,a3) {
  try {
    return Module["dynCall_ifff"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iff(index,a1,a2) {
  try {
    return Module["dynCall_iff"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viif(index,a1,a2,a3) {
  try {
    Module["dynCall_viif"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var n=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var o=+env.NaN;var p=+env.Infinity;var q=0;var r=0;var s=0;var t=0;var u=0,v=0,w=0,x=0,y=0.0,z=0,A=0,B=0,C=0.0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=global.Math.floor;var O=global.Math.abs;var P=global.Math.sqrt;var Q=global.Math.pow;var R=global.Math.cos;var S=global.Math.sin;var T=global.Math.tan;var U=global.Math.acos;var V=global.Math.asin;var W=global.Math.atan;var X=global.Math.atan2;var Y=global.Math.exp;var Z=global.Math.log;var _=global.Math.ceil;var $=global.Math.imul;var aa=env.abort;var ab=env.assert;var ac=env.asmPrintInt;var ad=env.asmPrintFloat;var ae=env.copyTempDouble;var af=env.copyTempFloat;var ag=env.min;var ah=env.jsCall;var ai=env.invoke_viiiii;var aj=env.invoke_vif;var ak=env.invoke_viifii;var al=env.invoke_vi;var am=env.invoke_vii;var an=env.invoke_ii;var ao=env.invoke_viifi;var ap=env.invoke_if;var aq=env.invoke_iiiii;var ar=env.invoke_viffif;var as=env.invoke_iiii;var at=env.invoke_fif;var au=env.invoke_viff;var av=env.invoke_viiiiiiif;var aw=env.invoke_vifff;var ax=env.invoke_viiiiii;var ay=env.invoke_iiif;var az=env.invoke_iif;var aA=env.invoke_vifii;var aB=env.invoke_fi;var aC=env.invoke_iii;var aD=env.invoke_fiiiif;var aE=env.invoke_i;var aF=env.invoke_iiiiii;var aG=env.invoke_ifff;var aH=env.invoke_iff;var aI=env.invoke_viii;var aJ=env.invoke_v;var aK=env.invoke_viif;var aL=env.invoke_viiii;var aM=env._llvm_va_end;var aN=env._cosf;var aO=env._floorf;var aP=env.___cxa_throw;var aQ=env._abort;var aR=env._fprintf;var aS=env._llvm_eh_exception;var aT=env._printf;var aU=env._sqrtf;var aV=env.__ZNK12b2WheelJoint13GetDefinitionEP15b2WheelJointDef;var aW=env.___setErrNo;var aX=env._fwrite;var aY=env._send;var aZ=env._write;var a_=env._exit;var a$=env._llvm_lifetime_end;var a0=env.___cxa_find_matching_catch;var a1=env._atan2f;var a2=env._sysconf;var a3=env.___cxa_pure_virtual;var a4=env._vprintf;var a5=env.___cxa_is_number_type;var a6=env.__reallyNegative;var a7=env.___resumeException;var a8=env.__formatString;var a9=env.___cxa_does_inherit;var ba=env.__ZSt9terminatev;var bb=env._sinf;var bc=env.___assert_func;var bd=env.__ZSt18uncaught_exceptionv;var be=env._pwrite;var bf=env.___cxa_call_unexpected;var bg=env._sbrk;var bh=env.___cxa_allocate_exception;var bi=env.___errno_location;var bj=env.___gxx_personality_v0;var bk=env._llvm_lifetime_start;var bl=env._time;var bm=env.__exit;
// EMSCRIPTEN_START_FUNCS
function bR(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function bS(){return i|0}function bT(a){a=a|0;i=a}function bU(a,b){a=a|0;b=b|0;if((q|0)==0){q=a;r=b}}function bV(a){a=a|0;D=a}function bW(a){a=a|0;E=a}function bX(a){a=a|0;F=a}function bY(a){a=a|0;G=a}function bZ(a){a=a|0;H=a}function b_(a){a=a|0;I=a}function b$(a){a=a|0;J=a}function b0(a){a=a|0;K=a}function b1(a){a=a|0;L=a}function b2(a){a=a|0;M=a}function b3(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;c[a>>2]=-1;b=a+12|0;c[b>>2]=16;c[a+8>>2]=0;d=vh(576)|0;e=a+4|0;c[e>>2]=d;vq(d|0,0,(c[b>>2]|0)*36&-1|0);d=(c[b>>2]|0)-1|0;if((d|0)>0){f=0;while(1){g=f+1|0;c[(c[e>>2]|0)+(f*36&-1)+20>>2]=g;c[(c[e>>2]|0)+(f*36&-1)+32>>2]=-1;h=(c[b>>2]|0)-1|0;if((g|0)<(h|0)){f=g}else{i=h;break}}}else{i=d}c[(c[e>>2]|0)+(i*36&-1)+20>>2]=-1;c[(c[e>>2]|0)+(((c[b>>2]|0)-1|0)*36&-1)+32>>2]=-1;vq(a+16|0,0,16);c[a+48>>2]=16;c[a+52>>2]=0;c[a+44>>2]=vh(192)|0;c[a+36>>2]=16;c[a+40>>2]=0;c[a+32>>2]=vh(64)|0;return}function b4(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0.0,k=0,l=0,m=0,n=0,o=0;e=a|0;f=cj(e)|0;h=a+4|0;i=(c[h>>2]|0)+(f*36&-1)|0;j=+(+g[b+4>>2]+-.10000000149011612);g[i>>2]=+g[b>>2]+-.10000000149011612;g[i+4>>2]=j;i=(c[h>>2]|0)+(f*36&-1)+8|0;j=+(+g[b+12>>2]+.10000000149011612);g[i>>2]=+g[b+8>>2]+.10000000149011612;g[i+4>>2]=j;c[(c[h>>2]|0)+(f*36&-1)+16>>2]=d;c[(c[h>>2]|0)+(f*36&-1)+32>>2]=0;ck(e,f);e=a+28|0;c[e>>2]=(c[e>>2]|0)+1;e=a+40|0;h=c[e>>2]|0;d=a+36|0;i=a+32|0;if((h|0)!=(c[d>>2]|0)){k=h;l=c[i>>2]|0;m=l+(k<<2)|0;c[m>>2]=f;n=c[e>>2]|0;o=n+1|0;c[e>>2]=o;return f|0}a=c[i>>2]|0;c[d>>2]=h<<1;d=vh(h<<3)|0;c[i>>2]=d;h=a;vp(d|0,h|0,c[e>>2]<<2);vi(h);k=c[e>>2]|0;l=c[i>>2]|0;m=l+(k<<2)|0;c[m>>2]=f;n=c[e>>2]|0;o=n+1|0;c[e>>2]=o;return f|0}function b5(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0,s=0.0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0;h=a+60|0;c[h>>2]=0;i=e+12|0;j=+g[f+12>>2];l=+g[i>>2];m=+g[f+8>>2];n=+g[e+16>>2];o=+g[f>>2]+(j*l-m*n)- +g[d>>2];p=l*m+j*n+ +g[f+4>>2]- +g[d+4>>2];n=+g[d+12>>2];j=+g[d+8>>2];m=o*n+p*j;l=n*p+o*(-0.0-j);j=+g[b+8>>2]+ +g[e+8>>2];e=c[b+148>>2]|0;do{if((e|0)>0){d=0;o=-3.4028234663852886e+38;f=0;while(1){p=(m- +g[b+20+(d<<3)>>2])*+g[b+84+(d<<3)>>2]+(l- +g[b+20+(d<<3)+4>>2])*+g[b+84+(d<<3)+4>>2];if(p>j){q=28;break}r=p>o;s=r?p:o;t=r?d:f;r=d+1|0;if((r|0)<(e|0)){d=r;o=s;f=t}else{q=12;break}}if((q|0)==12){u=s<1.1920928955078125e-7;v=t;break}else if((q|0)==28){return}}else{u=1;v=0}}while(0);q=v+1|0;t=b+20+(v<<3)|0;f=c[t>>2]|0;d=c[t+4>>2]|0;s=(c[k>>2]=f,+g[k>>2]);t=d;o=(c[k>>2]=t,+g[k>>2]);r=b+20+(((q|0)<(e|0)?q:0)<<3)|0;q=c[r>>2]|0;e=c[r+4>>2]|0;p=(c[k>>2]=q,+g[k>>2]);r=e;n=(c[k>>2]=r,+g[k>>2]);if(u){c[h>>2]=1;c[a+56>>2]=1;u=b+84+(v<<3)|0;w=a+40|0;x=c[u+4>>2]|0;c[w>>2]=c[u>>2];c[w+4>>2]=x;x=a+48|0;y=+((o+n)*.5);g[x>>2]=(s+p)*.5;g[x+4>>2]=y;x=i;w=a;u=c[x+4>>2]|0;c[w>>2]=c[x>>2];c[w+4>>2]=u;c[a+16>>2]=0;return}y=m-s;z=l-o;A=m-p;B=l-n;if(y*(p-s)+z*(n-o)<=0.0){if(y*y+z*z>j*j){return}c[h>>2]=1;c[a+56>>2]=1;u=a+40|0;w=u;C=+z;g[w>>2]=y;g[w+4>>2]=C;C=+P(+(y*y+z*z));if(C>=1.1920928955078125e-7){D=1.0/C;g[u>>2]=y*D;g[a+44>>2]=z*D}u=a+48|0;c[u>>2]=f&-1;c[u+4>>2]=t|d&0;d=i;t=a;u=c[d+4>>2]|0;c[t>>2]=c[d>>2];c[t+4>>2]=u;c[a+16>>2]=0;return}if(A*(s-p)+B*(o-n)>0.0){D=(s+p)*.5;p=(o+n)*.5;u=b+84+(v<<3)|0;if((m-D)*+g[u>>2]+(l-p)*+g[b+84+(v<<3)+4>>2]>j){return}c[h>>2]=1;c[a+56>>2]=1;v=u;u=a+40|0;b=c[v+4>>2]|0;c[u>>2]=c[v>>2];c[u+4>>2]=b;b=a+48|0;l=+p;g[b>>2]=D;g[b+4>>2]=l;b=i;u=a;v=c[b+4>>2]|0;c[u>>2]=c[b>>2];c[u+4>>2]=v;c[a+16>>2]=0;return}if(A*A+B*B>j*j){return}c[h>>2]=1;c[a+56>>2]=1;h=a+40|0;v=h;j=+B;g[v>>2]=A;g[v+4>>2]=j;j=+P(+(A*A+B*B));if(j>=1.1920928955078125e-7){l=1.0/j;g[h>>2]=A*l;g[a+44>>2]=B*l}h=a+48|0;c[h>>2]=q&-1;c[h+4>>2]=r|e&0;e=i;i=a;r=c[e+4>>2]|0;c[i>>2]=c[e>>2];c[i+4>>2]=r;c[a+16>>2]=0;return}function b6(b,d,e,f,h){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;var i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0;i=b+60|0;c[i>>2]=0;j=f+12|0;l=+g[h+12>>2];m=+g[j>>2];n=+g[h+8>>2];o=+g[f+16>>2];p=+g[h>>2]+(l*m-n*o)- +g[e>>2];q=m*n+l*o+ +g[h+4>>2]- +g[e+4>>2];o=+g[e+12>>2];l=+g[e+8>>2];n=p*o+q*l;m=o*q+p*(-0.0-l);e=d+12|0;h=c[e>>2]|0;r=c[e+4>>2]|0;l=(c[k>>2]=h,+g[k>>2]);e=r;p=(c[k>>2]=e,+g[k>>2]);s=d+20|0;t=c[s>>2]|0;u=c[s+4>>2]|0;q=(c[k>>2]=t,+g[k>>2]);s=u;o=(c[k>>2]=s,+g[k>>2]);v=q-l;w=o-p;x=v*(q-n)+w*(o-m);y=n-l;z=m-p;A=y*v+z*w;B=+g[d+8>>2]+ +g[f+8>>2];if(A<=0.0){if(y*y+z*z>B*B){return}do{if((a[d+44|0]&1)!=0){f=d+28|0;if((l-n)*(l- +g[f>>2])+(p-m)*(p- +g[f+4>>2])<=0.0){break}return}}while(0);c[i>>2]=1;c[b+56>>2]=0;g[b+40>>2]=0.0;g[b+44>>2]=0.0;f=b+48|0;c[f>>2]=h&-1;c[f+4>>2]=e|r&0;f=b+16|0;c[f>>2]=0;C=f;a[f]=0;a[C+1|0]=0;a[C+2|0]=0;a[C+3|0]=0;C=j;f=b;D=c[C+4>>2]|0;c[f>>2]=c[C>>2];c[f+4>>2]=D;return}if(x<=0.0){E=n-q;F=m-o;if(E*E+F*F>B*B){return}do{if((a[d+45|0]&1)!=0){D=d+36|0;if(E*(+g[D>>2]-q)+F*(+g[D+4>>2]-o)<=0.0){break}return}}while(0);c[i>>2]=1;c[b+56>>2]=0;g[b+40>>2]=0.0;g[b+44>>2]=0.0;d=b+48|0;c[d>>2]=t&-1;c[d+4>>2]=s|u&0;u=b+16|0;c[u>>2]=0;s=u;a[u]=1;a[s+1|0]=0;a[s+2|0]=0;a[s+3|0]=0;s=j;u=b;d=c[s+4>>2]|0;c[u>>2]=c[s>>2];c[u+4>>2]=d;return}F=v*v+w*w;if(F<=0.0){bc(12984,127,18976,12968)}E=1.0/F;F=n-(l*x+q*A)*E;q=m-(p*x+o*A)*E;if(F*F+q*q>B*B){return}B=-0.0-w;if(v*z+y*B<0.0){G=w;H=-0.0-v}else{G=B;H=v}v=+P(+(H*H+G*G));if(v<1.1920928955078125e-7){I=G;J=H}else{B=1.0/v;I=G*B;J=H*B}c[i>>2]=1;c[b+56>>2]=1;i=b+40|0;B=+J;g[i>>2]=I;g[i+4>>2]=B;i=b+48|0;c[i>>2]=h&-1;c[i+4>>2]=e|r&0;r=b+16|0;c[r>>2]=0;e=r;a[r]=0;a[e+1|0]=0;a[e+2|0]=1;a[e+3|0]=0;e=j;j=b;b=c[e+4>>2]|0;c[j>>2]=c[e>>2];c[j+4>>2]=b;return}function b7(b,d,e,f,h,j){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,Q=0,R=0,S=0,T=0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0,ac=0.0,ad=0.0,ae=0,af=0.0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0.0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0.0,aG=0.0,aH=0.0,aI=0.0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0.0,aV=0,aW=0,aX=0.0;l=i;i=i+40|0;m=l|0;n=l+16|0;o=n|0;p=n;q=i;i=i+24|0;r=i;i=i+24|0;s=r|0;t=r;u=b+132|0;v=+g[f+12>>2];w=+g[j+8>>2];x=+g[f+8>>2];y=+g[j+12>>2];z=v*w-x*y;A=w*x+v*y;y=+z;w=+A;B=+g[j>>2]- +g[f>>2];C=+g[j+4>>2]- +g[f+4>>2];D=v*B+x*C;E=B*(-0.0-x)+v*C;C=+E;f=u;g[f>>2]=D;g[f+4>>2]=C;f=b+140|0;g[f>>2]=y;g[f+4>>2]=w;f=b+144|0;w=+g[h+12>>2];j=b+140|0;y=+g[h+16>>2];F=u|0;C=D+(A*w-z*y);u=b+136|0;D=w*z+A*y+E;G=b+148|0;E=+D;g[G>>2]=C;g[G+4>>2]=E;G=e+28|0;H=b+156|0;I=c[G>>2]|0;J=c[G+4>>2]|0;c[H>>2]=I;c[H+4>>2]=J;H=e+12|0;G=b+164|0;K=c[H>>2]|0;L=c[H+4>>2]|0;c[G>>2]=K;c[G+4>>2]=L;H=e+20|0;M=b+172|0;N=c[H>>2]|0;O=c[H+4>>2]|0;c[M>>2]=N;c[M+4>>2]=O;H=e+36|0;Q=b+180|0;R=c[H>>2]|0;S=c[H+4>>2]|0;c[Q>>2]=R;c[Q+4>>2]=S;Q=a[e+44|0]&1;H=Q<<24>>24!=0;T=a[e+45|0]|0;e=(T&1)!=0;E=(c[k>>2]=N,+g[k>>2]);y=(c[k>>2]=K,+g[k>>2]);A=E-y;z=(c[k>>2]=O,+g[k>>2]);O=b+168|0;w=(c[k>>2]=L,+g[k>>2]);v=z-w;x=+P(+(A*A+v*v));B=(c[k>>2]=I,+g[k>>2]);U=(c[k>>2]=J,+g[k>>2]);V=(c[k>>2]=R,+g[k>>2]);W=(c[k>>2]=S,+g[k>>2]);if(x<1.1920928955078125e-7){X=A;Y=v}else{Z=1.0/x;X=A*Z;Y=v*Z}S=b+196|0;Z=-0.0-X;R=S|0;g[R>>2]=Y;J=b+200|0;g[J>>2]=Z;v=(C-y)*Y+(D-w)*Z;if(H){Z=y-B;y=w-U;w=+P(+(Z*Z+y*y));if(w<1.1920928955078125e-7){_=Z;$=y}else{A=1.0/w;_=Z*A;$=y*A}A=-0.0-_;g[b+188>>2]=$;g[b+192>>2]=A;aa=(C-B)*$+(D-U)*A;ab=Y*_-X*$>=0.0}else{aa=0.0;ab=0}L93:do{if(e){$=V-E;_=W-z;A=+P(+($*$+_*_));if(A<1.1920928955078125e-7){ac=$;ad=_}else{U=1.0/A;ac=$*U;ad=_*U}U=-0.0-ac;I=b+204|0;g[I>>2]=ad;L=b+208|0;g[L>>2]=U;K=X*ad-Y*ac>0.0;_=(C-E)*ad+(D-z)*U;if((Q&T)<<24>>24==0){ae=K;af=_;ag=100;break}if(ab&K){do{if(aa<0.0&v<0.0){N=_>=0.0;a[b+248|0]=N&1;ah=b+212|0;if(N){ai=ah;break}N=ah;U=+(-0.0-Y);$=+X;g[N>>2]=U;g[N+4>>2]=$;N=b+228|0;g[N>>2]=U;g[N+4>>2]=$;N=b+236|0;g[N>>2]=U;g[N+4>>2]=$;break L93}else{a[b+248|0]=1;ai=b+212|0}}while(0);N=S;ah=ai;aj=c[N+4>>2]|0;c[ah>>2]=c[N>>2];c[ah+4>>2]=aj;aj=b+188|0;ah=b+228|0;N=c[aj+4>>2]|0;c[ah>>2]=c[aj>>2];c[ah+4>>2]=N;N=b+204|0;ah=b+236|0;aj=c[N+4>>2]|0;c[ah>>2]=c[N>>2];c[ah+4>>2]=aj;break}if(ab){do{if(aa<0.0){if(v<0.0){a[b+248|0]=0;ak=b+212|0}else{aj=_>=0.0;a[b+248|0]=aj&1;ah=b+212|0;if(aj){al=ah;break}else{ak=ah}}ah=ak;$=+X;g[ah>>2]=-0.0-Y;g[ah+4>>2]=$;ah=b+228|0;$=+(-0.0- +g[L>>2]);g[ah>>2]=-0.0- +g[I>>2];g[ah+4>>2]=$;ah=b+236|0;$=+(-0.0- +g[J>>2]);g[ah>>2]=-0.0- +g[R>>2];g[ah+4>>2]=$;break L93}else{a[b+248|0]=1;al=b+212|0}}while(0);ah=S;aj=al;N=c[ah+4>>2]|0;c[aj>>2]=c[ah>>2];c[aj+4>>2]=N;N=b+188|0;aj=b+228|0;am=c[N+4>>2]|0;c[aj>>2]=c[N>>2];c[aj+4>>2]=am;am=b+236|0;aj=c[ah+4>>2]|0;c[am>>2]=c[ah>>2];c[am+4>>2]=aj;break}if(!K){do{if(aa<0.0|v<0.0){a[b+248|0]=0;an=b+212|0}else{aj=_>=0.0;a[b+248|0]=aj&1;am=b+212|0;if(!aj){an=am;break}aj=S;ah=am;am=c[aj>>2]|0;N=c[aj+4>>2]|0;c[ah>>2]=am;c[ah+4>>2]=N;ah=b+228|0;c[ah>>2]=am;c[ah+4>>2]=N;ah=b+236|0;c[ah>>2]=am;c[ah+4>>2]=N;break L93}}while(0);K=an;$=+X;g[K>>2]=-0.0-Y;g[K+4>>2]=$;K=b+228|0;$=+(-0.0- +g[L>>2]);g[K>>2]=-0.0- +g[I>>2];g[K+4>>2]=$;K=b+236|0;$=+(-0.0- +g[b+192>>2]);g[K>>2]=-0.0- +g[b+188>>2];g[K+4>>2]=$;break}do{if(_<0.0){if(aa<0.0){a[b+248|0]=0;ao=b+212|0}else{K=v>=0.0;a[b+248|0]=K&1;N=b+212|0;if(K){ap=N;break}else{ao=N}}N=ao;$=+X;g[N>>2]=-0.0-Y;g[N+4>>2]=$;N=b+228|0;$=+(-0.0- +g[J>>2]);g[N>>2]=-0.0- +g[R>>2];g[N+4>>2]=$;N=b+236|0;$=+(-0.0- +g[b+192>>2]);g[N>>2]=-0.0- +g[b+188>>2];g[N+4>>2]=$;break L93}else{a[b+248|0]=1;ap=b+212|0}}while(0);I=S;L=ap;N=c[I+4>>2]|0;c[L>>2]=c[I>>2];c[L+4>>2]=N;N=b+228|0;L=c[I+4>>2]|0;c[N>>2]=c[I>>2];c[N+4>>2]=L;L=b+204|0;N=b+236|0;I=c[L+4>>2]|0;c[N>>2]=c[L>>2];c[N+4>>2]=I}else{ae=0;af=0.0;ag=100}}while(0);L134:do{if((ag|0)==100){if(H){ap=aa>=0.0;if(ab){do{if(ap){a[b+248|0]=1;aq=b+212|0}else{ao=v>=0.0;a[b+248|0]=ao&1;an=b+212|0;if(ao){aq=an;break}ao=an;an=0;z=+X;c[ao>>2]=an|(g[k>>2]=-0.0-Y,c[k>>2]|0);g[ao+4>>2]=z;ao=S;al=b+228|0;ak=c[ao>>2]|0;ai=c[ao+4>>2]|0;c[al>>2]=ak;c[al+4>>2]=ai;ai=b+236|0;c[ai>>2]=an|(g[k>>2]=-0.0-(c[k>>2]=ak,+g[k>>2]),c[k>>2]|0);g[ai+4>>2]=z;break L134}}while(0);ai=S;ak=aq;an=c[ai+4>>2]|0;c[ak>>2]=c[ai>>2];c[ak+4>>2]=an;an=b+188|0;ak=b+228|0;ai=c[an+4>>2]|0;c[ak>>2]=c[an>>2];c[ak+4>>2]=ai;ai=b+236|0;z=+(-0.0- +g[J>>2]);g[ai>>2]=-0.0- +g[R>>2];g[ai+4>>2]=z;break}else{do{if(ap){ai=v>=0.0;a[b+248|0]=ai&1;ak=b+212|0;if(!ai){ar=ak;break}ai=S;an=ak;ak=c[ai>>2]|0;al=c[ai+4>>2]|0;c[an>>2]=ak;c[an+4>>2]=al;an=b+228|0;c[an>>2]=ak;c[an+4>>2]=al;al=b+236|0;z=+X;g[al>>2]=-0.0-(c[k>>2]=ak,+g[k>>2]);g[al+4>>2]=z;break L134}else{a[b+248|0]=0;ar=b+212|0}}while(0);ap=ar;z=+X;g[ap>>2]=-0.0-Y;g[ap+4>>2]=z;ap=S;al=b+228|0;ak=c[ap+4>>2]|0;c[al>>2]=c[ap>>2];c[al+4>>2]=ak;ak=b+236|0;z=+(-0.0- +g[b+192>>2]);g[ak>>2]=-0.0- +g[b+188>>2];g[ak+4>>2]=z;break}}ak=v>=0.0;if(!e){a[b+248|0]=ak&1;al=b+212|0;if(ak){ap=S;an=al;ai=c[ap>>2]|0;ao=c[ap+4>>2]|0;c[an>>2]=ai;c[an+4>>2]=ao;ao=b+228|0;z=+(-0.0-(c[k>>2]=ai,+g[k>>2]));D=+X;g[ao>>2]=z;g[ao+4>>2]=D;ao=b+236|0;g[ao>>2]=z;g[ao+4>>2]=D;break}else{ao=al;D=+X;g[ao>>2]=-0.0-Y;g[ao+4>>2]=D;ao=S;al=b+228|0;ai=c[ao>>2]|0;an=c[ao+4>>2]|0;c[al>>2]=ai;c[al+4>>2]=an;al=b+236|0;c[al>>2]=ai;c[al+4>>2]=an;break}}if(ae){do{if(ak){a[b+248|0]=1;as=b+212|0}else{an=af>=0.0;a[b+248|0]=an&1;al=b+212|0;if(an){as=al;break}an=al;D=+(-0.0-Y);z=+X;g[an>>2]=D;g[an+4>>2]=z;an=b+228|0;g[an>>2]=D;g[an+4>>2]=z;an=S;al=b+236|0;ai=c[an+4>>2]|0;c[al>>2]=c[an>>2];c[al+4>>2]=ai;break L134}}while(0);ai=S;al=as;an=c[ai+4>>2]|0;c[al>>2]=c[ai>>2];c[al+4>>2]=an;an=b+228|0;z=+(-0.0- +g[J>>2]);g[an>>2]=-0.0- +g[R>>2];g[an+4>>2]=z;an=b+204|0;al=b+236|0;ai=c[an+4>>2]|0;c[al>>2]=c[an>>2];c[al+4>>2]=ai;break}else{do{if(ak){ai=af>=0.0;a[b+248|0]=ai&1;al=b+212|0;if(!ai){at=al;break}ai=S;an=al;al=c[ai>>2]|0;ao=c[ai+4>>2]|0;c[an>>2]=al;c[an+4>>2]=ao;an=b+228|0;z=+X;g[an>>2]=-0.0-(c[k>>2]=al,+g[k>>2]);g[an+4>>2]=z;an=b+236|0;c[an>>2]=al;c[an+4>>2]=ao;break L134}else{a[b+248|0]=0;at=b+212|0}}while(0);ak=at;z=+X;g[ak>>2]=-0.0-Y;g[ak+4>>2]=z;ak=b+228|0;z=+(-0.0- +g[b+208>>2]);g[ak>>2]=-0.0- +g[b+204>>2];g[ak+4>>2]=z;ak=S;ao=b+236|0;an=c[ak+4>>2]|0;c[ao>>2]=c[ak>>2];c[ao+4>>2]=an;break}}}while(0);at=h+148|0;as=b+128|0;c[as>>2]=c[at>>2];if((c[at>>2]|0)>0){ae=0;do{Y=+g[f>>2];X=+g[h+20+(ae<<3)>>2];af=+g[j>>2];v=+g[h+20+(ae<<3)+4>>2];e=b+(ae<<3)|0;aa=+(X*af+Y*v+ +g[u>>2]);g[e>>2]=+g[F>>2]+(Y*X-af*v);g[e+4>>2]=aa;aa=+g[f>>2];v=+g[h+84+(ae<<3)>>2];af=+g[j>>2];X=+g[h+84+(ae<<3)+4>>2];e=b+64+(ae<<3)|0;Y=+(v*af+aa*X);g[e>>2]=aa*v-af*X;g[e+4>>2]=Y;ae=ae+1|0;}while((ae|0)<(c[at>>2]|0))}at=b+244|0;g[at>>2]=.019999999552965164;ae=d+60|0;c[ae>>2]=0;e=b+248|0;ar=c[as>>2]|0;if((ar|0)>0){Y=+g[b+164>>2];X=+g[O>>2];af=+g[b+212>>2];v=+g[b+216>>2];O=0;aa=3.4028234663852886e+38;while(1){z=af*(+g[b+(O<<3)>>2]-Y)+v*(+g[b+(O<<3)+4>>2]-X);D=z<aa?z:aa;aq=O+1|0;if((aq|0)<(ar|0)){O=aq;aa=D}else{au=D;break}}}else{au=3.4028234663852886e+38}if(au>+g[at>>2]){i=l;return}b8(m,b);O=c[m>>2]|0;do{if((O|0)==0){ag=136}else{aa=+g[m+8>>2];if(aa>+g[at>>2]){i=l;return}if(aa<=au*.9800000190734863+.0010000000474974513){ag=136;break}ar=c[m+4>>2]|0;aq=n;ab=d+56|0;if((O|0)==1){av=aq;aw=ab;ag=138;break}c[ab>>2]=2;ab=c[G>>2]|0;H=c[G+4>>2]|0;c[o>>2]=ab;c[o+4>>2]=H;an=n+8|0;ao=an;a[an]=0;an=ar&255;a[ao+1|0]=an;a[ao+2|0]=0;a[ao+3|0]=1;ao=p+12|0;ak=c[M>>2]|0;al=c[M+4>>2]|0;c[ao>>2]=ak;c[ao+4>>2]=al;ao=p+20|0;ai=ao;a[ao]=0;a[ai+1|0]=an;a[ai+2|0]=0;a[ai+3|0]=1;ai=ar+1|0;ao=(ai|0)<(c[as>>2]|0)?ai:0;ai=b+(ar<<3)|0;ap=b+(ao<<3)|0;T=b+64+(ar<<3)|0;ax=ar;ay=ao&255;az=c[T>>2]|0;aA=c[T+4>>2]|0;aB=c[ap>>2]|0;aC=c[ap+4>>2]|0;aD=c[ai>>2]|0;aE=c[ai+4>>2]|0;aF=(c[k>>2]=ak,+g[k>>2]);aG=(c[k>>2]=ab,+g[k>>2]);aH=(c[k>>2]=al,+g[k>>2]);aI=(c[k>>2]=H,+g[k>>2]);aJ=an;aK=0;aL=aq}}while(0);if((ag|0)==136){av=n;aw=d+56|0;ag=138}do{if((ag|0)==138){c[aw>>2]=1;O=c[as>>2]|0;if((O|0)>1){au=+g[b+216>>2];aa=+g[b+212>>2];m=0;X=aa*+g[b+64>>2]+au*+g[b+68>>2];aq=1;while(1){v=aa*+g[b+64+(aq<<3)>>2]+au*+g[b+64+(aq<<3)+4>>2];an=v<X;H=an?aq:m;al=aq+1|0;if((al|0)<(O|0)){m=H;X=an?v:X;aq=al}else{aM=H;break}}}else{aM=0}aq=aM+1|0;m=(aq|0)<(O|0)?aq:0;aq=b+(aM<<3)|0;H=c[aq>>2]|0;al=c[aq+4>>2]|0;c[o>>2]=H;c[o+4>>2]=al;aq=n+8|0;an=aq;a[aq]=0;aq=aM&255;a[an+1|0]=aq;a[an+2|0]=1;a[an+3|0]=0;an=b+(m<<3)|0;ab=p+12|0;ak=c[an>>2]|0;ai=c[an+4>>2]|0;c[ab>>2]=ak;c[ab+4>>2]=ai;ab=p+20|0;an=ab;a[ab]=0;a[an+1|0]=m&255;a[an+2|0]=1;a[an+3|0]=0;X=(c[k>>2]=H,+g[k>>2]);au=(c[k>>2]=al,+g[k>>2]);aa=(c[k>>2]=ak,+g[k>>2]);v=(c[k>>2]=ai,+g[k>>2]);if((a[e]&1)==0){ax=1;ay=0;az=(g[k>>2]=-0.0- +g[R>>2],c[k>>2]|0);aA=(g[k>>2]=-0.0- +g[J>>2],c[k>>2]|0);aB=c[G>>2]|0;aC=c[G+4>>2]|0;aD=c[M>>2]|0;aE=c[M+4>>2]|0;aF=aa;aG=X;aH=v;aI=au;aJ=aq;aK=1;aL=av;break}else{ai=S;ax=0;ay=1;az=c[ai>>2]|0;aA=c[ai+4>>2]|0;aB=c[M>>2]|0;aC=c[M+4>>2]|0;aD=c[G>>2]|0;aE=c[G+4>>2]|0;aF=aa;aG=X;aH=v;aI=au;aJ=aq;aK=1;aL=av;break}}}while(0);au=(c[k>>2]=az,+g[k>>2]);v=(c[k>>2]=aA,+g[k>>2]);X=(c[k>>2]=aD,+g[k>>2]);aa=(c[k>>2]=aE,+g[k>>2]);Y=-0.0-au;af=X*v+aa*Y;D=-0.0-v;z=(c[k>>2]=aB,+g[k>>2])*D+(c[k>>2]=aC,+g[k>>2])*au;ad=v*aG+aI*Y-af;E=v*aF+aH*Y-af;if(ad>0.0){aN=0}else{aC=q;aB=n;c[aC>>2]=c[aB>>2];c[aC+4>>2]=c[aB+4>>2];c[aC+8>>2]=c[aB+8>>2];aN=1}if(E>0.0){aO=aN}else{aB=q+(aN*12&-1)|0;aC=aL+12|0;c[aB>>2]=c[aC>>2];c[aB+4>>2]=c[aC+4>>2];c[aB+8>>2]=c[aC+8>>2];aO=aN+1|0}if(ad*E<0.0){af=ad/(ad-E);aN=q+(aO*12&-1)|0;E=+(aI+af*(aH-aI));g[aN>>2]=aG+af*(aF-aG);g[aN+4>>2]=E;aN=q+(aO*12&-1)+8|0;aC=aN;a[aN]=ax&255;a[aC+1|0]=aJ;a[aC+2|0]=0;a[aC+3|0]=1;aP=aO+1|0}else{aP=aO}if((aP|0)<2){i=l;return}E=+g[q>>2];aG=+g[q+4>>2];aF=E*D+au*aG-z;aP=q+12|0;af=+g[aP>>2];aI=+g[q+16>>2];aH=af*D+au*aI-z;if(aF>0.0){aQ=0}else{aO=r;aC=q;c[aO>>2]=c[aC>>2];c[aO+4>>2]=c[aC+4>>2];c[aO+8>>2]=c[aC+8>>2];aQ=1}if(aH>0.0){aR=aQ}else{aC=t+(aQ*12&-1)|0;aO=aP;c[aC>>2]=c[aO>>2];c[aC+4>>2]=c[aO+4>>2];c[aC+8>>2]=c[aO+8>>2];aR=aQ+1|0}if(aF*aH<0.0){z=aF/(aF-aH);aQ=t+(aR*12&-1)|0;aH=+(aG+z*(aI-aG));g[aQ>>2]=E+z*(af-E);g[aQ+4>>2]=aH;aQ=t+(aR*12&-1)+8|0;aO=aQ;a[aQ]=ay;a[aO+1|0]=a[(q+8|0)+1|0]|0;a[aO+2|0]=0;a[aO+3|0]=1;aS=aR+1|0}else{aS=aR}if((aS|0)<2){i=l;return}aS=d+40|0;do{if(aK){aR=aS;c[aR>>2]=az;c[aR+4>>2]=aA;aR=d+48|0;c[aR>>2]=aD;c[aR+4>>2]=aE;aH=+g[r>>2];E=+g[t+4>>2];af=+g[at>>2];if(au*(aH-X)+v*(E-aa)>af){aT=0;aU=af}else{af=aH- +g[F>>2];aH=E- +g[u>>2];E=+g[f>>2];z=+g[j>>2];aR=d;aG=+(E*aH+af*(-0.0-z));g[aR>>2]=af*E+aH*z;g[aR+4>>2]=aG;c[d+16>>2]=c[r+8>>2];aT=1;aU=+g[at>>2]}aG=+g[t+12>>2];z=+g[r+16>>2];if(au*(aG-X)+v*(z-aa)>aU){aV=aT;break}aH=aG- +g[F>>2];aG=z- +g[u>>2];z=+g[f>>2];E=+g[j>>2];aR=d+(aT*20&-1)|0;af=+(z*aG+aH*(-0.0-E));g[aR>>2]=aH*z+aG*E;g[aR+4>>2]=af;c[d+(aT*20&-1)+16>>2]=c[t+20>>2];aV=aT+1|0}else{aR=h+84+(ax<<3)|0;aO=aS;q=c[aR+4>>2]|0;c[aO>>2]=c[aR>>2];c[aO+4>>2]=q;q=h+20+(ax<<3)|0;aO=d+48|0;aR=c[q+4>>2]|0;c[aO>>2]=c[q>>2];c[aO+4>>2]=aR;af=+g[at>>2];if(au*(+g[r>>2]-X)+v*(+g[t+4>>2]-aa)>af){aW=0;aX=af}else{aR=d;aO=c[s+4>>2]|0;c[aR>>2]=c[s>>2];c[aR+4>>2]=aO;aO=r+8|0;aR=aO;q=d+16|0;ay=q;a[ay+2|0]=a[aR+3|0]|0;a[ay+3|0]=a[aR+2|0]|0;a[q]=a[aR+1|0]|0;a[ay+1|0]=a[aO]|0;aW=1;aX=+g[at>>2]}aO=t+12|0;if(au*(+g[aO>>2]-X)+v*(+g[r+16>>2]-aa)>aX){aV=aW;break}ay=aO;aO=d+(aW*20&-1)|0;aR=c[ay+4>>2]|0;c[aO>>2]=c[ay>>2];c[aO+4>>2]=aR;aR=t+20|0;aO=aR;ay=d+(aW*20&-1)+16|0;q=ay;a[q+2|0]=a[aO+3|0]|0;a[q+3|0]=a[aO+2|0]|0;a[ay]=a[aO+1|0]|0;a[q+1|0]=a[aR]|0;aV=aW+1|0}}while(0);c[ae>>2]=aV;i=l;return}function b8(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0,r=0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0;d=a|0;c[d>>2]=0;e=a+4|0;c[e>>2]=-1;f=a+8|0;g[f>>2]=-3.4028234663852886e+38;h=+g[b+216>>2];i=+g[b+212>>2];a=c[b+128>>2]|0;if((a|0)<=0){return}j=+g[b+164>>2];k=+g[b+168>>2];l=+g[b+172>>2];m=+g[b+176>>2];n=+g[b+244>>2];o=b+228|0;p=b+232|0;q=b+236|0;r=b+240|0;s=0;t=-3.4028234663852886e+38;while(1){u=+g[b+64+(s<<3)>>2];v=-0.0-u;w=-0.0- +g[b+64+(s<<3)+4>>2];x=+g[b+(s<<3)>>2];y=+g[b+(s<<3)+4>>2];z=(x-j)*v+(y-k)*w;A=(x-l)*v+(y-m)*w;B=z<A?z:A;if(B>n){break}if(h*u+i*w<0.0){if((v- +g[o>>2])*i+(w- +g[p>>2])*h>=-.03490658849477768&B>t){C=182}else{D=t}}else{if((v- +g[q>>2])*i+(w- +g[r>>2])*h>=-.03490658849477768&B>t){C=182}else{D=t}}if((C|0)==182){C=0;c[d>>2]=2;c[e>>2]=s;g[f>>2]=B;D=B}E=s+1|0;if((E|0)<(a|0)){s=E;t=D}else{C=187;break}}if((C|0)==187){return}c[d>>2]=2;c[e>>2]=s;g[f>>2]=B;return}function b9(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0,A=0.0,B=0;h=c[b+148>>2]|0;i=+g[f+12>>2];j=+g[e+12>>2];k=+g[f+8>>2];l=+g[e+16>>2];m=+g[d+12>>2];n=+g[b+12>>2];o=+g[d+8>>2];p=+g[b+16>>2];q=+g[f>>2]+(i*j-k*l)-(+g[d>>2]+(m*n-o*p));r=j*k+i*l+ +g[f+4>>2]-(n*o+m*p+ +g[d+4>>2]);p=m*q+o*r;n=m*r+q*(-0.0-o);if((h|0)>0){s=0;o=-3.4028234663852886e+38;t=0;while(1){q=p*+g[b+84+(s<<3)>>2]+n*+g[b+84+(s<<3)+4>>2];u=q>o;v=u?s:t;w=s+1|0;if((w|0)<(h|0)){s=w;o=u?q:o;t=v}else{x=v;break}}}else{x=0}o=+cb(b,d,x,e,f);t=((x|0)>0?x:h)-1|0;n=+cb(b,d,t,e,f);s=x+1|0;v=(s|0)<(h|0)?s:0;p=+cb(b,d,v,e,f);if(n>o&n>p){q=n;s=t;while(1){t=((s|0)>0?s:h)-1|0;n=+cb(b,d,t,e,f);if(n>q){q=n;s=t}else{y=q;z=s;break}}c[a>>2]=z;return+y}if(p>o){A=p;B=v}else{y=o;z=x;c[a>>2]=z;return+y}while(1){x=B+1|0;v=(x|0)<(h|0)?x:0;o=+cb(b,d,v,e,f);if(o>A){A=o;B=v}else{y=A;z=B;break}}c[a>>2]=z;return+y}function ca(b,d,e,f,h){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0,B=0,C=0,D=0,E=0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0,O=0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;j=i;i=i+40|0;k=j|0;l=j+8|0;m=j+16|0;n=m|0;o=i;i=i+24|0;p=i;i=i+24|0;q=b+60|0;c[q>>2]=0;r=+g[d+8>>2]+ +g[f+8>>2];c[k>>2]=0;s=+b9(k,d,e,f,h);if(s>r){i=j;return}c[l>>2]=0;t=+b9(l,f,h,d,e);if(t>r){i=j;return}if(t>s*.9800000190734863+.0010000000474974513){s=+g[h>>2];t=+g[h+4>>2];u=+g[h+8>>2];v=+g[h+12>>2];w=+g[e>>2];x=+g[e+4>>2];y=+g[e+8>>2];z=+g[e+12>>2];A=c[l>>2]|0;c[b+56>>2]=2;B=f;C=d;D=A;E=1;F=w;G=x;H=y;I=z;J=s;K=t;L=u;M=v}else{v=+g[e>>2];u=+g[e+4>>2];t=+g[e+8>>2];s=+g[e+12>>2];z=+g[h>>2];y=+g[h+4>>2];x=+g[h+8>>2];w=+g[h+12>>2];h=c[k>>2]|0;c[b+56>>2]=1;B=d;C=f;D=h;E=0;F=z;G=y;H=x;I=w;J=v;K=u;L=t;M=s}h=m;f=c[C+148>>2]|0;if((D|0)<=-1){bc(10264,151,18656,11704)}d=c[B+148>>2]|0;if((d|0)<=(D|0)){bc(10264,151,18656,11704)}s=+g[B+84+(D<<3)>>2];t=+g[B+84+(D<<3)+4>>2];u=M*s-L*t;v=L*s+M*t;t=I*u+H*v;s=-0.0-H;w=I*v+u*s;if((f|0)>0){k=0;u=3.4028234663852886e+38;e=0;while(1){v=t*+g[C+84+(k<<3)>>2]+w*+g[C+84+(k<<3)+4>>2];A=v<u;l=A?k:e;N=k+1|0;if((N|0)<(f|0)){k=N;u=A?v:u;e=l}else{O=l;break}}}else{O=0}e=O+1|0;k=(e|0)<(f|0)?e:0;u=+g[C+20+(O<<3)>>2];w=+g[C+20+(O<<3)+4>>2];t=F+(I*u-H*w);v=G+(H*u+I*w);w=+v;g[n>>2]=t;g[n+4>>2]=w;n=D&255;e=m+8|0;f=e;a[e]=n;e=O&255;a[f+1|0]=e;a[f+2|0]=1;a[f+3|0]=0;f=h+12|0;w=+g[C+20+(k<<3)>>2];u=+g[C+20+(k<<3)+4>>2];x=F+(I*w-H*u);y=G+(H*w+I*u);C=f;u=+y;g[C>>2]=x;g[C+4>>2]=u;C=h+20|0;h=C;a[C]=n;a[h+1|0]=k&255;a[h+2|0]=1;a[h+3|0]=0;h=D+1|0;k=(h|0)<(d|0)?h:0;h=B+20+(D<<3)|0;u=+g[h>>2];w=+g[h+4>>2];h=B+20+(k<<3)|0;z=+g[h>>2];Q=+g[h+4>>2];R=z-u;S=Q-w;T=+P(+(R*R+S*S));if(T<1.1920928955078125e-7){U=R;V=S}else{W=1.0/T;U=R*W;V=S*W}W=M*U-L*V;S=M*V+L*U;R=W*-1.0;T=J+(M*u-L*w);X=K+(L*u+M*w);Y=T*S+X*R;Z=r-(T*W+X*S);X=r+((J+(M*z-L*Q))*W+(K+(L*z+M*Q))*S);M=-0.0-W;L=-0.0-S;K=t*M+v*L-Z;J=x*M+y*L-Z;if(K>0.0){_=0}else{h=o;B=m;c[h>>2]=c[B>>2];c[h+4>>2]=c[B+4>>2];c[h+8>>2]=c[B+8>>2];_=1}if(J>0.0){$=_}else{B=o+(_*12&-1)|0;h=f;c[B>>2]=c[h>>2];c[B+4>>2]=c[h+4>>2];c[B+8>>2]=c[h+8>>2];$=_+1|0}if(K*J<0.0){Z=K/(K-J);_=o+($*12&-1)|0;J=+(v+Z*(y-v));g[_>>2]=t+Z*(x-t);g[_+4>>2]=J;_=o+($*12&-1)+8|0;h=_;a[_]=n;a[h+1|0]=e;a[h+2|0]=0;a[h+3|0]=1;aa=$+1|0}else{aa=$}if((aa|0)<2){i=j;return}J=+g[o>>2];t=+g[o+4>>2];x=W*J+S*t-X;aa=o+12|0;Z=+g[aa>>2];v=+g[o+16>>2];y=W*Z+S*v-X;if(x>0.0){ab=0}else{$=p;h=o;c[$>>2]=c[h>>2];c[$+4>>2]=c[h+4>>2];c[$+8>>2]=c[h+8>>2];ab=1}if(y>0.0){ac=ab}else{h=p+(ab*12&-1)|0;$=aa;c[h>>2]=c[$>>2];c[h+4>>2]=c[$+4>>2];c[h+8>>2]=c[$+8>>2];ac=ab+1|0}if(x*y<0.0){X=x/(x-y);ab=p+(ac*12&-1)|0;y=+(t+X*(v-t));g[ab>>2]=J+X*(Z-J);g[ab+4>>2]=y;ab=p+(ac*12&-1)+8|0;$=ab;a[ab]=k&255;a[$+1|0]=a[(o+8|0)+1|0]|0;a[$+2|0]=0;a[$+3|0]=1;ad=ac+1|0}else{ad=ac}if((ad|0)<2){i=j;return}ad=b+40|0;y=+(U*-1.0);g[ad>>2]=V;g[ad+4>>2]=y;ad=b+48|0;y=+((w+Q)*.5);g[ad>>2]=(u+z)*.5;g[ad+4>>2]=y;y=+g[p>>2];z=+g[p+4>>2];ad=S*y+R*z-Y>r;do{if(E<<24>>24==0){if(ad){ae=0}else{u=y-F;Q=z-G;ac=b;w=+(u*s+I*Q);g[ac>>2]=I*u+H*Q;g[ac+4>>2]=w;c[b+16>>2]=c[p+8>>2];ae=1}w=+g[p+12>>2];Q=+g[p+16>>2];if(S*w+R*Q-Y>r){af=ae;break}u=w-F;w=Q-G;ac=b+(ae*20&-1)|0;Q=+(u*s+I*w);g[ac>>2]=I*u+H*w;g[ac+4>>2]=Q;c[b+(ae*20&-1)+16>>2]=c[p+20>>2];af=ae+1|0}else{if(ad){ag=0}else{Q=y-F;w=z-G;ac=b;u=+(Q*s+I*w);g[ac>>2]=I*Q+H*w;g[ac+4>>2]=u;ac=b+16|0;$=c[p+8>>2]|0;c[ac>>2]=$;o=ac;a[ac]=$>>>8&255;a[o+1|0]=$&255;a[o+2|0]=$>>>24&255;a[o+3|0]=$>>>16&255;ag=1}u=+g[p+12>>2];w=+g[p+16>>2];if(S*u+R*w-Y>r){af=ag;break}Q=u-F;u=w-G;$=b+(ag*20&-1)|0;w=+(Q*s+I*u);g[$>>2]=I*Q+H*u;g[$+4>>2]=w;$=b+(ag*20&-1)+16|0;o=c[p+20>>2]|0;c[$>>2]=o;ac=$;a[$]=o>>>8&255;a[ac+1|0]=o&255;a[ac+2|0]=o>>>24&255;a[ac+3|0]=o>>>16&255;af=ag+1|0}}while(0);c[q>>2]=af;i=j;return}function cb(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0.0,s=0,t=0.0,u=0,v=0,w=0,x=0;h=c[e+148>>2]|0;if((d|0)<=-1){bc(10264,32,18800,11704);return 0.0}if((c[a+148>>2]|0)<=(d|0)){bc(10264,32,18800,11704);return 0.0}i=+g[b+12>>2];j=+g[a+84+(d<<3)>>2];k=+g[b+8>>2];l=+g[a+84+(d<<3)+4>>2];m=i*j-k*l;n=j*k+i*l;l=+g[f+12>>2];j=+g[f+8>>2];o=l*m+j*n;p=l*n+m*(-0.0-j);if((h|0)>0){q=0;r=3.4028234663852886e+38;s=0;while(1){t=o*+g[e+20+(q<<3)>>2]+p*+g[e+20+(q<<3)+4>>2];u=t<r;v=u?q:s;w=q+1|0;if((w|0)<(h|0)){q=w;r=u?t:r;s=v}else{x=v;break}}}else{x=0}r=+g[a+20+(d<<3)>>2];p=+g[a+20+(d<<3)+4>>2];o=+g[e+20+(x<<3)>>2];t=+g[e+20+(x<<3)+4>>2];return+(m*(+g[f>>2]+(l*o-j*t)-(+g[b>>2]+(i*r-k*p)))+n*(o*j+l*t+ +g[f+4>>2]-(r*k+i*p+ +g[b+4>>2])))}function cc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0.0,z=0.0,A=0.0,B=0.0;e=i;i=i+8|0;f=e|0;h=d;j=+g[h>>2];k=+g[d+8>>2]-j;l=+g[d+12>>2]- +g[d+4>>2];m=+g[h+4>>2];if(k>0.0){n=k}else{n=-0.0-k}if(l>0.0){o=l}else{o=-0.0-l}h=a|0;p=a+8|0;a=f;q=f+4|0;do{if(n<1.1920928955078125e-7){if(j<+g[h>>2]){r=0;i=e;return r|0}if(+g[p>>2]<j){r=0}else{s=3.4028234663852886e+38;t=-3.4028234663852886e+38;break}i=e;return r|0}else{u=1.0/k;v=u*(+g[h>>2]-j);w=u*(+g[p>>2]-j);x=v>w;u=x?w:v;y=x?v:w;if(u>-3.4028234663852886e+38){g[q>>2]=0.0;g[a>>2]=x?1.0:-1.0;z=u}else{z=-3.4028234663852886e+38}u=y>3.4028234663852886e+38?3.4028234663852886e+38:y;if(z>u){r=0}else{s=u;t=z;break}i=e;return r|0}}while(0);do{if(o<1.1920928955078125e-7){if(m<+g[h+4>>2]){r=0;i=e;return r|0}if(+g[p+4>>2]<m){r=0}else{A=t;break}i=e;return r|0}else{z=1.0/l;j=z*(+g[h+4>>2]-m);k=z*(+g[p+4>>2]-m);q=j>k;z=q?k:j;n=q?j:k;if(z>t){g[a>>2]=0.0;g[a+4>>2]=q?1.0:-1.0;B=z}else{B=t}if(B>(s<n?s:n)){r=0}else{A=B;break}i=e;return r|0}}while(0);if(A<0.0){r=0;i=e;return r|0}if(+g[d+16>>2]<A){r=0;i=e;return r|0}g[b+8>>2]=A;d=b;b=c[f+4>>2]|0;c[d>>2]=c[f>>2];c[d+4>>2]=b;r=1;i=e;return r|0}function cd(a,b,d,e,f,h){a=a|0;b=b|0;d=d|0;e=+e;f=f|0;h=+h;var i=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0,B=0,C=0,D=0,E=0.0,F=0.0;i=b+60|0;if((c[i>>2]|0)==0){return}j=c[b+56>>2]|0;if((j|0)==0){k=a|0;g[k>>2]=1.0;l=a+4|0;g[l>>2]=0.0;m=+g[d+12>>2];n=+g[b+48>>2];o=+g[d+8>>2];p=+g[b+52>>2];q=+g[d>>2]+(m*n-o*p);r=n*o+m*p+ +g[d+4>>2];p=+g[f+12>>2];m=+g[b>>2];o=+g[f+8>>2];n=+g[b+4>>2];s=+g[f>>2]+(p*m-o*n);t=m*o+p*n+ +g[f+4>>2];n=q-s;p=r-t;do{if(n*n+p*p>1.4210854715202004e-14){o=s-q;m=t-r;u=a;v=+m;g[u>>2]=o;g[u+4>>2]=v;v=+P(+(o*o+m*m));if(v<1.1920928955078125e-7){w=o;x=m;break}y=1.0/v;v=o*y;g[k>>2]=v;o=m*y;g[l>>2]=o;w=v;x=o}else{w=1.0;x=0.0}}while(0);l=a+8|0;p=+((r+x*e+(t-x*h))*.5);g[l>>2]=(q+w*e+(s-w*h))*.5;g[l+4>>2]=p;return}else if((j|0)==1){l=d+12|0;p=+g[l>>2];w=+g[b+40>>2];k=d+8|0;s=+g[k>>2];q=+g[b+44>>2];x=p*w-s*q;t=w*s+p*q;u=a;q=+t;g[u>>2]=x;g[u+4>>2]=q;q=+g[l>>2];p=+g[b+48>>2];s=+g[k>>2];w=+g[b+52>>2];r=+g[d>>2]+(q*p-s*w);n=p*s+q*w+ +g[d+4>>2];if((c[i>>2]|0)<=0){return}k=f+12|0;l=f+8|0;u=f|0;z=f+4|0;A=a|0;B=a+4|0;C=0;w=x;x=t;while(1){t=+g[k>>2];q=+g[b+(C*20&-1)>>2];s=+g[l>>2];p=+g[b+(C*20&-1)+4>>2];o=+g[u>>2]+(t*q-s*p);v=q*s+t*p+ +g[z>>2];p=e-(w*(o-r)+(v-n)*x);D=a+8+(C<<3)|0;t=+((v-x*h+(v+x*p))*.5);g[D>>2]=(o-w*h+(o+w*p))*.5;g[D+4>>2]=t;D=C+1|0;if((D|0)>=(c[i>>2]|0)){break}C=D;w=+g[A>>2];x=+g[B>>2]}return}else if((j|0)==2){j=f+12|0;x=+g[j>>2];w=+g[b+40>>2];B=f+8|0;n=+g[B>>2];r=+g[b+44>>2];t=x*w-n*r;p=w*n+x*r;A=a;r=+p;g[A>>2]=t;g[A+4>>2]=r;r=+g[j>>2];x=+g[b+48>>2];n=+g[B>>2];w=+g[b+52>>2];o=+g[f>>2]+(r*x-n*w);v=x*n+r*w+ +g[f+4>>2];if((c[i>>2]|0)>0){f=d+12|0;B=d+8|0;j=d|0;C=d+4|0;d=a|0;z=a+4|0;u=0;w=t;r=p;while(1){n=+g[f>>2];x=+g[b+(u*20&-1)>>2];s=+g[B>>2];q=+g[b+(u*20&-1)+4>>2];y=+g[j>>2]+(n*x-s*q);m=x*s+n*q+ +g[C>>2];q=h-(w*(y-o)+(m-v)*r);l=a+8+(u<<3)|0;n=+((m-r*e+(m+r*q))*.5);g[l>>2]=(y-w*e+(y+w*q))*.5;g[l+4>>2]=n;l=u+1|0;n=+g[d>>2];q=+g[z>>2];if((l|0)<(c[i>>2]|0)){u=l;w=n;r=q}else{E=n;F=q;break}}}else{E=t;F=p}p=+(-0.0-F);g[A>>2]=-0.0-E;g[A+4>>2]=p;return}else{return}}function ce(a){a=a|0;var b=0,d=0.0,e=0.0,f=0,h=0.0,i=0.0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0;b=a+16|0;d=+g[b>>2];e=+g[b+4>>2];b=a+36|0;f=a+52|0;h=+g[f>>2];i=+g[f+4>>2];f=a+72|0;j=a+88|0;k=+g[j>>2];l=+g[j+4>>2];m=h-d;n=i-e;o=d*m+e*n;p=h*m+i*n;q=k-d;r=l-e;s=d*q+e*r;t=k*q+l*r;u=k-h;v=l-i;w=h*u+i*v;x=k*u+l*v;v=m*r-n*q;q=(h*l-i*k)*v;n=(e*k-d*l)*v;l=(d*i-e*h)*v;if(!(o<-0.0|s<-0.0)){g[a+24>>2]=1.0;c[a+108>>2]=1;return}if(!(o>=-0.0|p<=0.0|l>0.0)){v=1.0/(p-o);g[a+24>>2]=p*v;g[a+60>>2]=v*(-0.0-o);c[a+108>>2]=2;return}if(!(s>=-0.0|t<=0.0|n>0.0)){o=1.0/(t-s);g[a+24>>2]=t*o;g[a+96>>2]=o*(-0.0-s);c[a+108>>2]=2;vp(b|0,f|0,36);return}if(!(p>0.0|w<-0.0)){g[a+60>>2]=1.0;c[a+108>>2]=1;vp(a|0,b|0,36);return}if(!(t>0.0|x>0.0)){g[a+96>>2]=1.0;c[a+108>>2]=1;vp(a|0,f|0,36);return}if(w>=-0.0|x<=0.0|q>0.0){t=1.0/(l+(q+n));g[a+24>>2]=q*t;g[a+60>>2]=n*t;g[a+96>>2]=l*t;c[a+108>>2]=3;return}else{t=1.0/(x-w);g[a+60>>2]=x*t;g[a+96>>2]=t*(-0.0-w);c[a+108>>2]=2;vp(a|0,f|0,36);return}}function cf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0;e=c[b+4>>2]|0;if((e|0)==0){c[a+16>>2]=b+12;c[a+20>>2]=1;g[a+24>>2]=+g[b+8>>2];return}else if((e|0)==2){c[a+16>>2]=b+20;c[a+20>>2]=c[b+148>>2];g[a+24>>2]=+g[b+8>>2];return}else if((e|0)==3){if((d|0)<=-1){bc(5304,53,17648,10824)}f=b+16|0;if((c[f>>2]|0)<=(d|0)){bc(5304,53,17648,10824)}h=b+12|0;i=(c[h>>2]|0)+(d<<3)|0;j=a;k=c[i+4>>2]|0;c[j>>2]=c[i>>2];c[j+4>>2]=k;k=d+1|0;d=a+8|0;j=c[h>>2]|0;if((k|0)<(c[f>>2]|0)){f=j+(k<<3)|0;k=d;h=c[f+4>>2]|0;c[k>>2]=c[f>>2];c[k+4>>2]=h}else{h=j;j=d;d=c[h+4>>2]|0;c[j>>2]=c[h>>2];c[j+4>>2]=d}c[a+16>>2]=a;c[a+20>>2]=2;g[a+24>>2]=+g[b+8>>2];return}else if((e|0)==1){c[a+16>>2]=b+12;c[a+20>>2]=2;g[a+24>>2]=+g[b+8>>2];return}else{bc(5304,81,17648,11592)}}function cg(d,e,f){d=d|0;e=e|0;f=f|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0.0,u=0.0,v=0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,Q=0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0,Z=0,_=0.0,$=0.0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0.0,aq=0.0,ar=0.0;h=i;i=i+176|0;j=h|0;k=h+16|0;l=h+32|0;m=h+144|0;n=h+160|0;c[1044]=(c[1044]|0)+1;o=j;p=f+56|0;c[o>>2]=c[p>>2];c[o+4>>2]=c[p+4>>2];c[o+8>>2]=c[p+8>>2];c[o+12>>2]=c[p+12>>2];p=k;o=f+72|0;c[p>>2]=c[o>>2];c[p+4>>2]=c[o+4>>2];c[p+8>>2]=c[o+8>>2];c[p+12>>2]=c[o+12>>2];ch(l,e,f|0,j,f+28|0,k);o=l|0;p=l+108|0;q=c[p>>2]|0;if((q|0)==1|(q|0)==2|(q|0)==3){r=l+16|0;s=l+20|0;t=+g[j+12>>2];u=+g[j+8>>2];v=f+16|0;w=f+20|0;x=+g[j>>2];y=+g[j+4>>2];z=+g[k+12>>2];A=+g[k+8>>2];B=-0.0-A;j=f+44|0;C=f+48|0;D=+g[k>>2];E=+g[k+4>>2];k=l+52|0;F=l+56|0;G=l+16|0;H=l+52|0;I=l+24|0;J=l+60|0;K=l;L=l+36|0;M=0;N=q;L460:while(1){O=(N|0)>0;if(O){Q=0;do{c[m+(Q<<2)>>2]=c[o+(Q*36&-1)+28>>2];c[n+(Q<<2)>>2]=c[o+(Q*36&-1)+32>>2];Q=Q+1|0;}while((Q|0)<(N|0))}do{if((N|0)==2){R=+g[G>>2];S=+g[G+4>>2];T=+g[H>>2];U=+g[H+4>>2];V=T-R;W=U-S;X=R*V+S*W;if(X>=-0.0){g[I>>2]=1.0;c[p>>2]=1;Y=356;break}S=T*V+U*W;if(S>0.0){W=1.0/(S-X);g[I>>2]=S*W;g[J>>2]=W*(-0.0-X);c[p>>2]=2;Y=357;break}else{g[J>>2]=1.0;c[p>>2]=1;vp(K|0,L|0,36);Y=356;break}}else if((N|0)==3){ce(l);Q=c[p>>2]|0;if((Q|0)==0){Y=354;break L460}else if((Q|0)==1){Y=356}else if((Q|0)==2){Y=357}else if((Q|0)==3){Z=M;Y=381;break L460}else{Y=355;break L460}}else if((N|0)==1){Y=356}else{Y=352;break L460}}while(0);do{if((Y|0)==356){Y=0;_=-0.0- +g[r>>2];$=-0.0- +g[s>>2];aa=1}else if((Y|0)==357){Y=0;X=+g[r>>2];W=+g[k>>2]-X;S=+g[s>>2];U=+g[F>>2]-S;if(W*(-0.0-S)-U*(-0.0-X)>0.0){_=U*-1.0;$=W;aa=2;break}else{_=U;$=W*-1.0;aa=2;break}}}while(0);if($*$+_*_<1.4210854715202004e-14){Z=M;Y=381;break}Q=o+(aa*36&-1)|0;W=-0.0-$;U=t*(-0.0-_)+u*W;X=t*W+_*u;ab=c[v>>2]|0;ac=c[w>>2]|0;if((ac|0)>1){W=X*+g[ab+4>>2]+U*+g[ab>>2];ad=1;ae=0;while(1){S=U*+g[ab+(ad<<3)>>2]+X*+g[ab+(ad<<3)+4>>2];af=S>W;ag=af?ad:ae;ah=ad+1|0;if((ah|0)<(ac|0)){W=af?S:W;ad=ah;ae=ag}else{break}}ae=o+(aa*36&-1)+28|0;c[ae>>2]=ag;if((ag|0)>-1){ai=ag;aj=ae}else{Y=395;break}}else{ae=o+(aa*36&-1)+28|0;c[ae>>2]=0;ai=0;aj=ae}if((ac|0)<=(ai|0)){Y=396;break}W=+g[ab+(ai<<3)>>2];X=+g[ab+(ai<<3)+4>>2];U=x+(t*W-u*X);ae=Q;S=+(W*u+t*X+y);g[ae>>2]=U;g[ae+4>>2]=S;S=_*z+$*A;X=$*z+_*B;ae=c[j>>2]|0;ad=c[C>>2]|0;if((ad|0)>1){W=X*+g[ae+4>>2]+S*+g[ae>>2];ah=1;af=0;while(1){V=S*+g[ae+(ah<<3)>>2]+X*+g[ae+(ah<<3)+4>>2];ak=V>W;al=ak?ah:af;am=ah+1|0;if((am|0)<(ad|0)){W=ak?V:W;ah=am;af=al}else{break}}af=o+(aa*36&-1)+32|0;c[af>>2]=al;if((al|0)>-1){an=al;ao=af}else{Y=397;break}}else{af=o+(aa*36&-1)+32|0;c[af>>2]=0;an=0;ao=af}if((ad|0)<=(an|0)){Y=398;break}W=+g[ae+(an<<3)>>2];X=+g[ae+(an<<3)+4>>2];S=D+(z*W-A*X);af=o+(aa*36&-1)+8|0;V=+(W*A+z*X+E);g[af>>2]=S;g[af+4>>2]=V;af=o+(aa*36&-1)+16|0;V=+(+g[o+(aa*36&-1)+12>>2]- +g[o+(aa*36&-1)+4>>2]);g[af>>2]=S-U;g[af+4>>2]=V;af=M+1|0;c[1042]=(c[1042]|0)+1;if(O){ah=c[aj>>2]|0;Q=0;do{if((ah|0)==(c[m+(Q<<2)>>2]|0)){if((c[ao>>2]|0)==(c[n+(Q<<2)>>2]|0)){Z=af;Y=381;break L460}}Q=Q+1|0;}while((Q|0)<(N|0))}Q=(c[p>>2]|0)+1|0;c[p>>2]=Q;if((af|0)<20){M=af;N=Q}else{Z=af;Y=381;break}}if((Y|0)==352){bc(5304,498,19160,11592)}else if((Y|0)==354){bc(5304,194,13608,11592)}else if((Y|0)==355){bc(5304,207,13608,11592)}else if((Y|0)==381){N=c[1040]|0;c[1040]=(N|0)>(Z|0)?N:Z;N=d+8|0;ci(l,d|0,N);M=d|0;n=N|0;E=+g[M>>2]- +g[n>>2];ao=d+4|0;m=d+12|0;z=+g[ao>>2]- +g[m>>2];aj=d+16|0;g[aj>>2]=+P(+(E*E+z*z));c[d+20>>2]=Z;Z=c[p>>2]|0;if((Z|0)==0){bc(5304,246,13504,11592)}else if((Z|0)==2){z=+g[r>>2]- +g[k>>2];E=+g[s>>2]- +g[F>>2];ap=+P(+(z*z+E*E))}else if((Z|0)==3){E=+g[r>>2];z=+g[s>>2];ap=(+g[k>>2]-E)*(+g[l+92>>2]-z)-(+g[F>>2]-z)*(+g[l+88>>2]-E)}else if((Z|0)==1){ap=0.0}else{bc(5304,259,13504,11592)}g[e>>2]=ap;b[e+4>>1]=Z&65535;l=0;do{a[l+(e+6)|0]=c[o+(l*36&-1)+28>>2]&255;a[l+(e+9)|0]=c[o+(l*36&-1)+32>>2]&255;l=l+1|0;}while((l|0)<(Z|0));if((a[f+88|0]&1)==0){i=h;return}ap=+g[f+24>>2];E=+g[f+52>>2];z=+g[aj>>2];A=ap+E;if(!(z>A&z>1.1920928955078125e-7)){f=d;D=+((+g[M>>2]+ +g[n>>2])*.5);B=+((+g[ao>>2]+ +g[m>>2])*.5);g[f>>2]=D;g[f+4>>2]=B;f=N;g[f>>2]=D;g[f+4>>2]=B;g[aj>>2]=0.0;i=h;return}g[aj>>2]=z-A;A=+g[n>>2];z=+g[M>>2];B=A-z;D=+g[m>>2];_=+g[ao>>2];$=D-_;y=+P(+(B*B+$*$));if(y<1.1920928955078125e-7){aq=B;ar=$}else{t=1.0/y;aq=B*t;ar=$*t}g[M>>2]=ap*aq+z;g[ao>>2]=ap*ar+_;g[n>>2]=A-E*aq;g[m>>2]=D-E*ar;i=h;return}else if((Y|0)==395){bc(7536,103,13816,6368)}else if((Y|0)==396){bc(7536,103,13816,6368)}else if((Y|0)==397){bc(7536,103,13816,6368)}else if((Y|0)==398){bc(7536,103,13816,6368)}}else if((q|0)==0){bc(5304,194,13608,11592)}else{bc(5304,207,13608,11592)}}function ch(a,e,f,h,i,j){a=a|0;e=e|0;f=f|0;h=h|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0;k=b[e+4>>1]|0;if((k&65535)>=4){bc(5304,102,14776,5808)}l=k&65535;m=a+108|0;c[m>>2]=l;n=a|0;L542:do{if(k<<16>>16==0){o=l}else{p=f+20|0;q=f+16|0;r=i+20|0;s=i+16|0;t=h+12|0;u=h+8|0;v=h|0;w=h+4|0;x=j+12|0;y=j+8|0;z=j|0;A=j+4|0;B=0;while(1){C=d[B+(e+6)|0]|0;c[n+(B*36&-1)+28>>2]=C;D=d[B+(e+9)|0]|0;c[n+(B*36&-1)+32>>2]=D;if((c[p>>2]|0)<=(C|0)){E=407;break}F=(c[q>>2]|0)+(C<<3)|0;G=+g[F>>2];H=+g[F+4>>2];if((c[r>>2]|0)<=(D|0)){E=409;break}F=(c[s>>2]|0)+(D<<3)|0;I=+g[F>>2];J=+g[F+4>>2];K=+g[t>>2];L=+g[u>>2];M=+g[v>>2]+(G*K-H*L);F=n+(B*36&-1)|0;N=+(H*K+G*L+ +g[w>>2]);g[F>>2]=M;g[F+4>>2]=N;N=+g[x>>2];L=+g[y>>2];G=+g[z>>2]+(I*N-J*L);F=n+(B*36&-1)+8|0;K=+(J*N+I*L+ +g[A>>2]);g[F>>2]=G;g[F+4>>2]=K;F=n+(B*36&-1)+16|0;K=+(+g[n+(B*36&-1)+12>>2]- +g[n+(B*36&-1)+4>>2]);g[F>>2]=G-M;g[F+4>>2]=K;g[n+(B*36&-1)+24>>2]=0.0;F=B+1|0;D=c[m>>2]|0;if((F|0)<(D|0)){B=F}else{o=D;break L542}}if((E|0)==407){bc(7536,103,13816,6368)}else if((E|0)==409){bc(7536,103,13816,6368)}}}while(0);do{if((o|0)>1){K=+g[e>>2];if((o|0)==2){M=+g[a+16>>2]- +g[a+52>>2];G=+g[a+20>>2]- +g[a+56>>2];O=+P(+(M*M+G*G))}else if((o|0)==3){G=+g[a+16>>2];M=+g[a+20>>2];O=(+g[a+52>>2]-G)*(+g[a+92>>2]-M)-(+g[a+56>>2]-M)*(+g[a+88>>2]-G)}else{bc(5304,259,13504,11592)}if(O>=K*.5){if(!(K*2.0<O|O<1.1920928955078125e-7)){E=419;break}}c[m>>2]=0}else{E=419}}while(0);do{if((E|0)==419){if((o|0)==0){break}return}}while(0);c[a+28>>2]=0;c[a+32>>2]=0;if((c[f+20>>2]|0)<=0){bc(7536,103,13816,6368)}o=c[f+16>>2]|0;O=+g[o>>2];K=+g[o+4>>2];if((c[i+20>>2]|0)<=0){bc(7536,103,13816,6368)}o=c[i+16>>2]|0;G=+g[o>>2];M=+g[o+4>>2];L=+g[h+12>>2];I=+g[h+8>>2];N=+g[h>>2]+(O*L-K*I);J=K*L+O*I+ +g[h+4>>2];h=a;I=+J;g[h>>2]=N;g[h+4>>2]=I;I=+g[j+12>>2];O=+g[j+8>>2];L=+g[j>>2]+(G*I-M*O);K=M*I+G*O+ +g[j+4>>2];j=a+8|0;O=+K;g[j>>2]=L;g[j+4>>2]=O;j=a+16|0;O=+(K-J);g[j>>2]=L-N;g[j+4>>2]=O;c[m>>2]=1;return}function ci(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0;e=c[a+108>>2]|0;if((e|0)==0){bc(5304,217,13544,11592)}else if((e|0)==1){f=a;h=b;i=c[f+4>>2]|0;c[h>>2]=c[f>>2];c[h+4>>2]=i;i=a+8|0;h=d;f=c[i+4>>2]|0;c[h>>2]=c[i>>2];c[h+4>>2]=f;return}else if((e|0)==2){f=a+24|0;j=+g[f>>2];h=a+60|0;k=+g[h>>2];i=b;l=+(j*+g[a+4>>2]+k*+g[a+40>>2]);g[i>>2]=j*+g[a>>2]+k*+g[a+36>>2];g[i+4>>2]=l;l=+g[f>>2];k=+g[h>>2];h=d;j=+(l*+g[a+12>>2]+k*+g[a+48>>2]);g[h>>2]=l*+g[a+8>>2]+k*+g[a+44>>2];g[h+4>>2]=j;return}else if((e|0)==3){j=+g[a+24>>2];k=+g[a+60>>2];l=+g[a+96>>2];e=b;m=+(j*+g[a>>2]+k*+g[a+36>>2]+l*+g[a+72>>2]);n=+(j*+g[a+4>>2]+k*+g[a+40>>2]+l*+g[a+76>>2]);g[e>>2]=m;g[e+4>>2]=n;e=d;g[e>>2]=m;g[e+4>>2]=n;return}else{bc(5304,236,13544,11592)}}function cj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;b=a+16|0;d=c[b>>2]|0;if((d|0)==-1){e=a+8|0;f=c[e>>2]|0;g=a+12|0;if((f|0)!=(c[g>>2]|0)){bc(11392,61,18232,12440);return 0}h=a+4|0;i=c[h>>2]|0;c[g>>2]=f<<1;j=vh(f*72&-1)|0;c[h>>2]=j;f=i;vp(j|0,f|0,(c[e>>2]|0)*36&-1);vi(f);f=c[e>>2]|0;j=(c[g>>2]|0)-1|0;if((f|0)<(j|0)){i=f;while(1){f=i+1|0;c[(c[h>>2]|0)+(i*36&-1)+20>>2]=f;c[(c[h>>2]|0)+(i*36&-1)+32>>2]=-1;k=(c[g>>2]|0)-1|0;if((f|0)<(k|0)){i=f}else{l=k;break}}}else{l=j}c[(c[h>>2]|0)+(l*36&-1)+20>>2]=-1;c[(c[h>>2]|0)+(((c[g>>2]|0)-1|0)*36&-1)+32>>2]=-1;g=c[e>>2]|0;c[b>>2]=g;m=g;n=h;o=e}else{m=d;n=a+4|0;o=a+8|0}a=(c[n>>2]|0)+(m*36&-1)+20|0;c[b>>2]=c[a>>2];c[a>>2]=-1;c[(c[n>>2]|0)+(m*36&-1)+24>>2]=-1;c[(c[n>>2]|0)+(m*36&-1)+28>>2]=-1;c[(c[n>>2]|0)+(m*36&-1)+32>>2]=0;c[(c[n>>2]|0)+(m*36&-1)+16>>2]=0;c[o>>2]=(c[o>>2]|0)+1;return m|0}function ck(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0,F=0,G=0;d=a+24|0;c[d>>2]=(c[d>>2]|0)+1;d=a|0;e=c[d>>2]|0;if((e|0)==-1){c[d>>2]=b;c[(c[a+4>>2]|0)+(b*36&-1)+20>>2]=-1;return}f=a+4|0;h=c[f>>2]|0;i=+g[h+(b*36&-1)>>2];j=+g[h+(b*36&-1)+4>>2];k=+g[h+(b*36&-1)+8>>2];l=+g[h+(b*36&-1)+12>>2];m=c[h+(e*36&-1)+24>>2]|0;L600:do{if((m|0)==-1){n=e}else{o=e;p=m;while(1){q=c[h+(o*36&-1)+28>>2]|0;r=+g[h+(o*36&-1)+8>>2];s=+g[h+(o*36&-1)>>2];t=+g[h+(o*36&-1)+12>>2];u=+g[h+(o*36&-1)+4>>2];v=((r>k?r:k)-(s<i?s:i)+((t>l?t:l)-(u<j?u:j)))*2.0;w=v*2.0;x=(v-(r-s+(t-u))*2.0)*2.0;u=+g[h+(p*36&-1)>>2];t=i<u?i:u;s=+g[h+(p*36&-1)+4>>2];r=j<s?j:s;v=+g[h+(p*36&-1)+8>>2];y=k>v?k:v;z=+g[h+(p*36&-1)+12>>2];A=l>z?l:z;if((c[h+(p*36&-1)+24>>2]|0)==-1){B=(y-t+(A-r))*2.0}else{B=(y-t+(A-r))*2.0-(v-u+(z-s))*2.0}s=x+B;z=+g[h+(q*36&-1)>>2];u=i<z?i:z;v=+g[h+(q*36&-1)+4>>2];r=j<v?j:v;A=+g[h+(q*36&-1)+8>>2];t=k>A?k:A;y=+g[h+(q*36&-1)+12>>2];C=l>y?l:y;if((c[h+(q*36&-1)+24>>2]|0)==-1){D=(t-u+(C-r))*2.0}else{D=(t-u+(C-r))*2.0-(A-z+(y-v))*2.0}v=x+D;if(w<s&w<v){n=o;break L600}E=s<v?p:q;q=c[h+(E*36&-1)+24>>2]|0;if((q|0)==-1){n=E;break}else{o=E;p=q}}}}while(0);m=c[h+(n*36&-1)+20>>2]|0;h=cj(a)|0;c[(c[f>>2]|0)+(h*36&-1)+20>>2]=m;c[(c[f>>2]|0)+(h*36&-1)+16>>2]=0;e=c[f>>2]|0;D=+g[e+(n*36&-1)>>2];B=+g[e+(n*36&-1)+4>>2];p=e+(h*36&-1)|0;v=+(j<B?j:B);g[p>>2]=i<D?i:D;g[p+4>>2]=v;v=+g[e+(n*36&-1)+8>>2];D=+g[e+(n*36&-1)+12>>2];p=e+(h*36&-1)+8|0;i=+(l>D?l:D);g[p>>2]=k>v?k:v;g[p+4>>2]=i;p=c[f>>2]|0;c[p+(h*36&-1)+32>>2]=(c[p+(n*36&-1)+32>>2]|0)+1;p=c[f>>2]|0;if((m|0)==-1){c[p+(h*36&-1)+24>>2]=n;c[(c[f>>2]|0)+(h*36&-1)+28>>2]=b;c[(c[f>>2]|0)+(n*36&-1)+20>>2]=h;c[(c[f>>2]|0)+(b*36&-1)+20>>2]=h;c[d>>2]=h}else{d=p+(m*36&-1)+24|0;if((c[d>>2]|0)==(n|0)){c[d>>2]=h}else{c[p+(m*36&-1)+28>>2]=h}c[(c[f>>2]|0)+(h*36&-1)+24>>2]=n;c[(c[f>>2]|0)+(h*36&-1)+28>>2]=b;c[(c[f>>2]|0)+(n*36&-1)+20>>2]=h;c[(c[f>>2]|0)+(b*36&-1)+20>>2]=h}h=c[(c[f>>2]|0)+(b*36&-1)+20>>2]|0;if((h|0)==-1){return}else{F=h}while(1){h=co(a,F)|0;b=c[f>>2]|0;n=c[b+(h*36&-1)+24>>2]|0;m=c[b+(h*36&-1)+28>>2]|0;if((n|0)==-1){G=465;break}if((m|0)==-1){G=467;break}p=c[b+(n*36&-1)+32>>2]|0;d=c[b+(m*36&-1)+32>>2]|0;c[b+(h*36&-1)+32>>2]=((p|0)>(d|0)?p:d)+1;d=c[f>>2]|0;i=+g[d+(n*36&-1)>>2];v=+g[d+(m*36&-1)>>2];k=+g[d+(n*36&-1)+4>>2];D=+g[d+(m*36&-1)+4>>2];p=d+(h*36&-1)|0;l=+(k<D?k:D);g[p>>2]=i<v?i:v;g[p+4>>2]=l;l=+g[d+(n*36&-1)+8>>2];v=+g[d+(m*36&-1)+8>>2];i=+g[d+(n*36&-1)+12>>2];D=+g[d+(m*36&-1)+12>>2];m=d+(h*36&-1)+8|0;k=+(i>D?i:D);g[m>>2]=l>v?l:v;g[m+4>>2]=k;m=c[(c[f>>2]|0)+(h*36&-1)+20>>2]|0;if((m|0)==-1){G=472;break}else{F=m}}if((G|0)==465){bc(11392,307,18272,5200)}else if((G|0)==467){bc(11392,308,18272,4936)}else if((G|0)==472){return}}function cl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;if((b|0)<=-1){bc(11392,126,18192,9904)}d=a+12|0;if((c[d>>2]|0)<=(b|0)){bc(11392,126,18192,9904)}e=a+4|0;if((c[(c[e>>2]|0)+(b*36&-1)+24>>2]|0)!=-1){bc(11392,127,18192,5720)}cm(a,b);if((c[d>>2]|0)<=(b|0)){bc(11392,97,18112,9768)}d=a+8|0;if((c[d>>2]|0)>0){f=a+16|0;c[(c[e>>2]|0)+(b*36&-1)+20>>2]=c[f>>2];c[(c[e>>2]|0)+(b*36&-1)+32>>2]=-1;c[f>>2]=b;c[d>>2]=(c[d>>2]|0)-1;return}else{bc(11392,98,18112,7256)}}function cm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0;d=a|0;if((c[d>>2]|0)==(b|0)){c[d>>2]=-1;return}e=a+4|0;f=c[e>>2]|0;h=c[f+(b*36&-1)+20>>2]|0;i=c[f+(h*36&-1)+20>>2]|0;j=c[f+(h*36&-1)+24>>2]|0;if((j|0)==(b|0)){k=c[f+(h*36&-1)+28>>2]|0}else{k=j}if((i|0)==-1){c[d>>2]=k;c[f+(k*36&-1)+20>>2]=-1;if((h|0)<=-1){bc(11392,97,18112,9768)}if((c[a+12>>2]|0)<=(h|0)){bc(11392,97,18112,9768)}d=a+8|0;if((c[d>>2]|0)<=0){bc(11392,98,18112,7256)}j=a+16|0;c[(c[e>>2]|0)+(h*36&-1)+20>>2]=c[j>>2];c[(c[e>>2]|0)+(h*36&-1)+32>>2]=-1;c[j>>2]=h;c[d>>2]=(c[d>>2]|0)-1;return}d=f+(i*36&-1)+24|0;if((c[d>>2]|0)==(h|0)){c[d>>2]=k}else{c[f+(i*36&-1)+28>>2]=k}c[(c[e>>2]|0)+(k*36&-1)+20>>2]=i;if((h|0)<=-1){bc(11392,97,18112,9768)}if((c[a+12>>2]|0)<=(h|0)){bc(11392,97,18112,9768)}k=a+8|0;if((c[k>>2]|0)<=0){bc(11392,98,18112,7256)}f=a+16|0;c[(c[e>>2]|0)+(h*36&-1)+20>>2]=c[f>>2];c[(c[e>>2]|0)+(h*36&-1)+32>>2]=-1;c[f>>2]=h;c[k>>2]=(c[k>>2]|0)-1;k=i;do{i=co(a,k)|0;h=c[e>>2]|0;f=c[h+(i*36&-1)+24>>2]|0;d=c[h+(i*36&-1)+28>>2]|0;l=+g[h+(f*36&-1)>>2];m=+g[h+(d*36&-1)>>2];n=+g[h+(f*36&-1)+4>>2];o=+g[h+(d*36&-1)+4>>2];j=h+(i*36&-1)|0;p=+(n<o?n:o);g[j>>2]=l<m?l:m;g[j+4>>2]=p;p=+g[h+(f*36&-1)+8>>2];m=+g[h+(d*36&-1)+8>>2];l=+g[h+(f*36&-1)+12>>2];o=+g[h+(d*36&-1)+12>>2];j=h+(i*36&-1)+8|0;n=+(l>o?l:o);g[j>>2]=p>m?p:m;g[j+4>>2]=n;j=c[e>>2]|0;h=c[j+(f*36&-1)+32>>2]|0;f=c[j+(d*36&-1)+32>>2]|0;c[j+(i*36&-1)+32>>2]=((h|0)>(f|0)?h:f)+1;k=c[(c[e>>2]|0)+(i*36&-1)+20>>2]|0;}while((k|0)!=-1);return}function cn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;if((b|0)<=-1){bc(11392,135,18040,9904);return 0}if((c[a+12>>2]|0)<=(b|0)){bc(11392,135,18040,9904);return 0}f=a+4|0;h=c[f>>2]|0;if((c[h+(b*36&-1)+24>>2]|0)!=-1){bc(11392,137,18040,5720);return 0}do{if(+g[h+(b*36&-1)>>2]<=+g[d>>2]){if(+g[h+(b*36&-1)+4>>2]>+g[d+4>>2]){break}if(+g[d+8>>2]>+g[h+(b*36&-1)+8>>2]){break}if(+g[d+12>>2]>+g[h+(b*36&-1)+12>>2]){break}else{i=0}return i|0}}while(0);cm(a,b);h=d;j=d+8|0;k=+g[h>>2]+-.10000000149011612;l=+g[h+4>>2]+-.10000000149011612;m=+g[j>>2]+.10000000149011612;n=+g[j+4>>2]+.10000000149011612;o=+g[e>>2]*2.0;p=+g[e+4>>2]*2.0;if(o<0.0){q=m;r=k+o}else{q=o+m;r=k}if(p<0.0){s=n;t=l+p}else{s=p+n;t=l}e=c[f>>2]|0;f=e+(b*36&-1)|0;l=+t;g[f>>2]=r;g[f+4>>2]=l;f=e+(b*36&-1)+8|0;l=+s;g[f>>2]=q;g[f+4>>2]=l;ck(a,b);i=1;return i|0}function co(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0,I=0,J=0,K=0;if((b|0)==-1){bc(11392,382,18152,4672);return 0}d=a+4|0;e=c[d>>2]|0;f=e+(b*36&-1)|0;h=e+(b*36&-1)+24|0;i=c[h>>2]|0;if((i|0)==-1){j=b;return j|0}k=e+(b*36&-1)+32|0;if((c[k>>2]|0)<2){j=b;return j|0}l=e+(b*36&-1)+28|0;m=c[l>>2]|0;if((i|0)<=-1){bc(11392,392,18152,4432);return 0}n=c[a+12>>2]|0;if((i|0)>=(n|0)){bc(11392,392,18152,4432);return 0}if(!((m|0)>-1&(m|0)<(n|0))){bc(11392,393,18152,12936);return 0}o=e+(i*36&-1)|0;p=e+(m*36&-1)|0;q=e+(m*36&-1)+32|0;r=e+(i*36&-1)+32|0;s=(c[q>>2]|0)-(c[r>>2]|0)|0;if((s|0)>1){t=e+(m*36&-1)+24|0;u=c[t>>2]|0;v=e+(m*36&-1)+28|0;w=c[v>>2]|0;x=e+(u*36&-1)|0;y=e+(w*36&-1)|0;if(!((u|0)>-1&(u|0)<(n|0))){bc(11392,407,18152,12728);return 0}if(!((w|0)>-1&(w|0)<(n|0))){bc(11392,408,18152,12328);return 0}c[t>>2]=b;t=e+(b*36&-1)+20|0;z=e+(m*36&-1)+20|0;c[z>>2]=c[t>>2];c[t>>2]=m;t=c[z>>2]|0;do{if((t|0)==-1){c[a>>2]=m}else{z=c[d>>2]|0;A=z+(t*36&-1)+24|0;if((c[A>>2]|0)==(b|0)){c[A>>2]=m;break}A=z+(t*36&-1)+28|0;if((c[A>>2]|0)==(b|0)){c[A>>2]=m;break}else{bc(11392,424,18152,11552);return 0}}}while(0);t=e+(u*36&-1)+32|0;A=e+(w*36&-1)+32|0;if((c[t>>2]|0)>(c[A>>2]|0)){c[v>>2]=u;c[l>>2]=w;c[e+(w*36&-1)+20>>2]=b;B=+g[o>>2];C=+g[y>>2];D=B<C?B:C;C=+g[e+(i*36&-1)+4>>2];B=+g[e+(w*36&-1)+4>>2];z=f;E=+(C<B?C:B);g[z>>2]=D;g[z+4>>2]=E;E=+g[e+(i*36&-1)+8>>2];B=+g[e+(w*36&-1)+8>>2];C=+g[e+(i*36&-1)+12>>2];F=+g[e+(w*36&-1)+12>>2];z=e+(b*36&-1)+8|0;G=+(C>F?C:F);g[z>>2]=E>B?E:B;g[z+4>>2]=G;G=+g[x>>2];B=+g[e+(b*36&-1)+4>>2];E=+g[e+(u*36&-1)+4>>2];z=p;F=+(B<E?B:E);g[z>>2]=D<G?D:G;g[z+4>>2]=F;F=+g[e+(b*36&-1)+8>>2];G=+g[e+(u*36&-1)+8>>2];D=+g[e+(b*36&-1)+12>>2];E=+g[e+(u*36&-1)+12>>2];z=e+(m*36&-1)+8|0;B=+(D>E?D:E);g[z>>2]=F>G?F:G;g[z+4>>2]=B;z=c[r>>2]|0;H=c[A>>2]|0;I=((z|0)>(H|0)?z:H)+1|0;c[k>>2]=I;H=c[t>>2]|0;J=(I|0)>(H|0)?I:H}else{c[v>>2]=w;c[l>>2]=u;c[e+(u*36&-1)+20>>2]=b;B=+g[o>>2];G=+g[x>>2];F=B<G?B:G;G=+g[e+(i*36&-1)+4>>2];B=+g[e+(u*36&-1)+4>>2];x=f;E=+(G<B?G:B);g[x>>2]=F;g[x+4>>2]=E;E=+g[e+(i*36&-1)+8>>2];B=+g[e+(u*36&-1)+8>>2];G=+g[e+(i*36&-1)+12>>2];D=+g[e+(u*36&-1)+12>>2];u=e+(b*36&-1)+8|0;C=+(G>D?G:D);g[u>>2]=E>B?E:B;g[u+4>>2]=C;C=+g[y>>2];B=+g[e+(b*36&-1)+4>>2];E=+g[e+(w*36&-1)+4>>2];y=p;D=+(B<E?B:E);g[y>>2]=F<C?F:C;g[y+4>>2]=D;D=+g[e+(b*36&-1)+8>>2];C=+g[e+(w*36&-1)+8>>2];F=+g[e+(b*36&-1)+12>>2];E=+g[e+(w*36&-1)+12>>2];w=e+(m*36&-1)+8|0;B=+(F>E?F:E);g[w>>2]=D>C?D:C;g[w+4>>2]=B;w=c[r>>2]|0;y=c[t>>2]|0;t=((w|0)>(y|0)?w:y)+1|0;c[k>>2]=t;y=c[A>>2]|0;J=(t|0)>(y|0)?t:y}c[q>>2]=J+1;j=m;return j|0}if((s|0)>=-1){j=b;return j|0}s=e+(i*36&-1)+24|0;J=c[s>>2]|0;y=e+(i*36&-1)+28|0;t=c[y>>2]|0;A=e+(J*36&-1)|0;w=e+(t*36&-1)|0;if(!((J|0)>-1&(J|0)<(n|0))){bc(11392,467,18152,11296);return 0}if(!((t|0)>-1&(t|0)<(n|0))){bc(11392,468,18152,11200);return 0}c[s>>2]=b;s=e+(b*36&-1)+20|0;n=e+(i*36&-1)+20|0;c[n>>2]=c[s>>2];c[s>>2]=i;s=c[n>>2]|0;do{if((s|0)==-1){c[a>>2]=i}else{n=c[d>>2]|0;u=n+(s*36&-1)+24|0;if((c[u>>2]|0)==(b|0)){c[u>>2]=i;break}u=n+(s*36&-1)+28|0;if((c[u>>2]|0)==(b|0)){c[u>>2]=i;break}else{bc(11392,484,18152,11e3);return 0}}}while(0);s=e+(J*36&-1)+32|0;d=e+(t*36&-1)+32|0;if((c[s>>2]|0)>(c[d>>2]|0)){c[y>>2]=J;c[h>>2]=t;c[e+(t*36&-1)+20>>2]=b;B=+g[p>>2];C=+g[w>>2];D=B<C?B:C;C=+g[e+(m*36&-1)+4>>2];B=+g[e+(t*36&-1)+4>>2];a=f;E=+(C<B?C:B);g[a>>2]=D;g[a+4>>2]=E;E=+g[e+(m*36&-1)+8>>2];B=+g[e+(t*36&-1)+8>>2];C=+g[e+(m*36&-1)+12>>2];F=+g[e+(t*36&-1)+12>>2];a=e+(b*36&-1)+8|0;G=+(C>F?C:F);g[a>>2]=E>B?E:B;g[a+4>>2]=G;G=+g[A>>2];B=+g[e+(b*36&-1)+4>>2];E=+g[e+(J*36&-1)+4>>2];a=o;F=+(B<E?B:E);g[a>>2]=D<G?D:G;g[a+4>>2]=F;F=+g[e+(b*36&-1)+8>>2];G=+g[e+(J*36&-1)+8>>2];D=+g[e+(b*36&-1)+12>>2];E=+g[e+(J*36&-1)+12>>2];a=e+(i*36&-1)+8|0;B=+(D>E?D:E);g[a>>2]=F>G?F:G;g[a+4>>2]=B;a=c[q>>2]|0;u=c[d>>2]|0;n=((a|0)>(u|0)?a:u)+1|0;c[k>>2]=n;u=c[s>>2]|0;K=(n|0)>(u|0)?n:u}else{c[y>>2]=t;c[h>>2]=J;c[e+(J*36&-1)+20>>2]=b;B=+g[p>>2];G=+g[A>>2];F=B<G?B:G;G=+g[e+(m*36&-1)+4>>2];B=+g[e+(J*36&-1)+4>>2];A=f;E=+(G<B?G:B);g[A>>2]=F;g[A+4>>2]=E;E=+g[e+(m*36&-1)+8>>2];B=+g[e+(J*36&-1)+8>>2];G=+g[e+(m*36&-1)+12>>2];D=+g[e+(J*36&-1)+12>>2];J=e+(b*36&-1)+8|0;C=+(G>D?G:D);g[J>>2]=E>B?E:B;g[J+4>>2]=C;C=+g[w>>2];B=+g[e+(b*36&-1)+4>>2];E=+g[e+(t*36&-1)+4>>2];w=o;D=+(B<E?B:E);g[w>>2]=F<C?F:C;g[w+4>>2]=D;D=+g[e+(b*36&-1)+8>>2];C=+g[e+(t*36&-1)+8>>2];F=+g[e+(b*36&-1)+12>>2];E=+g[e+(t*36&-1)+12>>2];t=e+(i*36&-1)+8|0;B=+(F>E?F:E);g[t>>2]=D>C?D:C;g[t+4>>2]=B;t=c[q>>2]|0;q=c[s>>2]|0;s=((t|0)>(q|0)?t:q)+1|0;c[k>>2]=s;k=c[d>>2]|0;K=(s|0)>(k|0)?s:k}c[r>>2]=K+1;j=i;return j|0}function cp(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;if((b|0)<=-1){bc(11392,563,14360,9768);return 0}if((c[a+12>>2]|0)<=(b|0)){bc(11392,563,14360,9768);return 0}d=c[a+4>>2]|0;e=c[d+(b*36&-1)+24>>2]|0;if((e|0)==-1){return 0}else{f=cp(a,e)|0;e=cp(a,c[d+(b*36&-1)+28>>2]|0)|0;return((f|0)>(e|0)?f:e)+1|0}return 0}function cq(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;if((b|0)==-1){return}d=a|0;e=a+4|0;f=a+12|0;g=b;while(1){h=c[e>>2]|0;if((c[d>>2]|0)==(g|0)){if((c[h+(g*36&-1)+20>>2]|0)!=-1){i=596;break}}b=c[h+(g*36&-1)+24>>2]|0;j=c[h+(g*36&-1)+28>>2]|0;if((b|0)==-1){i=598;break}if((b|0)<=-1){i=617;break}k=c[f>>2]|0;if((b|0)>=(k|0)){i=616;break}if(!((j|0)>-1&(j|0)<(k|0))){i=606;break}if((c[h+(b*36&-1)+20>>2]|0)!=(g|0)){i=608;break}if((c[h+(j*36&-1)+20>>2]|0)!=(g|0)){i=610;break}cq(a,b);if((j|0)==-1){i=614;break}else{g=j}}if((i|0)==598){if((j|0)!=-1){bc(11392,602,14200,10448)}if((c[h+(g*36&-1)+32>>2]|0)==0){return}else{bc(11392,603,14200,10240)}}else if((i|0)==596){bc(11392,591,14200,10680)}else if((i|0)==617){bc(11392,607,14200,10024)}else if((i|0)==608){bc(11392,610,14200,9296)}else if((i|0)==606){bc(11392,608,14200,9600)}else if((i|0)==614){return}else if((i|0)==616){bc(11392,607,14200,10024)}else if((i|0)==610){bc(11392,611,14200,8896)}}function cr(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;if((b|0)==-1){return}d=a+4|0;e=a+12|0;f=b;while(1){h=c[d>>2]|0;b=c[h+(f*36&-1)+24>>2]|0;i=c[h+(f*36&-1)+28>>2]|0;if((b|0)==-1){j=621;break}if((b|0)<=-1){j=642;break}k=c[e>>2]|0;if((b|0)>=(k|0)){j=643;break}if(!((i|0)>-1&(i|0)<(k|0))){j=629;break}k=c[h+(b*36&-1)+32>>2]|0;l=c[h+(i*36&-1)+32>>2]|0;if((c[h+(f*36&-1)+32>>2]|0)!=(((k|0)>(l|0)?k:l)+1|0)){j=631;break}m=+g[h+(b*36&-1)>>2];n=+g[h+(i*36&-1)>>2];o=+g[h+(b*36&-1)+4>>2];p=+g[h+(i*36&-1)+4>>2];q=+g[h+(b*36&-1)+8>>2];r=+g[h+(i*36&-1)+8>>2];s=+g[h+(b*36&-1)+12>>2];t=+g[h+(i*36&-1)+12>>2];if((m<n?m:n)!=+g[h+(f*36&-1)>>2]){j=647;break}if((o<p?o:p)!=+g[h+(f*36&-1)+4>>2]){j=648;break}if((q>r?q:r)!=+g[h+(f*36&-1)+8>>2]){j=641;break}if((s>t?s:t)!=+g[h+(f*36&-1)+12>>2]){j=640;break}cr(a,b);if((i|0)==-1){j=646;break}else{f=i}}if((j|0)==642){bc(11392,637,14256,10024)}else if((j|0)==621){if((i|0)!=-1){bc(11392,632,14256,10448)}if((c[h+(f*36&-1)+32>>2]|0)==0){return}else{bc(11392,633,14256,10240)}}else if((j|0)==640){bc(11392,650,14256,8160)}else if((j|0)==629){bc(11392,638,14256,9600)}else if((j|0)==631){bc(11392,644,14256,8744)}else if((j|0)==641){bc(11392,650,14256,8160)}else if((j|0)==648){bc(11392,649,14256,8392)}else if((j|0)==643){bc(11392,637,14256,10024)}else if((j|0)==646){return}else if((j|0)==647){bc(11392,649,14256,8392)}}function cs(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;b=a|0;cq(a,c[b>>2]|0);cr(a,c[b>>2]|0);d=c[a+16>>2]|0;L849:do{if((d|0)==-1){e=0}else{f=a+12|0;g=a+4|0;h=0;i=d;while(1){if((i|0)<=-1){j=662;break}if((i|0)>=(c[f>>2]|0)){j=663;break}k=h+1|0;l=c[(c[g>>2]|0)+(i*36&-1)+20>>2]|0;if((l|0)==-1){e=k;break L849}else{h=k;i=l}}if((j|0)==662){bc(11392,665,14064,7712)}else if((j|0)==663){bc(11392,665,14064,7712)}}}while(0);j=c[b>>2]|0;if((j|0)==-1){m=0}else{m=c[(c[a+4>>2]|0)+(j*36&-1)+32>>2]|0}if((m|0)!=(cp(a,j)|0)){bc(11392,670,14064,7680)}if(((c[a+8>>2]|0)+e|0)==(c[a+12>>2]|0)){return}else{bc(11392,672,14064,7488)}}function ct(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0,w=0,x=0,y=0.0,z=0,A=0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0,H=0,I=0,J=0;b=a+8|0;d=vh(c[b>>2]<<2)|0;e=d;f=a+12|0;if((c[f>>2]|0)<=0){h=c[e>>2]|0;i=a|0;c[i>>2]=h;vi(d);cs(a);return}j=a+4|0;k=a+16|0;l=0;m=0;L872:while(1){n=c[j>>2]|0;do{if((c[n+(l*36&-1)+32>>2]|0)<0){o=m}else{if((c[n+(l*36&-1)+24>>2]|0)==-1){c[n+(l*36&-1)+20>>2]=-1;c[e+(m<<2)>>2]=l;o=m+1|0;break}if((c[b>>2]|0)<=0){p=672;break L872}c[n+(l*36&-1)+20>>2]=c[k>>2];c[(c[j>>2]|0)+(l*36&-1)+32>>2]=-1;c[k>>2]=l;c[b>>2]=(c[b>>2]|0)-1;o=m}}while(0);n=l+1|0;if((n|0)<(c[f>>2]|0)){l=n;m=o}else{break}}if((p|0)==672){bc(11392,98,18112,7256)}if((o|0)<=1){h=c[e>>2]|0;i=a|0;c[i>>2]=h;vi(d);cs(a);return}p=a+4|0;m=o;do{o=c[p>>2]|0;l=0;f=-1;b=-1;q=3.4028234663852886e+38;while(1){k=c[e+(l<<2)>>2]|0;r=+g[o+(k*36&-1)>>2];s=+g[o+(k*36&-1)+4>>2];t=+g[o+(k*36&-1)+8>>2];u=+g[o+(k*36&-1)+12>>2];k=l+1|0;j=(k|0)<(m|0);if(j){v=k;w=f;x=b;y=q}else{z=b;A=f;break}do{n=c[e+(v<<2)>>2]|0;B=+g[o+(n*36&-1)>>2];C=+g[o+(n*36&-1)+4>>2];D=+g[o+(n*36&-1)+8>>2];E=+g[o+(n*36&-1)+12>>2];F=((t>D?t:D)-(r<B?r:B)+((u>E?u:E)-(s<C?s:C)))*2.0;n=F<y;w=n?v:w;x=n?l:x;y=n?F:y;v=v+1|0;}while((v|0)<(m|0));if(j){l=k;f=w;b=x;q=y}else{z=x;A=w;break}}b=e+(z<<2)|0;f=c[b>>2]|0;l=e+(A<<2)|0;n=c[l>>2]|0;G=cj(a)|0;H=c[p>>2]|0;c[H+(G*36&-1)+24>>2]=f;c[H+(G*36&-1)+28>>2]=n;I=c[o+(f*36&-1)+32>>2]|0;J=c[o+(n*36&-1)+32>>2]|0;c[H+(G*36&-1)+32>>2]=((I|0)>(J|0)?I:J)+1;q=+g[o+(f*36&-1)>>2];s=+g[o+(n*36&-1)>>2];u=+g[o+(f*36&-1)+4>>2];r=+g[o+(n*36&-1)+4>>2];J=H+(G*36&-1)|0;t=+(u<r?u:r);g[J>>2]=q<s?q:s;g[J+4>>2]=t;t=+g[o+(f*36&-1)+8>>2];s=+g[o+(n*36&-1)+8>>2];q=+g[o+(f*36&-1)+12>>2];r=+g[o+(n*36&-1)+12>>2];J=H+(G*36&-1)+8|0;u=+(q>r?q:r);g[J>>2]=t>s?t:s;g[J+4>>2]=u;c[H+(G*36&-1)+20>>2]=-1;c[o+(f*36&-1)+20>>2]=G;c[o+(n*36&-1)+20>>2]=G;m=m-1|0;c[l>>2]=c[e+(m<<2)>>2];c[b>>2]=G;}while((m|0)>1);h=c[e>>2]|0;i=a|0;c[i>>2]=h;vi(d);cs(a);return}function cu(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0,z=0,A=0.0,B=0.0,C=0,D=0.0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,O=0,P=0,Q=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0.0,_=0.0,$=0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0,ao=0,ap=0.0,aq=0,ar=0,as=0.0,at=0.0,au=0,av=0.0,aw=0.0,ax=0.0,ay=0.0,az=0,aA=0.0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;f=i;i=i+336|0;h=f|0;j=f+40|0;k=f+80|0;l=f+96|0;m=f+192|0;n=f+216|0;o=f+320|0;p=f+328|0;c[1038]=(c[1038]|0)+1;q=d|0;c[q>>2]=0;r=e+128|0;s=d+4|0;g[s>>2]=+g[r>>2];d=e|0;t=e+28|0;vp(h|0,e+56|0,36);vp(j|0,e+92|0,36);u=h+24|0;v=+g[u>>2];w=+N(+(v/6.2831854820251465))*6.2831854820251465;x=v-w;g[u>>2]=x;y=h+28|0;v=+g[y>>2]-w;g[y>>2]=v;z=j+24|0;w=+g[z>>2];A=+N(+(w/6.2831854820251465))*6.2831854820251465;B=w-A;g[z>>2]=B;C=j+28|0;w=+g[C>>2]-A;g[C>>2]=w;A=+g[r>>2];D=+g[e+24>>2]+ +g[e+52>>2]+-.014999999664723873;E=D<.004999999888241291?.004999999888241291:D;if(E<=.0012499999720603228){bc(6688,280,19104,11456)}b[k+4>>1]=0;r=l;F=e;c[r>>2]=c[F>>2];c[r+4>>2]=c[F+4>>2];c[r+8>>2]=c[F+8>>2];c[r+12>>2]=c[F+12>>2];c[r+16>>2]=c[F+16>>2];c[r+20>>2]=c[F+20>>2];c[r+24>>2]=c[F+24>>2];F=l+28|0;r=t;c[F>>2]=c[r>>2];c[F+4>>2]=c[r+4>>2];c[F+8>>2]=c[r+8>>2];c[F+12>>2]=c[r+12>>2];c[F+16>>2]=c[r+16>>2];c[F+20>>2]=c[r+20>>2];c[F+24>>2]=c[r+24>>2];a[l+88|0]=0;r=h+8|0;F=h+12|0;e=h+16|0;G=h+20|0;H=h|0;I=h+4|0;J=j+8|0;K=j+12|0;L=j+16|0;M=j+20|0;O=j|0;P=j+4|0;Q=l+56|0;T=l+64|0;U=l+68|0;V=l+72|0;W=l+80|0;X=l+84|0;Y=m+16|0;D=E+.0012499999720603228;Z=E+-.0012499999720603228;_=0.0;$=0;aa=x;x=v;v=B;B=w;L900:while(1){w=1.0-_;ab=w*+g[r>>2]+_*+g[e>>2];ac=w*+g[F>>2]+_*+g[G>>2];ad=w*aa+_*x;ae=+S(+ad);af=+R(+ad);ad=+g[H>>2];ag=+g[I>>2];ah=w*+g[J>>2]+_*+g[L>>2];ai=w*+g[K>>2]+_*+g[M>>2];aj=w*v+_*B;w=+S(+aj);ak=+R(+aj);aj=+g[O>>2];al=+g[P>>2];am=+(ac-(ae*ad+af*ag));g[Q>>2]=ab-(af*ad-ae*ag);g[Q+4>>2]=am;g[T>>2]=ae;g[U>>2]=af;af=+(ai-(w*aj+ak*al));g[V>>2]=ah-(ak*aj-w*al);g[V+4>>2]=af;g[W>>2]=w;g[X>>2]=ak;cg(m,k,l);ak=+g[Y>>2];if(ak<=0.0){an=688;break}if(ak<D){an=690;break}cv(n,k,d,h,t,j,_);ao=0;ak=A;while(1){w=+cz(n,o,p,ak);if(w>D){an=693;break L900}if(w>Z){ap=ak;break}aq=c[o>>2]|0;ar=c[p>>2]|0;af=+cA(n,aq,ar,_);if(af<Z){an=696;break L900}if(af>D){as=ak;at=_;au=0;av=af;aw=w}else{an=698;break L900}while(1){if((au&1|0)==0){ax=(at+as)*.5}else{ax=at+(E-av)*(as-at)/(aw-av)}w=+cA(n,aq,ar,ax);af=w-E;if(af>0.0){ay=af}else{ay=-0.0-af}if(ay<.0012499999720603228){az=au;aA=ax;break}aB=w>E;aC=au+1|0;c[1030]=(c[1030]|0)+1;if((aC|0)==50){az=50;aA=ak;break}else{as=aB?as:ax;at=aB?ax:at;au=aC;av=aB?w:av;aw=aB?aw:w}}ar=c[1032]|0;c[1032]=(ar|0)>(az|0)?ar:az;ar=ao+1|0;if((ar|0)==8){ap=_;break}else{ao=ar;ak=aA}}ao=$+1|0;c[1036]=(c[1036]|0)+1;if((ao|0)==20){an=710;break}_=ap;$=ao;aa=+g[u>>2];x=+g[y>>2];v=+g[z>>2];B=+g[C>>2]}if((an|0)==693){c[q>>2]=4;g[s>>2]=A}else if((an|0)==696){c[q>>2]=1;g[s>>2]=_}else if((an|0)==710){c[q>>2]=1;g[s>>2]=ap;aD=20;aE=c[1034]|0;aF=(aE|0)>(aD|0);aG=aF?aE:aD;c[1034]=aG;i=f;return}else if((an|0)==688){c[q>>2]=2;g[s>>2]=0.0;aD=$;aE=c[1034]|0;aF=(aE|0)>(aD|0);aG=aF?aE:aD;c[1034]=aG;i=f;return}else if((an|0)==690){c[q>>2]=3;g[s>>2]=_;aD=$;aE=c[1034]|0;aF=(aE|0)>(aD|0);aG=aF?aE:aD;c[1034]=aG;i=f;return}else if((an|0)==698){c[q>>2]=3;g[s>>2]=_}c[1036]=(c[1036]|0)+1;aD=$+1|0;aE=c[1034]|0;aF=(aE|0)>(aD|0);aG=aF?aE:aD;c[1034]=aG;i=f;return}function cv(e,f,h,i,j,k,l){e=e|0;f=f|0;h=h|0;i=i|0;j=j|0;k=k|0;l=+l;var m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0,E=0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0;c[e>>2]=h;c[e+4>>2]=j;m=b[f+4>>1]|0;if(!(m<<16>>16!=0&(m&65535)<3)){bc(6688,50,16840,5584);return 0.0}n=e+8|0;vp(n|0,i|0,36);i=e+44|0;vp(i|0,k|0,36);o=1.0-l;p=o*+g[e+16>>2]+ +g[e+24>>2]*l;q=o*+g[e+20>>2]+ +g[e+28>>2]*l;r=o*+g[e+32>>2]+ +g[e+36>>2]*l;s=+S(+r);t=+R(+r);r=+g[n>>2];u=+g[e+12>>2];v=p-(t*r-s*u);p=q-(s*r+t*u);u=o*+g[e+52>>2]+ +g[e+60>>2]*l;r=o*+g[e+56>>2]+ +g[e+64>>2]*l;q=o*+g[e+68>>2]+ +g[e+72>>2]*l;l=+S(+q);o=+R(+q);q=+g[i>>2];w=+g[e+48>>2];x=u-(o*q-l*w);u=r-(l*q+o*w);if(m<<16>>16==1){c[e+80>>2]=0;m=d[f+6|0]|0;if((c[h+20>>2]|0)<=(m|0)){bc(7536,103,13816,6368);return 0.0}i=(c[h+16>>2]|0)+(m<<3)|0;w=+g[i>>2];q=+g[i+4>>2];i=d[f+9|0]|0;if((c[j+20>>2]|0)<=(i|0)){bc(7536,103,13816,6368);return 0.0}m=(c[j+16>>2]|0)+(i<<3)|0;r=+g[m>>2];y=+g[m+4>>2];m=e+92|0;z=x+(o*r-l*y)-(v+(t*w-s*q));A=u+(l*r+o*y)-(p+(s*w+t*q));i=m;q=+A;g[i>>2]=z;g[i+4>>2]=q;q=+P(+(z*z+A*A));if(q<1.1920928955078125e-7){B=0.0;return+B}w=1.0/q;g[m>>2]=z*w;g[e+96>>2]=A*w;B=q;return+B}m=f+6|0;i=f+7|0;n=e+80|0;if((a[m]|0)==(a[i]|0)){c[n>>2]=2;k=d[f+9|0]|0;C=c[j+20>>2]|0;if((C|0)<=(k|0)){bc(7536,103,13816,6368);return 0.0}D=c[j+16>>2]|0;E=D+(k<<3)|0;q=+g[E>>2];w=+g[E+4>>2];E=d[f+10|0]|0;if((C|0)<=(E|0)){bc(7536,103,13816,6368);return 0.0}C=D+(E<<3)|0;A=+g[C>>2];z=+g[C+4>>2];C=e+92|0;y=z-w;r=(A-q)*-1.0;E=C;F=+r;g[E>>2]=y;g[E+4>>2]=F;F=+P(+(y*y+r*r));if(F<1.1920928955078125e-7){G=y;H=r}else{I=1.0/F;F=y*I;g[C>>2]=F;y=r*I;g[e+96>>2]=y;G=F;H=y}y=(q+A)*.5;A=(w+z)*.5;C=e+84|0;z=+A;g[C>>2]=y;g[C+4>>2]=z;C=d[m]|0;if((c[h+20>>2]|0)<=(C|0)){bc(7536,103,13816,6368);return 0.0}D=(c[h+16>>2]|0)+(C<<3)|0;z=+g[D>>2];w=+g[D+4>>2];q=(o*G-l*H)*(v+(t*z-s*w)-(x+(o*y-l*A)))+(l*G+o*H)*(p+(s*z+t*w)-(u+(l*y+o*A)));if(q>=0.0){B=q;return+B}A=+(-0.0-H);g[E>>2]=-0.0-G;g[E+4>>2]=A;B=-0.0-q;return+B}else{c[n>>2]=1;n=d[m]|0;m=c[h+20>>2]|0;if((m|0)<=(n|0)){bc(7536,103,13816,6368);return 0.0}E=c[h+16>>2]|0;h=E+(n<<3)|0;q=+g[h>>2];A=+g[h+4>>2];h=d[i]|0;if((m|0)<=(h|0)){bc(7536,103,13816,6368);return 0.0}m=E+(h<<3)|0;G=+g[m>>2];H=+g[m+4>>2];m=e+92|0;y=H-A;w=(G-q)*-1.0;h=m;z=+w;g[h>>2]=y;g[h+4>>2]=z;z=+P(+(y*y+w*w));if(z<1.1920928955078125e-7){J=y;K=w}else{F=1.0/z;z=y*F;g[m>>2]=z;y=w*F;g[e+96>>2]=y;J=z;K=y}y=(q+G)*.5;G=(A+H)*.5;m=e+84|0;H=+G;g[m>>2]=y;g[m+4>>2]=H;m=d[f+9|0]|0;if((c[j+20>>2]|0)<=(m|0)){bc(7536,103,13816,6368);return 0.0}f=(c[j+16>>2]|0)+(m<<3)|0;H=+g[f>>2];A=+g[f+4>>2];q=(t*J-s*K)*(x+(o*H-l*A)-(v+(t*y-s*G)))+(s*J+t*K)*(u+(l*H+o*A)-(p+(s*y+t*G)));if(q>=0.0){B=q;return+B}G=+(-0.0-K);g[h>>2]=-0.0-J;g[h+4>>2]=G;B=-0.0-q;return+B}return 0.0}function cw(a){a=a|0;return(c[a+16>>2]|0)-1|0}function cx(a){a=a|0;var b=0;c[a>>2]=20296;b=a+12|0;vi(c[b>>2]|0);c[b>>2]=0;c[a+16>>2]=0;vl(a);return}function cy(a){a=a|0;var b=0;c[a>>2]=20296;b=a+12|0;vi(c[b>>2]|0);c[b>>2]=0;c[a+16>>2]=0;return}function cz(a,b,d,e){a=a|0;b=b|0;d=d|0;e=+e;var f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0,w=0,x=0,y=0,z=0,A=0.0,B=0,C=0,D=0,E=0,F=0.0,G=0,H=0,I=0,J=0,K=0;f=1.0-e;h=f*+g[a+16>>2]+ +g[a+24>>2]*e;i=f*+g[a+20>>2]+ +g[a+28>>2]*e;j=f*+g[a+32>>2]+ +g[a+36>>2]*e;k=+S(+j);l=+R(+j);j=+g[a+8>>2];m=+g[a+12>>2];n=h-(l*j-k*m);h=i-(k*j+l*m);m=f*+g[a+52>>2]+ +g[a+60>>2]*e;j=f*+g[a+56>>2]+ +g[a+64>>2]*e;i=f*+g[a+68>>2]+ +g[a+72>>2]*e;e=+S(+i);f=+R(+i);i=+g[a+44>>2];o=+g[a+48>>2];p=m-(f*i-e*o);m=j-(e*i+f*o);q=c[a+80>>2]|0;if((q|0)==1){o=+g[a+92>>2];i=+g[a+96>>2];j=l*o-k*i;r=k*o+l*i;i=+g[a+84>>2];o=+g[a+88>>2];s=n+(l*i-k*o);t=h+(k*i+l*o);o=-0.0-r;i=f*(-0.0-j)+e*o;u=e*j+f*o;c[b>>2]=-1;v=a+4|0;w=c[v>>2]|0;x=c[w+16>>2]|0;y=c[w+20>>2]|0;do{if((y|0)>1){o=u*+g[x+4>>2]+i*+g[x>>2];w=1;z=0;while(1){A=i*+g[x+(w<<3)>>2]+u*+g[x+(w<<3)+4>>2];B=A>o;C=B?w:z;D=w+1|0;if((D|0)<(y|0)){o=B?A:o;w=D;z=C}else{break}}c[d>>2]=C;if((C|0)>-1){E=C;break}bc(7536,103,13816,6368);return 0.0}else{c[d>>2]=0;E=0}}while(0);C=c[v>>2]|0;if((c[C+20>>2]|0)<=(E|0)){bc(7536,103,13816,6368);return 0.0}v=(c[C+16>>2]|0)+(E<<3)|0;u=+g[v>>2];i=+g[v+4>>2];F=j*(p+(f*u-e*i)-s)+r*(m+(e*u+f*i)-t);return+F}else if((q|0)==0){v=a+92|0;t=+g[v>>2];E=a+96|0;i=+g[E>>2];u=l*t+k*i;r=t*(-0.0-k)+l*i;s=-0.0-i;i=f*(-0.0-t)+e*s;j=e*t+f*s;C=a|0;y=c[C>>2]|0;x=c[y+16>>2]|0;z=c[y+20>>2]|0;if((z|0)>1){s=r*+g[x+4>>2]+u*+g[x>>2];y=1;w=0;while(1){t=u*+g[x+(y<<3)>>2]+r*+g[x+(y<<3)+4>>2];D=t>s;B=D?y:w;G=y+1|0;if((G|0)<(z|0)){s=D?t:s;y=G;w=B}else{H=B;break}}}else{H=0}c[b>>2]=H;H=a+4|0;w=c[H>>2]|0;y=c[w+16>>2]|0;z=c[w+20>>2]|0;if((z|0)>1){s=j*+g[y+4>>2]+i*+g[y>>2];w=1;x=0;while(1){r=i*+g[y+(w<<3)>>2]+j*+g[y+(w<<3)+4>>2];B=r>s;G=B?w:x;D=w+1|0;if((D|0)<(z|0)){s=B?r:s;w=D;x=G}else{I=G;break}}}else{I=0}c[d>>2]=I;x=c[C>>2]|0;C=c[b>>2]|0;if((C|0)<=-1){bc(7536,103,13816,6368);return 0.0}if((c[x+20>>2]|0)<=(C|0)){bc(7536,103,13816,6368);return 0.0}w=(c[x+16>>2]|0)+(C<<3)|0;s=+g[w>>2];j=+g[w+4>>2];w=c[H>>2]|0;if((I|0)<=-1){bc(7536,103,13816,6368);return 0.0}if((c[w+20>>2]|0)<=(I|0)){bc(7536,103,13816,6368);return 0.0}H=(c[w+16>>2]|0)+(I<<3)|0;i=+g[H>>2];r=+g[H+4>>2];F=+g[v>>2]*(p+(f*i-e*r)-(n+(l*s-k*j)))+ +g[E>>2]*(m+(e*i+f*r)-(h+(k*s+l*j)));return+F}else if((q|0)==2){j=+g[a+92>>2];s=+g[a+96>>2];r=f*j-e*s;i=e*j+f*s;s=+g[a+84>>2];j=+g[a+88>>2];u=p+(f*s-e*j);p=m+(e*s+f*j);j=-0.0-i;f=l*(-0.0-r)+k*j;s=k*r+l*j;c[d>>2]=-1;d=a|0;a=c[d>>2]|0;q=c[a+16>>2]|0;E=c[a+20>>2]|0;do{if((E|0)>1){j=s*+g[q+4>>2]+f*+g[q>>2];a=1;v=0;while(1){e=f*+g[q+(a<<3)>>2]+s*+g[q+(a<<3)+4>>2];H=e>j;J=H?a:v;I=a+1|0;if((I|0)<(E|0)){j=H?e:j;a=I;v=J}else{break}}c[b>>2]=J;if((J|0)>-1){K=J;break}bc(7536,103,13816,6368);return 0.0}else{c[b>>2]=0;K=0}}while(0);b=c[d>>2]|0;if((c[b+20>>2]|0)<=(K|0)){bc(7536,103,13816,6368);return 0.0}d=(c[b+16>>2]|0)+(K<<3)|0;s=+g[d>>2];f=+g[d+4>>2];F=r*(n+(l*s-k*f)-u)+i*(h+(k*s+l*f)-p);return+F}else{bc(6688,183,13728,11592);return 0.0}return 0.0}function cA(a,b,d,e){a=a|0;b=b|0;d=d|0;e=+e;var f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0.0,s=0,t=0,u=0.0,v=0.0,w=0.0;f=1.0-e;h=f*+g[a+16>>2]+ +g[a+24>>2]*e;i=f*+g[a+20>>2]+ +g[a+28>>2]*e;j=f*+g[a+32>>2]+ +g[a+36>>2]*e;k=+S(+j);l=+R(+j);j=+g[a+8>>2];m=+g[a+12>>2];n=h-(l*j-k*m);h=i-(k*j+l*m);m=f*+g[a+52>>2]+ +g[a+60>>2]*e;j=f*+g[a+56>>2]+ +g[a+64>>2]*e;i=f*+g[a+68>>2]+ +g[a+72>>2]*e;e=+S(+i);f=+R(+i);i=+g[a+44>>2];o=+g[a+48>>2];p=m-(f*i-e*o);m=j-(e*i+f*o);q=c[a+80>>2]|0;if((q|0)==1){o=+g[a+92>>2];i=+g[a+96>>2];j=+g[a+84>>2];r=+g[a+88>>2];s=c[a+4>>2]|0;if((d|0)<=-1){bc(7536,103,13816,6368);return 0.0}if((c[s+20>>2]|0)<=(d|0)){bc(7536,103,13816,6368);return 0.0}t=(c[s+16>>2]|0)+(d<<3)|0;u=+g[t>>2];v=+g[t+4>>2];w=(l*o-k*i)*(p+(f*u-e*v)-(n+(l*j-k*r)))+(k*o+l*i)*(m+(e*u+f*v)-(h+(k*j+l*r)));return+w}else if((q|0)==2){r=+g[a+92>>2];j=+g[a+96>>2];v=+g[a+84>>2];u=+g[a+88>>2];t=c[a>>2]|0;if((b|0)<=-1){bc(7536,103,13816,6368);return 0.0}if((c[t+20>>2]|0)<=(b|0)){bc(7536,103,13816,6368);return 0.0}s=(c[t+16>>2]|0)+(b<<3)|0;i=+g[s>>2];o=+g[s+4>>2];w=(f*r-e*j)*(n+(l*i-k*o)-(p+(f*v-e*u)))+(e*r+f*j)*(h+(k*i+l*o)-(m+(e*v+f*u)));return+w}else if((q|0)==0){u=+g[a+92>>2];v=+g[a+96>>2];q=c[a>>2]|0;if((b|0)<=-1){bc(7536,103,13816,6368);return 0.0}if((c[q+20>>2]|0)<=(b|0)){bc(7536,103,13816,6368);return 0.0}s=(c[q+16>>2]|0)+(b<<3)|0;o=+g[s>>2];i=+g[s+4>>2];s=c[a+4>>2]|0;if((d|0)<=-1){bc(7536,103,13816,6368);return 0.0}if((c[s+20>>2]|0)<=(d|0)){bc(7536,103,13816,6368);return 0.0}a=(c[s+16>>2]|0)+(d<<3)|0;j=+g[a>>2];r=+g[a+4>>2];w=u*(p+(f*j-e*r)-(n+(l*o-k*i)))+v*(m+(e*j+f*r)-(h+(k*o+l*i)));return+w}else{bc(6688,242,13656,11592);return 0.0}return 0.0}function cB(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0;e=df(d,40)|0;if((e|0)==0){f=0}else{c[e>>2]=20296;c[e+4>>2]=3;g[e+8>>2]=.009999999776482582;c[e+12>>2]=0;c[e+16>>2]=0;a[e+36|0]=0;a[e+37|0]=0;f=e}e=c[b+12>>2]|0;d=c[b+16>>2]|0;h=f+12|0;if((c[h>>2]|0)!=0){bc(6208,48,18448,11256);return 0}i=f+16|0;if((c[i>>2]|0)!=0){bc(6208,48,18448,11256);return 0}if((d|0)>1){c[i>>2]=d;j=vh(d<<3)|0;c[h>>2]=j;vp(j|0,e|0,c[i>>2]<<3);i=f+36|0;a[i]=0;e=f+37|0;a[e]=0;j=b+20|0;h=f+20|0;d=c[j+4>>2]|0;c[h>>2]=c[j>>2];c[h+4>>2]=d;d=b+28|0;h=f+28|0;j=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=j;a[i]=a[b+36|0]&1;a[e]=a[b+37|0]&1;return f|0}else{bc(6208,49,18448,6736);return 0}return 0}function cC(a,b,c){a=a|0;b=b|0;c=c|0;return 0}function cD(a){a=a|0;return}function cE(a){a=a|0;return 1}function cF(a){a=a|0;return}function cG(a){a=a|0;return 1}function cH(a,b,c){a=a|0;b=b|0;c=c|0;return 0}function cI(a){a=a|0;return 1}function cJ(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=+g[b+12>>2];e=+g[a+12>>2];f=+g[b+8>>2];h=+g[a+16>>2];i=+g[c>>2]-(+g[b>>2]+(d*e-f*h));j=+g[c+4>>2]-(+g[b+4>>2]+(e*f+d*h));h=+g[a+8>>2];return i*i+j*j<=h*h|0}function cK(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0;e=+g[c+12>>2];f=+g[a+12>>2];h=+g[c+8>>2];i=+g[a+16>>2];j=+g[c>>2]+(e*f-h*i);k=+g[c+4>>2]+(f*h+e*i);c=a+8|0;i=+g[c>>2];g[b>>2]=j-i;g[b+4>>2]=k-i;i=+g[c>>2];g[b+8>>2]=j+i;g[b+12>>2]=k+i;return}function cL(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0.0,h=0.0,i=0,j=0,k=0,l=0,m=0.0;e=a+8|0;f=+g[e>>2];h=f*d*3.1415927410125732*f;g[b>>2]=h;i=a+12|0;j=i;k=b+4|0;l=c[j+4>>2]|0;c[k>>2]=c[j>>2];c[k+4>>2]=l;f=+g[e>>2];d=+g[i>>2];m=+g[a+16>>2];g[b+12>>2]=h*(f*f*.5+(d*d+m*m));return}function cM(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0;e=+g[c+12>>2];f=+g[a+12>>2];h=+g[c+8>>2];i=+g[a+16>>2];j=+g[c>>2];k=j+(e*f-h*i);l=+g[c+4>>2];m=f*h+e*i+l;i=+g[a+20>>2];f=+g[a+24>>2];n=j+(e*i-h*f);j=l+(h*i+e*f);f=+g[a+8>>2];a=b;e=+((m<j?m:j)-f);g[a>>2]=(k<n?k:n)-f;g[a+4>>2]=e;a=b+8|0;e=+(f+(m>j?m:j));g[a>>2]=f+(k>n?k:n);g[a+4>>2]=e;return}function cN(a,b,c){a=a|0;b=b|0;c=+c;var d=0;g[b>>2]=0.0;d=b+4|0;c=+((+g[a+16>>2]+ +g[a+24>>2])*.5);g[d>>2]=(+g[a+12>>2]+ +g[a+20>>2])*.5;g[d+4>>2]=c;g[b+12>>2]=0.0;return}function cO(a,b,c){a=a|0;b=b|0;c=+c;vq(b|0,0,16);return}function cP(a,b){a=a|0;b=b|0;var d=0,e=0;d=df(b,20)|0;if((d|0)==0){e=0}else{c[d>>2]=20136;vq(d+4|0,0,16);e=d}c[e+4>>2]=c[a+4>>2];g[e+8>>2]=+g[a+8>>2];d=a+12|0;a=e+12|0;b=c[d+4>>2]|0;c[a>>2]=c[d>>2];c[a+4>>2]=b;return e|0}function cQ(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0;f=+g[d+12>>2];h=+g[a+12>>2];i=+g[d+8>>2];j=+g[a+16>>2];k=+g[c>>2];l=k-(+g[d>>2]+(f*h-i*j));m=+g[c+4>>2];n=m-(+g[d+4>>2]+(h*i+f*j));j=+g[a+8>>2];f=+g[c+8>>2]-k;k=+g[c+12>>2]-m;m=l*f+n*k;i=f*f+k*k;h=m*m-(l*l+n*n-j*j)*i;if(h<0.0|i<1.1920928955078125e-7){o=0;return o|0}j=m+ +P(+h);h=-0.0-j;if(j>-0.0){o=0;return o|0}if(i*+g[c+16>>2]<h){o=0;return o|0}j=h/i;g[b+8>>2]=j;i=l+f*j;f=n+k*j;c=b;j=+f;g[c>>2]=i;g[c+4>>2]=j;j=+P(+(i*i+f*f));if(j<1.1920928955078125e-7){o=1;return o|0}k=1.0/j;g[b>>2]=i*k;g[b+4>>2]=f*k;o=1;return o|0}function cR(a){a=a|0;vl(a);return}function cS(b,d){b=b|0;d=d|0;var e=0,f=0,h=0;e=df(d,48)|0;if((e|0)==0){f=0}else{c[e>>2]=20512;c[e+4>>2]=1;g[e+8>>2]=.009999999776482582;vq(e+28|0,0,18);f=e}c[f+4>>2]=c[b+4>>2];g[f+8>>2]=+g[b+8>>2];e=b+12|0;d=f+12|0;h=c[e+4>>2]|0;c[d>>2]=c[e>>2];c[d+4>>2]=h;h=b+20|0;d=f+20|0;e=c[h+4>>2]|0;c[d>>2]=c[h>>2];c[d+4>>2]=e;e=b+28|0;d=f+28|0;h=c[e+4>>2]|0;c[d>>2]=c[e>>2];c[d+4>>2]=h;h=b+36|0;d=f+36|0;e=c[h+4>>2]|0;c[d>>2]=c[h>>2];c[d+4>>2]=e;a[f+44|0]=a[b+44|0]&1;a[f+45|0]=a[b+45|0]&1;return f|0}function cT(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0;f=+g[d>>2];h=+g[c>>2]-f;i=+g[d+4>>2];j=+g[c+4>>2]-i;k=+g[d+12>>2];l=+g[d+8>>2];m=h*k+j*l;n=-0.0-l;o=k*j+h*n;h=+g[c+8>>2]-f;f=+g[c+12>>2]-i;i=k*h+l*f-m;l=h*n+k*f-o;d=a+12|0;f=+g[d>>2];k=+g[d+4>>2];d=a+20|0;n=+g[d>>2]-f;h=+g[d+4>>2]-k;j=-0.0-n;p=n*n+h*h;q=+P(+p);if(q<1.1920928955078125e-7){r=h;s=j}else{t=1.0/q;r=h*t;s=t*j}j=(k-o)*s+(f-m)*r;t=l*s+i*r;if(t==0.0){u=0;return u|0}q=j/t;if(q<0.0){u=0;return u|0}if(+g[c+16>>2]<q|p==0.0){u=0;return u|0}t=(n*(m+i*q-f)+h*(o+l*q-k))/p;if(t<0.0|t>1.0){u=0;return u|0}g[b+8>>2]=q;if(j>0.0){c=b;j=+(-0.0-s);g[c>>2]=-0.0-r;g[c+4>>2]=j;u=1;return u|0}else{c=b;j=+s;g[c>>2]=r;g[c+4>>2]=j;u=1;return u|0}return 0}function cU(a){a=a|0;vl(a);return}function cV(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=df(b,152)|0;if((d|0)==0){e=0}else{c[d>>2]=20032;c[d+4>>2]=2;g[d+8>>2]=.009999999776482582;c[d+148>>2]=0;g[d+12>>2]=0.0;g[d+16>>2]=0.0;e=d}c[e+4>>2]=c[a+4>>2];g[e+8>>2]=+g[a+8>>2];d=a+12|0;b=e+12|0;f=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=f;vp(e+20|0,a+20|0,64);vp(e+84|0,a+84|0,64);c[e+148>>2]=c[a+148>>2];return e|0}function cW(a,b,d,e,f){a=a|0;b=+b;d=+d;e=e|0;f=+f;var h=0,i=0.0,j=0.0,k=0,l=0,m=0.0,n=0.0,o=0.0;h=a+148|0;c[h>>2]=4;i=-0.0-b;j=-0.0-d;g[a+20>>2]=i;g[a+24>>2]=j;g[a+28>>2]=b;g[a+32>>2]=j;g[a+36>>2]=b;g[a+40>>2]=d;g[a+44>>2]=i;g[a+48>>2]=d;g[a+84>>2]=0.0;g[a+88>>2]=-1.0;g[a+92>>2]=1.0;g[a+96>>2]=0.0;g[a+100>>2]=0.0;g[a+104>>2]=1.0;g[a+108>>2]=-1.0;g[a+112>>2]=0.0;k=e;e=a+12|0;l=c[k+4>>2]|0;c[e>>2]=c[k>>2];c[e+4>>2]=l;d=+g[k>>2];i=+g[k+4>>2];b=+S(+f);m=+R(+f);k=0;f=j;j=-1.0;while(1){l=a+20+(k<<3)|0;n=+g[l>>2];e=l;o=+(i+(b*n+m*f));g[e>>2]=d+(m*n-b*f);g[e+4>>2]=o;e=a+84+(k<<3)|0;o=+g[e>>2];l=e;n=+(b*o+m*j);g[l>>2]=m*o-b*j;g[l+4>>2]=n;l=k+1|0;if((l|0)>=(c[h>>2]|0)){break}k=l;f=+g[a+20+(l<<3)+4>>2];j=+g[a+84+(l<<3)+4>>2]}return}function cX(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0;if((e|0)<=-1){bc(6208,89,14624,5952)}f=b+16|0;if(((c[f>>2]|0)-1|0)<=(e|0)){bc(6208,89,14624,5952)}c[d+4>>2]=1;g[d+8>>2]=+g[b+8>>2];h=b+12|0;i=(c[h>>2]|0)+(e<<3)|0;j=d+12|0;k=c[i+4>>2]|0;c[j>>2]=c[i>>2];c[j+4>>2]=k;k=(c[h>>2]|0)+(e+1<<3)|0;j=d+20|0;i=c[k+4>>2]|0;c[j>>2]=c[k>>2];c[j+4>>2]=i;i=d+28|0;if((e|0)>0){j=(c[h>>2]|0)+(e-1<<3)|0;k=i;l=c[j+4>>2]|0;c[k>>2]=c[j>>2];c[k+4>>2]=l;a[d+44|0]=1}else{l=b+20|0;k=i;i=c[l+4>>2]|0;c[k>>2]=c[l>>2];c[k+4>>2]=i;a[d+44|0]=a[b+36|0]&1}i=d+36|0;if(((c[f>>2]|0)-2|0)>(e|0)){f=(c[h>>2]|0)+(e+2<<3)|0;e=i;h=c[f+4>>2]|0;c[e>>2]=c[f>>2];c[e+4>>2]=h;a[d+45|0]=1;return}else{h=b+28|0;e=i;i=c[h+4>>2]|0;c[e>>2]=c[h>>2];c[e+4>>2]=i;a[d+45|0]=a[b+37|0]&1;return}}function cY(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;i=i+48|0;j=h|0;k=c[a+16>>2]|0;if((k|0)>(f|0)){c[j>>2]=20512;c[j+4>>2]=1;g[j+8>>2]=.009999999776482582;vq(j+28|0,0,18);l=f+1|0;m=c[a+12>>2]|0;a=m+(f<<3)|0;f=j+12|0;n=c[a+4>>2]|0;c[f>>2]=c[a>>2];c[f+4>>2]=n;n=m+(((l|0)==(k|0)?0:l)<<3)|0;l=j+20|0;k=c[n+4>>2]|0;c[l>>2]=c[n>>2];c[l+4>>2]=k;k=cT(j,b,d,e,0)|0;i=h;return k|0}else{bc(6208,129,14512,5512);return 0}return 0}function cZ(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0;f=c[a+16>>2]|0;if((f|0)>(e|0)){h=e+1|0;i=(h|0)==(f|0)?0:h;h=c[a+12>>2]|0;j=+g[d+12>>2];k=+g[h+(e<<3)>>2];l=+g[d+8>>2];m=+g[h+(e<<3)+4>>2];n=+g[d>>2];o=n+(j*k-l*m);p=+g[d+4>>2];q=k*l+j*m+p;m=+g[h+(i<<3)>>2];k=+g[h+(i<<3)+4>>2];r=n+(j*m-l*k);n=p+(l*m+j*k);i=b;k=+(q<n?q:n);g[i>>2]=o<r?o:r;g[i+4>>2]=k;i=b+8|0;k=+(q>n?q:n);g[i>>2]=o>r?o:r;g[i+4>>2]=k;return}else{bc(6208,148,14688,5512)}}function c_(a){a=a|0;return}function c$(a){a=a|0;return}function c0(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return}function c1(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return}function c2(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;return}function c3(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;return}function c4(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return}function c5(a,b){a=a|0;b=b|0;return}function c6(a,b,d){a=a|0;b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0,m=0;e=+g[d>>2]- +g[b>>2];f=+g[d+4>>2]- +g[b+4>>2];h=+g[b+12>>2];i=+g[b+8>>2];j=e*h+f*i;k=h*f+e*(-0.0-i);b=c[a+148>>2]|0;d=0;while(1){if((d|0)>=(b|0)){l=1;m=925;break}if((j- +g[a+20+(d<<3)>>2])*+g[a+84+(d<<3)>>2]+(k- +g[a+20+(d<<3)+4>>2])*+g[a+84+(d<<3)+4>>2]>0.0){l=0;m=926;break}else{d=d+1|0}}if((m|0)==925){return l|0}else if((m|0)==926){return l|0}return 0}function c7(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0,w=0.0,x=0.0,y=0.0,z=0.0;f=+g[d+12>>2];h=+g[a+20>>2];i=+g[d+8>>2];j=+g[a+24>>2];k=+g[d>>2];l=k+(f*h-i*j);m=+g[d+4>>2];n=h*i+f*j+m;d=c[a+148>>2]|0;if((d|0)>1){j=n;h=l;o=n;p=l;e=1;while(1){q=+g[a+20+(e<<3)>>2];r=+g[a+20+(e<<3)+4>>2];s=k+(f*q-i*r);t=q*i+f*r+m;r=h<s?h:s;q=j<t?j:t;u=p>s?p:s;s=o>t?o:t;v=e+1|0;if((v|0)<(d|0)){j=q;h=r;o=s;p=u;e=v}else{w=q;x=r;y=s;z=u;break}}}else{w=n;x=l;y=n;z=l}l=+g[a+8>>2];a=b;n=+(w-l);g[a>>2]=x-l;g[a+4>>2]=n;a=b+8|0;n=+(y+l);g[a>>2]=z+l;g[a+4>>2]=n;return}function c8(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;d=+g[b+16>>2];e=+g[b+32>>2];f=+g[b+20>>2];h=+g[b+28>>2];i=d*e-f*h;j=+g[b+24>>2];k=+g[b+12>>2];l=f*j-e*k;m=h*k-d*j;n=+g[b>>2];o=+g[b+4>>2];p=+g[b+8>>2];q=i*n+o*l+m*p;if(q!=0.0){r=1.0/q}else{r=q}q=+g[c>>2];s=+g[c+4>>2];t=+g[c+8>>2];g[a>>2]=r*(i*q+s*l+m*t);g[a+4>>2]=r*((s*e-t*h)*n+o*(t*j-e*q)+(h*q-s*j)*p);g[a+8>>2]=r*((d*t-f*s)*n+o*(f*q-t*k)+(s*k-d*q)*p);return}function c9(a){a=a|0;vl(a);return}function da(a){a=a|0;vl(a);return}function db(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;i=i+16|0;e=d|0;f=e;c[f>>2]=b;c[f+4>>2]=0;a4(a|0,e|0);i=d;return}function dc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0,p=0.0,q=0.0,r=0,s=0,t=0.0,u=0.0,v=0.0,w=0,x=0.0,y=0.0;if((d-3|0)>>>0>=6){bc(5664,122,17936,11096)}e=a+148|0;c[e>>2]=d;d=0;do{f=b+(d<<3)|0;h=a+20+(d<<3)|0;i=c[f+4>>2]|0;c[h>>2]=c[f>>2];c[h+4>>2]=i;d=d+1|0;j=c[e>>2]|0;}while((d|0)<(j|0));if((j|0)>0){k=j;l=0}else{bc(5664,76,18928,5016)}while(1){j=l+1|0;d=(j|0)<(k|0)?j:0;m=+g[a+20+(d<<3)>>2]- +g[a+20+(l<<3)>>2];n=+g[a+20+(d<<3)+4>>2]- +g[a+20+(l<<3)+4>>2];if(m*m+n*n<=1.4210854715202004e-14){o=943;break}d=a+84+(l<<3)|0;b=d;p=+(m*-1.0);g[b>>2]=n;g[b+4>>2]=p;b=a+84+(l<<3)+4|0;p=+g[b>>2];m=+P(+(n*n+p*p));if(m>=1.1920928955078125e-7){q=1.0/m;g[d>>2]=n*q;g[b>>2]=p*q}r=c[e>>2]|0;if((j|0)<(r|0)){k=r;l=j}else{break}}if((o|0)==943){bc(5664,137,17936,8512)}o=a+12|0;l=a+20|0;if((r|0)>2){s=0;t=0.0;u=0.0;v=0.0}else{bc(5664,76,18928,5016)}do{k=a+20+(s<<3)|0;q=+g[k>>2];p=+g[k+4>>2];s=s+1|0;k=(s|0)<(r|0);if(k){w=a+20+(s<<3)|0}else{w=l}e=w;n=+g[e>>2];m=+g[e+4>>2];x=(q*m-p*n)*.5;t=t+x;y=x*.3333333432674408;u=u+(q+0.0+n)*y;v=v+(p+0.0+m)*y}while(k);if(t>1.1920928955078125e-7){y=1.0/t;w=o;t=+(v*y);g[w>>2]=u*y;g[w+4>>2]=t;return}else{bc(5664,115,18928,5488)}}function dd(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0.0,u=0.0,v=0,w=0.0,x=0,y=0.0;h=+g[e>>2];i=+g[d>>2]-h;j=+g[e+4>>2];k=+g[d+4>>2]-j;f=e+12|0;l=+g[f>>2];m=e+8|0;n=+g[m>>2];o=i*l+k*n;p=-0.0-n;q=l*k+i*p;i=+g[d+8>>2]-h;h=+g[d+12>>2]-j;j=l*i+n*h-o;n=i*p+l*h-q;h=+g[d+16>>2];d=c[a+148>>2]|0;l=0.0;e=0;r=-1;p=h;L1236:while(1){if((e|0)>=(d|0)){s=967;break}i=+g[a+84+(e<<3)>>2];k=+g[a+84+(e<<3)+4>>2];t=(+g[a+20+(e<<3)>>2]-o)*i+(+g[a+20+(e<<3)+4>>2]-q)*k;u=j*i+n*k;L1239:do{if(u==0.0){if(t<0.0){v=0;s=972;break L1236}else{w=l;x=r;y=p}}else{do{if(u<0.0){if(t>=l*u){break}w=t/u;x=e;y=p;break L1239}}while(0);if(u<=0.0){w=l;x=r;y=p;break}if(t>=p*u){w=l;x=r;y=p;break}w=l;x=r;y=t/u}}while(0);if(y<w){v=0;s=975;break}else{l=w;e=e+1|0;r=x;p=y}}if((s|0)==967){if(l<0.0|l>h){bc(5664,249,13872,6584);return 0}if((r|0)<=-1){v=0;return v|0}g[b+8>>2]=l;l=+g[f>>2];h=+g[a+84+(r<<3)>>2];y=+g[m>>2];p=+g[a+84+(r<<3)+4>>2];r=b;w=+(h*y+l*p);g[r>>2]=l*h-y*p;g[r+4>>2]=w;v=1;return v|0}else if((s|0)==972){return v|0}else if((s|0)==975){return v|0}return 0}function de(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0.0,h=0.0,i=0,j=0.0,k=0.0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0;e=c[a+148>>2]|0;if((e|0)>2){f=0.0;h=0.0;i=0}else{bc(5664,306,13992,5928)}do{h=h+ +g[a+20+(i<<3)>>2];f=f+ +g[a+20+(i<<3)+4>>2];i=i+1|0;}while((i|0)<(e|0));j=1.0/+(e|0);k=h*j;h=f*j;i=a+20|0;l=a+24|0;j=0.0;f=0.0;m=0;n=0.0;o=0.0;do{p=+g[a+20+(m<<3)>>2]-k;q=+g[a+20+(m<<3)+4>>2]-h;m=m+1|0;r=(m|0)<(e|0);if(r){s=a+20+(m<<3)|0;t=a+20+(m<<3)+4|0}else{s=i;t=l}u=+g[s>>2]-k;v=+g[t>>2]-h;w=p*v-q*u;x=w*.5;o=o+x;y=x*.3333333432674408;f=f+(p+u)*y;j=j+(q+v)*y;n=n+w*.0833333358168602*(u*u+(p*p+p*u)+(v*v+(q*q+q*v)))}while(r);v=o*d;g[b>>2]=v;if(o>1.1920928955078125e-7){q=1.0/o;o=f*q;f=j*q;q=k+o;k=h+f;t=b+4|0;h=+k;g[t>>2]=q;g[t+4>>2]=h;g[b+12>>2]=n*d+v*(q*q+k*k-(o*o+f*f));return}else{bc(5664,352,13992,5488)}}function df(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;if((d|0)==0){e=0;return e|0}if((d|0)<=0){bc(5352,104,17408,8376);return 0}if((d|0)>640){e=vh(d)|0;return e|0}f=a[d+22064|0]|0;d=f&255;if((f&255)>=14){bc(5352,112,17408,6544);return 0}f=b+12+(d<<2)|0;g=c[f>>2]|0;if((g|0)!=0){c[f>>2]=c[g>>2];e=g;return e|0}g=b+4|0;h=c[g>>2]|0;i=b+8|0;j=b|0;if((h|0)==(c[i>>2]|0)){b=c[j>>2]|0;k=h+128|0;c[i>>2]=k;i=vh(k<<3)|0;c[j>>2]=i;k=b;vp(i|0,k|0,c[g>>2]<<3);vq((c[j>>2]|0)+(c[g>>2]<<3)|0,0,1024);vi(k);l=c[g>>2]|0}else{l=h}h=c[j>>2]|0;j=vh(16384)|0;k=h+(l<<3)+4|0;c[k>>2]=j;i=c[22712+(d<<2)>>2]|0;c[h+(l<<3)>>2]=i;l=16384/(i|0)&-1;if(($(l,i)|0)>=16385){bc(5352,140,17408,5888);return 0}h=l-1|0;if((h|0)>0){l=0;d=j;while(1){b=d+$(l,i)|0;m=l+1|0;c[b>>2]=d+$(m,i);b=c[k>>2]|0;if((m|0)<(h|0)){l=m;d=b}else{n=b;break}}}else{n=j}c[n+$(h,i)>>2]=0;c[f>>2]=c[c[k>>2]>>2];c[g>>2]=(c[g>>2]|0)+1;e=c[k>>2]|0;return e|0}function dg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b+102796|0;f=c[e>>2]|0;if((f|0)<=0){bc(4840,63,17080,5864)}g=f-1|0;if((c[b+102412+(g*12&-1)>>2]|0)!=(d|0)){bc(4840,65,17080,5464)}if((a[b+102412+(g*12&-1)+8|0]&1)==0){h=b+102412+(g*12&-1)+4|0;i=b+102400|0;c[i>>2]=(c[i>>2]|0)-(c[h>>2]|0);j=f;k=h}else{vi(d);j=c[e>>2]|0;k=b+102412+(g*12&-1)+4|0}g=b+102404|0;c[g>>2]=(c[g>>2]|0)-(c[k>>2]|0);c[e>>2]=j-1;return}function dh(d,e,f){d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0,k=0,l=0,m=0,n=0,o=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;h=e+4|0;i=+g[h>>2];if(!(i==i&!(C=0.0,C!=C)&i>+-p&i<+p)){bc(4720,27,15920,10600)}i=+g[e+8>>2];if(!(i==i&!(C=0.0,C!=C)&i>+-p&i<+p)){bc(4720,27,15920,10600)}j=e+16|0;i=+g[j>>2];if(!(i==i&!(C=0.0,C!=C)&i>+-p&i<+p)){bc(4720,28,15920,7920)}i=+g[e+20>>2];if(!(i==i&!(C=0.0,C!=C)&i>+-p&i<+p)){bc(4720,28,15920,7920)}k=e+12|0;i=+g[k>>2];if(!(i==i&!(C=0.0,C!=C)&i>+-p&i<+p)){bc(4720,29,15920,6424)}l=e+24|0;i=+g[l>>2];if(!(i==i&!(C=0.0,C!=C)&i>+-p&i<+p)){bc(4720,30,15920,5832)}m=e+32|0;i=+g[m>>2];if(i<0.0|i==i&!(C=0.0,C!=C)&i>+-p&i<+p^1){bc(4720,31,15920,5400)}n=e+28|0;i=+g[n>>2];if(i<0.0|i==i&!(C=0.0,C!=C)&i>+-p&i<+p^1){bc(4720,32,15920,4952)}o=d+4|0;b[o>>1]=0;if((a[e+39|0]&1)==0){q=0}else{b[o>>1]=8;q=8}if((a[e+38|0]&1)==0){r=q}else{s=q|16;b[o>>1]=s;r=s}if((a[e+36|0]&1)==0){t=r}else{s=r|4;b[o>>1]=s;t=s}if((a[e+37|0]&1)==0){u=t}else{s=t|2;b[o>>1]=s;u=s}if((a[e+40|0]&1)!=0){b[o>>1]=u|32}c[d+88>>2]=f;f=h;h=d+12|0;u=c[f>>2]|0;o=c[f+4>>2]|0;c[h>>2]=u;c[h+4>>2]=o;i=+g[k>>2];g[d+20>>2]=+S(+i);g[d+24>>2]=+R(+i);g[d+28>>2]=0.0;g[d+32>>2]=0.0;h=d+36|0;c[h>>2]=u;c[h+4>>2]=o;h=d+44|0;c[h>>2]=u;c[h+4>>2]=o;g[d+52>>2]=+g[k>>2];g[d+56>>2]=+g[k>>2];g[d+60>>2]=0.0;c[d+108>>2]=0;c[d+112>>2]=0;c[d+92>>2]=0;c[d+96>>2]=0;k=j;j=d+64|0;o=c[k+4>>2]|0;c[j>>2]=c[k>>2];c[j+4>>2]=o;g[d+72>>2]=+g[l>>2];g[d+132>>2]=+g[n>>2];g[d+136>>2]=+g[m>>2];g[d+140>>2]=+g[e+48>>2];g[d+76>>2]=0.0;g[d+80>>2]=0.0;g[d+84>>2]=0.0;g[d+144>>2]=0.0;m=c[e>>2]|0;c[d>>2]=m;n=d+116|0;if((m|0)==2){g[n>>2]=1.0;g[d+120>>2]=1.0;v=d+124|0;g[v>>2]=0.0;w=d+128|0;g[w>>2]=0.0;x=e+44|0;y=c[x>>2]|0;z=d+148|0;c[z>>2]=y;A=d+100|0;c[A>>2]=0;B=d+104|0;c[B>>2]=0;return}else{g[n>>2]=0.0;g[d+120>>2]=0.0;v=d+124|0;g[v>>2]=0.0;w=d+128|0;g[w>>2]=0.0;x=e+44|0;y=c[x>>2]|0;z=d+148|0;c[z>>2]=y;A=d+100|0;c[A>>2]=0;B=d+104|0;c[B>>2]=0;return}}function di(a,d){a=a|0;d=d|0;var e=0,f=0,h=0,j=0,l=0.0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0;e=i;i=i+16|0;f=e|0;h=a+88|0;if((c[(c[h>>2]|0)+102868>>2]&2|0)!=0){bc(4720,115,16e3,4688)}j=a|0;if((c[j>>2]|0)==(d|0)){i=e;return}c[j>>2]=d;dj(a);do{if((c[j>>2]|0)==0){g[a+64>>2]=0.0;g[a+68>>2]=0.0;g[a+72>>2]=0.0;l=+g[a+56>>2];g[a+52>>2]=l;d=a+44|0;m=a+36|0;n=c[d>>2]|0;o=c[d+4>>2]|0;c[m>>2]=n;c[m+4>>2]=o;m=f|0;d=f;p=f+8|0;q=+S(+l);g[p>>2]=q;r=+R(+l);g[p+4>>2]=r;l=+g[a+28>>2];s=+g[a+32>>2];t=+((c[k>>2]=o,+g[k>>2])-(q*l+r*s));g[m>>2]=(c[k>>2]=n,+g[k>>2])-(r*l-q*s);g[m+4>>2]=t;m=(c[h>>2]|0)+102872|0;n=c[a+100>>2]|0;if((n|0)==0){break}o=a+12|0;p=n;do{dH(p,m,d,o);p=c[p+4>>2]|0;}while((p|0)!=0)}}while(0);h=a+4|0;f=b[h>>1]|0;if((f&2)==0){b[h>>1]=f|2;g[a+144>>2]=0.0}g[a+76>>2]=0.0;g[a+80>>2]=0.0;g[a+84>>2]=0.0;f=c[a+100>>2]|0;if((f|0)==0){i=e;return}else{u=f}do{dI(u);u=c[u+4>>2]|0;}while((u|0)!=0);i=e;return}function dj(a){a=a|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0;d=i;i=i+16|0;e=d|0;f=a+116|0;h=a+120|0;j=a+124|0;k=a+128|0;l=a+28|0;g[l>>2]=0.0;g[a+32>>2]=0.0;vq(f|0,0,16);m=c[a>>2]|0;if((m|0)==0|(m|0)==1){n=a+12|0;o=a+36|0;p=c[n>>2]|0;q=c[n+4>>2]|0;c[o>>2]=p;c[o+4>>2]=q;o=a+44|0;c[o>>2]=p;c[o+4>>2]=q;g[a+52>>2]=+g[a+56>>2];i=d;return}else if((m|0)==2){m=4200;r=+g[m>>2];s=+g[m+4>>2];m=c[a+100>>2]|0;do{if((m|0)==0){t=0.0;u=r;v=s;w=1074}else{q=e|0;o=e+4|0;p=e+8|0;n=e+12|0;x=s;y=r;z=m;A=0.0;B=0.0;while(1){C=+g[z>>2];if(C==0.0){D=y;E=x;F=A;G=B}else{H=c[z+12>>2]|0;bP[c[(c[H>>2]|0)+28>>2]&127](H,e,C);C=+g[q>>2];I=C+ +g[f>>2];g[f>>2]=I;J=y+C*+g[o>>2];K=x+C*+g[p>>2];C=+g[n>>2]+ +g[j>>2];g[j>>2]=C;D=J;E=K;F=I;G=C}H=c[z+4>>2]|0;if((H|0)==0){break}else{x=E;y=D;z=H;A=F;B=G}}if(F<=0.0){t=G;u=D;v=E;w=1074;break}B=1.0/F;g[h>>2]=B;L=D*B;M=E*B;N=F;O=G}}while(0);if((w|0)==1074){g[f>>2]=1.0;g[h>>2]=1.0;L=u;M=v;N=1.0;O=t}do{if(O>0.0){if((b[a+4>>1]&16)!=0){w=1080;break}t=O-(M*M+L*L)*N;g[j>>2]=t;if(t>0.0){P=1.0/t;break}else{bc(4720,319,16088,11792)}}else{w=1080}}while(0);if((w|0)==1080){g[j>>2]=0.0;P=0.0}g[k>>2]=P;k=a+44|0;P=+g[k>>2];N=+g[k+4>>2];j=l;O=+M;g[j>>2]=L;g[j+4>>2]=O;O=+g[a+24>>2];t=+g[a+20>>2];v=+g[a+12>>2]+(O*L-t*M);u=L*t+O*M+ +g[a+16>>2];M=+v;O=+u;g[k>>2]=M;g[k+4>>2]=O;k=a+36|0;g[k>>2]=M;g[k+4>>2]=O;O=+g[a+72>>2];k=a+64|0;g[k>>2]=+g[k>>2]+(u-N)*(-0.0-O);k=a+68|0;g[k>>2]=O*(v-P)+ +g[k>>2];i=d;return}else{bc(4720,284,16088,12360)}}function dk(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;f=d+88|0;h=c[f>>2]|0;if((c[h+102868>>2]&2|0)!=0){bc(4720,153,16120,4688);return 0}i=h|0;h=df(i,44)|0;if((h|0)==0){j=0}else{b[h+32>>1]=1;b[h+34>>1]=-1;b[h+36>>1]=0;c[h+40>>2]=0;c[h+24>>2]=0;c[h+28>>2]=0;vq(h|0,0,16);j=h}c[j+40>>2]=c[e+4>>2];g[j+16>>2]=+g[e+8>>2];g[j+20>>2]=+g[e+12>>2];h=j+8|0;c[h>>2]=d;k=j+4|0;c[k>>2]=0;l=j+32|0;m=e+22|0;b[l>>1]=b[m>>1]|0;b[l+2>>1]=b[m+2>>1]|0;b[l+4>>1]=b[m+4>>1]|0;a[j+38|0]=a[e+20|0]&1;m=c[e>>2]|0;l=bH[c[(c[m>>2]|0)+8>>2]&255](m,i)|0;m=j+12|0;c[m>>2]=l;n=bs[c[(c[l>>2]|0)+12>>2]&1023](l)|0;l=df(i,n*28&-1)|0;i=j+24|0;c[i>>2]=l;do{if((n|0)>0){c[l+16>>2]=0;c[(c[i>>2]|0)+24>>2]=-1;if((n|0)>1){o=1}else{break}do{c[(c[i>>2]|0)+(o*28&-1)+16>>2]=0;c[(c[i>>2]|0)+(o*28&-1)+24>>2]=-1;o=o+1|0;}while((o|0)<(n|0))}}while(0);n=j+28|0;c[n>>2]=0;o=j|0;g[o>>2]=+g[e+16>>2];do{if((b[d+4>>1]&32)!=0){e=(c[f>>2]|0)+102872|0;l=d+12|0;p=c[m>>2]|0;q=bs[c[(c[p>>2]|0)+12>>2]&1023](p)|0;c[n>>2]=q;if((q|0)>0){r=0}else{break}do{q=c[i>>2]|0;p=q+(r*28&-1)|0;s=c[m>>2]|0;t=p|0;bQ[c[(c[s>>2]|0)+24>>2]&127](s,t,l,r);c[q+(r*28&-1)+24>>2]=b4(e,t,p)|0;c[q+(r*28&-1)+16>>2]=j;c[q+(r*28&-1)+20>>2]=r;r=r+1|0;}while((r|0)<(c[n>>2]|0))}}while(0);n=d+100|0;c[k>>2]=c[n>>2];c[n>>2]=j;n=d+104|0;c[n>>2]=(c[n>>2]|0)+1;c[h>>2]=d;if(+g[o>>2]<=0.0){u=c[f>>2]|0;v=u+102868|0;w=c[v>>2]|0;x=w|1;c[v>>2]=x;return j|0}dj(d);u=c[f>>2]|0;v=u+102868|0;w=c[v>>2]|0;x=w|1;c[v>>2]=x;return j|0}function dl(a){a=a|0;return}function dm(a){a=a|0;return}function dn(a){a=a|0;var d=0,e=0,f=0,j=0.0,k=0,l=0;d=i;e=a+8|0;f=c[e>>2]|0;db(11584,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(11232,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(11032,(u=i,i=i+8|0,c[u>>2]=c[a>>2],u)|0);j=+g[a+16>>2];db(10864,(u=i,i=i+16|0,h[u>>3]=+g[a+12>>2],h[u+8>>3]=j,u)|0);db(10576,(u=i,i=i+8|0,h[u>>3]=+g[a+56>>2],u)|0);j=+g[a+68>>2];db(10464,(u=i,i=i+16|0,h[u>>3]=+g[a+64>>2],h[u+8>>3]=j,u)|0);db(10320,(u=i,i=i+8|0,h[u>>3]=+g[a+72>>2],u)|0);db(10064,(u=i,i=i+8|0,h[u>>3]=+g[a+132>>2],u)|0);db(9640,(u=i,i=i+8|0,h[u>>3]=+g[a+136>>2],u)|0);k=a+4|0;db(9568,(u=i,i=i+8|0,c[u>>2]=b[k>>1]&4,u)|0);db(9144,(u=i,i=i+8|0,c[u>>2]=b[k>>1]&2,u)|0);db(8864,(u=i,i=i+8|0,c[u>>2]=b[k>>1]&16,u)|0);db(8712,(u=i,i=i+8|0,c[u>>2]=b[k>>1]&8,u)|0);db(8344,(u=i,i=i+8|0,c[u>>2]=b[k>>1]&32,u)|0);db(8128,(u=i,i=i+8|0,h[u>>3]=+g[a+140>>2],u)|0);db(7840,(u=i,i=i+8|0,c[u>>2]=c[e>>2],u)|0);db(7344,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);e=c[a+100>>2]|0;if((e|0)==0){db(11328,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);i=d;return}else{l=e}do{db(7480,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);dJ(l,f);db(7352,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);l=c[l+4>>2]|0;}while((l|0)!=0);db(11328,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);i=d;return}function dp(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;d=c[(c[b+48>>2]|0)+8>>2]|0;e=c[(c[b+52>>2]|0)+8>>2]|0;f=c[a+72>>2]|0;do{if((f|0)!=0){if((c[b+4>>2]&2|0)==0){break}br[c[(c[f>>2]|0)+12>>2]&511](f,b)}}while(0);f=b+8|0;g=c[f>>2]|0;h=b+12|0;if((g|0)!=0){c[g+12>>2]=c[h>>2]}g=c[h>>2]|0;if((g|0)!=0){c[g+8>>2]=c[f>>2]}f=a+60|0;if((c[f>>2]|0)==(b|0)){c[f>>2]=c[h>>2]}h=b+24|0;f=c[h>>2]|0;g=b+28|0;if((f|0)!=0){c[f+12>>2]=c[g>>2]}f=c[g>>2]|0;if((f|0)!=0){c[f+8>>2]=c[h>>2]}h=d+112|0;if((b+16|0)==(c[h>>2]|0)){c[h>>2]=c[g>>2]}g=b+40|0;h=c[g>>2]|0;d=b+44|0;if((h|0)!=0){c[h+12>>2]=c[d>>2]}h=c[d>>2]|0;if((h|0)!=0){c[h+8>>2]=c[g>>2]}g=e+112|0;if((b+32|0)!=(c[g>>2]|0)){i=a+76|0;j=c[i>>2]|0;em(b,j);k=a+64|0;l=c[k>>2]|0;m=l-1|0;c[k>>2]=m;return}c[g>>2]=c[d>>2];i=a+76|0;j=c[i>>2]|0;em(b,j);k=a+64|0;l=c[k>>2]|0;m=l-1|0;c[k>>2]=m;return}function dq(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;f=d+88|0;if((c[(c[f>>2]|0)+102868>>2]&2|0)!=0){bc(4720,201,16040,4688)}g=e+8|0;if((c[g>>2]|0)!=(d|0)){bc(4720,207,16040,4464)}h=d+104|0;if((c[h>>2]|0)<=0){bc(4720,210,16040,4208)}i=d+100|0;while(1){j=c[i>>2]|0;if((j|0)==0){k=1141;break}if((j|0)==(e|0)){break}else{i=j+4|0}}if((k|0)==1141){bc(4720,226,16040,12760)}j=e+4|0;c[i>>2]=c[j>>2];i=c[d+112>>2]|0;if((i|0)!=0){l=i;do{i=c[l+4>>2]|0;l=c[l+12>>2]|0;if((c[i+48>>2]|0)==(e|0)|(c[i+52>>2]|0)==(e|0)){dp((c[f>>2]|0)+102872|0,i)}}while((l|0)!=0)}l=c[f>>2]|0;f=l|0;if((b[d+4>>1]&32)!=0){i=e+28|0;if((c[i>>2]|0)>0){m=e+24|0;n=l+102912|0;o=l+102904|0;p=l+102900|0;q=l+102872|0;r=0;do{s=(c[m>>2]|0)+(r*28&-1)+24|0;t=c[s>>2]|0;u=c[n>>2]|0;v=0;while(1){if((v|0)>=(u|0)){break}w=(c[o>>2]|0)+(v<<2)|0;if((c[w>>2]|0)==(t|0)){k=1151;break}else{v=v+1|0}}if((k|0)==1151){k=0;c[w>>2]=-1}c[p>>2]=(c[p>>2]|0)-1;cl(q,t);c[s>>2]=-1;r=r+1|0;}while((r|0)<(c[i>>2]|0))}c[i>>2]=0}dK(e,f);c[g>>2]=0;c[j>>2]=0;j=a[22108]|0;if((j&255)<14){g=l+12+((j&255)<<2)|0;c[e>>2]=c[g>>2];c[g>>2]=e;c[h>>2]=(c[h>>2]|0)-1;dj(d);return}else{bc(5352,173,17448,6544)}}function dr(a,d){a=a|0;d=d|0;var e=0,f=0,h=0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0.0,q=0.0,r=0.0;if((c[(c[a+88>>2]|0)+102868>>2]&2|0)!=0){bc(4720,340,16232,4688)}if((c[a>>2]|0)!=2){return}e=a+120|0;g[e>>2]=0.0;f=a+124|0;g[f>>2]=0.0;h=a+128|0;g[h>>2]=0.0;i=+g[d>>2];j=i>0.0?i:1.0;g[a+116>>2]=j;g[e>>2]=1.0/j;i=+g[d+12>>2];do{if(i>0.0){if((b[a+4>>1]&16)!=0){break}l=+g[d+4>>2];m=+g[d+8>>2];n=i-j*(l*l+m*m);g[f>>2]=n;if(n>0.0){g[h>>2]=1.0/n;break}else{bc(4720,366,16232,11792)}}}while(0);h=a+44|0;j=+g[h>>2];i=+g[h+4>>2];f=d+4|0;d=a+28|0;e=c[f>>2]|0;o=c[f+4>>2]|0;c[d>>2]=e;c[d+4>>2]=o;n=+g[a+24>>2];m=(c[k>>2]=e,+g[k>>2]);l=+g[a+20>>2];p=(c[k>>2]=o,+g[k>>2]);q=+g[a+12>>2]+(n*m-l*p);r=m*l+n*p+ +g[a+16>>2];p=+q;n=+r;g[h>>2]=p;g[h+4>>2]=n;h=a+36|0;g[h>>2]=p;g[h+4>>2]=n;n=+g[a+72>>2];h=a+64|0;g[h>>2]=+g[h>>2]+(r-i)*(-0.0-n);h=a+68|0;g[h>>2]=n*(q-j)+ +g[h>>2];return}function ds(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0,h=0,i=0.0,j=0.0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0,u=0,v=0;e=a+88|0;f=c[e>>2]|0;if((c[f+102868>>2]&2|0)!=0){bc(4720,404,16176,4688)}h=a+12|0;i=+S(+d);g[a+20>>2]=i;j=+R(+d);g[a+24>>2]=j;l=b;b=h;m=c[l>>2]|0;n=c[l+4>>2]|0;c[b>>2]=m;c[b+4>>2]=n;o=+g[a+28>>2];p=+g[a+32>>2];b=a+44|0;q=+((c[k>>2]=m,+g[k>>2])+(j*o-i*p));r=+(o*i+j*p+(c[k>>2]=n,+g[k>>2]));g[b>>2]=q;g[b+4>>2]=r;g[a+56>>2]=d;b=a+36|0;g[b>>2]=q;g[b+4>>2]=r;g[a+52>>2]=d;b=f+102872|0;n=c[a+100>>2]|0;if((n|0)==0){s=f;t=s+102872|0;u=t|0;dy(u,t);return}else{v=n}do{dH(v,b,h,h);v=c[v+4>>2]|0;}while((v|0)!=0);s=c[e>>2]|0;t=s+102872|0;u=t|0;dy(u,t);return}function dt(a,d){a=a|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=a+88|0;f=c[e>>2]|0;if((c[f+102868>>2]&2|0)!=0){bc(4720,443,15968,4688)}g=a+4|0;h=b[g>>1]|0;if(!((h&32)!=0^d)){return}if(d){b[g>>1]=h|32;d=f+102872|0;i=c[a+100>>2]|0;if((i|0)==0){return}j=a+12|0;k=i;while(1){i=k+28|0;if((c[i>>2]|0)!=0){l=1184;break}m=k+12|0;n=c[m>>2]|0;o=bs[c[(c[n>>2]|0)+12>>2]&1023](n)|0;c[i>>2]=o;if((o|0)>0){o=k+24|0;n=0;do{p=c[o>>2]|0;q=p+(n*28&-1)|0;r=c[m>>2]|0;s=q|0;bQ[c[(c[r>>2]|0)+24>>2]&127](r,s,j,n);c[p+(n*28&-1)+24>>2]=b4(d,s,q)|0;c[p+(n*28&-1)+16>>2]=k;c[p+(n*28&-1)+20>>2]=n;n=n+1|0;}while((n|0)<(c[i>>2]|0))}i=c[k+4>>2]|0;if((i|0)==0){l=1204;break}else{k=i}}if((l|0)==1184){bc(12280,124,14968,12608)}else if((l|0)==1204){return}}b[g>>1]=h&-33;h=c[a+100>>2]|0;if((h|0)!=0){g=f+102912|0;k=f+102904|0;d=f+102900|0;j=f+102872|0;f=h;do{h=f+28|0;if((c[h>>2]|0)>0){i=f+24|0;n=0;do{m=(c[i>>2]|0)+(n*28&-1)+24|0;o=c[m>>2]|0;p=c[g>>2]|0;q=0;while(1){if((q|0)>=(p|0)){break}t=(c[k>>2]|0)+(q<<2)|0;if((c[t>>2]|0)==(o|0)){l=1196;break}else{q=q+1|0}}if((l|0)==1196){l=0;c[t>>2]=-1}c[d>>2]=(c[d>>2]|0)-1;cl(j,o);c[m>>2]=-1;n=n+1|0;}while((n|0)<(c[h>>2]|0))}c[h>>2]=0;f=c[f+4>>2]|0;}while((f|0)!=0)}f=a+112|0;a=c[f>>2]|0;if((a|0)!=0){j=a;while(1){a=c[j+12>>2]|0;dp((c[e>>2]|0)+102872|0,c[j+4>>2]|0);if((a|0)==0){break}else{j=a}}}c[f>>2]=0;return}function du(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=c[a>>2]|0;e=c[b>>2]|0;if((d|0)<(e|0)){f=1;return f|0}if((d|0)!=(e|0)){f=0;return f|0}f=(c[a+4>>2]|0)<(c[b+4>>2]|0);return f|0}function dv(d,e,f){d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;h=c[e+16>>2]|0;i=c[f+16>>2]|0;j=c[e+20>>2]|0;e=c[f+20>>2]|0;f=c[h+8>>2]|0;k=c[i+8>>2]|0;if((f|0)==(k|0)){return}l=c[k+112>>2]|0;L1593:do{if((l|0)!=0){m=l;while(1){if((c[m>>2]|0)==(f|0)){n=c[m+4>>2]|0;o=c[n+48>>2]|0;p=c[n+52>>2]|0;q=c[n+56>>2]|0;r=c[n+60>>2]|0;if((o|0)==(h|0)&(p|0)==(i|0)&(q|0)==(j|0)&(r|0)==(e|0)){s=1245;break}if((o|0)==(i|0)&(p|0)==(h|0)&(q|0)==(e|0)&(r|0)==(j|0)){s=1248;break}}m=c[m+12>>2]|0;if((m|0)==0){break L1593}}if((s|0)==1245){return}else if((s|0)==1248){return}}}while(0);do{if((c[k>>2]|0)!=2){if((c[f>>2]|0)==2){break}return}}while(0);s=c[k+108>>2]|0;L1608:do{if((s|0)!=0){k=s;while(1){if((c[k>>2]|0)==(f|0)){if((a[(c[k+4>>2]|0)+61|0]&1)==0){break}}k=c[k+12>>2]|0;if((k|0)==0){break L1608}}return}}while(0);f=c[d+68>>2]|0;do{if((f|0)!=0){if(bx[c[(c[f>>2]|0)+8>>2]&127](f,h,i)|0){break}return}}while(0);f=el(h,j,i,e,c[d+76>>2]|0)|0;if((f|0)==0){return}e=c[(c[f+48>>2]|0)+8>>2]|0;i=c[(c[f+52>>2]|0)+8>>2]|0;c[f+8>>2]=0;j=d+60|0;c[f+12>>2]=c[j>>2];h=c[j>>2]|0;if((h|0)!=0){c[h+8>>2]=f}c[j>>2]=f;j=f+16|0;c[f+20>>2]=f;c[j>>2]=i;c[f+24>>2]=0;h=e+112|0;c[f+28>>2]=c[h>>2];s=c[h>>2]|0;if((s|0)!=0){c[s+8>>2]=j}c[h>>2]=j;j=f+32|0;c[f+36>>2]=f;c[j>>2]=e;c[f+40>>2]=0;h=i+112|0;c[f+44>>2]=c[h>>2];f=c[h>>2]|0;if((f|0)!=0){c[f+8>>2]=j}c[h>>2]=j;j=e+4|0;h=b[j>>1]|0;if((h&2)==0){b[j>>1]=h|2;g[e+144>>2]=0.0}e=i+4|0;h=b[e>>1]|0;if((h&2)==0){b[e>>1]=h|2;g[i+144>>2]=0.0}i=d+64|0;c[i>>2]=(c[i>>2]|0)+1;return}function dw(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;e=i;i=i+1040|0;f=e|0;h=f+4|0;j=f|0;c[j>>2]=h;k=f+1028|0;c[k>>2]=0;l=f+1032|0;c[l>>2]=256;c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[a>>2];f=(c[k>>2]|0)+1|0;c[k>>2]=f;if((f|0)>0){m=a+4|0;a=d|0;n=d+4|0;o=d+8|0;p=d+12|0;d=b+56|0;q=b+52|0;r=b+48|0;s=b+44|0;b=f;while(1){f=b-1|0;c[k>>2]=f;t=c[j>>2]|0;u=c[t+(f<<2)>>2]|0;do{if((u|0)==-1){v=f}else{w=c[m>>2]|0;if(+g[a>>2]- +g[w+(u*36&-1)+8>>2]>0.0|+g[n>>2]- +g[w+(u*36&-1)+12>>2]>0.0|+g[w+(u*36&-1)>>2]- +g[o>>2]>0.0|+g[w+(u*36&-1)+4>>2]- +g[p>>2]>0.0){v=f;break}x=w+(u*36&-1)+24|0;if((c[x>>2]|0)==-1){y=c[d>>2]|0;if((y|0)==(u|0)){v=f;break}z=c[q>>2]|0;if((z|0)==(c[r>>2]|0)){A=c[s>>2]|0;c[r>>2]=z<<1;B=vh(z*24&-1)|0;c[s>>2]=B;C=A;vp(B|0,C|0,(c[q>>2]|0)*12&-1);vi(C);D=c[d>>2]|0;E=c[q>>2]|0}else{D=y;E=z}c[(c[s>>2]|0)+(E*12&-1)>>2]=(D|0)>(u|0)?u:D;z=c[d>>2]|0;c[(c[s>>2]|0)+((c[q>>2]|0)*12&-1)+4>>2]=(z|0)<(u|0)?u:z;c[q>>2]=(c[q>>2]|0)+1;v=c[k>>2]|0;break}do{if((f|0)==(c[l>>2]|0)){c[l>>2]=f<<1;z=vh(f<<3)|0;c[j>>2]=z;y=t;vp(z|0,y|0,c[k>>2]<<2);if((t|0)==(h|0)){break}vi(y)}}while(0);c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[x>>2];y=(c[k>>2]|0)+1|0;c[k>>2]=y;z=w+(u*36&-1)+28|0;do{if((y|0)==(c[l>>2]|0)){C=c[j>>2]|0;c[l>>2]=y<<1;B=vh(y<<3)|0;c[j>>2]=B;A=C;vp(B|0,A|0,c[k>>2]<<2);if((C|0)==(h|0)){break}vi(A)}}while(0);c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[z>>2];y=(c[k>>2]|0)+1|0;c[k>>2]=y;v=y}}while(0);if((v|0)>0){b=v}else{break}}}v=c[j>>2]|0;if((v|0)==(h|0)){i=e;return}vi(v);c[j>>2]=0;i=e;return}function dx(d){d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;e=c[d+60>>2]|0;if((e|0)==0){return}f=d+12|0;h=d+4|0;i=d+72|0;j=d+68|0;k=e;L1672:while(1){e=c[k+48>>2]|0;l=c[k+52>>2]|0;m=c[k+56>>2]|0;n=c[k+60>>2]|0;o=c[e+8>>2]|0;p=c[l+8>>2]|0;q=k+4|0;r=c[q>>2]|0;L1674:do{if((r&8|0)==0){s=1287}else{if((c[p>>2]|0)==2){s=1276}else{if((c[o>>2]|0)==2){s=1276}}L1678:do{if((s|0)==1276){s=0;t=c[p+108>>2]|0;if((t|0)!=0){u=t;do{if((c[u>>2]|0)==(o|0)){if((a[(c[u+4>>2]|0)+61|0]&1)==0){break L1678}}u=c[u+12>>2]|0;}while((u|0)!=0)}u=c[j>>2]|0;do{if((u|0)==0){v=r}else{if(bx[c[(c[u>>2]|0)+8>>2]&127](u,e,l)|0){v=c[q>>2]|0;break}else{t=c[k+12>>2]|0;dp(d,k);w=t;break L1674}}}while(0);c[q>>2]=v&-9;s=1287;break L1674}}while(0);u=c[k+12>>2]|0;dp(d,k);w=u}}while(0);do{if((s|0)==1287){s=0;if((b[o+4>>1]&2)==0){x=0}else{x=(c[o>>2]|0)!=0&1}if((b[p+4>>1]&2)==0){y=1}else{y=(c[p>>2]|0)==0}if((x|0)==0&y){w=c[k+12>>2]|0;break}q=c[(c[e+24>>2]|0)+(m*28&-1)+24>>2]|0;r=c[(c[l+24>>2]|0)+(n*28&-1)+24>>2]|0;if((q|0)<=-1){s=1304;break L1672}u=c[f>>2]|0;if((u|0)<=(q|0)){s=1305;break L1672}t=c[h>>2]|0;if(!((r|0)>-1&(u|0)>(r|0))){s=1297;break L1672}if(+g[t+(r*36&-1)>>2]- +g[t+(q*36&-1)+8>>2]>0.0|+g[t+(r*36&-1)+4>>2]- +g[t+(q*36&-1)+12>>2]>0.0|+g[t+(q*36&-1)>>2]- +g[t+(r*36&-1)+8>>2]>0.0|+g[t+(q*36&-1)+4>>2]- +g[t+(r*36&-1)+12>>2]>0.0){r=c[k+12>>2]|0;dp(d,k);w=r;break}else{eh(k,c[i>>2]|0);w=c[k+12>>2]|0;break}}}while(0);if((w|0)==0){s=1302;break}else{k=w}}if((s|0)==1297){bc(10360,159,14456,9904)}else if((s|0)==1302){return}else if((s|0)==1304){bc(10360,159,14456,9904)}else if((s|0)==1305){bc(10360,159,14456,9904)}}function dy(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;d=i;i=i+8|0;e=d|0;f=a+52|0;c[f>>2]=0;g=a+40|0;h=c[g>>2]|0;do{if((h|0)>0){j=a+32|0;k=a+56|0;l=a|0;m=a+12|0;n=a+4|0;o=0;p=h;while(1){q=c[(c[j>>2]|0)+(o<<2)>>2]|0;c[k>>2]=q;if((q|0)==-1){r=p}else{if((q|0)<=-1){s=1332;break}if((c[m>>2]|0)<=(q|0)){s=1331;break}dw(l,a,(c[n>>2]|0)+(q*36&-1)|0);r=c[g>>2]|0}q=o+1|0;if((q|0)<(r|0)){o=q;p=r}else{s=1314;break}}if((s|0)==1314){t=c[f>>2]|0;break}else if((s|0)==1331){bc(10360,159,14456,9904)}else if((s|0)==1332){bc(10360,159,14456,9904)}}else{t=0}}while(0);c[g>>2]=0;g=a+44|0;r=c[g>>2]|0;c[e>>2]=122;dz(r,r+(t*12&-1)|0,e);if((c[f>>2]|0)<=0){i=d;return}e=a+12|0;t=a+4|0;a=0;L1735:while(1){r=c[g>>2]|0;h=r+(a*12&-1)|0;p=c[h>>2]|0;if((p|0)<=-1){s=1327;break}o=c[e>>2]|0;if((o|0)<=(p|0)){s=1328;break}n=c[t>>2]|0;l=r+(a*12&-1)+4|0;r=c[l>>2]|0;if(!((r|0)>-1&(o|0)>(r|0))){s=1321;break}dv(b,c[n+(p*36&-1)+16>>2]|0,c[n+(r*36&-1)+16>>2]|0);r=c[f>>2]|0;n=a;while(1){p=n+1|0;if((p|0)>=(r|0)){s=1329;break L1735}o=c[g>>2]|0;if((c[o+(p*12&-1)>>2]|0)!=(c[h>>2]|0)){a=p;continue L1735}if((c[o+(p*12&-1)+4>>2]|0)==(c[l>>2]|0)){n=p}else{a=p;continue L1735}}}if((s|0)==1328){bc(10360,153,14408,9904)}else if((s|0)==1321){bc(10360,153,14408,9904)}else if((s|0)==1327){bc(10360,153,14408,9904)}else if((s|0)==1329){i=d;return}}function dz(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0;e=i;i=i+480|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;l=e+224|0;m=e+240|0;n=e+256|0;o=e+272|0;p=e+288|0;q=e+304|0;r=e+320|0;s=e+336|0;t=e+352|0;u=e+368|0;v=e+464|0;w=e+160|0;x=e+176|0;y=e+192|0;z=e+208|0;A=e+384|0;B=e+400|0;C=e+432|0;D=e+448|0;E=e+416|0;F=e+80|0;G=e+96|0;H=e+112|0;I=e+128|0;J=e+144|0;K=a;a=b;L1750:while(1){b=a;L=a-12|0;M=L;N=K;L1752:while(1){O=N;P=b-O|0;Q=(P|0)/12&-1;if((Q|0)==0|(Q|0)==1){R=1429;break L1750}else if((Q|0)==3){R=1338;break L1750}else if((Q|0)==4){R=1346;break L1750}else if((Q|0)==2){R=1336;break L1750}else if((Q|0)==5){R=1347;break L1750}if((P|0)<372){R=1353;break L1750}Q=(P|0)/24&-1;S=N+(Q*12&-1)|0;do{if((P|0)>11988){T=(P|0)/48&-1;U=N+(T*12&-1)|0;V=N+((T+Q|0)*12&-1)|0;T=dA(N,U,S,V,d)|0;if(!(bH[c[d>>2]&255](L,V)|0)){W=T;break}X=V;c[z>>2]=c[X>>2];c[z+4>>2]=c[X+4>>2];c[z+8>>2]=c[X+8>>2];c[X>>2]=c[M>>2];c[X+4>>2]=c[M+4>>2];c[X+8>>2]=c[M+8>>2];c[M>>2]=c[z>>2];c[M+4>>2]=c[z+4>>2];c[M+8>>2]=c[z+8>>2];if(!(bH[c[d>>2]&255](V,S)|0)){W=T+1|0;break}V=S;c[x>>2]=c[V>>2];c[x+4>>2]=c[V+4>>2];c[x+8>>2]=c[V+8>>2];c[V>>2]=c[X>>2];c[V+4>>2]=c[X+4>>2];c[V+8>>2]=c[X+8>>2];c[X>>2]=c[x>>2];c[X+4>>2]=c[x+4>>2];c[X+8>>2]=c[x+8>>2];if(!(bH[c[d>>2]&255](S,U)|0)){W=T+2|0;break}X=U;c[w>>2]=c[X>>2];c[w+4>>2]=c[X+4>>2];c[w+8>>2]=c[X+8>>2];c[X>>2]=c[V>>2];c[X+4>>2]=c[V+4>>2];c[X+8>>2]=c[V+8>>2];c[V>>2]=c[w>>2];c[V+4>>2]=c[w+4>>2];c[V+8>>2]=c[w+8>>2];if(!(bH[c[d>>2]&255](U,N)|0)){W=T+3|0;break}U=N;c[y>>2]=c[U>>2];c[y+4>>2]=c[U+4>>2];c[y+8>>2]=c[U+8>>2];c[U>>2]=c[X>>2];c[U+4>>2]=c[X+4>>2];c[U+8>>2]=c[X+8>>2];c[X>>2]=c[y>>2];c[X+4>>2]=c[y+4>>2];c[X+8>>2]=c[y+8>>2];W=T+4|0}else{T=bH[c[d>>2]&255](S,N)|0;X=bH[c[d>>2]&255](L,S)|0;if(!T){if(!X){W=0;break}T=S;c[J>>2]=c[T>>2];c[J+4>>2]=c[T+4>>2];c[J+8>>2]=c[T+8>>2];c[T>>2]=c[M>>2];c[T+4>>2]=c[M+4>>2];c[T+8>>2]=c[M+8>>2];c[M>>2]=c[J>>2];c[M+4>>2]=c[J+4>>2];c[M+8>>2]=c[J+8>>2];if(!(bH[c[d>>2]&255](S,N)|0)){W=1;break}U=N;c[H>>2]=c[U>>2];c[H+4>>2]=c[U+4>>2];c[H+8>>2]=c[U+8>>2];c[U>>2]=c[T>>2];c[U+4>>2]=c[T+4>>2];c[U+8>>2]=c[T+8>>2];c[T>>2]=c[H>>2];c[T+4>>2]=c[H+4>>2];c[T+8>>2]=c[H+8>>2];W=2;break}T=N;if(X){c[F>>2]=c[T>>2];c[F+4>>2]=c[T+4>>2];c[F+8>>2]=c[T+8>>2];c[T>>2]=c[M>>2];c[T+4>>2]=c[M+4>>2];c[T+8>>2]=c[M+8>>2];c[M>>2]=c[F>>2];c[M+4>>2]=c[F+4>>2];c[M+8>>2]=c[F+8>>2];W=1;break}c[G>>2]=c[T>>2];c[G+4>>2]=c[T+4>>2];c[G+8>>2]=c[T+8>>2];X=S;c[T>>2]=c[X>>2];c[T+4>>2]=c[X+4>>2];c[T+8>>2]=c[X+8>>2];c[X>>2]=c[G>>2];c[X+4>>2]=c[G+4>>2];c[X+8>>2]=c[G+8>>2];if(!(bH[c[d>>2]&255](L,S)|0)){W=1;break}c[I>>2]=c[X>>2];c[I+4>>2]=c[X+4>>2];c[I+8>>2]=c[X+8>>2];c[X>>2]=c[M>>2];c[X+4>>2]=c[M+4>>2];c[X+8>>2]=c[M+8>>2];c[M>>2]=c[I>>2];c[M+4>>2]=c[I+4>>2];c[M+8>>2]=c[I+8>>2];W=2}}while(0);do{if(bH[c[d>>2]&255](N,S)|0){Y=L;Z=W}else{Q=L;while(1){_=Q-12|0;if((N|0)==(_|0)){break}if(bH[c[d>>2]&255](_,S)|0){R=1395;break}else{Q=_}}if((R|0)==1395){R=0;Q=N;c[E>>2]=c[Q>>2];c[E+4>>2]=c[Q+4>>2];c[E+8>>2]=c[Q+8>>2];P=_;c[Q>>2]=c[P>>2];c[Q+4>>2]=c[P+4>>2];c[Q+8>>2]=c[P+8>>2];c[P>>2]=c[E>>2];c[P+4>>2]=c[E+4>>2];c[P+8>>2]=c[E+8>>2];Y=_;Z=W+1|0;break}P=N+12|0;if(bH[c[d>>2]&255](N,L)|0){$=P}else{Q=P;while(1){if((Q|0)==(L|0)){R=1432;break L1750}aa=Q+12|0;if(bH[c[d>>2]&255](N,Q)|0){break}else{Q=aa}}P=Q;c[D>>2]=c[P>>2];c[D+4>>2]=c[P+4>>2];c[D+8>>2]=c[P+8>>2];c[P>>2]=c[M>>2];c[P+4>>2]=c[M+4>>2];c[P+8>>2]=c[M+8>>2];c[M>>2]=c[D>>2];c[M+4>>2]=c[D+4>>2];c[M+8>>2]=c[D+8>>2];$=aa}if(($|0)==(L|0)){R=1421;break L1750}else{ab=L;ac=$}while(1){P=ac;while(1){ad=P+12|0;if(bH[c[d>>2]&255](N,P)|0){ae=ab;break}else{P=ad}}do{ae=ae-12|0;}while(bH[c[d>>2]&255](N,ae)|0);if(P>>>0>=ae>>>0){N=P;continue L1752}X=P;c[C>>2]=c[X>>2];c[C+4>>2]=c[X+4>>2];c[C+8>>2]=c[X+8>>2];T=ae;c[X>>2]=c[T>>2];c[X+4>>2]=c[T+4>>2];c[X+8>>2]=c[T+8>>2];c[T>>2]=c[C>>2];c[T+4>>2]=c[C+4>>2];c[T+8>>2]=c[C+8>>2];ab=ae;ac=ad}}}while(0);Q=N+12|0;L1795:do{if(Q>>>0<Y>>>0){T=Y;X=Q;U=Z;V=S;while(1){af=X;while(1){ag=af+12|0;if(bH[c[d>>2]&255](af,V)|0){af=ag}else{ah=T;break}}do{ah=ah-12|0;}while(!(bH[c[d>>2]&255](ah,V)|0));if(af>>>0>ah>>>0){ai=af;aj=U;ak=V;break L1795}P=af;c[B>>2]=c[P>>2];c[B+4>>2]=c[P+4>>2];c[B+8>>2]=c[P+8>>2];al=ah;c[P>>2]=c[al>>2];c[P+4>>2]=c[al+4>>2];c[P+8>>2]=c[al+8>>2];c[al>>2]=c[B>>2];c[al+4>>2]=c[B+4>>2];c[al+8>>2]=c[B+8>>2];T=ah;X=ag;U=U+1|0;V=(V|0)==(af|0)?ah:V}}else{ai=Q;aj=Z;ak=S}}while(0);do{if((ai|0)==(ak|0)){am=aj}else{if(!(bH[c[d>>2]&255](ak,ai)|0)){am=aj;break}S=ai;c[A>>2]=c[S>>2];c[A+4>>2]=c[S+4>>2];c[A+8>>2]=c[S+8>>2];Q=ak;c[S>>2]=c[Q>>2];c[S+4>>2]=c[Q+4>>2];c[S+8>>2]=c[Q+8>>2];c[Q>>2]=c[A>>2];c[Q+4>>2]=c[A+4>>2];c[Q+8>>2]=c[A+8>>2];am=aj+1|0}}while(0);if((am|0)==0){an=dF(N,ai,d)|0;Q=ai+12|0;if(dF(Q,a,d)|0){R=1407;break}if(an){N=Q;continue}}Q=ai;if((Q-O|0)>=(b-Q|0)){R=1411;break}dz(N,ai,d);N=ai+12|0}if((R|0)==1407){R=0;if(an){R=1420;break}else{K=N;a=ai;continue}}else if((R|0)==1411){R=0;dz(ai+12|0,a,d);K=N;a=ai;continue}}if((R|0)==1420){i=e;return}else if((R|0)==1421){i=e;return}else if((R|0)==1429){i=e;return}else if((R|0)==1432){i=e;return}else if((R|0)==1338){ai=N+12|0;K=q;q=r;r=s;s=t;t=u;u=bH[c[d>>2]&255](ai,N)|0;an=bH[c[d>>2]&255](L,ai)|0;if(!u){if(!an){i=e;return}u=ai;c[t>>2]=c[u>>2];c[t+4>>2]=c[u+4>>2];c[t+8>>2]=c[u+8>>2];c[u>>2]=c[M>>2];c[u+4>>2]=c[M+4>>2];c[u+8>>2]=c[M+8>>2];c[M>>2]=c[t>>2];c[M+4>>2]=c[t+4>>2];c[M+8>>2]=c[t+8>>2];if(!(bH[c[d>>2]&255](ai,N)|0)){i=e;return}t=N;c[r>>2]=c[t>>2];c[r+4>>2]=c[t+4>>2];c[r+8>>2]=c[t+8>>2];c[t>>2]=c[u>>2];c[t+4>>2]=c[u+4>>2];c[t+8>>2]=c[u+8>>2];c[u>>2]=c[r>>2];c[u+4>>2]=c[r+4>>2];c[u+8>>2]=c[r+8>>2];i=e;return}r=N;if(an){c[K>>2]=c[r>>2];c[K+4>>2]=c[r+4>>2];c[K+8>>2]=c[r+8>>2];c[r>>2]=c[M>>2];c[r+4>>2]=c[M+4>>2];c[r+8>>2]=c[M+8>>2];c[M>>2]=c[K>>2];c[M+4>>2]=c[K+4>>2];c[M+8>>2]=c[K+8>>2];i=e;return}c[q>>2]=c[r>>2];c[q+4>>2]=c[r+4>>2];c[q+8>>2]=c[r+8>>2];K=ai;c[r>>2]=c[K>>2];c[r+4>>2]=c[K+4>>2];c[r+8>>2]=c[K+8>>2];c[K>>2]=c[q>>2];c[K+4>>2]=c[q+4>>2];c[K+8>>2]=c[q+8>>2];if(!(bH[c[d>>2]&255](L,ai)|0)){i=e;return}c[s>>2]=c[K>>2];c[s+4>>2]=c[K+4>>2];c[s+8>>2]=c[K+8>>2];c[K>>2]=c[M>>2];c[K+4>>2]=c[M+4>>2];c[K+8>>2]=c[M+8>>2];c[M>>2]=c[s>>2];c[M+4>>2]=c[s+4>>2];c[M+8>>2]=c[s+8>>2];i=e;return}else if((R|0)==1353){s=l;K=N+24|0;ai=N+12|0;q=f;f=g;g=h;h=j;j=k;k=bH[c[d>>2]&255](ai,N)|0;r=bH[c[d>>2]&255](K,ai)|0;do{if(k){an=N;if(r){c[q>>2]=c[an>>2];c[q+4>>2]=c[an+4>>2];c[q+8>>2]=c[an+8>>2];u=K;c[an>>2]=c[u>>2];c[an+4>>2]=c[u+4>>2];c[an+8>>2]=c[u+8>>2];c[u>>2]=c[q>>2];c[u+4>>2]=c[q+4>>2];c[u+8>>2]=c[q+8>>2];break}c[f>>2]=c[an>>2];c[f+4>>2]=c[an+4>>2];c[f+8>>2]=c[an+8>>2];u=ai;c[an>>2]=c[u>>2];c[an+4>>2]=c[u+4>>2];c[an+8>>2]=c[u+8>>2];c[u>>2]=c[f>>2];c[u+4>>2]=c[f+4>>2];c[u+8>>2]=c[f+8>>2];if(!(bH[c[d>>2]&255](K,ai)|0)){break}c[h>>2]=c[u>>2];c[h+4>>2]=c[u+4>>2];c[h+8>>2]=c[u+8>>2];an=K;c[u>>2]=c[an>>2];c[u+4>>2]=c[an+4>>2];c[u+8>>2]=c[an+8>>2];c[an>>2]=c[h>>2];c[an+4>>2]=c[h+4>>2];c[an+8>>2]=c[h+8>>2]}else{if(!r){break}an=ai;c[j>>2]=c[an>>2];c[j+4>>2]=c[an+4>>2];c[j+8>>2]=c[an+8>>2];u=K;c[an>>2]=c[u>>2];c[an+4>>2]=c[u+4>>2];c[an+8>>2]=c[u+8>>2];c[u>>2]=c[j>>2];c[u+4>>2]=c[j+4>>2];c[u+8>>2]=c[j+8>>2];if(!(bH[c[d>>2]&255](ai,N)|0)){break}u=N;c[g>>2]=c[u>>2];c[g+4>>2]=c[u+4>>2];c[g+8>>2]=c[u+8>>2];c[u>>2]=c[an>>2];c[u+4>>2]=c[an+4>>2];c[u+8>>2]=c[an+8>>2];c[an>>2]=c[g>>2];c[an+4>>2]=c[g+4>>2];c[an+8>>2]=c[g+8>>2]}}while(0);g=N+36|0;if((g|0)==(a|0)){i=e;return}else{ao=K;ap=g}while(1){if(bH[c[d>>2]&255](ap,ao)|0){g=ap;c[s>>2]=c[g>>2];c[s+4>>2]=c[g+4>>2];c[s+8>>2]=c[g+8>>2];g=ao;K=ap;while(1){ai=K;aq=g;c[ai>>2]=c[aq>>2];c[ai+4>>2]=c[aq+4>>2];c[ai+8>>2]=c[aq+8>>2];if((g|0)==(N|0)){break}ai=g-12|0;if(bH[c[d>>2]&255](l,ai)|0){K=g;g=ai}else{break}}c[aq>>2]=c[s>>2];c[aq+4>>2]=c[s+4>>2];c[aq+8>>2]=c[s+8>>2]}g=ap+12|0;if((g|0)==(a|0)){break}else{ao=ap;ap=g}}i=e;return}else if((R|0)==1346){dA(N,N+12|0,N+24|0,L,d);i=e;return}else if((R|0)==1336){if(!(bH[c[d>>2]&255](L,N)|0)){i=e;return}ap=v;v=N;c[ap>>2]=c[v>>2];c[ap+4>>2]=c[v+4>>2];c[ap+8>>2]=c[v+8>>2];c[v>>2]=c[M>>2];c[v+4>>2]=c[M+4>>2];c[v+8>>2]=c[M+8>>2];c[M>>2]=c[ap>>2];c[M+4>>2]=c[ap+4>>2];c[M+8>>2]=c[ap+8>>2];i=e;return}else if((R|0)==1347){R=N+12|0;ap=N+24|0;v=N+36|0;ao=m;m=n;n=o;o=p;dA(N,R,ap,v,d);if(!(bH[c[d>>2]&255](L,v)|0)){i=e;return}L=v;c[o>>2]=c[L>>2];c[o+4>>2]=c[L+4>>2];c[o+8>>2]=c[L+8>>2];c[L>>2]=c[M>>2];c[L+4>>2]=c[M+4>>2];c[L+8>>2]=c[M+8>>2];c[M>>2]=c[o>>2];c[M+4>>2]=c[o+4>>2];c[M+8>>2]=c[o+8>>2];if(!(bH[c[d>>2]&255](v,ap)|0)){i=e;return}v=ap;c[m>>2]=c[v>>2];c[m+4>>2]=c[v+4>>2];c[m+8>>2]=c[v+8>>2];c[v>>2]=c[L>>2];c[v+4>>2]=c[L+4>>2];c[v+8>>2]=c[L+8>>2];c[L>>2]=c[m>>2];c[L+4>>2]=c[m+4>>2];c[L+8>>2]=c[m+8>>2];if(!(bH[c[d>>2]&255](ap,R)|0)){i=e;return}ap=R;c[ao>>2]=c[ap>>2];c[ao+4>>2]=c[ap+4>>2];c[ao+8>>2]=c[ap+8>>2];c[ap>>2]=c[v>>2];c[ap+4>>2]=c[v+4>>2];c[ap+8>>2]=c[v+8>>2];c[v>>2]=c[ao>>2];c[v+4>>2]=c[ao+4>>2];c[v+8>>2]=c[ao+8>>2];if(!(bH[c[d>>2]&255](R,N)|0)){i=e;return}R=N;c[n>>2]=c[R>>2];c[n+4>>2]=c[R+4>>2];c[n+8>>2]=c[R+8>>2];c[R>>2]=c[ap>>2];c[R+4>>2]=c[ap+4>>2];c[R+8>>2]=c[ap+8>>2];c[ap>>2]=c[n>>2];c[ap+4>>2]=c[n+4>>2];c[ap+8>>2]=c[n+8>>2];i=e;return}}function dA(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+128|0;h=g+80|0;j=g+96|0;k=g+112|0;l=g|0;m=g+16|0;n=g+32|0;o=g+48|0;p=g+64|0;q=bH[c[f>>2]&255](b,a)|0;r=bH[c[f>>2]&255](d,b)|0;do{if(q){s=a;if(r){c[l>>2]=c[s>>2];c[l+4>>2]=c[s+4>>2];c[l+8>>2]=c[s+8>>2];t=d;c[s>>2]=c[t>>2];c[s+4>>2]=c[t+4>>2];c[s+8>>2]=c[t+8>>2];c[t>>2]=c[l>>2];c[t+4>>2]=c[l+4>>2];c[t+8>>2]=c[l+8>>2];u=1;break}c[m>>2]=c[s>>2];c[m+4>>2]=c[s+4>>2];c[m+8>>2]=c[s+8>>2];t=b;c[s>>2]=c[t>>2];c[s+4>>2]=c[t+4>>2];c[s+8>>2]=c[t+8>>2];c[t>>2]=c[m>>2];c[t+4>>2]=c[m+4>>2];c[t+8>>2]=c[m+8>>2];if(!(bH[c[f>>2]&255](d,b)|0)){u=1;break}c[o>>2]=c[t>>2];c[o+4>>2]=c[t+4>>2];c[o+8>>2]=c[t+8>>2];s=d;c[t>>2]=c[s>>2];c[t+4>>2]=c[s+4>>2];c[t+8>>2]=c[s+8>>2];c[s>>2]=c[o>>2];c[s+4>>2]=c[o+4>>2];c[s+8>>2]=c[o+8>>2];u=2}else{if(!r){u=0;break}s=b;c[p>>2]=c[s>>2];c[p+4>>2]=c[s+4>>2];c[p+8>>2]=c[s+8>>2];t=d;c[s>>2]=c[t>>2];c[s+4>>2]=c[t+4>>2];c[s+8>>2]=c[t+8>>2];c[t>>2]=c[p>>2];c[t+4>>2]=c[p+4>>2];c[t+8>>2]=c[p+8>>2];if(!(bH[c[f>>2]&255](b,a)|0)){u=1;break}t=a;c[n>>2]=c[t>>2];c[n+4>>2]=c[t+4>>2];c[n+8>>2]=c[t+8>>2];c[t>>2]=c[s>>2];c[t+4>>2]=c[s+4>>2];c[t+8>>2]=c[s+8>>2];c[s>>2]=c[n>>2];c[s+4>>2]=c[n+4>>2];c[s+8>>2]=c[n+8>>2];u=2}}while(0);if(!(bH[c[f>>2]&255](e,d)|0)){v=u;i=g;return v|0}n=k;k=d;c[n>>2]=c[k>>2];c[n+4>>2]=c[k+4>>2];c[n+8>>2]=c[k+8>>2];p=e;c[k>>2]=c[p>>2];c[k+4>>2]=c[p+4>>2];c[k+8>>2]=c[p+8>>2];c[p>>2]=c[n>>2];c[p+4>>2]=c[n+4>>2];c[p+8>>2]=c[n+8>>2];if(!(bH[c[f>>2]&255](d,b)|0)){v=u+1|0;i=g;return v|0}d=h;h=b;c[d>>2]=c[h>>2];c[d+4>>2]=c[h+4>>2];c[d+8>>2]=c[h+8>>2];c[h>>2]=c[k>>2];c[h+4>>2]=c[k+4>>2];c[h+8>>2]=c[k+8>>2];c[k>>2]=c[d>>2];c[k+4>>2]=c[d+4>>2];c[k+8>>2]=c[d+8>>2];if(!(bH[c[f>>2]&255](b,a)|0)){v=u+2|0;i=g;return v|0}b=j;j=a;c[b>>2]=c[j>>2];c[b+4>>2]=c[j+4>>2];c[b+8>>2]=c[j+8>>2];c[j>>2]=c[h>>2];c[j+4>>2]=c[h+4>>2];c[j+8>>2]=c[h+8>>2];c[h>>2]=c[b>>2];c[h+4>>2]=c[b+4>>2];c[h+8>>2]=c[b+8>>2];v=u+3|0;i=g;return v|0}function dB(a,b){a=a|0;b=b|0;return}function dC(a,b){a=a|0;b=b|0;return}function dD(a,b,c){a=a|0;b=b|0;c=c|0;return}function dE(a,b,c){a=a|0;b=b|0;c=c|0;return}function dF(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;e=i;i=i+256|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;l=e+80|0;m=e+96|0;n=e+112|0;o=e+128|0;p=e+144|0;q=e+160|0;r=e+176|0;s=e+192|0;t=e+208|0;u=e+224|0;v=e+240|0;w=(b-a|0)/12&-1;if((w|0)==2){x=b-12|0;if(!(bH[c[d>>2]&255](x,a)|0)){y=1;i=e;return y|0}z=u;u=a;c[z>>2]=c[u>>2];c[z+4>>2]=c[u+4>>2];c[z+8>>2]=c[u+8>>2];A=x;c[u>>2]=c[A>>2];c[u+4>>2]=c[A+4>>2];c[u+8>>2]=c[A+8>>2];c[A>>2]=c[z>>2];c[A+4>>2]=c[z+4>>2];c[A+8>>2]=c[z+8>>2];y=1;i=e;return y|0}else if((w|0)==4){dA(a,a+12|0,a+24|0,b-12|0,d);y=1;i=e;return y|0}else if((w|0)==5){z=a+12|0;A=a+24|0;u=a+36|0;x=b-12|0;B=l;l=m;m=n;n=o;dA(a,z,A,u,d);if(!(bH[c[d>>2]&255](x,u)|0)){y=1;i=e;return y|0}o=u;c[n>>2]=c[o>>2];c[n+4>>2]=c[o+4>>2];c[n+8>>2]=c[o+8>>2];C=x;c[o>>2]=c[C>>2];c[o+4>>2]=c[C+4>>2];c[o+8>>2]=c[C+8>>2];c[C>>2]=c[n>>2];c[C+4>>2]=c[n+4>>2];c[C+8>>2]=c[n+8>>2];if(!(bH[c[d>>2]&255](u,A)|0)){y=1;i=e;return y|0}u=A;c[l>>2]=c[u>>2];c[l+4>>2]=c[u+4>>2];c[l+8>>2]=c[u+8>>2];c[u>>2]=c[o>>2];c[u+4>>2]=c[o+4>>2];c[u+8>>2]=c[o+8>>2];c[o>>2]=c[l>>2];c[o+4>>2]=c[l+4>>2];c[o+8>>2]=c[l+8>>2];if(!(bH[c[d>>2]&255](A,z)|0)){y=1;i=e;return y|0}A=z;c[B>>2]=c[A>>2];c[B+4>>2]=c[A+4>>2];c[B+8>>2]=c[A+8>>2];c[A>>2]=c[u>>2];c[A+4>>2]=c[u+4>>2];c[A+8>>2]=c[u+8>>2];c[u>>2]=c[B>>2];c[u+4>>2]=c[B+4>>2];c[u+8>>2]=c[B+8>>2];if(!(bH[c[d>>2]&255](z,a)|0)){y=1;i=e;return y|0}z=a;c[m>>2]=c[z>>2];c[m+4>>2]=c[z+4>>2];c[m+8>>2]=c[z+8>>2];c[z>>2]=c[A>>2];c[z+4>>2]=c[A+4>>2];c[z+8>>2]=c[A+8>>2];c[A>>2]=c[m>>2];c[A+4>>2]=c[m+4>>2];c[A+8>>2]=c[m+8>>2];y=1;i=e;return y|0}else if((w|0)==0|(w|0)==1){y=1;i=e;return y|0}else if((w|0)==3){w=a+12|0;m=b-12|0;A=p;p=q;q=r;r=s;s=t;t=bH[c[d>>2]&255](w,a)|0;z=bH[c[d>>2]&255](m,w)|0;if(!t){if(!z){y=1;i=e;return y|0}t=w;c[s>>2]=c[t>>2];c[s+4>>2]=c[t+4>>2];c[s+8>>2]=c[t+8>>2];B=m;c[t>>2]=c[B>>2];c[t+4>>2]=c[B+4>>2];c[t+8>>2]=c[B+8>>2];c[B>>2]=c[s>>2];c[B+4>>2]=c[s+4>>2];c[B+8>>2]=c[s+8>>2];if(!(bH[c[d>>2]&255](w,a)|0)){y=1;i=e;return y|0}s=a;c[q>>2]=c[s>>2];c[q+4>>2]=c[s+4>>2];c[q+8>>2]=c[s+8>>2];c[s>>2]=c[t>>2];c[s+4>>2]=c[t+4>>2];c[s+8>>2]=c[t+8>>2];c[t>>2]=c[q>>2];c[t+4>>2]=c[q+4>>2];c[t+8>>2]=c[q+8>>2];y=1;i=e;return y|0}q=a;if(z){c[A>>2]=c[q>>2];c[A+4>>2]=c[q+4>>2];c[A+8>>2]=c[q+8>>2];z=m;c[q>>2]=c[z>>2];c[q+4>>2]=c[z+4>>2];c[q+8>>2]=c[z+8>>2];c[z>>2]=c[A>>2];c[z+4>>2]=c[A+4>>2];c[z+8>>2]=c[A+8>>2];y=1;i=e;return y|0}c[p>>2]=c[q>>2];c[p+4>>2]=c[q+4>>2];c[p+8>>2]=c[q+8>>2];A=w;c[q>>2]=c[A>>2];c[q+4>>2]=c[A+4>>2];c[q+8>>2]=c[A+8>>2];c[A>>2]=c[p>>2];c[A+4>>2]=c[p+4>>2];c[A+8>>2]=c[p+8>>2];if(!(bH[c[d>>2]&255](m,w)|0)){y=1;i=e;return y|0}c[r>>2]=c[A>>2];c[r+4>>2]=c[A+4>>2];c[r+8>>2]=c[A+8>>2];w=m;c[A>>2]=c[w>>2];c[A+4>>2]=c[w+4>>2];c[A+8>>2]=c[w+8>>2];c[w>>2]=c[r>>2];c[w+4>>2]=c[r+4>>2];c[w+8>>2]=c[r+8>>2];y=1;i=e;return y|0}else{r=a+24|0;w=a+12|0;A=f;f=g;g=h;h=j;j=k;k=bH[c[d>>2]&255](w,a)|0;m=bH[c[d>>2]&255](r,w)|0;do{if(k){p=a;if(m){c[A>>2]=c[p>>2];c[A+4>>2]=c[p+4>>2];c[A+8>>2]=c[p+8>>2];q=r;c[p>>2]=c[q>>2];c[p+4>>2]=c[q+4>>2];c[p+8>>2]=c[q+8>>2];c[q>>2]=c[A>>2];c[q+4>>2]=c[A+4>>2];c[q+8>>2]=c[A+8>>2];break}c[f>>2]=c[p>>2];c[f+4>>2]=c[p+4>>2];c[f+8>>2]=c[p+8>>2];q=w;c[p>>2]=c[q>>2];c[p+4>>2]=c[q+4>>2];c[p+8>>2]=c[q+8>>2];c[q>>2]=c[f>>2];c[q+4>>2]=c[f+4>>2];c[q+8>>2]=c[f+8>>2];if(!(bH[c[d>>2]&255](r,w)|0)){break}c[h>>2]=c[q>>2];c[h+4>>2]=c[q+4>>2];c[h+8>>2]=c[q+8>>2];p=r;c[q>>2]=c[p>>2];c[q+4>>2]=c[p+4>>2];c[q+8>>2]=c[p+8>>2];c[p>>2]=c[h>>2];c[p+4>>2]=c[h+4>>2];c[p+8>>2]=c[h+8>>2]}else{if(!m){break}p=w;c[j>>2]=c[p>>2];c[j+4>>2]=c[p+4>>2];c[j+8>>2]=c[p+8>>2];q=r;c[p>>2]=c[q>>2];c[p+4>>2]=c[q+4>>2];c[p+8>>2]=c[q+8>>2];c[q>>2]=c[j>>2];c[q+4>>2]=c[j+4>>2];c[q+8>>2]=c[j+8>>2];if(!(bH[c[d>>2]&255](w,a)|0)){break}q=a;c[g>>2]=c[q>>2];c[g+4>>2]=c[q+4>>2];c[g+8>>2]=c[q+8>>2];c[q>>2]=c[p>>2];c[q+4>>2]=c[p+4>>2];c[q+8>>2]=c[p+8>>2];c[p>>2]=c[g>>2];c[p+4>>2]=c[g+4>>2];c[p+8>>2]=c[g+8>>2]}}while(0);g=a+36|0;if((g|0)==(b|0)){y=1;i=e;return y|0}w=v;j=r;r=0;m=g;while(1){if(bH[c[d>>2]&255](m,j)|0){g=m;c[w>>2]=c[g>>2];c[w+4>>2]=c[g+4>>2];c[w+8>>2]=c[g+8>>2];g=j;h=m;while(1){f=h;D=g;c[f>>2]=c[D>>2];c[f+4>>2]=c[D+4>>2];c[f+8>>2]=c[D+8>>2];if((g|0)==(a|0)){break}f=g-12|0;if(bH[c[d>>2]&255](v,f)|0){h=g;g=f}else{break}}c[D>>2]=c[w>>2];c[D+4>>2]=c[w+4>>2];c[D+8>>2]=c[w+8>>2];g=r+1|0;if((g|0)==8){break}else{E=g}}else{E=r}g=m+12|0;if((g|0)==(b|0)){y=1;F=1502;break}else{j=m;r=E;m=g}}if((F|0)==1502){i=e;return y|0}y=(m+12|0)==(b|0);i=e;return y|0}return 0}function dG(a){a=a|0;vl(a);return}function dH(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0,O=0,P=0;f=i;i=i+40|0;h=f|0;j=f+16|0;k=f+32|0;l=a+28|0;if((c[l>>2]|0)<=0){i=f;return}m=a+24|0;n=a+12|0;a=h|0;o=j|0;p=h+4|0;q=j+4|0;r=h+8|0;s=j+8|0;t=h+12|0;u=j+12|0;v=e|0;w=d|0;x=e+4|0;y=d+4|0;z=k|0;A=k+4|0;B=b|0;C=b+40|0;D=b+36|0;E=b+32|0;b=0;do{F=c[m>>2]|0;G=c[n>>2]|0;H=F+(b*28&-1)+20|0;bQ[c[(c[G>>2]|0)+24>>2]&127](G,h,d,c[H>>2]|0);G=c[n>>2]|0;bQ[c[(c[G>>2]|0)+24>>2]&127](G,j,e,c[H>>2]|0);H=F+(b*28&-1)|0;I=+g[a>>2];J=+g[o>>2];K=+g[p>>2];L=+g[q>>2];G=H;M=+(K<L?K:L);g[G>>2]=I<J?I:J;g[G+4>>2]=M;M=+g[r>>2];J=+g[s>>2];I=+g[t>>2];L=+g[u>>2];G=F+(b*28&-1)+8|0;K=+(I>L?I:L);g[G>>2]=M>J?M:J;g[G+4>>2]=K;K=+g[x>>2]- +g[y>>2];g[z>>2]=+g[v>>2]- +g[w>>2];g[A>>2]=K;G=c[F+(b*28&-1)+24>>2]|0;if(cn(B,G,H,k)|0){H=c[C>>2]|0;if((H|0)==(c[D>>2]|0)){F=c[E>>2]|0;c[D>>2]=H<<1;N=vh(H<<3)|0;c[E>>2]=N;O=F;vp(N|0,O|0,c[C>>2]<<2);vi(O);P=c[C>>2]|0}else{P=H}c[(c[E>>2]|0)+(P<<2)>>2]=G;c[C>>2]=(c[C>>2]|0)+1}b=b+1|0;}while((b|0)<(c[l>>2]|0));i=f;return}function dI(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;b=a+8|0;d=c[b>>2]|0;if((d|0)==0){return}e=c[d+112>>2]|0;if((e|0)==0){f=d}else{d=e;do{e=c[d+4>>2]|0;if((c[e+48>>2]|0)==(a|0)|(c[e+52>>2]|0)==(a|0)){g=e+4|0;c[g>>2]=c[g>>2]|8}d=c[d+12>>2]|0;}while((d|0)!=0);f=c[b>>2]|0}b=c[f+88>>2]|0;if((b|0)==0){return}f=a+28|0;if((c[f>>2]|0)<=0){return}d=a+24|0;a=b+102912|0;g=b+102908|0;e=b+102904|0;b=0;h=c[a>>2]|0;do{i=c[(c[d>>2]|0)+(b*28&-1)+24>>2]|0;if((h|0)==(c[g>>2]|0)){j=c[e>>2]|0;c[g>>2]=h<<1;k=vh(h<<3)|0;c[e>>2]=k;l=j;vp(k|0,l|0,c[a>>2]<<2);vi(l);m=c[a>>2]|0}else{m=h}c[(c[e>>2]|0)+(m<<2)>>2]=i;h=(c[a>>2]|0)+1|0;c[a>>2]=h;b=b+1|0;}while((b|0)<(c[f>>2]|0));return}function dJ(d,f){d=d|0;f=f|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0,v=0,w=0;j=i;db(7320,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(6312,(u=i,i=i+8|0,h[u>>3]=+g[d+16>>2],u)|0);db(5776,(u=i,i=i+8|0,h[u>>3]=+g[d+20>>2],u)|0);db(5272,(u=i,i=i+8|0,h[u>>3]=+g[d>>2],u)|0);db(4904,(u=i,i=i+8|0,c[u>>2]=a[d+38|0]&1,u)|0);db(4624,(u=i,i=i+8|0,c[u>>2]=e[d+32>>1]|0,u)|0);db(4392,(u=i,i=i+8|0,c[u>>2]=e[d+34>>1]|0,u)|0);db(12896,(u=i,i=i+8|0,c[u>>2]=b[d+36>>1]|0,u)|0);k=c[d+12>>2]|0;d=c[k+4>>2]|0;if((d|0)==3){l=k;db(8680,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);m=k+16|0;db(9544,(u=i,i=i+8|0,c[u>>2]=c[m>>2],u)|0);n=c[m>>2]|0;if((n|0)>0){o=k+12|0;p=0;while(1){q=c[o>>2]|0;r=+g[q+(p<<3)>>2];s=+g[q+(p<<3)+4>>2];db(9104,(u=i,i=i+24|0,c[u>>2]=p,h[u+8>>3]=r,h[u+16>>3]=s,u)|0);q=p+1|0;t=c[m>>2]|0;if((q|0)<(t|0)){p=q}else{v=t;break}}}else{v=n}db(8312,(u=i,i=i+8|0,c[u>>2]=v,u)|0);v=k+20|0;s=+g[v+4>>2];db(8080,(u=i,i=i+16|0,h[u>>3]=+g[v>>2],h[u+8>>3]=s,u)|0);v=k+28|0;s=+g[v+4>>2];db(7792,(u=i,i=i+16|0,h[u>>3]=+g[v>>2],h[u+8>>3]=s,u)|0);db(7584,(u=i,i=i+8|0,c[u>>2]=a[k+36|0]&1,u)|0);db(7440,(u=i,i=i+8|0,c[u>>2]=a[l+37|0]&1,u)|0)}else if((d|0)==2){db(9872,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(9544,(u=i,i=i+8|0,c[u>>2]=8,u)|0);l=k+148|0;v=c[l>>2]|0;if((v|0)>0){n=k+20|0;p=0;while(1){s=+g[n+(p<<3)>>2];r=+g[n+(p<<3)+4>>2];db(9104,(u=i,i=i+24|0,c[u>>2]=p,h[u+8>>3]=s,h[u+16>>3]=r,u)|0);m=p+1|0;o=c[l>>2]|0;if((m|0)<(o|0)){p=m}else{w=o;break}}}else{w=v}db(8840,(u=i,i=i+8|0,c[u>>2]=w,u)|0)}else if((d|0)==1){db(11368,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(12200,(u=i,i=i+8|0,h[u>>3]=+g[k+8>>2],u)|0);w=k+28|0;r=+g[w+4>>2];db(11152,(u=i,i=i+16|0,h[u>>3]=+g[w>>2],h[u+8>>3]=r,u)|0);r=+g[k+16>>2];db(10928,(u=i,i=i+16|0,h[u>>3]=+g[k+12>>2],h[u+8>>3]=r,u)|0);w=k+20|0;r=+g[w+4>>2];db(10728,(u=i,i=i+16|0,h[u>>3]=+g[w>>2],h[u+8>>3]=r,u)|0);r=+g[k+40>>2];db(10528,(u=i,i=i+16|0,h[u>>3]=+g[k+36>>2],h[u+8>>3]=r,u)|0);db(10408,(u=i,i=i+8|0,c[u>>2]=a[k+44|0]&1,u)|0);db(10200,(u=i,i=i+8|0,c[u>>2]=a[k+45|0]&1,u)|0)}else if((d|0)==0){db(12696,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(12200,(u=i,i=i+8|0,h[u>>3]=+g[k+8>>2],u)|0);r=+g[k+16>>2];db(11600,(u=i,i=i+16|0,h[u>>3]=+g[k+12>>2],h[u+8>>3]=r,u)|0)}else{i=j;return}db(7344,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(7208,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(7344,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(7016,(u=i,i=i+8|0,c[u>>2]=f,u)|0);i=j;return}function dK(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;if((c[b+28>>2]|0)!=0){bc(12280,72,14920,12608)}e=b+12|0;f=c[e>>2]|0;g=bs[c[(c[f>>2]|0)+12>>2]&1023](f)|0;f=b+24|0;b=c[f>>2]|0;h=b;i=g*28&-1;do{if((i|0)!=0){if((i|0)<=0){bc(5352,164,17448,8376)}if((i|0)>640){vi(h);break}g=a[i+22064|0]|0;if((g&255)<14){j=d+12+((g&255)<<2)|0;c[b>>2]=c[j>>2];c[j>>2]=b;break}else{bc(5352,173,17448,6544)}}}while(0);c[f>>2]=0;f=c[e>>2]|0;b=c[f+4>>2]|0;if((b|0)==0){bq[c[c[f>>2]>>2]&511](f);i=a[22084]|0;if((i&255)>=14){bc(5352,173,17448,6544)}h=d+12+((i&255)<<2)|0;c[f>>2]=c[h>>2];c[h>>2]=f;c[e>>2]=0;return}else if((b|0)==2){bq[c[c[f>>2]>>2]&511](f);h=a[22216]|0;if((h&255)>=14){bc(5352,173,17448,6544)}i=d+12+((h&255)<<2)|0;c[f>>2]=c[i>>2];c[i>>2]=f;c[e>>2]=0;return}else if((b|0)==1){bq[c[c[f>>2]>>2]&511](f);i=a[22112]|0;if((i&255)>=14){bc(5352,173,17448,6544)}h=d+12+((i&255)<<2)|0;c[f>>2]=c[h>>2];c[h>>2]=f;c[e>>2]=0;return}else if((b|0)==3){bq[c[c[f>>2]>>2]&511](f);b=a[22104]|0;if((b&255)>=14){bc(5352,173,17448,6544)}h=d+12+((b&255)<<2)|0;c[f>>2]=c[h>>2];c[h>>2]=f;c[e>>2]=0;return}else{bc(12280,115,14920,11592)}}function dL(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;i=b+40|0;c[i>>2]=d;c[b+44>>2]=e;c[b+48>>2]=f;c[b+28>>2]=0;c[b+36>>2]=0;c[b+32>>2]=0;j=b|0;c[j>>2]=g;c[b+4>>2]=h;h=d<<2;d=g+102796|0;k=c[d>>2]|0;if((k|0)>=32){bc(4840,38,17040,6448)}l=g+102412+(k*12&-1)|0;c[g+102412+(k*12&-1)+4>>2]=h;m=g+102400|0;n=c[m>>2]|0;if((n+h|0)>102400){c[l>>2]=vh(h)|0;a[g+102412+(k*12&-1)+8|0]=1}else{c[l>>2]=g+n;a[g+102412+(k*12&-1)+8|0]=0;c[m>>2]=(c[m>>2]|0)+h}m=g+102404|0;k=(c[m>>2]|0)+h|0;c[m>>2]=k;m=g+102408|0;g=c[m>>2]|0;c[m>>2]=(g|0)>(k|0)?g:k;c[d>>2]=(c[d>>2]|0)+1;c[b+8>>2]=c[l>>2];l=c[j>>2]|0;d=e<<2;e=l+102796|0;k=c[e>>2]|0;if((k|0)>=32){bc(4840,38,17040,6448)}g=l+102412+(k*12&-1)|0;c[l+102412+(k*12&-1)+4>>2]=d;m=l+102400|0;h=c[m>>2]|0;if((h+d|0)>102400){c[g>>2]=vh(d)|0;a[l+102412+(k*12&-1)+8|0]=1}else{c[g>>2]=l+h;a[l+102412+(k*12&-1)+8|0]=0;c[m>>2]=(c[m>>2]|0)+d}m=l+102404|0;k=(c[m>>2]|0)+d|0;c[m>>2]=k;m=l+102408|0;l=c[m>>2]|0;c[m>>2]=(l|0)>(k|0)?l:k;c[e>>2]=(c[e>>2]|0)+1;c[b+12>>2]=c[g>>2];g=c[j>>2]|0;e=f<<2;f=g+102796|0;k=c[f>>2]|0;if((k|0)>=32){bc(4840,38,17040,6448)}l=g+102412+(k*12&-1)|0;c[g+102412+(k*12&-1)+4>>2]=e;m=g+102400|0;d=c[m>>2]|0;if((d+e|0)>102400){c[l>>2]=vh(e)|0;a[g+102412+(k*12&-1)+8|0]=1}else{c[l>>2]=g+d;a[g+102412+(k*12&-1)+8|0]=0;c[m>>2]=(c[m>>2]|0)+e}m=g+102404|0;k=(c[m>>2]|0)+e|0;c[m>>2]=k;m=g+102408|0;g=c[m>>2]|0;c[m>>2]=(g|0)>(k|0)?g:k;c[f>>2]=(c[f>>2]|0)+1;c[b+16>>2]=c[l>>2];l=c[j>>2]|0;f=(c[i>>2]|0)*12&-1;k=l+102796|0;g=c[k>>2]|0;if((g|0)>=32){bc(4840,38,17040,6448)}m=l+102412+(g*12&-1)|0;c[l+102412+(g*12&-1)+4>>2]=f;e=l+102400|0;d=c[e>>2]|0;if((d+f|0)>102400){c[m>>2]=vh(f)|0;a[l+102412+(g*12&-1)+8|0]=1}else{c[m>>2]=l+d;a[l+102412+(g*12&-1)+8|0]=0;c[e>>2]=(c[e>>2]|0)+f}e=l+102404|0;g=(c[e>>2]|0)+f|0;c[e>>2]=g;e=l+102408|0;l=c[e>>2]|0;c[e>>2]=(l|0)>(g|0)?l:g;c[k>>2]=(c[k>>2]|0)+1;c[b+24>>2]=c[m>>2];m=c[j>>2]|0;j=(c[i>>2]|0)*12&-1;i=m+102796|0;k=c[i>>2]|0;if((k|0)>=32){bc(4840,38,17040,6448)}g=m+102412+(k*12&-1)|0;c[m+102412+(k*12&-1)+4>>2]=j;l=m+102400|0;e=c[l>>2]|0;if((e+j|0)>102400){c[g>>2]=vh(j)|0;a[m+102412+(k*12&-1)+8|0]=1;o=m+102404|0;p=c[o>>2]|0;q=p+j|0;c[o>>2]=q;r=m+102408|0;s=c[r>>2]|0;t=(s|0)>(q|0);u=t?s:q;c[r>>2]=u;v=c[i>>2]|0;w=v+1|0;c[i>>2]=w;x=g|0;y=c[x>>2]|0;z=y;A=b+20|0;c[A>>2]=z;return}else{c[g>>2]=m+e;a[m+102412+(k*12&-1)+8|0]=0;c[l>>2]=(c[l>>2]|0)+j;o=m+102404|0;p=c[o>>2]|0;q=p+j|0;c[o>>2]=q;r=m+102408|0;s=c[r>>2]|0;t=(s|0)>(q|0);u=t?s:q;c[r>>2]=u;v=c[i>>2]|0;w=v+1|0;c[i>>2]=w;x=g|0;y=c[x>>2]|0;z=y;A=b+20|0;c[A>>2]=z;return}}function dM(d,e,f,h,j){d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;var l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0,O=0,Q=0.0,T=0.0,U=0.0,V=0.0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0.0,ad=0.0,ae=0;l=i;i=i+160|0;m=l|0;n=l+24|0;o=l+56|0;p=l+104|0;q=+g[f>>2];r=d+28|0;if((c[r>>2]|0)>0){s=d+8|0;t=h|0;u=h+4|0;h=d+20|0;v=d+24|0;w=0;while(1){x=c[(c[s>>2]|0)+(w<<2)>>2]|0;y=x+44|0;z=c[y>>2]|0;A=c[y+4>>2]|0;B=+g[x+56>>2];y=x+64|0;C=+g[y>>2];D=+g[y+4>>2];E=+g[x+72>>2];y=x+36|0;c[y>>2]=z;c[y+4>>2]=A;g[x+52>>2]=B;if((c[x>>2]|0)==2){F=+g[x+140>>2];G=+g[x+120>>2];H=1.0-q*+g[x+132>>2];I=H<1.0?H:1.0;H=I<0.0?0.0:I;I=1.0-q*+g[x+136>>2];J=I<1.0?I:1.0;K=(E+q*+g[x+128>>2]*+g[x+84>>2])*(J<0.0?0.0:J);L=(C+q*(F*+g[t>>2]+G*+g[x+76>>2]))*H;M=(D+q*(F*+g[u>>2]+G*+g[x+80>>2]))*H}else{K=E;L=C;M=D}x=(c[h>>2]|0)+(w*12&-1)|0;c[x>>2]=z;c[x+4>>2]=A;g[(c[h>>2]|0)+(w*12&-1)+8>>2]=B;A=(c[v>>2]|0)+(w*12&-1)|0;B=+M;g[A>>2]=L;g[A+4>>2]=B;g[(c[v>>2]|0)+(w*12&-1)+8>>2]=K;A=w+1|0;if((A|0)<(c[r>>2]|0)){w=A}else{N=h;O=v;break}}}else{N=d+20|0;O=d+24|0}v=n;h=f;c[v>>2]=c[h>>2];c[v+4>>2]=c[h+4>>2];c[v+8>>2]=c[h+8>>2];c[v+12>>2]=c[h+12>>2];c[v+16>>2]=c[h+16>>2];c[v+20>>2]=c[h+20>>2];v=c[N>>2]|0;c[n+24>>2]=v;w=c[O>>2]|0;c[n+28>>2]=w;u=o;c[u>>2]=c[h>>2];c[u+4>>2]=c[h+4>>2];c[u+8>>2]=c[h+8>>2];c[u+12>>2]=c[h+12>>2];c[u+16>>2]=c[h+16>>2];c[u+20>>2]=c[h+20>>2];h=d+12|0;c[o+24>>2]=c[h>>2];u=d+36|0;c[o+28>>2]=c[u>>2];c[o+32>>2]=v;c[o+36>>2]=w;c[o+40>>2]=c[d>>2];en(p,o);ep(p);if((a[f+20|0]&1)!=0){eo(p)}o=d+32|0;if((c[o>>2]|0)>0){w=d+16|0;v=0;do{t=c[(c[w>>2]|0)+(v<<2)>>2]|0;br[c[(c[t>>2]|0)+28>>2]&511](t,n);v=v+1|0;}while((v|0)<(c[o>>2]|0))}g[e+12>>2]=0.0;v=f+12|0;if((c[v>>2]|0)>0){w=d+16|0;t=0;do{if((c[o>>2]|0)>0){s=0;do{A=c[(c[w>>2]|0)+(s<<2)>>2]|0;br[c[(c[A>>2]|0)+32>>2]&511](A,n);s=s+1|0;}while((s|0)<(c[o>>2]|0))}er(p);t=t+1|0;}while((t|0)<(c[v>>2]|0))}v=c[p+48>>2]|0;if((v|0)>0){t=c[p+40>>2]|0;w=c[p+44>>2]|0;s=0;do{A=c[w+(c[t+(s*152&-1)+148>>2]<<2)>>2]|0;x=t+(s*152&-1)+144|0;if((c[x>>2]|0)>0){z=0;do{g[A+64+(z*20&-1)+8>>2]=+g[t+(s*152&-1)+(z*36&-1)+16>>2];g[A+64+(z*20&-1)+12>>2]=+g[t+(s*152&-1)+(z*36&-1)+20>>2];z=z+1|0;}while((z|0)<(c[x>>2]|0))}s=s+1|0;}while((s|0)<(v|0))}g[e+16>>2]=0.0;if((c[r>>2]|0)>0){v=0;do{s=c[N>>2]|0;t=s+(v*12&-1)|0;K=+g[t>>2];L=+g[t+4>>2];M=+g[s+(v*12&-1)+8>>2];s=c[O>>2]|0;w=s+(v*12&-1)|0;B=+g[w>>2];D=+g[w+4>>2];C=+g[s+(v*12&-1)+8>>2];E=q*B;H=q*D;G=E*E+H*H;if(G>4.0){H=2.0/+P(+G);Q=B*H;T=D*H}else{Q=B;T=D}D=q*C;if(D*D>2.4674012660980225){if(D>0.0){U=D}else{U=-0.0-D}V=C*(1.5707963705062866/U)}else{V=C}C=+(L+q*T);g[t>>2]=K+q*Q;g[t+4>>2]=C;g[(c[N>>2]|0)+(v*12&-1)+8>>2]=M+q*V;t=(c[O>>2]|0)+(v*12&-1)|0;M=+T;g[t>>2]=Q;g[t+4>>2]=M;g[(c[O>>2]|0)+(v*12&-1)+8>>2]=V;v=v+1|0;}while((v|0)<(c[r>>2]|0))}v=f+16|0;f=d+16|0;t=0;while(1){if((t|0)>=(c[v>>2]|0)){W=1;break}s=eq(p)|0;if((c[o>>2]|0)>0){w=1;x=0;while(1){z=c[(c[f>>2]|0)+(x<<2)>>2]|0;A=w&bH[c[(c[z>>2]|0)+36>>2]&255](z,n);z=x+1|0;if((z|0)<(c[o>>2]|0)){w=A;x=z}else{X=A;break}}}else{X=1}if(s&X){W=0;break}else{t=t+1|0}}if((c[r>>2]|0)>0){t=d+8|0;X=0;do{o=c[(c[t>>2]|0)+(X<<2)>>2]|0;n=(c[N>>2]|0)+(X*12&-1)|0;f=o+44|0;v=c[n>>2]|0;x=c[n+4>>2]|0;c[f>>2]=v;c[f+4>>2]=x;V=+g[(c[N>>2]|0)+(X*12&-1)+8>>2];g[o+56>>2]=V;f=(c[O>>2]|0)+(X*12&-1)|0;n=o+64|0;w=c[f+4>>2]|0;c[n>>2]=c[f>>2];c[n+4>>2]=w;g[o+72>>2]=+g[(c[O>>2]|0)+(X*12&-1)+8>>2];Q=+S(+V);g[o+20>>2]=Q;T=+R(+V);g[o+24>>2]=T;V=+g[o+28>>2];U=+g[o+32>>2];w=o+12|0;M=+((c[k>>2]=x,+g[k>>2])-(Q*V+T*U));g[w>>2]=(c[k>>2]=v,+g[k>>2])-(T*V-Q*U);g[w+4>>2]=M;X=X+1|0;}while((X|0)<(c[r>>2]|0))}g[e+20>>2]=0.0;e=c[p+40>>2]|0;X=d+4|0;do{if((c[X>>2]|0)!=0){if((c[u>>2]|0)<=0){break}O=m+16|0;N=0;do{t=c[(c[h>>2]|0)+(N<<2)>>2]|0;w=c[e+(N*152&-1)+144>>2]|0;c[O>>2]=w;if((w|0)>0){v=0;do{g[m+(v<<2)>>2]=+g[e+(N*152&-1)+(v*36&-1)+16>>2];g[m+8+(v<<2)>>2]=+g[e+(N*152&-1)+(v*36&-1)+20>>2];v=v+1|0;}while((v|0)<(w|0))}w=c[X>>2]|0;bN[c[(c[w>>2]|0)+20>>2]&127](w,t,m);N=N+1|0;}while((N|0)<(c[u>>2]|0))}}while(0);if(!j){Y=p+32|0;Z=c[Y>>2]|0;_=e;dg(Z,_);$=p+36|0;aa=c[$>>2]|0;ab=aa;dg(Z,ab);i=l;return}j=c[r>>2]|0;if((j|0)>0){u=d+8|0;M=3.4028234663852886e+38;m=0;while(1){X=c[(c[u>>2]|0)+(m<<2)>>2]|0;L2198:do{if((c[X>>2]|0)==0){ac=M}else{do{if((b[X+4>>1]&4)!=0){U=+g[X+72>>2];if(U*U>.001218469929881394){break}U=+g[X+64>>2];Q=+g[X+68>>2];if(U*U+Q*Q>9999999747378752.0e-20){break}h=X+144|0;Q=q+ +g[h>>2];g[h>>2]=Q;ac=M<Q?M:Q;break L2198}}while(0);g[X+144>>2]=0.0;ac=0.0}}while(0);X=m+1|0;t=c[r>>2]|0;if((X|0)<(t|0)){M=ac;m=X}else{ad=ac;ae=t;break}}}else{ad=3.4028234663852886e+38;ae=j}if(!((ae|0)>0&((ad<.5|W)^1))){Y=p+32|0;Z=c[Y>>2]|0;_=e;dg(Z,_);$=p+36|0;aa=c[$>>2]|0;ab=aa;dg(Z,ab);i=l;return}W=d+8|0;d=0;do{ae=c[(c[W>>2]|0)+(d<<2)>>2]|0;j=ae+4|0;b[j>>1]=b[j>>1]&-3;g[ae+144>>2]=0.0;vq(ae+64|0,0,24);d=d+1|0;}while((d|0)<(c[r>>2]|0));Y=p+32|0;Z=c[Y>>2]|0;_=e;dg(Z,_);$=p+36|0;aa=c[$>>2]|0;ab=aa;dg(Z,ab);i=l;return}function dN(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0,L=0,M=0,N=0,O=0,Q=0;f=i;i=i+128|0;h=f|0;j=f+24|0;k=f+72|0;l=a+28|0;m=c[l>>2]|0;if((m|0)<=(d|0)){bc(10776,386,15200,12416)}if((m|0)<=(e|0)){bc(10776,387,15200,9688)}if((m|0)>0){m=a+8|0;n=a+20|0;o=a+24|0;p=0;while(1){q=c[(c[m>>2]|0)+(p<<2)>>2]|0;r=q+44|0;s=(c[n>>2]|0)+(p*12&-1)|0;t=c[r+4>>2]|0;c[s>>2]=c[r>>2];c[s+4>>2]=t;g[(c[n>>2]|0)+(p*12&-1)+8>>2]=+g[q+56>>2];t=q+64|0;s=(c[o>>2]|0)+(p*12&-1)|0;r=c[t+4>>2]|0;c[s>>2]=c[t>>2];c[s+4>>2]=r;g[(c[o>>2]|0)+(p*12&-1)+8>>2]=+g[q+72>>2];q=p+1|0;if((q|0)<(c[l>>2]|0)){p=q}else{u=n;v=o;break}}}else{u=a+20|0;v=a+24|0}o=a+12|0;c[j+24>>2]=c[o>>2];n=a+36|0;c[j+28>>2]=c[n>>2];c[j+40>>2]=c[a>>2];p=j;m=b;c[p>>2]=c[m>>2];c[p+4>>2]=c[m+4>>2];c[p+8>>2]=c[m+8>>2];c[p+12>>2]=c[m+12>>2];c[p+16>>2]=c[m+16>>2];c[p+20>>2]=c[m+20>>2];c[j+32>>2]=c[u>>2];c[j+36>>2]=c[v>>2];en(k,j);j=b+16|0;m=0;while(1){if((m|0)>=(c[j>>2]|0)){break}if(ev(k,d,e)|0){break}else{m=m+1|0}}m=a+8|0;j=(c[u>>2]|0)+(d*12&-1)|0;p=(c[(c[m>>2]|0)+(d<<2)>>2]|0)+36|0;q=c[j+4>>2]|0;c[p>>2]=c[j>>2];c[p+4>>2]=q;g[(c[(c[m>>2]|0)+(d<<2)>>2]|0)+52>>2]=+g[(c[u>>2]|0)+(d*12&-1)+8>>2];d=(c[u>>2]|0)+(e*12&-1)|0;q=(c[(c[m>>2]|0)+(e<<2)>>2]|0)+36|0;p=c[d+4>>2]|0;c[q>>2]=c[d>>2];c[q+4>>2]=p;g[(c[(c[m>>2]|0)+(e<<2)>>2]|0)+52>>2]=+g[(c[u>>2]|0)+(e*12&-1)+8>>2];ep(k);e=b+12|0;if((c[e>>2]|0)>0){p=0;do{er(k);p=p+1|0;}while((p|0)<(c[e>>2]|0))}w=+g[b>>2];if((c[l>>2]|0)>0){b=0;do{e=c[u>>2]|0;p=e+(b*12&-1)|0;x=+g[p>>2];y=+g[p+4>>2];z=+g[e+(b*12&-1)+8>>2];e=c[v>>2]|0;q=e+(b*12&-1)|0;A=+g[q>>2];B=+g[q+4>>2];C=+g[e+(b*12&-1)+8>>2];D=w*A;E=w*B;F=D*D+E*E;if(F>4.0){E=2.0/+P(+F);G=A*E;H=B*E}else{G=A;H=B}B=w*C;if(B*B>2.4674012660980225){if(B>0.0){I=B}else{I=-0.0-B}J=C*(1.5707963705062866/I)}else{J=C}C=x+w*G;x=y+w*H;y=z+w*J;z=+C;B=+x;g[p>>2]=z;g[p+4>>2]=B;g[(c[u>>2]|0)+(b*12&-1)+8>>2]=y;p=(c[v>>2]|0)+(b*12&-1)|0;A=+G;E=+H;g[p>>2]=A;g[p+4>>2]=E;g[(c[v>>2]|0)+(b*12&-1)+8>>2]=J;p=c[(c[m>>2]|0)+(b<<2)>>2]|0;e=p+44|0;g[e>>2]=z;g[e+4>>2]=B;g[p+56>>2]=y;e=p+64|0;g[e>>2]=A;g[e+4>>2]=E;g[p+72>>2]=J;E=+S(+y);g[p+20>>2]=E;A=+R(+y);g[p+24>>2]=A;y=+g[p+28>>2];B=+g[p+32>>2];e=p+12|0;z=+(x-(E*y+A*B));g[e>>2]=C-(A*y-E*B);g[e+4>>2]=z;b=b+1|0;}while((b|0)<(c[l>>2]|0))}l=c[k+40>>2]|0;b=a+4|0;if((c[b>>2]|0)==0){K=k+32|0;L=c[K>>2]|0;M=l;dg(L,M);N=k+36|0;O=c[N>>2]|0;Q=O;dg(L,Q);i=f;return}if((c[n>>2]|0)<=0){K=k+32|0;L=c[K>>2]|0;M=l;dg(L,M);N=k+36|0;O=c[N>>2]|0;Q=O;dg(L,Q);i=f;return}a=h+16|0;m=0;do{v=c[(c[o>>2]|0)+(m<<2)>>2]|0;u=c[l+(m*152&-1)+144>>2]|0;c[a>>2]=u;if((u|0)>0){e=0;do{g[h+(e<<2)>>2]=+g[l+(m*152&-1)+(e*36&-1)+16>>2];g[h+8+(e<<2)>>2]=+g[l+(m*152&-1)+(e*36&-1)+20>>2];e=e+1|0;}while((e|0)<(u|0))}u=c[b>>2]|0;bN[c[(c[u>>2]|0)+20>>2]&127](u,v,h);m=m+1|0;}while((m|0)<(c[n>>2]|0));K=k+32|0;L=c[K>>2]|0;M=l;dg(L,M);N=k+36|0;O=c[N>>2]|0;Q=O;dg(L,Q);i=f;return}function dO(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0;e=b|0;f=b+8|0;c[f>>2]=128;c[b+4>>2]=0;h=vh(1024)|0;c[b>>2]=h;vq(h|0,0,c[f>>2]<<3|0);vq(b+12|0,0,56);do{if((a[22056]&1)==0){f=0;h=1;while(1){if((f|0)>=14){i=1732;break}if((h|0)>(c[22712+(f<<2)>>2]|0)){j=f+1|0;a[h+22064|0]=j&255;k=j}else{a[h+22064|0]=f&255;k=f}j=h+1|0;if((j|0)<641){f=k;h=j}else{i=1737;break}}if((i|0)==1737){a[22056]=1;break}else if((i|0)==1732){bc(5352,73,17368,10976)}}}while(0);c[b+102468>>2]=0;c[b+102472>>2]=0;c[b+102476>>2]=0;c[b+102864>>2]=0;b3(b+102872|0);c[b+102932>>2]=0;c[b+102936>>2]=0;c[b+102940>>2]=4192;c[b+102944>>2]=4184;i=b+102948|0;c[b+102980>>2]=0;c[b+102984>>2]=0;vq(i|0,0,20);a[b+102992|0]=1;a[b+102993|0]=1;a[b+102994|0]=0;a[b+102995|0]=1;a[b+102976|0]=1;k=d;d=b+102968|0;h=c[k+4>>2]|0;c[d>>2]=c[k>>2];c[d+4>>2]=h;c[b+102868>>2]=4;g[b+102988>>2]=0.0;c[i>>2]=e;vq(b+102996|0,0,32);return}function dP(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;b=c[a+102952>>2]|0;if((b|0)!=0){d=a|0;e=b;while(1){b=c[e+96>>2]|0;f=c[e+100>>2]|0;while(1){if((f|0)==0){break}g=c[f+4>>2]|0;c[f+28>>2]=0;dK(f,d);f=g}if((b|0)==0){break}else{e=b}}}vi(c[a+102904>>2]|0);vi(c[a+102916>>2]|0);vi(c[a+102876>>2]|0);if((c[a+102468>>2]|0)!=0){bc(4840,32,17e3,10664)}if((c[a+102864>>2]|0)!=0){bc(4840,33,17e3,7952)}e=a+4|0;d=a|0;a=c[d>>2]|0;if((c[e>>2]|0)>0){h=0;i=a}else{j=a;k=j;vi(k);return}while(1){vi(c[i+(h<<3)+4>>2]|0);a=h+1|0;f=c[d>>2]|0;if((a|0)<(c[e>>2]|0)){h=a;i=f}else{j=f;break}}k=j;vi(k);return}function dQ(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=b+102960|0;if((c[e>>2]|0)<=0){bc(10624,133,15568,9672)}if((c[b+102868>>2]&2|0)!=0){bc(10624,134,15568,12392)}f=d+108|0;g=c[f>>2]|0;if((g|0)!=0){h=b+102980|0;i=g;while(1){g=c[i+12>>2]|0;j=c[h>>2]|0;if((j|0)==0){k=i+4|0}else{l=i+4|0;br[c[(c[j>>2]|0)+8>>2]&511](j,c[l>>2]|0);k=l}dR(b,c[k>>2]|0);c[f>>2]=g;if((g|0)==0){break}else{i=g}}}c[f>>2]=0;f=d+112|0;i=c[f>>2]|0;if((i|0)!=0){k=b+102872|0;h=i;while(1){i=c[h+12>>2]|0;dp(k,c[h+4>>2]|0);if((i|0)==0){break}else{h=i}}}c[f>>2]=0;f=d+100|0;h=c[f>>2]|0;L2321:do{if((h|0)==0){m=d+104|0}else{k=b+102980|0;i=b+102912|0;g=b+102904|0;l=b+102900|0;j=b+102872|0;n=b|0;o=d+104|0;p=h;while(1){q=c[p+4>>2]|0;r=c[k>>2]|0;if((r|0)!=0){br[c[(c[r>>2]|0)+12>>2]&511](r,p)}r=p+28|0;if((c[r>>2]|0)>0){s=p+24|0;t=0;do{u=(c[s>>2]|0)+(t*28&-1)+24|0;v=c[u>>2]|0;w=c[i>>2]|0;x=0;while(1){if((x|0)>=(w|0)){break}y=(c[g>>2]|0)+(x<<2)|0;if((c[y>>2]|0)==(v|0)){z=1790;break}else{x=x+1|0}}if((z|0)==1790){z=0;c[y>>2]=-1}c[l>>2]=(c[l>>2]|0)-1;cl(j,v);c[u>>2]=-1;t=t+1|0;}while((t|0)<(c[r>>2]|0))}c[r>>2]=0;dK(p,n);t=a[22108]|0;if((t&255)>=14){break}s=b+12+((t&255)<<2)|0;c[p>>2]=c[s>>2];c[s>>2]=p;c[f>>2]=q;c[o>>2]=(c[o>>2]|0)-1;if((q|0)==0){m=o;break L2321}else{p=q}}bc(5352,173,17448,6544)}}while(0);c[f>>2]=0;c[m>>2]=0;m=d+92|0;f=c[m>>2]|0;y=d+96|0;if((f|0)!=0){c[f+96>>2]=c[y>>2]}f=c[y>>2]|0;if((f|0)!=0){c[f+92>>2]=c[m>>2]}m=b+102952|0;if((c[m>>2]|0)==(d|0)){c[m>>2]=c[y>>2]}c[e>>2]=(c[e>>2]|0)-1;e=a[22216]|0;if((e&255)<14){y=b+12+((e&255)<<2)|0;c[d>>2]=c[y>>2];c[y>>2]=d;return}else{bc(5352,173,17448,6544)}}function dR(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0,m=0;if((c[d+102868>>2]&2|0)!=0){bc(10624,274,15528,12392)}f=a[e+61|0]&1;h=e+8|0;i=c[h>>2]|0;j=e+12|0;if((i|0)!=0){c[i+12>>2]=c[j>>2]}i=c[j>>2]|0;if((i|0)!=0){c[i+8>>2]=c[h>>2]}h=d+102956|0;if((c[h>>2]|0)==(e|0)){c[h>>2]=c[j>>2]}j=c[e+48>>2]|0;h=c[e+52>>2]|0;i=j+4|0;k=b[i>>1]|0;if((k&2)==0){b[i>>1]=k|2;g[j+144>>2]=0.0}k=h+4|0;i=b[k>>1]|0;if((i&2)==0){b[k>>1]=i|2;g[h+144>>2]=0.0}i=e+24|0;k=c[i>>2]|0;l=e+28|0;if((k|0)!=0){c[k+12>>2]=c[l>>2]}k=c[l>>2]|0;if((k|0)!=0){c[k+8>>2]=c[i>>2]}k=j+108|0;if((e+16|0)==(c[k>>2]|0)){c[k>>2]=c[l>>2]}c[i>>2]=0;c[l>>2]=0;l=e+40|0;i=c[l>>2]|0;k=e+44|0;if((i|0)!=0){c[i+12>>2]=c[k>>2]}i=c[k>>2]|0;if((i|0)!=0){c[i+8>>2]=c[l>>2]}i=h+108|0;if((e+32|0)==(c[i>>2]|0)){c[i>>2]=c[k>>2]}c[l>>2]=0;c[k>>2]=0;fl(e,d|0);e=d+102964|0;d=c[e>>2]|0;if((d|0)<=0){bc(10624,346,15528,7232)}c[e>>2]=d-1;if(f<<24>>24!=0){return}f=c[h+112>>2]|0;if((f|0)==0){return}else{m=f}do{if((c[m>>2]|0)==(j|0)){f=(c[m+4>>2]|0)+4|0;c[f>>2]=c[f>>2]|8}m=c[m+12>>2]|0;}while((m|0)!=0);return}function dS(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;if((c[b+102868>>2]&2|0)!=0){bc(10624,214,15608,12392);return 0}e=fk(d,b|0)|0;c[e+8>>2]=0;f=b+102956|0;c[e+12>>2]=c[f>>2];g=c[f>>2]|0;if((g|0)!=0){c[g+8>>2]=e}c[f>>2]=e;f=b+102964|0;c[f>>2]=(c[f>>2]|0)+1;f=e+16|0;c[e+20>>2]=e;b=e+52|0;c[f>>2]=c[b>>2];c[e+24>>2]=0;g=e+48|0;h=c[g>>2]|0;i=h+108|0;c[e+28>>2]=c[i>>2];j=c[i>>2]|0;if((j|0)==0){k=h}else{c[j+8>>2]=f;k=c[g>>2]|0}c[k+108>>2]=f;f=e+32|0;c[e+36>>2]=e;c[f>>2]=c[g>>2];c[e+40>>2]=0;g=c[b>>2]|0;k=g+108|0;c[e+44>>2]=c[k>>2];j=c[k>>2]|0;if((j|0)==0){l=g}else{c[j+8>>2]=f;l=c[b>>2]|0}c[l+108>>2]=f;f=c[d+8>>2]|0;if((a[d+16|0]&1)!=0){return e|0}l=c[(c[d+12>>2]|0)+112>>2]|0;if((l|0)==0){return e|0}else{m=l}do{if((c[m>>2]|0)==(f|0)){l=(c[m+4>>2]|0)+4|0;c[l>>2]=c[l>>2]|8}m=c[m+12>>2]|0;}while((m|0)!=0);return e|0}function dT(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0;f=i;i=i+104|0;h=f|0;j=f+16|0;k=f+72|0;l=d+103008|0;g[l>>2]=0.0;m=d+103012|0;g[m>>2]=0.0;n=d+103016|0;g[n>>2]=0.0;o=d+102960|0;p=d+102872|0;q=d+68|0;dL(j,c[o>>2]|0,c[d+102936>>2]|0,c[d+102964>>2]|0,q,c[d+102944>>2]|0);r=d+102952|0;s=c[r>>2]|0;if((s|0)!=0){t=s;do{s=t+4|0;b[s>>1]=b[s>>1]&-2;t=c[t+96>>2]|0;}while((t|0)!=0)}t=c[d+102932>>2]|0;if((t|0)!=0){s=t;do{t=s+4|0;c[t>>2]=c[t>>2]&-2;s=c[s+12>>2]|0;}while((s|0)!=0)}s=c[d+102956>>2]|0;if((s|0)!=0){t=s;do{a[t+60|0]=0;t=c[t+12>>2]|0;}while((t|0)!=0)}t=c[o>>2]|0;o=t<<2;s=d+102864|0;u=c[s>>2]|0;if((u|0)>=32){bc(4840,38,17040,6448)}v=d+102480+(u*12&-1)|0;c[d+102480+(u*12&-1)+4>>2]=o;w=d+102468|0;x=c[w>>2]|0;if((x+o|0)>102400){c[v>>2]=vh(o)|0;a[d+102480+(u*12&-1)+8|0]=1}else{c[v>>2]=x+(d+68);a[d+102480+(u*12&-1)+8|0]=0;c[w>>2]=(c[w>>2]|0)+o}w=d+102472|0;u=(c[w>>2]|0)+o|0;c[w>>2]=u;w=d+102476|0;o=c[w>>2]|0;c[w>>2]=(o|0)>(u|0)?o:u;c[s>>2]=(c[s>>2]|0)+1;s=c[v>>2]|0;v=s;u=c[r>>2]|0;L2451:do{if((u|0)!=0){o=j+28|0;w=j+36|0;x=j+32|0;y=j+40|0;z=j+8|0;A=j+48|0;B=j+16|0;C=j+44|0;D=j+12|0;E=d+102968|0;F=d+102976|0;G=k+12|0;H=k+16|0;I=k+20|0;J=u;L2453:while(1){K=J+4|0;do{if((b[K>>1]&35)==34){if((c[J>>2]|0)==0){break}c[o>>2]=0;c[w>>2]=0;c[x>>2]=0;c[v>>2]=J;b[K>>1]=b[K>>1]|1;L=1;while(1){M=L-1|0;N=c[v+(M<<2)>>2]|0;O=N+4|0;if((b[O>>1]&32)==0){P=1882;break L2453}Q=c[o>>2]|0;if((Q|0)>=(c[y>>2]|0)){P=1885;break L2453}c[N+8>>2]=Q;c[(c[z>>2]|0)+(c[o>>2]<<2)>>2]=N;c[o>>2]=(c[o>>2]|0)+1;Q=b[O>>1]|0;if((Q&2)==0){b[O>>1]=Q|2;g[N+144>>2]=0.0}do{if((c[N>>2]|0)==0){T=M}else{Q=c[N+112>>2]|0;if((Q|0)==0){U=M}else{O=M;V=Q;while(1){Q=c[V+4>>2]|0;W=Q+4|0;do{if((c[W>>2]&7|0)==6){if((a[(c[Q+48>>2]|0)+38|0]&1)!=0){X=O;break}if((a[(c[Q+52>>2]|0)+38|0]&1)!=0){X=O;break}Y=c[w>>2]|0;if((Y|0)>=(c[C>>2]|0)){P=1896;break L2453}c[w>>2]=Y+1;c[(c[D>>2]|0)+(Y<<2)>>2]=Q;c[W>>2]=c[W>>2]|1;Y=c[V>>2]|0;Z=Y+4|0;if((b[Z>>1]&1)!=0){X=O;break}if((O|0)>=(t|0)){P=1900;break L2453}c[v+(O<<2)>>2]=Y;b[Z>>1]=b[Z>>1]|1;X=O+1|0}else{X=O}}while(0);W=c[V+12>>2]|0;if((W|0)==0){U=X;break}else{O=X;V=W}}}V=c[N+108>>2]|0;if((V|0)==0){T=U;break}else{_=U;$=V}while(1){V=$+4|0;O=c[V>>2]|0;do{if((a[O+60|0]&1)==0){W=c[$>>2]|0;Q=W+4|0;if((b[Q>>1]&32)==0){aa=_;break}Z=c[x>>2]|0;if((Z|0)>=(c[A>>2]|0)){P=1908;break L2453}c[x>>2]=Z+1;c[(c[B>>2]|0)+(Z<<2)>>2]=O;a[(c[V>>2]|0)+60|0]=1;if((b[Q>>1]&1)!=0){aa=_;break}if((_|0)>=(t|0)){P=1912;break L2453}c[v+(_<<2)>>2]=W;b[Q>>1]=b[Q>>1]|1;aa=_+1|0}else{aa=_}}while(0);V=c[$+12>>2]|0;if((V|0)==0){T=aa;break}else{_=aa;$=V}}}}while(0);if((T|0)>0){L=T}else{break}}dM(j,k,e,E,(a[F]&1)!=0);g[l>>2]=+g[G>>2]+ +g[l>>2];g[m>>2]=+g[H>>2]+ +g[m>>2];g[n>>2]=+g[I>>2]+ +g[n>>2];L=c[o>>2]|0;if((L|0)>0){ab=0;ac=L}else{break}while(1){L=c[(c[z>>2]|0)+(ab<<2)>>2]|0;if((c[L>>2]|0)==0){N=L+4|0;b[N>>1]=b[N>>1]&-2;ad=c[o>>2]|0}else{ad=ac}N=ab+1|0;if((N|0)<(ad|0)){ab=N;ac=ad}else{break}}}}while(0);J=c[J+96>>2]|0;if((J|0)==0){break L2451}}if((P|0)==1912){bc(10624,524,15488,5752)}else if((P|0)==1896){bc(8576,62,15264,8040)}else if((P|0)==1882){bc(10624,445,15488,6264)}else if((P|0)==1885){bc(8576,54,15328,7760)}else if((P|0)==1900){bc(10624,495,15488,5752)}else if((P|0)==1908){bc(8576,68,15296,8280)}}}while(0);dg(q,s);s=c[r>>2]|0;if((s|0)!=0){r=h|0;q=h;P=h+8|0;h=P;ad=P+4|0;P=s;do{do{if((b[P+4>>1]&1)!=0){if((c[P>>2]|0)==0){break}ae=+g[P+52>>2];af=+S(+ae);g[h>>2]=af;ag=+R(+ae);g[ad>>2]=ag;ae=+g[P+28>>2];ah=+g[P+32>>2];ai=+(+g[P+40>>2]-(af*ae+ag*ah));g[r>>2]=+g[P+36>>2]-(ag*ae-af*ah);g[r+4>>2]=ai;s=(c[P+88>>2]|0)+102872|0;ac=c[P+100>>2]|0;if((ac|0)==0){break}ab=P+12|0;n=ac;do{dH(n,s,q,ab);n=c[n+4>>2]|0;}while((n|0)!=0)}}while(0);P=c[P+96>>2]|0;}while((P|0)!=0)}dy(p|0,p);g[d+103020>>2]=0.0;d=j|0;dg(c[d>>2]|0,c[j+20>>2]|0);dg(c[d>>2]|0,c[j+24>>2]|0);dg(c[d>>2]|0,c[j+16>>2]|0);dg(c[d>>2]|0,c[j+12>>2]|0);dg(c[d>>2]|0,c[j+8>>2]|0);i=f;return}function dU(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0.0,ag=0,ah=0,ai=0,aj=0,ak=0.0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0.0,aw=0.0,ax=0.0,ay=0.0,az=0,aA=0.0,aB=0.0,aC=0.0,aD=0.0,aE=0,aF=0.0,aG=0.0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bd=0;f=i;i=i+368|0;h=f|0;j=f+16|0;k=f+72|0;l=f+208|0;m=f+216|0;n=f+256|0;o=f+296|0;p=f+304|0;q=f+344|0;r=d+102872|0;s=d+102944|0;dL(j,64,32,0,d+68|0,c[s>>2]|0);t=d+102995|0;do{if((a[t]&1)==0){u=d+102932|0}else{v=c[d+102952>>2]|0;if((v|0)!=0){w=v;do{v=w+4|0;b[v>>1]=b[v>>1]&-2;g[w+60>>2]=0.0;w=c[w+96>>2]|0;}while((w|0)!=0)}w=d+102932|0;v=c[w>>2]|0;if((v|0)==0){u=w;break}else{x=v}while(1){v=x+4|0;c[v>>2]=c[v>>2]&-34;c[x+128>>2]=0;g[x+132>>2]=1.0;v=c[x+12>>2]|0;if((v|0)==0){u=w;break}else{x=v}}}}while(0);x=m;m=n;n=j+28|0;w=j+36|0;v=j+32|0;y=j+40|0;z=j+8|0;A=j+44|0;B=j+12|0;C=o|0;D=o+4|0;E=p;p=e|0;F=q|0;G=q+4|0;H=q+8|0;I=q+16|0;J=e+12|0;e=q+12|0;K=q+20|0;L=r|0;M=d+102994|0;d=h|0;N=h;O=h+8|0;h=O;P=O+4|0;O=k+16|0;Q=k+20|0;T=k+24|0;U=k+44|0;V=k+48|0;W=k+52|0;X=k|0;Y=k+28|0;Z=k+56|0;_=k+92|0;$=k+128|0;aa=l|0;ab=l+4|0;L2537:while(1){ac=c[u>>2]|0;if((ac|0)==0){ad=1;ae=2066;break}else{af=1.0;ag=0;ah=ac}while(1){ac=ah+4|0;ai=c[ac>>2]|0;do{if((ai&4|0)==0){aj=ag;ak=af}else{if((c[ah+128>>2]|0)>8){aj=ag;ak=af;break}if((ai&32|0)==0){al=c[ah+48>>2]|0;am=c[ah+52>>2]|0;if((a[al+38|0]&1)!=0){aj=ag;ak=af;break}if((a[am+38|0]&1)!=0){aj=ag;ak=af;break}an=c[al+8>>2]|0;ao=c[am+8>>2]|0;ap=c[an>>2]|0;aq=c[ao>>2]|0;ar=(aq|0)==2;if(!((ap|0)==2|ar)){ae=1961;break L2537}as=b[an+4>>1]|0;at=b[ao+4>>1]|0;if(((as&2)==0|(ap|0)==0)&((at&2)==0|(aq|0)==0)){aj=ag;ak=af;break}if((as&8)==0){au=(ap|0)!=2&1}else{au=1}if((at&8)==0){if((au|0)==0&ar){aj=ag;ak=af;break}}ar=an+28|0;at=an+60|0;av=+g[at>>2];ap=ao+28|0;as=ao+60|0;aw=+g[as>>2];do{if(av<aw){if(av>=1.0){ae=1970;break L2537}ax=(aw-av)/(1.0-av);aq=an+36|0;ay=1.0-ax;az=aq;aA=+(ay*+g[an+40>>2]+ax*+g[an+48>>2]);g[az>>2]=+g[aq>>2]*ay+ax*+g[an+44>>2];g[az+4>>2]=aA;az=an+52|0;g[az>>2]=ay*+g[az>>2]+ax*+g[an+56>>2];g[at>>2]=aw;aB=aw}else{if(aw>=av){aB=av;break}if(aw>=1.0){ae=1975;break L2537}ax=(av-aw)/(1.0-aw);az=ao+36|0;ay=1.0-ax;aq=az;aA=+(ay*+g[ao+40>>2]+ax*+g[ao+48>>2]);g[aq>>2]=+g[az>>2]*ay+ax*+g[ao+44>>2];g[aq+4>>2]=aA;aq=ao+52|0;g[aq>>2]=ay*+g[aq>>2]+ax*+g[ao+56>>2];g[as>>2]=av;aB=av}}while(0);if(aB>=1.0){ae=1979;break L2537}as=c[ah+56>>2]|0;ao=c[ah+60>>2]|0;c[O>>2]=0;c[Q>>2]=0;g[T>>2]=0.0;c[U>>2]=0;c[V>>2]=0;g[W>>2]=0.0;cf(X,c[al+12>>2]|0,as);cf(Y,c[am+12>>2]|0,ao);vp(Z|0,ar|0,36);vp(_|0,ap|0,36);g[$>>2]=1.0;cu(l,k);if((c[aa>>2]|0)==3){av=aB+(1.0-aB)*+g[ab>>2];aC=av<1.0?av:1.0}else{aC=1.0}g[ah+132>>2]=aC;c[ac>>2]=c[ac>>2]|32;aD=aC}else{aD=+g[ah+132>>2]}if(aD>=af){aj=ag;ak=af;break}aj=ah;ak=aD}}while(0);ac=c[ah+12>>2]|0;if((ac|0)==0){break}else{af=ak;ag=aj;ah=ac}}if((aj|0)==0|ak>.9999988079071045){ad=1;ae=2065;break}ac=c[(c[aj+48>>2]|0)+8>>2]|0;ai=c[(c[aj+52>>2]|0)+8>>2]|0;ao=ac+28|0;vp(x|0,ao|0,36);as=ai+28|0;vp(m|0,as|0,36);at=ac+60|0;av=+g[at>>2];if(av>=1.0){ae=1992;break}aw=(ak-av)/(1.0-av);an=ac+36|0;av=1.0-aw;aq=ac+44|0;az=ac+48|0;ax=+g[an>>2]*av+aw*+g[aq>>2];ay=av*+g[ac+40>>2]+aw*+g[az>>2];aE=an;aA=+ax;aF=+ay;g[aE>>2]=aA;g[aE+4>>2]=aF;aE=ac+52|0;an=ac+56|0;aG=av*+g[aE>>2]+aw*+g[an>>2];g[aE>>2]=aG;g[at>>2]=ak;at=ac+44|0;g[at>>2]=aA;g[at+4>>2]=aF;g[an>>2]=aG;aF=+S(+aG);at=ac+20|0;g[at>>2]=aF;aA=+R(+aG);aE=ac+24|0;g[aE>>2]=aA;aH=ac+28|0;aG=+g[aH>>2];aI=ac+32|0;aw=+g[aI>>2];aJ=ac+12|0;av=+(ay-(aF*aG+aA*aw));g[aJ>>2]=ax-(aA*aG-aF*aw);g[aJ+4>>2]=av;aK=ai+60|0;av=+g[aK>>2];if(av>=1.0){ae=1995;break}aw=(ak-av)/(1.0-av);aL=ai+36|0;av=1.0-aw;aM=ai+44|0;aN=ai+48|0;aF=+g[aL>>2]*av+aw*+g[aM>>2];aG=av*+g[ai+40>>2]+aw*+g[aN>>2];aO=aL;aA=+aF;ax=+aG;g[aO>>2]=aA;g[aO+4>>2]=ax;aO=ai+52|0;aL=ai+56|0;ay=av*+g[aO>>2]+aw*+g[aL>>2];g[aO>>2]=ay;g[aK>>2]=ak;aK=ai+44|0;g[aK>>2]=aA;g[aK+4>>2]=ax;g[aL>>2]=ay;ax=+S(+ay);aK=ai+20|0;g[aK>>2]=ax;aA=+R(+ay);aO=ai+24|0;g[aO>>2]=aA;aP=ai+28|0;ay=+g[aP>>2];aQ=ai+32|0;aw=+g[aQ>>2];aR=ai+12|0;av=+(aG-(ax*ay+aA*aw));g[aR>>2]=aF-(aA*ay-ax*aw);g[aR+4>>2]=av;eh(aj,c[s>>2]|0);aS=aj+4|0;aT=c[aS>>2]|0;c[aS>>2]=aT&-33;aU=aj+128|0;c[aU>>2]=(c[aU>>2]|0)+1;if((aT&6|0)!=6){c[aS>>2]=aT&-37;vp(ao|0,x|0,36);vp(as|0,m|0,36);av=+g[an>>2];aw=+S(+av);g[at>>2]=aw;ax=+R(+av);g[aE>>2]=ax;av=+g[aH>>2];ay=+g[aI>>2];aA=+(+g[az>>2]-(aw*av+ax*ay));g[aJ>>2]=+g[aq>>2]-(ax*av-aw*ay);g[aJ+4>>2]=aA;aA=+g[aL>>2];ay=+S(+aA);g[aK>>2]=ay;aw=+R(+aA);g[aO>>2]=aw;aA=+g[aP>>2];av=+g[aQ>>2];ax=+(+g[aN>>2]-(ay*aA+aw*av));g[aR>>2]=+g[aM>>2]-(aw*aA-ay*av);g[aR+4>>2]=ax;continue}aR=ac+4|0;aM=b[aR>>1]|0;if((aM&2)==0){b[aR>>1]=aM|2;g[ac+144>>2]=0.0}aM=ai+4|0;aN=b[aM>>1]|0;if((aN&2)==0){b[aM>>1]=aN|2;g[ai+144>>2]=0.0}c[n>>2]=0;c[w>>2]=0;c[v>>2]=0;aN=c[y>>2]|0;if((aN|0)<=0){ae=2005;break}aQ=ac+8|0;c[aQ>>2]=0;aP=c[z>>2]|0;c[aP>>2]=ac;c[n>>2]=1;if((aN|0)<=1){ae=2008;break}aN=ai+8|0;c[aN>>2]=1;c[aP+4>>2]=ai;c[n>>2]=2;if((c[A>>2]|0)<=0){ae=2011;break}c[w>>2]=1;c[c[B>>2]>>2]=aj;b[aR>>1]=b[aR>>1]|1;b[aM>>1]=b[aM>>1]|1;c[aS>>2]=c[aS>>2]|1;c[C>>2]=ac;c[D>>2]=ai;ai=1;aS=ac;while(1){L2593:do{if((c[aS>>2]|0)==2){ac=c[aS+112>>2]|0;if((ac|0)==0){break}aM=aS+4|0;aR=c[y>>2]|0;aP=ac;ac=c[n>>2]|0;while(1){if((ac|0)==(aR|0)){break L2593}aO=c[w>>2]|0;aK=c[A>>2]|0;if((aO|0)==(aK|0)){break L2593}aL=c[aP+4>>2]|0;aJ=aL+4|0;L2600:do{if((c[aJ>>2]&1|0)==0){aq=c[aP>>2]|0;az=aq|0;do{if((c[az>>2]|0)==2){if((b[aM>>1]&8)!=0){break}if((b[aq+4>>1]&8)==0){aV=ac;break L2600}}}while(0);if((a[(c[aL+48>>2]|0)+38|0]&1)!=0){aV=ac;break}if((a[(c[aL+52>>2]|0)+38|0]&1)!=0){aV=ac;break}aI=aq+28|0;vp(E|0,aI|0,36);aH=aq+4|0;if((b[aH>>1]&1)==0){aE=aq+60|0;ax=+g[aE>>2];if(ax>=1.0){ae=2027;break L2537}av=(ak-ax)/(1.0-ax);at=aq+36|0;ax=1.0-av;ay=+g[at>>2]*ax+av*+g[aq+44>>2];aA=ax*+g[aq+40>>2]+av*+g[aq+48>>2];an=at;aw=+ay;aF=+aA;g[an>>2]=aw;g[an+4>>2]=aF;an=aq+52|0;at=aq+56|0;aG=ax*+g[an>>2]+av*+g[at>>2];g[an>>2]=aG;g[aE>>2]=ak;aE=aq+44|0;g[aE>>2]=aw;g[aE+4>>2]=aF;g[at>>2]=aG;aF=+S(+aG);g[aq+20>>2]=aF;aw=+R(+aG);g[aq+24>>2]=aw;aG=+g[aq+28>>2];av=+g[aq+32>>2];at=aq+12|0;ax=+(aA-(aF*aG+aw*av));g[at>>2]=ay-(aw*aG-aF*av);g[at+4>>2]=ax}eh(aL,c[s>>2]|0);at=c[aJ>>2]|0;if((at&4|0)==0){vp(aI|0,E|0,36);ax=+g[aq+56>>2];av=+S(+ax);g[aq+20>>2]=av;aF=+R(+ax);g[aq+24>>2]=aF;ax=+g[aq+28>>2];aG=+g[aq+32>>2];aE=aq+12|0;aw=+(+g[aq+48>>2]-(av*ax+aF*aG));g[aE>>2]=+g[aq+44>>2]-(aF*ax-av*aG);g[aE+4>>2]=aw;aV=ac;break}if((at&2|0)==0){vp(aI|0,E|0,36);aw=+g[aq+56>>2];aG=+S(+aw);g[aq+20>>2]=aG;av=+R(+aw);g[aq+24>>2]=av;aw=+g[aq+28>>2];ax=+g[aq+32>>2];aI=aq+12|0;aF=+(+g[aq+48>>2]-(aG*aw+av*ax));g[aI>>2]=+g[aq+44>>2]-(av*aw-aG*ax);g[aI+4>>2]=aF;aV=ac;break}c[aJ>>2]=at|1;if((aO|0)>=(aK|0)){ae=2036;break L2537}c[w>>2]=aO+1;c[(c[B>>2]|0)+(aO<<2)>>2]=aL;at=b[aH>>1]|0;if((at&1)!=0){aV=ac;break}b[aH>>1]=at|1;do{if((c[az>>2]|0)!=0){if((at&2)!=0){break}b[aH>>1]=at|3;g[aq+144>>2]=0.0}}while(0);if((ac|0)>=(aR|0)){ae=2043;break L2537}c[aq+8>>2]=ac;c[(c[z>>2]|0)+(ac<<2)>>2]=aq;at=ac+1|0;c[n>>2]=at;aV=at}else{aV=ac}}while(0);aL=c[aP+12>>2]|0;if((aL|0)==0){break}else{aP=aL;ac=aV}}}}while(0);if((ai|0)>=2){break}ac=c[o+(ai<<2)>>2]|0;ai=ai+1|0;aS=ac}aF=(1.0-ak)*+g[p>>2];g[F>>2]=aF;g[G>>2]=1.0/aF;g[H>>2]=1.0;c[I>>2]=20;c[e>>2]=c[J>>2];a[K]=0;dN(j,q,c[aQ>>2]|0,c[aN>>2]|0);aS=c[n>>2]|0;if((aS|0)>0){ai=c[z>>2]|0;ac=0;do{aP=c[ai+(ac<<2)>>2]|0;aR=aP+4|0;b[aR>>1]=b[aR>>1]&-2;do{if((c[aP>>2]|0)==2){aF=+g[aP+52>>2];ax=+S(+aF);g[h>>2]=ax;aG=+R(+aF);g[P>>2]=aG;aF=+g[aP+28>>2];aw=+g[aP+32>>2];av=+(+g[aP+40>>2]-(ax*aF+aG*aw));g[d>>2]=+g[aP+36>>2]-(aG*aF-ax*aw);g[d+4>>2]=av;aR=(c[aP+88>>2]|0)+102872|0;aM=c[aP+100>>2]|0;if((aM|0)!=0){ap=aP+12|0;ar=aM;do{dH(ar,aR,N,ap);ar=c[ar+4>>2]|0;}while((ar|0)!=0)}ar=c[aP+112>>2]|0;if((ar|0)==0){break}else{aW=ar}do{ar=(c[aW+4>>2]|0)+4|0;c[ar>>2]=c[ar>>2]&-34;aW=c[aW+12>>2]|0;}while((aW|0)!=0)}}while(0);ac=ac+1|0;}while((ac|0)<(aS|0))}dy(L,r);if((a[M]&1)!=0){ad=0;ae=2067;break}}if((ae|0)==2065){a[t]=ad;aX=j|0;aY=c[aX>>2]|0;aZ=j+20|0;a_=c[aZ>>2]|0;a$=a_;dg(aY,a$);a0=c[aX>>2]|0;a1=j+24|0;a2=c[a1>>2]|0;a3=a2;dg(a0,a3);a4=c[aX>>2]|0;a5=j+16|0;a6=c[a5>>2]|0;a7=a6;dg(a4,a7);a8=c[aX>>2]|0;a9=c[B>>2]|0;ba=a9;dg(a8,ba);bb=c[z>>2]|0;bd=bb;dg(a8,bd);i=f;return}else if((ae|0)==2066){a[t]=ad;aX=j|0;aY=c[aX>>2]|0;aZ=j+20|0;a_=c[aZ>>2]|0;a$=a_;dg(aY,a$);a0=c[aX>>2]|0;a1=j+24|0;a2=c[a1>>2]|0;a3=a2;dg(a0,a3);a4=c[aX>>2]|0;a5=j+16|0;a6=c[a5>>2]|0;a7=a6;dg(a4,a7);a8=c[aX>>2]|0;a9=c[B>>2]|0;ba=a9;dg(a8,ba);bb=c[z>>2]|0;bd=bb;dg(a8,bd);i=f;return}else if((ae|0)==2067){a[t]=ad;aX=j|0;aY=c[aX>>2]|0;aZ=j+20|0;a_=c[aZ>>2]|0;a$=a_;dg(aY,a$);a0=c[aX>>2]|0;a1=j+24|0;a2=c[a1>>2]|0;a3=a2;dg(a0,a3);a4=c[aX>>2]|0;a5=j+16|0;a6=c[a5>>2]|0;a7=a6;dg(a4,a7);a8=c[aX>>2]|0;a9=c[B>>2]|0;ba=a9;dg(a8,ba);bb=c[z>>2]|0;bd=bb;dg(a8,bd);i=f;return}else if((ae|0)==2005){bc(8576,54,15328,7760)}else if((ae|0)==2036){bc(8576,62,15264,8040)}else if((ae|0)==1970){bc(8768,723,15712,4888)}else if((ae|0)==1979){bc(10624,676,15440,4888)}else if((ae|0)==2027){bc(8768,723,15712,4888)}else if((ae|0)==2011){bc(8576,62,15264,8040)}else if((ae|0)==1975){bc(8768,723,15712,4888)}else if((ae|0)==1961){bc(10624,641,15440,5216)}else if((ae|0)==2008){bc(8576,54,15328,7760)}else if((ae|0)==1992){bc(8768,723,15712,4888)}else if((ae|0)==1995){bc(8768,723,15712,4888)}else if((ae|0)==2043){bc(8576,54,15328,7760)}}function dV(b,d,e,f){b=b|0;d=+d;e=e|0;f=f|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0,q=0,r=0,s=0;h=i;i=i+24|0;j=h|0;k=b+102868|0;l=c[k>>2]|0;if((l&1|0)==0){m=l}else{l=b+102872|0;dy(l|0,l);l=c[k>>2]&-2;c[k>>2]=l;m=l}c[k>>2]=m|2;m=j|0;g[m>>2]=d;c[j+12>>2]=e;c[j+16>>2]=f;f=d>0.0;if(f){g[j+4>>2]=1.0/d}else{g[j+4>>2]=0.0}e=b+102988|0;g[j+8>>2]=+g[e>>2]*d;a[j+20|0]=a[b+102992|0]&1;dx(b+102872|0);g[b+103e3>>2]=0.0;if(!((a[b+102995|0]&1)==0|f^1)){dT(b,j);g[b+103004>>2]=0.0}do{if((a[b+102993|0]&1)==0){n=2078}else{d=+g[m>>2];if(d<=0.0){o=d;break}dU(b,j);g[b+103024>>2]=0.0;n=2078}}while(0);if((n|0)==2078){o=+g[m>>2]}if(o>0.0){g[e>>2]=+g[j+4>>2]}j=c[k>>2]|0;if((j&4|0)==0){p=j;q=p&-3;c[k>>2]=q;r=b+102996|0;g[r>>2]=0.0;i=h;return}e=c[b+102952>>2]|0;if((e|0)==0){p=j;q=p&-3;c[k>>2]=q;r=b+102996|0;g[r>>2]=0.0;i=h;return}else{s=e}do{g[s+76>>2]=0.0;g[s+80>>2]=0.0;g[s+84>>2]=0.0;s=c[s+96>>2]|0;}while((s|0)!=0);p=c[k>>2]|0;q=p&-3;c[k>>2]=q;r=b+102996|0;g[r>>2]=0.0;i=h;return}function dW(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;d=i;i=i+56|0;e=d|0;f=d+8|0;h=d+16|0;j=d+24|0;k=d+32|0;l=d+48|0;m=l;n=i;i=i+8|0;o=n;p=(c[b+52>>2]|0)+12|0;q=(c[b+48>>2]|0)+12|0;r=c[q+4>>2]|0;c[e>>2]=c[q>>2];c[e+4>>2]=r;r=p;p=c[r+4>>2]|0;c[f>>2]=c[r>>2];c[f+4>>2]=p;p=b;br[c[c[p>>2]>>2]&511](h,b);br[c[(c[p>>2]|0)+4>>2]&511](j,b);g[k>>2]=.5;g[k+4>>2]=.800000011920929;g[k+8>>2]=.800000011920929;p=c[b+4>>2]|0;if((p|0)==4){r=b+68|0;q=c[r+4>>2]|0;c[l>>2]=c[r>>2];c[l+4>>2]=q;q=b+76|0;b=c[q+4>>2]|0;c[n>>2]=c[q>>2];c[n+4>>2]=b;b=a+102984|0;n=c[b>>2]|0;bQ[c[(c[n>>2]|0)+24>>2]&127](n,m,h,k);n=c[b>>2]|0;bQ[c[(c[n>>2]|0)+24>>2]&127](n,o,j,k);n=c[b>>2]|0;bQ[c[(c[n>>2]|0)+24>>2]&127](n,m,o,k);i=d;return}else if((p|0)==3){o=c[a+102984>>2]|0;bQ[c[(c[o>>2]|0)+24>>2]&127](o,h,j,k);i=d;return}else if((p|0)==5){i=d;return}else{p=a+102984|0;a=c[p>>2]|0;bQ[c[(c[a>>2]|0)+24>>2]&127](a,e,h,k);e=c[p>>2]|0;bQ[c[(c[e>>2]|0)+24>>2]&127](e,h,j,k);h=c[p>>2]|0;bQ[c[(c[h>>2]|0)+24>>2]&127](h,f,j,k);i=d;return}}function dX(a){a=a|0;var b=0,d=0.0,e=0,f=0,j=0,k=0,l=0,m=0;b=i;if((c[a+102868>>2]&2|0)!=0){i=b;return}d=+g[a+102972>>2];db(4360,(u=i,i=i+16|0,h[u>>3]=+g[a+102968>>2],h[u+8>>3]=d,u)|0);db(12864,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(12632,(u=i,i=i+8|0,c[u>>2]=c[a+102960>>2],u)|0);db(12040,(u=i,i=i+8|0,c[u>>2]=c[a+102964>>2],u)|0);e=c[a+102952>>2]|0;if((e|0)!=0){f=0;j=e;while(1){c[j+8>>2]=f;dn(j);e=c[j+96>>2]|0;if((e|0)==0){break}else{f=f+1|0;j=e}}}j=a+102956|0;a=c[j>>2]|0;do{if((a|0)!=0){f=0;e=a;while(1){c[e+56>>2]=f;k=c[e+12>>2]|0;if((k|0)==0){break}else{f=f+1|0;e=k}}e=c[j>>2]|0;if((e|0)==0){break}else{l=e}do{if((c[l+4>>2]|0)!=6){db(11584,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);bq[c[(c[l>>2]|0)+16>>2]&511](l);db(11328,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0)}l=c[l+12>>2]|0;}while((l|0)!=0);e=c[j>>2]|0;if((e|0)==0){break}else{m=e}do{if((c[m+4>>2]|0)==6){db(11584,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);bq[c[(c[m>>2]|0)+16>>2]&511](m);db(11328,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0)}m=c[m+12>>2]|0;}while((m|0)!=0)}}while(0);db(11128,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(10904,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(10712,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(10512,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);i=b;return}function dY(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0,z=0,A=0,B=0.0,C=0,D=0,E=0,F=0,G=0,H=0.0;f=i;i=i+40|0;h=f|0;j=f+8|0;k=f+16|0;l=f+24|0;m=f+32|0;n=m;o=i;i=i+8|0;p=o;q=i;i=i+64|0;r=c[b+12>>2]|0;b=c[r+4>>2]|0;if((b|0)==0){s=+g[d+12>>2];t=+g[r+12>>2];u=+g[d+8>>2];v=+g[r+16>>2];w=t*u+s*v+ +g[d+4>>2];g[h>>2]=+g[d>>2]+(s*t-u*v);g[h+4>>2]=w;w=+g[r+8>>2];g[j>>2]=s-u*0.0;g[j+4>>2]=u+s*0.0;x=c[a+102984>>2]|0;bp[c[(c[x>>2]|0)+20>>2]&63](x,h,w,j,e);i=f;return}else if((b|0)==3){j=c[r+16>>2]|0;h=c[r+12>>2]|0;x=d+12|0;w=+g[x>>2];s=+g[h>>2];y=d+8|0;u=+g[y>>2];v=+g[h+4>>2];z=d|0;t=+g[z>>2];A=d+4|0;B=+g[A>>2];g[m>>2]=t+(w*s-u*v);g[n+4>>2]=s*u+w*v+B;if((j|0)<=1){i=f;return}C=o;D=p+4|0;E=a+102984|0;F=1;v=w;w=u;u=t;t=B;while(1){B=+g[h+(F<<3)>>2];s=+g[h+(F<<3)+4>>2];g[C>>2]=u+(v*B-w*s);g[D>>2]=B*w+v*s+t;G=c[E>>2]|0;bQ[c[(c[G>>2]|0)+24>>2]&127](G,n,p,e);G=c[E>>2]|0;bt[c[(c[G>>2]|0)+16>>2]&63](G,n,.05000000074505806,e);G=c[o+4>>2]|0;c[m>>2]=c[o>>2];c[m+4>>2]=G;G=F+1|0;if((G|0)>=(j|0)){break}F=G;v=+g[x>>2];w=+g[y>>2];u=+g[z>>2];t=+g[A>>2]}i=f;return}else if((b|0)==1){t=+g[d+12>>2];u=+g[r+12>>2];w=+g[d+8>>2];v=+g[r+16>>2];s=+g[d>>2];B=+g[d+4>>2];g[k>>2]=s+(t*u-w*v);g[k+4>>2]=u*w+t*v+B;A=r+20|0;v=+g[A>>2];u=+g[A+4>>2];g[l>>2]=s+(t*v-w*u);g[l+4>>2]=v*w+t*u+B;A=c[a+102984>>2]|0;bQ[c[(c[A>>2]|0)+24>>2]&127](A,k,l,e);i=f;return}else if((b|0)==2){b=c[r+148>>2]|0;if((b|0)>=9){bc(10624,1077,15360,4600)}l=q|0;if((b|0)>0){k=r+20|0;B=+g[d+12>>2];u=+g[d+8>>2];t=+g[d>>2];w=+g[d+4>>2];d=0;do{v=+g[k+(d<<3)>>2];s=+g[k+(d<<3)+4>>2];r=q+(d<<3)|0;H=+(v*u+B*s+w);g[r>>2]=t+(B*v-u*s);g[r+4>>2]=H;d=d+1|0;}while((d|0)<(b|0))}d=c[a+102984>>2]|0;bQ[c[(c[d>>2]|0)+12>>2]&127](d,l,b,e);i=f;return}else{i=f;return}}function dZ(a){a=a|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0.0,S=0.0,T=0.0,U=0.0;d=i;i=i+144|0;e=d|0;f=d+16|0;h=d+32|0;j=d+48|0;k=d+64|0;l=d+80|0;m=d+96|0;n=d+128|0;o=n|0;p=n;q=a+102984|0;r=c[q>>2]|0;if((r|0)==0){i=d;return}s=c[r+4>>2]|0;do{if((s&1|0)!=0){r=c[a+102952>>2]|0;if((r|0)==0){break}t=e|0;u=e+4|0;v=e+8|0;w=j|0;x=j+4|0;y=j+8|0;z=k|0;A=k+4|0;B=k+8|0;C=f|0;D=f+4|0;E=f+8|0;F=h|0;G=h+4|0;H=h+8|0;I=r;do{r=I+12|0;J=c[I+100>>2]|0;if((J|0)!=0){K=I+4|0;L=I|0;M=J;do{J=b[K>>1]|0;do{if((J&32)==0){g[t>>2]=.5;g[u>>2]=.5;g[v>>2]=.30000001192092896;dY(a,M,r,e)}else{N=c[L>>2]|0;if((N|0)==0){g[C>>2]=.5;g[D>>2]=.8999999761581421;g[E>>2]=.5;dY(a,M,r,f);break}else if((N|0)==1){g[F>>2]=.5;g[G>>2]=.5;g[H>>2]=.8999999761581421;dY(a,M,r,h);break}else{if((J&2)==0){g[w>>2]=.6000000238418579;g[x>>2]=.6000000238418579;g[y>>2]=.6000000238418579;dY(a,M,r,j);break}else{g[z>>2]=.8999999761581421;g[A>>2]=.699999988079071;g[B>>2]=.699999988079071;dY(a,M,r,k);break}}}}while(0);M=c[M+4>>2]|0;}while((M|0)!=0)}I=c[I+96>>2]|0;}while((I|0)!=0)}}while(0);do{if((s&2|0)!=0){k=c[a+102956>>2]|0;if((k|0)==0){break}else{O=k}do{dW(a,O);O=c[O+12>>2]|0;}while((O|0)!=0)}}while(0);if((s&8|0)!=0){O=a+102932|0;while(1){k=c[O>>2]|0;if((k|0)==0){break}else{O=k+12|0}}}L2800:do{if((s&4|0)!=0){g[l>>2]=.8999999761581421;g[l+4>>2]=.30000001192092896;g[l+8>>2]=.8999999761581421;O=c[a+102952>>2]|0;if((O|0)==0){break}k=a+102884|0;j=a+102876|0;h=m|0;f=m|0;e=m+4|0;I=m+8|0;B=m+12|0;A=m+16|0;z=m+20|0;y=m+24|0;x=m+28|0;w=O;L2803:while(1){do{if((b[w+4>>1]&32)!=0){O=c[w+100>>2]|0;if((O|0)==0){break}else{P=O}do{O=P+28|0;if((c[O>>2]|0)>0){H=P+24|0;G=0;do{F=c[(c[H>>2]|0)+(G*28&-1)+24>>2]|0;if((F|0)<=-1){Q=2180;break L2803}if((c[k>>2]|0)<=(F|0)){Q=2179;break L2803}E=c[j>>2]|0;R=+g[E+(F*36&-1)>>2];S=+g[E+(F*36&-1)+4>>2];T=+g[E+(F*36&-1)+8>>2];U=+g[E+(F*36&-1)+12>>2];g[f>>2]=R;g[e>>2]=S;g[I>>2]=T;g[B>>2]=S;g[A>>2]=T;g[z>>2]=U;g[y>>2]=R;g[x>>2]=U;F=c[q>>2]|0;bQ[c[(c[F>>2]|0)+8>>2]&127](F,h,4,l);G=G+1|0;}while((G|0)<(c[O>>2]|0))}P=c[P+4>>2]|0;}while((P|0)!=0)}}while(0);w=c[w+96>>2]|0;if((w|0)==0){break L2800}}if((Q|0)==2180){bc(10360,159,14456,9904)}else if((Q|0)==2179){bc(10360,159,14456,9904)}}}while(0);if((s&16|0)==0){i=d;return}s=c[a+102952>>2]|0;if((s|0)==0){i=d;return}a=n;n=s;do{s=n+12|0;c[a>>2]=c[s>>2];c[a+4>>2]=c[s+4>>2];c[a+8>>2]=c[s+8>>2];c[a+12>>2]=c[s+12>>2];s=n+44|0;Q=c[s+4>>2]|0;c[o>>2]=c[s>>2];c[o+4>>2]=Q;Q=c[q>>2]|0;br[c[(c[Q>>2]|0)+28>>2]&511](Q,p);n=c[n+96>>2]|0;}while((n|0)!=0);i=d;return}function d_(a){a=a|0;return}function d$(a){a=a|0;return}function d0(a,c,d){a=a|0;c=c|0;d=d|0;var e=0;a=b[c+36>>1]|0;if(!(a<<16>>16!=(b[d+36>>1]|0)|a<<16>>16==0)){e=a<<16>>16>0;return e|0}if((b[d+32>>1]&b[c+34>>1])<<16>>16==0){e=0;return e|0}e=(b[d+34>>1]&b[c+32>>1])<<16>>16!=0;return e|0}function d1(a){a=a|0;vl(a);return}function d2(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0;f=i;i=i+48|0;h=f|0;j=c[(c[a+48>>2]|0)+12>>2]|0;c[h>>2]=20512;c[h+4>>2]=1;g[h+8>>2]=.009999999776482582;vq(h+28|0,0,18);cX(j,h,c[a+56>>2]|0);b6(b,h,d,c[(c[a+52>>2]|0)+12>>2]|0,e);i=f;return}function d3(a){a=a|0;vl(a);return}function d4(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0;f=i;i=i+304|0;h=f+256|0;j=c[(c[a+48>>2]|0)+12>>2]|0;c[h>>2]=20512;c[h+4>>2]=1;g[h+8>>2]=.009999999776482582;vq(h+28|0,0,18);cX(j,h,c[a+56>>2]|0);b7(f|0,b,h,d,c[(c[a+52>>2]|0)+12>>2]|0,e);i=f;return}function d5(a){a=a|0;vl(a);return}function d6(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0.0,l=0.0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0,K=0,L=0,M=0,N=0.0,O=0.0,Q=0.0,R=0.0,S=0.0,T=0,U=0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0,ad=0.0,ae=0.0,af=0,ag=0,ah=0,ai=0;e=i;i=i+1064|0;f=e|0;h=e+1040|0;j=d;k=+g[j>>2];l=+g[j+4>>2];m=d+8|0;n=+g[m>>2]-k;o=+g[m+4>>2]-l;p=n*n+o*o;if(p<=0.0){bc(10360,204,14104,10168)}q=+P(+p);if(q<1.1920928955078125e-7){r=n;s=o}else{p=1.0/q;r=n*p;s=o*p}p=s*-1.0;if(p>0.0){t=p}else{t=-0.0-p}if(r>0.0){u=r}else{u=-0.0-r}s=+g[d+16>>2];q=k+n*s;v=l+o*s;d=f+4|0;w=f|0;c[w>>2]=d;x=f+1028|0;c[x>>2]=0;y=f+1032|0;c[y>>2]=256;c[(c[w>>2]|0)+(c[x>>2]<<2)>>2]=c[a>>2];f=(c[x>>2]|0)+1|0;c[x>>2]=f;L2859:do{if((f|0)>0){z=a+4|0;A=h;B=h+8|0;C=h+16|0;D=f;E=l<v?l:v;F=k<q?k:q;G=l>v?l:v;H=k>q?k:q;I=s;while(1){J=D;while(1){K=J-1|0;c[x>>2]=K;L=c[w>>2]|0;M=c[L+(K<<2)>>2]|0;if((M|0)==-1){N=I;O=H;Q=G;R=F;S=E;T=K;break}U=c[z>>2]|0;V=+g[U+(M*36&-1)+8>>2];W=+g[U+(M*36&-1)+12>>2];X=+g[U+(M*36&-1)>>2];Y=+g[U+(M*36&-1)+4>>2];if(F-V>0.0|E-W>0.0|X-H>0.0|Y-G>0.0){Z=I;_=H;$=G;aa=F;ab=E;ac=2206;break}ad=p*(k-(V+X)*.5)+r*(l-(W+Y)*.5);if(ad>0.0){ae=ad}else{ae=-0.0-ad}if(ae-(t*(V-X)*.5+u*(W-Y)*.5)>0.0){Z=I;_=H;$=G;aa=F;ab=E;ac=2206;break}af=U+(M*36&-1)+24|0;if((c[af>>2]|0)==-1){ac=2217;break}do{if((K|0)==(c[y>>2]|0)){c[y>>2]=K<<1;ag=vh(K<<3)|0;c[w>>2]=ag;ah=L;vp(ag|0,ah|0,c[x>>2]<<2);if((L|0)==(d|0)){break}vi(ah)}}while(0);c[(c[w>>2]|0)+(c[x>>2]<<2)>>2]=c[af>>2];L=(c[x>>2]|0)+1|0;c[x>>2]=L;K=U+(M*36&-1)+28|0;do{if((L|0)==(c[y>>2]|0)){ah=c[w>>2]|0;c[y>>2]=L<<1;ag=vh(L<<3)|0;c[w>>2]=ag;ai=ah;vp(ag|0,ai|0,c[x>>2]<<2);if((ah|0)==(d|0)){break}vi(ai)}}while(0);c[(c[w>>2]|0)+(c[x>>2]<<2)>>2]=c[K>>2];J=(c[x>>2]|0)+1|0;c[x>>2]=J;if((J|0)<=0){break L2859}}do{if((ac|0)==2217){ac=0;J=c[j+4>>2]|0;c[A>>2]=c[j>>2];c[A+4>>2]=J;J=c[m+4>>2]|0;c[B>>2]=c[m>>2];c[B+4>>2]=J;g[C>>2]=I;Y=+d7(b,h,M);if(Y==0.0){break L2859}if(Y<=0.0){Z=I;_=H;$=G;aa=F;ab=E;ac=2206;break}W=k+n*Y;X=l+o*Y;Z=Y;_=k>W?k:W;$=l>X?l:X;aa=k<W?k:W;ab=l<X?l:X;ac=2206}}while(0);if((ac|0)==2206){ac=0;N=Z;O=_;Q=$;R=aa;S=ab;T=c[x>>2]|0}if((T|0)>0){D=T;E=S;F=R;G=Q;H=O;I=N}else{break}}}}while(0);T=c[w>>2]|0;if((T|0)==(d|0)){i=e;return}vi(T);c[w>>2]=0;i=e;return}function d7(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0.0,m=0.0,n=0.0,o=0.0;e=i;i=i+24|0;f=e|0;h=e+16|0;j=c[a>>2]|0;if((d|0)<=-1){bc(10360,153,14408,9904);return 0.0}if((c[j+12>>2]|0)<=(d|0)){bc(10360,153,14408,9904);return 0.0}k=c[(c[j+4>>2]|0)+(d*36&-1)+16>>2]|0;d=c[k+16>>2]|0;j=c[d+12>>2]|0;if(bK[c[(c[j>>2]|0)+20>>2]&127](j,f,b,(c[d+8>>2]|0)+12|0,c[k+20>>2]|0)|0){l=+g[f+8>>2];m=1.0-l;n=m*+g[b+4>>2]+l*+g[b+12>>2];g[h>>2]=+g[b>>2]*m+l*+g[b+8>>2];g[h+4>>2]=n;k=c[a+4>>2]|0;o=+bI[c[(c[k>>2]|0)+8>>2]&63](k,d,h,f|0,l);i=e;return+o}else{o=+g[b+16>>2];i=e;return+o}return 0.0}function d8(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;e=i;i=i+1040|0;f=e|0;h=f+4|0;j=f|0;c[j>>2]=h;k=f+1028|0;c[k>>2]=0;l=f+1032|0;c[l>>2]=256;c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[a>>2];f=(c[k>>2]|0)+1|0;c[k>>2]=f;L2906:do{if((f|0)>0){m=a+4|0;n=d|0;o=d+4|0;p=d+8|0;q=d+12|0;r=b|0;s=b+4|0;t=f;L2908:while(1){u=t-1|0;c[k>>2]=u;v=c[j>>2]|0;w=c[v+(u<<2)>>2]|0;do{if((w|0)==-1){x=u}else{y=c[m>>2]|0;if(+g[n>>2]- +g[y+(w*36&-1)+8>>2]>0.0|+g[o>>2]- +g[y+(w*36&-1)+12>>2]>0.0|+g[y+(w*36&-1)>>2]- +g[p>>2]>0.0|+g[y+(w*36&-1)+4>>2]- +g[q>>2]>0.0){x=u;break}z=y+(w*36&-1)+24|0;if((c[z>>2]|0)==-1){A=c[r>>2]|0;if((w|0)<=-1){break L2908}if((c[A+12>>2]|0)<=(w|0)){break L2908}B=c[s>>2]|0;if(!(bH[c[(c[B>>2]|0)+8>>2]&255](B,c[(c[(c[A+4>>2]|0)+(w*36&-1)+16>>2]|0)+16>>2]|0)|0)){break L2906}x=c[k>>2]|0;break}do{if((u|0)==(c[l>>2]|0)){c[l>>2]=u<<1;A=vh(u<<3)|0;c[j>>2]=A;B=v;vp(A|0,B|0,c[k>>2]<<2);if((v|0)==(h|0)){break}vi(B)}}while(0);c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[z>>2];B=(c[k>>2]|0)+1|0;c[k>>2]=B;A=y+(w*36&-1)+28|0;do{if((B|0)==(c[l>>2]|0)){C=c[j>>2]|0;c[l>>2]=B<<1;D=vh(B<<3)|0;c[j>>2]=D;E=C;vp(D|0,E|0,c[k>>2]<<2);if((C|0)==(h|0)){break}vi(E)}}while(0);c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[A>>2];B=(c[k>>2]|0)+1|0;c[k>>2]=B;x=B}}while(0);if((x|0)>0){t=x}else{break L2906}}bc(10360,153,14408,9904)}}while(0);x=c[j>>2]|0;if((x|0)==(h|0)){i=e;return}vi(x);c[j>>2]=0;i=e;return}function d9(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0;h=df(f,144)|0;if((h|0)==0){i=0;j=i|0;return j|0}f=h;c[f>>2]=19280;c[h+4>>2]=4;c[h+48>>2]=a;c[h+52>>2]=d;c[h+56>>2]=b;c[h+60>>2]=e;c[h+124>>2]=0;c[h+128>>2]=0;vq(h+8|0,0,40);g[h+136>>2]=+P(+(+g[a+16>>2]*+g[d+16>>2]));k=+g[a+20>>2];l=+g[d+20>>2];g[h+140>>2]=k>l?k:l;c[f>>2]=19512;if((c[(c[a+12>>2]|0)+4>>2]|0)!=3){bc(10096,43,16664,12232);return 0}if((c[(c[d+12>>2]|0)+4>>2]|0)==0){i=h;j=i|0;return j|0}else{bc(10096,44,16664,9416);return 0}return 0}function ea(b,d){b=b|0;d=d|0;var e=0,f=0;bq[c[(c[b>>2]|0)+4>>2]&511](b);e=a[22208]|0;if((e&255)<14){f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2];c[f>>2]=b;return}else{bc(5352,173,17448,6544)}}function eb(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0;h=df(f,144)|0;if((h|0)==0){i=0;j=i|0;return j|0}f=h;c[f>>2]=19280;c[h+4>>2]=4;c[h+48>>2]=a;c[h+52>>2]=d;c[h+56>>2]=b;c[h+60>>2]=e;c[h+124>>2]=0;c[h+128>>2]=0;vq(h+8|0,0,40);g[h+136>>2]=+P(+(+g[a+16>>2]*+g[d+16>>2]));k=+g[a+20>>2];l=+g[d+20>>2];g[h+140>>2]=k>l?k:l;c[f>>2]=19448;if((c[(c[a+12>>2]|0)+4>>2]|0)!=3){bc(9952,43,16488,12232);return 0}if((c[(c[d+12>>2]|0)+4>>2]|0)==2){i=h;j=i|0;return j|0}else{bc(9952,44,16488,9368);return 0}return 0}function ec(b,d){b=b|0;d=d|0;var e=0,f=0;bq[c[(c[b>>2]|0)+4>>2]&511](b);e=a[22208]|0;if((e&255)<14){f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2];c[f>>2]=b;return}else{bc(5352,173,17448,6544)}}function ed(a){a=a|0;return}function ee(a){a=a|0;return}function ef(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;f=c[(c[a+48>>2]|0)+12>>2]|0;h=c[(c[a+52>>2]|0)+12>>2]|0;a=b+60|0;c[a>>2]=0;i=f+12|0;j=+g[d+12>>2];k=+g[i>>2];l=+g[d+8>>2];m=+g[f+16>>2];n=h+12|0;o=+g[e+12>>2];p=+g[n>>2];q=+g[e+8>>2];r=+g[h+16>>2];s=+g[e>>2]+(o*p-q*r)-(+g[d>>2]+(j*k-l*m));t=p*q+o*r+ +g[e+4>>2]-(k*l+j*m+ +g[d+4>>2]);m=+g[f+8>>2]+ +g[h+8>>2];if(s*s+t*t>m*m){return}c[b+56>>2]=0;h=i;i=b+48|0;f=c[h+4>>2]|0;c[i>>2]=c[h>>2];c[i+4>>2]=f;g[b+40>>2]=0.0;g[b+44>>2]=0.0;c[a>>2]=1;a=n;n=b;f=c[a+4>>2]|0;c[n>>2]=c[a>>2];c[n+4>>2]=f;c[b+16>>2]=0;return}function eg(a){a=a|0;vl(a);return}function eh(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;f=i;i=i+200|0;h=f|0;j=f+96|0;k=f+112|0;l=f+136|0;m=d+64|0;vp(l|0,m|0,64);n=d+4|0;o=c[n>>2]|0;c[n>>2]=o|4;p=o>>>1;o=c[d+48>>2]|0;q=c[d+52>>2]|0;r=((a[q+38|0]|a[o+38|0])&1)!=0;s=c[o+8>>2]|0;t=c[q+8>>2]|0;u=s+12|0;v=t+12|0;do{if(r){w=c[o+12>>2]|0;x=c[q+12>>2]|0;y=c[d+56>>2]|0;z=c[d+60>>2]|0;c[h+16>>2]=0;c[h+20>>2]=0;g[h+24>>2]=0.0;c[h+44>>2]=0;c[h+48>>2]=0;g[h+52>>2]=0.0;cf(h|0,w,y);cf(h+28|0,x,z);z=h+56|0;x=u;c[z>>2]=c[x>>2];c[z+4>>2]=c[x+4>>2];c[z+8>>2]=c[x+8>>2];c[z+12>>2]=c[x+12>>2];x=h+72|0;z=v;c[x>>2]=c[z>>2];c[x+4>>2]=c[z+4>>2];c[x+8>>2]=c[z+8>>2];c[x+12>>2]=c[z+12>>2];a[h+88|0]=1;b[j+4>>1]=0;cg(k,j,h);z=+g[k+16>>2]<11920928955078125.0e-22;c[d+124>>2]=0;A=z;B=p&1}else{bQ[c[c[d>>2]>>2]&127](d,m,u,v);z=d+124|0;x=(c[z>>2]|0)>0;if(x){y=c[l+60>>2]|0;w=0;do{C=d+64+(w*20&-1)+8|0;g[C>>2]=0.0;D=d+64+(w*20&-1)+12|0;g[D>>2]=0.0;E=c[d+64+(w*20&-1)+16>>2]|0;F=0;while(1){if((F|0)>=(y|0)){break}if((c[l+(F*20&-1)+16>>2]|0)==(E|0)){G=2312;break}else{F=F+1|0}}if((G|0)==2312){G=0;g[C>>2]=+g[l+(F*20&-1)+8>>2];g[D>>2]=+g[l+(F*20&-1)+12>>2]}w=w+1|0;}while((w|0)<(c[z>>2]|0))}z=p&1;if(!(x^(z|0)!=0)){A=x;B=z;break}w=s+4|0;y=b[w>>1]|0;if((y&2)==0){b[w>>1]=y|2;g[s+144>>2]=0.0}y=t+4|0;w=b[y>>1]|0;if((w&2)!=0){A=x;B=z;break}b[y>>1]=w|2;g[t+144>>2]=0.0;A=x;B=z}}while(0);t=c[n>>2]|0;c[n>>2]=A?t|2:t&-3;t=(B|0)==0;B=A^1;n=(e|0)==0;if(!(t^1|B|n)){br[c[(c[e>>2]|0)+8>>2]&511](e,d)}if(!(t|A|n)){br[c[(c[e>>2]|0)+12>>2]&511](e,d)}if(r|B|n){i=f;return}bN[c[(c[e>>2]|0)+16>>2]&127](e,d,l);i=f;return}function ei(a){a=a|0;vl(a);return}function ej(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,k=0.0;e=df(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;c[f>>2]=19280;c[e+4>>2]=4;c[e+48>>2]=a;c[e+52>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;vq(e+8|0,0,40);g[e+136>>2]=+P(+(+g[a+16>>2]*+g[d+16>>2]));j=+g[a+20>>2];k=+g[d+20>>2];g[e+140>>2]=j>k?j:k;c[f>>2]=2e4;if((c[(c[a+12>>2]|0)+4>>2]|0)!=0){bc(9808,44,17872,12152);return 0}if((c[(c[d+12>>2]|0)+4>>2]|0)==0){h=e;i=h|0;return i|0}else{bc(9808,45,17872,9416);return 0}return 0}function ek(b,d){b=b|0;d=d|0;var e=0,f=0;bq[c[(c[b>>2]|0)+4>>2]&511](b);e=a[22208]|0;if((e&255)<14){f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2];c[f>>2]=b;return}else{bc(5352,173,17448,6544)}}function el(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0;if((a[21856]&1)==0){c[5466]=62;c[5467]=140;a[21872]=1;c[5490]=54;c[5491]=386;a[21968]=1;c[5472]=54;c[5473]=386;a[21896]=0;c[5496]=70;c[5497]=296;a[21992]=1;c[5478]=60;c[5479]=106;a[21920]=1;c[5469]=60;c[5470]=106;a[21884]=0;c[5484]=64;c[5485]=228;a[21944]=1;c[5493]=64;c[5494]=228;a[21980]=0;c[5502]=52;c[5503]=278;a[22016]=1;c[5475]=52;c[5476]=278;a[21908]=0;c[5508]=72;c[5509]=160;a[22040]=1;c[5499]=72;c[5500]=160;a[22004]=0;a[21856]=1}h=c[(c[b+12>>2]|0)+4>>2]|0;i=c[(c[e+12>>2]|0)+4>>2]|0;if(h>>>0>=4){bc(9712,80,15104,12104);return 0}if(i>>>0>=4){bc(9712,81,15104,9496);return 0}j=c[21864+(h*48&-1)+(i*12&-1)>>2]|0;if((j|0)==0){k=0;return k|0}if((a[21864+(h*48&-1)+(i*12&-1)+8|0]&1)==0){k=bK[j&127](e,f,b,d,g)|0;return k|0}else{k=bK[j&127](b,d,e,f,g)|0;return k|0}return 0}function em(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0;if((a[21856]&1)==0){bc(9712,103,15040,7184)}f=d+48|0;do{if((c[d+124>>2]|0)>0){h=c[(c[f>>2]|0)+8>>2]|0;i=h+4|0;j=b[i>>1]|0;if((j&2)==0){b[i>>1]=j|2;g[h+144>>2]=0.0}h=d+52|0;j=c[(c[h>>2]|0)+8>>2]|0;i=j+4|0;k=b[i>>1]|0;if((k&2)!=0){l=h;break}b[i>>1]=k|2;g[j+144>>2]=0.0;l=h}else{l=d+52|0}}while(0);h=c[(c[(c[f>>2]|0)+12>>2]|0)+4>>2]|0;f=c[(c[(c[l>>2]|0)+12>>2]|0)+4>>2]|0;if((h|0)>-1&(f|0)<4){br[c[21864+(h*48&-1)+(f*12&-1)+4>>2]&511](d,e);return}else{bc(9712,114,15040,6160)}}function en(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0,v=0,w=0,x=0,y=0,z=0;e=b;f=d;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];c[e+8>>2]=c[f+8>>2];c[e+12>>2]=c[f+12>>2];c[e+16>>2]=c[f+16>>2];c[e+20>>2]=c[f+20>>2];f=c[d+40>>2]|0;e=b+32|0;c[e>>2]=f;h=c[d+28>>2]|0;i=b+48|0;c[i>>2]=h;j=h*88&-1;h=f+102796|0;k=c[h>>2]|0;if((k|0)>=32){bc(4840,38,17040,6448)}l=f+102412+(k*12&-1)|0;c[f+102412+(k*12&-1)+4>>2]=j;m=f+102400|0;n=c[m>>2]|0;if((n+j|0)>102400){c[l>>2]=vh(j)|0;a[f+102412+(k*12&-1)+8|0]=1}else{c[l>>2]=f+n;a[f+102412+(k*12&-1)+8|0]=0;c[m>>2]=(c[m>>2]|0)+j}m=f+102404|0;k=(c[m>>2]|0)+j|0;c[m>>2]=k;m=f+102408|0;f=c[m>>2]|0;c[m>>2]=(f|0)>(k|0)?f:k;c[h>>2]=(c[h>>2]|0)+1;h=b+36|0;c[h>>2]=c[l>>2];l=c[e>>2]|0;e=(c[i>>2]|0)*152&-1;k=l+102796|0;f=c[k>>2]|0;if((f|0)>=32){bc(4840,38,17040,6448)}m=l+102412+(f*12&-1)|0;c[l+102412+(f*12&-1)+4>>2]=e;j=l+102400|0;n=c[j>>2]|0;if((n+e|0)>102400){c[m>>2]=vh(e)|0;a[l+102412+(f*12&-1)+8|0]=1}else{c[m>>2]=l+n;a[l+102412+(f*12&-1)+8|0]=0;c[j>>2]=(c[j>>2]|0)+e}j=l+102404|0;f=(c[j>>2]|0)+e|0;c[j>>2]=f;j=l+102408|0;l=c[j>>2]|0;c[j>>2]=(l|0)>(f|0)?l:f;c[k>>2]=(c[k>>2]|0)+1;k=b+40|0;c[k>>2]=c[m>>2];c[b+24>>2]=c[d+32>>2];c[b+28>>2]=c[d+36>>2];m=c[d+24>>2]|0;d=b+44|0;c[d>>2]=m;if((c[i>>2]|0)<=0){return}f=b+20|0;l=b+8|0;b=0;j=m;while(1){m=c[j+(b<<2)>>2]|0;e=c[m+48>>2]|0;n=c[m+52>>2]|0;o=c[e+8>>2]|0;p=c[n+8>>2]|0;q=c[m+124>>2]|0;if((q|0)<=0){r=2378;break}s=+g[(c[n+12>>2]|0)+8>>2];t=+g[(c[e+12>>2]|0)+8>>2];e=c[k>>2]|0;g[e+(b*152&-1)+136>>2]=+g[m+136>>2];g[e+(b*152&-1)+140>>2]=+g[m+140>>2];n=o+8|0;c[e+(b*152&-1)+112>>2]=c[n>>2];u=p+8|0;c[e+(b*152&-1)+116>>2]=c[u>>2];v=o+120|0;g[e+(b*152&-1)+120>>2]=+g[v>>2];w=p+120|0;g[e+(b*152&-1)+124>>2]=+g[w>>2];x=o+128|0;g[e+(b*152&-1)+128>>2]=+g[x>>2];y=p+128|0;g[e+(b*152&-1)+132>>2]=+g[y>>2];c[e+(b*152&-1)+148>>2]=b;c[e+(b*152&-1)+144>>2]=q;vq(e+(b*152&-1)+80|0,0,32);z=c[h>>2]|0;c[z+(b*88&-1)+32>>2]=c[n>>2];c[z+(b*88&-1)+36>>2]=c[u>>2];g[z+(b*88&-1)+40>>2]=+g[v>>2];g[z+(b*88&-1)+44>>2]=+g[w>>2];w=o+28|0;o=z+(b*88&-1)+48|0;v=c[w+4>>2]|0;c[o>>2]=c[w>>2];c[o+4>>2]=v;v=p+28|0;p=z+(b*88&-1)+56|0;o=c[v+4>>2]|0;c[p>>2]=c[v>>2];c[p+4>>2]=o;g[z+(b*88&-1)+64>>2]=+g[x>>2];g[z+(b*88&-1)+68>>2]=+g[y>>2];y=m+104|0;x=z+(b*88&-1)+16|0;o=c[y+4>>2]|0;c[x>>2]=c[y>>2];c[x+4>>2]=o;o=m+112|0;x=z+(b*88&-1)+24|0;y=c[o+4>>2]|0;c[x>>2]=c[o>>2];c[x+4>>2]=y;c[z+(b*88&-1)+84>>2]=q;g[z+(b*88&-1)+76>>2]=t;g[z+(b*88&-1)+80>>2]=s;c[z+(b*88&-1)+72>>2]=c[m+120>>2];y=0;do{if((a[f]&1)==0){g[e+(b*152&-1)+(y*36&-1)+16>>2]=0.0;g[e+(b*152&-1)+(y*36&-1)+20>>2]=0.0}else{g[e+(b*152&-1)+(y*36&-1)+16>>2]=+g[l>>2]*+g[m+64+(y*20&-1)+8>>2];g[e+(b*152&-1)+(y*36&-1)+20>>2]=+g[l>>2]*+g[m+64+(y*20&-1)+12>>2]}g[e+(b*152&-1)+(y*36&-1)+24>>2]=0.0;g[e+(b*152&-1)+(y*36&-1)+28>>2]=0.0;g[e+(b*152&-1)+(y*36&-1)+32>>2]=0.0;x=m+64+(y*20&-1)|0;o=z+(b*88&-1)+(y<<3)|0;vq(e+(b*152&-1)+(y*36&-1)|0,0,16);p=c[x+4>>2]|0;c[o>>2]=c[x>>2];c[o+4>>2]=p;y=y+1|0;}while((y|0)<(q|0));q=b+1|0;if((q|0)>=(c[i>>2]|0)){r=2387;break}b=q;j=c[d>>2]|0}if((r|0)==2378){bc(9232,71,17704,12024)}else if((r|0)==2387){return}}function eo(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0.0;b=a+48|0;if((c[b>>2]|0)<=0){return}d=a+40|0;e=a+28|0;a=0;do{f=c[d>>2]|0;h=c[f+(a*152&-1)+112>>2]|0;i=c[f+(a*152&-1)+116>>2]|0;j=+g[f+(a*152&-1)+120>>2];k=+g[f+(a*152&-1)+128>>2];l=+g[f+(a*152&-1)+124>>2];m=+g[f+(a*152&-1)+132>>2];n=c[f+(a*152&-1)+144>>2]|0;o=c[e>>2]|0;p=o+(h*12&-1)|0;q=+g[p>>2];r=+g[p+4>>2];s=+g[o+(h*12&-1)+8>>2];t=o+(i*12&-1)|0;u=+g[t>>2];v=+g[t+4>>2];w=+g[o+(i*12&-1)+8>>2];o=f+(a*152&-1)+72|0;x=+g[o>>2];y=+g[o+4>>2];z=x*-1.0;if((n|0)>0){A=r;B=q;C=v;D=u;E=s;F=w;o=0;while(1){G=+g[f+(a*152&-1)+(o*36&-1)+16>>2];H=+g[f+(a*152&-1)+(o*36&-1)+20>>2];I=x*G+y*H;J=y*G+z*H;H=E-k*(+g[f+(a*152&-1)+(o*36&-1)>>2]*J- +g[f+(a*152&-1)+(o*36&-1)+4>>2]*I);G=B-j*I;K=A-j*J;L=F+m*(J*+g[f+(a*152&-1)+(o*36&-1)+8>>2]-I*+g[f+(a*152&-1)+(o*36&-1)+12>>2]);M=D+l*I;I=C+l*J;t=o+1|0;if((t|0)<(n|0)){A=K;B=G;C=I;D=M;E=H;F=L;o=t}else{N=K;O=G;P=I;Q=M;R=H;S=L;break}}}else{N=r;O=q;P=v;Q=u;R=s;S=w}F=+N;g[p>>2]=O;g[p+4>>2]=F;g[(c[e>>2]|0)+(h*12&-1)+8>>2]=R;o=(c[e>>2]|0)+(i*12&-1)|0;F=+P;g[o>>2]=Q;g[o+4>>2]=F;g[(c[e>>2]|0)+(i*12&-1)+8>>2]=S;a=a+1|0;}while((a|0)<(c[b>>2]|0));return}
function ep(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0.0,C=0.0,D=0.0,E=0.0,F=0,G=0.0,H=0.0,I=0.0,J=0.0,K=0,L=0.0,M=0.0,N=0.0,O=0,P=0.0,Q=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0,af=0.0,ag=0.0,ah=0.0;b=i;i=i+16|0;d=b|0;e=d|0;f=d;h=i;i=i+16|0;j=h|0;k=h;l=i;i=i+24|0;m=l|0;n=l;o=a+48|0;if((c[o>>2]|0)<=0){i=b;return}p=a+40|0;q=a+36|0;r=a+44|0;s=a+24|0;t=a+28|0;a=d+8|0;d=a;u=a+4|0;a=h+8|0;h=a;v=a+4|0;a=l+8|0;l=0;while(1){w=c[p>>2]|0;x=c[q>>2]|0;y=c[(c[r>>2]|0)+(c[w+(l*152&-1)+148>>2]<<2)>>2]|0;z=c[w+(l*152&-1)+112>>2]|0;A=c[w+(l*152&-1)+116>>2]|0;B=+g[w+(l*152&-1)+120>>2];C=+g[w+(l*152&-1)+124>>2];D=+g[w+(l*152&-1)+128>>2];E=+g[w+(l*152&-1)+132>>2];F=x+(l*88&-1)+48|0;G=+g[F>>2];H=+g[F+4>>2];F=x+(l*88&-1)+56|0;I=+g[F>>2];J=+g[F+4>>2];F=c[s>>2]|0;K=F+(z*12&-1)|0;L=+g[K>>2];M=+g[K+4>>2];N=+g[F+(z*12&-1)+8>>2];K=c[t>>2]|0;O=K+(z*12&-1)|0;P=+g[O>>2];Q=+g[O+4>>2];T=+g[K+(z*12&-1)+8>>2];z=F+(A*12&-1)|0;U=+g[z>>2];V=+g[z+4>>2];W=+g[F+(A*12&-1)+8>>2];F=K+(A*12&-1)|0;X=+g[F>>2];Y=+g[F+4>>2];Z=+g[K+(A*12&-1)+8>>2];if((c[y+124>>2]|0)<=0){_=2400;break}$=+g[x+(l*88&-1)+80>>2];aa=+g[x+(l*88&-1)+76>>2];ab=+S(+N);g[d>>2]=ab;ac=+R(+N);g[u>>2]=ac;N=+S(+W);g[h>>2]=N;ad=+R(+W);g[v>>2]=ad;W=+(M-(H*ac+G*ab));g[e>>2]=L-(G*ac-H*ab);g[e+4>>2]=W;W=+(V-(J*ad+I*N));g[j>>2]=U-(I*ad-J*N);g[j+4>>2]=W;cd(n,y+64|0,f,aa,k,$);y=w+(l*152&-1)+72|0;x=y;A=c[m+4>>2]|0;c[x>>2]=c[m>>2];c[x+4>>2]=A;A=w+(l*152&-1)+144|0;x=c[A>>2]|0;do{if((x|0)>0){K=w+(l*152&-1)+76|0;F=y|0;$=B+C;aa=-0.0-Z;W=-0.0-T;z=w+(l*152&-1)+140|0;O=0;do{N=+g[a+(O<<3)>>2];J=N-L;ad=+g[a+(O<<3)+4>>2];ae=w+(l*152&-1)+(O*36&-1)|0;I=+(ad-M);g[ae>>2]=J;g[ae+4>>2]=I;I=N-U;ae=w+(l*152&-1)+(O*36&-1)+8|0;N=+(ad-V);g[ae>>2]=I;g[ae+4>>2]=N;N=+g[K>>2];ad=+g[w+(l*152&-1)+(O*36&-1)+4>>2];ab=+g[F>>2];H=J*N-ad*ab;ac=+g[w+(l*152&-1)+(O*36&-1)+12>>2];G=N*I-ab*ac;ab=$+H*D*H+G*E*G;if(ab>0.0){af=1.0/ab}else{af=0.0}g[w+(l*152&-1)+(O*36&-1)+24>>2]=af;ab=+g[K>>2];G=+g[F>>2]*-1.0;H=J*G-ab*ad;N=G*I-ab*ac;ab=$+H*D*H+N*E*N;if(ab>0.0){ag=1.0/ab}else{ag=0.0}g[w+(l*152&-1)+(O*36&-1)+28>>2]=ag;ae=w+(l*152&-1)+(O*36&-1)+32|0;g[ae>>2]=0.0;ab=+g[F>>2]*(X+ac*aa-P-ad*W)+ +g[K>>2]*(Y+Z*I-Q-T*J);if(ab<-1.0){g[ae>>2]=ab*(-0.0- +g[z>>2])}O=O+1|0;}while((O|0)<(x|0));if((c[A>>2]|0)!=2){break}W=+g[w+(l*152&-1)+76>>2];aa=+g[y>>2];$=+g[w+(l*152&-1)>>2]*W- +g[w+(l*152&-1)+4>>2]*aa;ab=W*+g[w+(l*152&-1)+8>>2]-aa*+g[w+(l*152&-1)+12>>2];J=W*+g[w+(l*152&-1)+36>>2]-aa*+g[w+(l*152&-1)+40>>2];I=W*+g[w+(l*152&-1)+44>>2]-aa*+g[w+(l*152&-1)+48>>2];aa=B+C;W=D*$;ad=E*ab;ac=aa+$*W+ab*ad;ab=aa+J*D*J+I*E*I;$=aa+W*J+ad*I;I=ac*ab-$*$;if(ac*ac>=I*1.0e3){c[A>>2]=1;break}g[w+(l*152&-1)+96>>2]=ac;g[w+(l*152&-1)+100>>2]=$;g[w+(l*152&-1)+104>>2]=$;g[w+(l*152&-1)+108>>2]=ab;if(I!=0.0){ah=1.0/I}else{ah=I}I=$*(-0.0-ah);g[w+(l*152&-1)+80>>2]=ab*ah;g[w+(l*152&-1)+84>>2]=I;g[w+(l*152&-1)+88>>2]=I;g[w+(l*152&-1)+92>>2]=ac*ah}}while(0);w=l+1|0;if((w|0)<(c[o>>2]|0)){l=w}else{_=2418;break}}if((_|0)==2418){i=b;return}else if((_|0)==2400){bc(9232,168,17760,9464)}}function eq(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0.0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0.0,x=0,y=0,z=0,A=0,B=0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0.0,ao=0.0,ap=0.0,aq=0.0,ar=0;b=i;i=i+16|0;d=b|0;e=d|0;f=d;h=i;i=i+16|0;j=h|0;k=h;l=i;i=i+20|0;i=i+7>>3<<3;m=a+48|0;if((c[m>>2]|0)<=0){n=0.0;o=n>=-.014999999664723873;i=b;return o|0}p=a+36|0;q=a+24|0;a=d+8|0;d=a;r=a+4|0;a=h+8|0;h=a;s=a+4|0;a=l;t=l+8|0;u=l+16|0;v=0;w=0.0;while(1){x=c[p>>2]|0;y=x+(v*88&-1)|0;z=c[x+(v*88&-1)+32>>2]|0;A=c[x+(v*88&-1)+36>>2]|0;B=x+(v*88&-1)+48|0;C=+g[B>>2];D=+g[B+4>>2];E=+g[x+(v*88&-1)+40>>2];F=+g[x+(v*88&-1)+64>>2];B=x+(v*88&-1)+56|0;G=+g[B>>2];H=+g[B+4>>2];I=+g[x+(v*88&-1)+44>>2];J=+g[x+(v*88&-1)+68>>2];B=c[x+(v*88&-1)+84>>2]|0;x=c[q>>2]|0;K=x+(z*12&-1)|0;L=+g[K>>2];M=+g[K+4>>2];N=+g[x+(z*12&-1)+8>>2];K=x+(A*12&-1)|0;O=+g[K>>2];P=+g[K+4>>2];Q=+g[x+(A*12&-1)+8>>2];if((B|0)>0){T=E+I;U=M;V=L;W=P;X=O;K=0;Y=Q;Z=N;_=w;do{$=+S(+Z);g[d>>2]=$;aa=+R(+Z);g[r>>2]=aa;ab=+S(+Y);g[h>>2]=ab;ac=+R(+Y);g[s>>2]=ac;ad=+(U-(D*aa+C*$));g[e>>2]=V-(C*aa-D*$);g[e+4>>2]=ad;ad=+(W-(H*ac+G*ab));g[j>>2]=X-(G*ac-H*ab);g[j+4>>2]=ad;eC(l,y,f,k,K);ad=+g[a>>2];ab=+g[a+4>>2];ac=+g[t>>2];$=+g[t+4>>2];aa=+g[u>>2];ae=ac-V;af=$-U;ag=ac-X;ac=$-W;_=_<aa?_:aa;$=(aa+.004999999888241291)*.20000000298023224;aa=$<0.0?$:0.0;$=ab*ae-ad*af;ah=ab*ag-ad*ac;ai=ah*J*ah+(T+$*F*$);if(ai>0.0){aj=(-0.0-(aa<-.20000000298023224?-.20000000298023224:aa))/ai}else{aj=0.0}ai=ad*aj;ad=ab*aj;V=V-E*ai;U=U-E*ad;Z=Z-F*(ae*ad-af*ai);X=X+I*ai;W=W+I*ad;Y=Y+J*(ag*ad-ac*ai);K=K+1|0;}while((K|0)<(B|0));ak=U;al=V;am=W;an=X;ao=Y;ap=Z;aq=_;ar=c[q>>2]|0}else{ak=M;al=L;am=P;an=O;ao=Q;ap=N;aq=w;ar=x}B=ar+(z*12&-1)|0;J=+ak;g[B>>2]=al;g[B+4>>2]=J;g[(c[q>>2]|0)+(z*12&-1)+8>>2]=ap;B=(c[q>>2]|0)+(A*12&-1)|0;J=+am;g[B>>2]=an;g[B+4>>2]=J;g[(c[q>>2]|0)+(A*12&-1)+8>>2]=ao;B=v+1|0;if((B|0)<(c[m>>2]|0)){v=B;w=aq}else{n=aq;break}}o=n>=-.014999999664723873;i=b;return o|0}function er(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,i=0,j=0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0,r=0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0.0,F=0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0;b=a+48|0;if((c[b>>2]|0)<=0){return}d=a+40|0;e=a+28|0;a=0;L3146:while(1){f=c[d>>2]|0;h=f+(a*152&-1)|0;i=c[f+(a*152&-1)+112>>2]|0;j=c[f+(a*152&-1)+116>>2]|0;k=+g[f+(a*152&-1)+120>>2];l=+g[f+(a*152&-1)+128>>2];m=+g[f+(a*152&-1)+124>>2];n=+g[f+(a*152&-1)+132>>2];o=f+(a*152&-1)+144|0;p=c[o>>2]|0;q=c[e>>2]|0;r=q+(i*12&-1)|0;s=q+(j*12&-1)|0;t=f+(a*152&-1)+72|0;u=+g[t>>2];v=+g[t+4>>2];w=u*-1.0;x=+g[f+(a*152&-1)+136>>2];if((p-1|0)>>>0<2){y=+g[r+4>>2];z=+g[r>>2];A=+g[s+4>>2];B=+g[s>>2];C=0;D=+g[q+(j*12&-1)+8>>2];E=+g[q+(i*12&-1)+8>>2]}else{F=2435;break}do{G=+g[f+(a*152&-1)+(C*36&-1)+12>>2];H=+g[f+(a*152&-1)+(C*36&-1)+8>>2];I=+g[f+(a*152&-1)+(C*36&-1)+4>>2];J=+g[f+(a*152&-1)+(C*36&-1)>>2];K=x*+g[f+(a*152&-1)+(C*36&-1)+16>>2];q=f+(a*152&-1)+(C*36&-1)+20|0;L=+g[q>>2];M=L+ +g[f+(a*152&-1)+(C*36&-1)+28>>2]*(-0.0-(v*(B+G*(-0.0-D)-z-I*(-0.0-E))+w*(A+D*H-y-E*J)));N=-0.0-K;O=M<K?M:K;K=O<N?N:O;O=K-L;g[q>>2]=K;K=v*O;L=w*O;z=z-k*K;y=y-k*L;E=E-l*(J*L-I*K);B=B+m*K;A=A+m*L;D=D+n*(H*L-G*K);C=C+1|0;}while((C|0)<(p|0));L3151:do{if((c[o>>2]|0)==1){w=+g[f+(a*152&-1)+12>>2];x=+g[f+(a*152&-1)+8>>2];K=+g[f+(a*152&-1)+4>>2];G=+g[h>>2];p=f+(a*152&-1)+16|0;L=+g[p>>2];H=L+(u*(B+w*(-0.0-D)-z-K*(-0.0-E))+v*(A+D*x-y-E*G)- +g[f+(a*152&-1)+32>>2])*(-0.0- +g[f+(a*152&-1)+24>>2]);I=H>0.0?H:0.0;H=I-L;g[p>>2]=I;I=u*H;L=v*H;P=E-l*(G*L-K*I);Q=D+n*(x*L-w*I);R=B+m*I;S=A+m*L;T=z-k*I;U=y-k*L}else{p=f+(a*152&-1)+16|0;L=+g[p>>2];q=f+(a*152&-1)+52|0;I=+g[q>>2];if(L<0.0|I<0.0){F=2440;break L3146}w=-0.0-D;x=+g[f+(a*152&-1)+12>>2];K=+g[f+(a*152&-1)+8>>2];G=-0.0-E;H=+g[f+(a*152&-1)+4>>2];J=+g[h>>2];O=+g[f+(a*152&-1)+48>>2];N=+g[f+(a*152&-1)+44>>2];M=+g[f+(a*152&-1)+40>>2];V=+g[f+(a*152&-1)+36>>2];W=+g[f+(a*152&-1)+104>>2];X=+g[f+(a*152&-1)+100>>2];Y=u*(B+x*w-z-H*G)+v*(A+D*K-y-E*J)- +g[f+(a*152&-1)+32>>2]-(L*+g[f+(a*152&-1)+96>>2]+I*W);Z=u*(B+O*w-z-M*G)+v*(A+D*N-y-E*V)- +g[f+(a*152&-1)+68>>2]-(L*X+I*+g[f+(a*152&-1)+108>>2]);G=+g[f+(a*152&-1)+80>>2]*Y+ +g[f+(a*152&-1)+88>>2]*Z;w=Y*+g[f+(a*152&-1)+84>>2]+Z*+g[f+(a*152&-1)+92>>2];_=-0.0-G;$=-0.0-w;if(!(G>-0.0|w>-0.0)){w=_-L;G=$-I;aa=u*w;ab=v*w;w=u*G;ac=v*G;G=aa+w;ad=ab+ac;g[p>>2]=_;g[q>>2]=$;P=E-l*(J*ab-H*aa+(V*ac-M*w));Q=D+n*(K*ab-x*aa+(N*ac-O*w));R=B+m*G;S=A+m*ad;T=z-k*G;U=y-k*ad;break}ad=Y*(-0.0- +g[f+(a*152&-1)+24>>2]);do{if(ad>=0.0){if(Z+ad*X<0.0){break}G=ad-L;w=0.0-I;ac=u*G;aa=v*G;G=u*w;ab=v*w;w=G+ac;$=ab+aa;g[p>>2]=ad;g[q>>2]=0.0;P=E-l*(aa*J-ac*H+(ab*V-G*M));Q=D+n*(aa*K-ac*x+(ab*N-G*O));R=B+m*w;S=A+m*$;T=z-k*w;U=y-k*$;break L3151}}while(0);ad=Z*(-0.0- +g[f+(a*152&-1)+60>>2]);do{if(ad>=0.0){if(Y+ad*W<0.0){break}X=0.0-L;$=ad-I;w=u*X;G=v*X;X=u*$;ab=v*$;$=w+X;ac=G+ab;g[p>>2]=0.0;g[q>>2]=ad;P=E-l*(G*J-w*H+(ab*V-X*M));Q=D+n*(G*K-w*x+(ab*N-X*O));R=B+m*$;S=A+m*ac;T=z-k*$;U=y-k*ac;break L3151}}while(0);if(Y<0.0|Z<0.0){P=E;Q=D;R=B;S=A;T=z;U=y;break}ad=0.0-L;W=0.0-I;ac=u*ad;$=v*ad;ad=u*W;X=v*W;W=ac+ad;ab=$+X;g[p>>2]=0.0;g[q>>2]=0.0;P=E-l*($*J-ac*H+(X*V-ad*M));Q=D+n*($*K-ac*x+(X*N-ad*O));R=B+m*W;S=A+m*ab;T=z-k*W;U=y-k*ab}}while(0);f=(c[e>>2]|0)+(i*12&-1)|0;k=+U;g[f>>2]=T;g[f+4>>2]=k;g[(c[e>>2]|0)+(i*12&-1)+8>>2]=P;f=(c[e>>2]|0)+(j*12&-1)|0;k=+S;g[f>>2]=R;g[f+4>>2]=k;g[(c[e>>2]|0)+(j*12&-1)+8>>2]=Q;f=a+1|0;if((f|0)<(c[b>>2]|0)){a=f}else{F=2454;break}}if((F|0)==2454){return}else if((F|0)==2440){bc(9232,406,17816,6128)}else if((F|0)==2435){bc(9232,311,17816,7144)}}function es(a){a=a|0;return}function et(a){a=a|0;return}function eu(a){a=a|0;return}function ev(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0.0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0,A=0,B=0,C=0,D=0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0,N=0.0,O=0.0,P=0.0,Q=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0.0,ao=0.0,ap=0.0,aq=0.0,ar=0.0,as=0.0,at=0;e=i;i=i+16|0;f=e|0;h=f|0;j=f;k=i;i=i+16|0;l=k|0;m=k;n=i;i=i+20|0;i=i+7>>3<<3;o=a+48|0;if((c[o>>2]|0)<=0){p=0.0;q=p>=-.007499999832361937;i=e;return q|0}r=a+36|0;s=a+24|0;a=f+8|0;f=a;t=a+4|0;a=k+8|0;k=a;u=a+4|0;a=n;v=n+8|0;w=n+16|0;x=0;y=0.0;while(1){z=c[r>>2]|0;A=z+(x*88&-1)|0;B=c[z+(x*88&-1)+32>>2]|0;C=c[z+(x*88&-1)+36>>2]|0;D=z+(x*88&-1)+48|0;E=+g[D>>2];F=+g[D+4>>2];D=z+(x*88&-1)+56|0;G=+g[D>>2];H=+g[D+4>>2];D=c[z+(x*88&-1)+84>>2]|0;if((B|0)==(b|0)|(B|0)==(d|0)){I=+g[z+(x*88&-1)+40>>2];J=+g[z+(x*88&-1)+64>>2]}else{I=0.0;J=0.0}K=+g[z+(x*88&-1)+44>>2];L=+g[z+(x*88&-1)+68>>2];z=c[s>>2]|0;M=z+(B*12&-1)|0;N=+g[M>>2];O=+g[M+4>>2];P=+g[z+(B*12&-1)+8>>2];M=z+(C*12&-1)|0;Q=+g[M>>2];T=+g[M+4>>2];U=+g[z+(C*12&-1)+8>>2];if((D|0)>0){V=I+K;W=O;X=N;Y=T;Z=Q;_=P;$=U;M=0;aa=y;do{ab=+S(+_);g[f>>2]=ab;ac=+R(+_);g[t>>2]=ac;ad=+S(+$);g[k>>2]=ad;ae=+R(+$);g[u>>2]=ae;af=+(W-(F*ac+E*ab));g[h>>2]=X-(E*ac-F*ab);g[h+4>>2]=af;af=+(Y-(H*ae+G*ad));g[l>>2]=Z-(G*ae-H*ad);g[l+4>>2]=af;eC(n,A,j,m,M);af=+g[a>>2];ad=+g[a+4>>2];ae=+g[v>>2];ab=+g[v+4>>2];ac=+g[w>>2];ag=ae-X;ah=ab-W;ai=ae-Z;ae=ab-Y;aa=aa<ac?aa:ac;ab=(ac+.004999999888241291)*.75;ac=ab<0.0?ab:0.0;ab=ad*ag-af*ah;aj=ad*ai-af*ae;ak=aj*L*aj+(V+ab*J*ab);if(ak>0.0){al=(-0.0-(ac<-.20000000298023224?-.20000000298023224:ac))/ak}else{al=0.0}ak=af*al;af=ad*al;X=X-I*ak;W=W-I*af;_=_-J*(ag*af-ah*ak);Z=Z+K*ak;Y=Y+K*af;$=$+L*(ai*af-ae*ak);M=M+1|0;}while((M|0)<(D|0));am=W;an=X;ao=Y;ap=Z;aq=_;ar=$;as=aa;at=c[s>>2]|0}else{am=O;an=N;ao=T;ap=Q;aq=P;ar=U;as=y;at=z}D=at+(B*12&-1)|0;L=+am;g[D>>2]=an;g[D+4>>2]=L;g[(c[s>>2]|0)+(B*12&-1)+8>>2]=aq;D=(c[s>>2]|0)+(C*12&-1)|0;L=+ao;g[D>>2]=ap;g[D+4>>2]=L;g[(c[s>>2]|0)+(C*12&-1)+8>>2]=ar;D=x+1|0;if((D|0)<(c[o>>2]|0)){x=D;y=as}else{p=as;break}}q=p>=-.007499999832361937;i=e;return q|0}function ew(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;b6(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function ex(a){a=a|0;vl(a);return}function ey(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;f=i;i=i+256|0;b7(f|0,b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);i=f;return}function ez(a){a=a|0;vl(a);return}function eA(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;b5(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function eB(a){a=a|0;vl(a);return}function eC(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,k=0.0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0;if((c[b+84>>2]|0)<=0){bc(9232,617,16360,5640)}h=c[b+72>>2]|0;if((h|0)==2){i=e+12|0;j=+g[i>>2];k=+g[b+16>>2];l=e+8|0;m=+g[l>>2];n=+g[b+20>>2];o=j*k-m*n;p=k*m+j*n;q=a;n=+p;g[q>>2]=o;g[q+4>>2]=n;n=+g[i>>2];j=+g[b+24>>2];m=+g[l>>2];k=+g[b+28>>2];r=+g[d+12>>2];s=+g[b+(f<<3)>>2];t=+g[d+8>>2];u=+g[b+(f<<3)+4>>2];v=+g[d>>2]+(r*s-t*u);w=s*t+r*u+ +g[d+4>>2];g[a+16>>2]=o*(v-(+g[e>>2]+(n*j-m*k)))+(w-(j*m+n*k+ +g[e+4>>2]))*p- +g[b+76>>2]- +g[b+80>>2];l=a+8|0;k=+w;g[l>>2]=v;g[l+4>>2]=k;k=+(-0.0-p);g[q>>2]=-0.0-o;g[q+4>>2]=k;return}else if((h|0)==0){k=+g[d+12>>2];o=+g[b+24>>2];p=+g[d+8>>2];v=+g[b+28>>2];w=+g[d>>2]+(k*o-p*v);n=o*p+k*v+ +g[d+4>>2];v=+g[e+12>>2];k=+g[b>>2];p=+g[e+8>>2];o=+g[b+4>>2];m=+g[e>>2]+(v*k-p*o);j=k*p+v*o+ +g[e+4>>2];o=m-w;v=j-n;q=a;p=+v;g[q>>2]=o;g[q+4>>2]=p;p=+P(+(o*o+v*v));if(p<1.1920928955078125e-7){x=o;y=v}else{k=1.0/p;p=o*k;g[a>>2]=p;u=v*k;g[a+4>>2]=u;x=p;y=u}q=a+8|0;u=+((n+j)*.5);g[q>>2]=(w+m)*.5;g[q+4>>2]=u;g[a+16>>2]=o*x+v*y- +g[b+76>>2]- +g[b+80>>2];return}else if((h|0)==1){h=d+12|0;y=+g[h>>2];v=+g[b+16>>2];q=d+8|0;x=+g[q>>2];o=+g[b+20>>2];u=y*v-x*o;m=v*x+y*o;l=a;o=+m;g[l>>2]=u;g[l+4>>2]=o;o=+g[h>>2];y=+g[b+24>>2];x=+g[q>>2];v=+g[b+28>>2];w=+g[e+12>>2];j=+g[b+(f<<3)>>2];n=+g[e+8>>2];p=+g[b+(f<<3)+4>>2];k=+g[e>>2]+(w*j-n*p);r=j*n+w*p+ +g[e+4>>2];g[a+16>>2]=u*(k-(+g[d>>2]+(o*y-x*v)))+(r-(y*x+o*v+ +g[d+4>>2]))*m- +g[b+76>>2]- +g[b+80>>2];b=a+8|0;m=+r;g[b>>2]=k;g[b+4>>2]=m;return}else{return}}function eD(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,k=0.0;e=df(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;c[f>>2]=19280;c[e+4>>2]=4;c[e+48>>2]=a;c[e+52>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;vq(e+8|0,0,40);g[e+136>>2]=+P(+(+g[a+16>>2]*+g[d+16>>2]));j=+g[a+20>>2];k=+g[d+20>>2];g[e+140>>2]=j>k?j:k;c[f>>2]=19544;if((c[(c[a+12>>2]|0)+4>>2]|0)!=1){bc(8616,41,16760,11856);return 0}if((c[(c[d+12>>2]|0)+4>>2]|0)==0){h=e;i=h|0;return i|0}else{bc(8616,42,16760,9416);return 0}return 0}function eE(b,d){b=b|0;d=d|0;var e=0,f=0;bq[c[(c[b>>2]|0)+4>>2]&511](b);e=a[22208]|0;if((e&255)<14){f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2];c[f>>2]=b;return}else{bc(5352,173,17448,6544)}}function eF(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,k=0.0;e=df(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;c[f>>2]=19280;c[e+4>>2]=4;c[e+48>>2]=a;c[e+52>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;vq(e+8|0,0,40);g[e+136>>2]=+P(+(+g[a+16>>2]*+g[d+16>>2]));j=+g[a+20>>2];k=+g[d+20>>2];g[e+140>>2]=j>k?j:k;c[f>>2]=19480;if((c[(c[a+12>>2]|0)+4>>2]|0)!=1){bc(8440,41,16584,11856);return 0}if((c[(c[d+12>>2]|0)+4>>2]|0)==2){h=e;i=h|0;return i|0}else{bc(8440,42,16584,9368);return 0}return 0}function eG(b,d){b=b|0;d=d|0;var e=0,f=0;bq[c[(c[b>>2]|0)+4>>2]&511](b);e=a[22208]|0;if((e&255)<14){f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2];c[f>>2]=b;return}else{bc(5352,173,17448,6544)}}function eH(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,k=0.0;e=df(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;c[f>>2]=19280;c[e+4>>2]=4;c[e+48>>2]=a;c[e+52>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;vq(e+8|0,0,40);g[e+136>>2]=+P(+(+g[a+16>>2]*+g[d+16>>2]));j=+g[a+20>>2];k=+g[d+20>>2];g[e+140>>2]=j>k?j:k;c[f>>2]=19416;if((c[(c[a+12>>2]|0)+4>>2]|0)!=2){bc(8208,41,16280,11808);return 0}if((c[(c[d+12>>2]|0)+4>>2]|0)==0){h=e;i=h|0;return i|0}else{bc(8208,42,16280,9416);return 0}return 0}function eI(b,d){b=b|0;d=d|0;var e=0,f=0;bq[c[(c[b>>2]|0)+4>>2]&511](b);e=a[22208]|0;if((e&255)<14){f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2];c[f>>2]=b;return}else{bc(5352,173,17448,6544)}}function eJ(a){a=a|0;return}function eK(a,b){a=a|0;b=+b;return+0.0}function eL(a){a=a|0;return}function eM(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,k=0.0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0;d=a+108|0;e=c[d>>2]|0;f=b+28|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=+g[h>>2];j=+g[h+4>>2];k=+g[b+(e*12&-1)+8>>2];h=a+112|0;l=c[h>>2]|0;m=b+(l*12&-1)|0;n=+g[m>>2];o=+g[m+4>>2];p=+g[b+(l*12&-1)+8>>2];q=+g[a+128>>2];r=+g[a+124>>2];s=+g[a+136>>2];t=+g[a+132>>2];u=+g[a+116>>2];v=+g[a+120>>2];l=a+100|0;w=+g[l>>2];x=(+g[a+76>>2]+(u*(n+s*(-0.0-p)-(i+q*(-0.0-k)))+v*(o+p*t-(j+k*r)))+ +g[a+96>>2]*w)*(-0.0- +g[a+172>>2]);g[l>>2]=w+x;w=u*x;u=v*x;x=+g[a+156>>2];v=k- +g[a+164>>2]*(u*r-w*q);q=+g[a+160>>2];r=p+ +g[a+168>>2]*(u*t-w*s);a=(c[f>>2]|0)+(e*12&-1)|0;s=+(j-x*u);g[a>>2]=i-x*w;g[a+4>>2]=s;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=v;d=(c[f>>2]|0)+((c[h>>2]|0)*12&-1)|0;v=+(o+u*q);g[d>>2]=n+w*q;g[d+4>>2]=v;g[(c[f>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=r;return}function eN(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+80>>2];h=+g[d+20>>2];i=+g[b+84>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function eO(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+88>>2];h=+g[d+20>>2];i=+g[b+92>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function eP(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+100>>2]*c;c=d*+g[b+120>>2];g[a>>2]=+g[b+116>>2]*d;g[a+4>>2]=c;return}function eQ(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;ca(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function eR(a){a=a|0;vl(a);return}function eS(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,Q=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+108|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+112|0;c[l>>2]=j;m=e+28|0;n=b+140|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+148|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+156>>2]=s;t=+g[i+120>>2];g[b+160>>2]=t;u=+g[e+128>>2];g[b+164>>2]=u;v=+g[i+128>>2];g[b+168>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;w=+g[e>>2];x=+g[e+4>>2];y=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;z=+g[n>>2];A=+g[n+4>>2];B=+g[m+(f*12&-1)+8>>2];n=i+(j*12&-1)|0;C=+g[n>>2];D=+g[n+4>>2];E=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;F=+g[i>>2];G=+g[i+4>>2];H=+g[m+(j*12&-1)+8>>2];I=+S(+y);J=+R(+y);y=+S(+E);K=+R(+E);E=+g[b+80>>2]-(c[k>>2]=o,+g[k>>2]);L=+g[b+84>>2]-(c[k>>2]=p,+g[k>>2]);M=J*E-I*L;N=I*E+J*L;p=b+124|0;L=+N;g[p>>2]=M;g[p+4>>2]=L;L=+g[b+88>>2]-(c[k>>2]=q,+g[k>>2]);J=+g[b+92>>2]-(c[k>>2]=r,+g[k>>2]);E=K*L-y*J;I=y*L+K*J;r=b+132|0;J=+I;g[r>>2]=E;g[r+4>>2]=J;r=b+116|0;J=C+E-w-M;w=D+I-x-N;q=r;x=+w;g[q>>2]=J;g[q+4>>2]=x;q=r|0;x=+P(+(J*J+w*w));if(x>.004999999888241291){D=1.0/x;C=J*D;g[q>>2]=C;O=D*w;Q=C}else{g[q>>2]=0.0;O=0.0;Q=0.0}g[b+120>>2]=O;C=O*M-N*Q;w=O*E-Q*I;D=t+(s+C*C*u)+w*w*v;if(D!=0.0){T=1.0/D}else{T=0.0}q=b+172|0;g[q>>2]=T;w=+g[b+68>>2];if(w>0.0){C=x- +g[b+104>>2];x=w*6.2831854820251465;w=x*T*x;J=+g[d>>2];K=J*(x*T*2.0*+g[b+72>>2]+w*J);r=b+96|0;g[r>>2]=K;if(K!=0.0){U=1.0/K}else{U=0.0}g[r>>2]=U;g[b+76>>2]=w*C*J*U;J=D+U;if(J!=0.0){V=1.0/J}else{V=0.0}g[q>>2]=V}else{g[b+96>>2]=0.0;g[b+76>>2]=0.0}if((a[d+20|0]&1)==0){g[b+100>>2]=0.0;W=B;X=H;Y=F;Z=G;_=z;$=A;aa=c[e>>2]|0;ab=aa+(f*12&-1)|0;ac=ab;ad=(g[k>>2]=_,c[k>>2]|0);ae=(g[k>>2]=$,c[k>>2]|0);af=ae;ag=0;ah=0;ai=af;aj=ad;ak=0;al=ah|aj;am=ai|ak;an=ac|0;c[an>>2]=al;ao=ac+4|0;c[ao>>2]=am;ap=c[h>>2]|0;aq=c[e>>2]|0;ar=aq+(ap*12&-1)+8|0;g[ar>>2]=W;as=c[l>>2]|0;at=c[e>>2]|0;au=at+(as*12&-1)|0;av=au;aw=(g[k>>2]=Y,c[k>>2]|0);ax=(g[k>>2]=Z,c[k>>2]|0);ay=ax;az=0;aA=0;aB=ay;aC=aw;aD=0;aE=aA|aC;aF=aB|aD;aG=av|0;c[aG>>2]=aE;aH=av+4|0;c[aH>>2]=aF;aI=c[l>>2]|0;aJ=c[e>>2]|0;aK=aJ+(aI*12&-1)+8|0;g[aK>>2]=X;return}else{q=b+100|0;V=+g[d+8>>2]*+g[q>>2];g[q>>2]=V;J=Q*V;Q=V*O;W=B-u*(Q*M-J*N);X=H+v*(Q*E-J*I);Y=F+J*t;Z=G+Q*t;_=z-J*s;$=A-Q*s;aa=c[e>>2]|0;ab=aa+(f*12&-1)|0;ac=ab;ad=(g[k>>2]=_,c[k>>2]|0);ae=(g[k>>2]=$,c[k>>2]|0);af=ae;ag=0;ah=0;ai=af;aj=ad;ak=0;al=ah|aj;am=ai|ak;an=ac|0;c[an>>2]=al;ao=ac+4|0;c[ao>>2]=am;ap=c[h>>2]|0;aq=c[e>>2]|0;ar=aq+(ap*12&-1)+8|0;g[ar>>2]=W;as=c[l>>2]|0;at=c[e>>2]|0;au=at+(as*12&-1)|0;av=au;aw=(g[k>>2]=Y,c[k>>2]|0);ax=(g[k>>2]=Z,c[k>>2]|0);ay=ax;az=0;aA=0;aB=ay;aC=aw;aD=0;aE=aA|aC;aF=aB|aD;aG=av|0;c[aG>>2]=aE;aH=av+4|0;c[aH>>2]=aF;aI=c[l>>2]|0;aJ=c[e>>2]|0;aK=aJ+(aI*12&-1)+8|0;g[aK>>2]=X;return}}function eT(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0;if(+g[a+68>>2]>0.0){d=1;return d|0}e=a+108|0;f=c[e>>2]|0;h=b+24|0;b=c[h>>2]|0;i=b+(f*12&-1)|0;j=+g[i>>2];k=+g[i+4>>2];l=+g[b+(f*12&-1)+8>>2];f=a+112|0;m=c[f>>2]|0;n=b+(m*12&-1)|0;o=+g[n>>2];p=+g[n+4>>2];q=+g[b+(m*12&-1)+8>>2];r=+S(+l);s=+R(+l);t=+S(+q);u=+R(+q);v=+g[a+80>>2]- +g[a+140>>2];w=+g[a+84>>2]- +g[a+144>>2];x=s*v-r*w;y=r*v+s*w;w=+g[a+88>>2]- +g[a+148>>2];s=+g[a+92>>2]- +g[a+152>>2];v=u*w-t*s;r=t*w+u*s;s=o+v-j-x;u=p+r-k-y;w=+P(+(s*s+u*u));if(w<1.1920928955078125e-7){z=0.0;A=s;B=u}else{t=1.0/w;z=w;A=s*t;B=u*t}t=z- +g[a+104>>2];z=t<.20000000298023224?t:.20000000298023224;t=z<-.20000000298023224?-.20000000298023224:z;z=t*(-0.0- +g[a+172>>2]);u=A*z;A=B*z;z=+g[a+156>>2];B=l- +g[a+164>>2]*(x*A-y*u);y=+g[a+160>>2];x=q+ +g[a+168>>2]*(v*A-r*u);r=+(k-z*A);g[i>>2]=j-z*u;g[i+4>>2]=r;g[(c[h>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=B;e=(c[h>>2]|0)+((c[f>>2]|0)*12&-1)|0;B=+(p+y*A);g[e>>2]=o+y*u;g[e+4>>2]=B;g[(c[h>>2]|0)+((c[f>>2]|0)*12&-1)+8>>2]=x;if(t>0.0){C=t}else{C=-0.0-t}d=C<.004999999888241291;return d|0}function eU(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;db(7888,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(11336,(u=i,i=i+8|0,c[u>>2]=e,u)|0);db(8808,(u=i,i=i+8|0,c[u>>2]=f,u)|0);db(6768,(u=i,i=i+8|0,c[u>>2]=a[b+61|0]&1,u)|0);j=+g[b+84>>2];db(5992,(u=i,i=i+16|0,h[u>>3]=+g[b+80>>2],h[u+8>>3]=j,u)|0);j=+g[b+92>>2];db(5536,(u=i,i=i+16|0,h[u>>3]=+g[b+88>>2],h[u+8>>3]=j,u)|0);db(5176,(u=i,i=i+8|0,h[u>>3]=+g[b+104>>2],u)|0);db(12768,(u=i,i=i+8|0,h[u>>3]=+g[b+68>>2],u)|0);db(12472,(u=i,i=i+8|0,h[u>>3]=+g[b+72>>2],u)|0);db(11904,(u=i,i=i+8|0,c[u>>2]=c[b+56>>2],u)|0);i=d;return}function eV(a){a=a|0;vl(a);return}function eW(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,k=0.0;e=df(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;c[f>>2]=19280;c[e+4>>2]=4;c[e+48>>2]=a;c[e+52>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;vq(e+8|0,0,40);g[e+136>>2]=+P(+(+g[a+16>>2]*+g[d+16>>2]));j=+g[a+20>>2];k=+g[d+20>>2];g[e+140>>2]=j>k?j:k;c[f>>2]=19736;if((c[(c[a+12>>2]|0)+4>>2]|0)!=2){bc(7976,44,17304,11808);return 0}if((c[(c[d+12>>2]|0)+4>>2]|0)==2){h=e;i=h|0;return i|0}else{bc(7976,45,17304,9368);return 0}return 0}function eX(b,d){b=b|0;d=d|0;var e=0,f=0;bq[c[(c[b>>2]|0)+4>>2]&511](b);e=a[22208]|0;if((e&255)<14){f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2];c[f>>2]=b;return}else{bc(5352,173,17448,6544)}}function eY(a,b){a=a|0;b=b|0;return 1}function eZ(a){a=a|0;return}function e_(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function e$(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function e0(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+88>>2]*c;g[a>>2]=+g[b+84>>2]*c;g[a+4>>2]=d;return}function e1(a,b){a=a|0;b=+b;return+(+g[a+92>>2]*b)}function e2(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,T=0.0,U=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+104|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+108|0;c[l>>2]=j;m=e+28|0;n=b+128|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+136|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+144>>2]=s;t=+g[i+120>>2];g[b+148>>2]=t;u=+g[e+128>>2];g[b+152>>2]=u;v=+g[i+128>>2];g[b+156>>2]=v;i=c[d+24>>2]|0;w=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;x=+g[n>>2];y=+g[n+4>>2];z=+g[m+(f*12&-1)+8>>2];A=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;B=+g[i>>2];C=+g[i+4>>2];D=+g[m+(j*12&-1)+8>>2];E=+S(+w);F=+R(+w);w=+S(+A);G=+R(+A);A=+g[b+68>>2]-(c[k>>2]=o,+g[k>>2]);H=+g[b+72>>2]-(c[k>>2]=p,+g[k>>2]);I=F*A-E*H;J=E*A+F*H;p=b+112|0;H=+J;g[p>>2]=I;g[p+4>>2]=H;H=+g[b+76>>2]-(c[k>>2]=q,+g[k>>2]);F=+g[b+80>>2]-(c[k>>2]=r,+g[k>>2]);A=G*H-w*F;E=w*H+G*F;r=b+120|0;F=+E;g[r>>2]=A;g[r+4>>2]=F;F=s+t;G=F+J*u*J+E*v*E;H=v*A;w=J*I*(-0.0-u)-E*H;K=F+I*u*I+A*H;H=G*K-w*w;if(H!=0.0){L=1.0/H}else{L=H}H=w*(-0.0-L);g[b+160>>2]=K*L;g[b+164>>2]=H;g[b+168>>2]=H;g[b+172>>2]=G*L;L=u+v;if(L>0.0){M=1.0/L}else{M=L}g[b+176>>2]=M;r=b+84|0;if((a[d+20|0]&1)==0){g[r>>2]=0.0;g[b+88>>2]=0.0;g[b+92>>2]=0.0;N=z;O=D;P=B;Q=C;T=x;U=y}else{q=d+8|0;M=+g[q>>2];d=r|0;L=M*+g[d>>2];g[d>>2]=L;d=b+88|0;G=M*+g[d>>2];g[d>>2]=G;d=b+92|0;M=+g[q>>2]*+g[d>>2];g[d>>2]=M;N=z-u*(M+(G*I-L*J));O=D+v*(M+(G*A-L*E));P=B+t*L;Q=C+t*G;T=x-s*L;U=y-s*G}d=(c[e>>2]|0)+(f*12&-1)|0;G=+U;g[d>>2]=T;g[d+4>>2]=G;g[(c[e>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=N;h=(c[e>>2]|0)+((c[l>>2]|0)*12&-1)|0;N=+Q;g[h>>2]=P;g[h+4>>2]=N;g[(c[e>>2]|0)+((c[l>>2]|0)*12&-1)+8>>2]=O;return}function e3(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0;d=a+104|0;e=c[d>>2]|0;f=b+28|0;h=c[f>>2]|0;i=h+(e*12&-1)|0;j=+g[i>>2];k=+g[i+4>>2];l=+g[h+(e*12&-1)+8>>2];i=a+108|0;m=c[i>>2]|0;n=h+(m*12&-1)|0;o=+g[n>>2];p=+g[n+4>>2];q=+g[h+(m*12&-1)+8>>2];r=+g[a+144>>2];s=+g[a+148>>2];t=+g[a+152>>2];u=+g[a+156>>2];v=+g[b>>2];b=a+92|0;w=+g[b>>2];x=v*+g[a+100>>2];y=w+(q-l)*(-0.0- +g[a+176>>2]);z=-0.0-x;A=y<x?y:x;x=A<z?z:A;g[b>>2]=x;A=x-w;w=l-t*A;l=q+u*A;A=+g[a+124>>2];q=+g[a+120>>2];x=+g[a+116>>2];z=+g[a+112>>2];y=o+A*(-0.0-l)-j-x*(-0.0-w);B=p+q*l-k-z*w;C=+g[a+172>>2]*B+ +g[a+164>>2]*y;b=a+84|0;m=b;D=+g[m>>2];E=+g[m+4>>2];m=b|0;F=D-(+g[a+168>>2]*B+ +g[a+160>>2]*y);g[m>>2]=F;b=a+88|0;y=+g[b>>2]-C;g[b>>2]=y;C=v*+g[a+96>>2];v=F*F+y*y;if(v>C*C){B=+P(+v);if(B<1.1920928955078125e-7){G=F;H=y}else{v=1.0/B;B=F*v;g[m>>2]=B;I=y*v;g[b>>2]=I;G=B;H=I}I=C*G;g[m>>2]=I;G=C*H;g[b>>2]=G;J=I;K=G}else{J=F;K=y}y=J-D;D=K-E;b=(c[f>>2]|0)+(e*12&-1)|0;E=+(k-r*D);g[b>>2]=j-r*y;g[b+4>>2]=E;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=w-t*(z*D-y*x);d=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;x=+(p+s*D);g[d>>2]=o+s*y;g[d+4>>2]=x;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=l+u*(D*q-y*A);return}function e4(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;db(7056,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(11336,(u=i,i=i+8|0,c[u>>2]=e,u)|0);db(8808,(u=i,i=i+8|0,c[u>>2]=f,u)|0);db(6768,(u=i,i=i+8|0,c[u>>2]=a[b+61|0]&1,u)|0);j=+g[b+72>>2];db(5992,(u=i,i=i+16|0,h[u>>3]=+g[b+68>>2],h[u+8>>3]=j,u)|0);j=+g[b+80>>2];db(5536,(u=i,i=i+16|0,h[u>>3]=+g[b+76>>2],h[u+8>>3]=j,u)|0);db(4328,(u=i,i=i+8|0,h[u>>3]=+g[b+96>>2],u)|0);db(12832,(u=i,i=i+8|0,h[u>>3]=+g[b+100>>2],u)|0);db(11904,(u=i,i=i+8|0,c[u>>2]=c[b+56>>2],u)|0);i=d;return}function e5(a){a=a|0;vl(a);return}function e6(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0,K=0.0,L=0,M=0.0,N=0.0,O=0,P=0;e=b|0;c[e>>2]=19312;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){bc(7272,173,15744,9072)}c[b+4>>2]=c[d>>2];c[b+8>>2]=0;c[b+12>>2]=0;i=b+48|0;c[i>>2]=c[f>>2];f=b+52|0;c[f>>2]=c[h>>2];c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2];vq(b+16|0,0,32);c[e>>2]=20456;e=b+92|0;h=b+100|0;j=b+108|0;l=b+116|0;m=b+124|0;n=b+132|0;o=d+20|0;p=c[o>>2]|0;c[b+68>>2]=p;q=d+24|0;r=c[q>>2]|0;c[b+72>>2]=r;s=c[p+4>>2]|0;c[b+76>>2]=s;t=c[r+4>>2]|0;c[b+80>>2]=t;if((s-1|0)>>>0>=2){bc(7384,53,18560,11640)}if((t-1|0)>>>0>=2){bc(7384,54,18560,9168)}u=c[p+48>>2]|0;c[b+84>>2]=u;v=c[p+52>>2]|0;c[i>>2]=v;w=+g[v+20>>2];x=+g[v+24>>2];y=+g[u+20>>2];z=+g[u+24>>2];i=c[o>>2]|0;if((s|0)==1){A=+g[v+56>>2];B=+g[u+56>>2];s=i+68|0;o=j;p=c[s+4>>2]|0;c[o>>2]=c[s>>2];c[o+4>>2]=p;p=i+76|0;o=e;s=c[p+4>>2]|0;c[o>>2]=c[p>>2];c[o+4>>2]=s;C=+g[i+116>>2];g[b+140>>2]=C;g[m>>2]=0.0;g[b+128>>2]=0.0;D=A-B-C}else{C=+g[u+16>>2];B=+g[u+12>>2];A=+g[v+16>>2];E=+g[v+12>>2];v=i+68|0;u=j;j=c[v>>2]|0;s=c[v+4>>2]|0;c[u>>2]=j;c[u+4>>2]=s;u=i+76|0;v=e;e=c[u>>2]|0;o=c[u+4>>2]|0;c[v>>2]=e;c[v+4>>2]=o;g[b+140>>2]=+g[i+100>>2];v=i+84|0;i=m;m=c[v>>2]|0;u=c[v+4>>2]|0;c[i>>2]=m;c[i+4>>2]=u;F=(c[k>>2]=e,+g[k>>2]);G=(c[k>>2]=o,+g[k>>2]);H=E-B+(x*F-w*G);B=A-C+(w*F+x*G);D=(c[k>>2]=m,+g[k>>2])*(z*H+y*B-(c[k>>2]=j,+g[k>>2]))+(c[k>>2]=u,+g[k>>2])*(H*(-0.0-y)+z*B-(c[k>>2]=s,+g[k>>2]))}s=c[r+48>>2]|0;c[b+88>>2]=s;u=c[r+52>>2]|0;c[f>>2]=u;B=+g[u+20>>2];z=+g[u+24>>2];y=+g[s+20>>2];H=+g[s+24>>2];f=c[q>>2]|0;if((t|0)==1){G=+g[u+56>>2];x=+g[s+56>>2];t=f+68|0;q=l;r=c[t+4>>2]|0;c[q>>2]=c[t>>2];c[q+4>>2]=r;r=f+76|0;q=h;t=c[r+4>>2]|0;c[q>>2]=c[r>>2];c[q+4>>2]=t;F=+g[f+116>>2];g[b+144>>2]=F;g[n>>2]=0.0;g[b+136>>2]=0.0;I=G-x-F;J=d+28|0;K=+g[J>>2];L=b+152|0;g[L>>2]=K;M=I*K;N=D+M;O=b+148|0;g[O>>2]=N;P=b+156|0;g[P>>2]=0.0;return}else{F=+g[s+16>>2];x=+g[s+12>>2];G=+g[u+16>>2];w=+g[u+12>>2];u=f+68|0;s=l;l=c[u>>2]|0;t=c[u+4>>2]|0;c[s>>2]=l;c[s+4>>2]=t;s=f+76|0;u=h;h=c[s>>2]|0;q=c[s+4>>2]|0;c[u>>2]=h;c[u+4>>2]=q;g[b+144>>2]=+g[f+100>>2];u=f+84|0;f=n;n=c[u>>2]|0;s=c[u+4>>2]|0;c[f>>2]=n;c[f+4>>2]=s;C=(c[k>>2]=h,+g[k>>2]);A=(c[k>>2]=q,+g[k>>2]);E=w-x+(z*C-B*A);x=G-F+(B*C+z*A);I=(c[k>>2]=n,+g[k>>2])*(H*E+y*x-(c[k>>2]=l,+g[k>>2]))+(c[k>>2]=s,+g[k>>2])*(E*(-0.0-y)+H*x-(c[k>>2]=t,+g[k>>2]));J=d+28|0;K=+g[J>>2];L=b+152|0;g[L>>2]=K;M=I*K;N=D+M;O=b+148|0;g[O>>2]=N;P=b+156|0;g[P>>2]=0.0;return}}function e7(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,k=0.0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0,r=0.0,s=0.0,t=0.0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0;d=a+160|0;e=c[d>>2]|0;f=b+28|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=+g[h>>2];j=+g[h+4>>2];k=+g[b+(e*12&-1)+8>>2];h=a+164|0;l=c[h>>2]|0;m=b+(l*12&-1)|0;n=+g[m>>2];o=+g[m+4>>2];p=+g[b+(l*12&-1)+8>>2];l=a+168|0;m=c[l>>2]|0;q=b+(m*12&-1)|0;r=+g[q>>2];s=+g[q+4>>2];t=+g[b+(m*12&-1)+8>>2];m=a+172|0;q=c[m>>2]|0;u=b+(q*12&-1)|0;v=+g[u>>2];w=+g[u+4>>2];x=+g[b+(q*12&-1)+8>>2];y=+g[a+240>>2];z=+g[a+244>>2];A=+g[a+248>>2];B=+g[a+252>>2];C=+g[a+256>>2];D=+g[a+264>>2];E=+g[a+260>>2];F=+g[a+268>>2];G=((i-r)*y+(j-s)*z+((n-v)*A+(o-w)*B)+(k*C-t*D+(p*E-x*F)))*(-0.0- +g[a+272>>2]);q=a+156|0;g[q>>2]=+g[q>>2]+G;H=+g[a+208>>2]*G;I=k+G*+g[a+224>>2]*C;C=G*+g[a+212>>2];k=p+G*+g[a+228>>2]*E;E=G*+g[a+216>>2];p=t-G*+g[a+232>>2]*D;D=G*+g[a+220>>2];t=x-G*+g[a+236>>2]*F;a=(c[f>>2]|0)+(e*12&-1)|0;F=+(j+z*H);g[a>>2]=i+y*H;g[a+4>>2]=F;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=I;d=(c[f>>2]|0)+((c[h>>2]|0)*12&-1)|0;I=+(o+C*B);g[d>>2]=n+A*C;g[d+4>>2]=I;g[(c[f>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=k;h=(c[f>>2]|0)+((c[l>>2]|0)*12&-1)|0;k=+(s-z*E);g[h>>2]=r-y*E;g[h+4>>2]=k;g[(c[f>>2]|0)+((c[l>>2]|0)*12&-1)+8>>2]=p;l=(c[f>>2]|0)+((c[m>>2]|0)*12&-1)|0;p=+(w-B*D);g[l>>2]=v-A*D;g[l+4>>2]=p;g[(c[f>>2]|0)+((c[m>>2]|0)*12&-1)+8>>2]=t;return}function e8(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0.0,ao=0.0,ap=0.0,aq=0.0,ar=0.0,as=0.0,at=0.0,au=0.0,av=0.0,aw=0.0,ax=0.0,ay=0.0,az=0.0,aA=0.0,aB=0.0,aC=0.0,aD=0.0,aE=0.0,aF=0.0,aG=0.0,aH=0.0,aI=0.0,aJ=0.0,aK=0.0,aL=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+160|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+164|0;c[l>>2]=j;m=c[b+84>>2]|0;n=c[m+8>>2]|0;o=b+168|0;c[o>>2]=n;p=c[b+88>>2]|0;q=c[p+8>>2]|0;r=b+172|0;c[r>>2]=q;s=e+28|0;t=b+176|0;u=c[s>>2]|0;v=c[s+4>>2]|0;c[t>>2]=u;c[t+4>>2]=v;t=i+28|0;s=b+184|0;w=c[t>>2]|0;x=c[t+4>>2]|0;c[s>>2]=w;c[s+4>>2]=x;s=m+28|0;t=b+192|0;y=c[s>>2]|0;z=c[s+4>>2]|0;c[t>>2]=y;c[t+4>>2]=z;t=p+28|0;s=b+200|0;A=c[t>>2]|0;B=c[t+4>>2]|0;c[s>>2]=A;c[s+4>>2]=B;C=+g[e+120>>2];g[b+208>>2]=C;D=+g[i+120>>2];g[b+212>>2]=D;E=+g[m+120>>2];g[b+216>>2]=E;F=+g[p+120>>2];g[b+220>>2]=F;G=+g[e+128>>2];g[b+224>>2]=G;H=+g[i+128>>2];g[b+228>>2]=H;I=+g[m+128>>2];g[b+232>>2]=I;J=+g[p+128>>2];g[b+236>>2]=J;p=c[d+24>>2]|0;K=+g[p+(f*12&-1)+8>>2];m=d+28|0;i=c[m>>2]|0;e=i+(f*12&-1)|0;L=+g[e>>2];M=+g[e+4>>2];N=+g[i+(f*12&-1)+8>>2];O=+g[p+(j*12&-1)+8>>2];e=i+(j*12&-1)|0;P=+g[e>>2];Q=+g[e+4>>2];T=+g[i+(j*12&-1)+8>>2];U=+g[p+(n*12&-1)+8>>2];j=i+(n*12&-1)|0;V=+g[j>>2];W=+g[j+4>>2];X=+g[i+(n*12&-1)+8>>2];Y=+g[p+(q*12&-1)+8>>2];p=i+(q*12&-1)|0;Z=+g[p>>2];_=+g[p+4>>2];$=+g[i+(q*12&-1)+8>>2];aa=+S(+K);ab=+R(+K);K=+S(+O);ac=+R(+O);O=+S(+U);ad=+R(+U);U=+S(+Y);ae=+R(+Y);q=b+272|0;g[q>>2]=0.0;Y=(c[k>>2]=A,+g[k>>2]);af=(c[k>>2]=B,+g[k>>2]);ag=(c[k>>2]=w,+g[k>>2]);ah=(c[k>>2]=x,+g[k>>2]);if((c[b+76>>2]|0)==1){g[b+240>>2]=0.0;g[b+244>>2]=0.0;g[b+256>>2]=1.0;g[b+264>>2]=1.0;ai=G+I;aj=0.0;ak=0.0;al=1.0;am=1.0}else{an=+g[b+124>>2];ao=+g[b+128>>2];ap=ad*an-O*ao;aq=O*an+ad*ao;ao=+g[b+108>>2]-(c[k>>2]=y,+g[k>>2]);an=+g[b+112>>2]-(c[k>>2]=z,+g[k>>2]);ar=+g[b+92>>2]-(c[k>>2]=u,+g[k>>2]);as=+g[b+96>>2]-(c[k>>2]=v,+g[k>>2]);v=b+240|0;at=+aq;g[v>>2]=ap;g[v+4>>2]=at;at=aq*(ad*ao-O*an)-ap*(O*ao+ad*an);g[b+264>>2]=at;an=aq*(ab*ar-aa*as)-ap*(aa*ar+ab*as);g[b+256>>2]=an;ai=E+C+at*I*at+an*G*an;aj=ap;ak=aq;al=an;am=at}at=ai+0.0;g[q>>2]=at;if((c[b+80>>2]|0)==1){g[b+248>>2]=0.0;g[b+252>>2]=0.0;ai=+g[b+152>>2];g[b+260>>2]=ai;g[b+268>>2]=ai;au=ai*ai*(H+J);av=0.0;aw=0.0;ax=ai;ay=ai}else{ai=+g[b+132>>2];an=+g[b+136>>2];aq=ae*ai-U*an;ap=U*ai+ae*an;an=+g[b+116>>2]-Y;Y=+g[b+120>>2]-af;af=+g[b+100>>2]-ag;ag=+g[b+104>>2]-ah;ah=+g[b+152>>2];ai=aq*ah;as=ap*ah;v=b+248|0;ab=+as;g[v>>2]=ai;g[v+4>>2]=ab;ab=(ap*(ae*an-U*Y)-aq*(U*an+ae*Y))*ah;g[b+268>>2]=ab;Y=ah*(ap*(ac*af-K*ag)-aq*(K*af+ac*ag));g[b+260>>2]=Y;au=ah*ah*(F+D)+ab*J*ab+Y*Y*H;av=ai;aw=as;ax=Y;ay=ab}ab=at+au;g[q>>2]=ab;if(ab>0.0){az=1.0/ab}else{az=0.0}g[q>>2]=az;q=b+156|0;if((a[d+20|0]&1)==0){g[q>>2]=0.0;aA=$;aB=N;aC=X;aD=T;aE=Z;aF=_;aG=V;aH=W;aI=P;aJ=Q;aK=L;aL=M}else{az=+g[q>>2];ab=C*az;C=az*D;D=az*E;E=az*F;aA=$-az*J*ay;aB=N+az*G*al;aC=X-az*I*am;aD=T+az*H*ax;aE=Z-av*E;aF=_-aw*E;aG=V-aj*D;aH=W-ak*D;aI=P+av*C;aJ=Q+C*aw;aK=L+aj*ab;aL=M+ab*ak}q=(c[m>>2]|0)+(f*12&-1)|0;ak=+aL;g[q>>2]=aK;g[q+4>>2]=ak;g[(c[m>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=aB;h=(c[m>>2]|0)+((c[l>>2]|0)*12&-1)|0;aB=+aJ;g[h>>2]=aI;g[h+4>>2]=aB;g[(c[m>>2]|0)+((c[l>>2]|0)*12&-1)+8>>2]=aD;l=(c[m>>2]|0)+((c[o>>2]|0)*12&-1)|0;aD=+aH;g[l>>2]=aG;g[l+4>>2]=aD;g[(c[m>>2]|0)+((c[o>>2]|0)*12&-1)+8>>2]=aC;o=(c[m>>2]|0)+((c[r>>2]|0)*12&-1)|0;aC=+aF;g[o>>2]=aE;g[o+4>>2]=aC;g[(c[m>>2]|0)+((c[r>>2]|0)*12&-1)+8>>2]=aA;return}function e9(a){a=a|0;return}function fa(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+92>>2];h=+g[d+20>>2];i=+g[b+96>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fb(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+100>>2];h=+g[d+20>>2];i=+g[b+104>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fc(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0;d=+g[b+156>>2];e=d*+g[b+244>>2]*c;g[a>>2]=d*+g[b+240>>2]*c;g[a+4>>2]=e;return}function fd(a,b){a=a|0;b=+b;return+(+g[a+156>>2]*+g[a+256>>2]*b)}function fe(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,k=0.0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0,r=0.0,s=0.0,t=0.0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0;d=a+160|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=+g[h>>2];j=+g[h+4>>2];k=+g[b+(e*12&-1)+8>>2];e=a+164|0;l=c[e>>2]|0;m=b+(l*12&-1)|0;n=+g[m>>2];o=+g[m+4>>2];p=+g[b+(l*12&-1)+8>>2];l=a+168|0;m=c[l>>2]|0;q=b+(m*12&-1)|0;r=+g[q>>2];s=+g[q+4>>2];t=+g[b+(m*12&-1)+8>>2];m=a+172|0;q=c[m>>2]|0;u=b+(q*12&-1)|0;v=+g[u>>2];w=+g[u+4>>2];x=+g[b+(q*12&-1)+8>>2];y=+S(+k);z=+R(+k);A=+S(+p);B=+R(+p);C=+S(+t);D=+R(+t);E=+S(+x);F=+R(+x);if((c[a+76>>2]|0)==1){G=+g[a+224>>2];H=+g[a+232>>2];I=G+H;J=1.0;K=1.0;L=k-t- +g[a+140>>2];M=0.0;N=0.0;O=G;P=H}else{H=+g[a+124>>2];G=+g[a+128>>2];Q=D*H-C*G;T=C*H+D*G;U=+g[a+108>>2]- +g[a+192>>2];V=+g[a+112>>2]- +g[a+196>>2];W=+g[a+92>>2]- +g[a+176>>2];X=+g[a+96>>2]- +g[a+180>>2];Y=z*W-y*X;Z=y*W+z*X;X=T*(D*U-C*V)-Q*(C*U+D*V);z=T*Y-Q*Z;W=+g[a+232>>2];y=+g[a+224>>2];_=i-r+Y;Y=j-s+Z;I=+g[a+216>>2]+ +g[a+208>>2]+X*X*W+z*y*z;J=X;K=z;L=H*(D*_+C*Y-U)+G*(_*(-0.0-C)+D*Y-V);M=Q;N=T;O=y;P=W}if((c[a+80>>2]|0)==1){W=+g[a+152>>2];y=+g[a+228>>2];T=+g[a+236>>2];$=W*W*(y+T);aa=W;ab=W;ac=p-x- +g[a+144>>2];ad=0.0;ae=0.0;af=W;ag=y;ah=T}else{T=+g[a+132>>2];y=+g[a+136>>2];W=F*T-E*y;Q=E*T+F*y;V=+g[a+116>>2]- +g[a+200>>2];Y=+g[a+120>>2]- +g[a+204>>2];D=+g[a+100>>2]- +g[a+184>>2];C=+g[a+104>>2]- +g[a+188>>2];_=B*D-A*C;G=A*D+B*C;C=+g[a+152>>2];B=C*(Q*(F*V-E*Y)-W*(E*V+F*Y));D=C*(Q*_-W*G);A=+g[a+236>>2];U=+g[a+228>>2];H=n-v+_;_=o-w+G;$=C*C*(+g[a+220>>2]+ +g[a+212>>2])+B*B*A+D*U*D;aa=B;ab=D;ac=T*(F*H+E*_-V)+y*(H*(-0.0-E)+F*_-Y);ad=W*C;ae=Q*C;af=C;ag=U;ah=A}A=I+0.0+$;if(A>0.0){ai=(-0.0-(L+ac*af- +g[a+148>>2]))/A}else{ai=0.0}A=ai*+g[a+208>>2];af=ai*+g[a+212>>2];ac=ai*+g[a+216>>2];L=ai*+g[a+220>>2];$=+(j+N*A);g[h>>2]=i+M*A;g[h+4>>2]=$;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=k+K*ai*O;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;O=+(o+ae*af);g[d>>2]=n+ad*af;g[d+4>>2]=O;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=p+ab*ai*ag;e=(c[f>>2]|0)+((c[l>>2]|0)*12&-1)|0;ag=+(s-N*ac);g[e>>2]=r-M*ac;g[e+4>>2]=ag;g[(c[f>>2]|0)+((c[l>>2]|0)*12&-1)+8>>2]=t-J*ai*P;l=(c[f>>2]|0)+((c[m>>2]|0)*12&-1)|0;P=+(w-ae*L);g[l>>2]=v-ad*L;g[l+4>>2]=P;g[(c[f>>2]|0)+((c[m>>2]|0)*12&-1)+8>>2]=x-aa*ai*ah;return 1}function ff(b){b=b|0;var d=0,e=0,f=0,j=0,k=0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;j=c[(c[b+68>>2]|0)+56>>2]|0;k=c[(c[b+72>>2]|0)+56>>2]|0;db(6104,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(11336,(u=i,i=i+8|0,c[u>>2]=e,u)|0);db(8808,(u=i,i=i+8|0,c[u>>2]=f,u)|0);db(6768,(u=i,i=i+8|0,c[u>>2]=a[b+61|0]&1,u)|0);db(4568,(u=i,i=i+8|0,c[u>>2]=j,u)|0);db(4296,(u=i,i=i+8|0,c[u>>2]=k,u)|0);db(11504,(u=i,i=i+8|0,h[u>>3]=+g[b+152>>2],u)|0);db(11904,(u=i,i=i+8|0,c[u>>2]=c[b+56>>2],u)|0);i=d;return}function fg(a){a=a|0;vl(a);return}function fh(a){a=a|0;return}function fi(a){a=a|0;a=i;db(6944,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);i=a;return}function fj(a){a=a|0;vl(a);return}function fk(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;e=b|0;f=c[e>>2]|0;if((f|0)==5){h=df(d,168)|0;if((h|0)==0){i=0}else{j=h;fv(j,b);i=j}k=i|0;return k|0}else if((f|0)==1){i=df(d,228)|0;do{if((i|0)==0){l=0}else{j=i;c[j>>2]=19312;h=b+8|0;m=b+12|0;if((c[h>>2]|0)==(c[m>>2]|0)){bc(7272,173,15744,9072);return 0}else{c[i+4>>2]=c[e>>2];c[i+8>>2]=0;c[i+12>>2]=0;c[i+48>>2]=c[h>>2];c[i+52>>2]=c[m>>2];c[i+56>>2]=0;a[i+61|0]=a[b+16|0]&1;a[i+60|0]=0;c[i+64>>2]=c[b+4>>2];vq(i+16|0,0,32);c[j>>2]=19768;j=b+20|0;m=i+68|0;h=c[j+4>>2]|0;c[m>>2]=c[j>>2];c[m+4>>2]=h;h=b+28|0;m=i+76|0;j=c[h+4>>2]|0;c[m>>2]=c[h>>2];c[m+4>>2]=j;g[i+116>>2]=+g[b+36>>2];vq(i+84|0,0,16);g[i+120>>2]=+g[b+44>>2];g[i+124>>2]=+g[b+48>>2];g[i+104>>2]=+g[b+60>>2];g[i+108>>2]=+g[b+56>>2];a[i+112|0]=a[b+40|0]&1;a[i+100|0]=a[b+52|0]&1;c[i+224>>2]=0;l=i;break}}}while(0);k=l|0;return k|0}else if((f|0)==4){l=df(d,196)|0;if((l|0)==0){n=0}else{i=l;fJ(i,b);n=i}k=n|0;return k|0}else if((f|0)==7){n=df(d,224)|0;if((n|0)==0){o=0}else{i=n;gn(i,b);o=i}k=o|0;return k|0}else if((f|0)==9){o=df(d,180)|0;do{if((o|0)==0){p=0}else{i=o;c[i>>2]=19312;n=b+8|0;l=b+12|0;if((c[n>>2]|0)==(c[l>>2]|0)){bc(7272,173,15744,9072);return 0}else{c[o+4>>2]=c[e>>2];c[o+8>>2]=0;c[o+12>>2]=0;c[o+48>>2]=c[n>>2];c[o+52>>2]=c[l>>2];c[o+56>>2]=0;a[o+61|0]=a[b+16|0]&1;a[o+60|0]=0;c[o+64>>2]=c[b+4>>2];vq(o+16|0,0,32);c[i>>2]=19856;i=b+20|0;l=o+68|0;n=c[i+4>>2]|0;c[l>>2]=c[i>>2];c[l+4>>2]=n;n=b+28|0;l=o+76|0;i=c[n+4>>2]|0;c[l>>2]=c[n>>2];c[l+4>>2]=i;g[o+84>>2]=0.0;g[o+88>>2]=0.0;g[o+92>>2]=0.0;g[o+96>>2]=+g[b+36>>2];g[o+100>>2]=+g[b+40>>2];p=o;break}}}while(0);k=p|0;return k|0}else if((f|0)==6){p=df(d,276)|0;if((p|0)==0){q=0}else{o=p;e6(o,b);q=o}k=q|0;return k|0}else if((f|0)==8){q=df(d,208)|0;do{if((q|0)==0){r=0}else{o=q;c[o>>2]=19312;p=b+8|0;i=b+12|0;if((c[p>>2]|0)==(c[i>>2]|0)){bc(7272,173,15744,9072);return 0}else{c[q+4>>2]=c[e>>2];c[q+8>>2]=0;c[q+12>>2]=0;c[q+48>>2]=c[p>>2];c[q+52>>2]=c[i>>2];c[q+56>>2]=0;a[q+61|0]=a[b+16|0]&1;a[q+60|0]=0;c[q+64>>2]=c[b+4>>2];vq(q+16|0,0,32);c[o>>2]=20344;o=b+20|0;i=q+80|0;p=c[o+4>>2]|0;c[i>>2]=c[o>>2];c[i+4>>2]=p;p=b+28|0;i=q+88|0;o=c[p+4>>2]|0;c[i>>2]=c[p>>2];c[i+4>>2]=o;g[q+96>>2]=+g[b+36>>2];g[q+68>>2]=+g[b+40>>2];g[q+72>>2]=+g[b+44>>2];g[q+104>>2]=0.0;g[q+108>>2]=0.0;g[q+112>>2]=0.0;r=q;break}}}while(0);k=r|0;return k|0}else if((f|0)==10){r=df(d,168)|0;do{if((r|0)==0){s=0}else{q=r;c[q>>2]=19312;o=b+8|0;i=b+12|0;if((c[o>>2]|0)==(c[i>>2]|0)){bc(7272,173,15744,9072);return 0}else{c[r+4>>2]=c[e>>2];c[r+8>>2]=0;c[r+12>>2]=0;c[r+48>>2]=c[o>>2];c[r+52>>2]=c[i>>2];c[r+56>>2]=0;a[r+61|0]=a[b+16|0]&1;a[r+60|0]=0;c[r+64>>2]=c[b+4>>2];vq(r+16|0,0,32);c[q>>2]=20400;q=b+20|0;i=r+68|0;o=c[q+4>>2]|0;c[i>>2]=c[q>>2];c[i+4>>2]=o;o=b+28|0;i=r+76|0;q=c[o+4>>2]|0;c[i>>2]=c[o>>2];c[i+4>>2]=q;g[r+84>>2]=+g[b+36>>2];g[r+160>>2]=0.0;g[r+92>>2]=0.0;c[r+164>>2]=0;g[r+88>>2]=0.0;s=r;break}}}while(0);k=s|0;return k|0}else if((f|0)==2){s=df(d,256)|0;if((s|0)==0){t=0}else{r=s;fx(r,b);t=r}k=t|0;return k|0}else if((f|0)==3){f=df(d,176)|0;do{if((f|0)==0){u=0}else{d=f;c[d>>2]=19312;t=b+8|0;r=b+12|0;if((c[t>>2]|0)==(c[r>>2]|0)){bc(7272,173,15744,9072);return 0}else{c[f+4>>2]=c[e>>2];c[f+8>>2]=0;c[f+12>>2]=0;c[f+48>>2]=c[t>>2];c[f+52>>2]=c[r>>2];c[f+56>>2]=0;a[f+61|0]=a[b+16|0]&1;a[f+60|0]=0;c[f+64>>2]=c[b+4>>2];vq(f+16|0,0,32);c[d>>2]=19912;d=b+20|0;r=f+80|0;t=c[d+4>>2]|0;c[r>>2]=c[d>>2];c[r+4>>2]=t;t=b+28|0;r=f+88|0;d=c[t+4>>2]|0;c[r>>2]=c[t>>2];c[r+4>>2]=d;g[f+104>>2]=+g[b+36>>2];g[f+68>>2]=+g[b+40>>2];g[f+72>>2]=+g[b+44>>2];g[f+100>>2]=0.0;g[f+96>>2]=0.0;g[f+76>>2]=0.0;u=f;break}}}while(0);k=u|0;return k|0}else{bc(7272,113,15848,11592);return 0}return 0}function fl(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;bq[c[(c[b>>2]|0)+20>>2]&511](b);e=c[b+4>>2]|0;if((e|0)==9){f=a[22244]|0;if((f&255)>=14){bc(5352,173,17448,6544)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2];c[g>>2]=b;return}else if((e|0)==3){g=a[22240]|0;if((g&255)>=14){bc(5352,173,17448,6544)}f=d+12+((g&255)<<2)|0;c[b>>2]=c[f>>2];c[f>>2]=b;return}else if((e|0)==4){f=a[22260]|0;if((f&255)>=14){bc(5352,173,17448,6544)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2];c[g>>2]=b;return}else if((e|0)==7){g=a[22288]|0;if((g&255)>=14){bc(5352,173,17448,6544)}f=d+12+((g&255)<<2)|0;c[b>>2]=c[f>>2];c[f>>2]=b;return}else if((e|0)==10){f=a[22232]|0;if((f&255)>=14){bc(5352,173,17448,6544)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2];c[g>>2]=b;return}else if((e|0)==6){g=a[22340]|0;if((g&255)>=14){bc(5352,173,17448,6544)}f=d+12+((g&255)<<2)|0;c[b>>2]=c[f>>2];c[f>>2]=b;return}else if((e|0)==2){f=a[22320]|0;if((f&255)>=14){bc(5352,173,17448,6544)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2];c[g>>2]=b;return}else if((e|0)==5){g=a[22232]|0;if((g&255)>=14){bc(5352,173,17448,6544)}f=d+12+((g&255)<<2)|0;c[b>>2]=c[f>>2];c[f>>2]=b;return}else if((e|0)==8){f=a[22272]|0;if((f&255)>=14){bc(5352,173,17448,6544)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2];c[g>>2]=b;return}else if((e|0)==1){e=a[22292]|0;if((e&255)>=14){bc(5352,173,17448,6544)}g=d+12+((e&255)<<2)|0;c[b>>2]=c[g>>2];c[g>>2]=b;return}else{bc(7272,166,15784,11592)}}function fm(a,b){a=a|0;b=b|0;return 1}function fn(a){a=a|0;return}function fo(a,b){a=a|0;b=+b;return+(b*0.0)}function fp(a,b){a=a|0;b=b|0;var d=0;d=b+76|0;b=a;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function fq(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fr(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+100>>2]*c;g[a>>2]=+g[b+96>>2]*c;g[a+4>>2]=d;return}function fs(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0.0,s=0.0,t=0.0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0;d=a+116|0;e=c[d>>2]|0;f=b+28|0;h=c[f>>2]|0;i=h+(e*12&-1)|0;j=+g[i>>2];k=+g[i+4>>2];l=+g[h+(e*12&-1)+8>>2];m=+g[a+124>>2];n=+g[a+120>>2];o=+g[a+108>>2];h=a+96|0;i=h|0;p=+g[i>>2];q=a+100|0;r=+g[q>>2];s=-0.0-(j+m*(-0.0-l)+ +g[a+160>>2]+o*p);t=-0.0-(k+l*n+ +g[a+164>>2]+o*r);o=+g[a+148>>2]*s+ +g[a+156>>2]*t;u=h;v=+g[u>>2];w=+g[u+4>>2];x=p+(+g[a+144>>2]*s+ +g[a+152>>2]*t);g[i>>2]=x;t=o+r;g[q>>2]=t;r=+g[b>>2]*+g[a+104>>2];o=t*t+x*x;if(o>r*r){s=r/+P(+o);o=x*s;g[i>>2]=o;r=s*t;g[q>>2]=r;y=o;z=r}else{y=x;z=t}t=y-v;v=z-w;w=+g[a+136>>2];z=l+ +g[a+140>>2]*(v*n-t*m);a=(c[f>>2]|0)+(e*12&-1)|0;m=+(k+v*w);g[a>>2]=j+t*w;g[a+4>>2]=m;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=z;return}function ft(a){a=a|0;a=i;db(5136,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);i=a;return}function fu(a){a=a|0;vl(a);return}function fv(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0.0,j=0,l=0,m=0,n=0,o=0.0,q=0.0,r=0.0,s=0.0;e=b|0;c[e>>2]=19312;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){bc(7272,173,15744,9072)}c[b+4>>2]=c[d>>2];c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[f>>2];f=c[h>>2]|0;c[b+52>>2]=f;c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2];vq(b+16|0,0,32);c[e>>2]=20240;e=d+20|0;i=+g[e>>2];if(!(i==i&!(C=0.0,C!=C)&i>+-p&i<+p)){bc(7088,34,18312,11528)}i=+g[d+24>>2];if(!(i==i&!(C=0.0,C!=C)&i>+-p&i<+p)){bc(7088,34,18312,11528)}h=d+28|0;i=+g[h>>2];if(i<0.0|i==i&!(C=0.0,C!=C)&i>+-p&i<+p^1){bc(7088,35,18312,9016)}j=d+32|0;i=+g[j>>2];if(i<0.0|i==i&!(C=0.0,C!=C)&i>+-p&i<+p^1){bc(7088,36,18312,6888)}l=d+36|0;i=+g[l>>2];if(i<0.0|i==i&!(C=0.0,C!=C)&i>+-p&i<+p^1){bc(7088,37,18312,6040)}else{d=e;e=b+76|0;m=c[d>>2]|0;n=c[d+4>>2]|0;c[e>>2]=m;c[e+4>>2]=n;i=(c[k>>2]=m,+g[k>>2])- +g[f+12>>2];o=(c[k>>2]=n,+g[k>>2])- +g[f+16>>2];q=+g[f+24>>2];r=+g[f+20>>2];f=b+68|0;s=+(q*o+i*(-0.0-r));g[f>>2]=i*q+o*r;g[f+4>>2]=s;g[b+104>>2]=+g[h>>2];g[b+96>>2]=0.0;g[b+100>>2]=0.0;g[b+84>>2]=+g[j>>2];g[b+88>>2]=+g[l>>2];g[b+92>>2]=0.0;g[b+108>>2]=0.0;return}}function fw(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0;e=c[b+52>>2]|0;f=c[e+8>>2]|0;h=b+116|0;c[h>>2]=f;i=e+28|0;j=b+128|0;l=c[i>>2]|0;m=c[i+4>>2]|0;c[j>>2]=l;c[j+4>>2]=m;n=+g[e+120>>2];g[b+136>>2]=n;o=+g[e+128>>2];g[b+140>>2]=o;j=c[d+24>>2]|0;i=j+(f*12&-1)|0;p=+g[i>>2];q=+g[i+4>>2];r=+g[j+(f*12&-1)+8>>2];j=d+28|0;i=c[j>>2]|0;s=i+(f*12&-1)|0;t=+g[s>>2];u=+g[s+4>>2];v=+g[i+(f*12&-1)+8>>2];w=+S(+r);x=+R(+r);r=+g[e+116>>2];y=+g[b+84>>2]*6.2831854820251465;z=+g[d>>2];A=z*r*y*y;B=y*r*2.0*+g[b+88>>2]+A;r=(c[k>>2]=l,+g[k>>2]);y=(c[k>>2]=m,+g[k>>2]);if(B<=1.1920928955078125e-7){bc(7088,125,18368,5608)}C=z*B;if(C!=0.0){D=1.0/C}else{D=C}g[b+108>>2]=D;C=A*D;g[b+92>>2]=C;A=+g[b+68>>2]-r;r=+g[b+72>>2]-y;y=x*A-w*r;B=w*A+x*r;m=b+120|0;r=+B;g[m>>2]=y;g[m+4>>2]=r;r=D+(n+B*o*B);x=B*y*(-0.0-o);A=D+(n+y*o*y);D=r*A-x*x;if(D!=0.0){E=1.0/D}else{E=D}D=x*(-0.0-E);g[b+144>>2]=A*E;g[b+148>>2]=D;g[b+152>>2]=D;g[b+156>>2]=r*E;m=b+160|0;E=p+y- +g[b+76>>2];p=q+B- +g[b+80>>2];l=m;q=+p;g[l>>2]=E;g[l+4>>2]=q;g[m>>2]=C*E;g[b+164>>2]=C*p;p=v*.9800000190734863;m=b+96|0;if((a[d+20|0]&1)==0){g[m>>2]=0.0;g[b+100>>2]=0.0;F=p;G=t;H=u;I=c[j>>2]|0;J=I+(f*12&-1)|0;K=J;L=(g[k>>2]=G,c[k>>2]|0);M=(g[k>>2]=H,c[k>>2]|0);N=M;O=0;P=0;Q=N;T=L;U=0;V=P|T;W=Q|U;X=K|0;c[X>>2]=V;Y=K+4|0;c[Y>>2]=W;Z=c[h>>2]|0;_=c[j>>2]|0;$=_+(Z*12&-1)+8|0;g[$>>2]=F;return}else{v=+g[d+8>>2];d=m|0;C=v*+g[d>>2];g[d>>2]=C;d=b+100|0;E=v*+g[d>>2];g[d>>2]=E;F=p+o*(E*y-C*B);G=t+n*C;H=u+E*n;I=c[j>>2]|0;J=I+(f*12&-1)|0;K=J;L=(g[k>>2]=G,c[k>>2]|0);M=(g[k>>2]=H,c[k>>2]|0);N=M;O=0;P=0;Q=N;T=L;U=0;V=P|T;W=Q|U;X=K|0;c[X>>2]=V;Y=K+4|0;c[Y>>2]=W;Z=c[h>>2]|0;_=c[j>>2]|0;$=_+(Z*12&-1)+8|0;g[$>>2]=F;return}}function fx(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0;e=b|0;c[e>>2]=19312;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){bc(7272,173,15744,9072)}c[b+4>>2]=c[d>>2];c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[f>>2];c[b+52>>2]=c[h>>2];c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2];vq(b+16|0,0,32);c[e>>2]=19680;e=b+84|0;h=d+20|0;f=b+68|0;i=c[h+4>>2]|0;c[f>>2]=c[h>>2];c[f+4>>2]=i;i=d+28|0;f=b+76|0;h=c[i+4>>2]|0;c[f>>2]=c[i>>2];c[f+4>>2]=h;h=d+36|0;f=e;i=c[h>>2]|0;j=c[h+4>>2]|0;c[f>>2]=i;c[f+4>>2]=j;l=(c[k>>2]=i,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+P(+(l*l+m*m));if(n<1.1920928955078125e-7){o=m;p=l}else{q=1.0/n;n=l*q;g[e>>2]=n;l=m*q;g[b+88>>2]=l;o=l;p=n}e=b+92|0;n=+p;g[e>>2]=o*-1.0;g[e+4>>2]=n;g[b+100>>2]=+g[d+44>>2];g[b+252>>2]=0.0;vq(b+104|0,0,16);g[b+120>>2]=+g[d+52>>2];g[b+124>>2]=+g[d+56>>2];g[b+128>>2]=+g[d+64>>2];g[b+132>>2]=+g[d+68>>2];a[b+136|0]=a[d+48|0]&1;a[b+137|0]=a[d+60|0]&1;c[b+140>>2]=0;vq(b+184|0,0,16);return}function fy(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+144|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+148|0;c[l>>2]=j;m=e+28|0;n=b+152|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+160|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+168>>2]=s;t=+g[i+120>>2];g[b+172>>2]=t;u=+g[e+128>>2];g[b+176>>2]=u;v=+g[i+128>>2];g[b+180>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;w=+g[e>>2];x=+g[e+4>>2];y=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;z=+g[n>>2];A=+g[n+4>>2];B=+g[m+(f*12&-1)+8>>2];n=i+(j*12&-1)|0;C=+g[n>>2];D=+g[n+4>>2];E=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;F=+g[i>>2];G=+g[i+4>>2];H=+g[m+(j*12&-1)+8>>2];I=+S(+y);J=+R(+y);y=+S(+E);K=+R(+E);E=+g[b+68>>2]-(c[k>>2]=o,+g[k>>2]);L=+g[b+72>>2]-(c[k>>2]=p,+g[k>>2]);M=J*E-I*L;N=I*E+J*L;L=+g[b+76>>2]-(c[k>>2]=q,+g[k>>2]);E=+g[b+80>>2]-(c[k>>2]=r,+g[k>>2]);O=K*L-y*E;P=y*L+K*E;E=C-w+O-M;w=D-x+P-N;x=+g[b+84>>2];D=+g[b+88>>2];C=J*x-I*D;K=I*x+J*D;r=b+184|0;D=+K;g[r>>2]=C;g[r+4>>2]=D;D=M+E;M=N+w;N=D*K-M*C;g[b+208>>2]=N;x=O*K-P*C;g[b+212>>2]=x;L=s+t;y=u*N;Q=v*x;T=L+N*y+x*Q;if(T>0.0){U=1.0/T}else{U=T}g[b+252>>2]=U;U=+g[b+92>>2];V=+g[b+96>>2];W=J*U-I*V;X=I*U+J*V;r=b+192|0;V=+X;g[r>>2]=W;g[r+4>>2]=V;V=D*X-M*W;g[b+200>>2]=V;M=O*X-P*W;g[b+204>>2]=M;P=u*V;O=v*M;D=P+O;J=P*N+O*x;U=v+u;I=y+Q;g[b+216>>2]=L+V*P+M*O;g[b+220>>2]=D;g[b+224>>2]=J;g[b+228>>2]=D;g[b+232>>2]=U==0.0?1.0:U;g[b+236>>2]=I;g[b+240>>2]=J;g[b+244>>2]=I;g[b+248>>2]=T;do{if((a[b+136|0]&1)==0){c[b+140>>2]=0;g[b+112>>2]=0.0}else{T=E*C+w*K;I=+g[b+124>>2];J=+g[b+120>>2];U=I-J;if(U>0.0){Y=U}else{Y=-0.0-U}if(Y<.009999999776482582){c[b+140>>2]=3;break}if(T<=J){r=b+140|0;if((c[r>>2]|0)==1){break}c[r>>2]=1;g[b+112>>2]=0.0;break}r=b+140|0;if(T<I){c[r>>2]=0;g[b+112>>2]=0.0;break}if((c[r>>2]|0)==2){break}c[r>>2]=2;g[b+112>>2]=0.0}}while(0);if((a[b+137|0]&1)==0){g[b+116>>2]=0.0}r=b+104|0;if((a[d+20|0]&1)==0){vq(r|0,0,16);Z=B;_=H;$=F;aa=G;ab=z;ac=A;ad=c[e>>2]|0;ae=ad+(f*12&-1)|0;af=ae;ag=(g[k>>2]=ab,c[k>>2]|0);ah=(g[k>>2]=ac,c[k>>2]|0);ai=ah;aj=0;ak=0;al=ai;am=ag;an=0;ao=ak|am;ap=al|an;aq=af|0;c[aq>>2]=ao;ar=af+4|0;c[ar>>2]=ap;as=c[h>>2]|0;at=c[e>>2]|0;au=at+(as*12&-1)+8|0;g[au>>2]=Z;av=c[l>>2]|0;aw=c[e>>2]|0;ax=aw+(av*12&-1)|0;ay=ax;az=(g[k>>2]=$,c[k>>2]|0);aA=(g[k>>2]=aa,c[k>>2]|0);aB=aA;aC=0;aD=0;aE=aB;aF=az;aG=0;aH=aD|aF;aI=aE|aG;aJ=ay|0;c[aJ>>2]=aH;aK=ay+4|0;c[aK>>2]=aI;aL=c[l>>2]|0;aM=c[e>>2]|0;aN=aM+(aL*12&-1)+8|0;g[aN>>2]=_;return}else{q=d+8|0;Y=+g[q>>2];d=r|0;w=Y*+g[d>>2];g[d>>2]=w;d=b+108|0;E=Y*+g[d>>2];g[d>>2]=E;d=b+112|0;I=Y*+g[d>>2];g[d>>2]=I;d=b+116|0;Y=+g[q>>2]*+g[d>>2];g[d>>2]=Y;T=Y+I;I=w*W+C*T;C=w*X+T*K;Z=B-u*(w*V+E+T*N);_=H+v*(E+w*M+T*x);$=F+t*I;aa=G+t*C;ab=z-s*I;ac=A-s*C;ad=c[e>>2]|0;ae=ad+(f*12&-1)|0;af=ae;ag=(g[k>>2]=ab,c[k>>2]|0);ah=(g[k>>2]=ac,c[k>>2]|0);ai=ah;aj=0;ak=0;al=ai;am=ag;an=0;ao=ak|am;ap=al|an;aq=af|0;c[aq>>2]=ao;ar=af+4|0;c[ar>>2]=ap;as=c[h>>2]|0;at=c[e>>2]|0;au=at+(as*12&-1)+8|0;g[au>>2]=Z;av=c[l>>2]|0;aw=c[e>>2]|0;ax=aw+(av*12&-1)|0;ay=ax;az=(g[k>>2]=$,c[k>>2]|0);aA=(g[k>>2]=aa,c[k>>2]|0);aB=aA;aC=0;aD=0;aE=aB;aF=az;aG=0;aH=aD|aF;aI=aE|aG;aJ=ay|0;c[aJ>>2]=aH;aK=ay+4|0;c[aK>>2]=aI;aL=c[l>>2]|0;aM=c[e>>2]|0;aN=aM+(aL*12&-1)+8|0;g[aN>>2]=_;return}}function fz(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0,al=0.0;e=i;i=i+32|0;f=e|0;h=e+16|0;j=b+144|0;k=c[j>>2]|0;l=d+28|0;m=c[l>>2]|0;n=m+(k*12&-1)|0;o=+g[n>>2];p=+g[n+4>>2];q=+g[m+(k*12&-1)+8>>2];n=b+148|0;r=c[n>>2]|0;s=m+(r*12&-1)|0;t=+g[s>>2];u=+g[s+4>>2];v=+g[m+(r*12&-1)+8>>2];w=+g[b+168>>2];x=+g[b+172>>2];y=+g[b+176>>2];z=+g[b+180>>2];do{if((a[b+137|0]&1)==0){A=q;B=v;C=t;D=u;E=o;F=p}else{if((c[b+140>>2]|0)==3){A=q;B=v;C=t;D=u;E=o;F=p;break}G=+g[b+184>>2];H=+g[b+188>>2];I=+g[b+212>>2];J=+g[b+208>>2];r=b+116|0;K=+g[r>>2];L=+g[d>>2]*+g[b+128>>2];M=K+ +g[b+252>>2]*(+g[b+132>>2]-((t-o)*G+(u-p)*H+v*I-q*J));N=-0.0-L;O=M<L?M:L;L=O<N?N:O;g[r>>2]=L;O=L-K;K=G*O;G=H*O;A=q-y*J*O;B=v+z*I*O;C=t+x*K;D=u+x*G;E=o-w*K;F=p-w*G}}while(0);p=C-E;o=D-F;d=b+192|0;u=+g[d>>2];r=b+196|0;t=+g[r>>2];m=b+204|0;v=+g[m>>2];s=b+200|0;q=+g[s>>2];G=p*u+o*t+B*v-A*q;K=B-A;do{if((a[b+136|0]&1)==0){P=2813}else{Q=b+140|0;if((c[Q>>2]|0)==0){P=2813;break}R=b+184|0;S=b+188|0;T=b+212|0;U=b+208|0;V=b+104|0;O=+g[V>>2];W=b+108|0;I=+g[W>>2];X=b+112|0;J=+g[X>>2];Y=b+216|0;H=-0.0-G;L=-0.0-K;N=-0.0-(p*+g[R>>2]+o*+g[S>>2]+B*+g[T>>2]-A*+g[U>>2]);g[h>>2]=H;g[h+4>>2]=L;g[h+8>>2]=N;c8(f,Y,h);Z=f|0;g[V>>2]=+g[Z>>2]+ +g[V>>2];_=f+4|0;g[W>>2]=+g[_>>2]+ +g[W>>2];$=f+8|0;N=+g[$>>2]+ +g[X>>2];g[X>>2]=N;aa=c[Q>>2]|0;if((aa|0)==1){M=N>0.0?N:0.0;g[X>>2]=M;ab=M}else if((aa|0)==2){M=N<0.0?N:0.0;g[X>>2]=M;ab=M}else{ab=N}N=ab-J;J=H- +g[b+240>>2]*N;H=L-N*+g[b+244>>2];L=+g[Y>>2];M=+g[b+228>>2];ac=+g[b+220>>2];ad=+g[b+232>>2];ae=L*ad-M*ac;if(ae!=0.0){af=1.0/ae}else{af=ae}ae=O+(J*ad-M*H)*af;M=I+(L*H-J*ac)*af;g[V>>2]=ae;g[W>>2]=M;ac=ae-O;O=M-I;g[Z>>2]=ac;g[_>>2]=O;g[$>>2]=N;ag=O+ac*+g[m>>2]+N*+g[T>>2];ah=ac*+g[s>>2]+O+N*+g[U>>2];ai=ac*+g[r>>2]+N*+g[S>>2];aj=ac*+g[d>>2]+N*+g[R>>2];ak=c[j>>2]|0}}while(0);if((P|0)==2813){af=-0.0-G;G=-0.0-K;K=+g[b+216>>2];ab=+g[b+228>>2];o=+g[b+220>>2];p=+g[b+232>>2];N=K*p-ab*o;if(N!=0.0){al=1.0/N}else{al=N}N=(p*af-ab*G)*al;ab=(K*G-o*af)*al;P=b+104|0;g[P>>2]=+g[P>>2]+N;P=b+108|0;g[P>>2]=ab+ +g[P>>2];ag=ab+N*v;ah=ab+N*q;ai=N*t;aj=N*u;ak=k}k=(c[l>>2]|0)+(ak*12&-1)|0;u=+(F-w*ai);g[k>>2]=E-w*aj;g[k+4>>2]=u;g[(c[l>>2]|0)+((c[j>>2]|0)*12&-1)+8>>2]=A-y*ah;j=(c[l>>2]|0)+((c[n>>2]|0)*12&-1)|0;ah=+(D+x*ai);g[j>>2]=C+x*aj;g[j+4>>2]=ah;g[(c[l>>2]|0)+((c[n>>2]|0)*12&-1)+8>>2]=B+z*ag;i=e;return}function fA(a){a=a|0;return}function fB(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fC(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fD(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0,f=0.0;d=+g[b+104>>2];e=+g[b+116>>2]+ +g[b+112>>2];f=(d*+g[b+196>>2]+e*+g[b+188>>2])*c;g[a>>2]=(d*+g[b+192>>2]+ +g[b+184>>2]*e)*c;g[a+4>>2]=f;return}function fE(a,b){a=a|0;b=+b;return+(+g[a+108>>2]*b)}function fF(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0,P=0.0,Q=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0;e=b+144|0;f=c[e>>2]|0;h=d+24|0;d=c[h>>2]|0;i=d+(f*12&-1)|0;j=+g[i>>2];k=+g[i+4>>2];l=+g[d+(f*12&-1)+8>>2];f=b+148|0;m=c[f>>2]|0;n=d+(m*12&-1)|0;o=+g[n>>2];p=+g[n+4>>2];q=+g[d+(m*12&-1)+8>>2];r=+S(+l);s=+R(+l);t=+S(+q);u=+R(+q);v=+g[b+168>>2];w=+g[b+172>>2];x=+g[b+176>>2];y=+g[b+180>>2];z=+g[b+68>>2]- +g[b+152>>2];A=+g[b+72>>2]- +g[b+156>>2];B=s*z-r*A;C=r*z+s*A;A=+g[b+76>>2]- +g[b+160>>2];z=+g[b+80>>2]- +g[b+164>>2];D=u*A-t*z;E=t*A+u*z;z=o+D-j-B;u=p+E-k-C;A=+g[b+84>>2];t=+g[b+88>>2];F=s*A-r*t;G=r*A+s*t;t=B+z;B=C+u;C=G*t-F*B;A=D*G-E*F;H=+g[b+92>>2];I=+g[b+96>>2];J=s*H-r*I;K=r*H+s*I;I=K*t-J*B;B=D*K-E*J;E=J*z+K*u;D=q-l- +g[b+100>>2];if(E>0.0){L=E}else{L=-0.0-E}if(D>0.0){M=D}else{M=-0.0-D}do{if((a[b+136|0]&1)==0){N=L;O=0;P=0.0}else{t=F*z+G*u;s=+g[b+124>>2];H=+g[b+120>>2];r=s-H;if(r>0.0){Q=r}else{Q=-0.0-r}if(Q<.009999999776482582){r=t<.20000000298023224?t:.20000000298023224;if(t>0.0){T=t}else{T=-0.0-t}N=L>T?L:T;O=1;P=r<-.20000000298023224?-.20000000298023224:r;break}if(t<=H){r=t-H+.004999999888241291;U=r<0.0?r:0.0;r=H-t;N=L>r?L:r;O=1;P=U<-.20000000298023224?-.20000000298023224:U;break}if(t<s){N=L;O=0;P=0.0;break}U=t-s;s=U+-.004999999888241291;t=s<.20000000298023224?s:.20000000298023224;N=L>U?L:U;O=1;P=t<0.0?0.0:t}}while(0);L=v+w;T=x*I;Q=y*B;u=B*Q+(L+I*T);z=Q+T;if(O){t=A*Q+C*T;T=x+y;Q=T==0.0?1.0:T;T=x*C;U=y*A;s=U+T;r=A*U+(L+C*T);T=-0.0-E;L=-0.0-D;U=-0.0-P;P=Q*r-s*s;H=s*t-z*r;V=s*z-Q*t;W=t*V+(u*P+z*H);if(W!=0.0){X=1.0/W}else{X=W}W=s*T;Y=(P*T+H*L+V*U)*X;Z=(t*(W-t*L)+(u*(r*L-s*U)+z*(t*U-r*T)))*X;_=(t*(z*L-Q*T)+(u*(Q*U-s*L)+z*(W-z*U)))*X}else{X=x+y;U=X==0.0?1.0:X;X=-0.0-E;E=-0.0-D;D=U*u-z*z;if(D!=0.0){$=1.0/D}else{$=D}Y=(U*X-z*E)*$;Z=(u*E-z*X)*$;_=0.0}$=F*_+J*Y;J=G*_+K*Y;K=+(k-v*J);g[i>>2]=j-v*$;g[i+4>>2]=K;g[(c[h>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=l-x*(C*_+(Z+I*Y));e=(c[h>>2]|0)+((c[f>>2]|0)*12&-1)|0;I=+(p+w*J);g[e>>2]=o+w*$;g[e+4>>2]=I;g[(c[h>>2]|0)+((c[f>>2]|0)*12&-1)+8>>2]=q+y*(A*_+(Z+B*Y));if(N>.004999999888241291){aa=0;return aa|0}aa=M<=.03490658849477768;return aa|0}function fG(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;db(8984,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(11336,(u=i,i=i+8|0,c[u>>2]=e,u)|0);db(8808,(u=i,i=i+8|0,c[u>>2]=f,u)|0);db(6768,(u=i,i=i+8|0,c[u>>2]=a[b+61|0]&1,u)|0);j=+g[b+72>>2];db(5992,(u=i,i=i+16|0,h[u>>3]=+g[b+68>>2],h[u+8>>3]=j,u)|0);j=+g[b+80>>2];db(5536,(u=i,i=i+16|0,h[u>>3]=+g[b+76>>2],h[u+8>>3]=j,u)|0);j=+g[b+88>>2];db(5032,(u=i,i=i+16|0,h[u>>3]=+g[b+84>>2],h[u+8>>3]=j,u)|0);db(5072,(u=i,i=i+8|0,h[u>>3]=+g[b+100>>2],u)|0);db(4264,(u=i,i=i+8|0,c[u>>2]=a[b+136|0]&1,u)|0);db(12568,(u=i,i=i+8|0,h[u>>3]=+g[b+120>>2],u)|0);db(11984,(u=i,i=i+8|0,h[u>>3]=+g[b+124>>2],u)|0);db(4760,(u=i,i=i+8|0,c[u>>2]=a[b+137|0]&1,u)|0);db(4488,(u=i,i=i+8|0,h[u>>3]=+g[b+132>>2],u)|0);db(11064,(u=i,i=i+8|0,h[u>>3]=+g[b+128>>2],u)|0);db(11904,(u=i,i=i+8|0,c[u>>2]=c[b+56>>2],u)|0);i=d;return}function fH(a){a=a|0;vl(a);return}function fI(a,b,d,e,f,h,i,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;i=i|0;j=+j;var k=0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0;c[a+8>>2]=b;c[a+12>>2]=d;k=e;l=a+20|0;m=c[k+4>>2]|0;c[l>>2]=c[k>>2];c[l+4>>2]=m;m=f;l=a+28|0;k=c[m+4>>2]|0;c[l>>2]=c[m>>2];c[l+4>>2]=k;k=h|0;n=+g[k>>2]- +g[b+12>>2];l=h+4|0;o=+g[l>>2]- +g[b+16>>2];p=+g[b+24>>2];q=+g[b+20>>2];b=a+36|0;r=+(p*o+n*(-0.0-q));g[b>>2]=n*p+o*q;g[b+4>>2]=r;b=i|0;r=+g[b>>2]- +g[d+12>>2];h=i+4|0;q=+g[h>>2]- +g[d+16>>2];o=+g[d+24>>2];p=+g[d+20>>2];d=a+44|0;n=+(o*q+r*(-0.0-p));g[d>>2]=r*o+q*p;g[d+4>>2]=n;n=+g[k>>2]- +g[e>>2];p=+g[l>>2]- +g[e+4>>2];g[a+52>>2]=+P(+(n*n+p*p));p=+g[b>>2]- +g[f>>2];n=+g[h>>2]- +g[f+4>>2];g[a+56>>2]=+P(+(p*p+n*n));g[a+60>>2]=j;if(j>1.1920928955078125e-7){return}else{bc(6632,51,17120,11480)}}function fJ(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0.0;e=b|0;c[e>>2]=19312;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){bc(7272,173,15744,9072)}c[b+4>>2]=c[d>>2];c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[f>>2];c[b+52>>2]=c[h>>2];c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2];vq(b+16|0,0,32);c[e>>2]=20080;e=d+20|0;h=b+68|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2];c[h+4>>2]=f;f=d+28|0;h=b+76|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2];c[h+4>>2]=e;e=d+36|0;h=b+92|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2];c[h+4>>2]=f;f=d+44|0;h=b+100|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2];c[h+4>>2]=e;e=d+52|0;g[b+84>>2]=+g[e>>2];h=d+56|0;g[b+88>>2]=+g[h>>2];i=+g[d+60>>2];if(i!=0.0){g[b+112>>2]=i;g[b+108>>2]=+g[e>>2]+i*+g[h>>2];g[b+116>>2]=0.0;return}else{bc(6632,65,17984,8960)}}function fK(a,b){a=a|0;b=+b;return+0.0}function fL(a){a=a|0;return}function fM(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,k=0.0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0;d=a+120|0;e=c[d>>2]|0;f=b+28|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=+g[h>>2];j=+g[h+4>>2];k=+g[b+(e*12&-1)+8>>2];h=a+124|0;l=c[h>>2]|0;m=b+(l*12&-1)|0;n=+g[m>>2];o=+g[m+4>>2];p=+g[b+(l*12&-1)+8>>2];q=+g[a+148>>2];r=+g[a+144>>2];s=+g[a+156>>2];t=+g[a+152>>2];u=+g[a+128>>2];v=+g[a+132>>2];w=+g[a+112>>2];x=+g[a+136>>2];y=+g[a+140>>2];z=(-0.0-((i+q*(-0.0-k))*u+(j+k*r)*v)-w*((n+s*(-0.0-p))*x+(o+p*t)*y))*(-0.0- +g[a+192>>2]);l=a+116|0;g[l>>2]=+g[l>>2]+z;A=-0.0-z;B=u*A;u=v*A;A=z*(-0.0-w);w=x*A;x=y*A;A=+g[a+176>>2];y=k+ +g[a+184>>2]*(u*r-B*q);q=+g[a+180>>2];r=p+ +g[a+188>>2]*(x*t-w*s);a=(c[f>>2]|0)+(e*12&-1)|0;s=+(j+u*A);g[a>>2]=i+B*A;g[a+4>>2]=s;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=y;d=(c[f>>2]|0)+((c[h>>2]|0)*12&-1)|0;y=+(o+x*q);g[d>>2]=n+w*q;g[d+4>>2]=y;g[(c[f>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=r;return}function fN(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+92>>2];h=+g[d+20>>2];i=+g[b+96>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fO(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+100>>2];h=+g[d+20>>2];i=+g[b+104>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fP(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0;d=+g[b+116>>2];e=d*+g[b+140>>2]*c;g[a>>2]=d*+g[b+136>>2]*c;g[a+4>>2]=e;return}function fQ(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,Q=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+120|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+124|0;c[l>>2]=j;m=e+28|0;n=b+160|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+168|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+176>>2]=s;t=+g[i+120>>2];g[b+180>>2]=t;u=+g[e+128>>2];g[b+184>>2]=u;v=+g[i+128>>2];g[b+188>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;w=+g[e>>2];x=+g[e+4>>2];y=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;z=+g[n>>2];A=+g[n+4>>2];B=+g[m+(f*12&-1)+8>>2];n=i+(j*12&-1)|0;C=+g[n>>2];D=+g[n+4>>2];E=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;F=+g[i>>2];G=+g[i+4>>2];H=+g[m+(j*12&-1)+8>>2];I=+S(+y);J=+R(+y);y=+S(+E);K=+R(+E);E=+g[b+92>>2]-(c[k>>2]=o,+g[k>>2]);L=+g[b+96>>2]-(c[k>>2]=p,+g[k>>2]);M=J*E-I*L;N=I*E+J*L;p=b+144|0;L=+N;g[p>>2]=M;g[p+4>>2]=L;L=+g[b+100>>2]-(c[k>>2]=q,+g[k>>2]);J=+g[b+104>>2]-(c[k>>2]=r,+g[k>>2]);E=K*L-y*J;I=y*L+K*J;r=b+152|0;J=+I;g[r>>2]=E;g[r+4>>2]=J;r=b+128|0;J=w+M- +g[b+68>>2];w=x+N- +g[b+72>>2];q=r;x=+w;g[q>>2]=J;g[q+4>>2]=x;q=b+136|0;x=C+E- +g[b+76>>2];C=D+I- +g[b+80>>2];p=q;D=+C;g[p>>2]=x;g[p+4>>2]=D;p=r|0;D=+P(+(J*J+w*w));r=q|0;K=+P(+(x*x+C*C));if(D>.04999999701976776){L=1.0/D;D=J*L;g[p>>2]=D;O=L*w;Q=D}else{g[p>>2]=0.0;O=0.0;Q=0.0}g[b+132>>2]=O;if(K>.04999999701976776){D=1.0/K;K=D*x;g[r>>2]=K;T=D*C;U=K}else{g[r>>2]=0.0;T=0.0;U=0.0}g[b+140>>2]=T;K=M*O-N*Q;C=E*T-I*U;D=+g[b+112>>2];x=s+K*K*u+D*D*(t+C*C*v);if(x>0.0){V=1.0/x}else{V=x}g[b+192>>2]=V;if((a[d+20|0]&1)==0){g[b+116>>2]=0.0;W=B;X=H;Y=F;Z=G;_=z;$=A;aa=c[e>>2]|0;ab=aa+(f*12&-1)|0;ac=ab;ad=(g[k>>2]=_,c[k>>2]|0);ae=(g[k>>2]=$,c[k>>2]|0);af=ae;ag=0;ah=0;ai=af;aj=ad;ak=0;al=ah|aj;am=ai|ak;an=ac|0;c[an>>2]=al;ao=ac+4|0;c[ao>>2]=am;ap=c[h>>2]|0;aq=c[e>>2]|0;ar=aq+(ap*12&-1)+8|0;g[ar>>2]=W;as=c[l>>2]|0;at=c[e>>2]|0;au=at+(as*12&-1)|0;av=au;aw=(g[k>>2]=Y,c[k>>2]|0);ax=(g[k>>2]=Z,c[k>>2]|0);ay=ax;az=0;aA=0;aB=ay;aC=aw;aD=0;aE=aA|aC;aF=aB|aD;aG=av|0;c[aG>>2]=aE;aH=av+4|0;c[aH>>2]=aF;aI=c[l>>2]|0;aJ=c[e>>2]|0;aK=aJ+(aI*12&-1)+8|0;g[aK>>2]=X;return}else{r=b+116|0;V=+g[d+8>>2]*+g[r>>2];g[r>>2]=V;x=-0.0-V;C=Q*x;Q=O*x;x=V*(-0.0-D);D=U*x;U=T*x;W=B+u*(Q*M-C*N);X=H+v*(U*E-D*I);Y=F+D*t;Z=G+U*t;_=z+C*s;$=A+Q*s;aa=c[e>>2]|0;ab=aa+(f*12&-1)|0;ac=ab;ad=(g[k>>2]=_,c[k>>2]|0);ae=(g[k>>2]=$,c[k>>2]|0);af=ae;ag=0;ah=0;ai=af;aj=ad;ak=0;al=ah|aj;am=ai|ak;an=ac|0;c[an>>2]=al;ao=ac+4|0;c[ao>>2]=am;ap=c[h>>2]|0;aq=c[e>>2]|0;ar=aq+(ap*12&-1)+8|0;g[ar>>2]=W;as=c[l>>2]|0;at=c[e>>2]|0;au=at+(as*12&-1)|0;av=au;aw=(g[k>>2]=Y,c[k>>2]|0);ax=(g[k>>2]=Z,c[k>>2]|0);ay=ax;az=0;aA=0;aB=ay;aC=aw;aD=0;aE=aA|aC;aF=aB|aD;aG=av|0;c[aG>>2]=aE;aH=av+4|0;c[aH>>2]=aF;aI=c[l>>2]|0;aJ=c[e>>2]|0;aK=aJ+(aI*12&-1)+8|0;g[aK>>2]=X;return}}function fR(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,k=0.0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0;d=a+120|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=+g[h>>2];j=+g[h+4>>2];k=+g[b+(e*12&-1)+8>>2];e=a+124|0;l=c[e>>2]|0;m=b+(l*12&-1)|0;n=+g[m>>2];o=+g[m+4>>2];p=+g[b+(l*12&-1)+8>>2];q=+S(+k);r=+R(+k);s=+S(+p);t=+R(+p);u=+g[a+92>>2]- +g[a+160>>2];v=+g[a+96>>2]- +g[a+164>>2];w=r*u-q*v;x=q*u+r*v;v=+g[a+100>>2]- +g[a+168>>2];r=+g[a+104>>2]- +g[a+172>>2];u=t*v-s*r;q=s*v+t*r;r=i+w- +g[a+68>>2];t=j+x- +g[a+72>>2];v=n+u- +g[a+76>>2];s=o+q- +g[a+80>>2];y=+P(+(r*r+t*t));z=+P(+(v*v+s*s));if(y>.04999999701976776){A=1.0/y;B=r*A;C=t*A}else{B=0.0;C=0.0}if(z>.04999999701976776){A=1.0/z;D=v*A;E=s*A}else{D=0.0;E=0.0}A=w*C-x*B;s=u*E-q*D;v=+g[a+176>>2];t=+g[a+184>>2];r=+g[a+180>>2];F=+g[a+188>>2];G=+g[a+112>>2];H=v+A*A*t+G*G*(r+s*s*F);if(H>0.0){I=1.0/H}else{I=H}H=+g[a+108>>2]-y-z*G;if(H>0.0){J=H}else{J=-0.0-H}z=H*(-0.0-I);I=-0.0-z;H=B*I;B=C*I;I=z*(-0.0-G);G=D*I;D=E*I;I=+(j+B*v);g[h>>2]=i+H*v;g[h+4>>2]=I;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=k+(w*B-x*H)*t;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;t=+(o+D*r);g[d>>2]=n+G*r;g[d+4>>2]=t;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=p+F*(u*D-q*G);return J<.004999999888241291|0}function fS(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;db(6808,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(11336,(u=i,i=i+8|0,c[u>>2]=e,u)|0);db(8808,(u=i,i=i+8|0,c[u>>2]=f,u)|0);db(6768,(u=i,i=i+8|0,c[u>>2]=a[b+61|0]&1,u)|0);j=+g[b+72>>2];db(4792,(u=i,i=i+16|0,h[u>>3]=+g[b+68>>2],h[u+8>>3]=j,u)|0);j=+g[b+80>>2];db(4520,(u=i,i=i+16|0,h[u>>3]=+g[b+76>>2],h[u+8>>3]=j,u)|0);j=+g[b+96>>2];db(5992,(u=i,i=i+16|0,h[u>>3]=+g[b+92>>2],h[u+8>>3]=j,u)|0);j=+g[b+104>>2];db(5536,(u=i,i=i+16|0,h[u>>3]=+g[b+100>>2],h[u+8>>3]=j,u)|0);db(12536,(u=i,i=i+8|0,h[u>>3]=+g[b+84>>2],u)|0);db(11952,(u=i,i=i+8|0,h[u>>3]=+g[b+88>>2],u)|0);db(11504,(u=i,i=i+8|0,h[u>>3]=+g[b+112>>2],u)|0);db(11904,(u=i,i=i+8|0,c[u>>2]=c[b+56>>2],u)|0);i=d;return}function fT(a){a=a|0;vl(a);return}function fU(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+128|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+132|0;c[l>>2]=j;m=e+28|0;n=b+152|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+160|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+168>>2]=s;t=+g[i+120>>2];g[b+172>>2]=t;u=+g[e+128>>2];g[b+176>>2]=u;v=+g[i+128>>2];g[b+180>>2]=v;i=c[d+24>>2]|0;w=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;x=+g[n>>2];y=+g[n+4>>2];z=+g[m+(f*12&-1)+8>>2];A=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;B=+g[i>>2];C=+g[i+4>>2];D=+g[m+(j*12&-1)+8>>2];E=+S(+w);F=+R(+w);G=+S(+A);H=+R(+A);I=+g[b+68>>2]-(c[k>>2]=o,+g[k>>2]);J=+g[b+72>>2]-(c[k>>2]=p,+g[k>>2]);K=F*I-E*J;L=E*I+F*J;p=b+136|0;J=+L;g[p>>2]=K;g[p+4>>2]=J;J=+g[b+76>>2]-(c[k>>2]=q,+g[k>>2]);F=+g[b+80>>2]-(c[k>>2]=r,+g[k>>2]);I=H*J-G*F;E=G*J+H*F;r=b+144|0;F=+E;g[r>>2]=I;g[r+4>>2]=F;F=u+v;r=F==0.0;H=s+t;g[b+184>>2]=H+u*L*L+v*E*E;J=-0.0-L;G=u*K*J-v*E*I;g[b+196>>2]=G;M=u*J-v*E;g[b+208>>2]=M;g[b+188>>2]=G;g[b+200>>2]=H+u*K*K+v*I*I;H=u*K+v*I;g[b+212>>2]=H;g[b+192>>2]=M;g[b+204>>2]=H;g[b+216>>2]=F;if(F>0.0){N=1.0/F}else{N=F}g[b+220>>2]=N;if((a[b+100|0]&1)==0|r){g[b+96>>2]=0.0}do{if((a[b+112|0]&1)==0|r){c[b+224>>2]=0}else{N=A-w- +g[b+116>>2];F=+g[b+124>>2];H=+g[b+120>>2];M=F-H;if(M>0.0){O=M}else{O=-0.0-M}if(O<.06981317698955536){c[b+224>>2]=3;break}if(N<=H){q=b+224|0;if((c[q>>2]|0)!=1){g[b+92>>2]=0.0}c[q>>2]=1;break}q=b+224|0;if(N<F){c[q>>2]=0;g[b+92>>2]=0.0;break}if((c[q>>2]|0)!=2){g[b+92>>2]=0.0}c[q>>2]=2}}while(0);r=b+84|0;if((a[d+20|0]&1)==0){vq(r|0,0,16);P=z;Q=D;T=B;U=C;V=x;W=y;X=c[e>>2]|0;Y=X+(f*12&-1)|0;Z=Y;_=(g[k>>2]=V,c[k>>2]|0);$=(g[k>>2]=W,c[k>>2]|0);aa=$;ab=0;ac=0;ad=aa;ae=_;af=0;ag=ac|ae;ah=ad|af;ai=Z|0;c[ai>>2]=ag;aj=Z+4|0;c[aj>>2]=ah;ak=c[h>>2]|0;al=c[e>>2]|0;am=al+(ak*12&-1)+8|0;g[am>>2]=P;an=c[l>>2]|0;ao=c[e>>2]|0;ap=ao+(an*12&-1)|0;aq=ap;ar=(g[k>>2]=T,c[k>>2]|0);as=(g[k>>2]=U,c[k>>2]|0);at=as;au=0;av=0;aw=at;ax=ar;ay=0;az=av|ax;aA=aw|ay;aB=aq|0;c[aB>>2]=az;aC=aq+4|0;c[aC>>2]=aA;aD=c[l>>2]|0;aE=c[e>>2]|0;aF=aE+(aD*12&-1)+8|0;g[aF>>2]=Q;return}else{q=d+8|0;O=+g[q>>2];d=r|0;w=O*+g[d>>2];g[d>>2]=w;d=b+88|0;A=O*+g[d>>2];g[d>>2]=A;d=b+92|0;F=O*+g[d>>2];g[d>>2]=F;d=b+96|0;O=+g[q>>2]*+g[d>>2];g[d>>2]=O;P=z-u*(F+(O+(A*K-w*L)));Q=D+v*(F+(O+(A*I-w*E)));T=B+t*w;U=C+t*A;V=x-s*w;W=y-s*A;X=c[e>>2]|0;Y=X+(f*12&-1)|0;Z=Y;_=(g[k>>2]=V,c[k>>2]|0);$=(g[k>>2]=W,c[k>>2]|0);aa=$;ab=0;ac=0;ad=aa;ae=_;af=0;ag=ac|ae;ah=ad|af;ai=Z|0;c[ai>>2]=ag;aj=Z+4|0;c[aj>>2]=ah;ak=c[h>>2]|0;al=c[e>>2]|0;am=al+(ak*12&-1)+8|0;g[am>>2]=P;an=c[l>>2]|0;ao=c[e>>2]|0;ap=ao+(an*12&-1)|0;aq=ap;ar=(g[k>>2]=T,c[k>>2]|0);as=(g[k>>2]=U,c[k>>2]|0);at=as;au=0;av=0;aw=at;ax=ar;ay=0;az=av|ax;aA=aw|ay;aB=aq|0;c[aB>>2]=az;aC=aq+4|0;c[aC>>2]=aA;aD=c[l>>2]|0;aE=c[e>>2]|0;aF=aE+(aD*12&-1)+8|0;g[aF>>2]=Q;return}}function fV(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0,I=0,J=0,K=0,L=0.0,M=0,N=0.0,O=0.0,P=0.0,Q=0,R=0.0,S=0.0,T=0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0,af=0.0;e=i;i=i+32|0;f=e|0;h=e+16|0;j=b+128|0;k=c[j>>2]|0;l=d+28|0;m=c[l>>2]|0;n=m+(k*12&-1)|0;o=+g[n>>2];p=+g[n+4>>2];q=+g[m+(k*12&-1)+8>>2];n=b+132|0;r=c[n>>2]|0;s=m+(r*12&-1)|0;t=+g[s>>2];u=+g[s+4>>2];v=+g[m+(r*12&-1)+8>>2];w=+g[b+168>>2];x=+g[b+172>>2];y=+g[b+176>>2];z=+g[b+180>>2];r=y+z==0.0;do{if((a[b+100|0]&1)==0){A=q;B=v}else{if((c[b+224>>2]|0)==3|r){A=q;B=v;break}m=b+96|0;C=+g[m>>2];D=+g[d>>2]*+g[b+104>>2];E=C+(v-q- +g[b+108>>2])*(-0.0- +g[b+220>>2]);F=-0.0-D;G=E<D?E:D;D=G<F?F:G;g[m>>2]=D;G=D-C;A=q-y*G;B=v+z*G}}while(0);do{if((a[b+112|0]&1)==0){H=75}else{d=b+224|0;if((c[d>>2]|0)==0|r){H=75;break}m=b+148|0;s=b+144|0;I=b+140|0;J=b+136|0;v=t+ +g[m>>2]*(-0.0-B)-o- +g[I>>2]*(-0.0-A);q=u+B*+g[s>>2]-p-A*+g[J>>2];g[f>>2]=v;g[f+4>>2]=q;g[f+8>>2]=B-A;K=b+184|0;c8(h,K,f);G=+g[h>>2];C=-0.0-G;D=+g[h+4>>2];F=-0.0-D;E=+g[h+8>>2];L=-0.0-E;M=c[d>>2]|0;do{if((M|0)==3){d=b+84|0;g[d>>2]=+g[d>>2]-G;d=b+88|0;g[d>>2]=+g[d>>2]-D;d=b+92|0;g[d>>2]=+g[d>>2]-E;N=C;O=F;P=L}else if((M|0)==1){d=b+84|0;Q=b+92|0;R=+g[Q>>2];S=R-E;if(S>=0.0){T=d|0;g[T>>2]=+g[T>>2]-G;T=b+88|0;g[T>>2]=+g[T>>2]-D;g[Q>>2]=S;N=C;O=F;P=L;break}S=R*+g[b+208>>2]-v;U=R*+g[b+212>>2]-q;V=+g[K>>2];W=+g[b+196>>2];X=+g[b+188>>2];Y=+g[b+200>>2];Z=V*Y-W*X;if(Z!=0.0){_=1.0/Z}else{_=Z}Z=(S*Y-W*U)*_;W=(V*U-S*X)*_;T=d|0;g[T>>2]=Z+ +g[T>>2];T=b+88|0;g[T>>2]=W+ +g[T>>2];g[Q>>2]=0.0;N=Z;O=W;P=-0.0-R}else if((M|0)==2){Q=b+84|0;T=b+92|0;R=+g[T>>2];W=R-E;if(W<=0.0){d=Q|0;g[d>>2]=+g[d>>2]-G;d=b+88|0;g[d>>2]=+g[d>>2]-D;g[T>>2]=W;N=C;O=F;P=L;break}W=R*+g[b+208>>2]-v;Z=R*+g[b+212>>2]-q;X=+g[K>>2];S=+g[b+196>>2];U=+g[b+188>>2];V=+g[b+200>>2];Y=X*V-S*U;if(Y!=0.0){$=1.0/Y}else{$=Y}Y=(W*V-S*Z)*$;S=(X*Z-W*U)*$;d=Q|0;g[d>>2]=Y+ +g[d>>2];d=b+88|0;g[d>>2]=S+ +g[d>>2];g[T>>2]=0.0;N=Y;O=S;P=-0.0-R}else{N=C;O=F;P=L}}while(0);aa=P+(O*+g[J>>2]-N*+g[I>>2]);ab=P+(O*+g[s>>2]-N*+g[m>>2]);ac=N;ad=O;ae=c[j>>2]|0}}while(0);if((H|0)==75){O=+g[b+148>>2];N=+g[b+144>>2];P=+g[b+140>>2];$=+g[b+136>>2];_=-0.0-(t+O*(-0.0-B)-o-P*(-0.0-A));L=-0.0-(u+B*N-p-A*$);F=+g[b+184>>2];C=+g[b+196>>2];q=+g[b+188>>2];v=+g[b+200>>2];D=F*v-C*q;if(D!=0.0){af=1.0/D}else{af=D}D=(v*_-C*L)*af;C=(F*L-q*_)*af;H=b+84|0;g[H>>2]=+g[H>>2]+D;H=b+88|0;g[H>>2]=C+ +g[H>>2];aa=C*$-D*P;ab=C*N-D*O;ac=D;ad=C;ae=k}k=(c[l>>2]|0)+(ae*12&-1)|0;C=+(p-w*ad);g[k>>2]=o-w*ac;g[k+4>>2]=C;g[(c[l>>2]|0)+((c[j>>2]|0)*12&-1)+8>>2]=A-y*aa;j=(c[l>>2]|0)+((c[n>>2]|0)*12&-1)|0;aa=+(u+x*ad);g[j>>2]=t+x*ac;g[j+4>>2]=aa;g[(c[l>>2]|0)+((c[n>>2]|0)*12&-1)+8>>2]=B+z*ab;i=e;return}function fW(a){a=a|0;return}function fX(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fY(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fZ(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+88>>2]*c;g[a>>2]=+g[b+84>>2]*c;g[a+4>>2]=d;return}function f_(a,b){a=a|0;b=+b;return+(+g[a+92>>2]*b)}function f$(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0;d=a+96|0;e=c[d>>2]|0;f=b+28|0;h=c[f>>2]|0;i=h+(e*12&-1)|0;j=+g[i>>2];k=+g[i+4>>2];l=+g[h+(e*12&-1)+8>>2];i=a+100|0;m=c[i>>2]|0;n=h+(m*12&-1)|0;o=+g[n>>2];p=+g[n+4>>2];q=+g[h+(m*12&-1)+8>>2];r=+g[a+116>>2];s=+g[a+112>>2];t=+g[a+124>>2];u=+g[a+120>>2];v=+g[a+88>>2]- +g[a+84>>2];w=+g[a+104>>2];x=+g[a+108>>2];y=(o+t*(-0.0-q)-(j+r*(-0.0-l)))*w+(p+q*u-(k+l*s))*x;if(v<0.0){z=y+v*+g[b+4>>2]}else{z=y}b=a+92|0;y=+g[b>>2];v=y+z*(-0.0- +g[a+160>>2]);z=v>0.0?0.0:v;g[b>>2]=z;v=z-y;y=w*v;w=x*v;v=+g[a+144>>2];x=l- +g[a+152>>2]*(s*w-r*y);r=+g[a+148>>2];s=q+ +g[a+156>>2]*(w*u-y*t);a=(c[f>>2]|0)+(e*12&-1)|0;t=+(k-v*w);g[a>>2]=j-v*y;g[a+4>>2]=t;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=x;d=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;x=+(p+w*r);g[d>>2]=o+y*r;g[d+4>>2]=x;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=s;return}function f0(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0;e=b+128|0;f=c[e>>2]|0;h=d+24|0;d=c[h>>2]|0;i=d+(f*12&-1)|0;j=+g[i>>2];k=+g[i+4>>2];l=+g[d+(f*12&-1)+8>>2];f=b+132|0;m=c[f>>2]|0;n=d+(m*12&-1)|0;o=+g[n>>2];p=+g[n+4>>2];q=+g[d+(m*12&-1)+8>>2];m=b+176|0;d=b+180|0;do{if((a[b+112|0]&1)==0){r=l;s=q;t=0.0;u=+g[m>>2];v=+g[d>>2]}else{w=+g[d>>2];x=+g[m>>2];n=c[b+224>>2]|0;if((n|0)==0|w+x==0.0){r=l;s=q;t=0.0;u=x;v=w;break}y=q-l- +g[b+116>>2];do{if((n|0)==3){z=y- +g[b+120>>2];A=z<.13962635397911072?z:.13962635397911072;z=A<-.13962635397911072?-.13962635397911072:A;A=z*(-0.0- +g[b+220>>2]);if(z>0.0){B=z;C=A;break}B=-0.0-z;C=A}else if((n|0)==1){A=y- +g[b+120>>2];z=A+.03490658849477768;D=z<0.0?z:0.0;B=-0.0-A;C=(D<-.13962635397911072?-.13962635397911072:D)*(-0.0- +g[b+220>>2])}else if((n|0)==2){D=y- +g[b+124>>2];A=D+-.03490658849477768;z=A<.13962635397911072?A:.13962635397911072;B=D;C=(z<0.0?0.0:z)*(-0.0- +g[b+220>>2])}else{B=0.0;C=0.0}}while(0);r=l-C*x;s=q+C*w;t=B;u=x;v=w}}while(0);B=+S(+r);C=+R(+r);q=+S(+s);l=+R(+s);y=+g[b+68>>2]- +g[b+152>>2];z=+g[b+72>>2]- +g[b+156>>2];D=C*y-B*z;A=B*y+C*z;z=+g[b+76>>2]- +g[b+160>>2];C=+g[b+80>>2]- +g[b+164>>2];y=l*z-q*C;B=q*z+l*C;C=o+y-j-D;l=p+B-k-A;z=+P(+(C*C+l*l));q=+g[b+168>>2];E=+g[b+172>>2];F=q+E;G=F+A*A*u+B*B*v;H=y*v;I=A*D*(-0.0-u)-B*H;J=F+D*D*u+y*H;H=G*J-I*I;if(H!=0.0){K=1.0/H}else{K=H}H=-0.0-(C*J-l*I)*K;J=-0.0-(l*G-C*I)*K;K=+(k-q*J);g[i>>2]=j-q*H;g[i+4>>2]=K;g[(c[h>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=r-u*(D*J-A*H);e=(c[h>>2]|0)+((c[f>>2]|0)*12&-1)|0;A=+(p+E*J);g[e>>2]=o+E*H;g[e+4>>2]=A;g[(c[h>>2]|0)+((c[f>>2]|0)*12&-1)+8>>2]=s+v*(y*J-B*H);if(z>.004999999888241291){L=0;return L|0}L=t<=.03490658849477768;return L|0}function f1(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;db(8928,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(11336,(u=i,i=i+8|0,c[u>>2]=e,u)|0);db(8808,(u=i,i=i+8|0,c[u>>2]=f,u)|0);db(6768,(u=i,i=i+8|0,c[u>>2]=a[b+61|0]&1,u)|0);j=+g[b+72>>2];db(5992,(u=i,i=i+16|0,h[u>>3]=+g[b+68>>2],h[u+8>>3]=j,u)|0);j=+g[b+80>>2];db(5536,(u=i,i=i+16|0,h[u>>3]=+g[b+76>>2],h[u+8>>3]=j,u)|0);db(5072,(u=i,i=i+8|0,h[u>>3]=+g[b+116>>2],u)|0);db(4264,(u=i,i=i+8|0,c[u>>2]=a[b+112|0]&1,u)|0);db(12800,(u=i,i=i+8|0,h[u>>3]=+g[b+120>>2],u)|0);db(12504,(u=i,i=i+8|0,h[u>>3]=+g[b+124>>2],u)|0);db(4760,(u=i,i=i+8|0,c[u>>2]=a[b+100|0]&1,u)|0);db(4488,(u=i,i=i+8|0,h[u>>3]=+g[b+108>>2],u)|0);db(4232,(u=i,i=i+8|0,h[u>>3]=+g[b+104>>2],u)|0);db(11904,(u=i,i=i+8|0,c[u>>2]=c[b+56>>2],u)|0);i=d;return}function f2(a){a=a|0;vl(a);return}function f3(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,Q=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+96|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+100|0;c[l>>2]=j;m=e+28|0;n=b+128|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+136|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+144>>2]=s;t=+g[i+120>>2];g[b+148>>2]=t;u=+g[e+128>>2];g[b+152>>2]=u;v=+g[i+128>>2];g[b+156>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;w=+g[e>>2];x=+g[e+4>>2];y=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;z=+g[n>>2];A=+g[n+4>>2];B=+g[m+(f*12&-1)+8>>2];n=i+(j*12&-1)|0;C=+g[n>>2];D=+g[n+4>>2];E=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;F=+g[i>>2];G=+g[i+4>>2];H=+g[m+(j*12&-1)+8>>2];I=+S(+y);J=+R(+y);y=+S(+E);K=+R(+E);E=+g[b+68>>2]-(c[k>>2]=o,+g[k>>2]);L=+g[b+72>>2]-(c[k>>2]=p,+g[k>>2]);M=J*E-I*L;N=I*E+J*L;p=b+112|0;L=+N;g[p>>2]=M;g[p+4>>2]=L;L=+g[b+76>>2]-(c[k>>2]=q,+g[k>>2]);J=+g[b+80>>2]-(c[k>>2]=r,+g[k>>2]);E=K*L-y*J;I=y*L+K*J;r=b+120|0;J=+I;g[r>>2]=E;g[r+4>>2]=J;r=b+104|0;J=C+E-w-M;w=D+I-x-N;q=r;x=+w;g[q>>2]=J;g[q+4>>2]=x;q=r|0;r=b+108|0;x=+P(+(J*J+w*w));g[b+88>>2]=x;c[b+164>>2]=x- +g[b+84>>2]>0.0?2:0;if(x<=.004999999888241291){g[q>>2]=0.0;g[r>>2]=0.0;g[b+160>>2]=0.0;g[b+92>>2]=0.0;return}D=1.0/x;x=D*J;g[q>>2]=x;J=D*w;g[r>>2]=J;w=M*J-N*x;D=J*E-x*I;C=t+(s+w*w*u)+D*D*v;if(C!=0.0){O=1.0/C}else{O=0.0}g[b+160>>2]=O;if((a[d+20|0]&1)==0){g[b+92>>2]=0.0;Q=B;T=H;U=F;V=G;W=z;X=A}else{r=b+92|0;O=+g[d+8>>2]*+g[r>>2];g[r>>2]=O;C=x*O;x=O*J;Q=B-u*(x*M-C*N);T=H+v*(x*E-C*I);U=F+C*t;V=G+x*t;W=z-C*s;X=A-x*s}r=(c[e>>2]|0)+(f*12&-1)|0;s=+X;g[r>>2]=W;g[r+4>>2]=s;g[(c[e>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=Q;h=(c[e>>2]|0)+((c[l>>2]|0)*12&-1)|0;Q=+V;g[h>>2]=U;g[h+4>>2]=Q;g[(c[e>>2]|0)+((c[l>>2]|0)*12&-1)+8>>2]=T;return}function f4(a,b){a=a|0;b=+b;return+0.0}function f5(a){a=a|0;return}function f6(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function f7(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function f8(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+92>>2]*c;c=d*+g[b+108>>2];g[a>>2]=+g[b+104>>2]*d;g[a+4>>2]=c;return}function f9(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,k=0.0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0;d=a+116|0;e=c[d>>2]|0;f=b+28|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=+g[h>>2];j=+g[h+4>>2];k=+g[b+(e*12&-1)+8>>2];h=a+120|0;l=c[h>>2]|0;m=b+(l*12&-1)|0;n=+g[m>>2];o=+g[m+4>>2];p=+g[b+(l*12&-1)+8>>2];q=+g[a+156>>2];r=+g[a+160>>2];s=+g[a+164>>2];t=+g[a+168>>2];if(+g[a+68>>2]>0.0){l=a+112|0;u=+g[l>>2];v=(p-k+ +g[a+76>>2]+ +g[a+100>>2]*u)*(-0.0- +g[a+204>>2]);g[l>>2]=u+v;u=k-s*v;w=p+t*v;v=+g[a+136>>2];x=+g[a+132>>2];y=+g[a+128>>2];z=+g[a+124>>2];A=n+v*(-0.0-w)-i-y*(-0.0-u);B=o+x*w-j-z*u;C=+g[a+184>>2]*B+ +g[a+172>>2]*A;D=+g[a+188>>2]*B+ +g[a+176>>2]*A;A=-0.0-C;B=-0.0-D;l=a+104|0;g[l>>2]=+g[l>>2]-C;l=a+108|0;g[l>>2]=+g[l>>2]-D;E=u-s*(z*B-y*A);F=w+t*(x*B-v*A);G=A;H=B}else{B=+g[a+136>>2];A=+g[a+132>>2];v=+g[a+128>>2];x=+g[a+124>>2];w=n+B*(-0.0-p)-i-v*(-0.0-k);y=o+p*A-j-k*x;z=p-k;u=w*+g[a+172>>2]+y*+g[a+184>>2]+z*+g[a+196>>2];D=w*+g[a+176>>2]+y*+g[a+188>>2]+z*+g[a+200>>2];C=w*+g[a+180>>2]+y*+g[a+192>>2]+z*+g[a+204>>2];z=-0.0-u;y=-0.0-D;l=a+104|0;g[l>>2]=+g[l>>2]-u;l=a+108|0;g[l>>2]=+g[l>>2]-D;l=a+112|0;g[l>>2]=+g[l>>2]-C;E=k-s*(x*y-v*z-C);F=p+t*(A*y-B*z-C);G=z;H=y}l=(c[f>>2]|0)+(e*12&-1)|0;y=+(j-q*H);g[l>>2]=i-q*G;g[l+4>>2]=y;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=E;d=(c[f>>2]|0)+((c[h>>2]|0)*12&-1)|0;E=+(o+r*H);g[d>>2]=n+r*G;g[d+4>>2]=E;g[(c[f>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=F;return}function ga(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,k=0.0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0;d=a+96|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=+g[h>>2];j=+g[h+4>>2];k=+g[b+(e*12&-1)+8>>2];e=a+100|0;l=c[e>>2]|0;m=b+(l*12&-1)|0;n=+g[m>>2];o=+g[m+4>>2];p=+g[b+(l*12&-1)+8>>2];q=+S(+k);r=+R(+k);s=+S(+p);t=+R(+p);u=+g[a+68>>2]- +g[a+128>>2];v=+g[a+72>>2]- +g[a+132>>2];w=r*u-q*v;x=q*u+r*v;v=+g[a+76>>2]- +g[a+136>>2];r=+g[a+80>>2]- +g[a+140>>2];u=t*v-s*r;q=s*v+t*r;r=n+u-i-w;t=o+q-j-x;v=+P(+(r*r+t*t));if(v<1.1920928955078125e-7){y=0.0;z=r;A=t}else{s=1.0/v;y=v;z=r*s;A=t*s}l=a+84|0;s=y- +g[l>>2];t=s<.20000000298023224?s:.20000000298023224;s=(t<0.0?0.0:t)*(-0.0- +g[a+160>>2]);t=z*s;z=A*s;s=+g[a+144>>2];A=k- +g[a+152>>2]*(w*z-x*t);x=+g[a+148>>2];w=p+ +g[a+156>>2]*(u*z-q*t);q=+(j-s*z);g[h>>2]=i-s*t;g[h+4>>2]=q;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=A;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;A=+(o+x*z);g[d>>2]=n+x*t;g[d+4>>2]=A;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=w;return y- +g[l>>2]<.004999999888241291|0}function gb(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;db(6400,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(11336,(u=i,i=i+8|0,c[u>>2]=e,u)|0);db(8808,(u=i,i=i+8|0,c[u>>2]=f,u)|0);db(6768,(u=i,i=i+8|0,c[u>>2]=a[b+61|0]&1,u)|0);j=+g[b+72>>2];db(5992,(u=i,i=i+16|0,h[u>>3]=+g[b+68>>2],h[u+8>>3]=j,u)|0);j=+g[b+80>>2];db(5536,(u=i,i=i+16|0,h[u>>3]=+g[b+76>>2],h[u+8>>3]=j,u)|0);db(5104,(u=i,i=i+8|0,h[u>>3]=+g[b+84>>2],u)|0);db(11904,(u=i,i=i+8|0,c[u>>2]=c[b+56>>2],u)|0);i=d;return}function gc(a){a=a|0;vl(a);return}function gd(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+116|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+120|0;c[l>>2]=j;m=e+28|0;n=b+140|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+148|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+156>>2]=s;t=+g[i+120>>2];g[b+160>>2]=t;u=+g[e+128>>2];g[b+164>>2]=u;v=+g[i+128>>2];g[b+168>>2]=v;i=c[d+24>>2]|0;w=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;x=+g[n>>2];y=+g[n+4>>2];z=+g[m+(f*12&-1)+8>>2];A=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;B=+g[i>>2];C=+g[i+4>>2];D=+g[m+(j*12&-1)+8>>2];E=+S(+w);F=+R(+w);G=+S(+A);H=+R(+A);I=+g[b+80>>2]-(c[k>>2]=o,+g[k>>2]);J=+g[b+84>>2]-(c[k>>2]=p,+g[k>>2]);K=F*I-E*J;L=E*I+F*J;p=b+124|0;J=+L;g[p>>2]=K;g[p+4>>2]=J;J=+g[b+88>>2]-(c[k>>2]=q,+g[k>>2]);F=+g[b+92>>2]-(c[k>>2]=r,+g[k>>2]);I=H*J-G*F;E=G*J+H*F;r=b+132|0;F=+E;g[r>>2]=I;g[r+4>>2]=F;F=s+t;H=F+u*L*L+v*E*E;J=-0.0-L;G=u*K*J-v*E*I;M=u*J-v*E;J=F+u*K*K+v*I*I;F=u*K+v*I;N=u+v;O=+g[b+68>>2];r=b+172|0;if(O>0.0){P=H*J-G*G;if(P!=0.0){Q=1.0/P}else{Q=P}g[r>>2]=J*Q;P=G*(-0.0-Q);g[b+184>>2]=P;g[b+180>>2]=0.0;g[b+176>>2]=P;g[b+188>>2]=H*Q;vq(b+192|0,0,16);if(N>0.0){T=1.0/N}else{T=0.0}Q=A-w- +g[b+96>>2];w=O*6.2831854820251465;O=w*T*w;A=+g[d>>2];P=A*(w*T*2.0*+g[b+72>>2]+A*O);q=b+100|0;g[q>>2]=P;if(P!=0.0){U=1.0/P}else{U=0.0}g[q>>2]=U;g[b+76>>2]=Q*A*O*U;O=N+U;if(O!=0.0){V=1.0/O}else{V=0.0}g[b+204>>2]=V}else{V=N*J-F*F;O=M*F-N*G;U=F*G-M*J;A=M*U+(H*V+G*O);if(A!=0.0){W=1.0/A}else{W=A}g[r>>2]=V*W;V=O*W;g[b+176>>2]=V;O=U*W;g[b+180>>2]=O;g[b+184>>2]=V;g[b+188>>2]=(N*H-M*M)*W;N=(M*G-H*F)*W;g[b+192>>2]=N;g[b+196>>2]=O;g[b+200>>2]=N;g[b+204>>2]=(H*J-G*G)*W;g[b+100>>2]=0.0;g[b+76>>2]=0.0}r=b+104|0;if((a[d+20|0]&1)==0){g[r>>2]=0.0;g[b+108>>2]=0.0;g[b+112>>2]=0.0;X=z;Y=D;Z=B;_=C;$=x;aa=y;ab=c[e>>2]|0;ac=ab+(f*12&-1)|0;ad=ac;ae=(g[k>>2]=$,c[k>>2]|0);af=(g[k>>2]=aa,c[k>>2]|0);ag=af;ah=0;ai=0;aj=ag;ak=ae;al=0;am=ai|ak;an=aj|al;ao=ad|0;c[ao>>2]=am;ap=ad+4|0;c[ap>>2]=an;aq=c[h>>2]|0;ar=c[e>>2]|0;as=ar+(aq*12&-1)+8|0;g[as>>2]=X;at=c[l>>2]|0;au=c[e>>2]|0;av=au+(at*12&-1)|0;aw=av;ax=(g[k>>2]=Z,c[k>>2]|0);ay=(g[k>>2]=_,c[k>>2]|0);az=ay;aA=0;aB=0;aC=az;aD=ax;aE=0;aF=aB|aD;aG=aC|aE;aH=aw|0;c[aH>>2]=aF;aI=aw+4|0;c[aI>>2]=aG;aJ=c[l>>2]|0;aK=c[e>>2]|0;aL=aK+(aJ*12&-1)+8|0;g[aL>>2]=Y;return}else{W=+g[d+8>>2];d=r|0;G=W*+g[d>>2];g[d>>2]=G;d=b+108|0;J=W*+g[d>>2];g[d>>2]=J;d=b+112|0;H=W*+g[d>>2];g[d>>2]=H;X=z-u*(H+(J*K-G*L));Y=D+v*(H+(J*I-G*E));Z=B+t*G;_=C+t*J;$=x-s*G;aa=y-s*J;ab=c[e>>2]|0;ac=ab+(f*12&-1)|0;ad=ac;ae=(g[k>>2]=$,c[k>>2]|0);af=(g[k>>2]=aa,c[k>>2]|0);ag=af;ah=0;ai=0;aj=ag;ak=ae;al=0;am=ai|ak;an=aj|al;ao=ad|0;c[ao>>2]=am;ap=ad+4|0;c[ap>>2]=an;aq=c[h>>2]|0;ar=c[e>>2]|0;as=ar+(aq*12&-1)+8|0;g[as>>2]=X;at=c[l>>2]|0;au=c[e>>2]|0;av=au+(at*12&-1)|0;aw=av;ax=(g[k>>2]=Z,c[k>>2]|0);ay=(g[k>>2]=_,c[k>>2]|0);az=ay;aA=0;aB=0;aC=az;aD=ax;aE=0;aF=aB|aD;aG=aC|aE;aH=aw|0;c[aH>>2]=aF;aI=aw+4|0;c[aI>>2]=aG;aJ=c[l>>2]|0;aK=c[e>>2]|0;aL=aK+(aJ*12&-1)+8|0;g[aL>>2]=Y;return}}function ge(a){a=a|0;return}function gf(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+80>>2];h=+g[d+20>>2];i=+g[b+84>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function gg(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+88>>2];h=+g[d+20>>2];i=+g[b+92>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function gh(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+108>>2]*c;g[a>>2]=+g[b+104>>2]*c;g[a+4>>2]=d;return}function gi(a,b){a=a|0;b=+b;return+(+g[a+112>>2]*b)}function gj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,k=0.0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,Q=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0;d=a+116|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=+g[h>>2];j=+g[h+4>>2];k=+g[b+(e*12&-1)+8>>2];e=a+120|0;l=c[e>>2]|0;m=b+(l*12&-1)|0;n=+g[m>>2];o=+g[m+4>>2];p=+g[b+(l*12&-1)+8>>2];q=+S(+k);r=+R(+k);s=+S(+p);t=+R(+p);u=+g[a+156>>2];v=+g[a+160>>2];w=+g[a+164>>2];x=+g[a+168>>2];y=+g[a+80>>2]- +g[a+140>>2];z=+g[a+84>>2]- +g[a+144>>2];A=r*y-q*z;B=q*y+r*z;z=+g[a+88>>2]- +g[a+148>>2];r=+g[a+92>>2]- +g[a+152>>2];y=t*z-s*r;q=s*z+t*r;r=u+v;t=r+w*B*B+x*q*q;z=-0.0-B;s=w*A*z-x*q*y;C=w*z-x*q;z=r+w*A*A+x*y*y;r=w*A+x*y;D=w+x;E=n+y-i-A;F=o+q-j-B;if(+g[a+68>>2]>0.0){G=+P(+(E*E+F*F));H=t*z-s*s;if(H!=0.0){I=1.0/H}else{I=H}H=-0.0-(z*E-s*F)*I;J=-0.0-(t*F-s*E)*I;K=A*J-B*H;L=0.0;M=G;N=y*J-q*H;O=H;Q=J}else{J=p-k- +g[a+96>>2];H=+P(+(E*E+F*F));if(J>0.0){T=J}else{T=-0.0-J}G=D*z-r*r;I=r*C-D*s;U=r*s-C*z;V=C*U+(t*G+s*I);if(V!=0.0){W=1.0/V}else{W=V}V=r*E;X=(C*(F*s-z*E)+(t*(z*J-r*F)+s*(V-s*J)))*W;z=-0.0-(E*G+F*I+U*J)*W;U=-0.0-(C*(V-C*F)+(t*(D*F-r*J)+s*(C*J-D*E)))*W;K=A*U-B*z-X;L=T;M=H;N=y*U-q*z-X;O=z;Q=U}U=+(j-u*Q);g[h>>2]=i-u*O;g[h+4>>2]=U;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=k-w*K;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;K=+(o+v*Q);g[d>>2]=n+v*O;g[d+4>>2]=K;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=p+x*N;if(M>.004999999888241291){Y=0;return Y|0}Y=L<=.03490658849477768;return Y|0}function gk(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;db(6344,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(11336,(u=i,i=i+8|0,c[u>>2]=e,u)|0);db(8808,(u=i,i=i+8|0,c[u>>2]=f,u)|0);db(6768,(u=i,i=i+8|0,c[u>>2]=a[b+61|0]&1,u)|0);j=+g[b+84>>2];db(5992,(u=i,i=i+16|0,h[u>>3]=+g[b+80>>2],h[u+8>>3]=j,u)|0);j=+g[b+92>>2];db(5536,(u=i,i=i+16|0,h[u>>3]=+g[b+88>>2],h[u+8>>3]=j,u)|0);db(5072,(u=i,i=i+8|0,h[u>>3]=+g[b+96>>2],u)|0);db(12768,(u=i,i=i+8|0,h[u>>3]=+g[b+68>>2],u)|0);db(12472,(u=i,i=i+8|0,h[u>>3]=+g[b+72>>2],u)|0);db(11904,(u=i,i=i+8|0,c[u>>2]=c[b+56>>2],u)|0);i=d;return}function gl(a){a=a|0;vl(a);return}function gm(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+132|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+136|0;c[l>>2]=j;m=e+28|0;n=b+140|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+148|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+156>>2]=s;t=+g[i+120>>2];g[b+160>>2]=t;u=+g[e+128>>2];g[b+164>>2]=u;v=+g[i+128>>2];g[b+168>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;w=+g[e>>2];x=+g[e+4>>2];y=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;z=+g[n>>2];A=+g[n+4>>2];B=+g[m+(f*12&-1)+8>>2];n=i+(j*12&-1)|0;C=+g[n>>2];D=+g[n+4>>2];E=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;F=+g[i>>2];G=+g[i+4>>2];H=+g[m+(j*12&-1)+8>>2];I=+S(+y);J=+R(+y);y=+S(+E);K=+R(+E);E=+g[b+76>>2]-(c[k>>2]=o,+g[k>>2]);L=+g[b+80>>2]-(c[k>>2]=p,+g[k>>2]);M=J*E-I*L;N=I*E+J*L;L=+g[b+84>>2]-(c[k>>2]=q,+g[k>>2]);E=+g[b+88>>2]-(c[k>>2]=r,+g[k>>2]);O=K*L-y*E;P=y*L+K*E;E=C+O-w-M;w=D+P-x-N;x=+g[b+100>>2];D=+g[b+104>>2];C=J*x-I*D;K=I*x+J*D;r=b+180|0;D=+K;g[r>>2]=C;g[r+4>>2]=D;D=M+E;M=N+w;N=K*D-C*M;g[b+196>>2]=N;x=O*K-P*C;g[b+200>>2]=x;L=s+t;y=L+N*u*N+x*v*x;if(y>0.0){Q=1.0/y}else{Q=y}g[b+204>>2]=Q;r=b+212|0;g[r>>2]=0.0;q=b+216|0;g[q>>2]=0.0;p=b+220|0;g[p>>2]=0.0;Q=+g[b+68>>2];do{if(Q>0.0){y=+g[b+92>>2];T=+g[b+96>>2];U=J*y-I*T;V=I*y+J*T;o=b+172|0;T=+V;g[o>>2]=U;g[o+4>>2]=T;T=D*V-M*U;g[b+188>>2]=T;y=O*V-P*U;g[b+192>>2]=y;W=L+T*u*T+y*v*y;if(W<=0.0){break}y=1.0/W;g[r>>2]=y;T=Q*6.2831854820251465;X=T*y*T;Y=+g[d>>2];Z=Y*(T*y*2.0*+g[b+72>>2]+Y*X);if(Z>0.0){_=1.0/Z}else{_=Z}g[p>>2]=_;g[q>>2]=(E*U+w*V)*Y*X*_;X=W+_;g[r>>2]=X;if(X<=0.0){break}g[r>>2]=1.0/X}else{g[b+116>>2]=0.0}}while(0);do{if((a[b+128|0]&1)==0){g[b+208>>2]=0.0;g[b+112>>2]=0.0}else{_=v+u;r=b+208|0;g[r>>2]=_;if(_<=0.0){break}g[r>>2]=1.0/_}}while(0);if((a[d+20|0]&1)==0){g[b+108>>2]=0.0;g[b+116>>2]=0.0;g[b+112>>2]=0.0;$=B;aa=H;ab=F;ac=G;ad=z;ae=A;af=c[e>>2]|0;ag=af+(f*12&-1)|0;ah=ag;ai=(g[k>>2]=ad,c[k>>2]|0);aj=(g[k>>2]=ae,c[k>>2]|0);ak=aj;al=0;am=0;an=ak;ao=ai;ap=0;aq=am|ao;ar=an|ap;as=ah|0;c[as>>2]=aq;at=ah+4|0;c[at>>2]=ar;au=c[h>>2]|0;av=c[e>>2]|0;aw=av+(au*12&-1)+8|0;g[aw>>2]=$;ax=c[l>>2]|0;ay=c[e>>2]|0;az=ay+(ax*12&-1)|0;aA=az;aB=(g[k>>2]=ab,c[k>>2]|0);aC=(g[k>>2]=ac,c[k>>2]|0);aD=aC;aE=0;aF=0;aG=aD;aH=aB;aI=0;aJ=aF|aH;aK=aG|aI;aL=aA|0;c[aL>>2]=aJ;aM=aA+4|0;c[aM>>2]=aK;aN=c[l>>2]|0;aO=c[e>>2]|0;aP=aO+(aN*12&-1)+8|0;g[aP>>2]=aa;return}else{r=d+8|0;d=b+108|0;_=+g[r>>2]*+g[d>>2];g[d>>2]=_;d=b+116|0;w=+g[r>>2]*+g[d>>2];g[d>>2]=w;d=b+112|0;E=+g[r>>2]*+g[d>>2];g[d>>2]=E;Q=_*C+w*+g[b+172>>2];C=_*K+w*+g[b+176>>2];$=B-(E+(_*N+w*+g[b+188>>2]))*u;aa=H+(E+(_*x+w*+g[b+192>>2]))*v;ab=F+Q*t;ac=G+C*t;ad=z-Q*s;ae=A-C*s;af=c[e>>2]|0;ag=af+(f*12&-1)|0;ah=ag;ai=(g[k>>2]=ad,c[k>>2]|0);aj=(g[k>>2]=ae,c[k>>2]|0);ak=aj;al=0;am=0;an=ak;ao=ai;ap=0;aq=am|ao;ar=an|ap;as=ah|0;c[as>>2]=aq;at=ah+4|0;c[at>>2]=ar;au=c[h>>2]|0;av=c[e>>2]|0;aw=av+(au*12&-1)+8|0;g[aw>>2]=$;ax=c[l>>2]|0;ay=c[e>>2]|0;az=ay+(ax*12&-1)|0;aA=az;aB=(g[k>>2]=ab,c[k>>2]|0);aC=(g[k>>2]=ac,c[k>>2]|0);aD=aC;aE=0;aF=0;aG=aD;aH=aB;aI=0;aJ=aF|aH;aK=aG|aI;aL=aA|0;c[aL>>2]=aJ;aM=aA+4|0;c[aM>>2]=aK;aN=c[l>>2]|0;aO=c[e>>2]|0;aP=aO+(aN*12&-1)+8|0;g[aP>>2]=aa;return}}function gn(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0;e=b|0;c[e>>2]=19312;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){bc(7272,173,15744,9072)}else{c[b+4>>2]=c[d>>2];c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[f>>2];c[b+52>>2]=c[h>>2];c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2];vq(b+16|0,0,32);c[e>>2]=20184;e=d+20|0;h=b+76|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2];c[h+4>>2]=f;f=d+28|0;h=b+84|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2];c[h+4>>2]=e;e=d+36|0;h=b+92|0;f=c[e>>2]|0;i=c[e+4>>2]|0;c[h>>2]=f;c[h+4>>2]=i;h=b+100|0;g[h>>2]=(c[k>>2]=i,+g[k>>2])*-1.0;c[h+4>>2]=f;g[b+204>>2]=0.0;g[b+108>>2]=0.0;g[b+208>>2]=0.0;g[b+112>>2]=0.0;g[b+212>>2]=0.0;g[b+116>>2]=0.0;g[b+120>>2]=+g[d+48>>2];g[b+124>>2]=+g[d+52>>2];a[b+128|0]=a[d+44|0]&1;g[b+68>>2]=+g[d+56>>2];g[b+72>>2]=+g[d+60>>2];g[b+216>>2]=0.0;g[b+220>>2]=0.0;vq(b+172|0,0,16);return}}function go(a){a=a|0;return}function gp(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0,j=0,k=0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0;d=+g[a+156>>2];e=+g[a+160>>2];f=+g[a+164>>2];h=+g[a+168>>2];i=a+132|0;j=c[i>>2]|0;k=b+28|0;l=c[k>>2]|0;m=l+(j*12&-1)|0;n=+g[m>>2];o=+g[m+4>>2];p=+g[l+(j*12&-1)+8>>2];m=a+136|0;q=c[m>>2]|0;r=l+(q*12&-1)|0;s=+g[r>>2];t=+g[r+4>>2];u=+g[l+(q*12&-1)+8>>2];v=+g[a+172>>2];w=+g[a+176>>2];x=+g[a+192>>2];y=+g[a+188>>2];q=a+116|0;z=+g[q>>2];A=(+g[a+216>>2]+(u*x+(v*(s-n)+w*(t-o))-p*y)+ +g[a+220>>2]*z)*(-0.0- +g[a+212>>2]);g[q>>2]=z+A;z=v*A;v=w*A;w=n-d*z;n=o-d*v;o=p-f*A*y;y=s+e*z;z=t+e*v;v=u+h*A*x;q=a+112|0;x=+g[q>>2];A=+g[b>>2]*+g[a+120>>2];u=x+(v-o- +g[a+124>>2])*(-0.0- +g[a+208>>2]);t=-0.0-A;s=u<A?u:A;A=s<t?t:s;g[q>>2]=A;s=A-x;x=o-f*s;o=v+h*s;s=+g[a+180>>2];v=+g[a+184>>2];A=+g[a+200>>2];t=+g[a+196>>2];u=((y-w)*s+(z-n)*v+A*o-t*x)*(-0.0- +g[a+204>>2]);q=a+108|0;g[q>>2]=+g[q>>2]+u;p=s*u;s=v*u;q=(c[k>>2]|0)+(j*12&-1)|0;v=+(n-d*s);g[q>>2]=w-d*p;g[q+4>>2]=v;g[(c[k>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=x-f*t*u;i=(c[k>>2]|0)+((c[m>>2]|0)*12&-1)|0;t=+(z+e*s);g[i>>2]=y+e*p;g[i+4>>2]=t;g[(c[k>>2]|0)+((c[m>>2]|0)*12&-1)+8>>2]=o+h*A*u;return}function gq(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function gr(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+84>>2];h=+g[d+20>>2];i=+g[b+88>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function gs(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0,f=0.0;d=+g[b+108>>2];e=+g[b+116>>2];f=(d*+g[b+184>>2]+e*+g[b+176>>2])*c;g[a>>2]=(d*+g[b+180>>2]+e*+g[b+172>>2])*c;g[a+4>>2]=f;return}function gt(a,b){a=a|0;b=+b;return+(+g[a+112>>2]*b)}function gu(a){a=a|0;return c[a+68>>2]|0}function gv(a){a=a|0;return c[a+64>>2]|0}function gw(a,b){a=a|0;b=b|0;c[a+68>>2]=b;return}function gx(a,b){a=a|0;b=b|0;c[a+76>>2]=b;return}function gy(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function gz(a,b){a=a|0;b=b|0;c[a+60>>2]=b;return}function gA(a){a=a|0;return c[a+72>>2]|0}function gB(a,b){a=a|0;b=b|0;c[a+72>>2]=b;return}function gC(a){a=a|0;return a|0}function gD(a){a=a|0;return c[a+60>>2]|0}function gE(a){a=a|0;return c[a+76>>2]|0}function gF(a){a=a|0;return c[a+48>>2]|0}function gG(a){a=a|0;return c[a+52>>2]|0}function gH(a,b){a=a|0;b=+b;g[a+68>>2]=b;return}function gI(a){a=a|0;return c[a+64>>2]|0}function gJ(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function gK(a){a=a|0;return c[a+12>>2]|0}function gL(a){a=a|0;return a+80|0}function gM(a){a=a|0;return a+88|0}function gN(a){a=a|0;return+(+g[a+68>>2])}function gO(a){a=a|0;return+(+g[a+104>>2])}function gP(a){a=a|0;return+(+g[a+72>>2])}function gQ(b){b=b|0;return(a[b+61|0]&1)!=0|0}function gR(a){a=a|0;return c[a+4>>2]|0}function gS(a,b){a=a|0;b=+b;g[a+72>>2]=b;return}function gT(a,b){a=a|0;b=+b;g[a+104>>2]=b;return}function gU(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)!=0;return d|0}function gV(a){a=a|0;return+(+g[a+20>>2])}function gW(a,b){a=a|0;b=+b;g[a+16>>2]=b;return}function gX(a){a=a|0;return c[a+12>>2]|0}function gY(a,b){a=a|0;b=+b;g[a+20>>2]=b;return}function gZ(a){a=a|0;return c[a+8>>2]|0}function g_(a){a=a|0;return c[a+4>>2]|0}function g$(a){a=a|0;return+(+g[a+16>>2])}function g0(a){a=a|0;return c[a+40>>2]|0}function g1(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,k=0.0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0;d=a+132|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=+g[h>>2];j=+g[h+4>>2];k=+g[b+(e*12&-1)+8>>2];e=a+136|0;l=c[e>>2]|0;m=b+(l*12&-1)|0;n=+g[m>>2];o=+g[m+4>>2];p=+g[b+(l*12&-1)+8>>2];q=+S(+k);r=+R(+k);s=+S(+p);t=+R(+p);u=+g[a+76>>2]- +g[a+140>>2];v=+g[a+80>>2]- +g[a+144>>2];w=r*u-q*v;x=q*u+r*v;v=+g[a+84>>2]- +g[a+148>>2];u=+g[a+88>>2]- +g[a+152>>2];y=t*v-s*u;z=s*v+t*u;u=n-i+y-w;t=o-j+z-x;v=+g[a+100>>2];s=+g[a+104>>2];A=r*v-q*s;B=q*v+r*s;s=A*u+B*t;r=+g[a+156>>2];v=+g[a+160>>2];q=+g[a+164>>2];C=+g[a+196>>2];D=+g[a+168>>2];E=+g[a+200>>2];F=r+v+C*q*C+E*D*E;if(F!=0.0){G=(-0.0-s)/F}else{G=0.0}F=A*G;E=B*G;C=+(j-E*r);g[h>>2]=i-F*r;g[h+4>>2]=C;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=k-(B*(w+u)-A*(x+t))*G*q;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;q=+(o+E*v);g[d>>2]=n+F*v;g[d+4>>2]=q;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=p+(y*B-z*A)*G*D;if(s>0.0){H=s;I=H<=.004999999888241291;return I|0}H=-0.0-s;I=H<=.004999999888241291;return I|0}function g2(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;db(6288,(u=i,i=i+1|0,i=i+7>>3<<3,c[u>>2]=0,u)|0);db(11336,(u=i,i=i+8|0,c[u>>2]=e,u)|0);db(8808,(u=i,i=i+8|0,c[u>>2]=f,u)|0);db(6768,(u=i,i=i+8|0,c[u>>2]=a[b+61|0]&1,u)|0);j=+g[b+80>>2];db(5992,(u=i,i=i+16|0,h[u>>3]=+g[b+76>>2],h[u+8>>3]=j,u)|0);j=+g[b+88>>2];db(5536,(u=i,i=i+16|0,h[u>>3]=+g[b+84>>2],h[u+8>>3]=j,u)|0);j=+g[b+96>>2];db(5032,(u=i,i=i+16|0,h[u>>3]=+g[b+92>>2],h[u+8>>3]=j,u)|0);db(4760,(u=i,i=i+8|0,c[u>>2]=a[b+128|0]&1,u)|0);db(4488,(u=i,i=i+8|0,h[u>>3]=+g[b+124>>2],u)|0);db(4232,(u=i,i=i+8|0,h[u>>3]=+g[b+120>>2],u)|0);db(12768,(u=i,i=i+8|0,h[u>>3]=+g[b+68>>2],u)|0);db(12472,(u=i,i=i+8|0,h[u>>3]=+g[b+72>>2],u)|0);db(11904,(u=i,i=i+8|0,c[u>>2]=c[b+56>>2],u)|0);i=d;return}function g3(a){a=a|0;vl(a);return}function g4(){var a=0;a=vo(80)|0;b3(a);c[a+60>>2]=0;c[a+64>>2]=0;c[a+68>>2]=4192;c[a+72>>2]=4184;c[a+76>>2]=0;return a|0}function g5(a,b,c){a=a|0;b=b|0;c=c|0;dv(a,b,c);return}function g6(a){a=a|0;dx(a);return}function g7(a){a=a|0;dy(a|0,a);return}function g8(a){a=a|0;if((a|0)==0){return}vi(c[a+32>>2]|0);vi(c[a+44>>2]|0);vi(c[a+4>>2]|0);vl(a);return}function g9(a,b){a=a|0;b=b|0;dp(a,b);return}function ha(a,b){a=a|0;b=b|0;vp(a|0,b|0,60);return}function hb(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22936]|0)){a[22936]=1}br[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=408;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 408}function hc(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22944]|0)){a[22944]=1}br[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=400;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 400}function hd(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22816]|0)){a[22816]=1}bP[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=312;c[g>>2]=c[f>>2];c[g+4>>2]=b;i=e;return 312}function he(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+24>>2]&511](a);return}function hf(a){a=a|0;bq[c[(c[a>>2]|0)+16>>2]&511](a);return}function hg(a,b){a=a|0;b=+b;return+(+by[c[(c[a>>2]|0)+12>>2]&127](a,b))}function hh(a,c){a=a|0;c=c|0;var d=0,e=0;d=a+32|0;e=c;b[d>>1]=b[e>>1]|0;b[d+2>>1]=b[e+2>>1]|0;b[d+4>>1]=b[e+4>>1]|0;dI(a);return}function hi(){var a=0;a=vo(44)|0;b[a+32>>1]=1;b[a+34>>1]=-1;b[a+36>>1]=0;c[a+40>>2]=0;c[a+24>>2]=0;c[a+28>>2]=0;vq(a|0,0,16);return a|0}function hj(b){b=b|0;var d=0,e=0,f=0,h=0;d=vo(176)|0;e=d;c[e>>2]=19312;f=c[b+8>>2]|0;h=c[b+12>>2]|0;if((f|0)!=(h|0)){c[d+4>>2]=c[b>>2];c[d+8>>2]=0;c[d+12>>2]=0;c[d+48>>2]=f;c[d+52>>2]=h;c[d+56>>2]=0;a[d+61|0]=a[b+16|0]&1;a[d+60|0]=0;c[d+64>>2]=c[b+4>>2];vq(d+16|0,0,32);c[e>>2]=19912;e=b+20|0;h=d+80|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2];c[h+4>>2]=f;f=b+28|0;h=d+88|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2];c[h+4>>2]=e;g[d+104>>2]=+g[b+36>>2];g[d+68>>2]=+g[b+40>>2];g[d+72>>2]=+g[b+44>>2];g[d+100>>2]=0.0;g[d+96>>2]=0.0;g[d+76>>2]=0.0;return d|0}bc(7272,173,15744,9072);return 0}function hk(a,b){a=a|0;b=+b;g[a>>2]=b;return}function hl(d,e){d=d|0;e=e|0;var f=0,h=0,i=0;f=d+38|0;if((e&1|0)==(a[f]&1|0)){return}h=c[d+8>>2]|0;d=h+4|0;i=b[d>>1]|0;if((i&2)==0){b[d>>1]=i|2;g[h+144>>2]=0.0}a[f]=e&1;return}function hm(a,b){a=a|0;b=b|0;return(c[a+24>>2]|0)+(b*28&-1)|0}function hn(a,b){a=a|0;b=b|0;c[a+40>>2]=b;return}function ho(a){a=a|0;return a+32|0}function hp(b){b=b|0;return(a[b+38|0]&1)!=0|0}function hq(a){a=a|0;return c[(c[a+12>>2]|0)+4>>2]|0}function hr(a){a=a|0;return+(+g[a>>2])}function hs(a){a=a|0;return c[a+48>>2]|0}function ht(a){a=a|0;return c[a+52>>2]|0}function hu(a,b){a=a|0;b=+b;g[a+84>>2]=b;return}function hv(a){a=a|0;return c[a+64>>2]|0}function hw(a,b){a=a|0;b=+b;g[a+104>>2]=b;return}function hx(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function hy(a){a=a|0;return c[a+12>>2]|0}function hz(a){a=a|0;return+(+g[a+104>>2])}function hA(a){a=a|0;return a+76|0}function hB(a){a=a|0;return+(+g[a+84>>2])}function hC(a){a=a|0;return+(+g[a+88>>2])}function hD(b){b=b|0;return(a[b+61|0]&1)!=0|0}function hE(a,d){a=a|0;d=d|0;var e=0,f=0,h=0;e=c[a+52>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)==0){b[f>>1]=h|2;g[e+144>>2]=0.0}e=d;d=a+76|0;a=c[e+4>>2]|0;c[d>>2]=c[e>>2];c[d+4>>2]=a;return}function hF(a){a=a|0;return c[a+4>>2]|0}function hG(a,b){a=a|0;b=+b;g[a+88>>2]=b;return}function hH(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)!=0;return d|0}function hI(a){a=a|0;return c[a+48>>2]|0}function hJ(a){a=a|0;return c[a+4>>2]|0}function hK(b){b=b|0;var d=0,e=0;if(!(a[22832]|0)){a[22832]=1}d=b+76|0;b=c[d+4>>2]|0;e=24;c[e>>2]=c[d>>2];c[e+4>>2]=b;return 24}function hL(b){b=b|0;var d=0,e=0;if(!(a[22840]|0)){a[22840]=1}d=b+68|0;b=c[d+4>>2]|0;e=16;c[e>>2]=c[d>>2];c[e+4>>2]=b;return 16}function hM(a){a=a|0;return c[a+64>>2]|0}function hN(a){a=a|0;return c[a+52>>2]|0}function hO(b){b=b|0;return(a[b+61|0]&1)!=0|0}function hP(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function hQ(a){a=a|0;return c[a+12>>2]|0}function hR(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)!=0;return d|0}function hS(a){a=a|0;return+(+g[a+112>>2])}function hT(a){a=a|0;var b=0,d=0.0,e=0,f=0.0,h=0.0,i=0.0,j=0,k=0.0;b=c[a>>2]|0;if((b|0)==-1){d=0.0;return+d}e=c[a+4>>2]|0;f=(+g[e+(b*36&-1)+8>>2]- +g[e+(b*36&-1)>>2]+(+g[e+(b*36&-1)+12>>2]- +g[e+(b*36&-1)+4>>2]))*2.0;b=c[a+12>>2]|0;if((b|0)>0){h=0.0;a=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<0){i=h}else{i=h+(+g[e+(a*36&-1)+8>>2]- +g[e+(a*36&-1)>>2]+(+g[e+(a*36&-1)+12>>2]- +g[e+(a*36&-1)+4>>2]))*2.0}j=a+1|0;if((j|0)<(b|0)){h=i;a=j}else{k=i;break}}}else{k=0.0}d=k/f;return+d}function hU(a){a=a|0;var b=0,d=0;b=c[a>>2]|0;if((b|0)==-1){d=0;return d|0}d=c[(c[a+4>>2]|0)+(b*36&-1)+32>>2]|0;return d|0}function hV(a){a=a|0;return c[a+28>>2]|0}function hW(a,b){a=a|0;b=b|0;var d=0;d=c[a+12>>2]|0;bP[c[(c[d>>2]|0)+28>>2]&127](d,b,+g[a>>2]);return}function hX(a,b){a=a|0;b=b|0;var d=0;d=c[a+12>>2]|0;return bx[c[(c[d>>2]|0)+16>>2]&127](d,(c[a+8>>2]|0)+12|0,b)|0}function hY(a){a=a|0;if((a|0)==0){return}vl(a);return}function hZ(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;f=c[a+12>>2]|0;return bK[c[(c[f>>2]|0)+20>>2]&127](f,b,d,(c[a+8>>2]|0)+12|0,e)|0}function h_(a){a=a|0;dI(a);return}function h$(a,b){a=a|0;b=b|0;dJ(a,b);return}function h0(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23e3]|0)){a[23e3]=1}br[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=224;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 224}function h1(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23008]|0)){a[23008]=1}br[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=136;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 136}function h2(a){a=a|0;var b=0;b=vo(168)|0;fv(b,a);return b|0}function h3(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22856]|0)){a[22856]=1}bP[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=40;c[g>>2]=c[f>>2];c[g+4>>2]=b;i=e;return 40}function h4(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+24>>2]&511](a);return}function h5(a){a=a|0;bq[c[(c[a>>2]|0)+16>>2]&511](a);return}function h6(a,b){a=a|0;b=+b;return+(+by[c[(c[a>>2]|0)+12>>2]&127](a,b))}function h7(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+24>>2]&511](a);return}function h8(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22960]|0)){a[22960]=1}br[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=32;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 32}function h9(a,b){a=a|0;b=+b;return+(+by[c[(c[a>>2]|0)+12>>2]&127](a,b))}function ia(a){a=a|0;bq[c[(c[a>>2]|0)+16>>2]&511](a);return}function ib(a){a=a|0;var b=0,d=0.0,e=0.0,f=0.0,h=0.0,i=0,j=0.0,k=0.0;b=c[a+52>>2]|0;d=+g[b+24>>2];e=+g[a+100>>2];f=+g[b+20>>2];h=+g[a+104>>2];i=a+76|0;j=+g[b+12>>2]+(d*e-f*h)- +g[i>>2];k=e*f+d*h+ +g[b+16>>2]- +g[i+4>>2];return+(+P(+(j*j+k*k)))}function ic(a){a=a|0;var b=0,d=0.0,e=0.0,f=0.0,h=0.0,i=0,j=0.0,k=0.0;b=c[a+48>>2]|0;d=+g[b+24>>2];e=+g[a+92>>2];f=+g[b+20>>2];h=+g[a+96>>2];i=a+68|0;j=+g[b+12>>2]+(d*e-f*h)- +g[i>>2];k=e*f+d*h+ +g[b+16>>2]- +g[i+4>>2];return+(+P(+(j*j+k*k)))}function id(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22952]|0)){a[22952]=1}br[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=8;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 8}function ie(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22824]|0)){a[22824]=1}bP[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=392;c[g>>2]=c[f>>2];c[g+4>>2]=b;i=e;return 392}function ig(a){a=a|0;var b=0;b=vo(196)|0;fJ(b,a);return b|0}function ih(a){a=a|0;if((a|0)==0){return}vi(c[a+32>>2]|0);vi(c[a+44>>2]|0);vi(c[a+4>>2]|0);vl(a);return}function ii(){var a=0;a=vo(60)|0;b3(a);return a|0}function ij(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=a+40|0;e=c[d>>2]|0;f=a+36|0;g=a+32|0;if((e|0)==(c[f>>2]|0)){a=c[g>>2]|0;c[f>>2]=e<<1;f=vh(e<<3)|0;c[g>>2]=f;h=a;vp(f|0,h|0,c[d>>2]<<2);vi(h);i=c[d>>2]|0}else{i=e}c[(c[g>>2]|0)+(i<<2)>>2]=b;c[d>>2]=(c[d>>2]|0)+1;return}function ik(a,b,c){a=a|0;b=b|0;c=c|0;return b4(a,b,c)|0}function il(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if(!(cn(a|0,b,d,e)|0)){return}e=a+40|0;d=c[e>>2]|0;f=a+36|0;g=a+32|0;if((d|0)==(c[f>>2]|0)){a=c[g>>2]|0;c[f>>2]=d<<1;f=vh(d<<3)|0;c[g>>2]=f;h=a;vp(f|0,h|0,c[e>>2]<<2);vi(h);i=c[e>>2]|0}else{i=d}c[(c[g>>2]|0)+(i<<2)>>2]=b;c[e>>2]=(c[e>>2]|0)+1;return}function im(a,b){a=a|0;b=b|0;do{if((b|0)>-1){if((c[a+12>>2]|0)<=(b|0)){break}return(c[a+4>>2]|0)+(b*36&-1)|0}}while(0);bc(10360,159,14456,9904);return 0}function io(a,b){a=a|0;b=b|0;do{if((b|0)>-1){if((c[a+12>>2]|0)<=(b|0)){break}return c[(c[a+4>>2]|0)+(b*36&-1)+16>>2]|0}}while(0);bc(10360,153,14408,9904);return 0}function ip(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;b=c[a+12>>2]|0;if((b|0)<=0){d=0;return d|0}e=c[a+4>>2]|0;a=0;f=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<2){g=f}else{h=c[e+(a*36&-1)+24>>2]|0;if((h|0)==-1){i=429;break}j=(c[e+((c[e+(a*36&-1)+28>>2]|0)*36&-1)+32>>2]|0)-(c[e+(h*36&-1)+32>>2]|0)|0;h=(j|0)>0?j:-j|0;g=(f|0)>(h|0)?f:h}h=a+1|0;if((h|0)<(b|0)){a=h;f=g}else{d=g;i=433;break}}if((i|0)==429){bc(11392,686,14312,7360);return 0}else if((i|0)==433){return d|0}return 0}function iq(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;if((b|0)<=-1){bc(10360,159,14456,9904);return 0}e=c[a+12>>2]|0;if((e|0)<=(b|0)){bc(10360,159,14456,9904);return 0}f=c[a+4>>2]|0;if((d|0)>-1&(e|0)>(d|0)){return(+g[f+(d*36&-1)>>2]- +g[f+(b*36&-1)+8>>2]>0.0|+g[f+(d*36&-1)+4>>2]- +g[f+(b*36&-1)+12>>2]>0.0|+g[f+(b*36&-1)>>2]- +g[f+(d*36&-1)+8>>2]>0.0|+g[f+(b*36&-1)+4>>2]- +g[f+(d*36&-1)+12>>2]>0.0)^1|0}else{bc(10360,159,14456,9904);return 0}return 0}function ir(b,c){b=b|0;c=c|0;a[b+102994|0]=c&1;return}function is(a){a=a|0;var b=0,d=0.0,e=0,f=0.0,h=0.0,i=0.0,j=0,k=0.0;b=c[a+102872>>2]|0;if((b|0)==-1){d=0.0;return+d}e=c[a+102876>>2]|0;f=(+g[e+(b*36&-1)+8>>2]- +g[e+(b*36&-1)>>2]+(+g[e+(b*36&-1)+12>>2]- +g[e+(b*36&-1)+4>>2]))*2.0;b=c[a+102884>>2]|0;if((b|0)>0){h=0.0;a=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<0){i=h}else{i=h+(+g[e+(a*36&-1)+8>>2]- +g[e+(a*36&-1)>>2]+(+g[e+(a*36&-1)+12>>2]- +g[e+(a*36&-1)+4>>2]))*2.0}j=a+1|0;if((j|0)<(b|0)){h=i;a=j}else{k=i;break}}}else{k=0.0}d=k/f;return+d}function it(a){a=a|0;var b=0,d=0;b=c[a+102872>>2]|0;if((b|0)==-1){d=0;return d|0}d=c[(c[a+102876>>2]|0)+(b*36&-1)+32>>2]|0;return d|0}function iu(a){a=a|0;return a+102996|0}function iv(b){b=b|0;return(a[b+102994|0]&1)!=0|0}function iw(a){a=a|0;return a+102872|0}function ix(a,b){a=a|0;b=b|0;c[a+102944>>2]=b;return}function iy(b,c){b=b|0;c=c|0;a[b+102993|0]=c&1;return}function iz(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+102968|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function iA(a){a=a|0;return c[a+102960>>2]|0}function iB(a){a=a|0;return(c[a+102868>>2]&4|0)!=0|0}function iC(b){b=b|0;return(a[b+102993|0]&1)!=0|0}function iD(a){a=a|0;return c[a+102956>>2]|0}function iE(a){a=a|0;return c[a+102952>>2]|0}function iF(a,b){a=a|0;b=b|0;c[a+102980>>2]=b;return}function iG(a){a=a|0;return c[a+102964>>2]|0}function iH(a){a=a|0;var b=0,d=0;b=c[a+102952>>2]|0;if((b|0)==0){return}else{d=b}do{g[d+76>>2]=0.0;g[d+80>>2]=0.0;g[d+84>>2]=0.0;d=c[d+96>>2]|0;}while((d|0)!=0);return}function iI(b){b=b|0;return(a[b+102992|0]&1)!=0|0}function iJ(d,e){d=d|0;e=e|0;var f=0,h=0;f=d+102976|0;if((e&1|0)==(a[f]&1|0)){return}a[f]=e&1;if(e){return}e=c[d+102952>>2]|0;if((e|0)==0){return}else{h=e}do{e=h+4|0;d=b[e>>1]|0;if((d&2)==0){b[e>>1]=d|2;g[h+144>>2]=0.0}h=c[h+96>>2]|0;}while((h|0)!=0);return}function iK(b){b=b|0;return(a[b+102976|0]&1)!=0|0}function iL(a){a=a|0;return c[a+102900>>2]|0}function iM(a){a=a|0;return(c[a+102868>>2]&2|0)!=0|0}function iN(a){a=a|0;return c[a+102932>>2]|0}function iO(a,b){a=a|0;b=b|0;c[a+102984>>2]=b;return}function iP(a,b){a=a|0;b=b|0;var d=0;d=a+102868|0;a=c[d>>2]|0;c[d>>2]=b?a|4:a&-5;return}function iQ(b){b=b|0;var d=0,e=0;if(!(a[23096]|0)){a[23096]=1}d=b+102968|0;b=c[d+4>>2]|0;e=384;c[e>>2]=c[d>>2];c[e+4>>2]=b;return 384}function iR(a){a=a|0;return c[a+102936>>2]|0}function iS(b,c){b=b|0;c=c|0;a[b+102992|0]=c&1;return}function iT(a,b){a=a|0;b=b|0;c[a+102940>>2]=b;return}function iU(a){a=a|0;return c[a+48>>2]|0}function iV(a){a=a|0;return c[a+52>>2]|0}function iW(a){a=a|0;return c[a+64>>2]|0}function iX(a){a=a|0;return a+84|0}function iY(a){a=a|0;return+(+g[a+120>>2])}function iZ(a){a=a|0;return c[a+12>>2]|0}function i_(a){a=a|0;return a+68|0}function i$(a,d){a=a|0;d=+d;var e=0,f=0,h=0,i=0;e=c[a+48>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)==0){b[f>>1]=h|2;g[e+144>>2]=0.0}e=c[a+52>>2]|0;h=e+4|0;f=b[h>>1]|0;if((f&2)!=0){i=a+132|0;g[i>>2]=d;return}b[h>>1]=f|2;g[e+144>>2]=0.0;i=a+132|0;g[i>>2]=d;return}function i0(a){a=a|0;return a+76|0}function i1(a){a=a|0;return+(+g[a+132>>2])}function i2(a,d){a=a|0;d=+d;var e=0,f=0,h=0,i=0;e=c[a+48>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)==0){b[f>>1]=h|2;g[e+144>>2]=0.0}e=c[a+52>>2]|0;h=e+4|0;f=b[h>>1]|0;if((f&2)!=0){i=a+128|0;g[i>>2]=d;return}b[h>>1]=f|2;g[e+144>>2]=0.0;i=a+128|0;g[i>>2]=d;return}function i3(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0;f=d+136|0;if((e&1|0)==(a[f]&1|0)){return}h=c[d+48>>2]|0;i=h+4|0;j=b[i>>1]|0;if((j&2)==0){b[i>>1]=j|2;g[h+144>>2]=0.0}h=c[d+52>>2]|0;j=h+4|0;i=b[j>>1]|0;if((i&2)==0){b[j>>1]=i|2;g[h+144>>2]=0.0}a[f]=e&1;g[d+112>>2]=0.0;return}function i4(b){b=b|0;return(a[b+137|0]&1)!=0|0}function i5(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function i6(a){a=a|0;return+(+g[a+128>>2])}function i7(b){b=b|0;return(a[b+61|0]&1)!=0|0}function i8(a){a=a|0;var b=0,d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0;b=c[a+48>>2]|0;d=c[a+52>>2]|0;e=+g[a+68>>2]- +g[b+28>>2];f=+g[a+72>>2]- +g[b+32>>2];h=+g[b+24>>2];i=+g[b+20>>2];j=e*h-f*i;k=h*f+e*i;e=+g[a+76>>2]- +g[d+28>>2];f=+g[a+80>>2]- +g[d+32>>2];l=+g[d+24>>2];m=+g[d+20>>2];n=e*l-f*m;o=l*f+e*m;m=+g[a+84>>2];e=+g[a+88>>2];f=h*m-i*e;l=i*m+h*e;a=b+64|0;p=d+64|0;e=+g[b+72>>2];h=+g[d+72>>2];m=-0.0-e;return+((o+ +g[d+48>>2]-(k+ +g[b+48>>2]))*f*e+(n+ +g[d+44>>2]-(j+ +g[b+44>>2]))*l*m+(l*(+g[p+4>>2]+n*h- +g[a+4>>2]-j*e)+f*(+g[p>>2]+o*(-0.0-h)- +g[a>>2]-k*m)))}function i9(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0;f=c[d+48>>2]|0;h=f+4|0;i=b[h>>1]|0;if((i&2)==0){b[h>>1]=i|2;g[f+144>>2]=0.0}f=c[d+52>>2]|0;i=f+4|0;h=b[i>>1]|0;if((h&2)!=0){j=d+137|0;k=e&1;a[j]=k;return}b[i>>1]=h|2;g[f+144>>2]=0.0;j=d+137|0;k=e&1;a[j]=k;return}function ja(a){a=a|0;return+(+g[a+100>>2])}function jb(a,b){a=a|0;b=+b;return+(+g[a+116>>2]*b)}function jc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=c[a+40>>2]|0;e=a+32|0;f=0;while(1){if((f|0)>=(d|0)){break}g=(c[e>>2]|0)+(f<<2)|0;if((c[g>>2]|0)==(b|0)){h=549;break}else{f=f+1|0}}if((h|0)==549){c[g>>2]=-1}g=a+28|0;c[g>>2]=(c[g>>2]|0)-1;cl(a|0,b);return}function jd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;g=a+102872|0;c[f>>2]=g;c[f+4>>2]=b;d8(g|0,f,d);i=e;return}function je(a){a=a|0;dZ(a);return}function jf(a,b){a=a|0;b=b|0;dR(a,b);return}function jg(a){a=a|0;var b=0;b=vo(103028)|0;dO(b,a);return b|0}function jh(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;dV(a,b,c,d);return}function ji(a,b){a=a|0;b=b|0;dQ(a,b);return}function jj(a,b){a=a|0;b=b|0;return dS(a,b)|0}function jk(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,k=0;f=i;i=i+32|0;h=f|0;j=f+8|0;k=a+102872|0;c[h>>2]=k;c[h+4>>2]=b;g[j+16>>2]=1.0;b=d;d=j;a=c[b+4>>2]|0;c[d>>2]=c[b>>2];c[d+4>>2]=a;a=e;e=j+8|0;d=c[a+4>>2]|0;c[e>>2]=c[a>>2];c[e+4>>2]=d;d6(k|0,h,j);i=f;return}function jl(a){a=a|0;if((a|0)==0){return}dP(a);vl(a);return}function jm(a){a=a|0;dX(a);return}function jn(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22896]|0)){a[22896]=1}br[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=376;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 376}function jo(a){a=a|0;var b=0;b=vo(256)|0;fx(b,a);return b|0}function jp(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22792]|0)){a[22792]=1}bP[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=368;c[g>>2]=c[f>>2];c[g+4>>2]=b;i=e;return 368}function jq(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+24>>2]&511](a);return}function jr(a){a=a|0;bq[c[(c[a>>2]|0)+16>>2]&511](a);return}function js(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;b=c[a+102884>>2]|0;if((b|0)<=0){d=0;return d|0}e=c[a+102876>>2]|0;a=0;f=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<2){g=f}else{h=c[e+(a*36&-1)+24>>2]|0;if((h|0)==-1){i=588;break}j=(c[e+((c[e+(a*36&-1)+28>>2]|0)*36&-1)+32>>2]|0)-(c[e+(h*36&-1)+32>>2]|0)|0;h=(j|0)>0?j:-j|0;g=(f|0)>(h|0)?f:h}h=a+1|0;if((h|0)<(b|0)){a=h;f=g}else{d=g;i=593;break}}if((i|0)==593){return d|0}else if((i|0)==588){bc(11392,686,14312,7360);return 0}return 0}function jt(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;if((c[a+102868>>2]&2|0)!=0){bc(10624,109,15664,12392);return 0}d=df(a|0,152)|0;if((d|0)==0){e=0}else{f=d;dh(f,b,a);e=f}c[e+92>>2]=0;f=a+102952|0;c[e+96>>2]=c[f>>2];b=c[f>>2]|0;if((b|0)!=0){c[b+92>>2]=e}c[f>>2]=e;f=a+102960|0;c[f>>2]=(c[f>>2]|0)+1;return e|0}function ju(a){a=a|0;return 1}function jv(a,b){a=a|0;b=b|0;return 0}function jw(a){a=a|0;var b=0,d=0.0,e=0.0,f=0.0,h=0.0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0;b=c[a+48>>2]|0;d=+g[b+24>>2];e=+g[a+68>>2];f=+g[b+20>>2];h=+g[a+72>>2];i=c[a+52>>2]|0;j=+g[i+24>>2];k=+g[a+76>>2];l=+g[i+20>>2];m=+g[a+80>>2];n=+g[a+84>>2];o=+g[a+88>>2];return+((+g[i+12>>2]+(j*k-l*m)-(+g[b+12>>2]+(d*e-f*h)))*(d*n-f*o)+(k*l+j*m+ +g[i+16>>2]-(e*f+d*h+ +g[b+16>>2]))*(f*n+d*o))}function jx(a){a=a|0;return c[a+4>>2]|0}function jy(b){b=b|0;return(a[b+136|0]&1)!=0|0}function jz(a){a=a|0;return+(+g[a+124>>2])}function jA(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)!=0;return d|0}function jB(a){a=a|0;return c[a+4>>2]|0}function jC(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function jD(a){a=a|0;return+(+g[a+8>>2])}function jE(a,b){a=a|0;b=b|0;return a+12|0}function jF(a,b){a=a|0;b=b|0;return a+12|0}function jG(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+12|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function jH(a){a=a|0;return a+12|0}function jI(a){a=a|0;return c[a+48>>2]|0}function jJ(a){a=a|0;return c[a+52>>2]|0}function jK(a){a=a|0;return c[a+64>>2]|0}function jL(a){a=a|0;return a+92|0}function jM(a,b){a=a|0;b=+b;g[a+72>>2]=b;return}function jN(a){a=a|0;return c[a+12>>2]|0}function jO(a){a=a|0;return+(+g[a+68>>2])}function jP(a){a=a|0;return a+76|0}function jQ(a,d){a=a|0;d=+d;var e=0,f=0,h=0,i=0;e=c[a+48>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)==0){b[f>>1]=h|2;g[e+144>>2]=0.0}e=c[a+52>>2]|0;h=e+4|0;f=b[h>>1]|0;if((f&2)!=0){i=a+124|0;g[i>>2]=d;return}b[h>>1]=f|2;g[e+144>>2]=0.0;i=a+124|0;g[i>>2]=d;return}function jR(a){a=a|0;return a+84|0}function jS(a){a=a|0;return+(+g[a+124>>2])}function jT(a,b){a=a|0;b=+b;return+(+g[a+112>>2]*b)}function jU(b){b=b|0;return(a[b+128|0]&1)!=0|0}function jV(a){a=a|0;var b=0,d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0;b=c[a+48>>2]|0;d=c[a+52>>2]|0;e=+g[b+24>>2];f=+g[a+76>>2];h=+g[b+20>>2];i=+g[a+80>>2];j=+g[d+24>>2];k=+g[a+84>>2];l=+g[d+20>>2];m=+g[a+88>>2];n=+g[a+92>>2];o=+g[a+96>>2];return+((+g[d+12>>2]+(j*k-l*m)-(+g[b+12>>2]+(e*f-h*i)))*(e*n-h*o)+(k*l+j*m+ +g[d+16>>2]-(f*h+e*i+ +g[b+16>>2]))*(h*n+e*o))}function jW(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function jX(a){a=a|0;return+(+g[a+72>>2])}function jY(a,d){a=a|0;d=+d;var e=0,f=0,h=0,i=0;e=c[a+48>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)==0){b[f>>1]=h|2;g[e+144>>2]=0.0}e=c[a+52>>2]|0;h=e+4|0;f=b[h>>1]|0;if((f&2)!=0){i=a+120|0;g[i>>2]=d;return}b[h>>1]=f|2;g[e+144>>2]=0.0;i=a+120|0;g[i>>2]=d;return}function jZ(b){b=b|0;return(a[b+61|0]&1)!=0|0}function j_(a){a=a|0;return+(+g[(c[a+52>>2]|0)+72>>2]- +g[(c[a+48>>2]|0)+72>>2])}function j$(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0;f=c[d+48>>2]|0;h=f+4|0;i=b[h>>1]|0;if((i&2)==0){b[h>>1]=i|2;g[f+144>>2]=0.0}f=c[d+52>>2]|0;i=f+4|0;h=b[i>>1]|0;if((h&2)!=0){j=d+128|0;k=e&1;a[j]=k;return}b[i>>1]=h|2;g[f+144>>2]=0.0;j=d+128|0;k=e&1;a[j]=k;return}function j0(a){a=a|0;return+(+g[a+120>>2])}function j1(a){a=a|0;return c[a+4>>2]|0}function j2(a,b){a=a|0;b=+b;g[a+68>>2]=b;return}function j3(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)!=0;return d|0}function j4(a,b){a=a|0;b=b|0;var d=0;d=a+4|0;c[d>>2]=c[d>>2]|b;return}function j5(a,b){a=a|0;b=b|0;var d=0;d=a+4|0;c[d>>2]=c[d>>2]&(b^-1);return}function j6(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function j7(a){a=a|0;return c[a+4>>2]|0}function j8(a){a=a|0;return c[a+12>>2]|0}function j9(a){a=a|0;return c[a+48>>2]|0}function ka(a){a=a|0;return c[a+52>>2]|0}function kb(a){a=a|0;return c[a+64>>2]|0}function kc(a){a=a|0;return c[a+4>>2]|0}function kd(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function ke(b){b=b|0;return(a[b+61|0]&1)!=0|0}function kf(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)!=0;return d|0}function kg(a){a=a|0;return c[a+68>>2]|0}function kh(a){a=a|0;return c[a+72>>2]|0}function ki(a,b){a=a|0;b=+b;return+(+by[c[(c[a>>2]|0)+12>>2]&127](a,b))}function kj(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22888]|0)){a[22888]=1}br[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=360;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 360}function kk(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+4>>2]&511](a);return}function kl(a,b,d){a=a|0;b=b|0;d=+d;bP[c[(c[a>>2]|0)+28>>2]&127](a,b,d);return}function km(a,b){a=a|0;b=b|0;return bH[c[(c[a>>2]|0)+8>>2]&255](a,b)|0}function kn(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return bK[c[(c[a>>2]|0)+20>>2]&127](a,b,d,e,f)|0}function ko(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bQ[c[(c[a>>2]|0)+24>>2]&127](a,b,d,e);return}function kp(a){a=a|0;return bs[c[(c[a>>2]|0)+12>>2]&1023](a)|0}function kq(a,b,d){a=a|0;b=b|0;d=d|0;return bx[c[(c[a>>2]|0)+16>>2]&127](a,b,d)|0}function kr(){var a=0;a=vo(20)|0;c[a>>2]=20136;vq(a+4|0,0,16);return a|0}function ks(a,b){a=a|0;b=b|0;aV(a|0,b|0);return}function kt(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22984]|0)){a[22984]=1}br[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=352;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 352}function ku(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22992]|0)){a[22992]=1}br[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=344;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 344}function kv(a){a=a|0;var b=0;b=vo(224)|0;gn(b,a);return b|0}function kw(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22848]|0)){a[22848]=1}bP[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=336;c[g>>2]=c[f>>2];c[g+4>>2]=b;i=e;return 336}function kx(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+24>>2]&511](a);return}function ky(a){a=a|0;bq[c[(c[a>>2]|0)+16>>2]&511](a);return}function kz(a,b){a=a|0;b=+b;return+(+by[c[(c[a>>2]|0)+12>>2]&127](a,b))}function kA(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+4>>2]&511](a);return}function kB(a,b){a=a|0;b=b|0;br[c[(c[a>>2]|0)+28>>2]&511](a,b);return}function kC(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bQ[c[(c[a>>2]|0)+8>>2]&127](a,b,d,e);return}function kD(a,b,d,e,f){a=a|0;b=b|0;d=+d;e=e|0;f=f|0;bp[c[(c[a>>2]|0)+20>>2]&63](a,b,d,e,f);return}function kE(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bQ[c[(c[a>>2]|0)+12>>2]&127](a,b,d,e);return}function kF(a,b,d,e){a=a|0;b=b|0;d=+d;e=e|0;bt[c[(c[a>>2]|0)+16>>2]&63](a,b,d,e);return}function kG(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bQ[c[(c[a>>2]|0)+24>>2]&127](a,b,d,e);return}function kH(){var a=0;a=vo(8)|0;c[a>>2]=19368;c[a+4>>2]=0;return a|0}function kI(a,b){a=a|0;b=+b;return+(+by[c[(c[a>>2]|0)+12>>2]&127](a,b))}function kJ(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23112]|0)){a[23112]=1}br[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=328;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 328}function kK(a){a=a|0;bq[c[(c[a>>2]|0)+16>>2]&511](a);return}function kL(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23104]|0)){a[23104]=1}br[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=320;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 320}function kM(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22968]|0)){a[22968]=1}bP[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=304;c[g>>2]=c[f>>2];c[g+4>>2]=b;i=e;return 304}function kN(a){a=a|0;var b=0;b=vo(276)|0;e6(b,a);return b|0}function kO(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23056]|0)){a[23056]=1}br[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=296;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 296}function kP(a,b){a=a|0;b=+b;return+(+by[c[(c[a>>2]|0)+12>>2]&127](a,b))}function kQ(a,d,e){a=a|0;d=+d;e=+e;var f=0,h=0,i=0,j=0;if(d>e){bc(6832,575,17248,11440)}f=a+120|0;do{if(+g[f>>2]==d){if(+g[a+124>>2]!=e){break}return}}while(0);h=c[a+48>>2]|0;i=h+4|0;j=b[i>>1]|0;if((j&2)==0){b[i>>1]=j|2;g[h+144>>2]=0.0}h=c[a+52>>2]|0;j=h+4|0;i=b[j>>1]|0;if((i&2)==0){b[j>>1]=i|2;g[h+144>>2]=0.0}g[f>>2]=d;g[a+124>>2]=e;g[a+112>>2]=0.0;return}function kR(a){a=a|0;return c[a+4>>2]|0}function kS(a){a=a|0;return c[a+64>>2]|0}function kT(a){a=a|0;return c[a+52>>2]|0}function kU(b){b=b|0;return(a[b+61|0]&1)!=0|0}function kV(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function kW(a){a=a|0;return c[a+48>>2]|0}function kX(a){a=a|0;return c[a+12>>2]|0}function kY(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)!=0;return d|0}function kZ(a){a=a|0;return+(+g[a+152>>2])}function k_(a){a=a|0;var b=0,d=0;b=c[a>>2]|0;if((b|0)==-1){d=0;return d|0}d=c[(c[a+4>>2]|0)+(b*36&-1)+32>>2]|0;return d|0}function k$(a){a=a|0;var b=0,d=0.0,e=0,f=0.0,h=0.0,i=0.0,j=0,k=0.0;b=c[a>>2]|0;if((b|0)==-1){d=0.0;return+d}e=c[a+4>>2]|0;f=(+g[e+(b*36&-1)+8>>2]- +g[e+(b*36&-1)>>2]+(+g[e+(b*36&-1)+12>>2]- +g[e+(b*36&-1)+4>>2]))*2.0;b=c[a+12>>2]|0;if((b|0)>0){h=0.0;a=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<0){i=h}else{i=h+(+g[e+(a*36&-1)+8>>2]- +g[e+(a*36&-1)>>2]+(+g[e+(a*36&-1)+12>>2]- +g[e+(a*36&-1)+4>>2]))*2.0}j=a+1|0;if((j|0)<(b|0)){h=i;a=j}else{k=i;break}}}else{k=0.0}d=k/f;return+d}function k0(a){a=a|0;return c[a+48>>2]|0}function k1(a){a=a|0;return c[a+52>>2]|0}function k2(a,b){a=a|0;b=+b;g[a+68>>2]=b;return}function k3(a){a=a|0;return c[a+64>>2]|0}function k4(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function k5(a){a=a|0;return c[a+12>>2]|0}function k6(a){a=a|0;return a+80|0}function k7(a){a=a|0;return a+88|0}function k8(a){a=a|0;return+(+g[a+68>>2])}function k9(a){a=a|0;return+(+g[a+72>>2])}function la(b){b=b|0;return(a[b+61|0]&1)!=0|0}function lb(a){a=a|0;return+(+g[a+96>>2])}function lc(a){a=a|0;return c[a+4>>2]|0}function ld(a,b){a=a|0;b=+b;g[a+72>>2]=b;return}function le(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)!=0;return d|0}function lf(a){a=a|0;return c[a+48>>2]|0}function lg(a){a=a|0;return c[a+52>>2]|0}function lh(a){a=a|0;return c[a+64>>2]|0}function li(a){a=a|0;return+(+g[a+120>>2])}function lj(a){a=a|0;return c[a+12>>2]|0}function lk(a){a=a|0;return a+68|0}function ll(a,d){a=a|0;d=+d;var e=0,f=0,h=0,i=0;e=c[a+48>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)==0){b[f>>1]=h|2;g[e+144>>2]=0.0}e=c[a+52>>2]|0;h=e+4|0;f=b[h>>1]|0;if((f&2)!=0){i=a+108|0;g[i>>2]=d;return}b[h>>1]=f|2;g[e+144>>2]=0.0;i=a+108|0;g[i>>2]=d;return}function lm(a){a=a|0;return a+76|0}function ln(a){a=a|0;return+(+g[(c[a+52>>2]|0)+56>>2]- +g[(c[a+48>>2]|0)+56>>2]- +g[a+116>>2])}function lo(a){a=a|0;return+(+g[a+108>>2])}function lp(a,b){a=a|0;b=+b;return+(+g[a+96>>2]*b)}function lq(b){b=b|0;return(a[b+112|0]&1)!=0|0}function lr(a){a=a|0;bq[c[(c[a>>2]|0)+16>>2]&511](a);return}function ls(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+24>>2]&511](a);return}function lt(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23048]|0)){a[23048]=1}br[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=288;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 288}function lu(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22880]|0)){a[22880]=1}bP[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=280;c[g>>2]=c[f>>2];c[g+4>>2]=b;i=e;return 280}function lv(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=+f;return+(+bI[c[(c[a>>2]|0)+8>>2]&63](a,b,d,e,f))}function lw(){var a=0;a=vo(4)|0;c[a>>2]=19608;return a|0}function lx(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+4>>2]&511](a);return}function ly(a){a=a|0;if((a|0)==0){return}vi(c[a+4>>2]|0);vl(a);return}function lz(){var a=0,b=0,d=0,e=0,f=0,g=0;a=vo(28)|0;b=a;c[a>>2]=-1;c[a+12>>2]=16;c[a+8>>2]=0;d=vh(576)|0;e=d;c[a+4>>2]=e;vq(d|0,0,576);f=0;while(1){g=f+1|0;c[e+(f*36&-1)+20>>2]=g;c[e+(f*36&-1)+32>>2]=-1;if((g|0)<15){f=g}else{break}}c[d+560>>2]=-1;c[d+572>>2]=-1;c[a+16>>2]=0;c[a+20>>2]=0;c[a+24>>2]=0;return b|0}function lA(a){a=a|0;ct(a);return}function lB(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0.0;e=cj(a)|0;f=a+4|0;h=(c[f>>2]|0)+(e*36&-1)|0;i=+(+g[b+4>>2]+-.10000000149011612);g[h>>2]=+g[b>>2]+-.10000000149011612;g[h+4>>2]=i;h=(c[f>>2]|0)+(e*36&-1)+8|0;i=+(+g[b+12>>2]+.10000000149011612);g[h>>2]=+g[b+8>>2]+.10000000149011612;g[h+4>>2]=i;c[(c[f>>2]|0)+(e*36&-1)+16>>2]=d;c[(c[f>>2]|0)+(e*36&-1)+32>>2]=0;ck(a,e);return e|0}function lC(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return cn(a,b,c,d)|0}function lD(a){a=a|0;cs(a);return}function lE(a,b){a=a|0;b=b|0;cl(a,b);return}function lF(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23016]|0)){a[23016]=1}br[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=272;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 272}function lG(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23024]|0)){a[23024]=1}br[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=264;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 264}function lH(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22864]|0)){a[22864]=1}bP[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=256;c[g>>2]=c[f>>2];c[g+4>>2]=b;i=e;return 256}function lI(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+24>>2]&511](a);return}function lJ(a){a=a|0;bq[c[(c[a>>2]|0)+16>>2]&511](a);return}function lK(a,b){a=a|0;b=+b;return+(+by[c[(c[a>>2]|0)+12>>2]&127](a,b))}function lL(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22912]|0)){a[22912]=1}br[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=248;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 248}function lM(a,b){a=a|0;b=+b;if(b==b&!(C=0.0,C!=C)&b>+-p&b<+p){g[a+152>>2]=b;return}else{bc(7384,398,18616,6992)}}function lN(a,b){a=a|0;b=b|0;do{if((b|0)>-1){if((c[a+12>>2]|0)<=(b|0)){break}return(c[a+4>>2]|0)+(b*36&-1)|0}}while(0);bc(10360,159,14456,9904);return 0}function lO(a,b){a=a|0;b=b|0;do{if((b|0)>-1){if((c[a+12>>2]|0)<=(b|0)){break}return c[(c[a+4>>2]|0)+(b*36&-1)+16>>2]|0}}while(0);bc(10360,153,14408,9904);return 0}function lP(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;b=c[a+12>>2]|0;if((b|0)<=0){d=0;return d|0}e=c[a+4>>2]|0;a=0;f=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<2){g=f}else{h=c[e+(a*36&-1)+24>>2]|0;if((h|0)==-1){i=891;break}j=(c[e+((c[e+(a*36&-1)+28>>2]|0)*36&-1)+32>>2]|0)-(c[e+(h*36&-1)+32>>2]|0)|0;h=(j|0)>0?j:-j|0;g=(f|0)>(h|0)?f:h}h=a+1|0;if((h|0)<(b|0)){a=h;f=g}else{d=g;i=895;break}}if((i|0)==891){bc(11392,686,14312,7360);return 0}else if((i|0)==895){return d|0}return 0}function lQ(b){b=b|0;var d=0,e=0,f=0,h=0;d=vo(208)|0;e=d;c[e>>2]=19312;f=c[b+8>>2]|0;h=c[b+12>>2]|0;if((f|0)!=(h|0)){c[d+4>>2]=c[b>>2];c[d+8>>2]=0;c[d+12>>2]=0;c[d+48>>2]=f;c[d+52>>2]=h;c[d+56>>2]=0;a[d+61|0]=a[b+16|0]&1;a[d+60|0]=0;c[d+64>>2]=c[b+4>>2];vq(d+16|0,0,32);c[e>>2]=20344;e=b+20|0;h=d+80|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2];c[h+4>>2]=f;f=b+28|0;h=d+88|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2];c[h+4>>2]=e;g[d+96>>2]=+g[b+36>>2];g[d+68>>2]=+g[b+40>>2];g[d+72>>2]=+g[b+44>>2];g[d+104>>2]=0.0;g[d+108>>2]=0.0;g[d+112>>2]=0.0;return d|0}bc(7272,173,15744,9072);return 0}function lR(b){b=b|0;var d=0,e=0,f=0,h=0;d=vo(228)|0;e=d;c[e>>2]=19312;f=c[b+8>>2]|0;h=c[b+12>>2]|0;if((f|0)!=(h|0)){c[d+4>>2]=c[b>>2];c[d+8>>2]=0;c[d+12>>2]=0;c[d+48>>2]=f;c[d+52>>2]=h;c[d+56>>2]=0;a[d+61|0]=a[b+16|0]&1;a[d+60|0]=0;c[d+64>>2]=c[b+4>>2];vq(d+16|0,0,32);c[e>>2]=19768;e=b+20|0;h=d+68|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2];c[h+4>>2]=f;f=b+28|0;h=d+76|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2];c[h+4>>2]=e;g[d+116>>2]=+g[b+36>>2];vq(d+84|0,0,16);g[d+120>>2]=+g[b+44>>2];g[d+124>>2]=+g[b+48>>2];g[d+104>>2]=+g[b+60>>2];g[d+108>>2]=+g[b+56>>2];a[d+112|0]=a[b+40|0]&1;a[d+100|0]=a[b+52|0]&1;c[d+224>>2]=0;return d|0}bc(7272,173,15744,9072);return 0}function lS(a){a=a|0;return}function lT(a){a=a|0;return+0.0}function lU(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0;f=d+112|0;if((e&1|0)==(a[f]&1|0)){return}h=c[d+48>>2]|0;i=h+4|0;j=b[i>>1]|0;if((j&2)==0){b[i>>1]=j|2;g[h+144>>2]=0.0}h=c[d+52>>2]|0;j=h+4|0;i=b[j>>1]|0;if((i&2)==0){b[j>>1]=i|2;g[h+144>>2]=0.0}a[f]=e&1;g[d+92>>2]=0.0;return}function lV(b){b=b|0;return(a[b+100|0]&1)!=0|0}function lW(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function lX(a,d){a=a|0;d=+d;var e=0,f=0,h=0,i=0;e=c[a+48>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)==0){b[f>>1]=h|2;g[e+144>>2]=0.0}e=c[a+52>>2]|0;h=e+4|0;f=b[h>>1]|0;if((f&2)!=0){i=a+104|0;g[i>>2]=d;return}b[h>>1]=f|2;g[e+144>>2]=0.0;i=a+104|0;g[i>>2]=d;return}function lY(b){b=b|0;return(a[b+61|0]&1)!=0|0}function lZ(a){a=a|0;return+(+g[(c[a+52>>2]|0)+72>>2]- +g[(c[a+48>>2]|0)+72>>2])}function l_(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0;f=c[d+48>>2]|0;h=f+4|0;i=b[h>>1]|0;if((i&2)==0){b[h>>1]=i|2;g[f+144>>2]=0.0}f=c[d+52>>2]|0;i=f+4|0;h=b[i>>1]|0;if((h&2)!=0){j=d+100|0;k=e&1;a[j]=k;return}b[i>>1]=h|2;g[f+144>>2]=0.0;j=d+100|0;k=e&1;a[j]=k;return}function l$(a){a=a|0;return+(+g[a+116>>2])}function l0(a){a=a|0;return+(+g[a+104>>2])}function l1(a){a=a|0;return c[a+4>>2]|0}function l2(a){a=a|0;return+(+g[a+124>>2])}function l3(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)!=0;return d|0}function l4(a){a=a|0;return c[a+4>>2]|0}function l5(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function l6(a){a=a|0;return+(+g[a+8>>2])}function l7(a){a=a|0;return c[a+12>>2]|0}function l8(a){a=a|0;return c[a+16>>2]|0}function l9(b,d){b=b|0;d=d|0;var e=0,f=0;e=d;d=b+20|0;f=c[e+4>>2]|0;c[d>>2]=c[e>>2];c[d+4>>2]=f;a[b+36|0]=1;return}function ma(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function mb(b,d){b=b|0;d=d|0;var e=0,f=0;e=d;d=b+28|0;f=c[e+4>>2]|0;c[d>>2]=c[e>>2];c[d+4>>2]=f;a[b+37|0]=1;return}function mc(a,b){a=a|0;b=b|0;c[a+16>>2]=b;return}function md(a){a=a|0;return c[a+12>>2]|0}function me(a){a=a|0;return+(+g[a+84>>2])}function mf(a){a=a|0;return c[a+48>>2]|0}function mg(b){b=b|0;return(a[b+61|0]&1)!=0|0}function mh(a){a=a|0;return c[a+64>>2]|0}function mi(a){a=a|0;return c[a+4>>2]|0}function mj(a){a=a|0;return c[a+52>>2]|0}function mk(a){a=a|0;return a+68|0}function ml(a,b){a=a|0;b=+b;g[a+84>>2]=b;return}function mm(a){a=a|0;return a+76|0}function mn(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function mo(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22800]|0)){a[22800]=1}bP[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=240;c[g>>2]=c[f>>2];c[g+4>>2]=b;i=e;return 240}function mp(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+24>>2]&511](a);return}function mq(a){a=a|0;bq[c[(c[a>>2]|0)+16>>2]&511](a);return}function mr(a,b){a=a|0;b=+b;return+(+by[c[(c[a>>2]|0)+12>>2]&127](a,b))}function ms(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22904]|0)){a[22904]=1}br[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=232;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 232}function mt(){return vo(1)|0}function mu(a){a=a|0;if((a|0)==0){return}vl(a|0);return}function mv(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+4>>2]&511](a);return}function mw(){var a=0;a=vo(4)|0;c[a>>2]=19640;return a|0}function mx(a,b){a=a|0;b=b|0;br[c[(c[a>>2]|0)+12>>2]&511](a,b);return}function my(a,b){a=a|0;b=b|0;br[c[(c[a>>2]|0)+8>>2]&511](a,b);return}function mz(a,b,d){a=a|0;b=b|0;d=d|0;bN[c[(c[a>>2]|0)+16>>2]&127](a,b,d);return}function mA(a,b,d){a=a|0;b=b|0;d=d|0;bN[c[(c[a>>2]|0)+20>>2]&127](a,b,d);return}function mB(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+4>>2]&511](a);return}function mC(a,b,d){a=a|0;b=b|0;d=+d;bP[c[(c[a>>2]|0)+28>>2]&127](a,b,d);return}function mD(a,b){a=a|0;b=b|0;return bH[c[(c[a>>2]|0)+8>>2]&255](a,b)|0}function mE(a,b,c){a=a|0;b=b|0;c=c|0;cX(a,b,c);return}function mF(){var b=0;b=vo(40)|0;c[b>>2]=20296;c[b+4>>2]=3;g[b+8>>2]=.009999999776482582;c[b+12>>2]=0;c[b+16>>2]=0;a[b+36|0]=0;a[b+37|0]=0;return b|0}function mG(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bQ[c[(c[a>>2]|0)+24>>2]&127](a,b,d,e);return}function mH(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return bK[c[(c[a>>2]|0)+20>>2]&127](a,b,d,e,f)|0}function mI(a){a=a|0;return bs[c[(c[a>>2]|0)+12>>2]&1023](a)|0}function mJ(a,b,d){a=a|0;b=b|0;d=d|0;return bx[c[(c[a>>2]|0)+16>>2]&127](a,b,d)|0}function mK(a,b){a=a|0;b=b|0;return bH[c[(c[a>>2]|0)+8>>2]&255](a,b)|0}function mL(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+4>>2]&511](a);return}function mM(){var a=0;a=vo(4)|0;c[a>>2]=19824;return a|0}function mN(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;if((a|0)==0){return}b=a+4|0;d=a|0;e=c[d>>2]|0;if((c[b>>2]|0)>0){f=0;g=e;while(1){vi(c[g+(f<<3)+4>>2]|0);h=f+1|0;i=c[d>>2]|0;if((h|0)<(c[b>>2]|0)){f=h;g=i}else{j=i;break}}}else{j=e}vi(j);vl(a);return}function mO(a){a=a|0;var b=0,d=0,e=0;b=a+4|0;d=a|0;if((c[b>>2]|0)>0){e=0;do{vi(c[(c[d>>2]|0)+(e<<3)+4>>2]|0);e=e+1|0;}while((e|0)<(c[b>>2]|0))}c[b>>2]=0;vq(c[d>>2]|0,0,c[a+8>>2]<<3|0);vq(a+12|0,0,56);return}function mP(a,b){a=a|0;b=b|0;return df(a,b)|0}function mQ(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+24>>2]&511](a);return}function mR(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23040]|0)){a[23040]=1}br[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=216;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 216}function mS(a,b){a=a|0;b=+b;return+(+by[c[(c[a>>2]|0)+12>>2]&127](a,b))}function mT(a){a=a|0;bq[c[(c[a>>2]|0)+16>>2]&511](a);return}function mU(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23032]|0)){a[23032]=1}br[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=208;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 208}function mV(a,d,e){a=a|0;d=+d;e=+e;var f=0,h=0,i=0,j=0;if(d>e){bc(6488,473,17496,11440)}f=a+120|0;do{if(+g[f>>2]==d){if(+g[a+124>>2]!=e){break}return}}while(0);h=c[a+48>>2]|0;i=h+4|0;j=b[i>>1]|0;if((j&2)==0){b[i>>1]=j|2;g[h+144>>2]=0.0}h=c[a+52>>2]|0;j=h+4|0;i=b[j>>1]|0;if((i&2)==0){b[j>>1]=i|2;g[h+144>>2]=0.0}g[a+92>>2]=0.0;g[f>>2]=d;g[a+124>>2]=e;return}function mW(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+12|0;if((c[f>>2]|0)!=0){bc(6208,48,18448,11256)}g=b+16|0;if((c[g>>2]|0)!=0){bc(6208,48,18448,11256)}if((e|0)>1){c[g>>2]=e;h=vh(e<<3)|0;c[f>>2]=h;vp(h|0,d|0,c[g>>2]<<3);a[b+36|0]=0;a[b+37|0]=0;return}else{bc(6208,49,18448,6736)}}function mX(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+12|0;if((c[f>>2]|0)!=0){bc(6208,34,18504,11256)}g=b+16|0;if((c[g>>2]|0)!=0){bc(6208,34,18504,11256)}if((e|0)>2){h=e+1|0;c[g>>2]=h;i=vh(h<<3)|0;c[f>>2]=i;vp(i|0,d|0,e<<3);d=c[f>>2]|0;i=d;h=d+(e<<3)|0;e=c[i+4>>2]|0;c[h>>2]=c[i>>2];c[h+4>>2]=e;e=c[f>>2]|0;f=e+((c[g>>2]|0)-2<<3)|0;g=b+20|0;h=c[f+4>>2]|0;c[g>>2]=c[f>>2];c[g+4>>2]=h;h=e+8|0;e=b+28|0;g=c[h+4>>2]|0;c[e>>2]=c[h>>2];c[e+4>>2]=g;a[b+36|0]=1;a[b+37|0]=1;return}else{bc(6208,35,18504,5016)}}function mY(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)==0){return}if((e|0)<=0){bc(5352|0,164,17448|0,8376|0)}if((e|0)>640){vi(d);return}f=a[e+22064|0]|0;if((f&255)>=14){bc(5352|0,173,17448|0,6544|0)}e=b+12+((f&255)<<2)|0;c[d>>2]=c[e>>2];c[e>>2]=d;return}function mZ(){var b=0,d=0,e=0,f=0,g=0,h=0,i=0;b=vo(68)|0;d=b;c[b+8>>2]=128;c[b+4>>2]=0;e=vh(1024)|0;c[b>>2]=e;vq(e|0,0,1024);vq(b+12|0,0,56);if((a[22056]&1)==0){f=0;g=1}else{return d|0}while(1){if((f|0)>=14){h=1080;break}if((g|0)>(c[22712+(f<<2)>>2]|0)){b=f+1|0;a[g+22064|0]=b&255;i=b}else{a[g+22064|0]=f&255;i=f}b=g+1|0;if((b|0)<641){f=i;g=b}else{h=1086;break}}if((h|0)==1086){a[22056]=1;return d|0}else if((h|0)==1080){bc(5352,73,17368,10976);return 0}return 0}function m_(a){a=a|0;return c[a+164>>2]|0}function m$(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)!=0;return d|0}function m0(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function m1(a){a=a|0;return+(+g[a+8>>2])}function m2(a,b){a=a|0;b=b|0;return a+20+(b<<3)|0}function m3(a,b,d){a=a|0;b=+b;d=+d;var e=0.0,f=0.0;c[a+148>>2]=4;e=-0.0-b;f=-0.0-d;g[a+20>>2]=e;g[a+24>>2]=f;g[a+28>>2]=b;g[a+32>>2]=f;g[a+36>>2]=b;g[a+40>>2]=d;g[a+44>>2]=e;g[a+48>>2]=d;g[a+84>>2]=0.0;g[a+88>>2]=-1.0;g[a+92>>2]=1.0;g[a+96>>2]=0.0;g[a+100>>2]=0.0;g[a+104>>2]=1.0;g[a+108>>2]=-1.0;g[a+112>>2]=0.0;g[a+12>>2]=0.0;g[a+16>>2]=0.0;return}function m4(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+12|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function m5(a,b){a=a|0;b=b|0;c[a+148>>2]=b;return}function m6(a){a=a|0;return c[a+148>>2]|0}function m7(a){a=a|0;return c[a+4>>2]|0}function m8(a){a=a|0;return c[a+148>>2]|0}function m9(a){a=a|0;return a+12|0}function na(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;f=d;d=b+12|0;g=c[f+4>>2]|0;c[d>>2]=c[f>>2];c[d+4>>2]=g;g=e;e=b+20|0;d=c[g+4>>2]|0;c[e>>2]=c[g>>2];c[e+4>>2]=d;a[b+44|0]=0;a[b+45|0]=0;return}function nb(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function nc(a){a=a|0;return+(+g[a+8>>2])}function nd(a){a=a|0;return c[a+4>>2]|0}function ne(a){a=a|0;return c[a+12>>2]|0}function nf(a,b){a=a|0;b=b|0;var d=0;d=a+4|0;a=c[d>>2]|0;c[d>>2]=b?a|4:a&-5;return}function ng(a){a=a|0;return+(+g[a+140>>2])}function nh(a){a=a|0;return+(+g[a+136>>2])}function ni(a){a=a|0;return(c[a+4>>2]&2|0)!=0|0}function nj(a){a=a|0;return(c[a+4>>2]&4|0)!=0|0}function nk(a){a=a|0;return c[a+52>>2]|0}function nl(a,b){a=a|0;b=+b;g[a+136>>2]=b;return}function nm(a){a=a|0;return c[a+48>>2]|0}function nn(a){a=a|0;return c[a+56>>2]|0}function no(a){a=a|0;return c[a+60>>2]|0}function np(a,b){a=a|0;b=+b;g[a+140>>2]=b;return}function nq(a){a=a|0;return a+64|0}function nr(a){a=a|0;var b=0.0,d=0.0;b=+g[(c[a+48>>2]|0)+20>>2];d=+g[(c[a+52>>2]|0)+20>>2];g[a+140>>2]=b>d?b:d;return}function ns(a){a=a|0;return+(+g[a+8>>2])}function nt(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function nu(a){a=a|0;return c[a+4>>2]|0}function nv(a){a=a|0;return+(+g[a+56>>2])}function nw(a){a=a|0;return c[a+148>>2]|0}function nx(a){a=a|0;return(b[a+4>>1]&4)!=0|0}function ny(a,b){a=a|0;b=+b;g[a+136>>2]=b;return}function nz(a,b){a=a|0;b=+b;g[a+140>>2]=b;return}function nA(a,b){a=a|0;b=b|0;c[a+148>>2]=b;return}function nB(a){a=a|0;return+(+g[a+72>>2])}function nC(a){a=a|0;return c[a+100>>2]|0}function nD(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,h=0;if((c[a>>2]|0)!=2){return}f=a+4|0;h=b[f>>1]|0;if((h&2)==0){b[f>>1]=h|2;g[a+144>>2]=0.0}h=d|0;f=a+76|0;g[f>>2]=+g[h>>2]+ +g[f>>2];f=d+4|0;d=a+80|0;g[d>>2]=+g[f>>2]+ +g[d>>2];d=a+84|0;g[d>>2]=+g[d>>2]+((+g[e>>2]- +g[a+44>>2])*+g[f>>2]-(+g[e+4>>2]- +g[a+48>>2])*+g[h>>2]);return}function nE(b,c){b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0;if(!(a[23088]|0)){a[23088]=1}d=+g[c>>2]- +g[b+12>>2];e=+g[c+4>>2]- +g[b+16>>2];f=+g[b+24>>2];h=+g[b+20>>2];i=+(f*e+d*(-0.0-h));b=192;g[b>>2]=d*f+e*h;g[b+4>>2]=i;return 192}function nF(a,d){a=a|0;d=d|0;var e=0.0,f=0.0,h=0,i=0;if((c[a>>2]|0)==0){return}e=+g[d>>2];f=+g[d+4>>2];do{if(e*e+f*f>0.0){h=a+4|0;i=b[h>>1]|0;if((i&2)!=0){break}b[h>>1]=i|2;g[a+144>>2]=0.0}}while(0);i=d;d=a+64|0;a=c[i+4>>2]|0;c[d>>2]=c[i>>2];c[d+4>>2]=a;return}function nG(a){a=a|0;return c[a+108>>2]|0}function nH(b){b=b|0;var d=0,e=0;if(!(a[22976]|0)){a[22976]=1}d=b+64|0;b=c[d+4>>2]|0;e=184;c[e>>2]=c[d>>2];c[e+4>>2]=b;return 184}function nI(a){a=a|0;return c[a+96>>2]|0}function nJ(a,c){a=a|0;c=c|0;var d=0,e=0;d=a+4|0;e=b[d>>1]|0;if(c){b[d>>1]=e|4;return}c=e&-5;b[d>>1]=c;if((e&2)!=0){return}b[d>>1]=c|2;g[a+144>>2]=0.0;return}function nK(a){a=a|0;return+(+g[a+116>>2])}function nL(a,d){a=a|0;d=+d;var e=0,f=0;if((c[a>>2]|0)==0){return}do{if(d*d>0.0){e=a+4|0;f=b[e>>1]|0;if((f&2)!=0){break}b[e>>1]=f|2;g[a+144>>2]=0.0}}while(0);g[a+72>>2]=d;return}function nM(a,b){a=a|0;b=b|0;var d=0,e=0,f=0.0,h=0.0;d=a+116|0;g[b>>2]=+g[d>>2];e=a+28|0;f=+g[e>>2];h=+g[a+32>>2];g[b+12>>2]=+g[a+124>>2]+ +g[d>>2]*(f*f+h*h);d=e;e=b+4|0;b=c[d+4>>2]|0;c[e>>2]=c[d>>2];c[e+4>>2]=b;return}function nN(b,c){b=b|0;c=c|0;var d=0.0,e=0.0,f=0;if(!(a[22776]|0)){a[22776]=1}d=+g[b+72>>2];e=+(d*(+g[c>>2]- +g[b+44>>2])+ +g[b+68>>2]);f=176;g[f>>2]=+g[b+64>>2]+(+g[c+4>>2]- +g[b+48>>2])*(-0.0-d);g[f+4>>2]=e;return 176}function nO(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22872]|0)){a[22872]=1}bP[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=200;c[g>>2]=c[f>>2];c[g+4>>2]=b;i=e;return 200}function nP(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+4>>2]&511](a);return}function nQ(a,b,c){a=a|0;b=b|0;c=c|0;dc(a,b,c);return}function nR(a,b,d){a=a|0;b=b|0;d=+d;bP[c[(c[a>>2]|0)+28>>2]&127](a,b,d);return}function nS(a,b){a=a|0;b=b|0;return bH[c[(c[a>>2]|0)+8>>2]&255](a,b)|0}function nT(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return bK[c[(c[a>>2]|0)+20>>2]&127](a,b,d,e,f)|0}function nU(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;cW(a,b,c,d,e);return}function nV(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bQ[c[(c[a>>2]|0)+24>>2]&127](a,b,d,e);return}function nW(a){a=a|0;return bs[c[(c[a>>2]|0)+12>>2]&1023](a)|0}function nX(a,b,d){a=a|0;b=b|0;d=d|0;return bx[c[(c[a>>2]|0)+16>>2]&127](a,b,d)|0}function nY(){var a=0;a=vo(152)|0;c[a>>2]=20032;c[a+4>>2]=2;g[a+8>>2]=.009999999776482582;c[a+148>>2]=0;g[a+12>>2]=0.0;g[a+16>>2]=0.0;return a|0}function nZ(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+4>>2]&511](a);return}function n_(a,b,d){a=a|0;b=b|0;d=+d;bP[c[(c[a>>2]|0)+28>>2]&127](a,b,d);return}function n$(a,b){a=a|0;b=b|0;return bH[c[(c[a>>2]|0)+8>>2]&255](a,b)|0}function n0(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return bK[c[(c[a>>2]|0)+20>>2]&127](a,b,d,e,f)|0}function n1(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bQ[c[(c[a>>2]|0)+24>>2]&127](a,b,d,e);return}function n2(a){a=a|0;return bs[c[(c[a>>2]|0)+12>>2]&1023](a)|0}function n3(a,b,d){a=a|0;b=b|0;d=d|0;return bx[c[(c[a>>2]|0)+16>>2]&127](a,b,d)|0}function n4(){var a=0;a=vo(48)|0;c[a>>2]=20512;c[a+4>>2]=1;g[a+8>>2]=.009999999776482582;vq(a+28|0,0,18);return a|0}function n5(a,b){a=a|0;b=b|0;var d=0,e=0;d=c[a+48>>2]|0;e=c[a+52>>2]|0;cd(b,a+64|0,(c[d+8>>2]|0)+12|0,+g[(c[d+12>>2]|0)+8>>2],(c[e+8>>2]|0)+12|0,+g[(c[e+12>>2]|0)+8>>2]);return}function n6(a){a=a|0;g[a+136>>2]=+P(+(+g[(c[a+48>>2]|0)+16>>2]*+g[(c[a+52>>2]|0)+16>>2]));return}function n7(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bQ[c[c[a>>2]>>2]&127](a,b,d,e);return}function n8(a,b,d){a=a|0;b=b|0;d=+d;bP[c[(c[a>>2]|0)+28>>2]&127](a,b,d);return}function n9(a,b){a=a|0;b=b|0;return bH[c[(c[a>>2]|0)+8>>2]&255](a,b)|0}function oa(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return bK[c[(c[a>>2]|0)+20>>2]&127](a,b,d,e,f)|0}function ob(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bQ[c[(c[a>>2]|0)+24>>2]&127](a,b,d,e);return}function oc(a){a=a|0;return bs[c[(c[a>>2]|0)+12>>2]&1023](a)|0}function od(a,b,d){a=a|0;b=b|0;d=d|0;return bx[c[(c[a>>2]|0)+16>>2]&127](a,b,d)|0}function oe(a,b){a=a|0;b=b|0;dt(a,b);return}function of(a,b,c){a=a|0;b=b|0;c=+c;ds(a,b,c);return}function og(a){a=a|0;dj(a);return}function oh(b){b=b|0;var d=0,e=0,f=0,h=0;d=vo(168)|0;e=d;c[e>>2]=19312;f=c[b+8>>2]|0;h=c[b+12>>2]|0;if((f|0)!=(h|0)){c[d+4>>2]=c[b>>2];c[d+8>>2]=0;c[d+12>>2]=0;c[d+48>>2]=f;c[d+52>>2]=h;c[d+56>>2]=0;a[d+61|0]=a[b+16|0]&1;a[d+60|0]=0;c[d+64>>2]=c[b+4>>2];vq(d+16|0,0,32);c[e>>2]=20400;e=b+20|0;h=d+68|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2];c[h+4>>2]=f;f=b+28|0;h=d+76|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2];c[h+4>>2]=e;g[d+84>>2]=+g[b+36>>2];g[d+160>>2]=0.0;g[d+92>>2]=0.0;c[d+164>>2]=0;g[d+88>>2]=0.0;return d|0}bc(7272,173,15744,9072);return 0}function oi(a,d){a=a|0;d=d|0;var e=0,f=0;if((c[a>>2]|0)!=2){return}e=a+4|0;f=b[e>>1]|0;if((f&2)==0){b[e>>1]=f|2;g[a+144>>2]=0.0}f=a+76|0;g[f>>2]=+g[d>>2]+ +g[f>>2];f=a+80|0;g[f>>2]=+g[d+4>>2]+ +g[f>>2];return}function oj(a,d){a=a|0;d=+d;var e=0,f=0;if((c[a>>2]|0)!=2){return}e=a+4|0;f=b[e>>1]|0;if((f&2)==0){b[e>>1]=f|2;g[a+144>>2]=0.0}f=a+84|0;g[f>>2]=+g[f>>2]+d;return}function ok(a){a=a|0;return(b[a+4>>1]&2)!=0|0}function ol(a){a=a|0;return a+12|0}function om(a){a=a|0;return a+44|0}function on(a){a=a|0;return+(+g[a+136>>2])}function oo(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,h=0,i=0.0,j=0.0;if((c[a>>2]|0)!=2){return}f=a+4|0;h=b[f>>1]|0;if((h&2)==0){b[f>>1]=h|2;g[a+144>>2]=0.0}i=+g[a+120>>2];h=d|0;f=d+4|0;j=i*+g[f>>2];d=a+64|0;g[d>>2]=i*+g[h>>2]+ +g[d>>2];d=a+68|0;g[d>>2]=j+ +g[d>>2];d=a+72|0;g[d>>2]=+g[d>>2]+ +g[a+128>>2]*((+g[e>>2]- +g[a+44>>2])*+g[f>>2]-(+g[e+4>>2]- +g[a+48>>2])*+g[h>>2]);return}function op(a){a=a|0;return(b[a+4>>1]&16)!=0|0}function oq(a){a=a|0;return a+28|0}function or(b,c){b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0;if(!(a[23064]|0)){a[23064]=1}d=+g[b+24>>2];e=+g[c>>2];f=+g[b+20>>2];h=+g[c+4>>2];i=+(e*f+d*h);c=168;g[c>>2]=d*e-f*h;g[c+4>>2]=i;return 168}function os(b,c){b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;if(!(a[22784]|0)){a[22784]=1}d=+g[b+24>>2];e=+g[c>>2];f=+g[b+20>>2];h=+g[c+4>>2];i=+g[b+72>>2];j=+(i*(+g[b+12>>2]+(d*e-f*h)- +g[b+44>>2])+ +g[b+68>>2]);c=160;g[c>>2]=+g[b+64>>2]+(e*f+d*h+ +g[b+16>>2]- +g[b+48>>2])*(-0.0-i);g[c+4>>2]=j;return 160}function ot(a){a=a|0;return c[a+112>>2]|0}function ou(b,c){b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0;if(!(a[23080]|0)){a[23080]=1}d=+g[b+24>>2];e=+g[c>>2];f=+g[b+20>>2];h=+g[c+4>>2];i=+(e*f+d*h+ +g[b+16>>2]);c=152;g[c>>2]=+g[b+12>>2]+(d*e-f*h);g[c+4>>2]=i;return 152}function ov(a){a=a|0;return+(+g[a+132>>2])}function ow(a){a=a|0;return(b[a+4>>1]&8)!=0|0}function ox(a){a=a|0;return c[a+88>>2]|0}function oy(b,c){b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0;if(!(a[23072]|0)){a[23072]=1}d=+g[b+24>>2];e=+g[c>>2];f=+g[b+20>>2];h=+g[c+4>>2];i=+(e*(-0.0-f)+d*h);c=144;g[c>>2]=d*e+f*h;g[c+4>>2]=i;return 144}function oz(a,b){a=a|0;b=+b;g[a+132>>2]=b;return}function oA(a,c){a=a|0;c=c|0;var d=0;d=a+4|0;a=b[d>>1]|0;b[d>>1]=c?a|8:a&-9;return}function oB(a){a=a|0;return c[a>>2]|0}function oC(a){a=a|0;return+(+g[a+140>>2])}function oD(a){a=a|0;var b=0.0,c=0.0;b=+g[a+28>>2];c=+g[a+32>>2];return+(+g[a+124>>2]+ +g[a+116>>2]*(b*b+c*c))}function oE(a){a=a|0;return(b[a+4>>1]&32)!=0|0}function oF(a,d){a=a|0;d=+d;var e=0,f=0;if((c[a>>2]|0)!=2){return}e=a+4|0;f=b[e>>1]|0;if((f&2)==0){b[e>>1]=f|2;g[a+144>>2]=0.0}f=a+72|0;g[f>>2]=+g[f>>2]+ +g[a+128>>2]*d;return}function oG(a){a=a|0;return a+12|0}function oH(a){a=a|0;return+(+g[a+96>>2])}function oI(b){b=b|0;return(a[b+61|0]&1)!=0|0}function oJ(a){a=a|0;return c[a+64>>2]|0}function oK(a){a=a|0;return c[a+4>>2]|0}function oL(a){a=a|0;return c[a+52>>2]|0}function oM(a){a=a|0;return a+68|0}function oN(a){a=a|0;return a+76|0}function oO(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function oP(a){a=a|0;return c[a+48>>2]|0}function oQ(a){a=a|0;return c[a+12>>2]|0}function oR(a){a=a|0;return+(+g[a+100>>2])}function oS(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)!=0;return d|0}function oT(a){a=a|0;return c[a+102408>>2]|0}function oU(a,c){a=a|0;c=c|0;b[a+2>>1]=c;return}function oV(a,c){a=a|0;c=c|0;b[a>>1]=c;return}function oW(a){a=a|0;return b[a+4>>1]|0}function oX(a,b){a=a|0;b=b|0;di(a,b);return}function oY(a,b){a=a|0;b=b|0;return dk(a,b)|0}function oZ(d,e,f){d=d|0;e=e|0;f=+f;var h=0,j=0;h=i;i=i+32|0;j=h|0;b[j+22>>1]=1;b[j+24>>1]=-1;b[j+26>>1]=0;c[j+4>>2]=0;g[j+8>>2]=.20000000298023224;g[j+12>>2]=0.0;a[j+20|0]=0;c[j>>2]=e;g[j+16>>2]=f;e=dk(d,j)|0;i=h;return e|0}function o_(a,b){a=a|0;b=b|0;dr(a,b);return}function o$(a,c){a=a|0;c=c|0;var d=0,e=0;d=a+4|0;e=b[d>>1]|0;if(!c){b[d>>1]=e&-3;g[a+144>>2]=0.0;vq(a+64|0,0,24);return}if((e&2)!=0){return}b[d>>1]=e|2;g[a+144>>2]=0.0;return}function o0(a){a=a|0;dn(a);return}function o1(a,b){a=a|0;b=b|0;dq(a,b);return}function o2(a,c){a=a|0;c=c|0;var d=0,e=0;d=a+4|0;e=b[d>>1]|0;b[d>>1]=c?e|16:e&-17;dj(a);return}function o3(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22928]|0)){a[22928]=1}br[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=128;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 128}function o4(a,b){a=a|0;b=+b;return+(+by[c[(c[a>>2]|0)+12>>2]&127](a,b))}function o5(a){a=a|0;bq[c[(c[a>>2]|0)+16>>2]&511](a);return}function o6(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+24>>2]&511](a);return}function o7(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22920]|0)){a[22920]=1}br[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=120;c[f>>2]=c[e>>2];c[f+4>>2]=b;i=d;return 120}function o8(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22808]|0)){a[22808]=1}bP[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=112;c[g>>2]=c[f>>2];c[g+4>>2]=b;i=e;return 112}function o9(){var a=0;a=vo(102800)|0;c[a+102400>>2]=0;c[a+102404>>2]=0;c[a+102408>>2]=0;c[a+102796>>2]=0;return a|0}function pa(a,b){a=a|0;b=b|0;dg(a,b);return}function pb(a){a=a|0;if((a|0)==0){return}bq[c[(c[a>>2]|0)+4>>2]&511](a);return}function pc(a,b){a=a|0;b=b|0;br[c[(c[a>>2]|0)+8>>2]&511](a,b);return}function pd(){var a=0;a=vo(4)|0;c[a>>2]=19576;return a|0}function pe(a){a=a|0;if((a|0)==0){return}vl(a);return}function pf(a,b){a=a|0;b=+b;do{if(b==b&!(C=0.0,C!=C)&b>+-p){if(!(b<+p&b>=0.0)){break}g[a+100>>2]=b;return}}while(0);bc(7624,228,17552,9328)}function pg(a,b){a=a|0;b=+b;do{if(b==b&!(C=0.0,C!=C)&b>+-p){if(!(b<+p&b>=0.0)){break}g[a+96>>2]=b;return}}while(0);bc(7624,217,17600,11752)}function ph(b){b=b|0;var d=0,e=0,f=0,h=0;d=vo(180)|0;e=d;c[e>>2]=19312;f=c[b+8>>2]|0;h=c[b+12>>2]|0;if((f|0)!=(h|0)){c[d+4>>2]=c[b>>2];c[d+8>>2]=0;c[d+12>>2]=0;c[d+48>>2]=f;c[d+52>>2]=h;c[d+56>>2]=0;a[d+61|0]=a[b+16|0]&1;a[d+60|0]=0;c[d+64>>2]=c[b+4>>2];vq(d+16|0,0,32);c[e>>2]=19856;e=b+20|0;h=d+68|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2];c[h+4>>2]=f;f=b+28|0;h=d+76|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2];c[h+4>>2]=e;g[d+84>>2]=0.0;g[d+88>>2]=0.0;g[d+92>>2]=0.0;g[d+96>>2]=+g[b+36>>2];g[d+100>>2]=+g[b+40>>2];return d|0}bc(7272,173,15744,9072);return 0}function pi(a){a=a|0;if((a|0)==0){return}if((c[a+102400>>2]|0)!=0){bc(4840,32,17e3,10664)}if((c[a+102796>>2]|0)==0){vl(a|0);return}else{bc(4840,33,17e3,7952)}}function pj(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b+102796|0;f=c[e>>2]|0;if((f|0)>=32){bc(4840,38,17040,6448);return 0}g=b+102412+(f*12&-1)|0;c[b+102412+(f*12&-1)+4>>2]=d;h=b+102400|0;i=c[h>>2]|0;if((i+d|0)>102400){c[g>>2]=vh(d)|0;a[b+102412+(f*12&-1)+8|0]=1}else{c[g>>2]=b+i;a[b+102412+(f*12&-1)+8|0]=0;c[h>>2]=(c[h>>2]|0)+d}h=b+102404|0;f=(c[h>>2]|0)+d|0;c[h>>2]=f;h=b+102408|0;b=c[h>>2]|0;c[h>>2]=(b|0)>(f|0)?b:f;c[e>>2]=(c[e>>2]|0)+1;return c[g>>2]|0}function pk(a,c){a=a|0;c=c|0;b[a+4>>1]=c;return}function pl(a){a=a|0;return b[a+2>>1]|0}function pm(a){a=a|0;return b[a>>1]|0}function pn(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function po(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function pp(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function pq(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function pr(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function ps(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function pt(a){a=a|0;return+(+g[a+36>>2])}function pu(a){a=a|0;return a+20|0}function pv(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function pw(a){a=a|0;return a+28|0}function px(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)!=0|0}function py(a,b){a=a|0;b=+b;g[a+40>>2]=b;return}function pz(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function pA(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0.0,i=0,j=0.0,k=0.0,l=0.0,m=0.0;c[a+8>>2]=b;c[a+12>>2]=d;f=e|0;h=+g[f>>2]- +g[b+12>>2];i=e+4|0;j=+g[i>>2]- +g[b+16>>2];k=+g[b+24>>2];l=+g[b+20>>2];b=a+20|0;m=+(k*j+h*(-0.0-l));g[b>>2]=h*k+j*l;g[b+4>>2]=m;m=+g[f>>2]- +g[d+12>>2];l=+g[i>>2]- +g[d+16>>2];j=+g[d+24>>2];k=+g[d+20>>2];d=a+28|0;h=+(j*l+m*(-0.0-k));g[d>>2]=m*j+l*k;g[d+4>>2]=h;return}function pB(a){a=a|0;return+(+g[a+40>>2])}function pC(a){a=a|0;return+(+g[a+28>>2])}function pD(b){b=b|0;return(a[b+37|0]&1)!=0|0}function pE(a){a=a|0;return c[a>>2]|0}function pF(b){b=b|0;return(a[b+36|0]&1)!=0|0}function pG(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+4|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function pH(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+16|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function pI(b){b=b|0;return(a[b+39|0]&1)!=0|0}function pJ(a){a=a|0;return c[a+44>>2]|0}function pK(a,b){a=a|0;b=+b;g[a+32>>2]=b;return}function pL(b,c){b=b|0;c=c|0;a[b+38|0]=c&1;return}function pM(b,c){b=b|0;c=c|0;a[b+36|0]=c&1;return}function pN(a){a=a|0;return+(+g[a+48>>2])}function pO(a,b){a=a|0;b=+b;g[a+24>>2]=b;return}function pP(a,b){a=a|0;b=b|0;c[a+44>>2]=b;return}function pQ(a){a=a|0;return a+4|0}function pR(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function pS(a,b){a=a|0;b=+b;g[a+48>>2]=b;return}function pT(a){a=a|0;return+(+g[a+32>>2])}function pU(b,c){b=b|0;c=c|0;a[b+39|0]=c&1;return}function pV(b,c){b=b|0;c=c|0;a[b+40|0]=c&1;return}function pW(a,b){a=a|0;b=+b;g[a+12>>2]=b;return}function pX(a){a=a|0;return+(+g[a+12>>2])}function pY(a){a=a|0;return+(+g[a+24>>2])}function pZ(a){a=a|0;return a+16|0}function p_(b){b=b|0;return(a[b+40|0]&1)!=0|0}function p$(a,b){a=a|0;b=+b;g[a+28>>2]=b;return}function p0(b){b=b|0;return(a[b+38|0]&1)!=0|0}function p1(b,c){b=b|0;c=c|0;a[b+37|0]=c&1;return}function p2(a,b){a=a|0;b=+b;g[a>>2]=b;return}function p3(a,b,c){a=a|0;b=+b;c=+c;g[a>>2]=b;g[a+4>>2]=c;return}function p4(a){a=a|0;return+(+g[a>>2])}function p5(a){a=a|0;return+(+g[a+4>>2])}function p6(a,b){a=a|0;b=+b;g[a+4>>2]=b;return}function p7(a){a=a|0;var b=0.0,c=0;b=+g[a>>2];if(!(b==b&!(C=0.0,C!=C)&b>+-p&b<+p)){c=0;return c|0}b=+g[a+4>>2];if(!(b==b&!(C=0.0,C!=C)&b>+-p)){c=0;return c|0}c=b<+p;return c|0}function p8(b){b=b|0;var c=0.0,d=0;if(!(a[23168]|0)){a[23168]=1}c=+(+g[b>>2]);d=104;g[d>>2]=-0.0- +g[b+4>>2];g[d+4>>2]=c;return 104}function p9(a){a=a|0;var b=0.0,c=0.0;b=+g[a>>2];c=+g[a+4>>2];return+(b*b+c*c)}function qa(a,b){a=a|0;b=b|0;var c=0;c=a|0;g[c>>2]=+g[b>>2]+ +g[c>>2];c=a+4|0;g[c>>2]=+g[b+4>>2]+ +g[c>>2];return}function qb(a){a=a|0;g[a>>2]=0.0;g[a+4>>2]=0.0;return}function qc(a,b){a=a|0;b=+b;var c=0;c=a|0;g[c>>2]=+g[c>>2]*b;c=a+4|0;g[c>>2]=+g[c>>2]*b;return}function qd(b){b=b|0;var c=0.0,d=0;if(!(a[23160]|0)){a[23160]=1}c=+(-0.0- +g[b+4>>2]);d=96;g[d>>2]=-0.0- +g[b>>2];g[d+4>>2]=c;return 96}function qe(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function qf(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;g[a>>2]=b;g[a+4>>2]=c;g[a+8>>2]=d;return}function qg(a){a=a|0;return+(+g[a+8>>2])}function qh(a,b){a=a|0;b=b|0;var c=0;c=a|0;g[c>>2]=+g[b>>2]+ +g[c>>2];c=a+4|0;g[c>>2]=+g[b+4>>2]+ +g[c>>2];c=a+8|0;g[c>>2]=+g[b+8>>2]+ +g[c>>2];return}function qi(a){a=a|0;g[a>>2]=0.0;g[a+4>>2]=0.0;g[a+8>>2]=0.0;return}function qj(a,b){a=a|0;b=+b;var c=0;c=a|0;g[c>>2]=+g[c>>2]*b;c=a+4|0;g[c>>2]=+g[c>>2]*b;c=a+8|0;g[c>>2]=+g[c>>2]*b;return}function qk(b){b=b|0;var c=0.0,d=0.0;if(!(a[23152]|0)){a[23152]=1}c=-0.0- +g[b+4>>2];d=-0.0- +g[b+8>>2];g[20]=-0.0- +g[b>>2];g[21]=c;g[22]=d;return 80}function ql(a){a=a|0;return+(+g[a+24>>2])}function qm(a,b){a=a|0;b=+b;g[a+24>>2]=b;return}function qn(a){a=a|0;return c[a+16>>2]|0}function qo(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0;d=c[a+16>>2]|0;e=c[a+20>>2]|0;if((e|0)<=1){f=0;h=d+(f<<3)|0;return h|0}i=+g[b+4>>2];j=+g[b>>2];k=i*+g[d+4>>2]+j*+g[d>>2];b=1;a=0;while(1){l=j*+g[d+(b<<3)>>2]+i*+g[d+(b<<3)+4>>2];m=l>k;n=m?b:a;o=b+1|0;if((o|0)<(e|0)){k=m?l:k;b=o;a=n}else{f=n;break}}h=d+(f<<3)|0;return h|0}function qp(a){a=a|0;return c[a+20>>2]|0}function qq(a){a=a|0;return c[a+20>>2]|0}function qr(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0.0,i=0.0,j=0.0,k=0.0,l=0,m=0,n=0;d=c[a+16>>2]|0;e=c[a+20>>2]|0;if((e|0)<=1){f=0;return f|0}h=+g[b+4>>2];i=+g[b>>2];j=h*+g[d+4>>2]+i*+g[d>>2];b=1;a=0;while(1){k=i*+g[d+(b<<3)>>2]+h*+g[d+(b<<3)+4>>2];l=k>j;m=l?b:a;n=b+1|0;if((n|0)<(e|0)){j=l?k:j;b=n;a=m}else{f=m;break}}return f|0}function qs(a,b){a=a|0;b=b|0;c[a+16>>2]=b;return}function qt(a,b){a=a|0;b=b|0;c[a+20>>2]=b;return}function qu(b){b=b|0;return(a[b+20|0]&1)!=0|0}function qv(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function qw(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function qx(a){a=a|0;return+(+g[a+16>>2])}function qy(a){a=a|0;return c[a>>2]|0}function qz(a,b){a=a|0;b=+b;g[a+16>>2]=b;return}function qA(a,b){a=a|0;b=+b;g[a+12>>2]=b;return}function qB(a){a=a|0;return+(+g[a+12>>2])}function qC(b,c){b=b|0;c=c|0;a[b+20|0]=c&1;return}function qD(a){a=a|0;return a+22|0}function qE(a){a=a|0;return+(+g[a+8>>2])}function qF(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function qG(a){a=a|0;return c[a+4>>2]|0}function qH(){var a=0;a=vo(6)|0;b[a>>1]=1;b[a+2>>1]=-1;b[a+4>>1]=0;return a|0}function qI(a){a=a|0;if((a|0)==0){return}vl(a);return}function qJ(){var a=0;a=vo(44)|0;vq(a|0,0,17);c[a>>2]=9;vq(a+20|0,0,24);return a|0}function qK(){var b=0;b=vo(52)|0;c[b+44>>2]=0;vq(b+4|0,0,32);a[b+36|0]=1;a[b+37|0]=1;a[b+38|0]=0;a[b+39|0]=0;c[b>>2]=0;a[b+40|0]=1;g[b+48>>2]=1.0;return b|0}function qL(a){a=a|0;if((a|0)==0){return}vl(a);return}function qM(a){a=a|0;var b=0,c=0.0,d=0,e=0.0,f=0.0,h=0.0,i=0.0;b=a|0;c=+g[b>>2];d=a+4|0;e=+g[d>>2];f=+P(+(c*c+e*e));if(f<1.1920928955078125e-7){h=0.0;return+h}i=1.0/f;g[b>>2]=c*i;g[d>>2]=e*i;h=f;return+h}function qN(){return vo(8)|0}function qO(a,b){a=+a;b=+b;var c=0;c=vo(8)|0;g[c>>2]=a;g[c+4>>2]=b;return c|0}function qP(a){a=a|0;var b=0.0,c=0.0;b=+g[a>>2];c=+g[a+4>>2];return+(+P(+(b*b+c*c)))}function qQ(a){a=a|0;if((a|0)==0){return}vl(a);return}function qR(a){a=a|0;if((a|0)==0){return}vl(a);return}function qS(){return vo(12)|0}function qT(a,b,c){a=+a;b=+b;c=+c;var d=0;d=vo(12)|0;g[d>>2]=a;g[d+4>>2]=b;g[d+8>>2]=c;return d|0}function qU(a,b,c){a=a|0;b=b|0;c=c|0;cf(a,b,c);return}function qV(){var a=0;a=vo(28)|0;c[a+16>>2]=0;c[a+20>>2]=0;g[a+24>>2]=0.0;return a|0}function qW(a){a=a|0;if((a|0)==0){return}vl(a);return}function qX(a){a=a|0;if((a|0)==0){return}vl(a);return}function qY(){var d=0;d=vo(28)|0;b[d+22>>1]=1;b[d+24>>1]=-1;b[d+26>>1]=0;c[d>>2]=0;c[d+4>>2]=0;g[d+8>>2]=.20000000298023224;g[d+12>>2]=0.0;g[d+16>>2]=0.0;a[d+20|0]=0;return d|0}function qZ(a,c){a=a|0;c=c|0;var d=0;d=a+22|0;a=c;b[d>>1]=b[a>>1]|0;b[d+2>>1]=b[a+2>>1]|0;b[d+4>>1]=b[a+4>>1]|0;return}function q_(a,b){a=a|0;b=b|0;do{if((b|0)>-1){if((c[a+20>>2]|0)<=(b|0)){break}return(c[a+16>>2]|0)+(b<<3)|0}}while(0);bc(7536,103,13816,6368);return 0}function q$(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function q0(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function q1(a){a=a|0;return+(+g[a+68>>2])}function q2(b){b=b|0;return(a[b+60|0]&1)!=0|0}function q3(a){a=a|0;return+(+g[a+44>>2])}function q4(b,c){b=b|0;c=c|0;a[b+48|0]=c&1;return}function q5(a,b){a=a|0;b=+b;g[a+68>>2]=b;return}function q6(a){a=a|0;return a+36|0}function q7(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function q8(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function q9(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0,k=0.0,l=0.0,m=0,n=0.0,o=0,p=0.0;c[a+8>>2]=b;c[a+12>>2]=d;h=e|0;i=+g[h>>2]- +g[b+12>>2];j=e+4|0;k=+g[j>>2]- +g[b+16>>2];e=b+24|0;l=+g[e>>2];m=b+20|0;n=+g[m>>2];o=a+20|0;p=+(l*k+i*(-0.0-n));g[o>>2]=i*l+k*n;g[o+4>>2]=p;p=+g[h>>2]- +g[d+12>>2];n=+g[j>>2]- +g[d+16>>2];k=+g[d+24>>2];l=+g[d+20>>2];j=a+28|0;i=+(k*n+p*(-0.0-l));g[j>>2]=p*k+n*l;g[j+4>>2]=i;i=+g[e>>2];l=+g[f>>2];n=+g[m>>2];k=+g[f+4>>2];f=a+36|0;p=+(l*(-0.0-n)+i*k);g[f>>2]=i*l+n*k;g[f+4>>2]=p;g[a+44>>2]=+g[d+56>>2]- +g[b+56>>2];return}function ra(a,b){a=a|0;b=+b;g[a+52>>2]=b;return}function rb(a){a=a|0;return+(+g[a+56>>2])}function rc(b){b=b|0;return(a[b+48|0]&1)!=0|0}function rd(a,b){a=a|0;b=+b;g[a+44>>2]=b;return}function re(a){a=a|0;return a+20|0}function rf(a){a=a|0;return a+28|0}function rg(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)!=0|0}function rh(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function ri(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function rj(a,b){a=a|0;b=+b;g[a+56>>2]=b;return}function rk(a){a=a|0;return+(+g[a+64>>2])}function rl(a,b){a=a|0;b=+b;g[a+64>>2]=b;return}function rm(b,c){b=b|0;c=c|0;a[b+60|0]=c&1;return}function rn(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function ro(a){a=a|0;return+(+g[a+52>>2])}function rp(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+36|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function rq(b){b=b|0;var c=0.0,d=0;if(!(a[23136]|0)){a[23136]=1}c=+(+g[b+4>>2]);d=72;g[d>>2]=-0.0- +g[b>>2];g[d+4>>2]=c;return 72}function rr(b){b=b|0;var c=0.0,d=0;if(!(a[23144]|0)){a[23144]=1}c=+(+g[b>>2]);d=64;g[d>>2]=+g[b+4>>2];g[d+4>>2]=c;return 64}function rs(a,b){a=a|0;b=+b;g[a+4>>2]=b;return}function rt(a){a=a|0;g[a>>2]=0.0;g[a+4>>2]=1.0;return}function ru(a){a=a|0;return+(+g[a+4>>2])}function rv(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function rw(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function rx(a){a=a|0;return+(+g[a+52>>2])}function ry(a,b){a=a|0;b=+b;g[a+48>>2]=b;return}function rz(a,b){a=a|0;b=+b;g[a+56>>2]=b;return}function rA(a,b){a=a|0;b=+b;g[a+52>>2]=b;return}function rB(a){a=a|0;return a+36|0}function rC(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function rD(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function rE(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0,k=0.0,l=0.0,m=0,n=0.0,o=0.0;c[a+8>>2]=b;c[a+12>>2]=d;h=e|0;i=+g[h>>2]- +g[b+12>>2];j=e+4|0;k=+g[j>>2]- +g[b+16>>2];e=b+24|0;l=+g[e>>2];m=b+20|0;n=+g[m>>2];b=a+20|0;o=+(l*k+i*(-0.0-n));g[b>>2]=i*l+k*n;g[b+4>>2]=o;o=+g[h>>2]- +g[d+12>>2];n=+g[j>>2]- +g[d+16>>2];k=+g[d+24>>2];l=+g[d+20>>2];d=a+28|0;i=+(k*n+o*(-0.0-l));g[d>>2]=o*k+n*l;g[d+4>>2]=i;i=+g[e>>2];l=+g[f>>2];n=+g[m>>2];k=+g[f+4>>2];f=a+36|0;o=+(l*(-0.0-n)+i*k);g[f>>2]=i*l+n*k;g[f+4>>2]=o;return}function rF(a){a=a|0;return+(+g[a+56>>2])}function rG(a,b){a=a|0;b=+b;g[a+60>>2]=b;return}function rH(a){a=a|0;return a+20|0}function rI(a){a=a|0;return+(+g[a+48>>2])}function rJ(a){a=a|0;return a+28|0}function rK(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)!=0|0}function rL(b){b=b|0;return(a[b+44|0]&1)!=0|0}function rM(a){a=a|0;return+(+g[a+60>>2])}function rN(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function rO(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function rP(b,c){b=b|0;c=c|0;a[b+44|0]=c&1;return}function rQ(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function rR(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+36|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function rS(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function rT(a){a=a|0;return+(+g[a+44>>2])}function rU(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function rV(a,b){a=a|0;b=+b;g[a+44>>2]=b;return}function rW(b){b=b|0;return(a[b+52|0]&1)!=0|0}function rX(a,b){a=a|0;b=+b;g[a+48>>2]=b;return}function rY(a){a=a|0;return+(+g[a+36>>2])}function rZ(b,c){b=b|0;c=c|0;a[b+40|0]=c&1;return}function r_(a){a=a|0;return+(+g[a+56>>2])}function r$(a,b){a=a|0;b=+b;g[a+56>>2]=b;return}function r0(a){a=a|0;return+(+g[a+60>>2])}function r1(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function r2(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function r3(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0.0,i=0,j=0.0,k=0.0,l=0.0,m=0.0;c[a+8>>2]=b;c[a+12>>2]=d;f=e|0;h=+g[f>>2]- +g[b+12>>2];i=e+4|0;j=+g[i>>2]- +g[b+16>>2];k=+g[b+24>>2];l=+g[b+20>>2];e=a+20|0;m=+(k*j+h*(-0.0-l));g[e>>2]=h*k+j*l;g[e+4>>2]=m;m=+g[f>>2]- +g[d+12>>2];l=+g[i>>2]- +g[d+16>>2];j=+g[d+24>>2];k=+g[d+20>>2];i=a+28|0;h=+(j*l+m*(-0.0-k));g[i>>2]=m*j+l*k;g[i+4>>2]=h;g[a+36>>2]=+g[d+56>>2]- +g[b+56>>2];return}function r4(b){b=b|0;return(a[b+40|0]&1)!=0|0}function r5(a){a=a|0;return+(+g[a+48>>2])}function r6(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function r7(a){a=a|0;return a+20|0}function r8(a){a=a|0;return a+28|0}function r9(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)!=0|0}function sa(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function sb(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function sc(a,b){a=a|0;b=+b;g[a+60>>2]=b;return}function sd(b,c){b=b|0;c=c|0;a[b+52|0]=c&1;return}function se(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function sf(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+36|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function sg(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+44|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function sh(a,b){a=a|0;b=+b;g[a+60>>2]=b;return}function si(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function sj(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function sk(a){a=a|0;return a+28|0}function sl(a){a=a|0;return a+20|0}function sm(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function sn(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function so(a){a=a|0;return+(+g[a+60>>2])}function sp(a){a=a|0;return a+36|0}function sq(a){a=a|0;return a+44|0}function sr(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)!=0|0}function ss(a,b){a=a|0;b=+b;g[a+56>>2]=b;return}function st(a,b){a=a|0;b=+b;g[a+52>>2]=b;return}function su(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function sv(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function sw(){var b=0;b=vo(72)|0;vq(b|0,0,17);c[b>>2]=2;vq(b+20|0,0,16);g[b+36>>2]=1.0;g[b+40>>2]=0.0;g[b+44>>2]=0.0;a[b+48|0]=0;g[b+52>>2]=0.0;g[b+56>>2]=0.0;a[b+60|0]=0;g[b+64>>2]=0.0;g[b+68>>2]=0.0;return b|0}function sx(a){a=a|0;if((a|0)==0){return}vl(a);return}function sy(a){a=a|0;if((a|0)==0){return}vl(a);return}function sz(a,b){a=a|0;b=+b;g[a>>2]=+S(+b);g[a+4>>2]=+R(+b);return}function sA(a){a=a|0;return+(+X(+(+g[a>>2]),+(+g[a+4>>2])))}function sB(){return vo(8)|0}function sC(a){a=+a;var b=0;b=vo(8)|0;g[b>>2]=+S(+a);g[b+4>>2]=+R(+a);return b|0}function sD(){var b=0;b=vo(64)|0;vq(b|0,0,17);c[b>>2]=7;vq(b+20|0,0,16);g[b+36>>2]=1.0;g[b+40>>2]=0.0;a[b+44|0]=0;g[b+48>>2]=0.0;g[b+52>>2]=0.0;g[b+56>>2]=2.0;g[b+60>>2]=.699999988079071;return b|0}function sE(a){a=a|0;if((a|0)==0){return}vl(a);return}function sF(){var b=0;b=vo(64)|0;vq(b|0,0,17);c[b>>2]=1;g[b+44>>2]=0.0;g[b+48>>2]=0.0;g[b+60>>2]=0.0;g[b+56>>2]=0.0;a[b+52|0]=0;vq(b+20|0,0,21);return b|0}function sG(a){a=a|0;if((a|0)==0){return}vl(a);return}function sH(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;fI(a,b,c,d,e,f,g,h);return}function sI(a){a=a|0;if((a|0)==0){return}vl(a);return}function sJ(a){a=a|0;return+(+g[a+56>>2])}function sK(a){a=a|0;return+(+g[a+52>>2])}function sL(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function sM(a){a=a|0;return c[a+8>>2]|0}function sN(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function sO(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function sP(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function sQ(a){a=a|0;return c[a+12>>2]|0}function sR(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function sS(b){b=b|0;return(a[b+16|0]&1)!=0|0}function sT(a){a=a|0;return c[a>>2]|0}function sU(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function sV(a){a=a|0;return c[a+4>>2]|0}function sW(a,b){a=a|0;b=b|0;var d=0;d=b;b=a;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function sX(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+8|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function sY(a){a=a|0;return a|0}function sZ(a){a=a|0;return a+8|0}function s_(a){a=a|0;g[a>>2]=0.0;g[a+4>>2]=0.0;g[a+8>>2]=0.0;g[a+12>>2]=1.0;return}function s$(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;g[a>>2]=b;g[a+4>>2]=c;g[a+8>>2]=d;return}function s0(a,b){a=a|0;b=+b;g[a>>2]=b;return}function s1(a){a=a|0;return+(+g[a>>2])}function s2(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function s3(a){a=a|0;return+(+g[a+4>>2])}function s4(a){a=a|0;return+(+g[a+8>>2])}function s5(a,b){a=a|0;b=+b;g[a+4>>2]=b;return}function s6(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+8|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function s7(a){a=a|0;var b=0.0,c=0.0,d=0.0,e=0.0,f=0;b=+g[a+8>>2];c=+g[a>>2];d=+g[a+12>>2];e=+g[a+4>>2];if(!(b-c>=0.0&d-e>=0.0)){f=0;return f|0}if(!(c==c&!(C=0.0,C!=C)&c>+-p&c<+p)){f=0;return f|0}if(!(e==e&!(C=0.0,C!=C)&e>+-p&e<+p)){f=0;return f|0}if(!(b==b&!(C=0.0,C!=C)&b>+-p&b<+p)){f=0;return f|0}if(!(d==d&!(C=0.0,C!=C)&d>+-p)){f=0;return f|0}f=d<+p;return f|0}function s8(a,b){a=a|0;b=b|0;var c=0;if(+g[a>>2]>+g[b>>2]){c=0;return c|0}if(+g[a+4>>2]>+g[b+4>>2]){c=0;return c|0}if(+g[b+8>>2]>+g[a+8>>2]){c=0;return c|0}c=+g[b+12>>2]<=+g[a+12>>2];return c|0}function s9(b){b=b|0;var c=0.0,d=0;if(!(a[23120]|0)){a[23120]=1}c=+((+g[b+12>>2]- +g[b+4>>2])*.5);d=56;g[d>>2]=(+g[b+8>>2]- +g[b>>2])*.5;g[d+4>>2]=c;return 56}function ta(b){b=b|0;var c=0.0,d=0;if(!(a[23128]|0)){a[23128]=1}c=+((+g[b+4>>2]+ +g[b+12>>2])*.5);d=48;g[d>>2]=(+g[b>>2]+ +g[b+8>>2])*.5;g[d+4>>2]=c;return 48}function tb(a){a=a|0;return a+8|0}function tc(a){a=a|0;return+((+g[a+8>>2]- +g[a>>2]+(+g[a+12>>2]- +g[a+4>>2]))*2.0)}function td(a,b){a=a|0;b=b|0;var c=0.0,d=0.0,e=0.0,f=0.0,h=0,i=0.0;c=+g[a>>2];d=+g[b>>2];e=+g[a+4>>2];f=+g[b+4>>2];h=a;i=+(e<f?e:f);g[h>>2]=c<d?c:d;g[h+4>>2]=i;h=a+8|0;i=+g[h>>2];d=+g[b+8>>2];c=+g[a+12>>2];f=+g[b+12>>2];b=h;e=+(c>f?c:f);g[b>>2]=i>d?i:d;g[b+4>>2]=e;return}function te(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0,j=0.0;d=+g[b>>2];e=+g[c>>2];f=+g[b+4>>2];h=+g[c+4>>2];i=a;j=+(f<h?f:h);g[i>>2]=d<e?d:e;g[i+4>>2]=j;j=+g[b+8>>2];e=+g[c+8>>2];d=+g[b+12>>2];h=+g[c+12>>2];c=a+8|0;f=+(d>h?d:h);g[c>>2]=j>e?j:e;g[c+4>>2]=f;return}function tf(a,b){a=a|0;b=b|0;var d=0;d=b;b=a;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function tg(a){a=a|0;return a|0}function th(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function ti(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function tj(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function tk(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function tl(a){a=a|0;return+(+g[a+40>>2])}function tm(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function tn(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function to(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function tp(a){a=a|0;return a+20|0}function tq(a){a=a|0;return+(+g[a+36>>2])}function tr(a){a=a|0;return a+28|0}function ts(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)!=0|0}function tt(a){a=a|0;return+(+g[a+44>>2])}function tu(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function tv(a,b){a=a|0;b=+b;g[a+40>>2]=b;return}function tw(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0.0,i=0,j=0.0,k=0.0,l=0.0,m=0.0;c[a+8>>2]=b;c[a+12>>2]=d;f=e|0;h=+g[f>>2]- +g[b+12>>2];i=e+4|0;j=+g[i>>2]- +g[b+16>>2];k=+g[b+24>>2];l=+g[b+20>>2];e=a+20|0;m=+(k*j+h*(-0.0-l));g[e>>2]=h*k+j*l;g[e+4>>2]=m;m=+g[f>>2]- +g[d+12>>2];l=+g[i>>2]- +g[d+16>>2];j=+g[d+24>>2];k=+g[d+20>>2];i=a+28|0;h=+(j*l+m*(-0.0-k));g[i>>2]=m*j+l*k;g[i+4>>2]=h;g[a+36>>2]=+g[d+56>>2]- +g[b+56>>2];return}function tx(a,b){a=a|0;b=+b;g[a+44>>2]=b;return}function ty(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function tz(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function tA(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function tB(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function tC(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function tD(a){a=a|0;return+(+g[a+28>>2])}function tE(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function tF(a,b){a=a|0;b=+b;g[a+28>>2]=b;return}function tG(a){a=a|0;return+(+g[a+32>>2])}function tH(a){a=a|0;return a+20|0}function tI(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)!=0|0}function tJ(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function tK(a,b){a=a|0;b=+b;g[a+32>>2]=b;return}function tL(a){a=a|0;return+(+g[a+36>>2])}function tM(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}
function tN(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function tO(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function tP(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function tQ(a,b){a=a|0;b=+b;g[a+44>>2]=b;return}function tR(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function tS(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function tT(a){a=a|0;return+(+g[a+36>>2])}function tU(a){a=a|0;return a+20|0}function tV(a){a=a|0;return+(+g[a+40>>2])}function tW(a){a=a|0;return a+28|0}function tX(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)!=0|0}function tY(a){a=a|0;return+(+g[a+44>>2])}function tZ(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function t_(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function t$(a,b){a=a|0;b=+b;g[a+40>>2]=b;return}function t0(){var b=0;b=vo(64)|0;vq(b|0,0,16);c[b>>2]=4;g[b+20>>2]=-1.0;g[b+24>>2]=1.0;g[b+28>>2]=1.0;g[b+32>>2]=1.0;g[b+36>>2]=-1.0;g[b+40>>2]=0.0;g[b+44>>2]=1.0;g[b+48>>2]=0.0;g[b+52>>2]=0.0;g[b+56>>2]=0.0;g[b+60>>2]=1.0;a[b+16|0]=1;return b|0}function t1(a){a=a|0;if((a|0)==0){return}vl(a);return}function t2(){var a=0;a=vo(20)|0;vq(a|0,0,17);return a|0}function t3(a){a=a|0;if((a|0)==0){return}vl(a);return}function t4(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0;e=b;b=a;f=c[e+4>>2]|0;c[b>>2]=c[e>>2];c[b+4>>2]=f;g[a+8>>2]=+S(+d);g[a+12>>2]=+R(+d);return}function t5(){return vo(16)|0}function t6(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=vo(16)|0;e=a;a=d;f=c[e+4>>2]|0;c[a>>2]=c[e>>2];c[a+4>>2]=f;f=b;b=d+8|0;a=c[f+4>>2]|0;c[b>>2]=c[f>>2];c[b+4>>2]=a;return d|0}function t7(a){a=a|0;if((a|0)==0){return}vl(a);return}function t8(){return vo(12)|0}function t9(a,b,c){a=+a;b=+b;c=+c;var d=0;d=vo(12)|0;g[d>>2]=a;g[d+4>>2]=b;g[d+8>>2]=c;return d|0}function ua(a){a=a|0;if((a|0)==0){return}vl(a);return}function ub(){return vo(16)|0}function uc(a,b,c){a=a|0;b=b|0;c=c|0;return cc(a,b,c)|0}function ud(a){a=a|0;if((a|0)==0){return}vl(a);return}function ue(){var a=0;a=vo(48)|0;vq(a|0,0,17);c[a>>2]=8;vq(a+20|0,0,28);return a|0}function uf(){var a=0;a=vo(40)|0;vq(a|0,0,17);c[a>>2]=5;g[a+20>>2]=0.0;g[a+24>>2]=0.0;g[a+28>>2]=0.0;g[a+32>>2]=5.0;g[a+36>>2]=.699999988079071;return a|0}function ug(a){a=a|0;if((a|0)==0){return}vl(a);return}function uh(){var a=0;a=vo(48)|0;vq(a|0,0,17);c[a>>2]=3;vq(a+20|0,0,16);g[a+36>>2]=1.0;g[a+40>>2]=0.0;g[a+44>>2]=0.0;return a|0}function ui(a){a=a|0;if((a|0)==0){return}vl(a);return}function uj(a){a=a|0;return}function uk(a,b){a=a|0;b=b|0;return}function ul(a,b){a=a|0;b=b|0;return}function um(a){a=a|0;return}function un(a,b){a=a|0;b=b|0;return 0}function uo(a){a=a|0;return}function up(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+0.0}function uq(a){a=a|0;return}function ur(a){a=a|0;return}function us(a){a=a|0;return}function ut(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function uu(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function uv(a){a=a|0;return c[a+20>>2]|0}function uw(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function ux(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function uy(a,b){a=a|0;b=b|0;c[a+24>>2]=b;return}function uz(a,b){a=a|0;b=+b;g[a+28>>2]=b;return}function uA(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)!=0|0}function uB(a){a=a|0;return c[a+24>>2]|0}function uC(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function uD(a){a=a|0;return+(+g[a+28>>2])}function uE(a,b){a=a|0;b=b|0;c[a+20>>2]=b;return}function uF(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function uG(a){a=a|0;return c[a+8>>2]|0}function uH(a){a=a|0;return c[a>>2]|0}function uI(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function uJ(a){a=a|0;return c[a+12>>2]|0}function uK(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function uL(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function uM(a){a=a|0;return c[a+4>>2]|0}function uN(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function uO(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function uP(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function uQ(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;return}function uR(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function uS(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function uT(a){a=a|0;return a+20|0}function uU(a){a=a|0;return+(+g[a+36>>2])}function uV(a){a=a|0;return a+28|0}function uW(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)!=0|0}function uX(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function uY(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function uZ(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((c[d+8>>2]|0)!=(b|0)){return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function u_(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){return}g=d+28|0;if((c[g>>2]|0)==1){return}c[g>>2]=f;return}if((c[d>>2]|0)!=(b|0)){return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function u$(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0,k=0.0,l=0.0,m=0.0,n=0.0;c[a+8>>2]=b;c[a+12>>2]=d;h=e|0;i=+g[h>>2]- +g[b+12>>2];j=e+4|0;k=+g[j>>2]- +g[b+16>>2];l=+g[b+24>>2];m=+g[b+20>>2];b=a+20|0;n=+(l*k+i*(-0.0-m));g[b>>2]=i*l+k*m;g[b+4>>2]=n;b=f|0;n=+g[b>>2]- +g[d+12>>2];e=f+4|0;m=+g[e>>2]- +g[d+16>>2];k=+g[d+24>>2];l=+g[d+20>>2];d=a+28|0;i=+(k*m+n*(-0.0-l));g[d>>2]=n*k+m*l;g[d+4>>2]=i;i=+g[b>>2]- +g[h>>2];l=+g[e>>2]- +g[j>>2];g[a+36>>2]=+P(+(i*i+l*l));return}function u0(a){a=a|0;if((a|0)==0){return}vl(a);return}function u1(){var a=0;a=vo(32)|0;vq(a|0,0,17);c[a>>2]=6;c[a+20>>2]=0;c[a+24>>2]=0;g[a+28>>2]=1.0;return a|0}function u2(a){a=a|0;if((a|0)==0){return}vl(a);return}function u3(){return vo(16)|0}function u4(a){a=a|0;if((a|0)==0){return}vl(a);return}function u5(){var a=0;a=vo(40)|0;vq(a|0,0,17);c[a>>2]=10;g[a+20>>2]=-1.0;g[a+24>>2]=0.0;g[a+28>>2]=1.0;g[a+32>>2]=0.0;g[a+36>>2]=0.0;return a|0}function u6(a){a=a|0;vl(a);return}function u7(a){a=a|0;vl(a);return}function u8(a){a=a|0;vl(a);return}function u9(a){a=a|0;vl(a);return}function va(a){a=a|0;vl(a);return}function vb(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+56|0;f=e|0;do{if((a|0)==(b|0)){g=1}else{if((b|0)==0){g=0;break}h=vd(b,21432,21416,-1)|0;j=h;if((h|0)==0){g=0;break}vq(f|0,0,56);c[f>>2]=j;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;bQ[c[(c[h>>2]|0)+28>>2]&127](j,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;break}c[d>>2]=c[f+16>>2];g=1}}while(0);i=e;return g|0}function vc(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((b|0)!=(c[d+8>>2]|0)){g=c[b+8>>2]|0;bQ[c[(c[g>>2]|0)+28>>2]&127](g,d,e,f);return}g=d+16|0;b=c[g>>2]|0;if((b|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function vd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+56|0;g=f|0;h=c[a>>2]|0;j=a+(c[h-8>>2]|0)|0;k=c[h-4>>2]|0;h=k;c[g>>2]=d;c[g+4>>2]=a;c[g+8>>2]=b;c[g+12>>2]=e;e=g+16|0;b=g+20|0;a=g+24|0;l=g+28|0;m=g+32|0;n=g+40|0;vq(e|0,0,39);if((k|0)==(d|0)){c[g+48>>2]=1;bC[c[(c[k>>2]|0)+20>>2]&63](h,g,j,j,1,0);i=f;return((c[a>>2]|0)==1?j:0)|0}bn[c[(c[k>>2]|0)+24>>2]&63](h,g,j,1,0);j=c[g+36>>2]|0;do{if((j|0)==0){if((c[n>>2]|0)!=1){o=0;break}if((c[l>>2]|0)!=1){o=0;break}o=(c[m>>2]|0)==1?c[b>>2]|0:0}else if((j|0)==1){if((c[a>>2]|0)!=1){if((c[n>>2]|0)!=0){o=0;break}if((c[l>>2]|0)!=1){o=0;break}if((c[m>>2]|0)!=1){o=0;break}}o=c[e>>2]|0}else{o=0}}while(0);i=f;return o|0}function ve(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)!=(c[d>>2]|0)){h=c[b+8>>2]|0;bn[c[(c[h>>2]|0)+24>>2]&63](h,d,e,f,g);return}do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=d+52|0;a[j]=0;k=d+53|0;a[k]=0;l=c[b+8>>2]|0;bC[c[(c[l>>2]|0)+20>>2]&63](l,d,e,e,1,g);if((a[k]&1)==0){m=0;n=1971}else{if((a[j]&1)==0){m=1;n=1971}}L2185:do{if((n|0)==1971){c[h>>2]=e;j=d+40|0;c[j>>2]=(c[j>>2]|0)+1;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){n=1974;break}a[d+54|0]=1;if(m){break L2185}}else{n=1974}}while(0);if((n|0)==1974){if(m){break}}c[i>>2]=4;return}}while(0);c[i>>2]=3;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function vf(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0;if((b|0)!=(c[d+8>>2]|0)){i=c[b+8>>2]|0;bC[c[(c[i>>2]|0)+20>>2]&63](i,d,e,f,g,h);return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;h=c[f>>2]|0;if((h|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g;j=g}else{j=h}if(!((c[d+48>>2]|0)==1&(j|0)==1)){return}a[d+54|0]=1;return}function vg(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;if((c[d+8>>2]|0)!=(b|0)){return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1;a[d+54|0]=1;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g;i=g}else{i=b}if(!((c[d+48>>2]|0)==1&(i|0)==1)){return}a[d+54|0]=1;return}function vh(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[3258]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=13072+(h<<2)|0;j=13072+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[3258]=e&(1<<g^-1)}else{if(l>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{aQ();return 0;return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[3260]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=13072+(p<<2)|0;m=13072+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[3258]=e&(1<<r^-1)}else{if(l>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{aQ();return 0;return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[3260]|0;if((l|0)!=0){q=c[3263]|0;d=l>>>3;l=d<<1;f=13072+(l<<2)|0;k=c[3258]|0;h=1<<d;do{if((k&h|0)==0){c[3258]=k|h;s=f;t=13072+(l+2<<2)|0}else{d=13072+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[3262]|0)>>>0){s=g;t=d;break}aQ();return 0;return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[3260]=m;c[3263]=e;n=i;return n|0}l=c[3259]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[13336+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[3262]|0;if(r>>>0<i>>>0){aQ();return 0;return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){aQ();return 0;return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){aQ();return 0;return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){aQ();return 0;return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){aQ();return 0;return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{aQ();return 0;return 0}}}while(0);L2330:do{if((e|0)!=0){f=d+28|0;i=13336+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[3259]=c[3259]&(1<<c[f>>2]^-1);break L2330}else{if(e>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L2330}}}while(0);if(v>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4|0)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b|0)>>2]=p;f=c[3260]|0;if((f|0)!=0){e=c[3263]|0;i=f>>>3;f=i<<1;q=13072+(f<<2)|0;k=c[3258]|0;g=1<<i;do{if((k&g|0)==0){c[3258]=k|g;y=q;z=13072+(f+2<<2)|0}else{i=13072+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[3262]|0)>>>0){y=l;z=i;break}aQ();return 0;return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[3260]=p;c[3263]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[3259]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=(14-(h|f|l)|0)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[13336+(A<<2)>>2]|0;L2378:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L2378}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[13336+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[3260]|0)-g|0)>>>0){o=g;break}q=K;m=c[3262]|0;if(q>>>0<m>>>0){aQ();return 0;return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){aQ();return 0;return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){aQ();return 0;return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){aQ();return 0;return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){aQ();return 0;return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{aQ();return 0;return 0}}}while(0);L2428:do{if((e|0)!=0){i=K+28|0;m=13336+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[3259]=c[3259]&(1<<c[i>>2]^-1);break L2428}else{if(e>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L2428}}}while(0);if(L>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4|0)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g|0)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;m=13072+(e<<2)|0;r=c[3258]|0;j=1<<i;do{if((r&j|0)==0){c[3258]=r|j;O=m;P=13072+(e+2<<2)|0}else{i=13072+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[3262]|0)>>>0){O=d;P=i;break}aQ();return 0;return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8|0)>>2]=O;c[q+(g+12|0)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=(14-(d|r|i)|0)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=13336+(Q<<2)|0;c[q+(g+28|0)>>2]=Q;c[q+(g+20|0)>>2]=0;c[q+(g+16|0)>>2]=0;m=c[3259]|0;l=1<<Q;if((m&l|0)==0){c[3259]=m|l;c[j>>2]=e;c[q+(g+24|0)>>2]=j;c[q+(g+12|0)>>2]=e;c[q+(g+8|0)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=2177;break}else{l=l<<1;m=j}}if((T|0)==2177){if(S>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}else{c[S>>2]=e;c[q+(g+24|0)>>2]=m;c[q+(g+12|0)>>2]=e;c[q+(g+8|0)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[3262]|0;if(m>>>0<i>>>0){aQ();return 0;return 0}if(j>>>0<i>>>0){aQ();return 0;return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8|0)>>2]=j;c[q+(g+12|0)>>2]=m;c[q+(g+24|0)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[3260]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[3263]|0;if(S>>>0>15){R=J;c[3263]=R+o;c[3260]=S;c[R+(o+4|0)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[3260]=0;c[3263]=0;c[J+4>>2]=K|3;S=J+(K+4|0)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[3261]|0;if(o>>>0<J>>>0){S=J-o|0;c[3261]=S;J=c[3264]|0;K=J;c[3264]=K+o;c[K+(o+4|0)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[104]|0)==0){J=a2(8)|0;if((J-1&J|0)==0){c[106]=J;c[105]=J;c[107]=-1;c[108]=2097152;c[109]=0;c[3369]=0;c[104]=bl(0)&-16^1431655768;break}else{aQ();return 0;return 0}}}while(0);J=o+48|0;S=c[106]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[3368]|0;do{if((O|0)!=0){P=c[3366]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L2520:do{if((c[3369]&4|0)==0){O=c[3264]|0;L2522:do{if((O|0)==0){T=2207}else{L=O;P=13480;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=2207;break L2522}else{P=M}}if((P|0)==0){T=2207;break}L=R-(c[3261]|0)&Q;if(L>>>0>=2147483647){W=0;break}m=bg(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=2216}}while(0);do{if((T|0)==2207){O=bg(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[105]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=(S-g|0)+(m+g&-L)|0}L=c[3366]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}m=c[3368]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=bg($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=2216}}while(0);L2542:do{if((T|0)==2216){m=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=2227;break L2520}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[106]|0;O=(K-_|0)+g&-g;if(O>>>0>=2147483647){ac=_;break}if((bg(O|0)|0)==-1){bg(m|0);W=Y;break L2542}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=2227;break L2520}}}while(0);c[3369]=c[3369]|4;ad=W;T=2224}else{ad=0;T=2224}}while(0);do{if((T|0)==2224){if(S>>>0>=2147483647){break}W=bg(S|0)|0;Z=bg(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=2227}}}while(0);do{if((T|0)==2227){ad=(c[3366]|0)+aa|0;c[3366]=ad;if(ad>>>0>(c[3367]|0)>>>0){c[3367]=ad}ad=c[3264]|0;L2562:do{if((ad|0)==0){S=c[3262]|0;if((S|0)==0|ab>>>0<S>>>0){c[3262]=ab}c[3370]=ab;c[3371]=aa;c[3373]=0;c[3267]=c[104];c[3266]=-1;S=0;do{Y=S<<1;ac=13072+(Y<<2)|0;c[13072+(Y+3<<2)>>2]=ac;c[13072+(Y+2<<2)>>2]=ac;S=S+1|0;}while(S>>>0<32);S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=(aa-40|0)-ae|0;c[3264]=ab+ae;c[3261]=S;c[ab+(ae+4|0)>>2]=S|1;c[ab+(aa-36|0)>>2]=40;c[3265]=c[108]}else{S=13480;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=2239;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==2239){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa;ac=c[3264]|0;Y=(c[3261]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[3264]=Z+ai;c[3261]=W;c[Z+(ai+4|0)>>2]=W|1;c[Z+(Y+4|0)>>2]=40;c[3265]=c[108];break L2562}}while(0);if(ab>>>0<(c[3262]|0)>>>0){c[3262]=ab}S=ab+aa|0;Y=13480;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=2249;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==2249){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8|0)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa|0)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=(S-(ab+ak|0)|0)-o|0;c[ab+(ak+4|0)>>2]=o|3;do{if((Z|0)==(c[3264]|0)){J=(c[3261]|0)+K|0;c[3261]=J;c[3264]=_;c[ab+(W+4|0)>>2]=J|1}else{if((Z|0)==(c[3263]|0)){J=(c[3260]|0)+K|0;c[3260]=J;c[3263]=_;c[ab+(W+4|0)>>2]=J|1;c[ab+(J+W|0)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al|0)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L2607:do{if(X>>>0<256){U=c[ab+((al|8)+aa|0)>>2]|0;Q=c[ab+((aa+12|0)+al|0)>>2]|0;R=13072+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}if((c[U+12>>2]|0)==(Z|0)){break}aQ();return 0;return 0}}while(0);if((Q|0)==(U|0)){c[3258]=c[3258]&(1<<V^-1);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){am=m;break}aQ();return 0;return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;m=c[ab+((al|24)+aa|0)>>2]|0;P=c[ab+((aa+12|0)+al|0)>>2]|0;do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O|0)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa|0)|0;O=c[e>>2]|0;if((O|0)==0){an=0;break}else{ao=O;ap=e}}else{ao=L;ap=g}while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa|0)>>2]|0;if(g>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){aQ();return 0;return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;an=P;break}else{aQ();return 0;return 0}}}while(0);if((m|0)==0){break}P=ab+((aa+28|0)+al|0)|0;U=13336+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[3259]=c[3259]&(1<<c[P>>2]^-1);break L2607}else{if(m>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[m+20>>2]=an}if((an|0)==0){break L2607}}}while(0);if(an>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}c[an+24>>2]=m;R=al|16;P=c[ab+(R+aa|0)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R|0)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);aq=ab+(($|al)+aa|0)|0;ar=$+K|0}else{aq=Z;ar=K}J=aq+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4|0)>>2]=ar|1;c[ab+(ar+W|0)>>2]=ar;J=ar>>>3;if(ar>>>0<256){V=J<<1;X=13072+(V<<2)|0;P=c[3258]|0;m=1<<J;do{if((P&m|0)==0){c[3258]=P|m;as=X;at=13072+(V+2<<2)|0}else{J=13072+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[3262]|0)>>>0){as=U;at=J;break}aQ();return 0;return 0}}while(0);c[at>>2]=_;c[as+12>>2]=_;c[ab+(W+8|0)>>2]=as;c[ab+(W+12|0)>>2]=X;break}V=ac;m=ar>>>8;do{if((m|0)==0){au=0}else{if(ar>>>0>16777215){au=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=(14-(J|P|$)|0)+(U<<$>>>15)|0;au=ar>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=13336+(au<<2)|0;c[ab+(W+28|0)>>2]=au;c[ab+(W+20|0)>>2]=0;c[ab+(W+16|0)>>2]=0;X=c[3259]|0;Q=1<<au;if((X&Q|0)==0){c[3259]=X|Q;c[m>>2]=V;c[ab+(W+24|0)>>2]=m;c[ab+(W+12|0)>>2]=V;c[ab+(W+8|0)>>2]=V;break}if((au|0)==31){av=0}else{av=25-(au>>>1)|0}Q=ar<<av;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(ar|0)){break}aw=X+16+(Q>>>31<<2)|0;m=c[aw>>2]|0;if((m|0)==0){T=2322;break}else{Q=Q<<1;X=m}}if((T|0)==2322){if(aw>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}else{c[aw>>2]=V;c[ab+(W+24|0)>>2]=X;c[ab+(W+12|0)>>2]=V;c[ab+(W+8|0)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[3262]|0;if(X>>>0<$>>>0){aQ();return 0;return 0}if(m>>>0<$>>>0){aQ();return 0;return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ab+(W+8|0)>>2]=m;c[ab+(W+12|0)>>2]=X;c[ab+(W+24|0)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=13480;while(1){ax=c[W>>2]|0;if(ax>>>0<=Y>>>0){ay=c[W+4>>2]|0;az=ax+ay|0;if(az>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ax+(ay-39|0)|0;if((W&7|0)==0){aA=0}else{aA=-W&7}W=ax+((ay-47|0)+aA|0)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aB=0}else{aB=-_&7}_=(aa-40|0)-aB|0;c[3264]=ab+aB;c[3261]=_;c[ab+(aB+4|0)>>2]=_|1;c[ab+(aa-36|0)>>2]=40;c[3265]=c[108];c[ac+4>>2]=27;c[W>>2]=c[3370];c[W+4>>2]=c[13484>>2];c[W+8>>2]=c[13488>>2];c[W+12>>2]=c[13492>>2];c[3370]=ab;c[3371]=aa;c[3373]=0;c[3372]=W;W=ac+28|0;c[W>>2]=7;if((ac+32|0)>>>0<az>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<az>>>0){_=W}else{break}}}if((ac|0)==(Y|0)){break}_=ac-ad|0;W=Y+(_+4|0)|0;c[W>>2]=c[W>>2]&-2;c[ad+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256){K=W<<1;Z=13072+(K<<2)|0;S=c[3258]|0;m=1<<W;do{if((S&m|0)==0){c[3258]=S|m;aC=Z;aD=13072+(K+2<<2)|0}else{W=13072+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[3262]|0)>>>0){aC=Q;aD=W;break}aQ();return 0;return 0}}while(0);c[aD>>2]=ad;c[aC+12>>2]=ad;c[ad+8>>2]=aC;c[ad+12>>2]=Z;break}K=ad;m=_>>>8;do{if((m|0)==0){aE=0}else{if(_>>>0>16777215){aE=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ac=(Y+520192|0)>>>16&4;W=Y<<ac;Y=(W+245760|0)>>>16&2;Q=(14-(ac|S|Y)|0)+(W<<Y>>>15)|0;aE=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=13336+(aE<<2)|0;c[ad+28>>2]=aE;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[3259]|0;Q=1<<aE;if((Z&Q|0)==0){c[3259]=Z|Q;c[m>>2]=K;c[ad+24>>2]=m;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aE|0)==31){aF=0}else{aF=25-(aE>>>1)|0}Q=_<<aF;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}aG=Z+16+(Q>>>31<<2)|0;m=c[aG>>2]|0;if((m|0)==0){T=2357;break}else{Q=Q<<1;Z=m}}if((T|0)==2357){if(aG>>>0<(c[3262]|0)>>>0){aQ();return 0;return 0}else{c[aG>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[3262]|0;if(Z>>>0<m>>>0){aQ();return 0;return 0}if(_>>>0<m>>>0){aQ();return 0;return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=_;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[3261]|0;if(ad>>>0<=o>>>0){break}_=ad-o|0;c[3261]=_;ad=c[3264]|0;Q=ad;c[3264]=Q+o;c[Q+(o+4|0)>>2]=_|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[bi()>>2]=12;n=0;return n|0}function vi(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[3262]|0;if(b>>>0<e>>>0){aQ()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){aQ()}h=f&-8;i=a+(h-8|0)|0;j=i;L2779:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){aQ()}if((n|0)==(c[3263]|0)){p=a+(h-4|0)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[3260]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4|0)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8|0)>>2]|0;s=c[a+(l+12|0)>>2]|0;t=13072+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){aQ()}if((c[k+12>>2]|0)==(n|0)){break}aQ()}}while(0);if((s|0)==(k|0)){c[3258]=c[3258]&(1<<p^-1);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){aQ()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}aQ()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24|0)>>2]|0;v=c[a+(l+12|0)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20|0)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16|0)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){aQ()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8|0)>>2]|0;if(w>>>0<e>>>0){aQ()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){aQ()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{aQ()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28|0)|0;m=13336+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[3259]=c[3259]&(1<<c[v>>2]^-1);q=n;r=o;break L2779}else{if(p>>>0<(c[3262]|0)>>>0){aQ()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L2779}}}while(0);if(A>>>0<(c[3262]|0)>>>0){aQ()}c[A+24>>2]=p;t=c[a+(l+16|0)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[3262]|0)>>>0){aQ()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20|0)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[3262]|0)>>>0){aQ()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){aQ()}A=a+(h-4|0)|0;e=c[A>>2]|0;if((e&1|0)==0){aQ()}do{if((e&2|0)==0){if((j|0)==(c[3264]|0)){B=(c[3261]|0)+r|0;c[3261]=B;c[3264]=q;c[q+4>>2]=B|1;if((q|0)==(c[3263]|0)){c[3263]=0;c[3260]=0}if(B>>>0<=(c[3265]|0)>>>0){return}vn(0);return}if((j|0)==(c[3263]|0)){B=(c[3260]|0)+r|0;c[3260]=B;c[3263]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L2884:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=13072+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[3262]|0)>>>0){aQ()}if((c[u+12>>2]|0)==(j|0)){break}aQ()}}while(0);if((g|0)==(u|0)){c[3258]=c[3258]&(1<<C^-1);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[3262]|0)>>>0){aQ()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}aQ()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16|0)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12|0)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8|0)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[3262]|0)>>>0){aQ()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[3262]|0)>>>0){aQ()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){aQ()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{aQ()}}}while(0);if((f|0)==0){break}t=a+(h+20|0)|0;u=13336+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[3259]=c[3259]&(1<<c[t>>2]^-1);break L2884}else{if(f>>>0<(c[3262]|0)>>>0){aQ()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L2884}}}while(0);if(E>>>0<(c[3262]|0)>>>0){aQ()}c[E+24>>2]=f;b=c[a+(h+8|0)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[3262]|0)>>>0){aQ()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12|0)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[3262]|0)>>>0){aQ()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[3263]|0)){H=B;break}c[3260]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=13072+(d<<2)|0;A=c[3258]|0;E=1<<r;do{if((A&E|0)==0){c[3258]=A|E;I=e;J=13072+(d+2<<2)|0}else{r=13072+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[3262]|0)>>>0){I=h;J=r;break}aQ()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=(14-(E|J|d)|0)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=13336+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[3259]|0;d=1<<K;do{if((r&d|0)==0){c[3259]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=2536;break}else{A=A<<1;J=E}}if((N|0)==2536){if(M>>>0<(c[3262]|0)>>>0){aQ()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[3262]|0;if(J>>>0<E>>>0){aQ()}if(B>>>0<E>>>0){aQ()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[3266]|0)-1|0;c[3266]=q;if((q|0)==0){O=13488}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[3266]=-1;return}function vj(a){a=a|0;return}function vk(a){a=a|0;return 6752|0}function vl(a){a=a|0;if((a|0)!=0){vi(a)}return}function vm(a){a=a|0;vl(a);return}function vn(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;do{if((c[104]|0)==0){b=a2(8)|0;if((b-1&b|0)==0){c[106]=b;c[105]=b;c[107]=-1;c[108]=2097152;c[109]=0;c[3369]=0;c[104]=bl(0)&-16^1431655768;break}else{aQ();return 0;return 0}}}while(0);if(a>>>0>=4294967232){d=0;return d|0}b=c[3264]|0;if((b|0)==0){d=0;return d|0}e=c[3261]|0;do{if(e>>>0>(a+40|0)>>>0){f=c[106]|0;g=$(((((((-40-a|0)-1|0)+e|0)+f|0)>>>0)/(f>>>0)>>>0)-1|0,f);h=b;i=13480;while(1){j=c[i>>2]|0;if(j>>>0<=h>>>0){if((j+(c[i+4>>2]|0)|0)>>>0>h>>>0){k=i;break}}j=c[i+8>>2]|0;if((j|0)==0){k=0;break}else{i=j}}if((c[k+12>>2]&8|0)!=0){break}i=bg(0)|0;h=k+4|0;if((i|0)!=((c[k>>2]|0)+(c[h>>2]|0)|0)){break}j=bg(-(g>>>0>2147483646?-2147483648-f|0:g)|0)|0;l=bg(0)|0;if(!((j|0)!=-1&l>>>0<i>>>0)){break}j=i-l|0;if((i|0)==(l|0)){break}c[h>>2]=(c[h>>2]|0)-j;c[3366]=(c[3366]|0)-j;h=c[3264]|0;m=(c[3261]|0)-j|0;j=h;n=h+8|0;if((n&7|0)==0){o=0}else{o=-n&7}n=m-o|0;c[3264]=j+o;c[3261]=n;c[j+(o+4|0)>>2]=n|1;c[j+(m+4|0)>>2]=40;c[3265]=c[108];d=(i|0)!=(l|0)&1;return d|0}}while(0);if((c[3261]|0)>>>0<=(c[3265]|0)>>>0){d=0;return d|0}c[3265]=-1;d=0;return d|0}function vo(a){a=a|0;var b=0,d=0,e=0;b=(a|0)==0?1:a;while(1){d=vh(b)|0;if((d|0)!=0){e=2620;break}a=(B=c[5692]|0,c[5692]=B+0,B);if((a|0)==0){break}bO[a&63]()}if((e|0)==2620){return d|0}d=bh(4)|0;c[d>>2]=19248;aP(d|0,21384,78);return 0}function vp(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function vq(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function vr(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function vs(){a3()}function vt(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;bn[a&63](b|0,c|0,d|0,e|0,f|0)}function vu(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(0,a|0,b|0,c|0,d|0,e|0)}function vv(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(1,a|0,b|0,c|0,d|0,e|0)}function vw(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(2,a|0,b|0,c|0,d|0,e|0)}function vx(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(3,a|0,b|0,c|0,d|0,e|0)}function vy(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(4,a|0,b|0,c|0,d|0,e|0)}function vz(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(5,a|0,b|0,c|0,d|0,e|0)}function vA(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(6,a|0,b|0,c|0,d|0,e|0)}function vB(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(7,a|0,b|0,c|0,d|0,e|0)}function vC(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(8,a|0,b|0,c|0,d|0,e|0)}function vD(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(9,a|0,b|0,c|0,d|0,e|0)}function vE(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(10,a|0,b|0,c|0,d|0,e|0)}function vF(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(11,a|0,b|0,c|0,d|0,e|0)}function vG(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(12,a|0,b|0,c|0,d|0,e|0)}function vH(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(13,a|0,b|0,c|0,d|0,e|0)}function vI(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(14,a|0,b|0,c|0,d|0,e|0)}function vJ(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(15,a|0,b|0,c|0,d|0,e|0)}function vK(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(16,a|0,b|0,c|0,d|0,e|0)}function vL(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(17,a|0,b|0,c|0,d|0,e|0)}function vM(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(18,a|0,b|0,c|0,d|0,e|0)}function vN(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ah(19,a|0,b|0,c|0,d|0,e|0)}function vO(a,b,c){a=a|0;b=b|0;c=+c;bo[a&255](b|0,+c)}function vP(a,b){a=a|0;b=+b;ah(0,a|0,+b)}function vQ(a,b){a=a|0;b=+b;ah(1,a|0,+b)}function vR(a,b){a=a|0;b=+b;ah(2,a|0,+b)}function vS(a,b){a=a|0;b=+b;ah(3,a|0,+b)}function vT(a,b){a=a|0;b=+b;ah(4,a|0,+b)}function vU(a,b){a=a|0;b=+b;ah(5,a|0,+b)}function vV(a,b){a=a|0;b=+b;ah(6,a|0,+b)}function vW(a,b){a=a|0;b=+b;ah(7,a|0,+b)}function vX(a,b){a=a|0;b=+b;ah(8,a|0,+b)}function vY(a,b){a=a|0;b=+b;ah(9,a|0,+b)}function vZ(a,b){a=a|0;b=+b;ah(10,a|0,+b)}function v_(a,b){a=a|0;b=+b;ah(11,a|0,+b)}function v$(a,b){a=a|0;b=+b;ah(12,a|0,+b)}function v0(a,b){a=a|0;b=+b;ah(13,a|0,+b)}function v1(a,b){a=a|0;b=+b;ah(14,a|0,+b)}function v2(a,b){a=a|0;b=+b;ah(15,a|0,+b)}function v3(a,b){a=a|0;b=+b;ah(16,a|0,+b)}function v4(a,b){a=a|0;b=+b;ah(17,a|0,+b)}function v5(a,b){a=a|0;b=+b;ah(18,a|0,+b)}function v6(a,b){a=a|0;b=+b;ah(19,a|0,+b)}function v7(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=+d;e=e|0;f=f|0;bp[a&63](b|0,c|0,+d,e|0,f|0)}function v8(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(0,a|0,b|0,+c,d|0,e|0)}function v9(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(1,a|0,b|0,+c,d|0,e|0)}function wa(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(2,a|0,b|0,+c,d|0,e|0)}function wb(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(3,a|0,b|0,+c,d|0,e|0)}function wc(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(4,a|0,b|0,+c,d|0,e|0)}function wd(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(5,a|0,b|0,+c,d|0,e|0)}function we(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(6,a|0,b|0,+c,d|0,e|0)}function wf(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(7,a|0,b|0,+c,d|0,e|0)}function wg(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(8,a|0,b|0,+c,d|0,e|0)}function wh(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(9,a|0,b|0,+c,d|0,e|0)}function wi(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(10,a|0,b|0,+c,d|0,e|0)}function wj(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(11,a|0,b|0,+c,d|0,e|0)}function wk(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(12,a|0,b|0,+c,d|0,e|0)}function wl(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(13,a|0,b|0,+c,d|0,e|0)}function wm(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(14,a|0,b|0,+c,d|0,e|0)}function wn(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(15,a|0,b|0,+c,d|0,e|0)}function wo(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(16,a|0,b|0,+c,d|0,e|0)}function wp(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(17,a|0,b|0,+c,d|0,e|0)}function wq(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(18,a|0,b|0,+c,d|0,e|0)}function wr(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ah(19,a|0,b|0,+c,d|0,e|0)}function ws(a,b){a=a|0;b=b|0;bq[a&511](b|0)}function wt(a){a=a|0;ah(0,a|0)}function wu(a){a=a|0;ah(1,a|0)}function wv(a){a=a|0;ah(2,a|0)}function ww(a){a=a|0;ah(3,a|0)}function wx(a){a=a|0;ah(4,a|0)}function wy(a){a=a|0;ah(5,a|0)}function wz(a){a=a|0;ah(6,a|0)}function wA(a){a=a|0;ah(7,a|0)}function wB(a){a=a|0;ah(8,a|0)}function wC(a){a=a|0;ah(9,a|0)}function wD(a){a=a|0;ah(10,a|0)}function wE(a){a=a|0;ah(11,a|0)}function wF(a){a=a|0;ah(12,a|0)}function wG(a){a=a|0;ah(13,a|0)}function wH(a){a=a|0;ah(14,a|0)}function wI(a){a=a|0;ah(15,a|0)}function wJ(a){a=a|0;ah(16,a|0)}function wK(a){a=a|0;ah(17,a|0)}function wL(a){a=a|0;ah(18,a|0)}function wM(a){a=a|0;ah(19,a|0)}function wN(a,b,c){a=a|0;b=b|0;c=c|0;br[a&511](b|0,c|0)}function wO(a,b){a=a|0;b=b|0;ah(0,a|0,b|0)}function wP(a,b){a=a|0;b=b|0;ah(1,a|0,b|0)}function wQ(a,b){a=a|0;b=b|0;ah(2,a|0,b|0)}function wR(a,b){a=a|0;b=b|0;ah(3,a|0,b|0)}function wS(a,b){a=a|0;b=b|0;ah(4,a|0,b|0)}function wT(a,b){a=a|0;b=b|0;ah(5,a|0,b|0)}function wU(a,b){a=a|0;b=b|0;ah(6,a|0,b|0)}function wV(a,b){a=a|0;b=b|0;ah(7,a|0,b|0)}function wW(a,b){a=a|0;b=b|0;ah(8,a|0,b|0)}function wX(a,b){a=a|0;b=b|0;ah(9,a|0,b|0)}function wY(a,b){a=a|0;b=b|0;ah(10,a|0,b|0)}function wZ(a,b){a=a|0;b=b|0;ah(11,a|0,b|0)}function w_(a,b){a=a|0;b=b|0;ah(12,a|0,b|0)}function w$(a,b){a=a|0;b=b|0;ah(13,a|0,b|0)}function w0(a,b){a=a|0;b=b|0;ah(14,a|0,b|0)}function w1(a,b){a=a|0;b=b|0;ah(15,a|0,b|0)}function w2(a,b){a=a|0;b=b|0;ah(16,a|0,b|0)}function w3(a,b){a=a|0;b=b|0;ah(17,a|0,b|0)}function w4(a,b){a=a|0;b=b|0;ah(18,a|0,b|0)}function w5(a,b){a=a|0;b=b|0;ah(19,a|0,b|0)}function w6(a,b){a=a|0;b=b|0;return bs[a&1023](b|0)|0}function w7(a){a=a|0;return ah(0,a|0)|0}function w8(a){a=a|0;return ah(1,a|0)|0}function w9(a){a=a|0;return ah(2,a|0)|0}function xa(a){a=a|0;return ah(3,a|0)|0}function xb(a){a=a|0;return ah(4,a|0)|0}function xc(a){a=a|0;return ah(5,a|0)|0}function xd(a){a=a|0;return ah(6,a|0)|0}function xe(a){a=a|0;return ah(7,a|0)|0}function xf(a){a=a|0;return ah(8,a|0)|0}function xg(a){a=a|0;return ah(9,a|0)|0}function xh(a){a=a|0;return ah(10,a|0)|0}function xi(a){a=a|0;return ah(11,a|0)|0}function xj(a){a=a|0;return ah(12,a|0)|0}function xk(a){a=a|0;return ah(13,a|0)|0}function xl(a){a=a|0;return ah(14,a|0)|0}function xm(a){a=a|0;return ah(15,a|0)|0}function xn(a){a=a|0;return ah(16,a|0)|0}function xo(a){a=a|0;return ah(17,a|0)|0}function xp(a){a=a|0;return ah(18,a|0)|0}function xq(a){a=a|0;return ah(19,a|0)|0}function xr(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=+d;e=e|0;bt[a&63](b|0,c|0,+d,e|0)}function xs(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(0,a|0,b|0,+c,d|0)}function xt(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(1,a|0,b|0,+c,d|0)}function xu(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(2,a|0,b|0,+c,d|0)}function xv(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(3,a|0,b|0,+c,d|0)}function xw(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(4,a|0,b|0,+c,d|0)}function xx(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(5,a|0,b|0,+c,d|0)}function xy(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(6,a|0,b|0,+c,d|0)}function xz(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(7,a|0,b|0,+c,d|0)}function xA(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(8,a|0,b|0,+c,d|0)}function xB(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(9,a|0,b|0,+c,d|0)}function xC(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(10,a|0,b|0,+c,d|0)}function xD(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(11,a|0,b|0,+c,d|0)}function xE(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(12,a|0,b|0,+c,d|0)}function xF(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(13,a|0,b|0,+c,d|0)}function xG(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(14,a|0,b|0,+c,d|0)}function xH(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(15,a|0,b|0,+c,d|0)}function xI(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(16,a|0,b|0,+c,d|0)}function xJ(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(17,a|0,b|0,+c,d|0)}function xK(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(18,a|0,b|0,+c,d|0)}function xL(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ah(19,a|0,b|0,+c,d|0)}function xM(a,b){a=a|0;b=+b;return bu[a&63](+b)|0}function xN(a){a=+a;return ah(0,+a)|0}function xO(a){a=+a;return ah(1,+a)|0}function xP(a){a=+a;return ah(2,+a)|0}function xQ(a){a=+a;return ah(3,+a)|0}function xR(a){a=+a;return ah(4,+a)|0}function xS(a){a=+a;return ah(5,+a)|0}function xT(a){a=+a;return ah(6,+a)|0}function xU(a){a=+a;return ah(7,+a)|0}function xV(a){a=+a;return ah(8,+a)|0}function xW(a){a=+a;return ah(9,+a)|0}function xX(a){a=+a;return ah(10,+a)|0}function xY(a){a=+a;return ah(11,+a)|0}function xZ(a){a=+a;return ah(12,+a)|0}function x_(a){a=+a;return ah(13,+a)|0}function x$(a){a=+a;return ah(14,+a)|0}function x0(a){a=+a;return ah(15,+a)|0}function x1(a){a=+a;return ah(16,+a)|0}function x2(a){a=+a;return ah(17,+a)|0}function x3(a){a=+a;return ah(18,+a)|0}function x4(a){a=+a;return ah(19,+a)|0}function x5(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return bv[a&63](b|0,c|0,d|0,e|0)|0}function x6(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(0,a|0,b|0,c|0,d|0)|0}function x7(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(1,a|0,b|0,c|0,d|0)|0}function x8(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(2,a|0,b|0,c|0,d|0)|0}function x9(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(3,a|0,b|0,c|0,d|0)|0}function ya(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(4,a|0,b|0,c|0,d|0)|0}function yb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(5,a|0,b|0,c|0,d|0)|0}function yc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(6,a|0,b|0,c|0,d|0)|0}function yd(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(7,a|0,b|0,c|0,d|0)|0}function ye(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(8,a|0,b|0,c|0,d|0)|0}function yf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(9,a|0,b|0,c|0,d|0)|0}function yg(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(10,a|0,b|0,c|0,d|0)|0}function yh(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(11,a|0,b|0,c|0,d|0)|0}function yi(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(12,a|0,b|0,c|0,d|0)|0}function yj(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(13,a|0,b|0,c|0,d|0)|0}function yk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(14,a|0,b|0,c|0,d|0)|0}function yl(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(15,a|0,b|0,c|0,d|0)|0}function ym(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(16,a|0,b|0,c|0,d|0)|0}function yn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(17,a|0,b|0,c|0,d|0)|0}function yo(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(18,a|0,b|0,c|0,d|0)|0}function yp(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ah(19,a|0,b|0,c|0,d|0)|0}function yq(a,b,c,d,e,f){a=a|0;b=b|0;c=+c;d=+d;e=e|0;f=+f;bw[a&63](b|0,+c,+d,e|0,+f)}function yr(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(0,a|0,+b,+c,d|0,+e)}function ys(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(1,a|0,+b,+c,d|0,+e)}function yt(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(2,a|0,+b,+c,d|0,+e)}function yu(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(3,a|0,+b,+c,d|0,+e)}function yv(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(4,a|0,+b,+c,d|0,+e)}function yw(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(5,a|0,+b,+c,d|0,+e)}function yx(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(6,a|0,+b,+c,d|0,+e)}function yy(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(7,a|0,+b,+c,d|0,+e)}function yz(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(8,a|0,+b,+c,d|0,+e)}function yA(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(9,a|0,+b,+c,d|0,+e)}function yB(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(10,a|0,+b,+c,d|0,+e)}function yC(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(11,a|0,+b,+c,d|0,+e)}function yD(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(12,a|0,+b,+c,d|0,+e)}function yE(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(13,a|0,+b,+c,d|0,+e)}function yF(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(14,a|0,+b,+c,d|0,+e)}function yG(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(15,a|0,+b,+c,d|0,+e)}function yH(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(16,a|0,+b,+c,d|0,+e)}function yI(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(17,a|0,+b,+c,d|0,+e)}function yJ(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(18,a|0,+b,+c,d|0,+e)}function yK(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ah(19,a|0,+b,+c,d|0,+e)}function yL(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return bx[a&127](b|0,c|0,d|0)|0}function yM(a,b,c){a=a|0;b=b|0;c=c|0;return ah(0,a|0,b|0,c|0)|0}function yN(a,b,c){a=a|0;b=b|0;c=c|0;return ah(1,a|0,b|0,c|0)|0}function yO(a,b,c){a=a|0;b=b|0;c=c|0;return ah(2,a|0,b|0,c|0)|0}function yP(a,b,c){a=a|0;b=b|0;c=c|0;return ah(3,a|0,b|0,c|0)|0}function yQ(a,b,c){a=a|0;b=b|0;c=c|0;return ah(4,a|0,b|0,c|0)|0}function yR(a,b,c){a=a|0;b=b|0;c=c|0;return ah(5,a|0,b|0,c|0)|0}function yS(a,b,c){a=a|0;b=b|0;c=c|0;return ah(6,a|0,b|0,c|0)|0}function yT(a,b,c){a=a|0;b=b|0;c=c|0;return ah(7,a|0,b|0,c|0)|0}function yU(a,b,c){a=a|0;b=b|0;c=c|0;return ah(8,a|0,b|0,c|0)|0}function yV(a,b,c){a=a|0;b=b|0;c=c|0;return ah(9,a|0,b|0,c|0)|0}function yW(a,b,c){a=a|0;b=b|0;c=c|0;return ah(10,a|0,b|0,c|0)|0}function yX(a,b,c){a=a|0;b=b|0;c=c|0;return ah(11,a|0,b|0,c|0)|0}function yY(a,b,c){a=a|0;b=b|0;c=c|0;return ah(12,a|0,b|0,c|0)|0}function yZ(a,b,c){a=a|0;b=b|0;c=c|0;return ah(13,a|0,b|0,c|0)|0}function y_(a,b,c){a=a|0;b=b|0;c=c|0;return ah(14,a|0,b|0,c|0)|0}function y$(a,b,c){a=a|0;b=b|0;c=c|0;return ah(15,a|0,b|0,c|0)|0}function y0(a,b,c){a=a|0;b=b|0;c=c|0;return ah(16,a|0,b|0,c|0)|0}function y1(a,b,c){a=a|0;b=b|0;c=c|0;return ah(17,a|0,b|0,c|0)|0}function y2(a,b,c){a=a|0;b=b|0;c=c|0;return ah(18,a|0,b|0,c|0)|0}function y3(a,b,c){a=a|0;b=b|0;c=c|0;return ah(19,a|0,b|0,c|0)|0}function y4(a,b,c){a=a|0;b=b|0;c=+c;return+by[a&127](b|0,+c)}function y5(a,b){a=a|0;b=+b;return+ah(0,a|0,+b)}function y6(a,b){a=a|0;b=+b;return+ah(1,a|0,+b)}function y7(a,b){a=a|0;b=+b;return+ah(2,a|0,+b)}function y8(a,b){a=a|0;b=+b;return+ah(3,a|0,+b)}function y9(a,b){a=a|0;b=+b;return+ah(4,a|0,+b)}function za(a,b){a=a|0;b=+b;return+ah(5,a|0,+b)}function zb(a,b){a=a|0;b=+b;return+ah(6,a|0,+b)}function zc(a,b){a=a|0;b=+b;return+ah(7,a|0,+b)}function zd(a,b){a=a|0;b=+b;return+ah(8,a|0,+b)}function ze(a,b){a=a|0;b=+b;return+ah(9,a|0,+b)}function zf(a,b){a=a|0;b=+b;return+ah(10,a|0,+b)}function zg(a,b){a=a|0;b=+b;return+ah(11,a|0,+b)}function zh(a,b){a=a|0;b=+b;return+ah(12,a|0,+b)}function zi(a,b){a=a|0;b=+b;return+ah(13,a|0,+b)}function zj(a,b){a=a|0;b=+b;return+ah(14,a|0,+b)}function zk(a,b){a=a|0;b=+b;return+ah(15,a|0,+b)}function zl(a,b){a=a|0;b=+b;return+ah(16,a|0,+b)}function zm(a,b){a=a|0;b=+b;return+ah(17,a|0,+b)}function zn(a,b){a=a|0;b=+b;return+ah(18,a|0,+b)}function zo(a,b){a=a|0;b=+b;return+ah(19,a|0,+b)}function zp(a,b,c,d){a=a|0;b=b|0;c=+c;d=+d;bz[a&63](b|0,+c,+d)}function zq(a,b,c){a=a|0;b=+b;c=+c;ah(0,a|0,+b,+c)}function zr(a,b,c){a=a|0;b=+b;c=+c;ah(1,a|0,+b,+c)}function zs(a,b,c){a=a|0;b=+b;c=+c;ah(2,a|0,+b,+c)}function zt(a,b,c){a=a|0;b=+b;c=+c;ah(3,a|0,+b,+c)}function zu(a,b,c){a=a|0;b=+b;c=+c;ah(4,a|0,+b,+c)}function zv(a,b,c){a=a|0;b=+b;c=+c;ah(5,a|0,+b,+c)}function zw(a,b,c){a=a|0;b=+b;c=+c;ah(6,a|0,+b,+c)}function zx(a,b,c){a=a|0;b=+b;c=+c;ah(7,a|0,+b,+c)}function zy(a,b,c){a=a|0;b=+b;c=+c;ah(8,a|0,+b,+c)}function zz(a,b,c){a=a|0;b=+b;c=+c;ah(9,a|0,+b,+c)}function zA(a,b,c){a=a|0;b=+b;c=+c;ah(10,a|0,+b,+c)}function zB(a,b,c){a=a|0;b=+b;c=+c;ah(11,a|0,+b,+c)}function zC(a,b,c){a=a|0;b=+b;c=+c;ah(12,a|0,+b,+c)}function zD(a,b,c){a=a|0;b=+b;c=+c;ah(13,a|0,+b,+c)}function zE(a,b,c){a=a|0;b=+b;c=+c;ah(14,a|0,+b,+c)}function zF(a,b,c){a=a|0;b=+b;c=+c;ah(15,a|0,+b,+c)}function zG(a,b,c){a=a|0;b=+b;c=+c;ah(16,a|0,+b,+c)}function zH(a,b,c){a=a|0;b=+b;c=+c;ah(17,a|0,+b,+c)}function zI(a,b,c){a=a|0;b=+b;c=+c;ah(18,a|0,+b,+c)}function zJ(a,b,c){a=a|0;b=+b;c=+c;ah(19,a|0,+b,+c)}function zK(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=+i;bA[a&63](b|0,c|0,d|0,e|0,f|0,g|0,h|0,+i)}function zL(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(0,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zM(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(1,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zN(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(2,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zO(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(3,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zP(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(4,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zQ(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(5,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zR(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(6,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zS(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(7,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zT(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(8,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zU(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(9,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zV(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(10,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zW(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(11,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zX(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(12,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zY(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(13,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zZ(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(14,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function z_(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(15,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function z$(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(16,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function z0(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(17,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function z1(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(18,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function z2(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ah(19,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function z3(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=+d;e=+e;bB[a&63](b|0,+c,+d,+e)}function z4(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(0,a|0,+b,+c,+d)}function z5(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(1,a|0,+b,+c,+d)}function z6(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(2,a|0,+b,+c,+d)}function z7(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(3,a|0,+b,+c,+d)}function z8(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(4,a|0,+b,+c,+d)}function z9(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(5,a|0,+b,+c,+d)}function Aa(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(6,a|0,+b,+c,+d)}function Ab(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(7,a|0,+b,+c,+d)}function Ac(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(8,a|0,+b,+c,+d)}function Ad(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(9,a|0,+b,+c,+d)}function Ae(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(10,a|0,+b,+c,+d)}function Af(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(11,a|0,+b,+c,+d)}function Ag(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(12,a|0,+b,+c,+d)}function Ah(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(13,a|0,+b,+c,+d)}function Ai(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(14,a|0,+b,+c,+d)}function Aj(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(15,a|0,+b,+c,+d)}function Ak(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(16,a|0,+b,+c,+d)}function Al(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(17,a|0,+b,+c,+d)}function Am(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(18,a|0,+b,+c,+d)}function An(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ah(19,a|0,+b,+c,+d)}function Ao(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;bC[a&63](b|0,c|0,d|0,e|0,f|0,g|0)}function Ap(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(0,a|0,b|0,c|0,d|0,e|0,f|0)}function Aq(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(1,a|0,b|0,c|0,d|0,e|0,f|0)}function Ar(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(2,a|0,b|0,c|0,d|0,e|0,f|0)}function As(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(3,a|0,b|0,c|0,d|0,e|0,f|0)}function At(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(4,a|0,b|0,c|0,d|0,e|0,f|0)}function Au(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(5,a|0,b|0,c|0,d|0,e|0,f|0)}function Av(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(6,a|0,b|0,c|0,d|0,e|0,f|0)}function Aw(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(7,a|0,b|0,c|0,d|0,e|0,f|0)}function Ax(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(8,a|0,b|0,c|0,d|0,e|0,f|0)}function Ay(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(9,a|0,b|0,c|0,d|0,e|0,f|0)}function Az(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(10,a|0,b|0,c|0,d|0,e|0,f|0)}function AA(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(11,a|0,b|0,c|0,d|0,e|0,f|0)}function AB(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(12,a|0,b|0,c|0,d|0,e|0,f|0)}function AC(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(13,a|0,b|0,c|0,d|0,e|0,f|0)}function AD(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(14,a|0,b|0,c|0,d|0,e|0,f|0)}function AE(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(15,a|0,b|0,c|0,d|0,e|0,f|0)}function AF(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(16,a|0,b|0,c|0,d|0,e|0,f|0)}function AG(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(17,a|0,b|0,c|0,d|0,e|0,f|0)}function AH(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(18,a|0,b|0,c|0,d|0,e|0,f|0)}function AI(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ah(19,a|0,b|0,c|0,d|0,e|0,f|0)}function AJ(a,b,c,d){a=a|0;b=b|0;c=c|0;d=+d;return bD[a&63](b|0,c|0,+d)|0}function AK(a,b,c){a=a|0;b=b|0;c=+c;return ah(0,a|0,b|0,+c)|0}function AL(a,b,c){a=a|0;b=b|0;c=+c;return ah(1,a|0,b|0,+c)|0}function AM(a,b,c){a=a|0;b=b|0;c=+c;return ah(2,a|0,b|0,+c)|0}function AN(a,b,c){a=a|0;b=b|0;c=+c;return ah(3,a|0,b|0,+c)|0}function AO(a,b,c){a=a|0;b=b|0;c=+c;return ah(4,a|0,b|0,+c)|0}function AP(a,b,c){a=a|0;b=b|0;c=+c;return ah(5,a|0,b|0,+c)|0}function AQ(a,b,c){a=a|0;b=b|0;c=+c;return ah(6,a|0,b|0,+c)|0}function AR(a,b,c){a=a|0;b=b|0;c=+c;return ah(7,a|0,b|0,+c)|0}function AS(a,b,c){a=a|0;b=b|0;c=+c;return ah(8,a|0,b|0,+c)|0}function AT(a,b,c){a=a|0;b=b|0;c=+c;return ah(9,a|0,b|0,+c)|0}function AU(a,b,c){a=a|0;b=b|0;c=+c;return ah(10,a|0,b|0,+c)|0}function AV(a,b,c){a=a|0;b=b|0;c=+c;return ah(11,a|0,b|0,+c)|0}function AW(a,b,c){a=a|0;b=b|0;c=+c;return ah(12,a|0,b|0,+c)|0}function AX(a,b,c){a=a|0;b=b|0;c=+c;return ah(13,a|0,b|0,+c)|0}function AY(a,b,c){a=a|0;b=b|0;c=+c;return ah(14,a|0,b|0,+c)|0}function AZ(a,b,c){a=a|0;b=b|0;c=+c;return ah(15,a|0,b|0,+c)|0}function A_(a,b,c){a=a|0;b=b|0;c=+c;return ah(16,a|0,b|0,+c)|0}function A$(a,b,c){a=a|0;b=b|0;c=+c;return ah(17,a|0,b|0,+c)|0}function A0(a,b,c){a=a|0;b=b|0;c=+c;return ah(18,a|0,b|0,+c)|0}function A1(a,b,c){a=a|0;b=b|0;c=+c;return ah(19,a|0,b|0,+c)|0}function A2(a,b,c){a=a|0;b=b|0;c=+c;return bE[a&63](b|0,+c)|0}function A3(a,b){a=a|0;b=+b;return ah(0,a|0,+b)|0}function A4(a,b){a=a|0;b=+b;return ah(1,a|0,+b)|0}function A5(a,b){a=a|0;b=+b;return ah(2,a|0,+b)|0}function A6(a,b){a=a|0;b=+b;return ah(3,a|0,+b)|0}function A7(a,b){a=a|0;b=+b;return ah(4,a|0,+b)|0}function A8(a,b){a=a|0;b=+b;return ah(5,a|0,+b)|0}function A9(a,b){a=a|0;b=+b;return ah(6,a|0,+b)|0}function Ba(a,b){a=a|0;b=+b;return ah(7,a|0,+b)|0}function Bb(a,b){a=a|0;b=+b;return ah(8,a|0,+b)|0}function Bc(a,b){a=a|0;b=+b;return ah(9,a|0,+b)|0}function Bd(a,b){a=a|0;b=+b;return ah(10,a|0,+b)|0}function Be(a,b){a=a|0;b=+b;return ah(11,a|0,+b)|0}function Bf(a,b){a=a|0;b=+b;return ah(12,a|0,+b)|0}function Bg(a,b){a=a|0;b=+b;return ah(13,a|0,+b)|0}function Bh(a,b){a=a|0;b=+b;return ah(14,a|0,+b)|0}function Bi(a,b){a=a|0;b=+b;return ah(15,a|0,+b)|0}function Bj(a,b){a=a|0;b=+b;return ah(16,a|0,+b)|0}function Bk(a,b){a=a|0;b=+b;return ah(17,a|0,+b)|0}function Bl(a,b){a=a|0;b=+b;return ah(18,a|0,+b)|0}function Bm(a,b){a=a|0;b=+b;return ah(19,a|0,+b)|0}function Bn(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;bF[a&63](b|0,+c,d|0,e|0)}function Bo(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(0,a|0,+b,c|0,d|0)}function Bp(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(1,a|0,+b,c|0,d|0)}function Bq(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(2,a|0,+b,c|0,d|0)}function Br(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(3,a|0,+b,c|0,d|0)}function Bs(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(4,a|0,+b,c|0,d|0)}function Bt(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(5,a|0,+b,c|0,d|0)}function Bu(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(6,a|0,+b,c|0,d|0)}function Bv(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(7,a|0,+b,c|0,d|0)}function Bw(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(8,a|0,+b,c|0,d|0)}function Bx(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(9,a|0,+b,c|0,d|0)}function By(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(10,a|0,+b,c|0,d|0)}function Bz(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(11,a|0,+b,c|0,d|0)}function BA(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(12,a|0,+b,c|0,d|0)}function BB(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(13,a|0,+b,c|0,d|0)}function BC(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(14,a|0,+b,c|0,d|0)}function BD(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(15,a|0,+b,c|0,d|0)}function BE(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(16,a|0,+b,c|0,d|0)}function BF(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(17,a|0,+b,c|0,d|0)}function BG(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(18,a|0,+b,c|0,d|0)}function BH(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ah(19,a|0,+b,c|0,d|0)}function BI(a,b){a=a|0;b=b|0;return+bG[a&511](b|0)}function BJ(a){a=a|0;return+ah(0,a|0)}function BK(a){a=a|0;return+ah(1,a|0)}function BL(a){a=a|0;return+ah(2,a|0)}function BM(a){a=a|0;return+ah(3,a|0)}function BN(a){a=a|0;return+ah(4,a|0)}function BO(a){a=a|0;return+ah(5,a|0)}function BP(a){a=a|0;return+ah(6,a|0)}function BQ(a){a=a|0;return+ah(7,a|0)}function BR(a){a=a|0;return+ah(8,a|0)}function BS(a){a=a|0;return+ah(9,a|0)}function BT(a){a=a|0;return+ah(10,a|0)}function BU(a){a=a|0;return+ah(11,a|0)}function BV(a){a=a|0;return+ah(12,a|0)}function BW(a){a=a|0;return+ah(13,a|0)}function BX(a){a=a|0;return+ah(14,a|0)}function BY(a){a=a|0;return+ah(15,a|0)}function BZ(a){a=a|0;return+ah(16,a|0)}function B_(a){a=a|0;return+ah(17,a|0)}function B$(a){a=a|0;return+ah(18,a|0)}function B0(a){a=a|0;return+ah(19,a|0)}function B1(a,b,c){a=a|0;b=b|0;c=c|0;return bH[a&255](b|0,c|0)|0}function B2(a,b){a=a|0;b=b|0;return ah(0,a|0,b|0)|0}function B3(a,b){a=a|0;b=b|0;return ah(1,a|0,b|0)|0}function B4(a,b){a=a|0;b=b|0;return ah(2,a|0,b|0)|0}function B5(a,b){a=a|0;b=b|0;return ah(3,a|0,b|0)|0}function B6(a,b){a=a|0;b=b|0;return ah(4,a|0,b|0)|0}function B7(a,b){a=a|0;b=b|0;return ah(5,a|0,b|0)|0}function B8(a,b){a=a|0;b=b|0;return ah(6,a|0,b|0)|0}function B9(a,b){a=a|0;b=b|0;return ah(7,a|0,b|0)|0}function Ca(a,b){a=a|0;b=b|0;return ah(8,a|0,b|0)|0}function Cb(a,b){a=a|0;b=b|0;return ah(9,a|0,b|0)|0}function Cc(a,b){a=a|0;b=b|0;return ah(10,a|0,b|0)|0}function Cd(a,b){a=a|0;b=b|0;return ah(11,a|0,b|0)|0}function Ce(a,b){a=a|0;b=b|0;return ah(12,a|0,b|0)|0}function Cf(a,b){a=a|0;b=b|0;return ah(13,a|0,b|0)|0}function Cg(a,b){a=a|0;b=b|0;return ah(14,a|0,b|0)|0}function Ch(a,b){a=a|0;b=b|0;return ah(15,a|0,b|0)|0}function Ci(a,b){a=a|0;b=b|0;return ah(16,a|0,b|0)|0}function Cj(a,b){a=a|0;b=b|0;return ah(17,a|0,b|0)|0}function Ck(a,b){a=a|0;b=b|0;return ah(18,a|0,b|0)|0}function Cl(a,b){a=a|0;b=b|0;return ah(19,a|0,b|0)|0}function Cm(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;return+bI[a&63](b|0,c|0,d|0,e|0,+f)}function Cn(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(0,a|0,b|0,c|0,d|0,+e)}function Co(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(1,a|0,b|0,c|0,d|0,+e)}function Cp(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(2,a|0,b|0,c|0,d|0,+e)}function Cq(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(3,a|0,b|0,c|0,d|0,+e)}function Cr(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(4,a|0,b|0,c|0,d|0,+e)}function Cs(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(5,a|0,b|0,c|0,d|0,+e)}function Ct(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(6,a|0,b|0,c|0,d|0,+e)}function Cu(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(7,a|0,b|0,c|0,d|0,+e)}function Cv(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(8,a|0,b|0,c|0,d|0,+e)}function Cw(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(9,a|0,b|0,c|0,d|0,+e)}function Cx(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(10,a|0,b|0,c|0,d|0,+e)}function Cy(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(11,a|0,b|0,c|0,d|0,+e)}function Cz(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(12,a|0,b|0,c|0,d|0,+e)}function CA(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(13,a|0,b|0,c|0,d|0,+e)}function CB(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(14,a|0,b|0,c|0,d|0,+e)}function CC(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(15,a|0,b|0,c|0,d|0,+e)}function CD(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(16,a|0,b|0,c|0,d|0,+e)}function CE(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(17,a|0,b|0,c|0,d|0,+e)}function CF(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(18,a|0,b|0,c|0,d|0,+e)}function CG(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ah(19,a|0,b|0,c|0,d|0,+e)}function CH(a){a=a|0;return bJ[a&127]()|0}function CI(){return ah(0)|0}function CJ(){return ah(1)|0}function CK(){return ah(2)|0}function CL(){return ah(3)|0}function CM(){return ah(4)|0}function CN(){return ah(5)|0}function CO(){return ah(6)|0}function CP(){return ah(7)|0}function CQ(){return ah(8)|0}function CR(){return ah(9)|0}function CS(){return ah(10)|0}function CT(){return ah(11)|0}function CU(){return ah(12)|0}function CV(){return ah(13)|0}function CW(){return ah(14)|0}function CX(){return ah(15)|0}function CY(){return ah(16)|0}function CZ(){return ah(17)|0}function C_(){return ah(18)|0}function C$(){return ah(19)|0}function C0(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return bK[a&127](b|0,c|0,d|0,e|0,f|0)|0}function C1(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(0,a|0,b|0,c|0,d|0,e|0)|0}function C2(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(1,a|0,b|0,c|0,d|0,e|0)|0}function C3(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(2,a|0,b|0,c|0,d|0,e|0)|0}function C4(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(3,a|0,b|0,c|0,d|0,e|0)|0}function C5(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(4,a|0,b|0,c|0,d|0,e|0)|0}function C6(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(5,a|0,b|0,c|0,d|0,e|0)|0}function C7(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(6,a|0,b|0,c|0,d|0,e|0)|0}function C8(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(7,a|0,b|0,c|0,d|0,e|0)|0}function C9(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(8,a|0,b|0,c|0,d|0,e|0)|0}function Da(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(9,a|0,b|0,c|0,d|0,e|0)|0}function Db(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(10,a|0,b|0,c|0,d|0,e|0)|0}function Dc(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(11,a|0,b|0,c|0,d|0,e|0)|0}function Dd(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(12,a|0,b|0,c|0,d|0,e|0)|0}function De(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(13,a|0,b|0,c|0,d|0,e|0)|0}function Df(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(14,a|0,b|0,c|0,d|0,e|0)|0}function Dg(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(15,a|0,b|0,c|0,d|0,e|0)|0}function Dh(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(16,a|0,b|0,c|0,d|0,e|0)|0}function Di(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(17,a|0,b|0,c|0,d|0,e|0)|0}function Dj(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(18,a|0,b|0,c|0,d|0,e|0)|0}function Dk(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ah(19,a|0,b|0,c|0,d|0,e|0)|0}function Dl(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;return bL[a&63](+b,+c,+d)|0}function Dm(a,b,c){a=+a;b=+b;c=+c;return ah(0,+a,+b,+c)|0}function Dn(a,b,c){a=+a;b=+b;c=+c;return ah(1,+a,+b,+c)|0}function Do(a,b,c){a=+a;b=+b;c=+c;return ah(2,+a,+b,+c)|0}function Dp(a,b,c){a=+a;b=+b;c=+c;return ah(3,+a,+b,+c)|0}function Dq(a,b,c){a=+a;b=+b;c=+c;return ah(4,+a,+b,+c)|0}function Dr(a,b,c){a=+a;b=+b;c=+c;return ah(5,+a,+b,+c)|0}function Ds(a,b,c){a=+a;b=+b;c=+c;return ah(6,+a,+b,+c)|0}function Dt(a,b,c){a=+a;b=+b;c=+c;return ah(7,+a,+b,+c)|0}function Du(a,b,c){a=+a;b=+b;c=+c;return ah(8,+a,+b,+c)|0}function Dv(a,b,c){a=+a;b=+b;c=+c;return ah(9,+a,+b,+c)|0}function Dw(a,b,c){a=+a;b=+b;c=+c;return ah(10,+a,+b,+c)|0}function Dx(a,b,c){a=+a;b=+b;c=+c;return ah(11,+a,+b,+c)|0}function Dy(a,b,c){a=+a;b=+b;c=+c;return ah(12,+a,+b,+c)|0}function Dz(a,b,c){a=+a;b=+b;c=+c;return ah(13,+a,+b,+c)|0}function DA(a,b,c){a=+a;b=+b;c=+c;return ah(14,+a,+b,+c)|0}function DB(a,b,c){a=+a;b=+b;c=+c;return ah(15,+a,+b,+c)|0}function DC(a,b,c){a=+a;b=+b;c=+c;return ah(16,+a,+b,+c)|0}function DD(a,b,c){a=+a;b=+b;c=+c;return ah(17,+a,+b,+c)|0}function DE(a,b,c){a=+a;b=+b;c=+c;return ah(18,+a,+b,+c)|0}function DF(a,b,c){a=+a;b=+b;c=+c;return ah(19,+a,+b,+c)|0}function DG(a,b,c){a=a|0;b=+b;c=+c;return bM[a&63](+b,+c)|0}function DH(a,b){a=+a;b=+b;return ah(0,+a,+b)|0}function DI(a,b){a=+a;b=+b;return ah(1,+a,+b)|0}function DJ(a,b){a=+a;b=+b;return ah(2,+a,+b)|0}function DK(a,b){a=+a;b=+b;return ah(3,+a,+b)|0}function DL(a,b){a=+a;b=+b;return ah(4,+a,+b)|0}function DM(a,b){a=+a;b=+b;return ah(5,+a,+b)|0}function DN(a,b){a=+a;b=+b;return ah(6,+a,+b)|0}function DO(a,b){a=+a;b=+b;return ah(7,+a,+b)|0}function DP(a,b){a=+a;b=+b;return ah(8,+a,+b)|0}function DQ(a,b){a=+a;b=+b;return ah(9,+a,+b)|0}function DR(a,b){a=+a;b=+b;return ah(10,+a,+b)|0}function DS(a,b){a=+a;b=+b;return ah(11,+a,+b)|0}function DT(a,b){a=+a;b=+b;return ah(12,+a,+b)|0}function DU(a,b){a=+a;b=+b;return ah(13,+a,+b)|0}function DV(a,b){a=+a;b=+b;return ah(14,+a,+b)|0}function DW(a,b){a=+a;b=+b;return ah(15,+a,+b)|0}function DX(a,b){a=+a;b=+b;return ah(16,+a,+b)|0}function DY(a,b){a=+a;b=+b;return ah(17,+a,+b)|0}function DZ(a,b){a=+a;b=+b;return ah(18,+a,+b)|0}function D_(a,b){a=+a;b=+b;return ah(19,+a,+b)|0}function D$(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;bN[a&127](b|0,c|0,d|0)}function D0(a,b,c){a=a|0;b=b|0;c=c|0;ah(0,a|0,b|0,c|0)}function D1(a,b,c){a=a|0;b=b|0;c=c|0;ah(1,a|0,b|0,c|0)}function D2(a,b,c){a=a|0;b=b|0;c=c|0;ah(2,a|0,b|0,c|0)}function D3(a,b,c){a=a|0;b=b|0;c=c|0;ah(3,a|0,b|0,c|0)}function D4(a,b,c){a=a|0;b=b|0;c=c|0;ah(4,a|0,b|0,c|0)}function D5(a,b,c){a=a|0;b=b|0;c=c|0;ah(5,a|0,b|0,c|0)}function D6(a,b,c){a=a|0;b=b|0;c=c|0;ah(6,a|0,b|0,c|0)}function D7(a,b,c){a=a|0;b=b|0;c=c|0;ah(7,a|0,b|0,c|0)}function D8(a,b,c){a=a|0;b=b|0;c=c|0;ah(8,a|0,b|0,c|0)}function D9(a,b,c){a=a|0;b=b|0;c=c|0;ah(9,a|0,b|0,c|0)}function Ea(a,b,c){a=a|0;b=b|0;c=c|0;ah(10,a|0,b|0,c|0)}function Eb(a,b,c){a=a|0;b=b|0;c=c|0;ah(11,a|0,b|0,c|0)}function Ec(a,b,c){a=a|0;b=b|0;c=c|0;ah(12,a|0,b|0,c|0)}function Ed(a,b,c){a=a|0;b=b|0;c=c|0;ah(13,a|0,b|0,c|0)}function Ee(a,b,c){a=a|0;b=b|0;c=c|0;ah(14,a|0,b|0,c|0)}function Ef(a,b,c){a=a|0;b=b|0;c=c|0;ah(15,a|0,b|0,c|0)}function Eg(a,b,c){a=a|0;b=b|0;c=c|0;ah(16,a|0,b|0,c|0)}function Eh(a,b,c){a=a|0;b=b|0;c=c|0;ah(17,a|0,b|0,c|0)}function Ei(a,b,c){a=a|0;b=b|0;c=c|0;ah(18,a|0,b|0,c|0)}function Ej(a,b,c){a=a|0;b=b|0;c=c|0;ah(19,a|0,b|0,c|0)}function Ek(a){a=a|0;bO[a&63]()}function El(){ah(0)}function Em(){ah(1)}function En(){ah(2)}function Eo(){ah(3)}function Ep(){ah(4)}function Eq(){ah(5)}function Er(){ah(6)}function Es(){ah(7)}function Et(){ah(8)}function Eu(){ah(9)}function Ev(){ah(10)}function Ew(){ah(11)}function Ex(){ah(12)}function Ey(){ah(13)}function Ez(){ah(14)}function EA(){ah(15)}function EB(){ah(16)}function EC(){ah(17)}function ED(){ah(18)}function EE(){ah(19)}function EF(a,b,c,d){a=a|0;b=b|0;c=c|0;d=+d;bP[a&127](b|0,c|0,+d)}function EG(a,b,c){a=a|0;b=b|0;c=+c;ah(0,a|0,b|0,+c)}function EH(a,b,c){a=a|0;b=b|0;c=+c;ah(1,a|0,b|0,+c)}function EI(a,b,c){a=a|0;b=b|0;c=+c;ah(2,a|0,b|0,+c)}function EJ(a,b,c){a=a|0;b=b|0;c=+c;ah(3,a|0,b|0,+c)}function EK(a,b,c){a=a|0;b=b|0;c=+c;ah(4,a|0,b|0,+c)}function EL(a,b,c){a=a|0;b=b|0;c=+c;ah(5,a|0,b|0,+c)}function EM(a,b,c){a=a|0;b=b|0;c=+c;ah(6,a|0,b|0,+c)}function EN(a,b,c){a=a|0;b=b|0;c=+c;ah(7,a|0,b|0,+c)}function EO(a,b,c){a=a|0;b=b|0;c=+c;ah(8,a|0,b|0,+c)}function EP(a,b,c){a=a|0;b=b|0;c=+c;ah(9,a|0,b|0,+c)}function EQ(a,b,c){a=a|0;b=b|0;c=+c;ah(10,a|0,b|0,+c)}function ER(a,b,c){a=a|0;b=b|0;c=+c;ah(11,a|0,b|0,+c)}function ES(a,b,c){a=a|0;b=b|0;c=+c;ah(12,a|0,b|0,+c)}function ET(a,b,c){a=a|0;b=b|0;c=+c;ah(13,a|0,b|0,+c)}function EU(a,b,c){a=a|0;b=b|0;c=+c;ah(14,a|0,b|0,+c)}function EV(a,b,c){a=a|0;b=b|0;c=+c;ah(15,a|0,b|0,+c)}function EW(a,b,c){a=a|0;b=b|0;c=+c;ah(16,a|0,b|0,+c)}function EX(a,b,c){a=a|0;b=b|0;c=+c;ah(17,a|0,b|0,+c)}function EY(a,b,c){a=a|0;b=b|0;c=+c;ah(18,a|0,b|0,+c)}function EZ(a,b,c){a=a|0;b=b|0;c=+c;ah(19,a|0,b|0,+c)}function E_(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;bQ[a&127](b|0,c|0,d|0,e|0)}function E$(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(0,a|0,b|0,c|0,d|0)}function E0(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(1,a|0,b|0,c|0,d|0)}function E1(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(2,a|0,b|0,c|0,d|0)}function E2(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(3,a|0,b|0,c|0,d|0)}function E3(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(4,a|0,b|0,c|0,d|0)}function E4(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(5,a|0,b|0,c|0,d|0)}function E5(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(6,a|0,b|0,c|0,d|0)}function E6(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(7,a|0,b|0,c|0,d|0)}function E7(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(8,a|0,b|0,c|0,d|0)}function E8(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(9,a|0,b|0,c|0,d|0)}function E9(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(10,a|0,b|0,c|0,d|0)}function Fa(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(11,a|0,b|0,c|0,d|0)}function Fb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(12,a|0,b|0,c|0,d|0)}function Fc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(13,a|0,b|0,c|0,d|0)}function Fd(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(14,a|0,b|0,c|0,d|0)}function Fe(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(15,a|0,b|0,c|0,d|0)}function Ff(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(16,a|0,b|0,c|0,d|0)}function Fg(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(17,a|0,b|0,c|0,d|0)}function Fh(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(18,a|0,b|0,c|0,d|0)}function Fi(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ah(19,a|0,b|0,c|0,d|0)}function Fj(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;aa(0)}function Fk(a,b){a=a|0;b=+b;aa(1)}function Fl(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;aa(2)}function Fm(a){a=a|0;aa(3)}function Fn(a,b){a=a|0;b=b|0;aa(4)}function Fo(a){a=a|0;aa(5);return 0}function Fp(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;aa(6)}function Fq(a){a=+a;aa(7);return 0}function Fr(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;aa(8);return 0}function Fs(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;aa(9)}function Ft(a,b,c){a=a|0;b=b|0;c=c|0;aa(10);return 0}function Fu(a,b){a=a|0;b=+b;aa(11);return 0.0}function Fv(a,b,c){a=a|0;b=+b;c=+c;aa(12)}function Fw(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;aa(13)}function Fx(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;aa(14)}function Fy(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;aa(15)}function Fz(a,b,c){a=a|0;b=b|0;c=+c;aa(16);return 0}function FA(a,b){a=a|0;b=+b;aa(17);return 0}function FB(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;aa(18)}function FC(a){a=a|0;aa(19);return 0.0}function FD(a,b){a=a|0;b=b|0;aa(20);return 0}function FE(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;aa(21);return 0.0}function FF(){aa(22);return 0}function FG(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;aa(23);return 0}function FH(a,b,c){a=+a;b=+b;c=+c;aa(24);return 0}function FI(a,b){a=+a;b=+b;aa(25);return 0}function FJ(a,b,c){a=a|0;b=b|0;c=c|0;aa(26)}function FK(){aa(27)}function FL(a,b,c){a=a|0;b=b|0;c=+c;aa(28)}function FM(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;aa(29)}
// EMSCRIPTEN_END_FUNCS
var bn=[Fj,Fj,vu,Fj,vv,Fj,vw,Fj,vx,Fj,vy,Fj,vz,Fj,vA,Fj,vB,Fj,vC,Fj,vD,Fj,vE,Fj,vF,Fj,vG,Fj,vH,Fj,vI,Fj,vJ,Fj,vK,Fj,vL,Fj,vM,Fj,vN,Fj,rE,Fj,u$,Fj,ve,Fj,u_,Fj,q9,Fj,Fj,Fj,Fj,Fj,Fj,Fj,Fj,Fj,Fj,Fj,Fj,Fj];var bo=[Fk,Fk,vP,Fk,vQ,Fk,vR,Fk,vS,Fk,vT,Fk,vU,Fk,vV,Fk,vW,Fk,vX,Fk,vY,Fk,vZ,Fk,v_,Fk,v$,Fk,v0,Fk,v1,Fk,v2,Fk,v3,Fk,v4,Fk,v5,Fk,v6,Fk,gY,Fk,t$,Fk,rz,Fk,q5,Fk,i2,Fk,jY,Fk,ny,Fk,gT,Fk,qc,Fk,ra,Fk,s0,Fk,rs,Fk,qj,Fk,hu,Fk,ss,Fk,jM,Fk,nl,Fk,rj,Fk,hG,Fk,oj,Fk,qz,Fk,pv,Fk,np,Fk,hw,Fk,rl,Fk,pg,Fk,qA,Fk,qm,Fk,sh,Fk,m0,Fk,pf,Fk,pS,Fk,nb,Fk,rV,Fk,r6,Fk,sz,Fk,tK,Fk,ry,Fk,sc,Fk,i$,Fk,nz,Fk,rA,Fk,tF,Fk,p6,Fk,t_,Fk,nt,Fk,j2,Fk,pO,Fk,ll,Fk,jC,Fk,rX,Fk,p$,Fk,uz,Fk,tQ,Fk,s2,Fk,nL,Fk,tA,Fk,qe,Fk,tv,Fk,gH,Fk,st,Fk,p2,Fk,gW,Fk,ld,Fk,s5,Fk,oF,Fk,gS,Fk,uY,Fk,rd,Fk,qF,Fk,r$,Fk,ml,Fk,l5,Fk,hk,Fk,oz,Fk,rG,Fk,tx,Fk,jQ,Fk,py,Fk,pW,Fk,pK,Fk,k2,Fk,lX,Fk,to,Fk,lM,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk];var bp=[Fl,Fl,v8,Fl,v9,Fl,wa,Fl,wb,Fl,wc,Fl,wd,Fl,we,Fl,wf,Fl,wg,Fl,wh,Fl,wi,Fl,wj,Fl,wk,Fl,wl,Fl,wm,Fl,wn,Fl,wo,Fl,wp,Fl,wq,Fl,wr,Fl,c3,Fl,kD,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl];var bq=[Fm,Fm,wt,Fm,wu,Fm,wv,Fm,ww,Fm,wx,Fm,wy,Fm,wz,Fm,wA,Fm,wB,Fm,wC,Fm,wD,Fm,wE,Fm,wF,Fm,wG,Fm,wH,Fm,wI,Fm,wJ,Fm,wK,Fm,wL,Fm,wM,Fm,go,Fm,nP,Fm,jq,Fm,fj,Fm,mN,Fm,lD,Fm,fW,Fm,cU,Fm,eV,Fm,u0,Fm,ee,Fm,fg,Fm,u6,Fm,f1,Fm,pb,Fm,ih,Fm,eu,Fm,fG,Fm,vj,Fm,cD,Fm,lx,Fm,jm,Fm,sG,Fm,lA,Fm,qR,Fm,o0,Fm,eR,Fm,fL,Fm,fS,Fm,lI,Fm,u8,Fm,e4,Fm,rt,Fm,cy,Fm,dl,Fm,eB,Fm,cR,Fm,g8,Fm,lr,Fm,um,Fm,mv,Fm,hY,Fm,ls,Fm,ge,Fm,ur,Fm,qI,Fm,d5,Fm,fA,Fm,h5,Fm,cF,Fm,mu,Fm,nr,Fm,sE,Fm,iH,Fm,ly,Fm,dG,Fm,t1,Fm,he,Fm,gl,Fm,e5,Fm,nZ,Fm,mO,Fm,fH,Fm,c$,Fm,qb,Fm,sx,Fm,ez,Fm,ua,Fm,hf,Fm,c_,Fm,dm,Fm,ei,Fm,lS,Fm,mL,Fm,et,Fm,pi,Fm,g3,Fm,mB,Fm,kx,Fm,qW,Fm,h_,Fm,qi,Fm,n6,Fm,ff,Fm,fh,Fm,mT,Fm,qQ,Fm,mq,Fm,h4,Fm,c9,Fm,je,Fm,va,Fm,mp,Fm,ex,Fm,u7,Fm,kA,Fm,ed,Fm,d_,Fm,gc,Fm,s_,Fm,t7,Fm,u4,Fm,pe,Fm,ia,Fm,d1,Fm,eg,Fm,da,Fm,d3,Fm,kk,Fm,vm,Fm,fT,Fm,cx,Fm,qL,Fm,t3,Fm,jl,Fm,og,Fm,g7,Fm,fi,Fm,mQ,Fm,ug,Fm,o5,Fm,h7,Fm,f5,Fm,uq,Fm,us,Fm,ft,Fm,kK,Fm,d$,Fm,ud,Fm,eZ,Fm,eJ,Fm,gk,Fm,eU,Fm,uo,Fm,jr,Fm,e9,Fm,lJ,Fm,ky,Fm,sy,Fm,g2,Fm,sI,Fm,qX,Fm,es,Fm,ui,Fm,o6,Fm,fn,Fm,u2,Fm,u9,Fm,eL,Fm,gb,Fm,g6,Fm,f2,Fm,uj,Fm,fu,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm];var br=[Fn,Fn,wO,Fn,wP,Fn,wQ,Fn,wR,Fn,wS,Fn,wT,Fn,wU,Fn,wV,Fn,wW,Fn,wX,Fn,wY,Fn,wZ,Fn,w_,Fn,w$,Fn,w0,Fn,w1,Fn,w2,Fn,w3,Fn,w4,Fn,w5,Fn,sf,Fn,lU,Fn,i3,Fn,fy,Fn,oU,Fn,qa,Fn,lE,Fn,r1,Fn,rQ,Fn,h$,Fn,hx,Fn,iz,Fn,r2,Fn,sP,Fn,ij,Fn,qC,Fn,gx,Fn,tS,Fn,k4,Fn,fQ,Fn,fB,Fn,eS,Fn,uL,Fn,f7,Fn,tk,Fn,m4,Fn,sO,Fn,iP,Fn,nf,Fn,th,Fn,pH,Fn,uQ,Fn,eE,Fn,pM,Fn,uN,Fn,jW,Fn,f3,Fn,j4,Fn,i9,Fn,q0,Fn,o1,Fn,oe,Fn,fp,Fn,sm,Fn,e2,Fn,uC,Fn,uX,Fn,uK,Fn,pk,Fn,ek,Fn,o_,Fn,fO,Fn,jf,Fn,c5,Fn,ul,Fn,n5,Fn,pc,Fn,gr,Fn,j$,Fn,ec,Fn,f$,Fn,ji,Fn,ir,Fn,hP,Fn,f6,Fn,sL,Fn,gy,Fn,pa,Fn,rm,Fn,tR,Fn,sN,Fn,gd,Fn,mb,Fn,kd,Fn,si,Fn,fN,Fn,fa,Fn,rD,Fn,oX,Fn,gm,Fn,tu,Fn,j6,Fn,pz,Fn,iJ,Fn,sX,Fn,gJ,Fn,gB,Fn,e$,Fn,nM,Fn,rC,Fn,fC,Fn,gf,Fn,mx,Fn,eG,Fn,rP,Fn,uS,Fn,pL,Fn,pV,Fn,iO,Fn,oA,Fn,q7,Fn,qZ,Fn,hn,Fn,gw,Fn,rS,Fn,sR,Fn,ha,Fn,fY,Fn,pG,Fn,fz,Fn,rv,Fn,fw,Fn,q8,Fn,fb,Fn,qv,Fn,hl,Fn,g9,Fn,sg,Fn,ea,Fn,td,Fn,e7,Fn,mc,Fn,uR,Fn,s6,Fn,rU,Fn,pn,Fn,dC,Fn,eX,Fn,sj,Fn,oi,Fn,i5,Fn,o2,Fn,p1,Fn,ps,Fn,e8,Fn,kV,Fn,uk,Fn,tE,Fn,rw,Fn,pr,Fn,f9,Fn,q$,Fn,qt,Fn,lW,Fn,tf,Fn,j5,Fn,ks,Fn,fq,Fn,o$,Fn,oV,Fn,rR,Fn,iF,Fn,tC,Fn,oO,Fn,iy,Fn,tM,Fn,my,Fn,se,Fn,pR,Fn,ux,Fn,e_,Fn,e3,Fn,ma,Fn,fX,Fn,fU,Fn,l9,Fn,hh,Fn,eO,Fn,tB,Fn,fs,Fn,jc,Fn,uF,Fn,eI,Fn,gp,Fn,m5,Fn,ix,Fn,qw,Fn,mn,Fn,hW,Fn,dB,Fn,uw,Fn,uy,Fn,hE,Fn,uI,Fn,pP,Fn,rn,Fn,pq,Fn,rp,Fn,rZ,Fn,fV,Fn,uE,Fn,jG,Fn,iT,Fn,l_,Fn,tZ,Fn,tP,Fn,sn,Fn,fM,Fn,nA,Fn,gg,Fn,nJ,Fn,nF,Fn,gz,Fn,tn,Fn,sU,Fn,kB,Fn,eM,Fn,pU,Fn,sd,Fn,tJ,Fn,eN,Fn,sW,Fn,iS,Fn,gq,Fn,q4,Fn,qs,Fn,qh,Fn,tm,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn];var bs=[Fo,Fo,w7,Fo,w8,Fo,w9,Fo,xa,Fo,xb,Fo,xc,Fo,xd,Fo,xe,Fo,xf,Fo,xg,Fo,xh,Fo,xi,Fo,xj,Fo,xk,Fo,xl,Fo,xm,Fo,xn,Fo,xo,Fo,xp,Fo,xq,Fo,qn,Fo,gK,Fo,hF,Fo,sT,Fo,jx,Fo,lk,Fo,kf,Fo,hQ,Fo,r7,Fo,rf,Fo,iG,Fo,k6,Fo,r8,Fo,iE,Fo,hR,Fo,iN,Fo,iZ,Fo,p8,Fo,pZ,Fo,jI,Fo,g_,Fo,mm,Fo,iK,Fo,iI,Fo,gI,Fo,tH,Fo,iU,Fo,nx,Fo,pl,Fo,pI,Fo,ho,Fo,pQ,Fo,oJ,Fo,iL,Fo,lF,Fo,q2,Fo,pF,Fo,id,Fo,iV,Fo,gL,Fo,mk,Fo,oT,Fo,lt,Fo,gu,Fo,gG,Fo,qd,Fo,i0,Fo,uV,Fo,no,Fo,qy,Fo,r4,Fo,op,Fo,j9,Fo,oS,Fo,sV,Fo,ht,Fo,gC,Fo,nq,Fo,lQ,Fo,le,Fo,lG,Fo,m8,Fo,iM,Fo,uG,Fo,qq,Fo,qD,Fo,jK,Fo,tg,Fo,oL,Fo,lq,Fo,rL,Fo,nW,Fo,j8,Fo,lL,Fo,h2,Fo,nG,Fo,p7,Fo,sp,Fo,hs,Fo,kR,Fo,hH,Fo,o3,Fo,nn,Fo,gX,Fo,mi,Fo,iA,Fo,jB,Fo,kY,Fo,j7,Fo,ms,Fo,j3,Fo,mU,Fo,oh,Fo,oP,Fo,kc,Fo,mf,Fo,mR,Fo,k7,Fo,lj,Fo,hy,Fo,m_,Fo,ox,Fo,jN,Fo,kg,Fo,hJ,Fo,nu,Fo,nH,Fo,gE,Fo,hO,Fo,mj,Fo,rr,Fo,gv,Fo,m6,Fo,mh,Fo,kS,Fo,kt,Fo,ph,Fo,i7,Fo,hp,Fo,tU,Fo,rJ,Fo,p_,Fo,lP,Fo,uH,Fo,hq,Fo,m9,Fo,i4,Fo,pu,Fo,k3,Fo,ni,Fo,p0,Fo,o7,Fo,m$,Fo,m7,Fo,iX,Fo,hI,Fo,iQ,Fo,iu,Fo,iW,Fo,jy,Fo,h8,Fo,pE,Fo,ta,Fo,gQ,Fo,pw,Fo,cw,Fo,gD,Fo,ku,Fo,n2,Fo,hj,Fo,l7,Fo,hL,Fo,lV,Fo,ot,Fo,ke,Fo,hA,Fo,ne,Fo,cI,Fo,rH,Fo,lm,Fo,iC,Fo,hD,Fo,lc,Fo,ka,Fo,hv,Fo,sS,Fo,kU,Fo,iB,Fo,nj,Fo,la,Fo,tr,Fo,i_,Fo,gZ,Fo,nm,Fo,k0,Fo,q6,Fo,lR,Fo,lY,Fo,jA,Fo,jJ,Fo,sM,Fo,iR,Fo,vk,Fo,jP,Fo,l1,Fo,tb,Fo,uT,Fo,lf,Fo,hV,Fo,kj,Fo,k1,Fo,kL,Fo,iw,Fo,nk,Fo,rq,Fo,mg,Fo,ip,Fo,s9,Fo,qG,Fo,tp,Fo,k_,Fo,it,Fo,s7,Fo,oq,Fo,jL,Fo,sQ,Fo,l8,Fo,jn,Fo,k5,Fo,rB,Fo,kJ,Fo,kv,Fo,gR,Fo,kb,Fo,l3,Fo,ju,Fo,oG,Fo,hc,Fo,g0,Fo,uM,Fo,rW,Fo,uJ,Fo,lg,Fo,lh,Fo,oB,Fo,md,Fo,kO,Fo,ol,Fo,jo,Fo,hb,Fo,jU,Fo,gF,Fo,gM,Fo,l4,Fo,kW,Fo,jZ,Fo,jH,Fo,pD,Fo,h0,Fo,sq,Fo,om,Fo,sY,Fo,kh,Fo,ow,Fo,oM,Fo,kX,Fo,rc,Fo,nC,Fo,tW,Fo,hK,Fo,sk,Fo,jR,Fo,uB,Fo,ok,Fo,h1,Fo,iv,Fo,oN,Fo,oW,Fo,qu,Fo,pJ,Fo,qp,Fo,gU,Fo,oI,Fo,js,Fo,sl,Fo,nI,Fo,hU,Fo,oE,Fo,hM,Fo,cG,Fo,cE,Fo,hN,Fo,nw,Fo,oK,Fo,kN,Fo,ig,Fo,sZ,Fo,uv,Fo,oQ,Fo,oc,Fo,kT,Fo,mI,Fo,j1,Fo,pm,Fo,iD,Fo,kp,Fo,qk,Fo,gA,Fo,jg,Fo,nd,Fo,re,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo];var bt=[Fp,Fp,xs,Fp,xt,Fp,xu,Fp,xv,Fp,xw,Fp,xx,Fp,xy,Fp,xz,Fp,xA,Fp,xB,Fp,xC,Fp,xD,Fp,xE,Fp,xF,Fp,xG,Fp,xH,Fp,xI,Fp,xJ,Fp,xK,Fp,xL,Fp,kF,Fp,c2,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp];var bu=[Fq,Fq,xN,Fq,xO,Fq,xP,Fq,xQ,Fq,xR,Fq,xS,Fq,xT,Fq,xU,Fq,xV,Fq,xW,Fq,xX,Fq,xY,Fq,xZ,Fq,x_,Fq,x$,Fq,x0,Fq,x1,Fq,x2,Fq,x3,Fq,x4,Fq,sC,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq];var bv=[Fr,Fr,x6,Fr,x7,Fr,x8,Fr,x9,Fr,ya,Fr,yb,Fr,yc,Fr,yd,Fr,ye,Fr,yf,Fr,yg,Fr,yh,Fr,yi,Fr,yj,Fr,yk,Fr,yl,Fr,ym,Fr,yn,Fr,yo,Fr,yp,Fr,hZ,Fr,lC,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr];var bw=[Fs,Fs,yr,Fs,ys,Fs,yt,Fs,yu,Fs,yv,Fs,yw,Fs,yx,Fs,yy,Fs,yz,Fs,yA,Fs,yB,Fs,yC,Fs,yD,Fs,yE,Fs,yF,Fs,yG,Fs,yH,Fs,yI,Fs,yJ,Fs,yK,Fs,nU,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs];var bx=[Ft,Ft,yM,Ft,yN,Ft,yO,Ft,yP,Ft,yQ,Ft,yR,Ft,yS,Ft,yT,Ft,yU,Ft,yV,Ft,yW,Ft,yX,Ft,yY,Ft,yZ,Ft,y_,Ft,y$,Ft,y0,Ft,y1,Ft,y2,Ft,y3,Ft,lB,Ft,n3,Ft,ik,Ft,nX,Ft,iq,Ft,vb,Ft,cJ,Ft,kq,Ft,d0,Ft,mJ,Ft,od,Ft,c6,Ft,cH,Ft,cC,Ft,uc,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft];var by=[Fu,Fu,y5,Fu,y6,Fu,y7,Fu,y8,Fu,y9,Fu,za,Fu,zb,Fu,zc,Fu,zd,Fu,ze,Fu,zf,Fu,zg,Fu,zh,Fu,zi,Fu,zj,Fu,zk,Fu,zl,Fu,zm,Fu,zn,Fu,zo,Fu,jb,Fu,ki,Fu,mS,Fu,gt,Fu,fo,Fu,fd,Fu,h6,Fu,jT,Fu,gi,Fu,h9,Fu,f4,Fu,o4,Fu,f_,Fu,hg,Fu,lp,Fu,kz,Fu,lK,Fu,mr,Fu,fE,Fu,fK,Fu,kP,Fu,e1,Fu,kI,Fu,eK,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu];var bz=[Fv,Fv,zq,Fv,zr,Fv,zs,Fv,zt,Fv,zu,Fv,zv,Fv,zw,Fv,zx,Fv,zy,Fv,zz,Fv,zA,Fv,zB,Fv,zC,Fv,zD,Fv,zE,Fv,zF,Fv,zG,Fv,zH,Fv,zI,Fv,zJ,Fv,kQ,Fv,mV,Fv,m3,Fv,p3,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv];var bA=[Fw,Fw,zL,Fw,zM,Fw,zN,Fw,zO,Fw,zP,Fw,zQ,Fw,zR,Fw,zS,Fw,zT,Fw,zU,Fw,zV,Fw,zW,Fw,zX,Fw,zY,Fw,zZ,Fw,z_,Fw,z$,Fw,z0,Fw,z1,Fw,z2,Fw,sH,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw];var bB=[Fx,Fx,z4,Fx,z5,Fx,z6,Fx,z7,Fx,z8,Fx,z9,Fx,Aa,Fx,Ab,Fx,Ac,Fx,Ad,Fx,Ae,Fx,Af,Fx,Ag,Fx,Ah,Fx,Ai,Fx,Aj,Fx,Ak,Fx,Al,Fx,Am,Fx,An,Fx,qf,Fx,s$,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx];var bC=[Fy,Fy,Ap,Fy,Aq,Fy,Ar,Fy,As,Fy,At,Fy,Au,Fy,Av,Fy,Aw,Fy,Ax,Fy,Ay,Fy,Az,Fy,AA,Fy,AB,Fy,AC,Fy,AD,Fy,AE,Fy,AF,Fy,AG,Fy,AH,Fy,AI,Fy,vf,Fy,vg,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy];var bD=[Fz,Fz,AK,Fz,AL,Fz,AM,Fz,AN,Fz,AO,Fz,AP,Fz,AQ,Fz,AR,Fz,AS,Fz,AT,Fz,AU,Fz,AV,Fz,AW,Fz,AX,Fz,AY,Fz,AZ,Fz,A_,Fz,A$,Fz,A0,Fz,A1,Fz,oZ,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz];var bE=[FA,FA,A3,FA,A4,FA,A5,FA,A6,FA,A7,FA,A8,FA,A9,FA,Ba,FA,Bb,FA,Bc,FA,Bd,FA,Be,FA,Bf,FA,Bg,FA,Bh,FA,Bi,FA,Bj,FA,Bk,FA,Bl,FA,Bm,FA,kw,FA,kM,FA,jp,FA,mo,FA,nO,FA,h3,FA,lH,FA,ie,FA,o8,FA,hd,FA,lu,FA];var bF=[FB,FB,Bo,FB,Bp,FB,Bq,FB,Br,FB,Bs,FB,Bt,FB,Bu,FB,Bv,FB,Bw,FB,Bx,FB,By,FB,Bz,FB,BA,FB,BB,FB,BC,FB,BD,FB,BE,FB,BF,FB,BG,FB,BH,FB,jh,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB,FB];var bG=[FC,FC,BJ,FC,BK,FC,BL,FC,BM,FC,BN,FC,BO,FC,BP,FC,BQ,FC,BR,FC,BS,FC,BT,FC,BU,FC,BV,FC,BW,FC,BX,FC,BY,FC,BZ,FC,B_,FC,B$,FC,B0,FC,jO,FC,l0,FC,k8,FC,ov,FC,gP,FC,p5,FC,nc,FC,oC,FC,tL,FC,lZ,FC,tG,FC,hC,FC,m1,FC,pB,FC,pC,FC,jw,FC,pT,FC,nK,FC,jX,FC,tY,FC,iY,FC,j_,FC,tq,FC,ro,FC,l$,FC,rk,FC,nB,FC,g$,FC,ql,FC,uD,FC,r5,FC,rI,FC,jS,FC,ln,FC,qg,FC,qB,FC,rx,FC,on,FC,oD,FC,gO,FC,l6,FC,tT,FC,tD,FC,qM,FC,oH,FC,hz,FC,rF,FC,nv,FC,tV,FC,sJ,FC,lb,FC,qE,FC,qP,FC,hT,FC,rM,FC,hB,FC,ng,FC,sK,FC,ns,FC,gN,FC,s3,FC,li,FC,pt,FC,sA,FC,gV,FC,s1,FC,jD,FC,r_,FC,p9,FC,qx,FC,k$,FC,ru,FC,q3,FC,nh,FC,hS,FC,lT,FC,tl,FC,me,FC,is,FC,uU,FC,oR,FC,tc,FC,l2,FC,i8,FC,s4,FC,r0,FC,jz,FC,hr,FC,k9,FC,q1,FC,ic,FC,i1,FC,pY,FC,jV,FC,tt,FC,rT,FC,rb,FC,p4,FC,j0,FC,i6,FC,lo,FC,kZ,FC,so,FC,rY,FC,pN,FC,pX,FC,ja,FC,ib,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC];var bH=[FD,FD,B2,FD,B3,FD,B4,FD,B5,FD,B6,FD,B7,FD,B8,FD,B9,FD,Ca,FD,Cb,FD,Cc,FD,Cd,FD,Ce,FD,Cf,FD,Cg,FD,Ch,FD,Ci,FD,Cj,FD,Ck,FD,Cl,FD,io,FD,hm,FD,t6,FD,tj,FD,sr,FD,hX,FD,rO,FD,ts,FD,tN,FD,sb,FD,r9,FD,fR,FD,tO,FD,nE,FD,lO,FD,rN,FD,im,FD,jF,FD,qo,FD,uW,FD,cP,FD,m2,FD,ti,FD,fF,FD,su,FD,nS,FD,po,FD,fm,FD,oy,FD,jv,FD,sa,FD,cV,FD,sv,FD,pp,FD,lN,FD,px,FD,uu,FD,km,FD,ri,FD,pj,FD,du,FD,n9,FD,ga,FD,uP,FD,jj,FD,tI,FD,rg,FD,jt,FD,jE,FD,fe,FD,cS,FD,uO,FD,os,FD,g1,FD,mD,FD,eY,FD,rK,FD,nN,FD,uA,FD,oY,FD,cB,FD,ut,FD,ou,FD,f0,FD,qr,FD,or,FD,un,FD,n$,FD,rh,FD,tz,FD,tX,FD,mK,FD,mP,FD,s8,FD,eT,FD,gj,FD,q_,FD,ty,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD];var bI=[FE,FE,Cn,FE,Co,FE,Cp,FE,Cq,FE,Cr,FE,Cs,FE,Ct,FE,Cu,FE,Cv,FE,Cw,FE,Cx,FE,Cy,FE,Cz,FE,CA,FE,CB,FE,CC,FE,CD,FE,CE,FE,CF,FE,CG,FE,lv,FE,up,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE];var bJ=[FF,FF,CI,FF,CJ,FF,CK,FF,CL,FF,CM,FF,CN,FF,CO,FF,CP,FF,CQ,FF,CR,FF,CS,FF,CT,FF,CU,FF,CV,FF,CW,FF,CX,FF,CY,FF,CZ,FF,C_,FF,C$,FF,qH,FF,g4,FF,lw,FF,mF,FF,sB,FF,o9,FF,mZ,FF,t5,FF,lz,FF,qY,FF,qJ,FF,ue,FF,kH,FF,ub,FF,sw,FF,kr,FF,qK,FF,ii,FF,pd,FF,mM,FF,t0,FF,hi,FF,uf,FF,mt,FF,t8,FF,qV,FF,nY,FF,sD,FF,u5,FF,n4,FF,qN,FF,sF,FF,mw,FF,uh,FF,u3,FF,qS,FF,t2,FF,u1,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF];var bK=[FG,FG,C1,FG,C2,FG,C3,FG,C4,FG,C5,FG,C6,FG,C7,FG,C8,FG,C9,FG,Da,FG,Db,FG,Dc,FG,Dd,FG,De,FG,Df,FG,Dg,FG,Dh,FG,Di,FG,Dj,FG,Dk,FG,dd,FG,n0,FG,kn,FG,oa,FG,cY,FG,d9,FG,eH,FG,mH,FG,nT,FG,eD,FG,ej,FG,eF,FG,cQ,FG,cT,FG,eW,FG,eb,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG];var bL=[FH,FH,Dm,FH,Dn,FH,Do,FH,Dp,FH,Dq,FH,Dr,FH,Ds,FH,Dt,FH,Du,FH,Dv,FH,Dw,FH,Dx,FH,Dy,FH,Dz,FH,DA,FH,DB,FH,DC,FH,DD,FH,DE,FH,DF,FH,t9,FH,qT,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH];var bM=[FI,FI,DH,FI,DI,FI,DJ,FI,DK,FI,DL,FI,DM,FI,DN,FI,DO,FI,DP,FI,DQ,FI,DR,FI,DS,FI,DT,FI,DU,FI,DV,FI,DW,FI,DX,FI,DY,FI,DZ,FI,D_,FI,qO,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI];var bN=[FJ,FJ,D0,FJ,D1,FJ,D2,FJ,D3,FJ,D4,FJ,D5,FJ,D6,FJ,D7,FJ,D8,FJ,D9,FJ,Ea,FJ,Eb,FJ,Ec,FJ,Ed,FJ,Ee,FJ,Ef,FJ,Eg,FJ,Eh,FJ,Ei,FJ,Ej,FJ,mz,FJ,mA,FJ,mX,FJ,dD,FJ,mW,FJ,te,FJ,mY,FJ,nQ,FJ,g5,FJ,jd,FJ,mE,FJ,qU,FJ,na,FJ,nD,FJ,dE,FJ,oo,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ];var bO=[FK,FK,El,FK,Em,FK,En,FK,Eo,FK,Ep,FK,Eq,FK,Er,FK,Es,FK,Et,FK,Eu,FK,Ev,FK,Ew,FK,Ex,FK,Ey,FK,Ez,FK,EA,FK,EB,FK,EC,FK,ED,FK,EE,FK,vs,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK];var bP=[FL,FL,EG,FL,EH,FL,EI,FL,EJ,FL,EK,FL,EL,FL,EM,FL,EN,FL,EO,FL,EP,FL,EQ,FL,ER,FL,ES,FL,ET,FL,EU,FL,EV,FL,EW,FL,EX,FL,EY,FL,EZ,FL,cO,FL,t4,FL,fc,FL,n_,FL,cL,FL,gs,FL,fZ,FL,fr,FL,n8,FL,f8,FL,kl,FL,of,FL,mC,FL,fD,FL,nR,FL,e0,FL,de,FL,gh,FL,eP,FL,fP,FL,cN,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL];var bQ=[FM,FM,E$,FM,E0,FM,E1,FM,E2,FM,E3,FM,E4,FM,E5,FM,E6,FM,E7,FM,E8,FM,E9,FM,Fa,FM,Fb,FM,Fc,FM,Fd,FM,Fe,FM,Ff,FM,Fg,FM,Fh,FM,Fi,FM,cK,FM,cM,FM,kC,FM,kE,FM,il,FM,cZ,FM,d2,FM,c0,FM,eA,FM,vc,FM,ey,FM,nV,FM,mG,FM,n1,FM,d4,FM,n7,FM,uZ,FM,ko,FM,tw,FM,ew,FM,c1,FM,c7,FM,c4,FM,ef,FM,eQ,FM,jk,FM,kG,FM,pA,FM,r3,FM,ob,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM];return{_emscripten_bind_b2WheelJoint__GetSpringFrequencyHz_p0:jO,_emscripten_bind_b2Fixture__SetRestitution_p1:gY,_emscripten_bind_b2PolygonShape____destroy___p0:nP,_emscripten_bind_b2RevoluteJoint__EnableLimit_p1:lU,_emscripten_bind_b2DistanceProxy__get_m_vertices_p0:qn,_emscripten_bind_b2PrismaticJoint__EnableLimit_p1:i3,_emscripten_bind_b2WheelJointDef__Initialize_p4:rE,_emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1:t$,_emscripten_bind_b2PrismaticJoint__GetMotorForce_p1:jb,_emscripten_bind_b2Body__IsSleepingAllowed_p0:nx,_emscripten_bind_b2Vec2__b2Vec2_p2:qO,_emscripten_bind_b2RevoluteJoint__GetMaxMotorTorque_p0:l0,_emscripten_bind_b2WeldJoint__GetFrequency_p0:k8,_emscripten_bind_b2MouseJoint__GetType_p0:hF,_emscripten_bind_b2RayCastCallback__b2RayCastCallback_p0:lw,_emscripten_bind_b2Body__GetLinearDamping_p0:ov,_emscripten_bind_b2Vec2__b2Vec2_p0:qN,_emscripten_bind_b2PrismaticJoint__GetType_p0:jx,_emscripten_bind_b2PrismaticJoint____destroy___p0:jq,_emscripten_bind_b2WheelJointDef__set_frequencyHz_p1:rz,_emscripten_bind_b2BlockAllocator____destroy___p0:mN,_emscripten_bind_b2Vec2__op_add_p1:qa,_emscripten_bind_b2World__GetJointList_p0:iD,_emscripten_bind_b2Transform__Set_p2:t4,_emscripten_bind_b2EdgeShape__RayCast_p4:n0,_emscripten_bind_b2RevoluteJoint__GetLocalAnchorA_p0:lk,_emscripten_bind_b2DistanceJoint__GetDampingRatio_p0:gP,_emscripten_bind_b2PulleyJointDef__set_bodyA_p1:sm,_emscripten_bind_b2DynamicTree__Validate_p0:lD,_emscripten_bind_b2DynamicTree__DestroyProxy_p1:lE,_emscripten_bind_b2Joint__IsActive_p0:kf,_emscripten_bind_b2PulleyJoint__GetNext_p0:hQ,_emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0:r7,_emscripten_bind_b2GearJoint__IsActive_p0:kY,_emscripten_bind_b2EdgeShape__get_m_radius_p0:nc,_emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0:rf,_emscripten_bind_b2RevoluteJointDef__set_bodyA_p1:r1,_emscripten_bind_b2World__GetJointCount_p0:iG,_emscripten_bind_b2DynamicTree__CreateProxy_p2:lB,_emscripten_bind_b2WheelJointDef__set_collideConnected_p1:rQ,_emscripten_bind_b2WeldJoint__GetLocalAnchorA_p0:k6,_emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0:r8,_emscripten_bind_b2Body__GetGravityScale_p0:oC,_emscripten_bind_b2Fixture__Dump_p1:h$,_emscripten_bind_b2World__GetBodyList_p0:iE,_emscripten_bind_b2PulleyJoint__IsActive_p0:hR,_emscripten_bind_b2MouseJoint__SetUserData_p1:hx,_emscripten_bind_b2World__GetContactList_p0:iN,_emscripten_bind_b2PrismaticJoint__GetNext_p0:iZ,_emscripten_bind_b2Vec2__Skew_p0:p8,_emscripten_bind_b2BodyDef__get_linearVelocity_p0:pZ,_emscripten_bind_b2Body__GetPosition_p0:oG,_emscripten_bind_b2WheelJoint__GetReactionForce_p1:kw,_emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1:q5,_emscripten_bind_b2PrismaticJoint__SetMaxMotorForce_p1:i2,_emscripten_bind_b2ChainShape__b2ChainShape_p0:mF,_emscripten_bind_b2CircleShape__RayCast_p4:kn,_emscripten_bind_b2WheelJoint__GetBodyA_p0:jI,_emscripten_bind_b2RevoluteJointDef__set_bodyB_p1:r2,_emscripten_bind_b2MouseJointDef__get_dampingRatio_p0:tL,_emscripten_bind_b2JointDef__set_bodyB_p1:sP,_emscripten_bind_b2RevoluteJoint__GetJointSpeed_p0:lZ,_emscripten_bind_b2RopeJoint__GetLocalAnchorB_p0:mm,_emscripten_bind_b2Fixture__GetAABB_p1:hm,_emscripten_bind_b2BroadPhase__TouchProxy_p1:ij,_emscripten_bind_b2FixtureDef__set_isSensor_p1:qC,_emscripten_bind_b2World__GetAllowSleeping_p0:iK,_emscripten_bind_b2DestructionListener____destroy___p0:pb,_emscripten_bind_b2BroadPhase____destroy___p0:ih,_emscripten_bind_b2World__GetWarmStarting_p0:iI,_emscripten_bind_b2Rot__b2Rot_p1:sC,_emscripten_bind_b2Rot__b2Rot_p0:sB,_emscripten_bind_b2DistanceJoint__GetUserData_p0:gI,_emscripten_bind_b2MouseJointDef__get_frequencyHz_p0:tG,_emscripten_bind_b2ContactManager__set_m_allocator_p1:gx,_emscripten_bind_b2WheelJoint__SetMaxMotorTorque_p1:jY,_emscripten_bind_b2RopeJointDef__get_collideConnected_p1:uW,_emscripten_bind_b2MouseJointDef__get_target_p0:tH,_emscripten_bind_b2WeldJoint__SetUserData_p1:k4,_emscripten_bind_b2PrismaticJoint__GetBodyA_p0:iU,_emscripten_bind_b2FrictionJointDef____destroy___p0:qI,_emscripten_bind_b2RopeJoint__GetMaxLength_p0:me,_emscripten_bind_b2MouseJoint__GetDampingRatio_p0:hC,_emscripten_bind_b2DistanceJoint__GetNext_p0:gK,_emscripten_bind_b2Filter__get_maskBits_p0:pl,_emscripten_bind_b2RayCastCallback____destroy___p0:lx,_emscripten_bind_b2World__Dump_p0:jm,_emscripten_bind_b2RevoluteJointDef____destroy___p0:sG,_emscripten_bind_b2PrismaticJoint__GetAnchorA_p0:jn,_emscripten_bind_b2BodyDef__get_bullet_p0:pI,_emscripten_bind_b2Body__SetAngularDamping_p1:ny,_emscripten_bind_b2DynamicTree__RebuildBottomUp_p0:lA,_emscripten_bind_b2Fixture__GetFilterData_p0:ho,_emscripten_bind_b2DistanceJoint__SetLength_p1:gT,_emscripten_bind_b2BodyDef__get_position_p0:pQ,_emscripten_bind_b2FrictionJoint__GetUserData_p0:oJ,_emscripten_bind_b2PolygonShape__get_m_radius_p0:m1,_emscripten_bind_b2ContactEdge__set_next_p1:uL,_emscripten_bind_b2Transform__b2Transform_p2:t6,_emscripten_bind_b2FrictionJointDef__get_maxTorque_p0:pB,_emscripten_bind_b2WeldJointDef__set_localAnchorB_p1:tk,_emscripten_bind_b2World__GetProxyCount_p0:iL,_emscripten_bind_b2WeldJointDef__get_bodyB_p1:tj,_emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1:ra,_emscripten_bind_b2PolygonShape__set_m_centroid_p1:m4,_emscripten_bind_b2GearJoint__GetAnchorA_p0:kO,_emscripten_bind_b2PulleyJointDef__get_collideConnected_p1:sr,_emscripten_bind_b2Vec3____destroy___p0:qR,_emscripten_bind_b2Color__set_r_p1:s0,_emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0:q2,_emscripten_bind_b2BodyDef__get_linearDamping_p0:pC,_emscripten_bind_b2EdgeShape__ComputeMass_p2:n_,_emscripten_bind_b2RayCastCallback__ReportFixture_p4:lv,_emscripten_bind_b2Body__Dump_p0:o0,_emscripten_bind_b2BodyDef__get_allowSleep_p0:pF,_emscripten_bind_b2AABB__get_lowerBound_p0:tg,_emscripten_bind_b2PulleyJoint__GetAnchorB_p0:id,_emscripten_bind_b2PrismaticJoint__GetReactionTorque_p1:ki,_emscripten_bind_b2JointDef__set_bodyA_p1:sO,_emscripten_bind_b2PrismaticJoint__GetBodyB_p0:iV,_emscripten_bind_b2DistanceJoint__GetLocalAnchorA_p0:gL,_emscripten_bind_b2RopeJoint__GetLocalAnchorA_p0:mk,_emscripten_bind_b2Rot__set_c_p1:rs,_emscripten_bind_b2Vec3__op_mul_p1:qj,_emscripten_bind_b2StackAllocator__GetMaxAllocation_p0:oT,_emscripten_bind_b2MouseJoint__SetFrequency_p1:hu,_emscripten_bind_b2WeldJoint__GetAnchorA_p0:lG,_emscripten_bind_b2World__SetAutoClearForces_p1:iP,_emscripten_bind_b2Contact__SetEnabled_p1:nf,_emscripten_bind_b2ContactManager__get_m_contactFilter_p0:gu,_emscripten_bind_b2BodyDef__get_angularDamping_p0:pT,_emscripten_bind_b2WeldJointDef__set_localAnchorA_p1:th,_emscripten_bind_b2DistanceJoint__GetBodyB_p0:gG,_emscripten_bind_b2PulleyJointDef__set_lengthB_p1:ss,_emscripten_bind_b2Vec2__op_sub_p0:qd,_emscripten_bind_b2PrismaticJoint__GetLocalAnchorB_p0:i0,_emscripten_bind_b2RopeJointDef__get_localAnchorB_p0:uV,_emscripten_bind_b2Contact__GetChildIndexB_p0:no,_emscripten_bind_b2Fixture__TestPoint_p1:hX,_emscripten_bind_b2FixtureDef__get_shape_p0:qy,_emscripten_bind_b2WheelJointDef__get_bodyB_p1:rO,_emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0:r4,_emscripten_bind_b2BodyDef__set_linearVelocity_p1:pH,_emscripten_bind_b2Body__GetMass_p0:nK,_emscripten_bind_b2WeldJoint____destroy___p0:lI,_emscripten_bind_b2WheelJoint__GetSpringDampingRatio_p0:jX,_emscripten_bind_b2RopeJointDef__set_localAnchorB_p1:uQ,_emscripten_bind_b2Body__IsFixedRotation_p0:op,_emscripten_bind_b2Rot__SetIdentity_p0:rt,_emscripten_bind_b2WheelJoint__SetSpringDampingRatio_p1:jM,_emscripten_bind_b2Joint__SetUserData_p1:kd,_emscripten_bind_b2FrictionJoint__IsActive_p0:oS,_emscripten_bind_b2JointDef__get_userData_p0:sV,_emscripten_bind_b2Draw__DrawPolygon_p3:kC,_emscripten_bind_b2MouseJoint__GetBodyB_p0:ht,_emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0:tY,_emscripten_bind_b2ContactManager__get_m_broadPhase_p0:gC,_emscripten_bind_b2RopeJoint__GetReactionTorque_p1:mS,_emscripten_bind_b2PrismaticJoint__GetLowerLimit_p0:iY,_emscripten_bind_b2Contact__GetManifold_p0:nq,_emscripten_bind_b2Contact__SetFriction_p1:nl,_emscripten_bind_b2WheelJoint__GetJointSpeed_p0:j_,_emscripten_bind_b2BodyDef__set_allowSleep_p1:pM,_emscripten_bind_b2Fixture__RayCast_p3:hZ,_emscripten_bind_b2WeldJointDef__get_referenceAngle_p0:tq,_emscripten_bind_b2Fixture____destroy___p0:hY,_emscripten_bind_b2RopeJointDef__set_localAnchorA_p1:uN,_emscripten_bind_b2WheelJoint__SetUserData_p1:jW,_emscripten_bind_b2WeldJoint__b2WeldJoint_p1:lQ,_emscripten_bind_b2WeldJoint__IsActive_p0:le,_emscripten_bind_b2Draw__DrawSolidPolygon_p3:kE,_emscripten_bind_b2ContactManager____destroy___p0:g8,_emscripten_bind_b2GearJoint__GetAnchorB_p0:lt,_emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0:ro,_emscripten_bind_b2PolygonShape__get_m_vertexCount_p0:m8,_emscripten_bind_b2RevoluteJoint__GetReferenceAngle_p0:l$,_emscripten_bind_b2DistanceJointDef__Initialize_p4:u$,_emscripten_bind_b2World__IsLocked_p0:iM,_emscripten_bind_b2ContactEdge__get_prev_p0:uG,_emscripten_bind_b2Joint__GetReactionForce_p1:kM,_emscripten_bind_b2WeldJointDef__get_collideConnected_p1:ts,_emscripten_bind_b2Draw__AppendFlags_p1:j4,_emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0:rk,_emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1:rj,_emscripten_bind_b2PrismaticJoint__EnableMotor_p1:i9,_emscripten_bind_b2PrismaticJoint__GetReactionForce_p1:jp,_emscripten_bind_b2Shape__RayCast_p4:oa,_emscripten_bind_b2GearJoint__Dump_p0:lr,_emscripten_bind_b2Body__DestroyFixture_p1:o1,_emscripten_bind_b2Body__SetActive_p1:oe,_emscripten_bind_b2PrismaticJoint__GetCollideConnected_p0:i7,_emscripten_bind_b2ContactListener____destroy___p0:mv,_emscripten_bind_b2MouseJoint__SetDampingRatio_p1:hG,_emscripten_bind_b2Body__ApplyTorque_p1:oj,_emscripten_bind_b2DistanceProxy__GetVertexCount_p0:qq,_emscripten_bind_b2PulleyJoint__GetRatio_p0:hS,_emscripten_bind_b2FixtureDef__set_density_p1:qz,_emscripten_bind_b2RopeJoint__b2RopeJoint_p1:oh,_emscripten_bind_b2FixtureDef__get_filter_p0:qD,_emscripten_bind_b2WheelJoint__GetUserData_p0:jK,_emscripten_bind_b2GearJointDef__set_collideConnected_p1:uC,_emscripten_bind_b2GearJoint____destroy___p0:ls,_emscripten_bind_b2Body__GetAngularVelocity_p0:nB,_emscripten_bind_b2DistanceJointDef__get_bodyA_p1:tN,_emscripten_bind_b2RevoluteJoint__EnableMotor_p1:l_,_emscripten_bind_b2Body__SetType_p1:oX,_emscripten_bind_b2PolygonShape__set_m_vertexCount_p1:m5,_emscripten_bind_b2RopeJointDef__set_collideConnected_p1:uX,_emscripten_bind_b2FrictionJoint__GetBodyB_p0:oL,_emscripten_bind_b2RevoluteJoint__IsLimitEnabled_p0:lq,_emscripten_bind_b2FrictionJointDef__set_maxForce_p1:pv,_emscripten_bind_b2Timer__GetMilliseconds_p0:lT,_emscripten_bind_b2WheelJointDef__get_enableMotor_p0:rL,_emscripten_bind_b2RevoluteJointDef__get_bodyB_p1:sb,_emscripten_bind_b2PolygonShape__GetChildCount_p0:nW,_emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0:mZ,_emscripten_bind_b2ContactEdge__set_other_p1:uK,_emscripten_bind_b2Body__GetMassData_p1:nM,_emscripten_bind_b2Joint__GetNext_p0:j8,_emscripten_bind_b2WeldJoint__GetReactionForce_p1:lH,_emscripten_bind_b2RevoluteJoint__GetAnchorA_p0:lL,_emscripten_bind_b2Filter__set_groupIndex_p1:pk,_emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1:rl,_emscripten_bind_b2FrictionJoint__SetMaxForce_p1:pg,_malloc:vh,_emscripten_bind_b2MouseJoint__b2MouseJoint_p1:h2,_emscripten_bind_b2MouseJoint__Dump_p0:h5,_emscripten_bind_b2FixtureDef__set_restitution_p1:qA,_emscripten_bind_b2Shape__GetChildCount_p0:oc,_emscripten_bind_b2Body__GetJointList_p0:nG,_emscripten_bind_b2Timer____destroy___p0:mu,_emscripten_bind_b2Vec2__IsValid_p0:p7,_emscripten_bind_b2Contact__ResetRestitution_p0:nr,_emscripten_bind_b2RevoluteJointDef__get_collideConnected_p1:r9,_emscripten_bind_b2DynamicTree__MoveProxy_p3:lC,_emscripten_bind_b2Transform__b2Transform_p0:t5,_emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0:sp,_emscripten_bind_b2RevoluteJointDef__get_bodyA_p1:sa,_emscripten_bind_b2WheelJointDef____destroy___p0:sE,_emscripten_bind_b2MouseJoint__GetBodyA_p0:hs,_emscripten_bind_b2GearJoint__GetType_p0:kR,_emscripten_bind_b2Body__SetMassData_p1:o_,_emscripten_bind_b2MouseJoint__IsActive_p0:hH,_emscripten_bind_b2Contact__GetChildIndexA_p0:nn,_emscripten_bind_b2Fixture__GetShape_p0:gX,_emscripten_bind_b2DistanceProxy__set_m_radius_p1:qm,_emscripten_bind_b2DistanceJointDef__get_bodyB_p1:tO,_emscripten_bind_b2RevoluteJoint__GetLowerLimit_p0:li,_emscripten_bind_b2World__DestroyJoint_p1:jf,_emscripten_bind_b2PulleyJointDef__set_ratio_p1:sh,_emscripten_bind_b2DynamicTree__b2DynamicTree_p0:lz,_emscripten_bind_b2RopeJoint__GetType_p0:mi,_emscripten_bind_b2Body__GetLocalPoint_p1:nE,_emscripten_bind_b2World__GetBodyCount_p0:iA,_emscripten_bind_b2CircleShape__GetType_p0:jB,_emscripten_bind_b2DistanceProxy__get_m_radius_p0:ql,_emscripten_bind_b2World__ClearForces_p0:iH,_emscripten_bind_b2DynamicTree____destroy___p0:ly,_emscripten_bind_b2Contact__GetWorldManifold_p1:n5,_emscripten_bind_b2DynamicTree__GetUserData_p1:lO,_emscripten_bind_b2JointDef____destroy___p0:t1,_emscripten_bind_b2DistanceProxy__GetVertex_p1:q_,_emscripten_bind_b2Draw__GetFlags_p0:j7,_emscripten_bind_b2PolygonShape__Set_p2:nQ,_emscripten_bind_b2DistanceJoint____destroy___p0:he,_emscripten_bind_b2DestructionListener__SayGoodbye_p1:pc,_emscripten_bind_b2BodyDef____destroy___p0:qL,_emscripten_bind_b2EdgeShape____destroy___p0:nZ,_emscripten_bind_b2GearJointDef__get_ratio_p0:uD,_emscripten_bind_b2BlockAllocator__Clear_p0:mO,_emscripten_bind_b2RopeJoint__GetAnchorB_p0:mU,_emscripten_bind_b2BodyDef__set_type_p1:pR,_emscripten_bind_b2WheelJoint__EnableMotor_p1:j$,_emscripten_bind_b2FrictionJoint__GetBodyA_p0:oP,_emscripten_bind_b2RopeJoint__GetBodyA_p0:mf,_emscripten_bind_b2WheelJointDef__get_bodyA_p1:rN,_emscripten_bind_b2RopeJoint__GetAnchorA_p0:mR,_emscripten_bind_b2GearJointDef__get_collideConnected_p1:uA,_emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0:r5,_emscripten_bind_b2WeldJoint__GetLocalAnchorB_p0:k7,_emscripten_bind_b2PolygonShape__set_m_radius_p1:m0,_emscripten_bind_b2Vec2__SetZero_p0:qb,_emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0:rI,_emscripten_bind_b2ChainShape__CreateLoop_p2:mX,_emscripten_bind_b2RevoluteJoint__GetNext_p0:lj,_emscripten_bind_b2World__DestroyBody_p1:ji,_emscripten_bind_b2World__SetSubStepping_p1:ir,_emscripten_bind_b2PulleyJoint__SetUserData_p1:hP,_emscripten_bind_b2WheelJoint__GetMotorSpeed_p0:jS,_emscripten_bind_b2RopeJoint__GetLimitState_p0:m_,_emscripten_bind_b2PrismaticJointDef____destroy___p0:sx,_emscripten_bind_b2PulleyJointDef__set_collideConnected_p1:sL,_emscripten_bind_b2WheelJoint__GetNext_p0:jN,_emscripten_bind_b2World__SetContactFilter_p1:iT,_emscripten_bind_b2BroadPhase__GetFatAABB_p1:im,_emscripten_bind_b2FrictionJoint__SetMaxTorque_p1:pf,_emscripten_bind_b2ContactManager__set_m_contactCount_p1:gy,_emscripten_bind_b2Body__GetLinearVelocity_p0:nH,_emscripten_bind_b2ContactManager__get_m_allocator_p0:gE,_emscripten_bind_b2AABB____destroy___p0:ua,_emscripten_bind_b2PulleyJoint__GetCollideConnected_p0:hO,_emscripten_bind_b2Joint__GetUserData_p0:kb,_emscripten_bind_b2Rot__GetXAxis_p0:rr,_emscripten_bind_b2ContactManager__get_m_contactCount_p0:gv,_emscripten_bind_b2DistanceJoint__Dump_p0:hf,_emscripten_bind_b2PolygonShape__GetVertexCount_p0:m6,_emscripten_bind_b2StackAllocator__Free_p1:pa,_emscripten_bind_b2CircleShape__GetSupportVertex_p1:jF,_emscripten_bind_b2DistanceProxy__GetSupportVertex_p1:qo,_emscripten_bind_b2DistanceJointDef__set_bodyA_p1:tR,_emscripten_bind_b2JointDef__set_userData_p1:sN,_emscripten_bind_b2GearJoint__GetBodyB_p0:kT,_emscripten_bind_b2Vec3__get_z_p0:qg,_emscripten_bind_b2RopeJoint__GetUserData_p0:mh,_emscripten_bind_b2GearJoint__GetUserData_p0:kS,_emscripten_bind_b2FixtureDef__get_restitution_p0:qB,_emscripten_bind_b2WheelJoint__GetAnchorB_p0:kt,_emscripten_bind_b2FixtureDef__b2FixtureDef_p0:qY,_emscripten_bind_b2WheelJointDef__get_motorSpeed_p0:rx,_emscripten_bind_b2FrictionJoint__b2FrictionJoint_p1:ph,_emscripten_bind_b2Body__GetAngularDamping_p0:on,_emscripten_bind_b2ChainShape__GetChildCount_p0:mI,_emscripten_bind_b2ChainShape__SetNextVertex_p1:mb,_emscripten_bind_b2Joint__GetBodyA_p0:j9,_emscripten_bind_b2Fixture__IsSensor_p0:hp,_emscripten_bind_b2Filter__set_maskBits_p1:oU,_emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1:si,_emscripten_bind_b2ContactListener__PreSolve_p2:mz,_emscripten_bind_b2WheelJointDef__get_localAnchorB_p0:rJ,_emscripten_bind_b2WheelJointDef__set_bodyB_p1:rD,_emscripten_bind_b2BroadPhase__MoveProxy_p3:il,_emscripten_bind_b2BodyDef__get_active_p0:p_,_emscripten_bind_b2CircleShape__GetVertexCount_p0:ju,_emscripten_bind_b2Timer__Reset_p0:lS,_emscripten_bind_b2QueryCallback____destroy___p0:mL,_emscripten_bind_b2World__b2World_p1:jg,_emscripten_bind_b2Vec3__Set_p3:qf,_emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0:q1,_emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1:r6,_emscripten_bind_b2StackAllocator____destroy___p0:pi,_emscripten_bind_b2ContactEdge__get_other_p0:uH,_emscripten_bind_b2Fixture__GetType_p0:hq,_emscripten_bind_b2ContactListener__PostSolve_p2:mA,_emscripten_bind_b2WeldJointDef__set_collideConnected_p1:tu,_emscripten_bind_b2Contact__SetRestitution_p1:np,_emscripten_bind_b2Body__GetInertia_p0:oD,_emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0:qJ,_emscripten_bind_b2PolygonShape__get_m_centroid_p0:m9,_emscripten_bind_b2PrismaticJoint__IsMotorEnabled_p0:i4,_emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0:pu,_emscripten_bind_b2Draw__SetFlags_p1:j6,_emscripten_bind_b2WeldJoint__GetUserData_p0:k3,_emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0:ue,_emscripten_bind_b2FrictionJointDef__set_collideConnected_p1:pz,_emscripten_bind_b2World__SetAllowSleeping_p1:iJ,_emscripten_bind_b2BodyDef__set_gravityScale_p1:pS,_emscripten_bind_b2Contact__IsTouching_p0:ni,_emscripten_bind_b2Transform__set_q_p1:sX,_emscripten_bind_b2FrictionJoint__GetAnchorB_p0:o7,_emscripten_bind_b2World__RayCast_p3:jk,_emscripten_bind_b2WeldJointDef__get_bodyA_p1:ti,_emscripten_bind_b2WheelJoint__GetMotorTorque_p1:jT,_emscripten_bind_b2Draw__b2Draw_p0:kH,_emscripten_bind_b2ChainShape____destroy___p0:mB,_emscripten_bind_b2ChainShape__get_m_radius_p0:l6,_emscripten_bind_b2RopeJoint__IsActive_p0:m$,_emscripten_bind_b2EdgeShape__set_m_radius_p1:nb,_emscripten_bind_b2DistanceJointDef__get_length_p0:tT,_emscripten_bind_b2DistanceJoint__SetUserData_p1:gJ,_emscripten_bind_b2ContactManager__set_m_contactListener_p1:gB,_emscripten_bind_b2MouseJointDef__get_maxForce_p0:tD,_emscripten_bind_b2WheelJoint____destroy___p0:kx,_emscripten_bind_b2PulleyJoint__GetBodyA_p0:hI,_emscripten_bind_b2MouseJoint__SetMaxForce_p1:hw,_emscripten_bind_b2World__GetGravity_p0:iQ,_emscripten_bind_b2WheelJointDef__set_bodyA_p1:rC,_emscripten_bind_b2AABB__b2AABB_p0:ub,_emscripten_bind_b2DistanceProxy____destroy___p0:qW,_emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1:rV,_emscripten_bind_b2World__GetProfile_p0:iu,_emscripten_bind_b2PulleyJointDef__get_bodyA_p1:su,_emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1:sj,_emscripten_bind_b2PolygonShape__Clone_p1:nS,_emscripten_bind_b2PrismaticJoint__GetUserData_p0:iW,_emscripten_bind_b2PrismaticJoint__IsLimitEnabled_p0:jy,_emscripten_bind_b2PulleyJoint__GetAnchorA_p0:h8,_emscripten_bind_b2Fixture__Refilter_p0:h_,_emscripten_bind_b2Vec3__SetZero_p0:qi,_emscripten_bind_b2ContactListener__EndContact_p1:mx,_emscripten_bind_b2Vec2__Normalize_p0:qM,_emscripten_bind_b2Shape__ComputeMass_p2:n8,_emscripten_bind_b2FrictionJoint__GetMaxForce_p0:oH,_emscripten_bind_b2BodyDef__get_type_p0:pE,_emscripten_bind_b2FixtureDef__get_userData_p0:qG,_emscripten_bind_b2MouseJointDef__get_collideConnected_p1:tI,_emscripten_bind_b2Contact__ResetFriction_p0:n6,_emscripten_bind_b2WeldJointDef__Initialize_p3:tw,_emscripten_bind_b2DistanceJoint__GetCollideConnected_p0:gQ,_emscripten_bind_b2Rot__Set_p1:sz,_emscripten_bind_b2ChainShape__RayCast_p4:mH,_emscripten_bind_b2RevoluteJoint__GetReactionForce_p1:mo,_emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0:sw,_emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0:pw,_emscripten_bind_b2MouseJoint__GetMaxForce_p0:hz,_emscripten_bind_b2RopeJoint__Dump_p0:mT,_emscripten_bind_b2WheelJointDef__set_enableMotor_p1:rP,_emscripten_bind_b2ContactManager__get_m_contactList_p0:gD,_emscripten_bind_b2PolygonShape__ComputeAABB_p3:nV,_emscripten_bind_b2RopeJointDef__set_bodyB_p1:uS,_emscripten_bind_b2BodyDef__set_fixedRotation_p1:pL,_emscripten_bind_b2WheelJoint__GetAnchorA_p0:ku,_emscripten_bind_b2GearJoint__GetBodyA_p0:kW,_emscripten_bind_b2CircleShape__b2CircleShape_p0:kr,_emscripten_bind_b2EdgeShape__GetChildCount_p0:n2,_emscripten_bind_b2BodyDef__set_active_p1:pV,_emscripten_bind_b2FrictionJointDef__get_bodyA_p1:po,_emscripten_bind_b2PulleyJoint__GetReactionTorque_p1:h9,_emscripten_bind_b2DistanceJoint__b2DistanceJoint_p1:hj,_emscripten_bind_b2Vec2____destroy___p0:qQ,_emscripten_bind_b2ChainShape__get_m_vertices_p0:l7,_emscripten_bind_b2BodyDef__b2BodyDef_p0:qK,_emscripten_bind_b2RevoluteJoint__Dump_p0:mq,_emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0:sF,_emscripten_bind_b2World__SetDebugDraw_p1:iO,_emscripten_bind_b2MouseJoint____destroy___p0:h4,_emscripten_bind_b2RevoluteJoint__IsMotorEnabled_p0:lV,_emscripten_bind_b2MouseJointDef__set_frequencyHz_p1:tK,_emscripten_bind_b2DestructionListener__b2DestructionListener_p0:pd,_emscripten_bind_b2WheelJointDef__get_frequencyHz_p0:rF,_emscripten_bind_b2Filter__b2Filter_p0:qH,_emscripten_bind_b2World____destroy___p0:jl,_emscripten_bind_b2Body__SetBullet_p1:oA,_emscripten_bind_b2Body__GetAngle_p0:nv,_emscripten_bind_b2PrismaticJointDef__set_bodyA_p1:q7,_emscripten_bind_b2MouseJoint__GetTarget_p0:hA,_emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0:tV,_emscripten_bind_b2Contact__GetNext_p0:ne,_emscripten_bind_b2World__DrawDebugData_p0:je,_emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1:sc,_emscripten_bind_b2Vec2__LengthSquared_p0:p9,_emscripten_bind_b2WheelJointDef__get_localAnchorA_p0:rH,_emscripten_bind_b2RevoluteJoint____destroy___p0:mp,_emscripten_bind_b2PulleyJointDef__get_lengthB_p0:sJ,_emscripten_bind_b2WeldJoint__GetReferenceAngle_p0:lb,_strlen:vr,_emscripten_bind_b2FixtureDef__set_filter_p1:qZ,_emscripten_bind_b2ChainShape__CreateChain_p2:mW,_emscripten_bind_b2Body__GetLocalVector_p1:oy,_emscripten_bind_b2Fixture__SetUserData_p1:hn,_emscripten_bind_b2RevoluteJoint__GetLocalAnchorB_p0:lm,_emscripten_bind_b2FrictionJointDef__set_maxTorque_p1:py,_emscripten_bind_b2ChainShape__ComputeAABB_p3:mG,_emscripten_bind_b2RopeJoint__GetReactionForce_p1:nO,_emscripten_bind_b2CircleShape__GetSupport_p1:jv,_emscripten_bind_b2World__GetContinuousPhysics_p0:iC,_emscripten_bind_b2FrictionJointDef__get_maxForce_p0:pt,_emscripten_bind_b2Draw____destroy___p0:kA,_emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1:rS,_emscripten_bind_b2MouseJoint__GetCollideConnected_p0:hD,_emscripten_bind_b2MouseJoint__GetReactionForce_p1:h3,_emscripten_bind_b2JointDef__set_type_p1:sR,_emscripten_bind_b2Color__Set_p3:s$,_emscripten_bind_b2WeldJoint__GetType_p0:lc,_emscripten_bind_b2Joint__GetBodyB_p0:ka,_emscripten_bind_b2ContactManager__set_m_broadPhase_p1:ha,_emscripten_bind_b2JointDef__get_type_p0:sT,_emscripten_bind_b2BodyDef__set_position_p1:pG,_emscripten_bind_b2Vec2__Length_p0:qP,_emscripten_bind_b2MouseJoint__GetUserData_p0:hv,_emscripten_bind_b2JointDef__get_collideConnected_p0:sS,_emscripten_bind_b2BroadPhase__GetTreeQuality_p0:hT,_emscripten_bind_b2WheelJointDef__get_dampingRatio_p0:rM,_emscripten_bind_b2RopeJoint__GetBodyB_p0:mj,_emscripten_bind_b2Joint__GetCollideConnected_p0:ke,_emscripten_bind_b2FrictionJoint__GetReactionTorque_p1:o4,_emscripten_bind_b2PulleyJointDef__get_bodyB_p1:sv,_emscripten_bind_b2ContactManager__set_m_contactFilter_p1:gw,_emscripten_bind_b2FrictionJoint__GetAnchorA_p0:o3,_emscripten_bind_b2EdgeShape__ComputeAABB_p3:n1,_emscripten_bind_b2BodyDef__set_awake_p1:p1,_emscripten_bind_b2FrictionJointDef__get_bodyB_p1:pp,_emscripten_bind_b2PrismaticJoint__SetMotorSpeed_p1:i$,_emscripten_bind_b2PolygonShape__RayCast_p4:nT,_emscripten_bind_b2CircleShape__ComputeMass_p2:kl,_emscripten_bind_b2MouseJoint__GetFrequency_p0:hB,_emscripten_bind_b2Contact__IsEnabled_p0:nj,_emscripten_bind_b2PrismaticJointDef__set_bodyB_p1:q8,_emscripten_bind_b2FixtureDef__set_userData_p1:qv,_emscripten_bind_b2Fixture__SetSensor_p1:hl,_emscripten_bind_b2Shape__GetType_p0:nu,_emscripten_bind_b2WeldJointDef__get_localAnchorB_p0:tr,_emscripten_bind_b2ContactManager__Destroy_p1:g9,_emscripten_bind_b2PrismaticJoint__GetLocalAnchorA_p0:i_,_emscripten_bind_b2WheelJointDef__set_motorSpeed_p1:rA,_emscripten_bind_b2Contact__Evaluate_p3:n7,_emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1:sg,_emscripten_bind_b2RevoluteJoint__GetType_p0:l1,_emscripten_bind_b2AABB__Combine_p1:td,_emscripten_bind_b2GearJoint__GetReactionTorque_p1:kP,_emscripten_bind_b2AABB__Combine_p2:te,_emscripten_bind_b2PulleyJointDef__get_lengthA_p0:sK,_emscripten_bind_b2Shape__get_m_radius_p0:ns,_emscripten_bind_b2ChainShape__set_m_count_p1:mc,_emscripten_bind_b2RopeJointDef__set_bodyA_p1:uR,_emscripten_bind_b2DynamicTree__GetFatAABB_p1:lN,_emscripten_bind_b2DistanceJoint__GetFrequency_p0:gN,_emscripten_bind_b2PrismaticJoint__SetLimits_p2:kQ,_emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0:t0,_emscripten_bind_b2Color__get_g_p0:s3,_emscripten_bind_b2Fixture__GetBody_p0:gZ,_emscripten_bind_b2FrictionJointDef__get_collideConnected_p1:px,_emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1:ry,_emscripten_bind_b2GearJointDef__get_bodyB_p1:uu,_emscripten_bind_b2AABB__set_upperBound_p1:s6,_emscripten_bind_b2Contact__GetFixtureA_p0:nm,_emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1:rU,_emscripten_bind_b2WheelJointDef__set_localAnchorA_p1:rv,_emscripten_bind_b2DistanceJointDef__set_bodyB_p1:tS,_emscripten_bind_b2Transform__SetIdentity_p0:s_,_emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1:pn,_emscripten_bind_b2Body__SetTransform_p2:of,_emscripten_bind_b2DistanceJoint__GetReactionTorque_p1:hg,_emscripten_bind_b2StackAllocator__b2StackAllocator_p0:o9,_emscripten_bind_b2MouseJointDef__set_maxForce_p1:tF,_emscripten_bind_b2RevoluteJoint__GetMotorTorque_p1:lp,_emscripten_bind_b2Vec2__set_y_p1:p6,_emscripten_bind_b2CircleShape__Clone_p1:km,_emscripten_bind_b2Rot__GetAngle_p0:sA,_emscripten_bind_b2Color____destroy___p0:t7,_emscripten_bind_b2WeldJoint__GetBodyA_p0:k0,_emscripten_bind_b2Fixture__GetRestitution_p0:gV,_emscripten_bind_b2DistanceJointDef__set_length_p1:t_,_emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0:q6,_emscripten_bind_b2Color__b2Color_p3:t9,_emscripten_bind_b2Body__ApplyForceToCenter_p1:oi,_emscripten_bind_b2PrismaticJoint__SetUserData_p1:i5,_emscripten_bind_b2Color__get_r_p0:s1,_emscripten_bind_b2RevoluteJoint__b2RevoluteJoint_p1:lR,_emscripten_bind_b2RevoluteJoint__GetCollideConnected_p0:lY,_emscripten_bind_b2PrismaticJoint__IsActive_p0:jA,_emscripten_bind_b2Body__SetFixedRotation_p1:o2,_emscripten_bind_b2RopeJointDef____destroy___p0:u4,_emscripten_bind_b2PrismaticJointDef__get_bodyB_p1:ri,_emscripten_bind_b2Shape__set_m_radius_p1:nt,_emscripten_bind_b2WheelJoint__GetBodyB_p0:jJ,_emscripten_bind_b2JointDef__get_bodyA_p0:sM,_emscripten_bind_b2World__GetContactCount_p0:iR,_emscripten_bind_b2Fixture__b2Fixture_p0:hi,_emscripten_bind_b2StackAllocator__Allocate_p1:pj,_emscripten_bind_b2Body__SetGravityScale_p1:nz,_emscripten_bind_b2BroadPhase__CreateProxy_p2:ik,_emscripten_bind_b2WheelJoint__GetLocalAnchorA_p0:jP,_emscripten_bind_b2FrictionJointDef__set_bodyB_p1:ps,_emscripten_bind_b2WheelJoint__SetSpringFrequencyHz_p1:j2,_emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0:uf,_emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1:q0,_emscripten_bind_b2Filter____destroy___p0:pe,_emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1:rm,_emscripten_bind_b2Fixture__GetUserData_p0:g0,_emscripten_bind_b2AABB__get_upperBound_p0:tb,_emscripten_bind_b2PulleyJoint__Dump_p0:ia,_emscripten_bind_b2RopeJointDef__get_localAnchorA_p0:uT,_emscripten_bind_b2CircleShape__get_m_radius_p0:jD,_emscripten_bind_b2DistanceJoint__GetLength_p0:gO,_emscripten_bind_b2BodyDef__set_angularVelocity_p1:pO,_emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0:r_,_emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1:sf,_emscripten_bind_b2RevoluteJoint__SetMotorSpeed_p1:ll,_emscripten_bind_b2WeldJoint__GetReactionTorque_p1:lK,_emscripten_bind_b2GearJoint__SetUserData_p1:kV,_emscripten_bind_b2PrismaticJoint__GetAnchorB_p0:kj,_emscripten_bind_b2MouseJointDef__set_target_p1:tE,_emscripten_bind_b2WeldJoint__GetBodyB_p0:k1,_emscripten_bind_b2PolygonShape__TestPoint_p2:nX,_emscripten_bind_b2WheelJointDef__set_localAnchorB_p1:rw,_emscripten_bind_b2WheelJoint__GetReactionTorque_p1:kz,_emscripten_bind_b2FrictionJointDef__set_bodyA_p1:pr,_emscripten_bind_b2Color__b2Color_p0:t8,_emscripten_bind_b2BroadPhase__TestOverlap_p2:iq,_emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1:q$,_emscripten_bind_b2RevoluteJoint__GetReactionTorque_p1:mr,_emscripten_bind_b2Joint__GetAnchorB_p0:kL,_emscripten_bind_b2CircleShape__set_m_radius_p1:jC,_memcpy:vp,_emscripten_bind_b2World__GetContactManager_p0:iw,_emscripten_bind_b2RevoluteJoint__SetUserData_p1:lW,_emscripten_bind_b2Contact__GetFixtureB_p0:nk,_emscripten_bind_b2Rot__GetYAxis_p0:rq,_emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1:rX,_emscripten_bind_b2Shape__Clone_p1:n9,_emscripten_bind_b2PulleyJoint__GetType_p0:hJ,_emscripten_bind_b2AABB__set_lowerBound_p1:tf,_emscripten_bind_b2RopeJoint__GetCollideConnected_p0:mg,_emscripten_bind_b2DistanceJoint__IsActive_p0:gU,_emscripten_bind_b2BodyDef__set_linearDamping_p1:p$,_emscripten_bind_b2BroadPhase__GetTreeBalance_p0:ip,_emscripten_bind_b2AABB__GetExtents_p0:s9,_emscripten_bind_b2CircleShape____destroy___p0:kk,_emscripten_bind_b2WeldJoint__SetFrequency_p1:k2,_emscripten_bind_b2GearJointDef__set_ratio_p1:uz,_emscripten_bind_b2FixtureDef__get_density_p0:qx,_emscripten_bind_b2AABB__GetCenter_p0:ta,_emscripten_bind_b2Draw__ClearFlags_p1:j5,_emscripten_bind_b2WeldJointDef__get_localAnchorA_p0:tp,_emscripten_bind_b2PolygonShape__GetType_p0:m7,_emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1:tQ,_emscripten_bind_b2BroadPhase__GetUserData_p1:io,_emscripten_bind_b2Rot__get_c_p0:ru,_emscripten_bind_b2World__GetAutoClearForces_p0:iB,_emscripten_bind_b2World__GetTreeHeight_p0:it,_emscripten_bind_b2AABB__IsValid_p0:s7,_emscripten_bind_b2RevoluteJoint__GetAnchorB_p0:ms,_emscripten_bind_b2RopeJointDef__get_bodyB_p1:uP,_emscripten_bind_b2World__CreateJoint_p1:jj,_emscripten_bind_b2WheelJoint__GetDefinition_p1:ks,_emscripten_bind_b2Color__set_b_p1:s2,_emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0:q3,_emscripten_bind_b2Body__GetLocalCenter_p0:oq,_emscripten_bind_b2WheelJoint__GetLocalAxisA_p0:jL,_emscripten_bind_b2Contact__GetFriction_p0:nh,_emscripten_bind_b2Body__SetAngularVelocity_p1:nL,_emscripten_bind_b2PrismaticJoint__GetJointSpeed_p0:i8,_emscripten_bind_b2CircleShape__TestPoint_p2:kq,_emscripten_bind_b2Body__SetAwake_p1:o$,_emscripten_bind_b2Filter__set_categoryBits_p1:oV,_emscripten_bind_b2ChainShape__ComputeMass_p2:mC,_emscripten_bind_b2PrismaticJointDef__get_collideConnected_p1:rg,_emscripten_bind_b2World__CreateBody_p1:jt,_emscripten_bind_b2JointDef__get_bodyB_p0:sQ,_emscripten_bind_b2ChainShape__get_m_count_p0:l8,_emscripten_bind_b2Joint__GetType_p0:kc,_emscripten_bind_b2WheelJoint__GetCollideConnected_p0:jZ,_emscripten_bind_b2WheelJointDef__set_localAxisA_p1:rR,_emscripten_bind_b2CircleShape__GetVertex_p1:jE,_emscripten_bind_b2WeldJoint__GetNext_p0:k5,_emscripten_bind_b2WeldJoint__GetCollideConnected_p0:la,_emscripten_bind_b2World__SetDestructionListener_p1:iF,_emscripten_bind_b2WheelJointDef__get_localAxisA_p0:rB,_emscripten_bind_b2Joint__GetAnchorA_p0:kJ,_emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0:qV,_emscripten_bind_b2WheelJoint__IsActive_p0:j3,_emscripten_bind_b2Transform____destroy___p0:t3,_emscripten_bind_b2PolygonShape__ComputeMass_p2:nR,_emscripten_bind_b2RopeJointDef__get_bodyA_p1:uO,_emscripten_bind_b2WheelJoint__b2WheelJoint_p1:kv,_emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1:os,_emscripten_bind_b2Draw__DrawTransform_p1:kB,_emscripten_bind_b2DistanceJoint__GetType_p0:gR,_emscripten_bind_b2MouseJointDef__set_bodyB_p1:tC,_emscripten_bind_b2Fixture__GetFriction_p0:g$,_emscripten_bind_b2Body__GetWorld_p0:ox,_emscripten_bind_b2PolygonShape__b2PolygonShape_p0:nY,_emscripten_bind_b2WeldJointDef__set_frequencyHz_p1:tv,_emscripten_bind_b2RevoluteJoint__GetJointAngle_p0:ln,_emscripten_bind_b2Body__ResetMassData_p0:og,_emscripten_bind_b2RevoluteJoint__IsActive_p0:l3,_emscripten_bind_b2FrictionJoint__SetUserData_p1:oO,_emscripten_bind_b2PulleyJoint__GetReactionForce_p1:ie,_emscripten_bind_b2Timer__b2Timer_p0:mt,_emscripten_bind_b2World__SetContinuousPhysics_p1:iy,_emscripten_bind_b2ContactManager__FindNewContacts_p0:g7,_emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0:tU,_emscripten_bind_b2DynamicTree__GetMaxBalance_p0:lP,_emscripten_bind_b2PolygonShape__GetVertex_p1:m2,_emscripten_bind_b2WeldJointDef__get_frequencyHz_p0:tl,_emscripten_bind_b2ContactListener__BeginContact_p1:my,_emscripten_bind_b2RevoluteJointDef__set_collideConnected_p1:se,_emscripten_bind_b2DistanceJoint__GetAnchorA_p0:hc,_emscripten_bind_b2PrismaticJoint__GetLocalAxisA_p0:iX,_emscripten_bind_b2ChainShape__Clone_p1:mD,_emscripten_bind_b2GearJointDef__b2GearJointDef_p0:u1,_emscripten_bind_b2RevoluteJoint__GetBodyA_p0:lf,_emscripten_bind_b2Body__ApplyForce_p2:nD,_emscripten_bind_b2MouseJoint__GetReactionTorque_p1:h6,_emscripten_bind_b2Vec2__get_y_p0:p5,_emscripten_bind_b2ContactEdge__get_contact_p0:uM,_emscripten_bind_b2GearJointDef__set_bodyB_p1:ux,_emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0:rW,_emscripten_bind_b2RopeJoint____destroy___p0:mQ,_emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0:sD,_emscripten_bind_b2DistanceJoint__SetFrequency_p1:gH,_emscripten_bind_b2PulleyJointDef__set_lengthA_p1:st,_emscripten_bind_b2FixtureDef__get_friction_p0:qE,_emscripten_bind_b2ContactEdge__get_next_p0:uJ,_emscripten_bind_b2RevoluteJoint__GetBodyB_p0:lg,_emscripten_bind_b2RevoluteJoint__GetUserData_p0:lh,_emscripten_bind_b2Body__GetType_p0:oB,_emscripten_bind_b2World__Step_p3:jh,_emscripten_bind_b2Vec2__set_x_p1:p2,_emscripten_bind_b2ContactManager__b2ContactManager_p0:g4,_emscripten_bind_b2RopeJoint__GetNext_p0:md,_emscripten_bind_b2WeldJoint__SetDampingRatio_p1:ld,_emscripten_bind_b2World__GetTreeQuality_p0:is,_emscripten_bind_b2WeldJoint__GetAnchorB_p0:lF,_emscripten_bind_b2Contact__GetRestitution_p0:ng,_emscripten_bind_b2MouseJointDef____destroy___p0:ug,_emscripten_bind_b2Body__GetTransform_p0:ol,_emscripten_bind_b2PrismaticJoint__b2PrismaticJoint_p1:jo,_emscripten_bind_b2RopeJointDef__get_maxLength_p0:uU,_emscripten_bind_b2DistanceJoint__GetAnchorB_p0:hb,_emscripten_bind_b2ChainShape__set_m_vertices_p1:ma,_emscripten_bind_b2EdgeShape__TestPoint_p2:n3,_emscripten_bind_b2FrictionJoint__GetMaxTorque_p0:oR,_emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0:u5,_emscripten_bind_b2ContactManager__AddPair_p2:g5,_emscripten_bind_b2Color__set_g_p1:s5,_emscripten_bind_b2WheelJoint__IsMotorEnabled_p0:jU,_emscripten_bind_b2QueryCallback__b2QueryCallback_p0:mM,_emscripten_bind_b2WheelJointDef__get_collideConnected_p1:rK,_emscripten_bind_b2FrictionJoint__Dump_p0:o5,_emscripten_bind_b2ChainShape__SetPrevVertex_p1:l9,_emscripten_bind_b2AABB__GetPerimeter_p0:tc,_emscripten_bind_b2DistanceProxy__set_m_count_p1:qt,_emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1:nN,_emscripten_bind_b2MouseJointDef__set_bodyA_p1:tB,_emscripten_bind_b2DynamicTree__GetAreaRatio_p0:k$,_emscripten_bind_b2World__QueryAABB_p2:jd,_emscripten_bind_b2RevoluteJoint__GetUpperLimit_p0:l2,_emscripten_bind_b2World__SetGravity_p1:iz,_emscripten_bind_b2PulleyJointDef__Initialize_p7:sH,_emscripten_bind_b2Color__get_b_p0:s4,_emscripten_bind_b2DistanceJoint__GetBodyA_p0:gF,_emscripten_bind_b2BroadPhase__DestroyProxy_p1:jc,_emscripten_bind_b2PulleyJoint____destroy___p0:h7,_emscripten_bind_b2BroadPhase__GetProxyCount_p0:hV,_emscripten_bind_b2DistanceJoint__GetLocalAnchorB_p0:gM,_emscripten_bind_b2ChainShape__GetChildEdge_p2:mE,_emscripten_bind_b2EdgeShape__b2EdgeShape_p0:n4,_emscripten_bind_b2ContactEdge__set_contact_p1:uF,_emscripten_bind_b2WheelJoint__SetMotorSpeed_p1:jQ,_emscripten_bind_b2ChainShape__GetType_p0:l4,_emscripten_bind_b2Fixture__SetFilterData_p1:hh,_emscripten_bind_b2Body__ApplyAngularImpulse_p1:oF,_emscripten_bind_b2RevoluteJoint__SetLimits_p2:mV,_emscripten_bind_b2ChainShape__TestPoint_p2:mJ,_emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0:r0,_emscripten_bind_b2CircleShape__get_m_p_p0:jH,_emscripten_bind_b2BodyDef__get_awake_p0:pD,_emscripten_bind_b2MouseJoint__GetAnchorB_p0:h0,_emscripten_bind_b2Body__CreateFixture_p1:oY,_emscripten_bind_b2Body__CreateFixture_p2:oZ,_emscripten_bind_b2GearJointDef____destroy___p0:u0,_emscripten_bind_b2Fixture__GetDensity_p0:hr,_emscripten_bind_b2PrismaticJoint__GetJointTranslation_p0:jw,_emscripten_bind_b2WeldJoint__GetDampingRatio_p0:k9,_emscripten_bind_b2FrictionJoint__GetReactionForce_p1:o8,_emscripten_bind_b2BodyDef__set_userData_p1:pP,_emscripten_bind_b2World__SetContactListener_p1:ix,_emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0:sq,_emscripten_bind_b2FixtureDef__set_shape_p1:qw,_emscripten_bind_b2DistanceJoint__SetDampingRatio_p1:gS,_emscripten_bind_b2Joint__Dump_p0:kK,_emscripten_bind_b2Shape__TestPoint_p2:od,_emscripten_bind_b2RopeJointDef__set_maxLength_p1:uY,_emscripten_bind_b2RopeJoint__SetUserData_p1:mn,_emscripten_bind_b2Transform__get_p_p0:sY,_emscripten_bind_b2PulleyJoint__GetLengthA_p0:ic,_emscripten_bind_b2GearJoint__GetJoint2_p0:kh,_emscripten_bind_b2Fixture__GetMassData_p1:hW,_emscripten_bind_b2Body__IsBullet_p0:ow,_emscripten_bind_b2WeldJointDef____destroy___p0:ud,_emscripten_bind_b2PrismaticJoint__GetMotorSpeed_p0:i1,_emscripten_bind_b2GearJointDef__get_bodyA_p1:ut,_emscripten_bind_b2Draw__DrawCircle_p3:kF,_emscripten_bind_b2FrictionJoint__GetLocalAnchorA_p0:oM,_emscripten_bind_b2Body__GetWorldPoint_p1:ou,_emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1:rd,_emscripten_bind_b2GearJointDef__set_bodyA_p1:uw,_emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1:r$,_emscripten_bind_b2BodyDef__set_bullet_p1:pU,_emscripten_bind_b2BodyDef__get_angularVelocity_p0:pY,_emscripten_bind_b2GearJoint__GetNext_p0:kX,_emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0:rc,_emscripten_bind_b2BodyDef__get_fixedRotation_p0:p0,_emscripten_bind_b2Body__GetFixtureList_p0:nC,_emscripten_bind_b2WheelJoint__GetJointTranslation_p0:jV,_emscripten_bind_b2WeldJointDef__get_dampingRatio_p0:tt,_emscripten_bind_b2RopeJoint__SetMaxLength_p1:ml,_emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0:tW,_emscripten_bind_b2PulleyJoint__GetGroundAnchorB_p0:hK,_emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0:sk,_emscripten_bind_b2GearJointDef__set_joint2_p1:uy,_emscripten_bind_b2BroadPhase__b2BroadPhase_p0:ii,_emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0:rT,_emscripten_bind_b2MouseJoint__SetTarget_p1:hE,_emscripten_bind_b2ContactEdge__set_prev_p1:uI,_emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0:rb,_emscripten_bind_b2ChainShape__set_m_radius_p1:l5,_emscripten_bind_b2Vec2__get_x_p0:p4,_emscripten_bind_b2DistanceProxy__GetSupport_p1:qr,_emscripten_bind_b2WheelJoint__GetLocalAnchorB_p0:jR,_emscripten_bind_b2GearJointDef__get_joint2_p0:uB,_emscripten_bind_b2PrismaticJointDef__set_collideConnected_p1:rn,_emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1:pq,_emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1:rp,_emscripten_bind_b2Fixture__SetDensity_p1:hk,_emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1:rZ,_emscripten_bind_b2Body__IsAwake_p0:ok,_emscripten_bind_b2MouseJoint__GetAnchorA_p0:h1,_emscripten_bind_b2PolygonShape__SetAsBox_p4:nU,_emscripten_bind_b2PolygonShape__SetAsBox_p2:m3,_emscripten_bind_b2GearJointDef__set_joint1_p1:uE,_emscripten_bind_b2Draw__DrawSolidCircle_p4:kD,_emscripten_bind_b2World__GetSubStepping_p0:iv,_emscripten_bind_b2FrictionJoint__GetLocalAnchorB_p0:oN,_free:vi,_emscripten_bind_b2Body__SetLinearDamping_p1:oz,_emscripten_bind_b2Body__GetWorldVector_p1:or,_emscripten_bind_b2Fixture__SetFriction_p1:gW,_emscripten_bind_b2Filter__get_groupIndex_p0:oW,_emscripten_bind_b2FixtureDef__get_isSensor_p0:qu,_emscripten_bind_b2PrismaticJoint__GetUpperLimit_p0:jz,_emscripten_bind_b2PrismaticJoint__Dump_p0:jr,_emscripten_bind_b2Vec2__op_mul_p1:qc,_emscripten_bind_b2DistanceProxy__Set_p2:qU,_emscripten_bind_b2EdgeShape__Set_p2:na,_emscripten_bind_b2BodyDef__get_userData_p0:pJ,_emscripten_bind_b2CircleShape__set_m_p_p1:jG,_emscripten_bind_b2WheelJoint__GetMaxMotorTorque_p0:j0,_emscripten_bind_b2GearJoint__GetJoint1_p0:kg,_emscripten_bind_b2WheelJointDef__set_dampingRatio_p1:rG,_emscripten_bind_b2DistanceJointDef__set_collideConnected_p1:tZ,_emscripten_bind_b2DistanceProxy__get_m_count_p0:qp,_emscripten_bind_b2WeldJointDef__set_dampingRatio_p1:tx,_emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1:tP,_emscripten_bind_b2GearJoint__GetCollideConnected_p0:kU,_emscripten_bind_b2FrictionJoint__GetCollideConnected_p0:oI,_memset:vq,_emscripten_bind_b2WheelJoint__Dump_p0:ky,_emscripten_bind_b2World__GetTreeBalance_p0:js,_emscripten_bind_b2ContactListener__b2ContactListener_p0:mw,_emscripten_bind_b2Rot____destroy___p0:sy,_emscripten_bind_b2PrismaticJoint__GetMaxMotorForce_p0:i6,_emscripten_bind_b2PulleyJointDef__set_bodyB_p1:sn,_emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0:sl,_emscripten_bind_b2RevoluteJoint__GetMotorSpeed_p0:lo,_emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0:uh,_emscripten_bind_b2Body__GetNext_p0:nI,_emscripten_bind_b2BroadPhase__GetTreeHeight_p0:hU,_emscripten_bind_b2Draw__DrawSegment_p3:kG,_emscripten_bind_b2Body__IsActive_p0:oE,_emscripten_bind_b2Vec2__Set_p2:p3,_emscripten_bind_b2PulleyJoint__GetUserData_p0:hM,_emscripten_bind_b2ContactEdge__b2ContactEdge_p0:u3,_emscripten_bind_b2Vec3__b2Vec3_p3:qT,_emscripten_bind_b2Vec3__b2Vec3_p0:qS,_emscripten_bind_b2PulleyJoint__GetGroundAnchorA_p0:hL,_emscripten_bind_b2JointDef__b2JointDef_p0:t2,_emscripten_bind_b2PulleyJoint__GetBodyB_p0:hN,_emscripten_bind_b2PulleyJointDef____destroy___p0:sI,_emscripten_bind_b2FixtureDef____destroy___p0:qX,_emscripten_bind_b2EdgeShape__Clone_p1:n$,_emscripten_bind_b2Body__GetUserData_p0:nw,_emscripten_bind_b2Body__SetUserData_p1:nA,_emscripten_bind_b2FixtureDef__set_friction_p1:qF,_emscripten_bind_b2PrismaticJointDef__get_bodyA_p1:rh,_emscripten_bind_b2FrictionJoint__GetType_p0:oK,_emscripten_bind_b2DistanceJointDef____destroy___p0:ui,_emscripten_bind_b2FrictionJointDef__Initialize_p3:pA,_emscripten_bind_b2GearJoint__b2GearJoint_p1:kN,_emscripten_bind_b2Body__SetSleepingAllowed_p1:nJ,_emscripten_bind_b2Body__SetLinearVelocity_p1:nF,_emscripten_bind_b2Body__ApplyLinearImpulse_p2:oo,_emscripten_bind_b2PulleyJoint__b2PulleyJoint_p1:ig,_emscripten_bind_b2MouseJointDef__get_bodyB_p1:tz,_emscripten_bind_b2ContactManager__set_m_contactList_p1:gz,_emscripten_bind_b2MouseJoint__GetNext_p0:hy,_emscripten_bind_b2Transform__get_q_p0:sZ,_emscripten_bind_b2DistanceJointDef__get_collideConnected_p1:tX,_emscripten_bind_b2WeldJointDef__set_bodyB_p1:tn,_emscripten_bind_b2DistanceJoint__GetReactionForce_p1:hd,_emscripten_bind_b2FrictionJoint____destroy___p0:o6,_emscripten_bind_b2JointDef__set_collideConnected_p1:sU,_emscripten_bind_b2CircleShape__ComputeAABB_p3:ko,_emscripten_bind_b2QueryCallback__ReportFixture_p1:mK,_emscripten_bind_b2GearJoint__GetRatio_p0:kZ,_emscripten_bind_b2BlockAllocator__Allocate_p1:mP,_emscripten_bind_b2GearJointDef__get_joint1_p0:uv,_emscripten_bind_b2AABB__Contains_p1:s8,_emscripten_bind_b2FrictionJoint__GetNext_p0:oQ,_emscripten_bind_b2ContactEdge____destroy___p0:u2,_emscripten_bind_b2RevoluteJointDef__Initialize_p3:r3,_emscripten_bind_b2BodyDef__set_angle_p1:pW,_emscripten_bind_b2PrismaticJointDef__Initialize_p4:q9,_emscripten_bind_b2Body__GetContactList_p0:ot,_emscripten_bind_b2MouseJointDef__set_dampingRatio_p1:tA,_emscripten_bind_b2PulleyJointDef__get_ratio_p0:so,_emscripten_bind_b2GearJoint__GetReactionForce_p1:lu,_emscripten_bind_b2Body__GetWorldCenter_p0:om,_emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1:sd,_emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1:tM,_emscripten_bind_b2BodyDef__set_angularDamping_p1:pK,_emscripten_bind_b2MouseJointDef__set_collideConnected_p1:tJ,_emscripten_bind_b2Shape__ComputeAABB_p3:ob,_emscripten_bind_b2Joint__GetReactionTorque_p1:kI,_emscripten_bind_b2WheelJoint__GetType_p0:j1,_emscripten_bind_b2Vec3__op_add_p1:qh,_emscripten_bind_b2Filter__get_categoryBits_p0:pm,_emscripten_bind_b2Vec3__set_z_p1:qe,_emscripten_bind_b2CircleShape__GetChildCount_p0:kp,_emscripten_bind_b2Transform__set_p_p1:sW,_emscripten_bind_b2Fixture__GetNext_p0:g_,_emscripten_bind_b2World__SetWarmStarting_p1:iS,_emscripten_bind_b2Vec3__op_sub_p0:qk,_emscripten_bind_b2ContactManager__Collide_p0:g6,_emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0:rY,_emscripten_bind_b2ContactManager__get_m_contactListener_p0:gA,_emscripten_bind_b2AABB__RayCast_p2:uc,_emscripten_bind_b2WeldJoint__Dump_p0:lJ,_emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1:q4,_emscripten_bind_b2EdgeShape__GetType_p0:nd,_emscripten_bind_b2BodyDef__get_gravityScale_p0:pN,_emscripten_bind_b2DistanceProxy__set_m_vertices_p1:qs,_emscripten_bind_b2RevoluteJoint__SetMaxMotorTorque_p1:lX,_emscripten_bind_b2MouseJointDef__get_bodyA_p1:ty,_emscripten_bind_b2PulleyJoint__GetLengthB_p0:ib,_emscripten_bind_b2WeldJointDef__set_referenceAngle_p1:to,_emscripten_bind_b2BlockAllocator__Free_p2:mY,_emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0:re,_emscripten_bind_b2GearJoint__SetRatio_p1:lM,_emscripten_bind_b2BodyDef__get_angle_p0:pX,_emscripten_bind_b2PrismaticJoint__GetReferenceAngle_p0:ja,_emscripten_bind_b2WeldJointDef__set_bodyA_p1:tm,_emscripten_bind_b2DynamicTree__GetHeight_p0:k_,stackAlloc:bR,stackSave:bS,stackRestore:bT,setThrew:bU,setTempRet0:bV,setTempRet1:bW,setTempRet2:bX,setTempRet3:bY,setTempRet4:bZ,setTempRet5:b_,setTempRet6:b$,setTempRet7:b0,setTempRet8:b1,setTempRet9:b2,dynCall_viiiii:vt,dynCall_vif:vO,dynCall_viifii:v7,dynCall_vi:ws,dynCall_vii:wN,dynCall_ii:w6,dynCall_viifi:xr,dynCall_if:xM,dynCall_iiiii:x5,dynCall_viffif:yq,dynCall_iiii:yL,dynCall_fif:y4,dynCall_viff:zp,dynCall_viiiiiiif:zK,dynCall_vifff:z3,dynCall_viiiiii:Ao,dynCall_iiif:AJ,dynCall_iif:A2,dynCall_vifii:Bn,dynCall_fi:BI,dynCall_iii:B1,dynCall_fiiiif:Cm,dynCall_i:CH,dynCall_iiiiii:C0,dynCall_ifff:Dl,dynCall_iff:DG,dynCall_viii:D$,dynCall_v:Ek,dynCall_viif:EF,dynCall_viiii:E_}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "copyTempDouble": copyTempDouble, "copyTempFloat": copyTempFloat, "min": Math_min, "jsCall": jsCall, "invoke_viiiii": invoke_viiiii, "invoke_vif": invoke_vif, "invoke_viifii": invoke_viifii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_ii": invoke_ii, "invoke_viifi": invoke_viifi, "invoke_if": invoke_if, "invoke_iiiii": invoke_iiiii, "invoke_viffif": invoke_viffif, "invoke_iiii": invoke_iiii, "invoke_fif": invoke_fif, "invoke_viff": invoke_viff, "invoke_viiiiiiif": invoke_viiiiiiif, "invoke_vifff": invoke_vifff, "invoke_viiiiii": invoke_viiiiii, "invoke_iiif": invoke_iiif, "invoke_iif": invoke_iif, "invoke_vifii": invoke_vifii, "invoke_fi": invoke_fi, "invoke_iii": invoke_iii, "invoke_fiiiif": invoke_fiiiif, "invoke_i": invoke_i, "invoke_iiiiii": invoke_iiiiii, "invoke_ifff": invoke_ifff, "invoke_iff": invoke_iff, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_viif": invoke_viif, "invoke_viiii": invoke_viiii, "_llvm_va_end": _llvm_va_end, "_cosf": _cosf, "_floorf": _floorf, "___cxa_throw": ___cxa_throw, "_abort": _abort, "_fprintf": _fprintf, "_llvm_eh_exception": _llvm_eh_exception, "_printf": _printf, "_sqrtf": _sqrtf, "__ZNK12b2WheelJoint13GetDefinitionEP15b2WheelJointDef": __ZNK12b2WheelJoint13GetDefinitionEP15b2WheelJointDef, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "_send": _send, "_write": _write, "_exit": _exit, "_llvm_lifetime_end": _llvm_lifetime_end, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "_atan2f": _atan2f, "_sysconf": _sysconf, "___cxa_pure_virtual": ___cxa_pure_virtual, "_vprintf": _vprintf, "___cxa_is_number_type": ___cxa_is_number_type, "__reallyNegative": __reallyNegative, "___resumeException": ___resumeException, "__formatString": __formatString, "___cxa_does_inherit": ___cxa_does_inherit, "__ZSt9terminatev": __ZSt9terminatev, "_sinf": _sinf, "___assert_func": ___assert_func, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "_pwrite": _pwrite, "___cxa_call_unexpected": ___cxa_call_unexpected, "_sbrk": _sbrk, "___cxa_allocate_exception": ___cxa_allocate_exception, "___errno_location": ___errno_location, "___gxx_personality_v0": ___gxx_personality_v0, "_llvm_lifetime_start": _llvm_lifetime_start, "_time": _time, "__exit": __exit, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "__ZTVN10__cxxabiv120__si_class_type_infoE": __ZTVN10__cxxabiv120__si_class_type_infoE, "__ZTVN10__cxxabiv117__class_type_infoE": __ZTVN10__cxxabiv117__class_type_infoE }, buffer);
var _emscripten_bind_b2WheelJoint__GetSpringFrequencyHz_p0 = Module["_emscripten_bind_b2WheelJoint__GetSpringFrequencyHz_p0"] = asm["_emscripten_bind_b2WheelJoint__GetSpringFrequencyHz_p0"];
var _emscripten_bind_b2Fixture__SetRestitution_p1 = Module["_emscripten_bind_b2Fixture__SetRestitution_p1"] = asm["_emscripten_bind_b2Fixture__SetRestitution_p1"];
var _emscripten_bind_b2PolygonShape____destroy___p0 = Module["_emscripten_bind_b2PolygonShape____destroy___p0"] = asm["_emscripten_bind_b2PolygonShape____destroy___p0"];
var _emscripten_bind_b2RevoluteJoint__EnableLimit_p1 = Module["_emscripten_bind_b2RevoluteJoint__EnableLimit_p1"] = asm["_emscripten_bind_b2RevoluteJoint__EnableLimit_p1"];
var _emscripten_bind_b2DistanceProxy__get_m_vertices_p0 = Module["_emscripten_bind_b2DistanceProxy__get_m_vertices_p0"] = asm["_emscripten_bind_b2DistanceProxy__get_m_vertices_p0"];
var _emscripten_bind_b2PrismaticJoint__EnableLimit_p1 = Module["_emscripten_bind_b2PrismaticJoint__EnableLimit_p1"] = asm["_emscripten_bind_b2PrismaticJoint__EnableLimit_p1"];
var _emscripten_bind_b2WheelJointDef__Initialize_p4 = Module["_emscripten_bind_b2WheelJointDef__Initialize_p4"] = asm["_emscripten_bind_b2WheelJointDef__Initialize_p4"];
var _emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1"] = asm["_emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1"];
var _emscripten_bind_b2PrismaticJoint__GetMotorForce_p1 = Module["_emscripten_bind_b2PrismaticJoint__GetMotorForce_p1"] = asm["_emscripten_bind_b2PrismaticJoint__GetMotorForce_p1"];
var _emscripten_bind_b2Body__IsSleepingAllowed_p0 = Module["_emscripten_bind_b2Body__IsSleepingAllowed_p0"] = asm["_emscripten_bind_b2Body__IsSleepingAllowed_p0"];
var _emscripten_bind_b2Vec2__b2Vec2_p2 = Module["_emscripten_bind_b2Vec2__b2Vec2_p2"] = asm["_emscripten_bind_b2Vec2__b2Vec2_p2"];
var _emscripten_bind_b2RevoluteJoint__GetMaxMotorTorque_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetMaxMotorTorque_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetMaxMotorTorque_p0"];
var _emscripten_bind_b2WeldJoint__GetFrequency_p0 = Module["_emscripten_bind_b2WeldJoint__GetFrequency_p0"] = asm["_emscripten_bind_b2WeldJoint__GetFrequency_p0"];
var _emscripten_bind_b2MouseJoint__GetType_p0 = Module["_emscripten_bind_b2MouseJoint__GetType_p0"] = asm["_emscripten_bind_b2MouseJoint__GetType_p0"];
var _emscripten_bind_b2RayCastCallback__b2RayCastCallback_p0 = Module["_emscripten_bind_b2RayCastCallback__b2RayCastCallback_p0"] = asm["_emscripten_bind_b2RayCastCallback__b2RayCastCallback_p0"];
var _emscripten_bind_b2Body__GetLinearDamping_p0 = Module["_emscripten_bind_b2Body__GetLinearDamping_p0"] = asm["_emscripten_bind_b2Body__GetLinearDamping_p0"];
var _emscripten_bind_b2Vec2__b2Vec2_p0 = Module["_emscripten_bind_b2Vec2__b2Vec2_p0"] = asm["_emscripten_bind_b2Vec2__b2Vec2_p0"];
var _emscripten_bind_b2PrismaticJoint__GetType_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetType_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetType_p0"];
var _emscripten_bind_b2PrismaticJoint____destroy___p0 = Module["_emscripten_bind_b2PrismaticJoint____destroy___p0"] = asm["_emscripten_bind_b2PrismaticJoint____destroy___p0"];
var _emscripten_bind_b2WheelJointDef__set_frequencyHz_p1 = Module["_emscripten_bind_b2WheelJointDef__set_frequencyHz_p1"] = asm["_emscripten_bind_b2WheelJointDef__set_frequencyHz_p1"];
var _emscripten_bind_b2BlockAllocator____destroy___p0 = Module["_emscripten_bind_b2BlockAllocator____destroy___p0"] = asm["_emscripten_bind_b2BlockAllocator____destroy___p0"];
var _emscripten_bind_b2Vec2__op_add_p1 = Module["_emscripten_bind_b2Vec2__op_add_p1"] = asm["_emscripten_bind_b2Vec2__op_add_p1"];
var _emscripten_bind_b2World__GetJointList_p0 = Module["_emscripten_bind_b2World__GetJointList_p0"] = asm["_emscripten_bind_b2World__GetJointList_p0"];
var _emscripten_bind_b2Transform__Set_p2 = Module["_emscripten_bind_b2Transform__Set_p2"] = asm["_emscripten_bind_b2Transform__Set_p2"];
var _emscripten_bind_b2EdgeShape__RayCast_p4 = Module["_emscripten_bind_b2EdgeShape__RayCast_p4"] = asm["_emscripten_bind_b2EdgeShape__RayCast_p4"];
var _emscripten_bind_b2RevoluteJoint__GetLocalAnchorA_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetLocalAnchorA_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetLocalAnchorA_p0"];
var _emscripten_bind_b2DistanceJoint__GetDampingRatio_p0 = Module["_emscripten_bind_b2DistanceJoint__GetDampingRatio_p0"] = asm["_emscripten_bind_b2DistanceJoint__GetDampingRatio_p0"];
var _emscripten_bind_b2PulleyJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_bodyA_p1"] = asm["_emscripten_bind_b2PulleyJointDef__set_bodyA_p1"];
var _emscripten_bind_b2DynamicTree__Validate_p0 = Module["_emscripten_bind_b2DynamicTree__Validate_p0"] = asm["_emscripten_bind_b2DynamicTree__Validate_p0"];
var _emscripten_bind_b2DynamicTree__DestroyProxy_p1 = Module["_emscripten_bind_b2DynamicTree__DestroyProxy_p1"] = asm["_emscripten_bind_b2DynamicTree__DestroyProxy_p1"];
var _emscripten_bind_b2Joint__IsActive_p0 = Module["_emscripten_bind_b2Joint__IsActive_p0"] = asm["_emscripten_bind_b2Joint__IsActive_p0"];
var _emscripten_bind_b2PulleyJoint__GetNext_p0 = Module["_emscripten_bind_b2PulleyJoint__GetNext_p0"] = asm["_emscripten_bind_b2PulleyJoint__GetNext_p0"];
var _emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0"] = asm["_emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0"];
var _emscripten_bind_b2GearJoint__IsActive_p0 = Module["_emscripten_bind_b2GearJoint__IsActive_p0"] = asm["_emscripten_bind_b2GearJoint__IsActive_p0"];
var _emscripten_bind_b2EdgeShape__get_m_radius_p0 = Module["_emscripten_bind_b2EdgeShape__get_m_radius_p0"] = asm["_emscripten_bind_b2EdgeShape__get_m_radius_p0"];
var _emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0"] = asm["_emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0"];
var _emscripten_bind_b2RevoluteJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_bodyA_p1"] = asm["_emscripten_bind_b2RevoluteJointDef__set_bodyA_p1"];
var _emscripten_bind_b2World__GetJointCount_p0 = Module["_emscripten_bind_b2World__GetJointCount_p0"] = asm["_emscripten_bind_b2World__GetJointCount_p0"];
var _emscripten_bind_b2DynamicTree__CreateProxy_p2 = Module["_emscripten_bind_b2DynamicTree__CreateProxy_p2"] = asm["_emscripten_bind_b2DynamicTree__CreateProxy_p2"];
var _emscripten_bind_b2WheelJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2WheelJointDef__set_collideConnected_p1"] = asm["_emscripten_bind_b2WheelJointDef__set_collideConnected_p1"];
var _emscripten_bind_b2WeldJoint__GetLocalAnchorA_p0 = Module["_emscripten_bind_b2WeldJoint__GetLocalAnchorA_p0"] = asm["_emscripten_bind_b2WeldJoint__GetLocalAnchorA_p0"];
var _emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0"] = asm["_emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0"];
var _emscripten_bind_b2Body__GetGravityScale_p0 = Module["_emscripten_bind_b2Body__GetGravityScale_p0"] = asm["_emscripten_bind_b2Body__GetGravityScale_p0"];
var _emscripten_bind_b2Fixture__Dump_p1 = Module["_emscripten_bind_b2Fixture__Dump_p1"] = asm["_emscripten_bind_b2Fixture__Dump_p1"];
var _emscripten_bind_b2World__GetBodyList_p0 = Module["_emscripten_bind_b2World__GetBodyList_p0"] = asm["_emscripten_bind_b2World__GetBodyList_p0"];
var _emscripten_bind_b2PulleyJoint__IsActive_p0 = Module["_emscripten_bind_b2PulleyJoint__IsActive_p0"] = asm["_emscripten_bind_b2PulleyJoint__IsActive_p0"];
var _emscripten_bind_b2MouseJoint__SetUserData_p1 = Module["_emscripten_bind_b2MouseJoint__SetUserData_p1"] = asm["_emscripten_bind_b2MouseJoint__SetUserData_p1"];
var _emscripten_bind_b2World__GetContactList_p0 = Module["_emscripten_bind_b2World__GetContactList_p0"] = asm["_emscripten_bind_b2World__GetContactList_p0"];
var _emscripten_bind_b2PrismaticJoint__GetNext_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetNext_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetNext_p0"];
var _emscripten_bind_b2Vec2__Skew_p0 = Module["_emscripten_bind_b2Vec2__Skew_p0"] = asm["_emscripten_bind_b2Vec2__Skew_p0"];
var _emscripten_bind_b2BodyDef__get_linearVelocity_p0 = Module["_emscripten_bind_b2BodyDef__get_linearVelocity_p0"] = asm["_emscripten_bind_b2BodyDef__get_linearVelocity_p0"];
var _emscripten_bind_b2Body__GetPosition_p0 = Module["_emscripten_bind_b2Body__GetPosition_p0"] = asm["_emscripten_bind_b2Body__GetPosition_p0"];
var _emscripten_bind_b2WheelJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2WheelJoint__GetReactionForce_p1"] = asm["_emscripten_bind_b2WheelJoint__GetReactionForce_p1"];
var _emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1"] = asm["_emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1"];
var _emscripten_bind_b2PrismaticJoint__SetMaxMotorForce_p1 = Module["_emscripten_bind_b2PrismaticJoint__SetMaxMotorForce_p1"] = asm["_emscripten_bind_b2PrismaticJoint__SetMaxMotorForce_p1"];
var _emscripten_bind_b2ChainShape__b2ChainShape_p0 = Module["_emscripten_bind_b2ChainShape__b2ChainShape_p0"] = asm["_emscripten_bind_b2ChainShape__b2ChainShape_p0"];
var _emscripten_bind_b2CircleShape__RayCast_p4 = Module["_emscripten_bind_b2CircleShape__RayCast_p4"] = asm["_emscripten_bind_b2CircleShape__RayCast_p4"];
var _emscripten_bind_b2WheelJoint__GetBodyA_p0 = Module["_emscripten_bind_b2WheelJoint__GetBodyA_p0"] = asm["_emscripten_bind_b2WheelJoint__GetBodyA_p0"];
var _emscripten_bind_b2RevoluteJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_bodyB_p1"] = asm["_emscripten_bind_b2RevoluteJointDef__set_bodyB_p1"];
var _emscripten_bind_b2MouseJointDef__get_dampingRatio_p0 = Module["_emscripten_bind_b2MouseJointDef__get_dampingRatio_p0"] = asm["_emscripten_bind_b2MouseJointDef__get_dampingRatio_p0"];
var _emscripten_bind_b2JointDef__set_bodyB_p1 = Module["_emscripten_bind_b2JointDef__set_bodyB_p1"] = asm["_emscripten_bind_b2JointDef__set_bodyB_p1"];
var _emscripten_bind_b2RevoluteJoint__GetJointSpeed_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetJointSpeed_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetJointSpeed_p0"];
var _emscripten_bind_b2RopeJoint__GetLocalAnchorB_p0 = Module["_emscripten_bind_b2RopeJoint__GetLocalAnchorB_p0"] = asm["_emscripten_bind_b2RopeJoint__GetLocalAnchorB_p0"];
var _emscripten_bind_b2Fixture__GetAABB_p1 = Module["_emscripten_bind_b2Fixture__GetAABB_p1"] = asm["_emscripten_bind_b2Fixture__GetAABB_p1"];
var _emscripten_bind_b2BroadPhase__TouchProxy_p1 = Module["_emscripten_bind_b2BroadPhase__TouchProxy_p1"] = asm["_emscripten_bind_b2BroadPhase__TouchProxy_p1"];
var _emscripten_bind_b2FixtureDef__set_isSensor_p1 = Module["_emscripten_bind_b2FixtureDef__set_isSensor_p1"] = asm["_emscripten_bind_b2FixtureDef__set_isSensor_p1"];
var _emscripten_bind_b2World__GetAllowSleeping_p0 = Module["_emscripten_bind_b2World__GetAllowSleeping_p0"] = asm["_emscripten_bind_b2World__GetAllowSleeping_p0"];
var _emscripten_bind_b2DestructionListener____destroy___p0 = Module["_emscripten_bind_b2DestructionListener____destroy___p0"] = asm["_emscripten_bind_b2DestructionListener____destroy___p0"];
var _emscripten_bind_b2BroadPhase____destroy___p0 = Module["_emscripten_bind_b2BroadPhase____destroy___p0"] = asm["_emscripten_bind_b2BroadPhase____destroy___p0"];
var _emscripten_bind_b2World__GetWarmStarting_p0 = Module["_emscripten_bind_b2World__GetWarmStarting_p0"] = asm["_emscripten_bind_b2World__GetWarmStarting_p0"];
var _emscripten_bind_b2Rot__b2Rot_p1 = Module["_emscripten_bind_b2Rot__b2Rot_p1"] = asm["_emscripten_bind_b2Rot__b2Rot_p1"];
var _emscripten_bind_b2Rot__b2Rot_p0 = Module["_emscripten_bind_b2Rot__b2Rot_p0"] = asm["_emscripten_bind_b2Rot__b2Rot_p0"];
var _emscripten_bind_b2DistanceJoint__GetUserData_p0 = Module["_emscripten_bind_b2DistanceJoint__GetUserData_p0"] = asm["_emscripten_bind_b2DistanceJoint__GetUserData_p0"];
var _emscripten_bind_b2MouseJointDef__get_frequencyHz_p0 = Module["_emscripten_bind_b2MouseJointDef__get_frequencyHz_p0"] = asm["_emscripten_bind_b2MouseJointDef__get_frequencyHz_p0"];
var _emscripten_bind_b2ContactManager__set_m_allocator_p1 = Module["_emscripten_bind_b2ContactManager__set_m_allocator_p1"] = asm["_emscripten_bind_b2ContactManager__set_m_allocator_p1"];
var _emscripten_bind_b2WheelJoint__SetMaxMotorTorque_p1 = Module["_emscripten_bind_b2WheelJoint__SetMaxMotorTorque_p1"] = asm["_emscripten_bind_b2WheelJoint__SetMaxMotorTorque_p1"];
var _emscripten_bind_b2RopeJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2RopeJointDef__get_collideConnected_p1"] = asm["_emscripten_bind_b2RopeJointDef__get_collideConnected_p1"];
var _emscripten_bind_b2MouseJointDef__get_target_p0 = Module["_emscripten_bind_b2MouseJointDef__get_target_p0"] = asm["_emscripten_bind_b2MouseJointDef__get_target_p0"];
var _emscripten_bind_b2WeldJoint__SetUserData_p1 = Module["_emscripten_bind_b2WeldJoint__SetUserData_p1"] = asm["_emscripten_bind_b2WeldJoint__SetUserData_p1"];
var _emscripten_bind_b2PrismaticJoint__GetBodyA_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetBodyA_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetBodyA_p0"];
var _emscripten_bind_b2FrictionJointDef____destroy___p0 = Module["_emscripten_bind_b2FrictionJointDef____destroy___p0"] = asm["_emscripten_bind_b2FrictionJointDef____destroy___p0"];
var _emscripten_bind_b2RopeJoint__GetMaxLength_p0 = Module["_emscripten_bind_b2RopeJoint__GetMaxLength_p0"] = asm["_emscripten_bind_b2RopeJoint__GetMaxLength_p0"];
var _emscripten_bind_b2MouseJoint__GetDampingRatio_p0 = Module["_emscripten_bind_b2MouseJoint__GetDampingRatio_p0"] = asm["_emscripten_bind_b2MouseJoint__GetDampingRatio_p0"];
var _emscripten_bind_b2DistanceJoint__GetNext_p0 = Module["_emscripten_bind_b2DistanceJoint__GetNext_p0"] = asm["_emscripten_bind_b2DistanceJoint__GetNext_p0"];
var _emscripten_bind_b2Filter__get_maskBits_p0 = Module["_emscripten_bind_b2Filter__get_maskBits_p0"] = asm["_emscripten_bind_b2Filter__get_maskBits_p0"];
var _emscripten_bind_b2RayCastCallback____destroy___p0 = Module["_emscripten_bind_b2RayCastCallback____destroy___p0"] = asm["_emscripten_bind_b2RayCastCallback____destroy___p0"];
var _emscripten_bind_b2World__Dump_p0 = Module["_emscripten_bind_b2World__Dump_p0"] = asm["_emscripten_bind_b2World__Dump_p0"];
var _emscripten_bind_b2RevoluteJointDef____destroy___p0 = Module["_emscripten_bind_b2RevoluteJointDef____destroy___p0"] = asm["_emscripten_bind_b2RevoluteJointDef____destroy___p0"];
var _emscripten_bind_b2PrismaticJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetAnchorA_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetAnchorA_p0"];
var _emscripten_bind_b2BodyDef__get_bullet_p0 = Module["_emscripten_bind_b2BodyDef__get_bullet_p0"] = asm["_emscripten_bind_b2BodyDef__get_bullet_p0"];
var _emscripten_bind_b2Body__SetAngularDamping_p1 = Module["_emscripten_bind_b2Body__SetAngularDamping_p1"] = asm["_emscripten_bind_b2Body__SetAngularDamping_p1"];
var _emscripten_bind_b2DynamicTree__RebuildBottomUp_p0 = Module["_emscripten_bind_b2DynamicTree__RebuildBottomUp_p0"] = asm["_emscripten_bind_b2DynamicTree__RebuildBottomUp_p0"];
var _emscripten_bind_b2Fixture__GetFilterData_p0 = Module["_emscripten_bind_b2Fixture__GetFilterData_p0"] = asm["_emscripten_bind_b2Fixture__GetFilterData_p0"];
var _emscripten_bind_b2DistanceJoint__SetLength_p1 = Module["_emscripten_bind_b2DistanceJoint__SetLength_p1"] = asm["_emscripten_bind_b2DistanceJoint__SetLength_p1"];
var _emscripten_bind_b2BodyDef__get_position_p0 = Module["_emscripten_bind_b2BodyDef__get_position_p0"] = asm["_emscripten_bind_b2BodyDef__get_position_p0"];
var _emscripten_bind_b2FrictionJoint__GetUserData_p0 = Module["_emscripten_bind_b2FrictionJoint__GetUserData_p0"] = asm["_emscripten_bind_b2FrictionJoint__GetUserData_p0"];
var _emscripten_bind_b2PolygonShape__get_m_radius_p0 = Module["_emscripten_bind_b2PolygonShape__get_m_radius_p0"] = asm["_emscripten_bind_b2PolygonShape__get_m_radius_p0"];
var _emscripten_bind_b2ContactEdge__set_next_p1 = Module["_emscripten_bind_b2ContactEdge__set_next_p1"] = asm["_emscripten_bind_b2ContactEdge__set_next_p1"];
var _emscripten_bind_b2Transform__b2Transform_p2 = Module["_emscripten_bind_b2Transform__b2Transform_p2"] = asm["_emscripten_bind_b2Transform__b2Transform_p2"];
var _emscripten_bind_b2FrictionJointDef__get_maxTorque_p0 = Module["_emscripten_bind_b2FrictionJointDef__get_maxTorque_p0"] = asm["_emscripten_bind_b2FrictionJointDef__get_maxTorque_p0"];
var _emscripten_bind_b2WeldJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2WeldJointDef__set_localAnchorB_p1"] = asm["_emscripten_bind_b2WeldJointDef__set_localAnchorB_p1"];
var _emscripten_bind_b2World__GetProxyCount_p0 = Module["_emscripten_bind_b2World__GetProxyCount_p0"] = asm["_emscripten_bind_b2World__GetProxyCount_p0"];
var _emscripten_bind_b2WeldJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2WeldJointDef__get_bodyB_p1"] = asm["_emscripten_bind_b2WeldJointDef__get_bodyB_p1"];
var _emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1"] = asm["_emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1"];
var _emscripten_bind_b2PolygonShape__set_m_centroid_p1 = Module["_emscripten_bind_b2PolygonShape__set_m_centroid_p1"] = asm["_emscripten_bind_b2PolygonShape__set_m_centroid_p1"];
var _emscripten_bind_b2GearJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2GearJoint__GetAnchorA_p0"] = asm["_emscripten_bind_b2GearJoint__GetAnchorA_p0"];
var _emscripten_bind_b2PulleyJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2PulleyJointDef__get_collideConnected_p1"] = asm["_emscripten_bind_b2PulleyJointDef__get_collideConnected_p1"];
var _emscripten_bind_b2Vec3____destroy___p0 = Module["_emscripten_bind_b2Vec3____destroy___p0"] = asm["_emscripten_bind_b2Vec3____destroy___p0"];
var _emscripten_bind_b2Color__set_r_p1 = Module["_emscripten_bind_b2Color__set_r_p1"] = asm["_emscripten_bind_b2Color__set_r_p1"];
var _emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0"] = asm["_emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0"];
var _emscripten_bind_b2BodyDef__get_linearDamping_p0 = Module["_emscripten_bind_b2BodyDef__get_linearDamping_p0"] = asm["_emscripten_bind_b2BodyDef__get_linearDamping_p0"];
var _emscripten_bind_b2EdgeShape__ComputeMass_p2 = Module["_emscripten_bind_b2EdgeShape__ComputeMass_p2"] = asm["_emscripten_bind_b2EdgeShape__ComputeMass_p2"];
var _emscripten_bind_b2RayCastCallback__ReportFixture_p4 = Module["_emscripten_bind_b2RayCastCallback__ReportFixture_p4"] = asm["_emscripten_bind_b2RayCastCallback__ReportFixture_p4"];
var _emscripten_bind_b2Body__Dump_p0 = Module["_emscripten_bind_b2Body__Dump_p0"] = asm["_emscripten_bind_b2Body__Dump_p0"];
var _emscripten_bind_b2BodyDef__get_allowSleep_p0 = Module["_emscripten_bind_b2BodyDef__get_allowSleep_p0"] = asm["_emscripten_bind_b2BodyDef__get_allowSleep_p0"];
var _emscripten_bind_b2AABB__get_lowerBound_p0 = Module["_emscripten_bind_b2AABB__get_lowerBound_p0"] = asm["_emscripten_bind_b2AABB__get_lowerBound_p0"];
var _emscripten_bind_b2PulleyJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2PulleyJoint__GetAnchorB_p0"] = asm["_emscripten_bind_b2PulleyJoint__GetAnchorB_p0"];
var _emscripten_bind_b2PrismaticJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2PrismaticJoint__GetReactionTorque_p1"] = asm["_emscripten_bind_b2PrismaticJoint__GetReactionTorque_p1"];
var _emscripten_bind_b2JointDef__set_bodyA_p1 = Module["_emscripten_bind_b2JointDef__set_bodyA_p1"] = asm["_emscripten_bind_b2JointDef__set_bodyA_p1"];
var _emscripten_bind_b2PrismaticJoint__GetBodyB_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetBodyB_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetBodyB_p0"];
var _emscripten_bind_b2DistanceJoint__GetLocalAnchorA_p0 = Module["_emscripten_bind_b2DistanceJoint__GetLocalAnchorA_p0"] = asm["_emscripten_bind_b2DistanceJoint__GetLocalAnchorA_p0"];
var _emscripten_bind_b2RopeJoint__GetLocalAnchorA_p0 = Module["_emscripten_bind_b2RopeJoint__GetLocalAnchorA_p0"] = asm["_emscripten_bind_b2RopeJoint__GetLocalAnchorA_p0"];
var _emscripten_bind_b2Rot__set_c_p1 = Module["_emscripten_bind_b2Rot__set_c_p1"] = asm["_emscripten_bind_b2Rot__set_c_p1"];
var _emscripten_bind_b2Vec3__op_mul_p1 = Module["_emscripten_bind_b2Vec3__op_mul_p1"] = asm["_emscripten_bind_b2Vec3__op_mul_p1"];
var _emscripten_bind_b2StackAllocator__GetMaxAllocation_p0 = Module["_emscripten_bind_b2StackAllocator__GetMaxAllocation_p0"] = asm["_emscripten_bind_b2StackAllocator__GetMaxAllocation_p0"];
var _emscripten_bind_b2MouseJoint__SetFrequency_p1 = Module["_emscripten_bind_b2MouseJoint__SetFrequency_p1"] = asm["_emscripten_bind_b2MouseJoint__SetFrequency_p1"];
var _emscripten_bind_b2WeldJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2WeldJoint__GetAnchorA_p0"] = asm["_emscripten_bind_b2WeldJoint__GetAnchorA_p0"];
var _emscripten_bind_b2World__SetAutoClearForces_p1 = Module["_emscripten_bind_b2World__SetAutoClearForces_p1"] = asm["_emscripten_bind_b2World__SetAutoClearForces_p1"];
var _emscripten_bind_b2Contact__SetEnabled_p1 = Module["_emscripten_bind_b2Contact__SetEnabled_p1"] = asm["_emscripten_bind_b2Contact__SetEnabled_p1"];
var _emscripten_bind_b2ContactManager__get_m_contactFilter_p0 = Module["_emscripten_bind_b2ContactManager__get_m_contactFilter_p0"] = asm["_emscripten_bind_b2ContactManager__get_m_contactFilter_p0"];
var _emscripten_bind_b2BodyDef__get_angularDamping_p0 = Module["_emscripten_bind_b2BodyDef__get_angularDamping_p0"] = asm["_emscripten_bind_b2BodyDef__get_angularDamping_p0"];
var _emscripten_bind_b2WeldJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2WeldJointDef__set_localAnchorA_p1"] = asm["_emscripten_bind_b2WeldJointDef__set_localAnchorA_p1"];
var _emscripten_bind_b2DistanceJoint__GetBodyB_p0 = Module["_emscripten_bind_b2DistanceJoint__GetBodyB_p0"] = asm["_emscripten_bind_b2DistanceJoint__GetBodyB_p0"];
var _emscripten_bind_b2PulleyJointDef__set_lengthB_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_lengthB_p1"] = asm["_emscripten_bind_b2PulleyJointDef__set_lengthB_p1"];
var _emscripten_bind_b2Vec2__op_sub_p0 = Module["_emscripten_bind_b2Vec2__op_sub_p0"] = asm["_emscripten_bind_b2Vec2__op_sub_p0"];
var _emscripten_bind_b2PrismaticJoint__GetLocalAnchorB_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetLocalAnchorB_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetLocalAnchorB_p0"];
var _emscripten_bind_b2RopeJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2RopeJointDef__get_localAnchorB_p0"] = asm["_emscripten_bind_b2RopeJointDef__get_localAnchorB_p0"];
var _emscripten_bind_b2Contact__GetChildIndexB_p0 = Module["_emscripten_bind_b2Contact__GetChildIndexB_p0"] = asm["_emscripten_bind_b2Contact__GetChildIndexB_p0"];
var _emscripten_bind_b2Fixture__TestPoint_p1 = Module["_emscripten_bind_b2Fixture__TestPoint_p1"] = asm["_emscripten_bind_b2Fixture__TestPoint_p1"];
var _emscripten_bind_b2FixtureDef__get_shape_p0 = Module["_emscripten_bind_b2FixtureDef__get_shape_p0"] = asm["_emscripten_bind_b2FixtureDef__get_shape_p0"];
var _emscripten_bind_b2WheelJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2WheelJointDef__get_bodyB_p1"] = asm["_emscripten_bind_b2WheelJointDef__get_bodyB_p1"];
var _emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0"] = asm["_emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0"];
var _emscripten_bind_b2BodyDef__set_linearVelocity_p1 = Module["_emscripten_bind_b2BodyDef__set_linearVelocity_p1"] = asm["_emscripten_bind_b2BodyDef__set_linearVelocity_p1"];
var _emscripten_bind_b2Body__GetMass_p0 = Module["_emscripten_bind_b2Body__GetMass_p0"] = asm["_emscripten_bind_b2Body__GetMass_p0"];
var _emscripten_bind_b2WeldJoint____destroy___p0 = Module["_emscripten_bind_b2WeldJoint____destroy___p0"] = asm["_emscripten_bind_b2WeldJoint____destroy___p0"];
var _emscripten_bind_b2WheelJoint__GetSpringDampingRatio_p0 = Module["_emscripten_bind_b2WheelJoint__GetSpringDampingRatio_p0"] = asm["_emscripten_bind_b2WheelJoint__GetSpringDampingRatio_p0"];
var _emscripten_bind_b2RopeJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2RopeJointDef__set_localAnchorB_p1"] = asm["_emscripten_bind_b2RopeJointDef__set_localAnchorB_p1"];
var _emscripten_bind_b2Body__IsFixedRotation_p0 = Module["_emscripten_bind_b2Body__IsFixedRotation_p0"] = asm["_emscripten_bind_b2Body__IsFixedRotation_p0"];
var _emscripten_bind_b2Rot__SetIdentity_p0 = Module["_emscripten_bind_b2Rot__SetIdentity_p0"] = asm["_emscripten_bind_b2Rot__SetIdentity_p0"];
var _emscripten_bind_b2WheelJoint__SetSpringDampingRatio_p1 = Module["_emscripten_bind_b2WheelJoint__SetSpringDampingRatio_p1"] = asm["_emscripten_bind_b2WheelJoint__SetSpringDampingRatio_p1"];
var _emscripten_bind_b2Joint__SetUserData_p1 = Module["_emscripten_bind_b2Joint__SetUserData_p1"] = asm["_emscripten_bind_b2Joint__SetUserData_p1"];
var _emscripten_bind_b2FrictionJoint__IsActive_p0 = Module["_emscripten_bind_b2FrictionJoint__IsActive_p0"] = asm["_emscripten_bind_b2FrictionJoint__IsActive_p0"];
var _emscripten_bind_b2JointDef__get_userData_p0 = Module["_emscripten_bind_b2JointDef__get_userData_p0"] = asm["_emscripten_bind_b2JointDef__get_userData_p0"];
var _emscripten_bind_b2Draw__DrawPolygon_p3 = Module["_emscripten_bind_b2Draw__DrawPolygon_p3"] = asm["_emscripten_bind_b2Draw__DrawPolygon_p3"];
var _emscripten_bind_b2MouseJoint__GetBodyB_p0 = Module["_emscripten_bind_b2MouseJoint__GetBodyB_p0"] = asm["_emscripten_bind_b2MouseJoint__GetBodyB_p0"];
var _emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0 = Module["_emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0"] = asm["_emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0"];
var _emscripten_bind_b2ContactManager__get_m_broadPhase_p0 = Module["_emscripten_bind_b2ContactManager__get_m_broadPhase_p0"] = asm["_emscripten_bind_b2ContactManager__get_m_broadPhase_p0"];
var _emscripten_bind_b2RopeJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2RopeJoint__GetReactionTorque_p1"] = asm["_emscripten_bind_b2RopeJoint__GetReactionTorque_p1"];
var _emscripten_bind_b2PrismaticJoint__GetLowerLimit_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetLowerLimit_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetLowerLimit_p0"];
var _emscripten_bind_b2Contact__GetManifold_p0 = Module["_emscripten_bind_b2Contact__GetManifold_p0"] = asm["_emscripten_bind_b2Contact__GetManifold_p0"];
var _emscripten_bind_b2Contact__SetFriction_p1 = Module["_emscripten_bind_b2Contact__SetFriction_p1"] = asm["_emscripten_bind_b2Contact__SetFriction_p1"];
var _emscripten_bind_b2WheelJoint__GetJointSpeed_p0 = Module["_emscripten_bind_b2WheelJoint__GetJointSpeed_p0"] = asm["_emscripten_bind_b2WheelJoint__GetJointSpeed_p0"];
var _emscripten_bind_b2BodyDef__set_allowSleep_p1 = Module["_emscripten_bind_b2BodyDef__set_allowSleep_p1"] = asm["_emscripten_bind_b2BodyDef__set_allowSleep_p1"];
var _emscripten_bind_b2Fixture__RayCast_p3 = Module["_emscripten_bind_b2Fixture__RayCast_p3"] = asm["_emscripten_bind_b2Fixture__RayCast_p3"];
var _emscripten_bind_b2WeldJointDef__get_referenceAngle_p0 = Module["_emscripten_bind_b2WeldJointDef__get_referenceAngle_p0"] = asm["_emscripten_bind_b2WeldJointDef__get_referenceAngle_p0"];
var _emscripten_bind_b2Fixture____destroy___p0 = Module["_emscripten_bind_b2Fixture____destroy___p0"] = asm["_emscripten_bind_b2Fixture____destroy___p0"];
var _emscripten_bind_b2RopeJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2RopeJointDef__set_localAnchorA_p1"] = asm["_emscripten_bind_b2RopeJointDef__set_localAnchorA_p1"];
var _emscripten_bind_b2WheelJoint__SetUserData_p1 = Module["_emscripten_bind_b2WheelJoint__SetUserData_p1"] = asm["_emscripten_bind_b2WheelJoint__SetUserData_p1"];
var _emscripten_bind_b2WeldJoint__b2WeldJoint_p1 = Module["_emscripten_bind_b2WeldJoint__b2WeldJoint_p1"] = asm["_emscripten_bind_b2WeldJoint__b2WeldJoint_p1"];
var _emscripten_bind_b2WeldJoint__IsActive_p0 = Module["_emscripten_bind_b2WeldJoint__IsActive_p0"] = asm["_emscripten_bind_b2WeldJoint__IsActive_p0"];
var _emscripten_bind_b2Draw__DrawSolidPolygon_p3 = Module["_emscripten_bind_b2Draw__DrawSolidPolygon_p3"] = asm["_emscripten_bind_b2Draw__DrawSolidPolygon_p3"];
var _emscripten_bind_b2ContactManager____destroy___p0 = Module["_emscripten_bind_b2ContactManager____destroy___p0"] = asm["_emscripten_bind_b2ContactManager____destroy___p0"];
var _emscripten_bind_b2GearJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2GearJoint__GetAnchorB_p0"] = asm["_emscripten_bind_b2GearJoint__GetAnchorB_p0"];
var _emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0"] = asm["_emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0"];
var _emscripten_bind_b2PolygonShape__get_m_vertexCount_p0 = Module["_emscripten_bind_b2PolygonShape__get_m_vertexCount_p0"] = asm["_emscripten_bind_b2PolygonShape__get_m_vertexCount_p0"];
var _emscripten_bind_b2RevoluteJoint__GetReferenceAngle_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetReferenceAngle_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetReferenceAngle_p0"];
var _emscripten_bind_b2DistanceJointDef__Initialize_p4 = Module["_emscripten_bind_b2DistanceJointDef__Initialize_p4"] = asm["_emscripten_bind_b2DistanceJointDef__Initialize_p4"];
var _emscripten_bind_b2World__IsLocked_p0 = Module["_emscripten_bind_b2World__IsLocked_p0"] = asm["_emscripten_bind_b2World__IsLocked_p0"];
var _emscripten_bind_b2ContactEdge__get_prev_p0 = Module["_emscripten_bind_b2ContactEdge__get_prev_p0"] = asm["_emscripten_bind_b2ContactEdge__get_prev_p0"];
var _emscripten_bind_b2Joint__GetReactionForce_p1 = Module["_emscripten_bind_b2Joint__GetReactionForce_p1"] = asm["_emscripten_bind_b2Joint__GetReactionForce_p1"];
var _emscripten_bind_b2WeldJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2WeldJointDef__get_collideConnected_p1"] = asm["_emscripten_bind_b2WeldJointDef__get_collideConnected_p1"];
var _emscripten_bind_b2Draw__AppendFlags_p1 = Module["_emscripten_bind_b2Draw__AppendFlags_p1"] = asm["_emscripten_bind_b2Draw__AppendFlags_p1"];
var _emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0"] = asm["_emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0"];
var _emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1"] = asm["_emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1"];
var _emscripten_bind_b2PrismaticJoint__EnableMotor_p1 = Module["_emscripten_bind_b2PrismaticJoint__EnableMotor_p1"] = asm["_emscripten_bind_b2PrismaticJoint__EnableMotor_p1"];
var _emscripten_bind_b2PrismaticJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2PrismaticJoint__GetReactionForce_p1"] = asm["_emscripten_bind_b2PrismaticJoint__GetReactionForce_p1"];
var _emscripten_bind_b2Shape__RayCast_p4 = Module["_emscripten_bind_b2Shape__RayCast_p4"] = asm["_emscripten_bind_b2Shape__RayCast_p4"];
var _emscripten_bind_b2GearJoint__Dump_p0 = Module["_emscripten_bind_b2GearJoint__Dump_p0"] = asm["_emscripten_bind_b2GearJoint__Dump_p0"];
var _emscripten_bind_b2Body__DestroyFixture_p1 = Module["_emscripten_bind_b2Body__DestroyFixture_p1"] = asm["_emscripten_bind_b2Body__DestroyFixture_p1"];
var _emscripten_bind_b2Body__SetActive_p1 = Module["_emscripten_bind_b2Body__SetActive_p1"] = asm["_emscripten_bind_b2Body__SetActive_p1"];
var _emscripten_bind_b2PrismaticJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetCollideConnected_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetCollideConnected_p0"];
var _emscripten_bind_b2ContactListener____destroy___p0 = Module["_emscripten_bind_b2ContactListener____destroy___p0"] = asm["_emscripten_bind_b2ContactListener____destroy___p0"];
var _emscripten_bind_b2MouseJoint__SetDampingRatio_p1 = Module["_emscripten_bind_b2MouseJoint__SetDampingRatio_p1"] = asm["_emscripten_bind_b2MouseJoint__SetDampingRatio_p1"];
var _emscripten_bind_b2Body__ApplyTorque_p1 = Module["_emscripten_bind_b2Body__ApplyTorque_p1"] = asm["_emscripten_bind_b2Body__ApplyTorque_p1"];
var _emscripten_bind_b2DistanceProxy__GetVertexCount_p0 = Module["_emscripten_bind_b2DistanceProxy__GetVertexCount_p0"] = asm["_emscripten_bind_b2DistanceProxy__GetVertexCount_p0"];
var _emscripten_bind_b2PulleyJoint__GetRatio_p0 = Module["_emscripten_bind_b2PulleyJoint__GetRatio_p0"] = asm["_emscripten_bind_b2PulleyJoint__GetRatio_p0"];
var _emscripten_bind_b2FixtureDef__set_density_p1 = Module["_emscripten_bind_b2FixtureDef__set_density_p1"] = asm["_emscripten_bind_b2FixtureDef__set_density_p1"];
var _emscripten_bind_b2RopeJoint__b2RopeJoint_p1 = Module["_emscripten_bind_b2RopeJoint__b2RopeJoint_p1"] = asm["_emscripten_bind_b2RopeJoint__b2RopeJoint_p1"];
var _emscripten_bind_b2FixtureDef__get_filter_p0 = Module["_emscripten_bind_b2FixtureDef__get_filter_p0"] = asm["_emscripten_bind_b2FixtureDef__get_filter_p0"];
var _emscripten_bind_b2WheelJoint__GetUserData_p0 = Module["_emscripten_bind_b2WheelJoint__GetUserData_p0"] = asm["_emscripten_bind_b2WheelJoint__GetUserData_p0"];
var _emscripten_bind_b2GearJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2GearJointDef__set_collideConnected_p1"] = asm["_emscripten_bind_b2GearJointDef__set_collideConnected_p1"];
var _emscripten_bind_b2GearJoint____destroy___p0 = Module["_emscripten_bind_b2GearJoint____destroy___p0"] = asm["_emscripten_bind_b2GearJoint____destroy___p0"];
var _emscripten_bind_b2Body__GetAngularVelocity_p0 = Module["_emscripten_bind_b2Body__GetAngularVelocity_p0"] = asm["_emscripten_bind_b2Body__GetAngularVelocity_p0"];
var _emscripten_bind_b2DistanceJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2DistanceJointDef__get_bodyA_p1"] = asm["_emscripten_bind_b2DistanceJointDef__get_bodyA_p1"];
var _emscripten_bind_b2RevoluteJoint__EnableMotor_p1 = Module["_emscripten_bind_b2RevoluteJoint__EnableMotor_p1"] = asm["_emscripten_bind_b2RevoluteJoint__EnableMotor_p1"];
var _emscripten_bind_b2Body__SetType_p1 = Module["_emscripten_bind_b2Body__SetType_p1"] = asm["_emscripten_bind_b2Body__SetType_p1"];
var _emscripten_bind_b2PolygonShape__set_m_vertexCount_p1 = Module["_emscripten_bind_b2PolygonShape__set_m_vertexCount_p1"] = asm["_emscripten_bind_b2PolygonShape__set_m_vertexCount_p1"];
var _emscripten_bind_b2RopeJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2RopeJointDef__set_collideConnected_p1"] = asm["_emscripten_bind_b2RopeJointDef__set_collideConnected_p1"];
var _emscripten_bind_b2FrictionJoint__GetBodyB_p0 = Module["_emscripten_bind_b2FrictionJoint__GetBodyB_p0"] = asm["_emscripten_bind_b2FrictionJoint__GetBodyB_p0"];
var _emscripten_bind_b2RevoluteJoint__IsLimitEnabled_p0 = Module["_emscripten_bind_b2RevoluteJoint__IsLimitEnabled_p0"] = asm["_emscripten_bind_b2RevoluteJoint__IsLimitEnabled_p0"];
var _emscripten_bind_b2FrictionJointDef__set_maxForce_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_maxForce_p1"] = asm["_emscripten_bind_b2FrictionJointDef__set_maxForce_p1"];
var _emscripten_bind_b2Timer__GetMilliseconds_p0 = Module["_emscripten_bind_b2Timer__GetMilliseconds_p0"] = asm["_emscripten_bind_b2Timer__GetMilliseconds_p0"];
var _emscripten_bind_b2WheelJointDef__get_enableMotor_p0 = Module["_emscripten_bind_b2WheelJointDef__get_enableMotor_p0"] = asm["_emscripten_bind_b2WheelJointDef__get_enableMotor_p0"];
var _emscripten_bind_b2RevoluteJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2RevoluteJointDef__get_bodyB_p1"] = asm["_emscripten_bind_b2RevoluteJointDef__get_bodyB_p1"];
var _emscripten_bind_b2PolygonShape__GetChildCount_p0 = Module["_emscripten_bind_b2PolygonShape__GetChildCount_p0"] = asm["_emscripten_bind_b2PolygonShape__GetChildCount_p0"];
var _emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0 = Module["_emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0"] = asm["_emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0"];
var _emscripten_bind_b2ContactEdge__set_other_p1 = Module["_emscripten_bind_b2ContactEdge__set_other_p1"] = asm["_emscripten_bind_b2ContactEdge__set_other_p1"];
var _emscripten_bind_b2Body__GetMassData_p1 = Module["_emscripten_bind_b2Body__GetMassData_p1"] = asm["_emscripten_bind_b2Body__GetMassData_p1"];
var _emscripten_bind_b2Joint__GetNext_p0 = Module["_emscripten_bind_b2Joint__GetNext_p0"] = asm["_emscripten_bind_b2Joint__GetNext_p0"];
var _emscripten_bind_b2WeldJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2WeldJoint__GetReactionForce_p1"] = asm["_emscripten_bind_b2WeldJoint__GetReactionForce_p1"];
var _emscripten_bind_b2RevoluteJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetAnchorA_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetAnchorA_p0"];
var _emscripten_bind_b2Filter__set_groupIndex_p1 = Module["_emscripten_bind_b2Filter__set_groupIndex_p1"] = asm["_emscripten_bind_b2Filter__set_groupIndex_p1"];
var _emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1"] = asm["_emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1"];
var _emscripten_bind_b2FrictionJoint__SetMaxForce_p1 = Module["_emscripten_bind_b2FrictionJoint__SetMaxForce_p1"] = asm["_emscripten_bind_b2FrictionJoint__SetMaxForce_p1"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _emscripten_bind_b2MouseJoint__b2MouseJoint_p1 = Module["_emscripten_bind_b2MouseJoint__b2MouseJoint_p1"] = asm["_emscripten_bind_b2MouseJoint__b2MouseJoint_p1"];
var _emscripten_bind_b2MouseJoint__Dump_p0 = Module["_emscripten_bind_b2MouseJoint__Dump_p0"] = asm["_emscripten_bind_b2MouseJoint__Dump_p0"];
var _emscripten_bind_b2FixtureDef__set_restitution_p1 = Module["_emscripten_bind_b2FixtureDef__set_restitution_p1"] = asm["_emscripten_bind_b2FixtureDef__set_restitution_p1"];
var _emscripten_bind_b2Shape__GetChildCount_p0 = Module["_emscripten_bind_b2Shape__GetChildCount_p0"] = asm["_emscripten_bind_b2Shape__GetChildCount_p0"];
var _emscripten_bind_b2Body__GetJointList_p0 = Module["_emscripten_bind_b2Body__GetJointList_p0"] = asm["_emscripten_bind_b2Body__GetJointList_p0"];
var _emscripten_bind_b2Timer____destroy___p0 = Module["_emscripten_bind_b2Timer____destroy___p0"] = asm["_emscripten_bind_b2Timer____destroy___p0"];
var _emscripten_bind_b2Vec2__IsValid_p0 = Module["_emscripten_bind_b2Vec2__IsValid_p0"] = asm["_emscripten_bind_b2Vec2__IsValid_p0"];
var _emscripten_bind_b2Contact__ResetRestitution_p0 = Module["_emscripten_bind_b2Contact__ResetRestitution_p0"] = asm["_emscripten_bind_b2Contact__ResetRestitution_p0"];
var _emscripten_bind_b2RevoluteJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2RevoluteJointDef__get_collideConnected_p1"] = asm["_emscripten_bind_b2RevoluteJointDef__get_collideConnected_p1"];
var _emscripten_bind_b2DynamicTree__MoveProxy_p3 = Module["_emscripten_bind_b2DynamicTree__MoveProxy_p3"] = asm["_emscripten_bind_b2DynamicTree__MoveProxy_p3"];
var _emscripten_bind_b2Transform__b2Transform_p0 = Module["_emscripten_bind_b2Transform__b2Transform_p0"] = asm["_emscripten_bind_b2Transform__b2Transform_p0"];
var _emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0"] = asm["_emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0"];
var _emscripten_bind_b2RevoluteJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2RevoluteJointDef__get_bodyA_p1"] = asm["_emscripten_bind_b2RevoluteJointDef__get_bodyA_p1"];
var _emscripten_bind_b2WheelJointDef____destroy___p0 = Module["_emscripten_bind_b2WheelJointDef____destroy___p0"] = asm["_emscripten_bind_b2WheelJointDef____destroy___p0"];
var _emscripten_bind_b2MouseJoint__GetBodyA_p0 = Module["_emscripten_bind_b2MouseJoint__GetBodyA_p0"] = asm["_emscripten_bind_b2MouseJoint__GetBodyA_p0"];
var _emscripten_bind_b2GearJoint__GetType_p0 = Module["_emscripten_bind_b2GearJoint__GetType_p0"] = asm["_emscripten_bind_b2GearJoint__GetType_p0"];
var _emscripten_bind_b2Body__SetMassData_p1 = Module["_emscripten_bind_b2Body__SetMassData_p1"] = asm["_emscripten_bind_b2Body__SetMassData_p1"];
var _emscripten_bind_b2MouseJoint__IsActive_p0 = Module["_emscripten_bind_b2MouseJoint__IsActive_p0"] = asm["_emscripten_bind_b2MouseJoint__IsActive_p0"];
var _emscripten_bind_b2Contact__GetChildIndexA_p0 = Module["_emscripten_bind_b2Contact__GetChildIndexA_p0"] = asm["_emscripten_bind_b2Contact__GetChildIndexA_p0"];
var _emscripten_bind_b2Fixture__GetShape_p0 = Module["_emscripten_bind_b2Fixture__GetShape_p0"] = asm["_emscripten_bind_b2Fixture__GetShape_p0"];
var _emscripten_bind_b2DistanceProxy__set_m_radius_p1 = Module["_emscripten_bind_b2DistanceProxy__set_m_radius_p1"] = asm["_emscripten_bind_b2DistanceProxy__set_m_radius_p1"];
var _emscripten_bind_b2DistanceJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2DistanceJointDef__get_bodyB_p1"] = asm["_emscripten_bind_b2DistanceJointDef__get_bodyB_p1"];
var _emscripten_bind_b2RevoluteJoint__GetLowerLimit_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetLowerLimit_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetLowerLimit_p0"];
var _emscripten_bind_b2World__DestroyJoint_p1 = Module["_emscripten_bind_b2World__DestroyJoint_p1"] = asm["_emscripten_bind_b2World__DestroyJoint_p1"];
var _emscripten_bind_b2PulleyJointDef__set_ratio_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_ratio_p1"] = asm["_emscripten_bind_b2PulleyJointDef__set_ratio_p1"];
var _emscripten_bind_b2DynamicTree__b2DynamicTree_p0 = Module["_emscripten_bind_b2DynamicTree__b2DynamicTree_p0"] = asm["_emscripten_bind_b2DynamicTree__b2DynamicTree_p0"];
var _emscripten_bind_b2RopeJoint__GetType_p0 = Module["_emscripten_bind_b2RopeJoint__GetType_p0"] = asm["_emscripten_bind_b2RopeJoint__GetType_p0"];
var _emscripten_bind_b2Body__GetLocalPoint_p1 = Module["_emscripten_bind_b2Body__GetLocalPoint_p1"] = asm["_emscripten_bind_b2Body__GetLocalPoint_p1"];
var _emscripten_bind_b2World__GetBodyCount_p0 = Module["_emscripten_bind_b2World__GetBodyCount_p0"] = asm["_emscripten_bind_b2World__GetBodyCount_p0"];
var _emscripten_bind_b2CircleShape__GetType_p0 = Module["_emscripten_bind_b2CircleShape__GetType_p0"] = asm["_emscripten_bind_b2CircleShape__GetType_p0"];
var _emscripten_bind_b2DistanceProxy__get_m_radius_p0 = Module["_emscripten_bind_b2DistanceProxy__get_m_radius_p0"] = asm["_emscripten_bind_b2DistanceProxy__get_m_radius_p0"];
var _emscripten_bind_b2World__ClearForces_p0 = Module["_emscripten_bind_b2World__ClearForces_p0"] = asm["_emscripten_bind_b2World__ClearForces_p0"];
var _emscripten_bind_b2DynamicTree____destroy___p0 = Module["_emscripten_bind_b2DynamicTree____destroy___p0"] = asm["_emscripten_bind_b2DynamicTree____destroy___p0"];
var _emscripten_bind_b2Contact__GetWorldManifold_p1 = Module["_emscripten_bind_b2Contact__GetWorldManifold_p1"] = asm["_emscripten_bind_b2Contact__GetWorldManifold_p1"];
var _emscripten_bind_b2DynamicTree__GetUserData_p1 = Module["_emscripten_bind_b2DynamicTree__GetUserData_p1"] = asm["_emscripten_bind_b2DynamicTree__GetUserData_p1"];
var _emscripten_bind_b2JointDef____destroy___p0 = Module["_emscripten_bind_b2JointDef____destroy___p0"] = asm["_emscripten_bind_b2JointDef____destroy___p0"];
var _emscripten_bind_b2DistanceProxy__GetVertex_p1 = Module["_emscripten_bind_b2DistanceProxy__GetVertex_p1"] = asm["_emscripten_bind_b2DistanceProxy__GetVertex_p1"];
var _emscripten_bind_b2Draw__GetFlags_p0 = Module["_emscripten_bind_b2Draw__GetFlags_p0"] = asm["_emscripten_bind_b2Draw__GetFlags_p0"];
var _emscripten_bind_b2PolygonShape__Set_p2 = Module["_emscripten_bind_b2PolygonShape__Set_p2"] = asm["_emscripten_bind_b2PolygonShape__Set_p2"];
var _emscripten_bind_b2DistanceJoint____destroy___p0 = Module["_emscripten_bind_b2DistanceJoint____destroy___p0"] = asm["_emscripten_bind_b2DistanceJoint____destroy___p0"];
var _emscripten_bind_b2DestructionListener__SayGoodbye_p1 = Module["_emscripten_bind_b2DestructionListener__SayGoodbye_p1"] = asm["_emscripten_bind_b2DestructionListener__SayGoodbye_p1"];
var _emscripten_bind_b2BodyDef____destroy___p0 = Module["_emscripten_bind_b2BodyDef____destroy___p0"] = asm["_emscripten_bind_b2BodyDef____destroy___p0"];
var _emscripten_bind_b2EdgeShape____destroy___p0 = Module["_emscripten_bind_b2EdgeShape____destroy___p0"] = asm["_emscripten_bind_b2EdgeShape____destroy___p0"];
var _emscripten_bind_b2GearJointDef__get_ratio_p0 = Module["_emscripten_bind_b2GearJointDef__get_ratio_p0"] = asm["_emscripten_bind_b2GearJointDef__get_ratio_p0"];
var _emscripten_bind_b2BlockAllocator__Clear_p0 = Module["_emscripten_bind_b2BlockAllocator__Clear_p0"] = asm["_emscripten_bind_b2BlockAllocator__Clear_p0"];
var _emscripten_bind_b2RopeJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2RopeJoint__GetAnchorB_p0"] = asm["_emscripten_bind_b2RopeJoint__GetAnchorB_p0"];
var _emscripten_bind_b2BodyDef__set_type_p1 = Module["_emscripten_bind_b2BodyDef__set_type_p1"] = asm["_emscripten_bind_b2BodyDef__set_type_p1"];
var _emscripten_bind_b2WheelJoint__EnableMotor_p1 = Module["_emscripten_bind_b2WheelJoint__EnableMotor_p1"] = asm["_emscripten_bind_b2WheelJoint__EnableMotor_p1"];
var _emscripten_bind_b2FrictionJoint__GetBodyA_p0 = Module["_emscripten_bind_b2FrictionJoint__GetBodyA_p0"] = asm["_emscripten_bind_b2FrictionJoint__GetBodyA_p0"];
var _emscripten_bind_b2RopeJoint__GetBodyA_p0 = Module["_emscripten_bind_b2RopeJoint__GetBodyA_p0"] = asm["_emscripten_bind_b2RopeJoint__GetBodyA_p0"];
var _emscripten_bind_b2WheelJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2WheelJointDef__get_bodyA_p1"] = asm["_emscripten_bind_b2WheelJointDef__get_bodyA_p1"];
var _emscripten_bind_b2RopeJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2RopeJoint__GetAnchorA_p0"] = asm["_emscripten_bind_b2RopeJoint__GetAnchorA_p0"];
var _emscripten_bind_b2GearJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2GearJointDef__get_collideConnected_p1"] = asm["_emscripten_bind_b2GearJointDef__get_collideConnected_p1"];
var _emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0"] = asm["_emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0"];
var _emscripten_bind_b2WeldJoint__GetLocalAnchorB_p0 = Module["_emscripten_bind_b2WeldJoint__GetLocalAnchorB_p0"] = asm["_emscripten_bind_b2WeldJoint__GetLocalAnchorB_p0"];
var _emscripten_bind_b2PolygonShape__set_m_radius_p1 = Module["_emscripten_bind_b2PolygonShape__set_m_radius_p1"] = asm["_emscripten_bind_b2PolygonShape__set_m_radius_p1"];
var _emscripten_bind_b2Vec2__SetZero_p0 = Module["_emscripten_bind_b2Vec2__SetZero_p0"] = asm["_emscripten_bind_b2Vec2__SetZero_p0"];
var _emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0 = Module["_emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0"] = asm["_emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0"];
var _emscripten_bind_b2ChainShape__CreateLoop_p2 = Module["_emscripten_bind_b2ChainShape__CreateLoop_p2"] = asm["_emscripten_bind_b2ChainShape__CreateLoop_p2"];
var _emscripten_bind_b2RevoluteJoint__GetNext_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetNext_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetNext_p0"];
var _emscripten_bind_b2World__DestroyBody_p1 = Module["_emscripten_bind_b2World__DestroyBody_p1"] = asm["_emscripten_bind_b2World__DestroyBody_p1"];
var _emscripten_bind_b2World__SetSubStepping_p1 = Module["_emscripten_bind_b2World__SetSubStepping_p1"] = asm["_emscripten_bind_b2World__SetSubStepping_p1"];
var _emscripten_bind_b2PulleyJoint__SetUserData_p1 = Module["_emscripten_bind_b2PulleyJoint__SetUserData_p1"] = asm["_emscripten_bind_b2PulleyJoint__SetUserData_p1"];
var _emscripten_bind_b2WheelJoint__GetMotorSpeed_p0 = Module["_emscripten_bind_b2WheelJoint__GetMotorSpeed_p0"] = asm["_emscripten_bind_b2WheelJoint__GetMotorSpeed_p0"];
var _emscripten_bind_b2RopeJoint__GetLimitState_p0 = Module["_emscripten_bind_b2RopeJoint__GetLimitState_p0"] = asm["_emscripten_bind_b2RopeJoint__GetLimitState_p0"];
var _emscripten_bind_b2PrismaticJointDef____destroy___p0 = Module["_emscripten_bind_b2PrismaticJointDef____destroy___p0"] = asm["_emscripten_bind_b2PrismaticJointDef____destroy___p0"];
var _emscripten_bind_b2PulleyJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_collideConnected_p1"] = asm["_emscripten_bind_b2PulleyJointDef__set_collideConnected_p1"];
var _emscripten_bind_b2WheelJoint__GetNext_p0 = Module["_emscripten_bind_b2WheelJoint__GetNext_p0"] = asm["_emscripten_bind_b2WheelJoint__GetNext_p0"];
var _emscripten_bind_b2World__SetContactFilter_p1 = Module["_emscripten_bind_b2World__SetContactFilter_p1"] = asm["_emscripten_bind_b2World__SetContactFilter_p1"];
var _emscripten_bind_b2BroadPhase__GetFatAABB_p1 = Module["_emscripten_bind_b2BroadPhase__GetFatAABB_p1"] = asm["_emscripten_bind_b2BroadPhase__GetFatAABB_p1"];
var _emscripten_bind_b2FrictionJoint__SetMaxTorque_p1 = Module["_emscripten_bind_b2FrictionJoint__SetMaxTorque_p1"] = asm["_emscripten_bind_b2FrictionJoint__SetMaxTorque_p1"];
var _emscripten_bind_b2ContactManager__set_m_contactCount_p1 = Module["_emscripten_bind_b2ContactManager__set_m_contactCount_p1"] = asm["_emscripten_bind_b2ContactManager__set_m_contactCount_p1"];
var _emscripten_bind_b2Body__GetLinearVelocity_p0 = Module["_emscripten_bind_b2Body__GetLinearVelocity_p0"] = asm["_emscripten_bind_b2Body__GetLinearVelocity_p0"];
var _emscripten_bind_b2ContactManager__get_m_allocator_p0 = Module["_emscripten_bind_b2ContactManager__get_m_allocator_p0"] = asm["_emscripten_bind_b2ContactManager__get_m_allocator_p0"];
var _emscripten_bind_b2AABB____destroy___p0 = Module["_emscripten_bind_b2AABB____destroy___p0"] = asm["_emscripten_bind_b2AABB____destroy___p0"];
var _emscripten_bind_b2PulleyJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2PulleyJoint__GetCollideConnected_p0"] = asm["_emscripten_bind_b2PulleyJoint__GetCollideConnected_p0"];
var _emscripten_bind_b2Joint__GetUserData_p0 = Module["_emscripten_bind_b2Joint__GetUserData_p0"] = asm["_emscripten_bind_b2Joint__GetUserData_p0"];
var _emscripten_bind_b2Rot__GetXAxis_p0 = Module["_emscripten_bind_b2Rot__GetXAxis_p0"] = asm["_emscripten_bind_b2Rot__GetXAxis_p0"];
var _emscripten_bind_b2ContactManager__get_m_contactCount_p0 = Module["_emscripten_bind_b2ContactManager__get_m_contactCount_p0"] = asm["_emscripten_bind_b2ContactManager__get_m_contactCount_p0"];
var _emscripten_bind_b2DistanceJoint__Dump_p0 = Module["_emscripten_bind_b2DistanceJoint__Dump_p0"] = asm["_emscripten_bind_b2DistanceJoint__Dump_p0"];
var _emscripten_bind_b2PolygonShape__GetVertexCount_p0 = Module["_emscripten_bind_b2PolygonShape__GetVertexCount_p0"] = asm["_emscripten_bind_b2PolygonShape__GetVertexCount_p0"];
var _emscripten_bind_b2StackAllocator__Free_p1 = Module["_emscripten_bind_b2StackAllocator__Free_p1"] = asm["_emscripten_bind_b2StackAllocator__Free_p1"];
var _emscripten_bind_b2CircleShape__GetSupportVertex_p1 = Module["_emscripten_bind_b2CircleShape__GetSupportVertex_p1"] = asm["_emscripten_bind_b2CircleShape__GetSupportVertex_p1"];
var _emscripten_bind_b2DistanceProxy__GetSupportVertex_p1 = Module["_emscripten_bind_b2DistanceProxy__GetSupportVertex_p1"] = asm["_emscripten_bind_b2DistanceProxy__GetSupportVertex_p1"];
var _emscripten_bind_b2DistanceJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_bodyA_p1"] = asm["_emscripten_bind_b2DistanceJointDef__set_bodyA_p1"];
var _emscripten_bind_b2JointDef__set_userData_p1 = Module["_emscripten_bind_b2JointDef__set_userData_p1"] = asm["_emscripten_bind_b2JointDef__set_userData_p1"];
var _emscripten_bind_b2GearJoint__GetBodyB_p0 = Module["_emscripten_bind_b2GearJoint__GetBodyB_p0"] = asm["_emscripten_bind_b2GearJoint__GetBodyB_p0"];
var _emscripten_bind_b2Vec3__get_z_p0 = Module["_emscripten_bind_b2Vec3__get_z_p0"] = asm["_emscripten_bind_b2Vec3__get_z_p0"];
var _emscripten_bind_b2RopeJoint__GetUserData_p0 = Module["_emscripten_bind_b2RopeJoint__GetUserData_p0"] = asm["_emscripten_bind_b2RopeJoint__GetUserData_p0"];
var _emscripten_bind_b2GearJoint__GetUserData_p0 = Module["_emscripten_bind_b2GearJoint__GetUserData_p0"] = asm["_emscripten_bind_b2GearJoint__GetUserData_p0"];
var _emscripten_bind_b2FixtureDef__get_restitution_p0 = Module["_emscripten_bind_b2FixtureDef__get_restitution_p0"] = asm["_emscripten_bind_b2FixtureDef__get_restitution_p0"];
var _emscripten_bind_b2WheelJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2WheelJoint__GetAnchorB_p0"] = asm["_emscripten_bind_b2WheelJoint__GetAnchorB_p0"];
var _emscripten_bind_b2FixtureDef__b2FixtureDef_p0 = Module["_emscripten_bind_b2FixtureDef__b2FixtureDef_p0"] = asm["_emscripten_bind_b2FixtureDef__b2FixtureDef_p0"];
var _emscripten_bind_b2WheelJointDef__get_motorSpeed_p0 = Module["_emscripten_bind_b2WheelJointDef__get_motorSpeed_p0"] = asm["_emscripten_bind_b2WheelJointDef__get_motorSpeed_p0"];
var _emscripten_bind_b2FrictionJoint__b2FrictionJoint_p1 = Module["_emscripten_bind_b2FrictionJoint__b2FrictionJoint_p1"] = asm["_emscripten_bind_b2FrictionJoint__b2FrictionJoint_p1"];
var _emscripten_bind_b2Body__GetAngularDamping_p0 = Module["_emscripten_bind_b2Body__GetAngularDamping_p0"] = asm["_emscripten_bind_b2Body__GetAngularDamping_p0"];
var _emscripten_bind_b2ChainShape__GetChildCount_p0 = Module["_emscripten_bind_b2ChainShape__GetChildCount_p0"] = asm["_emscripten_bind_b2ChainShape__GetChildCount_p0"];
var _emscripten_bind_b2ChainShape__SetNextVertex_p1 = Module["_emscripten_bind_b2ChainShape__SetNextVertex_p1"] = asm["_emscripten_bind_b2ChainShape__SetNextVertex_p1"];
var _emscripten_bind_b2Joint__GetBodyA_p0 = Module["_emscripten_bind_b2Joint__GetBodyA_p0"] = asm["_emscripten_bind_b2Joint__GetBodyA_p0"];
var _emscripten_bind_b2Fixture__IsSensor_p0 = Module["_emscripten_bind_b2Fixture__IsSensor_p0"] = asm["_emscripten_bind_b2Fixture__IsSensor_p0"];
var _emscripten_bind_b2Filter__set_maskBits_p1 = Module["_emscripten_bind_b2Filter__set_maskBits_p1"] = asm["_emscripten_bind_b2Filter__set_maskBits_p1"];
var _emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1"] = asm["_emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1"];
var _emscripten_bind_b2ContactListener__PreSolve_p2 = Module["_emscripten_bind_b2ContactListener__PreSolve_p2"] = asm["_emscripten_bind_b2ContactListener__PreSolve_p2"];
var _emscripten_bind_b2WheelJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2WheelJointDef__get_localAnchorB_p0"] = asm["_emscripten_bind_b2WheelJointDef__get_localAnchorB_p0"];
var _emscripten_bind_b2WheelJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2WheelJointDef__set_bodyB_p1"] = asm["_emscripten_bind_b2WheelJointDef__set_bodyB_p1"];
var _emscripten_bind_b2BroadPhase__MoveProxy_p3 = Module["_emscripten_bind_b2BroadPhase__MoveProxy_p3"] = asm["_emscripten_bind_b2BroadPhase__MoveProxy_p3"];
var _emscripten_bind_b2BodyDef__get_active_p0 = Module["_emscripten_bind_b2BodyDef__get_active_p0"] = asm["_emscripten_bind_b2BodyDef__get_active_p0"];
var _emscripten_bind_b2CircleShape__GetVertexCount_p0 = Module["_emscripten_bind_b2CircleShape__GetVertexCount_p0"] = asm["_emscripten_bind_b2CircleShape__GetVertexCount_p0"];
var _emscripten_bind_b2Timer__Reset_p0 = Module["_emscripten_bind_b2Timer__Reset_p0"] = asm["_emscripten_bind_b2Timer__Reset_p0"];
var _emscripten_bind_b2QueryCallback____destroy___p0 = Module["_emscripten_bind_b2QueryCallback____destroy___p0"] = asm["_emscripten_bind_b2QueryCallback____destroy___p0"];
var _emscripten_bind_b2World__b2World_p1 = Module["_emscripten_bind_b2World__b2World_p1"] = asm["_emscripten_bind_b2World__b2World_p1"];
var _emscripten_bind_b2Vec3__Set_p3 = Module["_emscripten_bind_b2Vec3__Set_p3"] = asm["_emscripten_bind_b2Vec3__Set_p3"];
var _emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0"] = asm["_emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0"];
var _emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1"] = asm["_emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1"];
var _emscripten_bind_b2StackAllocator____destroy___p0 = Module["_emscripten_bind_b2StackAllocator____destroy___p0"] = asm["_emscripten_bind_b2StackAllocator____destroy___p0"];
var _emscripten_bind_b2ContactEdge__get_other_p0 = Module["_emscripten_bind_b2ContactEdge__get_other_p0"] = asm["_emscripten_bind_b2ContactEdge__get_other_p0"];
var _emscripten_bind_b2Fixture__GetType_p0 = Module["_emscripten_bind_b2Fixture__GetType_p0"] = asm["_emscripten_bind_b2Fixture__GetType_p0"];
var _emscripten_bind_b2ContactListener__PostSolve_p2 = Module["_emscripten_bind_b2ContactListener__PostSolve_p2"] = asm["_emscripten_bind_b2ContactListener__PostSolve_p2"];
var _emscripten_bind_b2WeldJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2WeldJointDef__set_collideConnected_p1"] = asm["_emscripten_bind_b2WeldJointDef__set_collideConnected_p1"];
var _emscripten_bind_b2Contact__SetRestitution_p1 = Module["_emscripten_bind_b2Contact__SetRestitution_p1"] = asm["_emscripten_bind_b2Contact__SetRestitution_p1"];
var _emscripten_bind_b2Body__GetInertia_p0 = Module["_emscripten_bind_b2Body__GetInertia_p0"] = asm["_emscripten_bind_b2Body__GetInertia_p0"];
var _emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0 = Module["_emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0"] = asm["_emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0"];
var _emscripten_bind_b2PolygonShape__get_m_centroid_p0 = Module["_emscripten_bind_b2PolygonShape__get_m_centroid_p0"] = asm["_emscripten_bind_b2PolygonShape__get_m_centroid_p0"];
var _emscripten_bind_b2PrismaticJoint__IsMotorEnabled_p0 = Module["_emscripten_bind_b2PrismaticJoint__IsMotorEnabled_p0"] = asm["_emscripten_bind_b2PrismaticJoint__IsMotorEnabled_p0"];
var _emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0"] = asm["_emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0"];
var _emscripten_bind_b2Draw__SetFlags_p1 = Module["_emscripten_bind_b2Draw__SetFlags_p1"] = asm["_emscripten_bind_b2Draw__SetFlags_p1"];
var _emscripten_bind_b2WeldJoint__GetUserData_p0 = Module["_emscripten_bind_b2WeldJoint__GetUserData_p0"] = asm["_emscripten_bind_b2WeldJoint__GetUserData_p0"];
var _emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0 = Module["_emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0"] = asm["_emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0"];
var _emscripten_bind_b2FrictionJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_collideConnected_p1"] = asm["_emscripten_bind_b2FrictionJointDef__set_collideConnected_p1"];
var _emscripten_bind_b2World__SetAllowSleeping_p1 = Module["_emscripten_bind_b2World__SetAllowSleeping_p1"] = asm["_emscripten_bind_b2World__SetAllowSleeping_p1"];
var _emscripten_bind_b2BodyDef__set_gravityScale_p1 = Module["_emscripten_bind_b2BodyDef__set_gravityScale_p1"] = asm["_emscripten_bind_b2BodyDef__set_gravityScale_p1"];
var _emscripten_bind_b2Contact__IsTouching_p0 = Module["_emscripten_bind_b2Contact__IsTouching_p0"] = asm["_emscripten_bind_b2Contact__IsTouching_p0"];
var _emscripten_bind_b2Transform__set_q_p1 = Module["_emscripten_bind_b2Transform__set_q_p1"] = asm["_emscripten_bind_b2Transform__set_q_p1"];
var _emscripten_bind_b2FrictionJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2FrictionJoint__GetAnchorB_p0"] = asm["_emscripten_bind_b2FrictionJoint__GetAnchorB_p0"];
var _emscripten_bind_b2World__RayCast_p3 = Module["_emscripten_bind_b2World__RayCast_p3"] = asm["_emscripten_bind_b2World__RayCast_p3"];
var _emscripten_bind_b2WeldJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2WeldJointDef__get_bodyA_p1"] = asm["_emscripten_bind_b2WeldJointDef__get_bodyA_p1"];
var _emscripten_bind_b2WheelJoint__GetMotorTorque_p1 = Module["_emscripten_bind_b2WheelJoint__GetMotorTorque_p1"] = asm["_emscripten_bind_b2WheelJoint__GetMotorTorque_p1"];
var _emscripten_bind_b2Draw__b2Draw_p0 = Module["_emscripten_bind_b2Draw__b2Draw_p0"] = asm["_emscripten_bind_b2Draw__b2Draw_p0"];
var _emscripten_bind_b2ChainShape____destroy___p0 = Module["_emscripten_bind_b2ChainShape____destroy___p0"] = asm["_emscripten_bind_b2ChainShape____destroy___p0"];
var _emscripten_bind_b2ChainShape__get_m_radius_p0 = Module["_emscripten_bind_b2ChainShape__get_m_radius_p0"] = asm["_emscripten_bind_b2ChainShape__get_m_radius_p0"];
var _emscripten_bind_b2RopeJoint__IsActive_p0 = Module["_emscripten_bind_b2RopeJoint__IsActive_p0"] = asm["_emscripten_bind_b2RopeJoint__IsActive_p0"];
var _emscripten_bind_b2EdgeShape__set_m_radius_p1 = Module["_emscripten_bind_b2EdgeShape__set_m_radius_p1"] = asm["_emscripten_bind_b2EdgeShape__set_m_radius_p1"];
var _emscripten_bind_b2DistanceJointDef__get_length_p0 = Module["_emscripten_bind_b2DistanceJointDef__get_length_p0"] = asm["_emscripten_bind_b2DistanceJointDef__get_length_p0"];
var _emscripten_bind_b2DistanceJoint__SetUserData_p1 = Module["_emscripten_bind_b2DistanceJoint__SetUserData_p1"] = asm["_emscripten_bind_b2DistanceJoint__SetUserData_p1"];
var _emscripten_bind_b2ContactManager__set_m_contactListener_p1 = Module["_emscripten_bind_b2ContactManager__set_m_contactListener_p1"] = asm["_emscripten_bind_b2ContactManager__set_m_contactListener_p1"];
var _emscripten_bind_b2MouseJointDef__get_maxForce_p0 = Module["_emscripten_bind_b2MouseJointDef__get_maxForce_p0"] = asm["_emscripten_bind_b2MouseJointDef__get_maxForce_p0"];
var _emscripten_bind_b2WheelJoint____destroy___p0 = Module["_emscripten_bind_b2WheelJoint____destroy___p0"] = asm["_emscripten_bind_b2WheelJoint____destroy___p0"];
var _emscripten_bind_b2PulleyJoint__GetBodyA_p0 = Module["_emscripten_bind_b2PulleyJoint__GetBodyA_p0"] = asm["_emscripten_bind_b2PulleyJoint__GetBodyA_p0"];
var _emscripten_bind_b2MouseJoint__SetMaxForce_p1 = Module["_emscripten_bind_b2MouseJoint__SetMaxForce_p1"] = asm["_emscripten_bind_b2MouseJoint__SetMaxForce_p1"];
var _emscripten_bind_b2World__GetGravity_p0 = Module["_emscripten_bind_b2World__GetGravity_p0"] = asm["_emscripten_bind_b2World__GetGravity_p0"];
var _emscripten_bind_b2WheelJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2WheelJointDef__set_bodyA_p1"] = asm["_emscripten_bind_b2WheelJointDef__set_bodyA_p1"];
var _emscripten_bind_b2AABB__b2AABB_p0 = Module["_emscripten_bind_b2AABB__b2AABB_p0"] = asm["_emscripten_bind_b2AABB__b2AABB_p0"];
var _emscripten_bind_b2DistanceProxy____destroy___p0 = Module["_emscripten_bind_b2DistanceProxy____destroy___p0"] = asm["_emscripten_bind_b2DistanceProxy____destroy___p0"];
var _emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1"] = asm["_emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1"];
var _emscripten_bind_b2World__GetProfile_p0 = Module["_emscripten_bind_b2World__GetProfile_p0"] = asm["_emscripten_bind_b2World__GetProfile_p0"];
var _emscripten_bind_b2PulleyJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2PulleyJointDef__get_bodyA_p1"] = asm["_emscripten_bind_b2PulleyJointDef__get_bodyA_p1"];
var _emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1"] = asm["_emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1"];
var _emscripten_bind_b2PolygonShape__Clone_p1 = Module["_emscripten_bind_b2PolygonShape__Clone_p1"] = asm["_emscripten_bind_b2PolygonShape__Clone_p1"];
var _emscripten_bind_b2PrismaticJoint__GetUserData_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetUserData_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetUserData_p0"];
var _emscripten_bind_b2PrismaticJoint__IsLimitEnabled_p0 = Module["_emscripten_bind_b2PrismaticJoint__IsLimitEnabled_p0"] = asm["_emscripten_bind_b2PrismaticJoint__IsLimitEnabled_p0"];
var _emscripten_bind_b2PulleyJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2PulleyJoint__GetAnchorA_p0"] = asm["_emscripten_bind_b2PulleyJoint__GetAnchorA_p0"];
var _emscripten_bind_b2Fixture__Refilter_p0 = Module["_emscripten_bind_b2Fixture__Refilter_p0"] = asm["_emscripten_bind_b2Fixture__Refilter_p0"];
var _emscripten_bind_b2Vec3__SetZero_p0 = Module["_emscripten_bind_b2Vec3__SetZero_p0"] = asm["_emscripten_bind_b2Vec3__SetZero_p0"];
var _emscripten_bind_b2ContactListener__EndContact_p1 = Module["_emscripten_bind_b2ContactListener__EndContact_p1"] = asm["_emscripten_bind_b2ContactListener__EndContact_p1"];
var _emscripten_bind_b2Vec2__Normalize_p0 = Module["_emscripten_bind_b2Vec2__Normalize_p0"] = asm["_emscripten_bind_b2Vec2__Normalize_p0"];
var _emscripten_bind_b2Shape__ComputeMass_p2 = Module["_emscripten_bind_b2Shape__ComputeMass_p2"] = asm["_emscripten_bind_b2Shape__ComputeMass_p2"];
var _emscripten_bind_b2FrictionJoint__GetMaxForce_p0 = Module["_emscripten_bind_b2FrictionJoint__GetMaxForce_p0"] = asm["_emscripten_bind_b2FrictionJoint__GetMaxForce_p0"];
var _emscripten_bind_b2BodyDef__get_type_p0 = Module["_emscripten_bind_b2BodyDef__get_type_p0"] = asm["_emscripten_bind_b2BodyDef__get_type_p0"];
var _emscripten_bind_b2FixtureDef__get_userData_p0 = Module["_emscripten_bind_b2FixtureDef__get_userData_p0"] = asm["_emscripten_bind_b2FixtureDef__get_userData_p0"];
var _emscripten_bind_b2MouseJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2MouseJointDef__get_collideConnected_p1"] = asm["_emscripten_bind_b2MouseJointDef__get_collideConnected_p1"];
var _emscripten_bind_b2Contact__ResetFriction_p0 = Module["_emscripten_bind_b2Contact__ResetFriction_p0"] = asm["_emscripten_bind_b2Contact__ResetFriction_p0"];
var _emscripten_bind_b2WeldJointDef__Initialize_p3 = Module["_emscripten_bind_b2WeldJointDef__Initialize_p3"] = asm["_emscripten_bind_b2WeldJointDef__Initialize_p3"];
var _emscripten_bind_b2DistanceJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2DistanceJoint__GetCollideConnected_p0"] = asm["_emscripten_bind_b2DistanceJoint__GetCollideConnected_p0"];
var _emscripten_bind_b2Rot__Set_p1 = Module["_emscripten_bind_b2Rot__Set_p1"] = asm["_emscripten_bind_b2Rot__Set_p1"];
var _emscripten_bind_b2ChainShape__RayCast_p4 = Module["_emscripten_bind_b2ChainShape__RayCast_p4"] = asm["_emscripten_bind_b2ChainShape__RayCast_p4"];
var _emscripten_bind_b2RevoluteJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2RevoluteJoint__GetReactionForce_p1"] = asm["_emscripten_bind_b2RevoluteJoint__GetReactionForce_p1"];
var _emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0 = Module["_emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0"] = asm["_emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0"];
var _emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0"] = asm["_emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0"];
var _emscripten_bind_b2MouseJoint__GetMaxForce_p0 = Module["_emscripten_bind_b2MouseJoint__GetMaxForce_p0"] = asm["_emscripten_bind_b2MouseJoint__GetMaxForce_p0"];
var _emscripten_bind_b2RopeJoint__Dump_p0 = Module["_emscripten_bind_b2RopeJoint__Dump_p0"] = asm["_emscripten_bind_b2RopeJoint__Dump_p0"];
var _emscripten_bind_b2WheelJointDef__set_enableMotor_p1 = Module["_emscripten_bind_b2WheelJointDef__set_enableMotor_p1"] = asm["_emscripten_bind_b2WheelJointDef__set_enableMotor_p1"];
var _emscripten_bind_b2ContactManager__get_m_contactList_p0 = Module["_emscripten_bind_b2ContactManager__get_m_contactList_p0"] = asm["_emscripten_bind_b2ContactManager__get_m_contactList_p0"];
var _emscripten_bind_b2PolygonShape__ComputeAABB_p3 = Module["_emscripten_bind_b2PolygonShape__ComputeAABB_p3"] = asm["_emscripten_bind_b2PolygonShape__ComputeAABB_p3"];
var _emscripten_bind_b2RopeJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2RopeJointDef__set_bodyB_p1"] = asm["_emscripten_bind_b2RopeJointDef__set_bodyB_p1"];
var _emscripten_bind_b2BodyDef__set_fixedRotation_p1 = Module["_emscripten_bind_b2BodyDef__set_fixedRotation_p1"] = asm["_emscripten_bind_b2BodyDef__set_fixedRotation_p1"];
var _emscripten_bind_b2WheelJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2WheelJoint__GetAnchorA_p0"] = asm["_emscripten_bind_b2WheelJoint__GetAnchorA_p0"];
var _emscripten_bind_b2GearJoint__GetBodyA_p0 = Module["_emscripten_bind_b2GearJoint__GetBodyA_p0"] = asm["_emscripten_bind_b2GearJoint__GetBodyA_p0"];
var _emscripten_bind_b2CircleShape__b2CircleShape_p0 = Module["_emscripten_bind_b2CircleShape__b2CircleShape_p0"] = asm["_emscripten_bind_b2CircleShape__b2CircleShape_p0"];
var _emscripten_bind_b2EdgeShape__GetChildCount_p0 = Module["_emscripten_bind_b2EdgeShape__GetChildCount_p0"] = asm["_emscripten_bind_b2EdgeShape__GetChildCount_p0"];
var _emscripten_bind_b2BodyDef__set_active_p1 = Module["_emscripten_bind_b2BodyDef__set_active_p1"] = asm["_emscripten_bind_b2BodyDef__set_active_p1"];
var _emscripten_bind_b2FrictionJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2FrictionJointDef__get_bodyA_p1"] = asm["_emscripten_bind_b2FrictionJointDef__get_bodyA_p1"];
var _emscripten_bind_b2PulleyJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2PulleyJoint__GetReactionTorque_p1"] = asm["_emscripten_bind_b2PulleyJoint__GetReactionTorque_p1"];
var _emscripten_bind_b2DistanceJoint__b2DistanceJoint_p1 = Module["_emscripten_bind_b2DistanceJoint__b2DistanceJoint_p1"] = asm["_emscripten_bind_b2DistanceJoint__b2DistanceJoint_p1"];
var _emscripten_bind_b2Vec2____destroy___p0 = Module["_emscripten_bind_b2Vec2____destroy___p0"] = asm["_emscripten_bind_b2Vec2____destroy___p0"];
var _emscripten_bind_b2ChainShape__get_m_vertices_p0 = Module["_emscripten_bind_b2ChainShape__get_m_vertices_p0"] = asm["_emscripten_bind_b2ChainShape__get_m_vertices_p0"];
var _emscripten_bind_b2BodyDef__b2BodyDef_p0 = Module["_emscripten_bind_b2BodyDef__b2BodyDef_p0"] = asm["_emscripten_bind_b2BodyDef__b2BodyDef_p0"];
var _emscripten_bind_b2RevoluteJoint__Dump_p0 = Module["_emscripten_bind_b2RevoluteJoint__Dump_p0"] = asm["_emscripten_bind_b2RevoluteJoint__Dump_p0"];
var _emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0 = Module["_emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0"] = asm["_emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0"];
var _emscripten_bind_b2World__SetDebugDraw_p1 = Module["_emscripten_bind_b2World__SetDebugDraw_p1"] = asm["_emscripten_bind_b2World__SetDebugDraw_p1"];
var _emscripten_bind_b2MouseJoint____destroy___p0 = Module["_emscripten_bind_b2MouseJoint____destroy___p0"] = asm["_emscripten_bind_b2MouseJoint____destroy___p0"];
var _emscripten_bind_b2RevoluteJoint__IsMotorEnabled_p0 = Module["_emscripten_bind_b2RevoluteJoint__IsMotorEnabled_p0"] = asm["_emscripten_bind_b2RevoluteJoint__IsMotorEnabled_p0"];
var _emscripten_bind_b2MouseJointDef__set_frequencyHz_p1 = Module["_emscripten_bind_b2MouseJointDef__set_frequencyHz_p1"] = asm["_emscripten_bind_b2MouseJointDef__set_frequencyHz_p1"];
var _emscripten_bind_b2DestructionListener__b2DestructionListener_p0 = Module["_emscripten_bind_b2DestructionListener__b2DestructionListener_p0"] = asm["_emscripten_bind_b2DestructionListener__b2DestructionListener_p0"];
var _emscripten_bind_b2WheelJointDef__get_frequencyHz_p0 = Module["_emscripten_bind_b2WheelJointDef__get_frequencyHz_p0"] = asm["_emscripten_bind_b2WheelJointDef__get_frequencyHz_p0"];
var _emscripten_bind_b2Filter__b2Filter_p0 = Module["_emscripten_bind_b2Filter__b2Filter_p0"] = asm["_emscripten_bind_b2Filter__b2Filter_p0"];
var _emscripten_bind_b2World____destroy___p0 = Module["_emscripten_bind_b2World____destroy___p0"] = asm["_emscripten_bind_b2World____destroy___p0"];
var _emscripten_bind_b2Body__SetBullet_p1 = Module["_emscripten_bind_b2Body__SetBullet_p1"] = asm["_emscripten_bind_b2Body__SetBullet_p1"];
var _emscripten_bind_b2Body__GetAngle_p0 = Module["_emscripten_bind_b2Body__GetAngle_p0"] = asm["_emscripten_bind_b2Body__GetAngle_p0"];
var _emscripten_bind_b2PrismaticJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_bodyA_p1"] = asm["_emscripten_bind_b2PrismaticJointDef__set_bodyA_p1"];
var _emscripten_bind_b2MouseJoint__GetTarget_p0 = Module["_emscripten_bind_b2MouseJoint__GetTarget_p0"] = asm["_emscripten_bind_b2MouseJoint__GetTarget_p0"];
var _emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0 = Module["_emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0"] = asm["_emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0"];
var _emscripten_bind_b2Contact__GetNext_p0 = Module["_emscripten_bind_b2Contact__GetNext_p0"] = asm["_emscripten_bind_b2Contact__GetNext_p0"];
var _emscripten_bind_b2World__DrawDebugData_p0 = Module["_emscripten_bind_b2World__DrawDebugData_p0"] = asm["_emscripten_bind_b2World__DrawDebugData_p0"];
var _emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1"] = asm["_emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1"];
var _emscripten_bind_b2Vec2__LengthSquared_p0 = Module["_emscripten_bind_b2Vec2__LengthSquared_p0"] = asm["_emscripten_bind_b2Vec2__LengthSquared_p0"];
var _emscripten_bind_b2WheelJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2WheelJointDef__get_localAnchorA_p0"] = asm["_emscripten_bind_b2WheelJointDef__get_localAnchorA_p0"];
var _emscripten_bind_b2RevoluteJoint____destroy___p0 = Module["_emscripten_bind_b2RevoluteJoint____destroy___p0"] = asm["_emscripten_bind_b2RevoluteJoint____destroy___p0"];
var _emscripten_bind_b2PulleyJointDef__get_lengthB_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_lengthB_p0"] = asm["_emscripten_bind_b2PulleyJointDef__get_lengthB_p0"];
var _emscripten_bind_b2WeldJoint__GetReferenceAngle_p0 = Module["_emscripten_bind_b2WeldJoint__GetReferenceAngle_p0"] = asm["_emscripten_bind_b2WeldJoint__GetReferenceAngle_p0"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _emscripten_bind_b2FixtureDef__set_filter_p1 = Module["_emscripten_bind_b2FixtureDef__set_filter_p1"] = asm["_emscripten_bind_b2FixtureDef__set_filter_p1"];
var _emscripten_bind_b2ChainShape__CreateChain_p2 = Module["_emscripten_bind_b2ChainShape__CreateChain_p2"] = asm["_emscripten_bind_b2ChainShape__CreateChain_p2"];
var _emscripten_bind_b2Body__GetLocalVector_p1 = Module["_emscripten_bind_b2Body__GetLocalVector_p1"] = asm["_emscripten_bind_b2Body__GetLocalVector_p1"];
var _emscripten_bind_b2Fixture__SetUserData_p1 = Module["_emscripten_bind_b2Fixture__SetUserData_p1"] = asm["_emscripten_bind_b2Fixture__SetUserData_p1"];
var _emscripten_bind_b2RevoluteJoint__GetLocalAnchorB_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetLocalAnchorB_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetLocalAnchorB_p0"];
var _emscripten_bind_b2FrictionJointDef__set_maxTorque_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_maxTorque_p1"] = asm["_emscripten_bind_b2FrictionJointDef__set_maxTorque_p1"];
var _emscripten_bind_b2ChainShape__ComputeAABB_p3 = Module["_emscripten_bind_b2ChainShape__ComputeAABB_p3"] = asm["_emscripten_bind_b2ChainShape__ComputeAABB_p3"];
var _emscripten_bind_b2RopeJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2RopeJoint__GetReactionForce_p1"] = asm["_emscripten_bind_b2RopeJoint__GetReactionForce_p1"];
var _emscripten_bind_b2CircleShape__GetSupport_p1 = Module["_emscripten_bind_b2CircleShape__GetSupport_p1"] = asm["_emscripten_bind_b2CircleShape__GetSupport_p1"];
var _emscripten_bind_b2World__GetContinuousPhysics_p0 = Module["_emscripten_bind_b2World__GetContinuousPhysics_p0"] = asm["_emscripten_bind_b2World__GetContinuousPhysics_p0"];
var _emscripten_bind_b2FrictionJointDef__get_maxForce_p0 = Module["_emscripten_bind_b2FrictionJointDef__get_maxForce_p0"] = asm["_emscripten_bind_b2FrictionJointDef__get_maxForce_p0"];
var _emscripten_bind_b2Draw____destroy___p0 = Module["_emscripten_bind_b2Draw____destroy___p0"] = asm["_emscripten_bind_b2Draw____destroy___p0"];
var _emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1"] = asm["_emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1"];
var _emscripten_bind_b2MouseJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2MouseJoint__GetCollideConnected_p0"] = asm["_emscripten_bind_b2MouseJoint__GetCollideConnected_p0"];
var _emscripten_bind_b2MouseJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2MouseJoint__GetReactionForce_p1"] = asm["_emscripten_bind_b2MouseJoint__GetReactionForce_p1"];
var _emscripten_bind_b2JointDef__set_type_p1 = Module["_emscripten_bind_b2JointDef__set_type_p1"] = asm["_emscripten_bind_b2JointDef__set_type_p1"];
var _emscripten_bind_b2Color__Set_p3 = Module["_emscripten_bind_b2Color__Set_p3"] = asm["_emscripten_bind_b2Color__Set_p3"];
var _emscripten_bind_b2WeldJoint__GetType_p0 = Module["_emscripten_bind_b2WeldJoint__GetType_p0"] = asm["_emscripten_bind_b2WeldJoint__GetType_p0"];
var _emscripten_bind_b2Joint__GetBodyB_p0 = Module["_emscripten_bind_b2Joint__GetBodyB_p0"] = asm["_emscripten_bind_b2Joint__GetBodyB_p0"];
var _emscripten_bind_b2ContactManager__set_m_broadPhase_p1 = Module["_emscripten_bind_b2ContactManager__set_m_broadPhase_p1"] = asm["_emscripten_bind_b2ContactManager__set_m_broadPhase_p1"];
var _emscripten_bind_b2JointDef__get_type_p0 = Module["_emscripten_bind_b2JointDef__get_type_p0"] = asm["_emscripten_bind_b2JointDef__get_type_p0"];
var _emscripten_bind_b2BodyDef__set_position_p1 = Module["_emscripten_bind_b2BodyDef__set_position_p1"] = asm["_emscripten_bind_b2BodyDef__set_position_p1"];
var _emscripten_bind_b2Vec2__Length_p0 = Module["_emscripten_bind_b2Vec2__Length_p0"] = asm["_emscripten_bind_b2Vec2__Length_p0"];
var _emscripten_bind_b2MouseJoint__GetUserData_p0 = Module["_emscripten_bind_b2MouseJoint__GetUserData_p0"] = asm["_emscripten_bind_b2MouseJoint__GetUserData_p0"];
var _emscripten_bind_b2JointDef__get_collideConnected_p0 = Module["_emscripten_bind_b2JointDef__get_collideConnected_p0"] = asm["_emscripten_bind_b2JointDef__get_collideConnected_p0"];
var _emscripten_bind_b2BroadPhase__GetTreeQuality_p0 = Module["_emscripten_bind_b2BroadPhase__GetTreeQuality_p0"] = asm["_emscripten_bind_b2BroadPhase__GetTreeQuality_p0"];
var _emscripten_bind_b2WheelJointDef__get_dampingRatio_p0 = Module["_emscripten_bind_b2WheelJointDef__get_dampingRatio_p0"] = asm["_emscripten_bind_b2WheelJointDef__get_dampingRatio_p0"];
var _emscripten_bind_b2RopeJoint__GetBodyB_p0 = Module["_emscripten_bind_b2RopeJoint__GetBodyB_p0"] = asm["_emscripten_bind_b2RopeJoint__GetBodyB_p0"];
var _emscripten_bind_b2Joint__GetCollideConnected_p0 = Module["_emscripten_bind_b2Joint__GetCollideConnected_p0"] = asm["_emscripten_bind_b2Joint__GetCollideConnected_p0"];
var _emscripten_bind_b2FrictionJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2FrictionJoint__GetReactionTorque_p1"] = asm["_emscripten_bind_b2FrictionJoint__GetReactionTorque_p1"];
var _emscripten_bind_b2PulleyJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2PulleyJointDef__get_bodyB_p1"] = asm["_emscripten_bind_b2PulleyJointDef__get_bodyB_p1"];
var _emscripten_bind_b2ContactManager__set_m_contactFilter_p1 = Module["_emscripten_bind_b2ContactManager__set_m_contactFilter_p1"] = asm["_emscripten_bind_b2ContactManager__set_m_contactFilter_p1"];
var _emscripten_bind_b2FrictionJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2FrictionJoint__GetAnchorA_p0"] = asm["_emscripten_bind_b2FrictionJoint__GetAnchorA_p0"];
var _emscripten_bind_b2EdgeShape__ComputeAABB_p3 = Module["_emscripten_bind_b2EdgeShape__ComputeAABB_p3"] = asm["_emscripten_bind_b2EdgeShape__ComputeAABB_p3"];
var _emscripten_bind_b2BodyDef__set_awake_p1 = Module["_emscripten_bind_b2BodyDef__set_awake_p1"] = asm["_emscripten_bind_b2BodyDef__set_awake_p1"];
var _emscripten_bind_b2FrictionJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2FrictionJointDef__get_bodyB_p1"] = asm["_emscripten_bind_b2FrictionJointDef__get_bodyB_p1"];
var _emscripten_bind_b2PrismaticJoint__SetMotorSpeed_p1 = Module["_emscripten_bind_b2PrismaticJoint__SetMotorSpeed_p1"] = asm["_emscripten_bind_b2PrismaticJoint__SetMotorSpeed_p1"];
var _emscripten_bind_b2PolygonShape__RayCast_p4 = Module["_emscripten_bind_b2PolygonShape__RayCast_p4"] = asm["_emscripten_bind_b2PolygonShape__RayCast_p4"];
var _emscripten_bind_b2CircleShape__ComputeMass_p2 = Module["_emscripten_bind_b2CircleShape__ComputeMass_p2"] = asm["_emscripten_bind_b2CircleShape__ComputeMass_p2"];
var _emscripten_bind_b2MouseJoint__GetFrequency_p0 = Module["_emscripten_bind_b2MouseJoint__GetFrequency_p0"] = asm["_emscripten_bind_b2MouseJoint__GetFrequency_p0"];
var _emscripten_bind_b2Contact__IsEnabled_p0 = Module["_emscripten_bind_b2Contact__IsEnabled_p0"] = asm["_emscripten_bind_b2Contact__IsEnabled_p0"];
var _emscripten_bind_b2PrismaticJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_bodyB_p1"] = asm["_emscripten_bind_b2PrismaticJointDef__set_bodyB_p1"];
var _emscripten_bind_b2FixtureDef__set_userData_p1 = Module["_emscripten_bind_b2FixtureDef__set_userData_p1"] = asm["_emscripten_bind_b2FixtureDef__set_userData_p1"];
var _emscripten_bind_b2Fixture__SetSensor_p1 = Module["_emscripten_bind_b2Fixture__SetSensor_p1"] = asm["_emscripten_bind_b2Fixture__SetSensor_p1"];
var _emscripten_bind_b2Shape__GetType_p0 = Module["_emscripten_bind_b2Shape__GetType_p0"] = asm["_emscripten_bind_b2Shape__GetType_p0"];
var _emscripten_bind_b2WeldJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2WeldJointDef__get_localAnchorB_p0"] = asm["_emscripten_bind_b2WeldJointDef__get_localAnchorB_p0"];
var _emscripten_bind_b2ContactManager__Destroy_p1 = Module["_emscripten_bind_b2ContactManager__Destroy_p1"] = asm["_emscripten_bind_b2ContactManager__Destroy_p1"];
var _emscripten_bind_b2PrismaticJoint__GetLocalAnchorA_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetLocalAnchorA_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetLocalAnchorA_p0"];
var _emscripten_bind_b2WheelJointDef__set_motorSpeed_p1 = Module["_emscripten_bind_b2WheelJointDef__set_motorSpeed_p1"] = asm["_emscripten_bind_b2WheelJointDef__set_motorSpeed_p1"];
var _emscripten_bind_b2Contact__Evaluate_p3 = Module["_emscripten_bind_b2Contact__Evaluate_p3"] = asm["_emscripten_bind_b2Contact__Evaluate_p3"];
var _emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1"] = asm["_emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1"];
var _emscripten_bind_b2RevoluteJoint__GetType_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetType_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetType_p0"];
var _emscripten_bind_b2AABB__Combine_p1 = Module["_emscripten_bind_b2AABB__Combine_p1"] = asm["_emscripten_bind_b2AABB__Combine_p1"];
var _emscripten_bind_b2GearJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2GearJoint__GetReactionTorque_p1"] = asm["_emscripten_bind_b2GearJoint__GetReactionTorque_p1"];
var _emscripten_bind_b2AABB__Combine_p2 = Module["_emscripten_bind_b2AABB__Combine_p2"] = asm["_emscripten_bind_b2AABB__Combine_p2"];
var _emscripten_bind_b2PulleyJointDef__get_lengthA_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_lengthA_p0"] = asm["_emscripten_bind_b2PulleyJointDef__get_lengthA_p0"];
var _emscripten_bind_b2Shape__get_m_radius_p0 = Module["_emscripten_bind_b2Shape__get_m_radius_p0"] = asm["_emscripten_bind_b2Shape__get_m_radius_p0"];
var _emscripten_bind_b2ChainShape__set_m_count_p1 = Module["_emscripten_bind_b2ChainShape__set_m_count_p1"] = asm["_emscripten_bind_b2ChainShape__set_m_count_p1"];
var _emscripten_bind_b2RopeJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2RopeJointDef__set_bodyA_p1"] = asm["_emscripten_bind_b2RopeJointDef__set_bodyA_p1"];
var _emscripten_bind_b2DynamicTree__GetFatAABB_p1 = Module["_emscripten_bind_b2DynamicTree__GetFatAABB_p1"] = asm["_emscripten_bind_b2DynamicTree__GetFatAABB_p1"];
var _emscripten_bind_b2DistanceJoint__GetFrequency_p0 = Module["_emscripten_bind_b2DistanceJoint__GetFrequency_p0"] = asm["_emscripten_bind_b2DistanceJoint__GetFrequency_p0"];
var _emscripten_bind_b2PrismaticJoint__SetLimits_p2 = Module["_emscripten_bind_b2PrismaticJoint__SetLimits_p2"] = asm["_emscripten_bind_b2PrismaticJoint__SetLimits_p2"];
var _emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0 = Module["_emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0"] = asm["_emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0"];
var _emscripten_bind_b2Color__get_g_p0 = Module["_emscripten_bind_b2Color__get_g_p0"] = asm["_emscripten_bind_b2Color__get_g_p0"];
var _emscripten_bind_b2Fixture__GetBody_p0 = Module["_emscripten_bind_b2Fixture__GetBody_p0"] = asm["_emscripten_bind_b2Fixture__GetBody_p0"];
var _emscripten_bind_b2FrictionJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2FrictionJointDef__get_collideConnected_p1"] = asm["_emscripten_bind_b2FrictionJointDef__get_collideConnected_p1"];
var _emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1 = Module["_emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1"] = asm["_emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1"];
var _emscripten_bind_b2GearJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2GearJointDef__get_bodyB_p1"] = asm["_emscripten_bind_b2GearJointDef__get_bodyB_p1"];
var _emscripten_bind_b2AABB__set_upperBound_p1 = Module["_emscripten_bind_b2AABB__set_upperBound_p1"] = asm["_emscripten_bind_b2AABB__set_upperBound_p1"];
var _emscripten_bind_b2Contact__GetFixtureA_p0 = Module["_emscripten_bind_b2Contact__GetFixtureA_p0"] = asm["_emscripten_bind_b2Contact__GetFixtureA_p0"];
var _emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1"] = asm["_emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1"];
var _emscripten_bind_b2WheelJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2WheelJointDef__set_localAnchorA_p1"] = asm["_emscripten_bind_b2WheelJointDef__set_localAnchorA_p1"];
var _emscripten_bind_b2DistanceJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_bodyB_p1"] = asm["_emscripten_bind_b2DistanceJointDef__set_bodyB_p1"];
var _emscripten_bind_b2Transform__SetIdentity_p0 = Module["_emscripten_bind_b2Transform__SetIdentity_p0"] = asm["_emscripten_bind_b2Transform__SetIdentity_p0"];
var _emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1"] = asm["_emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1"];
var _emscripten_bind_b2Body__SetTransform_p2 = Module["_emscripten_bind_b2Body__SetTransform_p2"] = asm["_emscripten_bind_b2Body__SetTransform_p2"];
var _emscripten_bind_b2DistanceJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2DistanceJoint__GetReactionTorque_p1"] = asm["_emscripten_bind_b2DistanceJoint__GetReactionTorque_p1"];
var _emscripten_bind_b2StackAllocator__b2StackAllocator_p0 = Module["_emscripten_bind_b2StackAllocator__b2StackAllocator_p0"] = asm["_emscripten_bind_b2StackAllocator__b2StackAllocator_p0"];
var _emscripten_bind_b2MouseJointDef__set_maxForce_p1 = Module["_emscripten_bind_b2MouseJointDef__set_maxForce_p1"] = asm["_emscripten_bind_b2MouseJointDef__set_maxForce_p1"];
var _emscripten_bind_b2RevoluteJoint__GetMotorTorque_p1 = Module["_emscripten_bind_b2RevoluteJoint__GetMotorTorque_p1"] = asm["_emscripten_bind_b2RevoluteJoint__GetMotorTorque_p1"];
var _emscripten_bind_b2Vec2__set_y_p1 = Module["_emscripten_bind_b2Vec2__set_y_p1"] = asm["_emscripten_bind_b2Vec2__set_y_p1"];
var _emscripten_bind_b2CircleShape__Clone_p1 = Module["_emscripten_bind_b2CircleShape__Clone_p1"] = asm["_emscripten_bind_b2CircleShape__Clone_p1"];
var _emscripten_bind_b2Rot__GetAngle_p0 = Module["_emscripten_bind_b2Rot__GetAngle_p0"] = asm["_emscripten_bind_b2Rot__GetAngle_p0"];
var _emscripten_bind_b2Color____destroy___p0 = Module["_emscripten_bind_b2Color____destroy___p0"] = asm["_emscripten_bind_b2Color____destroy___p0"];
var _emscripten_bind_b2WeldJoint__GetBodyA_p0 = Module["_emscripten_bind_b2WeldJoint__GetBodyA_p0"] = asm["_emscripten_bind_b2WeldJoint__GetBodyA_p0"];
var _emscripten_bind_b2Fixture__GetRestitution_p0 = Module["_emscripten_bind_b2Fixture__GetRestitution_p0"] = asm["_emscripten_bind_b2Fixture__GetRestitution_p0"];
var _emscripten_bind_b2DistanceJointDef__set_length_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_length_p1"] = asm["_emscripten_bind_b2DistanceJointDef__set_length_p1"];
var _emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0"] = asm["_emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0"];
var _emscripten_bind_b2Color__b2Color_p3 = Module["_emscripten_bind_b2Color__b2Color_p3"] = asm["_emscripten_bind_b2Color__b2Color_p3"];
var _emscripten_bind_b2Body__ApplyForceToCenter_p1 = Module["_emscripten_bind_b2Body__ApplyForceToCenter_p1"] = asm["_emscripten_bind_b2Body__ApplyForceToCenter_p1"];
var _emscripten_bind_b2PrismaticJoint__SetUserData_p1 = Module["_emscripten_bind_b2PrismaticJoint__SetUserData_p1"] = asm["_emscripten_bind_b2PrismaticJoint__SetUserData_p1"];
var _emscripten_bind_b2Color__get_r_p0 = Module["_emscripten_bind_b2Color__get_r_p0"] = asm["_emscripten_bind_b2Color__get_r_p0"];
var _emscripten_bind_b2RevoluteJoint__b2RevoluteJoint_p1 = Module["_emscripten_bind_b2RevoluteJoint__b2RevoluteJoint_p1"] = asm["_emscripten_bind_b2RevoluteJoint__b2RevoluteJoint_p1"];
var _emscripten_bind_b2RevoluteJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetCollideConnected_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetCollideConnected_p0"];
var _emscripten_bind_b2PrismaticJoint__IsActive_p0 = Module["_emscripten_bind_b2PrismaticJoint__IsActive_p0"] = asm["_emscripten_bind_b2PrismaticJoint__IsActive_p0"];
var _emscripten_bind_b2Body__SetFixedRotation_p1 = Module["_emscripten_bind_b2Body__SetFixedRotation_p1"] = asm["_emscripten_bind_b2Body__SetFixedRotation_p1"];
var _emscripten_bind_b2RopeJointDef____destroy___p0 = Module["_emscripten_bind_b2RopeJointDef____destroy___p0"] = asm["_emscripten_bind_b2RopeJointDef____destroy___p0"];
var _emscripten_bind_b2PrismaticJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2PrismaticJointDef__get_bodyB_p1"] = asm["_emscripten_bind_b2PrismaticJointDef__get_bodyB_p1"];
var _emscripten_bind_b2Shape__set_m_radius_p1 = Module["_emscripten_bind_b2Shape__set_m_radius_p1"] = asm["_emscripten_bind_b2Shape__set_m_radius_p1"];
var _emscripten_bind_b2WheelJoint__GetBodyB_p0 = Module["_emscripten_bind_b2WheelJoint__GetBodyB_p0"] = asm["_emscripten_bind_b2WheelJoint__GetBodyB_p0"];
var _emscripten_bind_b2JointDef__get_bodyA_p0 = Module["_emscripten_bind_b2JointDef__get_bodyA_p0"] = asm["_emscripten_bind_b2JointDef__get_bodyA_p0"];
var _emscripten_bind_b2World__GetContactCount_p0 = Module["_emscripten_bind_b2World__GetContactCount_p0"] = asm["_emscripten_bind_b2World__GetContactCount_p0"];
var _emscripten_bind_b2Fixture__b2Fixture_p0 = Module["_emscripten_bind_b2Fixture__b2Fixture_p0"] = asm["_emscripten_bind_b2Fixture__b2Fixture_p0"];
var _emscripten_bind_b2StackAllocator__Allocate_p1 = Module["_emscripten_bind_b2StackAllocator__Allocate_p1"] = asm["_emscripten_bind_b2StackAllocator__Allocate_p1"];
var _emscripten_bind_b2Body__SetGravityScale_p1 = Module["_emscripten_bind_b2Body__SetGravityScale_p1"] = asm["_emscripten_bind_b2Body__SetGravityScale_p1"];
var _emscripten_bind_b2BroadPhase__CreateProxy_p2 = Module["_emscripten_bind_b2BroadPhase__CreateProxy_p2"] = asm["_emscripten_bind_b2BroadPhase__CreateProxy_p2"];
var _emscripten_bind_b2WheelJoint__GetLocalAnchorA_p0 = Module["_emscripten_bind_b2WheelJoint__GetLocalAnchorA_p0"] = asm["_emscripten_bind_b2WheelJoint__GetLocalAnchorA_p0"];
var _emscripten_bind_b2FrictionJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_bodyB_p1"] = asm["_emscripten_bind_b2FrictionJointDef__set_bodyB_p1"];
var _emscripten_bind_b2WheelJoint__SetSpringFrequencyHz_p1 = Module["_emscripten_bind_b2WheelJoint__SetSpringFrequencyHz_p1"] = asm["_emscripten_bind_b2WheelJoint__SetSpringFrequencyHz_p1"];
var _emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0 = Module["_emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0"] = asm["_emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0"];
var _emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1"] = asm["_emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1"];
var _emscripten_bind_b2Filter____destroy___p0 = Module["_emscripten_bind_b2Filter____destroy___p0"] = asm["_emscripten_bind_b2Filter____destroy___p0"];
var _emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1"] = asm["_emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1"];
var _emscripten_bind_b2Fixture__GetUserData_p0 = Module["_emscripten_bind_b2Fixture__GetUserData_p0"] = asm["_emscripten_bind_b2Fixture__GetUserData_p0"];
var _emscripten_bind_b2AABB__get_upperBound_p0 = Module["_emscripten_bind_b2AABB__get_upperBound_p0"] = asm["_emscripten_bind_b2AABB__get_upperBound_p0"];
var _emscripten_bind_b2PulleyJoint__Dump_p0 = Module["_emscripten_bind_b2PulleyJoint__Dump_p0"] = asm["_emscripten_bind_b2PulleyJoint__Dump_p0"];
var _emscripten_bind_b2RopeJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2RopeJointDef__get_localAnchorA_p0"] = asm["_emscripten_bind_b2RopeJointDef__get_localAnchorA_p0"];
var _emscripten_bind_b2CircleShape__get_m_radius_p0 = Module["_emscripten_bind_b2CircleShape__get_m_radius_p0"] = asm["_emscripten_bind_b2CircleShape__get_m_radius_p0"];
var _emscripten_bind_b2DistanceJoint__GetLength_p0 = Module["_emscripten_bind_b2DistanceJoint__GetLength_p0"] = asm["_emscripten_bind_b2DistanceJoint__GetLength_p0"];
var _emscripten_bind_b2BodyDef__set_angularVelocity_p1 = Module["_emscripten_bind_b2BodyDef__set_angularVelocity_p1"] = asm["_emscripten_bind_b2BodyDef__set_angularVelocity_p1"];
var _emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0"] = asm["_emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0"];
var _emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1"] = asm["_emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1"];
var _emscripten_bind_b2RevoluteJoint__SetMotorSpeed_p1 = Module["_emscripten_bind_b2RevoluteJoint__SetMotorSpeed_p1"] = asm["_emscripten_bind_b2RevoluteJoint__SetMotorSpeed_p1"];
var _emscripten_bind_b2WeldJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2WeldJoint__GetReactionTorque_p1"] = asm["_emscripten_bind_b2WeldJoint__GetReactionTorque_p1"];
var _emscripten_bind_b2GearJoint__SetUserData_p1 = Module["_emscripten_bind_b2GearJoint__SetUserData_p1"] = asm["_emscripten_bind_b2GearJoint__SetUserData_p1"];
var _emscripten_bind_b2PrismaticJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetAnchorB_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetAnchorB_p0"];
var _emscripten_bind_b2MouseJointDef__set_target_p1 = Module["_emscripten_bind_b2MouseJointDef__set_target_p1"] = asm["_emscripten_bind_b2MouseJointDef__set_target_p1"];
var _emscripten_bind_b2WeldJoint__GetBodyB_p0 = Module["_emscripten_bind_b2WeldJoint__GetBodyB_p0"] = asm["_emscripten_bind_b2WeldJoint__GetBodyB_p0"];
var _emscripten_bind_b2PolygonShape__TestPoint_p2 = Module["_emscripten_bind_b2PolygonShape__TestPoint_p2"] = asm["_emscripten_bind_b2PolygonShape__TestPoint_p2"];
var _emscripten_bind_b2WheelJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2WheelJointDef__set_localAnchorB_p1"] = asm["_emscripten_bind_b2WheelJointDef__set_localAnchorB_p1"];
var _emscripten_bind_b2WheelJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2WheelJoint__GetReactionTorque_p1"] = asm["_emscripten_bind_b2WheelJoint__GetReactionTorque_p1"];
var _emscripten_bind_b2FrictionJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_bodyA_p1"] = asm["_emscripten_bind_b2FrictionJointDef__set_bodyA_p1"];
var _emscripten_bind_b2Color__b2Color_p0 = Module["_emscripten_bind_b2Color__b2Color_p0"] = asm["_emscripten_bind_b2Color__b2Color_p0"];
var _emscripten_bind_b2BroadPhase__TestOverlap_p2 = Module["_emscripten_bind_b2BroadPhase__TestOverlap_p2"] = asm["_emscripten_bind_b2BroadPhase__TestOverlap_p2"];
var _emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1"] = asm["_emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1"];
var _emscripten_bind_b2RevoluteJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2RevoluteJoint__GetReactionTorque_p1"] = asm["_emscripten_bind_b2RevoluteJoint__GetReactionTorque_p1"];
var _emscripten_bind_b2Joint__GetAnchorB_p0 = Module["_emscripten_bind_b2Joint__GetAnchorB_p0"] = asm["_emscripten_bind_b2Joint__GetAnchorB_p0"];
var _emscripten_bind_b2CircleShape__set_m_radius_p1 = Module["_emscripten_bind_b2CircleShape__set_m_radius_p1"] = asm["_emscripten_bind_b2CircleShape__set_m_radius_p1"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _emscripten_bind_b2World__GetContactManager_p0 = Module["_emscripten_bind_b2World__GetContactManager_p0"] = asm["_emscripten_bind_b2World__GetContactManager_p0"];
var _emscripten_bind_b2RevoluteJoint__SetUserData_p1 = Module["_emscripten_bind_b2RevoluteJoint__SetUserData_p1"] = asm["_emscripten_bind_b2RevoluteJoint__SetUserData_p1"];
var _emscripten_bind_b2Contact__GetFixtureB_p0 = Module["_emscripten_bind_b2Contact__GetFixtureB_p0"] = asm["_emscripten_bind_b2Contact__GetFixtureB_p0"];
var _emscripten_bind_b2Rot__GetYAxis_p0 = Module["_emscripten_bind_b2Rot__GetYAxis_p0"] = asm["_emscripten_bind_b2Rot__GetYAxis_p0"];
var _emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1"] = asm["_emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1"];
var _emscripten_bind_b2Shape__Clone_p1 = Module["_emscripten_bind_b2Shape__Clone_p1"] = asm["_emscripten_bind_b2Shape__Clone_p1"];
var _emscripten_bind_b2PulleyJoint__GetType_p0 = Module["_emscripten_bind_b2PulleyJoint__GetType_p0"] = asm["_emscripten_bind_b2PulleyJoint__GetType_p0"];
var _emscripten_bind_b2AABB__set_lowerBound_p1 = Module["_emscripten_bind_b2AABB__set_lowerBound_p1"] = asm["_emscripten_bind_b2AABB__set_lowerBound_p1"];
var _emscripten_bind_b2RopeJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2RopeJoint__GetCollideConnected_p0"] = asm["_emscripten_bind_b2RopeJoint__GetCollideConnected_p0"];
var _emscripten_bind_b2DistanceJoint__IsActive_p0 = Module["_emscripten_bind_b2DistanceJoint__IsActive_p0"] = asm["_emscripten_bind_b2DistanceJoint__IsActive_p0"];
var _emscripten_bind_b2BodyDef__set_linearDamping_p1 = Module["_emscripten_bind_b2BodyDef__set_linearDamping_p1"] = asm["_emscripten_bind_b2BodyDef__set_linearDamping_p1"];
var _emscripten_bind_b2BroadPhase__GetTreeBalance_p0 = Module["_emscripten_bind_b2BroadPhase__GetTreeBalance_p0"] = asm["_emscripten_bind_b2BroadPhase__GetTreeBalance_p0"];
var _emscripten_bind_b2AABB__GetExtents_p0 = Module["_emscripten_bind_b2AABB__GetExtents_p0"] = asm["_emscripten_bind_b2AABB__GetExtents_p0"];
var _emscripten_bind_b2CircleShape____destroy___p0 = Module["_emscripten_bind_b2CircleShape____destroy___p0"] = asm["_emscripten_bind_b2CircleShape____destroy___p0"];
var _emscripten_bind_b2WeldJoint__SetFrequency_p1 = Module["_emscripten_bind_b2WeldJoint__SetFrequency_p1"] = asm["_emscripten_bind_b2WeldJoint__SetFrequency_p1"];
var _emscripten_bind_b2GearJointDef__set_ratio_p1 = Module["_emscripten_bind_b2GearJointDef__set_ratio_p1"] = asm["_emscripten_bind_b2GearJointDef__set_ratio_p1"];
var _emscripten_bind_b2FixtureDef__get_density_p0 = Module["_emscripten_bind_b2FixtureDef__get_density_p0"] = asm["_emscripten_bind_b2FixtureDef__get_density_p0"];
var _emscripten_bind_b2AABB__GetCenter_p0 = Module["_emscripten_bind_b2AABB__GetCenter_p0"] = asm["_emscripten_bind_b2AABB__GetCenter_p0"];
var _emscripten_bind_b2Draw__ClearFlags_p1 = Module["_emscripten_bind_b2Draw__ClearFlags_p1"] = asm["_emscripten_bind_b2Draw__ClearFlags_p1"];
var _emscripten_bind_b2WeldJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2WeldJointDef__get_localAnchorA_p0"] = asm["_emscripten_bind_b2WeldJointDef__get_localAnchorA_p0"];
var _emscripten_bind_b2PolygonShape__GetType_p0 = Module["_emscripten_bind_b2PolygonShape__GetType_p0"] = asm["_emscripten_bind_b2PolygonShape__GetType_p0"];
var _emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1"] = asm["_emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1"];
var _emscripten_bind_b2BroadPhase__GetUserData_p1 = Module["_emscripten_bind_b2BroadPhase__GetUserData_p1"] = asm["_emscripten_bind_b2BroadPhase__GetUserData_p1"];
var _emscripten_bind_b2Rot__get_c_p0 = Module["_emscripten_bind_b2Rot__get_c_p0"] = asm["_emscripten_bind_b2Rot__get_c_p0"];
var _emscripten_bind_b2World__GetAutoClearForces_p0 = Module["_emscripten_bind_b2World__GetAutoClearForces_p0"] = asm["_emscripten_bind_b2World__GetAutoClearForces_p0"];
var _emscripten_bind_b2World__GetTreeHeight_p0 = Module["_emscripten_bind_b2World__GetTreeHeight_p0"] = asm["_emscripten_bind_b2World__GetTreeHeight_p0"];
var _emscripten_bind_b2AABB__IsValid_p0 = Module["_emscripten_bind_b2AABB__IsValid_p0"] = asm["_emscripten_bind_b2AABB__IsValid_p0"];
var _emscripten_bind_b2RevoluteJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetAnchorB_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetAnchorB_p0"];
var _emscripten_bind_b2RopeJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2RopeJointDef__get_bodyB_p1"] = asm["_emscripten_bind_b2RopeJointDef__get_bodyB_p1"];
var _emscripten_bind_b2World__CreateJoint_p1 = Module["_emscripten_bind_b2World__CreateJoint_p1"] = asm["_emscripten_bind_b2World__CreateJoint_p1"];
var _emscripten_bind_b2WheelJoint__GetDefinition_p1 = Module["_emscripten_bind_b2WheelJoint__GetDefinition_p1"] = asm["_emscripten_bind_b2WheelJoint__GetDefinition_p1"];
var _emscripten_bind_b2Color__set_b_p1 = Module["_emscripten_bind_b2Color__set_b_p1"] = asm["_emscripten_bind_b2Color__set_b_p1"];
var _emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0"] = asm["_emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0"];
var _emscripten_bind_b2Body__GetLocalCenter_p0 = Module["_emscripten_bind_b2Body__GetLocalCenter_p0"] = asm["_emscripten_bind_b2Body__GetLocalCenter_p0"];
var _emscripten_bind_b2WheelJoint__GetLocalAxisA_p0 = Module["_emscripten_bind_b2WheelJoint__GetLocalAxisA_p0"] = asm["_emscripten_bind_b2WheelJoint__GetLocalAxisA_p0"];
var _emscripten_bind_b2Contact__GetFriction_p0 = Module["_emscripten_bind_b2Contact__GetFriction_p0"] = asm["_emscripten_bind_b2Contact__GetFriction_p0"];
var _emscripten_bind_b2Body__SetAngularVelocity_p1 = Module["_emscripten_bind_b2Body__SetAngularVelocity_p1"] = asm["_emscripten_bind_b2Body__SetAngularVelocity_p1"];
var _emscripten_bind_b2PrismaticJoint__GetJointSpeed_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetJointSpeed_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetJointSpeed_p0"];
var _emscripten_bind_b2CircleShape__TestPoint_p2 = Module["_emscripten_bind_b2CircleShape__TestPoint_p2"] = asm["_emscripten_bind_b2CircleShape__TestPoint_p2"];
var _emscripten_bind_b2Body__SetAwake_p1 = Module["_emscripten_bind_b2Body__SetAwake_p1"] = asm["_emscripten_bind_b2Body__SetAwake_p1"];
var _emscripten_bind_b2Filter__set_categoryBits_p1 = Module["_emscripten_bind_b2Filter__set_categoryBits_p1"] = asm["_emscripten_bind_b2Filter__set_categoryBits_p1"];
var _emscripten_bind_b2ChainShape__ComputeMass_p2 = Module["_emscripten_bind_b2ChainShape__ComputeMass_p2"] = asm["_emscripten_bind_b2ChainShape__ComputeMass_p2"];
var _emscripten_bind_b2PrismaticJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2PrismaticJointDef__get_collideConnected_p1"] = asm["_emscripten_bind_b2PrismaticJointDef__get_collideConnected_p1"];
var _emscripten_bind_b2World__CreateBody_p1 = Module["_emscripten_bind_b2World__CreateBody_p1"] = asm["_emscripten_bind_b2World__CreateBody_p1"];
var _emscripten_bind_b2JointDef__get_bodyB_p0 = Module["_emscripten_bind_b2JointDef__get_bodyB_p0"] = asm["_emscripten_bind_b2JointDef__get_bodyB_p0"];
var _emscripten_bind_b2ChainShape__get_m_count_p0 = Module["_emscripten_bind_b2ChainShape__get_m_count_p0"] = asm["_emscripten_bind_b2ChainShape__get_m_count_p0"];
var _emscripten_bind_b2Joint__GetType_p0 = Module["_emscripten_bind_b2Joint__GetType_p0"] = asm["_emscripten_bind_b2Joint__GetType_p0"];
var _emscripten_bind_b2WheelJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2WheelJoint__GetCollideConnected_p0"] = asm["_emscripten_bind_b2WheelJoint__GetCollideConnected_p0"];
var _emscripten_bind_b2WheelJointDef__set_localAxisA_p1 = Module["_emscripten_bind_b2WheelJointDef__set_localAxisA_p1"] = asm["_emscripten_bind_b2WheelJointDef__set_localAxisA_p1"];
var _emscripten_bind_b2CircleShape__GetVertex_p1 = Module["_emscripten_bind_b2CircleShape__GetVertex_p1"] = asm["_emscripten_bind_b2CircleShape__GetVertex_p1"];
var _emscripten_bind_b2WeldJoint__GetNext_p0 = Module["_emscripten_bind_b2WeldJoint__GetNext_p0"] = asm["_emscripten_bind_b2WeldJoint__GetNext_p0"];
var _emscripten_bind_b2WeldJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2WeldJoint__GetCollideConnected_p0"] = asm["_emscripten_bind_b2WeldJoint__GetCollideConnected_p0"];
var _emscripten_bind_b2World__SetDestructionListener_p1 = Module["_emscripten_bind_b2World__SetDestructionListener_p1"] = asm["_emscripten_bind_b2World__SetDestructionListener_p1"];
var _emscripten_bind_b2WheelJointDef__get_localAxisA_p0 = Module["_emscripten_bind_b2WheelJointDef__get_localAxisA_p0"] = asm["_emscripten_bind_b2WheelJointDef__get_localAxisA_p0"];
var _emscripten_bind_b2Joint__GetAnchorA_p0 = Module["_emscripten_bind_b2Joint__GetAnchorA_p0"] = asm["_emscripten_bind_b2Joint__GetAnchorA_p0"];
var _emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0 = Module["_emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0"] = asm["_emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0"];
var _emscripten_bind_b2WheelJoint__IsActive_p0 = Module["_emscripten_bind_b2WheelJoint__IsActive_p0"] = asm["_emscripten_bind_b2WheelJoint__IsActive_p0"];
var _emscripten_bind_b2Transform____destroy___p0 = Module["_emscripten_bind_b2Transform____destroy___p0"] = asm["_emscripten_bind_b2Transform____destroy___p0"];
var _emscripten_bind_b2PolygonShape__ComputeMass_p2 = Module["_emscripten_bind_b2PolygonShape__ComputeMass_p2"] = asm["_emscripten_bind_b2PolygonShape__ComputeMass_p2"];
var _emscripten_bind_b2RopeJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2RopeJointDef__get_bodyA_p1"] = asm["_emscripten_bind_b2RopeJointDef__get_bodyA_p1"];
var _emscripten_bind_b2WheelJoint__b2WheelJoint_p1 = Module["_emscripten_bind_b2WheelJoint__b2WheelJoint_p1"] = asm["_emscripten_bind_b2WheelJoint__b2WheelJoint_p1"];
var _emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1 = Module["_emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1"] = asm["_emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1"];
var _emscripten_bind_b2Draw__DrawTransform_p1 = Module["_emscripten_bind_b2Draw__DrawTransform_p1"] = asm["_emscripten_bind_b2Draw__DrawTransform_p1"];
var _emscripten_bind_b2DistanceJoint__GetType_p0 = Module["_emscripten_bind_b2DistanceJoint__GetType_p0"] = asm["_emscripten_bind_b2DistanceJoint__GetType_p0"];
var _emscripten_bind_b2MouseJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2MouseJointDef__set_bodyB_p1"] = asm["_emscripten_bind_b2MouseJointDef__set_bodyB_p1"];
var _emscripten_bind_b2Fixture__GetFriction_p0 = Module["_emscripten_bind_b2Fixture__GetFriction_p0"] = asm["_emscripten_bind_b2Fixture__GetFriction_p0"];
var _emscripten_bind_b2Body__GetWorld_p0 = Module["_emscripten_bind_b2Body__GetWorld_p0"] = asm["_emscripten_bind_b2Body__GetWorld_p0"];
var _emscripten_bind_b2PolygonShape__b2PolygonShape_p0 = Module["_emscripten_bind_b2PolygonShape__b2PolygonShape_p0"] = asm["_emscripten_bind_b2PolygonShape__b2PolygonShape_p0"];
var _emscripten_bind_b2WeldJointDef__set_frequencyHz_p1 = Module["_emscripten_bind_b2WeldJointDef__set_frequencyHz_p1"] = asm["_emscripten_bind_b2WeldJointDef__set_frequencyHz_p1"];
var _emscripten_bind_b2RevoluteJoint__GetJointAngle_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetJointAngle_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetJointAngle_p0"];
var _emscripten_bind_b2Body__ResetMassData_p0 = Module["_emscripten_bind_b2Body__ResetMassData_p0"] = asm["_emscripten_bind_b2Body__ResetMassData_p0"];
var _emscripten_bind_b2RevoluteJoint__IsActive_p0 = Module["_emscripten_bind_b2RevoluteJoint__IsActive_p0"] = asm["_emscripten_bind_b2RevoluteJoint__IsActive_p0"];
var _emscripten_bind_b2FrictionJoint__SetUserData_p1 = Module["_emscripten_bind_b2FrictionJoint__SetUserData_p1"] = asm["_emscripten_bind_b2FrictionJoint__SetUserData_p1"];
var _emscripten_bind_b2PulleyJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2PulleyJoint__GetReactionForce_p1"] = asm["_emscripten_bind_b2PulleyJoint__GetReactionForce_p1"];
var _emscripten_bind_b2Timer__b2Timer_p0 = Module["_emscripten_bind_b2Timer__b2Timer_p0"] = asm["_emscripten_bind_b2Timer__b2Timer_p0"];
var _emscripten_bind_b2World__SetContinuousPhysics_p1 = Module["_emscripten_bind_b2World__SetContinuousPhysics_p1"] = asm["_emscripten_bind_b2World__SetContinuousPhysics_p1"];
var _emscripten_bind_b2ContactManager__FindNewContacts_p0 = Module["_emscripten_bind_b2ContactManager__FindNewContacts_p0"] = asm["_emscripten_bind_b2ContactManager__FindNewContacts_p0"];
var _emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0"] = asm["_emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0"];
var _emscripten_bind_b2DynamicTree__GetMaxBalance_p0 = Module["_emscripten_bind_b2DynamicTree__GetMaxBalance_p0"] = asm["_emscripten_bind_b2DynamicTree__GetMaxBalance_p0"];
var _emscripten_bind_b2PolygonShape__GetVertex_p1 = Module["_emscripten_bind_b2PolygonShape__GetVertex_p1"] = asm["_emscripten_bind_b2PolygonShape__GetVertex_p1"];
var _emscripten_bind_b2WeldJointDef__get_frequencyHz_p0 = Module["_emscripten_bind_b2WeldJointDef__get_frequencyHz_p0"] = asm["_emscripten_bind_b2WeldJointDef__get_frequencyHz_p0"];
var _emscripten_bind_b2ContactListener__BeginContact_p1 = Module["_emscripten_bind_b2ContactListener__BeginContact_p1"] = asm["_emscripten_bind_b2ContactListener__BeginContact_p1"];
var _emscripten_bind_b2RevoluteJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_collideConnected_p1"] = asm["_emscripten_bind_b2RevoluteJointDef__set_collideConnected_p1"];
var _emscripten_bind_b2DistanceJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2DistanceJoint__GetAnchorA_p0"] = asm["_emscripten_bind_b2DistanceJoint__GetAnchorA_p0"];
var _emscripten_bind_b2PrismaticJoint__GetLocalAxisA_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetLocalAxisA_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetLocalAxisA_p0"];
var _emscripten_bind_b2ChainShape__Clone_p1 = Module["_emscripten_bind_b2ChainShape__Clone_p1"] = asm["_emscripten_bind_b2ChainShape__Clone_p1"];
var _emscripten_bind_b2GearJointDef__b2GearJointDef_p0 = Module["_emscripten_bind_b2GearJointDef__b2GearJointDef_p0"] = asm["_emscripten_bind_b2GearJointDef__b2GearJointDef_p0"];
var _emscripten_bind_b2RevoluteJoint__GetBodyA_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetBodyA_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetBodyA_p0"];
var _emscripten_bind_b2Body__ApplyForce_p2 = Module["_emscripten_bind_b2Body__ApplyForce_p2"] = asm["_emscripten_bind_b2Body__ApplyForce_p2"];
var _emscripten_bind_b2MouseJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2MouseJoint__GetReactionTorque_p1"] = asm["_emscripten_bind_b2MouseJoint__GetReactionTorque_p1"];
var _emscripten_bind_b2Vec2__get_y_p0 = Module["_emscripten_bind_b2Vec2__get_y_p0"] = asm["_emscripten_bind_b2Vec2__get_y_p0"];
var _emscripten_bind_b2ContactEdge__get_contact_p0 = Module["_emscripten_bind_b2ContactEdge__get_contact_p0"] = asm["_emscripten_bind_b2ContactEdge__get_contact_p0"];
var _emscripten_bind_b2GearJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2GearJointDef__set_bodyB_p1"] = asm["_emscripten_bind_b2GearJointDef__set_bodyB_p1"];
var _emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0"] = asm["_emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0"];
var _emscripten_bind_b2RopeJoint____destroy___p0 = Module["_emscripten_bind_b2RopeJoint____destroy___p0"] = asm["_emscripten_bind_b2RopeJoint____destroy___p0"];
var _emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0 = Module["_emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0"] = asm["_emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0"];
var _emscripten_bind_b2DistanceJoint__SetFrequency_p1 = Module["_emscripten_bind_b2DistanceJoint__SetFrequency_p1"] = asm["_emscripten_bind_b2DistanceJoint__SetFrequency_p1"];
var _emscripten_bind_b2PulleyJointDef__set_lengthA_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_lengthA_p1"] = asm["_emscripten_bind_b2PulleyJointDef__set_lengthA_p1"];
var _emscripten_bind_b2FixtureDef__get_friction_p0 = Module["_emscripten_bind_b2FixtureDef__get_friction_p0"] = asm["_emscripten_bind_b2FixtureDef__get_friction_p0"];
var _emscripten_bind_b2ContactEdge__get_next_p0 = Module["_emscripten_bind_b2ContactEdge__get_next_p0"] = asm["_emscripten_bind_b2ContactEdge__get_next_p0"];
var _emscripten_bind_b2RevoluteJoint__GetBodyB_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetBodyB_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetBodyB_p0"];
var _emscripten_bind_b2RevoluteJoint__GetUserData_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetUserData_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetUserData_p0"];
var _emscripten_bind_b2Body__GetType_p0 = Module["_emscripten_bind_b2Body__GetType_p0"] = asm["_emscripten_bind_b2Body__GetType_p0"];
var _emscripten_bind_b2World__Step_p3 = Module["_emscripten_bind_b2World__Step_p3"] = asm["_emscripten_bind_b2World__Step_p3"];
var _emscripten_bind_b2Vec2__set_x_p1 = Module["_emscripten_bind_b2Vec2__set_x_p1"] = asm["_emscripten_bind_b2Vec2__set_x_p1"];
var _emscripten_bind_b2ContactManager__b2ContactManager_p0 = Module["_emscripten_bind_b2ContactManager__b2ContactManager_p0"] = asm["_emscripten_bind_b2ContactManager__b2ContactManager_p0"];
var _emscripten_bind_b2RopeJoint__GetNext_p0 = Module["_emscripten_bind_b2RopeJoint__GetNext_p0"] = asm["_emscripten_bind_b2RopeJoint__GetNext_p0"];
var _emscripten_bind_b2WeldJoint__SetDampingRatio_p1 = Module["_emscripten_bind_b2WeldJoint__SetDampingRatio_p1"] = asm["_emscripten_bind_b2WeldJoint__SetDampingRatio_p1"];
var _emscripten_bind_b2World__GetTreeQuality_p0 = Module["_emscripten_bind_b2World__GetTreeQuality_p0"] = asm["_emscripten_bind_b2World__GetTreeQuality_p0"];
var _emscripten_bind_b2WeldJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2WeldJoint__GetAnchorB_p0"] = asm["_emscripten_bind_b2WeldJoint__GetAnchorB_p0"];
var _emscripten_bind_b2Contact__GetRestitution_p0 = Module["_emscripten_bind_b2Contact__GetRestitution_p0"] = asm["_emscripten_bind_b2Contact__GetRestitution_p0"];
var _emscripten_bind_b2MouseJointDef____destroy___p0 = Module["_emscripten_bind_b2MouseJointDef____destroy___p0"] = asm["_emscripten_bind_b2MouseJointDef____destroy___p0"];
var _emscripten_bind_b2Body__GetTransform_p0 = Module["_emscripten_bind_b2Body__GetTransform_p0"] = asm["_emscripten_bind_b2Body__GetTransform_p0"];
var _emscripten_bind_b2PrismaticJoint__b2PrismaticJoint_p1 = Module["_emscripten_bind_b2PrismaticJoint__b2PrismaticJoint_p1"] = asm["_emscripten_bind_b2PrismaticJoint__b2PrismaticJoint_p1"];
var _emscripten_bind_b2RopeJointDef__get_maxLength_p0 = Module["_emscripten_bind_b2RopeJointDef__get_maxLength_p0"] = asm["_emscripten_bind_b2RopeJointDef__get_maxLength_p0"];
var _emscripten_bind_b2DistanceJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2DistanceJoint__GetAnchorB_p0"] = asm["_emscripten_bind_b2DistanceJoint__GetAnchorB_p0"];
var _emscripten_bind_b2ChainShape__set_m_vertices_p1 = Module["_emscripten_bind_b2ChainShape__set_m_vertices_p1"] = asm["_emscripten_bind_b2ChainShape__set_m_vertices_p1"];
var _emscripten_bind_b2EdgeShape__TestPoint_p2 = Module["_emscripten_bind_b2EdgeShape__TestPoint_p2"] = asm["_emscripten_bind_b2EdgeShape__TestPoint_p2"];
var _emscripten_bind_b2FrictionJoint__GetMaxTorque_p0 = Module["_emscripten_bind_b2FrictionJoint__GetMaxTorque_p0"] = asm["_emscripten_bind_b2FrictionJoint__GetMaxTorque_p0"];
var _emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0 = Module["_emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0"] = asm["_emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0"];
var _emscripten_bind_b2ContactManager__AddPair_p2 = Module["_emscripten_bind_b2ContactManager__AddPair_p2"] = asm["_emscripten_bind_b2ContactManager__AddPair_p2"];
var _emscripten_bind_b2Color__set_g_p1 = Module["_emscripten_bind_b2Color__set_g_p1"] = asm["_emscripten_bind_b2Color__set_g_p1"];
var _emscripten_bind_b2WheelJoint__IsMotorEnabled_p0 = Module["_emscripten_bind_b2WheelJoint__IsMotorEnabled_p0"] = asm["_emscripten_bind_b2WheelJoint__IsMotorEnabled_p0"];
var _emscripten_bind_b2QueryCallback__b2QueryCallback_p0 = Module["_emscripten_bind_b2QueryCallback__b2QueryCallback_p0"] = asm["_emscripten_bind_b2QueryCallback__b2QueryCallback_p0"];
var _emscripten_bind_b2WheelJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2WheelJointDef__get_collideConnected_p1"] = asm["_emscripten_bind_b2WheelJointDef__get_collideConnected_p1"];
var _emscripten_bind_b2FrictionJoint__Dump_p0 = Module["_emscripten_bind_b2FrictionJoint__Dump_p0"] = asm["_emscripten_bind_b2FrictionJoint__Dump_p0"];
var _emscripten_bind_b2ChainShape__SetPrevVertex_p1 = Module["_emscripten_bind_b2ChainShape__SetPrevVertex_p1"] = asm["_emscripten_bind_b2ChainShape__SetPrevVertex_p1"];
var _emscripten_bind_b2AABB__GetPerimeter_p0 = Module["_emscripten_bind_b2AABB__GetPerimeter_p0"] = asm["_emscripten_bind_b2AABB__GetPerimeter_p0"];
var _emscripten_bind_b2DistanceProxy__set_m_count_p1 = Module["_emscripten_bind_b2DistanceProxy__set_m_count_p1"] = asm["_emscripten_bind_b2DistanceProxy__set_m_count_p1"];
var _emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1 = Module["_emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1"] = asm["_emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1"];
var _emscripten_bind_b2MouseJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2MouseJointDef__set_bodyA_p1"] = asm["_emscripten_bind_b2MouseJointDef__set_bodyA_p1"];
var _emscripten_bind_b2DynamicTree__GetAreaRatio_p0 = Module["_emscripten_bind_b2DynamicTree__GetAreaRatio_p0"] = asm["_emscripten_bind_b2DynamicTree__GetAreaRatio_p0"];
var _emscripten_bind_b2World__QueryAABB_p2 = Module["_emscripten_bind_b2World__QueryAABB_p2"] = asm["_emscripten_bind_b2World__QueryAABB_p2"];
var _emscripten_bind_b2RevoluteJoint__GetUpperLimit_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetUpperLimit_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetUpperLimit_p0"];
var _emscripten_bind_b2World__SetGravity_p1 = Module["_emscripten_bind_b2World__SetGravity_p1"] = asm["_emscripten_bind_b2World__SetGravity_p1"];
var _emscripten_bind_b2PulleyJointDef__Initialize_p7 = Module["_emscripten_bind_b2PulleyJointDef__Initialize_p7"] = asm["_emscripten_bind_b2PulleyJointDef__Initialize_p7"];
var _emscripten_bind_b2Color__get_b_p0 = Module["_emscripten_bind_b2Color__get_b_p0"] = asm["_emscripten_bind_b2Color__get_b_p0"];
var _emscripten_bind_b2DistanceJoint__GetBodyA_p0 = Module["_emscripten_bind_b2DistanceJoint__GetBodyA_p0"] = asm["_emscripten_bind_b2DistanceJoint__GetBodyA_p0"];
var _emscripten_bind_b2BroadPhase__DestroyProxy_p1 = Module["_emscripten_bind_b2BroadPhase__DestroyProxy_p1"] = asm["_emscripten_bind_b2BroadPhase__DestroyProxy_p1"];
var _emscripten_bind_b2PulleyJoint____destroy___p0 = Module["_emscripten_bind_b2PulleyJoint____destroy___p0"] = asm["_emscripten_bind_b2PulleyJoint____destroy___p0"];
var _emscripten_bind_b2BroadPhase__GetProxyCount_p0 = Module["_emscripten_bind_b2BroadPhase__GetProxyCount_p0"] = asm["_emscripten_bind_b2BroadPhase__GetProxyCount_p0"];
var _emscripten_bind_b2DistanceJoint__GetLocalAnchorB_p0 = Module["_emscripten_bind_b2DistanceJoint__GetLocalAnchorB_p0"] = asm["_emscripten_bind_b2DistanceJoint__GetLocalAnchorB_p0"];
var _emscripten_bind_b2ChainShape__GetChildEdge_p2 = Module["_emscripten_bind_b2ChainShape__GetChildEdge_p2"] = asm["_emscripten_bind_b2ChainShape__GetChildEdge_p2"];
var _emscripten_bind_b2EdgeShape__b2EdgeShape_p0 = Module["_emscripten_bind_b2EdgeShape__b2EdgeShape_p0"] = asm["_emscripten_bind_b2EdgeShape__b2EdgeShape_p0"];
var _emscripten_bind_b2ContactEdge__set_contact_p1 = Module["_emscripten_bind_b2ContactEdge__set_contact_p1"] = asm["_emscripten_bind_b2ContactEdge__set_contact_p1"];
var _emscripten_bind_b2WheelJoint__SetMotorSpeed_p1 = Module["_emscripten_bind_b2WheelJoint__SetMotorSpeed_p1"] = asm["_emscripten_bind_b2WheelJoint__SetMotorSpeed_p1"];
var _emscripten_bind_b2ChainShape__GetType_p0 = Module["_emscripten_bind_b2ChainShape__GetType_p0"] = asm["_emscripten_bind_b2ChainShape__GetType_p0"];
var _emscripten_bind_b2Fixture__SetFilterData_p1 = Module["_emscripten_bind_b2Fixture__SetFilterData_p1"] = asm["_emscripten_bind_b2Fixture__SetFilterData_p1"];
var _emscripten_bind_b2Body__ApplyAngularImpulse_p1 = Module["_emscripten_bind_b2Body__ApplyAngularImpulse_p1"] = asm["_emscripten_bind_b2Body__ApplyAngularImpulse_p1"];
var _emscripten_bind_b2RevoluteJoint__SetLimits_p2 = Module["_emscripten_bind_b2RevoluteJoint__SetLimits_p2"] = asm["_emscripten_bind_b2RevoluteJoint__SetLimits_p2"];
var _emscripten_bind_b2ChainShape__TestPoint_p2 = Module["_emscripten_bind_b2ChainShape__TestPoint_p2"] = asm["_emscripten_bind_b2ChainShape__TestPoint_p2"];
var _emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0"] = asm["_emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0"];
var _emscripten_bind_b2CircleShape__get_m_p_p0 = Module["_emscripten_bind_b2CircleShape__get_m_p_p0"] = asm["_emscripten_bind_b2CircleShape__get_m_p_p0"];
var _emscripten_bind_b2BodyDef__get_awake_p0 = Module["_emscripten_bind_b2BodyDef__get_awake_p0"] = asm["_emscripten_bind_b2BodyDef__get_awake_p0"];
var _emscripten_bind_b2MouseJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2MouseJoint__GetAnchorB_p0"] = asm["_emscripten_bind_b2MouseJoint__GetAnchorB_p0"];
var _emscripten_bind_b2Body__CreateFixture_p1 = Module["_emscripten_bind_b2Body__CreateFixture_p1"] = asm["_emscripten_bind_b2Body__CreateFixture_p1"];
var _emscripten_bind_b2Body__CreateFixture_p2 = Module["_emscripten_bind_b2Body__CreateFixture_p2"] = asm["_emscripten_bind_b2Body__CreateFixture_p2"];
var _emscripten_bind_b2GearJointDef____destroy___p0 = Module["_emscripten_bind_b2GearJointDef____destroy___p0"] = asm["_emscripten_bind_b2GearJointDef____destroy___p0"];
var _emscripten_bind_b2Fixture__GetDensity_p0 = Module["_emscripten_bind_b2Fixture__GetDensity_p0"] = asm["_emscripten_bind_b2Fixture__GetDensity_p0"];
var _emscripten_bind_b2PrismaticJoint__GetJointTranslation_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetJointTranslation_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetJointTranslation_p0"];
var _emscripten_bind_b2WeldJoint__GetDampingRatio_p0 = Module["_emscripten_bind_b2WeldJoint__GetDampingRatio_p0"] = asm["_emscripten_bind_b2WeldJoint__GetDampingRatio_p0"];
var _emscripten_bind_b2FrictionJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2FrictionJoint__GetReactionForce_p1"] = asm["_emscripten_bind_b2FrictionJoint__GetReactionForce_p1"];
var _emscripten_bind_b2BodyDef__set_userData_p1 = Module["_emscripten_bind_b2BodyDef__set_userData_p1"] = asm["_emscripten_bind_b2BodyDef__set_userData_p1"];
var _emscripten_bind_b2World__SetContactListener_p1 = Module["_emscripten_bind_b2World__SetContactListener_p1"] = asm["_emscripten_bind_b2World__SetContactListener_p1"];
var _emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0"] = asm["_emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0"];
var _emscripten_bind_b2FixtureDef__set_shape_p1 = Module["_emscripten_bind_b2FixtureDef__set_shape_p1"] = asm["_emscripten_bind_b2FixtureDef__set_shape_p1"];
var _emscripten_bind_b2DistanceJoint__SetDampingRatio_p1 = Module["_emscripten_bind_b2DistanceJoint__SetDampingRatio_p1"] = asm["_emscripten_bind_b2DistanceJoint__SetDampingRatio_p1"];
var _emscripten_bind_b2Joint__Dump_p0 = Module["_emscripten_bind_b2Joint__Dump_p0"] = asm["_emscripten_bind_b2Joint__Dump_p0"];
var _emscripten_bind_b2Shape__TestPoint_p2 = Module["_emscripten_bind_b2Shape__TestPoint_p2"] = asm["_emscripten_bind_b2Shape__TestPoint_p2"];
var _emscripten_bind_b2RopeJointDef__set_maxLength_p1 = Module["_emscripten_bind_b2RopeJointDef__set_maxLength_p1"] = asm["_emscripten_bind_b2RopeJointDef__set_maxLength_p1"];
var _emscripten_bind_b2RopeJoint__SetUserData_p1 = Module["_emscripten_bind_b2RopeJoint__SetUserData_p1"] = asm["_emscripten_bind_b2RopeJoint__SetUserData_p1"];
var _emscripten_bind_b2Transform__get_p_p0 = Module["_emscripten_bind_b2Transform__get_p_p0"] = asm["_emscripten_bind_b2Transform__get_p_p0"];
var _emscripten_bind_b2PulleyJoint__GetLengthA_p0 = Module["_emscripten_bind_b2PulleyJoint__GetLengthA_p0"] = asm["_emscripten_bind_b2PulleyJoint__GetLengthA_p0"];
var _emscripten_bind_b2GearJoint__GetJoint2_p0 = Module["_emscripten_bind_b2GearJoint__GetJoint2_p0"] = asm["_emscripten_bind_b2GearJoint__GetJoint2_p0"];
var _emscripten_bind_b2Fixture__GetMassData_p1 = Module["_emscripten_bind_b2Fixture__GetMassData_p1"] = asm["_emscripten_bind_b2Fixture__GetMassData_p1"];
var _emscripten_bind_b2Body__IsBullet_p0 = Module["_emscripten_bind_b2Body__IsBullet_p0"] = asm["_emscripten_bind_b2Body__IsBullet_p0"];
var _emscripten_bind_b2WeldJointDef____destroy___p0 = Module["_emscripten_bind_b2WeldJointDef____destroy___p0"] = asm["_emscripten_bind_b2WeldJointDef____destroy___p0"];
var _emscripten_bind_b2PrismaticJoint__GetMotorSpeed_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetMotorSpeed_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetMotorSpeed_p0"];
var _emscripten_bind_b2GearJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2GearJointDef__get_bodyA_p1"] = asm["_emscripten_bind_b2GearJointDef__get_bodyA_p1"];
var _emscripten_bind_b2Draw__DrawCircle_p3 = Module["_emscripten_bind_b2Draw__DrawCircle_p3"] = asm["_emscripten_bind_b2Draw__DrawCircle_p3"];
var _emscripten_bind_b2FrictionJoint__GetLocalAnchorA_p0 = Module["_emscripten_bind_b2FrictionJoint__GetLocalAnchorA_p0"] = asm["_emscripten_bind_b2FrictionJoint__GetLocalAnchorA_p0"];
var _emscripten_bind_b2Body__GetWorldPoint_p1 = Module["_emscripten_bind_b2Body__GetWorldPoint_p1"] = asm["_emscripten_bind_b2Body__GetWorldPoint_p1"];
var _emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1"] = asm["_emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1"];
var _emscripten_bind_b2GearJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2GearJointDef__set_bodyA_p1"] = asm["_emscripten_bind_b2GearJointDef__set_bodyA_p1"];
var _emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1"] = asm["_emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1"];
var _emscripten_bind_b2BodyDef__set_bullet_p1 = Module["_emscripten_bind_b2BodyDef__set_bullet_p1"] = asm["_emscripten_bind_b2BodyDef__set_bullet_p1"];
var _emscripten_bind_b2BodyDef__get_angularVelocity_p0 = Module["_emscripten_bind_b2BodyDef__get_angularVelocity_p0"] = asm["_emscripten_bind_b2BodyDef__get_angularVelocity_p0"];
var _emscripten_bind_b2GearJoint__GetNext_p0 = Module["_emscripten_bind_b2GearJoint__GetNext_p0"] = asm["_emscripten_bind_b2GearJoint__GetNext_p0"];
var _emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0"] = asm["_emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0"];
var _emscripten_bind_b2BodyDef__get_fixedRotation_p0 = Module["_emscripten_bind_b2BodyDef__get_fixedRotation_p0"] = asm["_emscripten_bind_b2BodyDef__get_fixedRotation_p0"];
var _emscripten_bind_b2Body__GetFixtureList_p0 = Module["_emscripten_bind_b2Body__GetFixtureList_p0"] = asm["_emscripten_bind_b2Body__GetFixtureList_p0"];
var _emscripten_bind_b2WheelJoint__GetJointTranslation_p0 = Module["_emscripten_bind_b2WheelJoint__GetJointTranslation_p0"] = asm["_emscripten_bind_b2WheelJoint__GetJointTranslation_p0"];
var _emscripten_bind_b2WeldJointDef__get_dampingRatio_p0 = Module["_emscripten_bind_b2WeldJointDef__get_dampingRatio_p0"] = asm["_emscripten_bind_b2WeldJointDef__get_dampingRatio_p0"];
var _emscripten_bind_b2RopeJoint__SetMaxLength_p1 = Module["_emscripten_bind_b2RopeJoint__SetMaxLength_p1"] = asm["_emscripten_bind_b2RopeJoint__SetMaxLength_p1"];
var _emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0"] = asm["_emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0"];
var _emscripten_bind_b2PulleyJoint__GetGroundAnchorB_p0 = Module["_emscripten_bind_b2PulleyJoint__GetGroundAnchorB_p0"] = asm["_emscripten_bind_b2PulleyJoint__GetGroundAnchorB_p0"];
var _emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0"] = asm["_emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0"];
var _emscripten_bind_b2GearJointDef__set_joint2_p1 = Module["_emscripten_bind_b2GearJointDef__set_joint2_p1"] = asm["_emscripten_bind_b2GearJointDef__set_joint2_p1"];
var _emscripten_bind_b2BroadPhase__b2BroadPhase_p0 = Module["_emscripten_bind_b2BroadPhase__b2BroadPhase_p0"] = asm["_emscripten_bind_b2BroadPhase__b2BroadPhase_p0"];
var _emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0"] = asm["_emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0"];
var _emscripten_bind_b2MouseJoint__SetTarget_p1 = Module["_emscripten_bind_b2MouseJoint__SetTarget_p1"] = asm["_emscripten_bind_b2MouseJoint__SetTarget_p1"];
var _emscripten_bind_b2ContactEdge__set_prev_p1 = Module["_emscripten_bind_b2ContactEdge__set_prev_p1"] = asm["_emscripten_bind_b2ContactEdge__set_prev_p1"];
var _emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0"] = asm["_emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0"];
var _emscripten_bind_b2ChainShape__set_m_radius_p1 = Module["_emscripten_bind_b2ChainShape__set_m_radius_p1"] = asm["_emscripten_bind_b2ChainShape__set_m_radius_p1"];
var _emscripten_bind_b2Vec2__get_x_p0 = Module["_emscripten_bind_b2Vec2__get_x_p0"] = asm["_emscripten_bind_b2Vec2__get_x_p0"];
var _emscripten_bind_b2DistanceProxy__GetSupport_p1 = Module["_emscripten_bind_b2DistanceProxy__GetSupport_p1"] = asm["_emscripten_bind_b2DistanceProxy__GetSupport_p1"];
var _emscripten_bind_b2WheelJoint__GetLocalAnchorB_p0 = Module["_emscripten_bind_b2WheelJoint__GetLocalAnchorB_p0"] = asm["_emscripten_bind_b2WheelJoint__GetLocalAnchorB_p0"];
var _emscripten_bind_b2GearJointDef__get_joint2_p0 = Module["_emscripten_bind_b2GearJointDef__get_joint2_p0"] = asm["_emscripten_bind_b2GearJointDef__get_joint2_p0"];
var _emscripten_bind_b2PrismaticJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_collideConnected_p1"] = asm["_emscripten_bind_b2PrismaticJointDef__set_collideConnected_p1"];
var _emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1"] = asm["_emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1"];
var _emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1"] = asm["_emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1"];
var _emscripten_bind_b2Fixture__SetDensity_p1 = Module["_emscripten_bind_b2Fixture__SetDensity_p1"] = asm["_emscripten_bind_b2Fixture__SetDensity_p1"];
var _emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1"] = asm["_emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1"];
var _emscripten_bind_b2Body__IsAwake_p0 = Module["_emscripten_bind_b2Body__IsAwake_p0"] = asm["_emscripten_bind_b2Body__IsAwake_p0"];
var _emscripten_bind_b2MouseJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2MouseJoint__GetAnchorA_p0"] = asm["_emscripten_bind_b2MouseJoint__GetAnchorA_p0"];
var _emscripten_bind_b2PolygonShape__SetAsBox_p4 = Module["_emscripten_bind_b2PolygonShape__SetAsBox_p4"] = asm["_emscripten_bind_b2PolygonShape__SetAsBox_p4"];
var _emscripten_bind_b2PolygonShape__SetAsBox_p2 = Module["_emscripten_bind_b2PolygonShape__SetAsBox_p2"] = asm["_emscripten_bind_b2PolygonShape__SetAsBox_p2"];
var _emscripten_bind_b2GearJointDef__set_joint1_p1 = Module["_emscripten_bind_b2GearJointDef__set_joint1_p1"] = asm["_emscripten_bind_b2GearJointDef__set_joint1_p1"];
var _emscripten_bind_b2Draw__DrawSolidCircle_p4 = Module["_emscripten_bind_b2Draw__DrawSolidCircle_p4"] = asm["_emscripten_bind_b2Draw__DrawSolidCircle_p4"];
var _emscripten_bind_b2World__GetSubStepping_p0 = Module["_emscripten_bind_b2World__GetSubStepping_p0"] = asm["_emscripten_bind_b2World__GetSubStepping_p0"];
var _emscripten_bind_b2FrictionJoint__GetLocalAnchorB_p0 = Module["_emscripten_bind_b2FrictionJoint__GetLocalAnchorB_p0"] = asm["_emscripten_bind_b2FrictionJoint__GetLocalAnchorB_p0"];
var _free = Module["_free"] = asm["_free"];
var _emscripten_bind_b2Body__SetLinearDamping_p1 = Module["_emscripten_bind_b2Body__SetLinearDamping_p1"] = asm["_emscripten_bind_b2Body__SetLinearDamping_p1"];
var _emscripten_bind_b2Body__GetWorldVector_p1 = Module["_emscripten_bind_b2Body__GetWorldVector_p1"] = asm["_emscripten_bind_b2Body__GetWorldVector_p1"];
var _emscripten_bind_b2Fixture__SetFriction_p1 = Module["_emscripten_bind_b2Fixture__SetFriction_p1"] = asm["_emscripten_bind_b2Fixture__SetFriction_p1"];
var _emscripten_bind_b2Filter__get_groupIndex_p0 = Module["_emscripten_bind_b2Filter__get_groupIndex_p0"] = asm["_emscripten_bind_b2Filter__get_groupIndex_p0"];
var _emscripten_bind_b2FixtureDef__get_isSensor_p0 = Module["_emscripten_bind_b2FixtureDef__get_isSensor_p0"] = asm["_emscripten_bind_b2FixtureDef__get_isSensor_p0"];
var _emscripten_bind_b2PrismaticJoint__GetUpperLimit_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetUpperLimit_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetUpperLimit_p0"];
var _emscripten_bind_b2PrismaticJoint__Dump_p0 = Module["_emscripten_bind_b2PrismaticJoint__Dump_p0"] = asm["_emscripten_bind_b2PrismaticJoint__Dump_p0"];
var _emscripten_bind_b2Vec2__op_mul_p1 = Module["_emscripten_bind_b2Vec2__op_mul_p1"] = asm["_emscripten_bind_b2Vec2__op_mul_p1"];
var _emscripten_bind_b2DistanceProxy__Set_p2 = Module["_emscripten_bind_b2DistanceProxy__Set_p2"] = asm["_emscripten_bind_b2DistanceProxy__Set_p2"];
var _emscripten_bind_b2EdgeShape__Set_p2 = Module["_emscripten_bind_b2EdgeShape__Set_p2"] = asm["_emscripten_bind_b2EdgeShape__Set_p2"];
var _emscripten_bind_b2BodyDef__get_userData_p0 = Module["_emscripten_bind_b2BodyDef__get_userData_p0"] = asm["_emscripten_bind_b2BodyDef__get_userData_p0"];
var _emscripten_bind_b2CircleShape__set_m_p_p1 = Module["_emscripten_bind_b2CircleShape__set_m_p_p1"] = asm["_emscripten_bind_b2CircleShape__set_m_p_p1"];
var _emscripten_bind_b2WheelJoint__GetMaxMotorTorque_p0 = Module["_emscripten_bind_b2WheelJoint__GetMaxMotorTorque_p0"] = asm["_emscripten_bind_b2WheelJoint__GetMaxMotorTorque_p0"];
var _emscripten_bind_b2GearJoint__GetJoint1_p0 = Module["_emscripten_bind_b2GearJoint__GetJoint1_p0"] = asm["_emscripten_bind_b2GearJoint__GetJoint1_p0"];
var _emscripten_bind_b2WheelJointDef__set_dampingRatio_p1 = Module["_emscripten_bind_b2WheelJointDef__set_dampingRatio_p1"] = asm["_emscripten_bind_b2WheelJointDef__set_dampingRatio_p1"];
var _emscripten_bind_b2DistanceJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_collideConnected_p1"] = asm["_emscripten_bind_b2DistanceJointDef__set_collideConnected_p1"];
var _emscripten_bind_b2DistanceProxy__get_m_count_p0 = Module["_emscripten_bind_b2DistanceProxy__get_m_count_p0"] = asm["_emscripten_bind_b2DistanceProxy__get_m_count_p0"];
var _emscripten_bind_b2WeldJointDef__set_dampingRatio_p1 = Module["_emscripten_bind_b2WeldJointDef__set_dampingRatio_p1"] = asm["_emscripten_bind_b2WeldJointDef__set_dampingRatio_p1"];
var _emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1"] = asm["_emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1"];
var _emscripten_bind_b2GearJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2GearJoint__GetCollideConnected_p0"] = asm["_emscripten_bind_b2GearJoint__GetCollideConnected_p0"];
var _emscripten_bind_b2FrictionJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2FrictionJoint__GetCollideConnected_p0"] = asm["_emscripten_bind_b2FrictionJoint__GetCollideConnected_p0"];
var _memset = Module["_memset"] = asm["_memset"];
var _emscripten_bind_b2WheelJoint__Dump_p0 = Module["_emscripten_bind_b2WheelJoint__Dump_p0"] = asm["_emscripten_bind_b2WheelJoint__Dump_p0"];
var _emscripten_bind_b2World__GetTreeBalance_p0 = Module["_emscripten_bind_b2World__GetTreeBalance_p0"] = asm["_emscripten_bind_b2World__GetTreeBalance_p0"];
var _emscripten_bind_b2ContactListener__b2ContactListener_p0 = Module["_emscripten_bind_b2ContactListener__b2ContactListener_p0"] = asm["_emscripten_bind_b2ContactListener__b2ContactListener_p0"];
var _emscripten_bind_b2Rot____destroy___p0 = Module["_emscripten_bind_b2Rot____destroy___p0"] = asm["_emscripten_bind_b2Rot____destroy___p0"];
var _emscripten_bind_b2PrismaticJoint__GetMaxMotorForce_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetMaxMotorForce_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetMaxMotorForce_p0"];
var _emscripten_bind_b2PulleyJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_bodyB_p1"] = asm["_emscripten_bind_b2PulleyJointDef__set_bodyB_p1"];
var _emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0"] = asm["_emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0"];
var _emscripten_bind_b2RevoluteJoint__GetMotorSpeed_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetMotorSpeed_p0"] = asm["_emscripten_bind_b2RevoluteJoint__GetMotorSpeed_p0"];
var _emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0 = Module["_emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0"] = asm["_emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0"];
var _emscripten_bind_b2Body__GetNext_p0 = Module["_emscripten_bind_b2Body__GetNext_p0"] = asm["_emscripten_bind_b2Body__GetNext_p0"];
var _emscripten_bind_b2BroadPhase__GetTreeHeight_p0 = Module["_emscripten_bind_b2BroadPhase__GetTreeHeight_p0"] = asm["_emscripten_bind_b2BroadPhase__GetTreeHeight_p0"];
var _emscripten_bind_b2Draw__DrawSegment_p3 = Module["_emscripten_bind_b2Draw__DrawSegment_p3"] = asm["_emscripten_bind_b2Draw__DrawSegment_p3"];
var _emscripten_bind_b2Body__IsActive_p0 = Module["_emscripten_bind_b2Body__IsActive_p0"] = asm["_emscripten_bind_b2Body__IsActive_p0"];
var _emscripten_bind_b2Vec2__Set_p2 = Module["_emscripten_bind_b2Vec2__Set_p2"] = asm["_emscripten_bind_b2Vec2__Set_p2"];
var _emscripten_bind_b2PulleyJoint__GetUserData_p0 = Module["_emscripten_bind_b2PulleyJoint__GetUserData_p0"] = asm["_emscripten_bind_b2PulleyJoint__GetUserData_p0"];
var _emscripten_bind_b2ContactEdge__b2ContactEdge_p0 = Module["_emscripten_bind_b2ContactEdge__b2ContactEdge_p0"] = asm["_emscripten_bind_b2ContactEdge__b2ContactEdge_p0"];
var _emscripten_bind_b2Vec3__b2Vec3_p3 = Module["_emscripten_bind_b2Vec3__b2Vec3_p3"] = asm["_emscripten_bind_b2Vec3__b2Vec3_p3"];
var _emscripten_bind_b2Vec3__b2Vec3_p0 = Module["_emscripten_bind_b2Vec3__b2Vec3_p0"] = asm["_emscripten_bind_b2Vec3__b2Vec3_p0"];
var _emscripten_bind_b2PulleyJoint__GetGroundAnchorA_p0 = Module["_emscripten_bind_b2PulleyJoint__GetGroundAnchorA_p0"] = asm["_emscripten_bind_b2PulleyJoint__GetGroundAnchorA_p0"];
var _emscripten_bind_b2JointDef__b2JointDef_p0 = Module["_emscripten_bind_b2JointDef__b2JointDef_p0"] = asm["_emscripten_bind_b2JointDef__b2JointDef_p0"];
var _emscripten_bind_b2PulleyJoint__GetBodyB_p0 = Module["_emscripten_bind_b2PulleyJoint__GetBodyB_p0"] = asm["_emscripten_bind_b2PulleyJoint__GetBodyB_p0"];
var _emscripten_bind_b2PulleyJointDef____destroy___p0 = Module["_emscripten_bind_b2PulleyJointDef____destroy___p0"] = asm["_emscripten_bind_b2PulleyJointDef____destroy___p0"];
var _emscripten_bind_b2FixtureDef____destroy___p0 = Module["_emscripten_bind_b2FixtureDef____destroy___p0"] = asm["_emscripten_bind_b2FixtureDef____destroy___p0"];
var _emscripten_bind_b2EdgeShape__Clone_p1 = Module["_emscripten_bind_b2EdgeShape__Clone_p1"] = asm["_emscripten_bind_b2EdgeShape__Clone_p1"];
var _emscripten_bind_b2Body__GetUserData_p0 = Module["_emscripten_bind_b2Body__GetUserData_p0"] = asm["_emscripten_bind_b2Body__GetUserData_p0"];
var _emscripten_bind_b2Body__SetUserData_p1 = Module["_emscripten_bind_b2Body__SetUserData_p1"] = asm["_emscripten_bind_b2Body__SetUserData_p1"];
var _emscripten_bind_b2FixtureDef__set_friction_p1 = Module["_emscripten_bind_b2FixtureDef__set_friction_p1"] = asm["_emscripten_bind_b2FixtureDef__set_friction_p1"];
var _emscripten_bind_b2PrismaticJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2PrismaticJointDef__get_bodyA_p1"] = asm["_emscripten_bind_b2PrismaticJointDef__get_bodyA_p1"];
var _emscripten_bind_b2FrictionJoint__GetType_p0 = Module["_emscripten_bind_b2FrictionJoint__GetType_p0"] = asm["_emscripten_bind_b2FrictionJoint__GetType_p0"];
var _emscripten_bind_b2DistanceJointDef____destroy___p0 = Module["_emscripten_bind_b2DistanceJointDef____destroy___p0"] = asm["_emscripten_bind_b2DistanceJointDef____destroy___p0"];
var _emscripten_bind_b2FrictionJointDef__Initialize_p3 = Module["_emscripten_bind_b2FrictionJointDef__Initialize_p3"] = asm["_emscripten_bind_b2FrictionJointDef__Initialize_p3"];
var _emscripten_bind_b2GearJoint__b2GearJoint_p1 = Module["_emscripten_bind_b2GearJoint__b2GearJoint_p1"] = asm["_emscripten_bind_b2GearJoint__b2GearJoint_p1"];
var _emscripten_bind_b2Body__SetSleepingAllowed_p1 = Module["_emscripten_bind_b2Body__SetSleepingAllowed_p1"] = asm["_emscripten_bind_b2Body__SetSleepingAllowed_p1"];
var _emscripten_bind_b2Body__SetLinearVelocity_p1 = Module["_emscripten_bind_b2Body__SetLinearVelocity_p1"] = asm["_emscripten_bind_b2Body__SetLinearVelocity_p1"];
var _emscripten_bind_b2Body__ApplyLinearImpulse_p2 = Module["_emscripten_bind_b2Body__ApplyLinearImpulse_p2"] = asm["_emscripten_bind_b2Body__ApplyLinearImpulse_p2"];
var _emscripten_bind_b2PulleyJoint__b2PulleyJoint_p1 = Module["_emscripten_bind_b2PulleyJoint__b2PulleyJoint_p1"] = asm["_emscripten_bind_b2PulleyJoint__b2PulleyJoint_p1"];
var _emscripten_bind_b2MouseJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2MouseJointDef__get_bodyB_p1"] = asm["_emscripten_bind_b2MouseJointDef__get_bodyB_p1"];
var _emscripten_bind_b2ContactManager__set_m_contactList_p1 = Module["_emscripten_bind_b2ContactManager__set_m_contactList_p1"] = asm["_emscripten_bind_b2ContactManager__set_m_contactList_p1"];
var _emscripten_bind_b2MouseJoint__GetNext_p0 = Module["_emscripten_bind_b2MouseJoint__GetNext_p0"] = asm["_emscripten_bind_b2MouseJoint__GetNext_p0"];
var _emscripten_bind_b2Transform__get_q_p0 = Module["_emscripten_bind_b2Transform__get_q_p0"] = asm["_emscripten_bind_b2Transform__get_q_p0"];
var _emscripten_bind_b2DistanceJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2DistanceJointDef__get_collideConnected_p1"] = asm["_emscripten_bind_b2DistanceJointDef__get_collideConnected_p1"];
var _emscripten_bind_b2WeldJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2WeldJointDef__set_bodyB_p1"] = asm["_emscripten_bind_b2WeldJointDef__set_bodyB_p1"];
var _emscripten_bind_b2DistanceJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2DistanceJoint__GetReactionForce_p1"] = asm["_emscripten_bind_b2DistanceJoint__GetReactionForce_p1"];
var _emscripten_bind_b2FrictionJoint____destroy___p0 = Module["_emscripten_bind_b2FrictionJoint____destroy___p0"] = asm["_emscripten_bind_b2FrictionJoint____destroy___p0"];
var _emscripten_bind_b2JointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2JointDef__set_collideConnected_p1"] = asm["_emscripten_bind_b2JointDef__set_collideConnected_p1"];
var _emscripten_bind_b2CircleShape__ComputeAABB_p3 = Module["_emscripten_bind_b2CircleShape__ComputeAABB_p3"] = asm["_emscripten_bind_b2CircleShape__ComputeAABB_p3"];
var _emscripten_bind_b2QueryCallback__ReportFixture_p1 = Module["_emscripten_bind_b2QueryCallback__ReportFixture_p1"] = asm["_emscripten_bind_b2QueryCallback__ReportFixture_p1"];
var _emscripten_bind_b2GearJoint__GetRatio_p0 = Module["_emscripten_bind_b2GearJoint__GetRatio_p0"] = asm["_emscripten_bind_b2GearJoint__GetRatio_p0"];
var _emscripten_bind_b2BlockAllocator__Allocate_p1 = Module["_emscripten_bind_b2BlockAllocator__Allocate_p1"] = asm["_emscripten_bind_b2BlockAllocator__Allocate_p1"];
var _emscripten_bind_b2GearJointDef__get_joint1_p0 = Module["_emscripten_bind_b2GearJointDef__get_joint1_p0"] = asm["_emscripten_bind_b2GearJointDef__get_joint1_p0"];
var _emscripten_bind_b2AABB__Contains_p1 = Module["_emscripten_bind_b2AABB__Contains_p1"] = asm["_emscripten_bind_b2AABB__Contains_p1"];
var _emscripten_bind_b2FrictionJoint__GetNext_p0 = Module["_emscripten_bind_b2FrictionJoint__GetNext_p0"] = asm["_emscripten_bind_b2FrictionJoint__GetNext_p0"];
var _emscripten_bind_b2ContactEdge____destroy___p0 = Module["_emscripten_bind_b2ContactEdge____destroy___p0"] = asm["_emscripten_bind_b2ContactEdge____destroy___p0"];
var _emscripten_bind_b2RevoluteJointDef__Initialize_p3 = Module["_emscripten_bind_b2RevoluteJointDef__Initialize_p3"] = asm["_emscripten_bind_b2RevoluteJointDef__Initialize_p3"];
var _emscripten_bind_b2BodyDef__set_angle_p1 = Module["_emscripten_bind_b2BodyDef__set_angle_p1"] = asm["_emscripten_bind_b2BodyDef__set_angle_p1"];
var _emscripten_bind_b2PrismaticJointDef__Initialize_p4 = Module["_emscripten_bind_b2PrismaticJointDef__Initialize_p4"] = asm["_emscripten_bind_b2PrismaticJointDef__Initialize_p4"];
var _emscripten_bind_b2Body__GetContactList_p0 = Module["_emscripten_bind_b2Body__GetContactList_p0"] = asm["_emscripten_bind_b2Body__GetContactList_p0"];
var _emscripten_bind_b2MouseJointDef__set_dampingRatio_p1 = Module["_emscripten_bind_b2MouseJointDef__set_dampingRatio_p1"] = asm["_emscripten_bind_b2MouseJointDef__set_dampingRatio_p1"];
var _emscripten_bind_b2PulleyJointDef__get_ratio_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_ratio_p0"] = asm["_emscripten_bind_b2PulleyJointDef__get_ratio_p0"];
var _emscripten_bind_b2GearJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2GearJoint__GetReactionForce_p1"] = asm["_emscripten_bind_b2GearJoint__GetReactionForce_p1"];
var _emscripten_bind_b2Body__GetWorldCenter_p0 = Module["_emscripten_bind_b2Body__GetWorldCenter_p0"] = asm["_emscripten_bind_b2Body__GetWorldCenter_p0"];
var _emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1"] = asm["_emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1"];
var _emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1"] = asm["_emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1"];
var _emscripten_bind_b2BodyDef__set_angularDamping_p1 = Module["_emscripten_bind_b2BodyDef__set_angularDamping_p1"] = asm["_emscripten_bind_b2BodyDef__set_angularDamping_p1"];
var _emscripten_bind_b2MouseJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2MouseJointDef__set_collideConnected_p1"] = asm["_emscripten_bind_b2MouseJointDef__set_collideConnected_p1"];
var _emscripten_bind_b2Shape__ComputeAABB_p3 = Module["_emscripten_bind_b2Shape__ComputeAABB_p3"] = asm["_emscripten_bind_b2Shape__ComputeAABB_p3"];
var _emscripten_bind_b2Joint__GetReactionTorque_p1 = Module["_emscripten_bind_b2Joint__GetReactionTorque_p1"] = asm["_emscripten_bind_b2Joint__GetReactionTorque_p1"];
var _emscripten_bind_b2WheelJoint__GetType_p0 = Module["_emscripten_bind_b2WheelJoint__GetType_p0"] = asm["_emscripten_bind_b2WheelJoint__GetType_p0"];
var _emscripten_bind_b2Vec3__op_add_p1 = Module["_emscripten_bind_b2Vec3__op_add_p1"] = asm["_emscripten_bind_b2Vec3__op_add_p1"];
var _emscripten_bind_b2Filter__get_categoryBits_p0 = Module["_emscripten_bind_b2Filter__get_categoryBits_p0"] = asm["_emscripten_bind_b2Filter__get_categoryBits_p0"];
var _emscripten_bind_b2Vec3__set_z_p1 = Module["_emscripten_bind_b2Vec3__set_z_p1"] = asm["_emscripten_bind_b2Vec3__set_z_p1"];
var _emscripten_bind_b2CircleShape__GetChildCount_p0 = Module["_emscripten_bind_b2CircleShape__GetChildCount_p0"] = asm["_emscripten_bind_b2CircleShape__GetChildCount_p0"];
var _emscripten_bind_b2Transform__set_p_p1 = Module["_emscripten_bind_b2Transform__set_p_p1"] = asm["_emscripten_bind_b2Transform__set_p_p1"];
var _emscripten_bind_b2Fixture__GetNext_p0 = Module["_emscripten_bind_b2Fixture__GetNext_p0"] = asm["_emscripten_bind_b2Fixture__GetNext_p0"];
var _emscripten_bind_b2World__SetWarmStarting_p1 = Module["_emscripten_bind_b2World__SetWarmStarting_p1"] = asm["_emscripten_bind_b2World__SetWarmStarting_p1"];
var _emscripten_bind_b2Vec3__op_sub_p0 = Module["_emscripten_bind_b2Vec3__op_sub_p0"] = asm["_emscripten_bind_b2Vec3__op_sub_p0"];
var _emscripten_bind_b2ContactManager__Collide_p0 = Module["_emscripten_bind_b2ContactManager__Collide_p0"] = asm["_emscripten_bind_b2ContactManager__Collide_p0"];
var _emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0"] = asm["_emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0"];
var _emscripten_bind_b2ContactManager__get_m_contactListener_p0 = Module["_emscripten_bind_b2ContactManager__get_m_contactListener_p0"] = asm["_emscripten_bind_b2ContactManager__get_m_contactListener_p0"];
var _emscripten_bind_b2AABB__RayCast_p2 = Module["_emscripten_bind_b2AABB__RayCast_p2"] = asm["_emscripten_bind_b2AABB__RayCast_p2"];
var _emscripten_bind_b2WeldJoint__Dump_p0 = Module["_emscripten_bind_b2WeldJoint__Dump_p0"] = asm["_emscripten_bind_b2WeldJoint__Dump_p0"];
var _emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1"] = asm["_emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1"];
var _emscripten_bind_b2EdgeShape__GetType_p0 = Module["_emscripten_bind_b2EdgeShape__GetType_p0"] = asm["_emscripten_bind_b2EdgeShape__GetType_p0"];
var _emscripten_bind_b2BodyDef__get_gravityScale_p0 = Module["_emscripten_bind_b2BodyDef__get_gravityScale_p0"] = asm["_emscripten_bind_b2BodyDef__get_gravityScale_p0"];
var _emscripten_bind_b2DistanceProxy__set_m_vertices_p1 = Module["_emscripten_bind_b2DistanceProxy__set_m_vertices_p1"] = asm["_emscripten_bind_b2DistanceProxy__set_m_vertices_p1"];
var _emscripten_bind_b2RevoluteJoint__SetMaxMotorTorque_p1 = Module["_emscripten_bind_b2RevoluteJoint__SetMaxMotorTorque_p1"] = asm["_emscripten_bind_b2RevoluteJoint__SetMaxMotorTorque_p1"];
var _emscripten_bind_b2MouseJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2MouseJointDef__get_bodyA_p1"] = asm["_emscripten_bind_b2MouseJointDef__get_bodyA_p1"];
var _emscripten_bind_b2PulleyJoint__GetLengthB_p0 = Module["_emscripten_bind_b2PulleyJoint__GetLengthB_p0"] = asm["_emscripten_bind_b2PulleyJoint__GetLengthB_p0"];
var _emscripten_bind_b2WeldJointDef__set_referenceAngle_p1 = Module["_emscripten_bind_b2WeldJointDef__set_referenceAngle_p1"] = asm["_emscripten_bind_b2WeldJointDef__set_referenceAngle_p1"];
var _emscripten_bind_b2BlockAllocator__Free_p2 = Module["_emscripten_bind_b2BlockAllocator__Free_p2"] = asm["_emscripten_bind_b2BlockAllocator__Free_p2"];
var _emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0"] = asm["_emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0"];
var _emscripten_bind_b2GearJoint__SetRatio_p1 = Module["_emscripten_bind_b2GearJoint__SetRatio_p1"] = asm["_emscripten_bind_b2GearJoint__SetRatio_p1"];
var _emscripten_bind_b2BodyDef__get_angle_p0 = Module["_emscripten_bind_b2BodyDef__get_angle_p0"] = asm["_emscripten_bind_b2BodyDef__get_angle_p0"];
var _emscripten_bind_b2PrismaticJoint__GetReferenceAngle_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetReferenceAngle_p0"] = asm["_emscripten_bind_b2PrismaticJoint__GetReferenceAngle_p0"];
var _emscripten_bind_b2WeldJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2WeldJointDef__set_bodyA_p1"] = asm["_emscripten_bind_b2WeldJointDef__set_bodyA_p1"];
var _emscripten_bind_b2DynamicTree__GetHeight_p0 = Module["_emscripten_bind_b2DynamicTree__GetHeight_p0"] = asm["_emscripten_bind_b2DynamicTree__GetHeight_p0"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vif = Module["dynCall_vif"] = asm["dynCall_vif"];
var dynCall_viifii = Module["dynCall_viifii"] = asm["dynCall_viifii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viifi = Module["dynCall_viifi"] = asm["dynCall_viifi"];
var dynCall_if = Module["dynCall_if"] = asm["dynCall_if"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_viffif = Module["dynCall_viffif"] = asm["dynCall_viffif"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_fif = Module["dynCall_fif"] = asm["dynCall_fif"];
var dynCall_viff = Module["dynCall_viff"] = asm["dynCall_viff"];
var dynCall_viiiiiiif = Module["dynCall_viiiiiiif"] = asm["dynCall_viiiiiiif"];
var dynCall_vifff = Module["dynCall_vifff"] = asm["dynCall_vifff"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_iiif = Module["dynCall_iiif"] = asm["dynCall_iiif"];
var dynCall_iif = Module["dynCall_iif"] = asm["dynCall_iif"];
var dynCall_vifii = Module["dynCall_vifii"] = asm["dynCall_vifii"];
var dynCall_fi = Module["dynCall_fi"] = asm["dynCall_fi"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_fiiiif = Module["dynCall_fiiiif"] = asm["dynCall_fiiiif"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_ifff = Module["dynCall_ifff"] = asm["dynCall_ifff"];
var dynCall_iff = Module["dynCall_iff"] = asm["dynCall_iff"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_viif = Module["dynCall_viif"] = asm["dynCall_viif"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module['callMain'](args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}
// Bindings utilities
var Object__cache = {}; // we do it this way so we do not modify |Object|
function wrapPointer(ptr, __class__) {
  var cache = __class__ ? __class__.prototype.__cache__ : Object__cache;
  var ret = cache[ptr];
  if (ret) return ret;
  __class__ = __class__ || Object;
  ret = Object.create(__class__.prototype);
  ret.ptr = ptr;
  ret.__class__ = __class__;
  return cache[ptr] = ret;
}
Module['wrapPointer'] = wrapPointer;
function castObject(obj, __class__) {
  return wrapPointer(obj.ptr, __class__);
}
Module['castObject'] = castObject;
Module['NULL'] = wrapPointer(0);
function destroy(obj) {
  if (!obj['__destroy__']) throw 'Error: Cannot destroy object. (Did you create it yourself?)';
  obj['__destroy__']();
  // Remove from cache, so the object can be GC'd and refs added onto it released
  if (obj.__class__ !== Object) {
    delete obj.__class__.prototype.__cache__[obj.ptr];
  } else {
    delete Object__cache[obj.ptr];
  }
}
Module['destroy'] = destroy;
function compare(obj1, obj2) {
  return obj1.ptr === obj2.ptr;
}
Module['compare'] = compare;
function getPointer(obj) {
  return obj.ptr;
}
Module['getPointer'] = getPointer;
function getClass(obj) {
  return obj.__class__;
}
Module['getClass'] = getClass;
function customizeVTable(object, replacementPairs) {
  // Does not handle multiple inheritance
  // Find out vtable size
  var vTable = getValue(object.ptr, 'void*');
  // This assumes our modification where we null-terminate vtables
  var size = 0;
  while (getValue(vTable + Runtime.QUANTUM_SIZE*size, 'void*')) {
    size++;
  }
  // Prepare replacement lookup table and add replacements.
  // There is actually no good way to do this! So we do the following hack:
  // We create a fake vtable with canary functions, to detect which actual
  // function is being called
  var vTable2 = _malloc(size*Runtime.QUANTUM_SIZE);
  setValue(object.ptr, vTable2, 'void*');
  var canaryValue;
  var tempFuncs = [];
  for (var i = 0; i < size; i++) {
    (function(j) {
      var index = Runtime.addFunction(function() {
        canaryValue = j;
      });
      setValue(vTable2 + Runtime.QUANTUM_SIZE*i, index, 'void*');
      tempFuncs.push(index);
    })(i);
  }
  var args = [{ptr: 0}];
  replacementPairs.forEach(function(pair) {
    // We need the wrapper function that converts arguments to not fail. Keep adding arguments til it works.
    while(1) {
      try {
        pair['original'].apply(object, args);
        break;
      } catch(e) {
        args.push(args[0]);
      }
    }
    pair.originalIndex = getValue(vTable + canaryValue*Runtime.QUANTUM_SIZE, 'void*');
  });
  for (var i = 0; i < size; i++) {
    Runtime.removeFunction(tempFuncs[i]);
  }
  // Do the replacements
  var replacements = {};
  replacementPairs.forEach(function(pair) {
    replacements[pair.originalIndex] = Runtime.addFunction(pair['replacement']);
  });
  // Copy and modify vtable
  for (var i = 0; i < size; i++) {
    var value = getValue(vTable + Runtime.QUANTUM_SIZE*i, 'void*');
    if (value in replacements) value = replacements[value];
    setValue(vTable2 + Runtime.QUANTUM_SIZE*i, value, 'void*');
  }
  return object;
}
Module['customizeVTable'] = customizeVTable;
// Converts a value into a C-style string.
function ensureString(value) {
  if (typeof value == 'number') return value;
  return allocate(intArrayFromString(value), 'i8', ALLOC_STACK);
}
b2ContactManager.prototype['get_m_contactFilter'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactManager__get_m_contactFilter_p0(this.ptr), Module['b2ContactFilter']);
}
b2ContactManager.prototype['get_m_contactCount'] = function() {
    return _emscripten_bind_b2ContactManager__get_m_contactCount_p0(this.ptr);
}
b2ContactManager.prototype['set_m_contactFilter'] = function(arg0) {
    _emscripten_bind_b2ContactManager__set_m_contactFilter_p1(this.ptr, arg0.ptr);
}
function b2ContactManager() {
    this.ptr = _emscripten_bind_b2ContactManager__b2ContactManager_p0();
  b2ContactManager.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2ContactManager;
}
b2ContactManager.prototype.__cache__ = {};
Module['b2ContactManager'] = b2ContactManager;
b2ContactManager.prototype['AddPair'] = function(arg0, arg1) {
    _emscripten_bind_b2ContactManager__AddPair_p2(this.ptr, arg0, arg1);
}
b2ContactManager.prototype['set_m_allocator'] = function(arg0) {
    _emscripten_bind_b2ContactManager__set_m_allocator_p1(this.ptr, arg0.ptr);
}
b2ContactManager.prototype['set_m_contactCount'] = function(arg0) {
    _emscripten_bind_b2ContactManager__set_m_contactCount_p1(this.ptr, arg0);
}
b2ContactManager.prototype['Collide'] = function() {
    _emscripten_bind_b2ContactManager__Collide_p0(this.ptr);
}
b2ContactManager.prototype['set_m_contactList'] = function(arg0) {
    _emscripten_bind_b2ContactManager__set_m_contactList_p1(this.ptr, arg0.ptr);
}
b2ContactManager.prototype['FindNewContacts'] = function() {
    _emscripten_bind_b2ContactManager__FindNewContacts_p0(this.ptr);
}
b2ContactManager.prototype['get_m_contactListener'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactManager__get_m_contactListener_p0(this.ptr), Module['b2ContactListener']);
}
b2ContactManager.prototype['__destroy__'] = function() {
    _emscripten_bind_b2ContactManager____destroy___p0(this.ptr);
}
b2ContactManager.prototype['set_m_contactListener'] = function(arg0) {
    _emscripten_bind_b2ContactManager__set_m_contactListener_p1(this.ptr, arg0.ptr);
}
b2ContactManager.prototype['get_m_broadPhase'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactManager__get_m_broadPhase_p0(this.ptr), Module['b2BroadPhase']);
}
b2ContactManager.prototype['Destroy'] = function(arg0) {
    _emscripten_bind_b2ContactManager__Destroy_p1(this.ptr, arg0.ptr);
}
b2ContactManager.prototype['set_m_broadPhase'] = function(arg0) {
    _emscripten_bind_b2ContactManager__set_m_broadPhase_p1(this.ptr, arg0.ptr);
}
b2ContactManager.prototype['get_m_contactList'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactManager__get_m_contactList_p0(this.ptr), Module['b2Contact']);
}
b2ContactManager.prototype['get_m_allocator'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactManager__get_m_allocator_p0(this.ptr), Module['b2BlockAllocator']);
}
b2DistanceJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2DistanceJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2DistanceJoint.prototype['SetFrequency'] = function(arg0) {
    _emscripten_bind_b2DistanceJoint__SetFrequency_p1(this.ptr, arg0);
}
b2DistanceJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2DistanceJoint__GetUserData_p0(this.ptr);
}
b2DistanceJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2DistanceJoint__SetUserData_p1(this.ptr, arg0);
}
b2DistanceJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2DistanceJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2DistanceJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2DistanceJoint.prototype['GetLocalAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJoint__GetLocalAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2DistanceJoint.prototype['GetLocalAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJoint__GetLocalAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2DistanceJoint.prototype['GetFrequency'] = function() {
    return _emscripten_bind_b2DistanceJoint__GetFrequency_p0(this.ptr);
}
b2DistanceJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2DistanceJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2DistanceJoint.prototype['GetLength'] = function() {
    return _emscripten_bind_b2DistanceJoint__GetLength_p0(this.ptr);
}
b2DistanceJoint.prototype['GetDampingRatio'] = function() {
    return _emscripten_bind_b2DistanceJoint__GetDampingRatio_p0(this.ptr);
}
b2DistanceJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2DistanceJoint__GetCollideConnected_p0(this.ptr);
}
b2DistanceJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2DistanceJoint____destroy___p0(this.ptr);
}
b2DistanceJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2DistanceJoint__Dump_p0(this.ptr);
}
b2DistanceJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2DistanceJoint__GetType_p0(this.ptr);
}
function b2DistanceJoint(arg0) {
    this.ptr = _emscripten_bind_b2DistanceJoint__b2DistanceJoint_p1(arg0.ptr);
  b2DistanceJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2DistanceJoint;
}
b2DistanceJoint.prototype.__cache__ = {};
Module['b2DistanceJoint'] = b2DistanceJoint;
b2DistanceJoint.prototype['SetDampingRatio'] = function(arg0) {
    _emscripten_bind_b2DistanceJoint__SetDampingRatio_p1(this.ptr, arg0);
}
b2DistanceJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2DistanceJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2DistanceJoint.prototype['SetLength'] = function(arg0) {
    _emscripten_bind_b2DistanceJoint__SetLength_p1(this.ptr, arg0);
}
b2DistanceJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2DistanceJoint__IsActive_p0(this.ptr);
}
b2Fixture.prototype['GetRestitution'] = function() {
    return _emscripten_bind_b2Fixture__GetRestitution_p0(this.ptr);
}
b2Fixture.prototype['SetFilterData'] = function(arg0) {
    _emscripten_bind_b2Fixture__SetFilterData_p1(this.ptr, arg0.ptr);
}
b2Fixture.prototype['SetFriction'] = function(arg0) {
    _emscripten_bind_b2Fixture__SetFriction_p1(this.ptr, arg0);
}
function b2Fixture() {
    this.ptr = _emscripten_bind_b2Fixture__b2Fixture_p0();
  b2Fixture.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Fixture;
}
b2Fixture.prototype.__cache__ = {};
Module['b2Fixture'] = b2Fixture;
b2Fixture.prototype['GetShape'] = function() {
    return wrapPointer(_emscripten_bind_b2Fixture__GetShape_p0(this.ptr), Module['b2Shape']);
}
b2Fixture.prototype['SetRestitution'] = function(arg0) {
    _emscripten_bind_b2Fixture__SetRestitution_p1(this.ptr, arg0);
}
b2Fixture.prototype['GetBody'] = function() {
    return wrapPointer(_emscripten_bind_b2Fixture__GetBody_p0(this.ptr), Module['b2Body']);
}
b2Fixture.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2Fixture__GetNext_p0(this.ptr), Module['b2Fixture']);
}
b2Fixture.prototype['GetFriction'] = function() {
    return _emscripten_bind_b2Fixture__GetFriction_p0(this.ptr);
}
b2Fixture.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2Fixture__GetUserData_p0(this.ptr);
}
b2Fixture.prototype['SetDensity'] = function(arg0) {
    _emscripten_bind_b2Fixture__SetDensity_p1(this.ptr, arg0);
}
b2Fixture.prototype['GetMassData'] = function(arg0) {
    _emscripten_bind_b2Fixture__GetMassData_p1(this.ptr, arg0.ptr);
}
b2Fixture.prototype['SetSensor'] = function(arg0) {
    _emscripten_bind_b2Fixture__SetSensor_p1(this.ptr, arg0);
}
b2Fixture.prototype['GetAABB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Fixture__GetAABB_p1(this.ptr, arg0), Module['b2AABB']);
}
b2Fixture.prototype['TestPoint'] = function(arg0) {
    return _emscripten_bind_b2Fixture__TestPoint_p1(this.ptr, arg0.ptr);
}
b2Fixture.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2Fixture__SetUserData_p1(this.ptr, arg0);
}
b2Fixture.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Fixture____destroy___p0(this.ptr);
}
b2Fixture.prototype['RayCast'] = function(arg0, arg1, arg2) {
    return _emscripten_bind_b2Fixture__RayCast_p3(this.ptr, arg0.ptr, arg1.ptr, arg2);
}
b2Fixture.prototype['Refilter'] = function() {
    _emscripten_bind_b2Fixture__Refilter_p0(this.ptr);
}
b2Fixture.prototype['Dump'] = function(arg0) {
    _emscripten_bind_b2Fixture__Dump_p1(this.ptr, arg0);
}
b2Fixture.prototype['GetFilterData'] = function() {
    return wrapPointer(_emscripten_bind_b2Fixture__GetFilterData_p0(this.ptr), Module['b2Filter']);
}
b2Fixture.prototype['IsSensor'] = function() {
    return _emscripten_bind_b2Fixture__IsSensor_p0(this.ptr);
}
b2Fixture.prototype['GetType'] = function() {
    return _emscripten_bind_b2Fixture__GetType_p0(this.ptr);
}
b2Fixture.prototype['GetDensity'] = function() {
    return _emscripten_bind_b2Fixture__GetDensity_p0(this.ptr);
}
b2MouseJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2MouseJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2MouseJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2MouseJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2MouseJoint.prototype['SetFrequency'] = function(arg0) {
    _emscripten_bind_b2MouseJoint__SetFrequency_p1(this.ptr, arg0);
}
b2MouseJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2MouseJoint__GetUserData_p0(this.ptr);
}
b2MouseJoint.prototype['SetMaxForce'] = function(arg0) {
    _emscripten_bind_b2MouseJoint__SetMaxForce_p1(this.ptr, arg0);
}
b2MouseJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2MouseJoint__SetUserData_p1(this.ptr, arg0);
}
b2MouseJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2MouseJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2MouseJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2MouseJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
function b2MouseJoint(arg0) {
    this.ptr = _emscripten_bind_b2MouseJoint__b2MouseJoint_p1(arg0.ptr);
  b2MouseJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2MouseJoint;
}
b2MouseJoint.prototype.__cache__ = {};
Module['b2MouseJoint'] = b2MouseJoint;
b2MouseJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2MouseJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2MouseJoint.prototype['GetMaxForce'] = function() {
    return _emscripten_bind_b2MouseJoint__GetMaxForce_p0(this.ptr);
}
b2MouseJoint.prototype['GetTarget'] = function() {
    return wrapPointer(_emscripten_bind_b2MouseJoint__GetTarget_p0(this.ptr), Module['b2Vec2']);
}
b2MouseJoint.prototype['GetFrequency'] = function() {
    return _emscripten_bind_b2MouseJoint__GetFrequency_p0(this.ptr);
}
b2MouseJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2MouseJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2MouseJoint.prototype['GetDampingRatio'] = function() {
    return _emscripten_bind_b2MouseJoint__GetDampingRatio_p0(this.ptr);
}
b2MouseJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2MouseJoint__GetCollideConnected_p0(this.ptr);
}
b2MouseJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2MouseJoint____destroy___p0(this.ptr);
}
b2MouseJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2MouseJoint__Dump_p0(this.ptr);
}
b2MouseJoint.prototype['SetTarget'] = function(arg0) {
    _emscripten_bind_b2MouseJoint__SetTarget_p1(this.ptr, arg0.ptr);
}
b2MouseJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2MouseJoint__GetType_p0(this.ptr);
}
b2MouseJoint.prototype['SetDampingRatio'] = function(arg0) {
    _emscripten_bind_b2MouseJoint__SetDampingRatio_p1(this.ptr, arg0);
}
b2MouseJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2MouseJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2MouseJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2MouseJoint__IsActive_p0(this.ptr);
}
b2PulleyJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2PulleyJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2PulleyJoint____destroy___p0(this.ptr);
}
b2PulleyJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2PulleyJoint__GetType_p0(this.ptr);
}
b2PulleyJoint.prototype['GetGroundAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJoint__GetGroundAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2PulleyJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2PulleyJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2PulleyJoint__Dump_p0(this.ptr);
}
b2PulleyJoint.prototype['GetGroundAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJoint__GetGroundAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJoint.prototype['GetLengthB'] = function() {
    return _emscripten_bind_b2PulleyJoint__GetLengthB_p0(this.ptr);
}
b2PulleyJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2PulleyJoint__GetUserData_p0(this.ptr);
}
b2PulleyJoint.prototype['GetLengthA'] = function() {
    return _emscripten_bind_b2PulleyJoint__GetLengthA_p0(this.ptr);
}
b2PulleyJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2PulleyJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2PulleyJoint__GetCollideConnected_p0(this.ptr);
}
b2PulleyJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2PulleyJoint__SetUserData_p1(this.ptr, arg0);
}
b2PulleyJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2PulleyJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2PulleyJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
function b2PulleyJoint(arg0) {
    this.ptr = _emscripten_bind_b2PulleyJoint__b2PulleyJoint_p1(arg0.ptr);
  b2PulleyJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2PulleyJoint;
}
b2PulleyJoint.prototype.__cache__ = {};
Module['b2PulleyJoint'] = b2PulleyJoint;
b2PulleyJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2PulleyJoint__IsActive_p0(this.ptr);
}
b2PulleyJoint.prototype['GetRatio'] = function() {
    return _emscripten_bind_b2PulleyJoint__GetRatio_p0(this.ptr);
}
b2BroadPhase.prototype['GetTreeQuality'] = function() {
    return _emscripten_bind_b2BroadPhase__GetTreeQuality_p0(this.ptr);
}
b2BroadPhase.prototype['GetFatAABB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2BroadPhase__GetFatAABB_p1(this.ptr, arg0), Module['b2AABB']);
}
b2BroadPhase.prototype['GetUserData'] = function(arg0) {
    return _emscripten_bind_b2BroadPhase__GetUserData_p1(this.ptr, arg0);
}
b2BroadPhase.prototype['__destroy__'] = function() {
    _emscripten_bind_b2BroadPhase____destroy___p0(this.ptr);
}
b2BroadPhase.prototype['GetTreeHeight'] = function() {
    return _emscripten_bind_b2BroadPhase__GetTreeHeight_p0(this.ptr);
}
function b2BroadPhase() {
    this.ptr = _emscripten_bind_b2BroadPhase__b2BroadPhase_p0();
  b2BroadPhase.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2BroadPhase;
}
b2BroadPhase.prototype.__cache__ = {};
Module['b2BroadPhase'] = b2BroadPhase;
b2BroadPhase.prototype['GetProxyCount'] = function() {
    return _emscripten_bind_b2BroadPhase__GetProxyCount_p0(this.ptr);
}
b2BroadPhase.prototype['GetTreeBalance'] = function() {
    return _emscripten_bind_b2BroadPhase__GetTreeBalance_p0(this.ptr);
}
b2BroadPhase.prototype['TestOverlap'] = function(arg0, arg1) {
    return _emscripten_bind_b2BroadPhase__TestOverlap_p2(this.ptr, arg0, arg1);
}
b2BroadPhase.prototype['TouchProxy'] = function(arg0) {
    _emscripten_bind_b2BroadPhase__TouchProxy_p1(this.ptr, arg0);
}
b2BroadPhase.prototype['CreateProxy'] = function(arg0, arg1) {
    return _emscripten_bind_b2BroadPhase__CreateProxy_p2(this.ptr, arg0.ptr, arg1);
}
b2BroadPhase.prototype['MoveProxy'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2BroadPhase__MoveProxy_p3(this.ptr, arg0, arg1.ptr, arg2.ptr);
}
b2BroadPhase.prototype['DestroyProxy'] = function(arg0) {
    _emscripten_bind_b2BroadPhase__DestroyProxy_p1(this.ptr, arg0);
}
b2World.prototype['QueryAABB'] = function(arg0, arg1) {
    _emscripten_bind_b2World__QueryAABB_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2World.prototype['SetSubStepping'] = function(arg0) {
    _emscripten_bind_b2World__SetSubStepping_p1(this.ptr, arg0);
}
b2World.prototype['GetTreeQuality'] = function() {
    return _emscripten_bind_b2World__GetTreeQuality_p0(this.ptr);
}
b2World.prototype['GetTreeHeight'] = function() {
    return _emscripten_bind_b2World__GetTreeHeight_p0(this.ptr);
}
b2World.prototype['GetProfile'] = function() {
    return wrapPointer(_emscripten_bind_b2World__GetProfile_p0(this.ptr), Module['b2Profile']);
}
b2World.prototype['GetTreeBalance'] = function() {
    return _emscripten_bind_b2World__GetTreeBalance_p0(this.ptr);
}
b2World.prototype['GetSubStepping'] = function() {
    return _emscripten_bind_b2World__GetSubStepping_p0(this.ptr);
}
b2World.prototype['GetContactManager'] = function() {
    return wrapPointer(_emscripten_bind_b2World__GetContactManager_p0(this.ptr), Module['b2ContactManager']);
}
b2World.prototype['SetContactListener'] = function(arg0) {
    _emscripten_bind_b2World__SetContactListener_p1(this.ptr, arg0.ptr);
}
b2World.prototype['DrawDebugData'] = function() {
    _emscripten_bind_b2World__DrawDebugData_p0(this.ptr);
}
b2World.prototype['SetContinuousPhysics'] = function(arg0) {
    _emscripten_bind_b2World__SetContinuousPhysics_p1(this.ptr, arg0);
}
b2World.prototype['SetGravity'] = function(arg0) {
    _emscripten_bind_b2World__SetGravity_p1(this.ptr, arg0.ptr);
}
b2World.prototype['GetBodyCount'] = function() {
    return _emscripten_bind_b2World__GetBodyCount_p0(this.ptr);
}
b2World.prototype['GetAutoClearForces'] = function() {
    return _emscripten_bind_b2World__GetAutoClearForces_p0(this.ptr);
}
b2World.prototype['GetContinuousPhysics'] = function() {
    return _emscripten_bind_b2World__GetContinuousPhysics_p0(this.ptr);
}
b2World.prototype['GetJointList'] = function() {
    return wrapPointer(_emscripten_bind_b2World__GetJointList_p0(this.ptr), Module['b2Joint']);
}
b2World.prototype['CreateBody'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2World__CreateBody_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2World.prototype['GetBodyList'] = function() {
    return wrapPointer(_emscripten_bind_b2World__GetBodyList_p0(this.ptr), Module['b2Body']);
}
b2World.prototype['SetDestructionListener'] = function(arg0) {
    _emscripten_bind_b2World__SetDestructionListener_p1(this.ptr, arg0.ptr);
}
b2World.prototype['DestroyJoint'] = function(arg0) {
    _emscripten_bind_b2World__DestroyJoint_p1(this.ptr, arg0.ptr);
}
function b2World(arg0) {
    this.ptr = _emscripten_bind_b2World__b2World_p1(arg0.ptr);
  b2World.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2World;
}
b2World.prototype.__cache__ = {};
Module['b2World'] = b2World;
b2World.prototype['GetJointCount'] = function() {
    return _emscripten_bind_b2World__GetJointCount_p0(this.ptr);
}
b2World.prototype['Step'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2World__Step_p3(this.ptr, arg0, arg1, arg2);
}
b2World.prototype['ClearForces'] = function() {
    _emscripten_bind_b2World__ClearForces_p0(this.ptr);
}
b2World.prototype['GetWarmStarting'] = function() {
    return _emscripten_bind_b2World__GetWarmStarting_p0(this.ptr);
}
b2World.prototype['SetAllowSleeping'] = function(arg0) {
    _emscripten_bind_b2World__SetAllowSleeping_p1(this.ptr, arg0);
}
b2World.prototype['DestroyBody'] = function(arg0) {
    _emscripten_bind_b2World__DestroyBody_p1(this.ptr, arg0.ptr);
}
b2World.prototype['GetAllowSleeping'] = function() {
    return _emscripten_bind_b2World__GetAllowSleeping_p0(this.ptr);
}
b2World.prototype['CreateJoint'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2World__CreateJoint_p1(this.ptr, arg0.ptr), Module['b2Joint']);
}
b2World.prototype['GetProxyCount'] = function() {
    return _emscripten_bind_b2World__GetProxyCount_p0(this.ptr);
}
b2World.prototype['RayCast'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2World__RayCast_p3(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr);
}
b2World.prototype['IsLocked'] = function() {
    return _emscripten_bind_b2World__IsLocked_p0(this.ptr);
}
b2World.prototype['GetContactList'] = function() {
    return wrapPointer(_emscripten_bind_b2World__GetContactList_p0(this.ptr), Module['b2Contact']);
}
b2World.prototype['SetDebugDraw'] = function(arg0) {
    _emscripten_bind_b2World__SetDebugDraw_p1(this.ptr, arg0.ptr);
}
b2World.prototype['__destroy__'] = function() {
    _emscripten_bind_b2World____destroy___p0(this.ptr);
}
b2World.prototype['Dump'] = function() {
    _emscripten_bind_b2World__Dump_p0(this.ptr);
}
b2World.prototype['SetAutoClearForces'] = function(arg0) {
    _emscripten_bind_b2World__SetAutoClearForces_p1(this.ptr, arg0);
}
b2World.prototype['GetGravity'] = function() {
    return wrapPointer(_emscripten_bind_b2World__GetGravity_p0(this.ptr), Module['b2Vec2']);
}
b2World.prototype['GetContactCount'] = function() {
    return _emscripten_bind_b2World__GetContactCount_p0(this.ptr);
}
b2World.prototype['SetWarmStarting'] = function(arg0) {
    _emscripten_bind_b2World__SetWarmStarting_p1(this.ptr, arg0);
}
b2World.prototype['SetContactFilter'] = function(arg0) {
    _emscripten_bind_b2World__SetContactFilter_p1(this.ptr, arg0.ptr);
}
b2PrismaticJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2PrismaticJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2PrismaticJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetUserData_p0(this.ptr);
}
b2PrismaticJoint.prototype['GetLocalAxisA'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetLocalAxisA_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJoint.prototype['GetLowerLimit'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetLowerLimit_p0(this.ptr);
}
b2PrismaticJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
function b2PrismaticJoint(arg0) {
    this.ptr = _emscripten_bind_b2PrismaticJoint__b2PrismaticJoint_p1(arg0.ptr);
  b2PrismaticJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2PrismaticJoint;
}
b2PrismaticJoint.prototype.__cache__ = {};
Module['b2PrismaticJoint'] = b2PrismaticJoint;
b2PrismaticJoint.prototype['GetLocalAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetLocalAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJoint.prototype['SetMotorSpeed'] = function(arg0) {
    _emscripten_bind_b2PrismaticJoint__SetMotorSpeed_p1(this.ptr, arg0);
}
b2PrismaticJoint.prototype['GetLocalAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetLocalAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJoint.prototype['GetMotorSpeed'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetMotorSpeed_p0(this.ptr);
}
b2PrismaticJoint.prototype['SetMaxMotorForce'] = function(arg0) {
    _emscripten_bind_b2PrismaticJoint__SetMaxMotorForce_p1(this.ptr, arg0);
}
b2PrismaticJoint.prototype['EnableLimit'] = function(arg0) {
    _emscripten_bind_b2PrismaticJoint__EnableLimit_p1(this.ptr, arg0);
}
b2PrismaticJoint.prototype['IsMotorEnabled'] = function() {
    return _emscripten_bind_b2PrismaticJoint__IsMotorEnabled_p0(this.ptr);
}
b2PrismaticJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2PrismaticJoint__SetUserData_p1(this.ptr, arg0);
}
b2PrismaticJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2PrismaticJoint.prototype['GetMaxMotorForce'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetMaxMotorForce_p0(this.ptr);
}
b2PrismaticJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetCollideConnected_p0(this.ptr);
}
b2PrismaticJoint.prototype['GetJointSpeed'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetJointSpeed_p0(this.ptr);
}
b2PrismaticJoint.prototype['EnableMotor'] = function(arg0) {
    _emscripten_bind_b2PrismaticJoint__EnableMotor_p1(this.ptr, arg0);
}
b2PrismaticJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2PrismaticJoint____destroy___p0(this.ptr);
}
b2PrismaticJoint.prototype['GetReferenceAngle'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetReferenceAngle_p0(this.ptr);
}
b2PrismaticJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2PrismaticJoint__Dump_p0(this.ptr);
}
b2PrismaticJoint.prototype['GetMotorForce'] = function(arg0) {
    return _emscripten_bind_b2PrismaticJoint__GetMotorForce_p1(this.ptr, arg0);
}
b2PrismaticJoint.prototype['GetJointTranslation'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetJointTranslation_p0(this.ptr);
}
b2PrismaticJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetType_p0(this.ptr);
}
b2PrismaticJoint.prototype['IsLimitEnabled'] = function() {
    return _emscripten_bind_b2PrismaticJoint__IsLimitEnabled_p0(this.ptr);
}
b2PrismaticJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2PrismaticJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2PrismaticJoint.prototype['SetLimits'] = function(arg0, arg1) {
    _emscripten_bind_b2PrismaticJoint__SetLimits_p2(this.ptr, arg0, arg1);
}
b2PrismaticJoint.prototype['GetUpperLimit'] = function() {
    return _emscripten_bind_b2PrismaticJoint__GetUpperLimit_p0(this.ptr);
}
b2PrismaticJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2PrismaticJoint__IsActive_p0(this.ptr);
}
b2PrismaticJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2CircleShape.prototype['__destroy__'] = function() {
    _emscripten_bind_b2CircleShape____destroy___p0(this.ptr);
}
b2CircleShape.prototype['GetType'] = function() {
    return _emscripten_bind_b2CircleShape__GetType_p0(this.ptr);
}
b2CircleShape.prototype['ComputeMass'] = function(arg0, arg1) {
    _emscripten_bind_b2CircleShape__ComputeMass_p2(this.ptr, arg0.ptr, arg1);
}
b2CircleShape.prototype['set_m_radius'] = function(arg0) {
    _emscripten_bind_b2CircleShape__set_m_radius_p1(this.ptr, arg0);
}
b2CircleShape.prototype['get_m_radius'] = function() {
    return _emscripten_bind_b2CircleShape__get_m_radius_p0(this.ptr);
}
b2CircleShape.prototype['GetVertex'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2CircleShape__GetVertex_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2CircleShape.prototype['Clone'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2CircleShape__Clone_p1(this.ptr, arg0.ptr), Module['b2Shape']);
}
b2CircleShape.prototype['GetSupportVertex'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2CircleShape__GetSupportVertex_p1(this.ptr, arg0.ptr), Module['b2Vec2']);
}
b2CircleShape.prototype['RayCast'] = function(arg0, arg1, arg2, arg3) {
    return _emscripten_bind_b2CircleShape__RayCast_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3);
}
b2CircleShape.prototype['ComputeAABB'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2CircleShape__ComputeAABB_p3(this.ptr, arg0.ptr, arg1.ptr, arg2);
}
b2CircleShape.prototype['GetVertexCount'] = function() {
    return _emscripten_bind_b2CircleShape__GetVertexCount_p0(this.ptr);
}
b2CircleShape.prototype['GetChildCount'] = function() {
    return _emscripten_bind_b2CircleShape__GetChildCount_p0(this.ptr);
}
b2CircleShape.prototype['TestPoint'] = function(arg0, arg1) {
    return _emscripten_bind_b2CircleShape__TestPoint_p2(this.ptr, arg0.ptr, arg1.ptr);
}
function b2CircleShape() {
    this.ptr = _emscripten_bind_b2CircleShape__b2CircleShape_p0();
  b2CircleShape.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2CircleShape;
}
b2CircleShape.prototype.__cache__ = {};
Module['b2CircleShape'] = b2CircleShape;
b2CircleShape.prototype['GetSupport'] = function(arg0) {
    return _emscripten_bind_b2CircleShape__GetSupport_p1(this.ptr, arg0.ptr);
}
b2CircleShape.prototype['set_m_p'] = function(arg0) {
    _emscripten_bind_b2CircleShape__set_m_p_p1(this.ptr, arg0.ptr);
}
b2CircleShape.prototype['get_m_p'] = function() {
    return wrapPointer(_emscripten_bind_b2CircleShape__get_m_p_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2WheelJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2WheelJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2WheelJoint__GetUserData_p0(this.ptr);
}
b2WheelJoint.prototype['GetDefinition'] = function(arg0) {
    _emscripten_bind_b2WheelJoint__GetDefinition_p1(this.ptr, arg0.ptr);
}
b2WheelJoint.prototype['GetLocalAxisA'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetLocalAxisA_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJoint.prototype['SetSpringDampingRatio'] = function(arg0) {
    _emscripten_bind_b2WheelJoint__SetSpringDampingRatio_p1(this.ptr, arg0);
}
b2WheelJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2WheelJoint.prototype['GetSpringFrequencyHz'] = function() {
    return _emscripten_bind_b2WheelJoint__GetSpringFrequencyHz_p0(this.ptr);
}
b2WheelJoint.prototype['GetLocalAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetLocalAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJoint.prototype['SetMotorSpeed'] = function(arg0) {
    _emscripten_bind_b2WheelJoint__SetMotorSpeed_p1(this.ptr, arg0);
}
b2WheelJoint.prototype['GetLocalAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetLocalAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJoint.prototype['GetMotorSpeed'] = function() {
    return _emscripten_bind_b2WheelJoint__GetMotorSpeed_p0(this.ptr);
}
b2WheelJoint.prototype['GetMotorTorque'] = function(arg0) {
    return _emscripten_bind_b2WheelJoint__GetMotorTorque_p1(this.ptr, arg0);
}
function b2WheelJoint(arg0) {
    this.ptr = _emscripten_bind_b2WheelJoint__b2WheelJoint_p1(arg0.ptr);
  b2WheelJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2WheelJoint;
}
b2WheelJoint.prototype.__cache__ = {};
Module['b2WheelJoint'] = b2WheelJoint;
b2WheelJoint.prototype['IsMotorEnabled'] = function() {
    return _emscripten_bind_b2WheelJoint__IsMotorEnabled_p0(this.ptr);
}
b2WheelJoint.prototype['GetJointTranslation'] = function() {
    return _emscripten_bind_b2WheelJoint__GetJointTranslation_p0(this.ptr);
}
b2WheelJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2WheelJoint__SetUserData_p1(this.ptr, arg0);
}
b2WheelJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2WheelJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2WheelJoint.prototype['GetSpringDampingRatio'] = function() {
    return _emscripten_bind_b2WheelJoint__GetSpringDampingRatio_p0(this.ptr);
}
b2WheelJoint.prototype['SetMaxMotorTorque'] = function(arg0) {
    _emscripten_bind_b2WheelJoint__SetMaxMotorTorque_p1(this.ptr, arg0);
}
b2WheelJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2WheelJoint__GetCollideConnected_p0(this.ptr);
}
b2WheelJoint.prototype['GetJointSpeed'] = function() {
    return _emscripten_bind_b2WheelJoint__GetJointSpeed_p0(this.ptr);
}
b2WheelJoint.prototype['EnableMotor'] = function(arg0) {
    _emscripten_bind_b2WheelJoint__EnableMotor_p1(this.ptr, arg0);
}
b2WheelJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2WheelJoint____destroy___p0(this.ptr);
}
b2WheelJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2WheelJoint__Dump_p0(this.ptr);
}
b2WheelJoint.prototype['GetMaxMotorTorque'] = function() {
    return _emscripten_bind_b2WheelJoint__GetMaxMotorTorque_p0(this.ptr);
}
b2WheelJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2WheelJoint__GetType_p0(this.ptr);
}
b2WheelJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2WheelJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2WheelJoint.prototype['SetSpringFrequencyHz'] = function(arg0) {
    _emscripten_bind_b2WheelJoint__SetSpringFrequencyHz_p1(this.ptr, arg0);
}
b2WheelJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2WheelJoint__IsActive_p0(this.ptr);
}
b2Draw.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Draw____destroy___p0(this.ptr);
}
b2Draw.prototype['AppendFlags'] = function(arg0) {
    _emscripten_bind_b2Draw__AppendFlags_p1(this.ptr, arg0);
}
b2Draw.prototype['DrawTransform'] = function(arg0) {
    _emscripten_bind_b2Draw__DrawTransform_p1(this.ptr, arg0.ptr);
}
b2Draw.prototype['ClearFlags'] = function(arg0) {
    _emscripten_bind_b2Draw__ClearFlags_p1(this.ptr, arg0);
}
b2Draw.prototype['DrawPolygon'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Draw__DrawPolygon_p3(this.ptr, arg0.ptr, arg1, arg2.ptr);
}
b2Draw.prototype['DrawSolidCircle'] = function(arg0, arg1, arg2, arg3) {
    _emscripten_bind_b2Draw__DrawSolidCircle_p4(this.ptr, arg0.ptr, arg1, arg2.ptr, arg3.ptr);
}
b2Draw.prototype['DrawSolidPolygon'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Draw__DrawSolidPolygon_p3(this.ptr, arg0.ptr, arg1, arg2.ptr);
}
b2Draw.prototype['DrawCircle'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Draw__DrawCircle_p3(this.ptr, arg0.ptr, arg1, arg2.ptr);
}
b2Draw.prototype['SetFlags'] = function(arg0) {
    _emscripten_bind_b2Draw__SetFlags_p1(this.ptr, arg0);
}
b2Draw.prototype['DrawSegment'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Draw__DrawSegment_p3(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr);
}
function b2Draw() {
    this.ptr = _emscripten_bind_b2Draw__b2Draw_p0();
  b2Draw.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Draw;
}
b2Draw.prototype.__cache__ = {};
Module['b2Draw'] = b2Draw;
b2Draw.prototype['GetFlags'] = function() {
    return _emscripten_bind_b2Draw__GetFlags_p0(this.ptr);
}
function b2Joint(){ throw "b2Joint is abstract!" }
b2Joint.prototype.__cache__ = {};
Module['b2Joint'] = b2Joint;
b2Joint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2Joint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2Joint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2Joint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2Joint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2Joint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2Joint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2Joint__GetReactionTorque_p1(this.ptr, arg0);
}
b2Joint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2Joint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2Joint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2Joint__GetUserData_p0(this.ptr);
}
b2Joint.prototype['GetType'] = function() {
    return _emscripten_bind_b2Joint__GetType_p0(this.ptr);
}
b2Joint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2Joint__SetUserData_p1(this.ptr, arg0);
}
b2Joint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2Joint__GetCollideConnected_p0(this.ptr);
}
b2Joint.prototype['Dump'] = function() {
    _emscripten_bind_b2Joint__Dump_p0(this.ptr);
}
b2Joint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2Joint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2Joint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Joint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2Joint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2Joint__IsActive_p0(this.ptr);
}
b2GearJoint.prototype['GetJoint1'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJoint__GetJoint1_p0(this.ptr), Module['b2Joint']);
}
function b2GearJoint(arg0) {
    this.ptr = _emscripten_bind_b2GearJoint__b2GearJoint_p1(arg0.ptr);
  b2GearJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2GearJoint;
}
b2GearJoint.prototype.__cache__ = {};
Module['b2GearJoint'] = b2GearJoint;
b2GearJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2GearJoint.prototype['GetJoint2'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJoint__GetJoint2_p0(this.ptr), Module['b2Joint']);
}
b2GearJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2GearJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2GearJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2GearJoint__Dump_p0(this.ptr);
}
b2GearJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2GearJoint____destroy___p0(this.ptr);
}
b2GearJoint.prototype['SetRatio'] = function(arg0) {
    _emscripten_bind_b2GearJoint__SetRatio_p1(this.ptr, arg0);
}
b2GearJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2GearJoint__GetType_p0(this.ptr);
}
b2GearJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2GearJoint__GetUserData_p0(this.ptr);
}
b2GearJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2GearJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2GearJoint__GetCollideConnected_p0(this.ptr);
}
b2GearJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2GearJoint__SetUserData_p1(this.ptr, arg0);
}
b2GearJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2GearJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2GearJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2GearJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2GearJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2GearJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2GearJoint__IsActive_p0(this.ptr);
}
b2GearJoint.prototype['GetRatio'] = function() {
    return _emscripten_bind_b2GearJoint__GetRatio_p0(this.ptr);
}
b2RayCastCallback.prototype['ReportFixture'] = function(arg0, arg1, arg2, arg3) {
    return _emscripten_bind_b2RayCastCallback__ReportFixture_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3);
}
function b2RayCastCallback() {
    this.ptr = _emscripten_bind_b2RayCastCallback__b2RayCastCallback_p0();
  b2RayCastCallback.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2RayCastCallback;
}
b2RayCastCallback.prototype.__cache__ = {};
Module['b2RayCastCallback'] = b2RayCastCallback;
b2RayCastCallback.prototype['__destroy__'] = function() {
    _emscripten_bind_b2RayCastCallback____destroy___p0(this.ptr);
}
b2DynamicTree.prototype['__destroy__'] = function() {
    _emscripten_bind_b2DynamicTree____destroy___p0(this.ptr);
}
function b2DynamicTree() {
    this.ptr = _emscripten_bind_b2DynamicTree__b2DynamicTree_p0();
  b2DynamicTree.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2DynamicTree;
}
b2DynamicTree.prototype.__cache__ = {};
Module['b2DynamicTree'] = b2DynamicTree;
b2DynamicTree.prototype['GetFatAABB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2DynamicTree__GetFatAABB_p1(this.ptr, arg0), Module['b2AABB']);
}
b2DynamicTree.prototype['GetUserData'] = function(arg0) {
    return _emscripten_bind_b2DynamicTree__GetUserData_p1(this.ptr, arg0);
}
b2DynamicTree.prototype['GetMaxBalance'] = function() {
    return _emscripten_bind_b2DynamicTree__GetMaxBalance_p0(this.ptr);
}
b2DynamicTree.prototype['GetHeight'] = function() {
    return _emscripten_bind_b2DynamicTree__GetHeight_p0(this.ptr);
}
b2DynamicTree.prototype['GetAreaRatio'] = function() {
    return _emscripten_bind_b2DynamicTree__GetAreaRatio_p0(this.ptr);
}
b2DynamicTree.prototype['RebuildBottomUp'] = function() {
    _emscripten_bind_b2DynamicTree__RebuildBottomUp_p0(this.ptr);
}
b2DynamicTree.prototype['CreateProxy'] = function(arg0, arg1) {
    return _emscripten_bind_b2DynamicTree__CreateProxy_p2(this.ptr, arg0.ptr, arg1);
}
b2DynamicTree.prototype['MoveProxy'] = function(arg0, arg1, arg2) {
    return _emscripten_bind_b2DynamicTree__MoveProxy_p3(this.ptr, arg0, arg1.ptr, arg2.ptr);
}
b2DynamicTree.prototype['Validate'] = function() {
    _emscripten_bind_b2DynamicTree__Validate_p0(this.ptr);
}
b2DynamicTree.prototype['DestroyProxy'] = function(arg0) {
    _emscripten_bind_b2DynamicTree__DestroyProxy_p1(this.ptr, arg0);
}
b2WeldJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2WeldJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2WeldJoint.prototype['SetFrequency'] = function(arg0) {
    _emscripten_bind_b2WeldJoint__SetFrequency_p1(this.ptr, arg0);
}
b2WeldJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2WeldJoint__GetUserData_p0(this.ptr);
}
b2WeldJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2WeldJoint__SetUserData_p1(this.ptr, arg0);
}
b2WeldJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2WeldJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2WeldJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2WeldJoint.prototype['GetLocalAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJoint__GetLocalAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2WeldJoint.prototype['GetLocalAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJoint__GetLocalAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2WeldJoint.prototype['GetFrequency'] = function() {
    return _emscripten_bind_b2WeldJoint__GetFrequency_p0(this.ptr);
}
function b2WeldJoint(arg0) {
    this.ptr = _emscripten_bind_b2WeldJoint__b2WeldJoint_p1(arg0.ptr);
  b2WeldJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2WeldJoint;
}
b2WeldJoint.prototype.__cache__ = {};
Module['b2WeldJoint'] = b2WeldJoint;
b2WeldJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2WeldJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2WeldJoint.prototype['GetDampingRatio'] = function() {
    return _emscripten_bind_b2WeldJoint__GetDampingRatio_p0(this.ptr);
}
b2WeldJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2WeldJoint__GetCollideConnected_p0(this.ptr);
}
b2WeldJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2WeldJoint____destroy___p0(this.ptr);
}
b2WeldJoint.prototype['GetReferenceAngle'] = function() {
    return _emscripten_bind_b2WeldJoint__GetReferenceAngle_p0(this.ptr);
}
b2WeldJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2WeldJoint__Dump_p0(this.ptr);
}
b2WeldJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2WeldJoint__GetType_p0(this.ptr);
}
b2WeldJoint.prototype['SetDampingRatio'] = function(arg0) {
    _emscripten_bind_b2WeldJoint__SetDampingRatio_p1(this.ptr, arg0);
}
b2WeldJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2WeldJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2WeldJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2WeldJoint__IsActive_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2RevoluteJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2RevoluteJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetUserData_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetLowerLimit'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetLowerLimit_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
function b2RevoluteJoint(arg0) {
    this.ptr = _emscripten_bind_b2RevoluteJoint__b2RevoluteJoint_p1(arg0.ptr);
  b2RevoluteJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2RevoluteJoint;
}
b2RevoluteJoint.prototype.__cache__ = {};
Module['b2RevoluteJoint'] = b2RevoluteJoint;
b2RevoluteJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2RevoluteJoint.prototype['GetLocalAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJoint__GetLocalAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2RevoluteJoint.prototype['SetMotorSpeed'] = function(arg0) {
    _emscripten_bind_b2RevoluteJoint__SetMotorSpeed_p1(this.ptr, arg0);
}
b2RevoluteJoint.prototype['GetLocalAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJoint__GetLocalAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2RevoluteJoint.prototype['GetJointAngle'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetJointAngle_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetMotorSpeed'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetMotorSpeed_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetMotorTorque'] = function(arg0) {
    return _emscripten_bind_b2RevoluteJoint__GetMotorTorque_p1(this.ptr, arg0);
}
b2RevoluteJoint.prototype['IsLimitEnabled'] = function() {
    return _emscripten_bind_b2RevoluteJoint__IsLimitEnabled_p0(this.ptr);
}
b2RevoluteJoint.prototype['EnableLimit'] = function(arg0) {
    _emscripten_bind_b2RevoluteJoint__EnableLimit_p1(this.ptr, arg0);
}
b2RevoluteJoint.prototype['IsMotorEnabled'] = function() {
    return _emscripten_bind_b2RevoluteJoint__IsMotorEnabled_p0(this.ptr);
}
b2RevoluteJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2RevoluteJoint__SetUserData_p1(this.ptr, arg0);
}
b2RevoluteJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2RevoluteJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2RevoluteJoint.prototype['SetMaxMotorTorque'] = function(arg0) {
    _emscripten_bind_b2RevoluteJoint__SetMaxMotorTorque_p1(this.ptr, arg0);
}
b2RevoluteJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetCollideConnected_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetJointSpeed'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetJointSpeed_p0(this.ptr);
}
b2RevoluteJoint.prototype['EnableMotor'] = function(arg0) {
    _emscripten_bind_b2RevoluteJoint__EnableMotor_p1(this.ptr, arg0);
}
b2RevoluteJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2RevoluteJoint____destroy___p0(this.ptr);
}
b2RevoluteJoint.prototype['GetReferenceAngle'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetReferenceAngle_p0(this.ptr);
}
b2RevoluteJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2RevoluteJoint__Dump_p0(this.ptr);
}
b2RevoluteJoint.prototype['SetLimits'] = function(arg0, arg1) {
    _emscripten_bind_b2RevoluteJoint__SetLimits_p2(this.ptr, arg0, arg1);
}
b2RevoluteJoint.prototype['GetMaxMotorTorque'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetMaxMotorTorque_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetType_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2RevoluteJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2RevoluteJoint.prototype['GetUpperLimit'] = function() {
    return _emscripten_bind_b2RevoluteJoint__GetUpperLimit_p0(this.ptr);
}
b2RevoluteJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2RevoluteJoint__IsActive_p0(this.ptr);
}
b2RevoluteJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
function b2Timer() {
    this.ptr = _emscripten_bind_b2Timer__b2Timer_p0();
  b2Timer.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Timer;
}
b2Timer.prototype.__cache__ = {};
Module['b2Timer'] = b2Timer;
b2Timer.prototype['Reset'] = function() {
    _emscripten_bind_b2Timer__Reset_p0(this.ptr);
}
b2Timer.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Timer____destroy___p0(this.ptr);
}
b2Timer.prototype['GetMilliseconds'] = function() {
    return _emscripten_bind_b2Timer__GetMilliseconds_p0(this.ptr);
}
b2ContactListener.prototype['__destroy__'] = function() {
    _emscripten_bind_b2ContactListener____destroy___p0(this.ptr);
}
function b2ContactListener() {
    this.ptr = _emscripten_bind_b2ContactListener__b2ContactListener_p0();
  b2ContactListener.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2ContactListener;
}
b2ContactListener.prototype.__cache__ = {};
Module['b2ContactListener'] = b2ContactListener;
b2ContactListener.prototype['EndContact'] = function(arg0) {
    _emscripten_bind_b2ContactListener__EndContact_p1(this.ptr, arg0.ptr);
}
b2ContactListener.prototype['BeginContact'] = function(arg0) {
    _emscripten_bind_b2ContactListener__BeginContact_p1(this.ptr, arg0.ptr);
}
b2ContactListener.prototype['PreSolve'] = function(arg0, arg1) {
    _emscripten_bind_b2ContactListener__PreSolve_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2ContactListener.prototype['PostSolve'] = function(arg0, arg1) {
    _emscripten_bind_b2ContactListener__PostSolve_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2ChainShape.prototype['__destroy__'] = function() {
    _emscripten_bind_b2ChainShape____destroy___p0(this.ptr);
}
b2ChainShape.prototype['GetType'] = function() {
    return _emscripten_bind_b2ChainShape__GetType_p0(this.ptr);
}
b2ChainShape.prototype['CreateChain'] = function(arg0, arg1) {
    _emscripten_bind_b2ChainShape__CreateChain_p2(this.ptr, arg0.ptr, arg1);
}
b2ChainShape.prototype['set_m_radius'] = function(arg0) {
    _emscripten_bind_b2ChainShape__set_m_radius_p1(this.ptr, arg0);
}
b2ChainShape.prototype['get_m_radius'] = function() {
    return _emscripten_bind_b2ChainShape__get_m_radius_p0(this.ptr);
}
b2ChainShape.prototype['get_m_vertices'] = function() {
    return wrapPointer(_emscripten_bind_b2ChainShape__get_m_vertices_p0(this.ptr), Module['b2Vec2']);
}
b2ChainShape.prototype['ComputeMass'] = function(arg0, arg1) {
    _emscripten_bind_b2ChainShape__ComputeMass_p2(this.ptr, arg0.ptr, arg1);
}
b2ChainShape.prototype['Clone'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2ChainShape__Clone_p1(this.ptr, arg0.ptr), Module['b2Shape']);
}
b2ChainShape.prototype['get_m_count'] = function() {
    return _emscripten_bind_b2ChainShape__get_m_count_p0(this.ptr);
}
b2ChainShape.prototype['GetChildEdge'] = function(arg0, arg1) {
    _emscripten_bind_b2ChainShape__GetChildEdge_p2(this.ptr, arg0.ptr, arg1);
}
function b2ChainShape() {
    this.ptr = _emscripten_bind_b2ChainShape__b2ChainShape_p0();
  b2ChainShape.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2ChainShape;
}
b2ChainShape.prototype.__cache__ = {};
Module['b2ChainShape'] = b2ChainShape;
b2ChainShape.prototype['ComputeAABB'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2ChainShape__ComputeAABB_p3(this.ptr, arg0.ptr, arg1.ptr, arg2);
}
b2ChainShape.prototype['RayCast'] = function(arg0, arg1, arg2, arg3) {
    return _emscripten_bind_b2ChainShape__RayCast_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3);
}
b2ChainShape.prototype['GetChildCount'] = function() {
    return _emscripten_bind_b2ChainShape__GetChildCount_p0(this.ptr);
}
b2ChainShape.prototype['TestPoint'] = function(arg0, arg1) {
    return _emscripten_bind_b2ChainShape__TestPoint_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2ChainShape.prototype['SetPrevVertex'] = function(arg0) {
    _emscripten_bind_b2ChainShape__SetPrevVertex_p1(this.ptr, arg0.ptr);
}
b2ChainShape.prototype['CreateLoop'] = function(arg0, arg1) {
    _emscripten_bind_b2ChainShape__CreateLoop_p2(this.ptr, arg0.ptr, arg1);
}
b2ChainShape.prototype['set_m_vertices'] = function(arg0) {
    _emscripten_bind_b2ChainShape__set_m_vertices_p1(this.ptr, arg0.ptr);
}
b2ChainShape.prototype['SetNextVertex'] = function(arg0) {
    _emscripten_bind_b2ChainShape__SetNextVertex_p1(this.ptr, arg0.ptr);
}
b2ChainShape.prototype['set_m_count'] = function(arg0) {
    _emscripten_bind_b2ChainShape__set_m_count_p1(this.ptr, arg0);
}
b2QueryCallback.prototype['ReportFixture'] = function(arg0) {
    return _emscripten_bind_b2QueryCallback__ReportFixture_p1(this.ptr, arg0.ptr);
}
b2QueryCallback.prototype['__destroy__'] = function() {
    _emscripten_bind_b2QueryCallback____destroy___p0(this.ptr);
}
function b2QueryCallback() {
    this.ptr = _emscripten_bind_b2QueryCallback__b2QueryCallback_p0();
  b2QueryCallback.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2QueryCallback;
}
b2QueryCallback.prototype.__cache__ = {};
Module['b2QueryCallback'] = b2QueryCallback;
b2BlockAllocator.prototype['__destroy__'] = function() {
    _emscripten_bind_b2BlockAllocator____destroy___p0(this.ptr);
}
b2BlockAllocator.prototype['Clear'] = function() {
    _emscripten_bind_b2BlockAllocator__Clear_p0(this.ptr);
}
b2BlockAllocator.prototype['Free'] = function(arg0, arg1) {
    _emscripten_bind_b2BlockAllocator__Free_p2(this.ptr, arg0, arg1);
}
b2BlockAllocator.prototype['Allocate'] = function(arg0) {
    return _emscripten_bind_b2BlockAllocator__Allocate_p1(this.ptr, arg0);
}
function b2BlockAllocator() {
    this.ptr = _emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0();
  b2BlockAllocator.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2BlockAllocator;
}
b2BlockAllocator.prototype.__cache__ = {};
Module['b2BlockAllocator'] = b2BlockAllocator;
b2RopeJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2RopeJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2RopeJoint____destroy___p0(this.ptr);
}
b2RopeJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2RopeJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2RopeJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2RopeJoint.prototype['GetMaxLength'] = function() {
    return _emscripten_bind_b2RopeJoint__GetMaxLength_p0(this.ptr);
}
b2RopeJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2RopeJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2RopeJoint__GetCollideConnected_p0(this.ptr);
}
b2RopeJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2RopeJoint__GetUserData_p0(this.ptr);
}
b2RopeJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2RopeJoint__GetType_p0(this.ptr);
}
b2RopeJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2RopeJoint.prototype['GetLocalAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJoint__GetLocalAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2RopeJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2RopeJoint__Dump_p0(this.ptr);
}
b2RopeJoint.prototype['SetMaxLength'] = function(arg0) {
    _emscripten_bind_b2RopeJoint__SetMaxLength_p1(this.ptr, arg0);
}
b2RopeJoint.prototype['GetLocalAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJoint__GetLocalAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2RopeJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2RopeJoint__SetUserData_p1(this.ptr, arg0);
}
b2RopeJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2RopeJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2RopeJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
function b2RopeJoint(arg0) {
    this.ptr = _emscripten_bind_b2RopeJoint__b2RopeJoint_p1(arg0.ptr);
  b2RopeJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2RopeJoint;
}
b2RopeJoint.prototype.__cache__ = {};
Module['b2RopeJoint'] = b2RopeJoint;
b2RopeJoint.prototype['GetLimitState'] = function() {
    return _emscripten_bind_b2RopeJoint__GetLimitState_p0(this.ptr);
}
b2RopeJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2RopeJoint__IsActive_p0(this.ptr);
}
b2PolygonShape.prototype['__destroy__'] = function() {
    _emscripten_bind_b2PolygonShape____destroy___p0(this.ptr);
}
b2PolygonShape.prototype['Set'] = function(arg0, arg1) {
    _emscripten_bind_b2PolygonShape__Set_p2(this.ptr, arg0.ptr, arg1);
}
b2PolygonShape.prototype['ComputeMass'] = function(arg0, arg1) {
    _emscripten_bind_b2PolygonShape__ComputeMass_p2(this.ptr, arg0.ptr, arg1);
}
b2PolygonShape.prototype['set_m_radius'] = function(arg0) {
    _emscripten_bind_b2PolygonShape__set_m_radius_p1(this.ptr, arg0);
}
b2PolygonShape.prototype['get_m_radius'] = function() {
    return _emscripten_bind_b2PolygonShape__get_m_radius_p0(this.ptr);
}
b2PolygonShape.prototype['Clone'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2PolygonShape__Clone_p1(this.ptr, arg0.ptr), Module['b2Shape']);
}
b2PolygonShape.prototype['GetVertex'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2PolygonShape__GetVertex_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2PolygonShape.prototype['RayCast'] = function(arg0, arg1, arg2, arg3) {
    return _emscripten_bind_b2PolygonShape__RayCast_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3);
}
b2PolygonShape.prototype['SetAsBox'] = function(arg0, arg1, arg2, arg3) {
  if (arg2 === undefined)
    _emscripten_bind_b2PolygonShape__SetAsBox_p2(this.ptr, arg0, arg1);
  else 
    _emscripten_bind_b2PolygonShape__SetAsBox_p4(this.ptr, arg0, arg1, arg2.ptr, arg3);
}
b2PolygonShape.prototype['set_m_centroid'] = function(arg0) {
    _emscripten_bind_b2PolygonShape__set_m_centroid_p1(this.ptr, arg0.ptr);
}
b2PolygonShape.prototype['ComputeAABB'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2PolygonShape__ComputeAABB_p3(this.ptr, arg0.ptr, arg1.ptr, arg2);
}
b2PolygonShape.prototype['set_m_vertexCount'] = function(arg0) {
    _emscripten_bind_b2PolygonShape__set_m_vertexCount_p1(this.ptr, arg0);
}
b2PolygonShape.prototype['GetVertexCount'] = function() {
    return _emscripten_bind_b2PolygonShape__GetVertexCount_p0(this.ptr);
}
b2PolygonShape.prototype['GetChildCount'] = function() {
    return _emscripten_bind_b2PolygonShape__GetChildCount_p0(this.ptr);
}
b2PolygonShape.prototype['TestPoint'] = function(arg0, arg1) {
    return _emscripten_bind_b2PolygonShape__TestPoint_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2PolygonShape.prototype['GetType'] = function() {
    return _emscripten_bind_b2PolygonShape__GetType_p0(this.ptr);
}
function b2PolygonShape() {
    this.ptr = _emscripten_bind_b2PolygonShape__b2PolygonShape_p0();
  b2PolygonShape.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2PolygonShape;
}
b2PolygonShape.prototype.__cache__ = {};
Module['b2PolygonShape'] = b2PolygonShape;
b2PolygonShape.prototype['get_m_vertexCount'] = function() {
    return _emscripten_bind_b2PolygonShape__get_m_vertexCount_p0(this.ptr);
}
b2PolygonShape.prototype['get_m_centroid'] = function() {
    return wrapPointer(_emscripten_bind_b2PolygonShape__get_m_centroid_p0(this.ptr), Module['b2Vec2']);
}
b2EdgeShape.prototype['__destroy__'] = function() {
    _emscripten_bind_b2EdgeShape____destroy___p0(this.ptr);
}
b2EdgeShape.prototype['Set'] = function(arg0, arg1) {
    _emscripten_bind_b2EdgeShape__Set_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2EdgeShape.prototype['ComputeMass'] = function(arg0, arg1) {
    _emscripten_bind_b2EdgeShape__ComputeMass_p2(this.ptr, arg0.ptr, arg1);
}
b2EdgeShape.prototype['set_m_radius'] = function(arg0) {
    _emscripten_bind_b2EdgeShape__set_m_radius_p1(this.ptr, arg0);
}
b2EdgeShape.prototype['get_m_radius'] = function() {
    return _emscripten_bind_b2EdgeShape__get_m_radius_p0(this.ptr);
}
b2EdgeShape.prototype['Clone'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2EdgeShape__Clone_p1(this.ptr, arg0.ptr), Module['b2Shape']);
}
b2EdgeShape.prototype['GetType'] = function() {
    return _emscripten_bind_b2EdgeShape__GetType_p0(this.ptr);
}
b2EdgeShape.prototype['RayCast'] = function(arg0, arg1, arg2, arg3) {
    return _emscripten_bind_b2EdgeShape__RayCast_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3);
}
b2EdgeShape.prototype['ComputeAABB'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2EdgeShape__ComputeAABB_p3(this.ptr, arg0.ptr, arg1.ptr, arg2);
}
b2EdgeShape.prototype['GetChildCount'] = function() {
    return _emscripten_bind_b2EdgeShape__GetChildCount_p0(this.ptr);
}
b2EdgeShape.prototype['TestPoint'] = function(arg0, arg1) {
    return _emscripten_bind_b2EdgeShape__TestPoint_p2(this.ptr, arg0.ptr, arg1.ptr);
}
function b2EdgeShape() {
    this.ptr = _emscripten_bind_b2EdgeShape__b2EdgeShape_p0();
  b2EdgeShape.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2EdgeShape;
}
b2EdgeShape.prototype.__cache__ = {};
Module['b2EdgeShape'] = b2EdgeShape;
function b2Contact(){ throw "b2Contact is abstract!" }
b2Contact.prototype.__cache__ = {};
Module['b2Contact'] = b2Contact;
b2Contact.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2Contact__GetNext_p0(this.ptr), Module['b2Contact']);
}
b2Contact.prototype['SetEnabled'] = function(arg0) {
    _emscripten_bind_b2Contact__SetEnabled_p1(this.ptr, arg0);
}
b2Contact.prototype['GetWorldManifold'] = function(arg0) {
    _emscripten_bind_b2Contact__GetWorldManifold_p1(this.ptr, arg0.ptr);
}
b2Contact.prototype['GetRestitution'] = function() {
    return _emscripten_bind_b2Contact__GetRestitution_p0(this.ptr);
}
b2Contact.prototype['ResetFriction'] = function() {
    _emscripten_bind_b2Contact__ResetFriction_p0(this.ptr);
}
b2Contact.prototype['GetFriction'] = function() {
    return _emscripten_bind_b2Contact__GetFriction_p0(this.ptr);
}
b2Contact.prototype['IsTouching'] = function() {
    return _emscripten_bind_b2Contact__IsTouching_p0(this.ptr);
}
b2Contact.prototype['IsEnabled'] = function() {
    return _emscripten_bind_b2Contact__IsEnabled_p0(this.ptr);
}
b2Contact.prototype['GetFixtureB'] = function() {
    return wrapPointer(_emscripten_bind_b2Contact__GetFixtureB_p0(this.ptr), Module['b2Fixture']);
}
b2Contact.prototype['SetFriction'] = function(arg0) {
    _emscripten_bind_b2Contact__SetFriction_p1(this.ptr, arg0);
}
b2Contact.prototype['GetFixtureA'] = function() {
    return wrapPointer(_emscripten_bind_b2Contact__GetFixtureA_p0(this.ptr), Module['b2Fixture']);
}
b2Contact.prototype['GetChildIndexA'] = function() {
    return _emscripten_bind_b2Contact__GetChildIndexA_p0(this.ptr);
}
b2Contact.prototype['GetChildIndexB'] = function() {
    return _emscripten_bind_b2Contact__GetChildIndexB_p0(this.ptr);
}
b2Contact.prototype['Evaluate'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Contact__Evaluate_p3(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr);
}
b2Contact.prototype['SetRestitution'] = function(arg0) {
    _emscripten_bind_b2Contact__SetRestitution_p1(this.ptr, arg0);
}
b2Contact.prototype['GetManifold'] = function() {
    return wrapPointer(_emscripten_bind_b2Contact__GetManifold_p0(this.ptr), Module['b2Manifold']);
}
b2Contact.prototype['ResetRestitution'] = function() {
    _emscripten_bind_b2Contact__ResetRestitution_p0(this.ptr);
}
function b2Shape(){ throw "b2Shape is abstract!" }
b2Shape.prototype.__cache__ = {};
Module['b2Shape'] = b2Shape;
b2Shape.prototype['get_m_radius'] = function() {
    return _emscripten_bind_b2Shape__get_m_radius_p0(this.ptr);
}
b2Shape.prototype['ComputeMass'] = function(arg0, arg1) {
    _emscripten_bind_b2Shape__ComputeMass_p2(this.ptr, arg0.ptr, arg1);
}
b2Shape.prototype['set_m_radius'] = function(arg0) {
    _emscripten_bind_b2Shape__set_m_radius_p1(this.ptr, arg0);
}
b2Shape.prototype['Clone'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Shape__Clone_p1(this.ptr, arg0.ptr), Module['b2Shape']);
}
b2Shape.prototype['GetType'] = function() {
    return _emscripten_bind_b2Shape__GetType_p0(this.ptr);
}
b2Shape.prototype['RayCast'] = function(arg0, arg1, arg2, arg3) {
    return _emscripten_bind_b2Shape__RayCast_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3);
}
b2Shape.prototype['ComputeAABB'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Shape__ComputeAABB_p3(this.ptr, arg0.ptr, arg1.ptr, arg2);
}
b2Shape.prototype['GetChildCount'] = function() {
    return _emscripten_bind_b2Shape__GetChildCount_p0(this.ptr);
}
b2Shape.prototype['TestPoint'] = function(arg0, arg1) {
    return _emscripten_bind_b2Shape__TestPoint_p2(this.ptr, arg0.ptr, arg1.ptr);
}
function b2Body(){ throw "b2Body is abstract!" }
b2Body.prototype.__cache__ = {};
Module['b2Body'] = b2Body;
b2Body.prototype['GetAngle'] = function() {
    return _emscripten_bind_b2Body__GetAngle_p0(this.ptr);
}
b2Body.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2Body__GetUserData_p0(this.ptr);
}
b2Body.prototype['IsSleepingAllowed'] = function() {
    return _emscripten_bind_b2Body__IsSleepingAllowed_p0(this.ptr);
}
b2Body.prototype['SetAngularDamping'] = function(arg0) {
    _emscripten_bind_b2Body__SetAngularDamping_p1(this.ptr, arg0);
}
b2Body.prototype['SetActive'] = function(arg0) {
    _emscripten_bind_b2Body__SetActive_p1(this.ptr, arg0);
}
b2Body.prototype['SetGravityScale'] = function(arg0) {
    _emscripten_bind_b2Body__SetGravityScale_p1(this.ptr, arg0);
}
b2Body.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2Body__SetUserData_p1(this.ptr, arg0);
}
b2Body.prototype['GetAngularVelocity'] = function() {
    return _emscripten_bind_b2Body__GetAngularVelocity_p0(this.ptr);
}
b2Body.prototype['GetFixtureList'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetFixtureList_p0(this.ptr), Module['b2Fixture']);
}
b2Body.prototype['ApplyForce'] = function(arg0, arg1) {
    _emscripten_bind_b2Body__ApplyForce_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2Body.prototype['GetLocalPoint'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Body__GetLocalPoint_p1(this.ptr, arg0.ptr), Module['b2Vec2']);
}
b2Body.prototype['SetLinearVelocity'] = function(arg0) {
    _emscripten_bind_b2Body__SetLinearVelocity_p1(this.ptr, arg0.ptr);
}
b2Body.prototype['GetJointList'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetJointList_p0(this.ptr), Module['b2JointEdge']);
}
b2Body.prototype['GetLinearVelocity'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetLinearVelocity_p0(this.ptr), Module['b2Vec2']);
}
b2Body.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetNext_p0(this.ptr), Module['b2Body']);
}
b2Body.prototype['SetSleepingAllowed'] = function(arg0) {
    _emscripten_bind_b2Body__SetSleepingAllowed_p1(this.ptr, arg0);
}
b2Body.prototype['SetTransform'] = function(arg0, arg1) {
    _emscripten_bind_b2Body__SetTransform_p2(this.ptr, arg0.ptr, arg1);
}
b2Body.prototype['GetMass'] = function() {
    return _emscripten_bind_b2Body__GetMass_p0(this.ptr);
}
b2Body.prototype['SetAngularVelocity'] = function(arg0) {
    _emscripten_bind_b2Body__SetAngularVelocity_p1(this.ptr, arg0);
}
b2Body.prototype['GetMassData'] = function(arg0) {
    _emscripten_bind_b2Body__GetMassData_p1(this.ptr, arg0.ptr);
}
b2Body.prototype['GetLinearVelocityFromWorldPoint'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1(this.ptr, arg0.ptr), Module['b2Vec2']);
}
b2Body.prototype['ResetMassData'] = function() {
    _emscripten_bind_b2Body__ResetMassData_p0(this.ptr);
}
b2Body.prototype['ApplyForceToCenter'] = function(arg0) {
    _emscripten_bind_b2Body__ApplyForceToCenter_p1(this.ptr, arg0.ptr);
}
b2Body.prototype['ApplyTorque'] = function(arg0) {
    _emscripten_bind_b2Body__ApplyTorque_p1(this.ptr, arg0);
}
b2Body.prototype['IsAwake'] = function() {
    return _emscripten_bind_b2Body__IsAwake_p0(this.ptr);
}
b2Body.prototype['SetType'] = function(arg0) {
    _emscripten_bind_b2Body__SetType_p1(this.ptr, arg0);
}
b2Body.prototype['CreateFixture'] = function(arg0, arg1) {
  if (arg1 === undefined)
    return wrapPointer(_emscripten_bind_b2Body__CreateFixture_p1(this.ptr, arg0.ptr), Module['b2Fixture']);
  else 
    return wrapPointer(_emscripten_bind_b2Body__CreateFixture_p2(this.ptr, arg0.ptr, arg1), Module['b2Fixture']);
}
b2Body.prototype['SetMassData'] = function(arg0) {
    _emscripten_bind_b2Body__SetMassData_p1(this.ptr, arg0.ptr);
}
b2Body.prototype['GetTransform'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetTransform_p0(this.ptr), Module['b2Transform']);
}
b2Body.prototype['GetWorldCenter'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetWorldCenter_p0(this.ptr), Module['b2Vec2']);
}
b2Body.prototype['GetAngularDamping'] = function() {
    return _emscripten_bind_b2Body__GetAngularDamping_p0(this.ptr);
}
b2Body.prototype['ApplyLinearImpulse'] = function(arg0, arg1) {
    _emscripten_bind_b2Body__ApplyLinearImpulse_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2Body.prototype['IsFixedRotation'] = function() {
    return _emscripten_bind_b2Body__IsFixedRotation_p0(this.ptr);
}
b2Body.prototype['GetLocalCenter'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetLocalCenter_p0(this.ptr), Module['b2Vec2']);
}
b2Body.prototype['GetWorldVector'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Body__GetWorldVector_p1(this.ptr, arg0.ptr), Module['b2Vec2']);
}
b2Body.prototype['GetLinearVelocityFromLocalPoint'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1(this.ptr, arg0.ptr), Module['b2Vec2']);
}
b2Body.prototype['GetContactList'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetContactList_p0(this.ptr), Module['b2ContactEdge']);
}
b2Body.prototype['GetWorldPoint'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Body__GetWorldPoint_p1(this.ptr, arg0.ptr), Module['b2Vec2']);
}
b2Body.prototype['SetAwake'] = function(arg0) {
    _emscripten_bind_b2Body__SetAwake_p1(this.ptr, arg0);
}
b2Body.prototype['GetLinearDamping'] = function() {
    return _emscripten_bind_b2Body__GetLinearDamping_p0(this.ptr);
}
b2Body.prototype['IsBullet'] = function() {
    return _emscripten_bind_b2Body__IsBullet_p0(this.ptr);
}
b2Body.prototype['GetWorld'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetWorld_p0(this.ptr), Module['b2World']);
}
b2Body.prototype['GetLocalVector'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2Body__GetLocalVector_p1(this.ptr, arg0.ptr), Module['b2Vec2']);
}
b2Body.prototype['SetLinearDamping'] = function(arg0) {
    _emscripten_bind_b2Body__SetLinearDamping_p1(this.ptr, arg0);
}
b2Body.prototype['Dump'] = function() {
    _emscripten_bind_b2Body__Dump_p0(this.ptr);
}
b2Body.prototype['SetBullet'] = function(arg0) {
    _emscripten_bind_b2Body__SetBullet_p1(this.ptr, arg0);
}
b2Body.prototype['GetType'] = function() {
    return _emscripten_bind_b2Body__GetType_p0(this.ptr);
}
b2Body.prototype['GetGravityScale'] = function() {
    return _emscripten_bind_b2Body__GetGravityScale_p0(this.ptr);
}
b2Body.prototype['DestroyFixture'] = function(arg0) {
    _emscripten_bind_b2Body__DestroyFixture_p1(this.ptr, arg0.ptr);
}
b2Body.prototype['GetInertia'] = function() {
    return _emscripten_bind_b2Body__GetInertia_p0(this.ptr);
}
b2Body.prototype['IsActive'] = function() {
    return _emscripten_bind_b2Body__IsActive_p0(this.ptr);
}
b2Body.prototype['SetFixedRotation'] = function(arg0) {
    _emscripten_bind_b2Body__SetFixedRotation_p1(this.ptr, arg0);
}
b2Body.prototype['ApplyAngularImpulse'] = function(arg0) {
    _emscripten_bind_b2Body__ApplyAngularImpulse_p1(this.ptr, arg0);
}
b2Body.prototype['GetPosition'] = function() {
    return wrapPointer(_emscripten_bind_b2Body__GetPosition_p0(this.ptr), Module['b2Vec2']);
}
b2FrictionJoint.prototype['SetMaxTorque'] = function(arg0) {
    _emscripten_bind_b2FrictionJoint__SetMaxTorque_p1(this.ptr, arg0);
}
b2FrictionJoint.prototype['GetMaxForce'] = function() {
    return _emscripten_bind_b2FrictionJoint__GetMaxForce_p0(this.ptr);
}
b2FrictionJoint.prototype['GetAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJoint__GetAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2FrictionJoint.prototype['GetReactionTorque'] = function(arg0) {
    return _emscripten_bind_b2FrictionJoint__GetReactionTorque_p1(this.ptr, arg0);
}
b2FrictionJoint.prototype['Dump'] = function() {
    _emscripten_bind_b2FrictionJoint__Dump_p0(this.ptr);
}
b2FrictionJoint.prototype['__destroy__'] = function() {
    _emscripten_bind_b2FrictionJoint____destroy___p0(this.ptr);
}
b2FrictionJoint.prototype['GetCollideConnected'] = function() {
    return _emscripten_bind_b2FrictionJoint__GetCollideConnected_p0(this.ptr);
}
b2FrictionJoint.prototype['GetUserData'] = function() {
    return _emscripten_bind_b2FrictionJoint__GetUserData_p0(this.ptr);
}
b2FrictionJoint.prototype['GetType'] = function() {
    return _emscripten_bind_b2FrictionJoint__GetType_p0(this.ptr);
}
b2FrictionJoint.prototype['SetMaxForce'] = function(arg0) {
    _emscripten_bind_b2FrictionJoint__SetMaxForce_p1(this.ptr, arg0);
}
b2FrictionJoint.prototype['GetBodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJoint__GetBodyB_p0(this.ptr), Module['b2Body']);
}
b2FrictionJoint.prototype['GetLocalAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJoint__GetLocalAnchorA_p0(this.ptr), Module['b2Vec2']);
}
function b2FrictionJoint(arg0) {
    this.ptr = _emscripten_bind_b2FrictionJoint__b2FrictionJoint_p1(arg0.ptr);
  b2FrictionJoint.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2FrictionJoint;
}
b2FrictionJoint.prototype.__cache__ = {};
Module['b2FrictionJoint'] = b2FrictionJoint;
b2FrictionJoint.prototype['GetLocalAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJoint__GetLocalAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2FrictionJoint.prototype['SetUserData'] = function(arg0) {
    _emscripten_bind_b2FrictionJoint__SetUserData_p1(this.ptr, arg0);
}
b2FrictionJoint.prototype['GetAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJoint__GetAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2FrictionJoint.prototype['GetReactionForce'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2FrictionJoint__GetReactionForce_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2FrictionJoint.prototype['GetBodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJoint__GetBodyA_p0(this.ptr), Module['b2Body']);
}
b2FrictionJoint.prototype['GetNext'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJoint__GetNext_p0(this.ptr), Module['b2Joint']);
}
b2FrictionJoint.prototype['GetMaxTorque'] = function() {
    return _emscripten_bind_b2FrictionJoint__GetMaxTorque_p0(this.ptr);
}
b2FrictionJoint.prototype['IsActive'] = function() {
    return _emscripten_bind_b2FrictionJoint__IsActive_p0(this.ptr);
}
b2StackAllocator.prototype['GetMaxAllocation'] = function() {
    return _emscripten_bind_b2StackAllocator__GetMaxAllocation_p0(this.ptr);
}
b2StackAllocator.prototype['__destroy__'] = function() {
    _emscripten_bind_b2StackAllocator____destroy___p0(this.ptr);
}
function b2StackAllocator() {
    this.ptr = _emscripten_bind_b2StackAllocator__b2StackAllocator_p0();
  b2StackAllocator.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2StackAllocator;
}
b2StackAllocator.prototype.__cache__ = {};
Module['b2StackAllocator'] = b2StackAllocator;
b2StackAllocator.prototype['Allocate'] = function(arg0) {
    return _emscripten_bind_b2StackAllocator__Allocate_p1(this.ptr, arg0);
}
b2StackAllocator.prototype['Free'] = function(arg0) {
    _emscripten_bind_b2StackAllocator__Free_p1(this.ptr, arg0);
}
b2DestructionListener.prototype['__destroy__'] = function() {
    _emscripten_bind_b2DestructionListener____destroy___p0(this.ptr);
}
b2DestructionListener.prototype['SayGoodbye'] = function(arg0) {
    _emscripten_bind_b2DestructionListener__SayGoodbye_p1(this.ptr, arg0.ptr);
}
function b2DestructionListener() {
    this.ptr = _emscripten_bind_b2DestructionListener__b2DestructionListener_p0();
  b2DestructionListener.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2DestructionListener;
}
b2DestructionListener.prototype.__cache__ = {};
Module['b2DestructionListener'] = b2DestructionListener;
b2Filter.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Filter____destroy___p0(this.ptr);
}
b2Filter.prototype['set_maskBits'] = function(arg0) {
    _emscripten_bind_b2Filter__set_maskBits_p1(this.ptr, arg0);
}
b2Filter.prototype['set_categoryBits'] = function(arg0) {
    _emscripten_bind_b2Filter__set_categoryBits_p1(this.ptr, arg0);
}
b2Filter.prototype['get_groupIndex'] = function() {
    return _emscripten_bind_b2Filter__get_groupIndex_p0(this.ptr);
}
b2Filter.prototype['set_groupIndex'] = function(arg0) {
    _emscripten_bind_b2Filter__set_groupIndex_p1(this.ptr, arg0);
}
b2Filter.prototype['get_maskBits'] = function() {
    return _emscripten_bind_b2Filter__get_maskBits_p0(this.ptr);
}
function b2Filter() {
    this.ptr = _emscripten_bind_b2Filter__b2Filter_p0();
  b2Filter.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Filter;
}
b2Filter.prototype.__cache__ = {};
Module['b2Filter'] = b2Filter;
b2Filter.prototype['get_categoryBits'] = function() {
    return _emscripten_bind_b2Filter__get_categoryBits_p0(this.ptr);
}
b2FrictionJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2FrictionJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2FrictionJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2FrictionJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2FrictionJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2FrictionJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2FrictionJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2FrictionJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2FrictionJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2FrictionJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
b2FrictionJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2FrictionJointDef____destroy___p0(this.ptr);
}
b2FrictionJointDef.prototype['get_maxForce'] = function() {
    return _emscripten_bind_b2FrictionJointDef__get_maxForce_p0(this.ptr);
}
function b2FrictionJointDef() {
    this.ptr = _emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0();
  b2FrictionJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2FrictionJointDef;
}
b2FrictionJointDef.prototype.__cache__ = {};
Module['b2FrictionJointDef'] = b2FrictionJointDef;
b2FrictionJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2FrictionJointDef.prototype['set_maxForce'] = function(arg0) {
    _emscripten_bind_b2FrictionJointDef__set_maxForce_p1(this.ptr, arg0);
}
b2FrictionJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2FrictionJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2FrictionJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2FrictionJointDef.prototype['set_maxTorque'] = function(arg0) {
    _emscripten_bind_b2FrictionJointDef__set_maxTorque_p1(this.ptr, arg0);
}
b2FrictionJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2FrictionJointDef__set_collideConnected_p1(this.ptr, arg0);
}
b2FrictionJointDef.prototype['Initialize'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2FrictionJointDef__Initialize_p3(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr);
}
b2FrictionJointDef.prototype['get_maxTorque'] = function() {
    return _emscripten_bind_b2FrictionJointDef__get_maxTorque_p0(this.ptr);
}
b2BodyDef.prototype['get_linearDamping'] = function() {
    return _emscripten_bind_b2BodyDef__get_linearDamping_p0(this.ptr);
}
b2BodyDef.prototype['get_awake'] = function() {
    return _emscripten_bind_b2BodyDef__get_awake_p0(this.ptr);
}
b2BodyDef.prototype['get_type'] = function() {
    return _emscripten_bind_b2BodyDef__get_type_p0(this.ptr);
}
b2BodyDef.prototype['get_allowSleep'] = function() {
    return _emscripten_bind_b2BodyDef__get_allowSleep_p0(this.ptr);
}
b2BodyDef.prototype['set_position'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_position_p1(this.ptr, arg0.ptr);
}
b2BodyDef.prototype['set_linearVelocity'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_linearVelocity_p1(this.ptr, arg0.ptr);
}
function b2BodyDef() {
    this.ptr = _emscripten_bind_b2BodyDef__b2BodyDef_p0();
  b2BodyDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2BodyDef;
}
b2BodyDef.prototype.__cache__ = {};
Module['b2BodyDef'] = b2BodyDef;
b2BodyDef.prototype['get_bullet'] = function() {
    return _emscripten_bind_b2BodyDef__get_bullet_p0(this.ptr);
}
b2BodyDef.prototype['get_userData'] = function() {
    return _emscripten_bind_b2BodyDef__get_userData_p0(this.ptr);
}
b2BodyDef.prototype['set_angularDamping'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_angularDamping_p1(this.ptr, arg0);
}
b2BodyDef.prototype['set_fixedRotation'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_fixedRotation_p1(this.ptr, arg0);
}
b2BodyDef.prototype['set_allowSleep'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_allowSleep_p1(this.ptr, arg0);
}
b2BodyDef.prototype['get_gravityScale'] = function() {
    return _emscripten_bind_b2BodyDef__get_gravityScale_p0(this.ptr);
}
b2BodyDef.prototype['set_angularVelocity'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_angularVelocity_p1(this.ptr, arg0);
}
b2BodyDef.prototype['set_userData'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_userData_p1(this.ptr, arg0);
}
b2BodyDef.prototype['get_position'] = function() {
    return wrapPointer(_emscripten_bind_b2BodyDef__get_position_p0(this.ptr), Module['b2Vec2']);
}
b2BodyDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2BodyDef____destroy___p0(this.ptr);
}
b2BodyDef.prototype['set_type'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_type_p1(this.ptr, arg0);
}
b2BodyDef.prototype['set_gravityScale'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_gravityScale_p1(this.ptr, arg0);
}
b2BodyDef.prototype['get_angularDamping'] = function() {
    return _emscripten_bind_b2BodyDef__get_angularDamping_p0(this.ptr);
}
b2BodyDef.prototype['set_bullet'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_bullet_p1(this.ptr, arg0);
}
b2BodyDef.prototype['set_active'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_active_p1(this.ptr, arg0);
}
b2BodyDef.prototype['set_angle'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_angle_p1(this.ptr, arg0);
}
b2BodyDef.prototype['get_angle'] = function() {
    return _emscripten_bind_b2BodyDef__get_angle_p0(this.ptr);
}
b2BodyDef.prototype['get_angularVelocity'] = function() {
    return _emscripten_bind_b2BodyDef__get_angularVelocity_p0(this.ptr);
}
b2BodyDef.prototype['get_linearVelocity'] = function() {
    return wrapPointer(_emscripten_bind_b2BodyDef__get_linearVelocity_p0(this.ptr), Module['b2Vec2']);
}
b2BodyDef.prototype['get_active'] = function() {
    return _emscripten_bind_b2BodyDef__get_active_p0(this.ptr);
}
b2BodyDef.prototype['set_linearDamping'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_linearDamping_p1(this.ptr, arg0);
}
b2BodyDef.prototype['get_fixedRotation'] = function() {
    return _emscripten_bind_b2BodyDef__get_fixedRotation_p0(this.ptr);
}
b2BodyDef.prototype['set_awake'] = function(arg0) {
    _emscripten_bind_b2BodyDef__set_awake_p1(this.ptr, arg0);
}
b2Vec2.prototype['Normalize'] = function() {
    return _emscripten_bind_b2Vec2__Normalize_p0(this.ptr);
}
b2Vec2.prototype['set_x'] = function(arg0) {
    _emscripten_bind_b2Vec2__set_x_p1(this.ptr, arg0);
}
function b2Vec2(arg0, arg1) {
  if (arg0 === undefined)
    this.ptr = _emscripten_bind_b2Vec2__b2Vec2_p0();
  else 
    this.ptr = _emscripten_bind_b2Vec2__b2Vec2_p2(arg0, arg1);
  b2Vec2.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Vec2;
}
b2Vec2.prototype.__cache__ = {};
Module['b2Vec2'] = b2Vec2;
b2Vec2.prototype['Set'] = function(arg0, arg1) {
    _emscripten_bind_b2Vec2__Set_p2(this.ptr, arg0, arg1);
}
b2Vec2.prototype['get_x'] = function() {
    return _emscripten_bind_b2Vec2__get_x_p0(this.ptr);
}
b2Vec2.prototype['get_y'] = function() {
    return _emscripten_bind_b2Vec2__get_y_p0(this.ptr);
}
b2Vec2.prototype['set_y'] = function(arg0) {
    _emscripten_bind_b2Vec2__set_y_p1(this.ptr, arg0);
}
b2Vec2.prototype['IsValid'] = function() {
    return _emscripten_bind_b2Vec2__IsValid_p0(this.ptr);
}
b2Vec2.prototype['Skew'] = function() {
    return wrapPointer(_emscripten_bind_b2Vec2__Skew_p0(this.ptr), Module['b2Vec2']);
}
b2Vec2.prototype['LengthSquared'] = function() {
    return _emscripten_bind_b2Vec2__LengthSquared_p0(this.ptr);
}
b2Vec2.prototype['op_add'] = function(arg0) {
    _emscripten_bind_b2Vec2__op_add_p1(this.ptr, arg0.ptr);
}
b2Vec2.prototype['SetZero'] = function() {
    _emscripten_bind_b2Vec2__SetZero_p0(this.ptr);
}
b2Vec2.prototype['Length'] = function() {
    return _emscripten_bind_b2Vec2__Length_p0(this.ptr);
}
b2Vec2.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Vec2____destroy___p0(this.ptr);
}
b2Vec2.prototype['op_mul'] = function(arg0) {
    _emscripten_bind_b2Vec2__op_mul_p1(this.ptr, arg0);
}
b2Vec2.prototype['op_sub'] = function() {
    return wrapPointer(_emscripten_bind_b2Vec2__op_sub_p0(this.ptr), Module['b2Vec2']);
}
b2Vec3.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Vec3____destroy___p0(this.ptr);
}
b2Vec3.prototype['set_z'] = function(arg0) {
    _emscripten_bind_b2Vec3__set_z_p1(this.ptr, arg0);
}
b2Vec3.prototype['Set'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Vec3__Set_p3(this.ptr, arg0, arg1, arg2);
}
b2Vec3.prototype['get_z'] = function() {
    return _emscripten_bind_b2Vec3__get_z_p0(this.ptr);
}
b2Vec3.prototype['op_add'] = function(arg0) {
    _emscripten_bind_b2Vec3__op_add_p1(this.ptr, arg0.ptr);
}
b2Vec3.prototype['SetZero'] = function() {
    _emscripten_bind_b2Vec3__SetZero_p0(this.ptr);
}
function b2Vec3(arg0, arg1, arg2) {
  if (arg0 === undefined)
    this.ptr = _emscripten_bind_b2Vec3__b2Vec3_p0();
  else 
    this.ptr = _emscripten_bind_b2Vec3__b2Vec3_p3(arg0, arg1, arg2);
  b2Vec3.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Vec3;
}
b2Vec3.prototype.__cache__ = {};
Module['b2Vec3'] = b2Vec3;
b2Vec3.prototype['op_mul'] = function(arg0) {
    _emscripten_bind_b2Vec3__op_mul_p1(this.ptr, arg0);
}
b2Vec3.prototype['op_sub'] = function() {
    return wrapPointer(_emscripten_bind_b2Vec3__op_sub_p0(this.ptr), Module['b2Vec3']);
}
b2DistanceProxy.prototype['get_m_radius'] = function() {
    return _emscripten_bind_b2DistanceProxy__get_m_radius_p0(this.ptr);
}
b2DistanceProxy.prototype['Set'] = function(arg0, arg1) {
    _emscripten_bind_b2DistanceProxy__Set_p2(this.ptr, arg0.ptr, arg1);
}
function b2DistanceProxy() {
    this.ptr = _emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0();
  b2DistanceProxy.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2DistanceProxy;
}
b2DistanceProxy.prototype.__cache__ = {};
Module['b2DistanceProxy'] = b2DistanceProxy;
b2DistanceProxy.prototype['set_m_radius'] = function(arg0) {
    _emscripten_bind_b2DistanceProxy__set_m_radius_p1(this.ptr, arg0);
}
b2DistanceProxy.prototype['__destroy__'] = function() {
    _emscripten_bind_b2DistanceProxy____destroy___p0(this.ptr);
}
b2DistanceProxy.prototype['get_m_vertices'] = function() {
    return _emscripten_bind_b2DistanceProxy__get_m_vertices_p0(this.ptr);
}
b2DistanceProxy.prototype['GetSupportVertex'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2DistanceProxy__GetSupportVertex_p1(this.ptr, arg0.ptr), Module['b2Vec2']);
}
b2DistanceProxy.prototype['get_m_count'] = function() {
    return _emscripten_bind_b2DistanceProxy__get_m_count_p0(this.ptr);
}
b2DistanceProxy.prototype['GetVertexCount'] = function() {
    return _emscripten_bind_b2DistanceProxy__GetVertexCount_p0(this.ptr);
}
b2DistanceProxy.prototype['GetVertex'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2DistanceProxy__GetVertex_p1(this.ptr, arg0), Module['b2Vec2']);
}
b2DistanceProxy.prototype['GetSupport'] = function(arg0) {
    return _emscripten_bind_b2DistanceProxy__GetSupport_p1(this.ptr, arg0.ptr);
}
b2DistanceProxy.prototype['set_m_vertices'] = function(arg0) {
    _emscripten_bind_b2DistanceProxy__set_m_vertices_p1(this.ptr, arg0.ptr);
}
b2DistanceProxy.prototype['set_m_count'] = function(arg0) {
    _emscripten_bind_b2DistanceProxy__set_m_count_p1(this.ptr, arg0);
}
b2FixtureDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2FixtureDef____destroy___p0(this.ptr);
}
b2FixtureDef.prototype['get_isSensor'] = function() {
    return _emscripten_bind_b2FixtureDef__get_isSensor_p0(this.ptr);
}
b2FixtureDef.prototype['set_userData'] = function(arg0) {
    _emscripten_bind_b2FixtureDef__set_userData_p1(this.ptr, arg0);
}
b2FixtureDef.prototype['set_shape'] = function(arg0) {
    _emscripten_bind_b2FixtureDef__set_shape_p1(this.ptr, arg0.ptr);
}
b2FixtureDef.prototype['get_density'] = function() {
    return _emscripten_bind_b2FixtureDef__get_density_p0(this.ptr);
}
b2FixtureDef.prototype['get_shape'] = function() {
    return _emscripten_bind_b2FixtureDef__get_shape_p0(this.ptr);
}
function b2FixtureDef() {
    this.ptr = _emscripten_bind_b2FixtureDef__b2FixtureDef_p0();
  b2FixtureDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2FixtureDef;
}
b2FixtureDef.prototype.__cache__ = {};
Module['b2FixtureDef'] = b2FixtureDef;
b2FixtureDef.prototype['set_density'] = function(arg0) {
    _emscripten_bind_b2FixtureDef__set_density_p1(this.ptr, arg0);
}
b2FixtureDef.prototype['set_restitution'] = function(arg0) {
    _emscripten_bind_b2FixtureDef__set_restitution_p1(this.ptr, arg0);
}
b2FixtureDef.prototype['get_restitution'] = function() {
    return _emscripten_bind_b2FixtureDef__get_restitution_p0(this.ptr);
}
b2FixtureDef.prototype['set_isSensor'] = function(arg0) {
    _emscripten_bind_b2FixtureDef__set_isSensor_p1(this.ptr, arg0);
}
b2FixtureDef.prototype['get_filter'] = function() {
    return wrapPointer(_emscripten_bind_b2FixtureDef__get_filter_p0(this.ptr), Module['b2Filter']);
}
b2FixtureDef.prototype['get_friction'] = function() {
    return _emscripten_bind_b2FixtureDef__get_friction_p0(this.ptr);
}
b2FixtureDef.prototype['set_friction'] = function(arg0) {
    _emscripten_bind_b2FixtureDef__set_friction_p1(this.ptr, arg0);
}
b2FixtureDef.prototype['get_userData'] = function() {
    return _emscripten_bind_b2FixtureDef__get_userData_p0(this.ptr);
}
b2FixtureDef.prototype['set_filter'] = function(arg0) {
    _emscripten_bind_b2FixtureDef__set_filter_p1(this.ptr, arg0.ptr);
}
b2PrismaticJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2PrismaticJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2PrismaticJointDef.prototype['get_motorSpeed'] = function() {
    return _emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0(this.ptr);
}
b2PrismaticJointDef.prototype['get_enableMotor'] = function() {
    return _emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0(this.ptr);
}
b2PrismaticJointDef.prototype['get_referenceAngle'] = function() {
    return _emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0(this.ptr);
}
b2PrismaticJointDef.prototype['set_enableLimit'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['set_motorSpeed'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['get_localAxisA'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2PrismaticJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
function b2PrismaticJointDef() {
    this.ptr = _emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0();
  b2PrismaticJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2PrismaticJointDef;
}
b2PrismaticJointDef.prototype.__cache__ = {};
Module['b2PrismaticJointDef'] = b2PrismaticJointDef;
b2PrismaticJointDef.prototype['Initialize'] = function(arg0, arg1, arg2, arg3) {
    _emscripten_bind_b2PrismaticJointDef__Initialize_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3.ptr);
}
b2PrismaticJointDef.prototype['set_lowerTranslation'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['get_upperTranslation'] = function() {
    return _emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0(this.ptr);
}
b2PrismaticJointDef.prototype['get_enableLimit'] = function() {
    return _emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0(this.ptr);
}
b2PrismaticJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2PrismaticJointDef____destroy___p0(this.ptr);
}
b2PrismaticJointDef.prototype['set_referenceAngle'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2PrismaticJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2PrismaticJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2PrismaticJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2PrismaticJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2PrismaticJointDef.prototype['set_upperTranslation'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['get_maxMotorForce'] = function() {
    return _emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0(this.ptr);
}
b2PrismaticJointDef.prototype['set_maxMotorForce'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['set_enableMotor'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_collideConnected_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['get_lowerTranslation'] = function() {
    return _emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0(this.ptr);
}
b2PrismaticJointDef.prototype['set_localAxisA'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1(this.ptr, arg0.ptr);
}
b2Rot.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Rot____destroy___p0(this.ptr);
}
b2Rot.prototype['Set'] = function(arg0) {
    _emscripten_bind_b2Rot__Set_p1(this.ptr, arg0);
}
b2Rot.prototype['GetAngle'] = function() {
    return _emscripten_bind_b2Rot__GetAngle_p0(this.ptr);
}
b2Rot.prototype['GetYAxis'] = function() {
    return wrapPointer(_emscripten_bind_b2Rot__GetYAxis_p0(this.ptr), Module['b2Vec2']);
}
b2Rot.prototype['GetXAxis'] = function() {
    return wrapPointer(_emscripten_bind_b2Rot__GetXAxis_p0(this.ptr), Module['b2Vec2']);
}
b2Rot.prototype['set_c'] = function(arg0) {
    _emscripten_bind_b2Rot__set_c_p1(this.ptr, arg0);
}
b2Rot.prototype['SetIdentity'] = function() {
    _emscripten_bind_b2Rot__SetIdentity_p0(this.ptr);
}
function b2Rot(arg0) {
  if (arg0 === undefined)
    this.ptr = _emscripten_bind_b2Rot__b2Rot_p0();
  else 
    this.ptr = _emscripten_bind_b2Rot__b2Rot_p1(arg0);
  b2Rot.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Rot;
}
b2Rot.prototype.__cache__ = {};
Module['b2Rot'] = b2Rot;
b2Rot.prototype['get_c'] = function() {
    return _emscripten_bind_b2Rot__get_c_p0(this.ptr);
}
b2WheelJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2WheelJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2WheelJointDef.prototype['get_motorSpeed'] = function() {
    return _emscripten_bind_b2WheelJointDef__get_motorSpeed_p0(this.ptr);
}
b2WheelJointDef.prototype['set_maxMotorTorque'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['set_frequencyHz'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_frequencyHz_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['set_motorSpeed'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_motorSpeed_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['get_localAxisA'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJointDef__get_localAxisA_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2WheelJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
b2WheelJointDef.prototype['Initialize'] = function(arg0, arg1, arg2, arg3) {
    _emscripten_bind_b2WheelJointDef__Initialize_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3.ptr);
}
function b2WheelJointDef() {
    this.ptr = _emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0();
  b2WheelJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2WheelJointDef;
}
b2WheelJointDef.prototype.__cache__ = {};
Module['b2WheelJointDef'] = b2WheelJointDef;
b2WheelJointDef.prototype['get_frequencyHz'] = function() {
    return _emscripten_bind_b2WheelJointDef__get_frequencyHz_p0(this.ptr);
}
b2WheelJointDef.prototype['set_dampingRatio'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_dampingRatio_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2WheelJointDef____destroy___p0(this.ptr);
}
b2WheelJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJointDef.prototype['get_maxMotorTorque'] = function() {
    return _emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0(this.ptr);
}
b2WheelJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2WheelJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['get_enableMotor'] = function() {
    return _emscripten_bind_b2WheelJointDef__get_enableMotor_p0(this.ptr);
}
b2WheelJointDef.prototype['get_dampingRatio'] = function() {
    return _emscripten_bind_b2WheelJointDef__get_dampingRatio_p0(this.ptr);
}
b2WheelJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2WheelJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2WheelJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2WheelJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2WheelJointDef.prototype['set_enableMotor'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_enableMotor_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_collideConnected_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['set_localAxisA'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_localAxisA_p1(this.ptr, arg0.ptr);
}
b2RevoluteJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2RevoluteJointDef.prototype['get_lowerAngle'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2RevoluteJointDef.prototype['set_lowerAngle'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['get_enableMotor'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_upperAngle'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['get_referenceAngle'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_enableLimit'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['get_motorSpeed'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_motorSpeed'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['get_maxMotorTorque'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2RevoluteJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
function b2RevoluteJointDef() {
    this.ptr = _emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0();
  b2RevoluteJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2RevoluteJointDef;
}
b2RevoluteJointDef.prototype.__cache__ = {};
Module['b2RevoluteJointDef'] = b2RevoluteJointDef;
b2RevoluteJointDef.prototype['Initialize'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2RevoluteJointDef__Initialize_p3(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr);
}
b2RevoluteJointDef.prototype['get_enableLimit'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0(this.ptr);
}
b2RevoluteJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2RevoluteJointDef____destroy___p0(this.ptr);
}
b2RevoluteJointDef.prototype['get_upperAngle'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_referenceAngle'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2RevoluteJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2RevoluteJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2RevoluteJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2RevoluteJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2RevoluteJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2RevoluteJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2RevoluteJointDef.prototype['set_maxMotorTorque'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['set_enableMotor'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_collideConnected_p1(this.ptr, arg0);
}
b2PulleyJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2PulleyJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2PulleyJointDef.prototype['set_ratio'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_ratio_p1(this.ptr, arg0);
}
b2PulleyJointDef.prototype['set_groundAnchorB'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1(this.ptr, arg0.ptr);
}
b2PulleyJointDef.prototype['set_groundAnchorA'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1(this.ptr, arg0.ptr);
}
b2PulleyJointDef.prototype['get_groundAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJointDef.prototype['get_groundAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2PulleyJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
b2PulleyJointDef.prototype['Initialize'] = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    _emscripten_bind_b2PulleyJointDef__Initialize_p7(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3.ptr, arg4.ptr, arg5.ptr, arg6);
}
b2PulleyJointDef.prototype['get_ratio'] = function() {
    return _emscripten_bind_b2PulleyJointDef__get_ratio_p0(this.ptr);
}
b2PulleyJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2PulleyJointDef____destroy___p0(this.ptr);
}
b2PulleyJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2PulleyJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2PulleyJointDef.prototype['set_lengthB'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_lengthB_p1(this.ptr, arg0);
}
b2PulleyJointDef.prototype['set_lengthA'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_lengthA_p1(this.ptr, arg0);
}
b2PulleyJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2PulleyJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2PulleyJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2PulleyJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2PulleyJointDef.prototype['get_lengthB'] = function() {
    return _emscripten_bind_b2PulleyJointDef__get_lengthB_p0(this.ptr);
}
b2PulleyJointDef.prototype['get_lengthA'] = function() {
    return _emscripten_bind_b2PulleyJointDef__get_lengthA_p0(this.ptr);
}
b2PulleyJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_collideConnected_p1(this.ptr, arg0);
}
function b2PulleyJointDef() {
    this.ptr = _emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0();
  b2PulleyJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2PulleyJointDef;
}
b2PulleyJointDef.prototype.__cache__ = {};
Module['b2PulleyJointDef'] = b2PulleyJointDef;
b2JointDef.prototype['get_bodyA'] = function() {
    return wrapPointer(_emscripten_bind_b2JointDef__get_bodyA_p0(this.ptr), Module['b2Body']);
}
b2JointDef.prototype['set_userData'] = function(arg0) {
    _emscripten_bind_b2JointDef__set_userData_p1(this.ptr, arg0);
}
b2JointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2JointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2JointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2JointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
b2JointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2JointDef____destroy___p0(this.ptr);
}
b2JointDef.prototype['get_bodyB'] = function() {
    return wrapPointer(_emscripten_bind_b2JointDef__get_bodyB_p0(this.ptr), Module['b2Body']);
}
b2JointDef.prototype['set_type'] = function(arg0) {
    _emscripten_bind_b2JointDef__set_type_p1(this.ptr, arg0);
}
b2JointDef.prototype['get_collideConnected'] = function() {
    return _emscripten_bind_b2JointDef__get_collideConnected_p0(this.ptr);
}
b2JointDef.prototype['get_type'] = function() {
    return _emscripten_bind_b2JointDef__get_type_p0(this.ptr);
}
b2JointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2JointDef__set_collideConnected_p1(this.ptr, arg0);
}
function b2JointDef() {
    this.ptr = _emscripten_bind_b2JointDef__b2JointDef_p0();
  b2JointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2JointDef;
}
b2JointDef.prototype.__cache__ = {};
Module['b2JointDef'] = b2JointDef;
b2JointDef.prototype['get_userData'] = function() {
    return _emscripten_bind_b2JointDef__get_userData_p0(this.ptr);
}
b2Transform.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Transform____destroy___p0(this.ptr);
}
b2Transform.prototype['Set'] = function(arg0, arg1) {
    _emscripten_bind_b2Transform__Set_p2(this.ptr, arg0.ptr, arg1);
}
b2Transform.prototype['set_p'] = function(arg0) {
    _emscripten_bind_b2Transform__set_p_p1(this.ptr, arg0.ptr);
}
b2Transform.prototype['set_q'] = function(arg0) {
    _emscripten_bind_b2Transform__set_q_p1(this.ptr, arg0.ptr);
}
b2Transform.prototype['get_p'] = function() {
    return wrapPointer(_emscripten_bind_b2Transform__get_p_p0(this.ptr), Module['b2Vec2']);
}
b2Transform.prototype['get_q'] = function() {
    return wrapPointer(_emscripten_bind_b2Transform__get_q_p0(this.ptr), Module['b2Rot']);
}
function b2Transform(arg0, arg1) {
  if (arg0 === undefined)
    this.ptr = _emscripten_bind_b2Transform__b2Transform_p0();
  else 
    this.ptr = _emscripten_bind_b2Transform__b2Transform_p2(arg0.ptr, arg1.ptr);
  b2Transform.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Transform;
}
b2Transform.prototype.__cache__ = {};
Module['b2Transform'] = b2Transform;
b2Transform.prototype['SetIdentity'] = function() {
    _emscripten_bind_b2Transform__SetIdentity_p0(this.ptr);
}
b2Color.prototype['__destroy__'] = function() {
    _emscripten_bind_b2Color____destroy___p0(this.ptr);
}
b2Color.prototype['Set'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Color__Set_p3(this.ptr, arg0, arg1, arg2);
}
b2Color.prototype['set_r'] = function(arg0) {
    _emscripten_bind_b2Color__set_r_p1(this.ptr, arg0);
}
b2Color.prototype['get_r'] = function() {
    return _emscripten_bind_b2Color__get_r_p0(this.ptr);
}
function b2Color(arg0, arg1, arg2) {
  if (arg0 === undefined)
    this.ptr = _emscripten_bind_b2Color__b2Color_p0();
  else 
    this.ptr = _emscripten_bind_b2Color__b2Color_p3(arg0, arg1, arg2);
  b2Color.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2Color;
}
b2Color.prototype.__cache__ = {};
Module['b2Color'] = b2Color;
b2Color.prototype['set_b'] = function(arg0) {
    _emscripten_bind_b2Color__set_b_p1(this.ptr, arg0);
}
b2Color.prototype['get_g'] = function() {
    return _emscripten_bind_b2Color__get_g_p0(this.ptr);
}
b2Color.prototype['get_b'] = function() {
    return _emscripten_bind_b2Color__get_b_p0(this.ptr);
}
b2Color.prototype['set_g'] = function(arg0) {
    _emscripten_bind_b2Color__set_g_p1(this.ptr, arg0);
}
b2AABB.prototype['__destroy__'] = function() {
    _emscripten_bind_b2AABB____destroy___p0(this.ptr);
}
function b2AABB() {
    this.ptr = _emscripten_bind_b2AABB__b2AABB_p0();
  b2AABB.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2AABB;
}
b2AABB.prototype.__cache__ = {};
Module['b2AABB'] = b2AABB;
b2AABB.prototype['set_upperBound'] = function(arg0) {
    _emscripten_bind_b2AABB__set_upperBound_p1(this.ptr, arg0.ptr);
}
b2AABB.prototype['IsValid'] = function() {
    return _emscripten_bind_b2AABB__IsValid_p0(this.ptr);
}
b2AABB.prototype['Contains'] = function(arg0) {
    return _emscripten_bind_b2AABB__Contains_p1(this.ptr, arg0.ptr);
}
b2AABB.prototype['GetExtents'] = function() {
    return wrapPointer(_emscripten_bind_b2AABB__GetExtents_p0(this.ptr), Module['b2Vec2']);
}
b2AABB.prototype['GetCenter'] = function() {
    return wrapPointer(_emscripten_bind_b2AABB__GetCenter_p0(this.ptr), Module['b2Vec2']);
}
b2AABB.prototype['get_upperBound'] = function() {
    return wrapPointer(_emscripten_bind_b2AABB__get_upperBound_p0(this.ptr), Module['b2Vec2']);
}
b2AABB.prototype['GetPerimeter'] = function() {
    return _emscripten_bind_b2AABB__GetPerimeter_p0(this.ptr);
}
b2AABB.prototype['Combine'] = function(arg0, arg1) {
  if (arg1 === undefined)
    _emscripten_bind_b2AABB__Combine_p1(this.ptr, arg0.ptr);
  else 
    _emscripten_bind_b2AABB__Combine_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2AABB.prototype['RayCast'] = function(arg0, arg1) {
    return _emscripten_bind_b2AABB__RayCast_p2(this.ptr, arg0.ptr, arg1.ptr);
}
b2AABB.prototype['set_lowerBound'] = function(arg0) {
    _emscripten_bind_b2AABB__set_lowerBound_p1(this.ptr, arg0.ptr);
}
b2AABB.prototype['get_lowerBound'] = function() {
    return wrapPointer(_emscripten_bind_b2AABB__get_lowerBound_p0(this.ptr), Module['b2Vec2']);
}
b2WeldJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2WeldJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2WeldJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2WeldJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2WeldJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2WeldJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2WeldJointDef.prototype['get_frequencyHz'] = function() {
    return _emscripten_bind_b2WeldJointDef__get_frequencyHz_p0(this.ptr);
}
b2WeldJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2WeldJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
b2WeldJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2WeldJointDef____destroy___p0(this.ptr);
}
b2WeldJointDef.prototype['set_referenceAngle'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_referenceAngle_p1(this.ptr, arg0);
}
b2WeldJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2WeldJointDef.prototype['get_referenceAngle'] = function() {
    return _emscripten_bind_b2WeldJointDef__get_referenceAngle_p0(this.ptr);
}
b2WeldJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2WeldJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2WeldJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2WeldJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2WeldJointDef.prototype['get_dampingRatio'] = function() {
    return _emscripten_bind_b2WeldJointDef__get_dampingRatio_p0(this.ptr);
}
b2WeldJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_collideConnected_p1(this.ptr, arg0);
}
b2WeldJointDef.prototype['set_frequencyHz'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_frequencyHz_p1(this.ptr, arg0);
}
b2WeldJointDef.prototype['Initialize'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2WeldJointDef__Initialize_p3(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr);
}
b2WeldJointDef.prototype['set_dampingRatio'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_dampingRatio_p1(this.ptr, arg0);
}
function b2WeldJointDef() {
    this.ptr = _emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0();
  b2WeldJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2WeldJointDef;
}
b2WeldJointDef.prototype.__cache__ = {};
Module['b2WeldJointDef'] = b2WeldJointDef;
b2MouseJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2MouseJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2MouseJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2MouseJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2MouseJointDef.prototype['set_dampingRatio'] = function(arg0) {
    _emscripten_bind_b2MouseJointDef__set_dampingRatio_p1(this.ptr, arg0);
}
b2MouseJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2MouseJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2MouseJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2MouseJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
function b2MouseJointDef() {
    this.ptr = _emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0();
  b2MouseJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2MouseJointDef;
}
b2MouseJointDef.prototype.__cache__ = {};
Module['b2MouseJointDef'] = b2MouseJointDef;
b2MouseJointDef.prototype['get_maxForce'] = function() {
    return _emscripten_bind_b2MouseJointDef__get_maxForce_p0(this.ptr);
}
b2MouseJointDef.prototype['set_target'] = function(arg0) {
    _emscripten_bind_b2MouseJointDef__set_target_p1(this.ptr, arg0.ptr);
}
b2MouseJointDef.prototype['set_maxForce'] = function(arg0) {
    _emscripten_bind_b2MouseJointDef__set_maxForce_p1(this.ptr, arg0);
}
b2MouseJointDef.prototype['get_frequencyHz'] = function() {
    return _emscripten_bind_b2MouseJointDef__get_frequencyHz_p0(this.ptr);
}
b2MouseJointDef.prototype['get_target'] = function() {
    return wrapPointer(_emscripten_bind_b2MouseJointDef__get_target_p0(this.ptr), Module['b2Vec2']);
}
b2MouseJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2MouseJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2MouseJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2MouseJointDef____destroy___p0(this.ptr);
}
b2MouseJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2MouseJointDef__set_collideConnected_p1(this.ptr, arg0);
}
b2MouseJointDef.prototype['set_frequencyHz'] = function(arg0) {
    _emscripten_bind_b2MouseJointDef__set_frequencyHz_p1(this.ptr, arg0);
}
b2MouseJointDef.prototype['get_dampingRatio'] = function() {
    return _emscripten_bind_b2MouseJointDef__get_dampingRatio_p0(this.ptr);
}
b2DistanceJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2DistanceJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2DistanceJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2DistanceJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2DistanceJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2DistanceJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2DistanceJointDef.prototype['set_dampingRatio'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1(this.ptr, arg0);
}
b2DistanceJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2DistanceJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
b2DistanceJointDef.prototype['get_length'] = function() {
    return _emscripten_bind_b2DistanceJointDef__get_length_p0(this.ptr);
}
b2DistanceJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2DistanceJointDef.prototype['get_frequencyHz'] = function() {
    return _emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0(this.ptr);
}
b2DistanceJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2DistanceJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2DistanceJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2DistanceJointDef.prototype['get_dampingRatio'] = function() {
    return _emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0(this.ptr);
}
function b2DistanceJointDef() {
    this.ptr = _emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0();
  b2DistanceJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2DistanceJointDef;
}
b2DistanceJointDef.prototype.__cache__ = {};
Module['b2DistanceJointDef'] = b2DistanceJointDef;
b2DistanceJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2DistanceJointDef____destroy___p0(this.ptr);
}
b2DistanceJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_collideConnected_p1(this.ptr, arg0);
}
b2DistanceJointDef.prototype['set_length'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_length_p1(this.ptr, arg0);
}
b2DistanceJointDef.prototype['set_frequencyHz'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1(this.ptr, arg0);
}
b2DistanceJointDef.prototype['Initialize'] = function(arg0, arg1, arg2, arg3) {
    _emscripten_bind_b2DistanceJointDef__Initialize_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3.ptr);
}
b2GearJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2GearJointDef____destroy___p0(this.ptr);
}
b2GearJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2GearJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2GearJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2GearJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2GearJointDef.prototype['get_joint1'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJointDef__get_joint1_p0(this.ptr), Module['b2Joint']);
}
b2GearJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2GearJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2GearJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2GearJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
b2GearJointDef.prototype['set_joint2'] = function(arg0) {
    _emscripten_bind_b2GearJointDef__set_joint2_p1(this.ptr, arg0.ptr);
}
b2GearJointDef.prototype['set_ratio'] = function(arg0) {
    _emscripten_bind_b2GearJointDef__set_ratio_p1(this.ptr, arg0);
}
b2GearJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2GearJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2GearJointDef.prototype['get_joint2'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJointDef__get_joint2_p0(this.ptr), Module['b2Joint']);
}
b2GearJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2GearJointDef__set_collideConnected_p1(this.ptr, arg0);
}
function b2GearJointDef() {
    this.ptr = _emscripten_bind_b2GearJointDef__b2GearJointDef_p0();
  b2GearJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2GearJointDef;
}
b2GearJointDef.prototype.__cache__ = {};
Module['b2GearJointDef'] = b2GearJointDef;
b2GearJointDef.prototype['get_ratio'] = function() {
    return _emscripten_bind_b2GearJointDef__get_ratio_p0(this.ptr);
}
b2GearJointDef.prototype['set_joint1'] = function(arg0) {
    _emscripten_bind_b2GearJointDef__set_joint1_p1(this.ptr, arg0.ptr);
}
b2ContactEdge.prototype['__destroy__'] = function() {
    _emscripten_bind_b2ContactEdge____destroy___p0(this.ptr);
}
b2ContactEdge.prototype['set_contact'] = function(arg0) {
    _emscripten_bind_b2ContactEdge__set_contact_p1(this.ptr, arg0.ptr);
}
b2ContactEdge.prototype['get_prev'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactEdge__get_prev_p0(this.ptr), Module['b2ContactEdge']);
}
b2ContactEdge.prototype['get_other'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactEdge__get_other_p0(this.ptr), Module['b2Body']);
}
b2ContactEdge.prototype['set_prev'] = function(arg0) {
    _emscripten_bind_b2ContactEdge__set_prev_p1(this.ptr, arg0.ptr);
}
b2ContactEdge.prototype['get_next'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactEdge__get_next_p0(this.ptr), Module['b2ContactEdge']);
}
b2ContactEdge.prototype['set_other'] = function(arg0) {
    _emscripten_bind_b2ContactEdge__set_other_p1(this.ptr, arg0.ptr);
}
b2ContactEdge.prototype['set_next'] = function(arg0) {
    _emscripten_bind_b2ContactEdge__set_next_p1(this.ptr, arg0.ptr);
}
function b2ContactEdge() {
    this.ptr = _emscripten_bind_b2ContactEdge__b2ContactEdge_p0();
  b2ContactEdge.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2ContactEdge;
}
b2ContactEdge.prototype.__cache__ = {};
Module['b2ContactEdge'] = b2ContactEdge;
b2ContactEdge.prototype['get_contact'] = function() {
    return wrapPointer(_emscripten_bind_b2ContactEdge__get_contact_p0(this.ptr), Module['b2Contact']);
}
b2RopeJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2RopeJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2RopeJointDef.prototype['get_bodyA'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2RopeJointDef__get_bodyA_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2RopeJointDef.prototype['get_bodyB'] = function(arg0) {
    return wrapPointer(_emscripten_bind_b2RopeJointDef__get_bodyB_p1(this.ptr, arg0.ptr), Module['b2Body']);
}
b2RopeJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2RopeJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2RopeJointDef.prototype['set_bodyA'] = function(arg0) {
    _emscripten_bind_b2RopeJointDef__set_bodyA_p1(this.ptr, arg0.ptr);
}
b2RopeJointDef.prototype['set_bodyB'] = function(arg0) {
    _emscripten_bind_b2RopeJointDef__set_bodyB_p1(this.ptr, arg0.ptr);
}
b2RopeJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2RopeJointDef____destroy___p0(this.ptr);
}
b2RopeJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2RopeJointDef.prototype['get_maxLength'] = function() {
    return _emscripten_bind_b2RopeJointDef__get_maxLength_p0(this.ptr);
}
b2RopeJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2RopeJointDef.prototype['get_collideConnected'] = function(arg0) {
    return _emscripten_bind_b2RopeJointDef__get_collideConnected_p1(this.ptr, arg0);
}
b2RopeJointDef.prototype['set_collideConnected'] = function(arg0) {
    _emscripten_bind_b2RopeJointDef__set_collideConnected_p1(this.ptr, arg0);
}
function b2RopeJointDef() {
    this.ptr = _emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0();
  b2RopeJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2RopeJointDef;
}
b2RopeJointDef.prototype.__cache__ = {};
Module['b2RopeJointDef'] = b2RopeJointDef;
b2RopeJointDef.prototype['set_maxLength'] = function(arg0) {
    _emscripten_bind_b2RopeJointDef__set_maxLength_p1(this.ptr, arg0);
}
this['Box2D'] = Module; // With or without a closure, the proper usage is Box2D.*
// Additional bindings that the bindings generator does not automatically generate (like enums)
Module['b2_staticBody']    = 0;
Module['b2_kinematicBody'] = 1;
Module['b2_dynamicBody']   = 2;
