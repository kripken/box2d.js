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
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 23144;
__ATINIT__ = __ATINIT__.concat([
]);
var __ZTVN10__cxxabiv120__si_class_type_infoE;
var __ZTVN10__cxxabiv117__class_type_infoE;
var __ZTISt9exception;
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,128,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,144,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,0,8,1,0,0,248,0,0,0,44,0,0,0,58,0,0,0,74,0,0,0,174,0,0,0,86,1,0,0,190,1,0,0,18,1,0,0,104,2,0,0,116,0,0,0,214,0,0,0,154,0,0,0,18,1,0,0,254,0,0,0,78,1,0,0,0,1,0,0,248,1,0,0,130,0,0,0,160,0,0,0,90,0,0,0,212,0,0,0,244,1,0,0,220,1,0,0,44,0,0,0,120,0,0,0,250,1,0,0,160,0,0,0,60,0,0,0,120,0,0,0,50,0,0,0,72,1,0,0,156,0,0,0,178,0,0,0,210,1,0,0,84,1,0,0,174,0,0,0,68,0,0,0,56,0,0,0,52,2,0,0,170,0,0,0,118,1,0,0,166,0,0,0,84,0,0,0,208,0,0,0,42,0,0,0,130,1,0,0,82,0,0,0,96,0,0,0,222,1,0,0,188,0,0,0,142,1,0,0,16,1,0,0,44,0,0,0,52,0,0,0,246,0,0,0,124,0,0,0,42,0,0,0,202,0,0,0,60,0,0,0,102,0,0,0,22,1,0,0,34,1,0,0,216,0,0,0,198,0,0,0,152,0,0,0,68,0,0,0,114,1,0,0,88,0,0,0,62,0,0,0,6,2,0,0,38,2,0,0,190,0,0,0,240,0,0,0,132,0,0,0,96,1,0,0,152,0,0,0,52,0,0,0,64,0,0,0,108,1,0,0,218,0,0,0,138,0,0,0,150,1,0,0,46,0,0,0,78,0,0,0,54,0,0,0,202,0,0,0,56,1,0,0,28,1,0,0,66,1,0,0,250,0,0,0,28,2,0,0,60,0,0,0,248,0,0,0,88,1,0,0,0,1,0,0,66,2,0,0,222,0,0,0,72,2,0,0,2,1,0,0,168,0,0,0,116,0,0,0,56,0,0,0,56,0,0,0,80,2,0,0,70,0,0,0,190,0,0,0,148,0,0,0,74,0,0,0,42,0,0,0,72,0,0,0,62,2,0,0,76,0,0,0,162,1,0,0,178,1,0,0,50,0,0,0,70,0,0,0,46,0,0,0,50,0,0,0,126,1,0,0,60,0,0,0,166,0,0,0,198,0,0,0,188,1,0,0,60,1,0,0,56,2,0,0,40,2,0,0,170,1,0,0,136,1,0,0,222,0,0,0,94,1,0,0,64,0,0,0,212,0,0,0,120,1,0,0,106,1,0,0,98,2,0,0,136,0,0,0,68,0,0,0,88,1,0,0,146,0,0,0,106,2,0,0,62,0,0,0,42,0,0,0,148,0,0,0,88,0,0,0,208,0,0,0,164,0,0,0,86,0,0,0,130,0,0,0,108,0,0,0,92,0,0,0,166,0,0,0,72,0,0,0,238,0,0,0,14,1,0,0,84,0,0,0,96,0,0,0,58,1,0,0,148,1,0,0,210,1,0,0,170,1,0,0,94,0,0,0,118,0,0,0,62,1,0,0,54,1,0,0,82,0,0,0,200,1,0,0,74,0,0,0,242,1,0,0,128,1,0,0,120,0,0,0,134,0,0,0,224,0,0,0,50,0,0,0,46,0,0,0,38,1,0,0,46,1,0,0,46,0,0,0,240,0,0,0,20,1,0,0,208,0,0,0,118,0,0,0,46,0,0,0,254,0,0,0,54,1,0,0,42,0,0,0,72,0,0,0,50,0,0,0,64,1,0,0,44,0,0,0,42,0,0,0,214,0,0,0,142,1,0,0,164,1,0,0,2,1,0,0,214,0,0,0,62,0,0,0,140,0,0,0,174,0,0,0,138,0,0,0,116,0,0,0,76,0,0,0,46,0,0,0,76,0,0,0,216,1,0,0,100,2,0,0,56,0,0,0,72,0,0,0,100,0,0,0,168,1,0,0,2,2,0,0,80,0,0,0,144,1,0,0,174,0,0,0,78,1,0,0,194,1,0,0,72,0,0,0,16,1,0,0,80,1,0,0,246,0,0,0,42,0,0,0,152,1,0,0,196,0,0,0,32,2,0,0,106,0,0,0,56,0,0,0,208,1,0,0,246,1,0,0,228,0,0,0,112,0,0,0,42,0,0,0,78,0,0,0,52,0,0,0,0,2,0,0,84,0,0,0,158,0,0,0,198,0,0,0,60,1,0,0,238,0,0,0,94,2,0,0,72,0,0,0,134,0,0,0,222,0,0,0,232,0,0,0,116,0,0,0,196,1,0,0,76,1,0,0,46,0,0,0,44,0,0,0,48,0,0,0,42,0,0,0,204,0,0,0,94,0,0,0,66,0,0,0,218,0,0,0,186,0,0,0,146,0,0,0,112,1,0,0,86,0,0,0,206,1,0,0,212,1,0,0,230,0,0,0,188,0,0,0,94,1,0,0,38,1,0,0,168,1,0,0,44,0,0,0,54,0,0,0,248,0,0,0,78,2,0,0,238,1,0,0,14,2,0,0,82,0,0,0,118,0,0,0,126,0,0,0,210,0,0,0,200,0,0,0,14,1,0,0,90,2,0,0,118,1,0,0,56,1,0,0,126,0,0,0,62,0,0,0,254,1,0,0,20,2,0,0,216,0,0,0,244,0,0,0,42,0,0,0,46,0,0,0,82,0,0,0,150,0,0,0,58,0,0,0,110,0,0,0,70,0,0,0,30,1,0,0,186,1,0,0,182,0,0,0,88,0,0,0,42,0,0,0,44,0,0,0,52,0,0,0,54,0,0,0,134,1,0,0,166,1,0,0,204,0,0,0,42,1,0,0,78,0,0,0,110,0,0,0,162,0,0,0,202,1,0,0,64,0,0,0,236,0,0,0,46,0,0,0,158,0,0,0,54,0,0,0,218,0,0,0,124,1,0,0,100,0,0,0,142,0,0,0,58,1,0,0,110,1,0,0,168,0,0,0,74,0,0,0,160,0,0,0,160,1,0,0,230,1,0,0,232,1,0,0,164,0,0,0,188,0,0,0,138,1,0,0,238,0,0,0,52,0,0,0,138,0,0,0,104,1,0,0,108,0,0,0,242,0,0,0,70,0,0,0,180,0,0,0,44,0,0,0,90,1,0,0,72,1,0,0,48,0,0,0,206,0,0,0,140,1,0,0,60,0,0,0,172,1,0,0,226,0,0,0,90,0,0,0,216,0,0,0,44,0,0,0,44,0,0,0,154,1,0,0,76,0,0,0,206,0,0,0,214,1,0,0,220,0,0,0,88,0,0,0,186,0,0,0,142,0,0,0,192,0,0,0,122,0,0,0,106,0,0,0,226,0,0,0,98,1,0,0,42,0,0,0,44,0,0,0,196,0,0,0,252,1,0,0,50,0,0,0,186,0,0,0,122,0,0,0,86,1,0,0,66,0,0,0,150,0,0,0,198,1,0,0,62,0,0,0,48,0,0,0,66,0,0,0,56,0,0,0,92,2,0,0,60,0,0,0,116,1,0,0,46,0,0,0,110,1,0,0,186,0,0,0,28,1,0,0,184,0,0,0,188,0,0,0,80,0,0,0,50,0,0,0,164,0,0,0,54,0,0,0,186,0,0,0,54,0,0,0,236,1,0,0,22,1,0,0,234,0,0,0,46,0,0,0,196,0,0,0,232,0,0,0,176,1,0,0,12,1,0,0,210,0,0,0,4,1,0,0,122,0,0,0,212,0,0,0,184,0,0,0,84,0,0,0,140,1,0,0,224,0,0,0,50,0,0,0,226,0,0,0,242,0,0,0,50,1,0,0,44,0,0,0,56,0,0,0,70,0,0,0,100,0,0,0,66,0,0,0,92,0,0,0,84,0,0,0,58,0,0,0,46,0,0,0,42,0,0,0,92,0,0,0,64,0,0,0,134,1,0,0,10,1,0,0,184,0,0,0,48,0,0,0,52,1,0,0,94,0,0,0,164,0,0,0,36,1,0,0,162,0,0,0,66,0,0,0,48,0,0,0,106,0,0,0,54,0,0,0,176,0,0,0,108,2,0,0,44,0,0,0,68,0,0,0,82,1,0,0,44,0,0,0,100,0,0,0,98,1,0,0,98,0,0,0,152,0,0,0,154,0,0,0,206,0,0,0,188,0,0,0,44,1,0,0,122,1,0,0,172,1,0,0,74,0,0,0,132,1,0,0,206,0,0,0,138,0,0,0,72,0,0,0,86,0,0,0,156,0,0,0,144,0,0,0,158,0,0,0,58,0,0,0,132,0,0,0,124,0,0,0,252,0,0,0,48,0,0,0,100,0,0,0,88,2,0,0,62,0,0,0,136,0,0,0,74,2,0,0,96,0,0,0,54,0,0,0,124,0,0,0,122,0,0,0,182,1,0,0,94,0,0,0,24,2,0,0,68,0,0,0,68,0,0,0,188,1,0,0,192,0,0,0,254,0,0,0,60,2,0,0,186,1,0,0,64,0,0,0,76,0,0,0,152,0,0,0,218,0,0,0,156,0,0,0,16,1,0,0,44,1,0,0,80,0,0,0,36,2,0,0,198,0,0,0,160,0,0,0,42,0,0,0,142,0,0,0,240,1,0,0,10,2,0,0,116,0,0,0,72,0,0,0,144,0,0,0,192,1,0,0,172,0,0,0,146,0,0,0,92,1,0,0,166,0,0,0,82,1,0,0,48,0,0,0,16,2,0,0,244,0,0,0,98,0,0,0,190,0,0,0,92,0,0,0,240,0,0,0,234,1,0,0,56,0,0,0,122,0,0,0,118,0,0,0,64,2,0,0,48,1,0,0,172,0,0,0,218,1,0,0,102,0,0,0,130,0,0,0,204,0,0,0,64,0,0,0,26,1,0,0,74,1,0,0,54,2,0,0,106,0,0,0,76,2,0,0,92,0,0,0,178,0,0,0,18,2,0,0,18,1,0,0,42,2,0,0,92,1,0,0,48,1,0,0,58,0,0,0,228,0,0,0,86,2,0,0,202,0,0,0,148,0,0,0,124,0,0,0,192,0,0,0,52,0,0,0,120,0,0,0,176,0,0,0,70,0,0,0,154,0,0,0,78,0,0,0,246,0,0,0,50,0,0,0,84,1,0,0,44,2,0,0,138,0,0,0,98,0,0,0,42,0,0,0,96,2,0,0,36,1,0,0,94,0,0,0,108,0,0,0,158,1,0,0,64,1,0,0,52,1,0,0,132,0,0,0,166,0,0,0,62,0,0,0,40,1,0,0,84,0,0,0,74,1,0,0,112,0,0,0,198,0,0,0,206,0,0,0,96,0,0,0,68,0,0,0,70,0,0,0,4,2,0,0,68,1,0,0,114,0,0,0,2,1,0,0,102,0,0,0,74,0,0,0,100,0,0,0,48,2,0,0,202,0,0,0,234,0,0,0,108,0,0,0,250,0,0,0,136,0,0,0,154,1,0,0,104,0,0,0,10,1,0,0,102,1,0,0,104,0,0,0,74,0,0,0,200,1,0,0,236,0,0,0,200,0,0,0,252,0,0,0,226,0,0,0,78,0,0,0,28,1,0,0,144,0,0,0,46,1,0,0,50,1,0,0,128,0,0,0,164,0,0,0,102,0,0,0,42,0,0,0,48,0,0,0,236,0,0,0,52,0,0,0,128,0,0,0,194,0,0,0,76,0,0,0,178,0,0,0,52,0,0,0,170,0,0,0,146,0,0,0,214,0,0,0,58,0,0,0,132,0,0,0,90,0,0,0,156,0,0,0,42,0,0,0,110,0,0,0,218,1,0,0,204,0,0,0,112,0,0,0,44,0,0,0,66,0,0,0,102,2,0,0,98,0,0,0,64,0,0,0,92,0,0,0,96,0,0,0,200,0,0,0,42,0,0,0,78,0,0,0,50,2,0,0,170,0,0,0,194,0,0,0,170,0,0,0,216,1,0,0,70,1,0,0,68,1,0,0,46,2,0,0,14,1,0,0,138,1,0,0,180,0,0,0,140,0,0,0,60,0,0,0,82,0,0,0,94,0,0,0,112,0,0,0,72,0,0,0,172,0,0,0,144,0,0,0,180,0,0,0,182,1,0,0,244,0,0,0,68,1,0,0,120,0,0,0,220,0,0,0,112,0,0,0,186,0,0,0,214,1,0,0,48,0,0,0,136,1,0,0,242,0,0,0,10,1,0,0,70,0,0,0,50,0,0,0,60,0,0,0,234,0,0,0,22,2,0,0,172,0,0,0,178,0,0,0,110,2,0,0,60,0,0,0,134,0,0,0,178,0,0,0,118,0,0,0,76,0,0,0,92,0,0,0,90,0,0,0,178,0,0,0,156,1,0,0,88,0,0,0,160,1,0,0,62,1,0,0,112,0,0,0,168,0,0,0,174,1,0,0,6,1,0,0,64,0,0,0,106,0,0,0,50,0,0,0,42,0,0,0,184,0,0,0,6,1,0,0,62,1,0,0,114,0,0,0,116,0,0,0,46,0,0,0,124,0,0,0,204,1,0,0,220,0,0,0,196,0,0,0,42,0,0,0,96,0,0,0,134,0,0,0,192,0,0,0,146,0,0,0,102,1,0,0,104,0,0,0,26,1,0,0,154,0,0,0,182,0,0,0,150,0,0,0,72,0,0,0,54,0,0,0,230,0,0,0,58,0,0,0,86,1,0,0,250,0,0,0,232,0,0,0,34,1,0,0,108,0,0,0,226,1,0,0,142,0,0,0,248,0,0,0,162,1,0,0,176,0,0,0,182,0,0,0,212,0,0,0,56,0,0,0,66,0,0,0,104,0,0,0,98,0,0,0,142,0,0,0,86,0,0,0,102,0,0,0,110,0,0,0,58,0,0,0,66,0,0,0,62,0,0,0,102,0,0,0,60,0,0,0,118,0,0,0,202,1,0,0,100,1,0,0,42,0,0,0,20,1,0,0,98,0,0,0,190,0,0,0,42,1,0,0,30,2,0,0,58,2,0,0,128,0,0,0,178,1,0,0,42,0,0,0,246,0,0,0,66,1,0,0,196,0,0,0,8,2,0,0,50,0,0,0,70,0,0,0,162,0,0,0,90,0,0,0,106,0,0,0,140,0,0,0,156,0,0,0,172,0,0,0,82,0,0,0,146,1,0,0,182,0,0,0,94,0,0,0,68,0,0,0,154,0,0,0,196,1,0,0,252,0,0,0,116,1,0,0,48,0,0,0,194,1,0,0,114,0,0,0,150,0,0,0,12,1,0,0,44,0,0,0,208,1,0,0,210,0,0,0,12,2,0,0,82,2,0,0,56,0,0,0,46,0,0,0,240,0,0,0,242,0,0,0,44,0,0,0,62,0,0,0,172,0,0,0,90,0,0,0,42,0,0,0,150,0,0,0,162,0,0,0,210,0,0,0,170,0,0,0,176,0,0,0,68,0,0,0,32,1,0,0,190,1,0,0,188,0,0,0,180,1,0,0,70,1,0,0,156,1,0,0,204,0,0,0,24,1,0,0,52,0,0,0,70,0,0,0,74,1,0,0,176,0,0,0,100,0,0,0,86,0,0,0,48,0,0,0,90,0,0,0,194,0,0,0,220,1,0,0,192,1,0,0,42,1,0,0,208,0,0,0,184,1,0,0,86,0,0,0,126,1,0,0,56,0,0,0,230,0,0,0,202,0,0,0,158,0,0,0,78,0,0,0,194,0,0,0,64,0,0,0,196,0,0,0,180,0,0,0,154,0,0,0,122,1,0,0,90,1,0,0,86,0,0,0,126,0,0,0,60,1,0,0,126,0,0,0,62,0,0,0,92,0,0,0,132,0,0,0,24,1,0,0,204,1,0,0,114,0,0,0,58,0,0,0,96,1,0,0,58,0,0,0,66,0,0,0,176,1,0,0,148,0,0,0,180,0,0,0,76,0,0,0,124,0,0,0,24,1,0,0,138,0,0,0,26,2,0,0,182,0,0,0,80,0,0,0,108,0,0,0,72,1,0,0,174,1,0,0,130,0,0,0,44,0,0,0,44,0,0,0,60,0,0,0,164,0,0,0,114,0,0,0,84,2,0,0,146,1,0,0,104,1,0,0,148,1,0,0,146,0,0,0,158,0,0,0,34,2,0,0,132,0,0,0,116,0,0,0,100,0,0,0,166,1,0,0,78,1,0,0,128,1,0,0,168,0,0,0,32,1,0,0,152,1,0,0,228,1,0,0,136,0,0,0,86,0,0,0,110,0,0,0,224,1,0,0,110,0,0,0,144,0,0,0,128,0,0,0,104,0,0,0,30,1,0,0,232,0,0,0,244,0,0,0,158,1,0,0,200,0,0,0,136,0,0,0,80,0,0,0,134,0,0,0,98,0,0,0,176,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,76,0,0,0,0,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,109,95,102,105,120,116,117,114,101,67,111,117,110,116,32,62,32,48,0,0,0,0,0,0,32,32,106,100,46,109,97,120,77,111,116,111,114,84,111,114,113,117,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,101,110,97,98,108,101,76,105,109,105,116,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,32,32,106,100,46,106,111,105,110,116,50,32,61,32,106,111,105,110,116,115,91,37,100,93,59,10,0,0,0,0,0,0,32,32,106,100,46,109,97,120,70,111,114,99,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,98,50,86,101,99,50,32,103,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,32,32,32,32,102,100,46,102,105,108,116,101,114,46,109,97,115,107,66,105,116,115,32,61,32,117,105,110,116,49,54,40,37,100,41,59,10,0,0,0,48,32,60,61,32,105,66,32,38,38,32,105,66,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,102,105,120,116,117,114,101,45,62,109,95,98,111,100,121,32,61,61,32,116,104,105,115,0,32,32,106,100,46,109,111,116,111,114,83,112,101,101,100,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,32,32,106,100,46,103,114,111,117,110,100,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,32,32,106,100,46,106,111,105,110,116,49,32,61,32,106,111,105,110,116,115,91,37,100,93,59,10,0,0,0,0,0,0,118,101,114,116,101,120,67,111,117,110,116,32,60,61,32,56,0,0,0,0,0,0,0,0,32,32,32,32,102,100,46,102,105,108,116,101,114,46,99,97,116,101,103,111,114,121,66,105,116,115,32,61,32,117,105,110,116,49,54,40,37,100,41,59,10,0,0,0,0,0,0,0,105,65,32,33,61,32,40,45,49,41,0,0,0,0,0,0,109,95,119,111,114,108,100,45,62,73,115,76,111,99,107,101,100,40,41,32,61,61,32,102,97,108,115,101,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,66,111,100,121,46,99,112,112,0,0,32,32,106,100,46,101,110,97,98,108,101,77,111,116,111,114,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,32,32,106,100,46,103,114,111,117,110,100,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,109,109,111,110,47,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,46,99,112,112,0,0,97,108,112,104,97,48,32,60,32,49,46,48,102,0,0,0,32,32,32,32,102,100,46,105,115,83,101,110,115,111,114,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,99,104,105,108,100,50,32,33,61,32,40,45,49,41,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,108,105,110,101,97,114,68,97,109,112,105,110,103,41,32,38,38,32,98,100,45,62,108,105,110,101,97,114,68,97,109,112,105,110,103,32,62,61,32,48,46,48,102,0,0,0,0,0,0,0,99,111,117,110,116,32,62,61,32,51,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,120,105,115,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,32,32,106,100,46,114,101,102,101,114,101,110,99,101,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,109,97,120,76,101,110,103,116,104,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,77,111,117,115,101,32,106,111,105,110,116,32,100,117,109,112,105,110,103,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,46,10,0,0,32,32,106,100,46,108,101,110,103,116,104,32,61,32,37,46,49,53,108,101,102,59,10,0,99,104,105,108,100,49,32,33,61,32,40,45,49,41,0,0,116,121,112,101,65,32,61,61,32,98,50,95,100,121,110,97,109,105,99,66,111,100,121,32,124,124,32,116,121,112,101,66,32,61,61,32,98,50,95,100,121,110,97,109,105,99,66,111,100,121,0,0,0,0,0,0,32,32,32,32,102,100,46,100,101,110,115,105,116,121,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,105,115,116,97,110,99,101,46,99,112,112,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,109,109,111,110,47,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,46,99,112,112,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,97,110,103,117,108,97,114,68,97,109,112,105,110,103,41,32,38,38,32,98,100,45,62,97,110,103,117,108,97,114,68,97,109,112,105,110,103,32,62,61,32,48,46,48,102,0,0,0,0,0,112,32,61,61,32,101,110,116,114,121,45,62,100,97,116,97,0,0,0,0,0,0,0,0,97,114,101,97,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,0,99,104,105,108,100,73,110,100,101,120,32,60,32,109,95,99,111,117,110,116,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,48,32,60,32,99,111,117,110,116,32,38,38,32,99,111,117,110,116,32,60,32,51,0,0,100,32,43,32,104,32,42,32,107,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,0,0,0,0,112,99,45,62,112,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,83,104,97,112,101,115,47,98,50,80,111,108,121,103,111,110,83,104,97,112,101,46,99,112,112,0,0,109,95,110,111,100,101,115,91,112,114,111,120,121,73,100,93,46,73,115,76,101,97,102,40,41,0,0,0,0,0,0,0,115,116,97,99,107,67,111,117,110,116,32,60,32,115,116,97,99,107,83,105,122,101,0,0,32,32,32,32,102,100,46,114,101,115,116,105,116,117,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,99,97,99,104,101,45,62,99,111,117,110,116,32,60,61,32,51,0,0,0,0,0,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,97,110,103,117,108,97,114,86,101,108,111,99,105,116,121,41,0,0,109,95,101,110,116,114,121,67,111,117,110,116,32,62,32,48,0,0,0,0,0,0,0,0,98,108,111,99,107,67,111,117,110,116,32,42,32,98,108,111,99,107,83,105,122,101,32,60,61,32,98,50,95,99,104,117,110,107,83,105,122,101,0,0,109,95,118,101,114,116,101,120,67,111,117,110,116,32,62,61,32,51,0,0,0,0,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,109,95,99,111,117,110,116,32,45,32,49,0,0,0,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,0,98,50,73,115,86,97,108,105,100,40,100,101,102,45,62,100,97,109,112,105,110,103,82,97,116,105,111,41,32,38,38,32,100,101,102,45,62,100,97,109,112,105,110,103,82,97,116,105,111,32,62,61,32,48,46,48,102,0,0,0,0,0,0,0,32,32,98,50,71,101,97,114,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,97,46,120,32,62,61,32,48,46,48,102,32,38,38,32,97,46,121,32,62,61,32,48,46,48,102,0,0,0,0,0,0,48,32,60,61,32,116,121,112,101,65,32,38,38,32,116,121,112,101,66,32,60,32,98,50,83,104,97,112,101,58,58,101,95,116,121,112,101,67,111,117,110,116,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,83,104,97,112,101,115,47,98,50,67,104,97,105,110,83,104,97,112,101,46,99,112,112,0,0,0,0,98,45,62,73,115,65,99,116,105,118,101,40,41,32,61,61,32,116,114,117,101,0,0,0,32,32,98,50,87,104,101,101,108,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,32,32,32,32,102,100,46,102,114,105,99,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,32,32,98,50,87,101,108,100,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,109,95,99,111,117,110,116,0,0,0,32,32,98,50,82,111,112,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,97,110,103,108,101,41,0,0,0,0,109,95,101,110,116,114,121,67,111,117,110,116,32,60,32,98,50,95,109,97,120,83,116,97,99,107,69,110,116,114,105,101,115,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,46,99,112,112,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,98,50,95,98,108,111,99,107,83,105,122,101,115,0,0,0,0,0,48,46,48,102,32,60,61,32,108,111,119,101,114,32,38,38,32,108,111,119,101,114,32,60,61,32,105,110,112,117,116,46,109,97,120,70,114,97,99,116,105,111,110,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,80,117,108,108,101,121,74,111,105,110,116,46,99,112,112,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,84,105,109,101,79,102,73,109,112,97,99,116,46,99,112,112,0,99,111,117,110,116,32,62,61,32,50,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,32,32,106,100,46,99,111,108,108,105,100,101,67,111,110,110,101,99,116,101,100,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,0,32,32,98,50,80,117,108,108,101,121,74,111,105,110,116,68,101,102,32,106,100,59,10,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,46,99,112,112,0,98,50,73,115,86,97,108,105,100,40,100,101,102,45,62,102,114,101,113,117,101,110,99,121,72,122,41,32,38,38,32,100,101,102,45,62,102,114,101,113,117,101,110,99,121,72,122,32,62,61,32,48,46,48,102,0,47,47,32,68,117,109,112,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,102,111,114,32,116,104,105,115,32,106,111,105,110,116,32,116,121,112,101,46,10,0,0,98,50,73,115,86,97,108,105,100,40,114,97,116,105,111,41,0,0,0,0,0,0,0,0,32,32,32,32,98,111,100,105,101,115,91,37,100,93,45,62,67,114,101,97,116,101,70,105,120,116,117,114,101,40,38,102,100,41,59,10,0,0,0,0,32,32,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,77,111,117,115,101,74,111,105,110,116,46,99,112,112,0,0,0,0,0,112,111,105,110,116,67,111,117,110,116,32,61,61,32,49,32,124,124,32,112,111,105,110,116,67,111,117,110,116,32,61,61,32,50,0,0,0,0,0,0,115,95,105,110,105,116,105,97,108,105,122,101,100,32,61,61,32,116,114,117,101,0,0,0,32,32,32,32,102,100,46,115,104,97,112,101,32,61,32,38,115,104,97,112,101,59,10,0,109,95,106,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,0,0,0,0,0,0,48,32,60,32,109,95,110,111,100,101,67,111,117,110,116,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,74,111,105,110,116,46,99,112,112,0,0,32,32,32,32,98,50,70,105,120,116,117,114,101,68,101,102,32,102,100,59,10,0,0,0,10,0,0,0,0,0,0,0,32,32,125,10,0,0,0,0,110,111,100,101,45,62,73,115,76,101,97,102,40,41,32,61,61,32,102,97,108,115,101,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,71,101,97,114,74,111,105,110,116,46,99,112,112,0,0,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,78,101,120,116,86,101,114,116,101,120,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,32,32,123,10,0,0,0,0,109,95,110,111,100,101,67,111,117,110,116,32,43,32,102,114,101,101,67,111,117,110,116,32,61,61,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,105,115,116,97,110,99,101,46,104,0,0,0,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,80,114,101,118,86,101,114,116,101,120,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,46,99,112,112,0,0,71,101,116,72,101,105,103,104,116,40,41,32,61,61,32,67,111,109,112,117,116,101,72,101,105,103,104,116,40,41,0,0,48,32,60,61,32,102,114,101,101,73,110,100,101,120,32,38,38,32,102,114,101,101,73,110,100,101,120,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,0,109,95,98,111,100,121,67,111,117,110,116,32,60,32,109,95,98,111,100,121,67,97,112,97,99,105,116,121,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,110,101,120,116,86,101,114,116,101,120,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,32,32,98,111,100,105,101,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,66,111,100,121,40,38,98,100,41,59,10,0,0,0,0,0,0,0,32,32,98,50,68,105,115,116,97,110,99,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,0,0,0,0,98,100,45,62,108,105,110,101,97,114,86,101,108,111,99,105,116,121,46,73,115,86,97,108,105,100,40,41,0,0,0,0,109,95,101,110,116,114,121,67,111,117,110,116,32,61,61,32,48,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,0,0,0,109,95,99,111,110,116,97,99,116,67,111,117,110,116,32,60,32,109,95,99,111,110,116,97,99,116,67,97,112,97,99,105,116,121,0,0,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,112,114,101,118,86,101,114,116,101,120,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,32,32,98,100,46,103,114,97,118,105,116,121,83,99,97,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,97,97,98,98,46,117,112,112,101,114,66,111,117,110,100,32,61,61,32,110,111,100,101,45,62,97,97,98,98,46,117,112,112,101,114,66,111,117,110,100,0,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,0,0,109,95,106,111,105,110,116,67,111,117,110,116,32,60,32,109,95,106,111,105,110,116,67,97,112,97,99,105,116,121,0,0,32,32,32,32,115,104,97,112,101,46,67,114,101,97,116,101,67,104,97,105,110,40,118,115,44,32,37,100,41,59,10,0,32,32,98,100,46,97,99,116,105,118,101,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,0,0,0,48,32,60,32,115,105,122,101,0,0,0,0,0,0,0,0,97,97,98,98,46,108,111,119,101,114,66,111,117,110,100,32,61,61,32,110,111,100,101,45,62,97,97,98,98,46,108,111,119,101,114,66,111,117,110,100,0,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,0,0,0,0,101,100,103,101,46,76,101,110,103,116,104,83,113,117,97,114,101,100,40,41,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,32,42,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,73,115,108,97,110,100,46,104,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,32,32,32,32,98,50,67,104,97,105,110,83,104,97,112,101,32,115,104,97,112,101,59,10,0,0,0,0,0,0,0,0,32,32,98,100,46,98,117,108,108,101,116,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,0,0,0,110,111,100,101,45,62,104,101,105,103,104,116,32,61,61,32,104,101,105,103,104,116,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,109,109,111,110,47,98,50,77,97,116,104,46,104,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,66,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,32,32,115,104,97,112,101,46,83,101,116,40,118,115,44,32,37,100,41,59,10,0,32,32,98,100,46,102,105,120,101,100,82,111,116,97,116,105,111,110,32,61,32,98,111,111,108,40,37,100,41,59,10,0,109,95,110,111,100,101,115,91,99,104,105,108,100,50,93,46,112,97,114,101,110,116,32,61,61,32,105,110,100,101,120,0,32,32,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,0,0,0,0,100,101,102,45,62,114,97,116,105,111,32,33,61,32,48,46,48,102,0,0,0,0,0,0,32,32,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,0,0,0,98,50,73,115,86,97,108,105,100,40,100,101,102,45,62,109,97,120,70,111,114,99,101,41,32,38,38,32,100,101,102,45,62,109,97,120,70,111,114,99,101,32,62,61,32,48,46,48,102,0,0,0,0,0,0,0,100,101,102,45,62,98,111,100,121,65,32,33,61,32,100,101,102,45,62,98,111,100,121,66,0,0,0,0,0,0,0,0,32,32,32,32,118,115,91,37,100,93,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,0,32,32,98,100,46,97,119,97,107,101,32,61,32,98,111,111,108,40,37,100,41,59,10,0,109,95,116,121,112,101,66,32,61,61,32,101,95,114,101,118,111,108,117,116,101,74,111,105,110,116,32,124,124,32,109,95,116,121,112,101,66,32,61,61,32,101,95,112,114,105,115,109,97,116,105,99,74,111,105,110,116,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,46,99,112,112,0,0,0,0,0,0,0,0,109,95,110,111,100,101,115,91,99,104,105,108,100,49,93,46,112,97,114,101,110,116,32,61,61,32,105,110,100,101,120,0,98,50,73,115,86,97,108,105,100,40,116,111,114,113,117,101,41,32,38,38,32,116,111,114,113,117,101,32,62,61,32,48,46,48,102,0,0,0,0,0,109,95,102,105,120,116,117,114,101,66,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,112,111,108,121,103,111,110,0,0,0,0,0,109,95,102,105,120,116,117,114,101,66,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,99,105,114,99,108,101,0,0,0,0,0,0,109,97,110,105,102,111,108,100,45,62,112,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,0,0,0,0,0,0,48,32,60,61,32,116,121,112,101,50,32,38,38,32,116,121,112,101,50,32,60,32,98,50,83,104,97,112,101,58,58,101,95,116,121,112,101,67,111,117,110,116,0,0,0,0,0,0,32,32,32,32,98,50,86,101,99,50,32,118,115,91,37,100,93,59,10,0,0,0,0,0,32,32,98,100,46,97,108,108,111,119,83,108,101,101,112,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,48,32,60,61,32,99,104,105,108,100,50,32,38,38,32,99,104,105,108,100,50,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,32,32,98,100,46,97,110,103,117,108,97,114,68,97,109,112,105,110,103,32,61,32,37,46,49,53,108,101,102,59,10,0,109,95,98,111,100,121,67,111,117,110,116,32,62,32,48,0,116,111,105,73,110,100,101,120,66,32,60,32,109,95,98,111,100,121,67,111,117,110,116,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,0,0,48,32,60,61,32,110,111,100,101,73,100,32,38,38,32,110,111,100,101,73,100,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,0,0,0,0,32,32,32,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,115,104,97,112,101,59,10,0,0,0,0,0,0,48,32,60,61,32,112,114,111,120,121,73,100,32,38,38,32,112,114,111,120,121,73,100,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,0,0,0,48,32,60,61,32,99,104,105,108,100,49,32,38,38,32,99,104,105,108,100,49,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,32,32,98,100,46,108,105,110,101,97,114,68,97,109,112,105,110,103,32,61,32,37,46,49,53,108,101,102,59,10,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,0,0,0,0,114,46,76,101,110,103,116,104,83,113,117,97,114,101,100,40,41,32,62,32,48,46,48,102,0,0,0,0,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,86,101,114,116,101,120,51,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,110,111,100,101,45,62,104,101].concat([105,103,104,116,32,61,61,32,48,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,67,111,108,108,105,100,101,80,111,108,121,103,111,110,46,99,112,112,0,0,0,0,0,0,0,32,32,98,100,46,97,110,103,117,108,97,114,86,101,108,111,99,105,116,121,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,121,110,97,109,105,99,84,114,101,101,46,104,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,86,101,114,116,101,120,48,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,0,99,104,105,108,100,50,32,61,61,32,40,45,49,41,0,0,32,32,98,100,46,108,105,110,101,97,114,86,101,108,111,99,105,116,121,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,98,111,100,105,101,115,32,61,32,78,85,76,76,59,10,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,51,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,32,32,98,100,46,97,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,98,100,45,62,112,111,115,105,116,105,111,110,46,73,115,86,97,108,105,100,40,41,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,87,111,114,108,100,46,99,112,112,0,109,95,105,110,100,101,120,32,61,61,32,48,0,0,0,0,109,95,110,111,100,101,115,91,105,110,100,101,120,93,46,112,97,114,101,110,116,32,61,61,32,40,45,49,41,0,0,0,106,111,105,110,116,115,32,61,32,78,85,76,76,59,10,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,50,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,73,115,108,97,110,100,46,99,112,112,0,0,0,0,0,0,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,99,104,97,105,110,45,62,109,95,99,111,117,110,116,0,0,0,0,32,32,98,100,46,112,111,115,105,116,105,111,110,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,98,50,70,114,101,101,40,98,111,100,105,101,115,41,59,10,0,0,0,0,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,49,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,106,32,60,32,98,50,95,98,108,111,99,107,83,105,122,101,115,0,0,0,0,0,0,0,109,95,110,111,100,101,115,91,66,45,62,112,97,114,101,110,116,93,46,99,104,105,108,100,50,32,61,61,32,105,65,0,32,32,98,100,46,116,121,112,101,32,61,32,98,50,66,111,100,121,84,121,112,101,40,37,100,41,59,10,0,0,0,0,32,32,106,100,46,109,97,120,77,111,116,111,114,70,111,114,99,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,51,32,60,61,32,99,111,117,110,116,32,38,38,32,99,111,117,110,116,32,60,61,32,56,0,0,0,0,0,0,0,0,98,50,70,114,101,101,40,106,111,105,110,116,115,41,59,10,0,0,0,0,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,48,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,0,48,32,60,61,32,105,69,32,38,38,32,105,69,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,32,32,98,50,66,111,100,121,68,101,102,32,98,100,59,10,0,0,0,0,0,0,0,0,109,95,118,101,114,116,105,99,101,115,32,61,61,32,95,95,110,117,108,108,32,38,38,32,109,95,99,111,117,110,116,32,61,61,32,48,0,0,0,0,48,32,60,61,32,105,68,32,38,38,32,105,68,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,125,10,0,0,0,0,0,0,32,32,106,100,46,98,111,100,121,65,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,0,0,0,0,32,32,32,32,98,50,69,100,103,101,83,104,97,112,101,32,115,104,97,112,101,59,10,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,121,110,97,109,105,99,84,114,101,101,46,99,112,112,0,0,108,111,119,101,114,32,60,61,32,117,112,112,101,114,0,0,116,97,114,103,101,116,32,62,32,116,111,108,101,114,97,110,99,101,0,0,0,0,0,0,114,97,116,105,111,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,32,32,106,100,46,114,97,116,105,111,32,61,32,37,46,49,53,108,101,102,59,10,0,0,100,101,102,45,62,116,97,114,103,101,116,46,73,115,86,97,108,105,100,40,41,0,0,0,109,95,110,111,100,101,115,91,67,45,62,112,97,114,101,110,116,93,46,99,104,105,108,100,50,32,61,61,32,105,65,0,123,10,0,0,0,0,0,0,102,97,108,115,101,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,112,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,109,95,116,121,112,101,65,32,61,61,32,101,95,114,101,118,111,108,117,116,101,74,111,105,110,116,32,124,124,32,109,95,116,121,112,101,65,32,61,61,32,101,95,112,114,105,115,109,97,116,105,99,74,111,105,110,116,0,0,0,0,0,0,0,48,32,60,61,32,101,100,103,101,49,32,38,38,32,101,100,103,101,49,32,60,32,112,111,108,121,49,45,62,109,95,118,101,114,116,101,120,67,111,117,110,116,0,0,0,0,0,0,98,50,73,115,86,97,108,105,100,40,102,111,114,99,101,41,32,38,38,32,102,111,114,99,101,32,62,61,32,48,46,48,102,0,0,0,0,0,0,0,109,95,73,32,62,32,48,46,48,102,0,0,0,0,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,112,111,108,121,103,111,110,0,0,0,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,101,100,103,101,0,0,0,0,0,0,0,0,32,32,106,111,105,110,116,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,74,111,105,110,116,40,38,106,100,41,59,10,0,0,0,0,0,0,32,32,106,100,46,108,101,110,103,116,104,66,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,0,32,32,106,100,46,117,112,112,101,114,84,114,97,110,115,108,97,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,112,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,98,50,74,111,105,110,116,42,42,32,106,111,105,110,116,115,32,61,32,40,98,50,74,111,105,110,116,42,42,41,98,50,65,108,108,111,99,40,37,100,32,42,32,115,105,122,101,111,102,40,98,50,74,111,105,110,116,42,41,41,59,10,0,0,48,32,60,61,32,116,121,112,101,49,32,38,38,32,116,121,112,101,49,32,60,32,98,50,83,104,97,112,101,58,58,101,95,116,121,112,101,67,111,117,110,116,0,0,0,0,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,99,105,114,99,108,101,0,0,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,114,97,100,105,117,115,32,61,32,37,46,49,53,108,101,102,59,10,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,99,104,97,105,110,0,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,70,105,120,116,117,114,101,46,99,112,112,0,0,0,0,0,0,0,48,32,60,61,32,105,71,32,38,38,32,105,71,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,109,95,116,121,112,101,32,61,61,32,98,50,95,100,121,110,97,109,105,99,66,111,100,121,0,0,0,0,0,0,0,0,73,115,76,111,99,107,101,100,40,41,32,61,61,32,102,97,108,115,101,0,0,0,0,0,116,111,105,73,110,100,101,120,65,32,60,32,109,95,98,111,100,121,67,111,117,110,116,0,109,95,110,111,100,101,67,111,117,110,116,32,61,61,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,32,32,106,100,46,100,97,109,112,105,110,103,82,97,116,105,111,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,32,32,106,100,46,117,112,112,101,114,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,32,32,106,100,46,108,101,110,103,116,104,65,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,0,32,32,106,100,46,108,111,119,101,114,84,114,97,110,115,108,97,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,0,109,95,112,114,111,120,121,67,111,117,110,116,32,61,61,32,48,0,0,0,0,0,0,0,98,50,66,111,100,121,42,42,32,98,111,100,105,101,115,32,61,32,40,98,50,66,111,100,121,42,42,41,98,50,65,108,108,111,99,40,37,100,32,42,32,115,105,122,101,111,102,40,98,50,66,111,100,121,42,41,41,59,10,0,0,0,0,0,32,32,32,32,98,50,67,105,114,99,108,101,83,104,97,112,101,32,115,104,97,112,101,59,10,0,0,0,0,0,0,0,48,32,60,61,32,105,70,32,38,38,32,105,70,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,102,111,117,110,100,0,0,0,32,32,106,100,46,102,114,101,113,117,101,110,99,121,72,122,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,32,32,106,100,46,108,111,119,101,114,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,32,32,106,100,46,109,97,120,84,111,114,113,117,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,0,0,109,95,119,111,114,108,100,45,62,83,101,116,71,114,97,118,105,116,121,40,103,41,59,10,0,0,0,0,0,0,0,0,32,32,32,32,102,100,46,102,105,108,116,101,114,46,103,114,111,117,112,73,110,100,101,120,32,61,32,105,110,116,49,54,40,37,100,41,59,10,0,0,48,32,60,61,32,105,67,32,38,38,32,105,67,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,100,101,110,32,62,32,48,46,48,102,0,0,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,67,111,108,108,105,100,101,69,100,103,101,46,99,112,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,102,108,111,97,116,51,50,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,77,101,116,114,105,99,40,41,32,99,111,110,115,116,0,0,0,0,118,111,105,100,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,87,105,116,110,101,115,115,80,111,105,110,116,115,40,98,50,86,101,99,50,32,42,44,32,98,50,86,101,99,50,32,42,41,32,99,111,110,115,116,0,0,0,0,0,0,98,50,86,101,99,50,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,67,108,111,115,101,115,116,80,111,105,110,116,40,41,32,99,111,110,115,116,0,0,0,0,0,0,0,102,108,111,97,116,51,50,32,98,50,83,101,112,97,114,97,116,105,111,110,70,117,110,99,116,105,111,110,58,58,69,118,97,108,117,97,116,101,40,105,110,116,51,50,44,32,105,110,116,51,50,44,32,102,108,111,97,116,51,50,41,32,99,111,110,115,116,0,0,0,0,0,102,108,111,97,116,51,50,32,98,50,83,101,112,97,114,97,116,105,111,110,70,117,110,99,116,105,111,110,58,58,70,105,110,100,77,105,110,83,101,112,97,114,97,116,105,111,110,40,105,110,116,51,50,32,42,44,32,105,110,116,51,50,32,42,44,32,102,108,111,97,116,51,50,41,32,99,111,110,115,116,0,0,0,0,0,0,0,0,99,111,110,115,116,32,98,50,86,101,99,50,32,38,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,58,58,71,101,116,86,101,114,116,101,120,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,118,105,114,116,117,97,108,32,98,111,111,108,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,58,58,82,97,121,67,97,115,116,40,98,50,82,97,121,67,97,115,116,79,117,116,112,117,116,32,42,44,32,99,111,110,115,116,32,98,50,82,97,121,67,97,115,116,73,110,112,117,116,32,38,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,0,0,0,118,105,114,116,117,97,108,32,118,111,105,100,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,58,58,67,111,109,112,117,116,101,77,97,115,115,40,98,50,77,97,115,115,68,97,116,97,32,42,44,32,102,108,111,97,116,51,50,41,32,99,111,110,115,116,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,86,97,108,105,100,97,116,101,40,41,32,99,111,110,115,116,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,82,97,121,67,97,115,116,40,84,32,42,44,32,99,111,110,115,116,32,98,50,82,97,121,67,97,115,116,73,110,112,117,116,32,38,41,32,99,111,110,115,116,32,91,84,32,61,32,98,50,87,111,114,108,100,82,97,121,67,97,115,116,87,114,97,112,112,101,114,93,0,0,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,86,97,108,105,100,97,116,101,83,116,114,117,99,116,117,114,101,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,86,97,108,105,100,97,116,101,77,101,116,114,105,99,115,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,0,0,0,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,71,101,116,77,97,120,66,97,108,97,110,99,101,40,41,32,99,111,110,115,116,0,0,0,0,0,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,67,111,109,112,117,116,101,72,101,105,103,104,116,40,105,110,116,51,50,41,32,99,111,110,115,116,0,118,111,105,100,32,42,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,71,101,116,85,115,101,114,68,97,116,97,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,99,111,110,115,116,32,98,50,65,65,66,66,32,38,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,71,101,116,70,97,116,65,65,66,66,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,118,105,114,116,117,97,108,32,98,111,111,108,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,82,97,121,67,97,115,116,40,98,50,82,97,121,67,97,115,116,79,117,116,112,117,116,32,42,44,32,99,111,110,115,116,32,98,50,82,97,121,67,97,115,116,73,110,112,117,116,32,38,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,71,101,116,67,104,105,108,100,69,100,103,101,40,98,50,69,100,103,101,83,104,97,112,101,32,42,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,0,118,105,114,116,117,97,108,32,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,67,111,109,112,117,116,101,65,65,66,66,40,98,50,65,65,66,66,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,0,0,118,111,105,100,32,98,50,83,105,109,112,108,101,120,58,58,82,101,97,100,67,97,99,104,101,40,99,111,110,115,116,32,98,50,83,105,109,112,108,101,120,67,97,99,104,101,32,42,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,118,111,105,100,32,98,50,70,105,120,116,117,114,101,58,58,68,101,115,116,114,111,121,40,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,0,0,0,0,118,111,105,100,32,98,50,70,105,120,116,117,114,101,58,58,67,114,101,97,116,101,80,114,111,120,105,101,115,40,98,50,66,114,111,97,100,80,104,97,115,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,0,0,0,115,116,97,116,105,99,32,118,111,105,100,32,98,50,67,111,110,116,97,99,116,58,58,68,101,115,116,114,111,121,40,98,50,67,111,110,116,97,99,116,32,42,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,115,116,97,116,105,99,32,98,50,67,111,110,116,97,99,116,32,42,98,50,67,111,110,116,97,99,116,58,58,67,114,101,97,116,101,40,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,83,111,108,118,101,84,79,73,40,99,111,110,115,116,32,98,50,84,105,109,101,83,116,101,112,32,38,44,32,105,110,116,51,50,44,32,105,110,116,51,50,41,0,0,0,0,0,0,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,65,100,100,40,98,50,67,111,110,116,97,99,116,32,42,41,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,65,100,100,40,98,50,74,111,105,110,116,32,42,41,0,0,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,65,100,100,40,98,50,66,111,100,121,32,42,41,0,0,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,68,114,97,119,83,104,97,112,101,40,98,50,70,105,120,116,117,114,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,67,111,108,111,114,32,38,41,0,0,0,0,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,83,111,108,118,101,84,79,73,40,99,111,110,115,116,32,98,50,84,105,109,101,83,116,101,112,32,38,41,0,0,0,0,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,83,111,108,118,101,40,99,111,110,115,116,32,98,50,84,105,109,101,83,116,101,112,32,38,41,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,68,101,115,116,114,111,121,74,111,105,110,116,40,98,50,74,111,105,110,116,32,42,41,0,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,68,101,115,116,114,111,121,66,111,100,121,40,98,50,66,111,100,121,32,42,41,0,0,0,0,0,98,50,74,111,105,110,116,32,42,98,50,87,111,114,108,100,58,58,67,114,101,97,116,101,74,111,105,110,116,40,99,111,110,115,116,32,98,50,74,111,105,110,116,68,101,102,32,42,41,0,0,0,0,0,0,0,98,50,66,111,100,121,32,42,98,50,87,111,114,108,100,58,58,67,114,101,97,116,101,66,111,100,121,40,99,111,110,115,116,32,98,50,66,111,100,121,68,101,102,32,42,41,0,0,118,111,105,100,32,98,50,83,119,101,101,112,58,58,65,100,118,97,110,99,101,40,102,108,111,97,116,51,50,41,0,0,98,50,74,111,105,110,116,58,58,98,50,74,111,105,110,116,40,99,111,110,115,116,32,98,50,74,111,105,110,116,68,101,102,32,42,41,0,0,0,0,115,116,97,116,105,99,32,118,111,105,100,32,98,50,74,111,105,110,116,58,58,68,101,115,116,114,111,121,40,98,50,74,111,105,110,116,32,42,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,0,0,0,0,115,116,97,116,105,99,32,98,50,74,111,105,110,116,32,42,98,50,74,111,105,110,116,58,58,67,114,101,97,116,101,40,99,111,110,115,116,32,98,50,74,111,105,110,116,68,101,102,32,42,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,98,50,66,111,100,121,58,58,98,50,66,111,100,121,40,99,111,110,115,116,32,98,50,66,111,100,121,68,101,102,32,42,44,32,98,50,87,111,114,108,100,32,42,41,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,65,99,116,105,118,101,40,98,111,111,108,41,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,84,121,112,101,40,98,50,66,111,100,121,84,121,112,101,41,0,0,0,0,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,68,101,115,116,114,111,121,70,105,120,116,117,114,101,40,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,82,101,115,101,116,77,97,115,115,68,97,116,97,40,41,0,0,0,0,98,50,70,105,120,116,117,114,101,32,42,98,50,66,111,100,121,58,58,67,114,101,97,116,101,70,105,120,116,117,114,101,40,99,111,110,115,116,32,98,50,70,105,120,116,117,114,101,68,101,102,32,42,41,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,84,114,97,110,115,102,111,114,109,40,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,102,108,111,97,116,51,50,41,0,0,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,77,97,115,115,68,97,116,97,40,99,111,110,115,116,32,98,50,77,97,115,115,68,97,116,97,32,42,41,0,0,0,0,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,118,111,105,100,32,98,50,80,111,115,105,116,105,111,110,83,111,108,118,101,114,77,97,110,105,102,111,108,100,58,58,73,110,105,116,105,97,108,105,122,101,40,98,50,67,111,110,116,97,99,116,80,111,115,105,116,105,111,110,67,111,110,115,116,114,97,105,110,116,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,0,0,0,0,0,0,0,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,58,58,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,41,0,0,0,0,0,0,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,58,58,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,0,0,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,41,0,0,0,0,0,0,0,0,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,0,0,0,0,102,108,111,97,116,51,50,32,98,50,83,101,112,97,114,97,116,105,111,110,70,117,110,99,116,105,111,110,58,58,73,110,105,116,105,97,108,105,122,101,40,99,111,110,115,116,32,98,50,83,105,109,112,108,101,120,67,97,99,104,101,32,42,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,83,119,101,101,112,32,38,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,83,119,101,101,112,32,38,44,32,102,108,111,97,116,51,50,41,0,0,0,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,58,58,126,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,40,41,0,0,0,118,111,105,100,32,42,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,58,58,65,108,108,111,99,97,116,101,40,105,110,116,51,50,41,0,118,111,105,100,32,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,58,58,70,114,101,101,40,118,111,105,100,32,42,41,0,0,0,0,0,118,111,105,100,32,98,50,80,117,108,108,101,121,74,111,105,110,116,68,101,102,58,58,73,110,105,116,105,97,108,105,122,101,40,98,50,66,111,100,121,32,42,44,32,98,50,66,111,100,121,32,42,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,102,108,111,97,116,51,50,41,0,0,118,111,105,100,32,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,58,58,83,101,116,76,105,109,105,116,115,40,102,108,111,97,116,51,50,44,32,102,108,111,97,116,51,50,41,0,0,0,0,0,0,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,58,58,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,58,58,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,40,41,0,0,0,0,118,111,105,100,32,42,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,58,58,65,108,108,111,99,97,116,101,40,105,110,116,51,50,41,0,118,111,105,100,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,58,58,70,114,101,101,40,118,111,105,100,32,42,44,32,105,110,116,51,50,41,0,0,0,0,0,0,118,111,105,100,32,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,58,58,83,101,116,76,105,109,105,116,115,40,102,108,111,97,116,51,50,44,32,102,108,111,97,116,51,50,41,0,0,0,0,0,0,0,118,111,105,100,32,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,58,58,83,101,116,77,97,120,84,111,114,113,117,101,40,102,108,111,97,116,51,50,41,0,0,0,0,0,118,111,105,100,32,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,58,58,83,101,116,77,97,120,70,111,114,99,101,40,102,108,111,97,116,51,50,41,0,0,0,0,0,0,118,111,105,100,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,58,58,83,101,116,40,99,111,110,115,116,32,98,50,83,104,97,112,101,32,42,44,32,105,110,116,51,50,41,0,0,0,0,0,0,0,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,58,58,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,40,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,68,101,102,32,42,41,0,0,118,111,105,100,32,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,58,58,73,110,105,116,105,97,108,105,122,101,86,101,108,111,99,105,116,121,67,111,110,115,116,114,97,105,110,116,115,40,41,0,0,0,118,111,105,100,32,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,58,58,83,111,108,118,101,86,101,108,111,99,105,116,121,67,111,110,115,116,114,97,105,110,116,115,40,41,0,0,0,0,0,0,0,0,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,0,0,118,111,105,100,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,58,58,83,101,116,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,98,50,80,117,108,108,101,121,74,111,105,110,116,58,58,98,50,80,117,108,108,101,121,74,111,105,110,116,40,99,111,110,115,116,32,98,50,80,117,108,108,101,121,74,111,105,110,116,68,101,102,32,42,41,0,0,98,111,111,108,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,77,111,118,101,80,114,111,120,121,40,105,110,116,51,50,44,32,99,111,110,115,116,32,98,50,65,65,66,66,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,41,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,70,114,101,101,78,111,100,101,40,105,110,116,51,50,41,0,0,0,0,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,66,97,108,97,110,99,101,40,105,110,116,51,50,41,0,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,68,101,115,116,114,111,121,80,114,111,120,121,40,105,110,116,51,50,41,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,65,108,108,111,99,97,116,101,78,111,100,101,40,41,0,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,73,110,115,101,114,116,76,101,97,102,40,105,110,116,51,50,41,0,0,0,98,50,77,111,117,115,101,74,111,105,110,116,58,58,98,50,77,111,117,115,101,74,111,105,110,116,40,99,111,110,115,116,32,98,50,77,111,117,115,101,74,111,105,110,116,68,101,102,32,42,41,0,0,0,0,0,118,105,114,116,117,97,108,32,118,111,105,100,32,98,50,77,111,117,115,101,74,111,105,110,116,58,58,73,110,105,116,86,101,108,111,99,105,116,121,67,111,110,115,116,114,97,105,110,116,115,40,99,111,110,115,116,32,98,50,83,111,108,118,101,114,68,97,116,97,32,38,41,0,0,0,0,0,0,0,0,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,67,114,101,97,116,101,67,104,97,105,110,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,0,0,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,67,114,101,97,116,101,76,111,111,112,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,0,0,0,98,50,71,101,97,114,74,111,105,110,116,58,58,98,50,71,101,97,114,74,111,105,110,116,40,99,111,110,115,116,32,98,50,71,101,97,114,74,111,105,110,116,68,101,102,32,42,41,0,0,0,0,0,0,0,0,118,111,105,100,32,98,50,71,101,97,114,74,111,105,110,116,58,58,83,101,116,82,97,116,105,111,40,102,108,111,97,116,51,50,41,0,0,0,0,0,118,111,105,100,32,98,50,70,105,110,100,73,110,99,105,100,101,110,116,69,100,103,101,40,98,50,67,108,105,112,86,101,114,116,101,120,32,42,44,32,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,44,32,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,0,0,0,0,0,102,108,111,97,116,51,50,32,98,50,69,100,103,101,83,101,112,97,114,97,116,105,111,110,40,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,44,32,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,0,0,0,0,98,50,86,101,99,50,32,67,111,109,112,117,116,101,67,101,110,116,114,111,105,100,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,0,0,118,111,105,100,32,98,50,67,111,108,108,105,100,101,69,100,103,101,65,110,100,67,105,114,99,108,101,40,98,50,77,97,110,105,102,111,108,100,32,42,44,32,99,111,110,115,116,32,98,50,69,100,103,101,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,67,105,114,99,108,101,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,118,111,105,100,32,98,50,84,105,109,101,79,102,73,109,112,97,99,116,40,98,50,84,79,73,79,117,116,112,117,116,32,42,44,32,99,111,110,115,116,32,98,50,84,79,73,73,110,112,117,116,32,42,41,0,0,118,111,105,100,32,98,50,68,105,115,116,97,110,99,101,40,98,50,68,105,115,116,97,110,99,101,79,117,116,112,117,116,32,42,44,32,98,50,83,105,109,112,108,101,120,67,97,99,104,101,32,42,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,73,110,112,117,116,32,42,41,0,0,0,0,0,0,112,83,0,0,78,0,0,0,4,1,0,0,150,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,176,83,0,0,42,0,0,0,62,0,0,0,184,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,83,0,0,42,0,0,0,42,0,0,0,42,0,0,0,42,0,0,0,20,1,0,0,210,0,0,0,48,0,0,0,42,0,0,0,42,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,83,0,0,168,0,0,0,254,0,0,0,56,0,0,0,82,0,0,0,44,0,0,0,42,0,0,0,86,0,0,0,148,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,83,0,0,58,0,0,0,74,0,0,0,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,83,0,0,70,0,0,0,40,1,0,0,134,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,83,0,0,62,0,0,0,190,0,0,0,174,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,84,0,0,54,0,0,0,236,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,84,0,0,80,0,0,0,70,1,0,0,228,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,84,0,0,90,1,0,0,66,0,0,0,58,1,0,0,150,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,84,0,0,52,1,0,0,102,0,0,0,44,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,84,0,0,182,0,0,0,152,0,0,0,144,1,0,0,38,1,0,0,48,0,0,0,70,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,84,0,0,82,0,0,0,222,0,0,0,68,0,0,0,78,0,0,0,76,0,0,0,136,0,0,0,166,0,0,0,48,0,0,0,4,1,0,0,88,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,84,0,0,90,0,0,0,46,1,0,0,94,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,84,0,0,112,1,0,0,0,1,0,0,54,0,0,0,66,0,0,0,68,0,0,0,54,0,0,0,88,1,0,0,114,1,0,0,164,1,0,0,168,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,84,0,0,120,0,0,0,230,0,0,0,174,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,84,0,0,106,1,0,0,216,0,0,0,72,0,0,0,84,0,0,0,104,0,0,0,44,1,0,0,160,0,0,0,130,0,0,0,108,1,0,0,152,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,84,0,0,206,1,0,0,120,1,0,0,78,0,0,0,88,0,0,0,50,1,0,0,82,1,0,0,58,0,0,0,84,0,0,0,198,1,0,0,190,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,84,0,0,110,0,0,0,250,0,0,0,58,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,84,0,0,88,0,0,0,234,0,0,0,252,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,84,0,0,180,0,0,0,220,0,0,0,104,0,0,0,100,1,0,0,64,0,0,0,42,0,0,0,84,0,0,0,74,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,184,84,0,0,192,0,0,0,144,0,0,0,80,0,0,0,80,0,0,0,98,0,0,0,96,0,0,0,6,1,0,0,80,0,0,0,180,1,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,84,0,0,140,0,0,0,114,0,0,0,82,0,0,0,70,2,0,0,54,0,0,0,66,0,0,0,42,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,84,0,0,212,1,0,0,156,0,0,0,52,0,0,0,48,0,0,0,64,1,0,0,42,0,0,0,194,0,0,0,200,0,0,0,132,1,0,0,148,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,84,0,0,126,0,0,0,80,1,0,0,56,0,0,0,50,0,0,0,36,1,0,0,76,1,0,0,92,1,0,0,8,1,0,0,124,1,0,0,96,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,84,0,0,108,0,0,0,8,1,0,0,162,0,0,0,76,1,0,0,68,0,0,0,50,0,0,0,52,0,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,85,0,0,224,0,0,0,184,1,0,0,76,0,0,0,58,0,0,0,48,1,0,0,128,0,0,0,158,0,0,0,184,0,0,0,66,1,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,85,0,0,170,0,0,0,88,0,0,0,60,0,0,0,62,0,0,0,84,1,0,0,30,1,0,0,238,0,0,0,114,0,0,0,162,0,0,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,85,0,0,194,0,0,0,12,1,0,0,46,0,0,0,52,0,0,0,208,0,0,0,56,1,0,0,64,0,0,0,54,1,0,0])
.concat([26,1,0,0,140,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,85,0,0,80,0,0,0,56,0,0,0,142,0,0,0,68,2,0,0,66,0,0,0,68,0,0,0,44,0,0,0,82,0,0,0,0,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,57,98,50,67,111,110,116,97,99,116,0,0,0,0,0,0,55,98,50,83,104,97,112,101,0,0,0,0,0,0,0,0,55,98,50,74,111,105,110,116,0,0,0,0,0,0,0,0,54,98,50,68,114,97,119,0,50,53,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,0,0,50,52,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,0,0,0,0,50,51,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,0,0,0,0,0,50,51,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,0,0,0,0,50,50,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,0,0,0,0,0,50,49,98,50,68,101,115,116,114,117,99,116,105,111,110,76,105,115,116,101,110,101,114,0,49,55,98,50,82,97,121,67,97,115,116,67,97,108,108,98,97,99,107,0,0,0,0,0,49,55,98,50,67,111,110,116,97,99,116,76,105,115,116,101,110,101,114,0,0,0,0,0,49,54,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,0,0,0,0,0,0,49,54,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,0,0,0,0,49,53,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,0,0,0,0,0,0,0,49,53,98,50,81,117,101,114,121,67,97,108,108,98,97,99,107,0,0,0,0,0,0,0,49,53,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,0,0,0,0,0,0,0,49,53,98,50,68,105,115,116,97,110,99,101,74,111,105,110,116,0,0,0,0,0,0,0,49,53,98,50,67,111,110,116,97,99,116,70,105,108,116,101,114,0,0,0,0,0,0,0,49,53,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,0,0,0,0,49,52,98,50,80,111,108,121,103,111,110,83,104,97,112,101,0,0,0,0,0,0,0,0,49,51,98,50,80,117,108,108,101,121,74,111,105,110,116,0,49,51,98,50,67,105,114,99,108,101,83,104,97,112,101,0,49,50,98,50,87,104,101,101,108,74,111,105,110,116,0,0,49,50,98,50,77,111,117,115,101,74,111,105,110,116,0,0,49,50,98,50,67,104,97,105,110,83,104,97,112,101,0,0,49,49,98,50,87,101,108,100,74,111,105,110,116,0,0,0,49,49,98,50,82,111,112,101,74,111,105,110,116,0,0,0,49,49,98,50,71,101,97,114,74,111,105,110,116,0,0,0,49,49,98,50,69,100,103,101,83,104,97,112,101,0,0,0,0,0,0,0,72,80,0,0,0,0,0,0,88,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,80,0,0,144,83,0,0,0,0,0,0,0,0,0,0,144,80,0,0,160,83,0,0,0,0,0,0,0,0,0,0,184,80,0,0,104,83,0,0,0,0,0,0,0,0,0,0,224,80,0,0,0,0,0,0,240,80,0,0,0,0,0,0,0,81,0,0,0,0,0,0,16,81,0,0,0,0,0,0,24,81,0,0,176,83,0,0,0,0,0,0,0,0,0,0,56,81,0,0,176,83,0,0,0,0,0,0,0,0,0,0,88,81,0,0,176,83,0,0,0,0,0,0,0,0,0,0,120,81,0,0,176,83,0,0,0,0,0,0,0,0,0,0,152,81,0,0,176,83,0,0,0,0,0,0,0,0,0,0,184,81,0,0,0,0,0,0,208,81,0,0,0,0,0,0,232,81,0,0,0,0,0,0,0,82,0,0,192,83,0,0,0,0,0,0,0,0,0,0,24,82,0,0,176,83,0,0,0,0,0,0,0,0,0,0,48,82,0,0,192,83,0,0,0,0,0,0,0,0,0,0,72,82,0,0,0,0,0,0,96,82,0,0,192,83,0,0,0,0,0,0,0,0,0,0,120,82,0,0,192,83,0,0,0,0,0,0,0,0,0,0,144,82,0,0,0,0,0,0,168,82,0,0,176,83,0,0,0,0,0,0,0,0,0,0,192,82,0,0,184,83,0,0,0,0,0,0,0,0,0,0,216,82,0,0,192,83,0,0,0,0,0,0,0,0,0,0,232,82,0,0,184,83,0,0,0,0,0,0,0,0,0,0,248,82,0,0,192,83,0,0,0,0,0,0,0,0,0,0,8,83,0,0,192,83,0,0,0,0,0,0,0,0,0,0,24,83,0,0,184,83,0,0,0,0,0,0,0,0,0,0,40,83,0,0,192,83,0,0,0,0,0,0,0,0,0,0,56,83,0,0,192,83,0,0,0,0,0,0,0,0,0,0,72,83,0,0,192,83,0,0,0,0,0,0,0,0,0,0,88,83,0,0,184,83,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,32,0,0,0,64,0,0,0,96,0,0,0,128,0,0,0,160,0,0,0,192,0,0,0,224,0,0,0,0,1,0,0,64,1,0,0,128,1,0,0,192,1,0,0,0,2,0,0,128,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
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
HEAP32[((21352)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21360)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21368)>>2)]=__ZTISt9exception;
HEAP32[((21376)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21392)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21408)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21424)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21432)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21440)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21448)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21456)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21472)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21488)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21504)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21520)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21536)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21544)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21552)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21560)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21576)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21592)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21608)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21616)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21632)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21648)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((21656)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21672)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21688)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21704)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21720)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21736)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21752)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21768)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21784)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21800)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((21816)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
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
function invoke_vif(index,a1,a2) {
  try {
    Module.dynCall_vif(index,a1,a2);
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
function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module.dynCall_iiiii(index,a1,a2,a3,a4);
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
function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module.dynCall_iiiiii(index,a1,a2,a3,a4,a5);
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
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var n=env.__ZTISt9exception|0;var o=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var p=+env.NaN;var q=+env.Infinity;var r=0;var s=0;var t=0;var u=0;var v=0,w=0,x=0,y=0,z=0.0,A=0,B=0,C=0,D=0.0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=global.Math.floor;var P=global.Math.abs;var Q=global.Math.sqrt;var R=global.Math.pow;var S=global.Math.cos;var T=global.Math.sin;var U=global.Math.tan;var V=global.Math.acos;var W=global.Math.asin;var X=global.Math.atan;var Y=global.Math.atan2;var Z=global.Math.exp;var _=global.Math.log;var $=global.Math.ceil;var aa=global.Math.imul;var ab=env.abort;var ac=env.assert;var ad=env.asmPrintInt;var ae=env.asmPrintFloat;var af=env.copyTempDouble;var ag=env.copyTempFloat;var ah=env.min;var ai=env.jsCall;var aj=env.invoke_viiiii;var ak=env.invoke_vif;var al=env.invoke_viifii;var am=env.invoke_vi;var an=env.invoke_vii;var ao=env.invoke_ii;var ap=env.invoke_viifi;var aq=env.invoke_if;var ar=env.invoke_iiiii;var as=env.invoke_viffif;var at=env.invoke_iiii;var au=env.invoke_fif;var av=env.invoke_viff;var aw=env.invoke_viiiiiiif;var ax=env.invoke_vifff;var ay=env.invoke_viiiiii;var az=env.invoke_iiif;var aA=env.invoke_iif;var aB=env.invoke_vifii;var aC=env.invoke_fi;var aD=env.invoke_iii;var aE=env.invoke_fiiiif;var aF=env.invoke_i;var aG=env.invoke_iiiiii;var aH=env.invoke_ifff;var aI=env.invoke_iff;var aJ=env.invoke_viii;var aK=env.invoke_v;var aL=env.invoke_viif;var aM=env.invoke_viiii;var aN=env._llvm_va_end;var aO=env._cosf;var aP=env._floorf;var aQ=env.___cxa_throw;var aR=env._abort;var aS=env._fprintf;var aT=env._printf;var aU=env.__reallyNegative;var aV=env._sqrtf;var aW=env.__ZNK12b2WheelJoint13GetDefinitionEP15b2WheelJointDef;var aX=env._llvm_lifetime_start;var aY=env.___setErrNo;var aZ=env._fwrite;var a_=env._llvm_eh_exception;var a$=env._write;var a0=env._exit;var a1=env._llvm_lifetime_end;var a2=env.___cxa_find_matching_catch;var a3=env._atan2f;var a4=env._sysconf;var a5=env.___cxa_pure_virtual;var a6=env._vprintf;var a7=env.___cxa_is_number_type;var a8=env.___resumeException;var a9=env.__formatString;var ba=env.___cxa_does_inherit;var bb=env.__ZSt9terminatev;var bc=env._sinf;var bd=env.___assert_func;var be=env.__ZSt18uncaught_exceptionv;var bf=env._pwrite;var bg=env._sbrk;var bh=env.__ZNSt9exceptionD2Ev;var bi=env.___cxa_allocate_exception;var bj=env.___errno_location;var bk=env.___gxx_personality_v0;var bl=env.___cxa_call_unexpected;var bm=env._time;var bn=env.__exit;
// EMSCRIPTEN_START_FUNCS
function bS(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function bT(){return i|0}function bU(a){a=a|0;i=a}function bV(a,b){a=a|0;b=b|0;if((r|0)==0){r=a;s=b}}function bW(a){a=a|0;E=a}function bX(a){a=a|0;F=a}function bY(a){a=a|0;G=a}function bZ(a){a=a|0;H=a}function b_(a){a=a|0;I=a}function b$(a){a=a|0;J=a}function b0(a){a=a|0;K=a}function b1(a){a=a|0;L=a}function b2(a){a=a|0;M=a}function b3(a){a=a|0;N=a}function b4(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;c[a>>2]=-1;b=a+12|0;c[b>>2]=16;c[a+8>>2]=0;d=vi(576)|0;e=a+4|0;c[e>>2]=d;vr(d|0,0,(c[b>>2]|0)*36&-1|0);d=(c[b>>2]|0)-1|0;L1:do{if((d|0)>0){f=0;while(1){g=f+1|0;c[(c[e>>2]|0)+(f*36&-1)+20>>2]=g;c[(c[e>>2]|0)+(f*36&-1)+32>>2]=-1;h=(c[b>>2]|0)-1|0;if((g|0)<(h|0)){f=g}else{i=h;break L1}}}else{i=d}}while(0);c[(c[e>>2]|0)+(i*36&-1)+20>>2]=-1;c[(c[e>>2]|0)+(((c[b>>2]|0)-1|0)*36&-1)+32>>2]=-1;vr(a+16|0,0,16);c[a+48>>2]=16;c[a+52>>2]=0;c[a+44>>2]=vi(192)|0;c[a+36>>2]=16;c[a+40>>2]=0;c[a+32>>2]=vi(64)|0;return}function b5(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0.0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=a|0;f=ck(e)|0;h=a+4|0;i=+g[b+4>>2]+-.10000000149011612;j=(c[h>>2]|0)+(f*36&-1)|0;l=(g[k>>2]=+g[b>>2]+-.10000000149011612,c[k>>2]|0);m=(g[k>>2]=i,c[k>>2]|0)|0;c[j>>2]=0|l;c[j+4>>2]=m;i=+g[b+12>>2]+.10000000149011612;m=(c[h>>2]|0)+(f*36&-1)+8|0;j=(g[k>>2]=+g[b+8>>2]+.10000000149011612,c[k>>2]|0);b=(g[k>>2]=i,c[k>>2]|0)|0;c[m>>2]=0|j;c[m+4>>2]=b;c[(c[h>>2]|0)+(f*36&-1)+16>>2]=d;c[(c[h>>2]|0)+(f*36&-1)+32>>2]=0;cl(e,f);e=a+28|0;c[e>>2]=(c[e>>2]|0)+1|0;e=a+40|0;h=c[e>>2]|0;d=a+36|0;b=a+32|0;if((h|0)!=(c[d>>2]|0)){n=h;o=c[b>>2]|0;p=o+(n<<2)|0;c[p>>2]=f;q=c[e>>2]|0;r=q+1|0;c[e>>2]=r;return f|0}a=c[b>>2]|0;c[d>>2]=h<<1;d=vi(h<<3)|0;c[b>>2]=d;h=a;vq(d|0,h|0,c[e>>2]<<2);vj(h);n=c[e>>2]|0;o=c[b>>2]|0;p=o+(n<<2)|0;c[p>>2]=f;q=c[e>>2]|0;r=q+1|0;c[e>>2]=r;return f|0}function b6(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0,s=0.0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0.0;h=a+60|0;c[h>>2]=0;i=e+12|0;j=+g[f+12>>2];l=+g[i>>2];m=+g[f+8>>2];n=+g[e+16>>2];o=+g[f>>2]+(j*l-m*n)- +g[d>>2];p=l*m+j*n+ +g[f+4>>2]- +g[d+4>>2];n=+g[d+12>>2];j=+g[d+8>>2];m=o*n+p*j;l=n*p+o*(-0.0-j);j=+g[b+8>>2]+ +g[e+8>>2];e=c[b+148>>2]|0;do{if((e|0)>0){d=0;o=-3.4028234663852886e+38;f=0;while(1){p=(m- +g[b+20+(d<<3)>>2])*+g[b+84+(d<<3)>>2]+(l- +g[b+20+(d<<3)+4>>2])*+g[b+84+(d<<3)+4>>2];if(p>j){q=28;break}r=p>o;s=r?p:o;t=r?d:f;r=d+1|0;if((r|0)<(e|0)){d=r;o=s;f=t}else{q=12;break}}if((q|0)==12){u=s<1.1920928955078125e-7;v=t;break}else if((q|0)==28){return}}else{u=1;v=0}}while(0);q=v+1|0;t=b+20+(v<<3)|0;f=c[t>>2]|0;d=c[t+4>>2]|0;s=(c[k>>2]=f,+g[k>>2]);t=d;o=(c[k>>2]=t,+g[k>>2]);r=b+20+(((q|0)<(e|0)?q:0)<<3)|0;q=c[r>>2]|0;e=c[r+4>>2]|0;p=(c[k>>2]=q,+g[k>>2]);r=e;n=(c[k>>2]=r,+g[k>>2]);if(u){c[h>>2]=1;c[a+56>>2]=1;u=b+84+(v<<3)|0;w=a+40|0;x=c[u+4>>2]|0;c[w>>2]=c[u>>2]|0;c[w+4>>2]=x;x=a+48|0;w=(g[k>>2]=(s+p)*.5,c[k>>2]|0);u=(g[k>>2]=(o+n)*.5,c[k>>2]|0)|0;c[x>>2]=0|w;c[x+4>>2]=u;u=i;x=a;w=c[u+4>>2]|0;c[x>>2]=c[u>>2]|0;c[x+4>>2]=w;c[a+16>>2]=0;return}y=m-s;z=l-o;A=m-p;B=l-n;if(y*(p-s)+z*(n-o)<=0.0){if(y*y+z*z>j*j){return}c[h>>2]=1;c[a+56>>2]=1;w=a+40|0;x=w;u=(g[k>>2]=y,c[k>>2]|0);C=(g[k>>2]=z,c[k>>2]|0)|0;c[x>>2]=0|u;c[x+4>>2]=C;D=+Q(+(y*y+z*z));if(D>=1.1920928955078125e-7){E=1.0/D;g[w>>2]=y*E;g[a+44>>2]=z*E}w=a+48|0;c[w>>2]=0|f&-1;c[w+4>>2]=t|d&0;d=i;t=a;w=c[d+4>>2]|0;c[t>>2]=c[d>>2]|0;c[t+4>>2]=w;c[a+16>>2]=0;return}if(A*(s-p)+B*(o-n)>0.0){E=(s+p)*.5;p=(o+n)*.5;w=b+84+(v<<3)|0;if((m-E)*+g[w>>2]+(l-p)*+g[b+84+(v<<3)+4>>2]>j){return}c[h>>2]=1;c[a+56>>2]=1;v=w;w=a+40|0;b=c[v+4>>2]|0;c[w>>2]=c[v>>2]|0;c[w+4>>2]=b;b=a+48|0;w=(g[k>>2]=E,c[k>>2]|0);v=(g[k>>2]=p,c[k>>2]|0)|0;c[b>>2]=0|w;c[b+4>>2]=v;v=i;b=a;w=c[v+4>>2]|0;c[b>>2]=c[v>>2]|0;c[b+4>>2]=w;c[a+16>>2]=0;return}if(A*A+B*B>j*j){return}c[h>>2]=1;c[a+56>>2]=1;h=a+40|0;w=h;b=(g[k>>2]=A,c[k>>2]|0);v=(g[k>>2]=B,c[k>>2]|0)|0;c[w>>2]=0|b;c[w+4>>2]=v;j=+Q(+(A*A+B*B));if(j>=1.1920928955078125e-7){p=1.0/j;g[h>>2]=A*p;g[a+44>>2]=B*p}h=a+48|0;c[h>>2]=0|q&-1;c[h+4>>2]=r|e&0;e=i;i=a;r=c[e+4>>2]|0;c[i>>2]=c[e>>2]|0;c[i+4>>2]=r;c[a+16>>2]=0;return}function b7(b,d,e,f,h){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;var i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0;i=b+60|0;c[i>>2]=0;j=f+12|0;l=+g[h+12>>2];m=+g[j>>2];n=+g[h+8>>2];o=+g[f+16>>2];p=+g[h>>2]+(l*m-n*o)- +g[e>>2];q=m*n+l*o+ +g[h+4>>2]- +g[e+4>>2];o=+g[e+12>>2];l=+g[e+8>>2];n=p*o+q*l;m=o*q+p*(-0.0-l);e=d+12|0;h=c[e>>2]|0;r=c[e+4>>2]|0;l=(c[k>>2]=h,+g[k>>2]);e=r;p=(c[k>>2]=e,+g[k>>2]);s=d+20|0;t=c[s>>2]|0;u=c[s+4>>2]|0;q=(c[k>>2]=t,+g[k>>2]);s=u;o=(c[k>>2]=s,+g[k>>2]);v=q-l;w=o-p;x=v*(q-n)+w*(o-m);y=n-l;z=m-p;A=y*v+z*w;B=+g[d+8>>2]+ +g[f+8>>2];if(A<=0.0){if(y*y+z*z>B*B){return}do{if((a[d+44|0]&1)<<24>>24!=0){f=d+28|0;C=c[f+4>>2]|0;D=(c[k>>2]=c[f>>2]|0,+g[k>>2]);if((l-n)*(l-D)+(p-m)*(p-(c[k>>2]=C,+g[k>>2]))<=0.0){break}return}}while(0);c[i>>2]=1;c[b+56>>2]=0;g[b+40>>2]=0.0;g[b+44>>2]=0.0;C=b+48|0;c[C>>2]=0|h&-1;c[C+4>>2]=e|r&0;C=b+16|0;c[C>>2]=0;f=C;a[C]=0;a[f+1|0]=0;a[f+2|0]=0;a[f+3|0]=0;f=j;C=b;E=c[f+4>>2]|0;c[C>>2]=c[f>>2]|0;c[C+4>>2]=E;return}if(x<=0.0){D=n-q;F=m-o;if(D*D+F*F>B*B){return}do{if((a[d+45|0]&1)<<24>>24!=0){E=d+36|0;C=c[E+4>>2]|0;G=(c[k>>2]=c[E>>2]|0,+g[k>>2]);if(D*(G-q)+F*((c[k>>2]=C,+g[k>>2])-o)<=0.0){break}return}}while(0);c[i>>2]=1;c[b+56>>2]=0;g[b+40>>2]=0.0;g[b+44>>2]=0.0;d=b+48|0;c[d>>2]=0|t&-1;c[d+4>>2]=s|u&0;u=b+16|0;c[u>>2]=0;s=u;a[u]=1;a[s+1|0]=0;a[s+2|0]=0;a[s+3|0]=0;s=j;u=b;d=c[s+4>>2]|0;c[u>>2]=c[s>>2]|0;c[u+4>>2]=d;return}F=v*v+w*w;if(F<=0.0){bd(12984,127,18976,12968)}D=1.0/F;F=n-(l*x+q*A)*D;q=m-(p*x+o*A)*D;if(F*F+q*q>B*B){return}B=-0.0-w;if(v*z+y*B<0.0){H=w;I=-0.0-v}else{H=B;I=v}v=+Q(+(I*I+H*H));if(v<1.1920928955078125e-7){J=H;K=I}else{B=1.0/v;J=H*B;K=I*B}c[i>>2]=1;c[b+56>>2]=1;i=b+40|0;d=(g[k>>2]=J,c[k>>2]|0);u=(g[k>>2]=K,c[k>>2]|0)|0;c[i>>2]=0|d;c[i+4>>2]=u;u=b+48|0;c[u>>2]=0|h&-1;c[u+4>>2]=e|r&0;r=b+16|0;c[r>>2]=0;e=r;a[r]=0;a[e+1|0]=0;a[e+2|0]=1;a[e+3|0]=0;e=j;j=b;b=c[e+4>>2]|0;c[j>>2]=c[e>>2]|0;c[j+4>>2]=b;return}function b8(b,d,e,f,h,j){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0,C=0,D=0.0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,R=0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0,ac=0.0,ad=0.0,ae=0,af=0.0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0.0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0.0,aG=0.0,aH=0.0,aI=0.0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0.0,aV=0,aW=0,aX=0.0;l=i;i=i+40|0;m=l|0;n=l+16|0;o=n|0;p=n;q=i;i=i+24|0;r=i;i=i+24|0;s=r|0;t=r;u=b+132|0;v=+g[f+12>>2];w=+g[j+8>>2];x=+g[f+8>>2];y=+g[j+12>>2];z=v*w-x*y;A=w*x+v*y;B=(g[k>>2]=z,c[k>>2]|0);C=(g[k>>2]=A,c[k>>2]|0)|0;y=+g[j>>2]- +g[f>>2];w=+g[j+4>>2]- +g[f+4>>2];D=v*y+x*w;E=y*(-0.0-x)+v*w;f=(g[k>>2]=D,c[k>>2]|0);j=(g[k>>2]=E,c[k>>2]|0)|0;F=u;c[F>>2]=0|f;c[F+4>>2]=j;j=b+140|0;c[j>>2]=0|B;c[j+4>>2]=C;C=b+144|0;w=+g[h+12>>2];j=b+140|0;v=+g[h+16>>2];B=u|0;x=D+(A*w-z*v);u=b+136|0;D=w*z+A*v+E;F=b+148|0;f=(g[k>>2]=x,c[k>>2]|0);G=(g[k>>2]=D,c[k>>2]|0)|0;c[F>>2]=0|f;c[F+4>>2]=G;G=e+28|0;F=b+156|0;f=c[G>>2]|0;H=c[G+4>>2]|0;c[F>>2]=f;c[F+4>>2]=H;F=e+12|0;G=b+164|0;I=c[F>>2]|0;J=c[F+4>>2]|0;c[G>>2]=I;c[G+4>>2]=J;F=e+20|0;K=b+172|0;L=c[F>>2]|0;M=c[F+4>>2]|0;c[K>>2]=L;c[K+4>>2]=M;F=e+36|0;N=b+180|0;O=c[F>>2]|0;P=c[F+4>>2]|0;c[N>>2]=O;c[N+4>>2]=P;N=a[e+44|0]&1;F=N<<24>>24!=0;R=a[e+45|0]|0;e=(R&1)<<24>>24!=0;E=(c[k>>2]=L,+g[k>>2]);v=(c[k>>2]=I,+g[k>>2]);A=E-v;z=(c[k>>2]=M,+g[k>>2]);M=b+168|0;w=(c[k>>2]=J,+g[k>>2]);y=z-w;S=+Q(+(A*A+y*y));T=(c[k>>2]=f,+g[k>>2]);U=(c[k>>2]=H,+g[k>>2]);V=(c[k>>2]=O,+g[k>>2]);W=(c[k>>2]=P,+g[k>>2]);if(S<1.1920928955078125e-7){X=A;Y=y}else{Z=1.0/S;X=A*Z;Y=y*Z}P=b+196|0;Z=-0.0-X;O=P|0;g[O>>2]=Y;H=b+200|0;g[H>>2]=Z;y=(x-v)*Y+(D-w)*Z;if(F){Z=v-T;v=w-U;w=+Q(+(Z*Z+v*v));if(w<1.1920928955078125e-7){_=Z;$=v}else{A=1.0/w;_=Z*A;$=v*A}A=-0.0-_;g[b+188>>2]=$;g[b+192>>2]=A;aa=(x-T)*$+(D-U)*A;ab=Y*_-X*$>=0.0}else{aa=0.0;ab=0}L93:do{if(e){$=V-E;_=W-z;A=+Q(+($*$+_*_));if(A<1.1920928955078125e-7){ac=$;ad=_}else{U=1.0/A;ac=$*U;ad=_*U}U=-0.0-ac;f=b+204|0;g[f>>2]=ad;J=b+208|0;g[J>>2]=U;I=X*ad-Y*ac>0.0;_=(x-E)*ad+(D-z)*U;if((N&R)<<24>>24==0){ae=I;af=_;ag=100;break}if(ab&I){do{if(aa<0.0&y<0.0){L=_>=0.0;a[b+248|0]=L&1;ah=b+212|0;if(L){ai=ah;break}L=ah;ah=(g[k>>2]=-0.0-Y,c[k>>2]|0);aj=0|ah;ah=(g[k>>2]=X,c[k>>2]|0)|0;c[L>>2]=aj;c[L+4>>2]=ah;L=b+228|0;c[L>>2]=aj;c[L+4>>2]=ah;L=b+236|0;c[L>>2]=aj;c[L+4>>2]=ah;break L93}else{a[b+248|0]=1;ai=b+212|0}}while(0);ah=P;L=ai;aj=c[ah+4>>2]|0;c[L>>2]=c[ah>>2]|0;c[L+4>>2]=aj;aj=b+188|0;L=b+228|0;ah=c[aj+4>>2]|0;c[L>>2]=c[aj>>2]|0;c[L+4>>2]=ah;ah=b+204|0;L=b+236|0;aj=c[ah+4>>2]|0;c[L>>2]=c[ah>>2]|0;c[L+4>>2]=aj;break}if(ab){do{if(aa<0.0){if(y<0.0){a[b+248|0]=0;ak=b+212|0}else{aj=_>=0.0;a[b+248|0]=aj&1;L=b+212|0;if(aj){al=L;break}else{ak=L}}L=ak;aj=(g[k>>2]=-0.0-Y,c[k>>2]|0);ah=(g[k>>2]=X,c[k>>2]|0)|0;c[L>>2]=0|aj;c[L+4>>2]=ah;U=-0.0- +g[J>>2];ah=b+228|0;L=(g[k>>2]=-0.0- +g[f>>2],c[k>>2]|0);aj=(g[k>>2]=U,c[k>>2]|0)|0;c[ah>>2]=0|L;c[ah+4>>2]=aj;U=-0.0- +g[H>>2];aj=b+236|0;ah=(g[k>>2]=-0.0- +g[O>>2],c[k>>2]|0);L=(g[k>>2]=U,c[k>>2]|0)|0;c[aj>>2]=0|ah;c[aj+4>>2]=L;break L93}else{a[b+248|0]=1;al=b+212|0}}while(0);L=P;aj=al;ah=c[L+4>>2]|0;c[aj>>2]=c[L>>2]|0;c[aj+4>>2]=ah;ah=b+188|0;aj=b+228|0;am=c[ah+4>>2]|0;c[aj>>2]=c[ah>>2]|0;c[aj+4>>2]=am;am=b+236|0;aj=c[L+4>>2]|0;c[am>>2]=c[L>>2]|0;c[am+4>>2]=aj;break}if(!I){do{if(aa<0.0|y<0.0){a[b+248|0]=0;an=b+212|0}else{aj=_>=0.0;a[b+248|0]=aj&1;am=b+212|0;if(!aj){an=am;break}aj=P;L=am;am=c[aj>>2]|0;ah=c[aj+4>>2]|0;c[L>>2]=am;c[L+4>>2]=ah;L=b+228|0;c[L>>2]=am;c[L+4>>2]=ah;L=b+236|0;c[L>>2]=am;c[L+4>>2]=ah;break L93}}while(0);I=an;ah=(g[k>>2]=-0.0-Y,c[k>>2]|0);L=(g[k>>2]=X,c[k>>2]|0)|0;c[I>>2]=0|ah;c[I+4>>2]=L;U=-0.0- +g[J>>2];L=b+228|0;I=(g[k>>2]=-0.0- +g[f>>2],c[k>>2]|0);ah=(g[k>>2]=U,c[k>>2]|0)|0;c[L>>2]=0|I;c[L+4>>2]=ah;U=-0.0- +g[b+192>>2];ah=b+236|0;L=(g[k>>2]=-0.0- +g[b+188>>2],c[k>>2]|0);I=(g[k>>2]=U,c[k>>2]|0)|0;c[ah>>2]=0|L;c[ah+4>>2]=I;break}do{if(_<0.0){if(aa<0.0){a[b+248|0]=0;ao=b+212|0}else{I=y>=0.0;a[b+248|0]=I&1;ah=b+212|0;if(I){ap=ah;break}else{ao=ah}}ah=ao;I=(g[k>>2]=-0.0-Y,c[k>>2]|0);L=(g[k>>2]=X,c[k>>2]|0)|0;c[ah>>2]=0|I;c[ah+4>>2]=L;U=-0.0- +g[H>>2];L=b+228|0;ah=(g[k>>2]=-0.0- +g[O>>2],c[k>>2]|0);I=(g[k>>2]=U,c[k>>2]|0)|0;c[L>>2]=0|ah;c[L+4>>2]=I;U=-0.0- +g[b+192>>2];I=b+236|0;L=(g[k>>2]=-0.0- +g[b+188>>2],c[k>>2]|0);ah=(g[k>>2]=U,c[k>>2]|0)|0;c[I>>2]=0|L;c[I+4>>2]=ah;break L93}else{a[b+248|0]=1;ap=b+212|0}}while(0);f=P;J=ap;ah=c[f+4>>2]|0;c[J>>2]=c[f>>2]|0;c[J+4>>2]=ah;ah=b+228|0;J=c[f+4>>2]|0;c[ah>>2]=c[f>>2]|0;c[ah+4>>2]=J;J=b+204|0;ah=b+236|0;f=c[J+4>>2]|0;c[ah>>2]=c[J>>2]|0;c[ah+4>>2]=f;break}else{ae=0;af=0.0;ag=100}}while(0);L134:do{if((ag|0)==100){if(F){ap=aa>=0.0;if(ab){do{if(ap){a[b+248|0]=1;aq=b+212|0}else{ao=y>=0.0;a[b+248|0]=ao&1;an=b+212|0;if(ao){aq=an;break}ao=an;an=(g[k>>2]=-0.0-Y,c[k>>2]|0);al=0;ak=(g[k>>2]=X,c[k>>2]|0);c[ao>>2]=al|an;c[ao+4>>2]=ak|0;ao=P;an=b+228|0;ai=c[ao>>2]|0;R=c[ao+4>>2]|0;c[an>>2]=ai;c[an+4>>2]=R;R=b+236|0;c[R>>2]=al|(g[k>>2]=-0.0-(c[k>>2]=ai,+g[k>>2]),c[k>>2]|0);c[R+4>>2]=ak|0;break L134}}while(0);ak=P;R=aq;ai=c[ak+4>>2]|0;c[R>>2]=c[ak>>2]|0;c[R+4>>2]=ai;ai=b+188|0;R=b+228|0;ak=c[ai+4>>2]|0;c[R>>2]=c[ai>>2]|0;c[R+4>>2]=ak;z=-0.0- +g[H>>2];ak=b+236|0;R=(g[k>>2]=-0.0- +g[O>>2],c[k>>2]|0);ai=(g[k>>2]=z,c[k>>2]|0)|0;c[ak>>2]=0|R;c[ak+4>>2]=ai;break}else{do{if(ap){ai=y>=0.0;a[b+248|0]=ai&1;ak=b+212|0;if(!ai){ar=ak;break}ai=P;R=ak;ak=c[ai>>2]|0;al=c[ai+4>>2]|0;c[R>>2]=ak;c[R+4>>2]=al;R=b+228|0;c[R>>2]=ak;c[R+4>>2]=al;al=b+236|0;R=(g[k>>2]=-0.0-(c[k>>2]=ak,+g[k>>2]),c[k>>2]|0);ak=(g[k>>2]=X,c[k>>2]|0)|0;c[al>>2]=0|R;c[al+4>>2]=ak;break L134}else{a[b+248|0]=0;ar=b+212|0}}while(0);ap=ar;ak=(g[k>>2]=-0.0-Y,c[k>>2]|0);al=(g[k>>2]=X,c[k>>2]|0)|0;c[ap>>2]=0|ak;c[ap+4>>2]=al;al=P;ap=b+228|0;ak=c[al+4>>2]|0;c[ap>>2]=c[al>>2]|0;c[ap+4>>2]=ak;z=-0.0- +g[b+192>>2];ak=b+236|0;ap=(g[k>>2]=-0.0- +g[b+188>>2],c[k>>2]|0);al=(g[k>>2]=z,c[k>>2]|0)|0;c[ak>>2]=0|ap;c[ak+4>>2]=al;break}}al=y>=0.0;if(!e){a[b+248|0]=al&1;ak=b+212|0;if(al){ap=P;R=ak;ai=c[ap>>2]|0;an=c[ap+4>>2]|0;c[R>>2]=ai;c[R+4>>2]=an;an=b+228|0;R=(g[k>>2]=-0.0-(c[k>>2]=ai,+g[k>>2]),c[k>>2]|0);ai=0|R;R=(g[k>>2]=X,c[k>>2]|0)|0;c[an>>2]=ai;c[an+4>>2]=R;an=b+236|0;c[an>>2]=ai;c[an+4>>2]=R;break}else{R=ak;ak=(g[k>>2]=-0.0-Y,c[k>>2]|0);an=(g[k>>2]=X,c[k>>2]|0)|0;c[R>>2]=0|ak;c[R+4>>2]=an;an=P;R=b+228|0;ak=c[an>>2]|0;ai=c[an+4>>2]|0;c[R>>2]=ak;c[R+4>>2]=ai;R=b+236|0;c[R>>2]=ak;c[R+4>>2]=ai;break}}if(ae){do{if(al){a[b+248|0]=1;as=b+212|0}else{ai=af>=0.0;a[b+248|0]=ai&1;R=b+212|0;if(ai){as=R;break}ai=R;R=(g[k>>2]=-0.0-Y,c[k>>2]|0);ak=0|R;R=(g[k>>2]=X,c[k>>2]|0)|0;c[ai>>2]=ak;c[ai+4>>2]=R;ai=b+228|0;c[ai>>2]=ak;c[ai+4>>2]=R;R=P;ai=b+236|0;ak=c[R+4>>2]|0;c[ai>>2]=c[R>>2]|0;c[ai+4>>2]=ak;break L134}}while(0);ak=P;ai=as;R=c[ak+4>>2]|0;c[ai>>2]=c[ak>>2]|0;c[ai+4>>2]=R;z=-0.0- +g[H>>2];R=b+228|0;ai=(g[k>>2]=-0.0- +g[O>>2],c[k>>2]|0);ak=(g[k>>2]=z,c[k>>2]|0)|0;c[R>>2]=0|ai;c[R+4>>2]=ak;ak=b+204|0;R=b+236|0;ai=c[ak+4>>2]|0;c[R>>2]=c[ak>>2]|0;c[R+4>>2]=ai;break}else{do{if(al){ai=af>=0.0;a[b+248|0]=ai&1;R=b+212|0;if(!ai){at=R;break}ai=P;ak=R;R=c[ai>>2]|0;an=c[ai+4>>2]|0;c[ak>>2]=R;c[ak+4>>2]=an;ak=b+228|0;ai=(g[k>>2]=-0.0-(c[k>>2]=R,+g[k>>2]),c[k>>2]|0);ap=(g[k>>2]=X,c[k>>2]|0)|0;c[ak>>2]=0|ai;c[ak+4>>2]=ap;ap=b+236|0;c[ap>>2]=R;c[ap+4>>2]=an;break L134}else{a[b+248|0]=0;at=b+212|0}}while(0);al=at;an=(g[k>>2]=-0.0-Y,c[k>>2]|0);ap=(g[k>>2]=X,c[k>>2]|0)|0;c[al>>2]=0|an;c[al+4>>2]=ap;z=-0.0- +g[b+208>>2];ap=b+228|0;al=(g[k>>2]=-0.0- +g[b+204>>2],c[k>>2]|0);an=(g[k>>2]=z,c[k>>2]|0)|0;c[ap>>2]=0|al;c[ap+4>>2]=an;an=P;ap=b+236|0;al=c[an+4>>2]|0;c[ap>>2]=c[an>>2]|0;c[ap+4>>2]=al;break}}}while(0);at=h+148|0;as=b+128|0;c[as>>2]=c[at>>2]|0;L172:do{if((c[at>>2]|0)>0){ae=0;while(1){X=+g[C>>2];Y=+g[h+20+(ae<<3)>>2];af=+g[j>>2];y=+g[h+20+(ae<<3)+4>>2];aa=Y*af+X*y+ +g[u>>2];e=b+(ae<<3)|0;ar=(g[k>>2]=+g[B>>2]+(X*Y-af*y),c[k>>2]|0);aq=(g[k>>2]=aa,c[k>>2]|0)|0;c[e>>2]=0|ar;c[e+4>>2]=aq;aa=+g[C>>2];y=+g[h+84+(ae<<3)>>2];af=+g[j>>2];Y=+g[h+84+(ae<<3)+4>>2];aq=b+64+(ae<<3)|0;e=(g[k>>2]=aa*y-af*Y,c[k>>2]|0);ar=(g[k>>2]=y*af+aa*Y,c[k>>2]|0)|0;c[aq>>2]=0|e;c[aq+4>>2]=ar;ar=ae+1|0;if((ar|0)<(c[at>>2]|0)){ae=ar}else{break L172}}}}while(0);at=b+244|0;g[at>>2]=.019999999552965164;ae=d+60|0;c[ae>>2]=0;ar=b+248|0;aq=c[as>>2]|0;L176:do{if((aq|0)>0){Y=+g[b+164>>2];aa=+g[M>>2];af=+g[b+212>>2];y=+g[b+216>>2];e=0;X=3.4028234663852886e+38;while(1){z=af*(+g[b+(e<<3)>>2]-Y)+y*(+g[b+(e<<3)+4>>2]-aa);D=z<X?z:X;ab=e+1|0;if((ab|0)<(aq|0)){e=ab;X=D}else{au=D;break L176}}}else{au=3.4028234663852886e+38}}while(0);if(au>+g[at>>2]){i=l;return}b9(m,b);aq=c[m>>2]|0;do{if((aq|0)==0){ag=136}else{X=+g[m+8>>2];if(X>+g[at>>2]){i=l;return}if(X<=au*.9800000190734863+.0010000000474974513){ag=136;break}M=c[m+4>>2]|0;e=n;ab=d+56|0;if((aq|0)==1){av=e;aw=ab;ag=138;break}c[ab>>2]=2;ab=c[G>>2]|0;F=c[G+4>>2]|0;c[o>>2]=ab;c[o+4>>2]=F;al=n+8|0;ap=al;a[al]=0;al=M&255;a[ap+1|0]=al;a[ap+2|0]=0;a[ap+3|0]=1;ap=p+12|0;an=c[K>>2]|0;R=c[K+4>>2]|0;c[ap>>2]=an;c[ap+4>>2]=R;ap=p+20|0;ak=ap;a[ap]=0;a[ak+1|0]=al;a[ak+2|0]=0;a[ak+3|0]=1;ak=M+1|0;ap=(ak|0)<(c[as>>2]|0)?ak:0;ak=b+(M<<3)|0;ai=c[ak>>2]|0;ao=c[ak+4>>2]|0;ak=b+(ap<<3)|0;N=c[ak>>2]|0;f=c[ak+4>>2]|0;ak=b+64+(M<<3)|0;ah=c[ak>>2]|0;J=c[ak+4>>2]|0;X=(c[k>>2]=ab,+g[k>>2]);aa=(c[k>>2]=F,+g[k>>2]);y=(c[k>>2]=an,+g[k>>2]);ax=M;ay=ap&255;az=ah;aA=J;aB=N;aC=f;aD=ai;aE=ao;aF=y;aG=X;aH=(c[k>>2]=R,+g[k>>2]);aI=aa;aJ=al;aK=0;aL=e;break}}while(0);do{if((ag|0)==136){av=n;aw=d+56|0;ag=138;break}}while(0);do{if((ag|0)==138){c[aw>>2]=1;aq=c[as>>2]|0;L195:do{if((aq|0)>1){au=+g[b+216>>2];aa=+g[b+212>>2];m=0;X=aa*+g[b+64>>2]+au*+g[b+68>>2];e=1;while(1){y=aa*+g[b+64+(e<<3)>>2]+au*+g[b+64+(e<<3)+4>>2];al=y<X;R=al?e:m;ao=e+1|0;if((ao|0)<(aq|0)){m=R;X=al?y:X;e=ao}else{aM=R;break L195}}}else{aM=0}}while(0);e=aM+1|0;m=(e|0)<(aq|0)?e:0;e=b+(aM<<3)|0;R=c[e>>2]|0;ao=c[e+4>>2]|0;c[o>>2]=R;c[o+4>>2]=ao;e=n+8|0;al=e;a[e]=0;e=aM&255;a[al+1|0]=e;a[al+2|0]=1;a[al+3|0]=0;al=b+(m<<3)|0;ai=p+12|0;f=c[al>>2]|0;N=c[al+4>>2]|0;c[ai>>2]=f;c[ai+4>>2]=N;ai=p+20|0;al=ai;a[ai]=0;a[al+1|0]=m&255;a[al+2|0]=1;a[al+3|0]=0;al=(a[ar]&1)<<24>>24==0;X=(c[k>>2]=R,+g[k>>2]);au=(c[k>>2]=ao,+g[k>>2]);aa=(c[k>>2]=f,+g[k>>2]);y=(c[k>>2]=N,+g[k>>2]);if(al){al=c[K>>2]|0;N=c[K+4>>2]|0;f=c[G>>2]|0;ao=c[G+4>>2]|0;Y=-0.0- +g[H>>2];R=(g[k>>2]=-0.0- +g[O>>2],c[k>>2]|0);ax=1;ay=0;az=R;aA=(g[k>>2]=Y,c[k>>2]|0);aB=f;aC=ao;aD=al;aE=N;aF=aa;aG=X;aH=y;aI=au;aJ=e;aK=1;aL=av;break}else{N=P;ax=0;ay=1;az=c[N>>2]|0;aA=c[N+4>>2]|0;aB=c[K>>2]|0;aC=c[K+4>>2]|0;aD=c[G>>2]|0;aE=c[G+4>>2]|0;aF=aa;aG=X;aH=y;aI=au;aJ=e;aK=1;aL=av;break}}}while(0);au=(c[k>>2]=az,+g[k>>2]);y=(c[k>>2]=aA,+g[k>>2]);X=(c[k>>2]=aC,+g[k>>2]);aa=(c[k>>2]=aD,+g[k>>2]);Y=(c[k>>2]=aE,+g[k>>2]);af=-0.0-au;D=aa*y+Y*af;z=-0.0-y;ad=(c[k>>2]=aB,+g[k>>2])*z+X*au;X=y*aG+aI*af-D;E=y*aF+aH*af-D;if(X>0.0){aN=0}else{aB=q;aC=n;c[aB>>2]=c[aC>>2]|0;c[aB+4>>2]=c[aC+4>>2]|0;c[aB+8>>2]=c[aC+8>>2]|0;aN=1}if(E>0.0){aO=aN}else{aC=q+(aN*12&-1)|0;aB=aL+12|0;c[aC>>2]=c[aB>>2]|0;c[aC+4>>2]=c[aB+4>>2]|0;c[aC+8>>2]=c[aB+8>>2]|0;aO=aN+1|0}if(X*E<0.0){D=X/(X-E);aN=q+(aO*12&-1)|0;aB=(g[k>>2]=aG+D*(aF-aG),c[k>>2]|0);aC=(g[k>>2]=aI+D*(aH-aI),c[k>>2]|0)|0;c[aN>>2]=0|aB;c[aN+4>>2]=aC;aC=q+(aO*12&-1)+8|0;aN=aC;a[aC]=ax&255;a[aN+1|0]=aJ;a[aN+2|0]=0;a[aN+3|0]=1;aP=aO+1|0}else{aP=aO}if((aP|0)<2){i=l;return}aI=+g[q>>2];aH=+g[q+4>>2];D=aI*z+au*aH-ad;aP=q+12|0;aG=+g[aP>>2];aF=+g[q+16>>2];E=aG*z+au*aF-ad;if(D>0.0){aQ=0}else{aO=r;aN=q;c[aO>>2]=c[aN>>2]|0;c[aO+4>>2]=c[aN+4>>2]|0;c[aO+8>>2]=c[aN+8>>2]|0;aQ=1}if(E>0.0){aR=aQ}else{aN=t+(aQ*12&-1)|0;aO=aP;c[aN>>2]=c[aO>>2]|0;c[aN+4>>2]=c[aO+4>>2]|0;c[aN+8>>2]=c[aO+8>>2]|0;aR=aQ+1|0}if(D*E<0.0){ad=D/(D-E);aQ=t+(aR*12&-1)|0;aO=(g[k>>2]=aI+ad*(aG-aI),c[k>>2]|0);aN=(g[k>>2]=aH+ad*(aF-aH),c[k>>2]|0)|0;c[aQ>>2]=0|aO;c[aQ+4>>2]=aN;aN=t+(aR*12&-1)+8|0;aQ=aN;a[aN]=ay;a[aQ+1|0]=a[(q+8|0)+1|0]|0;a[aQ+2|0]=0;a[aQ+3|0]=1;aS=aR+1|0}else{aS=aR}if((aS|0)<2){i=l;return}aS=d+40|0;do{if(aK){aR=aS;c[aR>>2]=0|az;c[aR+4>>2]=aA|0;aR=d+48|0;c[aR>>2]=0|aD;c[aR+4>>2]=aE|0;aH=+g[r>>2];aF=+g[t+4>>2];ad=+g[at>>2];if(au*(aH-aa)+y*(aF-Y)>ad){aT=0;aU=ad}else{ad=aH- +g[B>>2];aH=aF- +g[u>>2];aF=+g[C>>2];aI=+g[j>>2];aR=d;aQ=(g[k>>2]=ad*aF+aH*aI,c[k>>2]|0);q=(g[k>>2]=aF*aH+ad*(-0.0-aI),c[k>>2]|0)|0;c[aR>>2]=0|aQ;c[aR+4>>2]=q;c[d+16>>2]=c[r+8>>2]|0;aT=1;aU=+g[at>>2]}aI=+g[t+12>>2];ad=+g[r+16>>2];if(au*(aI-aa)+y*(ad-Y)>aU){aV=aT;break}aH=aI- +g[B>>2];aI=ad- +g[u>>2];ad=+g[C>>2];aF=+g[j>>2];q=d+(aT*20&-1)|0;aR=(g[k>>2]=aH*ad+aI*aF,c[k>>2]|0);aQ=(g[k>>2]=ad*aI+aH*(-0.0-aF),c[k>>2]|0)|0;c[q>>2]=0|aR;c[q+4>>2]=aQ;c[d+(aT*20&-1)+16>>2]=c[t+20>>2]|0;aV=aT+1|0}else{aQ=h+84+(ax<<3)|0;q=aS;aR=c[aQ+4>>2]|0;c[q>>2]=c[aQ>>2]|0;c[q+4>>2]=aR;aR=h+20+(ax<<3)|0;q=d+48|0;aQ=c[aR+4>>2]|0;c[q>>2]=c[aR>>2]|0;c[q+4>>2]=aQ;aF=+g[at>>2];if(au*(+g[r>>2]-aa)+y*(+g[t+4>>2]-Y)>aF){aW=0;aX=aF}else{aQ=d;q=c[s+4>>2]|0;c[aQ>>2]=c[s>>2]|0;c[aQ+4>>2]=q;q=r+8|0;aQ=q;aR=d+16|0;ay=aR;a[ay+2|0]=a[aQ+3|0]|0;a[ay+3|0]=a[aQ+2|0]|0;a[aR]=a[aQ+1|0]|0;a[ay+1|0]=a[q]|0;aW=1;aX=+g[at>>2]}q=t+12|0;if(au*(+g[q>>2]-aa)+y*(+g[r+16>>2]-Y)>aX){aV=aW;break}ay=q;q=d+(aW*20&-1)|0;aQ=c[ay+4>>2]|0;c[q>>2]=c[ay>>2]|0;c[q+4>>2]=aQ;aQ=t+20|0;q=aQ;ay=d+(aW*20&-1)+16|0;aR=ay;a[aR+2|0]=a[q+3|0]|0;a[aR+3|0]=a[q+2|0]|0;a[ay]=a[q+1|0]|0;a[aR+1|0]=a[aQ]|0;aV=aW+1|0}}while(0);c[ae>>2]=aV;i=l;return}function b9(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0,r=0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0;d=a|0;c[d>>2]=0;e=a+4|0;c[e>>2]=-1;f=a+8|0;g[f>>2]=-3.4028234663852886e+38;h=+g[b+216>>2];i=+g[b+212>>2];a=c[b+128>>2]|0;if((a|0)<=0){return}j=+g[b+164>>2];k=+g[b+168>>2];l=+g[b+172>>2];m=+g[b+176>>2];n=+g[b+244>>2];o=b+228|0;p=b+232|0;q=b+236|0;r=b+240|0;s=0;t=-3.4028234663852886e+38;while(1){u=+g[b+64+(s<<3)>>2];v=-0.0-u;w=-0.0- +g[b+64+(s<<3)+4>>2];x=+g[b+(s<<3)>>2];y=+g[b+(s<<3)+4>>2];z=(x-j)*v+(y-k)*w;A=(x-l)*v+(y-m)*w;B=z<A?z:A;if(B>n){break}do{if(h*u+i*w<0.0){if((v- +g[o>>2])*i+(w- +g[p>>2])*h>=-.03490658849477768&B>t){C=182;break}else{D=t;break}}else{if((v- +g[q>>2])*i+(w- +g[r>>2])*h>=-.03490658849477768&B>t){C=182;break}else{D=t;break}}}while(0);if((C|0)==182){C=0;c[d>>2]=2;c[e>>2]=s;g[f>>2]=B;D=B}E=s+1|0;if((E|0)<(a|0)){s=E;t=D}else{C=186;break}}if((C|0)==186){return}c[d>>2]=2;c[e>>2]=s;g[f>>2]=B;return}function ca(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0,A=0.0,B=0;h=c[b+148>>2]|0;i=+g[f+12>>2];j=+g[e+12>>2];k=+g[f+8>>2];l=+g[e+16>>2];m=+g[d+12>>2];n=+g[b+12>>2];o=+g[d+8>>2];p=+g[b+16>>2];q=+g[f>>2]+(i*j-k*l)-(+g[d>>2]+(m*n-o*p));r=j*k+i*l+ +g[f+4>>2]-(n*o+m*p+ +g[d+4>>2]);p=m*q+o*r;n=m*r+q*(-0.0-o);L259:do{if((h|0)>0){s=0;o=-3.4028234663852886e+38;t=0;while(1){q=p*+g[b+84+(s<<3)>>2]+n*+g[b+84+(s<<3)+4>>2];u=q>o;v=u?s:t;w=s+1|0;if((w|0)<(h|0)){s=w;o=u?q:o;t=v}else{x=v;break L259}}}else{x=0}}while(0);n=+cc(b,d,x,e,f);t=((x|0)>0?x:h)-1|0;p=+cc(b,d,t,e,f);s=x+1|0;v=(s|0)<(h|0)?s:0;o=+cc(b,d,v,e,f);if(p>n&p>o){q=p;s=t;while(1){t=((s|0)>0?s:h)-1|0;p=+cc(b,d,t,e,f);if(p>q){q=p;s=t}else{y=q;z=s;break}}c[a>>2]=z;return+y}if(o>n){A=o;B=v}else{y=n;z=x;c[a>>2]=z;return+y}while(1){x=B+1|0;v=(x|0)<(h|0)?x:0;n=+cc(b,d,v,e,f);if(n>A){A=n;B=v}else{y=A;z=B;break}}c[a>>2]=z;return+y}function cb(b,d,e,f,h){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;var j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0,C=0,D=0,E=0,F=0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0,P=0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0;j=i;i=i+40|0;l=j|0;m=j+8|0;n=j+16|0;o=n|0;p=i;i=i+24|0;q=i;i=i+24|0;r=b+60|0;c[r>>2]=0;s=+g[d+8>>2]+ +g[f+8>>2];c[l>>2]=0;t=+ca(l,d,e,f,h);if(t>s){i=j;return}c[m>>2]=0;u=+ca(m,f,h,d,e);if(u>s){i=j;return}if(u>t*.9800000190734863+.0010000000474974513){t=+g[h>>2];u=+g[h+4>>2];v=+g[h+8>>2];w=+g[h+12>>2];x=+g[e>>2];y=+g[e+4>>2];z=+g[e+8>>2];A=+g[e+12>>2];B=c[m>>2]|0;c[b+56>>2]=2;C=f;D=d;E=B;F=1;G=x;H=y;I=z;J=A;K=t;L=u;M=v;N=w}else{w=+g[e>>2];v=+g[e+4>>2];u=+g[e+8>>2];t=+g[e+12>>2];A=+g[h>>2];z=+g[h+4>>2];y=+g[h+8>>2];x=+g[h+12>>2];h=c[l>>2]|0;c[b+56>>2]=1;C=d;D=f;E=h;F=0;G=A;H=z;I=y;J=x;K=w;L=v;M=u;N=t}h=n;f=c[D+148>>2]|0;if((E|0)<=-1){bd(10264,151,18656,11704)}d=c[C+148>>2]|0;if((d|0)<=(E|0)){bd(10264,151,18656,11704)}t=+g[C+84+(E<<3)>>2];u=+g[C+84+(E<<3)+4>>2];v=N*t-M*u;w=M*t+N*u;u=J*v+I*w;t=-0.0-I;x=J*w+v*t;L290:do{if((f|0)>0){l=0;v=3.4028234663852886e+38;e=0;while(1){w=u*+g[D+84+(l<<3)>>2]+x*+g[D+84+(l<<3)+4>>2];B=w<v;m=B?l:e;O=l+1|0;if((O|0)<(f|0)){l=O;v=B?w:v;e=m}else{P=m;break L290}}}else{P=0}}while(0);e=P+1|0;l=(e|0)<(f|0)?e:0;x=+g[D+20+(P<<3)>>2];u=+g[D+20+(P<<3)+4>>2];v=G+(J*x-I*u);w=H+(I*x+J*u);e=(g[k>>2]=v,c[k>>2]|0);f=(g[k>>2]=w,c[k>>2]|0)|0;c[o>>2]=0|e;c[o+4>>2]=f;f=E&255;o=n+8|0;e=o;a[o]=f;o=P&255;a[e+1|0]=o;a[e+2|0]=1;a[e+3|0]=0;e=h+12|0;u=+g[D+20+(l<<3)>>2];x=+g[D+20+(l<<3)+4>>2];y=G+(J*u-I*x);z=H+(I*u+J*x);D=e;P=(g[k>>2]=y,c[k>>2]|0);m=(g[k>>2]=z,c[k>>2]|0)|0;c[D>>2]=0|P;c[D+4>>2]=m;m=h+20|0;h=m;a[m]=f;a[h+1|0]=l&255;a[h+2|0]=1;a[h+3|0]=0;h=E+1|0;l=(h|0)<(d|0)?h:0;h=C+20+(E<<3)|0;E=c[h+4>>2]|0;x=(c[k>>2]=c[h>>2]|0,+g[k>>2]);u=(c[k>>2]=E,+g[k>>2]);E=C+20+(l<<3)|0;C=c[E+4>>2]|0;A=(c[k>>2]=c[E>>2]|0,+g[k>>2]);R=(c[k>>2]=C,+g[k>>2]);S=A-x;T=R-u;U=+Q(+(S*S+T*T));if(U<1.1920928955078125e-7){V=S;W=T}else{X=1.0/U;V=S*X;W=T*X}X=N*V-M*W;T=N*W+M*V;S=X*-1.0;U=K+(N*x-M*u);Y=L+(M*x+N*u);Z=U*T+Y*S;_=s-(U*X+Y*T);Y=s+((K+(N*A-M*R))*X+(L+(M*A+N*R))*T);N=-0.0-X;M=-0.0-T;L=v*N+w*M-_;K=y*N+z*M-_;if(L>0.0){$=0}else{C=p;E=n;c[C>>2]=c[E>>2]|0;c[C+4>>2]=c[E+4>>2]|0;c[C+8>>2]=c[E+8>>2]|0;$=1}if(K>0.0){aa=$}else{E=p+($*12&-1)|0;C=e;c[E>>2]=c[C>>2]|0;c[E+4>>2]=c[C+4>>2]|0;c[E+8>>2]=c[C+8>>2]|0;aa=$+1|0}if(L*K<0.0){_=L/(L-K);$=p+(aa*12&-1)|0;C=(g[k>>2]=v+_*(y-v),c[k>>2]|0);E=(g[k>>2]=w+_*(z-w),c[k>>2]|0)|0;c[$>>2]=0|C;c[$+4>>2]=E;E=p+(aa*12&-1)+8|0;$=E;a[E]=f;a[$+1|0]=o;a[$+2|0]=0;a[$+3|0]=1;ab=aa+1|0}else{ab=aa}if((ab|0)<2){i=j;return}w=+g[p>>2];z=+g[p+4>>2];_=X*w+T*z-Y;ab=p+12|0;v=+g[ab>>2];y=+g[p+16>>2];K=X*v+T*y-Y;if(_>0.0){ac=0}else{aa=q;$=p;c[aa>>2]=c[$>>2]|0;c[aa+4>>2]=c[$+4>>2]|0;c[aa+8>>2]=c[$+8>>2]|0;ac=1}if(K>0.0){ad=ac}else{$=q+(ac*12&-1)|0;aa=ab;c[$>>2]=c[aa>>2]|0;c[$+4>>2]=c[aa+4>>2]|0;c[$+8>>2]=c[aa+8>>2]|0;ad=ac+1|0}if(_*K<0.0){Y=_/(_-K);ac=q+(ad*12&-1)|0;aa=(g[k>>2]=w+Y*(v-w),c[k>>2]|0);$=(g[k>>2]=z+Y*(y-z),c[k>>2]|0)|0;c[ac>>2]=0|aa;c[ac+4>>2]=$;$=q+(ad*12&-1)+8|0;ac=$;a[$]=l&255;a[ac+1|0]=a[(p+8|0)+1|0]|0;a[ac+2|0]=0;a[ac+3|0]=1;ae=ad+1|0}else{ae=ad}if((ae|0)<2){i=j;return}ae=b+40|0;ad=(g[k>>2]=W,c[k>>2]|0);ac=(g[k>>2]=V*-1.0,c[k>>2]|0)|0;c[ae>>2]=0|ad;c[ae+4>>2]=ac;ac=b+48|0;ae=(g[k>>2]=(x+A)*.5,c[k>>2]|0);ad=(g[k>>2]=(u+R)*.5,c[k>>2]|0)|0;c[ac>>2]=0|ae;c[ac+4>>2]=ad;R=+g[q>>2];u=+g[q+4>>2];ad=T*R+S*u-Z>s;do{if(F<<24>>24==0){if(ad){af=0}else{A=R-G;x=u-H;ac=b;ae=(g[k>>2]=J*A+I*x,c[k>>2]|0);p=(g[k>>2]=A*t+J*x,c[k>>2]|0)|0;c[ac>>2]=0|ae;c[ac+4>>2]=p;c[b+16>>2]=c[q+8>>2]|0;af=1}x=+g[q+12>>2];A=+g[q+16>>2];if(T*x+S*A-Z>s){ag=af;break}V=x-G;x=A-H;p=b+(af*20&-1)|0;ac=(g[k>>2]=J*V+I*x,c[k>>2]|0);ae=(g[k>>2]=V*t+J*x,c[k>>2]|0)|0;c[p>>2]=0|ac;c[p+4>>2]=ae;c[b+(af*20&-1)+16>>2]=c[q+20>>2]|0;ag=af+1|0}else{if(ad){ah=0}else{x=R-G;V=u-H;ae=b;p=(g[k>>2]=J*x+I*V,c[k>>2]|0);ac=(g[k>>2]=x*t+J*V,c[k>>2]|0)|0;c[ae>>2]=0|p;c[ae+4>>2]=ac;ac=b+16|0;ae=c[q+8>>2]|0;c[ac>>2]=ae;p=ac;a[ac]=ae>>>8&255;a[p+1|0]=ae&255;a[p+2|0]=ae>>>24&255;a[p+3|0]=ae>>>16&255;ah=1}V=+g[q+12>>2];x=+g[q+16>>2];if(T*V+S*x-Z>s){ag=ah;break}A=V-G;V=x-H;ae=b+(ah*20&-1)|0;p=(g[k>>2]=J*A+I*V,c[k>>2]|0);ac=(g[k>>2]=A*t+J*V,c[k>>2]|0)|0;c[ae>>2]=0|p;c[ae+4>>2]=ac;ac=b+(ah*20&-1)+16|0;ae=c[q+20>>2]|0;c[ac>>2]=ae;p=ac;a[ac]=ae>>>8&255;a[p+1|0]=ae&255;a[p+2|0]=ae>>>24&255;a[p+3|0]=ae>>>16&255;ag=ah+1|0}}while(0);c[r>>2]=ag;i=j;return}function cc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0.0,s=0,t=0.0,u=0,v=0,w=0,x=0;h=c[e+148>>2]|0;if((d|0)<=-1){bd(10264,32,18800,11704);return 0.0}if((c[a+148>>2]|0)<=(d|0)){bd(10264,32,18800,11704);return 0.0}i=+g[b+12>>2];j=+g[a+84+(d<<3)>>2];k=+g[b+8>>2];l=+g[a+84+(d<<3)+4>>2];m=i*j-k*l;n=j*k+i*l;l=+g[f+12>>2];j=+g[f+8>>2];o=l*m+j*n;p=l*n+m*(-0.0-j);L341:do{if((h|0)>0){q=0;r=3.4028234663852886e+38;s=0;while(1){t=o*+g[e+20+(q<<3)>>2]+p*+g[e+20+(q<<3)+4>>2];u=t<r;v=u?q:s;w=q+1|0;if((w|0)<(h|0)){q=w;r=u?t:r;s=v}else{x=v;break L341}}}else{x=0}}while(0);p=+g[a+20+(d<<3)>>2];o=+g[a+20+(d<<3)+4>>2];r=+g[e+20+(x<<3)>>2];t=+g[e+20+(x<<3)+4>>2];return+(m*(+g[f>>2]+(l*r-j*t)-(+g[b>>2]+(i*p-k*o)))+n*(r*j+l*t+ +g[f+4>>2]-(p*k+i*o+ +g[b+4>>2])))}function cd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0,z=0.0,A=0.0,B=0.0,C=0.0;e=i;i=i+8|0;f=e|0;h=d;j=c[h+4>>2]|0;l=+g[d+8>>2];m=(c[k>>2]=c[h>>2]|0,+g[k>>2]);n=l-m;l=+g[d+12>>2]- +g[d+4>>2];o=(c[k>>2]=j,+g[k>>2]);if(n>0.0){p=n}else{p=-0.0-n}if(l>0.0){q=l}else{q=-0.0-l}j=a|0;h=a+8|0;a=f;r=f+4|0;do{if(p<1.1920928955078125e-7){if(m<+g[j>>2]){s=0;i=e;return s|0}if(+g[h>>2]<m){s=0}else{t=3.4028234663852886e+38;u=-3.4028234663852886e+38;break}i=e;return s|0}else{v=1.0/n;w=v*(+g[j>>2]-m);x=v*(+g[h>>2]-m);y=w>x;v=y?x:w;z=y?w:x;if(v>-3.4028234663852886e+38){g[r>>2]=0.0;g[a>>2]=y?1.0:-1.0;A=v}else{A=-3.4028234663852886e+38}v=z>3.4028234663852886e+38?3.4028234663852886e+38:z;if(A>v){s=0}else{t=v;u=A;break}i=e;return s|0}}while(0);do{if(q<1.1920928955078125e-7){if(o<+g[j+4>>2]){s=0;i=e;return s|0}if(+g[h+4>>2]<o){s=0}else{B=u;break}i=e;return s|0}else{A=1.0/l;m=A*(+g[j+4>>2]-o);n=A*(+g[h+4>>2]-o);r=m>n;A=r?n:m;p=r?m:n;if(A>u){g[a>>2]=0.0;g[a+4>>2]=r?1.0:-1.0;C=A}else{C=u}if(C>(t<p?t:p)){s=0}else{B=C;break}i=e;return s|0}}while(0);if(B<0.0){s=0;i=e;return s|0}if(+g[d+16>>2]<B){s=0;i=e;return s|0}g[b+8>>2]=B;d=b;b=c[f+4>>2]|0;c[d>>2]=c[f>>2]|0;c[d+4>>2]=b;s=1;i=e;return s|0}function ce(a,b,d,e,f,h){a=a|0;b=b|0;d=d|0;e=+e;f=f|0;h=+h;var i=0,j=0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0,w=0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0.0;i=b+60|0;if((c[i>>2]|0)==0){return}j=c[b+56>>2]|0;if((j|0)==0){l=a|0;g[l>>2]=1.0;m=a+4|0;g[m>>2]=0.0;n=+g[d+12>>2];o=+g[b+48>>2];p=+g[d+8>>2];q=+g[b+52>>2];r=+g[d>>2]+(n*o-p*q);s=o*p+n*q+ +g[d+4>>2];q=+g[f+12>>2];n=+g[b>>2];p=+g[f+8>>2];o=+g[b+4>>2];t=+g[f>>2]+(q*n-p*o);u=n*p+q*o+ +g[f+4>>2];o=r-t;q=s-u;do{if(o*o+q*q>1.4210854715202004e-14){p=t-r;n=u-s;v=a;w=(g[k>>2]=p,c[k>>2]|0);x=(g[k>>2]=n,c[k>>2]|0)|0;c[v>>2]=0|w;c[v+4>>2]=x;y=+Q(+(p*p+n*n));if(y<1.1920928955078125e-7){z=p;A=n;break}B=1.0/y;y=p*B;g[l>>2]=y;p=n*B;g[m>>2]=p;z=y;A=p}else{z=1.0;A=0.0}}while(0);m=a+8|0;l=(g[k>>2]=(r+z*e+(t-z*h))*.5,c[k>>2]|0);x=(g[k>>2]=(s+A*e+(u-A*h))*.5,c[k>>2]|0)|0;c[m>>2]=0|l;c[m+4>>2]=x;return}else if((j|0)==1){x=d+12|0;A=+g[x>>2];u=+g[b+40>>2];m=d+8|0;s=+g[m>>2];z=+g[b+44>>2];t=A*u-s*z;r=u*s+A*z;l=a;v=(g[k>>2]=t,c[k>>2]|0);w=(g[k>>2]=r,c[k>>2]|0)|0;c[l>>2]=0|v;c[l+4>>2]=w;z=+g[x>>2];A=+g[b+48>>2];s=+g[m>>2];u=+g[b+52>>2];q=+g[d>>2]+(z*A-s*u);o=A*s+z*u+ +g[d+4>>2];if((c[i>>2]|0)<=0){return}m=f+12|0;x=f+8|0;w=f|0;l=f+4|0;v=a|0;C=a+4|0;D=0;u=t;t=r;while(1){r=+g[m>>2];z=+g[b+(D*20&-1)>>2];s=+g[x>>2];A=+g[b+(D*20&-1)+4>>2];p=+g[w>>2]+(r*z-s*A);y=z*s+r*A+ +g[l>>2];A=e-(u*(p-q)+(y-o)*t);E=a+8+(D<<3)|0;F=(g[k>>2]=(p-u*h+(p+u*A))*.5,c[k>>2]|0);G=(g[k>>2]=(y-t*h+(y+t*A))*.5,c[k>>2]|0)|0;c[E>>2]=0|F;c[E+4>>2]=G;G=D+1|0;if((G|0)>=(c[i>>2]|0)){break}D=G;u=+g[v>>2];t=+g[C>>2]}return}else if((j|0)==2){j=f+12|0;t=+g[j>>2];u=+g[b+40>>2];C=f+8|0;o=+g[C>>2];q=+g[b+44>>2];A=t*u-o*q;y=u*o+t*q;v=a;D=(g[k>>2]=A,c[k>>2]|0);l=(g[k>>2]=y,c[k>>2]|0)|0;c[v>>2]=0|D;c[v+4>>2]=l;q=+g[j>>2];t=+g[b+48>>2];o=+g[C>>2];u=+g[b+52>>2];p=+g[f>>2]+(q*t-o*u);r=t*o+q*u+ +g[f+4>>2];L403:do{if((c[i>>2]|0)>0){f=d+12|0;C=d+8|0;j=d|0;l=d+4|0;D=a|0;w=a+4|0;x=0;u=A;q=y;while(1){o=+g[f>>2];t=+g[b+(x*20&-1)>>2];s=+g[C>>2];z=+g[b+(x*20&-1)+4>>2];B=+g[j>>2]+(o*t-s*z);n=t*s+o*z+ +g[l>>2];z=h-(u*(B-p)+(n-r)*q);m=a+8+(x<<3)|0;G=(g[k>>2]=(B-u*e+(B+u*z))*.5,c[k>>2]|0);E=(g[k>>2]=(n-q*e+(n+q*z))*.5,c[k>>2]|0)|0;c[m>>2]=0|G;c[m+4>>2]=E;E=x+1|0;z=+g[D>>2];n=+g[w>>2];if((E|0)<(c[i>>2]|0)){x=E;u=z;q=n}else{H=z;I=n;break L403}}}else{H=A;I=y}}while(0);i=(g[k>>2]=-0.0-H,c[k>>2]|0);a=(g[k>>2]=-0.0-I,c[k>>2]|0)|0;c[v>>2]=0|i;c[v+4>>2]=a;return}else{return}}function cf(a){a=a|0;var b=0,d=0,e=0.0,f=0.0,h=0,i=0.0,j=0.0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0;b=a+16|0;d=c[b+4>>2]|0;e=(c[k>>2]=c[b>>2]|0,+g[k>>2]);f=(c[k>>2]=d,+g[k>>2]);d=a+36|0;b=a+52|0;h=c[b+4>>2]|0;i=(c[k>>2]=c[b>>2]|0,+g[k>>2]);j=(c[k>>2]=h,+g[k>>2]);h=a+72|0;b=a+88|0;l=c[b+4>>2]|0;m=(c[k>>2]=c[b>>2]|0,+g[k>>2]);n=(c[k>>2]=l,+g[k>>2]);o=i-e;p=j-f;q=e*o+f*p;r=i*o+j*p;s=m-e;t=n-f;u=e*s+f*t;v=m*s+n*t;w=m-i;x=n-j;y=i*w+j*x;z=m*w+n*x;x=o*t-p*s;s=(i*n-j*m)*x;p=(f*m-e*n)*x;n=(e*j-f*i)*x;if(!(q<-0.0|u<-0.0)){g[a+24>>2]=1.0;c[a+108>>2]=1;return}if(!(q>=-0.0|r<=0.0|n>0.0)){x=1.0/(r-q);g[a+24>>2]=r*x;g[a+60>>2]=x*(-0.0-q);c[a+108>>2]=2;return}if(!(u>=-0.0|v<=0.0|p>0.0)){q=1.0/(v-u);g[a+24>>2]=v*q;g[a+96>>2]=q*(-0.0-u);c[a+108>>2]=2;vq(d|0,h|0,36);return}if(!(r>0.0|y<-0.0)){g[a+60>>2]=1.0;c[a+108>>2]=1;vq(a|0,d|0,36);return}if(!(v>0.0|z>0.0)){g[a+96>>2]=1.0;c[a+108>>2]=1;vq(a|0,h|0,36);return}if(y>=-0.0|z<=0.0|s>0.0){v=1.0/(n+(s+p));g[a+24>>2]=s*v;g[a+60>>2]=p*v;g[a+96>>2]=n*v;c[a+108>>2]=3;return}else{v=1.0/(z-y);g[a+60>>2]=z*v;g[a+96>>2]=v*(-0.0-y);c[a+108>>2]=2;vq(a|0,h|0,36);return}}function cg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0;e=c[b+4>>2]|0;if((e|0)==2){c[a+16>>2]=b+20|0;c[a+20>>2]=c[b+148>>2]|0;g[a+24>>2]=+g[b+8>>2];return}else if((e|0)==0){c[a+16>>2]=b+12|0;c[a+20>>2]=1;g[a+24>>2]=+g[b+8>>2];return}else if((e|0)==3){if((d|0)<=-1){bd(5304,53,17648,10824)}f=b+16|0;if((c[f>>2]|0)<=(d|0)){bd(5304,53,17648,10824)}h=b+12|0;i=(c[h>>2]|0)+(d<<3)|0;j=a;k=c[i+4>>2]|0;c[j>>2]=c[i>>2]|0;c[j+4>>2]=k;k=d+1|0;d=a+8|0;j=c[h>>2]|0;if((k|0)<(c[f>>2]|0)){f=j+(k<<3)|0;k=d;h=c[f+4>>2]|0;c[k>>2]=c[f>>2]|0;c[k+4>>2]=h}else{h=j;j=d;d=c[h+4>>2]|0;c[j>>2]=c[h>>2]|0;c[j+4>>2]=d}c[a+16>>2]=a|0;c[a+20>>2]=2;g[a+24>>2]=+g[b+8>>2];return}else if((e|0)==1){c[a+16>>2]=b+12|0;c[a+20>>2]=2;g[a+24>>2]=+g[b+8>>2];return}else{bd(5304,81,17648,11592)}}function ch(d,e,f){d=d|0;e=e|0;f=f|0;var h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0.0,v=0.0,w=0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0,E=0.0,F=0.0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,R=0,S=0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0,$=0,aa=0.0,ab=0.0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0.0,ar=0.0,as=0.0;h=i;i=i+176|0;j=h|0;l=h+16|0;m=h+32|0;n=h+144|0;o=h+160|0;c[1044]=(c[1044]|0)+1|0;p=j;q=f+56|0;c[p>>2]=c[q>>2]|0;c[p+4>>2]=c[q+4>>2]|0;c[p+8>>2]=c[q+8>>2]|0;c[p+12>>2]=c[q+12>>2]|0;q=l;p=f+72|0;c[q>>2]=c[p>>2]|0;c[q+4>>2]=c[p+4>>2]|0;c[q+8>>2]=c[p+8>>2]|0;c[q+12>>2]=c[p+12>>2]|0;ci(m,e,f|0,j,f+28|0,l);p=m|0;q=m+108|0;r=c[q>>2]|0;if((r|0)==1|(r|0)==2|(r|0)==3){s=m+16|0;t=m+20|0;u=+g[j+12>>2];v=+g[j+8>>2];w=f+16|0;x=f+20|0;y=+g[j>>2];z=+g[j+4>>2];A=+g[l+12>>2];B=+g[l+8>>2];C=-0.0-B;j=f+44|0;D=f+48|0;E=+g[l>>2];F=+g[l+4>>2];l=m+52|0;G=m+56|0;H=m+16|0;I=m+52|0;J=m+24|0;K=m+60|0;L=m;M=m+36|0;N=0;O=r;L460:while(1){P=(O|0)>0;L462:do{if(P){R=0;while(1){c[n+(R<<2)>>2]=c[p+(R*36&-1)+28>>2]|0;c[o+(R<<2)>>2]=c[p+(R*36&-1)+32>>2]|0;S=R+1|0;if((S|0)<(O|0)){R=S}else{break L462}}}}while(0);do{if((O|0)==2){R=c[H+4>>2]|0;T=(c[k>>2]=c[H>>2]|0,+g[k>>2]);U=(c[k>>2]=R,+g[k>>2]);R=c[I+4>>2]|0;V=(c[k>>2]=c[I>>2]|0,+g[k>>2]);W=(c[k>>2]=R,+g[k>>2]);X=V-T;Y=W-U;Z=T*X+U*Y;if(Z>=-0.0){g[J>>2]=1.0;c[q>>2]=1;_=356;break}U=V*X+W*Y;if(U>0.0){Y=1.0/(U-Z);g[J>>2]=U*Y;g[K>>2]=Y*(-0.0-Z);c[q>>2]=2;_=357;break}else{g[K>>2]=1.0;c[q>>2]=1;vq(L|0,M|0,36);_=356;break}}else if((O|0)==3){cf(m);R=c[q>>2]|0;if((R|0)==0){_=354;break L460}else if((R|0)==1){_=356;break}else if((R|0)==2){_=357;break}else if((R|0)==3){$=N;_=381;break L460}else{_=355;break L460}}else if((O|0)==1){_=356}else{_=352;break L460}}while(0);do{if((_|0)==356){_=0;aa=-0.0- +g[s>>2];ab=-0.0- +g[t>>2];ac=1}else if((_|0)==357){_=0;Z=+g[s>>2];Y=+g[l>>2]-Z;U=+g[t>>2];W=+g[G>>2]-U;if(Y*(-0.0-U)-W*(-0.0-Z)>0.0){aa=W*-1.0;ab=Y;ac=2;break}else{aa=W;ab=Y*-1.0;ac=2;break}}}while(0);if(ab*ab+aa*aa<1.4210854715202004e-14){$=N;_=381;break}R=p+(ac*36&-1)|0;Y=-0.0-ab;W=u*(-0.0-aa)+v*Y;Z=u*Y+aa*v;S=c[w>>2]|0;ad=c[x>>2]|0;if((ad|0)>1){Y=Z*+g[S+4>>2]+W*+g[S>>2];ae=1;af=0;while(1){U=W*+g[S+(ae<<3)>>2]+Z*+g[S+(ae<<3)+4>>2];ag=U>Y;ah=ag?ae:af;ai=ae+1|0;if((ai|0)<(ad|0)){Y=ag?U:Y;ae=ai;af=ah}else{break}}af=p+(ac*36&-1)+28|0;c[af>>2]=ah;if((ah|0)>-1){aj=ah;ak=af}else{_=395;break}}else{af=p+(ac*36&-1)+28|0;c[af>>2]=0;aj=0;ak=af}if((ad|0)<=(aj|0)){_=396;break}Y=+g[S+(aj<<3)>>2];Z=+g[S+(aj<<3)+4>>2];W=y+(u*Y-v*Z);af=R;ae=(g[k>>2]=W,c[k>>2]|0);ai=(g[k>>2]=Y*v+u*Z+z,c[k>>2]|0)|0;c[af>>2]=0|ae;c[af+4>>2]=ai;Z=aa*A+ab*B;Y=ab*A+aa*C;ai=c[j>>2]|0;af=c[D>>2]|0;if((af|0)>1){U=Y*+g[ai+4>>2]+Z*+g[ai>>2];ae=1;ag=0;while(1){X=Z*+g[ai+(ae<<3)>>2]+Y*+g[ai+(ae<<3)+4>>2];al=X>U;am=al?ae:ag;an=ae+1|0;if((an|0)<(af|0)){U=al?X:U;ae=an;ag=am}else{break}}ag=p+(ac*36&-1)+32|0;c[ag>>2]=am;if((am|0)>-1){ao=am;ap=ag}else{_=397;break}}else{ag=p+(ac*36&-1)+32|0;c[ag>>2]=0;ao=0;ap=ag}if((af|0)<=(ao|0)){_=398;break}U=+g[ai+(ao<<3)>>2];Y=+g[ai+(ao<<3)+4>>2];Z=E+(A*U-B*Y);ag=p+(ac*36&-1)+8|0;ae=(g[k>>2]=Z,c[k>>2]|0);R=(g[k>>2]=U*B+A*Y+F,c[k>>2]|0)|0;c[ag>>2]=0|ae;c[ag+4>>2]=R;Y=+g[p+(ac*36&-1)+12>>2]- +g[p+(ac*36&-1)+4>>2];R=p+(ac*36&-1)+16|0;ag=(g[k>>2]=Z-W,c[k>>2]|0);ae=(g[k>>2]=Y,c[k>>2]|0)|0;c[R>>2]=0|ag;c[R+4>>2]=ae;ae=N+1|0;c[1042]=(c[1042]|0)+1|0;L499:do{if(P){R=c[ak>>2]|0;ag=0;while(1){if((R|0)==(c[n+(ag<<2)>>2]|0)){if((c[ap>>2]|0)==(c[o+(ag<<2)>>2]|0)){$=ae;_=381;break L460}}S=ag+1|0;if((S|0)<(O|0)){ag=S}else{break L499}}}}while(0);P=(c[q>>2]|0)+1|0;c[q>>2]=P;if((ae|0)<20){N=ae;O=P}else{$=ae;_=381;break}}if((_|0)==352){bd(5304,498,19160,11592)}else if((_|0)==354){bd(5304,194,13608,11592)}else if((_|0)==355){bd(5304,207,13608,11592)}else if((_|0)==381){O=c[1040]|0;c[1040]=(O|0)>($|0)?O:$;O=d+8|0;cj(m,d|0,O);N=d|0;o=O|0;F=+g[N>>2]- +g[o>>2];ap=d+4|0;n=d+12|0;A=+g[ap>>2]- +g[n>>2];ak=d+16|0;g[ak>>2]=+Q(+(F*F+A*A));c[d+20>>2]=$;$=c[q>>2]|0;if(($|0)==0){bd(5304,246,13504,11592)}else if(($|0)==2){A=+g[s>>2]- +g[l>>2];F=+g[t>>2]- +g[G>>2];aq=+Q(+(A*A+F*F))}else if(($|0)==3){F=+g[s>>2];A=+g[t>>2];aq=(+g[l>>2]-F)*(+g[m+92>>2]-A)-(+g[G>>2]-A)*(+g[m+88>>2]-F)}else if(($|0)==1){aq=0.0}else{bd(5304,259,13504,11592)}g[e>>2]=aq;b[e+4>>1]=$&65535;m=0;while(1){a[m+(e+6)|0]=c[p+(m*36&-1)+28>>2]&255;a[m+(e+9)|0]=c[p+(m*36&-1)+32>>2]&255;G=m+1|0;if((G|0)<($|0)){m=G}else{break}}if((a[f+88|0]&1)<<24>>24==0){i=h;return}aq=+g[f+24>>2];F=+g[f+52>>2];A=+g[ak>>2];B=aq+F;if(!(A>B&A>1.1920928955078125e-7)){E=(+g[ap>>2]+ +g[n>>2])*.5;f=d;d=(g[k>>2]=(+g[N>>2]+ +g[o>>2])*.5,c[k>>2]|0);m=0|d;d=(g[k>>2]=E,c[k>>2]|0)|0;c[f>>2]=m;c[f+4>>2]=d;f=O;c[f>>2]=m;c[f+4>>2]=d;g[ak>>2]=0.0;i=h;return}g[ak>>2]=A-B;B=+g[o>>2];A=+g[N>>2];E=B-A;C=+g[n>>2];aa=+g[ap>>2];ab=C-aa;z=+Q(+(E*E+ab*ab));if(z<1.1920928955078125e-7){ar=E;as=ab}else{u=1.0/z;ar=E*u;as=ab*u}g[N>>2]=aq*ar+A;g[ap>>2]=aq*as+aa;g[o>>2]=B-F*ar;g[n>>2]=C-F*as;i=h;return}else if((_|0)==395){bd(7536,103,13816,6368)}else if((_|0)==396){bd(7536,103,13816,6368)}else if((_|0)==397){bd(7536,103,13816,6368)}else if((_|0)==398){bd(7536,103,13816,6368)}}else if((r|0)==0){bd(5304,194,13608,11592)}else{bd(5304,207,13608,11592)}}function ci(a,e,f,h,i,j){a=a|0;e=e|0;f=f|0;h=h|0;i=i|0;j=j|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0;l=b[e+4>>1]|0;if((l&65535)>=4){bd(5304,102,14776,5808)}m=l&65535;n=a+108|0;c[n>>2]=m;o=a|0;L542:do{if(l<<16>>16==0){p=m}else{q=f+20|0;r=f+16|0;s=i+20|0;t=i+16|0;u=h+12|0;v=h+8|0;w=h|0;x=h+4|0;y=j+12|0;z=j+8|0;A=j|0;B=j+4|0;C=0;while(1){D=d[C+(e+6)|0]|0;c[o+(C*36&-1)+28>>2]=D;E=d[C+(e+9)|0]|0;c[o+(C*36&-1)+32>>2]=E;if((c[q>>2]|0)<=(D|0)){F=407;break}G=(c[r>>2]|0)+(D<<3)|0;D=c[G+4>>2]|0;H=(c[k>>2]=c[G>>2]|0,+g[k>>2]);I=(c[k>>2]=D,+g[k>>2]);if((c[s>>2]|0)<=(E|0)){F=409;break}D=(c[t>>2]|0)+(E<<3)|0;E=c[D+4>>2]|0;J=(c[k>>2]=c[D>>2]|0,+g[k>>2]);K=(c[k>>2]=E,+g[k>>2]);L=+g[u>>2];M=+g[v>>2];N=+g[w>>2]+(H*L-I*M);O=I*L+H*M+ +g[x>>2];E=o+(C*36&-1)|0;D=(g[k>>2]=N,c[k>>2]|0);G=(g[k>>2]=O,c[k>>2]|0)|0;c[E>>2]=0|D;c[E+4>>2]=G;O=+g[y>>2];M=+g[z>>2];H=+g[A>>2]+(J*O-K*M);L=K*O+J*M+ +g[B>>2];G=o+(C*36&-1)+8|0;E=(g[k>>2]=H,c[k>>2]|0);D=(g[k>>2]=L,c[k>>2]|0)|0;c[G>>2]=0|E;c[G+4>>2]=D;L=+g[o+(C*36&-1)+12>>2]- +g[o+(C*36&-1)+4>>2];D=o+(C*36&-1)+16|0;G=(g[k>>2]=H-N,c[k>>2]|0);E=(g[k>>2]=L,c[k>>2]|0)|0;c[D>>2]=0|G;c[D+4>>2]=E;g[o+(C*36&-1)+24>>2]=0.0;E=C+1|0;D=c[n>>2]|0;if((E|0)<(D|0)){C=E}else{p=D;break L542}}if((F|0)==407){bd(7536,103,13816,6368)}else if((F|0)==409){bd(7536,103,13816,6368)}}}while(0);do{if((p|0)>1){L=+g[e>>2];if((p|0)==2){N=+g[a+16>>2]- +g[a+52>>2];H=+g[a+20>>2]- +g[a+56>>2];P=+Q(+(N*N+H*H))}else if((p|0)==3){H=+g[a+16>>2];N=+g[a+20>>2];P=(+g[a+52>>2]-H)*(+g[a+92>>2]-N)-(+g[a+56>>2]-N)*(+g[a+88>>2]-H)}else{bd(5304,259,13504,11592)}if(P>=L*.5){if(!(L*2.0<P|P<1.1920928955078125e-7)){F=419;break}}c[n>>2]=0;break}else{F=419}}while(0);do{if((F|0)==419){if((p|0)==0){break}return}}while(0);c[a+28>>2]=0;c[a+32>>2]=0;if((c[f+20>>2]|0)<=0){bd(7536,103,13816,6368)}p=c[f+16>>2]|0;f=c[p+4>>2]|0;P=(c[k>>2]=c[p>>2]|0,+g[k>>2]);L=(c[k>>2]=f,+g[k>>2]);if((c[i+20>>2]|0)<=0){bd(7536,103,13816,6368)}f=c[i+16>>2]|0;i=c[f+4>>2]|0;H=(c[k>>2]=c[f>>2]|0,+g[k>>2]);N=(c[k>>2]=i,+g[k>>2]);M=+g[h+12>>2];J=+g[h+8>>2];O=+g[h>>2]+(P*M-L*J);K=L*M+P*J+ +g[h+4>>2];h=a;i=(g[k>>2]=O,c[k>>2]|0);f=(g[k>>2]=K,c[k>>2]|0)|0;c[h>>2]=0|i;c[h+4>>2]=f;J=+g[j+12>>2];P=+g[j+8>>2];M=+g[j>>2]+(H*J-N*P);L=N*J+H*P+ +g[j+4>>2];j=a+8|0;f=(g[k>>2]=M,c[k>>2]|0);h=(g[k>>2]=L,c[k>>2]|0)|0;c[j>>2]=0|f;c[j+4>>2]=h;h=a+16|0;a=(g[k>>2]=M-O,c[k>>2]|0);j=(g[k>>2]=L-K,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=j;c[n>>2]=1;return}function cj(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0;e=c[a+108>>2]|0;if((e|0)==0){bd(5304,217,13544,11592)}else if((e|0)==1){f=a;h=b;i=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=i;i=a+8|0;h=d;f=c[i+4>>2]|0;c[h>>2]=c[i>>2]|0;c[h+4>>2]=f;return}else if((e|0)==2){f=a+24|0;j=+g[f>>2];h=a+60|0;l=+g[h>>2];m=j*+g[a+4>>2]+l*+g[a+40>>2];i=b;n=(g[k>>2]=j*+g[a>>2]+l*+g[a+36>>2],c[k>>2]|0);o=(g[k>>2]=m,c[k>>2]|0)|0;c[i>>2]=0|n;c[i+4>>2]=o;m=+g[f>>2];l=+g[h>>2];j=m*+g[a+12>>2]+l*+g[a+48>>2];h=d;f=(g[k>>2]=m*+g[a+8>>2]+l*+g[a+44>>2],c[k>>2]|0);o=(g[k>>2]=j,c[k>>2]|0)|0;c[h>>2]=0|f;c[h+4>>2]=o;return}else if((e|0)==3){j=+g[a+24>>2];l=+g[a+60>>2];m=+g[a+96>>2];p=j*+g[a+4>>2]+l*+g[a+40>>2]+m*+g[a+76>>2];e=b;b=(g[k>>2]=j*+g[a>>2]+l*+g[a+36>>2]+m*+g[a+72>>2],c[k>>2]|0);a=0|b;b=(g[k>>2]=p,c[k>>2]|0)|0;c[e>>2]=a;c[e+4>>2]=b;e=d;c[e>>2]=a;c[e+4>>2]=b;return}else{bd(5304,236,13544,11592)}}function ck(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;b=a+16|0;d=c[b>>2]|0;if((d|0)==-1){e=a+8|0;f=c[e>>2]|0;g=a+12|0;if((f|0)!=(c[g>>2]|0)){bd(11392,61,18232,12440);return 0}h=a+4|0;i=c[h>>2]|0;c[g>>2]=f<<1;j=vi(f*72&-1)|0;c[h>>2]=j;f=i;vq(j|0,f|0,(c[e>>2]|0)*36&-1);vj(f);f=c[e>>2]|0;j=(c[g>>2]|0)-1|0;L590:do{if((f|0)<(j|0)){i=f;while(1){k=i+1|0;c[(c[h>>2]|0)+(i*36&-1)+20>>2]=k;c[(c[h>>2]|0)+(i*36&-1)+32>>2]=-1;l=(c[g>>2]|0)-1|0;if((k|0)<(l|0)){i=k}else{m=l;break L590}}}else{m=j}}while(0);c[(c[h>>2]|0)+(m*36&-1)+20>>2]=-1;c[(c[h>>2]|0)+(((c[g>>2]|0)-1|0)*36&-1)+32>>2]=-1;g=c[e>>2]|0;c[b>>2]=g;n=g;o=h;p=e}else{n=d;o=a+4|0;p=a+8|0}a=(c[o>>2]|0)+(n*36&-1)+20|0;c[b>>2]=c[a>>2]|0;c[a>>2]=-1;c[(c[o>>2]|0)+(n*36&-1)+24>>2]=-1;c[(c[o>>2]|0)+(n*36&-1)+28>>2]=-1;c[(c[o>>2]|0)+(n*36&-1)+32>>2]=0;c[(c[o>>2]|0)+(n*36&-1)+16>>2]=0;c[p>>2]=(c[p>>2]|0)+1|0;return n|0}function cl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0,G=0,H=0;d=a+24|0;c[d>>2]=(c[d>>2]|0)+1|0;d=a|0;e=c[d>>2]|0;if((e|0)==-1){c[d>>2]=b;c[(c[a+4>>2]|0)+(b*36&-1)+20>>2]=-1;return}f=a+4|0;h=c[f>>2]|0;i=+g[h+(b*36&-1)>>2];j=+g[h+(b*36&-1)+4>>2];l=+g[h+(b*36&-1)+8>>2];m=+g[h+(b*36&-1)+12>>2];n=c[h+(e*36&-1)+24>>2]|0;L600:do{if((n|0)==-1){o=e}else{p=e;q=n;while(1){r=c[h+(p*36&-1)+28>>2]|0;s=+g[h+(p*36&-1)+8>>2];t=+g[h+(p*36&-1)>>2];u=+g[h+(p*36&-1)+12>>2];v=+g[h+(p*36&-1)+4>>2];w=((s>l?s:l)-(t<i?t:i)+((u>m?u:m)-(v<j?v:j)))*2.0;x=w*2.0;y=(w-(s-t+(u-v))*2.0)*2.0;v=+g[h+(q*36&-1)>>2];u=i<v?i:v;t=+g[h+(q*36&-1)+4>>2];s=j<t?j:t;w=+g[h+(q*36&-1)+8>>2];z=l>w?l:w;A=+g[h+(q*36&-1)+12>>2];B=m>A?m:A;if((c[h+(q*36&-1)+24>>2]|0)==-1){C=(z-u+(B-s))*2.0}else{C=(z-u+(B-s))*2.0-(w-v+(A-t))*2.0}t=y+C;A=+g[h+(r*36&-1)>>2];v=i<A?i:A;w=+g[h+(r*36&-1)+4>>2];s=j<w?j:w;B=+g[h+(r*36&-1)+8>>2];u=l>B?l:B;z=+g[h+(r*36&-1)+12>>2];D=m>z?m:z;if((c[h+(r*36&-1)+24>>2]|0)==-1){E=(u-v+(D-s))*2.0}else{E=(u-v+(D-s))*2.0-(B-A+(z-w))*2.0}w=y+E;if(x<t&x<w){o=p;break L600}F=t<w?q:r;r=c[h+(F*36&-1)+24>>2]|0;if((r|0)==-1){o=F;break L600}else{p=F;q=r}}}}while(0);n=c[h+(o*36&-1)+20>>2]|0;h=ck(a)|0;c[(c[f>>2]|0)+(h*36&-1)+20>>2]=n;c[(c[f>>2]|0)+(h*36&-1)+16>>2]=0;e=c[f>>2]|0;E=+g[e+(o*36&-1)>>2];C=+g[e+(o*36&-1)+4>>2];q=e+(h*36&-1)|0;p=(g[k>>2]=i<E?i:E,c[k>>2]|0);r=(g[k>>2]=j<C?j:C,c[k>>2]|0)|0;c[q>>2]=0|p;c[q+4>>2]=r;C=+g[e+(o*36&-1)+8>>2];j=+g[e+(o*36&-1)+12>>2];r=e+(h*36&-1)+8|0;e=(g[k>>2]=l>C?l:C,c[k>>2]|0);q=(g[k>>2]=m>j?m:j,c[k>>2]|0)|0;c[r>>2]=0|e;c[r+4>>2]=q;q=c[f>>2]|0;c[q+(h*36&-1)+32>>2]=(c[q+(o*36&-1)+32>>2]|0)+1|0;q=c[f>>2]|0;if((n|0)==-1){c[q+(h*36&-1)+24>>2]=o;c[(c[f>>2]|0)+(h*36&-1)+28>>2]=b;c[(c[f>>2]|0)+(o*36&-1)+20>>2]=h;c[(c[f>>2]|0)+(b*36&-1)+20>>2]=h;c[d>>2]=h}else{d=q+(n*36&-1)+24|0;if((c[d>>2]|0)==(o|0)){c[d>>2]=h}else{c[q+(n*36&-1)+28>>2]=h}c[(c[f>>2]|0)+(h*36&-1)+24>>2]=o;c[(c[f>>2]|0)+(h*36&-1)+28>>2]=b;c[(c[f>>2]|0)+(o*36&-1)+20>>2]=h;c[(c[f>>2]|0)+(b*36&-1)+20>>2]=h}h=c[(c[f>>2]|0)+(b*36&-1)+20>>2]|0;if((h|0)==-1){return}else{G=h}while(1){h=cp(a,G)|0;b=c[f>>2]|0;o=c[b+(h*36&-1)+24>>2]|0;n=c[b+(h*36&-1)+28>>2]|0;if((o|0)==-1){H=465;break}if((n|0)==-1){H=467;break}q=c[b+(o*36&-1)+32>>2]|0;d=c[b+(n*36&-1)+32>>2]|0;c[b+(h*36&-1)+32>>2]=((q|0)>(d|0)?q:d)+1|0;d=c[f>>2]|0;j=+g[d+(o*36&-1)>>2];m=+g[d+(n*36&-1)>>2];C=+g[d+(o*36&-1)+4>>2];l=+g[d+(n*36&-1)+4>>2];q=d+(h*36&-1)|0;b=(g[k>>2]=j<m?j:m,c[k>>2]|0);r=(g[k>>2]=C<l?C:l,c[k>>2]|0)|0;c[q>>2]=0|b;c[q+4>>2]=r;l=+g[d+(o*36&-1)+8>>2];C=+g[d+(n*36&-1)+8>>2];m=+g[d+(o*36&-1)+12>>2];j=+g[d+(n*36&-1)+12>>2];n=d+(h*36&-1)+8|0;d=(g[k>>2]=l>C?l:C,c[k>>2]|0);o=(g[k>>2]=m>j?m:j,c[k>>2]|0)|0;c[n>>2]=0|d;c[n+4>>2]=o;o=c[(c[f>>2]|0)+(h*36&-1)+20>>2]|0;if((o|0)==-1){H=472;break}else{G=o}}if((H|0)==465){bd(11392,307,18272,5200)}else if((H|0)==467){bd(11392,308,18272,4936)}else if((H|0)==472){return}}function cm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;if((b|0)<=-1){bd(11392,126,18192,9904)}d=a+12|0;if((c[d>>2]|0)<=(b|0)){bd(11392,126,18192,9904)}e=a+4|0;if((c[(c[e>>2]|0)+(b*36&-1)+24>>2]|0)!=-1){bd(11392,127,18192,5720)}cn(a,b);if((c[d>>2]|0)<=(b|0)){bd(11392,97,18112,9768)}d=a+8|0;if((c[d>>2]|0)>0){f=a+16|0;c[(c[e>>2]|0)+(b*36&-1)+20>>2]=c[f>>2]|0;c[(c[e>>2]|0)+(b*36&-1)+32>>2]=-1;c[f>>2]=b;c[d>>2]=(c[d>>2]|0)-1|0;return}else{bd(11392,98,18112,7256)}}function cn(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0;d=a|0;if((c[d>>2]|0)==(b|0)){c[d>>2]=-1;return}e=a+4|0;f=c[e>>2]|0;h=c[f+(b*36&-1)+20>>2]|0;i=c[f+(h*36&-1)+20>>2]|0;j=c[f+(h*36&-1)+24>>2]|0;if((j|0)==(b|0)){l=c[f+(h*36&-1)+28>>2]|0}else{l=j}if((i|0)==-1){c[d>>2]=l;c[f+(l*36&-1)+20>>2]=-1;if((h|0)<=-1){bd(11392,97,18112,9768)}if((c[a+12>>2]|0)<=(h|0)){bd(11392,97,18112,9768)}d=a+8|0;if((c[d>>2]|0)<=0){bd(11392,98,18112,7256)}j=a+16|0;c[(c[e>>2]|0)+(h*36&-1)+20>>2]=c[j>>2]|0;c[(c[e>>2]|0)+(h*36&-1)+32>>2]=-1;c[j>>2]=h;c[d>>2]=(c[d>>2]|0)-1|0;return}d=f+(i*36&-1)+24|0;if((c[d>>2]|0)==(h|0)){c[d>>2]=l}else{c[f+(i*36&-1)+28>>2]=l}c[(c[e>>2]|0)+(l*36&-1)+20>>2]=i;if((h|0)<=-1){bd(11392,97,18112,9768)}if((c[a+12>>2]|0)<=(h|0)){bd(11392,97,18112,9768)}l=a+8|0;if((c[l>>2]|0)<=0){bd(11392,98,18112,7256)}f=a+16|0;c[(c[e>>2]|0)+(h*36&-1)+20>>2]=c[f>>2]|0;c[(c[e>>2]|0)+(h*36&-1)+32>>2]=-1;c[f>>2]=h;c[l>>2]=(c[l>>2]|0)-1|0;l=i;while(1){i=cp(a,l)|0;h=c[e>>2]|0;f=c[h+(i*36&-1)+24>>2]|0;d=c[h+(i*36&-1)+28>>2]|0;m=+g[h+(f*36&-1)>>2];n=+g[h+(d*36&-1)>>2];o=+g[h+(f*36&-1)+4>>2];p=+g[h+(d*36&-1)+4>>2];j=h+(i*36&-1)|0;b=(g[k>>2]=m<n?m:n,c[k>>2]|0);q=(g[k>>2]=o<p?o:p,c[k>>2]|0)|0;c[j>>2]=0|b;c[j+4>>2]=q;p=+g[h+(f*36&-1)+8>>2];o=+g[h+(d*36&-1)+8>>2];n=+g[h+(f*36&-1)+12>>2];m=+g[h+(d*36&-1)+12>>2];q=h+(i*36&-1)+8|0;h=(g[k>>2]=p>o?p:o,c[k>>2]|0);j=(g[k>>2]=n>m?n:m,c[k>>2]|0)|0;c[q>>2]=0|h;c[q+4>>2]=j;j=c[e>>2]|0;q=c[j+(f*36&-1)+32>>2]|0;f=c[j+(d*36&-1)+32>>2]|0;c[j+(i*36&-1)+32>>2]=((q|0)>(f|0)?q:f)+1|0;f=c[(c[e>>2]|0)+(i*36&-1)+20>>2]|0;if((f|0)==-1){break}else{l=f}}return}function co(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0;if((b|0)<=-1){bd(11392,135,18040,9904);return 0}if((c[a+12>>2]|0)<=(b|0)){bd(11392,135,18040,9904);return 0}f=a+4|0;h=c[f>>2]|0;if((c[h+(b*36&-1)+24>>2]|0)!=-1){bd(11392,137,18040,5720);return 0}do{if(+g[h+(b*36&-1)>>2]<=+g[d>>2]){if(+g[h+(b*36&-1)+4>>2]>+g[d+4>>2]){break}if(+g[d+8>>2]>+g[h+(b*36&-1)+8>>2]){break}if(+g[d+12>>2]>+g[h+(b*36&-1)+12>>2]){break}else{i=0}return i|0}}while(0);cn(a,b);h=d;j=c[h+4>>2]|0;l=(c[k>>2]=c[h>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);j=d+8|0;d=c[j+4>>2]|0;n=(c[k>>2]=c[j>>2]|0,+g[k>>2]);o=l+-.10000000149011612;l=m+-.10000000149011612;m=n+.10000000149011612;n=(c[k>>2]=d,+g[k>>2])+.10000000149011612;p=+g[e>>2]*2.0;q=+g[e+4>>2]*2.0;if(p<0.0){r=m;s=o+p}else{r=p+m;s=o}if(q<0.0){t=n;u=l+q}else{t=q+n;u=l}e=c[f>>2]|0;f=e+(b*36&-1)|0;d=(g[k>>2]=s,c[k>>2]|0);j=(g[k>>2]=u,c[k>>2]|0)|0;c[f>>2]=0|d;c[f+4>>2]=j;j=e+(b*36&-1)+8|0;e=(g[k>>2]=r,c[k>>2]|0);f=(g[k>>2]=t,c[k>>2]|0)|0;c[j>>2]=0|e;c[j+4>>2]=f;cl(a,b);i=1;return i|0}function cp(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0.0,D=0.0,E=0.0,F=0,G=0,H=0.0,I=0.0,J=0,K=0;if((b|0)==-1){bd(11392,382,18152,4672);return 0}d=a+4|0;e=c[d>>2]|0;f=e+(b*36&-1)|0;h=e+(b*36&-1)+24|0;i=c[h>>2]|0;if((i|0)==-1){j=b;return j|0}l=e+(b*36&-1)+32|0;if((c[l>>2]|0)<2){j=b;return j|0}m=e+(b*36&-1)+28|0;n=c[m>>2]|0;if((i|0)<=-1){bd(11392,392,18152,4432);return 0}o=c[a+12>>2]|0;if((i|0)>=(o|0)){bd(11392,392,18152,4432);return 0}if(!((n|0)>-1&(n|0)<(o|0))){bd(11392,393,18152,12936);return 0}p=e+(i*36&-1)|0;q=e+(n*36&-1)|0;r=e+(n*36&-1)+32|0;s=e+(i*36&-1)+32|0;t=(c[r>>2]|0)-(c[s>>2]|0)|0;if((t|0)>1){u=e+(n*36&-1)+24|0;v=c[u>>2]|0;w=e+(n*36&-1)+28|0;x=c[w>>2]|0;y=e+(v*36&-1)|0;z=e+(x*36&-1)|0;if(!((v|0)>-1&(v|0)<(o|0))){bd(11392,407,18152,12728);return 0}if(!((x|0)>-1&(x|0)<(o|0))){bd(11392,408,18152,12328);return 0}c[u>>2]=b;u=e+(b*36&-1)+20|0;A=e+(n*36&-1)+20|0;c[A>>2]=c[u>>2]|0;c[u>>2]=n;u=c[A>>2]|0;do{if((u|0)==-1){c[a>>2]=n}else{A=c[d>>2]|0;B=A+(u*36&-1)+24|0;if((c[B>>2]|0)==(b|0)){c[B>>2]=n;break}B=A+(u*36&-1)+28|0;if((c[B>>2]|0)==(b|0)){c[B>>2]=n;break}else{bd(11392,424,18152,11552);return 0}}}while(0);u=e+(v*36&-1)+32|0;B=e+(x*36&-1)+32|0;if((c[u>>2]|0)>(c[B>>2]|0)){c[w>>2]=v;c[m>>2]=x;c[e+(x*36&-1)+20>>2]=b;C=+g[p>>2];D=+g[z>>2];E=C<D?C:D;D=+g[e+(i*36&-1)+4>>2];C=+g[e+(x*36&-1)+4>>2];A=f;F=(g[k>>2]=E,c[k>>2]|0);G=(g[k>>2]=D<C?D:C,c[k>>2]|0)|0;c[A>>2]=0|F;c[A+4>>2]=G;C=+g[e+(i*36&-1)+8>>2];D=+g[e+(x*36&-1)+8>>2];H=+g[e+(i*36&-1)+12>>2];I=+g[e+(x*36&-1)+12>>2];G=e+(b*36&-1)+8|0;A=(g[k>>2]=C>D?C:D,c[k>>2]|0);F=(g[k>>2]=H>I?H:I,c[k>>2]|0)|0;c[G>>2]=0|A;c[G+4>>2]=F;I=+g[y>>2];H=+g[e+(b*36&-1)+4>>2];D=+g[e+(v*36&-1)+4>>2];F=q;G=(g[k>>2]=E<I?E:I,c[k>>2]|0);A=(g[k>>2]=H<D?H:D,c[k>>2]|0)|0;c[F>>2]=0|G;c[F+4>>2]=A;D=+g[e+(b*36&-1)+8>>2];H=+g[e+(v*36&-1)+8>>2];I=+g[e+(b*36&-1)+12>>2];E=+g[e+(v*36&-1)+12>>2];A=e+(n*36&-1)+8|0;F=(g[k>>2]=D>H?D:H,c[k>>2]|0);G=(g[k>>2]=I>E?I:E,c[k>>2]|0)|0;c[A>>2]=0|F;c[A+4>>2]=G;G=c[s>>2]|0;A=c[B>>2]|0;F=((G|0)>(A|0)?G:A)+1|0;c[l>>2]=F;A=c[u>>2]|0;J=(F|0)>(A|0)?F:A}else{c[w>>2]=x;c[m>>2]=v;c[e+(v*36&-1)+20>>2]=b;E=+g[p>>2];I=+g[y>>2];H=E<I?E:I;I=+g[e+(i*36&-1)+4>>2];E=+g[e+(v*36&-1)+4>>2];y=f;m=(g[k>>2]=H,c[k>>2]|0);w=(g[k>>2]=I<E?I:E,c[k>>2]|0)|0;c[y>>2]=0|m;c[y+4>>2]=w;E=+g[e+(i*36&-1)+8>>2];I=+g[e+(v*36&-1)+8>>2];D=+g[e+(i*36&-1)+12>>2];C=+g[e+(v*36&-1)+12>>2];v=e+(b*36&-1)+8|0;w=(g[k>>2]=E>I?E:I,c[k>>2]|0);y=(g[k>>2]=D>C?D:C,c[k>>2]|0)|0;c[v>>2]=0|w;c[v+4>>2]=y;C=+g[z>>2];D=+g[e+(b*36&-1)+4>>2];I=+g[e+(x*36&-1)+4>>2];z=q;y=(g[k>>2]=H<C?H:C,c[k>>2]|0);v=(g[k>>2]=D<I?D:I,c[k>>2]|0)|0;c[z>>2]=0|y;c[z+4>>2]=v;I=+g[e+(b*36&-1)+8>>2];D=+g[e+(x*36&-1)+8>>2];C=+g[e+(b*36&-1)+12>>2];H=+g[e+(x*36&-1)+12>>2];x=e+(n*36&-1)+8|0;v=(g[k>>2]=I>D?I:D,c[k>>2]|0);z=(g[k>>2]=C>H?C:H,c[k>>2]|0)|0;c[x>>2]=0|v;c[x+4>>2]=z;z=c[s>>2]|0;x=c[u>>2]|0;u=((z|0)>(x|0)?z:x)+1|0;c[l>>2]=u;x=c[B>>2]|0;J=(u|0)>(x|0)?u:x}c[r>>2]=J+1|0;j=n;return j|0}if((t|0)>=-1){j=b;return j|0}t=e+(i*36&-1)+24|0;J=c[t>>2]|0;x=e+(i*36&-1)+28|0;u=c[x>>2]|0;B=e+(J*36&-1)|0;z=e+(u*36&-1)|0;if(!((J|0)>-1&(J|0)<(o|0))){bd(11392,467,18152,11296);return 0}if(!((u|0)>-1&(u|0)<(o|0))){bd(11392,468,18152,11200);return 0}c[t>>2]=b;t=e+(b*36&-1)+20|0;o=e+(i*36&-1)+20|0;c[o>>2]=c[t>>2]|0;c[t>>2]=i;t=c[o>>2]|0;do{if((t|0)==-1){c[a>>2]=i}else{o=c[d>>2]|0;v=o+(t*36&-1)+24|0;if((c[v>>2]|0)==(b|0)){c[v>>2]=i;break}v=o+(t*36&-1)+28|0;if((c[v>>2]|0)==(b|0)){c[v>>2]=i;break}else{bd(11392,484,18152,11e3);return 0}}}while(0);t=e+(J*36&-1)+32|0;d=e+(u*36&-1)+32|0;if((c[t>>2]|0)>(c[d>>2]|0)){c[x>>2]=J;c[h>>2]=u;c[e+(u*36&-1)+20>>2]=b;H=+g[q>>2];C=+g[z>>2];D=H<C?H:C;C=+g[e+(n*36&-1)+4>>2];H=+g[e+(u*36&-1)+4>>2];a=f;v=(g[k>>2]=D,c[k>>2]|0);o=(g[k>>2]=C<H?C:H,c[k>>2]|0)|0;c[a>>2]=0|v;c[a+4>>2]=o;H=+g[e+(n*36&-1)+8>>2];C=+g[e+(u*36&-1)+8>>2];I=+g[e+(n*36&-1)+12>>2];E=+g[e+(u*36&-1)+12>>2];o=e+(b*36&-1)+8|0;a=(g[k>>2]=H>C?H:C,c[k>>2]|0);v=(g[k>>2]=I>E?I:E,c[k>>2]|0)|0;c[o>>2]=0|a;c[o+4>>2]=v;E=+g[B>>2];I=+g[e+(b*36&-1)+4>>2];C=+g[e+(J*36&-1)+4>>2];v=p;o=(g[k>>2]=D<E?D:E,c[k>>2]|0);a=(g[k>>2]=I<C?I:C,c[k>>2]|0)|0;c[v>>2]=0|o;c[v+4>>2]=a;C=+g[e+(b*36&-1)+8>>2];I=+g[e+(J*36&-1)+8>>2];E=+g[e+(b*36&-1)+12>>2];D=+g[e+(J*36&-1)+12>>2];a=e+(i*36&-1)+8|0;v=(g[k>>2]=C>I?C:I,c[k>>2]|0);o=(g[k>>2]=E>D?E:D,c[k>>2]|0)|0;c[a>>2]=0|v;c[a+4>>2]=o;o=c[r>>2]|0;a=c[d>>2]|0;v=((o|0)>(a|0)?o:a)+1|0;c[l>>2]=v;a=c[t>>2]|0;K=(v|0)>(a|0)?v:a}else{c[x>>2]=u;c[h>>2]=J;c[e+(J*36&-1)+20>>2]=b;D=+g[q>>2];E=+g[B>>2];I=D<E?D:E;E=+g[e+(n*36&-1)+4>>2];D=+g[e+(J*36&-1)+4>>2];B=f;f=(g[k>>2]=I,c[k>>2]|0);q=(g[k>>2]=E<D?E:D,c[k>>2]|0)|0;c[B>>2]=0|f;c[B+4>>2]=q;D=+g[e+(n*36&-1)+8>>2];E=+g[e+(J*36&-1)+8>>2];C=+g[e+(n*36&-1)+12>>2];H=+g[e+(J*36&-1)+12>>2];J=e+(b*36&-1)+8|0;n=(g[k>>2]=D>E?D:E,c[k>>2]|0);q=(g[k>>2]=C>H?C:H,c[k>>2]|0)|0;c[J>>2]=0|n;c[J+4>>2]=q;H=+g[z>>2];C=+g[e+(b*36&-1)+4>>2];E=+g[e+(u*36&-1)+4>>2];z=p;p=(g[k>>2]=I<H?I:H,c[k>>2]|0);q=(g[k>>2]=C<E?C:E,c[k>>2]|0)|0;c[z>>2]=0|p;c[z+4>>2]=q;E=+g[e+(b*36&-1)+8>>2];C=+g[e+(u*36&-1)+8>>2];H=+g[e+(b*36&-1)+12>>2];I=+g[e+(u*36&-1)+12>>2];u=e+(i*36&-1)+8|0;e=(g[k>>2]=E>C?E:C,c[k>>2]|0);b=(g[k>>2]=H>I?H:I,c[k>>2]|0)|0;c[u>>2]=0|e;c[u+4>>2]=b;b=c[r>>2]|0;r=c[t>>2]|0;t=((b|0)>(r|0)?b:r)+1|0;c[l>>2]=t;l=c[d>>2]|0;K=(t|0)>(l|0)?t:l}c[s>>2]=K+1|0;j=i;return j|0}function cq(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;if((b|0)<=-1){bd(11392,563,14360,9768);return 0}if((c[a+12>>2]|0)<=(b|0)){bd(11392,563,14360,9768);return 0}d=c[a+4>>2]|0;e=c[d+(b*36&-1)+24>>2]|0;if((e|0)==-1){return 0}else{f=cq(a,e)|0;e=cq(a,c[d+(b*36&-1)+28>>2]|0)|0;return((f|0)>(e|0)?f:e)+1|0}return 0}function cr(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;if((b|0)==-1){return}d=a|0;e=a+4|0;f=a+12|0;g=b;while(1){h=c[e>>2]|0;if((c[d>>2]|0)==(g|0)){if((c[h+(g*36&-1)+20>>2]|0)!=-1){i=596;break}}b=c[h+(g*36&-1)+24>>2]|0;j=c[h+(g*36&-1)+28>>2]|0;if((b|0)==-1){i=598;break}if((b|0)<=-1){i=614;break}k=c[f>>2]|0;if((b|0)>=(k|0)){i=613;break}if(!((j|0)>-1&(j|0)<(k|0))){i=606;break}if((c[h+(b*36&-1)+20>>2]|0)!=(g|0)){i=608;break}if((c[h+(j*36&-1)+20>>2]|0)!=(g|0)){i=610;break}cr(a,b);if((j|0)==-1){i=616;break}else{g=j}}if((i|0)==614){bd(11392,607,14200,10024)}else if((i|0)==606){bd(11392,608,14200,9600)}else if((i|0)==596){bd(11392,591,14200,10680)}else if((i|0)==598){if((j|0)!=-1){bd(11392,602,14200,10448)}if((c[h+(g*36&-1)+32>>2]|0)==0){return}else{bd(11392,603,14200,10240)}}else if((i|0)==608){bd(11392,610,14200,9296)}else if((i|0)==610){bd(11392,611,14200,8896)}else if((i|0)==613){bd(11392,607,14200,10024)}else if((i|0)==616){return}}function cs(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;if((b|0)==-1){return}d=a+4|0;e=a+12|0;f=b;while(1){h=c[d>>2]|0;b=c[h+(f*36&-1)+24>>2]|0;i=c[h+(f*36&-1)+28>>2]|0;if((b|0)==-1){j=621;break}if((b|0)<=-1){j=641;break}k=c[e>>2]|0;if((b|0)>=(k|0)){j=640;break}if(!((i|0)>-1&(i|0)<(k|0))){j=629;break}k=c[h+(b*36&-1)+32>>2]|0;l=c[h+(i*36&-1)+32>>2]|0;if((c[h+(f*36&-1)+32>>2]|0)!=(((k|0)>(l|0)?k:l)+1|0)){j=631;break}m=+g[h+(b*36&-1)>>2];n=+g[h+(i*36&-1)>>2];o=+g[h+(b*36&-1)+4>>2];p=+g[h+(i*36&-1)+4>>2];q=+g[h+(b*36&-1)+8>>2];r=+g[h+(i*36&-1)+8>>2];s=+g[h+(b*36&-1)+12>>2];t=+g[h+(i*36&-1)+12>>2];if((m<n?m:n)!=+g[h+(f*36&-1)>>2]){j=643;break}if((o<p?o:p)!=+g[h+(f*36&-1)+4>>2]){j=642;break}if((q>r?q:r)!=+g[h+(f*36&-1)+8>>2]){j=647;break}if((s>t?s:t)!=+g[h+(f*36&-1)+12>>2]){j=648;break}cs(a,b);if((i|0)==-1){j=645;break}else{f=i}}if((j|0)==647){bd(11392,650,14256,8160)}else if((j|0)==643){bd(11392,649,14256,8392)}else if((j|0)==629){bd(11392,638,14256,9600)}else if((j|0)==631){bd(11392,644,14256,8744)}else if((j|0)==648){bd(11392,650,14256,8160)}else if((j|0)==621){if((i|0)!=-1){bd(11392,632,14256,10448)}if((c[h+(f*36&-1)+32>>2]|0)==0){return}else{bd(11392,633,14256,10240)}}else if((j|0)==645){return}else if((j|0)==640){bd(11392,637,14256,10024)}else if((j|0)==642){bd(11392,649,14256,8392)}else if((j|0)==641){bd(11392,637,14256,10024)}}function ct(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;b=a|0;cr(a,c[b>>2]|0);cs(a,c[b>>2]|0);d=c[a+16>>2]|0;L849:do{if((d|0)==-1){e=0}else{f=a+12|0;g=a+4|0;h=0;i=d;while(1){if((i|0)<=-1){j=663;break}if((i|0)>=(c[f>>2]|0)){j=662;break}k=h+1|0;l=c[(c[g>>2]|0)+(i*36&-1)+20>>2]|0;if((l|0)==-1){e=k;break L849}else{h=k;i=l}}if((j|0)==663){bd(11392,665,14064,7712)}else if((j|0)==662){bd(11392,665,14064,7712)}}}while(0);j=c[b>>2]|0;if((j|0)==-1){m=0}else{m=c[(c[a+4>>2]|0)+(j*36&-1)+32>>2]|0}if((m|0)!=(cq(a,j)|0)){bd(11392,670,14064,7680)}if(((c[a+8>>2]|0)+e|0)==(c[a+12>>2]|0)){return}else{bd(11392,672,14064,7488)}}function cu(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0,y=0,z=0.0,A=0,B=0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0,I=0,J=0.0,K=0,L=0,M=0,N=0,O=0;b=a+8|0;d=vi(c[b>>2]<<2)|0;e=d;f=a+12|0;if((c[f>>2]|0)<=0){h=c[e>>2]|0;i=a|0;c[i>>2]=h;vj(d);ct(a);return}j=a+4|0;l=a+16|0;m=0;n=0;L872:while(1){o=c[j>>2]|0;do{if((c[o+(m*36&-1)+32>>2]|0)<0){p=n}else{if((c[o+(m*36&-1)+24>>2]|0)==-1){c[o+(m*36&-1)+20>>2]=-1;c[e+(n<<2)>>2]=m;p=n+1|0;break}if((c[b>>2]|0)<=0){q=672;break L872}c[o+(m*36&-1)+20>>2]=c[l>>2]|0;c[(c[j>>2]|0)+(m*36&-1)+32>>2]=-1;c[l>>2]=m;c[b>>2]=(c[b>>2]|0)-1|0;p=n}}while(0);o=m+1|0;if((o|0)<(c[f>>2]|0)){m=o;n=p}else{break}}if((q|0)==672){bd(11392,98,18112,7256)}if((p|0)<=1){h=c[e>>2]|0;i=a|0;c[i>>2]=h;vj(d);ct(a);return}q=a+4|0;n=p;while(1){p=c[q>>2]|0;m=0;f=-1;b=-1;r=3.4028234663852886e+38;while(1){l=c[e+(m<<2)>>2]|0;s=+g[p+(l*36&-1)>>2];t=+g[p+(l*36&-1)+4>>2];u=+g[p+(l*36&-1)+8>>2];v=+g[p+(l*36&-1)+12>>2];l=m+1|0;j=(l|0)<(n|0);if(j){w=l;x=f;y=b;z=r}else{A=b;B=f;break}while(1){o=c[e+(w<<2)>>2]|0;C=+g[p+(o*36&-1)>>2];D=+g[p+(o*36&-1)+4>>2];E=+g[p+(o*36&-1)+8>>2];F=+g[p+(o*36&-1)+12>>2];G=((u>E?u:E)-(s<C?s:C)+((v>F?v:F)-(t<D?t:D)))*2.0;o=G<z;H=o?w:x;I=o?m:y;J=o?G:z;o=w+1|0;if((o|0)<(n|0)){w=o;x=H;y=I;z=J}else{break}}if(j){m=l;f=H;b=I;r=J}else{A=I;B=H;break}}b=e+(A<<2)|0;f=c[b>>2]|0;m=e+(B<<2)|0;o=c[m>>2]|0;K=ck(a)|0;L=c[q>>2]|0;c[L+(K*36&-1)+24>>2]=f;c[L+(K*36&-1)+28>>2]=o;M=c[p+(f*36&-1)+32>>2]|0;N=c[p+(o*36&-1)+32>>2]|0;c[L+(K*36&-1)+32>>2]=((M|0)>(N|0)?M:N)+1|0;r=+g[p+(f*36&-1)>>2];t=+g[p+(o*36&-1)>>2];v=+g[p+(f*36&-1)+4>>2];s=+g[p+(o*36&-1)+4>>2];N=L+(K*36&-1)|0;M=(g[k>>2]=r<t?r:t,c[k>>2]|0);O=(g[k>>2]=v<s?v:s,c[k>>2]|0)|0;c[N>>2]=0|M;c[N+4>>2]=O;s=+g[p+(f*36&-1)+8>>2];v=+g[p+(o*36&-1)+8>>2];t=+g[p+(f*36&-1)+12>>2];r=+g[p+(o*36&-1)+12>>2];O=L+(K*36&-1)+8|0;N=(g[k>>2]=s>v?s:v,c[k>>2]|0);M=(g[k>>2]=t>r?t:r,c[k>>2]|0)|0;c[O>>2]=0|N;c[O+4>>2]=M;c[L+(K*36&-1)+20>>2]=-1;c[p+(f*36&-1)+20>>2]=K;c[p+(o*36&-1)+20>>2]=K;o=n-1|0;c[m>>2]=c[e+(o<<2)>>2]|0;c[b>>2]=K;if((o|0)>1){n=o}else{break}}h=c[e>>2]|0;i=a|0;c[i>>2]=h;vj(d);ct(a);return}function cv(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0.0,x=0.0,y=0.0,z=0,A=0,B=0.0,C=0.0,D=0,E=0.0,F=0.0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,P=0,Q=0,R=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0.0,$=0.0,aa=0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0,ao=0,ap=0,aq=0.0,ar=0,as=0.0,at=0.0,au=0,av=0.0,aw=0.0,ax=0.0,ay=0.0,az=0,aA=0.0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;f=i;i=i+336|0;h=f|0;j=f+40|0;l=f+80|0;m=f+96|0;n=f+192|0;o=f+216|0;p=f+320|0;q=f+328|0;c[1038]=(c[1038]|0)+1|0;r=d|0;c[r>>2]=0;s=e+128|0;t=d+4|0;g[t>>2]=+g[s>>2];d=e|0;u=e+28|0;vq(h|0,e+56|0,36);vq(j|0,e+92|0,36);v=h+24|0;w=+g[v>>2];x=+O(+(w/6.2831854820251465))*6.2831854820251465;y=w-x;g[v>>2]=y;z=h+28|0;w=+g[z>>2]-x;g[z>>2]=w;A=j+24|0;x=+g[A>>2];B=+O(+(x/6.2831854820251465))*6.2831854820251465;C=x-B;g[A>>2]=C;D=j+28|0;x=+g[D>>2]-B;g[D>>2]=x;B=+g[s>>2];E=+g[e+24>>2]+ +g[e+52>>2]+-.014999999664723873;F=E<.004999999888241291?.004999999888241291:E;if(F<=.0012499999720603228){bd(6688,280,19104,11456)}b[l+4>>1]=0;s=m;G=e;c[s>>2]=c[G>>2]|0;c[s+4>>2]=c[G+4>>2]|0;c[s+8>>2]=c[G+8>>2]|0;c[s+12>>2]=c[G+12>>2]|0;c[s+16>>2]=c[G+16>>2]|0;c[s+20>>2]=c[G+20>>2]|0;c[s+24>>2]=c[G+24>>2]|0;G=m+28|0;s=u;c[G>>2]=c[s>>2]|0;c[G+4>>2]=c[s+4>>2]|0;c[G+8>>2]=c[s+8>>2]|0;c[G+12>>2]=c[s+12>>2]|0;c[G+16>>2]=c[s+16>>2]|0;c[G+20>>2]=c[s+20>>2]|0;c[G+24>>2]=c[s+24>>2]|0;a[m+88|0]=0;s=h+8|0;G=h+12|0;e=h+16|0;H=h+20|0;I=h|0;J=h+4|0;K=j+8|0;L=j+12|0;M=j+16|0;N=j+20|0;P=j|0;Q=j+4|0;R=m+56|0;U=m+64|0;V=m+68|0;W=m+72|0;X=m+80|0;Y=m+84|0;Z=n+16|0;E=F+.0012499999720603228;_=F+-.0012499999720603228;$=0.0;aa=0;ab=y;y=w;w=C;C=x;L900:while(1){x=1.0-$;ac=x*+g[s>>2]+$*+g[e>>2];ad=x*+g[G>>2]+$*+g[H>>2];ae=x*ab+$*y;af=+T(+ae);ag=+S(+ae);ae=+g[I>>2];ah=+g[J>>2];ai=x*+g[K>>2]+$*+g[M>>2];aj=x*+g[L>>2]+$*+g[N>>2];ak=x*w+$*C;x=+T(+ak);al=+S(+ak);ak=+g[P>>2];am=+g[Q>>2];an=(g[k>>2]=ac-(ag*ae-af*ah),c[k>>2]|0);ao=(g[k>>2]=ad-(af*ae+ag*ah),c[k>>2]|0)|0;c[R>>2]=0|an;c[R+4>>2]=ao;g[U>>2]=af;g[V>>2]=ag;ao=(g[k>>2]=ai-(al*ak-x*am),c[k>>2]|0);an=(g[k>>2]=aj-(x*ak+al*am),c[k>>2]|0)|0;c[W>>2]=0|ao;c[W+4>>2]=an;g[X>>2]=x;g[Y>>2]=al;ch(n,l,m);al=+g[Z>>2];if(al<=0.0){ap=688;break}if(al<E){ap=690;break}cw(o,l,d,h,u,j,$);an=0;al=B;while(1){x=+cA(o,p,q,al);if(x>E){ap=693;break L900}if(x>_){aq=al;break}ao=c[p>>2]|0;ar=c[q>>2]|0;am=+cB(o,ao,ar,$);if(am<_){ap=696;break L900}if(am>E){as=al;at=$;au=0;av=am;aw=x}else{ap=698;break L900}while(1){if((au&1|0)==0){ax=(at+as)*.5}else{ax=at+(F-av)*(as-at)/(aw-av)}x=+cB(o,ao,ar,ax);am=x-F;if(am>0.0){ay=am}else{ay=-0.0-am}if(ay<.0012499999720603228){az=au;aA=ax;break}aB=x>F;aC=au+1|0;c[1030]=(c[1030]|0)+1|0;if((aC|0)==50){az=50;aA=al;break}else{as=aB?as:ax;at=aB?ax:at;au=aC;av=aB?x:av;aw=aB?aw:x}}ar=c[1032]|0;c[1032]=(ar|0)>(az|0)?ar:az;ar=an+1|0;if((ar|0)==8){aq=$;break}else{an=ar;al=aA}}an=aa+1|0;c[1036]=(c[1036]|0)+1|0;if((an|0)==20){ap=710;break}$=aq;aa=an;ab=+g[v>>2];y=+g[z>>2];w=+g[A>>2];C=+g[D>>2]}if((ap|0)==696){c[r>>2]=1;g[t>>2]=$}else if((ap|0)==688){c[r>>2]=2;g[t>>2]=0.0;aD=aa;aE=c[1034]|0;aF=(aE|0)>(aD|0);aG=aF?aE:aD;c[1034]=aG;i=f;return}else if((ap|0)==690){c[r>>2]=3;g[t>>2]=$;aD=aa;aE=c[1034]|0;aF=(aE|0)>(aD|0);aG=aF?aE:aD;c[1034]=aG;i=f;return}else if((ap|0)==710){c[r>>2]=1;g[t>>2]=aq;aD=20;aE=c[1034]|0;aF=(aE|0)>(aD|0);aG=aF?aE:aD;c[1034]=aG;i=f;return}else if((ap|0)==698){c[r>>2]=3;g[t>>2]=$}else if((ap|0)==693){c[r>>2]=4;g[t>>2]=B}c[1036]=(c[1036]|0)+1|0;aD=aa+1|0;aE=c[1034]|0;aF=(aE|0)>(aD|0);aG=aF?aE:aD;c[1034]=aG;i=f;return}function cw(e,f,h,i,j,l,m){e=e|0;f=f|0;h=h|0;i=i|0;j=j|0;l=l|0;m=+m;var n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0,E=0,F=0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0;c[e>>2]=h;c[e+4>>2]=j;n=b[f+4>>1]|0;if(!(n<<16>>16!=0&(n&65535)<3)){bd(6688,50,16840,5584);return 0.0}o=e+8|0;vq(o|0,i|0,36);i=e+44|0;vq(i|0,l|0,36);p=1.0-m;q=p*+g[e+16>>2]+ +g[e+24>>2]*m;r=p*+g[e+20>>2]+ +g[e+28>>2]*m;s=p*+g[e+32>>2]+ +g[e+36>>2]*m;t=+T(+s);u=+S(+s);s=+g[o>>2];v=+g[e+12>>2];w=q-(u*s-t*v);q=r-(t*s+u*v);v=p*+g[e+52>>2]+ +g[e+60>>2]*m;s=p*+g[e+56>>2]+ +g[e+64>>2]*m;r=p*+g[e+68>>2]+ +g[e+72>>2]*m;m=+T(+r);p=+S(+r);r=+g[i>>2];x=+g[e+48>>2];y=v-(p*r-m*x);v=s-(m*r+p*x);if(n<<16>>16==1){c[e+80>>2]=0;n=d[f+6|0]|0;if((c[h+20>>2]|0)<=(n|0)){bd(7536,103,13816,6368);return 0.0}i=(c[h+16>>2]|0)+(n<<3)|0;n=c[i+4>>2]|0;x=(c[k>>2]=c[i>>2]|0,+g[k>>2]);r=(c[k>>2]=n,+g[k>>2]);n=d[f+9|0]|0;if((c[j+20>>2]|0)<=(n|0)){bd(7536,103,13816,6368);return 0.0}i=(c[j+16>>2]|0)+(n<<3)|0;n=c[i+4>>2]|0;s=(c[k>>2]=c[i>>2]|0,+g[k>>2]);z=(c[k>>2]=n,+g[k>>2]);n=e+92|0;A=y+(p*s-m*z)-(w+(u*x-t*r));B=v+(m*s+p*z)-(q+(t*x+u*r));i=n;o=(g[k>>2]=A,c[k>>2]|0);l=(g[k>>2]=B,c[k>>2]|0)|0;c[i>>2]=0|o;c[i+4>>2]=l;r=+Q(+(A*A+B*B));if(r<1.1920928955078125e-7){C=0.0;return+C}x=1.0/r;g[n>>2]=A*x;g[e+96>>2]=B*x;C=r;return+C}n=f+6|0;l=f+7|0;i=e+80|0;if((a[n]|0)==(a[l]|0)){c[i>>2]=2;o=d[f+9|0]|0;D=c[j+20>>2]|0;if((D|0)<=(o|0)){bd(7536,103,13816,6368);return 0.0}E=c[j+16>>2]|0;F=E+(o<<3)|0;o=c[F+4>>2]|0;r=(c[k>>2]=c[F>>2]|0,+g[k>>2]);x=(c[k>>2]=o,+g[k>>2]);o=d[f+10|0]|0;if((D|0)<=(o|0)){bd(7536,103,13816,6368);return 0.0}D=E+(o<<3)|0;o=c[D+4>>2]|0;B=(c[k>>2]=c[D>>2]|0,+g[k>>2]);A=(c[k>>2]=o,+g[k>>2]);o=e+92|0;z=A-x;s=(B-r)*-1.0;D=o;E=(g[k>>2]=z,c[k>>2]|0);F=(g[k>>2]=s,c[k>>2]|0)|0;c[D>>2]=0|E;c[D+4>>2]=F;G=+Q(+(z*z+s*s));if(G<1.1920928955078125e-7){H=z;I=s}else{J=1.0/G;G=z*J;g[o>>2]=G;z=s*J;g[e+96>>2]=z;H=G;I=z}z=(r+B)*.5;B=(x+A)*.5;o=e+84|0;F=(g[k>>2]=z,c[k>>2]|0);E=(g[k>>2]=B,c[k>>2]|0)|0;c[o>>2]=0|F;c[o+4>>2]=E;E=d[n]|0;if((c[h+20>>2]|0)<=(E|0)){bd(7536,103,13816,6368);return 0.0}o=(c[h+16>>2]|0)+(E<<3)|0;E=c[o+4>>2]|0;A=(c[k>>2]=c[o>>2]|0,+g[k>>2]);x=(c[k>>2]=E,+g[k>>2]);r=(p*H-m*I)*(w+(u*A-t*x)-(y+(p*z-m*B)))+(m*H+p*I)*(q+(t*A+u*x)-(v+(m*z+p*B)));if(r>=0.0){C=r;return+C}E=(g[k>>2]=-0.0-H,c[k>>2]|0);o=(g[k>>2]=-0.0-I,c[k>>2]|0)|0;c[D>>2]=0|E;c[D+4>>2]=o;C=-0.0-r;return+C}else{c[i>>2]=1;i=d[n]|0;n=c[h+20>>2]|0;if((n|0)<=(i|0)){bd(7536,103,13816,6368);return 0.0}o=c[h+16>>2]|0;h=o+(i<<3)|0;i=c[h+4>>2]|0;r=(c[k>>2]=c[h>>2]|0,+g[k>>2]);I=(c[k>>2]=i,+g[k>>2]);i=d[l]|0;if((n|0)<=(i|0)){bd(7536,103,13816,6368);return 0.0}n=o+(i<<3)|0;i=c[n+4>>2]|0;H=(c[k>>2]=c[n>>2]|0,+g[k>>2]);B=(c[k>>2]=i,+g[k>>2]);i=e+92|0;z=B-I;x=(H-r)*-1.0;n=i;o=(g[k>>2]=z,c[k>>2]|0);l=(g[k>>2]=x,c[k>>2]|0)|0;c[n>>2]=0|o;c[n+4>>2]=l;A=+Q(+(z*z+x*x));if(A<1.1920928955078125e-7){K=z;L=x}else{G=1.0/A;A=z*G;g[i>>2]=A;z=x*G;g[e+96>>2]=z;K=A;L=z}z=(r+H)*.5;H=(I+B)*.5;i=e+84|0;e=(g[k>>2]=z,c[k>>2]|0);l=(g[k>>2]=H,c[k>>2]|0)|0;c[i>>2]=0|e;c[i+4>>2]=l;l=d[f+9|0]|0;if((c[j+20>>2]|0)<=(l|0)){bd(7536,103,13816,6368);return 0.0}f=(c[j+16>>2]|0)+(l<<3)|0;l=c[f+4>>2]|0;B=(c[k>>2]=c[f>>2]|0,+g[k>>2]);I=(c[k>>2]=l,+g[k>>2]);r=(u*K-t*L)*(y+(p*B-m*I)-(w+(u*z-t*H)))+(t*K+u*L)*(v+(m*B+p*I)-(q+(t*z+u*H)));if(r>=0.0){C=r;return+C}l=(g[k>>2]=-0.0-K,c[k>>2]|0);f=(g[k>>2]=-0.0-L,c[k>>2]|0)|0;c[n>>2]=0|l;c[n+4>>2]=f;C=-0.0-r;return+C}return 0.0}function cx(a){a=a|0;return(c[a+16>>2]|0)-1|0}function cy(a){a=a|0;var b=0;c[a>>2]=20296;b=a+12|0;vj(c[b>>2]|0);c[b>>2]=0;c[a+16>>2]=0;vl(a);return}function cz(a){a=a|0;var b=0;c[a>>2]=20296;b=a+12|0;vj(c[b>>2]|0);c[b>>2]=0;c[a+16>>2]=0;return}function cA(a,b,d,e){a=a|0;b=b|0;d=d|0;e=+e;var f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0,y=0,z=0,A=0,B=0.0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;f=1.0-e;h=f*+g[a+16>>2]+ +g[a+24>>2]*e;i=f*+g[a+20>>2]+ +g[a+28>>2]*e;j=f*+g[a+32>>2]+ +g[a+36>>2]*e;l=+T(+j);m=+S(+j);j=+g[a+8>>2];n=+g[a+12>>2];o=h-(m*j-l*n);h=i-(l*j+m*n);n=f*+g[a+52>>2]+ +g[a+60>>2]*e;j=f*+g[a+56>>2]+ +g[a+64>>2]*e;i=f*+g[a+68>>2]+ +g[a+72>>2]*e;e=+T(+i);f=+S(+i);i=+g[a+44>>2];p=+g[a+48>>2];q=n-(f*i-e*p);n=j-(e*i+f*p);r=c[a+80>>2]|0;if((r|0)==1){p=+g[a+92>>2];i=+g[a+96>>2];j=m*p-l*i;s=l*p+m*i;i=+g[a+84>>2];p=+g[a+88>>2];t=o+(m*i-l*p);u=h+(l*i+m*p);p=-0.0-s;i=f*(-0.0-j)+e*p;v=e*j+f*p;c[b>>2]=-1;w=a+4|0;x=c[w>>2]|0;y=c[x+16>>2]|0;z=c[x+20>>2]|0;do{if((z|0)>1){p=v*+g[y+4>>2]+i*+g[y>>2];x=1;A=0;while(1){B=i*+g[y+(x<<3)>>2]+v*+g[y+(x<<3)+4>>2];C=B>p;D=C?x:A;E=x+1|0;if((E|0)<(z|0)){p=C?B:p;x=E;A=D}else{break}}c[d>>2]=D;if((D|0)>-1){F=D;break}bd(7536,103,13816,6368);return 0.0}else{c[d>>2]=0;F=0}}while(0);D=c[w>>2]|0;if((c[D+20>>2]|0)<=(F|0)){bd(7536,103,13816,6368);return 0.0}w=(c[D+16>>2]|0)+(F<<3)|0;F=c[w+4>>2]|0;v=(c[k>>2]=c[w>>2]|0,+g[k>>2]);i=(c[k>>2]=F,+g[k>>2]);p=j*(q+(f*v-e*i)-t)+s*(n+(e*v+f*i)-u);return+p}else if((r|0)==0){F=a+92|0;u=+g[F>>2];w=a+96|0;i=+g[w>>2];v=m*u+l*i;s=u*(-0.0-l)+m*i;t=-0.0-i;i=f*(-0.0-u)+e*t;j=e*u+f*t;D=a|0;z=c[D>>2]|0;y=c[z+16>>2]|0;A=c[z+20>>2]|0;L1006:do{if((A|0)>1){t=s*+g[y+4>>2]+v*+g[y>>2];z=1;x=0;while(1){u=v*+g[y+(z<<3)>>2]+s*+g[y+(z<<3)+4>>2];E=u>t;C=E?z:x;G=z+1|0;if((G|0)<(A|0)){t=E?u:t;z=G;x=C}else{H=C;break L1006}}}else{H=0}}while(0);c[b>>2]=H;H=a+4|0;A=c[H>>2]|0;y=c[A+16>>2]|0;x=c[A+20>>2]|0;L1011:do{if((x|0)>1){s=j*+g[y+4>>2]+i*+g[y>>2];A=1;z=0;while(1){v=i*+g[y+(A<<3)>>2]+j*+g[y+(A<<3)+4>>2];C=v>s;G=C?A:z;E=A+1|0;if((E|0)<(x|0)){s=C?v:s;A=E;z=G}else{I=G;break L1011}}}else{I=0}}while(0);c[d>>2]=I;x=c[D>>2]|0;D=c[b>>2]|0;if((D|0)<=-1){bd(7536,103,13816,6368);return 0.0}if((c[x+20>>2]|0)<=(D|0)){bd(7536,103,13816,6368);return 0.0}y=(c[x+16>>2]|0)+(D<<3)|0;D=c[y+4>>2]|0;j=(c[k>>2]=c[y>>2]|0,+g[k>>2]);i=(c[k>>2]=D,+g[k>>2]);D=c[H>>2]|0;if((I|0)<=-1){bd(7536,103,13816,6368);return 0.0}if((c[D+20>>2]|0)<=(I|0)){bd(7536,103,13816,6368);return 0.0}H=(c[D+16>>2]|0)+(I<<3)|0;I=c[H+4>>2]|0;s=(c[k>>2]=c[H>>2]|0,+g[k>>2]);v=(c[k>>2]=I,+g[k>>2]);p=+g[F>>2]*(q+(f*s-e*v)-(o+(m*j-l*i)))+ +g[w>>2]*(n+(e*s+f*v)-(h+(l*j+m*i)));return+p}else if((r|0)==2){i=+g[a+92>>2];j=+g[a+96>>2];v=f*i-e*j;s=e*i+f*j;j=+g[a+84>>2];i=+g[a+88>>2];t=q+(f*j-e*i);q=n+(e*j+f*i);i=-0.0-s;f=m*(-0.0-v)+l*i;j=l*v+m*i;c[d>>2]=-1;d=a|0;a=c[d>>2]|0;r=c[a+16>>2]|0;w=c[a+20>>2]|0;do{if((w|0)>1){i=j*+g[r+4>>2]+f*+g[r>>2];a=1;F=0;while(1){e=f*+g[r+(a<<3)>>2]+j*+g[r+(a<<3)+4>>2];I=e>i;J=I?a:F;H=a+1|0;if((H|0)<(w|0)){i=I?e:i;a=H;F=J}else{break}}c[b>>2]=J;if((J|0)>-1){K=J;break}bd(7536,103,13816,6368);return 0.0}else{c[b>>2]=0;K=0}}while(0);b=c[d>>2]|0;if((c[b+20>>2]|0)<=(K|0)){bd(7536,103,13816,6368);return 0.0}d=(c[b+16>>2]|0)+(K<<3)|0;K=c[d+4>>2]|0;j=(c[k>>2]=c[d>>2]|0,+g[k>>2]);f=(c[k>>2]=K,+g[k>>2]);p=v*(o+(m*j-l*f)-t)+s*(h+(l*j+m*f)-q);return+p}else{bd(6688,183,13728,11592);return 0.0}return 0.0}function cB(a,b,d,e){a=a|0;b=b|0;d=d|0;e=+e;var f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0.0,t=0,u=0,v=0.0,w=0.0,x=0.0;f=1.0-e;h=f*+g[a+16>>2]+ +g[a+24>>2]*e;i=f*+g[a+20>>2]+ +g[a+28>>2]*e;j=f*+g[a+32>>2]+ +g[a+36>>2]*e;l=+T(+j);m=+S(+j);j=+g[a+8>>2];n=+g[a+12>>2];o=h-(m*j-l*n);h=i-(l*j+m*n);n=f*+g[a+52>>2]+ +g[a+60>>2]*e;j=f*+g[a+56>>2]+ +g[a+64>>2]*e;i=f*+g[a+68>>2]+ +g[a+72>>2]*e;e=+T(+i);f=+S(+i);i=+g[a+44>>2];p=+g[a+48>>2];q=n-(f*i-e*p);n=j-(e*i+f*p);r=c[a+80>>2]|0;if((r|0)==1){p=+g[a+92>>2];i=+g[a+96>>2];j=+g[a+84>>2];s=+g[a+88>>2];t=c[a+4>>2]|0;if((d|0)<=-1){bd(7536,103,13816,6368);return 0.0}if((c[t+20>>2]|0)<=(d|0)){bd(7536,103,13816,6368);return 0.0}u=(c[t+16>>2]|0)+(d<<3)|0;t=c[u+4>>2]|0;v=(c[k>>2]=c[u>>2]|0,+g[k>>2]);w=(c[k>>2]=t,+g[k>>2]);x=(m*p-l*i)*(q+(f*v-e*w)-(o+(m*j-l*s)))+(l*p+m*i)*(n+(e*v+f*w)-(h+(l*j+m*s)));return+x}else if((r|0)==2){s=+g[a+92>>2];j=+g[a+96>>2];w=+g[a+84>>2];v=+g[a+88>>2];t=c[a>>2]|0;if((b|0)<=-1){bd(7536,103,13816,6368);return 0.0}if((c[t+20>>2]|0)<=(b|0)){bd(7536,103,13816,6368);return 0.0}u=(c[t+16>>2]|0)+(b<<3)|0;t=c[u+4>>2]|0;i=(c[k>>2]=c[u>>2]|0,+g[k>>2]);p=(c[k>>2]=t,+g[k>>2]);x=(f*s-e*j)*(o+(m*i-l*p)-(q+(f*w-e*v)))+(e*s+f*j)*(h+(l*i+m*p)-(n+(e*w+f*v)));return+x}else if((r|0)==0){v=+g[a+92>>2];w=+g[a+96>>2];r=c[a>>2]|0;if((b|0)<=-1){bd(7536,103,13816,6368);return 0.0}if((c[r+20>>2]|0)<=(b|0)){bd(7536,103,13816,6368);return 0.0}t=(c[r+16>>2]|0)+(b<<3)|0;b=c[t+4>>2]|0;p=(c[k>>2]=c[t>>2]|0,+g[k>>2]);i=(c[k>>2]=b,+g[k>>2]);b=c[a+4>>2]|0;if((d|0)<=-1){bd(7536,103,13816,6368);return 0.0}if((c[b+20>>2]|0)<=(d|0)){bd(7536,103,13816,6368);return 0.0}a=(c[b+16>>2]|0)+(d<<3)|0;d=c[a+4>>2]|0;j=(c[k>>2]=c[a>>2]|0,+g[k>>2]);s=(c[k>>2]=d,+g[k>>2]);x=v*(q+(f*j-e*s)-(o+(m*p-l*i)))+w*(n+(e*j+f*s)-(h+(l*p+m*i)));return+x}else{bd(6688,242,13656,11592);return 0.0}return 0.0}function cC(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0;e=dg(d,40)|0;if((e|0)==0){f=0}else{c[e>>2]=20296;c[e+4>>2]=3;g[e+8>>2]=.009999999776482582;c[e+12>>2]=0;c[e+16>>2]=0;a[e+36|0]=0;a[e+37|0]=0;f=e}e=c[b+12>>2]|0;d=c[b+16>>2]|0;h=f+12|0;if((c[h>>2]|0)!=0){bd(6208,48,18448,11256);return 0}i=f+16|0;if((c[i>>2]|0)!=0){bd(6208,48,18448,11256);return 0}if((d|0)>1){c[i>>2]=d;j=vi(d<<3)|0;c[h>>2]=j;vq(j|0,e|0,c[i>>2]<<3);i=f+36|0;a[i]=0;e=f+37|0;a[e]=0;j=b+20|0;h=f+20|0;d=c[j+4>>2]|0;c[h>>2]=c[j>>2]|0;c[h+4>>2]=d;d=b+28|0;h=f+28|0;j=c[d+4>>2]|0;c[h>>2]=c[d>>2]|0;c[h+4>>2]=j;a[i]=a[b+36|0]&1;a[e]=a[b+37|0]&1;return f|0}else{bd(6208,49,18448,6736);return 0}return 0}function cD(a,b,c){a=a|0;b=b|0;c=c|0;return 0}function cE(a){a=a|0;return}function cF(a){a=a|0;return 1}function cG(a){a=a|0;return}function cH(a){a=a|0;return 1}function cI(a,b,c){a=a|0;b=b|0;c=c|0;return 0}function cJ(a){a=a|0;return 1}function cK(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=+g[b+12>>2];e=+g[a+12>>2];f=+g[b+8>>2];h=+g[a+16>>2];i=+g[c>>2]-(+g[b>>2]+(d*e-f*h));j=+g[c+4>>2]-(+g[b+4>>2]+(e*f+d*h));h=+g[a+8>>2];return i*i+j*j<=h*h|0}function cL(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0;e=+g[c+12>>2];f=+g[a+12>>2];h=+g[c+8>>2];i=+g[a+16>>2];j=+g[c>>2]+(e*f-h*i);k=+g[c+4>>2]+(f*h+e*i);c=a+8|0;i=+g[c>>2];g[b>>2]=j-i;g[b+4>>2]=k-i;i=+g[c>>2];g[b+8>>2]=j+i;g[b+12>>2]=k+i;return}function cM(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0.0,h=0.0,i=0,j=0,k=0,l=0,m=0.0;e=a+8|0;f=+g[e>>2];h=f*d*3.1415927410125732*f;g[b>>2]=h;i=a+12|0;j=i;k=b+4|0;l=c[j+4>>2]|0;c[k>>2]=c[j>>2]|0;c[k+4>>2]=l;f=+g[e>>2];d=+g[i>>2];m=+g[a+16>>2];g[b+12>>2]=h*(f*f*.5+(d*d+m*m));return}function cN(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0;f=+g[d+12>>2];h=+g[a+12>>2];i=+g[d+8>>2];j=+g[a+16>>2];l=+g[d>>2];m=l+(f*h-i*j);n=+g[d+4>>2];o=h*i+f*j+n;j=+g[a+20>>2];h=+g[a+24>>2];p=l+(f*j-i*h);l=n+(i*j+f*h);h=+g[a+8>>2];a=b;d=(g[k>>2]=(m<p?m:p)-h,c[k>>2]|0);e=(g[k>>2]=(o<l?o:l)-h,c[k>>2]|0)|0;c[a>>2]=0|d;c[a+4>>2]=e;e=b+8|0;b=(g[k>>2]=h+(m>p?m:p),c[k>>2]|0);a=(g[k>>2]=h+(o>l?o:l),c[k>>2]|0)|0;c[e>>2]=0|b;c[e+4>>2]=a;return}function cO(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0;g[b>>2]=0.0;d=(+g[a+16>>2]+ +g[a+24>>2])*.5;e=b+4|0;f=(g[k>>2]=(+g[a+12>>2]+ +g[a+20>>2])*.5,c[k>>2]|0);a=(g[k>>2]=d,c[k>>2]|0)|0;c[e>>2]=0|f;c[e+4>>2]=a;g[b+12>>2]=0.0;return}function cP(a,b,c){a=a|0;b=b|0;c=+c;vr(b|0,0,16);return}function cQ(a,b){a=a|0;b=b|0;var d=0,e=0;d=dg(b,20)|0;if((d|0)==0){e=0}else{c[d>>2]=20136;vr(d+4|0,0,16);e=d}c[e+4>>2]=c[a+4>>2]|0;g[e+8>>2]=+g[a+8>>2];d=a+12|0;a=e+12|0;b=c[d+4>>2]|0;c[a>>2]=c[d>>2]|0;c[a+4>>2]=b;return e|0}function cR(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0;h=+g[e+12>>2];i=+g[a+12>>2];j=+g[e+8>>2];l=+g[a+16>>2];m=+g[d>>2];n=m-(+g[e>>2]+(h*i-j*l));o=+g[d+4>>2];p=o-(+g[e+4>>2]+(i*j+h*l));l=+g[a+8>>2];h=+g[d+8>>2]-m;m=+g[d+12>>2]-o;o=n*h+p*m;j=h*h+m*m;i=o*o-(n*n+p*p-l*l)*j;if(i<0.0|j<1.1920928955078125e-7){q=0;return q|0}l=o+ +Q(+i);i=-0.0-l;if(l>-0.0){q=0;return q|0}if(j*+g[d+16>>2]<i){q=0;return q|0}l=i/j;g[b+8>>2]=l;j=n+h*l;h=p+m*l;d=b;a=(g[k>>2]=j,c[k>>2]|0);e=(g[k>>2]=h,c[k>>2]|0)|0;c[d>>2]=0|a;c[d+4>>2]=e;l=+Q(+(j*j+h*h));if(l<1.1920928955078125e-7){q=1;return q|0}m=1.0/l;g[b>>2]=j*m;g[b+4>>2]=h*m;q=1;return q|0}function cS(a){a=a|0;vl(a);return}function cT(b,d){b=b|0;d=d|0;var e=0,f=0,h=0;e=dg(d,48)|0;if((e|0)==0){f=0}else{c[e>>2]=20512;c[e+4>>2]=1;g[e+8>>2]=.009999999776482582;vr(e+28|0,0,18);f=e}c[f+4>>2]=c[b+4>>2]|0;g[f+8>>2]=+g[b+8>>2];e=b+12|0;d=f+12|0;h=c[e+4>>2]|0;c[d>>2]=c[e>>2]|0;c[d+4>>2]=h;h=b+20|0;d=f+20|0;e=c[h+4>>2]|0;c[d>>2]=c[h>>2]|0;c[d+4>>2]=e;e=b+28|0;d=f+28|0;h=c[e+4>>2]|0;c[d>>2]=c[e>>2]|0;c[d+4>>2]=h;h=b+36|0;d=f+36|0;e=c[h+4>>2]|0;c[d>>2]=c[h>>2]|0;c[d+4>>2]=e;a[f+44|0]=a[b+44|0]&1;a[f+45|0]=a[b+45|0]&1;return f|0}function cU(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0;h=+g[e>>2];i=+g[d>>2]-h;j=+g[e+4>>2];l=+g[d+4>>2]-j;m=+g[e+12>>2];n=+g[e+8>>2];o=i*m+l*n;p=-0.0-n;q=m*l+i*p;i=+g[d+8>>2]-h;h=+g[d+12>>2]-j;j=m*i+n*h-o;n=i*p+m*h-q;e=a+12|0;f=c[e+4>>2]|0;h=(c[k>>2]=c[e>>2]|0,+g[k>>2]);m=(c[k>>2]=f,+g[k>>2]);f=a+20|0;a=c[f+4>>2]|0;p=(c[k>>2]=c[f>>2]|0,+g[k>>2]);i=p-h;p=(c[k>>2]=a,+g[k>>2])-m;l=-0.0-i;r=i*i+p*p;s=+Q(+r);if(s<1.1920928955078125e-7){t=p;u=l}else{v=1.0/s;t=p*v;u=v*l}l=(m-q)*u+(h-o)*t;v=n*u+j*t;if(v==0.0){w=0;return w|0}s=l/v;if(s<0.0){w=0;return w|0}if(+g[d+16>>2]<s|r==0.0){w=0;return w|0}v=(i*(o+j*s-h)+p*(q+n*s-m))/r;if(v<0.0|v>1.0){w=0;return w|0}g[b+8>>2]=s;if(l>0.0){d=b;a=(g[k>>2]=-0.0-t,c[k>>2]|0);f=(g[k>>2]=-0.0-u,c[k>>2]|0)|0;c[d>>2]=0|a;c[d+4>>2]=f;w=1;return w|0}else{f=b;b=(g[k>>2]=t,c[k>>2]|0);d=(g[k>>2]=u,c[k>>2]|0)|0;c[f>>2]=0|b;c[f+4>>2]=d;w=1;return w|0}return 0}function cV(a){a=a|0;vl(a);return}function cW(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=dg(b,152)|0;if((d|0)==0){e=0}else{c[d>>2]=20032;c[d+4>>2]=2;g[d+8>>2]=.009999999776482582;c[d+148>>2]=0;g[d+12>>2]=0.0;g[d+16>>2]=0.0;e=d}c[e+4>>2]=c[a+4>>2]|0;g[e+8>>2]=+g[a+8>>2];d=a+12|0;b=e+12|0;f=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=f;vq(e+20|0,a+20|0,64);vq(e+84|0,a+84|0,64);c[e+148>>2]=c[a+148>>2]|0;return e|0}function cX(a,b,d,e,f){a=a|0;b=+b;d=+d;e=e|0;f=+f;var h=0,i=0.0,j=0.0,l=0,m=0,n=0.0,o=0.0,p=0;h=a+148|0;c[h>>2]=4;i=-0.0-b;j=-0.0-d;g[a+20>>2]=i;g[a+24>>2]=j;g[a+28>>2]=b;g[a+32>>2]=j;g[a+36>>2]=b;g[a+40>>2]=d;g[a+44>>2]=i;g[a+48>>2]=d;g[a+84>>2]=0.0;g[a+88>>2]=-1.0;g[a+92>>2]=1.0;g[a+96>>2]=0.0;g[a+100>>2]=0.0;g[a+104>>2]=1.0;g[a+108>>2]=-1.0;g[a+112>>2]=0.0;l=e;e=a+12|0;m=c[l+4>>2]|0;c[e>>2]=c[l>>2]|0;c[e+4>>2]=m;m=c[l+4>>2]|0;d=(c[k>>2]=c[l>>2]|0,+g[k>>2]);i=(c[k>>2]=m,+g[k>>2]);b=+T(+f);n=+S(+f);m=0;f=j;j=-1.0;while(1){l=a+20+(m<<3)|0;o=+g[l>>2];e=l;l=(g[k>>2]=d+(n*o-b*f),c[k>>2]|0);p=(g[k>>2]=i+(b*o+n*f),c[k>>2]|0)|0;c[e>>2]=0|l;c[e+4>>2]=p;p=a+84+(m<<3)|0;o=+g[p>>2];e=p;p=(g[k>>2]=n*o-b*j,c[k>>2]|0);l=(g[k>>2]=b*o+n*j,c[k>>2]|0)|0;c[e>>2]=0|p;c[e+4>>2]=l;l=m+1|0;if((l|0)>=(c[h>>2]|0)){break}m=l;f=+g[a+20+(l<<3)+4>>2];j=+g[a+84+(l<<3)+4>>2]}return}function cY(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0;if((e|0)<=-1){bd(6208,89,14624,5952)}f=b+16|0;if(((c[f>>2]|0)-1|0)<=(e|0)){bd(6208,89,14624,5952)}c[d+4>>2]=1;g[d+8>>2]=+g[b+8>>2];h=b+12|0;i=(c[h>>2]|0)+(e<<3)|0;j=d+12|0;k=c[i+4>>2]|0;c[j>>2]=c[i>>2]|0;c[j+4>>2]=k;k=(c[h>>2]|0)+(e+1<<3)|0;j=d+20|0;i=c[k+4>>2]|0;c[j>>2]=c[k>>2]|0;c[j+4>>2]=i;i=d+28|0;if((e|0)>0){j=(c[h>>2]|0)+(e-1<<3)|0;k=i;l=c[j+4>>2]|0;c[k>>2]=c[j>>2]|0;c[k+4>>2]=l;a[d+44|0]=1}else{l=b+20|0;k=i;i=c[l+4>>2]|0;c[k>>2]=c[l>>2]|0;c[k+4>>2]=i;a[d+44|0]=a[b+36|0]&1}i=d+36|0;if(((c[f>>2]|0)-2|0)>(e|0)){f=(c[h>>2]|0)+(e+2<<3)|0;e=i;h=c[f+4>>2]|0;c[e>>2]=c[f>>2]|0;c[e+4>>2]=h;a[d+45|0]=1;return}else{h=b+28|0;e=i;i=c[h+4>>2]|0;c[e>>2]=c[h>>2]|0;c[e+4>>2]=i;a[d+45|0]=a[b+37|0]&1;return}}function cZ(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,j=0,k=0,l=0,m=0,n=0;h=i;i=i+48|0;j=h|0;k=c[a+16>>2]|0;if((k|0)>(f|0)){c[j>>2]=20512;c[j+4>>2]=1;g[j+8>>2]=.009999999776482582;vr(j+28|0,0,18);l=f+1|0;m=c[a+12>>2]|0;a=m+(f<<3)|0;f=j+12|0;n=c[a+4>>2]|0;c[f>>2]=c[a>>2]|0;c[f+4>>2]=n;n=m+(((l|0)==(k|0)?0:l)<<3)|0;l=j+20|0;k=c[n+4>>2]|0;c[l>>2]=c[n>>2]|0;c[l+4>>2]=k;k=cU(j,b,d,e,0)|0;i=h;return k|0}else{bd(6208,129,14512,5512);return 0}return 0}function c_(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0;f=c[a+16>>2]|0;if((f|0)>(e|0)){h=e+1|0;i=(h|0)==(f|0)?0:h;h=c[a+12>>2]|0;j=+g[d+12>>2];l=+g[h+(e<<3)>>2];m=+g[d+8>>2];n=+g[h+(e<<3)+4>>2];o=+g[d>>2];p=o+(j*l-m*n);q=+g[d+4>>2];r=l*m+j*n+q;n=+g[h+(i<<3)>>2];l=+g[h+(i<<3)+4>>2];s=o+(j*n-m*l);o=q+(m*n+j*l);i=b;h=(g[k>>2]=p<s?p:s,c[k>>2]|0);d=(g[k>>2]=r<o?r:o,c[k>>2]|0)|0;c[i>>2]=0|h;c[i+4>>2]=d;d=b+8|0;b=(g[k>>2]=p>s?p:s,c[k>>2]|0);i=(g[k>>2]=r>o?r:o,c[k>>2]|0)|0;c[d>>2]=0|b;c[d+4>>2]=i;return}else{bd(6208,148,14688,5512)}}function c$(a){a=a|0;return}function c0(a){a=a|0;return}function c1(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return}function c2(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return}function c3(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;return}function c4(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;return}function c5(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return}function c6(a,b){a=a|0;b=b|0;return}function c7(a,b,d){a=a|0;b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0,m=0;e=+g[d>>2]- +g[b>>2];f=+g[d+4>>2]- +g[b+4>>2];h=+g[b+12>>2];i=+g[b+8>>2];j=e*h+f*i;k=h*f+e*(-0.0-i);b=c[a+148>>2]|0;d=0;while(1){if((d|0)>=(b|0)){l=1;m=925;break}if((j- +g[a+20+(d<<3)>>2])*+g[a+84+(d<<3)>>2]+(k- +g[a+20+(d<<3)+4>>2])*+g[a+84+(d<<3)+4>>2]>0.0){l=0;m=926;break}else{d=d+1|0}}if((m|0)==926){return l|0}else if((m|0)==925){return l|0}return 0}function c8(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0.0,y=0.0,z=0.0,A=0.0;f=+g[d+12>>2];h=+g[a+20>>2];i=+g[d+8>>2];j=+g[a+24>>2];l=+g[d>>2];m=l+(f*h-i*j);n=+g[d+4>>2];o=h*i+f*j+n;d=c[a+148>>2]|0;L1195:do{if((d|0)>1){j=o;h=m;p=o;q=m;e=1;while(1){r=+g[a+20+(e<<3)>>2];s=+g[a+20+(e<<3)+4>>2];t=l+(f*r-i*s);u=r*i+f*s+n;s=h<t?h:t;r=j<u?j:u;v=q>t?q:t;t=p>u?p:u;w=e+1|0;if((w|0)<(d|0)){j=r;h=s;p=t;q=v;e=w}else{x=r;y=s;z=t;A=v;break L1195}}}else{x=o;y=m;z=o;A=m}}while(0);m=+g[a+8>>2];a=b;d=(g[k>>2]=y-m,c[k>>2]|0);e=(g[k>>2]=x-m,c[k>>2]|0)|0;c[a>>2]=0|d;c[a+4>>2]=e;e=b+8|0;b=(g[k>>2]=A+m,c[k>>2]|0);a=(g[k>>2]=z+m,c[k>>2]|0)|0;c[e>>2]=0|b;c[e+4>>2]=a;return}function c9(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;d=+g[b+16>>2];e=+g[b+32>>2];f=+g[b+20>>2];h=+g[b+28>>2];i=d*e-f*h;j=+g[b+24>>2];k=+g[b+12>>2];l=f*j-e*k;m=h*k-d*j;n=+g[b>>2];o=+g[b+4>>2];p=+g[b+8>>2];q=i*n+o*l+m*p;if(q!=0.0){r=1.0/q}else{r=q}q=+g[c>>2];s=+g[c+4>>2];t=+g[c+8>>2];g[a>>2]=r*(i*q+s*l+m*t);g[a+4>>2]=r*((s*e-t*h)*n+o*(t*j-e*q)+(h*q-s*j)*p);g[a+8>>2]=r*((d*t-f*s)*n+o*(f*q-t*k)+(s*k-d*q)*p);return}function da(a){a=a|0;vl(a);return}function db(a){a=a|0;vl(a);return}function dc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;i=i+16|0;e=d|0;f=e;c[f>>2]=b;c[f+4>>2]=0;a6(a|0,e|0);i=d;return}function dd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0.0,o=0.0,p=0,q=0.0,r=0.0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0;if((d-3|0)>>>0>=6){bd(5664,122,17936,11096)}e=a+148|0;c[e>>2]=d;d=0;while(1){f=b+(d<<3)|0;h=a+20+(d<<3)|0;i=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=i;i=d+1|0;j=c[e>>2]|0;if((i|0)<(j|0)){d=i}else{break}}if((j|0)>0){l=j;m=0}else{bd(5664,76,18928,5016)}while(1){j=m+1|0;d=(j|0)<(l|0)?j:0;n=+g[a+20+(d<<3)>>2]- +g[a+20+(m<<3)>>2];o=+g[a+20+(d<<3)+4>>2]- +g[a+20+(m<<3)+4>>2];if(n*n+o*o<=1.4210854715202004e-14){p=943;break}d=a+84+(m<<3)|0;b=d;i=(g[k>>2]=o,c[k>>2]|0);h=(g[k>>2]=n*-1.0,c[k>>2]|0)|0;c[b>>2]=0|i;c[b+4>>2]=h;h=a+84+(m<<3)+4|0;n=+g[h>>2];q=+Q(+(o*o+n*n));if(q>=1.1920928955078125e-7){r=1.0/q;g[d>>2]=o*r;g[h>>2]=n*r}s=c[e>>2]|0;if((j|0)<(s|0)){l=s;m=j}else{break}}if((p|0)==943){bd(5664,137,17936,8512)}p=a+12|0;m=a+20|0;if((s|0)>2){t=0;u=0.0;v=0.0;w=0.0}else{bd(5664,76,18928,5016)}while(1){l=a+20+(t<<3)|0;e=c[l+4>>2]|0;r=(c[k>>2]=c[l>>2]|0,+g[k>>2]);n=(c[k>>2]=e,+g[k>>2]);e=t+1|0;l=(e|0)<(s|0);if(l){x=a+20+(e<<3)|0}else{x=m}j=x;h=c[j+4>>2]|0;o=(c[k>>2]=c[j>>2]|0,+g[k>>2]);q=(c[k>>2]=h,+g[k>>2]);y=(r*q-n*o)*.5;z=u+y;A=y*.3333333432674408;B=v+(r+0.0+o)*A;C=w+(n+0.0+q)*A;if(l){t=e;u=z;v=B;w=C}else{break}}if(z>1.1920928955078125e-7){w=1.0/z;t=p;p=(g[k>>2]=B*w,c[k>>2]|0);x=(g[k>>2]=C*w,c[k>>2]|0)|0;c[t>>2]=0|p;c[t+4>>2]=x;return}else{bd(5664,115,18928,5488)}}function de(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0,u=0.0,v=0.0,w=0,x=0.0,y=0,z=0.0;h=+g[e>>2];i=+g[d>>2]-h;j=+g[e+4>>2];l=+g[d+4>>2]-j;f=e+12|0;m=+g[f>>2];n=e+8|0;o=+g[n>>2];p=i*m+l*o;q=-0.0-o;r=m*l+i*q;i=+g[d+8>>2]-h;h=+g[d+12>>2]-j;j=m*i+o*h-p;o=i*q+m*h-r;h=+g[d+16>>2];d=c[a+148>>2]|0;m=0.0;e=0;s=-1;q=h;L1236:while(1){if((e|0)>=(d|0)){t=967;break}i=+g[a+84+(e<<3)>>2];l=+g[a+84+(e<<3)+4>>2];u=(+g[a+20+(e<<3)>>2]-p)*i+(+g[a+20+(e<<3)+4>>2]-r)*l;v=j*i+o*l;L1239:do{if(v==0.0){if(u<0.0){w=0;t=974;break L1236}else{x=m;y=s;z=q}}else{do{if(v<0.0){if(u>=m*v){break}x=u/v;y=e;z=q;break L1239}}while(0);if(v<=0.0){x=m;y=s;z=q;break}if(u>=q*v){x=m;y=s;z=q;break}x=m;y=s;z=u/v}}while(0);if(z<x){w=0;t=972;break}else{m=x;e=e+1|0;s=y;q=z}}if((t|0)==967){if(m<0.0|m>h){bd(5664,249,13872,6584);return 0}if((s|0)<=-1){w=0;return w|0}g[b+8>>2]=m;m=+g[f>>2];h=+g[a+84+(s<<3)>>2];z=+g[n>>2];q=+g[a+84+(s<<3)+4>>2];s=b;b=(g[k>>2]=m*h-z*q,c[k>>2]|0);a=(g[k>>2]=h*z+m*q,c[k>>2]|0)|0;c[s>>2]=0|b;c[s+4>>2]=a;w=1;return w|0}else if((t|0)==974){return w|0}else if((t|0)==972){return w|0}return 0}function df(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0.0,h=0.0,i=0,j=0.0,l=0.0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0,u=0,v=0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0;e=c[a+148>>2]|0;if((e|0)>2){f=0.0;h=0.0;i=0}else{bd(5664,306,13992,5928)}while(1){j=h+ +g[a+20+(i<<3)>>2];l=f+ +g[a+20+(i<<3)+4>>2];m=i+1|0;if((m|0)<(e|0)){f=l;h=j;i=m}else{break}}h=1.0/+(e|0);f=j*h;j=l*h;i=a+20|0;m=a+24|0;h=0.0;l=0.0;n=0;o=0.0;p=0.0;while(1){q=+g[a+20+(n<<3)>>2]-f;r=+g[a+20+(n<<3)+4>>2]-j;s=n+1|0;t=(s|0)<(e|0);if(t){u=a+20+(s<<3)|0;v=a+20+(s<<3)+4|0}else{u=i;v=m}w=+g[u>>2]-f;x=+g[v>>2]-j;y=q*x-r*w;z=y*.5;A=p+z;B=z*.3333333432674408;C=l+(q+w)*B;D=h+(r+x)*B;E=o+y*.0833333358168602*(w*w+(q*q+q*w)+(x*x+(r*r+r*x)));if(t){h=D;l=C;n=s;o=E;p=A}else{break}}p=A*d;g[b>>2]=p;if(A>1.1920928955078125e-7){o=1.0/A;A=C*o;C=D*o;o=f+A;f=j+C;n=b+4|0;v=(g[k>>2]=o,c[k>>2]|0);u=(g[k>>2]=f,c[k>>2]|0)|0;c[n>>2]=0|v;c[n+4>>2]=u;g[b+12>>2]=E*d+p*(o*o+f*f-(A*A+C*C));return}else{bd(5664,352,13992,5488)}}function dg(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;if((d|0)==0){e=0;return e|0}if((d|0)<=0){bd(5352,104,17408,8376);return 0}if((d|0)>640){e=vi(d)|0;return e|0}f=a[d+22040|0]|0;d=f&255;if((f&255)>=14){bd(5352,112,17408,6544);return 0}f=b+12+(d<<2)|0;g=c[f>>2]|0;if((g|0)!=0){c[f>>2]=c[g>>2]|0;e=g;return e|0}g=b+4|0;h=c[g>>2]|0;i=b+8|0;j=b|0;if((h|0)==(c[i>>2]|0)){b=c[j>>2]|0;k=h+128|0;c[i>>2]=k;i=vi(k<<3)|0;c[j>>2]=i;k=b;vq(i|0,k|0,c[g>>2]<<3);vr((c[j>>2]|0)+(c[g>>2]<<3)|0,0,1024);vj(k);l=c[g>>2]|0}else{l=h}h=c[j>>2]|0;j=vi(16384)|0;k=h+(l<<3)+4|0;c[k>>2]=j;i=c[22688+(d<<2)>>2]|0;c[h+(l<<3)>>2]=i;l=16384/(i|0)&-1;if((aa(l,i)|0)>=16385){bd(5352,140,17408,5888);return 0}h=l-1|0;L1299:do{if((h|0)>0){l=0;d=j;while(1){b=d+aa(l,i)|0;m=l+1|0;c[b>>2]=d+aa(m,i)|0;b=c[k>>2]|0;if((m|0)<(h|0)){l=m;d=b}else{n=b;break L1299}}}else{n=j}}while(0);c[n+aa(h,i)>>2]=0;c[f>>2]=c[c[k>>2]>>2]|0;c[g>>2]=(c[g>>2]|0)+1|0;e=c[k>>2]|0;return e|0}function dh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;e=b+102796|0;f=c[e>>2]|0;if((f|0)<=0){bd(4840,63,17080,5864)}g=f-1|0;if((c[b+102412+(g*12&-1)>>2]|0)!=(d|0)){bd(4840,65,17080,5464)}if((a[b+102412+(g*12&-1)+8|0]&1)<<24>>24==0){h=b+102412+(g*12&-1)+4|0;i=b+102400|0;c[i>>2]=(c[i>>2]|0)-(c[h>>2]|0)|0;j=f;k=h}else{vj(d);j=c[e>>2]|0;k=b+102412+(g*12&-1)+4|0}g=b+102404|0;c[g>>2]=(c[g>>2]|0)-(c[k>>2]|0)|0;c[e>>2]=j-1|0;return}function di(d,e,f){d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,r=0,s=0,t=0,u=0;h=e+4|0;i=+g[h>>2];if(!(i==i&!(D=0.0,D!=D)&i>+-q&i<+q)){bd(4720,27,15920,10600)}i=+g[e+8>>2];if(!(i==i&!(D=0.0,D!=D)&i>+-q&i<+q)){bd(4720,27,15920,10600)}j=e+16|0;i=+g[j>>2];if(!(i==i&!(D=0.0,D!=D)&i>+-q&i<+q)){bd(4720,28,15920,7920)}i=+g[e+20>>2];if(!(i==i&!(D=0.0,D!=D)&i>+-q&i<+q)){bd(4720,28,15920,7920)}k=e+12|0;i=+g[k>>2];if(!(i==i&!(D=0.0,D!=D)&i>+-q&i<+q)){bd(4720,29,15920,6424)}l=e+24|0;i=+g[l>>2];if(!(i==i&!(D=0.0,D!=D)&i>+-q&i<+q)){bd(4720,30,15920,5832)}m=e+32|0;i=+g[m>>2];if(i<0.0|i==i&!(D=0.0,D!=D)&i>+-q&i<+q^1){bd(4720,31,15920,5400)}n=e+28|0;i=+g[n>>2];if(i<0.0|i==i&!(D=0.0,D!=D)&i>+-q&i<+q^1){bd(4720,32,15920,4952)}o=d+4|0;b[o>>1]=0;if((a[e+39|0]&1)<<24>>24==0){p=0}else{b[o>>1]=8;p=8}if((a[e+38|0]&1)<<24>>24==0){r=p}else{s=p|16;b[o>>1]=s;r=s}if((a[e+36|0]&1)<<24>>24==0){t=r}else{s=r|4;b[o>>1]=s;t=s}if((a[e+37|0]&1)<<24>>24==0){u=t}else{s=t|2;b[o>>1]=s;u=s}if((a[e+40|0]&1)<<24>>24!=0){b[o>>1]=u|32}c[d+88>>2]=f;f=h;h=d+12|0;u=c[f>>2]|0;o=c[f+4>>2]|0;c[h>>2]=u;c[h+4>>2]=o;i=+g[k>>2];g[d+20>>2]=+T(+i);g[d+24>>2]=+S(+i);g[d+28>>2]=0.0;g[d+32>>2]=0.0;h=d+36|0;c[h>>2]=u;c[h+4>>2]=o;h=d+44|0;c[h>>2]=u;c[h+4>>2]=o;g[d+52>>2]=+g[k>>2];g[d+56>>2]=+g[k>>2];g[d+60>>2]=0.0;c[d+108>>2]=0;c[d+112>>2]=0;c[d+92>>2]=0;c[d+96>>2]=0;k=j;j=d+64|0;o=c[k+4>>2]|0;c[j>>2]=c[k>>2]|0;c[j+4>>2]=o;g[d+72>>2]=+g[l>>2];g[d+132>>2]=+g[n>>2];g[d+136>>2]=+g[m>>2];g[d+140>>2]=+g[e+48>>2];g[d+76>>2]=0.0;g[d+80>>2]=0.0;g[d+84>>2]=0.0;g[d+144>>2]=0.0;m=c[e>>2]|0;c[d>>2]=m;n=d+116|0;if((m|0)==2){g[n>>2]=1.0;g[d+120>>2]=1.0;m=d+124|0;g[m>>2]=0.0;l=d+128|0;g[l>>2]=0.0;o=e+44|0;j=c[o>>2]|0;k=d+148|0;c[k>>2]=j;h=d+100|0;c[h>>2]=0;u=d+104|0;c[u>>2]=0;return}else{g[n>>2]=0.0;g[d+120>>2]=0.0;m=d+124|0;g[m>>2]=0.0;l=d+128|0;g[l>>2]=0.0;o=e+44|0;j=c[o>>2]|0;k=d+148|0;c[k>>2]=j;h=d+100|0;c[h>>2]=0;u=d+104|0;c[u>>2]=0;return}}function dj(a,d){a=a|0;d=d|0;var e=0,f=0,h=0,j=0,l=0.0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0;e=i;i=i+16|0;f=e|0;h=a+88|0;if((c[(c[h>>2]|0)+102868>>2]&2|0)!=0){bd(4720,115,16e3,4688)}j=a|0;if((c[j>>2]|0)==(d|0)){i=e;return}c[j>>2]=d;dk(a);L1367:do{if((c[j>>2]|0)==0){g[a+64>>2]=0.0;g[a+68>>2]=0.0;g[a+72>>2]=0.0;l=+g[a+56>>2];g[a+52>>2]=l;d=a+44|0;m=a+36|0;n=c[d>>2]|0;o=c[d+4>>2]|0;c[m>>2]=n;c[m+4>>2]=o;m=f|0;d=f;p=f+8|0;q=+T(+l);g[p>>2]=q;r=+S(+l);g[p+4>>2]=r;l=+g[a+28>>2];s=+g[a+32>>2];t=(c[k>>2]=n,+g[k>>2])-(r*l-q*s);u=(c[k>>2]=o,+g[k>>2])-(q*l+r*s);o=(g[k>>2]=t,c[k>>2]|0);n=(g[k>>2]=u,c[k>>2]|0)|0;c[m>>2]=0|o;c[m+4>>2]=n;n=(c[h>>2]|0)+102872|0;m=c[a+100>>2]|0;if((m|0)==0){break}o=a+12|0;p=m;while(1){dI(p,n,d,o);m=c[p+4>>2]|0;if((m|0)==0){break L1367}else{p=m}}}}while(0);h=a+4|0;f=b[h>>1]|0;if((f&2)<<16>>16==0){b[h>>1]=f|2;g[a+144>>2]=0.0}g[a+76>>2]=0.0;g[a+80>>2]=0.0;g[a+84>>2]=0.0;f=c[a+100>>2]|0;if((f|0)==0){i=e;return}else{v=f}while(1){dJ(v);f=c[v+4>>2]|0;if((f|0)==0){break}else{v=f}}i=e;return}function dk(a){a=a|0;var d=0,e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0.0,z=0.0,A=0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0;d=i;i=i+16|0;e=d|0;f=a+116|0;h=a+120|0;j=a+124|0;l=a+128|0;m=a+28|0;g[m>>2]=0.0;g[a+32>>2]=0.0;vr(f|0,0,16);n=c[a>>2]|0;if((n|0)==0|(n|0)==1){o=a+12|0;p=a+36|0;q=c[o>>2]|0;r=c[o+4>>2]|0;c[p>>2]=q;c[p+4>>2]=r;p=a+44|0;c[p>>2]=q;c[p+4>>2]=r;g[a+52>>2]=+g[a+56>>2];i=d;return}else if((n|0)==2){n=4200;r=c[n+4>>2]|0;s=(c[k>>2]=c[n>>2]|0,+g[k>>2]);t=(c[k>>2]=r,+g[k>>2]);r=c[a+100>>2]|0;do{if((r|0)==0){u=0.0;v=s;w=t;x=1074}else{n=e|0;p=e+4|0;q=e+8|0;o=e+12|0;y=t;z=s;A=r;B=0.0;C=0.0;while(1){D=+g[A>>2];if(D==0.0){E=z;F=y;G=B;H=C}else{I=c[A+12>>2]|0;bQ[c[(c[I>>2]|0)+28>>2]&127](I,e,D);D=+g[n>>2];J=D+ +g[f>>2];g[f>>2]=J;K=z+D*+g[p>>2];L=y+D*+g[q>>2];D=+g[o>>2]+ +g[j>>2];g[j>>2]=D;E=K;F=L;G=J;H=D}I=c[A+4>>2]|0;if((I|0)==0){break}else{y=F;z=E;A=I;B=G;C=H}}if(G<=0.0){u=H;v=E;w=F;x=1074;break}C=1.0/G;g[h>>2]=C;M=E*C;N=F*C;O=G;P=H;break}}while(0);if((x|0)==1074){g[f>>2]=1.0;g[h>>2]=1.0;M=v;N=w;O=1.0;P=u}do{if(P>0.0){if((b[a+4>>1]&16)<<16>>16!=0){x=1080;break}u=P-(N*N+M*M)*O;g[j>>2]=u;if(u>0.0){Q=1.0/u;break}else{bd(4720,319,16088,11792)}}else{x=1080}}while(0);if((x|0)==1080){g[j>>2]=0.0;Q=0.0}g[l>>2]=Q;l=a+44|0;j=c[l+4>>2]|0;Q=(c[k>>2]=c[l>>2]|0,+g[k>>2]);O=(c[k>>2]=j,+g[k>>2]);j=m;m=(g[k>>2]=M,c[k>>2]|0);x=(g[k>>2]=N,c[k>>2]|0)|0;c[j>>2]=0|m;c[j+4>>2]=x;P=+g[a+24>>2];u=+g[a+20>>2];w=+g[a+12>>2]+(P*M-u*N);v=M*u+P*N+ +g[a+16>>2];x=(g[k>>2]=w,c[k>>2]|0);j=0|x;x=(g[k>>2]=v,c[k>>2]|0)|0;c[l>>2]=j;c[l+4>>2]=x;l=a+36|0;c[l>>2]=j;c[l+4>>2]=x;N=+g[a+72>>2];x=a+64|0;g[x>>2]=+g[x>>2]+(v-O)*(-0.0-N);x=a+68|0;g[x>>2]=N*(w-Q)+ +g[x>>2];i=d;return}else{bd(4720,284,16088,12360)}}function dl(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;f=d+88|0;h=c[f>>2]|0;if((c[h+102868>>2]&2|0)!=0){bd(4720,153,16120,4688);return 0}i=h|0;h=dg(i,44)|0;if((h|0)==0){j=0}else{b[h+32>>1]=1;b[h+34>>1]=-1;b[h+36>>1]=0;c[h+40>>2]=0;c[h+24>>2]=0;c[h+28>>2]=0;vr(h|0,0,16);j=h}c[j+40>>2]=c[e+4>>2]|0;g[j+16>>2]=+g[e+8>>2];g[j+20>>2]=+g[e+12>>2];h=j+8|0;c[h>>2]=d;k=j+4|0;c[k>>2]=0;l=j+32|0;m=e+22|0;b[l>>1]=b[m>>1]|0;b[l+2>>1]=b[m+2>>1]|0;b[l+4>>1]=b[m+4>>1]|0;a[j+38|0]=a[e+20|0]&1;m=c[e>>2]|0;l=bI[c[(c[m>>2]|0)+8>>2]&255](m,i)|0;m=j+12|0;c[m>>2]=l;n=bt[c[(c[l>>2]|0)+12>>2]&1023](l)|0;l=dg(i,n*28&-1)|0;i=j+24|0;c[i>>2]=l;L1416:do{if((n|0)>0){c[l+16>>2]=0;c[(c[i>>2]|0)+24>>2]=-1;if((n|0)>1){o=1}else{break}while(1){c[(c[i>>2]|0)+(o*28&-1)+16>>2]=0;c[(c[i>>2]|0)+(o*28&-1)+24>>2]=-1;p=o+1|0;if((p|0)<(n|0)){o=p}else{break L1416}}}}while(0);o=j+28|0;c[o>>2]=0;n=j|0;g[n>>2]=+g[e+16>>2];L1421:do{if((b[d+4>>1]&32)<<16>>16!=0){e=(c[f>>2]|0)+102872|0;l=d+12|0;p=c[m>>2]|0;q=bt[c[(c[p>>2]|0)+12>>2]&1023](p)|0;c[o>>2]=q;if((q|0)>0){r=0}else{break}while(1){q=c[i>>2]|0;p=q+(r*28&-1)|0;s=c[m>>2]|0;t=p|0;bR[c[(c[s>>2]|0)+24>>2]&127](s,t,l,r);c[q+(r*28&-1)+24>>2]=b5(e,t,p)|0;c[q+(r*28&-1)+16>>2]=j;c[q+(r*28&-1)+20>>2]=r;q=r+1|0;if((q|0)<(c[o>>2]|0)){r=q}else{break L1421}}}}while(0);r=d+100|0;c[k>>2]=c[r>>2]|0;c[r>>2]=j;r=d+104|0;c[r>>2]=(c[r>>2]|0)+1|0;c[h>>2]=d;if(+g[n>>2]<=0.0){u=c[f>>2]|0;v=u+102868|0;w=c[v>>2]|0;x=w|1;c[v>>2]=x;return j|0}dk(d);u=c[f>>2]|0;v=u+102868|0;w=c[v>>2]|0;x=w|1;c[v>>2]=x;return j|0}function dm(a){a=a|0;return}function dn(a){a=a|0;return}function dp(a){a=a|0;var d=0,e=0,f=0,j=0.0,k=0,l=0;d=i;e=a+8|0;f=c[e>>2]|0;dc(11584,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(11232,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(11032,(v=i,i=i+8|0,c[v>>2]=c[a>>2]|0,v)|0);j=+g[a+16>>2];dc(10864,(v=i,i=i+16|0,h[v>>3]=+g[a+12>>2],h[v+8>>3]=j,v)|0);dc(10576,(v=i,i=i+8|0,h[v>>3]=+g[a+56>>2],v)|0);j=+g[a+68>>2];dc(10464,(v=i,i=i+16|0,h[v>>3]=+g[a+64>>2],h[v+8>>3]=j,v)|0);dc(10320,(v=i,i=i+8|0,h[v>>3]=+g[a+72>>2],v)|0);dc(10064,(v=i,i=i+8|0,h[v>>3]=+g[a+132>>2],v)|0);dc(9640,(v=i,i=i+8|0,h[v>>3]=+g[a+136>>2],v)|0);k=a+4|0;dc(9568,(v=i,i=i+8|0,c[v>>2]=b[k>>1]&4,v)|0);dc(9144,(v=i,i=i+8|0,c[v>>2]=b[k>>1]&2,v)|0);dc(8864,(v=i,i=i+8|0,c[v>>2]=b[k>>1]&16,v)|0);dc(8712,(v=i,i=i+8|0,c[v>>2]=b[k>>1]&8,v)|0);dc(8344,(v=i,i=i+8|0,c[v>>2]=b[k>>1]&32,v)|0);dc(8128,(v=i,i=i+8|0,h[v>>3]=+g[a+140>>2],v)|0);dc(7840,(v=i,i=i+8|0,c[v>>2]=c[e>>2]|0,v)|0);dc(7344,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);e=c[a+100>>2]|0;if((e|0)==0){dc(11328,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);i=d;return}else{l=e}while(1){dc(7480,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dK(l,f);dc(7352,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);e=c[l+4>>2]|0;if((e|0)==0){break}else{l=e}}dc(11328,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);i=d;return}function dq(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;d=c[(c[b+48>>2]|0)+8>>2]|0;e=c[(c[b+52>>2]|0)+8>>2]|0;f=c[a+72>>2]|0;do{if((f|0)!=0){if((c[b+4>>2]&2|0)==0){break}bs[c[(c[f>>2]|0)+12>>2]&511](f,b)}}while(0);f=b+8|0;g=c[f>>2]|0;h=b+12|0;if((g|0)!=0){c[g+12>>2]=c[h>>2]|0}g=c[h>>2]|0;if((g|0)!=0){c[g+8>>2]=c[f>>2]|0}f=a+60|0;if((c[f>>2]|0)==(b|0)){c[f>>2]=c[h>>2]|0}h=b+24|0;f=c[h>>2]|0;g=b+28|0;if((f|0)!=0){c[f+12>>2]=c[g>>2]|0}f=c[g>>2]|0;if((f|0)!=0){c[f+8>>2]=c[h>>2]|0}h=d+112|0;if((b+16|0)==(c[h>>2]|0)){c[h>>2]=c[g>>2]|0}g=b+40|0;h=c[g>>2]|0;d=b+44|0;if((h|0)!=0){c[h+12>>2]=c[d>>2]|0}h=c[d>>2]|0;if((h|0)!=0){c[h+8>>2]=c[g>>2]|0}g=e+112|0;if((b+32|0)!=(c[g>>2]|0)){i=a+76|0;j=c[i>>2]|0;en(b,j);k=a+64|0;l=c[k>>2]|0;m=l-1|0;c[k>>2]=m;return}c[g>>2]=c[d>>2]|0;i=a+76|0;j=c[i>>2]|0;en(b,j);k=a+64|0;l=c[k>>2]|0;m=l-1|0;c[k>>2]=m;return}function dr(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;f=d+88|0;if((c[(c[f>>2]|0)+102868>>2]&2|0)!=0){bd(4720,201,16040,4688)}g=e+8|0;if((c[g>>2]|0)!=(d|0)){bd(4720,207,16040,4464)}h=d+104|0;if((c[h>>2]|0)<=0){bd(4720,210,16040,4208)}i=d+100|0;while(1){j=c[i>>2]|0;if((j|0)==0){k=1141;break}if((j|0)==(e|0)){break}else{i=j+4|0}}if((k|0)==1141){bd(4720,226,16040,12760)}j=e+4|0;c[i>>2]=c[j>>2]|0;i=c[d+112>>2]|0;L1487:do{if((i|0)!=0){l=i;while(1){m=c[l+4>>2]|0;n=c[l+12>>2]|0;if((c[m+48>>2]|0)==(e|0)|(c[m+52>>2]|0)==(e|0)){dq((c[f>>2]|0)+102872|0,m)}if((n|0)==0){break L1487}else{l=n}}}}while(0);i=c[f>>2]|0;f=i|0;if((b[d+4>>1]&32)<<16>>16!=0){l=e+28|0;L1496:do{if((c[l>>2]|0)>0){n=e+24|0;m=i+102912|0;o=i+102904|0;p=i+102900|0;q=i+102872|0;r=0;while(1){s=(c[n>>2]|0)+(r*28&-1)+24|0;t=c[s>>2]|0;u=c[m>>2]|0;v=0;while(1){if((v|0)>=(u|0)){break}w=(c[o>>2]|0)+(v<<2)|0;if((c[w>>2]|0)==(t|0)){k=1151;break}else{v=v+1|0}}if((k|0)==1151){k=0;c[w>>2]=-1}c[p>>2]=(c[p>>2]|0)-1|0;cm(q,t);c[s>>2]=-1;v=r+1|0;if((v|0)<(c[l>>2]|0)){r=v}else{break L1496}}}}while(0);c[l>>2]=0}dL(e,f);c[g>>2]=0;c[j>>2]=0;j=a[22084]|0;if((j&255)<14){g=i+12+((j&255)<<2)|0;c[e>>2]=c[g>>2]|0;c[g>>2]=e;c[h>>2]=(c[h>>2]|0)-1|0;dk(d);return}else{bd(5352,173,17448,6544)}}function ds(a,d){a=a|0;d=d|0;var e=0,f=0,h=0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0.0,q=0.0,r=0.0;if((c[(c[a+88>>2]|0)+102868>>2]&2|0)!=0){bd(4720,340,16232,4688)}if((c[a>>2]|0)!=2){return}e=a+120|0;g[e>>2]=0.0;f=a+124|0;g[f>>2]=0.0;h=a+128|0;g[h>>2]=0.0;i=+g[d>>2];j=i>0.0?i:1.0;g[a+116>>2]=j;g[e>>2]=1.0/j;i=+g[d+12>>2];do{if(i>0.0){if((b[a+4>>1]&16)<<16>>16!=0){break}l=+g[d+4>>2];m=+g[d+8>>2];n=i-j*(l*l+m*m);g[f>>2]=n;if(n>0.0){g[h>>2]=1.0/n;break}else{bd(4720,366,16232,11792)}}}while(0);h=a+44|0;f=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);i=(c[k>>2]=f,+g[k>>2]);f=d+4|0;d=a+28|0;e=c[f>>2]|0;o=c[f+4>>2]|0;c[d>>2]=e;c[d+4>>2]=o;n=+g[a+24>>2];m=(c[k>>2]=e,+g[k>>2]);l=+g[a+20>>2];p=(c[k>>2]=o,+g[k>>2]);q=+g[a+12>>2]+(n*m-l*p);r=m*l+n*p+ +g[a+16>>2];o=(g[k>>2]=q,c[k>>2]|0);e=0|o;o=(g[k>>2]=r,c[k>>2]|0)|0;c[h>>2]=e;c[h+4>>2]=o;h=a+36|0;c[h>>2]=e;c[h+4>>2]=o;p=+g[a+72>>2];o=a+64|0;g[o>>2]=+g[o>>2]+(r-i)*(-0.0-p);o=a+68|0;g[o>>2]=p*(q-j)+ +g[o>>2];return}function dt(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0,h=0,i=0.0,j=0.0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0,u=0,v=0;e=a+88|0;f=c[e>>2]|0;if((c[f+102868>>2]&2|0)!=0){bd(4720,404,16176,4688)}h=a+12|0;i=+T(+d);g[a+20>>2]=i;j=+S(+d);g[a+24>>2]=j;l=b;b=h;m=c[l>>2]|0;n=c[l+4>>2]|0;c[b>>2]=m;c[b+4>>2]=n;o=+g[a+28>>2];p=+g[a+32>>2];q=(c[k>>2]=m,+g[k>>2])+(j*o-i*p);r=o*i+j*p+(c[k>>2]=n,+g[k>>2]);n=a+44|0;m=(g[k>>2]=q,c[k>>2]|0);b=0|m;m=(g[k>>2]=r,c[k>>2]|0)|0;c[n>>2]=b;c[n+4>>2]=m;g[a+56>>2]=d;n=a+36|0;c[n>>2]=b;c[n+4>>2]=m;g[a+52>>2]=d;m=f+102872|0;n=c[a+100>>2]|0;if((n|0)==0){s=f;t=s+102872|0;u=t|0;dz(u,t);return}else{v=n}while(1){dI(v,m,h,h);n=c[v+4>>2]|0;if((n|0)==0){break}else{v=n}}s=c[e>>2]|0;t=s+102872|0;u=t|0;dz(u,t);return}function du(a,d){a=a|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;e=a+88|0;f=c[e>>2]|0;if((c[f+102868>>2]&2|0)!=0){bd(4720,443,15968,4688)}g=a+4|0;h=b[g>>1]|0;if(!((h&32)<<16>>16!=0^d)){return}if(d){b[g>>1]=h|32;d=f+102872|0;i=c[a+100>>2]|0;if((i|0)==0){return}j=a+12|0;k=i;while(1){i=k+28|0;if((c[i>>2]|0)!=0){l=1184;break}m=k+12|0;n=c[m>>2]|0;o=bt[c[(c[n>>2]|0)+12>>2]&1023](n)|0;c[i>>2]=o;L1551:do{if((o|0)>0){n=k+24|0;p=0;while(1){q=c[n>>2]|0;r=q+(p*28&-1)|0;s=c[m>>2]|0;t=r|0;bR[c[(c[s>>2]|0)+24>>2]&127](s,t,j,p);c[q+(p*28&-1)+24>>2]=b5(d,t,r)|0;c[q+(p*28&-1)+16>>2]=k;c[q+(p*28&-1)+20>>2]=p;q=p+1|0;if((q|0)<(c[i>>2]|0)){p=q}else{break L1551}}}}while(0);i=c[k+4>>2]|0;if((i|0)==0){l=1205;break}else{k=i}}if((l|0)==1184){bd(12280,124,14968,12608)}else if((l|0)==1205){return}}b[g>>1]=h&-33;h=c[a+100>>2]|0;L1560:do{if((h|0)!=0){g=f+102912|0;k=f+102904|0;d=f+102900|0;j=f+102872|0;i=h;while(1){m=i+28|0;L1564:do{if((c[m>>2]|0)>0){o=i+24|0;p=0;while(1){n=(c[o>>2]|0)+(p*28&-1)+24|0;q=c[n>>2]|0;r=c[g>>2]|0;t=0;while(1){if((t|0)>=(r|0)){break}u=(c[k>>2]|0)+(t<<2)|0;if((c[u>>2]|0)==(q|0)){l=1196;break}else{t=t+1|0}}if((l|0)==1196){l=0;c[u>>2]=-1}c[d>>2]=(c[d>>2]|0)-1|0;cm(j,q);c[n>>2]=-1;t=p+1|0;if((t|0)<(c[m>>2]|0)){p=t}else{break L1564}}}}while(0);c[m>>2]=0;p=c[i+4>>2]|0;if((p|0)==0){break L1560}else{i=p}}}}while(0);u=a+112|0;a=c[u>>2]|0;L1576:do{if((a|0)!=0){l=a;while(1){h=c[l+12>>2]|0;dq((c[e>>2]|0)+102872|0,c[l+4>>2]|0);if((h|0)==0){break L1576}else{l=h}}}}while(0);c[u>>2]=0;return}function dv(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=c[a>>2]|0;e=c[b>>2]|0;if((d|0)<(e|0)){f=1;return f|0}if((d|0)!=(e|0)){f=0;return f|0}f=(c[a+4>>2]|0)<(c[b+4>>2]|0);return f|0}function dw(d,e,f){d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;h=c[e+16>>2]|0;i=c[f+16>>2]|0;j=c[e+20>>2]|0;e=c[f+20>>2]|0;f=c[h+8>>2]|0;k=c[i+8>>2]|0;if((f|0)==(k|0)){return}l=c[k+112>>2]|0;L1593:do{if((l|0)!=0){m=l;while(1){if((c[m>>2]|0)==(f|0)){n=c[m+4>>2]|0;o=c[n+48>>2]|0;p=c[n+52>>2]|0;q=c[n+56>>2]|0;r=c[n+60>>2]|0;if((o|0)==(h|0)&(p|0)==(i|0)&(q|0)==(j|0)&(r|0)==(e|0)){s=1248;break}if((o|0)==(i|0)&(p|0)==(h|0)&(q|0)==(e|0)&(r|0)==(j|0)){s=1242;break}}r=c[m+12>>2]|0;if((r|0)==0){break L1593}else{m=r}}if((s|0)==1248){return}else if((s|0)==1242){return}}}while(0);do{if((c[k>>2]|0)!=2){if((c[f>>2]|0)==2){break}return}}while(0);s=c[k+108>>2]|0;L1608:do{if((s|0)!=0){k=s;while(1){if((c[k>>2]|0)==(f|0)){if((a[(c[k+4>>2]|0)+61|0]&1)<<24>>24==0){break}}l=c[k+12>>2]|0;if((l|0)==0){break L1608}else{k=l}}return}}while(0);f=c[d+68>>2]|0;do{if((f|0)!=0){if(by[c[(c[f>>2]|0)+8>>2]&127](f,h,i)|0){break}return}}while(0);f=em(h,j,i,e,c[d+76>>2]|0)|0;if((f|0)==0){return}e=c[(c[f+48>>2]|0)+8>>2]|0;i=c[(c[f+52>>2]|0)+8>>2]|0;c[f+8>>2]=0;j=d+60|0;c[f+12>>2]=c[j>>2]|0;h=c[j>>2]|0;if((h|0)!=0){c[h+8>>2]=f}c[j>>2]=f;j=f+16|0;c[f+20>>2]=f;c[j>>2]=i;c[f+24>>2]=0;h=e+112|0;c[f+28>>2]=c[h>>2]|0;s=c[h>>2]|0;if((s|0)!=0){c[s+8>>2]=j}c[h>>2]=j;j=f+32|0;c[f+36>>2]=f;c[j>>2]=e;c[f+40>>2]=0;h=i+112|0;c[f+44>>2]=c[h>>2]|0;f=c[h>>2]|0;if((f|0)!=0){c[f+8>>2]=j}c[h>>2]=j;j=e+4|0;h=b[j>>1]|0;if((h&2)<<16>>16==0){b[j>>1]=h|2;g[e+144>>2]=0.0}e=i+4|0;h=b[e>>1]|0;if((h&2)<<16>>16==0){b[e>>1]=h|2;g[i+144>>2]=0.0}i=d+64|0;c[i>>2]=(c[i>>2]|0)+1|0;return}function dx(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+1040|0;f=e|0;h=f+4|0;j=f|0;c[j>>2]=h;k=f+1028|0;c[k>>2]=0;l=f+1032|0;c[l>>2]=256;c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[a>>2]|0;f=(c[k>>2]|0)+1|0;c[k>>2]=f;L1640:do{if((f|0)>0){m=a+4|0;n=d|0;o=d+4|0;p=d+8|0;q=d+12|0;r=b+56|0;s=b+52|0;t=b+48|0;u=b+44|0;v=f;while(1){w=v-1|0;c[k>>2]=w;x=c[j>>2]|0;y=c[x+(w<<2)>>2]|0;do{if((y|0)==-1){z=w}else{A=c[m>>2]|0;if(+g[n>>2]- +g[A+(y*36&-1)+8>>2]>0.0|+g[o>>2]- +g[A+(y*36&-1)+12>>2]>0.0|+g[A+(y*36&-1)>>2]- +g[p>>2]>0.0|+g[A+(y*36&-1)+4>>2]- +g[q>>2]>0.0){z=w;break}B=A+(y*36&-1)+24|0;if((c[B>>2]|0)==-1){C=c[r>>2]|0;if((C|0)==(y|0)){z=w;break}D=c[s>>2]|0;if((D|0)==(c[t>>2]|0)){E=c[u>>2]|0;c[t>>2]=D<<1;F=vi(D*24&-1)|0;c[u>>2]=F;G=E;vq(F|0,G|0,(c[s>>2]|0)*12&-1);vj(G);H=c[r>>2]|0;I=c[s>>2]|0}else{H=C;I=D}c[(c[u>>2]|0)+(I*12&-1)>>2]=(H|0)>(y|0)?y:H;D=c[r>>2]|0;c[(c[u>>2]|0)+((c[s>>2]|0)*12&-1)+4>>2]=(D|0)<(y|0)?y:D;c[s>>2]=(c[s>>2]|0)+1|0;z=c[k>>2]|0;break}do{if((w|0)==(c[l>>2]|0)){c[l>>2]=w<<1;D=vi(w<<3)|0;c[j>>2]=D;C=x;vq(D|0,C|0,c[k>>2]<<2);if((x|0)==(h|0)){break}vj(C)}}while(0);c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[B>>2]|0;C=(c[k>>2]|0)+1|0;c[k>>2]=C;D=A+(y*36&-1)+28|0;do{if((C|0)==(c[l>>2]|0)){G=c[j>>2]|0;c[l>>2]=C<<1;F=vi(C<<3)|0;c[j>>2]=F;E=G;vq(F|0,E|0,c[k>>2]<<2);if((G|0)==(h|0)){break}vj(E)}}while(0);c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[D>>2]|0;C=(c[k>>2]|0)+1|0;c[k>>2]=C;z=C}}while(0);if((z|0)>0){v=z}else{break L1640}}}}while(0);z=c[j>>2]|0;if((z|0)==(h|0)){i=e;return}vj(z);c[j>>2]=0;i=e;return}function dy(d){d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=c[d+60>>2]|0;if((e|0)==0){return}f=d+12|0;h=d+4|0;i=d+72|0;j=d+68|0;k=e;L1672:while(1){e=c[k+48>>2]|0;l=c[k+52>>2]|0;m=c[k+56>>2]|0;n=c[k+60>>2]|0;o=c[e+8>>2]|0;p=c[l+8>>2]|0;q=k+4|0;r=c[q>>2]|0;L1674:do{if((r&8|0)==0){s=1287}else{do{if((c[p>>2]|0)==2){s=1276}else{if((c[o>>2]|0)==2){s=1276;break}else{break}}}while(0);L1678:do{if((s|0)==1276){s=0;t=c[p+108>>2]|0;L1680:do{if((t|0)!=0){u=t;while(1){if((c[u>>2]|0)==(o|0)){if((a[(c[u+4>>2]|0)+61|0]&1)<<24>>24==0){break L1678}}v=c[u+12>>2]|0;if((v|0)==0){break L1680}else{u=v}}}}while(0);t=c[j>>2]|0;do{if((t|0)==0){w=r}else{if(by[c[(c[t>>2]|0)+8>>2]&127](t,e,l)|0){w=c[q>>2]|0;break}else{u=c[k+12>>2]|0;dq(d,k);x=u;break L1674}}}while(0);c[q>>2]=w&-9;s=1287;break L1674}}while(0);t=c[k+12>>2]|0;dq(d,k);x=t;break}}while(0);do{if((s|0)==1287){s=0;if((b[o+4>>1]&2)<<16>>16==0){y=0}else{y=(c[o>>2]|0)!=0&1}if((b[p+4>>1]&2)<<16>>16==0){z=1}else{z=(c[p>>2]|0)==0}if((y|0)==0&z){x=c[k+12>>2]|0;break}q=c[(c[e+24>>2]|0)+(m*28&-1)+24>>2]|0;r=c[(c[l+24>>2]|0)+(n*28&-1)+24>>2]|0;if((q|0)<=-1){s=1305;break L1672}t=c[f>>2]|0;if((t|0)<=(q|0)){s=1304;break L1672}u=c[h>>2]|0;if(!((r|0)>-1&(t|0)>(r|0))){s=1297;break L1672}if(+g[u+(r*36&-1)>>2]- +g[u+(q*36&-1)+8>>2]>0.0|+g[u+(r*36&-1)+4>>2]- +g[u+(q*36&-1)+12>>2]>0.0|+g[u+(q*36&-1)>>2]- +g[u+(r*36&-1)+8>>2]>0.0|+g[u+(q*36&-1)+4>>2]- +g[u+(r*36&-1)+12>>2]>0.0){r=c[k+12>>2]|0;dq(d,k);x=r;break}else{ei(k,c[i>>2]|0);x=c[k+12>>2]|0;break}}}while(0);if((x|0)==0){s=1302;break}else{k=x}}if((s|0)==1297){bd(10360,159,14456,9904)}else if((s|0)==1302){return}else if((s|0)==1304){bd(10360,159,14456,9904)}else if((s|0)==1305){bd(10360,159,14456,9904)}}function dz(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;d=i;i=i+8|0;e=d|0;f=a+52|0;c[f>>2]=0;g=a+40|0;h=c[g>>2]|0;do{if((h|0)>0){j=a+32|0;k=a+56|0;l=a|0;m=a+12|0;n=a+4|0;o=0;p=h;while(1){q=c[(c[j>>2]|0)+(o<<2)>>2]|0;c[k>>2]=q;if((q|0)==-1){r=p}else{if((q|0)<=-1){s=1327;break}if((c[m>>2]|0)<=(q|0)){s=1328;break}dx(l,a,(c[n>>2]|0)+(q*36&-1)|0);r=c[g>>2]|0}q=o+1|0;if((q|0)<(r|0)){o=q;p=r}else{s=1314;break}}if((s|0)==1314){t=c[f>>2]|0;break}else if((s|0)==1327){bd(10360,159,14456,9904)}else if((s|0)==1328){bd(10360,159,14456,9904)}}else{t=0}}while(0);c[g>>2]=0;g=a+44|0;r=c[g>>2]|0;c[e>>2]=122;dA(r,r+(t*12&-1)|0,e);if((c[f>>2]|0)<=0){i=d;return}e=a+12|0;t=a+4|0;a=0;L1735:while(1){r=c[g>>2]|0;h=r+(a*12&-1)|0;p=c[h>>2]|0;if((p|0)<=-1){s=1331;break}o=c[e>>2]|0;if((o|0)<=(p|0)){s=1332;break}n=c[t>>2]|0;l=r+(a*12&-1)+4|0;r=c[l>>2]|0;if(!((r|0)>-1&(o|0)>(r|0))){s=1321;break}dw(b,c[n+(p*36&-1)+16>>2]|0,c[n+(r*36&-1)+16>>2]|0);r=c[f>>2]|0;n=a;while(1){p=n+1|0;if((p|0)>=(r|0)){s=1329;break L1735}o=c[g>>2]|0;if((c[o+(p*12&-1)>>2]|0)!=(c[h>>2]|0)){a=p;continue L1735}if((c[o+(p*12&-1)+4>>2]|0)==(c[l>>2]|0)){n=p}else{a=p;continue L1735}}}if((s|0)==1332){bd(10360,153,14408,9904)}else if((s|0)==1321){bd(10360,153,14408,9904)}else if((s|0)==1331){bd(10360,153,14408,9904)}else if((s|0)==1329){i=d;return}}function dA(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0;e=i;i=i+480|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;l=e+224|0;m=e+240|0;n=e+256|0;o=e+272|0;p=e+288|0;q=e+304|0;r=e+320|0;s=e+336|0;t=e+352|0;u=e+368|0;v=e+464|0;w=e+160|0;x=e+176|0;y=e+192|0;z=e+208|0;A=e+384|0;B=e+400|0;C=e+432|0;D=e+448|0;E=e+416|0;F=e+80|0;G=e+96|0;H=e+112|0;I=e+128|0;J=e+144|0;K=a;a=b;L1750:while(1){b=a;L=a-12|0;M=L;N=K;L1752:while(1){O=N;P=b-O|0;Q=(P|0)/12&-1;if((Q|0)==4){R=1346;break L1750}else if((Q|0)==3){R=1338;break L1750}else if((Q|0)==2){R=1336;break L1750}else if((Q|0)==5){R=1347;break L1750}else if((Q|0)==0|(Q|0)==1){R=1414;break L1750}if((P|0)<372){R=1353;break L1750}Q=(P|0)/24&-1;S=N+(Q*12&-1)|0;do{if((P|0)>11988){T=(P|0)/48&-1;U=N+(T*12&-1)|0;V=N+((T+Q|0)*12&-1)|0;T=dB(N,U,S,V,d)|0;if(!(bI[c[d>>2]&255](L,V)|0)){W=T;break}X=V;c[z>>2]=c[X>>2]|0;c[z+4>>2]=c[X+4>>2]|0;c[z+8>>2]=c[X+8>>2]|0;c[X>>2]=c[M>>2]|0;c[X+4>>2]=c[M+4>>2]|0;c[X+8>>2]=c[M+8>>2]|0;c[M>>2]=c[z>>2]|0;c[M+4>>2]=c[z+4>>2]|0;c[M+8>>2]=c[z+8>>2]|0;if(!(bI[c[d>>2]&255](V,S)|0)){W=T+1|0;break}V=S;c[x>>2]=c[V>>2]|0;c[x+4>>2]=c[V+4>>2]|0;c[x+8>>2]=c[V+8>>2]|0;c[V>>2]=c[X>>2]|0;c[V+4>>2]=c[X+4>>2]|0;c[V+8>>2]=c[X+8>>2]|0;c[X>>2]=c[x>>2]|0;c[X+4>>2]=c[x+4>>2]|0;c[X+8>>2]=c[x+8>>2]|0;if(!(bI[c[d>>2]&255](S,U)|0)){W=T+2|0;break}X=U;c[w>>2]=c[X>>2]|0;c[w+4>>2]=c[X+4>>2]|0;c[w+8>>2]=c[X+8>>2]|0;c[X>>2]=c[V>>2]|0;c[X+4>>2]=c[V+4>>2]|0;c[X+8>>2]=c[V+8>>2]|0;c[V>>2]=c[w>>2]|0;c[V+4>>2]=c[w+4>>2]|0;c[V+8>>2]=c[w+8>>2]|0;if(!(bI[c[d>>2]&255](U,N)|0)){W=T+3|0;break}U=N;c[y>>2]=c[U>>2]|0;c[y+4>>2]=c[U+4>>2]|0;c[y+8>>2]=c[U+8>>2]|0;c[U>>2]=c[X>>2]|0;c[U+4>>2]=c[X+4>>2]|0;c[U+8>>2]=c[X+8>>2]|0;c[X>>2]=c[y>>2]|0;c[X+4>>2]=c[y+4>>2]|0;c[X+8>>2]=c[y+8>>2]|0;W=T+4|0}else{T=bI[c[d>>2]&255](S,N)|0;X=bI[c[d>>2]&255](L,S)|0;if(!T){if(!X){W=0;break}T=S;c[J>>2]=c[T>>2]|0;c[J+4>>2]=c[T+4>>2]|0;c[J+8>>2]=c[T+8>>2]|0;c[T>>2]=c[M>>2]|0;c[T+4>>2]=c[M+4>>2]|0;c[T+8>>2]=c[M+8>>2]|0;c[M>>2]=c[J>>2]|0;c[M+4>>2]=c[J+4>>2]|0;c[M+8>>2]=c[J+8>>2]|0;if(!(bI[c[d>>2]&255](S,N)|0)){W=1;break}U=N;c[H>>2]=c[U>>2]|0;c[H+4>>2]=c[U+4>>2]|0;c[H+8>>2]=c[U+8>>2]|0;c[U>>2]=c[T>>2]|0;c[U+4>>2]=c[T+4>>2]|0;c[U+8>>2]=c[T+8>>2]|0;c[T>>2]=c[H>>2]|0;c[T+4>>2]=c[H+4>>2]|0;c[T+8>>2]=c[H+8>>2]|0;W=2;break}T=N;if(X){c[F>>2]=c[T>>2]|0;c[F+4>>2]=c[T+4>>2]|0;c[F+8>>2]=c[T+8>>2]|0;c[T>>2]=c[M>>2]|0;c[T+4>>2]=c[M+4>>2]|0;c[T+8>>2]=c[M+8>>2]|0;c[M>>2]=c[F>>2]|0;c[M+4>>2]=c[F+4>>2]|0;c[M+8>>2]=c[F+8>>2]|0;W=1;break}c[G>>2]=c[T>>2]|0;c[G+4>>2]=c[T+4>>2]|0;c[G+8>>2]=c[T+8>>2]|0;X=S;c[T>>2]=c[X>>2]|0;c[T+4>>2]=c[X+4>>2]|0;c[T+8>>2]=c[X+8>>2]|0;c[X>>2]=c[G>>2]|0;c[X+4>>2]=c[G+4>>2]|0;c[X+8>>2]=c[G+8>>2]|0;if(!(bI[c[d>>2]&255](L,S)|0)){W=1;break}c[I>>2]=c[X>>2]|0;c[I+4>>2]=c[X+4>>2]|0;c[I+8>>2]=c[X+8>>2]|0;c[X>>2]=c[M>>2]|0;c[X+4>>2]=c[M+4>>2]|0;c[X+8>>2]=c[M+8>>2]|0;c[M>>2]=c[I>>2]|0;c[M+4>>2]=c[I+4>>2]|0;c[M+8>>2]=c[I+8>>2]|0;W=2}}while(0);do{if(bI[c[d>>2]&255](N,S)|0){Y=L;Z=W}else{Q=L;while(1){_=Q-12|0;if((N|0)==(_|0)){break}if(bI[c[d>>2]&255](_,S)|0){R=1395;break}else{Q=_}}if((R|0)==1395){R=0;Q=N;c[E>>2]=c[Q>>2]|0;c[E+4>>2]=c[Q+4>>2]|0;c[E+8>>2]=c[Q+8>>2]|0;P=_;c[Q>>2]=c[P>>2]|0;c[Q+4>>2]=c[P+4>>2]|0;c[Q+8>>2]=c[P+8>>2]|0;c[P>>2]=c[E>>2]|0;c[P+4>>2]=c[E+4>>2]|0;c[P+8>>2]=c[E+8>>2]|0;Y=_;Z=W+1|0;break}P=N+12|0;if(bI[c[d>>2]&255](N,L)|0){$=P}else{Q=P;while(1){if((Q|0)==(L|0)){R=1415;break L1750}aa=Q+12|0;if(bI[c[d>>2]&255](N,Q)|0){break}else{Q=aa}}P=Q;c[D>>2]=c[P>>2]|0;c[D+4>>2]=c[P+4>>2]|0;c[D+8>>2]=c[P+8>>2]|0;c[P>>2]=c[M>>2]|0;c[P+4>>2]=c[M+4>>2]|0;c[P+8>>2]=c[M+8>>2]|0;c[M>>2]=c[D>>2]|0;c[M+4>>2]=c[D+4>>2]|0;c[M+8>>2]=c[D+8>>2]|0;$=aa}if(($|0)==(L|0)){R=1426;break L1750}else{ab=L;ac=$}while(1){P=ac;while(1){ad=P+12|0;if(bI[c[d>>2]&255](N,P)|0){ae=ab;break}else{P=ad}}while(1){af=ae-12|0;if(bI[c[d>>2]&255](N,af)|0){ae=af}else{break}}if(P>>>0>=af>>>0){N=P;continue L1752}X=P;c[C>>2]=c[X>>2]|0;c[C+4>>2]=c[X+4>>2]|0;c[C+8>>2]=c[X+8>>2]|0;T=af;c[X>>2]=c[T>>2]|0;c[X+4>>2]=c[T+4>>2]|0;c[X+8>>2]=c[T+8>>2]|0;c[T>>2]=c[C>>2]|0;c[T+4>>2]=c[C+4>>2]|0;c[T+8>>2]=c[C+8>>2]|0;ab=af;ac=ad}}}while(0);Q=N+12|0;L1795:do{if(Q>>>0<Y>>>0){T=Y;X=Q;U=Z;V=S;while(1){ag=X;while(1){ah=ag+12|0;if(bI[c[d>>2]&255](ag,V)|0){ag=ah}else{ai=T;break}}while(1){aj=ai-12|0;if(bI[c[d>>2]&255](aj,V)|0){break}else{ai=aj}}if(ag>>>0>aj>>>0){ak=ag;al=U;am=V;break L1795}P=ag;c[B>>2]=c[P>>2]|0;c[B+4>>2]=c[P+4>>2]|0;c[B+8>>2]=c[P+8>>2]|0;an=aj;c[P>>2]=c[an>>2]|0;c[P+4>>2]=c[an+4>>2]|0;c[P+8>>2]=c[an+8>>2]|0;c[an>>2]=c[B>>2]|0;c[an+4>>2]=c[B+4>>2]|0;c[an+8>>2]=c[B+8>>2]|0;T=aj;X=ah;U=U+1|0;V=(V|0)==(ag|0)?aj:V}}else{ak=Q;al=Z;am=S}}while(0);do{if((ak|0)==(am|0)){ao=al}else{if(!(bI[c[d>>2]&255](am,ak)|0)){ao=al;break}S=ak;c[A>>2]=c[S>>2]|0;c[A+4>>2]=c[S+4>>2]|0;c[A+8>>2]=c[S+8>>2]|0;Q=am;c[S>>2]=c[Q>>2]|0;c[S+4>>2]=c[Q+4>>2]|0;c[S+8>>2]=c[Q+8>>2]|0;c[Q>>2]=c[A>>2]|0;c[Q+4>>2]=c[A+4>>2]|0;c[Q+8>>2]=c[A+8>>2]|0;ao=al+1|0}}while(0);if((ao|0)==0){ap=dG(N,ak,d)|0;Q=ak+12|0;if(dG(Q,a,d)|0){R=1407;break}if(ap){N=Q;continue}}Q=ak;if((Q-O|0)>=(b-Q|0)){R=1411;break}dA(N,ak,d);N=ak+12|0}if((R|0)==1411){R=0;dA(ak+12|0,a,d);K=N;a=ak;continue}else if((R|0)==1407){R=0;if(ap){R=1430;break}else{K=N;a=ak;continue}}}if((R|0)==1353){ak=l;K=N+24|0;ap=N+12|0;ao=f;f=g;g=h;h=j;j=k;k=bI[c[d>>2]&255](ap,N)|0;al=bI[c[d>>2]&255](K,ap)|0;do{if(k){A=N;if(al){c[ao>>2]=c[A>>2]|0;c[ao+4>>2]=c[A+4>>2]|0;c[ao+8>>2]=c[A+8>>2]|0;am=K;c[A>>2]=c[am>>2]|0;c[A+4>>2]=c[am+4>>2]|0;c[A+8>>2]=c[am+8>>2]|0;c[am>>2]=c[ao>>2]|0;c[am+4>>2]=c[ao+4>>2]|0;c[am+8>>2]=c[ao+8>>2]|0;break}c[f>>2]=c[A>>2]|0;c[f+4>>2]=c[A+4>>2]|0;c[f+8>>2]=c[A+8>>2]|0;am=ap;c[A>>2]=c[am>>2]|0;c[A+4>>2]=c[am+4>>2]|0;c[A+8>>2]=c[am+8>>2]|0;c[am>>2]=c[f>>2]|0;c[am+4>>2]=c[f+4>>2]|0;c[am+8>>2]=c[f+8>>2]|0;if(!(bI[c[d>>2]&255](K,ap)|0)){break}c[h>>2]=c[am>>2]|0;c[h+4>>2]=c[am+4>>2]|0;c[h+8>>2]=c[am+8>>2]|0;A=K;c[am>>2]=c[A>>2]|0;c[am+4>>2]=c[A+4>>2]|0;c[am+8>>2]=c[A+8>>2]|0;c[A>>2]=c[h>>2]|0;c[A+4>>2]=c[h+4>>2]|0;c[A+8>>2]=c[h+8>>2]|0}else{if(!al){break}A=ap;c[j>>2]=c[A>>2]|0;c[j+4>>2]=c[A+4>>2]|0;c[j+8>>2]=c[A+8>>2]|0;am=K;c[A>>2]=c[am>>2]|0;c[A+4>>2]=c[am+4>>2]|0;c[A+8>>2]=c[am+8>>2]|0;c[am>>2]=c[j>>2]|0;c[am+4>>2]=c[j+4>>2]|0;c[am+8>>2]=c[j+8>>2]|0;if(!(bI[c[d>>2]&255](ap,N)|0)){break}am=N;c[g>>2]=c[am>>2]|0;c[g+4>>2]=c[am+4>>2]|0;c[g+8>>2]=c[am+8>>2]|0;c[am>>2]=c[A>>2]|0;c[am+4>>2]=c[A+4>>2]|0;c[am+8>>2]=c[A+8>>2]|0;c[A>>2]=c[g>>2]|0;c[A+4>>2]=c[g+4>>2]|0;c[A+8>>2]=c[g+8>>2]|0}}while(0);g=N+36|0;if((g|0)==(a|0)){i=e;return}else{aq=K;ar=g}while(1){if(bI[c[d>>2]&255](ar,aq)|0){g=ar;c[ak>>2]=c[g>>2]|0;c[ak+4>>2]=c[g+4>>2]|0;c[ak+8>>2]=c[g+8>>2]|0;g=aq;K=ar;while(1){ap=K;as=g;c[ap>>2]=c[as>>2]|0;c[ap+4>>2]=c[as+4>>2]|0;c[ap+8>>2]=c[as+8>>2]|0;if((g|0)==(N|0)){break}ap=g-12|0;if(bI[c[d>>2]&255](l,ap)|0){K=g;g=ap}else{break}}c[as>>2]=c[ak>>2]|0;c[as+4>>2]=c[ak+4>>2]|0;c[as+8>>2]=c[ak+8>>2]|0}g=ar+12|0;if((g|0)==(a|0)){break}else{aq=ar;ar=g}}i=e;return}else if((R|0)==1346){dB(N,N+12|0,N+24|0,L,d);i=e;return}else if((R|0)==1338){ar=N+12|0;aq=q;q=r;r=s;s=t;t=u;u=bI[c[d>>2]&255](ar,N)|0;a=bI[c[d>>2]&255](L,ar)|0;if(!u){if(!a){i=e;return}u=ar;c[t>>2]=c[u>>2]|0;c[t+4>>2]=c[u+4>>2]|0;c[t+8>>2]=c[u+8>>2]|0;c[u>>2]=c[M>>2]|0;c[u+4>>2]=c[M+4>>2]|0;c[u+8>>2]=c[M+8>>2]|0;c[M>>2]=c[t>>2]|0;c[M+4>>2]=c[t+4>>2]|0;c[M+8>>2]=c[t+8>>2]|0;if(!(bI[c[d>>2]&255](ar,N)|0)){i=e;return}t=N;c[r>>2]=c[t>>2]|0;c[r+4>>2]=c[t+4>>2]|0;c[r+8>>2]=c[t+8>>2]|0;c[t>>2]=c[u>>2]|0;c[t+4>>2]=c[u+4>>2]|0;c[t+8>>2]=c[u+8>>2]|0;c[u>>2]=c[r>>2]|0;c[u+4>>2]=c[r+4>>2]|0;c[u+8>>2]=c[r+8>>2]|0;i=e;return}r=N;if(a){c[aq>>2]=c[r>>2]|0;c[aq+4>>2]=c[r+4>>2]|0;c[aq+8>>2]=c[r+8>>2]|0;c[r>>2]=c[M>>2]|0;c[r+4>>2]=c[M+4>>2]|0;c[r+8>>2]=c[M+8>>2]|0;c[M>>2]=c[aq>>2]|0;c[M+4>>2]=c[aq+4>>2]|0;c[M+8>>2]=c[aq+8>>2]|0;i=e;return}c[q>>2]=c[r>>2]|0;c[q+4>>2]=c[r+4>>2]|0;c[q+8>>2]=c[r+8>>2]|0;aq=ar;c[r>>2]=c[aq>>2]|0;c[r+4>>2]=c[aq+4>>2]|0;c[r+8>>2]=c[aq+8>>2]|0;c[aq>>2]=c[q>>2]|0;c[aq+4>>2]=c[q+4>>2]|0;c[aq+8>>2]=c[q+8>>2]|0;if(!(bI[c[d>>2]&255](L,ar)|0)){i=e;return}c[s>>2]=c[aq>>2]|0;c[s+4>>2]=c[aq+4>>2]|0;c[s+8>>2]=c[aq+8>>2]|0;c[aq>>2]=c[M>>2]|0;c[aq+4>>2]=c[M+4>>2]|0;c[aq+8>>2]=c[M+8>>2]|0;c[M>>2]=c[s>>2]|0;c[M+4>>2]=c[s+4>>2]|0;c[M+8>>2]=c[s+8>>2]|0;i=e;return}else if((R|0)==1336){if(!(bI[c[d>>2]&255](L,N)|0)){i=e;return}s=v;v=N;c[s>>2]=c[v>>2]|0;c[s+4>>2]=c[v+4>>2]|0;c[s+8>>2]=c[v+8>>2]|0;c[v>>2]=c[M>>2]|0;c[v+4>>2]=c[M+4>>2]|0;c[v+8>>2]=c[M+8>>2]|0;c[M>>2]=c[s>>2]|0;c[M+4>>2]=c[s+4>>2]|0;c[M+8>>2]=c[s+8>>2]|0;i=e;return}else if((R|0)==1347){s=N+12|0;v=N+24|0;aq=N+36|0;ar=m;m=n;n=o;o=p;dB(N,s,v,aq,d);if(!(bI[c[d>>2]&255](L,aq)|0)){i=e;return}L=aq;c[o>>2]=c[L>>2]|0;c[o+4>>2]=c[L+4>>2]|0;c[o+8>>2]=c[L+8>>2]|0;c[L>>2]=c[M>>2]|0;c[L+4>>2]=c[M+4>>2]|0;c[L+8>>2]=c[M+8>>2]|0;c[M>>2]=c[o>>2]|0;c[M+4>>2]=c[o+4>>2]|0;c[M+8>>2]=c[o+8>>2]|0;if(!(bI[c[d>>2]&255](aq,v)|0)){i=e;return}aq=v;c[m>>2]=c[aq>>2]|0;c[m+4>>2]=c[aq+4>>2]|0;c[m+8>>2]=c[aq+8>>2]|0;c[aq>>2]=c[L>>2]|0;c[aq+4>>2]=c[L+4>>2]|0;c[aq+8>>2]=c[L+8>>2]|0;c[L>>2]=c[m>>2]|0;c[L+4>>2]=c[m+4>>2]|0;c[L+8>>2]=c[m+8>>2]|0;if(!(bI[c[d>>2]&255](v,s)|0)){i=e;return}v=s;c[ar>>2]=c[v>>2]|0;c[ar+4>>2]=c[v+4>>2]|0;c[ar+8>>2]=c[v+8>>2]|0;c[v>>2]=c[aq>>2]|0;c[v+4>>2]=c[aq+4>>2]|0;c[v+8>>2]=c[aq+8>>2]|0;c[aq>>2]=c[ar>>2]|0;c[aq+4>>2]=c[ar+4>>2]|0;c[aq+8>>2]=c[ar+8>>2]|0;if(!(bI[c[d>>2]&255](s,N)|0)){i=e;return}s=N;c[n>>2]=c[s>>2]|0;c[n+4>>2]=c[s+4>>2]|0;c[n+8>>2]=c[s+8>>2]|0;c[s>>2]=c[v>>2]|0;c[s+4>>2]=c[v+4>>2]|0;c[s+8>>2]=c[v+8>>2]|0;c[v>>2]=c[n>>2]|0;c[v+4>>2]=c[n+4>>2]|0;c[v+8>>2]=c[n+8>>2]|0;i=e;return}else if((R|0)==1414){i=e;return}else if((R|0)==1415){i=e;return}else if((R|0)==1426){i=e;return}else if((R|0)==1430){i=e;return}}function dB(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+128|0;h=g+80|0;j=g+96|0;k=g+112|0;l=g|0;m=g+16|0;n=g+32|0;o=g+48|0;p=g+64|0;q=bI[c[f>>2]&255](b,a)|0;r=bI[c[f>>2]&255](d,b)|0;do{if(q){s=a;if(r){c[l>>2]=c[s>>2]|0;c[l+4>>2]=c[s+4>>2]|0;c[l+8>>2]=c[s+8>>2]|0;t=d;c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;c[t>>2]=c[l>>2]|0;c[t+4>>2]=c[l+4>>2]|0;c[t+8>>2]=c[l+8>>2]|0;u=1;break}c[m>>2]=c[s>>2]|0;c[m+4>>2]=c[s+4>>2]|0;c[m+8>>2]=c[s+8>>2]|0;t=b;c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;c[t>>2]=c[m>>2]|0;c[t+4>>2]=c[m+4>>2]|0;c[t+8>>2]=c[m+8>>2]|0;if(!(bI[c[f>>2]&255](d,b)|0)){u=1;break}c[o>>2]=c[t>>2]|0;c[o+4>>2]=c[t+4>>2]|0;c[o+8>>2]=c[t+8>>2]|0;s=d;c[t>>2]=c[s>>2]|0;c[t+4>>2]=c[s+4>>2]|0;c[t+8>>2]=c[s+8>>2]|0;c[s>>2]=c[o>>2]|0;c[s+4>>2]=c[o+4>>2]|0;c[s+8>>2]=c[o+8>>2]|0;u=2}else{if(!r){u=0;break}s=b;c[p>>2]=c[s>>2]|0;c[p+4>>2]=c[s+4>>2]|0;c[p+8>>2]=c[s+8>>2]|0;t=d;c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;c[t>>2]=c[p>>2]|0;c[t+4>>2]=c[p+4>>2]|0;c[t+8>>2]=c[p+8>>2]|0;if(!(bI[c[f>>2]&255](b,a)|0)){u=1;break}t=a;c[n>>2]=c[t>>2]|0;c[n+4>>2]=c[t+4>>2]|0;c[n+8>>2]=c[t+8>>2]|0;c[t>>2]=c[s>>2]|0;c[t+4>>2]=c[s+4>>2]|0;c[t+8>>2]=c[s+8>>2]|0;c[s>>2]=c[n>>2]|0;c[s+4>>2]=c[n+4>>2]|0;c[s+8>>2]=c[n+8>>2]|0;u=2}}while(0);if(!(bI[c[f>>2]&255](e,d)|0)){v=u;i=g;return v|0}n=k;k=d;c[n>>2]=c[k>>2]|0;c[n+4>>2]=c[k+4>>2]|0;c[n+8>>2]=c[k+8>>2]|0;p=e;c[k>>2]=c[p>>2]|0;c[k+4>>2]=c[p+4>>2]|0;c[k+8>>2]=c[p+8>>2]|0;c[p>>2]=c[n>>2]|0;c[p+4>>2]=c[n+4>>2]|0;c[p+8>>2]=c[n+8>>2]|0;if(!(bI[c[f>>2]&255](d,b)|0)){v=u+1|0;i=g;return v|0}d=h;h=b;c[d>>2]=c[h>>2]|0;c[d+4>>2]=c[h+4>>2]|0;c[d+8>>2]=c[h+8>>2]|0;c[h>>2]=c[k>>2]|0;c[h+4>>2]=c[k+4>>2]|0;c[h+8>>2]=c[k+8>>2]|0;c[k>>2]=c[d>>2]|0;c[k+4>>2]=c[d+4>>2]|0;c[k+8>>2]=c[d+8>>2]|0;if(!(bI[c[f>>2]&255](b,a)|0)){v=u+2|0;i=g;return v|0}b=j;j=a;c[b>>2]=c[j>>2]|0;c[b+4>>2]=c[j+4>>2]|0;c[b+8>>2]=c[j+8>>2]|0;c[j>>2]=c[h>>2]|0;c[j+4>>2]=c[h+4>>2]|0;c[j+8>>2]=c[h+8>>2]|0;c[h>>2]=c[b>>2]|0;c[h+4>>2]=c[b+4>>2]|0;c[h+8>>2]=c[b+8>>2]|0;v=u+3|0;i=g;return v|0}function dC(a,b){a=a|0;b=b|0;return}function dD(a,b){a=a|0;b=b|0;return}function dE(a,b,c){a=a|0;b=b|0;c=c|0;return}function dF(a,b,c){a=a|0;b=b|0;c=c|0;return}function dG(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;e=i;i=i+256|0;f=e|0;g=e+16|0;h=e+32|0;j=e+48|0;k=e+64|0;l=e+80|0;m=e+96|0;n=e+112|0;o=e+128|0;p=e+144|0;q=e+160|0;r=e+176|0;s=e+192|0;t=e+208|0;u=e+224|0;v=e+240|0;w=(b-a|0)/12&-1;if((w|0)==4){x=a+12|0;y=a+24|0;z=b-12|0;dB(a,x,y,z,d);z=1;i=e;return z|0}else if((w|0)==3){y=a+12|0;x=b-12|0;A=p;p=q;q=r;r=s;s=t;t=bI[c[d>>2]&255](y,a)|0;B=bI[c[d>>2]&255](x,y)|0;if(!t){if(!B){z=1;i=e;return z|0}t=y;c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;C=x;c[t>>2]=c[C>>2]|0;c[t+4>>2]=c[C+4>>2]|0;c[t+8>>2]=c[C+8>>2]|0;c[C>>2]=c[s>>2]|0;c[C+4>>2]=c[s+4>>2]|0;c[C+8>>2]=c[s+8>>2]|0;if(!(bI[c[d>>2]&255](y,a)|0)){z=1;i=e;return z|0}s=a;c[q>>2]=c[s>>2]|0;c[q+4>>2]=c[s+4>>2]|0;c[q+8>>2]=c[s+8>>2]|0;c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;c[t>>2]=c[q>>2]|0;c[t+4>>2]=c[q+4>>2]|0;c[t+8>>2]=c[q+8>>2]|0;z=1;i=e;return z|0}q=a;if(B){c[A>>2]=c[q>>2]|0;c[A+4>>2]=c[q+4>>2]|0;c[A+8>>2]=c[q+8>>2]|0;B=x;c[q>>2]=c[B>>2]|0;c[q+4>>2]=c[B+4>>2]|0;c[q+8>>2]=c[B+8>>2]|0;c[B>>2]=c[A>>2]|0;c[B+4>>2]=c[A+4>>2]|0;c[B+8>>2]=c[A+8>>2]|0;z=1;i=e;return z|0}c[p>>2]=c[q>>2]|0;c[p+4>>2]=c[q+4>>2]|0;c[p+8>>2]=c[q+8>>2]|0;A=y;c[q>>2]=c[A>>2]|0;c[q+4>>2]=c[A+4>>2]|0;c[q+8>>2]=c[A+8>>2]|0;c[A>>2]=c[p>>2]|0;c[A+4>>2]=c[p+4>>2]|0;c[A+8>>2]=c[p+8>>2]|0;if(!(bI[c[d>>2]&255](x,y)|0)){z=1;i=e;return z|0}c[r>>2]=c[A>>2]|0;c[r+4>>2]=c[A+4>>2]|0;c[r+8>>2]=c[A+8>>2]|0;y=x;c[A>>2]=c[y>>2]|0;c[A+4>>2]=c[y+4>>2]|0;c[A+8>>2]=c[y+8>>2]|0;c[y>>2]=c[r>>2]|0;c[y+4>>2]=c[r+4>>2]|0;c[y+8>>2]=c[r+8>>2]|0;z=1;i=e;return z|0}else if((w|0)==2){r=b-12|0;if(!(bI[c[d>>2]&255](r,a)|0)){z=1;i=e;return z|0}y=u;u=a;c[y>>2]=c[u>>2]|0;c[y+4>>2]=c[u+4>>2]|0;c[y+8>>2]=c[u+8>>2]|0;A=r;c[u>>2]=c[A>>2]|0;c[u+4>>2]=c[A+4>>2]|0;c[u+8>>2]=c[A+8>>2]|0;c[A>>2]=c[y>>2]|0;c[A+4>>2]=c[y+4>>2]|0;c[A+8>>2]=c[y+8>>2]|0;z=1;i=e;return z|0}else if((w|0)==0|(w|0)==1){z=1;i=e;return z|0}else if((w|0)==5){w=a+12|0;y=a+24|0;A=a+36|0;u=b-12|0;r=l;l=m;m=n;n=o;dB(a,w,y,A,d);if(!(bI[c[d>>2]&255](u,A)|0)){z=1;i=e;return z|0}o=A;c[n>>2]=c[o>>2]|0;c[n+4>>2]=c[o+4>>2]|0;c[n+8>>2]=c[o+8>>2]|0;x=u;c[o>>2]=c[x>>2]|0;c[o+4>>2]=c[x+4>>2]|0;c[o+8>>2]=c[x+8>>2]|0;c[x>>2]=c[n>>2]|0;c[x+4>>2]=c[n+4>>2]|0;c[x+8>>2]=c[n+8>>2]|0;if(!(bI[c[d>>2]&255](A,y)|0)){z=1;i=e;return z|0}A=y;c[l>>2]=c[A>>2]|0;c[l+4>>2]=c[A+4>>2]|0;c[l+8>>2]=c[A+8>>2]|0;c[A>>2]=c[o>>2]|0;c[A+4>>2]=c[o+4>>2]|0;c[A+8>>2]=c[o+8>>2]|0;c[o>>2]=c[l>>2]|0;c[o+4>>2]=c[l+4>>2]|0;c[o+8>>2]=c[l+8>>2]|0;if(!(bI[c[d>>2]&255](y,w)|0)){z=1;i=e;return z|0}y=w;c[r>>2]=c[y>>2]|0;c[r+4>>2]=c[y+4>>2]|0;c[r+8>>2]=c[y+8>>2]|0;c[y>>2]=c[A>>2]|0;c[y+4>>2]=c[A+4>>2]|0;c[y+8>>2]=c[A+8>>2]|0;c[A>>2]=c[r>>2]|0;c[A+4>>2]=c[r+4>>2]|0;c[A+8>>2]=c[r+8>>2]|0;if(!(bI[c[d>>2]&255](w,a)|0)){z=1;i=e;return z|0}w=a;c[m>>2]=c[w>>2]|0;c[m+4>>2]=c[w+4>>2]|0;c[m+8>>2]=c[w+8>>2]|0;c[w>>2]=c[y>>2]|0;c[w+4>>2]=c[y+4>>2]|0;c[w+8>>2]=c[y+8>>2]|0;c[y>>2]=c[m>>2]|0;c[y+4>>2]=c[m+4>>2]|0;c[y+8>>2]=c[m+8>>2]|0;z=1;i=e;return z|0}else{m=a+24|0;y=a+12|0;w=f;f=g;g=h;h=j;j=k;k=bI[c[d>>2]&255](y,a)|0;r=bI[c[d>>2]&255](m,y)|0;do{if(k){A=a;if(r){c[w>>2]=c[A>>2]|0;c[w+4>>2]=c[A+4>>2]|0;c[w+8>>2]=c[A+8>>2]|0;l=m;c[A>>2]=c[l>>2]|0;c[A+4>>2]=c[l+4>>2]|0;c[A+8>>2]=c[l+8>>2]|0;c[l>>2]=c[w>>2]|0;c[l+4>>2]=c[w+4>>2]|0;c[l+8>>2]=c[w+8>>2]|0;break}c[f>>2]=c[A>>2]|0;c[f+4>>2]=c[A+4>>2]|0;c[f+8>>2]=c[A+8>>2]|0;l=y;c[A>>2]=c[l>>2]|0;c[A+4>>2]=c[l+4>>2]|0;c[A+8>>2]=c[l+8>>2]|0;c[l>>2]=c[f>>2]|0;c[l+4>>2]=c[f+4>>2]|0;c[l+8>>2]=c[f+8>>2]|0;if(!(bI[c[d>>2]&255](m,y)|0)){break}c[h>>2]=c[l>>2]|0;c[h+4>>2]=c[l+4>>2]|0;c[h+8>>2]=c[l+8>>2]|0;A=m;c[l>>2]=c[A>>2]|0;c[l+4>>2]=c[A+4>>2]|0;c[l+8>>2]=c[A+8>>2]|0;c[A>>2]=c[h>>2]|0;c[A+4>>2]=c[h+4>>2]|0;c[A+8>>2]=c[h+8>>2]|0}else{if(!r){break}A=y;c[j>>2]=c[A>>2]|0;c[j+4>>2]=c[A+4>>2]|0;c[j+8>>2]=c[A+8>>2]|0;l=m;c[A>>2]=c[l>>2]|0;c[A+4>>2]=c[l+4>>2]|0;c[A+8>>2]=c[l+8>>2]|0;c[l>>2]=c[j>>2]|0;c[l+4>>2]=c[j+4>>2]|0;c[l+8>>2]=c[j+8>>2]|0;if(!(bI[c[d>>2]&255](y,a)|0)){break}l=a;c[g>>2]=c[l>>2]|0;c[g+4>>2]=c[l+4>>2]|0;c[g+8>>2]=c[l+8>>2]|0;c[l>>2]=c[A>>2]|0;c[l+4>>2]=c[A+4>>2]|0;c[l+8>>2]=c[A+8>>2]|0;c[A>>2]=c[g>>2]|0;c[A+4>>2]=c[g+4>>2]|0;c[A+8>>2]=c[g+8>>2]|0}}while(0);g=a+36|0;if((g|0)==(b|0)){z=1;i=e;return z|0}y=v;j=m;m=0;r=g;while(1){if(bI[c[d>>2]&255](r,j)|0){g=r;c[y>>2]=c[g>>2]|0;c[y+4>>2]=c[g+4>>2]|0;c[y+8>>2]=c[g+8>>2]|0;g=j;h=r;while(1){f=h;D=g;c[f>>2]=c[D>>2]|0;c[f+4>>2]=c[D+4>>2]|0;c[f+8>>2]=c[D+8>>2]|0;if((g|0)==(a|0)){break}f=g-12|0;if(bI[c[d>>2]&255](v,f)|0){h=g;g=f}else{break}}c[D>>2]=c[y>>2]|0;c[D+4>>2]=c[y+4>>2]|0;c[D+8>>2]=c[y+8>>2]|0;g=m+1|0;if((g|0)==8){break}else{E=g}}else{E=m}g=r+12|0;if((g|0)==(b|0)){z=1;F=1494;break}else{j=r;m=E;r=g}}if((F|0)==1494){i=e;return z|0}z=(r+12|0)==(b|0);i=e;return z|0}return 0}function dH(a){a=a|0;vl(a);return}function dI(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0.0,M=0.0,N=0,O=0,P=0;f=i;i=i+40|0;h=f|0;j=f+16|0;l=f+32|0;m=a+28|0;if((c[m>>2]|0)<=0){i=f;return}n=a+24|0;o=a+12|0;a=h|0;p=j|0;q=h+4|0;r=j+4|0;s=h+8|0;t=j+8|0;u=h+12|0;v=j+12|0;w=e|0;x=d|0;y=e+4|0;z=d+4|0;A=l|0;B=l+4|0;C=b|0;D=b+40|0;E=b+36|0;F=b+32|0;b=0;while(1){G=c[n>>2]|0;H=c[o>>2]|0;I=G+(b*28&-1)+20|0;bR[c[(c[H>>2]|0)+24>>2]&127](H,h,d,c[I>>2]|0);H=c[o>>2]|0;bR[c[(c[H>>2]|0)+24>>2]&127](H,j,e,c[I>>2]|0);I=G+(b*28&-1)|0;J=+g[a>>2];K=+g[p>>2];L=+g[q>>2];M=+g[r>>2];H=I;N=(g[k>>2]=J<K?J:K,c[k>>2]|0);O=(g[k>>2]=L<M?L:M,c[k>>2]|0)|0;c[H>>2]=0|N;c[H+4>>2]=O;M=+g[s>>2];L=+g[t>>2];K=+g[u>>2];J=+g[v>>2];O=G+(b*28&-1)+8|0;H=(g[k>>2]=M>L?M:L,c[k>>2]|0);N=(g[k>>2]=K>J?K:J,c[k>>2]|0)|0;c[O>>2]=0|H;c[O+4>>2]=N;J=+g[y>>2]- +g[z>>2];g[A>>2]=+g[w>>2]- +g[x>>2];g[B>>2]=J;N=c[G+(b*28&-1)+24>>2]|0;if(co(C,N,I,l)|0){I=c[D>>2]|0;if((I|0)==(c[E>>2]|0)){G=c[F>>2]|0;c[E>>2]=I<<1;O=vi(I<<3)|0;c[F>>2]=O;H=G;vq(O|0,H|0,c[D>>2]<<2);vj(H);P=c[D>>2]|0}else{P=I}c[(c[F>>2]|0)+(P<<2)>>2]=N;c[D>>2]=(c[D>>2]|0)+1|0}N=b+1|0;if((N|0)<(c[m>>2]|0)){b=N}else{break}}i=f;return}function dJ(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;b=a+8|0;d=c[b>>2]|0;if((d|0)==0){return}e=c[d+112>>2]|0;if((e|0)==0){f=d}else{d=e;while(1){e=c[d+4>>2]|0;if((c[e+48>>2]|0)==(a|0)|(c[e+52>>2]|0)==(a|0)){g=e+4|0;c[g>>2]=c[g>>2]|8}g=c[d+12>>2]|0;if((g|0)==0){break}else{d=g}}f=c[b>>2]|0}b=c[f+88>>2]|0;if((b|0)==0){return}f=a+28|0;if((c[f>>2]|0)<=0){return}d=a+24|0;a=b+102912|0;g=b+102908|0;e=b+102904|0;b=0;h=c[a>>2]|0;while(1){i=c[(c[d>>2]|0)+(b*28&-1)+24>>2]|0;if((h|0)==(c[g>>2]|0)){j=c[e>>2]|0;c[g>>2]=h<<1;k=vi(h<<3)|0;c[e>>2]=k;l=j;vq(k|0,l|0,c[a>>2]<<2);vj(l);m=c[a>>2]|0}else{m=h}c[(c[e>>2]|0)+(m<<2)>>2]=i;i=(c[a>>2]|0)+1|0;c[a>>2]=i;l=b+1|0;if((l|0)<(c[f>>2]|0)){b=l;h=i}else{break}}return}function dK(d,f){d=d|0;f=f|0;var j=0,k=0,l=0,m=0.0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0;j=i;dc(7320,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(6312,(v=i,i=i+8|0,h[v>>3]=+g[d+16>>2],v)|0);dc(5776,(v=i,i=i+8|0,h[v>>3]=+g[d+20>>2],v)|0);dc(5272,(v=i,i=i+8|0,h[v>>3]=+g[d>>2],v)|0);dc(4904,(v=i,i=i+8|0,c[v>>2]=a[d+38|0]&1,v)|0);dc(4624,(v=i,i=i+8|0,c[v>>2]=e[d+32>>1]|0,v)|0);dc(4392,(v=i,i=i+8|0,c[v>>2]=e[d+34>>1]|0,v)|0);dc(12896,(v=i,i=i+8|0,c[v>>2]=b[d+36>>1]|0,v)|0);k=c[d+12>>2]|0;d=c[k+4>>2]|0;if((d|0)==1){dc(11368,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(12200,(v=i,i=i+8|0,h[v>>3]=+g[k+8>>2],v)|0);l=k+28|0;m=+g[l+4>>2];dc(11152,(v=i,i=i+16|0,h[v>>3]=+g[l>>2],h[v+8>>3]=m,v)|0);m=+g[k+16>>2];dc(10928,(v=i,i=i+16|0,h[v>>3]=+g[k+12>>2],h[v+8>>3]=m,v)|0);l=k+20|0;m=+g[l+4>>2];dc(10728,(v=i,i=i+16|0,h[v>>3]=+g[l>>2],h[v+8>>3]=m,v)|0);m=+g[k+40>>2];dc(10528,(v=i,i=i+16|0,h[v>>3]=+g[k+36>>2],h[v+8>>3]=m,v)|0);dc(10408,(v=i,i=i+8|0,c[v>>2]=a[k+44|0]&1,v)|0);dc(10200,(v=i,i=i+8|0,c[v>>2]=a[k+45|0]&1,v)|0)}else if((d|0)==2){dc(9872,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(9544,(v=i,i=i+8|0,c[v>>2]=8,v)|0);l=k+148|0;n=c[l>>2]|0;L2022:do{if((n|0)>0){o=k+20|0;p=0;while(1){m=+g[o+(p<<3)>>2];q=+g[o+(p<<3)+4>>2];dc(9104,(v=i,i=i+24|0,c[v>>2]=p,h[v+8>>3]=m,h[v+16>>3]=q,v)|0);r=p+1|0;s=c[l>>2]|0;if((r|0)<(s|0)){p=r}else{t=s;break L2022}}}else{t=n}}while(0);dc(8840,(v=i,i=i+8|0,c[v>>2]=t,v)|0)}else if((d|0)==0){dc(12696,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(12200,(v=i,i=i+8|0,h[v>>3]=+g[k+8>>2],v)|0);q=+g[k+16>>2];dc(11600,(v=i,i=i+16|0,h[v>>3]=+g[k+12>>2],h[v+8>>3]=q,v)|0)}else if((d|0)==3){d=k;dc(8680,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);t=k+16|0;dc(9544,(v=i,i=i+8|0,c[v>>2]=c[t>>2]|0,v)|0);n=c[t>>2]|0;L2029:do{if((n|0)>0){l=k+12|0;p=0;while(1){o=c[l>>2]|0;q=+g[o+(p<<3)>>2];m=+g[o+(p<<3)+4>>2];dc(9104,(v=i,i=i+24|0,c[v>>2]=p,h[v+8>>3]=q,h[v+16>>3]=m,v)|0);o=p+1|0;s=c[t>>2]|0;if((o|0)<(s|0)){p=o}else{u=s;break L2029}}}else{u=n}}while(0);dc(8312,(v=i,i=i+8|0,c[v>>2]=u,v)|0);u=k+20|0;m=+g[u+4>>2];dc(8080,(v=i,i=i+16|0,h[v>>3]=+g[u>>2],h[v+8>>3]=m,v)|0);u=k+28|0;m=+g[u+4>>2];dc(7792,(v=i,i=i+16|0,h[v>>3]=+g[u>>2],h[v+8>>3]=m,v)|0);dc(7584,(v=i,i=i+8|0,c[v>>2]=a[k+36|0]&1,v)|0);dc(7440,(v=i,i=i+8|0,c[v>>2]=a[d+37|0]&1,v)|0)}else{i=j;return}dc(7344,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(7208,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(7344,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(7016,(v=i,i=i+8|0,c[v>>2]=f,v)|0);i=j;return}function dL(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;if((c[b+28>>2]|0)!=0){bd(12280,72,14920,12608)}e=b+12|0;f=c[e>>2]|0;g=bt[c[(c[f>>2]|0)+12>>2]&1023](f)|0;f=b+24|0;b=c[f>>2]|0;h=b;i=g*28&-1;do{if((i|0)!=0){if((i|0)<=0){bd(5352,164,17448,8376)}if((i|0)>640){vj(h);break}g=a[i+22040|0]|0;if((g&255)<14){j=d+12+((g&255)<<2)|0;c[b>>2]=c[j>>2]|0;c[j>>2]=b;break}else{bd(5352,173,17448,6544)}}}while(0);c[f>>2]=0;f=c[e>>2]|0;b=c[f+4>>2]|0;if((b|0)==3){br[c[c[f>>2]>>2]&511](f);i=a[22080]|0;if((i&255)>=14){bd(5352,173,17448,6544)}h=d+12+((i&255)<<2)|0;c[f>>2]=c[h>>2]|0;c[h>>2]=f;c[e>>2]=0;return}else if((b|0)==2){br[c[c[f>>2]>>2]&511](f);h=a[22192]|0;if((h&255)>=14){bd(5352,173,17448,6544)}i=d+12+((h&255)<<2)|0;c[f>>2]=c[i>>2]|0;c[i>>2]=f;c[e>>2]=0;return}else if((b|0)==1){br[c[c[f>>2]>>2]&511](f);i=a[22088]|0;if((i&255)>=14){bd(5352,173,17448,6544)}h=d+12+((i&255)<<2)|0;c[f>>2]=c[h>>2]|0;c[h>>2]=f;c[e>>2]=0;return}else if((b|0)==0){br[c[c[f>>2]>>2]&511](f);b=a[22060]|0;if((b&255)>=14){bd(5352,173,17448,6544)}h=d+12+((b&255)<<2)|0;c[f>>2]=c[h>>2]|0;c[h>>2]=f;c[e>>2]=0;return}else{bd(12280,115,14920,11592)}}function dM(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;i=b+40|0;c[i>>2]=d;c[b+44>>2]=e;c[b+48>>2]=f;c[b+28>>2]=0;c[b+36>>2]=0;c[b+32>>2]=0;j=b|0;c[j>>2]=g;c[b+4>>2]=h;h=d<<2;d=g+102796|0;k=c[d>>2]|0;if((k|0)>=32){bd(4840,38,17040,6448)}l=g+102412+(k*12&-1)|0;c[g+102412+(k*12&-1)+4>>2]=h;m=g+102400|0;n=c[m>>2]|0;if((n+h|0)>102400){c[l>>2]=vi(h)|0;a[g+102412+(k*12&-1)+8|0]=1}else{c[l>>2]=g+n|0;a[g+102412+(k*12&-1)+8|0]=0;c[m>>2]=(c[m>>2]|0)+h|0}m=g+102404|0;k=(c[m>>2]|0)+h|0;c[m>>2]=k;m=g+102408|0;g=c[m>>2]|0;c[m>>2]=(g|0)>(k|0)?g:k;c[d>>2]=(c[d>>2]|0)+1|0;c[b+8>>2]=c[l>>2]|0;l=c[j>>2]|0;d=e<<2;e=l+102796|0;k=c[e>>2]|0;if((k|0)>=32){bd(4840,38,17040,6448)}g=l+102412+(k*12&-1)|0;c[l+102412+(k*12&-1)+4>>2]=d;m=l+102400|0;h=c[m>>2]|0;if((h+d|0)>102400){c[g>>2]=vi(d)|0;a[l+102412+(k*12&-1)+8|0]=1}else{c[g>>2]=l+h|0;a[l+102412+(k*12&-1)+8|0]=0;c[m>>2]=(c[m>>2]|0)+d|0}m=l+102404|0;k=(c[m>>2]|0)+d|0;c[m>>2]=k;m=l+102408|0;l=c[m>>2]|0;c[m>>2]=(l|0)>(k|0)?l:k;c[e>>2]=(c[e>>2]|0)+1|0;c[b+12>>2]=c[g>>2]|0;g=c[j>>2]|0;e=f<<2;f=g+102796|0;k=c[f>>2]|0;if((k|0)>=32){bd(4840,38,17040,6448)}l=g+102412+(k*12&-1)|0;c[g+102412+(k*12&-1)+4>>2]=e;m=g+102400|0;d=c[m>>2]|0;if((d+e|0)>102400){c[l>>2]=vi(e)|0;a[g+102412+(k*12&-1)+8|0]=1}else{c[l>>2]=g+d|0;a[g+102412+(k*12&-1)+8|0]=0;c[m>>2]=(c[m>>2]|0)+e|0}m=g+102404|0;k=(c[m>>2]|0)+e|0;c[m>>2]=k;m=g+102408|0;g=c[m>>2]|0;c[m>>2]=(g|0)>(k|0)?g:k;c[f>>2]=(c[f>>2]|0)+1|0;c[b+16>>2]=c[l>>2]|0;l=c[j>>2]|0;f=(c[i>>2]|0)*12&-1;k=l+102796|0;g=c[k>>2]|0;if((g|0)>=32){bd(4840,38,17040,6448)}m=l+102412+(g*12&-1)|0;c[l+102412+(g*12&-1)+4>>2]=f;e=l+102400|0;d=c[e>>2]|0;if((d+f|0)>102400){c[m>>2]=vi(f)|0;a[l+102412+(g*12&-1)+8|0]=1}else{c[m>>2]=l+d|0;a[l+102412+(g*12&-1)+8|0]=0;c[e>>2]=(c[e>>2]|0)+f|0}e=l+102404|0;g=(c[e>>2]|0)+f|0;c[e>>2]=g;e=l+102408|0;l=c[e>>2]|0;c[e>>2]=(l|0)>(g|0)?l:g;c[k>>2]=(c[k>>2]|0)+1|0;c[b+24>>2]=c[m>>2]|0;m=c[j>>2]|0;j=(c[i>>2]|0)*12&-1;i=m+102796|0;k=c[i>>2]|0;if((k|0)>=32){bd(4840,38,17040,6448)}g=m+102412+(k*12&-1)|0;c[m+102412+(k*12&-1)+4>>2]=j;l=m+102400|0;e=c[l>>2]|0;if((e+j|0)>102400){c[g>>2]=vi(j)|0;a[m+102412+(k*12&-1)+8|0]=1;f=m+102404|0;d=c[f>>2]|0;h=d+j|0;c[f>>2]=h;n=m+102408|0;o=c[n>>2]|0;p=(o|0)>(h|0);q=p?o:h;c[n>>2]=q;r=c[i>>2]|0;s=r+1|0;c[i>>2]=s;t=g|0;u=c[t>>2]|0;v=u;w=b+20|0;c[w>>2]=v;return}else{c[g>>2]=m+e|0;a[m+102412+(k*12&-1)+8|0]=0;c[l>>2]=(c[l>>2]|0)+j|0;f=m+102404|0;d=c[f>>2]|0;h=d+j|0;c[f>>2]=h;n=m+102408|0;o=c[n>>2]|0;p=(o|0)>(h|0);q=p?o:h;c[n>>2]=q;r=c[i>>2]|0;s=r+1|0;c[i>>2]=s;t=g|0;u=c[t>>2]|0;v=u;w=b+20|0;c[w>>2]=v;return}}function dN(d,e,f,h,j){d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;var l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0.0,D=0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0,R=0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0.0,af=0.0,ag=0;l=i;i=i+160|0;m=l|0;n=l+24|0;o=l+56|0;p=l+104|0;q=+g[f>>2];r=d+28|0;L2113:do{if((c[r>>2]|0)>0){s=d+8|0;t=h|0;u=h+4|0;v=d+20|0;w=d+24|0;x=0;while(1){y=c[(c[s>>2]|0)+(x<<2)>>2]|0;z=y+44|0;A=c[z>>2]|0;B=c[z+4>>2]|0;C=+g[y+56>>2];z=y+64|0;D=c[z+4>>2]|0;E=(c[k>>2]=c[z>>2]|0,+g[k>>2]);F=(c[k>>2]=D,+g[k>>2]);G=+g[y+72>>2];D=y+36|0;c[D>>2]=A;c[D+4>>2]=B;g[y+52>>2]=C;if((c[y>>2]|0)==2){H=+g[y+140>>2];I=+g[y+120>>2];J=1.0-q*+g[y+132>>2];K=J<1.0?J:1.0;J=K<0.0?0.0:K;K=1.0-q*+g[y+136>>2];L=K<1.0?K:1.0;M=(G+q*+g[y+128>>2]*+g[y+84>>2])*(L<0.0?0.0:L);N=(E+q*(H*+g[t>>2]+I*+g[y+76>>2]))*J;O=(F+q*(H*+g[u>>2]+I*+g[y+80>>2]))*J}else{M=G;N=E;O=F}y=(c[v>>2]|0)+(x*12&-1)|0;c[y>>2]=A;c[y+4>>2]=B;g[(c[v>>2]|0)+(x*12&-1)+8>>2]=C;B=(c[w>>2]|0)+(x*12&-1)|0;y=(g[k>>2]=N,c[k>>2]|0);A=(g[k>>2]=O,c[k>>2]|0)|0;c[B>>2]=0|y;c[B+4>>2]=A;g[(c[w>>2]|0)+(x*12&-1)+8>>2]=M;A=x+1|0;if((A|0)<(c[r>>2]|0)){x=A}else{P=v;R=w;break L2113}}}else{P=d+20|0;R=d+24|0}}while(0);h=n;w=f;c[h>>2]=c[w>>2]|0;c[h+4>>2]=c[w+4>>2]|0;c[h+8>>2]=c[w+8>>2]|0;c[h+12>>2]=c[w+12>>2]|0;c[h+16>>2]=c[w+16>>2]|0;c[h+20>>2]=c[w+20>>2]|0;h=c[P>>2]|0;c[n+24>>2]=h;v=c[R>>2]|0;c[n+28>>2]=v;x=o;c[x>>2]=c[w>>2]|0;c[x+4>>2]=c[w+4>>2]|0;c[x+8>>2]=c[w+8>>2]|0;c[x+12>>2]=c[w+12>>2]|0;c[x+16>>2]=c[w+16>>2]|0;c[x+20>>2]=c[w+20>>2]|0;w=d+12|0;c[o+24>>2]=c[w>>2]|0;x=d+36|0;c[o+28>>2]=c[x>>2]|0;c[o+32>>2]=h;c[o+36>>2]=v;c[o+40>>2]=c[d>>2]|0;eo(p,o);eq(p);if((a[f+20|0]&1)<<24>>24!=0){ep(p)}o=d+32|0;L2126:do{if((c[o>>2]|0)>0){v=d+16|0;h=0;while(1){u=c[(c[v>>2]|0)+(h<<2)>>2]|0;bs[c[(c[u>>2]|0)+28>>2]&511](u,n);u=h+1|0;if((u|0)<(c[o>>2]|0)){h=u}else{break L2126}}}}while(0);g[e+12>>2]=0.0;h=f+12|0;L2132:do{if((c[h>>2]|0)>0){v=d+16|0;u=0;while(1){L2136:do{if((c[o>>2]|0)>0){t=0;while(1){s=c[(c[v>>2]|0)+(t<<2)>>2]|0;bs[c[(c[s>>2]|0)+32>>2]&511](s,n);s=t+1|0;if((s|0)<(c[o>>2]|0)){t=s}else{break L2136}}}}while(0);es(p);t=u+1|0;if((t|0)<(c[h>>2]|0)){u=t}else{break L2132}}}}while(0);h=c[p+48>>2]|0;L2143:do{if((h|0)>0){u=c[p+40>>2]|0;v=c[p+44>>2]|0;t=0;while(1){s=c[v+(c[u+(t*152&-1)+148>>2]<<2)>>2]|0;A=u+(t*152&-1)+144|0;L2147:do{if((c[A>>2]|0)>0){B=0;while(1){g[s+64+(B*20&-1)+8>>2]=+g[u+(t*152&-1)+(B*36&-1)+16>>2];g[s+64+(B*20&-1)+12>>2]=+g[u+(t*152&-1)+(B*36&-1)+20>>2];y=B+1|0;if((y|0)<(c[A>>2]|0)){B=y}else{break L2147}}}}while(0);A=t+1|0;if((A|0)<(h|0)){t=A}else{break L2143}}}}while(0);g[e+16>>2]=0.0;L2152:do{if((c[r>>2]|0)>0){h=0;while(1){t=c[P>>2]|0;u=t+(h*12&-1)|0;v=c[u+4>>2]|0;M=(c[k>>2]=c[u>>2]|0,+g[k>>2]);O=(c[k>>2]=v,+g[k>>2]);N=+g[t+(h*12&-1)+8>>2];t=c[R>>2]|0;v=t+(h*12&-1)|0;A=c[v+4>>2]|0;C=(c[k>>2]=c[v>>2]|0,+g[k>>2]);F=(c[k>>2]=A,+g[k>>2]);E=+g[t+(h*12&-1)+8>>2];G=q*C;J=q*F;I=G*G+J*J;if(I>4.0){J=2.0/+Q(+I);U=C*J;V=F*J}else{U=C;V=F}F=q*E;if(F*F>2.4674012660980225){if(F>0.0){W=F}else{W=-0.0-F}X=E*(1.5707963705062866/W)}else{X=E}t=(g[k>>2]=M+q*U,c[k>>2]|0);A=(g[k>>2]=O+q*V,c[k>>2]|0)|0;c[u>>2]=0|t;c[u+4>>2]=A;g[(c[P>>2]|0)+(h*12&-1)+8>>2]=N+q*X;A=(c[R>>2]|0)+(h*12&-1)|0;u=(g[k>>2]=U,c[k>>2]|0);t=(g[k>>2]=V,c[k>>2]|0)|0;c[A>>2]=0|u;c[A+4>>2]=t;g[(c[R>>2]|0)+(h*12&-1)+8>>2]=X;t=h+1|0;if((t|0)<(c[r>>2]|0)){h=t}else{break L2152}}}}while(0);h=f+16|0;f=d+16|0;t=0;while(1){if((t|0)>=(c[h>>2]|0)){Y=1;break}A=er(p)|0;L2169:do{if((c[o>>2]|0)>0){u=1;v=0;while(1){s=c[(c[f>>2]|0)+(v<<2)>>2]|0;B=u&bI[c[(c[s>>2]|0)+36>>2]&255](s,n);s=v+1|0;if((s|0)<(c[o>>2]|0)){u=B;v=s}else{Z=B;break L2169}}}else{Z=1}}while(0);if(A&Z){Y=0;break}else{t=t+1|0}}L2175:do{if((c[r>>2]|0)>0){t=d+8|0;Z=0;while(1){o=c[(c[t>>2]|0)+(Z<<2)>>2]|0;n=(c[P>>2]|0)+(Z*12&-1)|0;f=o+44|0;h=c[n>>2]|0;v=c[n+4>>2]|0;c[f>>2]=h;c[f+4>>2]=v;X=+g[(c[P>>2]|0)+(Z*12&-1)+8>>2];g[o+56>>2]=X;f=(c[R>>2]|0)+(Z*12&-1)|0;n=o+64|0;u=c[f+4>>2]|0;c[n>>2]=c[f>>2]|0;c[n+4>>2]=u;g[o+72>>2]=+g[(c[R>>2]|0)+(Z*12&-1)+8>>2];V=+T(+X);g[o+20>>2]=V;U=+S(+X);g[o+24>>2]=U;X=+g[o+28>>2];W=+g[o+32>>2];N=(c[k>>2]=h,+g[k>>2])-(U*X-V*W);O=(c[k>>2]=v,+g[k>>2])-(V*X+U*W);v=o+12|0;o=(g[k>>2]=N,c[k>>2]|0);h=(g[k>>2]=O,c[k>>2]|0)|0;c[v>>2]=0|o;c[v+4>>2]=h;h=Z+1|0;if((h|0)<(c[r>>2]|0)){Z=h}else{break L2175}}}}while(0);g[e+20>>2]=0.0;e=c[p+40>>2]|0;R=d+4|0;L2180:do{if((c[R>>2]|0)!=0){if((c[x>>2]|0)<=0){break}P=m+16|0;Z=0;while(1){t=c[(c[w>>2]|0)+(Z<<2)>>2]|0;A=c[e+(Z*152&-1)+144>>2]|0;c[P>>2]=A;L2185:do{if((A|0)>0){h=0;while(1){g[m+(h<<2)>>2]=+g[e+(Z*152&-1)+(h*36&-1)+16>>2];g[m+8+(h<<2)>>2]=+g[e+(Z*152&-1)+(h*36&-1)+20>>2];v=h+1|0;if((v|0)<(A|0)){h=v}else{break L2185}}}}while(0);A=c[R>>2]|0;bO[c[(c[A>>2]|0)+20>>2]&127](A,t,m);A=Z+1|0;if((A|0)<(c[x>>2]|0)){Z=A}else{break L2180}}}}while(0);if(!j){_=p+32|0;$=c[_>>2]|0;aa=e;dh($,aa);ab=p+36|0;ac=c[ab>>2]|0;ad=ac;dh($,ad);i=l;return}j=c[r>>2]|0;L2194:do{if((j|0)>0){x=d+8|0;O=3.4028234663852886e+38;m=0;while(1){R=c[(c[x>>2]|0)+(m<<2)>>2]|0;L2198:do{if((c[R>>2]|0)==0){ae=O}else{do{if((b[R+4>>1]&4)<<16>>16!=0){N=+g[R+72>>2];if(N*N>.001218469929881394){break}N=+g[R+64>>2];W=+g[R+68>>2];if(N*N+W*W>9999999747378752.0e-20){break}w=R+144|0;W=q+ +g[w>>2];g[w>>2]=W;ae=O<W?O:W;break L2198}}while(0);g[R+144>>2]=0.0;ae=0.0}}while(0);R=m+1|0;t=c[r>>2]|0;if((R|0)<(t|0)){O=ae;m=R}else{af=ae;ag=t;break L2194}}}else{af=3.4028234663852886e+38;ag=j}}while(0);if(!((ag|0)>0&((af<.5|Y)^1))){_=p+32|0;$=c[_>>2]|0;aa=e;dh($,aa);ab=p+36|0;ac=c[ab>>2]|0;ad=ac;dh($,ad);i=l;return}Y=d+8|0;d=0;while(1){ag=c[(c[Y>>2]|0)+(d<<2)>>2]|0;j=ag+4|0;b[j>>1]=b[j>>1]&-3;g[ag+144>>2]=0.0;vr(ag+64|0,0,24);ag=d+1|0;if((ag|0)<(c[r>>2]|0)){d=ag}else{break}}_=p+32|0;$=c[_>>2]|0;aa=e;dh($,aa);ab=p+36|0;ac=c[ab>>2]|0;ad=ac;dh($,ad);i=l;return}function dO(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0,N=0,O=0,P=0,R=0,U=0;f=i;i=i+128|0;h=f|0;j=f+24|0;l=f+72|0;m=a+28|0;n=c[m>>2]|0;if((n|0)<=(d|0)){bd(10776,386,15200,12416)}if((n|0)<=(e|0)){bd(10776,387,15200,9688)}L2220:do{if((n|0)>0){o=a+8|0;p=a+20|0;q=a+24|0;r=0;while(1){s=c[(c[o>>2]|0)+(r<<2)>>2]|0;t=s+44|0;u=(c[p>>2]|0)+(r*12&-1)|0;v=c[t+4>>2]|0;c[u>>2]=c[t>>2]|0;c[u+4>>2]=v;g[(c[p>>2]|0)+(r*12&-1)+8>>2]=+g[s+56>>2];v=s+64|0;u=(c[q>>2]|0)+(r*12&-1)|0;t=c[v+4>>2]|0;c[u>>2]=c[v>>2]|0;c[u+4>>2]=t;g[(c[q>>2]|0)+(r*12&-1)+8>>2]=+g[s+72>>2];s=r+1|0;if((s|0)<(c[m>>2]|0)){r=s}else{w=p;x=q;break L2220}}}else{w=a+20|0;x=a+24|0}}while(0);n=a+12|0;c[j+24>>2]=c[n>>2]|0;q=a+36|0;c[j+28>>2]=c[q>>2]|0;c[j+40>>2]=c[a>>2]|0;p=j;r=b;c[p>>2]=c[r>>2]|0;c[p+4>>2]=c[r+4>>2]|0;c[p+8>>2]=c[r+8>>2]|0;c[p+12>>2]=c[r+12>>2]|0;c[p+16>>2]=c[r+16>>2]|0;c[p+20>>2]=c[r+20>>2]|0;c[j+32>>2]=c[w>>2]|0;c[j+36>>2]=c[x>>2]|0;eo(l,j);j=b+16|0;r=0;while(1){if((r|0)>=(c[j>>2]|0)){break}if(ew(l,d,e)|0){break}else{r=r+1|0}}r=a+8|0;j=(c[w>>2]|0)+(d*12&-1)|0;p=(c[(c[r>>2]|0)+(d<<2)>>2]|0)+36|0;o=c[j+4>>2]|0;c[p>>2]=c[j>>2]|0;c[p+4>>2]=o;g[(c[(c[r>>2]|0)+(d<<2)>>2]|0)+52>>2]=+g[(c[w>>2]|0)+(d*12&-1)+8>>2];d=(c[w>>2]|0)+(e*12&-1)|0;o=(c[(c[r>>2]|0)+(e<<2)>>2]|0)+36|0;p=c[d+4>>2]|0;c[o>>2]=c[d>>2]|0;c[o+4>>2]=p;g[(c[(c[r>>2]|0)+(e<<2)>>2]|0)+52>>2]=+g[(c[w>>2]|0)+(e*12&-1)+8>>2];eq(l);e=b+12|0;L2232:do{if((c[e>>2]|0)>0){p=0;while(1){es(l);o=p+1|0;if((o|0)<(c[e>>2]|0)){p=o}else{break L2232}}}}while(0);y=+g[b>>2];L2237:do{if((c[m>>2]|0)>0){b=0;while(1){e=c[w>>2]|0;p=e+(b*12&-1)|0;o=c[p+4>>2]|0;z=(c[k>>2]=c[p>>2]|0,+g[k>>2]);A=(c[k>>2]=o,+g[k>>2]);B=+g[e+(b*12&-1)+8>>2];e=c[x>>2]|0;o=e+(b*12&-1)|0;d=c[o+4>>2]|0;C=(c[k>>2]=c[o>>2]|0,+g[k>>2]);D=(c[k>>2]=d,+g[k>>2]);E=+g[e+(b*12&-1)+8>>2];F=y*C;G=y*D;H=F*F+G*G;if(H>4.0){G=2.0/+Q(+H);I=C*G;J=D*G}else{I=C;J=D}D=y*E;if(D*D>2.4674012660980225){if(D>0.0){K=D}else{K=-0.0-D}L=E*(1.5707963705062866/K)}else{L=E}E=z+y*I;z=A+y*J;A=B+y*L;e=(g[k>>2]=E,c[k>>2]|0);d=0|e;e=(g[k>>2]=z,c[k>>2]|0)|0;c[p>>2]=d;c[p+4>>2]=e;g[(c[w>>2]|0)+(b*12&-1)+8>>2]=A;p=(c[x>>2]|0)+(b*12&-1)|0;o=(g[k>>2]=I,c[k>>2]|0);j=0|o;o=(g[k>>2]=J,c[k>>2]|0)|0;c[p>>2]=j;c[p+4>>2]=o;g[(c[x>>2]|0)+(b*12&-1)+8>>2]=L;p=c[(c[r>>2]|0)+(b<<2)>>2]|0;s=p+44|0;c[s>>2]=d;c[s+4>>2]=e;g[p+56>>2]=A;e=p+64|0;c[e>>2]=j;c[e+4>>2]=o;g[p+72>>2]=L;B=+T(+A);g[p+20>>2]=B;D=+S(+A);g[p+24>>2]=D;A=+g[p+28>>2];C=+g[p+32>>2];o=p+12|0;p=(g[k>>2]=E-(D*A-B*C),c[k>>2]|0);e=(g[k>>2]=z-(B*A+D*C),c[k>>2]|0)|0;c[o>>2]=0|p;c[o+4>>2]=e;e=b+1|0;if((e|0)<(c[m>>2]|0)){b=e}else{break L2237}}}}while(0);m=c[l+40>>2]|0;r=a+4|0;if((c[r>>2]|0)==0){M=l+32|0;N=c[M>>2]|0;O=m;dh(N,O);P=l+36|0;R=c[P>>2]|0;U=R;dh(N,U);i=f;return}if((c[q>>2]|0)<=0){M=l+32|0;N=c[M>>2]|0;O=m;dh(N,O);P=l+36|0;R=c[P>>2]|0;U=R;dh(N,U);i=f;return}a=h+16|0;x=0;while(1){w=c[(c[n>>2]|0)+(x<<2)>>2]|0;b=c[m+(x*152&-1)+144>>2]|0;c[a>>2]=b;L2258:do{if((b|0)>0){e=0;while(1){g[h+(e<<2)>>2]=+g[m+(x*152&-1)+(e*36&-1)+16>>2];g[h+8+(e<<2)>>2]=+g[m+(x*152&-1)+(e*36&-1)+20>>2];o=e+1|0;if((o|0)<(b|0)){e=o}else{break L2258}}}}while(0);b=c[r>>2]|0;bO[c[(c[b>>2]|0)+20>>2]&127](b,w,h);b=x+1|0;if((b|0)<(c[q>>2]|0)){x=b}else{break}}M=l+32|0;N=c[M>>2]|0;O=m;dh(N,O);P=l+36|0;R=c[P>>2]|0;U=R;dh(N,U);i=f;return}function dP(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0;e=b|0;f=b+8|0;c[f>>2]=128;c[b+4>>2]=0;h=vi(1024)|0;c[b>>2]=h;vr(h|0,0,c[f>>2]<<3|0);vr(b+12|0,0,56);do{if((a[22032]&1)<<24>>24==0){f=0;h=1;while(1){if((f|0)>=14){i=1732;break}if((h|0)>(c[22688+(f<<2)>>2]|0)){j=f+1|0;a[h+22040|0]=j&255;k=j}else{a[h+22040|0]=f&255;k=f}j=h+1|0;if((j|0)<641){f=k;h=j}else{i=1737;break}}if((i|0)==1737){a[22032]=1;break}else if((i|0)==1732){bd(5352,73,17368,10976)}}}while(0);c[b+102468>>2]=0;c[b+102472>>2]=0;c[b+102476>>2]=0;c[b+102864>>2]=0;b4(b+102872|0);c[b+102932>>2]=0;c[b+102936>>2]=0;c[b+102940>>2]=4192;c[b+102944>>2]=4184;i=b+102948|0;c[b+102980>>2]=0;c[b+102984>>2]=0;vr(i|0,0,20);a[b+102992|0]=1;a[b+102993|0]=1;a[b+102994|0]=0;a[b+102995|0]=1;a[b+102976|0]=1;k=d;d=b+102968|0;h=c[k+4>>2]|0;c[d>>2]=c[k>>2]|0;c[d+4>>2]=h;c[b+102868>>2]=4;g[b+102988>>2]=0.0;c[i>>2]=e;vr(b+102996|0,0,32);return}function dQ(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;b=c[a+102952>>2]|0;L2278:do{if((b|0)!=0){d=a|0;e=b;while(1){f=c[e+96>>2]|0;g=c[e+100>>2]|0;while(1){if((g|0)==0){break}h=c[g+4>>2]|0;c[g+28>>2]=0;dL(g,d);g=h}if((f|0)==0){break L2278}else{e=f}}}}while(0);vj(c[a+102904>>2]|0);vj(c[a+102916>>2]|0);vj(c[a+102876>>2]|0);if((c[a+102468>>2]|0)!=0){bd(4840,32,17e3,10664)}if((c[a+102864>>2]|0)!=0){bd(4840,33,17e3,7952)}b=a+4|0;e=a|0;a=c[e>>2]|0;if((c[b>>2]|0)>0){i=0;j=a}else{k=a;l=k;vj(l);return}while(1){vj(c[j+(i<<3)+4>>2]|0);a=i+1|0;d=c[e>>2]|0;if((a|0)<(c[b>>2]|0)){i=a;j=d}else{k=d;break}}l=k;vj(l);return}function dR(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=b+102960|0;if((c[e>>2]|0)<=0){bd(10624,133,15568,9672)}if((c[b+102868>>2]&2|0)!=0){bd(10624,134,15568,12392)}f=d+108|0;g=c[f>>2]|0;L2307:do{if((g|0)!=0){h=b+102980|0;i=g;while(1){j=c[i+12>>2]|0;k=c[h>>2]|0;if((k|0)==0){l=i+4|0}else{m=i+4|0;bs[c[(c[k>>2]|0)+8>>2]&511](k,c[m>>2]|0);l=m}dS(b,c[l>>2]|0);c[f>>2]=j;if((j|0)==0){break L2307}else{i=j}}}}while(0);c[f>>2]=0;f=d+112|0;l=c[f>>2]|0;L2316:do{if((l|0)!=0){g=b+102872|0;i=l;while(1){h=c[i+12>>2]|0;dq(g,c[i+4>>2]|0);if((h|0)==0){break L2316}else{i=h}}}}while(0);c[f>>2]=0;f=d+100|0;l=c[f>>2]|0;L2321:do{if((l|0)==0){n=d+104|0}else{i=b+102980|0;g=b+102912|0;h=b+102904|0;j=b+102900|0;m=b+102872|0;k=b|0;o=d+104|0;p=l;while(1){q=c[p+4>>2]|0;r=c[i>>2]|0;if((r|0)!=0){bs[c[(c[r>>2]|0)+12>>2]&511](r,p)}r=p+28|0;L2328:do{if((c[r>>2]|0)>0){s=p+24|0;t=0;while(1){u=(c[s>>2]|0)+(t*28&-1)+24|0;v=c[u>>2]|0;w=c[g>>2]|0;x=0;while(1){if((x|0)>=(w|0)){break}y=(c[h>>2]|0)+(x<<2)|0;if((c[y>>2]|0)==(v|0)){z=1790;break}else{x=x+1|0}}if((z|0)==1790){z=0;c[y>>2]=-1}c[j>>2]=(c[j>>2]|0)-1|0;cm(m,v);c[u>>2]=-1;x=t+1|0;if((x|0)<(c[r>>2]|0)){t=x}else{break L2328}}}}while(0);c[r>>2]=0;dL(p,k);t=a[22084]|0;if((t&255)>=14){break}s=b+12+((t&255)<<2)|0;c[p>>2]=c[s>>2]|0;c[s>>2]=p;c[f>>2]=q;c[o>>2]=(c[o>>2]|0)-1|0;if((q|0)==0){n=o;break L2321}else{p=q}}bd(5352,173,17448,6544)}}while(0);c[f>>2]=0;c[n>>2]=0;n=d+92|0;f=c[n>>2]|0;y=d+96|0;if((f|0)!=0){c[f+96>>2]=c[y>>2]|0}f=c[y>>2]|0;if((f|0)!=0){c[f+92>>2]=c[n>>2]|0}n=b+102952|0;if((c[n>>2]|0)==(d|0)){c[n>>2]=c[y>>2]|0}c[e>>2]=(c[e>>2]|0)-1|0;e=a[22192]|0;if((e&255)<14){y=b+12+((e&255)<<2)|0;c[d>>2]=c[y>>2]|0;c[y>>2]=d;return}else{bd(5352,173,17448,6544)}}function dS(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0,m=0;if((c[d+102868>>2]&2|0)!=0){bd(10624,274,15528,12392)}f=a[e+61|0]&1;h=e+8|0;i=c[h>>2]|0;j=e+12|0;if((i|0)!=0){c[i+12>>2]=c[j>>2]|0}i=c[j>>2]|0;if((i|0)!=0){c[i+8>>2]=c[h>>2]|0}h=d+102956|0;if((c[h>>2]|0)==(e|0)){c[h>>2]=c[j>>2]|0}j=c[e+48>>2]|0;h=c[e+52>>2]|0;i=j+4|0;k=b[i>>1]|0;if((k&2)<<16>>16==0){b[i>>1]=k|2;g[j+144>>2]=0.0}k=h+4|0;i=b[k>>1]|0;if((i&2)<<16>>16==0){b[k>>1]=i|2;g[h+144>>2]=0.0}i=e+24|0;k=c[i>>2]|0;l=e+28|0;if((k|0)!=0){c[k+12>>2]=c[l>>2]|0}k=c[l>>2]|0;if((k|0)!=0){c[k+8>>2]=c[i>>2]|0}k=j+108|0;if((e+16|0)==(c[k>>2]|0)){c[k>>2]=c[l>>2]|0}c[i>>2]=0;c[l>>2]=0;l=e+40|0;i=c[l>>2]|0;k=e+44|0;if((i|0)!=0){c[i+12>>2]=c[k>>2]|0}i=c[k>>2]|0;if((i|0)!=0){c[i+8>>2]=c[l>>2]|0}i=h+108|0;if((e+32|0)==(c[i>>2]|0)){c[i>>2]=c[k>>2]|0}c[l>>2]=0;c[k>>2]=0;fm(e,d|0);e=d+102964|0;d=c[e>>2]|0;if((d|0)<=0){bd(10624,346,15528,7232)}c[e>>2]=d-1|0;if(f<<24>>24!=0){return}f=c[h+112>>2]|0;if((f|0)==0){return}else{m=f}while(1){if((c[m>>2]|0)==(j|0)){f=(c[m+4>>2]|0)+4|0;c[f>>2]=c[f>>2]|8}f=c[m+12>>2]|0;if((f|0)==0){break}else{m=f}}return}function dT(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;if((c[b+102868>>2]&2|0)!=0){bd(10624,214,15608,12392);return 0}e=fl(d,b|0)|0;c[e+8>>2]=0;f=b+102956|0;c[e+12>>2]=c[f>>2]|0;g=c[f>>2]|0;if((g|0)!=0){c[g+8>>2]=e}c[f>>2]=e;f=b+102964|0;c[f>>2]=(c[f>>2]|0)+1|0;f=e+16|0;c[e+20>>2]=e;b=e+52|0;c[f>>2]=c[b>>2]|0;c[e+24>>2]=0;g=e+48|0;h=c[g>>2]|0;i=h+108|0;c[e+28>>2]=c[i>>2]|0;j=c[i>>2]|0;if((j|0)==0){k=h}else{c[j+8>>2]=f;k=c[g>>2]|0}c[k+108>>2]=f;f=e+32|0;c[e+36>>2]=e;c[f>>2]=c[g>>2]|0;c[e+40>>2]=0;g=c[b>>2]|0;k=g+108|0;c[e+44>>2]=c[k>>2]|0;j=c[k>>2]|0;if((j|0)==0){l=g}else{c[j+8>>2]=f;l=c[b>>2]|0}c[l+108>>2]=f;f=c[d+8>>2]|0;if((a[d+16|0]&1)<<24>>24!=0){return e|0}l=c[(c[d+12>>2]|0)+112>>2]|0;if((l|0)==0){return e|0}else{m=l}while(1){if((c[m>>2]|0)==(f|0)){l=(c[m+4>>2]|0)+4|0;c[l>>2]=c[l>>2]|8}l=c[m+12>>2]|0;if((l|0)==0){break}else{m=l}}return e|0}function dU(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0;f=i;i=i+104|0;h=f|0;j=f+16|0;l=f+72|0;m=d+103008|0;g[m>>2]=0.0;n=d+103012|0;g[n>>2]=0.0;o=d+103016|0;g[o>>2]=0.0;p=d+102960|0;q=d+102872|0;r=d+68|0;dM(j,c[p>>2]|0,c[d+102936>>2]|0,c[d+102964>>2]|0,r,c[d+102944>>2]|0);s=d+102952|0;t=c[s>>2]|0;L2431:do{if((t|0)!=0){u=t;while(1){v=u+4|0;b[v>>1]=b[v>>1]&-2;v=c[u+96>>2]|0;if((v|0)==0){break L2431}else{u=v}}}}while(0);t=c[d+102932>>2]|0;L2435:do{if((t|0)!=0){u=t;while(1){v=u+4|0;c[v>>2]=c[v>>2]&-2;v=c[u+12>>2]|0;if((v|0)==0){break L2435}else{u=v}}}}while(0);t=c[d+102956>>2]|0;L2439:do{if((t|0)!=0){u=t;while(1){a[u+60|0]=0;v=c[u+12>>2]|0;if((v|0)==0){break L2439}else{u=v}}}}while(0);t=c[p>>2]|0;p=t<<2;u=d+102864|0;v=c[u>>2]|0;if((v|0)>=32){bd(4840,38,17040,6448)}w=d+102480+(v*12&-1)|0;c[d+102480+(v*12&-1)+4>>2]=p;x=d+102468|0;y=c[x>>2]|0;if((y+p|0)>102400){c[w>>2]=vi(p)|0;a[d+102480+(v*12&-1)+8|0]=1}else{c[w>>2]=y+(d+68)|0;a[d+102480+(v*12&-1)+8|0]=0;c[x>>2]=(c[x>>2]|0)+p|0}x=d+102472|0;v=(c[x>>2]|0)+p|0;c[x>>2]=v;x=d+102476|0;p=c[x>>2]|0;c[x>>2]=(p|0)>(v|0)?p:v;c[u>>2]=(c[u>>2]|0)+1|0;u=c[w>>2]|0;w=u;v=c[s>>2]|0;L2451:do{if((v|0)!=0){p=j+28|0;x=j+36|0;y=j+32|0;z=j+40|0;A=j+8|0;B=j+48|0;C=j+16|0;D=j+44|0;E=j+12|0;F=d+102968|0;G=d+102976|0;H=l+12|0;I=l+16|0;J=l+20|0;K=v;L2453:while(1){L=K+4|0;L2455:do{if((b[L>>1]&35)<<16>>16==34){if((c[K>>2]|0)==0){break}c[p>>2]=0;c[x>>2]=0;c[y>>2]=0;c[w>>2]=K;b[L>>1]=b[L>>1]|1;M=1;while(1){N=M-1|0;O=c[w+(N<<2)>>2]|0;P=O+4|0;if((b[P>>1]&32)<<16>>16==0){Q=1882;break L2453}R=c[p>>2]|0;if((R|0)>=(c[z>>2]|0)){Q=1885;break L2453}c[O+8>>2]=R;c[(c[A>>2]|0)+(c[p>>2]<<2)>>2]=O;c[p>>2]=(c[p>>2]|0)+1|0;R=b[P>>1]|0;if((R&2)<<16>>16==0){b[P>>1]=R|2;g[O+144>>2]=0.0}L2465:do{if((c[O>>2]|0)==0){U=N}else{R=c[O+112>>2]|0;L2467:do{if((R|0)==0){V=N}else{P=N;W=R;while(1){X=c[W+4>>2]|0;Y=X+4|0;do{if((c[Y>>2]&7|0)==6){if((a[(c[X+48>>2]|0)+38|0]&1)<<24>>24!=0){Z=P;break}if((a[(c[X+52>>2]|0)+38|0]&1)<<24>>24!=0){Z=P;break}_=c[x>>2]|0;if((_|0)>=(c[D>>2]|0)){Q=1896;break L2453}c[x>>2]=_+1|0;c[(c[E>>2]|0)+(_<<2)>>2]=X;c[Y>>2]=c[Y>>2]|1;_=c[W>>2]|0;$=_+4|0;if((b[$>>1]&1)<<16>>16!=0){Z=P;break}if((P|0)>=(t|0)){Q=1900;break L2453}c[w+(P<<2)>>2]=_;b[$>>1]=b[$>>1]|1;Z=P+1|0}else{Z=P}}while(0);Y=c[W+12>>2]|0;if((Y|0)==0){V=Z;break L2467}else{P=Z;W=Y}}}}while(0);R=c[O+108>>2]|0;if((R|0)==0){U=V;break}else{aa=V;ab=R}while(1){R=ab+4|0;W=c[R>>2]|0;do{if((a[W+60|0]&1)<<24>>24==0){P=c[ab>>2]|0;Y=P+4|0;if((b[Y>>1]&32)<<16>>16==0){ac=aa;break}X=c[y>>2]|0;if((X|0)>=(c[B>>2]|0)){Q=1908;break L2453}c[y>>2]=X+1|0;c[(c[C>>2]|0)+(X<<2)>>2]=W;a[(c[R>>2]|0)+60|0]=1;if((b[Y>>1]&1)<<16>>16!=0){ac=aa;break}if((aa|0)>=(t|0)){Q=1912;break L2453}c[w+(aa<<2)>>2]=P;b[Y>>1]=b[Y>>1]|1;ac=aa+1|0}else{ac=aa}}while(0);R=c[ab+12>>2]|0;if((R|0)==0){U=ac;break L2465}else{aa=ac;ab=R}}}}while(0);if((U|0)>0){M=U}else{break}}dN(j,l,e,F,(a[G]&1)<<24>>24!=0);g[m>>2]=+g[H>>2]+ +g[m>>2];g[n>>2]=+g[I>>2]+ +g[n>>2];g[o>>2]=+g[J>>2]+ +g[o>>2];M=c[p>>2]|0;if((M|0)>0){ad=0;ae=M}else{break}while(1){M=c[(c[A>>2]|0)+(ad<<2)>>2]|0;if((c[M>>2]|0)==0){O=M+4|0;b[O>>1]=b[O>>1]&-2;af=c[p>>2]|0}else{af=ae}O=ad+1|0;if((O|0)<(af|0)){ad=O;ae=af}else{break L2455}}}}while(0);L=c[K+96>>2]|0;if((L|0)==0){break L2451}else{K=L}}if((Q|0)==1885){bd(8576,54,15328,7760)}else if((Q|0)==1900){bd(10624,495,15488,5752)}else if((Q|0)==1896){bd(8576,62,15264,8040)}else if((Q|0)==1882){bd(10624,445,15488,6264)}else if((Q|0)==1908){bd(8576,68,15296,8280)}else if((Q|0)==1912){bd(10624,524,15488,5752)}}}while(0);dh(r,u);u=c[s>>2]|0;L2512:do{if((u|0)!=0){s=h|0;r=h;Q=h+8|0;af=Q;ae=Q+4|0;Q=u;while(1){L2516:do{if((b[Q+4>>1]&1)<<16>>16!=0){if((c[Q>>2]|0)==0){break}ag=+g[Q+52>>2];ah=+T(+ag);g[af>>2]=ah;ai=+S(+ag);g[ae>>2]=ai;ag=+g[Q+28>>2];aj=+g[Q+32>>2];ak=+g[Q+40>>2]-(ah*ag+ai*aj);ad=(g[k>>2]=+g[Q+36>>2]-(ai*ag-ah*aj),c[k>>2]|0);o=(g[k>>2]=ak,c[k>>2]|0)|0;c[s>>2]=0|ad;c[s+4>>2]=o;o=(c[Q+88>>2]|0)+102872|0;ad=c[Q+100>>2]|0;if((ad|0)==0){break}n=Q+12|0;m=ad;while(1){dI(m,o,r,n);ad=c[m+4>>2]|0;if((ad|0)==0){break L2516}else{m=ad}}}}while(0);m=c[Q+96>>2]|0;if((m|0)==0){break L2512}else{Q=m}}}}while(0);dz(q|0,q);g[d+103020>>2]=0.0;d=j|0;dh(c[d>>2]|0,c[j+20>>2]|0);dh(c[d>>2]|0,c[j+24>>2]|0);dh(c[d>>2]|0,c[j+16>>2]|0);dh(c[d>>2]|0,c[j+12>>2]|0);dh(c[d>>2]|0,c[j+8>>2]|0);i=f;return}function dV(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0.0,ah=0,ai=0,aj=0,ak=0,al=0.0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0.0,ax=0.0,ay=0.0,az=0.0,aA=0.0,aB=0,aC=0,aD=0.0,aE=0.0,aF=0.0,aG=0,aH=0,aI=0.0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0;f=i;i=i+368|0;h=f|0;j=f+16|0;l=f+72|0;m=f+208|0;n=f+216|0;o=f+256|0;p=f+296|0;q=f+304|0;r=f+344|0;s=d+102872|0;t=d+102944|0;dM(j,64,32,0,d+68|0,c[t>>2]|0);u=d+102995|0;L2527:do{if((a[u]&1)<<24>>24==0){v=d+102932|0}else{w=c[d+102952>>2]|0;L2530:do{if((w|0)!=0){x=w;while(1){y=x+4|0;b[y>>1]=b[y>>1]&-2;g[x+60>>2]=0.0;y=c[x+96>>2]|0;if((y|0)==0){break L2530}else{x=y}}}}while(0);w=d+102932|0;x=c[w>>2]|0;if((x|0)==0){v=w;break}else{z=x}while(1){x=z+4|0;c[x>>2]=c[x>>2]&-34;c[z+128>>2]=0;g[z+132>>2]=1.0;x=c[z+12>>2]|0;if((x|0)==0){v=w;break L2527}else{z=x}}}}while(0);z=n;n=o;o=j+28|0;w=j+36|0;x=j+32|0;y=j+40|0;A=j+8|0;B=j+44|0;C=j+12|0;D=p|0;E=p+4|0;F=q;q=e|0;G=r|0;H=r+4|0;I=r+8|0;J=r+16|0;K=e+12|0;e=r+12|0;L=r+20|0;M=s|0;N=d+102994|0;d=h|0;O=h;P=h+8|0;h=P;Q=P+4|0;P=l+16|0;R=l+20|0;U=l+24|0;V=l+44|0;W=l+48|0;X=l+52|0;Y=l|0;Z=l+28|0;_=l+56|0;$=l+92|0;aa=l+128|0;ab=m|0;ac=m+4|0;L2537:while(1){ad=c[v>>2]|0;if((ad|0)==0){ae=1;af=2066;break}else{ag=1.0;ah=0;ai=ad}while(1){ad=ai+4|0;aj=c[ad>>2]|0;do{if((aj&4|0)==0){ak=ah;al=ag}else{if((c[ai+128>>2]|0)>8){ak=ah;al=ag;break}if((aj&32|0)==0){am=c[ai+48>>2]|0;an=c[ai+52>>2]|0;if((a[am+38|0]&1)<<24>>24!=0){ak=ah;al=ag;break}if((a[an+38|0]&1)<<24>>24!=0){ak=ah;al=ag;break}ao=c[am+8>>2]|0;ap=c[an+8>>2]|0;aq=c[ao>>2]|0;ar=c[ap>>2]|0;as=(ar|0)==2;if(!((aq|0)==2|as)){af=1961;break L2537}at=b[ao+4>>1]|0;au=b[ap+4>>1]|0;if(((at&2)<<16>>16==0|(aq|0)==0)&((au&2)<<16>>16==0|(ar|0)==0)){ak=ah;al=ag;break}if((at&8)<<16>>16==0){av=(aq|0)!=2&1}else{av=1}if((au&8)<<16>>16==0){if((av|0)==0&as){ak=ah;al=ag;break}}as=ao+28|0;au=ao+60|0;aw=+g[au>>2];aq=ap+28|0;at=ap+60|0;ax=+g[at>>2];do{if(aw<ax){if(aw>=1.0){af=1970;break L2537}ay=(ax-aw)/(1.0-aw);ar=ao+36|0;az=1.0-ay;aA=az*+g[ao+40>>2]+ay*+g[ao+48>>2];aB=ar;aC=(g[k>>2]=+g[ar>>2]*az+ay*+g[ao+44>>2],c[k>>2]|0);ar=(g[k>>2]=aA,c[k>>2]|0)|0;c[aB>>2]=0|aC;c[aB+4>>2]=ar;ar=ao+52|0;g[ar>>2]=az*+g[ar>>2]+ay*+g[ao+56>>2];g[au>>2]=ax;aD=ax}else{if(ax>=aw){aD=aw;break}if(ax>=1.0){af=1975;break L2537}ay=(aw-ax)/(1.0-ax);ar=ap+36|0;az=1.0-ay;aA=az*+g[ap+40>>2]+ay*+g[ap+48>>2];aB=ar;aC=(g[k>>2]=+g[ar>>2]*az+ay*+g[ap+44>>2],c[k>>2]|0);ar=(g[k>>2]=aA,c[k>>2]|0)|0;c[aB>>2]=0|aC;c[aB+4>>2]=ar;ar=ap+52|0;g[ar>>2]=az*+g[ar>>2]+ay*+g[ap+56>>2];g[at>>2]=aw;aD=aw}}while(0);if(aD>=1.0){af=1979;break L2537}at=c[ai+56>>2]|0;ap=c[ai+60>>2]|0;c[P>>2]=0;c[R>>2]=0;g[U>>2]=0.0;c[V>>2]=0;c[W>>2]=0;g[X>>2]=0.0;cg(Y,c[am+12>>2]|0,at);cg(Z,c[an+12>>2]|0,ap);vq(_|0,as|0,36);vq($|0,aq|0,36);g[aa>>2]=1.0;cv(m,l);if((c[ab>>2]|0)==3){aw=aD+(1.0-aD)*+g[ac>>2];aE=aw<1.0?aw:1.0}else{aE=1.0}g[ai+132>>2]=aE;c[ad>>2]=c[ad>>2]|32;aF=aE}else{aF=+g[ai+132>>2]}if(aF>=ag){ak=ah;al=ag;break}ak=ai;al=aF}}while(0);ad=c[ai+12>>2]|0;if((ad|0)==0){break}else{ag=al;ah=ak;ai=ad}}if((ak|0)==0|al>.9999988079071045){ae=1;af=2065;break}ad=c[(c[ak+48>>2]|0)+8>>2]|0;aj=c[(c[ak+52>>2]|0)+8>>2]|0;ap=ad+28|0;vq(z|0,ap|0,36);at=aj+28|0;vq(n|0,at|0,36);au=ad+60|0;aw=+g[au>>2];if(aw>=1.0){af=1992;break}ax=(al-aw)/(1.0-aw);ao=ad+36|0;aw=1.0-ax;ar=ad+44|0;aB=ad+48|0;ay=+g[ao>>2]*aw+ax*+g[ar>>2];az=aw*+g[ad+40>>2]+ax*+g[aB>>2];aC=ao;ao=(g[k>>2]=ay,c[k>>2]|0);aG=0|ao;ao=(g[k>>2]=az,c[k>>2]|0)|0;c[aC>>2]=aG;c[aC+4>>2]=ao;aC=ad+52|0;aH=ad+56|0;aA=aw*+g[aC>>2]+ax*+g[aH>>2];g[aC>>2]=aA;g[au>>2]=al;au=ad+44|0;c[au>>2]=aG;c[au+4>>2]=ao;g[aH>>2]=aA;ax=+T(+aA);ao=ad+20|0;g[ao>>2]=ax;aw=+S(+aA);au=ad+24|0;g[au>>2]=aw;aG=ad+28|0;aA=+g[aG>>2];aC=ad+32|0;aI=+g[aC>>2];aJ=ad+12|0;aK=(g[k>>2]=ay-(aw*aA-ax*aI),c[k>>2]|0);aL=(g[k>>2]=az-(ax*aA+aw*aI),c[k>>2]|0)|0;c[aJ>>2]=0|aK;c[aJ+4>>2]=aL;aL=aj+60|0;aI=+g[aL>>2];if(aI>=1.0){af=1995;break}aw=(al-aI)/(1.0-aI);aK=aj+36|0;aI=1.0-aw;aM=aj+44|0;aN=aj+48|0;aA=+g[aK>>2]*aI+aw*+g[aM>>2];ax=aI*+g[aj+40>>2]+aw*+g[aN>>2];aO=aK;aK=(g[k>>2]=aA,c[k>>2]|0);aP=0|aK;aK=(g[k>>2]=ax,c[k>>2]|0)|0;c[aO>>2]=aP;c[aO+4>>2]=aK;aO=aj+52|0;aQ=aj+56|0;az=aI*+g[aO>>2]+aw*+g[aQ>>2];g[aO>>2]=az;g[aL>>2]=al;aL=aj+44|0;c[aL>>2]=aP;c[aL+4>>2]=aK;g[aQ>>2]=az;aw=+T(+az);aK=aj+20|0;g[aK>>2]=aw;aI=+S(+az);aL=aj+24|0;g[aL>>2]=aI;aP=aj+28|0;az=+g[aP>>2];aO=aj+32|0;ay=+g[aO>>2];aR=aj+12|0;aS=(g[k>>2]=aA-(aI*az-aw*ay),c[k>>2]|0);aT=(g[k>>2]=ax-(aw*az+aI*ay),c[k>>2]|0)|0;c[aR>>2]=0|aS;c[aR+4>>2]=aT;ei(ak,c[t>>2]|0);aT=ak+4|0;aS=c[aT>>2]|0;c[aT>>2]=aS&-33;aU=ak+128|0;c[aU>>2]=(c[aU>>2]|0)+1|0;if((aS&6|0)!=6){c[aT>>2]=aS&-37;vq(ap|0,z|0,36);vq(at|0,n|0,36);ay=+g[aH>>2];aI=+T(+ay);g[ao>>2]=aI;az=+S(+ay);g[au>>2]=az;ay=+g[aG>>2];aw=+g[aC>>2];ax=+g[aB>>2]-(aI*ay+az*aw);aB=(g[k>>2]=+g[ar>>2]-(az*ay-aI*aw),c[k>>2]|0);ar=(g[k>>2]=ax,c[k>>2]|0)|0;c[aJ>>2]=0|aB;c[aJ+4>>2]=ar;ax=+g[aQ>>2];aw=+T(+ax);g[aK>>2]=aw;aI=+S(+ax);g[aL>>2]=aI;ax=+g[aP>>2];ay=+g[aO>>2];az=+g[aN>>2]-(aw*ax+aI*ay);aN=(g[k>>2]=+g[aM>>2]-(aI*ax-aw*ay),c[k>>2]|0);aM=(g[k>>2]=az,c[k>>2]|0)|0;c[aR>>2]=0|aN;c[aR+4>>2]=aM;continue}aM=ad+4|0;aR=b[aM>>1]|0;if((aR&2)<<16>>16==0){b[aM>>1]=aR|2;g[ad+144>>2]=0.0}aR=aj+4|0;aN=b[aR>>1]|0;if((aN&2)<<16>>16==0){b[aR>>1]=aN|2;g[aj+144>>2]=0.0}c[o>>2]=0;c[w>>2]=0;c[x>>2]=0;aN=c[y>>2]|0;if((aN|0)<=0){af=2005;break}aO=ad+8|0;c[aO>>2]=0;aP=c[A>>2]|0;c[aP>>2]=ad;c[o>>2]=1;if((aN|0)<=1){af=2008;break}aN=aj+8|0;c[aN>>2]=1;c[aP+4>>2]=aj;c[o>>2]=2;if((c[B>>2]|0)<=0){af=2011;break}c[w>>2]=1;c[c[C>>2]>>2]=ak;b[aM>>1]=b[aM>>1]|1;b[aR>>1]=b[aR>>1]|1;c[aT>>2]=c[aT>>2]|1;c[D>>2]=ad;c[E>>2]=aj;aj=1;aT=ad;while(1){L2593:do{if((c[aT>>2]|0)==2){ad=c[aT+112>>2]|0;if((ad|0)==0){break}aR=aT+4|0;aM=c[y>>2]|0;aP=ad;ad=c[o>>2]|0;while(1){if((ad|0)==(aM|0)){break L2593}aL=c[w>>2]|0;aK=c[B>>2]|0;if((aL|0)==(aK|0)){break L2593}aQ=c[aP+4>>2]|0;ar=aQ+4|0;L2600:do{if((c[ar>>2]&1|0)==0){aJ=c[aP>>2]|0;aB=aJ|0;do{if((c[aB>>2]|0)==2){if((b[aR>>1]&8)<<16>>16!=0){break}if((b[aJ+4>>1]&8)<<16>>16==0){aV=ad;break L2600}}}while(0);if((a[(c[aQ+48>>2]|0)+38|0]&1)<<24>>24!=0){aV=ad;break}if((a[(c[aQ+52>>2]|0)+38|0]&1)<<24>>24!=0){aV=ad;break}aC=aJ+28|0;vq(F|0,aC|0,36);aG=aJ+4|0;if((b[aG>>1]&1)<<16>>16==0){au=aJ+60|0;az=+g[au>>2];if(az>=1.0){af=2027;break L2537}ay=(al-az)/(1.0-az);ao=aJ+36|0;az=1.0-ay;aw=+g[ao>>2]*az+ay*+g[aJ+44>>2];ax=az*+g[aJ+40>>2]+ay*+g[aJ+48>>2];aH=ao;ao=(g[k>>2]=aw,c[k>>2]|0);at=0|ao;ao=(g[k>>2]=ax,c[k>>2]|0)|0;c[aH>>2]=at;c[aH+4>>2]=ao;aH=aJ+52|0;ap=aJ+56|0;aI=az*+g[aH>>2]+ay*+g[ap>>2];g[aH>>2]=aI;g[au>>2]=al;au=aJ+44|0;c[au>>2]=at;c[au+4>>2]=ao;g[ap>>2]=aI;ay=+T(+aI);g[aJ+20>>2]=ay;az=+S(+aI);g[aJ+24>>2]=az;aI=+g[aJ+28>>2];aA=+g[aJ+32>>2];ap=aJ+12|0;ao=(g[k>>2]=aw-(az*aI-ay*aA),c[k>>2]|0);au=(g[k>>2]=ax-(ay*aI+az*aA),c[k>>2]|0)|0;c[ap>>2]=0|ao;c[ap+4>>2]=au}ei(aQ,c[t>>2]|0);au=c[ar>>2]|0;if((au&4|0)==0){vq(aC|0,F|0,36);aA=+g[aJ+56>>2];az=+T(+aA);g[aJ+20>>2]=az;aI=+S(+aA);g[aJ+24>>2]=aI;aA=+g[aJ+28>>2];ay=+g[aJ+32>>2];ax=+g[aJ+48>>2]-(az*aA+aI*ay);ap=aJ+12|0;ao=(g[k>>2]=+g[aJ+44>>2]-(aI*aA-az*ay),c[k>>2]|0);at=(g[k>>2]=ax,c[k>>2]|0)|0;c[ap>>2]=0|ao;c[ap+4>>2]=at;aV=ad;break}if((au&2|0)==0){vq(aC|0,F|0,36);ax=+g[aJ+56>>2];ay=+T(+ax);g[aJ+20>>2]=ay;az=+S(+ax);g[aJ+24>>2]=az;ax=+g[aJ+28>>2];aA=+g[aJ+32>>2];aI=+g[aJ+48>>2]-(ay*ax+az*aA);aC=aJ+12|0;at=(g[k>>2]=+g[aJ+44>>2]-(az*ax-ay*aA),c[k>>2]|0);ap=(g[k>>2]=aI,c[k>>2]|0)|0;c[aC>>2]=0|at;c[aC+4>>2]=ap;aV=ad;break}c[ar>>2]=au|1;if((aL|0)>=(aK|0)){af=2036;break L2537}c[w>>2]=aL+1|0;c[(c[C>>2]|0)+(aL<<2)>>2]=aQ;au=b[aG>>1]|0;if((au&1)<<16>>16!=0){aV=ad;break}b[aG>>1]=au|1;do{if((c[aB>>2]|0)!=0){if((au&2)<<16>>16!=0){break}b[aG>>1]=au|3;g[aJ+144>>2]=0.0}}while(0);if((ad|0)>=(aM|0)){af=2043;break L2537}c[aJ+8>>2]=ad;c[(c[A>>2]|0)+(ad<<2)>>2]=aJ;au=ad+1|0;c[o>>2]=au;aV=au}else{aV=ad}}while(0);aQ=c[aP+12>>2]|0;if((aQ|0)==0){break L2593}else{aP=aQ;ad=aV}}}}while(0);if((aj|0)>=2){break}ad=c[p+(aj<<2)>>2]|0;aj=aj+1|0;aT=ad}aI=(1.0-al)*+g[q>>2];g[G>>2]=aI;g[H>>2]=1.0/aI;g[I>>2]=1.0;c[J>>2]=20;c[e>>2]=c[K>>2]|0;a[L]=0;dO(j,r,c[aO>>2]|0,c[aN>>2]|0);aT=c[o>>2]|0;L2631:do{if((aT|0)>0){aj=c[A>>2]|0;ad=0;while(1){aP=c[aj+(ad<<2)>>2]|0;aM=aP+4|0;b[aM>>1]=b[aM>>1]&-2;L2635:do{if((c[aP>>2]|0)==2){aI=+g[aP+52>>2];aA=+T(+aI);g[h>>2]=aA;ay=+S(+aI);g[Q>>2]=ay;aI=+g[aP+28>>2];ax=+g[aP+32>>2];az=+g[aP+40>>2]-(aA*aI+ay*ax);aM=(g[k>>2]=+g[aP+36>>2]-(ay*aI-aA*ax),c[k>>2]|0);aR=(g[k>>2]=az,c[k>>2]|0)|0;c[d>>2]=0|aM;c[d+4>>2]=aR;aR=(c[aP+88>>2]|0)+102872|0;aM=c[aP+100>>2]|0;L2637:do{if((aM|0)!=0){aq=aP+12|0;as=aM;while(1){dI(as,aR,O,aq);an=c[as+4>>2]|0;if((an|0)==0){break L2637}else{as=an}}}}while(0);aR=c[aP+112>>2]|0;if((aR|0)==0){break}else{aW=aR}while(1){aR=(c[aW+4>>2]|0)+4|0;c[aR>>2]=c[aR>>2]&-34;aR=c[aW+12>>2]|0;if((aR|0)==0){break L2635}else{aW=aR}}}}while(0);aP=ad+1|0;if((aP|0)<(aT|0)){ad=aP}else{break L2631}}}}while(0);dz(M,s);if((a[N]&1)<<24>>24!=0){ae=0;af=2067;break}}if((af|0)==1961){bd(10624,641,15440,5216)}else if((af|0)==1970){bd(8768,723,15712,4888)}else if((af|0)==1975){bd(8768,723,15712,4888)}else if((af|0)==1979){bd(10624,676,15440,4888)}else if((af|0)==1992){bd(8768,723,15712,4888)}else if((af|0)==1995){bd(8768,723,15712,4888)}else if((af|0)==2005){bd(8576,54,15328,7760)}else if((af|0)==2008){bd(8576,54,15328,7760)}else if((af|0)==2011){bd(8576,62,15264,8040)}else if((af|0)==2027){bd(8768,723,15712,4888)}else if((af|0)==2043){bd(8576,54,15328,7760)}else if((af|0)==2065){a[u]=ae;N=j|0;s=c[N>>2]|0;M=j+20|0;aW=c[M>>2]|0;O=aW;dh(s,O);d=c[N>>2]|0;Q=j+24|0;h=c[Q>>2]|0;o=h;dh(d,o);r=c[N>>2]|0;L=j+16|0;K=c[L>>2]|0;e=K;dh(r,e);J=c[N>>2]|0;I=c[C>>2]|0;H=I;dh(J,H);G=c[A>>2]|0;q=G;dh(J,q);i=f;return}else if((af|0)==2066){a[u]=ae;N=j|0;s=c[N>>2]|0;M=j+20|0;aW=c[M>>2]|0;O=aW;dh(s,O);d=c[N>>2]|0;Q=j+24|0;h=c[Q>>2]|0;o=h;dh(d,o);r=c[N>>2]|0;L=j+16|0;K=c[L>>2]|0;e=K;dh(r,e);J=c[N>>2]|0;I=c[C>>2]|0;H=I;dh(J,H);G=c[A>>2]|0;q=G;dh(J,q);i=f;return}else if((af|0)==2067){a[u]=ae;N=j|0;s=c[N>>2]|0;M=j+20|0;aW=c[M>>2]|0;O=aW;dh(s,O);d=c[N>>2]|0;Q=j+24|0;h=c[Q>>2]|0;o=h;dh(d,o);r=c[N>>2]|0;L=j+16|0;K=c[L>>2]|0;e=K;dh(r,e);J=c[N>>2]|0;I=c[C>>2]|0;H=I;dh(J,H);G=c[A>>2]|0;q=G;dh(J,q);i=f;return}else if((af|0)==2036){bd(8576,62,15264,8040)}}function dW(b,d,e,f){b=b|0;d=+d;e=e|0;f=f|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0,q=0,r=0,s=0;h=i;i=i+24|0;j=h|0;k=b+102868|0;l=c[k>>2]|0;if((l&1|0)==0){m=l}else{l=b+102872|0;dz(l|0,l);l=c[k>>2]&-2;c[k>>2]=l;m=l}c[k>>2]=m|2;m=j|0;g[m>>2]=d;c[j+12>>2]=e;c[j+16>>2]=f;f=d>0.0;if(f){g[j+4>>2]=1.0/d}else{g[j+4>>2]=0.0}e=b+102988|0;g[j+8>>2]=+g[e>>2]*d;a[j+20|0]=a[b+102992|0]&1;dy(b+102872|0);g[b+103e3>>2]=0.0;if(!((a[b+102995|0]&1)<<24>>24==0|f^1)){dU(b,j);g[b+103004>>2]=0.0}do{if((a[b+102993|0]&1)<<24>>24==0){n=2078}else{d=+g[m>>2];if(d<=0.0){o=d;break}dV(b,j);g[b+103024>>2]=0.0;n=2078;break}}while(0);if((n|0)==2078){o=+g[m>>2]}if(o>0.0){g[e>>2]=+g[j+4>>2]}j=c[k>>2]|0;if((j&4|0)==0){p=j;q=p&-3;c[k>>2]=q;r=b+102996|0;g[r>>2]=0.0;i=h;return}e=c[b+102952>>2]|0;if((e|0)==0){p=j;q=p&-3;c[k>>2]=q;r=b+102996|0;g[r>>2]=0.0;i=h;return}else{s=e}while(1){g[s+76>>2]=0.0;g[s+80>>2]=0.0;g[s+84>>2]=0.0;e=c[s+96>>2]|0;if((e|0)==0){break}else{s=e}}p=c[k>>2]|0;q=p&-3;c[k>>2]=q;r=b+102996|0;g[r>>2]=0.0;i=h;return}function dX(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;d=i;i=i+56|0;e=d|0;f=d+8|0;h=d+16|0;j=d+24|0;k=d+32|0;l=d+48|0;m=l;n=i;i=i+8|0;o=n;p=(c[b+52>>2]|0)+12|0;q=(c[b+48>>2]|0)+12|0;r=c[q+4>>2]|0;c[e>>2]=c[q>>2]|0;c[e+4>>2]=r;r=p;p=c[r+4>>2]|0;c[f>>2]=c[r>>2]|0;c[f+4>>2]=p;p=b;bs[c[c[p>>2]>>2]&511](h,b);bs[c[(c[p>>2]|0)+4>>2]&511](j,b);g[k>>2]=.5;g[k+4>>2]=.800000011920929;g[k+8>>2]=.800000011920929;p=c[b+4>>2]|0;if((p|0)==5){i=d;return}else if((p|0)==3){r=c[a+102984>>2]|0;bR[c[(c[r>>2]|0)+24>>2]&127](r,h,j,k);i=d;return}else if((p|0)==4){p=b+68|0;r=c[p+4>>2]|0;c[l>>2]=c[p>>2]|0;c[l+4>>2]=r;r=b+76|0;b=c[r+4>>2]|0;c[n>>2]=c[r>>2]|0;c[n+4>>2]=b;b=a+102984|0;n=c[b>>2]|0;bR[c[(c[n>>2]|0)+24>>2]&127](n,m,h,k);n=c[b>>2]|0;bR[c[(c[n>>2]|0)+24>>2]&127](n,o,j,k);n=c[b>>2]|0;bR[c[(c[n>>2]|0)+24>>2]&127](n,m,o,k);i=d;return}else{o=a+102984|0;a=c[o>>2]|0;bR[c[(c[a>>2]|0)+24>>2]&127](a,e,h,k);e=c[o>>2]|0;bR[c[(c[e>>2]|0)+24>>2]&127](e,h,j,k);h=c[o>>2]|0;bR[c[(c[h>>2]|0)+24>>2]&127](h,f,j,k);i=d;return}}function dY(a){a=a|0;var b=0,d=0.0,e=0,f=0,j=0,k=0,l=0,m=0;b=i;if((c[a+102868>>2]&2|0)!=0){i=b;return}d=+g[a+102972>>2];dc(4360,(v=i,i=i+16|0,h[v>>3]=+g[a+102968>>2],h[v+8>>3]=d,v)|0);dc(12864,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(12632,(v=i,i=i+8|0,c[v>>2]=c[a+102960>>2]|0,v)|0);dc(12040,(v=i,i=i+8|0,c[v>>2]=c[a+102964>>2]|0,v)|0);e=c[a+102952>>2]|0;L2718:do{if((e|0)!=0){f=0;j=e;while(1){c[j+8>>2]=f;dp(j);k=c[j+96>>2]|0;if((k|0)==0){break L2718}else{f=f+1|0;j=k}}}}while(0);e=a+102956|0;a=c[e>>2]|0;L2722:do{if((a|0)!=0){j=0;f=a;while(1){c[f+56>>2]=j;k=c[f+12>>2]|0;if((k|0)==0){break}else{j=j+1|0;f=k}}f=c[e>>2]|0;if((f|0)==0){break}else{l=f}while(1){if((c[l+4>>2]|0)!=6){dc(11584,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);br[c[(c[l>>2]|0)+16>>2]&511](l);dc(11328,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0)}f=c[l+12>>2]|0;if((f|0)==0){break}else{l=f}}f=c[e>>2]|0;if((f|0)==0){break}else{m=f}while(1){if((c[m+4>>2]|0)==6){dc(11584,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);br[c[(c[m>>2]|0)+16>>2]&511](m);dc(11328,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0)}f=c[m+12>>2]|0;if((f|0)==0){break L2722}else{m=f}}}}while(0);dc(11128,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(10904,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(10712,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(10512,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);i=b;return}function dZ(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;f=i;i=i+40|0;h=f|0;j=f+8|0;l=f+16|0;m=f+24|0;n=f+32|0;o=n;p=i;i=i+8|0;q=p;r=i;i=i+64|0;s=c[b+12>>2]|0;b=c[s+4>>2]|0;if((b|0)==1){t=+g[d+12>>2];u=+g[s+12>>2];v=+g[d+8>>2];w=+g[s+16>>2];x=+g[d>>2];y=+g[d+4>>2];g[l>>2]=x+(t*u-v*w);g[l+4>>2]=u*v+t*w+y;z=s+20|0;w=+g[z>>2];u=+g[z+4>>2];g[m>>2]=x+(t*w-v*u);g[m+4>>2]=w*v+t*u+y;z=c[a+102984>>2]|0;bR[c[(c[z>>2]|0)+24>>2]&127](z,l,m,e);i=f;return}else if((b|0)==2){m=c[s+148>>2]|0;if((m|0)>=9){bd(10624,1077,15360,4600)}l=r|0;L2748:do{if((m|0)>0){z=s+20|0;y=+g[d+12>>2];u=+g[d+8>>2];t=+g[d>>2];v=+g[d+4>>2];A=0;while(1){w=+g[z+(A<<3)>>2];x=+g[z+(A<<3)+4>>2];B=r+(A<<3)|0;C=(g[k>>2]=t+(y*w-u*x),c[k>>2]|0);D=(g[k>>2]=w*u+y*x+v,c[k>>2]|0)|0;c[B>>2]=0|C;c[B+4>>2]=D;D=A+1|0;if((D|0)<(m|0)){A=D}else{break L2748}}}}while(0);r=c[a+102984>>2]|0;bR[c[(c[r>>2]|0)+12>>2]&127](r,l,m,e);i=f;return}else if((b|0)==3){m=c[s+16>>2]|0;l=c[s+12>>2]|0;r=d+12|0;v=+g[r>>2];y=+g[l>>2];A=d+8|0;u=+g[A>>2];t=+g[l+4>>2];z=d|0;x=+g[z>>2];D=d+4|0;w=+g[D>>2];g[n>>2]=x+(v*y-u*t);g[o+4>>2]=y*u+v*t+w;if((m|0)<=1){i=f;return}B=p;C=q+4|0;E=a+102984|0;F=1;t=v;v=u;u=x;x=w;while(1){w=+g[l+(F<<3)>>2];y=+g[l+(F<<3)+4>>2];g[B>>2]=u+(t*w-v*y);g[C>>2]=w*v+t*y+x;G=c[E>>2]|0;bR[c[(c[G>>2]|0)+24>>2]&127](G,o,q,e);G=c[E>>2]|0;bu[c[(c[G>>2]|0)+16>>2]&63](G,o,.05000000074505806,e);G=c[p+4>>2]|0;c[n>>2]=c[p>>2]|0;c[n+4>>2]=G;G=F+1|0;if((G|0)>=(m|0)){break}F=G;t=+g[r>>2];v=+g[A>>2];u=+g[z>>2];x=+g[D>>2]}i=f;return}else if((b|0)==0){x=+g[d+12>>2];u=+g[s+12>>2];v=+g[d+8>>2];t=+g[s+16>>2];y=u*v+x*t+ +g[d+4>>2];g[h>>2]=+g[d>>2]+(x*u-v*t);g[h+4>>2]=y;y=+g[s+8>>2];g[j>>2]=x-v*0.0;g[j+4>>2]=v+x*0.0;s=c[a+102984>>2]|0;bq[c[(c[s>>2]|0)+20>>2]&63](s,h,y,j,e);i=f;return}else{i=f;return}}function d_(a){a=a|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0.0,T=0.0,U=0.0,V=0.0;d=i;i=i+144|0;e=d|0;f=d+16|0;h=d+32|0;j=d+48|0;k=d+64|0;l=d+80|0;m=d+96|0;n=d+128|0;o=n|0;p=n;q=a+102984|0;r=c[q>>2]|0;if((r|0)==0){i=d;return}s=c[r+4>>2]|0;L2768:do{if((s&1|0)!=0){r=c[a+102952>>2]|0;if((r|0)==0){break}t=e|0;u=e+4|0;v=e+8|0;w=j|0;x=j+4|0;y=j+8|0;z=k|0;A=k+4|0;B=k+8|0;C=f|0;D=f+4|0;E=f+8|0;F=h|0;G=h+4|0;H=h+8|0;I=r;while(1){r=I+12|0;J=c[I+100>>2]|0;L2773:do{if((J|0)!=0){K=I+4|0;L=I|0;M=J;while(1){N=b[K>>1]|0;do{if((N&32)<<16>>16==0){g[t>>2]=.5;g[u>>2]=.5;g[v>>2]=.30000001192092896;dZ(a,M,r,e)}else{O=c[L>>2]|0;if((O|0)==1){g[F>>2]=.5;g[G>>2]=.5;g[H>>2]=.8999999761581421;dZ(a,M,r,h);break}else if((O|0)==0){g[C>>2]=.5;g[D>>2]=.8999999761581421;g[E>>2]=.5;dZ(a,M,r,f);break}else{if((N&2)<<16>>16==0){g[w>>2]=.6000000238418579;g[x>>2]=.6000000238418579;g[y>>2]=.6000000238418579;dZ(a,M,r,j);break}else{g[z>>2]=.8999999761581421;g[A>>2]=.699999988079071;g[B>>2]=.699999988079071;dZ(a,M,r,k);break}}}}while(0);N=c[M+4>>2]|0;if((N|0)==0){break L2773}else{M=N}}}}while(0);r=c[I+96>>2]|0;if((r|0)==0){break L2768}else{I=r}}}}while(0);L2790:do{if((s&2|0)!=0){k=c[a+102956>>2]|0;if((k|0)==0){break}else{P=k}while(1){dX(a,P);k=c[P+12>>2]|0;if((k|0)==0){break L2790}else{P=k}}}}while(0);L2795:do{if((s&8|0)!=0){P=a+102932|0;while(1){k=c[P>>2]|0;if((k|0)==0){break L2795}else{P=k+12|0}}}}while(0);L2800:do{if((s&4|0)!=0){g[l>>2]=.8999999761581421;g[l+4>>2]=.30000001192092896;g[l+8>>2]=.8999999761581421;P=c[a+102952>>2]|0;if((P|0)==0){break}k=a+102884|0;j=a+102876|0;f=m|0;h=m|0;e=m+4|0;I=m+8|0;B=m+12|0;A=m+16|0;z=m+20|0;y=m+24|0;x=m+28|0;w=P;L2803:while(1){L2805:do{if((b[w+4>>1]&32)<<16>>16!=0){P=c[w+100>>2]|0;if((P|0)==0){break}else{Q=P}while(1){P=Q+28|0;L2809:do{if((c[P>>2]|0)>0){E=Q+24|0;D=0;while(1){C=c[(c[E>>2]|0)+(D*28&-1)+24>>2]|0;if((C|0)<=-1){R=2180;break L2803}if((c[k>>2]|0)<=(C|0)){R=2179;break L2803}H=c[j>>2]|0;S=+g[H+(C*36&-1)>>2];T=+g[H+(C*36&-1)+4>>2];U=+g[H+(C*36&-1)+8>>2];V=+g[H+(C*36&-1)+12>>2];g[h>>2]=S;g[e>>2]=T;g[I>>2]=U;g[B>>2]=T;g[A>>2]=U;g[z>>2]=V;g[y>>2]=S;g[x>>2]=V;C=c[q>>2]|0;bR[c[(c[C>>2]|0)+8>>2]&127](C,f,4,l);C=D+1|0;if((C|0)<(c[P>>2]|0)){D=C}else{break L2809}}}}while(0);P=c[Q+4>>2]|0;if((P|0)==0){break L2805}else{Q=P}}}}while(0);P=c[w+96>>2]|0;if((P|0)==0){break L2800}else{w=P}}if((R|0)==2179){bd(10360,159,14456,9904)}else if((R|0)==2180){bd(10360,159,14456,9904)}}}while(0);if((s&16|0)==0){i=d;return}s=c[a+102952>>2]|0;if((s|0)==0){i=d;return}a=n;n=s;while(1){s=n+12|0;c[a>>2]=c[s>>2]|0;c[a+4>>2]=c[s+4>>2]|0;c[a+8>>2]=c[s+8>>2]|0;c[a+12>>2]=c[s+12>>2]|0;s=n+44|0;R=c[s+4>>2]|0;c[o>>2]=c[s>>2]|0;c[o+4>>2]=R;R=c[q>>2]|0;bs[c[(c[R>>2]|0)+28>>2]&511](R,p);R=c[n+96>>2]|0;if((R|0)==0){break}else{n=R}}i=d;return}function d$(a){a=a|0;return}function d0(a){a=a|0;return}function d1(a,c,d){a=a|0;c=c|0;d=d|0;var e=0;a=b[c+36>>1]|0;if(!(a<<16>>16!=(b[d+36>>1]|0)|a<<16>>16==0)){e=a<<16>>16>0;return e|0}if((b[d+32>>1]&b[c+34>>1])<<16>>16==0){e=0;return e|0}e=(b[d+34>>1]&b[c+32>>1])<<16>>16!=0;return e|0}function d2(a){a=a|0;vl(a);return}function d3(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0;f=i;i=i+48|0;h=f|0;j=c[(c[a+48>>2]|0)+12>>2]|0;c[h>>2]=20512;c[h+4>>2]=1;g[h+8>>2]=.009999999776482582;vr(h+28|0,0,18);cY(j,h,c[a+56>>2]|0);b7(b,h,d,c[(c[a+52>>2]|0)+12>>2]|0,e);i=f;return}function d4(a){a=a|0;vl(a);return}function d5(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0;f=i;i=i+304|0;h=f+256|0;j=c[(c[a+48>>2]|0)+12>>2]|0;c[h>>2]=20512;c[h+4>>2]=1;g[h+8>>2]=.009999999776482582;vr(h+28|0,0,18);cY(j,h,c[a+56>>2]|0);b8(f|0,b,h,d,c[(c[a+52>>2]|0)+12>>2]|0,e);i=f;return}function d6(a){a=a|0;vl(a);return}function d7(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0.0,n=0.0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0,L=0,M=0,N=0,O=0.0,P=0.0,R=0.0,S=0.0,T=0.0,U=0,V=0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0,ae=0.0,af=0.0,ag=0,ah=0,ai=0,aj=0;e=i;i=i+1064|0;f=e|0;h=e+1040|0;j=d;l=c[j+4>>2]|0;m=(c[k>>2]=c[j>>2]|0,+g[k>>2]);n=(c[k>>2]=l,+g[k>>2]);l=d+8|0;o=c[l+4>>2]|0;p=(c[k>>2]=c[l>>2]|0,+g[k>>2]);q=p-m;p=(c[k>>2]=o,+g[k>>2])-n;r=q*q+p*p;if(r<=0.0){bd(10360,204,14104,10168)}s=+Q(+r);if(s<1.1920928955078125e-7){t=q;u=p}else{r=1.0/s;t=q*r;u=p*r}r=u*-1.0;if(r>0.0){v=r}else{v=-0.0-r}if(t>0.0){w=t}else{w=-0.0-t}u=+g[d+16>>2];s=m+q*u;x=n+p*u;d=f+4|0;o=f|0;c[o>>2]=d;y=f+1028|0;c[y>>2]=0;z=f+1032|0;c[z>>2]=256;c[(c[o>>2]|0)+(c[y>>2]<<2)>>2]=c[a>>2]|0;f=(c[y>>2]|0)+1|0;c[y>>2]=f;L2859:do{if((f|0)>0){A=a+4|0;B=h;C=h+8|0;D=h+16|0;E=f;F=n<x?n:x;G=m<s?m:s;H=n>x?n:x;I=m>s?m:s;J=u;while(1){K=E;while(1){L=K-1|0;c[y>>2]=L;M=c[o>>2]|0;N=c[M+(L<<2)>>2]|0;if((N|0)==-1){O=J;P=I;R=H;S=G;T=F;U=L;break}V=c[A>>2]|0;W=+g[V+(N*36&-1)+8>>2];X=+g[V+(N*36&-1)+12>>2];Y=+g[V+(N*36&-1)>>2];Z=+g[V+(N*36&-1)+4>>2];if(G-W>0.0|F-X>0.0|Y-I>0.0|Z-H>0.0){_=J;$=I;aa=H;ab=G;ac=F;ad=2206;break}ae=r*(m-(W+Y)*.5)+t*(n-(X+Z)*.5);if(ae>0.0){af=ae}else{af=-0.0-ae}if(af-(v*(W-Y)*.5+w*(X-Z)*.5)>0.0){_=J;$=I;aa=H;ab=G;ac=F;ad=2206;break}ag=V+(N*36&-1)+24|0;if((c[ag>>2]|0)==-1){ad=2217;break}do{if((L|0)==(c[z>>2]|0)){c[z>>2]=L<<1;ah=vi(L<<3)|0;c[o>>2]=ah;ai=M;vq(ah|0,ai|0,c[y>>2]<<2);if((M|0)==(d|0)){break}vj(ai)}}while(0);c[(c[o>>2]|0)+(c[y>>2]<<2)>>2]=c[ag>>2]|0;M=(c[y>>2]|0)+1|0;c[y>>2]=M;L=V+(N*36&-1)+28|0;do{if((M|0)==(c[z>>2]|0)){ai=c[o>>2]|0;c[z>>2]=M<<1;ah=vi(M<<3)|0;c[o>>2]=ah;aj=ai;vq(ah|0,aj|0,c[y>>2]<<2);if((ai|0)==(d|0)){break}vj(aj)}}while(0);c[(c[o>>2]|0)+(c[y>>2]<<2)>>2]=c[L>>2]|0;M=(c[y>>2]|0)+1|0;c[y>>2]=M;if((M|0)>0){K=M}else{break L2859}}do{if((ad|0)==2217){ad=0;K=c[j+4>>2]|0;c[B>>2]=c[j>>2]|0;c[B+4>>2]=K;K=c[l+4>>2]|0;c[C>>2]=c[l>>2]|0;c[C+4>>2]=K;g[D>>2]=J;Z=+d8(b,h,N);if(Z==0.0){break L2859}if(Z<=0.0){_=J;$=I;aa=H;ab=G;ac=F;ad=2206;break}X=m+q*Z;Y=n+p*Z;_=Z;$=m>X?m:X;aa=n>Y?n:Y;ab=m<X?m:X;ac=n<Y?n:Y;ad=2206;break}}while(0);if((ad|0)==2206){ad=0;O=_;P=$;R=aa;S=ab;T=ac;U=c[y>>2]|0}if((U|0)>0){E=U;F=T;G=S;H=R;I=P;J=O}else{break L2859}}}}while(0);U=c[o>>2]|0;if((U|0)==(d|0)){i=e;return}vj(U);c[o>>2]=0;i=e;return}function d8(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0.0,m=0.0,n=0.0;e=i;i=i+24|0;f=e|0;h=e+16|0;j=c[a>>2]|0;if((d|0)<=-1){bd(10360,153,14408,9904);return 0.0}if((c[j+12>>2]|0)<=(d|0)){bd(10360,153,14408,9904);return 0.0}k=c[(c[j+4>>2]|0)+(d*36&-1)+16>>2]|0;d=c[k+16>>2]|0;j=c[d+12>>2]|0;if(bL[c[(c[j>>2]|0)+20>>2]&127](j,f,b,(c[d+8>>2]|0)+12|0,c[k+20>>2]|0)|0){l=+g[f+8>>2];m=1.0-l;n=m*+g[b+4>>2]+l*+g[b+12>>2];g[h>>2]=+g[b>>2]*m+l*+g[b+8>>2];g[h+4>>2]=n;k=c[a+4>>2]|0;n=+bJ[c[(c[k>>2]|0)+8>>2]&63](k,d,h,f|0,l);i=e;return+n}else{n=+g[b+16>>2];i=e;return+n}return 0.0}function d9(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;e=i;i=i+1040|0;f=e|0;h=f+4|0;j=f|0;c[j>>2]=h;k=f+1028|0;c[k>>2]=0;l=f+1032|0;c[l>>2]=256;c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[a>>2]|0;f=(c[k>>2]|0)+1|0;c[k>>2]=f;L2906:do{if((f|0)>0){m=a+4|0;n=d|0;o=d+4|0;p=d+8|0;q=d+12|0;r=b|0;s=b+4|0;t=f;L2908:while(1){u=t-1|0;c[k>>2]=u;v=c[j>>2]|0;w=c[v+(u<<2)>>2]|0;do{if((w|0)==-1){x=u}else{y=c[m>>2]|0;if(+g[n>>2]- +g[y+(w*36&-1)+8>>2]>0.0|+g[o>>2]- +g[y+(w*36&-1)+12>>2]>0.0|+g[y+(w*36&-1)>>2]- +g[p>>2]>0.0|+g[y+(w*36&-1)+4>>2]- +g[q>>2]>0.0){x=u;break}z=y+(w*36&-1)+24|0;if((c[z>>2]|0)==-1){A=c[r>>2]|0;if((w|0)<=-1){break L2908}if((c[A+12>>2]|0)<=(w|0)){break L2908}B=c[s>>2]|0;if(!(bI[c[(c[B>>2]|0)+8>>2]&255](B,c[(c[(c[A+4>>2]|0)+(w*36&-1)+16>>2]|0)+16>>2]|0)|0)){break L2906}x=c[k>>2]|0;break}do{if((u|0)==(c[l>>2]|0)){c[l>>2]=u<<1;A=vi(u<<3)|0;c[j>>2]=A;B=v;vq(A|0,B|0,c[k>>2]<<2);if((v|0)==(h|0)){break}vj(B)}}while(0);c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[z>>2]|0;B=(c[k>>2]|0)+1|0;c[k>>2]=B;A=y+(w*36&-1)+28|0;do{if((B|0)==(c[l>>2]|0)){C=c[j>>2]|0;c[l>>2]=B<<1;D=vi(B<<3)|0;c[j>>2]=D;E=C;vq(D|0,E|0,c[k>>2]<<2);if((C|0)==(h|0)){break}vj(E)}}while(0);c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[A>>2]|0;B=(c[k>>2]|0)+1|0;c[k>>2]=B;x=B}}while(0);if((x|0)>0){t=x}else{break L2906}}bd(10360,153,14408,9904)}}while(0);x=c[j>>2]|0;if((x|0)==(h|0)){i=e;return}vj(x);c[j>>2]=0;i=e;return}function ea(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0;h=dg(f,144)|0;if((h|0)==0){i=0;j=i|0;return j|0}f=h;c[f>>2]=19280;c[h+4>>2]=4;c[h+48>>2]=a;c[h+52>>2]=d;c[h+56>>2]=b;c[h+60>>2]=e;c[h+124>>2]=0;c[h+128>>2]=0;vr(h+8|0,0,40);g[h+136>>2]=+Q(+(+g[a+16>>2]*+g[d+16>>2]));k=+g[a+20>>2];l=+g[d+20>>2];g[h+140>>2]=k>l?k:l;c[f>>2]=19512;if((c[(c[a+12>>2]|0)+4>>2]|0)!=3){bd(10096,43,16664,12232);return 0}if((c[(c[d+12>>2]|0)+4>>2]|0)==0){i=h;j=i|0;return j|0}else{bd(10096,44,16664,9416);return 0}return 0}function eb(b,d){b=b|0;d=d|0;var e=0,f=0;br[c[(c[b>>2]|0)+4>>2]&511](b);e=a[22184]|0;if((e&255)<14){f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else{bd(5352,173,17448,6544)}}function ec(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0;h=dg(f,144)|0;if((h|0)==0){i=0;j=i|0;return j|0}f=h;c[f>>2]=19280;c[h+4>>2]=4;c[h+48>>2]=a;c[h+52>>2]=d;c[h+56>>2]=b;c[h+60>>2]=e;c[h+124>>2]=0;c[h+128>>2]=0;vr(h+8|0,0,40);g[h+136>>2]=+Q(+(+g[a+16>>2]*+g[d+16>>2]));k=+g[a+20>>2];l=+g[d+20>>2];g[h+140>>2]=k>l?k:l;c[f>>2]=19448;if((c[(c[a+12>>2]|0)+4>>2]|0)!=3){bd(9952,43,16488,12232);return 0}if((c[(c[d+12>>2]|0)+4>>2]|0)==2){i=h;j=i|0;return j|0}else{bd(9952,44,16488,9368);return 0}return 0}function ed(b,d){b=b|0;d=d|0;var e=0,f=0;br[c[(c[b>>2]|0)+4>>2]&511](b);e=a[22184]|0;if((e&255)<14){f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else{bd(5352,173,17448,6544)}}function ee(a){a=a|0;return}function ef(a){a=a|0;return}function eg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;f=c[(c[a+48>>2]|0)+12>>2]|0;h=c[(c[a+52>>2]|0)+12>>2]|0;a=b+60|0;c[a>>2]=0;i=f+12|0;j=+g[d+12>>2];k=+g[i>>2];l=+g[d+8>>2];m=+g[f+16>>2];n=h+12|0;o=+g[e+12>>2];p=+g[n>>2];q=+g[e+8>>2];r=+g[h+16>>2];s=+g[e>>2]+(o*p-q*r)-(+g[d>>2]+(j*k-l*m));t=p*q+o*r+ +g[e+4>>2]-(k*l+j*m+ +g[d+4>>2]);m=+g[f+8>>2]+ +g[h+8>>2];if(s*s+t*t>m*m){return}c[b+56>>2]=0;h=i;i=b+48|0;f=c[h+4>>2]|0;c[i>>2]=c[h>>2]|0;c[i+4>>2]=f;g[b+40>>2]=0.0;g[b+44>>2]=0.0;c[a>>2]=1;a=n;n=b;f=c[a+4>>2]|0;c[n>>2]=c[a>>2]|0;c[n+4>>2]=f;c[b+16>>2]=0;return}function eh(a){a=a|0;vl(a);return}function ei(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;f=i;i=i+200|0;h=f|0;j=f+96|0;k=f+112|0;l=f+136|0;m=d+64|0;vq(l|0,m|0,64);n=d+4|0;o=c[n>>2]|0;c[n>>2]=o|4;p=o>>>1;o=c[d+48>>2]|0;q=c[d+52>>2]|0;r=((a[q+38|0]|a[o+38|0])&1)<<24>>24!=0;s=c[o+8>>2]|0;t=c[q+8>>2]|0;u=s+12|0;v=t+12|0;do{if(r){w=c[o+12>>2]|0;x=c[q+12>>2]|0;y=c[d+56>>2]|0;z=c[d+60>>2]|0;c[h+16>>2]=0;c[h+20>>2]=0;g[h+24>>2]=0.0;c[h+44>>2]=0;c[h+48>>2]=0;g[h+52>>2]=0.0;cg(h|0,w,y);cg(h+28|0,x,z);z=h+56|0;x=u;c[z>>2]=c[x>>2]|0;c[z+4>>2]=c[x+4>>2]|0;c[z+8>>2]=c[x+8>>2]|0;c[z+12>>2]=c[x+12>>2]|0;x=h+72|0;z=v;c[x>>2]=c[z>>2]|0;c[x+4>>2]=c[z+4>>2]|0;c[x+8>>2]=c[z+8>>2]|0;c[x+12>>2]=c[z+12>>2]|0;a[h+88|0]=1;b[j+4>>1]=0;ch(k,j,h);z=+g[k+16>>2]<11920928955078125.0e-22;c[d+124>>2]=0;A=z;B=p&1}else{bR[c[c[d>>2]>>2]&127](d,m,u,v);z=d+124|0;x=(c[z>>2]|0)>0;L2976:do{if(x){y=c[l+60>>2]|0;w=0;while(1){C=d+64+(w*20&-1)+8|0;g[C>>2]=0.0;D=d+64+(w*20&-1)+12|0;g[D>>2]=0.0;E=c[d+64+(w*20&-1)+16>>2]|0;F=0;while(1){if((F|0)>=(y|0)){break}if((c[l+(F*20&-1)+16>>2]|0)==(E|0)){G=2312;break}else{F=F+1|0}}if((G|0)==2312){G=0;g[C>>2]=+g[l+(F*20&-1)+8>>2];g[D>>2]=+g[l+(F*20&-1)+12>>2]}E=w+1|0;if((E|0)<(c[z>>2]|0)){w=E}else{break L2976}}}}while(0);z=p&1;if(!(x^(z|0)!=0)){A=x;B=z;break}w=s+4|0;y=b[w>>1]|0;if((y&2)<<16>>16==0){b[w>>1]=y|2;g[s+144>>2]=0.0}y=t+4|0;w=b[y>>1]|0;if((w&2)<<16>>16!=0){A=x;B=z;break}b[y>>1]=w|2;g[t+144>>2]=0.0;A=x;B=z}}while(0);t=c[n>>2]|0;c[n>>2]=A?t|2:t&-3;t=(B|0)==0;B=A^1;n=(e|0)==0;if(!(t^1|B|n)){bs[c[(c[e>>2]|0)+8>>2]&511](e,d)}if(!(t|A|n)){bs[c[(c[e>>2]|0)+12>>2]&511](e,d)}if(r|B|n){i=f;return}bO[c[(c[e>>2]|0)+16>>2]&127](e,d,l);i=f;return}function ej(a){a=a|0;vl(a);return}function ek(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,k=0.0;e=dg(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;c[f>>2]=19280;c[e+4>>2]=4;c[e+48>>2]=a;c[e+52>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;vr(e+8|0,0,40);g[e+136>>2]=+Q(+(+g[a+16>>2]*+g[d+16>>2]));j=+g[a+20>>2];k=+g[d+20>>2];g[e+140>>2]=j>k?j:k;c[f>>2]=2e4;if((c[(c[a+12>>2]|0)+4>>2]|0)!=0){bd(9808,44,17872,12152);return 0}if((c[(c[d+12>>2]|0)+4>>2]|0)==0){h=e;i=h|0;return i|0}else{bd(9808,45,17872,9416);return 0}return 0}function el(b,d){b=b|0;d=d|0;var e=0,f=0;br[c[(c[b>>2]|0)+4>>2]&511](b);e=a[22184]|0;if((e&255)<14){f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else{bd(5352,173,17448,6544)}}function em(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0;if((a[21832]&1)<<24>>24==0){c[5460]=62;c[5461]=140;a[21848]=1;c[5484]=54;c[5485]=386;a[21944]=1;c[5466]=54;c[5467]=386;a[21872]=0;c[5490]=70;c[5491]=296;a[21968]=1;c[5472]=60;c[5473]=106;a[21896]=1;c[5463]=60;c[5464]=106;a[21860]=0;c[5478]=64;c[5479]=228;a[21920]=1;c[5487]=64;c[5488]=228;a[21956]=0;c[5496]=52;c[5497]=278;a[21992]=1;c[5469]=52;c[5470]=278;a[21884]=0;c[5502]=72;c[5503]=160;a[22016]=1;c[5493]=72;c[5494]=160;a[21980]=0;a[21832]=1}h=c[(c[b+12>>2]|0)+4>>2]|0;i=c[(c[e+12>>2]|0)+4>>2]|0;if(h>>>0>=4){bd(9712,80,15104,12104);return 0}if(i>>>0>=4){bd(9712,81,15104,9496);return 0}j=c[21840+(h*48&-1)+(i*12&-1)>>2]|0;if((j|0)==0){k=0;return k|0}if((a[21840+(h*48&-1)+(i*12&-1)+8|0]&1)<<24>>24==0){k=bL[j&127](e,f,b,d,g)|0;return k|0}else{k=bL[j&127](b,d,e,f,g)|0;return k|0}return 0}function en(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0;if((a[21832]&1)<<24>>24==0){bd(9712,103,15040,7184)}f=d+48|0;do{if((c[d+124>>2]|0)>0){h=c[(c[f>>2]|0)+8>>2]|0;i=h+4|0;j=b[i>>1]|0;if((j&2)<<16>>16==0){b[i>>1]=j|2;g[h+144>>2]=0.0}h=d+52|0;j=c[(c[h>>2]|0)+8>>2]|0;i=j+4|0;k=b[i>>1]|0;if((k&2)<<16>>16!=0){l=h;break}b[i>>1]=k|2;g[j+144>>2]=0.0;l=h}else{l=d+52|0}}while(0);h=c[(c[(c[f>>2]|0)+12>>2]|0)+4>>2]|0;f=c[(c[(c[l>>2]|0)+12>>2]|0)+4>>2]|0;if((h|0)>-1&(f|0)<4){bs[c[21840+(h*48&-1)+(f*12&-1)+4>>2]&511](d,e);return}else{bd(9712,114,15040,6160)}}function eo(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0,v=0,w=0,x=0,y=0,z=0;e=b;f=d;c[e>>2]=c[f>>2]|0;c[e+4>>2]=c[f+4>>2]|0;c[e+8>>2]=c[f+8>>2]|0;c[e+12>>2]=c[f+12>>2]|0;c[e+16>>2]=c[f+16>>2]|0;c[e+20>>2]=c[f+20>>2]|0;f=c[d+40>>2]|0;e=b+32|0;c[e>>2]=f;h=c[d+28>>2]|0;i=b+48|0;c[i>>2]=h;j=h*88&-1;h=f+102796|0;k=c[h>>2]|0;if((k|0)>=32){bd(4840,38,17040,6448)}l=f+102412+(k*12&-1)|0;c[f+102412+(k*12&-1)+4>>2]=j;m=f+102400|0;n=c[m>>2]|0;if((n+j|0)>102400){c[l>>2]=vi(j)|0;a[f+102412+(k*12&-1)+8|0]=1}else{c[l>>2]=f+n|0;a[f+102412+(k*12&-1)+8|0]=0;c[m>>2]=(c[m>>2]|0)+j|0}m=f+102404|0;k=(c[m>>2]|0)+j|0;c[m>>2]=k;m=f+102408|0;f=c[m>>2]|0;c[m>>2]=(f|0)>(k|0)?f:k;c[h>>2]=(c[h>>2]|0)+1|0;h=b+36|0;c[h>>2]=c[l>>2]|0;l=c[e>>2]|0;e=(c[i>>2]|0)*152&-1;k=l+102796|0;f=c[k>>2]|0;if((f|0)>=32){bd(4840,38,17040,6448)}m=l+102412+(f*12&-1)|0;c[l+102412+(f*12&-1)+4>>2]=e;j=l+102400|0;n=c[j>>2]|0;if((n+e|0)>102400){c[m>>2]=vi(e)|0;a[l+102412+(f*12&-1)+8|0]=1}else{c[m>>2]=l+n|0;a[l+102412+(f*12&-1)+8|0]=0;c[j>>2]=(c[j>>2]|0)+e|0}j=l+102404|0;f=(c[j>>2]|0)+e|0;c[j>>2]=f;j=l+102408|0;l=c[j>>2]|0;c[j>>2]=(l|0)>(f|0)?l:f;c[k>>2]=(c[k>>2]|0)+1|0;k=b+40|0;c[k>>2]=c[m>>2]|0;c[b+24>>2]=c[d+32>>2]|0;c[b+28>>2]=c[d+36>>2]|0;m=c[d+24>>2]|0;d=b+44|0;c[d>>2]=m;if((c[i>>2]|0)<=0){return}f=b+20|0;l=b+8|0;b=0;j=m;while(1){m=c[j+(b<<2)>>2]|0;e=c[m+48>>2]|0;n=c[m+52>>2]|0;o=c[e+8>>2]|0;p=c[n+8>>2]|0;q=c[m+124>>2]|0;if((q|0)<=0){r=2378;break}s=+g[(c[n+12>>2]|0)+8>>2];t=+g[(c[e+12>>2]|0)+8>>2];e=c[k>>2]|0;g[e+(b*152&-1)+136>>2]=+g[m+136>>2];g[e+(b*152&-1)+140>>2]=+g[m+140>>2];n=o+8|0;c[e+(b*152&-1)+112>>2]=c[n>>2]|0;u=p+8|0;c[e+(b*152&-1)+116>>2]=c[u>>2]|0;v=o+120|0;g[e+(b*152&-1)+120>>2]=+g[v>>2];w=p+120|0;g[e+(b*152&-1)+124>>2]=+g[w>>2];x=o+128|0;g[e+(b*152&-1)+128>>2]=+g[x>>2];y=p+128|0;g[e+(b*152&-1)+132>>2]=+g[y>>2];c[e+(b*152&-1)+148>>2]=b;c[e+(b*152&-1)+144>>2]=q;vr(e+(b*152&-1)+80|0,0,32);z=c[h>>2]|0;c[z+(b*88&-1)+32>>2]=c[n>>2]|0;c[z+(b*88&-1)+36>>2]=c[u>>2]|0;g[z+(b*88&-1)+40>>2]=+g[v>>2];g[z+(b*88&-1)+44>>2]=+g[w>>2];w=o+28|0;o=z+(b*88&-1)+48|0;v=c[w+4>>2]|0;c[o>>2]=c[w>>2]|0;c[o+4>>2]=v;v=p+28|0;p=z+(b*88&-1)+56|0;o=c[v+4>>2]|0;c[p>>2]=c[v>>2]|0;c[p+4>>2]=o;g[z+(b*88&-1)+64>>2]=+g[x>>2];g[z+(b*88&-1)+68>>2]=+g[y>>2];y=m+104|0;x=z+(b*88&-1)+16|0;o=c[y+4>>2]|0;c[x>>2]=c[y>>2]|0;c[x+4>>2]=o;o=m+112|0;x=z+(b*88&-1)+24|0;y=c[o+4>>2]|0;c[x>>2]=c[o>>2]|0;c[x+4>>2]=y;c[z+(b*88&-1)+84>>2]=q;g[z+(b*88&-1)+76>>2]=t;g[z+(b*88&-1)+80>>2]=s;c[z+(b*88&-1)+72>>2]=c[m+120>>2]|0;y=0;while(1){if((a[f]&1)<<24>>24==0){g[e+(b*152&-1)+(y*36&-1)+16>>2]=0.0;g[e+(b*152&-1)+(y*36&-1)+20>>2]=0.0}else{g[e+(b*152&-1)+(y*36&-1)+16>>2]=+g[l>>2]*+g[m+64+(y*20&-1)+8>>2];g[e+(b*152&-1)+(y*36&-1)+20>>2]=+g[l>>2]*+g[m+64+(y*20&-1)+12>>2]}g[e+(b*152&-1)+(y*36&-1)+24>>2]=0.0;g[e+(b*152&-1)+(y*36&-1)+28>>2]=0.0;g[e+(b*152&-1)+(y*36&-1)+32>>2]=0.0;x=m+64+(y*20&-1)|0;o=z+(b*88&-1)+(y<<3)|0;vr(e+(b*152&-1)+(y*36&-1)|0,0,16);p=c[x+4>>2]|0;c[o>>2]=c[x>>2]|0;c[o+4>>2]=p;p=y+1|0;if((p|0)<(q|0)){y=p}else{break}}y=b+1|0;if((y|0)>=(c[i>>2]|0)){r=2387;break}b=y;j=c[d>>2]|0}if((r|0)==2378){bd(9232,71,17704,12024)}else if((r|0)==2387){return}}function ep(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0;b=a+48|0;if((c[b>>2]|0)<=0){return}d=a+40|0;e=a+28|0;a=0;while(1){f=c[d>>2]|0;h=c[f+(a*152&-1)+112>>2]|0;i=c[f+(a*152&-1)+116>>2]|0;j=+g[f+(a*152&-1)+120>>2];l=+g[f+(a*152&-1)+128>>2];m=+g[f+(a*152&-1)+124>>2];n=+g[f+(a*152&-1)+132>>2];o=c[f+(a*152&-1)+144>>2]|0;p=c[e>>2]|0;q=p+(h*12&-1)|0;r=c[q+4>>2]|0;s=(c[k>>2]=c[q>>2]|0,+g[k>>2]);t=(c[k>>2]=r,+g[k>>2]);u=+g[p+(h*12&-1)+8>>2];r=p+(i*12&-1)|0;v=c[r+4>>2]|0;w=(c[k>>2]=c[r>>2]|0,+g[k>>2]);x=(c[k>>2]=v,+g[k>>2]);y=+g[p+(i*12&-1)+8>>2];p=f+(a*152&-1)+72|0;v=c[p+4>>2]|0;z=(c[k>>2]=c[p>>2]|0,+g[k>>2]);A=(c[k>>2]=v,+g[k>>2]);B=z*-1.0;L3089:do{if((o|0)>0){C=t;D=s;E=x;F=w;G=u;H=y;v=0;while(1){I=+g[f+(a*152&-1)+(v*36&-1)+16>>2];J=+g[f+(a*152&-1)+(v*36&-1)+20>>2];K=z*I+A*J;L=A*I+B*J;J=G-l*(+g[f+(a*152&-1)+(v*36&-1)>>2]*L- +g[f+(a*152&-1)+(v*36&-1)+4>>2]*K);I=D-j*K;M=C-j*L;N=H+n*(L*+g[f+(a*152&-1)+(v*36&-1)+8>>2]-K*+g[f+(a*152&-1)+(v*36&-1)+12>>2]);O=F+m*K;K=E+m*L;p=v+1|0;if((p|0)<(o|0)){C=M;D=I;E=K;F=O;G=J;H=N;v=p}else{P=M;Q=I;R=K;S=O;T=J;U=N;break L3089}}}else{P=t;Q=s;R=x;S=w;T=u;U=y}}while(0);o=(g[k>>2]=Q,c[k>>2]|0);f=(g[k>>2]=P,c[k>>2]|0)|0;c[q>>2]=0|o;c[q+4>>2]=f;g[(c[e>>2]|0)+(h*12&-1)+8>>2]=T;f=(c[e>>2]|0)+(i*12&-1)|0;o=(g[k>>2]=S,c[k>>2]|0);v=(g[k>>2]=R,c[k>>2]|0)|0;c[f>>2]=0|o;c[f+4>>2]=v;g[(c[e>>2]|0)+(i*12&-1)+8>>2]=U;v=a+1|0;if((v|0)<(c[b>>2]|0)){a=v}else{break}}return}
function eq(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0.0,D=0.0,E=0.0,F=0.0,G=0,H=0,I=0.0,J=0.0,K=0.0,L=0.0,M=0,N=0.0,O=0.0,P=0.0,Q=0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0,ah=0,ai=0.0,aj=0.0,ak=0.0;b=i;i=i+16|0;d=b|0;e=d|0;f=d;h=i;i=i+16|0;j=h|0;l=h;m=i;i=i+24|0;n=m|0;o=m;p=a+48|0;if((c[p>>2]|0)<=0){i=b;return}q=a+40|0;r=a+36|0;s=a+44|0;t=a+24|0;u=a+28|0;a=d+8|0;d=a;v=a+4|0;a=h+8|0;h=a;w=a+4|0;a=m+8|0;m=0;while(1){x=c[q>>2]|0;y=c[r>>2]|0;z=c[(c[s>>2]|0)+(c[x+(m*152&-1)+148>>2]<<2)>>2]|0;A=c[x+(m*152&-1)+112>>2]|0;B=c[x+(m*152&-1)+116>>2]|0;C=+g[x+(m*152&-1)+120>>2];D=+g[x+(m*152&-1)+124>>2];E=+g[x+(m*152&-1)+128>>2];F=+g[x+(m*152&-1)+132>>2];G=y+(m*88&-1)+48|0;H=c[G+4>>2]|0;I=(c[k>>2]=c[G>>2]|0,+g[k>>2]);J=(c[k>>2]=H,+g[k>>2]);H=y+(m*88&-1)+56|0;G=c[H+4>>2]|0;K=(c[k>>2]=c[H>>2]|0,+g[k>>2]);L=(c[k>>2]=G,+g[k>>2]);G=c[t>>2]|0;H=G+(A*12&-1)|0;M=c[H+4>>2]|0;N=(c[k>>2]=c[H>>2]|0,+g[k>>2]);O=(c[k>>2]=M,+g[k>>2]);P=+g[G+(A*12&-1)+8>>2];M=c[u>>2]|0;H=M+(A*12&-1)|0;Q=c[H+4>>2]|0;R=(c[k>>2]=c[H>>2]|0,+g[k>>2]);U=(c[k>>2]=Q,+g[k>>2]);V=+g[M+(A*12&-1)+8>>2];A=G+(B*12&-1)|0;Q=c[A+4>>2]|0;W=(c[k>>2]=c[A>>2]|0,+g[k>>2]);X=(c[k>>2]=Q,+g[k>>2]);Y=+g[G+(B*12&-1)+8>>2];G=M+(B*12&-1)|0;Q=c[G+4>>2]|0;Z=(c[k>>2]=c[G>>2]|0,+g[k>>2]);_=(c[k>>2]=Q,+g[k>>2]);$=+g[M+(B*12&-1)+8>>2];if((c[z+124>>2]|0)<=0){aa=2400;break}ab=+g[y+(m*88&-1)+80>>2];ac=+g[y+(m*88&-1)+76>>2];ad=+T(+P);g[d>>2]=ad;ae=+S(+P);g[v>>2]=ae;P=+T(+Y);g[h>>2]=P;af=+S(+Y);g[w>>2]=af;y=(g[k>>2]=N-(I*ae-J*ad),c[k>>2]|0);B=(g[k>>2]=O-(J*ae+I*ad),c[k>>2]|0)|0;c[e>>2]=0|y;c[e+4>>2]=B;B=(g[k>>2]=W-(K*af-L*P),c[k>>2]|0);y=(g[k>>2]=X-(L*af+K*P),c[k>>2]|0)|0;c[j>>2]=0|B;c[j+4>>2]=y;ce(o,z+64|0,f,ac,l,ab);z=x+(m*152&-1)+72|0;y=z;B=c[n+4>>2]|0;c[y>>2]=c[n>>2]|0;c[y+4>>2]=B;B=x+(m*152&-1)+144|0;y=c[B>>2]|0;do{if((y|0)>0){M=x+(m*152&-1)+76|0;Q=z|0;ab=C+D;ac=-0.0-$;P=-0.0-V;G=x+(m*152&-1)+140|0;A=0;while(1){K=+g[a+(A<<3)>>2];af=K-N;L=+g[a+(A<<3)+4>>2];H=x+(m*152&-1)+(A*36&-1)|0;ag=(g[k>>2]=af,c[k>>2]|0);ah=(g[k>>2]=L-O,c[k>>2]|0)|0;c[H>>2]=0|ag;c[H+4>>2]=ah;ad=K-W;ah=x+(m*152&-1)+(A*36&-1)+8|0;H=(g[k>>2]=ad,c[k>>2]|0);ag=(g[k>>2]=L-X,c[k>>2]|0)|0;c[ah>>2]=0|H;c[ah+4>>2]=ag;L=+g[M>>2];K=+g[x+(m*152&-1)+(A*36&-1)+4>>2];I=+g[Q>>2];ae=af*L-K*I;J=+g[x+(m*152&-1)+(A*36&-1)+12>>2];Y=L*ad-I*J;I=ab+ae*E*ae+Y*F*Y;if(I>0.0){ai=1.0/I}else{ai=0.0}g[x+(m*152&-1)+(A*36&-1)+24>>2]=ai;I=+g[M>>2];Y=+g[Q>>2]*-1.0;ae=af*Y-I*K;L=Y*ad-I*J;I=ab+ae*E*ae+L*F*L;if(I>0.0){aj=1.0/I}else{aj=0.0}g[x+(m*152&-1)+(A*36&-1)+28>>2]=aj;ag=x+(m*152&-1)+(A*36&-1)+32|0;g[ag>>2]=0.0;I=+g[Q>>2]*(Z+J*ac-R-K*P)+ +g[M>>2]*(_+$*ad-U-V*af);if(I<-1.0){g[ag>>2]=I*(-0.0- +g[G>>2])}ag=A+1|0;if((ag|0)<(y|0)){A=ag}else{break}}if((c[B>>2]|0)!=2){break}P=+g[x+(m*152&-1)+76>>2];ac=+g[z>>2];ab=+g[x+(m*152&-1)>>2]*P- +g[x+(m*152&-1)+4>>2]*ac;I=P*+g[x+(m*152&-1)+8>>2]-ac*+g[x+(m*152&-1)+12>>2];af=P*+g[x+(m*152&-1)+36>>2]-ac*+g[x+(m*152&-1)+40>>2];ad=P*+g[x+(m*152&-1)+44>>2]-ac*+g[x+(m*152&-1)+48>>2];ac=C+D;P=E*ab;K=F*I;J=ac+ab*P+I*K;I=ac+af*E*af+ad*F*ad;ab=ac+P*af+K*ad;ad=J*I-ab*ab;if(J*J>=ad*1.0e3){c[B>>2]=1;break}g[x+(m*152&-1)+96>>2]=J;g[x+(m*152&-1)+100>>2]=ab;g[x+(m*152&-1)+104>>2]=ab;g[x+(m*152&-1)+108>>2]=I;if(ad!=0.0){ak=1.0/ad}else{ak=ad}ad=ab*(-0.0-ak);g[x+(m*152&-1)+80>>2]=I*ak;g[x+(m*152&-1)+84>>2]=ad;g[x+(m*152&-1)+88>>2]=ad;g[x+(m*152&-1)+92>>2]=J*ak}}while(0);x=m+1|0;if((x|0)<(c[p>>2]|0)){m=x}else{aa=2418;break}}if((aa|0)==2400){bd(9232,168,17760,9464)}else if((aa|0)==2418){i=b;return}}function er(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0.0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0,C=0,D=0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0.0,ao=0.0,ap=0.0,aq=0.0,ar=0.0,as=0.0,at=0.0,au=0.0,av=0.0,aw=0.0,ax=0.0,ay=0.0,az=0.0,aA=0.0,aB=0;b=i;i=i+16|0;d=b|0;e=d|0;f=d;h=i;i=i+16|0;j=h|0;l=h;m=i;i=i+20|0;i=i+7>>3<<3;n=a+48|0;if((c[n>>2]|0)<=0){o=0.0;p=o>=-.014999999664723873;i=b;return p|0}q=a+36|0;r=a+24|0;a=d+8|0;d=a;s=a+4|0;a=h+8|0;h=a;t=a+4|0;a=m;u=m+8|0;v=m+16|0;w=0;x=0.0;while(1){y=c[q>>2]|0;z=y+(w*88&-1)|0;A=c[y+(w*88&-1)+32>>2]|0;B=c[y+(w*88&-1)+36>>2]|0;C=y+(w*88&-1)+48|0;D=c[C+4>>2]|0;E=(c[k>>2]=c[C>>2]|0,+g[k>>2]);F=(c[k>>2]=D,+g[k>>2]);G=+g[y+(w*88&-1)+40>>2];H=+g[y+(w*88&-1)+64>>2];D=y+(w*88&-1)+56|0;C=c[D+4>>2]|0;I=(c[k>>2]=c[D>>2]|0,+g[k>>2]);J=(c[k>>2]=C,+g[k>>2]);K=+g[y+(w*88&-1)+44>>2];L=+g[y+(w*88&-1)+68>>2];C=c[y+(w*88&-1)+84>>2]|0;y=c[r>>2]|0;D=y+(A*12&-1)|0;M=c[D+4>>2]|0;N=(c[k>>2]=c[D>>2]|0,+g[k>>2]);O=(c[k>>2]=M,+g[k>>2]);P=+g[y+(A*12&-1)+8>>2];M=y+(B*12&-1)|0;D=c[M+4>>2]|0;Q=(c[k>>2]=c[M>>2]|0,+g[k>>2]);R=(c[k>>2]=D,+g[k>>2]);U=+g[y+(B*12&-1)+8>>2];if((C|0)>0){V=G+K;W=O;X=N;Y=R;Z=Q;D=0;_=U;$=P;aa=x;while(1){ab=+T(+$);g[d>>2]=ab;ac=+S(+$);g[s>>2]=ac;ad=+T(+_);g[h>>2]=ad;ae=+S(+_);g[t>>2]=ae;M=(g[k>>2]=X-(E*ac-F*ab),c[k>>2]|0);af=(g[k>>2]=W-(F*ac+E*ab),c[k>>2]|0)|0;c[e>>2]=0|M;c[e+4>>2]=af;af=(g[k>>2]=Z-(I*ae-J*ad),c[k>>2]|0);M=(g[k>>2]=Y-(J*ae+I*ad),c[k>>2]|0)|0;c[j>>2]=0|af;c[j+4>>2]=M;eD(m,z,f,l,D);M=c[a+4>>2]|0;ad=(c[k>>2]=c[a>>2]|0,+g[k>>2]);ae=(c[k>>2]=M,+g[k>>2]);M=c[u+4>>2]|0;ab=(c[k>>2]=c[u>>2]|0,+g[k>>2]);ac=(c[k>>2]=M,+g[k>>2]);ag=+g[v>>2];ah=ab-X;ai=ac-W;aj=ab-Z;ab=ac-Y;ak=aa<ag?aa:ag;ac=(ag+.004999999888241291)*.20000000298023224;ag=ac<0.0?ac:0.0;ac=ae*ah-ad*ai;al=ae*aj-ad*ab;am=al*L*al+(V+ac*H*ac);if(am>0.0){an=(-0.0-(ag<-.20000000298023224?-.20000000298023224:ag))/am}else{an=0.0}am=ad*an;ad=ae*an;ao=X-G*am;ap=W-G*ad;aq=$-H*(ah*ad-ai*am);ar=Z+K*am;as=Y+K*ad;at=_+L*(aj*ad-ab*am);M=D+1|0;if((M|0)<(C|0)){W=ap;X=ao;Y=as;Z=ar;D=M;_=at;$=aq;aa=ak}else{break}}au=ap;av=ao;aw=as;ax=ar;ay=at;az=aq;aA=ak;aB=c[r>>2]|0}else{au=O;av=N;aw=R;ax=Q;ay=U;az=P;aA=x;aB=y}D=aB+(A*12&-1)|0;C=(g[k>>2]=av,c[k>>2]|0);z=(g[k>>2]=au,c[k>>2]|0)|0;c[D>>2]=0|C;c[D+4>>2]=z;g[(c[r>>2]|0)+(A*12&-1)+8>>2]=az;z=(c[r>>2]|0)+(B*12&-1)|0;D=(g[k>>2]=ax,c[k>>2]|0);C=(g[k>>2]=aw,c[k>>2]|0)|0;c[z>>2]=0|D;c[z+4>>2]=C;g[(c[r>>2]|0)+(B*12&-1)+8>>2]=ay;C=w+1|0;if((C|0)<(c[n>>2]|0)){w=C;x=aA}else{o=aA;break}}p=o>=-.014999999664723873;i=b;return p|0}function es(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0,q=0,r=0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0,J=0.0,K=0.0,L=0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0;b=a+48|0;if((c[b>>2]|0)<=0){return}d=a+40|0;e=a+28|0;a=0;L3146:while(1){f=c[d>>2]|0;h=f+(a*152&-1)|0;i=c[f+(a*152&-1)+112>>2]|0;j=c[f+(a*152&-1)+116>>2]|0;l=+g[f+(a*152&-1)+120>>2];m=+g[f+(a*152&-1)+128>>2];n=+g[f+(a*152&-1)+124>>2];o=+g[f+(a*152&-1)+132>>2];p=f+(a*152&-1)+144|0;q=c[p>>2]|0;r=c[e>>2]|0;s=r+(i*12&-1)|0;t=c[s+4>>2]|0;u=(c[k>>2]=c[s>>2]|0,+g[k>>2]);v=(c[k>>2]=t,+g[k>>2]);w=+g[r+(i*12&-1)+8>>2];t=r+(j*12&-1)|0;s=c[t+4>>2]|0;x=(c[k>>2]=c[t>>2]|0,+g[k>>2]);y=(c[k>>2]=s,+g[k>>2]);z=+g[r+(j*12&-1)+8>>2];r=f+(a*152&-1)+72|0;s=c[r+4>>2]|0;A=(c[k>>2]=c[r>>2]|0,+g[k>>2]);B=(c[k>>2]=s,+g[k>>2]);C=A*-1.0;D=+g[f+(a*152&-1)+136>>2];if((q-1|0)>>>0<2){E=v;F=u;G=y;H=x;I=0;J=z;K=w}else{L=2435;break}while(1){w=+g[f+(a*152&-1)+(I*36&-1)+12>>2];z=+g[f+(a*152&-1)+(I*36&-1)+8>>2];x=+g[f+(a*152&-1)+(I*36&-1)+4>>2];y=+g[f+(a*152&-1)+(I*36&-1)>>2];u=D*+g[f+(a*152&-1)+(I*36&-1)+16>>2];s=f+(a*152&-1)+(I*36&-1)+20|0;v=+g[s>>2];M=v+ +g[f+(a*152&-1)+(I*36&-1)+28>>2]*(-0.0-(B*(H+w*(-0.0-J)-F-x*(-0.0-K))+C*(G+J*z-E-K*y)));N=-0.0-u;O=M<u?M:u;u=O<N?N:O;O=u-v;g[s>>2]=u;u=B*O;v=C*O;P=F-l*u;Q=E-l*v;R=K-m*(y*v-x*u);S=H+n*u;T=G+n*v;U=J+o*(z*v-w*u);s=I+1|0;if((s|0)<(q|0)){E=Q;F=P;G=T;H=S;I=s;J=U;K=R}else{break}}L3151:do{if((c[p>>2]|0)==1){C=+g[f+(a*152&-1)+12>>2];D=+g[f+(a*152&-1)+8>>2];u=+g[f+(a*152&-1)+4>>2];w=+g[h>>2];q=f+(a*152&-1)+16|0;v=+g[q>>2];z=v+(A*(S+C*(-0.0-U)-P-u*(-0.0-R))+B*(T+U*D-Q-R*w)- +g[f+(a*152&-1)+32>>2])*(-0.0- +g[f+(a*152&-1)+24>>2]);x=z>0.0?z:0.0;z=x-v;g[q>>2]=x;x=A*z;v=B*z;V=R-m*(w*v-u*x);W=U+o*(D*v-C*x);X=S+n*x;Y=T+n*v;Z=P-l*x;_=Q-l*v}else{q=f+(a*152&-1)+16|0;v=+g[q>>2];s=f+(a*152&-1)+52|0;x=+g[s>>2];if(v<0.0|x<0.0){L=2440;break L3146}C=-0.0-U;D=+g[f+(a*152&-1)+12>>2];u=+g[f+(a*152&-1)+8>>2];w=-0.0-R;z=+g[f+(a*152&-1)+4>>2];y=+g[h>>2];O=+g[f+(a*152&-1)+48>>2];N=+g[f+(a*152&-1)+44>>2];M=+g[f+(a*152&-1)+40>>2];$=+g[f+(a*152&-1)+36>>2];aa=+g[f+(a*152&-1)+104>>2];ab=+g[f+(a*152&-1)+100>>2];ac=A*(S+D*C-P-z*w)+B*(T+U*u-Q-R*y)- +g[f+(a*152&-1)+32>>2]-(v*+g[f+(a*152&-1)+96>>2]+x*aa);ad=A*(S+O*C-P-M*w)+B*(T+U*N-Q-R*$)- +g[f+(a*152&-1)+68>>2]-(v*ab+x*+g[f+(a*152&-1)+108>>2]);w=+g[f+(a*152&-1)+80>>2]*ac+ +g[f+(a*152&-1)+88>>2]*ad;C=ac*+g[f+(a*152&-1)+84>>2]+ad*+g[f+(a*152&-1)+92>>2];ae=-0.0-w;af=-0.0-C;if(!(w>-0.0|C>-0.0)){C=ae-v;w=af-x;ag=A*C;ah=B*C;C=A*w;ai=B*w;w=ag+C;aj=ah+ai;g[q>>2]=ae;g[s>>2]=af;V=R-m*(y*ah-z*ag+($*ai-M*C));W=U+o*(u*ah-D*ag+(N*ai-O*C));X=S+n*w;Y=T+n*aj;Z=P-l*w;_=Q-l*aj;break}aj=ac*(-0.0- +g[f+(a*152&-1)+24>>2]);do{if(aj>=0.0){if(ad+aj*ab<0.0){break}w=aj-v;C=0.0-x;ai=A*w;ag=B*w;w=A*C;ah=B*C;C=w+ai;af=ah+ag;g[q>>2]=aj;g[s>>2]=0.0;V=R-m*(ag*y-ai*z+(ah*$-w*M));W=U+o*(ag*u-ai*D+(ah*N-w*O));X=S+n*C;Y=T+n*af;Z=P-l*C;_=Q-l*af;break L3151}}while(0);aj=ad*(-0.0- +g[f+(a*152&-1)+60>>2]);do{if(aj>=0.0){if(ac+aj*aa<0.0){break}ab=0.0-v;af=aj-x;C=A*ab;w=B*ab;ab=A*af;ah=B*af;af=C+ab;ai=w+ah;g[q>>2]=0.0;g[s>>2]=aj;V=R-m*(w*y-C*z+(ah*$-ab*M));W=U+o*(w*u-C*D+(ah*N-ab*O));X=S+n*af;Y=T+n*ai;Z=P-l*af;_=Q-l*ai;break L3151}}while(0);if(ac<0.0|ad<0.0){V=R;W=U;X=S;Y=T;Z=P;_=Q;break}aj=0.0-v;aa=0.0-x;ai=A*aj;af=B*aj;aj=A*aa;ab=B*aa;aa=ai+aj;ah=af+ab;g[q>>2]=0.0;g[s>>2]=0.0;V=R-m*(af*y-ai*z+(ab*$-aj*M));W=U+o*(af*u-ai*D+(ab*N-aj*O));X=S+n*aa;Y=T+n*ah;Z=P-l*aa;_=Q-l*ah}}while(0);f=(c[e>>2]|0)+(i*12&-1)|0;h=(g[k>>2]=Z,c[k>>2]|0);p=(g[k>>2]=_,c[k>>2]|0)|0;c[f>>2]=0|h;c[f+4>>2]=p;g[(c[e>>2]|0)+(i*12&-1)+8>>2]=V;p=(c[e>>2]|0)+(j*12&-1)|0;f=(g[k>>2]=X,c[k>>2]|0);h=(g[k>>2]=Y,c[k>>2]|0)|0;c[p>>2]=0|f;c[p+4>>2]=h;g[(c[e>>2]|0)+(j*12&-1)+8>>2]=W;h=a+1|0;if((h|0)<(c[b>>2]|0)){a=h}else{L=2453;break}}if((L|0)==2435){bd(9232,311,17816,7144)}else if((L|0)==2440){bd(9232,406,17816,6128)}else if((L|0)==2453){return}}function et(a){a=a|0;return}function eu(a){a=a|0;return}function ev(a){a=a|0;return}function ew(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0.0,A=0,B=0,C=0,D=0,E=0,F=0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0,P=0.0,Q=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0.0,ao=0.0,ap=0.0,aq=0.0,ar=0.0,as=0.0,at=0.0,au=0.0,av=0.0,aw=0.0,ax=0.0,ay=0.0,az=0.0,aA=0.0,aB=0.0,aC=0.0,aD=0;e=i;i=i+16|0;f=e|0;h=f|0;j=f;l=i;i=i+16|0;m=l|0;n=l;o=i;i=i+20|0;i=i+7>>3<<3;p=a+48|0;if((c[p>>2]|0)<=0){q=0.0;r=q>=-.007499999832361937;i=e;return r|0}s=a+36|0;t=a+24|0;a=f+8|0;f=a;u=a+4|0;a=l+8|0;l=a;v=a+4|0;a=o;w=o+8|0;x=o+16|0;y=0;z=0.0;while(1){A=c[s>>2]|0;B=A+(y*88&-1)|0;C=c[A+(y*88&-1)+32>>2]|0;D=c[A+(y*88&-1)+36>>2]|0;E=A+(y*88&-1)+48|0;F=c[E+4>>2]|0;G=(c[k>>2]=c[E>>2]|0,+g[k>>2]);H=(c[k>>2]=F,+g[k>>2]);F=A+(y*88&-1)+56|0;E=c[F+4>>2]|0;I=(c[k>>2]=c[F>>2]|0,+g[k>>2]);J=(c[k>>2]=E,+g[k>>2]);E=c[A+(y*88&-1)+84>>2]|0;if((C|0)==(b|0)|(C|0)==(d|0)){K=+g[A+(y*88&-1)+40>>2];L=+g[A+(y*88&-1)+64>>2]}else{K=0.0;L=0.0}M=+g[A+(y*88&-1)+44>>2];N=+g[A+(y*88&-1)+68>>2];A=c[t>>2]|0;F=A+(C*12&-1)|0;O=c[F+4>>2]|0;P=(c[k>>2]=c[F>>2]|0,+g[k>>2]);Q=(c[k>>2]=O,+g[k>>2]);R=+g[A+(C*12&-1)+8>>2];O=A+(D*12&-1)|0;F=c[O+4>>2]|0;U=(c[k>>2]=c[O>>2]|0,+g[k>>2]);V=(c[k>>2]=F,+g[k>>2]);W=+g[A+(D*12&-1)+8>>2];if((E|0)>0){X=K+M;Y=Q;Z=P;_=V;$=U;aa=R;ab=W;F=0;ac=z;while(1){ad=+T(+aa);g[f>>2]=ad;ae=+S(+aa);g[u>>2]=ae;af=+T(+ab);g[l>>2]=af;ag=+S(+ab);g[v>>2]=ag;O=(g[k>>2]=Z-(G*ae-H*ad),c[k>>2]|0);ah=(g[k>>2]=Y-(H*ae+G*ad),c[k>>2]|0)|0;c[h>>2]=0|O;c[h+4>>2]=ah;ah=(g[k>>2]=$-(I*ag-J*af),c[k>>2]|0);O=(g[k>>2]=_-(J*ag+I*af),c[k>>2]|0)|0;c[m>>2]=0|ah;c[m+4>>2]=O;eD(o,B,j,n,F);O=c[a+4>>2]|0;af=(c[k>>2]=c[a>>2]|0,+g[k>>2]);ag=(c[k>>2]=O,+g[k>>2]);O=c[w+4>>2]|0;ad=(c[k>>2]=c[w>>2]|0,+g[k>>2]);ae=(c[k>>2]=O,+g[k>>2]);ai=+g[x>>2];aj=ad-Z;ak=ae-Y;al=ad-$;ad=ae-_;am=ac<ai?ac:ai;ae=(ai+.004999999888241291)*.75;ai=ae<0.0?ae:0.0;ae=ag*aj-af*ak;an=ag*al-af*ad;ao=an*N*an+(X+ae*L*ae);if(ao>0.0){ap=(-0.0-(ai<-.20000000298023224?-.20000000298023224:ai))/ao}else{ap=0.0}ao=af*ap;af=ag*ap;aq=Z-K*ao;ar=Y-K*af;as=aa-L*(aj*af-ak*ao);at=$+M*ao;au=_+M*af;av=ab+N*(al*af-ad*ao);O=F+1|0;if((O|0)<(E|0)){Y=ar;Z=aq;_=au;$=at;aa=as;ab=av;F=O;ac=am}else{break}}aw=ar;ax=aq;ay=au;az=at;aA=as;aB=av;aC=am;aD=c[t>>2]|0}else{aw=Q;ax=P;ay=V;az=U;aA=R;aB=W;aC=z;aD=A}F=aD+(C*12&-1)|0;E=(g[k>>2]=ax,c[k>>2]|0);B=(g[k>>2]=aw,c[k>>2]|0)|0;c[F>>2]=0|E;c[F+4>>2]=B;g[(c[t>>2]|0)+(C*12&-1)+8>>2]=aA;B=(c[t>>2]|0)+(D*12&-1)|0;F=(g[k>>2]=az,c[k>>2]|0);E=(g[k>>2]=ay,c[k>>2]|0)|0;c[B>>2]=0|F;c[B+4>>2]=E;g[(c[t>>2]|0)+(D*12&-1)+8>>2]=aB;E=y+1|0;if((E|0)<(c[p>>2]|0)){y=E;z=aC}else{q=aC;break}}r=q>=-.007499999832361937;i=e;return r|0}function ex(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;b7(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function ey(a){a=a|0;vl(a);return}function ez(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;f=i;i=i+256|0;b8(f|0,b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);i=f;return}function eA(a){a=a|0;vl(a);return}function eB(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;b6(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function eC(a){a=a|0;vl(a);return}function eD(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,l=0.0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0;if((c[b+84>>2]|0)<=0){bd(9232,617,16360,5640)}h=c[b+72>>2]|0;if((h|0)==2){i=e+12|0;j=+g[i>>2];l=+g[b+16>>2];m=e+8|0;n=+g[m>>2];o=+g[b+20>>2];p=j*l-n*o;q=l*n+j*o;r=a;s=(g[k>>2]=p,c[k>>2]|0);t=(g[k>>2]=q,c[k>>2]|0)|0;c[r>>2]=0|s;c[r+4>>2]=t;o=+g[i>>2];j=+g[b+24>>2];n=+g[m>>2];l=+g[b+28>>2];u=+g[d+12>>2];v=+g[b+(f<<3)>>2];w=+g[d+8>>2];x=+g[b+(f<<3)+4>>2];y=+g[d>>2]+(u*v-w*x);z=v*w+u*x+ +g[d+4>>2];g[a+16>>2]=p*(y-(+g[e>>2]+(o*j-n*l)))+(z-(j*n+o*l+ +g[e+4>>2]))*q- +g[b+76>>2]- +g[b+80>>2];m=a+8|0;i=(g[k>>2]=y,c[k>>2]|0);t=(g[k>>2]=z,c[k>>2]|0)|0;c[m>>2]=0|i;c[m+4>>2]=t;t=(g[k>>2]=-0.0-p,c[k>>2]|0);m=(g[k>>2]=-0.0-q,c[k>>2]|0)|0;c[r>>2]=0|t;c[r+4>>2]=m;return}else if((h|0)==1){m=d+12|0;q=+g[m>>2];p=+g[b+16>>2];r=d+8|0;z=+g[r>>2];y=+g[b+20>>2];l=q*p-z*y;o=p*z+q*y;t=a;i=(g[k>>2]=l,c[k>>2]|0);s=(g[k>>2]=o,c[k>>2]|0)|0;c[t>>2]=0|i;c[t+4>>2]=s;y=+g[m>>2];q=+g[b+24>>2];z=+g[r>>2];p=+g[b+28>>2];n=+g[e+12>>2];j=+g[b+(f<<3)>>2];x=+g[e+8>>2];u=+g[b+(f<<3)+4>>2];w=+g[e>>2]+(n*j-x*u);v=j*x+n*u+ +g[e+4>>2];g[a+16>>2]=l*(w-(+g[d>>2]+(y*q-z*p)))+(v-(q*z+y*p+ +g[d+4>>2]))*o- +g[b+76>>2]- +g[b+80>>2];f=a+8|0;r=(g[k>>2]=w,c[k>>2]|0);m=(g[k>>2]=v,c[k>>2]|0)|0;c[f>>2]=0|r;c[f+4>>2]=m;return}else if((h|0)==0){v=+g[d+12>>2];w=+g[b+24>>2];o=+g[d+8>>2];p=+g[b+28>>2];y=+g[d>>2]+(v*w-o*p);z=w*o+v*p+ +g[d+4>>2];p=+g[e+12>>2];v=+g[b>>2];o=+g[e+8>>2];w=+g[b+4>>2];q=+g[e>>2]+(p*v-o*w);l=v*o+p*w+ +g[e+4>>2];w=q-y;p=l-z;e=a;d=(g[k>>2]=w,c[k>>2]|0);h=(g[k>>2]=p,c[k>>2]|0)|0;c[e>>2]=0|d;c[e+4>>2]=h;o=+Q(+(w*w+p*p));if(o<1.1920928955078125e-7){A=w;B=p}else{v=1.0/o;o=w*v;g[a>>2]=o;u=p*v;g[a+4>>2]=u;A=o;B=u}h=a+8|0;e=(g[k>>2]=(y+q)*.5,c[k>>2]|0);d=(g[k>>2]=(z+l)*.5,c[k>>2]|0)|0;c[h>>2]=0|e;c[h+4>>2]=d;g[a+16>>2]=w*A+p*B- +g[b+76>>2]- +g[b+80>>2];return}else{return}}function eE(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,k=0.0;e=dg(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;c[f>>2]=19280;c[e+4>>2]=4;c[e+48>>2]=a;c[e+52>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;vr(e+8|0,0,40);g[e+136>>2]=+Q(+(+g[a+16>>2]*+g[d+16>>2]));j=+g[a+20>>2];k=+g[d+20>>2];g[e+140>>2]=j>k?j:k;c[f>>2]=19544;if((c[(c[a+12>>2]|0)+4>>2]|0)!=1){bd(8616,41,16760,11856);return 0}if((c[(c[d+12>>2]|0)+4>>2]|0)==0){h=e;i=h|0;return i|0}else{bd(8616,42,16760,9416);return 0}return 0}function eF(b,d){b=b|0;d=d|0;var e=0,f=0;br[c[(c[b>>2]|0)+4>>2]&511](b);e=a[22184]|0;if((e&255)<14){f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else{bd(5352,173,17448,6544)}}function eG(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,k=0.0;e=dg(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;c[f>>2]=19280;c[e+4>>2]=4;c[e+48>>2]=a;c[e+52>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;vr(e+8|0,0,40);g[e+136>>2]=+Q(+(+g[a+16>>2]*+g[d+16>>2]));j=+g[a+20>>2];k=+g[d+20>>2];g[e+140>>2]=j>k?j:k;c[f>>2]=19480;if((c[(c[a+12>>2]|0)+4>>2]|0)!=1){bd(8440,41,16584,11856);return 0}if((c[(c[d+12>>2]|0)+4>>2]|0)==2){h=e;i=h|0;return i|0}else{bd(8440,42,16584,9368);return 0}return 0}function eH(b,d){b=b|0;d=d|0;var e=0,f=0;br[c[(c[b>>2]|0)+4>>2]&511](b);e=a[22184]|0;if((e&255)<14){f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else{bd(5352,173,17448,6544)}}function eI(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,k=0.0;e=dg(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;c[f>>2]=19280;c[e+4>>2]=4;c[e+48>>2]=a;c[e+52>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;vr(e+8|0,0,40);g[e+136>>2]=+Q(+(+g[a+16>>2]*+g[d+16>>2]));j=+g[a+20>>2];k=+g[d+20>>2];g[e+140>>2]=j>k?j:k;c[f>>2]=19416;if((c[(c[a+12>>2]|0)+4>>2]|0)!=2){bd(8208,41,16280,11808);return 0}if((c[(c[d+12>>2]|0)+4>>2]|0)==0){h=e;i=h|0;return i|0}else{bd(8208,42,16280,9416);return 0}return 0}function eJ(b,d){b=b|0;d=d|0;var e=0,f=0;br[c[(c[b>>2]|0)+4>>2]&511](b);e=a[22184]|0;if((e&255)<14){f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else{bd(5352,173,17448,6544)}}function eK(a){a=a|0;return}function eL(a,b){a=a|0;b=+b;return+0.0}function eM(a){a=a|0;return}function eN(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0;d=a+108|0;e=c[d>>2]|0;f=b+28|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];i=a+112|0;h=c[i>>2]|0;n=b+(h*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(h*12&-1)+8>>2];s=+g[a+128>>2];t=+g[a+124>>2];u=+g[a+136>>2];v=+g[a+132>>2];w=+g[a+116>>2];x=+g[a+120>>2];h=a+100|0;y=+g[h>>2];z=(+g[a+76>>2]+(w*(p+u*(-0.0-r)-(j+s*(-0.0-m)))+x*(q+r*v-(l+m*t)))+ +g[a+96>>2]*y)*(-0.0- +g[a+172>>2]);g[h>>2]=y+z;y=w*z;w=x*z;z=+g[a+156>>2];x=m- +g[a+164>>2]*(w*t-y*s);s=+g[a+160>>2];t=r+ +g[a+168>>2]*(w*v-y*u);a=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=j-z*y,c[k>>2]|0);h=(g[k>>2]=l-z*w,c[k>>2]|0)|0;c[a>>2]=0|e;c[a+4>>2]=h;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=x;d=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;h=(g[k>>2]=p+y*s,c[k>>2]|0);a=(g[k>>2]=q+w*s,c[k>>2]|0)|0;c[d>>2]=0|h;c[d+4>>2]=a;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=t;return}function eO(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+80>>2];h=+g[d+20>>2];i=+g[b+84>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function eP(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+88>>2];h=+g[d+20>>2];i=+g[b+92>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function eQ(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+100>>2]*c;c=d*+g[b+120>>2];g[a>>2]=+g[b+116>>2]*d;g[a+4>>2]=c;return}function eR(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;cb(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function eS(a){a=a|0;vl(a);return}function eT(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+108|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+112|0;c[l>>2]=j;m=e+28|0;n=b+140|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+148|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+156>>2]=s;t=+g[i+120>>2];g[b+160>>2]=t;u=+g[e+128>>2];g[b+164>>2]=u;v=+g[i+128>>2];g[b+168>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;m=c[e+4>>2]|0;w=(c[k>>2]=c[e>>2]|0,+g[k>>2]);x=(c[k>>2]=m,+g[k>>2]);y=+g[i+(f*12&-1)+8>>2];m=d+28|0;e=c[m>>2]|0;n=e+(f*12&-1)|0;z=c[n+4>>2]|0;A=(c[k>>2]=c[n>>2]|0,+g[k>>2]);B=(c[k>>2]=z,+g[k>>2]);C=+g[e+(f*12&-1)+8>>2];z=i+(j*12&-1)|0;n=c[z+4>>2]|0;D=(c[k>>2]=c[z>>2]|0,+g[k>>2]);E=(c[k>>2]=n,+g[k>>2]);F=+g[i+(j*12&-1)+8>>2];i=e+(j*12&-1)|0;n=c[i+4>>2]|0;G=(c[k>>2]=c[i>>2]|0,+g[k>>2]);H=(c[k>>2]=n,+g[k>>2]);I=+g[e+(j*12&-1)+8>>2];J=+T(+y);K=+S(+y);y=+T(+F);L=+S(+F);F=+g[b+80>>2];M=F-(c[k>>2]=o,+g[k>>2]);F=+g[b+84>>2];N=F-(c[k>>2]=p,+g[k>>2]);F=K*M-J*N;O=J*M+K*N;p=b+124|0;o=(g[k>>2]=F,c[k>>2]|0);j=(g[k>>2]=O,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;N=+g[b+88>>2];K=N-(c[k>>2]=q,+g[k>>2]);N=+g[b+92>>2];M=N-(c[k>>2]=r,+g[k>>2]);N=L*K-y*M;J=y*K+L*M;r=b+132|0;q=(g[k>>2]=N,c[k>>2]|0);j=(g[k>>2]=J,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;j=b+116|0;M=D+N-w-F;w=E+J-x-O;r=j;q=(g[k>>2]=M,c[k>>2]|0);p=(g[k>>2]=w,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=p;p=j|0;x=+Q(+(M*M+w*w));if(x>.004999999888241291){E=1.0/x;D=M*E;g[p>>2]=D;P=E*w;R=D}else{g[p>>2]=0.0;P=0.0;R=0.0}g[b+120>>2]=P;D=P*F-O*R;w=P*N-R*J;E=t+(s+D*D*u)+w*w*v;if(E!=0.0){U=1.0/E}else{U=0.0}p=b+172|0;g[p>>2]=U;w=+g[b+68>>2];if(w>0.0){D=x- +g[b+104>>2];x=w*6.2831854820251465;w=x*U*x;M=+g[d>>2];L=M*(x*U*2.0*+g[b+72>>2]+w*M);j=b+96|0;g[j>>2]=L;if(L!=0.0){V=1.0/L}else{V=0.0}g[j>>2]=V;g[b+76>>2]=w*D*M*V;M=E+V;if(M!=0.0){W=1.0/M}else{W=0.0}g[p>>2]=W}else{g[b+96>>2]=0.0;g[b+76>>2]=0.0}if((a[d+20|0]&1)<<24>>24==0){g[b+100>>2]=0.0;W=C;M=I;V=G;E=H;D=A;w=B;p=c[m>>2]|0;j=p+(f*12&-1)|0;r=j;q=(g[k>>2]=D,c[k>>2]|0);o=(g[k>>2]=w,c[k>>2]|0);e=o;n=0;i=0;z=e;X=q;Y=0;Z=i|X;_=z|Y;$=r|0;c[$>>2]=Z;aa=r+4|0;c[aa>>2]=_;ab=c[h>>2]|0;ac=c[m>>2]|0;ad=ac+(ab*12&-1)+8|0;g[ad>>2]=W;ae=c[l>>2]|0;af=c[m>>2]|0;ag=af+(ae*12&-1)|0;ah=ag;ai=(g[k>>2]=V,c[k>>2]|0);aj=(g[k>>2]=E,c[k>>2]|0);ak=aj;al=0;am=0;an=ak;ao=ai;ap=0;aq=am|ao;ar=an|ap;as=ah|0;c[as>>2]=aq;at=ah+4|0;c[at>>2]=ar;au=c[l>>2]|0;av=c[m>>2]|0;aw=av+(au*12&-1)+8|0;g[aw>>2]=M;return}else{ax=b+100|0;L=+g[d+8>>2]*+g[ax>>2];g[ax>>2]=L;U=R*L;R=L*P;W=C-u*(R*F-U*O);M=I+v*(R*N-U*J);V=G+U*t;E=H+R*t;D=A-U*s;w=B-R*s;p=c[m>>2]|0;j=p+(f*12&-1)|0;r=j;q=(g[k>>2]=D,c[k>>2]|0);o=(g[k>>2]=w,c[k>>2]|0);e=o;n=0;i=0;z=e;X=q;Y=0;Z=i|X;_=z|Y;$=r|0;c[$>>2]=Z;aa=r+4|0;c[aa>>2]=_;ab=c[h>>2]|0;ac=c[m>>2]|0;ad=ac+(ab*12&-1)+8|0;g[ad>>2]=W;ae=c[l>>2]|0;af=c[m>>2]|0;ag=af+(ae*12&-1)|0;ah=ag;ai=(g[k>>2]=V,c[k>>2]|0);aj=(g[k>>2]=E,c[k>>2]|0);ak=aj;al=0;am=0;an=ak;ao=ai;ap=0;aq=am|ao;ar=an|ap;as=ah|0;c[as>>2]=aq;at=ah+4|0;c[at>>2]=ar;au=c[l>>2]|0;av=c[m>>2]|0;aw=av+(au*12&-1)+8|0;g[aw>>2]=M;return}}function eU(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0;if(+g[a+68>>2]>0.0){d=1;return d|0}e=a+108|0;f=c[e>>2]|0;h=b+24|0;b=c[h>>2]|0;i=b+(f*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[b+(f*12&-1)+8>>2];f=a+112|0;j=c[f>>2]|0;o=b+(j*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[b+(j*12&-1)+8>>2];t=+T(+n);u=+S(+n);v=+T(+s);w=+S(+s);x=+g[a+80>>2]- +g[a+140>>2];y=+g[a+84>>2]- +g[a+144>>2];z=u*x-t*y;A=t*x+u*y;y=+g[a+88>>2]- +g[a+148>>2];u=+g[a+92>>2]- +g[a+152>>2];x=w*y-v*u;t=v*y+w*u;u=q+x-l-z;w=r+t-m-A;y=+Q(+(u*u+w*w));if(y<1.1920928955078125e-7){B=0.0;C=u;D=w}else{v=1.0/y;B=y;C=u*v;D=w*v}v=B- +g[a+104>>2];B=v<.20000000298023224?v:.20000000298023224;v=B<-.20000000298023224?-.20000000298023224:B;B=v*(-0.0- +g[a+172>>2]);w=C*B;C=D*B;B=+g[a+156>>2];D=n- +g[a+164>>2]*(z*C-A*w);A=+g[a+160>>2];z=s+ +g[a+168>>2]*(x*C-t*w);a=(g[k>>2]=l-B*w,c[k>>2]|0);j=(g[k>>2]=m-B*C,c[k>>2]|0)|0;c[i>>2]=0|a;c[i+4>>2]=j;g[(c[h>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=D;e=(c[h>>2]|0)+((c[f>>2]|0)*12&-1)|0;j=(g[k>>2]=q+A*w,c[k>>2]|0);i=(g[k>>2]=r+A*C,c[k>>2]|0)|0;c[e>>2]=0|j;c[e+4>>2]=i;g[(c[h>>2]|0)+((c[f>>2]|0)*12&-1)+8>>2]=z;if(v>0.0){E=v}else{E=-0.0-v}d=E<.004999999888241291;return d|0}function eV(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;dc(7888,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(11336,(v=i,i=i+8|0,c[v>>2]=e,v)|0);dc(8808,(v=i,i=i+8|0,c[v>>2]=f,v)|0);dc(6768,(v=i,i=i+8|0,c[v>>2]=a[b+61|0]&1,v)|0);j=+g[b+84>>2];dc(5992,(v=i,i=i+16|0,h[v>>3]=+g[b+80>>2],h[v+8>>3]=j,v)|0);j=+g[b+92>>2];dc(5536,(v=i,i=i+16|0,h[v>>3]=+g[b+88>>2],h[v+8>>3]=j,v)|0);dc(5176,(v=i,i=i+8|0,h[v>>3]=+g[b+104>>2],v)|0);dc(12768,(v=i,i=i+8|0,h[v>>3]=+g[b+68>>2],v)|0);dc(12472,(v=i,i=i+8|0,h[v>>3]=+g[b+72>>2],v)|0);dc(11904,(v=i,i=i+8|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function eW(a){a=a|0;vl(a);return}function eX(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,k=0.0;e=dg(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;c[f>>2]=19280;c[e+4>>2]=4;c[e+48>>2]=a;c[e+52>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;vr(e+8|0,0,40);g[e+136>>2]=+Q(+(+g[a+16>>2]*+g[d+16>>2]));j=+g[a+20>>2];k=+g[d+20>>2];g[e+140>>2]=j>k?j:k;c[f>>2]=19736;if((c[(c[a+12>>2]|0)+4>>2]|0)!=2){bd(7976,44,17304,11808);return 0}if((c[(c[d+12>>2]|0)+4>>2]|0)==2){h=e;i=h|0;return i|0}else{bd(7976,45,17304,9368);return 0}return 0}function eY(b,d){b=b|0;d=d|0;var e=0,f=0;br[c[(c[b>>2]|0)+4>>2]&511](b);e=a[22184]|0;if((e&255)<14){f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else{bd(5352,173,17448,6544)}}function eZ(a,b){a=a|0;b=b|0;return 1}function e_(a){a=a|0;return}function e$(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function e0(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function e1(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+88>>2]*c;g[a>>2]=+g[b+84>>2]*c;g[a+4>>2]=d;return}function e2(a,b){a=a|0;b=+b;return+(+g[a+92>>2]*b)}function e3(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,U=0.0,V=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+104|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+108|0;c[l>>2]=j;m=e+28|0;n=b+128|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+136|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+144>>2]=s;t=+g[i+120>>2];g[b+148>>2]=t;u=+g[e+128>>2];g[b+152>>2]=u;v=+g[i+128>>2];g[b+156>>2]=v;i=c[d+24>>2]|0;w=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;x=c[n+4>>2]|0;y=(c[k>>2]=c[n>>2]|0,+g[k>>2]);z=(c[k>>2]=x,+g[k>>2]);A=+g[m+(f*12&-1)+8>>2];B=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;x=c[i+4>>2]|0;C=(c[k>>2]=c[i>>2]|0,+g[k>>2]);D=(c[k>>2]=x,+g[k>>2]);E=+g[m+(j*12&-1)+8>>2];F=+T(+w);G=+S(+w);w=+T(+B);H=+S(+B);B=+g[b+68>>2];I=B-(c[k>>2]=o,+g[k>>2]);B=+g[b+72>>2];J=B-(c[k>>2]=p,+g[k>>2]);B=G*I-F*J;K=F*I+G*J;p=b+112|0;o=(g[k>>2]=B,c[k>>2]|0);j=(g[k>>2]=K,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;J=+g[b+76>>2];G=J-(c[k>>2]=q,+g[k>>2]);J=+g[b+80>>2];I=J-(c[k>>2]=r,+g[k>>2]);J=H*G-w*I;F=w*G+H*I;r=b+120|0;q=(g[k>>2]=J,c[k>>2]|0);j=(g[k>>2]=F,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;I=s+t;H=I+K*u*K+F*v*F;G=v*J;w=K*B*(-0.0-u)-F*G;L=I+B*u*B+J*G;G=H*L-w*w;if(G!=0.0){M=1.0/G}else{M=G}G=w*(-0.0-M);g[b+160>>2]=L*M;g[b+164>>2]=G;g[b+168>>2]=G;g[b+172>>2]=H*M;M=u+v;if(M>0.0){N=1.0/M}else{N=M}g[b+176>>2]=N;j=b+84|0;if((a[d+20|0]&1)<<24>>24==0){g[j>>2]=0.0;g[b+88>>2]=0.0;g[b+92>>2]=0.0;O=A;P=E;Q=C;R=D;U=y;V=z}else{r=d+8|0;N=+g[r>>2];d=j|0;M=N*+g[d>>2];g[d>>2]=M;d=b+88|0;H=N*+g[d>>2];g[d>>2]=H;d=b+92|0;N=+g[r>>2]*+g[d>>2];g[d>>2]=N;O=A-u*(N+(H*B-M*K));P=E+v*(N+(H*J-M*F));Q=C+t*M;R=D+t*H;U=y-s*M;V=z-s*H}d=(c[e>>2]|0)+(f*12&-1)|0;f=(g[k>>2]=U,c[k>>2]|0);r=(g[k>>2]=V,c[k>>2]|0)|0;c[d>>2]=0|f;c[d+4>>2]=r;g[(c[e>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=O;h=(c[e>>2]|0)+((c[l>>2]|0)*12&-1)|0;r=(g[k>>2]=Q,c[k>>2]|0);d=(g[k>>2]=R,c[k>>2]|0)|0;c[h>>2]=0|r;c[h+4>>2]=d;g[(c[e>>2]|0)+((c[l>>2]|0)*12&-1)+8>>2]=P;return}function e4(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0;d=a+104|0;e=c[d>>2]|0;f=b+28|0;h=c[f>>2]|0;i=h+(e*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[h+(e*12&-1)+8>>2];j=a+108|0;i=c[j>>2]|0;o=h+(i*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[h+(i*12&-1)+8>>2];t=+g[a+144>>2];u=+g[a+148>>2];v=+g[a+152>>2];w=+g[a+156>>2];x=+g[b>>2];b=a+92|0;y=+g[b>>2];z=x*+g[a+100>>2];A=y+(s-n)*(-0.0- +g[a+176>>2]);B=-0.0-z;C=A<z?A:z;z=C<B?B:C;g[b>>2]=z;C=z-y;y=n-v*C;n=s+w*C;C=+g[a+124>>2];s=+g[a+120>>2];z=+g[a+116>>2];B=+g[a+112>>2];A=q+C*(-0.0-n)-l-z*(-0.0-y);D=r+s*n-m-B*y;E=+g[a+168>>2]*D+ +g[a+160>>2]*A;F=+g[a+172>>2]*D+ +g[a+164>>2]*A;b=a+84|0;i=b;h=c[i+4>>2]|0;A=(c[k>>2]=c[i>>2]|0,+g[k>>2]);D=(c[k>>2]=h,+g[k>>2]);h=b|0;G=A-E;g[h>>2]=G;b=a+88|0;E=+g[b>>2]-F;g[b>>2]=E;F=x*+g[a+96>>2];x=G*G+E*E;if(x>F*F){H=+Q(+x);if(H<1.1920928955078125e-7){I=G;J=E}else{x=1.0/H;H=G*x;g[h>>2]=H;K=E*x;g[b>>2]=K;I=H;J=K}K=F*I;g[h>>2]=K;I=F*J;g[b>>2]=I;L=K;M=I}else{L=G;M=E}E=L-A;A=M-D;b=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=l-t*E,c[k>>2]|0);h=(g[k>>2]=m-t*A,c[k>>2]|0)|0;c[b>>2]=0|e;c[b+4>>2]=h;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=y-v*(B*A-E*z);d=(c[f>>2]|0)+((c[j>>2]|0)*12&-1)|0;h=(g[k>>2]=q+u*E,c[k>>2]|0);b=(g[k>>2]=r+u*A,c[k>>2]|0)|0;c[d>>2]=0|h;c[d+4>>2]=b;g[(c[f>>2]|0)+((c[j>>2]|0)*12&-1)+8>>2]=n+w*(A*s-E*C);return}function e5(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;dc(7056,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(11336,(v=i,i=i+8|0,c[v>>2]=e,v)|0);dc(8808,(v=i,i=i+8|0,c[v>>2]=f,v)|0);dc(6768,(v=i,i=i+8|0,c[v>>2]=a[b+61|0]&1,v)|0);j=+g[b+72>>2];dc(5992,(v=i,i=i+16|0,h[v>>3]=+g[b+68>>2],h[v+8>>3]=j,v)|0);j=+g[b+80>>2];dc(5536,(v=i,i=i+16|0,h[v>>3]=+g[b+76>>2],h[v+8>>3]=j,v)|0);dc(4328,(v=i,i=i+8|0,h[v>>3]=+g[b+96>>2],v)|0);dc(12832,(v=i,i=i+8|0,h[v>>3]=+g[b+100>>2],v)|0);dc(11904,(v=i,i=i+8|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function e6(a){a=a|0;vl(a);return}function e7(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0;e=b|0;c[e>>2]=19312;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){bd(7272,173,15744,9072)}c[b+4>>2]=c[d>>2]|0;c[b+8>>2]=0;c[b+12>>2]=0;i=b+48|0;c[i>>2]=c[f>>2]|0;f=b+52|0;c[f>>2]=c[h>>2]|0;c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2]|0;vr(b+16|0,0,32);c[e>>2]=20456;e=b+92|0;h=b+100|0;j=b+108|0;l=b+116|0;m=b+124|0;n=b+132|0;o=d+20|0;p=c[o>>2]|0;c[b+68>>2]=p;q=d+24|0;r=c[q>>2]|0;c[b+72>>2]=r;s=c[p+4>>2]|0;c[b+76>>2]=s;t=c[r+4>>2]|0;c[b+80>>2]=t;if((s-1|0)>>>0>=2){bd(7384,53,18560,11640)}if((t-1|0)>>>0>=2){bd(7384,54,18560,9168)}u=c[p+48>>2]|0;c[b+84>>2]=u;v=c[p+52>>2]|0;c[i>>2]=v;w=+g[v+20>>2];x=+g[v+24>>2];y=+g[u+20>>2];z=+g[u+24>>2];i=c[o>>2]|0;if((s|0)==1){A=+g[v+56>>2];B=+g[u+56>>2];s=i+68|0;o=j;p=c[s+4>>2]|0;c[o>>2]=c[s>>2]|0;c[o+4>>2]=p;p=i+76|0;o=e;s=c[p+4>>2]|0;c[o>>2]=c[p>>2]|0;c[o+4>>2]=s;C=+g[i+116>>2];g[b+140>>2]=C;g[m>>2]=0.0;g[b+128>>2]=0.0;D=A-B-C}else{C=+g[u+16>>2];B=+g[u+12>>2];A=+g[v+16>>2];E=+g[v+12>>2];v=i+68|0;u=j;j=c[v>>2]|0;s=c[v+4>>2]|0;c[u>>2]=j;c[u+4>>2]=s;u=i+76|0;v=e;e=c[u>>2]|0;o=c[u+4>>2]|0;c[v>>2]=e;c[v+4>>2]=o;g[b+140>>2]=+g[i+100>>2];v=i+84|0;i=m;m=c[v>>2]|0;u=c[v+4>>2]|0;c[i>>2]=m;c[i+4>>2]=u;F=(c[k>>2]=j,+g[k>>2]);G=(c[k>>2]=s,+g[k>>2]);H=(c[k>>2]=e,+g[k>>2]);I=(c[k>>2]=o,+g[k>>2]);J=E-B+(x*H-w*I);B=A-C+(w*H+x*I);I=(c[k>>2]=m,+g[k>>2])*(z*J+y*B-F);D=I+(c[k>>2]=u,+g[k>>2])*(J*(-0.0-y)+z*B-G)}u=c[r+48>>2]|0;c[b+88>>2]=u;m=c[r+52>>2]|0;c[f>>2]=m;G=+g[m+20>>2];B=+g[m+24>>2];z=+g[u+20>>2];y=+g[u+24>>2];f=c[q>>2]|0;if((t|0)==1){J=+g[m+56>>2];I=+g[u+56>>2];t=f+68|0;q=l;r=c[t+4>>2]|0;c[q>>2]=c[t>>2]|0;c[q+4>>2]=r;r=f+76|0;q=h;t=c[r+4>>2]|0;c[q>>2]=c[r>>2]|0;c[q+4>>2]=t;F=+g[f+116>>2];g[b+144>>2]=F;g[n>>2]=0.0;g[b+136>>2]=0.0;x=J-I-F;t=d+28|0;F=+g[t>>2];q=b+152|0;g[q>>2]=F;I=x*F;J=D+I;r=b+148|0;g[r>>2]=J;o=b+156|0;g[o>>2]=0.0;return}else{H=+g[u+16>>2];w=+g[u+12>>2];C=+g[m+16>>2];A=+g[m+12>>2];m=f+68|0;u=l;l=c[m>>2]|0;e=c[m+4>>2]|0;c[u>>2]=l;c[u+4>>2]=e;u=f+76|0;m=h;h=c[u>>2]|0;s=c[u+4>>2]|0;c[m>>2]=h;c[m+4>>2]=s;g[b+144>>2]=+g[f+100>>2];m=f+84|0;f=n;n=c[m>>2]|0;u=c[m+4>>2]|0;c[f>>2]=n;c[f+4>>2]=u;E=(c[k>>2]=l,+g[k>>2]);K=(c[k>>2]=e,+g[k>>2]);L=(c[k>>2]=h,+g[k>>2]);M=(c[k>>2]=s,+g[k>>2]);N=A-w+(B*L-G*M);w=C-H+(G*L+B*M);M=(c[k>>2]=n,+g[k>>2])*(y*N+z*w-E);x=M+(c[k>>2]=u,+g[k>>2])*(N*(-0.0-z)+y*w-K);t=d+28|0;F=+g[t>>2];q=b+152|0;g[q>>2]=F;I=x*F;J=D+I;r=b+148|0;g[r>>2]=J;o=b+156|0;g[o>>2]=0.0;return}}function e8(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0.0,v=0.0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0;d=a+160|0;e=c[d>>2]|0;f=b+28|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];i=a+164|0;h=c[i>>2]|0;n=b+(h*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(h*12&-1)+8>>2];h=a+168|0;o=c[h>>2]|0;n=b+(o*12&-1)|0;s=c[n+4>>2]|0;t=(c[k>>2]=c[n>>2]|0,+g[k>>2]);u=(c[k>>2]=s,+g[k>>2]);v=+g[b+(o*12&-1)+8>>2];o=a+172|0;s=c[o>>2]|0;n=b+(s*12&-1)|0;w=c[n+4>>2]|0;x=(c[k>>2]=c[n>>2]|0,+g[k>>2]);y=(c[k>>2]=w,+g[k>>2]);z=+g[b+(s*12&-1)+8>>2];A=+g[a+240>>2];B=+g[a+244>>2];C=+g[a+248>>2];D=+g[a+252>>2];E=+g[a+256>>2];F=+g[a+264>>2];G=+g[a+260>>2];H=+g[a+268>>2];I=((j-t)*A+(l-u)*B+((p-x)*C+(q-y)*D)+(m*E-v*F+(r*G-z*H)))*(-0.0- +g[a+272>>2]);s=a+156|0;g[s>>2]=+g[s>>2]+I;J=+g[a+208>>2]*I;K=m+I*+g[a+224>>2]*E;E=I*+g[a+212>>2];m=r+I*+g[a+228>>2]*G;G=I*+g[a+216>>2];r=v-I*+g[a+232>>2]*F;F=I*+g[a+220>>2];v=z-I*+g[a+236>>2]*H;a=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=j+A*J,c[k>>2]|0);s=(g[k>>2]=l+B*J,c[k>>2]|0)|0;c[a>>2]=0|e;c[a+4>>2]=s;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=K;d=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;s=(g[k>>2]=p+C*E,c[k>>2]|0);a=(g[k>>2]=q+E*D,c[k>>2]|0)|0;c[d>>2]=0|s;c[d+4>>2]=a;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=m;i=(c[f>>2]|0)+((c[h>>2]|0)*12&-1)|0;a=(g[k>>2]=t-A*G,c[k>>2]|0);d=(g[k>>2]=u-B*G,c[k>>2]|0)|0;c[i>>2]=0|a;c[i+4>>2]=d;g[(c[f>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=r;h=(c[f>>2]|0)+((c[o>>2]|0)*12&-1)|0;d=(g[k>>2]=x-C*F,c[k>>2]|0);i=(g[k>>2]=y-D*F,c[k>>2]|0)|0;c[h>>2]=0|d;c[h+4>>2]=i;g[(c[f>>2]|0)+((c[o>>2]|0)*12&-1)+8>>2]=v;return}function e9(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0.0,ao=0.0,ap=0.0,aq=0.0,ar=0.0,as=0.0,at=0.0,au=0.0,av=0.0,aw=0.0,ax=0.0,ay=0.0,az=0.0,aA=0.0,aB=0.0,aC=0.0,aD=0.0,aE=0.0,aF=0.0,aG=0.0,aH=0.0,aI=0.0,aJ=0.0,aK=0.0,aL=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+160|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+164|0;c[l>>2]=j;m=c[b+84>>2]|0;n=c[m+8>>2]|0;o=b+168|0;c[o>>2]=n;p=c[b+88>>2]|0;q=c[p+8>>2]|0;r=b+172|0;c[r>>2]=q;s=e+28|0;t=b+176|0;u=c[s>>2]|0;v=c[s+4>>2]|0;c[t>>2]=u;c[t+4>>2]=v;t=i+28|0;s=b+184|0;w=c[t>>2]|0;x=c[t+4>>2]|0;c[s>>2]=w;c[s+4>>2]=x;s=m+28|0;t=b+192|0;y=c[s>>2]|0;z=c[s+4>>2]|0;c[t>>2]=y;c[t+4>>2]=z;t=p+28|0;s=b+200|0;A=c[t>>2]|0;B=c[t+4>>2]|0;c[s>>2]=A;c[s+4>>2]=B;C=+g[e+120>>2];g[b+208>>2]=C;D=+g[i+120>>2];g[b+212>>2]=D;E=+g[m+120>>2];g[b+216>>2]=E;F=+g[p+120>>2];g[b+220>>2]=F;G=+g[e+128>>2];g[b+224>>2]=G;H=+g[i+128>>2];g[b+228>>2]=H;I=+g[m+128>>2];g[b+232>>2]=I;J=+g[p+128>>2];g[b+236>>2]=J;p=c[d+24>>2]|0;K=+g[p+(f*12&-1)+8>>2];m=d+28|0;i=c[m>>2]|0;e=i+(f*12&-1)|0;s=c[e+4>>2]|0;L=(c[k>>2]=c[e>>2]|0,+g[k>>2]);M=(c[k>>2]=s,+g[k>>2]);N=+g[i+(f*12&-1)+8>>2];O=+g[p+(j*12&-1)+8>>2];s=i+(j*12&-1)|0;e=c[s+4>>2]|0;P=(c[k>>2]=c[s>>2]|0,+g[k>>2]);Q=(c[k>>2]=e,+g[k>>2]);R=+g[i+(j*12&-1)+8>>2];U=+g[p+(n*12&-1)+8>>2];j=i+(n*12&-1)|0;e=c[j+4>>2]|0;V=(c[k>>2]=c[j>>2]|0,+g[k>>2]);W=(c[k>>2]=e,+g[k>>2]);X=+g[i+(n*12&-1)+8>>2];Y=+g[p+(q*12&-1)+8>>2];p=i+(q*12&-1)|0;n=c[p+4>>2]|0;Z=(c[k>>2]=c[p>>2]|0,+g[k>>2]);_=(c[k>>2]=n,+g[k>>2]);$=+g[i+(q*12&-1)+8>>2];aa=+T(+K);ab=+S(+K);K=+T(+O);ac=+S(+O);O=+T(+U);ad=+S(+U);U=+T(+Y);ae=+S(+Y);q=b+272|0;g[q>>2]=0.0;i=(c[b+76>>2]|0)==1;Y=(c[k>>2]=A,+g[k>>2]);af=(c[k>>2]=B,+g[k>>2]);ag=(c[k>>2]=w,+g[k>>2]);ah=(c[k>>2]=x,+g[k>>2]);if(i){g[b+240>>2]=0.0;g[b+244>>2]=0.0;g[b+256>>2]=1.0;g[b+264>>2]=1.0;ai=G+I;aj=0.0;ak=0.0;al=1.0;am=1.0}else{an=(c[k>>2]=v,+g[k>>2]);ao=(c[k>>2]=u,+g[k>>2]);ap=(c[k>>2]=z,+g[k>>2]);aq=+g[b+124>>2];ar=+g[b+128>>2];as=ad*aq-O*ar;at=O*aq+ad*ar;ar=+g[b+108>>2]-(c[k>>2]=y,+g[k>>2]);aq=+g[b+112>>2]-ap;ap=+g[b+92>>2]-ao;ao=+g[b+96>>2]-an;y=b+240|0;z=(g[k>>2]=as,c[k>>2]|0);u=(g[k>>2]=at,c[k>>2]|0)|0;c[y>>2]=0|z;c[y+4>>2]=u;an=at*(ad*ar-O*aq)-as*(O*ar+ad*aq);g[b+264>>2]=an;aq=at*(ab*ap-aa*ao)-as*(aa*ap+ab*ao);g[b+256>>2]=aq;ai=E+C+an*I*an+aq*G*aq;aj=as;ak=at;al=aq;am=an}an=ai+0.0;g[q>>2]=an;if((c[b+80>>2]|0)==1){g[b+248>>2]=0.0;g[b+252>>2]=0.0;ai=+g[b+152>>2];g[b+260>>2]=ai;g[b+268>>2]=ai;au=ai*ai*(H+J);av=0.0;aw=0.0;ax=ai;ay=ai}else{ai=+g[b+132>>2];aq=+g[b+136>>2];at=ae*ai-U*aq;as=U*ai+ae*aq;aq=+g[b+116>>2]-Y;Y=+g[b+120>>2]-af;af=+g[b+100>>2]-ag;ag=+g[b+104>>2]-ah;ah=+g[b+152>>2];ai=at*ah;ao=as*ah;u=b+248|0;y=(g[k>>2]=ai,c[k>>2]|0);z=(g[k>>2]=ao,c[k>>2]|0)|0;c[u>>2]=0|y;c[u+4>>2]=z;ab=(as*(ae*aq-U*Y)-at*(U*aq+ae*Y))*ah;g[b+268>>2]=ab;Y=ah*(as*(ac*af-K*ag)-at*(K*af+ac*ag));g[b+260>>2]=Y;au=ah*ah*(F+D)+ab*J*ab+Y*Y*H;av=ai;aw=ao;ax=Y;ay=ab}ab=an+au;g[q>>2]=ab;if(ab>0.0){az=1.0/ab}else{az=0.0}g[q>>2]=az;q=b+156|0;if((a[d+20|0]&1)<<24>>24==0){g[q>>2]=0.0;aA=$;aB=N;aC=X;aD=R;aE=Z;aF=_;aG=V;aH=W;aI=P;aJ=Q;aK=L;aL=M}else{az=+g[q>>2];ab=C*az;C=az*D;D=az*E;E=az*F;aA=$-az*J*ay;aB=N+az*G*al;aC=X-az*I*am;aD=R+az*H*ax;aE=Z-av*E;aF=_-aw*E;aG=V-aj*D;aH=W-ak*D;aI=P+av*C;aJ=Q+C*aw;aK=L+aj*ab;aL=M+ab*ak}q=(c[m>>2]|0)+(f*12&-1)|0;f=(g[k>>2]=aK,c[k>>2]|0);d=(g[k>>2]=aL,c[k>>2]|0)|0;c[q>>2]=0|f;c[q+4>>2]=d;g[(c[m>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=aB;h=(c[m>>2]|0)+((c[l>>2]|0)*12&-1)|0;d=(g[k>>2]=aI,c[k>>2]|0);q=(g[k>>2]=aJ,c[k>>2]|0)|0;c[h>>2]=0|d;c[h+4>>2]=q;g[(c[m>>2]|0)+((c[l>>2]|0)*12&-1)+8>>2]=aD;l=(c[m>>2]|0)+((c[o>>2]|0)*12&-1)|0;q=(g[k>>2]=aG,c[k>>2]|0);h=(g[k>>2]=aH,c[k>>2]|0)|0;c[l>>2]=0|q;c[l+4>>2]=h;g[(c[m>>2]|0)+((c[o>>2]|0)*12&-1)+8>>2]=aC;o=(c[m>>2]|0)+((c[r>>2]|0)*12&-1)|0;h=(g[k>>2]=aE,c[k>>2]|0);l=(g[k>>2]=aF,c[k>>2]|0)|0;c[o>>2]=0|h;c[o+4>>2]=l;g[(c[m>>2]|0)+((c[r>>2]|0)*12&-1)+8>>2]=aA;return}function fa(a){a=a|0;return}function fb(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+92>>2];h=+g[d+20>>2];i=+g[b+96>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fc(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+100>>2];h=+g[d+20>>2];i=+g[b+104>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fd(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0;d=+g[b+156>>2];e=d*+g[b+244>>2]*c;g[a>>2]=d*+g[b+240>>2]*c;g[a+4>>2]=e;return}function fe(a,b){a=a|0;b=+b;return+(+g[a+156>>2]*+g[a+256>>2]*b)}function ff(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0.0,v=0.0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0;d=a+160|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];e=a+164|0;i=c[e>>2]|0;n=b+(i*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(i*12&-1)+8>>2];i=a+168|0;o=c[i>>2]|0;n=b+(o*12&-1)|0;s=c[n+4>>2]|0;t=(c[k>>2]=c[n>>2]|0,+g[k>>2]);u=(c[k>>2]=s,+g[k>>2]);v=+g[b+(o*12&-1)+8>>2];o=a+172|0;s=c[o>>2]|0;n=b+(s*12&-1)|0;w=c[n+4>>2]|0;x=(c[k>>2]=c[n>>2]|0,+g[k>>2]);y=(c[k>>2]=w,+g[k>>2]);z=+g[b+(s*12&-1)+8>>2];A=+T(+m);B=+S(+m);C=+T(+r);D=+S(+r);E=+T(+v);F=+S(+v);G=+T(+z);H=+S(+z);if((c[a+76>>2]|0)==1){I=+g[a+224>>2];J=+g[a+232>>2];K=I+J;L=1.0;M=1.0;N=m-v- +g[a+140>>2];O=0.0;P=0.0;Q=I;R=J}else{J=+g[a+124>>2];I=+g[a+128>>2];U=F*J-E*I;V=E*J+F*I;W=+g[a+108>>2]- +g[a+192>>2];X=+g[a+112>>2]- +g[a+196>>2];Y=+g[a+92>>2]- +g[a+176>>2];Z=+g[a+96>>2]- +g[a+180>>2];_=B*Y-A*Z;$=A*Y+B*Z;Z=V*(F*W-E*X)-U*(E*W+F*X);B=V*_-U*$;Y=+g[a+232>>2];A=+g[a+224>>2];aa=j-t+_;_=l-u+$;K=+g[a+216>>2]+ +g[a+208>>2]+Z*Z*Y+B*A*B;L=Z;M=B;N=J*(F*aa+E*_-W)+I*(aa*(-0.0-E)+F*_-X);O=U;P=V;Q=A;R=Y}if((c[a+80>>2]|0)==1){Y=+g[a+152>>2];A=+g[a+228>>2];V=+g[a+236>>2];ab=Y*Y*(A+V);ac=Y;ad=Y;ae=r-z- +g[a+144>>2];af=0.0;ag=0.0;ah=Y;ai=A;aj=V}else{V=+g[a+132>>2];A=+g[a+136>>2];Y=H*V-G*A;U=G*V+H*A;X=+g[a+116>>2]- +g[a+200>>2];_=+g[a+120>>2]- +g[a+204>>2];F=+g[a+100>>2]- +g[a+184>>2];E=+g[a+104>>2]- +g[a+188>>2];aa=D*F-C*E;I=C*F+D*E;E=+g[a+152>>2];D=E*(U*(H*X-G*_)-Y*(G*X+H*_));F=E*(U*aa-Y*I);C=+g[a+236>>2];W=+g[a+228>>2];J=p-x+aa;aa=q-y+I;ab=E*E*(+g[a+220>>2]+ +g[a+212>>2])+D*D*C+F*W*F;ac=D;ad=F;ae=V*(H*J+G*aa-X)+A*(J*(-0.0-G)+H*aa-_);af=Y*E;ag=U*E;ah=E;ai=W;aj=C}C=K+0.0+ab;if(C>0.0){ak=(-0.0-(N+ae*ah- +g[a+148>>2]))/C}else{ak=0.0}C=ak*+g[a+208>>2];ah=ak*+g[a+212>>2];ae=ak*+g[a+216>>2];N=ak*+g[a+220>>2];a=(g[k>>2]=j+O*C,c[k>>2]|0);s=(g[k>>2]=l+P*C,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=s;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=m+M*ak*Q;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;s=(g[k>>2]=p+af*ah,c[k>>2]|0);h=(g[k>>2]=q+ag*ah,c[k>>2]|0)|0;c[d>>2]=0|s;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=r+ad*ak*ai;e=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;h=(g[k>>2]=t-O*ae,c[k>>2]|0);d=(g[k>>2]=u-P*ae,c[k>>2]|0)|0;c[e>>2]=0|h;c[e+4>>2]=d;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=v-L*ak*R;i=(c[f>>2]|0)+((c[o>>2]|0)*12&-1)|0;d=(g[k>>2]=x-af*N,c[k>>2]|0);e=(g[k>>2]=y-ag*N,c[k>>2]|0)|0;c[i>>2]=0|d;c[i+4>>2]=e;g[(c[f>>2]|0)+((c[o>>2]|0)*12&-1)+8>>2]=z-ac*ak*aj;return 1}function fg(b){b=b|0;var d=0,e=0,f=0,j=0,k=0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;j=c[(c[b+68>>2]|0)+56>>2]|0;k=c[(c[b+72>>2]|0)+56>>2]|0;dc(6104,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(11336,(v=i,i=i+8|0,c[v>>2]=e,v)|0);dc(8808,(v=i,i=i+8|0,c[v>>2]=f,v)|0);dc(6768,(v=i,i=i+8|0,c[v>>2]=a[b+61|0]&1,v)|0);dc(4568,(v=i,i=i+8|0,c[v>>2]=j,v)|0);dc(4296,(v=i,i=i+8|0,c[v>>2]=k,v)|0);dc(11504,(v=i,i=i+8|0,h[v>>3]=+g[b+152>>2],v)|0);dc(11904,(v=i,i=i+8|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function fh(a){a=a|0;vl(a);return}function fi(a){a=a|0;return}function fj(a){a=a|0;a=i;dc(6944,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);i=a;return}function fk(a){a=a|0;vl(a);return}function fl(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;e=b|0;f=c[e>>2]|0;if((f|0)==9){h=dg(d,180)|0;do{if((h|0)==0){i=0}else{j=h;c[j>>2]=19312;k=b+8|0;l=b+12|0;if((c[k>>2]|0)==(c[l>>2]|0)){bd(7272,173,15744,9072);return 0}else{c[h+4>>2]=c[e>>2]|0;c[h+8>>2]=0;c[h+12>>2]=0;c[h+48>>2]=c[k>>2]|0;c[h+52>>2]=c[l>>2]|0;c[h+56>>2]=0;a[h+61|0]=a[b+16|0]&1;a[h+60|0]=0;c[h+64>>2]=c[b+4>>2]|0;vr(h+16|0,0,32);c[j>>2]=19856;j=b+20|0;l=h+68|0;k=c[j+4>>2]|0;c[l>>2]=c[j>>2]|0;c[l+4>>2]=k;k=b+28|0;l=h+76|0;j=c[k+4>>2]|0;c[l>>2]=c[k>>2]|0;c[l+4>>2]=j;g[h+84>>2]=0.0;g[h+88>>2]=0.0;g[h+92>>2]=0.0;g[h+96>>2]=+g[b+36>>2];g[h+100>>2]=+g[b+40>>2];i=h;break}}}while(0);h=i|0;return h|0}else if((f|0)==4){i=dg(d,196)|0;if((i|0)==0){m=0}else{j=i;fK(j,b);m=j}h=m|0;return h|0}else if((f|0)==7){m=dg(d,224)|0;if((m|0)==0){n=0}else{j=m;go(j,b);n=j}h=n|0;return h|0}else if((f|0)==1){n=dg(d,228)|0;do{if((n|0)==0){o=0}else{j=n;c[j>>2]=19312;m=b+8|0;i=b+12|0;if((c[m>>2]|0)==(c[i>>2]|0)){bd(7272,173,15744,9072);return 0}else{c[n+4>>2]=c[e>>2]|0;c[n+8>>2]=0;c[n+12>>2]=0;c[n+48>>2]=c[m>>2]|0;c[n+52>>2]=c[i>>2]|0;c[n+56>>2]=0;a[n+61|0]=a[b+16|0]&1;a[n+60|0]=0;c[n+64>>2]=c[b+4>>2]|0;vr(n+16|0,0,32);c[j>>2]=19768;j=b+20|0;i=n+68|0;m=c[j+4>>2]|0;c[i>>2]=c[j>>2]|0;c[i+4>>2]=m;m=b+28|0;i=n+76|0;j=c[m+4>>2]|0;c[i>>2]=c[m>>2]|0;c[i+4>>2]=j;g[n+116>>2]=+g[b+36>>2];vr(n+84|0,0,16);g[n+120>>2]=+g[b+44>>2];g[n+124>>2]=+g[b+48>>2];g[n+104>>2]=+g[b+60>>2];g[n+108>>2]=+g[b+56>>2];a[n+112|0]=a[b+40|0]&1;a[n+100|0]=a[b+52|0]&1;c[n+224>>2]=0;o=n;break}}}while(0);h=o|0;return h|0}else if((f|0)==6){o=dg(d,276)|0;if((o|0)==0){p=0}else{n=o;e7(n,b);p=n}h=p|0;return h|0}else if((f|0)==10){p=dg(d,168)|0;do{if((p|0)==0){q=0}else{n=p;c[n>>2]=19312;o=b+8|0;j=b+12|0;if((c[o>>2]|0)==(c[j>>2]|0)){bd(7272,173,15744,9072);return 0}else{c[p+4>>2]=c[e>>2]|0;c[p+8>>2]=0;c[p+12>>2]=0;c[p+48>>2]=c[o>>2]|0;c[p+52>>2]=c[j>>2]|0;c[p+56>>2]=0;a[p+61|0]=a[b+16|0]&1;a[p+60|0]=0;c[p+64>>2]=c[b+4>>2]|0;vr(p+16|0,0,32);c[n>>2]=20400;n=b+20|0;j=p+68|0;o=c[n+4>>2]|0;c[j>>2]=c[n>>2]|0;c[j+4>>2]=o;o=b+28|0;j=p+76|0;n=c[o+4>>2]|0;c[j>>2]=c[o>>2]|0;c[j+4>>2]=n;g[p+84>>2]=+g[b+36>>2];g[p+160>>2]=0.0;g[p+92>>2]=0.0;c[p+164>>2]=0;g[p+88>>2]=0.0;q=p;break}}}while(0);h=q|0;return h|0}else if((f|0)==3){q=dg(d,176)|0;do{if((q|0)==0){r=0}else{p=q;c[p>>2]=19312;n=b+8|0;j=b+12|0;if((c[n>>2]|0)==(c[j>>2]|0)){bd(7272,173,15744,9072);return 0}else{c[q+4>>2]=c[e>>2]|0;c[q+8>>2]=0;c[q+12>>2]=0;c[q+48>>2]=c[n>>2]|0;c[q+52>>2]=c[j>>2]|0;c[q+56>>2]=0;a[q+61|0]=a[b+16|0]&1;a[q+60|0]=0;c[q+64>>2]=c[b+4>>2]|0;vr(q+16|0,0,32);c[p>>2]=19912;p=b+20|0;j=q+80|0;n=c[p+4>>2]|0;c[j>>2]=c[p>>2]|0;c[j+4>>2]=n;n=b+28|0;j=q+88|0;p=c[n+4>>2]|0;c[j>>2]=c[n>>2]|0;c[j+4>>2]=p;g[q+104>>2]=+g[b+36>>2];g[q+68>>2]=+g[b+40>>2];g[q+72>>2]=+g[b+44>>2];g[q+100>>2]=0.0;g[q+96>>2]=0.0;g[q+76>>2]=0.0;r=q;break}}}while(0);h=r|0;return h|0}else if((f|0)==2){r=dg(d,256)|0;if((r|0)==0){s=0}else{q=r;fy(q,b);s=q}h=s|0;return h|0}else if((f|0)==5){s=dg(d,168)|0;if((s|0)==0){t=0}else{q=s;fw(q,b);t=q}h=t|0;return h|0}else if((f|0)==8){f=dg(d,208)|0;do{if((f|0)==0){u=0}else{d=f;c[d>>2]=19312;t=b+8|0;q=b+12|0;if((c[t>>2]|0)==(c[q>>2]|0)){bd(7272,173,15744,9072);return 0}else{c[f+4>>2]=c[e>>2]|0;c[f+8>>2]=0;c[f+12>>2]=0;c[f+48>>2]=c[t>>2]|0;c[f+52>>2]=c[q>>2]|0;c[f+56>>2]=0;a[f+61|0]=a[b+16|0]&1;a[f+60|0]=0;c[f+64>>2]=c[b+4>>2]|0;vr(f+16|0,0,32);c[d>>2]=20344;d=b+20|0;q=f+80|0;t=c[d+4>>2]|0;c[q>>2]=c[d>>2]|0;c[q+4>>2]=t;t=b+28|0;q=f+88|0;d=c[t+4>>2]|0;c[q>>2]=c[t>>2]|0;c[q+4>>2]=d;g[f+96>>2]=+g[b+36>>2];g[f+68>>2]=+g[b+40>>2];g[f+72>>2]=+g[b+44>>2];g[f+104>>2]=0.0;g[f+108>>2]=0.0;g[f+112>>2]=0.0;u=f;break}}}while(0);h=u|0;return h|0}else{bd(7272,113,15848,11592);return 0}return 0}function fm(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;br[c[(c[b>>2]|0)+20>>2]&511](b);e=c[b+4>>2]|0;if((e|0)==10){f=a[22208]|0;if((f&255)>=14){bd(5352,173,17448,6544)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else if((e|0)==1){g=a[22268]|0;if((g&255)>=14){bd(5352,173,17448,6544)}f=d+12+((g&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else if((e|0)==5){f=a[22208]|0;if((f&255)>=14){bd(5352,173,17448,6544)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else if((e|0)==4){g=a[22236]|0;if((g&255)>=14){bd(5352,173,17448,6544)}f=d+12+((g&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else if((e|0)==8){f=a[22248]|0;if((f&255)>=14){bd(5352,173,17448,6544)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else if((e|0)==6){g=a[22316]|0;if((g&255)>=14){bd(5352,173,17448,6544)}f=d+12+((g&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else if((e|0)==7){f=a[22264]|0;if((f&255)>=14){bd(5352,173,17448,6544)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else if((e|0)==3){g=a[22216]|0;if((g&255)>=14){bd(5352,173,17448,6544)}f=d+12+((g&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else if((e|0)==2){f=a[22296]|0;if((f&255)>=14){bd(5352,173,17448,6544)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else if((e|0)==9){e=a[22220]|0;if((e&255)>=14){bd(5352,173,17448,6544)}g=d+12+((e&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else{bd(7272,166,15784,11592)}}function fn(a,b){a=a|0;b=b|0;return 1}function fo(a){a=a|0;return}function fp(a,b){a=a|0;b=+b;return+(b*0.0)}function fq(a,b){a=a|0;b=b|0;var d=0;d=b+76|0;b=a;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function fr(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fs(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+100>>2]*c;g[a>>2]=+g[b+96>>2]*c;g[a+4>>2]=d;return}function ft(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0.0,y=0.0,z=0.0;d=a+116|0;e=c[d>>2]|0;f=b+28|0;h=c[f>>2]|0;i=h+(e*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[h+(e*12&-1)+8>>2];o=+g[a+124>>2];p=+g[a+120>>2];q=+g[a+108>>2];h=a+96|0;j=h|0;r=+g[j>>2];i=a+100|0;s=+g[i>>2];t=-0.0-(l+o*(-0.0-n)+ +g[a+160>>2]+q*r);u=-0.0-(m+n*p+ +g[a+164>>2]+q*s);q=+g[a+144>>2]*t+ +g[a+152>>2]*u;v=+g[a+148>>2]*t+ +g[a+156>>2]*u;w=h;h=c[w+4>>2]|0;u=(c[k>>2]=c[w>>2]|0,+g[k>>2]);t=(c[k>>2]=h,+g[k>>2]);x=r+q;g[j>>2]=x;q=v+s;g[i>>2]=q;s=+g[b>>2]*+g[a+104>>2];v=q*q+x*x;if(v>s*s){r=s/+Q(+v);v=x*r;g[j>>2]=v;s=r*q;g[i>>2]=s;y=v;z=s}else{y=x;z=q}q=y-u;u=z-t;t=+g[a+136>>2];z=n+ +g[a+140>>2]*(u*p-q*o);a=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=l+q*t,c[k>>2]|0);i=(g[k>>2]=m+u*t,c[k>>2]|0)|0;c[a>>2]=0|e;c[a+4>>2]=i;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=z;return}function fu(a){a=a|0;a=i;dc(5136,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);i=a;return}function fv(a){a=a|0;vl(a);return}function fw(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0.0,j=0,l=0,m=0,n=0,o=0.0,p=0.0,r=0.0;e=b|0;c[e>>2]=19312;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){bd(7272,173,15744,9072)}c[b+4>>2]=c[d>>2]|0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[f>>2]|0;f=c[h>>2]|0;c[b+52>>2]=f;c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2]|0;vr(b+16|0,0,32);c[e>>2]=20240;e=d+20|0;i=+g[e>>2];if(!(i==i&!(D=0.0,D!=D)&i>+-q&i<+q)){bd(7088,34,18312,11528)}i=+g[d+24>>2];if(!(i==i&!(D=0.0,D!=D)&i>+-q&i<+q)){bd(7088,34,18312,11528)}h=d+28|0;i=+g[h>>2];if(i<0.0|i==i&!(D=0.0,D!=D)&i>+-q&i<+q^1){bd(7088,35,18312,9016)}j=d+32|0;i=+g[j>>2];if(i<0.0|i==i&!(D=0.0,D!=D)&i>+-q&i<+q^1){bd(7088,36,18312,6888)}l=d+36|0;i=+g[l>>2];if(i<0.0|i==i&!(D=0.0,D!=D)&i>+-q&i<+q^1){bd(7088,37,18312,6040)}else{d=e;e=b+76|0;m=c[d>>2]|0;n=c[d+4>>2]|0;c[e>>2]=m;c[e+4>>2]=n;i=(c[k>>2]=m,+g[k>>2])- +g[f+12>>2];o=(c[k>>2]=n,+g[k>>2])- +g[f+16>>2];p=+g[f+24>>2];r=+g[f+20>>2];f=b+68|0;n=(g[k>>2]=i*p+o*r,c[k>>2]|0);m=(g[k>>2]=p*o+i*(-0.0-r),c[k>>2]|0)|0;c[f>>2]=0|n;c[f+4>>2]=m;g[b+104>>2]=+g[h>>2];g[b+96>>2]=0.0;g[b+100>>2]=0.0;g[b+84>>2]=+g[j>>2];g[b+88>>2]=+g[l>>2];g[b+92>>2]=0.0;g[b+108>>2]=0.0;return}}function fx(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0.0,o=0.0,p=0,q=0.0,r=0.0,s=0.0,t=0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,U=0;e=c[b+52>>2]|0;f=c[e+8>>2]|0;h=b+116|0;c[h>>2]=f;i=e+28|0;j=b+128|0;l=c[i>>2]|0;m=c[i+4>>2]|0;c[j>>2]=l;c[j+4>>2]=m;n=+g[e+120>>2];g[b+136>>2]=n;o=+g[e+128>>2];g[b+140>>2]=o;j=c[d+24>>2]|0;i=j+(f*12&-1)|0;p=c[i+4>>2]|0;q=(c[k>>2]=c[i>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[j+(f*12&-1)+8>>2];j=d+28|0;p=c[j>>2]|0;i=p+(f*12&-1)|0;t=c[i+4>>2]|0;u=(c[k>>2]=c[i>>2]|0,+g[k>>2]);v=(c[k>>2]=t,+g[k>>2]);w=+g[p+(f*12&-1)+8>>2];x=+T(+s);y=+S(+s);s=+g[e+116>>2];z=+g[b+84>>2]*6.2831854820251465;A=+g[d>>2];B=A*s*z*z;C=z*s*2.0*+g[b+88>>2]+B;s=(c[k>>2]=l,+g[k>>2]);z=(c[k>>2]=m,+g[k>>2]);if(C<=1.1920928955078125e-7){bd(7088,125,18368,5608)}D=A*C;if(D!=0.0){E=1.0/D}else{E=D}g[b+108>>2]=E;D=B*E;g[b+92>>2]=D;B=+g[b+68>>2]-s;s=+g[b+72>>2]-z;z=y*B-x*s;C=x*B+y*s;m=b+120|0;l=(g[k>>2]=z,c[k>>2]|0);e=(g[k>>2]=C,c[k>>2]|0)|0;c[m>>2]=0|l;c[m+4>>2]=e;s=E+(n+C*o*C);y=C*z*(-0.0-o);B=E+(n+z*o*z);E=s*B-y*y;if(E!=0.0){F=1.0/E}else{F=E}E=y*(-0.0-F);g[b+144>>2]=B*F;g[b+148>>2]=E;g[b+152>>2]=E;g[b+156>>2]=s*F;e=b+160|0;F=q+z- +g[b+76>>2];q=r+C- +g[b+80>>2];m=e;l=(g[k>>2]=F,c[k>>2]|0);p=(g[k>>2]=q,c[k>>2]|0)|0;c[m>>2]=0|l;c[m+4>>2]=p;g[e>>2]=D*F;g[b+164>>2]=D*q;q=w*.9800000190734863;e=b+96|0;if((a[d+20|0]&1)<<24>>24==0){g[e>>2]=0.0;g[b+100>>2]=0.0;w=q;D=u;F=v;p=c[j>>2]|0;m=p+(f*12&-1)|0;l=m;t=(g[k>>2]=D,c[k>>2]|0);i=(g[k>>2]=F,c[k>>2]|0);G=i;H=0;I=0;J=G;K=t;L=0;M=I|K;N=J|L;O=l|0;c[O>>2]=M;P=l+4|0;c[P>>2]=N;Q=c[h>>2]|0;R=c[j>>2]|0;U=R+(Q*12&-1)+8|0;g[U>>2]=w;return}else{r=+g[d+8>>2];d=e|0;s=r*+g[d>>2];g[d>>2]=s;d=b+100|0;E=r*+g[d>>2];g[d>>2]=E;w=q+o*(E*z-s*C);D=u+n*s;F=v+E*n;p=c[j>>2]|0;m=p+(f*12&-1)|0;l=m;t=(g[k>>2]=D,c[k>>2]|0);i=(g[k>>2]=F,c[k>>2]|0);G=i;H=0;I=0;J=G;K=t;L=0;M=I|K;N=J|L;O=l|0;c[O>>2]=M;P=l+4|0;c[P>>2]=N;Q=c[h>>2]|0;R=c[j>>2]|0;U=R+(Q*12&-1)+8|0;g[U>>2]=w;return}}function fy(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0;e=b|0;c[e>>2]=19312;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){bd(7272,173,15744,9072)}c[b+4>>2]=c[d>>2]|0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[f>>2]|0;c[b+52>>2]=c[h>>2]|0;c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2]|0;vr(b+16|0,0,32);c[e>>2]=19680;e=b+84|0;h=d+20|0;f=b+68|0;i=c[h+4>>2]|0;c[f>>2]=c[h>>2]|0;c[f+4>>2]=i;i=d+28|0;f=b+76|0;h=c[i+4>>2]|0;c[f>>2]=c[i>>2]|0;c[f+4>>2]=h;h=d+36|0;f=e;i=c[h>>2]|0;j=c[h+4>>2]|0;c[f>>2]=i;c[f+4>>2]=j;l=(c[k>>2]=i,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+Q(+(l*l+m*m));if(n<1.1920928955078125e-7){o=m;p=l}else{q=1.0/n;n=l*q;g[e>>2]=n;l=m*q;g[b+88>>2]=l;o=l;p=n}e=b+92|0;j=(g[k>>2]=o*-1.0,c[k>>2]|0);i=(g[k>>2]=p,c[k>>2]|0)|0;c[e>>2]=0|j;c[e+4>>2]=i;g[b+100>>2]=+g[d+44>>2];g[b+252>>2]=0.0;vr(b+104|0,0,16);g[b+120>>2]=+g[d+52>>2];g[b+124>>2]=+g[d+56>>2];g[b+128>>2]=+g[d+64>>2];g[b+132>>2]=+g[d+68>>2];a[b+136|0]=a[d+48|0]&1;a[b+137|0]=a[d+60|0]&1;c[b+140>>2]=0;vr(b+184|0,0,16);return}function fz(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+144|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+148|0;c[l>>2]=j;m=e+28|0;n=b+152|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+160|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+168>>2]=s;t=+g[i+120>>2];g[b+172>>2]=t;u=+g[e+128>>2];g[b+176>>2]=u;v=+g[i+128>>2];g[b+180>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;m=c[e+4>>2]|0;w=(c[k>>2]=c[e>>2]|0,+g[k>>2]);x=(c[k>>2]=m,+g[k>>2]);y=+g[i+(f*12&-1)+8>>2];m=d+28|0;e=c[m>>2]|0;n=e+(f*12&-1)|0;z=c[n+4>>2]|0;A=(c[k>>2]=c[n>>2]|0,+g[k>>2]);B=(c[k>>2]=z,+g[k>>2]);C=+g[e+(f*12&-1)+8>>2];z=i+(j*12&-1)|0;n=c[z+4>>2]|0;D=(c[k>>2]=c[z>>2]|0,+g[k>>2]);E=(c[k>>2]=n,+g[k>>2]);F=+g[i+(j*12&-1)+8>>2];i=e+(j*12&-1)|0;n=c[i+4>>2]|0;G=(c[k>>2]=c[i>>2]|0,+g[k>>2]);H=(c[k>>2]=n,+g[k>>2]);I=+g[e+(j*12&-1)+8>>2];J=+T(+y);K=+S(+y);y=+T(+F);L=+S(+F);F=+g[b+68>>2];M=F-(c[k>>2]=o,+g[k>>2]);F=+g[b+72>>2];N=F-(c[k>>2]=p,+g[k>>2]);F=K*M-J*N;O=J*M+K*N;N=+g[b+76>>2];M=N-(c[k>>2]=q,+g[k>>2]);N=+g[b+80>>2];P=N-(c[k>>2]=r,+g[k>>2]);N=L*M-y*P;Q=y*M+L*P;P=D-w+N-F;w=E-x+Q-O;x=+g[b+84>>2];E=+g[b+88>>2];D=K*x-J*E;L=J*x+K*E;r=b+184|0;q=(g[k>>2]=D,c[k>>2]|0);p=(g[k>>2]=L,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=p;E=F+P;F=O+w;O=E*L-F*D;g[b+208>>2]=O;x=N*L-Q*D;g[b+212>>2]=x;M=s+t;y=u*O;R=v*x;U=M+O*y+x*R;if(U>0.0){V=1.0/U}else{V=U}g[b+252>>2]=V;V=+g[b+92>>2];W=+g[b+96>>2];X=K*V-J*W;Y=J*V+K*W;p=b+192|0;r=(g[k>>2]=X,c[k>>2]|0);q=(g[k>>2]=Y,c[k>>2]|0)|0;c[p>>2]=0|r;c[p+4>>2]=q;W=E*Y-F*X;g[b+200>>2]=W;F=N*Y-Q*X;g[b+204>>2]=F;Q=u*W;N=v*F;E=Q+N;K=Q*O+N*x;V=v+u;J=y+R;g[b+216>>2]=M+W*Q+F*N;g[b+220>>2]=E;g[b+224>>2]=K;g[b+228>>2]=E;g[b+232>>2]=V==0.0?1.0:V;g[b+236>>2]=J;g[b+240>>2]=K;g[b+244>>2]=J;g[b+248>>2]=U;do{if((a[b+136|0]&1)<<24>>24==0){c[b+140>>2]=0;g[b+112>>2]=0.0}else{U=P*D+w*L;J=+g[b+124>>2];K=+g[b+120>>2];V=J-K;if(V>0.0){Z=V}else{Z=-0.0-V}if(Z<.009999999776482582){c[b+140>>2]=3;break}if(U<=K){q=b+140|0;if((c[q>>2]|0)==1){break}c[q>>2]=1;g[b+112>>2]=0.0;break}q=b+140|0;if(U<J){c[q>>2]=0;g[b+112>>2]=0.0;break}if((c[q>>2]|0)==2){break}c[q>>2]=2;g[b+112>>2]=0.0}}while(0);if((a[b+137|0]&1)<<24>>24==0){g[b+116>>2]=0.0}q=b+104|0;if((a[d+20|0]&1)<<24>>24==0){vr(q|0,0,16);Z=C;w=I;P=G;J=H;U=A;K=B;p=c[m>>2]|0;r=p+(f*12&-1)|0;o=r;j=(g[k>>2]=U,c[k>>2]|0);e=(g[k>>2]=K,c[k>>2]|0);n=e;i=0;z=0;_=n;$=j;aa=0;ab=z|$;ac=_|aa;ad=o|0;c[ad>>2]=ab;ae=o+4|0;c[ae>>2]=ac;af=c[h>>2]|0;ag=c[m>>2]|0;ah=ag+(af*12&-1)+8|0;g[ah>>2]=Z;ai=c[l>>2]|0;aj=c[m>>2]|0;ak=aj+(ai*12&-1)|0;al=ak;am=(g[k>>2]=P,c[k>>2]|0);an=(g[k>>2]=J,c[k>>2]|0);ao=an;ap=0;aq=0;ar=ao;as=am;at=0;au=aq|as;av=ar|at;aw=al|0;c[aw>>2]=au;ax=al+4|0;c[ax>>2]=av;ay=c[l>>2]|0;az=c[m>>2]|0;aA=az+(ay*12&-1)+8|0;g[aA>>2]=w;return}else{aB=d+8|0;V=+g[aB>>2];d=q|0;E=V*+g[d>>2];g[d>>2]=E;d=b+108|0;N=V*+g[d>>2];g[d>>2]=N;d=b+112|0;Q=V*+g[d>>2];g[d>>2]=Q;d=b+116|0;V=+g[aB>>2]*+g[d>>2];g[d>>2]=V;M=V+Q;Q=E*X+D*M;D=E*Y+M*L;Z=C-u*(E*W+N+M*O);w=I+v*(N+E*F+M*x);P=G+t*Q;J=H+t*D;U=A-s*Q;K=B-s*D;p=c[m>>2]|0;r=p+(f*12&-1)|0;o=r;j=(g[k>>2]=U,c[k>>2]|0);e=(g[k>>2]=K,c[k>>2]|0);n=e;i=0;z=0;_=n;$=j;aa=0;ab=z|$;ac=_|aa;ad=o|0;c[ad>>2]=ab;ae=o+4|0;c[ae>>2]=ac;af=c[h>>2]|0;ag=c[m>>2]|0;ah=ag+(af*12&-1)+8|0;g[ah>>2]=Z;ai=c[l>>2]|0;aj=c[m>>2]|0;ak=aj+(ai*12&-1)|0;al=ak;am=(g[k>>2]=P,c[k>>2]|0);an=(g[k>>2]=J,c[k>>2]|0);ao=an;ap=0;aq=0;ar=ao;as=am;at=0;au=aq|as;av=ar|at;aw=al|0;c[aw>>2]=au;ax=al+4|0;c[ax>>2]=av;ay=c[l>>2]|0;az=c[m>>2]|0;aA=az+(ay*12&-1)+8|0;g[aA>>2]=w;return}}function fA(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0,am=0.0;e=i;i=i+32|0;f=e|0;h=e+16|0;j=b+144|0;l=c[j>>2]|0;m=d+28|0;n=c[m>>2]|0;o=n+(l*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[n+(l*12&-1)+8>>2];p=b+148|0;o=c[p>>2]|0;t=n+(o*12&-1)|0;u=c[t+4>>2]|0;v=(c[k>>2]=c[t>>2]|0,+g[k>>2]);w=(c[k>>2]=u,+g[k>>2]);x=+g[n+(o*12&-1)+8>>2];y=+g[b+168>>2];z=+g[b+172>>2];A=+g[b+176>>2];B=+g[b+180>>2];do{if((a[b+137|0]&1)<<24>>24==0){C=s;D=x;E=v;F=w;G=q;H=r}else{if((c[b+140>>2]|0)==3){C=s;D=x;E=v;F=w;G=q;H=r;break}I=+g[b+184>>2];J=+g[b+188>>2];K=+g[b+212>>2];L=+g[b+208>>2];o=b+116|0;M=+g[o>>2];N=+g[d>>2]*+g[b+128>>2];O=M+ +g[b+252>>2]*(+g[b+132>>2]-((v-q)*I+(w-r)*J+x*K-s*L));P=-0.0-N;Q=O<N?O:N;N=Q<P?P:Q;g[o>>2]=N;Q=N-M;M=I*Q;I=J*Q;C=s-A*L*Q;D=x+B*K*Q;E=v+z*M;F=w+z*I;G=q-y*M;H=r-y*I}}while(0);r=E-G;q=F-H;d=b+192|0;w=+g[d>>2];o=b+196|0;v=+g[o>>2];n=b+204|0;x=+g[n>>2];u=b+200|0;s=+g[u>>2];I=r*w+q*v+D*x-C*s;M=D-C;do{if((a[b+136|0]&1)<<24>>24==0){R=2813}else{t=b+140|0;if((c[t>>2]|0)==0){R=2813;break}S=b+184|0;T=b+188|0;U=b+212|0;V=b+208|0;W=b+104|0;Q=+g[W>>2];X=b+108|0;K=+g[X>>2];Y=b+112|0;L=+g[Y>>2];Z=b+216|0;J=-0.0-I;N=-0.0-M;P=-0.0-(r*+g[S>>2]+q*+g[T>>2]+D*+g[U>>2]-C*+g[V>>2]);g[h>>2]=J;g[h+4>>2]=N;g[h+8>>2]=P;c9(f,Z,h);_=f|0;g[W>>2]=+g[_>>2]+ +g[W>>2];$=f+4|0;g[X>>2]=+g[$>>2]+ +g[X>>2];aa=f+8|0;P=+g[aa>>2]+ +g[Y>>2];g[Y>>2]=P;ab=c[t>>2]|0;if((ab|0)==1){O=P>0.0?P:0.0;g[Y>>2]=O;ac=O}else if((ab|0)==2){O=P<0.0?P:0.0;g[Y>>2]=O;ac=O}else{ac=P}P=ac-L;L=J- +g[b+240>>2]*P;J=N-P*+g[b+244>>2];N=+g[Z>>2];O=+g[b+228>>2];ad=+g[b+220>>2];ae=+g[b+232>>2];af=N*ae-O*ad;if(af!=0.0){ag=1.0/af}else{ag=af}af=Q+(L*ae-O*J)*ag;O=K+(N*J-L*ad)*ag;g[W>>2]=af;g[X>>2]=O;ad=af-Q;Q=O-K;g[_>>2]=ad;g[$>>2]=Q;g[aa>>2]=P;ah=Q+ad*+g[n>>2]+P*+g[U>>2];ai=ad*+g[u>>2]+Q+P*+g[V>>2];aj=ad*+g[o>>2]+P*+g[T>>2];ak=ad*+g[d>>2]+P*+g[S>>2];al=c[j>>2]|0;break}}while(0);if((R|0)==2813){ag=-0.0-I;I=-0.0-M;M=+g[b+216>>2];ac=+g[b+228>>2];q=+g[b+220>>2];r=+g[b+232>>2];P=M*r-ac*q;if(P!=0.0){am=1.0/P}else{am=P}P=(r*ag-ac*I)*am;ac=(M*I-q*ag)*am;R=b+104|0;g[R>>2]=+g[R>>2]+P;R=b+108|0;g[R>>2]=ac+ +g[R>>2];ah=ac+P*x;ai=ac+P*s;aj=P*v;ak=P*w;al=l}l=(c[m>>2]|0)+(al*12&-1)|0;al=(g[k>>2]=G-y*ak,c[k>>2]|0);R=(g[k>>2]=H-y*aj,c[k>>2]|0)|0;c[l>>2]=0|al;c[l+4>>2]=R;g[(c[m>>2]|0)+((c[j>>2]|0)*12&-1)+8>>2]=C-A*ai;j=(c[m>>2]|0)+((c[p>>2]|0)*12&-1)|0;R=(g[k>>2]=E+z*ak,c[k>>2]|0);l=(g[k>>2]=F+z*aj,c[k>>2]|0)|0;c[j>>2]=0|R;c[j+4>>2]=l;g[(c[m>>2]|0)+((c[p>>2]|0)*12&-1)+8>>2]=D+B*ah;i=e;return}function fB(a){a=a|0;return}function fC(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fD(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fE(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0,f=0.0;d=+g[b+104>>2];e=+g[b+116>>2]+ +g[b+112>>2];f=(d*+g[b+196>>2]+e*+g[b+188>>2])*c;g[a>>2]=(d*+g[b+192>>2]+ +g[b+184>>2]*e)*c;g[a+4>>2]=f;return}function fF(a,b){a=a|0;b=+b;return+(+g[a+108>>2]*b)}function fG(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0;e=b+144|0;f=c[e>>2]|0;h=d+24|0;d=c[h>>2]|0;i=d+(f*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[d+(f*12&-1)+8>>2];f=b+148|0;j=c[f>>2]|0;o=d+(j*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[d+(j*12&-1)+8>>2];t=+T(+n);u=+S(+n);v=+T(+s);w=+S(+s);x=+g[b+168>>2];y=+g[b+172>>2];z=+g[b+176>>2];A=+g[b+180>>2];B=+g[b+68>>2]- +g[b+152>>2];C=+g[b+72>>2]- +g[b+156>>2];D=u*B-t*C;E=t*B+u*C;C=+g[b+76>>2]- +g[b+160>>2];B=+g[b+80>>2]- +g[b+164>>2];F=w*C-v*B;G=v*C+w*B;B=q+F-l-D;w=r+G-m-E;C=+g[b+84>>2];v=+g[b+88>>2];H=u*C-t*v;I=t*C+u*v;v=D+B;D=E+w;E=I*v-H*D;C=F*I-G*H;J=+g[b+92>>2];K=+g[b+96>>2];L=u*J-t*K;M=t*J+u*K;K=M*v-L*D;D=F*M-G*L;G=L*B+M*w;F=s-n- +g[b+100>>2];if(G>0.0){N=G}else{N=-0.0-G}if(F>0.0){O=F}else{O=-0.0-F}do{if((a[b+136|0]&1)<<24>>24==0){P=N;Q=0;R=0.0}else{v=H*B+I*w;u=+g[b+124>>2];J=+g[b+120>>2];t=u-J;if(t>0.0){U=t}else{U=-0.0-t}if(U<.009999999776482582){t=v<.20000000298023224?v:.20000000298023224;if(v>0.0){V=v}else{V=-0.0-v}P=N>V?N:V;Q=1;R=t<-.20000000298023224?-.20000000298023224:t;break}if(v<=J){t=v-J+.004999999888241291;W=t<0.0?t:0.0;t=J-v;P=N>t?N:t;Q=1;R=W<-.20000000298023224?-.20000000298023224:W;break}if(v<u){P=N;Q=0;R=0.0;break}W=v-u;u=W+-.004999999888241291;v=u<.20000000298023224?u:.20000000298023224;P=N>W?N:W;Q=1;R=v<0.0?0.0:v}}while(0);N=x+y;V=z*K;U=A*D;w=D*U+(N+K*V);B=U+V;if(Q){v=C*U+E*V;V=z+A;U=V==0.0?1.0:V;V=z*E;W=A*C;u=W+V;t=C*W+(N+E*V);V=-0.0-G;N=-0.0-F;W=-0.0-R;R=U*t-u*u;J=u*v-B*t;X=u*B-U*v;Y=v*X+(w*R+B*J);if(Y!=0.0){Z=1.0/Y}else{Z=Y}Y=u*V;_=(R*V+J*N+X*W)*Z;$=(v*(Y-v*N)+(w*(t*N-u*W)+B*(v*W-t*V)))*Z;aa=(v*(B*N-U*V)+(w*(U*W-u*N)+B*(Y-B*W)))*Z}else{Z=z+A;W=Z==0.0?1.0:Z;Z=-0.0-G;G=-0.0-F;F=W*w-B*B;if(F!=0.0){ab=1.0/F}else{ab=F}_=(W*Z-B*G)*ab;$=(w*G-B*Z)*ab;aa=0.0}ab=H*aa+L*_;L=I*aa+M*_;Q=(g[k>>2]=l-x*ab,c[k>>2]|0);b=(g[k>>2]=m-x*L,c[k>>2]|0)|0;c[i>>2]=0|Q;c[i+4>>2]=b;g[(c[h>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=n-z*(E*aa+($+K*_));e=(c[h>>2]|0)+((c[f>>2]|0)*12&-1)|0;b=(g[k>>2]=q+y*ab,c[k>>2]|0);i=(g[k>>2]=r+y*L,c[k>>2]|0)|0;c[e>>2]=0|b;c[e+4>>2]=i;g[(c[h>>2]|0)+((c[f>>2]|0)*12&-1)+8>>2]=s+A*(C*aa+($+D*_));if(P>.004999999888241291){ac=0;return ac|0}ac=O<=.03490658849477768;return ac|0}function fH(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;dc(8984,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(11336,(v=i,i=i+8|0,c[v>>2]=e,v)|0);dc(8808,(v=i,i=i+8|0,c[v>>2]=f,v)|0);dc(6768,(v=i,i=i+8|0,c[v>>2]=a[b+61|0]&1,v)|0);j=+g[b+72>>2];dc(5992,(v=i,i=i+16|0,h[v>>3]=+g[b+68>>2],h[v+8>>3]=j,v)|0);j=+g[b+80>>2];dc(5536,(v=i,i=i+16|0,h[v>>3]=+g[b+76>>2],h[v+8>>3]=j,v)|0);j=+g[b+88>>2];dc(5032,(v=i,i=i+16|0,h[v>>3]=+g[b+84>>2],h[v+8>>3]=j,v)|0);dc(5072,(v=i,i=i+8|0,h[v>>3]=+g[b+100>>2],v)|0);dc(4264,(v=i,i=i+8|0,c[v>>2]=a[b+136|0]&1,v)|0);dc(12568,(v=i,i=i+8|0,h[v>>3]=+g[b+120>>2],v)|0);dc(11984,(v=i,i=i+8|0,h[v>>3]=+g[b+124>>2],v)|0);dc(4760,(v=i,i=i+8|0,c[v>>2]=a[b+137|0]&1,v)|0);dc(4488,(v=i,i=i+8|0,h[v>>3]=+g[b+132>>2],v)|0);dc(11064,(v=i,i=i+8|0,h[v>>3]=+g[b+128>>2],v)|0);dc(11904,(v=i,i=i+8|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function fI(a){a=a|0;vl(a);return}function fJ(a,b,d,e,f,h,i,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;i=i|0;j=+j;var l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0;c[a+8>>2]=b;c[a+12>>2]=d;l=e;m=a+20|0;n=c[l+4>>2]|0;c[m>>2]=c[l>>2]|0;c[m+4>>2]=n;n=f;m=a+28|0;l=c[n+4>>2]|0;c[m>>2]=c[n>>2]|0;c[m+4>>2]=l;l=h|0;o=+g[l>>2]- +g[b+12>>2];m=h+4|0;p=+g[m>>2]- +g[b+16>>2];q=+g[b+24>>2];r=+g[b+20>>2];b=a+36|0;h=(g[k>>2]=o*q+p*r,c[k>>2]|0);n=(g[k>>2]=q*p+o*(-0.0-r),c[k>>2]|0)|0;c[b>>2]=0|h;c[b+4>>2]=n;n=i|0;r=+g[n>>2]- +g[d+12>>2];b=i+4|0;o=+g[b>>2]- +g[d+16>>2];p=+g[d+24>>2];q=+g[d+20>>2];d=a+44|0;i=(g[k>>2]=r*p+o*q,c[k>>2]|0);h=(g[k>>2]=p*o+r*(-0.0-q),c[k>>2]|0)|0;c[d>>2]=0|i;c[d+4>>2]=h;q=+g[l>>2]- +g[e>>2];r=+g[m>>2]- +g[e+4>>2];g[a+52>>2]=+Q(+(q*q+r*r));r=+g[n>>2]- +g[f>>2];q=+g[b>>2]- +g[f+4>>2];g[a+56>>2]=+Q(+(r*r+q*q));g[a+60>>2]=j;if(j>1.1920928955078125e-7){return}else{bd(6632,51,17120,11480)}}function fK(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0.0;e=b|0;c[e>>2]=19312;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){bd(7272,173,15744,9072)}c[b+4>>2]=c[d>>2]|0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[f>>2]|0;c[b+52>>2]=c[h>>2]|0;c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2]|0;vr(b+16|0,0,32);c[e>>2]=20080;e=d+20|0;h=b+68|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2]|0;c[h+4>>2]=f;f=d+28|0;h=b+76|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=e;e=d+36|0;h=b+92|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2]|0;c[h+4>>2]=f;f=d+44|0;h=b+100|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=e;e=d+52|0;g[b+84>>2]=+g[e>>2];h=d+56|0;g[b+88>>2]=+g[h>>2];i=+g[d+60>>2];if(i!=0.0){g[b+112>>2]=i;g[b+108>>2]=+g[e>>2]+i*+g[h>>2];g[b+116>>2]=0.0;return}else{bd(6632,65,17984,8960)}}function fL(a,b){a=a|0;b=+b;return+0.0}function fM(a){a=a|0;return}function fN(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0;d=a+120|0;e=c[d>>2]|0;f=b+28|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];i=a+124|0;h=c[i>>2]|0;n=b+(h*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(h*12&-1)+8>>2];s=+g[a+148>>2];t=+g[a+144>>2];u=+g[a+156>>2];v=+g[a+152>>2];w=+g[a+128>>2];x=+g[a+132>>2];y=+g[a+112>>2];z=+g[a+136>>2];A=+g[a+140>>2];B=(-0.0-((j+s*(-0.0-m))*w+(l+m*t)*x)-y*((p+u*(-0.0-r))*z+(q+r*v)*A))*(-0.0- +g[a+192>>2]);h=a+116|0;g[h>>2]=+g[h>>2]+B;C=-0.0-B;D=w*C;w=x*C;C=B*(-0.0-y);y=z*C;z=A*C;C=+g[a+176>>2];A=m+ +g[a+184>>2]*(w*t-D*s);s=+g[a+180>>2];t=r+ +g[a+188>>2]*(z*v-y*u);a=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=j+D*C,c[k>>2]|0);h=(g[k>>2]=l+w*C,c[k>>2]|0)|0;c[a>>2]=0|e;c[a+4>>2]=h;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=A;d=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;h=(g[k>>2]=p+y*s,c[k>>2]|0);a=(g[k>>2]=q+z*s,c[k>>2]|0)|0;c[d>>2]=0|h;c[d+4>>2]=a;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=t;return}function fO(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+92>>2];h=+g[d+20>>2];i=+g[b+96>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fP(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+100>>2];h=+g[d+20>>2];i=+g[b+104>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fQ(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0;d=+g[b+116>>2];e=d*+g[b+140>>2]*c;g[a>>2]=d*+g[b+136>>2]*c;g[a+4>>2]=e;return}function fR(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+120|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+124|0;c[l>>2]=j;m=e+28|0;n=b+160|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+168|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+176>>2]=s;t=+g[i+120>>2];g[b+180>>2]=t;u=+g[e+128>>2];g[b+184>>2]=u;v=+g[i+128>>2];g[b+188>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;m=c[e+4>>2]|0;w=(c[k>>2]=c[e>>2]|0,+g[k>>2]);x=(c[k>>2]=m,+g[k>>2]);y=+g[i+(f*12&-1)+8>>2];m=d+28|0;e=c[m>>2]|0;n=e+(f*12&-1)|0;z=c[n+4>>2]|0;A=(c[k>>2]=c[n>>2]|0,+g[k>>2]);B=(c[k>>2]=z,+g[k>>2]);C=+g[e+(f*12&-1)+8>>2];z=i+(j*12&-1)|0;n=c[z+4>>2]|0;D=(c[k>>2]=c[z>>2]|0,+g[k>>2]);E=(c[k>>2]=n,+g[k>>2]);F=+g[i+(j*12&-1)+8>>2];i=e+(j*12&-1)|0;n=c[i+4>>2]|0;G=(c[k>>2]=c[i>>2]|0,+g[k>>2]);H=(c[k>>2]=n,+g[k>>2]);I=+g[e+(j*12&-1)+8>>2];J=+T(+y);K=+S(+y);y=+T(+F);L=+S(+F);F=+g[b+92>>2];M=F-(c[k>>2]=o,+g[k>>2]);F=+g[b+96>>2];N=F-(c[k>>2]=p,+g[k>>2]);F=K*M-J*N;O=J*M+K*N;p=b+144|0;o=(g[k>>2]=F,c[k>>2]|0);j=(g[k>>2]=O,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;N=+g[b+100>>2];K=N-(c[k>>2]=q,+g[k>>2]);N=+g[b+104>>2];M=N-(c[k>>2]=r,+g[k>>2]);N=L*K-y*M;J=y*K+L*M;r=b+152|0;q=(g[k>>2]=N,c[k>>2]|0);j=(g[k>>2]=J,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;j=b+128|0;M=w+F- +g[b+68>>2];w=x+O- +g[b+72>>2];r=j;q=(g[k>>2]=M,c[k>>2]|0);p=(g[k>>2]=w,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=p;p=b+136|0;x=D+N- +g[b+76>>2];D=E+J- +g[b+80>>2];r=p;q=(g[k>>2]=x,c[k>>2]|0);o=(g[k>>2]=D,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=o;o=j|0;E=+Q(+(M*M+w*w));j=p|0;L=+Q(+(x*x+D*D));if(E>.04999999701976776){K=1.0/E;E=M*K;g[o>>2]=E;P=K*w;R=E}else{g[o>>2]=0.0;P=0.0;R=0.0}g[b+132>>2]=P;if(L>.04999999701976776){E=1.0/L;L=E*x;g[j>>2]=L;U=E*D;V=L}else{g[j>>2]=0.0;U=0.0;V=0.0}g[b+140>>2]=U;L=F*P-O*R;D=N*U-J*V;E=+g[b+112>>2];x=s+L*L*u+E*E*(t+D*D*v);if(x>0.0){W=1.0/x}else{W=x}g[b+192>>2]=W;if((a[d+20|0]&1)<<24>>24==0){g[b+116>>2]=0.0;W=C;x=I;D=G;L=H;w=A;K=B;j=c[m>>2]|0;o=j+(f*12&-1)|0;p=o;r=(g[k>>2]=w,c[k>>2]|0);q=(g[k>>2]=K,c[k>>2]|0);e=q;n=0;i=0;z=e;X=r;Y=0;Z=i|X;_=z|Y;$=p|0;c[$>>2]=Z;aa=p+4|0;c[aa>>2]=_;ab=c[h>>2]|0;ac=c[m>>2]|0;ad=ac+(ab*12&-1)+8|0;g[ad>>2]=W;ae=c[l>>2]|0;af=c[m>>2]|0;ag=af+(ae*12&-1)|0;ah=ag;ai=(g[k>>2]=D,c[k>>2]|0);aj=(g[k>>2]=L,c[k>>2]|0);ak=aj;al=0;am=0;an=ak;ao=ai;ap=0;aq=am|ao;ar=an|ap;as=ah|0;c[as>>2]=aq;at=ah+4|0;c[at>>2]=ar;au=c[l>>2]|0;av=c[m>>2]|0;aw=av+(au*12&-1)+8|0;g[aw>>2]=x;return}else{ax=b+116|0;M=+g[d+8>>2]*+g[ax>>2];g[ax>>2]=M;y=-0.0-M;ay=R*y;R=P*y;y=M*(-0.0-E);E=V*y;V=U*y;W=C+u*(R*F-ay*O);x=I+v*(V*N-E*J);D=G+E*t;L=H+V*t;w=A+ay*s;K=B+R*s;j=c[m>>2]|0;o=j+(f*12&-1)|0;p=o;r=(g[k>>2]=w,c[k>>2]|0);q=(g[k>>2]=K,c[k>>2]|0);e=q;n=0;i=0;z=e;X=r;Y=0;Z=i|X;_=z|Y;$=p|0;c[$>>2]=Z;aa=p+4|0;c[aa>>2]=_;ab=c[h>>2]|0;ac=c[m>>2]|0;ad=ac+(ab*12&-1)+8|0;g[ad>>2]=W;ae=c[l>>2]|0;af=c[m>>2]|0;ag=af+(ae*12&-1)|0;ah=ag;ai=(g[k>>2]=D,c[k>>2]|0);aj=(g[k>>2]=L,c[k>>2]|0);ak=aj;al=0;am=0;an=ak;ao=ai;ap=0;aq=am|ao;ar=an|ap;as=ah|0;c[as>>2]=aq;at=ah+4|0;c[at>>2]=ar;au=c[l>>2]|0;av=c[m>>2]|0;aw=av+(au*12&-1)+8|0;g[aw>>2]=x;return}}function fS(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0;d=a+120|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];e=a+124|0;i=c[e>>2]|0;n=b+(i*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(i*12&-1)+8>>2];s=+T(+m);t=+S(+m);u=+T(+r);v=+S(+r);w=+g[a+92>>2]- +g[a+160>>2];x=+g[a+96>>2]- +g[a+164>>2];y=t*w-s*x;z=s*w+t*x;x=+g[a+100>>2]- +g[a+168>>2];t=+g[a+104>>2]- +g[a+172>>2];w=v*x-u*t;s=u*x+v*t;t=j+y- +g[a+68>>2];v=l+z- +g[a+72>>2];x=p+w- +g[a+76>>2];u=q+s- +g[a+80>>2];A=+Q(+(t*t+v*v));B=+Q(+(x*x+u*u));if(A>.04999999701976776){C=1.0/A;D=t*C;E=v*C}else{D=0.0;E=0.0}if(B>.04999999701976776){C=1.0/B;F=x*C;G=u*C}else{F=0.0;G=0.0}C=y*E-z*D;u=w*G-s*F;x=+g[a+176>>2];v=+g[a+184>>2];t=+g[a+180>>2];H=+g[a+188>>2];I=+g[a+112>>2];J=x+C*C*v+I*I*(t+u*u*H);if(J>0.0){K=1.0/J}else{K=J}J=+g[a+108>>2]-A-B*I;if(J>0.0){L=J}else{L=-0.0-J}B=J*(-0.0-K);K=-0.0-B;J=D*K;D=E*K;K=B*(-0.0-I);I=F*K;F=G*K;a=(g[k>>2]=j+J*x,c[k>>2]|0);i=(g[k>>2]=l+D*x,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=i;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=m+(y*D-z*J)*v;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;i=(g[k>>2]=p+I*t,c[k>>2]|0);h=(g[k>>2]=q+F*t,c[k>>2]|0)|0;c[d>>2]=0|i;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=r+H*(w*F-s*I);return L<.004999999888241291|0}function fT(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;dc(6808,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(11336,(v=i,i=i+8|0,c[v>>2]=e,v)|0);dc(8808,(v=i,i=i+8|0,c[v>>2]=f,v)|0);dc(6768,(v=i,i=i+8|0,c[v>>2]=a[b+61|0]&1,v)|0);j=+g[b+72>>2];dc(4792,(v=i,i=i+16|0,h[v>>3]=+g[b+68>>2],h[v+8>>3]=j,v)|0);j=+g[b+80>>2];dc(4520,(v=i,i=i+16|0,h[v>>3]=+g[b+76>>2],h[v+8>>3]=j,v)|0);j=+g[b+96>>2];dc(5992,(v=i,i=i+16|0,h[v>>3]=+g[b+92>>2],h[v+8>>3]=j,v)|0);j=+g[b+104>>2];dc(5536,(v=i,i=i+16|0,h[v>>3]=+g[b+100>>2],h[v+8>>3]=j,v)|0);dc(12536,(v=i,i=i+8|0,h[v>>3]=+g[b+84>>2],v)|0);dc(11952,(v=i,i=i+8|0,h[v>>3]=+g[b+88>>2],v)|0);dc(11504,(v=i,i=i+8|0,h[v>>3]=+g[b+112>>2],v)|0);dc(11904,(v=i,i=i+8|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function fU(a){a=a|0;vl(a);return}function fV(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0,R=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+128|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+132|0;c[l>>2]=j;m=e+28|0;n=b+152|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+160|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+168>>2]=s;t=+g[i+120>>2];g[b+172>>2]=t;u=+g[e+128>>2];g[b+176>>2]=u;v=+g[i+128>>2];g[b+180>>2]=v;i=c[d+24>>2]|0;w=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;x=c[n+4>>2]|0;y=(c[k>>2]=c[n>>2]|0,+g[k>>2]);z=(c[k>>2]=x,+g[k>>2]);A=+g[m+(f*12&-1)+8>>2];B=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;x=c[i+4>>2]|0;C=(c[k>>2]=c[i>>2]|0,+g[k>>2]);D=(c[k>>2]=x,+g[k>>2]);E=+g[m+(j*12&-1)+8>>2];F=+T(+w);G=+S(+w);H=+T(+B);I=+S(+B);J=+g[b+68>>2];K=J-(c[k>>2]=o,+g[k>>2]);J=+g[b+72>>2];L=J-(c[k>>2]=p,+g[k>>2]);J=G*K-F*L;M=F*K+G*L;p=b+136|0;o=(g[k>>2]=J,c[k>>2]|0);j=(g[k>>2]=M,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;L=+g[b+76>>2];G=L-(c[k>>2]=q,+g[k>>2]);L=+g[b+80>>2];K=L-(c[k>>2]=r,+g[k>>2]);L=I*G-H*K;F=H*G+I*K;r=b+144|0;q=(g[k>>2]=L,c[k>>2]|0);j=(g[k>>2]=F,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;K=u+v;j=K==0.0;I=s+t;g[b+184>>2]=I+u*M*M+v*F*F;G=-0.0-M;H=u*J*G-v*F*L;g[b+196>>2]=H;N=u*G-v*F;g[b+208>>2]=N;g[b+188>>2]=H;g[b+200>>2]=I+u*J*J+v*L*L;I=u*J+v*L;g[b+212>>2]=I;g[b+192>>2]=N;g[b+204>>2]=I;g[b+216>>2]=K;if(K>0.0){O=1.0/K}else{O=K}g[b+220>>2]=O;if((a[b+100|0]&1)<<24>>24==0|j){g[b+96>>2]=0.0}do{if((a[b+112|0]&1)<<24>>24==0|j){c[b+224>>2]=0}else{O=B-w- +g[b+116>>2];K=+g[b+124>>2];I=+g[b+120>>2];N=K-I;if(N>0.0){P=N}else{P=-0.0-N}if(P<.06981317698955536){c[b+224>>2]=3;break}if(O<=I){r=b+224|0;if((c[r>>2]|0)!=1){g[b+92>>2]=0.0}c[r>>2]=1;break}r=b+224|0;if(O<K){c[r>>2]=0;g[b+92>>2]=0.0;break}if((c[r>>2]|0)!=2){g[b+92>>2]=0.0}c[r>>2]=2}}while(0);j=b+84|0;if((a[d+20|0]&1)<<24>>24==0){vr(j|0,0,16);P=A;w=E;B=C;K=D;O=y;I=z;r=c[e>>2]|0;q=r+(f*12&-1)|0;p=q;o=(g[k>>2]=O,c[k>>2]|0);m=(g[k>>2]=I,c[k>>2]|0);x=m;i=0;n=0;Q=x;R=o;U=0;V=n|R;W=Q|U;X=p|0;c[X>>2]=V;Y=p+4|0;c[Y>>2]=W;Z=c[h>>2]|0;_=c[e>>2]|0;$=_+(Z*12&-1)+8|0;g[$>>2]=P;aa=c[l>>2]|0;ab=c[e>>2]|0;ac=ab+(aa*12&-1)|0;ad=ac;ae=(g[k>>2]=B,c[k>>2]|0);af=(g[k>>2]=K,c[k>>2]|0);ag=af;ah=0;ai=0;aj=ag;ak=ae;al=0;am=ai|ak;an=aj|al;ao=ad|0;c[ao>>2]=am;ap=ad+4|0;c[ap>>2]=an;aq=c[l>>2]|0;ar=c[e>>2]|0;as=ar+(aq*12&-1)+8|0;g[as>>2]=w;return}else{at=d+8|0;N=+g[at>>2];d=j|0;H=N*+g[d>>2];g[d>>2]=H;d=b+88|0;G=N*+g[d>>2];g[d>>2]=G;d=b+92|0;au=N*+g[d>>2];g[d>>2]=au;d=b+96|0;N=+g[at>>2]*+g[d>>2];g[d>>2]=N;P=A-u*(au+(N+(G*J-H*M)));w=E+v*(au+(N+(G*L-H*F)));B=C+t*H;K=D+t*G;O=y-s*H;I=z-s*G;r=c[e>>2]|0;q=r+(f*12&-1)|0;p=q;o=(g[k>>2]=O,c[k>>2]|0);m=(g[k>>2]=I,c[k>>2]|0);x=m;i=0;n=0;Q=x;R=o;U=0;V=n|R;W=Q|U;X=p|0;c[X>>2]=V;Y=p+4|0;c[Y>>2]=W;Z=c[h>>2]|0;_=c[e>>2]|0;$=_+(Z*12&-1)+8|0;g[$>>2]=P;aa=c[l>>2]|0;ab=c[e>>2]|0;ac=ab+(aa*12&-1)|0;ad=ac;ae=(g[k>>2]=B,c[k>>2]|0);af=(g[k>>2]=K,c[k>>2]|0);ag=af;ah=0;ai=0;aj=ag;ak=ae;al=0;am=ai|ak;an=aj|al;ao=ad|0;c[ao>>2]=am;ap=ad+4|0;c[ap>>2]=an;aq=c[l>>2]|0;ar=c[e>>2]|0;as=ar+(aq*12&-1)+8|0;g[as>>2]=w;return}}function fW(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0,K=0,L=0,M=0.0,N=0,O=0,P=0.0,Q=0.0,R=0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0,ag=0.0;e=i;i=i+32|0;f=e|0;h=e+16|0;j=b+128|0;l=c[j>>2]|0;m=d+28|0;n=c[m>>2]|0;o=n+(l*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[n+(l*12&-1)+8>>2];p=b+132|0;o=c[p>>2]|0;t=n+(o*12&-1)|0;u=c[t+4>>2]|0;v=(c[k>>2]=c[t>>2]|0,+g[k>>2]);w=(c[k>>2]=u,+g[k>>2]);x=+g[n+(o*12&-1)+8>>2];y=+g[b+168>>2];z=+g[b+172>>2];A=+g[b+176>>2];B=+g[b+180>>2];o=A+B==0.0;do{if((a[b+100|0]&1)<<24>>24==0){C=s;D=x}else{if((c[b+224>>2]|0)==3|o){C=s;D=x;break}n=b+96|0;E=+g[n>>2];F=+g[d>>2]*+g[b+104>>2];G=E+(x-s- +g[b+108>>2])*(-0.0- +g[b+220>>2]);H=-0.0-F;I=G<F?G:F;F=I<H?H:I;g[n>>2]=F;I=F-E;C=s-A*I;D=x+B*I}}while(0);do{if((a[b+112|0]&1)<<24>>24==0){J=75}else{d=b+224|0;if((c[d>>2]|0)==0|o){J=75;break}n=b+148|0;u=b+144|0;t=b+140|0;K=b+136|0;x=v+ +g[n>>2]*(-0.0-D)-q- +g[t>>2]*(-0.0-C);s=w+D*+g[u>>2]-r-C*+g[K>>2];g[f>>2]=x;g[f+4>>2]=s;g[f+8>>2]=D-C;L=b+184|0;c9(h,L,f);I=+g[h>>2];E=-0.0-I;F=+g[h+4>>2];H=-0.0-F;G=+g[h+8>>2];M=-0.0-G;N=c[d>>2]|0;do{if((N|0)==2){d=b+84|0;O=b+92|0;P=+g[O>>2];Q=P-G;if(Q<=0.0){R=d|0;g[R>>2]=+g[R>>2]-I;R=b+88|0;g[R>>2]=+g[R>>2]-F;g[O>>2]=Q;S=E;T=H;U=M;break}Q=P*+g[b+208>>2]-x;V=P*+g[b+212>>2]-s;W=+g[L>>2];X=+g[b+196>>2];Y=+g[b+188>>2];Z=+g[b+200>>2];_=W*Z-X*Y;if(_!=0.0){$=1.0/_}else{$=_}_=(Q*Z-X*V)*$;X=(W*V-Q*Y)*$;R=d|0;g[R>>2]=_+ +g[R>>2];R=b+88|0;g[R>>2]=X+ +g[R>>2];g[O>>2]=0.0;S=_;T=X;U=-0.0-P}else if((N|0)==3){O=b+84|0;g[O>>2]=+g[O>>2]-I;O=b+88|0;g[O>>2]=+g[O>>2]-F;O=b+92|0;g[O>>2]=+g[O>>2]-G;S=E;T=H;U=M}else if((N|0)==1){O=b+84|0;R=b+92|0;P=+g[R>>2];X=P-G;if(X>=0.0){d=O|0;g[d>>2]=+g[d>>2]-I;d=b+88|0;g[d>>2]=+g[d>>2]-F;g[R>>2]=X;S=E;T=H;U=M;break}X=P*+g[b+208>>2]-x;_=P*+g[b+212>>2]-s;Y=+g[L>>2];Q=+g[b+196>>2];V=+g[b+188>>2];W=+g[b+200>>2];Z=Y*W-Q*V;if(Z!=0.0){aa=1.0/Z}else{aa=Z}Z=(X*W-Q*_)*aa;Q=(Y*_-X*V)*aa;d=O|0;g[d>>2]=Z+ +g[d>>2];d=b+88|0;g[d>>2]=Q+ +g[d>>2];g[R>>2]=0.0;S=Z;T=Q;U=-0.0-P}else{S=E;T=H;U=M}}while(0);ab=U+(T*+g[K>>2]-S*+g[t>>2]);ac=U+(T*+g[u>>2]-S*+g[n>>2]);ad=S;ae=T;af=c[j>>2]|0;break}}while(0);if((J|0)==75){T=+g[b+148>>2];S=+g[b+144>>2];U=+g[b+140>>2];aa=+g[b+136>>2];$=-0.0-(v+T*(-0.0-D)-q-U*(-0.0-C));M=-0.0-(w+D*S-r-C*aa);H=+g[b+184>>2];E=+g[b+196>>2];s=+g[b+188>>2];x=+g[b+200>>2];F=H*x-E*s;if(F!=0.0){ag=1.0/F}else{ag=F}F=(x*$-E*M)*ag;E=(H*M-s*$)*ag;J=b+84|0;g[J>>2]=+g[J>>2]+F;J=b+88|0;g[J>>2]=E+ +g[J>>2];ab=E*aa-F*U;ac=E*S-F*T;ad=F;ae=E;af=l}l=(c[m>>2]|0)+(af*12&-1)|0;af=(g[k>>2]=q-y*ad,c[k>>2]|0);J=(g[k>>2]=r-y*ae,c[k>>2]|0)|0;c[l>>2]=0|af;c[l+4>>2]=J;g[(c[m>>2]|0)+((c[j>>2]|0)*12&-1)+8>>2]=C-A*ab;j=(c[m>>2]|0)+((c[p>>2]|0)*12&-1)|0;J=(g[k>>2]=v+z*ad,c[k>>2]|0);l=(g[k>>2]=w+z*ae,c[k>>2]|0)|0;c[j>>2]=0|J;c[j+4>>2]=l;g[(c[m>>2]|0)+((c[p>>2]|0)*12&-1)+8>>2]=D+B*ac;i=e;return}function fX(a){a=a|0;return}function fY(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fZ(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function f_(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+88>>2]*c;g[a>>2]=+g[b+84>>2]*c;g[a+4>>2]=d;return}function f$(a,b){a=a|0;b=+b;return+(+g[a+92>>2]*b)}function f0(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0;d=a+96|0;e=c[d>>2]|0;f=b+28|0;h=c[f>>2]|0;i=h+(e*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[h+(e*12&-1)+8>>2];j=a+100|0;i=c[j>>2]|0;o=h+(i*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[h+(i*12&-1)+8>>2];t=+g[a+116>>2];u=+g[a+112>>2];v=+g[a+124>>2];w=+g[a+120>>2];x=+g[a+88>>2]- +g[a+84>>2];y=+g[a+104>>2];z=+g[a+108>>2];A=(q+v*(-0.0-s)-(l+t*(-0.0-n)))*y+(r+s*w-(m+n*u))*z;if(x<0.0){B=A+x*+g[b+4>>2]}else{B=A}b=a+92|0;A=+g[b>>2];x=A+B*(-0.0- +g[a+160>>2]);B=x>0.0?0.0:x;g[b>>2]=B;x=B-A;A=y*x;y=z*x;x=+g[a+144>>2];z=n- +g[a+152>>2]*(u*y-t*A);t=+g[a+148>>2];u=s+ +g[a+156>>2]*(y*w-A*v);a=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=l-x*A,c[k>>2]|0);b=(g[k>>2]=m-x*y,c[k>>2]|0)|0;c[a>>2]=0|e;c[a+4>>2]=b;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=z;d=(c[f>>2]|0)+((c[j>>2]|0)*12&-1)|0;b=(g[k>>2]=q+A*t,c[k>>2]|0);a=(g[k>>2]=r+y*t,c[k>>2]|0)|0;c[d>>2]=0|b;c[d+4>>2]=a;g[(c[f>>2]|0)+((c[j>>2]|0)*12&-1)+8>>2]=u;return}function f1(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0;e=b+128|0;f=c[e>>2]|0;h=d+24|0;d=c[h>>2]|0;i=d+(f*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[d+(f*12&-1)+8>>2];f=b+132|0;j=c[f>>2]|0;o=d+(j*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[d+(j*12&-1)+8>>2];j=b+176|0;d=b+180|0;do{if((a[b+112|0]&1)<<24>>24==0){t=n;u=s;v=0.0;w=+g[j>>2];x=+g[d>>2]}else{y=+g[d>>2];z=+g[j>>2];p=c[b+224>>2]|0;if((p|0)==0|y+z==0.0){t=n;u=s;v=0.0;w=z;x=y;break}A=s-n- +g[b+116>>2];do{if((p|0)==2){B=A- +g[b+124>>2];C=B+-.03490658849477768;D=C<.13962635397911072?C:.13962635397911072;E=B;F=(D<0.0?0.0:D)*(-0.0- +g[b+220>>2])}else if((p|0)==3){D=A- +g[b+120>>2];B=D<.13962635397911072?D:.13962635397911072;D=B<-.13962635397911072?-.13962635397911072:B;B=D*(-0.0- +g[b+220>>2]);if(D>0.0){E=D;F=B;break}E=-0.0-D;F=B}else if((p|0)==1){B=A- +g[b+120>>2];D=B+.03490658849477768;C=D<0.0?D:0.0;E=-0.0-B;F=(C<-.13962635397911072?-.13962635397911072:C)*(-0.0- +g[b+220>>2])}else{E=0.0;F=0.0}}while(0);t=n-F*z;u=s+F*y;v=E;w=z;x=y}}while(0);E=+T(+t);F=+S(+t);s=+T(+u);n=+S(+u);A=+g[b+68>>2]- +g[b+152>>2];C=+g[b+72>>2]- +g[b+156>>2];B=F*A-E*C;D=E*A+F*C;C=+g[b+76>>2]- +g[b+160>>2];F=+g[b+80>>2]- +g[b+164>>2];A=n*C-s*F;E=s*C+n*F;F=q+A-l-B;n=r+E-m-D;C=+Q(+(F*F+n*n));s=+g[b+168>>2];G=+g[b+172>>2];H=s+G;I=H+D*D*w+E*E*x;J=A*x;K=D*B*(-0.0-w)-E*J;L=H+B*B*w+A*J;J=I*L-K*K;if(J!=0.0){M=1.0/J}else{M=J}J=-0.0-(F*L-n*K)*M;L=-0.0-(n*I-F*K)*M;b=(g[k>>2]=l-s*J,c[k>>2]|0);j=(g[k>>2]=m-s*L,c[k>>2]|0)|0;c[i>>2]=0|b;c[i+4>>2]=j;g[(c[h>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=t-w*(B*L-D*J);e=(c[h>>2]|0)+((c[f>>2]|0)*12&-1)|0;j=(g[k>>2]=q+G*J,c[k>>2]|0);i=(g[k>>2]=r+G*L,c[k>>2]|0)|0;c[e>>2]=0|j;c[e+4>>2]=i;g[(c[h>>2]|0)+((c[f>>2]|0)*12&-1)+8>>2]=u+x*(A*L-E*J);if(C>.004999999888241291){N=0;return N|0}N=v<=.03490658849477768;return N|0}function f2(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;dc(8928,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(11336,(v=i,i=i+8|0,c[v>>2]=e,v)|0);dc(8808,(v=i,i=i+8|0,c[v>>2]=f,v)|0);dc(6768,(v=i,i=i+8|0,c[v>>2]=a[b+61|0]&1,v)|0);j=+g[b+72>>2];dc(5992,(v=i,i=i+16|0,h[v>>3]=+g[b+68>>2],h[v+8>>3]=j,v)|0);j=+g[b+80>>2];dc(5536,(v=i,i=i+16|0,h[v>>3]=+g[b+76>>2],h[v+8>>3]=j,v)|0);dc(5072,(v=i,i=i+8|0,h[v>>3]=+g[b+116>>2],v)|0);dc(4264,(v=i,i=i+8|0,c[v>>2]=a[b+112|0]&1,v)|0);dc(12800,(v=i,i=i+8|0,h[v>>3]=+g[b+120>>2],v)|0);dc(12504,(v=i,i=i+8|0,h[v>>3]=+g[b+124>>2],v)|0);dc(4760,(v=i,i=i+8|0,c[v>>2]=a[b+100|0]&1,v)|0);dc(4488,(v=i,i=i+8|0,h[v>>3]=+g[b+108>>2],v)|0);dc(4232,(v=i,i=i+8|0,h[v>>3]=+g[b+104>>2],v)|0);dc(11904,(v=i,i=i+8|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function f3(a){a=a|0;vl(a);return}function f4(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+96|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+100|0;c[l>>2]=j;m=e+28|0;n=b+128|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+136|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+144>>2]=s;t=+g[i+120>>2];g[b+148>>2]=t;u=+g[e+128>>2];g[b+152>>2]=u;v=+g[i+128>>2];g[b+156>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;m=c[e+4>>2]|0;w=(c[k>>2]=c[e>>2]|0,+g[k>>2]);x=(c[k>>2]=m,+g[k>>2]);y=+g[i+(f*12&-1)+8>>2];m=d+28|0;e=c[m>>2]|0;n=e+(f*12&-1)|0;z=c[n+4>>2]|0;A=(c[k>>2]=c[n>>2]|0,+g[k>>2]);B=(c[k>>2]=z,+g[k>>2]);C=+g[e+(f*12&-1)+8>>2];z=i+(j*12&-1)|0;n=c[z+4>>2]|0;D=(c[k>>2]=c[z>>2]|0,+g[k>>2]);E=(c[k>>2]=n,+g[k>>2]);F=+g[i+(j*12&-1)+8>>2];i=e+(j*12&-1)|0;n=c[i+4>>2]|0;G=(c[k>>2]=c[i>>2]|0,+g[k>>2]);H=(c[k>>2]=n,+g[k>>2]);I=+g[e+(j*12&-1)+8>>2];J=+T(+y);K=+S(+y);y=+T(+F);L=+S(+F);F=+g[b+68>>2];M=F-(c[k>>2]=o,+g[k>>2]);F=+g[b+72>>2];N=F-(c[k>>2]=p,+g[k>>2]);F=K*M-J*N;O=J*M+K*N;p=b+112|0;o=(g[k>>2]=F,c[k>>2]|0);j=(g[k>>2]=O,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;N=+g[b+76>>2];K=N-(c[k>>2]=q,+g[k>>2]);N=+g[b+80>>2];M=N-(c[k>>2]=r,+g[k>>2]);N=L*K-y*M;J=y*K+L*M;r=b+120|0;q=(g[k>>2]=N,c[k>>2]|0);j=(g[k>>2]=J,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;j=b+104|0;M=D+N-w-F;w=E+J-x-O;r=j;q=(g[k>>2]=M,c[k>>2]|0);p=(g[k>>2]=w,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=p;p=j|0;j=b+108|0;x=+Q(+(M*M+w*w));g[b+88>>2]=x;c[b+164>>2]=x- +g[b+84>>2]>0.0?2:0;if(x<=.004999999888241291){g[p>>2]=0.0;g[j>>2]=0.0;g[b+160>>2]=0.0;g[b+92>>2]=0.0;return}E=1.0/x;x=E*M;g[p>>2]=x;M=E*w;g[j>>2]=M;w=F*M-O*x;E=M*N-x*J;D=t+(s+w*w*u)+E*E*v;if(D!=0.0){P=1.0/D}else{P=0.0}g[b+160>>2]=P;if((a[d+20|0]&1)<<24>>24==0){g[b+92>>2]=0.0;R=C;U=I;V=G;W=H;X=A;Y=B}else{j=b+92|0;P=+g[d+8>>2]*+g[j>>2];g[j>>2]=P;D=x*P;x=P*M;R=C-u*(x*F-D*O);U=I+v*(x*N-D*J);V=G+D*t;W=H+x*t;X=A-D*s;Y=B-x*s}j=(c[m>>2]|0)+(f*12&-1)|0;f=(g[k>>2]=X,c[k>>2]|0);d=(g[k>>2]=Y,c[k>>2]|0)|0;c[j>>2]=0|f;c[j+4>>2]=d;g[(c[m>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=R;h=(c[m>>2]|0)+((c[l>>2]|0)*12&-1)|0;d=(g[k>>2]=V,c[k>>2]|0);j=(g[k>>2]=W,c[k>>2]|0)|0;c[h>>2]=0|d;c[h+4>>2]=j;g[(c[m>>2]|0)+((c[l>>2]|0)*12&-1)+8>>2]=U;return}function f5(a,b){a=a|0;b=+b;return+0.0}function f6(a){a=a|0;return}function f7(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function f8(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function f9(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+92>>2]*c;c=d*+g[b+108>>2];g[a>>2]=+g[b+104>>2]*d;g[a+4>>2]=c;return}function ga(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0;d=a+116|0;e=c[d>>2]|0;f=b+28|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];i=a+120|0;h=c[i>>2]|0;n=b+(h*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(h*12&-1)+8>>2];s=+g[a+156>>2];t=+g[a+160>>2];u=+g[a+164>>2];v=+g[a+168>>2];if(+g[a+68>>2]>0.0){h=a+112|0;w=+g[h>>2];x=(r-m+ +g[a+76>>2]+ +g[a+100>>2]*w)*(-0.0- +g[a+204>>2]);g[h>>2]=w+x;w=m-u*x;y=r+v*x;x=+g[a+136>>2];z=+g[a+132>>2];A=+g[a+128>>2];B=+g[a+124>>2];C=p+x*(-0.0-y)-j-A*(-0.0-w);D=q+z*y-l-B*w;E=+g[a+184>>2]*D+ +g[a+172>>2]*C;F=+g[a+188>>2]*D+ +g[a+176>>2]*C;C=-0.0-E;D=-0.0-F;h=a+104|0;g[h>>2]=+g[h>>2]-E;h=a+108|0;g[h>>2]=+g[h>>2]-F;G=w-u*(B*D-A*C);H=y+v*(z*D-x*C);I=C;J=D}else{D=+g[a+136>>2];C=+g[a+132>>2];x=+g[a+128>>2];z=+g[a+124>>2];y=p+D*(-0.0-r)-j-x*(-0.0-m);A=q+r*C-l-m*z;B=r-m;w=y*+g[a+172>>2]+A*+g[a+184>>2]+B*+g[a+196>>2];F=y*+g[a+176>>2]+A*+g[a+188>>2]+B*+g[a+200>>2];E=y*+g[a+180>>2]+A*+g[a+192>>2]+B*+g[a+204>>2];B=-0.0-w;A=-0.0-F;h=a+104|0;g[h>>2]=+g[h>>2]-w;h=a+108|0;g[h>>2]=+g[h>>2]-F;h=a+112|0;g[h>>2]=+g[h>>2]-E;G=m-u*(z*A-x*B-E);H=r+v*(C*A-D*B-E);I=B;J=A}h=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=j-s*I,c[k>>2]|0);a=(g[k>>2]=l-s*J,c[k>>2]|0)|0;c[h>>2]=0|e;c[h+4>>2]=a;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=G;d=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;a=(g[k>>2]=p+t*I,c[k>>2]|0);h=(g[k>>2]=q+t*J,c[k>>2]|0)|0;c[d>>2]=0|a;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=H;return}function gb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0;d=a+96|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];e=a+100|0;i=c[e>>2]|0;n=b+(i*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(i*12&-1)+8>>2];s=+T(+m);t=+S(+m);u=+T(+r);v=+S(+r);w=+g[a+68>>2]- +g[a+128>>2];x=+g[a+72>>2]- +g[a+132>>2];y=t*w-s*x;z=s*w+t*x;x=+g[a+76>>2]- +g[a+136>>2];t=+g[a+80>>2]- +g[a+140>>2];w=v*x-u*t;s=u*x+v*t;t=p+w-j-y;v=q+s-l-z;x=+Q(+(t*t+v*v));if(x<1.1920928955078125e-7){A=0.0;B=t;C=v}else{u=1.0/x;A=x;B=t*u;C=v*u}i=a+84|0;u=A- +g[i>>2];v=u<.20000000298023224?u:.20000000298023224;u=(v<0.0?0.0:v)*(-0.0- +g[a+160>>2]);v=B*u;B=C*u;u=+g[a+144>>2];C=m- +g[a+152>>2]*(y*B-z*v);z=+g[a+148>>2];y=r+ +g[a+156>>2]*(w*B-s*v);a=(g[k>>2]=j-u*v,c[k>>2]|0);b=(g[k>>2]=l-u*B,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=b;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=C;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;b=(g[k>>2]=p+z*v,c[k>>2]|0);h=(g[k>>2]=q+z*B,c[k>>2]|0)|0;c[d>>2]=0|b;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=y;return A- +g[i>>2]<.004999999888241291|0}function gc(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;dc(6400,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(11336,(v=i,i=i+8|0,c[v>>2]=e,v)|0);dc(8808,(v=i,i=i+8|0,c[v>>2]=f,v)|0);dc(6768,(v=i,i=i+8|0,c[v>>2]=a[b+61|0]&1,v)|0);j=+g[b+72>>2];dc(5992,(v=i,i=i+16|0,h[v>>3]=+g[b+68>>2],h[v+8>>3]=j,v)|0);j=+g[b+80>>2];dc(5536,(v=i,i=i+16|0,h[v>>3]=+g[b+76>>2],h[v+8>>3]=j,v)|0);dc(5104,(v=i,i=i+8|0,h[v>>3]=+g[b+84>>2],v)|0);dc(11904,(v=i,i=i+8|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function gd(a){a=a|0;vl(a);return}function ge(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+116|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+120|0;c[l>>2]=j;m=e+28|0;n=b+140|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+148|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+156>>2]=s;t=+g[i+120>>2];g[b+160>>2]=t;u=+g[e+128>>2];g[b+164>>2]=u;v=+g[i+128>>2];g[b+168>>2]=v;i=c[d+24>>2]|0;w=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;x=c[n+4>>2]|0;y=(c[k>>2]=c[n>>2]|0,+g[k>>2]);z=(c[k>>2]=x,+g[k>>2]);A=+g[m+(f*12&-1)+8>>2];B=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;x=c[i+4>>2]|0;C=(c[k>>2]=c[i>>2]|0,+g[k>>2]);D=(c[k>>2]=x,+g[k>>2]);E=+g[m+(j*12&-1)+8>>2];F=+T(+w);G=+S(+w);H=+T(+B);I=+S(+B);J=+g[b+80>>2];K=J-(c[k>>2]=o,+g[k>>2]);J=+g[b+84>>2];L=J-(c[k>>2]=p,+g[k>>2]);J=G*K-F*L;M=F*K+G*L;p=b+124|0;o=(g[k>>2]=J,c[k>>2]|0);j=(g[k>>2]=M,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;L=+g[b+88>>2];G=L-(c[k>>2]=q,+g[k>>2]);L=+g[b+92>>2];K=L-(c[k>>2]=r,+g[k>>2]);L=I*G-H*K;F=H*G+I*K;r=b+132|0;q=(g[k>>2]=L,c[k>>2]|0);j=(g[k>>2]=F,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;K=s+t;I=K+u*M*M+v*F*F;G=-0.0-M;H=u*J*G-v*F*L;N=u*G-v*F;G=K+u*J*J+v*L*L;K=u*J+v*L;O=u+v;P=+g[b+68>>2];j=b+172|0;if(P>0.0){Q=I*G-H*H;if(Q!=0.0){R=1.0/Q}else{R=Q}g[j>>2]=G*R;Q=H*(-0.0-R);g[b+184>>2]=Q;g[b+180>>2]=0.0;g[b+176>>2]=Q;g[b+188>>2]=I*R;vr(b+192|0,0,16);if(O>0.0){U=1.0/O}else{U=0.0}R=B-w- +g[b+96>>2];w=P*6.2831854820251465;P=w*U*w;B=+g[d>>2];Q=B*(w*U*2.0*+g[b+72>>2]+B*P);r=b+100|0;g[r>>2]=Q;if(Q!=0.0){V=1.0/Q}else{V=0.0}g[r>>2]=V;g[b+76>>2]=R*B*P*V;P=O+V;if(P!=0.0){W=1.0/P}else{W=0.0}g[b+204>>2]=W}else{W=O*G-K*K;P=N*K-O*H;V=K*H-N*G;B=N*V+(I*W+H*P);if(B!=0.0){X=1.0/B}else{X=B}g[j>>2]=W*X;W=P*X;g[b+176>>2]=W;P=V*X;g[b+180>>2]=P;g[b+184>>2]=W;g[b+188>>2]=(O*I-N*N)*X;O=(N*H-I*K)*X;g[b+192>>2]=O;g[b+196>>2]=P;g[b+200>>2]=O;g[b+204>>2]=(I*G-H*H)*X;g[b+100>>2]=0.0;g[b+76>>2]=0.0}j=b+104|0;if((a[d+20|0]&1)<<24>>24==0){g[j>>2]=0.0;g[b+108>>2]=0.0;g[b+112>>2]=0.0;X=A;H=E;G=C;I=D;O=y;P=z;r=c[e>>2]|0;q=r+(f*12&-1)|0;p=q;o=(g[k>>2]=O,c[k>>2]|0);m=(g[k>>2]=P,c[k>>2]|0);x=m;i=0;n=0;Y=x;Z=o;_=0;$=n|Z;aa=Y|_;ab=p|0;c[ab>>2]=$;ac=p+4|0;c[ac>>2]=aa;ad=c[h>>2]|0;ae=c[e>>2]|0;af=ae+(ad*12&-1)+8|0;g[af>>2]=X;ag=c[l>>2]|0;ah=c[e>>2]|0;ai=ah+(ag*12&-1)|0;aj=ai;ak=(g[k>>2]=G,c[k>>2]|0);al=(g[k>>2]=I,c[k>>2]|0);am=al;an=0;ao=0;ap=am;aq=ak;ar=0;as=ao|aq;at=ap|ar;au=aj|0;c[au>>2]=as;av=aj+4|0;c[av>>2]=at;aw=c[l>>2]|0;ax=c[e>>2]|0;ay=ax+(aw*12&-1)+8|0;g[ay>>2]=H;return}else{K=+g[d+8>>2];d=j|0;N=K*+g[d>>2];g[d>>2]=N;d=b+108|0;W=K*+g[d>>2];g[d>>2]=W;d=b+112|0;V=K*+g[d>>2];g[d>>2]=V;X=A-u*(V+(W*J-N*M));H=E+v*(V+(W*L-N*F));G=C+t*N;I=D+t*W;O=y-s*N;P=z-s*W;r=c[e>>2]|0;q=r+(f*12&-1)|0;p=q;o=(g[k>>2]=O,c[k>>2]|0);m=(g[k>>2]=P,c[k>>2]|0);x=m;i=0;n=0;Y=x;Z=o;_=0;$=n|Z;aa=Y|_;ab=p|0;c[ab>>2]=$;ac=p+4|0;c[ac>>2]=aa;ad=c[h>>2]|0;ae=c[e>>2]|0;af=ae+(ad*12&-1)+8|0;g[af>>2]=X;ag=c[l>>2]|0;ah=c[e>>2]|0;ai=ah+(ag*12&-1)|0;aj=ai;ak=(g[k>>2]=G,c[k>>2]|0);al=(g[k>>2]=I,c[k>>2]|0);am=al;an=0;ao=0;ap=am;aq=ak;ar=0;as=ao|aq;at=ap|ar;au=aj|0;c[au>>2]=as;av=aj+4|0;c[av>>2]=at;aw=c[l>>2]|0;ax=c[e>>2]|0;ay=ax+(aw*12&-1)+8|0;g[ay>>2]=H;return}}function gf(a){a=a|0;return}function gg(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+80>>2];h=+g[d+20>>2];i=+g[b+84>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function gh(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+88>>2];h=+g[d+20>>2];i=+g[b+92>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function gi(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+108>>2]*c;g[a>>2]=+g[b+104>>2]*c;g[a+4>>2]=d;return}function gj(a,b){a=a|0;b=+b;return+(+g[a+112>>2]*b)}function gk(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0;d=a+116|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];e=a+120|0;i=c[e>>2]|0;n=b+(i*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(i*12&-1)+8>>2];s=+T(+m);t=+S(+m);u=+T(+r);v=+S(+r);w=+g[a+156>>2];x=+g[a+160>>2];y=+g[a+164>>2];z=+g[a+168>>2];A=+g[a+80>>2]- +g[a+140>>2];B=+g[a+84>>2]- +g[a+144>>2];C=t*A-s*B;D=s*A+t*B;B=+g[a+88>>2]- +g[a+148>>2];t=+g[a+92>>2]- +g[a+152>>2];A=v*B-u*t;s=u*B+v*t;t=w+x;v=t+y*D*D+z*s*s;B=-0.0-D;u=y*C*B-z*s*A;E=y*B-z*s;B=t+y*C*C+z*A*A;t=y*C+z*A;F=y+z;G=p+A-j-C;H=q+s-l-D;if(+g[a+68>>2]>0.0){I=+Q(+(G*G+H*H));J=v*B-u*u;if(J!=0.0){K=1.0/J}else{K=J}J=-0.0-(B*G-u*H)*K;L=-0.0-(v*H-u*G)*K;M=C*L-D*J;N=0.0;O=I;P=A*L-s*J;R=J;U=L}else{L=r-m- +g[a+96>>2];J=+Q(+(G*G+H*H));if(L>0.0){V=L}else{V=-0.0-L}I=F*B-t*t;K=t*E-F*u;W=t*u-E*B;X=E*W+(v*I+u*K);if(X!=0.0){Y=1.0/X}else{Y=X}X=t*G;Z=(E*(H*u-B*G)+(v*(B*L-t*H)+u*(X-u*L)))*Y;B=-0.0-(G*I+H*K+W*L)*Y;W=-0.0-(E*(X-E*H)+(v*(F*H-t*L)+u*(E*L-F*G)))*Y;M=C*W-D*B-Z;N=V;O=J;P=A*W-s*B-Z;R=B;U=W}a=(g[k>>2]=j-w*R,c[k>>2]|0);i=(g[k>>2]=l-w*U,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=i;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=m-y*M;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;i=(g[k>>2]=p+x*R,c[k>>2]|0);h=(g[k>>2]=q+x*U,c[k>>2]|0)|0;c[d>>2]=0|i;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=r+z*P;if(O>.004999999888241291){_=0;return _|0}_=N<=.03490658849477768;return _|0}function gl(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;dc(6344,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(11336,(v=i,i=i+8|0,c[v>>2]=e,v)|0);dc(8808,(v=i,i=i+8|0,c[v>>2]=f,v)|0);dc(6768,(v=i,i=i+8|0,c[v>>2]=a[b+61|0]&1,v)|0);j=+g[b+84>>2];dc(5992,(v=i,i=i+16|0,h[v>>3]=+g[b+80>>2],h[v+8>>3]=j,v)|0);j=+g[b+92>>2];dc(5536,(v=i,i=i+16|0,h[v>>3]=+g[b+88>>2],h[v+8>>3]=j,v)|0);dc(5072,(v=i,i=i+8|0,h[v>>3]=+g[b+96>>2],v)|0);dc(12768,(v=i,i=i+8|0,h[v>>3]=+g[b+68>>2],v)|0);dc(12472,(v=i,i=i+8|0,h[v>>3]=+g[b+72>>2],v)|0);dc(11904,(v=i,i=i+8|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function gm(a){a=a|0;vl(a);return}function gn(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+132|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+136|0;c[l>>2]=j;m=e+28|0;n=b+140|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+148|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+156>>2]=s;t=+g[i+120>>2];g[b+160>>2]=t;u=+g[e+128>>2];g[b+164>>2]=u;v=+g[i+128>>2];g[b+168>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;m=c[e+4>>2]|0;w=(c[k>>2]=c[e>>2]|0,+g[k>>2]);x=(c[k>>2]=m,+g[k>>2]);y=+g[i+(f*12&-1)+8>>2];m=d+28|0;e=c[m>>2]|0;n=e+(f*12&-1)|0;z=c[n+4>>2]|0;A=(c[k>>2]=c[n>>2]|0,+g[k>>2]);B=(c[k>>2]=z,+g[k>>2]);C=+g[e+(f*12&-1)+8>>2];z=i+(j*12&-1)|0;n=c[z+4>>2]|0;D=(c[k>>2]=c[z>>2]|0,+g[k>>2]);E=(c[k>>2]=n,+g[k>>2]);F=+g[i+(j*12&-1)+8>>2];i=e+(j*12&-1)|0;n=c[i+4>>2]|0;G=(c[k>>2]=c[i>>2]|0,+g[k>>2]);H=(c[k>>2]=n,+g[k>>2]);I=+g[e+(j*12&-1)+8>>2];J=+T(+y);K=+S(+y);y=+T(+F);L=+S(+F);F=+g[b+76>>2];M=F-(c[k>>2]=o,+g[k>>2]);F=+g[b+80>>2];N=F-(c[k>>2]=p,+g[k>>2]);F=K*M-J*N;O=J*M+K*N;N=+g[b+84>>2];M=N-(c[k>>2]=q,+g[k>>2]);N=+g[b+88>>2];P=N-(c[k>>2]=r,+g[k>>2]);N=L*M-y*P;Q=y*M+L*P;P=D+N-w-F;w=E+Q-x-O;x=+g[b+100>>2];E=+g[b+104>>2];D=K*x-J*E;L=J*x+K*E;r=b+180|0;q=(g[k>>2]=D,c[k>>2]|0);p=(g[k>>2]=L,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=p;E=F+P;F=O+w;O=L*E-D*F;g[b+196>>2]=O;x=N*L-Q*D;g[b+200>>2]=x;M=s+t;y=M+O*u*O+x*v*x;if(y>0.0){R=1.0/y}else{R=y}g[b+204>>2]=R;p=b+212|0;g[p>>2]=0.0;r=b+216|0;g[r>>2]=0.0;q=b+220|0;g[q>>2]=0.0;R=+g[b+68>>2];do{if(R>0.0){y=+g[b+92>>2];U=+g[b+96>>2];V=K*y-J*U;W=J*y+K*U;o=b+172|0;j=(g[k>>2]=V,c[k>>2]|0);e=(g[k>>2]=W,c[k>>2]|0)|0;c[o>>2]=0|j;c[o+4>>2]=e;U=E*W-F*V;g[b+188>>2]=U;y=N*W-Q*V;g[b+192>>2]=y;X=M+U*u*U+y*v*y;if(X<=0.0){break}y=1.0/X;g[p>>2]=y;U=R*6.2831854820251465;Y=U*y*U;Z=+g[d>>2];_=Z*(U*y*2.0*+g[b+72>>2]+Z*Y);if(_>0.0){$=1.0/_}else{$=_}g[q>>2]=$;g[r>>2]=(P*V+w*W)*Z*Y*$;Y=X+$;g[p>>2]=Y;if(Y<=0.0){break}g[p>>2]=1.0/Y}else{g[b+116>>2]=0.0}}while(0);do{if((a[b+128|0]&1)<<24>>24==0){g[b+208>>2]=0.0;g[b+112>>2]=0.0}else{$=v+u;p=b+208|0;g[p>>2]=$;if($<=0.0){break}g[p>>2]=1.0/$}}while(0);if((a[d+20|0]&1)<<24>>24==0){g[b+108>>2]=0.0;g[b+116>>2]=0.0;g[b+112>>2]=0.0;$=C;w=I;P=G;R=H;M=A;Q=B;p=c[m>>2]|0;r=p+(f*12&-1)|0;q=r;e=(g[k>>2]=M,c[k>>2]|0);o=(g[k>>2]=Q,c[k>>2]|0);j=o;n=0;i=0;z=j;aa=e;ab=0;ac=i|aa;ad=z|ab;ae=q|0;c[ae>>2]=ac;af=q+4|0;c[af>>2]=ad;ag=c[h>>2]|0;ah=c[m>>2]|0;ai=ah+(ag*12&-1)+8|0;g[ai>>2]=$;aj=c[l>>2]|0;ak=c[m>>2]|0;al=ak+(aj*12&-1)|0;am=al;an=(g[k>>2]=P,c[k>>2]|0);ao=(g[k>>2]=R,c[k>>2]|0);ap=ao;aq=0;ar=0;as=ap;at=an;au=0;av=ar|at;aw=as|au;ax=am|0;c[ax>>2]=av;ay=am+4|0;c[ay>>2]=aw;az=c[l>>2]|0;aA=c[m>>2]|0;aB=aA+(az*12&-1)+8|0;g[aB>>2]=w;return}else{aC=d+8|0;d=b+108|0;N=+g[aC>>2]*+g[d>>2];g[d>>2]=N;d=b+116|0;F=+g[aC>>2]*+g[d>>2];g[d>>2]=F;d=b+112|0;E=+g[aC>>2]*+g[d>>2];g[d>>2]=E;K=N*D+F*+g[b+172>>2];D=N*L+F*+g[b+176>>2];$=C-(E+(N*O+F*+g[b+188>>2]))*u;w=I+(E+(N*x+F*+g[b+192>>2]))*v;P=G+K*t;R=H+D*t;M=A-K*s;Q=B-D*s;p=c[m>>2]|0;r=p+(f*12&-1)|0;q=r;e=(g[k>>2]=M,c[k>>2]|0);o=(g[k>>2]=Q,c[k>>2]|0);j=o;n=0;i=0;z=j;aa=e;ab=0;ac=i|aa;ad=z|ab;ae=q|0;c[ae>>2]=ac;af=q+4|0;c[af>>2]=ad;ag=c[h>>2]|0;ah=c[m>>2]|0;ai=ah+(ag*12&-1)+8|0;g[ai>>2]=$;aj=c[l>>2]|0;ak=c[m>>2]|0;al=ak+(aj*12&-1)|0;am=al;an=(g[k>>2]=P,c[k>>2]|0);ao=(g[k>>2]=R,c[k>>2]|0);ap=ao;aq=0;ar=0;as=ap;at=an;au=0;av=ar|at;aw=as|au;ax=am|0;c[ax>>2]=av;ay=am+4|0;c[ay>>2]=aw;az=c[l>>2]|0;aA=c[m>>2]|0;aB=aA+(az*12&-1)+8|0;g[aB>>2]=w;return}}function go(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0;e=b|0;c[e>>2]=19312;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){bd(7272,173,15744,9072)}else{c[b+4>>2]=c[d>>2]|0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[f>>2]|0;c[b+52>>2]=c[h>>2]|0;c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2]|0;vr(b+16|0,0,32);c[e>>2]=20184;e=d+20|0;h=b+76|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2]|0;c[h+4>>2]=f;f=d+28|0;h=b+84|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=e;e=d+36|0;h=b+92|0;f=c[e>>2]|0;i=c[e+4>>2]|0;c[h>>2]=f;c[h+4>>2]=i;h=b+100|0;c[h>>2]=0|(g[k>>2]=(c[k>>2]=i,+g[k>>2])*-1.0,c[k>>2]|0);c[h+4>>2]=f|0;g[b+204>>2]=0.0;g[b+108>>2]=0.0;g[b+208>>2]=0.0;g[b+112>>2]=0.0;g[b+212>>2]=0.0;g[b+116>>2]=0.0;g[b+120>>2]=+g[d+48>>2];g[b+124>>2]=+g[d+52>>2];a[b+128|0]=a[d+44|0]&1;g[b+68>>2]=+g[d+56>>2];g[b+72>>2]=+g[d+60>>2];g[b+216>>2]=0.0;g[b+220>>2]=0.0;vr(b+172|0,0,16);return}}function gp(a){a=a|0;return}function gq(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0,j=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0;d=+g[a+156>>2];e=+g[a+160>>2];f=+g[a+164>>2];h=+g[a+168>>2];i=a+132|0;j=c[i>>2]|0;l=b+28|0;m=c[l>>2]|0;n=m+(j*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[m+(j*12&-1)+8>>2];o=a+136|0;n=c[o>>2]|0;s=m+(n*12&-1)|0;t=c[s+4>>2]|0;u=(c[k>>2]=c[s>>2]|0,+g[k>>2]);v=(c[k>>2]=t,+g[k>>2]);w=+g[m+(n*12&-1)+8>>2];x=+g[a+172>>2];y=+g[a+176>>2];z=+g[a+192>>2];A=+g[a+188>>2];n=a+116|0;B=+g[n>>2];C=(+g[a+216>>2]+(w*z+(x*(u-p)+y*(v-q))-r*A)+ +g[a+220>>2]*B)*(-0.0- +g[a+212>>2]);g[n>>2]=B+C;B=x*C;x=y*C;y=p-d*B;p=q-d*x;q=r-f*C*A;A=u+e*B;B=v+e*x;x=w+h*C*z;n=a+112|0;z=+g[n>>2];C=+g[b>>2]*+g[a+120>>2];w=z+(x-q- +g[a+124>>2])*(-0.0- +g[a+208>>2]);v=-0.0-C;u=w<C?w:C;C=u<v?v:u;g[n>>2]=C;u=C-z;z=q-f*u;q=x+h*u;u=+g[a+180>>2];x=+g[a+184>>2];C=+g[a+200>>2];v=+g[a+196>>2];w=((A-y)*u+(B-p)*x+C*q-v*z)*(-0.0- +g[a+204>>2]);n=a+108|0;g[n>>2]=+g[n>>2]+w;r=u*w;u=x*w;n=(c[l>>2]|0)+(j*12&-1)|0;j=(g[k>>2]=y-d*r,c[k>>2]|0);a=(g[k>>2]=p-d*u,c[k>>2]|0)|0;c[n>>2]=0|j;c[n+4>>2]=a;g[(c[l>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=z-f*v*w;i=(c[l>>2]|0)+((c[o>>2]|0)*12&-1)|0;a=(g[k>>2]=A+e*r,c[k>>2]|0);n=(g[k>>2]=B+e*u,c[k>>2]|0)|0;c[i>>2]=0|a;c[i+4>>2]=n;g[(c[l>>2]|0)+((c[o>>2]|0)*12&-1)+8>>2]=q+h*C*w;return}function gr(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function gs(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+84>>2];h=+g[d+20>>2];i=+g[b+88>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function gt(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0,f=0.0;d=+g[b+108>>2];e=+g[b+116>>2];f=(d*+g[b+184>>2]+e*+g[b+176>>2])*c;g[a>>2]=(d*+g[b+180>>2]+e*+g[b+172>>2])*c;g[a+4>>2]=f;return}function gu(a,b){a=a|0;b=+b;return+(+g[a+112>>2]*b)}function gv(a){a=a|0;return c[a+68>>2]|0}function gw(a){a=a|0;return c[a+64>>2]|0}function gx(a,b){a=a|0;b=b|0;c[a+68>>2]=b;return}function gy(a,b){a=a|0;b=b|0;c[a+76>>2]=b;return}function gz(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function gA(a,b){a=a|0;b=b|0;c[a+60>>2]=b;return}function gB(a){a=a|0;return c[a+72>>2]|0}function gC(a,b){a=a|0;b=b|0;c[a+72>>2]=b;return}function gD(a){a=a|0;return a|0}function gE(a){a=a|0;return c[a+60>>2]|0}function gF(a){a=a|0;return c[a+76>>2]|0}function gG(a){a=a|0;return c[a+48>>2]|0}function gH(a){a=a|0;return c[a+52>>2]|0}function gI(a,b){a=a|0;b=+b;g[a+68>>2]=b;return}function gJ(a){a=a|0;return c[a+64>>2]|0}function gK(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function gL(a){a=a|0;return c[a+12>>2]|0}function gM(a){a=a|0;return a+80|0}function gN(a){a=a|0;return a+88|0}function gO(a){a=a|0;return+(+g[a+68>>2])}function gP(a){a=a|0;return+(+g[a+104>>2])}function gQ(a){a=a|0;return+(+g[a+72>>2])}function gR(b){b=b|0;return(a[b+61|0]&1)<<24>>24!=0|0}function gS(a){a=a|0;return c[a+4>>2]|0}function gT(a,b){a=a|0;b=+b;g[a+72>>2]=b;return}function gU(a,b){a=a|0;b=+b;g[a+104>>2]=b;return}function gV(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)<<16>>16==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)<<16>>16!=0;return d|0}function gW(a){a=a|0;return+(+g[a+20>>2])}function gX(a,b){a=a|0;b=+b;g[a+16>>2]=b;return}function gY(a){a=a|0;return c[a+12>>2]|0}function gZ(a,b){a=a|0;b=+b;g[a+20>>2]=b;return}function g_(a){a=a|0;return c[a+8>>2]|0}function g$(a){a=a|0;return c[a+4>>2]|0}function g0(a){a=a|0;return+(+g[a+16>>2])}function g1(a){a=a|0;return c[a+40>>2]|0}function g2(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0;d=a+132|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];e=a+136|0;i=c[e>>2]|0;n=b+(i*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(i*12&-1)+8>>2];s=+T(+m);t=+S(+m);u=+T(+r);v=+S(+r);w=+g[a+76>>2]- +g[a+140>>2];x=+g[a+80>>2]- +g[a+144>>2];y=t*w-s*x;z=s*w+t*x;x=+g[a+84>>2]- +g[a+148>>2];w=+g[a+88>>2]- +g[a+152>>2];A=v*x-u*w;B=u*x+v*w;w=p-j+A-y;v=q-l+B-z;x=+g[a+100>>2];u=+g[a+104>>2];C=t*x-s*u;D=s*x+t*u;u=C*w+D*v;t=+g[a+156>>2];x=+g[a+160>>2];s=+g[a+164>>2];E=+g[a+196>>2];F=+g[a+168>>2];G=+g[a+200>>2];H=t+x+E*s*E+G*F*G;if(H!=0.0){I=(-0.0-u)/H}else{I=0.0}H=C*I;G=D*I;a=(g[k>>2]=j-H*t,c[k>>2]|0);i=(g[k>>2]=l-G*t,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=i;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=m-(D*(y+w)-C*(z+v))*I*s;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;i=(g[k>>2]=p+H*x,c[k>>2]|0);h=(g[k>>2]=q+G*x,c[k>>2]|0)|0;c[d>>2]=0|i;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=r+(A*D-B*C)*I*F;if(u>0.0){J=u;K=J<=.004999999888241291;return K|0}J=-0.0-u;K=J<=.004999999888241291;return K|0}function g3(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;dc(6288,(v=i,i=i+1|0,i=i+7>>3<<3,c[v>>2]=0,v)|0);dc(11336,(v=i,i=i+8|0,c[v>>2]=e,v)|0);dc(8808,(v=i,i=i+8|0,c[v>>2]=f,v)|0);dc(6768,(v=i,i=i+8|0,c[v>>2]=a[b+61|0]&1,v)|0);j=+g[b+80>>2];dc(5992,(v=i,i=i+16|0,h[v>>3]=+g[b+76>>2],h[v+8>>3]=j,v)|0);j=+g[b+88>>2];dc(5536,(v=i,i=i+16|0,h[v>>3]=+g[b+84>>2],h[v+8>>3]=j,v)|0);j=+g[b+96>>2];dc(5032,(v=i,i=i+16|0,h[v>>3]=+g[b+92>>2],h[v+8>>3]=j,v)|0);dc(4760,(v=i,i=i+8|0,c[v>>2]=a[b+128|0]&1,v)|0);dc(4488,(v=i,i=i+8|0,h[v>>3]=+g[b+124>>2],v)|0);dc(4232,(v=i,i=i+8|0,h[v>>3]=+g[b+120>>2],v)|0);dc(12768,(v=i,i=i+8|0,h[v>>3]=+g[b+68>>2],v)|0);dc(12472,(v=i,i=i+8|0,h[v>>3]=+g[b+72>>2],v)|0);dc(11904,(v=i,i=i+8|0,c[v>>2]=c[b+56>>2]|0,v)|0);i=d;return}function g4(a){a=a|0;vl(a);return}function g5(){var a=0;a=vp(80)|0;b4(a);c[a+60>>2]=0;c[a+64>>2]=0;c[a+68>>2]=4192;c[a+72>>2]=4184;c[a+76>>2]=0;return a|0}function g6(a,b,c){a=a|0;b=b|0;c=c|0;dw(a,b,c);return}function g7(a){a=a|0;dy(a);return}function g8(a){a=a|0;dz(a|0,a);return}function g9(a){a=a|0;if((a|0)==0){return}vj(c[a+32>>2]|0);vj(c[a+44>>2]|0);vj(c[a+4>>2]|0);vl(a);return}function ha(a,b){a=a|0;b=b|0;dq(a,b);return}function hb(a,b){a=a|0;b=b|0;vq(a|0,b|0,60);return}function hc(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22912]|0)){a[22912]=1}bs[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=408;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 408}function hd(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22920]|0)){a[22920]=1}bs[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=400;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 400}function he(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22792]|0)){a[22792]=1}bQ[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=312;c[g>>2]=c[f>>2]|0;c[g+4>>2]=b;i=e;return 312}function hf(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+24>>2]&511](a);return}function hg(a){a=a|0;br[c[(c[a>>2]|0)+16>>2]&511](a);return}function hh(a,b){a=a|0;b=+b;return+(+bz[c[(c[a>>2]|0)+12>>2]&127](a,b))}function hi(a,c){a=a|0;c=c|0;var d=0,e=0;d=a+32|0;e=c;b[d>>1]=b[e>>1]|0;b[d+2>>1]=b[e+2>>1]|0;b[d+4>>1]=b[e+4>>1]|0;dJ(a);return}function hj(){var a=0;a=vp(44)|0;b[a+32>>1]=1;b[a+34>>1]=-1;b[a+36>>1]=0;c[a+40>>2]=0;c[a+24>>2]=0;c[a+28>>2]=0;vr(a|0,0,16);return a|0}function hk(b){b=b|0;var d=0,e=0,f=0,h=0;d=vp(176)|0;e=d;c[e>>2]=19312;f=c[b+8>>2]|0;h=c[b+12>>2]|0;if((f|0)!=(h|0)){c[d+4>>2]=c[b>>2]|0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+48>>2]=f;c[d+52>>2]=h;c[d+56>>2]=0;a[d+61|0]=a[b+16|0]&1;a[d+60|0]=0;c[d+64>>2]=c[b+4>>2]|0;vr(d+16|0,0,32);c[e>>2]=19912;e=b+20|0;h=d+80|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2]|0;c[h+4>>2]=f;f=b+28|0;h=d+88|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=e;g[d+104>>2]=+g[b+36>>2];g[d+68>>2]=+g[b+40>>2];g[d+72>>2]=+g[b+44>>2];g[d+100>>2]=0.0;g[d+96>>2]=0.0;g[d+76>>2]=0.0;return d|0}bd(7272,173,15744,9072);return 0}function hl(a,b){a=a|0;b=+b;g[a>>2]=b;return}function hm(d,e){d=d|0;e=e|0;var f=0,h=0,i=0;f=d+38|0;if((e&1|0)==(a[f]&1|0)){return}h=c[d+8>>2]|0;d=h+4|0;i=b[d>>1]|0;if((i&2)<<16>>16==0){b[d>>1]=i|2;g[h+144>>2]=0.0}a[f]=e&1;return}function hn(a,b){a=a|0;b=b|0;return(c[a+24>>2]|0)+(b*28&-1)|0}function ho(a,b){a=a|0;b=b|0;c[a+40>>2]=b;return}function hp(a){a=a|0;return a+32|0}function hq(b){b=b|0;return(a[b+38|0]&1)<<24>>24!=0|0}function hr(a){a=a|0;return c[(c[a+12>>2]|0)+4>>2]|0}function hs(a){a=a|0;return+(+g[a>>2])}function ht(a){a=a|0;return c[a+48>>2]|0}function hu(a){a=a|0;return c[a+52>>2]|0}function hv(a,b){a=a|0;b=+b;g[a+84>>2]=b;return}function hw(a){a=a|0;return c[a+64>>2]|0}function hx(a,b){a=a|0;b=+b;g[a+104>>2]=b;return}function hy(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function hz(a){a=a|0;return c[a+12>>2]|0}function hA(a){a=a|0;return+(+g[a+104>>2])}function hB(a){a=a|0;return a+76|0}function hC(a){a=a|0;return+(+g[a+84>>2])}function hD(a){a=a|0;return+(+g[a+88>>2])}function hE(b){b=b|0;return(a[b+61|0]&1)<<24>>24!=0|0}function hF(a,d){a=a|0;d=d|0;var e=0,f=0,h=0;e=c[a+52>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)<<16>>16==0){b[f>>1]=h|2;g[e+144>>2]=0.0}e=d;d=a+76|0;a=c[e+4>>2]|0;c[d>>2]=c[e>>2]|0;c[d+4>>2]=a;return}function hG(a){a=a|0;return c[a+4>>2]|0}function hH(a,b){a=a|0;b=+b;g[a+88>>2]=b;return}function hI(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)<<16>>16==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)<<16>>16!=0;return d|0}function hJ(a){a=a|0;return c[a+48>>2]|0}function hK(a){a=a|0;return c[a+4>>2]|0}function hL(b){b=b|0;var d=0,e=0;if(!(a[22808]|0)){a[22808]=1}d=b+76|0;b=c[d+4>>2]|0;e=24;c[e>>2]=c[d>>2]|0;c[e+4>>2]=b;return 24}function hM(b){b=b|0;var d=0,e=0;if(!(a[22816]|0)){a[22816]=1}d=b+68|0;b=c[d+4>>2]|0;e=16;c[e>>2]=c[d>>2]|0;c[e+4>>2]=b;return 16}function hN(a){a=a|0;return c[a+64>>2]|0}function hO(a){a=a|0;return c[a+52>>2]|0}function hP(b){b=b|0;return(a[b+61|0]&1)<<24>>24!=0|0}function hQ(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function hR(a){a=a|0;return c[a+12>>2]|0}function hS(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)<<16>>16==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)<<16>>16!=0;return d|0}function hT(a){a=a|0;return+(+g[a+112>>2])}function hU(a){a=a|0;var b=0,d=0.0,e=0,f=0.0,h=0.0,i=0.0,j=0,k=0.0;b=c[a>>2]|0;if((b|0)==-1){d=0.0;return+d}e=c[a+4>>2]|0;f=(+g[e+(b*36&-1)+8>>2]- +g[e+(b*36&-1)>>2]+(+g[e+(b*36&-1)+12>>2]- +g[e+(b*36&-1)+4>>2]))*2.0;b=c[a+12>>2]|0;L394:do{if((b|0)>0){h=0.0;a=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<0){i=h}else{i=h+(+g[e+(a*36&-1)+8>>2]- +g[e+(a*36&-1)>>2]+(+g[e+(a*36&-1)+12>>2]- +g[e+(a*36&-1)+4>>2]))*2.0}j=a+1|0;if((j|0)<(b|0)){h=i;a=j}else{k=i;break L394}}}else{k=0.0}}while(0);d=k/f;return+d}function hV(a){a=a|0;var b=0,d=0;b=c[a>>2]|0;if((b|0)==-1){d=0;return d|0}d=c[(c[a+4>>2]|0)+(b*36&-1)+32>>2]|0;return d|0}function hW(a){a=a|0;return c[a+28>>2]|0}function hX(a,b){a=a|0;b=b|0;var d=0;d=c[a+12>>2]|0;bQ[c[(c[d>>2]|0)+28>>2]&127](d,b,+g[a>>2]);return}function hY(a,b){a=a|0;b=b|0;var d=0;d=c[a+12>>2]|0;return by[c[(c[d>>2]|0)+16>>2]&127](d,(c[a+8>>2]|0)+12|0,b)|0}function hZ(a){a=a|0;if((a|0)==0){return}vl(a);return}function h_(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;f=c[a+12>>2]|0;return bL[c[(c[f>>2]|0)+20>>2]&127](f,b,d,(c[a+8>>2]|0)+12|0,e)|0}function h$(a){a=a|0;dJ(a);return}function h0(a,b){a=a|0;b=b|0;dK(a,b);return}function h1(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22976]|0)){a[22976]=1}bs[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=224;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 224}function h2(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22984]|0)){a[22984]=1}bs[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=136;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 136}function h3(a){a=a|0;var b=0;b=vp(168)|0;fw(b,a);return b|0}function h4(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22832]|0)){a[22832]=1}bQ[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=40;c[g>>2]=c[f>>2]|0;c[g+4>>2]=b;i=e;return 40}function h5(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+24>>2]&511](a);return}function h6(a){a=a|0;br[c[(c[a>>2]|0)+16>>2]&511](a);return}function h7(a,b){a=a|0;b=+b;return+(+bz[c[(c[a>>2]|0)+12>>2]&127](a,b))}function h8(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+24>>2]&511](a);return}function h9(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22936]|0)){a[22936]=1}bs[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=32;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 32}function ia(a,b){a=a|0;b=+b;return+(+bz[c[(c[a>>2]|0)+12>>2]&127](a,b))}function ib(a){a=a|0;br[c[(c[a>>2]|0)+16>>2]&511](a);return}function ic(a){a=a|0;var b=0,d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;b=c[a+52>>2]|0;d=+g[b+24>>2];e=+g[a+100>>2];f=+g[b+20>>2];h=+g[a+104>>2];i=+g[b+12>>2]+(d*e-f*h);j=e*f+d*h+ +g[b+16>>2];b=a+76|0;a=c[b+4>>2]|0;h=(c[k>>2]=c[b>>2]|0,+g[k>>2]);d=i-h;h=j-(c[k>>2]=a,+g[k>>2]);return+(+Q(+(d*d+h*h)))}function id(a){a=a|0;var b=0,d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;b=c[a+48>>2]|0;d=+g[b+24>>2];e=+g[a+92>>2];f=+g[b+20>>2];h=+g[a+96>>2];i=+g[b+12>>2]+(d*e-f*h);j=e*f+d*h+ +g[b+16>>2];b=a+68|0;a=c[b+4>>2]|0;h=(c[k>>2]=c[b>>2]|0,+g[k>>2]);d=i-h;h=j-(c[k>>2]=a,+g[k>>2]);return+(+Q(+(d*d+h*h)))}function ie(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22928]|0)){a[22928]=1}bs[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=8;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 8}function ig(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22800]|0)){a[22800]=1}bQ[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=392;c[g>>2]=c[f>>2]|0;c[g+4>>2]=b;i=e;return 392}function ih(a){a=a|0;var b=0;b=vp(196)|0;fK(b,a);return b|0}function ii(a){a=a|0;if((a|0)==0){return}vj(c[a+32>>2]|0);vj(c[a+44>>2]|0);vj(c[a+4>>2]|0);vl(a);return}function ij(){var a=0;a=vp(60)|0;b4(a);return a|0}function ik(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=a+40|0;e=c[d>>2]|0;f=a+36|0;g=a+32|0;if((e|0)==(c[f>>2]|0)){a=c[g>>2]|0;c[f>>2]=e<<1;f=vi(e<<3)|0;c[g>>2]=f;h=a;vq(f|0,h|0,c[d>>2]<<2);vj(h);i=c[d>>2]|0}else{i=e}c[(c[g>>2]|0)+(i<<2)>>2]=b;c[d>>2]=(c[d>>2]|0)+1|0;return}function il(a,b,c){a=a|0;b=b|0;c=c|0;return b5(a,b,c)|0}function im(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if(!(co(a|0,b,d,e)|0)){return}e=a+40|0;d=c[e>>2]|0;f=a+36|0;g=a+32|0;if((d|0)==(c[f>>2]|0)){a=c[g>>2]|0;c[f>>2]=d<<1;f=vi(d<<3)|0;c[g>>2]=f;h=a;vq(f|0,h|0,c[e>>2]<<2);vj(h);i=c[e>>2]|0}else{i=d}c[(c[g>>2]|0)+(i<<2)>>2]=b;c[e>>2]=(c[e>>2]|0)+1|0;return}function io(a,b){a=a|0;b=b|0;do{if((b|0)>-1){if((c[a+12>>2]|0)<=(b|0)){break}return(c[a+4>>2]|0)+(b*36&-1)|0}}while(0);bd(10360,159,14456,9904);return 0}function ip(a,b){a=a|0;b=b|0;do{if((b|0)>-1){if((c[a+12>>2]|0)<=(b|0)){break}return c[(c[a+4>>2]|0)+(b*36&-1)+16>>2]|0}}while(0);bd(10360,153,14408,9904);return 0}function iq(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;b=c[a+12>>2]|0;if((b|0)<=0){d=0;return d|0}e=c[a+4>>2]|0;a=0;f=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<2){g=f}else{h=c[e+(a*36&-1)+24>>2]|0;if((h|0)==-1){i=429;break}j=(c[e+((c[e+(a*36&-1)+28>>2]|0)*36&-1)+32>>2]|0)-(c[e+(h*36&-1)+32>>2]|0)|0;h=(j|0)>0?j:-j|0;g=(f|0)>(h|0)?f:h}h=a+1|0;if((h|0)<(b|0)){a=h;f=g}else{d=g;i=433;break}}if((i|0)==429){bd(11392,686,14312,7360);return 0}else if((i|0)==433){return d|0}return 0}function ir(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;if((b|0)<=-1){bd(10360,159,14456,9904);return 0}e=c[a+12>>2]|0;if((e|0)<=(b|0)){bd(10360,159,14456,9904);return 0}f=c[a+4>>2]|0;if((d|0)>-1&(e|0)>(d|0)){return(+g[f+(d*36&-1)>>2]- +g[f+(b*36&-1)+8>>2]>0.0|+g[f+(d*36&-1)+4>>2]- +g[f+(b*36&-1)+12>>2]>0.0|+g[f+(b*36&-1)>>2]- +g[f+(d*36&-1)+8>>2]>0.0|+g[f+(b*36&-1)+4>>2]- +g[f+(d*36&-1)+12>>2]>0.0)^1|0}else{bd(10360,159,14456,9904);return 0}return 0}function is(b,c){b=b|0;c=c|0;a[b+102994|0]=c&1;return}function it(a){a=a|0;var b=0,d=0.0,e=0,f=0.0,h=0.0,i=0.0,j=0,k=0.0;b=c[a+102872>>2]|0;if((b|0)==-1){d=0.0;return+d}e=c[a+102876>>2]|0;f=(+g[e+(b*36&-1)+8>>2]- +g[e+(b*36&-1)>>2]+(+g[e+(b*36&-1)+12>>2]- +g[e+(b*36&-1)+4>>2]))*2.0;b=c[a+102884>>2]|0;L519:do{if((b|0)>0){h=0.0;a=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<0){i=h}else{i=h+(+g[e+(a*36&-1)+8>>2]- +g[e+(a*36&-1)>>2]+(+g[e+(a*36&-1)+12>>2]- +g[e+(a*36&-1)+4>>2]))*2.0}j=a+1|0;if((j|0)<(b|0)){h=i;a=j}else{k=i;break L519}}}else{k=0.0}}while(0);d=k/f;return+d}function iu(a){a=a|0;var b=0,d=0;b=c[a+102872>>2]|0;if((b|0)==-1){d=0;return d|0}d=c[(c[a+102876>>2]|0)+(b*36&-1)+32>>2]|0;return d|0}function iv(a){a=a|0;return a+102996|0}function iw(b){b=b|0;return(a[b+102994|0]&1)<<24>>24!=0|0}function ix(a){a=a|0;return a+102872|0}function iy(a,b){a=a|0;b=b|0;c[a+102944>>2]=b;return}function iz(b,c){b=b|0;c=c|0;a[b+102993|0]=c&1;return}function iA(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+102968|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function iB(a){a=a|0;return c[a+102960>>2]|0}function iC(a){a=a|0;return(c[a+102868>>2]&4|0)!=0|0}function iD(b){b=b|0;return(a[b+102993|0]&1)<<24>>24!=0|0}function iE(a){a=a|0;return c[a+102956>>2]|0}function iF(a){a=a|0;return c[a+102952>>2]|0}function iG(a,b){a=a|0;b=b|0;c[a+102980>>2]=b;return}function iH(a){a=a|0;return c[a+102964>>2]|0}function iI(a){a=a|0;var b=0,d=0;b=c[a+102952>>2]|0;if((b|0)==0){return}else{d=b}while(1){g[d+76>>2]=0.0;g[d+80>>2]=0.0;g[d+84>>2]=0.0;b=c[d+96>>2]|0;if((b|0)==0){break}else{d=b}}return}function iJ(b){b=b|0;return(a[b+102992|0]&1)<<24>>24!=0|0}function iK(d,e){d=d|0;e=e|0;var f=0,h=0;f=d+102976|0;if((e&1|0)==(a[f]&1|0)){return}a[f]=e&1;if(e){return}e=c[d+102952>>2]|0;if((e|0)==0){return}else{h=e}while(1){e=h+4|0;d=b[e>>1]|0;if((d&2)<<16>>16==0){b[e>>1]=d|2;g[h+144>>2]=0.0}d=c[h+96>>2]|0;if((d|0)==0){break}else{h=d}}return}function iL(b){b=b|0;return(a[b+102976|0]&1)<<24>>24!=0|0}function iM(a){a=a|0;return c[a+102900>>2]|0}function iN(a){a=a|0;return(c[a+102868>>2]&2|0)!=0|0}function iO(a){a=a|0;return c[a+102932>>2]|0}function iP(a,b){a=a|0;b=b|0;c[a+102984>>2]=b;return}function iQ(a,b){a=a|0;b=b|0;var d=0;d=a+102868|0;a=c[d>>2]|0;c[d>>2]=b?a|4:a&-5;return}function iR(b){b=b|0;var d=0,e=0;if(!(a[23072]|0)){a[23072]=1}d=b+102968|0;b=c[d+4>>2]|0;e=384;c[e>>2]=c[d>>2]|0;c[e+4>>2]=b;return 384}function iS(a){a=a|0;return c[a+102936>>2]|0}function iT(b,c){b=b|0;c=c|0;a[b+102992|0]=c&1;return}function iU(a,b){a=a|0;b=b|0;c[a+102940>>2]=b;return}function iV(a){a=a|0;return c[a+48>>2]|0}function iW(a){a=a|0;return c[a+52>>2]|0}function iX(a){a=a|0;return c[a+64>>2]|0}function iY(a){a=a|0;return a+84|0}function iZ(a){a=a|0;return+(+g[a+120>>2])}function i_(a){a=a|0;return c[a+12>>2]|0}function i$(a){a=a|0;return a+68|0}function i0(a,d){a=a|0;d=+d;var e=0,f=0,h=0,i=0;e=c[a+48>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)<<16>>16==0){b[f>>1]=h|2;g[e+144>>2]=0.0}e=c[a+52>>2]|0;h=e+4|0;f=b[h>>1]|0;if((f&2)<<16>>16!=0){i=a+132|0;g[i>>2]=d;return}b[h>>1]=f|2;g[e+144>>2]=0.0;i=a+132|0;g[i>>2]=d;return}function i1(a){a=a|0;return a+76|0}function i2(a){a=a|0;return+(+g[a+132>>2])}function i3(a,d){a=a|0;d=+d;var e=0,f=0,h=0,i=0;e=c[a+48>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)<<16>>16==0){b[f>>1]=h|2;g[e+144>>2]=0.0}e=c[a+52>>2]|0;h=e+4|0;f=b[h>>1]|0;if((f&2)<<16>>16!=0){i=a+128|0;g[i>>2]=d;return}b[h>>1]=f|2;g[e+144>>2]=0.0;i=a+128|0;g[i>>2]=d;return}function i4(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0;f=d+136|0;if((e&1|0)==(a[f]&1|0)){return}h=c[d+48>>2]|0;i=h+4|0;j=b[i>>1]|0;if((j&2)<<16>>16==0){b[i>>1]=j|2;g[h+144>>2]=0.0}h=c[d+52>>2]|0;j=h+4|0;i=b[j>>1]|0;if((i&2)<<16>>16==0){b[j>>1]=i|2;g[h+144>>2]=0.0}a[f]=e&1;g[d+112>>2]=0.0;return}function i5(b){b=b|0;return(a[b+137|0]&1)<<24>>24!=0|0}function i6(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function i7(a){a=a|0;return+(+g[a+128>>2])}function i8(b){b=b|0;return(a[b+61|0]&1)<<24>>24!=0|0}function i9(a){a=a|0;var b=0,d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0.0;b=c[a+48>>2]|0;d=c[a+52>>2]|0;e=+g[a+68>>2]- +g[b+28>>2];f=+g[a+72>>2]- +g[b+32>>2];h=+g[b+24>>2];i=+g[b+20>>2];j=e*h-f*i;l=h*f+e*i;e=+g[a+76>>2]- +g[d+28>>2];f=+g[a+80>>2]- +g[d+32>>2];m=+g[d+24>>2];n=+g[d+20>>2];o=e*m-f*n;p=m*f+e*n;n=o+ +g[d+44>>2]-(j+ +g[b+44>>2]);e=p+ +g[d+48>>2]-(l+ +g[b+48>>2]);f=+g[a+84>>2];m=+g[a+88>>2];q=h*f-i*m;r=i*f+h*m;a=b+64|0;s=c[a+4>>2]|0;m=(c[k>>2]=c[a>>2]|0,+g[k>>2]);h=(c[k>>2]=s,+g[k>>2]);s=d+64|0;a=c[s+4>>2]|0;f=(c[k>>2]=c[s>>2]|0,+g[k>>2]);i=+g[b+72>>2];t=+g[d+72>>2];u=-0.0-i;return+(e*q*i+n*r*u+(r*((c[k>>2]=a,+g[k>>2])+o*t-h-j*i)+q*(f+p*(-0.0-t)-m-l*u)))}function ja(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0;f=c[d+48>>2]|0;h=f+4|0;i=b[h>>1]|0;if((i&2)<<16>>16==0){b[h>>1]=i|2;g[f+144>>2]=0.0}f=c[d+52>>2]|0;i=f+4|0;h=b[i>>1]|0;if((h&2)<<16>>16!=0){j=d+137|0;k=e&1;a[j]=k;return}b[i>>1]=h|2;g[f+144>>2]=0.0;j=d+137|0;k=e&1;a[j]=k;return}function jb(a){a=a|0;return+(+g[a+100>>2])}function jc(a,b){a=a|0;b=+b;return+(+g[a+116>>2]*b)}function jd(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=c[a+40>>2]|0;e=a+32|0;f=0;while(1){if((f|0)>=(d|0)){break}g=(c[e>>2]|0)+(f<<2)|0;if((c[g>>2]|0)==(b|0)){h=549;break}else{f=f+1|0}}if((h|0)==549){c[g>>2]=-1}g=a+28|0;c[g>>2]=(c[g>>2]|0)-1|0;cm(a|0,b);return}function je(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;g=a+102872|0;c[f>>2]=g;c[f+4>>2]=b;d9(g|0,f,d);i=e;return}function jf(a){a=a|0;d_(a);return}function jg(a,b){a=a|0;b=b|0;dS(a,b);return}function jh(a){a=a|0;var b=0;b=vp(103028)|0;dP(b,a);return b|0}function ji(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;dW(a,b,c,d);return}function jj(a,b){a=a|0;b=b|0;dR(a,b);return}function jk(a,b){a=a|0;b=b|0;return dT(a,b)|0}function jl(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,k=0;f=i;i=i+32|0;h=f|0;j=f+8|0;k=a+102872|0;c[h>>2]=k;c[h+4>>2]=b;g[j+16>>2]=1.0;b=d;d=j;a=c[b+4>>2]|0;c[d>>2]=c[b>>2]|0;c[d+4>>2]=a;a=e;e=j+8|0;d=c[a+4>>2]|0;c[e>>2]=c[a>>2]|0;c[e+4>>2]=d;d7(k|0,h,j);i=f;return}function jm(a){a=a|0;if((a|0)==0){return}dQ(a);vl(a);return}function jn(a){a=a|0;dY(a);return}function jo(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22872]|0)){a[22872]=1}bs[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=376;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 376}function jp(a){a=a|0;var b=0;b=vp(256)|0;fy(b,a);return b|0}function jq(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22768]|0)){a[22768]=1}bQ[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=368;c[g>>2]=c[f>>2]|0;c[g+4>>2]=b;i=e;return 368}function jr(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+24>>2]&511](a);return}function js(a){a=a|0;br[c[(c[a>>2]|0)+16>>2]&511](a);return}function jt(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;b=c[a+102884>>2]|0;if((b|0)<=0){d=0;return d|0}e=c[a+102876>>2]|0;a=0;f=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<2){g=f}else{h=c[e+(a*36&-1)+24>>2]|0;if((h|0)==-1){i=588;break}j=(c[e+((c[e+(a*36&-1)+28>>2]|0)*36&-1)+32>>2]|0)-(c[e+(h*36&-1)+32>>2]|0)|0;h=(j|0)>0?j:-j|0;g=(f|0)>(h|0)?f:h}h=a+1|0;if((h|0)<(b|0)){a=h;f=g}else{d=g;i=592;break}}if((i|0)==588){bd(11392,686,14312,7360);return 0}else if((i|0)==592){return d|0}return 0}function ju(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;if((c[a+102868>>2]&2|0)!=0){bd(10624,109,15664,12392);return 0}d=dg(a|0,152)|0;if((d|0)==0){e=0}else{f=d;di(f,b,a);e=f}c[e+92>>2]=0;f=a+102952|0;c[e+96>>2]=c[f>>2]|0;b=c[f>>2]|0;if((b|0)!=0){c[b+92>>2]=e}c[f>>2]=e;f=a+102960|0;c[f>>2]=(c[f>>2]|0)+1|0;return e|0}function jv(a){a=a|0;return 1}function jw(a,b){a=a|0;b=b|0;return 0}function jx(a){a=a|0;var b=0,d=0.0,e=0.0,f=0.0,h=0.0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0;b=c[a+48>>2]|0;d=+g[b+24>>2];e=+g[a+68>>2];f=+g[b+20>>2];h=+g[a+72>>2];i=c[a+52>>2]|0;j=+g[i+24>>2];k=+g[a+76>>2];l=+g[i+20>>2];m=+g[a+80>>2];n=+g[a+84>>2];o=+g[a+88>>2];return+((+g[i+12>>2]+(j*k-l*m)-(+g[b+12>>2]+(d*e-f*h)))*(d*n-f*o)+(k*l+j*m+ +g[i+16>>2]-(e*f+d*h+ +g[b+16>>2]))*(f*n+d*o))}function jy(a){a=a|0;return c[a+4>>2]|0}function jz(b){b=b|0;return(a[b+136|0]&1)<<24>>24!=0|0}function jA(a){a=a|0;return+(+g[a+124>>2])}function jB(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)<<16>>16==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)<<16>>16!=0;return d|0}function jC(a){a=a|0;return c[a+4>>2]|0}function jD(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function jE(a){a=a|0;return+(+g[a+8>>2])}function jF(a,b){a=a|0;b=b|0;return a+12|0}function jG(a,b){a=a|0;b=b|0;return a+12|0}function jH(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+12|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function jI(a){a=a|0;return a+12|0}function jJ(a){a=a|0;return c[a+48>>2]|0}function jK(a){a=a|0;return c[a+52>>2]|0}function jL(a){a=a|0;return c[a+64>>2]|0}function jM(a){a=a|0;return a+92|0}function jN(a,b){a=a|0;b=+b;g[a+72>>2]=b;return}function jO(a){a=a|0;return c[a+12>>2]|0}function jP(a){a=a|0;return+(+g[a+68>>2])}function jQ(a){a=a|0;return a+76|0}function jR(a,d){a=a|0;d=+d;var e=0,f=0,h=0,i=0;e=c[a+48>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)<<16>>16==0){b[f>>1]=h|2;g[e+144>>2]=0.0}e=c[a+52>>2]|0;h=e+4|0;f=b[h>>1]|0;if((f&2)<<16>>16!=0){i=a+124|0;g[i>>2]=d;return}b[h>>1]=f|2;g[e+144>>2]=0.0;i=a+124|0;g[i>>2]=d;return}function jS(a){a=a|0;return a+84|0}function jT(a){a=a|0;return+(+g[a+124>>2])}function jU(a,b){a=a|0;b=+b;return+(+g[a+112>>2]*b)}function jV(b){b=b|0;return(a[b+128|0]&1)<<24>>24!=0|0}function jW(a){a=a|0;var b=0,d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0;b=c[a+48>>2]|0;d=c[a+52>>2]|0;e=+g[b+24>>2];f=+g[a+76>>2];h=+g[b+20>>2];i=+g[a+80>>2];j=+g[d+24>>2];k=+g[a+84>>2];l=+g[d+20>>2];m=+g[a+88>>2];n=+g[a+92>>2];o=+g[a+96>>2];return+((+g[d+12>>2]+(j*k-l*m)-(+g[b+12>>2]+(e*f-h*i)))*(e*n-h*o)+(k*l+j*m+ +g[d+16>>2]-(f*h+e*i+ +g[b+16>>2]))*(h*n+e*o))}function jX(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function jY(a){a=a|0;return+(+g[a+72>>2])}function jZ(a,d){a=a|0;d=+d;var e=0,f=0,h=0,i=0;e=c[a+48>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)<<16>>16==0){b[f>>1]=h|2;g[e+144>>2]=0.0}e=c[a+52>>2]|0;h=e+4|0;f=b[h>>1]|0;if((f&2)<<16>>16!=0){i=a+120|0;g[i>>2]=d;return}b[h>>1]=f|2;g[e+144>>2]=0.0;i=a+120|0;g[i>>2]=d;return}function j_(b){b=b|0;return(a[b+61|0]&1)<<24>>24!=0|0}function j$(a){a=a|0;return+(+g[(c[a+52>>2]|0)+72>>2]- +g[(c[a+48>>2]|0)+72>>2])}function j0(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0;f=c[d+48>>2]|0;h=f+4|0;i=b[h>>1]|0;if((i&2)<<16>>16==0){b[h>>1]=i|2;g[f+144>>2]=0.0}f=c[d+52>>2]|0;i=f+4|0;h=b[i>>1]|0;if((h&2)<<16>>16!=0){j=d+128|0;k=e&1;a[j]=k;return}b[i>>1]=h|2;g[f+144>>2]=0.0;j=d+128|0;k=e&1;a[j]=k;return}function j1(a){a=a|0;return+(+g[a+120>>2])}function j2(a){a=a|0;return c[a+4>>2]|0}function j3(a,b){a=a|0;b=+b;g[a+68>>2]=b;return}function j4(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)<<16>>16==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)<<16>>16!=0;return d|0}function j5(a,b){a=a|0;b=b|0;var d=0;d=a+4|0;c[d>>2]=c[d>>2]|b;return}function j6(a,b){a=a|0;b=b|0;var d=0;d=a+4|0;c[d>>2]=c[d>>2]&(b^-1);return}function j7(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function j8(a){a=a|0;return c[a+4>>2]|0}function j9(a){a=a|0;return c[a+12>>2]|0}function ka(a){a=a|0;return c[a+48>>2]|0}function kb(a){a=a|0;return c[a+52>>2]|0}function kc(a){a=a|0;return c[a+64>>2]|0}function kd(a){a=a|0;return c[a+4>>2]|0}function ke(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function kf(b){b=b|0;return(a[b+61|0]&1)<<24>>24!=0|0}function kg(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)<<16>>16==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)<<16>>16!=0;return d|0}function kh(a){a=a|0;return c[a+68>>2]|0}function ki(a){a=a|0;return c[a+72>>2]|0}function kj(a,b){a=a|0;b=+b;return+(+bz[c[(c[a>>2]|0)+12>>2]&127](a,b))}function kk(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22864]|0)){a[22864]=1}bs[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=360;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 360}function kl(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+4>>2]&511](a);return}function km(a,b,d){a=a|0;b=b|0;d=+d;bQ[c[(c[a>>2]|0)+28>>2]&127](a,b,d);return}function kn(a,b){a=a|0;b=b|0;return bI[c[(c[a>>2]|0)+8>>2]&255](a,b)|0}function ko(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return bL[c[(c[a>>2]|0)+20>>2]&127](a,b,d,e,f)|0}function kp(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[(c[a>>2]|0)+24>>2]&127](a,b,d,e);return}function kq(a){a=a|0;return bt[c[(c[a>>2]|0)+12>>2]&1023](a)|0}function kr(a,b,d){a=a|0;b=b|0;d=d|0;return by[c[(c[a>>2]|0)+16>>2]&127](a,b,d)|0}function ks(){var a=0;a=vp(20)|0;c[a>>2]=20136;vr(a+4|0,0,16);return a|0}function kt(a,b){a=a|0;b=b|0;aW(a|0,b|0);return}function ku(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22960]|0)){a[22960]=1}bs[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=352;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 352}function kv(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22968]|0)){a[22968]=1}bs[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=344;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 344}function kw(a){a=a|0;var b=0;b=vp(224)|0;go(b,a);return b|0}function kx(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22824]|0)){a[22824]=1}bQ[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=336;c[g>>2]=c[f>>2]|0;c[g+4>>2]=b;i=e;return 336}function ky(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+24>>2]&511](a);return}function kz(a){a=a|0;br[c[(c[a>>2]|0)+16>>2]&511](a);return}function kA(a,b){a=a|0;b=+b;return+(+bz[c[(c[a>>2]|0)+12>>2]&127](a,b))}function kB(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+4>>2]&511](a);return}function kC(a,b){a=a|0;b=b|0;bs[c[(c[a>>2]|0)+28>>2]&511](a,b);return}function kD(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[(c[a>>2]|0)+8>>2]&127](a,b,d,e);return}function kE(a,b,d,e,f){a=a|0;b=b|0;d=+d;e=e|0;f=f|0;bq[c[(c[a>>2]|0)+20>>2]&63](a,b,d,e,f);return}function kF(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[(c[a>>2]|0)+12>>2]&127](a,b,d,e);return}function kG(a,b,d,e){a=a|0;b=b|0;d=+d;e=e|0;bu[c[(c[a>>2]|0)+16>>2]&63](a,b,d,e);return}function kH(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[(c[a>>2]|0)+24>>2]&127](a,b,d,e);return}function kI(){var a=0;a=vp(8)|0;c[a>>2]=19368;c[a+4>>2]=0;return a|0}function kJ(a,b){a=a|0;b=+b;return+(+bz[c[(c[a>>2]|0)+12>>2]&127](a,b))}function kK(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23088]|0)){a[23088]=1}bs[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=328;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 328}function kL(a){a=a|0;br[c[(c[a>>2]|0)+16>>2]&511](a);return}function kM(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23080]|0)){a[23080]=1}bs[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=320;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 320}function kN(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22944]|0)){a[22944]=1}bQ[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=304;c[g>>2]=c[f>>2]|0;c[g+4>>2]=b;i=e;return 304}function kO(a){a=a|0;var b=0;b=vp(276)|0;e7(b,a);return b|0}function kP(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23032]|0)){a[23032]=1}bs[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=296;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 296}function kQ(a,b){a=a|0;b=+b;return+(+bz[c[(c[a>>2]|0)+12>>2]&127](a,b))}function kR(a,d,e){a=a|0;d=+d;e=+e;var f=0,h=0,i=0,j=0;if(d>e){bd(6832,575,17248,11440)}f=a+120|0;do{if(+g[f>>2]==d){if(+g[a+124>>2]!=e){break}return}}while(0);h=c[a+48>>2]|0;i=h+4|0;j=b[i>>1]|0;if((j&2)<<16>>16==0){b[i>>1]=j|2;g[h+144>>2]=0.0}h=c[a+52>>2]|0;j=h+4|0;i=b[j>>1]|0;if((i&2)<<16>>16==0){b[j>>1]=i|2;g[h+144>>2]=0.0}g[f>>2]=d;g[a+124>>2]=e;g[a+112>>2]=0.0;return}function kS(a){a=a|0;return c[a+4>>2]|0}function kT(a){a=a|0;return c[a+64>>2]|0}function kU(a){a=a|0;return c[a+52>>2]|0}function kV(b){b=b|0;return(a[b+61|0]&1)<<24>>24!=0|0}function kW(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function kX(a){a=a|0;return c[a+48>>2]|0}function kY(a){a=a|0;return c[a+12>>2]|0}function kZ(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)<<16>>16==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)<<16>>16!=0;return d|0}function k_(a){a=a|0;return+(+g[a+152>>2])}function k$(a){a=a|0;var b=0,d=0;b=c[a>>2]|0;if((b|0)==-1){d=0;return d|0}d=c[(c[a+4>>2]|0)+(b*36&-1)+32>>2]|0;return d|0}function k0(a){a=a|0;var b=0,d=0.0,e=0,f=0.0,h=0.0,i=0.0,j=0,k=0.0;b=c[a>>2]|0;if((b|0)==-1){d=0.0;return+d}e=c[a+4>>2]|0;f=(+g[e+(b*36&-1)+8>>2]- +g[e+(b*36&-1)>>2]+(+g[e+(b*36&-1)+12>>2]- +g[e+(b*36&-1)+4>>2]))*2.0;b=c[a+12>>2]|0;L887:do{if((b|0)>0){h=0.0;a=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<0){i=h}else{i=h+(+g[e+(a*36&-1)+8>>2]- +g[e+(a*36&-1)>>2]+(+g[e+(a*36&-1)+12>>2]- +g[e+(a*36&-1)+4>>2]))*2.0}j=a+1|0;if((j|0)<(b|0)){h=i;a=j}else{k=i;break L887}}}else{k=0.0}}while(0);d=k/f;return+d}function k1(a){a=a|0;return c[a+48>>2]|0}function k2(a){a=a|0;return c[a+52>>2]|0}function k3(a,b){a=a|0;b=+b;g[a+68>>2]=b;return}function k4(a){a=a|0;return c[a+64>>2]|0}function k5(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function k6(a){a=a|0;return c[a+12>>2]|0}function k7(a){a=a|0;return a+80|0}function k8(a){a=a|0;return a+88|0}function k9(a){a=a|0;return+(+g[a+68>>2])}function la(a){a=a|0;return+(+g[a+72>>2])}function lb(b){b=b|0;return(a[b+61|0]&1)<<24>>24!=0|0}function lc(a){a=a|0;return+(+g[a+96>>2])}function ld(a){a=a|0;return c[a+4>>2]|0}function le(a,b){a=a|0;b=+b;g[a+72>>2]=b;return}function lf(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)<<16>>16==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)<<16>>16!=0;return d|0}function lg(a){a=a|0;return c[a+48>>2]|0}function lh(a){a=a|0;return c[a+52>>2]|0}function li(a){a=a|0;return c[a+64>>2]|0}function lj(a){a=a|0;return+(+g[a+120>>2])}function lk(a){a=a|0;return c[a+12>>2]|0}function ll(a){a=a|0;return a+68|0}function lm(a,d){a=a|0;d=+d;var e=0,f=0,h=0,i=0;e=c[a+48>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)<<16>>16==0){b[f>>1]=h|2;g[e+144>>2]=0.0}e=c[a+52>>2]|0;h=e+4|0;f=b[h>>1]|0;if((f&2)<<16>>16!=0){i=a+108|0;g[i>>2]=d;return}b[h>>1]=f|2;g[e+144>>2]=0.0;i=a+108|0;g[i>>2]=d;return}function ln(a){a=a|0;return a+76|0}function lo(a){a=a|0;return+(+g[(c[a+52>>2]|0)+56>>2]- +g[(c[a+48>>2]|0)+56>>2]- +g[a+116>>2])}function lp(a){a=a|0;return+(+g[a+108>>2])}function lq(a,b){a=a|0;b=+b;return+(+g[a+96>>2]*b)}function lr(b){b=b|0;return(a[b+112|0]&1)<<24>>24!=0|0}function ls(a){a=a|0;br[c[(c[a>>2]|0)+16>>2]&511](a);return}function lt(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+24>>2]&511](a);return}function lu(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23024]|0)){a[23024]=1}bs[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=288;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 288}function lv(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22856]|0)){a[22856]=1}bQ[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=280;c[g>>2]=c[f>>2]|0;c[g+4>>2]=b;i=e;return 280}function lw(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=+f;return+(+bJ[c[(c[a>>2]|0)+8>>2]&63](a,b,d,e,f))}function lx(){var a=0;a=vp(4)|0;c[a>>2]=19608;return a|0}function ly(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+4>>2]&511](a);return}function lz(a){a=a|0;if((a|0)==0){return}vj(c[a+4>>2]|0);vl(a);return}function lA(){var a=0,b=0,d=0,e=0,f=0,g=0;a=vp(28)|0;b=a;c[a>>2]=-1;c[a+12>>2]=16;c[a+8>>2]=0;d=vi(576)|0;e=d;c[a+4>>2]=e;vr(d|0,0,576);f=0;while(1){g=f+1|0;c[e+(f*36&-1)+20>>2]=g;c[e+(f*36&-1)+32>>2]=-1;if((g|0)<15){f=g}else{break}}c[d+560>>2]=-1;c[d+572>>2]=-1;c[a+16>>2]=0;c[a+20>>2]=0;c[a+24>>2]=0;return b|0}function lB(a){a=a|0;cu(a);return}function lC(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0.0,i=0,j=0,l=0;e=ck(a)|0;f=a+4|0;h=+g[b+4>>2]+-.10000000149011612;i=(c[f>>2]|0)+(e*36&-1)|0;j=(g[k>>2]=+g[b>>2]+-.10000000149011612,c[k>>2]|0);l=(g[k>>2]=h,c[k>>2]|0)|0;c[i>>2]=0|j;c[i+4>>2]=l;h=+g[b+12>>2]+.10000000149011612;l=(c[f>>2]|0)+(e*36&-1)+8|0;i=(g[k>>2]=+g[b+8>>2]+.10000000149011612,c[k>>2]|0);b=(g[k>>2]=h,c[k>>2]|0)|0;c[l>>2]=0|i;c[l+4>>2]=b;c[(c[f>>2]|0)+(e*36&-1)+16>>2]=d;c[(c[f>>2]|0)+(e*36&-1)+32>>2]=0;cl(a,e);return e|0}function lD(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return co(a,b,c,d)|0}function lE(a){a=a|0;ct(a);return}function lF(a,b){a=a|0;b=b|0;cm(a,b);return}function lG(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22992]|0)){a[22992]=1}bs[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=272;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 272}function lH(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23e3]|0)){a[23e3]=1}bs[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=264;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 264}function lI(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22840]|0)){a[22840]=1}bQ[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=256;c[g>>2]=c[f>>2]|0;c[g+4>>2]=b;i=e;return 256}function lJ(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+24>>2]&511](a);return}function lK(a){a=a|0;br[c[(c[a>>2]|0)+16>>2]&511](a);return}function lL(a,b){a=a|0;b=+b;return+(+bz[c[(c[a>>2]|0)+12>>2]&127](a,b))}function lM(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22888]|0)){a[22888]=1}bs[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=248;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 248}function lN(a,b){a=a|0;b=+b;if(b==b&!(D=0.0,D!=D)&b>+-q&b<+q){g[a+152>>2]=b;return}else{bd(7384,398,18616,6992)}}function lO(a,b){a=a|0;b=b|0;do{if((b|0)>-1){if((c[a+12>>2]|0)<=(b|0)){break}return(c[a+4>>2]|0)+(b*36&-1)|0}}while(0);bd(10360,159,14456,9904);return 0}function lP(a,b){a=a|0;b=b|0;do{if((b|0)>-1){if((c[a+12>>2]|0)<=(b|0)){break}return c[(c[a+4>>2]|0)+(b*36&-1)+16>>2]|0}}while(0);bd(10360,153,14408,9904);return 0}function lQ(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;b=c[a+12>>2]|0;if((b|0)<=0){d=0;return d|0}e=c[a+4>>2]|0;a=0;f=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<2){g=f}else{h=c[e+(a*36&-1)+24>>2]|0;if((h|0)==-1){i=891;break}j=(c[e+((c[e+(a*36&-1)+28>>2]|0)*36&-1)+32>>2]|0)-(c[e+(h*36&-1)+32>>2]|0)|0;h=(j|0)>0?j:-j|0;g=(f|0)>(h|0)?f:h}h=a+1|0;if((h|0)<(b|0)){a=h;f=g}else{d=g;i=896;break}}if((i|0)==891){bd(11392,686,14312,7360);return 0}else if((i|0)==896){return d|0}return 0}function lR(b){b=b|0;var d=0,e=0,f=0,h=0;d=vp(208)|0;e=d;c[e>>2]=19312;f=c[b+8>>2]|0;h=c[b+12>>2]|0;if((f|0)!=(h|0)){c[d+4>>2]=c[b>>2]|0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+48>>2]=f;c[d+52>>2]=h;c[d+56>>2]=0;a[d+61|0]=a[b+16|0]&1;a[d+60|0]=0;c[d+64>>2]=c[b+4>>2]|0;vr(d+16|0,0,32);c[e>>2]=20344;e=b+20|0;h=d+80|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2]|0;c[h+4>>2]=f;f=b+28|0;h=d+88|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=e;g[d+96>>2]=+g[b+36>>2];g[d+68>>2]=+g[b+40>>2];g[d+72>>2]=+g[b+44>>2];g[d+104>>2]=0.0;g[d+108>>2]=0.0;g[d+112>>2]=0.0;return d|0}bd(7272,173,15744,9072);return 0}function lS(b){b=b|0;var d=0,e=0,f=0,h=0;d=vp(228)|0;e=d;c[e>>2]=19312;f=c[b+8>>2]|0;h=c[b+12>>2]|0;if((f|0)!=(h|0)){c[d+4>>2]=c[b>>2]|0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+48>>2]=f;c[d+52>>2]=h;c[d+56>>2]=0;a[d+61|0]=a[b+16|0]&1;a[d+60|0]=0;c[d+64>>2]=c[b+4>>2]|0;vr(d+16|0,0,32);c[e>>2]=19768;e=b+20|0;h=d+68|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2]|0;c[h+4>>2]=f;f=b+28|0;h=d+76|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=e;g[d+116>>2]=+g[b+36>>2];vr(d+84|0,0,16);g[d+120>>2]=+g[b+44>>2];g[d+124>>2]=+g[b+48>>2];g[d+104>>2]=+g[b+60>>2];g[d+108>>2]=+g[b+56>>2];a[d+112|0]=a[b+40|0]&1;a[d+100|0]=a[b+52|0]&1;c[d+224>>2]=0;return d|0}bd(7272,173,15744,9072);return 0}function lT(a){a=a|0;return}function lU(a){a=a|0;return+0.0}function lV(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0;f=d+112|0;if((e&1|0)==(a[f]&1|0)){return}h=c[d+48>>2]|0;i=h+4|0;j=b[i>>1]|0;if((j&2)<<16>>16==0){b[i>>1]=j|2;g[h+144>>2]=0.0}h=c[d+52>>2]|0;j=h+4|0;i=b[j>>1]|0;if((i&2)<<16>>16==0){b[j>>1]=i|2;g[h+144>>2]=0.0}a[f]=e&1;g[d+92>>2]=0.0;return}function lW(b){b=b|0;return(a[b+100|0]&1)<<24>>24!=0|0}function lX(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function lY(a,d){a=a|0;d=+d;var e=0,f=0,h=0,i=0;e=c[a+48>>2]|0;f=e+4|0;h=b[f>>1]|0;if((h&2)<<16>>16==0){b[f>>1]=h|2;g[e+144>>2]=0.0}e=c[a+52>>2]|0;h=e+4|0;f=b[h>>1]|0;if((f&2)<<16>>16!=0){i=a+104|0;g[i>>2]=d;return}b[h>>1]=f|2;g[e+144>>2]=0.0;i=a+104|0;g[i>>2]=d;return}function lZ(b){b=b|0;return(a[b+61|0]&1)<<24>>24!=0|0}function l_(a){a=a|0;return+(+g[(c[a+52>>2]|0)+72>>2]- +g[(c[a+48>>2]|0)+72>>2])}function l$(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0;f=c[d+48>>2]|0;h=f+4|0;i=b[h>>1]|0;if((i&2)<<16>>16==0){b[h>>1]=i|2;g[f+144>>2]=0.0}f=c[d+52>>2]|0;i=f+4|0;h=b[i>>1]|0;if((h&2)<<16>>16!=0){j=d+100|0;k=e&1;a[j]=k;return}b[i>>1]=h|2;g[f+144>>2]=0.0;j=d+100|0;k=e&1;a[j]=k;return}function l0(a){a=a|0;return+(+g[a+116>>2])}function l1(a){a=a|0;return+(+g[a+104>>2])}function l2(a){a=a|0;return c[a+4>>2]|0}function l3(a){a=a|0;return+(+g[a+124>>2])}function l4(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)<<16>>16==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)<<16>>16!=0;return d|0}function l5(a){a=a|0;return c[a+4>>2]|0}function l6(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function l7(a){a=a|0;return+(+g[a+8>>2])}function l8(a){a=a|0;return c[a+12>>2]|0}function l9(a){a=a|0;return c[a+16>>2]|0}function ma(b,d){b=b|0;d=d|0;var e=0,f=0;e=d;d=b+20|0;f=c[e+4>>2]|0;c[d>>2]=c[e>>2]|0;c[d+4>>2]=f;a[b+36|0]=1;return}function mb(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function mc(b,d){b=b|0;d=d|0;var e=0,f=0;e=d;d=b+28|0;f=c[e+4>>2]|0;c[d>>2]=c[e>>2]|0;c[d+4>>2]=f;a[b+37|0]=1;return}function md(a,b){a=a|0;b=b|0;c[a+16>>2]=b;return}function me(a){a=a|0;return c[a+12>>2]|0}function mf(a){a=a|0;return+(+g[a+84>>2])}function mg(a){a=a|0;return c[a+48>>2]|0}function mh(b){b=b|0;return(a[b+61|0]&1)<<24>>24!=0|0}function mi(a){a=a|0;return c[a+64>>2]|0}function mj(a){a=a|0;return c[a+4>>2]|0}function mk(a){a=a|0;return c[a+52>>2]|0}function ml(a){a=a|0;return a+68|0}function mm(a,b){a=a|0;b=+b;g[a+84>>2]=b;return}function mn(a){a=a|0;return a+76|0}function mo(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function mp(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22776]|0)){a[22776]=1}bQ[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=240;c[g>>2]=c[f>>2]|0;c[g+4>>2]=b;i=e;return 240}function mq(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+24>>2]&511](a);return}function mr(a){a=a|0;br[c[(c[a>>2]|0)+16>>2]&511](a);return}function ms(a,b){a=a|0;b=+b;return+(+bz[c[(c[a>>2]|0)+12>>2]&127](a,b))}function mt(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22880]|0)){a[22880]=1}bs[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=232;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 232}function mu(){return vp(1)|0}function mv(a){a=a|0;if((a|0)==0){return}vl(a|0);return}function mw(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+4>>2]&511](a);return}function mx(){var a=0;a=vp(4)|0;c[a>>2]=19640;return a|0}function my(a,b){a=a|0;b=b|0;bs[c[(c[a>>2]|0)+12>>2]&511](a,b);return}function mz(a,b){a=a|0;b=b|0;bs[c[(c[a>>2]|0)+8>>2]&511](a,b);return}function mA(a,b,d){a=a|0;b=b|0;d=d|0;bO[c[(c[a>>2]|0)+16>>2]&127](a,b,d);return}function mB(a,b,d){a=a|0;b=b|0;d=d|0;bO[c[(c[a>>2]|0)+20>>2]&127](a,b,d);return}function mC(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+4>>2]&511](a);return}function mD(a,b,d){a=a|0;b=b|0;d=+d;bQ[c[(c[a>>2]|0)+28>>2]&127](a,b,d);return}function mE(a,b){a=a|0;b=b|0;return bI[c[(c[a>>2]|0)+8>>2]&255](a,b)|0}function mF(a,b,c){a=a|0;b=b|0;c=c|0;cY(a,b,c);return}function mG(){var b=0;b=vp(40)|0;c[b>>2]=20296;c[b+4>>2]=3;g[b+8>>2]=.009999999776482582;c[b+12>>2]=0;c[b+16>>2]=0;a[b+36|0]=0;a[b+37|0]=0;return b|0}function mH(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[(c[a>>2]|0)+24>>2]&127](a,b,d,e);return}function mI(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return bL[c[(c[a>>2]|0)+20>>2]&127](a,b,d,e,f)|0}function mJ(a){a=a|0;return bt[c[(c[a>>2]|0)+12>>2]&1023](a)|0}function mK(a,b,d){a=a|0;b=b|0;d=d|0;return by[c[(c[a>>2]|0)+16>>2]&127](a,b,d)|0}function mL(a,b){a=a|0;b=b|0;return bI[c[(c[a>>2]|0)+8>>2]&255](a,b)|0}function mM(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+4>>2]&511](a);return}function mN(){var a=0;a=vp(4)|0;c[a>>2]=19824;return a|0}function mO(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;if((a|0)==0){return}b=a+4|0;d=a|0;e=c[d>>2]|0;L1145:do{if((c[b>>2]|0)>0){f=0;g=e;while(1){vj(c[g+(f<<3)+4>>2]|0);h=f+1|0;i=c[d>>2]|0;if((h|0)<(c[b>>2]|0)){f=h;g=i}else{j=i;break L1145}}}else{j=e}}while(0);vj(j);vl(a);return}function mP(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+4|0;d=a|0;L1151:do{if((c[b>>2]|0)>0){e=0;while(1){vj(c[(c[d>>2]|0)+(e<<3)+4>>2]|0);f=e+1|0;if((f|0)<(c[b>>2]|0)){e=f}else{break L1151}}}}while(0);c[b>>2]=0;vr(c[d>>2]|0,0,c[a+8>>2]<<3|0);vr(a+12|0,0,56);return}function mQ(a,b){a=a|0;b=b|0;return dg(a,b)|0}function mR(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+24>>2]&511](a);return}function mS(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23016]|0)){a[23016]=1}bs[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=216;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 216}function mT(a,b){a=a|0;b=+b;return+(+bz[c[(c[a>>2]|0)+12>>2]&127](a,b))}function mU(a){a=a|0;br[c[(c[a>>2]|0)+16>>2]&511](a);return}function mV(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[23008]|0)){a[23008]=1}bs[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=208;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 208}function mW(a,d,e){a=a|0;d=+d;e=+e;var f=0,h=0,i=0,j=0;if(d>e){bd(6488,473,17496,11440)}f=a+120|0;do{if(+g[f>>2]==d){if(+g[a+124>>2]!=e){break}return}}while(0);h=c[a+48>>2]|0;i=h+4|0;j=b[i>>1]|0;if((j&2)<<16>>16==0){b[i>>1]=j|2;g[h+144>>2]=0.0}h=c[a+52>>2]|0;j=h+4|0;i=b[j>>1]|0;if((i&2)<<16>>16==0){b[j>>1]=i|2;g[h+144>>2]=0.0}g[a+92>>2]=0.0;g[f>>2]=d;g[a+124>>2]=e;return}function mX(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+12|0;if((c[f>>2]|0)!=0){bd(6208,48,18448,11256)}g=b+16|0;if((c[g>>2]|0)!=0){bd(6208,48,18448,11256)}if((e|0)>1){c[g>>2]=e;h=vi(e<<3)|0;c[f>>2]=h;vq(h|0,d|0,c[g>>2]<<3);a[b+36|0]=0;a[b+37|0]=0;return}else{bd(6208,49,18448,6736)}}function mY(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+12|0;if((c[f>>2]|0)!=0){bd(6208,34,18504,11256)}g=b+16|0;if((c[g>>2]|0)!=0){bd(6208,34,18504,11256)}if((e|0)>2){h=e+1|0;c[g>>2]=h;i=vi(h<<3)|0;c[f>>2]=i;vq(i|0,d|0,e<<3);d=c[f>>2]|0;i=d;h=d+(e<<3)|0;e=c[i+4>>2]|0;c[h>>2]=c[i>>2]|0;c[h+4>>2]=e;e=c[f>>2]|0;f=e+((c[g>>2]|0)-2<<3)|0;g=b+20|0;h=c[f+4>>2]|0;c[g>>2]=c[f>>2]|0;c[g+4>>2]=h;h=e+8|0;e=b+28|0;g=c[h+4>>2]|0;c[e>>2]=c[h>>2]|0;c[e+4>>2]=g;a[b+36|0]=1;a[b+37|0]=1;return}else{bd(6208,35,18504,5016)}}function mZ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)==0){return}if((e|0)<=0){bd(5352,164,17448,8376)}if((e|0)>640){vj(d);return}f=a[e+22040|0]|0;if((f&255)>=14){bd(5352,173,17448,6544)}e=b+12+((f&255)<<2)|0;c[d>>2]=c[e>>2]|0;c[e>>2]=d;return}function m_(){var b=0,d=0,e=0,f=0,g=0,h=0,i=0;b=vp(68)|0;d=b;c[b+8>>2]=128;c[b+4>>2]=0;e=vi(1024)|0;c[b>>2]=e;vr(e|0,0,1024);vr(b+12|0,0,56);if((a[22032]&1)<<24>>24==0){f=0;g=1}else{return d|0}while(1){if((f|0)>=14){h=1080;break}if((g|0)>(c[22688+(f<<2)>>2]|0)){b=f+1|0;a[g+22040|0]=b&255;i=b}else{a[g+22040|0]=f&255;i=f}b=g+1|0;if((b|0)<641){f=i;g=b}else{h=1086;break}}if((h|0)==1080){bd(5352,73,17368,10976);return 0}else if((h|0)==1086){a[22032]=1;return d|0}return 0}function m$(a){a=a|0;return c[a+164>>2]|0}function m0(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)<<16>>16==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)<<16>>16!=0;return d|0}function m1(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function m2(a){a=a|0;return+(+g[a+8>>2])}function m3(a,b){a=a|0;b=b|0;return a+20+(b<<3)|0}function m4(a,b,d){a=a|0;b=+b;d=+d;var e=0.0,f=0.0;c[a+148>>2]=4;e=-0.0-b;f=-0.0-d;g[a+20>>2]=e;g[a+24>>2]=f;g[a+28>>2]=b;g[a+32>>2]=f;g[a+36>>2]=b;g[a+40>>2]=d;g[a+44>>2]=e;g[a+48>>2]=d;g[a+84>>2]=0.0;g[a+88>>2]=-1.0;g[a+92>>2]=1.0;g[a+96>>2]=0.0;g[a+100>>2]=0.0;g[a+104>>2]=1.0;g[a+108>>2]=-1.0;g[a+112>>2]=0.0;g[a+12>>2]=0.0;g[a+16>>2]=0.0;return}function m5(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+12|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function m6(a,b){a=a|0;b=b|0;c[a+148>>2]=b;return}function m7(a){a=a|0;return c[a+148>>2]|0}function m8(a){a=a|0;return c[a+4>>2]|0}function m9(a){a=a|0;return c[a+148>>2]|0}function na(a){a=a|0;return a+12|0}function nb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;f=d;d=b+12|0;g=c[f+4>>2]|0;c[d>>2]=c[f>>2]|0;c[d+4>>2]=g;g=e;e=b+20|0;d=c[g+4>>2]|0;c[e>>2]=c[g>>2]|0;c[e+4>>2]=d;a[b+44|0]=0;a[b+45|0]=0;return}function nc(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function nd(a){a=a|0;return+(+g[a+8>>2])}function ne(a){a=a|0;return c[a+4>>2]|0}function nf(a){a=a|0;return c[a+12>>2]|0}function ng(a,b){a=a|0;b=b|0;var d=0;d=a+4|0;a=c[d>>2]|0;c[d>>2]=b?a|4:a&-5;return}function nh(a){a=a|0;return+(+g[a+140>>2])}function ni(a){a=a|0;return+(+g[a+136>>2])}function nj(a){a=a|0;return(c[a+4>>2]&2|0)!=0|0}function nk(a){a=a|0;return(c[a+4>>2]&4|0)!=0|0}function nl(a){a=a|0;return c[a+52>>2]|0}function nm(a,b){a=a|0;b=+b;g[a+136>>2]=b;return}function nn(a){a=a|0;return c[a+48>>2]|0}function no(a){a=a|0;return c[a+56>>2]|0}function np(a){a=a|0;return c[a+60>>2]|0}function nq(a,b){a=a|0;b=+b;g[a+140>>2]=b;return}function nr(a){a=a|0;return a+64|0}function ns(a){a=a|0;var b=0.0,d=0.0;b=+g[(c[a+48>>2]|0)+20>>2];d=+g[(c[a+52>>2]|0)+20>>2];g[a+140>>2]=b>d?b:d;return}function nt(a){a=a|0;return+(+g[a+8>>2])}function nu(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function nv(a){a=a|0;return c[a+4>>2]|0}function nw(a){a=a|0;return+(+g[a+56>>2])}function nx(a){a=a|0;return c[a+148>>2]|0}function ny(a){a=a|0;return(b[a+4>>1]&4)<<16>>16!=0|0}function nz(a,b){a=a|0;b=+b;g[a+136>>2]=b;return}function nA(a,b){a=a|0;b=+b;g[a+140>>2]=b;return}function nB(a,b){a=a|0;b=b|0;c[a+148>>2]=b;return}function nC(a){a=a|0;return+(+g[a+72>>2])}function nD(a){a=a|0;return c[a+100>>2]|0}function nE(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,h=0;if((c[a>>2]|0)!=2){return}f=a+4|0;h=b[f>>1]|0;if((h&2)<<16>>16==0){b[f>>1]=h|2;g[a+144>>2]=0.0}h=d|0;f=a+76|0;g[f>>2]=+g[h>>2]+ +g[f>>2];f=d+4|0;d=a+80|0;g[d>>2]=+g[f>>2]+ +g[d>>2];d=a+84|0;g[d>>2]=+g[d>>2]+((+g[e>>2]- +g[a+44>>2])*+g[f>>2]-(+g[e+4>>2]- +g[a+48>>2])*+g[h>>2]);return}function nF(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0;if(!(a[23064]|0)){a[23064]=1}e=+g[d>>2]- +g[b+12>>2];f=+g[d+4>>2]- +g[b+16>>2];h=+g[b+24>>2];i=+g[b+20>>2];b=(g[k>>2]=e*h+f*i,c[k>>2]|0);d=(g[k>>2]=h*f+e*(-0.0-i),c[k>>2]|0)|0;j=192;c[j>>2]=0|b;c[j+4>>2]=d;return 192}function nG(a,d){a=a|0;d=d|0;var e=0.0,f=0.0,h=0,i=0;if((c[a>>2]|0)==0){return}e=+g[d>>2];f=+g[d+4>>2];do{if(e*e+f*f>0.0){h=a+4|0;i=b[h>>1]|0;if((i&2)<<16>>16!=0){break}b[h>>1]=i|2;g[a+144>>2]=0.0}}while(0);i=d;d=a+64|0;a=c[i+4>>2]|0;c[d>>2]=c[i>>2]|0;c[d+4>>2]=a;return}function nH(a){a=a|0;return c[a+108>>2]|0}function nI(b){b=b|0;var d=0,e=0;if(!(a[22952]|0)){a[22952]=1}d=b+64|0;b=c[d+4>>2]|0;e=184;c[e>>2]=c[d>>2]|0;c[e+4>>2]=b;return 184}function nJ(a){a=a|0;return c[a+96>>2]|0}function nK(a,c){a=a|0;c=c|0;var d=0,e=0;d=a+4|0;e=b[d>>1]|0;if(c){b[d>>1]=e|4;return}c=e&-5;b[d>>1]=c;if((e&2)<<16>>16!=0){return}b[d>>1]=c|2;g[a+144>>2]=0.0;return}function nL(a){a=a|0;return+(+g[a+116>>2])}function nM(a,d){a=a|0;d=+d;var e=0,f=0;if((c[a>>2]|0)==0){return}do{if(d*d>0.0){e=a+4|0;f=b[e>>1]|0;if((f&2)<<16>>16!=0){break}b[e>>1]=f|2;g[a+144>>2]=0.0}}while(0);g[a+72>>2]=d;return}function nN(a,b){a=a|0;b=b|0;var d=0,e=0,f=0.0,h=0.0;d=a+116|0;g[b>>2]=+g[d>>2];e=a+28|0;f=+g[e>>2];h=+g[a+32>>2];g[b+12>>2]=+g[a+124>>2]+ +g[d>>2]*(f*f+h*h);d=e;e=b+4|0;b=c[d+4>>2]|0;c[e>>2]=c[d>>2]|0;c[e+4>>2]=b;return}function nO(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0;if(!(a[22752]|0)){a[22752]=1}e=+g[b+72>>2];f=e*(+g[d>>2]- +g[b+44>>2])+ +g[b+68>>2];h=(g[k>>2]=+g[b+64>>2]+(+g[d+4>>2]- +g[b+48>>2])*(-0.0-e),c[k>>2]|0);b=(g[k>>2]=f,c[k>>2]|0)|0;d=176;c[d>>2]=0|h;c[d+4>>2]=b;return 176}function nP(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22848]|0)){a[22848]=1}bQ[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=200;c[g>>2]=c[f>>2]|0;c[g+4>>2]=b;i=e;return 200}function nQ(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+4>>2]&511](a);return}function nR(a,b,c){a=a|0;b=b|0;c=c|0;dd(a,b,c);return}function nS(a,b,d){a=a|0;b=b|0;d=+d;bQ[c[(c[a>>2]|0)+28>>2]&127](a,b,d);return}function nT(a,b){a=a|0;b=b|0;return bI[c[(c[a>>2]|0)+8>>2]&255](a,b)|0}function nU(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return bL[c[(c[a>>2]|0)+20>>2]&127](a,b,d,e,f)|0}function nV(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;cX(a,b,c,d,e);return}function nW(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[(c[a>>2]|0)+24>>2]&127](a,b,d,e);return}function nX(a){a=a|0;return bt[c[(c[a>>2]|0)+12>>2]&1023](a)|0}function nY(a,b,d){a=a|0;b=b|0;d=d|0;return by[c[(c[a>>2]|0)+16>>2]&127](a,b,d)|0}function nZ(){var a=0;a=vp(152)|0;c[a>>2]=20032;c[a+4>>2]=2;g[a+8>>2]=.009999999776482582;c[a+148>>2]=0;g[a+12>>2]=0.0;g[a+16>>2]=0.0;return a|0}function n_(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+4>>2]&511](a);return}function n$(a,b,d){a=a|0;b=b|0;d=+d;bQ[c[(c[a>>2]|0)+28>>2]&127](a,b,d);return}function n0(a,b){a=a|0;b=b|0;return bI[c[(c[a>>2]|0)+8>>2]&255](a,b)|0}function n1(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return bL[c[(c[a>>2]|0)+20>>2]&127](a,b,d,e,f)|0}function n2(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[(c[a>>2]|0)+24>>2]&127](a,b,d,e);return}function n3(a){a=a|0;return bt[c[(c[a>>2]|0)+12>>2]&1023](a)|0}function n4(a,b,d){a=a|0;b=b|0;d=d|0;return by[c[(c[a>>2]|0)+16>>2]&127](a,b,d)|0}function n5(){var a=0;a=vp(48)|0;c[a>>2]=20512;c[a+4>>2]=1;g[a+8>>2]=.009999999776482582;vr(a+28|0,0,18);return a|0}function n6(a,b){a=a|0;b=b|0;var d=0,e=0;d=c[a+48>>2]|0;e=c[a+52>>2]|0;ce(b,a+64|0,(c[d+8>>2]|0)+12|0,+g[(c[d+12>>2]|0)+8>>2],(c[e+8>>2]|0)+12|0,+g[(c[e+12>>2]|0)+8>>2]);return}function n7(a){a=a|0;g[a+136>>2]=+Q(+(+g[(c[a+48>>2]|0)+16>>2]*+g[(c[a+52>>2]|0)+16>>2]));return}function n8(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[c[a>>2]>>2]&127](a,b,d,e);return}function n9(a,b,d){a=a|0;b=b|0;d=+d;bQ[c[(c[a>>2]|0)+28>>2]&127](a,b,d);return}function oa(a,b){a=a|0;b=b|0;return bI[c[(c[a>>2]|0)+8>>2]&255](a,b)|0}function ob(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return bL[c[(c[a>>2]|0)+20>>2]&127](a,b,d,e,f)|0}function oc(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bR[c[(c[a>>2]|0)+24>>2]&127](a,b,d,e);return}function od(a){a=a|0;return bt[c[(c[a>>2]|0)+12>>2]&1023](a)|0}function oe(a,b,d){a=a|0;b=b|0;d=d|0;return by[c[(c[a>>2]|0)+16>>2]&127](a,b,d)|0}function of(a,b){a=a|0;b=b|0;du(a,b);return}function og(a,b,c){a=a|0;b=b|0;c=+c;dt(a,b,c);return}function oh(a){a=a|0;dk(a);return}function oi(b){b=b|0;var d=0,e=0,f=0,h=0;d=vp(168)|0;e=d;c[e>>2]=19312;f=c[b+8>>2]|0;h=c[b+12>>2]|0;if((f|0)!=(h|0)){c[d+4>>2]=c[b>>2]|0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+48>>2]=f;c[d+52>>2]=h;c[d+56>>2]=0;a[d+61|0]=a[b+16|0]&1;a[d+60|0]=0;c[d+64>>2]=c[b+4>>2]|0;vr(d+16|0,0,32);c[e>>2]=20400;e=b+20|0;h=d+68|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2]|0;c[h+4>>2]=f;f=b+28|0;h=d+76|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=e;g[d+84>>2]=+g[b+36>>2];g[d+160>>2]=0.0;g[d+92>>2]=0.0;c[d+164>>2]=0;g[d+88>>2]=0.0;return d|0}bd(7272,173,15744,9072);return 0}function oj(a,d){a=a|0;d=d|0;var e=0,f=0;if((c[a>>2]|0)!=2){return}e=a+4|0;f=b[e>>1]|0;if((f&2)<<16>>16==0){b[e>>1]=f|2;g[a+144>>2]=0.0}f=a+76|0;g[f>>2]=+g[d>>2]+ +g[f>>2];f=a+80|0;g[f>>2]=+g[d+4>>2]+ +g[f>>2];return}function ok(a,d){a=a|0;d=+d;var e=0,f=0;if((c[a>>2]|0)!=2){return}e=a+4|0;f=b[e>>1]|0;if((f&2)<<16>>16==0){b[e>>1]=f|2;g[a+144>>2]=0.0}f=a+84|0;g[f>>2]=+g[f>>2]+d;return}function ol(a){a=a|0;return(b[a+4>>1]&2)<<16>>16!=0|0}function om(a){a=a|0;return a+12|0}function on(a){a=a|0;return a+44|0}function oo(a){a=a|0;return+(+g[a+136>>2])}function op(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,h=0,i=0.0,j=0.0;if((c[a>>2]|0)!=2){return}f=a+4|0;h=b[f>>1]|0;if((h&2)<<16>>16==0){b[f>>1]=h|2;g[a+144>>2]=0.0}i=+g[a+120>>2];h=d|0;f=d+4|0;j=i*+g[f>>2];d=a+64|0;g[d>>2]=i*+g[h>>2]+ +g[d>>2];d=a+68|0;g[d>>2]=j+ +g[d>>2];d=a+72|0;g[d>>2]=+g[d>>2]+ +g[a+128>>2]*((+g[e>>2]- +g[a+44>>2])*+g[f>>2]-(+g[e+4>>2]- +g[a+48>>2])*+g[h>>2]);return}function oq(a){a=a|0;return(b[a+4>>1]&16)<<16>>16!=0|0}function or(a){a=a|0;return a+28|0}function os(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0;if(!(a[23040]|0)){a[23040]=1}e=+g[b+24>>2];f=+g[d>>2];h=+g[b+20>>2];i=+g[d+4>>2];d=(g[k>>2]=e*f-h*i,c[k>>2]|0);b=(g[k>>2]=f*h+e*i,c[k>>2]|0)|0;j=168;c[j>>2]=0|d;c[j+4>>2]=b;return 168}function ot(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0;if(!(a[22760]|0)){a[22760]=1}e=+g[b+24>>2];f=+g[d>>2];h=+g[b+20>>2];i=+g[d+4>>2];j=+g[b+72>>2];l=j*(+g[b+12>>2]+(e*f-h*i)- +g[b+44>>2])+ +g[b+68>>2];d=(g[k>>2]=+g[b+64>>2]+(f*h+e*i+ +g[b+16>>2]- +g[b+48>>2])*(-0.0-j),c[k>>2]|0);b=(g[k>>2]=l,c[k>>2]|0)|0;m=160;c[m>>2]=0|d;c[m+4>>2]=b;return 160}function ou(a){a=a|0;return c[a+112>>2]|0}function ov(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,l=0;if(!(a[23056]|0)){a[23056]=1}e=+g[b+24>>2];f=+g[d>>2];h=+g[b+20>>2];i=+g[d+4>>2];j=f*h+e*i+ +g[b+16>>2];d=(g[k>>2]=+g[b+12>>2]+(e*f-h*i),c[k>>2]|0);b=(g[k>>2]=j,c[k>>2]|0)|0;l=152;c[l>>2]=0|d;c[l+4>>2]=b;return 152}function ow(a){a=a|0;return+(+g[a+132>>2])}function ox(a){a=a|0;return(b[a+4>>1]&8)<<16>>16!=0|0}function oy(a){a=a|0;return c[a+88>>2]|0}function oz(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0;if(!(a[23048]|0)){a[23048]=1}e=+g[b+24>>2];f=+g[d>>2];h=+g[b+20>>2];i=+g[d+4>>2];d=(g[k>>2]=e*f+h*i,c[k>>2]|0);b=(g[k>>2]=f*(-0.0-h)+e*i,c[k>>2]|0)|0;j=144;c[j>>2]=0|d;c[j+4>>2]=b;return 144}function oA(a,b){a=a|0;b=+b;g[a+132>>2]=b;return}function oB(a,c){a=a|0;c=c|0;var d=0;d=a+4|0;a=b[d>>1]|0;b[d>>1]=c?a|8:a&-9;return}function oC(a){a=a|0;return c[a>>2]|0}function oD(a){a=a|0;return+(+g[a+140>>2])}function oE(a){a=a|0;var b=0.0,c=0.0;b=+g[a+28>>2];c=+g[a+32>>2];return+(+g[a+124>>2]+ +g[a+116>>2]*(b*b+c*c))}function oF(a){a=a|0;return(b[a+4>>1]&32)<<16>>16!=0|0}function oG(a,d){a=a|0;d=+d;var e=0,f=0;if((c[a>>2]|0)!=2){return}e=a+4|0;f=b[e>>1]|0;if((f&2)<<16>>16==0){b[e>>1]=f|2;g[a+144>>2]=0.0}f=a+72|0;g[f>>2]=+g[f>>2]+ +g[a+128>>2]*d;return}function oH(a){a=a|0;return a+12|0}function oI(a){a=a|0;return+(+g[a+96>>2])}function oJ(b){b=b|0;return(a[b+61|0]&1)<<24>>24!=0|0}function oK(a){a=a|0;return c[a+64>>2]|0}function oL(a){a=a|0;return c[a+4>>2]|0}function oM(a){a=a|0;return c[a+52>>2]|0}function oN(a){a=a|0;return a+68|0}function oO(a){a=a|0;return a+76|0}function oP(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function oQ(a){a=a|0;return c[a+48>>2]|0}function oR(a){a=a|0;return c[a+12>>2]|0}function oS(a){a=a|0;return+(+g[a+100>>2])}function oT(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)<<16>>16==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)<<16>>16!=0;return d|0}function oU(a){a=a|0;return c[a+102408>>2]|0}function oV(a,c){a=a|0;c=c|0;b[a+2>>1]=c;return}function oW(a,c){a=a|0;c=c|0;b[a>>1]=c;return}function oX(a){a=a|0;return b[a+4>>1]|0}function oY(a,b){a=a|0;b=b|0;dj(a,b);return}function oZ(a,b){a=a|0;b=b|0;return dl(a,b)|0}function o_(d,e,f){d=d|0;e=e|0;f=+f;var h=0,j=0;h=i;i=i+32|0;j=h|0;b[j+22>>1]=1;b[j+24>>1]=-1;b[j+26>>1]=0;c[j+4>>2]=0;g[j+8>>2]=.20000000298023224;g[j+12>>2]=0.0;a[j+20|0]=0;c[j>>2]=e;g[j+16>>2]=f;e=dl(d,j)|0;i=h;return e|0}function o$(a,b){a=a|0;b=b|0;ds(a,b);return}function o0(a,c){a=a|0;c=c|0;var d=0,e=0;d=a+4|0;e=b[d>>1]|0;if(!c){b[d>>1]=e&-3;g[a+144>>2]=0.0;vr(a+64|0,0,24);return}if((e&2)<<16>>16!=0){return}b[d>>1]=e|2;g[a+144>>2]=0.0;return}function o1(a){a=a|0;dp(a);return}function o2(a,b){a=a|0;b=b|0;dr(a,b);return}function o3(a,c){a=a|0;c=c|0;var d=0,e=0;d=a+4|0;e=b[d>>1]|0;b[d>>1]=c?e|16:e&-17;dk(a);return}function o4(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22904]|0)){a[22904]=1}bs[c[c[b>>2]>>2]&511](e,b);b=c[e+4>>2]|0;f=128;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 128}function o5(a,b){a=a|0;b=+b;return+(+bz[c[(c[a>>2]|0)+12>>2]&127](a,b))}function o6(a){a=a|0;br[c[(c[a>>2]|0)+16>>2]&511](a);return}function o7(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+24>>2]&511](a);return}function o8(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;if(!(a[22896]|0)){a[22896]=1}bs[c[(c[b>>2]|0)+4>>2]&511](e,b);b=c[e+4>>2]|0;f=120;c[f>>2]=c[e>>2]|0;c[f+4>>2]=b;i=d;return 120}function o9(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;if(!(a[22784]|0)){a[22784]=1}bQ[c[(c[b>>2]|0)+8>>2]&127](f,b,d);b=c[f+4>>2]|0;g=112;c[g>>2]=c[f>>2]|0;c[g+4>>2]=b;i=e;return 112}function pa(){var a=0;a=vp(102800)|0;c[a+102400>>2]=0;c[a+102404>>2]=0;c[a+102408>>2]=0;c[a+102796>>2]=0;return a|0}function pb(a,b){a=a|0;b=b|0;dh(a,b);return}function pc(a){a=a|0;if((a|0)==0){return}br[c[(c[a>>2]|0)+4>>2]&511](a);return}function pd(a,b){a=a|0;b=b|0;bs[c[(c[a>>2]|0)+8>>2]&511](a,b);return}function pe(){var a=0;a=vp(4)|0;c[a>>2]=19576;return a|0}function pf(a){a=a|0;if((a|0)==0){return}vl(a);return}function pg(a,b){a=a|0;b=+b;do{if(b==b&!(D=0.0,D!=D)&b>+-q){if(!(b<+q&b>=0.0)){break}g[a+100>>2]=b;return}}while(0);bd(7624,228,17552,9328)}function ph(a,b){a=a|0;b=+b;do{if(b==b&!(D=0.0,D!=D)&b>+-q){if(!(b<+q&b>=0.0)){break}g[a+96>>2]=b;return}}while(0);bd(7624,217,17600,11752)}function pi(b){b=b|0;var d=0,e=0,f=0,h=0;d=vp(180)|0;e=d;c[e>>2]=19312;f=c[b+8>>2]|0;h=c[b+12>>2]|0;if((f|0)!=(h|0)){c[d+4>>2]=c[b>>2]|0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+48>>2]=f;c[d+52>>2]=h;c[d+56>>2]=0;a[d+61|0]=a[b+16|0]&1;a[d+60|0]=0;c[d+64>>2]=c[b+4>>2]|0;vr(d+16|0,0,32);c[e>>2]=19856;e=b+20|0;h=d+68|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2]|0;c[h+4>>2]=f;f=b+28|0;h=d+76|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=e;g[d+84>>2]=0.0;g[d+88>>2]=0.0;g[d+92>>2]=0.0;g[d+96>>2]=+g[b+36>>2];g[d+100>>2]=+g[b+40>>2];return d|0}bd(7272,173,15744,9072);return 0}function pj(a){a=a|0;if((a|0)==0){return}if((c[a+102400>>2]|0)!=0){bd(4840,32,17e3,10664)}if((c[a+102796>>2]|0)==0){vl(a|0);return}else{bd(4840,33,17e3,7952)}}function pk(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b+102796|0;f=c[e>>2]|0;if((f|0)>=32){bd(4840,38,17040,6448);return 0}g=b+102412+(f*12&-1)|0;c[b+102412+(f*12&-1)+4>>2]=d;h=b+102400|0;i=c[h>>2]|0;if((i+d|0)>102400){c[g>>2]=vi(d)|0;a[b+102412+(f*12&-1)+8|0]=1}else{c[g>>2]=b+i|0;a[b+102412+(f*12&-1)+8|0]=0;c[h>>2]=(c[h>>2]|0)+d|0}h=b+102404|0;f=(c[h>>2]|0)+d|0;c[h>>2]=f;h=b+102408|0;b=c[h>>2]|0;c[h>>2]=(b|0)>(f|0)?b:f;c[e>>2]=(c[e>>2]|0)+1|0;return c[g>>2]|0}function pl(a,c){a=a|0;c=c|0;b[a+4>>1]=c;return}function pm(a){a=a|0;return b[a+2>>1]|0}function pn(a){a=a|0;return b[a>>1]|0}function po(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function pp(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function pq(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function pr(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function ps(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function pt(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function pu(a){a=a|0;return+(+g[a+36>>2])}function pv(a){a=a|0;return a+20|0}function pw(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function px(a){a=a|0;return a+28|0}function py(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)<<24>>24!=0|0}function pz(a,b){a=a|0;b=+b;g[a+40>>2]=b;return}function pA(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function pB(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0.0,i=0,j=0.0,l=0.0,m=0.0,n=0;c[a+8>>2]=b;c[a+12>>2]=d;f=e|0;h=+g[f>>2]- +g[b+12>>2];i=e+4|0;j=+g[i>>2]- +g[b+16>>2];l=+g[b+24>>2];m=+g[b+20>>2];b=a+20|0;e=(g[k>>2]=h*l+j*m,c[k>>2]|0);n=(g[k>>2]=l*j+h*(-0.0-m),c[k>>2]|0)|0;c[b>>2]=0|e;c[b+4>>2]=n;m=+g[f>>2]- +g[d+12>>2];h=+g[i>>2]- +g[d+16>>2];j=+g[d+24>>2];l=+g[d+20>>2];d=a+28|0;a=(g[k>>2]=m*j+h*l,c[k>>2]|0);i=(g[k>>2]=j*h+m*(-0.0-l),c[k>>2]|0)|0;c[d>>2]=0|a;c[d+4>>2]=i;return}function pC(a){a=a|0;return+(+g[a+40>>2])}function pD(a){a=a|0;return+(+g[a+28>>2])}function pE(b){b=b|0;return(a[b+37|0]&1)<<24>>24!=0|0}function pF(a){a=a|0;return c[a>>2]|0}function pG(b){b=b|0;return(a[b+36|0]&1)<<24>>24!=0|0}function pH(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+4|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function pI(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+16|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function pJ(b){b=b|0;return(a[b+39|0]&1)<<24>>24!=0|0}function pK(a){a=a|0;return c[a+44>>2]|0}function pL(a,b){a=a|0;b=+b;g[a+32>>2]=b;return}function pM(b,c){b=b|0;c=c|0;a[b+38|0]=c&1;return}function pN(b,c){b=b|0;c=c|0;a[b+36|0]=c&1;return}function pO(a){a=a|0;return+(+g[a+48>>2])}function pP(a,b){a=a|0;b=+b;g[a+24>>2]=b;return}function pQ(a,b){a=a|0;b=b|0;c[a+44>>2]=b;return}function pR(a){a=a|0;return a+4|0}function pS(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function pT(a,b){a=a|0;b=+b;g[a+48>>2]=b;return}function pU(a){a=a|0;return+(+g[a+32>>2])}function pV(b,c){b=b|0;c=c|0;a[b+39|0]=c&1;return}function pW(b,c){b=b|0;c=c|0;a[b+40|0]=c&1;return}function pX(a,b){a=a|0;b=+b;g[a+12>>2]=b;return}function pY(a){a=a|0;return+(+g[a+12>>2])}function pZ(a){a=a|0;return+(+g[a+24>>2])}function p_(a){a=a|0;return a+16|0}function p$(b){b=b|0;return(a[b+40|0]&1)<<24>>24!=0|0}function p0(a,b){a=a|0;b=+b;g[a+28>>2]=b;return}function p1(b){b=b|0;return(a[b+38|0]&1)<<24>>24!=0|0}function p2(b,c){b=b|0;c=c|0;a[b+37|0]=c&1;return}function p3(a,b){a=a|0;b=+b;g[a>>2]=b;return}function p4(a,b,c){a=a|0;b=+b;c=+c;g[a>>2]=b;g[a+4>>2]=c;return}function p5(a){a=a|0;return+(+g[a>>2])}function p6(a){a=a|0;return+(+g[a+4>>2])}function p7(a,b){a=a|0;b=+b;g[a+4>>2]=b;return}function p8(a){a=a|0;var b=0.0,c=0;b=+g[a>>2];if(!(b==b&!(D=0.0,D!=D)&b>+-q&b<+q)){c=0;return c|0}b=+g[a+4>>2];if(!(b==b&!(D=0.0,D!=D)&b>+-q)){c=0;return c|0}c=b<+q;return c|0}function p9(b){b=b|0;var d=0.0,e=0,f=0;if(!(a[23144]|0)){a[23144]=1}d=+g[b>>2];e=(g[k>>2]=-0.0- +g[b+4>>2],c[k>>2]|0);b=(g[k>>2]=d,c[k>>2]|0)|0;f=104;c[f>>2]=0|e;c[f+4>>2]=b;return 104}function qa(a){a=a|0;var b=0.0,c=0.0;b=+g[a>>2];c=+g[a+4>>2];return+(b*b+c*c)}function qb(a,b){a=a|0;b=b|0;var c=0;c=a|0;g[c>>2]=+g[b>>2]+ +g[c>>2];c=a+4|0;g[c>>2]=+g[b+4>>2]+ +g[c>>2];return}function qc(a){a=a|0;g[a>>2]=0.0;g[a+4>>2]=0.0;return}function qd(a,b){a=a|0;b=+b;var c=0;c=a|0;g[c>>2]=+g[c>>2]*b;c=a+4|0;g[c>>2]=+g[c>>2]*b;return}function qe(b){b=b|0;var d=0.0,e=0,f=0;if(!(a[23136]|0)){a[23136]=1}d=-0.0- +g[b+4>>2];e=(g[k>>2]=-0.0- +g[b>>2],c[k>>2]|0);b=(g[k>>2]=d,c[k>>2]|0)|0;f=96;c[f>>2]=0|e;c[f+4>>2]=b;return 96}function qf(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function qg(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;g[a>>2]=b;g[a+4>>2]=c;g[a+8>>2]=d;return}function qh(a){a=a|0;return+(+g[a+8>>2])}function qi(a,b){a=a|0;b=b|0;var c=0;c=a|0;g[c>>2]=+g[b>>2]+ +g[c>>2];c=a+4|0;g[c>>2]=+g[b+4>>2]+ +g[c>>2];c=a+8|0;g[c>>2]=+g[b+8>>2]+ +g[c>>2];return}function qj(a){a=a|0;g[a>>2]=0.0;g[a+4>>2]=0.0;g[a+8>>2]=0.0;return}function qk(a,b){a=a|0;b=+b;var c=0;c=a|0;g[c>>2]=+g[c>>2]*b;c=a+4|0;g[c>>2]=+g[c>>2]*b;c=a+8|0;g[c>>2]=+g[c>>2]*b;return}function ql(b){b=b|0;var c=0.0,d=0.0;if(!(a[23128]|0)){a[23128]=1}c=-0.0- +g[b+4>>2];d=-0.0- +g[b+8>>2];g[20]=-0.0- +g[b>>2];g[21]=c;g[22]=d;return 80}function qm(a){a=a|0;return+(+g[a+24>>2])}function qn(a,b){a=a|0;b=+b;g[a+24>>2]=b;return}function qo(a){a=a|0;return c[a+16>>2]|0}function qp(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0;d=c[a+16>>2]|0;e=c[a+20>>2]|0;if((e|0)<=1){f=0;h=d+(f<<3)|0;return h|0}i=+g[b+4>>2];j=+g[b>>2];k=i*+g[d+4>>2]+j*+g[d>>2];b=1;a=0;while(1){l=j*+g[d+(b<<3)>>2]+i*+g[d+(b<<3)+4>>2];m=l>k;n=m?b:a;o=b+1|0;if((o|0)<(e|0)){k=m?l:k;b=o;a=n}else{f=n;break}}h=d+(f<<3)|0;return h|0}function qq(a){a=a|0;return c[a+20>>2]|0}function qr(a){a=a|0;return c[a+20>>2]|0}function qs(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0.0,i=0.0,j=0.0,k=0.0,l=0,m=0,n=0;d=c[a+16>>2]|0;e=c[a+20>>2]|0;if((e|0)<=1){f=0;return f|0}h=+g[b+4>>2];i=+g[b>>2];j=h*+g[d+4>>2]+i*+g[d>>2];b=1;a=0;while(1){k=i*+g[d+(b<<3)>>2]+h*+g[d+(b<<3)+4>>2];l=k>j;m=l?b:a;n=b+1|0;if((n|0)<(e|0)){j=l?k:j;b=n;a=m}else{f=m;break}}return f|0}function qt(a,b){a=a|0;b=b|0;c[a+16>>2]=b;return}function qu(a,b){a=a|0;b=b|0;c[a+20>>2]=b;return}function qv(b){b=b|0;return(a[b+20|0]&1)<<24>>24!=0|0}function qw(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function qx(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function qy(a){a=a|0;return+(+g[a+16>>2])}function qz(a){a=a|0;return c[a>>2]|0}function qA(a,b){a=a|0;b=+b;g[a+16>>2]=b;return}function qB(a,b){a=a|0;b=+b;g[a+12>>2]=b;return}function qC(a){a=a|0;return+(+g[a+12>>2])}function qD(b,c){b=b|0;c=c|0;a[b+20|0]=c&1;return}function qE(a){a=a|0;return a+22|0}function qF(a){a=a|0;return+(+g[a+8>>2])}function qG(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function qH(a){a=a|0;return c[a+4>>2]|0}function qI(){var a=0;a=vp(6)|0;b[a>>1]=1;b[a+2>>1]=-1;b[a+4>>1]=0;return a|0}function qJ(a){a=a|0;if((a|0)==0){return}vl(a);return}function qK(){var a=0;a=vp(44)|0;vr(a|0,0,17);c[a>>2]=9;vr(a+20|0,0,24);return a|0}function qL(){var b=0;b=vp(52)|0;c[b+44>>2]=0;vr(b+4|0,0,32);a[b+36|0]=1;a[b+37|0]=1;a[b+38|0]=0;a[b+39|0]=0;c[b>>2]=0;a[b+40|0]=1;g[b+48>>2]=1.0;return b|0}function qM(a){a=a|0;if((a|0)==0){return}vl(a);return}function qN(a){a=a|0;var b=0,c=0.0,d=0,e=0.0,f=0.0,h=0.0,i=0.0;b=a|0;c=+g[b>>2];d=a+4|0;e=+g[d>>2];f=+Q(+(c*c+e*e));if(f<1.1920928955078125e-7){h=0.0;return+h}i=1.0/f;g[b>>2]=c*i;g[d>>2]=e*i;h=f;return+h}function qO(){return vp(8)|0}function qP(a,b){a=+a;b=+b;var c=0;c=vp(8)|0;g[c>>2]=a;g[c+4>>2]=b;return c|0}function qQ(a){a=a|0;var b=0.0,c=0.0;b=+g[a>>2];c=+g[a+4>>2];return+(+Q(+(b*b+c*c)))}function qR(a){a=a|0;if((a|0)==0){return}vl(a);return}function qS(a){a=a|0;if((a|0)==0){return}vl(a);return}function qT(){return vp(12)|0}function qU(a,b,c){a=+a;b=+b;c=+c;var d=0;d=vp(12)|0;g[d>>2]=a;g[d+4>>2]=b;g[d+8>>2]=c;return d|0}function qV(a,b,c){a=a|0;b=b|0;c=c|0;cg(a,b,c);return}function qW(){var a=0;a=vp(28)|0;c[a+16>>2]=0;c[a+20>>2]=0;g[a+24>>2]=0.0;return a|0}function qX(a){a=a|0;if((a|0)==0){return}vl(a);return}function qY(a){a=a|0;if((a|0)==0){return}vl(a);return}function qZ(){var d=0;d=vp(28)|0;b[d+22>>1]=1;b[d+24>>1]=-1;b[d+26>>1]=0;c[d>>2]=0;c[d+4>>2]=0;g[d+8>>2]=.20000000298023224;g[d+12>>2]=0.0;g[d+16>>2]=0.0;a[d+20|0]=0;return d|0}function q_(a,c){a=a|0;c=c|0;var d=0;d=a+22|0;a=c;b[d>>1]=b[a>>1]|0;b[d+2>>1]=b[a+2>>1]|0;b[d+4>>1]=b[a+4>>1]|0;return}function q$(a,b){a=a|0;b=b|0;do{if((b|0)>-1){if((c[a+20>>2]|0)<=(b|0)){break}return(c[a+16>>2]|0)+(b<<3)|0}}while(0);bd(7536,103,13816,6368);return 0}function q0(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function q1(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function q2(a){a=a|0;return+(+g[a+68>>2])}function q3(b){b=b|0;return(a[b+60|0]&1)<<24>>24!=0|0}function q4(a){a=a|0;return+(+g[a+44>>2])}function q5(b,c){b=b|0;c=c|0;a[b+48|0]=c&1;return}function q6(a,b){a=a|0;b=+b;g[a+68>>2]=b;return}function q7(a){a=a|0;return a+36|0}function q8(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function q9(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function ra(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0,l=0.0,m=0.0,n=0,o=0.0,p=0,q=0,r=0;c[a+8>>2]=b;c[a+12>>2]=d;h=e|0;i=+g[h>>2]- +g[b+12>>2];j=e+4|0;l=+g[j>>2]- +g[b+16>>2];e=b+24|0;m=+g[e>>2];n=b+20|0;o=+g[n>>2];p=a+20|0;q=(g[k>>2]=i*m+l*o,c[k>>2]|0);r=(g[k>>2]=m*l+i*(-0.0-o),c[k>>2]|0)|0;c[p>>2]=0|q;c[p+4>>2]=r;o=+g[h>>2]- +g[d+12>>2];i=+g[j>>2]- +g[d+16>>2];l=+g[d+24>>2];m=+g[d+20>>2];j=a+28|0;h=(g[k>>2]=o*l+i*m,c[k>>2]|0);r=(g[k>>2]=l*i+o*(-0.0-m),c[k>>2]|0)|0;c[j>>2]=0|h;c[j+4>>2]=r;m=+g[e>>2];o=+g[f>>2];i=+g[n>>2];l=+g[f+4>>2];f=a+36|0;n=(g[k>>2]=m*o+i*l,c[k>>2]|0);e=(g[k>>2]=o*(-0.0-i)+m*l,c[k>>2]|0)|0;c[f>>2]=0|n;c[f+4>>2]=e;g[a+44>>2]=+g[d+56>>2]- +g[b+56>>2];return}function rb(a,b){a=a|0;b=+b;g[a+52>>2]=b;return}function rc(a){a=a|0;return+(+g[a+56>>2])}function rd(b){b=b|0;return(a[b+48|0]&1)<<24>>24!=0|0}function re(a,b){a=a|0;b=+b;g[a+44>>2]=b;return}function rf(a){a=a|0;return a+20|0}function rg(a){a=a|0;return a+28|0}function rh(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)<<24>>24!=0|0}function ri(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function rj(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function rk(a,b){a=a|0;b=+b;g[a+56>>2]=b;return}function rl(a){a=a|0;return+(+g[a+64>>2])}function rm(a,b){a=a|0;b=+b;g[a+64>>2]=b;return}function rn(b,c){b=b|0;c=c|0;a[b+60|0]=c&1;return}function ro(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function rp(a){a=a|0;return+(+g[a+52>>2])}function rq(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+36|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function rr(b){b=b|0;var d=0.0,e=0,f=0;if(!(a[23112]|0)){a[23112]=1}d=+g[b+4>>2];e=(g[k>>2]=-0.0- +g[b>>2],c[k>>2]|0);b=(g[k>>2]=d,c[k>>2]|0)|0;f=72;c[f>>2]=0|e;c[f+4>>2]=b;return 72}function rs(b){b=b|0;var d=0.0,e=0,f=0;if(!(a[23120]|0)){a[23120]=1}d=+g[b>>2];e=(g[k>>2]=+g[b+4>>2],c[k>>2]|0);b=(g[k>>2]=d,c[k>>2]|0)|0;f=64;c[f>>2]=0|e;c[f+4>>2]=b;return 64}function rt(a,b){a=a|0;b=+b;g[a+4>>2]=b;return}function ru(a){a=a|0;g[a>>2]=0.0;g[a+4>>2]=1.0;return}function rv(a){a=a|0;return+(+g[a+4>>2])}function rw(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function rx(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function ry(a){a=a|0;return+(+g[a+52>>2])}function rz(a,b){a=a|0;b=+b;g[a+48>>2]=b;return}function rA(a,b){a=a|0;b=+b;g[a+56>>2]=b;return}function rB(a,b){a=a|0;b=+b;g[a+52>>2]=b;return}function rC(a){a=a|0;return a+36|0}function rD(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function rE(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function rF(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0,l=0.0,m=0.0,n=0,o=0.0,p=0,q=0;c[a+8>>2]=b;c[a+12>>2]=d;h=e|0;i=+g[h>>2]- +g[b+12>>2];j=e+4|0;l=+g[j>>2]- +g[b+16>>2];e=b+24|0;m=+g[e>>2];n=b+20|0;o=+g[n>>2];b=a+20|0;p=(g[k>>2]=i*m+l*o,c[k>>2]|0);q=(g[k>>2]=m*l+i*(-0.0-o),c[k>>2]|0)|0;c[b>>2]=0|p;c[b+4>>2]=q;o=+g[h>>2]- +g[d+12>>2];i=+g[j>>2]- +g[d+16>>2];l=+g[d+24>>2];m=+g[d+20>>2];d=a+28|0;j=(g[k>>2]=o*l+i*m,c[k>>2]|0);h=(g[k>>2]=l*i+o*(-0.0-m),c[k>>2]|0)|0;c[d>>2]=0|j;c[d+4>>2]=h;m=+g[e>>2];o=+g[f>>2];i=+g[n>>2];l=+g[f+4>>2];f=a+36|0;a=(g[k>>2]=m*o+i*l,c[k>>2]|0);n=(g[k>>2]=o*(-0.0-i)+m*l,c[k>>2]|0)|0;c[f>>2]=0|a;c[f+4>>2]=n;return}function rG(a){a=a|0;return+(+g[a+56>>2])}function rH(a,b){a=a|0;b=+b;g[a+60>>2]=b;return}function rI(a){a=a|0;return a+20|0}function rJ(a){a=a|0;return+(+g[a+48>>2])}function rK(a){a=a|0;return a+28|0}function rL(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)<<24>>24!=0|0}function rM(b){b=b|0;return(a[b+44|0]&1)<<24>>24!=0|0}function rN(a){a=a|0;return+(+g[a+60>>2])}function rO(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function rP(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function rQ(b,c){b=b|0;c=c|0;a[b+44|0]=c&1;return}function rR(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function rS(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+36|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function rT(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function rU(a){a=a|0;return+(+g[a+44>>2])}function rV(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function rW(a,b){a=a|0;b=+b;g[a+44>>2]=b;return}function rX(b){b=b|0;return(a[b+52|0]&1)<<24>>24!=0|0}function rY(a,b){a=a|0;b=+b;g[a+48>>2]=b;return}function rZ(a){a=a|0;return+(+g[a+36>>2])}function r_(b,c){b=b|0;c=c|0;a[b+40|0]=c&1;return}function r$(a){a=a|0;return+(+g[a+56>>2])}function r0(a,b){a=a|0;b=+b;g[a+56>>2]=b;return}function r1(a){a=a|0;return+(+g[a+60>>2])}function r2(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function r3(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function r4(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0.0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0;c[a+8>>2]=b;c[a+12>>2]=d;f=e|0;h=+g[f>>2]- +g[b+12>>2];i=e+4|0;j=+g[i>>2]- +g[b+16>>2];l=+g[b+24>>2];m=+g[b+20>>2];e=a+20|0;n=(g[k>>2]=h*l+j*m,c[k>>2]|0);o=(g[k>>2]=l*j+h*(-0.0-m),c[k>>2]|0)|0;c[e>>2]=0|n;c[e+4>>2]=o;m=+g[f>>2]- +g[d+12>>2];h=+g[i>>2]- +g[d+16>>2];j=+g[d+24>>2];l=+g[d+20>>2];i=a+28|0;f=(g[k>>2]=m*j+h*l,c[k>>2]|0);o=(g[k>>2]=j*h+m*(-0.0-l),c[k>>2]|0)|0;c[i>>2]=0|f;c[i+4>>2]=o;g[a+36>>2]=+g[d+56>>2]- +g[b+56>>2];return}function r5(b){b=b|0;return(a[b+40|0]&1)<<24>>24!=0|0}function r6(a){a=a|0;return+(+g[a+48>>2])}function r7(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function r8(a){a=a|0;return a+20|0}function r9(a){a=a|0;return a+28|0}function sa(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)<<24>>24!=0|0}function sb(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function sc(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function sd(a,b){a=a|0;b=+b;g[a+60>>2]=b;return}function se(b,c){b=b|0;c=c|0;a[b+52|0]=c&1;return}function sf(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function sg(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+36|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function sh(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+44|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function si(a,b){a=a|0;b=+b;g[a+60>>2]=b;return}function sj(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function sk(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function sl(a){a=a|0;return a+28|0}function sm(a){a=a|0;return a+20|0}function sn(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function so(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function sp(a){a=a|0;return+(+g[a+60>>2])}function sq(a){a=a|0;return a+36|0}function sr(a){a=a|0;return a+44|0}function ss(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)<<24>>24!=0|0}function st(a,b){a=a|0;b=+b;g[a+56>>2]=b;return}function su(a,b){a=a|0;b=+b;g[a+52>>2]=b;return}function sv(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function sw(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function sx(){var b=0;b=vp(72)|0;vr(b|0,0,17);c[b>>2]=2;vr(b+20|0,0,16);g[b+36>>2]=1.0;g[b+40>>2]=0.0;g[b+44>>2]=0.0;a[b+48|0]=0;g[b+52>>2]=0.0;g[b+56>>2]=0.0;a[b+60|0]=0;g[b+64>>2]=0.0;g[b+68>>2]=0.0;return b|0}function sy(a){a=a|0;if((a|0)==0){return}vl(a);return}function sz(a){a=a|0;if((a|0)==0){return}vl(a);return}function sA(a,b){a=a|0;b=+b;g[a>>2]=+T(+b);g[a+4>>2]=+S(+b);return}function sB(a){a=a|0;return+(+Y(+(+g[a>>2]),+(+g[a+4>>2])))}function sC(){return vp(8)|0}function sD(a){a=+a;var b=0;b=vp(8)|0;g[b>>2]=+T(+a);g[b+4>>2]=+S(+a);return b|0}function sE(){var b=0;b=vp(64)|0;vr(b|0,0,17);c[b>>2]=7;vr(b+20|0,0,16);g[b+36>>2]=1.0;g[b+40>>2]=0.0;a[b+44|0]=0;g[b+48>>2]=0.0;g[b+52>>2]=0.0;g[b+56>>2]=2.0;g[b+60>>2]=.699999988079071;return b|0}function sF(a){a=a|0;if((a|0)==0){return}vl(a);return}function sG(){var b=0;b=vp(64)|0;vr(b|0,0,17);c[b>>2]=1;g[b+44>>2]=0.0;g[b+48>>2]=0.0;g[b+60>>2]=0.0;g[b+56>>2]=0.0;a[b+52|0]=0;vr(b+20|0,0,21);return b|0}function sH(a){a=a|0;if((a|0)==0){return}vl(a);return}function sI(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;fJ(a,b,c,d,e,f,g,h);return}function sJ(a){a=a|0;if((a|0)==0){return}vl(a);return}function sK(a){a=a|0;return+(+g[a+56>>2])}function sL(a){a=a|0;return+(+g[a+52>>2])}function sM(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function sN(a){a=a|0;return c[a+8>>2]|0}function sO(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function sP(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function sQ(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function sR(a){a=a|0;return c[a+12>>2]|0}function sS(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function sT(b){b=b|0;return(a[b+16|0]&1)<<24>>24!=0|0}function sU(a){a=a|0;return c[a>>2]|0}function sV(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function sW(a){a=a|0;return c[a+4>>2]|0}function sX(a,b){a=a|0;b=b|0;var d=0;d=b;b=a;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function sY(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+8|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function sZ(a){a=a|0;return a|0}function s_(a){a=a|0;return a+8|0}function s$(a){a=a|0;g[a>>2]=0.0;g[a+4>>2]=0.0;g[a+8>>2]=0.0;g[a+12>>2]=1.0;return}function s0(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;g[a>>2]=b;g[a+4>>2]=c;g[a+8>>2]=d;return}function s1(a,b){a=a|0;b=+b;g[a>>2]=b;return}function s2(a){a=a|0;return+(+g[a>>2])}function s3(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function s4(a){a=a|0;return+(+g[a+4>>2])}function s5(a){a=a|0;return+(+g[a+8>>2])}function s6(a,b){a=a|0;b=+b;g[a+4>>2]=b;return}function s7(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+8|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function s8(a){a=a|0;var b=0.0,c=0.0,d=0.0,e=0.0,f=0;b=+g[a+8>>2];c=+g[a>>2];d=+g[a+12>>2];e=+g[a+4>>2];if(!(b-c>=0.0&d-e>=0.0)){f=0;return f|0}if(!(c==c&!(D=0.0,D!=D)&c>+-q&c<+q)){f=0;return f|0}if(!(e==e&!(D=0.0,D!=D)&e>+-q&e<+q)){f=0;return f|0}if(!(b==b&!(D=0.0,D!=D)&b>+-q&b<+q)){f=0;return f|0}if(!(d==d&!(D=0.0,D!=D)&d>+-q)){f=0;return f|0}f=d<+q;return f|0}function s9(a,b){a=a|0;b=b|0;var c=0;if(+g[a>>2]>+g[b>>2]){c=0;return c|0}if(+g[a+4>>2]>+g[b+4>>2]){c=0;return c|0}if(+g[b+8>>2]>+g[a+8>>2]){c=0;return c|0}c=+g[b+12>>2]<=+g[a+12>>2];return c|0}function ta(b){b=b|0;var d=0.0,e=0,f=0;if(!(a[23096]|0)){a[23096]=1}d=(+g[b+12>>2]- +g[b+4>>2])*.5;e=(g[k>>2]=(+g[b+8>>2]- +g[b>>2])*.5,c[k>>2]|0);b=(g[k>>2]=d,c[k>>2]|0)|0;f=56;c[f>>2]=0|e;c[f+4>>2]=b;return 56}function tb(b){b=b|0;var d=0.0,e=0,f=0;if(!(a[23104]|0)){a[23104]=1}d=(+g[b+4>>2]+ +g[b+12>>2])*.5;e=(g[k>>2]=(+g[b>>2]+ +g[b+8>>2])*.5,c[k>>2]|0);b=(g[k>>2]=d,c[k>>2]|0)|0;f=48;c[f>>2]=0|e;c[f+4>>2]=b;return 48}function tc(a){a=a|0;return a+8|0}function td(a){a=a|0;return+((+g[a+8>>2]- +g[a>>2]+(+g[a+12>>2]- +g[a+4>>2]))*2.0)}function te(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0,j=0,l=0;d=+g[a>>2];e=+g[b>>2];f=+g[a+4>>2];h=+g[b+4>>2];i=a;j=(g[k>>2]=d<e?d:e,c[k>>2]|0);l=(g[k>>2]=f<h?f:h,c[k>>2]|0)|0;c[i>>2]=0|j;c[i+4>>2]=l;l=a+8|0;h=+g[l>>2];f=+g[b+8>>2];e=+g[a+12>>2];d=+g[b+12>>2];b=l;l=(g[k>>2]=h>f?h:f,c[k>>2]|0);a=(g[k>>2]=e>d?e:d,c[k>>2]|0)|0;c[b>>2]=0|l;c[b+4>>2]=a;return}function tf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0,l=0,m=0;e=+g[b>>2];f=+g[d>>2];h=+g[b+4>>2];i=+g[d+4>>2];j=a;l=(g[k>>2]=e<f?e:f,c[k>>2]|0);m=(g[k>>2]=h<i?h:i,c[k>>2]|0)|0;c[j>>2]=0|l;c[j+4>>2]=m;i=+g[b+8>>2];h=+g[d+8>>2];f=+g[b+12>>2];e=+g[d+12>>2];d=a+8|0;a=(g[k>>2]=i>h?i:h,c[k>>2]|0);b=(g[k>>2]=f>e?f:e,c[k>>2]|0)|0;c[d>>2]=0|a;c[d+4>>2]=b;return}function tg(a,b){a=a|0;b=b|0;var d=0;d=b;b=a;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function th(a){a=a|0;return a|0}function ti(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function tj(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function tk(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function tl(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function tm(a){a=a|0;return+(+g[a+40>>2])}function tn(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function to(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function tp(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function tq(a){a=a|0;return a+20|0}function tr(a){a=a|0;return+(+g[a+36>>2])}function ts(a){a=a|0;return a+28|0}function tt(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)<<24>>24!=0|0}function tu(a){a=a|0;return+(+g[a+44>>2])}function tv(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function tw(a,b){a=a|0;b=+b;g[a+40>>2]=b;return}function tx(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0.0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0;c[a+8>>2]=b;c[a+12>>2]=d;f=e|0;h=+g[f>>2]- +g[b+12>>2];i=e+4|0;j=+g[i>>2]- +g[b+16>>2];l=+g[b+24>>2];m=+g[b+20>>2];e=a+20|0;n=(g[k>>2]=h*l+j*m,c[k>>2]|0);o=(g[k>>2]=l*j+h*(-0.0-m),c[k>>2]|0)|0;c[e>>2]=0|n;c[e+4>>2]=o;m=+g[f>>2]- +g[d+12>>2];h=+g[i>>2]- +g[d+16>>2];j=+g[d+24>>2];l=+g[d+20>>2];i=a+28|0;f=(g[k>>2]=m*j+h*l,c[k>>2]|0);o=(g[k>>2]=j*h+m*(-0.0-l),c[k>>2]|0)|0;c[i>>2]=0|f;c[i+4>>2]=o;g[a+36>>2]=+g[d+56>>2]- +g[b+56>>2];return}function ty(a,b){a=a|0;b=+b;g[a+44>>2]=b;return}function tz(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function tA(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function tB(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function tC(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function tD(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function tE(a){a=a|0;return+(+g[a+28>>2])}function tF(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function tG(a,b){a=a|0;b=+b;g[a+28>>2]=b;return}function tH(a){a=a|0;return+(+g[a+32>>2])}function tI(a){a=a|0;return a+20|0}function tJ(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)<<24>>24!=0|0}function tK(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function tL(a,b){a=a|0;b=+b;g[a+32>>2]=b;return}function tM(a){a=a|0;return+(+g[a+36>>2])}
function tN(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function tO(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function tP(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function tQ(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function tR(a,b){a=a|0;b=+b;g[a+44>>2]=b;return}function tS(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function tT(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function tU(a){a=a|0;return+(+g[a+36>>2])}function tV(a){a=a|0;return a+20|0}function tW(a){a=a|0;return+(+g[a+40>>2])}function tX(a){a=a|0;return a+28|0}function tY(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)<<24>>24!=0|0}function tZ(a){a=a|0;return+(+g[a+44>>2])}function t_(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function t$(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function t0(a,b){a=a|0;b=+b;g[a+40>>2]=b;return}function t1(){var b=0;b=vp(64)|0;vr(b|0,0,16);c[b>>2]=4;g[b+20>>2]=-1.0;g[b+24>>2]=1.0;g[b+28>>2]=1.0;g[b+32>>2]=1.0;g[b+36>>2]=-1.0;g[b+40>>2]=0.0;g[b+44>>2]=1.0;g[b+48>>2]=0.0;g[b+52>>2]=0.0;g[b+56>>2]=0.0;g[b+60>>2]=1.0;a[b+16|0]=1;return b|0}function t2(a){a=a|0;if((a|0)==0){return}vl(a);return}function t3(){var a=0;a=vp(20)|0;vr(a|0,0,17);return a|0}function t4(a){a=a|0;if((a|0)==0){return}vl(a);return}function t5(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0;e=b;b=a;f=c[e+4>>2]|0;c[b>>2]=c[e>>2]|0;c[b+4>>2]=f;g[a+8>>2]=+T(+d);g[a+12>>2]=+S(+d);return}function t6(){return vp(16)|0}function t7(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=vp(16)|0;e=a;a=d;f=c[e+4>>2]|0;c[a>>2]=c[e>>2]|0;c[a+4>>2]=f;f=b;b=d+8|0;a=c[f+4>>2]|0;c[b>>2]=c[f>>2]|0;c[b+4>>2]=a;return d|0}function t8(a){a=a|0;if((a|0)==0){return}vl(a);return}function t9(){return vp(12)|0}function ua(a,b,c){a=+a;b=+b;c=+c;var d=0;d=vp(12)|0;g[d>>2]=a;g[d+4>>2]=b;g[d+8>>2]=c;return d|0}function ub(a){a=a|0;if((a|0)==0){return}vl(a);return}function uc(){return vp(16)|0}function ud(a,b,c){a=a|0;b=b|0;c=c|0;return cd(a,b,c)|0}function ue(a){a=a|0;if((a|0)==0){return}vl(a);return}function uf(){var a=0;a=vp(48)|0;vr(a|0,0,17);c[a>>2]=8;vr(a+20|0,0,28);return a|0}function ug(){var a=0;a=vp(40)|0;vr(a|0,0,17);c[a>>2]=5;g[a+20>>2]=0.0;g[a+24>>2]=0.0;g[a+28>>2]=0.0;g[a+32>>2]=5.0;g[a+36>>2]=.699999988079071;return a|0}function uh(a){a=a|0;if((a|0)==0){return}vl(a);return}function ui(){var a=0;a=vp(48)|0;vr(a|0,0,17);c[a>>2]=3;vr(a+20|0,0,16);g[a+36>>2]=1.0;g[a+40>>2]=0.0;g[a+44>>2]=0.0;return a|0}function uj(a){a=a|0;if((a|0)==0){return}vl(a);return}function uk(a){a=a|0;return}function ul(a,b){a=a|0;b=b|0;return}function um(a,b){a=a|0;b=b|0;return}function un(a){a=a|0;return}function uo(a,b){a=a|0;b=b|0;return 0}function up(a){a=a|0;return}function uq(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+0.0}function ur(a){a=a|0;return}function us(a){a=a|0;return}function ut(a){a=a|0;return}function uu(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function uv(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function uw(a){a=a|0;return c[a+20>>2]|0}function ux(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function uy(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function uz(a,b){a=a|0;b=b|0;c[a+24>>2]=b;return}function uA(a,b){a=a|0;b=+b;g[a+28>>2]=b;return}function uB(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)<<24>>24!=0|0}function uC(a){a=a|0;return c[a+24>>2]|0}function uD(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function uE(a){a=a|0;return+(+g[a+28>>2])}function uF(a,b){a=a|0;b=b|0;c[a+20>>2]=b;return}function uG(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function uH(a){a=a|0;return c[a+8>>2]|0}function uI(a){a=a|0;return c[a>>2]|0}function uJ(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function uK(a){a=a|0;return c[a+12>>2]|0}function uL(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function uM(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function uN(a){a=a|0;return c[a+4>>2]|0}function uO(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function uP(a,b){a=a|0;b=b|0;return c[a+8>>2]|0}function uQ(a,b){a=a|0;b=b|0;return c[a+12>>2]|0}function uR(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function uS(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function uT(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function uU(a){a=a|0;return a+20|0}function uV(a){a=a|0;return+(+g[a+36>>2])}function uW(a){a=a|0;return a+28|0}function uX(b,c){b=b|0;c=c|0;return(a[b+16|0]&1)<<24>>24!=0|0}function uY(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function uZ(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function u_(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((c[d+8>>2]|0)!=(b|0)){return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function u$(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){return}g=d+28|0;if((c[g>>2]|0)==1){return}c[g>>2]=f;return}if((c[d>>2]|0)!=(b|0)){return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1|0;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function u0(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0,l=0.0,m=0.0,n=0.0,o=0;c[a+8>>2]=b;c[a+12>>2]=d;h=e|0;i=+g[h>>2]- +g[b+12>>2];j=e+4|0;l=+g[j>>2]- +g[b+16>>2];m=+g[b+24>>2];n=+g[b+20>>2];b=a+20|0;e=(g[k>>2]=i*m+l*n,c[k>>2]|0);o=(g[k>>2]=m*l+i*(-0.0-n),c[k>>2]|0)|0;c[b>>2]=0|e;c[b+4>>2]=o;o=f|0;n=+g[o>>2]- +g[d+12>>2];b=f+4|0;i=+g[b>>2]- +g[d+16>>2];l=+g[d+24>>2];m=+g[d+20>>2];d=a+28|0;f=(g[k>>2]=n*l+i*m,c[k>>2]|0);e=(g[k>>2]=l*i+n*(-0.0-m),c[k>>2]|0)|0;c[d>>2]=0|f;c[d+4>>2]=e;m=+g[o>>2]- +g[h>>2];n=+g[b>>2]- +g[j>>2];g[a+36>>2]=+Q(+(m*m+n*n));return}function u1(a){a=a|0;if((a|0)==0){return}vl(a);return}function u2(){var a=0;a=vp(32)|0;vr(a|0,0,17);c[a>>2]=6;c[a+20>>2]=0;c[a+24>>2]=0;g[a+28>>2]=1.0;return a|0}function u3(a){a=a|0;if((a|0)==0){return}vl(a);return}function u4(){return vp(16)|0}function u5(a){a=a|0;if((a|0)==0){return}vl(a);return}function u6(){var a=0;a=vp(40)|0;vr(a|0,0,17);c[a>>2]=10;g[a+20>>2]=-1.0;g[a+24>>2]=0.0;g[a+28>>2]=1.0;g[a+32>>2]=0.0;g[a+36>>2]=0.0;return a|0}function u7(a){a=a|0;vl(a);return}function u8(a){a=a|0;vl(a);return}function u9(a){a=a|0;vl(a);return}function va(a){a=a|0;vl(a);return}function vb(a){a=a|0;vl(a);return}function vc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+56|0;f=e|0;do{if((a|0)==(b|0)){g=1}else{if((b|0)==0){g=0;break}h=ve(b,21408,21392,-1)|0;j=h;if((h|0)==0){g=0;break}vr(f|0,0,56);c[f>>2]=j;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;bR[c[(c[h>>2]|0)+28>>2]&127](j,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;break}c[d>>2]=c[f+16>>2]|0;g=1}}while(0);i=e;return g|0}function vd(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((b|0)!=(c[d+8>>2]|0)){g=c[b+8>>2]|0;bR[c[(c[g>>2]|0)+28>>2]&127](g,d,e,f);return}g=d+16|0;b=c[g>>2]|0;if((b|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function ve(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+56|0;g=f|0;h=c[a>>2]|0;j=a+(c[h-8>>2]|0)|0;k=c[h-4>>2]|0;h=k;c[g>>2]=d;c[g+4>>2]=a;c[g+8>>2]=b;c[g+12>>2]=e;e=g+16|0;b=g+20|0;a=g+24|0;l=g+28|0;m=g+32|0;n=g+40|0;vr(e|0,0,39);if((k|0)==(d|0)){c[g+48>>2]=1;bD[c[(c[k>>2]|0)+20>>2]&63](h,g,j,j,1,0);i=f;return((c[a>>2]|0)==1?j:0)|0}bo[c[(c[k>>2]|0)+24>>2]&63](h,g,j,1,0);j=c[g+36>>2]|0;do{if((j|0)==0){if((c[n>>2]|0)!=1){o=0;break}if((c[l>>2]|0)!=1){o=0;break}o=(c[m>>2]|0)==1?c[b>>2]|0:0}else if((j|0)==1){if((c[a>>2]|0)!=1){if((c[n>>2]|0)!=0){o=0;break}if((c[l>>2]|0)!=1){o=0;break}if((c[m>>2]|0)!=1){o=0;break}}o=c[e>>2]|0}else{o=0}}while(0);i=f;return o|0}function vf(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)!=(c[d>>2]|0)){h=c[b+8>>2]|0;bo[c[(c[h>>2]|0)+24>>2]&63](h,d,e,f,g);return}do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=d+52|0;a[j]=0;k=d+53|0;a[k]=0;l=c[b+8>>2]|0;bD[c[(c[l>>2]|0)+20>>2]&63](l,d,e,e,1,g);do{if((a[k]&1)<<24>>24==0){m=0;n=1971}else{if((a[j]&1)<<24>>24==0){m=1;n=1971;break}else{break}}}while(0);L2185:do{if((n|0)==1971){c[h>>2]=e;j=d+40|0;c[j>>2]=(c[j>>2]|0)+1|0;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){n=1974;break}a[d+54|0]=1;if(m){break L2185}else{break}}else{n=1974}}while(0);if((n|0)==1974){if(m){break}}c[i>>2]=4;return}}while(0);c[i>>2]=3;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function vg(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0;if((b|0)!=(c[d+8>>2]|0)){i=c[b+8>>2]|0;bD[c[(c[i>>2]|0)+20>>2]&63](i,d,e,f,g,h);return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;h=c[f>>2]|0;if((h|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;a[d+54|0]=1;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g;j=g}else{j=h}if(!((c[d+48>>2]|0)==1&(j|0)==1)){return}a[d+54|0]=1;return}function vh(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;if((c[d+8>>2]|0)!=(b|0)){return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;a[d+54|0]=1;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g;i=g}else{i=b}if(!((c[d+48>>2]|0)==1&(i|0)==1)){return}a[d+54|0]=1;return}function vi(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[3258]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=13072+(h<<2)|0;j=13072+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[3258]=e&(1<<g^-1)}else{if(l>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{aR();return 0;return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[3260]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=13072+(p<<2)|0;m=13072+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[3258]=e&(1<<r^-1)}else{if(l>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{aR();return 0;return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[3260]|0;if((l|0)!=0){q=c[3263]|0;d=l>>>3;l=d<<1;f=13072+(l<<2)|0;k=c[3258]|0;h=1<<d;do{if((k&h|0)==0){c[3258]=k|h;s=f;t=13072+(l+2<<2)|0}else{d=13072+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[3262]|0)>>>0){s=g;t=d;break}aR();return 0;return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[3260]=m;c[3263]=e;n=i;return n|0}l=c[3259]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[13336+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[3262]|0;if(r>>>0<i>>>0){aR();return 0;return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){aR();return 0;return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;L2308:do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;do{if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break L2308}else{w=l;x=k;break}}else{w=g;x=q}}while(0);while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){aR();return 0;return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){aR();return 0;return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){aR();return 0;return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{aR();return 0;return 0}}}while(0);L2330:do{if((e|0)!=0){f=d+28|0;i=13336+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[3259]=c[3259]&(1<<c[f>>2]^-1);break L2330}else{if(e>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L2330}}}while(0);if(v>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4|0)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b|0)>>2]=p;f=c[3260]|0;if((f|0)!=0){e=c[3263]|0;i=f>>>3;f=i<<1;q=13072+(f<<2)|0;k=c[3258]|0;g=1<<i;do{if((k&g|0)==0){c[3258]=k|g;y=q;z=13072+(f+2<<2)|0}else{i=13072+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[3262]|0)>>>0){y=l;z=i;break}aR();return 0;return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[3260]=p;c[3263]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[3259]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=(14-(h|f|l)|0)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[13336+(A<<2)>>2]|0;L2378:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L2378}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break L2378}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[13336+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}L2393:do{if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break L2393}else{p=r;m=i;q=e}}}}while(0);if((K|0)==0){o=g;break}if(J>>>0>=((c[3260]|0)-g|0)>>>0){o=g;break}k=K;q=c[3262]|0;if(k>>>0<q>>>0){aR();return 0;return 0}m=k+g|0;p=m;if(k>>>0>=m>>>0){aR();return 0;return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;L2406:do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;do{if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break L2406}else{M=B;N=j;break}}else{M=d;N=r}}while(0);while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<q>>>0){aR();return 0;return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<q>>>0){aR();return 0;return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){aR();return 0;return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{aR();return 0;return 0}}}while(0);L2428:do{if((e|0)!=0){i=K+28|0;q=13336+(c[i>>2]<<2)|0;do{if((K|0)==(c[q>>2]|0)){c[q>>2]=L;if((L|0)!=0){break}c[3259]=c[3259]&(1<<c[i>>2]^-1);break L2428}else{if(e>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L2428}}}while(0);if(L>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=k+(e+4|0)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[k+(g|4)>>2]=J|1;c[k+(J+g|0)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;q=13072+(e<<2)|0;r=c[3258]|0;j=1<<i;do{if((r&j|0)==0){c[3258]=r|j;O=q;P=13072+(e+2<<2)|0}else{i=13072+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[3262]|0)>>>0){O=d;P=i;break}aR();return 0;return 0}}while(0);c[P>>2]=p;c[O+12>>2]=p;c[k+(g+8|0)>>2]=O;c[k+(g+12|0)>>2]=q;break}e=m;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=(14-(d|r|i)|0)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=13336+(Q<<2)|0;c[k+(g+28|0)>>2]=Q;c[k+(g+20|0)>>2]=0;c[k+(g+16|0)>>2]=0;q=c[3259]|0;l=1<<Q;if((q&l|0)==0){c[3259]=q|l;c[j>>2]=e;c[k+(g+24|0)>>2]=j;c[k+(g+12|0)>>2]=e;c[k+(g+8|0)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;q=c[j>>2]|0;while(1){if((c[q+4>>2]&-8|0)==(J|0)){break}S=q+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=2177;break}else{l=l<<1;q=j}}if((T|0)==2177){if(S>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}else{c[S>>2]=e;c[k+(g+24|0)>>2]=q;c[k+(g+12|0)>>2]=e;c[k+(g+8|0)>>2]=e;break}}l=q+8|0;j=c[l>>2]|0;i=c[3262]|0;if(q>>>0<i>>>0){aR();return 0;return 0}if(j>>>0<i>>>0){aR();return 0;return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[k+(g+8|0)>>2]=j;c[k+(g+12|0)>>2]=q;c[k+(g+24|0)>>2]=0;break}}}while(0);k=K+8|0;if((k|0)==0){o=g;break}else{n=k}return n|0}}while(0);K=c[3260]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[3263]|0;if(S>>>0>15){R=J;c[3263]=R+o|0;c[3260]=S;c[R+(o+4|0)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[3260]=0;c[3263]=0;c[J+4>>2]=K|3;S=J+(K+4|0)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[3261]|0;if(o>>>0<J>>>0){S=J-o|0;c[3261]=S;J=c[3264]|0;K=J;c[3264]=K+o|0;c[K+(o+4|0)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[104]|0)==0){J=a4(8)|0;if((J-1&J|0)==0){c[106]=J;c[105]=J;c[107]=-1;c[108]=2097152;c[109]=0;c[3369]=0;c[104]=bm(0)&-16^1431655768;break}else{aR();return 0;return 0}}}while(0);J=o+48|0;S=c[106]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[3368]|0;do{if((O|0)!=0){P=c[3366]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L2520:do{if((c[3369]&4|0)==0){O=c[3264]|0;L2522:do{if((O|0)==0){T=2207}else{L=O;P=13480;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=2207;break L2522}else{P=M}}if((P|0)==0){T=2207;break}L=R-(c[3261]|0)&Q;if(L>>>0>=2147483647){W=0;break}q=bg(L|0)|0;e=(q|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?q:-1;Y=e?L:0;Z=q;_=L;T=2216;break}}while(0);do{if((T|0)==2207){O=bg(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[105]|0;q=L-1|0;if((q&g|0)==0){$=S}else{$=(S-g|0)+(q+g&-L)|0}L=c[3366]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}q=c[3368]|0;if((q|0)!=0){if(g>>>0<=L>>>0|g>>>0>q>>>0){W=0;break}}q=bg($|0)|0;g=(q|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=q;_=$;T=2216;break}}while(0);L2542:do{if((T|0)==2216){q=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=2227;break L2520}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[106]|0;O=(K-_|0)+g&-g;if(O>>>0>=2147483647){ac=_;break}if((bg(O|0)|0)==-1){bg(q|0);W=Y;break L2542}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=2227;break L2520}}}while(0);c[3369]=c[3369]|4;ad=W;T=2224;break}else{ad=0;T=2224}}while(0);do{if((T|0)==2224){if(S>>>0>=2147483647){break}W=bg(S|0)|0;Z=bg(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)==-1){break}else{aa=Z?ac:ad;ab=Y;T=2227;break}}}while(0);do{if((T|0)==2227){ad=(c[3366]|0)+aa|0;c[3366]=ad;if(ad>>>0>(c[3367]|0)>>>0){c[3367]=ad}ad=c[3264]|0;L2562:do{if((ad|0)==0){S=c[3262]|0;if((S|0)==0|ab>>>0<S>>>0){c[3262]=ab}c[3370]=ab;c[3371]=aa;c[3373]=0;c[3267]=c[104]|0;c[3266]=-1;S=0;while(1){Y=S<<1;ac=13072+(Y<<2)|0;c[13072+(Y+3<<2)>>2]=ac;c[13072+(Y+2<<2)>>2]=ac;ac=S+1|0;if(ac>>>0<32){S=ac}else{break}}S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=(aa-40|0)-ae|0;c[3264]=ab+ae|0;c[3261]=S;c[ab+(ae+4|0)>>2]=S|1;c[ab+(aa-36|0)>>2]=40;c[3265]=c[108]|0}else{S=13480;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=2239;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==2239){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa|0;ac=c[3264]|0;Y=(c[3261]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[3264]=Z+ai|0;c[3261]=W;c[Z+(ai+4|0)>>2]=W|1;c[Z+(Y+4|0)>>2]=40;c[3265]=c[108]|0;break L2562}}while(0);if(ab>>>0<(c[3262]|0)>>>0){c[3262]=ab}S=ab+aa|0;Y=13480;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=2249;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==2249){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa|0;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8|0)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa|0)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=(S-(ab+ak|0)|0)-o|0;c[ab+(ak+4|0)>>2]=o|3;do{if((Z|0)==(c[3264]|0)){J=(c[3261]|0)+K|0;c[3261]=J;c[3264]=_;c[ab+(W+4|0)>>2]=J|1}else{if((Z|0)==(c[3263]|0)){J=(c[3260]|0)+K|0;c[3260]=J;c[3263]=_;c[ab+(W+4|0)>>2]=J|1;c[ab+(J+W|0)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al|0)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L2607:do{if(X>>>0<256){U=c[ab+((al|8)+aa|0)>>2]|0;Q=c[ab+((aa+12|0)+al|0)>>2]|0;R=13072+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}if((c[U+12>>2]|0)==(Z|0)){break}aR();return 0;return 0}}while(0);if((Q|0)==(U|0)){c[3258]=c[3258]&(1<<V^-1);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}q=Q+8|0;if((c[q>>2]|0)==(Z|0)){am=q;break}aR();return 0;return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;q=c[ab+((al|24)+aa|0)>>2]|0;P=c[ab+((aa+12|0)+al|0)>>2]|0;L2628:do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O|0)|0;L=c[g>>2]|0;do{if((L|0)==0){e=ab+(O+aa|0)|0;M=c[e>>2]|0;if((M|0)==0){an=0;break L2628}else{ao=M;ap=e;break}}else{ao=L;ap=g}}while(0);while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa|0)>>2]|0;if(g>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){aR();return 0;return 0}O=P+8|0;if((c[O>>2]|0)==(R|0)){c[L>>2]=P;c[O>>2]=g;an=P;break}else{aR();return 0;return 0}}}while(0);if((q|0)==0){break}P=ab+((aa+28|0)+al|0)|0;U=13336+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[3259]=c[3259]&(1<<c[P>>2]^-1);break L2607}else{if(q>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}Q=q+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[q+20>>2]=an}if((an|0)==0){break L2607}}}while(0);if(an>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}c[an+24>>2]=q;R=al|16;P=c[ab+(R+aa|0)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R|0)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);aq=ab+(($|al)+aa|0)|0;ar=$+K|0}else{aq=Z;ar=K}J=aq+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4|0)>>2]=ar|1;c[ab+(ar+W|0)>>2]=ar;J=ar>>>3;if(ar>>>0<256){V=J<<1;X=13072+(V<<2)|0;P=c[3258]|0;q=1<<J;do{if((P&q|0)==0){c[3258]=P|q;as=X;at=13072+(V+2<<2)|0}else{J=13072+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[3262]|0)>>>0){as=U;at=J;break}aR();return 0;return 0}}while(0);c[at>>2]=_;c[as+12>>2]=_;c[ab+(W+8|0)>>2]=as;c[ab+(W+12|0)>>2]=X;break}V=ac;q=ar>>>8;do{if((q|0)==0){au=0}else{if(ar>>>0>16777215){au=31;break}P=(q+1048320|0)>>>16&8;$=q<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=(14-(J|P|$)|0)+(U<<$>>>15)|0;au=ar>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);q=13336+(au<<2)|0;c[ab+(W+28|0)>>2]=au;c[ab+(W+20|0)>>2]=0;c[ab+(W+16|0)>>2]=0;X=c[3259]|0;Q=1<<au;if((X&Q|0)==0){c[3259]=X|Q;c[q>>2]=V;c[ab+(W+24|0)>>2]=q;c[ab+(W+12|0)>>2]=V;c[ab+(W+8|0)>>2]=V;break}if((au|0)==31){av=0}else{av=25-(au>>>1)|0}Q=ar<<av;X=c[q>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(ar|0)){break}aw=X+16+(Q>>>31<<2)|0;q=c[aw>>2]|0;if((q|0)==0){T=2322;break}else{Q=Q<<1;X=q}}if((T|0)==2322){if(aw>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}else{c[aw>>2]=V;c[ab+(W+24|0)>>2]=X;c[ab+(W+12|0)>>2]=V;c[ab+(W+8|0)>>2]=V;break}}Q=X+8|0;q=c[Q>>2]|0;$=c[3262]|0;if(X>>>0<$>>>0){aR();return 0;return 0}if(q>>>0<$>>>0){aR();return 0;return 0}else{c[q+12>>2]=V;c[Q>>2]=V;c[ab+(W+8|0)>>2]=q;c[ab+(W+12|0)>>2]=X;c[ab+(W+24|0)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=13480;while(1){ax=c[W>>2]|0;if(ax>>>0<=Y>>>0){ay=c[W+4>>2]|0;az=ax+ay|0;if(az>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=ax+(ay-39|0)|0;if((W&7|0)==0){aA=0}else{aA=-W&7}W=ax+((ay-47|0)+aA|0)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aB=0}else{aB=-_&7}_=(aa-40|0)-aB|0;c[3264]=ab+aB|0;c[3261]=_;c[ab+(aB+4|0)>>2]=_|1;c[ab+(aa-36|0)>>2]=40;c[3265]=c[108]|0;c[ac+4>>2]=27;c[W>>2]=c[3370]|0;c[W+4>>2]=c[13484>>2]|0;c[W+8>>2]=c[13488>>2]|0;c[W+12>>2]=c[13492>>2]|0;c[3370]=ab;c[3371]=aa;c[3373]=0;c[3372]=W;W=ac+28|0;c[W>>2]=7;L2726:do{if((ac+32|0)>>>0<az>>>0){_=W;while(1){K=_+4|0;c[K>>2]=7;if((_+8|0)>>>0<az>>>0){_=K}else{break L2726}}}}while(0);if((ac|0)==(Y|0)){break}W=ac-ad|0;_=Y+(W+4|0)|0;c[_>>2]=c[_>>2]&-2;c[ad+4>>2]=W|1;c[Y+W>>2]=W;_=W>>>3;if(W>>>0<256){K=_<<1;Z=13072+(K<<2)|0;S=c[3258]|0;q=1<<_;do{if((S&q|0)==0){c[3258]=S|q;aC=Z;aD=13072+(K+2<<2)|0}else{_=13072+(K+2<<2)|0;Q=c[_>>2]|0;if(Q>>>0>=(c[3262]|0)>>>0){aC=Q;aD=_;break}aR();return 0;return 0}}while(0);c[aD>>2]=ad;c[aC+12>>2]=ad;c[ad+8>>2]=aC;c[ad+12>>2]=Z;break}K=ad;q=W>>>8;do{if((q|0)==0){aE=0}else{if(W>>>0>16777215){aE=31;break}S=(q+1048320|0)>>>16&8;Y=q<<S;ac=(Y+520192|0)>>>16&4;_=Y<<ac;Y=(_+245760|0)>>>16&2;Q=(14-(ac|S|Y)|0)+(_<<Y>>>15)|0;aE=W>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);q=13336+(aE<<2)|0;c[ad+28>>2]=aE;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[3259]|0;Q=1<<aE;if((Z&Q|0)==0){c[3259]=Z|Q;c[q>>2]=K;c[ad+24>>2]=q;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aE|0)==31){aF=0}else{aF=25-(aE>>>1)|0}Q=W<<aF;Z=c[q>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(W|0)){break}aG=Z+16+(Q>>>31<<2)|0;q=c[aG>>2]|0;if((q|0)==0){T=2357;break}else{Q=Q<<1;Z=q}}if((T|0)==2357){if(aG>>>0<(c[3262]|0)>>>0){aR();return 0;return 0}else{c[aG>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;W=c[Q>>2]|0;q=c[3262]|0;if(Z>>>0<q>>>0){aR();return 0;return 0}if(W>>>0<q>>>0){aR();return 0;return 0}else{c[W+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=W;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[3261]|0;if(ad>>>0<=o>>>0){break}W=ad-o|0;c[3261]=W;ad=c[3264]|0;Q=ad;c[3264]=Q+o|0;c[Q+(o+4|0)>>2]=W|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[bj()>>2]=12;n=0;return n|0}function vj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[3262]|0;if(b>>>0<e>>>0){aR()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){aR()}h=f&-8;i=a+(h-8|0)|0;j=i;L2779:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){aR()}if((n|0)==(c[3263]|0)){p=a+(h-4|0)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[3260]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4|0)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8|0)>>2]|0;s=c[a+(l+12|0)>>2]|0;t=13072+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){aR()}if((c[k+12>>2]|0)==(n|0)){break}aR()}}while(0);if((s|0)==(k|0)){c[3258]=c[3258]&(1<<p^-1);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){aR()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}aR()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24|0)>>2]|0;v=c[a+(l+12|0)>>2]|0;L2813:do{if((v|0)==(t|0)){w=a+(l+20|0)|0;x=c[w>>2]|0;do{if((x|0)==0){y=a+(l+16|0)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break L2813}else{B=z;C=y;break}}else{B=x;C=w}}while(0);while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){aR()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8|0)>>2]|0;if(w>>>0<e>>>0){aR()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){aR()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{aR()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28|0)|0;m=13336+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[3259]=c[3259]&(1<<c[v>>2]^-1);q=n;r=o;break L2779}else{if(p>>>0<(c[3262]|0)>>>0){aR()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L2779}}}while(0);if(A>>>0<(c[3262]|0)>>>0){aR()}c[A+24>>2]=p;t=c[a+(l+16|0)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[3262]|0)>>>0){aR()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20|0)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[3262]|0)>>>0){aR()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){aR()}A=a+(h-4|0)|0;e=c[A>>2]|0;if((e&1|0)==0){aR()}do{if((e&2|0)==0){if((j|0)==(c[3264]|0)){B=(c[3261]|0)+r|0;c[3261]=B;c[3264]=q;c[q+4>>2]=B|1;if((q|0)==(c[3263]|0)){c[3263]=0;c[3260]=0}if(B>>>0<=(c[3265]|0)>>>0){return}vo(0);return}if((j|0)==(c[3263]|0)){B=(c[3260]|0)+r|0;c[3260]=B;c[3263]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L2885:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=13072+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[3262]|0)>>>0){aR()}if((c[u+12>>2]|0)==(j|0)){break}aR()}}while(0);if((g|0)==(u|0)){c[3258]=c[3258]&(1<<C^-1);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[3262]|0)>>>0){aR()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}aR()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16|0)>>2]|0;t=c[a+(h|4)>>2]|0;L2887:do{if((t|0)==(b|0)){p=a+(h+12|0)|0;v=c[p>>2]|0;do{if((v|0)==0){m=a+(h+8|0)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break L2887}else{F=k;G=m;break}}else{F=v;G=p}}while(0);while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[3262]|0)>>>0){aR()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[3262]|0)>>>0){aR()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){aR()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{aR()}}}while(0);if((f|0)==0){break}t=a+(h+20|0)|0;u=13336+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[3259]=c[3259]&(1<<c[t>>2]^-1);break L2885}else{if(f>>>0<(c[3262]|0)>>>0){aR()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L2885}}}while(0);if(E>>>0<(c[3262]|0)>>>0){aR()}c[E+24>>2]=f;b=c[a+(h+8|0)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[3262]|0)>>>0){aR()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12|0)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[3262]|0)>>>0){aR()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[3263]|0)){H=B;break}c[3260]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=13072+(d<<2)|0;A=c[3258]|0;E=1<<r;do{if((A&E|0)==0){c[3258]=A|E;I=e;J=13072+(d+2<<2)|0}else{r=13072+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[3262]|0)>>>0){I=h;J=r;break}aR()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=(14-(E|J|d)|0)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=13336+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[3259]|0;d=1<<K;do{if((r&d|0)==0){c[3259]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=2536;break}else{A=A<<1;J=E}}if((N|0)==2536){if(M>>>0<(c[3262]|0)>>>0){aR()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[3262]|0;if(J>>>0<E>>>0){aR()}if(B>>>0<E>>>0){aR()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[3266]|0)-1|0;c[3266]=q;if((q|0)==0){O=13488}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[3266]=-1;return}function vk(a){a=a|0;return 6752}function vl(a){a=a|0;if((a|0)!=0){vj(a)}return}function vm(a){a=a|0;vl(a);return}function vn(a){a=a|0;return}function vo(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;do{if((c[104]|0)==0){b=a4(8)|0;if((b-1&b|0)==0){c[106]=b;c[105]=b;c[107]=-1;c[108]=2097152;c[109]=0;c[3369]=0;c[104]=bm(0)&-16^1431655768;break}else{aR();return 0;return 0}}}while(0);if(a>>>0>=4294967232){d=0;return d|0}b=c[3264]|0;if((b|0)==0){d=0;return d|0}e=c[3261]|0;do{if(e>>>0>(a+40|0)>>>0){f=c[106]|0;g=aa(((((((-40-a|0)-1|0)+e|0)+f|0)>>>0)/(f>>>0)>>>0)-1|0,f);h=b;i=13480;while(1){j=c[i>>2]|0;if(j>>>0<=h>>>0){if((j+(c[i+4>>2]|0)|0)>>>0>h>>>0){k=i;break}}j=c[i+8>>2]|0;if((j|0)==0){k=0;break}else{i=j}}if((c[k+12>>2]&8|0)!=0){break}i=bg(0)|0;h=k+4|0;if((i|0)!=((c[k>>2]|0)+(c[h>>2]|0)|0)){break}j=bg(-(g>>>0>2147483646?-2147483648-f|0:g)|0)|0;l=bg(0)|0;if(!((j|0)!=-1&l>>>0<i>>>0)){break}j=i-l|0;if((i|0)==(l|0)){break}c[h>>2]=(c[h>>2]|0)-j|0;c[3366]=(c[3366]|0)-j|0;h=c[3264]|0;m=(c[3261]|0)-j|0;j=h;n=h+8|0;if((n&7|0)==0){o=0}else{o=-n&7}n=m-o|0;c[3264]=j+o|0;c[3261]=n;c[j+(o+4|0)>>2]=n|1;c[j+(m+4|0)>>2]=40;c[3265]=c[108]|0;d=(i|0)!=(l|0)&1;return d|0}}while(0);if((c[3261]|0)>>>0<=(c[3265]|0)>>>0){d=0;return d|0}c[3265]=-1;d=0;return d|0}function vp(a){a=a|0;var b=0,d=0,e=0;b=(a|0)==0?1:a;while(1){d=vi(b)|0;if((d|0)!=0){e=2620;break}a=(C=c[5686]|0,c[5686]=C+0,C);if((a|0)==0){break}bP[a&63]()}if((e|0)==2620){return d|0}d=bi(4)|0;c[d>>2]=19248;aQ(d|0,21360,78);return 0}function vq(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2]|0;b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function vr(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function vs(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function vt(){a5()}function vu(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;bo[a&63](b|0,c|0,d|0,e|0,f|0)}function vv(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(0,a|0,b|0,c|0,d|0,e|0)}function vw(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(1,a|0,b|0,c|0,d|0,e|0)}function vx(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(2,a|0,b|0,c|0,d|0,e|0)}function vy(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(3,a|0,b|0,c|0,d|0,e|0)}function vz(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(4,a|0,b|0,c|0,d|0,e|0)}function vA(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(5,a|0,b|0,c|0,d|0,e|0)}function vB(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(6,a|0,b|0,c|0,d|0,e|0)}function vC(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(7,a|0,b|0,c|0,d|0,e|0)}function vD(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(8,a|0,b|0,c|0,d|0,e|0)}function vE(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(9,a|0,b|0,c|0,d|0,e|0)}function vF(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(10,a|0,b|0,c|0,d|0,e|0)}function vG(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(11,a|0,b|0,c|0,d|0,e|0)}function vH(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(12,a|0,b|0,c|0,d|0,e|0)}function vI(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(13,a|0,b|0,c|0,d|0,e|0)}function vJ(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(14,a|0,b|0,c|0,d|0,e|0)}function vK(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(15,a|0,b|0,c|0,d|0,e|0)}function vL(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(16,a|0,b|0,c|0,d|0,e|0)}function vM(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(17,a|0,b|0,c|0,d|0,e|0)}function vN(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(18,a|0,b|0,c|0,d|0,e|0)}function vO(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ai(19,a|0,b|0,c|0,d|0,e|0)}function vP(a,b,c){a=a|0;b=b|0;c=+c;bp[a&255](b|0,+c)}function vQ(a,b){a=a|0;b=+b;ai(0,a|0,+b)}function vR(a,b){a=a|0;b=+b;ai(1,a|0,+b)}function vS(a,b){a=a|0;b=+b;ai(2,a|0,+b)}function vT(a,b){a=a|0;b=+b;ai(3,a|0,+b)}function vU(a,b){a=a|0;b=+b;ai(4,a|0,+b)}function vV(a,b){a=a|0;b=+b;ai(5,a|0,+b)}function vW(a,b){a=a|0;b=+b;ai(6,a|0,+b)}function vX(a,b){a=a|0;b=+b;ai(7,a|0,+b)}function vY(a,b){a=a|0;b=+b;ai(8,a|0,+b)}function vZ(a,b){a=a|0;b=+b;ai(9,a|0,+b)}function v_(a,b){a=a|0;b=+b;ai(10,a|0,+b)}function v$(a,b){a=a|0;b=+b;ai(11,a|0,+b)}function v0(a,b){a=a|0;b=+b;ai(12,a|0,+b)}function v1(a,b){a=a|0;b=+b;ai(13,a|0,+b)}function v2(a,b){a=a|0;b=+b;ai(14,a|0,+b)}function v3(a,b){a=a|0;b=+b;ai(15,a|0,+b)}function v4(a,b){a=a|0;b=+b;ai(16,a|0,+b)}function v5(a,b){a=a|0;b=+b;ai(17,a|0,+b)}function v6(a,b){a=a|0;b=+b;ai(18,a|0,+b)}function v7(a,b){a=a|0;b=+b;ai(19,a|0,+b)}function v8(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=+d;e=e|0;f=f|0;bq[a&63](b|0,c|0,+d,e|0,f|0)}function v9(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(0,a|0,b|0,+c,d|0,e|0)}function wa(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(1,a|0,b|0,+c,d|0,e|0)}function wb(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(2,a|0,b|0,+c,d|0,e|0)}function wc(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(3,a|0,b|0,+c,d|0,e|0)}function wd(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(4,a|0,b|0,+c,d|0,e|0)}function we(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(5,a|0,b|0,+c,d|0,e|0)}function wf(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(6,a|0,b|0,+c,d|0,e|0)}function wg(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(7,a|0,b|0,+c,d|0,e|0)}function wh(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(8,a|0,b|0,+c,d|0,e|0)}function wi(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(9,a|0,b|0,+c,d|0,e|0)}function wj(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(10,a|0,b|0,+c,d|0,e|0)}function wk(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(11,a|0,b|0,+c,d|0,e|0)}function wl(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(12,a|0,b|0,+c,d|0,e|0)}function wm(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(13,a|0,b|0,+c,d|0,e|0)}function wn(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(14,a|0,b|0,+c,d|0,e|0)}function wo(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(15,a|0,b|0,+c,d|0,e|0)}function wp(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(16,a|0,b|0,+c,d|0,e|0)}function wq(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(17,a|0,b|0,+c,d|0,e|0)}function wr(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(18,a|0,b|0,+c,d|0,e|0)}function ws(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ai(19,a|0,b|0,+c,d|0,e|0)}function wt(a,b){a=a|0;b=b|0;br[a&511](b|0)}function wu(a){a=a|0;ai(0,a|0)}function wv(a){a=a|0;ai(1,a|0)}function ww(a){a=a|0;ai(2,a|0)}function wx(a){a=a|0;ai(3,a|0)}function wy(a){a=a|0;ai(4,a|0)}function wz(a){a=a|0;ai(5,a|0)}function wA(a){a=a|0;ai(6,a|0)}function wB(a){a=a|0;ai(7,a|0)}function wC(a){a=a|0;ai(8,a|0)}function wD(a){a=a|0;ai(9,a|0)}function wE(a){a=a|0;ai(10,a|0)}function wF(a){a=a|0;ai(11,a|0)}function wG(a){a=a|0;ai(12,a|0)}function wH(a){a=a|0;ai(13,a|0)}function wI(a){a=a|0;ai(14,a|0)}function wJ(a){a=a|0;ai(15,a|0)}function wK(a){a=a|0;ai(16,a|0)}function wL(a){a=a|0;ai(17,a|0)}function wM(a){a=a|0;ai(18,a|0)}function wN(a){a=a|0;ai(19,a|0)}function wO(a,b,c){a=a|0;b=b|0;c=c|0;bs[a&511](b|0,c|0)}function wP(a,b){a=a|0;b=b|0;ai(0,a|0,b|0)}function wQ(a,b){a=a|0;b=b|0;ai(1,a|0,b|0)}function wR(a,b){a=a|0;b=b|0;ai(2,a|0,b|0)}function wS(a,b){a=a|0;b=b|0;ai(3,a|0,b|0)}function wT(a,b){a=a|0;b=b|0;ai(4,a|0,b|0)}function wU(a,b){a=a|0;b=b|0;ai(5,a|0,b|0)}function wV(a,b){a=a|0;b=b|0;ai(6,a|0,b|0)}function wW(a,b){a=a|0;b=b|0;ai(7,a|0,b|0)}function wX(a,b){a=a|0;b=b|0;ai(8,a|0,b|0)}function wY(a,b){a=a|0;b=b|0;ai(9,a|0,b|0)}function wZ(a,b){a=a|0;b=b|0;ai(10,a|0,b|0)}function w_(a,b){a=a|0;b=b|0;ai(11,a|0,b|0)}function w$(a,b){a=a|0;b=b|0;ai(12,a|0,b|0)}function w0(a,b){a=a|0;b=b|0;ai(13,a|0,b|0)}function w1(a,b){a=a|0;b=b|0;ai(14,a|0,b|0)}function w2(a,b){a=a|0;b=b|0;ai(15,a|0,b|0)}function w3(a,b){a=a|0;b=b|0;ai(16,a|0,b|0)}function w4(a,b){a=a|0;b=b|0;ai(17,a|0,b|0)}function w5(a,b){a=a|0;b=b|0;ai(18,a|0,b|0)}function w6(a,b){a=a|0;b=b|0;ai(19,a|0,b|0)}function w7(a,b){a=a|0;b=b|0;return bt[a&1023](b|0)|0}function w8(a){a=a|0;return ai(0,a|0)|0}function w9(a){a=a|0;return ai(1,a|0)|0}function xa(a){a=a|0;return ai(2,a|0)|0}function xb(a){a=a|0;return ai(3,a|0)|0}function xc(a){a=a|0;return ai(4,a|0)|0}function xd(a){a=a|0;return ai(5,a|0)|0}function xe(a){a=a|0;return ai(6,a|0)|0}function xf(a){a=a|0;return ai(7,a|0)|0}function xg(a){a=a|0;return ai(8,a|0)|0}function xh(a){a=a|0;return ai(9,a|0)|0}function xi(a){a=a|0;return ai(10,a|0)|0}function xj(a){a=a|0;return ai(11,a|0)|0}function xk(a){a=a|0;return ai(12,a|0)|0}function xl(a){a=a|0;return ai(13,a|0)|0}function xm(a){a=a|0;return ai(14,a|0)|0}function xn(a){a=a|0;return ai(15,a|0)|0}function xo(a){a=a|0;return ai(16,a|0)|0}function xp(a){a=a|0;return ai(17,a|0)|0}function xq(a){a=a|0;return ai(18,a|0)|0}function xr(a){a=a|0;return ai(19,a|0)|0}function xs(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=+d;e=e|0;bu[a&63](b|0,c|0,+d,e|0)}function xt(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(0,a|0,b|0,+c,d|0)}function xu(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(1,a|0,b|0,+c,d|0)}function xv(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(2,a|0,b|0,+c,d|0)}function xw(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(3,a|0,b|0,+c,d|0)}function xx(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(4,a|0,b|0,+c,d|0)}function xy(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(5,a|0,b|0,+c,d|0)}function xz(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(6,a|0,b|0,+c,d|0)}function xA(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(7,a|0,b|0,+c,d|0)}function xB(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(8,a|0,b|0,+c,d|0)}function xC(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(9,a|0,b|0,+c,d|0)}function xD(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(10,a|0,b|0,+c,d|0)}function xE(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(11,a|0,b|0,+c,d|0)}function xF(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(12,a|0,b|0,+c,d|0)}function xG(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(13,a|0,b|0,+c,d|0)}function xH(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(14,a|0,b|0,+c,d|0)}function xI(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(15,a|0,b|0,+c,d|0)}function xJ(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(16,a|0,b|0,+c,d|0)}function xK(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(17,a|0,b|0,+c,d|0)}function xL(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(18,a|0,b|0,+c,d|0)}function xM(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ai(19,a|0,b|0,+c,d|0)}function xN(a,b){a=a|0;b=+b;return bv[a&63](+b)|0}function xO(a){a=+a;return ai(0,+a)|0}function xP(a){a=+a;return ai(1,+a)|0}function xQ(a){a=+a;return ai(2,+a)|0}function xR(a){a=+a;return ai(3,+a)|0}function xS(a){a=+a;return ai(4,+a)|0}function xT(a){a=+a;return ai(5,+a)|0}function xU(a){a=+a;return ai(6,+a)|0}function xV(a){a=+a;return ai(7,+a)|0}function xW(a){a=+a;return ai(8,+a)|0}function xX(a){a=+a;return ai(9,+a)|0}function xY(a){a=+a;return ai(10,+a)|0}function xZ(a){a=+a;return ai(11,+a)|0}function x_(a){a=+a;return ai(12,+a)|0}function x$(a){a=+a;return ai(13,+a)|0}function x0(a){a=+a;return ai(14,+a)|0}function x1(a){a=+a;return ai(15,+a)|0}function x2(a){a=+a;return ai(16,+a)|0}function x3(a){a=+a;return ai(17,+a)|0}function x4(a){a=+a;return ai(18,+a)|0}function x5(a){a=+a;return ai(19,+a)|0}function x6(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return bw[a&63](b|0,c|0,d|0,e|0)|0}function x7(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(0,a|0,b|0,c|0,d|0)|0}function x8(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(1,a|0,b|0,c|0,d|0)|0}function x9(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(2,a|0,b|0,c|0,d|0)|0}function ya(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(3,a|0,b|0,c|0,d|0)|0}function yb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(4,a|0,b|0,c|0,d|0)|0}function yc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(5,a|0,b|0,c|0,d|0)|0}function yd(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(6,a|0,b|0,c|0,d|0)|0}function ye(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(7,a|0,b|0,c|0,d|0)|0}function yf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(8,a|0,b|0,c|0,d|0)|0}function yg(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(9,a|0,b|0,c|0,d|0)|0}function yh(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(10,a|0,b|0,c|0,d|0)|0}function yi(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(11,a|0,b|0,c|0,d|0)|0}function yj(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(12,a|0,b|0,c|0,d|0)|0}function yk(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(13,a|0,b|0,c|0,d|0)|0}function yl(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(14,a|0,b|0,c|0,d|0)|0}function ym(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(15,a|0,b|0,c|0,d|0)|0}function yn(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(16,a|0,b|0,c|0,d|0)|0}function yo(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(17,a|0,b|0,c|0,d|0)|0}function yp(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(18,a|0,b|0,c|0,d|0)|0}function yq(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return ai(19,a|0,b|0,c|0,d|0)|0}function yr(a,b,c,d,e,f){a=a|0;b=b|0;c=+c;d=+d;e=e|0;f=+f;bx[a&63](b|0,+c,+d,e|0,+f)}function ys(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(0,a|0,+b,+c,d|0,+e)}function yt(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(1,a|0,+b,+c,d|0,+e)}function yu(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(2,a|0,+b,+c,d|0,+e)}function yv(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(3,a|0,+b,+c,d|0,+e)}function yw(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(4,a|0,+b,+c,d|0,+e)}function yx(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(5,a|0,+b,+c,d|0,+e)}function yy(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(6,a|0,+b,+c,d|0,+e)}function yz(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(7,a|0,+b,+c,d|0,+e)}function yA(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(8,a|0,+b,+c,d|0,+e)}function yB(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(9,a|0,+b,+c,d|0,+e)}function yC(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(10,a|0,+b,+c,d|0,+e)}function yD(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(11,a|0,+b,+c,d|0,+e)}function yE(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(12,a|0,+b,+c,d|0,+e)}function yF(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(13,a|0,+b,+c,d|0,+e)}function yG(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(14,a|0,+b,+c,d|0,+e)}function yH(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(15,a|0,+b,+c,d|0,+e)}function yI(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(16,a|0,+b,+c,d|0,+e)}function yJ(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(17,a|0,+b,+c,d|0,+e)}function yK(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(18,a|0,+b,+c,d|0,+e)}function yL(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ai(19,a|0,+b,+c,d|0,+e)}function yM(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return by[a&127](b|0,c|0,d|0)|0}function yN(a,b,c){a=a|0;b=b|0;c=c|0;return ai(0,a|0,b|0,c|0)|0}function yO(a,b,c){a=a|0;b=b|0;c=c|0;return ai(1,a|0,b|0,c|0)|0}function yP(a,b,c){a=a|0;b=b|0;c=c|0;return ai(2,a|0,b|0,c|0)|0}function yQ(a,b,c){a=a|0;b=b|0;c=c|0;return ai(3,a|0,b|0,c|0)|0}function yR(a,b,c){a=a|0;b=b|0;c=c|0;return ai(4,a|0,b|0,c|0)|0}function yS(a,b,c){a=a|0;b=b|0;c=c|0;return ai(5,a|0,b|0,c|0)|0}function yT(a,b,c){a=a|0;b=b|0;c=c|0;return ai(6,a|0,b|0,c|0)|0}function yU(a,b,c){a=a|0;b=b|0;c=c|0;return ai(7,a|0,b|0,c|0)|0}function yV(a,b,c){a=a|0;b=b|0;c=c|0;return ai(8,a|0,b|0,c|0)|0}function yW(a,b,c){a=a|0;b=b|0;c=c|0;return ai(9,a|0,b|0,c|0)|0}function yX(a,b,c){a=a|0;b=b|0;c=c|0;return ai(10,a|0,b|0,c|0)|0}function yY(a,b,c){a=a|0;b=b|0;c=c|0;return ai(11,a|0,b|0,c|0)|0}function yZ(a,b,c){a=a|0;b=b|0;c=c|0;return ai(12,a|0,b|0,c|0)|0}function y_(a,b,c){a=a|0;b=b|0;c=c|0;return ai(13,a|0,b|0,c|0)|0}function y$(a,b,c){a=a|0;b=b|0;c=c|0;return ai(14,a|0,b|0,c|0)|0}function y0(a,b,c){a=a|0;b=b|0;c=c|0;return ai(15,a|0,b|0,c|0)|0}function y1(a,b,c){a=a|0;b=b|0;c=c|0;return ai(16,a|0,b|0,c|0)|0}function y2(a,b,c){a=a|0;b=b|0;c=c|0;return ai(17,a|0,b|0,c|0)|0}function y3(a,b,c){a=a|0;b=b|0;c=c|0;return ai(18,a|0,b|0,c|0)|0}function y4(a,b,c){a=a|0;b=b|0;c=c|0;return ai(19,a|0,b|0,c|0)|0}function y5(a,b,c){a=a|0;b=b|0;c=+c;return+bz[a&127](b|0,+c)}function y6(a,b){a=a|0;b=+b;return+ai(0,a|0,+b)}function y7(a,b){a=a|0;b=+b;return+ai(1,a|0,+b)}function y8(a,b){a=a|0;b=+b;return+ai(2,a|0,+b)}function y9(a,b){a=a|0;b=+b;return+ai(3,a|0,+b)}function za(a,b){a=a|0;b=+b;return+ai(4,a|0,+b)}function zb(a,b){a=a|0;b=+b;return+ai(5,a|0,+b)}function zc(a,b){a=a|0;b=+b;return+ai(6,a|0,+b)}function zd(a,b){a=a|0;b=+b;return+ai(7,a|0,+b)}function ze(a,b){a=a|0;b=+b;return+ai(8,a|0,+b)}function zf(a,b){a=a|0;b=+b;return+ai(9,a|0,+b)}function zg(a,b){a=a|0;b=+b;return+ai(10,a|0,+b)}function zh(a,b){a=a|0;b=+b;return+ai(11,a|0,+b)}function zi(a,b){a=a|0;b=+b;return+ai(12,a|0,+b)}function zj(a,b){a=a|0;b=+b;return+ai(13,a|0,+b)}function zk(a,b){a=a|0;b=+b;return+ai(14,a|0,+b)}function zl(a,b){a=a|0;b=+b;return+ai(15,a|0,+b)}function zm(a,b){a=a|0;b=+b;return+ai(16,a|0,+b)}function zn(a,b){a=a|0;b=+b;return+ai(17,a|0,+b)}function zo(a,b){a=a|0;b=+b;return+ai(18,a|0,+b)}function zp(a,b){a=a|0;b=+b;return+ai(19,a|0,+b)}function zq(a,b,c,d){a=a|0;b=b|0;c=+c;d=+d;bA[a&63](b|0,+c,+d)}function zr(a,b,c){a=a|0;b=+b;c=+c;ai(0,a|0,+b,+c)}function zs(a,b,c){a=a|0;b=+b;c=+c;ai(1,a|0,+b,+c)}function zt(a,b,c){a=a|0;b=+b;c=+c;ai(2,a|0,+b,+c)}function zu(a,b,c){a=a|0;b=+b;c=+c;ai(3,a|0,+b,+c)}function zv(a,b,c){a=a|0;b=+b;c=+c;ai(4,a|0,+b,+c)}function zw(a,b,c){a=a|0;b=+b;c=+c;ai(5,a|0,+b,+c)}function zx(a,b,c){a=a|0;b=+b;c=+c;ai(6,a|0,+b,+c)}function zy(a,b,c){a=a|0;b=+b;c=+c;ai(7,a|0,+b,+c)}function zz(a,b,c){a=a|0;b=+b;c=+c;ai(8,a|0,+b,+c)}function zA(a,b,c){a=a|0;b=+b;c=+c;ai(9,a|0,+b,+c)}function zB(a,b,c){a=a|0;b=+b;c=+c;ai(10,a|0,+b,+c)}function zC(a,b,c){a=a|0;b=+b;c=+c;ai(11,a|0,+b,+c)}function zD(a,b,c){a=a|0;b=+b;c=+c;ai(12,a|0,+b,+c)}function zE(a,b,c){a=a|0;b=+b;c=+c;ai(13,a|0,+b,+c)}function zF(a,b,c){a=a|0;b=+b;c=+c;ai(14,a|0,+b,+c)}function zG(a,b,c){a=a|0;b=+b;c=+c;ai(15,a|0,+b,+c)}function zH(a,b,c){a=a|0;b=+b;c=+c;ai(16,a|0,+b,+c)}function zI(a,b,c){a=a|0;b=+b;c=+c;ai(17,a|0,+b,+c)}function zJ(a,b,c){a=a|0;b=+b;c=+c;ai(18,a|0,+b,+c)}function zK(a,b,c){a=a|0;b=+b;c=+c;ai(19,a|0,+b,+c)}function zL(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=+i;bB[a&63](b|0,c|0,d|0,e|0,f|0,g|0,h|0,+i)}function zM(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(0,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zN(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(1,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zO(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(2,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zP(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(3,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zQ(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(4,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zR(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(5,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zS(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(6,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zT(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(7,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zU(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(8,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zV(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(9,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zW(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(10,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zX(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(11,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zY(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(12,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function zZ(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(13,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function z_(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(14,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function z$(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(15,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function z0(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(16,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function z1(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(17,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function z2(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(18,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function z3(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ai(19,a|0,b|0,c|0,d|0,e|0,f|0,g|0,+h)}function z4(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=+d;e=+e;bC[a&63](b|0,+c,+d,+e)}function z5(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(0,a|0,+b,+c,+d)}function z6(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(1,a|0,+b,+c,+d)}function z7(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(2,a|0,+b,+c,+d)}function z8(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(3,a|0,+b,+c,+d)}function z9(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(4,a|0,+b,+c,+d)}function Aa(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(5,a|0,+b,+c,+d)}function Ab(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(6,a|0,+b,+c,+d)}function Ac(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(7,a|0,+b,+c,+d)}function Ad(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(8,a|0,+b,+c,+d)}function Ae(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(9,a|0,+b,+c,+d)}function Af(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(10,a|0,+b,+c,+d)}function Ag(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(11,a|0,+b,+c,+d)}function Ah(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(12,a|0,+b,+c,+d)}function Ai(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(13,a|0,+b,+c,+d)}function Aj(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(14,a|0,+b,+c,+d)}function Ak(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(15,a|0,+b,+c,+d)}function Al(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(16,a|0,+b,+c,+d)}function Am(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(17,a|0,+b,+c,+d)}function An(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(18,a|0,+b,+c,+d)}function Ao(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ai(19,a|0,+b,+c,+d)}function Ap(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;bD[a&63](b|0,c|0,d|0,e|0,f|0,g|0)}function Aq(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(0,a|0,b|0,c|0,d|0,e|0,f|0)}function Ar(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(1,a|0,b|0,c|0,d|0,e|0,f|0)}function As(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(2,a|0,b|0,c|0,d|0,e|0,f|0)}function At(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(3,a|0,b|0,c|0,d|0,e|0,f|0)}function Au(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(4,a|0,b|0,c|0,d|0,e|0,f|0)}function Av(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(5,a|0,b|0,c|0,d|0,e|0,f|0)}function Aw(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(6,a|0,b|0,c|0,d|0,e|0,f|0)}function Ax(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(7,a|0,b|0,c|0,d|0,e|0,f|0)}function Ay(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(8,a|0,b|0,c|0,d|0,e|0,f|0)}function Az(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(9,a|0,b|0,c|0,d|0,e|0,f|0)}function AA(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(10,a|0,b|0,c|0,d|0,e|0,f|0)}function AB(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(11,a|0,b|0,c|0,d|0,e|0,f|0)}function AC(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(12,a|0,b|0,c|0,d|0,e|0,f|0)}function AD(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(13,a|0,b|0,c|0,d|0,e|0,f|0)}function AE(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(14,a|0,b|0,c|0,d|0,e|0,f|0)}function AF(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(15,a|0,b|0,c|0,d|0,e|0,f|0)}function AG(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(16,a|0,b|0,c|0,d|0,e|0,f|0)}function AH(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(17,a|0,b|0,c|0,d|0,e|0,f|0)}function AI(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(18,a|0,b|0,c|0,d|0,e|0,f|0)}function AJ(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ai(19,a|0,b|0,c|0,d|0,e|0,f|0)}function AK(a,b,c,d){a=a|0;b=b|0;c=c|0;d=+d;return bE[a&63](b|0,c|0,+d)|0}function AL(a,b,c){a=a|0;b=b|0;c=+c;return ai(0,a|0,b|0,+c)|0}function AM(a,b,c){a=a|0;b=b|0;c=+c;return ai(1,a|0,b|0,+c)|0}function AN(a,b,c){a=a|0;b=b|0;c=+c;return ai(2,a|0,b|0,+c)|0}function AO(a,b,c){a=a|0;b=b|0;c=+c;return ai(3,a|0,b|0,+c)|0}function AP(a,b,c){a=a|0;b=b|0;c=+c;return ai(4,a|0,b|0,+c)|0}function AQ(a,b,c){a=a|0;b=b|0;c=+c;return ai(5,a|0,b|0,+c)|0}function AR(a,b,c){a=a|0;b=b|0;c=+c;return ai(6,a|0,b|0,+c)|0}function AS(a,b,c){a=a|0;b=b|0;c=+c;return ai(7,a|0,b|0,+c)|0}function AT(a,b,c){a=a|0;b=b|0;c=+c;return ai(8,a|0,b|0,+c)|0}function AU(a,b,c){a=a|0;b=b|0;c=+c;return ai(9,a|0,b|0,+c)|0}function AV(a,b,c){a=a|0;b=b|0;c=+c;return ai(10,a|0,b|0,+c)|0}function AW(a,b,c){a=a|0;b=b|0;c=+c;return ai(11,a|0,b|0,+c)|0}function AX(a,b,c){a=a|0;b=b|0;c=+c;return ai(12,a|0,b|0,+c)|0}function AY(a,b,c){a=a|0;b=b|0;c=+c;return ai(13,a|0,b|0,+c)|0}function AZ(a,b,c){a=a|0;b=b|0;c=+c;return ai(14,a|0,b|0,+c)|0}function A_(a,b,c){a=a|0;b=b|0;c=+c;return ai(15,a|0,b|0,+c)|0}function A$(a,b,c){a=a|0;b=b|0;c=+c;return ai(16,a|0,b|0,+c)|0}function A0(a,b,c){a=a|0;b=b|0;c=+c;return ai(17,a|0,b|0,+c)|0}function A1(a,b,c){a=a|0;b=b|0;c=+c;return ai(18,a|0,b|0,+c)|0}function A2(a,b,c){a=a|0;b=b|0;c=+c;return ai(19,a|0,b|0,+c)|0}function A3(a,b,c){a=a|0;b=b|0;c=+c;return bF[a&63](b|0,+c)|0}function A4(a,b){a=a|0;b=+b;return ai(0,a|0,+b)|0}function A5(a,b){a=a|0;b=+b;return ai(1,a|0,+b)|0}function A6(a,b){a=a|0;b=+b;return ai(2,a|0,+b)|0}function A7(a,b){a=a|0;b=+b;return ai(3,a|0,+b)|0}function A8(a,b){a=a|0;b=+b;return ai(4,a|0,+b)|0}function A9(a,b){a=a|0;b=+b;return ai(5,a|0,+b)|0}function Ba(a,b){a=a|0;b=+b;return ai(6,a|0,+b)|0}function Bb(a,b){a=a|0;b=+b;return ai(7,a|0,+b)|0}function Bc(a,b){a=a|0;b=+b;return ai(8,a|0,+b)|0}function Bd(a,b){a=a|0;b=+b;return ai(9,a|0,+b)|0}function Be(a,b){a=a|0;b=+b;return ai(10,a|0,+b)|0}function Bf(a,b){a=a|0;b=+b;return ai(11,a|0,+b)|0}function Bg(a,b){a=a|0;b=+b;return ai(12,a|0,+b)|0}function Bh(a,b){a=a|0;b=+b;return ai(13,a|0,+b)|0}function Bi(a,b){a=a|0;b=+b;return ai(14,a|0,+b)|0}function Bj(a,b){a=a|0;b=+b;return ai(15,a|0,+b)|0}function Bk(a,b){a=a|0;b=+b;return ai(16,a|0,+b)|0}function Bl(a,b){a=a|0;b=+b;return ai(17,a|0,+b)|0}function Bm(a,b){a=a|0;b=+b;return ai(18,a|0,+b)|0}function Bn(a,b){a=a|0;b=+b;return ai(19,a|0,+b)|0}function Bo(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;bG[a&63](b|0,+c,d|0,e|0)}function Bp(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(0,a|0,+b,c|0,d|0)}function Bq(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(1,a|0,+b,c|0,d|0)}function Br(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(2,a|0,+b,c|0,d|0)}function Bs(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(3,a|0,+b,c|0,d|0)}function Bt(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(4,a|0,+b,c|0,d|0)}function Bu(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(5,a|0,+b,c|0,d|0)}function Bv(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(6,a|0,+b,c|0,d|0)}function Bw(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(7,a|0,+b,c|0,d|0)}function Bx(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(8,a|0,+b,c|0,d|0)}function By(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(9,a|0,+b,c|0,d|0)}function Bz(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(10,a|0,+b,c|0,d|0)}function BA(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(11,a|0,+b,c|0,d|0)}function BB(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(12,a|0,+b,c|0,d|0)}function BC(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(13,a|0,+b,c|0,d|0)}function BD(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(14,a|0,+b,c|0,d|0)}function BE(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(15,a|0,+b,c|0,d|0)}function BF(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(16,a|0,+b,c|0,d|0)}function BG(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(17,a|0,+b,c|0,d|0)}function BH(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(18,a|0,+b,c|0,d|0)}function BI(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ai(19,a|0,+b,c|0,d|0)}function BJ(a,b){a=a|0;b=b|0;return+bH[a&511](b|0)}function BK(a){a=a|0;return+ai(0,a|0)}function BL(a){a=a|0;return+ai(1,a|0)}function BM(a){a=a|0;return+ai(2,a|0)}function BN(a){a=a|0;return+ai(3,a|0)}function BO(a){a=a|0;return+ai(4,a|0)}function BP(a){a=a|0;return+ai(5,a|0)}function BQ(a){a=a|0;return+ai(6,a|0)}function BR(a){a=a|0;return+ai(7,a|0)}function BS(a){a=a|0;return+ai(8,a|0)}function BT(a){a=a|0;return+ai(9,a|0)}function BU(a){a=a|0;return+ai(10,a|0)}function BV(a){a=a|0;return+ai(11,a|0)}function BW(a){a=a|0;return+ai(12,a|0)}function BX(a){a=a|0;return+ai(13,a|0)}function BY(a){a=a|0;return+ai(14,a|0)}function BZ(a){a=a|0;return+ai(15,a|0)}function B_(a){a=a|0;return+ai(16,a|0)}function B$(a){a=a|0;return+ai(17,a|0)}function B0(a){a=a|0;return+ai(18,a|0)}function B1(a){a=a|0;return+ai(19,a|0)}function B2(a,b,c){a=a|0;b=b|0;c=c|0;return bI[a&255](b|0,c|0)|0}function B3(a,b){a=a|0;b=b|0;return ai(0,a|0,b|0)|0}function B4(a,b){a=a|0;b=b|0;return ai(1,a|0,b|0)|0}function B5(a,b){a=a|0;b=b|0;return ai(2,a|0,b|0)|0}function B6(a,b){a=a|0;b=b|0;return ai(3,a|0,b|0)|0}function B7(a,b){a=a|0;b=b|0;return ai(4,a|0,b|0)|0}function B8(a,b){a=a|0;b=b|0;return ai(5,a|0,b|0)|0}function B9(a,b){a=a|0;b=b|0;return ai(6,a|0,b|0)|0}function Ca(a,b){a=a|0;b=b|0;return ai(7,a|0,b|0)|0}function Cb(a,b){a=a|0;b=b|0;return ai(8,a|0,b|0)|0}function Cc(a,b){a=a|0;b=b|0;return ai(9,a|0,b|0)|0}function Cd(a,b){a=a|0;b=b|0;return ai(10,a|0,b|0)|0}function Ce(a,b){a=a|0;b=b|0;return ai(11,a|0,b|0)|0}function Cf(a,b){a=a|0;b=b|0;return ai(12,a|0,b|0)|0}function Cg(a,b){a=a|0;b=b|0;return ai(13,a|0,b|0)|0}function Ch(a,b){a=a|0;b=b|0;return ai(14,a|0,b|0)|0}function Ci(a,b){a=a|0;b=b|0;return ai(15,a|0,b|0)|0}function Cj(a,b){a=a|0;b=b|0;return ai(16,a|0,b|0)|0}function Ck(a,b){a=a|0;b=b|0;return ai(17,a|0,b|0)|0}function Cl(a,b){a=a|0;b=b|0;return ai(18,a|0,b|0)|0}function Cm(a,b){a=a|0;b=b|0;return ai(19,a|0,b|0)|0}function Cn(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;return+bJ[a&63](b|0,c|0,d|0,e|0,+f)}function Co(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(0,a|0,b|0,c|0,d|0,+e)}function Cp(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(1,a|0,b|0,c|0,d|0,+e)}function Cq(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(2,a|0,b|0,c|0,d|0,+e)}function Cr(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(3,a|0,b|0,c|0,d|0,+e)}function Cs(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(4,a|0,b|0,c|0,d|0,+e)}function Ct(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(5,a|0,b|0,c|0,d|0,+e)}function Cu(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(6,a|0,b|0,c|0,d|0,+e)}function Cv(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(7,a|0,b|0,c|0,d|0,+e)}function Cw(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(8,a|0,b|0,c|0,d|0,+e)}function Cx(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(9,a|0,b|0,c|0,d|0,+e)}function Cy(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(10,a|0,b|0,c|0,d|0,+e)}function Cz(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(11,a|0,b|0,c|0,d|0,+e)}function CA(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(12,a|0,b|0,c|0,d|0,+e)}function CB(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(13,a|0,b|0,c|0,d|0,+e)}function CC(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(14,a|0,b|0,c|0,d|0,+e)}function CD(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(15,a|0,b|0,c|0,d|0,+e)}function CE(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(16,a|0,b|0,c|0,d|0,+e)}function CF(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(17,a|0,b|0,c|0,d|0,+e)}function CG(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(18,a|0,b|0,c|0,d|0,+e)}function CH(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;return+ai(19,a|0,b|0,c|0,d|0,+e)}function CI(a){a=a|0;return bK[a&127]()|0}function CJ(){return ai(0)|0}function CK(){return ai(1)|0}function CL(){return ai(2)|0}function CM(){return ai(3)|0}function CN(){return ai(4)|0}function CO(){return ai(5)|0}function CP(){return ai(6)|0}function CQ(){return ai(7)|0}function CR(){return ai(8)|0}function CS(){return ai(9)|0}function CT(){return ai(10)|0}function CU(){return ai(11)|0}function CV(){return ai(12)|0}function CW(){return ai(13)|0}function CX(){return ai(14)|0}function CY(){return ai(15)|0}function CZ(){return ai(16)|0}function C_(){return ai(17)|0}function C$(){return ai(18)|0}function C0(){return ai(19)|0}function C1(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return bL[a&127](b|0,c|0,d|0,e|0,f|0)|0}function C2(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(0,a|0,b|0,c|0,d|0,e|0)|0}function C3(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(1,a|0,b|0,c|0,d|0,e|0)|0}function C4(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(2,a|0,b|0,c|0,d|0,e|0)|0}function C5(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(3,a|0,b|0,c|0,d|0,e|0)|0}function C6(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(4,a|0,b|0,c|0,d|0,e|0)|0}function C7(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(5,a|0,b|0,c|0,d|0,e|0)|0}function C8(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(6,a|0,b|0,c|0,d|0,e|0)|0}function C9(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(7,a|0,b|0,c|0,d|0,e|0)|0}function Da(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(8,a|0,b|0,c|0,d|0,e|0)|0}function Db(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(9,a|0,b|0,c|0,d|0,e|0)|0}function Dc(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(10,a|0,b|0,c|0,d|0,e|0)|0}function Dd(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(11,a|0,b|0,c|0,d|0,e|0)|0}function De(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(12,a|0,b|0,c|0,d|0,e|0)|0}function Df(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(13,a|0,b|0,c|0,d|0,e|0)|0}function Dg(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(14,a|0,b|0,c|0,d|0,e|0)|0}function Dh(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(15,a|0,b|0,c|0,d|0,e|0)|0}function Di(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(16,a|0,b|0,c|0,d|0,e|0)|0}function Dj(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(17,a|0,b|0,c|0,d|0,e|0)|0}function Dk(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(18,a|0,b|0,c|0,d|0,e|0)|0}function Dl(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return ai(19,a|0,b|0,c|0,d|0,e|0)|0}function Dm(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;return bM[a&63](+b,+c,+d)|0}function Dn(a,b,c){a=+a;b=+b;c=+c;return ai(0,+a,+b,+c)|0}function Do(a,b,c){a=+a;b=+b;c=+c;return ai(1,+a,+b,+c)|0}function Dp(a,b,c){a=+a;b=+b;c=+c;return ai(2,+a,+b,+c)|0}function Dq(a,b,c){a=+a;b=+b;c=+c;return ai(3,+a,+b,+c)|0}function Dr(a,b,c){a=+a;b=+b;c=+c;return ai(4,+a,+b,+c)|0}function Ds(a,b,c){a=+a;b=+b;c=+c;return ai(5,+a,+b,+c)|0}function Dt(a,b,c){a=+a;b=+b;c=+c;return ai(6,+a,+b,+c)|0}function Du(a,b,c){a=+a;b=+b;c=+c;return ai(7,+a,+b,+c)|0}function Dv(a,b,c){a=+a;b=+b;c=+c;return ai(8,+a,+b,+c)|0}function Dw(a,b,c){a=+a;b=+b;c=+c;return ai(9,+a,+b,+c)|0}function Dx(a,b,c){a=+a;b=+b;c=+c;return ai(10,+a,+b,+c)|0}function Dy(a,b,c){a=+a;b=+b;c=+c;return ai(11,+a,+b,+c)|0}function Dz(a,b,c){a=+a;b=+b;c=+c;return ai(12,+a,+b,+c)|0}function DA(a,b,c){a=+a;b=+b;c=+c;return ai(13,+a,+b,+c)|0}function DB(a,b,c){a=+a;b=+b;c=+c;return ai(14,+a,+b,+c)|0}function DC(a,b,c){a=+a;b=+b;c=+c;return ai(15,+a,+b,+c)|0}function DD(a,b,c){a=+a;b=+b;c=+c;return ai(16,+a,+b,+c)|0}function DE(a,b,c){a=+a;b=+b;c=+c;return ai(17,+a,+b,+c)|0}function DF(a,b,c){a=+a;b=+b;c=+c;return ai(18,+a,+b,+c)|0}function DG(a,b,c){a=+a;b=+b;c=+c;return ai(19,+a,+b,+c)|0}function DH(a,b,c){a=a|0;b=+b;c=+c;return bN[a&63](+b,+c)|0}function DI(a,b){a=+a;b=+b;return ai(0,+a,+b)|0}function DJ(a,b){a=+a;b=+b;return ai(1,+a,+b)|0}function DK(a,b){a=+a;b=+b;return ai(2,+a,+b)|0}function DL(a,b){a=+a;b=+b;return ai(3,+a,+b)|0}function DM(a,b){a=+a;b=+b;return ai(4,+a,+b)|0}function DN(a,b){a=+a;b=+b;return ai(5,+a,+b)|0}function DO(a,b){a=+a;b=+b;return ai(6,+a,+b)|0}function DP(a,b){a=+a;b=+b;return ai(7,+a,+b)|0}function DQ(a,b){a=+a;b=+b;return ai(8,+a,+b)|0}function DR(a,b){a=+a;b=+b;return ai(9,+a,+b)|0}function DS(a,b){a=+a;b=+b;return ai(10,+a,+b)|0}function DT(a,b){a=+a;b=+b;return ai(11,+a,+b)|0}function DU(a,b){a=+a;b=+b;return ai(12,+a,+b)|0}function DV(a,b){a=+a;b=+b;return ai(13,+a,+b)|0}function DW(a,b){a=+a;b=+b;return ai(14,+a,+b)|0}function DX(a,b){a=+a;b=+b;return ai(15,+a,+b)|0}function DY(a,b){a=+a;b=+b;return ai(16,+a,+b)|0}function DZ(a,b){a=+a;b=+b;return ai(17,+a,+b)|0}function D_(a,b){a=+a;b=+b;return ai(18,+a,+b)|0}function D$(a,b){a=+a;b=+b;return ai(19,+a,+b)|0}function D0(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;bO[a&127](b|0,c|0,d|0)}function D1(a,b,c){a=a|0;b=b|0;c=c|0;ai(0,a|0,b|0,c|0)}function D2(a,b,c){a=a|0;b=b|0;c=c|0;ai(1,a|0,b|0,c|0)}function D3(a,b,c){a=a|0;b=b|0;c=c|0;ai(2,a|0,b|0,c|0)}function D4(a,b,c){a=a|0;b=b|0;c=c|0;ai(3,a|0,b|0,c|0)}function D5(a,b,c){a=a|0;b=b|0;c=c|0;ai(4,a|0,b|0,c|0)}function D6(a,b,c){a=a|0;b=b|0;c=c|0;ai(5,a|0,b|0,c|0)}function D7(a,b,c){a=a|0;b=b|0;c=c|0;ai(6,a|0,b|0,c|0)}function D8(a,b,c){a=a|0;b=b|0;c=c|0;ai(7,a|0,b|0,c|0)}function D9(a,b,c){a=a|0;b=b|0;c=c|0;ai(8,a|0,b|0,c|0)}function Ea(a,b,c){a=a|0;b=b|0;c=c|0;ai(9,a|0,b|0,c|0)}function Eb(a,b,c){a=a|0;b=b|0;c=c|0;ai(10,a|0,b|0,c|0)}function Ec(a,b,c){a=a|0;b=b|0;c=c|0;ai(11,a|0,b|0,c|0)}function Ed(a,b,c){a=a|0;b=b|0;c=c|0;ai(12,a|0,b|0,c|0)}function Ee(a,b,c){a=a|0;b=b|0;c=c|0;ai(13,a|0,b|0,c|0)}function Ef(a,b,c){a=a|0;b=b|0;c=c|0;ai(14,a|0,b|0,c|0)}function Eg(a,b,c){a=a|0;b=b|0;c=c|0;ai(15,a|0,b|0,c|0)}function Eh(a,b,c){a=a|0;b=b|0;c=c|0;ai(16,a|0,b|0,c|0)}function Ei(a,b,c){a=a|0;b=b|0;c=c|0;ai(17,a|0,b|0,c|0)}function Ej(a,b,c){a=a|0;b=b|0;c=c|0;ai(18,a|0,b|0,c|0)}function Ek(a,b,c){a=a|0;b=b|0;c=c|0;ai(19,a|0,b|0,c|0)}function El(a){a=a|0;bP[a&63]()}function Em(){ai(0)}function En(){ai(1)}function Eo(){ai(2)}function Ep(){ai(3)}function Eq(){ai(4)}function Er(){ai(5)}function Es(){ai(6)}function Et(){ai(7)}function Eu(){ai(8)}function Ev(){ai(9)}function Ew(){ai(10)}function Ex(){ai(11)}function Ey(){ai(12)}function Ez(){ai(13)}function EA(){ai(14)}function EB(){ai(15)}function EC(){ai(16)}function ED(){ai(17)}function EE(){ai(18)}function EF(){ai(19)}function EG(a,b,c,d){a=a|0;b=b|0;c=c|0;d=+d;bQ[a&127](b|0,c|0,+d)}function EH(a,b,c){a=a|0;b=b|0;c=+c;ai(0,a|0,b|0,+c)}function EI(a,b,c){a=a|0;b=b|0;c=+c;ai(1,a|0,b|0,+c)}function EJ(a,b,c){a=a|0;b=b|0;c=+c;ai(2,a|0,b|0,+c)}function EK(a,b,c){a=a|0;b=b|0;c=+c;ai(3,a|0,b|0,+c)}function EL(a,b,c){a=a|0;b=b|0;c=+c;ai(4,a|0,b|0,+c)}function EM(a,b,c){a=a|0;b=b|0;c=+c;ai(5,a|0,b|0,+c)}function EN(a,b,c){a=a|0;b=b|0;c=+c;ai(6,a|0,b|0,+c)}function EO(a,b,c){a=a|0;b=b|0;c=+c;ai(7,a|0,b|0,+c)}function EP(a,b,c){a=a|0;b=b|0;c=+c;ai(8,a|0,b|0,+c)}function EQ(a,b,c){a=a|0;b=b|0;c=+c;ai(9,a|0,b|0,+c)}function ER(a,b,c){a=a|0;b=b|0;c=+c;ai(10,a|0,b|0,+c)}function ES(a,b,c){a=a|0;b=b|0;c=+c;ai(11,a|0,b|0,+c)}function ET(a,b,c){a=a|0;b=b|0;c=+c;ai(12,a|0,b|0,+c)}function EU(a,b,c){a=a|0;b=b|0;c=+c;ai(13,a|0,b|0,+c)}function EV(a,b,c){a=a|0;b=b|0;c=+c;ai(14,a|0,b|0,+c)}function EW(a,b,c){a=a|0;b=b|0;c=+c;ai(15,a|0,b|0,+c)}function EX(a,b,c){a=a|0;b=b|0;c=+c;ai(16,a|0,b|0,+c)}function EY(a,b,c){a=a|0;b=b|0;c=+c;ai(17,a|0,b|0,+c)}function EZ(a,b,c){a=a|0;b=b|0;c=+c;ai(18,a|0,b|0,+c)}function E_(a,b,c){a=a|0;b=b|0;c=+c;ai(19,a|0,b|0,+c)}function E$(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;bR[a&127](b|0,c|0,d|0,e|0)}function E0(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(0,a|0,b|0,c|0,d|0)}function E1(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(1,a|0,b|0,c|0,d|0)}function E2(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(2,a|0,b|0,c|0,d|0)}function E3(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(3,a|0,b|0,c|0,d|0)}function E4(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(4,a|0,b|0,c|0,d|0)}function E5(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(5,a|0,b|0,c|0,d|0)}function E6(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(6,a|0,b|0,c|0,d|0)}function E7(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(7,a|0,b|0,c|0,d|0)}function E8(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(8,a|0,b|0,c|0,d|0)}function E9(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(9,a|0,b|0,c|0,d|0)}function Fa(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(10,a|0,b|0,c|0,d|0)}function Fb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(11,a|0,b|0,c|0,d|0)}function Fc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(12,a|0,b|0,c|0,d|0)}function Fd(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(13,a|0,b|0,c|0,d|0)}function Fe(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(14,a|0,b|0,c|0,d|0)}function Ff(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(15,a|0,b|0,c|0,d|0)}function Fg(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(16,a|0,b|0,c|0,d|0)}function Fh(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(17,a|0,b|0,c|0,d|0)}function Fi(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(18,a|0,b|0,c|0,d|0)}function Fj(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ai(19,a|0,b|0,c|0,d|0)}function Fk(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ab(0)}function Fl(a,b){a=a|0;b=+b;ab(1)}function Fm(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;ab(2)}function Fn(a){a=a|0;ab(3)}function Fo(a,b){a=a|0;b=b|0;ab(4)}function Fp(a){a=a|0;ab(5);return 0}function Fq(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ab(6)}function Fr(a){a=+a;ab(7);return 0}function Fs(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ab(8);return 0}function Ft(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;ab(9)}function Fu(a,b,c){a=a|0;b=b|0;c=c|0;ab(10);return 0}function Fv(a,b){a=a|0;b=+b;ab(11);return 0.0}function Fw(a,b,c){a=a|0;b=+b;c=+c;ab(12)}function Fx(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;ab(13)}function Fy(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;ab(14)}function Fz(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;ab(15)}function FA(a,b,c){a=a|0;b=b|0;c=+c;ab(16);return 0}function FB(a,b){a=a|0;b=+b;ab(17);return 0}function FC(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;ab(18)}function FD(a){a=a|0;ab(19);return 0.0}function FE(a,b){a=a|0;b=b|0;ab(20);return 0}function FF(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;ab(21);return 0.0}function FG(){ab(22);return 0}function FH(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;ab(23);return 0}function FI(a,b,c){a=+a;b=+b;c=+c;ab(24);return 0}function FJ(a,b){a=+a;b=+b;ab(25);return 0}function FK(a,b,c){a=a|0;b=b|0;c=c|0;ab(26)}function FL(){ab(27)}function FM(a,b,c){a=a|0;b=b|0;c=+c;ab(28)}function FN(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ab(29)}
// EMSCRIPTEN_END_FUNCS
var bo=[Fk,Fk,vv,Fk,vw,Fk,vx,Fk,vy,Fk,vz,Fk,vA,Fk,vB,Fk,vC,Fk,vD,Fk,vE,Fk,vF,Fk,vG,Fk,vH,Fk,vI,Fk,vJ,Fk,vK,Fk,vL,Fk,vM,Fk,vN,Fk,vO,Fk,rF,Fk,u0,Fk,vf,Fk,u$,Fk,ra,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk,Fk];var bp=[Fl,Fl,vQ,Fl,vR,Fl,vS,Fl,vT,Fl,vU,Fl,vV,Fl,vW,Fl,vX,Fl,vY,Fl,vZ,Fl,v_,Fl,v$,Fl,v0,Fl,v1,Fl,v2,Fl,v3,Fl,v4,Fl,v5,Fl,v6,Fl,v7,Fl,gZ,Fl,t0,Fl,rA,Fl,q6,Fl,i3,Fl,jZ,Fl,nz,Fl,gU,Fl,qd,Fl,rb,Fl,s1,Fl,rt,Fl,qk,Fl,hv,Fl,st,Fl,jN,Fl,nm,Fl,rk,Fl,hH,Fl,ok,Fl,qA,Fl,pw,Fl,nq,Fl,hx,Fl,rm,Fl,ph,Fl,qB,Fl,qn,Fl,si,Fl,m1,Fl,pg,Fl,pT,Fl,nc,Fl,rW,Fl,r7,Fl,sA,Fl,tL,Fl,rz,Fl,sd,Fl,i0,Fl,nA,Fl,rB,Fl,tG,Fl,p7,Fl,t$,Fl,nu,Fl,j3,Fl,pP,Fl,lm,Fl,jD,Fl,rY,Fl,p0,Fl,uA,Fl,tR,Fl,s3,Fl,nM,Fl,tB,Fl,qf,Fl,tw,Fl,gI,Fl,su,Fl,p3,Fl,gX,Fl,le,Fl,s6,Fl,oG,Fl,gT,Fl,uZ,Fl,re,Fl,qG,Fl,r0,Fl,mm,Fl,l6,Fl,hl,Fl,oA,Fl,rH,Fl,ty,Fl,jR,Fl,pz,Fl,pX,Fl,pL,Fl,k3,Fl,lY,Fl,tp,Fl,lN,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl,Fl];var bq=[Fm,Fm,v9,Fm,wa,Fm,wb,Fm,wc,Fm,wd,Fm,we,Fm,wf,Fm,wg,Fm,wh,Fm,wi,Fm,wj,Fm,wk,Fm,wl,Fm,wm,Fm,wn,Fm,wo,Fm,wp,Fm,wq,Fm,wr,Fm,ws,Fm,c4,Fm,kE,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm,Fm];var br=[Fn,Fn,wu,Fn,wv,Fn,ww,Fn,wx,Fn,wy,Fn,wz,Fn,wA,Fn,wB,Fn,wC,Fn,wD,Fn,wE,Fn,wF,Fn,wG,Fn,wH,Fn,wI,Fn,wJ,Fn,wK,Fn,wL,Fn,wM,Fn,wN,Fn,gp,Fn,nQ,Fn,jr,Fn,fk,Fn,mO,Fn,lE,Fn,fX,Fn,cV,Fn,eW,Fn,u1,Fn,ef,Fn,fh,Fn,u7,Fn,f2,Fn,pc,Fn,ii,Fn,ev,Fn,fH,Fn,vn,Fn,cE,Fn,ly,Fn,jn,Fn,sH,Fn,lB,Fn,qS,Fn,o1,Fn,eS,Fn,fM,Fn,fT,Fn,lJ,Fn,u9,Fn,e5,Fn,ru,Fn,cz,Fn,dm,Fn,eC,Fn,cS,Fn,g9,Fn,ls,Fn,un,Fn,mw,Fn,hZ,Fn,lt,Fn,gf,Fn,us,Fn,qJ,Fn,d6,Fn,fB,Fn,h6,Fn,cG,Fn,mv,Fn,ns,Fn,sF,Fn,iI,Fn,lz,Fn,dH,Fn,t2,Fn,hf,Fn,gm,Fn,e6,Fn,n_,Fn,mP,Fn,fI,Fn,c0,Fn,qc,Fn,sy,Fn,eA,Fn,ub,Fn,hg,Fn,c$,Fn,dn,Fn,ej,Fn,lT,Fn,mM,Fn,eu,Fn,pj,Fn,g4,Fn,mC,Fn,ky,Fn,qX,Fn,h$,Fn,qj,Fn,n7,Fn,fg,Fn,fi,Fn,mU,Fn,qR,Fn,mr,Fn,h5,Fn,da,Fn,jf,Fn,vb,Fn,mq,Fn,ey,Fn,u8,Fn,kB,Fn,ee,Fn,d$,Fn,gd,Fn,s$,Fn,t8,Fn,u5,Fn,pf,Fn,ib,Fn,d2,Fn,eh,Fn,db,Fn,d4,Fn,kl,Fn,vm,Fn,fU,Fn,cy,Fn,qM,Fn,t4,Fn,jm,Fn,oh,Fn,g8,Fn,fj,Fn,mR,Fn,uh,Fn,o6,Fn,h8,Fn,f6,Fn,ur,Fn,ut,Fn,fu,Fn,kL,Fn,d0,Fn,ue,Fn,e_,Fn,eK,Fn,gl,Fn,eV,Fn,up,Fn,js,Fn,fa,Fn,lK,Fn,kz,Fn,sz,Fn,g3,Fn,sJ,Fn,qY,Fn,et,Fn,uj,Fn,o7,Fn,fo,Fn,u3,Fn,va,Fn,eM,Fn,gc,Fn,g7,Fn,f3,Fn,uk,Fn,fv,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn,Fn];var bs=[Fo,Fo,wP,Fo,wQ,Fo,wR,Fo,wS,Fo,wT,Fo,wU,Fo,wV,Fo,wW,Fo,wX,Fo,wY,Fo,wZ,Fo,w_,Fo,w$,Fo,w0,Fo,w1,Fo,w2,Fo,w3,Fo,w4,Fo,w5,Fo,w6,Fo,sg,Fo,lV,Fo,i4,Fo,fz,Fo,oV,Fo,qb,Fo,lF,Fo,r2,Fo,rR,Fo,h0,Fo,hy,Fo,iA,Fo,r3,Fo,sQ,Fo,ik,Fo,qD,Fo,gy,Fo,tT,Fo,k5,Fo,fR,Fo,fC,Fo,eT,Fo,uM,Fo,f8,Fo,tl,Fo,m5,Fo,sP,Fo,iQ,Fo,ng,Fo,ti,Fo,pI,Fo,uR,Fo,eF,Fo,pN,Fo,uO,Fo,jX,Fo,f4,Fo,j5,Fo,ja,Fo,q1,Fo,o2,Fo,of,Fo,fq,Fo,sn,Fo,e3,Fo,uD,Fo,uY,Fo,uL,Fo,pl,Fo,el,Fo,o$,Fo,fP,Fo,jg,Fo,c6,Fo,um,Fo,n6,Fo,pd,Fo,gs,Fo,j0,Fo,ed,Fo,f0,Fo,jj,Fo,is,Fo,hQ,Fo,f7,Fo,sM,Fo,gz,Fo,pb,Fo,rn,Fo,tS,Fo,sO,Fo,ge,Fo,mc,Fo,ke,Fo,sj,Fo,fO,Fo,fb,Fo,rE,Fo,oY,Fo,gn,Fo,tv,Fo,j7,Fo,pA,Fo,iK,Fo,sY,Fo,gK,Fo,gC,Fo,e0,Fo,nN,Fo,rD,Fo,fD,Fo,gg,Fo,my,Fo,eH,Fo,rQ,Fo,uT,Fo,pM,Fo,pW,Fo,iP,Fo,oB,Fo,q8,Fo,q_,Fo,ho,Fo,gx,Fo,rT,Fo,sS,Fo,hb,Fo,fZ,Fo,pH,Fo,fA,Fo,rw,Fo,fx,Fo,q9,Fo,fc,Fo,qw,Fo,hm,Fo,ha,Fo,sh,Fo,eb,Fo,te,Fo,e8,Fo,md,Fo,uS,Fo,s7,Fo,rV,Fo,po,Fo,dD,Fo,eY,Fo,sk,Fo,oj,Fo,i6,Fo,o3,Fo,p2,Fo,pt,Fo,e9,Fo,kW,Fo,ul,Fo,tF,Fo,rx,Fo,ps,Fo,ga,Fo,q0,Fo,qu,Fo,lX,Fo,tg,Fo,j6,Fo,kt,Fo,fr,Fo,o0,Fo,oW,Fo,rS,Fo,iG,Fo,tD,Fo,oP,Fo,iz,Fo,tN,Fo,mz,Fo,sf,Fo,pS,Fo,uy,Fo,e$,Fo,e4,Fo,mb,Fo,fY,Fo,fV,Fo,ma,Fo,hi,Fo,eP,Fo,tC,Fo,ft,Fo,jd,Fo,uG,Fo,eJ,Fo,gq,Fo,m6,Fo,iy,Fo,qx,Fo,mo,Fo,hX,Fo,dC,Fo,ux,Fo,uz,Fo,hF,Fo,uJ,Fo,pQ,Fo,ro,Fo,pr,Fo,rq,Fo,r_,Fo,fW,Fo,uF,Fo,jH,Fo,iU,Fo,l$,Fo,t_,Fo,tQ,Fo,so,Fo,fN,Fo,nB,Fo,gh,Fo,nK,Fo,nG,Fo,gA,Fo,to,Fo,sV,Fo,kC,Fo,eN,Fo,pV,Fo,se,Fo,tK,Fo,eO,Fo,sX,Fo,iT,Fo,gr,Fo,q5,Fo,qt,Fo,qi,Fo,tn,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo,Fo];var bt=[Fp,Fp,w8,Fp,w9,Fp,xa,Fp,xb,Fp,xc,Fp,xd,Fp,xe,Fp,xf,Fp,xg,Fp,xh,Fp,xi,Fp,xj,Fp,xk,Fp,xl,Fp,xm,Fp,xn,Fp,xo,Fp,xp,Fp,xq,Fp,xr,Fp,qo,Fp,gL,Fp,hG,Fp,sU,Fp,jy,Fp,ll,Fp,kg,Fp,hR,Fp,r8,Fp,rg,Fp,iH,Fp,k7,Fp,r9,Fp,iF,Fp,hS,Fp,iO,Fp,i_,Fp,p9,Fp,p_,Fp,jJ,Fp,g$,Fp,mn,Fp,iL,Fp,iJ,Fp,gJ,Fp,tI,Fp,iV,Fp,ny,Fp,pm,Fp,pJ,Fp,hp,Fp,pR,Fp,oK,Fp,iM,Fp,lG,Fp,q3,Fp,pG,Fp,ie,Fp,iW,Fp,gM,Fp,ml,Fp,oU,Fp,lu,Fp,gv,Fp,gH,Fp,qe,Fp,i1,Fp,uW,Fp,np,Fp,qz,Fp,r5,Fp,oq,Fp,ka,Fp,oT,Fp,sW,Fp,hu,Fp,gD,Fp,nr,Fp,lR,Fp,lf,Fp,lH,Fp,m9,Fp,iN,Fp,uH,Fp,qr,Fp,qE,Fp,jL,Fp,th,Fp,oM,Fp,lr,Fp,rM,Fp,nX,Fp,j9,Fp,lM,Fp,h3,Fp,nH,Fp,p8,Fp,sq,Fp,ht,Fp,kS,Fp,hI,Fp,o4,Fp,no,Fp,gY,Fp,mj,Fp,iB,Fp,jC,Fp,kZ,Fp,j8,Fp,mt,Fp,j4,Fp,mV,Fp,oi,Fp,oQ,Fp,kd,Fp,mg,Fp,mS,Fp,k8,Fp,lk,Fp,hz,Fp,m$,Fp,oy,Fp,jO,Fp,kh,Fp,hK,Fp,nv,Fp,nI,Fp,gF,Fp,hP,Fp,mk,Fp,rs,Fp,gw,Fp,m7,Fp,mi,Fp,kT,Fp,ku,Fp,pi,Fp,i8,Fp,hq,Fp,tV,Fp,rK,Fp,p$,Fp,lQ,Fp,uI,Fp,hr,Fp,na,Fp,i5,Fp,pv,Fp,k4,Fp,nj,Fp,p1,Fp,o8,Fp,m0,Fp,m8,Fp,iY,Fp,hJ,Fp,iR,Fp,iv,Fp,iX,Fp,jz,Fp,h9,Fp,pF,Fp,tb,Fp,gR,Fp,px,Fp,cx,Fp,gE,Fp,kv,Fp,n3,Fp,hk,Fp,l8,Fp,hM,Fp,lW,Fp,ou,Fp,kf,Fp,hB,Fp,nf,Fp,cJ,Fp,rI,Fp,ln,Fp,iD,Fp,hE,Fp,ld,Fp,kb,Fp,hw,Fp,sT,Fp,kV,Fp,iC,Fp,nk,Fp,lb,Fp,ts,Fp,i$,Fp,g_,Fp,nn,Fp,k1,Fp,q7,Fp,lS,Fp,lZ,Fp,jB,Fp,jK,Fp,sN,Fp,iS,Fp,vk,Fp,jQ,Fp,l2,Fp,tc,Fp,uU,Fp,lg,Fp,hW,Fp,kk,Fp,k2,Fp,kM,Fp,ix,Fp,nl,Fp,rr,Fp,mh,Fp,iq,Fp,ta,Fp,qH,Fp,tq,Fp,k$,Fp,iu,Fp,s8,Fp,or,Fp,jM,Fp,sR,Fp,l9,Fp,jo,Fp,k6,Fp,rC,Fp,kK,Fp,kw,Fp,gS,Fp,kc,Fp,l4,Fp,jv,Fp,oH,Fp,hd,Fp,g1,Fp,uN,Fp,rX,Fp,uK,Fp,lh,Fp,li,Fp,oC,Fp,me,Fp,kP,Fp,om,Fp,jp,Fp,hc,Fp,jV,Fp,gG,Fp,gN,Fp,l5,Fp,kX,Fp,j_,Fp,jI,Fp,pE,Fp,h1,Fp,sr,Fp,on,Fp,sZ,Fp,ki,Fp,ox,Fp,oN,Fp,kY,Fp,rd,Fp,nD,Fp,tX,Fp,hL,Fp,sl,Fp,jS,Fp,uC,Fp,ol,Fp,h2,Fp,iw,Fp,oO,Fp,oX,Fp,qv,Fp,pK,Fp,qq,Fp,gV,Fp,oJ,Fp,jt,Fp,sm,Fp,nJ,Fp,hV,Fp,oF,Fp,hN,Fp,cH,Fp,cF,Fp,hO,Fp,nx,Fp,oL,Fp,kO,Fp,ih,Fp,s_,Fp,uw,Fp,oR,Fp,od,Fp,kU,Fp,mJ,Fp,j2,Fp,pn,Fp,iE,Fp,kq,Fp,ql,Fp,gB,Fp,jh,Fp,ne,Fp,rf,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp,Fp];var bu=[Fq,Fq,xt,Fq,xu,Fq,xv,Fq,xw,Fq,xx,Fq,xy,Fq,xz,Fq,xA,Fq,xB,Fq,xC,Fq,xD,Fq,xE,Fq,xF,Fq,xG,Fq,xH,Fq,xI,Fq,xJ,Fq,xK,Fq,xL,Fq,xM,Fq,kG,Fq,c3,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq,Fq];var bv=[Fr,Fr,xO,Fr,xP,Fr,xQ,Fr,xR,Fr,xS,Fr,xT,Fr,xU,Fr,xV,Fr,xW,Fr,xX,Fr,xY,Fr,xZ,Fr,x_,Fr,x$,Fr,x0,Fr,x1,Fr,x2,Fr,x3,Fr,x4,Fr,x5,Fr,sD,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr,Fr];var bw=[Fs,Fs,x7,Fs,x8,Fs,x9,Fs,ya,Fs,yb,Fs,yc,Fs,yd,Fs,ye,Fs,yf,Fs,yg,Fs,yh,Fs,yi,Fs,yj,Fs,yk,Fs,yl,Fs,ym,Fs,yn,Fs,yo,Fs,yp,Fs,yq,Fs,h_,Fs,lD,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs,Fs];var bx=[Ft,Ft,ys,Ft,yt,Ft,yu,Ft,yv,Ft,yw,Ft,yx,Ft,yy,Ft,yz,Ft,yA,Ft,yB,Ft,yC,Ft,yD,Ft,yE,Ft,yF,Ft,yG,Ft,yH,Ft,yI,Ft,yJ,Ft,yK,Ft,yL,Ft,nV,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft,Ft];var by=[Fu,Fu,yN,Fu,yO,Fu,yP,Fu,yQ,Fu,yR,Fu,yS,Fu,yT,Fu,yU,Fu,yV,Fu,yW,Fu,yX,Fu,yY,Fu,yZ,Fu,y_,Fu,y$,Fu,y0,Fu,y1,Fu,y2,Fu,y3,Fu,y4,Fu,lC,Fu,n4,Fu,il,Fu,nY,Fu,ir,Fu,vc,Fu,cK,Fu,kr,Fu,d1,Fu,mK,Fu,oe,Fu,c7,Fu,cI,Fu,cD,Fu,ud,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu,Fu];var bz=[Fv,Fv,y6,Fv,y7,Fv,y8,Fv,y9,Fv,za,Fv,zb,Fv,zc,Fv,zd,Fv,ze,Fv,zf,Fv,zg,Fv,zh,Fv,zi,Fv,zj,Fv,zk,Fv,zl,Fv,zm,Fv,zn,Fv,zo,Fv,zp,Fv,jc,Fv,kj,Fv,mT,Fv,gu,Fv,fp,Fv,fe,Fv,h7,Fv,jU,Fv,gj,Fv,ia,Fv,f5,Fv,o5,Fv,f$,Fv,hh,Fv,lq,Fv,kA,Fv,lL,Fv,ms,Fv,fF,Fv,fL,Fv,kQ,Fv,e2,Fv,kJ,Fv,eL,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv,Fv];var bA=[Fw,Fw,zr,Fw,zs,Fw,zt,Fw,zu,Fw,zv,Fw,zw,Fw,zx,Fw,zy,Fw,zz,Fw,zA,Fw,zB,Fw,zC,Fw,zD,Fw,zE,Fw,zF,Fw,zG,Fw,zH,Fw,zI,Fw,zJ,Fw,zK,Fw,kR,Fw,mW,Fw,m4,Fw,p4,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw,Fw];var bB=[Fx,Fx,zM,Fx,zN,Fx,zO,Fx,zP,Fx,zQ,Fx,zR,Fx,zS,Fx,zT,Fx,zU,Fx,zV,Fx,zW,Fx,zX,Fx,zY,Fx,zZ,Fx,z_,Fx,z$,Fx,z0,Fx,z1,Fx,z2,Fx,z3,Fx,sI,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx,Fx];var bC=[Fy,Fy,z5,Fy,z6,Fy,z7,Fy,z8,Fy,z9,Fy,Aa,Fy,Ab,Fy,Ac,Fy,Ad,Fy,Ae,Fy,Af,Fy,Ag,Fy,Ah,Fy,Ai,Fy,Aj,Fy,Ak,Fy,Al,Fy,Am,Fy,An,Fy,Ao,Fy,qg,Fy,s0,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy,Fy];var bD=[Fz,Fz,Aq,Fz,Ar,Fz,As,Fz,At,Fz,Au,Fz,Av,Fz,Aw,Fz,Ax,Fz,Ay,Fz,Az,Fz,AA,Fz,AB,Fz,AC,Fz,AD,Fz,AE,Fz,AF,Fz,AG,Fz,AH,Fz,AI,Fz,AJ,Fz,vg,Fz,vh,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz,Fz];var bE=[FA,FA,AL,FA,AM,FA,AN,FA,AO,FA,AP,FA,AQ,FA,AR,FA,AS,FA,AT,FA,AU,FA,AV,FA,AW,FA,AX,FA,AY,FA,AZ,FA,A_,FA,A$,FA,A0,FA,A1,FA,A2,FA,o_,FA,FA,FA,FA,FA,FA,FA,FA,FA,FA,FA,FA,FA,FA,FA,FA,FA,FA,FA,FA,FA];var bF=[FB,FB,A4,FB,A5,FB,A6,FB,A7,FB,A8,FB,A9,FB,Ba,FB,Bb,FB,Bc,FB,Bd,FB,Be,FB,Bf,FB,Bg,FB,Bh,FB,Bi,FB,Bj,FB,Bk,FB,Bl,FB,Bm,FB,Bn,FB,kx,FB,kN,FB,jq,FB,mp,FB,nP,FB,h4,FB,lI,FB,ig,FB,o9,FB,he,FB,lv,FB];var bG=[FC,FC,Bp,FC,Bq,FC,Br,FC,Bs,FC,Bt,FC,Bu,FC,Bv,FC,Bw,FC,Bx,FC,By,FC,Bz,FC,BA,FC,BB,FC,BC,FC,BD,FC,BE,FC,BF,FC,BG,FC,BH,FC,BI,FC,ji,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC,FC];var bH=[FD,FD,BK,FD,BL,FD,BM,FD,BN,FD,BO,FD,BP,FD,BQ,FD,BR,FD,BS,FD,BT,FD,BU,FD,BV,FD,BW,FD,BX,FD,BY,FD,BZ,FD,B_,FD,B$,FD,B0,FD,B1,FD,jP,FD,l1,FD,k9,FD,ow,FD,gQ,FD,p6,FD,nd,FD,oD,FD,tM,FD,l_,FD,tH,FD,hD,FD,m2,FD,pC,FD,pD,FD,jx,FD,pU,FD,nL,FD,jY,FD,tZ,FD,iZ,FD,j$,FD,tr,FD,rp,FD,l0,FD,rl,FD,nC,FD,g0,FD,qm,FD,uE,FD,r6,FD,rJ,FD,jT,FD,lo,FD,qh,FD,qC,FD,ry,FD,oo,FD,oE,FD,gP,FD,l7,FD,tU,FD,tE,FD,qN,FD,oI,FD,hA,FD,rG,FD,nw,FD,tW,FD,sK,FD,lc,FD,qF,FD,qQ,FD,hU,FD,rN,FD,hC,FD,nh,FD,sL,FD,nt,FD,gO,FD,s4,FD,lj,FD,pu,FD,sB,FD,gW,FD,s2,FD,jE,FD,r$,FD,qa,FD,qy,FD,k0,FD,rv,FD,q4,FD,ni,FD,hT,FD,lU,FD,tm,FD,mf,FD,it,FD,uV,FD,oS,FD,td,FD,l3,FD,i9,FD,s5,FD,r1,FD,jA,FD,hs,FD,la,FD,q2,FD,id,FD,i2,FD,pZ,FD,jW,FD,tu,FD,rU,FD,rc,FD,p5,FD,j1,FD,i7,FD,lp,FD,k_,FD,sp,FD,rZ,FD,pO,FD,pY,FD,jb,FD,ic,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD,FD];var bI=[FE,FE,B3,FE,B4,FE,B5,FE,B6,FE,B7,FE,B8,FE,B9,FE,Ca,FE,Cb,FE,Cc,FE,Cd,FE,Ce,FE,Cf,FE,Cg,FE,Ch,FE,Ci,FE,Cj,FE,Ck,FE,Cl,FE,Cm,FE,ip,FE,hn,FE,t7,FE,tk,FE,ss,FE,hY,FE,rP,FE,tt,FE,tO,FE,sc,FE,sa,FE,fS,FE,tP,FE,nF,FE,lP,FE,rO,FE,io,FE,jG,FE,qp,FE,uX,FE,cQ,FE,m3,FE,tj,FE,fG,FE,sv,FE,nT,FE,pp,FE,fn,FE,oz,FE,jw,FE,sb,FE,cW,FE,sw,FE,pq,FE,lO,FE,py,FE,uv,FE,kn,FE,rj,FE,pk,FE,dv,FE,oa,FE,gb,FE,uQ,FE,jk,FE,tJ,FE,rh,FE,ju,FE,jF,FE,ff,FE,cT,FE,uP,FE,ot,FE,g2,FE,mE,FE,eZ,FE,rL,FE,nO,FE,uB,FE,oZ,FE,cC,FE,uu,FE,ov,FE,f1,FE,qs,FE,os,FE,uo,FE,n0,FE,ri,FE,tA,FE,tY,FE,mL,FE,mQ,FE,s9,FE,eU,FE,gk,FE,q$,FE,tz,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE,FE];var bJ=[FF,FF,Co,FF,Cp,FF,Cq,FF,Cr,FF,Cs,FF,Ct,FF,Cu,FF,Cv,FF,Cw,FF,Cx,FF,Cy,FF,Cz,FF,CA,FF,CB,FF,CC,FF,CD,FF,CE,FF,CF,FF,CG,FF,CH,FF,lw,FF,uq,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF];var bK=[FG,FG,CJ,FG,CK,FG,CL,FG,CM,FG,CN,FG,CO,FG,CP,FG,CQ,FG,CR,FG,CS,FG,CT,FG,CU,FG,CV,FG,CW,FG,CX,FG,CY,FG,CZ,FG,C_,FG,C$,FG,C0,FG,qI,FG,g5,FG,lx,FG,mG,FG,sC,FG,pa,FG,m_,FG,t6,FG,lA,FG,qZ,FG,qK,FG,uf,FG,kI,FG,uc,FG,sx,FG,ks,FG,qL,FG,ij,FG,pe,FG,mN,FG,t1,FG,hj,FG,ug,FG,mu,FG,t9,FG,qW,FG,nZ,FG,sE,FG,u6,FG,n5,FG,qO,FG,sG,FG,mx,FG,ui,FG,u4,FG,qT,FG,t3,FG,u2,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG,FG];var bL=[FH,FH,C2,FH,C3,FH,C4,FH,C5,FH,C6,FH,C7,FH,C8,FH,C9,FH,Da,FH,Db,FH,Dc,FH,Dd,FH,De,FH,Df,FH,Dg,FH,Dh,FH,Di,FH,Dj,FH,Dk,FH,Dl,FH,de,FH,n1,FH,ko,FH,ob,FH,cZ,FH,ea,FH,eI,FH,mI,FH,nU,FH,eE,FH,ek,FH,eG,FH,cR,FH,cU,FH,eX,FH,ec,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH,FH];var bM=[FI,FI,Dn,FI,Do,FI,Dp,FI,Dq,FI,Dr,FI,Ds,FI,Dt,FI,Du,FI,Dv,FI,Dw,FI,Dx,FI,Dy,FI,Dz,FI,DA,FI,DB,FI,DC,FI,DD,FI,DE,FI,DF,FI,DG,FI,ua,FI,qU,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI,FI];var bN=[FJ,FJ,DI,FJ,DJ,FJ,DK,FJ,DL,FJ,DM,FJ,DN,FJ,DO,FJ,DP,FJ,DQ,FJ,DR,FJ,DS,FJ,DT,FJ,DU,FJ,DV,FJ,DW,FJ,DX,FJ,DY,FJ,DZ,FJ,D_,FJ,D$,FJ,qP,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ,FJ];var bO=[FK,FK,D1,FK,D2,FK,D3,FK,D4,FK,D5,FK,D6,FK,D7,FK,D8,FK,D9,FK,Ea,FK,Eb,FK,Ec,FK,Ed,FK,Ee,FK,Ef,FK,Eg,FK,Eh,FK,Ei,FK,Ej,FK,Ek,FK,mA,FK,mB,FK,mY,FK,dE,FK,mX,FK,tf,FK,mZ,FK,nR,FK,g6,FK,je,FK,mF,FK,qV,FK,nb,FK,nE,FK,dF,FK,op,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK,FK];var bP=[FL,FL,Em,FL,En,FL,Eo,FL,Ep,FL,Eq,FL,Er,FL,Es,FL,Et,FL,Eu,FL,Ev,FL,Ew,FL,Ex,FL,Ey,FL,Ez,FL,EA,FL,EB,FL,EC,FL,ED,FL,EE,FL,EF,FL,vt,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL,FL];var bQ=[FM,FM,EH,FM,EI,FM,EJ,FM,EK,FM,EL,FM,EM,FM,EN,FM,EO,FM,EP,FM,EQ,FM,ER,FM,ES,FM,ET,FM,EU,FM,EV,FM,EW,FM,EX,FM,EY,FM,EZ,FM,E_,FM,cP,FM,t5,FM,fd,FM,n$,FM,cM,FM,gt,FM,f_,FM,fs,FM,n9,FM,f9,FM,km,FM,og,FM,mD,FM,fE,FM,nS,FM,e1,FM,df,FM,gi,FM,eQ,FM,fQ,FM,cO,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM,FM];var bR=[FN,FN,E0,FN,E1,FN,E2,FN,E3,FN,E4,FN,E5,FN,E6,FN,E7,FN,E8,FN,E9,FN,Fa,FN,Fb,FN,Fc,FN,Fd,FN,Fe,FN,Ff,FN,Fg,FN,Fh,FN,Fi,FN,Fj,FN,cL,FN,cN,FN,kD,FN,kF,FN,im,FN,c_,FN,d3,FN,c1,FN,eB,FN,vd,FN,ez,FN,nW,FN,mH,FN,n2,FN,d5,FN,n8,FN,u_,FN,kp,FN,tx,FN,ex,FN,c2,FN,c8,FN,c5,FN,eg,FN,eR,FN,jl,FN,kH,FN,pB,FN,r4,FN,oc,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN,FN];return{_emscripten_bind_b2WheelJoint__GetSpringFrequencyHz_p0:jP,_emscripten_bind_b2Fixture__SetRestitution_p1:gZ,_emscripten_bind_b2PolygonShape____destroy___p0:nQ,_emscripten_bind_b2RevoluteJoint__EnableLimit_p1:lV,_emscripten_bind_b2DistanceProxy__get_m_vertices_p0:qo,_emscripten_bind_b2PrismaticJoint__EnableLimit_p1:i4,_emscripten_bind_b2WheelJointDef__Initialize_p4:rF,_emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1:t0,_emscripten_bind_b2PrismaticJoint__GetMotorForce_p1:jc,_emscripten_bind_b2Body__IsSleepingAllowed_p0:ny,_emscripten_bind_b2Vec2__b2Vec2_p2:qP,_emscripten_bind_b2RevoluteJoint__GetMaxMotorTorque_p0:l1,_emscripten_bind_b2WeldJoint__GetFrequency_p0:k9,_emscripten_bind_b2MouseJoint__GetType_p0:hG,_emscripten_bind_b2RayCastCallback__b2RayCastCallback_p0:lx,_emscripten_bind_b2Body__GetLinearDamping_p0:ow,_emscripten_bind_b2Vec2__b2Vec2_p0:qO,_emscripten_bind_b2PrismaticJoint__GetType_p0:jy,_emscripten_bind_b2PrismaticJoint____destroy___p0:jr,_emscripten_bind_b2WheelJointDef__set_frequencyHz_p1:rA,_emscripten_bind_b2BlockAllocator____destroy___p0:mO,_emscripten_bind_b2Vec2__op_add_p1:qb,_emscripten_bind_b2World__GetJointList_p0:iE,_emscripten_bind_b2Transform__Set_p2:t5,_emscripten_bind_b2EdgeShape__RayCast_p4:n1,_emscripten_bind_b2RevoluteJoint__GetLocalAnchorA_p0:ll,_emscripten_bind_b2DistanceJoint__GetDampingRatio_p0:gQ,_emscripten_bind_b2PulleyJointDef__set_bodyA_p1:sn,_emscripten_bind_b2DynamicTree__Validate_p0:lE,_emscripten_bind_b2DynamicTree__DestroyProxy_p1:lF,_emscripten_bind_b2Joint__IsActive_p0:kg,_emscripten_bind_b2PulleyJoint__GetNext_p0:hR,_emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0:r8,_emscripten_bind_b2GearJoint__IsActive_p0:kZ,_emscripten_bind_b2EdgeShape__get_m_radius_p0:nd,_emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0:rg,_emscripten_bind_b2RevoluteJointDef__set_bodyA_p1:r2,_emscripten_bind_b2World__GetJointCount_p0:iH,_emscripten_bind_b2DynamicTree__CreateProxy_p2:lC,_emscripten_bind_b2WheelJointDef__set_collideConnected_p1:rR,_emscripten_bind_b2WeldJoint__GetLocalAnchorA_p0:k7,_emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0:r9,_emscripten_bind_b2Body__GetGravityScale_p0:oD,_emscripten_bind_b2Fixture__Dump_p1:h0,_emscripten_bind_b2World__GetBodyList_p0:iF,_emscripten_bind_b2PulleyJoint__IsActive_p0:hS,_emscripten_bind_b2MouseJoint__SetUserData_p1:hy,_emscripten_bind_b2World__GetContactList_p0:iO,_emscripten_bind_b2PrismaticJoint__GetNext_p0:i_,_emscripten_bind_b2Vec2__Skew_p0:p9,_emscripten_bind_b2BodyDef__get_linearVelocity_p0:p_,_emscripten_bind_b2Body__GetPosition_p0:oH,_emscripten_bind_b2WheelJoint__GetReactionForce_p1:kx,_emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1:q6,_emscripten_bind_b2PrismaticJoint__SetMaxMotorForce_p1:i3,_emscripten_bind_b2ChainShape__b2ChainShape_p0:mG,_emscripten_bind_b2CircleShape__RayCast_p4:ko,_emscripten_bind_b2WheelJoint__GetBodyA_p0:jJ,_emscripten_bind_b2RevoluteJointDef__set_bodyB_p1:r3,_emscripten_bind_b2MouseJointDef__get_dampingRatio_p0:tM,_emscripten_bind_b2JointDef__set_bodyB_p1:sQ,_emscripten_bind_b2RevoluteJoint__GetJointSpeed_p0:l_,_emscripten_bind_b2RopeJoint__GetLocalAnchorB_p0:mn,_emscripten_bind_b2Fixture__GetAABB_p1:hn,_emscripten_bind_b2BroadPhase__TouchProxy_p1:ik,_emscripten_bind_b2FixtureDef__set_isSensor_p1:qD,_emscripten_bind_b2World__GetAllowSleeping_p0:iL,_emscripten_bind_b2DestructionListener____destroy___p0:pc,_emscripten_bind_b2BroadPhase____destroy___p0:ii,_emscripten_bind_b2World__GetWarmStarting_p0:iJ,_emscripten_bind_b2Rot__b2Rot_p1:sD,_emscripten_bind_b2Rot__b2Rot_p0:sC,_emscripten_bind_b2DistanceJoint__GetUserData_p0:gJ,_emscripten_bind_b2MouseJointDef__get_frequencyHz_p0:tH,_emscripten_bind_b2ContactManager__set_m_allocator_p1:gy,_emscripten_bind_b2WheelJoint__SetMaxMotorTorque_p1:jZ,_emscripten_bind_b2RopeJointDef__get_collideConnected_p1:uX,_emscripten_bind_b2MouseJointDef__get_target_p0:tI,_emscripten_bind_b2WeldJoint__SetUserData_p1:k5,_emscripten_bind_b2PrismaticJoint__GetBodyA_p0:iV,_emscripten_bind_b2FrictionJointDef____destroy___p0:qJ,_emscripten_bind_b2RopeJoint__GetMaxLength_p0:mf,_emscripten_bind_b2MouseJoint__GetDampingRatio_p0:hD,_emscripten_bind_b2DistanceJoint__GetNext_p0:gL,_emscripten_bind_b2Filter__get_maskBits_p0:pm,_emscripten_bind_b2RayCastCallback____destroy___p0:ly,_emscripten_bind_b2World__Dump_p0:jn,_emscripten_bind_b2RevoluteJointDef____destroy___p0:sH,_emscripten_bind_b2PrismaticJoint__GetAnchorA_p0:jo,_emscripten_bind_b2BodyDef__get_bullet_p0:pJ,_emscripten_bind_b2Body__SetAngularDamping_p1:nz,_emscripten_bind_b2DynamicTree__RebuildBottomUp_p0:lB,_emscripten_bind_b2Fixture__GetFilterData_p0:hp,_emscripten_bind_b2DistanceJoint__SetLength_p1:gU,_emscripten_bind_b2BodyDef__get_position_p0:pR,_emscripten_bind_b2FrictionJoint__GetUserData_p0:oK,_emscripten_bind_b2PolygonShape__get_m_radius_p0:m2,_emscripten_bind_b2ContactEdge__set_next_p1:uM,_emscripten_bind_b2Transform__b2Transform_p2:t7,_emscripten_bind_b2FrictionJointDef__get_maxTorque_p0:pC,_emscripten_bind_b2WeldJointDef__set_localAnchorB_p1:tl,_emscripten_bind_b2World__GetProxyCount_p0:iM,_emscripten_bind_b2WeldJointDef__get_bodyB_p1:tk,_emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1:rb,_emscripten_bind_b2PolygonShape__set_m_centroid_p1:m5,_emscripten_bind_b2GearJoint__GetAnchorA_p0:kP,_emscripten_bind_b2PulleyJointDef__get_collideConnected_p1:ss,_emscripten_bind_b2Vec3____destroy___p0:qS,_emscripten_bind_b2Color__set_r_p1:s1,_emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0:q3,_emscripten_bind_b2BodyDef__get_linearDamping_p0:pD,_emscripten_bind_b2EdgeShape__ComputeMass_p2:n$,_emscripten_bind_b2RayCastCallback__ReportFixture_p4:lw,_emscripten_bind_b2Body__Dump_p0:o1,_emscripten_bind_b2BodyDef__get_allowSleep_p0:pG,_emscripten_bind_b2AABB__get_lowerBound_p0:th,_emscripten_bind_b2PulleyJoint__GetAnchorB_p0:ie,_emscripten_bind_b2PrismaticJoint__GetReactionTorque_p1:kj,_emscripten_bind_b2JointDef__set_bodyA_p1:sP,_emscripten_bind_b2PrismaticJoint__GetBodyB_p0:iW,_emscripten_bind_b2DistanceJoint__GetLocalAnchorA_p0:gM,_emscripten_bind_b2RopeJoint__GetLocalAnchorA_p0:ml,_emscripten_bind_b2Rot__set_c_p1:rt,_emscripten_bind_b2Vec3__op_mul_p1:qk,_emscripten_bind_b2StackAllocator__GetMaxAllocation_p0:oU,_emscripten_bind_b2MouseJoint__SetFrequency_p1:hv,_emscripten_bind_b2WeldJoint__GetAnchorA_p0:lH,_emscripten_bind_b2World__SetAutoClearForces_p1:iQ,_emscripten_bind_b2Contact__SetEnabled_p1:ng,_emscripten_bind_b2ContactManager__get_m_contactFilter_p0:gv,_emscripten_bind_b2BodyDef__get_angularDamping_p0:pU,_emscripten_bind_b2WeldJointDef__set_localAnchorA_p1:ti,_emscripten_bind_b2DistanceJoint__GetBodyB_p0:gH,_emscripten_bind_b2PulleyJointDef__set_lengthB_p1:st,_emscripten_bind_b2Vec2__op_sub_p0:qe,_emscripten_bind_b2PrismaticJoint__GetLocalAnchorB_p0:i1,_emscripten_bind_b2RopeJointDef__get_localAnchorB_p0:uW,_emscripten_bind_b2Contact__GetChildIndexB_p0:np,_emscripten_bind_b2Fixture__TestPoint_p1:hY,_emscripten_bind_b2FixtureDef__get_shape_p0:qz,_emscripten_bind_b2WheelJointDef__get_bodyB_p1:rP,_emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0:r5,_emscripten_bind_b2BodyDef__set_linearVelocity_p1:pI,_emscripten_bind_b2Body__GetMass_p0:nL,_emscripten_bind_b2WeldJoint____destroy___p0:lJ,_emscripten_bind_b2WheelJoint__GetSpringDampingRatio_p0:jY,_emscripten_bind_b2RopeJointDef__set_localAnchorB_p1:uR,_emscripten_bind_b2Body__IsFixedRotation_p0:oq,_emscripten_bind_b2Rot__SetIdentity_p0:ru,_emscripten_bind_b2WheelJoint__SetSpringDampingRatio_p1:jN,_emscripten_bind_b2Joint__SetUserData_p1:ke,_emscripten_bind_b2FrictionJoint__IsActive_p0:oT,_emscripten_bind_b2JointDef__get_userData_p0:sW,_emscripten_bind_b2Draw__DrawPolygon_p3:kD,_emscripten_bind_b2MouseJoint__GetBodyB_p0:hu,_emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0:tZ,_emscripten_bind_b2ContactManager__get_m_broadPhase_p0:gD,_emscripten_bind_b2RopeJoint__GetReactionTorque_p1:mT,_emscripten_bind_b2PrismaticJoint__GetLowerLimit_p0:iZ,_emscripten_bind_b2Contact__GetManifold_p0:nr,_emscripten_bind_b2Contact__SetFriction_p1:nm,_emscripten_bind_b2WheelJoint__GetJointSpeed_p0:j$,_emscripten_bind_b2BodyDef__set_allowSleep_p1:pN,_emscripten_bind_b2Fixture__RayCast_p3:h_,_emscripten_bind_b2WeldJointDef__get_referenceAngle_p0:tr,_emscripten_bind_b2Fixture____destroy___p0:hZ,_emscripten_bind_b2RopeJointDef__set_localAnchorA_p1:uO,_emscripten_bind_b2WheelJoint__SetUserData_p1:jX,_emscripten_bind_b2WeldJoint__b2WeldJoint_p1:lR,_emscripten_bind_b2WeldJoint__IsActive_p0:lf,_emscripten_bind_b2Draw__DrawSolidPolygon_p3:kF,_emscripten_bind_b2ContactManager____destroy___p0:g9,_emscripten_bind_b2GearJoint__GetAnchorB_p0:lu,_emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0:rp,_emscripten_bind_b2PolygonShape__get_m_vertexCount_p0:m9,_emscripten_bind_b2RevoluteJoint__GetReferenceAngle_p0:l0,_emscripten_bind_b2DistanceJointDef__Initialize_p4:u0,_emscripten_bind_b2World__IsLocked_p0:iN,_emscripten_bind_b2ContactEdge__get_prev_p0:uH,_emscripten_bind_b2Joint__GetReactionForce_p1:kN,_emscripten_bind_b2WeldJointDef__get_collideConnected_p1:tt,_emscripten_bind_b2Draw__AppendFlags_p1:j5,_emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0:rl,_emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1:rk,_emscripten_bind_b2PrismaticJoint__EnableMotor_p1:ja,_emscripten_bind_b2PrismaticJoint__GetReactionForce_p1:jq,_emscripten_bind_b2Shape__RayCast_p4:ob,_emscripten_bind_b2GearJoint__Dump_p0:ls,_emscripten_bind_b2Body__DestroyFixture_p1:o2,_emscripten_bind_b2Body__SetActive_p1:of,_emscripten_bind_b2PrismaticJoint__GetCollideConnected_p0:i8,_emscripten_bind_b2ContactListener____destroy___p0:mw,_emscripten_bind_b2MouseJoint__SetDampingRatio_p1:hH,_emscripten_bind_b2Body__ApplyTorque_p1:ok,_emscripten_bind_b2DistanceProxy__GetVertexCount_p0:qr,_emscripten_bind_b2PulleyJoint__GetRatio_p0:hT,_emscripten_bind_b2FixtureDef__set_density_p1:qA,_emscripten_bind_b2RopeJoint__b2RopeJoint_p1:oi,_emscripten_bind_b2FixtureDef__get_filter_p0:qE,_emscripten_bind_b2WheelJoint__GetUserData_p0:jL,_emscripten_bind_b2GearJointDef__set_collideConnected_p1:uD,_emscripten_bind_b2GearJoint____destroy___p0:lt,_emscripten_bind_b2Body__GetAngularVelocity_p0:nC,_emscripten_bind_b2DistanceJointDef__get_bodyA_p1:tO,_emscripten_bind_b2RevoluteJoint__EnableMotor_p1:l$,_emscripten_bind_b2Body__SetType_p1:oY,_emscripten_bind_b2PolygonShape__set_m_vertexCount_p1:m6,_emscripten_bind_b2RopeJointDef__set_collideConnected_p1:uY,_emscripten_bind_b2FrictionJoint__GetBodyB_p0:oM,_emscripten_bind_b2RevoluteJoint__IsLimitEnabled_p0:lr,_emscripten_bind_b2FrictionJointDef__set_maxForce_p1:pw,_emscripten_bind_b2Timer__GetMilliseconds_p0:lU,_emscripten_bind_b2WheelJointDef__get_enableMotor_p0:rM,_emscripten_bind_b2RevoluteJointDef__get_bodyB_p1:sc,_emscripten_bind_b2PolygonShape__GetChildCount_p0:nX,_emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0:m_,_emscripten_bind_b2ContactEdge__set_other_p1:uL,_emscripten_bind_b2Body__GetMassData_p1:nN,_emscripten_bind_b2Joint__GetNext_p0:j9,_emscripten_bind_b2WeldJoint__GetReactionForce_p1:lI,_emscripten_bind_b2RevoluteJoint__GetAnchorA_p0:lM,_emscripten_bind_b2Filter__set_groupIndex_p1:pl,_emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1:rm,_emscripten_bind_b2FrictionJoint__SetMaxForce_p1:ph,_malloc:vi,_emscripten_bind_b2MouseJoint__b2MouseJoint_p1:h3,_emscripten_bind_b2MouseJoint__Dump_p0:h6,_emscripten_bind_b2FixtureDef__set_restitution_p1:qB,_emscripten_bind_b2Shape__GetChildCount_p0:od,_emscripten_bind_b2Body__GetJointList_p0:nH,_emscripten_bind_b2Timer____destroy___p0:mv,_emscripten_bind_b2Vec2__IsValid_p0:p8,_emscripten_bind_b2Contact__ResetRestitution_p0:ns,_emscripten_bind_b2RevoluteJointDef__get_collideConnected_p1:sa,_emscripten_bind_b2DynamicTree__MoveProxy_p3:lD,_emscripten_bind_b2Transform__b2Transform_p0:t6,_emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0:sq,_emscripten_bind_b2RevoluteJointDef__get_bodyA_p1:sb,_emscripten_bind_b2WheelJointDef____destroy___p0:sF,_emscripten_bind_b2MouseJoint__GetBodyA_p0:ht,_emscripten_bind_b2GearJoint__GetType_p0:kS,_emscripten_bind_b2Body__SetMassData_p1:o$,_emscripten_bind_b2MouseJoint__IsActive_p0:hI,_emscripten_bind_b2Contact__GetChildIndexA_p0:no,_emscripten_bind_b2Fixture__GetShape_p0:gY,_emscripten_bind_b2DistanceProxy__set_m_radius_p1:qn,_emscripten_bind_b2DistanceJointDef__get_bodyB_p1:tP,_emscripten_bind_b2RevoluteJoint__GetLowerLimit_p0:lj,_emscripten_bind_b2World__DestroyJoint_p1:jg,_emscripten_bind_b2PulleyJointDef__set_ratio_p1:si,_emscripten_bind_b2DynamicTree__b2DynamicTree_p0:lA,_emscripten_bind_b2RopeJoint__GetType_p0:mj,_emscripten_bind_b2Body__GetLocalPoint_p1:nF,_emscripten_bind_b2World__GetBodyCount_p0:iB,_emscripten_bind_b2CircleShape__GetType_p0:jC,_emscripten_bind_b2DistanceProxy__get_m_radius_p0:qm,_emscripten_bind_b2World__ClearForces_p0:iI,_emscripten_bind_b2DynamicTree____destroy___p0:lz,_emscripten_bind_b2Contact__GetWorldManifold_p1:n6,_emscripten_bind_b2DynamicTree__GetUserData_p1:lP,_emscripten_bind_b2JointDef____destroy___p0:t2,_emscripten_bind_b2DistanceProxy__GetVertex_p1:q$,_emscripten_bind_b2Draw__GetFlags_p0:j8,_emscripten_bind_b2PolygonShape__Set_p2:nR,_emscripten_bind_b2DistanceJoint____destroy___p0:hf,_emscripten_bind_b2DestructionListener__SayGoodbye_p1:pd,_emscripten_bind_b2BodyDef____destroy___p0:qM,_emscripten_bind_b2EdgeShape____destroy___p0:n_,_emscripten_bind_b2GearJointDef__get_ratio_p0:uE,_emscripten_bind_b2BlockAllocator__Clear_p0:mP,_emscripten_bind_b2RopeJoint__GetAnchorB_p0:mV,_emscripten_bind_b2BodyDef__set_type_p1:pS,_emscripten_bind_b2WheelJoint__EnableMotor_p1:j0,_emscripten_bind_b2FrictionJoint__GetBodyA_p0:oQ,_emscripten_bind_b2RopeJoint__GetBodyA_p0:mg,_emscripten_bind_b2WheelJointDef__get_bodyA_p1:rO,_emscripten_bind_b2RopeJoint__GetAnchorA_p0:mS,_emscripten_bind_b2GearJointDef__get_collideConnected_p1:uB,_emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0:r6,_emscripten_bind_b2WeldJoint__GetLocalAnchorB_p0:k8,_emscripten_bind_b2PolygonShape__set_m_radius_p1:m1,_emscripten_bind_b2Vec2__SetZero_p0:qc,_emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0:rJ,_emscripten_bind_b2ChainShape__CreateLoop_p2:mY,_emscripten_bind_b2RevoluteJoint__GetNext_p0:lk,_emscripten_bind_b2World__DestroyBody_p1:jj,_emscripten_bind_b2World__SetSubStepping_p1:is,_emscripten_bind_b2PulleyJoint__SetUserData_p1:hQ,_emscripten_bind_b2WheelJoint__GetMotorSpeed_p0:jT,_emscripten_bind_b2RopeJoint__GetLimitState_p0:m$,_emscripten_bind_b2PrismaticJointDef____destroy___p0:sy,_emscripten_bind_b2PulleyJointDef__set_collideConnected_p1:sM,_emscripten_bind_b2WheelJoint__GetNext_p0:jO,_emscripten_bind_b2World__SetContactFilter_p1:iU,_emscripten_bind_b2BroadPhase__GetFatAABB_p1:io,_emscripten_bind_b2FrictionJoint__SetMaxTorque_p1:pg,_emscripten_bind_b2ContactManager__set_m_contactCount_p1:gz,_emscripten_bind_b2Body__GetLinearVelocity_p0:nI,_emscripten_bind_b2ContactManager__get_m_allocator_p0:gF,_emscripten_bind_b2AABB____destroy___p0:ub,_emscripten_bind_b2PulleyJoint__GetCollideConnected_p0:hP,_emscripten_bind_b2Joint__GetUserData_p0:kc,_emscripten_bind_b2Rot__GetXAxis_p0:rs,_emscripten_bind_b2ContactManager__get_m_contactCount_p0:gw,_emscripten_bind_b2DistanceJoint__Dump_p0:hg,_emscripten_bind_b2PolygonShape__GetVertexCount_p0:m7,_emscripten_bind_b2StackAllocator__Free_p1:pb,_emscripten_bind_b2CircleShape__GetSupportVertex_p1:jG,_emscripten_bind_b2DistanceProxy__GetSupportVertex_p1:qp,_emscripten_bind_b2DistanceJointDef__set_bodyA_p1:tS,_emscripten_bind_b2JointDef__set_userData_p1:sO,_emscripten_bind_b2GearJoint__GetBodyB_p0:kU,_emscripten_bind_b2Vec3__get_z_p0:qh,_emscripten_bind_b2RopeJoint__GetUserData_p0:mi,_emscripten_bind_b2GearJoint__GetUserData_p0:kT,_emscripten_bind_b2FixtureDef__get_restitution_p0:qC,_emscripten_bind_b2WheelJoint__GetAnchorB_p0:ku,_emscripten_bind_b2FixtureDef__b2FixtureDef_p0:qZ,_emscripten_bind_b2WheelJointDef__get_motorSpeed_p0:ry,_emscripten_bind_b2FrictionJoint__b2FrictionJoint_p1:pi,_emscripten_bind_b2Body__GetAngularDamping_p0:oo,_emscripten_bind_b2ChainShape__GetChildCount_p0:mJ,_emscripten_bind_b2ChainShape__SetNextVertex_p1:mc,_emscripten_bind_b2Joint__GetBodyA_p0:ka,_emscripten_bind_b2Fixture__IsSensor_p0:hq,_emscripten_bind_b2Filter__set_maskBits_p1:oV,_emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1:sj,_emscripten_bind_b2ContactListener__PreSolve_p2:mA,_emscripten_bind_b2WheelJointDef__get_localAnchorB_p0:rK,_emscripten_bind_b2WheelJointDef__set_bodyB_p1:rE,_emscripten_bind_b2BroadPhase__MoveProxy_p3:im,_emscripten_bind_b2BodyDef__get_active_p0:p$,_emscripten_bind_b2CircleShape__GetVertexCount_p0:jv,_emscripten_bind_b2Timer__Reset_p0:lT,_emscripten_bind_b2QueryCallback____destroy___p0:mM,_emscripten_bind_b2World__b2World_p1:jh,_emscripten_bind_b2Vec3__Set_p3:qg,_emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0:q2,_emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1:r7,_emscripten_bind_b2StackAllocator____destroy___p0:pj,_emscripten_bind_b2ContactEdge__get_other_p0:uI,_emscripten_bind_b2Fixture__GetType_p0:hr,_emscripten_bind_b2ContactListener__PostSolve_p2:mB,_emscripten_bind_b2WeldJointDef__set_collideConnected_p1:tv,_emscripten_bind_b2Contact__SetRestitution_p1:nq,_emscripten_bind_b2Body__GetInertia_p0:oE,_emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0:qK,_emscripten_bind_b2PolygonShape__get_m_centroid_p0:na,_emscripten_bind_b2PrismaticJoint__IsMotorEnabled_p0:i5,_emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0:pv,_emscripten_bind_b2Draw__SetFlags_p1:j7,_emscripten_bind_b2WeldJoint__GetUserData_p0:k4,_emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0:uf,_emscripten_bind_b2FrictionJointDef__set_collideConnected_p1:pA,_emscripten_bind_b2World__SetAllowSleeping_p1:iK,_emscripten_bind_b2BodyDef__set_gravityScale_p1:pT,_emscripten_bind_b2Contact__IsTouching_p0:nj,_emscripten_bind_b2Transform__set_q_p1:sY,_emscripten_bind_b2FrictionJoint__GetAnchorB_p0:o8,_emscripten_bind_b2World__RayCast_p3:jl,_emscripten_bind_b2WeldJointDef__get_bodyA_p1:tj,_emscripten_bind_b2WheelJoint__GetMotorTorque_p1:jU,_emscripten_bind_b2Draw__b2Draw_p0:kI,_emscripten_bind_b2ChainShape____destroy___p0:mC,_emscripten_bind_b2ChainShape__get_m_radius_p0:l7,_emscripten_bind_b2RopeJoint__IsActive_p0:m0,_emscripten_bind_b2EdgeShape__set_m_radius_p1:nc,_emscripten_bind_b2DistanceJointDef__get_length_p0:tU,_emscripten_bind_b2DistanceJoint__SetUserData_p1:gK,_emscripten_bind_b2ContactManager__set_m_contactListener_p1:gC,_emscripten_bind_b2MouseJointDef__get_maxForce_p0:tE,_emscripten_bind_b2WheelJoint____destroy___p0:ky,_emscripten_bind_b2PulleyJoint__GetBodyA_p0:hJ,_emscripten_bind_b2MouseJoint__SetMaxForce_p1:hx,_emscripten_bind_b2World__GetGravity_p0:iR,_emscripten_bind_b2WheelJointDef__set_bodyA_p1:rD,_emscripten_bind_b2AABB__b2AABB_p0:uc,_emscripten_bind_b2DistanceProxy____destroy___p0:qX,_emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1:rW,_emscripten_bind_b2World__GetProfile_p0:iv,_emscripten_bind_b2PulleyJointDef__get_bodyA_p1:sv,_emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1:sk,_emscripten_bind_b2PolygonShape__Clone_p1:nT,_emscripten_bind_b2PrismaticJoint__GetUserData_p0:iX,_emscripten_bind_b2PrismaticJoint__IsLimitEnabled_p0:jz,_emscripten_bind_b2PulleyJoint__GetAnchorA_p0:h9,_emscripten_bind_b2Fixture__Refilter_p0:h$,_emscripten_bind_b2Vec3__SetZero_p0:qj,_emscripten_bind_b2ContactListener__EndContact_p1:my,_emscripten_bind_b2Vec2__Normalize_p0:qN,_emscripten_bind_b2Shape__ComputeMass_p2:n9,_emscripten_bind_b2FrictionJoint__GetMaxForce_p0:oI,_emscripten_bind_b2BodyDef__get_type_p0:pF,_emscripten_bind_b2FixtureDef__get_userData_p0:qH,_emscripten_bind_b2MouseJointDef__get_collideConnected_p1:tJ,_emscripten_bind_b2Contact__ResetFriction_p0:n7,_emscripten_bind_b2WeldJointDef__Initialize_p3:tx,_emscripten_bind_b2DistanceJoint__GetCollideConnected_p0:gR,_emscripten_bind_b2Rot__Set_p1:sA,_emscripten_bind_b2ChainShape__RayCast_p4:mI,_emscripten_bind_b2RevoluteJoint__GetReactionForce_p1:mp,_emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0:sx,_emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0:px,_emscripten_bind_b2MouseJoint__GetMaxForce_p0:hA,_emscripten_bind_b2RopeJoint__Dump_p0:mU,_emscripten_bind_b2WheelJointDef__set_enableMotor_p1:rQ,_emscripten_bind_b2ContactManager__get_m_contactList_p0:gE,_emscripten_bind_b2PolygonShape__ComputeAABB_p3:nW,_emscripten_bind_b2RopeJointDef__set_bodyB_p1:uT,_emscripten_bind_b2BodyDef__set_fixedRotation_p1:pM,_emscripten_bind_b2WheelJoint__GetAnchorA_p0:kv,_emscripten_bind_b2GearJoint__GetBodyA_p0:kX,_emscripten_bind_b2CircleShape__b2CircleShape_p0:ks,_emscripten_bind_b2EdgeShape__GetChildCount_p0:n3,_emscripten_bind_b2BodyDef__set_active_p1:pW,_emscripten_bind_b2FrictionJointDef__get_bodyA_p1:pp,_emscripten_bind_b2PulleyJoint__GetReactionTorque_p1:ia,_emscripten_bind_b2DistanceJoint__b2DistanceJoint_p1:hk,_emscripten_bind_b2Vec2____destroy___p0:qR,_emscripten_bind_b2ChainShape__get_m_vertices_p0:l8,_emscripten_bind_b2BodyDef__b2BodyDef_p0:qL,_emscripten_bind_b2RevoluteJoint__Dump_p0:mr,_emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0:sG,_emscripten_bind_b2World__SetDebugDraw_p1:iP,_emscripten_bind_b2MouseJoint____destroy___p0:h5,_emscripten_bind_b2RevoluteJoint__IsMotorEnabled_p0:lW,_emscripten_bind_b2MouseJointDef__set_frequencyHz_p1:tL,_emscripten_bind_b2DestructionListener__b2DestructionListener_p0:pe,_emscripten_bind_b2WheelJointDef__get_frequencyHz_p0:rG,_emscripten_bind_b2Filter__b2Filter_p0:qI,_emscripten_bind_b2World____destroy___p0:jm,_emscripten_bind_b2Body__SetBullet_p1:oB,_emscripten_bind_b2Body__GetAngle_p0:nw,_emscripten_bind_b2PrismaticJointDef__set_bodyA_p1:q8,_emscripten_bind_b2MouseJoint__GetTarget_p0:hB,_emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0:tW,_emscripten_bind_b2Contact__GetNext_p0:nf,_emscripten_bind_b2World__DrawDebugData_p0:jf,_emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1:sd,_emscripten_bind_b2Vec2__LengthSquared_p0:qa,_emscripten_bind_b2WheelJointDef__get_localAnchorA_p0:rI,_emscripten_bind_b2RevoluteJoint____destroy___p0:mq,_emscripten_bind_b2PulleyJointDef__get_lengthB_p0:sK,_emscripten_bind_b2WeldJoint__GetReferenceAngle_p0:lc,_strlen:vs,_emscripten_bind_b2FixtureDef__set_filter_p1:q_,_emscripten_bind_b2ChainShape__CreateChain_p2:mX,_emscripten_bind_b2Body__GetLocalVector_p1:oz,_emscripten_bind_b2Fixture__SetUserData_p1:ho,_emscripten_bind_b2RevoluteJoint__GetLocalAnchorB_p0:ln,_emscripten_bind_b2FrictionJointDef__set_maxTorque_p1:pz,_emscripten_bind_b2ChainShape__ComputeAABB_p3:mH,_emscripten_bind_b2RopeJoint__GetReactionForce_p1:nP,_emscripten_bind_b2CircleShape__GetSupport_p1:jw,_emscripten_bind_b2World__GetContinuousPhysics_p0:iD,_emscripten_bind_b2FrictionJointDef__get_maxForce_p0:pu,_emscripten_bind_b2Draw____destroy___p0:kB,_emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1:rT,_emscripten_bind_b2MouseJoint__GetCollideConnected_p0:hE,_emscripten_bind_b2MouseJoint__GetReactionForce_p1:h4,_emscripten_bind_b2JointDef__set_type_p1:sS,_emscripten_bind_b2Color__Set_p3:s0,_emscripten_bind_b2WeldJoint__GetType_p0:ld,_emscripten_bind_b2Joint__GetBodyB_p0:kb,_emscripten_bind_b2ContactManager__set_m_broadPhase_p1:hb,_emscripten_bind_b2JointDef__get_type_p0:sU,_emscripten_bind_b2BodyDef__set_position_p1:pH,_emscripten_bind_b2Vec2__Length_p0:qQ,_emscripten_bind_b2MouseJoint__GetUserData_p0:hw,_emscripten_bind_b2JointDef__get_collideConnected_p0:sT,_emscripten_bind_b2BroadPhase__GetTreeQuality_p0:hU,_emscripten_bind_b2WheelJointDef__get_dampingRatio_p0:rN,_emscripten_bind_b2RopeJoint__GetBodyB_p0:mk,_emscripten_bind_b2Joint__GetCollideConnected_p0:kf,_emscripten_bind_b2FrictionJoint__GetReactionTorque_p1:o5,_emscripten_bind_b2PulleyJointDef__get_bodyB_p1:sw,_emscripten_bind_b2ContactManager__set_m_contactFilter_p1:gx,_emscripten_bind_b2FrictionJoint__GetAnchorA_p0:o4,_emscripten_bind_b2EdgeShape__ComputeAABB_p3:n2,_emscripten_bind_b2BodyDef__set_awake_p1:p2,_emscripten_bind_b2FrictionJointDef__get_bodyB_p1:pq,_emscripten_bind_b2PrismaticJoint__SetMotorSpeed_p1:i0,_emscripten_bind_b2PolygonShape__RayCast_p4:nU,_emscripten_bind_b2CircleShape__ComputeMass_p2:km,_emscripten_bind_b2MouseJoint__GetFrequency_p0:hC,_emscripten_bind_b2Contact__IsEnabled_p0:nk,_emscripten_bind_b2PrismaticJointDef__set_bodyB_p1:q9,_emscripten_bind_b2FixtureDef__set_userData_p1:qw,_emscripten_bind_b2Fixture__SetSensor_p1:hm,_emscripten_bind_b2Shape__GetType_p0:nv,_emscripten_bind_b2WeldJointDef__get_localAnchorB_p0:ts,_emscripten_bind_b2ContactManager__Destroy_p1:ha,_emscripten_bind_b2PrismaticJoint__GetLocalAnchorA_p0:i$,_emscripten_bind_b2WheelJointDef__set_motorSpeed_p1:rB,_emscripten_bind_b2Contact__Evaluate_p3:n8,_emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1:sh,_emscripten_bind_b2RevoluteJoint__GetType_p0:l2,_emscripten_bind_b2AABB__Combine_p1:te,_emscripten_bind_b2GearJoint__GetReactionTorque_p1:kQ,_emscripten_bind_b2AABB__Combine_p2:tf,_emscripten_bind_b2PulleyJointDef__get_lengthA_p0:sL,_emscripten_bind_b2Shape__get_m_radius_p0:nt,_emscripten_bind_b2ChainShape__set_m_count_p1:md,_emscripten_bind_b2RopeJointDef__set_bodyA_p1:uS,_emscripten_bind_b2DynamicTree__GetFatAABB_p1:lO,_emscripten_bind_b2DistanceJoint__GetFrequency_p0:gO,_emscripten_bind_b2PrismaticJoint__SetLimits_p2:kR,_emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0:t1,_emscripten_bind_b2Color__get_g_p0:s4,_emscripten_bind_b2Fixture__GetBody_p0:g_,_emscripten_bind_b2FrictionJointDef__get_collideConnected_p1:py,_emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1:rz,_emscripten_bind_b2GearJointDef__get_bodyB_p1:uv,_emscripten_bind_b2AABB__set_upperBound_p1:s7,_emscripten_bind_b2Contact__GetFixtureA_p0:nn,_emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1:rV,_emscripten_bind_b2WheelJointDef__set_localAnchorA_p1:rw,_emscripten_bind_b2DistanceJointDef__set_bodyB_p1:tT,_emscripten_bind_b2Transform__SetIdentity_p0:s$,_emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1:po,_emscripten_bind_b2Body__SetTransform_p2:og,_emscripten_bind_b2DistanceJoint__GetReactionTorque_p1:hh,_emscripten_bind_b2StackAllocator__b2StackAllocator_p0:pa,_emscripten_bind_b2MouseJointDef__set_maxForce_p1:tG,_emscripten_bind_b2RevoluteJoint__GetMotorTorque_p1:lq,_emscripten_bind_b2Vec2__set_y_p1:p7,_emscripten_bind_b2CircleShape__Clone_p1:kn,_emscripten_bind_b2Rot__GetAngle_p0:sB,_emscripten_bind_b2Color____destroy___p0:t8,_emscripten_bind_b2WeldJoint__GetBodyA_p0:k1,_emscripten_bind_b2Fixture__GetRestitution_p0:gW,_emscripten_bind_b2DistanceJointDef__set_length_p1:t$,_emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0:q7,_emscripten_bind_b2Color__b2Color_p3:ua,_emscripten_bind_b2Body__ApplyForceToCenter_p1:oj,_emscripten_bind_b2PrismaticJoint__SetUserData_p1:i6,_emscripten_bind_b2Color__get_r_p0:s2,_emscripten_bind_b2RevoluteJoint__b2RevoluteJoint_p1:lS,_emscripten_bind_b2RevoluteJoint__GetCollideConnected_p0:lZ,_emscripten_bind_b2PrismaticJoint__IsActive_p0:jB,_emscripten_bind_b2Body__SetFixedRotation_p1:o3,_emscripten_bind_b2RopeJointDef____destroy___p0:u5,_emscripten_bind_b2PrismaticJointDef__get_bodyB_p1:rj,_emscripten_bind_b2Shape__set_m_radius_p1:nu,_emscripten_bind_b2WheelJoint__GetBodyB_p0:jK,_emscripten_bind_b2JointDef__get_bodyA_p0:sN,_emscripten_bind_b2World__GetContactCount_p0:iS,_emscripten_bind_b2Fixture__b2Fixture_p0:hj,_emscripten_bind_b2StackAllocator__Allocate_p1:pk,_emscripten_bind_b2Body__SetGravityScale_p1:nA,_emscripten_bind_b2BroadPhase__CreateProxy_p2:il,_emscripten_bind_b2WheelJoint__GetLocalAnchorA_p0:jQ,_emscripten_bind_b2FrictionJointDef__set_bodyB_p1:pt,_emscripten_bind_b2WheelJoint__SetSpringFrequencyHz_p1:j3,_emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0:ug,_emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1:q1,_emscripten_bind_b2Filter____destroy___p0:pf,_emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1:rn,_emscripten_bind_b2Fixture__GetUserData_p0:g1,_emscripten_bind_b2AABB__get_upperBound_p0:tc,_emscripten_bind_b2PulleyJoint__Dump_p0:ib,_emscripten_bind_b2RopeJointDef__get_localAnchorA_p0:uU,_emscripten_bind_b2CircleShape__get_m_radius_p0:jE,_emscripten_bind_b2DistanceJoint__GetLength_p0:gP,_emscripten_bind_b2BodyDef__set_angularVelocity_p1:pP,_emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0:r$,_emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1:sg,_emscripten_bind_b2RevoluteJoint__SetMotorSpeed_p1:lm,_emscripten_bind_b2WeldJoint__GetReactionTorque_p1:lL,_emscripten_bind_b2GearJoint__SetUserData_p1:kW,_emscripten_bind_b2PrismaticJoint__GetAnchorB_p0:kk,_emscripten_bind_b2MouseJointDef__set_target_p1:tF,_emscripten_bind_b2WeldJoint__GetBodyB_p0:k2,_emscripten_bind_b2PolygonShape__TestPoint_p2:nY,_emscripten_bind_b2WheelJointDef__set_localAnchorB_p1:rx,_emscripten_bind_b2WheelJoint__GetReactionTorque_p1:kA,_emscripten_bind_b2FrictionJointDef__set_bodyA_p1:ps,_emscripten_bind_b2Color__b2Color_p0:t9,_emscripten_bind_b2BroadPhase__TestOverlap_p2:ir,_emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1:q0,_emscripten_bind_b2RevoluteJoint__GetReactionTorque_p1:ms,_emscripten_bind_b2Joint__GetAnchorB_p0:kM,_emscripten_bind_b2CircleShape__set_m_radius_p1:jD,_memcpy:vq,_emscripten_bind_b2World__GetContactManager_p0:ix,_emscripten_bind_b2RevoluteJoint__SetUserData_p1:lX,_emscripten_bind_b2Contact__GetFixtureB_p0:nl,_emscripten_bind_b2Rot__GetYAxis_p0:rr,_emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1:rY,_emscripten_bind_b2Shape__Clone_p1:oa,_emscripten_bind_b2PulleyJoint__GetType_p0:hK,_emscripten_bind_b2AABB__set_lowerBound_p1:tg,_emscripten_bind_b2RopeJoint__GetCollideConnected_p0:mh,_emscripten_bind_b2DistanceJoint__IsActive_p0:gV,_emscripten_bind_b2BodyDef__set_linearDamping_p1:p0,_emscripten_bind_b2BroadPhase__GetTreeBalance_p0:iq,_emscripten_bind_b2AABB__GetExtents_p0:ta,_emscripten_bind_b2CircleShape____destroy___p0:kl,_emscripten_bind_b2WeldJoint__SetFrequency_p1:k3,_emscripten_bind_b2GearJointDef__set_ratio_p1:uA,_emscripten_bind_b2FixtureDef__get_density_p0:qy,_emscripten_bind_b2AABB__GetCenter_p0:tb,_emscripten_bind_b2Draw__ClearFlags_p1:j6,_emscripten_bind_b2WeldJointDef__get_localAnchorA_p0:tq,_emscripten_bind_b2PolygonShape__GetType_p0:m8,_emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1:tR,_emscripten_bind_b2BroadPhase__GetUserData_p1:ip,_emscripten_bind_b2Rot__get_c_p0:rv,_emscripten_bind_b2World__GetAutoClearForces_p0:iC,_emscripten_bind_b2World__GetTreeHeight_p0:iu,_emscripten_bind_b2AABB__IsValid_p0:s8,_emscripten_bind_b2RevoluteJoint__GetAnchorB_p0:mt,_emscripten_bind_b2RopeJointDef__get_bodyB_p1:uQ,_emscripten_bind_b2World__CreateJoint_p1:jk,_emscripten_bind_b2WheelJoint__GetDefinition_p1:kt,_emscripten_bind_b2Color__set_b_p1:s3,_emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0:q4,_emscripten_bind_b2Body__GetLocalCenter_p0:or,_emscripten_bind_b2WheelJoint__GetLocalAxisA_p0:jM,_emscripten_bind_b2Contact__GetFriction_p0:ni,_emscripten_bind_b2Body__SetAngularVelocity_p1:nM,_emscripten_bind_b2PrismaticJoint__GetJointSpeed_p0:i9,_emscripten_bind_b2CircleShape__TestPoint_p2:kr,_emscripten_bind_b2Body__SetAwake_p1:o0,_emscripten_bind_b2Filter__set_categoryBits_p1:oW,_emscripten_bind_b2ChainShape__ComputeMass_p2:mD,_emscripten_bind_b2PrismaticJointDef__get_collideConnected_p1:rh,_emscripten_bind_b2World__CreateBody_p1:ju,_emscripten_bind_b2JointDef__get_bodyB_p0:sR,_emscripten_bind_b2ChainShape__get_m_count_p0:l9,_emscripten_bind_b2Joint__GetType_p0:kd,_emscripten_bind_b2WheelJoint__GetCollideConnected_p0:j_,_emscripten_bind_b2WheelJointDef__set_localAxisA_p1:rS,_emscripten_bind_b2CircleShape__GetVertex_p1:jF,_emscripten_bind_b2WeldJoint__GetNext_p0:k6,_emscripten_bind_b2WeldJoint__GetCollideConnected_p0:lb,_emscripten_bind_b2World__SetDestructionListener_p1:iG,_emscripten_bind_b2WheelJointDef__get_localAxisA_p0:rC,_emscripten_bind_b2Joint__GetAnchorA_p0:kK,_emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0:qW,_emscripten_bind_b2WheelJoint__IsActive_p0:j4,_emscripten_bind_b2Transform____destroy___p0:t4,_emscripten_bind_b2PolygonShape__ComputeMass_p2:nS,_emscripten_bind_b2RopeJointDef__get_bodyA_p1:uP,_emscripten_bind_b2WheelJoint__b2WheelJoint_p1:kw,_emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1:ot,_emscripten_bind_b2Draw__DrawTransform_p1:kC,_emscripten_bind_b2DistanceJoint__GetType_p0:gS,_emscripten_bind_b2MouseJointDef__set_bodyB_p1:tD,_emscripten_bind_b2Fixture__GetFriction_p0:g0,_emscripten_bind_b2Body__GetWorld_p0:oy,_emscripten_bind_b2PolygonShape__b2PolygonShape_p0:nZ,_emscripten_bind_b2WeldJointDef__set_frequencyHz_p1:tw,_emscripten_bind_b2RevoluteJoint__GetJointAngle_p0:lo,_emscripten_bind_b2Body__ResetMassData_p0:oh,_emscripten_bind_b2RevoluteJoint__IsActive_p0:l4,_emscripten_bind_b2FrictionJoint__SetUserData_p1:oP,_emscripten_bind_b2PulleyJoint__GetReactionForce_p1:ig,_emscripten_bind_b2Timer__b2Timer_p0:mu,_emscripten_bind_b2World__SetContinuousPhysics_p1:iz,_emscripten_bind_b2ContactManager__FindNewContacts_p0:g8,_emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0:tV,_emscripten_bind_b2DynamicTree__GetMaxBalance_p0:lQ,_emscripten_bind_b2PolygonShape__GetVertex_p1:m3,_emscripten_bind_b2WeldJointDef__get_frequencyHz_p0:tm,_emscripten_bind_b2ContactListener__BeginContact_p1:mz,_emscripten_bind_b2RevoluteJointDef__set_collideConnected_p1:sf,_emscripten_bind_b2DistanceJoint__GetAnchorA_p0:hd,_emscripten_bind_b2PrismaticJoint__GetLocalAxisA_p0:iY,_emscripten_bind_b2ChainShape__Clone_p1:mE,_emscripten_bind_b2GearJointDef__b2GearJointDef_p0:u2,_emscripten_bind_b2RevoluteJoint__GetBodyA_p0:lg,_emscripten_bind_b2Body__ApplyForce_p2:nE,_emscripten_bind_b2MouseJoint__GetReactionTorque_p1:h7,_emscripten_bind_b2Vec2__get_y_p0:p6,_emscripten_bind_b2ContactEdge__get_contact_p0:uN,_emscripten_bind_b2GearJointDef__set_bodyB_p1:uy,_emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0:rX,_emscripten_bind_b2RopeJoint____destroy___p0:mR,_emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0:sE,_emscripten_bind_b2DistanceJoint__SetFrequency_p1:gI,_emscripten_bind_b2PulleyJointDef__set_lengthA_p1:su,_emscripten_bind_b2FixtureDef__get_friction_p0:qF,_emscripten_bind_b2ContactEdge__get_next_p0:uK,_emscripten_bind_b2RevoluteJoint__GetBodyB_p0:lh,_emscripten_bind_b2RevoluteJoint__GetUserData_p0:li,_emscripten_bind_b2Body__GetType_p0:oC,_emscripten_bind_b2World__Step_p3:ji,_emscripten_bind_b2Vec2__set_x_p1:p3,_emscripten_bind_b2ContactManager__b2ContactManager_p0:g5,_emscripten_bind_b2RopeJoint__GetNext_p0:me,_emscripten_bind_b2WeldJoint__SetDampingRatio_p1:le,_emscripten_bind_b2World__GetTreeQuality_p0:it,_emscripten_bind_b2WeldJoint__GetAnchorB_p0:lG,_emscripten_bind_b2Contact__GetRestitution_p0:nh,_emscripten_bind_b2MouseJointDef____destroy___p0:uh,_emscripten_bind_b2Body__GetTransform_p0:om,_emscripten_bind_b2PrismaticJoint__b2PrismaticJoint_p1:jp,_emscripten_bind_b2RopeJointDef__get_maxLength_p0:uV,_emscripten_bind_b2DistanceJoint__GetAnchorB_p0:hc,_emscripten_bind_b2ChainShape__set_m_vertices_p1:mb,_emscripten_bind_b2EdgeShape__TestPoint_p2:n4,_emscripten_bind_b2FrictionJoint__GetMaxTorque_p0:oS,_emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0:u6,_emscripten_bind_b2ContactManager__AddPair_p2:g6,_emscripten_bind_b2Color__set_g_p1:s6,_emscripten_bind_b2WheelJoint__IsMotorEnabled_p0:jV,_emscripten_bind_b2QueryCallback__b2QueryCallback_p0:mN,_emscripten_bind_b2WheelJointDef__get_collideConnected_p1:rL,_emscripten_bind_b2FrictionJoint__Dump_p0:o6,_emscripten_bind_b2ChainShape__SetPrevVertex_p1:ma,_emscripten_bind_b2AABB__GetPerimeter_p0:td,_emscripten_bind_b2DistanceProxy__set_m_count_p1:qu,_emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1:nO,_emscripten_bind_b2MouseJointDef__set_bodyA_p1:tC,_emscripten_bind_b2DynamicTree__GetAreaRatio_p0:k0,_emscripten_bind_b2World__QueryAABB_p2:je,_emscripten_bind_b2RevoluteJoint__GetUpperLimit_p0:l3,_emscripten_bind_b2World__SetGravity_p1:iA,_emscripten_bind_b2PulleyJointDef__Initialize_p7:sI,_emscripten_bind_b2Color__get_b_p0:s5,_emscripten_bind_b2DistanceJoint__GetBodyA_p0:gG,_emscripten_bind_b2BroadPhase__DestroyProxy_p1:jd,_emscripten_bind_b2PulleyJoint____destroy___p0:h8,_emscripten_bind_b2BroadPhase__GetProxyCount_p0:hW,_emscripten_bind_b2DistanceJoint__GetLocalAnchorB_p0:gN,_emscripten_bind_b2ChainShape__GetChildEdge_p2:mF,_emscripten_bind_b2EdgeShape__b2EdgeShape_p0:n5,_emscripten_bind_b2ContactEdge__set_contact_p1:uG,_emscripten_bind_b2WheelJoint__SetMotorSpeed_p1:jR,_emscripten_bind_b2ChainShape__GetType_p0:l5,_emscripten_bind_b2Fixture__SetFilterData_p1:hi,_emscripten_bind_b2Body__ApplyAngularImpulse_p1:oG,_emscripten_bind_b2RevoluteJoint__SetLimits_p2:mW,_emscripten_bind_b2ChainShape__TestPoint_p2:mK,_emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0:r1,_emscripten_bind_b2CircleShape__get_m_p_p0:jI,_emscripten_bind_b2BodyDef__get_awake_p0:pE,_emscripten_bind_b2MouseJoint__GetAnchorB_p0:h1,_emscripten_bind_b2Body__CreateFixture_p1:oZ,_emscripten_bind_b2Body__CreateFixture_p2:o_,_emscripten_bind_b2GearJointDef____destroy___p0:u1,_emscripten_bind_b2Fixture__GetDensity_p0:hs,_emscripten_bind_b2PrismaticJoint__GetJointTranslation_p0:jx,_emscripten_bind_b2WeldJoint__GetDampingRatio_p0:la,_emscripten_bind_b2FrictionJoint__GetReactionForce_p1:o9,_emscripten_bind_b2BodyDef__set_userData_p1:pQ,_emscripten_bind_b2World__SetContactListener_p1:iy,_emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0:sr,_emscripten_bind_b2FixtureDef__set_shape_p1:qx,_emscripten_bind_b2DistanceJoint__SetDampingRatio_p1:gT,_emscripten_bind_b2Joint__Dump_p0:kL,_emscripten_bind_b2Shape__TestPoint_p2:oe,_emscripten_bind_b2RopeJointDef__set_maxLength_p1:uZ,_emscripten_bind_b2RopeJoint__SetUserData_p1:mo,_emscripten_bind_b2Transform__get_p_p0:sZ,_emscripten_bind_b2PulleyJoint__GetLengthA_p0:id,_emscripten_bind_b2GearJoint__GetJoint2_p0:ki,_emscripten_bind_b2Fixture__GetMassData_p1:hX,_emscripten_bind_b2Body__IsBullet_p0:ox,_emscripten_bind_b2WeldJointDef____destroy___p0:ue,_emscripten_bind_b2PrismaticJoint__GetMotorSpeed_p0:i2,_emscripten_bind_b2GearJointDef__get_bodyA_p1:uu,_emscripten_bind_b2Draw__DrawCircle_p3:kG,_emscripten_bind_b2FrictionJoint__GetLocalAnchorA_p0:oN,_emscripten_bind_b2Body__GetWorldPoint_p1:ov,_emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1:re,_emscripten_bind_b2GearJointDef__set_bodyA_p1:ux,_emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1:r0,_emscripten_bind_b2BodyDef__set_bullet_p1:pV,_emscripten_bind_b2BodyDef__get_angularVelocity_p0:pZ,_emscripten_bind_b2GearJoint__GetNext_p0:kY,_emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0:rd,_emscripten_bind_b2BodyDef__get_fixedRotation_p0:p1,_emscripten_bind_b2Body__GetFixtureList_p0:nD,_emscripten_bind_b2WheelJoint__GetJointTranslation_p0:jW,_emscripten_bind_b2WeldJointDef__get_dampingRatio_p0:tu,_emscripten_bind_b2RopeJoint__SetMaxLength_p1:mm,_emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0:tX,_emscripten_bind_b2PulleyJoint__GetGroundAnchorB_p0:hL,_emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0:sl,_emscripten_bind_b2GearJointDef__set_joint2_p1:uz,_emscripten_bind_b2BroadPhase__b2BroadPhase_p0:ij,_emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0:rU,_emscripten_bind_b2MouseJoint__SetTarget_p1:hF,_emscripten_bind_b2ContactEdge__set_prev_p1:uJ,_emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0:rc,_emscripten_bind_b2ChainShape__set_m_radius_p1:l6,_emscripten_bind_b2Vec2__get_x_p0:p5,_emscripten_bind_b2DistanceProxy__GetSupport_p1:qs,_emscripten_bind_b2WheelJoint__GetLocalAnchorB_p0:jS,_emscripten_bind_b2GearJointDef__get_joint2_p0:uC,_emscripten_bind_b2PrismaticJointDef__set_collideConnected_p1:ro,_emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1:pr,_emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1:rq,_emscripten_bind_b2Fixture__SetDensity_p1:hl,_emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1:r_,_emscripten_bind_b2Body__IsAwake_p0:ol,_emscripten_bind_b2MouseJoint__GetAnchorA_p0:h2,_emscripten_bind_b2PolygonShape__SetAsBox_p4:nV,_emscripten_bind_b2PolygonShape__SetAsBox_p2:m4,_emscripten_bind_b2GearJointDef__set_joint1_p1:uF,_emscripten_bind_b2Draw__DrawSolidCircle_p4:kE,_emscripten_bind_b2World__GetSubStepping_p0:iw,_emscripten_bind_b2FrictionJoint__GetLocalAnchorB_p0:oO,_free:vj,_emscripten_bind_b2Body__SetLinearDamping_p1:oA,_emscripten_bind_b2Body__GetWorldVector_p1:os,_emscripten_bind_b2Fixture__SetFriction_p1:gX,_emscripten_bind_b2Filter__get_groupIndex_p0:oX,_emscripten_bind_b2FixtureDef__get_isSensor_p0:qv,_emscripten_bind_b2PrismaticJoint__GetUpperLimit_p0:jA,_emscripten_bind_b2PrismaticJoint__Dump_p0:js,_emscripten_bind_b2Vec2__op_mul_p1:qd,_emscripten_bind_b2DistanceProxy__Set_p2:qV,_emscripten_bind_b2EdgeShape__Set_p2:nb,_emscripten_bind_b2BodyDef__get_userData_p0:pK,_emscripten_bind_b2CircleShape__set_m_p_p1:jH,_emscripten_bind_b2WheelJoint__GetMaxMotorTorque_p0:j1,_emscripten_bind_b2GearJoint__GetJoint1_p0:kh,_emscripten_bind_b2WheelJointDef__set_dampingRatio_p1:rH,_emscripten_bind_b2DistanceJointDef__set_collideConnected_p1:t_,_emscripten_bind_b2DistanceProxy__get_m_count_p0:qq,_emscripten_bind_b2WeldJointDef__set_dampingRatio_p1:ty,_emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1:tQ,_emscripten_bind_b2GearJoint__GetCollideConnected_p0:kV,_emscripten_bind_b2FrictionJoint__GetCollideConnected_p0:oJ,_memset:vr,_emscripten_bind_b2WheelJoint__Dump_p0:kz,_emscripten_bind_b2World__GetTreeBalance_p0:jt,_emscripten_bind_b2ContactListener__b2ContactListener_p0:mx,_emscripten_bind_b2Rot____destroy___p0:sz,_emscripten_bind_b2PrismaticJoint__GetMaxMotorForce_p0:i7,_emscripten_bind_b2PulleyJointDef__set_bodyB_p1:so,_emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0:sm,_emscripten_bind_b2RevoluteJoint__GetMotorSpeed_p0:lp,_emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0:ui,_emscripten_bind_b2Body__GetNext_p0:nJ,_emscripten_bind_b2BroadPhase__GetTreeHeight_p0:hV,_emscripten_bind_b2Draw__DrawSegment_p3:kH,_emscripten_bind_b2Body__IsActive_p0:oF,_emscripten_bind_b2Vec2__Set_p2:p4,_emscripten_bind_b2PulleyJoint__GetUserData_p0:hN,_emscripten_bind_b2ContactEdge__b2ContactEdge_p0:u4,_emscripten_bind_b2Vec3__b2Vec3_p3:qU,_emscripten_bind_b2Vec3__b2Vec3_p0:qT,_emscripten_bind_b2PulleyJoint__GetGroundAnchorA_p0:hM,_emscripten_bind_b2JointDef__b2JointDef_p0:t3,_emscripten_bind_b2PulleyJoint__GetBodyB_p0:hO,_emscripten_bind_b2PulleyJointDef____destroy___p0:sJ,_emscripten_bind_b2FixtureDef____destroy___p0:qY,_emscripten_bind_b2EdgeShape__Clone_p1:n0,_emscripten_bind_b2Body__GetUserData_p0:nx,_emscripten_bind_b2Body__SetUserData_p1:nB,_emscripten_bind_b2FixtureDef__set_friction_p1:qG,_emscripten_bind_b2PrismaticJointDef__get_bodyA_p1:ri,_emscripten_bind_b2FrictionJoint__GetType_p0:oL,_emscripten_bind_b2DistanceJointDef____destroy___p0:uj,_emscripten_bind_b2FrictionJointDef__Initialize_p3:pB,_emscripten_bind_b2GearJoint__b2GearJoint_p1:kO,_emscripten_bind_b2Body__SetSleepingAllowed_p1:nK,_emscripten_bind_b2Body__SetLinearVelocity_p1:nG,_emscripten_bind_b2Body__ApplyLinearImpulse_p2:op,_emscripten_bind_b2PulleyJoint__b2PulleyJoint_p1:ih,_emscripten_bind_b2MouseJointDef__get_bodyB_p1:tA,_emscripten_bind_b2ContactManager__set_m_contactList_p1:gA,_emscripten_bind_b2MouseJoint__GetNext_p0:hz,_emscripten_bind_b2Transform__get_q_p0:s_,_emscripten_bind_b2DistanceJointDef__get_collideConnected_p1:tY,_emscripten_bind_b2WeldJointDef__set_bodyB_p1:to,_emscripten_bind_b2DistanceJoint__GetReactionForce_p1:he,_emscripten_bind_b2FrictionJoint____destroy___p0:o7,_emscripten_bind_b2JointDef__set_collideConnected_p1:sV,_emscripten_bind_b2CircleShape__ComputeAABB_p3:kp,_emscripten_bind_b2QueryCallback__ReportFixture_p1:mL,_emscripten_bind_b2GearJoint__GetRatio_p0:k_,_emscripten_bind_b2BlockAllocator__Allocate_p1:mQ,_emscripten_bind_b2GearJointDef__get_joint1_p0:uw,_emscripten_bind_b2AABB__Contains_p1:s9,_emscripten_bind_b2FrictionJoint__GetNext_p0:oR,_emscripten_bind_b2ContactEdge____destroy___p0:u3,_emscripten_bind_b2RevoluteJointDef__Initialize_p3:r4,_emscripten_bind_b2BodyDef__set_angle_p1:pX,_emscripten_bind_b2PrismaticJointDef__Initialize_p4:ra,_emscripten_bind_b2Body__GetContactList_p0:ou,_emscripten_bind_b2MouseJointDef__set_dampingRatio_p1:tB,_emscripten_bind_b2PulleyJointDef__get_ratio_p0:sp,_emscripten_bind_b2GearJoint__GetReactionForce_p1:lv,_emscripten_bind_b2Body__GetWorldCenter_p0:on,_emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1:se,_emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1:tN,_emscripten_bind_b2BodyDef__set_angularDamping_p1:pL,_emscripten_bind_b2MouseJointDef__set_collideConnected_p1:tK,_emscripten_bind_b2Shape__ComputeAABB_p3:oc,_emscripten_bind_b2Joint__GetReactionTorque_p1:kJ,_emscripten_bind_b2WheelJoint__GetType_p0:j2,_emscripten_bind_b2Vec3__op_add_p1:qi,_emscripten_bind_b2Filter__get_categoryBits_p0:pn,_emscripten_bind_b2Vec3__set_z_p1:qf,_emscripten_bind_b2CircleShape__GetChildCount_p0:kq,_emscripten_bind_b2Transform__set_p_p1:sX,_emscripten_bind_b2Fixture__GetNext_p0:g$,_emscripten_bind_b2World__SetWarmStarting_p1:iT,_emscripten_bind_b2Vec3__op_sub_p0:ql,_emscripten_bind_b2ContactManager__Collide_p0:g7,_emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0:rZ,_emscripten_bind_b2ContactManager__get_m_contactListener_p0:gB,_emscripten_bind_b2AABB__RayCast_p2:ud,_emscripten_bind_b2WeldJoint__Dump_p0:lK,_emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1:q5,_emscripten_bind_b2EdgeShape__GetType_p0:ne,_emscripten_bind_b2BodyDef__get_gravityScale_p0:pO,_emscripten_bind_b2DistanceProxy__set_m_vertices_p1:qt,_emscripten_bind_b2RevoluteJoint__SetMaxMotorTorque_p1:lY,_emscripten_bind_b2MouseJointDef__get_bodyA_p1:tz,_emscripten_bind_b2PulleyJoint__GetLengthB_p0:ic,_emscripten_bind_b2WeldJointDef__set_referenceAngle_p1:tp,_emscripten_bind_b2BlockAllocator__Free_p2:mZ,_emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0:rf,_emscripten_bind_b2GearJoint__SetRatio_p1:lN,_emscripten_bind_b2BodyDef__get_angle_p0:pY,_emscripten_bind_b2PrismaticJoint__GetReferenceAngle_p0:jb,_emscripten_bind_b2WeldJointDef__set_bodyA_p1:tn,_emscripten_bind_b2DynamicTree__GetHeight_p0:k$,stackAlloc:bS,stackSave:bT,stackRestore:bU,setThrew:bV,setTempRet0:bW,setTempRet1:bX,setTempRet2:bY,setTempRet3:bZ,setTempRet4:b_,setTempRet5:b$,setTempRet6:b0,setTempRet7:b1,setTempRet8:b2,setTempRet9:b3,dynCall_viiiii:vu,dynCall_vif:vP,dynCall_viifii:v8,dynCall_vi:wt,dynCall_vii:wO,dynCall_ii:w7,dynCall_viifi:xs,dynCall_if:xN,dynCall_iiiii:x6,dynCall_viffif:yr,dynCall_iiii:yM,dynCall_fif:y5,dynCall_viff:zq,dynCall_viiiiiiif:zL,dynCall_vifff:z4,dynCall_viiiiii:Ap,dynCall_iiif:AK,dynCall_iif:A3,dynCall_vifii:Bo,dynCall_fi:BJ,dynCall_iii:B2,dynCall_fiiiif:Cn,dynCall_i:CI,dynCall_iiiiii:C1,dynCall_ifff:Dm,dynCall_iff:DH,dynCall_viii:D0,dynCall_v:El,dynCall_viif:EG,dynCall_viiii:E$}})
// EMSCRIPTEN_END_ASM
({ Math: Math, Int8Array: Int8Array, Int16Array: Int16Array, Int32Array: Int32Array, Uint8Array: Uint8Array, Uint16Array: Uint16Array, Uint32Array: Uint32Array, Float32Array: Float32Array, Float64Array: Float64Array }, { abort: abort, assert: assert, asmPrintInt: asmPrintInt, asmPrintFloat: asmPrintFloat, copyTempDouble: copyTempDouble, copyTempFloat: copyTempFloat, min: Math_min, jsCall: jsCall, invoke_viiiii: invoke_viiiii, invoke_vif: invoke_vif, invoke_viifii: invoke_viifii, invoke_vi: invoke_vi, invoke_vii: invoke_vii, invoke_ii: invoke_ii, invoke_viifi: invoke_viifi, invoke_if: invoke_if, invoke_iiiii: invoke_iiiii, invoke_viffif: invoke_viffif, invoke_iiii: invoke_iiii, invoke_fif: invoke_fif, invoke_viff: invoke_viff, invoke_viiiiiiif: invoke_viiiiiiif, invoke_vifff: invoke_vifff, invoke_viiiiii: invoke_viiiiii, invoke_iiif: invoke_iiif, invoke_iif: invoke_iif, invoke_vifii: invoke_vifii, invoke_fi: invoke_fi, invoke_iii: invoke_iii, invoke_fiiiif: invoke_fiiiif, invoke_i: invoke_i, invoke_iiiiii: invoke_iiiiii, invoke_ifff: invoke_ifff, invoke_iff: invoke_iff, invoke_viii: invoke_viii, invoke_v: invoke_v, invoke_viif: invoke_viif, invoke_viiii: invoke_viiii, _llvm_va_end: _llvm_va_end, _cosf: _cosf, _floorf: _floorf, ___cxa_throw: ___cxa_throw, _abort: _abort, _fprintf: _fprintf, _printf: _printf, __reallyNegative: __reallyNegative, _sqrtf: _sqrtf, __ZNK12b2WheelJoint13GetDefinitionEP15b2WheelJointDef: __ZNK12b2WheelJoint13GetDefinitionEP15b2WheelJointDef, _llvm_lifetime_start: _llvm_lifetime_start, ___setErrNo: ___setErrNo, _fwrite: _fwrite, _llvm_eh_exception: _llvm_eh_exception, _write: _write, _exit: _exit, _llvm_lifetime_end: _llvm_lifetime_end, ___cxa_find_matching_catch: ___cxa_find_matching_catch, _atan2f: _atan2f, _sysconf: _sysconf, ___cxa_pure_virtual: ___cxa_pure_virtual, _vprintf: _vprintf, ___cxa_is_number_type: ___cxa_is_number_type, ___resumeException: ___resumeException, __formatString: __formatString, ___cxa_does_inherit: ___cxa_does_inherit, __ZSt9terminatev: __ZSt9terminatev, _sinf: _sinf, ___assert_func: ___assert_func, __ZSt18uncaught_exceptionv: __ZSt18uncaught_exceptionv, _pwrite: _pwrite, _sbrk: _sbrk, __ZNSt9exceptionD2Ev: __ZNSt9exceptionD2Ev, ___cxa_allocate_exception: ___cxa_allocate_exception, ___errno_location: ___errno_location, ___gxx_personality_v0: ___gxx_personality_v0, ___cxa_call_unexpected: ___cxa_call_unexpected, _time: _time, __exit: __exit, STACKTOP: STACKTOP, STACK_MAX: STACK_MAX, tempDoublePtr: tempDoublePtr, ABORT: ABORT, NaN: NaN, Infinity: Infinity, __ZTVN10__cxxabiv120__si_class_type_infoE: __ZTVN10__cxxabiv120__si_class_type_infoE, __ZTISt9exception: __ZTISt9exception, __ZTVN10__cxxabiv117__class_type_infoE: __ZTVN10__cxxabiv117__class_type_infoE }, buffer);
var _emscripten_bind_b2WheelJoint__GetSpringFrequencyHz_p0 = Module["_emscripten_bind_b2WheelJoint__GetSpringFrequencyHz_p0"] = asm._emscripten_bind_b2WheelJoint__GetSpringFrequencyHz_p0;
var _emscripten_bind_b2Fixture__SetRestitution_p1 = Module["_emscripten_bind_b2Fixture__SetRestitution_p1"] = asm._emscripten_bind_b2Fixture__SetRestitution_p1;
var _emscripten_bind_b2PolygonShape____destroy___p0 = Module["_emscripten_bind_b2PolygonShape____destroy___p0"] = asm._emscripten_bind_b2PolygonShape____destroy___p0;
var _emscripten_bind_b2RevoluteJoint__EnableLimit_p1 = Module["_emscripten_bind_b2RevoluteJoint__EnableLimit_p1"] = asm._emscripten_bind_b2RevoluteJoint__EnableLimit_p1;
var _emscripten_bind_b2DistanceProxy__get_m_vertices_p0 = Module["_emscripten_bind_b2DistanceProxy__get_m_vertices_p0"] = asm._emscripten_bind_b2DistanceProxy__get_m_vertices_p0;
var _emscripten_bind_b2PrismaticJoint__EnableLimit_p1 = Module["_emscripten_bind_b2PrismaticJoint__EnableLimit_p1"] = asm._emscripten_bind_b2PrismaticJoint__EnableLimit_p1;
var _emscripten_bind_b2WheelJointDef__Initialize_p4 = Module["_emscripten_bind_b2WheelJointDef__Initialize_p4"] = asm._emscripten_bind_b2WheelJointDef__Initialize_p4;
var _emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1"] = asm._emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1;
var _emscripten_bind_b2PrismaticJoint__GetMotorForce_p1 = Module["_emscripten_bind_b2PrismaticJoint__GetMotorForce_p1"] = asm._emscripten_bind_b2PrismaticJoint__GetMotorForce_p1;
var _emscripten_bind_b2Body__IsSleepingAllowed_p0 = Module["_emscripten_bind_b2Body__IsSleepingAllowed_p0"] = asm._emscripten_bind_b2Body__IsSleepingAllowed_p0;
var _emscripten_bind_b2Vec2__b2Vec2_p2 = Module["_emscripten_bind_b2Vec2__b2Vec2_p2"] = asm._emscripten_bind_b2Vec2__b2Vec2_p2;
var _emscripten_bind_b2RevoluteJoint__GetMaxMotorTorque_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetMaxMotorTorque_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetMaxMotorTorque_p0;
var _emscripten_bind_b2WeldJoint__GetFrequency_p0 = Module["_emscripten_bind_b2WeldJoint__GetFrequency_p0"] = asm._emscripten_bind_b2WeldJoint__GetFrequency_p0;
var _emscripten_bind_b2MouseJoint__GetType_p0 = Module["_emscripten_bind_b2MouseJoint__GetType_p0"] = asm._emscripten_bind_b2MouseJoint__GetType_p0;
var _emscripten_bind_b2RayCastCallback__b2RayCastCallback_p0 = Module["_emscripten_bind_b2RayCastCallback__b2RayCastCallback_p0"] = asm._emscripten_bind_b2RayCastCallback__b2RayCastCallback_p0;
var _emscripten_bind_b2Body__GetLinearDamping_p0 = Module["_emscripten_bind_b2Body__GetLinearDamping_p0"] = asm._emscripten_bind_b2Body__GetLinearDamping_p0;
var _emscripten_bind_b2Vec2__b2Vec2_p0 = Module["_emscripten_bind_b2Vec2__b2Vec2_p0"] = asm._emscripten_bind_b2Vec2__b2Vec2_p0;
var _emscripten_bind_b2PrismaticJoint__GetType_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetType_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetType_p0;
var _emscripten_bind_b2PrismaticJoint____destroy___p0 = Module["_emscripten_bind_b2PrismaticJoint____destroy___p0"] = asm._emscripten_bind_b2PrismaticJoint____destroy___p0;
var _emscripten_bind_b2WheelJointDef__set_frequencyHz_p1 = Module["_emscripten_bind_b2WheelJointDef__set_frequencyHz_p1"] = asm._emscripten_bind_b2WheelJointDef__set_frequencyHz_p1;
var _emscripten_bind_b2BlockAllocator____destroy___p0 = Module["_emscripten_bind_b2BlockAllocator____destroy___p0"] = asm._emscripten_bind_b2BlockAllocator____destroy___p0;
var _emscripten_bind_b2Vec2__op_add_p1 = Module["_emscripten_bind_b2Vec2__op_add_p1"] = asm._emscripten_bind_b2Vec2__op_add_p1;
var _emscripten_bind_b2World__GetJointList_p0 = Module["_emscripten_bind_b2World__GetJointList_p0"] = asm._emscripten_bind_b2World__GetJointList_p0;
var _emscripten_bind_b2Transform__Set_p2 = Module["_emscripten_bind_b2Transform__Set_p2"] = asm._emscripten_bind_b2Transform__Set_p2;
var _emscripten_bind_b2EdgeShape__RayCast_p4 = Module["_emscripten_bind_b2EdgeShape__RayCast_p4"] = asm._emscripten_bind_b2EdgeShape__RayCast_p4;
var _emscripten_bind_b2RevoluteJoint__GetLocalAnchorA_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetLocalAnchorA_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetLocalAnchorA_p0;
var _emscripten_bind_b2DistanceJoint__GetDampingRatio_p0 = Module["_emscripten_bind_b2DistanceJoint__GetDampingRatio_p0"] = asm._emscripten_bind_b2DistanceJoint__GetDampingRatio_p0;
var _emscripten_bind_b2PulleyJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_bodyA_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_bodyA_p1;
var _emscripten_bind_b2DynamicTree__Validate_p0 = Module["_emscripten_bind_b2DynamicTree__Validate_p0"] = asm._emscripten_bind_b2DynamicTree__Validate_p0;
var _emscripten_bind_b2DynamicTree__DestroyProxy_p1 = Module["_emscripten_bind_b2DynamicTree__DestroyProxy_p1"] = asm._emscripten_bind_b2DynamicTree__DestroyProxy_p1;
var _emscripten_bind_b2Joint__IsActive_p0 = Module["_emscripten_bind_b2Joint__IsActive_p0"] = asm._emscripten_bind_b2Joint__IsActive_p0;
var _emscripten_bind_b2PulleyJoint__GetNext_p0 = Module["_emscripten_bind_b2PulleyJoint__GetNext_p0"] = asm._emscripten_bind_b2PulleyJoint__GetNext_p0;
var _emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0;
var _emscripten_bind_b2GearJoint__IsActive_p0 = Module["_emscripten_bind_b2GearJoint__IsActive_p0"] = asm._emscripten_bind_b2GearJoint__IsActive_p0;
var _emscripten_bind_b2EdgeShape__get_m_radius_p0 = Module["_emscripten_bind_b2EdgeShape__get_m_radius_p0"] = asm._emscripten_bind_b2EdgeShape__get_m_radius_p0;
var _emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0;
var _emscripten_bind_b2RevoluteJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_bodyA_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_bodyA_p1;
var _emscripten_bind_b2World__GetJointCount_p0 = Module["_emscripten_bind_b2World__GetJointCount_p0"] = asm._emscripten_bind_b2World__GetJointCount_p0;
var _emscripten_bind_b2DynamicTree__CreateProxy_p2 = Module["_emscripten_bind_b2DynamicTree__CreateProxy_p2"] = asm._emscripten_bind_b2DynamicTree__CreateProxy_p2;
var _emscripten_bind_b2WheelJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2WheelJointDef__set_collideConnected_p1"] = asm._emscripten_bind_b2WheelJointDef__set_collideConnected_p1;
var _emscripten_bind_b2WeldJoint__GetLocalAnchorA_p0 = Module["_emscripten_bind_b2WeldJoint__GetLocalAnchorA_p0"] = asm._emscripten_bind_b2WeldJoint__GetLocalAnchorA_p0;
var _emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0;
var _emscripten_bind_b2Body__GetGravityScale_p0 = Module["_emscripten_bind_b2Body__GetGravityScale_p0"] = asm._emscripten_bind_b2Body__GetGravityScale_p0;
var _emscripten_bind_b2Fixture__Dump_p1 = Module["_emscripten_bind_b2Fixture__Dump_p1"] = asm._emscripten_bind_b2Fixture__Dump_p1;
var _emscripten_bind_b2World__GetBodyList_p0 = Module["_emscripten_bind_b2World__GetBodyList_p0"] = asm._emscripten_bind_b2World__GetBodyList_p0;
var _emscripten_bind_b2PulleyJoint__IsActive_p0 = Module["_emscripten_bind_b2PulleyJoint__IsActive_p0"] = asm._emscripten_bind_b2PulleyJoint__IsActive_p0;
var _emscripten_bind_b2MouseJoint__SetUserData_p1 = Module["_emscripten_bind_b2MouseJoint__SetUserData_p1"] = asm._emscripten_bind_b2MouseJoint__SetUserData_p1;
var _emscripten_bind_b2World__GetContactList_p0 = Module["_emscripten_bind_b2World__GetContactList_p0"] = asm._emscripten_bind_b2World__GetContactList_p0;
var _emscripten_bind_b2PrismaticJoint__GetNext_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetNext_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetNext_p0;
var _emscripten_bind_b2Vec2__Skew_p0 = Module["_emscripten_bind_b2Vec2__Skew_p0"] = asm._emscripten_bind_b2Vec2__Skew_p0;
var _emscripten_bind_b2BodyDef__get_linearVelocity_p0 = Module["_emscripten_bind_b2BodyDef__get_linearVelocity_p0"] = asm._emscripten_bind_b2BodyDef__get_linearVelocity_p0;
var _emscripten_bind_b2Body__GetPosition_p0 = Module["_emscripten_bind_b2Body__GetPosition_p0"] = asm._emscripten_bind_b2Body__GetPosition_p0;
var _emscripten_bind_b2WheelJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2WheelJoint__GetReactionForce_p1"] = asm._emscripten_bind_b2WheelJoint__GetReactionForce_p1;
var _emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1;
var _emscripten_bind_b2PrismaticJoint__SetMaxMotorForce_p1 = Module["_emscripten_bind_b2PrismaticJoint__SetMaxMotorForce_p1"] = asm._emscripten_bind_b2PrismaticJoint__SetMaxMotorForce_p1;
var _emscripten_bind_b2ChainShape__b2ChainShape_p0 = Module["_emscripten_bind_b2ChainShape__b2ChainShape_p0"] = asm._emscripten_bind_b2ChainShape__b2ChainShape_p0;
var _emscripten_bind_b2CircleShape__RayCast_p4 = Module["_emscripten_bind_b2CircleShape__RayCast_p4"] = asm._emscripten_bind_b2CircleShape__RayCast_p4;
var _emscripten_bind_b2WheelJoint__GetBodyA_p0 = Module["_emscripten_bind_b2WheelJoint__GetBodyA_p0"] = asm._emscripten_bind_b2WheelJoint__GetBodyA_p0;
var _emscripten_bind_b2RevoluteJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_bodyB_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_bodyB_p1;
var _emscripten_bind_b2MouseJointDef__get_dampingRatio_p0 = Module["_emscripten_bind_b2MouseJointDef__get_dampingRatio_p0"] = asm._emscripten_bind_b2MouseJointDef__get_dampingRatio_p0;
var _emscripten_bind_b2JointDef__set_bodyB_p1 = Module["_emscripten_bind_b2JointDef__set_bodyB_p1"] = asm._emscripten_bind_b2JointDef__set_bodyB_p1;
var _emscripten_bind_b2RevoluteJoint__GetJointSpeed_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetJointSpeed_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetJointSpeed_p0;
var _emscripten_bind_b2RopeJoint__GetLocalAnchorB_p0 = Module["_emscripten_bind_b2RopeJoint__GetLocalAnchorB_p0"] = asm._emscripten_bind_b2RopeJoint__GetLocalAnchorB_p0;
var _emscripten_bind_b2Fixture__GetAABB_p1 = Module["_emscripten_bind_b2Fixture__GetAABB_p1"] = asm._emscripten_bind_b2Fixture__GetAABB_p1;
var _emscripten_bind_b2BroadPhase__TouchProxy_p1 = Module["_emscripten_bind_b2BroadPhase__TouchProxy_p1"] = asm._emscripten_bind_b2BroadPhase__TouchProxy_p1;
var _emscripten_bind_b2FixtureDef__set_isSensor_p1 = Module["_emscripten_bind_b2FixtureDef__set_isSensor_p1"] = asm._emscripten_bind_b2FixtureDef__set_isSensor_p1;
var _emscripten_bind_b2World__GetAllowSleeping_p0 = Module["_emscripten_bind_b2World__GetAllowSleeping_p0"] = asm._emscripten_bind_b2World__GetAllowSleeping_p0;
var _emscripten_bind_b2DestructionListener____destroy___p0 = Module["_emscripten_bind_b2DestructionListener____destroy___p0"] = asm._emscripten_bind_b2DestructionListener____destroy___p0;
var _emscripten_bind_b2BroadPhase____destroy___p0 = Module["_emscripten_bind_b2BroadPhase____destroy___p0"] = asm._emscripten_bind_b2BroadPhase____destroy___p0;
var _emscripten_bind_b2World__GetWarmStarting_p0 = Module["_emscripten_bind_b2World__GetWarmStarting_p0"] = asm._emscripten_bind_b2World__GetWarmStarting_p0;
var _emscripten_bind_b2Rot__b2Rot_p1 = Module["_emscripten_bind_b2Rot__b2Rot_p1"] = asm._emscripten_bind_b2Rot__b2Rot_p1;
var _emscripten_bind_b2Rot__b2Rot_p0 = Module["_emscripten_bind_b2Rot__b2Rot_p0"] = asm._emscripten_bind_b2Rot__b2Rot_p0;
var _emscripten_bind_b2DistanceJoint__GetUserData_p0 = Module["_emscripten_bind_b2DistanceJoint__GetUserData_p0"] = asm._emscripten_bind_b2DistanceJoint__GetUserData_p0;
var _emscripten_bind_b2MouseJointDef__get_frequencyHz_p0 = Module["_emscripten_bind_b2MouseJointDef__get_frequencyHz_p0"] = asm._emscripten_bind_b2MouseJointDef__get_frequencyHz_p0;
var _emscripten_bind_b2ContactManager__set_m_allocator_p1 = Module["_emscripten_bind_b2ContactManager__set_m_allocator_p1"] = asm._emscripten_bind_b2ContactManager__set_m_allocator_p1;
var _emscripten_bind_b2WheelJoint__SetMaxMotorTorque_p1 = Module["_emscripten_bind_b2WheelJoint__SetMaxMotorTorque_p1"] = asm._emscripten_bind_b2WheelJoint__SetMaxMotorTorque_p1;
var _emscripten_bind_b2RopeJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2RopeJointDef__get_collideConnected_p1"] = asm._emscripten_bind_b2RopeJointDef__get_collideConnected_p1;
var _emscripten_bind_b2MouseJointDef__get_target_p0 = Module["_emscripten_bind_b2MouseJointDef__get_target_p0"] = asm._emscripten_bind_b2MouseJointDef__get_target_p0;
var _emscripten_bind_b2WeldJoint__SetUserData_p1 = Module["_emscripten_bind_b2WeldJoint__SetUserData_p1"] = asm._emscripten_bind_b2WeldJoint__SetUserData_p1;
var _emscripten_bind_b2PrismaticJoint__GetBodyA_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetBodyA_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetBodyA_p0;
var _emscripten_bind_b2FrictionJointDef____destroy___p0 = Module["_emscripten_bind_b2FrictionJointDef____destroy___p0"] = asm._emscripten_bind_b2FrictionJointDef____destroy___p0;
var _emscripten_bind_b2RopeJoint__GetMaxLength_p0 = Module["_emscripten_bind_b2RopeJoint__GetMaxLength_p0"] = asm._emscripten_bind_b2RopeJoint__GetMaxLength_p0;
var _emscripten_bind_b2MouseJoint__GetDampingRatio_p0 = Module["_emscripten_bind_b2MouseJoint__GetDampingRatio_p0"] = asm._emscripten_bind_b2MouseJoint__GetDampingRatio_p0;
var _emscripten_bind_b2DistanceJoint__GetNext_p0 = Module["_emscripten_bind_b2DistanceJoint__GetNext_p0"] = asm._emscripten_bind_b2DistanceJoint__GetNext_p0;
var _emscripten_bind_b2Filter__get_maskBits_p0 = Module["_emscripten_bind_b2Filter__get_maskBits_p0"] = asm._emscripten_bind_b2Filter__get_maskBits_p0;
var _emscripten_bind_b2RayCastCallback____destroy___p0 = Module["_emscripten_bind_b2RayCastCallback____destroy___p0"] = asm._emscripten_bind_b2RayCastCallback____destroy___p0;
var _emscripten_bind_b2World__Dump_p0 = Module["_emscripten_bind_b2World__Dump_p0"] = asm._emscripten_bind_b2World__Dump_p0;
var _emscripten_bind_b2RevoluteJointDef____destroy___p0 = Module["_emscripten_bind_b2RevoluteJointDef____destroy___p0"] = asm._emscripten_bind_b2RevoluteJointDef____destroy___p0;
var _emscripten_bind_b2PrismaticJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetAnchorA_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetAnchorA_p0;
var _emscripten_bind_b2BodyDef__get_bullet_p0 = Module["_emscripten_bind_b2BodyDef__get_bullet_p0"] = asm._emscripten_bind_b2BodyDef__get_bullet_p0;
var _emscripten_bind_b2Body__SetAngularDamping_p1 = Module["_emscripten_bind_b2Body__SetAngularDamping_p1"] = asm._emscripten_bind_b2Body__SetAngularDamping_p1;
var _emscripten_bind_b2DynamicTree__RebuildBottomUp_p0 = Module["_emscripten_bind_b2DynamicTree__RebuildBottomUp_p0"] = asm._emscripten_bind_b2DynamicTree__RebuildBottomUp_p0;
var _emscripten_bind_b2Fixture__GetFilterData_p0 = Module["_emscripten_bind_b2Fixture__GetFilterData_p0"] = asm._emscripten_bind_b2Fixture__GetFilterData_p0;
var _emscripten_bind_b2DistanceJoint__SetLength_p1 = Module["_emscripten_bind_b2DistanceJoint__SetLength_p1"] = asm._emscripten_bind_b2DistanceJoint__SetLength_p1;
var _emscripten_bind_b2BodyDef__get_position_p0 = Module["_emscripten_bind_b2BodyDef__get_position_p0"] = asm._emscripten_bind_b2BodyDef__get_position_p0;
var _emscripten_bind_b2FrictionJoint__GetUserData_p0 = Module["_emscripten_bind_b2FrictionJoint__GetUserData_p0"] = asm._emscripten_bind_b2FrictionJoint__GetUserData_p0;
var _emscripten_bind_b2PolygonShape__get_m_radius_p0 = Module["_emscripten_bind_b2PolygonShape__get_m_radius_p0"] = asm._emscripten_bind_b2PolygonShape__get_m_radius_p0;
var _emscripten_bind_b2ContactEdge__set_next_p1 = Module["_emscripten_bind_b2ContactEdge__set_next_p1"] = asm._emscripten_bind_b2ContactEdge__set_next_p1;
var _emscripten_bind_b2Transform__b2Transform_p2 = Module["_emscripten_bind_b2Transform__b2Transform_p2"] = asm._emscripten_bind_b2Transform__b2Transform_p2;
var _emscripten_bind_b2FrictionJointDef__get_maxTorque_p0 = Module["_emscripten_bind_b2FrictionJointDef__get_maxTorque_p0"] = asm._emscripten_bind_b2FrictionJointDef__get_maxTorque_p0;
var _emscripten_bind_b2WeldJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2WeldJointDef__set_localAnchorB_p1"] = asm._emscripten_bind_b2WeldJointDef__set_localAnchorB_p1;
var _emscripten_bind_b2World__GetProxyCount_p0 = Module["_emscripten_bind_b2World__GetProxyCount_p0"] = asm._emscripten_bind_b2World__GetProxyCount_p0;
var _emscripten_bind_b2WeldJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2WeldJointDef__get_bodyB_p1"] = asm._emscripten_bind_b2WeldJointDef__get_bodyB_p1;
var _emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1;
var _emscripten_bind_b2PolygonShape__set_m_centroid_p1 = Module["_emscripten_bind_b2PolygonShape__set_m_centroid_p1"] = asm._emscripten_bind_b2PolygonShape__set_m_centroid_p1;
var _emscripten_bind_b2GearJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2GearJoint__GetAnchorA_p0"] = asm._emscripten_bind_b2GearJoint__GetAnchorA_p0;
var _emscripten_bind_b2PulleyJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2PulleyJointDef__get_collideConnected_p1"] = asm._emscripten_bind_b2PulleyJointDef__get_collideConnected_p1;
var _emscripten_bind_b2Vec3____destroy___p0 = Module["_emscripten_bind_b2Vec3____destroy___p0"] = asm._emscripten_bind_b2Vec3____destroy___p0;
var _emscripten_bind_b2Color__set_r_p1 = Module["_emscripten_bind_b2Color__set_r_p1"] = asm._emscripten_bind_b2Color__set_r_p1;
var _emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0;
var _emscripten_bind_b2BodyDef__get_linearDamping_p0 = Module["_emscripten_bind_b2BodyDef__get_linearDamping_p0"] = asm._emscripten_bind_b2BodyDef__get_linearDamping_p0;
var _emscripten_bind_b2EdgeShape__ComputeMass_p2 = Module["_emscripten_bind_b2EdgeShape__ComputeMass_p2"] = asm._emscripten_bind_b2EdgeShape__ComputeMass_p2;
var _emscripten_bind_b2RayCastCallback__ReportFixture_p4 = Module["_emscripten_bind_b2RayCastCallback__ReportFixture_p4"] = asm._emscripten_bind_b2RayCastCallback__ReportFixture_p4;
var _emscripten_bind_b2Body__Dump_p0 = Module["_emscripten_bind_b2Body__Dump_p0"] = asm._emscripten_bind_b2Body__Dump_p0;
var _emscripten_bind_b2BodyDef__get_allowSleep_p0 = Module["_emscripten_bind_b2BodyDef__get_allowSleep_p0"] = asm._emscripten_bind_b2BodyDef__get_allowSleep_p0;
var _emscripten_bind_b2AABB__get_lowerBound_p0 = Module["_emscripten_bind_b2AABB__get_lowerBound_p0"] = asm._emscripten_bind_b2AABB__get_lowerBound_p0;
var _emscripten_bind_b2PulleyJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2PulleyJoint__GetAnchorB_p0"] = asm._emscripten_bind_b2PulleyJoint__GetAnchorB_p0;
var _emscripten_bind_b2PrismaticJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2PrismaticJoint__GetReactionTorque_p1"] = asm._emscripten_bind_b2PrismaticJoint__GetReactionTorque_p1;
var _emscripten_bind_b2JointDef__set_bodyA_p1 = Module["_emscripten_bind_b2JointDef__set_bodyA_p1"] = asm._emscripten_bind_b2JointDef__set_bodyA_p1;
var _emscripten_bind_b2PrismaticJoint__GetBodyB_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetBodyB_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetBodyB_p0;
var _emscripten_bind_b2DistanceJoint__GetLocalAnchorA_p0 = Module["_emscripten_bind_b2DistanceJoint__GetLocalAnchorA_p0"] = asm._emscripten_bind_b2DistanceJoint__GetLocalAnchorA_p0;
var _emscripten_bind_b2RopeJoint__GetLocalAnchorA_p0 = Module["_emscripten_bind_b2RopeJoint__GetLocalAnchorA_p0"] = asm._emscripten_bind_b2RopeJoint__GetLocalAnchorA_p0;
var _emscripten_bind_b2Rot__set_c_p1 = Module["_emscripten_bind_b2Rot__set_c_p1"] = asm._emscripten_bind_b2Rot__set_c_p1;
var _emscripten_bind_b2Vec3__op_mul_p1 = Module["_emscripten_bind_b2Vec3__op_mul_p1"] = asm._emscripten_bind_b2Vec3__op_mul_p1;
var _emscripten_bind_b2StackAllocator__GetMaxAllocation_p0 = Module["_emscripten_bind_b2StackAllocator__GetMaxAllocation_p0"] = asm._emscripten_bind_b2StackAllocator__GetMaxAllocation_p0;
var _emscripten_bind_b2MouseJoint__SetFrequency_p1 = Module["_emscripten_bind_b2MouseJoint__SetFrequency_p1"] = asm._emscripten_bind_b2MouseJoint__SetFrequency_p1;
var _emscripten_bind_b2WeldJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2WeldJoint__GetAnchorA_p0"] = asm._emscripten_bind_b2WeldJoint__GetAnchorA_p0;
var _emscripten_bind_b2World__SetAutoClearForces_p1 = Module["_emscripten_bind_b2World__SetAutoClearForces_p1"] = asm._emscripten_bind_b2World__SetAutoClearForces_p1;
var _emscripten_bind_b2Contact__SetEnabled_p1 = Module["_emscripten_bind_b2Contact__SetEnabled_p1"] = asm._emscripten_bind_b2Contact__SetEnabled_p1;
var _emscripten_bind_b2ContactManager__get_m_contactFilter_p0 = Module["_emscripten_bind_b2ContactManager__get_m_contactFilter_p0"] = asm._emscripten_bind_b2ContactManager__get_m_contactFilter_p0;
var _emscripten_bind_b2BodyDef__get_angularDamping_p0 = Module["_emscripten_bind_b2BodyDef__get_angularDamping_p0"] = asm._emscripten_bind_b2BodyDef__get_angularDamping_p0;
var _emscripten_bind_b2WeldJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2WeldJointDef__set_localAnchorA_p1"] = asm._emscripten_bind_b2WeldJointDef__set_localAnchorA_p1;
var _emscripten_bind_b2DistanceJoint__GetBodyB_p0 = Module["_emscripten_bind_b2DistanceJoint__GetBodyB_p0"] = asm._emscripten_bind_b2DistanceJoint__GetBodyB_p0;
var _emscripten_bind_b2PulleyJointDef__set_lengthB_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_lengthB_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_lengthB_p1;
var _emscripten_bind_b2Vec2__op_sub_p0 = Module["_emscripten_bind_b2Vec2__op_sub_p0"] = asm._emscripten_bind_b2Vec2__op_sub_p0;
var _emscripten_bind_b2PrismaticJoint__GetLocalAnchorB_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetLocalAnchorB_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetLocalAnchorB_p0;
var _emscripten_bind_b2RopeJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2RopeJointDef__get_localAnchorB_p0"] = asm._emscripten_bind_b2RopeJointDef__get_localAnchorB_p0;
var _emscripten_bind_b2Contact__GetChildIndexB_p0 = Module["_emscripten_bind_b2Contact__GetChildIndexB_p0"] = asm._emscripten_bind_b2Contact__GetChildIndexB_p0;
var _emscripten_bind_b2Fixture__TestPoint_p1 = Module["_emscripten_bind_b2Fixture__TestPoint_p1"] = asm._emscripten_bind_b2Fixture__TestPoint_p1;
var _emscripten_bind_b2FixtureDef__get_shape_p0 = Module["_emscripten_bind_b2FixtureDef__get_shape_p0"] = asm._emscripten_bind_b2FixtureDef__get_shape_p0;
var _emscripten_bind_b2WheelJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2WheelJointDef__get_bodyB_p1"] = asm._emscripten_bind_b2WheelJointDef__get_bodyB_p1;
var _emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0;
var _emscripten_bind_b2BodyDef__set_linearVelocity_p1 = Module["_emscripten_bind_b2BodyDef__set_linearVelocity_p1"] = asm._emscripten_bind_b2BodyDef__set_linearVelocity_p1;
var _emscripten_bind_b2Body__GetMass_p0 = Module["_emscripten_bind_b2Body__GetMass_p0"] = asm._emscripten_bind_b2Body__GetMass_p0;
var _emscripten_bind_b2WeldJoint____destroy___p0 = Module["_emscripten_bind_b2WeldJoint____destroy___p0"] = asm._emscripten_bind_b2WeldJoint____destroy___p0;
var _emscripten_bind_b2WheelJoint__GetSpringDampingRatio_p0 = Module["_emscripten_bind_b2WheelJoint__GetSpringDampingRatio_p0"] = asm._emscripten_bind_b2WheelJoint__GetSpringDampingRatio_p0;
var _emscripten_bind_b2RopeJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2RopeJointDef__set_localAnchorB_p1"] = asm._emscripten_bind_b2RopeJointDef__set_localAnchorB_p1;
var _emscripten_bind_b2Body__IsFixedRotation_p0 = Module["_emscripten_bind_b2Body__IsFixedRotation_p0"] = asm._emscripten_bind_b2Body__IsFixedRotation_p0;
var _emscripten_bind_b2Rot__SetIdentity_p0 = Module["_emscripten_bind_b2Rot__SetIdentity_p0"] = asm._emscripten_bind_b2Rot__SetIdentity_p0;
var _emscripten_bind_b2WheelJoint__SetSpringDampingRatio_p1 = Module["_emscripten_bind_b2WheelJoint__SetSpringDampingRatio_p1"] = asm._emscripten_bind_b2WheelJoint__SetSpringDampingRatio_p1;
var _emscripten_bind_b2Joint__SetUserData_p1 = Module["_emscripten_bind_b2Joint__SetUserData_p1"] = asm._emscripten_bind_b2Joint__SetUserData_p1;
var _emscripten_bind_b2FrictionJoint__IsActive_p0 = Module["_emscripten_bind_b2FrictionJoint__IsActive_p0"] = asm._emscripten_bind_b2FrictionJoint__IsActive_p0;
var _emscripten_bind_b2JointDef__get_userData_p0 = Module["_emscripten_bind_b2JointDef__get_userData_p0"] = asm._emscripten_bind_b2JointDef__get_userData_p0;
var _emscripten_bind_b2Draw__DrawPolygon_p3 = Module["_emscripten_bind_b2Draw__DrawPolygon_p3"] = asm._emscripten_bind_b2Draw__DrawPolygon_p3;
var _emscripten_bind_b2MouseJoint__GetBodyB_p0 = Module["_emscripten_bind_b2MouseJoint__GetBodyB_p0"] = asm._emscripten_bind_b2MouseJoint__GetBodyB_p0;
var _emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0 = Module["_emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0"] = asm._emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0;
var _emscripten_bind_b2ContactManager__get_m_broadPhase_p0 = Module["_emscripten_bind_b2ContactManager__get_m_broadPhase_p0"] = asm._emscripten_bind_b2ContactManager__get_m_broadPhase_p0;
var _emscripten_bind_b2RopeJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2RopeJoint__GetReactionTorque_p1"] = asm._emscripten_bind_b2RopeJoint__GetReactionTorque_p1;
var _emscripten_bind_b2PrismaticJoint__GetLowerLimit_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetLowerLimit_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetLowerLimit_p0;
var _emscripten_bind_b2Contact__GetManifold_p0 = Module["_emscripten_bind_b2Contact__GetManifold_p0"] = asm._emscripten_bind_b2Contact__GetManifold_p0;
var _emscripten_bind_b2Contact__SetFriction_p1 = Module["_emscripten_bind_b2Contact__SetFriction_p1"] = asm._emscripten_bind_b2Contact__SetFriction_p1;
var _emscripten_bind_b2WheelJoint__GetJointSpeed_p0 = Module["_emscripten_bind_b2WheelJoint__GetJointSpeed_p0"] = asm._emscripten_bind_b2WheelJoint__GetJointSpeed_p0;
var _emscripten_bind_b2BodyDef__set_allowSleep_p1 = Module["_emscripten_bind_b2BodyDef__set_allowSleep_p1"] = asm._emscripten_bind_b2BodyDef__set_allowSleep_p1;
var _emscripten_bind_b2Fixture__RayCast_p3 = Module["_emscripten_bind_b2Fixture__RayCast_p3"] = asm._emscripten_bind_b2Fixture__RayCast_p3;
var _emscripten_bind_b2WeldJointDef__get_referenceAngle_p0 = Module["_emscripten_bind_b2WeldJointDef__get_referenceAngle_p0"] = asm._emscripten_bind_b2WeldJointDef__get_referenceAngle_p0;
var _emscripten_bind_b2Fixture____destroy___p0 = Module["_emscripten_bind_b2Fixture____destroy___p0"] = asm._emscripten_bind_b2Fixture____destroy___p0;
var _emscripten_bind_b2RopeJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2RopeJointDef__set_localAnchorA_p1"] = asm._emscripten_bind_b2RopeJointDef__set_localAnchorA_p1;
var _emscripten_bind_b2WheelJoint__SetUserData_p1 = Module["_emscripten_bind_b2WheelJoint__SetUserData_p1"] = asm._emscripten_bind_b2WheelJoint__SetUserData_p1;
var _emscripten_bind_b2WeldJoint__b2WeldJoint_p1 = Module["_emscripten_bind_b2WeldJoint__b2WeldJoint_p1"] = asm._emscripten_bind_b2WeldJoint__b2WeldJoint_p1;
var _emscripten_bind_b2WeldJoint__IsActive_p0 = Module["_emscripten_bind_b2WeldJoint__IsActive_p0"] = asm._emscripten_bind_b2WeldJoint__IsActive_p0;
var _emscripten_bind_b2Draw__DrawSolidPolygon_p3 = Module["_emscripten_bind_b2Draw__DrawSolidPolygon_p3"] = asm._emscripten_bind_b2Draw__DrawSolidPolygon_p3;
var _emscripten_bind_b2ContactManager____destroy___p0 = Module["_emscripten_bind_b2ContactManager____destroy___p0"] = asm._emscripten_bind_b2ContactManager____destroy___p0;
var _emscripten_bind_b2GearJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2GearJoint__GetAnchorB_p0"] = asm._emscripten_bind_b2GearJoint__GetAnchorB_p0;
var _emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0;
var _emscripten_bind_b2PolygonShape__get_m_vertexCount_p0 = Module["_emscripten_bind_b2PolygonShape__get_m_vertexCount_p0"] = asm._emscripten_bind_b2PolygonShape__get_m_vertexCount_p0;
var _emscripten_bind_b2RevoluteJoint__GetReferenceAngle_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetReferenceAngle_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetReferenceAngle_p0;
var _emscripten_bind_b2DistanceJointDef__Initialize_p4 = Module["_emscripten_bind_b2DistanceJointDef__Initialize_p4"] = asm._emscripten_bind_b2DistanceJointDef__Initialize_p4;
var _emscripten_bind_b2World__IsLocked_p0 = Module["_emscripten_bind_b2World__IsLocked_p0"] = asm._emscripten_bind_b2World__IsLocked_p0;
var _emscripten_bind_b2ContactEdge__get_prev_p0 = Module["_emscripten_bind_b2ContactEdge__get_prev_p0"] = asm._emscripten_bind_b2ContactEdge__get_prev_p0;
var _emscripten_bind_b2Joint__GetReactionForce_p1 = Module["_emscripten_bind_b2Joint__GetReactionForce_p1"] = asm._emscripten_bind_b2Joint__GetReactionForce_p1;
var _emscripten_bind_b2WeldJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2WeldJointDef__get_collideConnected_p1"] = asm._emscripten_bind_b2WeldJointDef__get_collideConnected_p1;
var _emscripten_bind_b2Draw__AppendFlags_p1 = Module["_emscripten_bind_b2Draw__AppendFlags_p1"] = asm._emscripten_bind_b2Draw__AppendFlags_p1;
var _emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0;
var _emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1;
var _emscripten_bind_b2PrismaticJoint__EnableMotor_p1 = Module["_emscripten_bind_b2PrismaticJoint__EnableMotor_p1"] = asm._emscripten_bind_b2PrismaticJoint__EnableMotor_p1;
var _emscripten_bind_b2PrismaticJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2PrismaticJoint__GetReactionForce_p1"] = asm._emscripten_bind_b2PrismaticJoint__GetReactionForce_p1;
var _emscripten_bind_b2Shape__RayCast_p4 = Module["_emscripten_bind_b2Shape__RayCast_p4"] = asm._emscripten_bind_b2Shape__RayCast_p4;
var _emscripten_bind_b2GearJoint__Dump_p0 = Module["_emscripten_bind_b2GearJoint__Dump_p0"] = asm._emscripten_bind_b2GearJoint__Dump_p0;
var _emscripten_bind_b2Body__DestroyFixture_p1 = Module["_emscripten_bind_b2Body__DestroyFixture_p1"] = asm._emscripten_bind_b2Body__DestroyFixture_p1;
var _emscripten_bind_b2Body__SetActive_p1 = Module["_emscripten_bind_b2Body__SetActive_p1"] = asm._emscripten_bind_b2Body__SetActive_p1;
var _emscripten_bind_b2PrismaticJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetCollideConnected_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetCollideConnected_p0;
var _emscripten_bind_b2ContactListener____destroy___p0 = Module["_emscripten_bind_b2ContactListener____destroy___p0"] = asm._emscripten_bind_b2ContactListener____destroy___p0;
var _emscripten_bind_b2MouseJoint__SetDampingRatio_p1 = Module["_emscripten_bind_b2MouseJoint__SetDampingRatio_p1"] = asm._emscripten_bind_b2MouseJoint__SetDampingRatio_p1;
var _emscripten_bind_b2Body__ApplyTorque_p1 = Module["_emscripten_bind_b2Body__ApplyTorque_p1"] = asm._emscripten_bind_b2Body__ApplyTorque_p1;
var _emscripten_bind_b2DistanceProxy__GetVertexCount_p0 = Module["_emscripten_bind_b2DistanceProxy__GetVertexCount_p0"] = asm._emscripten_bind_b2DistanceProxy__GetVertexCount_p0;
var _emscripten_bind_b2PulleyJoint__GetRatio_p0 = Module["_emscripten_bind_b2PulleyJoint__GetRatio_p0"] = asm._emscripten_bind_b2PulleyJoint__GetRatio_p0;
var _emscripten_bind_b2FixtureDef__set_density_p1 = Module["_emscripten_bind_b2FixtureDef__set_density_p1"] = asm._emscripten_bind_b2FixtureDef__set_density_p1;
var _emscripten_bind_b2RopeJoint__b2RopeJoint_p1 = Module["_emscripten_bind_b2RopeJoint__b2RopeJoint_p1"] = asm._emscripten_bind_b2RopeJoint__b2RopeJoint_p1;
var _emscripten_bind_b2FixtureDef__get_filter_p0 = Module["_emscripten_bind_b2FixtureDef__get_filter_p0"] = asm._emscripten_bind_b2FixtureDef__get_filter_p0;
var _emscripten_bind_b2WheelJoint__GetUserData_p0 = Module["_emscripten_bind_b2WheelJoint__GetUserData_p0"] = asm._emscripten_bind_b2WheelJoint__GetUserData_p0;
var _emscripten_bind_b2GearJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2GearJointDef__set_collideConnected_p1"] = asm._emscripten_bind_b2GearJointDef__set_collideConnected_p1;
var _emscripten_bind_b2GearJoint____destroy___p0 = Module["_emscripten_bind_b2GearJoint____destroy___p0"] = asm._emscripten_bind_b2GearJoint____destroy___p0;
var _emscripten_bind_b2Body__GetAngularVelocity_p0 = Module["_emscripten_bind_b2Body__GetAngularVelocity_p0"] = asm._emscripten_bind_b2Body__GetAngularVelocity_p0;
var _emscripten_bind_b2DistanceJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2DistanceJointDef__get_bodyA_p1"] = asm._emscripten_bind_b2DistanceJointDef__get_bodyA_p1;
var _emscripten_bind_b2RevoluteJoint__EnableMotor_p1 = Module["_emscripten_bind_b2RevoluteJoint__EnableMotor_p1"] = asm._emscripten_bind_b2RevoluteJoint__EnableMotor_p1;
var _emscripten_bind_b2Body__SetType_p1 = Module["_emscripten_bind_b2Body__SetType_p1"] = asm._emscripten_bind_b2Body__SetType_p1;
var _emscripten_bind_b2PolygonShape__set_m_vertexCount_p1 = Module["_emscripten_bind_b2PolygonShape__set_m_vertexCount_p1"] = asm._emscripten_bind_b2PolygonShape__set_m_vertexCount_p1;
var _emscripten_bind_b2RopeJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2RopeJointDef__set_collideConnected_p1"] = asm._emscripten_bind_b2RopeJointDef__set_collideConnected_p1;
var _emscripten_bind_b2FrictionJoint__GetBodyB_p0 = Module["_emscripten_bind_b2FrictionJoint__GetBodyB_p0"] = asm._emscripten_bind_b2FrictionJoint__GetBodyB_p0;
var _emscripten_bind_b2RevoluteJoint__IsLimitEnabled_p0 = Module["_emscripten_bind_b2RevoluteJoint__IsLimitEnabled_p0"] = asm._emscripten_bind_b2RevoluteJoint__IsLimitEnabled_p0;
var _emscripten_bind_b2FrictionJointDef__set_maxForce_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_maxForce_p1"] = asm._emscripten_bind_b2FrictionJointDef__set_maxForce_p1;
var _emscripten_bind_b2Timer__GetMilliseconds_p0 = Module["_emscripten_bind_b2Timer__GetMilliseconds_p0"] = asm._emscripten_bind_b2Timer__GetMilliseconds_p0;
var _emscripten_bind_b2WheelJointDef__get_enableMotor_p0 = Module["_emscripten_bind_b2WheelJointDef__get_enableMotor_p0"] = asm._emscripten_bind_b2WheelJointDef__get_enableMotor_p0;
var _emscripten_bind_b2RevoluteJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2RevoluteJointDef__get_bodyB_p1"] = asm._emscripten_bind_b2RevoluteJointDef__get_bodyB_p1;
var _emscripten_bind_b2PolygonShape__GetChildCount_p0 = Module["_emscripten_bind_b2PolygonShape__GetChildCount_p0"] = asm._emscripten_bind_b2PolygonShape__GetChildCount_p0;
var _emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0 = Module["_emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0"] = asm._emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0;
var _emscripten_bind_b2ContactEdge__set_other_p1 = Module["_emscripten_bind_b2ContactEdge__set_other_p1"] = asm._emscripten_bind_b2ContactEdge__set_other_p1;
var _emscripten_bind_b2Body__GetMassData_p1 = Module["_emscripten_bind_b2Body__GetMassData_p1"] = asm._emscripten_bind_b2Body__GetMassData_p1;
var _emscripten_bind_b2Joint__GetNext_p0 = Module["_emscripten_bind_b2Joint__GetNext_p0"] = asm._emscripten_bind_b2Joint__GetNext_p0;
var _emscripten_bind_b2WeldJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2WeldJoint__GetReactionForce_p1"] = asm._emscripten_bind_b2WeldJoint__GetReactionForce_p1;
var _emscripten_bind_b2RevoluteJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetAnchorA_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetAnchorA_p0;
var _emscripten_bind_b2Filter__set_groupIndex_p1 = Module["_emscripten_bind_b2Filter__set_groupIndex_p1"] = asm._emscripten_bind_b2Filter__set_groupIndex_p1;
var _emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1;
var _emscripten_bind_b2FrictionJoint__SetMaxForce_p1 = Module["_emscripten_bind_b2FrictionJoint__SetMaxForce_p1"] = asm._emscripten_bind_b2FrictionJoint__SetMaxForce_p1;
var _malloc = Module["_malloc"] = asm._malloc;
var _emscripten_bind_b2MouseJoint__b2MouseJoint_p1 = Module["_emscripten_bind_b2MouseJoint__b2MouseJoint_p1"] = asm._emscripten_bind_b2MouseJoint__b2MouseJoint_p1;
var _emscripten_bind_b2MouseJoint__Dump_p0 = Module["_emscripten_bind_b2MouseJoint__Dump_p0"] = asm._emscripten_bind_b2MouseJoint__Dump_p0;
var _emscripten_bind_b2FixtureDef__set_restitution_p1 = Module["_emscripten_bind_b2FixtureDef__set_restitution_p1"] = asm._emscripten_bind_b2FixtureDef__set_restitution_p1;
var _emscripten_bind_b2Shape__GetChildCount_p0 = Module["_emscripten_bind_b2Shape__GetChildCount_p0"] = asm._emscripten_bind_b2Shape__GetChildCount_p0;
var _emscripten_bind_b2Body__GetJointList_p0 = Module["_emscripten_bind_b2Body__GetJointList_p0"] = asm._emscripten_bind_b2Body__GetJointList_p0;
var _emscripten_bind_b2Timer____destroy___p0 = Module["_emscripten_bind_b2Timer____destroy___p0"] = asm._emscripten_bind_b2Timer____destroy___p0;
var _emscripten_bind_b2Vec2__IsValid_p0 = Module["_emscripten_bind_b2Vec2__IsValid_p0"] = asm._emscripten_bind_b2Vec2__IsValid_p0;
var _emscripten_bind_b2Contact__ResetRestitution_p0 = Module["_emscripten_bind_b2Contact__ResetRestitution_p0"] = asm._emscripten_bind_b2Contact__ResetRestitution_p0;
var _emscripten_bind_b2RevoluteJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2RevoluteJointDef__get_collideConnected_p1"] = asm._emscripten_bind_b2RevoluteJointDef__get_collideConnected_p1;
var _emscripten_bind_b2DynamicTree__MoveProxy_p3 = Module["_emscripten_bind_b2DynamicTree__MoveProxy_p3"] = asm._emscripten_bind_b2DynamicTree__MoveProxy_p3;
var _emscripten_bind_b2Transform__b2Transform_p0 = Module["_emscripten_bind_b2Transform__b2Transform_p0"] = asm._emscripten_bind_b2Transform__b2Transform_p0;
var _emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0"] = asm._emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0;
var _emscripten_bind_b2RevoluteJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2RevoluteJointDef__get_bodyA_p1"] = asm._emscripten_bind_b2RevoluteJointDef__get_bodyA_p1;
var _emscripten_bind_b2WheelJointDef____destroy___p0 = Module["_emscripten_bind_b2WheelJointDef____destroy___p0"] = asm._emscripten_bind_b2WheelJointDef____destroy___p0;
var _emscripten_bind_b2MouseJoint__GetBodyA_p0 = Module["_emscripten_bind_b2MouseJoint__GetBodyA_p0"] = asm._emscripten_bind_b2MouseJoint__GetBodyA_p0;
var _emscripten_bind_b2GearJoint__GetType_p0 = Module["_emscripten_bind_b2GearJoint__GetType_p0"] = asm._emscripten_bind_b2GearJoint__GetType_p0;
var _emscripten_bind_b2Body__SetMassData_p1 = Module["_emscripten_bind_b2Body__SetMassData_p1"] = asm._emscripten_bind_b2Body__SetMassData_p1;
var _emscripten_bind_b2MouseJoint__IsActive_p0 = Module["_emscripten_bind_b2MouseJoint__IsActive_p0"] = asm._emscripten_bind_b2MouseJoint__IsActive_p0;
var _emscripten_bind_b2Contact__GetChildIndexA_p0 = Module["_emscripten_bind_b2Contact__GetChildIndexA_p0"] = asm._emscripten_bind_b2Contact__GetChildIndexA_p0;
var _emscripten_bind_b2Fixture__GetShape_p0 = Module["_emscripten_bind_b2Fixture__GetShape_p0"] = asm._emscripten_bind_b2Fixture__GetShape_p0;
var _emscripten_bind_b2DistanceProxy__set_m_radius_p1 = Module["_emscripten_bind_b2DistanceProxy__set_m_radius_p1"] = asm._emscripten_bind_b2DistanceProxy__set_m_radius_p1;
var _emscripten_bind_b2DistanceJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2DistanceJointDef__get_bodyB_p1"] = asm._emscripten_bind_b2DistanceJointDef__get_bodyB_p1;
var _emscripten_bind_b2RevoluteJoint__GetLowerLimit_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetLowerLimit_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetLowerLimit_p0;
var _emscripten_bind_b2World__DestroyJoint_p1 = Module["_emscripten_bind_b2World__DestroyJoint_p1"] = asm._emscripten_bind_b2World__DestroyJoint_p1;
var _emscripten_bind_b2PulleyJointDef__set_ratio_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_ratio_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_ratio_p1;
var _emscripten_bind_b2DynamicTree__b2DynamicTree_p0 = Module["_emscripten_bind_b2DynamicTree__b2DynamicTree_p0"] = asm._emscripten_bind_b2DynamicTree__b2DynamicTree_p0;
var _emscripten_bind_b2RopeJoint__GetType_p0 = Module["_emscripten_bind_b2RopeJoint__GetType_p0"] = asm._emscripten_bind_b2RopeJoint__GetType_p0;
var _emscripten_bind_b2Body__GetLocalPoint_p1 = Module["_emscripten_bind_b2Body__GetLocalPoint_p1"] = asm._emscripten_bind_b2Body__GetLocalPoint_p1;
var _emscripten_bind_b2World__GetBodyCount_p0 = Module["_emscripten_bind_b2World__GetBodyCount_p0"] = asm._emscripten_bind_b2World__GetBodyCount_p0;
var _emscripten_bind_b2CircleShape__GetType_p0 = Module["_emscripten_bind_b2CircleShape__GetType_p0"] = asm._emscripten_bind_b2CircleShape__GetType_p0;
var _emscripten_bind_b2DistanceProxy__get_m_radius_p0 = Module["_emscripten_bind_b2DistanceProxy__get_m_radius_p0"] = asm._emscripten_bind_b2DistanceProxy__get_m_radius_p0;
var _emscripten_bind_b2World__ClearForces_p0 = Module["_emscripten_bind_b2World__ClearForces_p0"] = asm._emscripten_bind_b2World__ClearForces_p0;
var _emscripten_bind_b2DynamicTree____destroy___p0 = Module["_emscripten_bind_b2DynamicTree____destroy___p0"] = asm._emscripten_bind_b2DynamicTree____destroy___p0;
var _emscripten_bind_b2Contact__GetWorldManifold_p1 = Module["_emscripten_bind_b2Contact__GetWorldManifold_p1"] = asm._emscripten_bind_b2Contact__GetWorldManifold_p1;
var _emscripten_bind_b2DynamicTree__GetUserData_p1 = Module["_emscripten_bind_b2DynamicTree__GetUserData_p1"] = asm._emscripten_bind_b2DynamicTree__GetUserData_p1;
var _emscripten_bind_b2JointDef____destroy___p0 = Module["_emscripten_bind_b2JointDef____destroy___p0"] = asm._emscripten_bind_b2JointDef____destroy___p0;
var _emscripten_bind_b2DistanceProxy__GetVertex_p1 = Module["_emscripten_bind_b2DistanceProxy__GetVertex_p1"] = asm._emscripten_bind_b2DistanceProxy__GetVertex_p1;
var _emscripten_bind_b2Draw__GetFlags_p0 = Module["_emscripten_bind_b2Draw__GetFlags_p0"] = asm._emscripten_bind_b2Draw__GetFlags_p0;
var _emscripten_bind_b2PolygonShape__Set_p2 = Module["_emscripten_bind_b2PolygonShape__Set_p2"] = asm._emscripten_bind_b2PolygonShape__Set_p2;
var _emscripten_bind_b2DistanceJoint____destroy___p0 = Module["_emscripten_bind_b2DistanceJoint____destroy___p0"] = asm._emscripten_bind_b2DistanceJoint____destroy___p0;
var _emscripten_bind_b2DestructionListener__SayGoodbye_p1 = Module["_emscripten_bind_b2DestructionListener__SayGoodbye_p1"] = asm._emscripten_bind_b2DestructionListener__SayGoodbye_p1;
var _emscripten_bind_b2BodyDef____destroy___p0 = Module["_emscripten_bind_b2BodyDef____destroy___p0"] = asm._emscripten_bind_b2BodyDef____destroy___p0;
var _emscripten_bind_b2EdgeShape____destroy___p0 = Module["_emscripten_bind_b2EdgeShape____destroy___p0"] = asm._emscripten_bind_b2EdgeShape____destroy___p0;
var _emscripten_bind_b2GearJointDef__get_ratio_p0 = Module["_emscripten_bind_b2GearJointDef__get_ratio_p0"] = asm._emscripten_bind_b2GearJointDef__get_ratio_p0;
var _emscripten_bind_b2BlockAllocator__Clear_p0 = Module["_emscripten_bind_b2BlockAllocator__Clear_p0"] = asm._emscripten_bind_b2BlockAllocator__Clear_p0;
var _emscripten_bind_b2RopeJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2RopeJoint__GetAnchorB_p0"] = asm._emscripten_bind_b2RopeJoint__GetAnchorB_p0;
var _emscripten_bind_b2BodyDef__set_type_p1 = Module["_emscripten_bind_b2BodyDef__set_type_p1"] = asm._emscripten_bind_b2BodyDef__set_type_p1;
var _emscripten_bind_b2WheelJoint__EnableMotor_p1 = Module["_emscripten_bind_b2WheelJoint__EnableMotor_p1"] = asm._emscripten_bind_b2WheelJoint__EnableMotor_p1;
var _emscripten_bind_b2FrictionJoint__GetBodyA_p0 = Module["_emscripten_bind_b2FrictionJoint__GetBodyA_p0"] = asm._emscripten_bind_b2FrictionJoint__GetBodyA_p0;
var _emscripten_bind_b2RopeJoint__GetBodyA_p0 = Module["_emscripten_bind_b2RopeJoint__GetBodyA_p0"] = asm._emscripten_bind_b2RopeJoint__GetBodyA_p0;
var _emscripten_bind_b2WheelJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2WheelJointDef__get_bodyA_p1"] = asm._emscripten_bind_b2WheelJointDef__get_bodyA_p1;
var _emscripten_bind_b2RopeJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2RopeJoint__GetAnchorA_p0"] = asm._emscripten_bind_b2RopeJoint__GetAnchorA_p0;
var _emscripten_bind_b2GearJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2GearJointDef__get_collideConnected_p1"] = asm._emscripten_bind_b2GearJointDef__get_collideConnected_p1;
var _emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0;
var _emscripten_bind_b2WeldJoint__GetLocalAnchorB_p0 = Module["_emscripten_bind_b2WeldJoint__GetLocalAnchorB_p0"] = asm._emscripten_bind_b2WeldJoint__GetLocalAnchorB_p0;
var _emscripten_bind_b2PolygonShape__set_m_radius_p1 = Module["_emscripten_bind_b2PolygonShape__set_m_radius_p1"] = asm._emscripten_bind_b2PolygonShape__set_m_radius_p1;
var _emscripten_bind_b2Vec2__SetZero_p0 = Module["_emscripten_bind_b2Vec2__SetZero_p0"] = asm._emscripten_bind_b2Vec2__SetZero_p0;
var _emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0 = Module["_emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0"] = asm._emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0;
var _emscripten_bind_b2ChainShape__CreateLoop_p2 = Module["_emscripten_bind_b2ChainShape__CreateLoop_p2"] = asm._emscripten_bind_b2ChainShape__CreateLoop_p2;
var _emscripten_bind_b2RevoluteJoint__GetNext_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetNext_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetNext_p0;
var _emscripten_bind_b2World__DestroyBody_p1 = Module["_emscripten_bind_b2World__DestroyBody_p1"] = asm._emscripten_bind_b2World__DestroyBody_p1;
var _emscripten_bind_b2World__SetSubStepping_p1 = Module["_emscripten_bind_b2World__SetSubStepping_p1"] = asm._emscripten_bind_b2World__SetSubStepping_p1;
var _emscripten_bind_b2PulleyJoint__SetUserData_p1 = Module["_emscripten_bind_b2PulleyJoint__SetUserData_p1"] = asm._emscripten_bind_b2PulleyJoint__SetUserData_p1;
var _emscripten_bind_b2WheelJoint__GetMotorSpeed_p0 = Module["_emscripten_bind_b2WheelJoint__GetMotorSpeed_p0"] = asm._emscripten_bind_b2WheelJoint__GetMotorSpeed_p0;
var _emscripten_bind_b2RopeJoint__GetLimitState_p0 = Module["_emscripten_bind_b2RopeJoint__GetLimitState_p0"] = asm._emscripten_bind_b2RopeJoint__GetLimitState_p0;
var _emscripten_bind_b2PrismaticJointDef____destroy___p0 = Module["_emscripten_bind_b2PrismaticJointDef____destroy___p0"] = asm._emscripten_bind_b2PrismaticJointDef____destroy___p0;
var _emscripten_bind_b2PulleyJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_collideConnected_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_collideConnected_p1;
var _emscripten_bind_b2WheelJoint__GetNext_p0 = Module["_emscripten_bind_b2WheelJoint__GetNext_p0"] = asm._emscripten_bind_b2WheelJoint__GetNext_p0;
var _emscripten_bind_b2World__SetContactFilter_p1 = Module["_emscripten_bind_b2World__SetContactFilter_p1"] = asm._emscripten_bind_b2World__SetContactFilter_p1;
var _emscripten_bind_b2BroadPhase__GetFatAABB_p1 = Module["_emscripten_bind_b2BroadPhase__GetFatAABB_p1"] = asm._emscripten_bind_b2BroadPhase__GetFatAABB_p1;
var _emscripten_bind_b2FrictionJoint__SetMaxTorque_p1 = Module["_emscripten_bind_b2FrictionJoint__SetMaxTorque_p1"] = asm._emscripten_bind_b2FrictionJoint__SetMaxTorque_p1;
var _emscripten_bind_b2ContactManager__set_m_contactCount_p1 = Module["_emscripten_bind_b2ContactManager__set_m_contactCount_p1"] = asm._emscripten_bind_b2ContactManager__set_m_contactCount_p1;
var _emscripten_bind_b2Body__GetLinearVelocity_p0 = Module["_emscripten_bind_b2Body__GetLinearVelocity_p0"] = asm._emscripten_bind_b2Body__GetLinearVelocity_p0;
var _emscripten_bind_b2ContactManager__get_m_allocator_p0 = Module["_emscripten_bind_b2ContactManager__get_m_allocator_p0"] = asm._emscripten_bind_b2ContactManager__get_m_allocator_p0;
var _emscripten_bind_b2AABB____destroy___p0 = Module["_emscripten_bind_b2AABB____destroy___p0"] = asm._emscripten_bind_b2AABB____destroy___p0;
var _emscripten_bind_b2PulleyJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2PulleyJoint__GetCollideConnected_p0"] = asm._emscripten_bind_b2PulleyJoint__GetCollideConnected_p0;
var _emscripten_bind_b2Joint__GetUserData_p0 = Module["_emscripten_bind_b2Joint__GetUserData_p0"] = asm._emscripten_bind_b2Joint__GetUserData_p0;
var _emscripten_bind_b2Rot__GetXAxis_p0 = Module["_emscripten_bind_b2Rot__GetXAxis_p0"] = asm._emscripten_bind_b2Rot__GetXAxis_p0;
var _emscripten_bind_b2ContactManager__get_m_contactCount_p0 = Module["_emscripten_bind_b2ContactManager__get_m_contactCount_p0"] = asm._emscripten_bind_b2ContactManager__get_m_contactCount_p0;
var _emscripten_bind_b2DistanceJoint__Dump_p0 = Module["_emscripten_bind_b2DistanceJoint__Dump_p0"] = asm._emscripten_bind_b2DistanceJoint__Dump_p0;
var _emscripten_bind_b2PolygonShape__GetVertexCount_p0 = Module["_emscripten_bind_b2PolygonShape__GetVertexCount_p0"] = asm._emscripten_bind_b2PolygonShape__GetVertexCount_p0;
var _emscripten_bind_b2StackAllocator__Free_p1 = Module["_emscripten_bind_b2StackAllocator__Free_p1"] = asm._emscripten_bind_b2StackAllocator__Free_p1;
var _emscripten_bind_b2CircleShape__GetSupportVertex_p1 = Module["_emscripten_bind_b2CircleShape__GetSupportVertex_p1"] = asm._emscripten_bind_b2CircleShape__GetSupportVertex_p1;
var _emscripten_bind_b2DistanceProxy__GetSupportVertex_p1 = Module["_emscripten_bind_b2DistanceProxy__GetSupportVertex_p1"] = asm._emscripten_bind_b2DistanceProxy__GetSupportVertex_p1;
var _emscripten_bind_b2DistanceJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_bodyA_p1"] = asm._emscripten_bind_b2DistanceJointDef__set_bodyA_p1;
var _emscripten_bind_b2JointDef__set_userData_p1 = Module["_emscripten_bind_b2JointDef__set_userData_p1"] = asm._emscripten_bind_b2JointDef__set_userData_p1;
var _emscripten_bind_b2GearJoint__GetBodyB_p0 = Module["_emscripten_bind_b2GearJoint__GetBodyB_p0"] = asm._emscripten_bind_b2GearJoint__GetBodyB_p0;
var _emscripten_bind_b2Vec3__get_z_p0 = Module["_emscripten_bind_b2Vec3__get_z_p0"] = asm._emscripten_bind_b2Vec3__get_z_p0;
var _emscripten_bind_b2RopeJoint__GetUserData_p0 = Module["_emscripten_bind_b2RopeJoint__GetUserData_p0"] = asm._emscripten_bind_b2RopeJoint__GetUserData_p0;
var _emscripten_bind_b2GearJoint__GetUserData_p0 = Module["_emscripten_bind_b2GearJoint__GetUserData_p0"] = asm._emscripten_bind_b2GearJoint__GetUserData_p0;
var _emscripten_bind_b2FixtureDef__get_restitution_p0 = Module["_emscripten_bind_b2FixtureDef__get_restitution_p0"] = asm._emscripten_bind_b2FixtureDef__get_restitution_p0;
var _emscripten_bind_b2WheelJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2WheelJoint__GetAnchorB_p0"] = asm._emscripten_bind_b2WheelJoint__GetAnchorB_p0;
var _emscripten_bind_b2FixtureDef__b2FixtureDef_p0 = Module["_emscripten_bind_b2FixtureDef__b2FixtureDef_p0"] = asm._emscripten_bind_b2FixtureDef__b2FixtureDef_p0;
var _emscripten_bind_b2WheelJointDef__get_motorSpeed_p0 = Module["_emscripten_bind_b2WheelJointDef__get_motorSpeed_p0"] = asm._emscripten_bind_b2WheelJointDef__get_motorSpeed_p0;
var _emscripten_bind_b2FrictionJoint__b2FrictionJoint_p1 = Module["_emscripten_bind_b2FrictionJoint__b2FrictionJoint_p1"] = asm._emscripten_bind_b2FrictionJoint__b2FrictionJoint_p1;
var _emscripten_bind_b2Body__GetAngularDamping_p0 = Module["_emscripten_bind_b2Body__GetAngularDamping_p0"] = asm._emscripten_bind_b2Body__GetAngularDamping_p0;
var _emscripten_bind_b2ChainShape__GetChildCount_p0 = Module["_emscripten_bind_b2ChainShape__GetChildCount_p0"] = asm._emscripten_bind_b2ChainShape__GetChildCount_p0;
var _emscripten_bind_b2ChainShape__SetNextVertex_p1 = Module["_emscripten_bind_b2ChainShape__SetNextVertex_p1"] = asm._emscripten_bind_b2ChainShape__SetNextVertex_p1;
var _emscripten_bind_b2Joint__GetBodyA_p0 = Module["_emscripten_bind_b2Joint__GetBodyA_p0"] = asm._emscripten_bind_b2Joint__GetBodyA_p0;
var _emscripten_bind_b2Fixture__IsSensor_p0 = Module["_emscripten_bind_b2Fixture__IsSensor_p0"] = asm._emscripten_bind_b2Fixture__IsSensor_p0;
var _emscripten_bind_b2Filter__set_maskBits_p1 = Module["_emscripten_bind_b2Filter__set_maskBits_p1"] = asm._emscripten_bind_b2Filter__set_maskBits_p1;
var _emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1;
var _emscripten_bind_b2ContactListener__PreSolve_p2 = Module["_emscripten_bind_b2ContactListener__PreSolve_p2"] = asm._emscripten_bind_b2ContactListener__PreSolve_p2;
var _emscripten_bind_b2WheelJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2WheelJointDef__get_localAnchorB_p0"] = asm._emscripten_bind_b2WheelJointDef__get_localAnchorB_p0;
var _emscripten_bind_b2WheelJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2WheelJointDef__set_bodyB_p1"] = asm._emscripten_bind_b2WheelJointDef__set_bodyB_p1;
var _emscripten_bind_b2BroadPhase__MoveProxy_p3 = Module["_emscripten_bind_b2BroadPhase__MoveProxy_p3"] = asm._emscripten_bind_b2BroadPhase__MoveProxy_p3;
var _emscripten_bind_b2BodyDef__get_active_p0 = Module["_emscripten_bind_b2BodyDef__get_active_p0"] = asm._emscripten_bind_b2BodyDef__get_active_p0;
var _emscripten_bind_b2CircleShape__GetVertexCount_p0 = Module["_emscripten_bind_b2CircleShape__GetVertexCount_p0"] = asm._emscripten_bind_b2CircleShape__GetVertexCount_p0;
var _emscripten_bind_b2Timer__Reset_p0 = Module["_emscripten_bind_b2Timer__Reset_p0"] = asm._emscripten_bind_b2Timer__Reset_p0;
var _emscripten_bind_b2QueryCallback____destroy___p0 = Module["_emscripten_bind_b2QueryCallback____destroy___p0"] = asm._emscripten_bind_b2QueryCallback____destroy___p0;
var _emscripten_bind_b2World__b2World_p1 = Module["_emscripten_bind_b2World__b2World_p1"] = asm._emscripten_bind_b2World__b2World_p1;
var _emscripten_bind_b2Vec3__Set_p3 = Module["_emscripten_bind_b2Vec3__Set_p3"] = asm._emscripten_bind_b2Vec3__Set_p3;
var _emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0;
var _emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1;
var _emscripten_bind_b2StackAllocator____destroy___p0 = Module["_emscripten_bind_b2StackAllocator____destroy___p0"] = asm._emscripten_bind_b2StackAllocator____destroy___p0;
var _emscripten_bind_b2ContactEdge__get_other_p0 = Module["_emscripten_bind_b2ContactEdge__get_other_p0"] = asm._emscripten_bind_b2ContactEdge__get_other_p0;
var _emscripten_bind_b2Fixture__GetType_p0 = Module["_emscripten_bind_b2Fixture__GetType_p0"] = asm._emscripten_bind_b2Fixture__GetType_p0;
var _emscripten_bind_b2ContactListener__PostSolve_p2 = Module["_emscripten_bind_b2ContactListener__PostSolve_p2"] = asm._emscripten_bind_b2ContactListener__PostSolve_p2;
var _emscripten_bind_b2WeldJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2WeldJointDef__set_collideConnected_p1"] = asm._emscripten_bind_b2WeldJointDef__set_collideConnected_p1;
var _emscripten_bind_b2Contact__SetRestitution_p1 = Module["_emscripten_bind_b2Contact__SetRestitution_p1"] = asm._emscripten_bind_b2Contact__SetRestitution_p1;
var _emscripten_bind_b2Body__GetInertia_p0 = Module["_emscripten_bind_b2Body__GetInertia_p0"] = asm._emscripten_bind_b2Body__GetInertia_p0;
var _emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0 = Module["_emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0"] = asm._emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0;
var _emscripten_bind_b2PolygonShape__get_m_centroid_p0 = Module["_emscripten_bind_b2PolygonShape__get_m_centroid_p0"] = asm._emscripten_bind_b2PolygonShape__get_m_centroid_p0;
var _emscripten_bind_b2PrismaticJoint__IsMotorEnabled_p0 = Module["_emscripten_bind_b2PrismaticJoint__IsMotorEnabled_p0"] = asm._emscripten_bind_b2PrismaticJoint__IsMotorEnabled_p0;
var _emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0"] = asm._emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0;
var _emscripten_bind_b2Draw__SetFlags_p1 = Module["_emscripten_bind_b2Draw__SetFlags_p1"] = asm._emscripten_bind_b2Draw__SetFlags_p1;
var _emscripten_bind_b2WeldJoint__GetUserData_p0 = Module["_emscripten_bind_b2WeldJoint__GetUserData_p0"] = asm._emscripten_bind_b2WeldJoint__GetUserData_p0;
var _emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0 = Module["_emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0"] = asm._emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0;
var _emscripten_bind_b2FrictionJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_collideConnected_p1"] = asm._emscripten_bind_b2FrictionJointDef__set_collideConnected_p1;
var _emscripten_bind_b2World__SetAllowSleeping_p1 = Module["_emscripten_bind_b2World__SetAllowSleeping_p1"] = asm._emscripten_bind_b2World__SetAllowSleeping_p1;
var _emscripten_bind_b2BodyDef__set_gravityScale_p1 = Module["_emscripten_bind_b2BodyDef__set_gravityScale_p1"] = asm._emscripten_bind_b2BodyDef__set_gravityScale_p1;
var _emscripten_bind_b2Contact__IsTouching_p0 = Module["_emscripten_bind_b2Contact__IsTouching_p0"] = asm._emscripten_bind_b2Contact__IsTouching_p0;
var _emscripten_bind_b2Transform__set_q_p1 = Module["_emscripten_bind_b2Transform__set_q_p1"] = asm._emscripten_bind_b2Transform__set_q_p1;
var _emscripten_bind_b2FrictionJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2FrictionJoint__GetAnchorB_p0"] = asm._emscripten_bind_b2FrictionJoint__GetAnchorB_p0;
var _emscripten_bind_b2World__RayCast_p3 = Module["_emscripten_bind_b2World__RayCast_p3"] = asm._emscripten_bind_b2World__RayCast_p3;
var _emscripten_bind_b2WeldJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2WeldJointDef__get_bodyA_p1"] = asm._emscripten_bind_b2WeldJointDef__get_bodyA_p1;
var _emscripten_bind_b2WheelJoint__GetMotorTorque_p1 = Module["_emscripten_bind_b2WheelJoint__GetMotorTorque_p1"] = asm._emscripten_bind_b2WheelJoint__GetMotorTorque_p1;
var _emscripten_bind_b2Draw__b2Draw_p0 = Module["_emscripten_bind_b2Draw__b2Draw_p0"] = asm._emscripten_bind_b2Draw__b2Draw_p0;
var _emscripten_bind_b2ChainShape____destroy___p0 = Module["_emscripten_bind_b2ChainShape____destroy___p0"] = asm._emscripten_bind_b2ChainShape____destroy___p0;
var _emscripten_bind_b2ChainShape__get_m_radius_p0 = Module["_emscripten_bind_b2ChainShape__get_m_radius_p0"] = asm._emscripten_bind_b2ChainShape__get_m_radius_p0;
var _emscripten_bind_b2RopeJoint__IsActive_p0 = Module["_emscripten_bind_b2RopeJoint__IsActive_p0"] = asm._emscripten_bind_b2RopeJoint__IsActive_p0;
var _emscripten_bind_b2EdgeShape__set_m_radius_p1 = Module["_emscripten_bind_b2EdgeShape__set_m_radius_p1"] = asm._emscripten_bind_b2EdgeShape__set_m_radius_p1;
var _emscripten_bind_b2DistanceJointDef__get_length_p0 = Module["_emscripten_bind_b2DistanceJointDef__get_length_p0"] = asm._emscripten_bind_b2DistanceJointDef__get_length_p0;
var _emscripten_bind_b2DistanceJoint__SetUserData_p1 = Module["_emscripten_bind_b2DistanceJoint__SetUserData_p1"] = asm._emscripten_bind_b2DistanceJoint__SetUserData_p1;
var _emscripten_bind_b2ContactManager__set_m_contactListener_p1 = Module["_emscripten_bind_b2ContactManager__set_m_contactListener_p1"] = asm._emscripten_bind_b2ContactManager__set_m_contactListener_p1;
var _emscripten_bind_b2MouseJointDef__get_maxForce_p0 = Module["_emscripten_bind_b2MouseJointDef__get_maxForce_p0"] = asm._emscripten_bind_b2MouseJointDef__get_maxForce_p0;
var _emscripten_bind_b2WheelJoint____destroy___p0 = Module["_emscripten_bind_b2WheelJoint____destroy___p0"] = asm._emscripten_bind_b2WheelJoint____destroy___p0;
var _emscripten_bind_b2PulleyJoint__GetBodyA_p0 = Module["_emscripten_bind_b2PulleyJoint__GetBodyA_p0"] = asm._emscripten_bind_b2PulleyJoint__GetBodyA_p0;
var _emscripten_bind_b2MouseJoint__SetMaxForce_p1 = Module["_emscripten_bind_b2MouseJoint__SetMaxForce_p1"] = asm._emscripten_bind_b2MouseJoint__SetMaxForce_p1;
var _emscripten_bind_b2World__GetGravity_p0 = Module["_emscripten_bind_b2World__GetGravity_p0"] = asm._emscripten_bind_b2World__GetGravity_p0;
var _emscripten_bind_b2WheelJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2WheelJointDef__set_bodyA_p1"] = asm._emscripten_bind_b2WheelJointDef__set_bodyA_p1;
var _emscripten_bind_b2AABB__b2AABB_p0 = Module["_emscripten_bind_b2AABB__b2AABB_p0"] = asm._emscripten_bind_b2AABB__b2AABB_p0;
var _emscripten_bind_b2DistanceProxy____destroy___p0 = Module["_emscripten_bind_b2DistanceProxy____destroy___p0"] = asm._emscripten_bind_b2DistanceProxy____destroy___p0;
var _emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1;
var _emscripten_bind_b2World__GetProfile_p0 = Module["_emscripten_bind_b2World__GetProfile_p0"] = asm._emscripten_bind_b2World__GetProfile_p0;
var _emscripten_bind_b2PulleyJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2PulleyJointDef__get_bodyA_p1"] = asm._emscripten_bind_b2PulleyJointDef__get_bodyA_p1;
var _emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1;
var _emscripten_bind_b2PolygonShape__Clone_p1 = Module["_emscripten_bind_b2PolygonShape__Clone_p1"] = asm._emscripten_bind_b2PolygonShape__Clone_p1;
var _emscripten_bind_b2PrismaticJoint__GetUserData_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetUserData_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetUserData_p0;
var _emscripten_bind_b2PrismaticJoint__IsLimitEnabled_p0 = Module["_emscripten_bind_b2PrismaticJoint__IsLimitEnabled_p0"] = asm._emscripten_bind_b2PrismaticJoint__IsLimitEnabled_p0;
var _emscripten_bind_b2PulleyJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2PulleyJoint__GetAnchorA_p0"] = asm._emscripten_bind_b2PulleyJoint__GetAnchorA_p0;
var _emscripten_bind_b2Fixture__Refilter_p0 = Module["_emscripten_bind_b2Fixture__Refilter_p0"] = asm._emscripten_bind_b2Fixture__Refilter_p0;
var _emscripten_bind_b2Vec3__SetZero_p0 = Module["_emscripten_bind_b2Vec3__SetZero_p0"] = asm._emscripten_bind_b2Vec3__SetZero_p0;
var _emscripten_bind_b2ContactListener__EndContact_p1 = Module["_emscripten_bind_b2ContactListener__EndContact_p1"] = asm._emscripten_bind_b2ContactListener__EndContact_p1;
var _emscripten_bind_b2Vec2__Normalize_p0 = Module["_emscripten_bind_b2Vec2__Normalize_p0"] = asm._emscripten_bind_b2Vec2__Normalize_p0;
var _emscripten_bind_b2Shape__ComputeMass_p2 = Module["_emscripten_bind_b2Shape__ComputeMass_p2"] = asm._emscripten_bind_b2Shape__ComputeMass_p2;
var _emscripten_bind_b2FrictionJoint__GetMaxForce_p0 = Module["_emscripten_bind_b2FrictionJoint__GetMaxForce_p0"] = asm._emscripten_bind_b2FrictionJoint__GetMaxForce_p0;
var _emscripten_bind_b2BodyDef__get_type_p0 = Module["_emscripten_bind_b2BodyDef__get_type_p0"] = asm._emscripten_bind_b2BodyDef__get_type_p0;
var _emscripten_bind_b2FixtureDef__get_userData_p0 = Module["_emscripten_bind_b2FixtureDef__get_userData_p0"] = asm._emscripten_bind_b2FixtureDef__get_userData_p0;
var _emscripten_bind_b2MouseJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2MouseJointDef__get_collideConnected_p1"] = asm._emscripten_bind_b2MouseJointDef__get_collideConnected_p1;
var _emscripten_bind_b2Contact__ResetFriction_p0 = Module["_emscripten_bind_b2Contact__ResetFriction_p0"] = asm._emscripten_bind_b2Contact__ResetFriction_p0;
var _emscripten_bind_b2WeldJointDef__Initialize_p3 = Module["_emscripten_bind_b2WeldJointDef__Initialize_p3"] = asm._emscripten_bind_b2WeldJointDef__Initialize_p3;
var _emscripten_bind_b2DistanceJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2DistanceJoint__GetCollideConnected_p0"] = asm._emscripten_bind_b2DistanceJoint__GetCollideConnected_p0;
var _emscripten_bind_b2Rot__Set_p1 = Module["_emscripten_bind_b2Rot__Set_p1"] = asm._emscripten_bind_b2Rot__Set_p1;
var _emscripten_bind_b2ChainShape__RayCast_p4 = Module["_emscripten_bind_b2ChainShape__RayCast_p4"] = asm._emscripten_bind_b2ChainShape__RayCast_p4;
var _emscripten_bind_b2RevoluteJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2RevoluteJoint__GetReactionForce_p1"] = asm._emscripten_bind_b2RevoluteJoint__GetReactionForce_p1;
var _emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0 = Module["_emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0"] = asm._emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0;
var _emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0"] = asm._emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0;
var _emscripten_bind_b2MouseJoint__GetMaxForce_p0 = Module["_emscripten_bind_b2MouseJoint__GetMaxForce_p0"] = asm._emscripten_bind_b2MouseJoint__GetMaxForce_p0;
var _emscripten_bind_b2RopeJoint__Dump_p0 = Module["_emscripten_bind_b2RopeJoint__Dump_p0"] = asm._emscripten_bind_b2RopeJoint__Dump_p0;
var _emscripten_bind_b2WheelJointDef__set_enableMotor_p1 = Module["_emscripten_bind_b2WheelJointDef__set_enableMotor_p1"] = asm._emscripten_bind_b2WheelJointDef__set_enableMotor_p1;
var _emscripten_bind_b2ContactManager__get_m_contactList_p0 = Module["_emscripten_bind_b2ContactManager__get_m_contactList_p0"] = asm._emscripten_bind_b2ContactManager__get_m_contactList_p0;
var _emscripten_bind_b2PolygonShape__ComputeAABB_p3 = Module["_emscripten_bind_b2PolygonShape__ComputeAABB_p3"] = asm._emscripten_bind_b2PolygonShape__ComputeAABB_p3;
var _emscripten_bind_b2RopeJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2RopeJointDef__set_bodyB_p1"] = asm._emscripten_bind_b2RopeJointDef__set_bodyB_p1;
var _emscripten_bind_b2BodyDef__set_fixedRotation_p1 = Module["_emscripten_bind_b2BodyDef__set_fixedRotation_p1"] = asm._emscripten_bind_b2BodyDef__set_fixedRotation_p1;
var _emscripten_bind_b2WheelJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2WheelJoint__GetAnchorA_p0"] = asm._emscripten_bind_b2WheelJoint__GetAnchorA_p0;
var _emscripten_bind_b2GearJoint__GetBodyA_p0 = Module["_emscripten_bind_b2GearJoint__GetBodyA_p0"] = asm._emscripten_bind_b2GearJoint__GetBodyA_p0;
var _emscripten_bind_b2CircleShape__b2CircleShape_p0 = Module["_emscripten_bind_b2CircleShape__b2CircleShape_p0"] = asm._emscripten_bind_b2CircleShape__b2CircleShape_p0;
var _emscripten_bind_b2EdgeShape__GetChildCount_p0 = Module["_emscripten_bind_b2EdgeShape__GetChildCount_p0"] = asm._emscripten_bind_b2EdgeShape__GetChildCount_p0;
var _emscripten_bind_b2BodyDef__set_active_p1 = Module["_emscripten_bind_b2BodyDef__set_active_p1"] = asm._emscripten_bind_b2BodyDef__set_active_p1;
var _emscripten_bind_b2FrictionJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2FrictionJointDef__get_bodyA_p1"] = asm._emscripten_bind_b2FrictionJointDef__get_bodyA_p1;
var _emscripten_bind_b2PulleyJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2PulleyJoint__GetReactionTorque_p1"] = asm._emscripten_bind_b2PulleyJoint__GetReactionTorque_p1;
var _emscripten_bind_b2DistanceJoint__b2DistanceJoint_p1 = Module["_emscripten_bind_b2DistanceJoint__b2DistanceJoint_p1"] = asm._emscripten_bind_b2DistanceJoint__b2DistanceJoint_p1;
var _emscripten_bind_b2Vec2____destroy___p0 = Module["_emscripten_bind_b2Vec2____destroy___p0"] = asm._emscripten_bind_b2Vec2____destroy___p0;
var _emscripten_bind_b2ChainShape__get_m_vertices_p0 = Module["_emscripten_bind_b2ChainShape__get_m_vertices_p0"] = asm._emscripten_bind_b2ChainShape__get_m_vertices_p0;
var _emscripten_bind_b2BodyDef__b2BodyDef_p0 = Module["_emscripten_bind_b2BodyDef__b2BodyDef_p0"] = asm._emscripten_bind_b2BodyDef__b2BodyDef_p0;
var _emscripten_bind_b2RevoluteJoint__Dump_p0 = Module["_emscripten_bind_b2RevoluteJoint__Dump_p0"] = asm._emscripten_bind_b2RevoluteJoint__Dump_p0;
var _emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0 = Module["_emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0"] = asm._emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0;
var _emscripten_bind_b2World__SetDebugDraw_p1 = Module["_emscripten_bind_b2World__SetDebugDraw_p1"] = asm._emscripten_bind_b2World__SetDebugDraw_p1;
var _emscripten_bind_b2MouseJoint____destroy___p0 = Module["_emscripten_bind_b2MouseJoint____destroy___p0"] = asm._emscripten_bind_b2MouseJoint____destroy___p0;
var _emscripten_bind_b2RevoluteJoint__IsMotorEnabled_p0 = Module["_emscripten_bind_b2RevoluteJoint__IsMotorEnabled_p0"] = asm._emscripten_bind_b2RevoluteJoint__IsMotorEnabled_p0;
var _emscripten_bind_b2MouseJointDef__set_frequencyHz_p1 = Module["_emscripten_bind_b2MouseJointDef__set_frequencyHz_p1"] = asm._emscripten_bind_b2MouseJointDef__set_frequencyHz_p1;
var _emscripten_bind_b2DestructionListener__b2DestructionListener_p0 = Module["_emscripten_bind_b2DestructionListener__b2DestructionListener_p0"] = asm._emscripten_bind_b2DestructionListener__b2DestructionListener_p0;
var _emscripten_bind_b2WheelJointDef__get_frequencyHz_p0 = Module["_emscripten_bind_b2WheelJointDef__get_frequencyHz_p0"] = asm._emscripten_bind_b2WheelJointDef__get_frequencyHz_p0;
var _emscripten_bind_b2Filter__b2Filter_p0 = Module["_emscripten_bind_b2Filter__b2Filter_p0"] = asm._emscripten_bind_b2Filter__b2Filter_p0;
var _emscripten_bind_b2World____destroy___p0 = Module["_emscripten_bind_b2World____destroy___p0"] = asm._emscripten_bind_b2World____destroy___p0;
var _emscripten_bind_b2Body__SetBullet_p1 = Module["_emscripten_bind_b2Body__SetBullet_p1"] = asm._emscripten_bind_b2Body__SetBullet_p1;
var _emscripten_bind_b2Body__GetAngle_p0 = Module["_emscripten_bind_b2Body__GetAngle_p0"] = asm._emscripten_bind_b2Body__GetAngle_p0;
var _emscripten_bind_b2PrismaticJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_bodyA_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_bodyA_p1;
var _emscripten_bind_b2MouseJoint__GetTarget_p0 = Module["_emscripten_bind_b2MouseJoint__GetTarget_p0"] = asm._emscripten_bind_b2MouseJoint__GetTarget_p0;
var _emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0 = Module["_emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0"] = asm._emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0;
var _emscripten_bind_b2Contact__GetNext_p0 = Module["_emscripten_bind_b2Contact__GetNext_p0"] = asm._emscripten_bind_b2Contact__GetNext_p0;
var _emscripten_bind_b2World__DrawDebugData_p0 = Module["_emscripten_bind_b2World__DrawDebugData_p0"] = asm._emscripten_bind_b2World__DrawDebugData_p0;
var _emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1;
var _emscripten_bind_b2Vec2__LengthSquared_p0 = Module["_emscripten_bind_b2Vec2__LengthSquared_p0"] = asm._emscripten_bind_b2Vec2__LengthSquared_p0;
var _emscripten_bind_b2WheelJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2WheelJointDef__get_localAnchorA_p0"] = asm._emscripten_bind_b2WheelJointDef__get_localAnchorA_p0;
var _emscripten_bind_b2RevoluteJoint____destroy___p0 = Module["_emscripten_bind_b2RevoluteJoint____destroy___p0"] = asm._emscripten_bind_b2RevoluteJoint____destroy___p0;
var _emscripten_bind_b2PulleyJointDef__get_lengthB_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_lengthB_p0"] = asm._emscripten_bind_b2PulleyJointDef__get_lengthB_p0;
var _emscripten_bind_b2WeldJoint__GetReferenceAngle_p0 = Module["_emscripten_bind_b2WeldJoint__GetReferenceAngle_p0"] = asm._emscripten_bind_b2WeldJoint__GetReferenceAngle_p0;
var _strlen = Module["_strlen"] = asm._strlen;
var _emscripten_bind_b2FixtureDef__set_filter_p1 = Module["_emscripten_bind_b2FixtureDef__set_filter_p1"] = asm._emscripten_bind_b2FixtureDef__set_filter_p1;
var _emscripten_bind_b2ChainShape__CreateChain_p2 = Module["_emscripten_bind_b2ChainShape__CreateChain_p2"] = asm._emscripten_bind_b2ChainShape__CreateChain_p2;
var _emscripten_bind_b2Body__GetLocalVector_p1 = Module["_emscripten_bind_b2Body__GetLocalVector_p1"] = asm._emscripten_bind_b2Body__GetLocalVector_p1;
var _emscripten_bind_b2Fixture__SetUserData_p1 = Module["_emscripten_bind_b2Fixture__SetUserData_p1"] = asm._emscripten_bind_b2Fixture__SetUserData_p1;
var _emscripten_bind_b2RevoluteJoint__GetLocalAnchorB_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetLocalAnchorB_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetLocalAnchorB_p0;
var _emscripten_bind_b2FrictionJointDef__set_maxTorque_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_maxTorque_p1"] = asm._emscripten_bind_b2FrictionJointDef__set_maxTorque_p1;
var _emscripten_bind_b2ChainShape__ComputeAABB_p3 = Module["_emscripten_bind_b2ChainShape__ComputeAABB_p3"] = asm._emscripten_bind_b2ChainShape__ComputeAABB_p3;
var _emscripten_bind_b2RopeJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2RopeJoint__GetReactionForce_p1"] = asm._emscripten_bind_b2RopeJoint__GetReactionForce_p1;
var _emscripten_bind_b2CircleShape__GetSupport_p1 = Module["_emscripten_bind_b2CircleShape__GetSupport_p1"] = asm._emscripten_bind_b2CircleShape__GetSupport_p1;
var _emscripten_bind_b2World__GetContinuousPhysics_p0 = Module["_emscripten_bind_b2World__GetContinuousPhysics_p0"] = asm._emscripten_bind_b2World__GetContinuousPhysics_p0;
var _emscripten_bind_b2FrictionJointDef__get_maxForce_p0 = Module["_emscripten_bind_b2FrictionJointDef__get_maxForce_p0"] = asm._emscripten_bind_b2FrictionJointDef__get_maxForce_p0;
var _emscripten_bind_b2Draw____destroy___p0 = Module["_emscripten_bind_b2Draw____destroy___p0"] = asm._emscripten_bind_b2Draw____destroy___p0;
var _emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1;
var _emscripten_bind_b2MouseJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2MouseJoint__GetCollideConnected_p0"] = asm._emscripten_bind_b2MouseJoint__GetCollideConnected_p0;
var _emscripten_bind_b2MouseJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2MouseJoint__GetReactionForce_p1"] = asm._emscripten_bind_b2MouseJoint__GetReactionForce_p1;
var _emscripten_bind_b2JointDef__set_type_p1 = Module["_emscripten_bind_b2JointDef__set_type_p1"] = asm._emscripten_bind_b2JointDef__set_type_p1;
var _emscripten_bind_b2Color__Set_p3 = Module["_emscripten_bind_b2Color__Set_p3"] = asm._emscripten_bind_b2Color__Set_p3;
var _emscripten_bind_b2WeldJoint__GetType_p0 = Module["_emscripten_bind_b2WeldJoint__GetType_p0"] = asm._emscripten_bind_b2WeldJoint__GetType_p0;
var _emscripten_bind_b2Joint__GetBodyB_p0 = Module["_emscripten_bind_b2Joint__GetBodyB_p0"] = asm._emscripten_bind_b2Joint__GetBodyB_p0;
var _emscripten_bind_b2ContactManager__set_m_broadPhase_p1 = Module["_emscripten_bind_b2ContactManager__set_m_broadPhase_p1"] = asm._emscripten_bind_b2ContactManager__set_m_broadPhase_p1;
var _emscripten_bind_b2JointDef__get_type_p0 = Module["_emscripten_bind_b2JointDef__get_type_p0"] = asm._emscripten_bind_b2JointDef__get_type_p0;
var _emscripten_bind_b2BodyDef__set_position_p1 = Module["_emscripten_bind_b2BodyDef__set_position_p1"] = asm._emscripten_bind_b2BodyDef__set_position_p1;
var _emscripten_bind_b2Vec2__Length_p0 = Module["_emscripten_bind_b2Vec2__Length_p0"] = asm._emscripten_bind_b2Vec2__Length_p0;
var _emscripten_bind_b2MouseJoint__GetUserData_p0 = Module["_emscripten_bind_b2MouseJoint__GetUserData_p0"] = asm._emscripten_bind_b2MouseJoint__GetUserData_p0;
var _emscripten_bind_b2JointDef__get_collideConnected_p0 = Module["_emscripten_bind_b2JointDef__get_collideConnected_p0"] = asm._emscripten_bind_b2JointDef__get_collideConnected_p0;
var _emscripten_bind_b2BroadPhase__GetTreeQuality_p0 = Module["_emscripten_bind_b2BroadPhase__GetTreeQuality_p0"] = asm._emscripten_bind_b2BroadPhase__GetTreeQuality_p0;
var _emscripten_bind_b2WheelJointDef__get_dampingRatio_p0 = Module["_emscripten_bind_b2WheelJointDef__get_dampingRatio_p0"] = asm._emscripten_bind_b2WheelJointDef__get_dampingRatio_p0;
var _emscripten_bind_b2RopeJoint__GetBodyB_p0 = Module["_emscripten_bind_b2RopeJoint__GetBodyB_p0"] = asm._emscripten_bind_b2RopeJoint__GetBodyB_p0;
var _emscripten_bind_b2Joint__GetCollideConnected_p0 = Module["_emscripten_bind_b2Joint__GetCollideConnected_p0"] = asm._emscripten_bind_b2Joint__GetCollideConnected_p0;
var _emscripten_bind_b2FrictionJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2FrictionJoint__GetReactionTorque_p1"] = asm._emscripten_bind_b2FrictionJoint__GetReactionTorque_p1;
var _emscripten_bind_b2PulleyJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2PulleyJointDef__get_bodyB_p1"] = asm._emscripten_bind_b2PulleyJointDef__get_bodyB_p1;
var _emscripten_bind_b2ContactManager__set_m_contactFilter_p1 = Module["_emscripten_bind_b2ContactManager__set_m_contactFilter_p1"] = asm._emscripten_bind_b2ContactManager__set_m_contactFilter_p1;
var _emscripten_bind_b2FrictionJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2FrictionJoint__GetAnchorA_p0"] = asm._emscripten_bind_b2FrictionJoint__GetAnchorA_p0;
var _emscripten_bind_b2EdgeShape__ComputeAABB_p3 = Module["_emscripten_bind_b2EdgeShape__ComputeAABB_p3"] = asm._emscripten_bind_b2EdgeShape__ComputeAABB_p3;
var _emscripten_bind_b2BodyDef__set_awake_p1 = Module["_emscripten_bind_b2BodyDef__set_awake_p1"] = asm._emscripten_bind_b2BodyDef__set_awake_p1;
var _emscripten_bind_b2FrictionJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2FrictionJointDef__get_bodyB_p1"] = asm._emscripten_bind_b2FrictionJointDef__get_bodyB_p1;
var _emscripten_bind_b2PrismaticJoint__SetMotorSpeed_p1 = Module["_emscripten_bind_b2PrismaticJoint__SetMotorSpeed_p1"] = asm._emscripten_bind_b2PrismaticJoint__SetMotorSpeed_p1;
var _emscripten_bind_b2PolygonShape__RayCast_p4 = Module["_emscripten_bind_b2PolygonShape__RayCast_p4"] = asm._emscripten_bind_b2PolygonShape__RayCast_p4;
var _emscripten_bind_b2CircleShape__ComputeMass_p2 = Module["_emscripten_bind_b2CircleShape__ComputeMass_p2"] = asm._emscripten_bind_b2CircleShape__ComputeMass_p2;
var _emscripten_bind_b2MouseJoint__GetFrequency_p0 = Module["_emscripten_bind_b2MouseJoint__GetFrequency_p0"] = asm._emscripten_bind_b2MouseJoint__GetFrequency_p0;
var _emscripten_bind_b2Contact__IsEnabled_p0 = Module["_emscripten_bind_b2Contact__IsEnabled_p0"] = asm._emscripten_bind_b2Contact__IsEnabled_p0;
var _emscripten_bind_b2PrismaticJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_bodyB_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_bodyB_p1;
var _emscripten_bind_b2FixtureDef__set_userData_p1 = Module["_emscripten_bind_b2FixtureDef__set_userData_p1"] = asm._emscripten_bind_b2FixtureDef__set_userData_p1;
var _emscripten_bind_b2Fixture__SetSensor_p1 = Module["_emscripten_bind_b2Fixture__SetSensor_p1"] = asm._emscripten_bind_b2Fixture__SetSensor_p1;
var _emscripten_bind_b2Shape__GetType_p0 = Module["_emscripten_bind_b2Shape__GetType_p0"] = asm._emscripten_bind_b2Shape__GetType_p0;
var _emscripten_bind_b2WeldJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2WeldJointDef__get_localAnchorB_p0"] = asm._emscripten_bind_b2WeldJointDef__get_localAnchorB_p0;
var _emscripten_bind_b2ContactManager__Destroy_p1 = Module["_emscripten_bind_b2ContactManager__Destroy_p1"] = asm._emscripten_bind_b2ContactManager__Destroy_p1;
var _emscripten_bind_b2PrismaticJoint__GetLocalAnchorA_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetLocalAnchorA_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetLocalAnchorA_p0;
var _emscripten_bind_b2WheelJointDef__set_motorSpeed_p1 = Module["_emscripten_bind_b2WheelJointDef__set_motorSpeed_p1"] = asm._emscripten_bind_b2WheelJointDef__set_motorSpeed_p1;
var _emscripten_bind_b2Contact__Evaluate_p3 = Module["_emscripten_bind_b2Contact__Evaluate_p3"] = asm._emscripten_bind_b2Contact__Evaluate_p3;
var _emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1;
var _emscripten_bind_b2RevoluteJoint__GetType_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetType_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetType_p0;
var _emscripten_bind_b2AABB__Combine_p1 = Module["_emscripten_bind_b2AABB__Combine_p1"] = asm._emscripten_bind_b2AABB__Combine_p1;
var _emscripten_bind_b2GearJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2GearJoint__GetReactionTorque_p1"] = asm._emscripten_bind_b2GearJoint__GetReactionTorque_p1;
var _emscripten_bind_b2AABB__Combine_p2 = Module["_emscripten_bind_b2AABB__Combine_p2"] = asm._emscripten_bind_b2AABB__Combine_p2;
var _emscripten_bind_b2PulleyJointDef__get_lengthA_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_lengthA_p0"] = asm._emscripten_bind_b2PulleyJointDef__get_lengthA_p0;
var _emscripten_bind_b2Shape__get_m_radius_p0 = Module["_emscripten_bind_b2Shape__get_m_radius_p0"] = asm._emscripten_bind_b2Shape__get_m_radius_p0;
var _emscripten_bind_b2ChainShape__set_m_count_p1 = Module["_emscripten_bind_b2ChainShape__set_m_count_p1"] = asm._emscripten_bind_b2ChainShape__set_m_count_p1;
var _emscripten_bind_b2RopeJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2RopeJointDef__set_bodyA_p1"] = asm._emscripten_bind_b2RopeJointDef__set_bodyA_p1;
var _emscripten_bind_b2DynamicTree__GetFatAABB_p1 = Module["_emscripten_bind_b2DynamicTree__GetFatAABB_p1"] = asm._emscripten_bind_b2DynamicTree__GetFatAABB_p1;
var _emscripten_bind_b2DistanceJoint__GetFrequency_p0 = Module["_emscripten_bind_b2DistanceJoint__GetFrequency_p0"] = asm._emscripten_bind_b2DistanceJoint__GetFrequency_p0;
var _emscripten_bind_b2PrismaticJoint__SetLimits_p2 = Module["_emscripten_bind_b2PrismaticJoint__SetLimits_p2"] = asm._emscripten_bind_b2PrismaticJoint__SetLimits_p2;
var _emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0 = Module["_emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0"] = asm._emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0;
var _emscripten_bind_b2Color__get_g_p0 = Module["_emscripten_bind_b2Color__get_g_p0"] = asm._emscripten_bind_b2Color__get_g_p0;
var _emscripten_bind_b2Fixture__GetBody_p0 = Module["_emscripten_bind_b2Fixture__GetBody_p0"] = asm._emscripten_bind_b2Fixture__GetBody_p0;
var _emscripten_bind_b2FrictionJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2FrictionJointDef__get_collideConnected_p1"] = asm._emscripten_bind_b2FrictionJointDef__get_collideConnected_p1;
var _emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1 = Module["_emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1"] = asm._emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1;
var _emscripten_bind_b2GearJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2GearJointDef__get_bodyB_p1"] = asm._emscripten_bind_b2GearJointDef__get_bodyB_p1;
var _emscripten_bind_b2AABB__set_upperBound_p1 = Module["_emscripten_bind_b2AABB__set_upperBound_p1"] = asm._emscripten_bind_b2AABB__set_upperBound_p1;
var _emscripten_bind_b2Contact__GetFixtureA_p0 = Module["_emscripten_bind_b2Contact__GetFixtureA_p0"] = asm._emscripten_bind_b2Contact__GetFixtureA_p0;
var _emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1;
var _emscripten_bind_b2WheelJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2WheelJointDef__set_localAnchorA_p1"] = asm._emscripten_bind_b2WheelJointDef__set_localAnchorA_p1;
var _emscripten_bind_b2DistanceJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_bodyB_p1"] = asm._emscripten_bind_b2DistanceJointDef__set_bodyB_p1;
var _emscripten_bind_b2Transform__SetIdentity_p0 = Module["_emscripten_bind_b2Transform__SetIdentity_p0"] = asm._emscripten_bind_b2Transform__SetIdentity_p0;
var _emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1"] = asm._emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1;
var _emscripten_bind_b2Body__SetTransform_p2 = Module["_emscripten_bind_b2Body__SetTransform_p2"] = asm._emscripten_bind_b2Body__SetTransform_p2;
var _emscripten_bind_b2DistanceJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2DistanceJoint__GetReactionTorque_p1"] = asm._emscripten_bind_b2DistanceJoint__GetReactionTorque_p1;
var _emscripten_bind_b2StackAllocator__b2StackAllocator_p0 = Module["_emscripten_bind_b2StackAllocator__b2StackAllocator_p0"] = asm._emscripten_bind_b2StackAllocator__b2StackAllocator_p0;
var _emscripten_bind_b2MouseJointDef__set_maxForce_p1 = Module["_emscripten_bind_b2MouseJointDef__set_maxForce_p1"] = asm._emscripten_bind_b2MouseJointDef__set_maxForce_p1;
var _emscripten_bind_b2RevoluteJoint__GetMotorTorque_p1 = Module["_emscripten_bind_b2RevoluteJoint__GetMotorTorque_p1"] = asm._emscripten_bind_b2RevoluteJoint__GetMotorTorque_p1;
var _emscripten_bind_b2Vec2__set_y_p1 = Module["_emscripten_bind_b2Vec2__set_y_p1"] = asm._emscripten_bind_b2Vec2__set_y_p1;
var _emscripten_bind_b2CircleShape__Clone_p1 = Module["_emscripten_bind_b2CircleShape__Clone_p1"] = asm._emscripten_bind_b2CircleShape__Clone_p1;
var _emscripten_bind_b2Rot__GetAngle_p0 = Module["_emscripten_bind_b2Rot__GetAngle_p0"] = asm._emscripten_bind_b2Rot__GetAngle_p0;
var _emscripten_bind_b2Color____destroy___p0 = Module["_emscripten_bind_b2Color____destroy___p0"] = asm._emscripten_bind_b2Color____destroy___p0;
var _emscripten_bind_b2WeldJoint__GetBodyA_p0 = Module["_emscripten_bind_b2WeldJoint__GetBodyA_p0"] = asm._emscripten_bind_b2WeldJoint__GetBodyA_p0;
var _emscripten_bind_b2Fixture__GetRestitution_p0 = Module["_emscripten_bind_b2Fixture__GetRestitution_p0"] = asm._emscripten_bind_b2Fixture__GetRestitution_p0;
var _emscripten_bind_b2DistanceJointDef__set_length_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_length_p1"] = asm._emscripten_bind_b2DistanceJointDef__set_length_p1;
var _emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0;
var _emscripten_bind_b2Color__b2Color_p3 = Module["_emscripten_bind_b2Color__b2Color_p3"] = asm._emscripten_bind_b2Color__b2Color_p3;
var _emscripten_bind_b2Body__ApplyForceToCenter_p1 = Module["_emscripten_bind_b2Body__ApplyForceToCenter_p1"] = asm._emscripten_bind_b2Body__ApplyForceToCenter_p1;
var _emscripten_bind_b2PrismaticJoint__SetUserData_p1 = Module["_emscripten_bind_b2PrismaticJoint__SetUserData_p1"] = asm._emscripten_bind_b2PrismaticJoint__SetUserData_p1;
var _emscripten_bind_b2Color__get_r_p0 = Module["_emscripten_bind_b2Color__get_r_p0"] = asm._emscripten_bind_b2Color__get_r_p0;
var _emscripten_bind_b2RevoluteJoint__b2RevoluteJoint_p1 = Module["_emscripten_bind_b2RevoluteJoint__b2RevoluteJoint_p1"] = asm._emscripten_bind_b2RevoluteJoint__b2RevoluteJoint_p1;
var _emscripten_bind_b2RevoluteJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetCollideConnected_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetCollideConnected_p0;
var _emscripten_bind_b2PrismaticJoint__IsActive_p0 = Module["_emscripten_bind_b2PrismaticJoint__IsActive_p0"] = asm._emscripten_bind_b2PrismaticJoint__IsActive_p0;
var _emscripten_bind_b2Body__SetFixedRotation_p1 = Module["_emscripten_bind_b2Body__SetFixedRotation_p1"] = asm._emscripten_bind_b2Body__SetFixedRotation_p1;
var _emscripten_bind_b2RopeJointDef____destroy___p0 = Module["_emscripten_bind_b2RopeJointDef____destroy___p0"] = asm._emscripten_bind_b2RopeJointDef____destroy___p0;
var _emscripten_bind_b2PrismaticJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2PrismaticJointDef__get_bodyB_p1"] = asm._emscripten_bind_b2PrismaticJointDef__get_bodyB_p1;
var _emscripten_bind_b2Shape__set_m_radius_p1 = Module["_emscripten_bind_b2Shape__set_m_radius_p1"] = asm._emscripten_bind_b2Shape__set_m_radius_p1;
var _emscripten_bind_b2WheelJoint__GetBodyB_p0 = Module["_emscripten_bind_b2WheelJoint__GetBodyB_p0"] = asm._emscripten_bind_b2WheelJoint__GetBodyB_p0;
var _emscripten_bind_b2JointDef__get_bodyA_p0 = Module["_emscripten_bind_b2JointDef__get_bodyA_p0"] = asm._emscripten_bind_b2JointDef__get_bodyA_p0;
var _emscripten_bind_b2World__GetContactCount_p0 = Module["_emscripten_bind_b2World__GetContactCount_p0"] = asm._emscripten_bind_b2World__GetContactCount_p0;
var _emscripten_bind_b2Fixture__b2Fixture_p0 = Module["_emscripten_bind_b2Fixture__b2Fixture_p0"] = asm._emscripten_bind_b2Fixture__b2Fixture_p0;
var _emscripten_bind_b2StackAllocator__Allocate_p1 = Module["_emscripten_bind_b2StackAllocator__Allocate_p1"] = asm._emscripten_bind_b2StackAllocator__Allocate_p1;
var _emscripten_bind_b2Body__SetGravityScale_p1 = Module["_emscripten_bind_b2Body__SetGravityScale_p1"] = asm._emscripten_bind_b2Body__SetGravityScale_p1;
var _emscripten_bind_b2BroadPhase__CreateProxy_p2 = Module["_emscripten_bind_b2BroadPhase__CreateProxy_p2"] = asm._emscripten_bind_b2BroadPhase__CreateProxy_p2;
var _emscripten_bind_b2WheelJoint__GetLocalAnchorA_p0 = Module["_emscripten_bind_b2WheelJoint__GetLocalAnchorA_p0"] = asm._emscripten_bind_b2WheelJoint__GetLocalAnchorA_p0;
var _emscripten_bind_b2FrictionJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_bodyB_p1"] = asm._emscripten_bind_b2FrictionJointDef__set_bodyB_p1;
var _emscripten_bind_b2WheelJoint__SetSpringFrequencyHz_p1 = Module["_emscripten_bind_b2WheelJoint__SetSpringFrequencyHz_p1"] = asm._emscripten_bind_b2WheelJoint__SetSpringFrequencyHz_p1;
var _emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0 = Module["_emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0"] = asm._emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0;
var _emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1;
var _emscripten_bind_b2Filter____destroy___p0 = Module["_emscripten_bind_b2Filter____destroy___p0"] = asm._emscripten_bind_b2Filter____destroy___p0;
var _emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1;
var _emscripten_bind_b2Fixture__GetUserData_p0 = Module["_emscripten_bind_b2Fixture__GetUserData_p0"] = asm._emscripten_bind_b2Fixture__GetUserData_p0;
var _emscripten_bind_b2AABB__get_upperBound_p0 = Module["_emscripten_bind_b2AABB__get_upperBound_p0"] = asm._emscripten_bind_b2AABB__get_upperBound_p0;
var _emscripten_bind_b2PulleyJoint__Dump_p0 = Module["_emscripten_bind_b2PulleyJoint__Dump_p0"] = asm._emscripten_bind_b2PulleyJoint__Dump_p0;
var _emscripten_bind_b2RopeJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2RopeJointDef__get_localAnchorA_p0"] = asm._emscripten_bind_b2RopeJointDef__get_localAnchorA_p0;
var _emscripten_bind_b2CircleShape__get_m_radius_p0 = Module["_emscripten_bind_b2CircleShape__get_m_radius_p0"] = asm._emscripten_bind_b2CircleShape__get_m_radius_p0;
var _emscripten_bind_b2DistanceJoint__GetLength_p0 = Module["_emscripten_bind_b2DistanceJoint__GetLength_p0"] = asm._emscripten_bind_b2DistanceJoint__GetLength_p0;
var _emscripten_bind_b2BodyDef__set_angularVelocity_p1 = Module["_emscripten_bind_b2BodyDef__set_angularVelocity_p1"] = asm._emscripten_bind_b2BodyDef__set_angularVelocity_p1;
var _emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0;
var _emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1;
var _emscripten_bind_b2RevoluteJoint__SetMotorSpeed_p1 = Module["_emscripten_bind_b2RevoluteJoint__SetMotorSpeed_p1"] = asm._emscripten_bind_b2RevoluteJoint__SetMotorSpeed_p1;
var _emscripten_bind_b2WeldJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2WeldJoint__GetReactionTorque_p1"] = asm._emscripten_bind_b2WeldJoint__GetReactionTorque_p1;
var _emscripten_bind_b2GearJoint__SetUserData_p1 = Module["_emscripten_bind_b2GearJoint__SetUserData_p1"] = asm._emscripten_bind_b2GearJoint__SetUserData_p1;
var _emscripten_bind_b2PrismaticJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetAnchorB_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetAnchorB_p0;
var _emscripten_bind_b2MouseJointDef__set_target_p1 = Module["_emscripten_bind_b2MouseJointDef__set_target_p1"] = asm._emscripten_bind_b2MouseJointDef__set_target_p1;
var _emscripten_bind_b2WeldJoint__GetBodyB_p0 = Module["_emscripten_bind_b2WeldJoint__GetBodyB_p0"] = asm._emscripten_bind_b2WeldJoint__GetBodyB_p0;
var _emscripten_bind_b2PolygonShape__TestPoint_p2 = Module["_emscripten_bind_b2PolygonShape__TestPoint_p2"] = asm._emscripten_bind_b2PolygonShape__TestPoint_p2;
var _emscripten_bind_b2WheelJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2WheelJointDef__set_localAnchorB_p1"] = asm._emscripten_bind_b2WheelJointDef__set_localAnchorB_p1;
var _emscripten_bind_b2WheelJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2WheelJoint__GetReactionTorque_p1"] = asm._emscripten_bind_b2WheelJoint__GetReactionTorque_p1;
var _emscripten_bind_b2FrictionJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_bodyA_p1"] = asm._emscripten_bind_b2FrictionJointDef__set_bodyA_p1;
var _emscripten_bind_b2Color__b2Color_p0 = Module["_emscripten_bind_b2Color__b2Color_p0"] = asm._emscripten_bind_b2Color__b2Color_p0;
var _emscripten_bind_b2BroadPhase__TestOverlap_p2 = Module["_emscripten_bind_b2BroadPhase__TestOverlap_p2"] = asm._emscripten_bind_b2BroadPhase__TestOverlap_p2;
var _emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1;
var _emscripten_bind_b2RevoluteJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2RevoluteJoint__GetReactionTorque_p1"] = asm._emscripten_bind_b2RevoluteJoint__GetReactionTorque_p1;
var _emscripten_bind_b2Joint__GetAnchorB_p0 = Module["_emscripten_bind_b2Joint__GetAnchorB_p0"] = asm._emscripten_bind_b2Joint__GetAnchorB_p0;
var _emscripten_bind_b2CircleShape__set_m_radius_p1 = Module["_emscripten_bind_b2CircleShape__set_m_radius_p1"] = asm._emscripten_bind_b2CircleShape__set_m_radius_p1;
var _memcpy = Module["_memcpy"] = asm._memcpy;
var _emscripten_bind_b2World__GetContactManager_p0 = Module["_emscripten_bind_b2World__GetContactManager_p0"] = asm._emscripten_bind_b2World__GetContactManager_p0;
var _emscripten_bind_b2RevoluteJoint__SetUserData_p1 = Module["_emscripten_bind_b2RevoluteJoint__SetUserData_p1"] = asm._emscripten_bind_b2RevoluteJoint__SetUserData_p1;
var _emscripten_bind_b2Contact__GetFixtureB_p0 = Module["_emscripten_bind_b2Contact__GetFixtureB_p0"] = asm._emscripten_bind_b2Contact__GetFixtureB_p0;
var _emscripten_bind_b2Rot__GetYAxis_p0 = Module["_emscripten_bind_b2Rot__GetYAxis_p0"] = asm._emscripten_bind_b2Rot__GetYAxis_p0;
var _emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1;
var _emscripten_bind_b2Shape__Clone_p1 = Module["_emscripten_bind_b2Shape__Clone_p1"] = asm._emscripten_bind_b2Shape__Clone_p1;
var _emscripten_bind_b2PulleyJoint__GetType_p0 = Module["_emscripten_bind_b2PulleyJoint__GetType_p0"] = asm._emscripten_bind_b2PulleyJoint__GetType_p0;
var _emscripten_bind_b2AABB__set_lowerBound_p1 = Module["_emscripten_bind_b2AABB__set_lowerBound_p1"] = asm._emscripten_bind_b2AABB__set_lowerBound_p1;
var _emscripten_bind_b2RopeJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2RopeJoint__GetCollideConnected_p0"] = asm._emscripten_bind_b2RopeJoint__GetCollideConnected_p0;
var _emscripten_bind_b2DistanceJoint__IsActive_p0 = Module["_emscripten_bind_b2DistanceJoint__IsActive_p0"] = asm._emscripten_bind_b2DistanceJoint__IsActive_p0;
var _emscripten_bind_b2BodyDef__set_linearDamping_p1 = Module["_emscripten_bind_b2BodyDef__set_linearDamping_p1"] = asm._emscripten_bind_b2BodyDef__set_linearDamping_p1;
var _emscripten_bind_b2BroadPhase__GetTreeBalance_p0 = Module["_emscripten_bind_b2BroadPhase__GetTreeBalance_p0"] = asm._emscripten_bind_b2BroadPhase__GetTreeBalance_p0;
var _emscripten_bind_b2AABB__GetExtents_p0 = Module["_emscripten_bind_b2AABB__GetExtents_p0"] = asm._emscripten_bind_b2AABB__GetExtents_p0;
var _emscripten_bind_b2CircleShape____destroy___p0 = Module["_emscripten_bind_b2CircleShape____destroy___p0"] = asm._emscripten_bind_b2CircleShape____destroy___p0;
var _emscripten_bind_b2WeldJoint__SetFrequency_p1 = Module["_emscripten_bind_b2WeldJoint__SetFrequency_p1"] = asm._emscripten_bind_b2WeldJoint__SetFrequency_p1;
var _emscripten_bind_b2GearJointDef__set_ratio_p1 = Module["_emscripten_bind_b2GearJointDef__set_ratio_p1"] = asm._emscripten_bind_b2GearJointDef__set_ratio_p1;
var _emscripten_bind_b2FixtureDef__get_density_p0 = Module["_emscripten_bind_b2FixtureDef__get_density_p0"] = asm._emscripten_bind_b2FixtureDef__get_density_p0;
var _emscripten_bind_b2AABB__GetCenter_p0 = Module["_emscripten_bind_b2AABB__GetCenter_p0"] = asm._emscripten_bind_b2AABB__GetCenter_p0;
var _emscripten_bind_b2Draw__ClearFlags_p1 = Module["_emscripten_bind_b2Draw__ClearFlags_p1"] = asm._emscripten_bind_b2Draw__ClearFlags_p1;
var _emscripten_bind_b2WeldJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2WeldJointDef__get_localAnchorA_p0"] = asm._emscripten_bind_b2WeldJointDef__get_localAnchorA_p0;
var _emscripten_bind_b2PolygonShape__GetType_p0 = Module["_emscripten_bind_b2PolygonShape__GetType_p0"] = asm._emscripten_bind_b2PolygonShape__GetType_p0;
var _emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1"] = asm._emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1;
var _emscripten_bind_b2BroadPhase__GetUserData_p1 = Module["_emscripten_bind_b2BroadPhase__GetUserData_p1"] = asm._emscripten_bind_b2BroadPhase__GetUserData_p1;
var _emscripten_bind_b2Rot__get_c_p0 = Module["_emscripten_bind_b2Rot__get_c_p0"] = asm._emscripten_bind_b2Rot__get_c_p0;
var _emscripten_bind_b2World__GetAutoClearForces_p0 = Module["_emscripten_bind_b2World__GetAutoClearForces_p0"] = asm._emscripten_bind_b2World__GetAutoClearForces_p0;
var _emscripten_bind_b2World__GetTreeHeight_p0 = Module["_emscripten_bind_b2World__GetTreeHeight_p0"] = asm._emscripten_bind_b2World__GetTreeHeight_p0;
var _emscripten_bind_b2AABB__IsValid_p0 = Module["_emscripten_bind_b2AABB__IsValid_p0"] = asm._emscripten_bind_b2AABB__IsValid_p0;
var _emscripten_bind_b2RevoluteJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetAnchorB_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetAnchorB_p0;
var _emscripten_bind_b2RopeJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2RopeJointDef__get_bodyB_p1"] = asm._emscripten_bind_b2RopeJointDef__get_bodyB_p1;
var _emscripten_bind_b2World__CreateJoint_p1 = Module["_emscripten_bind_b2World__CreateJoint_p1"] = asm._emscripten_bind_b2World__CreateJoint_p1;
var _emscripten_bind_b2WheelJoint__GetDefinition_p1 = Module["_emscripten_bind_b2WheelJoint__GetDefinition_p1"] = asm._emscripten_bind_b2WheelJoint__GetDefinition_p1;
var _emscripten_bind_b2Color__set_b_p1 = Module["_emscripten_bind_b2Color__set_b_p1"] = asm._emscripten_bind_b2Color__set_b_p1;
var _emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0;
var _emscripten_bind_b2Body__GetLocalCenter_p0 = Module["_emscripten_bind_b2Body__GetLocalCenter_p0"] = asm._emscripten_bind_b2Body__GetLocalCenter_p0;
var _emscripten_bind_b2WheelJoint__GetLocalAxisA_p0 = Module["_emscripten_bind_b2WheelJoint__GetLocalAxisA_p0"] = asm._emscripten_bind_b2WheelJoint__GetLocalAxisA_p0;
var _emscripten_bind_b2Contact__GetFriction_p0 = Module["_emscripten_bind_b2Contact__GetFriction_p0"] = asm._emscripten_bind_b2Contact__GetFriction_p0;
var _emscripten_bind_b2Body__SetAngularVelocity_p1 = Module["_emscripten_bind_b2Body__SetAngularVelocity_p1"] = asm._emscripten_bind_b2Body__SetAngularVelocity_p1;
var _emscripten_bind_b2PrismaticJoint__GetJointSpeed_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetJointSpeed_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetJointSpeed_p0;
var _emscripten_bind_b2CircleShape__TestPoint_p2 = Module["_emscripten_bind_b2CircleShape__TestPoint_p2"] = asm._emscripten_bind_b2CircleShape__TestPoint_p2;
var _emscripten_bind_b2Body__SetAwake_p1 = Module["_emscripten_bind_b2Body__SetAwake_p1"] = asm._emscripten_bind_b2Body__SetAwake_p1;
var _emscripten_bind_b2Filter__set_categoryBits_p1 = Module["_emscripten_bind_b2Filter__set_categoryBits_p1"] = asm._emscripten_bind_b2Filter__set_categoryBits_p1;
var _emscripten_bind_b2ChainShape__ComputeMass_p2 = Module["_emscripten_bind_b2ChainShape__ComputeMass_p2"] = asm._emscripten_bind_b2ChainShape__ComputeMass_p2;
var _emscripten_bind_b2PrismaticJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2PrismaticJointDef__get_collideConnected_p1"] = asm._emscripten_bind_b2PrismaticJointDef__get_collideConnected_p1;
var _emscripten_bind_b2World__CreateBody_p1 = Module["_emscripten_bind_b2World__CreateBody_p1"] = asm._emscripten_bind_b2World__CreateBody_p1;
var _emscripten_bind_b2JointDef__get_bodyB_p0 = Module["_emscripten_bind_b2JointDef__get_bodyB_p0"] = asm._emscripten_bind_b2JointDef__get_bodyB_p0;
var _emscripten_bind_b2ChainShape__get_m_count_p0 = Module["_emscripten_bind_b2ChainShape__get_m_count_p0"] = asm._emscripten_bind_b2ChainShape__get_m_count_p0;
var _emscripten_bind_b2Joint__GetType_p0 = Module["_emscripten_bind_b2Joint__GetType_p0"] = asm._emscripten_bind_b2Joint__GetType_p0;
var _emscripten_bind_b2WheelJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2WheelJoint__GetCollideConnected_p0"] = asm._emscripten_bind_b2WheelJoint__GetCollideConnected_p0;
var _emscripten_bind_b2WheelJointDef__set_localAxisA_p1 = Module["_emscripten_bind_b2WheelJointDef__set_localAxisA_p1"] = asm._emscripten_bind_b2WheelJointDef__set_localAxisA_p1;
var _emscripten_bind_b2CircleShape__GetVertex_p1 = Module["_emscripten_bind_b2CircleShape__GetVertex_p1"] = asm._emscripten_bind_b2CircleShape__GetVertex_p1;
var _emscripten_bind_b2WeldJoint__GetNext_p0 = Module["_emscripten_bind_b2WeldJoint__GetNext_p0"] = asm._emscripten_bind_b2WeldJoint__GetNext_p0;
var _emscripten_bind_b2WeldJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2WeldJoint__GetCollideConnected_p0"] = asm._emscripten_bind_b2WeldJoint__GetCollideConnected_p0;
var _emscripten_bind_b2World__SetDestructionListener_p1 = Module["_emscripten_bind_b2World__SetDestructionListener_p1"] = asm._emscripten_bind_b2World__SetDestructionListener_p1;
var _emscripten_bind_b2WheelJointDef__get_localAxisA_p0 = Module["_emscripten_bind_b2WheelJointDef__get_localAxisA_p0"] = asm._emscripten_bind_b2WheelJointDef__get_localAxisA_p0;
var _emscripten_bind_b2Joint__GetAnchorA_p0 = Module["_emscripten_bind_b2Joint__GetAnchorA_p0"] = asm._emscripten_bind_b2Joint__GetAnchorA_p0;
var _emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0 = Module["_emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0"] = asm._emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0;
var _emscripten_bind_b2WheelJoint__IsActive_p0 = Module["_emscripten_bind_b2WheelJoint__IsActive_p0"] = asm._emscripten_bind_b2WheelJoint__IsActive_p0;
var _emscripten_bind_b2Transform____destroy___p0 = Module["_emscripten_bind_b2Transform____destroy___p0"] = asm._emscripten_bind_b2Transform____destroy___p0;
var _emscripten_bind_b2PolygonShape__ComputeMass_p2 = Module["_emscripten_bind_b2PolygonShape__ComputeMass_p2"] = asm._emscripten_bind_b2PolygonShape__ComputeMass_p2;
var _emscripten_bind_b2RopeJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2RopeJointDef__get_bodyA_p1"] = asm._emscripten_bind_b2RopeJointDef__get_bodyA_p1;
var _emscripten_bind_b2WheelJoint__b2WheelJoint_p1 = Module["_emscripten_bind_b2WheelJoint__b2WheelJoint_p1"] = asm._emscripten_bind_b2WheelJoint__b2WheelJoint_p1;
var _emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1 = Module["_emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1"] = asm._emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1;
var _emscripten_bind_b2Draw__DrawTransform_p1 = Module["_emscripten_bind_b2Draw__DrawTransform_p1"] = asm._emscripten_bind_b2Draw__DrawTransform_p1;
var _emscripten_bind_b2DistanceJoint__GetType_p0 = Module["_emscripten_bind_b2DistanceJoint__GetType_p0"] = asm._emscripten_bind_b2DistanceJoint__GetType_p0;
var _emscripten_bind_b2MouseJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2MouseJointDef__set_bodyB_p1"] = asm._emscripten_bind_b2MouseJointDef__set_bodyB_p1;
var _emscripten_bind_b2Fixture__GetFriction_p0 = Module["_emscripten_bind_b2Fixture__GetFriction_p0"] = asm._emscripten_bind_b2Fixture__GetFriction_p0;
var _emscripten_bind_b2Body__GetWorld_p0 = Module["_emscripten_bind_b2Body__GetWorld_p0"] = asm._emscripten_bind_b2Body__GetWorld_p0;
var _emscripten_bind_b2PolygonShape__b2PolygonShape_p0 = Module["_emscripten_bind_b2PolygonShape__b2PolygonShape_p0"] = asm._emscripten_bind_b2PolygonShape__b2PolygonShape_p0;
var _emscripten_bind_b2WeldJointDef__set_frequencyHz_p1 = Module["_emscripten_bind_b2WeldJointDef__set_frequencyHz_p1"] = asm._emscripten_bind_b2WeldJointDef__set_frequencyHz_p1;
var _emscripten_bind_b2RevoluteJoint__GetJointAngle_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetJointAngle_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetJointAngle_p0;
var _emscripten_bind_b2Body__ResetMassData_p0 = Module["_emscripten_bind_b2Body__ResetMassData_p0"] = asm._emscripten_bind_b2Body__ResetMassData_p0;
var _emscripten_bind_b2RevoluteJoint__IsActive_p0 = Module["_emscripten_bind_b2RevoluteJoint__IsActive_p0"] = asm._emscripten_bind_b2RevoluteJoint__IsActive_p0;
var _emscripten_bind_b2FrictionJoint__SetUserData_p1 = Module["_emscripten_bind_b2FrictionJoint__SetUserData_p1"] = asm._emscripten_bind_b2FrictionJoint__SetUserData_p1;
var _emscripten_bind_b2PulleyJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2PulleyJoint__GetReactionForce_p1"] = asm._emscripten_bind_b2PulleyJoint__GetReactionForce_p1;
var _emscripten_bind_b2Timer__b2Timer_p0 = Module["_emscripten_bind_b2Timer__b2Timer_p0"] = asm._emscripten_bind_b2Timer__b2Timer_p0;
var _emscripten_bind_b2World__SetContinuousPhysics_p1 = Module["_emscripten_bind_b2World__SetContinuousPhysics_p1"] = asm._emscripten_bind_b2World__SetContinuousPhysics_p1;
var _emscripten_bind_b2ContactManager__FindNewContacts_p0 = Module["_emscripten_bind_b2ContactManager__FindNewContacts_p0"] = asm._emscripten_bind_b2ContactManager__FindNewContacts_p0;
var _emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0"] = asm._emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0;
var _emscripten_bind_b2DynamicTree__GetMaxBalance_p0 = Module["_emscripten_bind_b2DynamicTree__GetMaxBalance_p0"] = asm._emscripten_bind_b2DynamicTree__GetMaxBalance_p0;
var _emscripten_bind_b2PolygonShape__GetVertex_p1 = Module["_emscripten_bind_b2PolygonShape__GetVertex_p1"] = asm._emscripten_bind_b2PolygonShape__GetVertex_p1;
var _emscripten_bind_b2WeldJointDef__get_frequencyHz_p0 = Module["_emscripten_bind_b2WeldJointDef__get_frequencyHz_p0"] = asm._emscripten_bind_b2WeldJointDef__get_frequencyHz_p0;
var _emscripten_bind_b2ContactListener__BeginContact_p1 = Module["_emscripten_bind_b2ContactListener__BeginContact_p1"] = asm._emscripten_bind_b2ContactListener__BeginContact_p1;
var _emscripten_bind_b2RevoluteJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_collideConnected_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_collideConnected_p1;
var _emscripten_bind_b2DistanceJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2DistanceJoint__GetAnchorA_p0"] = asm._emscripten_bind_b2DistanceJoint__GetAnchorA_p0;
var _emscripten_bind_b2PrismaticJoint__GetLocalAxisA_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetLocalAxisA_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetLocalAxisA_p0;
var _emscripten_bind_b2ChainShape__Clone_p1 = Module["_emscripten_bind_b2ChainShape__Clone_p1"] = asm._emscripten_bind_b2ChainShape__Clone_p1;
var _emscripten_bind_b2GearJointDef__b2GearJointDef_p0 = Module["_emscripten_bind_b2GearJointDef__b2GearJointDef_p0"] = asm._emscripten_bind_b2GearJointDef__b2GearJointDef_p0;
var _emscripten_bind_b2RevoluteJoint__GetBodyA_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetBodyA_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetBodyA_p0;
var _emscripten_bind_b2Body__ApplyForce_p2 = Module["_emscripten_bind_b2Body__ApplyForce_p2"] = asm._emscripten_bind_b2Body__ApplyForce_p2;
var _emscripten_bind_b2MouseJoint__GetReactionTorque_p1 = Module["_emscripten_bind_b2MouseJoint__GetReactionTorque_p1"] = asm._emscripten_bind_b2MouseJoint__GetReactionTorque_p1;
var _emscripten_bind_b2Vec2__get_y_p0 = Module["_emscripten_bind_b2Vec2__get_y_p0"] = asm._emscripten_bind_b2Vec2__get_y_p0;
var _emscripten_bind_b2ContactEdge__get_contact_p0 = Module["_emscripten_bind_b2ContactEdge__get_contact_p0"] = asm._emscripten_bind_b2ContactEdge__get_contact_p0;
var _emscripten_bind_b2GearJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2GearJointDef__set_bodyB_p1"] = asm._emscripten_bind_b2GearJointDef__set_bodyB_p1;
var _emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0;
var _emscripten_bind_b2RopeJoint____destroy___p0 = Module["_emscripten_bind_b2RopeJoint____destroy___p0"] = asm._emscripten_bind_b2RopeJoint____destroy___p0;
var _emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0 = Module["_emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0"] = asm._emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0;
var _emscripten_bind_b2DistanceJoint__SetFrequency_p1 = Module["_emscripten_bind_b2DistanceJoint__SetFrequency_p1"] = asm._emscripten_bind_b2DistanceJoint__SetFrequency_p1;
var _emscripten_bind_b2PulleyJointDef__set_lengthA_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_lengthA_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_lengthA_p1;
var _emscripten_bind_b2FixtureDef__get_friction_p0 = Module["_emscripten_bind_b2FixtureDef__get_friction_p0"] = asm._emscripten_bind_b2FixtureDef__get_friction_p0;
var _emscripten_bind_b2ContactEdge__get_next_p0 = Module["_emscripten_bind_b2ContactEdge__get_next_p0"] = asm._emscripten_bind_b2ContactEdge__get_next_p0;
var _emscripten_bind_b2RevoluteJoint__GetBodyB_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetBodyB_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetBodyB_p0;
var _emscripten_bind_b2RevoluteJoint__GetUserData_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetUserData_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetUserData_p0;
var _emscripten_bind_b2Body__GetType_p0 = Module["_emscripten_bind_b2Body__GetType_p0"] = asm._emscripten_bind_b2Body__GetType_p0;
var _emscripten_bind_b2World__Step_p3 = Module["_emscripten_bind_b2World__Step_p3"] = asm._emscripten_bind_b2World__Step_p3;
var _emscripten_bind_b2Vec2__set_x_p1 = Module["_emscripten_bind_b2Vec2__set_x_p1"] = asm._emscripten_bind_b2Vec2__set_x_p1;
var _emscripten_bind_b2ContactManager__b2ContactManager_p0 = Module["_emscripten_bind_b2ContactManager__b2ContactManager_p0"] = asm._emscripten_bind_b2ContactManager__b2ContactManager_p0;
var _emscripten_bind_b2RopeJoint__GetNext_p0 = Module["_emscripten_bind_b2RopeJoint__GetNext_p0"] = asm._emscripten_bind_b2RopeJoint__GetNext_p0;
var _emscripten_bind_b2WeldJoint__SetDampingRatio_p1 = Module["_emscripten_bind_b2WeldJoint__SetDampingRatio_p1"] = asm._emscripten_bind_b2WeldJoint__SetDampingRatio_p1;
var _emscripten_bind_b2World__GetTreeQuality_p0 = Module["_emscripten_bind_b2World__GetTreeQuality_p0"] = asm._emscripten_bind_b2World__GetTreeQuality_p0;
var _emscripten_bind_b2WeldJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2WeldJoint__GetAnchorB_p0"] = asm._emscripten_bind_b2WeldJoint__GetAnchorB_p0;
var _emscripten_bind_b2Contact__GetRestitution_p0 = Module["_emscripten_bind_b2Contact__GetRestitution_p0"] = asm._emscripten_bind_b2Contact__GetRestitution_p0;
var _emscripten_bind_b2MouseJointDef____destroy___p0 = Module["_emscripten_bind_b2MouseJointDef____destroy___p0"] = asm._emscripten_bind_b2MouseJointDef____destroy___p0;
var _emscripten_bind_b2Body__GetTransform_p0 = Module["_emscripten_bind_b2Body__GetTransform_p0"] = asm._emscripten_bind_b2Body__GetTransform_p0;
var _emscripten_bind_b2PrismaticJoint__b2PrismaticJoint_p1 = Module["_emscripten_bind_b2PrismaticJoint__b2PrismaticJoint_p1"] = asm._emscripten_bind_b2PrismaticJoint__b2PrismaticJoint_p1;
var _emscripten_bind_b2RopeJointDef__get_maxLength_p0 = Module["_emscripten_bind_b2RopeJointDef__get_maxLength_p0"] = asm._emscripten_bind_b2RopeJointDef__get_maxLength_p0;
var _emscripten_bind_b2DistanceJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2DistanceJoint__GetAnchorB_p0"] = asm._emscripten_bind_b2DistanceJoint__GetAnchorB_p0;
var _emscripten_bind_b2ChainShape__set_m_vertices_p1 = Module["_emscripten_bind_b2ChainShape__set_m_vertices_p1"] = asm._emscripten_bind_b2ChainShape__set_m_vertices_p1;
var _emscripten_bind_b2EdgeShape__TestPoint_p2 = Module["_emscripten_bind_b2EdgeShape__TestPoint_p2"] = asm._emscripten_bind_b2EdgeShape__TestPoint_p2;
var _emscripten_bind_b2FrictionJoint__GetMaxTorque_p0 = Module["_emscripten_bind_b2FrictionJoint__GetMaxTorque_p0"] = asm._emscripten_bind_b2FrictionJoint__GetMaxTorque_p0;
var _emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0 = Module["_emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0"] = asm._emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0;
var _emscripten_bind_b2ContactManager__AddPair_p2 = Module["_emscripten_bind_b2ContactManager__AddPair_p2"] = asm._emscripten_bind_b2ContactManager__AddPair_p2;
var _emscripten_bind_b2Color__set_g_p1 = Module["_emscripten_bind_b2Color__set_g_p1"] = asm._emscripten_bind_b2Color__set_g_p1;
var _emscripten_bind_b2WheelJoint__IsMotorEnabled_p0 = Module["_emscripten_bind_b2WheelJoint__IsMotorEnabled_p0"] = asm._emscripten_bind_b2WheelJoint__IsMotorEnabled_p0;
var _emscripten_bind_b2QueryCallback__b2QueryCallback_p0 = Module["_emscripten_bind_b2QueryCallback__b2QueryCallback_p0"] = asm._emscripten_bind_b2QueryCallback__b2QueryCallback_p0;
var _emscripten_bind_b2WheelJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2WheelJointDef__get_collideConnected_p1"] = asm._emscripten_bind_b2WheelJointDef__get_collideConnected_p1;
var _emscripten_bind_b2FrictionJoint__Dump_p0 = Module["_emscripten_bind_b2FrictionJoint__Dump_p0"] = asm._emscripten_bind_b2FrictionJoint__Dump_p0;
var _emscripten_bind_b2ChainShape__SetPrevVertex_p1 = Module["_emscripten_bind_b2ChainShape__SetPrevVertex_p1"] = asm._emscripten_bind_b2ChainShape__SetPrevVertex_p1;
var _emscripten_bind_b2AABB__GetPerimeter_p0 = Module["_emscripten_bind_b2AABB__GetPerimeter_p0"] = asm._emscripten_bind_b2AABB__GetPerimeter_p0;
var _emscripten_bind_b2DistanceProxy__set_m_count_p1 = Module["_emscripten_bind_b2DistanceProxy__set_m_count_p1"] = asm._emscripten_bind_b2DistanceProxy__set_m_count_p1;
var _emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1 = Module["_emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1"] = asm._emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1;
var _emscripten_bind_b2MouseJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2MouseJointDef__set_bodyA_p1"] = asm._emscripten_bind_b2MouseJointDef__set_bodyA_p1;
var _emscripten_bind_b2DynamicTree__GetAreaRatio_p0 = Module["_emscripten_bind_b2DynamicTree__GetAreaRatio_p0"] = asm._emscripten_bind_b2DynamicTree__GetAreaRatio_p0;
var _emscripten_bind_b2World__QueryAABB_p2 = Module["_emscripten_bind_b2World__QueryAABB_p2"] = asm._emscripten_bind_b2World__QueryAABB_p2;
var _emscripten_bind_b2RevoluteJoint__GetUpperLimit_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetUpperLimit_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetUpperLimit_p0;
var _emscripten_bind_b2World__SetGravity_p1 = Module["_emscripten_bind_b2World__SetGravity_p1"] = asm._emscripten_bind_b2World__SetGravity_p1;
var _emscripten_bind_b2PulleyJointDef__Initialize_p7 = Module["_emscripten_bind_b2PulleyJointDef__Initialize_p7"] = asm._emscripten_bind_b2PulleyJointDef__Initialize_p7;
var _emscripten_bind_b2Color__get_b_p0 = Module["_emscripten_bind_b2Color__get_b_p0"] = asm._emscripten_bind_b2Color__get_b_p0;
var _emscripten_bind_b2DistanceJoint__GetBodyA_p0 = Module["_emscripten_bind_b2DistanceJoint__GetBodyA_p0"] = asm._emscripten_bind_b2DistanceJoint__GetBodyA_p0;
var _emscripten_bind_b2BroadPhase__DestroyProxy_p1 = Module["_emscripten_bind_b2BroadPhase__DestroyProxy_p1"] = asm._emscripten_bind_b2BroadPhase__DestroyProxy_p1;
var _emscripten_bind_b2PulleyJoint____destroy___p0 = Module["_emscripten_bind_b2PulleyJoint____destroy___p0"] = asm._emscripten_bind_b2PulleyJoint____destroy___p0;
var _emscripten_bind_b2BroadPhase__GetProxyCount_p0 = Module["_emscripten_bind_b2BroadPhase__GetProxyCount_p0"] = asm._emscripten_bind_b2BroadPhase__GetProxyCount_p0;
var _emscripten_bind_b2DistanceJoint__GetLocalAnchorB_p0 = Module["_emscripten_bind_b2DistanceJoint__GetLocalAnchorB_p0"] = asm._emscripten_bind_b2DistanceJoint__GetLocalAnchorB_p0;
var _emscripten_bind_b2ChainShape__GetChildEdge_p2 = Module["_emscripten_bind_b2ChainShape__GetChildEdge_p2"] = asm._emscripten_bind_b2ChainShape__GetChildEdge_p2;
var _emscripten_bind_b2EdgeShape__b2EdgeShape_p0 = Module["_emscripten_bind_b2EdgeShape__b2EdgeShape_p0"] = asm._emscripten_bind_b2EdgeShape__b2EdgeShape_p0;
var _emscripten_bind_b2ContactEdge__set_contact_p1 = Module["_emscripten_bind_b2ContactEdge__set_contact_p1"] = asm._emscripten_bind_b2ContactEdge__set_contact_p1;
var _emscripten_bind_b2WheelJoint__SetMotorSpeed_p1 = Module["_emscripten_bind_b2WheelJoint__SetMotorSpeed_p1"] = asm._emscripten_bind_b2WheelJoint__SetMotorSpeed_p1;
var _emscripten_bind_b2ChainShape__GetType_p0 = Module["_emscripten_bind_b2ChainShape__GetType_p0"] = asm._emscripten_bind_b2ChainShape__GetType_p0;
var _emscripten_bind_b2Fixture__SetFilterData_p1 = Module["_emscripten_bind_b2Fixture__SetFilterData_p1"] = asm._emscripten_bind_b2Fixture__SetFilterData_p1;
var _emscripten_bind_b2Body__ApplyAngularImpulse_p1 = Module["_emscripten_bind_b2Body__ApplyAngularImpulse_p1"] = asm._emscripten_bind_b2Body__ApplyAngularImpulse_p1;
var _emscripten_bind_b2RevoluteJoint__SetLimits_p2 = Module["_emscripten_bind_b2RevoluteJoint__SetLimits_p2"] = asm._emscripten_bind_b2RevoluteJoint__SetLimits_p2;
var _emscripten_bind_b2ChainShape__TestPoint_p2 = Module["_emscripten_bind_b2ChainShape__TestPoint_p2"] = asm._emscripten_bind_b2ChainShape__TestPoint_p2;
var _emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0;
var _emscripten_bind_b2CircleShape__get_m_p_p0 = Module["_emscripten_bind_b2CircleShape__get_m_p_p0"] = asm._emscripten_bind_b2CircleShape__get_m_p_p0;
var _emscripten_bind_b2BodyDef__get_awake_p0 = Module["_emscripten_bind_b2BodyDef__get_awake_p0"] = asm._emscripten_bind_b2BodyDef__get_awake_p0;
var _emscripten_bind_b2MouseJoint__GetAnchorB_p0 = Module["_emscripten_bind_b2MouseJoint__GetAnchorB_p0"] = asm._emscripten_bind_b2MouseJoint__GetAnchorB_p0;
var _emscripten_bind_b2Body__CreateFixture_p1 = Module["_emscripten_bind_b2Body__CreateFixture_p1"] = asm._emscripten_bind_b2Body__CreateFixture_p1;
var _emscripten_bind_b2Body__CreateFixture_p2 = Module["_emscripten_bind_b2Body__CreateFixture_p2"] = asm._emscripten_bind_b2Body__CreateFixture_p2;
var _emscripten_bind_b2GearJointDef____destroy___p0 = Module["_emscripten_bind_b2GearJointDef____destroy___p0"] = asm._emscripten_bind_b2GearJointDef____destroy___p0;
var _emscripten_bind_b2Fixture__GetDensity_p0 = Module["_emscripten_bind_b2Fixture__GetDensity_p0"] = asm._emscripten_bind_b2Fixture__GetDensity_p0;
var _emscripten_bind_b2PrismaticJoint__GetJointTranslation_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetJointTranslation_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetJointTranslation_p0;
var _emscripten_bind_b2WeldJoint__GetDampingRatio_p0 = Module["_emscripten_bind_b2WeldJoint__GetDampingRatio_p0"] = asm._emscripten_bind_b2WeldJoint__GetDampingRatio_p0;
var _emscripten_bind_b2FrictionJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2FrictionJoint__GetReactionForce_p1"] = asm._emscripten_bind_b2FrictionJoint__GetReactionForce_p1;
var _emscripten_bind_b2BodyDef__set_userData_p1 = Module["_emscripten_bind_b2BodyDef__set_userData_p1"] = asm._emscripten_bind_b2BodyDef__set_userData_p1;
var _emscripten_bind_b2World__SetContactListener_p1 = Module["_emscripten_bind_b2World__SetContactListener_p1"] = asm._emscripten_bind_b2World__SetContactListener_p1;
var _emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0"] = asm._emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0;
var _emscripten_bind_b2FixtureDef__set_shape_p1 = Module["_emscripten_bind_b2FixtureDef__set_shape_p1"] = asm._emscripten_bind_b2FixtureDef__set_shape_p1;
var _emscripten_bind_b2DistanceJoint__SetDampingRatio_p1 = Module["_emscripten_bind_b2DistanceJoint__SetDampingRatio_p1"] = asm._emscripten_bind_b2DistanceJoint__SetDampingRatio_p1;
var _emscripten_bind_b2Joint__Dump_p0 = Module["_emscripten_bind_b2Joint__Dump_p0"] = asm._emscripten_bind_b2Joint__Dump_p0;
var _emscripten_bind_b2Shape__TestPoint_p2 = Module["_emscripten_bind_b2Shape__TestPoint_p2"] = asm._emscripten_bind_b2Shape__TestPoint_p2;
var _emscripten_bind_b2RopeJointDef__set_maxLength_p1 = Module["_emscripten_bind_b2RopeJointDef__set_maxLength_p1"] = asm._emscripten_bind_b2RopeJointDef__set_maxLength_p1;
var _emscripten_bind_b2RopeJoint__SetUserData_p1 = Module["_emscripten_bind_b2RopeJoint__SetUserData_p1"] = asm._emscripten_bind_b2RopeJoint__SetUserData_p1;
var _emscripten_bind_b2Transform__get_p_p0 = Module["_emscripten_bind_b2Transform__get_p_p0"] = asm._emscripten_bind_b2Transform__get_p_p0;
var _emscripten_bind_b2PulleyJoint__GetLengthA_p0 = Module["_emscripten_bind_b2PulleyJoint__GetLengthA_p0"] = asm._emscripten_bind_b2PulleyJoint__GetLengthA_p0;
var _emscripten_bind_b2GearJoint__GetJoint2_p0 = Module["_emscripten_bind_b2GearJoint__GetJoint2_p0"] = asm._emscripten_bind_b2GearJoint__GetJoint2_p0;
var _emscripten_bind_b2Fixture__GetMassData_p1 = Module["_emscripten_bind_b2Fixture__GetMassData_p1"] = asm._emscripten_bind_b2Fixture__GetMassData_p1;
var _emscripten_bind_b2Body__IsBullet_p0 = Module["_emscripten_bind_b2Body__IsBullet_p0"] = asm._emscripten_bind_b2Body__IsBullet_p0;
var _emscripten_bind_b2WeldJointDef____destroy___p0 = Module["_emscripten_bind_b2WeldJointDef____destroy___p0"] = asm._emscripten_bind_b2WeldJointDef____destroy___p0;
var _emscripten_bind_b2PrismaticJoint__GetMotorSpeed_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetMotorSpeed_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetMotorSpeed_p0;
var _emscripten_bind_b2GearJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2GearJointDef__get_bodyA_p1"] = asm._emscripten_bind_b2GearJointDef__get_bodyA_p1;
var _emscripten_bind_b2Draw__DrawCircle_p3 = Module["_emscripten_bind_b2Draw__DrawCircle_p3"] = asm._emscripten_bind_b2Draw__DrawCircle_p3;
var _emscripten_bind_b2FrictionJoint__GetLocalAnchorA_p0 = Module["_emscripten_bind_b2FrictionJoint__GetLocalAnchorA_p0"] = asm._emscripten_bind_b2FrictionJoint__GetLocalAnchorA_p0;
var _emscripten_bind_b2Body__GetWorldPoint_p1 = Module["_emscripten_bind_b2Body__GetWorldPoint_p1"] = asm._emscripten_bind_b2Body__GetWorldPoint_p1;
var _emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1;
var _emscripten_bind_b2GearJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2GearJointDef__set_bodyA_p1"] = asm._emscripten_bind_b2GearJointDef__set_bodyA_p1;
var _emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1;
var _emscripten_bind_b2BodyDef__set_bullet_p1 = Module["_emscripten_bind_b2BodyDef__set_bullet_p1"] = asm._emscripten_bind_b2BodyDef__set_bullet_p1;
var _emscripten_bind_b2BodyDef__get_angularVelocity_p0 = Module["_emscripten_bind_b2BodyDef__get_angularVelocity_p0"] = asm._emscripten_bind_b2BodyDef__get_angularVelocity_p0;
var _emscripten_bind_b2GearJoint__GetNext_p0 = Module["_emscripten_bind_b2GearJoint__GetNext_p0"] = asm._emscripten_bind_b2GearJoint__GetNext_p0;
var _emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0;
var _emscripten_bind_b2BodyDef__get_fixedRotation_p0 = Module["_emscripten_bind_b2BodyDef__get_fixedRotation_p0"] = asm._emscripten_bind_b2BodyDef__get_fixedRotation_p0;
var _emscripten_bind_b2Body__GetFixtureList_p0 = Module["_emscripten_bind_b2Body__GetFixtureList_p0"] = asm._emscripten_bind_b2Body__GetFixtureList_p0;
var _emscripten_bind_b2WheelJoint__GetJointTranslation_p0 = Module["_emscripten_bind_b2WheelJoint__GetJointTranslation_p0"] = asm._emscripten_bind_b2WheelJoint__GetJointTranslation_p0;
var _emscripten_bind_b2WeldJointDef__get_dampingRatio_p0 = Module["_emscripten_bind_b2WeldJointDef__get_dampingRatio_p0"] = asm._emscripten_bind_b2WeldJointDef__get_dampingRatio_p0;
var _emscripten_bind_b2RopeJoint__SetMaxLength_p1 = Module["_emscripten_bind_b2RopeJoint__SetMaxLength_p1"] = asm._emscripten_bind_b2RopeJoint__SetMaxLength_p1;
var _emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0 = Module["_emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0"] = asm._emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0;
var _emscripten_bind_b2PulleyJoint__GetGroundAnchorB_p0 = Module["_emscripten_bind_b2PulleyJoint__GetGroundAnchorB_p0"] = asm._emscripten_bind_b2PulleyJoint__GetGroundAnchorB_p0;
var _emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0"] = asm._emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0;
var _emscripten_bind_b2GearJointDef__set_joint2_p1 = Module["_emscripten_bind_b2GearJointDef__set_joint2_p1"] = asm._emscripten_bind_b2GearJointDef__set_joint2_p1;
var _emscripten_bind_b2BroadPhase__b2BroadPhase_p0 = Module["_emscripten_bind_b2BroadPhase__b2BroadPhase_p0"] = asm._emscripten_bind_b2BroadPhase__b2BroadPhase_p0;
var _emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0;
var _emscripten_bind_b2MouseJoint__SetTarget_p1 = Module["_emscripten_bind_b2MouseJoint__SetTarget_p1"] = asm._emscripten_bind_b2MouseJoint__SetTarget_p1;
var _emscripten_bind_b2ContactEdge__set_prev_p1 = Module["_emscripten_bind_b2ContactEdge__set_prev_p1"] = asm._emscripten_bind_b2ContactEdge__set_prev_p1;
var _emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0;
var _emscripten_bind_b2ChainShape__set_m_radius_p1 = Module["_emscripten_bind_b2ChainShape__set_m_radius_p1"] = asm._emscripten_bind_b2ChainShape__set_m_radius_p1;
var _emscripten_bind_b2Vec2__get_x_p0 = Module["_emscripten_bind_b2Vec2__get_x_p0"] = asm._emscripten_bind_b2Vec2__get_x_p0;
var _emscripten_bind_b2DistanceProxy__GetSupport_p1 = Module["_emscripten_bind_b2DistanceProxy__GetSupport_p1"] = asm._emscripten_bind_b2DistanceProxy__GetSupport_p1;
var _emscripten_bind_b2WheelJoint__GetLocalAnchorB_p0 = Module["_emscripten_bind_b2WheelJoint__GetLocalAnchorB_p0"] = asm._emscripten_bind_b2WheelJoint__GetLocalAnchorB_p0;
var _emscripten_bind_b2GearJointDef__get_joint2_p0 = Module["_emscripten_bind_b2GearJointDef__get_joint2_p0"] = asm._emscripten_bind_b2GearJointDef__get_joint2_p0;
var _emscripten_bind_b2PrismaticJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_collideConnected_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_collideConnected_p1;
var _emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1"] = asm._emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1;
var _emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1;
var _emscripten_bind_b2Fixture__SetDensity_p1 = Module["_emscripten_bind_b2Fixture__SetDensity_p1"] = asm._emscripten_bind_b2Fixture__SetDensity_p1;
var _emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1;
var _emscripten_bind_b2Body__IsAwake_p0 = Module["_emscripten_bind_b2Body__IsAwake_p0"] = asm._emscripten_bind_b2Body__IsAwake_p0;
var _emscripten_bind_b2MouseJoint__GetAnchorA_p0 = Module["_emscripten_bind_b2MouseJoint__GetAnchorA_p0"] = asm._emscripten_bind_b2MouseJoint__GetAnchorA_p0;
var _emscripten_bind_b2PolygonShape__SetAsBox_p4 = Module["_emscripten_bind_b2PolygonShape__SetAsBox_p4"] = asm._emscripten_bind_b2PolygonShape__SetAsBox_p4;
var _emscripten_bind_b2PolygonShape__SetAsBox_p2 = Module["_emscripten_bind_b2PolygonShape__SetAsBox_p2"] = asm._emscripten_bind_b2PolygonShape__SetAsBox_p2;
var _emscripten_bind_b2GearJointDef__set_joint1_p1 = Module["_emscripten_bind_b2GearJointDef__set_joint1_p1"] = asm._emscripten_bind_b2GearJointDef__set_joint1_p1;
var _emscripten_bind_b2Draw__DrawSolidCircle_p4 = Module["_emscripten_bind_b2Draw__DrawSolidCircle_p4"] = asm._emscripten_bind_b2Draw__DrawSolidCircle_p4;
var _emscripten_bind_b2World__GetSubStepping_p0 = Module["_emscripten_bind_b2World__GetSubStepping_p0"] = asm._emscripten_bind_b2World__GetSubStepping_p0;
var _emscripten_bind_b2FrictionJoint__GetLocalAnchorB_p0 = Module["_emscripten_bind_b2FrictionJoint__GetLocalAnchorB_p0"] = asm._emscripten_bind_b2FrictionJoint__GetLocalAnchorB_p0;
var _free = Module["_free"] = asm._free;
var _emscripten_bind_b2Body__SetLinearDamping_p1 = Module["_emscripten_bind_b2Body__SetLinearDamping_p1"] = asm._emscripten_bind_b2Body__SetLinearDamping_p1;
var _emscripten_bind_b2Body__GetWorldVector_p1 = Module["_emscripten_bind_b2Body__GetWorldVector_p1"] = asm._emscripten_bind_b2Body__GetWorldVector_p1;
var _emscripten_bind_b2Fixture__SetFriction_p1 = Module["_emscripten_bind_b2Fixture__SetFriction_p1"] = asm._emscripten_bind_b2Fixture__SetFriction_p1;
var _emscripten_bind_b2Filter__get_groupIndex_p0 = Module["_emscripten_bind_b2Filter__get_groupIndex_p0"] = asm._emscripten_bind_b2Filter__get_groupIndex_p0;
var _emscripten_bind_b2FixtureDef__get_isSensor_p0 = Module["_emscripten_bind_b2FixtureDef__get_isSensor_p0"] = asm._emscripten_bind_b2FixtureDef__get_isSensor_p0;
var _emscripten_bind_b2PrismaticJoint__GetUpperLimit_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetUpperLimit_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetUpperLimit_p0;
var _emscripten_bind_b2PrismaticJoint__Dump_p0 = Module["_emscripten_bind_b2PrismaticJoint__Dump_p0"] = asm._emscripten_bind_b2PrismaticJoint__Dump_p0;
var _emscripten_bind_b2Vec2__op_mul_p1 = Module["_emscripten_bind_b2Vec2__op_mul_p1"] = asm._emscripten_bind_b2Vec2__op_mul_p1;
var _emscripten_bind_b2DistanceProxy__Set_p2 = Module["_emscripten_bind_b2DistanceProxy__Set_p2"] = asm._emscripten_bind_b2DistanceProxy__Set_p2;
var _emscripten_bind_b2EdgeShape__Set_p2 = Module["_emscripten_bind_b2EdgeShape__Set_p2"] = asm._emscripten_bind_b2EdgeShape__Set_p2;
var _emscripten_bind_b2BodyDef__get_userData_p0 = Module["_emscripten_bind_b2BodyDef__get_userData_p0"] = asm._emscripten_bind_b2BodyDef__get_userData_p0;
var _emscripten_bind_b2CircleShape__set_m_p_p1 = Module["_emscripten_bind_b2CircleShape__set_m_p_p1"] = asm._emscripten_bind_b2CircleShape__set_m_p_p1;
var _emscripten_bind_b2WheelJoint__GetMaxMotorTorque_p0 = Module["_emscripten_bind_b2WheelJoint__GetMaxMotorTorque_p0"] = asm._emscripten_bind_b2WheelJoint__GetMaxMotorTorque_p0;
var _emscripten_bind_b2GearJoint__GetJoint1_p0 = Module["_emscripten_bind_b2GearJoint__GetJoint1_p0"] = asm._emscripten_bind_b2GearJoint__GetJoint1_p0;
var _emscripten_bind_b2WheelJointDef__set_dampingRatio_p1 = Module["_emscripten_bind_b2WheelJointDef__set_dampingRatio_p1"] = asm._emscripten_bind_b2WheelJointDef__set_dampingRatio_p1;
var _emscripten_bind_b2DistanceJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_collideConnected_p1"] = asm._emscripten_bind_b2DistanceJointDef__set_collideConnected_p1;
var _emscripten_bind_b2DistanceProxy__get_m_count_p0 = Module["_emscripten_bind_b2DistanceProxy__get_m_count_p0"] = asm._emscripten_bind_b2DistanceProxy__get_m_count_p0;
var _emscripten_bind_b2WeldJointDef__set_dampingRatio_p1 = Module["_emscripten_bind_b2WeldJointDef__set_dampingRatio_p1"] = asm._emscripten_bind_b2WeldJointDef__set_dampingRatio_p1;
var _emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1"] = asm._emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1;
var _emscripten_bind_b2GearJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2GearJoint__GetCollideConnected_p0"] = asm._emscripten_bind_b2GearJoint__GetCollideConnected_p0;
var _emscripten_bind_b2FrictionJoint__GetCollideConnected_p0 = Module["_emscripten_bind_b2FrictionJoint__GetCollideConnected_p0"] = asm._emscripten_bind_b2FrictionJoint__GetCollideConnected_p0;
var _memset = Module["_memset"] = asm._memset;
var _emscripten_bind_b2WheelJoint__Dump_p0 = Module["_emscripten_bind_b2WheelJoint__Dump_p0"] = asm._emscripten_bind_b2WheelJoint__Dump_p0;
var _emscripten_bind_b2World__GetTreeBalance_p0 = Module["_emscripten_bind_b2World__GetTreeBalance_p0"] = asm._emscripten_bind_b2World__GetTreeBalance_p0;
var _emscripten_bind_b2ContactListener__b2ContactListener_p0 = Module["_emscripten_bind_b2ContactListener__b2ContactListener_p0"] = asm._emscripten_bind_b2ContactListener__b2ContactListener_p0;
var _emscripten_bind_b2Rot____destroy___p0 = Module["_emscripten_bind_b2Rot____destroy___p0"] = asm._emscripten_bind_b2Rot____destroy___p0;
var _emscripten_bind_b2PrismaticJoint__GetMaxMotorForce_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetMaxMotorForce_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetMaxMotorForce_p0;
var _emscripten_bind_b2PulleyJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2PulleyJointDef__set_bodyB_p1"] = asm._emscripten_bind_b2PulleyJointDef__set_bodyB_p1;
var _emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0"] = asm._emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0;
var _emscripten_bind_b2RevoluteJoint__GetMotorSpeed_p0 = Module["_emscripten_bind_b2RevoluteJoint__GetMotorSpeed_p0"] = asm._emscripten_bind_b2RevoluteJoint__GetMotorSpeed_p0;
var _emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0 = Module["_emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0"] = asm._emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0;
var _emscripten_bind_b2Body__GetNext_p0 = Module["_emscripten_bind_b2Body__GetNext_p0"] = asm._emscripten_bind_b2Body__GetNext_p0;
var _emscripten_bind_b2BroadPhase__GetTreeHeight_p0 = Module["_emscripten_bind_b2BroadPhase__GetTreeHeight_p0"] = asm._emscripten_bind_b2BroadPhase__GetTreeHeight_p0;
var _emscripten_bind_b2Draw__DrawSegment_p3 = Module["_emscripten_bind_b2Draw__DrawSegment_p3"] = asm._emscripten_bind_b2Draw__DrawSegment_p3;
var _emscripten_bind_b2Body__IsActive_p0 = Module["_emscripten_bind_b2Body__IsActive_p0"] = asm._emscripten_bind_b2Body__IsActive_p0;
var _emscripten_bind_b2Vec2__Set_p2 = Module["_emscripten_bind_b2Vec2__Set_p2"] = asm._emscripten_bind_b2Vec2__Set_p2;
var _emscripten_bind_b2PulleyJoint__GetUserData_p0 = Module["_emscripten_bind_b2PulleyJoint__GetUserData_p0"] = asm._emscripten_bind_b2PulleyJoint__GetUserData_p0;
var _emscripten_bind_b2ContactEdge__b2ContactEdge_p0 = Module["_emscripten_bind_b2ContactEdge__b2ContactEdge_p0"] = asm._emscripten_bind_b2ContactEdge__b2ContactEdge_p0;
var _emscripten_bind_b2Vec3__b2Vec3_p3 = Module["_emscripten_bind_b2Vec3__b2Vec3_p3"] = asm._emscripten_bind_b2Vec3__b2Vec3_p3;
var _emscripten_bind_b2Vec3__b2Vec3_p0 = Module["_emscripten_bind_b2Vec3__b2Vec3_p0"] = asm._emscripten_bind_b2Vec3__b2Vec3_p0;
var _emscripten_bind_b2PulleyJoint__GetGroundAnchorA_p0 = Module["_emscripten_bind_b2PulleyJoint__GetGroundAnchorA_p0"] = asm._emscripten_bind_b2PulleyJoint__GetGroundAnchorA_p0;
var _emscripten_bind_b2JointDef__b2JointDef_p0 = Module["_emscripten_bind_b2JointDef__b2JointDef_p0"] = asm._emscripten_bind_b2JointDef__b2JointDef_p0;
var _emscripten_bind_b2PulleyJoint__GetBodyB_p0 = Module["_emscripten_bind_b2PulleyJoint__GetBodyB_p0"] = asm._emscripten_bind_b2PulleyJoint__GetBodyB_p0;
var _emscripten_bind_b2PulleyJointDef____destroy___p0 = Module["_emscripten_bind_b2PulleyJointDef____destroy___p0"] = asm._emscripten_bind_b2PulleyJointDef____destroy___p0;
var _emscripten_bind_b2FixtureDef____destroy___p0 = Module["_emscripten_bind_b2FixtureDef____destroy___p0"] = asm._emscripten_bind_b2FixtureDef____destroy___p0;
var _emscripten_bind_b2EdgeShape__Clone_p1 = Module["_emscripten_bind_b2EdgeShape__Clone_p1"] = asm._emscripten_bind_b2EdgeShape__Clone_p1;
var _emscripten_bind_b2Body__GetUserData_p0 = Module["_emscripten_bind_b2Body__GetUserData_p0"] = asm._emscripten_bind_b2Body__GetUserData_p0;
var _emscripten_bind_b2Body__SetUserData_p1 = Module["_emscripten_bind_b2Body__SetUserData_p1"] = asm._emscripten_bind_b2Body__SetUserData_p1;
var _emscripten_bind_b2FixtureDef__set_friction_p1 = Module["_emscripten_bind_b2FixtureDef__set_friction_p1"] = asm._emscripten_bind_b2FixtureDef__set_friction_p1;
var _emscripten_bind_b2PrismaticJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2PrismaticJointDef__get_bodyA_p1"] = asm._emscripten_bind_b2PrismaticJointDef__get_bodyA_p1;
var _emscripten_bind_b2FrictionJoint__GetType_p0 = Module["_emscripten_bind_b2FrictionJoint__GetType_p0"] = asm._emscripten_bind_b2FrictionJoint__GetType_p0;
var _emscripten_bind_b2DistanceJointDef____destroy___p0 = Module["_emscripten_bind_b2DistanceJointDef____destroy___p0"] = asm._emscripten_bind_b2DistanceJointDef____destroy___p0;
var _emscripten_bind_b2FrictionJointDef__Initialize_p3 = Module["_emscripten_bind_b2FrictionJointDef__Initialize_p3"] = asm._emscripten_bind_b2FrictionJointDef__Initialize_p3;
var _emscripten_bind_b2GearJoint__b2GearJoint_p1 = Module["_emscripten_bind_b2GearJoint__b2GearJoint_p1"] = asm._emscripten_bind_b2GearJoint__b2GearJoint_p1;
var _emscripten_bind_b2Body__SetSleepingAllowed_p1 = Module["_emscripten_bind_b2Body__SetSleepingAllowed_p1"] = asm._emscripten_bind_b2Body__SetSleepingAllowed_p1;
var _emscripten_bind_b2Body__SetLinearVelocity_p1 = Module["_emscripten_bind_b2Body__SetLinearVelocity_p1"] = asm._emscripten_bind_b2Body__SetLinearVelocity_p1;
var _emscripten_bind_b2Body__ApplyLinearImpulse_p2 = Module["_emscripten_bind_b2Body__ApplyLinearImpulse_p2"] = asm._emscripten_bind_b2Body__ApplyLinearImpulse_p2;
var _emscripten_bind_b2PulleyJoint__b2PulleyJoint_p1 = Module["_emscripten_bind_b2PulleyJoint__b2PulleyJoint_p1"] = asm._emscripten_bind_b2PulleyJoint__b2PulleyJoint_p1;
var _emscripten_bind_b2MouseJointDef__get_bodyB_p1 = Module["_emscripten_bind_b2MouseJointDef__get_bodyB_p1"] = asm._emscripten_bind_b2MouseJointDef__get_bodyB_p1;
var _emscripten_bind_b2ContactManager__set_m_contactList_p1 = Module["_emscripten_bind_b2ContactManager__set_m_contactList_p1"] = asm._emscripten_bind_b2ContactManager__set_m_contactList_p1;
var _emscripten_bind_b2MouseJoint__GetNext_p0 = Module["_emscripten_bind_b2MouseJoint__GetNext_p0"] = asm._emscripten_bind_b2MouseJoint__GetNext_p0;
var _emscripten_bind_b2Transform__get_q_p0 = Module["_emscripten_bind_b2Transform__get_q_p0"] = asm._emscripten_bind_b2Transform__get_q_p0;
var _emscripten_bind_b2DistanceJointDef__get_collideConnected_p1 = Module["_emscripten_bind_b2DistanceJointDef__get_collideConnected_p1"] = asm._emscripten_bind_b2DistanceJointDef__get_collideConnected_p1;
var _emscripten_bind_b2WeldJointDef__set_bodyB_p1 = Module["_emscripten_bind_b2WeldJointDef__set_bodyB_p1"] = asm._emscripten_bind_b2WeldJointDef__set_bodyB_p1;
var _emscripten_bind_b2DistanceJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2DistanceJoint__GetReactionForce_p1"] = asm._emscripten_bind_b2DistanceJoint__GetReactionForce_p1;
var _emscripten_bind_b2FrictionJoint____destroy___p0 = Module["_emscripten_bind_b2FrictionJoint____destroy___p0"] = asm._emscripten_bind_b2FrictionJoint____destroy___p0;
var _emscripten_bind_b2JointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2JointDef__set_collideConnected_p1"] = asm._emscripten_bind_b2JointDef__set_collideConnected_p1;
var _emscripten_bind_b2CircleShape__ComputeAABB_p3 = Module["_emscripten_bind_b2CircleShape__ComputeAABB_p3"] = asm._emscripten_bind_b2CircleShape__ComputeAABB_p3;
var _emscripten_bind_b2QueryCallback__ReportFixture_p1 = Module["_emscripten_bind_b2QueryCallback__ReportFixture_p1"] = asm._emscripten_bind_b2QueryCallback__ReportFixture_p1;
var _emscripten_bind_b2GearJoint__GetRatio_p0 = Module["_emscripten_bind_b2GearJoint__GetRatio_p0"] = asm._emscripten_bind_b2GearJoint__GetRatio_p0;
var _emscripten_bind_b2BlockAllocator__Allocate_p1 = Module["_emscripten_bind_b2BlockAllocator__Allocate_p1"] = asm._emscripten_bind_b2BlockAllocator__Allocate_p1;
var _emscripten_bind_b2GearJointDef__get_joint1_p0 = Module["_emscripten_bind_b2GearJointDef__get_joint1_p0"] = asm._emscripten_bind_b2GearJointDef__get_joint1_p0;
var _emscripten_bind_b2AABB__Contains_p1 = Module["_emscripten_bind_b2AABB__Contains_p1"] = asm._emscripten_bind_b2AABB__Contains_p1;
var _emscripten_bind_b2FrictionJoint__GetNext_p0 = Module["_emscripten_bind_b2FrictionJoint__GetNext_p0"] = asm._emscripten_bind_b2FrictionJoint__GetNext_p0;
var _emscripten_bind_b2ContactEdge____destroy___p0 = Module["_emscripten_bind_b2ContactEdge____destroy___p0"] = asm._emscripten_bind_b2ContactEdge____destroy___p0;
var _emscripten_bind_b2RevoluteJointDef__Initialize_p3 = Module["_emscripten_bind_b2RevoluteJointDef__Initialize_p3"] = asm._emscripten_bind_b2RevoluteJointDef__Initialize_p3;
var _emscripten_bind_b2BodyDef__set_angle_p1 = Module["_emscripten_bind_b2BodyDef__set_angle_p1"] = asm._emscripten_bind_b2BodyDef__set_angle_p1;
var _emscripten_bind_b2PrismaticJointDef__Initialize_p4 = Module["_emscripten_bind_b2PrismaticJointDef__Initialize_p4"] = asm._emscripten_bind_b2PrismaticJointDef__Initialize_p4;
var _emscripten_bind_b2Body__GetContactList_p0 = Module["_emscripten_bind_b2Body__GetContactList_p0"] = asm._emscripten_bind_b2Body__GetContactList_p0;
var _emscripten_bind_b2MouseJointDef__set_dampingRatio_p1 = Module["_emscripten_bind_b2MouseJointDef__set_dampingRatio_p1"] = asm._emscripten_bind_b2MouseJointDef__set_dampingRatio_p1;
var _emscripten_bind_b2PulleyJointDef__get_ratio_p0 = Module["_emscripten_bind_b2PulleyJointDef__get_ratio_p0"] = asm._emscripten_bind_b2PulleyJointDef__get_ratio_p0;
var _emscripten_bind_b2GearJoint__GetReactionForce_p1 = Module["_emscripten_bind_b2GearJoint__GetReactionForce_p1"] = asm._emscripten_bind_b2GearJoint__GetReactionForce_p1;
var _emscripten_bind_b2Body__GetWorldCenter_p0 = Module["_emscripten_bind_b2Body__GetWorldCenter_p0"] = asm._emscripten_bind_b2Body__GetWorldCenter_p0;
var _emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1 = Module["_emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1"] = asm._emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1;
var _emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1 = Module["_emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1"] = asm._emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1;
var _emscripten_bind_b2BodyDef__set_angularDamping_p1 = Module["_emscripten_bind_b2BodyDef__set_angularDamping_p1"] = asm._emscripten_bind_b2BodyDef__set_angularDamping_p1;
var _emscripten_bind_b2MouseJointDef__set_collideConnected_p1 = Module["_emscripten_bind_b2MouseJointDef__set_collideConnected_p1"] = asm._emscripten_bind_b2MouseJointDef__set_collideConnected_p1;
var _emscripten_bind_b2Shape__ComputeAABB_p3 = Module["_emscripten_bind_b2Shape__ComputeAABB_p3"] = asm._emscripten_bind_b2Shape__ComputeAABB_p3;
var _emscripten_bind_b2Joint__GetReactionTorque_p1 = Module["_emscripten_bind_b2Joint__GetReactionTorque_p1"] = asm._emscripten_bind_b2Joint__GetReactionTorque_p1;
var _emscripten_bind_b2WheelJoint__GetType_p0 = Module["_emscripten_bind_b2WheelJoint__GetType_p0"] = asm._emscripten_bind_b2WheelJoint__GetType_p0;
var _emscripten_bind_b2Vec3__op_add_p1 = Module["_emscripten_bind_b2Vec3__op_add_p1"] = asm._emscripten_bind_b2Vec3__op_add_p1;
var _emscripten_bind_b2Filter__get_categoryBits_p0 = Module["_emscripten_bind_b2Filter__get_categoryBits_p0"] = asm._emscripten_bind_b2Filter__get_categoryBits_p0;
var _emscripten_bind_b2Vec3__set_z_p1 = Module["_emscripten_bind_b2Vec3__set_z_p1"] = asm._emscripten_bind_b2Vec3__set_z_p1;
var _emscripten_bind_b2CircleShape__GetChildCount_p0 = Module["_emscripten_bind_b2CircleShape__GetChildCount_p0"] = asm._emscripten_bind_b2CircleShape__GetChildCount_p0;
var _emscripten_bind_b2Transform__set_p_p1 = Module["_emscripten_bind_b2Transform__set_p_p1"] = asm._emscripten_bind_b2Transform__set_p_p1;
var _emscripten_bind_b2Fixture__GetNext_p0 = Module["_emscripten_bind_b2Fixture__GetNext_p0"] = asm._emscripten_bind_b2Fixture__GetNext_p0;
var _emscripten_bind_b2World__SetWarmStarting_p1 = Module["_emscripten_bind_b2World__SetWarmStarting_p1"] = asm._emscripten_bind_b2World__SetWarmStarting_p1;
var _emscripten_bind_b2Vec3__op_sub_p0 = Module["_emscripten_bind_b2Vec3__op_sub_p0"] = asm._emscripten_bind_b2Vec3__op_sub_p0;
var _emscripten_bind_b2ContactManager__Collide_p0 = Module["_emscripten_bind_b2ContactManager__Collide_p0"] = asm._emscripten_bind_b2ContactManager__Collide_p0;
var _emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0 = Module["_emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0"] = asm._emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0;
var _emscripten_bind_b2ContactManager__get_m_contactListener_p0 = Module["_emscripten_bind_b2ContactManager__get_m_contactListener_p0"] = asm._emscripten_bind_b2ContactManager__get_m_contactListener_p0;
var _emscripten_bind_b2AABB__RayCast_p2 = Module["_emscripten_bind_b2AABB__RayCast_p2"] = asm._emscripten_bind_b2AABB__RayCast_p2;
var _emscripten_bind_b2WeldJoint__Dump_p0 = Module["_emscripten_bind_b2WeldJoint__Dump_p0"] = asm._emscripten_bind_b2WeldJoint__Dump_p0;
var _emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1 = Module["_emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1"] = asm._emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1;
var _emscripten_bind_b2EdgeShape__GetType_p0 = Module["_emscripten_bind_b2EdgeShape__GetType_p0"] = asm._emscripten_bind_b2EdgeShape__GetType_p0;
var _emscripten_bind_b2BodyDef__get_gravityScale_p0 = Module["_emscripten_bind_b2BodyDef__get_gravityScale_p0"] = asm._emscripten_bind_b2BodyDef__get_gravityScale_p0;
var _emscripten_bind_b2DistanceProxy__set_m_vertices_p1 = Module["_emscripten_bind_b2DistanceProxy__set_m_vertices_p1"] = asm._emscripten_bind_b2DistanceProxy__set_m_vertices_p1;
var _emscripten_bind_b2RevoluteJoint__SetMaxMotorTorque_p1 = Module["_emscripten_bind_b2RevoluteJoint__SetMaxMotorTorque_p1"] = asm._emscripten_bind_b2RevoluteJoint__SetMaxMotorTorque_p1;
var _emscripten_bind_b2MouseJointDef__get_bodyA_p1 = Module["_emscripten_bind_b2MouseJointDef__get_bodyA_p1"] = asm._emscripten_bind_b2MouseJointDef__get_bodyA_p1;
var _emscripten_bind_b2PulleyJoint__GetLengthB_p0 = Module["_emscripten_bind_b2PulleyJoint__GetLengthB_p0"] = asm._emscripten_bind_b2PulleyJoint__GetLengthB_p0;
var _emscripten_bind_b2WeldJointDef__set_referenceAngle_p1 = Module["_emscripten_bind_b2WeldJointDef__set_referenceAngle_p1"] = asm._emscripten_bind_b2WeldJointDef__set_referenceAngle_p1;
var _emscripten_bind_b2BlockAllocator__Free_p2 = Module["_emscripten_bind_b2BlockAllocator__Free_p2"] = asm._emscripten_bind_b2BlockAllocator__Free_p2;
var _emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0 = Module["_emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0"] = asm._emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0;
var _emscripten_bind_b2GearJoint__SetRatio_p1 = Module["_emscripten_bind_b2GearJoint__SetRatio_p1"] = asm._emscripten_bind_b2GearJoint__SetRatio_p1;
var _emscripten_bind_b2BodyDef__get_angle_p0 = Module["_emscripten_bind_b2BodyDef__get_angle_p0"] = asm._emscripten_bind_b2BodyDef__get_angle_p0;
var _emscripten_bind_b2PrismaticJoint__GetReferenceAngle_p0 = Module["_emscripten_bind_b2PrismaticJoint__GetReferenceAngle_p0"] = asm._emscripten_bind_b2PrismaticJoint__GetReferenceAngle_p0;
var _emscripten_bind_b2WeldJointDef__set_bodyA_p1 = Module["_emscripten_bind_b2WeldJointDef__set_bodyA_p1"] = asm._emscripten_bind_b2WeldJointDef__set_bodyA_p1;
var _emscripten_bind_b2DynamicTree__GetHeight_p0 = Module["_emscripten_bind_b2DynamicTree__GetHeight_p0"] = asm._emscripten_bind_b2DynamicTree__GetHeight_p0;
var dynCall_viiiii = Module["dynCall_viiiii"] = asm.dynCall_viiiii;
var dynCall_vif = Module["dynCall_vif"] = asm.dynCall_vif;
var dynCall_viifii = Module["dynCall_viifii"] = asm.dynCall_viifii;
var dynCall_vi = Module["dynCall_vi"] = asm.dynCall_vi;
var dynCall_vii = Module["dynCall_vii"] = asm.dynCall_vii;
var dynCall_ii = Module["dynCall_ii"] = asm.dynCall_ii;
var dynCall_viifi = Module["dynCall_viifi"] = asm.dynCall_viifi;
var dynCall_if = Module["dynCall_if"] = asm.dynCall_if;
var dynCall_iiiii = Module["dynCall_iiiii"] = asm.dynCall_iiiii;
var dynCall_viffif = Module["dynCall_viffif"] = asm.dynCall_viffif;
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
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm.dynCall_iiiiii;
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
