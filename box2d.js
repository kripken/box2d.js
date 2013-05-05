// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
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
  if (/^\[\d+\ x\ (.*)\]/.test(type)) return true; // [15 x ?] blocks. Like structs
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
  STACK_ALIGN: 4,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
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
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+3)>>2)<<2); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+3)>>2)<<2); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+3)>>2)<<2); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 4))*(quantum ? quantum : 4); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 4,
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
var ABORT = false;
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
      case 'double': (HEAPF64[(tempDoublePtr)>>3]=value,HEAP32[((ptr)>>2)]=((HEAP32[((tempDoublePtr)>>2)])|0),HEAP32[(((ptr)+(4))>>2)]=((HEAP32[(((tempDoublePtr)+(4))>>2)])|0)); break;
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
      case 'double': return (HEAP32[((tempDoublePtr)>>2)]=HEAP32[((ptr)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((ptr)+(4))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
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
    HEAPU8.set(new Uint8Array(slab), ret);
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
if (!Math.imul) Math.imul = function(a, b) {
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
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 6000);
    }
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
STATIC_BASE = 4;
STATICTOP = STATIC_BASE + 19492;
__ATINIT__ = __ATINIT__.concat([
]);
var __ZTVN10__cxxabiv120__si_class_type_infoE;
var __ZTVN10__cxxabiv117__class_type_infoE;
var __ZTISt9exception;
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,216,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,228,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,94,2,0,0,64,6,0,0,70,3,0,0,196,4,0,0,214,4,0,0,72,2,0,0,2,4,0,0,34,6,0,0,222,5,0,0,154,4,0,0,42,6,0,0,84,1,0,0,182,2,0,0,60,1,0,0,198,2,0,0,80,3,0,0,248,2,0,0,54,2,0,0,194,3,0,0,254,4,0,0,122,5,0,0,220,3,0,0,210,1,0,0,46,0,0,0,158,3,0,0,28,6,0,0,138,1,0,0,238,3,0,0,100,5,0,0,250,0,0,0,122,3,0,0,156,0,0,0,26,1,0,0,178,0,0,0,112,4,0,0,72,1,0,0,214,2,0,0,122,0,0,0,206,0,0,0,104,2,0,0,140,2,0,0,18,5,0,0,90,3,0,0,46,2,0,0,58,4,0,0,164,0,0,0,174,5,0,0,12,3,0,0,250,3,0,0,42,4,0,0,12,4,0,0,158,0,0,0,226,3,0,0,118,2,0,0,236,4,0,0,92,4,0,0,40,2,0,0,234,4,0,0,138,0,0,0,206,2,0,0,156,5,0,0,118,5,0,0,24,4,0,0,24,5,0,0,40,3,0,0,152,4,0,0,230,4,0,0,226,1,0,0,126,0,0,0,68,3,0,0,18,6,0,0,98,4,0,0,124,0,0,0,162,4,0,0,216,1,0,0,192,1,0,0,114,0,0,0,192,4,0,0,232,1,0,0,166,0,0,0,158,2,0,0,38,2,0,0,160,0,0,0,70,4,0,0,224,0,0,0,44,6,0,0,96,1,0,0,128,0,0,0,14,3,0,0,140,4,0,0,192,0,0,0,8,1,0,0,196,2,0,0,218,3,0,0,30,6,0,0,142,5,0,0,212,3,0,0,228,1,0,0,220,1,0,0,20,4,0,0,244,3,0,0,116,4,0,0,188,3,0,0,70,2,0,0,146,0,0,0,240,3,0,0,122,2,0,0,50,5,0,0,90,4,0,0,0,3,0,0,66,3,0,0,138,5,0,0,6,5,0,0,102,1,0,0,26,2,0,0,50,4,0,0,56,1,0,0,116,5,0,0,82,1,0,0,52,5,0,0,154,2,0,0,54,6,0,0,246,1,0,0,202,2,0,0,52,1,0,0,78,3,0,0,252,0,0,0,122,4,0,0,146,4,0,0,110,4,0,0,102,2,0,0,22,3,0,0,30,5,0,0,18,4,0,0,206,3,0,0,96,0,0,0,240,0,0,0,234,1,0,0,104,0,0,0,152,3,0,0,238,1,0,0,160,4,0,0,76,6,0,0,58,6,0,0,204,0,0,0,116,0,0,0,194,1,0,0,90,0,0,0,94,0,0,0,232,3,0,0,126,2,0,0,186,1,0,0,110,2,0,0,116,1,0,0,160,5,0,0,220,2,0,0,168,4,0,0,86,1,0,0,24,2,0,0,174,2,0,0,252,4,0,0,54,3,0,0,90,5,0,0,176,2,0,0,8,3,0,0,96,4,0,0,172,4,0,0,108,4,0,0,242,4,0,0,142,0,0,0,64,3,0,0,36,5,0,0,98,2,0,0,2,5,0,0,220,4,0,0,34,2,0,0,208,4,0,0,100,2,0,0,148,3,0,0,32,1,0,0,76,0,0,0,10,2,0,0,54,4,0,0,238,5,0,0,160,1,0,0,48,0,0,0,248,1,0,0,130,4,0,0,28,2,0,0,212,0,0,0,210,2,0,0,134,2,0,0,106,3,0,0,110,5,0,0,108,5,0,0,230,0,0,0,250,2,0,0,22,5,0,0,218,5,0,0,158,1,0,0,60,3,0,0,184,2,0,0,142,4,0,0,90,1,0,0,150,2,0,0,4,2,0,0,132,5,0,0,238,0,0,0,178,2,0,0,110,0,0,0,198,5,0,0,52,6,0,0,84,0,0,0,102,3,0,0,2,3,0,0,182,3,0,0,246,4,0,0,34,3,0,0,10,1,0,0,236,1,0,0,132,3,0,0,150,3,0,0,82,4,0,0,162,2,0,0,116,3,0,0,26,4,0,0,68,1,0,0,166,3,0,0,208,1,0,0,24,1,0,0,134,3,0,0,152,1,0,0,66,1,0,0,190,1,0,0,146,3,0,0,224,2,0,0,214,3,0,0,32,4,0,0,48,2,0,0,110,1,0,0,14,6,0,0,114,1,0,0,34,5,0,0,28,3,0,0,200,5,0,0,62,0,0,0,200,0,0,0,112,1,0,0,114,3,0,0,202,5,0,0,56,2,0,0,0,4,0,0,176,4,0,0,224,1,0,0,216,5,0,0,182,1,0,0,52,2,0,0,172,5,0,0,214,5,0,0,176,3,0,0,36,1,0,0,84,4,0,0,164,1,0,0,224,4,0,0,148,4,0,0,202,3,0,0,120,1,0,0,104,5,0,0,140,1,0,0,12,5,0,0,14,5,0,0,206,1,0,0,202,4,0,0,32,5,0,0,96,2,0,0,170,5,0,0,42,1,0,0,76,4,0,0,212,2,0,0,82,3,0,0,254,5,0,0,56,5,0,0,38,1,0,0,66,0,0,0,44,5,0,0,138,4,0,0,56,3,0,0,120,5,0,0,242,0,0,0,26,3,0,0,94,3,0,0,120,0,0,0,56,6,0,0,146,2,0,0,180,5,0,0,208,3,0,0,0,5,0,0,136,0,0,0,6,1,0,0,130,0,0,0,186,0,0,0,222,3,0,0,68,2,0,0,136,5,0,0,234,3,0,0,60,0,0,0,94,4,0,0,124,5,0,0,170,1,0,0,190,0,0,0,20,3,0,0,16,6,0,0,174,3,0,0,150,1,0,0,96,5,0,0,170,3,0,0,148,2,0,0,152,2,0,0,148,1,0,0,240,2,0,0,62,3,0,0,220,0,0,0,210,5,0,0,236,0,0,0,8,5,0,0,226,2,0,0,244,0,0,0,124,1,0,0,34,1,0,0,10,3,0,0,198,0,0,0,252,1,0,0,12,6,0,0,252,2,0,0,70,1,0,0,176,5,0,0,246,3,0,0,84,5,0,0,210,0,0,0,2,2,0,0,12,2,0,0,148,5,0,0,12,1,0,0,220,5,0,0,4,3,0,0,248,5,0,0,72,6,0,0,66,5,0,0,134,0,0,0,120,2,0,0,40,4,0,0,168,2,0,0,146,1,0,0,222,2,0,0,194,4,0,0,72,5,0,0,64,0,0,0,182,5,0,0,192,5,0,0,86,0,0,0,186,3,0,0,188,1,0,0,132,0,0,0,162,3,0,0,78,0,0,0,30,2,0,0,84,3,0,0,6,3,0,0,128,5,0,0,18,1,0,0,232,0,0,0,132,4,0,0,132,2,0,0,82,2,0,0,66,6,0,0,218,2,0,0,188,5,0,0,186,5,0,0,2,1,0,0,32,6,0,0,230,1,0,0,130,5,0,0,126,4,0,0,212,1,0,0,166,1,0,0,50,0,0,0,76,2,0,0,150,5,0,0,122,1,0,0,108,0,0,0,190,2,0,0,48,1,0,0,22,4,0,0,196,5,0,0,126,5,0,0,120,3,0,0,28,5,0,0,46,4,0,0,70,0,0,0,88,2,0,0,126,1,0,0,178,1,0,0,84,2,0,0,68,4,0,0,130,1,0,0,50,3,0,0,60,5,0,0,228,2,0,0,52,3,0,0,16,4,0,0,108,1,0,0,38,4,0,0,234,0,0,0,74,4,0,0,50,6,0,0,140,0,0,0,198,3,0,0,106,1,0,0,238,2,0,0,48,4,0,0,228,0,0,0,88,5,0,0,70,5,0,0,58,5,0,0,68,6,0,0,112,0,0,0,42,2,0,0,104,1,0,0,172,1,0,0,170,4,0,0,88,1,0,0,98,5,0,0,162,5,0,0,234,2,0,0,66,4,0,0,28,4,0,0,58,2,0,0,0,1,0,0,46,1,0,0,170,0,0,0,168,0,0,0,60,4,0,0,104,3,0,0,130,3,0,0,44,4,0,0,4,4,0,0,180,2,0,0,36,3,0,0,154,1,0,0,202,1,0,0,46,3,0,0,32,2,0,0,114,2,0,0,92,3,0,0,246,2,0,0,74,0,0,0,52,0,0,0,146,5,0,0,182,4,0,0,114,4,0,0,92,2,0,0,72,3,0,0,120,4,0,0,30,4,0,0,168,3,0,0,236,5,0,0,204,2,0,0,180,4,0,0,62,5,0,0,22,2,0,0,222,1,0,0,44,3,0,0,106,0,0,0,40,6,0,0,118,0,0,0,102,5,0,0,8,6,0,0,194,0,0,0,82,5,0,0,246,5,0,0,4,5,0,0,196,0,0,0,238,4,0,0,194,5,0,0,136,3,0,0,4,6,0,0,48,3,0,0,140,3,0,0,198,1,0,0,218,1,0,0,26,5,0,0,78,5,0,0,108,2,0,0,156,3,0,0,190,3,0,0,232,4,0,0,16,1,0,0,184,4,0,0,168,5,0,0,216,3,0,0,80,2,0,0,248,0,0,0,154,0,0,0,242,1,0,0,106,4,0,0,74,3,0,0,88,3,0,0,68,0,0,0,232,5,0,0,190,5,0,0,54,1,0,0,128,4,0,0,82,0,0,0,24,6,0,0,164,2,0,0,40,5,0,0,228,3,0,0,136,4,0,0,216,0,0,0,172,3,0,0,192,3,0,0,72,4,0,0,76,3,0,0,248,3,0,0,10,4,0,0,200,3,0,0,14,1,0,0,48,5,0,0,166,4,0,0,222,0,0,0,74,2,0,0,60,2,0,0,52,4,0,0,76,1,0,0,126,3,0,0,152,5,0,0,144,4,0,0,80,4,0,0,156,2,0,0,200,4,0,0,174,0,0,0,134,4,0,0,230,3,0,0,188,2,0,0,254,3,0,0,180,3,0,0,182,0,0,0,16,3,0,0,150,0,0,0,10,6,0,0,18,3,0,0,32,3,0,0,154,5,0,0,56,4,0,0,208,5,0,0,156,4,0,0,76,5,0,0,58,1,0,0,156,1,0,0,196,3,0,0,54,0,0,0,94,1,0,0,102,0,0,0,114,5,0,0,80,5,0,0,242,5,0,0,240,5,0,0,94,5,0,0,86,5,0,0,8,2,0,0,34,4,0,0,248,4,0,0,98,1,0,0,138,2,0,0,134,1,0,0,16,2,0,0,162,1,0,0,214,0,0,0,184,5,0,0,178,4,0,0,78,1,0,0,210,3,0,0,204,4,0,0,40,1,0,0,242,3,0,0,22,1,0,0,212,4,0,0,164,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,36,65,0,0,48,66,0,0,0,0,0,0,0,0,0,0,109,95,102,105,120,116,117,114,101,67,111,117,110,116,32,62,32,48,0,0,32,32,106,100,46,109,97,120,77,111,116,111,114,84,111,114,113,117,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,101,110,97,98,108,101,76,105,109,105,116,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,32,32,106,100,46,106,111,105,110,116,50,32,61,32,106,111,105,110,116,115,91,37,100,93,59,10,0,0,32,32,106,100,46,109,97,120,70,111,114,99,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,98,50,86,101,99,50,32,103,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,32,32,32,32,102,100,46,102,105,108,116,101,114,46,109,97,115,107,66,105,116,115,32,61,32,117,105,110,116,49,54,40,37,100,41,59,10,0,0,0,48,32,60,61,32,105,66,32,38,38,32,105,66,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,102,105,120,116,117,114,101,45,62,109,95,98,111,100,121,32,61,61,32,116,104,105,115,0,32,32,106,100,46,109,111,116,111,114,83,112,101,101,100,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,103,114,111,117,110,100,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,32,32,106,100,46,106,111,105,110,116,49,32,61,32,106,111,105,110,116,115,91,37,100,93,59,10,0,0,118,101,114,116,101,120,67,111,117,110,116,32,60,61,32,56,0,0,0,0,32,32,32,32,102,100,46,102,105,108,116,101,114,46,99,97,116,101,103,111,114,121,66,105,116,115,32,61,32,117,105,110,116,49,54,40,37,100,41,59,10,0,0,0,105,65,32,33,61,32,40,45,49,41,0,0,109,95,119,111,114,108,100,45,62,73,115,76,111,99,107,101,100,40,41,32,61,61,32,102,97,108,115,101,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,66,111,100,121,46,99,112,112,0,0,32,32,106,100,46,101,110,97,98,108,101,77,111,116,111,114,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,32,32,106,100,46,103,114,111,117,110,100,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,109,109,111,110,47,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,46,99,112,112,0,0,97,108,112,104,97,48,32,60,32,49,46,48,102,0,0,0,32,32,32,32,102,100,46,105,115,83,101,110,115,111,114,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,99,104,105,108,100,50,32,33,61,32,40,45,49,41,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,108,105,110,101,97,114,68,97,109,112,105,110,103,41,32,38,38,32,98,100,45,62,108,105,110,101,97,114,68,97,109,112,105,110,103,32,62,61,32,48,46,48,102,0,0,0,99,111,117,110,116,32,62,61,32,51,0,0,32,32,106,100,46,108,111,99,97,108,65,120,105,115,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,32,32,106,100,46,114,101,102,101,114,101,110,99,101,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,109,97,120,76,101,110,103,116,104,32,61,32,37,46,49,53,108,101,102,59,10,0,0,77,111,117,115,101,32,106,111,105,110,116,32,100,117,109,112,105,110,103,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,46,10,0,0,32,32,106,100,46,108,101,110,103,116,104,32,61,32,37,46,49,53,108,101,102,59,10,0,99,104,105,108,100,49,32,33,61,32,40,45,49,41,0,0,116,121,112,101,65,32,61,61,32,98,50,95,100,121,110,97,109,105,99,66,111,100,121,32,124,124,32,116,121,112,101,66,32,61,61,32,98,50,95,100,121,110,97,109,105,99,66,111,100,121,0,0,32,32,32,32,102,100,46,100,101,110,115,105,116,121,32,61,32,37,46,49,53,108,101,102,59,10,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,105,115,116,97,110,99,101,46,99,112,112,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,109,109,111,110,47,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,46,99,112,112,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,97,110,103,117,108,97,114,68,97,109,112,105,110,103,41,32,38,38,32,98,100,45,62,97,110,103,117,108,97,114,68,97,109,112,105,110,103,32,62,61,32,48,46,48,102,0,112,32,61,61,32,101,110,116,114,121,45,62,100,97,116,97,0,0,0,0,97,114,101,97,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,0,99,104,105,108,100,73,110,100,101,120,32,60,32,109,95,99,111,117,110,116,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,48,32,60,32,99,111,117,110,116,32,38,38,32,99,111,117,110,116,32,60,32,51,0,0,100,32,43,32,104,32,42,32,107,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,112,99,45,62,112,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,83,104,97,112,101,115,47,98,50,80,111,108,121,103,111,110,83,104,97,112,101,46,99,112,112,0,0,109,95,110,111,100,101,115,91,112,114,111,120,121,73,100,93,46,73,115,76,101,97,102,40,41,0,0,0,115,116,97,99,107,67,111,117,110,116,32,60,32,115,116,97,99,107,83,105,122,101,0,0,32,32,32,32,102,100,46,114,101,115,116,105,116,117,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,99,97,99,104,101,45,62,99,111,117,110,116,32,60,61,32,51,0,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,97,110,103,117,108,97,114,86,101,108,111,99,105,116,121,41,0,0,109,95,101,110,116,114,121,67,111,117,110,116,32,62,32,48,0,0,0,0,98,108,111,99,107,67,111,117,110,116,32,42,32,98,108,111,99,107,83,105,122,101,32,60,61,32,98,50,95,99,104,117,110,107,83,105,122,101,0,0,109,95,118,101,114,116,101,120,67,111,117,110,116,32,62,61,32,51,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,109,95,99,111,117,110,116,32,45,32,49,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,98,50,73,115,86,97,108,105,100,40,100,101,102,45,62,100,97,109,112,105,110,103,82,97,116,105,111,41,32,38,38,32,100,101,102,45,62,100,97,109,112,105,110,103,82,97,116,105,111,32,62,61,32,48,46,48,102,0,0,0,32,32,98,50,71,101,97,114,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,97,46,120,32,62,61,32,48,46,48,102,32,38,38,32,97,46,121,32,62,61,32,48,46,48,102,0,0,48,32,60,61,32,116,121,112,101,65,32,38,38,32,116,121,112,101,66,32,60,32,98,50,83,104,97,112,101,58,58,101,95,116,121,112,101,67,111,117,110,116,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,83,104,97,112,101,115,47,98,50,67,104,97,105,110,83,104,97,112,101,46,99,112,112,0,0,0,0,98,45,62,73,115,65,99,116,105,118,101,40,41,32,61,61,32,116,114,117,101,0,0,0,32,32,98,50,87,104,101,101,108,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,32,32,32,32,102,100,46,102,114,105,99,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,98,50,87,101,108,100,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,109,95,99,111,117,110,116,0,0,0,32,32,98,50,82,111,112,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,97,110,103,108,101,41,0,0,0,0,109,95,101,110,116,114,121,67,111,117,110,116,32,60,32,98,50,95,109,97,120,83,116,97,99,107,69,110,116,114,105,101,115,0,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,98,50,95,98,108,111,99,107,83,105,122,101,115,0,48,46,48,102,32,60,61,32,108,111,119,101,114,32,38,38,32,108,111,119,101,114,32,60,61,32,105,110,112,117,116,46,109,97,120,70,114,97,99,116,105,111,110,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,80,117,108,108,101,121,74,111,105,110,116,46,99,112,112,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,84,105,109,101,79,102,73,109,112,97,99,116,46,99,112,112,0,99,111,117,110,116,32,62,61,32,50,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,32,32,106,100,46,99,111,108,108,105,100,101,67,111,110,110,101,99,116,101,100,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,32,32,98,50,80,117,108,108,101,121,74,111,105,110,116,68,101,102,32,106,100,59,10,0,98,50,73,115,86,97,108,105,100,40,100,101,102,45,62,102,114,101,113,117,101,110,99,121,72,122,41,32,38,38,32,100,101,102,45,62,102,114,101,113,117,101,110,99,121,72,122,32,62,61,32,48,46,48,102,0,47,47,32,68,117,109,112,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,102,111,114,32,116,104,105,115,32,106,111,105,110,116,32,116,121,112,101,46,10,0,0,32,32,32,32,98,111,100,105,101,115,91,37,100,93,45,62,67,114,101,97,116,101,70,105,120,116,117,114,101,40,38,102,100,41,59,10,0,0,0,0,32,32,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,77,111,117,115,101,74,111,105,110,116,46,99,112,112,0,112,111,105,110,116,67,111,117,110,116,32,61,61,32,49,32,124,124,32,112,111,105,110,116,67,111,117,110,116,32,61,61,32,50,0,0,115,95,105,110,105,116,105,97,108,105,122,101,100,32,61,61,32,116,114,117,101,0,0,0,32,32,32,32,102,100,46,115,104,97,112,101,32,61,32,38,115,104,97,112,101,59,10,0,109,95,106,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,0,0,48,32,60,32,109,95,110,111,100,101,67,111,117,110,116,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,74,111,105,110,116,46,99,112,112,0,0,32,32,32,32,98,50,70,105,120,116,117,114,101,68,101,102,32,102,100,59,10,0,0,0,10,0,0,0,32,32,125,10,0,0,0,0,110,111,100,101,45,62,73,115,76,101,97,102,40,41,32,61,61,32,102,97,108,115,101,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,71,101,97,114,74,111,105,110,116,46,99,112,112,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,78,101,120,116,86,101,114,116,101,120,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,32,32,123,10,0,0,0,0,109,95,110,111,100,101,67,111,117,110,116,32,43,32,102,114,101,101,67,111,117,110,116,32,61,61,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,105,115,116,97,110,99,101,46,104,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,80,114,101,118,86,101,114,116,101,120,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,71,101,116,72,101,105,103,104,116,40,41,32,61,61,32,67,111,109,112,117,116,101,72,101,105,103,104,116,40,41,0,0,48,32,60,61,32,102,114,101,101,73,110,100,101,120,32,38,38,32,102,114,101,101,73,110,100,101,120,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,0,109,95,98,111,100,121,67,111,117,110,116,32,60,32,109,95,98,111,100,121,67,97,112,97,99,105,116,121,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,110,101,120,116,86,101,114,116,101,120,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,32,32,98,111,100,105,101,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,66,111,100,121,40,38,98,100,41,59,10,0,0,0,32,32,98,50,68,105,115,116,97,110,99,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,98,100,45,62,108,105,110,101,97,114,86,101,108,111,99,105,116,121,46,73,115,86,97,108,105,100,40,41,0,0,0,0,109,95,101,110,116,114,121,67,111,117,110,116,32,61,61,32,48,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,46,99,112,112,0,0,0,109,95,99,111,110,116,97,99,116,67,111,117,110,116,32,60,32,109,95,99,111,110,116,97,99,116,67,97,112,97,99,105,116,121,0,0,32,32,32,32,115,104,97,112,101,46,109,95,112,114,101,118,86,101,114,116,101,120,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,32,32,98,100,46,103,114,97,118,105,116,121,83,99,97,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,97,97,98,98,46,117,112,112,101,114,66,111,117,110,100,32,61,61,32,110,111,100,101,45,62,97,97,98,98,46,117,112,112,101,114,66,111,117,110,100,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,0,109,95,106,111,105,110,116,67,111,117,110,116,32,60,32,109,95,106,111,105,110,116,67,97,112,97,99,105,116,121,0,0,32,32,32,32,115,104,97,112,101,46,67,114,101,97,116,101,67,104,97,105,110,40,118,115,44,32,37,100,41,59,10,0,32,32,98,100,46,97,99,116,105,118,101,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,48,32,60,32,115,105,122,101,0,0,0,0,97,97,98,98,46,108,111,119,101,114,66,111,117,110,100,32,61,61,32,110,111,100,101,45,62,97,97,98,98,46,108,111,119,101,114,66,111,117,110,100,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,101,100,103,101,46,76,101,110,103,116,104,83,113,117,97,114,101,100,40,41,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,32,42,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,73,115,108,97,110,100,46,104,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,32,32,32,32,98,50,67,104,97,105,110,83,104,97,112,101,32,115,104,97,112,101,59,10,0,0,0,0,32,32,98,100,46,98,117,108,108,101,116,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,110,111,100,101,45,62,104,101,105,103,104,116,32,61,61,32,104,101,105,103,104,116,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,109,109,111,110,47,98,50,77,97,116,104,46,104,0,0,32,32,106,100,46,98,111,100,121,66,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,32,32,32,32,115,104,97,112,101,46,83,101,116,40,118,115,44,32,37,100,41,59,10,0,32,32,98,100,46,102,105,120,101,100,82,111,116,97,116,105,111,110,32,61,32,98,111,111,108,40,37,100,41,59,10,0,109,95,110,111,100,101,115,91,99,104,105,108,100,50,93,46,112,97,114,101,110,116,32,61,61,32,105,110,100,101,120,0,32,32,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,100,101,102,45,62,114,97,116,105,111,32,33,61,32,48,46,48,102,0,0,32,32,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,98,50,73,115,86,97,108,105,100,40,100,101,102,45,62,109,97,120,70,111,114,99,101,41,32,38,38,32,100,101,102,45,62,109,97,120,70,111,114,99,101,32,62,61,32,48,46,48,102,0,0,0,100,101,102,45,62,98,111,100,121,65,32,33,61,32,100,101,102,45,62,98,111,100,121,66,0,0,0,0,32,32,32,32,118,115,91,37,100,93,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,32,32,98,100,46,97,119,97,107,101,32,61,32,98,111,111,108,40,37,100,41,59,10,0,109,95,116,121,112,101,66,32,61,61,32,101,95,114,101,118,111,108,117,116,101,74,111,105,110,116,32,124,124,32,109,95,116,121,112,101,66,32,61,61,32,101,95,112,114,105,115,109,97,116,105,99,74,111,105,110,116,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,46,99,112,112,0,0,0,0,109,95,110,111,100,101,115,91,99,104,105,108,100,49,93,46,112,97,114,101,110,116,32,61,61,32,105,110,100,101,120,0,109,95,102,105,120,116,117,114,101,66,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,112,111,108,121,103,111,110,0,109,95,102,105,120,116,117,114,101,66,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,99,105,114,99,108,101,0,0,109,97,110,105,102,111,108,100,45,62,112,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,0,0,48,32,60,61,32,116,121,112,101,50,32,38,38,32,116,121,112,101,50,32,60,32,98,50,83,104,97,112,101,58,58,101,95,116,121,112,101,67,111,117,110,116,0,0,32,32,32,32,98,50,86,101,99,50,32,118,115,91,37,100,93,59,10,0,32,32,98,100,46,97,108,108,111,119,83,108,101,101,112,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,48,32,60,61,32,99,104,105,108,100,50,32,38,38,32,99,104,105,108,100,50,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,32,32,98,100,46,97,110,103,117,108,97,114,68,97,109,112,105,110,103,32,61,32,37,46,49,53,108,101,102,59,10,0,109,95,98,111,100,121,67,111,117,110,116,32,62,32,48,0,116,111,105,73,110,100,101,120,66,32,60,32,109,95,98,111,100,121,67,111,117,110,116,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,111,110,116,97,99,116,46,99,112,112,0,0,48,32,60,61,32,110,111,100,101,73,100,32,38,38,32,110,111,100,101,73,100,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,32,32,32,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,115,104,97,112,101,59,10,0,0,48,32,60,61,32,112,114,111,120,121,73,100,32,38,38,32,112,114,111,120,121,73,100,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,46,99,112,112,0,0,0,48,32,60,61,32,99,104,105,108,100,49,32,38,38,32,99,104,105,108,100,49,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,32,32,98,100,46,108,105,110,101,97,114,68,97,109,112,105,110,103,32,61,32,37,46,49,53,108,101,102,59,10,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,114,46,76,101,110,103,116,104,83,113,117,97,114,101,100,40,41,32,62,32,48,46,48,102,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,86,101,114,116,101,120,51,32,61,32,98,111,111,108,40,37,100,41,59,10,0,110,111,100,101,45,62,104,101,105,103,104,116,32,61,61,32,48,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,67,111,108,108,105,100,101,80,111,108,121,103,111,110,46,99,112,112,0,0,0,32,32,98,100,46,97,110,103,117,108,97,114,86,101,108,111,99,105,116,121,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,121,110,97,109,105,99,84,114,101,101,46,104,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,86,101,114,116,101,120,48,32,61,32,98,111,111,108,40,37,100,41,59,10,0,99,104,105,108,100,50,32,61,61,32,40,45,49,41,0,0,32,32,98,100,46,108,105,110,101,97,114,86,101,108,111,99,105,116,121,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,98,111,100,105,101,115,32,61,32,78,85,76,76,59,10,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,51,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,32,32,98,100,46,97,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,98,100,45,62,112,111,115,105,116,105,111,110,46,73,115,86,97,108,105,100,40,41,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,87,111,114,108,100,46,99,112,112,0,109,95,105,110,100,101,120,32,61,61,32,48,0,0,0,0,109,95,110,111,100,101,115,91,105,110,100,101,120,93,46,112,97,114,101,110,116,32,61,61,32,40,45,49,41,0,0,0,106,111,105,110,116,115,32,61,32,78,85,76,76,59,10,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,50,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,73,115,108,97,110,100,46,99,112,112,0,0,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,99,104,97,105,110,45,62,109,95,99,111,117,110,116,0,0,0,0,32,32,98,100,46,112,111,115,105,116,105,111,110,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,98,50,70,114,101,101,40,98,111,100,105,101,115,41,59,10,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,49,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,106,32,60,32,98,50,95,98,108,111,99,107,83,105,122,101,115,0,0,0,109,95,110,111,100,101,115,91,66,45,62,112,97,114,101,110,116,93,46,99,104,105,108,100,50,32,61,61,32,105,65,0,32,32,98,100,46,116,121,112,101,32,61,32,98,50,66,111,100,121,84,121,112,101,40,37,100,41,59,10,0,0,0,0,32,32,106,100,46,109,97,120,77,111,116,111,114,70,111,114,99,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,51,32,60,61,32,99,111,117,110,116,32,38,38,32,99,111,117,110,116,32,60,61,32,56,0,0,0,0,98,50,70,114,101,101,40,106,111,105,110,116,115,41,59,10,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,48,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,48,32,60,61,32,105,69,32,38,38,32,105,69,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,32,32,98,50,66,111,100,121,68,101,102,32,98,100,59,10,0,0,0,0,109,95,118,101,114,116,105,99,101,115,32,61,61,32,95,95,110,117,108,108,32,38,38,32,109,95,99,111,117,110,116,32,61,61,32,48,0,0,0,0,48,32,60,61,32,105,68,32,38,38,32,105,68,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,125,10,0,0,32,32,106,100,46,98,111,100,121,65,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,32,32,32,32,98,50,69,100,103,101,83,104,97,112,101,32,115,104,97,112,101,59,10,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,121,110,97,109,105,99,84,114,101,101,46,99,112,112,0,0,116,97,114,103,101,116,32,62,32,116,111,108,101,114,97,110,99,101,0,0,114,97,116,105,111,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,32,32,106,100,46,114,97,116,105,111,32,61,32,37,46,49,53,108,101,102,59,10,0,0,100,101,102,45,62,116,97,114,103,101,116,46,73,115,86,97,108,105,100,40,41,0,0,0,109,95,110,111,100,101,115,91,67,45,62,112,97,114,101,110,116,93,46,99,104,105,108,100,50,32,61,61,32,105,65,0,123,10,0,0,102,97,108,115,101,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,112,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,109,95,116,121,112,101,65,32,61,61,32,101,95,114,101,118,111,108,117,116,101,74,111,105,110,116,32,124,124,32,109,95,116,121,112,101,65,32,61,61,32,101,95,112,114,105,115,109,97,116,105,99,74,111,105,110,116,0,0,0,48,32,60,61,32,101,100,103,101,49,32,38,38,32,101,100,103,101,49,32,60,32,112,111,108,121,49,45,62,109,95,118,101,114,116,101,120,67,111,117,110,116,0,0,109,95,73,32,62,32,48,46,48,102,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,112,111,108,121,103,111,110,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,101,100,103,101,0,0,0,0,32,32,106,111,105,110,116,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,74,111,105,110,116,40,38,106,100,41,59,10,0,0,32,32,106,100,46,108,101,110,103,116,104,66,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,32,32,106,100,46,117,112,112,101,114,84,114,97,110,115,108,97,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,112,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,98,50,74,111,105,110,116,42,42,32,106,111,105,110,116,115,32,61,32,40,98,50,74,111,105,110,116,42,42,41,98,50,65,108,108,111,99,40,37,100,32,42,32,115,105,122,101,111,102,40,98,50,74,111,105,110,116,42,41,41,59,10,0,0,48,32,60,61,32,116,121,112,101,49,32,38,38,32,116,121,112,101,49,32,60,32,98,50,83,104,97,112,101,58,58,101,95,116,121,112,101,67,111,117,110,116,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,99,105,114,99,108,101,0,0,32,32,32,32,115,104,97,112,101,46,109,95,114,97,100,105,117,115,32,61,32,37,46,49,53,108,101,102,59,10,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,99,104,97,105,110,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,70,105,120,116,117,114,101,46,99,112,112,0,0,0,48,32,60,61,32,105,71,32,38,38,32,105,71,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,109,95,116,121,112,101,32,61,61,32,98,50,95,100,121,110,97,109,105,99,66,111,100,121,0,0,0,0,73,115,76,111,99,107,101,100,40,41,32,61,61,32,102,97,108,115,101,0,116,111,105,73,110,100,101,120,65,32,60,32,109,95,98,111,100,121,67,111,117,110,116,0,109,95,110,111,100,101,67,111,117,110,116,32,61,61,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,32,32,106,100,46,100,97,109,112,105,110,103,82,97,116,105,111,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,32,32,106,100,46,117,112,112,101,114,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,108,101,110,103,116,104,65,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,32,32,106,100,46,108,111,119,101,114,84,114,97,110,115,108,97,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,109,95,112,114,111,120,121,67,111,117,110,116,32,61,61,32,48,0,0,0,98,50,66,111,100,121,42,42,32,98,111,100,105,101,115,32,61,32,40,98].concat([50,66,111,100,121,42,42,41,98,50,65,108,108,111,99,40,37,100,32,42,32,115,105,122,101,111,102,40,98,50,66,111,100,121,42,41,41,59,10,0,32,32,32,32,98,50,67,105,114,99,108,101,83,104,97,112,101,32,115,104,97,112,101,59,10,0,0,0,48,32,60,61,32,105,70,32,38,38,32,105,70,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,102,111,117,110,100,0,0,0,32,32,106,100,46,102,114,101,113,117,101,110,99,121,72,122,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,32,32,106,100,46,108,111,119,101,114,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,109,97,120,84,111,114,113,117,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,109,95,119,111,114,108,100,45,62,83,101,116,71,114,97,118,105,116,121,40,103,41,59,10,0,0,0,0,32,32,32,32,102,100,46,102,105,108,116,101,114,46,103,114,111,117,112,73,110,100,101,120,32,61,32,105,110,116,49,54,40,37,100,41,59,10,0,0,48,32,60,61,32,105,67,32,38,38,32,105,67,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,100,101,110,32,62,32,48,46,48,102,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,67,111,108,108,105,100,101,69,100,103,101,46,99,112,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,102,108,111,97,116,51,50,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,77,101,116,114,105,99,40,41,32,99,111,110,115,116,0,0,0,0,98,50,86,101,99,50,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,83,101,97,114,99,104,68,105,114,101,99,116,105,111,110,40,41,32,99,111,110,115,116,0,0,0,0,118,111,105,100,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,87,105,116,110,101,115,115,80,111,105,110,116,115,40,98,50,86,101,99,50,32,42,44,32,98,50,86,101,99,50,32,42,41,32,99,111,110,115,116,0,0,98,50,86,101,99,50,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,67,108,111,115,101,115,116,80,111,105,110,116,40,41,32,99,111,110,115,116,0,0,0,102,108,111,97,116,51,50,32,98,50,83,101,112,97,114,97,116,105,111,110,70,117,110,99,116,105,111,110,58,58,69,118,97,108,117,97,116,101,40,105,110,116,51,50,44,32,105,110,116,51,50,44,32,102,108,111,97,116,51,50,41,32,99,111,110,115,116,0,102,108,111,97,116,51,50,32,98,50,83,101,112,97,114,97,116,105,111,110,70,117,110,99,116,105,111,110,58,58,70,105,110,100,77,105,110,83,101,112,97,114,97,116,105,111,110,40,105,110,116,51,50,32,42,44,32,105,110,116,51,50,32,42,44,32,102,108,111,97,116,51,50,41,32,99,111,110,115,116,0,0,0,0,99,111,110,115,116,32,98,50,86,101,99,50,32,38,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,58,58,71,101,116,86,101,114,116,101,120,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,118,105,114,116,117,97,108,32,98,111,111,108,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,58,58,82,97,121,67,97,115,116,40,98,50,82,97,121,67,97,115,116,79,117,116,112,117,116,32,42,44,32,99,111,110,115,116,32,98,50,82,97,121,67,97,115,116,73,110,112,117,116,32,38,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,118,105,114,116,117,97,108,32,118,111,105,100,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,58,58,67,111,109,112,117,116,101,77,97,115,115,40,98,50,77,97,115,115,68,97,116,97,32,42,44,32,102,108,111,97,116,51,50,41,32,99,111,110,115,116,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,86,97,108,105,100,97,116,101,40,41,32,99,111,110,115,116,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,82,97,121,67,97,115,116,40,84,32,42,44,32,99,111,110,115,116,32,98,50,82,97,121,67,97,115,116,73,110,112,117,116,32,38,41,32,99,111,110,115,116,32,91,84,32,61,32,98,50,87,111,114,108,100,82,97,121,67,97,115,116,87,114,97,112,112,101,114,93,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,86,97,108,105,100,97,116,101,83,116,114,117,99,116,117,114,101,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,86,97,108,105,100,97,116,101,77,101,116,114,105,99,115,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,71,101,116,77,97,120,66,97,108,97,110,99,101,40,41,32,99,111,110,115,116,0,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,67,111,109,112,117,116,101,72,101,105,103,104,116,40,105,110,116,51,50,41,32,99,111,110,115,116,0,118,111,105,100,32,42,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,71,101,116,85,115,101,114,68,97,116,97,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,99,111,110,115,116,32,98,50,65,65,66,66,32,38,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,71,101,116,70,97,116,65,65,66,66,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,118,105,114,116,117,97,108,32,98,111,111,108,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,82,97,121,67,97,115,116,40,98,50,82,97,121,67,97,115,116,79,117,116,112,117,116,32,42,44,32,99,111,110,115,116,32,98,50,82,97,121,67,97,115,116,73,110,112,117,116,32,38,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,71,101,116,67,104,105,108,100,69,100,103,101,40,98,50,69,100,103,101,83,104,97,112,101,32,42,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,118,105,114,116,117,97,108,32,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,67,111,109,112,117,116,101,65,65,66,66,40,98,50,65,65,66,66,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,0,118,111,105,100,32,98,50,83,105,109,112,108,101,120,58,58,82,101,97,100,67,97,99,104,101,40,99,111,110,115,116,32,98,50,83,105,109,112,108,101,120,67,97,99,104,101,32,42,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,118,111,105,100,32,98,50,70,105,120,116,117,114,101,58,58,68,101,115,116,114,111,121,40,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,118,111,105,100,32,98,50,70,105,120,116,117,114,101,58,58,67,114,101,97,116,101,80,114,111,120,105,101,115,40,98,50,66,114,111,97,100,80,104,97,115,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,115,116,97,116,105,99,32,118,111,105,100,32,98,50,67,111,110,116,97,99,116,58,58,68,101,115,116,114,111,121,40,98,50,67,111,110,116,97,99,116,32,42,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,115,116,97,116,105,99,32,98,50,67,111,110,116,97,99,116,32,42,98,50,67,111,110,116,97,99,116,58,58,67,114,101,97,116,101,40,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,83,111,108,118,101,84,79,73,40,99,111,110,115,116,32,98,50,84,105,109,101,83,116,101,112,32,38,44,32,105,110,116,51,50,44,32,105,110,116,51,50,41,0,0,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,65,100,100,40,98,50,67,111,110,116,97,99,116,32,42,41,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,65,100,100,40,98,50,74,111,105,110,116,32,42,41,0,0,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,65,100,100,40,98,50,66,111,100,121,32,42,41,0,0,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,68,114,97,119,83,104,97,112,101,40,98,50,70,105,120,116,117,114,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,67,111,108,111,114,32,38,41,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,83,111,108,118,101,84,79,73,40,99,111,110,115,116,32,98,50,84,105,109,101,83,116,101,112,32,38,41,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,83,111,108,118,101,40,99,111,110,115,116,32,98,50,84,105,109,101,83,116,101,112,32,38,41,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,68,101,115,116,114,111,121,74,111,105,110,116,40,98,50,74,111,105,110,116,32,42,41,0,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,68,101,115,116,114,111,121,66,111,100,121,40,98,50,66,111,100,121,32,42,41,0,98,50,74,111,105,110,116,32,42,98,50,87,111,114,108,100,58,58,67,114,101,97,116,101,74,111,105,110,116,40,99,111,110,115,116,32,98,50,74,111,105,110,116,68,101,102,32,42,41,0,0,0,98,50,66,111,100,121,32,42,98,50,87,111,114,108,100,58,58,67,114,101,97,116,101,66,111,100,121,40,99,111,110,115,116,32,98,50,66,111,100,121,68,101,102,32,42,41,0,0,118,111,105,100,32,98,50,83,119,101,101,112,58,58,65,100,118,97,110,99,101,40,102,108,111,97,116,51,50,41,0,0,98,50,74,111,105,110,116,58,58,98,50,74,111,105,110,116,40,99,111,110,115,116,32,98,50,74,111,105,110,116,68,101,102,32,42,41,0,0,0,0,115,116,97,116,105,99,32,118,111,105,100,32,98,50,74,111,105,110,116,58,58,68,101,115,116,114,111,121,40,98,50,74,111,105,110,116,32,42,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,115,116,97,116,105,99,32,98,50,74,111,105,110,116,32,42,98,50,74,111,105,110,116,58,58,67,114,101,97,116,101,40,99,111,110,115,116,32,98,50,74,111,105,110,116,68,101,102,32,42,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,98,50,66,111,100,121,58,58,98,50,66,111,100,121,40,99,111,110,115,116,32,98,50,66,111,100,121,68,101,102,32,42,44,32,98,50,87,111,114,108,100,32,42,41,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,65,99,116,105,118,101,40,98,111,111,108,41,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,84,121,112,101,40,98,50,66,111,100,121,84,121,112,101,41,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,68,101,115,116,114,111,121,70,105,120,116,117,114,101,40,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,82,101,115,101,116,77,97,115,115,68,97,116,97,40,41,0,0,0,0,98,50,70,105,120,116,117,114,101,32,42,98,50,66,111,100,121,58,58,67,114,101,97,116,101,70,105,120,116,117,114,101,40,99,111,110,115,116,32,98,50,70,105,120,116,117,114,101,68,101,102,32,42,41,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,84,114,97,110,115,102,111,114,109,40,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,102,108,111,97,116,51,50,41,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,77,97,115,115,68,97,116,97,40,99,111,110,115,116,32,98,50,77,97,115,115,68,97,116,97,32,42,41,0,0,0,0,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,118,111,105,100,32,98,50,80,111,115,105,116,105,111,110,83,111,108,118,101,114,77,97,110,105,102,111,108,100,58,58,73,110,105,116,105,97,108,105,122,101,40,98,50,67,111,110,116,97,99,116,80,111,115,105,116,105,111,110,67,111,110,115,116,114,97,105,110,116,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,0,0,0,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,58,58,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,41,0,0,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,58,58,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,41,0,0,0,0,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,102,108,111,97,116,51,50,32,98,50,83,101,112,97,114,97,116,105,111,110,70,117,110,99,116,105,111,110,58,58,73,110,105,116,105,97,108,105,122,101,40,99,111,110,115,116,32,98,50,83,105,109,112,108,101,120,67,97,99,104,101,32,42,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,83,119,101,101,112,32,38,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,83,119,101,101,112,32,38,44,32,102,108,111,97,116,51,50,41,0,0,0,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,58,58,126,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,40,41,0,0,0,118,111,105,100,32,42,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,58,58,65,108,108,111,99,97,116,101,40,105,110,116,51,50,41,0,118,111,105,100,32,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,58,58,70,114,101,101,40,118,111,105,100,32,42,41,0,118,111,105,100,32,98,50,80,117,108,108,101,121,74,111,105,110,116,68,101,102,58,58,73,110,105,116,105,97,108,105,122,101,40,98,50,66,111,100,121,32,42,44,32,98,50,66,111,100,121,32,42,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,102,108,111,97,116,51,50,41,0,0,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,58,58,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,58,58,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,40,41,0,0,0,0,118,111,105,100,32,42,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,58,58,65,108,108,111,99,97,116,101,40,105,110,116,51,50,41,0,118,111,105,100,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,58,58,70,114,101,101,40,118,111,105,100,32,42,44,32,105,110,116,51,50,41,0,0,118,111,105,100,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,58,58,83,101,116,40,99,111,110,115,116,32,98,50,83,104,97,112,101,32,42,44,32,105,110,116,51,50,41,0,0,0,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,58,58,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,40,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,68,101,102,32,42,41,0,0,118,111,105,100,32,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,58,58,73,110,105,116,105,97,108,105,122,101,86,101,108,111,99,105,116,121,67,111,110,115,116,114,97,105,110,116,115,40,41,0,0,0,118,111,105,100,32,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,58,58,83,111,108,118,101,86,101,108,111,99,105,116,121,67,111,110,115,116,114,97,105,110,116,115,40,41,0,0,0,0,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,118,111,105,100,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,58,58,83,101,116,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,98,50,80,117,108,108,101,121,74,111,105,110,116,58,58,98,50,80,117,108,108,101,121,74,111,105,110,116,40,99,111,110,115,116,32,98,50,80,117,108,108,101,121,74,111,105,110,116,68,101,102,32,42,41,0,0,98,111,111,108,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,77,111,118,101,80,114,111,120,121,40,105,110,116,51,50,44,32,99,111,110,115,116,32,98,50,65,65,66,66,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,41,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,70,114,101,101,78,111,100,101,40,105,110,116,51,50,41,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,66,97,108,97,110,99,101,40,105,110,116,51,50,41,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,68,101,115,116,114,111,121,80,114,111,120,121,40,105,110,116,51,50,41,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,65,108,108,111,99,97,116,101,78,111,100,101,40,41,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,73,110,115,101,114,116,76,101,97,102,40,105,110,116,51,50,41,0,0,0,98,50,77,111,117,115,101,74,111,105,110,116,58,58,98,50,77,111,117,115,101,74,111,105,110,116,40,99,111,110,115,116,32,98,50,77,111,117,115,101,74,111,105,110,116,68,101,102,32,42,41,0,118,105,114,116,117,97,108,32,118,111,105,100,32,98,50,77,111,117,115,101,74,111,105,110,116,58,58,73,110,105,116,86,101,108,111,99,105,116,121,67,111,110,115,116,114,97,105,110,116,115,40,99,111,110,115,116,32,98,50,83,111,108,118,101,114,68,97,116,97,32,38,41,0,0,0,0,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,67,114,101,97,116,101,67,104,97,105,110,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,0,0,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,67,114,101,97,116,101,76,111,111,112,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,0,0,0,98,50,71,101,97,114,74,111,105,110,116,58,58,98,50,71,101,97,114,74,111,105,110,116,40,99,111,110,115,116,32,98,50,71,101,97,114,74,111,105,110,116,68,101,102,32,42,41,0,0,0,0,118,111,105,100,32,98,50,70,105,110,100,73,110,99,105,100,101,110,116,69,100,103,101,40,98,50,67,108,105,112,86,101,114,116,101,120,32,42,44,32,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,44,32,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,0,102,108,111,97,116,51,50,32,98,50,69,100,103,101,83,101,112,97,114,97,116,105,111,110,40,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,44,32,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,98,50,86,101,99,50,32,67,111,109,112,117,116,101,67,101,110,116,114,111,105,100,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,0,0,118,111,105,100,32,98,50,67,111,108,108,105,100,101,69,100,103,101,65,110,100,67,105,114,99,108,101,40,98,50,77,97,110,105,102,111,108,100,32,42,44,32,99,111,110,115,116,32,98,50,69,100,103,101,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,67,105,114,99,108,101,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,118,111,105,100,32,98,50,84,105,109,101,79,102,73,109,112,97,99,116,40,98,50,84,79,73,79,117,116,112,117,116,32,42,44,32,99,111,110,115,116,32,98,50,84,79,73,73,110,112,117,116,32,42,41,0,0,118,111,105,100,32,98,50,68,105,115,116,97,110,99,101,40,98,50,68,105,115,116,97,110,99,101,79,117,116,112,117,116,32,42,44,32,98,50,83,105,109,112,108,101,120,67,97,99,104,101,32,42,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,73,110,112,117,116,32,42,41,0,0,0,0,0,0,204,70,0,0,176,0,0,0,230,2,0,0,224,3,0,0,0,0,0,0,0,0,0,0,252,70,0,0,78,4,0,0,244,1,0,0,90,2,0,0,0,0,0,0,0,0,0,0,12,71,0,0,78,4,0,0,78,4,0,0,78,4,0,0,78,4,0,0,226,0,0,0,242,2,0,0,72,0,0,0,78,4,0,0,78,4,0,0,78,4,0,0,0,0,0,0,0,0,0,0,20,71,0,0,124,2,0,0,172,0,0,0,54,5,0,0,0,0,0,0,0,0,0,0,32,71,0,0,108,3,0,0,246,0,0,0,168,1,0,0,0,0,0,0,0,0,0,0,44,71,0,0,172,2,0,0,130,2,0,0,44,2,0,0,0,0,0,0,0,0,0,0,56,71,0,0,180,1,0,0,164,3,0,0,36,4,0,0,0,0,0,0,0,0,0,0,68,71,0,0,150,4,0,0,206,5,0,0,58,3,0,0,0,0,0,0,0,0,0,0,80,71,0,0,66,2,0,0,240,1,0,0,46,5,0,0,178,3,0,0,176,1,0,0,144,5,0,0,0,0,0,0,0,0,0,0,88,71,0,0,202,0,0,0,200,2,0,0,104,4,0,0,64,4,0,0,58,0,0,0,174,1,0,0,20,2,0,0,56,0,0,0,98,3,0,0,192,2,0,0,0,0,0,0,0,0,0,0,100,71,0,0,68,5,0,0,74,5,0,0,20,1,0,0,0,0,0,0,0,0,0,0,112,71,0,0,210,4,0,0,214,1,0,0,18,2,0,0,100,3,0,0,152,0,0,0,92,0,0,0,46,6,0,0,216,4,0,0,106,5,0,0,254,0,0,0,0,0,0,0,0,0,0,0,124,71,0,0,186,4,0,0,186,2,0,0,164,4,0,0,228,5,0,0,44,1,0,0,64,5,0,0,0,2,0,0,132,1,0,0,198,4,0,0,188,4,0,0,0,0,0,0,0,0,0,0,136,71,0,0,22,6,0,0,222,4,0,0,224,5,0,0,160,2,0,0,112,5,0,0,6,6,0,0,100,0,0,0,208,0,0,0,252,5,0,0,250,5,0,0,0,0,0,0,0,0,0,0,148,71,0,0,74,1,0,0,252,3,0,0,250,4,0,0,0,0,0,0,0,0,0,0,156,71,0,0,38,5,0,0,144,3,0,0,6,4,0,0,0,0,0,0,0,0,0,0,168,71,0,0,64,2,0,0,30,3,0,0,96,3,0,0,162,0,0,0,38,6,0,0,80,0,0,0,218,4,0,0,42,5,0,0,0,0,0,0,0,0,0,0,180,71,0,0,8,4,0,0,128,1,0,0,0,6,0,0,106,2,0,0,30,1,0,0,28,1,0,0,100,4,0,0,188,0,0,0,50,2,0,0,196,1,0,0,0,0,0,0,0,0,0,0,192,71,0,0,184,1,0,0,80,1,0,0,86,2,0,0,112,3,0,0,88,4,0,0,140,5,0,0,144,0,0,0,100,1,0,0,0,0,0,0,0,0,0,0,204,71,0,0,36,6,0,0,6,2,0,0,250,1,0,0,174,4,0,0,178,5,0,0,42,0,0,0,144,2,0,0,142,2,0,0,20,5,0,0,158,4,0,0,0,0,0,0,0,0,0,0,216,71,0,0,118,1,0,0,86,4,0,0,136,2,0,0,78,2,0,0,10,5,0,0,230,5,0,0,74,6,0,0,110,3,0,0,226,4,0,0,24,3,0,0,0,0,0,0,0,0,0,0,228,71,0,0,64,1,0,0,102,4,0,0,158,5,0,0,244,2,0,0,234,5,0,0,170,2,0,0,142,1,0,0,44,0,0,0,0,0,0,0,0,0,0,0,240,71,0,0,208,2,0,0,204,5,0,0,212,5,0,0,254,2,0,0,92,5,0,0,136,1,0,0,254,1,0,0,204,1,0,0,14,4,0,0,26,6,0,0,0,0,0,0,0,0,0,0,252,71,0,0,138,3,0,0,218,0,0,0,38,3,0,0,86,3,0,0,48,6,0,0,240,4,0,0,184,0,0,0,92,1,0,0,36,2,0,0,244,5,0,0,0,0,0,0,0,0,0,0,8,72,0,0,112,2,0,0,118,3,0,0,88,0,0,0,166,2,0,0,232,2,0,0,134,5,0,0,62,1,0,0,236,3,0,0,142,3,0,0,226,5,0,0,0,0,0,0,0,0,0,0,20,72,0,0,180,0,0,0,98,0,0,0,124,4,0,0,118,4,0,0,166,5,0,0,20,6,0,0,4,1,0,0,62,6,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,57,98,50,67,111,110,116,97,99,116,0,0,55,98,50,83,104,97,112,101,0,0,0,0,55,98,50,74,111,105,110,116,0,0,0,0,50,53,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,50,52,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,50,51,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,0,50,51,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,50,50,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,0,49,55,98,50,67,111,110,116,97,99,116,76,105,115,116,101,110,101,114,0,49,54,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,0,0,49,54,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,49,53,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,0,0,0,49,53,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,0,0,0,49,53,98,50,68,105,115,116,97,110,99,101,74,111,105,110,116,0,0,0,49,53,98,50,67,111,110,116,97,99,116,70,105,108,116,101,114,0,0,0,49,53,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,49,52,98,50,80,111,108,121,103,111,110,83,104,97,112,101,0,0,0,0,49,51,98,50,80,117,108,108,101,121,74,111,105,110,116,0,49,51,98,50,67,105,114,99,108,101,83,104,97,112,101,0,49,50,98,50,87,104,101,101,108,74,111,105,110,116,0,0,49,50,98,50,77,111,117,115,101,74,111,105,110,116,0,0,49,50,98,50,67,104,97,105,110,83,104,97,112,101,0,0,49,49,98,50,87,101,108,100,74,111,105,110,116,0,0,0,49,49,98,50,82,111,112,101,74,111,105,110,116,0,0,0,49,49,98,50,71,101,97,114,74,111,105,110,116,0,0,0,49,49,98,50,69,100,103,101,83,104,97,112,101,0,0,0,0,0,0,0,64,68,0,0,0,0,0,0,80,68,0,0,0,0,0,0,0,0,0,0,96,68,0,0,228,70,0,0,0,0,0,0,136,68,0,0,240,70,0,0,0,0,0,0,172,68,0,0,196,70,0,0,0,0,0,0,208,68,0,0,0,0,0,0,220,68,0,0,0,0,0,0,232,68,0,0,0,0,0,0,244,68,0,0,252,70,0,0,0,0,0,0,16,69,0,0,252,70,0,0,0,0,0,0,44,69,0,0,252,70,0,0,0,0,0,0,72,69,0,0,252,70,0,0,0,0,0,0,100,69,0,0,252,70,0,0,0,0,0,0,128,69,0,0,0,0,0,0,148,69,0,0,12,71,0,0,0,0,0,0,168,69,0,0,252,70,0,0,0,0,0,0,188,69,0,0,12,71,0,0,0,0,0,0,208,69,0,0,12,71,0,0,0,0,0,0,228,69,0,0,12,71,0,0,0,0,0,0,248,69,0,0,0,0,0,0,12,70,0,0,252,70,0,0,0,0,0,0,32,70,0,0,4,71,0,0,0,0,0,0,52,70,0,0,12,71,0,0,0,0,0,0,68,70,0,0,4,71,0,0,0,0,0,0,84,70,0,0,12,71,0,0,0,0,0,0,100,70,0,0,12,71,0,0,0,0,0,0,116,70,0,0,4,71,0,0,0,0,0,0,132,70,0,0,12,71,0,0,0,0,0,0,148,70,0,0,12,71,0,0,0,0,0,0,164,70,0,0,12,71,0,0,0,0,0,0,180,70,0,0,4,71,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,32,0,0,0,64,0,0,0,96,0,0,0,128,0,0,0,160,0,0,0,192,0,0,0,224,0,0,0,0,1,0,0,64,1,0,0,128,1,0,0,192,1,0,0,0,2,0,0,128,2,0,0,0,0,0,0,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(8))>>2)]=(1268);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(12))>>2)]=(810);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(16))>>2)]=(400);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(20))>>2)]=(896);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(24))>>2)]=(1086);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(28))>>2)]=(1252);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(32))>>2)]=(574);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(36))>>2)]=(640);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(8))>>2)]=(1268);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(12))>>2)]=(1538);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(16))>>2)]=(400);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(20))>>2)]=(896);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(24))>>2)]=(1086);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(28))>>2)]=(1214);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(32))>>2)]=(628);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(36))>>2)]=(928);
HEAP32[((18116)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18124)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18132)>>2)]=__ZTISt9exception;
HEAP32[((18136)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18148)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18160)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18172)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18180)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18188)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18196)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18208)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18220)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18232)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18244)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18256)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18264)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18276)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18288)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18300)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18312)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18324)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((18332)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18344)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18356)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18368)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18380)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18392)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18404)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18416)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18428)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18440)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((18452)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
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
  var ERRNO_CODES={E2BIG:7,EACCES:13,EADDRINUSE:98,EADDRNOTAVAIL:99,EAFNOSUPPORT:97,EAGAIN:11,EALREADY:114,EBADF:9,EBADMSG:74,EBUSY:16,ECANCELED:125,ECHILD:10,ECONNABORTED:103,ECONNREFUSED:111,ECONNRESET:104,EDEADLK:35,EDESTADDRREQ:89,EDOM:33,EDQUOT:122,EEXIST:17,EFAULT:14,EFBIG:27,EHOSTUNREACH:113,EIDRM:43,EILSEQ:84,EINPROGRESS:115,EINTR:4,EINVAL:22,EIO:5,EISCONN:106,EISDIR:21,ELOOP:40,EMFILE:24,EMLINK:31,EMSGSIZE:90,EMULTIHOP:72,ENAMETOOLONG:36,ENETDOWN:100,ENETRESET:102,ENETUNREACH:101,ENFILE:23,ENOBUFS:105,ENODATA:61,ENODEV:19,ENOENT:2,ENOEXEC:8,ENOLCK:37,ENOLINK:67,ENOMEM:12,ENOMSG:42,ENOPROTOOPT:92,ENOSPC:28,ENOSR:63,ENOSTR:60,ENOSYS:38,ENOTCONN:107,ENOTDIR:20,ENOTEMPTY:39,ENOTRECOVERABLE:131,ENOTSOCK:88,ENOTSUP:95,ENOTTY:25,ENXIO:6,EOPNOTSUPP:45,EOVERFLOW:75,EOWNERDEAD:130,EPERM:1,EPIPE:32,EPROTO:71,EPROTONOSUPPORT:93,EPROTOTYPE:91,ERANGE:34,EROFS:30,ESPIPE:29,ESRCH:3,ESTALE:116,ETIME:62,ETIMEDOUT:110,ETXTBSY:26,EWOULDBLOCK:11,EXDEV:18};
  function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      if (!___setErrNo.ret) ___setErrNo.ret = allocate([0], 'i32', ALLOC_NORMAL);
      HEAP32[((___setErrNo.ret)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,joinPath:function (parts, forceRelative) {
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
          var LazyUint8Array = function(chunkSize, length) {
            this.length = length;
            this.chunkSize = chunkSize;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % chunkSize;
            var chunkNum = Math.floor(idx / chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
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
          var lazyArray = new LazyUint8Array(chunkSize, datalength);
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * lazyArray.chunkSize;
            var end = (chunkNum+1) * lazyArray.chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
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
          'void*', ALLOC_DYNAMIC) ], 'void*', ALLOC_NONE, __impure_ptr);
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
      if (!stream) {
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
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
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
                prefix = flagAlternative ? '0x' : '';
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
    }var _vprintf=_printf;
  function _llvm_va_end() {}
  var _atan2f=Math.atan2;
  function ___cxa_guard_acquire(variable) {
      if (!HEAP8[(variable)]) { // ignore SAFE_HEAP stuff because llvm mixes i64 and i8 here
        HEAP8[(variable)]=1;
        return 1;
      }
      return 0;
    }
  function ___cxa_guard_release() {}
  function __ZNSt9exceptionD2Ev(){}
  var _llvm_memset_p0i8_i64=_memset;
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  function ___errno_location() {
      if (!___setErrNo.ret) {
        ___setErrNo.ret = allocate([0], 'i32', ALLOC_NORMAL);
        HEAP32[((___setErrNo.ret)>>2)]=0
      }
      return ___setErrNo.ret;
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
          return ((asm.setTempRet0(typeArray[i]),thrown)|0);
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return ((asm.setTempRet0(throwntype),thrown)|0);
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
            setTimeout(function() {
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
                                 document['webkitExitPointerLock'];
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
        this.lockPointer = lockPointer;
        this.resizeCanvas = resizeCanvas;
        if (typeof this.lockPointer === 'undefined') this.lockPointer = true;
        if (typeof this.resizeCanvas === 'undefined') this.resizeCanvas = false;
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
        if (!this.fullScreenHandlersInstalled) {
          this.fullScreenHandlersInstalled = true;
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
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module.dynCall_viiiii(index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_viifii(index,a1,a2,a3,a4,a5) {
  try {
    Module.dynCall_viifii(index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_vif(index,a1,a2) {
  try {
    Module.dynCall_vif(index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_viffif(index,a1,a2,a3,a4,a5) {
  try {
    Module.dynCall_viffif(index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module.dynCall_vi(index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module.dynCall_vii(index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_ii(index,a1) {
  try {
    return Module.dynCall_ii(index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_viifi(index,a1,a2,a3,a4) {
  try {
    Module.dynCall_viifi(index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_if(index,a1) {
  try {
    return Module.dynCall_if(index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module.dynCall_iiiiii(index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module.dynCall_iiii(index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_fif(index,a1,a2) {
  try {
    return Module.dynCall_fif(index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_viff(index,a1,a2,a3) {
  try {
    Module.dynCall_viff(index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_viiiiiiif(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module.dynCall_viiiiiiif(index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_vifff(index,a1,a2,a3,a4) {
  try {
    Module.dynCall_vifff(index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module.dynCall_viiiiii(index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_iiif(index,a1,a2,a3) {
  try {
    return Module.dynCall_iiif(index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_iif(index,a1,a2) {
  try {
    return Module.dynCall_iif(index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_vifii(index,a1,a2,a3,a4) {
  try {
    Module.dynCall_vifii(index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_fi(index,a1) {
  try {
    return Module.dynCall_fi(index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module.dynCall_iii(index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_fiiiif(index,a1,a2,a3,a4,a5) {
  try {
    return Module.dynCall_fiiiif(index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_i(index) {
  try {
    return Module.dynCall_i(index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module.dynCall_iiiii(index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_ifff(index,a1,a2,a3) {
  try {
    return Module.dynCall_ifff(index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_iff(index,a1,a2) {
  try {
    return Module.dynCall_iff(index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    Module.dynCall_viii(index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_v(index) {
  try {
    Module.dynCall_v(index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_viif(index,a1,a2,a3) {
  try {
    Module.dynCall_viif(index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module.dynCall_viiii(index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm.setThrew(1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var n=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var o=env.__ZTISt9exception|0;var p=+env.NaN;var q=+env.Infinity;var r=0;var s=0;var t=0;var u=0;var v=0,w=0,x=0,y=0,z=0.0,A=0,B=0,C=0,D=0.0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=global.Math.floor;var P=global.Math.abs;var Q=global.Math.sqrt;var R=global.Math.pow;var S=global.Math.cos;var T=global.Math.sin;var U=global.Math.tan;var V=global.Math.acos;var W=global.Math.asin;var X=global.Math.atan;var Y=global.Math.atan2;var Z=global.Math.exp;var _=global.Math.log;var $=global.Math.ceil;var aa=global.Math.imul;var ab=env.abort;var ac=env.assert;var ad=env.asmPrintInt;var ae=env.asmPrintFloat;var af=env.copyTempDouble;var ag=env.copyTempFloat;var ah=env.min;var ai=env.jsCall;var aj=env.invoke_viiiii;var ak=env.invoke_viifii;var al=env.invoke_vif;var am=env.invoke_viffif;var an=env.invoke_vi;var ao=env.invoke_vii;var ap=env.invoke_ii;var aq=env.invoke_viifi;var ar=env.invoke_if;var as=env.invoke_iiiiii;var at=env.invoke_iiii;var au=env.invoke_fif;var av=env.invoke_viff;var aw=env.invoke_viiiiiiif;var ax=env.invoke_vifff;var ay=env.invoke_viiiiii;var az=env.invoke_iiif;var aA=env.invoke_iif;var aB=env.invoke_vifii;var aC=env.invoke_fi;var aD=env.invoke_iii;var aE=env.invoke_fiiiif;var aF=env.invoke_i;var aG=env.invoke_iiiii;var aH=env.invoke_ifff;var aI=env.invoke_iff;var aJ=env.invoke_viii;var aK=env.invoke_v;var aL=env.invoke_viif;var aM=env.invoke_viiii;var aN=env._llvm_va_end;var aO=env._cosf;var aP=env._floorf;var aQ=env.___cxa_throw;var aR=env._abort;var aS=env._fprintf;var aT=env._printf;var aU=env.__reallyNegative;var aV=env._sqrtf;var aW=env._sysconf;var aX=env._llvm_lifetime_start;var aY=env.___setErrNo;var aZ=env._fwrite;var a_=env._llvm_eh_exception;var a$=env._write;var a0=env._exit;var a1=env._llvm_lifetime_end;var a2=env.___cxa_find_matching_catch;var a3=env._atan2f;var a4=env.___cxa_pure_virtual;var a5=env.___cxa_is_number_type;var a6=env._time;var a7=env.__formatString;var a8=env.___cxa_does_inherit;var a9=env.___cxa_guard_acquire;var ba=env.__ZSt9terminatev;var bb=env._sinf;var bc=env.___assert_func;var bd=env.__ZSt18uncaught_exceptionv;var be=env._pwrite;var bf=env._sbrk;var bg=env.__ZNSt9exceptionD2Ev;var bh=env.___cxa_allocate_exception;var bi=env.___errno_location;var bj=env.___gxx_personality_v0;var bk=env.___cxa_call_unexpected;var bl=env.___cxa_guard_release;var bm=env.__exit;var bn=env.___resumeException;
// EMSCRIPTEN_START_FUNCS
function bS(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+3>>2<<2;return b|0}function bT(){return i|0}function bU(a){a=a|0;i=a}function bV(a,b){a=a|0;b=b|0;if((r|0)==0){r=a;s=b}}function bW(a){a=a|0;E=a}function bX(a){a=a|0;F=a}function bY(a){a=a|0;G=a}function bZ(a){a=a|0;H=a}function b_(a){a=a|0;I=a}function b$(a){a=a|0;J=a}function b0(a){a=a|0;K=a}function b1(a){a=a|0;L=a}function b2(a){a=a|0;M=a}function b3(a){a=a|0;N=a}function b4(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;c[a>>2]=-1;b=a+12|0;c[b>>2]=16;c[a+8>>2]=0;d=pQ(576)|0;e=a+4|0;c[e>>2]=d;pZ(d|0,0,(c[b>>2]|0)*36&-1|0);d=(c[b>>2]|0)-1|0;L1:do{if((d|0)>0){f=0;while(1){g=f+1|0;c[(c[e>>2]|0)+(f*36&-1)+20>>2]=g;c[(c[e>>2]|0)+(f*36&-1)+32>>2]=-1;h=(c[b>>2]|0)-1|0;if((g|0)<(h|0)){f=g}else{i=h;break L1}}}else{i=d}}while(0);c[(c[e>>2]|0)+(i*36&-1)+20>>2]=-1;c[(c[e>>2]|0)+(((c[b>>2]|0)-1|0)*36&-1)+32>>2]=-1;pZ(a+16|0,0,16);c[a+48>>2]=16;c[a+52>>2]=0;c[a+44>>2]=pQ(192)|0;c[a+36>>2]=16;c[a+40>>2]=0;c[a+32>>2]=pQ(64)|0;return}function b5(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0.0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=a|0;f=cj(e)|0;h=a+4|0;i=+g[b+4>>2]+-.10000000149011612;j=(c[h>>2]|0)+(f*36&-1)|0;l=(g[k>>2]=+g[b>>2]+-.10000000149011612,c[k>>2]|0);m=(g[k>>2]=i,c[k>>2]|0)|0;c[j>>2]=0|l;c[j+4>>2]=m;i=+g[b+12>>2]+.10000000149011612;m=(c[h>>2]|0)+(f*36&-1)+8|0;j=(g[k>>2]=+g[b+8>>2]+.10000000149011612,c[k>>2]|0);b=(g[k>>2]=i,c[k>>2]|0)|0;c[m>>2]=0|j;c[m+4>>2]=b;c[(c[h>>2]|0)+(f*36&-1)+16>>2]=d;c[(c[h>>2]|0)+(f*36&-1)+32>>2]=0;ck(e,f);e=a+28|0;c[e>>2]=(c[e>>2]|0)+1|0;e=a+40|0;h=c[e>>2]|0;d=a+36|0;b=a+32|0;if((h|0)!=(c[d>>2]|0)){n=h;o=c[b>>2]|0;p=o+(n<<2)|0;c[p>>2]=f;q=c[e>>2]|0;r=q+1|0;c[e>>2]=r;return f|0}a=c[b>>2]|0;c[d>>2]=h<<1;d=pQ(h<<3)|0;c[b>>2]=d;h=a;pY(d|0,h|0,c[e>>2]<<2);pR(h);n=c[e>>2]|0;o=c[b>>2]|0;p=o+(n<<2)|0;c[p>>2]=f;q=c[e>>2]|0;r=q+1|0;c[e>>2]=r;return f|0}function b6(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0,s=0.0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0.0;h=a+60|0;c[h>>2]=0;i=e+12|0;j=+g[f+12>>2];l=+g[i>>2];m=+g[f+8>>2];n=+g[e+16>>2];o=+g[f>>2]+(j*l-m*n)- +g[d>>2];p=l*m+j*n+ +g[f+4>>2]- +g[d+4>>2];n=+g[d+12>>2];j=+g[d+8>>2];m=o*n+p*j;l=n*p+o*(-0.0-j);j=+g[b+8>>2]+ +g[e+8>>2];e=c[b+148>>2]|0;do{if((e|0)>0){d=0;o=-3.4028234663852886e+38;f=0;while(1){p=(m- +g[b+20+(d<<3)>>2])*+g[b+84+(d<<3)>>2]+(l- +g[b+20+(d<<3)+4>>2])*+g[b+84+(d<<3)+4>>2];if(p>j){q=28;break}r=p>o;s=r?p:o;t=r?d:f;r=d+1|0;if((r|0)<(e|0)){d=r;o=s;f=t}else{q=12;break}}if((q|0)==12){u=s<1.1920928955078125e-7;v=t;break}else if((q|0)==28){return}}else{u=1;v=0}}while(0);q=v+1|0;t=b+20+(v<<3)|0;f=c[t>>2]|0;d=c[t+4>>2]|0;s=(c[k>>2]=f,+g[k>>2]);t=d;o=(c[k>>2]=t,+g[k>>2]);r=b+20+(((q|0)<(e|0)?q:0)<<3)|0;q=c[r>>2]|0;e=c[r+4>>2]|0;p=(c[k>>2]=q,+g[k>>2]);r=e;n=(c[k>>2]=r,+g[k>>2]);if(u){c[h>>2]=1;c[a+56>>2]=1;u=b+84+(v<<3)|0;w=a+40|0;x=c[u+4>>2]|0;c[w>>2]=c[u>>2]|0;c[w+4>>2]=x;x=a+48|0;w=(g[k>>2]=(s+p)*.5,c[k>>2]|0);u=(g[k>>2]=(o+n)*.5,c[k>>2]|0)|0;c[x>>2]=0|w;c[x+4>>2]=u;u=i;x=a;w=c[u+4>>2]|0;c[x>>2]=c[u>>2]|0;c[x+4>>2]=w;c[a+16>>2]=0;return}y=m-s;z=l-o;A=m-p;B=l-n;if(y*(p-s)+z*(n-o)<=0.0){if(y*y+z*z>j*j){return}c[h>>2]=1;c[a+56>>2]=1;w=a+40|0;x=w;u=(g[k>>2]=y,c[k>>2]|0);C=(g[k>>2]=z,c[k>>2]|0)|0;c[x>>2]=0|u;c[x+4>>2]=C;D=+Q(+(y*y+z*z));if(D>=1.1920928955078125e-7){E=1.0/D;g[w>>2]=y*E;g[a+44>>2]=z*E}w=a+48|0;c[w>>2]=0|f&-1;c[w+4>>2]=t|d&0;d=i;t=a;w=c[d+4>>2]|0;c[t>>2]=c[d>>2]|0;c[t+4>>2]=w;c[a+16>>2]=0;return}if(A*(s-p)+B*(o-n)>0.0){E=(s+p)*.5;p=(o+n)*.5;w=b+84+(v<<3)|0;if((m-E)*+g[w>>2]+(l-p)*+g[b+84+(v<<3)+4>>2]>j){return}c[h>>2]=1;c[a+56>>2]=1;v=w;w=a+40|0;b=c[v+4>>2]|0;c[w>>2]=c[v>>2]|0;c[w+4>>2]=b;b=a+48|0;w=(g[k>>2]=E,c[k>>2]|0);v=(g[k>>2]=p,c[k>>2]|0)|0;c[b>>2]=0|w;c[b+4>>2]=v;v=i;b=a;w=c[v+4>>2]|0;c[b>>2]=c[v>>2]|0;c[b+4>>2]=w;c[a+16>>2]=0;return}if(A*A+B*B>j*j){return}c[h>>2]=1;c[a+56>>2]=1;h=a+40|0;w=h;b=(g[k>>2]=A,c[k>>2]|0);v=(g[k>>2]=B,c[k>>2]|0)|0;c[w>>2]=0|b;c[w+4>>2]=v;j=+Q(+(A*A+B*B));if(j>=1.1920928955078125e-7){p=1.0/j;g[h>>2]=A*p;g[a+44>>2]=B*p}h=a+48|0;c[h>>2]=0|q&-1;c[h+4>>2]=r|e&0;e=i;i=a;r=c[e+4>>2]|0;c[i>>2]=c[e>>2]|0;c[i+4>>2]=r;c[a+16>>2]=0;return}function b7(b,d,e,f,h){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;var i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0;i=b+60|0;c[i>>2]=0;j=f+12|0;l=+g[h+12>>2];m=+g[j>>2];n=+g[h+8>>2];o=+g[f+16>>2];p=+g[h>>2]+(l*m-n*o)- +g[e>>2];q=m*n+l*o+ +g[h+4>>2]- +g[e+4>>2];o=+g[e+12>>2];l=+g[e+8>>2];n=p*o+q*l;m=o*q+p*(-0.0-l);e=d+12|0;h=c[e>>2]|0;r=c[e+4>>2]|0;l=(c[k>>2]=h,+g[k>>2]);e=r;p=(c[k>>2]=e,+g[k>>2]);s=d+20|0;t=c[s>>2]|0;u=c[s+4>>2]|0;q=(c[k>>2]=t,+g[k>>2]);s=u;o=(c[k>>2]=s,+g[k>>2]);v=q-l;w=o-p;x=v*(q-n)+w*(o-m);y=n-l;z=m-p;A=y*v+z*w;B=+g[d+8>>2]+ +g[f+8>>2];if(A<=0.0){if(y*y+z*z>B*B){return}do{if((a[d+44|0]&1)<<24>>24!=0){f=d+28|0;C=c[f+4>>2]|0;D=(c[k>>2]=c[f>>2]|0,+g[k>>2]);if((l-n)*(l-D)+(p-m)*(p-(c[k>>2]=C,+g[k>>2]))<=0.0){break}return}}while(0);c[i>>2]=1;c[b+56>>2]=0;g[b+40>>2]=0.0;g[b+44>>2]=0.0;C=b+48|0;c[C>>2]=0|h&-1;c[C+4>>2]=e|r&0;C=b+16|0;c[C>>2]=0;f=C;a[C]=0;a[f+1|0]=0;a[f+2|0]=0;a[f+3|0]=0;f=j;C=b;E=c[f+4>>2]|0;c[C>>2]=c[f>>2]|0;c[C+4>>2]=E;return}if(x<=0.0){D=n-q;F=m-o;if(D*D+F*F>B*B){return}do{if((a[d+45|0]&1)<<24>>24!=0){E=d+36|0;C=c[E+4>>2]|0;G=(c[k>>2]=c[E>>2]|0,+g[k>>2]);if(D*(G-q)+F*((c[k>>2]=C,+g[k>>2])-o)<=0.0){break}return}}while(0);c[i>>2]=1;c[b+56>>2]=0;g[b+40>>2]=0.0;g[b+44>>2]=0.0;d=b+48|0;c[d>>2]=0|t&-1;c[d+4>>2]=s|u&0;u=b+16|0;c[u>>2]=0;s=u;a[u]=1;a[s+1|0]=0;a[s+2|0]=0;a[s+3|0]=0;s=j;u=b;d=c[s+4>>2]|0;c[u>>2]=c[s>>2]|0;c[u+4>>2]=d;return}F=v*v+w*w;if(F<=0.0){bc(10552,127,16184,10540)}D=1.0/F;F=n-(l*x+q*A)*D;q=m-(p*x+o*A)*D;if(F*F+q*q>B*B){return}B=-0.0-w;if(v*z+y*B<0.0){H=w;I=-0.0-v}else{H=B;I=v}v=+Q(+(I*I+H*H));if(v<1.1920928955078125e-7){J=H;K=I}else{B=1.0/v;J=H*B;K=I*B}c[i>>2]=1;c[b+56>>2]=1;i=b+40|0;d=(g[k>>2]=J,c[k>>2]|0);u=(g[k>>2]=K,c[k>>2]|0)|0;c[i>>2]=0|d;c[i+4>>2]=u;u=b+48|0;c[u>>2]=0|h&-1;c[u+4>>2]=e|r&0;r=b+16|0;c[r>>2]=0;e=r;a[r]=0;a[e+1|0]=0;a[e+2|0]=1;a[e+3|0]=0;e=j;j=b;b=c[e+4>>2]|0;c[j>>2]=c[e>>2]|0;c[j+4>>2]=b;return}function b8(b,d,e,f,h,j){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0,z=0.0,A=0.0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,O=0.0,P=0.0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0,_=0.0,$=0.0,aa=0,ab=0.0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0.0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0.0,aB=0.0,aC=0.0,aD=0.0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0.0,aP=0,aQ=0,aR=0.0;l=i;i=i+84|0;m=l|0;n=l+12|0;o=l+36|0;p=l+60|0;q=b+132|0;r=+g[f+12>>2];s=+g[j+8>>2];t=+g[f+8>>2];u=+g[j+12>>2];v=r*s-t*u;w=s*t+r*u;x=(g[k>>2]=v,c[k>>2]|0);y=(g[k>>2]=w,c[k>>2]|0)|0;u=+g[j>>2]- +g[f>>2];s=+g[j+4>>2]- +g[f+4>>2];z=r*u+t*s;A=u*(-0.0-t)+r*s;f=(g[k>>2]=z,c[k>>2]|0);j=(g[k>>2]=A,c[k>>2]|0)|0;B=q;c[B>>2]=0|f;c[B+4>>2]=j;j=b+140|0;c[j>>2]=0|x;c[j+4>>2]=y;y=b+144|0;s=+g[h+12>>2];j=b+140|0;r=+g[h+16>>2];x=q|0;t=z+(w*s-v*r);q=b+136|0;z=s*v+w*r+A;B=b+148|0;f=(g[k>>2]=t,c[k>>2]|0);C=(g[k>>2]=z,c[k>>2]|0)|0;c[B>>2]=0|f;c[B+4>>2]=C;C=e+28|0;B=b+156|0;f=c[C>>2]|0;D=c[C+4>>2]|0;c[B>>2]=f;c[B+4>>2]=D;B=e+12|0;C=b+164|0;E=c[B>>2]|0;F=c[B+4>>2]|0;c[C>>2]=E;c[C+4>>2]=F;B=e+20|0;G=b+172|0;H=c[B>>2]|0;I=c[B+4>>2]|0;c[G>>2]=H;c[G+4>>2]=I;B=e+36|0;J=b+180|0;K=c[B>>2]|0;L=c[B+4>>2]|0;c[J>>2]=K;c[J+4>>2]=L;J=a[e+44|0]&1;B=J<<24>>24!=0;M=a[e+45|0]|0;e=(M&1)<<24>>24!=0;A=(c[k>>2]=H,+g[k>>2]);r=(c[k>>2]=E,+g[k>>2]);w=A-r;v=(c[k>>2]=I,+g[k>>2]);I=b+168|0;s=(c[k>>2]=F,+g[k>>2]);u=v-s;N=+Q(+(w*w+u*u));O=(c[k>>2]=f,+g[k>>2]);P=(c[k>>2]=D,+g[k>>2]);R=(c[k>>2]=K,+g[k>>2]);S=(c[k>>2]=L,+g[k>>2]);if(N<1.1920928955078125e-7){T=w;U=u}else{V=1.0/N;T=w*V;U=u*V}L=b+196|0;V=-0.0-T;K=L|0;g[K>>2]=U;D=b+200|0;g[D>>2]=V;u=(t-r)*U+(z-s)*V;if(B){V=r-O;r=s-P;s=+Q(+(V*V+r*r));if(s<1.1920928955078125e-7){W=V;X=r}else{w=1.0/s;W=V*w;X=r*w}w=-0.0-W;g[b+188>>2]=X;g[b+192>>2]=w;Y=(t-O)*X+(z-P)*w;Z=U*W-T*X>=0.0}else{Y=0.0;Z=0}L93:do{if(e){X=R-A;W=S-v;w=+Q(+(X*X+W*W));if(w<1.1920928955078125e-7){_=X;$=W}else{P=1.0/w;_=X*P;$=W*P}P=-0.0-_;f=b+204|0;g[f>>2]=$;F=b+208|0;g[F>>2]=P;E=T*$-U*_>0.0;W=(t-A)*$+(z-v)*P;if((J&M)<<24>>24==0){aa=E;ab=W;ac=100;break}if(Z&E){do{if(Y<0.0&u<0.0){H=W>=0.0;a[b+248|0]=H&1;ad=b+212|0;if(H){ae=ad;break}H=ad;ad=(g[k>>2]=-0.0-U,c[k>>2]|0);af=0|ad;ad=(g[k>>2]=T,c[k>>2]|0)|0;c[H>>2]=af;c[H+4>>2]=ad;H=b+228|0;c[H>>2]=af;c[H+4>>2]=ad;H=b+236|0;c[H>>2]=af;c[H+4>>2]=ad;break L93}else{a[b+248|0]=1;ae=b+212|0}}while(0);ad=L;H=ae;af=c[ad+4>>2]|0;c[H>>2]=c[ad>>2]|0;c[H+4>>2]=af;af=b+188|0;H=b+228|0;ad=c[af+4>>2]|0;c[H>>2]=c[af>>2]|0;c[H+4>>2]=ad;ad=b+204|0;H=b+236|0;af=c[ad+4>>2]|0;c[H>>2]=c[ad>>2]|0;c[H+4>>2]=af;break}if(Z){do{if(Y<0.0){if(u<0.0){a[b+248|0]=0;ag=b+212|0}else{af=W>=0.0;a[b+248|0]=af&1;H=b+212|0;if(af){ah=H;break}else{ag=H}}H=ag;af=(g[k>>2]=-0.0-U,c[k>>2]|0);ad=(g[k>>2]=T,c[k>>2]|0)|0;c[H>>2]=0|af;c[H+4>>2]=ad;P=-0.0- +g[F>>2];ad=b+228|0;H=(g[k>>2]=-0.0- +g[f>>2],c[k>>2]|0);af=(g[k>>2]=P,c[k>>2]|0)|0;c[ad>>2]=0|H;c[ad+4>>2]=af;P=-0.0- +g[D>>2];af=b+236|0;ad=(g[k>>2]=-0.0- +g[K>>2],c[k>>2]|0);H=(g[k>>2]=P,c[k>>2]|0)|0;c[af>>2]=0|ad;c[af+4>>2]=H;break L93}else{a[b+248|0]=1;ah=b+212|0}}while(0);H=L;af=ah;ad=c[H+4>>2]|0;c[af>>2]=c[H>>2]|0;c[af+4>>2]=ad;ad=b+188|0;af=b+228|0;ai=c[ad+4>>2]|0;c[af>>2]=c[ad>>2]|0;c[af+4>>2]=ai;ai=b+236|0;af=c[H+4>>2]|0;c[ai>>2]=c[H>>2]|0;c[ai+4>>2]=af;break}if(!E){do{if(Y<0.0|u<0.0){a[b+248|0]=0;aj=b+212|0}else{af=W>=0.0;a[b+248|0]=af&1;ai=b+212|0;if(!af){aj=ai;break}af=L;H=ai;ai=c[af>>2]|0;ad=c[af+4>>2]|0;c[H>>2]=ai;c[H+4>>2]=ad;H=b+228|0;c[H>>2]=ai;c[H+4>>2]=ad;H=b+236|0;c[H>>2]=ai;c[H+4>>2]=ad;break L93}}while(0);E=aj;ad=(g[k>>2]=-0.0-U,c[k>>2]|0);H=(g[k>>2]=T,c[k>>2]|0)|0;c[E>>2]=0|ad;c[E+4>>2]=H;P=-0.0- +g[F>>2];H=b+228|0;E=(g[k>>2]=-0.0- +g[f>>2],c[k>>2]|0);ad=(g[k>>2]=P,c[k>>2]|0)|0;c[H>>2]=0|E;c[H+4>>2]=ad;P=-0.0- +g[b+192>>2];ad=b+236|0;H=(g[k>>2]=-0.0- +g[b+188>>2],c[k>>2]|0);E=(g[k>>2]=P,c[k>>2]|0)|0;c[ad>>2]=0|H;c[ad+4>>2]=E;break}do{if(W<0.0){if(Y<0.0){a[b+248|0]=0;ak=b+212|0}else{E=u>=0.0;a[b+248|0]=E&1;ad=b+212|0;if(E){al=ad;break}else{ak=ad}}ad=ak;E=(g[k>>2]=-0.0-U,c[k>>2]|0);H=(g[k>>2]=T,c[k>>2]|0)|0;c[ad>>2]=0|E;c[ad+4>>2]=H;P=-0.0- +g[D>>2];H=b+228|0;ad=(g[k>>2]=-0.0- +g[K>>2],c[k>>2]|0);E=(g[k>>2]=P,c[k>>2]|0)|0;c[H>>2]=0|ad;c[H+4>>2]=E;P=-0.0- +g[b+192>>2];E=b+236|0;H=(g[k>>2]=-0.0- +g[b+188>>2],c[k>>2]|0);ad=(g[k>>2]=P,c[k>>2]|0)|0;c[E>>2]=0|H;c[E+4>>2]=ad;break L93}else{a[b+248|0]=1;al=b+212|0}}while(0);f=L;F=al;ad=c[f+4>>2]|0;c[F>>2]=c[f>>2]|0;c[F+4>>2]=ad;ad=b+228|0;F=c[f+4>>2]|0;c[ad>>2]=c[f>>2]|0;c[ad+4>>2]=F;F=b+204|0;ad=b+236|0;f=c[F+4>>2]|0;c[ad>>2]=c[F>>2]|0;c[ad+4>>2]=f;break}else{aa=0;ab=0.0;ac=100}}while(0);L134:do{if((ac|0)==100){if(B){al=Y>=0.0;if(Z){do{if(al){a[b+248|0]=1;am=b+212|0}else{ak=u>=0.0;a[b+248|0]=ak&1;aj=b+212|0;if(ak){am=aj;break}ak=aj;aj=(g[k>>2]=-0.0-U,c[k>>2]|0);ah=0;ag=(g[k>>2]=T,c[k>>2]|0);c[ak>>2]=ah|aj;c[ak+4>>2]=ag|0;ak=L;aj=b+228|0;ae=c[ak>>2]|0;M=c[ak+4>>2]|0;c[aj>>2]=ae;c[aj+4>>2]=M;M=b+236|0;c[M>>2]=ah|(g[k>>2]=-0.0-(c[k>>2]=ae,+g[k>>2]),c[k>>2]|0);c[M+4>>2]=ag|0;break L134}}while(0);ag=L;M=am;ae=c[ag+4>>2]|0;c[M>>2]=c[ag>>2]|0;c[M+4>>2]=ae;ae=b+188|0;M=b+228|0;ag=c[ae+4>>2]|0;c[M>>2]=c[ae>>2]|0;c[M+4>>2]=ag;v=-0.0- +g[D>>2];ag=b+236|0;M=(g[k>>2]=-0.0- +g[K>>2],c[k>>2]|0);ae=(g[k>>2]=v,c[k>>2]|0)|0;c[ag>>2]=0|M;c[ag+4>>2]=ae;break}else{do{if(al){ae=u>=0.0;a[b+248|0]=ae&1;ag=b+212|0;if(!ae){an=ag;break}ae=L;M=ag;ag=c[ae>>2]|0;ah=c[ae+4>>2]|0;c[M>>2]=ag;c[M+4>>2]=ah;M=b+228|0;c[M>>2]=ag;c[M+4>>2]=ah;ah=b+236|0;M=(g[k>>2]=-0.0-(c[k>>2]=ag,+g[k>>2]),c[k>>2]|0);ag=(g[k>>2]=T,c[k>>2]|0)|0;c[ah>>2]=0|M;c[ah+4>>2]=ag;break L134}else{a[b+248|0]=0;an=b+212|0}}while(0);al=an;ag=(g[k>>2]=-0.0-U,c[k>>2]|0);ah=(g[k>>2]=T,c[k>>2]|0)|0;c[al>>2]=0|ag;c[al+4>>2]=ah;ah=L;al=b+228|0;ag=c[ah+4>>2]|0;c[al>>2]=c[ah>>2]|0;c[al+4>>2]=ag;v=-0.0- +g[b+192>>2];ag=b+236|0;al=(g[k>>2]=-0.0- +g[b+188>>2],c[k>>2]|0);ah=(g[k>>2]=v,c[k>>2]|0)|0;c[ag>>2]=0|al;c[ag+4>>2]=ah;break}}ah=u>=0.0;if(!e){a[b+248|0]=ah&1;ag=b+212|0;if(ah){al=L;M=ag;ae=c[al>>2]|0;aj=c[al+4>>2]|0;c[M>>2]=ae;c[M+4>>2]=aj;aj=b+228|0;M=(g[k>>2]=-0.0-(c[k>>2]=ae,+g[k>>2]),c[k>>2]|0);ae=0|M;M=(g[k>>2]=T,c[k>>2]|0)|0;c[aj>>2]=ae;c[aj+4>>2]=M;aj=b+236|0;c[aj>>2]=ae;c[aj+4>>2]=M;break}else{M=ag;ag=(g[k>>2]=-0.0-U,c[k>>2]|0);aj=(g[k>>2]=T,c[k>>2]|0)|0;c[M>>2]=0|ag;c[M+4>>2]=aj;aj=L;M=b+228|0;ag=c[aj>>2]|0;ae=c[aj+4>>2]|0;c[M>>2]=ag;c[M+4>>2]=ae;M=b+236|0;c[M>>2]=ag;c[M+4>>2]=ae;break}}if(aa){do{if(ah){a[b+248|0]=1;ao=b+212|0}else{ae=ab>=0.0;a[b+248|0]=ae&1;M=b+212|0;if(ae){ao=M;break}ae=M;M=(g[k>>2]=-0.0-U,c[k>>2]|0);ag=0|M;M=(g[k>>2]=T,c[k>>2]|0)|0;c[ae>>2]=ag;c[ae+4>>2]=M;ae=b+228|0;c[ae>>2]=ag;c[ae+4>>2]=M;M=L;ae=b+236|0;ag=c[M+4>>2]|0;c[ae>>2]=c[M>>2]|0;c[ae+4>>2]=ag;break L134}}while(0);ag=L;ae=ao;M=c[ag+4>>2]|0;c[ae>>2]=c[ag>>2]|0;c[ae+4>>2]=M;v=-0.0- +g[D>>2];M=b+228|0;ae=(g[k>>2]=-0.0- +g[K>>2],c[k>>2]|0);ag=(g[k>>2]=v,c[k>>2]|0)|0;c[M>>2]=0|ae;c[M+4>>2]=ag;ag=b+204|0;M=b+236|0;ae=c[ag+4>>2]|0;c[M>>2]=c[ag>>2]|0;c[M+4>>2]=ae;break}else{do{if(ah){ae=ab>=0.0;a[b+248|0]=ae&1;M=b+212|0;if(!ae){ap=M;break}ae=L;ag=M;M=c[ae>>2]|0;aj=c[ae+4>>2]|0;c[ag>>2]=M;c[ag+4>>2]=aj;ag=b+228|0;ae=(g[k>>2]=-0.0-(c[k>>2]=M,+g[k>>2]),c[k>>2]|0);al=(g[k>>2]=T,c[k>>2]|0)|0;c[ag>>2]=0|ae;c[ag+4>>2]=al;al=b+236|0;c[al>>2]=M;c[al+4>>2]=aj;break L134}else{a[b+248|0]=0;ap=b+212|0}}while(0);ah=ap;aj=(g[k>>2]=-0.0-U,c[k>>2]|0);al=(g[k>>2]=T,c[k>>2]|0)|0;c[ah>>2]=0|aj;c[ah+4>>2]=al;v=-0.0- +g[b+208>>2];al=b+228|0;ah=(g[k>>2]=-0.0- +g[b+204>>2],c[k>>2]|0);aj=(g[k>>2]=v,c[k>>2]|0)|0;c[al>>2]=0|ah;c[al+4>>2]=aj;aj=L;al=b+236|0;ah=c[aj+4>>2]|0;c[al>>2]=c[aj>>2]|0;c[al+4>>2]=ah;break}}}while(0);ap=h+148|0;ao=b+128|0;c[ao>>2]=c[ap>>2]|0;L172:do{if((c[ap>>2]|0)>0){aa=0;while(1){T=+g[y>>2];U=+g[h+20+(aa<<3)>>2];ab=+g[j>>2];u=+g[h+20+(aa<<3)+4>>2];Y=U*ab+T*u+ +g[q>>2];e=b+(aa<<3)|0;an=(g[k>>2]=+g[x>>2]+(T*U-ab*u),c[k>>2]|0);am=(g[k>>2]=Y,c[k>>2]|0)|0;c[e>>2]=0|an;c[e+4>>2]=am;Y=+g[y>>2];u=+g[h+84+(aa<<3)>>2];ab=+g[j>>2];U=+g[h+84+(aa<<3)+4>>2];am=b+64+(aa<<3)|0;e=(g[k>>2]=Y*u-ab*U,c[k>>2]|0);an=(g[k>>2]=u*ab+Y*U,c[k>>2]|0)|0;c[am>>2]=0|e;c[am+4>>2]=an;an=aa+1|0;if((an|0)<(c[ap>>2]|0)){aa=an}else{break L172}}}}while(0);ap=b+244|0;g[ap>>2]=.019999999552965164;aa=d+60|0;c[aa>>2]=0;an=b+248|0;am=c[ao>>2]|0;L176:do{if((am|0)>0){U=+g[b+164>>2];Y=+g[I>>2];ab=+g[b+212>>2];u=+g[b+216>>2];e=0;T=3.4028234663852886e+38;while(1){v=ab*(+g[b+(e<<3)>>2]-U)+u*(+g[b+(e<<3)+4>>2]-Y);z=v<T?v:T;Z=e+1|0;if((Z|0)==(am|0)){aq=z;break L176}else{e=Z;T=z}}}else{aq=3.4028234663852886e+38}}while(0);if(aq>+g[ap>>2]){i=l;return}b9(m,b);am=c[m>>2]|0;do{if((am|0)==0){ac=136}else{T=+g[m+8>>2];if(T>+g[ap>>2]){i=l;return}if(T<=aq*.9800000190734863+.0010000000474974513){ac=136;break}I=c[m+4>>2]|0;e=d+56|0;if((am|0)==1){ar=e;ac=138;break}c[e>>2]=2;e=n;Z=c[C>>2]|0;B=c[C+4>>2]|0;c[e>>2]=Z;c[e+4>>2]=B;e=n+8|0;ah=e;a[e]=0;e=I&255;a[ah+1|0]=e;a[ah+2|0]=0;a[ah+3|0]=1;ah=n+12|0;al=c[G>>2]|0;aj=c[G+4>>2]|0;c[ah>>2]=al;c[ah+4>>2]=aj;ah=n+20|0;M=ah;a[ah]=0;a[M+1|0]=e;a[M+2|0]=0;a[M+3|0]=1;M=I+1|0;ah=(M|0)<(c[ao>>2]|0)?M:0;M=b+(I<<3)|0;ag=c[M>>2]|0;ae=c[M+4>>2]|0;M=b+(ah<<3)|0;ak=c[M>>2]|0;J=c[M+4>>2]|0;M=b+64+(I<<3)|0;f=c[M>>2]|0;ad=c[M+4>>2]|0;T=(c[k>>2]=Z,+g[k>>2]);Y=(c[k>>2]=B,+g[k>>2]);u=(c[k>>2]=al,+g[k>>2]);as=I;at=ah&255;au=f;av=ad;aw=ak;ax=J;ay=ag;az=ae;aA=u;aB=T;aC=(c[k>>2]=aj,+g[k>>2]);aD=Y;aE=e;aF=0;break}}while(0);do{if((ac|0)==136){ar=d+56|0;ac=138;break}}while(0);do{if((ac|0)==138){c[ar>>2]=1;am=c[ao>>2]|0;L195:do{if((am|0)>1){aq=+g[b+216>>2];Y=+g[b+212>>2];m=0;T=Y*+g[b+64>>2]+aq*+g[b+68>>2];e=1;while(1){u=Y*+g[b+64+(e<<3)>>2]+aq*+g[b+64+(e<<3)+4>>2];aj=u<T;ae=aj?e:m;ag=e+1|0;if((ag|0)<(am|0)){m=ae;T=aj?u:T;e=ag}else{aG=ae;break L195}}}else{aG=0}}while(0);e=aG+1|0;m=(e|0)<(am|0)?e:0;e=b+(aG<<3)|0;ae=n;ag=c[e>>2]|0;aj=c[e+4>>2]|0;c[ae>>2]=ag;c[ae+4>>2]=aj;ae=n+8|0;e=ae;a[ae]=0;ae=aG&255;a[e+1|0]=ae;a[e+2|0]=1;a[e+3|0]=0;e=b+(m<<3)|0;J=n+12|0;ak=c[e>>2]|0;ad=c[e+4>>2]|0;c[J>>2]=ak;c[J+4>>2]=ad;J=n+20|0;e=J;a[J]=0;a[e+1|0]=m&255;a[e+2|0]=1;a[e+3|0]=0;e=(a[an]&1)<<24>>24==0;T=(c[k>>2]=ag,+g[k>>2]);aq=(c[k>>2]=aj,+g[k>>2]);Y=(c[k>>2]=ak,+g[k>>2]);u=(c[k>>2]=ad,+g[k>>2]);if(e){e=c[G>>2]|0;ad=c[G+4>>2]|0;ak=c[C>>2]|0;aj=c[C+4>>2]|0;U=-0.0- +g[D>>2];ag=(g[k>>2]=-0.0- +g[K>>2],c[k>>2]|0);as=1;at=0;au=ag;av=(g[k>>2]=U,c[k>>2]|0);aw=ak;ax=aj;ay=e;az=ad;aA=Y;aB=T;aC=u;aD=aq;aE=ae;aF=1;break}else{ad=L;as=0;at=1;au=c[ad>>2]|0;av=c[ad+4>>2]|0;aw=c[G>>2]|0;ax=c[G+4>>2]|0;ay=c[C>>2]|0;az=c[C+4>>2]|0;aA=Y;aB=T;aC=u;aD=aq;aE=ae;aF=1;break}}}while(0);aq=(c[k>>2]=au,+g[k>>2]);u=(c[k>>2]=av,+g[k>>2]);T=(c[k>>2]=ax,+g[k>>2]);Y=(c[k>>2]=ay,+g[k>>2]);U=(c[k>>2]=az,+g[k>>2]);ab=-0.0-aq;z=Y*u+U*ab;v=-0.0-u;$=(c[k>>2]=aw,+g[k>>2])*v+T*aq;T=u*aB+aD*ab-z;A=u*aA+aC*ab-z;if(T>0.0){aH=0}else{aw=o;ax=n;c[aw>>2]=c[ax>>2]|0;c[aw+4>>2]=c[ax+4>>2]|0;c[aw+8>>2]=c[ax+8>>2]|0;aH=1}if(A>0.0){aI=aH}else{ax=o+(aH*12&-1)|0;aw=n+12|0;c[ax>>2]=c[aw>>2]|0;c[ax+4>>2]=c[aw+4>>2]|0;c[ax+8>>2]=c[aw+8>>2]|0;aI=aH+1|0}if(T*A<0.0){z=T/(T-A);aH=o+(aI*12&-1)|0;aw=(g[k>>2]=aB+z*(aA-aB),c[k>>2]|0);ax=(g[k>>2]=aD+z*(aC-aD),c[k>>2]|0)|0;c[aH>>2]=0|aw;c[aH+4>>2]=ax;ax=o+(aI*12&-1)+8|0;aH=ax;a[ax]=as&255;a[aH+1|0]=aE;a[aH+2|0]=0;a[aH+3|0]=1;aJ=aI+1|0}else{aJ=aI}if((aJ|0)<2){i=l;return}aD=+g[o>>2];aC=+g[o+4>>2];z=aD*v+aq*aC-$;aJ=o+12|0;aB=+g[aJ>>2];aA=+g[o+16>>2];A=aB*v+aq*aA-$;if(z>0.0){aK=0}else{aI=p;aH=o;c[aI>>2]=c[aH>>2]|0;c[aI+4>>2]=c[aH+4>>2]|0;c[aI+8>>2]=c[aH+8>>2]|0;aK=1}if(A>0.0){aL=aK}else{aH=p+(aK*12&-1)|0;aI=aJ;c[aH>>2]=c[aI>>2]|0;c[aH+4>>2]=c[aI+4>>2]|0;c[aH+8>>2]=c[aI+8>>2]|0;aL=aK+1|0}if(z*A<0.0){$=z/(z-A);aK=p+(aL*12&-1)|0;aI=(g[k>>2]=aD+$*(aB-aD),c[k>>2]|0);aH=(g[k>>2]=aC+$*(aA-aC),c[k>>2]|0)|0;c[aK>>2]=0|aI;c[aK+4>>2]=aH;aH=p+(aL*12&-1)+8|0;aK=aH;a[aH]=at;a[aK+1|0]=a[(o+8|0)+1|0]|0;a[aK+2|0]=0;a[aK+3|0]=1;aM=aL+1|0}else{aM=aL}if((aM|0)<2){i=l;return}aM=d+40|0;do{if(aF){aL=aM;c[aL>>2]=0|au;c[aL+4>>2]=av|0;aL=d+48|0;c[aL>>2]=0|ay;c[aL+4>>2]=az|0;aC=+g[p>>2];aA=+g[p+4>>2];$=+g[ap>>2];if(aq*(aC-Y)+u*(aA-U)>$){aN=0;aO=$}else{$=aC- +g[x>>2];aC=aA- +g[q>>2];aA=+g[y>>2];aD=+g[j>>2];aL=d;aK=(g[k>>2]=$*aA+aC*aD,c[k>>2]|0);o=(g[k>>2]=aA*aC+$*(-0.0-aD),c[k>>2]|0)|0;c[aL>>2]=0|aK;c[aL+4>>2]=o;c[d+16>>2]=c[p+8>>2]|0;aN=1;aO=+g[ap>>2]}aD=+g[p+12>>2];$=+g[p+16>>2];if(aq*(aD-Y)+u*($-U)>aO){aP=aN;break}aC=aD- +g[x>>2];aD=$- +g[q>>2];$=+g[y>>2];aA=+g[j>>2];o=d+(aN*20&-1)|0;aL=(g[k>>2]=aC*$+aD*aA,c[k>>2]|0);aK=(g[k>>2]=$*aD+aC*(-0.0-aA),c[k>>2]|0)|0;c[o>>2]=0|aL;c[o+4>>2]=aK;c[d+(aN*20&-1)+16>>2]=c[p+20>>2]|0;aP=aN+1|0}else{aK=h+84+(as<<3)|0;o=aM;aL=c[aK+4>>2]|0;c[o>>2]=c[aK>>2]|0;c[o+4>>2]=aL;aL=h+20+(as<<3)|0;o=d+48|0;aK=c[aL+4>>2]|0;c[o>>2]=c[aL>>2]|0;c[o+4>>2]=aK;aA=+g[ap>>2];if(aq*(+g[p>>2]-Y)+u*(+g[p+4>>2]-U)>aA){aQ=0;aR=aA}else{aK=p;o=d;aL=c[aK+4>>2]|0;c[o>>2]=c[aK>>2]|0;c[o+4>>2]=aL;aL=p+8|0;o=aL;aK=d+16|0;at=aK;a[at+2|0]=a[o+3|0]|0;a[at+3|0]=a[o+2|0]|0;a[aK]=a[o+1|0]|0;a[at+1|0]=a[aL]|0;aQ=1;aR=+g[ap>>2]}aL=p+12|0;if(aq*(+g[aL>>2]-Y)+u*(+g[p+16>>2]-U)>aR){aP=aQ;break}at=aL;aL=d+(aQ*20&-1)|0;o=c[at+4>>2]|0;c[aL>>2]=c[at>>2]|0;c[aL+4>>2]=o;o=p+20|0;aL=o;at=d+(aQ*20&-1)+16|0;aK=at;a[aK+2|0]=a[aL+3|0]|0;a[aK+3|0]=a[aL+2|0]|0;a[at]=a[aL+1|0]|0;a[aK+1|0]=a[o]|0;aP=aQ+1|0}}while(0);c[aa>>2]=aP;i=l;return}function b9(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0,r=0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0;d=a|0;c[d>>2]=0;e=a+4|0;c[e>>2]=-1;f=a+8|0;g[f>>2]=-3.4028234663852886e+38;h=+g[b+216>>2];i=+g[b+212>>2];a=c[b+128>>2]|0;if((a|0)<=0){return}j=+g[b+164>>2];k=+g[b+168>>2];l=+g[b+172>>2];m=+g[b+176>>2];n=+g[b+244>>2];o=b+228|0;p=b+232|0;q=b+236|0;r=b+240|0;s=0;t=-3.4028234663852886e+38;while(1){u=+g[b+64+(s<<3)>>2];v=-0.0-u;w=-0.0- +g[b+64+(s<<3)+4>>2];x=+g[b+(s<<3)>>2];y=+g[b+(s<<3)+4>>2];z=(x-j)*v+(y-k)*w;A=(x-l)*v+(y-m)*w;B=z<A?z:A;if(B>n){break}do{if(h*u+i*w<0.0){if((v- +g[o>>2])*i+(w- +g[p>>2])*h>=-.03490658849477768&B>t){C=182;break}else{D=t;break}}else{if((v- +g[q>>2])*i+(w- +g[r>>2])*h>=-.03490658849477768&B>t){C=182;break}else{D=t;break}}}while(0);if((C|0)==182){C=0;c[d>>2]=2;c[e>>2]=s;g[f>>2]=B;D=B}E=s+1|0;if((E|0)<(a|0)){s=E;t=D}else{C=185;break}}if((C|0)==185){return}c[d>>2]=2;c[e>>2]=s;g[f>>2]=B;return}function ca(b,d,e,f,h){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;var j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0,B=0,C=0,D=0,E=0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0,O=0,P=0.0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;j=i;i=i+80|0;l=j|0;m=j+4|0;n=j+8|0;o=j+32|0;p=j+56|0;q=b+60|0;c[q>>2]=0;r=+g[d+8>>2]+ +g[f+8>>2];c[l>>2]=0;s=+cb(l,d,e,f,h);if(s>r){i=j;return}c[m>>2]=0;t=+cb(m,f,h,d,e);if(t>r){i=j;return}if(t>s*.9800000190734863+.0010000000474974513){s=+g[h>>2];t=+g[h+4>>2];u=+g[h+8>>2];v=+g[h+12>>2];w=+g[e>>2];x=+g[e+4>>2];y=+g[e+8>>2];z=+g[e+12>>2];A=c[m>>2]|0;c[b+56>>2]=2;B=f;C=d;D=A;E=1;F=w;G=x;H=y;I=z;J=s;K=t;L=u;M=v}else{v=+g[e>>2];u=+g[e+4>>2];t=+g[e+8>>2];s=+g[e+12>>2];z=+g[h>>2];y=+g[h+4>>2];x=+g[h+8>>2];w=+g[h+12>>2];h=c[l>>2]|0;c[b+56>>2]=1;B=d;C=f;D=h;E=0;F=z;G=y;H=x;I=w;J=v;K=u;L=t;M=s}h=c[C+148>>2]|0;do{if((D|0)>-1){if((c[B+148>>2]|0)>(D|0)){break}else{N=195;break}}else{N=195}}while(0);if((N|0)==195){bc(8056,151,15872,9404)}s=+g[B+84+(D<<3)>>2];t=+g[B+84+(D<<3)+4>>2];u=M*s-L*t;v=L*s+M*t;t=I*u+H*v;s=-0.0-H;w=I*v+u*s;L274:do{if((h|0)>0){N=0;u=3.4028234663852886e+38;f=0;while(1){v=t*+g[C+84+(N<<3)>>2]+w*+g[C+84+(N<<3)+4>>2];d=v<u;l=d?N:f;e=N+1|0;if((e|0)==(h|0)){O=l;break L274}else{N=e;u=d?v:u;f=l}}}else{O=0}}while(0);f=O+1|0;N=(f|0)<(h|0)?f:0;w=+g[C+20+(O<<3)>>2];t=+g[C+20+(O<<3)+4>>2];u=F+(I*w-H*t);v=G+(H*w+I*t);f=n;h=(g[k>>2]=u,c[k>>2]|0);l=(g[k>>2]=v,c[k>>2]|0)|0;c[f>>2]=0|h;c[f+4>>2]=l;l=D&255;f=n+8|0;h=f;a[f]=l;f=O&255;a[h+1|0]=f;a[h+2|0]=1;a[h+3|0]=0;h=n+12|0;t=+g[C+20+(N<<3)>>2];w=+g[C+20+(N<<3)+4>>2];x=F+(I*t-H*w);y=G+(H*t+I*w);C=h;O=(g[k>>2]=x,c[k>>2]|0);d=(g[k>>2]=y,c[k>>2]|0)|0;c[C>>2]=0|O;c[C+4>>2]=d;d=n+20|0;C=d;a[d]=l;a[C+1|0]=N&255;a[C+2|0]=1;a[C+3|0]=0;C=D+1|0;N=(C|0)<(c[B+148>>2]|0)?C:0;C=B+20+(D<<3)|0;D=c[C+4>>2]|0;w=(c[k>>2]=c[C>>2]|0,+g[k>>2]);t=(c[k>>2]=D,+g[k>>2]);D=B+20+(N<<3)|0;B=c[D+4>>2]|0;z=(c[k>>2]=c[D>>2]|0,+g[k>>2]);P=(c[k>>2]=B,+g[k>>2]);R=z-w;S=P-t;T=+Q(+(R*R+S*S));if(T<1.1920928955078125e-7){U=R;V=S}else{W=1.0/T;U=R*W;V=S*W}W=M*U-L*V;S=M*V+L*U;R=W*-1.0;T=J+(M*w-L*t);X=K+(L*w+M*t);Y=T*S+X*R;Z=r-(T*W+X*S);X=r+((J+(M*z-L*P))*W+(K+(L*z+M*P))*S);M=-0.0-W;L=-0.0-S;K=u*M+v*L-Z;J=x*M+y*L-Z;if(K>0.0){_=0}else{B=o;D=n;c[B>>2]=c[D>>2]|0;c[B+4>>2]=c[D+4>>2]|0;c[B+8>>2]=c[D+8>>2]|0;_=1}if(J>0.0){$=_}else{D=o+(_*12&-1)|0;B=h;c[D>>2]=c[B>>2]|0;c[D+4>>2]=c[B+4>>2]|0;c[D+8>>2]=c[B+8>>2]|0;$=_+1|0}if(K*J<0.0){Z=K/(K-J);_=o+($*12&-1)|0;B=(g[k>>2]=u+Z*(x-u),c[k>>2]|0);D=(g[k>>2]=v+Z*(y-v),c[k>>2]|0)|0;c[_>>2]=0|B;c[_+4>>2]=D;D=o+($*12&-1)+8|0;_=D;a[D]=l;a[_+1|0]=f;a[_+2|0]=0;a[_+3|0]=1;aa=$+1|0}else{aa=$}if((aa|0)<2){i=j;return}v=+g[o>>2];y=+g[o+4>>2];Z=W*v+S*y-X;aa=o+12|0;u=+g[aa>>2];x=+g[o+16>>2];J=W*u+S*x-X;if(Z>0.0){ab=0}else{$=p;_=o;c[$>>2]=c[_>>2]|0;c[$+4>>2]=c[_+4>>2]|0;c[$+8>>2]=c[_+8>>2]|0;ab=1}if(J>0.0){ac=ab}else{_=p+(ab*12&-1)|0;$=aa;c[_>>2]=c[$>>2]|0;c[_+4>>2]=c[$+4>>2]|0;c[_+8>>2]=c[$+8>>2]|0;ac=ab+1|0}if(Z*J<0.0){X=Z/(Z-J);ab=p+(ac*12&-1)|0;$=(g[k>>2]=v+X*(u-v),c[k>>2]|0);_=(g[k>>2]=y+X*(x-y),c[k>>2]|0)|0;c[ab>>2]=0|$;c[ab+4>>2]=_;_=p+(ac*12&-1)+8|0;ab=_;a[_]=N&255;a[ab+1|0]=a[(o+8|0)+1|0]|0;a[ab+2|0]=0;a[ab+3|0]=1;ad=ac+1|0}else{ad=ac}if((ad|0)<2){i=j;return}ad=b+40|0;ac=(g[k>>2]=V,c[k>>2]|0);ab=(g[k>>2]=U*-1.0,c[k>>2]|0)|0;c[ad>>2]=0|ac;c[ad+4>>2]=ab;ab=b+48|0;ad=(g[k>>2]=(w+z)*.5,c[k>>2]|0);ac=(g[k>>2]=(t+P)*.5,c[k>>2]|0)|0;c[ab>>2]=0|ad;c[ab+4>>2]=ac;P=+g[p>>2];t=+g[p+4>>2];ac=S*P+R*t-Y>r;do{if(E<<24>>24==0){if(ac){ae=0}else{z=P-F;w=t-G;ab=b;ad=(g[k>>2]=I*z+H*w,c[k>>2]|0);o=(g[k>>2]=z*s+I*w,c[k>>2]|0)|0;c[ab>>2]=0|ad;c[ab+4>>2]=o;c[b+16>>2]=c[p+8>>2]|0;ae=1}w=+g[p+12>>2];z=+g[p+16>>2];if(S*w+R*z-Y>r){af=ae;break}U=w-F;w=z-G;o=b+(ae*20&-1)|0;ab=(g[k>>2]=I*U+H*w,c[k>>2]|0);ad=(g[k>>2]=U*s+I*w,c[k>>2]|0)|0;c[o>>2]=0|ab;c[o+4>>2]=ad;c[b+(ae*20&-1)+16>>2]=c[p+20>>2]|0;af=ae+1|0}else{if(ac){ag=0}else{w=P-F;U=t-G;ad=b;o=(g[k>>2]=I*w+H*U,c[k>>2]|0);ab=(g[k>>2]=w*s+I*U,c[k>>2]|0)|0;c[ad>>2]=0|o;c[ad+4>>2]=ab;ab=b+16|0;ad=c[p+8>>2]|0;c[ab>>2]=ad;o=ab;a[ab]=ad>>>8&255;a[o+1|0]=ad&255;a[o+2|0]=ad>>>24&255;a[o+3|0]=ad>>>16&255;ag=1}U=+g[p+12>>2];w=+g[p+16>>2];if(S*U+R*w-Y>r){af=ag;break}z=U-F;U=w-G;ad=b+(ag*20&-1)|0;o=(g[k>>2]=I*z+H*U,c[k>>2]|0);ab=(g[k>>2]=z*s+I*U,c[k>>2]|0)|0;c[ad>>2]=0|o;c[ad+4>>2]=ab;ab=b+(ag*20&-1)+16|0;ad=c[p+20>>2]|0;c[ab>>2]=ad;o=ab;a[ab]=ad>>>8&255;a[o+1|0]=ad&255;a[o+2|0]=ad>>>24&255;a[o+3|0]=ad>>>16&255;af=ag+1|0}}while(0);c[q>>2]=af;i=j;return}function cb(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0,A=0.0,B=0;h=c[b+148>>2]|0;i=+g[f+12>>2];j=+g[e+12>>2];k=+g[f+8>>2];l=+g[e+16>>2];m=+g[d+12>>2];n=+g[b+12>>2];o=+g[d+8>>2];p=+g[b+16>>2];q=+g[f>>2]+(i*j-k*l)-(+g[d>>2]+(m*n-o*p));r=j*k+i*l+ +g[f+4>>2]-(n*o+m*p+ +g[d+4>>2]);p=m*q+o*r;n=m*r+q*(-0.0-o);L319:do{if((h|0)>0){s=0;o=-3.4028234663852886e+38;t=0;while(1){q=p*+g[b+84+(s<<3)>>2]+n*+g[b+84+(s<<3)+4>>2];u=q>o;v=u?s:t;w=s+1|0;if((w|0)==(h|0)){x=v;break L319}else{s=w;o=u?q:o;t=v}}}else{x=0}}while(0);n=+cc(b,d,x,e,f);t=((x|0)>0?x:h)-1|0;p=+cc(b,d,t,e,f);s=x+1|0;v=(s|0)<(h|0)?s:0;o=+cc(b,d,v,e,f);if(p>n&p>o){q=p;s=t;while(1){t=((s|0)>0?s:h)-1|0;p=+cc(b,d,t,e,f);if(p>q){q=p;s=t}else{y=q;z=s;break}}c[a>>2]=z;return+y}if(o>n){A=o;B=v}else{y=n;z=x;c[a>>2]=z;return+y}while(1){x=B+1|0;v=(x|0)<(h|0)?x:0;n=+cc(b,d,v,e,f);if(n>A){A=n;B=v}else{y=A;z=B;break}}c[a>>2]=z;return+y}function cc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0,v=0,w=0,x=0;h=c[e+148>>2]|0;do{if((d|0)>-1){if((c[a+148>>2]|0)>(d|0)){break}else{i=242;break}}else{i=242}}while(0);if((i|0)==242){bc(8056,32,16012,9404)}j=+g[b+12>>2];k=+g[a+84+(d<<3)>>2];l=+g[b+8>>2];m=+g[a+84+(d<<3)+4>>2];n=j*k-l*m;o=k*l+j*m;m=+g[f+12>>2];k=+g[f+8>>2];p=m*n+k*o;q=m*o+n*(-0.0-k);L339:do{if((h|0)>0){i=0;r=3.4028234663852886e+38;s=0;while(1){t=p*+g[e+20+(i<<3)>>2]+q*+g[e+20+(i<<3)+4>>2];u=t<r;v=u?i:s;w=i+1|0;if((w|0)==(h|0)){x=v;break L339}else{i=w;r=u?t:r;s=v}}}else{x=0}}while(0);q=+g[a+20+(d<<3)>>2];p=+g[a+20+(d<<3)+4>>2];r=+g[e+20+(x<<3)>>2];t=+g[e+20+(x<<3)+4>>2];return+(n*(+g[f>>2]+(m*r-k*t)-(+g[b>>2]+(j*q-l*p)))+o*(r*k+m*t+ +g[f+4>>2]-(q*l+j*p+ +g[b+4>>2])))}function cd(a,b,d,e,f,h){a=a|0;b=b|0;d=d|0;e=+e;f=f|0;h=+h;var i=0,j=0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0,w=0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0.0;i=b+60|0;if((c[i>>2]|0)==0){return}j=c[b+56>>2]|0;if((j|0)==0){l=a|0;g[l>>2]=1.0;m=a+4|0;g[m>>2]=0.0;n=+g[d+12>>2];o=+g[b+48>>2];p=+g[d+8>>2];q=+g[b+52>>2];r=+g[d>>2]+(n*o-p*q);s=o*p+n*q+ +g[d+4>>2];q=+g[f+12>>2];n=+g[b>>2];p=+g[f+8>>2];o=+g[b+4>>2];t=+g[f>>2]+(q*n-p*o);u=n*p+q*o+ +g[f+4>>2];o=r-t;q=s-u;do{if(o*o+q*q>1.4210854715202004e-14){p=t-r;n=u-s;v=a;w=(g[k>>2]=p,c[k>>2]|0);x=(g[k>>2]=n,c[k>>2]|0)|0;c[v>>2]=0|w;c[v+4>>2]=x;y=+Q(+(p*p+n*n));if(y<1.1920928955078125e-7){z=p;A=n;break}B=1.0/y;y=p*B;g[l>>2]=y;p=n*B;g[m>>2]=p;z=y;A=p}else{z=1.0;A=0.0}}while(0);m=a+8|0;l=(g[k>>2]=(r+z*e+(t-z*h))*.5,c[k>>2]|0);x=(g[k>>2]=(s+A*e+(u-A*h))*.5,c[k>>2]|0)|0;c[m>>2]=0|l;c[m+4>>2]=x;return}else if((j|0)==1){x=d+12|0;A=+g[x>>2];u=+g[b+40>>2];m=d+8|0;s=+g[m>>2];z=+g[b+44>>2];t=A*u-s*z;r=u*s+A*z;l=a;v=(g[k>>2]=t,c[k>>2]|0);w=(g[k>>2]=r,c[k>>2]|0)|0;c[l>>2]=0|v;c[l+4>>2]=w;z=+g[x>>2];A=+g[b+48>>2];s=+g[m>>2];u=+g[b+52>>2];q=+g[d>>2]+(z*A-s*u);o=A*s+z*u+ +g[d+4>>2];if((c[i>>2]|0)<=0){return}m=f+12|0;x=f+8|0;w=f|0;l=f+4|0;v=a|0;C=a+4|0;D=0;u=t;t=r;while(1){r=+g[m>>2];z=+g[b+(D*20&-1)>>2];s=+g[x>>2];A=+g[b+(D*20&-1)+4>>2];p=+g[w>>2]+(r*z-s*A);y=z*s+r*A+ +g[l>>2];A=e-(u*(p-q)+(y-o)*t);E=a+8+(D<<3)|0;F=(g[k>>2]=(p-u*h+(p+u*A))*.5,c[k>>2]|0);G=(g[k>>2]=(y-t*h+(y+t*A))*.5,c[k>>2]|0)|0;c[E>>2]=0|F;c[E+4>>2]=G;G=D+1|0;if((G|0)>=(c[i>>2]|0)){break}D=G;u=+g[v>>2];t=+g[C>>2]}return}else if((j|0)==2){j=f+12|0;t=+g[j>>2];u=+g[b+40>>2];C=f+8|0;o=+g[C>>2];q=+g[b+44>>2];A=t*u-o*q;y=u*o+t*q;v=a;D=(g[k>>2]=A,c[k>>2]|0);l=(g[k>>2]=y,c[k>>2]|0)|0;c[v>>2]=0|D;c[v+4>>2]=l;q=+g[j>>2];t=+g[b+48>>2];o=+g[C>>2];u=+g[b+52>>2];p=+g[f>>2]+(q*t-o*u);r=t*o+q*u+ +g[f+4>>2];L363:do{if((c[i>>2]|0)>0){f=d+12|0;C=d+8|0;j=d|0;l=d+4|0;D=a|0;w=a+4|0;x=0;u=A;q=y;while(1){o=+g[f>>2];t=+g[b+(x*20&-1)>>2];s=+g[C>>2];z=+g[b+(x*20&-1)+4>>2];B=+g[j>>2]+(o*t-s*z);n=t*s+o*z+ +g[l>>2];z=h-(u*(B-p)+(n-r)*q);m=a+8+(x<<3)|0;G=(g[k>>2]=(B-u*e+(B+u*z))*.5,c[k>>2]|0);E=(g[k>>2]=(n-q*e+(n+q*z))*.5,c[k>>2]|0)|0;c[m>>2]=0|G;c[m+4>>2]=E;E=x+1|0;z=+g[D>>2];n=+g[w>>2];if((E|0)<(c[i>>2]|0)){x=E;u=z;q=n}else{H=z;I=n;break L363}}}else{H=A;I=y}}while(0);i=(g[k>>2]=-0.0-H,c[k>>2]|0);a=(g[k>>2]=-0.0-I,c[k>>2]|0)|0;c[v>>2]=0|i;c[v+4>>2]=a;return}else{return}}function ce(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0;e=c[b+4>>2]|0;if((e|0)==0){c[a+16>>2]=b+12|0;c[a+20>>2]=1;g[a+24>>2]=+g[b+8>>2];return}else if((e|0)==2){c[a+16>>2]=b+20|0;c[a+20>>2]=c[b+148>>2]|0;g[a+24>>2]=+g[b+8>>2];return}else if((e|0)==3){f=b+16|0;do{if((d|0)>-1){if((c[f>>2]|0)>(d|0)){break}else{h=272;break}}else{h=272}}while(0);if((h|0)==272){bc(3596,53,14940,8588)}h=b+12|0;i=(c[h>>2]|0)+(d<<3)|0;j=a;k=c[i+4>>2]|0;c[j>>2]=c[i>>2]|0;c[j+4>>2]=k;k=d+1|0;d=a+8|0;j=c[h>>2]|0;if((k|0)<(c[f>>2]|0)){f=j+(k<<3)|0;k=d;h=c[f+4>>2]|0;c[k>>2]=c[f>>2]|0;c[k+4>>2]=h}else{h=j;j=d;d=c[h+4>>2]|0;c[j>>2]=c[h>>2]|0;c[j+4>>2]=d}c[a+16>>2]=a|0;c[a+20>>2]=2;g[a+24>>2]=+g[b+8>>2];return}else if((e|0)==1){c[a+16>>2]=b+12|0;c[a+20>>2]=2;g[a+24>>2]=+g[b+8>>2];return}else{bc(3596,81,14940,9296);return}}function cf(a){a=a|0;var b=0,d=0,e=0.0,f=0.0,h=0,i=0.0,j=0.0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0;b=a+16|0;d=c[b+4>>2]|0;e=(c[k>>2]=c[b>>2]|0,+g[k>>2]);f=(c[k>>2]=d,+g[k>>2]);d=a+36|0;b=a+52|0;h=c[b+4>>2]|0;i=(c[k>>2]=c[b>>2]|0,+g[k>>2]);j=(c[k>>2]=h,+g[k>>2]);h=a+72|0;b=a+88|0;l=c[b+4>>2]|0;m=(c[k>>2]=c[b>>2]|0,+g[k>>2]);n=(c[k>>2]=l,+g[k>>2]);o=i-e;p=j-f;q=e*o+f*p;r=i*o+j*p;s=m-e;t=n-f;u=e*s+f*t;v=m*s+n*t;w=m-i;x=n-j;y=i*w+j*x;z=m*w+n*x;x=o*t-p*s;s=(i*n-j*m)*x;p=(f*m-e*n)*x;n=(e*j-f*i)*x;if(!(q<-0.0|u<-0.0)){g[a+24>>2]=1.0;c[a+108>>2]=1;return}if(!(q>=-0.0|r<=0.0|n>0.0)){x=1.0/(r-q);g[a+24>>2]=r*x;g[a+60>>2]=x*(-0.0-q);c[a+108>>2]=2;return}if(!(u>=-0.0|v<=0.0|p>0.0)){q=1.0/(v-u);g[a+24>>2]=v*q;g[a+96>>2]=q*(-0.0-u);c[a+108>>2]=2;pY(d|0,h|0,36);return}if(!(r>0.0|y<-0.0)){g[a+60>>2]=1.0;c[a+108>>2]=1;pY(a|0,d|0,36);return}if(!(v>0.0|z>0.0)){g[a+96>>2]=1.0;c[a+108>>2]=1;pY(a|0,h|0,36);return}if(y>=-0.0|z<=0.0|s>0.0){v=1.0/(n+(s+p));g[a+24>>2]=s*v;g[a+60>>2]=p*v;g[a+96>>2]=n*v;c[a+108>>2]=3;return}else{v=1.0/(z-y);g[a+60>>2]=z*v;g[a+96>>2]=v*(-0.0-y);c[a+108>>2]=2;pY(a|0,h|0,36);return}}function cg(d,e,f){d=d|0;e=e|0;f=f|0;var h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0,Z=0,_=0,$=0.0,aa=0.0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0.0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0.0,aF=0.0,aG=0.0;h=i;i=i+168|0;j=h|0;l=h+16|0;m=h+32|0;n=h+144|0;o=h+156|0;c[635]=(c[635]|0)+1|0;p=j;q=f+56|0;c[p>>2]=c[q>>2]|0;c[p+4>>2]=c[q+4>>2]|0;c[p+8>>2]=c[q+8>>2]|0;c[p+12>>2]=c[q+12>>2]|0;q=l;p=f+72|0;c[q>>2]=c[p>>2]|0;c[q+4>>2]=c[p+4>>2]|0;c[q+8>>2]=c[p+8>>2]|0;c[q+12>>2]=c[p+12>>2]|0;ch(m,e,f|0,j,f+28|0,l);p=m|0;q=m+108|0;r=c[q>>2]|0;if((r|0)==0){bc(3596,194,11220,9296)}else if(!((r|0)==1|(r|0)==2|(r|0)==3)){bc(3596,207,11220,9296)}r=j+12|0;s=j+8|0;t=f+16|0;u=f+20|0;v=j|0;w=j+4|0;j=l+12|0;x=l+8|0;y=f+44|0;z=f+48|0;A=l|0;B=l+4|0;l=m+16|0;C=m+20|0;D=m+52|0;E=m+56|0;F=m+16|0;G=m+52|0;H=m+24|0;I=m+60|0;J=m;K=m+36|0;L=0;M=c[q>>2]|0;L422:while(1){N=(M|0)>0;L424:do{if(N){O=0;while(1){c[n+(O<<2)>>2]=c[p+(O*36&-1)+28>>2]|0;c[o+(O<<2)>>2]=c[p+(O*36&-1)+32>>2]|0;P=O+1|0;if((P|0)==(M|0)){break L424}else{O=P}}}}while(0);do{if((M|0)==2){O=c[F+4>>2]|0;R=(c[k>>2]=c[F>>2]|0,+g[k>>2]);S=(c[k>>2]=O,+g[k>>2]);O=c[G+4>>2]|0;T=(c[k>>2]=c[G>>2]|0,+g[k>>2]);U=(c[k>>2]=O,+g[k>>2]);V=T-R;W=U-S;X=R*V+S*W;if(X>=-0.0){g[H>>2]=1.0;c[q>>2]=1;Y=325;break}S=T*V+U*W;if(S>0.0){W=1.0/(S-X);g[H>>2]=S*W;g[I>>2]=W*(-0.0-X);c[q>>2]=2;Y=326;break}else{g[I>>2]=1.0;c[q>>2]=1;pY(J|0,K|0,36);Y=320;break}}else if((M|0)==3){cf(m);Y=320;break}else if((M|0)==1){Y=323}else{bc(3596,498,16368,9296);Y=320;break}}while(0);do{if((Y|0)==320){Y=0;O=c[q>>2]|0;if((O|0)==0){bc(3596,194,11220,9296);Y=323;break}else if((O|0)==1|(O|0)==2){Z=O;Y=324;break}else if((O|0)==3){_=L;break L422}else{bc(3596,207,11220,9296);Y=323;break}}}while(0);do{if((Y|0)==323){Y=0;Z=c[q>>2]|0;Y=324;break}}while(0);do{if((Y|0)==324){Y=0;if((Z|0)==1){Y=325;break}else if((Z|0)==2){Y=326;break}bc(3596,184,11112,9296);O=2552;P=c[O+4>>2]|0;X=(c[k>>2]=c[O>>2]|0,+g[k>>2]);$=X;aa=(c[k>>2]=P,+g[k>>2]);break}}while(0);do{if((Y|0)==325){Y=0;$=-0.0- +g[l>>2];aa=-0.0- +g[C>>2]}else if((Y|0)==326){Y=0;X=+g[l>>2];W=+g[D>>2]-X;S=+g[C>>2];U=+g[E>>2]-S;if(W*(-0.0-S)-U*(-0.0-X)>0.0){$=U*-1.0;aa=W;break}else{$=U;aa=W*-1.0;break}}}while(0);if(aa*aa+$*$<1.4210854715202004e-14){_=L;break}P=c[q>>2]|0;O=p+(P*36&-1)|0;W=-0.0-aa;U=+g[r>>2];X=+g[s>>2];S=U*(-0.0-$)+X*W;V=U*W+$*X;ab=c[t>>2]|0;ac=c[u>>2]|0;do{if((ac|0)>1){W=V*+g[ab+4>>2]+S*+g[ab>>2];ad=1;ae=0;while(1){T=S*+g[ab+(ad<<3)>>2]+V*+g[ab+(ad<<3)+4>>2];af=T>W;ag=af?ad:ae;ah=ad+1|0;if((ah|0)==(ac|0)){break}else{W=af?T:W;ad=ah;ae=ag}}ae=p+(P*36&-1)+28|0;c[ae>>2]=ag;ad=O|0;if((ag|0)>-1){ai=ag;aj=ae;ak=ad;Y=336;break}else{al=ag;am=ae;an=ad;Y=337;break}}else{ad=p+(P*36&-1)+28|0;c[ad>>2]=0;ai=0;aj=ad;ak=O|0;Y=336;break}}while(0);do{if((Y|0)==336){Y=0;if((ac|0)>(ai|0)){ao=ai;ap=aj;aq=ak;ar=ab;break}else{al=ai;am=aj;an=ak;Y=337;break}}}while(0);if((Y|0)==337){Y=0;bc(5580,103,11416,4596);ao=al;ap=am;aq=an;ar=c[t>>2]|0}V=+g[ar+(ao<<3)>>2];S=+g[ar+(ao<<3)+4>>2];W=V*X+U*S+ +g[w>>2];ab=O;ac=(g[k>>2]=+g[v>>2]+(U*V-X*S),c[k>>2]|0);ad=(g[k>>2]=W,c[k>>2]|0)|0;c[ab>>2]=0|ac;c[ab+4>>2]=ad;W=+g[j>>2];S=+g[x>>2];V=$*W+aa*S;T=aa*W+$*(-0.0-S);ad=c[y>>2]|0;ab=c[z>>2]|0;do{if((ab|0)>1){R=T*+g[ad+4>>2]+V*+g[ad>>2];ac=1;ae=0;while(1){as=V*+g[ad+(ac<<3)>>2]+T*+g[ad+(ac<<3)+4>>2];ah=as>R;at=ah?ac:ae;af=ac+1|0;if((af|0)==(ab|0)){break}else{R=ah?as:R;ac=af;ae=at}}ae=p+(P*36&-1)+32|0;c[ae>>2]=at;ac=p+(P*36&-1)+8|0;if((at|0)>-1){au=at;av=ae;aw=ac;Y=343;break}else{ax=at;ay=ae;az=ac;Y=344;break}}else{ac=p+(P*36&-1)+32|0;c[ac>>2]=0;au=0;av=ac;aw=p+(P*36&-1)+8|0;Y=343;break}}while(0);do{if((Y|0)==343){Y=0;if((ab|0)>(au|0)){aA=au;aB=av;aC=aw;aD=ad;break}else{ax=au;ay=av;az=aw;Y=344;break}}}while(0);if((Y|0)==344){Y=0;bc(5580,103,11416,4596);aA=ax;aB=ay;aC=az;aD=c[y>>2]|0}T=+g[aD+(aA<<3)>>2];V=+g[aD+(aA<<3)+4>>2];X=+g[A>>2]+(W*T-S*V);U=T*S+W*V+ +g[B>>2];ad=aC;ab=(g[k>>2]=X,c[k>>2]|0);O=(g[k>>2]=U,c[k>>2]|0)|0;c[ad>>2]=0|ab;c[ad+4>>2]=O;V=U- +g[aq+4>>2];O=p+(P*36&-1)+16|0;ad=(g[k>>2]=X- +g[aq>>2],c[k>>2]|0);ab=(g[k>>2]=V,c[k>>2]|0)|0;c[O>>2]=0|ad;c[O+4>>2]=ab;ab=L+1|0;c[634]=(c[634]|0)+1|0;L478:do{if(N){O=c[ap>>2]|0;ad=0;while(1){if((O|0)==(c[n+(ad<<2)>>2]|0)){if((c[aB>>2]|0)==(c[o+(ad<<2)>>2]|0)){_=ab;break L422}}ac=ad+1|0;if((ac|0)<(M|0)){ad=ac}else{break L478}}}}while(0);N=(c[q>>2]|0)+1|0;c[q>>2]=N;if((ab|0)<20){L=ab;M=N}else{_=ab;break}}M=c[633]|0;c[633]=(M|0)>(_|0)?M:_;M=d+8|0;ci(m,d|0,M);L=d|0;o=M|0;$=+g[L>>2]- +g[o>>2];aB=d+4|0;n=d+12|0;aa=+g[aB>>2]- +g[n>>2];ap=d+16|0;g[ap>>2]=+Q(+($*$+aa*aa));c[d+20>>2]=_;_=c[q>>2]|0;if((_|0)==0){bc(3596,246,11072,9296);aE=0.0}else if((_|0)==2){aa=+g[l>>2]- +g[D>>2];$=+g[C>>2]- +g[E>>2];aE=+Q(+(aa*aa+$*$))}else if((_|0)==3){$=+g[l>>2];aa=+g[C>>2];aE=(+g[D>>2]-$)*(+g[m+92>>2]-aa)-(+g[E>>2]-aa)*(+g[m+88>>2]-$)}else if((_|0)==1){aE=0.0}else{bc(3596,259,11072,9296);aE=0.0}g[e>>2]=aE;_=c[q>>2]|0;b[e+4>>1]=_&65535;L493:do{if((_|0)>0){q=0;while(1){a[q+(e+6)|0]=c[p+(q*36&-1)+28>>2]&255;a[q+(e+9)|0]=c[p+(q*36&-1)+32>>2]&255;m=q+1|0;if((m|0)<(_|0)){q=m}else{break L493}}}}while(0);if((a[f+88|0]&1)<<24>>24==0){i=h;return}aE=+g[f+24>>2];$=+g[f+52>>2];aa=+g[ap>>2];W=aE+$;if(!(aa>W&aa>1.1920928955078125e-7)){S=(+g[aB>>2]+ +g[n>>2])*.5;f=d;d=(g[k>>2]=(+g[L>>2]+ +g[o>>2])*.5,c[k>>2]|0);_=0|d;d=(g[k>>2]=S,c[k>>2]|0)|0;c[f>>2]=_;c[f+4>>2]=d;f=M;c[f>>2]=_;c[f+4>>2]=d;g[ap>>2]=0.0;i=h;return}g[ap>>2]=aa-W;W=+g[o>>2];aa=+g[L>>2];S=W-aa;V=+g[n>>2];X=+g[aB>>2];U=V-X;T=+Q(+(S*S+U*U));if(T<1.1920928955078125e-7){aF=S;aG=U}else{R=1.0/T;aF=S*R;aG=U*R}g[L>>2]=aE*aF+aa;g[aB>>2]=aE*aG+X;g[o>>2]=W-$*aF;g[n>>2]=V-$*aG;i=h;return}function ch(a,e,f,h,i,j){a=a|0;e=e|0;f=f|0;h=h|0;i=i|0;j=j|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0.0,J=0.0,K=0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,R=0.0,S=0.0,T=0.0,U=0;l=e+4|0;m=b[l>>1]|0;if((m&65535)<4){n=m}else{bc(3596,102,12348,4072);n=b[l>>1]|0}l=n&65535;m=a+108|0;c[m>>2]=l;o=a|0;L512:do{if(n<<16>>16==0){p=l}else{q=f+20|0;r=f+16|0;s=i+20|0;t=i+16|0;u=h+12|0;v=h+8|0;w=h|0;x=h+4|0;y=j+12|0;z=j+8|0;A=j|0;B=j+4|0;C=0;while(1){D=o+(C*36&-1)|0;E=d[C+(e+6)|0]|0;c[o+(C*36&-1)+28>>2]=E;F=d[C+(e+9)|0]|0;G=o+(C*36&-1)+32|0;c[G>>2]=F;if((c[q>>2]|0)>(E|0)){H=F}else{bc(5580,103,11416,4596);H=c[G>>2]|0}G=(c[r>>2]|0)+(E<<3)|0;E=c[G+4>>2]|0;I=(c[k>>2]=c[G>>2]|0,+g[k>>2]);J=(c[k>>2]=E,+g[k>>2]);do{if((H|0)>-1){if((c[s>>2]|0)>(H|0)){break}else{K=376;break}}else{K=376}}while(0);if((K|0)==376){K=0;bc(5580,103,11416,4596)}E=(c[t>>2]|0)+(H<<3)|0;G=c[E+4>>2]|0;L=(c[k>>2]=c[E>>2]|0,+g[k>>2]);M=(c[k>>2]=G,+g[k>>2]);N=+g[u>>2];O=+g[v>>2];P=+g[w>>2]+(I*N-J*O);R=J*N+I*O+ +g[x>>2];G=D;E=(g[k>>2]=P,c[k>>2]|0);F=(g[k>>2]=R,c[k>>2]|0)|0;c[G>>2]=0|E;c[G+4>>2]=F;R=+g[y>>2];O=+g[z>>2];N=+g[A>>2]+(L*R-M*O);S=M*R+L*O+ +g[B>>2];F=o+(C*36&-1)+8|0;G=(g[k>>2]=N,c[k>>2]|0);E=(g[k>>2]=S,c[k>>2]|0)|0;c[F>>2]=0|G;c[F+4>>2]=E;S=+g[o+(C*36&-1)+12>>2]- +g[o+(C*36&-1)+4>>2];E=o+(C*36&-1)+16|0;F=(g[k>>2]=N-P,c[k>>2]|0);G=(g[k>>2]=S,c[k>>2]|0)|0;c[E>>2]=0|F;c[E+4>>2]=G;g[o+(C*36&-1)+24>>2]=0.0;G=C+1|0;E=c[m>>2]|0;if((G|0)<(E|0)){C=G}else{p=E;break L512}}}}while(0);L525:do{if((p|0)>1){S=+g[e>>2];if((p|0)==2){P=+g[a+16>>2]- +g[a+52>>2];N=+g[a+20>>2]- +g[a+56>>2];T=+Q(+(P*P+N*N))}else if((p|0)==3){N=+g[a+16>>2];P=+g[a+20>>2];T=(+g[a+52>>2]-N)*(+g[a+92>>2]-P)-(+g[a+56>>2]-P)*(+g[a+88>>2]-N)}else{bc(3596,259,11072,9296);T=0.0}do{if(T>=S*.5){if(S*2.0<T|T<1.1920928955078125e-7){break}U=c[m>>2]|0;K=387;break L525}}while(0);c[m>>2]=0;break}else{U=p;K=387}}while(0);do{if((K|0)==387){if((U|0)==0){break}return}}while(0);c[a+28>>2]=0;c[a+32>>2]=0;if((c[f+20>>2]|0)<=0){bc(5580,103,11416,4596)}U=c[f+16>>2]|0;f=c[U+4>>2]|0;T=(c[k>>2]=c[U>>2]|0,+g[k>>2]);S=(c[k>>2]=f,+g[k>>2]);if((c[i+20>>2]|0)<=0){bc(5580,103,11416,4596)}f=c[i+16>>2]|0;i=c[f+4>>2]|0;N=(c[k>>2]=c[f>>2]|0,+g[k>>2]);P=(c[k>>2]=i,+g[k>>2]);O=+g[h+12>>2];L=+g[h+8>>2];R=+g[h>>2]+(T*O-S*L);M=S*O+T*L+ +g[h+4>>2];h=a;i=(g[k>>2]=R,c[k>>2]|0);f=(g[k>>2]=M,c[k>>2]|0)|0;c[h>>2]=0|i;c[h+4>>2]=f;L=+g[j+12>>2];T=+g[j+8>>2];O=+g[j>>2]+(N*L-P*T);S=P*L+N*T+ +g[j+4>>2];j=a+8|0;f=(g[k>>2]=O,c[k>>2]|0);h=(g[k>>2]=S,c[k>>2]|0)|0;c[j>>2]=0|f;c[j+4>>2]=h;h=a+16|0;a=(g[k>>2]=O-R,c[k>>2]|0);j=(g[k>>2]=S-M,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=j;c[m>>2]=1;return}function ci(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0;e=c[a+108>>2]|0;if((e|0)==0){bc(3596,217,11160,9296);return}else if((e|0)==1){f=a;h=b;i=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=i;i=a+8|0;h=d;f=c[i+4>>2]|0;c[h>>2]=c[i>>2]|0;c[h+4>>2]=f;return}else if((e|0)==2){f=a+24|0;j=+g[f>>2];h=a+60|0;l=+g[h>>2];m=j*+g[a+4>>2]+l*+g[a+40>>2];i=b;n=(g[k>>2]=j*+g[a>>2]+l*+g[a+36>>2],c[k>>2]|0);o=(g[k>>2]=m,c[k>>2]|0)|0;c[i>>2]=0|n;c[i+4>>2]=o;m=+g[f>>2];l=+g[h>>2];j=m*+g[a+12>>2]+l*+g[a+48>>2];h=d;f=(g[k>>2]=m*+g[a+8>>2]+l*+g[a+44>>2],c[k>>2]|0);o=(g[k>>2]=j,c[k>>2]|0)|0;c[h>>2]=0|f;c[h+4>>2]=o;return}else if((e|0)==3){j=+g[a+24>>2];l=+g[a+60>>2];m=+g[a+96>>2];p=j*+g[a+4>>2]+l*+g[a+40>>2]+m*+g[a+76>>2];e=b;b=(g[k>>2]=j*+g[a>>2]+l*+g[a+36>>2]+m*+g[a+72>>2],c[k>>2]|0);a=0|b;b=(g[k>>2]=p,c[k>>2]|0)|0;c[e>>2]=a;c[e+4>>2]=b;e=d;c[e>>2]=a;c[e+4>>2]=b;return}else{bc(3596,236,11160,9296);return}}function cj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;b=a+16|0;d=c[b>>2]|0;if((d|0)==-1){e=a+8|0;f=c[e>>2]|0;g=a+12|0;if((f|0)==(c[g>>2]|0)){h=f}else{bc(9120,61,15504,10048);h=c[g>>2]|0}f=a+4|0;i=c[f>>2]|0;c[g>>2]=h<<1;j=pQ(h*72&-1)|0;c[f>>2]=j;h=i;pY(j|0,h|0,(c[e>>2]|0)*36&-1);pR(h);h=c[e>>2]|0;j=(c[g>>2]|0)-1|0;L566:do{if((h|0)<(j|0)){i=h;while(1){k=i+1|0;c[(c[f>>2]|0)+(i*36&-1)+20>>2]=k;c[(c[f>>2]|0)+(i*36&-1)+32>>2]=-1;l=(c[g>>2]|0)-1|0;if((k|0)<(l|0)){i=k}else{m=l;break L566}}}else{m=j}}while(0);c[(c[f>>2]|0)+(m*36&-1)+20>>2]=-1;c[(c[f>>2]|0)+(((c[g>>2]|0)-1|0)*36&-1)+32>>2]=-1;g=c[e>>2]|0;c[b>>2]=g;n=g;o=f;p=e}else{n=d;o=a+4|0;p=a+8|0}a=(c[o>>2]|0)+(n*36&-1)+20|0;c[b>>2]=c[a>>2]|0;c[a>>2]=-1;c[(c[o>>2]|0)+(n*36&-1)+24>>2]=-1;c[(c[o>>2]|0)+(n*36&-1)+28>>2]=-1;c[(c[o>>2]|0)+(n*36&-1)+32>>2]=0;c[(c[o>>2]|0)+(n*36&-1)+16>>2]=0;c[p>>2]=(c[p>>2]|0)+1|0;return n|0}function ck(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0,G=0;d=a+24|0;c[d>>2]=(c[d>>2]|0)+1|0;d=a|0;e=c[d>>2]|0;if((e|0)==-1){c[d>>2]=b;c[(c[a+4>>2]|0)+(b*36&-1)+20>>2]=-1;return}f=a+4|0;h=c[f>>2]|0;i=+g[h+(b*36&-1)>>2];j=+g[h+(b*36&-1)+4>>2];l=+g[h+(b*36&-1)+8>>2];m=+g[h+(b*36&-1)+12>>2];n=c[h+(e*36&-1)+24>>2]|0;L576:do{if((n|0)==-1){o=e}else{p=e;q=n;while(1){r=c[h+(p*36&-1)+28>>2]|0;s=+g[h+(p*36&-1)+8>>2];t=+g[h+(p*36&-1)>>2];u=+g[h+(p*36&-1)+12>>2];v=+g[h+(p*36&-1)+4>>2];w=((s>l?s:l)-(t<i?t:i)+((u>m?u:m)-(v<j?v:j)))*2.0;x=w*2.0;y=(w-(s-t+(u-v))*2.0)*2.0;v=+g[h+(q*36&-1)>>2];u=i<v?i:v;t=+g[h+(q*36&-1)+4>>2];s=j<t?j:t;w=+g[h+(q*36&-1)+8>>2];z=l>w?l:w;A=+g[h+(q*36&-1)+12>>2];B=m>A?m:A;if((c[h+(q*36&-1)+24>>2]|0)==-1){C=(z-u+(B-s))*2.0}else{C=(z-u+(B-s))*2.0-(w-v+(A-t))*2.0}t=y+C;A=+g[h+(r*36&-1)>>2];v=i<A?i:A;w=+g[h+(r*36&-1)+4>>2];s=j<w?j:w;B=+g[h+(r*36&-1)+8>>2];u=l>B?l:B;z=+g[h+(r*36&-1)+12>>2];D=m>z?m:z;if((c[h+(r*36&-1)+24>>2]|0)==-1){E=(u-v+(D-s))*2.0}else{E=(u-v+(D-s))*2.0-(B-A+(z-w))*2.0}w=y+E;if(x<t&x<w){o=p;break L576}F=t<w?q:r;r=c[h+(F*36&-1)+24>>2]|0;if((r|0)==-1){o=F;break L576}else{p=F;q=r}}}}while(0);n=c[h+(o*36&-1)+20>>2]|0;h=cj(a)|0;c[(c[f>>2]|0)+(h*36&-1)+20>>2]=n;c[(c[f>>2]|0)+(h*36&-1)+16>>2]=0;e=c[f>>2]|0;E=+g[e+(o*36&-1)>>2];C=+g[e+(o*36&-1)+4>>2];q=e+(h*36&-1)|0;p=(g[k>>2]=i<E?i:E,c[k>>2]|0);r=(g[k>>2]=j<C?j:C,c[k>>2]|0)|0;c[q>>2]=0|p;c[q+4>>2]=r;C=+g[e+(o*36&-1)+8>>2];j=+g[e+(o*36&-1)+12>>2];r=e+(h*36&-1)+8|0;e=(g[k>>2]=l>C?l:C,c[k>>2]|0);q=(g[k>>2]=m>j?m:j,c[k>>2]|0)|0;c[r>>2]=0|e;c[r+4>>2]=q;q=c[f>>2]|0;c[q+(h*36&-1)+32>>2]=(c[q+(o*36&-1)+32>>2]|0)+1|0;q=c[f>>2]|0;if((n|0)==-1){c[q+(h*36&-1)+24>>2]=o;c[(c[f>>2]|0)+(h*36&-1)+28>>2]=b;c[(c[f>>2]|0)+(o*36&-1)+20>>2]=h;c[(c[f>>2]|0)+(b*36&-1)+20>>2]=h;c[d>>2]=h}else{d=q+(n*36&-1)+24|0;if((c[d>>2]|0)==(o|0)){c[d>>2]=h}else{c[q+(n*36&-1)+28>>2]=h}c[(c[f>>2]|0)+(h*36&-1)+24>>2]=o;c[(c[f>>2]|0)+(h*36&-1)+28>>2]=b;c[(c[f>>2]|0)+(o*36&-1)+20>>2]=h;c[(c[f>>2]|0)+(b*36&-1)+20>>2]=h}h=c[(c[f>>2]|0)+(b*36&-1)+20>>2]|0;if((h|0)==-1){return}else{G=h}while(1){h=co(a,G)|0;b=c[f>>2]|0;o=c[b+(h*36&-1)+24>>2]|0;n=c[b+(h*36&-1)+28>>2]|0;if((o|0)==-1){bc(9120,307,15540,3500)}if((n|0)==-1){bc(9120,308,15540,3248)}b=c[f>>2]|0;q=c[b+(o*36&-1)+32>>2]|0;d=c[b+(n*36&-1)+32>>2]|0;c[b+(h*36&-1)+32>>2]=((q|0)>(d|0)?q:d)+1|0;d=c[f>>2]|0;j=+g[d+(o*36&-1)>>2];m=+g[d+(n*36&-1)>>2];C=+g[d+(o*36&-1)+4>>2];l=+g[d+(n*36&-1)+4>>2];q=d+(h*36&-1)|0;b=(g[k>>2]=j<m?j:m,c[k>>2]|0);r=(g[k>>2]=C<l?C:l,c[k>>2]|0)|0;c[q>>2]=0|b;c[q+4>>2]=r;l=+g[d+(o*36&-1)+8>>2];C=+g[d+(n*36&-1)+8>>2];m=+g[d+(o*36&-1)+12>>2];j=+g[d+(n*36&-1)+12>>2];n=d+(h*36&-1)+8|0;d=(g[k>>2]=l>C?l:C,c[k>>2]|0);o=(g[k>>2]=m>j?m:j,c[k>>2]|0)|0;c[n>>2]=0|d;c[n+4>>2]=o;o=c[(c[f>>2]|0)+(h*36&-1)+20>>2]|0;if((o|0)==-1){break}else{G=o}}return}function cl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=(b|0)>-1;do{if(d){if((c[a+12>>2]|0)>(b|0)){break}else{e=445;break}}else{e=445}}while(0);if((e|0)==445){bc(9120,126,15464,7720)}f=a+4|0;if((c[(c[f>>2]|0)+(b*36&-1)+24>>2]|0)!=-1){bc(9120,127,15464,3988)}cm(a,b);do{if(d){if((c[a+12>>2]|0)>(b|0)){break}else{e=450;break}}else{e=450}}while(0);if((e|0)==450){bc(9120,97,15392,7592)}e=a+8|0;if((c[e>>2]|0)<=0){bc(9120,98,15392,5312)}d=a+16|0;c[(c[f>>2]|0)+(b*36&-1)+20>>2]=c[d>>2]|0;c[(c[f>>2]|0)+(b*36&-1)+32>>2]=-1;c[d>>2]=b;c[e>>2]=(c[e>>2]|0)-1|0;return}function cm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0;d=a|0;if((c[d>>2]|0)==(b|0)){c[d>>2]=-1;return}e=a+4|0;f=c[e>>2]|0;h=c[f+(b*36&-1)+20>>2]|0;i=c[f+(h*36&-1)+20>>2]|0;j=c[f+(h*36&-1)+24>>2]|0;if((j|0)==(b|0)){l=c[f+(h*36&-1)+28>>2]|0}else{l=j}if((i|0)==-1){c[d>>2]=l;c[f+(l*36&-1)+20>>2]=-1;do{if((h|0)>-1){if((c[a+12>>2]|0)>(h|0)){break}else{m=471;break}}else{m=471}}while(0);if((m|0)==471){bc(9120,97,15392,7592)}d=a+8|0;if((c[d>>2]|0)<=0){bc(9120,98,15392,5312)}j=a+16|0;c[(c[e>>2]|0)+(h*36&-1)+20>>2]=c[j>>2]|0;c[(c[e>>2]|0)+(h*36&-1)+32>>2]=-1;c[j>>2]=h;c[d>>2]=(c[d>>2]|0)-1|0;return}d=f+(i*36&-1)+24|0;if((c[d>>2]|0)==(h|0)){c[d>>2]=l}else{c[f+(i*36&-1)+28>>2]=l}c[(c[e>>2]|0)+(l*36&-1)+20>>2]=i;do{if((h|0)>-1){if((c[a+12>>2]|0)>(h|0)){break}else{m=464;break}}else{m=464}}while(0);if((m|0)==464){bc(9120,97,15392,7592)}m=a+8|0;if((c[m>>2]|0)<=0){bc(9120,98,15392,5312)}l=a+16|0;c[(c[e>>2]|0)+(h*36&-1)+20>>2]=c[l>>2]|0;c[(c[e>>2]|0)+(h*36&-1)+32>>2]=-1;c[l>>2]=h;c[m>>2]=(c[m>>2]|0)-1|0;m=i;while(1){i=co(a,m)|0;h=c[e>>2]|0;l=c[h+(i*36&-1)+24>>2]|0;f=c[h+(i*36&-1)+28>>2]|0;n=+g[h+(l*36&-1)>>2];o=+g[h+(f*36&-1)>>2];p=+g[h+(l*36&-1)+4>>2];q=+g[h+(f*36&-1)+4>>2];d=h+(i*36&-1)|0;j=(g[k>>2]=n<o?n:o,c[k>>2]|0);b=(g[k>>2]=p<q?p:q,c[k>>2]|0)|0;c[d>>2]=0|j;c[d+4>>2]=b;q=+g[h+(l*36&-1)+8>>2];p=+g[h+(f*36&-1)+8>>2];o=+g[h+(l*36&-1)+12>>2];n=+g[h+(f*36&-1)+12>>2];b=h+(i*36&-1)+8|0;h=(g[k>>2]=q>p?q:p,c[k>>2]|0);d=(g[k>>2]=o>n?o:n,c[k>>2]|0)|0;c[b>>2]=0|h;c[b+4>>2]=d;d=c[e>>2]|0;b=c[d+(l*36&-1)+32>>2]|0;l=c[d+(f*36&-1)+32>>2]|0;c[d+(i*36&-1)+32>>2]=((b|0)>(l|0)?b:l)+1|0;l=c[(c[e>>2]|0)+(i*36&-1)+20>>2]|0;if((l|0)==-1){break}else{m=l}}return}function cn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0;do{if((b|0)>-1){if((c[a+12>>2]|0)>(b|0)){break}else{f=481;break}}else{f=481}}while(0);if((f|0)==481){bc(9120,135,15320,7720)}f=a+4|0;h=c[f>>2]|0;if((c[h+(b*36&-1)+24>>2]|0)==-1){i=h}else{bc(9120,137,15320,3988);i=c[f>>2]|0}do{if(+g[i+(b*36&-1)>>2]<=+g[d>>2]){if(+g[i+(b*36&-1)+4>>2]>+g[d+4>>2]){break}if(+g[d+8>>2]>+g[i+(b*36&-1)+8>>2]){break}if(+g[d+12>>2]>+g[i+(b*36&-1)+12>>2]){break}else{j=0}return j|0}}while(0);cm(a,b);i=d;h=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=h,+g[k>>2]);h=d+8|0;d=c[h+4>>2]|0;n=(c[k>>2]=c[h>>2]|0,+g[k>>2]);o=l+-.10000000149011612;l=m+-.10000000149011612;m=n+.10000000149011612;n=(c[k>>2]=d,+g[k>>2])+.10000000149011612;p=+g[e>>2]*2.0;q=+g[e+4>>2]*2.0;if(p<0.0){r=m;s=o+p}else{r=p+m;s=o}if(q<0.0){t=n;u=l+q}else{t=q+n;u=l}e=c[f>>2]|0;f=e+(b*36&-1)|0;d=(g[k>>2]=s,c[k>>2]|0);h=(g[k>>2]=u,c[k>>2]|0)|0;c[f>>2]=0|d;c[f+4>>2]=h;h=e+(b*36&-1)+8|0;e=(g[k>>2]=r,c[k>>2]|0);f=(g[k>>2]=t,c[k>>2]|0)|0;c[h>>2]=0|e;c[h+4>>2]=f;ck(a,b);j=1;return j|0}function co(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0,M=0,N=0,O=0;if((b|0)==-1){bc(9120,382,15428,2992)}d=a+4|0;e=c[d>>2]|0;f=e+(b*36&-1)|0;h=e+(b*36&-1)+24|0;i=c[h>>2]|0;if((i|0)==-1){j=b;return j|0}l=e+(b*36&-1)+32|0;if((c[l>>2]|0)<2){j=b;return j|0}m=e+(b*36&-1)+28|0;n=c[m>>2]|0;do{if((i|0)>-1){if((i|0)<(c[a+12>>2]|0)){break}else{o=504;break}}else{o=504}}while(0);if((o|0)==504){bc(9120,392,15428,2772)}do{if((n|0)>-1){if((n|0)<(c[a+12>>2]|0)){break}else{o=507;break}}else{o=507}}while(0);if((o|0)==507){bc(9120,393,15428,10508)}p=c[d>>2]|0;q=p+(i*36&-1)|0;r=p+(n*36&-1)|0;s=p+(n*36&-1)+32|0;t=p+(i*36&-1)+32|0;u=(c[s>>2]|0)-(c[t>>2]|0)|0;if((u|0)>1){v=p+(n*36&-1)+24|0;w=c[v>>2]|0;x=p+(n*36&-1)+28|0;y=c[x>>2]|0;z=p+(w*36&-1)|0;A=p+(y*36&-1)|0;do{if((w|0)>-1){if((w|0)<(c[a+12>>2]|0)){break}else{o=511;break}}else{o=511}}while(0);if((o|0)==511){bc(9120,407,15428,10312)}do{if((y|0)>-1){if((y|0)<(c[a+12>>2]|0)){break}else{o=514;break}}else{o=514}}while(0);if((o|0)==514){bc(9120,408,15428,9944)}c[v>>2]=b;v=e+(b*36&-1)+20|0;B=p+(n*36&-1)+20|0;c[B>>2]=c[v>>2]|0;c[v>>2]=n;v=c[B>>2]|0;do{if((v|0)==-1){c[a>>2]=n}else{C=c[d>>2]|0;D=C+(v*36&-1)+24|0;if((c[D>>2]|0)==(b|0)){c[D>>2]=n;break}if((c[C+(v*36&-1)+28>>2]|0)==(b|0)){E=v;F=C}else{bc(9120,424,15428,9260);E=c[B>>2]|0;F=c[d>>2]|0}c[F+(E*36&-1)+28>>2]=n}}while(0);E=p+(w*36&-1)+32|0;F=p+(y*36&-1)+32|0;if((c[E>>2]|0)>(c[F>>2]|0)){c[x>>2]=w;c[m>>2]=y;c[p+(y*36&-1)+20>>2]=b;G=+g[q>>2];H=+g[A>>2];I=G<H?G:H;H=+g[p+(i*36&-1)+4>>2];G=+g[p+(y*36&-1)+4>>2];B=f;v=(g[k>>2]=I,c[k>>2]|0);C=(g[k>>2]=H<G?H:G,c[k>>2]|0)|0;c[B>>2]=0|v;c[B+4>>2]=C;G=+g[p+(i*36&-1)+8>>2];H=+g[p+(y*36&-1)+8>>2];J=+g[p+(i*36&-1)+12>>2];K=+g[p+(y*36&-1)+12>>2];C=e+(b*36&-1)+8|0;B=(g[k>>2]=G>H?G:H,c[k>>2]|0);v=(g[k>>2]=J>K?J:K,c[k>>2]|0)|0;c[C>>2]=0|B;c[C+4>>2]=v;K=+g[z>>2];J=+g[e+(b*36&-1)+4>>2];H=+g[p+(w*36&-1)+4>>2];v=r;C=(g[k>>2]=I<K?I:K,c[k>>2]|0);B=(g[k>>2]=J<H?J:H,c[k>>2]|0)|0;c[v>>2]=0|C;c[v+4>>2]=B;H=+g[e+(b*36&-1)+8>>2];J=+g[p+(w*36&-1)+8>>2];K=+g[e+(b*36&-1)+12>>2];I=+g[p+(w*36&-1)+12>>2];B=p+(n*36&-1)+8|0;v=(g[k>>2]=H>J?H:J,c[k>>2]|0);C=(g[k>>2]=K>I?K:I,c[k>>2]|0)|0;c[B>>2]=0|v;c[B+4>>2]=C;C=c[t>>2]|0;B=c[F>>2]|0;v=((C|0)>(B|0)?C:B)+1|0;c[l>>2]=v;B=c[E>>2]|0;L=(v|0)>(B|0)?v:B}else{c[x>>2]=y;c[m>>2]=w;c[p+(w*36&-1)+20>>2]=b;I=+g[q>>2];K=+g[z>>2];J=I<K?I:K;K=+g[p+(i*36&-1)+4>>2];I=+g[p+(w*36&-1)+4>>2];z=f;m=(g[k>>2]=J,c[k>>2]|0);x=(g[k>>2]=K<I?K:I,c[k>>2]|0)|0;c[z>>2]=0|m;c[z+4>>2]=x;I=+g[p+(i*36&-1)+8>>2];K=+g[p+(w*36&-1)+8>>2];H=+g[p+(i*36&-1)+12>>2];G=+g[p+(w*36&-1)+12>>2];w=e+(b*36&-1)+8|0;x=(g[k>>2]=I>K?I:K,c[k>>2]|0);z=(g[k>>2]=H>G?H:G,c[k>>2]|0)|0;c[w>>2]=0|x;c[w+4>>2]=z;G=+g[A>>2];H=+g[e+(b*36&-1)+4>>2];K=+g[p+(y*36&-1)+4>>2];A=r;z=(g[k>>2]=J<G?J:G,c[k>>2]|0);w=(g[k>>2]=H<K?H:K,c[k>>2]|0)|0;c[A>>2]=0|z;c[A+4>>2]=w;K=+g[e+(b*36&-1)+8>>2];H=+g[p+(y*36&-1)+8>>2];G=+g[e+(b*36&-1)+12>>2];J=+g[p+(y*36&-1)+12>>2];y=p+(n*36&-1)+8|0;w=(g[k>>2]=K>H?K:H,c[k>>2]|0);A=(g[k>>2]=G>J?G:J,c[k>>2]|0)|0;c[y>>2]=0|w;c[y+4>>2]=A;A=c[t>>2]|0;y=c[E>>2]|0;E=((A|0)>(y|0)?A:y)+1|0;c[l>>2]=E;y=c[F>>2]|0;L=(E|0)>(y|0)?E:y}c[s>>2]=L+1|0;j=n;return j|0}if((u|0)>=-1){j=b;return j|0}u=p+(i*36&-1)+24|0;L=c[u>>2]|0;y=p+(i*36&-1)+28|0;E=c[y>>2]|0;F=p+(L*36&-1)|0;A=p+(E*36&-1)|0;do{if((L|0)>-1){if((L|0)<(c[a+12>>2]|0)){break}else{o=529;break}}else{o=529}}while(0);if((o|0)==529){bc(9120,467,15428,9032)}do{if((E|0)>-1){if((E|0)<(c[a+12>>2]|0)){break}else{o=532;break}}else{o=532}}while(0);if((o|0)==532){bc(9120,468,15428,8940)}c[u>>2]=b;u=e+(b*36&-1)+20|0;o=p+(i*36&-1)+20|0;c[o>>2]=c[u>>2]|0;c[u>>2]=i;u=c[o>>2]|0;do{if((u|0)==-1){c[a>>2]=i}else{w=c[d>>2]|0;z=w+(u*36&-1)+24|0;if((c[z>>2]|0)==(b|0)){c[z>>2]=i;break}if((c[w+(u*36&-1)+28>>2]|0)==(b|0)){M=u;N=w}else{bc(9120,484,15428,8752);M=c[o>>2]|0;N=c[d>>2]|0}c[N+(M*36&-1)+28>>2]=i}}while(0);M=p+(L*36&-1)+32|0;N=p+(E*36&-1)+32|0;if((c[M>>2]|0)>(c[N>>2]|0)){c[y>>2]=L;c[h>>2]=E;c[p+(E*36&-1)+20>>2]=b;J=+g[r>>2];G=+g[A>>2];H=J<G?J:G;G=+g[p+(n*36&-1)+4>>2];J=+g[p+(E*36&-1)+4>>2];d=f;o=(g[k>>2]=H,c[k>>2]|0);u=(g[k>>2]=G<J?G:J,c[k>>2]|0)|0;c[d>>2]=0|o;c[d+4>>2]=u;J=+g[p+(n*36&-1)+8>>2];G=+g[p+(E*36&-1)+8>>2];K=+g[p+(n*36&-1)+12>>2];I=+g[p+(E*36&-1)+12>>2];u=e+(b*36&-1)+8|0;d=(g[k>>2]=J>G?J:G,c[k>>2]|0);o=(g[k>>2]=K>I?K:I,c[k>>2]|0)|0;c[u>>2]=0|d;c[u+4>>2]=o;I=+g[F>>2];K=+g[e+(b*36&-1)+4>>2];G=+g[p+(L*36&-1)+4>>2];o=q;u=(g[k>>2]=H<I?H:I,c[k>>2]|0);d=(g[k>>2]=K<G?K:G,c[k>>2]|0)|0;c[o>>2]=0|u;c[o+4>>2]=d;G=+g[e+(b*36&-1)+8>>2];K=+g[p+(L*36&-1)+8>>2];I=+g[e+(b*36&-1)+12>>2];H=+g[p+(L*36&-1)+12>>2];d=p+(i*36&-1)+8|0;o=(g[k>>2]=G>K?G:K,c[k>>2]|0);u=(g[k>>2]=I>H?I:H,c[k>>2]|0)|0;c[d>>2]=0|o;c[d+4>>2]=u;u=c[s>>2]|0;d=c[N>>2]|0;o=((u|0)>(d|0)?u:d)+1|0;c[l>>2]=o;d=c[M>>2]|0;O=(o|0)>(d|0)?o:d}else{c[y>>2]=E;c[h>>2]=L;c[p+(L*36&-1)+20>>2]=b;H=+g[r>>2];I=+g[F>>2];K=H<I?H:I;I=+g[p+(n*36&-1)+4>>2];H=+g[p+(L*36&-1)+4>>2];F=f;f=(g[k>>2]=K,c[k>>2]|0);r=(g[k>>2]=I<H?I:H,c[k>>2]|0)|0;c[F>>2]=0|f;c[F+4>>2]=r;H=+g[p+(n*36&-1)+8>>2];I=+g[p+(L*36&-1)+8>>2];G=+g[p+(n*36&-1)+12>>2];J=+g[p+(L*36&-1)+12>>2];L=e+(b*36&-1)+8|0;n=(g[k>>2]=H>I?H:I,c[k>>2]|0);r=(g[k>>2]=G>J?G:J,c[k>>2]|0)|0;c[L>>2]=0|n;c[L+4>>2]=r;J=+g[A>>2];G=+g[e+(b*36&-1)+4>>2];I=+g[p+(E*36&-1)+4>>2];A=q;q=(g[k>>2]=K<J?K:J,c[k>>2]|0);r=(g[k>>2]=G<I?G:I,c[k>>2]|0)|0;c[A>>2]=0|q;c[A+4>>2]=r;I=+g[e+(b*36&-1)+8>>2];G=+g[p+(E*36&-1)+8>>2];J=+g[e+(b*36&-1)+12>>2];K=+g[p+(E*36&-1)+12>>2];E=p+(i*36&-1)+8|0;p=(g[k>>2]=I>G?I:G,c[k>>2]|0);b=(g[k>>2]=J>K?J:K,c[k>>2]|0)|0;c[E>>2]=0|p;c[E+4>>2]=b;b=c[s>>2]|0;s=c[M>>2]|0;M=((b|0)>(s|0)?b:s)+1|0;c[l>>2]=M;l=c[N>>2]|0;O=(M|0)>(l|0)?M:l}c[t>>2]=O+1|0;j=i;return j|0}function cp(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;do{if((b|0)>-1){if((c[a+12>>2]|0)>(b|0)){break}else{d=552;break}}else{d=552}}while(0);if((d|0)==552){bc(9120,563,11940,7592)}d=c[a+4>>2]|0;e=c[d+(b*36&-1)+24>>2]|0;if((e|0)==-1){return 0}else{f=cp(a,e)|0;e=cp(a,c[d+(b*36&-1)+28>>2]|0)|0;return((f|0)>(e|0)?f:e)+1|0}return 0}function cq(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((b|0)==-1){return}d=a|0;e=a+4|0;f=a+12|0;g=b;while(1){do{if((c[d>>2]|0)==(g|0)){if((c[(c[e>>2]|0)+(g*36&-1)+20>>2]|0)==-1){break}bc(9120,591,11792,8452)}}while(0);h=c[e>>2]|0;b=c[h+(g*36&-1)+24>>2]|0;i=c[h+(g*36&-1)+28>>2]|0;if((b|0)==-1){break}do{if((b|0)>-1){if((b|0)<(c[f>>2]|0)){break}else{j=568;break}}else{j=568}}while(0);if((j|0)==568){j=0;bc(9120,607,11792,7832)}do{if((i|0)>-1){if((i|0)<(c[f>>2]|0)){break}else{j=571;break}}else{j=571}}while(0);if((j|0)==571){j=0;bc(9120,608,11792,7428)}k=c[e>>2]|0;if((c[k+(b*36&-1)+20>>2]|0)==(g|0)){l=k}else{bc(9120,610,11792,7184);l=c[e>>2]|0}if((c[l+(i*36&-1)+20>>2]|0)!=(g|0)){bc(9120,611,11792,6816)}cq(a,b);if((i|0)==-1){j=579;break}else{g=i}}if((j|0)==579){return}if((i|0)!=-1){bc(9120,602,11792,8228)}if((c[h+(g*36&-1)+32>>2]|0)==0){return}bc(9120,603,11792,8036);return}function cr(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0;if((b|0)==-1){return}d=a+4|0;e=a+12|0;f=b;while(1){h=c[d>>2]|0;b=c[h+(f*36&-1)+24>>2]|0;i=c[h+(f*36&-1)+28>>2]|0;if((b|0)==-1){break}do{if((b|0)>-1){if((b|0)<(c[e>>2]|0)){break}else{j=591;break}}else{j=591}}while(0);if((j|0)==591){j=0;bc(9120,637,11844,7832)}do{if((i|0)>-1){if((i|0)<(c[e>>2]|0)){break}else{j=594;break}}else{j=594}}while(0);if((j|0)==594){j=0;bc(9120,638,11844,7428)}k=c[d>>2]|0;l=c[k+(b*36&-1)+32>>2]|0;m=c[k+(i*36&-1)+32>>2]|0;if((c[h+(f*36&-1)+32>>2]|0)==(((l|0)>(m|0)?l:m)+1|0)){n=k}else{bc(9120,644,11844,6672);n=c[d>>2]|0}o=+g[n+(b*36&-1)>>2];p=+g[n+(i*36&-1)>>2];q=+g[n+(b*36&-1)+4>>2];r=+g[n+(i*36&-1)+4>>2];s=+g[n+(b*36&-1)+8>>2];t=+g[n+(i*36&-1)+8>>2];u=s>t?s:t;t=+g[n+(b*36&-1)+12>>2];s=+g[n+(i*36&-1)+12>>2];v=t>s?t:s;do{if((o<p?o:p)==+g[h+(f*36&-1)>>2]){if((q<r?q:r)==+g[h+(f*36&-1)+4>>2]){break}else{j=599;break}}else{j=599}}while(0);if((j|0)==599){j=0;bc(9120,649,11844,6340)}do{if(u==+g[h+(f*36&-1)+8>>2]){if(v==+g[h+(f*36&-1)+12>>2]){break}else{j=602;break}}else{j=602}}while(0);if((j|0)==602){j=0;bc(9120,650,11844,6124)}cr(a,b);if((i|0)==-1){j=607;break}else{f=i}}if((j|0)==607){return}if((i|0)!=-1){bc(9120,632,11844,8228)}if((c[h+(f*36&-1)+32>>2]|0)==0){return}bc(9120,633,11844,8036);return}function cs(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;b=a|0;cq(a,c[b>>2]|0);cr(a,c[b>>2]|0);d=c[a+16>>2]|0;L847:do{if((d|0)==-1){e=0}else{f=a+12|0;g=a+4|0;h=0;i=d;while(1){do{if((i|0)>-1){if((i|0)<(c[f>>2]|0)){break}else{j=613;break}}else{j=613}}while(0);if((j|0)==613){j=0;bc(9120,665,11660,5696)}k=h+1|0;l=c[(c[g>>2]|0)+(i*36&-1)+20>>2]|0;if((l|0)==-1){e=k;break L847}else{h=k;i=l}}}}while(0);j=c[b>>2]|0;if((j|0)==-1){m=0}else{m=c[(c[a+4>>2]|0)+(j*36&-1)+32>>2]|0}if((m|0)!=(cp(a,j)|0)){bc(9120,670,11660,5664)}if(((c[a+8>>2]|0)+e|0)==(c[a+12>>2]|0)){return}bc(9120,672,11660,5536);return}function ct(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0,w=0,x=0.0,y=0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0,F=0,G=0,H=0,I=0.0;b=a+8|0;d=pQ(c[b>>2]<<2)|0;e=d;f=a+12|0;if((c[f>>2]|0)<=0){h=c[e>>2]|0;i=a|0;c[i>>2]=h;pR(d);cs(a);return}j=a+4|0;l=a+16|0;m=0;n=0;while(1){o=c[j>>2]|0;do{if((c[o+(m*36&-1)+32>>2]|0)<0){p=n}else{if((c[o+(m*36&-1)+24>>2]|0)==-1){c[o+(m*36&-1)+20>>2]=-1;c[e+(n<<2)>>2]=m;p=n+1|0;break}if((c[b>>2]|0)<=0){bc(9120,98,15392,5312)}c[(c[j>>2]|0)+(m*36&-1)+20>>2]=c[l>>2]|0;c[(c[j>>2]|0)+(m*36&-1)+32>>2]=-1;c[l>>2]=m;c[b>>2]=(c[b>>2]|0)-1|0;p=n}}while(0);o=m+1|0;if((o|0)<(c[f>>2]|0)){m=o;n=p}else{break}}if((p|0)<=1){h=c[e>>2]|0;i=a|0;c[i>>2]=h;pR(d);cs(a);return}n=a+4|0;m=p;while(1){p=c[n>>2]|0;f=0;b=-1;l=-1;q=3.4028234663852886e+38;while(1){j=c[e+(f<<2)>>2]|0;r=+g[p+(j*36&-1)>>2];s=+g[p+(j*36&-1)+4>>2];t=+g[p+(j*36&-1)+8>>2];u=+g[p+(j*36&-1)+12>>2];j=f+1|0;L890:do{if((j|0)<(m|0)){o=j;v=b;w=l;x=q;while(1){y=c[e+(o<<2)>>2]|0;z=+g[p+(y*36&-1)>>2];A=+g[p+(y*36&-1)+4>>2];B=+g[p+(y*36&-1)+8>>2];C=+g[p+(y*36&-1)+12>>2];D=((t>B?t:B)-(r<z?r:z)+((u>C?u:C)-(s<A?s:A)))*2.0;y=D<x;E=y?o:v;F=y?f:w;A=y?D:x;y=o+1|0;if((y|0)==(m|0)){G=E;H=F;I=A;break L890}else{o=y;v=E;w=F;x=A}}}else{G=b;H=l;I=q}}while(0);if((j|0)==(m|0)){break}else{f=j;b=G;l=H;q=I}}l=e+(H<<2)|0;b=c[l>>2]|0;f=e+(G<<2)|0;w=c[f>>2]|0;v=cj(a)|0;o=c[n>>2]|0;c[o+(v*36&-1)+24>>2]=b;c[o+(v*36&-1)+28>>2]=w;F=c[p+(b*36&-1)+32>>2]|0;E=c[p+(w*36&-1)+32>>2]|0;c[o+(v*36&-1)+32>>2]=((F|0)>(E|0)?F:E)+1|0;q=+g[p+(b*36&-1)>>2];s=+g[p+(w*36&-1)>>2];u=+g[p+(b*36&-1)+4>>2];r=+g[p+(w*36&-1)+4>>2];E=o+(v*36&-1)|0;F=(g[k>>2]=q<s?q:s,c[k>>2]|0);y=(g[k>>2]=u<r?u:r,c[k>>2]|0)|0;c[E>>2]=0|F;c[E+4>>2]=y;r=+g[p+(b*36&-1)+8>>2];u=+g[p+(w*36&-1)+8>>2];s=+g[p+(b*36&-1)+12>>2];q=+g[p+(w*36&-1)+12>>2];y=o+(v*36&-1)+8|0;E=(g[k>>2]=r>u?r:u,c[k>>2]|0);F=(g[k>>2]=s>q?s:q,c[k>>2]|0)|0;c[y>>2]=0|E;c[y+4>>2]=F;c[o+(v*36&-1)+20>>2]=-1;c[p+(b*36&-1)+20>>2]=v;c[p+(w*36&-1)+20>>2]=v;w=m-1|0;c[f>>2]=c[e+(w<<2)>>2]|0;c[l>>2]=v;if((w|0)>1){m=w}else{break}}h=c[e>>2]|0;i=a|0;c[i>>2]=h;pR(d);cs(a);return}function cu(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0.0,x=0.0,y=0.0,z=0,A=0,B=0.0,C=0.0,D=0,E=0.0,F=0.0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,P=0,Q=0,R=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0.0,$=0.0,aa=0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0,ao=0,ap=0,aq=0.0,ar=0,as=0.0,at=0.0,au=0,av=0.0,aw=0.0,ax=0.0,ay=0.0,az=0,aA=0.0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;f=i;i=i+308|0;h=f|0;j=f+36|0;l=f+72|0;m=f+84|0;n=f+176|0;o=f+200|0;p=f+300|0;q=f+304|0;c[632]=(c[632]|0)+1|0;r=d|0;c[r>>2]=0;s=e+128|0;t=d+4|0;g[t>>2]=+g[s>>2];d=e|0;u=e+28|0;pY(h|0,e+56|0,36);pY(j|0,e+92|0,36);v=h+24|0;w=+g[v>>2];x=+O(+(w/6.2831854820251465))*6.2831854820251465;y=w-x;g[v>>2]=y;z=h+28|0;w=+g[z>>2]-x;g[z>>2]=w;A=j+24|0;x=+g[A>>2];B=+O(+(x/6.2831854820251465))*6.2831854820251465;C=x-B;g[A>>2]=C;D=j+28|0;x=+g[D>>2]-B;g[D>>2]=x;B=+g[s>>2];E=+g[e+24>>2]+ +g[e+52>>2]+-.014999999664723873;F=E<.004999999888241291?.004999999888241291:E;if(F<=.0012499999720603228){bc(4848,280,16312,9168)}b[l+4>>1]=0;s=m;G=e;c[s>>2]=c[G>>2]|0;c[s+4>>2]=c[G+4>>2]|0;c[s+8>>2]=c[G+8>>2]|0;c[s+12>>2]=c[G+12>>2]|0;c[s+16>>2]=c[G+16>>2]|0;c[s+20>>2]=c[G+20>>2]|0;c[s+24>>2]=c[G+24>>2]|0;G=m+28|0;s=u;c[G>>2]=c[s>>2]|0;c[G+4>>2]=c[s+4>>2]|0;c[G+8>>2]=c[s+8>>2]|0;c[G+12>>2]=c[s+12>>2]|0;c[G+16>>2]=c[s+16>>2]|0;c[G+20>>2]=c[s+20>>2]|0;c[G+24>>2]=c[s+24>>2]|0;a[m+88|0]=0;s=h+8|0;G=h+12|0;e=h+16|0;H=h+20|0;I=h|0;J=h+4|0;K=j+8|0;L=j+12|0;M=j+16|0;N=j+20|0;P=j|0;Q=j+4|0;R=m+56|0;U=m+64|0;V=m+68|0;W=m+72|0;X=m+80|0;Y=m+84|0;Z=n+16|0;E=F+.0012499999720603228;_=F+-.0012499999720603228;$=0.0;aa=0;ab=y;y=w;w=C;C=x;L900:while(1){x=1.0-$;ac=x*+g[s>>2]+$*+g[e>>2];ad=x*+g[G>>2]+$*+g[H>>2];ae=x*ab+$*y;af=+T(+ae);ag=+S(+ae);ae=+g[I>>2];ah=+g[J>>2];ai=x*+g[K>>2]+$*+g[M>>2];aj=x*+g[L>>2]+$*+g[N>>2];ak=x*w+$*C;x=+T(+ak);al=+S(+ak);ak=+g[P>>2];am=+g[Q>>2];an=(g[k>>2]=ac-(ag*ae-af*ah),c[k>>2]|0);ao=(g[k>>2]=ad-(af*ae+ag*ah),c[k>>2]|0)|0;c[R>>2]=0|an;c[R+4>>2]=ao;g[U>>2]=af;g[V>>2]=ag;ao=(g[k>>2]=ai-(al*ak-x*am),c[k>>2]|0);an=(g[k>>2]=aj-(x*ak+al*am),c[k>>2]|0)|0;c[W>>2]=0|ao;c[W+4>>2]=an;g[X>>2]=x;g[Y>>2]=al;cg(n,l,m);al=+g[Z>>2];if(al<=0.0){ap=648;break}if(al<E){ap=650;break}cv(o,l,d,h,u,j,$);an=0;al=B;while(1){x=+cx(o,p,q,al);if(x>E){ap=653;break L900}if(x>_){aq=al;break}ao=c[p>>2]|0;ar=c[q>>2]|0;am=+cy(o,ao,ar,$);if(am<_){ap=656;break L900}if(am>E){as=al;at=$;au=0;av=am;aw=x}else{ap=658;break L900}while(1){if((au&1|0)==0){ax=(at+as)*.5}else{ax=at+(F-av)*(as-at)/(aw-av)}x=+cy(o,ao,ar,ax);am=x-F;if(am>0.0){ay=am}else{ay=-0.0-am}if(ay<.0012499999720603228){az=au;aA=ax;break}aB=x>F;aC=au+1|0;c[628]=(c[628]|0)+1|0;if((aC|0)==50){az=50;aA=al;break}else{as=aB?as:ax;at=aB?ax:at;au=aC;av=aB?x:av;aw=aB?aw:x}}ar=c[629]|0;c[629]=(ar|0)>(az|0)?ar:az;ar=an+1|0;if((ar|0)==8){aq=$;break}else{an=ar;al=aA}}an=aa+1|0;c[631]=(c[631]|0)+1|0;if((an|0)==20){ap=670;break}$=aq;aa=an;ab=+g[v>>2];y=+g[z>>2];w=+g[A>>2];C=+g[D>>2]}if((ap|0)==670){c[r>>2]=1;g[t>>2]=aq;aD=20;aE=c[630]|0;aF=(aE|0)>(aD|0);aG=aF?aE:aD;c[630]=aG;i=f;return}else if((ap|0)==658){c[r>>2]=3;g[t>>2]=$}else if((ap|0)==653){c[r>>2]=4;g[t>>2]=B}else if((ap|0)==650){c[r>>2]=3;g[t>>2]=$;aD=aa;aE=c[630]|0;aF=(aE|0)>(aD|0);aG=aF?aE:aD;c[630]=aG;i=f;return}else if((ap|0)==648){c[r>>2]=2;g[t>>2]=0.0;aD=aa;aE=c[630]|0;aF=(aE|0)>(aD|0);aG=aF?aE:aD;c[630]=aG;i=f;return}else if((ap|0)==656){c[r>>2]=1;g[t>>2]=$}c[631]=(c[631]|0)+1|0;aD=aa+1|0;aE=c[630]|0;aF=(aE|0)>(aD|0);aG=aF?aE:aD;c[630]=aG;i=f;return}function cv(e,f,h,i,j,l,m){e=e|0;f=f|0;h=h|0;i=i|0;j=j|0;l=l|0;m=+m;var n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0.0,M=0.0,N=0,O=0,P=0.0,R=0.0;n=e|0;c[n>>2]=h;o=e+4|0;c[o>>2]=j;p=b[f+4>>1]|0;if(!(p<<16>>16!=0&(p&65535)<3)){bc(4848,50,14348,3860)}q=e+8|0;pY(q|0,i|0,36);i=e+44|0;pY(i|0,l|0,36);r=1.0-m;s=r*+g[e+16>>2]+ +g[e+24>>2]*m;t=r*+g[e+20>>2]+ +g[e+28>>2]*m;u=r*+g[e+32>>2]+ +g[e+36>>2]*m;v=+T(+u);w=+S(+u);u=+g[q>>2];x=+g[e+12>>2];y=s-(w*u-v*x);s=t-(v*u+w*x);x=r*+g[e+52>>2]+ +g[e+60>>2]*m;u=r*+g[e+56>>2]+ +g[e+64>>2]*m;t=r*+g[e+68>>2]+ +g[e+72>>2]*m;m=+T(+t);r=+S(+t);t=+g[i>>2];z=+g[e+48>>2];A=x-(r*t-m*z);x=u-(m*t+r*z);if(p<<16>>16==1){c[e+80>>2]=0;p=c[n>>2]|0;i=d[f+6|0]|0;if((c[p+20>>2]|0)<=(i|0)){bc(5580,103,11416,4596)}q=(c[p+16>>2]|0)+(i<<3)|0;i=c[q+4>>2]|0;z=(c[k>>2]=c[q>>2]|0,+g[k>>2]);t=(c[k>>2]=i,+g[k>>2]);i=c[o>>2]|0;q=d[f+9|0]|0;if((c[i+20>>2]|0)<=(q|0)){bc(5580,103,11416,4596)}p=(c[i+16>>2]|0)+(q<<3)|0;q=c[p+4>>2]|0;u=(c[k>>2]=c[p>>2]|0,+g[k>>2]);B=(c[k>>2]=q,+g[k>>2]);q=e+92|0;C=A+(r*u-m*B)-(y+(w*z-v*t));D=x+(m*u+r*B)-(s+(v*z+w*t));p=q;i=(g[k>>2]=C,c[k>>2]|0);l=(g[k>>2]=D,c[k>>2]|0)|0;c[p>>2]=0|i;c[p+4>>2]=l;t=+Q(+(C*C+D*D));if(t<1.1920928955078125e-7){E=0.0;return+E}z=1.0/t;g[q>>2]=C*z;g[e+96>>2]=D*z;E=t;return+E}q=f+6|0;l=f+7|0;p=e+80|0;if((a[q]|0)==(a[l]|0)){c[p>>2]=2;i=d[f+9|0]|0;F=j+20|0;G=c[F>>2]|0;if((G|0)>(i|0)){H=G}else{bc(5580,103,11416,4596);H=c[F>>2]|0}F=j+16|0;j=c[F>>2]|0;G=j+(i<<3)|0;i=c[G+4>>2]|0;t=(c[k>>2]=c[G>>2]|0,+g[k>>2]);z=(c[k>>2]=i,+g[k>>2]);i=d[f+10|0]|0;if((H|0)>(i|0)){I=j}else{bc(5580,103,11416,4596);I=c[F>>2]|0}F=I+(i<<3)|0;i=c[F+4>>2]|0;D=(c[k>>2]=c[F>>2]|0,+g[k>>2]);C=(c[k>>2]=i,+g[k>>2]);i=e+92|0;B=C-z;u=(D-t)*-1.0;F=i;I=(g[k>>2]=B,c[k>>2]|0);j=(g[k>>2]=u,c[k>>2]|0)|0;c[F>>2]=0|I;c[F+4>>2]=j;j=i|0;i=e+96|0;J=+Q(+(B*B+u*u));if(J<1.1920928955078125e-7){K=B;L=u}else{M=1.0/J;J=B*M;g[j>>2]=J;B=u*M;g[i>>2]=B;K=J;L=B}B=(t+D)*.5;D=(z+C)*.5;I=e+84|0;H=(g[k>>2]=B,c[k>>2]|0);G=(g[k>>2]=D,c[k>>2]|0)|0;c[I>>2]=0|H;c[I+4>>2]=G;G=d[q]|0;if((c[h+20>>2]|0)<=(G|0)){bc(5580,103,11416,4596)}I=(c[h+16>>2]|0)+(G<<3)|0;G=c[I+4>>2]|0;C=(c[k>>2]=c[I>>2]|0,+g[k>>2]);z=(c[k>>2]=G,+g[k>>2]);t=(r*K-m*L)*(y+(w*C-v*z)-(A+(r*B-m*D)))+(m*K+r*L)*(s+(v*C+w*z)-(x+(m*B+r*D)));if(t>=0.0){E=t;return+E}D=-0.0- +g[i>>2];i=(g[k>>2]=-0.0- +g[j>>2],c[k>>2]|0);j=(g[k>>2]=D,c[k>>2]|0)|0;c[F>>2]=0|i;c[F+4>>2]=j;E=-0.0-t;return+E}else{c[p>>2]=1;p=c[n>>2]|0;j=d[q]|0;q=c[p+20>>2]|0;if((q|0)>(j|0)){N=p;O=q}else{bc(5580,103,11416,4596);q=c[n>>2]|0;N=q;O=c[q+20>>2]|0}q=(c[p+16>>2]|0)+(j<<3)|0;j=c[q+4>>2]|0;t=(c[k>>2]=c[q>>2]|0,+g[k>>2]);D=(c[k>>2]=j,+g[k>>2]);j=d[l]|0;if((O|0)<=(j|0)){bc(5580,103,11416,4596)}O=(c[N+16>>2]|0)+(j<<3)|0;j=c[O+4>>2]|0;B=(c[k>>2]=c[O>>2]|0,+g[k>>2]);z=(c[k>>2]=j,+g[k>>2]);j=e+92|0;C=z-D;L=(B-t)*-1.0;O=j;N=(g[k>>2]=C,c[k>>2]|0);l=(g[k>>2]=L,c[k>>2]|0)|0;c[O>>2]=0|N;c[O+4>>2]=l;l=j|0;j=e+96|0;K=+Q(+(C*C+L*L));if(K<1.1920928955078125e-7){P=C;R=L}else{J=1.0/K;K=C*J;g[l>>2]=K;C=L*J;g[j>>2]=C;P=K;R=C}C=(t+B)*.5;B=(D+z)*.5;N=e+84|0;e=(g[k>>2]=C,c[k>>2]|0);q=(g[k>>2]=B,c[k>>2]|0)|0;c[N>>2]=0|e;c[N+4>>2]=q;q=c[o>>2]|0;o=d[f+9|0]|0;if((c[q+20>>2]|0)<=(o|0)){bc(5580,103,11416,4596)}f=(c[q+16>>2]|0)+(o<<3)|0;o=c[f+4>>2]|0;z=(c[k>>2]=c[f>>2]|0,+g[k>>2]);D=(c[k>>2]=o,+g[k>>2]);t=(w*P-v*R)*(A+(r*z-m*D)-(y+(w*C-v*B)))+(v*P+w*R)*(x+(m*z+r*D)-(s+(v*C+w*B)));if(t>=0.0){E=t;return+E}B=-0.0- +g[j>>2];j=(g[k>>2]=-0.0- +g[l>>2],c[k>>2]|0);l=(g[k>>2]=B,c[k>>2]|0)|0;c[O>>2]=0|j;c[O+4>>2]=l;E=-0.0-t;return+E}return 0.0}function cw(a){a=a|0;return(c[a+16>>2]|0)-1|0}function cx(a,b,d,e){a=a|0;b=b|0;d=d|0;e=+e;var f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0,y=0,z=0,A=0,B=0.0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,U=0,V=0,W=0,X=0;f=1.0-e;h=f*+g[a+16>>2]+ +g[a+24>>2]*e;i=f*+g[a+20>>2]+ +g[a+28>>2]*e;j=f*+g[a+32>>2]+ +g[a+36>>2]*e;l=+T(+j);m=+S(+j);j=+g[a+8>>2];n=+g[a+12>>2];o=h-(m*j-l*n);h=i-(l*j+m*n);n=f*+g[a+52>>2]+ +g[a+60>>2]*e;j=f*+g[a+56>>2]+ +g[a+64>>2]*e;i=f*+g[a+68>>2]+ +g[a+72>>2]*e;e=+T(+i);f=+S(+i);i=+g[a+44>>2];p=+g[a+48>>2];q=n-(f*i-e*p);n=j-(e*i+f*p);r=c[a+80>>2]|0;if((r|0)==1){p=+g[a+92>>2];i=+g[a+96>>2];j=m*p-l*i;s=l*p+m*i;i=+g[a+84>>2];p=+g[a+88>>2];t=o+(m*i-l*p);u=h+(l*i+m*p);p=-0.0-s;i=f*(-0.0-j)+e*p;v=e*j+f*p;c[b>>2]=-1;w=a+4|0;x=c[w>>2]|0;y=c[x+16>>2]|0;z=c[x+20>>2]|0;do{if((z|0)>1){p=v*+g[y+4>>2]+i*+g[y>>2];x=1;A=0;while(1){B=i*+g[y+(x<<3)>>2]+v*+g[y+(x<<3)+4>>2];C=B>p;D=C?x:A;E=x+1|0;if((E|0)==(z|0)){break}else{p=C?B:p;x=E;A=D}}c[d>>2]=D;A=c[w>>2]|0;if((D|0)>-1){F=D;G=A;H=733;break}else{I=D;J=A;H=734;break}}else{c[d>>2]=0;F=0;G=c[w>>2]|0;H=733;break}}while(0);do{if((H|0)==733){if((c[G+20>>2]|0)>(F|0)){K=F;L=G;break}else{I=F;J=G;H=734;break}}}while(0);if((H|0)==734){bc(5580,103,11416,4596);K=I;L=J}J=(c[L+16>>2]|0)+(K<<3)|0;K=c[J+4>>2]|0;v=(c[k>>2]=c[J>>2]|0,+g[k>>2]);i=(c[k>>2]=K,+g[k>>2]);p=j*(q+(f*v-e*i)-t)+s*(n+(e*v+f*i)-u);return+p}else if((r|0)==0){K=a+92|0;u=+g[K>>2];J=a+96|0;i=+g[J>>2];v=m*u+l*i;s=u*(-0.0-l)+m*i;t=-0.0-i;i=f*(-0.0-u)+e*t;j=e*u+f*t;L=a|0;I=c[L>>2]|0;G=c[I+16>>2]|0;F=c[I+20>>2]|0;L1005:do{if((F|0)>1){t=s*+g[G+4>>2]+v*+g[G>>2];I=1;w=0;while(1){u=v*+g[G+(I<<3)>>2]+s*+g[G+(I<<3)+4>>2];D=u>t;z=D?I:w;y=I+1|0;if((y|0)==(F|0)){M=z;break L1005}else{t=D?u:t;I=y;w=z}}}else{M=0}}while(0);c[b>>2]=M;M=a+4|0;F=c[M>>2]|0;G=c[F+16>>2]|0;w=c[F+20>>2]|0;L1010:do{if((w|0)>1){s=j*+g[G+4>>2]+i*+g[G>>2];F=1;I=0;while(1){v=i*+g[G+(F<<3)>>2]+j*+g[G+(F<<3)+4>>2];z=v>s;y=z?F:I;D=F+1|0;if((D|0)==(w|0)){N=y;break L1010}else{s=z?v:s;F=D;I=y}}}else{N=0}}while(0);c[d>>2]=N;w=c[L>>2]|0;L=c[b>>2]|0;do{if((L|0)>-1){if((c[w+20>>2]|0)>(L|0)){O=N;break}else{H=723;break}}else{H=723}}while(0);if((H|0)==723){bc(5580,103,11416,4596);O=c[d>>2]|0}N=(c[w+16>>2]|0)+(L<<3)|0;L=c[N+4>>2]|0;j=(c[k>>2]=c[N>>2]|0,+g[k>>2]);i=(c[k>>2]=L,+g[k>>2]);L=c[M>>2]|0;do{if((O|0)>-1){if((c[L+20>>2]|0)>(O|0)){break}else{H=726;break}}else{H=726}}while(0);if((H|0)==726){bc(5580,103,11416,4596)}M=(c[L+16>>2]|0)+(O<<3)|0;O=c[M+4>>2]|0;s=(c[k>>2]=c[M>>2]|0,+g[k>>2]);v=(c[k>>2]=O,+g[k>>2]);p=+g[K>>2]*(q+(f*s-e*v)-(o+(m*j-l*i)))+ +g[J>>2]*(n+(e*s+f*v)-(h+(l*j+m*i)));return+p}else if((r|0)==2){i=+g[a+92>>2];j=+g[a+96>>2];v=f*i-e*j;s=e*i+f*j;j=+g[a+84>>2];i=+g[a+88>>2];t=q+(f*j-e*i);q=n+(e*j+f*i);i=-0.0-s;f=m*(-0.0-v)+l*i;j=l*v+m*i;c[d>>2]=-1;r=a|0;a=c[r>>2]|0;J=c[a+16>>2]|0;K=c[a+20>>2]|0;do{if((K|0)>1){i=j*+g[J+4>>2]+f*+g[J>>2];a=1;O=0;while(1){e=f*+g[J+(a<<3)>>2]+j*+g[J+(a<<3)+4>>2];M=e>i;P=M?a:O;L=a+1|0;if((L|0)==(K|0)){break}else{i=M?e:i;a=L;O=P}}c[b>>2]=P;O=c[r>>2]|0;if((P|0)>-1){Q=P;R=O;H=741;break}else{U=P;V=O;H=742;break}}else{c[b>>2]=0;Q=0;R=c[r>>2]|0;H=741;break}}while(0);do{if((H|0)==741){if((c[R+20>>2]|0)>(Q|0)){W=Q;X=R;break}else{U=Q;V=R;H=742;break}}}while(0);if((H|0)==742){bc(5580,103,11416,4596);W=U;X=V}V=(c[X+16>>2]|0)+(W<<3)|0;W=c[V+4>>2]|0;j=(c[k>>2]=c[V>>2]|0,+g[k>>2]);f=(c[k>>2]=W,+g[k>>2]);p=v*(o+(m*j-l*f)-t)+s*(h+(l*j+m*f)-q);return+p}else{bc(4848,183,11332,9296);c[b>>2]=-1;c[d>>2]=-1;p=0.0;return+p}return 0.0}function cy(a,b,d,e){a=a|0;b=b|0;d=d|0;e=+e;var f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0.0,t=0.0,u=0.0,v=0,w=0,x=0,y=0.0,z=0;f=1.0-e;h=f*+g[a+16>>2]+ +g[a+24>>2]*e;i=f*+g[a+20>>2]+ +g[a+28>>2]*e;j=f*+g[a+32>>2]+ +g[a+36>>2]*e;l=+T(+j);m=+S(+j);j=+g[a+8>>2];n=+g[a+12>>2];o=h-(m*j-l*n);h=i-(l*j+m*n);n=f*+g[a+52>>2]+ +g[a+60>>2]*e;j=f*+g[a+56>>2]+ +g[a+64>>2]*e;i=f*+g[a+68>>2]+ +g[a+72>>2]*e;e=+T(+i);f=+S(+i);i=+g[a+44>>2];p=+g[a+48>>2];q=n-(f*i-e*p);n=j-(e*i+f*p);r=c[a+80>>2]|0;if((r|0)==1){p=+g[a+92>>2];i=+g[a+96>>2];j=m*p-l*i;s=l*p+m*i;i=+g[a+84>>2];p=+g[a+88>>2];t=o+(m*i-l*p);u=h+(l*i+m*p);v=c[a+4>>2]|0;do{if((d|0)>-1){if((c[v+20>>2]|0)>(d|0)){break}else{w=760;break}}else{w=760}}while(0);if((w|0)==760){bc(5580,103,11416,4596)}x=(c[v+16>>2]|0)+(d<<3)|0;v=c[x+4>>2]|0;p=(c[k>>2]=c[x>>2]|0,+g[k>>2]);i=(c[k>>2]=v,+g[k>>2]);y=j*(q+(f*p-e*i)-t)+s*(n+(e*p+f*i)-u);return+y}else if((r|0)==2){u=+g[a+92>>2];i=+g[a+96>>2];p=f*u-e*i;s=e*u+f*i;i=+g[a+84>>2];u=+g[a+88>>2];t=q+(f*i-e*u);j=n+(e*i+f*u);v=c[a>>2]|0;do{if((b|0)>-1){if((c[v+20>>2]|0)>(b|0)){break}else{w=764;break}}else{w=764}}while(0);if((w|0)==764){bc(5580,103,11416,4596)}x=(c[v+16>>2]|0)+(b<<3)|0;v=c[x+4>>2]|0;u=(c[k>>2]=c[x>>2]|0,+g[k>>2]);i=(c[k>>2]=v,+g[k>>2]);y=p*(o+(m*u-l*i)-t)+s*(h+(l*u+m*i)-j);return+y}else if((r|0)==0){r=a+92|0;v=a+96|0;x=c[a>>2]|0;do{if((b|0)>-1){if((c[x+20>>2]|0)>(b|0)){break}else{w=753;break}}else{w=753}}while(0);if((w|0)==753){bc(5580,103,11416,4596)}z=(c[x+16>>2]|0)+(b<<3)|0;b=c[z+4>>2]|0;j=(c[k>>2]=c[z>>2]|0,+g[k>>2]);i=(c[k>>2]=b,+g[k>>2]);b=c[a+4>>2]|0;do{if((d|0)>-1){if((c[b+20>>2]|0)>(d|0)){break}else{w=756;break}}else{w=756}}while(0);if((w|0)==756){bc(5580,103,11416,4596)}w=(c[b+16>>2]|0)+(d<<3)|0;d=c[w+4>>2]|0;u=(c[k>>2]=c[w>>2]|0,+g[k>>2]);s=(c[k>>2]=d,+g[k>>2]);y=+g[r>>2]*(q+(f*u-e*s)-(o+(m*j-l*i)))+ +g[v>>2]*(n+(e*u+f*s)-(h+(l*j+m*i)));return+y}else{bc(4848,242,11264,9296);y=0.0;return+y}return 0.0}function cz(a){a=a|0;var b=0;c[a>>2]=17236;b=a+12|0;pR(c[b>>2]|0);c[b>>2]=0;c[a+16>>2]=0;pT(a);return}function cA(a){a=a|0;var b=0;c[a>>2]=17236;b=a+12|0;pR(c[b>>2]|0);c[b>>2]=0;c[a+16>>2]=0;return}function cB(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0;e=c6(d,40)|0;if((e|0)==0){f=0}else{c[e>>2]=17236;c[e+4>>2]=3;g[e+8>>2]=.009999999776482582;c[e+12>>2]=0;c[e+16>>2]=0;a[e+36|0]=0;a[e+37|0]=0;f=e}e=c[b+12>>2]|0;d=c[b+16>>2]|0;h=f+12|0;do{if((c[h>>2]|0)==0){if((c[f+16>>2]|0)==0){break}else{i=778;break}}else{i=778}}while(0);if((i|0)==778){bc(4440,48,15708,8992)}if((d|0)<=1){bc(4440,49,15708,4896)}i=f+16|0;c[i>>2]=d;j=pQ(d<<3)|0;c[h>>2]=j;pY(j|0,e|0,c[i>>2]<<3);i=f+36|0;a[i]=0;e=f+37|0;a[e]=0;j=b+20|0;h=f+20|0;d=c[j+4>>2]|0;c[h>>2]=c[j>>2]|0;c[h+4>>2]=d;d=b+28|0;h=f+28|0;j=c[d+4>>2]|0;c[h>>2]=c[d>>2]|0;c[h+4>>2]=j;a[i]=a[b+36|0]&1;a[e]=a[b+37|0]&1;return f|0}function cC(a,b,c){a=a|0;b=b|0;c=c|0;return 0}function cD(a){a=a|0;return}function cE(a){a=a|0;return 1}function cF(a){a=a|0;return}function cG(a){a=a|0;return 1}function cH(a,b,c){a=a|0;b=b|0;c=c|0;return 0}function cI(a){a=a|0;return 1}function cJ(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=+g[b+12>>2];e=+g[a+12>>2];f=+g[b+8>>2];h=+g[a+16>>2];i=+g[c>>2]-(+g[b>>2]+(d*e-f*h));j=+g[c+4>>2]-(+g[b+4>>2]+(e*f+d*h));h=+g[a+8>>2];return i*i+j*j<=h*h|0}function cK(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0;e=+g[c+12>>2];f=+g[a+12>>2];h=+g[c+8>>2];i=+g[a+16>>2];j=+g[c>>2]+(e*f-h*i);k=+g[c+4>>2]+(f*h+e*i);c=a+8|0;i=+g[c>>2];g[b>>2]=j-i;g[b+4>>2]=k-i;i=+g[c>>2];g[b+8>>2]=j+i;g[b+12>>2]=k+i;return}function cL(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0.0,h=0.0,i=0,j=0,k=0,l=0,m=0.0;e=a+8|0;f=+g[e>>2];h=f*d*3.1415927410125732*f;g[b>>2]=h;i=a+12|0;j=i;k=b+4|0;l=c[j+4>>2]|0;c[k>>2]=c[j>>2]|0;c[k+4>>2]=l;f=+g[e>>2];d=+g[i>>2];m=+g[a+16>>2];g[b+12>>2]=h*(f*f*.5+(d*d+m*m));return}function cM(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0;f=+g[d+12>>2];h=+g[a+12>>2];i=+g[d+8>>2];j=+g[a+16>>2];l=+g[d>>2];m=l+(f*h-i*j);n=+g[d+4>>2];o=h*i+f*j+n;j=+g[a+20>>2];h=+g[a+24>>2];p=l+(f*j-i*h);l=n+(i*j+f*h);h=+g[a+8>>2];a=b;d=(g[k>>2]=(m<p?m:p)-h,c[k>>2]|0);e=(g[k>>2]=(o<l?o:l)-h,c[k>>2]|0)|0;c[a>>2]=0|d;c[a+4>>2]=e;e=b+8|0;b=(g[k>>2]=h+(m>p?m:p),c[k>>2]|0);a=(g[k>>2]=h+(o>l?o:l),c[k>>2]|0)|0;c[e>>2]=0|b;c[e+4>>2]=a;return}function cN(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0;g[b>>2]=0.0;d=(+g[a+16>>2]+ +g[a+24>>2])*.5;e=b+4|0;f=(g[k>>2]=(+g[a+12>>2]+ +g[a+20>>2])*.5,c[k>>2]|0);a=(g[k>>2]=d,c[k>>2]|0)|0;c[e>>2]=0|f;c[e+4>>2]=a;g[b+12>>2]=0.0;return}function cO(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0;do{if((e|0)>-1){if(((c[b+16>>2]|0)-1|0)>(e|0)){break}else{f=796;break}}else{f=796}}while(0);if((f|0)==796){bc(4440,89,12204,4204)}c[d+4>>2]=1;g[d+8>>2]=+g[b+8>>2];f=b+12|0;h=(c[f>>2]|0)+(e<<3)|0;i=d+12|0;j=c[h+4>>2]|0;c[i>>2]=c[h>>2]|0;c[i+4>>2]=j;j=(c[f>>2]|0)+(e+1<<3)|0;i=d+20|0;h=c[j+4>>2]|0;c[i>>2]=c[j>>2]|0;c[i+4>>2]=h;h=d+28|0;if((e|0)>0){i=(c[f>>2]|0)+(e-1<<3)|0;j=h;k=c[i+4>>2]|0;c[j>>2]=c[i>>2]|0;c[j+4>>2]=k;a[d+44|0]=1}else{k=b+20|0;j=h;h=c[k+4>>2]|0;c[j>>2]=c[k>>2]|0;c[j+4>>2]=h;a[d+44|0]=a[b+36|0]&1}h=d+36|0;if(((c[b+16>>2]|0)-2|0)>(e|0)){j=(c[f>>2]|0)+(e+2<<3)|0;e=h;f=c[j+4>>2]|0;c[e>>2]=c[j>>2]|0;c[e+4>>2]=f;a[d+45|0]=1;return}else{f=b+28|0;e=h;h=c[f+4>>2]|0;c[e>>2]=c[f>>2]|0;c[e+4>>2]=h;a[d+45|0]=a[b+37|0]&1;return}}function cP(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;i=i+48|0;j=h|0;k=a+16|0;l=c[k>>2]|0;if((l|0)>(f|0)){m=l}else{bc(4440,129,12092,3792);m=c[k>>2]|0}c[j>>2]=17436;c[j+4>>2]=1;g[j+8>>2]=.009999999776482582;pZ(j+28|0,0,18);k=f+1|0;l=c[a+12>>2]|0;a=l+(f<<3)|0;f=j+12|0;n=c[a+4>>2]|0;c[f>>2]=c[a>>2]|0;c[f+4>>2]=n;n=l+(((k|0)==(m|0)?0:k)<<3)|0;k=j+20|0;m=c[n+4>>2]|0;c[k>>2]=c[n>>2]|0;c[k+4>>2]=m;m=cW(j,b,d,e,0)|0;i=h;return m|0}function cQ(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0;f=a+16|0;h=c[f>>2]|0;if((h|0)>(e|0)){i=h}else{bc(4440,148,12264,3792);i=c[f>>2]|0}f=e+1|0;h=(f|0)==(i|0)?0:f;f=c[a+12>>2]|0;j=+g[d+12>>2];l=+g[f+(e<<3)>>2];m=+g[d+8>>2];n=+g[f+(e<<3)+4>>2];o=+g[d>>2];p=o+(j*l-m*n);q=+g[d+4>>2];r=l*m+j*n+q;n=+g[f+(h<<3)>>2];l=+g[f+(h<<3)+4>>2];s=o+(j*n-m*l);o=q+(m*n+j*l);h=b;f=(g[k>>2]=p<s?p:s,c[k>>2]|0);d=(g[k>>2]=r<o?r:o,c[k>>2]|0)|0;c[h>>2]=0|f;c[h+4>>2]=d;d=b+8|0;b=(g[k>>2]=p>s?p:s,c[k>>2]|0);h=(g[k>>2]=r>o?r:o,c[k>>2]|0)|0;c[d>>2]=0|b;c[d+4>>2]=h;return}function cR(a,b,c){a=a|0;b=b|0;c=+c;pZ(b|0,0,16);return}function cS(a,b){a=a|0;b=b|0;var d=0,e=0;d=c6(b,20)|0;if((d|0)==0){e=0}else{c[d>>2]=17088;pZ(d+4|0,0,16);e=d}c[e+4>>2]=c[a+4>>2]|0;g[e+8>>2]=+g[a+8>>2];d=a+12|0;a=e+12|0;b=c[d+4>>2]|0;c[a>>2]=c[d>>2]|0;c[a+4>>2]=b;return e|0}function cT(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0;h=+g[e+12>>2];i=+g[a+12>>2];j=+g[e+8>>2];l=+g[a+16>>2];m=+g[d>>2];n=m-(+g[e>>2]+(h*i-j*l));o=+g[d+4>>2];p=o-(+g[e+4>>2]+(i*j+h*l));l=+g[a+8>>2];h=+g[d+8>>2]-m;m=+g[d+12>>2]-o;o=n*h+p*m;j=h*h+m*m;i=o*o-(n*n+p*p-l*l)*j;if(i<0.0|j<1.1920928955078125e-7){q=0;return q|0}l=o+ +Q(+i);i=-0.0-l;if(l>-0.0){q=0;return q|0}if(j*+g[d+16>>2]<i){q=0;return q|0}l=i/j;g[b+8>>2]=l;j=n+h*l;h=p+m*l;d=b;a=(g[k>>2]=j,c[k>>2]|0);e=(g[k>>2]=h,c[k>>2]|0)|0;c[d>>2]=0|a;c[d+4>>2]=e;l=+Q(+(j*j+h*h));if(l<1.1920928955078125e-7){q=1;return q|0}m=1.0/l;g[b>>2]=j*m;g[b+4>>2]=h*m;q=1;return q|0}function cU(a){a=a|0;pT(a);return}function cV(b,d){b=b|0;d=d|0;var e=0,f=0,h=0;e=c6(d,48)|0;if((e|0)==0){f=0}else{c[e>>2]=17436;c[e+4>>2]=1;g[e+8>>2]=.009999999776482582;pZ(e+28|0,0,18);f=e}c[f+4>>2]=c[b+4>>2]|0;g[f+8>>2]=+g[b+8>>2];e=b+12|0;d=f+12|0;h=c[e+4>>2]|0;c[d>>2]=c[e>>2]|0;c[d+4>>2]=h;h=b+20|0;d=f+20|0;e=c[h+4>>2]|0;c[d>>2]=c[h>>2]|0;c[d+4>>2]=e;e=b+28|0;d=f+28|0;h=c[e+4>>2]|0;c[d>>2]=c[e>>2]|0;c[d+4>>2]=h;h=b+36|0;d=f+36|0;e=c[h+4>>2]|0;c[d>>2]=c[h>>2]|0;c[d+4>>2]=e;a[f+44|0]=a[b+44|0]&1;a[f+45|0]=a[b+45|0]&1;return f|0}function cW(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0;h=+g[e>>2];i=+g[d>>2]-h;j=+g[e+4>>2];l=+g[d+4>>2]-j;m=+g[e+12>>2];n=+g[e+8>>2];o=i*m+l*n;p=-0.0-n;q=m*l+i*p;i=+g[d+8>>2]-h;h=+g[d+12>>2]-j;j=m*i+n*h-o;n=i*p+m*h-q;e=a+12|0;f=c[e+4>>2]|0;h=(c[k>>2]=c[e>>2]|0,+g[k>>2]);m=(c[k>>2]=f,+g[k>>2]);f=a+20|0;a=c[f+4>>2]|0;p=(c[k>>2]=c[f>>2]|0,+g[k>>2]);i=p-h;p=(c[k>>2]=a,+g[k>>2])-m;l=-0.0-i;r=i*i+p*p;s=+Q(+r);if(s<1.1920928955078125e-7){t=p;u=l}else{v=1.0/s;t=p*v;u=v*l}l=(m-q)*u+(h-o)*t;v=n*u+j*t;if(v==0.0){w=0;return w|0}s=l/v;if(s<0.0){w=0;return w|0}if(+g[d+16>>2]<s|r==0.0){w=0;return w|0}v=(i*(o+j*s-h)+p*(q+n*s-m))/r;if(v<0.0|v>1.0){w=0;return w|0}g[b+8>>2]=s;if(l>0.0){d=b;a=(g[k>>2]=-0.0-t,c[k>>2]|0);f=(g[k>>2]=-0.0-u,c[k>>2]|0)|0;c[d>>2]=0|a;c[d+4>>2]=f;w=1;return w|0}else{f=b;b=(g[k>>2]=t,c[k>>2]|0);d=(g[k>>2]=u,c[k>>2]|0)|0;c[f>>2]=0|b;c[f+4>>2]=d;w=1;return w|0}return 0}function cX(a){a=a|0;pT(a);return}function cY(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=c6(b,152)|0;if((d|0)==0){e=0}else{c[d>>2]=16992;c[d+4>>2]=2;g[d+8>>2]=.009999999776482582;c[d+148>>2]=0;g[d+12>>2]=0.0;g[d+16>>2]=0.0;e=d}c[e+4>>2]=c[a+4>>2]|0;g[e+8>>2]=+g[a+8>>2];d=a+12|0;b=e+12|0;f=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=f;pY(e+20|0,a+20|0,64);pY(e+84|0,a+84|0,64);c[e+148>>2]=c[a+148>>2]|0;return e|0}function cZ(a,b,d,e,f){a=a|0;b=+b;d=+d;e=e|0;f=+f;var h=0,i=0.0,j=0.0,l=0,m=0,n=0.0,o=0.0,p=0;h=a+148|0;c[h>>2]=4;i=-0.0-b;j=-0.0-d;g[a+20>>2]=i;g[a+24>>2]=j;g[a+28>>2]=b;g[a+32>>2]=j;g[a+36>>2]=b;g[a+40>>2]=d;g[a+44>>2]=i;g[a+48>>2]=d;g[a+84>>2]=0.0;g[a+88>>2]=-1.0;g[a+92>>2]=1.0;g[a+96>>2]=0.0;g[a+100>>2]=0.0;g[a+104>>2]=1.0;g[a+108>>2]=-1.0;g[a+112>>2]=0.0;l=e;e=a+12|0;m=c[l+4>>2]|0;c[e>>2]=c[l>>2]|0;c[e+4>>2]=m;m=c[l+4>>2]|0;d=(c[k>>2]=c[l>>2]|0,+g[k>>2]);i=(c[k>>2]=m,+g[k>>2]);b=+T(+f);n=+S(+f);m=0;f=j;j=-1.0;while(1){l=a+20+(m<<3)|0;o=+g[l>>2];e=l;l=(g[k>>2]=d+(n*o-b*f),c[k>>2]|0);p=(g[k>>2]=i+(b*o+n*f),c[k>>2]|0)|0;c[e>>2]=0|l;c[e+4>>2]=p;p=a+84+(m<<3)|0;o=+g[p>>2];e=p;p=(g[k>>2]=n*o-b*j,c[k>>2]|0);l=(g[k>>2]=b*o+n*j,c[k>>2]|0)|0;c[e>>2]=0|p;c[e+4>>2]=l;l=m+1|0;if((l|0)>=(c[h>>2]|0)){break}m=l;f=+g[a+20+(l<<3)+4>>2];j=+g[a+84+(l<<3)+4>>2]}return}function c_(a){a=a|0;return}function c$(a,b,d){a=a|0;b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0,m=0;e=+g[d>>2]- +g[b>>2];f=+g[d+4>>2]- +g[b+4>>2];h=+g[b+12>>2];i=+g[b+8>>2];j=e*h+f*i;k=h*f+e*(-0.0-i);b=c[a+148>>2]|0;d=0;while(1){if((d|0)>=(b|0)){l=1;m=860;break}if((j- +g[a+20+(d<<3)>>2])*+g[a+84+(d<<3)>>2]+(k- +g[a+20+(d<<3)+4>>2])*+g[a+84+(d<<3)+4>>2]>0.0){l=0;m=861;break}else{d=d+1|0}}if((m|0)==860){return l|0}else if((m|0)==861){return l|0}return 0}function c0(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0.0,y=0.0,z=0.0,A=0.0;f=+g[d+12>>2];h=+g[a+20>>2];i=+g[d+8>>2];j=+g[a+24>>2];l=+g[d>>2];m=l+(f*h-i*j);n=+g[d+4>>2];o=h*i+f*j+n;d=c[a+148>>2]|0;L1182:do{if((d|0)>1){j=o;h=m;p=o;q=m;e=1;while(1){r=+g[a+20+(e<<3)>>2];s=+g[a+20+(e<<3)+4>>2];t=l+(f*r-i*s);u=r*i+f*s+n;s=h<t?h:t;r=j<u?j:u;v=q>t?q:t;t=p>u?p:u;w=e+1|0;if((w|0)<(d|0)){j=r;h=s;p=t;q=v;e=w}else{x=r;y=s;z=t;A=v;break L1182}}}else{x=o;y=m;z=o;A=m}}while(0);m=+g[a+8>>2];a=b;d=(g[k>>2]=y-m,c[k>>2]|0);e=(g[k>>2]=x-m,c[k>>2]|0)|0;c[a>>2]=0|d;c[a+4>>2]=e;e=b+8|0;b=(g[k>>2]=A+m,c[k>>2]|0);a=(g[k>>2]=z+m,c[k>>2]|0)|0;c[e>>2]=0|b;c[e+4>>2]=a;return}function c1(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;d=+g[b+16>>2];e=+g[b+32>>2];f=+g[b+20>>2];h=+g[b+28>>2];i=d*e-f*h;j=+g[b+24>>2];k=+g[b+12>>2];l=f*j-e*k;m=h*k-d*j;n=+g[b>>2];o=+g[b+4>>2];p=+g[b+8>>2];q=i*n+o*l+m*p;if(q!=0.0){r=1.0/q}else{r=q}q=+g[c>>2];s=+g[c+4>>2];t=+g[c+8>>2];g[a>>2]=r*(i*q+s*l+m*t);g[a+4>>2]=r*((s*e-t*h)*n+o*(t*j-e*q)+(h*q-s*j)*p);g[a+8>>2]=r*((d*t-f*s)*n+o*(f*q-t*k)+(s*k-d*q)*p);return}function c2(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0,r=0,s=0.0,t=0.0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0.0,C=0.0,D=0.0,E=0,F=0.0,G=0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,R=0.0,S=0,T=0.0,U=0.0,V=0.0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;do{if((d-3|0)>>>0<6){e=a+148|0;c[e>>2]=d;f=e;h=871;break}else{bc(3932,122,15216,8848);e=a+148|0;c[e>>2]=d;if((d|0)>0){f=e;h=871;break}else{i=d;h=879;break}}}while(0);do{if((h|0)==871){d=0;while(1){e=b+(d<<3)|0;j=a+20+(d<<3)|0;l=c[e+4>>2]|0;c[j>>2]=c[e>>2]|0;c[j+4>>2]=l;l=d+1|0;m=c[f>>2]|0;if((l|0)<(m|0)){d=l}else{break}}if((m|0)>0){n=m;o=0}else{i=m;h=879;break}while(1){d=o+1|0;l=(d|0)<(n|0)?d:0;p=+g[a+20+(l<<3)>>2]- +g[a+20+(o<<3)>>2];q=+g[a+20+(l<<3)+4>>2]- +g[a+20+(o<<3)+4>>2];if(p*p+q*q<=1.4210854715202004e-14){bc(3932,137,15216,6452)}l=a+84+(o<<3)|0;j=l;e=(g[k>>2]=q,c[k>>2]|0);r=(g[k>>2]=p*-1.0,c[k>>2]|0)|0;c[j>>2]=0|e;c[j+4>>2]=r;r=a+84+(o<<3)+4|0;p=+g[r>>2];s=+Q(+(q*q+p*p));if(s>=1.1920928955078125e-7){t=1.0/s;g[l>>2]=q*t;g[r>>2]=p*t}u=c[f>>2]|0;if((d|0)<(u|0)){n=u;o=d}else{break}}d=a+12|0;r=a+20|0;if((u|0)>2){v=u;w=d;x=r;h=882;break}else{y=u;z=d;A=r;h=881;break}}}while(0);do{if((h|0)==879){y=i;z=a+12|0;A=a+20|0;h=881;break}}while(0);do{if((h|0)==881){bc(3932,76,16136,3324);if((y|0)>0){v=y;w=z;x=A;h=882;break}else{B=0.0;C=0.0;D=0.0;E=z;break}}}while(0);do{if((h|0)==882){z=0;t=0.0;p=0.0;q=0.0;while(1){A=a+20+(z<<3)|0;y=c[A+4>>2]|0;s=(c[k>>2]=c[A>>2]|0,+g[k>>2]);F=(c[k>>2]=y,+g[k>>2]);y=z+1|0;if((y|0)<(v|0)){G=a+20+(y<<3)|0}else{G=x}A=G;i=c[A+4>>2]|0;H=(c[k>>2]=c[A>>2]|0,+g[k>>2]);I=(c[k>>2]=i,+g[k>>2]);J=(s*I-F*H)*.5;K=t+J;L=J*.3333333432674408;M=p+(s+0.0+H)*L;N=q+(F+0.0+I)*L;if((y|0)==(v|0)){break}else{z=y;t=K;p=M;q=N}}if(K>1.1920928955078125e-7){O=N;P=M;R=K;S=w}else{B=N;C=M;D=K;E=w;break}T=1.0/R;U=P*T;V=O*T;W=S;X=(g[k>>2]=U,c[k>>2]|0);Y=(g[k>>2]=V,c[k>>2]|0);Z=Y;_=0;$=0;aa=Z;ab=X;ac=0;ad=$|ab;ae=aa|ac;af=W|0;c[af>>2]=ad;ag=W+4|0;c[ag>>2]=ae;return}}while(0);bc(3932,115,16136,3768);O=B;P=C;R=D;S=E;T=1.0/R;U=P*T;V=O*T;W=S;X=(g[k>>2]=U,c[k>>2]|0);Y=(g[k>>2]=V,c[k>>2]|0);Z=Y;_=0;$=0;aa=Z;ab=X;ac=0;ad=$|ab;ae=aa|ac;af=W|0;c[af>>2]=ad;ag=W+4|0;c[ag>>2]=ae;return}function c3(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0,u=0.0,v=0.0,w=0,x=0.0,y=0,z=0.0;h=+g[e>>2];i=+g[d>>2]-h;j=+g[e+4>>2];l=+g[d+4>>2]-j;f=e+12|0;m=+g[f>>2];n=e+8|0;o=+g[n>>2];p=i*m+l*o;q=-0.0-o;r=m*l+i*q;i=+g[d+8>>2]-h;h=+g[d+12>>2]-j;j=m*i+o*h-p;o=i*q+m*h-r;h=+g[d+16>>2];d=c[a+148>>2]|0;m=0.0;e=0;s=-1;q=h;L1224:while(1){if((e|0)>=(d|0)){t=902;break}i=+g[a+84+(e<<3)>>2];l=+g[a+84+(e<<3)+4>>2];u=(+g[a+20+(e<<3)>>2]-p)*i+(+g[a+20+(e<<3)+4>>2]-r)*l;v=j*i+o*l;L1227:do{if(v==0.0){if(u<0.0){w=0;t=907;break L1224}else{x=m;y=s;z=q}}else{do{if(v<0.0){if(u>=m*v){break}x=u/v;y=e;z=q;break L1227}}while(0);if(v<=0.0){x=m;y=s;z=q;break}if(u>=q*v){x=m;y=s;z=q;break}x=m;y=s;z=u/v}}while(0);if(z<x){w=0;t=908;break}else{m=x;e=e+1|0;s=y;q=z}}if((t|0)==907){return w|0}else if((t|0)==908){return w|0}else if((t|0)==902){if(m<0.0|m>h){bc(3932,249,11472,4748)}if((s|0)<=-1){w=0;return w|0}g[b+8>>2]=m;m=+g[f>>2];h=+g[a+84+(s<<3)>>2];z=+g[n>>2];q=+g[a+84+(s<<3)+4>>2];s=b;b=(g[k>>2]=m*h-z*q,c[k>>2]|0);a=(g[k>>2]=h*z+m*q,c[k>>2]|0)|0;c[s>>2]=0|b;c[s+4>>2]=a;w=1;return w|0}return 0}function c4(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0,E=0,F=0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0;e=a+148|0;f=c[e>>2]|0;do{if((f|0)>2){h=f;i=914}else{bc(3932,306,11588,4184);j=c[e>>2]|0;if((j|0)>0){h=j;i=914;break}l=1.0/+(j|0);j=b|0;g[j>>2]=d*0.0;m=l*0.0;n=l*0.0;o=0.0;p=0.0;q=0.0;r=0.0;s=j;i=921;break}}while(0);do{if((i|0)==914){l=0.0;t=0.0;e=0;while(1){u=t+ +g[a+20+(e<<3)>>2];v=l+ +g[a+20+(e<<3)+4>>2];f=e+1|0;if((f|0)<(h|0)){l=v;t=u;e=f}else{break}}t=1.0/+(h|0);l=u*t;w=v*t;e=a+20|0;f=a+24|0;t=0.0;x=0.0;j=0;y=0.0;z=0.0;while(1){A=+g[a+20+(j<<3)>>2]-l;B=+g[a+20+(j<<3)+4>>2]-w;C=j+1|0;D=(C|0)<(h|0);if(D){E=a+20+(C<<3)|0;F=a+20+(C<<3)+4|0}else{E=e;F=f}G=+g[E>>2]-l;H=+g[F>>2]-w;I=A*H-B*G;J=I*.5;K=z+J;L=J*.3333333432674408;M=x+(A+G)*L;N=t+(B+H)*L;O=y+I*.0833333358168602*(G*G+(A*A+A*G)+(H*H+(B*B+B*H)));if(D){t=N;x=M;j=C;y=O;z=K}else{break}}z=K*d;j=b|0;g[j>>2]=z;if(K>1.1920928955078125e-7){P=z;Q=w;R=l;S=K;T=O;U=M;V=N;break}else{m=w;n=l;o=K;p=O;q=M;r=N;s=j;i=921;break}}}while(0);if((i|0)==921){bc(3932,352,11588,3768);P=+g[s>>2];Q=m;R=n;S=o;T=p;U=q;V=r}r=1.0/S;S=U*r;U=V*r;r=R+S;R=Q+U;s=b+4|0;i=(g[k>>2]=r,c[k>>2]|0);F=(g[k>>2]=R,c[k>>2]|0)|0;c[s>>2]=0|i;c[s+4>>2]=F;g[b+12>>2]=T*d+P*(r*r+R*R-(S*S+U*U));return}function c5(a){a=a|0;pT(a);return}function c6(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;if((d|0)==0){e=0;return e|0}do{if((d|0)>0){if((d|0)<=640){break}e=pQ(d)|0;return e|0}else{bc(3640,104,14856,6328)}}while(0);f=a[d+18664|0]|0;d=f&255;if((f&255)>=14){bc(3640,112,14856,4712)}f=b+12+(d<<2)|0;g=c[f>>2]|0;if((g|0)!=0){c[f>>2]=c[g>>2]|0;e=g;return e|0}g=b+4|0;h=c[g>>2]|0;i=b+8|0;j=b|0;if((h|0)==(c[i>>2]|0)){b=c[j>>2]|0;k=h+128|0;c[i>>2]=k;i=pQ(k<<3)|0;c[j>>2]=i;k=b;pY(i|0,k|0,c[g>>2]<<3);pZ((c[j>>2]|0)+(c[g>>2]<<3)|0,0,1024);pR(k);l=c[g>>2]|0}else{l=h}h=c[j>>2]|0;j=pQ(16384)|0;k=h+(l<<3)+4|0;c[k>>2]=j;i=c[19308+(d<<2)>>2]|0;c[h+(l<<3)>>2]=i;l=16384/(i|0)&-1;if((aa(l,i)|0)<16385){m=j}else{bc(3640,140,14856,4144);m=c[k>>2]|0}j=l-1|0;l=m;L1290:do{if((j|0)>0){m=0;h=l;while(1){d=h+aa(m,i)|0;b=m+1|0;c[d>>2]=h+aa(b,i)|0;d=c[k>>2]|0;if((b|0)==(j|0)){n=d;break L1290}else{m=b;h=d}}}else{n=l}}while(0);c[n+aa(j,i)>>2]=0;c[f>>2]=c[c[k>>2]>>2]|0;c[g>>2]=(c[g>>2]|0)+1|0;e=c[k>>2]|0;return e|0}function c7(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;i=i+4|0;e=d|0;c[e>>2]=b;aT(a|0,c[e>>2]|0);i=d;return}function c8(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b+102796|0;f=c[e>>2]|0;if((f|0)>0){g=f}else{bc(3152,63,14588,4124);g=c[e>>2]|0}f=g-1|0;if((c[b+102412+(f*12&-1)>>2]|0)!=(d|0)){bc(3152,65,14588,3748)}if((a[b+102412+(f*12&-1)+8|0]&1)<<24>>24==0){g=b+102412+(f*12&-1)+4|0;h=b+102400|0;c[h>>2]=(c[h>>2]|0)-(c[g>>2]|0)|0;i=g}else{pR(d);i=b+102412+(f*12&-1)+4|0}f=b+102404|0;c[f>>2]=(c[f>>2]|0)-(c[i>>2]|0)|0;c[e>>2]=(c[e>>2]|0)-1|0;return}function c9(d,e,f){d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0,m=0,n=0,o=0,p=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;h=d+12|0;i=d+64|0;j=e+4|0;k=+g[j>>2];do{if(k==k&!(D=0.0,D!=D)&k>+-q&k<+q){l=+g[e+8>>2];if(l==l&!(D=0.0,D!=D)&l>+-q&l<+q){break}else{m=956;break}}else{m=956}}while(0);if((m|0)==956){bc(3036,27,13460,8372)}n=e+16|0;k=+g[n>>2];do{if(k==k&!(D=0.0,D!=D)&k>+-q&k<+q){l=+g[e+20>>2];if(l==l&!(D=0.0,D!=D)&l>+-q&l<+q){break}else{m=959;break}}else{m=959}}while(0);if((m|0)==959){bc(3036,28,13460,5896)}m=e+12|0;k=+g[m>>2];if(!(k==k&!(D=0.0,D!=D)&k>+-q&k<+q)){bc(3036,29,13460,4652)}o=e+24|0;k=+g[o>>2];if(!(k==k&!(D=0.0,D!=D)&k>+-q&k<+q)){bc(3036,30,13460,4092)}p=e+32|0;k=+g[p>>2];if(k<0.0|k==k&!(D=0.0,D!=D)&k>+-q&k<+q^1){bc(3036,31,13460,3688)}r=e+28|0;k=+g[r>>2];if(k<0.0|k==k&!(D=0.0,D!=D)&k>+-q&k<+q^1){bc(3036,32,13460,3264)}s=d+4|0;b[s>>1]=0;if((a[e+39|0]&1)<<24>>24==0){t=0}else{b[s>>1]=8;t=8}if((a[e+38|0]&1)<<24>>24==0){u=t}else{v=t|16;b[s>>1]=v;u=v}if((a[e+36|0]&1)<<24>>24==0){w=u}else{v=u|4;b[s>>1]=v;w=v}if((a[e+37|0]&1)<<24>>24==0){x=w}else{v=w|2;b[s>>1]=v;x=v}if((a[e+40|0]&1)<<24>>24!=0){b[s>>1]=x|32}c[d+88>>2]=f;f=j;j=h;h=c[f>>2]|0;x=c[f+4>>2]|0;c[j>>2]=h;c[j+4>>2]=x;k=+g[m>>2];g[d+20>>2]=+T(+k);g[d+24>>2]=+S(+k);g[d+28>>2]=0.0;g[d+32>>2]=0.0;j=d+36|0;c[j>>2]=h;c[j+4>>2]=x;j=d+44|0;c[j>>2]=h;c[j+4>>2]=x;g[d+52>>2]=+g[m>>2];g[d+56>>2]=+g[m>>2];g[d+60>>2]=0.0;c[d+108>>2]=0;c[d+112>>2]=0;c[d+92>>2]=0;c[d+96>>2]=0;m=n;n=i;i=c[m+4>>2]|0;c[n>>2]=c[m>>2]|0;c[n+4>>2]=i;g[d+72>>2]=+g[o>>2];g[d+132>>2]=+g[r>>2];g[d+136>>2]=+g[p>>2];g[d+140>>2]=+g[e+48>>2];g[d+76>>2]=0.0;g[d+80>>2]=0.0;g[d+84>>2]=0.0;g[d+144>>2]=0.0;p=c[e>>2]|0;c[d>>2]=p;r=d+116|0;if((p|0)==2){g[r>>2]=1.0;g[d+120>>2]=1.0;p=d+124|0;g[p>>2]=0.0;o=d+128|0;g[o>>2]=0.0;i=e+44|0;n=c[i>>2]|0;m=d+148|0;c[m>>2]=n;x=d+100|0;c[x>>2]=0;j=d+104|0;c[j>>2]=0;return}else{g[r>>2]=0.0;g[d+120>>2]=0.0;p=d+124|0;g[p>>2]=0.0;o=d+128|0;g[o>>2]=0.0;i=e+44|0;n=c[i>>2]|0;m=d+148|0;c[m>>2]=n;x=d+100|0;c[x>>2]=0;j=d+104|0;c[j>>2]=0;return}}function da(a,d){a=a|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0;e=i;i=i+16|0;f=e|0;h=a+88|0;j=c[(c[h>>2]|0)+102868>>2]|0;if((j&2|0)==0){l=j}else{bc(3036,115,13540,3004);l=c[(c[h>>2]|0)+102868>>2]|0}if((l&2|0)!=0){i=e;return}l=a|0;if((c[l>>2]|0)==(d|0)){i=e;return}c[l>>2]=d;db(a);L1360:do{if((c[l>>2]|0)==0){g[a+64>>2]=0.0;g[a+68>>2]=0.0;g[a+72>>2]=0.0;m=+g[a+56>>2];g[a+52>>2]=m;d=a+44|0;j=a+36|0;n=c[d>>2]|0;o=c[d+4>>2]|0;c[j>>2]=n;c[j+4>>2]=o;p=+T(+m);g[f+8>>2]=p;q=+S(+m);g[f+12>>2]=q;m=+g[a+28>>2];r=+g[a+32>>2];s=(c[k>>2]=n,+g[k>>2])-(q*m-p*r);t=(c[k>>2]=o,+g[k>>2])-(p*m+q*r);o=f;n=(g[k>>2]=s,c[k>>2]|0);j=(g[k>>2]=t,c[k>>2]|0)|0;c[o>>2]=0|n;c[o+4>>2]=j;j=(c[h>>2]|0)+102872|0;o=c[a+100>>2]|0;if((o|0)==0){break}n=a+12|0;d=o;while(1){dA(d,j,f,n);o=c[d+4>>2]|0;if((o|0)==0){break L1360}else{d=o}}}}while(0);f=a+4|0;h=b[f>>1]|0;if((h&2)<<16>>16==0){b[f>>1]=h|2;g[a+144>>2]=0.0}g[a+76>>2]=0.0;g[a+80>>2]=0.0;g[a+84>>2]=0.0;h=c[a+100>>2]|0;if((h|0)==0){i=e;return}else{u=h}while(1){dB(u);h=c[u+4>>2]|0;if((h|0)==0){break}else{u=h}}i=e;return}function db(a){a=a|0;var d=0,e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0,J=0.0,K=0.0;d=i;i=i+16|0;e=d|0;f=a+116|0;h=a+120|0;j=a+124|0;l=a+128|0;m=a+28|0;g[m>>2]=0.0;g[a+32>>2]=0.0;pZ(f|0,0,16);n=c[a>>2]|0;if((n|0)==0|(n|0)==1){o=a+12|0;p=a+36|0;q=c[o>>2]|0;r=c[o+4>>2]|0;c[p>>2]=q;c[p+4>>2]=r;p=a+44|0;c[p>>2]=q;c[p+4>>2]=r;g[a+52>>2]=+g[a+56>>2];i=d;return}else if((n|0)!=2){bc(3036,284,13620,9976)}n=2552;r=c[n+4>>2]|0;s=(c[k>>2]=c[n>>2]|0,+g[k>>2]);t=(c[k>>2]=r,+g[k>>2]);r=c[a+100>>2]|0;L1380:do{if((r|0)==0){u=t;v=s}else{n=e|0;p=e+4|0;q=e+8|0;o=e+12|0;w=t;x=s;y=r;while(1){z=+g[y>>2];if(z==0.0){A=x;B=w}else{C=c[y+12>>2]|0;bQ[c[(c[C>>2]|0)+28>>2]&2047](C,e,z);z=+g[n>>2];g[f>>2]=z+ +g[f>>2];D=x+z*+g[p>>2];E=w+z*+g[q>>2];g[j>>2]=+g[o>>2]+ +g[j>>2];A=D;B=E}C=c[y+4>>2]|0;if((C|0)==0){u=B;v=A;break L1380}else{w=B;x=A;y=C}}}}while(0);A=+g[f>>2];if(A>0.0){B=1.0/A;g[h>>2]=B;F=v*B;G=u*B;H=A}else{g[f>>2]=1.0;g[h>>2]=1.0;F=v;G=u;H=1.0}u=+g[j>>2];do{if(u>0.0){if((b[a+4>>1]&16)<<16>>16!=0){I=1017;break}v=u-(G*G+F*F)*H;g[j>>2]=v;if(v>0.0){J=v}else{bc(3036,319,13620,9448);J=+g[j>>2]}K=1.0/J;break}else{I=1017}}while(0);if((I|0)==1017){g[j>>2]=0.0;K=0.0}g[l>>2]=K;l=a+44|0;j=c[l+4>>2]|0;K=(c[k>>2]=c[l>>2]|0,+g[k>>2]);J=(c[k>>2]=j,+g[k>>2]);j=m;m=(g[k>>2]=F,c[k>>2]|0);I=(g[k>>2]=G,c[k>>2]|0)|0;c[j>>2]=0|m;c[j+4>>2]=I;H=+g[a+24>>2];u=+g[a+20>>2];v=+g[a+12>>2]+(H*F-u*G);A=F*u+H*G+ +g[a+16>>2];I=(g[k>>2]=v,c[k>>2]|0);j=0|I;I=(g[k>>2]=A,c[k>>2]|0)|0;c[l>>2]=j;c[l+4>>2]=I;l=a+36|0;c[l>>2]=j;c[l+4>>2]=I;G=+g[a+72>>2];I=a+64|0;g[I>>2]=+g[I>>2]+(A-J)*(-0.0-G);I=a+68|0;g[I>>2]=G*(v-K)+ +g[I>>2];i=d;return}function dc(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;f=d+88|0;h=c[f>>2]|0;i=c[h+102868>>2]|0;if((i&2|0)==0){j=h;k=i}else{bc(3036,153,13652,3004);i=c[f>>2]|0;j=i;k=c[i+102868>>2]|0}if((k&2|0)!=0){l=0;return l|0}k=j|0;j=c6(k,44)|0;if((j|0)==0){m=0}else{b[j+32>>1]=1;b[j+34>>1]=-1;b[j+36>>1]=0;c[j+40>>2]=0;c[j+24>>2]=0;c[j+28>>2]=0;pZ(j|0,0,16);m=j}c[m+40>>2]=c[e+4>>2]|0;g[m+16>>2]=+g[e+8>>2];g[m+20>>2]=+g[e+12>>2];j=m+8|0;c[j>>2]=d;i=m+4|0;c[i>>2]=0;h=m+32|0;n=e+22|0;b[h>>1]=b[n>>1]|0;b[h+2>>1]=b[n+2>>1]|0;b[h+4>>1]=b[n+4>>1]|0;a[m+38|0]=a[e+20|0]&1;n=c[e>>2]|0;h=bI[c[(c[n>>2]|0)+8>>2]&2047](n,k)|0;n=m+12|0;c[n>>2]=h;o=bu[c[(c[h>>2]|0)+12>>2]&2047](h)|0;h=c6(k,o*28&-1)|0;k=m+24|0;c[k>>2]=h;L1412:do{if((o|0)>0){c[h+16>>2]=0;c[(c[k>>2]|0)+24>>2]=-1;if((o|0)==1){break}else{p=1}while(1){c[(c[k>>2]|0)+(p*28&-1)+16>>2]=0;c[(c[k>>2]|0)+(p*28&-1)+24>>2]=-1;q=p+1|0;if((q|0)==(o|0)){break L1412}else{p=q}}}}while(0);p=m+28|0;c[p>>2]=0;o=m|0;g[o>>2]=+g[e+16>>2];L1417:do{if((b[d+4>>1]&32)<<16>>16!=0){e=(c[f>>2]|0)+102872|0;h=d+12|0;q=c[n>>2]|0;r=bu[c[(c[q>>2]|0)+12>>2]&2047](q)|0;c[p>>2]=r;if((r|0)>0){s=0}else{break}while(1){r=c[k>>2]|0;q=r+(s*28&-1)|0;t=c[n>>2]|0;u=q|0;bR[c[(c[t>>2]|0)+24>>2]&2047](t,u,h,s);c[r+(s*28&-1)+24>>2]=b5(e,u,q)|0;c[r+(s*28&-1)+16>>2]=m;c[r+(s*28&-1)+20>>2]=s;r=s+1|0;if((r|0)<(c[p>>2]|0)){s=r}else{break L1417}}}}while(0);s=d+100|0;c[i>>2]=c[s>>2]|0;c[s>>2]=m;s=d+104|0;c[s>>2]=(c[s>>2]|0)+1|0;c[j>>2]=d;if(+g[o>>2]>0.0){db(d)}d=(c[f>>2]|0)+102868|0;c[d>>2]=c[d>>2]|1;l=m;return l|0}function dd(a){a=a|0;return}function de(a){a=a|0;return}function df(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;f=d+88|0;g=c[(c[f>>2]|0)+102868>>2]|0;if((g&2|0)==0){h=g}else{bc(3036,201,13576,3004);h=c[(c[f>>2]|0)+102868>>2]|0}if((h&2|0)!=0){return}h=e+8|0;if((c[h>>2]|0)!=(d|0)){bc(3036,207,13576,2804)}g=d+104|0;if((c[g>>2]|0)<=0){bc(3036,210,13576,2560)}i=d+100|0;while(1){j=c[i>>2]|0;if((j|0)==0){k=1052;break}if((j|0)==(e|0)){k=1051;break}else{i=j+4|0}}if((k|0)==1052){bc(3036,226,13576,10344)}else if((k|0)==1051){c[i>>2]=c[e+4>>2]|0}i=c[d+112>>2]|0;L1448:do{if((i|0)!=0){j=i;while(1){l=c[j+4>>2]|0;m=c[j+12>>2]|0;if((c[l+48>>2]|0)==(e|0)|(c[l+52>>2]|0)==(e|0)){dk((c[f>>2]|0)+102872|0,l)}if((m|0)==0){break L1448}else{j=m}}}}while(0);i=c[f>>2]|0;f=i|0;if((b[d+4>>1]&32)<<16>>16!=0){j=e+28|0;L1457:do{if((c[j>>2]|0)>0){m=e+24|0;l=i+102912|0;n=i+102904|0;o=i+102900|0;p=i+102872|0;q=0;while(1){r=(c[m>>2]|0)+(q*28&-1)+24|0;s=c[r>>2]|0;t=c[l>>2]|0;u=0;while(1){if((u|0)>=(t|0)){break}v=(c[n>>2]|0)+(u<<2)|0;if((c[v>>2]|0)==(s|0)){k=1063;break}else{u=u+1|0}}if((k|0)==1063){k=0;c[v>>2]=-1}c[o>>2]=(c[o>>2]|0)-1|0;cl(p,s);c[r>>2]=-1;u=q+1|0;if((u|0)<(c[j>>2]|0)){q=u}else{break L1457}}}}while(0);c[j>>2]=0}dz(e,f);c[h>>2]=0;c[e+4>>2]=0;h=a[18708]|0;if((h&255)>=14){bc(3640,173,14896,4712)}f=i+12+((h&255)<<2)|0;c[e>>2]=c[f>>2]|0;c[f>>2]=e;c[g>>2]=(c[g>>2]|0)-1|0;db(d);return}function dg(a,d){a=a|0;d=d|0;var e=0,f=0,h=0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0,q=0.0,r=0.0;e=a+88|0;f=c[(c[e>>2]|0)+102868>>2]|0;if((f&2|0)==0){h=f}else{bc(3036,340,13760,3004);h=c[(c[e>>2]|0)+102868>>2]|0}if((h&2|0)!=0){return}if((c[a>>2]|0)!=2){return}h=a+120|0;g[h>>2]=0.0;e=a+124|0;g[e>>2]=0.0;f=a+128|0;g[f>>2]=0.0;i=+g[d>>2];j=i>0.0?i:1.0;g[a+116>>2]=j;g[h>>2]=1.0/j;i=+g[d+12>>2];do{if(i>0.0){if((b[a+4>>1]&16)<<16>>16!=0){break}l=+g[d+4>>2];m=+g[d+8>>2];n=i-j*(l*l+m*m);g[e>>2]=n;if(n>0.0){o=n}else{bc(3036,366,13760,9448);o=+g[e>>2]}g[f>>2]=1.0/o}}while(0);f=a+44|0;e=c[f+4>>2]|0;o=(c[k>>2]=c[f>>2]|0,+g[k>>2]);j=(c[k>>2]=e,+g[k>>2]);e=d+4|0;d=a+28|0;h=c[e>>2]|0;p=c[e+4>>2]|0;c[d>>2]=h;c[d+4>>2]=p;i=+g[a+24>>2];n=(c[k>>2]=h,+g[k>>2]);m=+g[a+20>>2];l=(c[k>>2]=p,+g[k>>2]);q=+g[a+12>>2]+(i*n-m*l);r=n*m+i*l+ +g[a+16>>2];p=(g[k>>2]=q,c[k>>2]|0);h=0|p;p=(g[k>>2]=r,c[k>>2]|0)|0;c[f>>2]=h;c[f+4>>2]=p;f=a+36|0;c[f>>2]=h;c[f+4>>2]=p;l=+g[a+72>>2];p=a+64|0;g[p>>2]=+g[p>>2]+(r-j)*(-0.0-l);p=a+68|0;g[p>>2]=l*(q-o)+ +g[p>>2];return}function dh(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0;e=a+88|0;f=c[e>>2]|0;h=c[f+102868>>2]|0;if((h&2|0)==0){i=f;j=h}else{bc(3036,404,13708,3004);h=c[e>>2]|0;i=h;j=c[h+102868>>2]|0}if((j&2|0)!=0){return}j=a+12|0;l=+T(+d);g[a+20>>2]=l;m=+S(+d);g[a+24>>2]=m;h=b;b=j;f=c[h>>2]|0;n=c[h+4>>2]|0;c[b>>2]=f;c[b+4>>2]=n;o=+g[a+28>>2];p=+g[a+32>>2];q=(c[k>>2]=f,+g[k>>2])+(m*o-l*p);r=o*l+m*p+(c[k>>2]=n,+g[k>>2]);n=a+44|0;f=(g[k>>2]=q,c[k>>2]|0);b=0|f;f=(g[k>>2]=r,c[k>>2]|0)|0;c[n>>2]=b;c[n+4>>2]=f;g[a+56>>2]=d;n=a+36|0;c[n>>2]=b;c[n+4>>2]=f;g[a+52>>2]=d;f=i+102872|0;n=c[a+100>>2]|0;if((n|0)==0){s=i}else{i=n;while(1){dA(i,f,j,j);n=c[i+4>>2]|0;if((n|0)==0){break}else{i=n}}s=c[e>>2]|0}e=s+102872|0;dn(e|0,e);return}function di(a,d){a=a|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=a+88|0;if((c[(c[e>>2]|0)+102868>>2]&2|0)!=0){bc(3036,443,13508,3004)}f=a+4|0;g=b[f>>1]|0;if(!((g&32)<<16>>16!=0^d)){return}if(d){b[f>>1]=g|32;d=(c[e>>2]|0)+102872|0;h=c[a+100>>2]|0;if((h|0)==0){return}i=a+12|0;j=h;while(1){h=j+28|0;if((c[h>>2]|0)!=0){bc(9900,124,12536,10204)}k=j+12|0;l=c[k>>2]|0;m=bu[c[(c[l>>2]|0)+12>>2]&2047](l)|0;c[h>>2]=m;L1521:do{if((m|0)>0){l=j+24|0;n=0;while(1){o=c[l>>2]|0;p=o+(n*28&-1)|0;q=c[k>>2]|0;r=p|0;bR[c[(c[q>>2]|0)+24>>2]&2047](q,r,i,n);c[o+(n*28&-1)+24>>2]=b5(d,r,p)|0;c[o+(n*28&-1)+16>>2]=j;c[o+(n*28&-1)+20>>2]=n;o=n+1|0;if((o|0)<(c[h>>2]|0)){n=o}else{break L1521}}}}while(0);h=c[j+4>>2]|0;if((h|0)==0){break}else{j=h}}return}b[f>>1]=g&-33;g=c[e>>2]|0;f=c[a+100>>2]|0;L1528:do{if((f|0)!=0){j=g+102912|0;d=g+102904|0;i=g+102900|0;h=g+102872|0;k=f;while(1){m=k+28|0;L1532:do{if((c[m>>2]|0)>0){n=k+24|0;l=0;while(1){o=(c[n>>2]|0)+(l*28&-1)+24|0;p=c[o>>2]|0;r=c[j>>2]|0;q=0;while(1){if((q|0)>=(r|0)){break}s=(c[d>>2]|0)+(q<<2)|0;if((c[s>>2]|0)==(p|0)){t=1115;break}else{q=q+1|0}}if((t|0)==1115){t=0;c[s>>2]=-1}c[i>>2]=(c[i>>2]|0)-1|0;cl(h,p);c[o>>2]=-1;q=l+1|0;if((q|0)<(c[m>>2]|0)){l=q}else{break L1532}}}}while(0);c[m>>2]=0;l=c[k+4>>2]|0;if((l|0)==0){break L1528}else{k=l}}}}while(0);s=a+112|0;a=c[s>>2]|0;L1544:do{if((a|0)!=0){t=a;while(1){f=c[t+12>>2]|0;dk((c[e>>2]|0)+102872|0,c[t+4>>2]|0);if((f|0)==0){break L1544}else{t=f}}}}while(0);c[s>>2]=0;return}function dj(a){a=a|0;var d=0,e=0,f=0,j=0.0,l=0,m=0;d=i;e=a+8|0;f=c[e>>2]|0;c7(9292,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(8972,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(8784,(v=i,i=i+4|0,c[v>>2]=c[a>>2]|0,v)|0);j=+g[a+16>>2];c7(8628,(v=i,i=i+16|0,h[k>>3]=+g[a+12>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);c7(8348,(v=i,i=i+8|0,h[k>>3]=+g[a+56>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);j=+g[a+68>>2];c7(8244,(v=i,i=i+16|0,h[k>>3]=+g[a+64>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);c7(8108,(v=i,i=i+8|0,h[k>>3]=+g[a+72>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(7872,(v=i,i=i+8|0,h[k>>3]=+g[a+132>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(7468,(v=i,i=i+8|0,h[k>>3]=+g[a+136>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);l=a+4|0;c7(7396,(v=i,i=i+4|0,c[v>>2]=b[l>>1]&4,v)|0);c7(7040,(v=i,i=i+4|0,c[v>>2]=b[l>>1]&2,v)|0);c7(6784,(v=i,i=i+4|0,c[v>>2]=b[l>>1]&16,v)|0);c7(6644,(v=i,i=i+4|0,c[v>>2]=b[l>>1]&8,v)|0);c7(6300,(v=i,i=i+4|0,c[v>>2]=b[l>>1]&32,v)|0);c7(6092,(v=i,i=i+8|0,h[k>>3]=+g[a+140>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(5824,(v=i,i=i+4|0,c[v>>2]=c[e>>2]|0,v)|0);c7(5400,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);e=c[a+100>>2]|0;if((e|0)==0){c7(9064,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);i=d;return}else{m=e}while(1){c7(5528,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);dC(m,f);c7(5404,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);e=c[m+4>>2]|0;if((e|0)==0){break}else{m=e}}c7(9064,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);i=d;return}function dk(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;d=c[(c[b+48>>2]|0)+8>>2]|0;e=c[(c[b+52>>2]|0)+8>>2]|0;f=c[a+72>>2]|0;do{if((f|0)!=0){if((c[b+4>>2]&2|0)==0){break}bt[c[(c[f>>2]|0)+12>>2]&2047](f,b)}}while(0);f=b+8|0;g=c[f>>2]|0;h=b+12|0;if((g|0)!=0){c[g+12>>2]=c[h>>2]|0}g=c[h>>2]|0;if((g|0)!=0){c[g+8>>2]=c[f>>2]|0}f=a+60|0;if((c[f>>2]|0)==(b|0)){c[f>>2]=c[h>>2]|0}h=b+24|0;f=c[h>>2]|0;g=b+28|0;if((f|0)!=0){c[f+12>>2]=c[g>>2]|0}f=c[g>>2]|0;if((f|0)!=0){c[f+8>>2]=c[h>>2]|0}h=d+112|0;if((b+16|0)==(c[h>>2]|0)){c[h>>2]=c[g>>2]|0}g=b+40|0;h=c[g>>2]|0;d=b+44|0;if((h|0)!=0){c[h+12>>2]=c[d>>2]|0}h=c[d>>2]|0;if((h|0)!=0){c[h+8>>2]=c[g>>2]|0}g=e+112|0;if((b+32|0)!=(c[g>>2]|0)){i=a+76|0;j=c[i>>2]|0;ec(b,j);k=a+64|0;l=c[k>>2]|0;m=l-1|0;c[k>>2]=m;return}c[g>>2]=c[d>>2]|0;i=a+76|0;j=c[i>>2]|0;ec(b,j);k=a+64|0;l=c[k>>2]|0;m=l-1|0;c[k>>2]=m;return}function dl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=c[a>>2]|0;e=c[b>>2]|0;if((d|0)<(e|0)){f=1;return f|0}if((d|0)!=(e|0)){f=0;return f|0}f=(c[a+4>>2]|0)<(c[b+4>>2]|0);return f|0}function dm(d){d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;e=c[d+60>>2]|0;if((e|0)==0){return}f=d+12|0;h=d+4|0;i=d+72|0;j=d+68|0;k=e;while(1){e=c[k+48>>2]|0;l=c[k+52>>2]|0;m=c[k+56>>2]|0;n=c[k+60>>2]|0;o=c[e+8>>2]|0;p=c[l+8>>2]|0;q=k+4|0;r=c[q>>2]|0;L1602:do{if((r&8|0)==0){s=1178}else{do{if((c[p>>2]|0)==2){s=1167}else{if((c[o>>2]|0)==2){s=1167;break}else{break}}}while(0);L1606:do{if((s|0)==1167){s=0;t=c[p+108>>2]|0;L1608:do{if((t|0)!=0){u=t;while(1){if((c[u>>2]|0)==(o|0)){if((a[(c[u+4>>2]|0)+61|0]&1)<<24>>24==0){break L1606}}v=c[u+12>>2]|0;if((v|0)==0){break L1608}else{u=v}}}}while(0);t=c[j>>2]|0;do{if((t|0)==0){w=r}else{if(by[c[(c[t>>2]|0)+8>>2]&2047](t,e,l)|0){w=c[q>>2]|0;break}else{u=c[k+12>>2]|0;dk(d,k);x=u;break L1602}}}while(0);c[q>>2]=w&-9;s=1178;break L1602}}while(0);t=c[k+12>>2]|0;dk(d,k);x=t;break}}while(0);do{if((s|0)==1178){s=0;if((b[o+4>>1]&2)<<16>>16==0){y=0}else{y=(c[o>>2]|0)!=0}if((b[p+4>>1]&2)<<16>>16==0){z=0}else{z=(c[p>>2]|0)!=0}if(!(y|z)){x=c[k+12>>2]|0;break}q=c[(c[e+24>>2]|0)+(m*28&-1)+24>>2]|0;r=c[(c[l+24>>2]|0)+(n*28&-1)+24>>2]|0;do{if((q|0)>-1){if((c[f>>2]|0)>(q|0)){break}else{s=1186;break}}else{s=1186}}while(0);if((s|0)==1186){s=0;bc(8144,159,12036,7720)}t=c[h>>2]|0;do{if((r|0)>-1){if((c[f>>2]|0)>(r|0)){A=t;break}else{s=1189;break}}else{s=1189}}while(0);if((s|0)==1189){s=0;bc(8144,159,12036,7720);A=c[h>>2]|0}if(+g[A+(r*36&-1)>>2]- +g[t+(q*36&-1)+8>>2]>0.0|+g[A+(r*36&-1)+4>>2]- +g[t+(q*36&-1)+12>>2]>0.0|+g[t+(q*36&-1)>>2]- +g[A+(r*36&-1)+8>>2]>0.0|+g[t+(q*36&-1)+4>>2]- +g[A+(r*36&-1)+12>>2]>0.0){u=c[k+12>>2]|0;dk(d,k);x=u;break}else{ed(k,c[i>>2]|0);x=c[k+12>>2]|0;break}}}while(0);if((x|0)==0){break}else{k=x}}return}function dn(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;d=i;i=i+4|0;e=d|0;f=a+52|0;c[f>>2]=0;g=a+40|0;h=c[g>>2]|0;if((h|0)>0){j=a+32|0;k=a+56|0;l=a|0;m=a+12|0;n=a+4|0;o=0;p=h;while(1){h=c[(c[j>>2]|0)+(o<<2)>>2]|0;c[k>>2]=h;if((h|0)==-1){q=p}else{do{if((h|0)>-1){if((c[m>>2]|0)>(h|0)){break}else{r=1201;break}}else{r=1201}}while(0);if((r|0)==1201){r=0;bc(8144,159,12036,7720)}dq(l,a,(c[n>>2]|0)+(h*36&-1)|0);q=c[g>>2]|0}s=o+1|0;if((s|0)<(q|0)){o=s;p=q}else{break}}t=c[f>>2]|0}else{t=0}c[g>>2]=0;g=a+44|0;q=c[g>>2]|0;c[e>>2]=972;dr(q,q+(t*12&-1)|0,e);if((c[f>>2]|0)<=0){i=d;return}e=a+12|0;t=a+4|0;a=0;L1666:while(1){q=c[g>>2]|0;p=q+(a*12&-1)|0;o=c[p>>2]|0;do{if((o|0)>-1){if((c[e>>2]|0)>(o|0)){break}else{r=1209;break}}else{r=1209}}while(0);if((r|0)==1209){r=0;bc(8144,153,11988,7720)}h=c[t>>2]|0;n=c[h+(o*36&-1)+16>>2]|0;l=q+(a*12&-1)+4|0;m=c[l>>2]|0;do{if((m|0)>-1){if((c[e>>2]|0)>(m|0)){u=h;break}else{r=1212;break}}else{r=1212}}while(0);if((r|0)==1212){r=0;bc(8144,153,11988,7720);u=c[t>>2]|0}dp(b,n,c[u+(m*36&-1)+16>>2]|0);h=c[f>>2]|0;q=a;while(1){o=q+1|0;if((o|0)>=(h|0)){break L1666}k=c[g>>2]|0;if((c[k+(o*12&-1)>>2]|0)!=(c[p>>2]|0)){a=o;continue L1666}if((c[k+(o*12&-1)+4>>2]|0)==(c[l>>2]|0)){q=o}else{a=o;continue L1666}}}i=d;return}function dp(d,e,f){d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;h=c[e+16>>2]|0;i=c[f+16>>2]|0;j=c[e+20>>2]|0;e=c[f+20>>2]|0;f=c[h+8>>2]|0;k=c[i+8>>2]|0;if((f|0)==(k|0)){return}l=c[k+112>>2]|0;L1687:do{if((l|0)!=0){m=l;while(1){if((c[m>>2]|0)==(f|0)){n=c[m+4>>2]|0;o=c[n+48>>2]|0;p=c[n+52>>2]|0;q=c[n+56>>2]|0;r=c[n+60>>2]|0;if((o|0)==(h|0)&(p|0)==(i|0)&(q|0)==(j|0)&(r|0)==(e|0)){s=1247;break}if((o|0)==(i|0)&(p|0)==(h|0)&(q|0)==(e|0)&(r|0)==(j|0)){s=1249;break}}r=c[m+12>>2]|0;if((r|0)==0){break L1687}else{m=r}}if((s|0)==1247){return}else if((s|0)==1249){return}}}while(0);do{if((c[k>>2]|0)!=2){if((c[f>>2]|0)==2){break}return}}while(0);s=c[k+108>>2]|0;L1702:do{if((s|0)!=0){k=s;while(1){if((c[k>>2]|0)==(f|0)){if((a[(c[k+4>>2]|0)+61|0]&1)<<24>>24==0){break}}l=c[k+12>>2]|0;if((l|0)==0){break L1702}else{k=l}}return}}while(0);f=c[d+68>>2]|0;do{if((f|0)!=0){if(by[c[(c[f>>2]|0)+8>>2]&2047](f,h,i)|0){break}return}}while(0);f=eb(h,j,i,e,c[d+76>>2]|0)|0;if((f|0)==0){return}e=c[(c[f+48>>2]|0)+8>>2]|0;i=c[(c[f+52>>2]|0)+8>>2]|0;c[f+8>>2]=0;j=d+60|0;c[f+12>>2]=c[j>>2]|0;h=c[j>>2]|0;if((h|0)!=0){c[h+8>>2]=f}c[j>>2]=f;j=f+16|0;c[f+20>>2]=f;c[j>>2]=i;c[f+24>>2]=0;h=e+112|0;c[f+28>>2]=c[h>>2]|0;s=c[h>>2]|0;if((s|0)!=0){c[s+8>>2]=j}c[h>>2]=j;j=f+32|0;c[f+36>>2]=f;c[j>>2]=e;c[f+40>>2]=0;h=i+112|0;c[f+44>>2]=c[h>>2]|0;f=c[h>>2]|0;if((f|0)!=0){c[f+8>>2]=j}c[h>>2]=j;j=e+4|0;h=b[j>>1]|0;if((h&2)<<16>>16==0){b[j>>1]=h|2;g[e+144>>2]=0.0}e=i+4|0;h=b[e>>1]|0;if((h&2)<<16>>16==0){b[e>>1]=h|2;g[i+144>>2]=0.0}i=d+64|0;c[i>>2]=(c[i>>2]|0)+1|0;return}function dq(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+1036|0;f=e|0;h=f+4|0;j=f|0;c[j>>2]=h;k=f+1028|0;c[k>>2]=0;l=f+1032|0;c[l>>2]=256;c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[a>>2]|0;f=(c[k>>2]|0)+1|0;c[k>>2]=f;L1734:do{if((f|0)>0){m=a+4|0;n=d|0;o=d+4|0;p=d+8|0;q=d+12|0;r=b+56|0;s=b+52|0;t=b+48|0;u=b+44|0;v=f;while(1){w=v-1|0;c[k>>2]=w;x=c[j>>2]|0;y=c[x+(w<<2)>>2]|0;do{if((y|0)==-1){z=w}else{A=c[m>>2]|0;if(+g[n>>2]- +g[A+(y*36&-1)+8>>2]>0.0|+g[o>>2]- +g[A+(y*36&-1)+12>>2]>0.0|+g[A+(y*36&-1)>>2]- +g[p>>2]>0.0|+g[A+(y*36&-1)+4>>2]- +g[q>>2]>0.0){z=w;break}B=A+(y*36&-1)+24|0;if((c[B>>2]|0)==-1){C=c[r>>2]|0;if((C|0)==(y|0)){z=w;break}D=c[s>>2]|0;if((D|0)==(c[t>>2]|0)){E=c[u>>2]|0;c[t>>2]=D<<1;F=pQ(D*24&-1)|0;c[u>>2]=F;G=E;pY(F|0,G|0,(c[s>>2]|0)*12&-1);pR(G);H=c[r>>2]|0;I=c[s>>2]|0}else{H=C;I=D}c[(c[u>>2]|0)+(I*12&-1)>>2]=(H|0)>(y|0)?y:H;D=c[r>>2]|0;c[(c[u>>2]|0)+((c[s>>2]|0)*12&-1)+4>>2]=(D|0)<(y|0)?y:D;c[s>>2]=(c[s>>2]|0)+1|0;z=c[k>>2]|0;break}do{if((w|0)==(c[l>>2]|0)){c[l>>2]=w<<1;D=pQ(w<<3)|0;c[j>>2]=D;C=x;pY(D|0,C|0,c[k>>2]<<2);if((x|0)==(h|0)){break}pR(C)}}while(0);c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[B>>2]|0;C=(c[k>>2]|0)+1|0;c[k>>2]=C;D=A+(y*36&-1)+28|0;do{if((C|0)==(c[l>>2]|0)){G=c[j>>2]|0;c[l>>2]=C<<1;F=pQ(C<<3)|0;c[j>>2]=F;E=G;pY(F|0,E|0,c[k>>2]<<2);if((G|0)==(h|0)){break}pR(E)}}while(0);c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[D>>2]|0;C=(c[k>>2]|0)+1|0;c[k>>2]=C;z=C}}while(0);if((z|0)>0){v=z}else{break L1734}}}}while(0);z=c[j>>2]|0;if((z|0)==(h|0)){i=e;return}pR(z);c[j>>2]=0;i=e;return}function dr(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0;e=i;i=i+360|0;f=e|0;g=e+12|0;h=e+24|0;j=e+36|0;k=e+48|0;l=e+168|0;m=e+180|0;n=e+192|0;o=e+204|0;p=e+216|0;q=e+228|0;r=e+240|0;s=e+252|0;t=e+264|0;u=e+276|0;v=e+348|0;w=e+120|0;x=e+132|0;y=e+144|0;z=e+156|0;A=e+288|0;B=e+300|0;C=e+324|0;D=e+336|0;E=e+312|0;F=e+60|0;G=e+72|0;H=e+84|0;I=e+96|0;J=e+108|0;K=a;a=b;L1763:while(1){b=a;L=a-12|0;M=L;N=K;L1765:while(1){O=N;P=b-O|0;Q=(P|0)/12&-1;if((Q|0)==2){R=1280;break L1763}else if((Q|0)==5){R=1291;break L1763}else if((Q|0)==4){R=1290;break L1763}else if((Q|0)==3){R=1282;break L1763}else if((Q|0)==0|(Q|0)==1){R=1366;break L1763}if((P|0)<372){R=1297;break L1763}Q=(P|0)/24&-1;S=N+(Q*12&-1)|0;do{if((P|0)>11988){T=(P|0)/48&-1;U=N+(T*12&-1)|0;V=N+((T+Q|0)*12&-1)|0;T=ds(N,U,S,V,d)|0;if(!(bI[c[d>>2]&2047](L,V)|0)){W=T;break}X=V;c[z>>2]=c[X>>2]|0;c[z+4>>2]=c[X+4>>2]|0;c[z+8>>2]=c[X+8>>2]|0;c[X>>2]=c[M>>2]|0;c[X+4>>2]=c[M+4>>2]|0;c[X+8>>2]=c[M+8>>2]|0;c[M>>2]=c[z>>2]|0;c[M+4>>2]=c[z+4>>2]|0;c[M+8>>2]=c[z+8>>2]|0;if(!(bI[c[d>>2]&2047](V,S)|0)){W=T+1|0;break}V=S;c[x>>2]=c[V>>2]|0;c[x+4>>2]=c[V+4>>2]|0;c[x+8>>2]=c[V+8>>2]|0;c[V>>2]=c[X>>2]|0;c[V+4>>2]=c[X+4>>2]|0;c[V+8>>2]=c[X+8>>2]|0;c[X>>2]=c[x>>2]|0;c[X+4>>2]=c[x+4>>2]|0;c[X+8>>2]=c[x+8>>2]|0;if(!(bI[c[d>>2]&2047](S,U)|0)){W=T+2|0;break}X=U;c[w>>2]=c[X>>2]|0;c[w+4>>2]=c[X+4>>2]|0;c[w+8>>2]=c[X+8>>2]|0;c[X>>2]=c[V>>2]|0;c[X+4>>2]=c[V+4>>2]|0;c[X+8>>2]=c[V+8>>2]|0;c[V>>2]=c[w>>2]|0;c[V+4>>2]=c[w+4>>2]|0;c[V+8>>2]=c[w+8>>2]|0;if(!(bI[c[d>>2]&2047](U,N)|0)){W=T+3|0;break}U=N;c[y>>2]=c[U>>2]|0;c[y+4>>2]=c[U+4>>2]|0;c[y+8>>2]=c[U+8>>2]|0;c[U>>2]=c[X>>2]|0;c[U+4>>2]=c[X+4>>2]|0;c[U+8>>2]=c[X+8>>2]|0;c[X>>2]=c[y>>2]|0;c[X+4>>2]=c[y+4>>2]|0;c[X+8>>2]=c[y+8>>2]|0;W=T+4|0}else{T=bI[c[d>>2]&2047](S,N)|0;X=bI[c[d>>2]&2047](L,S)|0;if(!T){if(!X){W=0;break}T=S;c[J>>2]=c[T>>2]|0;c[J+4>>2]=c[T+4>>2]|0;c[J+8>>2]=c[T+8>>2]|0;c[T>>2]=c[M>>2]|0;c[T+4>>2]=c[M+4>>2]|0;c[T+8>>2]=c[M+8>>2]|0;c[M>>2]=c[J>>2]|0;c[M+4>>2]=c[J+4>>2]|0;c[M+8>>2]=c[J+8>>2]|0;if(!(bI[c[d>>2]&2047](S,N)|0)){W=1;break}U=N;c[H>>2]=c[U>>2]|0;c[H+4>>2]=c[U+4>>2]|0;c[H+8>>2]=c[U+8>>2]|0;c[U>>2]=c[T>>2]|0;c[U+4>>2]=c[T+4>>2]|0;c[U+8>>2]=c[T+8>>2]|0;c[T>>2]=c[H>>2]|0;c[T+4>>2]=c[H+4>>2]|0;c[T+8>>2]=c[H+8>>2]|0;W=2;break}T=N;if(X){c[F>>2]=c[T>>2]|0;c[F+4>>2]=c[T+4>>2]|0;c[F+8>>2]=c[T+8>>2]|0;c[T>>2]=c[M>>2]|0;c[T+4>>2]=c[M+4>>2]|0;c[T+8>>2]=c[M+8>>2]|0;c[M>>2]=c[F>>2]|0;c[M+4>>2]=c[F+4>>2]|0;c[M+8>>2]=c[F+8>>2]|0;W=1;break}c[G>>2]=c[T>>2]|0;c[G+4>>2]=c[T+4>>2]|0;c[G+8>>2]=c[T+8>>2]|0;X=S;c[T>>2]=c[X>>2]|0;c[T+4>>2]=c[X+4>>2]|0;c[T+8>>2]=c[X+8>>2]|0;c[X>>2]=c[G>>2]|0;c[X+4>>2]=c[G+4>>2]|0;c[X+8>>2]=c[G+8>>2]|0;if(!(bI[c[d>>2]&2047](L,S)|0)){W=1;break}c[I>>2]=c[X>>2]|0;c[I+4>>2]=c[X+4>>2]|0;c[I+8>>2]=c[X+8>>2]|0;c[X>>2]=c[M>>2]|0;c[X+4>>2]=c[M+4>>2]|0;c[X+8>>2]=c[M+8>>2]|0;c[M>>2]=c[I>>2]|0;c[M+4>>2]=c[I+4>>2]|0;c[M+8>>2]=c[I+8>>2]|0;W=2}}while(0);do{if(bI[c[d>>2]&2047](N,S)|0){Y=L;Z=W}else{Q=L;while(1){_=Q-12|0;if((N|0)==(_|0)){break}if(bI[c[d>>2]&2047](_,S)|0){R=1339;break}else{Q=_}}if((R|0)==1339){R=0;Q=N;c[E>>2]=c[Q>>2]|0;c[E+4>>2]=c[Q+4>>2]|0;c[E+8>>2]=c[Q+8>>2]|0;P=_;c[Q>>2]=c[P>>2]|0;c[Q+4>>2]=c[P+4>>2]|0;c[Q+8>>2]=c[P+8>>2]|0;c[P>>2]=c[E>>2]|0;c[P+4>>2]=c[E+4>>2]|0;c[P+8>>2]=c[E+8>>2]|0;Y=_;Z=W+1|0;break}P=N+12|0;if(bI[c[d>>2]&2047](N,L)|0){$=P}else{Q=P;while(1){if((Q|0)==(L|0)){R=1375;break L1763}aa=Q+12|0;if(bI[c[d>>2]&2047](N,Q)|0){break}else{Q=aa}}P=Q;c[D>>2]=c[P>>2]|0;c[D+4>>2]=c[P+4>>2]|0;c[D+8>>2]=c[P+8>>2]|0;c[P>>2]=c[M>>2]|0;c[P+4>>2]=c[M+4>>2]|0;c[P+8>>2]=c[M+8>>2]|0;c[M>>2]=c[D>>2]|0;c[M+4>>2]=c[D+4>>2]|0;c[M+8>>2]=c[D+8>>2]|0;$=aa}if(($|0)==(L|0)){R=1372;break L1763}else{ab=L;ac=$}while(1){P=ac;while(1){ad=P+12|0;if(bI[c[d>>2]&2047](N,P)|0){ae=ab;break}else{P=ad}}while(1){af=ae-12|0;if(bI[c[d>>2]&2047](N,af)|0){ae=af}else{break}}if(P>>>0>=af>>>0){N=P;continue L1765}X=P;c[C>>2]=c[X>>2]|0;c[C+4>>2]=c[X+4>>2]|0;c[C+8>>2]=c[X+8>>2]|0;T=af;c[X>>2]=c[T>>2]|0;c[X+4>>2]=c[T+4>>2]|0;c[X+8>>2]=c[T+8>>2]|0;c[T>>2]=c[C>>2]|0;c[T+4>>2]=c[C+4>>2]|0;c[T+8>>2]=c[C+8>>2]|0;ab=af;ac=ad}}}while(0);Q=N+12|0;L1808:do{if(Q>>>0<Y>>>0){T=Y;X=Q;U=Z;V=S;while(1){ag=X;while(1){ah=ag+12|0;if(bI[c[d>>2]&2047](ag,V)|0){ag=ah}else{ai=T;break}}while(1){aj=ai-12|0;if(bI[c[d>>2]&2047](aj,V)|0){break}else{ai=aj}}if(ag>>>0>aj>>>0){ak=ag;al=U;am=V;break L1808}P=ag;c[B>>2]=c[P>>2]|0;c[B+4>>2]=c[P+4>>2]|0;c[B+8>>2]=c[P+8>>2]|0;an=aj;c[P>>2]=c[an>>2]|0;c[P+4>>2]=c[an+4>>2]|0;c[P+8>>2]=c[an+8>>2]|0;c[an>>2]=c[B>>2]|0;c[an+4>>2]=c[B+4>>2]|0;c[an+8>>2]=c[B+8>>2]|0;T=aj;X=ah;U=U+1|0;V=(V|0)==(ag|0)?aj:V}}else{ak=Q;al=Z;am=S}}while(0);do{if((ak|0)==(am|0)){ao=al}else{if(!(bI[c[d>>2]&2047](am,ak)|0)){ao=al;break}S=ak;c[A>>2]=c[S>>2]|0;c[A+4>>2]=c[S+4>>2]|0;c[A+8>>2]=c[S+8>>2]|0;Q=am;c[S>>2]=c[Q>>2]|0;c[S+4>>2]=c[Q+4>>2]|0;c[S+8>>2]=c[Q+8>>2]|0;c[Q>>2]=c[A>>2]|0;c[Q+4>>2]=c[A+4>>2]|0;c[Q+8>>2]=c[A+8>>2]|0;ao=al+1|0}}while(0);if((ao|0)==0){ap=dx(N,ak,d)|0;Q=ak+12|0;if(dx(Q,a,d)|0){R=1351;break}if(ap){N=Q;continue}}Q=ak;if((Q-O|0)>=(b-Q|0)){R=1355;break}dr(N,ak,d);N=ak+12|0}if((R|0)==1351){R=0;if(ap){R=1364;break}else{K=N;a=ak;continue}}else if((R|0)==1355){R=0;dr(ak+12|0,a,d);K=N;a=ak;continue}}if((R|0)==1280){if(!(bI[c[d>>2]&2047](L,N)|0)){i=e;return}ak=v;v=N;c[ak>>2]=c[v>>2]|0;c[ak+4>>2]=c[v+4>>2]|0;c[ak+8>>2]=c[v+8>>2]|0;c[v>>2]=c[M>>2]|0;c[v+4>>2]=c[M+4>>2]|0;c[v+8>>2]=c[M+8>>2]|0;c[M>>2]=c[ak>>2]|0;c[M+4>>2]=c[ak+4>>2]|0;c[M+8>>2]=c[ak+8>>2]|0;i=e;return}else if((R|0)==1291){ak=N+12|0;v=N+24|0;K=N+36|0;ap=m;m=n;n=o;o=p;ds(N,ak,v,K,d);if(!(bI[c[d>>2]&2047](L,K)|0)){i=e;return}p=K;c[o>>2]=c[p>>2]|0;c[o+4>>2]=c[p+4>>2]|0;c[o+8>>2]=c[p+8>>2]|0;c[p>>2]=c[M>>2]|0;c[p+4>>2]=c[M+4>>2]|0;c[p+8>>2]=c[M+8>>2]|0;c[M>>2]=c[o>>2]|0;c[M+4>>2]=c[o+4>>2]|0;c[M+8>>2]=c[o+8>>2]|0;if(!(bI[c[d>>2]&2047](K,v)|0)){i=e;return}K=v;c[m>>2]=c[K>>2]|0;c[m+4>>2]=c[K+4>>2]|0;c[m+8>>2]=c[K+8>>2]|0;c[K>>2]=c[p>>2]|0;c[K+4>>2]=c[p+4>>2]|0;c[K+8>>2]=c[p+8>>2]|0;c[p>>2]=c[m>>2]|0;c[p+4>>2]=c[m+4>>2]|0;c[p+8>>2]=c[m+8>>2]|0;if(!(bI[c[d>>2]&2047](v,ak)|0)){i=e;return}v=ak;c[ap>>2]=c[v>>2]|0;c[ap+4>>2]=c[v+4>>2]|0;c[ap+8>>2]=c[v+8>>2]|0;c[v>>2]=c[K>>2]|0;c[v+4>>2]=c[K+4>>2]|0;c[v+8>>2]=c[K+8>>2]|0;c[K>>2]=c[ap>>2]|0;c[K+4>>2]=c[ap+4>>2]|0;c[K+8>>2]=c[ap+8>>2]|0;if(!(bI[c[d>>2]&2047](ak,N)|0)){i=e;return}ak=N;c[n>>2]=c[ak>>2]|0;c[n+4>>2]=c[ak+4>>2]|0;c[n+8>>2]=c[ak+8>>2]|0;c[ak>>2]=c[v>>2]|0;c[ak+4>>2]=c[v+4>>2]|0;c[ak+8>>2]=c[v+8>>2]|0;c[v>>2]=c[n>>2]|0;c[v+4>>2]=c[n+4>>2]|0;c[v+8>>2]=c[n+8>>2]|0;i=e;return}else if((R|0)==1297){n=l;v=N+24|0;ak=N+12|0;ap=f;f=g;g=h;h=j;j=k;k=bI[c[d>>2]&2047](ak,N)|0;K=bI[c[d>>2]&2047](v,ak)|0;do{if(k){m=N;if(K){c[ap>>2]=c[m>>2]|0;c[ap+4>>2]=c[m+4>>2]|0;c[ap+8>>2]=c[m+8>>2]|0;p=v;c[m>>2]=c[p>>2]|0;c[m+4>>2]=c[p+4>>2]|0;c[m+8>>2]=c[p+8>>2]|0;c[p>>2]=c[ap>>2]|0;c[p+4>>2]=c[ap+4>>2]|0;c[p+8>>2]=c[ap+8>>2]|0;break}c[f>>2]=c[m>>2]|0;c[f+4>>2]=c[m+4>>2]|0;c[f+8>>2]=c[m+8>>2]|0;p=ak;c[m>>2]=c[p>>2]|0;c[m+4>>2]=c[p+4>>2]|0;c[m+8>>2]=c[p+8>>2]|0;c[p>>2]=c[f>>2]|0;c[p+4>>2]=c[f+4>>2]|0;c[p+8>>2]=c[f+8>>2]|0;if(!(bI[c[d>>2]&2047](v,ak)|0)){break}c[h>>2]=c[p>>2]|0;c[h+4>>2]=c[p+4>>2]|0;c[h+8>>2]=c[p+8>>2]|0;m=v;c[p>>2]=c[m>>2]|0;c[p+4>>2]=c[m+4>>2]|0;c[p+8>>2]=c[m+8>>2]|0;c[m>>2]=c[h>>2]|0;c[m+4>>2]=c[h+4>>2]|0;c[m+8>>2]=c[h+8>>2]|0}else{if(!K){break}m=ak;c[j>>2]=c[m>>2]|0;c[j+4>>2]=c[m+4>>2]|0;c[j+8>>2]=c[m+8>>2]|0;p=v;c[m>>2]=c[p>>2]|0;c[m+4>>2]=c[p+4>>2]|0;c[m+8>>2]=c[p+8>>2]|0;c[p>>2]=c[j>>2]|0;c[p+4>>2]=c[j+4>>2]|0;c[p+8>>2]=c[j+8>>2]|0;if(!(bI[c[d>>2]&2047](ak,N)|0)){break}p=N;c[g>>2]=c[p>>2]|0;c[g+4>>2]=c[p+4>>2]|0;c[g+8>>2]=c[p+8>>2]|0;c[p>>2]=c[m>>2]|0;c[p+4>>2]=c[m+4>>2]|0;c[p+8>>2]=c[m+8>>2]|0;c[m>>2]=c[g>>2]|0;c[m+4>>2]=c[g+4>>2]|0;c[m+8>>2]=c[g+8>>2]|0}}while(0);g=N+36|0;if((g|0)==(a|0)){i=e;return}else{aq=v;ar=g}while(1){if(bI[c[d>>2]&2047](ar,aq)|0){g=ar;c[n>>2]=c[g>>2]|0;c[n+4>>2]=c[g+4>>2]|0;c[n+8>>2]=c[g+8>>2]|0;g=aq;v=ar;while(1){ak=v;as=g;c[ak>>2]=c[as>>2]|0;c[ak+4>>2]=c[as+4>>2]|0;c[ak+8>>2]=c[as+8>>2]|0;if((g|0)==(N|0)){break}ak=g-12|0;if(bI[c[d>>2]&2047](l,ak)|0){v=g;g=ak}else{break}}c[as>>2]=c[n>>2]|0;c[as+4>>2]=c[n+4>>2]|0;c[as+8>>2]=c[n+8>>2]|0}g=ar+12|0;if((g|0)==(a|0)){break}else{aq=ar;ar=g}}i=e;return}else if((R|0)==1290){ds(N,N+12|0,N+24|0,L,d);i=e;return}else if((R|0)==1282){ar=N+12|0;aq=q;q=r;r=s;s=t;t=u;u=bI[c[d>>2]&2047](ar,N)|0;a=bI[c[d>>2]&2047](L,ar)|0;if(!u){if(!a){i=e;return}u=ar;c[t>>2]=c[u>>2]|0;c[t+4>>2]=c[u+4>>2]|0;c[t+8>>2]=c[u+8>>2]|0;c[u>>2]=c[M>>2]|0;c[u+4>>2]=c[M+4>>2]|0;c[u+8>>2]=c[M+8>>2]|0;c[M>>2]=c[t>>2]|0;c[M+4>>2]=c[t+4>>2]|0;c[M+8>>2]=c[t+8>>2]|0;if(!(bI[c[d>>2]&2047](ar,N)|0)){i=e;return}t=N;c[r>>2]=c[t>>2]|0;c[r+4>>2]=c[t+4>>2]|0;c[r+8>>2]=c[t+8>>2]|0;c[t>>2]=c[u>>2]|0;c[t+4>>2]=c[u+4>>2]|0;c[t+8>>2]=c[u+8>>2]|0;c[u>>2]=c[r>>2]|0;c[u+4>>2]=c[r+4>>2]|0;c[u+8>>2]=c[r+8>>2]|0;i=e;return}r=N;if(a){c[aq>>2]=c[r>>2]|0;c[aq+4>>2]=c[r+4>>2]|0;c[aq+8>>2]=c[r+8>>2]|0;c[r>>2]=c[M>>2]|0;c[r+4>>2]=c[M+4>>2]|0;c[r+8>>2]=c[M+8>>2]|0;c[M>>2]=c[aq>>2]|0;c[M+4>>2]=c[aq+4>>2]|0;c[M+8>>2]=c[aq+8>>2]|0;i=e;return}c[q>>2]=c[r>>2]|0;c[q+4>>2]=c[r+4>>2]|0;c[q+8>>2]=c[r+8>>2]|0;aq=ar;c[r>>2]=c[aq>>2]|0;c[r+4>>2]=c[aq+4>>2]|0;c[r+8>>2]=c[aq+8>>2]|0;c[aq>>2]=c[q>>2]|0;c[aq+4>>2]=c[q+4>>2]|0;c[aq+8>>2]=c[q+8>>2]|0;if(!(bI[c[d>>2]&2047](L,ar)|0)){i=e;return}c[s>>2]=c[aq>>2]|0;c[s+4>>2]=c[aq+4>>2]|0;c[s+8>>2]=c[aq+8>>2]|0;c[aq>>2]=c[M>>2]|0;c[aq+4>>2]=c[M+4>>2]|0;c[aq+8>>2]=c[M+8>>2]|0;c[M>>2]=c[s>>2]|0;c[M+4>>2]=c[s+4>>2]|0;c[M+8>>2]=c[s+8>>2]|0;i=e;return}else if((R|0)==1364){i=e;return}else if((R|0)==1366){i=e;return}else if((R|0)==1372){i=e;return}else if((R|0)==1375){i=e;return}}function ds(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+96|0;h=g+60|0;j=g+72|0;k=g+84|0;l=g|0;m=g+12|0;n=g+24|0;o=g+36|0;p=g+48|0;q=bI[c[f>>2]&2047](b,a)|0;r=bI[c[f>>2]&2047](d,b)|0;do{if(q){s=a;if(r){c[l>>2]=c[s>>2]|0;c[l+4>>2]=c[s+4>>2]|0;c[l+8>>2]=c[s+8>>2]|0;t=d;c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;c[t>>2]=c[l>>2]|0;c[t+4>>2]=c[l+4>>2]|0;c[t+8>>2]=c[l+8>>2]|0;u=1;break}c[m>>2]=c[s>>2]|0;c[m+4>>2]=c[s+4>>2]|0;c[m+8>>2]=c[s+8>>2]|0;t=b;c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;c[t>>2]=c[m>>2]|0;c[t+4>>2]=c[m+4>>2]|0;c[t+8>>2]=c[m+8>>2]|0;if(!(bI[c[f>>2]&2047](d,b)|0)){u=1;break}c[o>>2]=c[t>>2]|0;c[o+4>>2]=c[t+4>>2]|0;c[o+8>>2]=c[t+8>>2]|0;s=d;c[t>>2]=c[s>>2]|0;c[t+4>>2]=c[s+4>>2]|0;c[t+8>>2]=c[s+8>>2]|0;c[s>>2]=c[o>>2]|0;c[s+4>>2]=c[o+4>>2]|0;c[s+8>>2]=c[o+8>>2]|0;u=2}else{if(!r){u=0;break}s=b;c[p>>2]=c[s>>2]|0;c[p+4>>2]=c[s+4>>2]|0;c[p+8>>2]=c[s+8>>2]|0;t=d;c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;c[t>>2]=c[p>>2]|0;c[t+4>>2]=c[p+4>>2]|0;c[t+8>>2]=c[p+8>>2]|0;if(!(bI[c[f>>2]&2047](b,a)|0)){u=1;break}t=a;c[n>>2]=c[t>>2]|0;c[n+4>>2]=c[t+4>>2]|0;c[n+8>>2]=c[t+8>>2]|0;c[t>>2]=c[s>>2]|0;c[t+4>>2]=c[s+4>>2]|0;c[t+8>>2]=c[s+8>>2]|0;c[s>>2]=c[n>>2]|0;c[s+4>>2]=c[n+4>>2]|0;c[s+8>>2]=c[n+8>>2]|0;u=2}}while(0);if(!(bI[c[f>>2]&2047](e,d)|0)){v=u;i=g;return v|0}n=k;k=d;c[n>>2]=c[k>>2]|0;c[n+4>>2]=c[k+4>>2]|0;c[n+8>>2]=c[k+8>>2]|0;p=e;c[k>>2]=c[p>>2]|0;c[k+4>>2]=c[p+4>>2]|0;c[k+8>>2]=c[p+8>>2]|0;c[p>>2]=c[n>>2]|0;c[p+4>>2]=c[n+4>>2]|0;c[p+8>>2]=c[n+8>>2]|0;if(!(bI[c[f>>2]&2047](d,b)|0)){v=u+1|0;i=g;return v|0}d=h;h=b;c[d>>2]=c[h>>2]|0;c[d+4>>2]=c[h+4>>2]|0;c[d+8>>2]=c[h+8>>2]|0;c[h>>2]=c[k>>2]|0;c[h+4>>2]=c[k+4>>2]|0;c[h+8>>2]=c[k+8>>2]|0;c[k>>2]=c[d>>2]|0;c[k+4>>2]=c[d+4>>2]|0;c[k+8>>2]=c[d+8>>2]|0;if(!(bI[c[f>>2]&2047](b,a)|0)){v=u+2|0;i=g;return v|0}b=j;j=a;c[b>>2]=c[j>>2]|0;c[b+4>>2]=c[j+4>>2]|0;c[b+8>>2]=c[j+8>>2]|0;c[j>>2]=c[h>>2]|0;c[j+4>>2]=c[h+4>>2]|0;c[j+8>>2]=c[h+8>>2]|0;c[h>>2]=c[b>>2]|0;c[h+4>>2]=c[b+4>>2]|0;c[h+8>>2]=c[b+8>>2]|0;v=u+3|0;i=g;return v|0}function dt(a,b){a=a|0;b=b|0;return}function du(a,b){a=a|0;b=b|0;return}function dv(a,b,c){a=a|0;b=b|0;c=c|0;return}function dw(a,b,c){a=a|0;b=b|0;c=c|0;return}function dx(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;e=i;i=i+192|0;f=e|0;g=e+12|0;h=e+24|0;j=e+36|0;k=e+48|0;l=e+60|0;m=e+72|0;n=e+84|0;o=e+96|0;p=e+108|0;q=e+120|0;r=e+132|0;s=e+144|0;t=e+156|0;u=e+168|0;v=e+180|0;w=(b-a|0)/12&-1;if((w|0)==2){x=b-12|0;if(!(bI[c[d>>2]&2047](x,a)|0)){y=1;i=e;return y|0}z=u;u=a;c[z>>2]=c[u>>2]|0;c[z+4>>2]=c[u+4>>2]|0;c[z+8>>2]=c[u+8>>2]|0;A=x;c[u>>2]=c[A>>2]|0;c[u+4>>2]=c[A+4>>2]|0;c[u+8>>2]=c[A+8>>2]|0;c[A>>2]=c[z>>2]|0;c[A+4>>2]=c[z+4>>2]|0;c[A+8>>2]=c[z+8>>2]|0;y=1;i=e;return y|0}else if((w|0)==3){z=a+12|0;A=b-12|0;u=p;p=q;q=r;r=s;s=t;t=bI[c[d>>2]&2047](z,a)|0;x=bI[c[d>>2]&2047](A,z)|0;if(!t){if(!x){y=1;i=e;return y|0}t=z;c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;B=A;c[t>>2]=c[B>>2]|0;c[t+4>>2]=c[B+4>>2]|0;c[t+8>>2]=c[B+8>>2]|0;c[B>>2]=c[s>>2]|0;c[B+4>>2]=c[s+4>>2]|0;c[B+8>>2]=c[s+8>>2]|0;if(!(bI[c[d>>2]&2047](z,a)|0)){y=1;i=e;return y|0}s=a;c[q>>2]=c[s>>2]|0;c[q+4>>2]=c[s+4>>2]|0;c[q+8>>2]=c[s+8>>2]|0;c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;c[t>>2]=c[q>>2]|0;c[t+4>>2]=c[q+4>>2]|0;c[t+8>>2]=c[q+8>>2]|0;y=1;i=e;return y|0}q=a;if(x){c[u>>2]=c[q>>2]|0;c[u+4>>2]=c[q+4>>2]|0;c[u+8>>2]=c[q+8>>2]|0;x=A;c[q>>2]=c[x>>2]|0;c[q+4>>2]=c[x+4>>2]|0;c[q+8>>2]=c[x+8>>2]|0;c[x>>2]=c[u>>2]|0;c[x+4>>2]=c[u+4>>2]|0;c[x+8>>2]=c[u+8>>2]|0;y=1;i=e;return y|0}c[p>>2]=c[q>>2]|0;c[p+4>>2]=c[q+4>>2]|0;c[p+8>>2]=c[q+8>>2]|0;u=z;c[q>>2]=c[u>>2]|0;c[q+4>>2]=c[u+4>>2]|0;c[q+8>>2]=c[u+8>>2]|0;c[u>>2]=c[p>>2]|0;c[u+4>>2]=c[p+4>>2]|0;c[u+8>>2]=c[p+8>>2]|0;if(!(bI[c[d>>2]&2047](A,z)|0)){y=1;i=e;return y|0}c[r>>2]=c[u>>2]|0;c[r+4>>2]=c[u+4>>2]|0;c[r+8>>2]=c[u+8>>2]|0;z=A;c[u>>2]=c[z>>2]|0;c[u+4>>2]=c[z+4>>2]|0;c[u+8>>2]=c[z+8>>2]|0;c[z>>2]=c[r>>2]|0;c[z+4>>2]=c[r+4>>2]|0;c[z+8>>2]=c[r+8>>2]|0;y=1;i=e;return y|0}else if((w|0)==5){r=a+12|0;z=a+24|0;u=a+36|0;A=b-12|0;p=l;l=m;m=n;n=o;ds(a,r,z,u,d);if(!(bI[c[d>>2]&2047](A,u)|0)){y=1;i=e;return y|0}o=u;c[n>>2]=c[o>>2]|0;c[n+4>>2]=c[o+4>>2]|0;c[n+8>>2]=c[o+8>>2]|0;q=A;c[o>>2]=c[q>>2]|0;c[o+4>>2]=c[q+4>>2]|0;c[o+8>>2]=c[q+8>>2]|0;c[q>>2]=c[n>>2]|0;c[q+4>>2]=c[n+4>>2]|0;c[q+8>>2]=c[n+8>>2]|0;if(!(bI[c[d>>2]&2047](u,z)|0)){y=1;i=e;return y|0}u=z;c[l>>2]=c[u>>2]|0;c[l+4>>2]=c[u+4>>2]|0;c[l+8>>2]=c[u+8>>2]|0;c[u>>2]=c[o>>2]|0;c[u+4>>2]=c[o+4>>2]|0;c[u+8>>2]=c[o+8>>2]|0;c[o>>2]=c[l>>2]|0;c[o+4>>2]=c[l+4>>2]|0;c[o+8>>2]=c[l+8>>2]|0;if(!(bI[c[d>>2]&2047](z,r)|0)){y=1;i=e;return y|0}z=r;c[p>>2]=c[z>>2]|0;c[p+4>>2]=c[z+4>>2]|0;c[p+8>>2]=c[z+8>>2]|0;c[z>>2]=c[u>>2]|0;c[z+4>>2]=c[u+4>>2]|0;c[z+8>>2]=c[u+8>>2]|0;c[u>>2]=c[p>>2]|0;c[u+4>>2]=c[p+4>>2]|0;c[u+8>>2]=c[p+8>>2]|0;if(!(bI[c[d>>2]&2047](r,a)|0)){y=1;i=e;return y|0}r=a;c[m>>2]=c[r>>2]|0;c[m+4>>2]=c[r+4>>2]|0;c[m+8>>2]=c[r+8>>2]|0;c[r>>2]=c[z>>2]|0;c[r+4>>2]=c[z+4>>2]|0;c[r+8>>2]=c[z+8>>2]|0;c[z>>2]=c[m>>2]|0;c[z+4>>2]=c[m+4>>2]|0;c[z+8>>2]=c[m+8>>2]|0;y=1;i=e;return y|0}else if((w|0)==4){ds(a,a+12|0,a+24|0,b-12|0,d);y=1;i=e;return y|0}else if((w|0)==0|(w|0)==1){y=1;i=e;return y|0}else{w=a+24|0;m=a+12|0;z=f;f=g;g=h;h=j;j=k;k=bI[c[d>>2]&2047](m,a)|0;r=bI[c[d>>2]&2047](w,m)|0;do{if(k){p=a;if(r){c[z>>2]=c[p>>2]|0;c[z+4>>2]=c[p+4>>2]|0;c[z+8>>2]=c[p+8>>2]|0;u=w;c[p>>2]=c[u>>2]|0;c[p+4>>2]=c[u+4>>2]|0;c[p+8>>2]=c[u+8>>2]|0;c[u>>2]=c[z>>2]|0;c[u+4>>2]=c[z+4>>2]|0;c[u+8>>2]=c[z+8>>2]|0;break}c[f>>2]=c[p>>2]|0;c[f+4>>2]=c[p+4>>2]|0;c[f+8>>2]=c[p+8>>2]|0;u=m;c[p>>2]=c[u>>2]|0;c[p+4>>2]=c[u+4>>2]|0;c[p+8>>2]=c[u+8>>2]|0;c[u>>2]=c[f>>2]|0;c[u+4>>2]=c[f+4>>2]|0;c[u+8>>2]=c[f+8>>2]|0;if(!(bI[c[d>>2]&2047](w,m)|0)){break}c[h>>2]=c[u>>2]|0;c[h+4>>2]=c[u+4>>2]|0;c[h+8>>2]=c[u+8>>2]|0;p=w;c[u>>2]=c[p>>2]|0;c[u+4>>2]=c[p+4>>2]|0;c[u+8>>2]=c[p+8>>2]|0;c[p>>2]=c[h>>2]|0;c[p+4>>2]=c[h+4>>2]|0;c[p+8>>2]=c[h+8>>2]|0}else{if(!r){break}p=m;c[j>>2]=c[p>>2]|0;c[j+4>>2]=c[p+4>>2]|0;c[j+8>>2]=c[p+8>>2]|0;u=w;c[p>>2]=c[u>>2]|0;c[p+4>>2]=c[u+4>>2]|0;c[p+8>>2]=c[u+8>>2]|0;c[u>>2]=c[j>>2]|0;c[u+4>>2]=c[j+4>>2]|0;c[u+8>>2]=c[j+8>>2]|0;if(!(bI[c[d>>2]&2047](m,a)|0)){break}u=a;c[g>>2]=c[u>>2]|0;c[g+4>>2]=c[u+4>>2]|0;c[g+8>>2]=c[u+8>>2]|0;c[u>>2]=c[p>>2]|0;c[u+4>>2]=c[p+4>>2]|0;c[u+8>>2]=c[p+8>>2]|0;c[p>>2]=c[g>>2]|0;c[p+4>>2]=c[g+4>>2]|0;c[p+8>>2]=c[g+8>>2]|0}}while(0);g=a+36|0;if((g|0)==(b|0)){y=1;i=e;return y|0}m=v;j=w;w=0;r=g;while(1){if(bI[c[d>>2]&2047](r,j)|0){g=r;c[m>>2]=c[g>>2]|0;c[m+4>>2]=c[g+4>>2]|0;c[m+8>>2]=c[g+8>>2]|0;g=j;h=r;while(1){f=h;C=g;c[f>>2]=c[C>>2]|0;c[f+4>>2]=c[C+4>>2]|0;c[f+8>>2]=c[C+8>>2]|0;if((g|0)==(a|0)){break}f=g-12|0;if(bI[c[d>>2]&2047](v,f)|0){h=g;g=f}else{break}}c[C>>2]=c[m>>2]|0;c[C+4>>2]=c[m+4>>2]|0;c[C+8>>2]=c[m+8>>2]|0;g=w+1|0;if((g|0)==8){break}else{D=g}}else{D=w}g=r+12|0;if((g|0)==(b|0)){y=1;E=1448;break}else{j=r;w=D;r=g}}if((E|0)==1448){i=e;return y|0}y=(r+12|0)==(b|0);i=e;return y|0}return 0}function dy(a){a=a|0;pT(a);return}function dz(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;if((c[b+28>>2]|0)!=0){bc(9900,72,12492,10204)}e=b+12|0;f=c[e>>2]|0;g=bu[c[(c[f>>2]|0)+12>>2]&2047](f)|0;f=b+24|0;b=c[f>>2]|0;h=b;i=g*28&-1;L1998:do{if((i|0)!=0){do{if((i|0)>0){if((i|0)<=640){break}pR(h);break L1998}else{bc(3640,164,14896,6328)}}while(0);g=a[i+18664|0]|0;if((g&255)>=14){bc(3640,173,14896,4712)}j=d+12+((g&255)<<2)|0;c[b>>2]=c[j>>2]|0;c[j>>2]=b}}while(0);c[f>>2]=0;f=c[e>>2]|0;b=c[f+4>>2]|0;if((b|0)==1){bs[c[c[f>>2]>>2]&2047](f);i=a[18712]|0;if((i&255)>=14){bc(3640,173,14896,4712)}h=d+12+((i&255)<<2)|0;c[f>>2]=c[h>>2]|0;c[h>>2]=f;c[e>>2]=0;return}else if((b|0)==0){bs[c[c[f>>2]>>2]&2047](f);h=a[18684]|0;if((h&255)>=14){bc(3640,173,14896,4712)}i=d+12+((h&255)<<2)|0;c[f>>2]=c[i>>2]|0;c[i>>2]=f;c[e>>2]=0;return}else if((b|0)==2){bs[c[c[f>>2]>>2]&2047](f);i=a[18816]|0;if((i&255)>=14){bc(3640,173,14896,4712)}h=d+12+((i&255)<<2)|0;c[f>>2]=c[h>>2]|0;c[h>>2]=f;c[e>>2]=0;return}else if((b|0)==3){bs[c[c[f>>2]>>2]&2047](f);b=a[18704]|0;if((b&255)>=14){bc(3640,173,14896,4712)}h=d+12+((b&255)<<2)|0;c[f>>2]=c[h>>2]|0;c[h>>2]=f;c[e>>2]=0;return}else{bc(9900,115,12492,9296);c[e>>2]=0;return}}function dA(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0.0,M=0.0,N=0,O=0,P=0;f=i;i=i+40|0;h=f|0;j=f+16|0;l=f+32|0;m=a+28|0;if((c[m>>2]|0)<=0){i=f;return}n=a+24|0;o=a+12|0;a=h|0;p=j|0;q=h+4|0;r=j+4|0;s=h+8|0;t=j+8|0;u=h+12|0;v=j+12|0;w=e|0;x=d|0;y=e+4|0;z=d+4|0;A=l|0;B=l+4|0;C=b|0;D=b+40|0;E=b+36|0;F=b+32|0;b=0;while(1){G=c[n>>2]|0;H=c[o>>2]|0;I=G+(b*28&-1)+20|0;bR[c[(c[H>>2]|0)+24>>2]&2047](H,h,d,c[I>>2]|0);H=c[o>>2]|0;bR[c[(c[H>>2]|0)+24>>2]&2047](H,j,e,c[I>>2]|0);I=G+(b*28&-1)|0;J=+g[a>>2];K=+g[p>>2];L=+g[q>>2];M=+g[r>>2];H=I;N=(g[k>>2]=J<K?J:K,c[k>>2]|0);O=(g[k>>2]=L<M?L:M,c[k>>2]|0)|0;c[H>>2]=0|N;c[H+4>>2]=O;M=+g[s>>2];L=+g[t>>2];K=+g[u>>2];J=+g[v>>2];O=G+(b*28&-1)+8|0;H=(g[k>>2]=M>L?M:L,c[k>>2]|0);N=(g[k>>2]=K>J?K:J,c[k>>2]|0)|0;c[O>>2]=0|H;c[O+4>>2]=N;J=+g[y>>2]- +g[z>>2];g[A>>2]=+g[w>>2]- +g[x>>2];g[B>>2]=J;N=c[G+(b*28&-1)+24>>2]|0;if(cn(C,N,I,l)|0){I=c[D>>2]|0;if((I|0)==(c[E>>2]|0)){G=c[F>>2]|0;c[E>>2]=I<<1;O=pQ(I<<3)|0;c[F>>2]=O;H=G;pY(O|0,H|0,c[D>>2]<<2);pR(H);P=c[D>>2]|0}else{P=I}c[(c[F>>2]|0)+(P<<2)>>2]=N;c[D>>2]=(c[D>>2]|0)+1|0}N=b+1|0;if((N|0)<(c[m>>2]|0)){b=N}else{break}}i=f;return}function dB(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;b=a+8|0;d=c[b>>2]|0;if((d|0)==0){return}e=c[d+112>>2]|0;if((e|0)==0){f=d}else{d=e;while(1){e=c[d+4>>2]|0;if((c[e+48>>2]|0)==(a|0)|(c[e+52>>2]|0)==(a|0)){g=e+4|0;c[g>>2]=c[g>>2]|8}g=c[d+12>>2]|0;if((g|0)==0){break}else{d=g}}f=c[b>>2]|0}b=c[f+88>>2]|0;if((b|0)==0){return}f=a+28|0;if((c[f>>2]|0)<=0){return}d=a+24|0;a=b+102912|0;g=b+102908|0;e=b+102904|0;b=0;h=c[a>>2]|0;while(1){i=c[(c[d>>2]|0)+(b*28&-1)+24>>2]|0;if((h|0)==(c[g>>2]|0)){j=c[e>>2]|0;c[g>>2]=h<<1;k=pQ(h<<3)|0;c[e>>2]=k;l=j;pY(k|0,l|0,c[a>>2]<<2);pR(l);m=c[a>>2]|0}else{m=h}c[(c[e>>2]|0)+(m<<2)>>2]=i;i=(c[a>>2]|0)+1|0;c[a>>2]=i;l=b+1|0;if((l|0)<(c[f>>2]|0)){b=l;h=i}else{break}}return}function dC(d,f){d=d|0;f=f|0;var j=0,l=0,m=0.0,n=0,o=0,p=0,q=0,r=0.0,s=0,t=0,u=0,w=0;j=i;c7(5376,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(4544,(v=i,i=i+8|0,h[k>>3]=+g[d+16>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(4040,(v=i,i=i+8|0,h[k>>3]=+g[d+20>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(3568,(v=i,i=i+8|0,h[k>>3]=+g[d>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(3216,(v=i,i=i+4|0,c[v>>2]=a[d+38|0]&1,v)|0);c7(2948,(v=i,i=i+4|0,c[v>>2]=e[d+32>>1]|0,v)|0);c7(2732,(v=i,i=i+4|0,c[v>>2]=e[d+34>>1]|0,v)|0);c7(10468,(v=i,i=i+4|0,c[v>>2]=b[d+36>>1]|0,v)|0);l=c[d+12>>2]|0;d=c[l+4>>2]|0;if((d|0)==0){c7(10284,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(9824,(v=i,i=i+8|0,h[k>>3]=+g[l+8>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);m=+g[l+16>>2];c7(9304,(v=i,i=i+16|0,h[k>>3]=+g[l+12>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=m,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0)}else if((d|0)==2){c7(7692,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(7376,(v=i,i=i+4|0,c[v>>2]=8,v)|0);n=l+148|0;o=c[n>>2]|0;L2073:do{if((o|0)>0){p=l+20|0;q=0;while(1){m=+g[p+(q<<3)>>2];r=+g[p+(q<<3)+4>>2];c7(7004,(v=i,i=i+20|0,c[v>>2]=q,h[k>>3]=m,c[v+4>>2]=c[k>>2]|0,c[v+8>>2]=c[k+4>>2]|0,h[k>>3]=r,c[v+12>>2]=c[k>>2]|0,c[v+16>>2]=c[k+4>>2]|0,v)|0);s=q+1|0;t=c[n>>2]|0;if((s|0)<(t|0)){q=s}else{u=t;break L2073}}}else{u=o}}while(0);c7(6760,(v=i,i=i+4|0,c[v>>2]=u,v)|0)}else if((d|0)==3){u=l;c7(6616,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);o=l+16|0;c7(7376,(v=i,i=i+4|0,c[v>>2]=c[o>>2]|0,v)|0);n=c[o>>2]|0;L2079:do{if((n|0)>0){q=l+12|0;p=0;while(1){t=c[q>>2]|0;r=+g[t+(p<<3)>>2];m=+g[t+(p<<3)+4>>2];c7(7004,(v=i,i=i+20|0,c[v>>2]=p,h[k>>3]=r,c[v+4>>2]=c[k>>2]|0,c[v+8>>2]=c[k+4>>2]|0,h[k>>3]=m,c[v+12>>2]=c[k>>2]|0,c[v+16>>2]=c[k+4>>2]|0,v)|0);t=p+1|0;s=c[o>>2]|0;if((t|0)<(s|0)){p=t}else{w=s;break L2079}}}else{w=n}}while(0);c7(6268,(v=i,i=i+4|0,c[v>>2]=w,v)|0);w=l+20|0;m=+g[w+4>>2];c7(6044,(v=i,i=i+16|0,h[k>>3]=+g[w>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=m,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);w=l+28|0;m=+g[w+4>>2];c7(5776,(v=i,i=i+16|0,h[k>>3]=+g[w>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=m,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);c7(5624,(v=i,i=i+4|0,c[v>>2]=a[l+36|0]&1,v)|0);c7(5488,(v=i,i=i+4|0,c[v>>2]=a[u+37|0]&1,v)|0)}else if((d|0)==1){c7(9096,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(9824,(v=i,i=i+8|0,h[k>>3]=+g[l+8>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);d=l+28|0;m=+g[d+4>>2];c7(8896,(v=i,i=i+16|0,h[k>>3]=+g[d>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=m,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);m=+g[l+16>>2];c7(8688,(v=i,i=i+16|0,h[k>>3]=+g[l+12>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=m,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);d=l+20|0;m=+g[d+4>>2];c7(8500,(v=i,i=i+16|0,h[k>>3]=+g[d>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=m,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);m=+g[l+40>>2];c7(8304,(v=i,i=i+16|0,h[k>>3]=+g[l+36>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=m,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);c7(8192,(v=i,i=i+4|0,c[v>>2]=a[l+44|0]&1,v)|0);c7(8e3,(v=i,i=i+4|0,c[v>>2]=a[l+45|0]&1,v)|0)}else{i=j;return}c7(5400,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(5268,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(5400,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(5088,(v=i,i=i+4|0,c[v>>2]=f,v)|0);i=j;return}function dD(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;i=b+40|0;c[i>>2]=d;c[b+44>>2]=e;c[b+48>>2]=f;c[b+28>>2]=0;c[b+36>>2]=0;c[b+32>>2]=0;j=b|0;c[j>>2]=g;c[b+4>>2]=h;h=d<<2;d=g+102796|0;k=c[d>>2]|0;if((k|0)<32){l=k}else{bc(3152,38,14548,4676);l=c[d>>2]|0}k=g+102412+(l*12&-1)|0;c[g+102412+(l*12&-1)+4>>2]=h;m=g+102400|0;n=c[m>>2]|0;if((n+h|0)>102400){c[k>>2]=pQ(h)|0;a[g+102412+(l*12&-1)+8|0]=1}else{c[k>>2]=g+n|0;a[g+102412+(l*12&-1)+8|0]=0;c[m>>2]=(c[m>>2]|0)+h|0}m=g+102404|0;l=(c[m>>2]|0)+h|0;c[m>>2]=l;m=g+102408|0;g=c[m>>2]|0;c[m>>2]=(g|0)>(l|0)?g:l;c[d>>2]=(c[d>>2]|0)+1|0;c[b+8>>2]=c[k>>2]|0;k=c[j>>2]|0;d=e<<2;e=k+102796|0;l=c[e>>2]|0;if((l|0)<32){o=l}else{bc(3152,38,14548,4676);o=c[e>>2]|0}l=k+102412+(o*12&-1)|0;c[k+102412+(o*12&-1)+4>>2]=d;g=k+102400|0;m=c[g>>2]|0;if((m+d|0)>102400){c[l>>2]=pQ(d)|0;a[k+102412+(o*12&-1)+8|0]=1}else{c[l>>2]=k+m|0;a[k+102412+(o*12&-1)+8|0]=0;c[g>>2]=(c[g>>2]|0)+d|0}g=k+102404|0;o=(c[g>>2]|0)+d|0;c[g>>2]=o;g=k+102408|0;k=c[g>>2]|0;c[g>>2]=(k|0)>(o|0)?k:o;c[e>>2]=(c[e>>2]|0)+1|0;c[b+12>>2]=c[l>>2]|0;l=c[j>>2]|0;e=f<<2;f=l+102796|0;o=c[f>>2]|0;if((o|0)<32){p=o}else{bc(3152,38,14548,4676);p=c[f>>2]|0}o=l+102412+(p*12&-1)|0;c[l+102412+(p*12&-1)+4>>2]=e;k=l+102400|0;g=c[k>>2]|0;if((g+e|0)>102400){c[o>>2]=pQ(e)|0;a[l+102412+(p*12&-1)+8|0]=1}else{c[o>>2]=l+g|0;a[l+102412+(p*12&-1)+8|0]=0;c[k>>2]=(c[k>>2]|0)+e|0}k=l+102404|0;p=(c[k>>2]|0)+e|0;c[k>>2]=p;k=l+102408|0;l=c[k>>2]|0;c[k>>2]=(l|0)>(p|0)?l:p;c[f>>2]=(c[f>>2]|0)+1|0;c[b+16>>2]=c[o>>2]|0;o=c[j>>2]|0;f=(c[i>>2]|0)*12&-1;p=o+102796|0;l=c[p>>2]|0;if((l|0)<32){q=l}else{bc(3152,38,14548,4676);q=c[p>>2]|0}l=o+102412+(q*12&-1)|0;c[o+102412+(q*12&-1)+4>>2]=f;k=o+102400|0;e=c[k>>2]|0;if((e+f|0)>102400){c[l>>2]=pQ(f)|0;a[o+102412+(q*12&-1)+8|0]=1}else{c[l>>2]=o+e|0;a[o+102412+(q*12&-1)+8|0]=0;c[k>>2]=(c[k>>2]|0)+f|0}k=o+102404|0;q=(c[k>>2]|0)+f|0;c[k>>2]=q;k=o+102408|0;o=c[k>>2]|0;c[k>>2]=(o|0)>(q|0)?o:q;c[p>>2]=(c[p>>2]|0)+1|0;c[b+24>>2]=c[l>>2]|0;l=c[j>>2]|0;j=(c[i>>2]|0)*12&-1;i=l+102796|0;p=c[i>>2]|0;if((p|0)<32){r=p}else{bc(3152,38,14548,4676);r=c[i>>2]|0}p=l+102412+(r*12&-1)|0;c[l+102412+(r*12&-1)+4>>2]=j;q=l+102400|0;o=c[q>>2]|0;if((o+j|0)>102400){c[p>>2]=pQ(j)|0;a[l+102412+(r*12&-1)+8|0]=1;k=l+102404|0;f=c[k>>2]|0;e=f+j|0;c[k>>2]=e;g=l+102408|0;d=c[g>>2]|0;m=(d|0)>(e|0);h=m?d:e;c[g>>2]=h;n=c[i>>2]|0;s=n+1|0;c[i>>2]=s;t=p|0;u=c[t>>2]|0;v=u;w=b+20|0;c[w>>2]=v;return}else{c[p>>2]=l+o|0;a[l+102412+(r*12&-1)+8|0]=0;c[q>>2]=(c[q>>2]|0)+j|0;k=l+102404|0;f=c[k>>2]|0;e=f+j|0;c[k>>2]=e;g=l+102408|0;d=c[g>>2]|0;m=(d|0)>(e|0);h=m?d:e;c[g>>2]=h;n=c[i>>2]|0;s=n+1|0;c[i>>2]=s;t=p|0;u=c[t>>2]|0;v=u;w=b+20|0;c[w>>2]=v;return}}function dE(d,e,f,h,j){d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;var l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0.0,D=0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0,R=0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0.0,af=0.0,ag=0;l=i;i=i+148|0;m=l|0;n=l+20|0;o=l+52|0;p=l+96|0;q=+g[f>>2];r=d+28|0;L2126:do{if((c[r>>2]|0)>0){s=d+8|0;t=h|0;u=h+4|0;v=d+20|0;w=d+24|0;x=0;while(1){y=c[(c[s>>2]|0)+(x<<2)>>2]|0;z=y+44|0;A=c[z>>2]|0;B=c[z+4>>2]|0;C=+g[y+56>>2];z=y+64|0;D=c[z+4>>2]|0;E=(c[k>>2]=c[z>>2]|0,+g[k>>2]);F=(c[k>>2]=D,+g[k>>2]);G=+g[y+72>>2];D=y+36|0;c[D>>2]=A;c[D+4>>2]=B;g[y+52>>2]=C;if((c[y>>2]|0)==2){H=+g[y+140>>2];I=+g[y+120>>2];J=1.0-q*+g[y+132>>2];K=J<1.0?J:1.0;J=K<0.0?0.0:K;K=1.0-q*+g[y+136>>2];L=K<1.0?K:1.0;M=(G+q*+g[y+128>>2]*+g[y+84>>2])*(L<0.0?0.0:L);N=(E+q*(H*+g[t>>2]+I*+g[y+76>>2]))*J;O=(F+q*(H*+g[u>>2]+I*+g[y+80>>2]))*J}else{M=G;N=E;O=F}y=(c[v>>2]|0)+(x*12&-1)|0;c[y>>2]=A;c[y+4>>2]=B;g[(c[v>>2]|0)+(x*12&-1)+8>>2]=C;B=(c[w>>2]|0)+(x*12&-1)|0;y=(g[k>>2]=N,c[k>>2]|0);A=(g[k>>2]=O,c[k>>2]|0)|0;c[B>>2]=0|y;c[B+4>>2]=A;g[(c[w>>2]|0)+(x*12&-1)+8>>2]=M;A=x+1|0;if((A|0)<(c[r>>2]|0)){x=A}else{P=v;R=w;break L2126}}}else{P=d+20|0;R=d+24|0}}while(0);h=n;w=f;c[h>>2]=c[w>>2]|0;c[h+4>>2]=c[w+4>>2]|0;c[h+8>>2]=c[w+8>>2]|0;c[h+12>>2]=c[w+12>>2]|0;c[h+16>>2]=c[w+16>>2]|0;c[h+20>>2]=c[w+20>>2]|0;h=c[P>>2]|0;c[n+24>>2]=h;v=c[R>>2]|0;c[n+28>>2]=v;x=o;c[x>>2]=c[w>>2]|0;c[x+4>>2]=c[w+4>>2]|0;c[x+8>>2]=c[w+8>>2]|0;c[x+12>>2]=c[w+12>>2]|0;c[x+16>>2]=c[w+16>>2]|0;c[x+20>>2]=c[w+20>>2]|0;w=d+12|0;c[o+24>>2]=c[w>>2]|0;x=d+36|0;c[o+28>>2]=c[x>>2]|0;c[o+32>>2]=h;c[o+36>>2]=v;c[o+40>>2]=c[d>>2]|0;ef(p,o);eh(p);if((a[f+20|0]&1)<<24>>24!=0){eg(p)}o=d+32|0;L2139:do{if((c[o>>2]|0)>0){v=d+16|0;h=0;while(1){u=c[(c[v>>2]|0)+(h<<2)>>2]|0;bt[c[(c[u>>2]|0)+28>>2]&2047](u,n);u=h+1|0;if((u|0)<(c[o>>2]|0)){h=u}else{break L2139}}}}while(0);g[e+12>>2]=0.0;h=f+12|0;L2145:do{if((c[h>>2]|0)>0){v=d+16|0;u=0;while(1){L2149:do{if((c[o>>2]|0)>0){t=0;while(1){s=c[(c[v>>2]|0)+(t<<2)>>2]|0;bt[c[(c[s>>2]|0)+32>>2]&2047](s,n);s=t+1|0;if((s|0)<(c[o>>2]|0)){t=s}else{break L2149}}}}while(0);ei(p);t=u+1|0;if((t|0)<(c[h>>2]|0)){u=t}else{break L2145}}}}while(0);h=c[p+48>>2]|0;L2156:do{if((h|0)>0){u=c[p+40>>2]|0;v=c[p+44>>2]|0;t=0;while(1){s=c[v+(c[u+(t*152&-1)+148>>2]<<2)>>2]|0;A=u+(t*152&-1)+144|0;L2160:do{if((c[A>>2]|0)>0){B=0;while(1){g[s+64+(B*20&-1)+8>>2]=+g[u+(t*152&-1)+(B*36&-1)+16>>2];g[s+64+(B*20&-1)+12>>2]=+g[u+(t*152&-1)+(B*36&-1)+20>>2];y=B+1|0;if((y|0)<(c[A>>2]|0)){B=y}else{break L2160}}}}while(0);A=t+1|0;if((A|0)<(h|0)){t=A}else{break L2156}}}}while(0);g[e+16>>2]=0.0;L2165:do{if((c[r>>2]|0)>0){h=0;while(1){t=c[P>>2]|0;u=t+(h*12&-1)|0;v=c[u+4>>2]|0;M=(c[k>>2]=c[u>>2]|0,+g[k>>2]);O=(c[k>>2]=v,+g[k>>2]);N=+g[t+(h*12&-1)+8>>2];t=c[R>>2]|0;v=t+(h*12&-1)|0;A=c[v+4>>2]|0;C=(c[k>>2]=c[v>>2]|0,+g[k>>2]);F=(c[k>>2]=A,+g[k>>2]);E=+g[t+(h*12&-1)+8>>2];G=q*C;J=q*F;I=G*G+J*J;if(I>4.0){J=2.0/+Q(+I);U=C*J;V=F*J}else{U=C;V=F}F=q*E;if(F*F>2.4674012660980225){if(F>0.0){W=F}else{W=-0.0-F}X=E*(1.5707963705062866/W)}else{X=E}t=(g[k>>2]=M+q*U,c[k>>2]|0);A=(g[k>>2]=O+q*V,c[k>>2]|0)|0;c[u>>2]=0|t;c[u+4>>2]=A;g[(c[P>>2]|0)+(h*12&-1)+8>>2]=N+q*X;A=(c[R>>2]|0)+(h*12&-1)|0;u=(g[k>>2]=U,c[k>>2]|0);t=(g[k>>2]=V,c[k>>2]|0)|0;c[A>>2]=0|u;c[A+4>>2]=t;g[(c[R>>2]|0)+(h*12&-1)+8>>2]=X;t=h+1|0;if((t|0)<(c[r>>2]|0)){h=t}else{break L2165}}}}while(0);h=f+16|0;f=d+16|0;t=0;while(1){if((t|0)>=(c[h>>2]|0)){Y=1;break}A=ej(p)|0;L2182:do{if((c[o>>2]|0)>0){u=1;v=0;while(1){s=c[(c[f>>2]|0)+(v<<2)>>2]|0;B=u&bI[c[(c[s>>2]|0)+36>>2]&2047](s,n);s=v+1|0;if((s|0)<(c[o>>2]|0)){u=B;v=s}else{Z=B;break L2182}}}else{Z=1}}while(0);if(A&Z){Y=0;break}else{t=t+1|0}}L2188:do{if((c[r>>2]|0)>0){t=d+8|0;Z=0;while(1){o=c[(c[t>>2]|0)+(Z<<2)>>2]|0;n=(c[P>>2]|0)+(Z*12&-1)|0;f=o+44|0;h=c[n>>2]|0;v=c[n+4>>2]|0;c[f>>2]=h;c[f+4>>2]=v;X=+g[(c[P>>2]|0)+(Z*12&-1)+8>>2];g[o+56>>2]=X;f=(c[R>>2]|0)+(Z*12&-1)|0;n=o+64|0;u=c[f+4>>2]|0;c[n>>2]=c[f>>2]|0;c[n+4>>2]=u;g[o+72>>2]=+g[(c[R>>2]|0)+(Z*12&-1)+8>>2];V=+T(+X);g[o+20>>2]=V;U=+S(+X);g[o+24>>2]=U;X=+g[o+28>>2];W=+g[o+32>>2];N=(c[k>>2]=h,+g[k>>2])-(U*X-V*W);O=(c[k>>2]=v,+g[k>>2])-(V*X+U*W);v=o+12|0;o=(g[k>>2]=N,c[k>>2]|0);h=(g[k>>2]=O,c[k>>2]|0)|0;c[v>>2]=0|o;c[v+4>>2]=h;h=Z+1|0;if((h|0)<(c[r>>2]|0)){Z=h}else{break L2188}}}}while(0);g[e+20>>2]=0.0;e=c[p+40>>2]|0;R=d+4|0;L2193:do{if((c[R>>2]|0)!=0){if((c[x>>2]|0)<=0){break}P=m+16|0;Z=0;while(1){t=c[(c[w>>2]|0)+(Z<<2)>>2]|0;A=c[e+(Z*152&-1)+144>>2]|0;c[P>>2]=A;L2198:do{if((A|0)>0){h=0;while(1){g[m+(h<<2)>>2]=+g[e+(Z*152&-1)+(h*36&-1)+16>>2];g[m+8+(h<<2)>>2]=+g[e+(Z*152&-1)+(h*36&-1)+20>>2];v=h+1|0;if((v|0)==(A|0)){break L2198}else{h=v}}}}while(0);A=c[R>>2]|0;bO[c[(c[A>>2]|0)+20>>2]&2047](A,t,m);A=Z+1|0;if((A|0)<(c[x>>2]|0)){Z=A}else{break L2193}}}}while(0);if(!j){_=p+32|0;$=c[_>>2]|0;aa=e;c8($,aa);ab=p+36|0;ac=c[ab>>2]|0;ad=ac;c8($,ad);i=l;return}j=c[r>>2]|0;L2207:do{if((j|0)>0){x=d+8|0;O=3.4028234663852886e+38;m=0;while(1){R=c[(c[x>>2]|0)+(m<<2)>>2]|0;L2211:do{if((c[R>>2]|0)==0){ae=O}else{do{if((b[R+4>>1]&4)<<16>>16!=0){N=+g[R+72>>2];if(N*N>.001218469929881394){break}N=+g[R+64>>2];W=+g[R+68>>2];if(N*N+W*W>9999999747378752.0e-20){break}w=R+144|0;W=q+ +g[w>>2];g[w>>2]=W;ae=O<W?O:W;break L2211}}while(0);g[R+144>>2]=0.0;ae=0.0}}while(0);R=m+1|0;t=c[r>>2]|0;if((R|0)<(t|0)){O=ae;m=R}else{af=ae;ag=t;break L2207}}}else{af=3.4028234663852886e+38;ag=j}}while(0);if(!((ag|0)>0&((af<.5|Y)^1))){_=p+32|0;$=c[_>>2]|0;aa=e;c8($,aa);ab=p+36|0;ac=c[ab>>2]|0;ad=ac;c8($,ad);i=l;return}Y=d+8|0;d=0;while(1){ag=c[(c[Y>>2]|0)+(d<<2)>>2]|0;j=ag+4|0;b[j>>1]=b[j>>1]&-3;g[ag+144>>2]=0.0;pZ(ag+64|0,0,24);ag=d+1|0;if((ag|0)<(c[r>>2]|0)){d=ag}else{break}}_=p+32|0;$=c[_>>2]|0;aa=e;c8($,aa);ab=p+36|0;ac=c[ab>>2]|0;ad=ac;c8($,ad);i=l;return}function dF(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0;e=b|0;f=b+8|0;c[f>>2]=128;c[b+4>>2]=0;h=pQ(1024)|0;c[b>>2]=h;pZ(h|0,0,c[f>>2]<<3|0);pZ(b+12|0,0,56);if((a[18660]&1)<<24>>24==0){f=0;h=1;while(1){if((f|0)>=14){bc(3640,73,14816,8732)}if((h|0)>(c[19308+(f<<2)>>2]|0)){i=f+1|0;a[h+18664|0]=i&255;j=i}else{a[h+18664|0]=f&255;j=f}i=h+1|0;if((i|0)==641){break}else{f=j;h=i}}a[18660]=1}c[b+102468>>2]=0;c[b+102472>>2]=0;c[b+102476>>2]=0;c[b+102864>>2]=0;b4(b+102872|0);c[b+102932>>2]=0;c[b+102936>>2]=0;c[b+102940>>2]=2548;c[b+102944>>2]=2544;h=b+102948|0;c[b+102980>>2]=0;c[b+102984>>2]=0;pZ(h|0,0,20);a[b+102992|0]=1;a[b+102993|0]=1;a[b+102994|0]=0;a[b+102995|0]=1;a[b+102976|0]=1;j=d;d=b+102968|0;f=c[j+4>>2]|0;c[d>>2]=c[j>>2]|0;c[d+4>>2]=f;c[b+102868>>2]=4;g[b+102988>>2]=0.0;c[h>>2]=e;pZ(b+102996|0,0,32);return}function dG(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=b+102960|0;if((c[e>>2]|0)<=0){bc(8396,133,13120,7500)}f=b+102868|0;g=c[f>>2]|0;if((g&2|0)==0){h=g}else{bc(8396,134,13120,10004);h=c[f>>2]|0}if((h&2|0)!=0){return}h=d+108|0;f=c[h>>2]|0;L2249:do{if((f|0)!=0){g=b+102980|0;i=f;while(1){j=c[i+12>>2]|0;k=c[g>>2]|0;if((k|0)==0){l=i+4|0}else{m=i+4|0;bt[c[(c[k>>2]|0)+8>>2]&2047](k,c[m>>2]|0);l=m}dJ(b,c[l>>2]|0);c[h>>2]=j;if((j|0)==0){break L2249}else{i=j}}}}while(0);c[h>>2]=0;h=d+112|0;l=c[h>>2]|0;L2258:do{if((l|0)!=0){f=b+102872|0;i=l;while(1){g=c[i+12>>2]|0;dk(f,c[i+4>>2]|0);if((g|0)==0){break L2258}else{i=g}}}}while(0);c[h>>2]=0;h=d+100|0;l=c[h>>2]|0;L2263:do{if((l|0)==0){n=d+104|0}else{i=b+102980|0;f=b+102912|0;g=b+102904|0;j=b+102900|0;m=b+102872|0;k=b|0;o=d+104|0;p=l;while(1){q=c[p+4>>2]|0;r=c[i>>2]|0;if((r|0)!=0){bt[c[(c[r>>2]|0)+12>>2]&2047](r,p)}r=p+28|0;L2270:do{if((c[r>>2]|0)>0){s=p+24|0;t=0;while(1){u=(c[s>>2]|0)+(t*28&-1)+24|0;v=c[u>>2]|0;w=c[f>>2]|0;x=0;while(1){if((x|0)>=(w|0)){break}y=(c[g>>2]|0)+(x<<2)|0;if((c[y>>2]|0)==(v|0)){z=1664;break}else{x=x+1|0}}if((z|0)==1664){z=0;c[y>>2]=-1}c[j>>2]=(c[j>>2]|0)-1|0;cl(m,v);c[u>>2]=-1;x=t+1|0;if((x|0)<(c[r>>2]|0)){t=x}else{break L2270}}}}while(0);c[r>>2]=0;dz(p,k);t=a[18708]|0;if((t&255)>=14){bc(3640,173,14896,4712)}s=b+12+((t&255)<<2)|0;c[p>>2]=c[s>>2]|0;c[s>>2]=p;c[h>>2]=q;c[o>>2]=(c[o>>2]|0)-1|0;if((q|0)==0){n=o;break L2263}else{p=q}}}}while(0);c[h>>2]=0;c[n>>2]=0;n=d+92|0;h=c[n>>2]|0;y=d+96|0;if((h|0)!=0){c[h+96>>2]=c[y>>2]|0}h=c[y>>2]|0;if((h|0)!=0){c[h+92>>2]=c[n>>2]|0}n=b+102952|0;if((c[n>>2]|0)==(d|0)){c[n>>2]=c[y>>2]|0}c[e>>2]=(c[e>>2]|0)-1|0;e=a[18816]|0;if((e&255)>=14){bc(3640,173,14896,4712)}y=b+12+((e&255)<<2)|0;c[d>>2]=c[y>>2]|0;c[y>>2]=d;return}function dH(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0,N=0,O=0,P=0,R=0,U=0;f=i;i=i+116|0;h=f|0;j=f+20|0;l=f+64|0;m=a+28|0;n=c[m>>2]|0;if((n|0)>(d|0)){o=n}else{bc(8544,386,12764,10024);o=c[m>>2]|0}if((o|0)>(e|0)){p=o}else{bc(8544,387,12764,7516);p=c[m>>2]|0}L2306:do{if((p|0)>0){o=a+8|0;n=a+20|0;q=a+24|0;r=0;while(1){s=c[(c[o>>2]|0)+(r<<2)>>2]|0;t=s+44|0;u=(c[n>>2]|0)+(r*12&-1)|0;v=c[t+4>>2]|0;c[u>>2]=c[t>>2]|0;c[u+4>>2]=v;g[(c[n>>2]|0)+(r*12&-1)+8>>2]=+g[s+56>>2];v=s+64|0;u=(c[q>>2]|0)+(r*12&-1)|0;t=c[v+4>>2]|0;c[u>>2]=c[v>>2]|0;c[u+4>>2]=t;g[(c[q>>2]|0)+(r*12&-1)+8>>2]=+g[s+72>>2];s=r+1|0;if((s|0)<(c[m>>2]|0)){r=s}else{w=n;x=q;break L2306}}}else{w=a+20|0;x=a+24|0}}while(0);p=a+12|0;c[j+24>>2]=c[p>>2]|0;q=a+36|0;c[j+28>>2]=c[q>>2]|0;c[j+40>>2]=c[a>>2]|0;n=j;r=b;c[n>>2]=c[r>>2]|0;c[n+4>>2]=c[r+4>>2]|0;c[n+8>>2]=c[r+8>>2]|0;c[n+12>>2]=c[r+12>>2]|0;c[n+16>>2]=c[r+16>>2]|0;c[n+20>>2]=c[r+20>>2]|0;c[j+32>>2]=c[w>>2]|0;c[j+36>>2]=c[x>>2]|0;ef(l,j);j=b+16|0;r=0;while(1){if((r|0)>=(c[j>>2]|0)){break}if(eo(l,d,e)|0){break}else{r=r+1|0}}r=a+8|0;j=(c[w>>2]|0)+(d*12&-1)|0;n=(c[(c[r>>2]|0)+(d<<2)>>2]|0)+36|0;o=c[j+4>>2]|0;c[n>>2]=c[j>>2]|0;c[n+4>>2]=o;g[(c[(c[r>>2]|0)+(d<<2)>>2]|0)+52>>2]=+g[(c[w>>2]|0)+(d*12&-1)+8>>2];d=(c[w>>2]|0)+(e*12&-1)|0;o=(c[(c[r>>2]|0)+(e<<2)>>2]|0)+36|0;n=c[d+4>>2]|0;c[o>>2]=c[d>>2]|0;c[o+4>>2]=n;g[(c[(c[r>>2]|0)+(e<<2)>>2]|0)+52>>2]=+g[(c[w>>2]|0)+(e*12&-1)+8>>2];eh(l);e=b+12|0;L2318:do{if((c[e>>2]|0)>0){n=0;while(1){ei(l);o=n+1|0;if((o|0)<(c[e>>2]|0)){n=o}else{break L2318}}}}while(0);y=+g[b>>2];L2323:do{if((c[m>>2]|0)>0){b=0;while(1){e=c[w>>2]|0;n=e+(b*12&-1)|0;o=c[n+4>>2]|0;z=(c[k>>2]=c[n>>2]|0,+g[k>>2]);A=(c[k>>2]=o,+g[k>>2]);B=+g[e+(b*12&-1)+8>>2];e=c[x>>2]|0;o=e+(b*12&-1)|0;d=c[o+4>>2]|0;C=(c[k>>2]=c[o>>2]|0,+g[k>>2]);D=(c[k>>2]=d,+g[k>>2]);E=+g[e+(b*12&-1)+8>>2];F=y*C;G=y*D;H=F*F+G*G;if(H>4.0){G=2.0/+Q(+H);I=C*G;J=D*G}else{I=C;J=D}D=y*E;if(D*D>2.4674012660980225){if(D>0.0){K=D}else{K=-0.0-D}L=E*(1.5707963705062866/K)}else{L=E}E=z+y*I;z=A+y*J;A=B+y*L;e=(g[k>>2]=E,c[k>>2]|0);d=0|e;e=(g[k>>2]=z,c[k>>2]|0)|0;c[n>>2]=d;c[n+4>>2]=e;g[(c[w>>2]|0)+(b*12&-1)+8>>2]=A;n=(c[x>>2]|0)+(b*12&-1)|0;o=(g[k>>2]=I,c[k>>2]|0);j=0|o;o=(g[k>>2]=J,c[k>>2]|0)|0;c[n>>2]=j;c[n+4>>2]=o;g[(c[x>>2]|0)+(b*12&-1)+8>>2]=L;n=c[(c[r>>2]|0)+(b<<2)>>2]|0;s=n+44|0;c[s>>2]=d;c[s+4>>2]=e;g[n+56>>2]=A;e=n+64|0;c[e>>2]=j;c[e+4>>2]=o;g[n+72>>2]=L;B=+T(+A);g[n+20>>2]=B;D=+S(+A);g[n+24>>2]=D;A=+g[n+28>>2];C=+g[n+32>>2];o=n+12|0;n=(g[k>>2]=E-(D*A-B*C),c[k>>2]|0);e=(g[k>>2]=z-(B*A+D*C),c[k>>2]|0)|0;c[o>>2]=0|n;c[o+4>>2]=e;e=b+1|0;if((e|0)<(c[m>>2]|0)){b=e}else{break L2323}}}}while(0);m=c[l+40>>2]|0;r=a+4|0;if((c[r>>2]|0)==0){M=l+32|0;N=c[M>>2]|0;O=m;c8(N,O);P=l+36|0;R=c[P>>2]|0;U=R;c8(N,U);i=f;return}if((c[q>>2]|0)<=0){M=l+32|0;N=c[M>>2]|0;O=m;c8(N,O);P=l+36|0;R=c[P>>2]|0;U=R;c8(N,U);i=f;return}a=h+16|0;x=0;while(1){w=c[(c[p>>2]|0)+(x<<2)>>2]|0;b=c[m+(x*152&-1)+144>>2]|0;c[a>>2]=b;L2344:do{if((b|0)>0){e=0;while(1){g[h+(e<<2)>>2]=+g[m+(x*152&-1)+(e*36&-1)+16>>2];g[h+8+(e<<2)>>2]=+g[m+(x*152&-1)+(e*36&-1)+20>>2];o=e+1|0;if((o|0)==(b|0)){break L2344}else{e=o}}}}while(0);b=c[r>>2]|0;bO[c[(c[b>>2]|0)+20>>2]&2047](b,w,h);b=x+1|0;if((b|0)<(c[q>>2]|0)){x=b}else{break}}M=l+32|0;N=c[M>>2]|0;O=m;c8(N,O);P=l+36|0;R=c[P>>2]|0;U=R;c8(N,U);i=f;return}function dI(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;b=c[a+102952>>2]|0;L2351:do{if((b|0)!=0){d=a|0;e=b;while(1){f=c[e+96>>2]|0;g=c[e+100>>2]|0;while(1){if((g|0)==0){break}h=c[g+4>>2]|0;c[g+28>>2]=0;dz(g,d);g=h}if((f|0)==0){break L2351}else{e=f}}}}while(0);pR(c[a+102904>>2]|0);pR(c[a+102916>>2]|0);pR(c[a+102876>>2]|0);if((c[a+102468>>2]|0)!=0){bc(3152,32,14508,8436)}if((c[a+102864>>2]|0)!=0){bc(3152,33,14508,5928)}b=a+4|0;e=a|0;a=c[e>>2]|0;if((c[b>>2]|0)>0){i=0;j=a}else{k=a;l=k;pR(l);return}while(1){pR(c[j+(i<<3)+4>>2]|0);a=i+1|0;d=c[e>>2]|0;if((a|0)<(c[b>>2]|0)){i=a;j=d}else{k=d;break}}l=k;pR(l);return}function dJ(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=d+102868|0;h=c[f>>2]|0;if((h&2|0)==0){i=h}else{bc(8396,274,13080,10004);i=c[f>>2]|0}if((i&2|0)!=0){return}i=a[e+61|0]&1;f=e+8|0;h=c[f>>2]|0;j=e+12|0;if((h|0)!=0){c[h+12>>2]=c[j>>2]|0}h=c[j>>2]|0;if((h|0)!=0){c[h+8>>2]=c[f>>2]|0}f=d+102956|0;if((c[f>>2]|0)==(e|0)){c[f>>2]=c[j>>2]|0}j=c[e+48>>2]|0;f=c[e+52>>2]|0;h=j+4|0;k=b[h>>1]|0;if((k&2)<<16>>16==0){b[h>>1]=k|2;g[j+144>>2]=0.0}k=f+4|0;h=b[k>>1]|0;if((h&2)<<16>>16==0){b[k>>1]=h|2;g[f+144>>2]=0.0}h=e+24|0;k=c[h>>2]|0;l=e+28|0;if((k|0)!=0){c[k+12>>2]=c[l>>2]|0}k=c[l>>2]|0;if((k|0)!=0){c[k+8>>2]=c[h>>2]|0}k=j+108|0;if((e+16|0)==(c[k>>2]|0)){c[k>>2]=c[l>>2]|0}c[h>>2]=0;c[l>>2]=0;l=e+40|0;h=c[l>>2]|0;k=e+44|0;if((h|0)!=0){c[h+12>>2]=c[k>>2]|0}h=c[k>>2]|0;if((h|0)!=0){c[h+8>>2]=c[l>>2]|0}h=f+108|0;if((e+32|0)==(c[h>>2]|0)){c[h>>2]=c[k>>2]|0}c[l>>2]=0;c[k>>2]=0;fb(e,d|0);e=d+102964|0;d=c[e>>2]|0;if((d|0)>0){m=d}else{bc(8396,346,13080,5292);m=c[e>>2]|0}c[e>>2]=m-1|0;if(i<<24>>24!=0){return}i=c[f+112>>2]|0;if((i|0)==0){return}else{n=i}while(1){if((c[n>>2]|0)==(j|0)){i=(c[n+4>>2]|0)+4|0;c[i>>2]=c[i>>2]|8}i=c[n+12>>2]|0;if((i|0)==0){break}else{n=i}}return}function dK(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;e=b+102868|0;f=c[e>>2]|0;if((f&2|0)==0){g=f}else{bc(8396,214,13156,10004);g=c[e>>2]|0}if((g&2|0)!=0){h=0;return h|0}g=fa(d,b|0)|0;c[g+8>>2]=0;e=b+102956|0;c[g+12>>2]=c[e>>2]|0;f=c[e>>2]|0;if((f|0)!=0){c[f+8>>2]=g}c[e>>2]=g;e=b+102964|0;c[e>>2]=(c[e>>2]|0)+1|0;e=g+16|0;c[g+20>>2]=g;b=g+52|0;c[e>>2]=c[b>>2]|0;c[g+24>>2]=0;f=g+48|0;i=c[f>>2]|0;j=i+108|0;c[g+28>>2]=c[j>>2]|0;k=c[j>>2]|0;if((k|0)==0){l=i}else{c[k+8>>2]=e;l=c[f>>2]|0}c[l+108>>2]=e;e=g+32|0;c[g+36>>2]=g;c[e>>2]=c[f>>2]|0;c[g+40>>2]=0;f=c[b>>2]|0;l=f+108|0;c[g+44>>2]=c[l>>2]|0;k=c[l>>2]|0;if((k|0)==0){m=f}else{c[k+8>>2]=e;m=c[b>>2]|0}c[m+108>>2]=e;e=c[d+8>>2]|0;if((a[d+16|0]&1)<<24>>24!=0){h=g;return h|0}m=c[(c[d+12>>2]|0)+112>>2]|0;if((m|0)==0){h=g;return h|0}else{n=m}while(1){if((c[n>>2]|0)==(e|0)){m=(c[n+4>>2]|0)+4|0;c[m>>2]=c[m>>2]|8}m=c[n+12>>2]|0;if((m|0)==0){h=g;break}else{n=m}}return h|0}function dL(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0;f=i;i=i+100|0;h=f|0;j=f+16|0;l=f+68|0;m=d+103008|0;g[m>>2]=0.0;n=d+103012|0;g[n>>2]=0.0;o=d+103016|0;g[o>>2]=0.0;p=d+102960|0;q=d+102872|0;r=d+68|0;dD(j,c[p>>2]|0,c[d+102936>>2]|0,c[d+102964>>2]|0,r,c[d+102944>>2]|0);s=d+102952|0;t=c[s>>2]|0;L2453:do{if((t|0)!=0){u=t;while(1){v=u+4|0;b[v>>1]=b[v>>1]&-2;v=c[u+96>>2]|0;if((v|0)==0){break L2453}else{u=v}}}}while(0);t=c[d+102932>>2]|0;L2457:do{if((t|0)!=0){u=t;while(1){v=u+4|0;c[v>>2]=c[v>>2]&-2;v=c[u+12>>2]|0;if((v|0)==0){break L2457}else{u=v}}}}while(0);t=c[d+102956>>2]|0;L2461:do{if((t|0)!=0){u=t;while(1){a[u+60|0]=0;v=c[u+12>>2]|0;if((v|0)==0){break L2461}else{u=v}}}}while(0);t=c[p>>2]|0;p=t<<2;u=d+102864|0;v=c[u>>2]|0;if((v|0)<32){w=v}else{bc(3152,38,14548,4676);w=c[u>>2]|0}v=d+102480+(w*12&-1)|0;c[d+102480+(w*12&-1)+4>>2]=p;x=d+102468|0;y=c[x>>2]|0;if((y+p|0)>102400){c[v>>2]=pQ(p)|0;a[d+102480+(w*12&-1)+8|0]=1}else{c[v>>2]=y+(d+68)|0;a[d+102480+(w*12&-1)+8|0]=0;c[x>>2]=(c[x>>2]|0)+p|0}x=d+102472|0;w=(c[x>>2]|0)+p|0;c[x>>2]=w;x=d+102476|0;p=c[x>>2]|0;c[x>>2]=(p|0)>(w|0)?p:w;c[u>>2]=(c[u>>2]|0)+1|0;u=c[v>>2]|0;v=u;w=c[s>>2]|0;L2473:do{if((w|0)!=0){p=j+28|0;x=j+36|0;y=j+32|0;z=j+40|0;A=j+8|0;B=j+48|0;C=j+16|0;D=j+44|0;E=j+12|0;F=d+102968|0;G=d+102976|0;H=l+12|0;I=l+16|0;J=l+20|0;K=w;while(1){L=K+4|0;L2477:do{if((b[L>>1]&35)<<16>>16==34){if((c[K>>2]|0)==0){break}c[p>>2]=0;c[x>>2]=0;c[y>>2]=0;c[v>>2]=K;b[L>>1]=b[L>>1]|1;M=1;while(1){N=M-1|0;O=c[v+(N<<2)>>2]|0;P=O+4|0;if((b[P>>1]&32)<<16>>16==0){bc(8396,445,13040,4496)}Q=c[p>>2]|0;if((Q|0)<(c[z>>2]|0)){R=Q}else{bc(6512,54,12888,5744);R=c[p>>2]|0}c[O+8>>2]=R;c[(c[A>>2]|0)+(c[p>>2]<<2)>>2]=O;c[p>>2]=(c[p>>2]|0)+1|0;Q=b[P>>1]|0;if((Q&2)<<16>>16==0){b[P>>1]=Q|2;g[O+144>>2]=0.0}L2492:do{if((c[O>>2]|0)==0){U=N}else{Q=c[O+112>>2]|0;L2494:do{if((Q|0)==0){V=N}else{P=N;W=Q;while(1){X=c[W+4>>2]|0;Y=X+4|0;do{if((c[Y>>2]&7|0)==6){if((a[(c[X+48>>2]|0)+38|0]&1)<<24>>24!=0){Z=P;break}if((a[(c[X+52>>2]|0)+38|0]&1)<<24>>24!=0){Z=P;break}_=c[x>>2]|0;if((_|0)<(c[D>>2]|0)){$=_}else{bc(6512,62,12824,6008);$=c[x>>2]|0}c[x>>2]=$+1|0;c[(c[E>>2]|0)+($<<2)>>2]=X;c[Y>>2]=c[Y>>2]|1;_=c[W>>2]|0;aa=_+4|0;if((b[aa>>1]&1)<<16>>16!=0){Z=P;break}if((P|0)>=(t|0)){bc(8396,495,13040,4016)}c[v+(P<<2)>>2]=_;b[aa>>1]=b[aa>>1]|1;Z=P+1|0}else{Z=P}}while(0);Y=c[W+12>>2]|0;if((Y|0)==0){V=Z;break L2494}else{P=Z;W=Y}}}}while(0);Q=c[O+108>>2]|0;if((Q|0)==0){U=V;break}else{ab=V;ac=Q}while(1){Q=ac+4|0;W=c[Q>>2]|0;do{if((a[W+60|0]&1)<<24>>24==0){P=c[ac>>2]|0;Y=P+4|0;if((b[Y>>1]&32)<<16>>16==0){ad=ab;break}X=c[y>>2]|0;if((X|0)<(c[B>>2]|0)){ae=X}else{bc(6512,68,12856,6236);ae=c[y>>2]|0}c[y>>2]=ae+1|0;c[(c[C>>2]|0)+(ae<<2)>>2]=W;a[(c[Q>>2]|0)+60|0]=1;if((b[Y>>1]&1)<<16>>16!=0){ad=ab;break}if((ab|0)>=(t|0)){bc(8396,524,13040,4016)}c[v+(ab<<2)>>2]=P;b[Y>>1]=b[Y>>1]|1;ad=ab+1|0}else{ad=ab}}while(0);Q=c[ac+12>>2]|0;if((Q|0)==0){U=ad;break L2492}else{ab=ad;ac=Q}}}}while(0);if((U|0)>0){M=U}else{break}}dE(j,l,e,F,(a[G]&1)<<24>>24!=0);g[m>>2]=+g[H>>2]+ +g[m>>2];g[n>>2]=+g[I>>2]+ +g[n>>2];g[o>>2]=+g[J>>2]+ +g[o>>2];M=c[p>>2]|0;if((M|0)>0){af=0;ag=M}else{break}while(1){M=c[(c[A>>2]|0)+(af<<2)>>2]|0;if((c[M>>2]|0)==0){O=M+4|0;b[O>>1]=b[O>>1]&-2;ah=c[p>>2]|0}else{ah=ag}O=af+1|0;if((O|0)<(ah|0)){af=O;ag=ah}else{break L2477}}}}while(0);L=c[K+96>>2]|0;if((L|0)==0){break L2473}else{K=L}}}}while(0);c8(r,u);u=c[s>>2]|0;L2536:do{if((u|0)!=0){s=h+8|0;r=h+12|0;ah=h;ag=u;while(1){L2540:do{if((b[ag+4>>1]&1)<<16>>16!=0){if((c[ag>>2]|0)==0){break}ai=+g[ag+52>>2];aj=+T(+ai);g[s>>2]=aj;ak=+S(+ai);g[r>>2]=ak;ai=+g[ag+28>>2];al=+g[ag+32>>2];am=+g[ag+40>>2]-(aj*ai+ak*al);af=(g[k>>2]=+g[ag+36>>2]-(ak*ai-aj*al),c[k>>2]|0);o=(g[k>>2]=am,c[k>>2]|0)|0;c[ah>>2]=0|af;c[ah+4>>2]=o;o=(c[ag+88>>2]|0)+102872|0;af=c[ag+100>>2]|0;if((af|0)==0){break}n=ag+12|0;m=af;while(1){dA(m,o,h,n);af=c[m+4>>2]|0;if((af|0)==0){break L2540}else{m=af}}}}while(0);m=c[ag+96>>2]|0;if((m|0)==0){break L2536}else{ag=m}}}}while(0);dn(q|0,q);g[d+103020>>2]=0.0;d=j|0;c8(c[d>>2]|0,c[j+20>>2]|0);c8(c[d>>2]|0,c[j+24>>2]|0);c8(c[d>>2]|0,c[j+16>>2]|0);c8(c[d>>2]|0,c[j+12>>2]|0);c8(c[d>>2]|0,c[j+8>>2]|0);i=f;return}function dM(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0.0,ah=0,ai=0,aj=0,ak=0,al=0.0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0.0,av=0.0,aw=0.0,ax=0.0,ay=0,az=0.0,aA=0.0,aB=0,aC=0,aD=0.0,aE=0.0,aF=0.0,aG=0.0,aH=0.0,aI=0,aJ=0,aK=0.0,aL=0,aM=0,aN=0,aO=0.0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0.0,a2=0,a3=0,a4=0;f=i;i=i+348|0;h=f|0;j=f+16|0;l=f+68|0;m=f+200|0;n=f+208|0;o=f+244|0;p=f+280|0;q=f+288|0;r=f+324|0;s=d+102872|0;t=d+102944|0;dD(j,64,32,0,d+68|0,c[t>>2]|0);u=d+102995|0;L2551:do{if((a[u]&1)<<24>>24==0){v=d+102932|0}else{w=c[d+102952>>2]|0;L2554:do{if((w|0)!=0){x=w;while(1){y=x+4|0;b[y>>1]=b[y>>1]&-2;g[x+60>>2]=0.0;y=c[x+96>>2]|0;if((y|0)==0){break L2554}else{x=y}}}}while(0);w=d+102932|0;x=c[w>>2]|0;if((x|0)==0){v=w;break}else{z=x}while(1){x=z+4|0;c[x>>2]=c[x>>2]&-34;c[z+128>>2]=0;g[z+132>>2]=1.0;x=c[z+12>>2]|0;if((x|0)==0){v=w;break L2551}else{z=x}}}}while(0);z=n;n=o;o=j+28|0;w=j+36|0;x=j+32|0;y=j+40|0;A=j+8|0;B=j+44|0;C=j+12|0;D=p|0;E=p+4|0;F=q;q=e|0;G=r|0;H=r+4|0;I=r+8|0;J=r+16|0;K=e+12|0;e=r+12|0;L=r+20|0;M=s|0;N=d+102994|0;d=h+8|0;O=h+12|0;P=h;Q=l+16|0;R=l+20|0;U=l+24|0;V=l+44|0;W=l+48|0;X=l+52|0;Y=l|0;Z=l+28|0;_=l+56|0;$=l+92|0;aa=l+128|0;ab=m|0;ac=m+4|0;while(1){ad=c[v>>2]|0;if((ad|0)==0){ae=1;af=2005;break}else{ag=1.0;ah=0;ai=ad}while(1){ad=ai+4|0;aj=c[ad>>2]|0;do{if((aj&4|0)==0){ak=ah;al=ag}else{if((c[ai+128>>2]|0)>8){ak=ah;al=ag;break}if((aj&32|0)==0){am=c[ai+48>>2]|0;an=c[ai+52>>2]|0;if((a[am+38|0]&1)<<24>>24!=0){ak=ah;al=ag;break}if((a[an+38|0]&1)<<24>>24!=0){ak=ah;al=ag;break}ao=c[am+8>>2]|0;ap=c[an+8>>2]|0;aq=c[ao>>2]|0;ar=c[ap>>2]|0;if(!((aq|0)==2|(ar|0)==2)){bc(8396,641,12996,3516)}as=b[ao+4>>1]|0;at=b[ap+4>>1]|0;if(!((as&2)<<16>>16!=0&(aq|0)!=0|(at&2)<<16>>16!=0&(ar|0)!=0)){ak=ah;al=ag;break}if(!((as&8)<<16>>16!=0|(aq|0)!=2|((at&8)<<16>>16!=0|(ar|0)!=2))){ak=ah;al=ag;break}ar=ao+28|0;at=ao+60|0;au=+g[at>>2];aq=ap+28|0;as=ap+60|0;av=+g[as>>2];do{if(au<av){if(au<1.0){aw=au}else{bc(6696,723,13256,3200);aw=+g[at>>2]}ax=(av-aw)/(1.0-aw);ay=ao+36|0;az=1.0-ax;aA=az*+g[ao+40>>2]+ax*+g[ao+48>>2];aB=ay;aC=(g[k>>2]=+g[ay>>2]*az+ax*+g[ao+44>>2],c[k>>2]|0);ay=(g[k>>2]=aA,c[k>>2]|0)|0;c[aB>>2]=0|aC;c[aB+4>>2]=ay;ay=ao+52|0;g[ay>>2]=az*+g[ay>>2]+ax*+g[ao+56>>2];g[at>>2]=av;aD=av}else{if(av>=au){aD=au;break}if(av<1.0){aE=av}else{bc(6696,723,13256,3200);aE=+g[as>>2]}ax=(au-aE)/(1.0-aE);ay=ap+36|0;az=1.0-ax;aA=az*+g[ap+40>>2]+ax*+g[ap+48>>2];aB=ay;aC=(g[k>>2]=+g[ay>>2]*az+ax*+g[ap+44>>2],c[k>>2]|0);ay=(g[k>>2]=aA,c[k>>2]|0)|0;c[aB>>2]=0|aC;c[aB+4>>2]=ay;ay=ap+52|0;g[ay>>2]=az*+g[ay>>2]+ax*+g[ap+56>>2];g[as>>2]=au;aD=au}}while(0);if(aD>=1.0){bc(8396,676,12996,3200)}as=c[ai+56>>2]|0;ap=c[ai+60>>2]|0;c[Q>>2]=0;c[R>>2]=0;g[U>>2]=0.0;c[V>>2]=0;c[W>>2]=0;g[X>>2]=0.0;ce(Y,c[am+12>>2]|0,as);ce(Z,c[an+12>>2]|0,ap);pY(_|0,ar|0,36);pY($|0,aq|0,36);g[aa>>2]=1.0;cu(m,l);if((c[ab>>2]|0)==3){au=aD+(1.0-aD)*+g[ac>>2];aF=au<1.0?au:1.0}else{aF=1.0}g[ai+132>>2]=aF;c[ad>>2]=c[ad>>2]|32;aG=aF}else{aG=+g[ai+132>>2]}if(aG>=ag){ak=ah;al=ag;break}ak=ai;al=aG}}while(0);ad=c[ai+12>>2]|0;if((ad|0)==0){break}else{ag=al;ah=ak;ai=ad}}if((ak|0)==0|al>.9999988079071045){ae=1;af=2004;break}ad=c[(c[ak+48>>2]|0)+8>>2]|0;aj=c[(c[ak+52>>2]|0)+8>>2]|0;ap=ad+28|0;pY(z|0,ap|0,36);as=aj+28|0;pY(n|0,as|0,36);at=ad+60|0;au=+g[at>>2];if(au<1.0){aH=au}else{bc(6696,723,13256,3200);aH=+g[at>>2]}au=(al-aH)/(1.0-aH);ao=ad+36|0;av=1.0-au;ay=ad+44|0;aB=ad+48|0;ax=+g[ao>>2]*av+au*+g[ay>>2];az=av*+g[ad+40>>2]+au*+g[aB>>2];aC=ao;ao=(g[k>>2]=ax,c[k>>2]|0);aI=0|ao;ao=(g[k>>2]=az,c[k>>2]|0)|0;c[aC>>2]=aI;c[aC+4>>2]=ao;aC=ad+52|0;aJ=ad+56|0;aA=av*+g[aC>>2]+au*+g[aJ>>2];g[aC>>2]=aA;g[at>>2]=al;at=ad+44|0;c[at>>2]=aI;c[at+4>>2]=ao;g[aJ>>2]=aA;au=+T(+aA);ao=ad+20|0;g[ao>>2]=au;av=+S(+aA);at=ad+24|0;g[at>>2]=av;aI=ad+28|0;aA=+g[aI>>2];aC=ad+32|0;aK=+g[aC>>2];aL=ad+12|0;aM=(g[k>>2]=ax-(av*aA-au*aK),c[k>>2]|0);aN=(g[k>>2]=az-(au*aA+av*aK),c[k>>2]|0)|0;c[aL>>2]=0|aM;c[aL+4>>2]=aN;aN=aj+60|0;aK=+g[aN>>2];if(aK<1.0){aO=aK}else{bc(6696,723,13256,3200);aO=+g[aN>>2]}aK=(al-aO)/(1.0-aO);aM=aj+36|0;av=1.0-aK;aP=aj+44|0;aQ=aj+48|0;aA=+g[aM>>2]*av+aK*+g[aP>>2];au=av*+g[aj+40>>2]+aK*+g[aQ>>2];aR=aM;aM=(g[k>>2]=aA,c[k>>2]|0);aS=0|aM;aM=(g[k>>2]=au,c[k>>2]|0)|0;c[aR>>2]=aS;c[aR+4>>2]=aM;aR=aj+52|0;aT=aj+56|0;az=av*+g[aR>>2]+aK*+g[aT>>2];g[aR>>2]=az;g[aN>>2]=al;aN=aj+44|0;c[aN>>2]=aS;c[aN+4>>2]=aM;g[aT>>2]=az;aK=+T(+az);aM=aj+20|0;g[aM>>2]=aK;av=+S(+az);aN=aj+24|0;g[aN>>2]=av;aS=aj+28|0;az=+g[aS>>2];aR=aj+32|0;ax=+g[aR>>2];aU=aj+12|0;aV=(g[k>>2]=aA-(av*az-aK*ax),c[k>>2]|0);aW=(g[k>>2]=au-(aK*az+av*ax),c[k>>2]|0)|0;c[aU>>2]=0|aV;c[aU+4>>2]=aW;ed(ak,c[t>>2]|0);aW=ak+4|0;aV=c[aW>>2]|0;c[aW>>2]=aV&-33;aX=ak+128|0;c[aX>>2]=(c[aX>>2]|0)+1|0;if((aV&6|0)!=6){c[aW>>2]=aV&-37;pY(ap|0,z|0,36);pY(as|0,n|0,36);ax=+g[aJ>>2];av=+T(+ax);g[ao>>2]=av;az=+S(+ax);g[at>>2]=az;ax=+g[aI>>2];aK=+g[aC>>2];au=+g[aB>>2]-(av*ax+az*aK);aB=(g[k>>2]=+g[ay>>2]-(az*ax-av*aK),c[k>>2]|0);ay=(g[k>>2]=au,c[k>>2]|0)|0;c[aL>>2]=0|aB;c[aL+4>>2]=ay;au=+g[aT>>2];aK=+T(+au);g[aM>>2]=aK;av=+S(+au);g[aN>>2]=av;au=+g[aS>>2];ax=+g[aR>>2];az=+g[aQ>>2]-(aK*au+av*ax);aQ=(g[k>>2]=+g[aP>>2]-(av*au-aK*ax),c[k>>2]|0);aP=(g[k>>2]=az,c[k>>2]|0)|0;c[aU>>2]=0|aQ;c[aU+4>>2]=aP;continue}aP=ad+4|0;aU=b[aP>>1]|0;if((aU&2)<<16>>16==0){b[aP>>1]=aU|2;g[ad+144>>2]=0.0}aU=aj+4|0;aQ=b[aU>>1]|0;if((aQ&2)<<16>>16==0){b[aU>>1]=aQ|2;g[aj+144>>2]=0.0}c[o>>2]=0;c[w>>2]=0;c[x>>2]=0;aQ=c[y>>2]|0;do{if((aQ|0)>0){aR=ad+8|0;c[aR>>2]=0;aS=c[A>>2]|0;c[aS>>2]=ad;c[o>>2]=1;if((aQ|0)>1){aY=aR;aZ=aS;break}else{a_=aR;a$=aS;af=1951;break}}else{bc(6512,54,12888,5744);aS=ad+8|0;c[aS>>2]=0;aR=c[A>>2]|0;c[aR>>2]=ad;c[o>>2]=1;a_=aS;a$=aR;af=1951;break}}while(0);if((af|0)==1951){af=0;bc(6512,54,12888,5744);aY=a_;aZ=a$}aQ=aj+8|0;c[aQ>>2]=1;c[aZ+4>>2]=aj;c[o>>2]=2;if((c[B>>2]|0)<=0){bc(6512,62,12824,6008)}c[w>>2]=1;c[c[C>>2]>>2]=ak;b[aP>>1]=b[aP>>1]|1;b[aU>>1]=b[aU>>1]|1;c[aW>>2]=c[aW>>2]|1;c[D>>2]=ad;c[E>>2]=aj;aR=1;aS=ad;while(1){L2635:do{if((c[aS>>2]|0)==2){aN=c[aS+112>>2]|0;if((aN|0)==0){break}aM=aS+4|0;aT=c[y>>2]|0;ay=aN;aN=c[o>>2]|0;while(1){if((aN|0)==(aT|0)){break L2635}aL=c[w>>2]|0;aB=c[B>>2]|0;if((aL|0)==(aB|0)){break L2635}aC=c[ay+4>>2]|0;aI=aC+4|0;L2642:do{if((c[aI>>2]&1|0)==0){at=c[ay>>2]|0;ao=at|0;do{if((c[ao>>2]|0)==2){if((b[aM>>1]&8)<<16>>16!=0){break}if((b[at+4>>1]&8)<<16>>16==0){a0=aN;break L2642}}}while(0);if((a[(c[aC+48>>2]|0)+38|0]&1)<<24>>24!=0){a0=aN;break}if((a[(c[aC+52>>2]|0)+38|0]&1)<<24>>24!=0){a0=aN;break}aJ=at+28|0;pY(F|0,aJ|0,36);as=at+4|0;if((b[as>>1]&1)<<16>>16==0){ap=at+60|0;az=+g[ap>>2];if(az<1.0){a1=az}else{bc(6696,723,13256,3200);a1=+g[ap>>2]}az=(al-a1)/(1.0-a1);aV=at+36|0;ax=1.0-az;aK=+g[aV>>2]*ax+az*+g[at+44>>2];au=ax*+g[at+40>>2]+az*+g[at+48>>2];aX=aV;aV=(g[k>>2]=aK,c[k>>2]|0);a2=0|aV;aV=(g[k>>2]=au,c[k>>2]|0)|0;c[aX>>2]=a2;c[aX+4>>2]=aV;aX=at+52|0;a3=at+56|0;av=ax*+g[aX>>2]+az*+g[a3>>2];g[aX>>2]=av;g[ap>>2]=al;ap=at+44|0;c[ap>>2]=a2;c[ap+4>>2]=aV;g[a3>>2]=av;az=+T(+av);g[at+20>>2]=az;ax=+S(+av);g[at+24>>2]=ax;av=+g[at+28>>2];aA=+g[at+32>>2];a3=at+12|0;aV=(g[k>>2]=aK-(ax*av-az*aA),c[k>>2]|0);ap=(g[k>>2]=au-(az*av+ax*aA),c[k>>2]|0)|0;c[a3>>2]=0|aV;c[a3+4>>2]=ap}ed(aC,c[t>>2]|0);ap=c[aI>>2]|0;if((ap&4|0)==0){pY(aJ|0,F|0,36);aA=+g[at+56>>2];ax=+T(+aA);g[at+20>>2]=ax;av=+S(+aA);g[at+24>>2]=av;aA=+g[at+28>>2];az=+g[at+32>>2];au=+g[at+48>>2]-(ax*aA+av*az);a3=at+12|0;aV=(g[k>>2]=+g[at+44>>2]-(av*aA-ax*az),c[k>>2]|0);a2=(g[k>>2]=au,c[k>>2]|0)|0;c[a3>>2]=0|aV;c[a3+4>>2]=a2;a0=aN;break}if((ap&2|0)==0){pY(aJ|0,F|0,36);au=+g[at+56>>2];az=+T(+au);g[at+20>>2]=az;ax=+S(+au);g[at+24>>2]=ax;au=+g[at+28>>2];aA=+g[at+32>>2];av=+g[at+48>>2]-(az*au+ax*aA);aJ=at+12|0;a2=(g[k>>2]=+g[at+44>>2]-(ax*au-az*aA),c[k>>2]|0);a3=(g[k>>2]=av,c[k>>2]|0)|0;c[aJ>>2]=0|a2;c[aJ+4>>2]=a3;a0=aN;break}c[aI>>2]=ap|1;if((aL|0)>=(aB|0)){bc(6512,62,12824,6008)}c[w>>2]=aL+1|0;c[(c[C>>2]|0)+(aL<<2)>>2]=aC;ap=b[as>>1]|0;if((ap&1)<<16>>16!=0){a0=aN;break}b[as>>1]=ap|1;do{if((c[ao>>2]|0)!=0){if((ap&2)<<16>>16!=0){break}b[as>>1]=ap|3;g[at+144>>2]=0.0}}while(0);if((aN|0)>=(aT|0)){bc(6512,54,12888,5744)}c[at+8>>2]=aN;c[(c[A>>2]|0)+(aN<<2)>>2]=at;ap=aN+1|0;c[o>>2]=ap;a0=ap}else{a0=aN}}while(0);aC=c[ay+12>>2]|0;if((aC|0)==0){break L2635}else{ay=aC;aN=a0}}}}while(0);if((aR|0)>=2){break}aN=c[p+(aR<<2)>>2]|0;aR=aR+1|0;aS=aN}av=(1.0-al)*+g[q>>2];g[G>>2]=av;g[H>>2]=1.0/av;g[I>>2]=1.0;c[J>>2]=20;c[e>>2]=c[K>>2]|0;a[L]=0;dH(j,r,c[aY>>2]|0,c[aQ>>2]|0);aS=c[o>>2]|0;L2680:do{if((aS|0)>0){aR=c[A>>2]|0;ad=0;while(1){aj=c[aR+(ad<<2)>>2]|0;aW=aj+4|0;b[aW>>1]=b[aW>>1]&-2;L2684:do{if((c[aj>>2]|0)==2){av=+g[aj+52>>2];aA=+T(+av);g[d>>2]=aA;az=+S(+av);g[O>>2]=az;av=+g[aj+28>>2];au=+g[aj+32>>2];ax=+g[aj+40>>2]-(aA*av+az*au);aW=(g[k>>2]=+g[aj+36>>2]-(az*av-aA*au),c[k>>2]|0);aU=(g[k>>2]=ax,c[k>>2]|0)|0;c[P>>2]=0|aW;c[P+4>>2]=aU;aU=(c[aj+88>>2]|0)+102872|0;aW=c[aj+100>>2]|0;L2686:do{if((aW|0)!=0){aP=aj+12|0;aN=aW;while(1){dA(aN,aU,h,aP);ay=c[aN+4>>2]|0;if((ay|0)==0){break L2686}else{aN=ay}}}}while(0);aU=c[aj+112>>2]|0;if((aU|0)==0){break}else{a4=aU}while(1){aU=(c[a4+4>>2]|0)+4|0;c[aU>>2]=c[aU>>2]&-34;aU=c[a4+12>>2]|0;if((aU|0)==0){break L2684}else{a4=aU}}}}while(0);aj=ad+1|0;if((aj|0)<(aS|0)){ad=aj}else{break L2680}}}}while(0);dn(M,s);if((a[N]&1)<<24>>24!=0){ae=0;af=2006;break}}if((af|0)==2004){a[u]=ae;N=j|0;s=c[N>>2]|0;M=j+20|0;a4=c[M>>2]|0;h=a4;c8(s,h);P=c[N>>2]|0;O=j+24|0;d=c[O>>2]|0;o=d;c8(P,o);aY=c[N>>2]|0;r=j+16|0;L=c[r>>2]|0;K=L;c8(aY,K);e=c[N>>2]|0;J=c[C>>2]|0;I=J;c8(e,I);H=c[A>>2]|0;G=H;c8(e,G);i=f;return}else if((af|0)==2005){a[u]=ae;N=j|0;s=c[N>>2]|0;M=j+20|0;a4=c[M>>2]|0;h=a4;c8(s,h);P=c[N>>2]|0;O=j+24|0;d=c[O>>2]|0;o=d;c8(P,o);aY=c[N>>2]|0;r=j+16|0;L=c[r>>2]|0;K=L;c8(aY,K);e=c[N>>2]|0;J=c[C>>2]|0;I=J;c8(e,I);H=c[A>>2]|0;G=H;c8(e,G);i=f;return}else if((af|0)==2006){a[u]=ae;N=j|0;s=c[N>>2]|0;M=j+20|0;a4=c[M>>2]|0;h=a4;c8(s,h);P=c[N>>2]|0;O=j+24|0;d=c[O>>2]|0;o=d;c8(P,o);aY=c[N>>2]|0;r=j+16|0;L=c[r>>2]|0;K=L;c8(aY,K);e=c[N>>2]|0;J=c[C>>2]|0;I=J;c8(e,I);H=c[A>>2]|0;G=H;c8(e,G);i=f;return}}function dN(b,d,e,f){b=b|0;d=+d;e=e|0;f=f|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0,q=0,r=0,s=0;h=i;i=i+24|0;j=h|0;k=b+102868|0;l=c[k>>2]|0;if((l&1|0)==0){m=l}else{l=b+102872|0;dn(l|0,l);l=c[k>>2]&-2;c[k>>2]=l;m=l}c[k>>2]=m|2;m=j|0;g[m>>2]=d;c[j+12>>2]=e;c[j+16>>2]=f;f=d>0.0;if(f){g[j+4>>2]=1.0/d}else{g[j+4>>2]=0.0}e=b+102988|0;g[j+8>>2]=+g[e>>2]*d;a[j+20|0]=a[b+102992|0]&1;dm(b+102872|0);g[b+103e3>>2]=0.0;if(!((a[b+102995|0]&1)<<24>>24==0|f^1)){dL(b,j);g[b+103004>>2]=0.0}do{if((a[b+102993|0]&1)<<24>>24==0){n=2017}else{d=+g[m>>2];if(d<=0.0){o=d;break}dM(b,j);g[b+103024>>2]=0.0;n=2017;break}}while(0);if((n|0)==2017){o=+g[m>>2]}if(o>0.0){g[e>>2]=+g[j+4>>2]}j=c[k>>2]|0;if((j&4|0)==0){p=j;q=p&-3;c[k>>2]=q;r=b+102996|0;g[r>>2]=0.0;i=h;return}e=c[b+102952>>2]|0;if((e|0)==0){p=j;q=p&-3;c[k>>2]=q;r=b+102996|0;g[r>>2]=0.0;i=h;return}else{s=e}while(1){g[s+76>>2]=0.0;g[s+80>>2]=0.0;g[s+84>>2]=0.0;e=c[s+96>>2]|0;if((e|0)==0){break}else{s=e}}p=c[k>>2]|0;q=p&-3;c[k>>2]=q;r=b+102996|0;g[r>>2]=0.0;i=h;return}function dO(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0,y=0,z=0,A=0.0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;f=i;i=i+112|0;h=f|0;j=f+8|0;l=f+16|0;m=f+24|0;n=f+32|0;o=f+40|0;p=f+48|0;q=c[b+12>>2]|0;b=c[q+4>>2]|0;if((b|0)==0){r=+g[d+12>>2];s=+g[q+12>>2];t=+g[d+8>>2];u=+g[q+16>>2];v=s*t+r*u+ +g[d+4>>2];g[h>>2]=+g[d>>2]+(r*s-t*u);g[h+4>>2]=v;v=+g[q+8>>2];g[j>>2]=r-t*0.0;g[j+4>>2]=t+r*0.0;w=c[a+102984>>2]|0;bp[c[(c[w>>2]|0)+20>>2]&2047](w,h,v,j,e);i=f;return}else if((b|0)==3){j=c[q+16>>2]|0;h=c[q+12>>2]|0;w=d+12|0;v=+g[w>>2];r=+g[h>>2];x=d+8|0;t=+g[x>>2];u=+g[h+4>>2];y=d|0;s=+g[y>>2];z=d+4|0;A=+g[z>>2];g[n>>2]=s+(v*r-t*u);g[n+4>>2]=r*t+v*u+A;if((j|0)<=1){i=f;return}B=o|0;C=o+4|0;D=a+102984|0;E=o;F=n;G=1;u=v;v=t;t=s;s=A;while(1){A=+g[h+(G<<3)>>2];r=+g[h+(G<<3)+4>>2];g[B>>2]=t+(u*A-v*r);g[C>>2]=A*v+u*r+s;H=c[D>>2]|0;bR[c[(c[H>>2]|0)+24>>2]&2047](H,n,o,e);H=c[D>>2]|0;bv[c[(c[H>>2]|0)+16>>2]&2047](H,n,.05000000074505806,e);H=c[E+4>>2]|0;c[F>>2]=c[E>>2]|0;c[F+4>>2]=H;H=G+1|0;if((H|0)==(j|0)){break}G=H;u=+g[w>>2];v=+g[x>>2];t=+g[y>>2];s=+g[z>>2]}i=f;return}else if((b|0)==2){z=c[q+148>>2]|0;do{if((z|0)<9){y=p|0;if((z|0)>0){I=y;J=2038;break}else{K=y;break}}else{bc(8396,1077,12920,2928);I=p|0;J=2038;break}}while(0);L2746:do{if((J|0)==2038){y=q+20|0;s=+g[d+12>>2];t=+g[d+8>>2];v=+g[d>>2];u=+g[d+4>>2];x=0;while(1){r=+g[y+(x<<3)>>2];A=+g[y+(x<<3)+4>>2];w=p+(x<<3)|0;G=(g[k>>2]=v+(s*r-t*A),c[k>>2]|0);j=(g[k>>2]=r*t+s*A+u,c[k>>2]|0)|0;c[w>>2]=0|G;c[w+4>>2]=j;j=x+1|0;if((j|0)==(z|0)){K=I;break L2746}else{x=j}}}}while(0);I=c[a+102984>>2]|0;bR[c[(c[I>>2]|0)+12>>2]&2047](I,K,z,e);i=f;return}else if((b|0)==1){u=+g[d+12>>2];s=+g[q+12>>2];t=+g[d+8>>2];v=+g[q+16>>2];A=+g[d>>2];r=+g[d+4>>2];g[l>>2]=A+(u*s-t*v);g[l+4>>2]=s*t+u*v+r;d=q+20|0;v=+g[d>>2];s=+g[d+4>>2];g[m>>2]=A+(u*v-t*s);g[m+4>>2]=v*t+u*s+r;d=c[a+102984>>2]|0;bR[c[(c[d>>2]|0)+24>>2]&2047](d,l,m,e);i=f;return}else{i=f;return}}function dP(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;d=i;i=i+60|0;e=d|0;f=d+8|0;h=d+16|0;j=d+24|0;k=d+32|0;l=d+44|0;m=d+52|0;n=(c[b+52>>2]|0)+12|0;o=(c[b+48>>2]|0)+12|0;p=e;q=c[o+4>>2]|0;c[p>>2]=c[o>>2]|0;c[p+4>>2]=q;q=n;n=f;p=c[q+4>>2]|0;c[n>>2]=c[q>>2]|0;c[n+4>>2]=p;p=b;bt[c[c[p>>2]>>2]&2047](h,b);bt[c[(c[p>>2]|0)+4>>2]&2047](j,b);g[k>>2]=.5;g[k+4>>2]=.800000011920929;g[k+8>>2]=.800000011920929;p=c[b+4>>2]|0;if((p|0)==3){n=c[a+102984>>2]|0;bR[c[(c[n>>2]|0)+24>>2]&2047](n,h,j,k);i=d;return}else if((p|0)==5){i=d;return}else if((p|0)==4){p=b+68|0;n=l;q=c[p+4>>2]|0;c[n>>2]=c[p>>2]|0;c[n+4>>2]=q;q=b+76|0;b=m;n=c[q+4>>2]|0;c[b>>2]=c[q>>2]|0;c[b+4>>2]=n;n=a+102984|0;b=c[n>>2]|0;bR[c[(c[b>>2]|0)+24>>2]&2047](b,l,h,k);b=c[n>>2]|0;bR[c[(c[b>>2]|0)+24>>2]&2047](b,m,j,k);b=c[n>>2]|0;bR[c[(c[b>>2]|0)+24>>2]&2047](b,l,m,k);i=d;return}else{m=a+102984|0;a=c[m>>2]|0;bR[c[(c[a>>2]|0)+24>>2]&2047](a,e,h,k);e=c[m>>2]|0;bR[c[(c[e>>2]|0)+24>>2]&2047](e,h,j,k);h=c[m>>2]|0;bR[c[(c[h>>2]|0)+24>>2]&2047](h,f,j,k);i=d;return}}function dQ(a){a=a|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0.0,R=0.0,S=0.0,T=0.0;d=i;i=i+120|0;e=d|0;f=d+12|0;h=d+24|0;j=d+36|0;k=d+48|0;l=d+60|0;m=d+72|0;n=d+104|0;o=a+102984|0;p=c[o>>2]|0;if((p|0)==0){i=d;return}q=c[p+4>>2]|0;L2768:do{if((q&1|0)!=0){p=c[a+102952>>2]|0;if((p|0)==0){break}r=e|0;s=e+4|0;t=e+8|0;u=j|0;v=j+4|0;w=j+8|0;x=k|0;y=k+4|0;z=k+8|0;A=f|0;B=f+4|0;C=f+8|0;D=h|0;E=h+4|0;F=h+8|0;G=p;while(1){p=G+12|0;H=c[G+100>>2]|0;L2773:do{if((H|0)!=0){I=G+4|0;J=G|0;K=H;while(1){L=b[I>>1]|0;do{if((L&32)<<16>>16==0){g[r>>2]=.5;g[s>>2]=.5;g[t>>2]=.30000001192092896;dO(a,K,p,e)}else{M=c[J>>2]|0;if((M|0)==0){g[A>>2]=.5;g[B>>2]=.8999999761581421;g[C>>2]=.5;dO(a,K,p,f);break}else if((M|0)==1){g[D>>2]=.5;g[E>>2]=.5;g[F>>2]=.8999999761581421;dO(a,K,p,h);break}else{if((L&2)<<16>>16==0){g[u>>2]=.6000000238418579;g[v>>2]=.6000000238418579;g[w>>2]=.6000000238418579;dO(a,K,p,j);break}else{g[x>>2]=.8999999761581421;g[y>>2]=.699999988079071;g[z>>2]=.699999988079071;dO(a,K,p,k);break}}}}while(0);L=c[K+4>>2]|0;if((L|0)==0){break L2773}else{K=L}}}}while(0);p=c[G+96>>2]|0;if((p|0)==0){break L2768}else{G=p}}}}while(0);L2790:do{if((q&2|0)!=0){k=c[a+102956>>2]|0;if((k|0)==0){break}else{N=k}while(1){dP(a,N);k=c[N+12>>2]|0;if((k|0)==0){break L2790}else{N=k}}}}while(0);L2795:do{if((q&8|0)!=0){N=a+102932|0;while(1){k=c[N>>2]|0;if((k|0)==0){break L2795}else{N=k+12|0}}}}while(0);L2800:do{if((q&4|0)!=0){g[l>>2]=.8999999761581421;g[l+4>>2]=.30000001192092896;g[l+8>>2]=.8999999761581421;N=c[a+102952>>2]|0;if((N|0)==0){break}k=a+102884|0;j=a+102876|0;h=m|0;f=m|0;e=m+4|0;G=m+8|0;z=m+12|0;y=m+16|0;x=m+20|0;w=m+24|0;v=m+28|0;u=N;while(1){L2805:do{if((b[u+4>>1]&32)<<16>>16!=0){N=c[u+100>>2]|0;if((N|0)==0){break}else{O=N}while(1){N=O+28|0;L2809:do{if((c[N>>2]|0)>0){F=O+24|0;E=0;while(1){D=c[(c[F>>2]|0)+(E*28&-1)+24>>2]|0;do{if((D|0)>-1){if((c[k>>2]|0)>(D|0)){break}else{P=2088;break}}else{P=2088}}while(0);if((P|0)==2088){P=0;bc(8144,159,12036,7720)}C=c[j>>2]|0;Q=+g[C+(D*36&-1)>>2];R=+g[C+(D*36&-1)+4>>2];S=+g[C+(D*36&-1)+8>>2];T=+g[C+(D*36&-1)+12>>2];g[f>>2]=Q;g[e>>2]=R;g[G>>2]=S;g[z>>2]=R;g[y>>2]=S;g[x>>2]=T;g[w>>2]=Q;g[v>>2]=T;C=c[o>>2]|0;bR[c[(c[C>>2]|0)+8>>2]&2047](C,h,4,l);C=E+1|0;if((C|0)<(c[N>>2]|0)){E=C}else{break L2809}}}}while(0);N=c[O+4>>2]|0;if((N|0)==0){break L2805}else{O=N}}}}while(0);N=c[u+96>>2]|0;if((N|0)==0){break L2800}else{u=N}}}}while(0);if((q&16|0)==0){i=d;return}q=c[a+102952>>2]|0;if((q|0)==0){i=d;return}a=n;O=n;l=q;while(1){q=l+12|0;c[a>>2]=c[q>>2]|0;c[a+4>>2]=c[q+4>>2]|0;c[a+8>>2]=c[q+8>>2]|0;c[a+12>>2]=c[q+12>>2]|0;q=l+44|0;P=c[q+4>>2]|0;c[O>>2]=c[q>>2]|0;c[O+4>>2]=P;P=c[o>>2]|0;bt[c[(c[P>>2]|0)+28>>2]&2047](P,n);P=c[l+96>>2]|0;if((P|0)==0){break}else{l=P}}i=d;return}function dR(a){a=a|0;var b=0,d=0.0,e=0,f=0,j=0,l=0,m=0,n=0;b=i;if((c[a+102868>>2]&2|0)!=0){i=b;return}d=+g[a+102972>>2];c7(2700,(v=i,i=i+16|0,h[k>>3]=+g[a+102968>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=d,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);c7(10440,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(10224,(v=i,i=i+4|0,c[v>>2]=c[a+102960>>2]|0,v)|0);c7(9672,(v=i,i=i+4|0,c[v>>2]=c[a+102964>>2]|0,v)|0);e=c[a+102952>>2]|0;L2834:do{if((e|0)!=0){f=0;j=e;while(1){c[j+8>>2]=f;dj(j);l=c[j+96>>2]|0;if((l|0)==0){break L2834}else{f=f+1|0;j=l}}}}while(0);e=a+102956|0;a=c[e>>2]|0;L2838:do{if((a|0)!=0){j=0;f=a;while(1){c[f+56>>2]=j;l=c[f+12>>2]|0;if((l|0)==0){break}else{j=j+1|0;f=l}}f=c[e>>2]|0;if((f|0)==0){break}else{m=f}while(1){if((c[m+4>>2]|0)!=6){c7(9292,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);bs[c[(c[m>>2]|0)+16>>2]&2047](m);c7(9064,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0)}f=c[m+12>>2]|0;if((f|0)==0){break}else{m=f}}f=c[e>>2]|0;if((f|0)==0){break}else{n=f}while(1){if((c[n+4>>2]|0)==6){c7(9292,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);bs[c[(c[n>>2]|0)+16>>2]&2047](n);c7(9064,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0)}f=c[n+12>>2]|0;if((f|0)==0){break L2838}else{n=f}}}}while(0);c7(8876,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(8668,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(8484,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(8288,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);i=b;return}function dS(a){a=a|0;return}function dT(a){a=a|0;return}function dU(a,c,d){a=a|0;c=c|0;d=d|0;var e=0;a=b[c+36>>1]|0;if(!(a<<16>>16!=(b[d+36>>1]|0)|a<<16>>16==0)){e=a<<16>>16>0;return e|0}if((b[d+32>>1]&b[c+34>>1])<<16>>16==0){e=0;return e|0}e=(b[d+34>>1]&b[c+32>>1])<<16>>16!=0;return e|0}function dV(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0.0,n=0.0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0,L=0,M=0,N=0,O=0.0,P=0.0,R=0.0,S=0.0,T=0.0,U=0,V=0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0,ae=0.0,af=0.0,ag=0,ah=0,ai=0,aj=0;e=i;i=i+1056|0;f=e|0;h=e+1036|0;j=d;l=c[j+4>>2]|0;m=(c[k>>2]=c[j>>2]|0,+g[k>>2]);n=(c[k>>2]=l,+g[k>>2]);l=d+8|0;o=c[l+4>>2]|0;p=(c[k>>2]=c[l>>2]|0,+g[k>>2]);q=p-m;p=(c[k>>2]=o,+g[k>>2])-n;r=q*q+p*p;if(r<=0.0){bc(8144,204,11700,7972)}s=+Q(+r);if(s<1.1920928955078125e-7){t=q;u=p}else{r=1.0/s;t=q*r;u=p*r}r=u*-1.0;if(r>0.0){v=r}else{v=-0.0-r}if(t>0.0){w=t}else{w=-0.0-t}u=+g[d+16>>2];s=m+q*u;x=n+p*u;d=f+4|0;o=f|0;c[o>>2]=d;y=f+1028|0;c[y>>2]=0;z=f+1032|0;c[z>>2]=256;c[(c[o>>2]|0)+(c[y>>2]<<2)>>2]=c[a>>2]|0;f=(c[y>>2]|0)+1|0;c[y>>2]=f;L2879:do{if((f|0)>0){A=a+4|0;B=h;C=h+8|0;D=h+16|0;E=f;F=n<x?n:x;G=m<s?m:s;H=n>x?n:x;I=m>s?m:s;J=u;while(1){K=E;while(1){L=K-1|0;c[y>>2]=L;M=c[o>>2]|0;N=c[M+(L<<2)>>2]|0;if((N|0)==-1){O=J;P=I;R=H;S=G;T=F;U=L;break}V=c[A>>2]|0;W=+g[V+(N*36&-1)+8>>2];X=+g[V+(N*36&-1)+12>>2];Y=+g[V+(N*36&-1)>>2];Z=+g[V+(N*36&-1)+4>>2];if(G-W>0.0|F-X>0.0|Y-I>0.0|Z-H>0.0){_=J;$=I;aa=H;ab=G;ac=F;ad=2138;break}ae=r*(m-(W+Y)*.5)+t*(n-(X+Z)*.5);if(ae>0.0){af=ae}else{af=-0.0-ae}if(af-(v*(W-Y)*.5+w*(X-Z)*.5)>0.0){_=J;$=I;aa=H;ab=G;ac=F;ad=2138;break}ag=V+(N*36&-1)+24|0;if((c[ag>>2]|0)==-1){ad=2149;break}do{if((L|0)==(c[z>>2]|0)){c[z>>2]=L<<1;ah=pQ(L<<3)|0;c[o>>2]=ah;ai=M;pY(ah|0,ai|0,c[y>>2]<<2);if((M|0)==(d|0)){break}pR(ai)}}while(0);c[(c[o>>2]|0)+(c[y>>2]<<2)>>2]=c[ag>>2]|0;M=(c[y>>2]|0)+1|0;c[y>>2]=M;L=V+(N*36&-1)+28|0;do{if((M|0)==(c[z>>2]|0)){ai=c[o>>2]|0;c[z>>2]=M<<1;ah=pQ(M<<3)|0;c[o>>2]=ah;aj=ai;pY(ah|0,aj|0,c[y>>2]<<2);if((ai|0)==(d|0)){break}pR(aj)}}while(0);c[(c[o>>2]|0)+(c[y>>2]<<2)>>2]=c[L>>2]|0;M=(c[y>>2]|0)+1|0;c[y>>2]=M;if((M|0)>0){K=M}else{break L2879}}do{if((ad|0)==2149){ad=0;K=c[j+4>>2]|0;c[B>>2]=c[j>>2]|0;c[B+4>>2]=K;K=c[l+4>>2]|0;c[C>>2]=c[l>>2]|0;c[C+4>>2]=K;g[D>>2]=J;Z=+dW(b,h,N);if(Z==0.0){break L2879}if(Z<=0.0){_=J;$=I;aa=H;ab=G;ac=F;ad=2138;break}X=m+q*Z;Y=n+p*Z;_=Z;$=m>X?m:X;aa=n>Y?n:Y;ab=m<X?m:X;ac=n<Y?n:Y;ad=2138;break}}while(0);if((ad|0)==2138){ad=0;O=_;P=$;R=aa;S=ab;T=ac;U=c[y>>2]|0}if((U|0)>0){E=U;F=T;G=S;H=R;I=P;J=O}else{break L2879}}}}while(0);U=c[o>>2]|0;if((U|0)==(d|0)){i=e;return}pR(U);c[o>>2]=0;i=e;return}function dW(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0.0,m=0.0,n=0.0;e=i;i=i+20|0;f=e|0;h=e+12|0;j=c[a>>2]|0;do{if((d|0)>-1){if((c[j+12>>2]|0)>(d|0)){break}else{k=2168;break}}else{k=2168}}while(0);if((k|0)==2168){bc(8144,153,11988,7720)}k=c[(c[j+4>>2]|0)+(d*36&-1)+16>>2]|0;d=c[k+16>>2]|0;j=c[d+12>>2]|0;if(bx[c[(c[j>>2]|0)+20>>2]&2047](j,f,b,(c[d+8>>2]|0)+12|0,c[k+20>>2]|0)|0){l=+g[f+8>>2];m=1.0-l;n=m*+g[b+4>>2]+l*+g[b+12>>2];g[h>>2]=+g[b>>2]*m+l*+g[b+8>>2];g[h+4>>2]=n;k=c[a+4>>2]|0;n=+bJ[c[(c[k>>2]|0)+8>>2]&2047](k,d,h,f|0,l);i=e;return+n}else{n=+g[b+16>>2];i=e;return+n}return 0.0}function dX(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;e=i;i=i+1036|0;f=e|0;h=f+4|0;j=f|0;c[j>>2]=h;k=f+1028|0;c[k>>2]=0;l=f+1032|0;c[l>>2]=256;c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[a>>2]|0;f=(c[k>>2]|0)+1|0;c[k>>2]=f;L2925:do{if((f|0)>0){m=a+4|0;n=d|0;o=d+4|0;p=d+8|0;q=d+12|0;r=b|0;s=b+4|0;t=f;while(1){u=t-1|0;c[k>>2]=u;v=c[j>>2]|0;w=c[v+(u<<2)>>2]|0;do{if((w|0)==-1){x=u}else{y=c[m>>2]|0;if(+g[n>>2]- +g[y+(w*36&-1)+8>>2]>0.0|+g[o>>2]- +g[y+(w*36&-1)+12>>2]>0.0|+g[y+(w*36&-1)>>2]- +g[p>>2]>0.0|+g[y+(w*36&-1)+4>>2]- +g[q>>2]>0.0){x=u;break}z=y+(w*36&-1)+24|0;if((c[z>>2]|0)==-1){A=c[r>>2]|0;do{if((w|0)>-1){if((c[A+12>>2]|0)>(w|0)){break}else{B=2184;break}}else{B=2184}}while(0);if((B|0)==2184){B=0;bc(8144,153,11988,7720)}C=c[s>>2]|0;if(!(bI[c[(c[C>>2]|0)+8>>2]&2047](C,c[(c[(c[A+4>>2]|0)+(w*36&-1)+16>>2]|0)+16>>2]|0)|0)){break L2925}x=c[k>>2]|0;break}do{if((u|0)==(c[l>>2]|0)){c[l>>2]=u<<1;C=pQ(u<<3)|0;c[j>>2]=C;D=v;pY(C|0,D|0,c[k>>2]<<2);if((v|0)==(h|0)){break}pR(D)}}while(0);c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[z>>2]|0;A=(c[k>>2]|0)+1|0;c[k>>2]=A;D=y+(w*36&-1)+28|0;do{if((A|0)==(c[l>>2]|0)){C=c[j>>2]|0;c[l>>2]=A<<1;E=pQ(A<<3)|0;c[j>>2]=E;F=C;pY(E|0,F|0,c[k>>2]<<2);if((C|0)==(h|0)){break}pR(F)}}while(0);c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[D>>2]|0;A=(c[k>>2]|0)+1|0;c[k>>2]=A;x=A}}while(0);if((x|0)>0){t=x}else{break L2925}}}}while(0);x=c[j>>2]|0;if((x|0)==(h|0)){i=e;return}pR(x);c[j>>2]=0;i=e;return}function dY(a){a=a|0;pT(a);return}function dZ(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0;h=c6(f,144)|0;if((h|0)==0){i=0;j=i|0;return j|0}f=h;k=h;c[k>>2]=16480;c[h+4>>2]=4;c[h+48>>2]=a;l=h+52|0;c[l>>2]=d;c[h+56>>2]=b;c[h+60>>2]=e;c[h+124>>2]=0;c[h+128>>2]=0;pZ(h+8|0,0,40);g[h+136>>2]=+Q(+(+g[a+16>>2]*+g[d+16>>2]));m=+g[a+20>>2];n=+g[d+20>>2];g[h+140>>2]=m>n?m:n;c[k>>2]=16628;if((c[(c[a+12>>2]|0)+4>>2]|0)==3){o=d}else{bc(7904,43,14180,9856);o=c[l>>2]|0}if((c[(c[o+12>>2]|0)+4>>2]|0)==0){i=f;j=i|0;return j|0}bc(7904,44,14180,7260);i=f;j=i|0;return j|0}function d_(b,d){b=b|0;d=d|0;var e=0,f=0;bs[c[(c[b>>2]|0)+4>>2]&2047](b);e=a[18808]|0;if((e&255)>=14){bc(3640,173,14896,4712)}f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}function d$(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0;f=i;i=i+48|0;h=f|0;j=c[(c[a+48>>2]|0)+12>>2]|0;c[h>>2]=17436;c[h+4>>2]=1;g[h+8>>2]=.009999999776482582;pZ(h+28|0,0,18);cO(j,h,c[a+56>>2]|0);b7(b,h,d,c[(c[a+52>>2]|0)+12>>2]|0,e);i=f;return}function d0(a){a=a|0;pT(a);return}function d1(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0;h=c6(f,144)|0;if((h|0)==0){i=0;j=i|0;return j|0}f=h;k=h;c[k>>2]=16480;c[h+4>>2]=4;c[h+48>>2]=a;l=h+52|0;c[l>>2]=d;c[h+56>>2]=b;c[h+60>>2]=e;c[h+124>>2]=0;c[h+128>>2]=0;pZ(h+8|0,0,40);g[h+136>>2]=+Q(+(+g[a+16>>2]*+g[d+16>>2]));m=+g[a+20>>2];n=+g[d+20>>2];g[h+140>>2]=m>n?m:n;c[k>>2]=16580;if((c[(c[a+12>>2]|0)+4>>2]|0)==3){o=d}else{bc(7764,43,14012,9856);o=c[l>>2]|0}if((c[(c[o+12>>2]|0)+4>>2]|0)==2){i=f;j=i|0;return j|0}bc(7764,44,14012,7216);i=f;j=i|0;return j|0}function d2(b,d){b=b|0;d=d|0;var e=0,f=0;bs[c[(c[b>>2]|0)+4>>2]&2047](b);e=a[18808]|0;if((e&255)>=14){bc(3640,173,14896,4712)}f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}function d3(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,k=0;f=i;i=i+300|0;h=f|0;j=f+252|0;k=c[(c[a+48>>2]|0)+12>>2]|0;c[j>>2]=17436;c[j+4>>2]=1;g[j+8>>2]=.009999999776482582;pZ(j+28|0,0,18);cO(k,j,c[a+56>>2]|0);b8(h,b,j,d,c[(c[a+52>>2]|0)+12>>2]|0,e);i=f;return}function d4(a){a=a|0;pT(a);return}function d5(a){a=a|0;return}function d6(a){a=a|0;return}function d7(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;f=c[(c[a+48>>2]|0)+12>>2]|0;h=c[(c[a+52>>2]|0)+12>>2]|0;a=b+60|0;c[a>>2]=0;i=f+12|0;j=+g[d+12>>2];k=+g[i>>2];l=+g[d+8>>2];m=+g[f+16>>2];n=h+12|0;o=+g[e+12>>2];p=+g[n>>2];q=+g[e+8>>2];r=+g[h+16>>2];s=+g[e>>2]+(o*p-q*r)-(+g[d>>2]+(j*k-l*m));t=p*q+o*r+ +g[e+4>>2]-(k*l+j*m+ +g[d+4>>2]);m=+g[f+8>>2]+ +g[h+8>>2];if(s*s+t*t>m*m){return}c[b+56>>2]=0;h=i;i=b+48|0;f=c[h+4>>2]|0;c[i>>2]=c[h>>2]|0;c[i+4>>2]=f;g[b+40>>2]=0.0;g[b+44>>2]=0.0;c[a>>2]=1;a=n;n=b;f=c[a+4>>2]|0;c[n>>2]=c[a>>2]|0;c[n+4>>2]=f;c[b+16>>2]=0;return}function d8(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0,m=0;e=c6(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;b=e;c[b>>2]=16480;c[e+4>>2]=4;c[e+48>>2]=a;j=e+52|0;c[j>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;pZ(e+8|0,0,40);g[e+136>>2]=+Q(+(+g[a+16>>2]*+g[d+16>>2]));k=+g[a+20>>2];l=+g[d+20>>2];g[e+140>>2]=k>l?k:l;c[b>>2]=16968;if((c[(c[a+12>>2]|0)+4>>2]|0)==0){m=d}else{bc(7632,44,15156,9780);m=c[j>>2]|0}if((c[(c[m+12>>2]|0)+4>>2]|0)==0){h=f;i=h|0;return i|0}bc(7632,45,15156,7260);h=f;i=h|0;return i|0}function d9(b,d){b=b|0;d=d|0;var e=0,f=0;bs[c[(c[b>>2]|0)+4>>2]&2047](b);e=a[18808]|0;if((e&255)>=14){bc(3640,173,14896,4712)}f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}function ea(a){a=a|0;pT(a);return}function eb(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0;if((a[18464]&1)<<24>>24==0){c[4617]=922;c[4618]=456;a[18476]=1;c[4641]=148;c[4642]=1296;a[18572]=1;c[4623]=148;c[4624]=1296;a[18500]=0;c[4647]=1596;c[4648]=952;a[18596]=1;c[4629]=892;c[4630]=306;a[18524]=1;c[4620]=892;c[4621]=306;a[18488]=0;c[4635]=1230;c[4636]=748;a[18548]=1;c[4644]=1230;c[4645]=748;a[18584]=0;c[4653]=728;c[4654]=706;a[18620]=1;c[4626]=728;c[4627]=706;a[18512]=0;c[4659]=1606;c[4660]=526;a[18644]=1;c[4650]=1606;c[4651]=526;a[18608]=0;a[18464]=1}h=c[(c[b+12>>2]|0)+4>>2]|0;i=c[(c[e+12>>2]|0)+4>>2]|0;if(h>>>0>=4){bc(7540,80,12668,9736)}if(i>>>0>=4){bc(7540,81,12668,7332)}j=c[18468+(h*48&-1)+(i*12&-1)>>2]|0;if((j|0)==0){k=0;return k|0}if((a[18468+(h*48&-1)+(i*12&-1)+8|0]&1)<<24>>24==0){k=bx[j&2047](e,f,b,d,g)|0;return k|0}else{k=bx[j&2047](b,d,e,f,g)|0;return k|0}return 0}function ec(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;if((a[18464]&1)<<24>>24==0){bc(7540,103,12604,5244)}f=d+48|0;do{if((c[d+124>>2]|0)>0){h=c[(c[f>>2]|0)+8>>2]|0;i=h+4|0;j=b[i>>1]|0;if((j&2)<<16>>16==0){b[i>>1]=j|2;g[h+144>>2]=0.0}h=d+52|0;j=c[(c[h>>2]|0)+8>>2]|0;i=j+4|0;k=b[i>>1]|0;if((k&2)<<16>>16!=0){l=h;break}b[i>>1]=k|2;g[j+144>>2]=0.0;l=h}else{l=d+52|0}}while(0);h=c[(c[(c[f>>2]|0)+12>>2]|0)+4>>2]|0;f=c[(c[(c[l>>2]|0)+12>>2]|0)+4>>2]|0;if((h|0)>-1&(f|0)<4){m=18468+(h*48&-1)+(f*12&-1)+4|0;n=c[m>>2]|0;bt[n&2047](d,e);return}bc(7540,114,12604,4396);bc(7540,115,12604,4396);m=18468+(h*48&-1)+(f*12&-1)+4|0;n=c[m>>2]|0;bt[n&2047](d,e);return}function ed(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;f=i;i=i+192|0;h=f|0;j=f+92|0;k=f+104|0;l=f+128|0;m=d+64|0;pY(l|0,m|0,64);n=d+4|0;o=c[n>>2]|0;c[n>>2]=o|4;p=o>>>1;o=c[d+48>>2]|0;q=c[d+52>>2]|0;r=((a[q+38|0]|a[o+38|0])&1)<<24>>24!=0;s=c[o+8>>2]|0;t=c[q+8>>2]|0;u=s+12|0;v=t+12|0;do{if(r){w=c[o+12>>2]|0;x=c[q+12>>2]|0;y=c[d+56>>2]|0;z=c[d+60>>2]|0;c[h+16>>2]=0;c[h+20>>2]=0;g[h+24>>2]=0.0;c[h+44>>2]=0;c[h+48>>2]=0;g[h+52>>2]=0.0;ce(h|0,w,y);ce(h+28|0,x,z);z=h+56|0;x=u;c[z>>2]=c[x>>2]|0;c[z+4>>2]=c[x+4>>2]|0;c[z+8>>2]=c[x+8>>2]|0;c[z+12>>2]=c[x+12>>2]|0;x=h+72|0;z=v;c[x>>2]=c[z>>2]|0;c[x+4>>2]=c[z+4>>2]|0;c[x+8>>2]=c[z+8>>2]|0;c[x+12>>2]=c[z+12>>2]|0;a[h+88|0]=1;b[j+4>>1]=0;cg(k,j,h);z=+g[k+16>>2]<11920928955078125.0e-22&1;c[d+124>>2]=0;A=z;B=p&1}else{bR[c[c[d>>2]>>2]&2047](d,m,u,v);z=d+124|0;x=(c[z>>2]|0)>0;y=x&1;L3052:do{if(x){w=c[l+60>>2]|0;C=0;while(1){D=d+64+(C*20&-1)+8|0;g[D>>2]=0.0;E=d+64+(C*20&-1)+12|0;g[E>>2]=0.0;F=c[d+64+(C*20&-1)+16>>2]|0;G=0;while(1){if((G|0)>=(w|0)){break}if((c[l+(G*20&-1)+16>>2]|0)==(F|0)){H=2285;break}else{G=G+1|0}}if((H|0)==2285){H=0;g[D>>2]=+g[l+(G*20&-1)+8>>2];g[E>>2]=+g[l+(G*20&-1)+12>>2]}F=C+1|0;if((F|0)<(c[z>>2]|0)){C=F}else{break L3052}}}}while(0);z=p&1;if(!(x^(z|0)!=0)){A=y;B=z;break}C=s+4|0;w=b[C>>1]|0;if((w&2)<<16>>16==0){b[C>>1]=w|2;g[s+144>>2]=0.0}w=t+4|0;C=b[w>>1]|0;if((C&2)<<16>>16!=0){A=y;B=z;break}b[w>>1]=C|2;g[t+144>>2]=0.0;A=y;B=z}}while(0);t=A<<24>>24!=0;A=c[n>>2]|0;c[n>>2]=t?A|2:A&-3;A=t^1;n=(e|0)==0;if(!((B|0)!=0|A|n)){bt[c[(c[e>>2]|0)+8>>2]&2047](e,d)}if(!(t|(B|0)==0|n)){bt[c[(c[e>>2]|0)+12>>2]&2047](e,d)}if(r|A|n){i=f;return}bO[c[(c[e>>2]|0)+16>>2]&2047](e,d,l);i=f;return}function ee(a){a=a|0;pT(a);return}
function ef(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=b;f=d;c[e>>2]=c[f>>2]|0;c[e+4>>2]=c[f+4>>2]|0;c[e+8>>2]=c[f+8>>2]|0;c[e+12>>2]=c[f+12>>2]|0;c[e+16>>2]=c[f+16>>2]|0;c[e+20>>2]=c[f+20>>2]|0;f=c[d+40>>2]|0;e=b+32|0;c[e>>2]=f;h=c[d+28>>2]|0;i=b+48|0;c[i>>2]=h;j=h*88&-1;h=f+102796|0;k=c[h>>2]|0;if((k|0)<32){l=k}else{bc(3152,38,14548,4676);l=c[h>>2]|0}k=f+102412+(l*12&-1)|0;c[f+102412+(l*12&-1)+4>>2]=j;m=f+102400|0;n=c[m>>2]|0;if((n+j|0)>102400){c[k>>2]=pQ(j)|0;a[f+102412+(l*12&-1)+8|0]=1}else{c[k>>2]=f+n|0;a[f+102412+(l*12&-1)+8|0]=0;c[m>>2]=(c[m>>2]|0)+j|0}m=f+102404|0;l=(c[m>>2]|0)+j|0;c[m>>2]=l;m=f+102408|0;f=c[m>>2]|0;c[m>>2]=(f|0)>(l|0)?f:l;c[h>>2]=(c[h>>2]|0)+1|0;h=b+36|0;c[h>>2]=c[k>>2]|0;k=c[e>>2]|0;e=(c[i>>2]|0)*152&-1;l=k+102796|0;f=c[l>>2]|0;if((f|0)<32){o=f}else{bc(3152,38,14548,4676);o=c[l>>2]|0}f=k+102412+(o*12&-1)|0;c[k+102412+(o*12&-1)+4>>2]=e;m=k+102400|0;j=c[m>>2]|0;if((j+e|0)>102400){c[f>>2]=pQ(e)|0;a[k+102412+(o*12&-1)+8|0]=1}else{c[f>>2]=k+j|0;a[k+102412+(o*12&-1)+8|0]=0;c[m>>2]=(c[m>>2]|0)+e|0}m=k+102404|0;o=(c[m>>2]|0)+e|0;c[m>>2]=o;m=k+102408|0;k=c[m>>2]|0;c[m>>2]=(k|0)>(o|0)?k:o;c[l>>2]=(c[l>>2]|0)+1|0;l=b+40|0;c[l>>2]=c[f>>2]|0;c[b+24>>2]=c[d+32>>2]|0;c[b+28>>2]=c[d+36>>2]|0;f=c[d+24>>2]|0;d=b+44|0;c[d>>2]=f;if((c[i>>2]|0)<=0){return}o=b+20|0;k=b+8|0;b=0;m=f;while(1){f=c[m+(b<<2)>>2]|0;e=c[f+48>>2]|0;j=c[f+52>>2]|0;p=+g[(c[e+12>>2]|0)+8>>2];q=+g[(c[j+12>>2]|0)+8>>2];n=c[e+8>>2]|0;e=c[j+8>>2]|0;j=c[f+124>>2]|0;r=(j|0)>0;if(!r){bc(7124,71,14992,9656)}s=c[l>>2]|0;g[s+(b*152&-1)+136>>2]=+g[f+136>>2];g[s+(b*152&-1)+140>>2]=+g[f+140>>2];t=n+8|0;c[s+(b*152&-1)+112>>2]=c[t>>2]|0;u=e+8|0;c[s+(b*152&-1)+116>>2]=c[u>>2]|0;v=n+120|0;g[s+(b*152&-1)+120>>2]=+g[v>>2];w=e+120|0;g[s+(b*152&-1)+124>>2]=+g[w>>2];x=n+128|0;g[s+(b*152&-1)+128>>2]=+g[x>>2];y=e+128|0;g[s+(b*152&-1)+132>>2]=+g[y>>2];c[s+(b*152&-1)+148>>2]=b;c[s+(b*152&-1)+144>>2]=j;pZ(s+(b*152&-1)+80|0,0,32);z=c[h>>2]|0;c[z+(b*88&-1)+32>>2]=c[t>>2]|0;c[z+(b*88&-1)+36>>2]=c[u>>2]|0;g[z+(b*88&-1)+40>>2]=+g[v>>2];g[z+(b*88&-1)+44>>2]=+g[w>>2];w=n+28|0;n=z+(b*88&-1)+48|0;v=c[w+4>>2]|0;c[n>>2]=c[w>>2]|0;c[n+4>>2]=v;v=e+28|0;e=z+(b*88&-1)+56|0;n=c[v+4>>2]|0;c[e>>2]=c[v>>2]|0;c[e+4>>2]=n;g[z+(b*88&-1)+64>>2]=+g[x>>2];g[z+(b*88&-1)+68>>2]=+g[y>>2];y=f+104|0;x=z+(b*88&-1)+16|0;n=c[y+4>>2]|0;c[x>>2]=c[y>>2]|0;c[x+4>>2]=n;n=f+112|0;x=z+(b*88&-1)+24|0;y=c[n+4>>2]|0;c[x>>2]=c[n>>2]|0;c[x+4>>2]=y;c[z+(b*88&-1)+84>>2]=j;g[z+(b*88&-1)+76>>2]=p;g[z+(b*88&-1)+80>>2]=q;c[z+(b*88&-1)+72>>2]=c[f+120>>2]|0;L3103:do{if(r){y=0;while(1){if((a[o]&1)<<24>>24==0){g[s+(b*152&-1)+(y*36&-1)+16>>2]=0.0;g[s+(b*152&-1)+(y*36&-1)+20>>2]=0.0}else{g[s+(b*152&-1)+(y*36&-1)+16>>2]=+g[k>>2]*+g[f+64+(y*20&-1)+8>>2];g[s+(b*152&-1)+(y*36&-1)+20>>2]=+g[k>>2]*+g[f+64+(y*20&-1)+12>>2]}g[s+(b*152&-1)+(y*36&-1)+24>>2]=0.0;g[s+(b*152&-1)+(y*36&-1)+28>>2]=0.0;g[s+(b*152&-1)+(y*36&-1)+32>>2]=0.0;x=f+64+(y*20&-1)|0;n=z+(b*88&-1)+(y<<3)|0;pZ(s+(b*152&-1)+(y*36&-1)|0,0,16);e=c[x+4>>2]|0;c[n>>2]=c[x>>2]|0;c[n+4>>2]=e;e=y+1|0;if((e|0)==(j|0)){break L3103}else{y=e}}}}while(0);j=b+1|0;if((j|0)>=(c[i>>2]|0)){break}b=j;m=c[d>>2]|0}return}function eg(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0;b=a+48|0;if((c[b>>2]|0)<=0){return}d=a+40|0;e=a+28|0;a=0;while(1){f=c[d>>2]|0;h=c[f+(a*152&-1)+112>>2]|0;i=c[f+(a*152&-1)+116>>2]|0;j=+g[f+(a*152&-1)+120>>2];l=+g[f+(a*152&-1)+128>>2];m=+g[f+(a*152&-1)+124>>2];n=+g[f+(a*152&-1)+132>>2];o=c[f+(a*152&-1)+144>>2]|0;p=c[e>>2]|0;q=p+(h*12&-1)|0;r=c[q+4>>2]|0;s=(c[k>>2]=c[q>>2]|0,+g[k>>2]);t=(c[k>>2]=r,+g[k>>2]);u=+g[p+(h*12&-1)+8>>2];r=p+(i*12&-1)|0;v=c[r+4>>2]|0;w=(c[k>>2]=c[r>>2]|0,+g[k>>2]);x=(c[k>>2]=v,+g[k>>2]);y=+g[p+(i*12&-1)+8>>2];p=f+(a*152&-1)+72|0;v=c[p+4>>2]|0;z=(c[k>>2]=c[p>>2]|0,+g[k>>2]);A=(c[k>>2]=v,+g[k>>2]);B=z*-1.0;L3119:do{if((o|0)>0){C=t;D=s;E=x;F=w;G=u;H=y;v=0;while(1){I=+g[f+(a*152&-1)+(v*36&-1)+16>>2];J=+g[f+(a*152&-1)+(v*36&-1)+20>>2];K=z*I+A*J;L=A*I+B*J;J=G-l*(+g[f+(a*152&-1)+(v*36&-1)>>2]*L- +g[f+(a*152&-1)+(v*36&-1)+4>>2]*K);I=D-j*K;M=C-j*L;N=H+n*(L*+g[f+(a*152&-1)+(v*36&-1)+8>>2]-K*+g[f+(a*152&-1)+(v*36&-1)+12>>2]);O=F+m*K;K=E+m*L;p=v+1|0;if((p|0)==(o|0)){P=M;Q=I;R=K;S=O;T=J;U=N;break L3119}else{C=M;D=I;E=K;F=O;G=J;H=N;v=p}}}else{P=t;Q=s;R=x;S=w;T=u;U=y}}while(0);o=(g[k>>2]=Q,c[k>>2]|0);f=(g[k>>2]=P,c[k>>2]|0)|0;c[q>>2]=0|o;c[q+4>>2]=f;g[(c[e>>2]|0)+(h*12&-1)+8>>2]=T;f=(c[e>>2]|0)+(i*12&-1)|0;o=(g[k>>2]=S,c[k>>2]|0);v=(g[k>>2]=R,c[k>>2]|0)|0;c[f>>2]=0|o;c[f+4>>2]=v;g[(c[e>>2]|0)+(i*12&-1)+8>>2]=U;v=a+1|0;if((v|0)<(c[b>>2]|0)){a=v}else{break}}return}function eh(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0.0,A=0,B=0,C=0,D=0.0,E=0.0,F=0.0,G=0.0,H=0,I=0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0,ae=0,af=0,ag=0.0,ah=0.0,ai=0.0;b=i;i=i+56|0;d=b|0;e=b+16|0;f=b+32|0;h=a+48|0;if((c[h>>2]|0)<=0){i=b;return}j=a+40|0;l=a+36|0;m=a+44|0;n=a+24|0;o=a+28|0;a=d+8|0;p=d+12|0;q=e+8|0;r=e+12|0;s=d;t=e;u=f;v=0;while(1){w=c[j>>2]|0;x=c[l>>2]|0;y=+g[x+(v*88&-1)+76>>2];z=+g[x+(v*88&-1)+80>>2];A=c[(c[m>>2]|0)+(c[w+(v*152&-1)+148>>2]<<2)>>2]|0;B=c[w+(v*152&-1)+112>>2]|0;C=c[w+(v*152&-1)+116>>2]|0;D=+g[w+(v*152&-1)+120>>2];E=+g[w+(v*152&-1)+124>>2];F=+g[w+(v*152&-1)+128>>2];G=+g[w+(v*152&-1)+132>>2];H=x+(v*88&-1)+48|0;I=c[H+4>>2]|0;J=(c[k>>2]=c[H>>2]|0,+g[k>>2]);K=(c[k>>2]=I,+g[k>>2]);I=x+(v*88&-1)+56|0;x=c[I+4>>2]|0;L=(c[k>>2]=c[I>>2]|0,+g[k>>2]);M=(c[k>>2]=x,+g[k>>2]);x=c[n>>2]|0;I=x+(B*12&-1)|0;H=c[I+4>>2]|0;N=(c[k>>2]=c[I>>2]|0,+g[k>>2]);O=(c[k>>2]=H,+g[k>>2]);P=+g[x+(B*12&-1)+8>>2];H=c[o>>2]|0;I=H+(B*12&-1)|0;Q=c[I+4>>2]|0;R=(c[k>>2]=c[I>>2]|0,+g[k>>2]);U=(c[k>>2]=Q,+g[k>>2]);V=+g[H+(B*12&-1)+8>>2];B=x+(C*12&-1)|0;Q=c[B+4>>2]|0;W=(c[k>>2]=c[B>>2]|0,+g[k>>2]);X=(c[k>>2]=Q,+g[k>>2]);Y=+g[x+(C*12&-1)+8>>2];x=H+(C*12&-1)|0;Q=c[x+4>>2]|0;Z=(c[k>>2]=c[x>>2]|0,+g[k>>2]);_=(c[k>>2]=Q,+g[k>>2]);$=+g[H+(C*12&-1)+8>>2];if((c[A+124>>2]|0)<=0){bc(7124,168,15048,7304)}aa=+T(+P);g[a>>2]=aa;ab=+S(+P);g[p>>2]=ab;P=+T(+Y);g[q>>2]=P;ac=+S(+Y);g[r>>2]=ac;C=(g[k>>2]=N-(J*ab-K*aa),c[k>>2]|0);H=(g[k>>2]=O-(K*ab+J*aa),c[k>>2]|0)|0;c[s>>2]=0|C;c[s+4>>2]=H;H=(g[k>>2]=W-(L*ac-M*P),c[k>>2]|0);C=(g[k>>2]=X-(M*ac+L*P),c[k>>2]|0)|0;c[t>>2]=0|H;c[t+4>>2]=C;cd(f,A+64|0,d,y,e,z);A=w+(v*152&-1)+72|0;C=A;H=c[u+4>>2]|0;c[C>>2]=c[u>>2]|0;c[C+4>>2]=H;H=w+(v*152&-1)+144|0;C=c[H>>2]|0;do{if((C|0)>0){Q=w+(v*152&-1)+76|0;x=A|0;z=D+E;y=-0.0-$;P=-0.0-V;B=w+(v*152&-1)+140|0;I=0;while(1){L=+g[f+8+(I<<3)>>2];ac=L-N;M=+g[f+8+(I<<3)+4>>2];ad=w+(v*152&-1)+(I*36&-1)|0;ae=(g[k>>2]=ac,c[k>>2]|0);af=(g[k>>2]=M-O,c[k>>2]|0)|0;c[ad>>2]=0|ae;c[ad+4>>2]=af;aa=L-W;af=w+(v*152&-1)+(I*36&-1)+8|0;ad=(g[k>>2]=aa,c[k>>2]|0);ae=(g[k>>2]=M-X,c[k>>2]|0)|0;c[af>>2]=0|ad;c[af+4>>2]=ae;M=+g[Q>>2];L=+g[w+(v*152&-1)+(I*36&-1)+4>>2];J=+g[x>>2];ab=ac*M-L*J;K=+g[w+(v*152&-1)+(I*36&-1)+12>>2];Y=M*aa-J*K;J=z+ab*F*ab+Y*G*Y;if(J>0.0){ag=1.0/J}else{ag=0.0}g[w+(v*152&-1)+(I*36&-1)+24>>2]=ag;J=+g[Q>>2];Y=+g[x>>2]*-1.0;ab=ac*Y-J*L;M=Y*aa-J*K;J=z+ab*F*ab+M*G*M;if(J>0.0){ah=1.0/J}else{ah=0.0}g[w+(v*152&-1)+(I*36&-1)+28>>2]=ah;ae=w+(v*152&-1)+(I*36&-1)+32|0;g[ae>>2]=0.0;J=+g[x>>2]*(Z+K*y-R-L*P)+ +g[Q>>2]*(_+$*aa-U-V*ac);if(J<-1.0){g[ae>>2]=J*(-0.0- +g[B>>2])}ae=I+1|0;if((ae|0)==(C|0)){break}else{I=ae}}if((c[H>>2]|0)!=2){break}P=+g[w+(v*152&-1)+76>>2];y=+g[A>>2];z=+g[w+(v*152&-1)>>2]*P- +g[w+(v*152&-1)+4>>2]*y;J=P*+g[w+(v*152&-1)+8>>2]-y*+g[w+(v*152&-1)+12>>2];ac=P*+g[w+(v*152&-1)+36>>2]-y*+g[w+(v*152&-1)+40>>2];aa=P*+g[w+(v*152&-1)+44>>2]-y*+g[w+(v*152&-1)+48>>2];y=D+E;P=F*z;L=G*J;K=y+z*P+J*L;J=y+ac*F*ac+aa*G*aa;z=y+P*ac+L*aa;aa=K*J-z*z;if(K*K>=aa*1.0e3){c[H>>2]=1;break}g[w+(v*152&-1)+96>>2]=K;g[w+(v*152&-1)+100>>2]=z;g[w+(v*152&-1)+104>>2]=z;g[w+(v*152&-1)+108>>2]=J;if(aa!=0.0){ai=1.0/aa}else{ai=aa}aa=z*(-0.0-ai);g[w+(v*152&-1)+80>>2]=J*ai;g[w+(v*152&-1)+84>>2]=aa;g[w+(v*152&-1)+88>>2]=aa;g[w+(v*152&-1)+92>>2]=K*ai}}while(0);w=v+1|0;if((w|0)<(c[h>>2]|0)){v=w}else{break}}i=b;return}function ei(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0,q=0,r=0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0,J=0.0,K=0.0,L=0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0;b=a+48|0;if((c[b>>2]|0)<=0){return}d=a+40|0;e=a+28|0;a=0;while(1){f=c[d>>2]|0;h=f+(a*152&-1)|0;i=c[f+(a*152&-1)+112>>2]|0;j=c[f+(a*152&-1)+116>>2]|0;l=+g[f+(a*152&-1)+120>>2];m=+g[f+(a*152&-1)+128>>2];n=+g[f+(a*152&-1)+124>>2];o=+g[f+(a*152&-1)+132>>2];p=f+(a*152&-1)+144|0;q=c[p>>2]|0;r=c[e>>2]|0;s=r+(i*12&-1)|0;t=c[s+4>>2]|0;u=(c[k>>2]=c[s>>2]|0,+g[k>>2]);v=(c[k>>2]=t,+g[k>>2]);w=+g[r+(i*12&-1)+8>>2];t=r+(j*12&-1)|0;s=c[t+4>>2]|0;x=(c[k>>2]=c[t>>2]|0,+g[k>>2]);y=(c[k>>2]=s,+g[k>>2]);z=+g[r+(j*12&-1)+8>>2];r=f+(a*152&-1)+72|0;s=c[r+4>>2]|0;A=(c[k>>2]=c[r>>2]|0,+g[k>>2]);B=(c[k>>2]=s,+g[k>>2]);C=A*-1.0;D=+g[f+(a*152&-1)+136>>2];do{if((q-1|0)>>>0<2){E=v;F=u;G=y;H=x;I=0;J=z;K=w;L=2361}else{bc(7124,311,15104,5208);if((q|0)>0){E=v;F=u;G=y;H=x;I=0;J=z;K=w;L=2361;break}else{M=v;N=u;O=y;P=x;Q=z;R=w;break}}}while(0);L3164:do{if((L|0)==2361){while(1){L=0;w=+g[f+(a*152&-1)+(I*36&-1)+12>>2];z=+g[f+(a*152&-1)+(I*36&-1)+8>>2];x=+g[f+(a*152&-1)+(I*36&-1)+4>>2];y=+g[f+(a*152&-1)+(I*36&-1)>>2];u=D*+g[f+(a*152&-1)+(I*36&-1)+16>>2];s=f+(a*152&-1)+(I*36&-1)+20|0;v=+g[s>>2];S=v+ +g[f+(a*152&-1)+(I*36&-1)+28>>2]*(-0.0-(B*(H+w*(-0.0-J)-F-x*(-0.0-K))+C*(G+J*z-E-K*y)));T=-0.0-u;U=S<u?S:u;u=U<T?T:U;U=u-v;g[s>>2]=u;u=B*U;v=C*U;U=F-l*u;T=E-l*v;S=K-m*(y*v-x*u);x=H+n*u;y=G+n*v;V=J+o*(z*v-w*u);s=I+1|0;if((s|0)==(q|0)){M=T;N=U;O=y;P=x;Q=V;R=S;break L3164}else{E=T;F=U;G=y;H=x;I=s;J=V;K=S;L=2361}}}}while(0);L3168:do{if((c[p>>2]|0)==1){C=+g[f+(a*152&-1)+12>>2];D=+g[f+(a*152&-1)+8>>2];S=+g[f+(a*152&-1)+4>>2];V=+g[h>>2];q=f+(a*152&-1)+16|0;x=+g[q>>2];y=x+(A*(P+C*(-0.0-Q)-N-S*(-0.0-R))+B*(O+Q*D-M-R*V)- +g[f+(a*152&-1)+32>>2])*(-0.0- +g[f+(a*152&-1)+24>>2]);U=y>0.0?y:0.0;y=U-x;g[q>>2]=U;U=A*y;x=B*y;W=R-m*(V*x-S*U);X=Q+o*(D*x-C*U);Y=P+n*U;Z=O+n*x;_=N-l*U;$=M-l*x}else{q=f+(a*152&-1)+16|0;x=+g[q>>2];s=f+(a*152&-1)+52|0;U=+g[s>>2];if(x<0.0|U<0.0){bc(7124,406,15104,4368)}C=-0.0-Q;D=+g[f+(a*152&-1)+12>>2];S=+g[f+(a*152&-1)+8>>2];V=-0.0-R;y=+g[f+(a*152&-1)+4>>2];T=+g[h>>2];u=+g[f+(a*152&-1)+48>>2];w=+g[f+(a*152&-1)+44>>2];v=+g[f+(a*152&-1)+40>>2];z=+g[f+(a*152&-1)+36>>2];aa=+g[f+(a*152&-1)+104>>2];ab=+g[f+(a*152&-1)+100>>2];ac=A*(P+D*C-N-y*V)+B*(O+Q*S-M-R*T)- +g[f+(a*152&-1)+32>>2]-(x*+g[f+(a*152&-1)+96>>2]+U*aa);ad=A*(P+u*C-N-v*V)+B*(O+Q*w-M-R*z)- +g[f+(a*152&-1)+68>>2]-(x*ab+U*+g[f+(a*152&-1)+108>>2]);V=+g[f+(a*152&-1)+80>>2]*ac+ +g[f+(a*152&-1)+88>>2]*ad;C=ac*+g[f+(a*152&-1)+84>>2]+ad*+g[f+(a*152&-1)+92>>2];ae=-0.0-V;af=-0.0-C;if(!(V>-0.0|C>-0.0)){C=ae-x;V=af-U;ag=A*C;ah=B*C;C=A*V;ai=B*V;V=ag+C;aj=ah+ai;g[q>>2]=ae;g[s>>2]=af;W=R-m*(T*ah-y*ag+(z*ai-v*C));X=Q+o*(S*ah-D*ag+(w*ai-u*C));Y=P+n*V;Z=O+n*aj;_=N-l*V;$=M-l*aj;break}aj=ac*(-0.0- +g[f+(a*152&-1)+24>>2]);do{if(aj>=0.0){if(ad+aj*ab<0.0){break}V=aj-x;C=0.0-U;ai=A*V;ag=B*V;V=A*C;ah=B*C;C=V+ai;af=ah+ag;g[q>>2]=aj;g[s>>2]=0.0;W=R-m*(ag*T-ai*y+(ah*z-V*v));X=Q+o*(ag*S-ai*D+(ah*w-V*u));Y=P+n*C;Z=O+n*af;_=N-l*C;$=M-l*af;break L3168}}while(0);aj=ad*(-0.0- +g[f+(a*152&-1)+60>>2]);do{if(aj>=0.0){if(ac+aj*aa<0.0){break}ab=0.0-x;af=aj-U;C=A*ab;V=B*ab;ab=A*af;ah=B*af;af=C+ab;ai=V+ah;g[q>>2]=0.0;g[s>>2]=aj;W=R-m*(V*T-C*y+(ah*z-ab*v));X=Q+o*(V*S-C*D+(ah*w-ab*u));Y=P+n*af;Z=O+n*ai;_=N-l*af;$=M-l*ai;break L3168}}while(0);if(ac<0.0|ad<0.0){W=R;X=Q;Y=P;Z=O;_=N;$=M;break}aj=0.0-x;aa=0.0-U;ai=A*aj;af=B*aj;aj=A*aa;ab=B*aa;aa=ai+aj;ah=af+ab;g[q>>2]=0.0;g[s>>2]=0.0;W=R-m*(af*T-ai*y+(ab*z-aj*v));X=Q+o*(af*S-ai*D+(ab*w-aj*u));Y=P+n*aa;Z=O+n*ah;_=N-l*aa;$=M-l*ah}}while(0);f=(c[e>>2]|0)+(i*12&-1)|0;h=(g[k>>2]=_,c[k>>2]|0);p=(g[k>>2]=$,c[k>>2]|0)|0;c[f>>2]=0|h;c[f+4>>2]=p;g[(c[e>>2]|0)+(i*12&-1)+8>>2]=W;p=(c[e>>2]|0)+(j*12&-1)|0;f=(g[k>>2]=Y,c[k>>2]|0);h=(g[k>>2]=Z,c[k>>2]|0)|0;c[p>>2]=0|f;c[p+4>>2]=h;g[(c[e>>2]|0)+(j*12&-1)+8>>2]=X;h=a+1|0;if((h|0)<(c[b>>2]|0)){a=h}else{break}}return}function ej(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,j=0.0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0,C=0,D=0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0.0,ao=0.0,ap=0.0,aq=0.0,ar=0.0,as=0.0,at=0.0,au=0.0,av=0.0,aw=0.0,ax=0.0,ay=0.0,az=0.0,aA=0.0,aB=0;b=i;i=i+52|0;d=b|0;e=b+16|0;f=b+32|0;h=a+48|0;if((c[h>>2]|0)<=0){j=0.0;l=j>=-.014999999664723873;i=b;return l|0}m=a+36|0;n=a+24|0;a=d+8|0;o=d+12|0;p=e+8|0;q=e+12|0;r=d;s=e;t=f;u=f+8|0;v=f+16|0;w=0;x=0.0;while(1){y=c[m>>2]|0;z=y+(w*88&-1)|0;A=c[y+(w*88&-1)+32>>2]|0;B=c[y+(w*88&-1)+36>>2]|0;C=y+(w*88&-1)+48|0;D=c[C+4>>2]|0;E=(c[k>>2]=c[C>>2]|0,+g[k>>2]);F=(c[k>>2]=D,+g[k>>2]);G=+g[y+(w*88&-1)+40>>2];H=+g[y+(w*88&-1)+64>>2];D=y+(w*88&-1)+56|0;C=c[D+4>>2]|0;I=(c[k>>2]=c[D>>2]|0,+g[k>>2]);J=(c[k>>2]=C,+g[k>>2]);K=+g[y+(w*88&-1)+44>>2];L=+g[y+(w*88&-1)+68>>2];C=c[y+(w*88&-1)+84>>2]|0;y=c[n>>2]|0;D=y+(A*12&-1)|0;M=c[D+4>>2]|0;N=(c[k>>2]=c[D>>2]|0,+g[k>>2]);O=(c[k>>2]=M,+g[k>>2]);P=+g[y+(A*12&-1)+8>>2];M=y+(B*12&-1)|0;D=c[M+4>>2]|0;Q=(c[k>>2]=c[M>>2]|0,+g[k>>2]);R=(c[k>>2]=D,+g[k>>2]);U=+g[y+(B*12&-1)+8>>2];if((C|0)>0){V=G+K;W=O;X=N;Y=R;Z=Q;D=0;_=U;$=P;aa=x;while(1){ab=+T(+$);g[a>>2]=ab;ac=+S(+$);g[o>>2]=ac;ad=+T(+_);g[p>>2]=ad;ae=+S(+_);g[q>>2]=ae;M=(g[k>>2]=X-(E*ac-F*ab),c[k>>2]|0);af=(g[k>>2]=W-(F*ac+E*ab),c[k>>2]|0)|0;c[r>>2]=0|M;c[r+4>>2]=af;af=(g[k>>2]=Z-(I*ae-J*ad),c[k>>2]|0);M=(g[k>>2]=Y-(J*ae+I*ad),c[k>>2]|0)|0;c[s>>2]=0|af;c[s+4>>2]=M;en(f,z,d,e,D);M=c[t+4>>2]|0;ad=(c[k>>2]=c[t>>2]|0,+g[k>>2]);ae=(c[k>>2]=M,+g[k>>2]);M=c[u+4>>2]|0;ab=(c[k>>2]=c[u>>2]|0,+g[k>>2]);ac=(c[k>>2]=M,+g[k>>2]);ag=+g[v>>2];ah=ab-X;ai=ac-W;aj=ab-Z;ab=ac-Y;ak=aa<ag?aa:ag;ac=(ag+.004999999888241291)*.20000000298023224;ag=ac<0.0?ac:0.0;ac=ae*ah-ad*ai;al=ae*aj-ad*ab;am=al*L*al+(V+ac*H*ac);if(am>0.0){an=(-0.0-(ag<-.20000000298023224?-.20000000298023224:ag))/am}else{an=0.0}am=ad*an;ad=ae*an;ao=X-G*am;ap=W-G*ad;aq=$-H*(ah*ad-ai*am);ar=Z+K*am;as=Y+K*ad;at=_+L*(aj*ad-ab*am);M=D+1|0;if((M|0)==(C|0)){break}else{W=ap;X=ao;Y=as;Z=ar;D=M;_=at;$=aq;aa=ak}}au=ap;av=ao;aw=as;ax=ar;ay=at;az=aq;aA=ak;aB=c[n>>2]|0}else{au=O;av=N;aw=R;ax=Q;ay=U;az=P;aA=x;aB=y}D=aB+(A*12&-1)|0;C=(g[k>>2]=av,c[k>>2]|0);z=(g[k>>2]=au,c[k>>2]|0)|0;c[D>>2]=0|C;c[D+4>>2]=z;g[(c[n>>2]|0)+(A*12&-1)+8>>2]=az;z=(c[n>>2]|0)+(B*12&-1)|0;D=(g[k>>2]=ax,c[k>>2]|0);C=(g[k>>2]=aw,c[k>>2]|0)|0;c[z>>2]=0|D;c[z+4>>2]=C;g[(c[n>>2]|0)+(B*12&-1)+8>>2]=ay;C=w+1|0;if((C|0)<(c[h>>2]|0)){w=C;x=aA}else{j=aA;break}}l=j>=-.014999999664723873;i=b;return l|0}function ek(a){a=a|0;return}function el(a){a=a|0;return}function em(a){a=a|0;return}function en(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,l=0.0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0;if((c[b+84>>2]|0)<=0){bc(7124,617,13888,3912)}h=c[b+72>>2]|0;if((h|0)==1){i=d+12|0;j=+g[i>>2];l=+g[b+16>>2];m=d+8|0;n=+g[m>>2];o=+g[b+20>>2];p=j*l-n*o;q=l*n+j*o;r=a;s=(g[k>>2]=p,c[k>>2]|0);t=(g[k>>2]=q,c[k>>2]|0)|0;c[r>>2]=0|s;c[r+4>>2]=t;o=+g[i>>2];j=+g[b+24>>2];n=+g[m>>2];l=+g[b+28>>2];u=+g[e+12>>2];v=+g[b+(f<<3)>>2];w=+g[e+8>>2];x=+g[b+(f<<3)+4>>2];y=+g[e>>2]+(u*v-w*x);z=v*w+u*x+ +g[e+4>>2];g[a+16>>2]=p*(y-(+g[d>>2]+(o*j-n*l)))+(z-(j*n+o*l+ +g[d+4>>2]))*q- +g[b+76>>2]- +g[b+80>>2];m=a+8|0;i=(g[k>>2]=y,c[k>>2]|0);t=(g[k>>2]=z,c[k>>2]|0)|0;c[m>>2]=0|i;c[m+4>>2]=t;return}else if((h|0)==0){z=+g[d+12>>2];y=+g[b+24>>2];q=+g[d+8>>2];l=+g[b+28>>2];o=+g[d>>2]+(z*y-q*l);n=y*q+z*l+ +g[d+4>>2];l=+g[e+12>>2];z=+g[b>>2];q=+g[e+8>>2];y=+g[b+4>>2];j=+g[e>>2]+(l*z-q*y);p=z*q+l*y+ +g[e+4>>2];y=j-o;l=p-n;t=a;m=(g[k>>2]=y,c[k>>2]|0);i=(g[k>>2]=l,c[k>>2]|0)|0;c[t>>2]=0|m;c[t+4>>2]=i;q=+Q(+(y*y+l*l));if(q<1.1920928955078125e-7){A=y;B=l}else{z=1.0/q;q=y*z;g[a>>2]=q;x=l*z;g[a+4>>2]=x;A=q;B=x}i=a+8|0;t=(g[k>>2]=(o+j)*.5,c[k>>2]|0);m=(g[k>>2]=(n+p)*.5,c[k>>2]|0)|0;c[i>>2]=0|t;c[i+4>>2]=m;g[a+16>>2]=y*A+l*B- +g[b+76>>2]- +g[b+80>>2];return}else if((h|0)==2){h=e+12|0;B=+g[h>>2];l=+g[b+16>>2];m=e+8|0;A=+g[m>>2];y=+g[b+20>>2];p=B*l-A*y;n=l*A+B*y;i=a;t=(g[k>>2]=p,c[k>>2]|0);r=(g[k>>2]=n,c[k>>2]|0)|0;c[i>>2]=0|t;c[i+4>>2]=r;y=+g[h>>2];B=+g[b+24>>2];A=+g[m>>2];l=+g[b+28>>2];j=+g[d+12>>2];o=+g[b+(f<<3)>>2];x=+g[d+8>>2];q=+g[b+(f<<3)+4>>2];z=+g[d>>2]+(j*o-x*q);u=o*x+j*q+ +g[d+4>>2];g[a+16>>2]=p*(z-(+g[e>>2]+(y*B-A*l)))+(u-(B*A+y*l+ +g[e+4>>2]))*n- +g[b+76>>2]- +g[b+80>>2];b=a+8|0;a=(g[k>>2]=z,c[k>>2]|0);e=(g[k>>2]=u,c[k>>2]|0)|0;c[b>>2]=0|a;c[b+4>>2]=e;e=(g[k>>2]=-0.0-p,c[k>>2]|0);b=(g[k>>2]=-0.0-n,c[k>>2]|0)|0;c[i>>2]=0|e;c[i+4>>2]=b;return}else{return}}function eo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0.0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0.0,A=0,B=0,C=0,D=0,E=0,F=0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0,P=0.0,Q=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0.0,ao=0.0,ap=0.0,aq=0.0,ar=0.0,as=0.0,at=0.0,au=0.0,av=0.0,aw=0.0,ax=0.0,ay=0.0,az=0.0,aA=0.0,aB=0.0,aC=0.0,aD=0;e=i;i=i+52|0;f=e|0;h=e+16|0;j=e+32|0;l=a+48|0;if((c[l>>2]|0)<=0){m=0.0;n=m>=-.007499999832361937;i=e;return n|0}o=a+36|0;p=a+24|0;a=f+8|0;q=f+12|0;r=h+8|0;s=h+12|0;t=f;u=h;v=j;w=j+8|0;x=j+16|0;y=0;z=0.0;while(1){A=c[o>>2]|0;B=A+(y*88&-1)|0;C=c[A+(y*88&-1)+32>>2]|0;D=c[A+(y*88&-1)+36>>2]|0;E=A+(y*88&-1)+48|0;F=c[E+4>>2]|0;G=(c[k>>2]=c[E>>2]|0,+g[k>>2]);H=(c[k>>2]=F,+g[k>>2]);F=A+(y*88&-1)+56|0;E=c[F+4>>2]|0;I=(c[k>>2]=c[F>>2]|0,+g[k>>2]);J=(c[k>>2]=E,+g[k>>2]);E=c[A+(y*88&-1)+84>>2]|0;if((C|0)==(b|0)|(C|0)==(d|0)){K=+g[A+(y*88&-1)+40>>2];L=+g[A+(y*88&-1)+64>>2]}else{K=0.0;L=0.0}M=+g[A+(y*88&-1)+44>>2];N=+g[A+(y*88&-1)+68>>2];A=c[p>>2]|0;F=A+(C*12&-1)|0;O=c[F+4>>2]|0;P=(c[k>>2]=c[F>>2]|0,+g[k>>2]);Q=(c[k>>2]=O,+g[k>>2]);R=+g[A+(C*12&-1)+8>>2];O=A+(D*12&-1)|0;F=c[O+4>>2]|0;U=(c[k>>2]=c[O>>2]|0,+g[k>>2]);V=(c[k>>2]=F,+g[k>>2]);W=+g[A+(D*12&-1)+8>>2];if((E|0)>0){X=K+M;Y=Q;Z=P;_=V;$=U;aa=R;ab=W;F=0;ac=z;while(1){ad=+T(+aa);g[a>>2]=ad;ae=+S(+aa);g[q>>2]=ae;af=+T(+ab);g[r>>2]=af;ag=+S(+ab);g[s>>2]=ag;O=(g[k>>2]=Z-(G*ae-H*ad),c[k>>2]|0);ah=(g[k>>2]=Y-(H*ae+G*ad),c[k>>2]|0)|0;c[t>>2]=0|O;c[t+4>>2]=ah;ah=(g[k>>2]=$-(I*ag-J*af),c[k>>2]|0);O=(g[k>>2]=_-(J*ag+I*af),c[k>>2]|0)|0;c[u>>2]=0|ah;c[u+4>>2]=O;en(j,B,f,h,F);O=c[v+4>>2]|0;af=(c[k>>2]=c[v>>2]|0,+g[k>>2]);ag=(c[k>>2]=O,+g[k>>2]);O=c[w+4>>2]|0;ad=(c[k>>2]=c[w>>2]|0,+g[k>>2]);ae=(c[k>>2]=O,+g[k>>2]);ai=+g[x>>2];aj=ad-Z;ak=ae-Y;al=ad-$;ad=ae-_;am=ac<ai?ac:ai;ae=(ai+.004999999888241291)*.75;ai=ae<0.0?ae:0.0;ae=ag*aj-af*ak;an=ag*al-af*ad;ao=an*N*an+(X+ae*L*ae);if(ao>0.0){ap=(-0.0-(ai<-.20000000298023224?-.20000000298023224:ai))/ao}else{ap=0.0}ao=af*ap;af=ag*ap;aq=Z-K*ao;ar=Y-K*af;as=aa-L*(aj*af-ak*ao);at=$+M*ao;au=_+M*af;av=ab+N*(al*af-ad*ao);O=F+1|0;if((O|0)==(E|0)){break}else{Y=ar;Z=aq;_=au;$=at;aa=as;ab=av;F=O;ac=am}}aw=ar;ax=aq;ay=au;az=at;aA=as;aB=av;aC=am;aD=c[p>>2]|0}else{aw=Q;ax=P;ay=V;az=U;aA=R;aB=W;aC=z;aD=A}F=aD+(C*12&-1)|0;E=(g[k>>2]=ax,c[k>>2]|0);B=(g[k>>2]=aw,c[k>>2]|0)|0;c[F>>2]=0|E;c[F+4>>2]=B;g[(c[p>>2]|0)+(C*12&-1)+8>>2]=aA;B=(c[p>>2]|0)+(D*12&-1)|0;F=(g[k>>2]=az,c[k>>2]|0);E=(g[k>>2]=ay,c[k>>2]|0)|0;c[B>>2]=0|F;c[B+4>>2]=E;g[(c[p>>2]|0)+(D*12&-1)+8>>2]=aB;E=y+1|0;if((E|0)<(c[l>>2]|0)){y=E;z=aC}else{m=aC;break}}n=m>=-.007499999832361937;i=e;return n|0}function ep(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0,m=0;e=c6(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;b=e;c[b>>2]=16480;c[e+4>>2]=4;c[e+48>>2]=a;j=e+52|0;c[j>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;pZ(e+8|0,0,40);g[e+136>>2]=+Q(+(+g[a+16>>2]*+g[d+16>>2]));k=+g[a+20>>2];l=+g[d+20>>2];g[e+140>>2]=k>l?k:l;c[b>>2]=16652;if((c[(c[a+12>>2]|0)+4>>2]|0)==1){m=d}else{bc(6552,41,14272,9504);m=c[j>>2]|0}if((c[(c[m+12>>2]|0)+4>>2]|0)==0){h=f;i=h|0;return i|0}bc(6552,42,14272,7260);h=f;i=h|0;return i|0}function eq(b,d){b=b|0;d=d|0;var e=0,f=0;bs[c[(c[b>>2]|0)+4>>2]&2047](b);e=a[18808]|0;if((e&255)>=14){bc(3640,173,14896,4712)}f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}function er(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;b7(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function es(a){a=a|0;pT(a);return}function et(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0,m=0;e=c6(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;b=e;c[b>>2]=16480;c[e+4>>2]=4;c[e+48>>2]=a;j=e+52|0;c[j>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;pZ(e+8|0,0,40);g[e+136>>2]=+Q(+(+g[a+16>>2]*+g[d+16>>2]));k=+g[a+20>>2];l=+g[d+20>>2];g[e+140>>2]=k>l?k:l;c[b>>2]=16604;if((c[(c[a+12>>2]|0)+4>>2]|0)==1){m=d}else{bc(6384,41,14104,9504);m=c[j>>2]|0}if((c[(c[m+12>>2]|0)+4>>2]|0)==2){h=f;i=h|0;return i|0}bc(6384,42,14104,7216);h=f;i=h|0;return i|0}function eu(b,d){b=b|0;d=d|0;var e=0,f=0;bs[c[(c[b>>2]|0)+4>>2]&2047](b);e=a[18808]|0;if((e&255)>=14){bc(3640,173,14896,4712)}f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}function ev(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+252|0;g=f|0;b8(g,b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);i=f;return}function ew(a){a=a|0;pT(a);return}function ex(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0,m=0;e=c6(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;b=e;c[b>>2]=16480;c[e+4>>2]=4;c[e+48>>2]=a;j=e+52|0;c[j>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;pZ(e+8|0,0,40);g[e+136>>2]=+Q(+(+g[a+16>>2]*+g[d+16>>2]));k=+g[a+20>>2];l=+g[d+20>>2];g[e+140>>2]=k>l?k:l;c[b>>2]=16556;if((c[(c[a+12>>2]|0)+4>>2]|0)==2){m=d}else{bc(6168,41,13808,9460);m=c[j>>2]|0}if((c[(c[m+12>>2]|0)+4>>2]|0)==0){h=f;i=h|0;return i|0}bc(6168,42,13808,7260);h=f;i=h|0;return i|0}function ey(b,d){b=b|0;d=d|0;var e=0,f=0;bs[c[(c[b>>2]|0)+4>>2]&2047](b);e=a[18808]|0;if((e&255)>=14){bc(3640,173,14896,4712)}f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}function ez(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;b6(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function eA(a){a=a|0;pT(a);return}function eB(a){a=a|0;return}function eC(a,b){a=a|0;b=+b;return+0.0}function eD(a){a=a|0;return}function eE(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0;d=a+108|0;e=c[d>>2]|0;f=b+28|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];i=a+112|0;h=c[i>>2]|0;n=b+(h*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(h*12&-1)+8>>2];s=+g[a+128>>2];t=+g[a+124>>2];u=+g[a+136>>2];v=+g[a+132>>2];w=+g[a+116>>2];x=+g[a+120>>2];h=a+100|0;y=+g[h>>2];z=(+g[a+76>>2]+(w*(p+u*(-0.0-r)-(j+s*(-0.0-m)))+x*(q+r*v-(l+m*t)))+ +g[a+96>>2]*y)*(-0.0- +g[a+172>>2]);g[h>>2]=y+z;y=w*z;w=x*z;z=+g[a+156>>2];x=m- +g[a+164>>2]*(w*t-y*s);s=+g[a+160>>2];t=r+ +g[a+168>>2]*(w*v-y*u);a=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=j-z*y,c[k>>2]|0);h=(g[k>>2]=l-z*w,c[k>>2]|0)|0;c[a>>2]=0|e;c[a+4>>2]=h;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=x;d=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;h=(g[k>>2]=p+y*s,c[k>>2]|0);a=(g[k>>2]=q+w*s,c[k>>2]|0)|0;c[d>>2]=0|h;c[d+4>>2]=a;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=t;return}function eF(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+80>>2];h=+g[d+20>>2];i=+g[b+84>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function eG(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+88>>2];h=+g[d+20>>2];i=+g[b+92>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function eH(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+100>>2]*c;c=d*+g[b+120>>2];g[a>>2]=+g[b+116>>2]*d;g[a+4>>2]=c;return}function eI(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0,m=0;e=c6(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;b=e;c[b>>2]=16480;c[e+4>>2]=4;c[e+48>>2]=a;j=e+52|0;c[j>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;pZ(e+8|0,0,40);g[e+136>>2]=+Q(+(+g[a+16>>2]*+g[d+16>>2]));k=+g[a+20>>2];l=+g[d+20>>2];g[e+140>>2]=k>l?k:l;c[b>>2]=16764;if((c[(c[a+12>>2]|0)+4>>2]|0)==2){m=d}else{bc(5948,44,14752,9460);m=c[j>>2]|0}if((c[(c[m+12>>2]|0)+4>>2]|0)==2){h=f;i=h|0;return i|0}bc(5948,45,14752,7216);h=f;i=h|0;return i|0}function eJ(b,d){b=b|0;d=d|0;var e=0,f=0;bs[c[(c[b>>2]|0)+4>>2]&2047](b);e=a[18808]|0;if((e&255)>=14){bc(3640,173,14896,4712)}f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}function eK(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;ca(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function eL(a){a=a|0;pT(a);return}function eM(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+108|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+112|0;c[l>>2]=j;m=e+28|0;n=b+140|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+148|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+156>>2]=s;t=+g[i+120>>2];g[b+160>>2]=t;u=+g[e+128>>2];g[b+164>>2]=u;v=+g[i+128>>2];g[b+168>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;m=c[e+4>>2]|0;w=(c[k>>2]=c[e>>2]|0,+g[k>>2]);x=(c[k>>2]=m,+g[k>>2]);y=+g[i+(f*12&-1)+8>>2];m=d+28|0;e=c[m>>2]|0;n=e+(f*12&-1)|0;z=c[n+4>>2]|0;A=(c[k>>2]=c[n>>2]|0,+g[k>>2]);B=(c[k>>2]=z,+g[k>>2]);C=+g[e+(f*12&-1)+8>>2];z=i+(j*12&-1)|0;n=c[z+4>>2]|0;D=(c[k>>2]=c[z>>2]|0,+g[k>>2]);E=(c[k>>2]=n,+g[k>>2]);F=+g[i+(j*12&-1)+8>>2];i=e+(j*12&-1)|0;n=c[i+4>>2]|0;G=(c[k>>2]=c[i>>2]|0,+g[k>>2]);H=(c[k>>2]=n,+g[k>>2]);I=+g[e+(j*12&-1)+8>>2];J=+T(+y);K=+S(+y);y=+T(+F);L=+S(+F);F=+g[b+80>>2];M=F-(c[k>>2]=o,+g[k>>2]);F=+g[b+84>>2];N=F-(c[k>>2]=p,+g[k>>2]);F=K*M-J*N;O=J*M+K*N;p=b+124|0;o=(g[k>>2]=F,c[k>>2]|0);j=(g[k>>2]=O,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;N=+g[b+88>>2];K=N-(c[k>>2]=q,+g[k>>2]);N=+g[b+92>>2];M=N-(c[k>>2]=r,+g[k>>2]);N=L*K-y*M;J=y*K+L*M;r=b+132|0;q=(g[k>>2]=N,c[k>>2]|0);j=(g[k>>2]=J,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;j=b+116|0;M=D+N-w-F;w=E+J-x-O;r=j;q=(g[k>>2]=M,c[k>>2]|0);p=(g[k>>2]=w,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=p;p=j|0;x=+Q(+(M*M+w*w));if(x>.004999999888241291){E=1.0/x;D=M*E;g[p>>2]=D;P=E*w;R=D}else{g[p>>2]=0.0;P=0.0;R=0.0}g[b+120>>2]=P;D=P*F-O*R;w=P*N-R*J;E=t+(s+D*D*u)+w*w*v;if(E!=0.0){U=1.0/E}else{U=0.0}p=b+172|0;g[p>>2]=U;w=+g[b+68>>2];if(w>0.0){D=x- +g[b+104>>2];x=w*6.2831854820251465;w=x*U*x;M=+g[d>>2];L=M*(x*U*2.0*+g[b+72>>2]+w*M);j=b+96|0;g[j>>2]=L;if(L!=0.0){V=1.0/L}else{V=0.0}g[j>>2]=V;g[b+76>>2]=w*D*M*V;M=E+V;if(M!=0.0){W=1.0/M}else{W=0.0}g[p>>2]=W}else{g[b+96>>2]=0.0;g[b+76>>2]=0.0}if((a[d+20|0]&1)<<24>>24==0){g[b+100>>2]=0.0;W=C;M=I;V=G;E=H;D=A;w=B;p=c[m>>2]|0;j=p+(f*12&-1)|0;r=j;q=(g[k>>2]=D,c[k>>2]|0);o=(g[k>>2]=w,c[k>>2]|0);e=o;n=0;i=0;z=e;X=q;Y=0;Z=i|X;_=z|Y;$=r|0;c[$>>2]=Z;aa=r+4|0;c[aa>>2]=_;ab=c[h>>2]|0;ac=c[m>>2]|0;ad=ac+(ab*12&-1)+8|0;g[ad>>2]=W;ae=c[l>>2]|0;af=c[m>>2]|0;ag=af+(ae*12&-1)|0;ah=ag;ai=(g[k>>2]=V,c[k>>2]|0);aj=(g[k>>2]=E,c[k>>2]|0);ak=aj;al=0;am=0;an=ak;ao=ai;ap=0;aq=am|ao;ar=an|ap;as=ah|0;c[as>>2]=aq;at=ah+4|0;c[at>>2]=ar;au=c[l>>2]|0;av=c[m>>2]|0;aw=av+(au*12&-1)+8|0;g[aw>>2]=M;return}else{ax=b+100|0;L=+g[d+8>>2]*+g[ax>>2];g[ax>>2]=L;U=R*L;R=L*P;W=C-u*(R*F-U*O);M=I+v*(R*N-U*J);V=G+U*t;E=H+R*t;D=A-U*s;w=B-R*s;p=c[m>>2]|0;j=p+(f*12&-1)|0;r=j;q=(g[k>>2]=D,c[k>>2]|0);o=(g[k>>2]=w,c[k>>2]|0);e=o;n=0;i=0;z=e;X=q;Y=0;Z=i|X;_=z|Y;$=r|0;c[$>>2]=Z;aa=r+4|0;c[aa>>2]=_;ab=c[h>>2]|0;ac=c[m>>2]|0;ad=ac+(ab*12&-1)+8|0;g[ad>>2]=W;ae=c[l>>2]|0;af=c[m>>2]|0;ag=af+(ae*12&-1)|0;ah=ag;ai=(g[k>>2]=V,c[k>>2]|0);aj=(g[k>>2]=E,c[k>>2]|0);ak=aj;al=0;am=0;an=ak;ao=ai;ap=0;aq=am|ao;ar=an|ap;as=ah|0;c[as>>2]=aq;at=ah+4|0;c[at>>2]=ar;au=c[l>>2]|0;av=c[m>>2]|0;aw=av+(au*12&-1)+8|0;g[aw>>2]=M;return}}function eN(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0;if(+g[a+68>>2]>0.0){d=1;return d|0}e=a+108|0;f=c[e>>2]|0;h=b+24|0;b=c[h>>2]|0;i=b+(f*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[b+(f*12&-1)+8>>2];f=a+112|0;j=c[f>>2]|0;o=b+(j*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[b+(j*12&-1)+8>>2];t=+T(+n);u=+S(+n);v=+T(+s);w=+S(+s);x=+g[a+80>>2]- +g[a+140>>2];y=+g[a+84>>2]- +g[a+144>>2];z=u*x-t*y;A=t*x+u*y;y=+g[a+88>>2]- +g[a+148>>2];u=+g[a+92>>2]- +g[a+152>>2];x=w*y-v*u;t=v*y+w*u;u=q+x-l-z;w=r+t-m-A;y=+Q(+(u*u+w*w));if(y<1.1920928955078125e-7){B=0.0;C=u;D=w}else{v=1.0/y;B=y;C=u*v;D=w*v}v=B- +g[a+104>>2];B=v<.20000000298023224?v:.20000000298023224;v=B<-.20000000298023224?-.20000000298023224:B;B=v*(-0.0- +g[a+172>>2]);w=C*B;C=D*B;B=+g[a+156>>2];D=n- +g[a+164>>2]*(z*C-A*w);A=+g[a+160>>2];z=s+ +g[a+168>>2]*(x*C-t*w);a=(g[k>>2]=l-B*w,c[k>>2]|0);j=(g[k>>2]=m-B*C,c[k>>2]|0)|0;c[i>>2]=0|a;c[i+4>>2]=j;g[(c[h>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=D;e=(c[h>>2]|0)+((c[f>>2]|0)*12&-1)|0;j=(g[k>>2]=q+A*w,c[k>>2]|0);i=(g[k>>2]=r+A*C,c[k>>2]|0)|0;c[e>>2]=0|j;c[e+4>>2]=i;g[(c[h>>2]|0)+((c[f>>2]|0)*12&-1)+8>>2]=z;if(v>0.0){E=v}else{E=-0.0-v}d=E<.004999999888241291;return d|0}function eO(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;c7(5868,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(9068,(v=i,i=i+4|0,c[v>>2]=e,v)|0);c7(6732,(v=i,i=i+4|0,c[v>>2]=f,v)|0);c7(4924,(v=i,i=i+4|0,c[v>>2]=a[b+61|0]&1,v)|0);j=+g[b+84>>2];c7(4240,(v=i,i=i+16|0,h[k>>3]=+g[b+80>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);j=+g[b+92>>2];c7(3816,(v=i,i=i+16|0,h[k>>3]=+g[b+88>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);c7(3476,(v=i,i=i+8|0,h[k>>3]=+g[b+104>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(10352,(v=i,i=i+8|0,h[k>>3]=+g[b+68>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(10080,(v=i,i=i+8|0,h[k>>3]=+g[b+72>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(9548,(v=i,i=i+4|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function eP(a){a=a|0;pT(a);return}function eQ(a,b){a=a|0;b=b|0;return 1}function eR(a){a=a|0;return}function eS(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function eT(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function eU(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+88>>2]*c;g[a>>2]=+g[b+84>>2]*c;g[a+4>>2]=d;return}function eV(a,b){a=a|0;b=+b;return+(+g[a+92>>2]*b)}function eW(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,U=0.0,V=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+104|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+108|0;c[l>>2]=j;m=e+28|0;n=b+128|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+136|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+144>>2]=s;t=+g[i+120>>2];g[b+148>>2]=t;u=+g[e+128>>2];g[b+152>>2]=u;v=+g[i+128>>2];g[b+156>>2]=v;i=c[d+24>>2]|0;w=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;x=c[n+4>>2]|0;y=(c[k>>2]=c[n>>2]|0,+g[k>>2]);z=(c[k>>2]=x,+g[k>>2]);A=+g[m+(f*12&-1)+8>>2];B=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;x=c[i+4>>2]|0;C=(c[k>>2]=c[i>>2]|0,+g[k>>2]);D=(c[k>>2]=x,+g[k>>2]);E=+g[m+(j*12&-1)+8>>2];F=+T(+w);G=+S(+w);w=+T(+B);H=+S(+B);B=+g[b+68>>2];I=B-(c[k>>2]=o,+g[k>>2]);B=+g[b+72>>2];J=B-(c[k>>2]=p,+g[k>>2]);B=G*I-F*J;K=F*I+G*J;p=b+112|0;o=(g[k>>2]=B,c[k>>2]|0);j=(g[k>>2]=K,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;J=+g[b+76>>2];G=J-(c[k>>2]=q,+g[k>>2]);J=+g[b+80>>2];I=J-(c[k>>2]=r,+g[k>>2]);J=H*G-w*I;F=w*G+H*I;r=b+120|0;q=(g[k>>2]=J,c[k>>2]|0);j=(g[k>>2]=F,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;I=s+t;H=I+K*u*K+F*v*F;G=v*J;w=K*B*(-0.0-u)-F*G;L=I+B*u*B+J*G;G=H*L-w*w;if(G!=0.0){M=1.0/G}else{M=G}G=w*(-0.0-M);g[b+160>>2]=L*M;g[b+164>>2]=G;g[b+168>>2]=G;g[b+172>>2]=H*M;M=u+v;if(M>0.0){N=1.0/M}else{N=M}g[b+176>>2]=N;j=b+84|0;if((a[d+20|0]&1)<<24>>24==0){g[j>>2]=0.0;g[b+88>>2]=0.0;g[b+92>>2]=0.0;O=A;P=E;Q=C;R=D;U=y;V=z}else{r=d+8|0;N=+g[r>>2];d=j|0;M=N*+g[d>>2];g[d>>2]=M;d=b+88|0;H=N*+g[d>>2];g[d>>2]=H;d=b+92|0;N=+g[r>>2]*+g[d>>2];g[d>>2]=N;O=A-u*(N+(H*B-M*K));P=E+v*(N+(H*J-M*F));Q=C+t*M;R=D+t*H;U=y-s*M;V=z-s*H}d=(c[e>>2]|0)+(f*12&-1)|0;f=(g[k>>2]=U,c[k>>2]|0);r=(g[k>>2]=V,c[k>>2]|0)|0;c[d>>2]=0|f;c[d+4>>2]=r;g[(c[e>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=O;h=(c[e>>2]|0)+((c[l>>2]|0)*12&-1)|0;r=(g[k>>2]=Q,c[k>>2]|0);d=(g[k>>2]=R,c[k>>2]|0)|0;c[h>>2]=0|r;c[h+4>>2]=d;g[(c[e>>2]|0)+((c[l>>2]|0)*12&-1)+8>>2]=P;return}function eX(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0;d=a+104|0;e=c[d>>2]|0;f=b+28|0;h=c[f>>2]|0;i=h+(e*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[h+(e*12&-1)+8>>2];j=a+108|0;i=c[j>>2]|0;o=h+(i*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[h+(i*12&-1)+8>>2];t=+g[a+144>>2];u=+g[a+148>>2];v=+g[a+152>>2];w=+g[a+156>>2];x=+g[b>>2];b=a+92|0;y=+g[b>>2];z=x*+g[a+100>>2];A=y+(s-n)*(-0.0- +g[a+176>>2]);B=-0.0-z;C=A<z?A:z;z=C<B?B:C;g[b>>2]=z;C=z-y;y=n-v*C;n=s+w*C;C=+g[a+124>>2];s=+g[a+120>>2];z=+g[a+116>>2];B=+g[a+112>>2];A=q+C*(-0.0-n)-l-z*(-0.0-y);D=r+s*n-m-B*y;E=+g[a+168>>2]*D+ +g[a+160>>2]*A;F=+g[a+172>>2]*D+ +g[a+164>>2]*A;b=a+84|0;i=b;h=c[i+4>>2]|0;A=(c[k>>2]=c[i>>2]|0,+g[k>>2]);D=(c[k>>2]=h,+g[k>>2]);h=b|0;G=A-E;g[h>>2]=G;b=a+88|0;E=+g[b>>2]-F;g[b>>2]=E;F=x*+g[a+96>>2];x=G*G+E*E;if(x>F*F){H=+Q(+x);if(H<1.1920928955078125e-7){I=G;J=E}else{x=1.0/H;H=G*x;g[h>>2]=H;K=E*x;g[b>>2]=K;I=H;J=K}K=F*I;g[h>>2]=K;I=F*J;g[b>>2]=I;L=K;M=I}else{L=G;M=E}E=L-A;A=M-D;b=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=l-t*E,c[k>>2]|0);h=(g[k>>2]=m-t*A,c[k>>2]|0)|0;c[b>>2]=0|e;c[b+4>>2]=h;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=y-v*(B*A-E*z);d=(c[f>>2]|0)+((c[j>>2]|0)*12&-1)|0;h=(g[k>>2]=q+u*E,c[k>>2]|0);b=(g[k>>2]=r+u*A,c[k>>2]|0)|0;c[d>>2]=0|h;c[d+4>>2]=b;g[(c[f>>2]|0)+((c[j>>2]|0)*12&-1)+8>>2]=n+w*(A*s-E*C);return}function eY(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;c7(5128,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(9068,(v=i,i=i+4|0,c[v>>2]=e,v)|0);c7(6732,(v=i,i=i+4|0,c[v>>2]=f,v)|0);c7(4924,(v=i,i=i+4|0,c[v>>2]=a[b+61|0]&1,v)|0);j=+g[b+72>>2];c7(4240,(v=i,i=i+16|0,h[k>>3]=+g[b+68>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);j=+g[b+80>>2];c7(3816,(v=i,i=i+16|0,h[k>>3]=+g[b+76>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);c7(2672,(v=i,i=i+8|0,h[k>>3]=+g[b+96>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(10412,(v=i,i=i+8|0,h[k>>3]=+g[b+100>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(9548,(v=i,i=i+4|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function eZ(a){a=a|0;pT(a);return}function e_(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0;e=b|0;c[e>>2]=16504;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){bc(5328,173,13288,6976)}c[b+4>>2]=c[d>>2]|0;c[b+8>>2]=0;c[b+12>>2]=0;i=b+48|0;c[i>>2]=c[f>>2]|0;f=b+52|0;c[f>>2]=c[h>>2]|0;c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2]|0;pZ(b+16|0,0,32);c[e>>2]=17384;e=b+92|0;h=b+100|0;j=b+108|0;l=b+116|0;m=b+124|0;n=b+132|0;o=d+20|0;p=c[o>>2]|0;q=b+68|0;c[q>>2]=p;r=d+24|0;s=c[r>>2]|0;t=b+72|0;c[t>>2]=s;u=c[p+4>>2]|0;p=b+76|0;c[p>>2]=u;v=c[s+4>>2]|0;s=b+80|0;c[s>>2]=v;if((u-1|0)>>>0<2){w=v}else{bc(5436,53,15820,9344);w=c[s>>2]|0}if((w-1|0)>>>0>=2){bc(5436,54,15820,7064)}w=c[q>>2]|0;q=c[w+48>>2]|0;c[b+84>>2]=q;v=c[w+52>>2]|0;c[i>>2]=v;x=+g[v+20>>2];y=+g[v+24>>2];z=+g[q+20>>2];A=+g[q+24>>2];i=c[o>>2]|0;if((c[p>>2]|0)==1){B=+g[v+56>>2];C=+g[q+56>>2];p=i+68|0;o=j;w=c[p+4>>2]|0;c[o>>2]=c[p>>2]|0;c[o+4>>2]=w;w=i+76|0;o=e;p=c[w+4>>2]|0;c[o>>2]=c[w>>2]|0;c[o+4>>2]=p;D=+g[i+116>>2];g[b+140>>2]=D;g[m>>2]=0.0;g[b+128>>2]=0.0;E=B-C-D}else{D=+g[q+16>>2];C=+g[q+12>>2];B=+g[v+16>>2];F=+g[v+12>>2];v=i+68|0;q=j;j=c[v>>2]|0;p=c[v+4>>2]|0;c[q>>2]=j;c[q+4>>2]=p;q=i+76|0;v=e;e=c[q>>2]|0;o=c[q+4>>2]|0;c[v>>2]=e;c[v+4>>2]=o;g[b+140>>2]=+g[i+100>>2];v=i+84|0;i=m;m=c[v>>2]|0;q=c[v+4>>2]|0;c[i>>2]=m;c[i+4>>2]=q;G=(c[k>>2]=j,+g[k>>2]);H=(c[k>>2]=p,+g[k>>2]);I=(c[k>>2]=e,+g[k>>2]);J=(c[k>>2]=o,+g[k>>2]);K=F-C+(y*I-x*J);C=B-D+(x*I+y*J);J=(c[k>>2]=m,+g[k>>2])*(A*K+z*C-G);E=J+(c[k>>2]=q,+g[k>>2])*(K*(-0.0-z)+A*C-H)}q=c[t>>2]|0;t=c[q+48>>2]|0;c[b+88>>2]=t;m=c[q+52>>2]|0;c[f>>2]=m;H=+g[m+20>>2];C=+g[m+24>>2];A=+g[t+20>>2];z=+g[t+24>>2];f=c[r>>2]|0;if((c[s>>2]|0)==1){K=+g[m+56>>2];J=+g[t+56>>2];s=f+68|0;r=l;q=c[s+4>>2]|0;c[r>>2]=c[s>>2]|0;c[r+4>>2]=q;q=f+76|0;r=h;s=c[q+4>>2]|0;c[r>>2]=c[q>>2]|0;c[r+4>>2]=s;G=+g[f+116>>2];g[b+144>>2]=G;g[n>>2]=0.0;g[b+136>>2]=0.0;y=K-J-G;s=d+28|0;G=+g[s>>2];r=b+152|0;g[r>>2]=G;J=y*G;K=E+J;q=b+148|0;g[q>>2]=K;o=b+156|0;g[o>>2]=0.0;return}else{I=+g[t+16>>2];x=+g[t+12>>2];D=+g[m+16>>2];B=+g[m+12>>2];m=f+68|0;t=l;l=c[m>>2]|0;e=c[m+4>>2]|0;c[t>>2]=l;c[t+4>>2]=e;t=f+76|0;m=h;h=c[t>>2]|0;p=c[t+4>>2]|0;c[m>>2]=h;c[m+4>>2]=p;g[b+144>>2]=+g[f+100>>2];m=f+84|0;f=n;n=c[m>>2]|0;t=c[m+4>>2]|0;c[f>>2]=n;c[f+4>>2]=t;F=(c[k>>2]=l,+g[k>>2]);L=(c[k>>2]=e,+g[k>>2]);M=(c[k>>2]=h,+g[k>>2]);N=(c[k>>2]=p,+g[k>>2]);O=B-x+(C*M-H*N);x=D-I+(H*M+C*N);N=(c[k>>2]=n,+g[k>>2])*(z*O+A*x-F);y=N+(c[k>>2]=t,+g[k>>2])*(O*(-0.0-A)+z*x-L);s=d+28|0;G=+g[s>>2];r=b+152|0;g[r>>2]=G;J=y*G;K=E+J;q=b+148|0;g[q>>2]=K;o=b+156|0;g[o>>2]=0.0;return}}function e$(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0.0,v=0.0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0;d=a+160|0;e=c[d>>2]|0;f=b+28|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];i=a+164|0;h=c[i>>2]|0;n=b+(h*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(h*12&-1)+8>>2];h=a+168|0;o=c[h>>2]|0;n=b+(o*12&-1)|0;s=c[n+4>>2]|0;t=(c[k>>2]=c[n>>2]|0,+g[k>>2]);u=(c[k>>2]=s,+g[k>>2]);v=+g[b+(o*12&-1)+8>>2];o=a+172|0;s=c[o>>2]|0;n=b+(s*12&-1)|0;w=c[n+4>>2]|0;x=(c[k>>2]=c[n>>2]|0,+g[k>>2]);y=(c[k>>2]=w,+g[k>>2]);z=+g[b+(s*12&-1)+8>>2];A=+g[a+240>>2];B=+g[a+244>>2];C=+g[a+248>>2];D=+g[a+252>>2];E=+g[a+256>>2];F=+g[a+264>>2];G=+g[a+260>>2];H=+g[a+268>>2];I=((j-t)*A+(l-u)*B+((p-x)*C+(q-y)*D)+(m*E-v*F+(r*G-z*H)))*(-0.0- +g[a+272>>2]);s=a+156|0;g[s>>2]=+g[s>>2]+I;J=+g[a+208>>2]*I;K=m+I*+g[a+224>>2]*E;E=I*+g[a+212>>2];m=r+I*+g[a+228>>2]*G;G=I*+g[a+216>>2];r=v-I*+g[a+232>>2]*F;F=I*+g[a+220>>2];v=z-I*+g[a+236>>2]*H;a=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=j+A*J,c[k>>2]|0);s=(g[k>>2]=l+B*J,c[k>>2]|0)|0;c[a>>2]=0|e;c[a+4>>2]=s;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=K;d=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;s=(g[k>>2]=p+C*E,c[k>>2]|0);a=(g[k>>2]=q+E*D,c[k>>2]|0)|0;c[d>>2]=0|s;c[d+4>>2]=a;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=m;i=(c[f>>2]|0)+((c[h>>2]|0)*12&-1)|0;a=(g[k>>2]=t-A*G,c[k>>2]|0);d=(g[k>>2]=u-B*G,c[k>>2]|0)|0;c[i>>2]=0|a;c[i+4>>2]=d;g[(c[f>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=r;h=(c[f>>2]|0)+((c[o>>2]|0)*12&-1)|0;d=(g[k>>2]=x-C*F,c[k>>2]|0);i=(g[k>>2]=y-D*F,c[k>>2]|0)|0;c[h>>2]=0|d;c[h+4>>2]=i;g[(c[f>>2]|0)+((c[o>>2]|0)*12&-1)+8>>2]=v;return}function e0(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0.0,ao=0.0,ap=0.0,aq=0.0,ar=0.0,as=0.0,at=0.0,au=0.0,av=0.0,aw=0.0,ax=0.0,ay=0.0,az=0.0,aA=0.0,aB=0.0,aC=0.0,aD=0.0,aE=0.0,aF=0.0,aG=0.0,aH=0.0,aI=0.0,aJ=0.0,aK=0.0,aL=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+160|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+164|0;c[l>>2]=j;m=c[b+84>>2]|0;n=c[m+8>>2]|0;o=b+168|0;c[o>>2]=n;p=c[b+88>>2]|0;q=c[p+8>>2]|0;r=b+172|0;c[r>>2]=q;s=e+28|0;t=b+176|0;u=c[s>>2]|0;v=c[s+4>>2]|0;c[t>>2]=u;c[t+4>>2]=v;t=i+28|0;s=b+184|0;w=c[t>>2]|0;x=c[t+4>>2]|0;c[s>>2]=w;c[s+4>>2]=x;s=m+28|0;t=b+192|0;y=c[s>>2]|0;z=c[s+4>>2]|0;c[t>>2]=y;c[t+4>>2]=z;t=p+28|0;s=b+200|0;A=c[t>>2]|0;B=c[t+4>>2]|0;c[s>>2]=A;c[s+4>>2]=B;C=+g[e+120>>2];g[b+208>>2]=C;D=+g[i+120>>2];g[b+212>>2]=D;E=+g[m+120>>2];g[b+216>>2]=E;F=+g[p+120>>2];g[b+220>>2]=F;G=+g[e+128>>2];g[b+224>>2]=G;H=+g[i+128>>2];g[b+228>>2]=H;I=+g[m+128>>2];g[b+232>>2]=I;J=+g[p+128>>2];g[b+236>>2]=J;p=c[d+24>>2]|0;K=+g[p+(f*12&-1)+8>>2];m=d+28|0;i=c[m>>2]|0;e=i+(f*12&-1)|0;s=c[e+4>>2]|0;L=(c[k>>2]=c[e>>2]|0,+g[k>>2]);M=(c[k>>2]=s,+g[k>>2]);N=+g[i+(f*12&-1)+8>>2];O=+g[p+(j*12&-1)+8>>2];s=i+(j*12&-1)|0;e=c[s+4>>2]|0;P=(c[k>>2]=c[s>>2]|0,+g[k>>2]);Q=(c[k>>2]=e,+g[k>>2]);R=+g[i+(j*12&-1)+8>>2];U=+g[p+(n*12&-1)+8>>2];j=i+(n*12&-1)|0;e=c[j+4>>2]|0;V=(c[k>>2]=c[j>>2]|0,+g[k>>2]);W=(c[k>>2]=e,+g[k>>2]);X=+g[i+(n*12&-1)+8>>2];Y=+g[p+(q*12&-1)+8>>2];p=i+(q*12&-1)|0;n=c[p+4>>2]|0;Z=(c[k>>2]=c[p>>2]|0,+g[k>>2]);_=(c[k>>2]=n,+g[k>>2]);$=+g[i+(q*12&-1)+8>>2];aa=+T(+K);ab=+S(+K);K=+T(+O);ac=+S(+O);O=+T(+U);ad=+S(+U);U=+T(+Y);ae=+S(+Y);q=b+272|0;g[q>>2]=0.0;i=(c[b+76>>2]|0)==1;Y=(c[k>>2]=A,+g[k>>2]);af=(c[k>>2]=B,+g[k>>2]);ag=(c[k>>2]=w,+g[k>>2]);ah=(c[k>>2]=x,+g[k>>2]);if(i){g[b+240>>2]=0.0;g[b+244>>2]=0.0;g[b+256>>2]=1.0;g[b+264>>2]=1.0;ai=G+I;aj=0.0;ak=0.0;al=1.0;am=1.0}else{an=(c[k>>2]=v,+g[k>>2]);ao=(c[k>>2]=u,+g[k>>2]);ap=(c[k>>2]=z,+g[k>>2]);aq=+g[b+124>>2];ar=+g[b+128>>2];as=ad*aq-O*ar;at=O*aq+ad*ar;ar=+g[b+108>>2]-(c[k>>2]=y,+g[k>>2]);aq=+g[b+112>>2]-ap;ap=+g[b+92>>2]-ao;ao=+g[b+96>>2]-an;y=b+240|0;z=(g[k>>2]=as,c[k>>2]|0);u=(g[k>>2]=at,c[k>>2]|0)|0;c[y>>2]=0|z;c[y+4>>2]=u;an=at*(ad*ar-O*aq)-as*(O*ar+ad*aq);g[b+264>>2]=an;aq=at*(ab*ap-aa*ao)-as*(aa*ap+ab*ao);g[b+256>>2]=aq;ai=E+C+an*I*an+aq*G*aq;aj=as;ak=at;al=aq;am=an}an=ai+0.0;g[q>>2]=an;if((c[b+80>>2]|0)==1){g[b+248>>2]=0.0;g[b+252>>2]=0.0;ai=+g[b+152>>2];g[b+260>>2]=ai;g[b+268>>2]=ai;au=ai*ai*(H+J);av=0.0;aw=0.0;ax=ai;ay=ai}else{ai=+g[b+132>>2];aq=+g[b+136>>2];at=ae*ai-U*aq;as=U*ai+ae*aq;aq=+g[b+116>>2]-Y;Y=+g[b+120>>2]-af;af=+g[b+100>>2]-ag;ag=+g[b+104>>2]-ah;ah=+g[b+152>>2];ai=at*ah;ao=as*ah;u=b+248|0;y=(g[k>>2]=ai,c[k>>2]|0);z=(g[k>>2]=ao,c[k>>2]|0)|0;c[u>>2]=0|y;c[u+4>>2]=z;ab=(as*(ae*aq-U*Y)-at*(U*aq+ae*Y))*ah;g[b+268>>2]=ab;Y=ah*(as*(ac*af-K*ag)-at*(K*af+ac*ag));g[b+260>>2]=Y;au=ah*ah*(F+D)+ab*J*ab+Y*Y*H;av=ai;aw=ao;ax=Y;ay=ab}ab=an+au;g[q>>2]=ab;if(ab>0.0){az=1.0/ab}else{az=0.0}g[q>>2]=az;q=b+156|0;if((a[d+20|0]&1)<<24>>24==0){g[q>>2]=0.0;aA=$;aB=N;aC=X;aD=R;aE=Z;aF=_;aG=V;aH=W;aI=P;aJ=Q;aK=L;aL=M}else{az=+g[q>>2];ab=C*az;C=az*D;D=az*E;E=az*F;aA=$-az*J*ay;aB=N+az*G*al;aC=X-az*I*am;aD=R+az*H*ax;aE=Z-av*E;aF=_-aw*E;aG=V-aj*D;aH=W-ak*D;aI=P+av*C;aJ=Q+C*aw;aK=L+aj*ab;aL=M+ab*ak}q=(c[m>>2]|0)+(f*12&-1)|0;f=(g[k>>2]=aK,c[k>>2]|0);d=(g[k>>2]=aL,c[k>>2]|0)|0;c[q>>2]=0|f;c[q+4>>2]=d;g[(c[m>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=aB;h=(c[m>>2]|0)+((c[l>>2]|0)*12&-1)|0;d=(g[k>>2]=aI,c[k>>2]|0);q=(g[k>>2]=aJ,c[k>>2]|0)|0;c[h>>2]=0|d;c[h+4>>2]=q;g[(c[m>>2]|0)+((c[l>>2]|0)*12&-1)+8>>2]=aD;l=(c[m>>2]|0)+((c[o>>2]|0)*12&-1)|0;q=(g[k>>2]=aG,c[k>>2]|0);h=(g[k>>2]=aH,c[k>>2]|0)|0;c[l>>2]=0|q;c[l+4>>2]=h;g[(c[m>>2]|0)+((c[o>>2]|0)*12&-1)+8>>2]=aC;o=(c[m>>2]|0)+((c[r>>2]|0)*12&-1)|0;h=(g[k>>2]=aE,c[k>>2]|0);l=(g[k>>2]=aF,c[k>>2]|0)|0;c[o>>2]=0|h;c[o+4>>2]=l;g[(c[m>>2]|0)+((c[r>>2]|0)*12&-1)+8>>2]=aA;return}function e1(a){a=a|0;return}function e2(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+92>>2];h=+g[d+20>>2];i=+g[b+96>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function e3(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+100>>2];h=+g[d+20>>2];i=+g[b+104>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function e4(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0;d=+g[b+156>>2];e=d*+g[b+244>>2]*c;g[a>>2]=d*+g[b+240>>2]*c;g[a+4>>2]=e;return}function e5(a,b){a=a|0;b=+b;return+(+g[a+156>>2]*+g[a+256>>2]*b)}function e6(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0.0,v=0.0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0;d=a+160|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];e=a+164|0;i=c[e>>2]|0;n=b+(i*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(i*12&-1)+8>>2];i=a+168|0;o=c[i>>2]|0;n=b+(o*12&-1)|0;s=c[n+4>>2]|0;t=(c[k>>2]=c[n>>2]|0,+g[k>>2]);u=(c[k>>2]=s,+g[k>>2]);v=+g[b+(o*12&-1)+8>>2];o=a+172|0;s=c[o>>2]|0;n=b+(s*12&-1)|0;w=c[n+4>>2]|0;x=(c[k>>2]=c[n>>2]|0,+g[k>>2]);y=(c[k>>2]=w,+g[k>>2]);z=+g[b+(s*12&-1)+8>>2];A=+T(+m);B=+S(+m);C=+T(+r);D=+S(+r);E=+T(+v);F=+S(+v);G=+T(+z);H=+S(+z);if((c[a+76>>2]|0)==1){I=+g[a+224>>2];J=+g[a+232>>2];K=I+J;L=1.0;M=1.0;N=m-v- +g[a+140>>2];O=0.0;P=0.0;Q=I;R=J}else{J=+g[a+124>>2];I=+g[a+128>>2];U=F*J-E*I;V=E*J+F*I;W=+g[a+108>>2]- +g[a+192>>2];X=+g[a+112>>2]- +g[a+196>>2];Y=+g[a+92>>2]- +g[a+176>>2];Z=+g[a+96>>2]- +g[a+180>>2];_=B*Y-A*Z;$=A*Y+B*Z;Z=V*(F*W-E*X)-U*(E*W+F*X);B=V*_-U*$;Y=+g[a+232>>2];A=+g[a+224>>2];aa=j-t+_;_=l-u+$;K=+g[a+216>>2]+ +g[a+208>>2]+Z*Z*Y+B*A*B;L=Z;M=B;N=J*(F*aa+E*_-W)+I*(aa*(-0.0-E)+F*_-X);O=U;P=V;Q=A;R=Y}if((c[a+80>>2]|0)==1){Y=+g[a+152>>2];A=+g[a+228>>2];V=+g[a+236>>2];ab=Y*Y*(A+V);ac=Y;ad=Y;ae=r-z- +g[a+144>>2];af=0.0;ag=0.0;ah=Y;ai=A;aj=V}else{V=+g[a+132>>2];A=+g[a+136>>2];Y=H*V-G*A;U=G*V+H*A;X=+g[a+116>>2]- +g[a+200>>2];_=+g[a+120>>2]- +g[a+204>>2];F=+g[a+100>>2]- +g[a+184>>2];E=+g[a+104>>2]- +g[a+188>>2];aa=D*F-C*E;I=C*F+D*E;E=+g[a+152>>2];D=E*(U*(H*X-G*_)-Y*(G*X+H*_));F=E*(U*aa-Y*I);C=+g[a+236>>2];W=+g[a+228>>2];J=p-x+aa;aa=q-y+I;ab=E*E*(+g[a+220>>2]+ +g[a+212>>2])+D*D*C+F*W*F;ac=D;ad=F;ae=V*(H*J+G*aa-X)+A*(J*(-0.0-G)+H*aa-_);af=Y*E;ag=U*E;ah=E;ai=W;aj=C}C=K+0.0+ab;if(C>0.0){ak=(-0.0-(N+ae*ah- +g[a+148>>2]))/C}else{ak=0.0}C=ak*+g[a+208>>2];ah=ak*+g[a+212>>2];ae=ak*+g[a+216>>2];N=ak*+g[a+220>>2];a=(g[k>>2]=j+O*C,c[k>>2]|0);s=(g[k>>2]=l+P*C,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=s;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=m+M*ak*Q;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;s=(g[k>>2]=p+af*ah,c[k>>2]|0);h=(g[k>>2]=q+ag*ah,c[k>>2]|0)|0;c[d>>2]=0|s;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=r+ad*ak*ai;e=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;h=(g[k>>2]=t-O*ae,c[k>>2]|0);d=(g[k>>2]=u-P*ae,c[k>>2]|0)|0;c[e>>2]=0|h;c[e+4>>2]=d;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=v-L*ak*R;i=(c[f>>2]|0)+((c[o>>2]|0)*12&-1)|0;d=(g[k>>2]=x-af*N,c[k>>2]|0);e=(g[k>>2]=y-ag*N,c[k>>2]|0)|0;c[i>>2]=0|d;c[i+4>>2]=e;g[(c[f>>2]|0)+((c[o>>2]|0)*12&-1)+8>>2]=z-ac*ak*aj;return 1}function e7(b){b=b|0;var d=0,e=0,f=0,j=0,l=0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;j=c[(c[b+68>>2]|0)+56>>2]|0;l=c[(c[b+72>>2]|0)+56>>2]|0;c7(4344,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(9068,(v=i,i=i+4|0,c[v>>2]=e,v)|0);c7(6732,(v=i,i=i+4|0,c[v>>2]=f,v)|0);c7(4924,(v=i,i=i+4|0,c[v>>2]=a[b+61|0]&1,v)|0);c7(2900,(v=i,i=i+4|0,c[v>>2]=j,v)|0);c7(2644,(v=i,i=i+4|0,c[v>>2]=l,v)|0);c7(9212,(v=i,i=i+8|0,h[k>>3]=+g[b+152>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(9548,(v=i,i=i+4|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function e8(a){a=a|0;pT(a);return}function e9(a){a=a|0;return}function fa(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;e=b|0;f=c[e>>2]|0;if((f|0)==3){h=c6(d,176)|0;if((h|0)==0){i=0}else{j=h;c[j>>2]=16504;k=b+8|0;l=b+12|0;if((c[k>>2]|0)==(c[l>>2]|0)){bc(5328,173,13288,6976)}c[h+4>>2]=c[e>>2]|0;c[h+8>>2]=0;c[h+12>>2]=0;c[h+48>>2]=c[k>>2]|0;c[h+52>>2]=c[l>>2]|0;c[h+56>>2]=0;a[h+61|0]=a[b+16|0]&1;a[h+60|0]=0;c[h+64>>2]=c[b+4>>2]|0;pZ(h+16|0,0,32);c[j>>2]=16892;j=b+20|0;l=h+80|0;k=c[j+4>>2]|0;c[l>>2]=c[j>>2]|0;c[l+4>>2]=k;k=b+28|0;l=h+88|0;j=c[k+4>>2]|0;c[l>>2]=c[k>>2]|0;c[l+4>>2]=j;g[h+104>>2]=+g[b+36>>2];g[h+68>>2]=+g[b+40>>2];g[h+72>>2]=+g[b+44>>2];g[h+100>>2]=0.0;g[h+96>>2]=0.0;g[h+76>>2]=0.0;i=h}h=i|0;return h|0}else if((f|0)==1){i=c6(d,228)|0;if((i|0)==0){m=0}else{j=i;c[j>>2]=16504;l=b+8|0;k=b+12|0;if((c[l>>2]|0)==(c[k>>2]|0)){bc(5328,173,13288,6976)}c[i+4>>2]=c[e>>2]|0;c[i+8>>2]=0;c[i+12>>2]=0;c[i+48>>2]=c[l>>2]|0;c[i+52>>2]=c[k>>2]|0;c[i+56>>2]=0;a[i+61|0]=a[b+16|0]&1;a[i+60|0]=0;c[i+64>>2]=c[b+4>>2]|0;pZ(i+16|0,0,32);c[j>>2]=16788;j=b+20|0;k=i+68|0;l=c[j+4>>2]|0;c[k>>2]=c[j>>2]|0;c[k+4>>2]=l;l=b+28|0;k=i+76|0;j=c[l+4>>2]|0;c[k>>2]=c[l>>2]|0;c[k+4>>2]=j;g[i+116>>2]=+g[b+36>>2];pZ(i+84|0,0,16);g[i+120>>2]=+g[b+44>>2];g[i+124>>2]=+g[b+48>>2];g[i+104>>2]=+g[b+60>>2];g[i+108>>2]=+g[b+56>>2];a[i+112|0]=a[b+40|0]&1;a[i+100|0]=a[b+52|0]&1;c[i+224>>2]=0;m=i}h=m|0;return h|0}else if((f|0)==5){m=c6(d,168)|0;if((m|0)==0){n=0}else{i=m;fk(i,b);n=i}h=n|0;return h|0}else if((f|0)==8){n=c6(d,208)|0;if((n|0)==0){o=0}else{i=n;c[i>>2]=16504;m=b+8|0;j=b+12|0;if((c[m>>2]|0)==(c[j>>2]|0)){bc(5328,173,13288,6976)}c[n+4>>2]=c[e>>2]|0;c[n+8>>2]=0;c[n+12>>2]=0;c[n+48>>2]=c[m>>2]|0;c[n+52>>2]=c[j>>2]|0;c[n+56>>2]=0;a[n+61|0]=a[b+16|0]&1;a[n+60|0]=0;c[n+64>>2]=c[b+4>>2]|0;pZ(n+16|0,0,32);c[i>>2]=17280;i=b+20|0;j=n+80|0;m=c[i+4>>2]|0;c[j>>2]=c[i>>2]|0;c[j+4>>2]=m;m=b+28|0;j=n+88|0;i=c[m+4>>2]|0;c[j>>2]=c[m>>2]|0;c[j+4>>2]=i;g[n+96>>2]=+g[b+36>>2];g[n+68>>2]=+g[b+40>>2];g[n+72>>2]=+g[b+44>>2];g[n+104>>2]=0.0;g[n+108>>2]=0.0;g[n+112>>2]=0.0;o=n}h=o|0;return h|0}else if((f|0)==2){o=c6(d,256)|0;if((o|0)==0){p=0}else{n=o;fp(n,b);p=n}h=p|0;return h|0}else if((f|0)==4){p=c6(d,196)|0;if((p|0)==0){q=0}else{n=p;fG(n,b);q=n}h=q|0;return h|0}else if((f|0)==7){q=c6(d,224)|0;if((q|0)==0){r=0}else{n=q;ge(n,b);r=n}h=r|0;return h|0}else if((f|0)==6){r=c6(d,276)|0;if((r|0)==0){s=0}else{n=r;e_(n,b);s=n}h=s|0;return h|0}else if((f|0)==9){s=c6(d,180)|0;if((s|0)==0){t=0}else{n=s;c[n>>2]=16504;r=b+8|0;q=b+12|0;if((c[r>>2]|0)==(c[q>>2]|0)){bc(5328,173,13288,6976)}c[s+4>>2]=c[e>>2]|0;c[s+8>>2]=0;c[s+12>>2]=0;c[s+48>>2]=c[r>>2]|0;c[s+52>>2]=c[q>>2]|0;c[s+56>>2]=0;a[s+61|0]=a[b+16|0]&1;a[s+60|0]=0;c[s+64>>2]=c[b+4>>2]|0;pZ(s+16|0,0,32);c[n>>2]=16840;n=b+20|0;q=s+68|0;r=c[n+4>>2]|0;c[q>>2]=c[n>>2]|0;c[q+4>>2]=r;r=b+28|0;q=s+76|0;n=c[r+4>>2]|0;c[q>>2]=c[r>>2]|0;c[q+4>>2]=n;g[s+84>>2]=0.0;g[s+88>>2]=0.0;g[s+92>>2]=0.0;g[s+96>>2]=+g[b+36>>2];g[s+100>>2]=+g[b+40>>2];t=s}h=t|0;return h|0}else if((f|0)==10){f=c6(d,168)|0;if((f|0)==0){u=0}else{d=f;c[d>>2]=16504;t=b+8|0;s=b+12|0;if((c[t>>2]|0)==(c[s>>2]|0)){bc(5328,173,13288,6976)}c[f+4>>2]=c[e>>2]|0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+48>>2]=c[t>>2]|0;c[f+52>>2]=c[s>>2]|0;c[f+56>>2]=0;a[f+61|0]=a[b+16|0]&1;a[f+60|0]=0;c[f+64>>2]=c[b+4>>2]|0;pZ(f+16|0,0,32);c[d>>2]=17332;d=b+20|0;s=f+68|0;t=c[d+4>>2]|0;c[s>>2]=c[d>>2]|0;c[s+4>>2]=t;t=b+28|0;s=f+76|0;d=c[t+4>>2]|0;c[s>>2]=c[t>>2]|0;c[s+4>>2]=d;g[f+84>>2]=+g[b+36>>2];g[f+160>>2]=0.0;g[f+92>>2]=0.0;c[f+164>>2]=0;g[f+88>>2]=0.0;u=f}h=u|0;return h|0}else{bc(5328,113,13388,9296);h=0;return h|0}return 0}function fb(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;bs[c[(c[b>>2]|0)+20>>2]&2047](b);e=c[b+4>>2]|0;if((e|0)==3){f=a[18840]|0;if((f&255)>=14){bc(3640,173,14896,4712)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else if((e|0)==2){g=a[18920]|0;if((g&255)>=14){bc(3640,173,14896,4712)}f=d+12+((g&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else if((e|0)==5){f=a[18832]|0;if((f&255)>=14){bc(3640,173,14896,4712)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else if((e|0)==6){g=a[18940]|0;if((g&255)>=14){bc(3640,173,14896,4712)}f=d+12+((g&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else if((e|0)==7){f=a[18888]|0;if((f&255)>=14){bc(3640,173,14896,4712)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else if((e|0)==1){g=a[18892]|0;if((g&255)>=14){bc(3640,173,14896,4712)}f=d+12+((g&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else if((e|0)==8){f=a[18872]|0;if((f&255)>=14){bc(3640,173,14896,4712)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else if((e|0)==9){g=a[18844]|0;if((g&255)>=14){bc(3640,173,14896,4712)}f=d+12+((g&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else if((e|0)==4){f=a[18860]|0;if((f&255)>=14){bc(3640,173,14896,4712)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else if((e|0)==10){e=a[18832]|0;if((e&255)>=14){bc(3640,173,14896,4712)}g=d+12+((e&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else{bc(5328,166,13328,9296);return}}function fc(a){a=a|0;a=i;c7(5040,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);i=a;return}function fd(a){a=a|0;pT(a);return}function fe(a,b){a=a|0;b=b|0;return 1}function ff(a){a=a|0;return}function fg(a,b){a=a|0;b=+b;return+(b*0.0)}function fh(a,b){a=a|0;b=b|0;var d=0;d=b+76|0;b=a;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function fi(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fj(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+100>>2]*c;g[a>>2]=+g[b+96>>2]*c;g[a+4>>2]=d;return}function fk(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0,n=0,o=0,p=0,r=0.0,s=0.0;e=b|0;c[e>>2]=16504;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){bc(5328,173,13288,6976)}c[b+4>>2]=c[d>>2]|0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[f>>2]|0;f=b+52|0;c[f>>2]=c[h>>2]|0;c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2]|0;pZ(b+16|0,0,32);c[e>>2]=17184;e=b+68|0;h=b+76|0;i=d+20|0;j=+g[i>>2];do{if(j==j&!(D=0.0,D!=D)&j>+-q&j<+q){l=+g[d+24>>2];if(l==l&!(D=0.0,D!=D)&l>+-q&l<+q){break}else{m=2690;break}}else{m=2690}}while(0);if((m|0)==2690){bc(5156,34,15580,9236)}m=d+28|0;j=+g[m>>2];if(j<0.0|j==j&!(D=0.0,D!=D)&j>+-q&j<+q^1){bc(5156,35,15580,6924)}n=d+32|0;j=+g[n>>2];if(j<0.0|j==j&!(D=0.0,D!=D)&j>+-q&j<+q^1){bc(5156,36,15580,4984)}o=d+36|0;j=+g[o>>2];if(j<0.0|j==j&!(D=0.0,D!=D)&j>+-q&j<+q^1){bc(5156,37,15580,4284)}d=i;i=h;h=c[d>>2]|0;p=c[d+4>>2]|0;c[i>>2]=h;c[i+4>>2]=p;i=c[f>>2]|0;j=(c[k>>2]=h,+g[k>>2])- +g[i+12>>2];l=(c[k>>2]=p,+g[k>>2])- +g[i+16>>2];r=+g[i+24>>2];s=+g[i+20>>2];i=e;e=(g[k>>2]=j*r+l*s,c[k>>2]|0);p=(g[k>>2]=r*l+j*(-0.0-s),c[k>>2]|0)|0;c[i>>2]=0|e;c[i+4>>2]=p;g[b+104>>2]=+g[m>>2];g[b+96>>2]=0.0;g[b+100>>2]=0.0;g[b+84>>2]=+g[n>>2];g[b+88>>2]=+g[o>>2];g[b+92>>2]=0.0;g[b+108>>2]=0.0;return}function fl(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;e=c[b+52>>2]|0;f=c[e+8>>2]|0;h=b+116|0;c[h>>2]=f;i=b+128|0;j=e+28|0;l=i;m=c[j+4>>2]|0;c[l>>2]=c[j>>2]|0;c[l+4>>2]=m;m=b+136|0;g[m>>2]=+g[e+120>>2];l=b+140|0;g[l>>2]=+g[e+128>>2];j=c[d+24>>2]|0;n=j+(f*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[j+(f*12&-1)+8>>2];j=d+28|0;o=c[j>>2]|0;n=o+(f*12&-1)|0;s=c[n+4>>2]|0;t=(c[k>>2]=c[n>>2]|0,+g[k>>2]);u=(c[k>>2]=s,+g[k>>2]);v=+g[o+(f*12&-1)+8>>2];w=+T(+r);x=+S(+r);r=+g[e+116>>2];y=+g[b+84>>2]*6.2831854820251465;z=+g[d>>2];A=z*r*y*y;B=y*r*2.0*+g[b+88>>2]+A;if(B<=1.1920928955078125e-7){bc(5156,125,15632,3884)}r=z*B;if(r!=0.0){C=1.0/r}else{C=r}g[b+108>>2]=C;r=A*C;g[b+92>>2]=r;A=+g[b+68>>2]- +g[i>>2];B=+g[b+72>>2]- +g[b+132>>2];z=x*A-w*B;y=w*A+x*B;i=b+120|0;e=(g[k>>2]=z,c[k>>2]|0);f=(g[k>>2]=y,c[k>>2]|0)|0;c[i>>2]=0|e;c[i+4>>2]=f;B=+g[m>>2];x=+g[l>>2];A=C+(B+y*x*y);w=y*z*(-0.0-x);D=C+(B+z*x*z);C=A*D-w*w;if(C!=0.0){E=1.0/C}else{E=C}C=w*(-0.0-E);g[b+144>>2]=D*E;g[b+148>>2]=C;g[b+152>>2]=C;g[b+156>>2]=A*E;l=b+160|0;E=p+z- +g[b+76>>2];p=q+y- +g[b+80>>2];m=l;f=(g[k>>2]=E,c[k>>2]|0);i=(g[k>>2]=p,c[k>>2]|0)|0;c[m>>2]=0|f;c[m+4>>2]=i;g[l>>2]=r*E;g[b+164>>2]=r*p;p=v*.9800000190734863;l=b+96|0;if((a[d+20|0]&1)<<24>>24==0){g[l>>2]=0.0;g[b+100>>2]=0.0;v=p;r=t;E=u;i=c[h>>2]|0;m=c[j>>2]|0;f=m+(i*12&-1)|0;e=f;o=(g[k>>2]=r,c[k>>2]|0);s=(g[k>>2]=E,c[k>>2]|0);n=s;F=0;G=0;H=n;I=o;J=0;K=G|I;L=H|J;M=e|0;c[M>>2]=K;N=e+4|0;c[N>>2]=L;O=c[h>>2]|0;P=c[j>>2]|0;Q=P+(O*12&-1)+8|0;g[Q>>2]=v;return}else{q=+g[d+8>>2];d=l|0;A=q*+g[d>>2];g[d>>2]=A;d=b+100|0;C=q*+g[d>>2];g[d>>2]=C;v=p+x*(C*z-A*y);r=t+B*A;E=u+C*B;i=c[h>>2]|0;m=c[j>>2]|0;f=m+(i*12&-1)|0;e=f;o=(g[k>>2]=r,c[k>>2]|0);s=(g[k>>2]=E,c[k>>2]|0);n=s;F=0;G=0;H=n;I=o;J=0;K=G|I;L=H|J;M=e|0;c[M>>2]=K;N=e+4|0;c[N>>2]=L;O=c[h>>2]|0;P=c[j>>2]|0;Q=P+(O*12&-1)+8|0;g[Q>>2]=v;return}}function fm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0.0,y=0.0,z=0.0;d=a+116|0;e=c[d>>2]|0;f=b+28|0;h=c[f>>2]|0;i=h+(e*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[h+(e*12&-1)+8>>2];o=+g[a+124>>2];p=+g[a+120>>2];q=+g[a+108>>2];h=a+96|0;j=h|0;r=+g[j>>2];i=a+100|0;s=+g[i>>2];t=-0.0-(l+o*(-0.0-n)+ +g[a+160>>2]+q*r);u=-0.0-(m+n*p+ +g[a+164>>2]+q*s);q=+g[a+144>>2]*t+ +g[a+152>>2]*u;v=+g[a+148>>2]*t+ +g[a+156>>2]*u;w=h;h=c[w+4>>2]|0;u=(c[k>>2]=c[w>>2]|0,+g[k>>2]);t=(c[k>>2]=h,+g[k>>2]);x=r+q;g[j>>2]=x;q=v+s;g[i>>2]=q;s=+g[b>>2]*+g[a+104>>2];v=q*q+x*x;if(v>s*s){r=s/+Q(+v);v=x*r;g[j>>2]=v;s=r*q;g[i>>2]=s;y=v;z=s}else{y=x;z=q}q=y-u;u=z-t;t=+g[a+136>>2];z=n+ +g[a+140>>2]*(u*p-q*o);a=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=l+q*t,c[k>>2]|0);i=(g[k>>2]=m+u*t,c[k>>2]|0)|0;c[a>>2]=0|e;c[a+4>>2]=i;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=z;return}function fn(a){a=a|0;a=i;c7(3436,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);i=a;return}function fo(a){a=a|0;pT(a);return}function fp(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0;e=b|0;c[e>>2]=16504;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){bc(5328,173,13288,6976)}c[b+4>>2]=c[d>>2]|0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[f>>2]|0;c[b+52>>2]=c[h>>2]|0;c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2]|0;pZ(b+16|0,0,32);c[e>>2]=16712;e=b+84|0;h=d+20|0;f=b+68|0;i=c[h+4>>2]|0;c[f>>2]=c[h>>2]|0;c[f+4>>2]=i;i=d+28|0;f=b+76|0;h=c[i+4>>2]|0;c[f>>2]=c[i>>2]|0;c[f+4>>2]=h;h=d+36|0;f=e;i=c[h>>2]|0;j=c[h+4>>2]|0;c[f>>2]=i;c[f+4>>2]=j;l=(c[k>>2]=i,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+Q(+(l*l+m*m));if(n<1.1920928955078125e-7){o=m;p=l}else{q=1.0/n;n=l*q;g[e>>2]=n;l=m*q;g[b+88>>2]=l;o=l;p=n}e=b+92|0;j=(g[k>>2]=o*-1.0,c[k>>2]|0);i=(g[k>>2]=p,c[k>>2]|0)|0;c[e>>2]=0|j;c[e+4>>2]=i;g[b+100>>2]=+g[d+44>>2];g[b+252>>2]=0.0;pZ(b+104|0,0,16);g[b+120>>2]=+g[d+52>>2];g[b+124>>2]=+g[d+56>>2];g[b+128>>2]=+g[d+64>>2];g[b+132>>2]=+g[d+68>>2];a[b+136|0]=a[d+48|0]&1;a[b+137|0]=a[d+60|0]&1;c[b+140>>2]=0;pZ(b+184|0,0,16);return}function fq(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+144|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+148|0;c[l>>2]=j;m=e+28|0;n=b+152|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+160|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+168>>2]=s;t=+g[i+120>>2];g[b+172>>2]=t;u=+g[e+128>>2];g[b+176>>2]=u;v=+g[i+128>>2];g[b+180>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;m=c[e+4>>2]|0;w=(c[k>>2]=c[e>>2]|0,+g[k>>2]);x=(c[k>>2]=m,+g[k>>2]);y=+g[i+(f*12&-1)+8>>2];m=d+28|0;e=c[m>>2]|0;n=e+(f*12&-1)|0;z=c[n+4>>2]|0;A=(c[k>>2]=c[n>>2]|0,+g[k>>2]);B=(c[k>>2]=z,+g[k>>2]);C=+g[e+(f*12&-1)+8>>2];z=i+(j*12&-1)|0;n=c[z+4>>2]|0;D=(c[k>>2]=c[z>>2]|0,+g[k>>2]);E=(c[k>>2]=n,+g[k>>2]);F=+g[i+(j*12&-1)+8>>2];i=e+(j*12&-1)|0;n=c[i+4>>2]|0;G=(c[k>>2]=c[i>>2]|0,+g[k>>2]);H=(c[k>>2]=n,+g[k>>2]);I=+g[e+(j*12&-1)+8>>2];J=+T(+y);K=+S(+y);y=+T(+F);L=+S(+F);F=+g[b+68>>2];M=F-(c[k>>2]=o,+g[k>>2]);F=+g[b+72>>2];N=F-(c[k>>2]=p,+g[k>>2]);F=K*M-J*N;O=J*M+K*N;N=+g[b+76>>2];M=N-(c[k>>2]=q,+g[k>>2]);N=+g[b+80>>2];P=N-(c[k>>2]=r,+g[k>>2]);N=L*M-y*P;Q=y*M+L*P;P=D-w+N-F;w=E-x+Q-O;x=+g[b+84>>2];E=+g[b+88>>2];D=K*x-J*E;L=J*x+K*E;r=b+184|0;q=(g[k>>2]=D,c[k>>2]|0);p=(g[k>>2]=L,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=p;E=F+P;F=O+w;O=E*L-F*D;g[b+208>>2]=O;x=N*L-Q*D;g[b+212>>2]=x;M=s+t;y=u*O;R=v*x;U=M+O*y+x*R;if(U>0.0){V=1.0/U}else{V=U}g[b+252>>2]=V;V=+g[b+92>>2];W=+g[b+96>>2];X=K*V-J*W;Y=J*V+K*W;p=b+192|0;r=(g[k>>2]=X,c[k>>2]|0);q=(g[k>>2]=Y,c[k>>2]|0)|0;c[p>>2]=0|r;c[p+4>>2]=q;W=E*Y-F*X;g[b+200>>2]=W;F=N*Y-Q*X;g[b+204>>2]=F;Q=u*W;N=v*F;E=Q+N;K=Q*O+N*x;V=v+u;J=y+R;g[b+216>>2]=M+W*Q+F*N;g[b+220>>2]=E;g[b+224>>2]=K;g[b+228>>2]=E;g[b+232>>2]=V==0.0?1.0:V;g[b+236>>2]=J;g[b+240>>2]=K;g[b+244>>2]=J;g[b+248>>2]=U;do{if((a[b+136|0]&1)<<24>>24==0){c[b+140>>2]=0;g[b+112>>2]=0.0}else{U=P*D+w*L;J=+g[b+124>>2];K=+g[b+120>>2];V=J-K;if(V>0.0){Z=V}else{Z=-0.0-V}if(Z<.009999999776482582){c[b+140>>2]=3;break}if(U<=K){q=b+140|0;if((c[q>>2]|0)==1){break}c[q>>2]=1;g[b+112>>2]=0.0;break}q=b+140|0;if(U<J){c[q>>2]=0;g[b+112>>2]=0.0;break}if((c[q>>2]|0)==2){break}c[q>>2]=2;g[b+112>>2]=0.0}}while(0);if((a[b+137|0]&1)<<24>>24==0){g[b+116>>2]=0.0}q=b+104|0;if((a[d+20|0]&1)<<24>>24==0){pZ(q|0,0,16);Z=C;w=I;P=G;J=H;U=A;K=B;p=c[m>>2]|0;r=p+(f*12&-1)|0;o=r;j=(g[k>>2]=U,c[k>>2]|0);e=(g[k>>2]=K,c[k>>2]|0);n=e;i=0;z=0;_=n;$=j;aa=0;ab=z|$;ac=_|aa;ad=o|0;c[ad>>2]=ab;ae=o+4|0;c[ae>>2]=ac;af=c[h>>2]|0;ag=c[m>>2]|0;ah=ag+(af*12&-1)+8|0;g[ah>>2]=Z;ai=c[l>>2]|0;aj=c[m>>2]|0;ak=aj+(ai*12&-1)|0;al=ak;am=(g[k>>2]=P,c[k>>2]|0);an=(g[k>>2]=J,c[k>>2]|0);ao=an;ap=0;aq=0;ar=ao;as=am;at=0;au=aq|as;av=ar|at;aw=al|0;c[aw>>2]=au;ax=al+4|0;c[ax>>2]=av;ay=c[l>>2]|0;az=c[m>>2]|0;aA=az+(ay*12&-1)+8|0;g[aA>>2]=w;return}else{aB=d+8|0;V=+g[aB>>2];d=q|0;E=V*+g[d>>2];g[d>>2]=E;d=b+108|0;N=V*+g[d>>2];g[d>>2]=N;d=b+112|0;Q=V*+g[d>>2];g[d>>2]=Q;d=b+116|0;V=+g[aB>>2]*+g[d>>2];g[d>>2]=V;M=V+Q;Q=E*X+D*M;D=E*Y+M*L;Z=C-u*(E*W+N+M*O);w=I+v*(N+E*F+M*x);P=G+t*Q;J=H+t*D;U=A-s*Q;K=B-s*D;p=c[m>>2]|0;r=p+(f*12&-1)|0;o=r;j=(g[k>>2]=U,c[k>>2]|0);e=(g[k>>2]=K,c[k>>2]|0);n=e;i=0;z=0;_=n;$=j;aa=0;ab=z|$;ac=_|aa;ad=o|0;c[ad>>2]=ab;ae=o+4|0;c[ae>>2]=ac;af=c[h>>2]|0;ag=c[m>>2]|0;ah=ag+(af*12&-1)+8|0;g[ah>>2]=Z;ai=c[l>>2]|0;aj=c[m>>2]|0;ak=aj+(ai*12&-1)|0;al=ak;am=(g[k>>2]=P,c[k>>2]|0);an=(g[k>>2]=J,c[k>>2]|0);ao=an;ap=0;aq=0;ar=ao;as=am;at=0;au=aq|as;av=ar|at;aw=al|0;c[aw>>2]=au;ax=al+4|0;c[ax>>2]=av;ay=c[l>>2]|0;az=c[m>>2]|0;aA=az+(ay*12&-1)+8|0;g[aA>>2]=w;return}}function fr(a){a=a|0;return}function fs(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function ft(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fu(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0,f=0.0;d=+g[b+104>>2];e=+g[b+116>>2]+ +g[b+112>>2];f=(d*+g[b+196>>2]+e*+g[b+188>>2])*c;g[a>>2]=(d*+g[b+192>>2]+ +g[b+184>>2]*e)*c;g[a+4>>2]=f;return}function fv(a,b){a=a|0;b=+b;return+(+g[a+108>>2]*b)}function fw(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0,am=0.0;e=i;i=i+24|0;f=e|0;h=e+12|0;j=b+144|0;l=c[j>>2]|0;m=d+28|0;n=c[m>>2]|0;o=n+(l*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[n+(l*12&-1)+8>>2];p=b+148|0;o=c[p>>2]|0;t=n+(o*12&-1)|0;u=c[t+4>>2]|0;v=(c[k>>2]=c[t>>2]|0,+g[k>>2]);w=(c[k>>2]=u,+g[k>>2]);x=+g[n+(o*12&-1)+8>>2];y=+g[b+168>>2];z=+g[b+172>>2];A=+g[b+176>>2];B=+g[b+180>>2];do{if((a[b+137|0]&1)<<24>>24==0){C=s;D=x;E=v;F=w;G=q;H=r}else{if((c[b+140>>2]|0)==3){C=s;D=x;E=v;F=w;G=q;H=r;break}I=+g[b+184>>2];J=+g[b+188>>2];K=+g[b+212>>2];L=+g[b+208>>2];o=b+116|0;M=+g[o>>2];N=+g[d>>2]*+g[b+128>>2];O=M+ +g[b+252>>2]*(+g[b+132>>2]-((v-q)*I+(w-r)*J+x*K-s*L));P=-0.0-N;Q=O<N?O:N;N=Q<P?P:Q;g[o>>2]=N;Q=N-M;M=I*Q;I=J*Q;C=s-A*L*Q;D=x+B*K*Q;E=v+z*M;F=w+z*I;G=q-y*M;H=r-y*I}}while(0);r=E-G;q=F-H;d=b+192|0;w=+g[d>>2];o=b+196|0;v=+g[o>>2];n=b+204|0;x=+g[n>>2];u=b+200|0;s=+g[u>>2];I=r*w+q*v+D*x-C*s;M=D-C;do{if((a[b+136|0]&1)<<24>>24==0){R=17}else{t=b+140|0;if((c[t>>2]|0)==0){R=17;break}S=b+184|0;T=b+188|0;U=b+212|0;V=b+208|0;W=b+104|0;Q=+g[W>>2];X=b+108|0;K=+g[X>>2];Y=b+112|0;L=+g[Y>>2];Z=b+216|0;J=-0.0-I;N=-0.0-M;P=-0.0-(r*+g[S>>2]+q*+g[T>>2]+D*+g[U>>2]-C*+g[V>>2]);g[h>>2]=J;g[h+4>>2]=N;g[h+8>>2]=P;c1(f,Z,h);_=f|0;g[W>>2]=+g[_>>2]+ +g[W>>2];$=f+4|0;g[X>>2]=+g[$>>2]+ +g[X>>2];aa=f+8|0;P=+g[aa>>2]+ +g[Y>>2];g[Y>>2]=P;ab=c[t>>2]|0;if((ab|0)==1){O=P>0.0?P:0.0;g[Y>>2]=O;ac=O}else if((ab|0)==2){O=P<0.0?P:0.0;g[Y>>2]=O;ac=O}else{ac=P}P=ac-L;L=J- +g[b+240>>2]*P;J=N-P*+g[b+244>>2];N=+g[Z>>2];O=+g[b+228>>2];ad=+g[b+220>>2];ae=+g[b+232>>2];af=N*ae-O*ad;if(af!=0.0){ag=1.0/af}else{ag=af}af=Q+(L*ae-O*J)*ag;O=K+(N*J-L*ad)*ag;g[W>>2]=af;g[X>>2]=O;ad=af-Q;Q=O-K;g[_>>2]=ad;g[$>>2]=Q;g[aa>>2]=P;ah=Q+ad*+g[n>>2]+P*+g[U>>2];ai=ad*+g[u>>2]+Q+P*+g[V>>2];aj=ad*+g[o>>2]+P*+g[T>>2];ak=ad*+g[d>>2]+P*+g[S>>2];al=c[j>>2]|0;break}}while(0);if((R|0)==17){ag=-0.0-I;I=-0.0-M;M=+g[b+216>>2];ac=+g[b+228>>2];q=+g[b+220>>2];r=+g[b+232>>2];P=M*r-ac*q;if(P!=0.0){am=1.0/P}else{am=P}P=(r*ag-ac*I)*am;ac=(M*I-q*ag)*am;R=b+104|0;g[R>>2]=+g[R>>2]+P;R=b+108|0;g[R>>2]=ac+ +g[R>>2];ah=ac+P*x;ai=ac+P*s;aj=P*v;ak=P*w;al=l}l=(c[m>>2]|0)+(al*12&-1)|0;al=(g[k>>2]=G-y*ak,c[k>>2]|0);R=(g[k>>2]=H-y*aj,c[k>>2]|0)|0;c[l>>2]=0|al;c[l+4>>2]=R;g[(c[m>>2]|0)+((c[j>>2]|0)*12&-1)+8>>2]=C-A*ai;j=(c[m>>2]|0)+((c[p>>2]|0)*12&-1)|0;R=(g[k>>2]=E+z*ak,c[k>>2]|0);l=(g[k>>2]=F+z*aj,c[k>>2]|0)|0;c[j>>2]=0|R;c[j+4>>2]=l;g[(c[m>>2]|0)+((c[p>>2]|0)*12&-1)+8>>2]=D+B*ah;i=e;return}function fx(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0;e=b+144|0;f=c[e>>2]|0;h=d+24|0;d=c[h>>2]|0;i=d+(f*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[d+(f*12&-1)+8>>2];f=b+148|0;j=c[f>>2]|0;o=d+(j*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[d+(j*12&-1)+8>>2];t=+T(+n);u=+S(+n);v=+T(+s);w=+S(+s);x=+g[b+168>>2];y=+g[b+172>>2];z=+g[b+176>>2];A=+g[b+180>>2];B=+g[b+68>>2]- +g[b+152>>2];C=+g[b+72>>2]- +g[b+156>>2];D=u*B-t*C;E=t*B+u*C;C=+g[b+76>>2]- +g[b+160>>2];B=+g[b+80>>2]- +g[b+164>>2];F=w*C-v*B;G=v*C+w*B;B=q+F-l-D;w=r+G-m-E;C=+g[b+84>>2];v=+g[b+88>>2];H=u*C-t*v;I=t*C+u*v;v=D+B;D=E+w;E=I*v-H*D;C=F*I-G*H;J=+g[b+92>>2];K=+g[b+96>>2];L=u*J-t*K;M=t*J+u*K;K=M*v-L*D;D=F*M-G*L;G=L*B+M*w;F=s-n- +g[b+100>>2];if(G>0.0){N=G}else{N=-0.0-G}if(F>0.0){O=F}else{O=-0.0-F}do{if((a[b+136|0]&1)<<24>>24==0){P=N;Q=0;R=0.0}else{v=H*B+I*w;u=+g[b+124>>2];J=+g[b+120>>2];t=u-J;if(t>0.0){U=t}else{U=-0.0-t}if(U<.009999999776482582){t=v<.20000000298023224?v:.20000000298023224;if(v>0.0){V=v}else{V=-0.0-v}P=N>V?N:V;Q=1;R=t<-.20000000298023224?-.20000000298023224:t;break}if(v<=J){t=v-J+.004999999888241291;W=t<0.0?t:0.0;t=J-v;P=N>t?N:t;Q=1;R=W<-.20000000298023224?-.20000000298023224:W;break}if(v<u){P=N;Q=0;R=0.0;break}W=v-u;u=W+-.004999999888241291;v=u<.20000000298023224?u:.20000000298023224;P=N>W?N:W;Q=1;R=v<0.0?0.0:v}}while(0);N=x+y;V=z*K;U=A*D;w=D*U+(N+K*V);B=U+V;if(Q){v=C*U+E*V;V=z+A;U=V==0.0?1.0:V;V=z*E;W=A*C;u=W+V;t=C*W+(N+E*V);V=-0.0-G;N=-0.0-F;W=-0.0-R;R=U*t-u*u;J=u*v-B*t;X=u*B-U*v;Y=v*X+(w*R+B*J);if(Y!=0.0){Z=1.0/Y}else{Z=Y}Y=u*V;_=(R*V+J*N+X*W)*Z;$=(v*(Y-v*N)+(w*(t*N-u*W)+B*(v*W-t*V)))*Z;aa=(v*(B*N-U*V)+(w*(U*W-u*N)+B*(Y-B*W)))*Z}else{Z=z+A;W=Z==0.0?1.0:Z;Z=-0.0-G;G=-0.0-F;F=W*w-B*B;if(F!=0.0){ab=1.0/F}else{ab=F}_=(W*Z-B*G)*ab;$=(w*G-B*Z)*ab;aa=0.0}ab=H*aa+L*_;L=I*aa+M*_;Q=(g[k>>2]=l-x*ab,c[k>>2]|0);b=(g[k>>2]=m-x*L,c[k>>2]|0)|0;c[i>>2]=0|Q;c[i+4>>2]=b;g[(c[h>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=n-z*(E*aa+($+K*_));e=(c[h>>2]|0)+((c[f>>2]|0)*12&-1)|0;b=(g[k>>2]=q+y*ab,c[k>>2]|0);i=(g[k>>2]=r+y*L,c[k>>2]|0)|0;c[e>>2]=0|b;c[e+4>>2]=i;g[(c[h>>2]|0)+((c[f>>2]|0)*12&-1)+8>>2]=s+A*(C*aa+($+D*_));if(P>.004999999888241291){ac=0;return ac|0}ac=O<=.03490658849477768;return ac|0}function fy(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;c7(6896,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(9068,(v=i,i=i+4|0,c[v>>2]=e,v)|0);c7(6732,(v=i,i=i+4|0,c[v>>2]=f,v)|0);c7(4924,(v=i,i=i+4|0,c[v>>2]=a[b+61|0]&1,v)|0);j=+g[b+72>>2];c7(4240,(v=i,i=i+16|0,h[k>>3]=+g[b+68>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);j=+g[b+80>>2];c7(3816,(v=i,i=i+16|0,h[k>>3]=+g[b+76>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);j=+g[b+88>>2];c7(3336,(v=i,i=i+16|0,h[k>>3]=+g[b+84>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);c7(3376,(v=i,i=i+8|0,h[k>>3]=+g[b+100>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(2612,(v=i,i=i+4|0,c[v>>2]=a[b+136|0]&1,v)|0);c7(10168,(v=i,i=i+8|0,h[k>>3]=+g[b+120>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(9620,(v=i,i=i+8|0,h[k>>3]=+g[b+124>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(3076,(v=i,i=i+4|0,c[v>>2]=a[b+137|0]&1,v)|0);c7(2828,(v=i,i=i+8|0,h[k>>3]=+g[b+132>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(8816,(v=i,i=i+8|0,h[k>>3]=+g[b+128>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(9548,(v=i,i=i+4|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function fz(a){a=a|0;pT(a);return}function fA(a,b){a=a|0;b=+b;return+0.0}function fB(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0;d=a+120|0;e=c[d>>2]|0;f=b+28|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];i=a+124|0;h=c[i>>2]|0;n=b+(h*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(h*12&-1)+8>>2];s=+g[a+148>>2];t=+g[a+144>>2];u=+g[a+156>>2];v=+g[a+152>>2];w=+g[a+128>>2];x=+g[a+132>>2];y=+g[a+112>>2];z=+g[a+136>>2];A=+g[a+140>>2];B=(-0.0-((j+s*(-0.0-m))*w+(l+m*t)*x)-y*((p+u*(-0.0-r))*z+(q+r*v)*A))*(-0.0- +g[a+192>>2]);h=a+116|0;g[h>>2]=+g[h>>2]+B;C=-0.0-B;D=w*C;w=x*C;C=B*(-0.0-y);y=z*C;z=A*C;C=+g[a+176>>2];A=m+ +g[a+184>>2]*(w*t-D*s);s=+g[a+180>>2];t=r+ +g[a+188>>2]*(z*v-y*u);a=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=j+D*C,c[k>>2]|0);h=(g[k>>2]=l+w*C,c[k>>2]|0)|0;c[a>>2]=0|e;c[a+4>>2]=h;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=A;d=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;h=(g[k>>2]=p+y*s,c[k>>2]|0);a=(g[k>>2]=q+z*s,c[k>>2]|0)|0;c[d>>2]=0|h;c[d+4>>2]=a;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=t;return}function fC(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+92>>2];h=+g[d+20>>2];i=+g[b+96>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fD(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+100>>2];h=+g[d+20>>2];i=+g[b+104>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fE(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0;d=+g[b+116>>2];e=d*+g[b+140>>2]*c;g[a>>2]=d*+g[b+136>>2]*c;g[a+4>>2]=e;return}function fF(a,b,d,e,f,h,i,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;i=i|0;j=+j;var l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0;c[a+8>>2]=b;c[a+12>>2]=d;l=e;m=a+20|0;n=c[l+4>>2]|0;c[m>>2]=c[l>>2]|0;c[m+4>>2]=n;n=f;m=a+28|0;l=c[n+4>>2]|0;c[m>>2]=c[n>>2]|0;c[m+4>>2]=l;l=h|0;o=+g[l>>2]- +g[b+12>>2];m=h+4|0;p=+g[m>>2]- +g[b+16>>2];q=+g[b+24>>2];r=+g[b+20>>2];b=a+36|0;h=(g[k>>2]=o*q+p*r,c[k>>2]|0);n=(g[k>>2]=q*p+o*(-0.0-r),c[k>>2]|0)|0;c[b>>2]=0|h;c[b+4>>2]=n;n=i|0;r=+g[n>>2]- +g[d+12>>2];b=i+4|0;o=+g[b>>2]- +g[d+16>>2];p=+g[d+24>>2];q=+g[d+20>>2];d=a+44|0;i=(g[k>>2]=r*p+o*q,c[k>>2]|0);h=(g[k>>2]=p*o+r*(-0.0-q),c[k>>2]|0)|0;c[d>>2]=0|i;c[d+4>>2]=h;q=+g[l>>2]- +g[e>>2];r=+g[m>>2]- +g[e+4>>2];g[a+52>>2]=+Q(+(q*q+r*r));r=+g[n>>2]- +g[f>>2];q=+g[b>>2]- +g[f+4>>2];g[a+56>>2]=+Q(+(r*r+q*q));g[a+60>>2]=j;if(j>1.1920928955078125e-7){return}bc(4792,51,14624,9188);return}function fG(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0.0,j=0.0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0,q=0;e=b|0;c[e>>2]=16504;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){bc(5328,173,13288,6976)}c[b+4>>2]=c[d>>2]|0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[f>>2]|0;c[b+52>>2]=c[h>>2]|0;c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2]|0;pZ(b+16|0,0,32);c[e>>2]=17036;e=d+20|0;h=b+68|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2]|0;c[h+4>>2]=f;f=d+28|0;h=b+76|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=e;e=d+36|0;h=b+92|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2]|0;c[h+4>>2]=f;f=d+44|0;h=b+100|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=e;e=d+52|0;g[b+84>>2]=+g[e>>2];h=d+56|0;g[b+88>>2]=+g[h>>2];f=d+60|0;i=+g[f>>2];if(i!=0.0){j=i;k=b+112|0;g[k>>2]=j;l=+g[e>>2];m=+g[h>>2];n=j*m;o=l+n;p=b+108|0;g[p>>2]=o;q=b+116|0;g[q>>2]=0.0;return}bc(4792,65,15264,6876);j=+g[f>>2];k=b+112|0;g[k>>2]=j;l=+g[e>>2];m=+g[h>>2];n=j*m;o=l+n;p=b+108|0;g[p>>2]=o;q=b+116|0;g[q>>2]=0.0;return}function fH(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+120|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+124|0;c[l>>2]=j;m=e+28|0;n=b+160|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+168|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+176>>2]=s;t=+g[i+120>>2];g[b+180>>2]=t;u=+g[e+128>>2];g[b+184>>2]=u;v=+g[i+128>>2];g[b+188>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;m=c[e+4>>2]|0;w=(c[k>>2]=c[e>>2]|0,+g[k>>2]);x=(c[k>>2]=m,+g[k>>2]);y=+g[i+(f*12&-1)+8>>2];m=d+28|0;e=c[m>>2]|0;n=e+(f*12&-1)|0;z=c[n+4>>2]|0;A=(c[k>>2]=c[n>>2]|0,+g[k>>2]);B=(c[k>>2]=z,+g[k>>2]);C=+g[e+(f*12&-1)+8>>2];z=i+(j*12&-1)|0;n=c[z+4>>2]|0;D=(c[k>>2]=c[z>>2]|0,+g[k>>2]);E=(c[k>>2]=n,+g[k>>2]);F=+g[i+(j*12&-1)+8>>2];i=e+(j*12&-1)|0;n=c[i+4>>2]|0;G=(c[k>>2]=c[i>>2]|0,+g[k>>2]);H=(c[k>>2]=n,+g[k>>2]);I=+g[e+(j*12&-1)+8>>2];J=+T(+y);K=+S(+y);y=+T(+F);L=+S(+F);F=+g[b+92>>2];M=F-(c[k>>2]=o,+g[k>>2]);F=+g[b+96>>2];N=F-(c[k>>2]=p,+g[k>>2]);F=K*M-J*N;O=J*M+K*N;p=b+144|0;o=(g[k>>2]=F,c[k>>2]|0);j=(g[k>>2]=O,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;N=+g[b+100>>2];K=N-(c[k>>2]=q,+g[k>>2]);N=+g[b+104>>2];M=N-(c[k>>2]=r,+g[k>>2]);N=L*K-y*M;J=y*K+L*M;r=b+152|0;q=(g[k>>2]=N,c[k>>2]|0);j=(g[k>>2]=J,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;j=b+128|0;M=w+F- +g[b+68>>2];w=x+O- +g[b+72>>2];r=j;q=(g[k>>2]=M,c[k>>2]|0);p=(g[k>>2]=w,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=p;p=b+136|0;x=D+N- +g[b+76>>2];D=E+J- +g[b+80>>2];r=p;q=(g[k>>2]=x,c[k>>2]|0);o=(g[k>>2]=D,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=o;o=j|0;E=+Q(+(M*M+w*w));j=p|0;L=+Q(+(x*x+D*D));if(E>.04999999701976776){K=1.0/E;E=M*K;g[o>>2]=E;P=K*w;R=E}else{g[o>>2]=0.0;P=0.0;R=0.0}g[b+132>>2]=P;if(L>.04999999701976776){E=1.0/L;L=E*x;g[j>>2]=L;U=E*D;V=L}else{g[j>>2]=0.0;U=0.0;V=0.0}g[b+140>>2]=U;L=F*P-O*R;D=N*U-J*V;E=+g[b+112>>2];x=s+L*L*u+E*E*(t+D*D*v);if(x>0.0){W=1.0/x}else{W=x}g[b+192>>2]=W;if((a[d+20|0]&1)<<24>>24==0){g[b+116>>2]=0.0;W=C;x=I;D=G;L=H;w=A;K=B;j=c[m>>2]|0;o=j+(f*12&-1)|0;p=o;r=(g[k>>2]=w,c[k>>2]|0);q=(g[k>>2]=K,c[k>>2]|0);e=q;n=0;i=0;z=e;X=r;Y=0;Z=i|X;_=z|Y;$=p|0;c[$>>2]=Z;aa=p+4|0;c[aa>>2]=_;ab=c[h>>2]|0;ac=c[m>>2]|0;ad=ac+(ab*12&-1)+8|0;g[ad>>2]=W;ae=c[l>>2]|0;af=c[m>>2]|0;ag=af+(ae*12&-1)|0;ah=ag;ai=(g[k>>2]=D,c[k>>2]|0);aj=(g[k>>2]=L,c[k>>2]|0);ak=aj;al=0;am=0;an=ak;ao=ai;ap=0;aq=am|ao;ar=an|ap;as=ah|0;c[as>>2]=aq;at=ah+4|0;c[at>>2]=ar;au=c[l>>2]|0;av=c[m>>2]|0;aw=av+(au*12&-1)+8|0;g[aw>>2]=x;return}else{ax=b+116|0;M=+g[d+8>>2]*+g[ax>>2];g[ax>>2]=M;y=-0.0-M;ay=R*y;R=P*y;y=M*(-0.0-E);E=V*y;V=U*y;W=C+u*(R*F-ay*O);x=I+v*(V*N-E*J);D=G+E*t;L=H+V*t;w=A+ay*s;K=B+R*s;j=c[m>>2]|0;o=j+(f*12&-1)|0;p=o;r=(g[k>>2]=w,c[k>>2]|0);q=(g[k>>2]=K,c[k>>2]|0);e=q;n=0;i=0;z=e;X=r;Y=0;Z=i|X;_=z|Y;$=p|0;c[$>>2]=Z;aa=p+4|0;c[aa>>2]=_;ab=c[h>>2]|0;ac=c[m>>2]|0;ad=ac+(ab*12&-1)+8|0;g[ad>>2]=W;ae=c[l>>2]|0;af=c[m>>2]|0;ag=af+(ae*12&-1)|0;ah=ag;ai=(g[k>>2]=D,c[k>>2]|0);aj=(g[k>>2]=L,c[k>>2]|0);ak=aj;al=0;am=0;an=ak;ao=ai;ap=0;aq=am|ao;ar=an|ap;as=ah|0;c[as>>2]=aq;at=ah+4|0;c[at>>2]=ar;au=c[l>>2]|0;av=c[m>>2]|0;aw=av+(au*12&-1)+8|0;g[aw>>2]=x;return}}function fI(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0;d=a+120|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];e=a+124|0;i=c[e>>2]|0;n=b+(i*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(i*12&-1)+8>>2];s=+T(+m);t=+S(+m);u=+T(+r);v=+S(+r);w=+g[a+92>>2]- +g[a+160>>2];x=+g[a+96>>2]- +g[a+164>>2];y=t*w-s*x;z=s*w+t*x;x=+g[a+100>>2]- +g[a+168>>2];t=+g[a+104>>2]- +g[a+172>>2];w=v*x-u*t;s=u*x+v*t;t=j+y- +g[a+68>>2];v=l+z- +g[a+72>>2];x=p+w- +g[a+76>>2];u=q+s- +g[a+80>>2];A=+Q(+(t*t+v*v));B=+Q(+(x*x+u*u));if(A>.04999999701976776){C=1.0/A;D=t*C;E=v*C}else{D=0.0;E=0.0}if(B>.04999999701976776){C=1.0/B;F=x*C;G=u*C}else{F=0.0;G=0.0}C=y*E-z*D;u=w*G-s*F;x=+g[a+176>>2];v=+g[a+184>>2];t=+g[a+180>>2];H=+g[a+188>>2];I=+g[a+112>>2];J=x+C*C*v+I*I*(t+u*u*H);if(J>0.0){K=1.0/J}else{K=J}J=+g[a+108>>2]-A-B*I;if(J>0.0){L=J}else{L=-0.0-J}B=J*(-0.0-K);K=-0.0-B;J=D*K;D=E*K;K=B*(-0.0-I);I=F*K;F=G*K;a=(g[k>>2]=j+J*x,c[k>>2]|0);i=(g[k>>2]=l+D*x,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=i;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=m+(y*D-z*J)*v;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;i=(g[k>>2]=p+I*t,c[k>>2]|0);h=(g[k>>2]=q+F*t,c[k>>2]|0)|0;c[d>>2]=0|i;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=r+H*(w*F-s*I);return L<.004999999888241291|0}function fJ(a){a=a|0;return}function fK(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;c7(4960,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(9068,(v=i,i=i+4|0,c[v>>2]=e,v)|0);c7(6732,(v=i,i=i+4|0,c[v>>2]=f,v)|0);c7(4924,(v=i,i=i+4|0,c[v>>2]=a[b+61|0]&1,v)|0);j=+g[b+72>>2];c7(3108,(v=i,i=i+16|0,h[k>>3]=+g[b+68>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);j=+g[b+80>>2];c7(2856,(v=i,i=i+16|0,h[k>>3]=+g[b+76>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);j=+g[b+96>>2];c7(4240,(v=i,i=i+16|0,h[k>>3]=+g[b+92>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);j=+g[b+104>>2];c7(3816,(v=i,i=i+16|0,h[k>>3]=+g[b+100>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);c7(10140,(v=i,i=i+8|0,h[k>>3]=+g[b+84>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(9592,(v=i,i=i+8|0,h[k>>3]=+g[b+88>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(9212,(v=i,i=i+8|0,h[k>>3]=+g[b+112>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(9548,(v=i,i=i+4|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function fL(a){a=a|0;pT(a);return}function fM(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0,R=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+128|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+132|0;c[l>>2]=j;m=e+28|0;n=b+152|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+160|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+168>>2]=s;t=+g[i+120>>2];g[b+172>>2]=t;u=+g[e+128>>2];g[b+176>>2]=u;v=+g[i+128>>2];g[b+180>>2]=v;i=c[d+24>>2]|0;w=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;x=c[n+4>>2]|0;y=(c[k>>2]=c[n>>2]|0,+g[k>>2]);z=(c[k>>2]=x,+g[k>>2]);A=+g[m+(f*12&-1)+8>>2];B=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;x=c[i+4>>2]|0;C=(c[k>>2]=c[i>>2]|0,+g[k>>2]);D=(c[k>>2]=x,+g[k>>2]);E=+g[m+(j*12&-1)+8>>2];F=+T(+w);G=+S(+w);H=+T(+B);I=+S(+B);J=+g[b+68>>2];K=J-(c[k>>2]=o,+g[k>>2]);J=+g[b+72>>2];L=J-(c[k>>2]=p,+g[k>>2]);J=G*K-F*L;M=F*K+G*L;p=b+136|0;o=(g[k>>2]=J,c[k>>2]|0);j=(g[k>>2]=M,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;L=+g[b+76>>2];G=L-(c[k>>2]=q,+g[k>>2]);L=+g[b+80>>2];K=L-(c[k>>2]=r,+g[k>>2]);L=I*G-H*K;F=H*G+I*K;r=b+144|0;q=(g[k>>2]=L,c[k>>2]|0);j=(g[k>>2]=F,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;K=u+v;j=K==0.0;I=s+t;g[b+184>>2]=I+u*M*M+v*F*F;G=-0.0-M;H=u*J*G-v*F*L;g[b+196>>2]=H;N=u*G-v*F;g[b+208>>2]=N;g[b+188>>2]=H;g[b+200>>2]=I+u*J*J+v*L*L;I=u*J+v*L;g[b+212>>2]=I;g[b+192>>2]=N;g[b+204>>2]=I;g[b+216>>2]=K;if(K>0.0){O=1.0/K}else{O=K}g[b+220>>2]=O;if((a[b+100|0]&1)<<24>>24==0|j){g[b+96>>2]=0.0}do{if((a[b+112|0]&1)<<24>>24==0|j){c[b+224>>2]=0}else{O=B-w- +g[b+116>>2];K=+g[b+124>>2];I=+g[b+120>>2];N=K-I;if(N>0.0){P=N}else{P=-0.0-N}if(P<.06981317698955536){c[b+224>>2]=3;break}if(O<=I){r=b+224|0;if((c[r>>2]|0)!=1){g[b+92>>2]=0.0}c[r>>2]=1;break}r=b+224|0;if(O<K){c[r>>2]=0;g[b+92>>2]=0.0;break}if((c[r>>2]|0)!=2){g[b+92>>2]=0.0}c[r>>2]=2}}while(0);j=b+84|0;if((a[d+20|0]&1)<<24>>24==0){pZ(j|0,0,16);P=A;w=E;B=C;K=D;O=y;I=z;r=c[e>>2]|0;q=r+(f*12&-1)|0;p=q;o=(g[k>>2]=O,c[k>>2]|0);m=(g[k>>2]=I,c[k>>2]|0);x=m;i=0;n=0;Q=x;R=o;U=0;V=n|R;W=Q|U;X=p|0;c[X>>2]=V;Y=p+4|0;c[Y>>2]=W;Z=c[h>>2]|0;_=c[e>>2]|0;$=_+(Z*12&-1)+8|0;g[$>>2]=P;aa=c[l>>2]|0;ab=c[e>>2]|0;ac=ab+(aa*12&-1)|0;ad=ac;ae=(g[k>>2]=B,c[k>>2]|0);af=(g[k>>2]=K,c[k>>2]|0);ag=af;ah=0;ai=0;aj=ag;ak=ae;al=0;am=ai|ak;an=aj|al;ao=ad|0;c[ao>>2]=am;ap=ad+4|0;c[ap>>2]=an;aq=c[l>>2]|0;ar=c[e>>2]|0;as=ar+(aq*12&-1)+8|0;g[as>>2]=w;return}else{at=d+8|0;N=+g[at>>2];d=j|0;H=N*+g[d>>2];g[d>>2]=H;d=b+88|0;G=N*+g[d>>2];g[d>>2]=G;d=b+92|0;au=N*+g[d>>2];g[d>>2]=au;d=b+96|0;N=+g[at>>2]*+g[d>>2];g[d>>2]=N;P=A-u*(au+(N+(G*J-H*M)));w=E+v*(au+(N+(G*L-H*F)));B=C+t*H;K=D+t*G;O=y-s*H;I=z-s*G;r=c[e>>2]|0;q=r+(f*12&-1)|0;p=q;o=(g[k>>2]=O,c[k>>2]|0);m=(g[k>>2]=I,c[k>>2]|0);x=m;i=0;n=0;Q=x;R=o;U=0;V=n|R;W=Q|U;X=p|0;c[X>>2]=V;Y=p+4|0;c[Y>>2]=W;Z=c[h>>2]|0;_=c[e>>2]|0;$=_+(Z*12&-1)+8|0;g[$>>2]=P;aa=c[l>>2]|0;ab=c[e>>2]|0;ac=ab+(aa*12&-1)|0;ad=ac;ae=(g[k>>2]=B,c[k>>2]|0);af=(g[k>>2]=K,c[k>>2]|0);ag=af;ah=0;ai=0;aj=ag;ak=ae;al=0;am=ai|ak;an=aj|al;ao=ad|0;c[ao>>2]=am;ap=ad+4|0;c[ap>>2]=an;aq=c[l>>2]|0;ar=c[e>>2]|0;as=ar+(aq*12&-1)+8|0;g[as>>2]=w;return}}function fN(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0,K=0,L=0,M=0.0,N=0,O=0,P=0.0,Q=0.0,R=0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0,ag=0.0;e=i;i=i+24|0;f=e|0;h=e+12|0;j=b+128|0;l=c[j>>2]|0;m=d+28|0;n=c[m>>2]|0;o=n+(l*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[n+(l*12&-1)+8>>2];p=b+132|0;o=c[p>>2]|0;t=n+(o*12&-1)|0;u=c[t+4>>2]|0;v=(c[k>>2]=c[t>>2]|0,+g[k>>2]);w=(c[k>>2]=u,+g[k>>2]);x=+g[n+(o*12&-1)+8>>2];y=+g[b+168>>2];z=+g[b+172>>2];A=+g[b+176>>2];B=+g[b+180>>2];o=A+B==0.0;do{if((a[b+100|0]&1)<<24>>24==0){C=s;D=x}else{if((c[b+224>>2]|0)==3|o){C=s;D=x;break}n=b+96|0;E=+g[n>>2];F=+g[d>>2]*+g[b+104>>2];G=E+(x-s- +g[b+108>>2])*(-0.0- +g[b+220>>2]);H=-0.0-F;I=G<F?G:F;F=I<H?H:I;g[n>>2]=F;I=F-E;C=s-A*I;D=x+B*I}}while(0);do{if((a[b+112|0]&1)<<24>>24==0){J=136}else{d=b+224|0;if((c[d>>2]|0)==0|o){J=136;break}n=b+148|0;u=b+144|0;t=b+140|0;K=b+136|0;x=v+ +g[n>>2]*(-0.0-D)-q- +g[t>>2]*(-0.0-C);s=w+D*+g[u>>2]-r-C*+g[K>>2];g[f>>2]=x;g[f+4>>2]=s;g[f+8>>2]=D-C;L=b+184|0;c1(h,L,f);I=+g[h>>2];E=-0.0-I;F=+g[h+4>>2];H=-0.0-F;G=+g[h+8>>2];M=-0.0-G;N=c[d>>2]|0;do{if((N|0)==2){d=b+84|0;O=b+92|0;P=+g[O>>2];Q=P-G;if(Q<=0.0){R=d|0;g[R>>2]=+g[R>>2]-I;R=b+88|0;g[R>>2]=+g[R>>2]-F;g[O>>2]=Q;S=E;T=H;U=M;break}Q=P*+g[b+208>>2]-x;V=P*+g[b+212>>2]-s;W=+g[L>>2];X=+g[b+196>>2];Y=+g[b+188>>2];Z=+g[b+200>>2];_=W*Z-X*Y;if(_!=0.0){$=1.0/_}else{$=_}_=(Q*Z-X*V)*$;X=(W*V-Q*Y)*$;R=d|0;g[R>>2]=_+ +g[R>>2];R=b+88|0;g[R>>2]=X+ +g[R>>2];g[O>>2]=0.0;S=_;T=X;U=-0.0-P}else if((N|0)==1){O=b+84|0;R=b+92|0;P=+g[R>>2];X=P-G;if(X>=0.0){d=O|0;g[d>>2]=+g[d>>2]-I;d=b+88|0;g[d>>2]=+g[d>>2]-F;g[R>>2]=X;S=E;T=H;U=M;break}X=P*+g[b+208>>2]-x;_=P*+g[b+212>>2]-s;Y=+g[L>>2];Q=+g[b+196>>2];V=+g[b+188>>2];W=+g[b+200>>2];Z=Y*W-Q*V;if(Z!=0.0){aa=1.0/Z}else{aa=Z}Z=(X*W-Q*_)*aa;Q=(Y*_-X*V)*aa;d=O|0;g[d>>2]=Z+ +g[d>>2];d=b+88|0;g[d>>2]=Q+ +g[d>>2];g[R>>2]=0.0;S=Z;T=Q;U=-0.0-P}else if((N|0)==3){R=b+84|0;g[R>>2]=+g[R>>2]-I;R=b+88|0;g[R>>2]=+g[R>>2]-F;R=b+92|0;g[R>>2]=+g[R>>2]-G;S=E;T=H;U=M}else{S=E;T=H;U=M}}while(0);ab=U+(T*+g[K>>2]-S*+g[t>>2]);ac=U+(T*+g[u>>2]-S*+g[n>>2]);ad=S;ae=T;af=c[j>>2]|0;break}}while(0);if((J|0)==136){T=+g[b+148>>2];S=+g[b+144>>2];U=+g[b+140>>2];aa=+g[b+136>>2];$=-0.0-(v+T*(-0.0-D)-q-U*(-0.0-C));M=-0.0-(w+D*S-r-C*aa);H=+g[b+184>>2];E=+g[b+196>>2];G=+g[b+188>>2];F=+g[b+200>>2];I=H*F-E*G;if(I!=0.0){ag=1.0/I}else{ag=I}I=(F*$-E*M)*ag;E=(H*M-G*$)*ag;J=b+84|0;g[J>>2]=+g[J>>2]+I;J=b+88|0;g[J>>2]=E+ +g[J>>2];ab=E*aa-I*U;ac=E*S-I*T;ad=I;ae=E;af=l}l=(c[m>>2]|0)+(af*12&-1)|0;af=(g[k>>2]=q-y*ad,c[k>>2]|0);J=(g[k>>2]=r-y*ae,c[k>>2]|0)|0;c[l>>2]=0|af;c[l+4>>2]=J;g[(c[m>>2]|0)+((c[j>>2]|0)*12&-1)+8>>2]=C-A*ab;j=(c[m>>2]|0)+((c[p>>2]|0)*12&-1)|0;J=(g[k>>2]=v+z*ad,c[k>>2]|0);l=(g[k>>2]=w+z*ae,c[k>>2]|0)|0;c[j>>2]=0|J;c[j+4>>2]=l;g[(c[m>>2]|0)+((c[p>>2]|0)*12&-1)+8>>2]=D+B*ac;i=e;return}function fO(a){a=a|0;return}function fP(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fQ(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fR(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+88>>2]*c;g[a>>2]=+g[b+84>>2]*c;g[a+4>>2]=d;return}function fS(a,b){a=a|0;b=+b;return+(+g[a+92>>2]*b)}function fT(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0;d=a+96|0;e=c[d>>2]|0;f=b+28|0;h=c[f>>2]|0;i=h+(e*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[h+(e*12&-1)+8>>2];j=a+100|0;i=c[j>>2]|0;o=h+(i*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[h+(i*12&-1)+8>>2];t=+g[a+116>>2];u=+g[a+112>>2];v=+g[a+124>>2];w=+g[a+120>>2];x=+g[a+88>>2]- +g[a+84>>2];y=+g[a+104>>2];z=+g[a+108>>2];A=(q+v*(-0.0-s)-(l+t*(-0.0-n)))*y+(r+s*w-(m+n*u))*z;if(x<0.0){B=A+x*+g[b+4>>2]}else{B=A}b=a+92|0;A=+g[b>>2];x=A+B*(-0.0- +g[a+160>>2]);B=x>0.0?0.0:x;g[b>>2]=B;x=B-A;A=y*x;y=z*x;x=+g[a+144>>2];z=n- +g[a+152>>2]*(u*y-t*A);t=+g[a+148>>2];u=s+ +g[a+156>>2]*(y*w-A*v);a=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=l-x*A,c[k>>2]|0);b=(g[k>>2]=m-x*y,c[k>>2]|0)|0;c[a>>2]=0|e;c[a+4>>2]=b;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=z;d=(c[f>>2]|0)+((c[j>>2]|0)*12&-1)|0;b=(g[k>>2]=q+A*t,c[k>>2]|0);a=(g[k>>2]=r+y*t,c[k>>2]|0)|0;c[d>>2]=0|b;c[d+4>>2]=a;g[(c[f>>2]|0)+((c[j>>2]|0)*12&-1)+8>>2]=u;return}function fU(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0;e=b+128|0;f=c[e>>2]|0;h=d+24|0;d=c[h>>2]|0;i=d+(f*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[d+(f*12&-1)+8>>2];f=b+132|0;j=c[f>>2]|0;o=d+(j*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[d+(j*12&-1)+8>>2];j=b+176|0;d=b+180|0;do{if((a[b+112|0]&1)<<24>>24==0){t=n;u=s;v=0.0;w=+g[j>>2];x=+g[d>>2]}else{y=+g[d>>2];z=+g[j>>2];p=c[b+224>>2]|0;if((p|0)==0|y+z==0.0){t=n;u=s;v=0.0;w=z;x=y;break}A=s-n- +g[b+116>>2];do{if((p|0)==1){B=A- +g[b+120>>2];C=B+.03490658849477768;D=C<0.0?C:0.0;E=-0.0-B;F=(D<-.13962635397911072?-.13962635397911072:D)*(-0.0- +g[b+220>>2])}else if((p|0)==3){D=A- +g[b+120>>2];B=D<.13962635397911072?D:.13962635397911072;D=B<-.13962635397911072?-.13962635397911072:B;B=D*(-0.0- +g[b+220>>2]);if(D>0.0){E=D;F=B;break}E=-0.0-D;F=B}else if((p|0)==2){B=A- +g[b+124>>2];D=B+-.03490658849477768;C=D<.13962635397911072?D:.13962635397911072;E=B;F=(C<0.0?0.0:C)*(-0.0- +g[b+220>>2])}else{E=0.0;F=0.0}}while(0);t=n-F*z;u=s+F*y;v=E;w=z;x=y}}while(0);E=+T(+t);F=+S(+t);s=+T(+u);n=+S(+u);A=+g[b+68>>2]- +g[b+152>>2];C=+g[b+72>>2]- +g[b+156>>2];B=F*A-E*C;D=E*A+F*C;C=+g[b+76>>2]- +g[b+160>>2];F=+g[b+80>>2]- +g[b+164>>2];A=n*C-s*F;E=s*C+n*F;F=q+A-l-B;n=r+E-m-D;C=+Q(+(F*F+n*n));s=+g[b+168>>2];G=+g[b+172>>2];H=s+G;I=H+D*D*w+E*E*x;J=A*x;K=D*B*(-0.0-w)-E*J;L=H+B*B*w+A*J;J=I*L-K*K;if(J!=0.0){M=1.0/J}else{M=J}J=-0.0-(F*L-n*K)*M;L=-0.0-(n*I-F*K)*M;b=(g[k>>2]=l-s*J,c[k>>2]|0);j=(g[k>>2]=m-s*L,c[k>>2]|0)|0;c[i>>2]=0|b;c[i+4>>2]=j;g[(c[h>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=t-w*(B*L-D*J);e=(c[h>>2]|0)+((c[f>>2]|0)*12&-1)|0;j=(g[k>>2]=q+G*J,c[k>>2]|0);i=(g[k>>2]=r+G*L,c[k>>2]|0)|0;c[e>>2]=0|j;c[e+4>>2]=i;g[(c[h>>2]|0)+((c[f>>2]|0)*12&-1)+8>>2]=u+x*(A*L-E*J);if(C>.004999999888241291){N=0;return N|0}N=v<=.03490658849477768;return N|0}function fV(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;c7(6848,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(9068,(v=i,i=i+4|0,c[v>>2]=e,v)|0);c7(6732,(v=i,i=i+4|0,c[v>>2]=f,v)|0);c7(4924,(v=i,i=i+4|0,c[v>>2]=a[b+61|0]&1,v)|0);j=+g[b+72>>2];c7(4240,(v=i,i=i+16|0,h[k>>3]=+g[b+68>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);j=+g[b+80>>2];c7(3816,(v=i,i=i+16|0,h[k>>3]=+g[b+76>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);c7(3376,(v=i,i=i+8|0,h[k>>3]=+g[b+116>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(2612,(v=i,i=i+4|0,c[v>>2]=a[b+112|0]&1,v)|0);c7(10384,(v=i,i=i+8|0,h[k>>3]=+g[b+120>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(10112,(v=i,i=i+8|0,h[k>>3]=+g[b+124>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(3076,(v=i,i=i+4|0,c[v>>2]=a[b+100|0]&1,v)|0);c7(2828,(v=i,i=i+8|0,h[k>>3]=+g[b+108>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(2580,(v=i,i=i+8|0,h[k>>3]=+g[b+104>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(9548,(v=i,i=i+4|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function fW(a){a=a|0;pT(a);return}function fX(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+96|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+100|0;c[l>>2]=j;m=e+28|0;n=b+128|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+136|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+144>>2]=s;t=+g[i+120>>2];g[b+148>>2]=t;u=+g[e+128>>2];g[b+152>>2]=u;v=+g[i+128>>2];g[b+156>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;m=c[e+4>>2]|0;w=(c[k>>2]=c[e>>2]|0,+g[k>>2]);x=(c[k>>2]=m,+g[k>>2]);y=+g[i+(f*12&-1)+8>>2];m=d+28|0;e=c[m>>2]|0;n=e+(f*12&-1)|0;z=c[n+4>>2]|0;A=(c[k>>2]=c[n>>2]|0,+g[k>>2]);B=(c[k>>2]=z,+g[k>>2]);C=+g[e+(f*12&-1)+8>>2];z=i+(j*12&-1)|0;n=c[z+4>>2]|0;D=(c[k>>2]=c[z>>2]|0,+g[k>>2]);E=(c[k>>2]=n,+g[k>>2]);F=+g[i+(j*12&-1)+8>>2];i=e+(j*12&-1)|0;n=c[i+4>>2]|0;G=(c[k>>2]=c[i>>2]|0,+g[k>>2]);H=(c[k>>2]=n,+g[k>>2]);I=+g[e+(j*12&-1)+8>>2];J=+T(+y);K=+S(+y);y=+T(+F);L=+S(+F);F=+g[b+68>>2];M=F-(c[k>>2]=o,+g[k>>2]);F=+g[b+72>>2];N=F-(c[k>>2]=p,+g[k>>2]);F=K*M-J*N;O=J*M+K*N;p=b+112|0;o=(g[k>>2]=F,c[k>>2]|0);j=(g[k>>2]=O,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;N=+g[b+76>>2];K=N-(c[k>>2]=q,+g[k>>2]);N=+g[b+80>>2];M=N-(c[k>>2]=r,+g[k>>2]);N=L*K-y*M;J=y*K+L*M;r=b+120|0;q=(g[k>>2]=N,c[k>>2]|0);j=(g[k>>2]=J,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;j=b+104|0;M=D+N-w-F;w=E+J-x-O;r=j;q=(g[k>>2]=M,c[k>>2]|0);p=(g[k>>2]=w,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=p;p=j|0;j=b+108|0;x=+Q(+(M*M+w*w));g[b+88>>2]=x;c[b+164>>2]=x- +g[b+84>>2]>0.0?2:0;if(x<=.004999999888241291){g[p>>2]=0.0;g[j>>2]=0.0;g[b+160>>2]=0.0;g[b+92>>2]=0.0;return}E=1.0/x;x=E*M;g[p>>2]=x;M=E*w;g[j>>2]=M;w=F*M-O*x;E=M*N-x*J;D=t+(s+w*w*u)+E*E*v;if(D!=0.0){P=1.0/D}else{P=0.0}g[b+160>>2]=P;if((a[d+20|0]&1)<<24>>24==0){g[b+92>>2]=0.0;R=C;U=I;V=G;W=H;X=A;Y=B}else{j=b+92|0;P=+g[d+8>>2]*+g[j>>2];g[j>>2]=P;D=x*P;x=P*M;R=C-u*(x*F-D*O);U=I+v*(x*N-D*J);V=G+D*t;W=H+x*t;X=A-D*s;Y=B-x*s}j=(c[m>>2]|0)+(f*12&-1)|0;f=(g[k>>2]=X,c[k>>2]|0);d=(g[k>>2]=Y,c[k>>2]|0)|0;c[j>>2]=0|f;c[j+4>>2]=d;g[(c[m>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=R;h=(c[m>>2]|0)+((c[l>>2]|0)*12&-1)|0;d=(g[k>>2]=V,c[k>>2]|0);j=(g[k>>2]=W,c[k>>2]|0)|0;c[h>>2]=0|d;c[h+4>>2]=j;g[(c[m>>2]|0)+((c[l>>2]|0)*12&-1)+8>>2]=U;return}function fY(a,b){a=a|0;b=+b;return+0.0}function fZ(a){a=a|0;return}function f_(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function f$(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function f0(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+92>>2]*c;c=d*+g[b+108>>2];g[a>>2]=+g[b+104>>2]*d;g[a+4>>2]=c;return}function f1(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0;d=a+116|0;e=c[d>>2]|0;f=b+28|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];i=a+120|0;h=c[i>>2]|0;n=b+(h*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(h*12&-1)+8>>2];s=+g[a+156>>2];t=+g[a+160>>2];u=+g[a+164>>2];v=+g[a+168>>2];if(+g[a+68>>2]>0.0){h=a+112|0;w=+g[h>>2];x=(r-m+ +g[a+76>>2]+ +g[a+100>>2]*w)*(-0.0- +g[a+204>>2]);g[h>>2]=w+x;w=m-u*x;y=r+v*x;x=+g[a+136>>2];z=+g[a+132>>2];A=+g[a+128>>2];B=+g[a+124>>2];C=p+x*(-0.0-y)-j-A*(-0.0-w);D=q+z*y-l-B*w;E=+g[a+184>>2]*D+ +g[a+172>>2]*C;F=+g[a+188>>2]*D+ +g[a+176>>2]*C;C=-0.0-E;D=-0.0-F;h=a+104|0;g[h>>2]=+g[h>>2]-E;h=a+108|0;g[h>>2]=+g[h>>2]-F;G=w-u*(B*D-A*C);H=y+v*(z*D-x*C);I=C;J=D}else{D=+g[a+136>>2];C=+g[a+132>>2];x=+g[a+128>>2];z=+g[a+124>>2];y=p+D*(-0.0-r)-j-x*(-0.0-m);A=q+r*C-l-m*z;B=r-m;w=y*+g[a+172>>2]+A*+g[a+184>>2]+B*+g[a+196>>2];F=y*+g[a+176>>2]+A*+g[a+188>>2]+B*+g[a+200>>2];E=y*+g[a+180>>2]+A*+g[a+192>>2]+B*+g[a+204>>2];B=-0.0-w;A=-0.0-F;h=a+104|0;g[h>>2]=+g[h>>2]-w;h=a+108|0;g[h>>2]=+g[h>>2]-F;h=a+112|0;g[h>>2]=+g[h>>2]-E;G=m-u*(z*A-x*B-E);H=r+v*(C*A-D*B-E);I=B;J=A}h=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=j-s*I,c[k>>2]|0);a=(g[k>>2]=l-s*J,c[k>>2]|0)|0;c[h>>2]=0|e;c[h+4>>2]=a;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=G;d=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;a=(g[k>>2]=p+t*I,c[k>>2]|0);h=(g[k>>2]=q+t*J,c[k>>2]|0)|0;c[d>>2]=0|a;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=H;return}function f2(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0;d=a+96|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];e=a+100|0;i=c[e>>2]|0;n=b+(i*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(i*12&-1)+8>>2];s=+T(+m);t=+S(+m);u=+T(+r);v=+S(+r);w=+g[a+68>>2]- +g[a+128>>2];x=+g[a+72>>2]- +g[a+132>>2];y=t*w-s*x;z=s*w+t*x;x=+g[a+76>>2]- +g[a+136>>2];t=+g[a+80>>2]- +g[a+140>>2];w=v*x-u*t;s=u*x+v*t;t=p+w-j-y;v=q+s-l-z;x=+Q(+(t*t+v*v));if(x<1.1920928955078125e-7){A=0.0;B=t;C=v}else{u=1.0/x;A=x;B=t*u;C=v*u}i=a+84|0;u=A- +g[i>>2];v=u<.20000000298023224?u:.20000000298023224;u=(v<0.0?0.0:v)*(-0.0- +g[a+160>>2]);v=B*u;B=C*u;u=+g[a+144>>2];C=m- +g[a+152>>2]*(y*B-z*v);z=+g[a+148>>2];y=r+ +g[a+156>>2]*(w*B-s*v);a=(g[k>>2]=j-u*v,c[k>>2]|0);b=(g[k>>2]=l-u*B,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=b;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=C;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;b=(g[k>>2]=p+z*v,c[k>>2]|0);h=(g[k>>2]=q+z*B,c[k>>2]|0)|0;c[d>>2]=0|b;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=y;return A- +g[i>>2]<.004999999888241291|0}function f3(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;c7(4628,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(9068,(v=i,i=i+4|0,c[v>>2]=e,v)|0);c7(6732,(v=i,i=i+4|0,c[v>>2]=f,v)|0);c7(4924,(v=i,i=i+4|0,c[v>>2]=a[b+61|0]&1,v)|0);j=+g[b+72>>2];c7(4240,(v=i,i=i+16|0,h[k>>3]=+g[b+68>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);j=+g[b+80>>2];c7(3816,(v=i,i=i+16|0,h[k>>3]=+g[b+76>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);c7(3408,(v=i,i=i+8|0,h[k>>3]=+g[b+84>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(9548,(v=i,i=i+4|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function f4(a){a=a|0;pT(a);return}function f5(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+116|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+120|0;c[l>>2]=j;m=e+28|0;n=b+140|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+148|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+156>>2]=s;t=+g[i+120>>2];g[b+160>>2]=t;u=+g[e+128>>2];g[b+164>>2]=u;v=+g[i+128>>2];g[b+168>>2]=v;i=c[d+24>>2]|0;w=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;x=c[n+4>>2]|0;y=(c[k>>2]=c[n>>2]|0,+g[k>>2]);z=(c[k>>2]=x,+g[k>>2]);A=+g[m+(f*12&-1)+8>>2];B=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;x=c[i+4>>2]|0;C=(c[k>>2]=c[i>>2]|0,+g[k>>2]);D=(c[k>>2]=x,+g[k>>2]);E=+g[m+(j*12&-1)+8>>2];F=+T(+w);G=+S(+w);H=+T(+B);I=+S(+B);J=+g[b+80>>2];K=J-(c[k>>2]=o,+g[k>>2]);J=+g[b+84>>2];L=J-(c[k>>2]=p,+g[k>>2]);J=G*K-F*L;M=F*K+G*L;p=b+124|0;o=(g[k>>2]=J,c[k>>2]|0);j=(g[k>>2]=M,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;L=+g[b+88>>2];G=L-(c[k>>2]=q,+g[k>>2]);L=+g[b+92>>2];K=L-(c[k>>2]=r,+g[k>>2]);L=I*G-H*K;F=H*G+I*K;r=b+132|0;q=(g[k>>2]=L,c[k>>2]|0);j=(g[k>>2]=F,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;K=s+t;I=K+u*M*M+v*F*F;G=-0.0-M;H=u*J*G-v*F*L;N=u*G-v*F;G=K+u*J*J+v*L*L;K=u*J+v*L;O=u+v;P=+g[b+68>>2];j=b+172|0;if(P>0.0){Q=I*G-H*H;if(Q!=0.0){R=1.0/Q}else{R=Q}g[j>>2]=G*R;Q=H*(-0.0-R);g[b+184>>2]=Q;g[b+180>>2]=0.0;g[b+176>>2]=Q;g[b+188>>2]=I*R;pZ(b+192|0,0,16);if(O>0.0){U=1.0/O}else{U=0.0}R=B-w- +g[b+96>>2];w=P*6.2831854820251465;P=w*U*w;B=+g[d>>2];Q=B*(w*U*2.0*+g[b+72>>2]+B*P);r=b+100|0;g[r>>2]=Q;if(Q!=0.0){V=1.0/Q}else{V=0.0}g[r>>2]=V;g[b+76>>2]=R*B*P*V;P=O+V;if(P!=0.0){W=1.0/P}else{W=0.0}g[b+204>>2]=W}else{W=O*G-K*K;P=N*K-O*H;V=K*H-N*G;B=N*V+(I*W+H*P);if(B!=0.0){X=1.0/B}else{X=B}g[j>>2]=W*X;W=P*X;g[b+176>>2]=W;P=V*X;g[b+180>>2]=P;g[b+184>>2]=W;g[b+188>>2]=(O*I-N*N)*X;O=(N*H-I*K)*X;g[b+192>>2]=O;g[b+196>>2]=P;g[b+200>>2]=O;g[b+204>>2]=(I*G-H*H)*X;g[b+100>>2]=0.0;g[b+76>>2]=0.0}j=b+104|0;if((a[d+20|0]&1)<<24>>24==0){g[j>>2]=0.0;g[b+108>>2]=0.0;g[b+112>>2]=0.0;X=A;H=E;G=C;I=D;O=y;P=z;r=c[e>>2]|0;q=r+(f*12&-1)|0;p=q;o=(g[k>>2]=O,c[k>>2]|0);m=(g[k>>2]=P,c[k>>2]|0);x=m;i=0;n=0;Y=x;Z=o;_=0;$=n|Z;aa=Y|_;ab=p|0;c[ab>>2]=$;ac=p+4|0;c[ac>>2]=aa;ad=c[h>>2]|0;ae=c[e>>2]|0;af=ae+(ad*12&-1)+8|0;g[af>>2]=X;ag=c[l>>2]|0;ah=c[e>>2]|0;ai=ah+(ag*12&-1)|0;aj=ai;ak=(g[k>>2]=G,c[k>>2]|0);al=(g[k>>2]=I,c[k>>2]|0);am=al;an=0;ao=0;ap=am;aq=ak;ar=0;as=ao|aq;at=ap|ar;au=aj|0;c[au>>2]=as;av=aj+4|0;c[av>>2]=at;aw=c[l>>2]|0;ax=c[e>>2]|0;ay=ax+(aw*12&-1)+8|0;g[ay>>2]=H;return}else{K=+g[d+8>>2];d=j|0;N=K*+g[d>>2];g[d>>2]=N;d=b+108|0;W=K*+g[d>>2];g[d>>2]=W;d=b+112|0;V=K*+g[d>>2];g[d>>2]=V;X=A-u*(V+(W*J-N*M));H=E+v*(V+(W*L-N*F));G=C+t*N;I=D+t*W;O=y-s*N;P=z-s*W;r=c[e>>2]|0;q=r+(f*12&-1)|0;p=q;o=(g[k>>2]=O,c[k>>2]|0);m=(g[k>>2]=P,c[k>>2]|0);x=m;i=0;n=0;Y=x;Z=o;_=0;$=n|Z;aa=Y|_;ab=p|0;c[ab>>2]=$;ac=p+4|0;c[ac>>2]=aa;ad=c[h>>2]|0;ae=c[e>>2]|0;af=ae+(ad*12&-1)+8|0;g[af>>2]=X;ag=c[l>>2]|0;ah=c[e>>2]|0;ai=ah+(ag*12&-1)|0;aj=ai;ak=(g[k>>2]=G,c[k>>2]|0);al=(g[k>>2]=I,c[k>>2]|0);am=al;an=0;ao=0;ap=am;aq=ak;ar=0;as=ao|aq;at=ap|ar;au=aj|0;c[au>>2]=as;av=aj+4|0;c[av>>2]=at;aw=c[l>>2]|0;ax=c[e>>2]|0;ay=ax+(aw*12&-1)+8|0;g[ay>>2]=H;return}}function f6(a){a=a|0;return}function f7(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+80>>2];h=+g[d+20>>2];i=+g[b+84>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function f8(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+88>>2];h=+g[d+20>>2];i=+g[b+92>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function f9(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+108>>2]*c;g[a>>2]=+g[b+104>>2]*c;g[a+4>>2]=d;return}function ga(a,b){a=a|0;b=+b;return+(+g[a+112>>2]*b)}function gb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0;d=a+116|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];e=a+120|0;i=c[e>>2]|0;n=b+(i*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(i*12&-1)+8>>2];s=+T(+m);t=+S(+m);u=+T(+r);v=+S(+r);w=+g[a+156>>2];x=+g[a+160>>2];y=+g[a+164>>2];z=+g[a+168>>2];A=+g[a+80>>2]- +g[a+140>>2];B=+g[a+84>>2]- +g[a+144>>2];C=t*A-s*B;D=s*A+t*B;B=+g[a+88>>2]- +g[a+148>>2];t=+g[a+92>>2]- +g[a+152>>2];A=v*B-u*t;s=u*B+v*t;t=w+x;v=t+y*D*D+z*s*s;B=-0.0-D;u=y*C*B-z*s*A;E=y*B-z*s;B=t+y*C*C+z*A*A;t=y*C+z*A;F=y+z;G=p+A-j-C;H=q+s-l-D;if(+g[a+68>>2]>0.0){I=+Q(+(G*G+H*H));J=v*B-u*u;if(J!=0.0){K=1.0/J}else{K=J}J=-0.0-(B*G-u*H)*K;L=-0.0-(v*H-u*G)*K;M=C*L-D*J;N=0.0;O=I;P=A*L-s*J;R=J;U=L}else{L=r-m- +g[a+96>>2];J=+Q(+(G*G+H*H));if(L>0.0){V=L}else{V=-0.0-L}I=F*B-t*t;K=t*E-F*u;W=t*u-E*B;X=E*W+(v*I+u*K);if(X!=0.0){Y=1.0/X}else{Y=X}X=t*G;Z=(E*(H*u-B*G)+(v*(B*L-t*H)+u*(X-u*L)))*Y;B=-0.0-(G*I+H*K+W*L)*Y;W=-0.0-(E*(X-E*H)+(v*(F*H-t*L)+u*(E*L-F*G)))*Y;M=C*W-D*B-Z;N=V;O=J;P=A*W-s*B-Z;R=B;U=W}a=(g[k>>2]=j-w*R,c[k>>2]|0);i=(g[k>>2]=l-w*U,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=i;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=m-y*M;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;i=(g[k>>2]=p+x*R,c[k>>2]|0);h=(g[k>>2]=q+x*U,c[k>>2]|0)|0;c[d>>2]=0|i;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=r+z*P;if(O>.004999999888241291){_=0;return _|0}_=N<=.03490658849477768;return _|0}function gc(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;c7(4572,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(9068,(v=i,i=i+4|0,c[v>>2]=e,v)|0);c7(6732,(v=i,i=i+4|0,c[v>>2]=f,v)|0);c7(4924,(v=i,i=i+4|0,c[v>>2]=a[b+61|0]&1,v)|0);j=+g[b+84>>2];c7(4240,(v=i,i=i+16|0,h[k>>3]=+g[b+80>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);j=+g[b+92>>2];c7(3816,(v=i,i=i+16|0,h[k>>3]=+g[b+88>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);c7(3376,(v=i,i=i+8|0,h[k>>3]=+g[b+96>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(10352,(v=i,i=i+8|0,h[k>>3]=+g[b+68>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(10080,(v=i,i=i+8|0,h[k>>3]=+g[b+72>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(9548,(v=i,i=i+4|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function gd(a){a=a|0;pT(a);return}function ge(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0;e=b|0;c[e>>2]=16504;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){bc(5328,173,13288,6976)}c[b+4>>2]=c[d>>2]|0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[f>>2]|0;c[b+52>>2]=c[h>>2]|0;c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2]|0;pZ(b+16|0,0,32);c[e>>2]=17132;e=d+20|0;h=b+76|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2]|0;c[h+4>>2]=f;f=d+28|0;h=b+84|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=e;e=d+36|0;h=b+92|0;f=c[e>>2]|0;i=c[e+4>>2]|0;c[h>>2]=f;c[h+4>>2]=i;h=b+100|0;c[h>>2]=0|(g[k>>2]=(c[k>>2]=i,+g[k>>2])*-1.0,c[k>>2]|0);c[h+4>>2]=f|0;g[b+204>>2]=0.0;g[b+108>>2]=0.0;g[b+208>>2]=0.0;g[b+112>>2]=0.0;g[b+212>>2]=0.0;g[b+116>>2]=0.0;g[b+120>>2]=+g[d+48>>2];g[b+124>>2]=+g[d+52>>2];a[b+128|0]=a[d+44|0]&1;g[b+68>>2]=+g[d+56>>2];g[b+72>>2]=+g[d+60>>2];g[b+216>>2]=0.0;g[b+220>>2]=0.0;pZ(b+172|0,0,16);return}function gf(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+132|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+136|0;c[l>>2]=j;m=e+28|0;n=b+140|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+148|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+156>>2]=s;t=+g[i+120>>2];g[b+160>>2]=t;u=+g[e+128>>2];g[b+164>>2]=u;v=+g[i+128>>2];g[b+168>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;m=c[e+4>>2]|0;w=(c[k>>2]=c[e>>2]|0,+g[k>>2]);x=(c[k>>2]=m,+g[k>>2]);y=+g[i+(f*12&-1)+8>>2];m=d+28|0;e=c[m>>2]|0;n=e+(f*12&-1)|0;z=c[n+4>>2]|0;A=(c[k>>2]=c[n>>2]|0,+g[k>>2]);B=(c[k>>2]=z,+g[k>>2]);C=+g[e+(f*12&-1)+8>>2];z=i+(j*12&-1)|0;n=c[z+4>>2]|0;D=(c[k>>2]=c[z>>2]|0,+g[k>>2]);E=(c[k>>2]=n,+g[k>>2]);F=+g[i+(j*12&-1)+8>>2];i=e+(j*12&-1)|0;n=c[i+4>>2]|0;G=(c[k>>2]=c[i>>2]|0,+g[k>>2]);H=(c[k>>2]=n,+g[k>>2]);I=+g[e+(j*12&-1)+8>>2];J=+T(+y);K=+S(+y);y=+T(+F);L=+S(+F);F=+g[b+76>>2];M=F-(c[k>>2]=o,+g[k>>2]);F=+g[b+80>>2];N=F-(c[k>>2]=p,+g[k>>2]);F=K*M-J*N;O=J*M+K*N;N=+g[b+84>>2];M=N-(c[k>>2]=q,+g[k>>2]);N=+g[b+88>>2];P=N-(c[k>>2]=r,+g[k>>2]);N=L*M-y*P;Q=y*M+L*P;P=D+N-w-F;w=E+Q-x-O;x=+g[b+100>>2];E=+g[b+104>>2];D=K*x-J*E;L=J*x+K*E;r=b+180|0;q=(g[k>>2]=D,c[k>>2]|0);p=(g[k>>2]=L,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=p;E=F+P;F=O+w;O=L*E-D*F;g[b+196>>2]=O;x=N*L-Q*D;g[b+200>>2]=x;M=s+t;y=M+O*u*O+x*v*x;if(y>0.0){R=1.0/y}else{R=y}g[b+204>>2]=R;p=b+212|0;g[p>>2]=0.0;r=b+216|0;g[r>>2]=0.0;q=b+220|0;g[q>>2]=0.0;R=+g[b+68>>2];do{if(R>0.0){y=+g[b+92>>2];U=+g[b+96>>2];V=K*y-J*U;W=J*y+K*U;o=b+172|0;j=(g[k>>2]=V,c[k>>2]|0);e=(g[k>>2]=W,c[k>>2]|0)|0;c[o>>2]=0|j;c[o+4>>2]=e;U=E*W-F*V;g[b+188>>2]=U;y=N*W-Q*V;g[b+192>>2]=y;X=M+U*u*U+y*v*y;if(X<=0.0){break}y=1.0/X;g[p>>2]=y;U=R*6.2831854820251465;Y=U*y*U;Z=+g[d>>2];_=Z*(U*y*2.0*+g[b+72>>2]+Z*Y);if(_>0.0){$=1.0/_}else{$=_}g[q>>2]=$;g[r>>2]=(P*V+w*W)*Z*Y*$;Y=X+$;g[p>>2]=Y;if(Y<=0.0){break}g[p>>2]=1.0/Y}else{g[b+116>>2]=0.0}}while(0);do{if((a[b+128|0]&1)<<24>>24==0){g[b+208>>2]=0.0;g[b+112>>2]=0.0}else{$=v+u;p=b+208|0;g[p>>2]=$;if($<=0.0){break}g[p>>2]=1.0/$}}while(0);if((a[d+20|0]&1)<<24>>24==0){g[b+108>>2]=0.0;g[b+116>>2]=0.0;g[b+112>>2]=0.0;$=C;w=I;P=G;R=H;M=A;Q=B;p=c[m>>2]|0;r=p+(f*12&-1)|0;q=r;e=(g[k>>2]=M,c[k>>2]|0);o=(g[k>>2]=Q,c[k>>2]|0);j=o;n=0;i=0;z=j;aa=e;ab=0;ac=i|aa;ad=z|ab;ae=q|0;c[ae>>2]=ac;af=q+4|0;c[af>>2]=ad;ag=c[h>>2]|0;ah=c[m>>2]|0;ai=ah+(ag*12&-1)+8|0;g[ai>>2]=$;aj=c[l>>2]|0;ak=c[m>>2]|0;al=ak+(aj*12&-1)|0;am=al;an=(g[k>>2]=P,c[k>>2]|0);ao=(g[k>>2]=R,c[k>>2]|0);ap=ao;aq=0;ar=0;as=ap;at=an;au=0;av=ar|at;aw=as|au;ax=am|0;c[ax>>2]=av;ay=am+4|0;c[ay>>2]=aw;az=c[l>>2]|0;aA=c[m>>2]|0;aB=aA+(az*12&-1)+8|0;g[aB>>2]=w;return}else{aC=d+8|0;d=b+108|0;N=+g[aC>>2]*+g[d>>2];g[d>>2]=N;d=b+116|0;F=+g[aC>>2]*+g[d>>2];g[d>>2]=F;d=b+112|0;E=+g[aC>>2]*+g[d>>2];g[d>>2]=E;K=N*D+F*+g[b+172>>2];D=N*L+F*+g[b+176>>2];$=C-(E+(N*O+F*+g[b+188>>2]))*u;w=I+(E+(N*x+F*+g[b+192>>2]))*v;P=G+K*t;R=H+D*t;M=A-K*s;Q=B-D*s;p=c[m>>2]|0;r=p+(f*12&-1)|0;q=r;e=(g[k>>2]=M,c[k>>2]|0);o=(g[k>>2]=Q,c[k>>2]|0);j=o;n=0;i=0;z=j;aa=e;ab=0;ac=i|aa;ad=z|ab;ae=q|0;c[ae>>2]=ac;af=q+4|0;c[af>>2]=ad;ag=c[h>>2]|0;ah=c[m>>2]|0;ai=ah+(ag*12&-1)+8|0;g[ai>>2]=$;aj=c[l>>2]|0;ak=c[m>>2]|0;al=ak+(aj*12&-1)|0;am=al;an=(g[k>>2]=P,c[k>>2]|0);ao=(g[k>>2]=R,c[k>>2]|0);ap=ao;aq=0;ar=0;as=ap;at=an;au=0;av=ar|at;aw=as|au;ax=am|0;c[ax>>2]=av;ay=am+4|0;c[ay>>2]=aw;az=c[l>>2]|0;aA=c[m>>2]|0;aB=aA+(az*12&-1)+8|0;g[aB>>2]=w;return}}function gg(a){a=a|0;return}function gh(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0,j=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0;d=+g[a+156>>2];e=+g[a+160>>2];f=+g[a+164>>2];h=+g[a+168>>2];i=a+132|0;j=c[i>>2]|0;l=b+28|0;m=c[l>>2]|0;n=m+(j*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[m+(j*12&-1)+8>>2];o=a+136|0;n=c[o>>2]|0;s=m+(n*12&-1)|0;t=c[s+4>>2]|0;u=(c[k>>2]=c[s>>2]|0,+g[k>>2]);v=(c[k>>2]=t,+g[k>>2]);w=+g[m+(n*12&-1)+8>>2];x=+g[a+172>>2];y=+g[a+176>>2];z=+g[a+192>>2];A=+g[a+188>>2];n=a+116|0;B=+g[n>>2];C=(+g[a+216>>2]+(w*z+(x*(u-p)+y*(v-q))-r*A)+ +g[a+220>>2]*B)*(-0.0- +g[a+212>>2]);g[n>>2]=B+C;B=x*C;x=y*C;y=p-d*B;p=q-d*x;q=r-f*C*A;A=u+e*B;B=v+e*x;x=w+h*C*z;n=a+112|0;z=+g[n>>2];C=+g[b>>2]*+g[a+120>>2];w=z+(x-q- +g[a+124>>2])*(-0.0- +g[a+208>>2]);v=-0.0-C;u=w<C?w:C;C=u<v?v:u;g[n>>2]=C;u=C-z;z=q-f*u;q=x+h*u;u=+g[a+180>>2];x=+g[a+184>>2];C=+g[a+200>>2];v=+g[a+196>>2];w=((A-y)*u+(B-p)*x+C*q-v*z)*(-0.0- +g[a+204>>2]);n=a+108|0;g[n>>2]=+g[n>>2]+w;r=u*w;u=x*w;n=(c[l>>2]|0)+(j*12&-1)|0;j=(g[k>>2]=y-d*r,c[k>>2]|0);a=(g[k>>2]=p-d*u,c[k>>2]|0)|0;c[n>>2]=0|j;c[n+4>>2]=a;g[(c[l>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=z-f*v*w;i=(c[l>>2]|0)+((c[o>>2]|0)*12&-1)|0;a=(g[k>>2]=A+e*r,c[k>>2]|0);n=(g[k>>2]=B+e*u,c[k>>2]|0)|0;c[i>>2]=0|a;c[i+4>>2]=n;g[(c[l>>2]|0)+((c[o>>2]|0)*12&-1)+8>>2]=q+h*C*w;return}function gi(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function gj(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+84>>2];h=+g[d+20>>2];i=+g[b+88>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function gk(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0,f=0.0;d=+g[b+108>>2];e=+g[b+116>>2];f=(d*+g[b+184>>2]+e*+g[b+176>>2])*c;g[a>>2]=(d*+g[b+180>>2]+e*+g[b+172>>2])*c;g[a+4>>2]=f;return}function gl(a,b){a=a|0;b=+b;return+(+g[a+112>>2]*b)}function gm(a){a=a|0;return c[a+68>>2]|0}function gn(a){a=a|0;return c[a+64>>2]|0}function go(a,b){a=a|0;b=b|0;c[a+68>>2]=b;return}function gp(a,b){a=a|0;b=b|0;c[a+76>>2]=b;return}function gq(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function gr(a,b){a=a|0;b=b|0;c[a+60>>2]=b;return}function gs(a){a=a|0;return c[a+72>>2]|0}function gt(a,b){a=a|0;b=b|0;c[a+72>>2]=b;return}function gu(a){a=a|0;return a|0}function gv(a){a=a|0;return c[a+60>>2]|0}function gw(a){a=a|0;return c[a+76>>2]|0}function gx(a){a=a|0;return+(+g[a+20>>2])}function gy(a,b){a=a|0;b=+b;g[a+16>>2]=b;return}function gz(a){a=a|0;return c[a+12>>2]|0}function gA(a,b){a=a|0;b=+b;g[a+20>>2]=b;return}function gB(a){a=a|0;return c[a+8>>2]|0}function gC(a){a=a|0;return c[a+4>>2]|0}function gD(a){a=a|0;return+(+g[a+16>>2])}function gE(a){a=a|0;return c[a+40>>2]|0}function gF(a,b){a=a|0;b=+b;g[a>>2]=b;return}function gG(d,e){d=d|0;e=e|0;var f=0,h=0,i=0;f=d+38|0;if((e&1|0)==(a[f]&1|0)){return}h=c[d+8>>2]|0;d=h+4|0;i=b[d>>1]|0;if((i&2)<<16>>16==0){b[d>>1]=i|2;g[h+144>>2]=0.0}a[f]=e&1;return}function gH(a,b){a=a|0;b=b|0;return(c[a+24>>2]|0)+(b*28&-1)|0}function gI(a,b){a=a|0;b=b|0;c[a+40>>2]=b;return}function gJ(a){a=a|0;return a+32|0}function gK(b){b=b|0;return(a[b+38|0]&1)<<24>>24!=0|0}function gL(a){a=a|0;return c[(c[a+12>>2]|0)+4>>2]|0}function gM(a){a=a|0;return+(+g[a>>2])}function gN(a){a=a|0;var b=0,d=0.0,e=0,f=0.0,h=0.0,i=0.0,j=0,k=0.0;b=c[a>>2]|0;if((b|0)==-1){d=0.0;return+d}e=c[a+4>>2]|0;f=(+g[e+(b*36&-1)+8>>2]- +g[e+(b*36&-1)>>2]+(+g[e+(b*36&-1)+12>>2]- +g[e+(b*36&-1)+4>>2]))*2.0;b=c[a+12>>2]|0;L361:do{if((b|0)>0){h=0.0;a=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<0){i=h}else{i=h+(+g[e+(a*36&-1)+8>>2]- +g[e+(a*36&-1)>>2]+(+g[e+(a*36&-1)+12>>2]- +g[e+(a*36&-1)+4>>2]))*2.0}j=a+1|0;if((j|0)==(b|0)){k=i;break L361}else{h=i;a=j}}}else{k=0.0}}while(0);d=k/f;return+d}function gO(a){a=a|0;var b=0,d=0;b=c[a>>2]|0;if((b|0)==-1){d=0;return d|0}d=c[(c[a+4>>2]|0)+(b*36&-1)+32>>2]|0;return d|0}function gP(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0;d=a+132|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];e=a+136|0;i=c[e>>2]|0;n=b+(i*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(i*12&-1)+8>>2];s=+T(+m);t=+S(+m);u=+T(+r);v=+S(+r);w=+g[a+76>>2]- +g[a+140>>2];x=+g[a+80>>2]- +g[a+144>>2];y=t*w-s*x;z=s*w+t*x;x=+g[a+84>>2]- +g[a+148>>2];w=+g[a+88>>2]- +g[a+152>>2];A=v*x-u*w;B=u*x+v*w;w=p-j+A-y;v=q-l+B-z;x=+g[a+100>>2];u=+g[a+104>>2];C=t*x-s*u;D=s*x+t*u;u=C*w+D*v;t=+g[a+156>>2];x=+g[a+160>>2];s=+g[a+164>>2];E=+g[a+196>>2];F=+g[a+168>>2];G=+g[a+200>>2];H=t+x+E*s*E+G*F*G;if(H!=0.0){I=(-0.0-u)/H}else{I=0.0}H=C*I;G=D*I;a=(g[k>>2]=j-H*t,c[k>>2]|0);i=(g[k>>2]=l-G*t,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=i;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=m-(D*(y+w)-C*(z+v))*I*s;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;i=(g[k>>2]=p+H*x,c[k>>2]|0);h=(g[k>>2]=q+G*x,c[k>>2]|0)|0;c[d>>2]=0|i;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=r+(A*D-B*C)*I*F;if(u>0.0){J=u;K=J<=.004999999888241291;return K|0}J=-0.0-u;K=J<=.004999999888241291;return K|0}function gQ(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;c7(4520,(v=i,i=i+1|0,i=i+3>>2<<2,c[v>>2]=0,v)|0);c7(9068,(v=i,i=i+4|0,c[v>>2]=e,v)|0);c7(6732,(v=i,i=i+4|0,c[v>>2]=f,v)|0);c7(4924,(v=i,i=i+4|0,c[v>>2]=a[b+61|0]&1,v)|0);j=+g[b+80>>2];c7(4240,(v=i,i=i+16|0,h[k>>3]=+g[b+76>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);j=+g[b+88>>2];c7(3816,(v=i,i=i+16|0,h[k>>3]=+g[b+84>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);j=+g[b+96>>2];c7(3336,(v=i,i=i+16|0,h[k>>3]=+g[b+92>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[v+8>>2]=c[k>>2]|0,c[v+12>>2]=c[k+4>>2]|0,v)|0);c7(3076,(v=i,i=i+4|0,c[v>>2]=a[b+128|0]&1,v)|0);c7(2828,(v=i,i=i+8|0,h[k>>3]=+g[b+124>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(2580,(v=i,i=i+8|0,h[k>>3]=+g[b+120>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(10352,(v=i,i=i+8|0,h[k>>3]=+g[b+68>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(10080,(v=i,i=i+8|0,h[k>>3]=+g[b+72>>2],c[v>>2]=c[k>>2]|0,c[v+4>>2]=c[k+4>>2]|0,v)|0);c7(9548,(v=i,i=i+4|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function gR(a){a=a|0;pT(a);return}function gS(){var a=0;a=pX(80)|0;b4(a);c[a+60>>2]=0;c[a+64>>2]=0;c[a+68>>2]=2548;c[a+72>>2]=2544;c[a+76>>2]=0;return a|0}function gT(a,b,c){a=a|0;b=b|0;c=c|0;dp(a,b,c);return}function gU(a){a=a|0;dm(a);return}function gV(a){a=a|0;dn(a|0,a);return}function gW(a){a=a|0;if((a|0)==0){return}pR(c[a+32>>2]|0);pR(c[a+44>>2]|0);pR(c[a+4>>2]|0);pT(a);return}function gX(a,b){a=a|0;b=b|0;dk(a,b);return}function gY(a,b){a=a|0;b=b|0;pY(a|0,b|0,60);return}function gZ(a,c){a=a|0;c=c|0;var d=0,e=0;d=a+32|0;e=c;b[d>>1]=b[e>>1]|0;b[d+2>>1]=b[e+2>>1]|0;b[d+4>>1]=b[e+4>>1]|0;dB(a);return}function g_(){var a=0;a=pX(44)|0;b[a+32>>1]=1;b[a+34>>1]=-1;b[a+36>>1]=0;c[a+40>>2]=0;c[a+24>>2]=0;c[a+28>>2]=0;pZ(a|0,0,16);return a|0}function g$(a,b){a=a|0;b=b|0;var d=0;d=c[a+12>>2]|0;bQ[c[(c[d>>2]|0)+28>>2]&2047](d,b,+g[a>>2]);return}function g0(a,b){a=a|0;b=b|0;var d=0;d=c[a+12>>2]|0;return by[c[(c[d>>2]|0)+16>>2]&2047](d,(c[a+8>>2]|0)+12|0,b)|0}function g1(a){a=a|0;if((a|0)==0){return}pT(a);return}function g2(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;f=c[a+12>>2]|0;return bx[c[(c[f>>2]|0)+20>>2]&2047](f,b,d,(c[a+8>>2]|0)+12|0,e)|0}function g3(a){a=a|0;dB(a);return}function g4(a,b){a=a|0;b=b|0;dC(a,b);return}function g5(a,b){a=a|0;b=b|0;var d=0;do{if((b|0)>-1){if((c[a+12>>2]|0)>(b|0)){break}else{d=340;break}}else{d=340}}while(0);if((d|0)==340){bc(8144,159,12036,7720)}return(c[a+4>>2]|0)+(b*36&-1)|0}function g6(a,b){a=a|0;b=b|0;var d=0;do{if((b|0)>-1){if((c[a+12>>2]|0)>(b|0)){break}else{d=344;break}}else{d=344}}while(0);if((d|0)==344){bc(8144,153,11988,7720)}return c[(c[a+4>>2]|0)+(b*36&-1)+16>>2]|0}function g7(a){a=a|0;if((a|0)==0){return}pR(c[a+32>>2]|0);pR(c[a+44>>2]|0);pR(c[a+4>>2]|0);pT(a);return}function g8(){var a=0;a=pX(60)|0;b4(a);return a|0}function g9(a){a=a|0;return 1}function ha(a,b){a=a|0;b=b|0;return 0}function hb(a){a=a|0;return c[a+28>>2]|0}function hc(b,c){b=b|0;c=c|0;a[b+102994|0]=c&1;return}function hd(a){a=a|0;var b=0,d=0.0,e=0,f=0.0,h=0.0,i=0.0,j=0,k=0.0;b=c[a+102872>>2]|0;if((b|0)==-1){d=0.0;return+d}e=c[a+102876>>2]|0;f=(+g[e+(b*36&-1)+8>>2]- +g[e+(b*36&-1)>>2]+(+g[e+(b*36&-1)+12>>2]- +g[e+(b*36&-1)+4>>2]))*2.0;b=c[a+102884>>2]|0;L433:do{if((b|0)>0){h=0.0;a=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<0){i=h}else{i=h+(+g[e+(a*36&-1)+8>>2]- +g[e+(a*36&-1)>>2]+(+g[e+(a*36&-1)+12>>2]- +g[e+(a*36&-1)+4>>2]))*2.0}j=a+1|0;if((j|0)==(b|0)){k=i;break L433}else{h=i;a=j}}}else{k=0.0}}while(0);d=k/f;return+d}function he(a){a=a|0;var b=0,d=0;b=c[a+102872>>2]|0;if((b|0)==-1){d=0;return d|0}d=c[(c[a+102876>>2]|0)+(b*36&-1)+32>>2]|0;return d|0}function hf(a){a=a|0;return a+102996|0}function hg(b){b=b|0;return(a[b+102994|0]&1)<<24>>24!=0|0}function hh(a){a=a|0;return a+102872|0}function hi(a,b){a=a|0;b=b|0;c[a+102944>>2]=b;return}function hj(b,c){b=b|0;c=c|0;a[b+102993|0]=c&1;return}function hk(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+102968|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function hl(a){a=a|0;return c[a+102960>>2]|0}function hm(a){a=a|0;return(c[a+102868>>2]&4|0)!=0|0}function hn(b){b=b|0;return(a[b+102993|0]&1)<<24>>24!=0|0}function ho(a){a=a|0;return c[a+102956>>2]|0}function hp(a){a=a|0;return c[a+102952>>2]|0}function hq(a,b){a=a|0;b=b|0;c[a+102980>>2]=b;return}function hr(a){a=a|0;return c[a+102964>>2]|0}function hs(a){a=a|0;var b=0,d=0;b=c[a+102952>>2]|0;if((b|0)==0){return}else{d=b}while(1){g[d+76>>2]=0.0;g[d+80>>2]=0.0;g[d+84>>2]=0.0;b=c[d+96>>2]|0;if((b|0)==0){break}else{d=b}}return}function ht(b){b=b|0;return(a[b+102992|0]&1)<<24>>24!=0|0}function hu(d,e){d=d|0;e=e|0;var f=0,h=0;f=d+102976|0;if((e&1|0)==(a[f]&1|0)){return}a[f]=e&1;if(e){return}e=c[d+102952>>2]|0;if((e|0)==0){return}else{h=e}while(1){e=h+4|0;d=b[e>>1]|0;if((d&2)<<16>>16==0){b[e>>1]=d|2;g[h+144>>2]=0.0}d=c[h+96>>2]|0;if((d|0)==0){break}else{h=d}}return}function hv(b){b=b|0;return(a[b+102976|0]&1)<<24>>24!=0|0}function hw(a){a=a|0;return c[a+102900>>2]|0}function hx(a){a=a|0;return(c[a+102868>>2]&2|0)!=0|0}function hy(a){a=a|0;return c[a+102932>>2]|0}function hz(a,b){a=a|0;b=b|0;c[a+102984>>2]=b;return}function hA(a,b){a=a|0;b=b|0;var d=0;d=a+102868|0;a=c[d>>2]|0;c[d>>2]=b?a|4:a&-5;return}function hB(a){a=a|0;return c[a+102936>>2]|0}function hC(b,c){b=b|0;c=c|0;a[b+102992|0]=c&1;return}function hD(a,b){a=a|0;b=b|0;c[a+102940>>2]=b;return}function hE(a){a=a|0;return c[a+4>>2]|0}function hF(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function hG(a){a=a|0;return+(+g[a+8>>2])}function hH(a,b){a=a|0;b=b|0;return a+12|0}function hI(a,b){a=a|0;b=b|0;return a+12|0}function hJ(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+12|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function hK(a){a=a|0;return a+12|0}function hL(a,b){a=a|0;b=b|0;var d=0;d=a+4|0;c[d>>2]=c[d>>2]|b;return}function hM(a,b){a=a|0;b=b|0;var d=0;d=a+4|0;c[d>>2]=c[d>>2]&(b^-1);return}function hN(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function hO(a){a=a|0;return c[a+4>>2]|0}function hP(a){a=a|0;return c[a+12>>2]|0}function hQ(a){a=a|0;return c[a+48>>2]|0}function hR(a){a=a|0;return c[a+52>>2]|0}function hS(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;b=a+12|0;d=c[b>>2]|0;if((d|0)<=0){e=0;return e|0}f=a+4|0;a=0;g=0;h=c[f>>2]|0;i=d;while(1){if((c[h+(a*36&-1)+32>>2]|0)<2){j=g;k=h;l=i}else{d=h+(a*36&-1)+24|0;m=c[d>>2]|0;if((m|0)==-1){bc(9120,686,11896,5412);n=c[d>>2]|0;o=c[f>>2]|0;p=c[b>>2]|0}else{n=m;o=h;p=i}m=(c[o+((c[h+(a*36&-1)+28>>2]|0)*36&-1)+32>>2]|0)-(c[o+(n*36&-1)+32>>2]|0)|0;d=(m|0)>0?m:-m|0;j=(g|0)>(d|0)?g:d;k=o;l=p}d=a+1|0;if((d|0)<(l|0)){a=d;g=j;h=k;i=l}else{e=j;break}}return e|0}function hT(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0;do{if((b|0)>-1){if((c[a+12>>2]|0)>(b|0)){break}else{e=435;break}}else{e=435}}while(0);if((e|0)==435){bc(8144,159,12036,7720)}f=a+4|0;h=c[f>>2]|0;do{if((d|0)>-1){if((c[a+12>>2]|0)>(d|0)){i=h;break}else{e=438;break}}else{e=438}}while(0);if((e|0)==438){bc(8144,159,12036,7720);i=c[f>>2]|0}return(+g[i+(d*36&-1)>>2]- +g[h+(b*36&-1)+8>>2]>0.0|+g[i+(d*36&-1)+4>>2]- +g[h+(b*36&-1)+12>>2]>0.0|+g[h+(b*36&-1)>>2]- +g[i+(d*36&-1)+8>>2]>0.0|+g[h+(b*36&-1)+4>>2]- +g[i+(d*36&-1)+12>>2]>0.0)^1|0}function hU(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=a+40|0;e=c[d>>2]|0;f=a+36|0;g=a+32|0;if((e|0)==(c[f>>2]|0)){a=c[g>>2]|0;c[f>>2]=e<<1;f=pQ(e<<3)|0;c[g>>2]=f;h=a;pY(f|0,h|0,c[d>>2]<<2);pR(h);i=c[d>>2]|0}else{i=e}c[(c[g>>2]|0)+(i<<2)>>2]=b;c[d>>2]=(c[d>>2]|0)+1|0;return}function hV(a,b,c){a=a|0;b=b|0;c=c|0;return b5(a,b,c)|0}function hW(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if(!(cn(a|0,b,d,e)|0)){return}e=a+40|0;d=c[e>>2]|0;f=a+36|0;g=a+32|0;if((d|0)==(c[f>>2]|0)){a=c[g>>2]|0;c[f>>2]=d<<1;f=pQ(d<<3)|0;c[g>>2]=f;h=a;pY(f|0,h|0,c[e>>2]<<2);pR(h);i=c[e>>2]|0}else{i=d}c[(c[g>>2]|0)+(i<<2)>>2]=b;c[e>>2]=(c[e>>2]|0)+1|0;return}function hX(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=c[a+40>>2]|0;e=a+32|0;f=0;while(1){if((f|0)>=(d|0)){break}g=(c[e>>2]|0)+(f<<2)|0;if((c[g>>2]|0)==(b|0)){h=454;break}else{f=f+1|0}}if((h|0)==454){c[g>>2]=-1}g=a+28|0;c[g>>2]=(c[g>>2]|0)-1|0;cl(a|0,b);return}function hY(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;g=a+102872|0;c[f>>2]=g;c[f+4>>2]=b;dX(g|0,f,d);i=e;return}function hZ(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;b=a+102884|0;d=c[b>>2]|0;if((d|0)<=0){e=0;return e|0}f=a+102876|0;a=0;g=0;h=c[f>>2]|0;i=d;while(1){if((c[h+(a*36&-1)+32>>2]|0)<2){j=g;k=h;l=i}else{d=h+(a*36&-1)+24|0;m=c[d>>2]|0;if((m|0)==-1){bc(9120,686,11896,5412);n=c[d>>2]|0;o=c[f>>2]|0;p=c[b>>2]|0}else{n=m;o=h;p=i}m=(c[o+((c[h+(a*36&-1)+28>>2]|0)*36&-1)+32>>2]|0)-(c[o+(n*36&-1)+32>>2]|0)|0;d=(m|0)>0?m:-m|0;j=(g|0)>(d|0)?g:d;k=o;l=p}d=a+1|0;if((d|0)<(l|0)){a=d;g=j;h=k;i=l}else{e=j;break}}return e|0}function h_(a){a=a|0;dQ(a);return}function h$(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=a+102868|0;e=c[d>>2]|0;if((e&2|0)==0){f=e}else{bc(8396,109,13208,10004);f=c[d>>2]|0}if((f&2|0)!=0){g=0;return g|0}f=c6(a|0,152)|0;if((f|0)==0){h=0}else{d=f;c9(d,b,a);h=d}c[h+92>>2]=0;d=a+102952|0;c[h+96>>2]=c[d>>2]|0;b=c[d>>2]|0;if((b|0)!=0){c[b+92>>2]=h}c[d>>2]=h;d=a+102960|0;c[d>>2]=(c[d>>2]|0)+1|0;g=h;return g|0}function h0(a,b){a=a|0;b=b|0;dJ(a,b);return}function h1(a){a=a|0;var b=0;b=pX(103028)|0;dF(b,a);return b|0}function h2(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;dN(a,b,c,d);return}function h3(a,b){a=a|0;b=b|0;dG(a,b);return}function h4(a,b){a=a|0;b=b|0;return dK(a,b)|0}function h5(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,k=0;f=i;i=i+28|0;h=f|0;j=f+8|0;k=a+102872|0;c[h>>2]=k;c[h+4>>2]=b;g[j+16>>2]=1.0;b=d;d=j;a=c[b+4>>2]|0;c[d>>2]=c[b>>2]|0;c[d+4>>2]=a;a=e;e=j+8|0;d=c[a+4>>2]|0;c[e>>2]=c[a>>2]|0;c[e+4>>2]=d;dV(k|0,h,j);i=f;return}function h6(a){a=a|0;if((a|0)==0){return}dI(a);pT(a);return}function h7(a){a=a|0;dR(a);return}function h8(b){b=b|0;var d=0,e=0;do{if((a[19432]|0)==0){if((a9(19432)|0)==0){break}}}while(0);d=b+102968|0;b=c[d+4>>2]|0;e=128;c[e>>2]=c[d>>2]|0;c[e+4>>2]=b;return 128}function h9(a){a=a|0;if((a|0)==0){return}bs[c[(c[a>>2]|0)+4>>2]&2047](a);return}function ia(a,b,d){a=a|0;b=b|0;d=+d;bQ[c[(c[a>>2]|0)+28>>2]&2047](a,b,d);return}function ib(a,b){a=a|0;b=b|0;return bI[c[(c[a>>2]|0)+8>>2]&2047](a,b)|0}function ic(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return bx[c[(c[a>>2]|0)+20>>2]&2047](a,b,d,e,f)|0}function id(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[(c[a>>2]|0)+24>>2]&2047](a,b,d,e);return}function ie(a){a=a|0;return bu[c[(c[a>>2]|0)+12>>2]&2047](a)|0}function ig(a,b,d){a=a|0;b=b|0;d=d|0;return by[c[(c[a>>2]|0)+16>>2]&2047](a,b,d)|0}function ih(){var a=0;a=pX(20)|0;c[a>>2]=17088;pZ(a+4|0,0,16);return a|0}function ii(a,b){a=a|0;b=b|0;bt[c[(c[a>>2]|0)+28>>2]&2047](a,b);return}function ij(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[(c[a>>2]|0)+8>>2]&2047](a,b,d,e);return}function ik(a,b,d,e,f){a=a|0;b=b|0;d=+d;e=e|0;f=f|0;bp[c[(c[a>>2]|0)+20>>2]&2047](a,b,d,e,f);return}function il(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[(c[a>>2]|0)+12>>2]&2047](a,b,d,e);return}function im(a,b,d,e){a=a|0;b=b|0;d=+d;e=e|0;bv[c[(c[a>>2]|0)+16>>2]&2047](a,b,d,e);return}function io(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[(c[a>>2]|0)+24>>2]&2047](a,b,d,e);return}function ip(a,b){a=a|0;b=+b;return+(+bz[c[(c[a>>2]|0)+12>>2]&2047](a,b))}function iq(a){a=a|0;return}function ir(a){a=a|0;return+0.0}function is(a){a=a|0;return c[a+64>>2]|0}function it(a){a=a|0;return c[a+4>>2]|0}function iu(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function iv(b){b=b|0;return(a[b+61|0]&1)<<24>>24!=0|0}function iw(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)<<16>>16==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)<<16>>16!=0;return d|0}function ix(a){a=a|0;var b=0,d=0;b=c[a>>2]|0;if((b|0)==-1){d=0;return d|0}d=c[(c[a+4>>2]|0)+(b*36&-1)+32>>2]|0;return d|0}function iy(a){a=a|0;var b=0,d=0.0,e=0,f=0.0,h=0.0,i=0.0,j=0,k=0.0;b=c[a>>2]|0;if((b|0)==-1){d=0.0;return+d}e=c[a+4>>2]|0;f=(+g[e+(b*36&-1)+8>>2]- +g[e+(b*36&-1)>>2]+(+g[e+(b*36&-1)+12>>2]- +g[e+(b*36&-1)+4>>2]))*2.0;b=c[a+12>>2]|0;L635:do{if((b|0)>0){h=0.0;a=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<0){i=h}else{i=h+(+g[e+(a*36&-1)+8>>2]- +g[e+(a*36&-1)>>2]+(+g[e+(a*36&-1)+12>>2]- +g[e+(a*36&-1)+4>>2]))*2.0}j=a+1|0;if((j|0)==(b|0)){k=i;break L635}else{h=i;a=j}}}else{k=0.0}}while(0);d=k/f;return+d}function iz(a){a=a|0;return c[a+4>>2]|0}function iA(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function iB(a){a=a|0;return+(+g[a+8>>2])}function iC(a){a=a|0;return c[a+12>>2]|0}function iD(a){a=a|0;return c[a+16>>2]|0}function iE(b,d){b=b|0;d=d|0;var e=0,f=0;e=d;d=b+20|0;f=c[e+4>>2]|0;c[d>>2]=c[e>>2]|0;c[d+4>>2]=f;a[b+36|0]=1;return}function iF(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function iG(b,d){b=b|0;d=d|0;var e=0,f=0;e=d;d=b+28|0;f=c[e+4>>2]|0;c[d>>2]=c[e>>2]|0;c[d+4>>2]=f;a[b+37|0]=1;return}function iH(a,b){a=a|0;b=b|0;c[a+16>>2]=b;return}function iI(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function iJ(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;do{if((a[19448]|0)==0){if((a9(19448)|0)==0){break}}}while(0);bt[c[c[b>>2]>>2]&2047](e,b);b=e;e=c[b+4>>2]|0;f=120;c[f>>2]=c[b>>2]|0;c[f+4>>2]=e;i=d;return 120}function iK(a){a=a|0;bs[c[(c[a>>2]|0)+16>>2]&2047](a);return}function iL(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;do{if((a[19440]|0)==0){if((a9(19440)|0)==0){break}}}while(0);bt[c[(c[b>>2]|0)+4>>2]&2047](e,b);b=e;e=c[b+4>>2]|0;f=60;c[f>>2]=c[b>>2]|0;c[f+4>>2]=e;i=d;return 60}function iM(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;do{if((a[19384]|0)==0){if((a9(19384)|0)==0){break}}}while(0);bQ[c[(c[b>>2]|0)+8>>2]&2047](f,b,d);b=f;f=c[b+4>>2]|0;g=52;c[g>>2]=c[b>>2]|0;c[g+4>>2]=f;i=e;return 52}function iN(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=+f;return+(+bJ[c[(c[a>>2]|0)+8>>2]&2047](a,b,d,e,f))}function iO(a){a=a|0;if((a|0)==0){return}pR(c[a+4>>2]|0);pT(a);return}function iP(){var a=0,b=0,d=0,e=0,f=0,g=0;a=pX(28)|0;b=a;c[a>>2]=-1;c[a+12>>2]=16;c[a+8>>2]=0;d=pQ(576)|0;e=d;c[a+4>>2]=e;pZ(d|0,0,576);f=0;while(1){g=f+1|0;c[e+(f*36&-1)+20>>2]=g;c[e+(f*36&-1)+32>>2]=-1;if((g|0)<15){f=g}else{break}}c[d+560>>2]=-1;c[d+572>>2]=-1;c[a+16>>2]=0;c[a+20>>2]=0;c[a+24>>2]=0;return b|0}function iQ(a,b){a=a|0;b=b|0;var d=0;do{if((b|0)>-1){if((c[a+12>>2]|0)>(b|0)){break}else{d=577;break}}else{d=577}}while(0);if((d|0)==577){bc(8144,159,12036,7720)}return(c[a+4>>2]|0)+(b*36&-1)|0}function iR(a,b){a=a|0;b=b|0;var d=0;do{if((b|0)>-1){if((c[a+12>>2]|0)>(b|0)){break}else{d=581;break}}else{d=581}}while(0);if((d|0)==581){bc(8144,153,11988,7720)}return c[(c[a+4>>2]|0)+(b*36&-1)+16>>2]|0}function iS(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;b=a+12|0;d=c[b>>2]|0;if((d|0)<=0){e=0;return e|0}f=a+4|0;a=0;g=0;h=c[f>>2]|0;i=d;while(1){if((c[h+(a*36&-1)+32>>2]|0)<2){j=g;k=h;l=i}else{d=h+(a*36&-1)+24|0;m=c[d>>2]|0;if((m|0)==-1){bc(9120,686,11896,5412);n=c[d>>2]|0;o=c[f>>2]|0;p=c[b>>2]|0}else{n=m;o=h;p=i}m=(c[o+((c[h+(a*36&-1)+28>>2]|0)*36&-1)+32>>2]|0)-(c[o+(n*36&-1)+32>>2]|0)|0;d=(m|0)>0?m:-m|0;j=(g|0)>(d|0)?g:d;k=o;l=p}d=a+1|0;if((d|0)<(l|0)){a=d;g=j;h=k;i=l}else{e=j;break}}return e|0}function iT(a){a=a|0;ct(a);return}function iU(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0.0,i=0,j=0,l=0;e=cj(a)|0;f=a+4|0;h=+g[b+4>>2]+-.10000000149011612;i=(c[f>>2]|0)+(e*36&-1)|0;j=(g[k>>2]=+g[b>>2]+-.10000000149011612,c[k>>2]|0);l=(g[k>>2]=h,c[k>>2]|0)|0;c[i>>2]=0|j;c[i+4>>2]=l;h=+g[b+12>>2]+.10000000149011612;l=(c[f>>2]|0)+(e*36&-1)+8|0;i=(g[k>>2]=+g[b+8>>2]+.10000000149011612,c[k>>2]|0);b=(g[k>>2]=h,c[k>>2]|0)|0;c[l>>2]=0|i;c[l+4>>2]=b;c[(c[f>>2]|0)+(e*36&-1)+16>>2]=d;c[(c[f>>2]|0)+(e*36&-1)+32>>2]=0;ck(a,e);return e|0}function iV(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return cn(a,b,c,d)|0}function iW(a){a=a|0;cs(a);return}function iX(a,b){a=a|0;b=b|0;cl(a,b);return}function iY(){return pX(1)|0}function iZ(a){a=a|0;if((a|0)==0){return}pT(a|0);return}function i_(a){a=a|0;if((a|0)==0){return}bs[c[(c[a>>2]|0)+4>>2]&2047](a);return}function i$(){var a=0;a=pX(4)|0;c[a>>2]=16676;return a|0}function i0(a,b){a=a|0;b=b|0;bt[c[(c[a>>2]|0)+12>>2]&2047](a,b);return}function i1(a,b){a=a|0;b=b|0;bt[c[(c[a>>2]|0)+8>>2]&2047](a,b);return}function i2(a,b,d){a=a|0;b=b|0;d=d|0;bO[c[(c[a>>2]|0)+16>>2]&2047](a,b,d);return}function i3(a,b,d){a=a|0;b=b|0;d=d|0;bO[c[(c[a>>2]|0)+20>>2]&2047](a,b,d);return}function i4(a){a=a|0;if((a|0)==0){return}bs[c[(c[a>>2]|0)+4>>2]&2047](a);return}function i5(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+12|0;do{if((c[f>>2]|0)==0){if((c[b+16>>2]|0)==0){break}else{g=621;break}}else{g=621}}while(0);if((g|0)==621){bc(4440,48,15708,8992)}if((e|0)<=1){bc(4440,49,15708,4896)}g=b+16|0;c[g>>2]=e;h=pQ(e<<3)|0;c[f>>2]=h;pY(h|0,d|0,c[g>>2]<<3);a[b+36|0]=0;a[b+37|0]=0;return}function i6(a,b,d){a=a|0;b=b|0;d=+d;bQ[c[(c[a>>2]|0)+28>>2]&2047](a,b,d);return}function i7(a,b){a=a|0;b=b|0;return bI[c[(c[a>>2]|0)+8>>2]&2047](a,b)|0}function i8(a,b,c){a=a|0;b=b|0;c=c|0;cO(a,b,c);return}function i9(){var b=0;b=pX(40)|0;c[b>>2]=17236;c[b+4>>2]=3;g[b+8>>2]=.009999999776482582;c[b+12>>2]=0;c[b+16>>2]=0;a[b+36|0]=0;a[b+37|0]=0;return b|0}function ja(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[(c[a>>2]|0)+24>>2]&2047](a,b,d,e);return}function jb(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return bx[c[(c[a>>2]|0)+20>>2]&2047](a,b,d,e,f)|0}function jc(a){a=a|0;return bu[c[(c[a>>2]|0)+12>>2]&2047](a)|0}function jd(a,b,d){a=a|0;b=b|0;d=d|0;return by[c[(c[a>>2]|0)+16>>2]&2047](a,b,d)|0}function je(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+12|0;do{if((c[f>>2]|0)==0){if((c[b+16>>2]|0)==0){break}else{g=635;break}}else{g=635}}while(0);if((g|0)==635){bc(4440,34,15764,8992)}if((e|0)<=2){bc(4440,35,15764,3324)}g=e+1|0;h=b+16|0;c[h>>2]=g;i=pQ(g<<3)|0;c[f>>2]=i;pY(i|0,d|0,e<<3);d=c[f>>2]|0;i=d;g=d+(e<<3)|0;e=c[i+4>>2]|0;c[g>>2]=c[i>>2]|0;c[g+4>>2]=e;e=c[f>>2]|0;f=e+((c[h>>2]|0)-2<<3)|0;h=b+20|0;g=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=g;g=e+8|0;e=b+28|0;h=c[g+4>>2]|0;c[e>>2]=c[g>>2]|0;c[e+4>>2]=h;a[b+36|0]=1;a[b+37|0]=1;return}function jf(a,b){a=a|0;b=b|0;return bI[c[(c[a>>2]|0)+8>>2]&2047](a,b)|0}function jg(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;if((a|0)==0){return}b=a+4|0;d=a|0;e=c[d>>2]|0;L761:do{if((c[b>>2]|0)>0){f=0;g=e;while(1){pR(c[g+(f<<3)+4>>2]|0);h=f+1|0;i=c[d>>2]|0;if((h|0)<(c[b>>2]|0)){f=h;g=i}else{j=i;break L761}}}else{j=e}}while(0);pR(j);pT(a);return}function jh(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+4|0;d=a|0;L767:do{if((c[b>>2]|0)>0){e=0;while(1){pR(c[(c[d>>2]|0)+(e<<3)+4>>2]|0);f=e+1|0;if((f|0)<(c[b>>2]|0)){e=f}else{break L767}}}}while(0);c[b>>2]=0;pZ(c[d>>2]|0,0,c[a+8>>2]<<3|0);pZ(a+12|0,0,56);return}function ji(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)==0){return}do{if((e|0)>0){if((e|0)<=640){break}pR(d);return}else{bc(3640,164,14896,6328)}}while(0);f=a[e+18664|0]|0;if((f&255)>=14){bc(3640,173,14896,4712)}e=b+12+((f&255)<<2)|0;c[d>>2]=c[e>>2]|0;c[e>>2]=d;return}function jj(a,b){a=a|0;b=b|0;return c6(a,b)|0}function jk(){var b=0,d=0,e=0,f=0,g=0,h=0;b=pX(68)|0;d=b;c[b+8>>2]=128;c[b+4>>2]=0;e=pQ(1024)|0;c[b>>2]=e;pZ(e|0,0,1024);pZ(b+12|0,0,56);if((a[18660]&1)<<24>>24==0){f=0;g=1}else{return d|0}while(1){if((f|0)>=14){bc(3640,73,14816,8732)}if((g|0)>(c[19308+(f<<2)>>2]|0)){b=f+1|0;a[g+18664|0]=b&255;h=b}else{a[g+18664|0]=f&255;h=f}b=g+1|0;if((b|0)==641){break}else{f=h;g=b}}a[18660]=1;return d|0}function jl(a){a=a|0;if((a|0)==0){return}bs[c[(c[a>>2]|0)+4>>2]&2047](a);return}function jm(a,b,c){a=a|0;b=b|0;c=c|0;c2(a,b,c);return}function jn(a,b,d){a=a|0;b=b|0;d=+d;bQ[c[(c[a>>2]|0)+28>>2]&2047](a,b,d);return}function jo(a){a=a|0;return+(+g[a+8>>2])}function jp(a,b){a=a|0;b=b|0;return a+20+(b<<3)|0}function jq(a,b,d){a=a|0;b=+b;d=+d;var e=0.0,f=0.0;c[a+148>>2]=4;e=-0.0-b;f=-0.0-d;g[a+20>>2]=e;g[a+24>>2]=f;g[a+28>>2]=b;g[a+32>>2]=f;g[a+36>>2]=b;g[a+40>>2]=d;g[a+44>>2]=e;g[a+48>>2]=d;g[a+84>>2]=0.0;g[a+88>>2]=-1.0;g[a+92>>2]=1.0;g[a+96>>2]=0.0;g[a+100>>2]=0.0;g[a+104>>2]=1.0;g[a+108>>2]=-1.0;g[a+112>>2]=0.0;g[a+12>>2]=0.0;g[a+16>>2]=0.0;return}function jr(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+12|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function js(a,b){a=a|0;b=b|0;c[a+148>>2]=b;return}function jt(a){a=a|0;return c[a+148>>2]|0}function ju(a){a=a|0;return c[a+4>>2]|0}function jv(a){a=a|0;return c[a+148>>2]|0}function jw(a){a=a|0;return a+12|0}function jx(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;f=d;d=b+12|0;g=c[f+4>>2]|0;c[d>>2]=c[f>>2]|0;c[d+4>>2]=g;g=e;e=b+20|0;d=c[g+4>>2]|0;c[e>>2]=c[g>>2]|0;c[e+4>>2]=d;a[b+44|0]=0;a[b+45|0]=0;return}function jy(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function jz(a){a=a|0;return+(+g[a+8>>2])}function jA(a){a=a|0;return c[a+4>>2]|0}function jB(a){a=a|0;return c[a+12>>2]|0}function jC(a,b){a=a|0;b=b|0;var d=0;d=a+4|0;a=c[d>>2]|0;c[d>>2]=b?a|4:a&-5;return}function jD(a){a=a|0;return+(+g[a+140>>2])}function jE(a){a=a|0;return+(+g[a+136>>2])}function jF(a){a=a|0;return(c[a+4>>2]&2|0)!=0|0}function jG(a){a=a|0;return(c[a+4>>2]&4|0)!=0|0}function jH(a){a=a|0;return c[a+52>>2]|0}function jI(a,b){a=a|0;b=+b;g[a+136>>2]=b;return}function jJ(a){a=a|0;return c[a+48>>2]|0}function jK(a){a=a|0;return c[a+56>>2]|0}function jL(a){a=a|0;return c[a+60>>2]|0}function jM(a,b){a=a|0;b=+b;g[a+140>>2]=b;return}function jN(a){a=a|0;return a+64|0}function jO(a){a=a|0;var b=0.0,d=0.0;b=+g[(c[a+48>>2]|0)+20>>2];d=+g[(c[a+52>>2]|0)+20>>2];g[a+140>>2]=b>d?b:d;return}function jP(a){a=a|0;return+(+g[a+8>>2])}function jQ(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function jR(a){a=a|0;return c[a+4>>2]|0}function jS(a){a=a|0;return+(+g[a+56>>2])}function jT(a){a=a|0;return c[a+148>>2]|0}function jU(a){a=a|0;return(b[a+4>>1]&4)<<16>>16!=0|0}function jV(a,b){a=a|0;b=+b;g[a+136>>2]=b;return}function jW(a,b){a=a|0;b=+b;g[a+140>>2]=b;return}function jX(a,b){a=a|0;b=b|0;c[a+148>>2]=b;return}function jY(a){a=a|0;return+(+g[a+72>>2])}function jZ(a){a=a|0;return c[a+100>>2]|0}function j_(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,h=0;if((c[a>>2]|0)!=2){return}f=a+4|0;h=b[f>>1]|0;if((h&2)<<16>>16==0){b[f>>1]=h|2;g[a+144>>2]=0.0}h=d|0;f=a+76|0;g[f>>2]=+g[h>>2]+ +g[f>>2];f=d+4|0;d=a+80|0;g[d>>2]=+g[f>>2]+ +g[d>>2];d=a+84|0;g[d>>2]=+g[d>>2]+((+g[e>>2]- +g[a+44>>2])*+g[f>>2]-(+g[e+4>>2]- +g[a+48>>2])*+g[h>>2]);return}function j$(a,d){a=a|0;d=d|0;var e=0.0,f=0.0,h=0,i=0;if((c[a>>2]|0)==0){return}e=+g[d>>2];f=+g[d+4>>2];do{if(e*e+f*f>0.0){h=a+4|0;i=b[h>>1]|0;if((i&2)<<16>>16!=0){break}b[h>>1]=i|2;g[a+144>>2]=0.0}}while(0);i=d;d=a+64|0;a=c[i+4>>2]|0;c[d>>2]=c[i>>2]|0;c[d+4>>2]=a;return}function j0(a){a=a|0;return c[a+108>>2]|0}function j1(a){a=a|0;return c[a+96>>2]|0}function j2(a,c){a=a|0;c=c|0;var d=0,e=0;d=a+4|0;e=b[d>>1]|0;if(c){b[d>>1]=e|4;return}c=e&-5;b[d>>1]=c;if((e&2)<<16>>16!=0){return}b[d>>1]=c|2;g[a+144>>2]=0.0;return}function j3(a){a=a|0;return+(+g[a+116>>2])}function j4(a,d){a=a|0;d=+d;var e=0,f=0;if((c[a>>2]|0)==0){return}do{if(d*d>0.0){e=a+4|0;f=b[e>>1]|0;if((f&2)<<16>>16!=0){break}b[e>>1]=f|2;g[a+144>>2]=0.0}}while(0);g[a+72>>2]=d;return}function j5(a,b){a=a|0;b=b|0;var d=0,e=0,f=0.0,h=0.0;d=a+116|0;g[b>>2]=+g[d>>2];e=a+28|0;f=+g[e>>2];h=+g[a+32>>2];g[b+12>>2]=+g[a+124>>2]+ +g[d>>2]*(f*f+h*h);d=e;e=b+4|0;b=c[d+4>>2]|0;c[e>>2]=c[d>>2]|0;c[e+4>>2]=b;return}function j6(a,d){a=a|0;d=d|0;var e=0,f=0;if((c[a>>2]|0)!=2){return}e=a+4|0;f=b[e>>1]|0;if((f&2)<<16>>16==0){b[e>>1]=f|2;g[a+144>>2]=0.0}f=a+76|0;g[f>>2]=+g[d>>2]+ +g[f>>2];f=a+80|0;g[f>>2]=+g[d+4>>2]+ +g[f>>2];return}function j7(a,d){a=a|0;d=+d;var e=0,f=0;if((c[a>>2]|0)!=2){return}e=a+4|0;f=b[e>>1]|0;if((f&2)<<16>>16==0){b[e>>1]=f|2;g[a+144>>2]=0.0}f=a+84|0;g[f>>2]=+g[f>>2]+d;return}function j8(a){a=a|0;return(b[a+4>>1]&2)<<16>>16!=0|0}function j9(a){a=a|0;return a+12|0}function ka(a){a=a|0;return a+44|0}function kb(a){a=a|0;return+(+g[a+136>>2])}function kc(a,b){a=a|0;b=b|0;return bI[c[(c[a>>2]|0)+8>>2]&2047](a,b)|0}function kd(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return bx[c[(c[a>>2]|0)+20>>2]&2047](a,b,d,e,f)|0}function ke(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;cZ(a,b,c,d,e);return}function kf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[(c[a>>2]|0)+24>>2]&2047](a,b,d,e);return}function kg(a){a=a|0;return bu[c[(c[a>>2]|0)+12>>2]&2047](a)|0}function kh(a,b,d){a=a|0;b=b|0;d=d|0;return by[c[(c[a>>2]|0)+16>>2]&2047](a,b,d)|0}function ki(){var a=0;a=pX(152)|0;c[a>>2]=16992;c[a+4>>2]=2;g[a+8>>2]=.009999999776482582;c[a+148>>2]=0;g[a+12>>2]=0.0;g[a+16>>2]=0.0;return a|0}function kj(a){a=a|0;if((a|0)==0){return}bs[c[(c[a>>2]|0)+4>>2]&2047](a);return}function kk(a,b,d){a=a|0;b=b|0;d=+d;bQ[c[(c[a>>2]|0)+28>>2]&2047](a,b,d);return}function kl(a,b){a=a|0;b=b|0;return bI[c[(c[a>>2]|0)+8>>2]&2047](a,b)|0}function km(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return bx[c[(c[a>>2]|0)+20>>2]&2047](a,b,d,e,f)|0}function kn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[(c[a>>2]|0)+24>>2]&2047](a,b,d,e);return}function ko(a){a=a|0;return bu[c[(c[a>>2]|0)+12>>2]&2047](a)|0}function kp(a,b,d){a=a|0;b=b|0;d=d|0;return by[c[(c[a>>2]|0)+16>>2]&2047](a,b,d)|0}function kq(){var a=0;a=pX(48)|0;c[a>>2]=17436;c[a+4>>2]=1;g[a+8>>2]=.009999999776482582;pZ(a+28|0,0,18);return a|0}function kr(a,b){a=a|0;b=b|0;var d=0,e=0;d=c[a+48>>2]|0;e=c[a+52>>2]|0;cd(b,a+64|0,(c[d+8>>2]|0)+12|0,+g[(c[d+12>>2]|0)+8>>2],(c[e+8>>2]|0)+12|0,+g[(c[e+12>>2]|0)+8>>2]);return}function ks(a){a=a|0;g[a+136>>2]=+Q(+(+g[(c[a+48>>2]|0)+16>>2]*+g[(c[a+52>>2]|0)+16>>2]));return}function kt(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[c[a>>2]>>2]&2047](a,b,d,e);return}function ku(a,b,d){a=a|0;b=b|0;d=+d;bQ[c[(c[a>>2]|0)+28>>2]&2047](a,b,d);return}function kv(a,b){a=a|0;b=b|0;return bI[c[(c[a>>2]|0)+8>>2]&2047](a,b)|0}function kw(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return bx[c[(c[a>>2]|0)+20>>2]&2047](a,b,d,e,f)|0}function kx(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[(c[a>>2]|0)+24>>2]&2047](a,b,d,e);return}function ky(a){a=a|0;return bu[c[(c[a>>2]|0)+12>>2]&2047](a)|0}function kz(a,b,d){a=a|0;b=b|0;d=d|0;return by[c[(c[a>>2]|0)+16>>2]&2047](a,b,d)|0}function kA(a,b){a=a|0;b=b|0;di(a,b);return}function kB(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0;do{if((a[19424]|0)==0){if((a9(19424)|0)==0){break}}}while(0);e=+g[d>>2]- +g[b+12>>2];f=+g[d+4>>2]- +g[b+16>>2];h=+g[b+24>>2];i=+g[b+20>>2];b=(g[k>>2]=e*h+f*i,c[k>>2]|0);d=(g[k>>2]=h*f+e*(-0.0-i),c[k>>2]|0)|0;j=44;c[j>>2]=0|b;c[j+4>>2]=d;return 44}function kC(b){b=b|0;var d=0,e=0;do{if((a[19392]|0)==0){if((a9(19392)|0)==0){break}}}while(0);d=b+64|0;b=c[d+4>>2]|0;e=36;c[e>>2]=c[d>>2]|0;c[e+4>>2]=b;return 36}function kD(a,b,c){a=a|0;b=b|0;c=+c;dh(a,b,c);return}function kE(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0;do{if((a[19368]|0)==0){if((a9(19368)|0)==0){break}}}while(0);e=+g[b+72>>2];f=e*(+g[d>>2]- +g[b+44>>2])+ +g[b+68>>2];h=(g[k>>2]=+g[b+64>>2]+(+g[d+4>>2]- +g[b+48>>2])*(-0.0-e),c[k>>2]|0);b=(g[k>>2]=f,c[k>>2]|0)|0;d=28;c[d>>2]=0|h;c[d+4>>2]=b;return 28}function kF(a){a=a|0;db(a);return}function kG(a,b){a=a|0;b=b|0;da(a,b);return}function kH(a,b){a=a|0;b=b|0;return dc(a,b)|0}function kI(d,e,f){d=d|0;e=e|0;f=+f;var h=0,j=0;h=i;i=i+28|0;j=h|0;b[j+22>>1]=1;b[j+24>>1]=-1;b[j+26>>1]=0;c[j+4>>2]=0;g[j+8>>2]=.20000000298023224;g[j+12>>2]=0.0;a[j+20|0]=0;c[j>>2]=e;g[j+16>>2]=f;e=dc(d,j)|0;i=h;return e|0}function kJ(a,b){a=a|0;b=b|0;dg(a,b);return}function kK(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,h=0,i=0.0,j=0.0;if((c[a>>2]|0)!=2){return}f=a+4|0;h=b[f>>1]|0;if((h&2)<<16>>16==0){b[f>>1]=h|2;g[a+144>>2]=0.0}i=+g[a+120>>2];h=d|0;f=d+4|0;j=i*+g[f>>2];d=a+64|0;g[d>>2]=i*+g[h>>2]+ +g[d>>2];d=a+68|0;g[d>>2]=j+ +g[d>>2];d=a+72|0;g[d>>2]=+g[d>>2]+ +g[a+128>>2]*((+g[e>>2]- +g[a+44>>2])*+g[f>>2]-(+g[e+4>>2]- +g[a+48>>2])*+g[h>>2]);return}function kL(a){a=a|0;return(b[a+4>>1]&16)<<16>>16!=0|0}function kM(a){a=a|0;return a+28|0}function kN(a){a=a|0;return c[a+112>>2]|0}function kO(a){a=a|0;return+(+g[a+132>>2])}function kP(a){a=a|0;return(b[a+4>>1]&8)<<16>>16!=0|0}function kQ(a){a=a|0;return c[a+88>>2]|0}function kR(a,b){a=a|0;b=+b;g[a+132>>2]=b;return}function kS(a,c){a=a|0;c=c|0;var d=0;d=a+4|0;a=b[d>>1]|0;b[d>>1]=c?a|8:a&-9;return}function kT(a){a=a|0;return c[a>>2]|0}function kU(a){a=a|0;return+(+g[a+140>>2])}function kV(a){a=a|0;var b=0.0,c=0.0;b=+g[a+28>>2];c=+g[a+32>>2];return+(+g[a+124>>2]+ +g[a+116>>2]*(b*b+c*c))}function kW(a){a=a|0;return(b[a+4>>1]&32)<<16>>16!=0|0}function kX(a,d){a=a|0;d=+d;var e=0,f=0;if((c[a>>2]|0)!=2){return}e=a+4|0;f=b[e>>1]|0;if((f&2)<<16>>16==0){b[e>>1]=f|2;g[a+144>>2]=0.0}f=a+72|0;g[f>>2]=+g[f>>2]+ +g[a+128>>2]*d;return}function kY(a){a=a|0;return a+12|0}function kZ(a){a=a|0;return c[a+102408>>2]|0}function k_(a,c){a=a|0;c=c|0;b[a+2>>1]=c;return}function k$(a,c){a=a|0;c=c|0;b[a>>1]=c;return}function k0(a){a=a|0;return b[a+4>>1]|0}function k1(a,c){a=a|0;c=c|0;b[a+4>>1]=c;return}function k2(a){a=a|0;return b[a+2>>1]|0}function k3(a){a=a|0;return b[a>>1]|0}function k4(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function k5(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function k6(a){a=a|0;return+(+g[a+36>>2])}function k7(a){a=a|0;return a+20|0}function k8(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function k9(a){a=a|0;return a+28|0}function la(a,b){a=a|0;b=+b;g[a+40>>2]=b;return}function lb(a){a=a|0;return+(+g[a+40>>2])}function lc(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0.0,i=0,j=0.0,l=0.0,m=0.0,n=0;c[a+8>>2]=b;c[a+12>>2]=d;f=e|0;h=+g[f>>2]- +g[b+12>>2];i=e+4|0;j=+g[i>>2]- +g[b+16>>2];l=+g[b+24>>2];m=+g[b+20>>2];b=a+20|0;e=(g[k>>2]=h*l+j*m,c[k>>2]|0);n=(g[k>>2]=l*j+h*(-0.0-m),c[k>>2]|0)|0;c[b>>2]=0|e;c[b+4>>2]=n;m=+g[f>>2]- +g[d+12>>2];h=+g[i>>2]- +g[d+16>>2];j=+g[d+24>>2];l=+g[d+20>>2];d=a+28|0;a=(g[k>>2]=m*j+h*l,c[k>>2]|0);i=(g[k>>2]=j*h+m*(-0.0-l),c[k>>2]|0)|0;c[d>>2]=0|a;c[d+4>>2]=i;return}function ld(a){a=a|0;return+(+g[a+28>>2])}function le(b){b=b|0;return(a[b+37|0]&1)<<24>>24!=0|0}function lf(a){a=a|0;return c[a>>2]|0}function lg(b){b=b|0;return(a[b+36|0]&1)<<24>>24!=0|0}function lh(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+4|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function li(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+16|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function lj(b){b=b|0;return(a[b+39|0]&1)<<24>>24!=0|0}function lk(a){a=a|0;return c[a+44>>2]|0}function ll(a,b){a=a|0;b=+b;g[a+32>>2]=b;return}function lm(b,c){b=b|0;c=c|0;a[b+38|0]=c&1;return}function ln(b,c){b=b|0;c=c|0;a[b+36|0]=c&1;return}function lo(a){a=a|0;return+(+g[a+48>>2])}function lp(a,b){a=a|0;b=+b;g[a+24>>2]=b;return}function lq(a,b){a=a|0;b=b|0;c[a+44>>2]=b;return}function lr(a){a=a|0;return a+4|0}function ls(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function lt(a,b){a=a|0;b=+b;g[a+48>>2]=b;return}function lu(a){a=a|0;return+(+g[a+32>>2])}function lv(b,c){b=b|0;c=c|0;a[b+39|0]=c&1;return}function lw(b,c){b=b|0;c=c|0;a[b+40|0]=c&1;return}function lx(a,b){a=a|0;b=+b;g[a+12>>2]=b;return}function ly(a){a=a|0;return+(+g[a+12>>2])}function lz(a){a=a|0;return+(+g[a+24>>2])}function lA(a){a=a|0;return a+16|0}function lB(b){b=b|0;return(a[b+40|0]&1)<<24>>24!=0|0}function lC(a,b){a=a|0;b=+b;g[a+28>>2]=b;return}function lD(b){b=b|0;return(a[b+38|0]&1)<<24>>24!=0|0}function lE(b,c){b=b|0;c=c|0;a[b+37|0]=c&1;return}function lF(a,b){a=a|0;b=+b;g[a>>2]=b;return}function lG(a,b,c){a=a|0;b=+b;c=+c;g[a>>2]=b;g[a+4>>2]=c;return}function lH(a){a=a|0;return+(+g[a>>2])}function lI(a){a=a|0;return+(+g[a+4>>2])}function lJ(a,b){a=a|0;b=+b;g[a+4>>2]=b;return}function lK(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0;do{if((a[19400]|0)==0){if((a9(19400)|0)==0){break}}}while(0);e=+g[b+24>>2];f=+g[d>>2];h=+g[b+20>>2];i=+g[d+4>>2];d=(g[k>>2]=e*f-h*i,c[k>>2]|0);b=(g[k>>2]=f*h+e*i,c[k>>2]|0)|0;j=20;c[j>>2]=0|d;c[j+4>>2]=b;return 20}function lL(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0;do{if((a[19376]|0)==0){if((a9(19376)|0)==0){break}}}while(0);e=+g[b+24>>2];f=+g[d>>2];h=+g[b+20>>2];i=+g[d+4>>2];j=+g[b+72>>2];l=j*(+g[b+12>>2]+(e*f-h*i)- +g[b+44>>2])+ +g[b+68>>2];d=(g[k>>2]=+g[b+64>>2]+(f*h+e*i+ +g[b+16>>2]- +g[b+48>>2])*(-0.0-j),c[k>>2]|0);b=(g[k>>2]=l,c[k>>2]|0)|0;m=12;c[m>>2]=0|d;c[m+4>>2]=b;return 12}function lM(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,l=0;do{if((a[19416]|0)==0){if((a9(19416)|0)==0){break}}}while(0);e=+g[b+24>>2];f=+g[d>>2];h=+g[b+20>>2];i=+g[d+4>>2];j=f*h+e*i+ +g[b+16>>2];d=(g[k>>2]=+g[b+12>>2]+(e*f-h*i),c[k>>2]|0);b=(g[k>>2]=j,c[k>>2]|0)|0;l=4;c[l>>2]=0|d;c[l+4>>2]=b;return 4}function lN(a,c){a=a|0;c=c|0;var d=0,e=0;d=a+4|0;e=b[d>>1]|0;if(!c){b[d>>1]=e&-3;g[a+144>>2]=0.0;pZ(a+64|0,0,24);return}if((e&2)<<16>>16!=0){return}b[d>>1]=e|2;g[a+144>>2]=0.0;return}function lO(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0;do{if((a[19408]|0)==0){if((a9(19408)|0)==0){break}}}while(0);e=+g[b+24>>2];f=+g[d>>2];h=+g[b+20>>2];i=+g[d+4>>2];d=(g[k>>2]=e*f+h*i,c[k>>2]|0);b=(g[k>>2]=f*(-0.0-h)+e*i,c[k>>2]|0)|0;j=112;c[j>>2]=0|d;c[j+4>>2]=b;return 112}function lP(a){a=a|0;dj(a);return}function lQ(a,b){a=a|0;b=b|0;df(a,b);return}function lR(a,c){a=a|0;c=c|0;var d=0,e=0;d=a+4|0;e=b[d>>1]|0;b[d>>1]=c?e|16:e&-17;db(a);return}function lS(a){a=a|0;if((a|0)==0){return}if((c[a+102400>>2]|0)!=0){bc(3152,32,14508,8436)}if((c[a+102796>>2]|0)!=0){bc(3152,33,14508,5928)}pT(a|0);return}function lT(){var a=0;a=pX(102800)|0;c[a+102400>>2]=0;c[a+102404>>2]=0;c[a+102408>>2]=0;c[a+102796>>2]=0;return a|0}function lU(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b+102796|0;f=c[e>>2]|0;if((f|0)<32){g=f}else{bc(3152,38,14548,4676);g=c[e>>2]|0}f=b+102412+(g*12&-1)|0;c[b+102412+(g*12&-1)+4>>2]=d;h=b+102400|0;i=c[h>>2]|0;if((i+d|0)>102400){c[f>>2]=pQ(d)|0;a[b+102412+(g*12&-1)+8|0]=1}else{c[f>>2]=b+i|0;a[b+102412+(g*12&-1)+8|0]=0;c[h>>2]=(c[h>>2]|0)+d|0}h=b+102404|0;g=(c[h>>2]|0)+d|0;c[h>>2]=g;h=b+102408|0;b=c[h>>2]|0;c[h>>2]=(b|0)>(g|0)?b:g;c[e>>2]=(c[e>>2]|0)+1|0;return c[f>>2]|0}function lV(a,b){a=a|0;b=b|0;c8(a,b);return}function lW(a,b){a=a|0;b=b|0;bt[c[(c[a>>2]|0)+8>>2]&2047](a,b);return}function lX(a){a=a|0;if((a|0)==0){return}pT(a);return}function lY(){var a=0;a=pX(6)|0;b[a>>1]=1;b[a+2>>1]=-1;b[a+4>>1]=0;return a|0}function lZ(a){a=a|0;if((a|0)==0){return}pT(a);return}function l_(){var a=0;a=pX(44)|0;pZ(a|0,0,17);c[a>>2]=9;pZ(a+20|0,0,24);return a|0}function l$(){var b=0;b=pX(52)|0;c[b+44>>2]=0;pZ(b+4|0,0,32);a[b+36|0]=1;a[b+37|0]=1;a[b+38|0]=0;a[b+39|0]=0;c[b>>2]=0;a[b+40|0]=1;g[b+48>>2]=1.0;return b|0}function l0(a){a=a|0;if((a|0)==0){return}pT(a);return}function l1(a){a=a|0;var b=0,c=0.0,d=0,e=0.0,f=0.0,h=0.0,i=0.0;b=a|0;c=+g[b>>2];d=a+4|0;e=+g[d>>2];f=+Q(+(c*c+e*e));if(f<1.1920928955078125e-7){h=0.0;return+h}i=1.0/f;g[b>>2]=c*i;g[d>>2]=e*i;h=f;return+h}function l2(){return pX(8)|0}function l3(a,b){a=+a;b=+b;var c=0;c=pX(8)|0;g[c>>2]=a;g[c+4>>2]=b;return c|0}function l4(a){a=a|0;var b=0.0,c=0;b=+g[a>>2];if(!(b==b&!(D=0.0,D!=D)&b>+-q&b<+q)){c=0;return c|0}b=+g[a+4>>2];if(!(b==b&!(D=0.0,D!=D)&b>+-q)){c=0;return c|0}c=b<+q;return c|0}function l5(a){a=a|0;var b=0.0,c=0.0;b=+g[a>>2];c=+g[a+4>>2];return+(b*b+c*c)}function l6(a,b){a=a|0;b=b|0;var c=0;c=a|0;g[c>>2]=+g[b>>2]+ +g[c>>2];c=a+4|0;g[c>>2]=+g[b+4>>2]+ +g[c>>2];return}function l7(a){a=a|0;g[a>>2]=0.0;g[a+4>>2]=0.0;return}function l8(a,b){a=a|0;b=+b;var c=0;c=a|0;g[c>>2]=+g[c>>2]*b;c=a+4|0;g[c>>2]=+g[c>>2]*b;return}function l9(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function ma(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;g[a>>2]=b;g[a+4>>2]=c;g[a+8>>2]=d;return}function mb(a){a=a|0;return+(+g[a+8>>2])}function mc(a,b){a=a|0;b=b|0;var c=0;c=a|0;g[c>>2]=+g[b>>2]+ +g[c>>2];c=a+4|0;g[c>>2]=+g[b+4>>2]+ +g[c>>2];c=a+8|0;g[c>>2]=+g[b+8>>2]+ +g[c>>2];return}function md(a){a=a|0;g[a>>2]=0.0;g[a+4>>2]=0.0;g[a+8>>2]=0.0;return}function me(a,b){a=a|0;b=+b;var c=0;c=a|0;g[c>>2]=+g[c>>2]*b;c=a+4|0;g[c>>2]=+g[c>>2]*b;c=a+8|0;g[c>>2]=+g[c>>2]*b;return}function mf(a){a=a|0;return+(+g[a+24>>2])}function mg(a,b){a=a|0;b=+b;g[a+24>>2]=b;return}function mh(a){a=a|0;return c[a+16>>2]|0}function mi(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0;d=c[a+16>>2]|0;e=c[a+20>>2]|0;if((e|0)<=1){f=0;h=d+(f<<3)|0;return h|0}i=+g[b+4>>2];j=+g[b>>2];k=i*+g[d+4>>2]+j*+g[d>>2];b=1;a=0;while(1){l=j*+g[d+(b<<3)>>2]+i*+g[d+(b<<3)+4>>2];m=l>k;n=m?b:a;o=b+1|0;if((o|0)==(e|0)){f=n;break}else{k=m?l:k;b=o;a=n}}h=d+(f<<3)|0;return h|0}function mj(a){a=a|0;return c[a+20>>2]|0}function mk(a){a=a|0;return c[a+20>>2]|0}function ml(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0.0,i=0.0,j=0.0,k=0.0,l=0,m=0,n=0;d=c[a+16>>2]|0;e=c[a+20>>2]|0;if((e|0)<=1){f=0;return f|0}h=+g[b+4>>2];i=+g[b>>2];j=h*+g[d+4>>2]+i*+g[d>>2];b=1;a=0;while(1){k=i*+g[d+(b<<3)>>2]+h*+g[d+(b<<3)+4>>2];l=k>j;m=l?b:a;n=b+1|0;if((n|0)==(e|0)){f=m;break}else{j=l?k:j;b=n;a=m}}return f|0}function mm(a,b){a=a|0;b=b|0;c[a+16>>2]=b;return}function mn(a,b){a=a|0;b=b|0;c[a+20>>2]=b;return}function mo(b){b=b|0;return(a[b+20|0]&1)<<24>>24!=0|0}function mp(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function mq(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function mr(a){a=a|0;return+(+g[a+16>>2])}function ms(a){a=a|0;return c[a>>2]|0}function mt(a,b){a=a|0;b=+b;g[a+16>>2]=b;return}function mu(a,b){a=a|0;b=+b;g[a+12>>2]=b;return}function mv(a){a=a|0;return+(+g[a+12>>2])}function mw(b,c){b=b|0;c=c|0;a[b+20|0]=c&1;return}function mx(a){a=a|0;return a+22|0}function my(a){a=a|0;return+(+g[a+8>>2])}function mz(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function mA(a){a=a|0;return c[a+4>>2]|0}function mB(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function mC(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function mD(a){a=a|0;return+(+g[a+68>>2])}function mE(b){b=b|0;return(a[b+60|0]&1)<<24>>24!=0|0}function mF(a){a=a|0;return+(+g[a+44>>2])}function mG(b,c){b=b|0;c=c|0;a[b+48|0]=c&1;return}function mH(a,b){a=a|0;b=+b;g[a+68>>2]=b;return}function mI(a){a=a|0;return a+36|0}function mJ(a,b){a=a|0;b=+b;g[a+56>>2]=b;return}function mK(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0,l=0.0,m=0.0,n=0,o=0.0,p=0,q=0,r=0;c[a+8>>2]=b;c[a+12>>2]=d;h=e|0;i=+g[h>>2]- +g[b+12>>2];j=e+4|0;l=+g[j>>2]- +g[b+16>>2];e=b+24|0;m=+g[e>>2];n=b+20|0;o=+g[n>>2];p=a+20|0;q=(g[k>>2]=i*m+l*o,c[k>>2]|0);r=(g[k>>2]=m*l+i*(-0.0-o),c[k>>2]|0)|0;c[p>>2]=0|q;c[p+4>>2]=r;o=+g[h>>2]- +g[d+12>>2];i=+g[j>>2]- +g[d+16>>2];l=+g[d+24>>2];m=+g[d+20>>2];j=a+28|0;h=(g[k>>2]=o*l+i*m,c[k>>2]|0);r=(g[k>>2]=l*i+o*(-0.0-m),c[k>>2]|0)|0;c[j>>2]=0|h;c[j+4>>2]=r;m=+g[e>>2];o=+g[f>>2];i=+g[n>>2];l=+g[f+4>>2];f=a+36|0;n=(g[k>>2]=m*o+i*l,c[k>>2]|0);e=(g[k>>2]=o*(-0.0-i)+m*l,c[k>>2]|0)|0;c[f>>2]=0|n;c[f+4>>2]=e;g[a+44>>2]=+g[d+56>>2]- +g[b+56>>2];return}function mL(a,b){a=a|0;b=+b;g[a+52>>2]=b;return}function mM(a){a=a|0;return+(+g[a+56>>2])}function mN(b){b=b|0;return(a[b+48|0]&1)<<24>>24!=0|0}function mO(a,b){a=a|0;b=+b;g[a+44>>2]=b;return}function mP(a){a=a|0;return a+20|0}function mQ(a){a=a|0;return a+28|0}function mR(a){a=a|0;return+(+g[a+64>>2])}function mS(a,b){a=a|0;b=+b;g[a+64>>2]=b;return}function mT(b,c){b=b|0;c=c|0;a[b+60|0]=c&1;return}function mU(a){a=a|0;return+(+g[a+52>>2])}function mV(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+36|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function mW(a,b){a=a|0;b=+b;g[a+4>>2]=b;return}function mX(a){a=a|0;g[a>>2]=0.0;g[a+4>>2]=1.0;return}function mY(a){a=a|0;return+(+g[a+4>>2])}function mZ(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function m_(a,b){a=a|0;b=+b;g[a+52>>2]=b;return}function m$(a){a=a|0;return a+36|0}function m0(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function m1(a){a=a|0;return+(+g[a+56>>2])}function m2(a,b){a=a|0;b=+b;g[a+48>>2]=b;return}function m3(b){b=b|0;return(a[b+44|0]&1)<<24>>24!=0|0}function m4(a){a=a|0;return a+20|0}function m5(a){a=a|0;return+(+g[a+48>>2])}function m6(b){b=b|0;var d=0.0,e=0,f=0;do{if((a[19488]|0)==0){if((a9(19488)|0)==0){break}}}while(0);d=+g[b>>2];e=(g[k>>2]=-0.0- +g[b+4>>2],c[k>>2]|0);b=(g[k>>2]=d,c[k>>2]|0)|0;f=104;c[f>>2]=0|e;c[f+4>>2]=b;return 104}function m7(a){a=a|0;var b=0.0,c=0.0;b=+g[a>>2];c=+g[a+4>>2];return+(+Q(+(b*b+c*c)))}function m8(a){a=a|0;if((a|0)==0){return}pT(a);return}function m9(b){b=b|0;var d=0.0,e=0,f=0;do{if((a[19480]|0)==0){if((a9(19480)|0)==0){break}}}while(0);d=-0.0- +g[b+4>>2];e=(g[k>>2]=-0.0- +g[b>>2],c[k>>2]|0);b=(g[k>>2]=d,c[k>>2]|0)|0;f=96;c[f>>2]=0|e;c[f+4>>2]=b;return 96}function na(a){a=a|0;if((a|0)==0){return}pT(a);return}function nb(){return pX(12)|0}function nc(a,b,c){a=+a;b=+b;c=+c;var d=0;d=pX(12)|0;g[d>>2]=a;g[d+4>>2]=b;g[d+8>>2]=c;return d|0}function nd(b){b=b|0;var c=0.0,d=0.0;do{if((a[19472]|0)==0){if((a9(19472)|0)==0){break}}}while(0);c=-0.0- +g[b+4>>2];d=-0.0- +g[b+8>>2];g[21]=-0.0- +g[b>>2];g[22]=c;g[23]=d;return 84}function ne(a,b,c){a=a|0;b=b|0;c=c|0;ce(a,b,c);return}function nf(){var a=0;a=pX(28)|0;c[a+16>>2]=0;c[a+20>>2]=0;g[a+24>>2]=0.0;return a|0}function ng(a){a=a|0;if((a|0)==0){return}pT(a);return}function nh(a,b){a=a|0;b=b|0;var d=0;do{if((b|0)>-1){if((c[a+20>>2]|0)>(b|0)){break}else{d=1083;break}}else{d=1083}}while(0);if((d|0)==1083){bc(5580,103,11416,4596)}return(c[a+16>>2]|0)+(b<<3)|0}function ni(a){a=a|0;if((a|0)==0){return}pT(a);return}function nj(){var d=0;d=pX(28)|0;b[d+22>>1]=1;b[d+24>>1]=-1;b[d+26>>1]=0;c[d>>2]=0;c[d+4>>2]=0;g[d+8>>2]=.20000000298023224;g[d+12>>2]=0.0;g[d+16>>2]=0.0;a[d+20|0]=0;return d|0}function nk(a,c){a=a|0;c=c|0;var d=0;d=a+22|0;a=c;b[d>>1]=b[a>>1]|0;b[d+2>>1]=b[a+2>>1]|0;b[d+4>>1]=b[a+4>>1]|0;return}function nl(){var b=0;b=pX(72)|0;pZ(b|0,0,17);c[b>>2]=2;pZ(b+20|0,0,16);g[b+36>>2]=1.0;g[b+40>>2]=0.0;g[b+44>>2]=0.0;a[b+48|0]=0;g[b+52>>2]=0.0;g[b+56>>2]=0.0;a[b+60|0]=0;g[b+64>>2]=0.0;g[b+68>>2]=0.0;return b|0}function nm(a){a=a|0;if((a|0)==0){return}pT(a);return}function nn(a){a=a|0;if((a|0)==0){return}pT(a);return}function no(a,b){a=a|0;b=+b;g[a>>2]=+T(+b);g[a+4>>2]=+S(+b);return}function np(a){a=a|0;return+(+Y(+(+g[a>>2]),+(+g[a+4>>2])))}function nq(b){b=b|0;var d=0.0,e=0,f=0;do{if((a[19456]|0)==0){if((a9(19456)|0)==0){break}}}while(0);d=+g[b+4>>2];e=(g[k>>2]=-0.0- +g[b>>2],c[k>>2]|0);b=(g[k>>2]=d,c[k>>2]|0)|0;f=76;c[f>>2]=0|e;c[f+4>>2]=b;return 76}function nr(b){b=b|0;var d=0.0,e=0,f=0;do{if((a[19464]|0)==0){if((a9(19464)|0)==0){break}}}while(0);d=+g[b>>2];e=(g[k>>2]=+g[b+4>>2],c[k>>2]|0);b=(g[k>>2]=d,c[k>>2]|0)|0;f=68;c[f>>2]=0|e;c[f+4>>2]=b;return 68}function ns(){return pX(8)|0}function nt(a){a=+a;var b=0;b=pX(8)|0;g[b>>2]=+T(+a);g[b+4>>2]=+S(+a);return b|0}function nu(a){a=a|0;if((a|0)==0){return}pT(a);return}function nv(a){a=a|0;return a+28|0}function nw(a){a=a|0;return+(+g[a+60>>2])}function nx(b,c){b=b|0;c=c|0;a[b+44|0]=c&1;return}function ny(a,b){a=a|0;b=+b;g[a+56>>2]=b;return}function nz(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0,l=0.0,m=0.0,n=0,o=0.0,p=0,q=0;c[a+8>>2]=b;c[a+12>>2]=d;h=e|0;i=+g[h>>2]- +g[b+12>>2];j=e+4|0;l=+g[j>>2]- +g[b+16>>2];e=b+24|0;m=+g[e>>2];n=b+20|0;o=+g[n>>2];b=a+20|0;p=(g[k>>2]=i*m+l*o,c[k>>2]|0);q=(g[k>>2]=m*l+i*(-0.0-o),c[k>>2]|0)|0;c[b>>2]=0|p;c[b+4>>2]=q;o=+g[h>>2]- +g[d+12>>2];i=+g[j>>2]- +g[d+16>>2];l=+g[d+24>>2];m=+g[d+20>>2];d=a+28|0;j=(g[k>>2]=o*l+i*m,c[k>>2]|0);h=(g[k>>2]=l*i+o*(-0.0-m),c[k>>2]|0)|0;c[d>>2]=0|j;c[d+4>>2]=h;m=+g[e>>2];o=+g[f>>2];i=+g[n>>2];l=+g[f+4>>2];f=a+36|0;a=(g[k>>2]=m*o+i*l,c[k>>2]|0);n=(g[k>>2]=o*(-0.0-i)+m*l,c[k>>2]|0)|0;c[f>>2]=0|a;c[f+4>>2]=n;return}function nA(a,b){a=a|0;b=+b;g[a+60>>2]=b;return}function nB(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+36|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function nC(a){a=a|0;return+(+g[a+52>>2])}function nD(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function nE(a){a=a|0;return+(+g[a+44>>2])}function nF(a,b){a=a|0;b=+b;g[a+48>>2]=b;return}function nG(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function nH(b){b=b|0;return(a[b+40|0]&1)<<24>>24!=0|0}function nI(a,b){a=a|0;b=+b;g[a+44>>2]=b;return}function nJ(b){b=b|0;return(a[b+52|0]&1)<<24>>24!=0|0}function nK(a,b){a=a|0;b=+b;g[a+56>>2]=b;return}function nL(a){a=a|0;return+(+g[a+48>>2])}function nM(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function nN(a,b){a=a|0;b=+b;g[a+60>>2]=b;return}function nO(a){a=a|0;return a+20|0}function nP(a){a=a|0;return+(+g[a+36>>2])}function nQ(a){a=a|0;return a+28|0}function nR(b,c){b=b|0;c=c|0;a[b+40|0]=c&1;return}function nS(b,c){b=b|0;c=c|0;a[b+52|0]=c&1;return}function nT(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0.0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0;c[a+8>>2]=b;c[a+12>>2]=d;f=e|0;h=+g[f>>2]- +g[b+12>>2];i=e+4|0;j=+g[i>>2]- +g[b+16>>2];l=+g[b+24>>2];m=+g[b+20>>2];e=a+20|0;n=(g[k>>2]=h*l+j*m,c[k>>2]|0);o=(g[k>>2]=l*j+h*(-0.0-m),c[k>>2]|0)|0;c[e>>2]=0|n;c[e+4>>2]=o;m=+g[f>>2]- +g[d+12>>2];h=+g[i>>2]- +g[d+16>>2];j=+g[d+24>>2];l=+g[d+20>>2];i=a+28|0;f=(g[k>>2]=m*j+h*l,c[k>>2]|0);o=(g[k>>2]=j*h+m*(-0.0-l),c[k>>2]|0)|0;c[i>>2]=0|f;c[i+4>>2]=o;g[a+36>>2]=+g[d+56>>2]- +g[b+56>>2];return}function nU(a){a=a|0;return+(+g[a+60>>2])}function nV(a){a=a|0;return+(+g[a+56>>2])}function nW(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+36|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function nX(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+44|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function nY(a){a=a|0;return+(+g[a+60>>2])}function nZ(a){a=a|0;return+(+g[a+56>>2])}function n_(a){a=a|0;return+(+g[a+52>>2])}function n$(a){a=a|0;return a+36|0}function n0(a,b){a=a|0;b=+b;g[a+60>>2]=b;return}function n1(a){a=a|0;return a+44|0}function n2(a){a=a|0;return a+28|0}function n3(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function n4(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function n5(a,b){a=a|0;b=+b;g[a+56>>2]=b;return}function n6(a,b){a=a|0;b=+b;g[a+52>>2]=b;return}function n7(a){a=a|0;return a+20|0}function n8(a){a=a|0;return c[a+8>>2]|0}function n9(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function oa(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function ob(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function oc(a){a=a|0;return c[a+12>>2]|0}function od(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function oe(b){b=b|0;return(a[b+16|0]&1)<<24>>24!=0|0}function of(a){a=a|0;return c[a>>2]|0}function og(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function oh(a){a=a|0;return c[a+4>>2]|0}function oi(a,b){a=a|0;b=b|0;var d=0;d=b;b=a;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function oj(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+8|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function ok(a){a=a|0;return a|0}function ol(a){a=a|0;return a+8|0}function om(a){a=a|0;g[a>>2]=0.0;g[a+4>>2]=0.0;g[a+8>>2]=0.0;g[a+12>>2]=1.0;return}function on(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function oo(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;g[a>>2]=b;g[a+4>>2]=c;g[a+8>>2]=d;return}function op(a){a=a|0;return+(+g[a+8>>2])}function oq(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function or(a){a=a|0;return+(+g[a+40>>2])}function os(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function ot(a,b){a=a|0;b=+b;g[a+44>>2]=b;return}function ou(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function ov(a){a=a|0;return a+20|0}function ow(a){a=a|0;return+(+g[a+36>>2])}function ox(a){a=a|0;return a+28|0}function oy(a){a=a|0;return+(+g[a+44>>2])}function oz(a,b){a=a|0;b=+b;g[a+40>>2]=b;return}function oA(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0.0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0;c[a+8>>2]=b;c[a+12>>2]=d;f=e|0;h=+g[f>>2]- +g[b+12>>2];i=e+4|0;j=+g[i>>2]- +g[b+16>>2];l=+g[b+24>>2];m=+g[b+20>>2];e=a+20|0;n=(g[k>>2]=h*l+j*m,c[k>>2]|0);o=(g[k>>2]=l*j+h*(-0.0-m),c[k>>2]|0)|0;c[e>>2]=0|n;c[e+4>>2]=o;m=+g[f>>2]- +g[d+12>>2];h=+g[i>>2]- +g[d+16>>2];j=+g[d+24>>2];l=+g[d+20>>2];i=a+28|0;f=(g[k>>2]=m*j+h*l,c[k>>2]|0);o=(g[k>>2]=j*h+m*(-0.0-l),c[k>>2]|0)|0;c[i>>2]=0|f;c[i+4>>2]=o;g[a+36>>2]=+g[d+56>>2]- +g[b+56>>2];return}function oB(a){a=a|0;return+(+g[a+32>>2])}function oC(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function oD(a){a=a|0;return+(+g[a+28>>2])}function oE(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function oF(a,b){a=a|0;b=+b;g[a+28>>2]=b;return}function oG(a){a=a|0;return a+20|0}function oH(a,b){a=a|0;b=+b;g[a+32>>2]=b;return}function oI(a){a=a|0;return+(+g[a+36>>2])}function oJ(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function oK(a){a=a|0;return+(+g[a+36>>2])}function oL(a){a=a|0;return+(+g[a+40>>2])}function oM(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function oN(a,b){a=a|0;b=+b;g[a+44>>2]=b;return}function oO(a){a=a|0;return a+20|0}function oP(a){a=a|0;return a+28|0}function oQ(a){a=a|0;return+(+g[a+44>>2])}function oR(){var b=0;b=pX(64)|0;pZ(b|0,0,17);c[b>>2]=7;pZ(b+20|0,0,16);g[b+36>>2]=1.0;g[b+40>>2]=0.0;a[b+44|0]=0;g[b+48>>2]=0.0;g[b+52>>2]=0.0;g[b+56>>2]=2.0;g[b+60>>2]=.699999988079071;return b|0}function oS(a){a=a|0;if((a|0)==0){return}pT(a);return}function oT(){var b=0;b=pX(64)|0;pZ(b|0,0,17);c[b>>2]=1;g[b+44>>2]=0.0;g[b+48>>2]=0.0;g[b+60>>2]=0.0;g[b+56>>2]=0.0;a[b+52|0]=0;pZ(b+20|0,0,21);return b|0}function oU(a){a=a|0;if((a|0)==0){return}pT(a);return}function oV(){var b=0;b=pX(64)|0;pZ(b|0,0,16);c[b>>2]=4;g[b+20>>2]=-1.0;g[b+24>>2]=1.0;g[b+28>>2]=1.0;g[b+32>>2]=1.0;g[b+36>>2]=-1.0;g[b+40>>2]=0.0;g[b+44>>2]=1.0;g[b+48>>2]=0.0;g[b+52>>2]=0.0;g[b+56>>2]=0.0;g[b+60>>2]=1.0;a[b+16|0]=1;return b|0}function oW(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;fF(a,b,c,d,e,f,g,h);return}function oX(a){a=a|0;if((a|0)==0){return}pT(a);return}function oY(){var a=0;a=pX(20)|0;pZ(a|0,0,17);return a|0}function oZ(a){a=a|0;if((a|0)==0){return}pT(a);return}function o_(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0;e=b;b=a;f=c[e+4>>2]|0;c[b>>2]=c[e>>2]|0;c[b+4>>2]=f;g[a+8>>2]=+T(+d);g[a+12>>2]=+S(+d);return}function o$(){return pX(16)|0}function o0(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=pX(16)|0;e=a;a=d;f=c[e+4>>2]|0;c[a>>2]=c[e>>2]|0;c[a+4>>2]=f;f=b;b=d+8|0;a=c[f+4>>2]|0;c[b>>2]=c[f>>2]|0;c[b+4>>2]=a;return d|0}function o1(a){a=a|0;if((a|0)==0){return}pT(a);return}function o2(){return pX(12)|0}function o3(a,b,c){a=+a;b=+b;c=+c;var d=0;d=pX(12)|0;g[d>>2]=a;g[d+4>>2]=b;g[d+8>>2]=c;return d|0}function o4(a){a=a|0;if((a|0)==0){return}pT(a);return}function o5(){var a=0;a=pX(48)|0;pZ(a|0,0,17);c[a>>2]=8;pZ(a+20|0,0,28);return a|0}function o6(a){a=a|0;if((a|0)==0){return}pT(a);return}function o7(){var a=0;a=pX(40)|0;pZ(a|0,0,17);c[a>>2]=5;g[a+20>>2]=0.0;g[a+24>>2]=0.0;g[a+28>>2]=0.0;g[a+32>>2]=5.0;g[a+36>>2]=.699999988079071;return a|0}function o8(a){a=a|0;if((a|0)==0){return}pT(a);return}function o9(){var a=0;a=pX(48)|0;pZ(a|0,0,17);c[a>>2]=3;pZ(a+20|0,0,16);g[a+36>>2]=1.0;g[a+40>>2]=0.0;g[a+44>>2]=0.0;return a|0}function pa(a){a=a|0;return}function pb(a){a=a|0;return}function pc(a){a=a|0;return}function pd(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function pe(a,b){a=a|0;b=+b;g[a+40>>2]=b;return}function pf(a,b){a=a|0;b=b|0;c[a+20>>2]=b;return}function pg(a,b){a=a|0;b=b|0;c[a+24>>2]=b;return}function ph(a,b){a=a|0;b=+b;g[a+28>>2]=b;return}function pi(a){a=a|0;return c[a+20>>2]|0}function pj(a){a=a|0;return c[a+24>>2]|0}function pk(a){a=a|0;return+(+g[a+28>>2])}function pl(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function pm(a){a=a|0;return c[a+8>>2]|0}function pn(a){a=a|0;return c[a>>2]|0}function po(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function pp(a){a=a|0;return c[a+12>>2]|0}function pq(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function pr(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function ps(a){a=a|0;return c[a+4>>2]|0}function pt(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function pu(a){a=a|0;return+(+g[a+36>>2])}function pv(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function pw(a){a=a|0;return a+20|0}function px(a){a=a|0;return a+28|0}function py(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function pz(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((c[d+8>>2]|0)!=(b|0)){return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function pA(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){return}g=d+28|0;if((c[g>>2]|0)==1){return}c[g>>2]=f;return}if((c[d>>2]|0)!=(b|0)){return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1|0;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function pB(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;if((c[d+8>>2]|0)!=(b|0)){return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;a[d+54|0]=1;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g;i=g}else{i=b}if(!((c[d+48>>2]|0)==1&(i|0)==1)){return}a[d+54|0]=1;return}function pC(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0,l=0.0,m=0.0,n=0.0,o=0;c[a+8>>2]=b;c[a+12>>2]=d;h=e|0;i=+g[h>>2]- +g[b+12>>2];j=e+4|0;l=+g[j>>2]- +g[b+16>>2];m=+g[b+24>>2];n=+g[b+20>>2];b=a+20|0;e=(g[k>>2]=i*m+l*n,c[k>>2]|0);o=(g[k>>2]=m*l+i*(-0.0-n),c[k>>2]|0)|0;c[b>>2]=0|e;c[b+4>>2]=o;o=f|0;n=+g[o>>2]- +g[d+12>>2];b=f+4|0;i=+g[b>>2]- +g[d+16>>2];l=+g[d+24>>2];m=+g[d+20>>2];d=a+28|0;f=(g[k>>2]=n*l+i*m,c[k>>2]|0);e=(g[k>>2]=l*i+n*(-0.0-m),c[k>>2]|0)|0;c[d>>2]=0|f;c[d+4>>2]=e;m=+g[o>>2]- +g[h>>2];n=+g[b>>2]- +g[j>>2];g[a+36>>2]=+Q(+(m*m+n*n));return}function pD(a){a=a|0;if((a|0)==0){return}pT(a);return}function pE(){var a=0;a=pX(32)|0;pZ(a|0,0,17);c[a>>2]=6;c[a+20>>2]=0;c[a+24>>2]=0;g[a+28>>2]=1.0;return a|0}function pF(a){a=a|0;if((a|0)==0){return}pT(a);return}function pG(){return pX(16)|0}function pH(a){a=a|0;if((a|0)==0){return}pT(a);return}function pI(){var a=0;a=pX(40)|0;pZ(a|0,0,17);c[a>>2]=10;g[a+20>>2]=-1.0;g[a+24>>2]=0.0;g[a+28>>2]=1.0;g[a+32>>2]=0.0;g[a+36>>2]=0.0;return a|0}function pJ(a){a=a|0;pT(a);return}function pK(a){a=a|0;pT(a);return}function pL(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+56|0;f=e|0;do{if((a|0)==(b|0)){g=1}else{if((b|0)==0){g=0;break}h=pN(b,18160,18148,-1)|0;j=h;if((h|0)==0){g=0;break}pZ(f|0,0,56);c[f>>2]=j;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;bR[c[(c[h>>2]|0)+28>>2]&2047](j,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;break}c[d>>2]=c[f+16>>2]|0;g=1}}while(0);i=e;return g|0}function pM(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((b|0)!=(c[d+8>>2]|0)){g=c[b+8>>2]|0;bR[c[(c[g>>2]|0)+28>>2]&2047](g,d,e,f);return}g=d+16|0;b=c[g>>2]|0;if((b|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function pN(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+56|0;g=f|0;h=c[a>>2]|0;j=a+(c[h-8>>2]|0)|0;k=c[h-4>>2]|0;h=k;c[g>>2]=d;c[g+4>>2]=a;c[g+8>>2]=b;c[g+12>>2]=e;e=g+16|0;b=g+20|0;a=g+24|0;l=g+28|0;m=g+32|0;n=g+40|0;pZ(e|0,0,39);if((k|0)==(d|0)){c[g+48>>2]=1;bD[c[(c[k>>2]|0)+20>>2]&2047](h,g,j,j,1,0);i=f;return((c[a>>2]|0)==1?j:0)|0}bo[c[(c[k>>2]|0)+24>>2]&2047](h,g,j,1,0);j=c[g+36>>2]|0;do{if((j|0)==0){if((c[n>>2]|0)!=1){o=0;break}if((c[l>>2]|0)!=1){o=0;break}o=(c[m>>2]|0)==1?c[b>>2]|0:0}else if((j|0)==1){if((c[a>>2]|0)!=1){if((c[n>>2]|0)!=0){o=0;break}if((c[l>>2]|0)!=1){o=0;break}if((c[m>>2]|0)!=1){o=0;break}}o=c[e>>2]|0}else{o=0}}while(0);i=f;return o|0}function pO(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)!=(c[d>>2]|0)){h=c[b+8>>2]|0;bo[c[(c[h>>2]|0)+24>>2]&2047](h,d,e,f,g);return}do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=d+52|0;a[j]=0;k=d+53|0;a[k]=0;l=c[b+8>>2]|0;bD[c[(c[l>>2]|0)+20>>2]&2047](l,d,e,e,1,g);do{if((a[k]&1)<<24>>24==0){m=0;n=1402}else{if((a[j]&1)<<24>>24==0){m=1;n=1402;break}else{break}}}while(0);L1589:do{if((n|0)==1402){c[h>>2]=e;j=d+40|0;c[j>>2]=(c[j>>2]|0)+1|0;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){n=1405;break}a[d+54|0]=1;if(m){break L1589}else{break}}else{n=1405}}while(0);if((n|0)==1405){if(m){break}}c[i>>2]=4;return}}while(0);c[i>>2]=3;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function pP(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0;if((b|0)!=(c[d+8>>2]|0)){i=c[b+8>>2]|0;bD[c[(c[i>>2]|0)+20>>2]&2047](i,d,e,f,g,h);return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;h=c[f>>2]|0;if((h|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;a[d+54|0]=1;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g;j=g}else{j=h}if(!((c[d+48>>2]|0)==1&(j|0)==1)){return}a[d+54|0]=1;return}
function pQ(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[2650]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=10640+(h<<2)|0;j=10640+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[2650]=e&(1<<g^-1)}else{if(l>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{aR();return 0;return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[2652]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=10640+(p<<2)|0;m=10640+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[2650]=e&(1<<r^-1)}else{if(l>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{aR();return 0;return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[2652]|0;if((l|0)!=0){q=c[2655]|0;d=l>>>3;l=d<<1;f=10640+(l<<2)|0;k=c[2650]|0;h=1<<d;do{if((k&h|0)==0){c[2650]=k|h;s=f;t=10640+(l+2<<2)|0}else{d=10640+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[2654]|0)>>>0){s=g;t=d;break}aR();return 0;return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[2652]=m;c[2655]=e;n=i;return n|0}l=c[2651]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[10904+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[2654]|0;if(r>>>0<i>>>0){aR();return 0;return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){aR();return 0;return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;L1687:do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;do{if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break L1687}else{w=l;x=k;break}}else{w=g;x=q}}while(0);while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){aR();return 0;return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){aR();return 0;return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){aR();return 0;return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{aR();return 0;return 0}}}while(0);L1709:do{if((e|0)!=0){f=d+28|0;i=10904+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[2651]=c[2651]&(1<<c[f>>2]^-1);break L1709}else{if(e>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L1709}}}while(0);if(v>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4|0)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b|0)>>2]=p;f=c[2652]|0;if((f|0)!=0){e=c[2655]|0;i=f>>>3;f=i<<1;q=10640+(f<<2)|0;k=c[2650]|0;g=1<<i;do{if((k&g|0)==0){c[2650]=k|g;y=q;z=10640+(f+2<<2)|0}else{i=10640+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[2654]|0)>>>0){y=l;z=i;break}aR();return 0;return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[2652]=p;c[2655]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[2651]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=(14-(h|f|l)|0)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[10904+(A<<2)>>2]|0;L1757:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L1757}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break L1757}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[10904+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}L1772:do{if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break L1772}else{p=r;m=i;q=e}}}}while(0);if((K|0)==0){o=g;break}if(J>>>0>=((c[2652]|0)-g|0)>>>0){o=g;break}k=K;q=c[2654]|0;if(k>>>0<q>>>0){aR();return 0;return 0}m=k+g|0;p=m;if(k>>>0>=m>>>0){aR();return 0;return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;L1785:do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;do{if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break L1785}else{M=B;N=j;break}}else{M=d;N=r}}while(0);while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<q>>>0){aR();return 0;return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<q>>>0){aR();return 0;return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){aR();return 0;return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{aR();return 0;return 0}}}while(0);L1807:do{if((e|0)!=0){i=K+28|0;q=10904+(c[i>>2]<<2)|0;do{if((K|0)==(c[q>>2]|0)){c[q>>2]=L;if((L|0)!=0){break}c[2651]=c[2651]&(1<<c[i>>2]^-1);break L1807}else{if(e>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L1807}}}while(0);if(L>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=k+(e+4|0)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[k+(g|4)>>2]=J|1;c[k+(J+g|0)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;q=10640+(e<<2)|0;r=c[2650]|0;j=1<<i;do{if((r&j|0)==0){c[2650]=r|j;O=q;P=10640+(e+2<<2)|0}else{i=10640+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[2654]|0)>>>0){O=d;P=i;break}aR();return 0;return 0}}while(0);c[P>>2]=p;c[O+12>>2]=p;c[k+(g+8|0)>>2]=O;c[k+(g+12|0)>>2]=q;break}e=m;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=(14-(d|r|i)|0)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=10904+(Q<<2)|0;c[k+(g+28|0)>>2]=Q;c[k+(g+20|0)>>2]=0;c[k+(g+16|0)>>2]=0;q=c[2651]|0;l=1<<Q;if((q&l|0)==0){c[2651]=q|l;c[j>>2]=e;c[k+(g+24|0)>>2]=j;c[k+(g+12|0)>>2]=e;c[k+(g+8|0)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;q=c[j>>2]|0;while(1){if((c[q+4>>2]&-8|0)==(J|0)){break}S=q+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=1589;break}else{l=l<<1;q=j}}if((T|0)==1589){if(S>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}else{c[S>>2]=e;c[k+(g+24|0)>>2]=q;c[k+(g+12|0)>>2]=e;c[k+(g+8|0)>>2]=e;break}}l=q+8|0;j=c[l>>2]|0;i=c[2654]|0;if(q>>>0<i>>>0){aR();return 0;return 0}if(j>>>0<i>>>0){aR();return 0;return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[k+(g+8|0)>>2]=j;c[k+(g+12|0)>>2]=q;c[k+(g+24|0)>>2]=0;break}}}while(0);k=K+8|0;if((k|0)==0){o=g;break}else{n=k}return n|0}}while(0);K=c[2652]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[2655]|0;if(S>>>0>15){R=J;c[2655]=R+o|0;c[2652]=S;c[R+(o+4|0)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[2652]=0;c[2655]=0;c[J+4>>2]=K|3;S=J+(K+4|0)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[2653]|0;if(o>>>0<J>>>0){S=J-o|0;c[2653]=S;J=c[2656]|0;K=J;c[2656]=K+o|0;c[K+(o+4|0)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[34]|0)==0){J=aW(8)|0;if((J-1&J|0)==0){c[36]=J;c[35]=J;c[37]=-1;c[38]=2097152;c[39]=0;c[2761]=0;c[34]=a6(0)&-16^1431655768;break}else{aR();return 0;return 0}}}while(0);J=o+48|0;S=c[36]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[2760]|0;do{if((O|0)!=0){P=c[2758]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L1899:do{if((c[2761]&4|0)==0){O=c[2656]|0;L1901:do{if((O|0)==0){T=1619}else{L=O;P=11048;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=1619;break L1901}else{P=M}}if((P|0)==0){T=1619;break}L=R-(c[2653]|0)&Q;if(L>>>0>=2147483647){W=0;break}q=bf(L|0)|0;e=(q|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?q:-1;Y=e?L:0;Z=q;_=L;T=1628;break}}while(0);do{if((T|0)==1619){O=bf(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[35]|0;q=L-1|0;if((q&g|0)==0){$=S}else{$=(S-g|0)+(q+g&-L)|0}L=c[2758]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}q=c[2760]|0;if((q|0)!=0){if(g>>>0<=L>>>0|g>>>0>q>>>0){W=0;break}}q=bf($|0)|0;g=(q|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=q;_=$;T=1628;break}}while(0);L1921:do{if((T|0)==1628){q=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=1639;break L1899}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[36]|0;O=(K-_|0)+g&-g;if(O>>>0>=2147483647){ac=_;break}if((bf(O|0)|0)==-1){bf(q|0);W=Y;break L1921}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=1639;break L1899}}}while(0);c[2761]=c[2761]|4;ad=W;T=1636;break}else{ad=0;T=1636}}while(0);do{if((T|0)==1636){if(S>>>0>=2147483647){break}W=bf(S|0)|0;Z=bf(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)==-1){break}else{aa=Z?ac:ad;ab=Y;T=1639;break}}}while(0);do{if((T|0)==1639){ad=(c[2758]|0)+aa|0;c[2758]=ad;if(ad>>>0>(c[2759]|0)>>>0){c[2759]=ad}ad=c[2656]|0;L1941:do{if((ad|0)==0){S=c[2654]|0;if((S|0)==0|ab>>>0<S>>>0){c[2654]=ab}c[2762]=ab;c[2763]=aa;c[2765]=0;c[2659]=c[34]|0;c[2658]=-1;S=0;while(1){Y=S<<1;ac=10640+(Y<<2)|0;c[10640+(Y+3<<2)>>2]=ac;c[10640+(Y+2<<2)>>2]=ac;ac=S+1|0;if((ac|0)==32){break}else{S=ac}}S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=(aa-40|0)-ae|0;c[2656]=ab+ae|0;c[2653]=S;c[ab+(ae+4|0)>>2]=S|1;c[ab+(aa-36|0)>>2]=40;c[2657]=c[38]|0}else{S=11048;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=1651;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==1651){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa|0;ac=c[2656]|0;Y=(c[2653]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[2656]=Z+ai|0;c[2653]=W;c[Z+(ai+4|0)>>2]=W|1;c[Z+(Y+4|0)>>2]=40;c[2657]=c[38]|0;break L1941}}while(0);if(ab>>>0<(c[2654]|0)>>>0){c[2654]=ab}S=ab+aa|0;Y=11048;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=1661;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==1661){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa|0;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8|0)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa|0)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=(S-(ab+ak|0)|0)-o|0;c[ab+(ak+4|0)>>2]=o|3;do{if((Z|0)==(c[2656]|0)){J=(c[2653]|0)+K|0;c[2653]=J;c[2656]=_;c[ab+(W+4|0)>>2]=J|1}else{if((Z|0)==(c[2655]|0)){J=(c[2652]|0)+K|0;c[2652]=J;c[2655]=_;c[ab+(W+4|0)>>2]=J|1;c[ab+(J+W|0)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al|0)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L1986:do{if(X>>>0<256){U=c[ab+((al|8)+aa|0)>>2]|0;Q=c[ab+((aa+12|0)+al|0)>>2]|0;R=10640+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}if((c[U+12>>2]|0)==(Z|0)){break}aR();return 0;return 0}}while(0);if((Q|0)==(U|0)){c[2650]=c[2650]&(1<<V^-1);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}q=Q+8|0;if((c[q>>2]|0)==(Z|0)){am=q;break}aR();return 0;return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;q=c[ab+((al|24)+aa|0)>>2]|0;P=c[ab+((aa+12|0)+al|0)>>2]|0;L2007:do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O|0)|0;L=c[g>>2]|0;do{if((L|0)==0){e=ab+(O+aa|0)|0;M=c[e>>2]|0;if((M|0)==0){an=0;break L2007}else{ao=M;ap=e;break}}else{ao=L;ap=g}}while(0);while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa|0)>>2]|0;if(g>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){aR();return 0;return 0}O=P+8|0;if((c[O>>2]|0)==(R|0)){c[L>>2]=P;c[O>>2]=g;an=P;break}else{aR();return 0;return 0}}}while(0);if((q|0)==0){break}P=ab+((aa+28|0)+al|0)|0;U=10904+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[2651]=c[2651]&(1<<c[P>>2]^-1);break L1986}else{if(q>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}Q=q+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[q+20>>2]=an}if((an|0)==0){break L1986}}}while(0);if(an>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}c[an+24>>2]=q;R=al|16;P=c[ab+(R+aa|0)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R|0)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);aq=ab+(($|al)+aa|0)|0;ar=$+K|0}else{aq=Z;ar=K}J=aq+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4|0)>>2]=ar|1;c[ab+(ar+W|0)>>2]=ar;J=ar>>>3;if(ar>>>0<256){V=J<<1;X=10640+(V<<2)|0;P=c[2650]|0;q=1<<J;do{if((P&q|0)==0){c[2650]=P|q;as=X;at=10640+(V+2<<2)|0}else{J=10640+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[2654]|0)>>>0){as=U;at=J;break}aR();return 0;return 0}}while(0);c[at>>2]=_;c[as+12>>2]=_;c[ab+(W+8|0)>>2]=as;c[ab+(W+12|0)>>2]=X;break}V=ac;q=ar>>>8;do{if((q|0)==0){au=0}else{if(ar>>>0>16777215){au=31;break}P=(q+1048320|0)>>>16&8;$=q<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=(14-(J|P|$)|0)+(U<<$>>>15)|0;au=ar>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);q=10904+(au<<2)|0;c[ab+(W+28|0)>>2]=au;c[ab+(W+20|0)>>2]=0;c[ab+(W+16|0)>>2]=0;X=c[2651]|0;Q=1<<au;if((X&Q|0)==0){c[2651]=X|Q;c[q>>2]=V;c[ab+(W+24|0)>>2]=q;c[ab+(W+12|0)>>2]=V;c[ab+(W+8|0)>>2]=V;break}if((au|0)==31){av=0}else{av=25-(au>>>1)|0}Q=ar<<av;X=c[q>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(ar|0)){break}aw=X+16+(Q>>>31<<2)|0;q=c[aw>>2]|0;if((q|0)==0){T=1734;break}else{Q=Q<<1;X=q}}if((T|0)==1734){if(aw>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}else{c[aw>>2]=V;c[ab+(W+24|0)>>2]=X;c[ab+(W+12|0)>>2]=V;c[ab+(W+8|0)>>2]=V;break}}Q=X+8|0;q=c[Q>>2]|0;$=c[2654]|0;if(X>>>0<$>>>0){aR();return 0;return 0}if(q>>>0<$>>>0){aR();return 0;return 0}else{c[q+12>>2]=V;c[Q>>2]=V;c[ab+(W+8|0)>>2]=q;c[ab+(W+12|0)>>2]=X;c[ab+(W+24|0)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=11048;while(1){ax=c[W>>2]|0;if(ax>>>0<=Y>>>0){ay=c[W+4>>2]|0;az=ax+ay|0;if(az>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ax+(ay-39|0)|0;if((W&7|0)==0){aA=0}else{aA=-W&7}W=ax+((ay-47|0)+aA|0)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aB=0}else{aB=-_&7}_=(aa-40|0)-aB|0;c[2656]=ab+aB|0;c[2653]=_;c[ab+(aB+4|0)>>2]=_|1;c[ab+(aa-36|0)>>2]=40;c[2657]=c[38]|0;c[ac+4>>2]=27;c[W>>2]=c[2762]|0;c[W+4>>2]=c[11052>>2]|0;c[W+8>>2]=c[11056>>2]|0;c[W+12>>2]=c[11060>>2]|0;c[2762]=ab;c[2763]=aa;c[2765]=0;c[2764]=W;W=ac+28|0;c[W>>2]=7;L2105:do{if((ac+32|0)>>>0<az>>>0){_=W;while(1){K=_+4|0;c[K>>2]=7;if((_+8|0)>>>0<az>>>0){_=K}else{break L2105}}}}while(0);if((ac|0)==(Y|0)){break}W=ac-ad|0;_=Y+(W+4|0)|0;c[_>>2]=c[_>>2]&-2;c[ad+4>>2]=W|1;c[Y+W>>2]=W;_=W>>>3;if(W>>>0<256){K=_<<1;Z=10640+(K<<2)|0;S=c[2650]|0;q=1<<_;do{if((S&q|0)==0){c[2650]=S|q;aC=Z;aD=10640+(K+2<<2)|0}else{_=10640+(K+2<<2)|0;Q=c[_>>2]|0;if(Q>>>0>=(c[2654]|0)>>>0){aC=Q;aD=_;break}aR();return 0;return 0}}while(0);c[aD>>2]=ad;c[aC+12>>2]=ad;c[ad+8>>2]=aC;c[ad+12>>2]=Z;break}K=ad;q=W>>>8;do{if((q|0)==0){aE=0}else{if(W>>>0>16777215){aE=31;break}S=(q+1048320|0)>>>16&8;Y=q<<S;ac=(Y+520192|0)>>>16&4;_=Y<<ac;Y=(_+245760|0)>>>16&2;Q=(14-(ac|S|Y)|0)+(_<<Y>>>15)|0;aE=W>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);q=10904+(aE<<2)|0;c[ad+28>>2]=aE;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[2651]|0;Q=1<<aE;if((Z&Q|0)==0){c[2651]=Z|Q;c[q>>2]=K;c[ad+24>>2]=q;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aE|0)==31){aF=0}else{aF=25-(aE>>>1)|0}Q=W<<aF;Z=c[q>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(W|0)){break}aG=Z+16+(Q>>>31<<2)|0;q=c[aG>>2]|0;if((q|0)==0){T=1769;break}else{Q=Q<<1;Z=q}}if((T|0)==1769){if(aG>>>0<(c[2654]|0)>>>0){aR();return 0;return 0}else{c[aG>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;W=c[Q>>2]|0;q=c[2654]|0;if(Z>>>0<q>>>0){aR();return 0;return 0}if(W>>>0<q>>>0){aR();return 0;return 0}else{c[W+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=W;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[2653]|0;if(ad>>>0<=o>>>0){break}W=ad-o|0;c[2653]=W;ad=c[2656]|0;Q=ad;c[2656]=Q+o|0;c[Q+(o+4|0)>>2]=W|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[bi()>>2]=12;n=0;return n|0}function pR(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[2654]|0;if(b>>>0<e>>>0){aR()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){aR()}h=f&-8;i=a+(h-8|0)|0;j=i;L2158:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){aR()}if((n|0)==(c[2655]|0)){p=a+(h-4|0)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[2652]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4|0)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8|0)>>2]|0;s=c[a+(l+12|0)>>2]|0;t=10640+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){aR()}if((c[k+12>>2]|0)==(n|0)){break}aR()}}while(0);if((s|0)==(k|0)){c[2650]=c[2650]&(1<<p^-1);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){aR()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}aR()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24|0)>>2]|0;v=c[a+(l+12|0)>>2]|0;L2192:do{if((v|0)==(t|0)){w=a+(l+20|0)|0;x=c[w>>2]|0;do{if((x|0)==0){y=a+(l+16|0)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break L2192}else{B=z;C=y;break}}else{B=x;C=w}}while(0);while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){aR()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8|0)>>2]|0;if(w>>>0<e>>>0){aR()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){aR()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{aR()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28|0)|0;m=10904+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[2651]=c[2651]&(1<<c[v>>2]^-1);q=n;r=o;break L2158}else{if(p>>>0<(c[2654]|0)>>>0){aR()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L2158}}}while(0);if(A>>>0<(c[2654]|0)>>>0){aR()}c[A+24>>2]=p;t=c[a+(l+16|0)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[2654]|0)>>>0){aR()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20|0)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[2654]|0)>>>0){aR()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){aR()}A=a+(h-4|0)|0;e=c[A>>2]|0;if((e&1|0)==0){aR()}do{if((e&2|0)==0){if((j|0)==(c[2656]|0)){B=(c[2653]|0)+r|0;c[2653]=B;c[2656]=q;c[q+4>>2]=B|1;if((q|0)==(c[2655]|0)){c[2655]=0;c[2652]=0}if(B>>>0<=(c[2657]|0)>>>0){return}pW(0);return}if((j|0)==(c[2655]|0)){B=(c[2652]|0)+r|0;c[2652]=B;c[2655]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L2264:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=10640+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[2654]|0)>>>0){aR()}if((c[u+12>>2]|0)==(j|0)){break}aR()}}while(0);if((g|0)==(u|0)){c[2650]=c[2650]&(1<<C^-1);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[2654]|0)>>>0){aR()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}aR()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16|0)>>2]|0;t=c[a+(h|4)>>2]|0;L2285:do{if((t|0)==(b|0)){p=a+(h+12|0)|0;v=c[p>>2]|0;do{if((v|0)==0){m=a+(h+8|0)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break L2285}else{F=k;G=m;break}}else{F=v;G=p}}while(0);while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[2654]|0)>>>0){aR()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[2654]|0)>>>0){aR()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){aR()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{aR()}}}while(0);if((f|0)==0){break}t=a+(h+20|0)|0;u=10904+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[2651]=c[2651]&(1<<c[t>>2]^-1);break L2264}else{if(f>>>0<(c[2654]|0)>>>0){aR()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L2264}}}while(0);if(E>>>0<(c[2654]|0)>>>0){aR()}c[E+24>>2]=f;b=c[a+(h+8|0)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[2654]|0)>>>0){aR()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12|0)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[2654]|0)>>>0){aR()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[2655]|0)){H=B;break}c[2652]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=10640+(d<<2)|0;A=c[2650]|0;E=1<<r;do{if((A&E|0)==0){c[2650]=A|E;I=e;J=10640+(d+2<<2)|0}else{r=10640+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[2654]|0)>>>0){I=h;J=r;break}aR()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=(14-(E|J|d)|0)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=10904+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[2651]|0;d=1<<K;do{if((r&d|0)==0){c[2651]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=1948;break}else{A=A<<1;J=E}}if((N|0)==1948){if(M>>>0<(c[2654]|0)>>>0){aR()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[2654]|0;if(J>>>0<E>>>0){aR()}if(B>>>0<E>>>0){aR()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[2658]|0)-1|0;c[2658]=q;if((q|0)==0){O=11056}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[2658]=-1;return}function pS(a){a=a|0;return 4908}function pT(a){a=a|0;if((a|0)!=0){pR(a)}return}function pU(a){a=a|0;pT(a);return}function pV(a){a=a|0;return}function pW(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;do{if((c[34]|0)==0){b=aW(8)|0;if((b-1&b|0)==0){c[36]=b;c[35]=b;c[37]=-1;c[38]=2097152;c[39]=0;c[2761]=0;c[34]=a6(0)&-16^1431655768;break}else{aR();return 0;return 0}}}while(0);if(a>>>0>=4294967232){d=0;e=d&1;return e|0}b=c[2656]|0;if((b|0)==0){d=0;e=d&1;return e|0}f=c[2653]|0;do{if(f>>>0>(a+40|0)>>>0){g=c[36]|0;h=aa(((((((-40-a|0)-1|0)+f|0)+g|0)>>>0)/(g>>>0)>>>0)-1|0,g);i=b;j=11048;while(1){k=c[j>>2]|0;if(k>>>0<=i>>>0){if((k+(c[j+4>>2]|0)|0)>>>0>i>>>0){l=j;break}}k=c[j+8>>2]|0;if((k|0)==0){l=0;break}else{j=k}}if((c[l+12>>2]&8|0)!=0){break}j=bf(0)|0;i=l+4|0;if((j|0)!=((c[l>>2]|0)+(c[i>>2]|0)|0)){break}k=bf(-(h>>>0>2147483646?-2147483648-g|0:h)|0)|0;m=bf(0)|0;if(!((k|0)!=-1&m>>>0<j>>>0)){break}k=j-m|0;if((j|0)==(m|0)){break}c[i>>2]=(c[i>>2]|0)-k|0;c[2758]=(c[2758]|0)-k|0;i=c[2656]|0;n=(c[2653]|0)-k|0;k=i;o=i+8|0;if((o&7|0)==0){p=0}else{p=-o&7}o=n-p|0;c[2656]=k+p|0;c[2653]=o;c[k+(p+4|0)>>2]=o|1;c[k+(n+4|0)>>2]=40;c[2657]=c[38]|0;d=(j|0)!=(m|0);e=d&1;return e|0}}while(0);if((c[2653]|0)>>>0<=(c[2657]|0)>>>0){d=0;e=d&1;return e|0}c[2657]=-1;d=0;e=d&1;return e|0}function pX(a){a=a|0;var b=0,d=0,e=0;b=(a|0)==0?1:a;while(1){d=pQ(b)|0;if((d|0)!=0){e=2032;break}a=(C=c[4841]|0,c[4841]=C+0,C);if((a|0)==0){break}bP[a&2047]()}if((e|0)==2032){return d|0}d=bh(4)|0;c[d>>2]=16456;aQ(d|0,18124,176);return 0}function pY(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2]|0;b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function pZ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function p_(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function p$(){a4()}function p0(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;bo[a&2047](b|0,c|0,d|0,e|0,f|0)}function p1(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(0,a|0,b|0,c|0,d|0,e|0)}function p2(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(1,a|0,b|0,c|0,d|0,e|0)}function p3(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(2,a|0,b|0,c|0,d|0,e|0)}function p4(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(3,a|0,b|0,c|0,d|0,e|0)}function p5(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(4,a|0,b|0,c|0,d|0,e|0)}function p6(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(5,a|0,b|0,c|0,d|0,e|0)}function p7(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(6,a|0,b|0,c|0,d|0,e|0)}function p8(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(7,a|0,b|0,c|0,d|0,e|0)}function p9(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(8,a|0,b|0,c|0,d|0,e|0)}function qa(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(9,a|0,b|0,c|0,d|0,e|0)}function qb(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(10,a|0,b|0,c|0,d|0,e|0)}function qc(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(11,a|0,b|0,c|0,d|0,e|0)}function qd(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(12,a|0,b|0,c|0,d|0,e|0)}function qe(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(13,a|0,b|0,c|0,d|0,e|0)}function qf(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(14,a|0,b|0,c|0,d|0,e|0)}function qg(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(15,a|0,b|0,c|0,d|0,e|0)}function qh(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(16,a|0,b|0,c|0,d|0,e|0)}function qi(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(17,a|0,b|0,c|0,d|0,e|0)}function qj(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(18,a|0,b|0,c|0,d|0,e|0)}function qk(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(19,a|0,b|0,c|0,d|0,e|0)}function ql(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=+d;e=e|0;f=f|0;bp[a&2047](b|0,c|0,+d,e|0,f|0)}function qm(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(0,a|0,b|0,+c,d|0,e|0)}function qn(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(1,a|0,b|0,+c,d|0,e|0)}function qo(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(2,a|0,b|0,+c,d|0,e|0)}function qp(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(3,a|0,b|0,+c,d|0,e|0)}function qq(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(4,a|0,b|0,+c,d|0,e|0)}function qr(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(5,a|0,b|0,+c,d|0,e|0)}function qs(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(6,a|0,b|0,+c,d|0,e|0)}function qt(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(7,a|0,b|0,+c,d|0,e|0)}function qu(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(8,a|0,b|0,+c,d|0,e|0)}function qv(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(9,a|0,b|0,+c,d|0,e|0)}function qw(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(10,a|0,b|0,+c,d|0,e|0)}function qx(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(11,a|0,b|0,+c,d|0,e|0)}function qy(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(12,a|0,b|0,+c,d|0,e|0)}function qz(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(13,a|0,b|0,+c,d|0,e|0)}function qA(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(14,a|0,b|0,+c,d|0,e|0)}function qB(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(15,a|0,b|0,+c,d|0,e|0)}function qC(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(16,a|0,b|0,+c,d|0,e|0)}function qD(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(17,a|0,b|0,+c,d|0,e|0)}function qE(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(18,a|0,b|0,+c,d|0,e|0)}function qF(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(19,a|0,b|0,+c,d|0,e|0)}function qG(a,b,c){a=a|0;b=b|0;c=+c;bq[a&2047](b|0,+c)}function qH(a,b){a=a|0;b=+b;ai(0,a|0,+b)}function qI(a,b){a=a|0;b=+b;ai(1,a|0,+b)}function qJ(a,b){a=a|0;b=+b;ai(2,a|0,+b)}function qK(a,b){a=a|0;b=+b;ai(3,a|0,+b)}function qL(a,b){a=a|0;b=+b;ai(4,a|0,+b)}function qM(a,b){a=a|0;b=+b;ai(5,a|0,+b)}function qN(a,b){a=a|0;b=+b;ai(6,a|0,+b)}function qO(a,b){a=a|0;b=+b;ai(7,a|0,+b)}function qP(a,b){a=a|0;b=+b;ai(8,a|0,+b)}function qQ(a,b){a=a|0;b=+b;ai(9,a|0,+b)}function qR(a,b){a=a|0;b=+b;ai(10,a|0,+b)}function qS(a,b){a=a|0;b=+b;ai(11,a|0,+b)}function qT(a,b){a=a|0;b=+b;ai(12,a|0,+b)}function qU(a,b){a=a|0;b=+b;ai(13,a|0,+b)}function qV(a,b){a=a|0;b=+b;ai(14,a|0,+b)}function qW(a,b){a=a|0;b=+b;ai(15,a|0,+b)}function qX(a,b){a=a|0;b=+b;ai(16,a|0,+b)}function qY(a,b){a=a|0;b=+b;ai(17,a|0,+b)}function qZ(a,b){a=a|0;b=+b;ai(18,a|0,+b)}function q_(a,b){a=a|0;b=+b;ai(19,a|0,+b)}function q$(a,b,c,d,e,f){a=a|0;b=b|0;c=+c;d=+d;e=e|0;f=+f;br[a&2047](b|0,+c,+d,e|0,+f)}function q0(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(0,a|0,+b,+c,d|0,+e)}function q1(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(1,a|0,+b,+c,d|0,+e)}function q2(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(2,a|0,+b,+c,d|0,+e)}function q3(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(3,a|0,+b,+c,d|0,+e)}function q4(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(4,a|0,+b,+c,d|0,+e)}function q5(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(5,a|0,+b,+c,d|0,+e)}function q6(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(6,a|0,+b,+c,d|0,+e)}function q7(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(7,a|0,+b,+c,d|0,+e)}function q8(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(8,a|0,+b,+c,d|0,+e)}function q9(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(9,a|0,+b,+c,d|0,+e)}function ra(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(10,a|0,+b,+c,d|0,+e)}function rb(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(11,a|0,+b,+c,d|0,+e)}function rc(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(12,a|0,+b,+c,d|0,+e)}function rd(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(13,a|0,+b,+c,d|0,+e)}function re(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(14,a|0,+b,+c,d|0,+e)}function rf(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(15,a|0,+b,+c,d|0,+e)}function rg(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(16,a|0,+b,+c,d|0,+e)}function rh(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(17,a|0,+b,+c,d|0,+e)}function ri(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(18,a|0,+b,+c,d|0,+e)}function rj(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(19,a|0,+b,+c,d|0,+e)}function rk(a,b){a=a|0;b=b|0;bs[a&2047](b|0)}function rl(a){a=a|0;ai(0,a|0)}function rm(a){a=a|0;ai(1,a|0)}function rn(a){a=a|0;ai(2,a|0)}function ro(a){a=a|0;ai(3,a|0)}function rp(a){a=a|0;ai(4,a|0)}function rq(a){a=a|0;ai(5,a|0)}function rr(a){a=a|0;ai(6,a|0)}function rs(a){a=a|0;ai(7,a|0)}function rt(a){a=a|0;ai(8,a|0)}function ru(a){a=a|0;ai(9,a|0)}function rv(a){a=a|0;ai(10,a|0)}function rw(a){a=a|0;ai(11,a|0)}function rx(a){a=a|0;ai(12,a|0)}function ry(a){a=a|0;ai(13,a|0)}function rz(a){a=a|0;ai(14,a|0)}function rA(a){a=a|0;ai(15,a|0)}function rB(a){a=a|0;ai(16,a|0)}function rC(a){a=a|0;ai(17,a|0)}function rD(a){a=a|0;ai(18,a|0)}function rE(a){a=a|0;ai(19,a|0)}function rF(a,b,c){a=a|0;b=b|0;c=c|0;bt[a&2047](b|0,c|0)}function rG(a,b){a=a|0;b=b|0;ai(0,a|0,b|0)}function rH(a,b){a=a|0;b=b|0;ai(1,a|0,b|0)}function rI(a,b){a=a|0;b=b|0;ai(2,a|0,b|0)}function rJ(a,b){a=a|0;b=b|0;ai(3,a|0,b|0)}function rK(a,b){a=a|0;b=b|0;ai(4,a|0,b|0)}function rL(a,b){a=a|0;b=b|0;ai(5,a|0,b|0)}function rM(a,b){a=a|0;b=b|0;ai(6,a|0,b|0)}function rN(a,b){a=a|0;b=b|0;ai(7,a|0,b|0)}function rO(a,b){a=a|0;b=b|0;ai(8,a|0,b|0)}function rP(a,b){a=a|0;b=b|0;ai(9,a|0,b|0)}function rQ(a,b){a=a|0;b=b|0;ai(10,a|0,b|0)}function rR(a,b){a=a|0;b=b|0;ai(11,a|0,b|0)}function rS(a,b){a=a|0;b=b|0;ai(12,a|0,b|0)}function rT(a,b){a=a|0;b=b|0;ai(13,a|0,b|0)}function rU(a,b){a=a|0;b=b|0;ai(14,a|0,b|0)}function rV(a,b){a=a|0;b=b|0;ai(15,a|0,b|0)}function rW(a,b){a=a|0;b=b|0;ai(16,a|0,b|0)}function rX(a,b){a=a|0;b=b|0;ai(17,a|0,b|0)}function rY(a,b){a=a|0;b=b|0;ai(18,a|0,b|0)}function rZ(a,b){a=a|0;b=b|0;ai(19,a|0,b|0)}function r_(a,b){a=a|0;b=b|0;return bu[a&2047](b|0)|0}function r$(a){a=a|0;return ai(0,a|0)|0}function r0(a){a=a|0;return ai(1,a|0)|0}function r1(a){a=a|0;return ai(2,a|0)|0}function r2(a){a=a|0;return ai(3,a|0)|0}function r3(a){a=a|0;return ai(4,a|0)|0}function r4(a){a=a|0;return ai(5,a|0)|0}function r5(a){a=a|0;return ai(6,a|0)|0}function r6(a){a=a|0;return ai(7,a|0)|0}function r7(a){a=a|0;return ai(8,a|0)|0}function r8(a){a=a|0;return ai(9,a|0)|0}function r9(a){a=a|0;return ai(10,a|0)|0}function sa(a){a=a|0;return ai(11,a|0)|0}function sb(a){a=a|0;return ai(12,a|0)|0}function sc(a){a=a|0;return ai(13,a|0)|0}function sd(a){a=a|0;return ai(14,a|0)|0}function se(a){a=a|0;return ai(15,a|0)|0}function sf(a){a=a|0;return ai(16,a|0)|0}function sg(a){a=a|0;return ai(17,a|0)|0}function sh(a){a=a|0;return ai(18,a|0)|0}function si(a){a=a|0;return ai(19,a|0)|0}function sj(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=+d;e=e|0;bv[a&2047](b|0,c|0,+d,e|0)}function sk(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(0,a|0,b|0,+c,d|0)}function sl(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(1,a|0,b|0,+c,d|0)}function sm(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(2,a|0,b|0,+c,d|0)}function sn(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(3,a|0,b|0,+c,d|0)}function so(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(4,a|0,b|0,+c,d|0)}function sp(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(5,a|0,b|0,+c,d|0)}function sq(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(6,a|0,b|0,+c,d|0)}function sr(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(7,a|0,b|0,+c,d|0)}function ss(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(8,a|0,b|0,+c,d|0)}function st(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(9,a|0,b|0,+c,d|0)}function su(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(10,a|0,b|0,+c,d|0)}function sv(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(11,a|0,b|0,+c,d|0)}function sw(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(12,a|0,b|0,+c,d|0)}function sx(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(13,a|0,b|0,+c,d|0)}function sy(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(14,a|0,b|0,+c,d|0)}function sz(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(15,a|0,b|0,+c,d|0)}function sA(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(16,a|0,b|0,+c,d|0)}function sB(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(17,a|0,b|0,+c,d|0)}function sC(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(18,a|0,b|0,+c,d|0)}function sD(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(19,a|0,b|0,+c,d|0)}function sE(a,b){a=a|0;b=+b;return bw[a&2047](+b)|0}function sF(a){a=+a;return ai(0,+a)|0}function sG(a){a=+a;return ai(1,+a)|0}function sH(a){a=+a;return ai(2,+a)|0}function sI(a){a=+a;return ai(3,+a)|0}function sJ(a){a=+a;return ai(4,+a)|0}function sK(a){a=+a;return ai(5,+a)|0}function sL(a){a=+a;return ai(6,+a)|0}function sM(a){a=+a;return ai(7,+a)|0}function sN(a){a=+a;return ai(8,+a)|0}function sO(a){a=+a;return ai(9,+a)|0}function sP(a){a=+a;return ai(10,+a)|0}function sQ(a){a=+a;return ai(11,+a)|0}function sR(a){a=+a;return ai(12,+a)|0}function sS(a){a=+a;return ai(13,+a)|0}function sT(a){a=+a;return ai(14,+a)|0}function sU(a){a=+a;return ai(15,+a)|0}function sV(a){a=+a;return ai(16,+a)|0}function sW(a){a=+a;return ai(17,+a)|0}function sX(a){a=+a;return ai(18,+a)|0}function sY(a){a=+a;return ai(19,+a)|0}function sZ(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return bx[a&2047](b|0,c|0,d|0,e|0,f|0)|0}function s_(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(0,a|0,b|0,c|0,d|0,e|0)|0}function s$(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(1,a|0,b|0,c|0,d|0,e|0)|0}function s0(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(2,a|0,b|0,c|0,d|0,e|0)|0}function s1(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(3,a|0,b|0,c|0,d|0,e|0)|0}function s2(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(4,a|0,b|0,c|0,d|0,e|0)|0}function s3(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(5,a|0,b|0,c|0,d|0,e|0)|0}function s4(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(6,a|0,b|0,c|0,d|0,e|0)|0}function s5(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(7,a|0,b|0,c|0,d|0,e|0)|0}function s6(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(8,a|0,b|0,c|0,d|0,e|0)|0}function s7(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(9,a|0,b|0,c|0,d|0,e|0)|0}function s8(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(10,a|0,b|0,c|0,d|0,e|0)|0}function s9(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(11,a|0,b|0,c|0,d|0,e|0)|0}function ta(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(12,a|0,b|0,c|0,d|0,e|0)|0}function tb(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(13,a|0,b|0,c|0,d|0,e|0)|0}function tc(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(14,a|0,b|0,c|0,d|0,e|0)|0}function td(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(15,a|0,b|0,c|0,d|0,e|0)|0}function te(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(16,a|0,b|0,c|0,d|0,e|0)|0}function tf(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(17,a|0,b|0,c|0,d|0,e|0)|0}function tg(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(18,a|0,b|0,c|0,d|0,e|0)|0}function th(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(19,a|0,b|0,c|0,d|0,e|0)|0}function ti(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return by[a&2047](b|0,c|0,d|0)|0}function tj(a,b,c){a=a|0;b=b|0;c=c|0;return ai(0,a|0,b|0,c|0)|0}function tk(a,b,c){a=a|0;b=b|0;c=c|0;return ai(1,a|0,b|0,c|0)|0}function tl(a,b,c){a=a|0;b=b|0;c=c|0;return ai(2,a|0,b|0,c|0)|0}function tm(a,b,c){a=a|0;b=b|0;c=c|0;return ai(3,a|0,b|0,c|0)|0}function tn(a,b,c){a=a|0;b=b|0;c=c|0;return ai(4,a|0,b|0,c|0)|0}function to(a,b,c){a=a|0;b=b|0;c=c|0;return ai(5,a|0,b|0,c|0)|0}function tp(a,b,c){a=a|0;b=b|0;c=c|0;return ai(6,a|0,b|0,c|0)|0}function tq(a,b,c){a=a|0;b=b|0;c=c|0;return ai(7,a|0,b|0,c|0)|0}function tr(a,b,c){a=a|0;b=b|0;c=c|0;return ai(8,a|0,b|0,c|0)|0}function ts(a,b,c){a=a|0;b=b|0;c=c|0;return ai(9,a|0,b|0,c|0)|0}function tt(a,b,c){a=a|0;b=b|0;c=c|0;return ai(10,a|0,b|0,c|0)|0}function tu(a,b,c){a=a|0;b=b|0;c=c|0;return ai(11,a|0,b|0,c|0)|0}function tv(a,b,c){a=a|0;b=b|0;c=c|0;return ai(12,a|0,b|0,c|0)|0}function tw(a,b,c){a=a|0;b=b|0;c=c|0;return ai(13,a|0,b|0,c|0)|0}function tx(a,b,c){a=a|0;b=b|0;c=c|0;return ai(14,a|0,b|0,c|0)|0}function ty(a,b,c){a=a|0;b=b|0;c=c|0;return ai(15,a|0,b|0,c|0)|0}function tz(a,b,c){a=a|0;b=b|0;c=c|0;return ai(16,a|0,b|0,c|0)|0}function tA(a,b,c){a=a|0;b=b|0;c=c|0;return ai(17,a|0,b|0,c|0)|0}function tB(a,b,c){a=a|0;b=b|0;c=c|0;return ai(18,a|0,b|0,c|0)|0}function tC(a,b,c){a=a|0;b=b|0;c=c|0;return ai(19,a|0,b|0,c|0)|0}function tD(a,b,c){a=a|0;b=b|0;c=+c;return+bz[a&2047](b|0,+c)}function tE(a,b){a=a|0;b=+b;return+ai(0,a|0,+b)}function tF(a,b){a=a|0;b=+b;return+ai(1,a|0,+b)}function tG(a,b){a=a|0;b=+b;return+ai(2,a|0,+b)}function tH(a,b){a=a|0;b=+b;return+ai(3,a|0,+b)}function tI(a,b){a=a|0;b=+b;return+ai(4,a|0,+b)}function tJ(a,b){a=a|0;b=+b;return+ai(5,a|0,+b)}function tK(a,b){a=a|0;b=+b;return+ai(6,a|0,+b)}function tL(a,b){a=a|0;b=+b;return+ai(7,a|0,+b)}function tM(a,b){a=a|0;b=+b;return+ai(8,a|0,+b)}function tN(a,b){a=a|0;b=+b;return+ai(9,a|0,+b)}function tO(a,b){a=a|0;b=+b;return+ai(10,a|0,+b)}function tP(a,b){a=a|0;b=+b;return+ai(11,a|0,+b)}function tQ(a,b){a=a|0;b=+b;return+ai(12,a|0,+b)}function tR(a,b){a=a|0;b=+b;return+ai(13,a|0,+b)}function tS(a,b){a=a|0;b=+b;return+ai(14,a|0,+b)}function tT(a,b){a=a|0;b=+b;return+ai(15,a|0,+b)}function tU(a,b){a=a|0;b=+b;return+ai(16,a|0,+b)}function tV(a,b){a=a|0;b=+b;return+ai(17,a|0,+b)}function tW(a,b){a=a|0;b=+b;return+ai(18,a|0,+b)}function tX(a,b){a=a|0;b=+b;return+ai(19,a|0,+b)}function tY(a,b,c,d){a=a|0;b=b|0;c=+c;d=+d;bA[a&2047](b|0,+c,+d)}function tZ(a,b,c){a=a|0;b=+b;c=+c;ai(0,a|0,+b,+c)}function t_(a,b,c){a=a|0;b=+b;c=+c;ai(1,a|0,+b,+c)}function t$(a,b,c){a=a|0;b=+b;c=+c;ai(2,a|0,+b,+c)}function t0(a,b,c){a=a|0;b=+b;c=+c;ai(3,a|0,+b,+c)}function t1(a,b,c){a=a|0;b=+b;c=+c;ai(4,a|0,+b,+c)}function t2(a,b,c){a=a|0;b=+b;c=+c;ai(5,a|0,+b,+c)}function t3(a,b,c){a=a|0;b=+b;c=+c;ai(6,a|0,+b,+c)}function t4(a,b,c){a=a|0;b=+b;c=+c;ai(7,a|0,+b,+c)}function t5(a,b,c){a=a|0;b=+b;c=+c;ai(8,a|0,+b,+c)}function t6(a,b,c){a=a|0;b=+b;c=+c;ai(9,a|0,+b,+c)}function t7(a,b,c){a=a|0;b=+b;c=+c;ai(10,a|0,+b,+c)}function t8(a,b,c){a=a|0;b=+b;c=+c;ai(11,a|0,+b,+c)}function t9(a,b,c){a=a|0;b=+b;c=+c;ai(12,a|0,+b,+c)}function ua(a,b,c){a=a|0;b=+b;c=+c;ai(13,a|0,+b,+c)}function ub(a,b,c){a=a|0;b=+b;c=+c;ai(14,a|0,+b,+c)}function uc(a,b,c){a=a|0;b=+b;c=+c;ai(15,a|0,+b,+c)}function ud(a,b,c){a=a|0;b=+b;c=+c;ai(16,a|0,+b,+c)}function ue(a,b,c){a=a|0;b=+b;c=+c;ai(17,a|0,+b,+c)}function uf(a,b,c){a=a|0;b=+b;c=+c;ai(18,a|0,+b,+c)}function ug(a,b,c){a=a|0;b=+b;c=+c;ai(19,a|0,+b,+c)}function uh(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=+i;bB[a&2047](b|0,c|0,d|0,e|0,f|0,g|0,h|0,+i)}function ui(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(0,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function uj(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(1,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function uk(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(2,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function ul(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(3,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function um(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(4,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function un(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(5,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function uo(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(6,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function up(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(7,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function uq(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(8,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function ur(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(9,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function us(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(10,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function ut(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(11,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function uu(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(12,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function uv(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(13,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function uw(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(14,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function ux(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(15,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function uy(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(16,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function uz(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(17,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function uA(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(18,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function uB(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(19,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function uC(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=+d;e=+e;bC[a&2047](b|0,+c,+d,+e)}function uD(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(0,a|0,+b,+c,+d)}function uE(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(1,a|0,+b,+c,+d)}function uF(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(2,a|0,+b,+c,+d)}function uG(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(3,a|0,+b,+c,+d)}function uH(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(4,a|0,+b,+c,+d)}function uI(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(5,a|0,+b,+c,+d)}function uJ(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(6,a|0,+b,+c,+d)}function uK(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(7,a|0,+b,+c,+d)}function uL(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(8,a|0,+b,+c,+d)}function uM(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(9,a|0,+b,+c,+d)}function uN(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(10,a|0,+b,+c,+d)}function uO(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(11,a|0,+b,+c,+d)}function uP(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(12,a|0,+b,+c,+d)}function uQ(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(13,a|0,+b,+c,+d)}function uR(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(14,a|0,+b,+c,+d)}function uS(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(15,a|0,+b,+c,+d)}function uT(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(16,a|0,+b,+c,+d)}function uU(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(17,a|0,+b,+c,+d)}function uV(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(18,a|0,+b,+c,+d)}function uW(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(19,a|0,+b,+c,+d)}function uX(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;bD[a&2047](b|0,c|0,d|0,e|0,f|0,g|0)}function uY(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(0,a|0,b|0,c|0,d|0,e|0,f|0)}function uZ(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(1,a|0,b|0,c|0,d|0,e|0,f|0)}function u_(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(2,a|0,b|0,c|0,d|0,e|0,f|0)}function u$(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(3,a|0,b|0,c|0,d|0,e|0,f|0)}function u0(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(4,a|0,b|0,c|0,d|0,e|0,f|0)}function u1(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(5,a|0,b|0,c|0,d|0,e|0,f|0)}function u2(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(6,a|0,b|0,c|0,d|0,e|0,f|0)}function u3(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(7,a|0,b|0,c|0,d|0,e|0,f|0)}function u4(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(8,a|0,b|0,c|0,d|0,e|0,f|0)}function u5(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(9,a|0,b|0,c|0,d|0,e|0,f|0)}function u6(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(10,a|0,b|0,c|0,d|0,e|0,f|0)}function u7(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(11,a|0,b|0,c|0,d|0,e|0,f|0)}function u8(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(12,a|0,b|0,c|0,d|0,e|0,f|0)}function u9(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(13,a|0,b|0,c|0,d|0,e|0,f|0)}function va(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(14,a|0,b|0,c|0,d|0,e|0,f|0)}function vb(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(15,a|0,b|0,c|0,d|0,e|0,f|0)}function vc(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(16,a|0,b|0,c|0,d|0,e|0,f|0)}function vd(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(17,a|0,b|0,c|0,d|0,e|0,f|0)}function ve(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(18,a|0,b|0,c|0,d|0,e|0,f|0)}function vf(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(19,a|0,b|0,c|0,d|0,e|0,f|0)}function vg(a,b,c,d){a=a|0;b=b|0;c=c|0;d=+d;return bE[a&2047](b|0,c|0,+d)|0}function vh(a,b,c){a=a|0;b=b|0;c=+c;return ai(0,a|0,b|0,+c)|0}function vi(a,b,c){a=a|0;b=b|0;c=+c;return ai(1,a|0,b|0,+c)|0}function vj(a,b,c){a=a|0;b=b|0;c=+c;return ai(2,a|0,b|0,+c)|0}function vk(a,b,c){a=a|0;b=b|0;c=+c;return ai(3,a|0,b|0,+c)|0}function vl(a,b,c){a=a|0;b=b|0;c=+c;return ai(4,a|0,b|0,+c)|0}function vm(a,b,c){a=a|0;b=b|0;c=+c;return ai(5,a|0,b|0,+c)|0}function vn(a,b,c){a=a|0;b=b|0;c=+c;return ai(6,a|0,b|0,+c)|0}function vo(a,b,c){a=a|0;b=b|0;c=+c;return ai(7,a|0,b|0,+c)|0}function vp(a,b,c){a=a|0;b=b|0;c=+c;return ai(8,a|0,b|0,+c)|0}function vq(a,b,c){a=a|0;b=b|0;c=+c;return ai(9,a|0,b|0,+c)|0}function vr(a,b,c){a=a|0;b=b|0;c=+c;return ai(10,a|0,b|0,+c)|0}function vs(a,b,c){a=a|0;b=b|0;c=+c;return ai(11,a|0,b|0,+c)|0}function vt(a,b,c){a=a|0;b=b|0;c=+c;return ai(12,a|0,b|0,+c)|0}function vu(a,b,c){a=a|0;b=b|0;c=+c;return ai(13,a|0,b|0,+c)|0}function vv(a,b,c){a=a|0;b=b|0;c=+c;return ai(14,a|0,b|0,+c)|0}function vw(a,b,c){a=a|0;b=b|0;c=+c;return ai(15,a|0,b|0,+c)|0}function vx(a,b,c){a=a|0;b=b|0;c=+c;return ai(16,a|0,b|0,+c)|0}function vy(a,b,c){a=a|0;b=b|0;c=+c;return ai(17,a|0,b|0,+c)|0}function vz(a,b,c){a=a|0;b=b|0;c=+c;return ai(18,a|0,b|0,+c)|0}function vA(a,b,c){a=a|0;b=b|0;c=+c;return ai(19,a|0,b|0,+c)|0}function vB(a,b,c){a=a|0;b=b|0;c=+c;return bF[a&2047](b|0,+c)|0}function vC(a,b){a=a|0;b=+b;return ai(0,a|0,+b)|0}function vD(a,b){a=a|0;b=+b;return ai(1,a|0,+b)|0}function vE(a,b){a=a|0;b=+b;return ai(2,a|0,+b)|0}function vF(a,b){a=a|0;b=+b;return ai(3,a|0,+b)|0}function vG(a,b){a=a|0;b=+b;return ai(4,a|0,+b)|0}function vH(a,b){a=a|0;b=+b;return ai(5,a|0,+b)|0}function vI(a,b){a=a|0;b=+b;return ai(6,a|0,+b)|0}function vJ(a,b){a=a|0;b=+b;return ai(7,a|0,+b)|0}function vK(a,b){a=a|0;b=+b;return ai(8,a|0,+b)|0}function vL(a,b){a=a|0;b=+b;return ai(9,a|0,+b)|0}function vM(a,b){a=a|0;b=+b;return ai(10,a|0,+b)|0}function vN(a,b){a=a|0;b=+b;return ai(11,a|0,+b)|0}function vO(a,b){a=a|0;b=+b;return ai(12,a|0,+b)|0}function vP(a,b){a=a|0;b=+b;return ai(13,a|0,+b)|0}function vQ(a,b){a=a|0;b=+b;return ai(14,a|0,+b)|0}function vR(a,b){a=a|0;b=+b;return ai(15,a|0,+b)|0}function vS(a,b){a=a|0;b=+b;return ai(16,a|0,+b)|0}function vT(a,b){a=a|0;b=+b;return ai(17,a|0,+b)|0}function vU(a,b){a=a|0;b=+b;return ai(18,a|0,+b)|0}function vV(a,b){a=a|0;b=+b;return ai(19,a|0,+b)|0}function vW(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;bG[a&2047](b|0,+c,d|0,e|0)}function vX(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(0,a|0,+b,c|0,d|0)}function vY(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(1,a|0,+b,c|0,d|0)}function vZ(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(2,a|0,+b,c|0,d|0)}function v_(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(3,a|0,+b,c|0,d|0)}function v$(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(4,a|0,+b,c|0,d|0)}function v0(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(5,a|0,+b,c|0,d|0)}function v1(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(6,a|0,+b,c|0,d|0)}function v2(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(7,a|0,+b,c|0,d|0)}function v3(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(8,a|0,+b,c|0,d|0)}function v4(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(9,a|0,+b,c|0,d|0)}function v5(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(10,a|0,+b,c|0,d|0)}function v6(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(11,a|0,+b,c|0,d|0)}function v7(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(12,a|0,+b,c|0,d|0)}function v8(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(13,a|0,+b,c|0,d|0)}function v9(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(14,a|0,+b,c|0,d|0)}function wa(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(15,a|0,+b,c|0,d|0)}function wb(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(16,a|0,+b,c|0,d|0)}function wc(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(17,a|0,+b,c|0,d|0)}function wd(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(18,a|0,+b,c|0,d|0)}function we(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(19,a|0,+b,c|0,d|0)}function wf(a,b){a=a|0;b=b|0;return+bH[a&2047](b|0)}function wg(a){a=a|0;return+ai(0,a|0)}function wh(a){a=a|0;return+ai(1,a|0)}function wi(a){a=a|0;return+ai(2,a|0)}function wj(a){a=a|0;return+ai(3,a|0)}function wk(a){a=a|0;return+ai(4,a|0)}function wl(a){a=a|0;return+ai(5,a|0)}function wm(a){a=a|0;return+ai(6,a|0)}function wn(a){a=a|0;return+ai(7,a|0)}function wo(a){a=a|0;return+ai(8,a|0)}function wp(a){a=a|0;return+ai(9,a|0)}function wq(a){a=a|0;return+ai(10,a|0)}function wr(a){a=a|0;return+ai(11,a|0)}function ws(a){a=a|0;return+ai(12,a|0)}function wt(a){a=a|0;return+ai(13,a|0)}function wu(a){a=a|0;return+ai(14,a|0)}function wv(a){a=a|0;return+ai(15,a|0)}function ww(a){a=a|0;return+ai(16,a|0)}function wx(a){a=a|0;return+ai(17,a|0)}function wy(a){a=a|0;return+ai(18,a|0)}function wz(a){a=a|0;return+ai(19,a|0)}function wA(a,b,c){a=a|0;b=b|0;c=c|0;return bI[a&2047](b|0,c|0)|0}function wB(a,b){a=a|0;b=b|0;return ai(0,a|0,b|0)|0}function wC(a,b){a=a|0;b=b|0;return ai(1,a|0,b|0)|0}function wD(a,b){a=a|0;b=b|0;return ai(2,a|0,b|0)|0}function wE(a,b){a=a|0;b=b|0;return ai(3,a|0,b|0)|0}function wF(a,b){a=a|0;b=b|0;return ai(4,a|0,b|0)|0}function wG(a,b){a=a|0;b=b|0;return ai(5,a|0,b|0)|0}function wH(a,b){a=a|0;b=b|0;return ai(6,a|0,b|0)|0}function wI(a,b){a=a|0;b=b|0;return ai(7,a|0,b|0)|0}function wJ(a,b){a=a|0;b=b|0;return ai(8,a|0,b|0)|0}function wK(a,b){a=a|0;b=b|0;return ai(9,a|0,b|0)|0}function wL(a,b){a=a|0;b=b|0;return ai(10,a|0,b|0)|0}function wM(a,b){a=a|0;b=b|0;return ai(11,a|0,b|0)|0}function wN(a,b){a=a|0;b=b|0;return ai(12,a|0,b|0)|0}function wO(a,b){a=a|0;b=b|0;return ai(13,a|0,b|0)|0}function wP(a,b){a=a|0;b=b|0;return ai(14,a|0,b|0)|0}function wQ(a,b){a=a|0;b=b|0;return ai(15,a|0,b|0)|0}function wR(a,b){a=a|0;b=b|0;return ai(16,a|0,b|0)|0}function wS(a,b){a=a|0;b=b|0;return ai(17,a|0,b|0)|0}function wT(a,b){a=a|0;b=b|0;return ai(18,a|0,b|0)|0}function wU(a,b){a=a|0;b=b|0;return ai(19,a|0,b|0)|0}function wV(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;return+bJ[a&2047](b|0,c|0,d|0,e|0,+f)}function wW(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(0,a|0,b|0,c|0,d|0,+e)}function wX(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(1,a|0,b|0,c|0,d|0,+e)}function wY(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(2,a|0,b|0,c|0,d|0,+e)}function wZ(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(3,a|0,b|0,c|0,d|0,+e)}function w_(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(4,a|0,b|0,c|0,d|0,+e)}function w$(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(5,a|0,b|0,c|0,d|0,+e)}function w0(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(6,a|0,b|0,c|0,d|0,+e)}function w1(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(7,a|0,b|0,c|0,d|0,+e)}function w2(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(8,a|0,b|0,c|0,d|0,+e)}function w3(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(9,a|0,b|0,c|0,d|0,+e)}function w4(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(10,a|0,b|0,c|0,d|0,+e)}function w5(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(11,a|0,b|0,c|0,d|0,+e)}function w6(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(12,a|0,b|0,c|0,d|0,+e)}function w7(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(13,a|0,b|0,c|0,d|0,+e)}function w8(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(14,a|0,b|0,c|0,d|0,+e)}function w9(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(15,a|0,b|0,c|0,d|0,+e)}function xa(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(16,a|0,b|0,c|0,d|0,+e)}function xb(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(17,a|0,b|0,c|0,d|0,+e)}function xc(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(18,a|0,b|0,c|0,d|0,+e)}function xd(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(19,a|0,b|0,c|0,d|0,+e)}function xe(a){a=a|0;return bK[a&2047]()|0}function xf(){return ai(0)|0}function xg(){return ai(1)|0}function xh(){return ai(2)|0}function xi(){return ai(3)|0}function xj(){return ai(4)|0}function xk(){return ai(5)|0}function xl(){return ai(6)|0}function xm(){return ai(7)|0}function xn(){return ai(8)|0}function xo(){return ai(9)|0}function xp(){return ai(10)|0}function xq(){return ai(11)|0}function xr(){return ai(12)|0}function xs(){return ai(13)|0}function xt(){return ai(14)|0}function xu(){return ai(15)|0}function xv(){return ai(16)|0}function xw(){return ai(17)|0}function xx(){return ai(18)|0}function xy(){return ai(19)|0}function xz(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return bL[a&2047](b|0,c|0,d|0,e|0)|0}function xA(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(0,a|0,b|0,c|0,d|0)|0}function xB(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(1,a|0,b|0,c|0,d|0)|0}function xC(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(2,a|0,b|0,c|0,d|0)|0}function xD(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(3,a|0,b|0,c|0,d|0)|0}function xE(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(4,a|0,b|0,c|0,d|0)|0}function xF(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(5,a|0,b|0,c|0,d|0)|0}function xG(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(6,a|0,b|0,c|0,d|0)|0}function xH(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(7,a|0,b|0,c|0,d|0)|0}function xI(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(8,a|0,b|0,c|0,d|0)|0}function xJ(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(9,a|0,b|0,c|0,d|0)|0}function xK(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(10,a|0,b|0,c|0,d|0)|0}function xL(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(11,a|0,b|0,c|0,d|0)|0}function xM(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(12,a|0,b|0,c|0,d|0)|0}function xN(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(13,a|0,b|0,c|0,d|0)|0}function xO(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(14,a|0,b|0,c|0,d|0)|0}function xP(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(15,a|0,b|0,c|0,d|0)|0}function xQ(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(16,a|0,b|0,c|0,d|0)|0}function xR(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(17,a|0,b|0,c|0,d|0)|0}function xS(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(18,a|0,b|0,c|0,d|0)|0}function xT(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(19,a|0,b|0,c|0,d|0)|0}function xU(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;return bM[a&2047](+b,+c,+d)|0}function xV(a,b,c){a=+a;b=+b;c=+c;return ai(0,+a,+b,+c)|0}function xW(a,b,c){a=+a;b=+b;c=+c;return ai(1,+a,+b,+c)|0}function xX(a,b,c){a=+a;b=+b;c=+c;return ai(2,+a,+b,+c)|0}function xY(a,b,c){a=+a;b=+b;c=+c;return ai(3,+a,+b,+c)|0}function xZ(a,b,c){a=+a;b=+b;c=+c;return ai(4,+a,+b,+c)|0}function x_(a,b,c){a=+a;b=+b;c=+c;return ai(5,+a,+b,+c)|0}function x$(a,b,c){a=+a;b=+b;c=+c;return ai(6,+a,+b,+c)|0}function x0(a,b,c){a=+a;b=+b;c=+c;return ai(7,+a,+b,+c)|0}function x1(a,b,c){a=+a;b=+b;c=+c;return ai(8,+a,+b,+c)|0}function x2(a,b,c){a=+a;b=+b;c=+c;return ai(9,+a,+b,+c)|0}function x3(a,b,c){a=+a;b=+b;c=+c;return ai(10,+a,+b,+c)|0}function x4(a,b,c){a=+a;b=+b;c=+c;return ai(11,+a,+b,+c)|0}function x5(a,b,c){a=+a;b=+b;c=+c;return ai(12,+a,+b,+c)|0}function x6(a,b,c){a=+a;b=+b;c=+c;return ai(13,+a,+b,+c)|0}function x7(a,b,c){a=+a;b=+b;c=+c;return ai(14,+a,+b,+c)|0}function x8(a,b,c){a=+a;b=+b;c=+c;return ai(15,+a,+b,+c)|0}function x9(a,b,c){a=+a;b=+b;c=+c;return ai(16,+a,+b,+c)|0}function ya(a,b,c){a=+a;b=+b;c=+c;return ai(17,+a,+b,+c)|0}function yb(a,b,c){a=+a;b=+b;c=+c;return ai(18,+a,+b,+c)|0}function yc(a,b,c){a=+a;b=+b;c=+c;return ai(19,+a,+b,+c)|0}function yd(a,b,c){a=a|0;b=+b;c=+c;return bN[a&2047](+b,+c)|0}function ye(a,b){a=+a;b=+b;return ai(0,+a,+b)|0}function yf(a,b){a=+a;b=+b;return ai(1,+a,+b)|0}function yg(a,b){a=+a;b=+b;return ai(2,+a,+b)|0}function yh(a,b){a=+a;b=+b;return ai(3,+a,+b)|0}function yi(a,b){a=+a;b=+b;return ai(4,+a,+b)|0}function yj(a,b){a=+a;b=+b;return ai(5,+a,+b)|0}function yk(a,b){a=+a;b=+b;return ai(6,+a,+b)|0}function yl(a,b){a=+a;b=+b;return ai(7,+a,+b)|0}function ym(a,b){a=+a;b=+b;return ai(8,+a,+b)|0}function yn(a,b){a=+a;b=+b;return ai(9,+a,+b)|0}function yo(a,b){a=+a;b=+b;return ai(10,+a,+b)|0}function yp(a,b){a=+a;b=+b;return ai(11,+a,+b)|0}function yq(a,b){a=+a;b=+b;return ai(12,+a,+b)|0}function yr(a,b){a=+a;b=+b;return ai(13,+a,+b)|0}function ys(a,b){a=+a;b=+b;return ai(14,+a,+b)|0}function yt(a,b){a=+a;b=+b;return ai(15,+a,+b)|0}function yu(a,b){a=+a;b=+b;return ai(16,+a,+b)|0}function yv(a,b){a=+a;b=+b;return ai(17,+a,+b)|0}function yw(a,b){a=+a;b=+b;return ai(18,+a,+b)|0}function yx(a,b){a=+a;b=+b;return ai(19,+a,+b)|0}function yy(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;bO[a&2047](b|0,c|0,d|0)}function yz(a,b,c){a=a|0;b=b|0;c=c|0;ai(0,a|0,b|0,c|0)}function yA(a,b,c){a=a|0;b=b|0;c=c|0;ai(1,a|0,b|0,c|0)}function yB(a,b,c){a=a|0;b=b|0;c=c|0;ai(2,a|0,b|0,c|0)}function yC(a,b,c){a=a|0;b=b|0;c=c|0;ai(3,a|0,b|0,c|0)}function yD(a,b,c){a=a|0;b=b|0;c=c|0;ai(4,a|0,b|0,c|0)}function yE(a,b,c){a=a|0;b=b|0;c=c|0;ai(5,a|0,b|0,c|0)}function yF(a,b,c){a=a|0;b=b|0;c=c|0;ai(6,a|0,b|0,c|0)}function yG(a,b,c){a=a|0;b=b|0;c=c|0;ai(7,a|0,b|0,c|0)}function yH(a,b,c){a=a|0;b=b|0;c=c|0;ai(8,a|0,b|0,c|0)}function yI(a,b,c){a=a|0;b=b|0;c=c|0;ai(9,a|0,b|0,c|0)}function yJ(a,b,c){a=a|0;b=b|0;c=c|0;ai(10,a|0,b|0,c|0)}function yK(a,b,c){a=a|0;b=b|0;c=c|0;ai(11,a|0,b|0,c|0)}function yL(a,b,c){a=a|0;b=b|0;c=c|0;ai(12,a|0,b|0,c|0)}function yM(a,b,c){a=a|0;b=b|0;c=c|0;ai(13,a|0,b|0,c|0)}function yN(a,b,c){a=a|0;b=b|0;c=c|0;ai(14,a|0,b|0,c|0)}function yO(a,b,c){a=a|0;b=b|0;c=c|0;ai(15,a|0,b|0,c|0)}function yP(a,b,c){a=a|0;b=b|0;c=c|0;ai(16,a|0,b|0,c|0)}function yQ(a,b,c){a=a|0;b=b|0;c=c|0;ai(17,a|0,b|0,c|0)}function yR(a,b,c){a=a|0;b=b|0;c=c|0;ai(18,a|0,b|0,c|0)}function yS(a,b,c){a=a|0;b=b|0;c=c|0;ai(19,a|0,b|0,c|0)}function yT(a){a=a|0;bP[a&2047]()}function yU(){ai(0)}function yV(){ai(1)}function yW(){ai(2)}function yX(){ai(3)}function yY(){ai(4)}function yZ(){ai(5)}function y_(){ai(6)}function y$(){ai(7)}function y0(){ai(8)}function y1(){ai(9)}function y2(){ai(10)}function y3(){ai(11)}function y4(){ai(12)}function y5(){ai(13)}function y6(){ai(14)}function y7(){ai(15)}function y8(){ai(16)}function y9(){ai(17)}function za(){ai(18)}function zb(){ai(19)}function zc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=+d;bQ[a&2047](b|0,c|0,+d)}function zd(a,b,c){a=a|0;b=b|0;c=+c;ai(0,a|0,b|0,+c)}function ze(a,b,c){a=a|0;b=b|0;c=+c;ai(1,a|0,b|0,+c)}function zf(a,b,c){a=a|0;b=b|0;c=+c;ai(2,a|0,b|0,+c)}function zg(a,b,c){a=a|0;b=b|0;c=+c;ai(3,a|0,b|0,+c)}function zh(a,b,c){a=a|0;b=b|0;c=+c;ai(4,a|0,b|0,+c)}function zi(a,b,c){a=a|0;b=b|0;c=+c;ai(5,a|0,b|0,+c)}function zj(a,b,c){a=a|0;b=b|0;c=+c;ai(6,a|0,b|0,+c)}function zk(a,b,c){a=a|0;b=b|0;c=+c;ai(7,a|0,b|0,+c)}function zl(a,b,c){a=a|0;b=b|0;c=+c;ai(8,a|0,b|0,+c)}function zm(a,b,c){a=a|0;b=b|0;c=+c;ai(9,a|0,b|0,+c)}function zn(a,b,c){a=a|0;b=b|0;c=+c;ai(10,a|0,b|0,+c)}function zo(a,b,c){a=a|0;b=b|0;c=+c;ai(11,a|0,b|0,+c)}function zp(a,b,c){a=a|0;b=b|0;c=+c;ai(12,a|0,b|0,+c)}function zq(a,b,c){a=a|0;b=b|0;c=+c;ai(13,a|0,b|0,+c)}function zr(a,b,c){a=a|0;b=b|0;c=+c;ai(14,a|0,b|0,+c)}function zs(a,b,c){a=a|0;b=b|0;c=+c;ai(15,a|0,b|0,+c)}function zt(a,b,c){a=a|0;b=b|0;c=+c;ai(16,a|0,b|0,+c)}function zu(a,b,c){a=a|0;b=b|0;c=+c;ai(17,a|0,b|0,+c)}function zv(a,b,c){a=a|0;b=b|0;c=+c;ai(18,a|0,b|0,+c)}function zw(a,b,c){a=a|0;b=b|0;c=+c;ai(19,a|0,b|0,+c)}function zx(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;bR[a&2047](b|0,c|0,d|0,e|0)}function zy(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(0,a|0,b|0,c|0,d|0)}function zz(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(1,a|0,b|0,c|0,d|0)}function zA(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(2,a|0,b|0,c|0,d|0)}function zB(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(3,a|0,b|0,c|0,d|0)}function zC(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(4,a|0,b|0,c|0,d|0)}function zD(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(5,a|0,b|0,c|0,d|0)}function zE(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(6,a|0,b|0,c|0,d|0)}function zF(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(7,a|0,b|0,c|0,d|0)}function zG(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(8,a|0,b|0,c|0,d|0)}function zH(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(9,a|0,b|0,c|0,d|0)}function zI(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(10,a|0,b|0,c|0,d|0)}function zJ(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(11,a|0,b|0,c|0,d|0)}function zK(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(12,a|0,b|0,c|0,d|0)}function zL(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(13,a|0,b|0,c|0,d|0)}function zM(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(14,a|0,b|0,c|0,d|0)}function zN(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(15,a|0,b|0,c|0,d|0)}function zO(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(16,a|0,b|0,c|0,d|0)}function zP(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(17,a|0,b|0,c|0,d|0)}function zQ(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(18,a|0,b|0,c|0,d|0)}function zR(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(19,a|0,b|0,c|0,d|0)}function zS(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ab(0)}function zT(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ab(1)}function zU(a,b){a=a|0;b=+b;ab(2)}function zV(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ab(3)}function zW(a){a=a|0;ab(4)}function zX(a,b){a=a|0;b=b|0;ab(5)}function zY(a){a=a|0;ab(6);return 0}function zZ(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ab(7)}function z_(a){a=+a;ab(8);return 0}function z$(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ab(9);return 0}function z0(a,b,c){a=a|0;b=b|0;c=c|0;ab(10);return 0}function z1(a,b){a=a|0;b=+b;ab(11);return 0.0}function z2(a,b,c){a=a|0;b=+b;c=+c;ab(12)}function z3(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ab(13)}function z4(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ab(14)}function z5(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ab(15)}function z6(a,b,c){a=a|0;b=b|0;c=+c;ab(16);return 0}function z7(a,b){a=a|0;b=+b;ab(17);return 0}function z8(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ab(18)}function z9(a){a=a|0;ab(19);return 0.0}function Aa(a,b){a=a|0;b=b|0;ab(20);return 0}function Ab(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;ab(21);return 0.0}function Ac(){ab(22);return 0}function Ad(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ab(23);return 0}function Ae(a,b,c){a=+a;b=+b;c=+c;ab(24);return 0}function Af(a,b){a=+a;b=+b;ab(25);return 0}function Ag(a,b,c){a=a|0;b=b|0;c=c|0;ab(26)}function Ah(){ab(27)}function Ai(a,b,c){a=a|0;b=b|0;c=+c;ab(28)}function Aj(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ab(29)}
// EMSCRIPTEN_END_FUNCS
var bo=[zS,zS,p1,zS,p2,zS,p3,zS,p4,zS,p5,zS,p6,zS,p7,zS,p8,zS,p9,zS,qa,zS,qb,zS,qc,zS,qd,zS,qe,zS,qf,zS,qg,zS,qh,zS,qi,zS,qj,zS,qk,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,nz,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,pC,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,pO,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,pA,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,mK,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS,zS];var bp=[zT,zT,qm,zT,qn,zT,qo,zT,qp,zT,qq,zT,qr,zT,qs,zT,qt,zT,qu,zT,qv,zT,qw,zT,qx,zT,qy,zT,qz,zT,qA,zT,qB,zT,qC,zT,qD,zT,qE,zT,qF,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,ik,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT,zT];var bq=[zU,zU,qH,zU,qI,zU,qJ,zU,qK,zU,qL,zU,qM,zU,qN,zU,qO,zU,qP,zU,qQ,zU,qR,zU,qS,zU,qT,zU,qU,zU,qV,zU,qW,zU,qX,zU,qY,zU,qZ,zU,q_,zU,zU,zU,zU,zU,gA,zU,zU,zU,zU,zU,zU,zU,pe,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,ny,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,mH,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,jV,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,mL,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,mW,zU,me,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,n5,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,jI,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,mJ,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,j7,zU,zU,zU,zU,zU,mt,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,k8,zU,zU,zU,jM,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,mS,zU,zU,zU,zU,zU,mu,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,mg,zU,zU,zU,zU,zU,n0,zU,zU,zU,nM,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,iI,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,ou,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,ot,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,jy,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,nI,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,no,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,oH,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,m2,zU,zU,zU,zU,zU,zU,zU,nN,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,la,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,jW,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,m_,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,oF,zU,zU,zU,zU,zU,lJ,zU,zU,zU,zU,zU,zU,zU,zU,zU,pd,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,jQ,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,lp,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,hF,zU,zU,zU,zU,zU,zU,zU,zU,zU,nF,zU,zU,zU,zU,zU,zU,zU,zU,zU,lC,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,oN,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,on,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,j4,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,l9,zU,oC,zU,zU,zU,zU,zU,zU,zU,zU,zU,oz,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,n6,zU,zU,zU,zU,zU,zU,zU,zU,zU,lF,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,kX,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,mO,zU,mz,zU,nK,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,iA,zU,zU,zU,zU,zU,zU,zU,zU,zU,gF,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,kR,zU,gy,zU,zU,zU,zU,zU,l8,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,nA,zU,lt,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,py,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,ph,zU,zU,zU,zU,zU,lx,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,ll,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU,zU];var br=[zV,zV,q0,zV,q1,zV,q2,zV,q3,zV,q4,zV,q5,zV,q6,zV,q7,zV,q8,zV,q9,zV,ra,zV,rb,zV,rc,zV,rd,zV,re,zV,rf,zV,rg,zV,rh,zV,ri,zV,rj,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,ke,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV,zV];var bs=[zW,zW,rl,zW,rm,zW,rn,zW,ro,zW,rp,zW,rq,zW,rr,zW,rs,zW,rt,zW,ru,zW,rv,zW,rw,zW,rx,zW,ry,zW,rz,zW,rA,zW,rB,zW,rC,zW,rD,zW,rE,zW,gg,zW,zW,zW,zW,zW,jl,zW,zW,zW,zW,zW,zW,zW,zW,zW,fy,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,fd,zW,zW,zW,jg,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,iW,zW,fO,zW,zW,zW,zW,zW,cX,zW,eP,zW,pD,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,lS,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,fV,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,g7,zW,zW,zW,zW,zW,zW,zW,em,zW,zW,zW,pV,zW,zW,zW,cD,zW,zW,zW,f4,zW,zW,zW,zW,zW,zW,zW,h7,zW,oS,zW,zW,zW,zW,zW,zW,zW,zW,zW,iT,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,fc,zW,zW,zW,zW,zW,na,zW,zW,zW,zW,zW,zW,zW,zW,zW,lP,zW,zW,zW,dT,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,eL,zW,zW,zW,zW,zW,zW,zW,fJ,zW,fK,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,eY,zW,mX,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,e8,zW,cA,zW,zW,zW,zW,zW,zW,zW,zW,zW,dd,zW,zW,zW,zW,zW,cU,zW,zW,zW,gW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,i_,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,f6,zW,zW,zW,zW,zW,zW,zW,pb,zW,zW,zW,zW,zW,lZ,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,ng,zW,d4,zW,zW,zW,zW,zW,fr,zW,zW,zW,zW,zW,zW,zW,zW,zW,cF,zW,iZ,zW,zW,zW,jO,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,nu,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,hs,zW,iO,zW,zW,zW,zW,zW,dy,zW,oX,zW,d6,zW,zW,zW,zW,zW,zW,zW,zW,zW,gd,zW,eZ,zW,l0,zW,kj,zW,zW,zW,zW,zW,jh,zW,zW,zW,zW,zW,zW,zW,zW,zW,fz,zW,zW,zW,zW,zW,zW,zW,zW,zW,l7,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,nm,zW,ew,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,c_,zW,de,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,ee,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,iq,zW,zW,zW,el,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,gR,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,i4,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,g3,zW,zW,zW,md,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,pU,zW,e7,zW,zW,zW,zW,zW,zW,zW,zW,zW,e9,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,m8,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,c5,zW,zW,zW,zW,zW,zW,zW,zW,zW,h_,zW,pK,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,es,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,pc,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,d5,zW,zW,zW,zW,zW,ks,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,dS,zW,zW,zW,zW,zW,zW,zW,om,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,o1,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,pH,zW,h9,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,lX,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,dY,zW,zW,zW,zW,zW,zW,zW,zW,zW,ea,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,pF,zW,d0,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,fL,zW,cz,zW,zW,zW,zW,zW,zW,zW,zW,zW,g1,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,oZ,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,h6,zW,zW,zW,zW,zW,zW,zW,kF,zW,zW,zW,zW,zW,gV,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,o6,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,fZ,zW,zW,zW,pa,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,fn,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,iK,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,o4,zW,zW,zW,zW,zW,eA,zW,zW,zW,zW,zW,zW,zW,zW,zW,eR,zW,zW,zW,zW,zW,zW,zW,zW,zW,eB,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,gc,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,eO,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,e1,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,nn,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,gQ,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,oU,zW,ni,zW,zW,zW,zW,zW,zW,zW,zW,zW,ek,zW,o8,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,ff,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,pJ,zW,zW,zW,eD,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,gU,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,fW,zW,f3,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,fo,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW,zW];var bt=[zX,zX,rG,zX,rH,zX,rI,zX,rJ,zX,rK,zX,rL,zX,rM,zX,rN,zX,rO,zX,rP,zX,rQ,zX,rR,zX,rS,zX,rT,zX,rU,zX,rV,zX,rW,zX,rX,zX,rY,zX,rZ,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,fq,zX,zX,zX,k_,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,l6,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,iX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,g4,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,ob,zX,zX,zX,hU,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,gI,zX,zX,zX,zX,zX,zX,zX,zX,zX,fH,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,fs,zX,zX,zX,zX,zX,eM,zX,zX,zX,zX,zX,pr,zX,zX,zX,f$,zX,zX,zX,os,zX,zX,zX,zX,zX,zX,zX,jr,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,oa,zX,g$,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,hA,zX,jC,zX,zX,zX,oq,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,li,zX,zX,zX,lN,zX,pv,zX,zX,zX,zX,zX,zX,zX,mm,zX,eq,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,ln,zX,zX,zX,zX,zX,zX,zX,pt,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,fX,zX,zX,zX,zX,zX,zX,zX,zX,zX,hL,zX,zX,zX,zX,zX,mC,zX,zX,zX,kA,zX,zX,zX,zX,zX,fh,zX,zX,zX,zX,zX,lh,zX,zX,zX,fD,zX,zX,zX,eW,zX,po,zX,zX,zX,zX,zX,kG,zX,zX,zX,zX,zX,lE,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,pq,zX,j5,zX,zX,zX,zX,zX,k1,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,d9,zX,zX,zX,f5,zX,kJ,zX,zX,zX,zX,zX,zX,zX,fQ,zX,h0,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,kr,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,gj,zX,zX,zX,zX,zX,ls,zX,d2,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,ii,zX,zX,zX,zX,zX,zX,zX,zX,zX,fT,zX,h3,zX,hc,zX,zX,zX,zX,zX,zX,zX,zX,zX,fB,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,lV,zX,zX,zX,gp,zX,zX,zX,zX,zX,zX,zX,n9,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,iG,zX,iu,zX,zX,zX,zX,zX,n3,zX,zX,zX,e2,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,gf,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,hN,zX,zX,zX,hu,zX,zX,zX,zX,zX,oj,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,gt,zX,zX,zX,eT,zX,zX,zX,zX,zX,zX,zX,d_,zX,zX,zX,gX,zX,ft,zX,zX,zX,zX,zX,zX,zX,f7,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,i0,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,eu,zX,zX,zX,zX,zX,zX,zX,zX,zX,nx,zX,zX,zX,zX,zX,lm,zX,zX,zX,zX,zX,zX,zX,lw,zX,zX,zX,zX,zX,zX,zX,zX,zX,hz,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,kS,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,nk,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,go,zX,nD,zX,od,zX,zX,zX,zX,zX,gY,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,fw,zX,zX,zX,zX,zX,mZ,zX,zX,zX,zX,zX,fl,zX,zX,zX,zX,zX,zX,zX,e3,zX,mp,zX,gG,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,nX,zX,f_,zX,zX,zX,e$,zX,zX,zX,zX,zX,iH,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,nG,zX,zX,zX,zX,zX,k4,zX,zX,zX,du,zX,zX,zX,zX,zX,eJ,zX,zX,zX,zX,zX,n4,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,j6,zX,zX,zX,zX,zX,lR,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,e0,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,oE,zX,zX,zX,gq,zX,m0,zX,zX,zX,fC,zX,zX,zX,zX,zX,f1,zX,mB,zX,zX,zX,zX,zX,mn,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,hM,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,mw,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,fi,zX,zX,zX,zX,zX,zX,zX,k$,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,nB,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,hj,zX,zX,zX,zX,zX,zX,zX,zX,zX,hq,zX,zX,zX,zX,zX,i1,zX,mT,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,eS,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,eX,zX,zX,zX,zX,zX,zX,zX,zX,zX,iF,zX,fP,zX,zX,zX,zX,zX,fM,zX,zX,zX,iE,zX,eG,zX,zX,zX,fm,zX,zX,zX,hk,zX,zX,zX,zX,zX,hX,zX,nW,zX,zX,zX,zX,zX,zX,zX,zX,zX,pl,zX,zX,zX,zX,zX,gZ,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,ey,zX,zX,zX,gh,zX,js,zX,hi,zX,zX,zX,mq,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,dt,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,pg,zX,zX,zX,lq,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,k5,zX,mV,zX,zX,zX,nR,zX,zX,zX,fN,zX,zX,zX,zX,zX,zX,zX,pf,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,lW,zX,hJ,zX,zX,zX,hD,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,oM,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,jX,zX,f8,zX,zX,zX,zX,zX,zX,zX,zX,zX,j2,zX,j$,zX,zX,zX,lv,zX,gr,zX,zX,zX,zX,zX,zX,zX,zX,zX,og,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,eE,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,nS,zX,oJ,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,eF,zX,oi,zX,zX,zX,zX,zX,hC,zX,zX,zX,zX,zX,gi,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,mG,zX,zX,zX,zX,zX,lQ,zX,zX,zX,zX,zX,zX,zX,zX,zX,mc,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX,zX];var bu=[zY,zY,r$,zY,r0,zY,r1,zY,r2,zY,r3,zY,r4,zY,r5,zY,r6,zY,r7,zY,r8,zY,r9,zY,sa,zY,sb,zY,sc,zY,sd,zY,se,zY,sf,zY,sg,zY,sh,zY,si,zY,zY,zY,zY,zY,zY,zY,zY,zY,mh,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,jU,zY,zY,zY,zY,zY,of,zY,ms,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,iw,zY,zY,zY,zY,zY,zY,zY,zY,zY,nO,zY,zY,zY,zY,zY,mQ,zY,hr,zY,zY,zY,nQ,zY,zY,zY,zY,zY,hp,zY,hm,zY,hy,zY,zY,zY,m6,zY,lA,zY,kY,zY,he,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,hv,zY,cI,zY,zY,zY,ht,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,oG,zY,zY,zY,zY,zY,zY,zY,k2,zY,zY,zY,zY,zY,zY,zY,lj,zY,zY,zY,zY,zY,zY,zY,gJ,zY,zY,zY,lr,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,hw,zY,zY,zY,zY,zY,zY,zY,zY,zY,mE,zY,zY,zY,zY,zY,zY,zY,zY,zY,lg,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,kZ,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,m9,zY,zY,zY,px,zY,jL,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,kL,zY,zY,zY,zY,zY,zY,zY,zY,zY,hQ,zY,oh,zY,zY,zY,zY,zY,gu,zY,zY,zY,zY,zY,jN,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,jv,zY,zY,zY,zY,zY,hx,zY,pm,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,ky,zY,zY,zY,zY,zY,zY,zY,mk,zY,zY,zY,zY,zY,zY,zY,mx,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,m3,zY,zY,zY,kg,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,j0,zY,zY,zY,zY,zY,l4,zY,zY,zY,h1,zY,zY,zY,zY,zY,n$,zY,zY,zY,zY,zY,zY,zY,zY,zY,jK,zY,gz,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,hl,zY,hE,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,hO,zY,zY,zY,zY,zY,lk,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,pp,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,jR,zY,zY,zY,kC,zY,gw,zY,zY,zY,nr,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,gm,zY,zY,zY,jc,zY,zY,zY,zY,zY,gK,zY,zY,zY,zY,zY,zY,zY,zY,zY,nv,zY,zY,zY,zY,zY,lB,zY,g9,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,pn,zY,gL,zY,zY,zY,zY,zY,zY,zY,zY,zY,jw,zY,k7,zY,zY,zY,zY,zY,zY,zY,zY,zY,jF,zY,zY,zY,zY,zY,lD,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,ju,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,h8,zY,zY,zY,zY,zY,hP,zY,zY,zY,hf,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,lf,zY,mA,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,k9,zY,zY,zY,cw,zY,zY,zY,gv,zY,zY,zY,zY,zY,zY,zY,zY,zY,ko,zY,zY,zY,zY,zY,iC,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,iv,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,jB,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,m4,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,hn,zY,zY,zY,zY,zY,zY,zY,zY,zY,hR,zY,zY,zY,zY,zY,zY,zY,zY,zY,oe,zY,zY,zY,zY,zY,kT,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,cE,zY,zY,zY,jG,zY,zY,zY,zY,zY,zY,zY,zY,zY,ox,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,gB,zY,zY,zY,zY,zY,zY,zY,jJ,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,mI,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,n8,zY,hB,zY,zY,zY,zY,zY,pS,zY,zY,zY,ol,zY,zY,zY,zY,zY,zY,zY,zY,zY,gE,zY,zY,zY,pw,zY,zY,zY,zY,zY,zY,zY,hb,zY,zY,zY,zY,zY,jZ,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,iL,zY,zY,zY,zY,zY,hh,zY,jH,zY,nq,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,hS,zY,m$,zY,zY,zY,zY,zY,zY,zY,ov,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,kM,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,oc,zY,iD,zY,it,zY,zY,zY,zY,zY,zY,zY,cG,zY,zY,zY,iJ,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,kQ,zY,zY,zY,zY,zY,zY,zY,is,zY,zY,zY,zY,zY,zY,zY,zY,zY,oO,zY,zY,zY,iS,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,ps,zY,nJ,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,j9,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,iz,zY,zY,zY,zY,zY,zY,zY,zY,zY,hK,zY,le,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,n1,zY,zY,zY,zY,zY,ka,zY,zY,zY,zY,zY,zY,zY,ok,zY,zY,zY,kP,zY,zY,zY,zY,zY,ie,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,mN,zY,zY,zY,zY,zY,oP,zY,n2,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,pj,zY,zY,zY,zY,zY,zY,zY,zY,zY,j8,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,hg,zY,zY,zY,zY,zY,k0,zY,mo,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,mj,zY,zY,zY,zY,zY,hZ,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,n7,zY,zY,zY,j1,zY,gO,zY,zY,zY,zY,zY,kW,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,jT,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,jt,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,nH,zY,zY,zY,pi,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,kN,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,k3,zY,ho,zY,zY,zY,zY,zY,zY,zY,zY,zY,gC,zY,zY,zY,nd,zY,zY,zY,zY,zY,zY,zY,zY,zY,gs,zY,zY,zY,zY,zY,zY,zY,zY,zY,jA,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,gn,zY,zY,zY,mP,zY,zY,zY,zY,zY,zY,zY,ix,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY,zY];var bv=[zZ,zZ,sk,zZ,sl,zZ,sm,zZ,sn,zZ,so,zZ,sp,zZ,sq,zZ,sr,zZ,ss,zZ,st,zZ,su,zZ,sv,zZ,sw,zZ,sx,zZ,sy,zZ,sz,zZ,sA,zZ,sB,zZ,sC,zZ,sD,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,im,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ,zZ];var bw=[z_,z_,sF,z_,sG,z_,sH,z_,sI,z_,sJ,z_,sK,z_,sL,z_,sM,z_,sN,z_,sO,z_,sP,z_,sQ,z_,sR,z_,sS,z_,sT,z_,sU,z_,sV,z_,sW,z_,sX,z_,sY,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,nt,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_,z_];var bx=[z$,z$,s_,z$,s$,z$,s0,z$,s1,z$,s2,z$,s3,z$,s4,z$,s5,z$,s6,z$,s7,z$,s8,z$,s9,z$,ta,z$,tb,z$,tc,z$,td,z$,te,z$,tf,z$,tg,z$,th,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,c3,z$,z$,z$,km,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,ic,z$,ex,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,kw,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,cP,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,dZ,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,kd,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,ep,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,d8,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,et,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,jb,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,cT,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,cW,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,eI,z$,z$,z$,z$,z$,z$,z$,z$,z$,d1,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$,z$];var by=[z0,z0,tj,z0,tk,z0,tl,z0,tm,z0,tn,z0,to,z0,tp,z0,tq,z0,tr,z0,ts,z0,tt,z0,tu,z0,tv,z0,tw,z0,tx,z0,ty,z0,tz,z0,tA,z0,tB,z0,tC,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,iU,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,kh,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,kp,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,hV,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,hT,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,pL,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,cJ,z0,ig,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,dU,z0,z0,z0,z0,z0,z0,z0,jd,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,kz,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,cH,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,cC,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,c$,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0,z0];var bz=[z1,z1,tE,z1,tF,z1,tG,z1,tH,z1,tI,z1,tJ,z1,tK,z1,tL,z1,tM,z1,tN,z1,tO,z1,tP,z1,tQ,z1,tR,z1,tS,z1,tT,z1,tU,z1,tV,z1,tW,z1,tX,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,ip,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,fg,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,fA,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,eC,z1,z1,z1,z1,z1,e5,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,ga,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,fY,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,fS,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,fv,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,gl,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,eV,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1,z1];var bA=[z2,z2,tZ,z2,t_,z2,t$,z2,t0,z2,t1,z2,t2,z2,t3,z2,t4,z2,t5,z2,t6,z2,t7,z2,t8,z2,t9,z2,ua,z2,ub,z2,uc,z2,ud,z2,ue,z2,uf,z2,ug,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,jq,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,lG,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2,z2];var bB=[z3,z3,ui,z3,uj,z3,uk,z3,ul,z3,um,z3,un,z3,uo,z3,up,z3,uq,z3,ur,z3,us,z3,ut,z3,uu,z3,uv,z3,uw,z3,ux,z3,uy,z3,uz,z3,uA,z3,uB,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,oW,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3,z3];var bC=[z4,z4,uD,z4,uE,z4,uF,z4,uG,z4,uH,z4,uI,z4,uJ,z4,uK,z4,uL,z4,uM,z4,uN,z4,uO,z4,uP,z4,uQ,z4,uR,z4,uS,z4,uT,z4,uU,z4,uV,z4,uW,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,ma,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,oo,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4,z4];var bD=[z5,z5,uY,z5,uZ,z5,u_,z5,u$,z5,u0,z5,u1,z5,u2,z5,u3,z5,u4,z5,u5,z5,u6,z5,u7,z5,u8,z5,u9,z5,va,z5,vb,z5,vc,z5,vd,z5,ve,z5,vf,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,pB,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,pP,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5,z5];var bE=[z6,z6,vh,z6,vi,z6,vj,z6,vk,z6,vl,z6,vm,z6,vn,z6,vo,z6,vp,z6,vq,z6,vr,z6,vs,z6,vt,z6,vu,z6,vv,z6,vw,z6,vx,z6,vy,z6,vz,z6,vA,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,kI,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6,z6];var bF=[z7,z7,vC,z7,vD,z7,vE,z7,vF,z7,vG,z7,vH,z7,vI,z7,vJ,z7,vK,z7,vL,z7,vM,z7,vN,z7,vO,z7,vP,z7,vQ,z7,vR,z7,vS,z7,vT,z7,vU,z7,vV,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,iM,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7,z7];var bG=[z8,z8,vX,z8,vY,z8,vZ,z8,v_,z8,v$,z8,v0,z8,v1,z8,v2,z8,v3,z8,v4,z8,v5,z8,v6,z8,v7,z8,v8,z8,v9,z8,wa,z8,wb,z8,wc,z8,wd,z8,we,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,h2,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8,z8];var bH=[z9,z9,wg,z9,wh,z9,wi,z9,wj,z9,wk,z9,wl,z9,wm,z9,wn,z9,wo,z9,wp,z9,wq,z9,wr,z9,ws,z9,wt,z9,wu,z9,wv,z9,ww,z9,wx,z9,wy,z9,wz,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,kO,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,lI,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,jz,z9,z9,z9,z9,z9,z9,z9,z9,z9,kU,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,oI,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,oB,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,nV,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,jo,z9,z9,z9,z9,z9,z9,z9,lb,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,ld,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,lu,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,j3,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,oQ,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,ow,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,mU,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,mR,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,gD,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,mf,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,pk,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,nL,z9,z9,z9,z9,z9,z9,z9,z9,z9,m5,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,jY,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,mb,z9,mv,z9,z9,z9,z9,z9,z9,z9,nC,z9,z9,z9,kb,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,ir,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,kV,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,iB,z9,z9,z9,m1,z9,z9,z9,z9,z9,z9,z9,oD,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,l1,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,oK,z9,z9,z9,z9,z9,z9,z9,z9,z9,jS,z9,z9,z9,oL,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,nZ,z9,my,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,m7,z9,z9,z9,z9,z9,gN,z9,nw,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,jD,z9,z9,z9,z9,z9,z9,z9,n_,z9,z9,z9,z9,z9,jP,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,l5,z9,z9,z9,z9,z9,z9,z9,k6,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,gx,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,hG,z9,z9,z9,op,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,mD,z9,z9,z9,z9,z9,z9,z9,mr,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,mY,z9,z9,z9,z9,z9,np,z9,z9,z9,z9,z9,z9,z9,mF,z9,z9,z9,z9,z9,z9,z9,jE,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,nE,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,or,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,pu,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,hd,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,nU,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,gM,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,lz,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,mM,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,oy,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,lo,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,lH,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,nY,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,nP,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,iy,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,ly,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9,z9];var bI=[Aa,Aa,wB,Aa,wC,Aa,wD,Aa,wE,Aa,wF,Aa,wG,Aa,wH,Aa,wI,Aa,wJ,Aa,wK,Aa,wL,Aa,wM,Aa,wN,Aa,wO,Aa,wP,Aa,wQ,Aa,wR,Aa,wS,Aa,wT,Aa,wU,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,nh,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,gH,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,o0,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,fU,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,g0,Aa,Aa,Aa,Aa,Aa,jf,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,fI,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,kB,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,iR,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,g5,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,hI,Aa,Aa,Aa,Aa,Aa,mi,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,cS,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,jp,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,ml,Aa,fx,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,kc,Aa,lK,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,fe,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,lO,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,ha,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,lL,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,cY,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,iQ,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,ib,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,dl,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,lU,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,kv,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,g6,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,h4,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,h$,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,hH,Aa,Aa,Aa,Aa,Aa,Aa,Aa,cV,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,gP,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,i7,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,eQ,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,kE,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,kH,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,lM,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,cB,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,kl,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,e6,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,jj,Aa,Aa,Aa,Aa,Aa,f2,Aa,Aa,Aa,Aa,Aa,eN,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,gb,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa,Aa];var bJ=[Ab,Ab,wW,Ab,wX,Ab,wY,Ab,wZ,Ab,w_,Ab,w$,Ab,w0,Ab,w1,Ab,w2,Ab,w3,Ab,w4,Ab,w5,Ab,w6,Ab,w7,Ab,w8,Ab,w9,Ab,xa,Ab,xb,Ab,xc,Ab,xd,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,iN,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab];var bK=[Ac,Ac,xf,Ac,xg,Ac,xh,Ac,xi,Ac,xj,Ac,xk,Ac,xl,Ac,xm,Ac,xn,Ac,xo,Ac,xp,Ac,xq,Ac,xr,Ac,xs,Ac,xt,Ac,xu,Ac,xv,Ac,xw,Ac,xx,Ac,xy,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,iP,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,i9,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,ns,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,lT,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,o9,Ac,Ac,Ac,jk,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,nj,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,l_,Ac,Ac,Ac,Ac,Ac,Ac,Ac,o5,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,nl,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,ih,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,l$,Ac,g8,Ac,Ac,Ac,Ac,Ac,Ac,Ac,lY,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,oV,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,g_,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,o7,Ac,iY,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,o2,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,nf,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,o$,Ac,Ac,Ac,Ac,Ac,ki,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,oR,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,gS,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,pI,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,kq,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,l2,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,oT,Ac,Ac,Ac,pE,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,i$,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,pG,Ac,Ac,Ac,nb,Ac,oY,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac,Ac];var bL=[Ad,Ad,xA,Ad,xB,Ad,xC,Ad,xD,Ad,xE,Ad,xF,Ad,xG,Ad,xH,Ad,xI,Ad,xJ,Ad,xK,Ad,xL,Ad,xM,Ad,xN,Ad,xO,Ad,xP,Ad,xQ,Ad,xR,Ad,xS,Ad,xT,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,g2,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,iV,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad,Ad];var bM=[Ae,Ae,xV,Ae,xW,Ae,xX,Ae,xY,Ae,xZ,Ae,x_,Ae,x$,Ae,x0,Ae,x1,Ae,x2,Ae,x3,Ae,x4,Ae,x5,Ae,x6,Ae,x7,Ae,x8,Ae,x9,Ae,ya,Ae,yb,Ae,yc,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,o3,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,nc,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae,Ae];var bN=[Af,Af,ye,Af,yf,Af,yg,Af,yh,Af,yi,Af,yj,Af,yk,Af,yl,Af,ym,Af,yn,Af,yo,Af,yp,Af,yq,Af,yr,Af,ys,Af,yt,Af,yu,Af,yv,Af,yw,Af,yx,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,l3,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af,Af];var bO=[Ag,Ag,yz,Ag,yA,Ag,yB,Ag,yC,Ag,yD,Ag,yE,Ag,yF,Ag,yG,Ag,yH,Ag,yI,Ag,yJ,Ag,yK,Ag,yL,Ag,yM,Ag,yN,Ag,yO,Ag,yP,Ag,yQ,Ag,yR,Ag,yS,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,i2,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,dv,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,jm,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,i3,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,je,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,i5,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,ji,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,hY,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,j_,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,gT,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,i8,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,ne,Ag,jx,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,dw,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,kK,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag,Ag];var bP=[Ah,Ah,yU,Ah,yV,Ah,yW,Ah,yX,Ah,yY,Ah,yZ,Ah,y_,Ah,y$,Ah,y0,Ah,y1,Ah,y2,Ah,y3,Ah,y4,Ah,y5,Ah,y6,Ah,y7,Ah,y8,Ah,y9,Ah,za,Ah,zb,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,p$,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah,Ah];var bQ=[Ai,Ai,zd,Ai,ze,Ai,zf,Ai,zg,Ai,zh,Ai,zi,Ai,zj,Ai,zk,Ai,zl,Ai,zm,Ai,zn,Ai,zo,Ai,zp,Ai,zq,Ai,zr,Ai,zs,Ai,zt,Ai,zu,Ai,zv,Ai,zw,Ai,Ai,Ai,cR,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,o_,Ai,Ai,Ai,Ai,Ai,e4,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,kk,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,cL,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,ia,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,gk,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,fR,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,fj,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,ku,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,f0,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,kD,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,i6,Ai,Ai,Ai,Ai,Ai,Ai,Ai,fu,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,jn,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,eU,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,c4,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,f9,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,eH,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,fE,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,cN,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai,Ai];var bR=[Aj,Aj,zy,Aj,zz,Aj,zA,Aj,zB,Aj,zC,Aj,zD,Aj,zE,Aj,zF,Aj,zG,Aj,zH,Aj,zI,Aj,zJ,Aj,zK,Aj,zL,Aj,zM,Aj,zN,Aj,zO,Aj,zP,Aj,zQ,Aj,zR,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,cK,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,cM,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,ij,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,il,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,cQ,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,d$,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,hW,Aj,Aj,Aj,Aj,Aj,ez,Aj,Aj,Aj,pM,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,ev,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,kf,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,ja,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,kn,Aj,Aj,Aj,Aj,Aj,d3,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,kt,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,pz,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,id,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,oA,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,er,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,c0,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,d7,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,eK,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,lc,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,nT,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,kx,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,h5,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,io,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj,Aj];return{_emscripten_bind_b2Fixture__SetRestitution_p1:gA,_emscripten_bind_b2PolygonShape____destroy___p0:jl,_emscripten_bind_b2DistanceProxy__get_m_vertices_p0:mh,_emscripten_bind_b2WheelJointDef__Initialize_p4:nz,_emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1:pe,_emscripten_bind_b2Body__IsSleepingAllowed_p0:jU,_emscripten_bind_b2Vec2__b2Vec2_p2:l3,_emscripten_bind_b2Body__GetLinearDamping_p0:kO,_emscripten_bind_b2JointDef__get_type_p0:of,_emscripten_bind_b2FixtureDef__get_shape_p0:ms,_emscripten_bind_b2WheelJointDef__set_frequencyHz_p1:ny,_emscripten_bind_b2BlockAllocator____destroy___p0:jg,_emscripten_bind_b2Vec2__op_add_p1:l6,_emscripten_bind_b2World__GetJointList_p0:ho,_emscripten_bind_b2Transform__Set_p2:o_,_emscripten_bind_b2EdgeShape__RayCast_p4:km,_emscripten_bind_b2Vec2__get_y_p0:lI,_emscripten_bind_b2DynamicTree__Validate_p0:iW,_emscripten_bind_b2DynamicTree__DestroyProxy_p1:iX,_emscripten_bind_b2Joint__IsActive_p0:iw,_emscripten_bind_b2DynamicTree__b2DynamicTree_p0:iP,_emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0:nO,_emscripten_bind_b2DistanceProxy__GetVertex_p1:nh,_emscripten_bind_b2EdgeShape__get_m_radius_p0:jz,_emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0:mQ,_emscripten_bind_b2World__GetJointCount_p0:hr,_emscripten_bind_b2DynamicTree__CreateProxy_p2:iU,_emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0:nQ,_emscripten_bind_b2Body__GetGravityScale_p0:kU,_emscripten_bind_b2Fixture__Dump_p1:g4,_emscripten_bind_b2World__GetBodyList_p0:hp,_emscripten_bind_b2World__GetContactList_p0:hy,_emscripten_bind_b2StackAllocator____destroy___p0:lS,_emscripten_bind_b2Vec2__Skew_p0:m6,_emscripten_bind_b2BodyDef__get_linearVelocity_p0:lA,_emscripten_bind_b2Body__GetPosition_p0:kY,_emscripten_bind_b2World__GetTreeHeight_p0:he,_emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1:mH,_emscripten_bind_b2ChainShape__b2ChainShape_p0:i9,_emscripten_bind_b2CircleShape__RayCast_p4:ic,_emscripten_bind_b2MouseJointDef__get_dampingRatio_p0:oI,_emscripten_bind_b2JointDef__set_bodyB_p1:ob,_malloc:pQ,_emscripten_bind_b2Fixture__GetAABB_p1:gH,_emscripten_bind_b2BroadPhase__TouchProxy_p1:hU,_emscripten_bind_b2World__GetAllowSleeping_p0:hv,_emscripten_bind_b2World__GetWarmStarting_p0:ht,_emscripten_bind_b2Rot__b2Rot_p1:nt,_emscripten_bind_b2Rot__b2Rot_p0:ns,_emscripten_bind_b2MouseJointDef__get_frequencyHz_p0:oB,_emscripten_bind_b2Fixture__SetUserData_p1:gI,_emscripten_bind_b2MouseJointDef__get_target_p0:oG,_emscripten_bind_b2ContactManager__set_m_contactFilter_p1:go,_emscripten_bind_b2FrictionJointDef____destroy___p0:lZ,_emscripten_bind_b2Filter__get_maskBits_p0:k2,_emscripten_bind_b2World__Dump_p0:h7,_emscripten_bind_b2RevoluteJointDef____destroy___p0:oS,_emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0:nV,_emscripten_bind_b2BodyDef__get_bullet_p0:lj,_emscripten_bind_b2Body__SetAngularDamping_p1:jV,_emscripten_bind_b2DynamicTree__RebuildBottomUp_p0:iT,_emscripten_bind_b2Fixture__GetFilterData_p0:gJ,_emscripten_bind_b2BodyDef__get_position_p0:lr,_emscripten_bind_b2PolygonShape__get_m_radius_p0:jo,_emscripten_bind_b2ContactEdge__set_next_p1:pr,_emscripten_bind_b2Transform__b2Transform_p2:o0,_emscripten_bind_b2FrictionJointDef__get_maxTorque_p0:lb,_emscripten_bind_b2WeldJointDef__set_localAnchorB_p1:os,_emscripten_bind_b2World__GetProxyCount_p0:hw,_emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1:mL,_emscripten_bind_b2PolygonShape__set_m_centroid_p1:jr,_emscripten_bind_b2Vec3____destroy___p0:na,_emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0:mE,_emscripten_bind_b2BodyDef__get_linearDamping_p0:ld,_emscripten_bind_b2RayCastCallback__ReportFixture_p4:iN,_emscripten_bind_b2Body__Dump_p0:lP,_emscripten_bind_b2BodyDef__get_allowSleep_p0:lg,_emscripten_bind_b2JointDef__set_bodyA_p1:oa,_emscripten_bind_b2Fixture__GetMassData_p1:g$,_emscripten_bind_b2Joint__GetReactionTorque_p1:ip,_emscripten_bind_b2Rot__set_c_p1:mW,_emscripten_bind_b2Vec3__op_mul_p1:me,_emscripten_bind_b2StackAllocator__GetMaxAllocation_p0:kZ,_emscripten_bind_b2World__SetAutoClearForces_p1:hA,_emscripten_bind_b2Contact__SetEnabled_p1:jC,_emscripten_bind_b2BodyDef__get_angularDamping_p0:lu,_emscripten_bind_b2WeldJointDef__set_localAnchorA_p1:oq,_emscripten_bind_b2PulleyJointDef__set_lengthB_p1:n5,_emscripten_bind_b2Vec2__op_sub_p0:m9,_emscripten_bind_b2RopeJointDef__get_localAnchorB_p0:px,_emscripten_bind_b2Contact__GetChildIndexB_p0:jL,_emscripten_bind_b2Fixture__TestPoint_p1:g0,_emscripten_bind_b2QueryCallback__ReportFixture_p1:jf,_emscripten_bind_b2BodyDef__set_linearVelocity_p1:li,_emscripten_bind_b2Body__GetMass_p0:j3,_emscripten_bind_b2World__QueryAABB_p2:hY,_emscripten_bind_b2RopeJointDef__set_localAnchorB_p1:pv,_emscripten_bind_b2Body__IsFixedRotation_p0:kL,_emscripten_bind_b2Rot__SetIdentity_p0:mX,_emscripten_bind_b2DistanceProxy__set_m_vertices_p1:mm,_emscripten_bind_b2Joint__GetBodyA_p0:hQ,_emscripten_bind_b2JointDef__get_userData_p0:oh,_emscripten_bind_b2Draw__DrawPolygon_p3:ij,_emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0:oQ,_emscripten_bind_b2ContactManager__get_m_broadPhase_p0:gu,_emscripten_bind_b2Contact__GetManifold_p0:jN,_emscripten_bind_b2Contact__SetFriction_p1:jI,_emscripten_bind_b2BodyDef__set_allowSleep_p1:ln,_emscripten_bind_b2Fixture__RayCast_p3:g2,_emscripten_bind_b2WeldJointDef__get_referenceAngle_p0:ow,_emscripten_bind_b2RopeJointDef__set_localAnchorA_p1:pt,_emscripten_bind_b2Draw__DrawSolidPolygon_p3:il,_emscripten_bind_b2ContactManager____destroy___p0:gW,_emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0:mU,_emscripten_bind_b2PolygonShape__get_m_vertexCount_p0:jv,_emscripten_bind_b2DistanceJointDef__Initialize_p4:pC,_emscripten_bind_b2World__IsLocked_p0:hx,_emscripten_bind_b2ContactEdge__get_prev_p0:pm,_emscripten_bind_b2Draw__AppendFlags_p1:hL,_emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0:mR,_emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1:mJ,_emscripten_bind_b2Shape__RayCast_p4:kw,_emscripten_bind_b2Body__SetActive_p1:kA,_emscripten_bind_b2Shape__GetChildCount_p0:ky,_emscripten_bind_b2ContactListener____destroy___p0:i_,_emscripten_bind_b2Body__ApplyTorque_p1:j7,_emscripten_bind_b2DistanceProxy__GetVertexCount_p0:mk,_emscripten_bind_b2Fixture____destroy___p0:g1,_emscripten_bind_b2FixtureDef__set_density_p1:mt,_emscripten_bind_b2FixtureDef__get_filter_p0:mx,_emscripten_bind_b2ContactEdge__set_prev_p1:po,_emscripten_bind_b2Fixture__GetFriction_p0:gD,_emscripten_bind_b2Body__SetType_p1:kG,_emscripten_bind_b2WheelJointDef__set_localAnchorA_p1:mZ,_emscripten_bind_b2FrictionJointDef__set_maxForce_p1:k8,_emscripten_bind_b2Contact__SetRestitution_p1:jM,_emscripten_bind_b2WheelJointDef__get_enableMotor_p0:m3,_emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0:o9,_emscripten_bind_b2PolygonShape__GetChildCount_p0:kg,_emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0:jk,_emscripten_bind_b2ContactEdge__set_other_p1:pq,_emscripten_bind_b2Body__GetMassData_p1:j5,_emscripten_bind_b2DistanceProxy____destroy___p0:ng,_emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0:nE,_emscripten_bind_b2Filter__set_groupIndex_p1:k1,_emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1:mS,_emscripten_bind_b2FixtureDef__set_restitution_p1:mu,_emscripten_bind_b2Body__GetJointList_p0:j0,_emscripten_bind_b2Timer____destroy___p0:iZ,_emscripten_bind_b2Contact__ResetRestitution_p0:jO,_emscripten_bind_b2DynamicTree__MoveProxy_p3:iV,_emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0:n$,_emscripten_bind_b2WheelJointDef____destroy___p0:nu,_emscripten_bind_b2Body__SetMassData_p1:kJ,_emscripten_bind_b2Contact__GetChildIndexA_p0:jK,_emscripten_bind_b2Fixture__GetShape_p0:gz,_emscripten_bind_b2DistanceProxy__set_m_radius_p1:mg,_emscripten_bind_b2World__DestroyJoint_p1:h0,_emscripten_bind_b2PulleyJointDef__set_ratio_p1:n0,_emscripten_bind_b2Body__GetLocalPoint_p1:kB,_emscripten_bind_b2World__GetBodyCount_p0:hl,_emscripten_bind_b2CircleShape__GetType_p0:hE,_emscripten_bind_b2DistanceProxy__get_m_radius_p0:mf,_emscripten_bind_b2World__ClearForces_p0:hs,_emscripten_bind_b2DynamicTree____destroy___p0:iO,_emscripten_bind_b2Contact__GetWorldManifold_p1:kr,_emscripten_bind_b2DynamicTree__GetUserData_p1:iR,_emscripten_bind_b2JointDef____destroy___p0:oX,_emscripten_bind_b2Draw__GetFlags_p0:hO,_emscripten_bind_b2PolygonShape__Set_p2:jm,_emscripten_bind_b2DestructionListener__SayGoodbye_p1:lW,_emscripten_bind_b2BodyDef____destroy___p0:l0,_emscripten_bind_b2EdgeShape____destroy___p0:kj,_emscripten_bind_b2GearJointDef__get_ratio_p0:pk,_emscripten_bind_b2BlockAllocator__Clear_p0:jh,_emscripten_bind_b2BodyDef__set_type_p1:ls,_emscripten_bind_b2ContactEdge__get_next_p0:pp,_free:pR,_emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0:nL,_emscripten_bind_b2MouseJointDef__set_dampingRatio_p1:oC,_emscripten_bind_b2PolygonShape__set_m_radius_p1:iI,_emscripten_bind_b2FixtureDef__set_userData_p1:mp,_emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0:m5,_emscripten_bind_b2ChainShape__CreateLoop_p2:je,_emscripten_bind_b2World__DestroyBody_p1:h3,_emscripten_bind_b2World__SetSubStepping_p1:hc,_emscripten_bind_b2PrismaticJointDef____destroy___p0:nm,_emscripten_bind_b2BroadPhase__GetFatAABB_p1:g5,_emscripten_bind_b2ContactManager__set_m_contactCount_p1:gq,_emscripten_bind_b2Body__GetLinearVelocity_p0:kC,_emscripten_bind_b2ContactManager__get_m_allocator_p0:gw,_emscripten_bind_b2BlockAllocator__Free_p2:ji,_emscripten_bind_b2Body__GetAngularVelocity_p0:jY,_emscripten_bind_b2Rot__GetXAxis_p0:nr,_emscripten_bind_b2ContactManager__get_m_contactCount_p0:gn,_emscripten_bind_b2PolygonShape__GetVertexCount_p0:jt,_emscripten_bind_b2StackAllocator__Free_p1:lV,_emscripten_bind_b2CircleShape__GetSupportVertex_p1:hI,_emscripten_bind_b2DistanceProxy__GetSupportVertex_p1:mi,_emscripten_bind_b2JointDef__set_userData_p1:n9,_emscripten_bind_b2Vec3__get_z_p0:mb,_emscripten_bind_b2FixtureDef__get_restitution_p0:mv,_emscripten_bind_b2FixtureDef__b2FixtureDef_p0:nj,_emscripten_bind_b2WheelJointDef__get_motorSpeed_p0:nC,_emscripten_bind_b2ContactManager__get_m_contactFilter_p0:gm,_emscripten_bind_b2Body__GetAngularDamping_p0:kb,_emscripten_bind_b2ChainShape__GetChildCount_p0:jc,_emscripten_bind_b2ChainShape__SetNextVertex_p1:iG,_emscripten_bind_b2Joint__SetUserData_p1:iu,_emscripten_bind_b2Fixture__IsSensor_p0:gK,_emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0:oO,_emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1:n3,_emscripten_bind_b2ContactListener__PreSolve_p2:i2,_emscripten_bind_b2WheelJointDef__get_localAnchorB_p0:nv,_emscripten_bind_b2BroadPhase__MoveProxy_p3:hW,_emscripten_bind_b2BodyDef__get_active_p0:lB,_emscripten_bind_b2CircleShape__GetVertexCount_p0:g9,_emscripten_bind_b2Timer__Reset_p0:iq,_emscripten_bind_b2World__b2World_p1:h1,_emscripten_bind_b2Vec3__Set_p3:ma,_emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1:nM,_emscripten_bind_b2ContactEdge__get_other_p0:pn,_emscripten_bind_b2Fixture__GetType_p0:gL,_emscripten_bind_b2ContactListener__PostSolve_p2:i3,_emscripten_bind_b2Body__GetInertia_p0:kV,_emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0:l_,_emscripten_bind_b2PolygonShape__get_m_centroid_p0:jw,_emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0:k7,_emscripten_bind_b2Draw__SetFlags_p1:hN,_emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0:o5,_emscripten_bind_b2World__SetAllowSleeping_p1:hu,_emscripten_bind_b2BodyDef__set_gravityScale_p1:lt,_emscripten_bind_b2Contact__IsTouching_p0:jF,_emscripten_bind_b2Transform__set_q_p1:oj,_emscripten_bind_b2BodyDef__get_fixedRotation_p0:lD,_emscripten_bind_b2ChainShape____destroy___p0:i4,_emscripten_bind_b2ChainShape__get_m_radius_p0:iB,_emscripten_bind_b2EdgeShape__set_m_radius_p1:jy,_emscripten_bind_b2DistanceJointDef__get_length_p0:oK,_emscripten_bind_b2ContactManager__set_m_contactListener_p1:gt,_emscripten_bind_b2MouseJointDef__get_maxForce_p0:oD,_emscripten_bind_b2DistanceProxy__GetSupport_p1:ml,_emscripten_bind_b2World__GetGravity_p0:h8,_emscripten_bind_b2Joint__GetNext_p0:hP,_emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1:nI,_emscripten_bind_b2World__GetProfile_p0:hf,_emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1:n4,_emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0:mI,_emscripten_bind_b2Body__GetWorldVector_p1:lK,_emscripten_bind_b2Fixture__Refilter_p0:g3,_emscripten_bind_b2Vec3__SetZero_p0:md,_emscripten_bind_b2ContactListener__EndContact_p1:i0,_emscripten_bind_b2Vec2__Normalize_p0:l1,_emscripten_bind_b2Shape__ComputeMass_p2:ku,_emscripten_bind_b2BodyDef__get_type_p0:lf,_emscripten_bind_b2FixtureDef__get_userData_p0:mA,_emscripten_bind_b2WeldJointDef__Initialize_p3:oA,_emscripten_bind_b2Rot__Set_p1:no,_emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0:nl,_emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0:k9,_emscripten_bind_b2WheelJointDef__set_enableMotor_p1:nx,_emscripten_bind_b2ContactManager__get_m_contactList_p0:gv,_emscripten_bind_b2PolygonShape__ComputeAABB_p3:kf,_emscripten_bind_b2BodyDef__set_fixedRotation_p1:lm,_emscripten_bind_b2CircleShape__b2CircleShape_p0:ih,_emscripten_bind_b2EdgeShape__GetChildCount_p0:ko,_emscripten_bind_b2BodyDef__set_active_p1:lw,_emscripten_bind_b2Vec2____destroy___p0:m8,_emscripten_bind_b2ChainShape__get_m_vertices_p0:iC,_emscripten_bind_b2BodyDef__b2BodyDef_p0:l$,_emscripten_bind_b2BroadPhase__b2BroadPhase_p0:g8,_emscripten_bind_b2World__SetDebugDraw_p1:hz,_emscripten_bind_b2MouseJointDef__set_frequencyHz_p1:oH,_emscripten_bind_b2WheelJointDef__get_frequencyHz_p0:m1,_emscripten_bind_b2Filter__b2Filter_p0:lY,_emscripten_bind_b2World____destroy___p0:h6,_emscripten_bind_b2Body__SetBullet_p1:kS,_emscripten_bind_b2Body__GetAngle_p0:jS,_emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0:oL,_emscripten_bind_b2Contact__GetNext_p0:jB,_emscripten_bind_b2World__DrawDebugData_p0:h_,_emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1:nN,_emscripten_bind_b2WheelJointDef__get_localAnchorA_p0:m4,_emscripten_bind_b2PulleyJointDef__get_lengthB_p0:nZ,_strlen:p_,_emscripten_bind_b2FixtureDef__set_filter_p1:nk,_emscripten_bind_b2ChainShape__CreateChain_p2:i5,_emscripten_bind_b2Body__GetLocalVector_p1:lO,_emscripten_bind_b2FrictionJointDef__set_maxTorque_p1:la,_emscripten_bind_b2ChainShape__ComputeAABB_p3:ja,_emscripten_bind_b2CircleShape__GetSupport_p1:ha,_emscripten_bind_b2World__GetContinuousPhysics_p0:hn,_emscripten_bind_b2FrictionJointDef__get_maxForce_p0:k6,_emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1:nD,_emscripten_bind_b2JointDef__set_type_p1:od,_emscripten_bind_b2Color__Set_p3:oo,_emscripten_bind_b2Joint__GetBodyB_p0:hR,_emscripten_bind_b2ContactManager__set_m_broadPhase_p1:gY,_emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1:lL,_emscripten_bind_b2Vec2__Length_p0:m7,_emscripten_bind_b2JointDef__get_collideConnected_p0:oe,_emscripten_bind_b2BroadPhase__GetTreeQuality_p0:gN,_emscripten_bind_b2WheelJointDef__get_dampingRatio_p0:nw,_emscripten_bind_b2Joint__GetCollideConnected_p0:iv,_emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1:k5,_emscripten_bind_b2EdgeShape__ComputeAABB_p3:kn,_emscripten_bind_b2BodyDef__set_awake_p1:lE,_emscripten_bind_b2PolygonShape__RayCast_p4:kd,_emscripten_bind_b2CircleShape__ComputeMass_p2:ia,_emscripten_bind_b2Contact__IsEnabled_p0:jG,_emscripten_bind_b2Vec2__SetZero_p0:l7,_emscripten_bind_b2Fixture__SetSensor_p1:gG,_emscripten_bind_b2Shape__GetType_p0:jR,_emscripten_bind_b2WeldJointDef__get_localAnchorB_p0:ox,_emscripten_bind_b2ContactManager__set_m_allocator_p1:gp,_emscripten_bind_b2WheelJointDef__set_motorSpeed_p1:m_,_emscripten_bind_b2Contact__Evaluate_p3:kt,_emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1:nX,_emscripten_bind_b2PulleyJointDef__get_lengthA_p0:n_,_emscripten_bind_b2Shape__get_m_radius_p0:jP,_emscripten_bind_b2ChainShape__set_m_count_p1:iH,_emscripten_bind_b2Contact__ResetFriction_p0:ks,_emscripten_bind_b2DynamicTree__GetFatAABB_p1:iQ,_emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0:oV,_emscripten_bind_b2Fixture__GetBody_p0:gB,_emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1:m2,_emscripten_bind_b2Vec2__LengthSquared_p0:l5,_emscripten_bind_b2Contact__GetFixtureA_p0:jJ,_emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1:nG,_emscripten_bind_b2EdgeShape__ComputeMass_p2:kk,_emscripten_bind_b2Transform__SetIdentity_p0:om,_emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1:k4,_emscripten_bind_b2Body__SetTransform_p2:kD,_emscripten_bind_b2StackAllocator__b2StackAllocator_p0:lT,_emscripten_bind_b2MouseJointDef__set_maxForce_p1:oF,_emscripten_bind_b2Vec2__set_y_p1:lJ,_emscripten_bind_b2CircleShape__Clone_p1:ib,_emscripten_bind_b2Color____destroy___p0:o1,_emscripten_bind_b2Fixture__GetRestitution_p0:gx,_emscripten_bind_b2DistanceJointDef__set_length_p1:pd,_emscripten_bind_b2PolygonShape__Clone_p1:kc,_emscripten_bind_b2Color__b2Color_p3:o3,_emscripten_bind_b2Body__ApplyForceToCenter_p1:j6,_emscripten_bind_b2Joint__GetReactionForce_p1:iM,_emscripten_bind_b2Body__SetFixedRotation_p1:lR,_emscripten_bind_b2RopeJointDef____destroy___p0:pH,_emscripten_bind_b2CircleShape____destroy___p0:h9,_emscripten_bind_b2Shape__set_m_radius_p1:jQ,_emscripten_bind_b2JointDef__get_bodyA_p0:n8,_emscripten_bind_b2World__GetContactCount_p0:hB,_emscripten_bind_b2Fixture__b2Fixture_p0:g_,_emscripten_bind_b2StackAllocator__Allocate_p1:lU,_emscripten_bind_b2Body__SetGravityScale_p1:jW,_emscripten_bind_b2BroadPhase__CreateProxy_p2:hV,_emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0:o7,_emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1:mC,_emscripten_bind_b2Filter____destroy___p0:lX,_emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1:mT,_emscripten_bind_b2Fixture__GetUserData_p0:gE,_emscripten_bind_b2RopeJointDef__get_localAnchorA_p0:pw,_emscripten_bind_b2CircleShape__get_m_radius_p0:hG,_emscripten_bind_b2BodyDef__set_angularVelocity_p1:lp,_emscripten_bind_b2Color__get_b_p0:op,_emscripten_bind_b2BroadPhase__GetProxyCount_p0:hb,_emscripten_bind_b2MouseJointDef__set_target_p1:oE,_emscripten_bind_b2Body__GetFixtureList_p0:jZ,_emscripten_bind_b2PolygonShape__TestPoint_p2:kh,_emscripten_bind_b2WheelJointDef__set_localAnchorB_p1:m0,_emscripten_bind_b2Vec2__IsValid_p0:l4,_emscripten_bind_b2Color__b2Color_p0:o2,_emscripten_bind_b2BroadPhase__TestOverlap_p2:hT,_emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1:mB,_emscripten_bind_b2Joint__GetAnchorB_p0:iL,_emscripten_bind_b2CircleShape__set_m_radius_p1:hF,_emscripten_bind_b2DistanceProxy__set_m_count_p1:mn,_emscripten_bind_b2World__GetContactManager_p0:hh,_emscripten_bind_b2Contact__GetFixtureB_p0:jH,_emscripten_bind_b2Rot__GetYAxis_p0:nq,_emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1:nF,_emscripten_bind_b2Shape__Clone_p1:kv,_emscripten_bind_b2ContactManager__Destroy_p1:gX,_emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0:mD,_emscripten_bind_b2BodyDef__set_linearDamping_p1:lC,_emscripten_bind_b2BroadPhase__GetTreeBalance_p0:hS,_emscripten_bind_b2WheelJointDef__get_localAxisA_p0:m$,_emscripten_bind_b2FixtureDef__get_density_p0:mr,_emscripten_bind_b2Draw__ClearFlags_p1:hM,_emscripten_bind_b2WeldJointDef__get_localAnchorA_p0:ov,_emscripten_bind_b2PolygonShape__GetType_p0:ju,_emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1:oN,_emscripten_bind_b2BroadPhase__GetUserData_p1:g6,_emscripten_bind_b2Rot__get_c_p0:mY,_emscripten_bind_b2World__GetAutoClearForces_p0:hm,_emscripten_bind_b2Rot__GetAngle_p0:np,_emscripten_bind_b2FixtureDef__set_isSensor_p1:mw,_emscripten_bind_b2World__CreateJoint_p1:h4,_emscripten_bind_b2Color__set_b_p1:on,_emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0:mF,_emscripten_bind_b2Body__GetLocalCenter_p0:kM,_emscripten_bind_b2Body__SetAngularVelocity_p1:j4,_emscripten_bind_b2CircleShape__TestPoint_p2:ig,_emscripten_bind_b2Body__SetAwake_p1:lN,_emscripten_bind_b2Filter__set_categoryBits_p1:k$,_emscripten_bind_b2ChainShape__ComputeMass_p2:i6,_emscripten_bind_b2World__CreateBody_p1:h$,_emscripten_bind_b2JointDef__get_bodyB_p0:oc,_emscripten_bind_b2ChainShape__get_m_count_p0:iD,_emscripten_bind_b2Joint__GetType_p0:it,_emscripten_bind_b2BodyDef__set_position_p1:lh,_emscripten_bind_b2WheelJointDef__set_localAxisA_p1:nB,_emscripten_bind_b2CircleShape__GetVertex_p1:hH,_emscripten_bind_b2Timer__GetMilliseconds_p0:ir,_emscripten_bind_b2World__SetDestructionListener_p1:hq,_emscripten_bind_b2Joint__GetAnchorA_p0:iJ,_emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0:nf,_emscripten_bind_b2Transform____destroy___p0:oZ,_emscripten_bind_b2PolygonShape__ComputeMass_p2:jn,_emscripten_bind_b2Draw__DrawTransform_p1:ii,_emscripten_bind_b2Transform__b2Transform_p0:o$,_emscripten_bind_b2Body__GetWorld_p0:kQ,_emscripten_bind_b2PolygonShape__b2PolygonShape_p0:ki,_emscripten_bind_b2WeldJointDef__set_frequencyHz_p1:oz,_emscripten_bind_b2Joint__GetUserData_p0:is,_emscripten_bind_b2Body__ResetMassData_p0:kF,_emscripten_bind_b2Timer__b2Timer_p0:iY,_emscripten_bind_b2World__SetContinuousPhysics_p1:hj,_emscripten_bind_b2ContactManager__FindNewContacts_p0:gV,_emscripten_bind_b2Filter__set_maskBits_p1:k_,_emscripten_bind_b2DynamicTree__GetMaxBalance_p0:iS,_emscripten_bind_b2PolygonShape__GetVertex_p1:jp,_emscripten_bind_b2WeldJointDef__get_frequencyHz_p0:or,_emscripten_bind_b2ContactListener__BeginContact_p1:i1,_emscripten_bind_b2WeldJointDef__get_dampingRatio_p0:oy,_emscripten_bind_b2ChainShape__Clone_p1:i7,_emscripten_bind_b2GearJointDef__b2GearJointDef_p0:pE,_emscripten_bind_b2Body__ApplyForce_p2:j_,_emscripten_bind_b2ContactEdge__get_contact_p0:ps,_emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0:nJ,_emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0:oR,_emscripten_bind_b2PulleyJointDef__set_lengthA_p1:n6,_emscripten_bind_b2FixtureDef__get_friction_p0:my,_emscripten_bind_b2Body__GetType_p0:kT,_emscripten_bind_b2World__Step_p3:h2,_emscripten_bind_b2Vec2__set_x_p1:lF,_emscripten_bind_b2ContactManager__b2ContactManager_p0:gS,_emscripten_bind_b2Contact__GetRestitution_p0:jD,_emscripten_bind_b2MouseJointDef____destroy___p0:o6,_emscripten_bind_b2Body__GetTransform_p0:j9,_emscripten_bind_b2RopeJointDef__get_maxLength_p0:pu,_emscripten_bind_b2ChainShape__set_m_vertices_p1:iF,_emscripten_bind_b2EdgeShape__TestPoint_p2:kp,_emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0:pI,_emscripten_bind_b2ContactManager__AddPair_p2:gT,_emscripten_bind_b2Contact__GetFriction_p0:jE,_emscripten_bind_b2ChainShape__SetPrevVertex_p1:iE,_memcpy:pY,_emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1:kE,_emscripten_bind_b2DynamicTree__GetAreaRatio_p0:iy,_emscripten_bind_b2World__SetGravity_p1:hk,_emscripten_bind_b2PulleyJointDef__Initialize_p7:oW,_emscripten_bind_b2World__GetTreeQuality_p0:hd,_emscripten_bind_b2BroadPhase__DestroyProxy_p1:hX,_emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1:nW,_emscripten_bind_b2ChainShape__GetChildEdge_p2:i8,_emscripten_bind_b2EdgeShape__b2EdgeShape_p0:kq,_emscripten_bind_b2ContactEdge__set_contact_p1:pl,_emscripten_bind_b2ChainShape__GetType_p0:iz,_emscripten_bind_b2Fixture__SetFilterData_p1:gZ,_emscripten_bind_b2Body__ApplyAngularImpulse_p1:kX,_emscripten_bind_b2ChainShape__TestPoint_p2:jd,_emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0:nU,_emscripten_bind_b2CircleShape__get_m_p_p0:hK,_emscripten_bind_b2BodyDef__get_awake_p0:le,_emscripten_bind_b2Body__CreateFixture_p1:kH,_emscripten_bind_b2Body__CreateFixture_p2:kI,_emscripten_bind_b2GearJointDef____destroy___p0:pD,_emscripten_bind_b2Fixture__GetDensity_p0:gM,_emscripten_bind_b2PolygonShape__set_m_vertexCount_p1:js,_emscripten_bind_b2World__SetContactListener_p1:hi,_emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0:n1,_emscripten_bind_b2FixtureDef__set_shape_p1:mq,_emscripten_bind_b2Joint__Dump_p0:iK,_emscripten_bind_b2Shape__TestPoint_p2:kz,_emscripten_bind_b2ChainShape__RayCast_p4:jb,_emscripten_bind_b2Transform__get_p_p0:ok,_emscripten_bind_b2Body__IsBullet_p0:kP,_emscripten_bind_b2WeldJointDef____destroy___p0:o4,_emscripten_bind_b2CircleShape__GetChildCount_p0:ie,_emscripten_bind_b2Draw__DrawCircle_p3:im,_emscripten_bind_b2Body__GetWorldPoint_p1:lM,_emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1:mO,_emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1:nK,_emscripten_bind_b2BodyDef__set_bullet_p1:lv,_emscripten_bind_b2BodyDef__get_angularVelocity_p0:lz,_emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0:mN,_emscripten_bind_b2Vec2__b2Vec2_p0:l2,_emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0:oP,_emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0:n2,_emscripten_bind_b2GearJointDef__set_joint2_p1:pg,_emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0:oT,_emscripten_bind_b2BodyDef__set_userData_p1:lq,_emscripten_bind_b2BroadPhase____destroy___p0:g7,_emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0:mM,_emscripten_bind_b2ChainShape__set_m_radius_p1:iA,_emscripten_bind_b2GearJointDef__get_joint2_p0:pj,_emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1:mV,_emscripten_bind_b2Fixture__SetDensity_p1:gF,_emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1:nR,_emscripten_bind_b2Body__IsAwake_p0:j8,_emscripten_bind_b2PolygonShape__SetAsBox_p4:ke,_emscripten_bind_b2PolygonShape__SetAsBox_p2:jq,_emscripten_bind_b2GearJointDef__set_joint1_p1:pf,_emscripten_bind_b2Draw__DrawSolidCircle_p4:ik,_emscripten_bind_b2World__GetSubStepping_p0:hg,_emscripten_bind_b2Body__SetLinearDamping_p1:kR,_emscripten_bind_b2Fixture__SetFriction_p1:gy,_emscripten_bind_b2Filter__get_groupIndex_p0:k0,_emscripten_bind_b2FixtureDef__get_isSensor_p0:mo,_emscripten_bind_b2Vec2__op_mul_p1:l8,_emscripten_bind_b2DistanceProxy__Set_p2:ne,_emscripten_bind_b2EdgeShape__Set_p2:jx,_emscripten_bind_b2BodyDef__get_userData_p0:lk,_emscripten_bind_b2CircleShape__set_m_p_p1:hJ,_emscripten_bind_b2World__SetContactFilter_p1:hD,_emscripten_bind_b2WheelJointDef__set_dampingRatio_p1:nA,_emscripten_bind_b2DistanceProxy__get_m_count_p0:mj,_emscripten_bind_b2WeldJointDef__set_dampingRatio_p1:ot,_emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1:oM,_memset:pZ,_emscripten_bind_b2World__GetTreeBalance_p0:hZ,_emscripten_bind_b2ContactListener__b2ContactListener_p0:i$,_emscripten_bind_b2Rot____destroy___p0:nn,_emscripten_bind_b2RopeJointDef__set_maxLength_p1:py,_emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0:n7,_emscripten_bind_b2Body__GetNext_p0:j1,_emscripten_bind_b2BroadPhase__GetTreeHeight_p0:gO,_emscripten_bind_b2Draw__DrawSegment_p3:io,_emscripten_bind_b2Body__IsActive_p0:kW,_emscripten_bind_b2Vec2__Set_p2:lG,_emscripten_bind_b2ContactEdge__b2ContactEdge_p0:pG,_emscripten_bind_b2Vec3__b2Vec3_p3:nc,_emscripten_bind_b2Vec3__b2Vec3_p0:nb,_emscripten_bind_b2JointDef__b2JointDef_p0:oY,_emscripten_bind_b2Vec2__get_x_p0:lH,_emscripten_bind_b2PulleyJointDef____destroy___p0:oU,_emscripten_bind_b2FixtureDef____destroy___p0:ni,_emscripten_bind_b2EdgeShape__Clone_p1:kl,_emscripten_bind_b2Body__GetUserData_p0:jT,_emscripten_bind_b2Body__SetUserData_p1:jX,_emscripten_bind_b2FixtureDef__set_friction_p1:mz,_emscripten_bind_b2DistanceJointDef____destroy___p0:o8,_emscripten_bind_b2FrictionJointDef__Initialize_p3:lc,_emscripten_bind_b2Body__SetSleepingAllowed_p1:j2,_emscripten_bind_b2Body__SetLinearVelocity_p1:j$,_emscripten_bind_b2Body__ApplyLinearImpulse_p2:kK,_emscripten_bind_b2ContactManager__set_m_contactList_p1:gr,_emscripten_bind_b2Transform__get_q_p0:ol,_emscripten_bind_b2JointDef__set_collideConnected_p1:og,_emscripten_bind_b2CircleShape__ComputeAABB_p3:id,_emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0:nH,_emscripten_bind_b2BlockAllocator__Allocate_p1:jj,_emscripten_bind_b2GearJointDef__get_joint1_p0:pi,_emscripten_bind_b2GearJointDef__set_ratio_p1:ph,_emscripten_bind_b2ContactEdge____destroy___p0:pF,_emscripten_bind_b2RevoluteJointDef__Initialize_p3:nT,_emscripten_bind_b2BodyDef__set_angle_p1:lx,_emscripten_bind_b2PrismaticJointDef__Initialize_p4:mK,_emscripten_bind_b2Body__GetContactList_p0:kN,_emscripten_bind_b2PulleyJointDef__get_ratio_p0:nY,_emscripten_bind_b2Body__GetWorldCenter_p0:ka,_emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1:nS,_emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1:oJ,_emscripten_bind_b2BodyDef__set_angularDamping_p1:ll,_emscripten_bind_b2Shape__ComputeAABB_p3:kx,_emscripten_bind_b2Filter__get_categoryBits_p0:k3,_emscripten_bind_b2Vec3__set_z_p1:l9,_emscripten_bind_b2Transform__set_p_p1:oi,_emscripten_bind_b2Fixture__GetNext_p0:gC,_emscripten_bind_b2World__SetWarmStarting_p1:hC,_emscripten_bind_b2Vec3__op_sub_p0:nd,_emscripten_bind_b2ContactManager__Collide_p0:gU,_emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0:nP,_emscripten_bind_b2ContactManager__get_m_contactListener_p0:gs,_emscripten_bind_b2World__RayCast_p3:h5,_emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1:mG,_emscripten_bind_b2EdgeShape__GetType_p0:jA,_emscripten_bind_b2BodyDef__get_gravityScale_p0:lo,_emscripten_bind_b2Body__DestroyFixture_p1:lQ,_emscripten_bind_b2WeldJointDef__set_referenceAngle_p1:ou,_emscripten_bind_b2Vec3__op_add_p1:mc,_emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0:mP,_emscripten_bind_b2BodyDef__get_angle_p0:ly,_emscripten_bind_b2DynamicTree__GetHeight_p0:ix,stackAlloc:bS,stackSave:bT,stackRestore:bU,setThrew:bV,setTempRet0:bW,setTempRet1:bX,setTempRet2:bY,setTempRet3:bZ,setTempRet4:b_,setTempRet5:b$,setTempRet6:b0,setTempRet7:b1,setTempRet8:b2,setTempRet9:b3,dynCall_viiiii:p0,dynCall_viifii:ql,dynCall_vif:qG,dynCall_viffif:q$,dynCall_vi:rk,dynCall_vii:rF,dynCall_ii:r_,dynCall_viifi:sj,dynCall_if:sE,dynCall_iiiiii:sZ,dynCall_iiii:ti,dynCall_fif:tD,dynCall_viff:tY,dynCall_viiiiiiif:uh,dynCall_vifff:uC,dynCall_viiiiii:uX,dynCall_iiif:vg,dynCall_iif:vB,dynCall_vifii:vW,dynCall_fi:wf,dynCall_iii:wA,dynCall_fiiiif:wV,dynCall_i:xe,dynCall_iiiii:xz,dynCall_ifff:xU,dynCall_iff:yd,dynCall_viii:yy,dynCall_v:yT,dynCall_viif:zc,dynCall_viiii:zx}})
// EMSCRIPTEN_END_ASM
({ Math: Math, Int8Array: Int8Array, Int16Array: Int16Array, Int32Array: Int32Array, Uint8Array: Uint8Array, Uint16Array: Uint16Array, Uint32Array: Uint32Array, Float32Array: Float32Array, Float64Array: Float64Array }, { abort: abort, assert: assert, asmPrintInt: asmPrintInt, asmPrintFloat: asmPrintFloat, copyTempDouble: copyTempDouble, copyTempFloat: copyTempFloat, min: Math_min, jsCall: jsCall, invoke_viiiii: invoke_viiiii, invoke_viifii: invoke_viifii, invoke_vif: invoke_vif, invoke_viffif: invoke_viffif, invoke_vi: invoke_vi, invoke_vii: invoke_vii, invoke_ii: invoke_ii, invoke_viifi: invoke_viifi, invoke_if: invoke_if, invoke_iiiiii: invoke_iiiiii, invoke_iiii: invoke_iiii, invoke_fif: invoke_fif, invoke_viff: invoke_viff, invoke_viiiiiiif: invoke_viiiiiiif, invoke_vifff: invoke_vifff, invoke_viiiiii: invoke_viiiiii, invoke_iiif: invoke_iiif, invoke_iif: invoke_iif, invoke_vifii: invoke_vifii, invoke_fi: invoke_fi, invoke_iii: invoke_iii, invoke_fiiiif: invoke_fiiiif, invoke_i: invoke_i, invoke_iiiii: invoke_iiiii, invoke_ifff: invoke_ifff, invoke_iff: invoke_iff, invoke_viii: invoke_viii, invoke_v: invoke_v, invoke_viif: invoke_viif, invoke_viiii: invoke_viiii, _llvm_va_end: _llvm_va_end, _cosf: _cosf, _floorf: _floorf, ___cxa_throw: ___cxa_throw, _abort: _abort, _fprintf: _fprintf, _printf: _printf, __reallyNegative: __reallyNegative, _sqrtf: _sqrtf, _sysconf: _sysconf, _llvm_lifetime_start: _llvm_lifetime_start, ___setErrNo: ___setErrNo, _fwrite: _fwrite, _llvm_eh_exception: _llvm_eh_exception, _write: _write, _exit: _exit, _llvm_lifetime_end: _llvm_lifetime_end, ___cxa_find_matching_catch: ___cxa_find_matching_catch, _atan2f: _atan2f, ___cxa_pure_virtual: ___cxa_pure_virtual, ___cxa_is_number_type: ___cxa_is_number_type, _time: _time, __formatString: __formatString, ___cxa_does_inherit: ___cxa_does_inherit, ___cxa_guard_acquire: ___cxa_guard_acquire, __ZSt9terminatev: __ZSt9terminatev, _sinf: _sinf, ___assert_func: ___assert_func, __ZSt18uncaught_exceptionv: __ZSt18uncaught_exceptionv, _pwrite: _pwrite, _sbrk: _sbrk, __ZNSt9exceptionD2Ev: __ZNSt9exceptionD2Ev, ___cxa_allocate_exception: ___cxa_allocate_exception, ___errno_location: ___errno_location, ___gxx_personality_v0: ___gxx_personality_v0, ___cxa_call_unexpected: ___cxa_call_unexpected, ___cxa_guard_release: ___cxa_guard_release, __exit: __exit, ___resumeException: ___resumeException, STACKTOP: STACKTOP, STACK_MAX: STACK_MAX, tempDoublePtr: tempDoublePtr, ABORT: ABORT, NaN: NaN, Infinity: Infinity, __ZTVN10__cxxabiv120__si_class_type_infoE: __ZTVN10__cxxabiv120__si_class_type_infoE, __ZTVN10__cxxabiv117__class_type_infoE: __ZTVN10__cxxabiv117__class_type_infoE, __ZTISt9exception: __ZTISt9exception }, buffer);
var _emscripten_bind_b2Fixture__SetRestitution_p1 = Module["_emscripten_bind_b2Fixture__SetRestitution_p1"] = asm._emscripten_bind_b2Fixture__SetRestitution_p1;
var _emscripten_bind_b2PolygonShape____destroy___p0 = Module["_emscripten_bind_b2PolygonShape____destroy___p0"] = asm._emscripten_bind_b2PolygonShape____destroy___p0;
var _emscripten_bind_b2DistanceProxy__get_m_vertices_p0 = Module["_emscripten_bind_b2DistanceProxy__get_m_vertices_p0"] = asm._emscripten_bind_b2DistanceProxy__get_m_vertices_p0;
var _emscripten_bind_b2WheelJointDef__Initialize_p4 = Module["_emscripten_bind_b2WheelJointDef__Initialize_p4"] = asm._emscripten_bind_b2WheelJointDef__Initialize_p4;
var _emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1"] = asm._emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1;
var _emscripten_bind_b2Body__IsSleepingAllowed_p0 = Module["_emscripten_bind_b2Body__IsSleepingAllowed_p0"] = asm._emscripten_bind_b2Body__IsSleepingAllowed_p0;
var _emscripten_bind_b2Vec2__b2Vec2_p2 = Module["_emscripten_bind_b2Vec2__b2Vec2_p2"] = asm._emscripten_bind_b2Vec2__b2Vec2_p2;
var _emscripten_bind_b2Body__GetLinearDamping_p0 = Module["_emscripten_bind_b2Body__GetLinearDamping_p0"] = asm._emscripten_bind_b2Body__GetLinearDamping_p0;
var _emscripten_bind_b2JointDef__get_type_p0 = Module["_emscripten_bind_b2JointDef__get_type_p0"] = asm._emscripten_bind_b2JointDef__get_type_p0;
var _emscripten_bind_b2FixtureDef__get_shape_p0 = Module["_emscripten_bind_b2FixtureDef__get_shape_p0"] = asm._emscripten_bind_b2FixtureDef__get_shape_p0;
var _emscripten_bind_b2WheelJointDef__set_frequencyHz_p1 = Module["_emscripten_bind_b2WheelJointDef__set_frequencyHz_p1"] = asm._emscripten_bind_b2WheelJointDef__set_frequencyHz_p1;
var _emscripten_bind_b2BlockAllocator____destroy___p0 = Module["_emscripten_bind_b2BlockAllocator____destroy___p0"] = asm._emscripten_bind_b2BlockAllocator____destroy___p0;
var _emscripten_bind_b2Vec2__op_add_p1 = Module["_emscripten_bind_b2Vec2__op_add_p1"] = asm._emscripten_bind_b2Vec2__op_add_p1;
var _emscripten_bind_b2World__GetJointList_p0 = Module["_emscripten_bind_b2World__GetJointList_p0"] = asm._emscripten_bind_b2World__GetJointList_p0;
var _emscripten_bind_b2Transform__Set_p2 = Module["_emscripten_bind_b2Transform__Set_p2"] = asm._emscripten_bind_b2Transform__Set_p2;
var _emscripten_bind_b2EdgeShape__RayCast_p4 = Module["_emscripten_bind_b2EdgeShape__RayCast_p4"] = asm._emscripten_bind_b2EdgeShape__RayCast_p4;
var _emscripten_bind_b2Vec2__get_y_p0 = Module["_emscripten_bind_b2Vec2__get_y_p0"] = asm._emscripten_bind_b2Vec2__get_y_p0;
var _emscripten_bind_b2DynamicTree__Validate_p0 = Module["_emscripten_bind_b2DynamicTree__Validate_p0"] = asm._emscripten_bind_b2DynamicTree__Validate_p0;
var _emscripten_bind_b2DynamicTree__DestroyProxy_p1 = Module["_emscripten_bind_b2DynamicTree__DestroyProxy_p1"] = asm._emscripten_bind_b2DynamicTree__DestroyProxy_p1;
var _emscripten_bind_b2Joint__IsActive_p0 = Module["_emscripten_bind_b2Joint__IsActive_p0"] = asm._emscripten_bind_b2Joint__IsActive_p0;
var _emscripten_bind_b2DynamicTree__b2DynamicTree_p0 = Module["_emscripten_bind_b2DynamicTree__b2DynamicTree_p0"] = asm._emscripten_bind_b2DynamicTree__b2DynamicTree_p0;
var _emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0;
var _emscripten_bind_b2DistanceProxy__GetVertex_p1 = Module["_emscripten_bind_b2DistanceProxy__GetVertex_p1"] = asm._emscripten_bind_b2DistanceProxy__GetVertex_p1;
var _emscripten_bind_b2EdgeShape__get_m_radius_p0 = Module["_emscripten_bind_b2EdgeShape__get_m_radius_p0"] = asm._emscripten_bind_b2EdgeShape__get_m_radius_p0;
var _emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0;
var _emscripten_bind_b2World__GetJointCount_p0 = Module["_emscripten_bind_b2World__GetJointCount_p0"] = asm._emscripten_bind_b2World__GetJointCount_p0;
var _emscripten_bind_b2DynamicTree__CreateProxy_p2 = Module["_emscripten_bind_b2DynamicTree__CreateProxy_p2"] = asm._emscripten_bind_b2DynamicTree__CreateProxy_p2;
var _emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0;
var _emscripten_bind_b2Body__GetGravityScale_p0 = Module["_emscripten_bind_b2Body__GetGravityScale_p0"] = asm._emscripten_bind_b2Body__GetGravityScale_p0;
var _emscripten_bind_b2Fixture__Dump_p1 = Module["_emscripten_bind_b2Fixture__Dump_p1"] = asm._emscripten_bind_b2Fixture__Dump_p1;
var _emscripten_bind_b2World__GetBodyList_p0 = Module["_emscripten_bind_b2World__GetBodyList_p0"] = asm._emscripten_bind_b2World__GetBodyList_p0;
var _emscripten_bind_b2World__GetContactList_p0 = Module["_emscripten_bind_b2World__GetContactList_p0"] = asm._emscripten_bind_b2World__GetContactList_p0;
var _emscripten_bind_b2StackAllocator____destroy___p0 = Module["_emscripten_bind_b2StackAllocator____destroy___p0"] = asm._emscripten_bind_b2StackAllocator____destroy___p0;
var _emscripten_bind_b2Vec2__Skew_p0 = Module["_emscripten_bind_b2Vec2__Skew_p0"] = asm._emscripten_bind_b2Vec2__Skew_p0;
var _emscripten_bind_b2BodyDef__get_linearVelocity_p0 = Module["_emscripten_bind_b2BodyDef__get_linearVelocity_p0"] = asm._emscripten_bind_b2BodyDef__get_linearVelocity_p0;
var _emscripten_bind_b2Body__GetPosition_p0 = Module["_emscripten_bind_b2Body__GetPosition_p0"] = asm._emscripten_bind_b2Body__GetPosition_p0;
var _emscripten_bind_b2World__GetTreeHeight_p0 = Module["_emscripten_bind_b2World__GetTreeHeight_p0"] = asm._emscripten_bind_b2World__GetTreeHeight_p0;
var _emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1;
var _emscripten_bind_b2ChainShape__b2ChainShape_p0 = Module["_emscripten_bind_b2ChainShape__b2ChainShape_p0"] = asm._emscripten_bind_b2ChainShape__b2ChainShape_p0;
var _emscripten_bind_b2CircleShape__RayCast_p4 = Module["_emscripten_bind_b2CircleShape__RayCast_p4"] = asm._emscripten_bind_b2CircleShape__RayCast_p4;
var _emscripten_bind_b2MouseJointDef__get_dampingRatio_p0 = Module["_emscripten_bind_b2MouseJointDef__get_dampingRatio_p0"] = asm._emscripten_bind_b2MouseJointDef__get_dampingRatio_p0;
var _emscripten_bind_b2JointDef__set_bodyB_p1 = Module["_emscripten_bind_b2JointDef__set_bodyB_p1"] = asm._emscripten_bind_b2JointDef__set_bodyB_p1;
var _malloc = Module["_malloc"] = asm._malloc;
var _emscripten_bind_b2Fixture__GetAABB_p1 = Module["_emscripten_bind_b2Fixture__GetAABB_p1"] = asm._emscripten_bind_b2Fixture__GetAABB_p1;
var _emscripten_bind_b2BroadPhase__TouchProxy_p1 = Module["_emscripten_bind_b2BroadPhase__TouchProxy_p1"] = asm._emscripten_bind_b2BroadPhase__TouchProxy_p1;
var _emscripten_bind_b2World__GetAllowSleeping_p0 = Module["_emscripten_bind_b2World__GetAllowSleeping_p0"] = asm._emscripten_bind_b2World__GetAllowSleeping_p0;
var _emscripten_bind_b2World__GetWarmStarting_p0 = Module["_emscripten_bind_b2World__GetWarmStarting_p0"] = asm._emscripten_bind_b2World__GetWarmStarting_p0;
var _emscripten_bind_b2Rot__b2Rot_p1 = Module["_emscripten_bind_b2Rot__b2Rot_p1"] = asm._emscripten_bind_b2Rot__b2Rot_p1;
var _emscripten_bind_b2Rot__b2Rot_p0 = Module["_emscripten_bind_b2Rot__b2Rot_p0"] = asm._emscripten_bind_b2Rot__b2Rot_p0;
var _emscripten_bind_b2MouseJointDef__get_frequencyHz_p0 = Module["_emscripten_bind_b2MouseJointDef__get_frequencyHz_p0"] = asm._emscripten_bind_b2MouseJointDef__get_frequencyHz_p0;
var _emscripten_bind_b2Fixture__SetUserData_p1 = Module["_emscripten_bind_b2Fixture__SetUserData_p1"] = asm._emscripten_bind_b2Fixture__SetUserData_p1;
var _emscripten_bind_b2MouseJointDef__get_target_p0 = Module["_emscripten_bind_b2MouseJointDef__get_target_p0"] = asm._emscripten_bind_b2MouseJointDef__get_target_p0;
var _emscripten_bind_b2ContactManager__set_m_contactFilter_p1 = Module["_emscripten_bind_b2ContactManager__set_m_contactFilter_p1"] = asm._emscripten_bind_b2ContactManager__set_m_contactFilter_p1;
var _emscripten_bind_b2FrictionJointDef____destroy___p0 = Module["_emscripten_bind_b2FrictionJointDef____destroy___p0"] = asm._emscripten_bind_b2FrictionJointDef____destroy___p0;
var _emscripten_bind_b2Filter__get_maskBits_p0 = Module["_emscripten_bind_b2Filter__get_maskBits_p0"] = asm._emscripten_bind_b2Filter__get_maskBits_p0;
var _emscripten_bind_b2World__Dump_p0 = Module["_emscripten_bind_b2World__Dump_p0"] = asm._emscripten_bind_b2World__Dump_p0;
var _emscripten_bind_b2RevoluteJointDef____destroy___p0 = Module["_emscripten_bind_b2RevoluteJointDef____destroy___p0"] = asm._emscripten_bind_b2RevoluteJointDef____destroy___p0;
var _emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0;
var _emscripten_bind_b2BodyDef__get_bullet_p0 = Module["_emscripten_bind_b2BodyDef__get_bullet_p0"] = asm._emscripten_bind_b2BodyDef__get_bullet_p0;
var _emscripten_bind_b2Body__SetAngularDamping_p1 = Module["_emscripten_bind_b2Body__SetAngularDamping_p1"] = asm._emscripten_bind_b2Body__SetAngularDamping_p1;
var _emscripten_bind_b2DynamicTree__RebuildBottomUp_p0 = Module["_emscripten_bind_b2DynamicTree__RebuildBottomUp_p0"] = asm._emscripten_bind_b2DynamicTree__RebuildBottomUp_p0;
var _emscripten_bind_b2Fixture__GetFilterData_p0 = Module["_emscripten_bind_b2Fixture__GetFilterData_p0"] = asm._emscripten_bind_b2Fixture__GetFilterData_p0;
var _emscripten_bind_b2BodyDef__get_position_p0 = Module["_emscripten_bind_b2BodyDef__get_position_p0"] = asm._emscripten_bind_b2BodyDef__get_position_p0;
var _emscripten_bind_b2PolygonShape__get_m_radius_p0 = Module["_emscripten_bind_b2PolygonShape__get_m_radius_p0"] = asm._emscripten_bind_b2PolygonShape__get_m_radius_p0;
var _emscripten_bind_b2ContactEdge__set_next_p1 = Module["_emscripten_bind_b2ContactEdge__set_next_p1"] = asm._emscripten_bind_b2ContactEdge__set_next_p1;
var _emscripten_bind_b2Transform__b2Transform_p2 = Module["_emscripten_bind_b2Transform__b2Transform_p2"] = asm._emscripten_bind_b2Transform__b2Transform_p2;
var _emscripten_bind_b2FrictionJointDef__get_maxTorque_p0 = Module["_emscripten_bind_b2FrictionJointDef__get_maxTorque_p0"] = asm._emscripten_bind_b2FrictionJointDef__get_maxTorque_p0;
var _emscripten_bind_b2WeldJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2WeldJointDef__set_localAnchorB_p1"] = asm._emscripten_bind_b2WeldJointDef__set_localAnchorB_p1;
var _emscripten_bind_b2World__GetProxyCount_p0 = Module["_emscripten_bind_b2World__GetProxyCount_p0"] = asm._emscripten_bind_b2World__GetProxyCount_p0;
var _emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1;
var _emscripten_bind_b2PolygonShape__set_m_centroid_p1 = Module["_emscripten_bind_b2PolygonShape__set_m_centroid_p1"] = asm._emscripten_bind_b2PolygonShape__set_m_centroid_p1;
var _emscripten_bind_b2Vec3____destroy___p0 = Module["_emscripten_bind_b2Vec3____destroy___p0"] = asm._emscripten_bind_b2Vec3____destroy___p0;
var _emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0;
var _emscripten_bind_b2BodyDef__get_linearDamping_p0 = Module["_emscripten_bind_b2BodyDef__get_linearDamping_p0"] = asm._emscripten_bind_b2BodyDef__get_linearDamping_p0;
var _emscripten_bind_b2RayCastCallback__ReportFixture_p4 = Module["_emscripten_bind_b2RayCastCallback__ReportFixture_p4"] = asm._emscripten_bind_b2RayCastCallback__ReportFixture_p4;
var _emscripten_bind_b2Body__Dump_p0 = Module["_emscripten_bind_b2Body__Dump_p0"] = asm._emscripten_bind_b2Body__Dump_p0;
var _emscripten_bind_b2BodyDef__get_allowSleep_p0 = Module["_emscripten_bind_b2BodyDef__get_allowSleep_p0"] = asm._emscripten_bind_b2BodyDef__get_allowSleep_p0;
var _emscripten_bind_b2JointDef__set_bodyA_p1 = Module["_emscripten_bind_b2JointDef__set_bodyA_p1"] = asm._emscripten_bind_b2JointDef__set_bodyA_p1;
var _emscripten_bind_b2Fixture__GetMassData_p1 = Module["_emscripten_bind_b2Fixture__GetMassData_p1"] = asm._emscripten_bind_b2Fixture__GetMassData_p1;
var _emscripten_bind_b2Joint__GetReactionTorque_p1 = Module["_emscripten_bind_b2Joint__GetReactionTorque_p1"] = asm._emscripten_bind_b2Joint__GetReactionTorque_p1;
var _emscripten_bind_b2Rot__set_c_p1 = Module["_emscripten_bind_b2Rot__set_c_p1"] = asm._emscripten_bind_b2Rot__set_c_p1;
var _emscripten_bind_b2Vec3__op_mul_p1 = Module["_emscripten_bind_b2Vec3__op_mul_p1"] = asm._emscripten_bind_b2Vec3__op_mul_p1;
var _emscripten_bind_b2StackAllocator__GetMaxAllocation_p0 = Module["_emscripten_bind_b2StackAllocator__GetMaxAllocation_p0"] = asm._emscripten_bind_b2StackAllocator__GetMaxAllocation_p0;
var _emscripten_bind_b2World__SetAutoClearForces_p1 = Module["_emscripten_bind_b2World__SetAutoClearForces_p1"] = asm._emscripten_bind_b2World__SetAutoClearForces_p1;
var _emscripten_bind_b2Contact__SetEnabled_p1 = Module["_emscripten_bind_b2Contact__SetEnabled_p1"] = asm._emscripten_bind_b2Contact__SetEnabled_p1;
var _emscripten_bind_b2BodyDef__get_angularDamping_p0 = Module["_emscripten_bind_b2BodyDef__get_angularDamping_p0"] = asm._emscripten_bind_b2BodyDef__get_angularDamping_p0;
var _emscripten_bind_b2WeldJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2WeldJointDef__set_localAnchorA_p1"] = asm._emscripten_bind_b2WeldJointDef__set_localAnchorA_p1;
var _emscripten_bind_b2PulleyJointDef__set_lengthB_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_lengthB_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_lengthB_p1;
var _emscripten_bind_b2Vec2__op_sub_p0 = Module["_emscripten_bind_b2Vec2__op_sub_p0"] = asm._emscripten_bind_b2Vec2__op_sub_p0;
var _emscripten_bind_b2RopeJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2RopeJointDef__get_localAnchorB_p0"] = asm._emscripten_bind_b2RopeJointDef__get_localAnchorB_p0;
var _emscripten_bind_b2Contact__GetChildIndexB_p0 = Module["_emscripten_bind_b2Contact__GetChildIndexB_p0"] = asm._emscripten_bind_b2Contact__GetChildIndexB_p0;
var _emscripten_bind_b2Fixture__TestPoint_p1 = Module["_emscripten_bind_b2Fixture__TestPoint_p1"] = asm._emscripten_bind_b2Fixture__TestPoint_p1;
var _emscripten_bind_b2QueryCallback__ReportFixture_p1 = Module["_emscripten_bind_b2QueryCallback__ReportFixture_p1"] = asm._emscripten_bind_b2QueryCallback__ReportFixture_p1;
var _emscripten_bind_b2BodyDef__set_linearVelocity_p1 = Module["_emscripten_bind_b2BodyDef__set_linearVelocity_p1"] = asm._emscripten_bind_b2BodyDef__set_linearVelocity_p1;
var _emscripten_bind_b2Body__GetMass_p0 = Module["_emscripten_bind_b2Body__GetMass_p0"] = asm._emscripten_bind_b2Body__GetMass_p0;
var _emscripten_bind_b2World__QueryAABB_p2 = Module["_emscripten_bind_b2World__QueryAABB_p2"] = asm._emscripten_bind_b2World__QueryAABB_p2;
var _emscripten_bind_b2RopeJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2RopeJointDef__set_localAnchorB_p1"] = asm._emscripten_bind_b2RopeJointDef__set_localAnchorB_p1;
var _emscripten_bind_b2Body__IsFixedRotation_p0 = Module["_emscripten_bind_b2Body__IsFixedRotation_p0"] = asm._emscripten_bind_b2Body__IsFixedRotation_p0;
var _emscripten_bind_b2Rot__SetIdentity_p0 = Module["_emscripten_bind_b2Rot__SetIdentity_p0"] = asm._emscripten_bind_b2Rot__SetIdentity_p0;
var _emscripten_bind_b2DistanceProxy__set_m_vertices_p1 = Module["_emscripten_bind_b2DistanceProxy__set_m_vertices_p1"] = asm._emscripten_bind_b2DistanceProxy__set_m_vertices_p1;
var _emscripten_bind_b2Joint__GetBodyA_p0 = Module["_emscripten_bind_b2Joint__GetBodyA_p0"] = asm._emscripten_bind_b2Joint__GetBodyA_p0;
var _emscripten_bind_b2JointDef__get_userData_p0 = Module["_emscripten_bind_b2JointDef__get_userData_p0"] = asm._emscripten_bind_b2JointDef__get_userData_p0;
var _emscripten_bind_b2Draw__DrawPolygon_p3 = Module["_emscripten_bind_b2Draw__DrawPolygon_p3"] = asm._emscripten_bind_b2Draw__DrawPolygon_p3;
var _emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0 = Module["_emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0"] = asm._emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0;
var _emscripten_bind_b2ContactManager__get_m_broadPhase_p0 = Module["_emscripten_bind_b2ContactManager__get_m_broadPhase_p0"] = asm._emscripten_bind_b2ContactManager__get_m_broadPhase_p0;
var _emscripten_bind_b2Contact__GetManifold_p0 = Module["_emscripten_bind_b2Contact__GetManifold_p0"] = asm._emscripten_bind_b2Contact__GetManifold_p0;
var _emscripten_bind_b2Contact__SetFriction_p1 = Module["_emscripten_bind_b2Contact__SetFriction_p1"] = asm._emscripten_bind_b2Contact__SetFriction_p1;
var _emscripten_bind_b2BodyDef__set_allowSleep_p1 = Module["_emscripten_bind_b2BodyDef__set_allowSleep_p1"] = asm._emscripten_bind_b2BodyDef__set_allowSleep_p1;
var _emscripten_bind_b2Fixture__RayCast_p3 = Module["_emscripten_bind_b2Fixture__RayCast_p3"] = asm._emscripten_bind_b2Fixture__RayCast_p3;
var _emscripten_bind_b2WeldJointDef__get_referenceAngle_p0 = Module["_emscripten_bind_b2WeldJointDef__get_referenceAngle_p0"] = asm._emscripten_bind_b2WeldJointDef__get_referenceAngle_p0;
var _emscripten_bind_b2RopeJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2RopeJointDef__set_localAnchorA_p1"] = asm._emscripten_bind_b2RopeJointDef__set_localAnchorA_p1;
var _emscripten_bind_b2Draw__DrawSolidPolygon_p3 = Module["_emscripten_bind_b2Draw__DrawSolidPolygon_p3"] = asm._emscripten_bind_b2Draw__DrawSolidPolygon_p3;
var _emscripten_bind_b2ContactManager____destroy___p0 = Module["_emscripten_bind_b2ContactManager____destroy___p0"] = asm._emscripten_bind_b2ContactManager____destroy___p0;
var _emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0;
var _emscripten_bind_b2PolygonShape__get_m_vertexCount_p0 = Module["_emscripten_bind_b2PolygonShape__get_m_vertexCount_p0"] = asm._emscripten_bind_b2PolygonShape__get_m_vertexCount_p0;
var _emscripten_bind_b2DistanceJointDef__Initialize_p4 = Module["_emscripten_bind_b2DistanceJointDef__Initialize_p4"] = asm._emscripten_bind_b2DistanceJointDef__Initialize_p4;
var _emscripten_bind_b2World__IsLocked_p0 = Module["_emscripten_bind_b2World__IsLocked_p0"] = asm._emscripten_bind_b2World__IsLocked_p0;
var _emscripten_bind_b2ContactEdge__get_prev_p0 = Module["_emscripten_bind_b2ContactEdge__get_prev_p0"] = asm._emscripten_bind_b2ContactEdge__get_prev_p0;
var _emscripten_bind_b2Draw__AppendFlags_p1 = Module["_emscripten_bind_b2Draw__AppendFlags_p1"] = asm._emscripten_bind_b2Draw__AppendFlags_p1;
var _emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0;
var _emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1;
var _emscripten_bind_b2Shape__RayCast_p4 = Module["_emscripten_bind_b2Shape__RayCast_p4"] = asm._emscripten_bind_b2Shape__RayCast_p4;
var _emscripten_bind_b2Body__SetActive_p1 = Module["_emscripten_bind_b2Body__SetActive_p1"] = asm._emscripten_bind_b2Body__SetActive_p1;
var _emscripten_bind_b2Shape__GetChildCount_p0 = Module["_emscripten_bind_b2Shape__GetChildCount_p0"] = asm._emscripten_bind_b2Shape__GetChildCount_p0;
var _emscripten_bind_b2ContactListener____destroy___p0 = Module["_emscripten_bind_b2ContactListener____destroy___p0"] = asm._emscripten_bind_b2ContactListener____destroy___p0;
var _emscripten_bind_b2Body__ApplyTorque_p1 = Module["_emscripten_bind_b2Body__ApplyTorque_p1"] = asm._emscripten_bind_b2Body__ApplyTorque_p1;
var _emscripten_bind_b2DistanceProxy__GetVertexCount_p0 = Module["_emscripten_bind_b2DistanceProxy__GetVertexCount_p0"] = asm._emscripten_bind_b2DistanceProxy__GetVertexCount_p0;
var _emscripten_bind_b2Fixture____destroy___p0 = Module["_emscripten_bind_b2Fixture____destroy___p0"] = asm._emscripten_bind_b2Fixture____destroy___p0;
var _emscripten_bind_b2FixtureDef__set_density_p1 = Module["_emscripten_bind_b2FixtureDef__set_density_p1"] = asm._emscripten_bind_b2FixtureDef__set_density_p1;
var _emscripten_bind_b2FixtureDef__get_filter_p0 = Module["_emscripten_bind_b2FixtureDef__get_filter_p0"] = asm._emscripten_bind_b2FixtureDef__get_filter_p0;
var _emscripten_bind_b2ContactEdge__set_prev_p1 = Module["_emscripten_bind_b2ContactEdge__set_prev_p1"] = asm._emscripten_bind_b2ContactEdge__set_prev_p1;
var _emscripten_bind_b2Fixture__GetFriction_p0 = Module["_emscripten_bind_b2Fixture__GetFriction_p0"] = asm._emscripten_bind_b2Fixture__GetFriction_p0;
var _emscripten_bind_b2Body__SetType_p1 = Module["_emscripten_bind_b2Body__SetType_p1"] = asm._emscripten_bind_b2Body__SetType_p1;
var _emscripten_bind_b2WheelJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2WheelJointDef__set_localAnchorA_p1"] = asm._emscripten_bind_b2WheelJointDef__set_localAnchorA_p1;
var _emscripten_bind_b2FrictionJointDef__set_maxForce_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_maxForce_p1"] = asm._emscripten_bind_b2FrictionJointDef__set_maxForce_p1;
var _emscripten_bind_b2Contact__SetRestitution_p1 = Module["_emscripten_bind_b2Contact__SetRestitution_p1"] = asm._emscripten_bind_b2Contact__SetRestitution_p1;
var _emscripten_bind_b2WheelJointDef__get_enableMotor_p0 = Module["_emscripten_bind_b2WheelJointDef__get_enableMotor_p0"] = asm._emscripten_bind_b2WheelJointDef__get_enableMotor_p0;
var _emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0 = Module["_emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0"] = asm._emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0;
var _emscripten_bind_b2PolygonShape__GetChildCount_p0 = Module["_emscripten_bind_b2PolygonShape__GetChildCount_p0"] = asm._emscripten_bind_b2PolygonShape__GetChildCount_p0;
var _emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0 = Module["_emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0"] = asm._emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0;
var _emscripten_bind_b2ContactEdge__set_other_p1 = Module["_emscripten_bind_b2ContactEdge__set_other_p1"] = asm._emscripten_bind_b2ContactEdge__set_other_p1;
var _emscripten_bind_b2Body__GetMassData_p1 = Module["_emscripten_bind_b2Body__GetMassData_p1"] = asm._emscripten_bind_b2Body__GetMassData_p1;
var _emscripten_bind_b2DistanceProxy____destroy___p0 = Module["_emscripten_bind_b2DistanceProxy____destroy___p0"] = asm._emscripten_bind_b2DistanceProxy____destroy___p0;
var _emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0;
var _emscripten_bind_b2Filter__set_groupIndex_p1 = Module["_emscripten_bind_b2Filter__set_groupIndex_p1"] = asm._emscripten_bind_b2Filter__set_groupIndex_p1;
var _emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1;
var _emscripten_bind_b2FixtureDef__set_restitution_p1 = Module["_emscripten_bind_b2FixtureDef__set_restitution_p1"] = asm._emscripten_bind_b2FixtureDef__set_restitution_p1;
var _emscripten_bind_b2Body__GetJointList_p0 = Module["_emscripten_bind_b2Body__GetJointList_p0"] = asm._emscripten_bind_b2Body__GetJointList_p0;
var _emscripten_bind_b2Timer____destroy___p0 = Module["_emscripten_bind_b2Timer____destroy___p0"] = asm._emscripten_bind_b2Timer____destroy___p0;
var _emscripten_bind_b2Contact__ResetRestitution_p0 = Module["_emscripten_bind_b2Contact__ResetRestitution_p0"] = asm._emscripten_bind_b2Contact__ResetRestitution_p0;
var _emscripten_bind_b2DynamicTree__MoveProxy_p3 = Module["_emscripten_bind_b2DynamicTree__MoveProxy_p3"] = asm._emscripten_bind_b2DynamicTree__MoveProxy_p3;
var _emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0"] = asm._emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0;
var _emscripten_bind_b2WheelJointDef____destroy___p0 = Module["_emscripten_bind_b2WheelJointDef____destroy___p0"] = asm._emscripten_bind_b2WheelJointDef____destroy___p0;
var _emscripten_bind_b2Body__SetMassData_p1 = Module["_emscripten_bind_b2Body__SetMassData_p1"] = asm._emscripten_bind_b2Body__SetMassData_p1;
var _emscripten_bind_b2Contact__GetChildIndexA_p0 = Module["_emscripten_bind_b2Contact__GetChildIndexA_p0"] = asm._emscripten_bind_b2Contact__GetChildIndexA_p0;
var _emscripten_bind_b2Fixture__GetShape_p0 = Module["_emscripten_bind_b2Fixture__GetShape_p0"] = asm._emscripten_bind_b2Fixture__GetShape_p0;
var _emscripten_bind_b2DistanceProxy__set_m_radius_p1 = Module["_emscripten_bind_b2DistanceProxy__set_m_radius_p1"] = asm._emscripten_bind_b2DistanceProxy__set_m_radius_p1;
var _emscripten_bind_b2World__DestroyJoint_p1 = Module["_emscripten_bind_b2World__DestroyJoint_p1"] = asm._emscripten_bind_b2World__DestroyJoint_p1;
var _emscripten_bind_b2PulleyJointDef__set_ratio_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_ratio_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_ratio_p1;
var _emscripten_bind_b2Body__GetLocalPoint_p1 = Module["_emscripten_bind_b2Body__GetLocalPoint_p1"] = asm._emscripten_bind_b2Body__GetLocalPoint_p1;
var _emscripten_bind_b2World__GetBodyCount_p0 = Module["_emscripten_bind_b2World__GetBodyCount_p0"] = asm._emscripten_bind_b2World__GetBodyCount_p0;
var _emscripten_bind_b2CircleShape__GetType_p0 = Module["_emscripten_bind_b2CircleShape__GetType_p0"] = asm._emscripten_bind_b2CircleShape__GetType_p0;
var _emscripten_bind_b2DistanceProxy__get_m_radius_p0 = Module["_emscripten_bind_b2DistanceProxy__get_m_radius_p0"] = asm._emscripten_bind_b2DistanceProxy__get_m_radius_p0;
var _emscripten_bind_b2World__ClearForces_p0 = Module["_emscripten_bind_b2World__ClearForces_p0"] = asm._emscripten_bind_b2World__ClearForces_p0;
var _emscripten_bind_b2DynamicTree____destroy___p0 = Module["_emscripten_bind_b2DynamicTree____destroy___p0"] = asm._emscripten_bind_b2DynamicTree____destroy___p0;
var _emscripten_bind_b2Contact__GetWorldManifold_p1 = Module["_emscripten_bind_b2Contact__GetWorldManifold_p1"] = asm._emscripten_bind_b2Contact__GetWorldManifold_p1;
var _emscripten_bind_b2DynamicTree__GetUserData_p1 = Module["_emscripten_bind_b2DynamicTree__GetUserData_p1"] = asm._emscripten_bind_b2DynamicTree__GetUserData_p1;
var _emscripten_bind_b2JointDef____destroy___p0 = Module["_emscripten_bind_b2JointDef____destroy___p0"] = asm._emscripten_bind_b2JointDef____destroy___p0;
var _emscripten_bind_b2Draw__GetFlags_p0 = Module["_emscripten_bind_b2Draw__GetFlags_p0"] = asm._emscripten_bind_b2Draw__GetFlags_p0;
var _emscripten_bind_b2PolygonShape__Set_p2 = Module["_emscripten_bind_b2PolygonShape__Set_p2"] = asm._emscripten_bind_b2PolygonShape__Set_p2;
var _emscripten_bind_b2DestructionListener__SayGoodbye_p1 = Module["_emscripten_bind_b2DestructionListener__SayGoodbye_p1"] = asm._emscripten_bind_b2DestructionListener__SayGoodbye_p1;
var _emscripten_bind_b2BodyDef____destroy___p0 = Module["_emscripten_bind_b2BodyDef____destroy___p0"] = asm._emscripten_bind_b2BodyDef____destroy___p0;
var _emscripten_bind_b2EdgeShape____destroy___p0 = Module["_emscripten_bind_b2EdgeShape____destroy___p0"] = asm._emscripten_bind_b2EdgeShape____destroy___p0;
var _emscripten_bind_b2GearJointDef__get_ratio_p0 = Module["_emscripten_bind_b2GearJointDef__get_ratio_p0"] = asm._emscripten_bind_b2GearJointDef__get_ratio_p0;
var _emscripten_bind_b2BlockAllocator__Clear_p0 = Module["_emscripten_bind_b2BlockAllocator__Clear_p0"] = asm._emscripten_bind_b2BlockAllocator__Clear_p0;
var _emscripten_bind_b2BodyDef__set_type_p1 = Module["_emscripten_bind_b2BodyDef__set_type_p1"] = asm._emscripten_bind_b2BodyDef__set_type_p1;
var _emscripten_bind_b2ContactEdge__get_next_p0 = Module["_emscripten_bind_b2ContactEdge__get_next_p0"] = asm._emscripten_bind_b2ContactEdge__get_next_p0;
var _free = Module["_free"] = asm._free;
var _emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0;
var _emscripten_bind_b2MouseJointDef__set_dampingRatio_p1 = Module["_emscripten_bind_b2MouseJointDef__set_dampingRatio_p1"] = asm._emscripten_bind_b2MouseJointDef__set_dampingRatio_p1;
var _emscripten_bind_b2PolygonShape__set_m_radius_p1 = Module["_emscripten_bind_b2PolygonShape__set_m_radius_p1"] = asm._emscripten_bind_b2PolygonShape__set_m_radius_p1;
var _emscripten_bind_b2FixtureDef__set_userData_p1 = Module["_emscripten_bind_b2FixtureDef__set_userData_p1"] = asm._emscripten_bind_b2FixtureDef__set_userData_p1;
var _emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0 = Module["_emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0"] = asm._emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0;
var _emscripten_bind_b2ChainShape__CreateLoop_p2 = Module["_emscripten_bind_b2ChainShape__CreateLoop_p2"] = asm._emscripten_bind_b2ChainShape__CreateLoop_p2;
var _emscripten_bind_b2World__DestroyBody_p1 = Module["_emscripten_bind_b2World__DestroyBody_p1"] = asm._emscripten_bind_b2World__DestroyBody_p1;
var _emscripten_bind_b2World__SetSubStepping_p1 = Module["_emscripten_bind_b2World__SetSubStepping_p1"] = asm._emscripten_bind_b2World__SetSubStepping_p1;
var _emscripten_bind_b2PrismaticJointDef____destroy___p0 = Module["_emscripten_bind_b2PrismaticJointDef____destroy___p0"] = asm._emscripten_bind_b2PrismaticJointDef____destroy___p0;
var _emscripten_bind_b2BroadPhase__GetFatAABB_p1 = Module["_emscripten_bind_b2BroadPhase__GetFatAABB_p1"] = asm._emscripten_bind_b2BroadPhase__GetFatAABB_p1;
var _emscripten_bind_b2ContactManager__set_m_contactCount_p1 = Module["_emscripten_bind_b2ContactManager__set_m_contactCount_p1"] = asm._emscripten_bind_b2ContactManager__set_m_contactCount_p1;
var _emscripten_bind_b2Body__GetLinearVelocity_p0 = Module["_emscripten_bind_b2Body__GetLinearVelocity_p0"] = asm._emscripten_bind_b2Body__GetLinearVelocity_p0;
var _emscripten_bind_b2ContactManager__get_m_allocator_p0 = Module["_emscripten_bind_b2ContactManager__get_m_allocator_p0"] = asm._emscripten_bind_b2ContactManager__get_m_allocator_p0;
var _emscripten_bind_b2BlockAllocator__Free_p2 = Module["_emscripten_bind_b2BlockAllocator__Free_p2"] = asm._emscripten_bind_b2BlockAllocator__Free_p2;
var _emscripten_bind_b2Body__GetAngularVelocity_p0 = Module["_emscripten_bind_b2Body__GetAngularVelocity_p0"] = asm._emscripten_bind_b2Body__GetAngularVelocity_p0;
var _emscripten_bind_b2Rot__GetXAxis_p0 = Module["_emscripten_bind_b2Rot__GetXAxis_p0"] = asm._emscripten_bind_b2Rot__GetXAxis_p0;
var _emscripten_bind_b2ContactManager__get_m_contactCount_p0 = Module["_emscripten_bind_b2ContactManager__get_m_contactCount_p0"] = asm._emscripten_bind_b2ContactManager__get_m_contactCount_p0;
var _emscripten_bind_b2PolygonShape__GetVertexCount_p0 = Module["_emscripten_bind_b2PolygonShape__GetVertexCount_p0"] = asm._emscripten_bind_b2PolygonShape__GetVertexCount_p0;
var _emscripten_bind_b2StackAllocator__Free_p1 = Module["_emscripten_bind_b2StackAllocator__Free_p1"] = asm._emscripten_bind_b2StackAllocator__Free_p1;
var _emscripten_bind_b2CircleShape__GetSupportVertex_p1 = Module["_emscripten_bind_b2CircleShape__GetSupportVertex_p1"] = asm._emscripten_bind_b2CircleShape__GetSupportVertex_p1;
var _emscripten_bind_b2DistanceProxy__GetSupportVertex_p1 = Module["_emscripten_bind_b2DistanceProxy__GetSupportVertex_p1"] = asm._emscripten_bind_b2DistanceProxy__GetSupportVertex_p1;
var _emscripten_bind_b2JointDef__set_userData_p1 = Module["_emscripten_bind_b2JointDef__set_userData_p1"] = asm._emscripten_bind_b2JointDef__set_userData_p1;
var _emscripten_bind_b2Vec3__get_z_p0 = Module["_emscripten_bind_b2Vec3__get_z_p0"] = asm._emscripten_bind_b2Vec3__get_z_p0;
var _emscripten_bind_b2FixtureDef__get_restitution_p0 = Module["_emscripten_bind_b2FixtureDef__get_restitution_p0"] = asm._emscripten_bind_b2FixtureDef__get_restitution_p0;
var _emscripten_bind_b2FixtureDef__b2FixtureDef_p0 = Module["_emscripten_bind_b2FixtureDef__b2FixtureDef_p0"] = asm._emscripten_bind_b2FixtureDef__b2FixtureDef_p0;
var _emscripten_bind_b2WheelJointDef__get_motorSpeed_p0 = Module["_emscripten_bind_b2WheelJointDef__get_motorSpeed_p0"] = asm._emscripten_bind_b2WheelJointDef__get_motorSpeed_p0;
var _emscripten_bind_b2ContactManager__get_m_contactFilter_p0 = Module["_emscripten_bind_b2ContactManager__get_m_contactFilter_p0"] = asm._emscripten_bind_b2ContactManager__get_m_contactFilter_p0;
var _emscripten_bind_b2Body__GetAngularDamping_p0 = Module["_emscripten_bind_b2Body__GetAngularDamping_p0"] = asm._emscripten_bind_b2Body__GetAngularDamping_p0;
var _emscripten_bind_b2ChainShape__GetChildCount_p0 = Module["_emscripten_bind_b2ChainShape__GetChildCount_p0"] = asm._emscripten_bind_b2ChainShape__GetChildCount_p0;
var _emscripten_bind_b2ChainShape__SetNextVertex_p1 = Module["_emscripten_bind_b2ChainShape__SetNextVertex_p1"] = asm._emscripten_bind_b2ChainShape__SetNextVertex_p1;
var _emscripten_bind_b2Joint__SetUserData_p1 = Module["_emscripten_bind_b2Joint__SetUserData_p1"] = asm._emscripten_bind_b2Joint__SetUserData_p1;
var _emscripten_bind_b2Fixture__IsSensor_p0 = Module["_emscripten_bind_b2Fixture__IsSensor_p0"] = asm._emscripten_bind_b2Fixture__IsSensor_p0;
var _emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0"] = asm._emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0;
var _emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1;
var _emscripten_bind_b2ContactListener__PreSolve_p2 = Module["_emscripten_bind_b2ContactListener__PreSolve_p2"] = asm._emscripten_bind_b2ContactListener__PreSolve_p2;
var _emscripten_bind_b2WheelJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2WheelJointDef__get_localAnchorB_p0"] = asm._emscripten_bind_b2WheelJointDef__get_localAnchorB_p0;
var _emscripten_bind_b2BroadPhase__MoveProxy_p3 = Module["_emscripten_bind_b2BroadPhase__MoveProxy_p3"] = asm._emscripten_bind_b2BroadPhase__MoveProxy_p3;
var _emscripten_bind_b2BodyDef__get_active_p0 = Module["_emscripten_bind_b2BodyDef__get_active_p0"] = asm._emscripten_bind_b2BodyDef__get_active_p0;
var _emscripten_bind_b2CircleShape__GetVertexCount_p0 = Module["_emscripten_bind_b2CircleShape__GetVertexCount_p0"] = asm._emscripten_bind_b2CircleShape__GetVertexCount_p0;
var _emscripten_bind_b2Timer__Reset_p0 = Module["_emscripten_bind_b2Timer__Reset_p0"] = asm._emscripten_bind_b2Timer__Reset_p0;
var _emscripten_bind_b2World__b2World_p1 = Module["_emscripten_bind_b2World__b2World_p1"] = asm._emscripten_bind_b2World__b2World_p1;
var _emscripten_bind_b2Vec3__Set_p3 = Module["_emscripten_bind_b2Vec3__Set_p3"] = asm._emscripten_bind_b2Vec3__Set_p3;
var _emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1;
var _emscripten_bind_b2ContactEdge__get_other_p0 = Module["_emscripten_bind_b2ContactEdge__get_other_p0"] = asm._emscripten_bind_b2ContactEdge__get_other_p0;
var _emscripten_bind_b2Fixture__GetType_p0 = Module["_emscripten_bind_b2Fixture__GetType_p0"] = asm._emscripten_bind_b2Fixture__GetType_p0;
var _emscripten_bind_b2ContactListener__PostSolve_p2 = Module["_emscripten_bind_b2ContactListener__PostSolve_p2"] = asm._emscripten_bind_b2ContactListener__PostSolve_p2;
var _emscripten_bind_b2Body__GetInertia_p0 = Module["_emscripten_bind_b2Body__GetInertia_p0"] = asm._emscripten_bind_b2Body__GetInertia_p0;
var _emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0 = Module["_emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0"] = asm._emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0;
var _emscripten_bind_b2PolygonShape__get_m_centroid_p0 = Module["_emscripten_bind_b2PolygonShape__get_m_centroid_p0"] = asm._emscripten_bind_b2PolygonShape__get_m_centroid_p0;
var _emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0"] = asm._emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0;
var _emscripten_bind_b2Draw__SetFlags_p1 = Module["_emscripten_bind_b2Draw__SetFlags_p1"] = asm._emscripten_bind_b2Draw__SetFlags_p1;
var _emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0 = Module["_emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0"] = asm._emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0;
var _emscripten_bind_b2World__SetAllowSleeping_p1 = Module["_emscripten_bind_b2World__SetAllowSleeping_p1"] = asm._emscripten_bind_b2World__SetAllowSleeping_p1;
var _emscripten_bind_b2BodyDef__set_gravityScale_p1 = Module["_emscripten_bind_b2BodyDef__set_gravityScale_p1"] = asm._emscripten_bind_b2BodyDef__set_gravityScale_p1;
var _emscripten_bind_b2Contact__IsTouching_p0 = Module["_emscripten_bind_b2Contact__IsTouching_p0"] = asm._emscripten_bind_b2Contact__IsTouching_p0;
var _emscripten_bind_b2Transform__set_q_p1 = Module["_emscripten_bind_b2Transform__set_q_p1"] = asm._emscripten_bind_b2Transform__set_q_p1;
var _emscripten_bind_b2BodyDef__get_fixedRotation_p0 = Module["_emscripten_bind_b2BodyDef__get_fixedRotation_p0"] = asm._emscripten_bind_b2BodyDef__get_fixedRotation_p0;
var _emscripten_bind_b2ChainShape____destroy___p0 = Module["_emscripten_bind_b2ChainShape____destroy___p0"] = asm._emscripten_bind_b2ChainShape____destroy___p0;
var _emscripten_bind_b2ChainShape__get_m_radius_p0 = Module["_emscripten_bind_b2ChainShape__get_m_radius_p0"] = asm._emscripten_bind_b2ChainShape__get_m_radius_p0;
var _emscripten_bind_b2EdgeShape__set_m_radius_p1 = Module["_emscripten_bind_b2EdgeShape__set_m_radius_p1"] = asm._emscripten_bind_b2EdgeShape__set_m_radius_p1;
var _emscripten_bind_b2DistanceJointDef__get_length_p0 = Module["_emscripten_bind_b2DistanceJointDef__get_length_p0"] = asm._emscripten_bind_b2DistanceJointDef__get_length_p0;
var _emscripten_bind_b2ContactManager__set_m_contactListener_p1 = Module["_emscripten_bind_b2ContactManager__set_m_contactListener_p1"] = asm._emscripten_bind_b2ContactManager__set_m_contactListener_p1;
var _emscripten_bind_b2MouseJointDef__get_maxForce_p0 = Module["_emscripten_bind_b2MouseJointDef__get_maxForce_p0"] = asm._emscripten_bind_b2MouseJointDef__get_maxForce_p0;
var _emscripten_bind_b2DistanceProxy__GetSupport_p1 = Module["_emscripten_bind_b2DistanceProxy__GetSupport_p1"] = asm._emscripten_bind_b2DistanceProxy__GetSupport_p1;
var _emscripten_bind_b2World__GetGravity_p0 = Module["_emscripten_bind_b2World__GetGravity_p0"] = asm._emscripten_bind_b2World__GetGravity_p0;
var _emscripten_bind_b2Joint__GetNext_p0 = Module["_emscripten_bind_b2Joint__GetNext_p0"] = asm._emscripten_bind_b2Joint__GetNext_p0;
var _emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1;
var _emscripten_bind_b2World__GetProfile_p0 = Module["_emscripten_bind_b2World__GetProfile_p0"] = asm._emscripten_bind_b2World__GetProfile_p0;
var _emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1;
var _emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0;
var _emscripten_bind_b2Body__GetWorldVector_p1 = Module["_emscripten_bind_b2Body__GetWorldVector_p1"] = asm._emscripten_bind_b2Body__GetWorldVector_p1;
var _emscripten_bind_b2Fixture__Refilter_p0 = Module["_emscripten_bind_b2Fixture__Refilter_p0"] = asm._emscripten_bind_b2Fixture__Refilter_p0;
var _emscripten_bind_b2Vec3__SetZero_p0 = Module["_emscripten_bind_b2Vec3__SetZero_p0"] = asm._emscripten_bind_b2Vec3__SetZero_p0;
var _emscripten_bind_b2ContactListener__EndContact_p1 = Module["_emscripten_bind_b2ContactListener__EndContact_p1"] = asm._emscripten_bind_b2ContactListener__EndContact_p1;
var _emscripten_bind_b2Vec2__Normalize_p0 = Module["_emscripten_bind_b2Vec2__Normalize_p0"] = asm._emscripten_bind_b2Vec2__Normalize_p0;
var _emscripten_bind_b2Shape__ComputeMass_p2 = Module["_emscripten_bind_b2Shape__ComputeMass_p2"] = asm._emscripten_bind_b2Shape__ComputeMass_p2;
var _emscripten_bind_b2BodyDef__get_type_p0 = Module["_emscripten_bind_b2BodyDef__get_type_p0"] = asm._emscripten_bind_b2BodyDef__get_type_p0;
var _emscripten_bind_b2FixtureDef__get_userData_p0 = Module["_emscripten_bind_b2FixtureDef__get_userData_p0"] = asm._emscripten_bind_b2FixtureDef__get_userData_p0;
var _emscripten_bind_b2WeldJointDef__Initialize_p3 = Module["_emscripten_bind_b2WeldJointDef__Initialize_p3"] = asm._emscripten_bind_b2WeldJointDef__Initialize_p3;
var _emscripten_bind_b2Rot__Set_p1 = Module["_emscripten_bind_b2Rot__Set_p1"] = asm._emscripten_bind_b2Rot__Set_p1;
var _emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0 = Module["_emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0"] = asm._emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0;
var _emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0"] = asm._emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0;
var _emscripten_bind_b2WheelJointDef__set_enableMotor_p1 = Module["_emscripten_bind_b2WheelJointDef__set_enableMotor_p1"] = asm._emscripten_bind_b2WheelJointDef__set_enableMotor_p1;
var _emscripten_bind_b2ContactManager__get_m_contactList_p0 = Module["_emscripten_bind_b2ContactManager__get_m_contactList_p0"] = asm._emscripten_bind_b2ContactManager__get_m_contactList_p0;
var _emscripten_bind_b2PolygonShape__ComputeAABB_p3 = Module["_emscripten_bind_b2PolygonShape__ComputeAABB_p3"] = asm._emscripten_bind_b2PolygonShape__ComputeAABB_p3;
var _emscripten_bind_b2BodyDef__set_fixedRotation_p1 = Module["_emscripten_bind_b2BodyDef__set_fixedRotation_p1"] = asm._emscripten_bind_b2BodyDef__set_fixedRotation_p1;
var _emscripten_bind_b2CircleShape__b2CircleShape_p0 = Module["_emscripten_bind_b2CircleShape__b2CircleShape_p0"] = asm._emscripten_bind_b2CircleShape__b2CircleShape_p0;
var _emscripten_bind_b2EdgeShape__GetChildCount_p0 = Module["_emscripten_bind_b2EdgeShape__GetChildCount_p0"] = asm._emscripten_bind_b2EdgeShape__GetChildCount_p0;
var _emscripten_bind_b2BodyDef__set_active_p1 = Module["_emscripten_bind_b2BodyDef__set_active_p1"] = asm._emscripten_bind_b2BodyDef__set_active_p1;
var _emscripten_bind_b2Vec2____destroy___p0 = Module["_emscripten_bind_b2Vec2____destroy___p0"] = asm._emscripten_bind_b2Vec2____destroy___p0;
var _emscripten_bind_b2ChainShape__get_m_vertices_p0 = Module["_emscripten_bind_b2ChainShape__get_m_vertices_p0"] = asm._emscripten_bind_b2ChainShape__get_m_vertices_p0;
var _emscripten_bind_b2BodyDef__b2BodyDef_p0 = Module["_emscripten_bind_b2BodyDef__b2BodyDef_p0"] = asm._emscripten_bind_b2BodyDef__b2BodyDef_p0;
var _emscripten_bind_b2BroadPhase__b2BroadPhase_p0 = Module["_emscripten_bind_b2BroadPhase__b2BroadPhase_p0"] = asm._emscripten_bind_b2BroadPhase__b2BroadPhase_p0;
var _emscripten_bind_b2World__SetDebugDraw_p1 = Module["_emscripten_bind_b2World__SetDebugDraw_p1"] = asm._emscripten_bind_b2World__SetDebugDraw_p1;
var _emscripten_bind_b2MouseJointDef__set_frequencyHz_p1 = Module["_emscripten_bind_b2MouseJointDef__set_frequencyHz_p1"] = asm._emscripten_bind_b2MouseJointDef__set_frequencyHz_p1;
var _emscripten_bind_b2WheelJointDef__get_frequencyHz_p0 = Module["_emscripten_bind_b2WheelJointDef__get_frequencyHz_p0"] = asm._emscripten_bind_b2WheelJointDef__get_frequencyHz_p0;
var _emscripten_bind_b2Filter__b2Filter_p0 = Module["_emscripten_bind_b2Filter__b2Filter_p0"] = asm._emscripten_bind_b2Filter__b2Filter_p0;
var _emscripten_bind_b2World____destroy___p0 = Module["_emscripten_bind_b2World____destroy___p0"] = asm._emscripten_bind_b2World____destroy___p0;
var _emscripten_bind_b2Body__SetBullet_p1 = Module["_emscripten_bind_b2Body__SetBullet_p1"] = asm._emscripten_bind_b2Body__SetBullet_p1;
var _emscripten_bind_b2Body__GetAngle_p0 = Module["_emscripten_bind_b2Body__GetAngle_p0"] = asm._emscripten_bind_b2Body__GetAngle_p0;
var _emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0 = Module["_emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0"] = asm._emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0;
var _emscripten_bind_b2Contact__GetNext_p0 = Module["_emscripten_bind_b2Contact__GetNext_p0"] = asm._emscripten_bind_b2Contact__GetNext_p0;
var _emscripten_bind_b2World__DrawDebugData_p0 = Module["_emscripten_bind_b2World__DrawDebugData_p0"] = asm._emscripten_bind_b2World__DrawDebugData_p0;
var _emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1;
var _emscripten_bind_b2WheelJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2WheelJointDef__get_localAnchorA_p0"] = asm._emscripten_bind_b2WheelJointDef__get_localAnchorA_p0;
var _emscripten_bind_b2PulleyJointDef__get_lengthB_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_lengthB_p0"] = asm._emscripten_bind_b2PulleyJointDef__get_lengthB_p0;
var _strlen = Module["_strlen"] = asm._strlen;
var _emscripten_bind_b2FixtureDef__set_filter_p1 = Module["_emscripten_bind_b2FixtureDef__set_filter_p1"] = asm._emscripten_bind_b2FixtureDef__set_filter_p1;
var _emscripten_bind_b2ChainShape__CreateChain_p2 = Module["_emscripten_bind_b2ChainShape__CreateChain_p2"] = asm._emscripten_bind_b2ChainShape__CreateChain_p2;
var _emscripten_bind_b2Body__GetLocalVector_p1 = Module["_emscripten_bind_b2Body__GetLocalVector_p1"] = asm._emscripten_bind_b2Body__GetLocalVector_p1;
var _emscripten_bind_b2FrictionJointDef__set_maxTorque_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_maxTorque_p1"] = asm._emscripten_bind_b2FrictionJointDef__set_maxTorque_p1;
var _emscripten_bind_b2ChainShape__ComputeAABB_p3 = Module["_emscripten_bind_b2ChainShape__ComputeAABB_p3"] = asm._emscripten_bind_b2ChainShape__ComputeAABB_p3;
var _emscripten_bind_b2CircleShape__GetSupport_p1 = Module["_emscripten_bind_b2CircleShape__GetSupport_p1"] = asm._emscripten_bind_b2CircleShape__GetSupport_p1;
var _emscripten_bind_b2World__GetContinuousPhysics_p0 = Module["_emscripten_bind_b2World__GetContinuousPhysics_p0"] = asm._emscripten_bind_b2World__GetContinuousPhysics_p0;
var _emscripten_bind_b2FrictionJointDef__get_maxForce_p0 = Module["_emscripten_bind_b2FrictionJointDef__get_maxForce_p0"] = asm._emscripten_bind_b2FrictionJointDef__get_maxForce_p0;
var _emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1;
var _emscripten_bind_b2JointDef__set_type_p1 = Module["_emscripten_bind_b2JointDef__set_type_p1"] = asm._emscripten_bind_b2JointDef__set_type_p1;
var _emscripten_bind_b2Color__Set_p3 = Module["_emscripten_bind_b2Color__Set_p3"] = asm._emscripten_bind_b2Color__Set_p3;
var _emscripten_bind_b2Joint__GetBodyB_p0 = Module["_emscripten_bind_b2Joint__GetBodyB_p0"] = asm._emscripten_bind_b2Joint__GetBodyB_p0;
var _emscripten_bind_b2ContactManager__set_m_broadPhase_p1 = Module["_emscripten_bind_b2ContactManager__set_m_broadPhase_p1"] = asm._emscripten_bind_b2ContactManager__set_m_broadPhase_p1;
var _emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1 = Module["_emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1"] = asm._emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1;
var _emscripten_bind_b2Vec2__Length_p0 = Module["_emscripten_bind_b2Vec2__Length_p0"] = asm._emscripten_bind_b2Vec2__Length_p0;
var _emscripten_bind_b2JointDef__get_collideConnected_p0 = Module["_emscripten_bind_b2JointDef__get_collideConnected_p0"] = asm._emscripten_bind_b2JointDef__get_collideConnected_p0;
var _emscripten_bind_b2BroadPhase__GetTreeQuality_p0 = Module["_emscripten_bind_b2BroadPhase__GetTreeQuality_p0"] = asm._emscripten_bind_b2BroadPhase__GetTreeQuality_p0;
var _emscripten_bind_b2WheelJointDef__get_dampingRatio_p0 = Module["_emscripten_bind_b2WheelJointDef__get_dampingRatio_p0"] = asm._emscripten_bind_b2WheelJointDef__get_dampingRatio_p0;
var _emscripten_bind_b2Joint__GetCollideConnected_p0 = Module["_emscripten_bind_b2Joint__GetCollideConnected_p0"] = asm._emscripten_bind_b2Joint__GetCollideConnected_p0;
var _emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1"] = asm._emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1;
var _emscripten_bind_b2EdgeShape__ComputeAABB_p3 = Module["_emscripten_bind_b2EdgeShape__ComputeAABB_p3"] = asm._emscripten_bind_b2EdgeShape__ComputeAABB_p3;
var _emscripten_bind_b2BodyDef__set_awake_p1 = Module["_emscripten_bind_b2BodyDef__set_awake_p1"] = asm._emscripten_bind_b2BodyDef__set_awake_p1;
var _emscripten_bind_b2PolygonShape__RayCast_p4 = Module["_emscripten_bind_b2PolygonShape__RayCast_p4"] = asm._emscripten_bind_b2PolygonShape__RayCast_p4;
var _emscripten_bind_b2CircleShape__ComputeMass_p2 = Module["_emscripten_bind_b2CircleShape__ComputeMass_p2"] = asm._emscripten_bind_b2CircleShape__ComputeMass_p2;
var _emscripten_bind_b2Contact__IsEnabled_p0 = Module["_emscripten_bind_b2Contact__IsEnabled_p0"] = asm._emscripten_bind_b2Contact__IsEnabled_p0;
var _emscripten_bind_b2Vec2__SetZero_p0 = Module["_emscripten_bind_b2Vec2__SetZero_p0"] = asm._emscripten_bind_b2Vec2__SetZero_p0;
var _emscripten_bind_b2Fixture__SetSensor_p1 = Module["_emscripten_bind_b2Fixture__SetSensor_p1"] = asm._emscripten_bind_b2Fixture__SetSensor_p1;
var _emscripten_bind_b2Shape__GetType_p0 = Module["_emscripten_bind_b2Shape__GetType_p0"] = asm._emscripten_bind_b2Shape__GetType_p0;
var _emscripten_bind_b2WeldJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2WeldJointDef__get_localAnchorB_p0"] = asm._emscripten_bind_b2WeldJointDef__get_localAnchorB_p0;
var _emscripten_bind_b2ContactManager__set_m_allocator_p1 = Module["_emscripten_bind_b2ContactManager__set_m_allocator_p1"] = asm._emscripten_bind_b2ContactManager__set_m_allocator_p1;
var _emscripten_bind_b2WheelJointDef__set_motorSpeed_p1 = Module["_emscripten_bind_b2WheelJointDef__set_motorSpeed_p1"] = asm._emscripten_bind_b2WheelJointDef__set_motorSpeed_p1;
var _emscripten_bind_b2Contact__Evaluate_p3 = Module["_emscripten_bind_b2Contact__Evaluate_p3"] = asm._emscripten_bind_b2Contact__Evaluate_p3;
var _emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1;
var _emscripten_bind_b2PulleyJointDef__get_lengthA_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_lengthA_p0"] = asm._emscripten_bind_b2PulleyJointDef__get_lengthA_p0;
var _emscripten_bind_b2Shape__get_m_radius_p0 = Module["_emscripten_bind_b2Shape__get_m_radius_p0"] = asm._emscripten_bind_b2Shape__get_m_radius_p0;
var _emscripten_bind_b2ChainShape__set_m_count_p1 = Module["_emscripten_bind_b2ChainShape__set_m_count_p1"] = asm._emscripten_bind_b2ChainShape__set_m_count_p1;
var _emscripten_bind_b2Contact__ResetFriction_p0 = Module["_emscripten_bind_b2Contact__ResetFriction_p0"] = asm._emscripten_bind_b2Contact__ResetFriction_p0;
var _emscripten_bind_b2DynamicTree__GetFatAABB_p1 = Module["_emscripten_bind_b2DynamicTree__GetFatAABB_p1"] = asm._emscripten_bind_b2DynamicTree__GetFatAABB_p1;
var _emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0 = Module["_emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0"] = asm._emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0;
var _emscripten_bind_b2Fixture__GetBody_p0 = Module["_emscripten_bind_b2Fixture__GetBody_p0"] = asm._emscripten_bind_b2Fixture__GetBody_p0;
var _emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1 = Module["_emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1"] = asm._emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1;
var _emscripten_bind_b2Vec2__LengthSquared_p0 = Module["_emscripten_bind_b2Vec2__LengthSquared_p0"] = asm._emscripten_bind_b2Vec2__LengthSquared_p0;
var _emscripten_bind_b2Contact__GetFixtureA_p0 = Module["_emscripten_bind_b2Contact__GetFixtureA_p0"] = asm._emscripten_bind_b2Contact__GetFixtureA_p0;
var _emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1;
var _emscripten_bind_b2EdgeShape__ComputeMass_p2 = Module["_emscripten_bind_b2EdgeShape__ComputeMass_p2"] = asm._emscripten_bind_b2EdgeShape__ComputeMass_p2;
var _emscripten_bind_b2Transform__SetIdentity_p0 = Module["_emscripten_bind_b2Transform__SetIdentity_p0"] = asm._emscripten_bind_b2Transform__SetIdentity_p0;
var _emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1"] = asm._emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1;
var _emscripten_bind_b2Body__SetTransform_p2 = Module["_emscripten_bind_b2Body__SetTransform_p2"] = asm._emscripten_bind_b2Body__SetTransform_p2;
var _emscripten_bind_b2StackAllocator__b2StackAllocator_p0 = Module["_emscripten_bind_b2StackAllocator__b2StackAllocator_p0"] = asm._emscripten_bind_b2StackAllocator__b2StackAllocator_p0;
var _emscripten_bind_b2MouseJointDef__set_maxForce_p1 = Module["_emscripten_bind_b2MouseJointDef__set_maxForce_p1"] = asm._emscripten_bind_b2MouseJointDef__set_maxForce_p1;
var _emscripten_bind_b2Vec2__set_y_p1 = Module["_emscripten_bind_b2Vec2__set_y_p1"] = asm._emscripten_bind_b2Vec2__set_y_p1;
var _emscripten_bind_b2CircleShape__Clone_p1 = Module["_emscripten_bind_b2CircleShape__Clone_p1"] = asm._emscripten_bind_b2CircleShape__Clone_p1;
var _emscripten_bind_b2Color____destroy___p0 = Module["_emscripten_bind_b2Color____destroy___p0"] = asm._emscripten_bind_b2Color____destroy___p0;
var _emscripten_bind_b2Fixture__GetRestitution_p0 = Module["_emscripten_bind_b2Fixture__GetRestitution_p0"] = asm._emscripten_bind_b2Fixture__GetRestitution_p0;
var _emscripten_bind_b2DistanceJointDef__set_length_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_length_p1"] = asm._emscripten_bind_b2DistanceJointDef__set_length_p1;
var _emscripten_bind_b2PolygonShape__Clone_p1 = Module["_emscripten_bind_b2PolygonShape__Clone_p1"] = asm._emscripten_bind_b2PolygonShape__Clone_p1;
var _emscripten_bind_b2Color__b2Color_p3 = Module["_emscripten_bind_b2Color__b2Color_p3"] = asm._emscripten_bind_b2Color__b2Color_p3;
var _emscripten_bind_b2Body__ApplyForceToCenter_p1 = Module["_emscripten_bind_b2Body__ApplyForceToCenter_p1"] = asm._emscripten_bind_b2Body__ApplyForceToCenter_p1;
var _emscripten_bind_b2Joint__GetReactionForce_p1 = Module["_emscripten_bind_b2Joint__GetReactionForce_p1"] = asm._emscripten_bind_b2Joint__GetReactionForce_p1;
var _emscripten_bind_b2Body__SetFixedRotation_p1 = Module["_emscripten_bind_b2Body__SetFixedRotation_p1"] = asm._emscripten_bind_b2Body__SetFixedRotation_p1;
var _emscripten_bind_b2RopeJointDef____destroy___p0 = Module["_emscripten_bind_b2RopeJointDef____destroy___p0"] = asm._emscripten_bind_b2RopeJointDef____destroy___p0;
var _emscripten_bind_b2CircleShape____destroy___p0 = Module["_emscripten_bind_b2CircleShape____destroy___p0"] = asm._emscripten_bind_b2CircleShape____destroy___p0;
var _emscripten_bind_b2Shape__set_m_radius_p1 = Module["_emscripten_bind_b2Shape__set_m_radius_p1"] = asm._emscripten_bind_b2Shape__set_m_radius_p1;
var _emscripten_bind_b2JointDef__get_bodyA_p0 = Module["_emscripten_bind_b2JointDef__get_bodyA_p0"] = asm._emscripten_bind_b2JointDef__get_bodyA_p0;
var _emscripten_bind_b2World__GetContactCount_p0 = Module["_emscripten_bind_b2World__GetContactCount_p0"] = asm._emscripten_bind_b2World__GetContactCount_p0;
var _emscripten_bind_b2Fixture__b2Fixture_p0 = Module["_emscripten_bind_b2Fixture__b2Fixture_p0"] = asm._emscripten_bind_b2Fixture__b2Fixture_p0;
var _emscripten_bind_b2StackAllocator__Allocate_p1 = Module["_emscripten_bind_b2StackAllocator__Allocate_p1"] = asm._emscripten_bind_b2StackAllocator__Allocate_p1;
var _emscripten_bind_b2Body__SetGravityScale_p1 = Module["_emscripten_bind_b2Body__SetGravityScale_p1"] = asm._emscripten_bind_b2Body__SetGravityScale_p1;
var _emscripten_bind_b2BroadPhase__CreateProxy_p2 = Module["_emscripten_bind_b2BroadPhase__CreateProxy_p2"] = asm._emscripten_bind_b2BroadPhase__CreateProxy_p2;
var _emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0 = Module["_emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0"] = asm._emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0;
var _emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1;
var _emscripten_bind_b2Filter____destroy___p0 = Module["_emscripten_bind_b2Filter____destroy___p0"] = asm._emscripten_bind_b2Filter____destroy___p0;
var _emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1;
var _emscripten_bind_b2Fixture__GetUserData_p0 = Module["_emscripten_bind_b2Fixture__GetUserData_p0"] = asm._emscripten_bind_b2Fixture__GetUserData_p0;
var _emscripten_bind_b2RopeJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2RopeJointDef__get_localAnchorA_p0"] = asm._emscripten_bind_b2RopeJointDef__get_localAnchorA_p0;
var _emscripten_bind_b2CircleShape__get_m_radius_p0 = Module["_emscripten_bind_b2CircleShape__get_m_radius_p0"] = asm._emscripten_bind_b2CircleShape__get_m_radius_p0;
var _emscripten_bind_b2BodyDef__set_angularVelocity_p1 = Module["_emscripten_bind_b2BodyDef__set_angularVelocity_p1"] = asm._emscripten_bind_b2BodyDef__set_angularVelocity_p1;
var _emscripten_bind_b2Color__get_b_p0 = Module["_emscripten_bind_b2Color__get_b_p0"] = asm._emscripten_bind_b2Color__get_b_p0;
var _emscripten_bind_b2BroadPhase__GetProxyCount_p0 = Module["_emscripten_bind_b2BroadPhase__GetProxyCount_p0"] = asm._emscripten_bind_b2BroadPhase__GetProxyCount_p0;
var _emscripten_bind_b2MouseJointDef__set_target_p1 = Module["_emscripten_bind_b2MouseJointDef__set_target_p1"] = asm._emscripten_bind_b2MouseJointDef__set_target_p1;
var _emscripten_bind_b2Body__GetFixtureList_p0 = Module["_emscripten_bind_b2Body__GetFixtureList_p0"] = asm._emscripten_bind_b2Body__GetFixtureList_p0;
var _emscripten_bind_b2PolygonShape__TestPoint_p2 = Module["_emscripten_bind_b2PolygonShape__TestPoint_p2"] = asm._emscripten_bind_b2PolygonShape__TestPoint_p2;
var _emscripten_bind_b2WheelJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2WheelJointDef__set_localAnchorB_p1"] = asm._emscripten_bind_b2WheelJointDef__set_localAnchorB_p1;
var _emscripten_bind_b2Vec2__IsValid_p0 = Module["_emscripten_bind_b2Vec2__IsValid_p0"] = asm._emscripten_bind_b2Vec2__IsValid_p0;
var _emscripten_bind_b2Color__b2Color_p0 = Module["_emscripten_bind_b2Color__b2Color_p0"] = asm._emscripten_bind_b2Color__b2Color_p0;
var _emscripten_bind_b2BroadPhase__TestOverlap_p2 = Module["_emscripten_bind_b2BroadPhase__TestOverlap_p2"] = asm._emscripten_bind_b2BroadPhase__TestOverlap_p2;
var _emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1;
var _emscripten_bind_b2Joint__GetAnchorB_p0 = Module["_emscripten_bind_b2Joint__GetAnchorB_p0"] = asm._emscripten_bind_b2Joint__GetAnchorB_p0;
var _emscripten_bind_b2CircleShape__set_m_radius_p1 = Module["_emscripten_bind_b2CircleShape__set_m_radius_p1"] = asm._emscripten_bind_b2CircleShape__set_m_radius_p1;
var _emscripten_bind_b2DistanceProxy__set_m_count_p1 = Module["_emscripten_bind_b2DistanceProxy__set_m_count_p1"] = asm._emscripten_bind_b2DistanceProxy__set_m_count_p1;
var _emscripten_bind_b2World__GetContactManager_p0 = Module["_emscripten_bind_b2World__GetContactManager_p0"] = asm._emscripten_bind_b2World__GetContactManager_p0;
var _emscripten_bind_b2Contact__GetFixtureB_p0 = Module["_emscripten_bind_b2Contact__GetFixtureB_p0"] = asm._emscripten_bind_b2Contact__GetFixtureB_p0;
var _emscripten_bind_b2Rot__GetYAxis_p0 = Module["_emscripten_bind_b2Rot__GetYAxis_p0"] = asm._emscripten_bind_b2Rot__GetYAxis_p0;
var _emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1;
var _emscripten_bind_b2Shape__Clone_p1 = Module["_emscripten_bind_b2Shape__Clone_p1"] = asm._emscripten_bind_b2Shape__Clone_p1;
var _emscripten_bind_b2ContactManager__Destroy_p1 = Module["_emscripten_bind_b2ContactManager__Destroy_p1"] = asm._emscripten_bind_b2ContactManager__Destroy_p1;
var _emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0;
var _emscripten_bind_b2BodyDef__set_linearDamping_p1 = Module["_emscripten_bind_b2BodyDef__set_linearDamping_p1"] = asm._emscripten_bind_b2BodyDef__set_linearDamping_p1;
var _emscripten_bind_b2BroadPhase__GetTreeBalance_p0 = Module["_emscripten_bind_b2BroadPhase__GetTreeBalance_p0"] = asm._emscripten_bind_b2BroadPhase__GetTreeBalance_p0;
var _emscripten_bind_b2WheelJointDef__get_localAxisA_p0 = Module["_emscripten_bind_b2WheelJointDef__get_localAxisA_p0"] = asm._emscripten_bind_b2WheelJointDef__get_localAxisA_p0;
var _emscripten_bind_b2FixtureDef__get_density_p0 = Module["_emscripten_bind_b2FixtureDef__get_density_p0"] = asm._emscripten_bind_b2FixtureDef__get_density_p0;
var _emscripten_bind_b2Draw__ClearFlags_p1 = Module["_emscripten_bind_b2Draw__ClearFlags_p1"] = asm._emscripten_bind_b2Draw__ClearFlags_p1;
var _emscripten_bind_b2WeldJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2WeldJointDef__get_localAnchorA_p0"] = asm._emscripten_bind_b2WeldJointDef__get_localAnchorA_p0;
var _emscripten_bind_b2PolygonShape__GetType_p0 = Module["_emscripten_bind_b2PolygonShape__GetType_p0"] = asm._emscripten_bind_b2PolygonShape__GetType_p0;
var _emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1"] = asm._emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1;
var _emscripten_bind_b2BroadPhase__GetUserData_p1 = Module["_emscripten_bind_b2BroadPhase__GetUserData_p1"] = asm._emscripten_bind_b2BroadPhase__GetUserData_p1;
var _emscripten_bind_b2Rot__get_c_p0 = Module["_emscripten_bind_b2Rot__get_c_p0"] = asm._emscripten_bind_b2Rot__get_c_p0;
var _emscripten_bind_b2World__GetAutoClearForces_p0 = Module["_emscripten_bind_b2World__GetAutoClearForces_p0"] = asm._emscripten_bind_b2World__GetAutoClearForces_p0;
var _emscripten_bind_b2Rot__GetAngle_p0 = Module["_emscripten_bind_b2Rot__GetAngle_p0"] = asm._emscripten_bind_b2Rot__GetAngle_p0;
var _emscripten_bind_b2FixtureDef__set_isSensor_p1 = Module["_emscripten_bind_b2FixtureDef__set_isSensor_p1"] = asm._emscripten_bind_b2FixtureDef__set_isSensor_p1;
var _emscripten_bind_b2World__CreateJoint_p1 = Module["_emscripten_bind_b2World__CreateJoint_p1"] = asm._emscripten_bind_b2World__CreateJoint_p1;
var _emscripten_bind_b2Color__set_b_p1 = Module["_emscripten_bind_b2Color__set_b_p1"] = asm._emscripten_bind_b2Color__set_b_p1;
var _emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0;
var _emscripten_bind_b2Body__GetLocalCenter_p0 = Module["_emscripten_bind_b2Body__GetLocalCenter_p0"] = asm._emscripten_bind_b2Body__GetLocalCenter_p0;
var _emscripten_bind_b2Body__SetAngularVelocity_p1 = Module["_emscripten_bind_b2Body__SetAngularVelocity_p1"] = asm._emscripten_bind_b2Body__SetAngularVelocity_p1;
var _emscripten_bind_b2CircleShape__TestPoint_p2 = Module["_emscripten_bind_b2CircleShape__TestPoint_p2"] = asm._emscripten_bind_b2CircleShape__TestPoint_p2;
var _emscripten_bind_b2Body__SetAwake_p1 = Module["_emscripten_bind_b2Body__SetAwake_p1"] = asm._emscripten_bind_b2Body__SetAwake_p1;
var _emscripten_bind_b2Filter__set_categoryBits_p1 = Module["_emscripten_bind_b2Filter__set_categoryBits_p1"] = asm._emscripten_bind_b2Filter__set_categoryBits_p1;
var _emscripten_bind_b2ChainShape__ComputeMass_p2 = Module["_emscripten_bind_b2ChainShape__ComputeMass_p2"] = asm._emscripten_bind_b2ChainShape__ComputeMass_p2;
var _emscripten_bind_b2World__CreateBody_p1 = Module["_emscripten_bind_b2World__CreateBody_p1"] = asm._emscripten_bind_b2World__CreateBody_p1;
var _emscripten_bind_b2JointDef__get_bodyB_p0 = Module["_emscripten_bind_b2JointDef__get_bodyB_p0"] = asm._emscripten_bind_b2JointDef__get_bodyB_p0;
var _emscripten_bind_b2ChainShape__get_m_count_p0 = Module["_emscripten_bind_b2ChainShape__get_m_count_p0"] = asm._emscripten_bind_b2ChainShape__get_m_count_p0;
var _emscripten_bind_b2Joint__GetType_p0 = Module["_emscripten_bind_b2Joint__GetType_p0"] = asm._emscripten_bind_b2Joint__GetType_p0;
var _emscripten_bind_b2BodyDef__set_position_p1 = Module["_emscripten_bind_b2BodyDef__set_position_p1"] = asm._emscripten_bind_b2BodyDef__set_position_p1;
var _emscripten_bind_b2WheelJointDef__set_localAxisA_p1 = Module["_emscripten_bind_b2WheelJointDef__set_localAxisA_p1"] = asm._emscripten_bind_b2WheelJointDef__set_localAxisA_p1;
var _emscripten_bind_b2CircleShape__GetVertex_p1 = Module["_emscripten_bind_b2CircleShape__GetVertex_p1"] = asm._emscripten_bind_b2CircleShape__GetVertex_p1;
var _emscripten_bind_b2Timer__GetMilliseconds_p0 = Module["_emscripten_bind_b2Timer__GetMilliseconds_p0"] = asm._emscripten_bind_b2Timer__GetMilliseconds_p0;
var _emscripten_bind_b2World__SetDestructionListener_p1 = Module["_emscripten_bind_b2World__SetDestructionListener_p1"] = asm._emscripten_bind_b2World__SetDestructionListener_p1;
var _emscripten_bind_b2Joint__GetAnchorA_p0 = Module["_emscripten_bind_b2Joint__GetAnchorA_p0"] = asm._emscripten_bind_b2Joint__GetAnchorA_p0;
var _emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0 = Module["_emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0"] = asm._emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0;
var _emscripten_bind_b2Transform____destroy___p0 = Module["_emscripten_bind_b2Transform____destroy___p0"] = asm._emscripten_bind_b2Transform____destroy___p0;
var _emscripten_bind_b2PolygonShape__ComputeMass_p2 = Module["_emscripten_bind_b2PolygonShape__ComputeMass_p2"] = asm._emscripten_bind_b2PolygonShape__ComputeMass_p2;
var _emscripten_bind_b2Draw__DrawTransform_p1 = Module["_emscripten_bind_b2Draw__DrawTransform_p1"] = asm._emscripten_bind_b2Draw__DrawTransform_p1;
var _emscripten_bind_b2Transform__b2Transform_p0 = Module["_emscripten_bind_b2Transform__b2Transform_p0"] = asm._emscripten_bind_b2Transform__b2Transform_p0;
var _emscripten_bind_b2Body__GetWorld_p0 = Module["_emscripten_bind_b2Body__GetWorld_p0"] = asm._emscripten_bind_b2Body__GetWorld_p0;
var _emscripten_bind_b2PolygonShape__b2PolygonShape_p0 = Module["_emscripten_bind_b2PolygonShape__b2PolygonShape_p0"] = asm._emscripten_bind_b2PolygonShape__b2PolygonShape_p0;
var _emscripten_bind_b2WeldJointDef__set_frequencyHz_p1 = Module["_emscripten_bind_b2WeldJointDef__set_frequencyHz_p1"] = asm._emscripten_bind_b2WeldJointDef__set_frequencyHz_p1;
var _emscripten_bind_b2Joint__GetUserData_p0 = Module["_emscripten_bind_b2Joint__GetUserData_p0"] = asm._emscripten_bind_b2Joint__GetUserData_p0;
var _emscripten_bind_b2Body__ResetMassData_p0 = Module["_emscripten_bind_b2Body__ResetMassData_p0"] = asm._emscripten_bind_b2Body__ResetMassData_p0;
var _emscripten_bind_b2Timer__b2Timer_p0 = Module["_emscripten_bind_b2Timer__b2Timer_p0"] = asm._emscripten_bind_b2Timer__b2Timer_p0;
var _emscripten_bind_b2World__SetContinuousPhysics_p1 = Module["_emscripten_bind_b2World__SetContinuousPhysics_p1"] = asm._emscripten_bind_b2World__SetContinuousPhysics_p1;
var _emscripten_bind_b2ContactManager__FindNewContacts_p0 = Module["_emscripten_bind_b2ContactManager__FindNewContacts_p0"] = asm._emscripten_bind_b2ContactManager__FindNewContacts_p0;
var _emscripten_bind_b2Filter__set_maskBits_p1 = Module["_emscripten_bind_b2Filter__set_maskBits_p1"] = asm._emscripten_bind_b2Filter__set_maskBits_p1;
var _emscripten_bind_b2DynamicTree__GetMaxBalance_p0 = Module["_emscripten_bind_b2DynamicTree__GetMaxBalance_p0"] = asm._emscripten_bind_b2DynamicTree__GetMaxBalance_p0;
var _emscripten_bind_b2PolygonShape__GetVertex_p1 = Module["_emscripten_bind_b2PolygonShape__GetVertex_p1"] = asm._emscripten_bind_b2PolygonShape__GetVertex_p1;
var _emscripten_bind_b2WeldJointDef__get_frequencyHz_p0 = Module["_emscripten_bind_b2WeldJointDef__get_frequencyHz_p0"] = asm._emscripten_bind_b2WeldJointDef__get_frequencyHz_p0;
var _emscripten_bind_b2ContactListener__BeginContact_p1 = Module["_emscripten_bind_b2ContactListener__BeginContact_p1"] = asm._emscripten_bind_b2ContactListener__BeginContact_p1;
var _emscripten_bind_b2WeldJointDef__get_dampingRatio_p0 = Module["_emscripten_bind_b2WeldJointDef__get_dampingRatio_p0"] = asm._emscripten_bind_b2WeldJointDef__get_dampingRatio_p0;
var _emscripten_bind_b2ChainShape__Clone_p1 = Module["_emscripten_bind_b2ChainShape__Clone_p1"] = asm._emscripten_bind_b2ChainShape__Clone_p1;
var _emscripten_bind_b2GearJointDef__b2GearJointDef_p0 = Module["_emscripten_bind_b2GearJointDef__b2GearJointDef_p0"] = asm._emscripten_bind_b2GearJointDef__b2GearJointDef_p0;
var _emscripten_bind_b2Body__ApplyForce_p2 = Module["_emscripten_bind_b2Body__ApplyForce_p2"] = asm._emscripten_bind_b2Body__ApplyForce_p2;
var _emscripten_bind_b2ContactEdge__get_contact_p0 = Module["_emscripten_bind_b2ContactEdge__get_contact_p0"] = asm._emscripten_bind_b2ContactEdge__get_contact_p0;
var _emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0;
var _emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0 = Module["_emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0"] = asm._emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0;
var _emscripten_bind_b2PulleyJointDef__set_lengthA_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_lengthA_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_lengthA_p1;
var _emscripten_bind_b2FixtureDef__get_friction_p0 = Module["_emscripten_bind_b2FixtureDef__get_friction_p0"] = asm._emscripten_bind_b2FixtureDef__get_friction_p0;
var _emscripten_bind_b2Body__GetType_p0 = Module["_emscripten_bind_b2Body__GetType_p0"] = asm._emscripten_bind_b2Body__GetType_p0;
var _emscripten_bind_b2World__Step_p3 = Module["_emscripten_bind_b2World__Step_p3"] = asm._emscripten_bind_b2World__Step_p3;
var _emscripten_bind_b2Vec2__set_x_p1 = Module["_emscripten_bind_b2Vec2__set_x_p1"] = asm._emscripten_bind_b2Vec2__set_x_p1;
var _emscripten_bind_b2ContactManager__b2ContactManager_p0 = Module["_emscripten_bind_b2ContactManager__b2ContactManager_p0"] = asm._emscripten_bind_b2ContactManager__b2ContactManager_p0;
var _emscripten_bind_b2Contact__GetRestitution_p0 = Module["_emscripten_bind_b2Contact__GetRestitution_p0"] = asm._emscripten_bind_b2Contact__GetRestitution_p0;
var _emscripten_bind_b2MouseJointDef____destroy___p0 = Module["_emscripten_bind_b2MouseJointDef____destroy___p0"] = asm._emscripten_bind_b2MouseJointDef____destroy___p0;
var _emscripten_bind_b2Body__GetTransform_p0 = Module["_emscripten_bind_b2Body__GetTransform_p0"] = asm._emscripten_bind_b2Body__GetTransform_p0;
var _emscripten_bind_b2RopeJointDef__get_maxLength_p0 = Module["_emscripten_bind_b2RopeJointDef__get_maxLength_p0"] = asm._emscripten_bind_b2RopeJointDef__get_maxLength_p0;
var _emscripten_bind_b2ChainShape__set_m_vertices_p1 = Module["_emscripten_bind_b2ChainShape__set_m_vertices_p1"] = asm._emscripten_bind_b2ChainShape__set_m_vertices_p1;
var _emscripten_bind_b2EdgeShape__TestPoint_p2 = Module["_emscripten_bind_b2EdgeShape__TestPoint_p2"] = asm._emscripten_bind_b2EdgeShape__TestPoint_p2;
var _emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0 = Module["_emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0"] = asm._emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0;
var _emscripten_bind_b2ContactManager__AddPair_p2 = Module["_emscripten_bind_b2ContactManager__AddPair_p2"] = asm._emscripten_bind_b2ContactManager__AddPair_p2;
var _emscripten_bind_b2Contact__GetFriction_p0 = Module["_emscripten_bind_b2Contact__GetFriction_p0"] = asm._emscripten_bind_b2Contact__GetFriction_p0;
var _emscripten_bind_b2ChainShape__SetPrevVertex_p1 = Module["_emscripten_bind_b2ChainShape__SetPrevVertex_p1"] = asm._emscripten_bind_b2ChainShape__SetPrevVertex_p1;
var _memcpy = Module["_memcpy"] = asm._memcpy;
var _emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1 = Module["_emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1"] = asm._emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1;
var _emscripten_bind_b2DynamicTree__GetAreaRatio_p0 = Module["_emscripten_bind_b2DynamicTree__GetAreaRatio_p0"] = asm._emscripten_bind_b2DynamicTree__GetAreaRatio_p0;
var _emscripten_bind_b2World__SetGravity_p1 = Module["_emscripten_bind_b2World__SetGravity_p1"] = asm._emscripten_bind_b2World__SetGravity_p1;
var _emscripten_bind_b2PulleyJointDef__Initialize_p7 = Module["_emscripten_bind_b2PulleyJointDef__Initialize_p7"] = asm._emscripten_bind_b2PulleyJointDef__Initialize_p7;
var _emscripten_bind_b2World__GetTreeQuality_p0 = Module["_emscripten_bind_b2World__GetTreeQuality_p0"] = asm._emscripten_bind_b2World__GetTreeQuality_p0;
var _emscripten_bind_b2BroadPhase__DestroyProxy_p1 = Module["_emscripten_bind_b2BroadPhase__DestroyProxy_p1"] = asm._emscripten_bind_b2BroadPhase__DestroyProxy_p1;
var _emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1;
var _emscripten_bind_b2ChainShape__GetChildEdge_p2 = Module["_emscripten_bind_b2ChainShape__GetChildEdge_p2"] = asm._emscripten_bind_b2ChainShape__GetChildEdge_p2;
var _emscripten_bind_b2EdgeShape__b2EdgeShape_p0 = Module["_emscripten_bind_b2EdgeShape__b2EdgeShape_p0"] = asm._emscripten_bind_b2EdgeShape__b2EdgeShape_p0;
var _emscripten_bind_b2ContactEdge__set_contact_p1 = Module["_emscripten_bind_b2ContactEdge__set_contact_p1"] = asm._emscripten_bind_b2ContactEdge__set_contact_p1;
var _emscripten_bind_b2ChainShape__GetType_p0 = Module["_emscripten_bind_b2ChainShape__GetType_p0"] = asm._emscripten_bind_b2ChainShape__GetType_p0;
var _emscripten_bind_b2Fixture__SetFilterData_p1 = Module["_emscripten_bind_b2Fixture__SetFilterData_p1"] = asm._emscripten_bind_b2Fixture__SetFilterData_p1;
var _emscripten_bind_b2Body__ApplyAngularImpulse_p1 = Module["_emscripten_bind_b2Body__ApplyAngularImpulse_p1"] = asm._emscripten_bind_b2Body__ApplyAngularImpulse_p1;
var _emscripten_bind_b2ChainShape__TestPoint_p2 = Module["_emscripten_bind_b2ChainShape__TestPoint_p2"] = asm._emscripten_bind_b2ChainShape__TestPoint_p2;
var _emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0;
var _emscripten_bind_b2CircleShape__get_m_p_p0 = Module["_emscripten_bind_b2CircleShape__get_m_p_p0"] = asm._emscripten_bind_b2CircleShape__get_m_p_p0;
var _emscripten_bind_b2BodyDef__get_awake_p0 = Module["_emscripten_bind_b2BodyDef__get_awake_p0"] = asm._emscripten_bind_b2BodyDef__get_awake_p0;
var _emscripten_bind_b2Body__CreateFixture_p1 = Module["_emscripten_bind_b2Body__CreateFixture_p1"] = asm._emscripten_bind_b2Body__CreateFixture_p1;
var _emscripten_bind_b2Body__CreateFixture_p2 = Module["_emscripten_bind_b2Body__CreateFixture_p2"] = asm._emscripten_bind_b2Body__CreateFixture_p2;
var _emscripten_bind_b2GearJointDef____destroy___p0 = Module["_emscripten_bind_b2GearJointDef____destroy___p0"] = asm._emscripten_bind_b2GearJointDef____destroy___p0;
var _emscripten_bind_b2Fixture__GetDensity_p0 = Module["_emscripten_bind_b2Fixture__GetDensity_p0"] = asm._emscripten_bind_b2Fixture__GetDensity_p0;
var _emscripten_bind_b2PolygonShape__set_m_vertexCount_p1 = Module["_emscripten_bind_b2PolygonShape__set_m_vertexCount_p1"] = asm._emscripten_bind_b2PolygonShape__set_m_vertexCount_p1;
var _emscripten_bind_b2World__SetContactListener_p1 = Module["_emscripten_bind_b2World__SetContactListener_p1"] = asm._emscripten_bind_b2World__SetContactListener_p1;
var _emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0"] = asm._emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0;
var _emscripten_bind_b2FixtureDef__set_shape_p1 = Module["_emscripten_bind_b2FixtureDef__set_shape_p1"] = asm._emscripten_bind_b2FixtureDef__set_shape_p1;
var _emscripten_bind_b2Joint__Dump_p0 = Module["_emscripten_bind_b2Joint__Dump_p0"] = asm._emscripten_bind_b2Joint__Dump_p0;
var _emscripten_bind_b2Shape__TestPoint_p2 = Module["_emscripten_bind_b2Shape__TestPoint_p2"] = asm._emscripten_bind_b2Shape__TestPoint_p2;
var _emscripten_bind_b2ChainShape__RayCast_p4 = Module["_emscripten_bind_b2ChainShape__RayCast_p4"] = asm._emscripten_bind_b2ChainShape__RayCast_p4;
var _emscripten_bind_b2Transform__get_p_p0 = Module["_emscripten_bind_b2Transform__get_p_p0"] = asm._emscripten_bind_b2Transform__get_p_p0;
var _emscripten_bind_b2Body__IsBullet_p0 = Module["_emscripten_bind_b2Body__IsBullet_p0"] = asm._emscripten_bind_b2Body__IsBullet_p0;
var _emscripten_bind_b2WeldJointDef____destroy___p0 = Module["_emscripten_bind_b2WeldJointDef____destroy___p0"] = asm._emscripten_bind_b2WeldJointDef____destroy___p0;
var _emscripten_bind_b2CircleShape__GetChildCount_p0 = Module["_emscripten_bind_b2CircleShape__GetChildCount_p0"] = asm._emscripten_bind_b2CircleShape__GetChildCount_p0;
var _emscripten_bind_b2Draw__DrawCircle_p3 = Module["_emscripten_bind_b2Draw__DrawCircle_p3"] = asm._emscripten_bind_b2Draw__DrawCircle_p3;
var _emscripten_bind_b2Body__GetWorldPoint_p1 = Module["_emscripten_bind_b2Body__GetWorldPoint_p1"] = asm._emscripten_bind_b2Body__GetWorldPoint_p1;
var _emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1;
var _emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1;
var _emscripten_bind_b2BodyDef__set_bullet_p1 = Module["_emscripten_bind_b2BodyDef__set_bullet_p1"] = asm._emscripten_bind_b2BodyDef__set_bullet_p1;
var _emscripten_bind_b2BodyDef__get_angularVelocity_p0 = Module["_emscripten_bind_b2BodyDef__get_angularVelocity_p0"] = asm._emscripten_bind_b2BodyDef__get_angularVelocity_p0;
var _emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0;
var _emscripten_bind_b2Vec2__b2Vec2_p0 = Module["_emscripten_bind_b2Vec2__b2Vec2_p0"] = asm._emscripten_bind_b2Vec2__b2Vec2_p0;
var _emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0"] = asm._emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0;
var _emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0"] = asm._emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0;
var _emscripten_bind_b2GearJointDef__set_joint2_p1 = Module["_emscripten_bind_b2GearJointDef__set_joint2_p1"] = asm._emscripten_bind_b2GearJointDef__set_joint2_p1;
var _emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0 = Module["_emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0"] = asm._emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0;
var _emscripten_bind_b2BodyDef__set_userData_p1 = Module["_emscripten_bind_b2BodyDef__set_userData_p1"] = asm._emscripten_bind_b2BodyDef__set_userData_p1;
var _emscripten_bind_b2BroadPhase____destroy___p0 = Module["_emscripten_bind_b2BroadPhase____destroy___p0"] = asm._emscripten_bind_b2BroadPhase____destroy___p0;
var _emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0;
var _emscripten_bind_b2ChainShape__set_m_radius_p1 = Module["_emscripten_bind_b2ChainShape__set_m_radius_p1"] = asm._emscripten_bind_b2ChainShape__set_m_radius_p1;
var _emscripten_bind_b2GearJointDef__get_joint2_p0 = Module["_emscripten_bind_b2GearJointDef__get_joint2_p0"] = asm._emscripten_bind_b2GearJointDef__get_joint2_p0;
var _emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1;
var _emscripten_bind_b2Fixture__SetDensity_p1 = Module["_emscripten_bind_b2Fixture__SetDensity_p1"] = asm._emscripten_bind_b2Fixture__SetDensity_p1;
var _emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1;
var _emscripten_bind_b2Body__IsAwake_p0 = Module["_emscripten_bind_b2Body__IsAwake_p0"] = asm._emscripten_bind_b2Body__IsAwake_p0;
var _emscripten_bind_b2PolygonShape__SetAsBox_p4 = Module["_emscripten_bind_b2PolygonShape__SetAsBox_p4"] = asm._emscripten_bind_b2PolygonShape__SetAsBox_p4;
var _emscripten_bind_b2PolygonShape__SetAsBox_p2 = Module["_emscripten_bind_b2PolygonShape__SetAsBox_p2"] = asm._emscripten_bind_b2PolygonShape__SetAsBox_p2;
var _emscripten_bind_b2GearJointDef__set_joint1_p1 = Module["_emscripten_bind_b2GearJointDef__set_joint1_p1"] = asm._emscripten_bind_b2GearJointDef__set_joint1_p1;
var _emscripten_bind_b2Draw__DrawSolidCircle_p4 = Module["_emscripten_bind_b2Draw__DrawSolidCircle_p4"] = asm._emscripten_bind_b2Draw__DrawSolidCircle_p4;
var _emscripten_bind_b2World__GetSubStepping_p0 = Module["_emscripten_bind_b2World__GetSubStepping_p0"] = asm._emscripten_bind_b2World__GetSubStepping_p0;
var _emscripten_bind_b2Body__SetLinearDamping_p1 = Module["_emscripten_bind_b2Body__SetLinearDamping_p1"] = asm._emscripten_bind_b2Body__SetLinearDamping_p1;
var _emscripten_bind_b2Fixture__SetFriction_p1 = Module["_emscripten_bind_b2Fixture__SetFriction_p1"] = asm._emscripten_bind_b2Fixture__SetFriction_p1;
var _emscripten_bind_b2Filter__get_groupIndex_p0 = Module["_emscripten_bind_b2Filter__get_groupIndex_p0"] = asm._emscripten_bind_b2Filter__get_groupIndex_p0;
var _emscripten_bind_b2FixtureDef__get_isSensor_p0 = Module["_emscripten_bind_b2FixtureDef__get_isSensor_p0"] = asm._emscripten_bind_b2FixtureDef__get_isSensor_p0;
var _emscripten_bind_b2Vec2__op_mul_p1 = Module["_emscripten_bind_b2Vec2__op_mul_p1"] = asm._emscripten_bind_b2Vec2__op_mul_p1;
var _emscripten_bind_b2DistanceProxy__Set_p2 = Module["_emscripten_bind_b2DistanceProxy__Set_p2"] = asm._emscripten_bind_b2DistanceProxy__Set_p2;
var _emscripten_bind_b2EdgeShape__Set_p2 = Module["_emscripten_bind_b2EdgeShape__Set_p2"] = asm._emscripten_bind_b2EdgeShape__Set_p2;
var _emscripten_bind_b2BodyDef__get_userData_p0 = Module["_emscripten_bind_b2BodyDef__get_userData_p0"] = asm._emscripten_bind_b2BodyDef__get_userData_p0;
var _emscripten_bind_b2CircleShape__set_m_p_p1 = Module["_emscripten_bind_b2CircleShape__set_m_p_p1"] = asm._emscripten_bind_b2CircleShape__set_m_p_p1;
var _emscripten_bind_b2World__SetContactFilter_p1 = Module["_emscripten_bind_b2World__SetContactFilter_p1"] = asm._emscripten_bind_b2World__SetContactFilter_p1;
var _emscripten_bind_b2WheelJointDef__set_dampingRatio_p1 = Module["_emscripten_bind_b2WheelJointDef__set_dampingRatio_p1"] = asm._emscripten_bind_b2WheelJointDef__set_dampingRatio_p1;
var _emscripten_bind_b2DistanceProxy__get_m_count_p0 = Module["_emscripten_bind_b2DistanceProxy__get_m_count_p0"] = asm._emscripten_bind_b2DistanceProxy__get_m_count_p0;
var _emscripten_bind_b2WeldJointDef__set_dampingRatio_p1 = Module["_emscripten_bind_b2WeldJointDef__set_dampingRatio_p1"] = asm._emscripten_bind_b2WeldJointDef__set_dampingRatio_p1;
var _emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1"] = asm._emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1;
var _memset = Module["_memset"] = asm._memset;
var _emscripten_bind_b2World__GetTreeBalance_p0 = Module["_emscripten_bind_b2World__GetTreeBalance_p0"] = asm._emscripten_bind_b2World__GetTreeBalance_p0;
var _emscripten_bind_b2ContactListener__b2ContactListener_p0 = Module["_emscripten_bind_b2ContactListener__b2ContactListener_p0"] = asm._emscripten_bind_b2ContactListener__b2ContactListener_p0;
var _emscripten_bind_b2Rot____destroy___p0 = Module["_emscripten_bind_b2Rot____destroy___p0"] = asm._emscripten_bind_b2Rot____destroy___p0;
var _emscripten_bind_b2RopeJointDef__set_maxLength_p1 = Module["_emscripten_bind_b2RopeJointDef__set_maxLength_p1"] = asm._emscripten_bind_b2RopeJointDef__set_maxLength_p1;
var _emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0"] = asm._emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0;
var _emscripten_bind_b2Body__GetNext_p0 = Module["_emscripten_bind_b2Body__GetNext_p0"] = asm._emscripten_bind_b2Body__GetNext_p0;
var _emscripten_bind_b2BroadPhase__GetTreeHeight_p0 = Module["_emscripten_bind_b2BroadPhase__GetTreeHeight_p0"] = asm._emscripten_bind_b2BroadPhase__GetTreeHeight_p0;
var _emscripten_bind_b2Draw__DrawSegment_p3 = Module["_emscripten_bind_b2Draw__DrawSegment_p3"] = asm._emscripten_bind_b2Draw__DrawSegment_p3;
var _emscripten_bind_b2Body__IsActive_p0 = Module["_emscripten_bind_b2Body__IsActive_p0"] = asm._emscripten_bind_b2Body__IsActive_p0;
var _emscripten_bind_b2Vec2__Set_p2 = Module["_emscripten_bind_b2Vec2__Set_p2"] = asm._emscripten_bind_b2Vec2__Set_p2;
var _emscripten_bind_b2ContactEdge__b2ContactEdge_p0 = Module["_emscripten_bind_b2ContactEdge__b2ContactEdge_p0"] = asm._emscripten_bind_b2ContactEdge__b2ContactEdge_p0;
var _emscripten_bind_b2Vec3__b2Vec3_p3 = Module["_emscripten_bind_b2Vec3__b2Vec3_p3"] = asm._emscripten_bind_b2Vec3__b2Vec3_p3;
var _emscripten_bind_b2Vec3__b2Vec3_p0 = Module["_emscripten_bind_b2Vec3__b2Vec3_p0"] = asm._emscripten_bind_b2Vec3__b2Vec3_p0;
var _emscripten_bind_b2JointDef__b2JointDef_p0 = Module["_emscripten_bind_b2JointDef__b2JointDef_p0"] = asm._emscripten_bind_b2JointDef__b2JointDef_p0;
var _emscripten_bind_b2Vec2__get_x_p0 = Module["_emscripten_bind_b2Vec2__get_x_p0"] = asm._emscripten_bind_b2Vec2__get_x_p0;
var _emscripten_bind_b2PulleyJointDef____destroy___p0 = Module["_emscripten_bind_b2PulleyJointDef____destroy___p0"] = asm._emscripten_bind_b2PulleyJointDef____destroy___p0;
var _emscripten_bind_b2FixtureDef____destroy___p0 = Module["_emscripten_bind_b2FixtureDef____destroy___p0"] = asm._emscripten_bind_b2FixtureDef____destroy___p0;
var _emscripten_bind_b2EdgeShape__Clone_p1 = Module["_emscripten_bind_b2EdgeShape__Clone_p1"] = asm._emscripten_bind_b2EdgeShape__Clone_p1;
var _emscripten_bind_b2Body__GetUserData_p0 = Module["_emscripten_bind_b2Body__GetUserData_p0"] = asm._emscripten_bind_b2Body__GetUserData_p0;
var _emscripten_bind_b2Body__SetUserData_p1 = Module["_emscripten_bind_b2Body__SetUserData_p1"] = asm._emscripten_bind_b2Body__SetUserData_p1;
var _emscripten_bind_b2FixtureDef__set_friction_p1 = Module["_emscripten_bind_b2FixtureDef__set_friction_p1"] = asm._emscripten_bind_b2FixtureDef__set_friction_p1;
var _emscripten_bind_b2DistanceJointDef____destroy___p0 = Module["_emscripten_bind_b2DistanceJointDef____destroy___p0"] = asm._emscripten_bind_b2DistanceJointDef____destroy___p0;
var _emscripten_bind_b2FrictionJointDef__Initialize_p3 = Module["_emscripten_bind_b2FrictionJointDef__Initialize_p3"] = asm._emscripten_bind_b2FrictionJointDef__Initialize_p3;
var _emscripten_bind_b2Body__SetSleepingAllowed_p1 = Module["_emscripten_bind_b2Body__SetSleepingAllowed_p1"] = asm._emscripten_bind_b2Body__SetSleepingAllowed_p1;
var _emscripten_bind_b2Body__SetLinearVelocity_p1 = Module["_emscripten_bind_b2Body__SetLinearVelocity_p1"] = asm._emscripten_bind_b2Body__SetLinearVelocity_p1;
var _emscripten_bind_b2Body__ApplyLinearImpulse_p2 = Module["_emscripten_bind_b2Body__ApplyLinearImpulse_p2"] = asm._emscripten_bind_b2Body__ApplyLinearImpulse_p2;
var _emscripten_bind_b2ContactManager__set_m_contactList_p1 = Module["_emscripten_bind_b2ContactManager__set_m_contactList_p1"] = asm._emscripten_bind_b2ContactManager__set_m_contactList_p1;
var _emscripten_bind_b2Transform__get_q_p0 = Module["_emscripten_bind_b2Transform__get_q_p0"] = asm._emscripten_bind_b2Transform__get_q_p0;
var _emscripten_bind_b2JointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2JointDef__set_collideConnected_p1"] = asm._emscripten_bind_b2JointDef__set_collideConnected_p1;
var _emscripten_bind_b2CircleShape__ComputeAABB_p3 = Module["_emscripten_bind_b2CircleShape__ComputeAABB_p3"] = asm._emscripten_bind_b2CircleShape__ComputeAABB_p3;
var _emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0;
var _emscripten_bind_b2BlockAllocator__Allocate_p1 = Module["_emscripten_bind_b2BlockAllocator__Allocate_p1"] = asm._emscripten_bind_b2BlockAllocator__Allocate_p1;
var _emscripten_bind_b2GearJointDef__get_joint1_p0 = Module["_emscripten_bind_b2GearJointDef__get_joint1_p0"] = asm._emscripten_bind_b2GearJointDef__get_joint1_p0;
var _emscripten_bind_b2GearJointDef__set_ratio_p1 = Module["_emscripten_bind_b2GearJointDef__set_ratio_p1"] = asm._emscripten_bind_b2GearJointDef__set_ratio_p1;
var _emscripten_bind_b2ContactEdge____destroy___p0 = Module["_emscripten_bind_b2ContactEdge____destroy___p0"] = asm._emscripten_bind_b2ContactEdge____destroy___p0;
var _emscripten_bind_b2RevoluteJointDef__Initialize_p3 = Module["_emscripten_bind_b2RevoluteJointDef__Initialize_p3"] = asm._emscripten_bind_b2RevoluteJointDef__Initialize_p3;
var _emscripten_bind_b2BodyDef__set_angle_p1 = Module["_emscripten_bind_b2BodyDef__set_angle_p1"] = asm._emscripten_bind_b2BodyDef__set_angle_p1;
var _emscripten_bind_b2PrismaticJointDef__Initialize_p4 = Module["_emscripten_bind_b2PrismaticJointDef__Initialize_p4"] = asm._emscripten_bind_b2PrismaticJointDef__Initialize_p4;
var _emscripten_bind_b2Body__GetContactList_p0 = Module["_emscripten_bind_b2Body__GetContactList_p0"] = asm._emscripten_bind_b2Body__GetContactList_p0;
var _emscripten_bind_b2PulleyJointDef__get_ratio_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_ratio_p0"] = asm._emscripten_bind_b2PulleyJointDef__get_ratio_p0;
var _emscripten_bind_b2Body__GetWorldCenter_p0 = Module["_emscripten_bind_b2Body__GetWorldCenter_p0"] = asm._emscripten_bind_b2Body__GetWorldCenter_p0;
var _emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1;
var _emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1"] = asm._emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1;
var _emscripten_bind_b2BodyDef__set_angularDamping_p1 = Module["_emscripten_bind_b2BodyDef__set_angularDamping_p1"] = asm._emscripten_bind_b2BodyDef__set_angularDamping_p1;
var _emscripten_bind_b2Shape__ComputeAABB_p3 = Module["_emscripten_bind_b2Shape__ComputeAABB_p3"] = asm._emscripten_bind_b2Shape__ComputeAABB_p3;
var _emscripten_bind_b2Filter__get_categoryBits_p0 = Module["_emscripten_bind_b2Filter__get_categoryBits_p0"] = asm._emscripten_bind_b2Filter__get_categoryBits_p0;
var _emscripten_bind_b2Vec3__set_z_p1 = Module["_emscripten_bind_b2Vec3__set_z_p1"] = asm._emscripten_bind_b2Vec3__set_z_p1;
var _emscripten_bind_b2Transform__set_p_p1 = Module["_emscripten_bind_b2Transform__set_p_p1"] = asm._emscripten_bind_b2Transform__set_p_p1;
var _emscripten_bind_b2Fixture__GetNext_p0 = Module["_emscripten_bind_b2Fixture__GetNext_p0"] = asm._emscripten_bind_b2Fixture__GetNext_p0;
var _emscripten_bind_b2World__SetWarmStarting_p1 = Module["_emscripten_bind_b2World__SetWarmStarting_p1"] = asm._emscripten_bind_b2World__SetWarmStarting_p1;
var _emscripten_bind_b2Vec3__op_sub_p0 = Module["_emscripten_bind_b2Vec3__op_sub_p0"] = asm._emscripten_bind_b2Vec3__op_sub_p0;
var _emscripten_bind_b2ContactManager__Collide_p0 = Module["_emscripten_bind_b2ContactManager__Collide_p0"] = asm._emscripten_bind_b2ContactManager__Collide_p0;
var _emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0;
var _emscripten_bind_b2ContactManager__get_m_contactListener_p0 = Module["_emscripten_bind_b2ContactManager__get_m_contactListener_p0"] = asm._emscripten_bind_b2ContactManager__get_m_contactListener_p0;
var _emscripten_bind_b2World__RayCast_p3 = Module["_emscripten_bind_b2World__RayCast_p3"] = asm._emscripten_bind_b2World__RayCast_p3;
var _emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1;
var _emscripten_bind_b2EdgeShape__GetType_p0 = Module["_emscripten_bind_b2EdgeShape__GetType_p0"] = asm._emscripten_bind_b2EdgeShape__GetType_p0;
var _emscripten_bind_b2BodyDef__get_gravityScale_p0 = Module["_emscripten_bind_b2BodyDef__get_gravityScale_p0"] = asm._emscripten_bind_b2BodyDef__get_gravityScale_p0;
var _emscripten_bind_b2Body__DestroyFixture_p1 = Module["_emscripten_bind_b2Body__DestroyFixture_p1"] = asm._emscripten_bind_b2Body__DestroyFixture_p1;
var _emscripten_bind_b2WeldJointDef__set_referenceAngle_p1 = Module["_emscripten_bind_b2WeldJointDef__set_referenceAngle_p1"] = asm._emscripten_bind_b2WeldJointDef__set_referenceAngle_p1;
var _emscripten_bind_b2Vec3__op_add_p1 = Module["_emscripten_bind_b2Vec3__op_add_p1"] = asm._emscripten_bind_b2Vec3__op_add_p1;
var _emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0;
var _emscripten_bind_b2BodyDef__get_angle_p0 = Module["_emscripten_bind_b2BodyDef__get_angle_p0"] = asm._emscripten_bind_b2BodyDef__get_angle_p0;
var _emscripten_bind_b2DynamicTree__GetHeight_p0 = Module["_emscripten_bind_b2DynamicTree__GetHeight_p0"] = asm._emscripten_bind_b2DynamicTree__GetHeight_p0;
var dynCall_viiiii = Module["dynCall_viiiii"] = asm.dynCall_viiiii;
var dynCall_viifii = Module["dynCall_viifii"] = asm.dynCall_viifii;
var dynCall_vif = Module["dynCall_vif"] = asm.dynCall_vif;
var dynCall_viffif = Module["dynCall_viffif"] = asm.dynCall_viffif;
var dynCall_vi = Module["dynCall_vi"] = asm.dynCall_vi;
var dynCall_vii = Module["dynCall_vii"] = asm.dynCall_vii;
var dynCall_ii = Module["dynCall_ii"] = asm.dynCall_ii;
var dynCall_viifi = Module["dynCall_viifi"] = asm.dynCall_viifi;
var dynCall_if = Module["dynCall_if"] = asm.dynCall_if;
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm.dynCall_iiiiii;
var dynCall_iiii = Module["dynCall_iiii"] = asm.dynCall_iiii;
var dynCall_fif = Module["dynCall_fif"] = asm.dynCall_fif;
var dynCall_viff = Module["dynCall_viff"] = asm.dynCall_viff;
var dynCall_viiiiiiif = Module["dynCall_viiiiiiif"] = asm.dynCall_viiiiiiif;
var dynCall_vifff = Module["dynCall_vifff"] = asm.dynCall_vifff;
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm.dynCall_viiiiii;
var dynCall_iiif = Module["dynCall_iiif"] = asm.dynCall_iiif;
var dynCall_iif = Module["dynCall_iif"] = asm.dynCall_iif;
var dynCall_vifii = Module["dynCall_vifii"] = asm.dynCall_vifii;
var dynCall_fi = Module["dynCall_fi"] = asm.dynCall_fi;
var dynCall_iii = Module["dynCall_iii"] = asm.dynCall_iii;
var dynCall_fiiiif = Module["dynCall_fiiiif"] = asm.dynCall_fiiiif;
var dynCall_i = Module["dynCall_i"] = asm.dynCall_i;
var dynCall_iiiii = Module["dynCall_iiiii"] = asm.dynCall_iiiii;
var dynCall_ifff = Module["dynCall_ifff"] = asm.dynCall_ifff;
var dynCall_iff = Module["dynCall_iff"] = asm.dynCall_iff;
var dynCall_viii = Module["dynCall_viii"] = asm.dynCall_viii;
var dynCall_v = Module["dynCall_v"] = asm.dynCall_v;
var dynCall_viif = Module["dynCall_viif"] = asm.dynCall_viif;
var dynCall_viiii = Module["dynCall_viiii"] = asm.dynCall_viiii;
Runtime.stackAlloc = function(size) { return asm.stackAlloc(size) };
Runtime.stackSave = function() { return asm.stackSave() };
Runtime.stackRestore = function(top) { asm.stackRestore(top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
Module.callMain = function callMain(args) {
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
      ret = Module.callMain(args);
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
      doRun();
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
  // Prepare replacement lookup table and add replacements to FUNCTION_TABLE
  // There is actually no good way to do this! So we do the following hack:
  // We create a fake vtable with canary functions, to detect which actual
  // function is being called
  var vTable2 = _malloc(size*Runtime.QUANTUM_SIZE);
  setValue(object.ptr, vTable2, 'void*');
  var canaryValue;
  var functions = FUNCTION_TABLE.length;
  for (var i = 0; i < size; i++) {
    var index = FUNCTION_TABLE.length;
    (function(j) {
      FUNCTION_TABLE.push(function() {
        canaryValue = j;
      });
    })(i);
    FUNCTION_TABLE.push(0);
    setValue(vTable2 + Runtime.QUANTUM_SIZE*i, index, 'void*');
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
  FUNCTION_TABLE = FUNCTION_TABLE.slice(0, functions);
  // Do the replacements
  var replacements = {};
  replacementPairs.forEach(function(pair) {
    var replacementIndex = FUNCTION_TABLE.length;
    FUNCTION_TABLE.push(pair['replacement']);
    FUNCTION_TABLE.push(0);
    replacements[pair.originalIndex] = replacementIndex;
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
function b2Draw(){ throw "b2Draw is abstract!" }
b2Draw.prototype.__cache__ = {};
Module['b2Draw'] = b2Draw;
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
function b2RayCastCallback(){ throw "b2RayCastCallback is abstract!" }
b2RayCastCallback.prototype.__cache__ = {};
Module['b2RayCastCallback'] = b2RayCastCallback;
b2RayCastCallback.prototype['ReportFixture'] = function(arg0, arg1, arg2, arg3) {
    return _emscripten_bind_b2RayCastCallback__ReportFixture_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3);
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
function b2QueryCallback(){ throw "b2QueryCallback is abstract!" }
b2QueryCallback.prototype.__cache__ = {};
Module['b2QueryCallback'] = b2QueryCallback;
b2QueryCallback.prototype['ReportFixture'] = function(arg0) {
    return _emscripten_bind_b2QueryCallback__ReportFixture_p1(this.ptr, arg0.ptr);
}
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
function b2DestructionListener(){ throw "b2DestructionListener is abstract!" }
b2DestructionListener.prototype.__cache__ = {};
Module['b2DestructionListener'] = b2DestructionListener;
b2DestructionListener.prototype['SayGoodbye'] = function(arg0) {
    _emscripten_bind_b2DestructionListener__SayGoodbye_p1(this.ptr, arg0.ptr);
}
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
b2FrictionJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2FrictionJointDef____destroy___p0(this.ptr);
}
b2FrictionJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
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
b2FrictionJointDef.prototype['set_maxTorque'] = function(arg0) {
    _emscripten_bind_b2FrictionJointDef__set_maxTorque_p1(this.ptr, arg0);
}
b2FrictionJointDef.prototype['get_maxTorque'] = function() {
    return _emscripten_bind_b2FrictionJointDef__get_maxTorque_p0(this.ptr);
}
b2FrictionJointDef.prototype['Initialize'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2FrictionJointDef__Initialize_p3(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr);
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
b2PrismaticJointDef.prototype['set_upperTranslation'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1(this.ptr, arg0);
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
b2PrismaticJointDef.prototype['set_referenceAngle'] = function(arg0) {
    _emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1(this.ptr, arg0);
}
b2PrismaticJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2PrismaticJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2PrismaticJointDef____destroy___p0(this.ptr);
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
b2WheelJointDef.prototype['set_motorSpeed'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_motorSpeed_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['get_localAxisA'] = function() {
    return wrapPointer(_emscripten_bind_b2WheelJointDef__get_localAxisA_p0(this.ptr), Module['b2Vec2']);
}
b2WheelJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2WheelJointDef.prototype['get_frequencyHz'] = function() {
    return _emscripten_bind_b2WheelJointDef__get_frequencyHz_p0(this.ptr);
}
b2WheelJointDef.prototype['set_maxMotorTorque'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['get_enableMotor'] = function() {
    return _emscripten_bind_b2WheelJointDef__get_enableMotor_p0(this.ptr);
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
b2WheelJointDef.prototype['get_dampingRatio'] = function() {
    return _emscripten_bind_b2WheelJointDef__get_dampingRatio_p0(this.ptr);
}
b2WheelJointDef.prototype['set_enableMotor'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_enableMotor_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['set_frequencyHz'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_frequencyHz_p1(this.ptr, arg0);
}
b2WheelJointDef.prototype['Initialize'] = function(arg0, arg1, arg2, arg3) {
    _emscripten_bind_b2WheelJointDef__Initialize_p4(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3.ptr);
}
b2WheelJointDef.prototype['set_dampingRatio'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_dampingRatio_p1(this.ptr, arg0);
}
function b2WheelJointDef() {
    this.ptr = _emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0();
  b2WheelJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2WheelJointDef;
}
b2WheelJointDef.prototype.__cache__ = {};
Module['b2WheelJointDef'] = b2WheelJointDef;
b2WheelJointDef.prototype['set_localAxisA'] = function(arg0) {
    _emscripten_bind_b2WheelJointDef__set_localAxisA_p1(this.ptr, arg0.ptr);
}
b2WheelJointDef.prototype['get_motorSpeed'] = function() {
    return _emscripten_bind_b2WheelJointDef__get_motorSpeed_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2RevoluteJointDef.prototype['get_lowerAngle'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_upperAngle'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2RevoluteJointDef.prototype['get_enableLimit'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_lowerAngle'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['get_enableMotor'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_motorSpeed'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['get_upperAngle'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0(this.ptr);
}
b2RevoluteJointDef.prototype['set_referenceAngle'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['set_maxMotorTorque'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2RevoluteJointDef.prototype['get_referenceAngle'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0(this.ptr);
}
b2RevoluteJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2RevoluteJointDef.prototype['set_enableLimit'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['set_enableMotor'] = function(arg0) {
    _emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1(this.ptr, arg0);
}
b2RevoluteJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2RevoluteJointDef____destroy___p0(this.ptr);
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
b2RevoluteJointDef.prototype['get_maxMotorTorque'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0(this.ptr);
}
b2RevoluteJointDef.prototype['get_motorSpeed'] = function() {
    return _emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0(this.ptr);
}
b2PulleyJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2PulleyJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2PulleyJointDef____destroy___p0(this.ptr);
}
b2PulleyJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2PulleyJointDef.prototype['get_ratio'] = function() {
    return _emscripten_bind_b2PulleyJointDef__get_ratio_p0(this.ptr);
}
b2PulleyJointDef.prototype['get_lengthB'] = function() {
    return _emscripten_bind_b2PulleyJointDef__get_lengthB_p0(this.ptr);
}
b2PulleyJointDef.prototype['get_lengthA'] = function() {
    return _emscripten_bind_b2PulleyJointDef__get_lengthA_p0(this.ptr);
}
b2PulleyJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJointDef.prototype['set_ratio'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_ratio_p1(this.ptr, arg0);
}
b2PulleyJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJointDef.prototype['get_groundAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0(this.ptr), Module['b2Vec2']);
}
b2PulleyJointDef.prototype['set_groundAnchorB'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1(this.ptr, arg0.ptr);
}
function b2PulleyJointDef() {
    this.ptr = _emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0();
  b2PulleyJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2PulleyJointDef;
}
b2PulleyJointDef.prototype.__cache__ = {};
Module['b2PulleyJointDef'] = b2PulleyJointDef;
b2PulleyJointDef.prototype['set_groundAnchorA'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1(this.ptr, arg0.ptr);
}
b2PulleyJointDef.prototype['Initialize'] = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    _emscripten_bind_b2PulleyJointDef__Initialize_p7(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr, arg3.ptr, arg4.ptr, arg5.ptr, arg6);
}
b2PulleyJointDef.prototype['set_lengthB'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_lengthB_p1(this.ptr, arg0);
}
b2PulleyJointDef.prototype['set_lengthA'] = function(arg0) {
    _emscripten_bind_b2PulleyJointDef__set_lengthA_p1(this.ptr, arg0);
}
b2PulleyJointDef.prototype['get_groundAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0(this.ptr), Module['b2Vec2']);
}
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
b2Color.prototype['set_b'] = function(arg0) {
    _emscripten_bind_b2Color__set_b_p1(this.ptr, arg0);
}
b2Color.prototype['Set'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2Color__Set_p3(this.ptr, arg0, arg1, arg2);
}
b2Color.prototype['get_b'] = function() {
    return _emscripten_bind_b2Color__get_b_p0(this.ptr);
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
b2WeldJointDef.prototype['set_localAnchorA'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_localAnchorA_p1(this.ptr, arg0.ptr);
}
b2WeldJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2WeldJointDef____destroy___p0(this.ptr);
}
b2WeldJointDef.prototype['get_frequencyHz'] = function() {
    return _emscripten_bind_b2WeldJointDef__get_frequencyHz_p0(this.ptr);
}
b2WeldJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2WeldJointDef.prototype['set_dampingRatio'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_dampingRatio_p1(this.ptr, arg0);
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
b2WeldJointDef.prototype['get_dampingRatio'] = function() {
    return _emscripten_bind_b2WeldJointDef__get_dampingRatio_p0(this.ptr);
}
b2WeldJointDef.prototype['set_frequencyHz'] = function(arg0) {
    _emscripten_bind_b2WeldJointDef__set_frequencyHz_p1(this.ptr, arg0);
}
b2WeldJointDef.prototype['Initialize'] = function(arg0, arg1, arg2) {
    _emscripten_bind_b2WeldJointDef__Initialize_p3(this.ptr, arg0.ptr, arg1.ptr, arg2.ptr);
}
function b2WeldJointDef() {
    this.ptr = _emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0();
  b2WeldJointDef.prototype.__cache__[this.ptr] = this;
  this.__class__ = b2WeldJointDef;
}
b2WeldJointDef.prototype.__cache__ = {};
Module['b2WeldJointDef'] = b2WeldJointDef;
b2MouseJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2MouseJointDef____destroy___p0(this.ptr);
}
b2MouseJointDef.prototype['get_frequencyHz'] = function() {
    return _emscripten_bind_b2MouseJointDef__get_frequencyHz_p0(this.ptr);
}
b2MouseJointDef.prototype['set_dampingRatio'] = function(arg0) {
    _emscripten_bind_b2MouseJointDef__set_dampingRatio_p1(this.ptr, arg0);
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
b2MouseJointDef.prototype['get_target'] = function() {
    return wrapPointer(_emscripten_bind_b2MouseJointDef__get_target_p0(this.ptr), Module['b2Vec2']);
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
b2DistanceJointDef.prototype['get_length'] = function() {
    return _emscripten_bind_b2DistanceJointDef__get_length_p0(this.ptr);
}
b2DistanceJointDef.prototype['get_frequencyHz'] = function() {
    return _emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0(this.ptr);
}
b2DistanceJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2DistanceJointDef.prototype['set_dampingRatio'] = function(arg0) {
    _emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1(this.ptr, arg0);
}
b2DistanceJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2DistanceJointDef____destroy___p0(this.ptr);
}
b2DistanceJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2DistanceJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
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
b2GearJointDef.prototype['set_joint1'] = function(arg0) {
    _emscripten_bind_b2GearJointDef__set_joint1_p1(this.ptr, arg0.ptr);
}
b2GearJointDef.prototype['set_joint2'] = function(arg0) {
    _emscripten_bind_b2GearJointDef__set_joint2_p1(this.ptr, arg0.ptr);
}
b2GearJointDef.prototype['set_ratio'] = function(arg0) {
    _emscripten_bind_b2GearJointDef__set_ratio_p1(this.ptr, arg0);
}
b2GearJointDef.prototype['get_joint1'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJointDef__get_joint1_p0(this.ptr), Module['b2Joint']);
}
b2GearJointDef.prototype['get_joint2'] = function() {
    return wrapPointer(_emscripten_bind_b2GearJointDef__get_joint2_p0(this.ptr), Module['b2Joint']);
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
b2RopeJointDef.prototype['__destroy__'] = function() {
    _emscripten_bind_b2RopeJointDef____destroy___p0(this.ptr);
}
b2RopeJointDef.prototype['get_maxLength'] = function() {
    return _emscripten_bind_b2RopeJointDef__get_maxLength_p0(this.ptr);
}
b2RopeJointDef.prototype['set_localAnchorB'] = function(arg0) {
    _emscripten_bind_b2RopeJointDef__set_localAnchorB_p1(this.ptr, arg0.ptr);
}
b2RopeJointDef.prototype['get_localAnchorA'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJointDef__get_localAnchorA_p0(this.ptr), Module['b2Vec2']);
}
b2RopeJointDef.prototype['get_localAnchorB'] = function() {
    return wrapPointer(_emscripten_bind_b2RopeJointDef__get_localAnchorB_p0(this.ptr), Module['b2Vec2']);
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
