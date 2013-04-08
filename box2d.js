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
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = size;
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Types.types[field].alignSize;
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      alignSize = type.packed ? 1 : Math.min(alignSize, Runtime.QUANTUM_SIZE);
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
  addFunction: function (func, sig) {
    //assert(sig); // TODO: support asm
    var table = FUNCTION_TABLE; // TODO: support asm
    var ret = table.length;
    table.push(func);
    table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE; // TODO: support asm
    table[index] = null;
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
        Runtime.dynCall(sig, func, arguments);
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
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+3)>>2)<<2); if (STATICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 4))*(quantum ? quantum : 4); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};
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
var ALLOC_NONE = 3; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
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
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
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
var STACK_ROOT, STACKTOP, STACK_MAX;
var STATICTOP;
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
STACK_ROOT = STACKTOP = Runtime.alignMemory(1);
STACK_MAX = TOTAL_STACK; // we lose a little stack here, but TOTAL_STACK is nice and round so use that as the max
var tempDoublePtr = Runtime.alignMemory(allocate(12, 'i8', ALLOC_STACK), 8);
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
STATICTOP = STACK_MAX;
assert(STATICTOP < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var nullString = allocate(intArrayFromString('(null)'), 'i8', ALLOC_STACK);
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
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
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, TOTAL_STACK);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    // synchronous
    applyData(Module['readBinary'](filename));
  } else {
    // asynchronous
    addPreRun(function() {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    });
  }
}
// === Body ===
assert(STATICTOP == STACK_MAX); assert(STACK_MAX == TOTAL_STACK);
STATICTOP += 19492;
assert(STATICTOP < TOTAL_MEMORY);
__ATINIT__ = __ATINIT__.concat([
]);
var __ZTVN10__cxxabiv120__si_class_type_infoE;
var __ZTVN10__cxxabiv117__class_type_infoE;
var __ZTISt9exception;
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,212,70,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,224,70,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,54,2,0,0,24,6,0,0,30,3,0,0,156,4,0,0,174,4,0,0,32,2,0,0,218,3,0,0,250,5,0,0,182,5,0,0,114,4,0,0,2,6,0,0,44,1,0,0,142,2,0,0,20,1,0,0,158,2,0,0,40,3,0,0,208,2,0,0,14,2,0,0,154,3,0,0,214,4,0,0,82,5,0,0,180,3,0,0,170,1,0,0,6,0,0,0,118,3,0,0,244,5,0,0,98,1,0,0,198,3,0,0,60,5,0,0,210,0,0,0,82,3,0,0,116,0,0,0,242,0,0,0,138,0,0,0,72,4,0,0,32,1,0,0,174,2,0,0,82,0,0,0,166,0,0,0,64,2,0,0,100,2,0,0,234,4,0,0,50,3,0,0,6,2,0,0,18,4,0,0,124,0,0,0,134,5,0,0,228,2,0,0,210,3,0,0,2,4,0,0,228,3,0,0,118,0,0,0,186,3,0,0,78,2,0,0,196,4,0,0,52,4,0,0,0,2,0,0,194,4,0,0,98,0,0,0,166,2,0,0,116,5,0,0,78,5,0,0,240,3,0,0,240,4,0,0,0,3,0,0,112,4,0,0,190,4,0,0,186,1,0,0,86,0,0,0,28,3,0,0,234,5,0,0,58,4,0,0,84,0,0,0,122,4,0,0,176,1,0,0,152,1,0,0,74,0,0,0,152,4,0,0,192,1,0,0,126,0,0,0,118,2,0,0,254,1,0,0,120,0,0,0,30,4,0,0,184,0,0,0,4,6,0,0,56,1,0,0,88,0,0,0,230,2,0,0,100,4,0,0,152,0,0,0,224,0,0,0,156,2,0,0,178,3,0,0,246,5,0,0,102,5,0,0,172,3,0,0,188,1,0,0,180,1,0,0,236,3,0,0,204,3,0,0,76,4,0,0,148,3,0,0,30,2,0,0,106,0,0,0,200,3,0,0,82,2,0,0,10,5,0,0,50,4,0,0,216,2,0,0,26,3,0,0,98,5,0,0,222,4,0,0,62,1,0,0,242,1,0,0,10,4,0,0,16,1,0,0,76,5,0,0,42,1,0,0,12,5,0,0,114,2,0,0,14,6,0,0,206,1,0,0,162,2,0,0,12,1,0,0,38,3,0,0,212,0,0,0,82,4,0,0,106,4,0,0,70,4,0,0,62,2,0,0,238,2,0,0,246,4,0,0,234,3,0,0,166,3,0,0,56,0,0,0,200,0,0,0,194,1,0,0,64,0,0,0,112,3,0,0,198,1,0,0,120,4,0,0,36,6,0,0,18,6,0,0,164,0,0,0,76,0,0,0,154,1,0,0,50,0,0,0,54,0,0,0,192,3,0,0,86,2,0,0,146,1,0,0,70,2,0,0,76,1,0,0,120,5,0,0,180,2,0,0,128,4,0,0,46,1,0,0,240,1,0,0,134,2,0,0,212,4,0,0,14,3,0,0,50,5,0,0,136,2,0,0,224,2,0,0,56,4,0,0,132,4,0,0,68,4,0,0,202,4,0,0,102,0,0,0,24,3,0,0,252,4,0,0,58,2,0,0,218,4,0,0,180,4,0,0,250,1,0,0,168,4,0,0,60,2,0,0,108,3,0,0,248,0,0,0,36,0,0,0,226,1,0,0,14,4,0,0,198,5,0,0,120,1,0,0,8,0,0,0,208,1,0,0,90,4,0,0,244,1,0,0,172,0,0,0,170,2,0,0,94,2,0,0,66,3,0,0,70,5,0,0,68,5,0,0,190,0,0,0,210,2,0,0,238,4,0,0,178,5,0,0,118,1,0,0,20,3,0,0,144,2,0,0,102,4,0,0,50,1,0,0,110,2,0,0,220,1,0,0,92,5,0,0,198,0,0,0,138,2,0,0,70,0,0,0,158,5,0,0,12,6,0,0,44,0,0,0,62,3,0,0,218,2,0,0,142,3,0,0,206,4,0,0,250,2,0,0,226,0,0,0,196,1,0,0,92,3,0,0,110,3,0,0,42,4,0,0,122,2,0,0,76,3,0,0,242,3,0,0,28,1,0,0,126,3,0,0,168,1,0,0,240,0,0,0,94,3,0,0,112,1,0,0,26,1,0,0,150,1,0,0,106,3,0,0,184,2,0,0,174,3,0,0,248,3,0,0,8,2,0,0,70,1,0,0,230,5,0,0,74,1,0,0,250,4,0,0,244,2,0,0,160,5,0,0,22,0,0,0,160,0,0,0,72,1,0,0,74,3,0,0,162,5,0,0,16,2,0,0,216,3,0,0,136,4,0,0,184,1,0,0,176,5,0,0,142,1,0,0,12,2,0,0,132,5,0,0,174,5,0,0,136,3,0,0,252,0,0,0,44,4,0,0,124,1,0,0,184,4,0,0,108,4,0,0,162,3,0,0,80,1,0,0,64,5,0,0,100,1,0,0,228,4,0,0,230,4,0,0,166,1,0,0,162,4,0,0,248,4,0,0,56,2,0,0,130,5,0,0,2,1,0,0,36,4,0,0,172,2,0,0,42,3,0,0,214,5,0,0,16,5,0,0,254,0,0,0,26,0,0,0,4,5,0,0,98,4,0,0,16,3,0,0,80,5,0,0,202,0,0,0,242,2,0,0,54,3,0,0,80,0,0,0,16,6,0,0,106,2,0,0,140,5,0,0,168,3,0,0,216,4,0,0,96,0,0,0,222,0,0,0,90,0,0,0,146,0,0,0,182,3,0,0,28,2,0,0,96,5,0,0,194,3,0,0,20,0,0,0,54,4,0,0,84,5,0,0,130,1,0,0,150,0,0,0,236,2,0,0,232,5,0,0,134,3,0,0,110,1,0,0,56,5,0,0,130,3,0,0,108,2,0,0,112,2,0,0,108,1,0,0,200,2,0,0,22,3,0,0,180,0,0,0,170,5,0,0,196,0,0,0,224,4,0,0,186,2,0,0,204,0,0,0,84,1,0,0,250,0,0,0,226,2,0,0,158,0,0,0,212,1,0,0,228,5,0,0,212,2,0,0,30,1,0,0,136,5,0,0,206,3,0,0,44,5,0,0,170,0,0,0,218,1,0,0,228,1,0,0,108,5,0,0,228,0,0,0,180,5,0,0,220,2,0,0,208,5,0,0,32,6,0,0,26,5,0,0,94,0,0,0,80,2,0,0,0,4,0,0,128,2,0,0,106,1,0,0,182,2,0,0,154,4,0,0,32,5,0,0,24,0,0,0,142,5,0,0,152,5,0,0,46,0,0,0,146,3,0,0,148,1,0,0,92,0,0,0,122,3,0,0,38,0,0,0,246,1,0,0,44,3,0,0,222,2,0,0,88,5,0,0,234,0,0,0,192,0,0,0,92,4,0,0,92,2,0,0,42,2,0,0,26,6,0,0,178,2,0,0,148,5,0,0,146,5,0,0,218,0,0,0,248,5,0,0,190,1,0,0,90,5,0,0,86,4,0,0,172,1,0,0,126,1,0,0,10,0,0,0,36,2,0,0,110,5,0,0,82,1,0,0,68,0,0,0,150,2,0,0,8,1,0,0,238,3,0,0,156,5,0,0,86,5,0,0,80,3,0,0,244,4,0,0,6,4,0,0,30,0,0,0,48,2,0,0,86,1,0,0,138,1,0,0,44,2,0,0,28,4,0,0,90,1,0,0,10,3,0,0,20,5,0,0,188,2,0,0,12,3,0,0,232,3,0,0,68,1,0,0,254,3,0,0,194,0,0,0,34,4,0,0,10,6,0,0,100,0,0,0,158,3,0,0,66,1,0,0,198,2,0,0,8,4,0,0,188,0,0,0,48,5,0,0,30,5,0,0,18,5,0,0,28,6,0,0,72,0,0,0,2,2,0,0,64,1,0,0,132,1,0,0,130,4,0,0,48,1,0,0,58,5,0,0,122,5,0,0,194,2,0,0,26,4,0,0,244,3,0,0,18,2,0,0,216,0,0,0,6,1,0,0,130,0,0,0,128,0,0,0,20,4,0,0,64,3,0,0,90,3,0,0,4,4,0,0,220,3,0,0,140,2,0,0,252,2,0,0,114,1,0,0,162,1,0,0,6,3,0,0,248,1,0,0,74,2,0,0,52,3,0,0,206,2,0,0,34,0,0,0,12,0,0,0,106,5,0,0,142,4,0,0,74,4,0,0,52,2,0,0,32,3,0,0,80,4,0,0,246,3,0,0,128,3,0,0,196,5,0,0,164,2,0,0,140,4,0,0,22,5,0,0,238,1,0,0,182,1,0,0,4,3,0,0,66,0,0,0,0,6,0,0,78,0,0,0,62,5,0,0,224,5,0,0,154,0,0,0,42,5,0,0,206,5,0,0,220,4,0,0,156,0,0,0,198,4,0,0,154,5,0,0,96,3,0,0,220,5,0,0,8,3,0,0,100,3,0,0,158,1,0,0,178,1,0,0,242,4,0,0,38,5,0,0,68,2,0,0,116,3,0,0,150,3,0,0,192,4,0,0,232,0,0,0,144,4,0,0,128,5,0,0,176,3,0,0,40,2,0,0,208,0,0,0,114,0,0,0,202,1,0,0,66,4,0,0,34,3,0,0,48,3,0,0,28,0,0,0,192,5,0,0,150,5,0,0,14,1,0,0,88,4,0,0,42,0,0,0,240,5,0,0,124,2,0,0,0,5,0,0,188,3,0,0,96,4,0,0,176,0,0,0,132,3,0,0,152,3,0,0,32,4,0,0,36,3,0,0,208,3,0,0,226,3,0,0,160,3,0,0,230,0,0,0,8,5,0,0,126,4,0,0,182,0,0,0,34,2,0,0,20,2,0,0,12,4,0,0,36,1,0,0,86,3,0,0,112,5,0,0,104,4,0,0,40,4,0,0,116,2,0,0,160,4,0,0,134,0,0,0,94,4,0,0,190,3,0,0,148,2,0,0,214,3,0,0,140,3,0,0,142,0,0,0,232,2,0,0,110,0,0,0,226,5,0,0,234,2,0,0,248,2,0,0,114,5,0,0,16,4,0,0,168,5,0,0,116,4,0,0,36,5,0,0,18,1,0,0,116,1,0,0,156,3,0,0,14,0,0,0,54,1,0,0,62,0,0,0,74,5,0,0,40,5,0,0,202,5,0,0,200,5,0,0,54,5,0,0,46,5,0,0,224,1,0,0,250,3,0,0,208,4,0,0,58,1,0,0,98,2,0,0,94,1,0,0,232,1,0,0,122,1,0,0,174,0,0,0,144,5,0,0,138,4,0,0,38,1,0,0,170,3,0,0,164,4,0,0,0,1,0,0,202,3,0,0,238,0,0,0,172,4,0,0,124,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,65,80,0,44,66,80,0,0,0,0,0,0,0,0,0,109,95,102,105,120,116,117,114,101,67,111,117,110,116,32,62,32,48,0,0,32,32,106,100,46,109,97,120,77,111,116,111,114,84,111,114,113,117,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,101,110,97,98,108,101,76,105,109,105,116,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,32,32,106,100,46,106,111,105,110,116,50,32,61,32,106,111,105,110,116,115,91,37,100,93,59,10,0,0,32,32,106,100,46,109,97,120,70,111,114,99,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,98,50,86,101,99,50,32,103,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,0,32,32,32,32,102,100,46,102,105,108,116,101,114,46,109,97,115,107,66,105,116,115,32,61,32,117,105,110,116,49,54,40,37,100,41,59,10,0,0,0,48,32,60,61,32,105,66,32,38,38,32,105,66,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,102,105,120,116,117,114,101,45,62,109,95,98,111,100,121,32,61,61,32,116,104,105,115,0,32,32,106,100,46,109,111,116,111,114,83,112,101,101,100,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,103,114,111,117,110,100,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,32,32,106,100,46,106,111,105,110,116,49,32,61,32,106,111,105,110,116,115,91,37,100,93,59,10,0,0,118,101,114,116,101,120,67,111,117,110,116,32,60,61,32,56,0,0,0,0,32,32,32,32,102,100,46,102,105,108,116,101,114,46,99,97,116,101,103,111,114,121,66,105,116,115,32,61,32,117,105,110,116,49,54,40,37,100,41,59,10,0,0,0,105,65,32,33,61,32,40,45,49,41,0,0,109,95,119,111,114,108,100,45,62,73,115,76,111,99,107,101,100,40,41,32,61,61,32,102,97,108,115,101,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,66,111,100,121,46,99,112,112,0,0,32,32,106,100,46,101,110,97,98,108,101,77,111,116,111,114,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,32,32,106,100,46,103,114,111,117,110,100,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,109,109,111,110,47,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,46,99,112,112,0,0,97,108,112,104,97,48,32,60,32,49,46,48,102,0,0,0,32,32,32,32,102,100,46,105,115,83,101,110,115,111,114,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,99,104,105,108,100,50,32,33,61,32,40,45,49,41,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,108,105,110,101,97,114,68,97,109,112,105,110,103,41,32,38,38,32,98,100,45,62,108,105,110,101,97,114,68,97,109,112,105,110,103,32,62,61,32,48,46,48,102,0,0,0,99,111,117,110,116,32,62,61,32,51,0,0,32,32,106,100,46,108,111,99,97,108,65,120,105,115,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,32,32,106,100,46,114,101,102,101,114,101,110,99,101,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,109,97,120,76,101,110,103,116,104,32,61,32,37,46,49,53,108,101,102,59,10,0,0,77,111,117,115,101,32,106,111,105,110,116,32,100,117,109,112,105,110,103,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,46,10,0,0,32,32,106,100,46,108,101,110,103,116,104,32,61,32,37,46,49,53,108,101,102,59,10,0,99,104,105,108,100,49,32,33,61,32,40,45,49,41,0,0,116,121,112,101,65,32,61,61,32,98,50,95,100,121,110,97,109,105,99,66,111,100,121,32,124,124,32,116,121,112,101,66,32,61,61,32,98,50,95,100,121,110,97,109,105,99,66,111,100,121,0,0,32,32,32,32,102,100,46,100,101,110,115,105,116,121,32,61,32,37,46,49,53,108,101,102,59,10,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,105,115,116,97,110,99,101,46,99,112,112,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,109,109,111,110,47,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,46,99,112,112,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,97,110,103,117,108,97,114,68,97,109,112,105,110,103,41,32,38,38,32,98,100,45,62,97,110,103,117,108,97,114,68,97,109,112,105,110,103,32,62,61,32,48,46,48,102,0,112,32,61,61,32,101,110,116,114,121,45,62,100,97,116,97,0,0,0,0,97,114,101,97,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,0,99,104,105,108,100,73,110,100,101,120,32,60,32,109,95,99,111,117,110,116,0,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,66,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,48,32,60,32,99,111,117,110,116,32,38,38,32,99,111,117,110,116,32,60,32,51,0,0,100,32,43,32,104,32,42,32,107,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,112,99,45,62,112,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,83,104,97,112,101,115,47,98,50,80,111,108,121,103,111,110,83,104,97,112,101,46,99,112,112,0,0,109,95,110,111,100,101,115,91,112,114,111,120,121,73,100,93,46,73,115,76,101,97,102,40,41,0,0,0,115,116,97,99,107,67,111,117,110,116,32,60,32,115,116,97,99,107,83,105,122,101,0,0,32,32,32,32,102,100,46,114,101,115,116,105,116,117,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,99,97,99,104,101,45,62,99,111,117,110,116,32,60,61,32,51,0,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,97,110,103,117,108,97,114,86,101,108,111,99,105,116,121,41,0,0,109,95,101,110,116,114,121,67,111,117,110,116,32,62,32,48,0,0,0,0,98,108,111,99,107,67,111,117,110,116,32,42,32,98,108,111,99,107,83,105,122,101,32,60,61,32,98,50,95,99,104,117,110,107,83,105,122,101,0,0,109,95,118,101,114,116,101,120,67,111,117,110,116,32,62,61,32,51,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,109,95,99,111,117,110,116,32,45,32,49,0,0,0,32,32,106,100,46,108,111,99,97,108,65,110,99,104,111,114,65,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,98,50,73,115,86,97,108,105,100,40,100,101,102,45,62,100,97,109,112,105,110,103,82,97,116,105,111,41,32,38,38,32,100,101,102,45,62,100,97,109,112,105,110,103,82,97,116,105,111,32,62,61,32,48,46,48,102,0,0,0,32,32,98,50,71,101,97,114,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,97,46,120,32,62,61,32,48,46,48,102,32,38,38,32,97,46,121,32,62,61,32,48,46,48,102,0,0,48,32,60,61,32,116,121,112,101,65,32,38,38,32,116,121,112,101,66,32,60,32,98,50,83,104,97,112,101,58,58,101,95,116,121,112,101,67,111,117,110,116,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,83,104,97,112,101,115,47,98,50,67,104,97,105,110,83,104,97,112,101,46,99,112,112,0,0,0,0,98,45,62,73,115,65,99,116,105,118,101,40,41,32,61,61,32,116,114,117,101,0,0,0,32,32,98,50,87,104,101,101,108,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,32,32,32,32,102,100,46,102,114,105,99,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,98,50,87,101,108,100,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,109,95,99,111,117,110,116,0,0,0,32,32,98,50,82,111,112,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,98,50,73,115,86,97,108,105,100,40,98,100,45,62,97,110,103,108,101,41,0,0,0,0,109,95,101,110,116,114,121,67,111,117,110,116,32,60,32,98,50,95,109,97,120,83,116,97,99,107,69,110,116,114,105,101,115,0,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,98,50,95,98,108,111,99,107,83,105,122,101,115,0,48,46,48,102,32,60,61,32,108,111,119,101,114,32,38,38,32,108,111,119,101,114,32,60,61,32,105,110,112,117,116,46,109,97,120,70,114,97,99,116,105,111,110,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,80,117,108,108,101,121,74,111,105,110,116,46,99,112,112,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,84,105,109,101,79,102,73,109,112,97,99,116,46,99,112,112,0,99,111,117,110,116,32,62,61,32,50,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,32,32,106,100,46,99,111,108,108,105,100,101,67,111,110,110,101,99,116,101,100,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,32,32,98,50,80,117,108,108,101,121,74,111,105,110,116,68,101,102,32,106,100,59,10,0,98,50,73,115,86,97,108,105,100,40,100,101,102,45,62,102,114,101,113,117,101,110,99,121,72,122,41,32,38,38,32,100,101,102,45,62,102,114,101,113,117,101,110,99,121,72,122,32,62,61,32,48,46,48,102,0,47,47,32,68,117,109,112,32,105,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,102,111,114,32,116,104,105,115,32,106,111,105,110,116,32,116,121,112,101,46,10,0,0,32,32,32,32,98,111,100,105,101,115,91,37,100,93,45,62,67,114,101,97,116,101,70,105,120,116,117,114,101,40,38,102,100,41,59,10,0,0,0,0,32,32,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,77,111,117,115,101,74,111,105,110,116,46,99,112,112,0,112,111,105,110,116,67,111,117,110,116,32,61,61,32,49,32,124,124,32,112,111,105,110,116,67,111,117,110,116,32,61,61,32,50,0,0,115,95,105,110,105,116,105,97,108,105,122,101,100,32,61,61,32,116,114,117,101,0,0,0,32,32,32,32,102,100,46,115,104,97,112,101,32,61,32,38,115,104,97,112,101,59,10,0,109,95,106,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,0,0,48,32,60,32,109,95,110,111,100,101,67,111,117,110,116,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,74,111,105,110,116,46,99,112,112,0,0,32,32,32,32,98,50,70,105,120,116,117,114,101,68,101,102,32,102,100,59,10,0,0,0,10,0,0,0,32,32,125,10,0,0,0,0,110,111,100,101,45,62,73,115,76,101,97,102,40,41,32,61,61,32,102,97,108,115,101,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,74,111,105,110,116,115,47,98,50,71,101,97,114,74,111,105,110,116,46,99,112,112,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,78,101,120,116,86,101,114,116,101,120,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,32,32,123,10,0,0,0,0,109,95,110,111,100,101,67,111,117,110,116,32,43,32,102,114,101,101,67,111,117,110,116,32,61,61,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,105,115,116,97,110,99,101,46,104,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,80,114,101,118,86,101,114,116,101,120,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,71,101,116,72,101,105,103,104,116,40,41,32,61,61,32,67,111,109,112,117,116,101,72,101,105,103,104,116,40,41,0,0,48,32,60,61,32,102,114,101,101,73,110,100,101,120,32,38,38,32,102,114,101,101,73,110,100,101,120,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,0,109,95,98,111,100,121,67,111,117,110,116,32,60,32,109,95,98,111,100,121,67,97,112,97,99,105,116,121,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,110,101,120,116,86,101,114,116,101,120,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,32,32,98,111,100,105,101,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,66,111,100,121,40,38,98,100,41,59,10,0,0,0,32,32,98,50,68,105,115,116,97,110,99,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,98,100,45,62,108,105,110,101,97,114,86,101,108,111,99,105,116,121,46,73,115,86,97,108,105,100,40,41,0,0,0,0,109,95,101,110,116,114,121,67,111,117,110,116,32,61,61,32,48,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,46,99,112,112,0,0,0,109,95,99,111,110,116,97,99,116,67,111,117,110,116,32,60,32,109,95,99,111,110,116,97,99,116,67,97,112,97,99,105,116,121,0,0,32,32,32,32,115,104,97,112,101,46,109,95,112,114,101,118,86,101,114,116,101,120,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,32,32,98,100,46,103,114,97,118,105,116,121,83,99,97,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,97,97,98,98,46,117,112,112,101,114,66,111,117,110,100,32,61,61,32,110,111,100,101,45,62,97,97,98,98,46,117,112,112,101,114,66,111,117,110,100,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,0,109,95,106,111,105,110,116,67,111,117,110,116,32,60,32,109,95,106,111,105,110,116,67,97,112,97,99,105,116,121,0,0,32,32,32,32,115,104,97,112,101,46,67,114,101,97,116,101,67,104,97,105,110,40,118,115,44,32,37,100,41,59,10,0,32,32,98,100,46,97,99,116,105,118,101,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,48,32,60,32,115,105,122,101,0,0,0,0,97,97,98,98,46,108,111,119,101,114,66,111,117,110,100,32,61,61,32,110,111,100,101,45,62,97,97,98,98,46,108,111,119,101,114,66,111,117,110,100,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,101,100,103,101,46,76,101,110,103,116,104,83,113,117,97,114,101,100,40,41,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,32,42,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,73,115,108,97,110,100,46,104,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,32,32,32,32,98,50,67,104,97,105,110,83,104,97,112,101,32,115,104,97,112,101,59,10,0,0,0,0,32,32,98,100,46,98,117,108,108,101,116,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,110,111,100,101,45,62,104,101,105,103,104,116,32,61,61,32,104,101,105,103,104,116,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,109,109,111,110,47,98,50,77,97,116,104,46,104,0,0,32,32,106,100,46,98,111,100,121,66,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,32,32,32,32,115,104,97,112,101,46,83,101,116,40,118,115,44,32,37,100,41,59,10,0,32,32,98,100,46,102,105,120,101,100,82,111,116,97,116,105,111,110,32,61,32,98,111,111,108,40,37,100,41,59,10,0,109,95,110,111,100,101,115,91,99,104,105,108,100,50,93,46,112,97,114,101,110,116,32,61,61,32,105,110,100,101,120,0,32,32,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,0,100,101,102,45,62,114,97,116,105,111,32,33,61,32,48,46,48,102,0,0,32,32,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,68,101,102,32,106,100,59,10,0,0,98,50,73,115,86,97,108,105,100,40,100,101,102,45,62,109,97,120,70,111,114,99,101,41,32,38,38,32,100,101,102,45,62,109,97,120,70,111,114,99,101,32,62,61,32,48,46,48,102,0,0,0,100,101,102,45,62,98,111,100,121,65,32,33,61,32,100,101,102,45,62,98,111,100,121,66,0,0,0,0,32,32,32,32,118,115,91,37,100,93,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,32,32,98,100,46,97,119,97,107,101,32,61,32,98,111,111,108,40,37,100,41,59,10,0,109,95,116,121,112,101,66,32,61,61,32,101,95,114,101,118,111,108,117,116,101,74,111,105,110,116,32,124,124,32,109,95,116,121,112,101,66,32,61,61,32,101,95,112,114,105,115,109,97,116,105,99,74,111,105,110,116,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,46,99,112,112,0,0,0,0,109,95,110,111,100,101,115,91,99,104,105,108,100,49,93,46,112,97,114,101,110,116,32,61,61,32,105,110,100,101,120,0,109,95,102,105,120,116,117,114,101,66,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,112,111,108,121,103,111,110,0,109,95,102,105,120,116,117,114,101,66,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,99,105,114,99,108,101,0,0,109,97,110,105,102,111,108,100,45,62,112,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,0,0,48,32,60,61,32,116,121,112,101,50,32,38,38,32,116,121,112,101,50,32,60,32,98,50,83,104,97,112,101,58,58,101,95,116,121,112,101,67,111,117,110,116,0,0,32,32,32,32,98,50,86,101,99,50,32,118,115,91,37,100,93,59,10,0,32,32,98,100,46,97,108,108,111,119,83,108,101,101,112,32,61,32,98,111,111,108,40,37,100,41,59,10,0,0,0,0,48,32,60,61,32,99,104,105,108,100,50,32,38,38,32,99,104,105,108,100,50,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,32,32,98,100,46,97,110,103,117,108,97,114,68,97,109,112,105,110,103,32,61,32,37,46,49,53,108,101,102,59,10,0,109,95,98,111,100,121,67,111,117,110,116,32,62,32,48,0,116,111,105,73,110,100,101,120,66,32,60,32,109,95,98,111,100,121,67,111,117,110,116,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,111,110,116,97,99,116,46,99,112,112,0,0,48,32,60,61,32,110,111,100,101,73,100,32,38,38,32,110,111,100,101,73,100,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,32,32,32,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,115,104,97,112,101,59,10,0,0,48,32,60,61,32,112,114,111,120,121,73,100,32,38,38,32,112,114,111,120,121,73,100,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,46,99,112,112,0,0,0,48,32,60,61,32,99,104,105,108,100,49,32,38,38,32,99,104,105,108,100,49,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,32,32,98,100,46,108,105,110,101,97,114,68,97,109,112,105,110,103,32,61,32,37,46,49,53,108,101,102,59,10,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,67,111,110,116,97,99,116,115,47,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,46,99,112,112,0,0,0,0,114,46,76,101,110,103,116,104,83,113,117,97,114,101,100,40,41,32,62,32,48,46,48,102,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,86,101,114,116,101,120,51,32,61,32,98,111,111,108,40,37,100,41,59,10,0,110,111,100,101,45,62,104,101,105,103,104,116,32,61,61,32,48,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,67,111,108,108,105,100,101,80,111,108,121,103,111,110,46,99,112,112,0,0,0,32,32,98,100,46,97,110,103,117,108,97,114,86,101,108,111,99,105,116,121,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,121,110,97,109,105,99,84,114,101,101,46,104,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,104,97,115,86,101,114,116,101,120,48,32,61,32,98,111,111,108,40,37,100,41,59,10,0,99,104,105,108,100,50,32,61,61,32,40,45,49,41,0,0,32,32,98,100,46,108,105,110,101,97,114,86,101,108,111,99,105,116,121,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,98,111,100,105,101,115,32,61,32,78,85,76,76,59,10,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,51,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,32,32,98,100,46,97,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,98,100,45,62,112,111,115,105,116,105,111,110,46,73,115,86,97,108,105,100,40,41,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,87,111,114,108,100,46,99,112,112,0,109,95,105,110,100,101,120,32,61,61,32,48,0,0,0,0,109,95,110,111,100,101,115,91,105,110,100,101,120,93,46,112,97,114,101,110,116,32,61,61,32,40,45,49,41,0,0,0,106,111,105,110,116,115,32,61,32,78,85,76,76,59,10,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,50,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,73,115,108,97,110,100,46,99,112,112,0,0,0,0,48,32,60,61,32,105,110,100,101,120,32,38,38,32,105,110,100,101,120,32,60,32,99,104,97,105,110,45,62,109,95,99,111,117,110,116,0,0,0,0,32,32,98,100,46,112,111,115,105,116,105,111,110,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,98,50,70,114,101,101,40,98,111,100,105,101,115,41,59,10,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,49,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,106,32,60,32,98,50,95,98,108,111,99,107,83,105,122,101,115,0,0,0,109,95,110,111,100,101,115,91,66,45,62,112,97,114,101,110,116,93,46,99,104,105,108,100,50,32,61,61,32,105,65,0,32,32,98,100,46,116,121,112,101,32,61,32,98,50,66,111,100,121,84,121,112,101,40,37,100,41,59,10,0,0,0,0,32,32,106,100,46,109,97,120,77,111,116,111,114,70,111,114,99,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,51,32,60,61,32,99,111,117,110,116,32,38,38,32,99,111,117,110,116,32,60,61,32,56,0,0,0,0,98,50,70,114,101,101,40,106,111,105,110,116,115,41,59,10,0,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,118,101,114,116,101,120,48,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,48,32,60,61,32,105,69,32,38,38,32,105,69,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,32,32,98,50,66,111,100,121,68,101,102,32,98,100,59,10,0,0,0,0,109,95,118,101,114,116,105,99,101,115,32,61,61,32,95,95,110,117,108,108,32,38,38,32,109,95,99,111,117,110,116,32,61,61,32,48,0,0,0,0,48,32,60,61,32,105,68,32,38,38,32,105,68,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,125,10,0,0,32,32,106,100,46,98,111,100,121,65,32,61,32,98,111,100,105,101,115,91,37,100,93,59,10,0,0,0,32,32,32,32,98,50,69,100,103,101,83,104,97,112,101,32,115,104,97,112,101,59,10,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,68,121,110,97,109,105,99,84,114,101,101,46,99,112,112,0,0,116,97,114,103,101,116,32,62,32,116,111,108,101,114,97,110,99,101,0,0,114,97,116,105,111,32,62,32,49,46,49,57,50,48,57,50,57,48,69,45,48,55,70,0,32,32,106,100,46,114,97,116,105,111,32,61,32,37,46,49,53,108,101,102,59,10,0,0,100,101,102,45,62,116,97,114,103,101,116,46,73,115,86,97,108,105,100,40,41,0,0,0,109,95,110,111,100,101,115,91,67,45,62,112,97,114,101,110,116,93,46,99,104,105,108,100,50,32,61,61,32,105,65,0,123,10,0,0,102,97,108,115,101,0,0,0,32,32,32,32,115,104,97,112,101,46,109,95,112,46,83,101,116,40,37,46,49,53,108,101,102,44,32,37,46,49,53,108,101,102,41,59,10,0,0,0,109,95,116,121,112,101,65,32,61,61,32,101,95,114,101,118,111,108,117,116,101,74,111,105,110,116,32,124,124,32,109,95,116,121,112,101,65,32,61,61,32,101,95,112,114,105,115,109,97,116,105,99,74,111,105,110,116,0,0,0,48,32,60,61,32,101,100,103,101,49,32,38,38,32,101,100,103,101,49,32,60,32,112,111,108,121,49,45,62,109,95,118,101,114,116,101,120,67,111,117,110,116,0,0,109,95,73,32,62,32,48,46,48,102,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,112,111,108,121,103,111,110,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,101,100,103,101,0,0,0,0,32,32,106,111,105,110,116,115,91,37,100,93,32,61,32,109,95,119,111,114,108,100,45,62,67,114,101,97,116,101,74,111,105,110,116,40,38,106,100,41,59,10,0,0,32,32,106,100,46,108,101,110,103,116,104,66,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,32,32,106,100,46,117,112,112,101,114,84,114,97,110,115,108,97,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,112,111,105,110,116,67,111,117,110,116,32,62,32,48,0,0,98,50,74,111,105,110,116,42,42,32,106,111,105,110,116,115,32,61,32,40,98,50,74,111,105,110,116,42,42,41,98,50,65,108,108,111,99,40,37,100,32,42,32,115,105,122,101,111,102,40,98,50,74,111,105,110,116,42,41,41,59,10,0,0,48,32,60,61,32,116,121,112,101,49,32,38,38,32,116,121,112,101,49,32,60,32,98,50,83,104,97,112,101,58,58,101,95,116,121,112,101,67,111,117,110,116,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,99,105,114,99,108,101,0,0,32,32,32,32,115,104,97,112,101,46,109,95,114,97,100,105,117,115,32,61,32,37,46,49,53,108,101,102,59,10,0,0,109,95,102,105,120,116,117,114,101,65,45,62,71,101,116,84,121,112,101,40,41,32,61,61,32,98,50,83,104,97,112,101,58,58,101,95,99,104,97,105,110,0,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,68,121,110,97,109,105,99,115,47,98,50,70,105,120,116,117,114,101,46,99,112,112,0,0,0,48,32,60,61,32,105,71,32,38,38,32,105,71,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,109,95,116,121,112,101,32,61,61,32,98,50,95,100,121,110,97,109,105,99,66,111,100,121,0,0,0,0,73,115,76,111,99,107,101,100,40,41,32,61,61,32,102,97,108,115,101,0,116,111,105,73,110,100,101,120,65,32,60,32,109,95,98,111,100,121,67,111,117,110,116,0,109,95,110,111,100,101,67,111,117,110,116,32,61,61,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,0,32,32,106,100,46,100,97,109,112,105,110,103,82,97,116,105,111,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,32,32,106,100,46,117,112,112,101,114,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,108,101,110,103,116,104,65,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,32,32,106,100,46,108,111,119,101,114,84,114,97,110,115,108,97,116,105,111,110,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,109,95,112,114,111,120,121,67,111,117,110,116,32,61,61,32,48,0,0,0,98,50,66,111,100,121,42,42,32,98,111,100,105,101,115,32,61,32,40,98].concat([50,66,111,100,121,42,42,41,98,50,65,108,108,111,99,40,37,100,32,42,32,115,105,122,101,111,102,40,98,50,66,111,100,121,42,41,41,59,10,0,32,32,32,32,98,50,67,105,114,99,108,101,83,104,97,112,101,32,115,104,97,112,101,59,10,0,0,0,48,32,60,61,32,105,70,32,38,38,32,105,70,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,102,111,117,110,100,0,0,0,32,32,106,100,46,102,114,101,113,117,101,110,99,121,72,122,32,61,32,37,46,49,53,108,101,102,59,10,0,0,0,0,32,32,106,100,46,108,111,119,101,114,65,110,103,108,101,32,61,32,37,46,49,53,108,101,102,59,10,0,32,32,106,100,46,109,97,120,84,111,114,113,117,101,32,61,32,37,46,49,53,108,101,102,59,10,0,0,109,95,119,111,114,108,100,45,62,83,101,116,71,114,97,118,105,116,121,40,103,41,59,10,0,0,0,0,32,32,32,32,102,100,46,102,105,108,116,101,114,46,103,114,111,117,112,73,110,100,101,120,32,61,32,105,110,116,49,54,40,37,100,41,59,10,0,0,48,32,60,61,32,105,67,32,38,38,32,105,67,32,60,32,109,95,110,111,100,101,67,97,112,97,99,105,116,121,0,0,100,101,110,32,62,32,48,46,48,102,0,0,66,111,120,50,68,95,118,50,46,50,46,49,47,66,111,120,50,68,47,67,111,108,108,105,115,105,111,110,47,98,50,67,111,108,108,105,100,101,69,100,103,101,46,99,112,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,102,108,111,97,116,51,50,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,77,101,116,114,105,99,40,41,32,99,111,110,115,116,0,0,0,0,98,50,86,101,99,50,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,83,101,97,114,99,104,68,105,114,101,99,116,105,111,110,40,41,32,99,111,110,115,116,0,0,0,0,118,111,105,100,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,87,105,116,110,101,115,115,80,111,105,110,116,115,40,98,50,86,101,99,50,32,42,44,32,98,50,86,101,99,50,32,42,41,32,99,111,110,115,116,0,0,98,50,86,101,99,50,32,98,50,83,105,109,112,108,101,120,58,58,71,101,116,67,108,111,115,101,115,116,80,111,105,110,116,40,41,32,99,111,110,115,116,0,0,0,102,108,111,97,116,51,50,32,98,50,83,101,112,97,114,97,116,105,111,110,70,117,110,99,116,105,111,110,58,58,69,118,97,108,117,97,116,101,40,105,110,116,51,50,44,32,105,110,116,51,50,44,32,102,108,111,97,116,51,50,41,32,99,111,110,115,116,0,102,108,111,97,116,51,50,32,98,50,83,101,112,97,114,97,116,105,111,110,70,117,110,99,116,105,111,110,58,58,70,105,110,100,77,105,110,83,101,112,97,114,97,116,105,111,110,40,105,110,116,51,50,32,42,44,32,105,110,116,51,50,32,42,44,32,102,108,111,97,116,51,50,41,32,99,111,110,115,116,0,0,0,0,99,111,110,115,116,32,98,50,86,101,99,50,32,38,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,58,58,71,101,116,86,101,114,116,101,120,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,118,105,114,116,117,97,108,32,98,111,111,108,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,58,58,82,97,121,67,97,115,116,40,98,50,82,97,121,67,97,115,116,79,117,116,112,117,116,32,42,44,32,99,111,110,115,116,32,98,50,82,97,121,67,97,115,116,73,110,112,117,116,32,38,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,118,105,114,116,117,97,108,32,118,111,105,100,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,58,58,67,111,109,112,117,116,101,77,97,115,115,40,98,50,77,97,115,115,68,97,116,97,32,42,44,32,102,108,111,97,116,51,50,41,32,99,111,110,115,116,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,86,97,108,105,100,97,116,101,40,41,32,99,111,110,115,116,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,82,97,121,67,97,115,116,40,84,32,42,44,32,99,111,110,115,116,32,98,50,82,97,121,67,97,115,116,73,110,112,117,116,32,38,41,32,99,111,110,115,116,32,91,84,32,61,32,98,50,87,111,114,108,100,82,97,121,67,97,115,116,87,114,97,112,112,101,114,93,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,86,97,108,105,100,97,116,101,83,116,114,117,99,116,117,114,101,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,86,97,108,105,100,97,116,101,77,101,116,114,105,99,115,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,71,101,116,77,97,120,66,97,108,97,110,99,101,40,41,32,99,111,110,115,116,0,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,67,111,109,112,117,116,101,72,101,105,103,104,116,40,105,110,116,51,50,41,32,99,111,110,115,116,0,118,111,105,100,32,42,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,71,101,116,85,115,101,114,68,97,116,97,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,99,111,110,115,116,32,98,50,65,65,66,66,32,38,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,71,101,116,70,97,116,65,65,66,66,40,105,110,116,51,50,41,32,99,111,110,115,116,0,0,0,0,118,105,114,116,117,97,108,32,98,111,111,108,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,82,97,121,67,97,115,116,40,98,50,82,97,121,67,97,115,116,79,117,116,112,117,116,32,42,44,32,99,111,110,115,116,32,98,50,82,97,121,67,97,115,116,73,110,112,117,116,32,38,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,71,101,116,67,104,105,108,100,69,100,103,101,40,98,50,69,100,103,101,83,104,97,112,101,32,42,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,118,105,114,116,117,97,108,32,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,67,111,109,112,117,116,101,65,65,66,66,40,98,50,65,65,66,66,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,32,99,111,110,115,116,0,0,118,111,105,100,32,98,50,83,105,109,112,108,101,120,58,58,82,101,97,100,67,97,99,104,101,40,99,111,110,115,116,32,98,50,83,105,109,112,108,101,120,67,97,99,104,101,32,42,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,118,111,105,100,32,98,50,70,105,120,116,117,114,101,58,58,68,101,115,116,114,111,121,40,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,118,111,105,100,32,98,50,70,105,120,116,117,114,101,58,58,67,114,101,97,116,101,80,114,111,120,105,101,115,40,98,50,66,114,111,97,100,80,104,97,115,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,115,116,97,116,105,99,32,118,111,105,100,32,98,50,67,111,110,116,97,99,116,58,58,68,101,115,116,114,111,121,40,98,50,67,111,110,116,97,99,116,32,42,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,115,116,97,116,105,99,32,98,50,67,111,110,116,97,99,116,32,42,98,50,67,111,110,116,97,99,116,58,58,67,114,101,97,116,101,40,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,83,111,108,118,101,84,79,73,40,99,111,110,115,116,32,98,50,84,105,109,101,83,116,101,112,32,38,44,32,105,110,116,51,50,44,32,105,110,116,51,50,41,0,0,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,65,100,100,40,98,50,67,111,110,116,97,99,116,32,42,41,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,65,100,100,40,98,50,74,111,105,110,116,32,42,41,0,0,0,118,111,105,100,32,98,50,73,115,108,97,110,100,58,58,65,100,100,40,98,50,66,111,100,121,32,42,41,0,0,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,68,114,97,119,83,104,97,112,101,40,98,50,70,105,120,116,117,114,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,67,111,108,111,114,32,38,41,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,83,111,108,118,101,84,79,73,40,99,111,110,115,116,32,98,50,84,105,109,101,83,116,101,112,32,38,41,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,83,111,108,118,101,40,99,111,110,115,116,32,98,50,84,105,109,101,83,116,101,112,32,38,41,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,68,101,115,116,114,111,121,74,111,105,110,116,40,98,50,74,111,105,110,116,32,42,41,0,0,0,118,111,105,100,32,98,50,87,111,114,108,100,58,58,68,101,115,116,114,111,121,66,111,100,121,40,98,50,66,111,100,121,32,42,41,0,98,50,74,111,105,110,116,32,42,98,50,87,111,114,108,100,58,58,67,114,101,97,116,101,74,111,105,110,116,40,99,111,110,115,116,32,98,50,74,111,105,110,116,68,101,102,32,42,41,0,0,0,98,50,66,111,100,121,32,42,98,50,87,111,114,108,100,58,58,67,114,101,97,116,101,66,111,100,121,40,99,111,110,115,116,32,98,50,66,111,100,121,68,101,102,32,42,41,0,0,118,111,105,100,32,98,50,83,119,101,101,112,58,58,65,100,118,97,110,99,101,40,102,108,111,97,116,51,50,41,0,0,98,50,74,111,105,110,116,58,58,98,50,74,111,105,110,116,40,99,111,110,115,116,32,98,50,74,111,105,110,116,68,101,102,32,42,41,0,0,0,0,115,116,97,116,105,99,32,118,111,105,100,32,98,50,74,111,105,110,116,58,58,68,101,115,116,114,111,121,40,98,50,74,111,105,110,116,32,42,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,115,116,97,116,105,99,32,98,50,74,111,105,110,116,32,42,98,50,74,111,105,110,116,58,58,67,114,101,97,116,101,40,99,111,110,115,116,32,98,50,74,111,105,110,116,68,101,102,32,42,44,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,32,42,41,0,98,50,66,111,100,121,58,58,98,50,66,111,100,121,40,99,111,110,115,116,32,98,50,66,111,100,121,68,101,102,32,42,44,32,98,50,87,111,114,108,100,32,42,41,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,65,99,116,105,118,101,40,98,111,111,108,41,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,84,121,112,101,40,98,50,66,111,100,121,84,121,112,101,41,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,68,101,115,116,114,111,121,70,105,120,116,117,114,101,40,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,82,101,115,101,116,77,97,115,115,68,97,116,97,40,41,0,0,0,0,98,50,70,105,120,116,117,114,101,32,42,98,50,66,111,100,121,58,58,67,114,101,97,116,101,70,105,120,116,117,114,101,40,99,111,110,115,116,32,98,50,70,105,120,116,117,114,101,68,101,102,32,42,41,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,84,114,97,110,115,102,111,114,109,40,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,102,108,111,97,116,51,50,41,0,0,118,111,105,100,32,98,50,66,111,100,121,58,58,83,101,116,77,97,115,115,68,97,116,97,40,99,111,110,115,116,32,98,50,77,97,115,115,68,97,116,97,32,42,41,0,0,0,0,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,118,111,105,100,32,98,50,80,111,115,105,116,105,111,110,83,111,108,118,101,114,77,97,110,105,102,111,108,100,58,58,73,110,105,116,105,97,108,105,122,101,40,98,50,67,111,110,116,97,99,116,80,111,115,105,116,105,111,110,67,111,110,115,116,114,97,105,110,116,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,41,0,0,0,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,58,58,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,41,0,0,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,58,58,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,44,32,98,50,70,105,120,116,117,114,101,32,42,44,32,105,110,116,51,50,41,0,0,0,0,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,102,108,111,97,116,51,50,32,98,50,83,101,112,97,114,97,116,105,111,110,70,117,110,99,116,105,111,110,58,58,73,110,105,116,105,97,108,105,122,101,40,99,111,110,115,116,32,98,50,83,105,109,112,108,101,120,67,97,99,104,101,32,42,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,83,119,101,101,112,32,38,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,32,42,44,32,99,111,110,115,116,32,98,50,83,119,101,101,112,32,38,44,32,102,108,111,97,116,51,50,41,0,0,0,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,58,58,126,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,40,41,0,0,0,118,111,105,100,32,42,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,58,58,65,108,108,111,99,97,116,101,40,105,110,116,51,50,41,0,118,111,105,100,32,98,50,83,116,97,99,107,65,108,108,111,99,97,116,111,114,58,58,70,114,101,101,40,118,111,105,100,32,42,41,0,118,111,105,100,32,98,50,80,117,108,108,101,121,74,111,105,110,116,68,101,102,58,58,73,110,105,116,105,97,108,105,122,101,40,98,50,66,111,100,121,32,42,44,32,98,50,66,111,100,121,32,42,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,44,32,102,108,111,97,116,51,50,41,0,0,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,58,58,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,0,0,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,58,58,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,40,41,0,0,0,0,118,111,105,100,32,42,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,58,58,65,108,108,111,99,97,116,101,40,105,110,116,51,50,41,0,118,111,105,100,32,98,50,66,108,111,99,107,65,108,108,111,99,97,116,111,114,58,58,70,114,101,101,40,118,111,105,100,32,42,44,32,105,110,116,51,50,41,0,0,118,111,105,100,32,98,50,68,105,115,116,97,110,99,101,80,114,111,120,121,58,58,83,101,116,40,99,111,110,115,116,32,98,50,83,104,97,112,101,32,42,44,32,105,110,116,51,50,41,0,0,0,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,58,58,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,40,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,68,101,102,32,42,41,0,0,118,111,105,100,32,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,58,58,73,110,105,116,105,97,108,105,122,101,86,101,108,111,99,105,116,121,67,111,110,115,116,114,97,105,110,116,115,40,41,0,0,0,118,111,105,100,32,98,50,67,111,110,116,97,99,116,83,111,108,118,101,114,58,58,83,111,108,118,101,86,101,108,111,99,105,116,121,67,111,110,115,116,114,97,105,110,116,115,40,41,0,0,0,0,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,58,58,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,40,98,50,70,105,120,116,117,114,101,32,42,44,32,98,50,70,105,120,116,117,114,101,32,42,41,0,0,118,111,105,100,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,58,58,83,101,116,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,98,50,80,117,108,108,101,121,74,111,105,110,116,58,58,98,50,80,117,108,108,101,121,74,111,105,110,116,40,99,111,110,115,116,32,98,50,80,117,108,108,101,121,74,111,105,110,116,68,101,102,32,42,41,0,0,98,111,111,108,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,77,111,118,101,80,114,111,120,121,40,105,110,116,51,50,44,32,99,111,110,115,116,32,98,50,65,65,66,66,32,38,44,32,99,111,110,115,116,32,98,50,86,101,99,50,32,38,41,0,0,0,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,70,114,101,101,78,111,100,101,40,105,110,116,51,50,41,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,66,97,108,97,110,99,101,40,105,110,116,51,50,41,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,68,101,115,116,114,111,121,80,114,111,120,121,40,105,110,116,51,50,41,0,105,110,116,51,50,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,65,108,108,111,99,97,116,101,78,111,100,101,40,41,0,118,111,105,100,32,98,50,68,121,110,97,109,105,99,84,114,101,101,58,58,73,110,115,101,114,116,76,101,97,102,40,105,110,116,51,50,41,0,0,0,98,50,77,111,117,115,101,74,111,105,110,116,58,58,98,50,77,111,117,115,101,74,111,105,110,116,40,99,111,110,115,116,32,98,50,77,111,117,115,101,74,111,105,110,116,68,101,102,32,42,41,0,118,105,114,116,117,97,108,32,118,111,105,100,32,98,50,77,111,117,115,101,74,111,105,110,116,58,58,73,110,105,116,86,101,108,111,99,105,116,121,67,111,110,115,116,114,97,105,110,116,115,40,99,111,110,115,116,32,98,50,83,111,108,118,101,114,68,97,116,97,32,38,41,0,0,0,0,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,67,114,101,97,116,101,67,104,97,105,110,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,0,0,118,111,105,100,32,98,50,67,104,97,105,110,83,104,97,112,101,58,58,67,114,101,97,116,101,76,111,111,112,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,0,0,0,98,50,71,101,97,114,74,111,105,110,116,58,58,98,50,71,101,97,114,74,111,105,110,116,40,99,111,110,115,116,32,98,50,71,101,97,114,74,111,105,110,116,68,101,102,32,42,41,0,0,0,0,118,111,105,100,32,98,50,70,105,110,100,73,110,99,105,100,101,110,116,69,100,103,101,40,98,50,67,108,105,112,86,101,114,116,101,120,32,42,44,32,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,44,32,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,0,102,108,111,97,116,51,50,32,98,50,69,100,103,101,83,101,112,97,114,97,116,105,111,110,40,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,105,110,116,51,50,44,32,99,111,110,115,116,32,98,50,80,111,108,121,103,111,110,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,0,0,98,50,86,101,99,50,32,67,111,109,112,117,116,101,67,101,110,116,114,111,105,100,40,99,111,110,115,116,32,98,50,86,101,99,50,32,42,44,32,105,110,116,51,50,41,0,0,0,118,111,105,100,32,98,50,67,111,108,108,105,100,101,69,100,103,101,65,110,100,67,105,114,99,108,101,40,98,50,77,97,110,105,102,111,108,100,32,42,44,32,99,111,110,115,116,32,98,50,69,100,103,101,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,44,32,99,111,110,115,116,32,98,50,67,105,114,99,108,101,83,104,97,112,101,32,42,44,32,99,111,110,115,116,32,98,50,84,114,97,110,115,102,111,114,109,32,38,41,0,118,111,105,100,32,98,50,84,105,109,101,79,102,73,109,112,97,99,116,40,98,50,84,79,73,79,117,116,112,117,116,32,42,44,32,99,111,110,115,116,32,98,50,84,79,73,73,110,112,117,116,32,42,41,0,0,118,111,105,100,32,98,50,68,105,115,116,97,110,99,101,40,98,50,68,105,115,116,97,110,99,101,79,117,116,112,117,116,32,42,44,32,98,50,83,105,109,112,108,101,120,67,97,99,104,101,32,42,44,32,99,111,110,115,116,32,98,50,68,105,115,116,97,110,99,101,73,110,112,117,116,32,42,41,0,0,0,0,0,0,200,70,80,0,136,0,0,0,190,2,0,0,184,3,0,0,0,0,0,0,0,0,0,0,248,70,80,0,38,4,0,0,204,1,0,0,50,2,0,0,0,0,0,0,0,0,0,0,8,71,80,0,38,4,0,0,38,4,0,0,38,4,0,0,38,4,0,0,186,0,0,0,202,2,0,0,32,0,0,0,38,4,0,0,38,4,0,0,38,4,0,0,0,0,0,0,0,0,0,0,16,71,80,0,84,2,0,0,132,0,0,0,14,5,0,0,0,0,0,0,0,0,0,0,28,71,80,0,68,3,0,0,206,0,0,0,128,1,0,0,0,0,0,0,0,0,0,0,40,71,80,0,132,2,0,0,90,2,0,0,4,2,0,0,0,0,0,0,0,0,0,0,52,71,80,0,140,1,0,0,124,3,0,0,252,3,0,0,0,0,0,0,0,0,0,0,64,71,80,0,110,4,0,0,166,5,0,0,18,3,0,0,0,0,0,0,0,0,0,0,76,71,80,0,26,2,0,0,200,1,0,0,6,5,0,0,138,3,0,0,136,1,0,0,104,5,0,0,0,0,0,0,0,0,0,0,84,71,80,0,162,0,0,0,160,2,0,0,64,4,0,0,24,4,0,0,18,0,0,0,134,1,0,0,236,1,0,0,16,0,0,0,58,3,0,0,152,2,0,0,0,0,0,0,0,0,0,0,96,71,80,0,28,5,0,0,34,5,0,0,236,0,0,0,0,0,0,0,0,0,0,0,108,71,80,0,170,4,0,0,174,1,0,0,234,1,0,0,60,3,0,0,112,0,0,0,52,0,0,0,6,6,0,0,176,4,0,0,66,5,0,0,214,0,0,0,0,0,0,0,0,0,0,0,120,71,80,0,146,4,0,0,146,2,0,0,124,4,0,0,188,5,0,0,4,1,0,0,24,5,0,0,216,1,0,0,92,1,0,0,158,4,0,0,148,4,0,0,0,0,0,0,0,0,0,0,132,71,80,0,238,5,0,0,182,4,0,0,184,5,0,0,120,2,0,0,72,5,0,0,222,5,0,0,60,0,0,0,168,0,0,0,212,5,0,0,210,5,0,0,0,0,0,0,0,0,0,0,144,71,80,0,34,1,0,0,212,3,0,0,210,4,0,0,0,0,0,0,0,0,0,0,152,71,80,0,254,4,0,0,104,3,0,0,222,3,0,0,0,0,0,0,0,0,0,0,164,71,80,0,24,2,0,0,246,2,0,0,56,3,0,0,122,0,0,0,254,5,0,0,40,0,0,0,178,4,0,0,2,5,0,0,0,0,0,0,0,0,0,0,176,71,80,0,224,3,0,0,88,1,0,0,216,5,0,0,66,2,0,0,246,0,0,0,244,0,0,0,60,4,0,0,148,0,0,0,10,2,0,0,156,1,0,0,0,0,0,0,0,0,0,0,188,71,80,0,144,1,0,0,40,1,0,0,46,2,0,0,72,3,0,0,48,4,0,0,100,5,0,0,104,0,0,0,60,1,0,0,0,0,0,0,0,0,0,0,200,71,80,0,252,5,0,0,222,1,0,0,210,1,0,0,134,4,0,0,138,5,0,0,2,0,0,0,104,2,0,0,102,2,0,0,236,4,0,0,118,4,0,0,0,0,0,0,0,0,0,0,212,71,80,0,78,1,0,0,46,4,0,0,96,2,0,0,38,2,0,0,226,4,0,0,190,5,0,0,34,6,0,0,70,3,0,0,186,4,0,0,240,2,0,0,0,0,0,0,0,0,0,0,224,71,80,0,24,1,0,0,62,4,0,0,118,5,0,0,204,2,0,0,194,5,0,0,130,2,0,0,102,1,0,0,4,0,0,0,0,0,0,0,0,0,0,0,236,71,80,0,168,2,0,0,164,5,0,0,172,5,0,0,214,2,0,0,52,5,0,0,96,1,0,0,214,1,0,0,164,1,0,0,230,3,0,0,242,5,0,0,0,0,0,0,0,0,0,0,248,71,80,0,98,3,0,0,178,0,0,0,254,2,0,0,46,3,0,0,8,6,0,0,200,4,0,0,144,0,0,0,52,1,0,0,252,1,0,0,204,5,0,0,0,0,0,0,0,0,0,0,4,72,80,0,72,2,0,0,78,3,0,0,48,0,0,0,126,2,0,0,192,2,0,0,94,5,0,0,22,1,0,0,196,3,0,0,102,3,0,0,186,5,0,0,0,0,0,0,0,0,0,0,16,72,80,0,140,0,0,0,58,0,0,0,84,4,0,0,78,4,0,0,126,5,0,0,236,5,0,0,220,0,0,0,22,6,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,57,98,50,67,111,110,116,97,99,116,0,0,55,98,50,83,104,97,112,101,0,0,0,0,55,98,50,74,111,105,110,116,0,0,0,0,50,53,98,50,80,111,108,121,103,111,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,50,52,98,50,67,104,97,105,110,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,50,51,98,50,69,100,103,101,65,110,100,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,0,50,51,98,50,67,104,97,105,110,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,50,50,98,50,69,100,103,101,65,110,100,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,0,49,55,98,50,67,111,110,116,97,99,116,76,105,115,116,101,110,101,114,0,49,54,98,50,80,114,105,115,109,97,116,105,99,74,111,105,110,116,0,0,49,54,98,50,80,111,108,121,103,111,110,67,111,110,116,97,99,116,0,0,49,53,98,50,82,101,118,111,108,117,116,101,74,111,105,110,116,0,0,0,49,53,98,50,70,114,105,99,116,105,111,110,74,111,105,110,116,0,0,0,49,53,98,50,68,105,115,116,97,110,99,101,74,111,105,110,116,0,0,0,49,53,98,50,67,111,110,116,97,99,116,70,105,108,116,101,114,0,0,0,49,53,98,50,67,105,114,99,108,101,67,111,110,116,97,99,116,0,0,0,49,52,98,50,80,111,108,121,103,111,110,83,104,97,112,101,0,0,0,0,49,51,98,50,80,117,108,108,101,121,74,111,105,110,116,0,49,51,98,50,67,105,114,99,108,101,83,104,97,112,101,0,49,50,98,50,87,104,101,101,108,74,111,105,110,116,0,0,49,50,98,50,77,111,117,115,101,74,111,105,110,116,0,0,49,50,98,50,67,104,97,105,110,83,104,97,112,101,0,0,49,49,98,50,87,101,108,100,74,111,105,110,116,0,0,0,49,49,98,50,82,111,112,101,74,111,105,110,116,0,0,0,49,49,98,50,71,101,97,114,74,111,105,110,116,0,0,0,49,49,98,50,69,100,103,101,83,104,97,112,101,0,0,0,0,0,0,0,60,68,80,0,0,0,0,0,76,68,80,0,0,0,0,0,0,0,0,0,92,68,80,0,224,70,80,0,0,0,0,0,132,68,80,0,236,70,80,0,0,0,0,0,168,68,80,0,192,70,80,0,0,0,0,0,204,68,80,0,0,0,0,0,216,68,80,0,0,0,0,0,228,68,80,0,0,0,0,0,240,68,80,0,248,70,80,0,0,0,0,0,12,69,80,0,248,70,80,0,0,0,0,0,40,69,80,0,248,70,80,0,0,0,0,0,68,69,80,0,248,70,80,0,0,0,0,0,96,69,80,0,248,70,80,0,0,0,0,0,124,69,80,0,0,0,0,0,144,69,80,0,8,71,80,0,0,0,0,0,164,69,80,0,248,70,80,0,0,0,0,0,184,69,80,0,8,71,80,0,0,0,0,0,204,69,80,0,8,71,80,0,0,0,0,0,224,69,80,0,8,71,80,0,0,0,0,0,244,69,80,0,0,0,0,0,8,70,80,0,248,70,80,0,0,0,0,0,28,70,80,0,0,71,80,0,0,0,0,0,48,70,80,0,8,71,80,0,0,0,0,0,64,70,80,0,0,71,80,0,0,0,0,0,80,70,80,0,8,71,80,0,0,0,0,0,96,70,80,0,8,71,80,0,0,0,0,0,112,70,80,0,0,71,80,0,0,0,0,0,128,70,80,0,8,71,80,0,0,0,0,0,144,70,80,0,8,71,80,0,0,0,0,0,160,70,80,0,8,71,80,0,0,0,0,0,176,70,80,0,0,71,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,32,0,0,0,64,0,0,0,96,0,0,0,128,0,0,0,160,0,0,0,192,0,0,0,224,0,0,0,0,1,0,0,64,1,0,0,128,1,0,0,192,1,0,0,0,2,0,0,128,2,0,0,0,0,0,0,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0,,,,,0,0,0,0])
, "i8", ALLOC_NONE, TOTAL_STACK)
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(8))>>2)]=(1228);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(12))>>2)]=(770);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(16))>>2)]=(360);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(20))>>2)]=(856);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(24))>>2)]=(1046);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(28))>>2)]=(1212);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(32))>>2)]=(534);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(36))>>2)]=(600);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(8))>>2)]=(1228);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(12))>>2)]=(1498);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(16))>>2)]=(360);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(20))>>2)]=(856);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(24))>>2)]=(1046);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(28))>>2)]=(1174);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(32))>>2)]=(588);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(36))>>2)]=(888);
HEAP32[((5260992)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5261000)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261008)>>2)]=__ZTISt9exception;
HEAP32[((5261012)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261024)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261036)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261048)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5261056)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5261064)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5261072)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261084)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261096)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261108)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261120)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261132)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5261140)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261152)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261164)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261176)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261188)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261200)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((5261208)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261220)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261232)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261244)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261256)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261268)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261280)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261292)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261304)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261316)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((5261328)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
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
  var ERRNO_CODES={E2BIG:7,EACCES:13,EADDRINUSE:98,EADDRNOTAVAIL:99,EAFNOSUPPORT:97,EAGAIN:11,EALREADY:114,EBADF:9,EBADMSG:74,EBUSY:16,ECANCELED:125,ECHILD:10,ECONNABORTED:103,ECONNREFUSED:111,ECONNRESET:104,EDEADLK:35,EDESTADDRREQ:89,EDOM:33,EDQUOT:122,EEXIST:17,EFAULT:14,EFBIG:27,EHOSTUNREACH:113,EIDRM:43,EILSEQ:84,EINPROGRESS:115,EINTR:4,EINVAL:22,EIO:5,EISCONN:106,EISDIR:21,ELOOP:40,EMFILE:24,EMLINK:31,EMSGSIZE:90,EMULTIHOP:72,ENAMETOOLONG:36,ENETDOWN:100,ENETRESET:102,ENETUNREACH:101,ENFILE:23,ENOBUFS:105,ENODATA:61,ENODEV:19,ENOENT:2,ENOEXEC:8,ENOLCK:37,ENOLINK:67,ENOMEM:12,ENOMSG:42,ENOPROTOOPT:92,ENOSPC:28,ENOSR:63,ENOSTR:60,ENOSYS:38,ENOTCONN:107,ENOTDIR:20,ENOTEMPTY:39,ENOTRECOVERABLE:131,ENOTSOCK:88,ENOTSUP:95,ENOTTY:25,ENXIO:6,EOVERFLOW:75,EOWNERDEAD:130,EPERM:1,EPIPE:32,EPROTO:71,EPROTONOSUPPORT:93,EPROTOTYPE:91,ERANGE:34,EROFS:30,ESPIPE:29,ESRCH:3,ESTALE:116,ETIME:62,ETIMEDOUT:110,ETXTBSY:26,EWOULDBLOCK:11,EXDEV:18};
  function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      if (!___setErrNo.ret) ___setErrNo.ret = allocate([0], 'i32', ALLOC_STATIC);
      HEAP32[((___setErrNo.ret)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STACK);
  var _stdout=allocate(1, "i32*", ALLOC_STACK);
  var _stderr=allocate(1, "i32*", ALLOC_STACK);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STACK);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,joinPath:function (parts, forceRelative) {
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
        assert(Math.max(_stdin, _stdout, _stderr) < 128); // make sure these are low, we flatten arrays with these
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
          'void*', ALLOC_STATIC) ], 'void*', ALLOC_NONE, __impure_ptr);
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
        argIndex += Runtime.getNativeFieldSize(type);
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
              var arg = getNextArg('i8*') || nullString;
              var argLength = _strlen(arg);
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              for (var i = 0; i < argLength; i++) {
                ret.push(HEAPU8[((arg++)|0)]);
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
      // We need to make sure no one else allocates unfreeable memory!
      // We must control this entirely. So we don't even need to do
      // unfreeable allocations - the HEAP is ours, from STATICTOP up.
      // TODO: We could in theory slice off the top of the HEAP when
      //       sbrk gets a negative increment in |bytes|...
      var self = _sbrk;
      if (!self.called) {
        STATICTOP = alignMemoryPage(STATICTOP); // make sure we start out aligned
        self.called = true;
        _sbrk.DYNAMIC_START = STATICTOP;
      }
      var ret = STATICTOP;
      if (bytes != 0) Runtime.staticAlloc(bytes);
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
    }function ___cxa_find_matching_catch(thrown, throwntype, typeArray) {
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
___setErrNo(0);
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
var Math_min = Math.min;
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.__ZTVN10__cxxabiv120__si_class_type_infoE|0;var n=env.__ZTVN10__cxxabiv117__class_type_infoE|0;var o=env.__ZTISt9exception|0;var p=+env.NaN;var q=+env.Infinity;var r=0;var s=0;var t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0.0;var C=0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=global.Math.floor;var N=global.Math.abs;var O=global.Math.sqrt;var P=global.Math.pow;var Q=global.Math.cos;var R=global.Math.sin;var S=global.Math.tan;var T=global.Math.acos;var U=global.Math.asin;var V=global.Math.atan;var W=global.Math.atan2;var X=global.Math.exp;var Y=global.Math.log;var Z=global.Math.ceil;var _=global.Math.imul;var $=env.abort;var aa=env.assert;var ab=env.asmPrintInt;var ac=env.asmPrintFloat;var ad=env.copyTempDouble;var ae=env.copyTempFloat;var af=env.min;var ag=env._llvm_va_end;var ah=env._cosf;var ai=env._floorf;var aj=env.___cxa_throw;var ak=env._abort;var al=env._fprintf;var am=env._printf;var an=env.__reallyNegative;var ao=env._sqrtf;var ap=env._sysconf;var aq=env._llvm_lifetime_start;var ar=env.___setErrNo;var as=env._fwrite;var at=env._llvm_eh_exception;var au=env._write;var av=env._exit;var aw=env._llvm_lifetime_end;var ax=env.___cxa_find_matching_catch;var ay=env._atan2f;var az=env.___cxa_pure_virtual;var aA=env.___cxa_is_number_type;var aB=env._time;var aC=env.__formatString;var aD=env.___cxa_does_inherit;var aE=env.___cxa_guard_acquire;var aF=env.__ZSt9terminatev;var aG=env._sinf;var aH=env.___assert_func;var aI=env.__ZSt18uncaught_exceptionv;var aJ=env._pwrite;var aK=env._sbrk;var aL=env.__ZNSt9exceptionD2Ev;var aM=env.___cxa_allocate_exception;var aN=env.___errno_location;var aO=env.___gxx_personality_v0;var aP=env.___cxa_call_unexpected;var aQ=env.___cxa_guard_release;var aR=env.__exit;
// EMSCRIPTEN_START_FUNCS
function bk(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+3>>2<<2;return b|0}function bl(){return i|0}function bm(a){a=a|0;i=a}function bn(a){a=a|0;r=a}function bo(a){a=a|0;C=a}function bp(a){a=a|0;D=a}function bq(a){a=a|0;E=a}function br(a){a=a|0;F=a}function bs(a){a=a|0;G=a}function bt(a){a=a|0;H=a}function bu(a){a=a|0;I=a}function bv(a){a=a|0;J=a}function bw(a){a=a|0;K=a}function bx(a){a=a|0;L=a}function by(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;c[a>>2]=-1;b=a+12|0;c[b>>2]=16;c[a+8>>2]=0;d=pi(576)|0;e=a+4|0;c[e>>2]=d;pr(d|0,0,(c[b>>2]|0)*36&-1|0);d=(c[b>>2]|0)-1|0;L1:do{if((d|0)>0){f=0;while(1){g=f+1|0;c[(c[e>>2]|0)+(f*36&-1)+20>>2]=g;c[(c[e>>2]|0)+(f*36&-1)+32>>2]=-1;h=(c[b>>2]|0)-1|0;if((g|0)<(h|0)){f=g}else{i=h;break L1}}}else{i=d}}while(0);c[(c[e>>2]|0)+(i*36&-1)+20>>2]=-1;c[(c[e>>2]|0)+(((c[b>>2]|0)-1|0)*36&-1)+32>>2]=-1;b=a+16|0;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;c[a+48>>2]=16;c[a+52>>2]=0;c[a+44>>2]=pi(192)|0;c[a+36>>2]=16;c[a+40>>2]=0;c[a+32>>2]=pi(64)|0;return}function bz(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0.0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=a|0;f=bN(e)|0;h=a+4|0;i=+g[b+4>>2]+-.10000000149011612;j=(c[h>>2]|0)+(f*36&-1)|0;l=(g[k>>2]=+g[b>>2]+-.10000000149011612,c[k>>2]|0);m=(g[k>>2]=i,c[k>>2]|0)|0;c[j>>2]=0|l;c[j+4>>2]=m;i=+g[b+12>>2]+.10000000149011612;m=(c[h>>2]|0)+(f*36&-1)+8|0;j=(g[k>>2]=+g[b+8>>2]+.10000000149011612,c[k>>2]|0);b=(g[k>>2]=i,c[k>>2]|0)|0;c[m>>2]=0|j;c[m+4>>2]=b;c[(c[h>>2]|0)+(f*36&-1)+16>>2]=d;c[(c[h>>2]|0)+(f*36&-1)+32>>2]=0;bO(e,f);e=a+28|0;c[e>>2]=(c[e>>2]|0)+1|0;e=a+40|0;h=c[e>>2]|0;d=a+36|0;b=a+32|0;if((h|0)!=(c[d>>2]|0)){n=h;o=c[b>>2]|0;p=o+(n<<2)|0;c[p>>2]=f;q=c[e>>2]|0;r=q+1|0;c[e>>2]=r;return f|0}a=c[b>>2]|0;c[d>>2]=h<<1;d=pi(h<<3)|0;c[b>>2]=d;h=a;pq(d,h,c[e>>2]<<2);pj(h);n=c[e>>2]|0;o=c[b>>2]|0;p=o+(n<<2)|0;c[p>>2]=f;q=c[e>>2]|0;r=q+1|0;c[e>>2]=r;return f|0}function bA(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0,r=0,s=0.0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0.0;h=a+60|0;c[h>>2]=0;i=e+12|0;j=+g[f+12>>2];l=+g[i>>2];m=+g[f+8>>2];n=+g[e+16>>2];o=+g[f>>2]+(j*l-m*n)- +g[d>>2];p=l*m+j*n+ +g[f+4>>2]- +g[d+4>>2];n=+g[d+12>>2];j=+g[d+8>>2];m=o*n+p*j;l=n*p+o*(-0.0-j);j=+g[b+8>>2]+ +g[e+8>>2];e=c[b+148>>2]|0;do{if((e|0)>0){d=0;o=-3.4028234663852886e+38;f=0;while(1){p=(m- +g[b+20+(d<<3)>>2])*+g[b+84+(d<<3)>>2]+(l- +g[b+20+(d<<3)+4>>2])*+g[b+84+(d<<3)+4>>2];if(p>j){q=28;break}r=p>o;s=r?p:o;t=r?d:f;r=d+1|0;if((r|0)<(e|0)){d=r;o=s;f=t}else{q=12;break}}if((q|0)==12){u=s<1.1920928955078125e-7;v=t;break}else if((q|0)==28){return}}else{u=1;v=0}}while(0);q=v+1|0;t=b+20+(v<<3)|0;f=c[t>>2]|0;d=c[t+4>>2]|0;s=(c[k>>2]=f,+g[k>>2]);t=d;o=(c[k>>2]=t,+g[k>>2]);r=b+20+(((q|0)<(e|0)?q:0)<<3)|0;q=c[r>>2]|0;e=c[r+4>>2]|0;p=(c[k>>2]=q,+g[k>>2]);r=e;n=(c[k>>2]=r,+g[k>>2]);if(u){c[h>>2]=1;c[a+56>>2]=1;u=b+84+(v<<3)|0;w=a+40|0;x=c[u+4>>2]|0;c[w>>2]=c[u>>2]|0;c[w+4>>2]=x;x=a+48|0;w=(g[k>>2]=(s+p)*.5,c[k>>2]|0);u=(g[k>>2]=(o+n)*.5,c[k>>2]|0)|0;c[x>>2]=0|w;c[x+4>>2]=u;u=i;x=a;w=c[u+4>>2]|0;c[x>>2]=c[u>>2]|0;c[x+4>>2]=w;c[a+16>>2]=0;return}y=m-s;z=l-o;A=m-p;B=l-n;if(y*(p-s)+z*(n-o)<=0.0){if(y*y+z*z>j*j){return}c[h>>2]=1;c[a+56>>2]=1;w=a+40|0;x=w;u=(g[k>>2]=y,c[k>>2]|0);C=(g[k>>2]=z,c[k>>2]|0)|0;c[x>>2]=0|u;c[x+4>>2]=C;D=+O(+(y*y+z*z));if(D>=1.1920928955078125e-7){E=1.0/D;g[w>>2]=y*E;g[a+44>>2]=z*E}w=a+48|0;c[w>>2]=0|f&-1;c[w+4>>2]=t|d&0;d=i;t=a;w=c[d+4>>2]|0;c[t>>2]=c[d>>2]|0;c[t+4>>2]=w;c[a+16>>2]=0;return}if(A*(s-p)+B*(o-n)>0.0){E=(s+p)*.5;p=(o+n)*.5;w=b+84+(v<<3)|0;if((m-E)*+g[w>>2]+(l-p)*+g[b+84+(v<<3)+4>>2]>j){return}c[h>>2]=1;c[a+56>>2]=1;v=w;w=a+40|0;b=c[v+4>>2]|0;c[w>>2]=c[v>>2]|0;c[w+4>>2]=b;b=a+48|0;w=(g[k>>2]=E,c[k>>2]|0);v=(g[k>>2]=p,c[k>>2]|0)|0;c[b>>2]=0|w;c[b+4>>2]=v;v=i;b=a;w=c[v+4>>2]|0;c[b>>2]=c[v>>2]|0;c[b+4>>2]=w;c[a+16>>2]=0;return}if(A*A+B*B>j*j){return}c[h>>2]=1;c[a+56>>2]=1;h=a+40|0;w=h;b=(g[k>>2]=A,c[k>>2]|0);v=(g[k>>2]=B,c[k>>2]|0)|0;c[w>>2]=0|b;c[w+4>>2]=v;j=+O(+(A*A+B*B));if(j>=1.1920928955078125e-7){p=1.0/j;g[h>>2]=A*p;g[a+44>>2]=B*p}h=a+48|0;c[h>>2]=0|q&-1;c[h+4>>2]=r|e&0;e=i;i=a;r=c[e+4>>2]|0;c[i>>2]=c[e>>2]|0;c[i+4>>2]=r;c[a+16>>2]=0;return}function bB(b,d,e,f,h){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;var i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0;i=b+60|0;c[i>>2]=0;j=f+12|0;l=+g[h+12>>2];m=+g[j>>2];n=+g[h+8>>2];o=+g[f+16>>2];p=+g[h>>2]+(l*m-n*o)- +g[e>>2];q=m*n+l*o+ +g[h+4>>2]- +g[e+4>>2];o=+g[e+12>>2];l=+g[e+8>>2];n=p*o+q*l;m=o*q+p*(-0.0-l);e=d+12|0;h=c[e>>2]|0;r=c[e+4>>2]|0;l=(c[k>>2]=h,+g[k>>2]);e=r;p=(c[k>>2]=e,+g[k>>2]);s=d+20|0;t=c[s>>2]|0;u=c[s+4>>2]|0;q=(c[k>>2]=t,+g[k>>2]);s=u;o=(c[k>>2]=s,+g[k>>2]);v=q-l;w=o-p;x=v*(q-n)+w*(o-m);y=n-l;z=m-p;A=y*v+z*w;B=+g[d+8>>2]+ +g[f+8>>2];if(A<=0.0){if(y*y+z*z>B*B){return}do{if((a[d+44|0]&1)<<24>>24!=0){f=d+28|0;C=c[f+4>>2]|0;D=(c[k>>2]=c[f>>2]|0,+g[k>>2]);if((l-n)*(l-D)+(p-m)*(p-(c[k>>2]=C,+g[k>>2]))<=0.0){break}return}}while(0);c[i>>2]=1;c[b+56>>2]=0;g[b+40>>2]=0.0;g[b+44>>2]=0.0;C=b+48|0;c[C>>2]=0|h&-1;c[C+4>>2]=e|r&0;C=b+16|0;c[C>>2]=0;f=C;a[C]=0;a[f+1|0]=0;a[f+2|0]=0;a[f+3|0]=0;f=j;C=b;E=c[f+4>>2]|0;c[C>>2]=c[f>>2]|0;c[C+4>>2]=E;return}if(x<=0.0){D=n-q;F=m-o;if(D*D+F*F>B*B){return}do{if((a[d+45|0]&1)<<24>>24!=0){E=d+36|0;C=c[E+4>>2]|0;G=(c[k>>2]=c[E>>2]|0,+g[k>>2]);if(D*(G-q)+F*((c[k>>2]=C,+g[k>>2])-o)<=0.0){break}return}}while(0);c[i>>2]=1;c[b+56>>2]=0;g[b+40>>2]=0.0;g[b+44>>2]=0.0;d=b+48|0;c[d>>2]=0|t&-1;c[d+4>>2]=s|u&0;u=b+16|0;c[u>>2]=0;s=u;a[u]=1;a[s+1|0]=0;a[s+2|0]=0;a[s+3|0]=0;s=j;u=b;d=c[s+4>>2]|0;c[u>>2]=c[s>>2]|0;c[u+4>>2]=d;return}F=v*v+w*w;if(F<=0.0){aH(5253428,127,5259060,5253416)}D=1.0/F;F=n-(l*x+q*A)*D;q=m-(p*x+o*A)*D;if(F*F+q*q>B*B){return}B=-0.0-w;if(v*z+y*B<0.0){H=w;I=-0.0-v}else{H=B;I=v}v=+O(+(I*I+H*H));if(v<1.1920928955078125e-7){J=H;K=I}else{B=1.0/v;J=H*B;K=I*B}c[i>>2]=1;c[b+56>>2]=1;i=b+40|0;d=(g[k>>2]=J,c[k>>2]|0);u=(g[k>>2]=K,c[k>>2]|0)|0;c[i>>2]=0|d;c[i+4>>2]=u;u=b+48|0;c[u>>2]=0|h&-1;c[u+4>>2]=e|r&0;r=b+16|0;c[r>>2]=0;e=r;a[r]=0;a[e+1|0]=0;a[e+2|0]=1;a[e+3|0]=0;e=j;j=b;b=c[e+4>>2]|0;c[j>>2]=c[e>>2]|0;c[j+4>>2]=b;return}function bC(b,d,e,f,h,j){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0,z=0.0,A=0.0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0,_=0.0,$=0.0,aa=0,ab=0.0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0.0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0.0,aB=0.0,aC=0.0,aD=0.0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0.0,aP=0,aQ=0,aR=0.0;l=i;i=i+84|0;m=l|0;n=l+12|0;o=l+36|0;p=l+60|0;q=b+132|0;r=+g[f+12>>2];s=+g[j+8>>2];t=+g[f+8>>2];u=+g[j+12>>2];v=r*s-t*u;w=s*t+r*u;x=(g[k>>2]=v,c[k>>2]|0);y=(g[k>>2]=w,c[k>>2]|0)|0;u=+g[j>>2]- +g[f>>2];s=+g[j+4>>2]- +g[f+4>>2];z=r*u+t*s;A=u*(-0.0-t)+r*s;f=(g[k>>2]=z,c[k>>2]|0);j=(g[k>>2]=A,c[k>>2]|0)|0;B=q;c[B>>2]=0|f;c[B+4>>2]=j;j=b+140|0;c[j>>2]=0|x;c[j+4>>2]=y;y=b+144|0;s=+g[h+12>>2];j=b+140|0;r=+g[h+16>>2];x=q|0;t=z+(w*s-v*r);q=b+136|0;z=s*v+w*r+A;B=b+148|0;f=(g[k>>2]=t,c[k>>2]|0);C=(g[k>>2]=z,c[k>>2]|0)|0;c[B>>2]=0|f;c[B+4>>2]=C;C=e+28|0;B=b+156|0;f=c[C>>2]|0;D=c[C+4>>2]|0;c[B>>2]=f;c[B+4>>2]=D;B=e+12|0;C=b+164|0;E=c[B>>2]|0;F=c[B+4>>2]|0;c[C>>2]=E;c[C+4>>2]=F;B=e+20|0;G=b+172|0;H=c[B>>2]|0;I=c[B+4>>2]|0;c[G>>2]=H;c[G+4>>2]=I;B=e+36|0;J=b+180|0;K=c[B>>2]|0;L=c[B+4>>2]|0;c[J>>2]=K;c[J+4>>2]=L;J=a[e+44|0]&1;B=J<<24>>24!=0;M=a[e+45|0]|0;e=(M&1)<<24>>24!=0;A=(c[k>>2]=H,+g[k>>2]);r=(c[k>>2]=E,+g[k>>2]);w=A-r;v=(c[k>>2]=I,+g[k>>2]);I=b+168|0;s=(c[k>>2]=F,+g[k>>2]);u=v-s;N=+O(+(w*w+u*u));P=(c[k>>2]=f,+g[k>>2]);Q=(c[k>>2]=D,+g[k>>2]);R=(c[k>>2]=K,+g[k>>2]);S=(c[k>>2]=L,+g[k>>2]);if(N<1.1920928955078125e-7){T=w;U=u}else{V=1.0/N;T=w*V;U=u*V}L=b+196|0;V=-0.0-T;K=L|0;g[K>>2]=U;D=b+200|0;g[D>>2]=V;u=(t-r)*U+(z-s)*V;if(B){V=r-P;r=s-Q;s=+O(+(V*V+r*r));if(s<1.1920928955078125e-7){W=V;X=r}else{w=1.0/s;W=V*w;X=r*w}w=-0.0-W;g[b+188>>2]=X;g[b+192>>2]=w;Y=(t-P)*X+(z-Q)*w;Z=U*W-T*X>=0.0}else{Y=0.0;Z=0}L93:do{if(e){X=R-A;W=S-v;w=+O(+(X*X+W*W));if(w<1.1920928955078125e-7){_=X;$=W}else{Q=1.0/w;_=X*Q;$=W*Q}Q=-0.0-_;f=b+204|0;g[f>>2]=$;F=b+208|0;g[F>>2]=Q;E=T*$-U*_>0.0;W=(t-A)*$+(z-v)*Q;if((J&M)<<24>>24==0){aa=E;ab=W;ac=100;break}if(Z&E){do{if(Y<0.0&u<0.0){H=W>=0.0;a[b+248|0]=H&1;ad=b+212|0;if(H){ae=ad;break}H=ad;ad=(g[k>>2]=-0.0-U,c[k>>2]|0);af=0|ad;ad=(g[k>>2]=T,c[k>>2]|0)|0;c[H>>2]=af;c[H+4>>2]=ad;H=b+228|0;c[H>>2]=af;c[H+4>>2]=ad;H=b+236|0;c[H>>2]=af;c[H+4>>2]=ad;break L93}else{a[b+248|0]=1;ae=b+212|0}}while(0);ad=L;H=ae;af=c[ad+4>>2]|0;c[H>>2]=c[ad>>2]|0;c[H+4>>2]=af;af=b+188|0;H=b+228|0;ad=c[af+4>>2]|0;c[H>>2]=c[af>>2]|0;c[H+4>>2]=ad;ad=b+204|0;H=b+236|0;af=c[ad+4>>2]|0;c[H>>2]=c[ad>>2]|0;c[H+4>>2]=af;break}if(Z){do{if(Y<0.0){if(u<0.0){a[b+248|0]=0;ag=b+212|0}else{af=W>=0.0;a[b+248|0]=af&1;H=b+212|0;if(af){ah=H;break}else{ag=H}}H=ag;af=(g[k>>2]=-0.0-U,c[k>>2]|0);ad=(g[k>>2]=T,c[k>>2]|0)|0;c[H>>2]=0|af;c[H+4>>2]=ad;Q=-0.0- +g[F>>2];ad=b+228|0;H=(g[k>>2]=-0.0- +g[f>>2],c[k>>2]|0);af=(g[k>>2]=Q,c[k>>2]|0)|0;c[ad>>2]=0|H;c[ad+4>>2]=af;Q=-0.0- +g[D>>2];af=b+236|0;ad=(g[k>>2]=-0.0- +g[K>>2],c[k>>2]|0);H=(g[k>>2]=Q,c[k>>2]|0)|0;c[af>>2]=0|ad;c[af+4>>2]=H;break L93}else{a[b+248|0]=1;ah=b+212|0}}while(0);H=L;af=ah;ad=c[H+4>>2]|0;c[af>>2]=c[H>>2]|0;c[af+4>>2]=ad;ad=b+188|0;af=b+228|0;ai=c[ad+4>>2]|0;c[af>>2]=c[ad>>2]|0;c[af+4>>2]=ai;ai=b+236|0;af=c[H+4>>2]|0;c[ai>>2]=c[H>>2]|0;c[ai+4>>2]=af;break}if(!E){do{if(Y<0.0|u<0.0){a[b+248|0]=0;aj=b+212|0}else{af=W>=0.0;a[b+248|0]=af&1;ai=b+212|0;if(!af){aj=ai;break}af=L;H=ai;ai=c[af>>2]|0;ad=c[af+4>>2]|0;c[H>>2]=ai;c[H+4>>2]=ad;H=b+228|0;c[H>>2]=ai;c[H+4>>2]=ad;H=b+236|0;c[H>>2]=ai;c[H+4>>2]=ad;break L93}}while(0);E=aj;ad=(g[k>>2]=-0.0-U,c[k>>2]|0);H=(g[k>>2]=T,c[k>>2]|0)|0;c[E>>2]=0|ad;c[E+4>>2]=H;Q=-0.0- +g[F>>2];H=b+228|0;E=(g[k>>2]=-0.0- +g[f>>2],c[k>>2]|0);ad=(g[k>>2]=Q,c[k>>2]|0)|0;c[H>>2]=0|E;c[H+4>>2]=ad;Q=-0.0- +g[b+192>>2];ad=b+236|0;H=(g[k>>2]=-0.0- +g[b+188>>2],c[k>>2]|0);E=(g[k>>2]=Q,c[k>>2]|0)|0;c[ad>>2]=0|H;c[ad+4>>2]=E;break}do{if(W<0.0){if(Y<0.0){a[b+248|0]=0;ak=b+212|0}else{E=u>=0.0;a[b+248|0]=E&1;ad=b+212|0;if(E){al=ad;break}else{ak=ad}}ad=ak;E=(g[k>>2]=-0.0-U,c[k>>2]|0);H=(g[k>>2]=T,c[k>>2]|0)|0;c[ad>>2]=0|E;c[ad+4>>2]=H;Q=-0.0- +g[D>>2];H=b+228|0;ad=(g[k>>2]=-0.0- +g[K>>2],c[k>>2]|0);E=(g[k>>2]=Q,c[k>>2]|0)|0;c[H>>2]=0|ad;c[H+4>>2]=E;Q=-0.0- +g[b+192>>2];E=b+236|0;H=(g[k>>2]=-0.0- +g[b+188>>2],c[k>>2]|0);ad=(g[k>>2]=Q,c[k>>2]|0)|0;c[E>>2]=0|H;c[E+4>>2]=ad;break L93}else{a[b+248|0]=1;al=b+212|0}}while(0);f=L;F=al;ad=c[f+4>>2]|0;c[F>>2]=c[f>>2]|0;c[F+4>>2]=ad;ad=b+228|0;F=c[f+4>>2]|0;c[ad>>2]=c[f>>2]|0;c[ad+4>>2]=F;F=b+204|0;ad=b+236|0;f=c[F+4>>2]|0;c[ad>>2]=c[F>>2]|0;c[ad+4>>2]=f;break}else{aa=0;ab=0.0;ac=100}}while(0);L134:do{if((ac|0)==100){if(B){al=Y>=0.0;if(Z){do{if(al){a[b+248|0]=1;am=b+212|0}else{ak=u>=0.0;a[b+248|0]=ak&1;aj=b+212|0;if(ak){am=aj;break}ak=aj;aj=(g[k>>2]=-0.0-U,c[k>>2]|0);ah=0;ag=(g[k>>2]=T,c[k>>2]|0);c[ak>>2]=ah|aj;c[ak+4>>2]=ag|0;ak=L;aj=b+228|0;ae=c[ak>>2]|0;M=c[ak+4>>2]|0;c[aj>>2]=ae;c[aj+4>>2]=M;M=b+236|0;c[M>>2]=ah|(g[k>>2]=-0.0-(c[k>>2]=ae,+g[k>>2]),c[k>>2]|0);c[M+4>>2]=ag|0;break L134}}while(0);ag=L;M=am;ae=c[ag+4>>2]|0;c[M>>2]=c[ag>>2]|0;c[M+4>>2]=ae;ae=b+188|0;M=b+228|0;ag=c[ae+4>>2]|0;c[M>>2]=c[ae>>2]|0;c[M+4>>2]=ag;v=-0.0- +g[D>>2];ag=b+236|0;M=(g[k>>2]=-0.0- +g[K>>2],c[k>>2]|0);ae=(g[k>>2]=v,c[k>>2]|0)|0;c[ag>>2]=0|M;c[ag+4>>2]=ae;break}else{do{if(al){ae=u>=0.0;a[b+248|0]=ae&1;ag=b+212|0;if(!ae){an=ag;break}ae=L;M=ag;ag=c[ae>>2]|0;ah=c[ae+4>>2]|0;c[M>>2]=ag;c[M+4>>2]=ah;M=b+228|0;c[M>>2]=ag;c[M+4>>2]=ah;ah=b+236|0;M=(g[k>>2]=-0.0-(c[k>>2]=ag,+g[k>>2]),c[k>>2]|0);ag=(g[k>>2]=T,c[k>>2]|0)|0;c[ah>>2]=0|M;c[ah+4>>2]=ag;break L134}else{a[b+248|0]=0;an=b+212|0}}while(0);al=an;ag=(g[k>>2]=-0.0-U,c[k>>2]|0);ah=(g[k>>2]=T,c[k>>2]|0)|0;c[al>>2]=0|ag;c[al+4>>2]=ah;ah=L;al=b+228|0;ag=c[ah+4>>2]|0;c[al>>2]=c[ah>>2]|0;c[al+4>>2]=ag;v=-0.0- +g[b+192>>2];ag=b+236|0;al=(g[k>>2]=-0.0- +g[b+188>>2],c[k>>2]|0);ah=(g[k>>2]=v,c[k>>2]|0)|0;c[ag>>2]=0|al;c[ag+4>>2]=ah;break}}ah=u>=0.0;if(!e){a[b+248|0]=ah&1;ag=b+212|0;if(ah){al=L;M=ag;ae=c[al>>2]|0;aj=c[al+4>>2]|0;c[M>>2]=ae;c[M+4>>2]=aj;aj=b+228|0;M=(g[k>>2]=-0.0-(c[k>>2]=ae,+g[k>>2]),c[k>>2]|0);ae=0|M;M=(g[k>>2]=T,c[k>>2]|0)|0;c[aj>>2]=ae;c[aj+4>>2]=M;aj=b+236|0;c[aj>>2]=ae;c[aj+4>>2]=M;break}else{M=ag;ag=(g[k>>2]=-0.0-U,c[k>>2]|0);aj=(g[k>>2]=T,c[k>>2]|0)|0;c[M>>2]=0|ag;c[M+4>>2]=aj;aj=L;M=b+228|0;ag=c[aj>>2]|0;ae=c[aj+4>>2]|0;c[M>>2]=ag;c[M+4>>2]=ae;M=b+236|0;c[M>>2]=ag;c[M+4>>2]=ae;break}}if(aa){do{if(ah){a[b+248|0]=1;ao=b+212|0}else{ae=ab>=0.0;a[b+248|0]=ae&1;M=b+212|0;if(ae){ao=M;break}ae=M;M=(g[k>>2]=-0.0-U,c[k>>2]|0);ag=0|M;M=(g[k>>2]=T,c[k>>2]|0)|0;c[ae>>2]=ag;c[ae+4>>2]=M;ae=b+228|0;c[ae>>2]=ag;c[ae+4>>2]=M;M=L;ae=b+236|0;ag=c[M+4>>2]|0;c[ae>>2]=c[M>>2]|0;c[ae+4>>2]=ag;break L134}}while(0);ag=L;ae=ao;M=c[ag+4>>2]|0;c[ae>>2]=c[ag>>2]|0;c[ae+4>>2]=M;v=-0.0- +g[D>>2];M=b+228|0;ae=(g[k>>2]=-0.0- +g[K>>2],c[k>>2]|0);ag=(g[k>>2]=v,c[k>>2]|0)|0;c[M>>2]=0|ae;c[M+4>>2]=ag;ag=b+204|0;M=b+236|0;ae=c[ag+4>>2]|0;c[M>>2]=c[ag>>2]|0;c[M+4>>2]=ae;break}else{do{if(ah){ae=ab>=0.0;a[b+248|0]=ae&1;M=b+212|0;if(!ae){ap=M;break}ae=L;ag=M;M=c[ae>>2]|0;aj=c[ae+4>>2]|0;c[ag>>2]=M;c[ag+4>>2]=aj;ag=b+228|0;ae=(g[k>>2]=-0.0-(c[k>>2]=M,+g[k>>2]),c[k>>2]|0);al=(g[k>>2]=T,c[k>>2]|0)|0;c[ag>>2]=0|ae;c[ag+4>>2]=al;al=b+236|0;c[al>>2]=M;c[al+4>>2]=aj;break L134}else{a[b+248|0]=0;ap=b+212|0}}while(0);ah=ap;aj=(g[k>>2]=-0.0-U,c[k>>2]|0);al=(g[k>>2]=T,c[k>>2]|0)|0;c[ah>>2]=0|aj;c[ah+4>>2]=al;v=-0.0- +g[b+208>>2];al=b+228|0;ah=(g[k>>2]=-0.0- +g[b+204>>2],c[k>>2]|0);aj=(g[k>>2]=v,c[k>>2]|0)|0;c[al>>2]=0|ah;c[al+4>>2]=aj;aj=L;al=b+236|0;ah=c[aj+4>>2]|0;c[al>>2]=c[aj>>2]|0;c[al+4>>2]=ah;break}}}while(0);ap=h+148|0;ao=b+128|0;c[ao>>2]=c[ap>>2]|0;L172:do{if((c[ap>>2]|0)>0){aa=0;while(1){T=+g[y>>2];U=+g[h+20+(aa<<3)>>2];ab=+g[j>>2];u=+g[h+20+(aa<<3)+4>>2];Y=U*ab+T*u+ +g[q>>2];e=b+(aa<<3)|0;an=(g[k>>2]=+g[x>>2]+(T*U-ab*u),c[k>>2]|0);am=(g[k>>2]=Y,c[k>>2]|0)|0;c[e>>2]=0|an;c[e+4>>2]=am;Y=+g[y>>2];u=+g[h+84+(aa<<3)>>2];ab=+g[j>>2];U=+g[h+84+(aa<<3)+4>>2];am=b+64+(aa<<3)|0;e=(g[k>>2]=Y*u-ab*U,c[k>>2]|0);an=(g[k>>2]=u*ab+Y*U,c[k>>2]|0)|0;c[am>>2]=0|e;c[am+4>>2]=an;an=aa+1|0;if((an|0)<(c[ap>>2]|0)){aa=an}else{break L172}}}}while(0);ap=b+244|0;g[ap>>2]=.019999999552965164;aa=d+60|0;c[aa>>2]=0;an=b+248|0;am=c[ao>>2]|0;L176:do{if((am|0)>0){U=+g[b+164>>2];Y=+g[I>>2];ab=+g[b+212>>2];u=+g[b+216>>2];e=0;T=3.4028234663852886e+38;while(1){v=ab*(+g[b+(e<<3)>>2]-U)+u*(+g[b+(e<<3)+4>>2]-Y);z=v<T?v:T;Z=e+1|0;if((Z|0)==(am|0)){aq=z;break L176}else{e=Z;T=z}}}else{aq=3.4028234663852886e+38}}while(0);if(aq>+g[ap>>2]){i=l;return}bD(m,b);am=c[m>>2]|0;do{if((am|0)==0){ac=136}else{T=+g[m+8>>2];if(T>+g[ap>>2]){i=l;return}if(T<=aq*.9800000190734863+.0010000000474974513){ac=136;break}I=c[m+4>>2]|0;e=d+56|0;if((am|0)==1){ar=e;ac=138;break}c[e>>2]=2;e=n;Z=c[C>>2]|0;B=c[C+4>>2]|0;c[e>>2]=Z;c[e+4>>2]=B;e=n+8|0;ah=e;a[e]=0;e=I&255;a[ah+1|0]=e;a[ah+2|0]=0;a[ah+3|0]=1;ah=n+12|0;al=c[G>>2]|0;aj=c[G+4>>2]|0;c[ah>>2]=al;c[ah+4>>2]=aj;ah=n+20|0;M=ah;a[ah]=0;a[M+1|0]=e;a[M+2|0]=0;a[M+3|0]=1;M=I+1|0;ah=(M|0)<(c[ao>>2]|0)?M:0;M=b+(I<<3)|0;ag=c[M>>2]|0;ae=c[M+4>>2]|0;M=b+(ah<<3)|0;ak=c[M>>2]|0;J=c[M+4>>2]|0;M=b+64+(I<<3)|0;f=c[M>>2]|0;ad=c[M+4>>2]|0;T=(c[k>>2]=Z,+g[k>>2]);Y=(c[k>>2]=B,+g[k>>2]);u=(c[k>>2]=al,+g[k>>2]);as=I;at=ah&255;au=f;av=ad;aw=ak;ax=J;ay=ag;az=ae;aA=u;aB=T;aC=(c[k>>2]=aj,+g[k>>2]);aD=Y;aE=e;aF=0;break}}while(0);do{if((ac|0)==136){ar=d+56|0;ac=138;break}}while(0);do{if((ac|0)==138){c[ar>>2]=1;am=c[ao>>2]|0;L195:do{if((am|0)>1){aq=+g[b+216>>2];Y=+g[b+212>>2];m=0;T=Y*+g[b+64>>2]+aq*+g[b+68>>2];e=1;while(1){u=Y*+g[b+64+(e<<3)>>2]+aq*+g[b+64+(e<<3)+4>>2];aj=u<T;ae=aj?e:m;ag=e+1|0;if((ag|0)<(am|0)){m=ae;T=aj?u:T;e=ag}else{aG=ae;break L195}}}else{aG=0}}while(0);e=aG+1|0;m=(e|0)<(am|0)?e:0;e=b+(aG<<3)|0;ae=n;ag=c[e>>2]|0;aj=c[e+4>>2]|0;c[ae>>2]=ag;c[ae+4>>2]=aj;ae=n+8|0;e=ae;a[ae]=0;ae=aG&255;a[e+1|0]=ae;a[e+2|0]=1;a[e+3|0]=0;e=b+(m<<3)|0;J=n+12|0;ak=c[e>>2]|0;ad=c[e+4>>2]|0;c[J>>2]=ak;c[J+4>>2]=ad;J=n+20|0;e=J;a[J]=0;a[e+1|0]=m&255;a[e+2|0]=1;a[e+3|0]=0;e=(a[an]&1)<<24>>24==0;T=(c[k>>2]=ag,+g[k>>2]);aq=(c[k>>2]=aj,+g[k>>2]);Y=(c[k>>2]=ak,+g[k>>2]);u=(c[k>>2]=ad,+g[k>>2]);if(e){e=c[G>>2]|0;ad=c[G+4>>2]|0;ak=c[C>>2]|0;aj=c[C+4>>2]|0;U=-0.0- +g[D>>2];ag=(g[k>>2]=-0.0- +g[K>>2],c[k>>2]|0);as=1;at=0;au=ag;av=(g[k>>2]=U,c[k>>2]|0);aw=ak;ax=aj;ay=e;az=ad;aA=Y;aB=T;aC=u;aD=aq;aE=ae;aF=1;break}else{ad=L;as=0;at=1;au=c[ad>>2]|0;av=c[ad+4>>2]|0;aw=c[G>>2]|0;ax=c[G+4>>2]|0;ay=c[C>>2]|0;az=c[C+4>>2]|0;aA=Y;aB=T;aC=u;aD=aq;aE=ae;aF=1;break}}}while(0);aq=(c[k>>2]=au,+g[k>>2]);u=(c[k>>2]=av,+g[k>>2]);T=(c[k>>2]=ax,+g[k>>2]);Y=(c[k>>2]=ay,+g[k>>2]);U=(c[k>>2]=az,+g[k>>2]);ab=-0.0-aq;z=Y*u+U*ab;v=-0.0-u;$=(c[k>>2]=aw,+g[k>>2])*v+T*aq;T=u*aB+aD*ab-z;A=u*aA+aC*ab-z;if(T>0.0){aH=0}else{aw=o;ax=n;c[aw>>2]=c[ax>>2]|0;c[aw+4>>2]=c[ax+4>>2]|0;c[aw+8>>2]=c[ax+8>>2]|0;aH=1}if(A>0.0){aI=aH}else{ax=o+(aH*12&-1)|0;aw=n+12|0;c[ax>>2]=c[aw>>2]|0;c[ax+4>>2]=c[aw+4>>2]|0;c[ax+8>>2]=c[aw+8>>2]|0;aI=aH+1|0}if(T*A<0.0){z=T/(T-A);aH=o+(aI*12&-1)|0;aw=(g[k>>2]=aB+z*(aA-aB),c[k>>2]|0);ax=(g[k>>2]=aD+z*(aC-aD),c[k>>2]|0)|0;c[aH>>2]=0|aw;c[aH+4>>2]=ax;ax=o+(aI*12&-1)+8|0;aH=ax;a[ax]=as&255;a[aH+1|0]=aE;a[aH+2|0]=0;a[aH+3|0]=1;aJ=aI+1|0}else{aJ=aI}if((aJ|0)<2){i=l;return}aD=+g[o>>2];aC=+g[o+4>>2];z=aD*v+aq*aC-$;aJ=o+12|0;aB=+g[aJ>>2];aA=+g[o+16>>2];A=aB*v+aq*aA-$;if(z>0.0){aK=0}else{aI=p;aH=o;c[aI>>2]=c[aH>>2]|0;c[aI+4>>2]=c[aH+4>>2]|0;c[aI+8>>2]=c[aH+8>>2]|0;aK=1}if(A>0.0){aL=aK}else{aH=p+(aK*12&-1)|0;aI=aJ;c[aH>>2]=c[aI>>2]|0;c[aH+4>>2]=c[aI+4>>2]|0;c[aH+8>>2]=c[aI+8>>2]|0;aL=aK+1|0}if(z*A<0.0){$=z/(z-A);aK=p+(aL*12&-1)|0;aI=(g[k>>2]=aD+$*(aB-aD),c[k>>2]|0);aH=(g[k>>2]=aC+$*(aA-aC),c[k>>2]|0)|0;c[aK>>2]=0|aI;c[aK+4>>2]=aH;aH=p+(aL*12&-1)+8|0;aK=aH;a[aH]=at;a[aK+1|0]=a[(o+8|0)+1|0]|0;a[aK+2|0]=0;a[aK+3|0]=1;aM=aL+1|0}else{aM=aL}if((aM|0)<2){i=l;return}aM=d+40|0;do{if(aF){aL=aM;c[aL>>2]=0|au;c[aL+4>>2]=av|0;aL=d+48|0;c[aL>>2]=0|ay;c[aL+4>>2]=az|0;aC=+g[p>>2];aA=+g[p+4>>2];$=+g[ap>>2];if(aq*(aC-Y)+u*(aA-U)>$){aN=0;aO=$}else{$=aC- +g[x>>2];aC=aA- +g[q>>2];aA=+g[y>>2];aD=+g[j>>2];aL=d;aK=(g[k>>2]=$*aA+aC*aD,c[k>>2]|0);o=(g[k>>2]=aA*aC+$*(-0.0-aD),c[k>>2]|0)|0;c[aL>>2]=0|aK;c[aL+4>>2]=o;c[d+16>>2]=c[p+8>>2]|0;aN=1;aO=+g[ap>>2]}aD=+g[p+12>>2];$=+g[p+16>>2];if(aq*(aD-Y)+u*($-U)>aO){aP=aN;break}aC=aD- +g[x>>2];aD=$- +g[q>>2];$=+g[y>>2];aA=+g[j>>2];o=d+(aN*20&-1)|0;aL=(g[k>>2]=aC*$+aD*aA,c[k>>2]|0);aK=(g[k>>2]=$*aD+aC*(-0.0-aA),c[k>>2]|0)|0;c[o>>2]=0|aL;c[o+4>>2]=aK;c[d+(aN*20&-1)+16>>2]=c[p+20>>2]|0;aP=aN+1|0}else{aK=h+84+(as<<3)|0;o=aM;aL=c[aK+4>>2]|0;c[o>>2]=c[aK>>2]|0;c[o+4>>2]=aL;aL=h+20+(as<<3)|0;o=d+48|0;aK=c[aL+4>>2]|0;c[o>>2]=c[aL>>2]|0;c[o+4>>2]=aK;aA=+g[ap>>2];if(aq*(+g[p>>2]-Y)+u*(+g[p+4>>2]-U)>aA){aQ=0;aR=aA}else{aK=p;o=d;aL=c[aK+4>>2]|0;c[o>>2]=c[aK>>2]|0;c[o+4>>2]=aL;aL=p+8|0;o=aL;aK=d+16|0;at=aK;a[at+2|0]=a[o+3|0]|0;a[at+3|0]=a[o+2|0]|0;a[aK]=a[o+1|0]|0;a[at+1|0]=a[aL]|0;aQ=1;aR=+g[ap>>2]}aL=p+12|0;if(aq*(+g[aL>>2]-Y)+u*(+g[p+16>>2]-U)>aR){aP=aQ;break}at=aL;aL=d+(aQ*20&-1)|0;o=c[at+4>>2]|0;c[aL>>2]=c[at>>2]|0;c[aL+4>>2]=o;o=p+20|0;aL=o;at=d+(aQ*20&-1)+16|0;aK=at;a[aK+2|0]=a[aL+3|0]|0;a[aK+3|0]=a[aL+2|0]|0;a[at]=a[aL+1|0]|0;a[aK+1|0]=a[o]|0;aP=aQ+1|0}}while(0);c[aa>>2]=aP;i=l;return}function bD(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0,r=0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0;d=a|0;c[d>>2]=0;e=a+4|0;c[e>>2]=-1;f=a+8|0;g[f>>2]=-3.4028234663852886e+38;h=+g[b+216>>2];i=+g[b+212>>2];a=c[b+128>>2]|0;if((a|0)<=0){return}j=+g[b+164>>2];k=+g[b+168>>2];l=+g[b+172>>2];m=+g[b+176>>2];n=+g[b+244>>2];o=b+228|0;p=b+232|0;q=b+236|0;r=b+240|0;s=0;t=-3.4028234663852886e+38;while(1){u=+g[b+64+(s<<3)>>2];v=-0.0-u;w=-0.0- +g[b+64+(s<<3)+4>>2];x=+g[b+(s<<3)>>2];y=+g[b+(s<<3)+4>>2];z=(x-j)*v+(y-k)*w;A=(x-l)*v+(y-m)*w;B=z<A?z:A;if(B>n){break}do{if(h*u+i*w<0.0){if((v- +g[o>>2])*i+(w- +g[p>>2])*h>=-.03490658849477768&B>t){C=182;break}else{D=t;break}}else{if((v- +g[q>>2])*i+(w- +g[r>>2])*h>=-.03490658849477768&B>t){C=182;break}else{D=t;break}}}while(0);if((C|0)==182){C=0;c[d>>2]=2;c[e>>2]=s;g[f>>2]=B;D=B}E=s+1|0;if((E|0)<(a|0)){s=E;t=D}else{C=185;break}}if((C|0)==185){return}c[d>>2]=2;c[e>>2]=s;g[f>>2]=B;return}function bE(b,d,e,f,h){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;var j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0,B=0,C=0,D=0,E=0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0,P=0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;j=i;i=i+80|0;l=j|0;m=j+4|0;n=j+8|0;o=j+32|0;p=j+56|0;q=b+60|0;c[q>>2]=0;r=+g[d+8>>2]+ +g[f+8>>2];c[l>>2]=0;s=+bF(l,d,e,f,h);if(s>r){i=j;return}c[m>>2]=0;t=+bF(m,f,h,d,e);if(t>r){i=j;return}if(t>s*.9800000190734863+.0010000000474974513){s=+g[h>>2];t=+g[h+4>>2];u=+g[h+8>>2];v=+g[h+12>>2];w=+g[e>>2];x=+g[e+4>>2];y=+g[e+8>>2];z=+g[e+12>>2];A=c[m>>2]|0;c[b+56>>2]=2;B=f;C=d;D=A;E=1;F=w;G=x;H=y;I=z;J=s;K=t;L=u;M=v}else{v=+g[e>>2];u=+g[e+4>>2];t=+g[e+8>>2];s=+g[e+12>>2];z=+g[h>>2];y=+g[h+4>>2];x=+g[h+8>>2];w=+g[h+12>>2];h=c[l>>2]|0;c[b+56>>2]=1;B=d;C=f;D=h;E=0;F=z;G=y;H=x;I=w;J=v;K=u;L=t;M=s}h=c[C+148>>2]|0;do{if((D|0)>-1){if((c[B+148>>2]|0)>(D|0)){break}else{N=195;break}}else{N=195}}while(0);if((N|0)==195){aH(5250932,151,5258748,5252280)}s=+g[B+84+(D<<3)>>2];t=+g[B+84+(D<<3)+4>>2];u=M*s-L*t;v=L*s+M*t;t=I*u+H*v;s=-0.0-H;w=I*v+u*s;L274:do{if((h|0)>0){N=0;u=3.4028234663852886e+38;f=0;while(1){v=t*+g[C+84+(N<<3)>>2]+w*+g[C+84+(N<<3)+4>>2];d=v<u;l=d?N:f;e=N+1|0;if((e|0)==(h|0)){P=l;break L274}else{N=e;u=d?v:u;f=l}}}else{P=0}}while(0);f=P+1|0;N=(f|0)<(h|0)?f:0;w=+g[C+20+(P<<3)>>2];t=+g[C+20+(P<<3)+4>>2];u=F+(I*w-H*t);v=G+(H*w+I*t);f=n;h=(g[k>>2]=u,c[k>>2]|0);l=(g[k>>2]=v,c[k>>2]|0)|0;c[f>>2]=0|h;c[f+4>>2]=l;l=D&255;f=n+8|0;h=f;a[f]=l;f=P&255;a[h+1|0]=f;a[h+2|0]=1;a[h+3|0]=0;h=n+12|0;t=+g[C+20+(N<<3)>>2];w=+g[C+20+(N<<3)+4>>2];x=F+(I*t-H*w);y=G+(H*t+I*w);C=h;P=(g[k>>2]=x,c[k>>2]|0);d=(g[k>>2]=y,c[k>>2]|0)|0;c[C>>2]=0|P;c[C+4>>2]=d;d=n+20|0;C=d;a[d]=l;a[C+1|0]=N&255;a[C+2|0]=1;a[C+3|0]=0;C=D+1|0;N=(C|0)<(c[B+148>>2]|0)?C:0;C=B+20+(D<<3)|0;D=c[C+4>>2]|0;w=(c[k>>2]=c[C>>2]|0,+g[k>>2]);t=(c[k>>2]=D,+g[k>>2]);D=B+20+(N<<3)|0;B=c[D+4>>2]|0;z=(c[k>>2]=c[D>>2]|0,+g[k>>2]);Q=(c[k>>2]=B,+g[k>>2]);R=z-w;S=Q-t;T=+O(+(R*R+S*S));if(T<1.1920928955078125e-7){U=R;V=S}else{W=1.0/T;U=R*W;V=S*W}W=M*U-L*V;S=M*V+L*U;R=W*-1.0;T=J+(M*w-L*t);X=K+(L*w+M*t);Y=T*S+X*R;Z=r-(T*W+X*S);X=r+((J+(M*z-L*Q))*W+(K+(L*z+M*Q))*S);M=-0.0-W;L=-0.0-S;K=u*M+v*L-Z;J=x*M+y*L-Z;if(K>0.0){_=0}else{B=o;D=n;c[B>>2]=c[D>>2]|0;c[B+4>>2]=c[D+4>>2]|0;c[B+8>>2]=c[D+8>>2]|0;_=1}if(J>0.0){$=_}else{D=o+(_*12&-1)|0;B=h;c[D>>2]=c[B>>2]|0;c[D+4>>2]=c[B+4>>2]|0;c[D+8>>2]=c[B+8>>2]|0;$=_+1|0}if(K*J<0.0){Z=K/(K-J);_=o+($*12&-1)|0;B=(g[k>>2]=u+Z*(x-u),c[k>>2]|0);D=(g[k>>2]=v+Z*(y-v),c[k>>2]|0)|0;c[_>>2]=0|B;c[_+4>>2]=D;D=o+($*12&-1)+8|0;_=D;a[D]=l;a[_+1|0]=f;a[_+2|0]=0;a[_+3|0]=1;aa=$+1|0}else{aa=$}if((aa|0)<2){i=j;return}v=+g[o>>2];y=+g[o+4>>2];Z=W*v+S*y-X;aa=o+12|0;u=+g[aa>>2];x=+g[o+16>>2];J=W*u+S*x-X;if(Z>0.0){ab=0}else{$=p;_=o;c[$>>2]=c[_>>2]|0;c[$+4>>2]=c[_+4>>2]|0;c[$+8>>2]=c[_+8>>2]|0;ab=1}if(J>0.0){ac=ab}else{_=p+(ab*12&-1)|0;$=aa;c[_>>2]=c[$>>2]|0;c[_+4>>2]=c[$+4>>2]|0;c[_+8>>2]=c[$+8>>2]|0;ac=ab+1|0}if(Z*J<0.0){X=Z/(Z-J);ab=p+(ac*12&-1)|0;$=(g[k>>2]=v+X*(u-v),c[k>>2]|0);_=(g[k>>2]=y+X*(x-y),c[k>>2]|0)|0;c[ab>>2]=0|$;c[ab+4>>2]=_;_=p+(ac*12&-1)+8|0;ab=_;a[_]=N&255;a[ab+1|0]=a[(o+8|0)+1|0]|0;a[ab+2|0]=0;a[ab+3|0]=1;ad=ac+1|0}else{ad=ac}if((ad|0)<2){i=j;return}ad=b+40|0;ac=(g[k>>2]=V,c[k>>2]|0);ab=(g[k>>2]=U*-1.0,c[k>>2]|0)|0;c[ad>>2]=0|ac;c[ad+4>>2]=ab;ab=b+48|0;ad=(g[k>>2]=(w+z)*.5,c[k>>2]|0);ac=(g[k>>2]=(t+Q)*.5,c[k>>2]|0)|0;c[ab>>2]=0|ad;c[ab+4>>2]=ac;Q=+g[p>>2];t=+g[p+4>>2];ac=S*Q+R*t-Y>r;do{if(E<<24>>24==0){if(ac){ae=0}else{z=Q-F;w=t-G;ab=b;ad=(g[k>>2]=I*z+H*w,c[k>>2]|0);o=(g[k>>2]=z*s+I*w,c[k>>2]|0)|0;c[ab>>2]=0|ad;c[ab+4>>2]=o;c[b+16>>2]=c[p+8>>2]|0;ae=1}w=+g[p+12>>2];z=+g[p+16>>2];if(S*w+R*z-Y>r){af=ae;break}U=w-F;w=z-G;o=b+(ae*20&-1)|0;ab=(g[k>>2]=I*U+H*w,c[k>>2]|0);ad=(g[k>>2]=U*s+I*w,c[k>>2]|0)|0;c[o>>2]=0|ab;c[o+4>>2]=ad;c[b+(ae*20&-1)+16>>2]=c[p+20>>2]|0;af=ae+1|0}else{if(ac){ag=0}else{w=Q-F;U=t-G;ad=b;o=(g[k>>2]=I*w+H*U,c[k>>2]|0);ab=(g[k>>2]=w*s+I*U,c[k>>2]|0)|0;c[ad>>2]=0|o;c[ad+4>>2]=ab;ab=b+16|0;ad=c[p+8>>2]|0;c[ab>>2]=ad;o=ab;a[ab]=ad>>>8&255;a[o+1|0]=ad&255;a[o+2|0]=ad>>>24&255;a[o+3|0]=ad>>>16&255;ag=1}U=+g[p+12>>2];w=+g[p+16>>2];if(S*U+R*w-Y>r){af=ag;break}z=U-F;U=w-G;ad=b+(ag*20&-1)|0;o=(g[k>>2]=I*z+H*U,c[k>>2]|0);ab=(g[k>>2]=z*s+I*U,c[k>>2]|0)|0;c[ad>>2]=0|o;c[ad+4>>2]=ab;ab=b+(ag*20&-1)+16|0;ad=c[p+20>>2]|0;c[ab>>2]=ad;o=ab;a[ab]=ad>>>8&255;a[o+1|0]=ad&255;a[o+2|0]=ad>>>24&255;a[o+3|0]=ad>>>16&255;af=ag+1|0}}while(0);c[q>>2]=af;i=j;return}function bF(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0,A=0.0,B=0;h=c[b+148>>2]|0;i=+g[f+12>>2];j=+g[e+12>>2];k=+g[f+8>>2];l=+g[e+16>>2];m=+g[d+12>>2];n=+g[b+12>>2];o=+g[d+8>>2];p=+g[b+16>>2];q=+g[f>>2]+(i*j-k*l)-(+g[d>>2]+(m*n-o*p));r=j*k+i*l+ +g[f+4>>2]-(n*o+m*p+ +g[d+4>>2]);p=m*q+o*r;n=m*r+q*(-0.0-o);L319:do{if((h|0)>0){s=0;o=-3.4028234663852886e+38;t=0;while(1){q=p*+g[b+84+(s<<3)>>2]+n*+g[b+84+(s<<3)+4>>2];u=q>o;v=u?s:t;w=s+1|0;if((w|0)==(h|0)){x=v;break L319}else{s=w;o=u?q:o;t=v}}}else{x=0}}while(0);n=+bG(b,d,x,e,f);t=((x|0)>0?x:h)-1|0;p=+bG(b,d,t,e,f);s=x+1|0;v=(s|0)<(h|0)?s:0;o=+bG(b,d,v,e,f);if(p>n&p>o){q=p;s=t;while(1){t=((s|0)>0?s:h)-1|0;p=+bG(b,d,t,e,f);if(p>q){q=p;s=t}else{y=q;z=s;break}}c[a>>2]=z;return+y}if(o>n){A=o;B=v}else{y=n;z=x;c[a>>2]=z;return+y}while(1){x=B+1|0;v=(x|0)<(h|0)?x:0;n=+bG(b,d,v,e,f);if(n>A){A=n;B=v}else{y=A;z=B;break}}c[a>>2]=z;return+y}function bG(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0,v=0,w=0,x=0;h=c[e+148>>2]|0;do{if((d|0)>-1){if((c[a+148>>2]|0)>(d|0)){break}else{i=242;break}}else{i=242}}while(0);if((i|0)==242){aH(5250932,32,5258888,5252280)}j=+g[b+12>>2];k=+g[a+84+(d<<3)>>2];l=+g[b+8>>2];m=+g[a+84+(d<<3)+4>>2];n=j*k-l*m;o=k*l+j*m;m=+g[f+12>>2];k=+g[f+8>>2];p=m*n+k*o;q=m*o+n*(-0.0-k);L339:do{if((h|0)>0){i=0;r=3.4028234663852886e+38;s=0;while(1){t=p*+g[e+20+(i<<3)>>2]+q*+g[e+20+(i<<3)+4>>2];u=t<r;v=u?i:s;w=i+1|0;if((w|0)==(h|0)){x=v;break L339}else{i=w;r=u?t:r;s=v}}}else{x=0}}while(0);q=+g[a+20+(d<<3)>>2];p=+g[a+20+(d<<3)+4>>2];r=+g[e+20+(x<<3)>>2];t=+g[e+20+(x<<3)+4>>2];return+(n*(+g[f>>2]+(m*r-k*t)-(+g[b>>2]+(j*q-l*p)))+o*(r*k+m*t+ +g[f+4>>2]-(q*l+j*p+ +g[b+4>>2])))}function bH(a,b,d,e,f,h){a=a|0;b=b|0;d=d|0;e=+e;f=f|0;h=+h;var i=0,j=0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0,w=0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0,E=0,F=0,G=0,H=0.0,I=0.0;i=b+60|0;if((c[i>>2]|0)==0){return}j=c[b+56>>2]|0;if((j|0)==0){l=a|0;g[l>>2]=1.0;m=a+4|0;g[m>>2]=0.0;n=+g[d+12>>2];o=+g[b+48>>2];p=+g[d+8>>2];q=+g[b+52>>2];r=+g[d>>2]+(n*o-p*q);s=o*p+n*q+ +g[d+4>>2];q=+g[f+12>>2];n=+g[b>>2];p=+g[f+8>>2];o=+g[b+4>>2];t=+g[f>>2]+(q*n-p*o);u=n*p+q*o+ +g[f+4>>2];o=r-t;q=s-u;do{if(o*o+q*q>1.4210854715202004e-14){p=t-r;n=u-s;v=a;w=(g[k>>2]=p,c[k>>2]|0);x=(g[k>>2]=n,c[k>>2]|0)|0;c[v>>2]=0|w;c[v+4>>2]=x;y=+O(+(p*p+n*n));if(y<1.1920928955078125e-7){z=p;A=n;break}B=1.0/y;y=p*B;g[l>>2]=y;p=n*B;g[m>>2]=p;z=y;A=p}else{z=1.0;A=0.0}}while(0);m=a+8|0;l=(g[k>>2]=(r+z*e+(t-z*h))*.5,c[k>>2]|0);x=(g[k>>2]=(s+A*e+(u-A*h))*.5,c[k>>2]|0)|0;c[m>>2]=0|l;c[m+4>>2]=x;return}else if((j|0)==1){x=d+12|0;A=+g[x>>2];u=+g[b+40>>2];m=d+8|0;s=+g[m>>2];z=+g[b+44>>2];t=A*u-s*z;r=u*s+A*z;l=a;v=(g[k>>2]=t,c[k>>2]|0);w=(g[k>>2]=r,c[k>>2]|0)|0;c[l>>2]=0|v;c[l+4>>2]=w;z=+g[x>>2];A=+g[b+48>>2];s=+g[m>>2];u=+g[b+52>>2];q=+g[d>>2]+(z*A-s*u);o=A*s+z*u+ +g[d+4>>2];if((c[i>>2]|0)<=0){return}m=f+12|0;x=f+8|0;w=f|0;l=f+4|0;v=a|0;C=a+4|0;D=0;u=t;t=r;while(1){r=+g[m>>2];z=+g[b+(D*20&-1)>>2];s=+g[x>>2];A=+g[b+(D*20&-1)+4>>2];p=+g[w>>2]+(r*z-s*A);y=z*s+r*A+ +g[l>>2];A=e-(u*(p-q)+(y-o)*t);E=a+8+(D<<3)|0;F=(g[k>>2]=(p-u*h+(p+u*A))*.5,c[k>>2]|0);G=(g[k>>2]=(y-t*h+(y+t*A))*.5,c[k>>2]|0)|0;c[E>>2]=0|F;c[E+4>>2]=G;G=D+1|0;if((G|0)>=(c[i>>2]|0)){break}D=G;u=+g[v>>2];t=+g[C>>2]}return}else if((j|0)==2){j=f+12|0;t=+g[j>>2];u=+g[b+40>>2];C=f+8|0;o=+g[C>>2];q=+g[b+44>>2];A=t*u-o*q;y=u*o+t*q;v=a;D=(g[k>>2]=A,c[k>>2]|0);l=(g[k>>2]=y,c[k>>2]|0)|0;c[v>>2]=0|D;c[v+4>>2]=l;q=+g[j>>2];t=+g[b+48>>2];o=+g[C>>2];u=+g[b+52>>2];p=+g[f>>2]+(q*t-o*u);r=t*o+q*u+ +g[f+4>>2];L363:do{if((c[i>>2]|0)>0){f=d+12|0;C=d+8|0;j=d|0;l=d+4|0;D=a|0;w=a+4|0;x=0;u=A;q=y;while(1){o=+g[f>>2];t=+g[b+(x*20&-1)>>2];s=+g[C>>2];z=+g[b+(x*20&-1)+4>>2];B=+g[j>>2]+(o*t-s*z);n=t*s+o*z+ +g[l>>2];z=h-(u*(B-p)+(n-r)*q);m=a+8+(x<<3)|0;G=(g[k>>2]=(B-u*e+(B+u*z))*.5,c[k>>2]|0);E=(g[k>>2]=(n-q*e+(n+q*z))*.5,c[k>>2]|0)|0;c[m>>2]=0|G;c[m+4>>2]=E;E=x+1|0;z=+g[D>>2];n=+g[w>>2];if((E|0)<(c[i>>2]|0)){x=E;u=z;q=n}else{H=z;I=n;break L363}}}else{H=A;I=y}}while(0);i=(g[k>>2]=-0.0-H,c[k>>2]|0);a=(g[k>>2]=-0.0-I,c[k>>2]|0)|0;c[v>>2]=0|i;c[v+4>>2]=a;return}else{return}}function bI(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0;e=c[b+4>>2]|0;if((e|0)==0){c[a+16>>2]=b+12|0;c[a+20>>2]=1;g[a+24>>2]=+g[b+8>>2];return}else if((e|0)==2){c[a+16>>2]=b+20|0;c[a+20>>2]=c[b+148>>2]|0;g[a+24>>2]=+g[b+8>>2];return}else if((e|0)==3){f=b+16|0;do{if((d|0)>-1){if((c[f>>2]|0)>(d|0)){break}else{h=272;break}}else{h=272}}while(0);if((h|0)==272){aH(5246472,53,5257816,5251464)}h=b+12|0;i=(c[h>>2]|0)+(d<<3)|0;j=a;k=c[i+4>>2]|0;c[j>>2]=c[i>>2]|0;c[j+4>>2]=k;k=d+1|0;d=a+8|0;j=c[h>>2]|0;if((k|0)<(c[f>>2]|0)){f=j+(k<<3)|0;k=d;h=c[f+4>>2]|0;c[k>>2]=c[f>>2]|0;c[k+4>>2]=h}else{h=j;j=d;d=c[h+4>>2]|0;c[j>>2]=c[h>>2]|0;c[j+4>>2]=d}c[a+16>>2]=a|0;c[a+20>>2]=2;g[a+24>>2]=+g[b+8>>2];return}else if((e|0)==1){c[a+16>>2]=b+12|0;c[a+20>>2]=2;g[a+24>>2]=+g[b+8>>2];return}else{aH(5246472,81,5257816,5252172);return}}function bJ(a){a=a|0;var b=0,d=0,e=0.0,f=0.0,h=0,i=0.0,j=0.0,l=0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0;b=a+16|0;d=c[b+4>>2]|0;e=(c[k>>2]=c[b>>2]|0,+g[k>>2]);f=(c[k>>2]=d,+g[k>>2]);d=a+36|0;b=a+52|0;h=c[b+4>>2]|0;i=(c[k>>2]=c[b>>2]|0,+g[k>>2]);j=(c[k>>2]=h,+g[k>>2]);h=a+72|0;b=a+88|0;l=c[b+4>>2]|0;m=(c[k>>2]=c[b>>2]|0,+g[k>>2]);n=(c[k>>2]=l,+g[k>>2]);o=i-e;p=j-f;q=e*o+f*p;r=i*o+j*p;s=m-e;t=n-f;u=e*s+f*t;v=m*s+n*t;w=m-i;x=n-j;y=i*w+j*x;z=m*w+n*x;x=o*t-p*s;s=(i*n-j*m)*x;p=(f*m-e*n)*x;n=(e*j-f*i)*x;if(!(q<-0.0|u<-0.0)){g[a+24>>2]=1.0;c[a+108>>2]=1;return}if(!(q>=-0.0|r<=0.0|n>0.0)){x=1.0/(r-q);g[a+24>>2]=r*x;g[a+60>>2]=x*(-0.0-q);c[a+108>>2]=2;return}if(!(u>=-0.0|v<=0.0|p>0.0)){q=1.0/(v-u);g[a+24>>2]=v*q;g[a+96>>2]=q*(-0.0-u);c[a+108>>2]=2;pq(d,h,36);return}if(!(r>0.0|y<-0.0)){g[a+60>>2]=1.0;c[a+108>>2]=1;pq(a,d,36);return}if(!(v>0.0|z>0.0)){g[a+96>>2]=1.0;c[a+108>>2]=1;pq(a,h,36);return}if(y>=-0.0|z<=0.0|s>0.0){v=1.0/(n+(s+p));g[a+24>>2]=s*v;g[a+60>>2]=p*v;g[a+96>>2]=n*v;c[a+108>>2]=3;return}else{v=1.0/(z-y);g[a+60>>2]=z*v;g[a+96>>2]=v*(-0.0-y);c[a+108>>2]=2;pq(a,h,36);return}}function bK(d,e,f){d=d|0;e=e|0;f=f|0;var h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,P=0,Q=0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0,Z=0,_=0,$=0.0,aa=0.0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0.0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0,aD=0,aE=0.0,aF=0.0,aG=0.0;h=i;i=i+168|0;j=h|0;l=h+16|0;m=h+32|0;n=h+144|0;o=h+156|0;c[1311354]=(c[1311354]|0)+1|0;p=j;q=f+56|0;c[p>>2]=c[q>>2]|0;c[p+4>>2]=c[q+4>>2]|0;c[p+8>>2]=c[q+8>>2]|0;c[p+12>>2]=c[q+12>>2]|0;q=l;p=f+72|0;c[q>>2]=c[p>>2]|0;c[q+4>>2]=c[p+4>>2]|0;c[q+8>>2]=c[p+8>>2]|0;c[q+12>>2]=c[p+12>>2]|0;bL(m,e,f|0,j,f+28|0,l);p=m|0;q=m+108|0;r=c[q>>2]|0;if((r|0)==0){aH(5246472,194,5254096,5252172)}else if(!((r|0)==1|(r|0)==2|(r|0)==3)){aH(5246472,207,5254096,5252172)}r=j+12|0;s=j+8|0;t=f+16|0;u=f+20|0;v=j|0;w=j+4|0;j=l+12|0;x=l+8|0;y=f+44|0;z=f+48|0;A=l|0;B=l+4|0;l=m+16|0;C=m+20|0;D=m+52|0;E=m+56|0;F=m+16|0;G=m+52|0;H=m+24|0;I=m+60|0;J=m;K=m+36|0;L=0;M=c[q>>2]|0;L422:while(1){N=(M|0)>0;L424:do{if(N){P=0;while(1){c[n+(P<<2)>>2]=c[p+(P*36&-1)+28>>2]|0;c[o+(P<<2)>>2]=c[p+(P*36&-1)+32>>2]|0;Q=P+1|0;if((Q|0)==(M|0)){break L424}else{P=Q}}}}while(0);do{if((M|0)==2){P=c[F+4>>2]|0;R=(c[k>>2]=c[F>>2]|0,+g[k>>2]);S=(c[k>>2]=P,+g[k>>2]);P=c[G+4>>2]|0;T=(c[k>>2]=c[G>>2]|0,+g[k>>2]);U=(c[k>>2]=P,+g[k>>2]);V=T-R;W=U-S;X=R*V+S*W;if(X>=-0.0){g[H>>2]=1.0;c[q>>2]=1;Y=325;break}S=T*V+U*W;if(S>0.0){W=1.0/(S-X);g[H>>2]=S*W;g[I>>2]=W*(-0.0-X);c[q>>2]=2;Y=326;break}else{g[I>>2]=1.0;c[q>>2]=1;pq(J,K,36);Y=320;break}}else if((M|0)==3){bJ(m);Y=320;break}else if((M|0)==1){Y=323}else{aH(5246472,498,5259244,5252172);Y=320;break}}while(0);do{if((Y|0)==320){Y=0;P=c[q>>2]|0;if((P|0)==0){aH(5246472,194,5254096,5252172);Y=323;break}else if((P|0)==1|(P|0)==2){Z=P;Y=324;break}else if((P|0)==3){_=L;break L422}else{aH(5246472,207,5254096,5252172);Y=323;break}}}while(0);do{if((Y|0)==323){Y=0;Z=c[q>>2]|0;Y=324;break}}while(0);do{if((Y|0)==324){Y=0;if((Z|0)==1){Y=325;break}else if((Z|0)==2){Y=326;break}aH(5246472,184,5253988,5252172);P=5245428;Q=c[P+4>>2]|0;X=(c[k>>2]=c[P>>2]|0,+g[k>>2]);$=X;aa=(c[k>>2]=Q,+g[k>>2]);break}}while(0);do{if((Y|0)==325){Y=0;$=-0.0- +g[l>>2];aa=-0.0- +g[C>>2]}else if((Y|0)==326){Y=0;X=+g[l>>2];W=+g[D>>2]-X;S=+g[C>>2];U=+g[E>>2]-S;if(W*(-0.0-S)-U*(-0.0-X)>0.0){$=U*-1.0;aa=W;break}else{$=U;aa=W*-1.0;break}}}while(0);if(aa*aa+$*$<1.4210854715202004e-14){_=L;break}Q=c[q>>2]|0;P=p+(Q*36&-1)|0;W=-0.0-aa;U=+g[r>>2];X=+g[s>>2];S=U*(-0.0-$)+X*W;V=U*W+$*X;ab=c[t>>2]|0;ac=c[u>>2]|0;do{if((ac|0)>1){W=V*+g[ab+4>>2]+S*+g[ab>>2];ad=1;ae=0;while(1){T=S*+g[ab+(ad<<3)>>2]+V*+g[ab+(ad<<3)+4>>2];af=T>W;ag=af?ad:ae;ah=ad+1|0;if((ah|0)==(ac|0)){break}else{W=af?T:W;ad=ah;ae=ag}}ae=p+(Q*36&-1)+28|0;c[ae>>2]=ag;ad=P|0;if((ag|0)>-1){ai=ag;aj=ae;ak=ad;Y=336;break}else{al=ag;am=ae;an=ad;Y=337;break}}else{ad=p+(Q*36&-1)+28|0;c[ad>>2]=0;ai=0;aj=ad;ak=P|0;Y=336;break}}while(0);do{if((Y|0)==336){Y=0;if((ac|0)>(ai|0)){ao=ai;ap=aj;aq=ak;ar=ab;break}else{al=ai;am=aj;an=ak;Y=337;break}}}while(0);if((Y|0)==337){Y=0;aH(5248456,103,5254292,5247472);ao=al;ap=am;aq=an;ar=c[t>>2]|0}V=+g[ar+(ao<<3)>>2];S=+g[ar+(ao<<3)+4>>2];W=V*X+U*S+ +g[w>>2];ab=P;ac=(g[k>>2]=+g[v>>2]+(U*V-X*S),c[k>>2]|0);ad=(g[k>>2]=W,c[k>>2]|0)|0;c[ab>>2]=0|ac;c[ab+4>>2]=ad;W=+g[j>>2];S=+g[x>>2];V=$*W+aa*S;T=aa*W+$*(-0.0-S);ad=c[y>>2]|0;ab=c[z>>2]|0;do{if((ab|0)>1){R=T*+g[ad+4>>2]+V*+g[ad>>2];ac=1;ae=0;while(1){as=V*+g[ad+(ac<<3)>>2]+T*+g[ad+(ac<<3)+4>>2];ah=as>R;at=ah?ac:ae;af=ac+1|0;if((af|0)==(ab|0)){break}else{R=ah?as:R;ac=af;ae=at}}ae=p+(Q*36&-1)+32|0;c[ae>>2]=at;ac=p+(Q*36&-1)+8|0;if((at|0)>-1){au=at;av=ae;aw=ac;Y=343;break}else{ax=at;ay=ae;az=ac;Y=344;break}}else{ac=p+(Q*36&-1)+32|0;c[ac>>2]=0;au=0;av=ac;aw=p+(Q*36&-1)+8|0;Y=343;break}}while(0);do{if((Y|0)==343){Y=0;if((ab|0)>(au|0)){aA=au;aB=av;aC=aw;aD=ad;break}else{ax=au;ay=av;az=aw;Y=344;break}}}while(0);if((Y|0)==344){Y=0;aH(5248456,103,5254292,5247472);aA=ax;aB=ay;aC=az;aD=c[y>>2]|0}T=+g[aD+(aA<<3)>>2];V=+g[aD+(aA<<3)+4>>2];X=+g[A>>2]+(W*T-S*V);U=T*S+W*V+ +g[B>>2];ad=aC;ab=(g[k>>2]=X,c[k>>2]|0);P=(g[k>>2]=U,c[k>>2]|0)|0;c[ad>>2]=0|ab;c[ad+4>>2]=P;V=U- +g[aq+4>>2];P=p+(Q*36&-1)+16|0;ad=(g[k>>2]=X- +g[aq>>2],c[k>>2]|0);ab=(g[k>>2]=V,c[k>>2]|0)|0;c[P>>2]=0|ad;c[P+4>>2]=ab;ab=L+1|0;c[1311353]=(c[1311353]|0)+1|0;L478:do{if(N){P=c[ap>>2]|0;ad=0;while(1){if((P|0)==(c[n+(ad<<2)>>2]|0)){if((c[aB>>2]|0)==(c[o+(ad<<2)>>2]|0)){_=ab;break L422}}ac=ad+1|0;if((ac|0)<(M|0)){ad=ac}else{break L478}}}}while(0);N=(c[q>>2]|0)+1|0;c[q>>2]=N;if((ab|0)<20){L=ab;M=N}else{_=ab;break}}M=c[1311352]|0;c[1311352]=(M|0)>(_|0)?M:_;M=d+8|0;bM(m,d|0,M);L=d|0;o=M|0;$=+g[L>>2]- +g[o>>2];aB=d+4|0;n=d+12|0;aa=+g[aB>>2]- +g[n>>2];ap=d+16|0;g[ap>>2]=+O(+($*$+aa*aa));c[d+20>>2]=_;_=c[q>>2]|0;if((_|0)==0){aH(5246472,246,5253948,5252172);aE=0.0}else if((_|0)==2){aa=+g[l>>2]- +g[D>>2];$=+g[C>>2]- +g[E>>2];aE=+O(+(aa*aa+$*$))}else if((_|0)==3){$=+g[l>>2];aa=+g[C>>2];aE=(+g[D>>2]-$)*(+g[m+92>>2]-aa)-(+g[E>>2]-aa)*(+g[m+88>>2]-$)}else if((_|0)==1){aE=0.0}else{aH(5246472,259,5253948,5252172);aE=0.0}g[e>>2]=aE;_=c[q>>2]|0;b[e+4>>1]=_&65535;L493:do{if((_|0)>0){q=0;while(1){a[q+(e+6)|0]=c[p+(q*36&-1)+28>>2]&255;a[q+(e+9)|0]=c[p+(q*36&-1)+32>>2]&255;m=q+1|0;if((m|0)<(_|0)){q=m}else{break L493}}}}while(0);if((a[f+88|0]&1)<<24>>24==0){i=h;return}aE=+g[f+24>>2];$=+g[f+52>>2];aa=+g[ap>>2];W=aE+$;if(!(aa>W&aa>1.1920928955078125e-7)){S=(+g[aB>>2]+ +g[n>>2])*.5;f=d;d=(g[k>>2]=(+g[L>>2]+ +g[o>>2])*.5,c[k>>2]|0);_=0|d;d=(g[k>>2]=S,c[k>>2]|0)|0;c[f>>2]=_;c[f+4>>2]=d;f=M;c[f>>2]=_;c[f+4>>2]=d;g[ap>>2]=0.0;i=h;return}g[ap>>2]=aa-W;W=+g[o>>2];aa=+g[L>>2];S=W-aa;V=+g[n>>2];X=+g[aB>>2];U=V-X;T=+O(+(S*S+U*U));if(T<1.1920928955078125e-7){aF=S;aG=U}else{R=1.0/T;aF=S*R;aG=U*R}g[L>>2]=aE*aF+aa;g[aB>>2]=aE*aG+X;g[o>>2]=W-$*aF;g[n>>2]=V-$*aG;i=h;return}function bL(a,e,f,h,i,j){a=a|0;e=e|0;f=f|0;h=h|0;i=i|0;j=j|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0.0,J=0.0,K=0,L=0.0,M=0.0,N=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0;l=e+4|0;m=b[l>>1]|0;if((m&65535)<4){n=m}else{aH(5246472,102,5255224,5246948);n=b[l>>1]|0}l=n&65535;m=a+108|0;c[m>>2]=l;o=a|0;L512:do{if(n<<16>>16==0){p=l}else{q=f+20|0;r=f+16|0;s=i+20|0;t=i+16|0;u=h+12|0;v=h+8|0;w=h|0;x=h+4|0;y=j+12|0;z=j+8|0;A=j|0;B=j+4|0;C=0;while(1){D=o+(C*36&-1)|0;E=d[C+(e+6)|0]|0;c[o+(C*36&-1)+28>>2]=E;F=d[C+(e+9)|0]|0;G=o+(C*36&-1)+32|0;c[G>>2]=F;if((c[q>>2]|0)>(E|0)){H=F}else{aH(5248456,103,5254292,5247472);H=c[G>>2]|0}G=(c[r>>2]|0)+(E<<3)|0;E=c[G+4>>2]|0;I=(c[k>>2]=c[G>>2]|0,+g[k>>2]);J=(c[k>>2]=E,+g[k>>2]);do{if((H|0)>-1){if((c[s>>2]|0)>(H|0)){break}else{K=376;break}}else{K=376}}while(0);if((K|0)==376){K=0;aH(5248456,103,5254292,5247472)}E=(c[t>>2]|0)+(H<<3)|0;G=c[E+4>>2]|0;L=(c[k>>2]=c[E>>2]|0,+g[k>>2]);M=(c[k>>2]=G,+g[k>>2]);N=+g[u>>2];P=+g[v>>2];Q=+g[w>>2]+(I*N-J*P);R=J*N+I*P+ +g[x>>2];G=D;E=(g[k>>2]=Q,c[k>>2]|0);F=(g[k>>2]=R,c[k>>2]|0)|0;c[G>>2]=0|E;c[G+4>>2]=F;R=+g[y>>2];P=+g[z>>2];N=+g[A>>2]+(L*R-M*P);S=M*R+L*P+ +g[B>>2];F=o+(C*36&-1)+8|0;G=(g[k>>2]=N,c[k>>2]|0);E=(g[k>>2]=S,c[k>>2]|0)|0;c[F>>2]=0|G;c[F+4>>2]=E;S=+g[o+(C*36&-1)+12>>2]- +g[o+(C*36&-1)+4>>2];E=o+(C*36&-1)+16|0;F=(g[k>>2]=N-Q,c[k>>2]|0);G=(g[k>>2]=S,c[k>>2]|0)|0;c[E>>2]=0|F;c[E+4>>2]=G;g[o+(C*36&-1)+24>>2]=0.0;G=C+1|0;E=c[m>>2]|0;if((G|0)<(E|0)){C=G}else{p=E;break L512}}}}while(0);L525:do{if((p|0)>1){S=+g[e>>2];if((p|0)==2){Q=+g[a+16>>2]- +g[a+52>>2];N=+g[a+20>>2]- +g[a+56>>2];T=+O(+(Q*Q+N*N))}else if((p|0)==3){N=+g[a+16>>2];Q=+g[a+20>>2];T=(+g[a+52>>2]-N)*(+g[a+92>>2]-Q)-(+g[a+56>>2]-Q)*(+g[a+88>>2]-N)}else{aH(5246472,259,5253948,5252172);T=0.0}do{if(T>=S*.5){if(S*2.0<T|T<1.1920928955078125e-7){break}U=c[m>>2]|0;K=387;break L525}}while(0);c[m>>2]=0;break}else{U=p;K=387}}while(0);do{if((K|0)==387){if((U|0)==0){break}return}}while(0);c[a+28>>2]=0;c[a+32>>2]=0;if((c[f+20>>2]|0)<=0){aH(5248456,103,5254292,5247472)}U=c[f+16>>2]|0;f=c[U+4>>2]|0;T=(c[k>>2]=c[U>>2]|0,+g[k>>2]);S=(c[k>>2]=f,+g[k>>2]);if((c[i+20>>2]|0)<=0){aH(5248456,103,5254292,5247472)}f=c[i+16>>2]|0;i=c[f+4>>2]|0;N=(c[k>>2]=c[f>>2]|0,+g[k>>2]);Q=(c[k>>2]=i,+g[k>>2]);P=+g[h+12>>2];L=+g[h+8>>2];R=+g[h>>2]+(T*P-S*L);M=S*P+T*L+ +g[h+4>>2];h=a;i=(g[k>>2]=R,c[k>>2]|0);f=(g[k>>2]=M,c[k>>2]|0)|0;c[h>>2]=0|i;c[h+4>>2]=f;L=+g[j+12>>2];T=+g[j+8>>2];P=+g[j>>2]+(N*L-Q*T);S=Q*L+N*T+ +g[j+4>>2];j=a+8|0;f=(g[k>>2]=P,c[k>>2]|0);h=(g[k>>2]=S,c[k>>2]|0)|0;c[j>>2]=0|f;c[j+4>>2]=h;h=a+16|0;a=(g[k>>2]=P-R,c[k>>2]|0);j=(g[k>>2]=S-M,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=j;c[m>>2]=1;return}function bM(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0;e=c[a+108>>2]|0;if((e|0)==0){aH(5246472,217,5254036,5252172);return}else if((e|0)==1){f=a;h=b;i=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=i;i=a+8|0;h=d;f=c[i+4>>2]|0;c[h>>2]=c[i>>2]|0;c[h+4>>2]=f;return}else if((e|0)==2){f=a+24|0;j=+g[f>>2];h=a+60|0;l=+g[h>>2];m=j*+g[a+4>>2]+l*+g[a+40>>2];i=b;n=(g[k>>2]=j*+g[a>>2]+l*+g[a+36>>2],c[k>>2]|0);o=(g[k>>2]=m,c[k>>2]|0)|0;c[i>>2]=0|n;c[i+4>>2]=o;m=+g[f>>2];l=+g[h>>2];j=m*+g[a+12>>2]+l*+g[a+48>>2];h=d;f=(g[k>>2]=m*+g[a+8>>2]+l*+g[a+44>>2],c[k>>2]|0);o=(g[k>>2]=j,c[k>>2]|0)|0;c[h>>2]=0|f;c[h+4>>2]=o;return}else if((e|0)==3){j=+g[a+24>>2];l=+g[a+60>>2];m=+g[a+96>>2];p=j*+g[a+4>>2]+l*+g[a+40>>2]+m*+g[a+76>>2];e=b;b=(g[k>>2]=j*+g[a>>2]+l*+g[a+36>>2]+m*+g[a+72>>2],c[k>>2]|0);a=0|b;b=(g[k>>2]=p,c[k>>2]|0)|0;c[e>>2]=a;c[e+4>>2]=b;e=d;c[e>>2]=a;c[e+4>>2]=b;return}else{aH(5246472,236,5254036,5252172);return}}function bN(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;b=a+16|0;d=c[b>>2]|0;if((d|0)==-1){e=a+8|0;f=c[e>>2]|0;g=a+12|0;if((f|0)==(c[g>>2]|0)){h=f}else{aH(5251996,61,5258380,5252924);h=c[g>>2]|0}f=a+4|0;i=c[f>>2]|0;c[g>>2]=h<<1;j=pi(h*72&-1)|0;c[f>>2]=j;h=i;pq(j,h,(c[e>>2]|0)*36&-1);pj(h);h=c[e>>2]|0;j=(c[g>>2]|0)-1|0;L566:do{if((h|0)<(j|0)){i=h;while(1){k=i+1|0;c[(c[f>>2]|0)+(i*36&-1)+20>>2]=k;c[(c[f>>2]|0)+(i*36&-1)+32>>2]=-1;l=(c[g>>2]|0)-1|0;if((k|0)<(l|0)){i=k}else{m=l;break L566}}}else{m=j}}while(0);c[(c[f>>2]|0)+(m*36&-1)+20>>2]=-1;c[(c[f>>2]|0)+(((c[g>>2]|0)-1|0)*36&-1)+32>>2]=-1;g=c[e>>2]|0;c[b>>2]=g;n=g;o=f;p=e}else{n=d;o=a+4|0;p=a+8|0}a=(c[o>>2]|0)+(n*36&-1)+20|0;c[b>>2]=c[a>>2]|0;c[a>>2]=-1;c[(c[o>>2]|0)+(n*36&-1)+24>>2]=-1;c[(c[o>>2]|0)+(n*36&-1)+28>>2]=-1;c[(c[o>>2]|0)+(n*36&-1)+32>>2]=0;c[(c[o>>2]|0)+(n*36&-1)+16>>2]=0;c[p>>2]=(c[p>>2]|0)+1|0;return n|0}function bO(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0,G=0;d=a+24|0;c[d>>2]=(c[d>>2]|0)+1|0;d=a|0;e=c[d>>2]|0;if((e|0)==-1){c[d>>2]=b;c[(c[a+4>>2]|0)+(b*36&-1)+20>>2]=-1;return}f=a+4|0;h=c[f>>2]|0;i=+g[h+(b*36&-1)>>2];j=+g[h+(b*36&-1)+4>>2];l=+g[h+(b*36&-1)+8>>2];m=+g[h+(b*36&-1)+12>>2];n=c[h+(e*36&-1)+24>>2]|0;L576:do{if((n|0)==-1){o=e}else{p=e;q=n;while(1){r=c[h+(p*36&-1)+28>>2]|0;s=+g[h+(p*36&-1)+8>>2];t=+g[h+(p*36&-1)>>2];u=+g[h+(p*36&-1)+12>>2];v=+g[h+(p*36&-1)+4>>2];w=((s>l?s:l)-(t<i?t:i)+((u>m?u:m)-(v<j?v:j)))*2.0;x=w*2.0;y=(w-(s-t+(u-v))*2.0)*2.0;v=+g[h+(q*36&-1)>>2];u=i<v?i:v;t=+g[h+(q*36&-1)+4>>2];s=j<t?j:t;w=+g[h+(q*36&-1)+8>>2];z=l>w?l:w;A=+g[h+(q*36&-1)+12>>2];B=m>A?m:A;if((c[h+(q*36&-1)+24>>2]|0)==-1){C=(z-u+(B-s))*2.0}else{C=(z-u+(B-s))*2.0-(w-v+(A-t))*2.0}t=y+C;A=+g[h+(r*36&-1)>>2];v=i<A?i:A;w=+g[h+(r*36&-1)+4>>2];s=j<w?j:w;B=+g[h+(r*36&-1)+8>>2];u=l>B?l:B;z=+g[h+(r*36&-1)+12>>2];D=m>z?m:z;if((c[h+(r*36&-1)+24>>2]|0)==-1){E=(u-v+(D-s))*2.0}else{E=(u-v+(D-s))*2.0-(B-A+(z-w))*2.0}w=y+E;if(x<t&x<w){o=p;break L576}F=t<w?q:r;r=c[h+(F*36&-1)+24>>2]|0;if((r|0)==-1){o=F;break L576}else{p=F;q=r}}}}while(0);n=c[h+(o*36&-1)+20>>2]|0;h=bN(a)|0;c[(c[f>>2]|0)+(h*36&-1)+20>>2]=n;c[(c[f>>2]|0)+(h*36&-1)+16>>2]=0;e=c[f>>2]|0;E=+g[e+(o*36&-1)>>2];C=+g[e+(o*36&-1)+4>>2];q=e+(h*36&-1)|0;p=(g[k>>2]=i<E?i:E,c[k>>2]|0);r=(g[k>>2]=j<C?j:C,c[k>>2]|0)|0;c[q>>2]=0|p;c[q+4>>2]=r;C=+g[e+(o*36&-1)+8>>2];j=+g[e+(o*36&-1)+12>>2];r=e+(h*36&-1)+8|0;e=(g[k>>2]=l>C?l:C,c[k>>2]|0);q=(g[k>>2]=m>j?m:j,c[k>>2]|0)|0;c[r>>2]=0|e;c[r+4>>2]=q;q=c[f>>2]|0;c[q+(h*36&-1)+32>>2]=(c[q+(o*36&-1)+32>>2]|0)+1|0;q=c[f>>2]|0;if((n|0)==-1){c[q+(h*36&-1)+24>>2]=o;c[(c[f>>2]|0)+(h*36&-1)+28>>2]=b;c[(c[f>>2]|0)+(o*36&-1)+20>>2]=h;c[(c[f>>2]|0)+(b*36&-1)+20>>2]=h;c[d>>2]=h}else{d=q+(n*36&-1)+24|0;if((c[d>>2]|0)==(o|0)){c[d>>2]=h}else{c[q+(n*36&-1)+28>>2]=h}c[(c[f>>2]|0)+(h*36&-1)+24>>2]=o;c[(c[f>>2]|0)+(h*36&-1)+28>>2]=b;c[(c[f>>2]|0)+(o*36&-1)+20>>2]=h;c[(c[f>>2]|0)+(b*36&-1)+20>>2]=h}h=c[(c[f>>2]|0)+(b*36&-1)+20>>2]|0;if((h|0)==-1){return}else{G=h}while(1){h=bS(a,G)|0;b=c[f>>2]|0;o=c[b+(h*36&-1)+24>>2]|0;n=c[b+(h*36&-1)+28>>2]|0;if((o|0)==-1){aH(5251996,307,5258416,5246376)}if((n|0)==-1){aH(5251996,308,5258416,5246124)}b=c[f>>2]|0;q=c[b+(o*36&-1)+32>>2]|0;d=c[b+(n*36&-1)+32>>2]|0;c[b+(h*36&-1)+32>>2]=((q|0)>(d|0)?q:d)+1|0;d=c[f>>2]|0;j=+g[d+(o*36&-1)>>2];m=+g[d+(n*36&-1)>>2];C=+g[d+(o*36&-1)+4>>2];l=+g[d+(n*36&-1)+4>>2];q=d+(h*36&-1)|0;b=(g[k>>2]=j<m?j:m,c[k>>2]|0);r=(g[k>>2]=C<l?C:l,c[k>>2]|0)|0;c[q>>2]=0|b;c[q+4>>2]=r;l=+g[d+(o*36&-1)+8>>2];C=+g[d+(n*36&-1)+8>>2];m=+g[d+(o*36&-1)+12>>2];j=+g[d+(n*36&-1)+12>>2];n=d+(h*36&-1)+8|0;d=(g[k>>2]=l>C?l:C,c[k>>2]|0);o=(g[k>>2]=m>j?m:j,c[k>>2]|0)|0;c[n>>2]=0|d;c[n+4>>2]=o;o=c[(c[f>>2]|0)+(h*36&-1)+20>>2]|0;if((o|0)==-1){break}else{G=o}}return}function bP(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=(b|0)>-1;do{if(d){if((c[a+12>>2]|0)>(b|0)){break}else{e=445;break}}else{e=445}}while(0);if((e|0)==445){aH(5251996,126,5258340,5250596)}f=a+4|0;if((c[(c[f>>2]|0)+(b*36&-1)+24>>2]|0)!=-1){aH(5251996,127,5258340,5246864)}bQ(a,b);do{if(d){if((c[a+12>>2]|0)>(b|0)){break}else{e=450;break}}else{e=450}}while(0);if((e|0)==450){aH(5251996,97,5258268,5250468)}e=a+8|0;if((c[e>>2]|0)<=0){aH(5251996,98,5258268,5248188)}d=a+16|0;c[(c[f>>2]|0)+(b*36&-1)+20>>2]=c[d>>2]|0;c[(c[f>>2]|0)+(b*36&-1)+32>>2]=-1;c[d>>2]=b;c[e>>2]=(c[e>>2]|0)-1|0;return}function bQ(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0.0,o=0.0,p=0.0,q=0.0;d=a|0;if((c[d>>2]|0)==(b|0)){c[d>>2]=-1;return}e=a+4|0;f=c[e>>2]|0;h=c[f+(b*36&-1)+20>>2]|0;i=c[f+(h*36&-1)+20>>2]|0;j=c[f+(h*36&-1)+24>>2]|0;if((j|0)==(b|0)){l=c[f+(h*36&-1)+28>>2]|0}else{l=j}if((i|0)==-1){c[d>>2]=l;c[f+(l*36&-1)+20>>2]=-1;do{if((h|0)>-1){if((c[a+12>>2]|0)>(h|0)){break}else{m=471;break}}else{m=471}}while(0);if((m|0)==471){aH(5251996,97,5258268,5250468)}d=a+8|0;if((c[d>>2]|0)<=0){aH(5251996,98,5258268,5248188)}j=a+16|0;c[(c[e>>2]|0)+(h*36&-1)+20>>2]=c[j>>2]|0;c[(c[e>>2]|0)+(h*36&-1)+32>>2]=-1;c[j>>2]=h;c[d>>2]=(c[d>>2]|0)-1|0;return}d=f+(i*36&-1)+24|0;if((c[d>>2]|0)==(h|0)){c[d>>2]=l}else{c[f+(i*36&-1)+28>>2]=l}c[(c[e>>2]|0)+(l*36&-1)+20>>2]=i;do{if((h|0)>-1){if((c[a+12>>2]|0)>(h|0)){break}else{m=464;break}}else{m=464}}while(0);if((m|0)==464){aH(5251996,97,5258268,5250468)}m=a+8|0;if((c[m>>2]|0)<=0){aH(5251996,98,5258268,5248188)}l=a+16|0;c[(c[e>>2]|0)+(h*36&-1)+20>>2]=c[l>>2]|0;c[(c[e>>2]|0)+(h*36&-1)+32>>2]=-1;c[l>>2]=h;c[m>>2]=(c[m>>2]|0)-1|0;m=i;while(1){i=bS(a,m)|0;h=c[e>>2]|0;l=c[h+(i*36&-1)+24>>2]|0;f=c[h+(i*36&-1)+28>>2]|0;n=+g[h+(l*36&-1)>>2];o=+g[h+(f*36&-1)>>2];p=+g[h+(l*36&-1)+4>>2];q=+g[h+(f*36&-1)+4>>2];d=h+(i*36&-1)|0;j=(g[k>>2]=n<o?n:o,c[k>>2]|0);b=(g[k>>2]=p<q?p:q,c[k>>2]|0)|0;c[d>>2]=0|j;c[d+4>>2]=b;q=+g[h+(l*36&-1)+8>>2];p=+g[h+(f*36&-1)+8>>2];o=+g[h+(l*36&-1)+12>>2];n=+g[h+(f*36&-1)+12>>2];b=h+(i*36&-1)+8|0;h=(g[k>>2]=q>p?q:p,c[k>>2]|0);d=(g[k>>2]=o>n?o:n,c[k>>2]|0)|0;c[b>>2]=0|h;c[b+4>>2]=d;d=c[e>>2]|0;b=c[d+(l*36&-1)+32>>2]|0;l=c[d+(f*36&-1)+32>>2]|0;c[d+(i*36&-1)+32>>2]=((b|0)>(l|0)?b:l)+1|0;l=c[(c[e>>2]|0)+(i*36&-1)+20>>2]|0;if((l|0)==-1){break}else{m=l}}return}function bR(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0;do{if((b|0)>-1){if((c[a+12>>2]|0)>(b|0)){break}else{f=481;break}}else{f=481}}while(0);if((f|0)==481){aH(5251996,135,5258196,5250596)}f=a+4|0;h=c[f>>2]|0;if((c[h+(b*36&-1)+24>>2]|0)==-1){i=h}else{aH(5251996,137,5258196,5246864);i=c[f>>2]|0}do{if(+g[i+(b*36&-1)>>2]<=+g[d>>2]){if(+g[i+(b*36&-1)+4>>2]>+g[d+4>>2]){break}if(+g[d+8>>2]>+g[i+(b*36&-1)+8>>2]){break}if(+g[d+12>>2]>+g[i+(b*36&-1)+12>>2]){break}else{j=0}return j|0}}while(0);bQ(a,b);i=d;h=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=h,+g[k>>2]);h=d+8|0;d=c[h+4>>2]|0;n=(c[k>>2]=c[h>>2]|0,+g[k>>2]);o=l+-.10000000149011612;l=m+-.10000000149011612;m=n+.10000000149011612;n=(c[k>>2]=d,+g[k>>2])+.10000000149011612;p=+g[e>>2]*2.0;q=+g[e+4>>2]*2.0;if(p<0.0){r=m;s=o+p}else{r=p+m;s=o}if(q<0.0){t=n;u=l+q}else{t=q+n;u=l}e=c[f>>2]|0;f=e+(b*36&-1)|0;d=(g[k>>2]=s,c[k>>2]|0);h=(g[k>>2]=u,c[k>>2]|0)|0;c[f>>2]=0|d;c[f+4>>2]=h;h=e+(b*36&-1)+8|0;e=(g[k>>2]=r,c[k>>2]|0);f=(g[k>>2]=t,c[k>>2]|0)|0;c[h>>2]=0|e;c[h+4>>2]=f;bO(a,b);j=1;return j|0}function bS(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0,M=0,N=0,O=0;if((b|0)==-1){aH(5251996,382,5258304,5245868)}d=a+4|0;e=c[d>>2]|0;f=e+(b*36&-1)|0;h=e+(b*36&-1)+24|0;i=c[h>>2]|0;if((i|0)==-1){j=b;return j|0}l=e+(b*36&-1)+32|0;if((c[l>>2]|0)<2){j=b;return j|0}m=e+(b*36&-1)+28|0;n=c[m>>2]|0;do{if((i|0)>-1){if((i|0)<(c[a+12>>2]|0)){break}else{o=504;break}}else{o=504}}while(0);if((o|0)==504){aH(5251996,392,5258304,5245648)}do{if((n|0)>-1){if((n|0)<(c[a+12>>2]|0)){break}else{o=507;break}}else{o=507}}while(0);if((o|0)==507){aH(5251996,393,5258304,5253384)}p=c[d>>2]|0;q=p+(i*36&-1)|0;r=p+(n*36&-1)|0;s=p+(n*36&-1)+32|0;t=p+(i*36&-1)+32|0;u=(c[s>>2]|0)-(c[t>>2]|0)|0;if((u|0)>1){v=p+(n*36&-1)+24|0;w=c[v>>2]|0;x=p+(n*36&-1)+28|0;y=c[x>>2]|0;z=p+(w*36&-1)|0;A=p+(y*36&-1)|0;do{if((w|0)>-1){if((w|0)<(c[a+12>>2]|0)){break}else{o=511;break}}else{o=511}}while(0);if((o|0)==511){aH(5251996,407,5258304,5253188)}do{if((y|0)>-1){if((y|0)<(c[a+12>>2]|0)){break}else{o=514;break}}else{o=514}}while(0);if((o|0)==514){aH(5251996,408,5258304,5252820)}c[v>>2]=b;v=e+(b*36&-1)+20|0;B=p+(n*36&-1)+20|0;c[B>>2]=c[v>>2]|0;c[v>>2]=n;v=c[B>>2]|0;do{if((v|0)==-1){c[a>>2]=n}else{C=c[d>>2]|0;D=C+(v*36&-1)+24|0;if((c[D>>2]|0)==(b|0)){c[D>>2]=n;break}if((c[C+(v*36&-1)+28>>2]|0)==(b|0)){E=v;F=C}else{aH(5251996,424,5258304,5252136);E=c[B>>2]|0;F=c[d>>2]|0}c[F+(E*36&-1)+28>>2]=n}}while(0);E=p+(w*36&-1)+32|0;F=p+(y*36&-1)+32|0;if((c[E>>2]|0)>(c[F>>2]|0)){c[x>>2]=w;c[m>>2]=y;c[p+(y*36&-1)+20>>2]=b;G=+g[q>>2];H=+g[A>>2];I=G<H?G:H;H=+g[p+(i*36&-1)+4>>2];G=+g[p+(y*36&-1)+4>>2];B=f;v=(g[k>>2]=I,c[k>>2]|0);C=(g[k>>2]=H<G?H:G,c[k>>2]|0)|0;c[B>>2]=0|v;c[B+4>>2]=C;G=+g[p+(i*36&-1)+8>>2];H=+g[p+(y*36&-1)+8>>2];J=+g[p+(i*36&-1)+12>>2];K=+g[p+(y*36&-1)+12>>2];C=e+(b*36&-1)+8|0;B=(g[k>>2]=G>H?G:H,c[k>>2]|0);v=(g[k>>2]=J>K?J:K,c[k>>2]|0)|0;c[C>>2]=0|B;c[C+4>>2]=v;K=+g[z>>2];J=+g[e+(b*36&-1)+4>>2];H=+g[p+(w*36&-1)+4>>2];v=r;C=(g[k>>2]=I<K?I:K,c[k>>2]|0);B=(g[k>>2]=J<H?J:H,c[k>>2]|0)|0;c[v>>2]=0|C;c[v+4>>2]=B;H=+g[e+(b*36&-1)+8>>2];J=+g[p+(w*36&-1)+8>>2];K=+g[e+(b*36&-1)+12>>2];I=+g[p+(w*36&-1)+12>>2];B=p+(n*36&-1)+8|0;v=(g[k>>2]=H>J?H:J,c[k>>2]|0);C=(g[k>>2]=K>I?K:I,c[k>>2]|0)|0;c[B>>2]=0|v;c[B+4>>2]=C;C=c[t>>2]|0;B=c[F>>2]|0;v=((C|0)>(B|0)?C:B)+1|0;c[l>>2]=v;B=c[E>>2]|0;L=(v|0)>(B|0)?v:B}else{c[x>>2]=y;c[m>>2]=w;c[p+(w*36&-1)+20>>2]=b;I=+g[q>>2];K=+g[z>>2];J=I<K?I:K;K=+g[p+(i*36&-1)+4>>2];I=+g[p+(w*36&-1)+4>>2];z=f;m=(g[k>>2]=J,c[k>>2]|0);x=(g[k>>2]=K<I?K:I,c[k>>2]|0)|0;c[z>>2]=0|m;c[z+4>>2]=x;I=+g[p+(i*36&-1)+8>>2];K=+g[p+(w*36&-1)+8>>2];H=+g[p+(i*36&-1)+12>>2];G=+g[p+(w*36&-1)+12>>2];w=e+(b*36&-1)+8|0;x=(g[k>>2]=I>K?I:K,c[k>>2]|0);z=(g[k>>2]=H>G?H:G,c[k>>2]|0)|0;c[w>>2]=0|x;c[w+4>>2]=z;G=+g[A>>2];H=+g[e+(b*36&-1)+4>>2];K=+g[p+(y*36&-1)+4>>2];A=r;z=(g[k>>2]=J<G?J:G,c[k>>2]|0);w=(g[k>>2]=H<K?H:K,c[k>>2]|0)|0;c[A>>2]=0|z;c[A+4>>2]=w;K=+g[e+(b*36&-1)+8>>2];H=+g[p+(y*36&-1)+8>>2];G=+g[e+(b*36&-1)+12>>2];J=+g[p+(y*36&-1)+12>>2];y=p+(n*36&-1)+8|0;w=(g[k>>2]=K>H?K:H,c[k>>2]|0);A=(g[k>>2]=G>J?G:J,c[k>>2]|0)|0;c[y>>2]=0|w;c[y+4>>2]=A;A=c[t>>2]|0;y=c[E>>2]|0;E=((A|0)>(y|0)?A:y)+1|0;c[l>>2]=E;y=c[F>>2]|0;L=(E|0)>(y|0)?E:y}c[s>>2]=L+1|0;j=n;return j|0}if((u|0)>=-1){j=b;return j|0}u=p+(i*36&-1)+24|0;L=c[u>>2]|0;y=p+(i*36&-1)+28|0;E=c[y>>2]|0;F=p+(L*36&-1)|0;A=p+(E*36&-1)|0;do{if((L|0)>-1){if((L|0)<(c[a+12>>2]|0)){break}else{o=529;break}}else{o=529}}while(0);if((o|0)==529){aH(5251996,467,5258304,5251908)}do{if((E|0)>-1){if((E|0)<(c[a+12>>2]|0)){break}else{o=532;break}}else{o=532}}while(0);if((o|0)==532){aH(5251996,468,5258304,5251816)}c[u>>2]=b;u=e+(b*36&-1)+20|0;o=p+(i*36&-1)+20|0;c[o>>2]=c[u>>2]|0;c[u>>2]=i;u=c[o>>2]|0;do{if((u|0)==-1){c[a>>2]=i}else{w=c[d>>2]|0;z=w+(u*36&-1)+24|0;if((c[z>>2]|0)==(b|0)){c[z>>2]=i;break}if((c[w+(u*36&-1)+28>>2]|0)==(b|0)){M=u;N=w}else{aH(5251996,484,5258304,5251628);M=c[o>>2]|0;N=c[d>>2]|0}c[N+(M*36&-1)+28>>2]=i}}while(0);M=p+(L*36&-1)+32|0;N=p+(E*36&-1)+32|0;if((c[M>>2]|0)>(c[N>>2]|0)){c[y>>2]=L;c[h>>2]=E;c[p+(E*36&-1)+20>>2]=b;J=+g[r>>2];G=+g[A>>2];H=J<G?J:G;G=+g[p+(n*36&-1)+4>>2];J=+g[p+(E*36&-1)+4>>2];d=f;o=(g[k>>2]=H,c[k>>2]|0);u=(g[k>>2]=G<J?G:J,c[k>>2]|0)|0;c[d>>2]=0|o;c[d+4>>2]=u;J=+g[p+(n*36&-1)+8>>2];G=+g[p+(E*36&-1)+8>>2];K=+g[p+(n*36&-1)+12>>2];I=+g[p+(E*36&-1)+12>>2];u=e+(b*36&-1)+8|0;d=(g[k>>2]=J>G?J:G,c[k>>2]|0);o=(g[k>>2]=K>I?K:I,c[k>>2]|0)|0;c[u>>2]=0|d;c[u+4>>2]=o;I=+g[F>>2];K=+g[e+(b*36&-1)+4>>2];G=+g[p+(L*36&-1)+4>>2];o=q;u=(g[k>>2]=H<I?H:I,c[k>>2]|0);d=(g[k>>2]=K<G?K:G,c[k>>2]|0)|0;c[o>>2]=0|u;c[o+4>>2]=d;G=+g[e+(b*36&-1)+8>>2];K=+g[p+(L*36&-1)+8>>2];I=+g[e+(b*36&-1)+12>>2];H=+g[p+(L*36&-1)+12>>2];d=p+(i*36&-1)+8|0;o=(g[k>>2]=G>K?G:K,c[k>>2]|0);u=(g[k>>2]=I>H?I:H,c[k>>2]|0)|0;c[d>>2]=0|o;c[d+4>>2]=u;u=c[s>>2]|0;d=c[N>>2]|0;o=((u|0)>(d|0)?u:d)+1|0;c[l>>2]=o;d=c[M>>2]|0;O=(o|0)>(d|0)?o:d}else{c[y>>2]=E;c[h>>2]=L;c[p+(L*36&-1)+20>>2]=b;H=+g[r>>2];I=+g[F>>2];K=H<I?H:I;I=+g[p+(n*36&-1)+4>>2];H=+g[p+(L*36&-1)+4>>2];F=f;f=(g[k>>2]=K,c[k>>2]|0);r=(g[k>>2]=I<H?I:H,c[k>>2]|0)|0;c[F>>2]=0|f;c[F+4>>2]=r;H=+g[p+(n*36&-1)+8>>2];I=+g[p+(L*36&-1)+8>>2];G=+g[p+(n*36&-1)+12>>2];J=+g[p+(L*36&-1)+12>>2];L=e+(b*36&-1)+8|0;n=(g[k>>2]=H>I?H:I,c[k>>2]|0);r=(g[k>>2]=G>J?G:J,c[k>>2]|0)|0;c[L>>2]=0|n;c[L+4>>2]=r;J=+g[A>>2];G=+g[e+(b*36&-1)+4>>2];I=+g[p+(E*36&-1)+4>>2];A=q;q=(g[k>>2]=K<J?K:J,c[k>>2]|0);r=(g[k>>2]=G<I?G:I,c[k>>2]|0)|0;c[A>>2]=0|q;c[A+4>>2]=r;I=+g[e+(b*36&-1)+8>>2];G=+g[p+(E*36&-1)+8>>2];J=+g[e+(b*36&-1)+12>>2];K=+g[p+(E*36&-1)+12>>2];E=p+(i*36&-1)+8|0;p=(g[k>>2]=I>G?I:G,c[k>>2]|0);b=(g[k>>2]=J>K?J:K,c[k>>2]|0)|0;c[E>>2]=0|p;c[E+4>>2]=b;b=c[s>>2]|0;s=c[M>>2]|0;M=((b|0)>(s|0)?b:s)+1|0;c[l>>2]=M;l=c[N>>2]|0;O=(M|0)>(l|0)?M:l}c[t>>2]=O+1|0;j=i;return j|0}function bT(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;do{if((b|0)>-1){if((c[a+12>>2]|0)>(b|0)){break}else{d=552;break}}else{d=552}}while(0);if((d|0)==552){aH(5251996,563,5254816,5250468)}d=c[a+4>>2]|0;e=c[d+(b*36&-1)+24>>2]|0;if((e|0)==-1){return 0}else{f=bT(a,e)|0;e=bT(a,c[d+(b*36&-1)+28>>2]|0)|0;return((f|0)>(e|0)?f:e)+1|0}return 0}function bU(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;if((b|0)==-1){return}d=a|0;e=a+4|0;f=a+12|0;g=b;while(1){do{if((c[d>>2]|0)==(g|0)){if((c[(c[e>>2]|0)+(g*36&-1)+20>>2]|0)==-1){break}aH(5251996,591,5254668,5251328)}}while(0);h=c[e>>2]|0;b=c[h+(g*36&-1)+24>>2]|0;i=c[h+(g*36&-1)+28>>2]|0;if((b|0)==-1){break}do{if((b|0)>-1){if((b|0)<(c[f>>2]|0)){break}else{j=568;break}}else{j=568}}while(0);if((j|0)==568){j=0;aH(5251996,607,5254668,5250708)}do{if((i|0)>-1){if((i|0)<(c[f>>2]|0)){break}else{j=571;break}}else{j=571}}while(0);if((j|0)==571){j=0;aH(5251996,608,5254668,5250304)}k=c[e>>2]|0;if((c[k+(b*36&-1)+20>>2]|0)==(g|0)){l=k}else{aH(5251996,610,5254668,5250060);l=c[e>>2]|0}if((c[l+(i*36&-1)+20>>2]|0)!=(g|0)){aH(5251996,611,5254668,5249692)}bU(a,b);if((i|0)==-1){j=580;break}else{g=i}}if((j|0)==580){return}if((i|0)!=-1){aH(5251996,602,5254668,5251104)}if((c[h+(g*36&-1)+32>>2]|0)==0){return}aH(5251996,603,5254668,5250912);return}function bV(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0;if((b|0)==-1){return}d=a+4|0;e=a+12|0;f=b;while(1){h=c[d>>2]|0;b=c[h+(f*36&-1)+24>>2]|0;i=c[h+(f*36&-1)+28>>2]|0;if((b|0)==-1){break}do{if((b|0)>-1){if((b|0)<(c[e>>2]|0)){break}else{j=591;break}}else{j=591}}while(0);if((j|0)==591){j=0;aH(5251996,637,5254720,5250708)}do{if((i|0)>-1){if((i|0)<(c[e>>2]|0)){break}else{j=594;break}}else{j=594}}while(0);if((j|0)==594){j=0;aH(5251996,638,5254720,5250304)}k=c[d>>2]|0;l=c[k+(b*36&-1)+32>>2]|0;m=c[k+(i*36&-1)+32>>2]|0;if((c[h+(f*36&-1)+32>>2]|0)==(((l|0)>(m|0)?l:m)+1|0)){n=k}else{aH(5251996,644,5254720,5249548);n=c[d>>2]|0}o=+g[n+(b*36&-1)>>2];p=+g[n+(i*36&-1)>>2];q=+g[n+(b*36&-1)+4>>2];r=+g[n+(i*36&-1)+4>>2];s=+g[n+(b*36&-1)+8>>2];t=+g[n+(i*36&-1)+8>>2];u=s>t?s:t;t=+g[n+(b*36&-1)+12>>2];s=+g[n+(i*36&-1)+12>>2];v=t>s?t:s;do{if((o<p?o:p)==+g[h+(f*36&-1)>>2]){if((q<r?q:r)==+g[h+(f*36&-1)+4>>2]){break}else{j=599;break}}else{j=599}}while(0);if((j|0)==599){j=0;aH(5251996,649,5254720,5249216)}do{if(u==+g[h+(f*36&-1)+8>>2]){if(v==+g[h+(f*36&-1)+12>>2]){break}else{j=602;break}}else{j=602}}while(0);if((j|0)==602){j=0;aH(5251996,650,5254720,5249e3)}bV(a,b);if((i|0)==-1){j=605;break}else{f=i}}if((j|0)==605){return}if((i|0)!=-1){aH(5251996,632,5254720,5251104)}if((c[h+(f*36&-1)+32>>2]|0)==0){return}aH(5251996,633,5254720,5250912);return}function bW(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;b=a|0;bU(a,c[b>>2]|0);bV(a,c[b>>2]|0);d=c[a+16>>2]|0;L847:do{if((d|0)==-1){e=0}else{f=a+12|0;g=a+4|0;h=0;i=d;while(1){do{if((i|0)>-1){if((i|0)<(c[f>>2]|0)){break}else{j=613;break}}else{j=613}}while(0);if((j|0)==613){j=0;aH(5251996,665,5254536,5248572)}k=h+1|0;l=c[(c[g>>2]|0)+(i*36&-1)+20>>2]|0;if((l|0)==-1){e=k;break L847}else{h=k;i=l}}}}while(0);j=c[b>>2]|0;if((j|0)==-1){m=0}else{m=c[(c[a+4>>2]|0)+(j*36&-1)+32>>2]|0}if((m|0)!=(bT(a,j)|0)){aH(5251996,670,5254536,5248540)}if(((c[a+8>>2]|0)+e|0)==(c[a+12>>2]|0)){return}aH(5251996,672,5254536,5248412);return}function bX(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0,w=0,x=0.0,y=0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0,F=0,G=0,H=0,I=0.0;b=a+8|0;d=pi(c[b>>2]<<2)|0;e=d;f=a+12|0;if((c[f>>2]|0)<=0){h=c[e>>2]|0;i=a|0;c[i>>2]=h;pj(d);bW(a);return}j=a+4|0;l=a+16|0;m=0;n=0;while(1){o=c[j>>2]|0;do{if((c[o+(m*36&-1)+32>>2]|0)<0){p=n}else{if((c[o+(m*36&-1)+24>>2]|0)==-1){c[o+(m*36&-1)+20>>2]=-1;c[e+(n<<2)>>2]=m;p=n+1|0;break}if((c[b>>2]|0)<=0){aH(5251996,98,5258268,5248188)}c[(c[j>>2]|0)+(m*36&-1)+20>>2]=c[l>>2]|0;c[(c[j>>2]|0)+(m*36&-1)+32>>2]=-1;c[l>>2]=m;c[b>>2]=(c[b>>2]|0)-1|0;p=n}}while(0);o=m+1|0;if((o|0)<(c[f>>2]|0)){m=o;n=p}else{break}}if((p|0)<=1){h=c[e>>2]|0;i=a|0;c[i>>2]=h;pj(d);bW(a);return}n=a+4|0;m=p;while(1){p=c[n>>2]|0;f=0;b=-1;l=-1;q=3.4028234663852886e+38;while(1){j=c[e+(f<<2)>>2]|0;r=+g[p+(j*36&-1)>>2];s=+g[p+(j*36&-1)+4>>2];t=+g[p+(j*36&-1)+8>>2];u=+g[p+(j*36&-1)+12>>2];j=f+1|0;L890:do{if((j|0)<(m|0)){o=j;v=b;w=l;x=q;while(1){y=c[e+(o<<2)>>2]|0;z=+g[p+(y*36&-1)>>2];A=+g[p+(y*36&-1)+4>>2];B=+g[p+(y*36&-1)+8>>2];C=+g[p+(y*36&-1)+12>>2];D=((t>B?t:B)-(r<z?r:z)+((u>C?u:C)-(s<A?s:A)))*2.0;y=D<x;E=y?o:v;F=y?f:w;A=y?D:x;y=o+1|0;if((y|0)==(m|0)){G=E;H=F;I=A;break L890}else{o=y;v=E;w=F;x=A}}}else{G=b;H=l;I=q}}while(0);if((j|0)==(m|0)){break}else{f=j;b=G;l=H;q=I}}l=e+(H<<2)|0;b=c[l>>2]|0;f=e+(G<<2)|0;w=c[f>>2]|0;v=bN(a)|0;o=c[n>>2]|0;c[o+(v*36&-1)+24>>2]=b;c[o+(v*36&-1)+28>>2]=w;F=c[p+(b*36&-1)+32>>2]|0;E=c[p+(w*36&-1)+32>>2]|0;c[o+(v*36&-1)+32>>2]=((F|0)>(E|0)?F:E)+1|0;q=+g[p+(b*36&-1)>>2];s=+g[p+(w*36&-1)>>2];u=+g[p+(b*36&-1)+4>>2];r=+g[p+(w*36&-1)+4>>2];E=o+(v*36&-1)|0;F=(g[k>>2]=q<s?q:s,c[k>>2]|0);y=(g[k>>2]=u<r?u:r,c[k>>2]|0)|0;c[E>>2]=0|F;c[E+4>>2]=y;r=+g[p+(b*36&-1)+8>>2];u=+g[p+(w*36&-1)+8>>2];s=+g[p+(b*36&-1)+12>>2];q=+g[p+(w*36&-1)+12>>2];y=o+(v*36&-1)+8|0;E=(g[k>>2]=r>u?r:u,c[k>>2]|0);F=(g[k>>2]=s>q?s:q,c[k>>2]|0)|0;c[y>>2]=0|E;c[y+4>>2]=F;c[o+(v*36&-1)+20>>2]=-1;c[p+(b*36&-1)+20>>2]=v;c[p+(w*36&-1)+20>>2]=v;w=m-1|0;c[f>>2]=c[e+(w<<2)>>2]|0;c[l>>2]=v;if((w|0)>1){m=w}else{break}}h=c[e>>2]|0;i=a|0;c[i>>2]=h;pj(d);bW(a);return}function bY(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0.0,x=0.0,y=0.0,z=0,A=0,B=0.0,C=0.0,D=0,E=0.0,F=0.0,G=0,H=0,I=0,J=0,K=0,L=0,N=0,O=0,P=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0.0,$=0.0,aa=0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0,ao=0,ap=0,aq=0.0,ar=0,as=0.0,at=0.0,au=0,av=0.0,aw=0.0,ax=0.0,ay=0.0,az=0,aA=0.0,aB=0,aC=0,aD=0,aE=0,aF=0,aG=0;f=i;i=i+308|0;h=f|0;j=f+36|0;l=f+72|0;m=f+84|0;n=f+176|0;o=f+200|0;p=f+300|0;q=f+304|0;c[1311351]=(c[1311351]|0)+1|0;r=d|0;c[r>>2]=0;s=e+128|0;t=d+4|0;g[t>>2]=+g[s>>2];d=e|0;u=e+28|0;pq(h,e+56|0,36);pq(j,e+92|0,36);v=h+24|0;w=+g[v>>2];x=+M(+(w/6.2831854820251465))*6.2831854820251465;y=w-x;g[v>>2]=y;z=h+28|0;w=+g[z>>2]-x;g[z>>2]=w;A=j+24|0;x=+g[A>>2];B=+M(+(x/6.2831854820251465))*6.2831854820251465;C=x-B;g[A>>2]=C;D=j+28|0;x=+g[D>>2]-B;g[D>>2]=x;B=+g[s>>2];E=+g[e+24>>2]+ +g[e+52>>2]+-.014999999664723873;F=E<.004999999888241291?.004999999888241291:E;if(F<=.0012499999720603228){aH(5247724,280,5259188,5252044)}b[l+4>>1]=0;s=m;G=e;c[s>>2]=c[G>>2]|0;c[s+4>>2]=c[G+4>>2]|0;c[s+8>>2]=c[G+8>>2]|0;c[s+12>>2]=c[G+12>>2]|0;c[s+16>>2]=c[G+16>>2]|0;c[s+20>>2]=c[G+20>>2]|0;c[s+24>>2]=c[G+24>>2]|0;G=m+28|0;s=u;c[G>>2]=c[s>>2]|0;c[G+4>>2]=c[s+4>>2]|0;c[G+8>>2]=c[s+8>>2]|0;c[G+12>>2]=c[s+12>>2]|0;c[G+16>>2]=c[s+16>>2]|0;c[G+20>>2]=c[s+20>>2]|0;c[G+24>>2]=c[s+24>>2]|0;a[m+88|0]=0;s=h+8|0;G=h+12|0;e=h+16|0;H=h+20|0;I=h|0;J=h+4|0;K=j+8|0;L=j+12|0;N=j+16|0;O=j+20|0;P=j|0;S=j+4|0;T=m+56|0;U=m+64|0;V=m+68|0;W=m+72|0;X=m+80|0;Y=m+84|0;Z=n+16|0;E=F+.0012499999720603228;_=F+-.0012499999720603228;$=0.0;aa=0;ab=y;y=w;w=C;C=x;L900:while(1){x=1.0-$;ac=x*+g[s>>2]+$*+g[e>>2];ad=x*+g[G>>2]+$*+g[H>>2];ae=x*ab+$*y;af=+R(+ae);ag=+Q(+ae);ae=+g[I>>2];ah=+g[J>>2];ai=x*+g[K>>2]+$*+g[N>>2];aj=x*+g[L>>2]+$*+g[O>>2];ak=x*w+$*C;x=+R(+ak);al=+Q(+ak);ak=+g[P>>2];am=+g[S>>2];an=(g[k>>2]=ac-(ag*ae-af*ah),c[k>>2]|0);ao=(g[k>>2]=ad-(af*ae+ag*ah),c[k>>2]|0)|0;c[T>>2]=0|an;c[T+4>>2]=ao;g[U>>2]=af;g[V>>2]=ag;ao=(g[k>>2]=ai-(al*ak-x*am),c[k>>2]|0);an=(g[k>>2]=aj-(x*ak+al*am),c[k>>2]|0)|0;c[W>>2]=0|ao;c[W+4>>2]=an;g[X>>2]=x;g[Y>>2]=al;bK(n,l,m);al=+g[Z>>2];if(al<=0.0){ap=648;break}if(al<E){ap=650;break}bZ(o,l,d,h,u,j,$);an=0;al=B;while(1){x=+b$(o,p,q,al);if(x>E){ap=653;break L900}if(x>_){aq=al;break}ao=c[p>>2]|0;ar=c[q>>2]|0;am=+b0(o,ao,ar,$);if(am<_){ap=656;break L900}if(am>E){as=al;at=$;au=0;av=am;aw=x}else{ap=658;break L900}while(1){if((au&1|0)==0){ax=(at+as)*.5}else{ax=at+(F-av)*(as-at)/(aw-av)}x=+b0(o,ao,ar,ax);am=x-F;if(am>0.0){ay=am}else{ay=-0.0-am}if(ay<.0012499999720603228){az=au;aA=ax;break}aB=x>F;aC=au+1|0;c[1311347]=(c[1311347]|0)+1|0;if((aC|0)==50){az=50;aA=al;break}else{as=aB?as:ax;at=aB?ax:at;au=aC;av=aB?x:av;aw=aB?aw:x}}ar=c[1311348]|0;c[1311348]=(ar|0)>(az|0)?ar:az;ar=an+1|0;if((ar|0)==8){aq=$;break}else{an=ar;al=aA}}an=aa+1|0;c[1311350]=(c[1311350]|0)+1|0;if((an|0)==20){ap=670;break}$=aq;aa=an;ab=+g[v>>2];y=+g[z>>2];w=+g[A>>2];C=+g[D>>2]}if((ap|0)==670){c[r>>2]=1;g[t>>2]=aq;aD=20;aE=c[1311349]|0;aF=(aE|0)>(aD|0);aG=aF?aE:aD;c[1311349]=aG;i=f;return}else if((ap|0)==650){c[r>>2]=3;g[t>>2]=$;aD=aa;aE=c[1311349]|0;aF=(aE|0)>(aD|0);aG=aF?aE:aD;c[1311349]=aG;i=f;return}else if((ap|0)==656){c[r>>2]=1;g[t>>2]=$}else if((ap|0)==658){c[r>>2]=3;g[t>>2]=$}else if((ap|0)==648){c[r>>2]=2;g[t>>2]=0.0;aD=aa;aE=c[1311349]|0;aF=(aE|0)>(aD|0);aG=aF?aE:aD;c[1311349]=aG;i=f;return}else if((ap|0)==653){c[r>>2]=4;g[t>>2]=B}c[1311350]=(c[1311350]|0)+1|0;aD=aa+1|0;aE=c[1311349]|0;aF=(aE|0)>(aD|0);aG=aF?aE:aD;c[1311349]=aG;i=f;return}function bZ(e,f,h,i,j,l,m){e=e|0;f=f|0;h=h|0;i=i|0;j=j|0;l=l|0;m=+m;var n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0.0,M=0.0,N=0,P=0,S=0.0,T=0.0;n=e|0;c[n>>2]=h;o=e+4|0;c[o>>2]=j;p=b[f+4>>1]|0;if(!(p<<16>>16!=0&(p&65535)<3)){aH(5247724,50,5257224,5246736)}q=e+8|0;pq(q,i,36);i=e+44|0;pq(i,l,36);r=1.0-m;s=r*+g[e+16>>2]+ +g[e+24>>2]*m;t=r*+g[e+20>>2]+ +g[e+28>>2]*m;u=r*+g[e+32>>2]+ +g[e+36>>2]*m;v=+R(+u);w=+Q(+u);u=+g[q>>2];x=+g[e+12>>2];y=s-(w*u-v*x);s=t-(v*u+w*x);x=r*+g[e+52>>2]+ +g[e+60>>2]*m;u=r*+g[e+56>>2]+ +g[e+64>>2]*m;t=r*+g[e+68>>2]+ +g[e+72>>2]*m;m=+R(+t);r=+Q(+t);t=+g[i>>2];z=+g[e+48>>2];A=x-(r*t-m*z);x=u-(m*t+r*z);if(p<<16>>16==1){c[e+80>>2]=0;p=c[n>>2]|0;i=d[f+6|0]|0;if((c[p+20>>2]|0)<=(i|0)){aH(5248456,103,5254292,5247472)}q=(c[p+16>>2]|0)+(i<<3)|0;i=c[q+4>>2]|0;z=(c[k>>2]=c[q>>2]|0,+g[k>>2]);t=(c[k>>2]=i,+g[k>>2]);i=c[o>>2]|0;q=d[f+9|0]|0;if((c[i+20>>2]|0)<=(q|0)){aH(5248456,103,5254292,5247472)}p=(c[i+16>>2]|0)+(q<<3)|0;q=c[p+4>>2]|0;u=(c[k>>2]=c[p>>2]|0,+g[k>>2]);B=(c[k>>2]=q,+g[k>>2]);q=e+92|0;C=A+(r*u-m*B)-(y+(w*z-v*t));D=x+(m*u+r*B)-(s+(v*z+w*t));p=q;i=(g[k>>2]=C,c[k>>2]|0);l=(g[k>>2]=D,c[k>>2]|0)|0;c[p>>2]=0|i;c[p+4>>2]=l;t=+O(+(C*C+D*D));if(t<1.1920928955078125e-7){E=0.0;return+E}z=1.0/t;g[q>>2]=C*z;g[e+96>>2]=D*z;E=t;return+E}q=f+6|0;l=f+7|0;p=e+80|0;if(a[q]<<24>>24==a[l]<<24>>24){c[p>>2]=2;i=d[f+9|0]|0;F=j+20|0;G=c[F>>2]|0;if((G|0)>(i|0)){H=G}else{aH(5248456,103,5254292,5247472);H=c[F>>2]|0}F=j+16|0;j=c[F>>2]|0;G=j+(i<<3)|0;i=c[G+4>>2]|0;t=(c[k>>2]=c[G>>2]|0,+g[k>>2]);z=(c[k>>2]=i,+g[k>>2]);i=d[f+10|0]|0;if((H|0)>(i|0)){I=j}else{aH(5248456,103,5254292,5247472);I=c[F>>2]|0}F=I+(i<<3)|0;i=c[F+4>>2]|0;D=(c[k>>2]=c[F>>2]|0,+g[k>>2]);C=(c[k>>2]=i,+g[k>>2]);i=e+92|0;B=C-z;u=(D-t)*-1.0;F=i;I=(g[k>>2]=B,c[k>>2]|0);j=(g[k>>2]=u,c[k>>2]|0)|0;c[F>>2]=0|I;c[F+4>>2]=j;j=i|0;i=e+96|0;J=+O(+(B*B+u*u));if(J<1.1920928955078125e-7){K=B;L=u}else{M=1.0/J;J=B*M;g[j>>2]=J;B=u*M;g[i>>2]=B;K=J;L=B}B=(t+D)*.5;D=(z+C)*.5;I=e+84|0;H=(g[k>>2]=B,c[k>>2]|0);G=(g[k>>2]=D,c[k>>2]|0)|0;c[I>>2]=0|H;c[I+4>>2]=G;G=d[q]|0;if((c[h+20>>2]|0)<=(G|0)){aH(5248456,103,5254292,5247472)}I=(c[h+16>>2]|0)+(G<<3)|0;G=c[I+4>>2]|0;C=(c[k>>2]=c[I>>2]|0,+g[k>>2]);z=(c[k>>2]=G,+g[k>>2]);t=(r*K-m*L)*(y+(w*C-v*z)-(A+(r*B-m*D)))+(m*K+r*L)*(s+(v*C+w*z)-(x+(m*B+r*D)));if(t>=0.0){E=t;return+E}D=-0.0- +g[i>>2];i=(g[k>>2]=-0.0- +g[j>>2],c[k>>2]|0);j=(g[k>>2]=D,c[k>>2]|0)|0;c[F>>2]=0|i;c[F+4>>2]=j;E=-0.0-t;return+E}else{c[p>>2]=1;p=c[n>>2]|0;j=d[q]|0;q=c[p+20>>2]|0;if((q|0)>(j|0)){N=p;P=q}else{aH(5248456,103,5254292,5247472);q=c[n>>2]|0;N=q;P=c[q+20>>2]|0}q=(c[p+16>>2]|0)+(j<<3)|0;j=c[q+4>>2]|0;t=(c[k>>2]=c[q>>2]|0,+g[k>>2]);D=(c[k>>2]=j,+g[k>>2]);j=d[l]|0;if((P|0)<=(j|0)){aH(5248456,103,5254292,5247472)}P=(c[N+16>>2]|0)+(j<<3)|0;j=c[P+4>>2]|0;B=(c[k>>2]=c[P>>2]|0,+g[k>>2]);z=(c[k>>2]=j,+g[k>>2]);j=e+92|0;C=z-D;L=(B-t)*-1.0;P=j;N=(g[k>>2]=C,c[k>>2]|0);l=(g[k>>2]=L,c[k>>2]|0)|0;c[P>>2]=0|N;c[P+4>>2]=l;l=j|0;j=e+96|0;K=+O(+(C*C+L*L));if(K<1.1920928955078125e-7){S=C;T=L}else{J=1.0/K;K=C*J;g[l>>2]=K;C=L*J;g[j>>2]=C;S=K;T=C}C=(t+B)*.5;B=(D+z)*.5;N=e+84|0;e=(g[k>>2]=C,c[k>>2]|0);q=(g[k>>2]=B,c[k>>2]|0)|0;c[N>>2]=0|e;c[N+4>>2]=q;q=c[o>>2]|0;o=d[f+9|0]|0;if((c[q+20>>2]|0)<=(o|0)){aH(5248456,103,5254292,5247472)}f=(c[q+16>>2]|0)+(o<<3)|0;o=c[f+4>>2]|0;z=(c[k>>2]=c[f>>2]|0,+g[k>>2]);D=(c[k>>2]=o,+g[k>>2]);t=(w*S-v*T)*(A+(r*z-m*D)-(y+(w*C-v*B)))+(v*S+w*T)*(x+(m*z+r*D)-(s+(v*C+w*B)));if(t>=0.0){E=t;return+E}B=-0.0- +g[j>>2];j=(g[k>>2]=-0.0- +g[l>>2],c[k>>2]|0);l=(g[k>>2]=B,c[k>>2]|0)|0;c[P>>2]=0|j;c[P+4>>2]=l;E=-0.0-t;return+E}return 0.0}function b_(a){a=a|0;return(c[a+16>>2]|0)-1|0}function b$(a,b,d,e){a=a|0;b=b|0;d=d|0;e=+e;var f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0.0,M=0,N=0,O=0,P=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0;f=1.0-e;h=f*+g[a+16>>2]+ +g[a+24>>2]*e;i=f*+g[a+20>>2]+ +g[a+28>>2]*e;j=f*+g[a+32>>2]+ +g[a+36>>2]*e;l=+R(+j);m=+Q(+j);j=+g[a+8>>2];n=+g[a+12>>2];o=h-(m*j-l*n);h=i-(l*j+m*n);n=f*+g[a+52>>2]+ +g[a+60>>2]*e;j=f*+g[a+56>>2]+ +g[a+64>>2]*e;i=f*+g[a+68>>2]+ +g[a+72>>2]*e;e=+R(+i);f=+Q(+i);i=+g[a+44>>2];p=+g[a+48>>2];q=n-(f*i-e*p);n=j-(e*i+f*p);r=c[a+80>>2]|0;if((r|0)==0){s=a+92|0;p=+g[s>>2];t=a+96|0;i=+g[t>>2];j=m*p+l*i;u=p*(-0.0-l)+m*i;v=-0.0-i;i=f*(-0.0-p)+e*v;w=e*p+f*v;x=a|0;y=c[x>>2]|0;z=c[y+16>>2]|0;A=c[y+20>>2]|0;L990:do{if((A|0)>1){v=u*+g[z+4>>2]+j*+g[z>>2];y=1;B=0;while(1){p=j*+g[z+(y<<3)>>2]+u*+g[z+(y<<3)+4>>2];C=p>v;D=C?y:B;E=y+1|0;if((E|0)==(A|0)){F=D;break L990}else{v=C?p:v;y=E;B=D}}}else{F=0}}while(0);c[b>>2]=F;F=a+4|0;A=c[F>>2]|0;z=c[A+16>>2]|0;B=c[A+20>>2]|0;L995:do{if((B|0)>1){u=w*+g[z+4>>2]+i*+g[z>>2];A=1;y=0;while(1){j=i*+g[z+(A<<3)>>2]+w*+g[z+(A<<3)+4>>2];D=j>u;E=D?A:y;C=A+1|0;if((C|0)==(B|0)){G=E;break L995}else{u=D?j:u;A=C;y=E}}}else{G=0}}while(0);c[d>>2]=G;B=c[x>>2]|0;x=c[b>>2]|0;do{if((x|0)>-1){if((c[B+20>>2]|0)>(x|0)){H=G;break}else{I=723;break}}else{I=723}}while(0);if((I|0)==723){aH(5248456,103,5254292,5247472);H=c[d>>2]|0}G=(c[B+16>>2]|0)+(x<<3)|0;x=c[G+4>>2]|0;w=(c[k>>2]=c[G>>2]|0,+g[k>>2]);i=(c[k>>2]=x,+g[k>>2]);x=c[F>>2]|0;do{if((H|0)>-1){if((c[x+20>>2]|0)>(H|0)){break}else{I=726;break}}else{I=726}}while(0);if((I|0)==726){aH(5248456,103,5254292,5247472)}F=(c[x+16>>2]|0)+(H<<3)|0;H=c[F+4>>2]|0;u=(c[k>>2]=c[F>>2]|0,+g[k>>2]);j=(c[k>>2]=H,+g[k>>2]);v=+g[s>>2]*(q+(f*u-e*j)-(o+(m*w-l*i)))+ +g[t>>2]*(n+(e*u+f*j)-(h+(l*w+m*i)));return+v}else if((r|0)==2){i=+g[a+92>>2];w=+g[a+96>>2];j=f*i-e*w;u=e*i+f*w;w=+g[a+84>>2];i=+g[a+88>>2];p=q+(f*w-e*i);J=n+(e*w+f*i);i=-0.0-u;w=m*(-0.0-j)+l*i;K=l*j+m*i;c[d>>2]=-1;t=a|0;s=c[t>>2]|0;H=c[s+16>>2]|0;F=c[s+20>>2]|0;do{if((F|0)>1){i=K*+g[H+4>>2]+w*+g[H>>2];s=1;x=0;while(1){L=w*+g[H+(s<<3)>>2]+K*+g[H+(s<<3)+4>>2];G=L>i;M=G?s:x;B=s+1|0;if((B|0)==(F|0)){break}else{i=G?L:i;s=B;x=M}}c[b>>2]=M;x=c[t>>2]|0;if((M|0)>-1){N=M;O=x;I=741;break}else{P=M;S=x;I=742;break}}else{c[b>>2]=0;N=0;O=c[t>>2]|0;I=741;break}}while(0);do{if((I|0)==741){if((c[O+20>>2]|0)>(N|0)){T=N;U=O;break}else{P=N;S=O;I=742;break}}}while(0);if((I|0)==742){aH(5248456,103,5254292,5247472);T=P;U=S}S=(c[U+16>>2]|0)+(T<<3)|0;T=c[S+4>>2]|0;K=(c[k>>2]=c[S>>2]|0,+g[k>>2]);w=(c[k>>2]=T,+g[k>>2]);v=j*(o+(m*K-l*w)-p)+u*(h+(l*K+m*w)-J);return+v}else if((r|0)==1){J=+g[a+92>>2];w=+g[a+96>>2];K=m*J-l*w;u=l*J+m*w;w=+g[a+84>>2];J=+g[a+88>>2];p=o+(m*w-l*J);o=h+(l*w+m*J);J=-0.0-u;m=f*(-0.0-K)+e*J;w=e*K+f*J;c[b>>2]=-1;r=a+4|0;a=c[r>>2]|0;T=c[a+16>>2]|0;S=c[a+20>>2]|0;do{if((S|0)>1){J=w*+g[T+4>>2]+m*+g[T>>2];a=1;U=0;while(1){l=m*+g[T+(a<<3)>>2]+w*+g[T+(a<<3)+4>>2];P=l>J;V=P?a:U;O=a+1|0;if((O|0)==(S|0)){break}else{J=P?l:J;a=O;U=V}}c[d>>2]=V;U=c[r>>2]|0;if((V|0)>-1){W=V;X=U;I=733;break}else{Y=V;Z=U;I=734;break}}else{c[d>>2]=0;W=0;X=c[r>>2]|0;I=733;break}}while(0);do{if((I|0)==733){if((c[X+20>>2]|0)>(W|0)){_=W;$=X;break}else{Y=W;Z=X;I=734;break}}}while(0);if((I|0)==734){aH(5248456,103,5254292,5247472);_=Y;$=Z}Z=(c[$+16>>2]|0)+(_<<3)|0;_=c[Z+4>>2]|0;w=(c[k>>2]=c[Z>>2]|0,+g[k>>2]);m=(c[k>>2]=_,+g[k>>2]);v=K*(q+(f*w-e*m)-p)+u*(n+(e*w+f*m)-o);return+v}else{aH(5247724,183,5254208,5252172);c[b>>2]=-1;c[d>>2]=-1;v=0.0;return+v}return 0.0}function b0(a,b,d,e){a=a|0;b=b|0;d=d|0;e=+e;var f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0,u=0,v=0,w=0,x=0.0,y=0.0,z=0.0,A=0.0;f=1.0-e;h=f*+g[a+16>>2]+ +g[a+24>>2]*e;i=f*+g[a+20>>2]+ +g[a+28>>2]*e;j=f*+g[a+32>>2]+ +g[a+36>>2]*e;l=+R(+j);m=+Q(+j);j=+g[a+8>>2];n=+g[a+12>>2];o=h-(m*j-l*n);h=i-(l*j+m*n);n=f*+g[a+52>>2]+ +g[a+60>>2]*e;j=f*+g[a+56>>2]+ +g[a+64>>2]*e;i=f*+g[a+68>>2]+ +g[a+72>>2]*e;e=+R(+i);f=+Q(+i);i=+g[a+44>>2];p=+g[a+48>>2];q=n-(f*i-e*p);n=j-(e*i+f*p);r=c[a+80>>2]|0;if((r|0)==0){s=a+92|0;t=a+96|0;u=c[a>>2]|0;do{if((b|0)>-1){if((c[u+20>>2]|0)>(b|0)){break}else{v=753;break}}else{v=753}}while(0);if((v|0)==753){aH(5248456,103,5254292,5247472)}w=(c[u+16>>2]|0)+(b<<3)|0;u=c[w+4>>2]|0;p=(c[k>>2]=c[w>>2]|0,+g[k>>2]);i=(c[k>>2]=u,+g[k>>2]);u=c[a+4>>2]|0;do{if((d|0)>-1){if((c[u+20>>2]|0)>(d|0)){break}else{v=756;break}}else{v=756}}while(0);if((v|0)==756){aH(5248456,103,5254292,5247472)}w=(c[u+16>>2]|0)+(d<<3)|0;u=c[w+4>>2]|0;j=(c[k>>2]=c[w>>2]|0,+g[k>>2]);x=(c[k>>2]=u,+g[k>>2]);y=+g[s>>2]*(q+(f*j-e*x)-(o+(m*p-l*i)))+ +g[t>>2]*(n+(e*j+f*x)-(h+(l*p+m*i)));return+y}else if((r|0)==1){i=+g[a+92>>2];p=+g[a+96>>2];x=m*i-l*p;j=l*i+m*p;p=+g[a+84>>2];i=+g[a+88>>2];z=o+(m*p-l*i);A=h+(l*p+m*i);t=c[a+4>>2]|0;do{if((d|0)>-1){if((c[t+20>>2]|0)>(d|0)){break}else{v=760;break}}else{v=760}}while(0);if((v|0)==760){aH(5248456,103,5254292,5247472)}s=(c[t+16>>2]|0)+(d<<3)|0;d=c[s+4>>2]|0;i=(c[k>>2]=c[s>>2]|0,+g[k>>2]);p=(c[k>>2]=d,+g[k>>2]);y=x*(q+(f*i-e*p)-z)+j*(n+(e*i+f*p)-A);return+y}else if((r|0)==2){A=+g[a+92>>2];p=+g[a+96>>2];i=f*A-e*p;j=e*A+f*p;p=+g[a+84>>2];A=+g[a+88>>2];z=q+(f*p-e*A);q=n+(e*p+f*A);r=c[a>>2]|0;do{if((b|0)>-1){if((c[r+20>>2]|0)>(b|0)){break}else{v=764;break}}else{v=764}}while(0);if((v|0)==764){aH(5248456,103,5254292,5247472)}v=(c[r+16>>2]|0)+(b<<3)|0;b=c[v+4>>2]|0;A=(c[k>>2]=c[v>>2]|0,+g[k>>2]);f=(c[k>>2]=b,+g[k>>2]);y=i*(o+(m*A-l*f)-z)+j*(h+(l*A+m*f)-q);return+y}else{aH(5247724,242,5254140,5252172);y=0.0;return+y}return 0.0}function b1(a){a=a|0;var b=0;c[a>>2]=5260112;b=a+12|0;pj(c[b>>2]|0);c[b>>2]=0;c[a+16>>2]=0;pl(a);return}function b2(a){a=a|0;var b=0;c[a>>2]=5260112;b=a+12|0;pj(c[b>>2]|0);c[b>>2]=0;c[a+16>>2]=0;return}function b3(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0;e=cA(d,40)|0;if((e|0)==0){f=0}else{c[e>>2]=5260112;c[e+4>>2]=3;g[e+8>>2]=.009999999776482582;c[e+12>>2]=0;c[e+16>>2]=0;a[e+36|0]=0;a[e+37|0]=0;f=e}e=c[b+12>>2]|0;d=c[b+16>>2]|0;h=f+12|0;do{if((c[h>>2]|0)==0){if((c[f+16>>2]|0)==0){break}else{i=778;break}}else{i=778}}while(0);if((i|0)==778){aH(5247316,48,5258584,5251868)}if((d|0)<=1){aH(5247316,49,5258584,5247772)}i=f+16|0;c[i>>2]=d;j=pi(d<<3)|0;c[h>>2]=j;pq(j,e,c[i>>2]<<3);i=f+36|0;a[i]=0;e=f+37|0;a[e]=0;j=b+20|0;h=f+20|0;d=c[j+4>>2]|0;c[h>>2]=c[j>>2]|0;c[h+4>>2]=d;d=b+28|0;h=f+28|0;j=c[d+4>>2]|0;c[h>>2]=c[d>>2]|0;c[h+4>>2]=j;a[i]=a[b+36|0]&1;a[e]=a[b+37|0]&1;return f|0}function b4(a,b,c){a=a|0;b=b|0;c=c|0;return 0}function b5(a){a=a|0;return}function b6(a){a=a|0;return 1}function b7(a){a=a|0;return}function b8(a){a=a|0;return 1}function b9(a,b,c){a=a|0;b=b|0;c=c|0;return 0}function ca(a){a=a|0;return 1}function cb(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=+g[b+12>>2];e=+g[a+12>>2];f=+g[b+8>>2];h=+g[a+16>>2];i=+g[c>>2]-(+g[b>>2]+(d*e-f*h));j=+g[c+4>>2]-(+g[b+4>>2]+(e*f+d*h));h=+g[a+8>>2];return i*i+j*j<=h*h|0}function cc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0;e=+g[c+12>>2];f=+g[a+12>>2];h=+g[c+8>>2];i=+g[a+16>>2];j=+g[c>>2]+(e*f-h*i);k=+g[c+4>>2]+(f*h+e*i);c=a+8|0;i=+g[c>>2];g[b>>2]=j-i;g[b+4>>2]=k-i;i=+g[c>>2];g[b+8>>2]=j+i;g[b+12>>2]=k+i;return}function cd(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0.0,h=0.0,i=0,j=0,k=0,l=0,m=0.0;e=a+8|0;f=+g[e>>2];h=f*d*3.1415927410125732*f;g[b>>2]=h;i=a+12|0;j=i;k=b+4|0;l=c[j+4>>2]|0;c[k>>2]=c[j>>2]|0;c[k+4>>2]=l;f=+g[e>>2];d=+g[i>>2];m=+g[a+16>>2];g[b+12>>2]=h*(f*f*.5+(d*d+m*m));return}function ce(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0;f=+g[d+12>>2];h=+g[a+12>>2];i=+g[d+8>>2];j=+g[a+16>>2];l=+g[d>>2];m=l+(f*h-i*j);n=+g[d+4>>2];o=h*i+f*j+n;j=+g[a+20>>2];h=+g[a+24>>2];p=l+(f*j-i*h);l=n+(i*j+f*h);h=+g[a+8>>2];a=b;d=(g[k>>2]=(m<p?m:p)-h,c[k>>2]|0);e=(g[k>>2]=(o<l?o:l)-h,c[k>>2]|0)|0;c[a>>2]=0|d;c[a+4>>2]=e;e=b+8|0;b=(g[k>>2]=h+(m>p?m:p),c[k>>2]|0);a=(g[k>>2]=h+(o>l?o:l),c[k>>2]|0)|0;c[e>>2]=0|b;c[e+4>>2]=a;return}function cf(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0;g[b>>2]=0.0;d=(+g[a+16>>2]+ +g[a+24>>2])*.5;e=b+4|0;f=(g[k>>2]=(+g[a+12>>2]+ +g[a+20>>2])*.5,c[k>>2]|0);a=(g[k>>2]=d,c[k>>2]|0)|0;c[e>>2]=0|f;c[e+4>>2]=a;g[b+12>>2]=0.0;return}function cg(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0;do{if((e|0)>-1){if(((c[b+16>>2]|0)-1|0)>(e|0)){break}else{f=796;break}}else{f=796}}while(0);if((f|0)==796){aH(5247316,89,5255080,5247080)}c[d+4>>2]=1;g[d+8>>2]=+g[b+8>>2];f=b+12|0;h=(c[f>>2]|0)+(e<<3)|0;i=d+12|0;j=c[h+4>>2]|0;c[i>>2]=c[h>>2]|0;c[i+4>>2]=j;j=(c[f>>2]|0)+(e+1<<3)|0;i=d+20|0;h=c[j+4>>2]|0;c[i>>2]=c[j>>2]|0;c[i+4>>2]=h;h=d+28|0;if((e|0)>0){i=(c[f>>2]|0)+(e-1<<3)|0;j=h;k=c[i+4>>2]|0;c[j>>2]=c[i>>2]|0;c[j+4>>2]=k;a[d+44|0]=1}else{k=b+20|0;j=h;h=c[k+4>>2]|0;c[j>>2]=c[k>>2]|0;c[j+4>>2]=h;a[d+44|0]=a[b+36|0]&1}h=d+36|0;if(((c[b+16>>2]|0)-2|0)>(e|0)){j=(c[f>>2]|0)+(e+2<<3)|0;e=h;f=c[j+4>>2]|0;c[e>>2]=c[j>>2]|0;c[e+4>>2]=f;a[d+45|0]=1;return}else{f=b+28|0;e=h;h=c[f+4>>2]|0;c[e>>2]=c[f>>2]|0;c[e+4>>2]=h;a[d+45|0]=a[b+37|0]&1;return}}function ch(a,d,e,f,h){a=a|0;d=d|0;e=e|0;f=f|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0;j=i;i=i+48|0;k=j|0;l=a+16|0;m=c[l>>2]|0;if((m|0)>(h|0)){n=m}else{aH(5247316,129,5254968,5246668);n=c[l>>2]|0}c[k>>2]=5260312;c[k+4>>2]=1;g[k+8>>2]=.009999999776482582;l=k+28|0;c[l>>2]=0;c[l+4>>2]=0;c[l+8>>2]=0;c[l+12>>2]=0;b[l+16>>1]=0;l=h+1|0;m=c[a+12>>2]|0;a=m+(h<<3)|0;h=k+12|0;o=c[a+4>>2]|0;c[h>>2]=c[a>>2]|0;c[h+4>>2]=o;o=m+(((l|0)==(n|0)?0:l)<<3)|0;l=k+20|0;n=c[o+4>>2]|0;c[l>>2]=c[o>>2]|0;c[l+4>>2]=n;n=co(k,d,e,f,0)|0;i=j;return n|0}function ci(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0;f=a+16|0;h=c[f>>2]|0;if((h|0)>(e|0)){i=h}else{aH(5247316,148,5255140,5246668);i=c[f>>2]|0}f=e+1|0;h=(f|0)==(i|0)?0:f;f=c[a+12>>2]|0;j=+g[d+12>>2];l=+g[f+(e<<3)>>2];m=+g[d+8>>2];n=+g[f+(e<<3)+4>>2];o=+g[d>>2];p=o+(j*l-m*n);q=+g[d+4>>2];r=l*m+j*n+q;n=+g[f+(h<<3)>>2];l=+g[f+(h<<3)+4>>2];s=o+(j*n-m*l);o=q+(m*n+j*l);h=b;f=(g[k>>2]=p<s?p:s,c[k>>2]|0);d=(g[k>>2]=r<o?r:o,c[k>>2]|0)|0;c[h>>2]=0|f;c[h+4>>2]=d;d=b+8|0;b=(g[k>>2]=p>s?p:s,c[k>>2]|0);h=(g[k>>2]=r>o?r:o,c[k>>2]|0)|0;c[d>>2]=0|b;c[d+4>>2]=h;return}function cj(a,b,d){a=a|0;b=b|0;d=+d;a=b;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;return}function ck(a,b){a=a|0;b=b|0;var d=0,e=0;d=cA(b,20)|0;if((d|0)==0){e=0}else{c[d>>2]=5259964;b=d+4|0;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;e=d}c[e+4>>2]=c[a+4>>2]|0;g[e+8>>2]=+g[a+8>>2];d=a+12|0;a=e+12|0;b=c[d+4>>2]|0;c[a>>2]=c[d>>2]|0;c[a+4>>2]=b;return e|0}function cl(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0;h=+g[e+12>>2];i=+g[a+12>>2];j=+g[e+8>>2];l=+g[a+16>>2];m=+g[d>>2];n=m-(+g[e>>2]+(h*i-j*l));o=+g[d+4>>2];p=o-(+g[e+4>>2]+(i*j+h*l));l=+g[a+8>>2];h=+g[d+8>>2]-m;m=+g[d+12>>2]-o;o=n*h+p*m;j=h*h+m*m;i=o*o-(n*n+p*p-l*l)*j;if(i<0.0|j<1.1920928955078125e-7){q=0;return q|0}l=o+ +O(+i);i=-0.0-l;if(l>-0.0){q=0;return q|0}if(j*+g[d+16>>2]<i){q=0;return q|0}l=i/j;g[b+8>>2]=l;j=n+h*l;h=p+m*l;d=b;a=(g[k>>2]=j,c[k>>2]|0);e=(g[k>>2]=h,c[k>>2]|0)|0;c[d>>2]=0|a;c[d+4>>2]=e;l=+O(+(j*j+h*h));if(l<1.1920928955078125e-7){q=1;return q|0}m=1.0/l;g[b>>2]=j*m;g[b+4>>2]=h*m;q=1;return q|0}function cm(a){a=a|0;pl(a);return}function cn(d,e){d=d|0;e=e|0;var f=0,h=0,i=0;f=cA(e,48)|0;if((f|0)==0){h=0}else{c[f>>2]=5260312;c[f+4>>2]=1;g[f+8>>2]=.009999999776482582;e=f+28|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;b[e+16>>1]=0;h=f}c[h+4>>2]=c[d+4>>2]|0;g[h+8>>2]=+g[d+8>>2];f=d+12|0;e=h+12|0;i=c[f+4>>2]|0;c[e>>2]=c[f>>2]|0;c[e+4>>2]=i;i=d+20|0;e=h+20|0;f=c[i+4>>2]|0;c[e>>2]=c[i>>2]|0;c[e+4>>2]=f;f=d+28|0;e=h+28|0;i=c[f+4>>2]|0;c[e>>2]=c[f>>2]|0;c[e+4>>2]=i;i=d+36|0;e=h+36|0;f=c[i+4>>2]|0;c[e>>2]=c[i>>2]|0;c[e+4>>2]=f;a[h+44|0]=a[d+44|0]&1;a[h+45|0]=a[d+45|0]&1;return h|0}function co(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0;h=+g[e>>2];i=+g[d>>2]-h;j=+g[e+4>>2];l=+g[d+4>>2]-j;m=+g[e+12>>2];n=+g[e+8>>2];o=i*m+l*n;p=-0.0-n;q=m*l+i*p;i=+g[d+8>>2]-h;h=+g[d+12>>2]-j;j=m*i+n*h-o;n=i*p+m*h-q;e=a+12|0;f=c[e+4>>2]|0;h=(c[k>>2]=c[e>>2]|0,+g[k>>2]);m=(c[k>>2]=f,+g[k>>2]);f=a+20|0;a=c[f+4>>2]|0;p=(c[k>>2]=c[f>>2]|0,+g[k>>2]);i=p-h;p=(c[k>>2]=a,+g[k>>2])-m;l=-0.0-i;r=i*i+p*p;s=+O(+r);if(s<1.1920928955078125e-7){t=p;u=l}else{v=1.0/s;t=p*v;u=v*l}l=(m-q)*u+(h-o)*t;v=n*u+j*t;if(v==0.0){w=0;return w|0}s=l/v;if(s<0.0){w=0;return w|0}if(+g[d+16>>2]<s|r==0.0){w=0;return w|0}v=(i*(o+j*s-h)+p*(q+n*s-m))/r;if(v<0.0|v>1.0){w=0;return w|0}g[b+8>>2]=s;if(l>0.0){d=b;a=(g[k>>2]=-0.0-t,c[k>>2]|0);f=(g[k>>2]=-0.0-u,c[k>>2]|0)|0;c[d>>2]=0|a;c[d+4>>2]=f;w=1;return w|0}else{f=b;b=(g[k>>2]=t,c[k>>2]|0);d=(g[k>>2]=u,c[k>>2]|0)|0;c[f>>2]=0|b;c[f+4>>2]=d;w=1;return w|0}return 0}function cp(a){a=a|0;pl(a);return}function cq(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=cA(b,152)|0;if((d|0)==0){e=0}else{c[d>>2]=5259868;c[d+4>>2]=2;g[d+8>>2]=.009999999776482582;c[d+148>>2]=0;g[d+12>>2]=0.0;g[d+16>>2]=0.0;e=d}c[e+4>>2]=c[a+4>>2]|0;g[e+8>>2]=+g[a+8>>2];d=a+12|0;b=e+12|0;f=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=f;pq(e+20|0,a+20|0,64);pq(e+84|0,a+84|0,64);c[e+148>>2]=c[a+148>>2]|0;return e|0}function cr(a,b,d,e,f){a=a|0;b=+b;d=+d;e=e|0;f=+f;var h=0,i=0.0,j=0.0,l=0,m=0,n=0.0,o=0.0,p=0;h=a+148|0;c[h>>2]=4;i=-0.0-b;j=-0.0-d;g[a+20>>2]=i;g[a+24>>2]=j;g[a+28>>2]=b;g[a+32>>2]=j;g[a+36>>2]=b;g[a+40>>2]=d;g[a+44>>2]=i;g[a+48>>2]=d;g[a+84>>2]=0.0;g[a+88>>2]=-1.0;g[a+92>>2]=1.0;g[a+96>>2]=0.0;g[a+100>>2]=0.0;g[a+104>>2]=1.0;g[a+108>>2]=-1.0;g[a+112>>2]=0.0;l=e;e=a+12|0;m=c[l+4>>2]|0;c[e>>2]=c[l>>2]|0;c[e+4>>2]=m;m=c[l+4>>2]|0;d=(c[k>>2]=c[l>>2]|0,+g[k>>2]);i=(c[k>>2]=m,+g[k>>2]);b=+R(+f);n=+Q(+f);m=0;f=j;j=-1.0;while(1){l=a+20+(m<<3)|0;o=+g[l>>2];e=l;l=(g[k>>2]=d+(n*o-b*f),c[k>>2]|0);p=(g[k>>2]=i+(b*o+n*f),c[k>>2]|0)|0;c[e>>2]=0|l;c[e+4>>2]=p;p=a+84+(m<<3)|0;o=+g[p>>2];e=p;p=(g[k>>2]=n*o-b*j,c[k>>2]|0);l=(g[k>>2]=b*o+n*j,c[k>>2]|0)|0;c[e>>2]=0|p;c[e+4>>2]=l;l=m+1|0;if((l|0)>=(c[h>>2]|0)){break}m=l;f=+g[a+20+(l<<3)+4>>2];j=+g[a+84+(l<<3)+4>>2]}return}function cs(a){a=a|0;return}function ct(a,b,d){a=a|0;b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0,m=0;e=+g[d>>2]- +g[b>>2];f=+g[d+4>>2]- +g[b+4>>2];h=+g[b+12>>2];i=+g[b+8>>2];j=e*h+f*i;k=h*f+e*(-0.0-i);b=c[a+148>>2]|0;d=0;while(1){if((d|0)>=(b|0)){l=1;m=860;break}if((j- +g[a+20+(d<<3)>>2])*+g[a+84+(d<<3)>>2]+(k- +g[a+20+(d<<3)+4>>2])*+g[a+84+(d<<3)+4>>2]>0.0){l=0;m=861;break}else{d=d+1|0}}if((m|0)==860){return l|0}else if((m|0)==861){return l|0}return 0}function cu(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0.0,y=0.0,z=0.0,A=0.0;f=+g[d+12>>2];h=+g[a+20>>2];i=+g[d+8>>2];j=+g[a+24>>2];l=+g[d>>2];m=l+(f*h-i*j);n=+g[d+4>>2];o=h*i+f*j+n;d=c[a+148>>2]|0;L1182:do{if((d|0)>1){j=o;h=m;p=o;q=m;e=1;while(1){r=+g[a+20+(e<<3)>>2];s=+g[a+20+(e<<3)+4>>2];t=l+(f*r-i*s);u=r*i+f*s+n;s=h<t?h:t;r=j<u?j:u;v=q>t?q:t;t=p>u?p:u;w=e+1|0;if((w|0)<(d|0)){j=r;h=s;p=t;q=v;e=w}else{x=r;y=s;z=t;A=v;break L1182}}}else{x=o;y=m;z=o;A=m}}while(0);m=+g[a+8>>2];a=b;d=(g[k>>2]=y-m,c[k>>2]|0);e=(g[k>>2]=x-m,c[k>>2]|0)|0;c[a>>2]=0|d;c[a+4>>2]=e;e=b+8|0;b=(g[k>>2]=A+m,c[k>>2]|0);a=(g[k>>2]=z+m,c[k>>2]|0)|0;c[e>>2]=0|b;c[e+4>>2]=a;return}function cv(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;d=+g[b+16>>2];e=+g[b+32>>2];f=+g[b+20>>2];h=+g[b+28>>2];i=d*e-f*h;j=+g[b+24>>2];k=+g[b+12>>2];l=f*j-e*k;m=h*k-d*j;n=+g[b>>2];o=+g[b+4>>2];p=+g[b+8>>2];q=i*n+o*l+m*p;if(q!=0.0){r=1.0/q}else{r=q}q=+g[c>>2];s=+g[c+4>>2];t=+g[c+8>>2];g[a>>2]=r*(i*q+s*l+m*t);g[a+4>>2]=r*((s*e-t*h)*n+o*(t*j-e*q)+(h*q-s*j)*p);g[a+8>>2]=r*((d*t-f*s)*n+o*(f*q-t*k)+(s*k-d*q)*p);return}function cw(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0,r=0,s=0.0,t=0.0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0.0,C=0.0,D=0.0,E=0,F=0.0,G=0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,P=0.0,Q=0.0,R=0.0,S=0,T=0.0,U=0.0,V=0.0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0;do{if((d-3|0)>>>0<6){e=a+148|0;c[e>>2]=d;f=e;h=871;break}else{aH(5246808,122,5258092,5251724);e=a+148|0;c[e>>2]=d;if((d|0)>0){f=e;h=871;break}else{i=d;h=879;break}}}while(0);do{if((h|0)==871){d=0;while(1){e=b+(d<<3)|0;j=a+20+(d<<3)|0;l=c[e+4>>2]|0;c[j>>2]=c[e>>2]|0;c[j+4>>2]=l;l=d+1|0;m=c[f>>2]|0;if((l|0)<(m|0)){d=l}else{break}}if((m|0)>0){n=m;o=0}else{i=m;h=879;break}while(1){d=o+1|0;l=(d|0)<(n|0)?d:0;p=+g[a+20+(l<<3)>>2]- +g[a+20+(o<<3)>>2];q=+g[a+20+(l<<3)+4>>2]- +g[a+20+(o<<3)+4>>2];if(p*p+q*q<=1.4210854715202004e-14){aH(5246808,137,5258092,5249328)}l=a+84+(o<<3)|0;j=l;e=(g[k>>2]=q,c[k>>2]|0);r=(g[k>>2]=p*-1.0,c[k>>2]|0)|0;c[j>>2]=0|e;c[j+4>>2]=r;r=a+84+(o<<3)+4|0;p=+g[r>>2];s=+O(+(q*q+p*p));if(s>=1.1920928955078125e-7){t=1.0/s;g[l>>2]=q*t;g[r>>2]=p*t}u=c[f>>2]|0;if((d|0)<(u|0)){n=u;o=d}else{break}}d=a+12|0;r=a+20|0;if((u|0)>2){v=u;w=d;x=r;h=882;break}else{y=u;z=d;A=r;h=881;break}}}while(0);do{if((h|0)==879){y=i;z=a+12|0;A=a+20|0;h=881;break}}while(0);do{if((h|0)==881){aH(5246808,76,5259012,5246200);if((y|0)>0){v=y;w=z;x=A;h=882;break}else{B=0.0;C=0.0;D=0.0;E=z;break}}}while(0);do{if((h|0)==882){z=0;t=0.0;p=0.0;q=0.0;while(1){A=a+20+(z<<3)|0;y=c[A+4>>2]|0;s=(c[k>>2]=c[A>>2]|0,+g[k>>2]);F=(c[k>>2]=y,+g[k>>2]);y=z+1|0;if((y|0)<(v|0)){G=a+20+(y<<3)|0}else{G=x}A=G;i=c[A+4>>2]|0;H=(c[k>>2]=c[A>>2]|0,+g[k>>2]);I=(c[k>>2]=i,+g[k>>2]);J=(s*I-F*H)*.5;K=t+J;L=J*.3333333432674408;M=p+(s+0.0+H)*L;N=q+(F+0.0+I)*L;if((y|0)==(v|0)){break}else{z=y;t=K;p=M;q=N}}if(K>1.1920928955078125e-7){P=N;Q=M;R=K;S=w}else{B=N;C=M;D=K;E=w;break}T=1.0/R;U=Q*T;V=P*T;W=S;X=(g[k>>2]=U,c[k>>2]|0);Y=(g[k>>2]=V,c[k>>2]|0);Z=Y;_=0;$=0;aa=Z;ab=X;ac=0;ad=$|ab;ae=aa|ac;af=W|0;c[af>>2]=ad;ag=W+4|0;c[ag>>2]=ae;return}}while(0);aH(5246808,115,5259012,5246644);P=B;Q=C;R=D;S=E;T=1.0/R;U=Q*T;V=P*T;W=S;X=(g[k>>2]=U,c[k>>2]|0);Y=(g[k>>2]=V,c[k>>2]|0);Z=Y;_=0;$=0;aa=Z;ab=X;ac=0;ad=$|ab;ae=aa|ac;af=W|0;c[af>>2]=ad;ag=W+4|0;c[ag>>2]=ae;return}function cx(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0.0,i=0.0,j=0.0,l=0.0,m=0.0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0,u=0.0,v=0.0,w=0,x=0.0,y=0,z=0.0;h=+g[e>>2];i=+g[d>>2]-h;j=+g[e+4>>2];l=+g[d+4>>2]-j;f=e+12|0;m=+g[f>>2];n=e+8|0;o=+g[n>>2];p=i*m+l*o;q=-0.0-o;r=m*l+i*q;i=+g[d+8>>2]-h;h=+g[d+12>>2]-j;j=m*i+o*h-p;o=i*q+m*h-r;h=+g[d+16>>2];d=c[a+148>>2]|0;m=0.0;e=0;s=-1;q=h;L1224:while(1){if((e|0)>=(d|0)){t=902;break}i=+g[a+84+(e<<3)>>2];l=+g[a+84+(e<<3)+4>>2];u=(+g[a+20+(e<<3)>>2]-p)*i+(+g[a+20+(e<<3)+4>>2]-r)*l;v=j*i+o*l;L1227:do{if(v==0.0){if(u<0.0){w=0;t=907;break L1224}else{x=m;y=s;z=q}}else{do{if(v<0.0){if(u>=m*v){break}x=u/v;y=e;z=q;break L1227}}while(0);if(v<=0.0){x=m;y=s;z=q;break}if(u>=q*v){x=m;y=s;z=q;break}x=m;y=s;z=u/v}}while(0);if(z<x){w=0;t=908;break}else{m=x;e=e+1|0;s=y;q=z}}if((t|0)==902){if(m<0.0|m>h){aH(5246808,249,5254348,5247624)}if((s|0)<=-1){w=0;return w|0}g[b+8>>2]=m;m=+g[f>>2];h=+g[a+84+(s<<3)>>2];z=+g[n>>2];q=+g[a+84+(s<<3)+4>>2];s=b;b=(g[k>>2]=m*h-z*q,c[k>>2]|0);a=(g[k>>2]=h*z+m*q,c[k>>2]|0)|0;c[s>>2]=0|b;c[s+4>>2]=a;w=1;return w|0}else if((t|0)==907){return w|0}else if((t|0)==908){return w|0}return 0}function cy(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0,D=0,E=0,F=0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0;e=a+148|0;f=c[e>>2]|0;do{if((f|0)>2){h=f;i=914}else{aH(5246808,306,5254464,5247060);j=c[e>>2]|0;if((j|0)>0){h=j;i=914;break}l=1.0/+(j|0);j=b|0;g[j>>2]=d*0.0;m=l*0.0;n=l*0.0;o=0.0;p=0.0;q=0.0;r=0.0;s=j;i=921;break}}while(0);do{if((i|0)==914){l=0.0;t=0.0;e=0;while(1){u=t+ +g[a+20+(e<<3)>>2];v=l+ +g[a+20+(e<<3)+4>>2];f=e+1|0;if((f|0)<(h|0)){l=v;t=u;e=f}else{break}}t=1.0/+(h|0);l=u*t;w=v*t;e=a+20|0;f=a+24|0;t=0.0;x=0.0;j=0;y=0.0;z=0.0;while(1){A=+g[a+20+(j<<3)>>2]-l;B=+g[a+20+(j<<3)+4>>2]-w;C=j+1|0;D=(C|0)<(h|0);if(D){E=a+20+(C<<3)|0;F=a+20+(C<<3)+4|0}else{E=e;F=f}G=+g[E>>2]-l;H=+g[F>>2]-w;I=A*H-B*G;J=I*.5;K=z+J;L=J*.3333333432674408;M=x+(A+G)*L;N=t+(B+H)*L;O=y+I*.0833333358168602*(G*G+(A*A+A*G)+(H*H+(B*B+B*H)));if(D){t=N;x=M;j=C;y=O;z=K}else{break}}z=K*d;j=b|0;g[j>>2]=z;if(K>1.1920928955078125e-7){P=z;Q=w;R=l;S=K;T=O;U=M;V=N;break}else{m=w;n=l;o=K;p=O;q=M;r=N;s=j;i=921;break}}}while(0);if((i|0)==921){aH(5246808,352,5254464,5246644);P=+g[s>>2];Q=m;R=n;S=o;T=p;U=q;V=r}r=1.0/S;S=U*r;U=V*r;r=R+S;R=Q+U;s=b+4|0;i=(g[k>>2]=r,c[k>>2]|0);F=(g[k>>2]=R,c[k>>2]|0)|0;c[s>>2]=0|i;c[s+4>>2]=F;g[b+12>>2]=T*d+P*(r*r+R*R-(S*S+U*U));return}function cz(a){a=a|0;pl(a);return}function cA(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;if((d|0)==0){e=0;return e|0}do{if((d|0)>0){if((d|0)<=640){break}e=pi(d)|0;return e|0}else{aH(5246516,104,5257732,5249204)}}while(0);f=a[d+5261540|0]|0;d=f&255;if((f&255)>=14){aH(5246516,112,5257732,5247588)}f=b+12+(d<<2)|0;g=c[f>>2]|0;if((g|0)!=0){c[f>>2]=c[g>>2]|0;e=g;return e|0}g=b+4|0;h=c[g>>2]|0;i=b+8|0;j=b|0;if((h|0)==(c[i>>2]|0)){b=c[j>>2]|0;k=h+128|0;c[i>>2]=k;i=pi(k<<3)|0;c[j>>2]=i;k=b;pq(i,k,c[g>>2]<<3);pr((c[j>>2]|0)+(c[g>>2]<<3)|0,0,1024);pj(k);l=c[g>>2]|0}else{l=h}h=c[j>>2]|0;j=pi(16384)|0;k=h+(l<<3)+4|0;c[k>>2]=j;i=c[5262184+(d<<2)>>2]|0;c[h+(l<<3)>>2]=i;l=16384/(i|0)&-1;if((_(l,i)|0)<16385){m=j}else{aH(5246516,140,5257732,5247020);m=c[k>>2]|0}j=l-1|0;l=m;L1290:do{if((j|0)>0){m=0;h=l;while(1){d=h+_(m,i)|0;b=m+1|0;c[d>>2]=h+_(b,i)|0;d=c[k>>2]|0;if((b|0)==(j|0)){n=d;break L1290}else{m=b;h=d}}}else{n=l}}while(0);c[n+_(j,i)>>2]=0;c[f>>2]=c[c[k>>2]>>2]|0;c[g>>2]=(c[g>>2]|0)+1|0;e=c[k>>2]|0;return e|0}function cB(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;i=i+4|0;e=d|0;c[e>>2]=b;am(a|0,c[e>>2]|0);i=d;return}function cC(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b+102796|0;f=c[e>>2]|0;if((f|0)>0){g=f}else{aH(5246028,63,5257464,5247e3);g=c[e>>2]|0}f=g-1|0;if((c[b+102412+(f*12&-1)>>2]|0)!=(d|0)){aH(5246028,65,5257464,5246624)}if((a[b+102412+(f*12&-1)+8|0]&1)<<24>>24==0){g=b+102412+(f*12&-1)+4|0;h=b+102400|0;c[h>>2]=(c[h>>2]|0)-(c[g>>2]|0)|0;i=g}else{pj(d);i=b+102412+(f*12&-1)+4|0}f=b+102404|0;c[f>>2]=(c[f>>2]|0)-(c[i>>2]|0)|0;c[e>>2]=(c[e>>2]|0)-1|0;return}function cD(d,e,f){d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0,m=0,n=0,o=0,p=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;h=d+12|0;i=d+64|0;j=e+4|0;k=+g[j>>2];do{if(k==k&!(B=0.0,B!=B)&k>+-q&k<+q){l=+g[e+8>>2];if(l==l&!(B=0.0,B!=B)&l>+-q&l<+q){break}else{m=956;break}}else{m=956}}while(0);if((m|0)==956){aH(5245912,27,5256336,5251248)}n=e+16|0;k=+g[n>>2];do{if(k==k&!(B=0.0,B!=B)&k>+-q&k<+q){l=+g[e+20>>2];if(l==l&!(B=0.0,B!=B)&l>+-q&l<+q){break}else{m=959;break}}else{m=959}}while(0);if((m|0)==959){aH(5245912,28,5256336,5248772)}m=e+12|0;k=+g[m>>2];if(!(k==k&!(B=0.0,B!=B)&k>+-q&k<+q)){aH(5245912,29,5256336,5247528)}o=e+24|0;k=+g[o>>2];if(!(k==k&!(B=0.0,B!=B)&k>+-q&k<+q)){aH(5245912,30,5256336,5246968)}p=e+32|0;k=+g[p>>2];if(k<0.0|k==k&!(B=0.0,B!=B)&k>+-q&k<+q^1){aH(5245912,31,5256336,5246564)}r=e+28|0;k=+g[r>>2];if(k<0.0|k==k&!(B=0.0,B!=B)&k>+-q&k<+q^1){aH(5245912,32,5256336,5246140)}s=d+4|0;b[s>>1]=0;if((a[e+39|0]&1)<<24>>24==0){t=0}else{b[s>>1]=8;t=8}if((a[e+38|0]&1)<<24>>24==0){u=t}else{v=t|16;b[s>>1]=v;u=v}if((a[e+36|0]&1)<<24>>24==0){w=u}else{v=u|4;b[s>>1]=v;w=v}if((a[e+37|0]&1)<<24>>24==0){x=w}else{v=w|2;b[s>>1]=v;x=v}if((a[e+40|0]&1)<<24>>24!=0){b[s>>1]=x|32}c[d+88>>2]=f;f=j;j=h;h=c[f>>2]|0;x=c[f+4>>2]|0;c[j>>2]=h;c[j+4>>2]=x;k=+g[m>>2];g[d+20>>2]=+R(+k);g[d+24>>2]=+Q(+k);g[d+28>>2]=0.0;g[d+32>>2]=0.0;j=d+36|0;c[j>>2]=h;c[j+4>>2]=x;j=d+44|0;c[j>>2]=h;c[j+4>>2]=x;g[d+52>>2]=+g[m>>2];g[d+56>>2]=+g[m>>2];g[d+60>>2]=0.0;c[d+108>>2]=0;c[d+112>>2]=0;c[d+92>>2]=0;c[d+96>>2]=0;m=n;n=i;i=c[m+4>>2]|0;c[n>>2]=c[m>>2]|0;c[n+4>>2]=i;g[d+72>>2]=+g[o>>2];g[d+132>>2]=+g[r>>2];g[d+136>>2]=+g[p>>2];g[d+140>>2]=+g[e+48>>2];g[d+76>>2]=0.0;g[d+80>>2]=0.0;g[d+84>>2]=0.0;g[d+144>>2]=0.0;p=c[e>>2]|0;c[d>>2]=p;r=d+116|0;if((p|0)==2){g[r>>2]=1.0;g[d+120>>2]=1.0;p=d+124|0;g[p>>2]=0.0;o=d+128|0;g[o>>2]=0.0;i=e+44|0;n=c[i>>2]|0;m=d+148|0;c[m>>2]=n;x=d+100|0;c[x>>2]=0;j=d+104|0;c[j>>2]=0;return}else{g[r>>2]=0.0;g[d+120>>2]=0.0;p=d+124|0;g[p>>2]=0.0;o=d+128|0;g[o>>2]=0.0;i=e+44|0;n=c[i>>2]|0;m=d+148|0;c[m>>2]=n;x=d+100|0;c[x>>2]=0;j=d+104|0;c[j>>2]=0;return}}function cE(a,d){a=a|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0;e=i;i=i+16|0;f=e|0;h=a+88|0;j=c[(c[h>>2]|0)+102868>>2]|0;if((j&2|0)==0){l=j}else{aH(5245912,115,5256416,5245880);l=c[(c[h>>2]|0)+102868>>2]|0}if((l&2|0)!=0){i=e;return}l=a|0;if((c[l>>2]|0)==(d|0)){i=e;return}c[l>>2]=d;cF(a);L1360:do{if((c[l>>2]|0)==0){g[a+64>>2]=0.0;g[a+68>>2]=0.0;g[a+72>>2]=0.0;m=+g[a+56>>2];g[a+52>>2]=m;d=a+44|0;j=a+36|0;n=c[d>>2]|0;o=c[d+4>>2]|0;c[j>>2]=n;c[j+4>>2]=o;p=+R(+m);g[f+8>>2]=p;q=+Q(+m);g[f+12>>2]=q;m=+g[a+28>>2];r=+g[a+32>>2];s=(c[k>>2]=n,+g[k>>2])-(q*m-p*r);t=(c[k>>2]=o,+g[k>>2])-(p*m+q*r);o=f;n=(g[k>>2]=s,c[k>>2]|0);j=(g[k>>2]=t,c[k>>2]|0)|0;c[o>>2]=0|n;c[o+4>>2]=j;j=(c[h>>2]|0)+102872|0;o=c[a+100>>2]|0;if((o|0)==0){break}n=a+12|0;d=o;while(1){c1(d,j,f,n);o=c[d+4>>2]|0;if((o|0)==0){break L1360}else{d=o}}}}while(0);f=a+4|0;h=b[f>>1]|0;if((h&2)<<16>>16==0){b[f>>1]=h|2;g[a+144>>2]=0.0}g[a+76>>2]=0.0;g[a+80>>2]=0.0;g[a+84>>2]=0.0;h=c[a+100>>2]|0;if((h|0)==0){i=e;return}else{u=h}while(1){c2(u);h=c[u+4>>2]|0;if((h|0)==0){break}else{u=h}}i=e;return}function cF(a){a=a|0;var d=0,e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0,z=0.0,A=0.0,B=0.0,C=0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0,J=0.0,K=0.0;d=i;i=i+16|0;e=d|0;f=a+116|0;h=a+120|0;j=a+124|0;l=a+128|0;m=a+28|0;g[m>>2]=0.0;g[a+32>>2]=0.0;n=f;c[n>>2]=0;c[n+4>>2]=0;c[n+8>>2]=0;c[n+12>>2]=0;n=c[a>>2]|0;if((n|0)==0|(n|0)==1){o=a+12|0;p=a+36|0;q=c[o>>2]|0;r=c[o+4>>2]|0;c[p>>2]=q;c[p+4>>2]=r;p=a+44|0;c[p>>2]=q;c[p+4>>2]=r;g[a+52>>2]=+g[a+56>>2];i=d;return}else if((n|0)!=2){aH(5245912,284,5256496,5252852)}n=5245428;r=c[n+4>>2]|0;s=(c[k>>2]=c[n>>2]|0,+g[k>>2]);t=(c[k>>2]=r,+g[k>>2]);r=c[a+100>>2]|0;L1380:do{if((r|0)==0){u=t;v=s}else{n=e|0;p=e+4|0;q=e+8|0;o=e+12|0;w=t;x=s;y=r;while(1){z=+g[y>>2];if(z==0.0){A=x;B=w}else{C=c[y+12>>2]|0;bi[c[(c[C>>2]|0)+28>>2]&2047](C,e,z);z=+g[n>>2];g[f>>2]=z+ +g[f>>2];D=x+z*+g[p>>2];E=w+z*+g[q>>2];g[j>>2]=+g[o>>2]+ +g[j>>2];A=D;B=E}C=c[y+4>>2]|0;if((C|0)==0){u=B;v=A;break L1380}else{w=B;x=A;y=C}}}}while(0);A=+g[f>>2];if(A>0.0){B=1.0/A;g[h>>2]=B;F=v*B;G=u*B;H=A}else{g[f>>2]=1.0;g[h>>2]=1.0;F=v;G=u;H=1.0}u=+g[j>>2];do{if(u>0.0){if((b[a+4>>1]&16)<<16>>16!=0){I=1017;break}v=u-(G*G+F*F)*H;g[j>>2]=v;if(v>0.0){J=v}else{aH(5245912,319,5256496,5252324);J=+g[j>>2]}K=1.0/J;break}else{I=1017}}while(0);if((I|0)==1017){g[j>>2]=0.0;K=0.0}g[l>>2]=K;l=a+44|0;j=c[l+4>>2]|0;K=(c[k>>2]=c[l>>2]|0,+g[k>>2]);J=(c[k>>2]=j,+g[k>>2]);j=m;m=(g[k>>2]=F,c[k>>2]|0);I=(g[k>>2]=G,c[k>>2]|0)|0;c[j>>2]=0|m;c[j+4>>2]=I;H=+g[a+24>>2];u=+g[a+20>>2];v=+g[a+12>>2]+(H*F-u*G);A=F*u+H*G+ +g[a+16>>2];I=(g[k>>2]=v,c[k>>2]|0);j=0|I;I=(g[k>>2]=A,c[k>>2]|0)|0;c[l>>2]=j;c[l+4>>2]=I;l=a+36|0;c[l>>2]=j;c[l+4>>2]=I;G=+g[a+72>>2];I=a+64|0;g[I>>2]=+g[I>>2]+(A-J)*(-0.0-G);I=a+68|0;g[I>>2]=G*(v-K)+ +g[I>>2];i=d;return}function cG(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;f=d+88|0;h=c[f>>2]|0;i=c[h+102868>>2]|0;if((i&2|0)==0){j=h;k=i}else{aH(5245912,153,5256528,5245880);i=c[f>>2]|0;j=i;k=c[i+102868>>2]|0}if((k&2|0)!=0){l=0;return l|0}k=j|0;j=cA(k,44)|0;if((j|0)==0){m=0}else{b[j+32>>1]=1;b[j+34>>1]=-1;b[j+36>>1]=0;c[j+40>>2]=0;c[j+24>>2]=0;c[j+28>>2]=0;c[j>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;c[j+12>>2]=0;m=j}c[m+40>>2]=c[e+4>>2]|0;g[m+16>>2]=+g[e+8>>2];g[m+20>>2]=+g[e+12>>2];j=m+8|0;c[j>>2]=d;i=m+4|0;c[i>>2]=0;h=m+32|0;n=e+22|0;b[h>>1]=b[n>>1]|0;b[h+2>>1]=b[n+2>>1]|0;b[h+4>>1]=b[n+4>>1]|0;a[m+38|0]=a[e+20|0]&1;n=c[e>>2]|0;h=ba[c[(c[n>>2]|0)+8>>2]&2047](n,k)|0;n=m+12|0;c[n>>2]=h;o=aY[c[(c[h>>2]|0)+12>>2]&2047](h)|0;h=cA(k,o*28&-1)|0;k=m+24|0;c[k>>2]=h;L1412:do{if((o|0)>0){c[h+16>>2]=0;c[(c[k>>2]|0)+24>>2]=-1;if((o|0)==1){break}else{p=1}while(1){c[(c[k>>2]|0)+(p*28&-1)+16>>2]=0;c[(c[k>>2]|0)+(p*28&-1)+24>>2]=-1;q=p+1|0;if((q|0)==(o|0)){break L1412}else{p=q}}}}while(0);p=m+28|0;c[p>>2]=0;o=m|0;g[o>>2]=+g[e+16>>2];L1417:do{if((b[d+4>>1]&32)<<16>>16!=0){e=(c[f>>2]|0)+102872|0;h=d+12|0;q=c[n>>2]|0;r=aY[c[(c[q>>2]|0)+12>>2]&2047](q)|0;c[p>>2]=r;if((r|0)>0){s=0}else{break}while(1){r=c[k>>2]|0;q=r+(s*28&-1)|0;t=c[n>>2]|0;u=q|0;bj[c[(c[t>>2]|0)+24>>2]&2047](t,u,h,s);c[r+(s*28&-1)+24>>2]=bz(e,u,q)|0;c[r+(s*28&-1)+16>>2]=m;c[r+(s*28&-1)+20>>2]=s;r=s+1|0;if((r|0)<(c[p>>2]|0)){s=r}else{break L1417}}}}while(0);s=d+100|0;c[i>>2]=c[s>>2]|0;c[s>>2]=m;s=d+104|0;c[s>>2]=(c[s>>2]|0)+1|0;c[j>>2]=d;if(+g[o>>2]>0.0){cF(d)}d=(c[f>>2]|0)+102868|0;c[d>>2]=c[d>>2]|1;l=m;return l|0}function cH(a){a=a|0;return}function cI(a){a=a|0;return}function cJ(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;f=d+88|0;g=c[(c[f>>2]|0)+102868>>2]|0;if((g&2|0)==0){h=g}else{aH(5245912,201,5256452,5245880);h=c[(c[f>>2]|0)+102868>>2]|0}if((h&2|0)!=0){return}h=e+8|0;if((c[h>>2]|0)!=(d|0)){aH(5245912,207,5256452,5245680)}g=d+104|0;if((c[g>>2]|0)<=0){aH(5245912,210,5256452,5245436)}i=d+100|0;while(1){j=c[i>>2]|0;if((j|0)==0){k=1052;break}if((j|0)==(e|0)){k=1051;break}else{i=j+4|0}}if((k|0)==1051){c[i>>2]=c[e+4>>2]|0}else if((k|0)==1052){aH(5245912,226,5256452,5253220)}i=c[d+112>>2]|0;L1448:do{if((i|0)!=0){j=i;while(1){l=c[j+4>>2]|0;m=c[j+12>>2]|0;if((c[l+48>>2]|0)==(e|0)|(c[l+52>>2]|0)==(e|0)){cO((c[f>>2]|0)+102872|0,l)}if((m|0)==0){break L1448}else{j=m}}}}while(0);i=c[f>>2]|0;f=i|0;if((b[d+4>>1]&32)<<16>>16!=0){j=e+28|0;L1457:do{if((c[j>>2]|0)>0){m=e+24|0;l=i+102912|0;n=i+102904|0;o=i+102900|0;p=i+102872|0;q=0;while(1){r=(c[m>>2]|0)+(q*28&-1)+24|0;s=c[r>>2]|0;t=c[l>>2]|0;u=0;while(1){if((u|0)>=(t|0)){break}v=(c[n>>2]|0)+(u<<2)|0;if((c[v>>2]|0)==(s|0)){k=1063;break}else{u=u+1|0}}if((k|0)==1063){k=0;c[v>>2]=-1}c[o>>2]=(c[o>>2]|0)-1|0;bP(p,s);c[r>>2]=-1;u=q+1|0;if((u|0)<(c[j>>2]|0)){q=u}else{break L1457}}}}while(0);c[j>>2]=0}c0(e,f);c[h>>2]=0;c[e+4>>2]=0;h=a[5261584]|0;if((h&255)>=14){aH(5246516,173,5257772,5247588)}f=i+12+((h&255)<<2)|0;c[e>>2]=c[f>>2]|0;c[f>>2]=e;c[g>>2]=(c[g>>2]|0)-1|0;cF(d);return}function cK(a,d){a=a|0;d=d|0;var e=0,f=0,h=0,i=0.0,j=0.0,l=0.0,m=0.0,n=0.0,o=0.0,p=0,q=0.0,r=0.0;e=a+88|0;f=c[(c[e>>2]|0)+102868>>2]|0;if((f&2|0)==0){h=f}else{aH(5245912,340,5256636,5245880);h=c[(c[e>>2]|0)+102868>>2]|0}if((h&2|0)!=0){return}if((c[a>>2]|0)!=2){return}h=a+120|0;g[h>>2]=0.0;e=a+124|0;g[e>>2]=0.0;f=a+128|0;g[f>>2]=0.0;i=+g[d>>2];j=i>0.0?i:1.0;g[a+116>>2]=j;g[h>>2]=1.0/j;i=+g[d+12>>2];do{if(i>0.0){if((b[a+4>>1]&16)<<16>>16!=0){break}l=+g[d+4>>2];m=+g[d+8>>2];n=i-j*(l*l+m*m);g[e>>2]=n;if(n>0.0){o=n}else{aH(5245912,366,5256636,5252324);o=+g[e>>2]}g[f>>2]=1.0/o}}while(0);f=a+44|0;e=c[f+4>>2]|0;o=(c[k>>2]=c[f>>2]|0,+g[k>>2]);j=(c[k>>2]=e,+g[k>>2]);e=d+4|0;d=a+28|0;h=c[e>>2]|0;p=c[e+4>>2]|0;c[d>>2]=h;c[d+4>>2]=p;i=+g[a+24>>2];n=(c[k>>2]=h,+g[k>>2]);m=+g[a+20>>2];l=(c[k>>2]=p,+g[k>>2]);q=+g[a+12>>2]+(i*n-m*l);r=n*m+i*l+ +g[a+16>>2];p=(g[k>>2]=q,c[k>>2]|0);h=0|p;p=(g[k>>2]=r,c[k>>2]|0)|0;c[f>>2]=h;c[f+4>>2]=p;f=a+36|0;c[f>>2]=h;c[f+4>>2]=p;l=+g[a+72>>2];p=a+64|0;g[p>>2]=+g[p>>2]+(r-j)*(-0.0-l);p=a+68|0;g[p>>2]=l*(q-o)+ +g[p>>2];return}function cL(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0;e=a+88|0;f=c[e>>2]|0;h=c[f+102868>>2]|0;if((h&2|0)==0){i=f;j=h}else{aH(5245912,404,5256584,5245880);h=c[e>>2]|0;i=h;j=c[h+102868>>2]|0}if((j&2|0)!=0){return}j=a+12|0;l=+R(+d);g[a+20>>2]=l;m=+Q(+d);g[a+24>>2]=m;h=b;b=j;f=c[h>>2]|0;n=c[h+4>>2]|0;c[b>>2]=f;c[b+4>>2]=n;o=+g[a+28>>2];p=+g[a+32>>2];q=(c[k>>2]=f,+g[k>>2])+(m*o-l*p);r=o*l+m*p+(c[k>>2]=n,+g[k>>2]);n=a+44|0;f=(g[k>>2]=q,c[k>>2]|0);b=0|f;f=(g[k>>2]=r,c[k>>2]|0)|0;c[n>>2]=b;c[n+4>>2]=f;g[a+56>>2]=d;n=a+36|0;c[n>>2]=b;c[n+4>>2]=f;g[a+52>>2]=d;f=i+102872|0;n=c[a+100>>2]|0;if((n|0)==0){s=i}else{i=n;while(1){c1(i,f,j,j);n=c[i+4>>2]|0;if((n|0)==0){break}else{i=n}}s=c[e>>2]|0}e=s+102872|0;cR(e|0,e);return}function cM(a,d){a=a|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;e=a+88|0;if((c[(c[e>>2]|0)+102868>>2]&2|0)!=0){aH(5245912,443,5256384,5245880)}f=a+4|0;g=b[f>>1]|0;if(!((g&32)<<16>>16!=0^d)){return}if(d){b[f>>1]=g|32;d=(c[e>>2]|0)+102872|0;h=c[a+100>>2]|0;if((h|0)==0){return}i=a+12|0;j=h;while(1){h=j+28|0;if((c[h>>2]|0)!=0){aH(5252776,124,5255412,5253080)}k=j+12|0;l=c[k>>2]|0;m=aY[c[(c[l>>2]|0)+12>>2]&2047](l)|0;c[h>>2]=m;L1521:do{if((m|0)>0){l=j+24|0;n=0;while(1){o=c[l>>2]|0;p=o+(n*28&-1)|0;q=c[k>>2]|0;r=p|0;bj[c[(c[q>>2]|0)+24>>2]&2047](q,r,i,n);c[o+(n*28&-1)+24>>2]=bz(d,r,p)|0;c[o+(n*28&-1)+16>>2]=j;c[o+(n*28&-1)+20>>2]=n;o=n+1|0;if((o|0)<(c[h>>2]|0)){n=o}else{break L1521}}}}while(0);h=c[j+4>>2]|0;if((h|0)==0){break}else{j=h}}return}b[f>>1]=g&-33;g=c[e>>2]|0;f=c[a+100>>2]|0;L1528:do{if((f|0)!=0){j=g+102912|0;d=g+102904|0;i=g+102900|0;h=g+102872|0;k=f;while(1){m=k+28|0;L1532:do{if((c[m>>2]|0)>0){n=k+24|0;l=0;while(1){o=(c[n>>2]|0)+(l*28&-1)+24|0;p=c[o>>2]|0;r=c[j>>2]|0;q=0;while(1){if((q|0)>=(r|0)){break}s=(c[d>>2]|0)+(q<<2)|0;if((c[s>>2]|0)==(p|0)){t=1115;break}else{q=q+1|0}}if((t|0)==1115){t=0;c[s>>2]=-1}c[i>>2]=(c[i>>2]|0)-1|0;bP(h,p);c[o>>2]=-1;q=l+1|0;if((q|0)<(c[m>>2]|0)){l=q}else{break L1532}}}}while(0);c[m>>2]=0;l=c[k+4>>2]|0;if((l|0)==0){break L1528}else{k=l}}}}while(0);s=a+112|0;a=c[s>>2]|0;L1544:do{if((a|0)!=0){t=a;while(1){f=c[t+12>>2]|0;cO((c[e>>2]|0)+102872|0,c[t+4>>2]|0);if((f|0)==0){break L1544}else{t=f}}}}while(0);c[s>>2]=0;return}function cN(a){a=a|0;var d=0,e=0,f=0,j=0.0,l=0,m=0;d=i;e=a+8|0;f=c[e>>2]|0;cB(5252168,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5251848,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5251660,(t=i,i=i+4|0,c[t>>2]=c[a>>2]|0,t)|0);j=+g[a+16>>2];cB(5251504,(t=i,i=i+16|0,h[k>>3]=+g[a+12>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);cB(5251224,(t=i,i=i+8|0,h[k>>3]=+g[a+56>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);j=+g[a+68>>2];cB(5251120,(t=i,i=i+16|0,h[k>>3]=+g[a+64>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);cB(5250984,(t=i,i=i+8|0,h[k>>3]=+g[a+72>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5250748,(t=i,i=i+8|0,h[k>>3]=+g[a+132>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5250344,(t=i,i=i+8|0,h[k>>3]=+g[a+136>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);l=a+4|0;cB(5250272,(t=i,i=i+4|0,c[t>>2]=b[l>>1]&4,t)|0);cB(5249916,(t=i,i=i+4|0,c[t>>2]=b[l>>1]&2,t)|0);cB(5249660,(t=i,i=i+4|0,c[t>>2]=b[l>>1]&16,t)|0);cB(5249520,(t=i,i=i+4|0,c[t>>2]=b[l>>1]&8,t)|0);cB(5249176,(t=i,i=i+4|0,c[t>>2]=b[l>>1]&32,t)|0);cB(5248968,(t=i,i=i+8|0,h[k>>3]=+g[a+140>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5248700,(t=i,i=i+4|0,c[t>>2]=c[e>>2]|0,t)|0);cB(5248276,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);e=c[a+100>>2]|0;if((e|0)==0){cB(5251940,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);i=d;return}else{m=e}while(1){cB(5248404,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);c3(m,f);cB(5248280,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);e=c[m+4>>2]|0;if((e|0)==0){break}else{m=e}}cB(5251940,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);i=d;return}function cO(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;d=c[(c[b+48>>2]|0)+8>>2]|0;e=c[(c[b+52>>2]|0)+8>>2]|0;f=c[a+72>>2]|0;do{if((f|0)!=0){if((c[b+4>>2]&2|0)==0){break}aX[c[(c[f>>2]|0)+12>>2]&2047](f,b)}}while(0);f=b+8|0;g=c[f>>2]|0;h=b+12|0;if((g|0)!=0){c[g+12>>2]=c[h>>2]|0}g=c[h>>2]|0;if((g|0)!=0){c[g+8>>2]=c[f>>2]|0}f=a+60|0;if((c[f>>2]|0)==(b|0)){c[f>>2]=c[h>>2]|0}h=b+24|0;f=c[h>>2]|0;g=b+28|0;if((f|0)!=0){c[f+12>>2]=c[g>>2]|0}f=c[g>>2]|0;if((f|0)!=0){c[f+8>>2]=c[h>>2]|0}h=d+112|0;if((b+16|0)==(c[h>>2]|0)){c[h>>2]=c[g>>2]|0}g=b+40|0;h=c[g>>2]|0;d=b+44|0;if((h|0)!=0){c[h+12>>2]=c[d>>2]|0}h=c[d>>2]|0;if((h|0)!=0){c[h+8>>2]=c[g>>2]|0}g=e+112|0;if((b+32|0)!=(c[g>>2]|0)){i=a+76|0;j=c[i>>2]|0;dG(b,j);k=a+64|0;l=c[k>>2]|0;m=l-1|0;c[k>>2]=m;return}c[g>>2]=c[d>>2]|0;i=a+76|0;j=c[i>>2]|0;dG(b,j);k=a+64|0;l=c[k>>2]|0;m=l-1|0;c[k>>2]=m;return}function cP(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=c[a>>2]|0;e=c[b>>2]|0;if((d|0)<(e|0)){f=1;return f|0}if((d|0)!=(e|0)){f=0;return f|0}f=(c[a+4>>2]|0)<(c[b+4>>2]|0);return f|0}function cQ(d){d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;e=c[d+60>>2]|0;if((e|0)==0){return}f=d+12|0;h=d+4|0;i=d+72|0;j=d+68|0;k=e;while(1){e=c[k+48>>2]|0;l=c[k+52>>2]|0;m=c[k+56>>2]|0;n=c[k+60>>2]|0;o=c[e+8>>2]|0;p=c[l+8>>2]|0;q=k+4|0;r=c[q>>2]|0;L1602:do{if((r&8|0)==0){s=1178}else{do{if((c[p>>2]|0)==2){s=1167}else{if((c[o>>2]|0)==2){s=1167;break}else{break}}}while(0);L1606:do{if((s|0)==1167){s=0;t=c[p+108>>2]|0;L1608:do{if((t|0)!=0){u=t;while(1){if((c[u>>2]|0)==(o|0)){if((a[(c[u+4>>2]|0)+61|0]&1)<<24>>24==0){break L1606}}v=c[u+12>>2]|0;if((v|0)==0){break L1608}else{u=v}}}}while(0);t=c[j>>2]|0;do{if((t|0)==0){w=r}else{if(a0[c[(c[t>>2]|0)+8>>2]&2047](t,e,l)|0){w=c[q>>2]|0;break}else{u=c[k+12>>2]|0;cO(d,k);x=u;break L1602}}}while(0);c[q>>2]=w&-9;s=1178;break L1602}}while(0);t=c[k+12>>2]|0;cO(d,k);x=t;break}}while(0);do{if((s|0)==1178){s=0;if((b[o+4>>1]&2)<<16>>16==0){y=0}else{y=(c[o>>2]|0)!=0}if((b[p+4>>1]&2)<<16>>16==0){z=0}else{z=(c[p>>2]|0)!=0}if(!(y|z)){x=c[k+12>>2]|0;break}q=c[(c[e+24>>2]|0)+(m*28&-1)+24>>2]|0;r=c[(c[l+24>>2]|0)+(n*28&-1)+24>>2]|0;do{if((q|0)>-1){if((c[f>>2]|0)>(q|0)){break}else{s=1186;break}}else{s=1186}}while(0);if((s|0)==1186){s=0;aH(5251020,159,5254912,5250596)}t=c[h>>2]|0;do{if((r|0)>-1){if((c[f>>2]|0)>(r|0)){A=t;break}else{s=1189;break}}else{s=1189}}while(0);if((s|0)==1189){s=0;aH(5251020,159,5254912,5250596);A=c[h>>2]|0}if(+g[A+(r*36&-1)>>2]- +g[t+(q*36&-1)+8>>2]>0.0|+g[A+(r*36&-1)+4>>2]- +g[t+(q*36&-1)+12>>2]>0.0|+g[t+(q*36&-1)>>2]- +g[A+(r*36&-1)+8>>2]>0.0|+g[t+(q*36&-1)+4>>2]- +g[A+(r*36&-1)+12>>2]>0.0){u=c[k+12>>2]|0;cO(d,k);x=u;break}else{dH(k,c[i>>2]|0);x=c[k+12>>2]|0;break}}}while(0);if((x|0)==0){break}else{k=x}}return}function cR(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;d=i;i=i+4|0;e=d|0;f=a+52|0;c[f>>2]=0;g=a+40|0;h=c[g>>2]|0;if((h|0)>0){j=a+32|0;k=a+56|0;l=a|0;m=a+12|0;n=a+4|0;o=0;p=h;while(1){h=c[(c[j>>2]|0)+(o<<2)>>2]|0;c[k>>2]=h;if((h|0)==-1){q=p}else{do{if((h|0)>-1){if((c[m>>2]|0)>(h|0)){break}else{r=1201;break}}else{r=1201}}while(0);if((r|0)==1201){r=0;aH(5251020,159,5254912,5250596)}cT(l,a,(c[n>>2]|0)+(h*36&-1)|0);q=c[g>>2]|0}s=o+1|0;if((s|0)<(q|0)){o=s;p=q}else{break}}t=c[f>>2]|0}else{t=0}c[g>>2]=0;g=a+44|0;q=c[g>>2]|0;c[e>>2]=932;cU(q,q+(t*12&-1)|0,e);if((c[f>>2]|0)<=0){i=d;return}e=a+12|0;t=a+4|0;a=0;L1666:while(1){q=c[g>>2]|0;p=q+(a*12&-1)|0;o=c[p>>2]|0;do{if((o|0)>-1){if((c[e>>2]|0)>(o|0)){break}else{r=1209;break}}else{r=1209}}while(0);if((r|0)==1209){r=0;aH(5251020,153,5254864,5250596)}h=c[t>>2]|0;n=c[h+(o*36&-1)+16>>2]|0;l=q+(a*12&-1)+4|0;m=c[l>>2]|0;do{if((m|0)>-1){if((c[e>>2]|0)>(m|0)){u=h;break}else{r=1212;break}}else{r=1212}}while(0);if((r|0)==1212){r=0;aH(5251020,153,5254864,5250596);u=c[t>>2]|0}cS(b,n,c[u+(m*36&-1)+16>>2]|0);h=c[f>>2]|0;q=a;while(1){o=q+1|0;if((o|0)>=(h|0)){break L1666}k=c[g>>2]|0;if((c[k+(o*12&-1)>>2]|0)!=(c[p>>2]|0)){a=o;continue L1666}if((c[k+(o*12&-1)+4>>2]|0)==(c[l>>2]|0)){q=o}else{a=o;continue L1666}}}i=d;return}function cS(d,e,f){d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;h=c[e+16>>2]|0;i=c[f+16>>2]|0;j=c[e+20>>2]|0;e=c[f+20>>2]|0;f=c[h+8>>2]|0;k=c[i+8>>2]|0;if((f|0)==(k|0)){return}l=c[k+112>>2]|0;L1687:do{if((l|0)!=0){m=l;while(1){if((c[m>>2]|0)==(f|0)){n=c[m+4>>2]|0;o=c[n+48>>2]|0;p=c[n+52>>2]|0;q=c[n+56>>2]|0;r=c[n+60>>2]|0;if((o|0)==(h|0)&(p|0)==(i|0)&(q|0)==(j|0)&(r|0)==(e|0)){s=1250;break}if((o|0)==(i|0)&(p|0)==(h|0)&(q|0)==(e|0)&(r|0)==(j|0)){s=1249;break}}r=c[m+12>>2]|0;if((r|0)==0){break L1687}else{m=r}}if((s|0)==1249){return}else if((s|0)==1250){return}}}while(0);do{if((c[k>>2]|0)!=2){if((c[f>>2]|0)==2){break}return}}while(0);s=c[k+108>>2]|0;L1702:do{if((s|0)!=0){k=s;while(1){if((c[k>>2]|0)==(f|0)){if((a[(c[k+4>>2]|0)+61|0]&1)<<24>>24==0){break}}l=c[k+12>>2]|0;if((l|0)==0){break L1702}else{k=l}}return}}while(0);f=c[d+68>>2]|0;do{if((f|0)!=0){if(a0[c[(c[f>>2]|0)+8>>2]&2047](f,h,i)|0){break}return}}while(0);f=dF(h,j,i,e,c[d+76>>2]|0)|0;if((f|0)==0){return}e=c[(c[f+48>>2]|0)+8>>2]|0;i=c[(c[f+52>>2]|0)+8>>2]|0;c[f+8>>2]=0;j=d+60|0;c[f+12>>2]=c[j>>2]|0;h=c[j>>2]|0;if((h|0)!=0){c[h+8>>2]=f}c[j>>2]=f;j=f+16|0;c[f+20>>2]=f;c[j>>2]=i;c[f+24>>2]=0;h=e+112|0;c[f+28>>2]=c[h>>2]|0;s=c[h>>2]|0;if((s|0)!=0){c[s+8>>2]=j}c[h>>2]=j;j=f+32|0;c[f+36>>2]=f;c[j>>2]=e;c[f+40>>2]=0;h=i+112|0;c[f+44>>2]=c[h>>2]|0;f=c[h>>2]|0;if((f|0)!=0){c[f+8>>2]=j}c[h>>2]=j;j=e+4|0;h=b[j>>1]|0;if((h&2)<<16>>16==0){b[j>>1]=h|2;g[e+144>>2]=0.0}e=i+4|0;h=b[e>>1]|0;if((h&2)<<16>>16==0){b[e>>1]=h|2;g[i+144>>2]=0.0}i=d+64|0;c[i>>2]=(c[i>>2]|0)+1|0;return}function cT(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;e=i;i=i+1036|0;f=e|0;h=f+4|0;j=f|0;c[j>>2]=h;k=f+1028|0;c[k>>2]=0;l=f+1032|0;c[l>>2]=256;c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[a>>2]|0;f=(c[k>>2]|0)+1|0;c[k>>2]=f;L1734:do{if((f|0)>0){m=a+4|0;n=d|0;o=d+4|0;p=d+8|0;q=d+12|0;r=b+56|0;s=b+52|0;t=b+48|0;u=b+44|0;v=f;while(1){w=v-1|0;c[k>>2]=w;x=c[j>>2]|0;y=c[x+(w<<2)>>2]|0;do{if((y|0)==-1){z=w}else{A=c[m>>2]|0;if(+g[n>>2]- +g[A+(y*36&-1)+8>>2]>0.0|+g[o>>2]- +g[A+(y*36&-1)+12>>2]>0.0|+g[A+(y*36&-1)>>2]- +g[p>>2]>0.0|+g[A+(y*36&-1)+4>>2]- +g[q>>2]>0.0){z=w;break}B=A+(y*36&-1)+24|0;if((c[B>>2]|0)==-1){C=c[r>>2]|0;if((C|0)==(y|0)){z=w;break}D=c[s>>2]|0;if((D|0)==(c[t>>2]|0)){E=c[u>>2]|0;c[t>>2]=D<<1;F=pi(D*24&-1)|0;c[u>>2]=F;G=E;pq(F,G,(c[s>>2]|0)*12&-1);pj(G);H=c[r>>2]|0;I=c[s>>2]|0}else{H=C;I=D}c[(c[u>>2]|0)+(I*12&-1)>>2]=(H|0)>(y|0)?y:H;D=c[r>>2]|0;c[(c[u>>2]|0)+((c[s>>2]|0)*12&-1)+4>>2]=(D|0)<(y|0)?y:D;c[s>>2]=(c[s>>2]|0)+1|0;z=c[k>>2]|0;break}do{if((w|0)==(c[l>>2]|0)){c[l>>2]=w<<1;D=pi(w<<3)|0;c[j>>2]=D;C=x;pq(D,C,c[k>>2]<<2);if((x|0)==(h|0)){break}pj(C)}}while(0);c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[B>>2]|0;C=(c[k>>2]|0)+1|0;c[k>>2]=C;D=A+(y*36&-1)+28|0;do{if((C|0)==(c[l>>2]|0)){G=c[j>>2]|0;c[l>>2]=C<<1;F=pi(C<<3)|0;c[j>>2]=F;E=G;pq(F,E,c[k>>2]<<2);if((G|0)==(h|0)){break}pj(E)}}while(0);c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[D>>2]|0;C=(c[k>>2]|0)+1|0;c[k>>2]=C;z=C}}while(0);if((z|0)>0){v=z}else{break L1734}}}}while(0);z=c[j>>2]|0;if((z|0)==(h|0)){i=e;return}pj(z);c[j>>2]=0;i=e;return}function cU(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0;e=i;i=i+360|0;f=e|0;g=e+12|0;h=e+24|0;j=e+36|0;k=e+48|0;l=e+168|0;m=e+180|0;n=e+192|0;o=e+204|0;p=e+216|0;q=e+228|0;r=e+240|0;s=e+252|0;t=e+264|0;u=e+276|0;v=e+348|0;w=e+120|0;x=e+132|0;y=e+144|0;z=e+156|0;A=e+288|0;B=e+300|0;C=e+324|0;D=e+336|0;E=e+312|0;F=e+60|0;G=e+72|0;H=e+84|0;I=e+96|0;J=e+108|0;K=a;a=b;L1763:while(1){b=a;L=a-12|0;M=L;N=K;L1765:while(1){O=N;P=b-O|0;Q=(P|0)/12&-1;if((Q|0)==2){R=1280;break L1763}else if((Q|0)==3){R=1282;break L1763}else if((Q|0)==5){R=1291;break L1763}else if((Q|0)==4){R=1290;break L1763}else if((Q|0)==0|(Q|0)==1){R=1372;break L1763}if((P|0)<372){R=1297;break L1763}Q=(P|0)/24&-1;S=N+(Q*12&-1)|0;do{if((P|0)>11988){T=(P|0)/48&-1;U=N+(T*12&-1)|0;V=N+((T+Q|0)*12&-1)|0;T=cV(N,U,S,V,d)|0;if(!(ba[c[d>>2]&2047](L,V)|0)){W=T;break}X=V;c[z>>2]=c[X>>2]|0;c[z+4>>2]=c[X+4>>2]|0;c[z+8>>2]=c[X+8>>2]|0;c[X>>2]=c[M>>2]|0;c[X+4>>2]=c[M+4>>2]|0;c[X+8>>2]=c[M+8>>2]|0;c[M>>2]=c[z>>2]|0;c[M+4>>2]=c[z+4>>2]|0;c[M+8>>2]=c[z+8>>2]|0;if(!(ba[c[d>>2]&2047](V,S)|0)){W=T+1|0;break}V=S;c[x>>2]=c[V>>2]|0;c[x+4>>2]=c[V+4>>2]|0;c[x+8>>2]=c[V+8>>2]|0;c[V>>2]=c[X>>2]|0;c[V+4>>2]=c[X+4>>2]|0;c[V+8>>2]=c[X+8>>2]|0;c[X>>2]=c[x>>2]|0;c[X+4>>2]=c[x+4>>2]|0;c[X+8>>2]=c[x+8>>2]|0;if(!(ba[c[d>>2]&2047](S,U)|0)){W=T+2|0;break}X=U;c[w>>2]=c[X>>2]|0;c[w+4>>2]=c[X+4>>2]|0;c[w+8>>2]=c[X+8>>2]|0;c[X>>2]=c[V>>2]|0;c[X+4>>2]=c[V+4>>2]|0;c[X+8>>2]=c[V+8>>2]|0;c[V>>2]=c[w>>2]|0;c[V+4>>2]=c[w+4>>2]|0;c[V+8>>2]=c[w+8>>2]|0;if(!(ba[c[d>>2]&2047](U,N)|0)){W=T+3|0;break}U=N;c[y>>2]=c[U>>2]|0;c[y+4>>2]=c[U+4>>2]|0;c[y+8>>2]=c[U+8>>2]|0;c[U>>2]=c[X>>2]|0;c[U+4>>2]=c[X+4>>2]|0;c[U+8>>2]=c[X+8>>2]|0;c[X>>2]=c[y>>2]|0;c[X+4>>2]=c[y+4>>2]|0;c[X+8>>2]=c[y+8>>2]|0;W=T+4|0}else{T=ba[c[d>>2]&2047](S,N)|0;X=ba[c[d>>2]&2047](L,S)|0;if(!T){if(!X){W=0;break}T=S;c[J>>2]=c[T>>2]|0;c[J+4>>2]=c[T+4>>2]|0;c[J+8>>2]=c[T+8>>2]|0;c[T>>2]=c[M>>2]|0;c[T+4>>2]=c[M+4>>2]|0;c[T+8>>2]=c[M+8>>2]|0;c[M>>2]=c[J>>2]|0;c[M+4>>2]=c[J+4>>2]|0;c[M+8>>2]=c[J+8>>2]|0;if(!(ba[c[d>>2]&2047](S,N)|0)){W=1;break}U=N;c[H>>2]=c[U>>2]|0;c[H+4>>2]=c[U+4>>2]|0;c[H+8>>2]=c[U+8>>2]|0;c[U>>2]=c[T>>2]|0;c[U+4>>2]=c[T+4>>2]|0;c[U+8>>2]=c[T+8>>2]|0;c[T>>2]=c[H>>2]|0;c[T+4>>2]=c[H+4>>2]|0;c[T+8>>2]=c[H+8>>2]|0;W=2;break}T=N;if(X){c[F>>2]=c[T>>2]|0;c[F+4>>2]=c[T+4>>2]|0;c[F+8>>2]=c[T+8>>2]|0;c[T>>2]=c[M>>2]|0;c[T+4>>2]=c[M+4>>2]|0;c[T+8>>2]=c[M+8>>2]|0;c[M>>2]=c[F>>2]|0;c[M+4>>2]=c[F+4>>2]|0;c[M+8>>2]=c[F+8>>2]|0;W=1;break}c[G>>2]=c[T>>2]|0;c[G+4>>2]=c[T+4>>2]|0;c[G+8>>2]=c[T+8>>2]|0;X=S;c[T>>2]=c[X>>2]|0;c[T+4>>2]=c[X+4>>2]|0;c[T+8>>2]=c[X+8>>2]|0;c[X>>2]=c[G>>2]|0;c[X+4>>2]=c[G+4>>2]|0;c[X+8>>2]=c[G+8>>2]|0;if(!(ba[c[d>>2]&2047](L,S)|0)){W=1;break}c[I>>2]=c[X>>2]|0;c[I+4>>2]=c[X+4>>2]|0;c[I+8>>2]=c[X+8>>2]|0;c[X>>2]=c[M>>2]|0;c[X+4>>2]=c[M+4>>2]|0;c[X+8>>2]=c[M+8>>2]|0;c[M>>2]=c[I>>2]|0;c[M+4>>2]=c[I+4>>2]|0;c[M+8>>2]=c[I+8>>2]|0;W=2}}while(0);do{if(ba[c[d>>2]&2047](N,S)|0){Y=L;Z=W}else{Q=L;while(1){_=Q-12|0;if((N|0)==(_|0)){break}if(ba[c[d>>2]&2047](_,S)|0){R=1339;break}else{Q=_}}if((R|0)==1339){R=0;Q=N;c[E>>2]=c[Q>>2]|0;c[E+4>>2]=c[Q+4>>2]|0;c[E+8>>2]=c[Q+8>>2]|0;P=_;c[Q>>2]=c[P>>2]|0;c[Q+4>>2]=c[P+4>>2]|0;c[Q+8>>2]=c[P+8>>2]|0;c[P>>2]=c[E>>2]|0;c[P+4>>2]=c[E+4>>2]|0;c[P+8>>2]=c[E+8>>2]|0;Y=_;Z=W+1|0;break}P=N+12|0;if(ba[c[d>>2]&2047](N,L)|0){$=P}else{Q=P;while(1){if((Q|0)==(L|0)){R=1366;break L1763}aa=Q+12|0;if(ba[c[d>>2]&2047](N,Q)|0){break}else{Q=aa}}P=Q;c[D>>2]=c[P>>2]|0;c[D+4>>2]=c[P+4>>2]|0;c[D+8>>2]=c[P+8>>2]|0;c[P>>2]=c[M>>2]|0;c[P+4>>2]=c[M+4>>2]|0;c[P+8>>2]=c[M+8>>2]|0;c[M>>2]=c[D>>2]|0;c[M+4>>2]=c[D+4>>2]|0;c[M+8>>2]=c[D+8>>2]|0;$=aa}if(($|0)==(L|0)){R=1371;break L1763}else{ab=L;ac=$}while(1){P=ac;while(1){ad=P+12|0;if(ba[c[d>>2]&2047](N,P)|0){ae=ab;break}else{P=ad}}while(1){af=ae-12|0;if(ba[c[d>>2]&2047](N,af)|0){ae=af}else{break}}if(P>>>0>=af>>>0){N=P;continue L1765}X=P;c[C>>2]=c[X>>2]|0;c[C+4>>2]=c[X+4>>2]|0;c[C+8>>2]=c[X+8>>2]|0;T=af;c[X>>2]=c[T>>2]|0;c[X+4>>2]=c[T+4>>2]|0;c[X+8>>2]=c[T+8>>2]|0;c[T>>2]=c[C>>2]|0;c[T+4>>2]=c[C+4>>2]|0;c[T+8>>2]=c[C+8>>2]|0;ab=af;ac=ad}}}while(0);Q=N+12|0;L1808:do{if(Q>>>0<Y>>>0){T=Y;X=Q;U=Z;V=S;while(1){ag=X;while(1){ah=ag+12|0;if(ba[c[d>>2]&2047](ag,V)|0){ag=ah}else{ai=T;break}}while(1){aj=ai-12|0;if(ba[c[d>>2]&2047](aj,V)|0){break}else{ai=aj}}if(ag>>>0>aj>>>0){ak=ag;al=U;am=V;break L1808}P=ag;c[B>>2]=c[P>>2]|0;c[B+4>>2]=c[P+4>>2]|0;c[B+8>>2]=c[P+8>>2]|0;an=aj;c[P>>2]=c[an>>2]|0;c[P+4>>2]=c[an+4>>2]|0;c[P+8>>2]=c[an+8>>2]|0;c[an>>2]=c[B>>2]|0;c[an+4>>2]=c[B+4>>2]|0;c[an+8>>2]=c[B+8>>2]|0;T=aj;X=ah;U=U+1|0;V=(V|0)==(ag|0)?aj:V}}else{ak=Q;al=Z;am=S}}while(0);do{if((ak|0)==(am|0)){ao=al}else{if(!(ba[c[d>>2]&2047](am,ak)|0)){ao=al;break}S=ak;c[A>>2]=c[S>>2]|0;c[A+4>>2]=c[S+4>>2]|0;c[A+8>>2]=c[S+8>>2]|0;Q=am;c[S>>2]=c[Q>>2]|0;c[S+4>>2]=c[Q+4>>2]|0;c[S+8>>2]=c[Q+8>>2]|0;c[Q>>2]=c[A>>2]|0;c[Q+4>>2]=c[A+4>>2]|0;c[Q+8>>2]=c[A+8>>2]|0;ao=al+1|0}}while(0);if((ao|0)==0){ap=c_(N,ak,d)|0;Q=ak+12|0;if(c_(Q,a,d)|0){R=1351;break}if(ap){N=Q;continue}}Q=ak;if((Q-O|0)>=(b-Q|0)){R=1355;break}cU(N,ak,d);N=ak+12|0}if((R|0)==1355){R=0;cU(ak+12|0,a,d);K=N;a=ak;continue}else if((R|0)==1351){R=0;if(ap){R=1370;break}else{K=N;a=ak;continue}}}if((R|0)==1280){if(!(ba[c[d>>2]&2047](L,N)|0)){i=e;return}ak=v;v=N;c[ak>>2]=c[v>>2]|0;c[ak+4>>2]=c[v+4>>2]|0;c[ak+8>>2]=c[v+8>>2]|0;c[v>>2]=c[M>>2]|0;c[v+4>>2]=c[M+4>>2]|0;c[v+8>>2]=c[M+8>>2]|0;c[M>>2]=c[ak>>2]|0;c[M+4>>2]=c[ak+4>>2]|0;c[M+8>>2]=c[ak+8>>2]|0;i=e;return}else if((R|0)==1282){ak=N+12|0;v=q;q=r;r=s;s=t;t=u;u=ba[c[d>>2]&2047](ak,N)|0;K=ba[c[d>>2]&2047](L,ak)|0;if(!u){if(!K){i=e;return}u=ak;c[t>>2]=c[u>>2]|0;c[t+4>>2]=c[u+4>>2]|0;c[t+8>>2]=c[u+8>>2]|0;c[u>>2]=c[M>>2]|0;c[u+4>>2]=c[M+4>>2]|0;c[u+8>>2]=c[M+8>>2]|0;c[M>>2]=c[t>>2]|0;c[M+4>>2]=c[t+4>>2]|0;c[M+8>>2]=c[t+8>>2]|0;if(!(ba[c[d>>2]&2047](ak,N)|0)){i=e;return}t=N;c[r>>2]=c[t>>2]|0;c[r+4>>2]=c[t+4>>2]|0;c[r+8>>2]=c[t+8>>2]|0;c[t>>2]=c[u>>2]|0;c[t+4>>2]=c[u+4>>2]|0;c[t+8>>2]=c[u+8>>2]|0;c[u>>2]=c[r>>2]|0;c[u+4>>2]=c[r+4>>2]|0;c[u+8>>2]=c[r+8>>2]|0;i=e;return}r=N;if(K){c[v>>2]=c[r>>2]|0;c[v+4>>2]=c[r+4>>2]|0;c[v+8>>2]=c[r+8>>2]|0;c[r>>2]=c[M>>2]|0;c[r+4>>2]=c[M+4>>2]|0;c[r+8>>2]=c[M+8>>2]|0;c[M>>2]=c[v>>2]|0;c[M+4>>2]=c[v+4>>2]|0;c[M+8>>2]=c[v+8>>2]|0;i=e;return}c[q>>2]=c[r>>2]|0;c[q+4>>2]=c[r+4>>2]|0;c[q+8>>2]=c[r+8>>2]|0;v=ak;c[r>>2]=c[v>>2]|0;c[r+4>>2]=c[v+4>>2]|0;c[r+8>>2]=c[v+8>>2]|0;c[v>>2]=c[q>>2]|0;c[v+4>>2]=c[q+4>>2]|0;c[v+8>>2]=c[q+8>>2]|0;if(!(ba[c[d>>2]&2047](L,ak)|0)){i=e;return}c[s>>2]=c[v>>2]|0;c[s+4>>2]=c[v+4>>2]|0;c[s+8>>2]=c[v+8>>2]|0;c[v>>2]=c[M>>2]|0;c[v+4>>2]=c[M+4>>2]|0;c[v+8>>2]=c[M+8>>2]|0;c[M>>2]=c[s>>2]|0;c[M+4>>2]=c[s+4>>2]|0;c[M+8>>2]=c[s+8>>2]|0;i=e;return}else if((R|0)==1291){s=N+12|0;v=N+24|0;ak=N+36|0;q=m;m=n;n=o;o=p;cV(N,s,v,ak,d);if(!(ba[c[d>>2]&2047](L,ak)|0)){i=e;return}p=ak;c[o>>2]=c[p>>2]|0;c[o+4>>2]=c[p+4>>2]|0;c[o+8>>2]=c[p+8>>2]|0;c[p>>2]=c[M>>2]|0;c[p+4>>2]=c[M+4>>2]|0;c[p+8>>2]=c[M+8>>2]|0;c[M>>2]=c[o>>2]|0;c[M+4>>2]=c[o+4>>2]|0;c[M+8>>2]=c[o+8>>2]|0;if(!(ba[c[d>>2]&2047](ak,v)|0)){i=e;return}ak=v;c[m>>2]=c[ak>>2]|0;c[m+4>>2]=c[ak+4>>2]|0;c[m+8>>2]=c[ak+8>>2]|0;c[ak>>2]=c[p>>2]|0;c[ak+4>>2]=c[p+4>>2]|0;c[ak+8>>2]=c[p+8>>2]|0;c[p>>2]=c[m>>2]|0;c[p+4>>2]=c[m+4>>2]|0;c[p+8>>2]=c[m+8>>2]|0;if(!(ba[c[d>>2]&2047](v,s)|0)){i=e;return}v=s;c[q>>2]=c[v>>2]|0;c[q+4>>2]=c[v+4>>2]|0;c[q+8>>2]=c[v+8>>2]|0;c[v>>2]=c[ak>>2]|0;c[v+4>>2]=c[ak+4>>2]|0;c[v+8>>2]=c[ak+8>>2]|0;c[ak>>2]=c[q>>2]|0;c[ak+4>>2]=c[q+4>>2]|0;c[ak+8>>2]=c[q+8>>2]|0;if(!(ba[c[d>>2]&2047](s,N)|0)){i=e;return}s=N;c[n>>2]=c[s>>2]|0;c[n+4>>2]=c[s+4>>2]|0;c[n+8>>2]=c[s+8>>2]|0;c[s>>2]=c[v>>2]|0;c[s+4>>2]=c[v+4>>2]|0;c[s+8>>2]=c[v+8>>2]|0;c[v>>2]=c[n>>2]|0;c[v+4>>2]=c[n+4>>2]|0;c[v+8>>2]=c[n+8>>2]|0;i=e;return}else if((R|0)==1290){cV(N,N+12|0,N+24|0,L,d);i=e;return}else if((R|0)==1297){L=l;n=N+24|0;v=N+12|0;s=f;f=g;g=h;h=j;j=k;k=ba[c[d>>2]&2047](v,N)|0;q=ba[c[d>>2]&2047](n,v)|0;do{if(k){ak=N;if(q){c[s>>2]=c[ak>>2]|0;c[s+4>>2]=c[ak+4>>2]|0;c[s+8>>2]=c[ak+8>>2]|0;m=n;c[ak>>2]=c[m>>2]|0;c[ak+4>>2]=c[m+4>>2]|0;c[ak+8>>2]=c[m+8>>2]|0;c[m>>2]=c[s>>2]|0;c[m+4>>2]=c[s+4>>2]|0;c[m+8>>2]=c[s+8>>2]|0;break}c[f>>2]=c[ak>>2]|0;c[f+4>>2]=c[ak+4>>2]|0;c[f+8>>2]=c[ak+8>>2]|0;m=v;c[ak>>2]=c[m>>2]|0;c[ak+4>>2]=c[m+4>>2]|0;c[ak+8>>2]=c[m+8>>2]|0;c[m>>2]=c[f>>2]|0;c[m+4>>2]=c[f+4>>2]|0;c[m+8>>2]=c[f+8>>2]|0;if(!(ba[c[d>>2]&2047](n,v)|0)){break}c[h>>2]=c[m>>2]|0;c[h+4>>2]=c[m+4>>2]|0;c[h+8>>2]=c[m+8>>2]|0;ak=n;c[m>>2]=c[ak>>2]|0;c[m+4>>2]=c[ak+4>>2]|0;c[m+8>>2]=c[ak+8>>2]|0;c[ak>>2]=c[h>>2]|0;c[ak+4>>2]=c[h+4>>2]|0;c[ak+8>>2]=c[h+8>>2]|0}else{if(!q){break}ak=v;c[j>>2]=c[ak>>2]|0;c[j+4>>2]=c[ak+4>>2]|0;c[j+8>>2]=c[ak+8>>2]|0;m=n;c[ak>>2]=c[m>>2]|0;c[ak+4>>2]=c[m+4>>2]|0;c[ak+8>>2]=c[m+8>>2]|0;c[m>>2]=c[j>>2]|0;c[m+4>>2]=c[j+4>>2]|0;c[m+8>>2]=c[j+8>>2]|0;if(!(ba[c[d>>2]&2047](v,N)|0)){break}m=N;c[g>>2]=c[m>>2]|0;c[g+4>>2]=c[m+4>>2]|0;c[g+8>>2]=c[m+8>>2]|0;c[m>>2]=c[ak>>2]|0;c[m+4>>2]=c[ak+4>>2]|0;c[m+8>>2]=c[ak+8>>2]|0;c[ak>>2]=c[g>>2]|0;c[ak+4>>2]=c[g+4>>2]|0;c[ak+8>>2]=c[g+8>>2]|0}}while(0);g=N+36|0;if((g|0)==(a|0)){i=e;return}else{aq=n;ar=g}while(1){if(ba[c[d>>2]&2047](ar,aq)|0){g=ar;c[L>>2]=c[g>>2]|0;c[L+4>>2]=c[g+4>>2]|0;c[L+8>>2]=c[g+8>>2]|0;g=aq;n=ar;while(1){v=n;as=g;c[v>>2]=c[as>>2]|0;c[v+4>>2]=c[as+4>>2]|0;c[v+8>>2]=c[as+8>>2]|0;if((g|0)==(N|0)){break}v=g-12|0;if(ba[c[d>>2]&2047](l,v)|0){n=g;g=v}else{break}}c[as>>2]=c[L>>2]|0;c[as+4>>2]=c[L+4>>2]|0;c[as+8>>2]=c[L+8>>2]|0}g=ar+12|0;if((g|0)==(a|0)){break}else{aq=ar;ar=g}}i=e;return}else if((R|0)==1366){i=e;return}else if((R|0)==1370){i=e;return}else if((R|0)==1371){i=e;return}else if((R|0)==1372){i=e;return}}function cV(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;i=i+96|0;h=g+60|0;j=g+72|0;k=g+84|0;l=g|0;m=g+12|0;n=g+24|0;o=g+36|0;p=g+48|0;q=ba[c[f>>2]&2047](b,a)|0;r=ba[c[f>>2]&2047](d,b)|0;do{if(q){s=a;if(r){c[l>>2]=c[s>>2]|0;c[l+4>>2]=c[s+4>>2]|0;c[l+8>>2]=c[s+8>>2]|0;t=d;c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;c[t>>2]=c[l>>2]|0;c[t+4>>2]=c[l+4>>2]|0;c[t+8>>2]=c[l+8>>2]|0;u=1;break}c[m>>2]=c[s>>2]|0;c[m+4>>2]=c[s+4>>2]|0;c[m+8>>2]=c[s+8>>2]|0;t=b;c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;c[t>>2]=c[m>>2]|0;c[t+4>>2]=c[m+4>>2]|0;c[t+8>>2]=c[m+8>>2]|0;if(!(ba[c[f>>2]&2047](d,b)|0)){u=1;break}c[o>>2]=c[t>>2]|0;c[o+4>>2]=c[t+4>>2]|0;c[o+8>>2]=c[t+8>>2]|0;s=d;c[t>>2]=c[s>>2]|0;c[t+4>>2]=c[s+4>>2]|0;c[t+8>>2]=c[s+8>>2]|0;c[s>>2]=c[o>>2]|0;c[s+4>>2]=c[o+4>>2]|0;c[s+8>>2]=c[o+8>>2]|0;u=2}else{if(!r){u=0;break}s=b;c[p>>2]=c[s>>2]|0;c[p+4>>2]=c[s+4>>2]|0;c[p+8>>2]=c[s+8>>2]|0;t=d;c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;c[t>>2]=c[p>>2]|0;c[t+4>>2]=c[p+4>>2]|0;c[t+8>>2]=c[p+8>>2]|0;if(!(ba[c[f>>2]&2047](b,a)|0)){u=1;break}t=a;c[n>>2]=c[t>>2]|0;c[n+4>>2]=c[t+4>>2]|0;c[n+8>>2]=c[t+8>>2]|0;c[t>>2]=c[s>>2]|0;c[t+4>>2]=c[s+4>>2]|0;c[t+8>>2]=c[s+8>>2]|0;c[s>>2]=c[n>>2]|0;c[s+4>>2]=c[n+4>>2]|0;c[s+8>>2]=c[n+8>>2]|0;u=2}}while(0);if(!(ba[c[f>>2]&2047](e,d)|0)){v=u;i=g;return v|0}n=k;k=d;c[n>>2]=c[k>>2]|0;c[n+4>>2]=c[k+4>>2]|0;c[n+8>>2]=c[k+8>>2]|0;p=e;c[k>>2]=c[p>>2]|0;c[k+4>>2]=c[p+4>>2]|0;c[k+8>>2]=c[p+8>>2]|0;c[p>>2]=c[n>>2]|0;c[p+4>>2]=c[n+4>>2]|0;c[p+8>>2]=c[n+8>>2]|0;if(!(ba[c[f>>2]&2047](d,b)|0)){v=u+1|0;i=g;return v|0}d=h;h=b;c[d>>2]=c[h>>2]|0;c[d+4>>2]=c[h+4>>2]|0;c[d+8>>2]=c[h+8>>2]|0;c[h>>2]=c[k>>2]|0;c[h+4>>2]=c[k+4>>2]|0;c[h+8>>2]=c[k+8>>2]|0;c[k>>2]=c[d>>2]|0;c[k+4>>2]=c[d+4>>2]|0;c[k+8>>2]=c[d+8>>2]|0;if(!(ba[c[f>>2]&2047](b,a)|0)){v=u+2|0;i=g;return v|0}b=j;j=a;c[b>>2]=c[j>>2]|0;c[b+4>>2]=c[j+4>>2]|0;c[b+8>>2]=c[j+8>>2]|0;c[j>>2]=c[h>>2]|0;c[j+4>>2]=c[h+4>>2]|0;c[j+8>>2]=c[h+8>>2]|0;c[h>>2]=c[b>>2]|0;c[h+4>>2]=c[b+4>>2]|0;c[h+8>>2]=c[b+8>>2]|0;v=u+3|0;i=g;return v|0}function cW(a,b){a=a|0;b=b|0;return}function cX(a,b){a=a|0;b=b|0;return}function cY(a,b,c){a=a|0;b=b|0;c=c|0;return}function cZ(a,b,c){a=a|0;b=b|0;c=c|0;return}function c_(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;e=i;i=i+192|0;f=e|0;g=e+12|0;h=e+24|0;j=e+36|0;k=e+48|0;l=e+60|0;m=e+72|0;n=e+84|0;o=e+96|0;p=e+108|0;q=e+120|0;r=e+132|0;s=e+144|0;t=e+156|0;u=e+168|0;v=e+180|0;w=(b-a|0)/12&-1;if((w|0)==2){x=b-12|0;if(!(ba[c[d>>2]&2047](x,a)|0)){y=1;i=e;return y|0}z=u;u=a;c[z>>2]=c[u>>2]|0;c[z+4>>2]=c[u+4>>2]|0;c[z+8>>2]=c[u+8>>2]|0;A=x;c[u>>2]=c[A>>2]|0;c[u+4>>2]=c[A+4>>2]|0;c[u+8>>2]=c[A+8>>2]|0;c[A>>2]=c[z>>2]|0;c[A+4>>2]=c[z+4>>2]|0;c[A+8>>2]=c[z+8>>2]|0;y=1;i=e;return y|0}else if((w|0)==0|(w|0)==1){y=1;i=e;return y|0}else if((w|0)==3){z=a+12|0;A=b-12|0;u=p;p=q;q=r;r=s;s=t;t=ba[c[d>>2]&2047](z,a)|0;x=ba[c[d>>2]&2047](A,z)|0;if(!t){if(!x){y=1;i=e;return y|0}t=z;c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;B=A;c[t>>2]=c[B>>2]|0;c[t+4>>2]=c[B+4>>2]|0;c[t+8>>2]=c[B+8>>2]|0;c[B>>2]=c[s>>2]|0;c[B+4>>2]=c[s+4>>2]|0;c[B+8>>2]=c[s+8>>2]|0;if(!(ba[c[d>>2]&2047](z,a)|0)){y=1;i=e;return y|0}s=a;c[q>>2]=c[s>>2]|0;c[q+4>>2]=c[s+4>>2]|0;c[q+8>>2]=c[s+8>>2]|0;c[s>>2]=c[t>>2]|0;c[s+4>>2]=c[t+4>>2]|0;c[s+8>>2]=c[t+8>>2]|0;c[t>>2]=c[q>>2]|0;c[t+4>>2]=c[q+4>>2]|0;c[t+8>>2]=c[q+8>>2]|0;y=1;i=e;return y|0}q=a;if(x){c[u>>2]=c[q>>2]|0;c[u+4>>2]=c[q+4>>2]|0;c[u+8>>2]=c[q+8>>2]|0;x=A;c[q>>2]=c[x>>2]|0;c[q+4>>2]=c[x+4>>2]|0;c[q+8>>2]=c[x+8>>2]|0;c[x>>2]=c[u>>2]|0;c[x+4>>2]=c[u+4>>2]|0;c[x+8>>2]=c[u+8>>2]|0;y=1;i=e;return y|0}c[p>>2]=c[q>>2]|0;c[p+4>>2]=c[q+4>>2]|0;c[p+8>>2]=c[q+8>>2]|0;u=z;c[q>>2]=c[u>>2]|0;c[q+4>>2]=c[u+4>>2]|0;c[q+8>>2]=c[u+8>>2]|0;c[u>>2]=c[p>>2]|0;c[u+4>>2]=c[p+4>>2]|0;c[u+8>>2]=c[p+8>>2]|0;if(!(ba[c[d>>2]&2047](A,z)|0)){y=1;i=e;return y|0}c[r>>2]=c[u>>2]|0;c[r+4>>2]=c[u+4>>2]|0;c[r+8>>2]=c[u+8>>2]|0;z=A;c[u>>2]=c[z>>2]|0;c[u+4>>2]=c[z+4>>2]|0;c[u+8>>2]=c[z+8>>2]|0;c[z>>2]=c[r>>2]|0;c[z+4>>2]=c[r+4>>2]|0;c[z+8>>2]=c[r+8>>2]|0;y=1;i=e;return y|0}else if((w|0)==5){r=a+12|0;z=a+24|0;u=a+36|0;A=b-12|0;p=l;l=m;m=n;n=o;cV(a,r,z,u,d);if(!(ba[c[d>>2]&2047](A,u)|0)){y=1;i=e;return y|0}o=u;c[n>>2]=c[o>>2]|0;c[n+4>>2]=c[o+4>>2]|0;c[n+8>>2]=c[o+8>>2]|0;q=A;c[o>>2]=c[q>>2]|0;c[o+4>>2]=c[q+4>>2]|0;c[o+8>>2]=c[q+8>>2]|0;c[q>>2]=c[n>>2]|0;c[q+4>>2]=c[n+4>>2]|0;c[q+8>>2]=c[n+8>>2]|0;if(!(ba[c[d>>2]&2047](u,z)|0)){y=1;i=e;return y|0}u=z;c[l>>2]=c[u>>2]|0;c[l+4>>2]=c[u+4>>2]|0;c[l+8>>2]=c[u+8>>2]|0;c[u>>2]=c[o>>2]|0;c[u+4>>2]=c[o+4>>2]|0;c[u+8>>2]=c[o+8>>2]|0;c[o>>2]=c[l>>2]|0;c[o+4>>2]=c[l+4>>2]|0;c[o+8>>2]=c[l+8>>2]|0;if(!(ba[c[d>>2]&2047](z,r)|0)){y=1;i=e;return y|0}z=r;c[p>>2]=c[z>>2]|0;c[p+4>>2]=c[z+4>>2]|0;c[p+8>>2]=c[z+8>>2]|0;c[z>>2]=c[u>>2]|0;c[z+4>>2]=c[u+4>>2]|0;c[z+8>>2]=c[u+8>>2]|0;c[u>>2]=c[p>>2]|0;c[u+4>>2]=c[p+4>>2]|0;c[u+8>>2]=c[p+8>>2]|0;if(!(ba[c[d>>2]&2047](r,a)|0)){y=1;i=e;return y|0}r=a;c[m>>2]=c[r>>2]|0;c[m+4>>2]=c[r+4>>2]|0;c[m+8>>2]=c[r+8>>2]|0;c[r>>2]=c[z>>2]|0;c[r+4>>2]=c[z+4>>2]|0;c[r+8>>2]=c[z+8>>2]|0;c[z>>2]=c[m>>2]|0;c[z+4>>2]=c[m+4>>2]|0;c[z+8>>2]=c[m+8>>2]|0;y=1;i=e;return y|0}else if((w|0)==4){cV(a,a+12|0,a+24|0,b-12|0,d);y=1;i=e;return y|0}else{w=a+24|0;m=a+12|0;z=f;f=g;g=h;h=j;j=k;k=ba[c[d>>2]&2047](m,a)|0;r=ba[c[d>>2]&2047](w,m)|0;do{if(k){p=a;if(r){c[z>>2]=c[p>>2]|0;c[z+4>>2]=c[p+4>>2]|0;c[z+8>>2]=c[p+8>>2]|0;u=w;c[p>>2]=c[u>>2]|0;c[p+4>>2]=c[u+4>>2]|0;c[p+8>>2]=c[u+8>>2]|0;c[u>>2]=c[z>>2]|0;c[u+4>>2]=c[z+4>>2]|0;c[u+8>>2]=c[z+8>>2]|0;break}c[f>>2]=c[p>>2]|0;c[f+4>>2]=c[p+4>>2]|0;c[f+8>>2]=c[p+8>>2]|0;u=m;c[p>>2]=c[u>>2]|0;c[p+4>>2]=c[u+4>>2]|0;c[p+8>>2]=c[u+8>>2]|0;c[u>>2]=c[f>>2]|0;c[u+4>>2]=c[f+4>>2]|0;c[u+8>>2]=c[f+8>>2]|0;if(!(ba[c[d>>2]&2047](w,m)|0)){break}c[h>>2]=c[u>>2]|0;c[h+4>>2]=c[u+4>>2]|0;c[h+8>>2]=c[u+8>>2]|0;p=w;c[u>>2]=c[p>>2]|0;c[u+4>>2]=c[p+4>>2]|0;c[u+8>>2]=c[p+8>>2]|0;c[p>>2]=c[h>>2]|0;c[p+4>>2]=c[h+4>>2]|0;c[p+8>>2]=c[h+8>>2]|0}else{if(!r){break}p=m;c[j>>2]=c[p>>2]|0;c[j+4>>2]=c[p+4>>2]|0;c[j+8>>2]=c[p+8>>2]|0;u=w;c[p>>2]=c[u>>2]|0;c[p+4>>2]=c[u+4>>2]|0;c[p+8>>2]=c[u+8>>2]|0;c[u>>2]=c[j>>2]|0;c[u+4>>2]=c[j+4>>2]|0;c[u+8>>2]=c[j+8>>2]|0;if(!(ba[c[d>>2]&2047](m,a)|0)){break}u=a;c[g>>2]=c[u>>2]|0;c[g+4>>2]=c[u+4>>2]|0;c[g+8>>2]=c[u+8>>2]|0;c[u>>2]=c[p>>2]|0;c[u+4>>2]=c[p+4>>2]|0;c[u+8>>2]=c[p+8>>2]|0;c[p>>2]=c[g>>2]|0;c[p+4>>2]=c[g+4>>2]|0;c[p+8>>2]=c[g+8>>2]|0}}while(0);g=a+36|0;if((g|0)==(b|0)){y=1;i=e;return y|0}m=v;j=w;w=0;r=g;while(1){if(ba[c[d>>2]&2047](r,j)|0){g=r;c[m>>2]=c[g>>2]|0;c[m+4>>2]=c[g+4>>2]|0;c[m+8>>2]=c[g+8>>2]|0;g=j;h=r;while(1){f=h;C=g;c[f>>2]=c[C>>2]|0;c[f+4>>2]=c[C+4>>2]|0;c[f+8>>2]=c[C+8>>2]|0;if((g|0)==(a|0)){break}f=g-12|0;if(ba[c[d>>2]&2047](v,f)|0){h=g;g=f}else{break}}c[C>>2]=c[m>>2]|0;c[C+4>>2]=c[m+4>>2]|0;c[C+8>>2]=c[m+8>>2]|0;g=w+1|0;if((g|0)==8){break}else{D=g}}else{D=w}g=r+12|0;if((g|0)==(b|0)){y=1;E=1449;break}else{j=r;w=D;r=g}}if((E|0)==1449){i=e;return y|0}y=(r+12|0)==(b|0);i=e;return y|0}return 0}function c$(a){a=a|0;pl(a);return}function c0(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;if((c[b+28>>2]|0)!=0){aH(5252776,72,5255368,5253080)}e=b+12|0;f=c[e>>2]|0;g=aY[c[(c[f>>2]|0)+12>>2]&2047](f)|0;f=b+24|0;b=c[f>>2]|0;h=b;i=g*28&-1;L1998:do{if((i|0)!=0){do{if((i|0)>0){if((i|0)<=640){break}pj(h);break L1998}else{aH(5246516,164,5257772,5249204)}}while(0);g=a[i+5261540|0]|0;if((g&255)>=14){aH(5246516,173,5257772,5247588)}j=d+12+((g&255)<<2)|0;c[b>>2]=c[j>>2]|0;c[j>>2]=b}}while(0);c[f>>2]=0;f=c[e>>2]|0;b=c[f+4>>2]|0;if((b|0)==2){aW[c[c[f>>2]>>2]&2047](f);i=a[5261692]|0;if((i&255)>=14){aH(5246516,173,5257772,5247588)}h=d+12+((i&255)<<2)|0;c[f>>2]=c[h>>2]|0;c[h>>2]=f;c[e>>2]=0;return}else if((b|0)==0){aW[c[c[f>>2]>>2]&2047](f);h=a[5261560]|0;if((h&255)>=14){aH(5246516,173,5257772,5247588)}i=d+12+((h&255)<<2)|0;c[f>>2]=c[i>>2]|0;c[i>>2]=f;c[e>>2]=0;return}else if((b|0)==3){aW[c[c[f>>2]>>2]&2047](f);i=a[5261580]|0;if((i&255)>=14){aH(5246516,173,5257772,5247588)}h=d+12+((i&255)<<2)|0;c[f>>2]=c[h>>2]|0;c[h>>2]=f;c[e>>2]=0;return}else if((b|0)==1){aW[c[c[f>>2]>>2]&2047](f);b=a[5261588]|0;if((b&255)>=14){aH(5246516,173,5257772,5247588)}h=d+12+((b&255)<<2)|0;c[f>>2]=c[h>>2]|0;c[h>>2]=f;c[e>>2]=0;return}else{aH(5252776,115,5255368,5252172);c[e>>2]=0;return}}function c1(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0.0,K=0.0,L=0.0,M=0.0,N=0,O=0,P=0;f=i;i=i+40|0;h=f|0;j=f+16|0;l=f+32|0;m=a+28|0;if((c[m>>2]|0)<=0){i=f;return}n=a+24|0;o=a+12|0;a=h|0;p=j|0;q=h+4|0;r=j+4|0;s=h+8|0;t=j+8|0;u=h+12|0;v=j+12|0;w=e|0;x=d|0;y=e+4|0;z=d+4|0;A=l|0;B=l+4|0;C=b|0;D=b+40|0;E=b+36|0;F=b+32|0;b=0;while(1){G=c[n>>2]|0;H=c[o>>2]|0;I=G+(b*28&-1)+20|0;bj[c[(c[H>>2]|0)+24>>2]&2047](H,h,d,c[I>>2]|0);H=c[o>>2]|0;bj[c[(c[H>>2]|0)+24>>2]&2047](H,j,e,c[I>>2]|0);I=G+(b*28&-1)|0;J=+g[a>>2];K=+g[p>>2];L=+g[q>>2];M=+g[r>>2];H=I;N=(g[k>>2]=J<K?J:K,c[k>>2]|0);O=(g[k>>2]=L<M?L:M,c[k>>2]|0)|0;c[H>>2]=0|N;c[H+4>>2]=O;M=+g[s>>2];L=+g[t>>2];K=+g[u>>2];J=+g[v>>2];O=G+(b*28&-1)+8|0;H=(g[k>>2]=M>L?M:L,c[k>>2]|0);N=(g[k>>2]=K>J?K:J,c[k>>2]|0)|0;c[O>>2]=0|H;c[O+4>>2]=N;J=+g[y>>2]- +g[z>>2];g[A>>2]=+g[w>>2]- +g[x>>2];g[B>>2]=J;N=c[G+(b*28&-1)+24>>2]|0;if(bR(C,N,I,l)|0){I=c[D>>2]|0;if((I|0)==(c[E>>2]|0)){G=c[F>>2]|0;c[E>>2]=I<<1;O=pi(I<<3)|0;c[F>>2]=O;H=G;pq(O,H,c[D>>2]<<2);pj(H);P=c[D>>2]|0}else{P=I}c[(c[F>>2]|0)+(P<<2)>>2]=N;c[D>>2]=(c[D>>2]|0)+1|0}N=b+1|0;if((N|0)<(c[m>>2]|0)){b=N}else{break}}i=f;return}function c2(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;b=a+8|0;d=c[b>>2]|0;if((d|0)==0){return}e=c[d+112>>2]|0;if((e|0)==0){f=d}else{d=e;while(1){e=c[d+4>>2]|0;if((c[e+48>>2]|0)==(a|0)|(c[e+52>>2]|0)==(a|0)){g=e+4|0;c[g>>2]=c[g>>2]|8}g=c[d+12>>2]|0;if((g|0)==0){break}else{d=g}}f=c[b>>2]|0}b=c[f+88>>2]|0;if((b|0)==0){return}f=a+28|0;if((c[f>>2]|0)<=0){return}d=a+24|0;a=b+102912|0;g=b+102908|0;e=b+102904|0;b=0;h=c[a>>2]|0;while(1){i=c[(c[d>>2]|0)+(b*28&-1)+24>>2]|0;if((h|0)==(c[g>>2]|0)){j=c[e>>2]|0;c[g>>2]=h<<1;k=pi(h<<3)|0;c[e>>2]=k;l=j;pq(k,l,c[a>>2]<<2);pj(l);m=c[a>>2]|0}else{m=h}c[(c[e>>2]|0)+(m<<2)>>2]=i;i=(c[a>>2]|0)+1|0;c[a>>2]=i;l=b+1|0;if((l|0)<(c[f>>2]|0)){b=l;h=i}else{break}}return}function c3(d,f){d=d|0;f=f|0;var j=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0,u=0,v=0,w=0;j=i;cB(5248252,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5247420,(t=i,i=i+8|0,h[k>>3]=+g[d+16>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5246916,(t=i,i=i+8|0,h[k>>3]=+g[d+20>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5246444,(t=i,i=i+8|0,h[k>>3]=+g[d>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5246092,(t=i,i=i+4|0,c[t>>2]=a[d+38|0]&1,t)|0);cB(5245824,(t=i,i=i+4|0,c[t>>2]=e[d+32>>1]|0,t)|0);cB(5245608,(t=i,i=i+4|0,c[t>>2]=e[d+34>>1]|0,t)|0);cB(5253344,(t=i,i=i+4|0,c[t>>2]=b[d+36>>1]<<16>>16,t)|0);l=c[d+12>>2]|0;d=c[l+4>>2]|0;if((d|0)==2){cB(5250568,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5250252,(t=i,i=i+4|0,c[t>>2]=8,t)|0);m=l+148|0;n=c[m>>2]|0;L2072:do{if((n|0)>0){o=l+20|0;p=0;while(1){q=+g[o+(p<<3)>>2];r=+g[o+(p<<3)+4>>2];cB(5249880,(t=i,i=i+20|0,c[t>>2]=p,h[k>>3]=q,c[t+4>>2]=c[k>>2]|0,c[t+8>>2]=c[k+4>>2]|0,h[k>>3]=r,c[t+12>>2]=c[k>>2]|0,c[t+16>>2]=c[k+4>>2]|0,t)|0);s=p+1|0;u=c[m>>2]|0;if((s|0)<(u|0)){p=s}else{v=u;break L2072}}}else{v=n}}while(0);cB(5249636,(t=i,i=i+4|0,c[t>>2]=v,t)|0)}else if((d|0)==0){cB(5253160,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5252700,(t=i,i=i+8|0,h[k>>3]=+g[l+8>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);r=+g[l+16>>2];cB(5252180,(t=i,i=i+16|0,h[k>>3]=+g[l+12>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=r,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0)}else if((d|0)==3){v=l;cB(5249492,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);n=l+16|0;cB(5250252,(t=i,i=i+4|0,c[t>>2]=c[n>>2]|0,t)|0);m=c[n>>2]|0;L2079:do{if((m|0)>0){p=l+12|0;o=0;while(1){u=c[p>>2]|0;r=+g[u+(o<<3)>>2];q=+g[u+(o<<3)+4>>2];cB(5249880,(t=i,i=i+20|0,c[t>>2]=o,h[k>>3]=r,c[t+4>>2]=c[k>>2]|0,c[t+8>>2]=c[k+4>>2]|0,h[k>>3]=q,c[t+12>>2]=c[k>>2]|0,c[t+16>>2]=c[k+4>>2]|0,t)|0);u=o+1|0;s=c[n>>2]|0;if((u|0)<(s|0)){o=u}else{w=s;break L2079}}}else{w=m}}while(0);cB(5249144,(t=i,i=i+4|0,c[t>>2]=w,t)|0);w=l+20|0;q=+g[w+4>>2];cB(5248920,(t=i,i=i+16|0,h[k>>3]=+g[w>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=q,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);w=l+28|0;q=+g[w+4>>2];cB(5248652,(t=i,i=i+16|0,h[k>>3]=+g[w>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=q,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);cB(5248500,(t=i,i=i+4|0,c[t>>2]=a[l+36|0]&1,t)|0);cB(5248364,(t=i,i=i+4|0,c[t>>2]=a[v+37|0]&1,t)|0)}else if((d|0)==1){cB(5251972,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5252700,(t=i,i=i+8|0,h[k>>3]=+g[l+8>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);d=l+28|0;q=+g[d+4>>2];cB(5251772,(t=i,i=i+16|0,h[k>>3]=+g[d>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=q,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);q=+g[l+16>>2];cB(5251564,(t=i,i=i+16|0,h[k>>3]=+g[l+12>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=q,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);d=l+20|0;q=+g[d+4>>2];cB(5251376,(t=i,i=i+16|0,h[k>>3]=+g[d>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=q,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);q=+g[l+40>>2];cB(5251180,(t=i,i=i+16|0,h[k>>3]=+g[l+36>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=q,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);cB(5251068,(t=i,i=i+4|0,c[t>>2]=a[l+44|0]&1,t)|0);cB(5250876,(t=i,i=i+4|0,c[t>>2]=a[l+45|0]&1,t)|0)}else{i=j;return}cB(5248276,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5248144,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5248276,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5247964,(t=i,i=i+4|0,c[t>>2]=f,t)|0);i=j;return}function c4(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;i=b+40|0;c[i>>2]=d;c[b+44>>2]=e;c[b+48>>2]=f;c[b+28>>2]=0;c[b+36>>2]=0;c[b+32>>2]=0;j=b|0;c[j>>2]=g;c[b+4>>2]=h;h=d<<2;d=g+102796|0;k=c[d>>2]|0;if((k|0)<32){l=k}else{aH(5246028,38,5257424,5247552);l=c[d>>2]|0}k=g+102412+(l*12&-1)|0;c[g+102412+(l*12&-1)+4>>2]=h;m=g+102400|0;n=c[m>>2]|0;if((n+h|0)>102400){c[k>>2]=pi(h)|0;a[g+102412+(l*12&-1)+8|0]=1}else{c[k>>2]=g+n|0;a[g+102412+(l*12&-1)+8|0]=0;c[m>>2]=(c[m>>2]|0)+h|0}m=g+102404|0;l=(c[m>>2]|0)+h|0;c[m>>2]=l;m=g+102408|0;g=c[m>>2]|0;c[m>>2]=(g|0)>(l|0)?g:l;c[d>>2]=(c[d>>2]|0)+1|0;c[b+8>>2]=c[k>>2]|0;k=c[j>>2]|0;d=e<<2;e=k+102796|0;l=c[e>>2]|0;if((l|0)<32){o=l}else{aH(5246028,38,5257424,5247552);o=c[e>>2]|0}l=k+102412+(o*12&-1)|0;c[k+102412+(o*12&-1)+4>>2]=d;g=k+102400|0;m=c[g>>2]|0;if((m+d|0)>102400){c[l>>2]=pi(d)|0;a[k+102412+(o*12&-1)+8|0]=1}else{c[l>>2]=k+m|0;a[k+102412+(o*12&-1)+8|0]=0;c[g>>2]=(c[g>>2]|0)+d|0}g=k+102404|0;o=(c[g>>2]|0)+d|0;c[g>>2]=o;g=k+102408|0;k=c[g>>2]|0;c[g>>2]=(k|0)>(o|0)?k:o;c[e>>2]=(c[e>>2]|0)+1|0;c[b+12>>2]=c[l>>2]|0;l=c[j>>2]|0;e=f<<2;f=l+102796|0;o=c[f>>2]|0;if((o|0)<32){p=o}else{aH(5246028,38,5257424,5247552);p=c[f>>2]|0}o=l+102412+(p*12&-1)|0;c[l+102412+(p*12&-1)+4>>2]=e;k=l+102400|0;g=c[k>>2]|0;if((g+e|0)>102400){c[o>>2]=pi(e)|0;a[l+102412+(p*12&-1)+8|0]=1}else{c[o>>2]=l+g|0;a[l+102412+(p*12&-1)+8|0]=0;c[k>>2]=(c[k>>2]|0)+e|0}k=l+102404|0;p=(c[k>>2]|0)+e|0;c[k>>2]=p;k=l+102408|0;l=c[k>>2]|0;c[k>>2]=(l|0)>(p|0)?l:p;c[f>>2]=(c[f>>2]|0)+1|0;c[b+16>>2]=c[o>>2]|0;o=c[j>>2]|0;f=(c[i>>2]|0)*12&-1;p=o+102796|0;l=c[p>>2]|0;if((l|0)<32){q=l}else{aH(5246028,38,5257424,5247552);q=c[p>>2]|0}l=o+102412+(q*12&-1)|0;c[o+102412+(q*12&-1)+4>>2]=f;k=o+102400|0;e=c[k>>2]|0;if((e+f|0)>102400){c[l>>2]=pi(f)|0;a[o+102412+(q*12&-1)+8|0]=1}else{c[l>>2]=o+e|0;a[o+102412+(q*12&-1)+8|0]=0;c[k>>2]=(c[k>>2]|0)+f|0}k=o+102404|0;q=(c[k>>2]|0)+f|0;c[k>>2]=q;k=o+102408|0;o=c[k>>2]|0;c[k>>2]=(o|0)>(q|0)?o:q;c[p>>2]=(c[p>>2]|0)+1|0;c[b+24>>2]=c[l>>2]|0;l=c[j>>2]|0;j=(c[i>>2]|0)*12&-1;i=l+102796|0;p=c[i>>2]|0;if((p|0)<32){r=p}else{aH(5246028,38,5257424,5247552);r=c[i>>2]|0}p=l+102412+(r*12&-1)|0;c[l+102412+(r*12&-1)+4>>2]=j;q=l+102400|0;o=c[q>>2]|0;if((o+j|0)>102400){c[p>>2]=pi(j)|0;a[l+102412+(r*12&-1)+8|0]=1;k=l+102404|0;f=c[k>>2]|0;e=f+j|0;c[k>>2]=e;g=l+102408|0;d=c[g>>2]|0;m=(d|0)>(e|0);h=m?d:e;c[g>>2]=h;n=c[i>>2]|0;s=n+1|0;c[i>>2]=s;t=p|0;u=c[t>>2]|0;v=u;w=b+20|0;c[w>>2]=v;return}else{c[p>>2]=l+o|0;a[l+102412+(r*12&-1)+8|0]=0;c[q>>2]=(c[q>>2]|0)+j|0;k=l+102404|0;f=c[k>>2]|0;e=f+j|0;c[k>>2]=e;g=l+102408|0;d=c[g>>2]|0;m=(d|0)>(e|0);h=m?d:e;c[g>>2]=h;n=c[i>>2]|0;s=n+1|0;c[i>>2]=s;t=p|0;u=c[t>>2]|0;v=u;w=b+20|0;c[w>>2]=v;return}}function c5(d,e,f,h,j){d=d|0;e=e|0;f=f|0;h=h|0;j=j|0;var l=0,m=0,n=0,o=0,p=0,q=0.0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0.0,D=0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,P=0.0,S=0,T=0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0.0,af=0.0,ag=0;l=i;i=i+148|0;m=l|0;n=l+20|0;o=l+52|0;p=l+96|0;q=+g[f>>2];r=d+28|0;L2126:do{if((c[r>>2]|0)>0){s=d+8|0;t=h|0;u=h+4|0;v=d+20|0;w=d+24|0;x=0;while(1){y=c[(c[s>>2]|0)+(x<<2)>>2]|0;z=y+44|0;A=c[z>>2]|0;B=c[z+4>>2]|0;C=+g[y+56>>2];z=y+64|0;D=c[z+4>>2]|0;E=(c[k>>2]=c[z>>2]|0,+g[k>>2]);F=(c[k>>2]=D,+g[k>>2]);G=+g[y+72>>2];D=y+36|0;c[D>>2]=A;c[D+4>>2]=B;g[y+52>>2]=C;if((c[y>>2]|0)==2){H=+g[y+140>>2];I=+g[y+120>>2];J=1.0-q*+g[y+132>>2];K=J<1.0?J:1.0;J=K<0.0?0.0:K;K=1.0-q*+g[y+136>>2];L=K<1.0?K:1.0;M=(G+q*+g[y+128>>2]*+g[y+84>>2])*(L<0.0?0.0:L);N=(E+q*(H*+g[t>>2]+I*+g[y+76>>2]))*J;P=(F+q*(H*+g[u>>2]+I*+g[y+80>>2]))*J}else{M=G;N=E;P=F}y=(c[v>>2]|0)+(x*12&-1)|0;c[y>>2]=A;c[y+4>>2]=B;g[(c[v>>2]|0)+(x*12&-1)+8>>2]=C;B=(c[w>>2]|0)+(x*12&-1)|0;y=(g[k>>2]=N,c[k>>2]|0);A=(g[k>>2]=P,c[k>>2]|0)|0;c[B>>2]=0|y;c[B+4>>2]=A;g[(c[w>>2]|0)+(x*12&-1)+8>>2]=M;A=x+1|0;if((A|0)<(c[r>>2]|0)){x=A}else{S=v;T=w;break L2126}}}else{S=d+20|0;T=d+24|0}}while(0);h=n;w=f;c[h>>2]=c[w>>2]|0;c[h+4>>2]=c[w+4>>2]|0;c[h+8>>2]=c[w+8>>2]|0;c[h+12>>2]=c[w+12>>2]|0;c[h+16>>2]=c[w+16>>2]|0;c[h+20>>2]=c[w+20>>2]|0;h=c[S>>2]|0;c[n+24>>2]=h;v=c[T>>2]|0;c[n+28>>2]=v;x=o;c[x>>2]=c[w>>2]|0;c[x+4>>2]=c[w+4>>2]|0;c[x+8>>2]=c[w+8>>2]|0;c[x+12>>2]=c[w+12>>2]|0;c[x+16>>2]=c[w+16>>2]|0;c[x+20>>2]=c[w+20>>2]|0;w=d+12|0;c[o+24>>2]=c[w>>2]|0;x=d+36|0;c[o+28>>2]=c[x>>2]|0;c[o+32>>2]=h;c[o+36>>2]=v;c[o+40>>2]=c[d>>2]|0;dJ(p,o);dL(p);if((a[f+20|0]&1)<<24>>24!=0){dK(p)}o=d+32|0;L2139:do{if((c[o>>2]|0)>0){v=d+16|0;h=0;while(1){u=c[(c[v>>2]|0)+(h<<2)>>2]|0;aX[c[(c[u>>2]|0)+28>>2]&2047](u,n);u=h+1|0;if((u|0)<(c[o>>2]|0)){h=u}else{break L2139}}}}while(0);g[e+12>>2]=0.0;h=f+12|0;L2145:do{if((c[h>>2]|0)>0){v=d+16|0;u=0;while(1){L2149:do{if((c[o>>2]|0)>0){t=0;while(1){s=c[(c[v>>2]|0)+(t<<2)>>2]|0;aX[c[(c[s>>2]|0)+32>>2]&2047](s,n);s=t+1|0;if((s|0)<(c[o>>2]|0)){t=s}else{break L2149}}}}while(0);dM(p);t=u+1|0;if((t|0)<(c[h>>2]|0)){u=t}else{break L2145}}}}while(0);h=c[p+48>>2]|0;L2156:do{if((h|0)>0){u=c[p+40>>2]|0;v=c[p+44>>2]|0;t=0;while(1){s=c[v+(c[u+(t*152&-1)+148>>2]<<2)>>2]|0;A=u+(t*152&-1)+144|0;L2160:do{if((c[A>>2]|0)>0){B=0;while(1){g[s+64+(B*20&-1)+8>>2]=+g[u+(t*152&-1)+(B*36&-1)+16>>2];g[s+64+(B*20&-1)+12>>2]=+g[u+(t*152&-1)+(B*36&-1)+20>>2];y=B+1|0;if((y|0)<(c[A>>2]|0)){B=y}else{break L2160}}}}while(0);A=t+1|0;if((A|0)<(h|0)){t=A}else{break L2156}}}}while(0);g[e+16>>2]=0.0;L2165:do{if((c[r>>2]|0)>0){h=0;while(1){t=c[S>>2]|0;u=t+(h*12&-1)|0;v=c[u+4>>2]|0;M=(c[k>>2]=c[u>>2]|0,+g[k>>2]);P=(c[k>>2]=v,+g[k>>2]);N=+g[t+(h*12&-1)+8>>2];t=c[T>>2]|0;v=t+(h*12&-1)|0;A=c[v+4>>2]|0;C=(c[k>>2]=c[v>>2]|0,+g[k>>2]);F=(c[k>>2]=A,+g[k>>2]);E=+g[t+(h*12&-1)+8>>2];G=q*C;J=q*F;I=G*G+J*J;if(I>4.0){J=2.0/+O(+I);U=C*J;V=F*J}else{U=C;V=F}F=q*E;if(F*F>2.4674012660980225){if(F>0.0){W=F}else{W=-0.0-F}X=E*(1.5707963705062866/W)}else{X=E}t=(g[k>>2]=M+q*U,c[k>>2]|0);A=(g[k>>2]=P+q*V,c[k>>2]|0)|0;c[u>>2]=0|t;c[u+4>>2]=A;g[(c[S>>2]|0)+(h*12&-1)+8>>2]=N+q*X;A=(c[T>>2]|0)+(h*12&-1)|0;u=(g[k>>2]=U,c[k>>2]|0);t=(g[k>>2]=V,c[k>>2]|0)|0;c[A>>2]=0|u;c[A+4>>2]=t;g[(c[T>>2]|0)+(h*12&-1)+8>>2]=X;t=h+1|0;if((t|0)<(c[r>>2]|0)){h=t}else{break L2165}}}}while(0);h=f+16|0;f=d+16|0;t=0;while(1){if((t|0)>=(c[h>>2]|0)){Y=1;break}A=dN(p)|0;L2182:do{if((c[o>>2]|0)>0){u=1;v=0;while(1){s=c[(c[f>>2]|0)+(v<<2)>>2]|0;B=u&ba[c[(c[s>>2]|0)+36>>2]&2047](s,n);s=v+1|0;if((s|0)<(c[o>>2]|0)){u=B;v=s}else{Z=B;break L2182}}}else{Z=1}}while(0);if(A&Z){Y=0;break}else{t=t+1|0}}L2188:do{if((c[r>>2]|0)>0){t=d+8|0;Z=0;while(1){o=c[(c[t>>2]|0)+(Z<<2)>>2]|0;n=(c[S>>2]|0)+(Z*12&-1)|0;f=o+44|0;h=c[n>>2]|0;v=c[n+4>>2]|0;c[f>>2]=h;c[f+4>>2]=v;X=+g[(c[S>>2]|0)+(Z*12&-1)+8>>2];g[o+56>>2]=X;f=(c[T>>2]|0)+(Z*12&-1)|0;n=o+64|0;u=c[f+4>>2]|0;c[n>>2]=c[f>>2]|0;c[n+4>>2]=u;g[o+72>>2]=+g[(c[T>>2]|0)+(Z*12&-1)+8>>2];V=+R(+X);g[o+20>>2]=V;U=+Q(+X);g[o+24>>2]=U;X=+g[o+28>>2];W=+g[o+32>>2];N=(c[k>>2]=h,+g[k>>2])-(U*X-V*W);P=(c[k>>2]=v,+g[k>>2])-(V*X+U*W);v=o+12|0;o=(g[k>>2]=N,c[k>>2]|0);h=(g[k>>2]=P,c[k>>2]|0)|0;c[v>>2]=0|o;c[v+4>>2]=h;h=Z+1|0;if((h|0)<(c[r>>2]|0)){Z=h}else{break L2188}}}}while(0);g[e+20>>2]=0.0;e=c[p+40>>2]|0;T=d+4|0;L2193:do{if((c[T>>2]|0)!=0){if((c[x>>2]|0)<=0){break}S=m+16|0;Z=0;while(1){t=c[(c[w>>2]|0)+(Z<<2)>>2]|0;A=c[e+(Z*152&-1)+144>>2]|0;c[S>>2]=A;L2198:do{if((A|0)>0){h=0;while(1){g[m+(h<<2)>>2]=+g[e+(Z*152&-1)+(h*36&-1)+16>>2];g[m+8+(h<<2)>>2]=+g[e+(Z*152&-1)+(h*36&-1)+20>>2];v=h+1|0;if((v|0)==(A|0)){break L2198}else{h=v}}}}while(0);A=c[T>>2]|0;bg[c[(c[A>>2]|0)+20>>2]&2047](A,t,m);A=Z+1|0;if((A|0)<(c[x>>2]|0)){Z=A}else{break L2193}}}}while(0);if(!j){_=p+32|0;$=c[_>>2]|0;aa=e;cC($,aa);ab=p+36|0;ac=c[ab>>2]|0;ad=ac;cC($,ad);i=l;return}j=c[r>>2]|0;L2207:do{if((j|0)>0){x=d+8|0;P=3.4028234663852886e+38;m=0;while(1){T=c[(c[x>>2]|0)+(m<<2)>>2]|0;L2211:do{if((c[T>>2]|0)==0){ae=P}else{do{if((b[T+4>>1]&4)<<16>>16!=0){N=+g[T+72>>2];if(N*N>.001218469929881394){break}N=+g[T+64>>2];W=+g[T+68>>2];if(N*N+W*W>9999999747378752.0e-20){break}w=T+144|0;W=q+ +g[w>>2];g[w>>2]=W;ae=P<W?P:W;break L2211}}while(0);g[T+144>>2]=0.0;ae=0.0}}while(0);T=m+1|0;t=c[r>>2]|0;if((T|0)<(t|0)){P=ae;m=T}else{af=ae;ag=t;break L2207}}}else{af=3.4028234663852886e+38;ag=j}}while(0);if(!((ag|0)>0&((af<.5|Y)^1))){_=p+32|0;$=c[_>>2]|0;aa=e;cC($,aa);ab=p+36|0;ac=c[ab>>2]|0;ad=ac;cC($,ad);i=l;return}Y=d+8|0;d=0;while(1){ag=c[(c[Y>>2]|0)+(d<<2)>>2]|0;j=ag+4|0;b[j>>1]=b[j>>1]&-3;g[ag+144>>2]=0.0;j=ag+64|0;c[j>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;c[j+12>>2]=0;c[j+16>>2]=0;c[j+20>>2]=0;j=d+1|0;if((j|0)<(c[r>>2]|0)){d=j}else{break}}_=p+32|0;$=c[_>>2]|0;aa=e;cC($,aa);ab=p+36|0;ac=c[ab>>2]|0;ad=ac;cC($,ad);i=l;return}function c6(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0;e=b|0;f=b+8|0;c[f>>2]=128;c[b+4>>2]=0;h=pi(1024)|0;c[b>>2]=h;pr(h|0,0,c[f>>2]<<3|0);pr(b+12|0,0,56);if((a[5261536]&1)<<24>>24==0){f=0;h=1;while(1){if((f|0)>=14){aH(5246516,73,5257692,5251608)}if((h|0)>(c[5262184+(f<<2)>>2]|0)){i=f+1|0;a[h+5261540|0]=i&255;j=i}else{a[h+5261540|0]=f&255;j=f}i=h+1|0;if((i|0)==641){break}else{f=j;h=i}}a[5261536]=1}c[b+102468>>2]=0;c[b+102472>>2]=0;c[b+102476>>2]=0;c[b+102864>>2]=0;by(b+102872|0);c[b+102932>>2]=0;c[b+102936>>2]=0;c[b+102940>>2]=5245424;c[b+102944>>2]=5245420;h=b+102948|0;c[b+102980>>2]=0;c[b+102984>>2]=0;j=h;c[j>>2]=0;c[j+4>>2]=0;c[j+8>>2]=0;c[j+12>>2]=0;c[j+16>>2]=0;a[b+102992|0]=1;a[b+102993|0]=1;a[b+102994|0]=0;a[b+102995|0]=1;a[b+102976|0]=1;j=d;d=b+102968|0;f=c[j+4>>2]|0;c[d>>2]=c[j>>2]|0;c[d+4>>2]=f;c[b+102868>>2]=4;g[b+102988>>2]=0.0;c[h>>2]=e;pr(b+102996|0,0,32);return}function c7(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=b+102960|0;if((c[e>>2]|0)<=0){aH(5251272,133,5255996,5250376)}f=b+102868|0;g=c[f>>2]|0;if((g&2|0)==0){h=g}else{aH(5251272,134,5255996,5252880);h=c[f>>2]|0}if((h&2|0)!=0){return}h=d+108|0;f=c[h>>2]|0;L2249:do{if((f|0)!=0){g=b+102980|0;i=f;while(1){j=c[i+12>>2]|0;k=c[g>>2]|0;if((k|0)==0){l=i+4|0}else{m=i+4|0;aX[c[(c[k>>2]|0)+8>>2]&2047](k,c[m>>2]|0);l=m}da(b,c[l>>2]|0);c[h>>2]=j;if((j|0)==0){break L2249}else{i=j}}}}while(0);c[h>>2]=0;h=d+112|0;l=c[h>>2]|0;L2258:do{if((l|0)!=0){f=b+102872|0;i=l;while(1){g=c[i+12>>2]|0;cO(f,c[i+4>>2]|0);if((g|0)==0){break L2258}else{i=g}}}}while(0);c[h>>2]=0;h=d+100|0;l=c[h>>2]|0;L2263:do{if((l|0)==0){n=d+104|0}else{i=b+102980|0;f=b+102912|0;g=b+102904|0;j=b+102900|0;m=b+102872|0;k=b|0;o=d+104|0;p=l;while(1){q=c[p+4>>2]|0;r=c[i>>2]|0;if((r|0)!=0){aX[c[(c[r>>2]|0)+12>>2]&2047](r,p)}r=p+28|0;L2270:do{if((c[r>>2]|0)>0){s=p+24|0;t=0;while(1){u=(c[s>>2]|0)+(t*28&-1)+24|0;v=c[u>>2]|0;w=c[f>>2]|0;x=0;while(1){if((x|0)>=(w|0)){break}y=(c[g>>2]|0)+(x<<2)|0;if((c[y>>2]|0)==(v|0)){z=1664;break}else{x=x+1|0}}if((z|0)==1664){z=0;c[y>>2]=-1}c[j>>2]=(c[j>>2]|0)-1|0;bP(m,v);c[u>>2]=-1;x=t+1|0;if((x|0)<(c[r>>2]|0)){t=x}else{break L2270}}}}while(0);c[r>>2]=0;c0(p,k);t=a[5261584]|0;if((t&255)>=14){aH(5246516,173,5257772,5247588)}s=b+12+((t&255)<<2)|0;c[p>>2]=c[s>>2]|0;c[s>>2]=p;c[h>>2]=q;c[o>>2]=(c[o>>2]|0)-1|0;if((q|0)==0){n=o;break L2263}else{p=q}}}}while(0);c[h>>2]=0;c[n>>2]=0;n=d+92|0;h=c[n>>2]|0;y=d+96|0;if((h|0)!=0){c[h+96>>2]=c[y>>2]|0}h=c[y>>2]|0;if((h|0)!=0){c[h+92>>2]=c[n>>2]|0}n=b+102952|0;if((c[n>>2]|0)==(d|0)){c[n>>2]=c[y>>2]|0}c[e>>2]=(c[e>>2]|0)-1|0;e=a[5261692]|0;if((e&255)>=14){aH(5246516,173,5257772,5247588)}y=b+12+((e&255)<<2)|0;c[d>>2]=c[y>>2]|0;c[y>>2]=d;return}function c8(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0,N=0,P=0,S=0,T=0,U=0;f=i;i=i+116|0;h=f|0;j=f+20|0;l=f+64|0;m=a+28|0;n=c[m>>2]|0;if((n|0)>(d|0)){o=n}else{aH(5251420,386,5255640,5252900);o=c[m>>2]|0}if((o|0)>(e|0)){p=o}else{aH(5251420,387,5255640,5250392);p=c[m>>2]|0}L2306:do{if((p|0)>0){o=a+8|0;n=a+20|0;q=a+24|0;r=0;while(1){s=c[(c[o>>2]|0)+(r<<2)>>2]|0;t=s+44|0;u=(c[n>>2]|0)+(r*12&-1)|0;v=c[t+4>>2]|0;c[u>>2]=c[t>>2]|0;c[u+4>>2]=v;g[(c[n>>2]|0)+(r*12&-1)+8>>2]=+g[s+56>>2];v=s+64|0;u=(c[q>>2]|0)+(r*12&-1)|0;t=c[v+4>>2]|0;c[u>>2]=c[v>>2]|0;c[u+4>>2]=t;g[(c[q>>2]|0)+(r*12&-1)+8>>2]=+g[s+72>>2];s=r+1|0;if((s|0)<(c[m>>2]|0)){r=s}else{w=n;x=q;break L2306}}}else{w=a+20|0;x=a+24|0}}while(0);p=a+12|0;c[j+24>>2]=c[p>>2]|0;q=a+36|0;c[j+28>>2]=c[q>>2]|0;c[j+40>>2]=c[a>>2]|0;n=j;r=b;c[n>>2]=c[r>>2]|0;c[n+4>>2]=c[r+4>>2]|0;c[n+8>>2]=c[r+8>>2]|0;c[n+12>>2]=c[r+12>>2]|0;c[n+16>>2]=c[r+16>>2]|0;c[n+20>>2]=c[r+20>>2]|0;c[j+32>>2]=c[w>>2]|0;c[j+36>>2]=c[x>>2]|0;dJ(l,j);j=b+16|0;r=0;while(1){if((r|0)>=(c[j>>2]|0)){break}if(dS(l,d,e)|0){break}else{r=r+1|0}}r=a+8|0;j=(c[w>>2]|0)+(d*12&-1)|0;n=(c[(c[r>>2]|0)+(d<<2)>>2]|0)+36|0;o=c[j+4>>2]|0;c[n>>2]=c[j>>2]|0;c[n+4>>2]=o;g[(c[(c[r>>2]|0)+(d<<2)>>2]|0)+52>>2]=+g[(c[w>>2]|0)+(d*12&-1)+8>>2];d=(c[w>>2]|0)+(e*12&-1)|0;o=(c[(c[r>>2]|0)+(e<<2)>>2]|0)+36|0;n=c[d+4>>2]|0;c[o>>2]=c[d>>2]|0;c[o+4>>2]=n;g[(c[(c[r>>2]|0)+(e<<2)>>2]|0)+52>>2]=+g[(c[w>>2]|0)+(e*12&-1)+8>>2];dL(l);e=b+12|0;L2318:do{if((c[e>>2]|0)>0){n=0;while(1){dM(l);o=n+1|0;if((o|0)<(c[e>>2]|0)){n=o}else{break L2318}}}}while(0);y=+g[b>>2];L2323:do{if((c[m>>2]|0)>0){b=0;while(1){e=c[w>>2]|0;n=e+(b*12&-1)|0;o=c[n+4>>2]|0;z=(c[k>>2]=c[n>>2]|0,+g[k>>2]);A=(c[k>>2]=o,+g[k>>2]);B=+g[e+(b*12&-1)+8>>2];e=c[x>>2]|0;o=e+(b*12&-1)|0;d=c[o+4>>2]|0;C=(c[k>>2]=c[o>>2]|0,+g[k>>2]);D=(c[k>>2]=d,+g[k>>2]);E=+g[e+(b*12&-1)+8>>2];F=y*C;G=y*D;H=F*F+G*G;if(H>4.0){G=2.0/+O(+H);I=C*G;J=D*G}else{I=C;J=D}D=y*E;if(D*D>2.4674012660980225){if(D>0.0){K=D}else{K=-0.0-D}L=E*(1.5707963705062866/K)}else{L=E}E=z+y*I;z=A+y*J;A=B+y*L;e=(g[k>>2]=E,c[k>>2]|0);d=0|e;e=(g[k>>2]=z,c[k>>2]|0)|0;c[n>>2]=d;c[n+4>>2]=e;g[(c[w>>2]|0)+(b*12&-1)+8>>2]=A;n=(c[x>>2]|0)+(b*12&-1)|0;o=(g[k>>2]=I,c[k>>2]|0);j=0|o;o=(g[k>>2]=J,c[k>>2]|0)|0;c[n>>2]=j;c[n+4>>2]=o;g[(c[x>>2]|0)+(b*12&-1)+8>>2]=L;n=c[(c[r>>2]|0)+(b<<2)>>2]|0;s=n+44|0;c[s>>2]=d;c[s+4>>2]=e;g[n+56>>2]=A;e=n+64|0;c[e>>2]=j;c[e+4>>2]=o;g[n+72>>2]=L;B=+R(+A);g[n+20>>2]=B;D=+Q(+A);g[n+24>>2]=D;A=+g[n+28>>2];C=+g[n+32>>2];o=n+12|0;n=(g[k>>2]=E-(D*A-B*C),c[k>>2]|0);e=(g[k>>2]=z-(B*A+D*C),c[k>>2]|0)|0;c[o>>2]=0|n;c[o+4>>2]=e;e=b+1|0;if((e|0)<(c[m>>2]|0)){b=e}else{break L2323}}}}while(0);m=c[l+40>>2]|0;r=a+4|0;if((c[r>>2]|0)==0){M=l+32|0;N=c[M>>2]|0;P=m;cC(N,P);S=l+36|0;T=c[S>>2]|0;U=T;cC(N,U);i=f;return}if((c[q>>2]|0)<=0){M=l+32|0;N=c[M>>2]|0;P=m;cC(N,P);S=l+36|0;T=c[S>>2]|0;U=T;cC(N,U);i=f;return}a=h+16|0;x=0;while(1){w=c[(c[p>>2]|0)+(x<<2)>>2]|0;b=c[m+(x*152&-1)+144>>2]|0;c[a>>2]=b;L2344:do{if((b|0)>0){e=0;while(1){g[h+(e<<2)>>2]=+g[m+(x*152&-1)+(e*36&-1)+16>>2];g[h+8+(e<<2)>>2]=+g[m+(x*152&-1)+(e*36&-1)+20>>2];o=e+1|0;if((o|0)==(b|0)){break L2344}else{e=o}}}}while(0);b=c[r>>2]|0;bg[c[(c[b>>2]|0)+20>>2]&2047](b,w,h);b=x+1|0;if((b|0)<(c[q>>2]|0)){x=b}else{break}}M=l+32|0;N=c[M>>2]|0;P=m;cC(N,P);S=l+36|0;T=c[S>>2]|0;U=T;cC(N,U);i=f;return}function c9(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;b=c[a+102952>>2]|0;L2351:do{if((b|0)!=0){d=a|0;e=b;while(1){f=c[e+96>>2]|0;g=c[e+100>>2]|0;while(1){if((g|0)==0){break}h=c[g+4>>2]|0;c[g+28>>2]=0;c0(g,d);g=h}if((f|0)==0){break L2351}else{e=f}}}}while(0);pj(c[a+102904>>2]|0);pj(c[a+102916>>2]|0);pj(c[a+102876>>2]|0);if((c[a+102468>>2]|0)!=0){aH(5246028,32,5257384,5251312)}if((c[a+102864>>2]|0)!=0){aH(5246028,33,5257384,5248804)}b=a+4|0;e=a|0;a=c[e>>2]|0;if((c[b>>2]|0)>0){i=0;j=a}else{k=a;l=k;pj(l);return}while(1){pj(c[j+(i<<3)+4>>2]|0);a=i+1|0;d=c[e>>2]|0;if((a|0)<(c[b>>2]|0)){i=a;j=d}else{k=d;break}}l=k;pj(l);return}function da(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=d+102868|0;h=c[f>>2]|0;if((h&2|0)==0){i=h}else{aH(5251272,274,5255956,5252880);i=c[f>>2]|0}if((i&2|0)!=0){return}i=a[e+61|0]&1;f=e+8|0;h=c[f>>2]|0;j=e+12|0;if((h|0)!=0){c[h+12>>2]=c[j>>2]|0}h=c[j>>2]|0;if((h|0)!=0){c[h+8>>2]=c[f>>2]|0}f=d+102956|0;if((c[f>>2]|0)==(e|0)){c[f>>2]=c[j>>2]|0}j=c[e+48>>2]|0;f=c[e+52>>2]|0;h=j+4|0;k=b[h>>1]|0;if((k&2)<<16>>16==0){b[h>>1]=k|2;g[j+144>>2]=0.0}k=f+4|0;h=b[k>>1]|0;if((h&2)<<16>>16==0){b[k>>1]=h|2;g[f+144>>2]=0.0}h=e+24|0;k=c[h>>2]|0;l=e+28|0;if((k|0)!=0){c[k+12>>2]=c[l>>2]|0}k=c[l>>2]|0;if((k|0)!=0){c[k+8>>2]=c[h>>2]|0}k=j+108|0;if((e+16|0)==(c[k>>2]|0)){c[k>>2]=c[l>>2]|0}c[h>>2]=0;c[l>>2]=0;l=e+40|0;h=c[l>>2]|0;k=e+44|0;if((h|0)!=0){c[h+12>>2]=c[k>>2]|0}h=c[k>>2]|0;if((h|0)!=0){c[h+8>>2]=c[l>>2]|0}h=f+108|0;if((e+32|0)==(c[h>>2]|0)){c[h>>2]=c[k>>2]|0}c[l>>2]=0;c[k>>2]=0;eF(e,d|0);e=d+102964|0;d=c[e>>2]|0;if((d|0)>0){m=d}else{aH(5251272,346,5255956,5248168);m=c[e>>2]|0}c[e>>2]=m-1|0;if(i<<24>>24!=0){return}i=c[f+112>>2]|0;if((i|0)==0){return}else{n=i}while(1){if((c[n>>2]|0)==(j|0)){i=(c[n+4>>2]|0)+4|0;c[i>>2]=c[i>>2]|8}i=c[n+12>>2]|0;if((i|0)==0){break}else{n=i}}return}function db(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;e=b+102868|0;f=c[e>>2]|0;if((f&2|0)==0){g=f}else{aH(5251272,214,5256032,5252880);g=c[e>>2]|0}if((g&2|0)!=0){h=0;return h|0}g=eE(d,b|0)|0;c[g+8>>2]=0;e=b+102956|0;c[g+12>>2]=c[e>>2]|0;f=c[e>>2]|0;if((f|0)!=0){c[f+8>>2]=g}c[e>>2]=g;e=b+102964|0;c[e>>2]=(c[e>>2]|0)+1|0;e=g+16|0;c[g+20>>2]=g;b=g+52|0;c[e>>2]=c[b>>2]|0;c[g+24>>2]=0;f=g+48|0;i=c[f>>2]|0;j=i+108|0;c[g+28>>2]=c[j>>2]|0;k=c[j>>2]|0;if((k|0)==0){l=i}else{c[k+8>>2]=e;l=c[f>>2]|0}c[l+108>>2]=e;e=g+32|0;c[g+36>>2]=g;c[e>>2]=c[f>>2]|0;c[g+40>>2]=0;f=c[b>>2]|0;l=f+108|0;c[g+44>>2]=c[l>>2]|0;k=c[l>>2]|0;if((k|0)==0){m=f}else{c[k+8>>2]=e;m=c[b>>2]|0}c[m+108>>2]=e;e=c[d+8>>2]|0;if((a[d+16|0]&1)<<24>>24!=0){h=g;return h|0}m=c[(c[d+12>>2]|0)+112>>2]|0;if((m|0)==0){h=g;return h|0}else{n=m}while(1){if((c[n>>2]|0)==(e|0)){m=(c[n+4>>2]|0)+4|0;c[m>>2]=c[m>>2]|8}m=c[n+12>>2]|0;if((m|0)==0){h=g;break}else{n=m}}return h|0}function dc(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0;f=i;i=i+100|0;h=f|0;j=f+16|0;l=f+68|0;m=d+103008|0;g[m>>2]=0.0;n=d+103012|0;g[n>>2]=0.0;o=d+103016|0;g[o>>2]=0.0;p=d+102960|0;q=d+102872|0;r=d+68|0;c4(j,c[p>>2]|0,c[d+102936>>2]|0,c[d+102964>>2]|0,r,c[d+102944>>2]|0);s=d+102952|0;t=c[s>>2]|0;L2453:do{if((t|0)!=0){u=t;while(1){v=u+4|0;b[v>>1]=b[v>>1]&-2;v=c[u+96>>2]|0;if((v|0)==0){break L2453}else{u=v}}}}while(0);t=c[d+102932>>2]|0;L2457:do{if((t|0)!=0){u=t;while(1){v=u+4|0;c[v>>2]=c[v>>2]&-2;v=c[u+12>>2]|0;if((v|0)==0){break L2457}else{u=v}}}}while(0);t=c[d+102956>>2]|0;L2461:do{if((t|0)!=0){u=t;while(1){a[u+60|0]=0;v=c[u+12>>2]|0;if((v|0)==0){break L2461}else{u=v}}}}while(0);t=c[p>>2]|0;p=t<<2;u=d+102864|0;v=c[u>>2]|0;if((v|0)<32){w=v}else{aH(5246028,38,5257424,5247552);w=c[u>>2]|0}v=d+102480+(w*12&-1)|0;c[d+102480+(w*12&-1)+4>>2]=p;x=d+102468|0;y=c[x>>2]|0;if((y+p|0)>102400){c[v>>2]=pi(p)|0;a[d+102480+(w*12&-1)+8|0]=1}else{c[v>>2]=y+(d+68)|0;a[d+102480+(w*12&-1)+8|0]=0;c[x>>2]=(c[x>>2]|0)+p|0}x=d+102472|0;w=(c[x>>2]|0)+p|0;c[x>>2]=w;x=d+102476|0;p=c[x>>2]|0;c[x>>2]=(p|0)>(w|0)?p:w;c[u>>2]=(c[u>>2]|0)+1|0;u=c[v>>2]|0;v=u;w=c[s>>2]|0;L2473:do{if((w|0)!=0){p=j+28|0;x=j+36|0;y=j+32|0;z=j+40|0;A=j+8|0;B=j+48|0;C=j+16|0;D=j+44|0;E=j+12|0;F=d+102968|0;G=d+102976|0;H=l+12|0;I=l+16|0;J=l+20|0;K=w;while(1){L=K+4|0;L2477:do{if((b[L>>1]&35)<<16>>16==34){if((c[K>>2]|0)==0){break}c[p>>2]=0;c[x>>2]=0;c[y>>2]=0;c[v>>2]=K;b[L>>1]=b[L>>1]|1;M=1;while(1){N=M-1|0;O=c[v+(N<<2)>>2]|0;P=O+4|0;if((b[P>>1]&32)<<16>>16==0){aH(5251272,445,5255916,5247372)}S=c[p>>2]|0;if((S|0)<(c[z>>2]|0)){T=S}else{aH(5249388,54,5255764,5248620);T=c[p>>2]|0}c[O+8>>2]=T;c[(c[A>>2]|0)+(c[p>>2]<<2)>>2]=O;c[p>>2]=(c[p>>2]|0)+1|0;S=b[P>>1]|0;if((S&2)<<16>>16==0){b[P>>1]=S|2;g[O+144>>2]=0.0}L2492:do{if((c[O>>2]|0)==0){U=N}else{S=c[O+112>>2]|0;L2494:do{if((S|0)==0){V=N}else{P=N;W=S;while(1){X=c[W+4>>2]|0;Y=X+4|0;do{if((c[Y>>2]&7|0)==6){if((a[(c[X+48>>2]|0)+38|0]&1)<<24>>24!=0){Z=P;break}if((a[(c[X+52>>2]|0)+38|0]&1)<<24>>24!=0){Z=P;break}_=c[x>>2]|0;if((_|0)<(c[D>>2]|0)){$=_}else{aH(5249388,62,5255700,5248884);$=c[x>>2]|0}c[x>>2]=$+1|0;c[(c[E>>2]|0)+($<<2)>>2]=X;c[Y>>2]=c[Y>>2]|1;_=c[W>>2]|0;aa=_+4|0;if((b[aa>>1]&1)<<16>>16!=0){Z=P;break}if((P|0)>=(t|0)){aH(5251272,495,5255916,5246892)}c[v+(P<<2)>>2]=_;b[aa>>1]=b[aa>>1]|1;Z=P+1|0}else{Z=P}}while(0);Y=c[W+12>>2]|0;if((Y|0)==0){V=Z;break L2494}else{P=Z;W=Y}}}}while(0);S=c[O+108>>2]|0;if((S|0)==0){U=V;break}else{ab=V;ac=S}while(1){S=ac+4|0;W=c[S>>2]|0;do{if((a[W+60|0]&1)<<24>>24==0){P=c[ac>>2]|0;Y=P+4|0;if((b[Y>>1]&32)<<16>>16==0){ad=ab;break}X=c[y>>2]|0;if((X|0)<(c[B>>2]|0)){ae=X}else{aH(5249388,68,5255732,5249112);ae=c[y>>2]|0}c[y>>2]=ae+1|0;c[(c[C>>2]|0)+(ae<<2)>>2]=W;a[(c[S>>2]|0)+60|0]=1;if((b[Y>>1]&1)<<16>>16!=0){ad=ab;break}if((ab|0)>=(t|0)){aH(5251272,524,5255916,5246892)}c[v+(ab<<2)>>2]=P;b[Y>>1]=b[Y>>1]|1;ad=ab+1|0}else{ad=ab}}while(0);S=c[ac+12>>2]|0;if((S|0)==0){U=ad;break L2492}else{ab=ad;ac=S}}}}while(0);if((U|0)>0){M=U}else{break}}c5(j,l,e,F,(a[G]&1)<<24>>24!=0);g[m>>2]=+g[H>>2]+ +g[m>>2];g[n>>2]=+g[I>>2]+ +g[n>>2];g[o>>2]=+g[J>>2]+ +g[o>>2];M=c[p>>2]|0;if((M|0)>0){af=0;ag=M}else{break}while(1){M=c[(c[A>>2]|0)+(af<<2)>>2]|0;if((c[M>>2]|0)==0){O=M+4|0;b[O>>1]=b[O>>1]&-2;ah=c[p>>2]|0}else{ah=ag}O=af+1|0;if((O|0)<(ah|0)){af=O;ag=ah}else{break L2477}}}}while(0);L=c[K+96>>2]|0;if((L|0)==0){break L2473}else{K=L}}}}while(0);cC(r,u);u=c[s>>2]|0;L2536:do{if((u|0)!=0){s=h+8|0;r=h+12|0;ah=h;ag=u;while(1){L2540:do{if((b[ag+4>>1]&1)<<16>>16!=0){if((c[ag>>2]|0)==0){break}ai=+g[ag+52>>2];aj=+R(+ai);g[s>>2]=aj;ak=+Q(+ai);g[r>>2]=ak;ai=+g[ag+28>>2];al=+g[ag+32>>2];am=+g[ag+40>>2]-(aj*ai+ak*al);af=(g[k>>2]=+g[ag+36>>2]-(ak*ai-aj*al),c[k>>2]|0);o=(g[k>>2]=am,c[k>>2]|0)|0;c[ah>>2]=0|af;c[ah+4>>2]=o;o=(c[ag+88>>2]|0)+102872|0;af=c[ag+100>>2]|0;if((af|0)==0){break}n=ag+12|0;m=af;while(1){c1(m,o,h,n);af=c[m+4>>2]|0;if((af|0)==0){break L2540}else{m=af}}}}while(0);m=c[ag+96>>2]|0;if((m|0)==0){break L2536}else{ag=m}}}}while(0);cR(q|0,q);g[d+103020>>2]=0.0;d=j|0;cC(c[d>>2]|0,c[j+20>>2]|0);cC(c[d>>2]|0,c[j+24>>2]|0);cC(c[d>>2]|0,c[j+16>>2]|0);cC(c[d>>2]|0,c[j+12>>2]|0);cC(c[d>>2]|0,c[j+8>>2]|0);i=f;return}function dd(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0.0,ah=0,ai=0,aj=0,ak=0,al=0.0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0.0,av=0.0,aw=0.0,ax=0.0,ay=0,az=0.0,aA=0.0,aB=0,aC=0,aD=0.0,aE=0.0,aF=0.0,aG=0.0,aI=0.0,aJ=0,aK=0,aL=0.0,aM=0,aN=0,aO=0,aP=0.0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0.0,a3=0,a4=0,a5=0;f=i;i=i+348|0;h=f|0;j=f+16|0;l=f+68|0;m=f+200|0;n=f+208|0;o=f+244|0;p=f+280|0;q=f+288|0;r=f+324|0;s=d+102872|0;t=d+102944|0;c4(j,64,32,0,d+68|0,c[t>>2]|0);u=d+102995|0;L2551:do{if((a[u]&1)<<24>>24==0){v=d+102932|0}else{w=c[d+102952>>2]|0;L2554:do{if((w|0)!=0){x=w;while(1){y=x+4|0;b[y>>1]=b[y>>1]&-2;g[x+60>>2]=0.0;y=c[x+96>>2]|0;if((y|0)==0){break L2554}else{x=y}}}}while(0);w=d+102932|0;x=c[w>>2]|0;if((x|0)==0){v=w;break}else{z=x}while(1){x=z+4|0;c[x>>2]=c[x>>2]&-34;c[z+128>>2]=0;g[z+132>>2]=1.0;x=c[z+12>>2]|0;if((x|0)==0){v=w;break L2551}else{z=x}}}}while(0);z=n;n=o;o=j+28|0;w=j+36|0;x=j+32|0;y=j+40|0;A=j+8|0;B=j+44|0;C=j+12|0;D=p|0;E=p+4|0;F=q;q=e|0;G=r|0;H=r+4|0;I=r+8|0;J=r+16|0;K=e+12|0;e=r+12|0;L=r+20|0;M=s|0;N=d+102994|0;d=h+8|0;O=h+12|0;P=h;S=l+16|0;T=l+20|0;U=l+24|0;V=l+44|0;W=l+48|0;X=l+52|0;Y=l|0;Z=l+28|0;_=l+56|0;$=l+92|0;aa=l+128|0;ab=m|0;ac=m+4|0;while(1){ad=c[v>>2]|0;if((ad|0)==0){ae=1;af=2006;break}else{ag=1.0;ah=0;ai=ad}while(1){ad=ai+4|0;aj=c[ad>>2]|0;do{if((aj&4|0)==0){ak=ah;al=ag}else{if((c[ai+128>>2]|0)>8){ak=ah;al=ag;break}if((aj&32|0)==0){am=c[ai+48>>2]|0;an=c[ai+52>>2]|0;if((a[am+38|0]&1)<<24>>24!=0){ak=ah;al=ag;break}if((a[an+38|0]&1)<<24>>24!=0){ak=ah;al=ag;break}ao=c[am+8>>2]|0;ap=c[an+8>>2]|0;aq=c[ao>>2]|0;ar=c[ap>>2]|0;if(!((aq|0)==2|(ar|0)==2)){aH(5251272,641,5255872,5246392)}as=b[ao+4>>1]|0;at=b[ap+4>>1]|0;if(!((as&2)<<16>>16!=0&(aq|0)!=0|(at&2)<<16>>16!=0&(ar|0)!=0)){ak=ah;al=ag;break}if(!((as&8)<<16>>16!=0|(aq|0)!=2|((at&8)<<16>>16!=0|(ar|0)!=2))){ak=ah;al=ag;break}ar=ao+28|0;at=ao+60|0;au=+g[at>>2];aq=ap+28|0;as=ap+60|0;av=+g[as>>2];do{if(au<av){if(au<1.0){aw=au}else{aH(5249572,723,5256132,5246076);aw=+g[at>>2]}ax=(av-aw)/(1.0-aw);ay=ao+36|0;az=1.0-ax;aA=az*+g[ao+40>>2]+ax*+g[ao+48>>2];aB=ay;aC=(g[k>>2]=+g[ay>>2]*az+ax*+g[ao+44>>2],c[k>>2]|0);ay=(g[k>>2]=aA,c[k>>2]|0)|0;c[aB>>2]=0|aC;c[aB+4>>2]=ay;ay=ao+52|0;g[ay>>2]=az*+g[ay>>2]+ax*+g[ao+56>>2];g[at>>2]=av;aD=av}else{if(av>=au){aD=au;break}if(av<1.0){aE=av}else{aH(5249572,723,5256132,5246076);aE=+g[as>>2]}ax=(au-aE)/(1.0-aE);ay=ap+36|0;az=1.0-ax;aA=az*+g[ap+40>>2]+ax*+g[ap+48>>2];aB=ay;aC=(g[k>>2]=+g[ay>>2]*az+ax*+g[ap+44>>2],c[k>>2]|0);ay=(g[k>>2]=aA,c[k>>2]|0)|0;c[aB>>2]=0|aC;c[aB+4>>2]=ay;ay=ap+52|0;g[ay>>2]=az*+g[ay>>2]+ax*+g[ap+56>>2];g[as>>2]=au;aD=au}}while(0);if(aD>=1.0){aH(5251272,676,5255872,5246076)}as=c[ai+56>>2]|0;ap=c[ai+60>>2]|0;c[S>>2]=0;c[T>>2]=0;g[U>>2]=0.0;c[V>>2]=0;c[W>>2]=0;g[X>>2]=0.0;bI(Y,c[am+12>>2]|0,as);bI(Z,c[an+12>>2]|0,ap);pq(_,ar,36);pq($,aq,36);g[aa>>2]=1.0;bY(m,l);if((c[ab>>2]|0)==3){au=aD+(1.0-aD)*+g[ac>>2];aF=au<1.0?au:1.0}else{aF=1.0}g[ai+132>>2]=aF;c[ad>>2]=c[ad>>2]|32;aG=aF}else{aG=+g[ai+132>>2]}if(aG>=ag){ak=ah;al=ag;break}ak=ai;al=aG}}while(0);ad=c[ai+12>>2]|0;if((ad|0)==0){break}else{ag=al;ah=ak;ai=ad}}if((ak|0)==0|al>.9999988079071045){ae=1;af=2005;break}ad=c[(c[ak+48>>2]|0)+8>>2]|0;aj=c[(c[ak+52>>2]|0)+8>>2]|0;ap=ad+28|0;pq(z,ap,36);as=aj+28|0;pq(n,as,36);at=ad+60|0;au=+g[at>>2];if(au<1.0){aI=au}else{aH(5249572,723,5256132,5246076);aI=+g[at>>2]}au=(al-aI)/(1.0-aI);ao=ad+36|0;av=1.0-au;ay=ad+44|0;aB=ad+48|0;ax=+g[ao>>2]*av+au*+g[ay>>2];az=av*+g[ad+40>>2]+au*+g[aB>>2];aC=ao;ao=(g[k>>2]=ax,c[k>>2]|0);aJ=0|ao;ao=(g[k>>2]=az,c[k>>2]|0)|0;c[aC>>2]=aJ;c[aC+4>>2]=ao;aC=ad+52|0;aK=ad+56|0;aA=av*+g[aC>>2]+au*+g[aK>>2];g[aC>>2]=aA;g[at>>2]=al;at=ad+44|0;c[at>>2]=aJ;c[at+4>>2]=ao;g[aK>>2]=aA;au=+R(+aA);ao=ad+20|0;g[ao>>2]=au;av=+Q(+aA);at=ad+24|0;g[at>>2]=av;aJ=ad+28|0;aA=+g[aJ>>2];aC=ad+32|0;aL=+g[aC>>2];aM=ad+12|0;aN=(g[k>>2]=ax-(av*aA-au*aL),c[k>>2]|0);aO=(g[k>>2]=az-(au*aA+av*aL),c[k>>2]|0)|0;c[aM>>2]=0|aN;c[aM+4>>2]=aO;aO=aj+60|0;aL=+g[aO>>2];if(aL<1.0){aP=aL}else{aH(5249572,723,5256132,5246076);aP=+g[aO>>2]}aL=(al-aP)/(1.0-aP);aN=aj+36|0;av=1.0-aL;aQ=aj+44|0;aR=aj+48|0;aA=+g[aN>>2]*av+aL*+g[aQ>>2];au=av*+g[aj+40>>2]+aL*+g[aR>>2];aS=aN;aN=(g[k>>2]=aA,c[k>>2]|0);aT=0|aN;aN=(g[k>>2]=au,c[k>>2]|0)|0;c[aS>>2]=aT;c[aS+4>>2]=aN;aS=aj+52|0;aU=aj+56|0;az=av*+g[aS>>2]+aL*+g[aU>>2];g[aS>>2]=az;g[aO>>2]=al;aO=aj+44|0;c[aO>>2]=aT;c[aO+4>>2]=aN;g[aU>>2]=az;aL=+R(+az);aN=aj+20|0;g[aN>>2]=aL;av=+Q(+az);aO=aj+24|0;g[aO>>2]=av;aT=aj+28|0;az=+g[aT>>2];aS=aj+32|0;ax=+g[aS>>2];aV=aj+12|0;aW=(g[k>>2]=aA-(av*az-aL*ax),c[k>>2]|0);aX=(g[k>>2]=au-(aL*az+av*ax),c[k>>2]|0)|0;c[aV>>2]=0|aW;c[aV+4>>2]=aX;dH(ak,c[t>>2]|0);aX=ak+4|0;aW=c[aX>>2]|0;c[aX>>2]=aW&-33;aY=ak+128|0;c[aY>>2]=(c[aY>>2]|0)+1|0;if((aW&6|0)!=6){c[aX>>2]=aW&-37;pq(ap,z,36);pq(as,n,36);ax=+g[aK>>2];av=+R(+ax);g[ao>>2]=av;az=+Q(+ax);g[at>>2]=az;ax=+g[aJ>>2];aL=+g[aC>>2];au=+g[aB>>2]-(av*ax+az*aL);aB=(g[k>>2]=+g[ay>>2]-(az*ax-av*aL),c[k>>2]|0);ay=(g[k>>2]=au,c[k>>2]|0)|0;c[aM>>2]=0|aB;c[aM+4>>2]=ay;au=+g[aU>>2];aL=+R(+au);g[aN>>2]=aL;av=+Q(+au);g[aO>>2]=av;au=+g[aT>>2];ax=+g[aS>>2];az=+g[aR>>2]-(aL*au+av*ax);aR=(g[k>>2]=+g[aQ>>2]-(av*au-aL*ax),c[k>>2]|0);aQ=(g[k>>2]=az,c[k>>2]|0)|0;c[aV>>2]=0|aR;c[aV+4>>2]=aQ;continue}aQ=ad+4|0;aV=b[aQ>>1]|0;if((aV&2)<<16>>16==0){b[aQ>>1]=aV|2;g[ad+144>>2]=0.0}aV=aj+4|0;aR=b[aV>>1]|0;if((aR&2)<<16>>16==0){b[aV>>1]=aR|2;g[aj+144>>2]=0.0}c[o>>2]=0;c[w>>2]=0;c[x>>2]=0;aR=c[y>>2]|0;do{if((aR|0)>0){aS=ad+8|0;c[aS>>2]=0;aT=c[A>>2]|0;c[aT>>2]=ad;c[o>>2]=1;if((aR|0)>1){aZ=aS;a_=aT;break}else{a$=aS;a0=aT;af=1951;break}}else{aH(5249388,54,5255764,5248620);aT=ad+8|0;c[aT>>2]=0;aS=c[A>>2]|0;c[aS>>2]=ad;c[o>>2]=1;a$=aT;a0=aS;af=1951;break}}while(0);if((af|0)==1951){af=0;aH(5249388,54,5255764,5248620);aZ=a$;a_=a0}aR=aj+8|0;c[aR>>2]=1;c[a_+4>>2]=aj;c[o>>2]=2;if((c[B>>2]|0)<=0){aH(5249388,62,5255700,5248884)}c[w>>2]=1;c[c[C>>2]>>2]=ak;b[aQ>>1]=b[aQ>>1]|1;b[aV>>1]=b[aV>>1]|1;c[aX>>2]=c[aX>>2]|1;c[D>>2]=ad;c[E>>2]=aj;aS=1;aT=ad;while(1){L2635:do{if((c[aT>>2]|0)==2){aO=c[aT+112>>2]|0;if((aO|0)==0){break}aN=aT+4|0;aU=c[y>>2]|0;ay=aO;aO=c[o>>2]|0;while(1){if((aO|0)==(aU|0)){break L2635}aM=c[w>>2]|0;aB=c[B>>2]|0;if((aM|0)==(aB|0)){break L2635}aC=c[ay+4>>2]|0;aJ=aC+4|0;L2642:do{if((c[aJ>>2]&1|0)==0){at=c[ay>>2]|0;ao=at|0;do{if((c[ao>>2]|0)==2){if((b[aN>>1]&8)<<16>>16!=0){break}if((b[at+4>>1]&8)<<16>>16==0){a1=aO;break L2642}}}while(0);if((a[(c[aC+48>>2]|0)+38|0]&1)<<24>>24!=0){a1=aO;break}if((a[(c[aC+52>>2]|0)+38|0]&1)<<24>>24!=0){a1=aO;break}aK=at+28|0;pq(F,aK,36);as=at+4|0;if((b[as>>1]&1)<<16>>16==0){ap=at+60|0;az=+g[ap>>2];if(az<1.0){a2=az}else{aH(5249572,723,5256132,5246076);a2=+g[ap>>2]}az=(al-a2)/(1.0-a2);aW=at+36|0;ax=1.0-az;aL=+g[aW>>2]*ax+az*+g[at+44>>2];au=ax*+g[at+40>>2]+az*+g[at+48>>2];aY=aW;aW=(g[k>>2]=aL,c[k>>2]|0);a3=0|aW;aW=(g[k>>2]=au,c[k>>2]|0)|0;c[aY>>2]=a3;c[aY+4>>2]=aW;aY=at+52|0;a4=at+56|0;av=ax*+g[aY>>2]+az*+g[a4>>2];g[aY>>2]=av;g[ap>>2]=al;ap=at+44|0;c[ap>>2]=a3;c[ap+4>>2]=aW;g[a4>>2]=av;az=+R(+av);g[at+20>>2]=az;ax=+Q(+av);g[at+24>>2]=ax;av=+g[at+28>>2];aA=+g[at+32>>2];a4=at+12|0;aW=(g[k>>2]=aL-(ax*av-az*aA),c[k>>2]|0);ap=(g[k>>2]=au-(az*av+ax*aA),c[k>>2]|0)|0;c[a4>>2]=0|aW;c[a4+4>>2]=ap}dH(aC,c[t>>2]|0);ap=c[aJ>>2]|0;if((ap&4|0)==0){pq(aK,F,36);aA=+g[at+56>>2];ax=+R(+aA);g[at+20>>2]=ax;av=+Q(+aA);g[at+24>>2]=av;aA=+g[at+28>>2];az=+g[at+32>>2];au=+g[at+48>>2]-(ax*aA+av*az);a4=at+12|0;aW=(g[k>>2]=+g[at+44>>2]-(av*aA-ax*az),c[k>>2]|0);a3=(g[k>>2]=au,c[k>>2]|0)|0;c[a4>>2]=0|aW;c[a4+4>>2]=a3;a1=aO;break}if((ap&2|0)==0){pq(aK,F,36);au=+g[at+56>>2];az=+R(+au);g[at+20>>2]=az;ax=+Q(+au);g[at+24>>2]=ax;au=+g[at+28>>2];aA=+g[at+32>>2];av=+g[at+48>>2]-(az*au+ax*aA);aK=at+12|0;a3=(g[k>>2]=+g[at+44>>2]-(ax*au-az*aA),c[k>>2]|0);a4=(g[k>>2]=av,c[k>>2]|0)|0;c[aK>>2]=0|a3;c[aK+4>>2]=a4;a1=aO;break}c[aJ>>2]=ap|1;if((aM|0)>=(aB|0)){aH(5249388,62,5255700,5248884)}c[w>>2]=aM+1|0;c[(c[C>>2]|0)+(aM<<2)>>2]=aC;ap=b[as>>1]|0;if((ap&1)<<16>>16!=0){a1=aO;break}b[as>>1]=ap|1;do{if((c[ao>>2]|0)!=0){if((ap&2)<<16>>16!=0){break}b[as>>1]=ap|3;g[at+144>>2]=0.0}}while(0);if((aO|0)>=(aU|0)){aH(5249388,54,5255764,5248620)}c[at+8>>2]=aO;c[(c[A>>2]|0)+(aO<<2)>>2]=at;ap=aO+1|0;c[o>>2]=ap;a1=ap}else{a1=aO}}while(0);aC=c[ay+12>>2]|0;if((aC|0)==0){break L2635}else{ay=aC;aO=a1}}}}while(0);if((aS|0)>=2){break}aO=c[p+(aS<<2)>>2]|0;aS=aS+1|0;aT=aO}av=(1.0-al)*+g[q>>2];g[G>>2]=av;g[H>>2]=1.0/av;g[I>>2]=1.0;c[J>>2]=20;c[e>>2]=c[K>>2]|0;a[L]=0;c8(j,r,c[aZ>>2]|0,c[aR>>2]|0);aT=c[o>>2]|0;L2680:do{if((aT|0)>0){aS=c[A>>2]|0;ad=0;while(1){aj=c[aS+(ad<<2)>>2]|0;aX=aj+4|0;b[aX>>1]=b[aX>>1]&-2;L2684:do{if((c[aj>>2]|0)==2){av=+g[aj+52>>2];aA=+R(+av);g[d>>2]=aA;az=+Q(+av);g[O>>2]=az;av=+g[aj+28>>2];au=+g[aj+32>>2];ax=+g[aj+40>>2]-(aA*av+az*au);aX=(g[k>>2]=+g[aj+36>>2]-(az*av-aA*au),c[k>>2]|0);aV=(g[k>>2]=ax,c[k>>2]|0)|0;c[P>>2]=0|aX;c[P+4>>2]=aV;aV=(c[aj+88>>2]|0)+102872|0;aX=c[aj+100>>2]|0;L2686:do{if((aX|0)!=0){aQ=aj+12|0;aO=aX;while(1){c1(aO,aV,h,aQ);ay=c[aO+4>>2]|0;if((ay|0)==0){break L2686}else{aO=ay}}}}while(0);aV=c[aj+112>>2]|0;if((aV|0)==0){break}else{a5=aV}while(1){aV=(c[a5+4>>2]|0)+4|0;c[aV>>2]=c[aV>>2]&-34;aV=c[a5+12>>2]|0;if((aV|0)==0){break L2684}else{a5=aV}}}}while(0);aj=ad+1|0;if((aj|0)<(aT|0)){ad=aj}else{break L2680}}}}while(0);cR(M,s);if((a[N]&1)<<24>>24!=0){ae=0;af=2004;break}}if((af|0)==2004){a[u]=ae;N=j|0;s=c[N>>2]|0;M=j+20|0;a5=c[M>>2]|0;h=a5;cC(s,h);P=c[N>>2]|0;O=j+24|0;d=c[O>>2]|0;o=d;cC(P,o);aZ=c[N>>2]|0;r=j+16|0;L=c[r>>2]|0;K=L;cC(aZ,K);e=c[N>>2]|0;J=c[C>>2]|0;I=J;cC(e,I);H=c[A>>2]|0;G=H;cC(e,G);i=f;return}else if((af|0)==2005){a[u]=ae;N=j|0;s=c[N>>2]|0;M=j+20|0;a5=c[M>>2]|0;h=a5;cC(s,h);P=c[N>>2]|0;O=j+24|0;d=c[O>>2]|0;o=d;cC(P,o);aZ=c[N>>2]|0;r=j+16|0;L=c[r>>2]|0;K=L;cC(aZ,K);e=c[N>>2]|0;J=c[C>>2]|0;I=J;cC(e,I);H=c[A>>2]|0;G=H;cC(e,G);i=f;return}else if((af|0)==2006){a[u]=ae;N=j|0;s=c[N>>2]|0;M=j+20|0;a5=c[M>>2]|0;h=a5;cC(s,h);P=c[N>>2]|0;O=j+24|0;d=c[O>>2]|0;o=d;cC(P,o);aZ=c[N>>2]|0;r=j+16|0;L=c[r>>2]|0;K=L;cC(aZ,K);e=c[N>>2]|0;J=c[C>>2]|0;I=J;cC(e,I);H=c[A>>2]|0;G=H;cC(e,G);i=f;return}}function de(b,d,e,f){b=b|0;d=+d;e=e|0;f=f|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0.0,p=0,q=0,r=0,s=0;h=i;i=i+24|0;j=h|0;k=b+102868|0;l=c[k>>2]|0;if((l&1|0)==0){m=l}else{l=b+102872|0;cR(l|0,l);l=c[k>>2]&-2;c[k>>2]=l;m=l}c[k>>2]=m|2;m=j|0;g[m>>2]=d;c[j+12>>2]=e;c[j+16>>2]=f;f=d>0.0;if(f){g[j+4>>2]=1.0/d}else{g[j+4>>2]=0.0}e=b+102988|0;g[j+8>>2]=+g[e>>2]*d;a[j+20|0]=a[b+102992|0]&1;cQ(b+102872|0);g[b+103e3>>2]=0.0;if(!((a[b+102995|0]&1)<<24>>24==0|f^1)){dc(b,j);g[b+103004>>2]=0.0}do{if((a[b+102993|0]&1)<<24>>24==0){n=2017}else{d=+g[m>>2];if(d<=0.0){o=d;break}dd(b,j);g[b+103024>>2]=0.0;n=2017;break}}while(0);if((n|0)==2017){o=+g[m>>2]}if(o>0.0){g[e>>2]=+g[j+4>>2]}j=c[k>>2]|0;if((j&4|0)==0){p=j;q=p&-3;c[k>>2]=q;r=b+102996|0;g[r>>2]=0.0;i=h;return}e=c[b+102952>>2]|0;if((e|0)==0){p=j;q=p&-3;c[k>>2]=q;r=b+102996|0;g[r>>2]=0.0;i=h;return}else{s=e}while(1){g[s+76>>2]=0.0;g[s+80>>2]=0.0;g[s+84>>2]=0.0;e=c[s+96>>2]|0;if((e|0)==0){break}else{s=e}}p=c[k>>2]|0;q=p&-3;c[k>>2]=q;r=b+102996|0;g[r>>2]=0.0;i=h;return}function df(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0,y=0,z=0,A=0.0,B=0,C=0,D=0,E=0,F=0,G=0;f=i;i=i+112|0;h=f|0;j=f+8|0;l=f+16|0;m=f+24|0;n=f+32|0;o=f+40|0;p=f+48|0;q=c[b+12>>2]|0;b=c[q+4>>2]|0;if((b|0)==0){r=+g[d+12>>2];s=+g[q+12>>2];t=+g[d+8>>2];u=+g[q+16>>2];v=s*t+r*u+ +g[d+4>>2];g[h>>2]=+g[d>>2]+(r*s-t*u);g[h+4>>2]=v;v=+g[q+8>>2];g[j>>2]=r-t*0.0;g[j+4>>2]=t+r*0.0;w=c[a+102984>>2]|0;aT[c[(c[w>>2]|0)+20>>2]&2047](w,h,v,j,e);i=f;return}else if((b|0)==2){j=c[q+148>>2]|0;do{if((j|0)<9){h=p|0;if((j|0)>0){x=h;y=2038;break}else{z=h;break}}else{aH(5251272,1077,5255796,5245804);x=p|0;y=2038;break}}while(0);L2738:do{if((y|0)==2038){h=q+20|0;v=+g[d+12>>2];r=+g[d+8>>2];t=+g[d>>2];u=+g[d+4>>2];w=0;while(1){s=+g[h+(w<<3)>>2];A=+g[h+(w<<3)+4>>2];B=p+(w<<3)|0;C=(g[k>>2]=t+(v*s-r*A),c[k>>2]|0);D=(g[k>>2]=s*r+v*A+u,c[k>>2]|0)|0;c[B>>2]=0|C;c[B+4>>2]=D;D=w+1|0;if((D|0)==(j|0)){z=x;break L2738}else{w=D}}}}while(0);x=c[a+102984>>2]|0;bj[c[(c[x>>2]|0)+12>>2]&2047](x,z,j,e);i=f;return}else if((b|0)==3){j=c[q+16>>2]|0;z=c[q+12>>2]|0;x=d+12|0;u=+g[x>>2];v=+g[z>>2];p=d+8|0;r=+g[p>>2];t=+g[z+4>>2];y=d|0;A=+g[y>>2];w=d+4|0;s=+g[w>>2];g[n>>2]=A+(u*v-r*t);g[n+4>>2]=v*r+u*t+s;if((j|0)<=1){i=f;return}h=o|0;D=o+4|0;B=a+102984|0;C=o;E=n;F=1;t=u;u=r;r=A;A=s;while(1){s=+g[z+(F<<3)>>2];v=+g[z+(F<<3)+4>>2];g[h>>2]=r+(t*s-u*v);g[D>>2]=s*u+t*v+A;G=c[B>>2]|0;bj[c[(c[G>>2]|0)+24>>2]&2047](G,n,o,e);G=c[B>>2]|0;aZ[c[(c[G>>2]|0)+16>>2]&2047](G,n,.05000000074505806,e);G=c[C+4>>2]|0;c[E>>2]=c[C>>2]|0;c[E+4>>2]=G;G=F+1|0;if((G|0)==(j|0)){break}F=G;t=+g[x>>2];u=+g[p>>2];r=+g[y>>2];A=+g[w>>2]}i=f;return}else if((b|0)==1){A=+g[d+12>>2];r=+g[q+12>>2];u=+g[d+8>>2];t=+g[q+16>>2];v=+g[d>>2];s=+g[d+4>>2];g[l>>2]=v+(A*r-u*t);g[l+4>>2]=r*u+A*t+s;d=q+20|0;t=+g[d>>2];r=+g[d+4>>2];g[m>>2]=v+(A*t-u*r);g[m+4>>2]=t*u+A*r+s;d=c[a+102984>>2]|0;bj[c[(c[d>>2]|0)+24>>2]&2047](d,l,m,e);i=f;return}else{i=f;return}}function dg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;d=i;i=i+60|0;e=d|0;f=d+8|0;h=d+16|0;j=d+24|0;k=d+32|0;l=d+44|0;m=d+52|0;n=(c[b+52>>2]|0)+12|0;o=(c[b+48>>2]|0)+12|0;p=e;q=c[o+4>>2]|0;c[p>>2]=c[o>>2]|0;c[p+4>>2]=q;q=n;n=f;p=c[q+4>>2]|0;c[n>>2]=c[q>>2]|0;c[n+4>>2]=p;p=b;aX[c[c[p>>2]>>2]&2047](h,b);aX[c[(c[p>>2]|0)+4>>2]&2047](j,b);g[k>>2]=.5;g[k+4>>2]=.800000011920929;g[k+8>>2]=.800000011920929;p=c[b+4>>2]|0;if((p|0)==3){n=c[a+102984>>2]|0;bj[c[(c[n>>2]|0)+24>>2]&2047](n,h,j,k);i=d;return}else if((p|0)==4){n=b+68|0;q=l;o=c[n+4>>2]|0;c[q>>2]=c[n>>2]|0;c[q+4>>2]=o;o=b+76|0;b=m;q=c[o+4>>2]|0;c[b>>2]=c[o>>2]|0;c[b+4>>2]=q;q=a+102984|0;b=c[q>>2]|0;bj[c[(c[b>>2]|0)+24>>2]&2047](b,l,h,k);b=c[q>>2]|0;bj[c[(c[b>>2]|0)+24>>2]&2047](b,m,j,k);b=c[q>>2]|0;bj[c[(c[b>>2]|0)+24>>2]&2047](b,l,m,k);i=d;return}else if((p|0)==5){i=d;return}else{p=a+102984|0;a=c[p>>2]|0;bj[c[(c[a>>2]|0)+24>>2]&2047](a,e,h,k);e=c[p>>2]|0;bj[c[(c[e>>2]|0)+24>>2]&2047](e,h,j,k);h=c[p>>2]|0;bj[c[(c[h>>2]|0)+24>>2]&2047](h,f,j,k);i=d;return}}function dh(a){a=a|0;var d=0,e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0.0,R=0.0,S=0.0,T=0.0;d=i;i=i+120|0;e=d|0;f=d+12|0;h=d+24|0;j=d+36|0;k=d+48|0;l=d+60|0;m=d+72|0;n=d+104|0;o=a+102984|0;p=c[o>>2]|0;if((p|0)==0){i=d;return}q=c[p+4>>2]|0;L2768:do{if((q&1|0)!=0){p=c[a+102952>>2]|0;if((p|0)==0){break}r=e|0;s=e+4|0;t=e+8|0;u=j|0;v=j+4|0;w=j+8|0;x=k|0;y=k+4|0;z=k+8|0;A=f|0;B=f+4|0;C=f+8|0;D=h|0;E=h+4|0;F=h+8|0;G=p;while(1){p=G+12|0;H=c[G+100>>2]|0;L2773:do{if((H|0)!=0){I=G+4|0;J=G|0;K=H;while(1){L=b[I>>1]|0;do{if((L&32)<<16>>16==0){g[r>>2]=.5;g[s>>2]=.5;g[t>>2]=.30000001192092896;df(a,K,p,e)}else{M=c[J>>2]|0;if((M|0)==0){g[A>>2]=.5;g[B>>2]=.8999999761581421;g[C>>2]=.5;df(a,K,p,f);break}else if((M|0)==1){g[D>>2]=.5;g[E>>2]=.5;g[F>>2]=.8999999761581421;df(a,K,p,h);break}else{if((L&2)<<16>>16==0){g[u>>2]=.6000000238418579;g[v>>2]=.6000000238418579;g[w>>2]=.6000000238418579;df(a,K,p,j);break}else{g[x>>2]=.8999999761581421;g[y>>2]=.699999988079071;g[z>>2]=.699999988079071;df(a,K,p,k);break}}}}while(0);L=c[K+4>>2]|0;if((L|0)==0){break L2773}else{K=L}}}}while(0);p=c[G+96>>2]|0;if((p|0)==0){break L2768}else{G=p}}}}while(0);L2790:do{if((q&2|0)!=0){k=c[a+102956>>2]|0;if((k|0)==0){break}else{N=k}while(1){dg(a,N);k=c[N+12>>2]|0;if((k|0)==0){break L2790}else{N=k}}}}while(0);L2795:do{if((q&8|0)!=0){N=a+102932|0;while(1){k=c[N>>2]|0;if((k|0)==0){break L2795}else{N=k+12|0}}}}while(0);L2800:do{if((q&4|0)!=0){g[l>>2]=.8999999761581421;g[l+4>>2]=.30000001192092896;g[l+8>>2]=.8999999761581421;N=c[a+102952>>2]|0;if((N|0)==0){break}k=a+102884|0;j=a+102876|0;h=m|0;f=m|0;e=m+4|0;G=m+8|0;z=m+12|0;y=m+16|0;x=m+20|0;w=m+24|0;v=m+28|0;u=N;while(1){L2805:do{if((b[u+4>>1]&32)<<16>>16!=0){N=c[u+100>>2]|0;if((N|0)==0){break}else{O=N}while(1){N=O+28|0;L2809:do{if((c[N>>2]|0)>0){F=O+24|0;E=0;while(1){D=c[(c[F>>2]|0)+(E*28&-1)+24>>2]|0;do{if((D|0)>-1){if((c[k>>2]|0)>(D|0)){break}else{P=2088;break}}else{P=2088}}while(0);if((P|0)==2088){P=0;aH(5251020,159,5254912,5250596)}C=c[j>>2]|0;Q=+g[C+(D*36&-1)>>2];R=+g[C+(D*36&-1)+4>>2];S=+g[C+(D*36&-1)+8>>2];T=+g[C+(D*36&-1)+12>>2];g[f>>2]=Q;g[e>>2]=R;g[G>>2]=S;g[z>>2]=R;g[y>>2]=S;g[x>>2]=T;g[w>>2]=Q;g[v>>2]=T;C=c[o>>2]|0;bj[c[(c[C>>2]|0)+8>>2]&2047](C,h,4,l);C=E+1|0;if((C|0)<(c[N>>2]|0)){E=C}else{break L2809}}}}while(0);N=c[O+4>>2]|0;if((N|0)==0){break L2805}else{O=N}}}}while(0);N=c[u+96>>2]|0;if((N|0)==0){break L2800}else{u=N}}}}while(0);if((q&16|0)==0){i=d;return}q=c[a+102952>>2]|0;if((q|0)==0){i=d;return}a=n;O=n;l=q;while(1){q=l+12|0;c[a>>2]=c[q>>2]|0;c[a+4>>2]=c[q+4>>2]|0;c[a+8>>2]=c[q+8>>2]|0;c[a+12>>2]=c[q+12>>2]|0;q=l+44|0;P=c[q+4>>2]|0;c[O>>2]=c[q>>2]|0;c[O+4>>2]=P;P=c[o>>2]|0;aX[c[(c[P>>2]|0)+28>>2]&2047](P,n);P=c[l+96>>2]|0;if((P|0)==0){break}else{l=P}}i=d;return}function di(a){a=a|0;var b=0,d=0.0,e=0,f=0,j=0,l=0,m=0,n=0;b=i;if((c[a+102868>>2]&2|0)!=0){i=b;return}d=+g[a+102972>>2];cB(5245576,(t=i,i=i+16|0,h[k>>3]=+g[a+102968>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=d,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);cB(5253316,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5253100,(t=i,i=i+4|0,c[t>>2]=c[a+102960>>2]|0,t)|0);cB(5252548,(t=i,i=i+4|0,c[t>>2]=c[a+102964>>2]|0,t)|0);e=c[a+102952>>2]|0;L2834:do{if((e|0)!=0){f=0;j=e;while(1){c[j+8>>2]=f;cN(j);l=c[j+96>>2]|0;if((l|0)==0){break L2834}else{f=f+1|0;j=l}}}}while(0);e=a+102956|0;a=c[e>>2]|0;L2838:do{if((a|0)!=0){j=0;f=a;while(1){c[f+56>>2]=j;l=c[f+12>>2]|0;if((l|0)==0){break}else{j=j+1|0;f=l}}f=c[e>>2]|0;if((f|0)==0){break}else{m=f}while(1){if((c[m+4>>2]|0)!=6){cB(5252168,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);aW[c[(c[m>>2]|0)+16>>2]&2047](m);cB(5251940,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0)}f=c[m+12>>2]|0;if((f|0)==0){break}else{m=f}}f=c[e>>2]|0;if((f|0)==0){break}else{n=f}while(1){if((c[n+4>>2]|0)==6){cB(5252168,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);aW[c[(c[n>>2]|0)+16>>2]&2047](n);cB(5251940,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0)}f=c[n+12>>2]|0;if((f|0)==0){break L2838}else{n=f}}}}while(0);cB(5251752,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5251544,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5251360,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5251164,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);i=b;return}function dj(a){a=a|0;return}function dk(a){a=a|0;return}function dl(a,c,d){a=a|0;c=c|0;d=d|0;var e=0;a=b[c+36>>1]|0;if(!(a<<16>>16!=b[d+36>>1]<<16>>16|a<<16>>16==0)){e=a<<16>>16>0;return e|0}if((b[d+32>>1]&b[c+34>>1])<<16>>16==0){e=0;return e|0}e=(b[d+34>>1]&b[c+32>>1])<<16>>16!=0;return e|0}function dm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0.0,n=0.0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0,L=0,M=0,N=0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0,V=0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0,ae=0.0,af=0.0,ag=0,ah=0,ai=0,aj=0;e=i;i=i+1056|0;f=e|0;h=e+1036|0;j=d;l=c[j+4>>2]|0;m=(c[k>>2]=c[j>>2]|0,+g[k>>2]);n=(c[k>>2]=l,+g[k>>2]);l=d+8|0;o=c[l+4>>2]|0;p=(c[k>>2]=c[l>>2]|0,+g[k>>2]);q=p-m;p=(c[k>>2]=o,+g[k>>2])-n;r=q*q+p*p;if(r<=0.0){aH(5251020,204,5254576,5250848)}s=+O(+r);if(s<1.1920928955078125e-7){t=q;u=p}else{r=1.0/s;t=q*r;u=p*r}r=u*-1.0;if(r>0.0){v=r}else{v=-0.0-r}if(t>0.0){w=t}else{w=-0.0-t}u=+g[d+16>>2];s=m+q*u;x=n+p*u;d=f+4|0;o=f|0;c[o>>2]=d;y=f+1028|0;c[y>>2]=0;z=f+1032|0;c[z>>2]=256;c[(c[o>>2]|0)+(c[y>>2]<<2)>>2]=c[a>>2]|0;f=(c[y>>2]|0)+1|0;c[y>>2]=f;L2879:do{if((f|0)>0){A=a+4|0;B=h;C=h+8|0;D=h+16|0;E=f;F=n<x?n:x;G=m<s?m:s;H=n>x?n:x;I=m>s?m:s;J=u;while(1){K=E;while(1){L=K-1|0;c[y>>2]=L;M=c[o>>2]|0;N=c[M+(L<<2)>>2]|0;if((N|0)==-1){P=J;Q=I;R=H;S=G;T=F;U=L;break}V=c[A>>2]|0;W=+g[V+(N*36&-1)+8>>2];X=+g[V+(N*36&-1)+12>>2];Y=+g[V+(N*36&-1)>>2];Z=+g[V+(N*36&-1)+4>>2];if(G-W>0.0|F-X>0.0|Y-I>0.0|Z-H>0.0){_=J;$=I;aa=H;ab=G;ac=F;ad=2138;break}ae=r*(m-(W+Y)*.5)+t*(n-(X+Z)*.5);if(ae>0.0){af=ae}else{af=-0.0-ae}if(af-(v*(W-Y)*.5+w*(X-Z)*.5)>0.0){_=J;$=I;aa=H;ab=G;ac=F;ad=2138;break}ag=V+(N*36&-1)+24|0;if((c[ag>>2]|0)==-1){ad=2149;break}do{if((L|0)==(c[z>>2]|0)){c[z>>2]=L<<1;ah=pi(L<<3)|0;c[o>>2]=ah;ai=M;pq(ah,ai,c[y>>2]<<2);if((M|0)==(d|0)){break}pj(ai)}}while(0);c[(c[o>>2]|0)+(c[y>>2]<<2)>>2]=c[ag>>2]|0;M=(c[y>>2]|0)+1|0;c[y>>2]=M;L=V+(N*36&-1)+28|0;do{if((M|0)==(c[z>>2]|0)){ai=c[o>>2]|0;c[z>>2]=M<<1;ah=pi(M<<3)|0;c[o>>2]=ah;aj=ai;pq(ah,aj,c[y>>2]<<2);if((ai|0)==(d|0)){break}pj(aj)}}while(0);c[(c[o>>2]|0)+(c[y>>2]<<2)>>2]=c[L>>2]|0;M=(c[y>>2]|0)+1|0;c[y>>2]=M;if((M|0)>0){K=M}else{break L2879}}do{if((ad|0)==2149){ad=0;K=c[j+4>>2]|0;c[B>>2]=c[j>>2]|0;c[B+4>>2]=K;K=c[l+4>>2]|0;c[C>>2]=c[l>>2]|0;c[C+4>>2]=K;g[D>>2]=J;Z=+dn(b,h,N);if(Z==0.0){break L2879}if(Z<=0.0){_=J;$=I;aa=H;ab=G;ac=F;ad=2138;break}X=m+q*Z;Y=n+p*Z;_=Z;$=m>X?m:X;aa=n>Y?n:Y;ab=m<X?m:X;ac=n<Y?n:Y;ad=2138;break}}while(0);if((ad|0)==2138){ad=0;P=_;Q=$;R=aa;S=ab;T=ac;U=c[y>>2]|0}if((U|0)>0){E=U;F=T;G=S;H=R;I=Q;J=P}else{break L2879}}}}while(0);U=c[o>>2]|0;if((U|0)==(d|0)){i=e;return}pj(U);c[o>>2]=0;i=e;return}function dn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0.0,m=0.0,n=0.0;e=i;i=i+20|0;f=e|0;h=e+12|0;j=c[a>>2]|0;do{if((d|0)>-1){if((c[j+12>>2]|0)>(d|0)){break}else{k=2168;break}}else{k=2168}}while(0);if((k|0)==2168){aH(5251020,153,5254864,5250596)}k=c[(c[j+4>>2]|0)+(d*36&-1)+16>>2]|0;d=c[k+16>>2]|0;j=c[d+12>>2]|0;if(a$[c[(c[j>>2]|0)+20>>2]&2047](j,f,b,(c[d+8>>2]|0)+12|0,c[k+20>>2]|0)|0){l=+g[f+8>>2];m=1.0-l;n=m*+g[b+4>>2]+l*+g[b+12>>2];g[h>>2]=+g[b>>2]*m+l*+g[b+8>>2];g[h+4>>2]=n;k=c[a+4>>2]|0;n=+bb[c[(c[k>>2]|0)+8>>2]&2047](k,d,h,f|0,l);i=e;return+n}else{n=+g[b+16>>2];i=e;return+n}return 0.0}function dp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;e=i;i=i+1036|0;f=e|0;h=f+4|0;j=f|0;c[j>>2]=h;k=f+1028|0;c[k>>2]=0;l=f+1032|0;c[l>>2]=256;c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[a>>2]|0;f=(c[k>>2]|0)+1|0;c[k>>2]=f;L2925:do{if((f|0)>0){m=a+4|0;n=d|0;o=d+4|0;p=d+8|0;q=d+12|0;r=b|0;s=b+4|0;t=f;while(1){u=t-1|0;c[k>>2]=u;v=c[j>>2]|0;w=c[v+(u<<2)>>2]|0;do{if((w|0)==-1){x=u}else{y=c[m>>2]|0;if(+g[n>>2]- +g[y+(w*36&-1)+8>>2]>0.0|+g[o>>2]- +g[y+(w*36&-1)+12>>2]>0.0|+g[y+(w*36&-1)>>2]- +g[p>>2]>0.0|+g[y+(w*36&-1)+4>>2]- +g[q>>2]>0.0){x=u;break}z=y+(w*36&-1)+24|0;if((c[z>>2]|0)==-1){A=c[r>>2]|0;do{if((w|0)>-1){if((c[A+12>>2]|0)>(w|0)){break}else{B=2184;break}}else{B=2184}}while(0);if((B|0)==2184){B=0;aH(5251020,153,5254864,5250596)}C=c[s>>2]|0;if(!(ba[c[(c[C>>2]|0)+8>>2]&2047](C,c[(c[(c[A+4>>2]|0)+(w*36&-1)+16>>2]|0)+16>>2]|0)|0)){break L2925}x=c[k>>2]|0;break}do{if((u|0)==(c[l>>2]|0)){c[l>>2]=u<<1;C=pi(u<<3)|0;c[j>>2]=C;D=v;pq(C,D,c[k>>2]<<2);if((v|0)==(h|0)){break}pj(D)}}while(0);c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[z>>2]|0;A=(c[k>>2]|0)+1|0;c[k>>2]=A;D=y+(w*36&-1)+28|0;do{if((A|0)==(c[l>>2]|0)){C=c[j>>2]|0;c[l>>2]=A<<1;E=pi(A<<3)|0;c[j>>2]=E;F=C;pq(E,F,c[k>>2]<<2);if((C|0)==(h|0)){break}pj(F)}}while(0);c[(c[j>>2]|0)+(c[k>>2]<<2)>>2]=c[D>>2]|0;A=(c[k>>2]|0)+1|0;c[k>>2]=A;x=A}}while(0);if((x|0)>0){t=x}else{break L2925}}}}while(0);x=c[j>>2]|0;if((x|0)==(h|0)){i=e;return}pj(x);c[j>>2]=0;i=e;return}function dq(a){a=a|0;pl(a);return}function dr(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0;h=cA(f,144)|0;if((h|0)==0){i=0;j=i|0;return j|0}f=h;k=h;c[k>>2]=5259356;c[h+4>>2]=4;c[h+48>>2]=a;l=h+52|0;c[l>>2]=d;c[h+56>>2]=b;c[h+60>>2]=e;c[h+124>>2]=0;c[h+128>>2]=0;pr(h+8|0,0,40);g[h+136>>2]=+O(+(+g[a+16>>2]*+g[d+16>>2]));m=+g[a+20>>2];n=+g[d+20>>2];g[h+140>>2]=m>n?m:n;c[k>>2]=5259504;if((c[(c[a+12>>2]|0)+4>>2]|0)==3){o=d}else{aH(5250780,43,5257056,5252732);o=c[l>>2]|0}if((c[(c[o+12>>2]|0)+4>>2]|0)==0){i=f;j=i|0;return j|0}aH(5250780,44,5257056,5250136);i=f;j=i|0;return j|0}function ds(b,d){b=b|0;d=d|0;var e=0,f=0;aW[c[(c[b>>2]|0)+4>>2]&2047](b);e=a[5261684]|0;if((e&255)>=14){aH(5246516,173,5257772,5247588)}f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}function dt(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var h=0,j=0,k=0,l=0;h=i;i=i+48|0;j=h|0;k=c[(c[a+48>>2]|0)+12>>2]|0;c[j>>2]=5260312;c[j+4>>2]=1;g[j+8>>2]=.009999999776482582;l=j+28|0;c[l>>2]=0;c[l+4>>2]=0;c[l+8>>2]=0;c[l+12>>2]=0;b[l+16>>1]=0;cg(k,j,c[a+56>>2]|0);bB(d,j,e,c[(c[a+52>>2]|0)+12>>2]|0,f);i=h;return}function du(a){a=a|0;pl(a);return}function dv(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0,l=0,m=0.0,n=0.0,o=0;h=cA(f,144)|0;if((h|0)==0){i=0;j=i|0;return j|0}f=h;k=h;c[k>>2]=5259356;c[h+4>>2]=4;c[h+48>>2]=a;l=h+52|0;c[l>>2]=d;c[h+56>>2]=b;c[h+60>>2]=e;c[h+124>>2]=0;c[h+128>>2]=0;pr(h+8|0,0,40);g[h+136>>2]=+O(+(+g[a+16>>2]*+g[d+16>>2]));m=+g[a+20>>2];n=+g[d+20>>2];g[h+140>>2]=m>n?m:n;c[k>>2]=5259456;if((c[(c[a+12>>2]|0)+4>>2]|0)==3){o=d}else{aH(5250640,43,5256888,5252732);o=c[l>>2]|0}if((c[(c[o+12>>2]|0)+4>>2]|0)==2){i=f;j=i|0;return j|0}aH(5250640,44,5256888,5250092);i=f;j=i|0;return j|0}function dw(b,d){b=b|0;d=d|0;var e=0,f=0;aW[c[(c[b>>2]|0)+4>>2]&2047](b);e=a[5261684]|0;if((e&255)>=14){aH(5246516,173,5257772,5247588)}f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}function dx(a,d,e,f){a=a|0;d=d|0;e=e|0;f=f|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+300|0;j=h|0;k=h+252|0;l=c[(c[a+48>>2]|0)+12>>2]|0;c[k>>2]=5260312;c[k+4>>2]=1;g[k+8>>2]=.009999999776482582;m=k+28|0;c[m>>2]=0;c[m+4>>2]=0;c[m+8>>2]=0;c[m+12>>2]=0;b[m+16>>1]=0;cg(l,k,c[a+56>>2]|0);bC(j,d,k,e,c[(c[a+52>>2]|0)+12>>2]|0,f);i=h;return}function dy(a){a=a|0;pl(a);return}function dz(a){a=a|0;return}function dA(a){a=a|0;return}function dB(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0.0,k=0.0,l=0.0,m=0.0,n=0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0;f=c[(c[a+48>>2]|0)+12>>2]|0;h=c[(c[a+52>>2]|0)+12>>2]|0;a=b+60|0;c[a>>2]=0;i=f+12|0;j=+g[d+12>>2];k=+g[i>>2];l=+g[d+8>>2];m=+g[f+16>>2];n=h+12|0;o=+g[e+12>>2];p=+g[n>>2];q=+g[e+8>>2];r=+g[h+16>>2];s=+g[e>>2]+(o*p-q*r)-(+g[d>>2]+(j*k-l*m));t=p*q+o*r+ +g[e+4>>2]-(k*l+j*m+ +g[d+4>>2]);m=+g[f+8>>2]+ +g[h+8>>2];if(s*s+t*t>m*m){return}c[b+56>>2]=0;h=i;i=b+48|0;f=c[h+4>>2]|0;c[i>>2]=c[h>>2]|0;c[i+4>>2]=f;g[b+40>>2]=0.0;g[b+44>>2]=0.0;c[a>>2]=1;a=n;n=b;f=c[a+4>>2]|0;c[n>>2]=c[a>>2]|0;c[n+4>>2]=f;c[b+16>>2]=0;return}function dC(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0,m=0;e=cA(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;b=e;c[b>>2]=5259356;c[e+4>>2]=4;c[e+48>>2]=a;j=e+52|0;c[j>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;pr(e+8|0,0,40);g[e+136>>2]=+O(+(+g[a+16>>2]*+g[d+16>>2]));k=+g[a+20>>2];l=+g[d+20>>2];g[e+140>>2]=k>l?k:l;c[b>>2]=5259844;if((c[(c[a+12>>2]|0)+4>>2]|0)==0){m=d}else{aH(5250508,44,5258032,5252656);m=c[j>>2]|0}if((c[(c[m+12>>2]|0)+4>>2]|0)==0){h=f;i=h|0;return i|0}aH(5250508,45,5258032,5250136);h=f;i=h|0;return i|0}function dD(b,d){b=b|0;d=d|0;var e=0,f=0;aW[c[(c[b>>2]|0)+4>>2]&2047](b);e=a[5261684]|0;if((e&255)>=14){aH(5246516,173,5257772,5247588)}f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}function dE(a){a=a|0;pl(a);return}function dF(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0;if((a[5261340]&1)<<24>>24==0){c[1315336]=882;c[1315337]=416;a[5261352]=1;c[1315360]=108;c[1315361]=1256;a[5261448]=1;c[1315342]=108;c[1315343]=1256;a[5261376]=0;c[1315366]=1556;c[1315367]=912;a[5261472]=1;c[1315348]=852;c[1315349]=266;a[5261400]=1;c[1315339]=852;c[1315340]=266;a[5261364]=0;c[1315354]=1190;c[1315355]=708;a[5261424]=1;c[1315363]=1190;c[1315364]=708;a[5261460]=0;c[1315372]=688;c[1315373]=666;a[5261496]=1;c[1315345]=688;c[1315346]=666;a[5261388]=0;c[1315378]=1566;c[1315379]=486;a[5261520]=1;c[1315369]=1566;c[1315370]=486;a[5261484]=0;a[5261340]=1}h=c[(c[b+12>>2]|0)+4>>2]|0;i=c[(c[e+12>>2]|0)+4>>2]|0;if(h>>>0>=4){aH(5250416,80,5255544,5252612)}if(i>>>0>=4){aH(5250416,81,5255544,5250208)}j=c[5261344+(h*48&-1)+(i*12&-1)>>2]|0;if((j|0)==0){k=0;return k|0}if((a[5261344+(h*48&-1)+(i*12&-1)+8|0]&1)<<24>>24==0){k=a$[j&2047](e,f,b,d,g)|0;return k|0}else{k=a$[j&2047](b,d,e,f,g)|0;return k|0}return 0}function dG(d,e){d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;if((a[5261340]&1)<<24>>24==0){aH(5250416,103,5255480,5248120)}f=d+48|0;do{if((c[d+124>>2]|0)>0){h=c[(c[f>>2]|0)+8>>2]|0;i=h+4|0;j=b[i>>1]|0;if((j&2)<<16>>16==0){b[i>>1]=j|2;g[h+144>>2]=0.0}h=d+52|0;j=c[(c[h>>2]|0)+8>>2]|0;i=j+4|0;k=b[i>>1]|0;if((k&2)<<16>>16!=0){l=h;break}b[i>>1]=k|2;g[j+144>>2]=0.0;l=h}else{l=d+52|0}}while(0);h=c[(c[(c[f>>2]|0)+12>>2]|0)+4>>2]|0;f=c[(c[(c[l>>2]|0)+12>>2]|0)+4>>2]|0;if((h|0)>-1&(f|0)<4){m=5261344+(h*48&-1)+(f*12&-1)+4|0;n=c[m>>2]|0;aX[n&2047](d,e);return}aH(5250416,114,5255480,5247272);aH(5250416,115,5255480,5247272);m=5261344+(h*48&-1)+(f*12&-1)+4|0;n=c[m>>2]|0;aX[n&2047](d,e);return}function dH(d,e){d=d|0;e=e|0;var f=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;f=i;i=i+192|0;h=f|0;j=f+92|0;k=f+104|0;l=f+128|0;m=d+64|0;pq(l,m,64);n=d+4|0;o=c[n>>2]|0;c[n>>2]=o|4;p=o>>>1;o=c[d+48>>2]|0;q=c[d+52>>2]|0;r=((a[q+38|0]|a[o+38|0])&1)<<24>>24!=0;s=c[o+8>>2]|0;t=c[q+8>>2]|0;u=s+12|0;v=t+12|0;do{if(r){w=c[o+12>>2]|0;x=c[q+12>>2]|0;y=c[d+56>>2]|0;z=c[d+60>>2]|0;c[h+16>>2]=0;c[h+20>>2]=0;g[h+24>>2]=0.0;c[h+44>>2]=0;c[h+48>>2]=0;g[h+52>>2]=0.0;bI(h|0,w,y);bI(h+28|0,x,z);z=h+56|0;x=u;c[z>>2]=c[x>>2]|0;c[z+4>>2]=c[x+4>>2]|0;c[z+8>>2]=c[x+8>>2]|0;c[z+12>>2]=c[x+12>>2]|0;x=h+72|0;z=v;c[x>>2]=c[z>>2]|0;c[x+4>>2]=c[z+4>>2]|0;c[x+8>>2]=c[z+8>>2]|0;c[x+12>>2]=c[z+12>>2]|0;a[h+88|0]=1;b[j+4>>1]=0;bK(k,j,h);z=+g[k+16>>2]<11920928955078125.0e-22&1;c[d+124>>2]=0;A=z;B=p&1}else{bj[c[c[d>>2]>>2]&2047](d,m,u,v);z=d+124|0;x=(c[z>>2]|0)>0;y=x&1;L3052:do{if(x){w=c[l+60>>2]|0;C=0;while(1){D=d+64+(C*20&-1)+8|0;g[D>>2]=0.0;E=d+64+(C*20&-1)+12|0;g[E>>2]=0.0;F=c[d+64+(C*20&-1)+16>>2]|0;G=0;while(1){if((G|0)>=(w|0)){break}if((c[l+(G*20&-1)+16>>2]|0)==(F|0)){H=2285;break}else{G=G+1|0}}if((H|0)==2285){H=0;g[D>>2]=+g[l+(G*20&-1)+8>>2];g[E>>2]=+g[l+(G*20&-1)+12>>2]}F=C+1|0;if((F|0)<(c[z>>2]|0)){C=F}else{break L3052}}}}while(0);z=p&1;if(!(x^(z|0)!=0)){A=y;B=z;break}C=s+4|0;w=b[C>>1]|0;if((w&2)<<16>>16==0){b[C>>1]=w|2;g[s+144>>2]=0.0}w=t+4|0;C=b[w>>1]|0;if((C&2)<<16>>16!=0){A=y;B=z;break}b[w>>1]=C|2;g[t+144>>2]=0.0;A=y;B=z}}while(0);t=A<<24>>24!=0;A=c[n>>2]|0;c[n>>2]=t?A|2:A&-3;A=t^1;n=(e|0)==0;if(!((B|0)!=0|A|n)){aX[c[(c[e>>2]|0)+8>>2]&2047](e,d)}if(!(t|(B|0)==0|n)){aX[c[(c[e>>2]|0)+12>>2]&2047](e,d)}if(r|A|n){i=f;return}bg[c[(c[e>>2]|0)+16>>2]&2047](e,d,l);i=f;return}function dI(a){a=a|0;pl(a);return}
function dJ(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=b;f=d;c[e>>2]=c[f>>2]|0;c[e+4>>2]=c[f+4>>2]|0;c[e+8>>2]=c[f+8>>2]|0;c[e+12>>2]=c[f+12>>2]|0;c[e+16>>2]=c[f+16>>2]|0;c[e+20>>2]=c[f+20>>2]|0;f=c[d+40>>2]|0;e=b+32|0;c[e>>2]=f;h=c[d+28>>2]|0;i=b+48|0;c[i>>2]=h;j=h*88&-1;h=f+102796|0;k=c[h>>2]|0;if((k|0)<32){l=k}else{aH(5246028,38,5257424,5247552);l=c[h>>2]|0}k=f+102412+(l*12&-1)|0;c[f+102412+(l*12&-1)+4>>2]=j;m=f+102400|0;n=c[m>>2]|0;if((n+j|0)>102400){c[k>>2]=pi(j)|0;a[f+102412+(l*12&-1)+8|0]=1}else{c[k>>2]=f+n|0;a[f+102412+(l*12&-1)+8|0]=0;c[m>>2]=(c[m>>2]|0)+j|0}m=f+102404|0;l=(c[m>>2]|0)+j|0;c[m>>2]=l;m=f+102408|0;f=c[m>>2]|0;c[m>>2]=(f|0)>(l|0)?f:l;c[h>>2]=(c[h>>2]|0)+1|0;h=b+36|0;c[h>>2]=c[k>>2]|0;k=c[e>>2]|0;e=(c[i>>2]|0)*152&-1;l=k+102796|0;f=c[l>>2]|0;if((f|0)<32){o=f}else{aH(5246028,38,5257424,5247552);o=c[l>>2]|0}f=k+102412+(o*12&-1)|0;c[k+102412+(o*12&-1)+4>>2]=e;m=k+102400|0;j=c[m>>2]|0;if((j+e|0)>102400){c[f>>2]=pi(e)|0;a[k+102412+(o*12&-1)+8|0]=1}else{c[f>>2]=k+j|0;a[k+102412+(o*12&-1)+8|0]=0;c[m>>2]=(c[m>>2]|0)+e|0}m=k+102404|0;o=(c[m>>2]|0)+e|0;c[m>>2]=o;m=k+102408|0;k=c[m>>2]|0;c[m>>2]=(k|0)>(o|0)?k:o;c[l>>2]=(c[l>>2]|0)+1|0;l=b+40|0;c[l>>2]=c[f>>2]|0;c[b+24>>2]=c[d+32>>2]|0;c[b+28>>2]=c[d+36>>2]|0;f=c[d+24>>2]|0;d=b+44|0;c[d>>2]=f;if((c[i>>2]|0)<=0){return}o=b+20|0;k=b+8|0;b=0;m=f;while(1){f=c[m+(b<<2)>>2]|0;e=c[f+48>>2]|0;j=c[f+52>>2]|0;p=+g[(c[e+12>>2]|0)+8>>2];q=+g[(c[j+12>>2]|0)+8>>2];n=c[e+8>>2]|0;e=c[j+8>>2]|0;j=c[f+124>>2]|0;r=(j|0)>0;if(!r){aH(525e4,71,5257868,5252532)}s=c[l>>2]|0;g[s+(b*152&-1)+136>>2]=+g[f+136>>2];g[s+(b*152&-1)+140>>2]=+g[f+140>>2];t=n+8|0;c[s+(b*152&-1)+112>>2]=c[t>>2]|0;u=e+8|0;c[s+(b*152&-1)+116>>2]=c[u>>2]|0;v=n+120|0;g[s+(b*152&-1)+120>>2]=+g[v>>2];w=e+120|0;g[s+(b*152&-1)+124>>2]=+g[w>>2];x=n+128|0;g[s+(b*152&-1)+128>>2]=+g[x>>2];y=e+128|0;g[s+(b*152&-1)+132>>2]=+g[y>>2];c[s+(b*152&-1)+148>>2]=b;c[s+(b*152&-1)+144>>2]=j;pr(s+(b*152&-1)+80|0,0,32);z=c[h>>2]|0;c[z+(b*88&-1)+32>>2]=c[t>>2]|0;c[z+(b*88&-1)+36>>2]=c[u>>2]|0;g[z+(b*88&-1)+40>>2]=+g[v>>2];g[z+(b*88&-1)+44>>2]=+g[w>>2];w=n+28|0;n=z+(b*88&-1)+48|0;v=c[w+4>>2]|0;c[n>>2]=c[w>>2]|0;c[n+4>>2]=v;v=e+28|0;e=z+(b*88&-1)+56|0;n=c[v+4>>2]|0;c[e>>2]=c[v>>2]|0;c[e+4>>2]=n;g[z+(b*88&-1)+64>>2]=+g[x>>2];g[z+(b*88&-1)+68>>2]=+g[y>>2];y=f+104|0;x=z+(b*88&-1)+16|0;n=c[y+4>>2]|0;c[x>>2]=c[y>>2]|0;c[x+4>>2]=n;n=f+112|0;x=z+(b*88&-1)+24|0;y=c[n+4>>2]|0;c[x>>2]=c[n>>2]|0;c[x+4>>2]=y;c[z+(b*88&-1)+84>>2]=j;g[z+(b*88&-1)+76>>2]=p;g[z+(b*88&-1)+80>>2]=q;c[z+(b*88&-1)+72>>2]=c[f+120>>2]|0;L3103:do{if(r){y=0;while(1){if((a[o]&1)<<24>>24==0){g[s+(b*152&-1)+(y*36&-1)+16>>2]=0.0;g[s+(b*152&-1)+(y*36&-1)+20>>2]=0.0}else{g[s+(b*152&-1)+(y*36&-1)+16>>2]=+g[k>>2]*+g[f+64+(y*20&-1)+8>>2];g[s+(b*152&-1)+(y*36&-1)+20>>2]=+g[k>>2]*+g[f+64+(y*20&-1)+12>>2]}g[s+(b*152&-1)+(y*36&-1)+24>>2]=0.0;g[s+(b*152&-1)+(y*36&-1)+28>>2]=0.0;g[s+(b*152&-1)+(y*36&-1)+32>>2]=0.0;x=f+64+(y*20&-1)|0;n=z+(b*88&-1)+(y<<3)|0;e=s+(b*152&-1)+(y*36&-1)|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;e=c[x+4>>2]|0;c[n>>2]=c[x>>2]|0;c[n+4>>2]=e;e=y+1|0;if((e|0)==(j|0)){break L3103}else{y=e}}}}while(0);j=b+1|0;if((j|0)>=(c[i>>2]|0)){break}b=j;m=c[d>>2]|0}return}function dK(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0;b=a+48|0;if((c[b>>2]|0)<=0){return}d=a+40|0;e=a+28|0;a=0;while(1){f=c[d>>2]|0;h=c[f+(a*152&-1)+112>>2]|0;i=c[f+(a*152&-1)+116>>2]|0;j=+g[f+(a*152&-1)+120>>2];l=+g[f+(a*152&-1)+128>>2];m=+g[f+(a*152&-1)+124>>2];n=+g[f+(a*152&-1)+132>>2];o=c[f+(a*152&-1)+144>>2]|0;p=c[e>>2]|0;q=p+(h*12&-1)|0;r=c[q+4>>2]|0;s=(c[k>>2]=c[q>>2]|0,+g[k>>2]);t=(c[k>>2]=r,+g[k>>2]);u=+g[p+(h*12&-1)+8>>2];r=p+(i*12&-1)|0;v=c[r+4>>2]|0;w=(c[k>>2]=c[r>>2]|0,+g[k>>2]);x=(c[k>>2]=v,+g[k>>2]);y=+g[p+(i*12&-1)+8>>2];p=f+(a*152&-1)+72|0;v=c[p+4>>2]|0;z=(c[k>>2]=c[p>>2]|0,+g[k>>2]);A=(c[k>>2]=v,+g[k>>2]);B=z*-1.0;L3119:do{if((o|0)>0){C=t;D=s;E=x;F=w;G=u;H=y;v=0;while(1){I=+g[f+(a*152&-1)+(v*36&-1)+16>>2];J=+g[f+(a*152&-1)+(v*36&-1)+20>>2];K=z*I+A*J;L=A*I+B*J;J=G-l*(+g[f+(a*152&-1)+(v*36&-1)>>2]*L- +g[f+(a*152&-1)+(v*36&-1)+4>>2]*K);I=D-j*K;M=C-j*L;N=H+n*(L*+g[f+(a*152&-1)+(v*36&-1)+8>>2]-K*+g[f+(a*152&-1)+(v*36&-1)+12>>2]);O=F+m*K;K=E+m*L;p=v+1|0;if((p|0)==(o|0)){P=M;Q=I;R=K;S=O;T=J;U=N;break L3119}else{C=M;D=I;E=K;F=O;G=J;H=N;v=p}}}else{P=t;Q=s;R=x;S=w;T=u;U=y}}while(0);o=(g[k>>2]=Q,c[k>>2]|0);f=(g[k>>2]=P,c[k>>2]|0)|0;c[q>>2]=0|o;c[q+4>>2]=f;g[(c[e>>2]|0)+(h*12&-1)+8>>2]=T;f=(c[e>>2]|0)+(i*12&-1)|0;o=(g[k>>2]=S,c[k>>2]|0);v=(g[k>>2]=R,c[k>>2]|0)|0;c[f>>2]=0|o;c[f+4>>2]=v;g[(c[e>>2]|0)+(i*12&-1)+8>>2]=U;v=a+1|0;if((v|0)<(c[b>>2]|0)){a=v}else{break}}return}function dL(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0.0,z=0.0,A=0,B=0,C=0,D=0.0,E=0.0,F=0.0,G=0.0,H=0,I=0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,S=0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0,ae=0,af=0,ag=0.0,ah=0.0,ai=0.0;b=i;i=i+56|0;d=b|0;e=b+16|0;f=b+32|0;h=a+48|0;if((c[h>>2]|0)<=0){i=b;return}j=a+40|0;l=a+36|0;m=a+44|0;n=a+24|0;o=a+28|0;a=d+8|0;p=d+12|0;q=e+8|0;r=e+12|0;s=d;t=e;u=f;v=0;while(1){w=c[j>>2]|0;x=c[l>>2]|0;y=+g[x+(v*88&-1)+76>>2];z=+g[x+(v*88&-1)+80>>2];A=c[(c[m>>2]|0)+(c[w+(v*152&-1)+148>>2]<<2)>>2]|0;B=c[w+(v*152&-1)+112>>2]|0;C=c[w+(v*152&-1)+116>>2]|0;D=+g[w+(v*152&-1)+120>>2];E=+g[w+(v*152&-1)+124>>2];F=+g[w+(v*152&-1)+128>>2];G=+g[w+(v*152&-1)+132>>2];H=x+(v*88&-1)+48|0;I=c[H+4>>2]|0;J=(c[k>>2]=c[H>>2]|0,+g[k>>2]);K=(c[k>>2]=I,+g[k>>2]);I=x+(v*88&-1)+56|0;x=c[I+4>>2]|0;L=(c[k>>2]=c[I>>2]|0,+g[k>>2]);M=(c[k>>2]=x,+g[k>>2]);x=c[n>>2]|0;I=x+(B*12&-1)|0;H=c[I+4>>2]|0;N=(c[k>>2]=c[I>>2]|0,+g[k>>2]);O=(c[k>>2]=H,+g[k>>2]);P=+g[x+(B*12&-1)+8>>2];H=c[o>>2]|0;I=H+(B*12&-1)|0;S=c[I+4>>2]|0;T=(c[k>>2]=c[I>>2]|0,+g[k>>2]);U=(c[k>>2]=S,+g[k>>2]);V=+g[H+(B*12&-1)+8>>2];B=x+(C*12&-1)|0;S=c[B+4>>2]|0;W=(c[k>>2]=c[B>>2]|0,+g[k>>2]);X=(c[k>>2]=S,+g[k>>2]);Y=+g[x+(C*12&-1)+8>>2];x=H+(C*12&-1)|0;S=c[x+4>>2]|0;Z=(c[k>>2]=c[x>>2]|0,+g[k>>2]);_=(c[k>>2]=S,+g[k>>2]);$=+g[H+(C*12&-1)+8>>2];if((c[A+124>>2]|0)<=0){aH(525e4,168,5257924,5250180)}aa=+R(+P);g[a>>2]=aa;ab=+Q(+P);g[p>>2]=ab;P=+R(+Y);g[q>>2]=P;ac=+Q(+Y);g[r>>2]=ac;C=(g[k>>2]=N-(J*ab-K*aa),c[k>>2]|0);H=(g[k>>2]=O-(K*ab+J*aa),c[k>>2]|0)|0;c[s>>2]=0|C;c[s+4>>2]=H;H=(g[k>>2]=W-(L*ac-M*P),c[k>>2]|0);C=(g[k>>2]=X-(M*ac+L*P),c[k>>2]|0)|0;c[t>>2]=0|H;c[t+4>>2]=C;bH(f,A+64|0,d,y,e,z);A=w+(v*152&-1)+72|0;C=A;H=c[u+4>>2]|0;c[C>>2]=c[u>>2]|0;c[C+4>>2]=H;H=w+(v*152&-1)+144|0;C=c[H>>2]|0;do{if((C|0)>0){S=w+(v*152&-1)+76|0;x=A|0;z=D+E;y=-0.0-$;P=-0.0-V;B=w+(v*152&-1)+140|0;I=0;while(1){L=+g[f+8+(I<<3)>>2];ac=L-N;M=+g[f+8+(I<<3)+4>>2];ad=w+(v*152&-1)+(I*36&-1)|0;ae=(g[k>>2]=ac,c[k>>2]|0);af=(g[k>>2]=M-O,c[k>>2]|0)|0;c[ad>>2]=0|ae;c[ad+4>>2]=af;aa=L-W;af=w+(v*152&-1)+(I*36&-1)+8|0;ad=(g[k>>2]=aa,c[k>>2]|0);ae=(g[k>>2]=M-X,c[k>>2]|0)|0;c[af>>2]=0|ad;c[af+4>>2]=ae;M=+g[S>>2];L=+g[w+(v*152&-1)+(I*36&-1)+4>>2];J=+g[x>>2];ab=ac*M-L*J;K=+g[w+(v*152&-1)+(I*36&-1)+12>>2];Y=M*aa-J*K;J=z+ab*F*ab+Y*G*Y;if(J>0.0){ag=1.0/J}else{ag=0.0}g[w+(v*152&-1)+(I*36&-1)+24>>2]=ag;J=+g[S>>2];Y=+g[x>>2]*-1.0;ab=ac*Y-J*L;M=Y*aa-J*K;J=z+ab*F*ab+M*G*M;if(J>0.0){ah=1.0/J}else{ah=0.0}g[w+(v*152&-1)+(I*36&-1)+28>>2]=ah;ae=w+(v*152&-1)+(I*36&-1)+32|0;g[ae>>2]=0.0;J=+g[x>>2]*(Z+K*y-T-L*P)+ +g[S>>2]*(_+$*aa-U-V*ac);if(J<-1.0){g[ae>>2]=J*(-0.0- +g[B>>2])}ae=I+1|0;if((ae|0)==(C|0)){break}else{I=ae}}if((c[H>>2]|0)!=2){break}P=+g[w+(v*152&-1)+76>>2];y=+g[A>>2];z=+g[w+(v*152&-1)>>2]*P- +g[w+(v*152&-1)+4>>2]*y;J=P*+g[w+(v*152&-1)+8>>2]-y*+g[w+(v*152&-1)+12>>2];ac=P*+g[w+(v*152&-1)+36>>2]-y*+g[w+(v*152&-1)+40>>2];aa=P*+g[w+(v*152&-1)+44>>2]-y*+g[w+(v*152&-1)+48>>2];y=D+E;P=F*z;L=G*J;K=y+z*P+J*L;J=y+ac*F*ac+aa*G*aa;z=y+P*ac+L*aa;aa=K*J-z*z;if(K*K>=aa*1.0e3){c[H>>2]=1;break}g[w+(v*152&-1)+96>>2]=K;g[w+(v*152&-1)+100>>2]=z;g[w+(v*152&-1)+104>>2]=z;g[w+(v*152&-1)+108>>2]=J;if(aa!=0.0){ai=1.0/aa}else{ai=aa}aa=z*(-0.0-ai);g[w+(v*152&-1)+80>>2]=J*ai;g[w+(v*152&-1)+84>>2]=aa;g[w+(v*152&-1)+88>>2]=aa;g[w+(v*152&-1)+92>>2]=K*ai}}while(0);w=v+1|0;if((w|0)<(c[h>>2]|0)){v=w}else{break}}i=b;return}function dM(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0,q=0,r=0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0,J=0.0,K=0.0,L=0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0;b=a+48|0;if((c[b>>2]|0)<=0){return}d=a+40|0;e=a+28|0;a=0;while(1){f=c[d>>2]|0;h=f+(a*152&-1)|0;i=c[f+(a*152&-1)+112>>2]|0;j=c[f+(a*152&-1)+116>>2]|0;l=+g[f+(a*152&-1)+120>>2];m=+g[f+(a*152&-1)+128>>2];n=+g[f+(a*152&-1)+124>>2];o=+g[f+(a*152&-1)+132>>2];p=f+(a*152&-1)+144|0;q=c[p>>2]|0;r=c[e>>2]|0;s=r+(i*12&-1)|0;t=c[s+4>>2]|0;u=(c[k>>2]=c[s>>2]|0,+g[k>>2]);v=(c[k>>2]=t,+g[k>>2]);w=+g[r+(i*12&-1)+8>>2];t=r+(j*12&-1)|0;s=c[t+4>>2]|0;x=(c[k>>2]=c[t>>2]|0,+g[k>>2]);y=(c[k>>2]=s,+g[k>>2]);z=+g[r+(j*12&-1)+8>>2];r=f+(a*152&-1)+72|0;s=c[r+4>>2]|0;A=(c[k>>2]=c[r>>2]|0,+g[k>>2]);B=(c[k>>2]=s,+g[k>>2]);C=A*-1.0;D=+g[f+(a*152&-1)+136>>2];do{if((q-1|0)>>>0<2){E=v;F=u;G=y;H=x;I=0;J=z;K=w;L=2361}else{aH(525e4,311,5257980,5248084);if((q|0)>0){E=v;F=u;G=y;H=x;I=0;J=z;K=w;L=2361;break}else{M=v;N=u;O=y;P=x;Q=z;R=w;break}}}while(0);L3164:do{if((L|0)==2361){while(1){L=0;w=+g[f+(a*152&-1)+(I*36&-1)+12>>2];z=+g[f+(a*152&-1)+(I*36&-1)+8>>2];x=+g[f+(a*152&-1)+(I*36&-1)+4>>2];y=+g[f+(a*152&-1)+(I*36&-1)>>2];u=D*+g[f+(a*152&-1)+(I*36&-1)+16>>2];s=f+(a*152&-1)+(I*36&-1)+20|0;v=+g[s>>2];S=v+ +g[f+(a*152&-1)+(I*36&-1)+28>>2]*(-0.0-(B*(H+w*(-0.0-J)-F-x*(-0.0-K))+C*(G+J*z-E-K*y)));T=-0.0-u;U=S<u?S:u;u=U<T?T:U;U=u-v;g[s>>2]=u;u=B*U;v=C*U;U=F-l*u;T=E-l*v;S=K-m*(y*v-x*u);x=H+n*u;y=G+n*v;V=J+o*(z*v-w*u);s=I+1|0;if((s|0)==(q|0)){M=T;N=U;O=y;P=x;Q=V;R=S;break L3164}else{E=T;F=U;G=y;H=x;I=s;J=V;K=S;L=2361}}}}while(0);L3168:do{if((c[p>>2]|0)==1){C=+g[f+(a*152&-1)+12>>2];D=+g[f+(a*152&-1)+8>>2];S=+g[f+(a*152&-1)+4>>2];V=+g[h>>2];q=f+(a*152&-1)+16|0;x=+g[q>>2];y=x+(A*(P+C*(-0.0-Q)-N-S*(-0.0-R))+B*(O+Q*D-M-R*V)- +g[f+(a*152&-1)+32>>2])*(-0.0- +g[f+(a*152&-1)+24>>2]);U=y>0.0?y:0.0;y=U-x;g[q>>2]=U;U=A*y;x=B*y;W=R-m*(V*x-S*U);X=Q+o*(D*x-C*U);Y=P+n*U;Z=O+n*x;_=N-l*U;$=M-l*x}else{q=f+(a*152&-1)+16|0;x=+g[q>>2];s=f+(a*152&-1)+52|0;U=+g[s>>2];if(x<0.0|U<0.0){aH(525e4,406,5257980,5247244)}C=-0.0-Q;D=+g[f+(a*152&-1)+12>>2];S=+g[f+(a*152&-1)+8>>2];V=-0.0-R;y=+g[f+(a*152&-1)+4>>2];T=+g[h>>2];u=+g[f+(a*152&-1)+48>>2];w=+g[f+(a*152&-1)+44>>2];v=+g[f+(a*152&-1)+40>>2];z=+g[f+(a*152&-1)+36>>2];aa=+g[f+(a*152&-1)+104>>2];ab=+g[f+(a*152&-1)+100>>2];ac=A*(P+D*C-N-y*V)+B*(O+Q*S-M-R*T)- +g[f+(a*152&-1)+32>>2]-(x*+g[f+(a*152&-1)+96>>2]+U*aa);ad=A*(P+u*C-N-v*V)+B*(O+Q*w-M-R*z)- +g[f+(a*152&-1)+68>>2]-(x*ab+U*+g[f+(a*152&-1)+108>>2]);V=+g[f+(a*152&-1)+80>>2]*ac+ +g[f+(a*152&-1)+88>>2]*ad;C=ac*+g[f+(a*152&-1)+84>>2]+ad*+g[f+(a*152&-1)+92>>2];ae=-0.0-V;af=-0.0-C;if(!(V>-0.0|C>-0.0)){C=ae-x;V=af-U;ag=A*C;ah=B*C;C=A*V;ai=B*V;V=ag+C;aj=ah+ai;g[q>>2]=ae;g[s>>2]=af;W=R-m*(T*ah-y*ag+(z*ai-v*C));X=Q+o*(S*ah-D*ag+(w*ai-u*C));Y=P+n*V;Z=O+n*aj;_=N-l*V;$=M-l*aj;break}aj=ac*(-0.0- +g[f+(a*152&-1)+24>>2]);do{if(aj>=0.0){if(ad+aj*ab<0.0){break}V=aj-x;C=0.0-U;ai=A*V;ag=B*V;V=A*C;ah=B*C;C=V+ai;af=ah+ag;g[q>>2]=aj;g[s>>2]=0.0;W=R-m*(ag*T-ai*y+(ah*z-V*v));X=Q+o*(ag*S-ai*D+(ah*w-V*u));Y=P+n*C;Z=O+n*af;_=N-l*C;$=M-l*af;break L3168}}while(0);aj=ad*(-0.0- +g[f+(a*152&-1)+60>>2]);do{if(aj>=0.0){if(ac+aj*aa<0.0){break}ab=0.0-x;af=aj-U;C=A*ab;V=B*ab;ab=A*af;ah=B*af;af=C+ab;ai=V+ah;g[q>>2]=0.0;g[s>>2]=aj;W=R-m*(V*T-C*y+(ah*z-ab*v));X=Q+o*(V*S-C*D+(ah*w-ab*u));Y=P+n*af;Z=O+n*ai;_=N-l*af;$=M-l*ai;break L3168}}while(0);if(ac<0.0|ad<0.0){W=R;X=Q;Y=P;Z=O;_=N;$=M;break}aj=0.0-x;aa=0.0-U;ai=A*aj;af=B*aj;aj=A*aa;ab=B*aa;aa=ai+aj;ah=af+ab;g[q>>2]=0.0;g[s>>2]=0.0;W=R-m*(af*T-ai*y+(ab*z-aj*v));X=Q+o*(af*S-ai*D+(ab*w-aj*u));Y=P+n*aa;Z=O+n*ah;_=N-l*aa;$=M-l*ah}}while(0);f=(c[e>>2]|0)+(i*12&-1)|0;h=(g[k>>2]=_,c[k>>2]|0);p=(g[k>>2]=$,c[k>>2]|0)|0;c[f>>2]=0|h;c[f+4>>2]=p;g[(c[e>>2]|0)+(i*12&-1)+8>>2]=W;p=(c[e>>2]|0)+(j*12&-1)|0;f=(g[k>>2]=Y,c[k>>2]|0);h=(g[k>>2]=Z,c[k>>2]|0)|0;c[p>>2]=0|f;c[p+4>>2]=h;g[(c[e>>2]|0)+(j*12&-1)+8>>2]=X;h=a+1|0;if((h|0)<(c[b>>2]|0)){a=h}else{break}}return}function dN(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,j=0.0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0,C=0,D=0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0,N=0.0,O=0.0,P=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0.0,ao=0.0,ap=0.0,aq=0.0,ar=0.0,as=0.0,at=0.0,au=0.0,av=0.0,aw=0.0,ax=0.0,ay=0.0,az=0.0,aA=0.0,aB=0;b=i;i=i+52|0;d=b|0;e=b+16|0;f=b+32|0;h=a+48|0;if((c[h>>2]|0)<=0){j=0.0;l=j>=-.014999999664723873;i=b;return l|0}m=a+36|0;n=a+24|0;a=d+8|0;o=d+12|0;p=e+8|0;q=e+12|0;r=d;s=e;t=f;u=f+8|0;v=f+16|0;w=0;x=0.0;while(1){y=c[m>>2]|0;z=y+(w*88&-1)|0;A=c[y+(w*88&-1)+32>>2]|0;B=c[y+(w*88&-1)+36>>2]|0;C=y+(w*88&-1)+48|0;D=c[C+4>>2]|0;E=(c[k>>2]=c[C>>2]|0,+g[k>>2]);F=(c[k>>2]=D,+g[k>>2]);G=+g[y+(w*88&-1)+40>>2];H=+g[y+(w*88&-1)+64>>2];D=y+(w*88&-1)+56|0;C=c[D+4>>2]|0;I=(c[k>>2]=c[D>>2]|0,+g[k>>2]);J=(c[k>>2]=C,+g[k>>2]);K=+g[y+(w*88&-1)+44>>2];L=+g[y+(w*88&-1)+68>>2];C=c[y+(w*88&-1)+84>>2]|0;y=c[n>>2]|0;D=y+(A*12&-1)|0;M=c[D+4>>2]|0;N=(c[k>>2]=c[D>>2]|0,+g[k>>2]);O=(c[k>>2]=M,+g[k>>2]);P=+g[y+(A*12&-1)+8>>2];M=y+(B*12&-1)|0;D=c[M+4>>2]|0;S=(c[k>>2]=c[M>>2]|0,+g[k>>2]);T=(c[k>>2]=D,+g[k>>2]);U=+g[y+(B*12&-1)+8>>2];if((C|0)>0){V=G+K;W=O;X=N;Y=T;Z=S;D=0;_=U;$=P;aa=x;while(1){ab=+R(+$);g[a>>2]=ab;ac=+Q(+$);g[o>>2]=ac;ad=+R(+_);g[p>>2]=ad;ae=+Q(+_);g[q>>2]=ae;M=(g[k>>2]=X-(E*ac-F*ab),c[k>>2]|0);af=(g[k>>2]=W-(F*ac+E*ab),c[k>>2]|0)|0;c[r>>2]=0|M;c[r+4>>2]=af;af=(g[k>>2]=Z-(I*ae-J*ad),c[k>>2]|0);M=(g[k>>2]=Y-(J*ae+I*ad),c[k>>2]|0)|0;c[s>>2]=0|af;c[s+4>>2]=M;dR(f,z,d,e,D);M=c[t+4>>2]|0;ad=(c[k>>2]=c[t>>2]|0,+g[k>>2]);ae=(c[k>>2]=M,+g[k>>2]);M=c[u+4>>2]|0;ab=(c[k>>2]=c[u>>2]|0,+g[k>>2]);ac=(c[k>>2]=M,+g[k>>2]);ag=+g[v>>2];ah=ab-X;ai=ac-W;aj=ab-Z;ab=ac-Y;ak=aa<ag?aa:ag;ac=(ag+.004999999888241291)*.20000000298023224;ag=ac<0.0?ac:0.0;ac=ae*ah-ad*ai;al=ae*aj-ad*ab;am=al*L*al+(V+ac*H*ac);if(am>0.0){an=(-0.0-(ag<-.20000000298023224?-.20000000298023224:ag))/am}else{an=0.0}am=ad*an;ad=ae*an;ao=X-G*am;ap=W-G*ad;aq=$-H*(ah*ad-ai*am);ar=Z+K*am;as=Y+K*ad;at=_+L*(aj*ad-ab*am);M=D+1|0;if((M|0)==(C|0)){break}else{W=ap;X=ao;Y=as;Z=ar;D=M;_=at;$=aq;aa=ak}}au=ap;av=ao;aw=as;ax=ar;ay=at;az=aq;aA=ak;aB=c[n>>2]|0}else{au=O;av=N;aw=T;ax=S;ay=U;az=P;aA=x;aB=y}D=aB+(A*12&-1)|0;C=(g[k>>2]=av,c[k>>2]|0);z=(g[k>>2]=au,c[k>>2]|0)|0;c[D>>2]=0|C;c[D+4>>2]=z;g[(c[n>>2]|0)+(A*12&-1)+8>>2]=az;z=(c[n>>2]|0)+(B*12&-1)|0;D=(g[k>>2]=ax,c[k>>2]|0);C=(g[k>>2]=aw,c[k>>2]|0)|0;c[z>>2]=0|D;c[z+4>>2]=C;g[(c[n>>2]|0)+(B*12&-1)+8>>2]=ay;C=w+1|0;if((C|0)<(c[h>>2]|0)){w=C;x=aA}else{j=aA;break}}l=j>=-.014999999664723873;i=b;return l|0}function dO(a){a=a|0;return}function dP(a){a=a|0;return}function dQ(a){a=a|0;return}function dR(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0.0,l=0.0,m=0,n=0.0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0;if((c[b+84>>2]|0)<=0){aH(525e4,617,5256764,5246788)}h=c[b+72>>2]|0;if((h|0)==2){i=e+12|0;j=+g[i>>2];l=+g[b+16>>2];m=e+8|0;n=+g[m>>2];o=+g[b+20>>2];p=j*l-n*o;q=l*n+j*o;r=a;s=(g[k>>2]=p,c[k>>2]|0);t=(g[k>>2]=q,c[k>>2]|0)|0;c[r>>2]=0|s;c[r+4>>2]=t;o=+g[i>>2];j=+g[b+24>>2];n=+g[m>>2];l=+g[b+28>>2];u=+g[d+12>>2];v=+g[b+(f<<3)>>2];w=+g[d+8>>2];x=+g[b+(f<<3)+4>>2];y=+g[d>>2]+(u*v-w*x);z=v*w+u*x+ +g[d+4>>2];g[a+16>>2]=p*(y-(+g[e>>2]+(o*j-n*l)))+(z-(j*n+o*l+ +g[e+4>>2]))*q- +g[b+76>>2]- +g[b+80>>2];m=a+8|0;i=(g[k>>2]=y,c[k>>2]|0);t=(g[k>>2]=z,c[k>>2]|0)|0;c[m>>2]=0|i;c[m+4>>2]=t;t=(g[k>>2]=-0.0-p,c[k>>2]|0);m=(g[k>>2]=-0.0-q,c[k>>2]|0)|0;c[r>>2]=0|t;c[r+4>>2]=m;return}else if((h|0)==0){q=+g[d+12>>2];p=+g[b+24>>2];z=+g[d+8>>2];y=+g[b+28>>2];l=+g[d>>2]+(q*p-z*y);o=p*z+q*y+ +g[d+4>>2];y=+g[e+12>>2];q=+g[b>>2];z=+g[e+8>>2];p=+g[b+4>>2];n=+g[e>>2]+(y*q-z*p);j=q*z+y*p+ +g[e+4>>2];p=n-l;y=j-o;m=a;r=(g[k>>2]=p,c[k>>2]|0);t=(g[k>>2]=y,c[k>>2]|0)|0;c[m>>2]=0|r;c[m+4>>2]=t;z=+O(+(p*p+y*y));if(z<1.1920928955078125e-7){A=p;B=y}else{q=1.0/z;z=p*q;g[a>>2]=z;x=y*q;g[a+4>>2]=x;A=z;B=x}t=a+8|0;m=(g[k>>2]=(l+n)*.5,c[k>>2]|0);r=(g[k>>2]=(o+j)*.5,c[k>>2]|0)|0;c[t>>2]=0|m;c[t+4>>2]=r;g[a+16>>2]=p*A+y*B- +g[b+76>>2]- +g[b+80>>2];return}else if((h|0)==1){h=d+12|0;B=+g[h>>2];y=+g[b+16>>2];r=d+8|0;A=+g[r>>2];p=+g[b+20>>2];j=B*y-A*p;o=y*A+B*p;t=a;m=(g[k>>2]=j,c[k>>2]|0);i=(g[k>>2]=o,c[k>>2]|0)|0;c[t>>2]=0|m;c[t+4>>2]=i;p=+g[h>>2];B=+g[b+24>>2];A=+g[r>>2];y=+g[b+28>>2];n=+g[e+12>>2];l=+g[b+(f<<3)>>2];x=+g[e+8>>2];z=+g[b+(f<<3)+4>>2];q=+g[e>>2]+(n*l-x*z);u=l*x+n*z+ +g[e+4>>2];g[a+16>>2]=j*(q-(+g[d>>2]+(p*B-A*y)))+(u-(B*A+p*y+ +g[d+4>>2]))*o- +g[b+76>>2]- +g[b+80>>2];b=a+8|0;a=(g[k>>2]=q,c[k>>2]|0);d=(g[k>>2]=u,c[k>>2]|0)|0;c[b>>2]=0|a;c[b+4>>2]=d;return}else{return}}function dS(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0.0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0.0,A=0,B=0,C=0,D=0,E=0,F=0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0,P=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0.0,ao=0.0,ap=0.0,aq=0.0,ar=0.0,as=0.0,at=0.0,au=0.0,av=0.0,aw=0.0,ax=0.0,ay=0.0,az=0.0,aA=0.0,aB=0.0,aC=0.0,aD=0;e=i;i=i+52|0;f=e|0;h=e+16|0;j=e+32|0;l=a+48|0;if((c[l>>2]|0)<=0){m=0.0;n=m>=-.007499999832361937;i=e;return n|0}o=a+36|0;p=a+24|0;a=f+8|0;q=f+12|0;r=h+8|0;s=h+12|0;t=f;u=h;v=j;w=j+8|0;x=j+16|0;y=0;z=0.0;while(1){A=c[o>>2]|0;B=A+(y*88&-1)|0;C=c[A+(y*88&-1)+32>>2]|0;D=c[A+(y*88&-1)+36>>2]|0;E=A+(y*88&-1)+48|0;F=c[E+4>>2]|0;G=(c[k>>2]=c[E>>2]|0,+g[k>>2]);H=(c[k>>2]=F,+g[k>>2]);F=A+(y*88&-1)+56|0;E=c[F+4>>2]|0;I=(c[k>>2]=c[F>>2]|0,+g[k>>2]);J=(c[k>>2]=E,+g[k>>2]);E=c[A+(y*88&-1)+84>>2]|0;if((C|0)==(b|0)|(C|0)==(d|0)){K=+g[A+(y*88&-1)+40>>2];L=+g[A+(y*88&-1)+64>>2]}else{K=0.0;L=0.0}M=+g[A+(y*88&-1)+44>>2];N=+g[A+(y*88&-1)+68>>2];A=c[p>>2]|0;F=A+(C*12&-1)|0;O=c[F+4>>2]|0;P=(c[k>>2]=c[F>>2]|0,+g[k>>2]);S=(c[k>>2]=O,+g[k>>2]);T=+g[A+(C*12&-1)+8>>2];O=A+(D*12&-1)|0;F=c[O+4>>2]|0;U=(c[k>>2]=c[O>>2]|0,+g[k>>2]);V=(c[k>>2]=F,+g[k>>2]);W=+g[A+(D*12&-1)+8>>2];if((E|0)>0){X=K+M;Y=S;Z=P;_=V;$=U;aa=T;ab=W;F=0;ac=z;while(1){ad=+R(+aa);g[a>>2]=ad;ae=+Q(+aa);g[q>>2]=ae;af=+R(+ab);g[r>>2]=af;ag=+Q(+ab);g[s>>2]=ag;O=(g[k>>2]=Z-(G*ae-H*ad),c[k>>2]|0);ah=(g[k>>2]=Y-(H*ae+G*ad),c[k>>2]|0)|0;c[t>>2]=0|O;c[t+4>>2]=ah;ah=(g[k>>2]=$-(I*ag-J*af),c[k>>2]|0);O=(g[k>>2]=_-(J*ag+I*af),c[k>>2]|0)|0;c[u>>2]=0|ah;c[u+4>>2]=O;dR(j,B,f,h,F);O=c[v+4>>2]|0;af=(c[k>>2]=c[v>>2]|0,+g[k>>2]);ag=(c[k>>2]=O,+g[k>>2]);O=c[w+4>>2]|0;ad=(c[k>>2]=c[w>>2]|0,+g[k>>2]);ae=(c[k>>2]=O,+g[k>>2]);ai=+g[x>>2];aj=ad-Z;ak=ae-Y;al=ad-$;ad=ae-_;am=ac<ai?ac:ai;ae=(ai+.004999999888241291)*.75;ai=ae<0.0?ae:0.0;ae=ag*aj-af*ak;an=ag*al-af*ad;ao=an*N*an+(X+ae*L*ae);if(ao>0.0){ap=(-0.0-(ai<-.20000000298023224?-.20000000298023224:ai))/ao}else{ap=0.0}ao=af*ap;af=ag*ap;aq=Z-K*ao;ar=Y-K*af;as=aa-L*(aj*af-ak*ao);at=$+M*ao;au=_+M*af;av=ab+N*(al*af-ad*ao);O=F+1|0;if((O|0)==(E|0)){break}else{Y=ar;Z=aq;_=au;$=at;aa=as;ab=av;F=O;ac=am}}aw=ar;ax=aq;ay=au;az=at;aA=as;aB=av;aC=am;aD=c[p>>2]|0}else{aw=S;ax=P;ay=V;az=U;aA=T;aB=W;aC=z;aD=A}F=aD+(C*12&-1)|0;E=(g[k>>2]=ax,c[k>>2]|0);B=(g[k>>2]=aw,c[k>>2]|0)|0;c[F>>2]=0|E;c[F+4>>2]=B;g[(c[p>>2]|0)+(C*12&-1)+8>>2]=aA;B=(c[p>>2]|0)+(D*12&-1)|0;F=(g[k>>2]=az,c[k>>2]|0);E=(g[k>>2]=ay,c[k>>2]|0)|0;c[B>>2]=0|F;c[B+4>>2]=E;g[(c[p>>2]|0)+(D*12&-1)+8>>2]=aB;E=y+1|0;if((E|0)<(c[l>>2]|0)){y=E;z=aC}else{m=aC;break}}n=m>=-.007499999832361937;i=e;return n|0}function dT(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0,m=0;e=cA(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;b=e;c[b>>2]=5259356;c[e+4>>2]=4;c[e+48>>2]=a;j=e+52|0;c[j>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;pr(e+8|0,0,40);g[e+136>>2]=+O(+(+g[a+16>>2]*+g[d+16>>2]));k=+g[a+20>>2];l=+g[d+20>>2];g[e+140>>2]=k>l?k:l;c[b>>2]=5259528;if((c[(c[a+12>>2]|0)+4>>2]|0)==1){m=d}else{aH(5249428,41,5257148,5252380);m=c[j>>2]|0}if((c[(c[m+12>>2]|0)+4>>2]|0)==0){h=f;i=h|0;return i|0}aH(5249428,42,5257148,5250136);h=f;i=h|0;return i|0}function dU(b,d){b=b|0;d=d|0;var e=0,f=0;aW[c[(c[b>>2]|0)+4>>2]&2047](b);e=a[5261684]|0;if((e&255)>=14){aH(5246516,173,5257772,5247588)}f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}function dV(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bB(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function dW(a){a=a|0;pl(a);return}function dX(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0,m=0;e=cA(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;b=e;c[b>>2]=5259356;c[e+4>>2]=4;c[e+48>>2]=a;j=e+52|0;c[j>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;pr(e+8|0,0,40);g[e+136>>2]=+O(+(+g[a+16>>2]*+g[d+16>>2]));k=+g[a+20>>2];l=+g[d+20>>2];g[e+140>>2]=k>l?k:l;c[b>>2]=5259480;if((c[(c[a+12>>2]|0)+4>>2]|0)==1){m=d}else{aH(5249260,41,5256980,5252380);m=c[j>>2]|0}if((c[(c[m+12>>2]|0)+4>>2]|0)==2){h=f;i=h|0;return i|0}aH(5249260,42,5256980,5250092);h=f;i=h|0;return i|0}function dY(b,d){b=b|0;d=d|0;var e=0,f=0;aW[c[(c[b>>2]|0)+4>>2]&2047](b);e=a[5261684]|0;if((e&255)>=14){aH(5246516,173,5257772,5247588)}f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}function dZ(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+252|0;g=f|0;bC(g,b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);i=f;return}function d_(a){a=a|0;pl(a);return}function d$(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0,m=0;e=cA(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;b=e;c[b>>2]=5259356;c[e+4>>2]=4;c[e+48>>2]=a;j=e+52|0;c[j>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;pr(e+8|0,0,40);g[e+136>>2]=+O(+(+g[a+16>>2]*+g[d+16>>2]));k=+g[a+20>>2];l=+g[d+20>>2];g[e+140>>2]=k>l?k:l;c[b>>2]=5259432;if((c[(c[a+12>>2]|0)+4>>2]|0)==2){m=d}else{aH(5249044,41,5256684,5252336);m=c[j>>2]|0}if((c[(c[m+12>>2]|0)+4>>2]|0)==0){h=f;i=h|0;return i|0}aH(5249044,42,5256684,5250136);h=f;i=h|0;return i|0}function d0(b,d){b=b|0;d=d|0;var e=0,f=0;aW[c[(c[b>>2]|0)+4>>2]&2047](b);e=a[5261684]|0;if((e&255)>=14){aH(5246516,173,5257772,5247588)}f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}function d1(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bA(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function d2(a){a=a|0;pl(a);return}function d3(a){a=a|0;return}function d4(a,b){a=a|0;b=+b;return+0.0}function d5(a){a=a|0;return}function d6(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0;d=a+108|0;e=c[d>>2]|0;f=b+28|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];i=a+112|0;h=c[i>>2]|0;n=b+(h*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(h*12&-1)+8>>2];s=+g[a+128>>2];t=+g[a+124>>2];u=+g[a+136>>2];v=+g[a+132>>2];w=+g[a+116>>2];x=+g[a+120>>2];h=a+100|0;y=+g[h>>2];z=(+g[a+76>>2]+(w*(p+u*(-0.0-r)-(j+s*(-0.0-m)))+x*(q+r*v-(l+m*t)))+ +g[a+96>>2]*y)*(-0.0- +g[a+172>>2]);g[h>>2]=y+z;y=w*z;w=x*z;z=+g[a+156>>2];x=m- +g[a+164>>2]*(w*t-y*s);s=+g[a+160>>2];t=r+ +g[a+168>>2]*(w*v-y*u);a=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=j-z*y,c[k>>2]|0);h=(g[k>>2]=l-z*w,c[k>>2]|0)|0;c[a>>2]=0|e;c[a+4>>2]=h;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=x;d=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;h=(g[k>>2]=p+y*s,c[k>>2]|0);a=(g[k>>2]=q+w*s,c[k>>2]|0)|0;c[d>>2]=0|h;c[d+4>>2]=a;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=t;return}function d7(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+80>>2];h=+g[d+20>>2];i=+g[b+84>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function d8(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+88>>2];h=+g[d+20>>2];i=+g[b+92>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function d9(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+100>>2]*c;c=d*+g[b+120>>2];g[a>>2]=+g[b+116>>2]*d;g[a+4>>2]=c;return}function ea(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0,j=0,k=0.0,l=0.0,m=0;e=cA(f,144)|0;if((e|0)==0){h=0;i=h|0;return i|0}f=e;b=e;c[b>>2]=5259356;c[e+4>>2]=4;c[e+48>>2]=a;j=e+52|0;c[j>>2]=d;c[e+56>>2]=0;c[e+60>>2]=0;c[e+124>>2]=0;c[e+128>>2]=0;pr(e+8|0,0,40);g[e+136>>2]=+O(+(+g[a+16>>2]*+g[d+16>>2]));k=+g[a+20>>2];l=+g[d+20>>2];g[e+140>>2]=k>l?k:l;c[b>>2]=5259640;if((c[(c[a+12>>2]|0)+4>>2]|0)==2){m=d}else{aH(5248824,44,5257628,5252336);m=c[j>>2]|0}if((c[(c[m+12>>2]|0)+4>>2]|0)==2){h=f;i=h|0;return i|0}aH(5248824,45,5257628,5250092);h=f;i=h|0;return i|0}function eb(b,d){b=b|0;d=d|0;var e=0,f=0;aW[c[(c[b>>2]|0)+4>>2]&2047](b);e=a[5261684]|0;if((e&255)>=14){aH(5246516,173,5257772,5247588)}f=d+12+((e&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}function ec(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bE(b,c[(c[a+48>>2]|0)+12>>2]|0,d,c[(c[a+52>>2]|0)+12>>2]|0,e);return}function ed(a){a=a|0;pl(a);return}function ee(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,P=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+108|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+112|0;c[l>>2]=j;m=e+28|0;n=b+140|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+148|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+156>>2]=s;t=+g[i+120>>2];g[b+160>>2]=t;u=+g[e+128>>2];g[b+164>>2]=u;v=+g[i+128>>2];g[b+168>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;m=c[e+4>>2]|0;w=(c[k>>2]=c[e>>2]|0,+g[k>>2]);x=(c[k>>2]=m,+g[k>>2]);y=+g[i+(f*12&-1)+8>>2];m=d+28|0;e=c[m>>2]|0;n=e+(f*12&-1)|0;z=c[n+4>>2]|0;A=(c[k>>2]=c[n>>2]|0,+g[k>>2]);B=(c[k>>2]=z,+g[k>>2]);C=+g[e+(f*12&-1)+8>>2];z=i+(j*12&-1)|0;n=c[z+4>>2]|0;D=(c[k>>2]=c[z>>2]|0,+g[k>>2]);E=(c[k>>2]=n,+g[k>>2]);F=+g[i+(j*12&-1)+8>>2];i=e+(j*12&-1)|0;n=c[i+4>>2]|0;G=(c[k>>2]=c[i>>2]|0,+g[k>>2]);H=(c[k>>2]=n,+g[k>>2]);I=+g[e+(j*12&-1)+8>>2];J=+R(+y);K=+Q(+y);y=+R(+F);L=+Q(+F);F=+g[b+80>>2];M=F-(c[k>>2]=o,+g[k>>2]);F=+g[b+84>>2];N=F-(c[k>>2]=p,+g[k>>2]);F=K*M-J*N;P=J*M+K*N;p=b+124|0;o=(g[k>>2]=F,c[k>>2]|0);j=(g[k>>2]=P,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;N=+g[b+88>>2];K=N-(c[k>>2]=q,+g[k>>2]);N=+g[b+92>>2];M=N-(c[k>>2]=r,+g[k>>2]);N=L*K-y*M;J=y*K+L*M;r=b+132|0;q=(g[k>>2]=N,c[k>>2]|0);j=(g[k>>2]=J,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;j=b+116|0;M=D+N-w-F;w=E+J-x-P;r=j;q=(g[k>>2]=M,c[k>>2]|0);p=(g[k>>2]=w,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=p;p=j|0;x=+O(+(M*M+w*w));if(x>.004999999888241291){E=1.0/x;D=M*E;g[p>>2]=D;S=E*w;T=D}else{g[p>>2]=0.0;S=0.0;T=0.0}g[b+120>>2]=S;D=S*F-P*T;w=S*N-T*J;E=t+(s+D*D*u)+w*w*v;if(E!=0.0){U=1.0/E}else{U=0.0}p=b+172|0;g[p>>2]=U;w=+g[b+68>>2];if(w>0.0){D=x- +g[b+104>>2];x=w*6.2831854820251465;w=x*U*x;M=+g[d>>2];L=M*(x*U*2.0*+g[b+72>>2]+w*M);j=b+96|0;g[j>>2]=L;if(L!=0.0){V=1.0/L}else{V=0.0}g[j>>2]=V;g[b+76>>2]=w*D*M*V;M=E+V;if(M!=0.0){W=1.0/M}else{W=0.0}g[p>>2]=W}else{g[b+96>>2]=0.0;g[b+76>>2]=0.0}if((a[d+20|0]&1)<<24>>24==0){g[b+100>>2]=0.0;W=C;M=I;V=G;E=H;D=A;w=B;p=c[m>>2]|0;j=p+(f*12&-1)|0;r=j;q=(g[k>>2]=D,c[k>>2]|0);o=(g[k>>2]=w,c[k>>2]|0);e=o;n=0;i=0;z=e;X=q;Y=0;Z=i|X;_=z|Y;$=r|0;c[$>>2]=Z;aa=r+4|0;c[aa>>2]=_;ab=c[h>>2]|0;ac=c[m>>2]|0;ad=ac+(ab*12&-1)+8|0;g[ad>>2]=W;ae=c[l>>2]|0;af=c[m>>2]|0;ag=af+(ae*12&-1)|0;ah=ag;ai=(g[k>>2]=V,c[k>>2]|0);aj=(g[k>>2]=E,c[k>>2]|0);ak=aj;al=0;am=0;an=ak;ao=ai;ap=0;aq=am|ao;ar=an|ap;as=ah|0;c[as>>2]=aq;at=ah+4|0;c[at>>2]=ar;au=c[l>>2]|0;av=c[m>>2]|0;aw=av+(au*12&-1)+8|0;g[aw>>2]=M;return}else{ax=b+100|0;L=+g[d+8>>2]*+g[ax>>2];g[ax>>2]=L;U=T*L;T=L*S;W=C-u*(T*F-U*P);M=I+v*(T*N-U*J);V=G+U*t;E=H+T*t;D=A-U*s;w=B-T*s;p=c[m>>2]|0;j=p+(f*12&-1)|0;r=j;q=(g[k>>2]=D,c[k>>2]|0);o=(g[k>>2]=w,c[k>>2]|0);e=o;n=0;i=0;z=e;X=q;Y=0;Z=i|X;_=z|Y;$=r|0;c[$>>2]=Z;aa=r+4|0;c[aa>>2]=_;ab=c[h>>2]|0;ac=c[m>>2]|0;ad=ac+(ab*12&-1)+8|0;g[ad>>2]=W;ae=c[l>>2]|0;af=c[m>>2]|0;ag=af+(ae*12&-1)|0;ah=ag;ai=(g[k>>2]=V,c[k>>2]|0);aj=(g[k>>2]=E,c[k>>2]|0);ak=aj;al=0;am=0;an=ak;ao=ai;ap=0;aq=am|ao;ar=an|ap;as=ah|0;c[as>>2]=aq;at=ah+4|0;c[at>>2]=ar;au=c[l>>2]|0;av=c[m>>2]|0;aw=av+(au*12&-1)+8|0;g[aw>>2]=M;return}}function ef(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0;if(+g[a+68>>2]>0.0){d=1;return d|0}e=a+108|0;f=c[e>>2]|0;h=b+24|0;b=c[h>>2]|0;i=b+(f*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[b+(f*12&-1)+8>>2];f=a+112|0;j=c[f>>2]|0;o=b+(j*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[b+(j*12&-1)+8>>2];t=+R(+n);u=+Q(+n);v=+R(+s);w=+Q(+s);x=+g[a+80>>2]- +g[a+140>>2];y=+g[a+84>>2]- +g[a+144>>2];z=u*x-t*y;A=t*x+u*y;y=+g[a+88>>2]- +g[a+148>>2];u=+g[a+92>>2]- +g[a+152>>2];x=w*y-v*u;t=v*y+w*u;u=q+x-l-z;w=r+t-m-A;y=+O(+(u*u+w*w));if(y<1.1920928955078125e-7){B=0.0;C=u;D=w}else{v=1.0/y;B=y;C=u*v;D=w*v}v=B- +g[a+104>>2];B=v<.20000000298023224?v:.20000000298023224;v=B<-.20000000298023224?-.20000000298023224:B;B=v*(-0.0- +g[a+172>>2]);w=C*B;C=D*B;B=+g[a+156>>2];D=n- +g[a+164>>2]*(z*C-A*w);A=+g[a+160>>2];z=s+ +g[a+168>>2]*(x*C-t*w);a=(g[k>>2]=l-B*w,c[k>>2]|0);j=(g[k>>2]=m-B*C,c[k>>2]|0)|0;c[i>>2]=0|a;c[i+4>>2]=j;g[(c[h>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=D;e=(c[h>>2]|0)+((c[f>>2]|0)*12&-1)|0;j=(g[k>>2]=q+A*w,c[k>>2]|0);i=(g[k>>2]=r+A*C,c[k>>2]|0)|0;c[e>>2]=0|j;c[e+4>>2]=i;g[(c[h>>2]|0)+((c[f>>2]|0)*12&-1)+8>>2]=z;if(v>0.0){E=v}else{E=-0.0-v}d=E<.004999999888241291;return d|0}function eg(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;cB(5248744,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5251944,(t=i,i=i+4|0,c[t>>2]=e,t)|0);cB(5249608,(t=i,i=i+4|0,c[t>>2]=f,t)|0);cB(5247800,(t=i,i=i+4|0,c[t>>2]=a[b+61|0]&1,t)|0);j=+g[b+84>>2];cB(5247116,(t=i,i=i+16|0,h[k>>3]=+g[b+80>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);j=+g[b+92>>2];cB(5246692,(t=i,i=i+16|0,h[k>>3]=+g[b+88>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);cB(5246352,(t=i,i=i+8|0,h[k>>3]=+g[b+104>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5253228,(t=i,i=i+8|0,h[k>>3]=+g[b+68>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5252956,(t=i,i=i+8|0,h[k>>3]=+g[b+72>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5252424,(t=i,i=i+4|0,c[t>>2]=c[b+56>>2]|0,t)|0);i=d;return}function eh(a){a=a|0;pl(a);return}function ei(a,b){a=a|0;b=b|0;return 1}function ej(a){a=a|0;return}function ek(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function el(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function em(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+88>>2]*c;g[a>>2]=+g[b+84>>2]*c;g[a+4>>2]=d;return}function en(a,b){a=a|0;b=+b;return+(+g[a+92>>2]*b)}function eo(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,S=0.0,T=0.0,U=0.0,V=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+104|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+108|0;c[l>>2]=j;m=e+28|0;n=b+128|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+136|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+144>>2]=s;t=+g[i+120>>2];g[b+148>>2]=t;u=+g[e+128>>2];g[b+152>>2]=u;v=+g[i+128>>2];g[b+156>>2]=v;i=c[d+24>>2]|0;w=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;x=c[n+4>>2]|0;y=(c[k>>2]=c[n>>2]|0,+g[k>>2]);z=(c[k>>2]=x,+g[k>>2]);A=+g[m+(f*12&-1)+8>>2];B=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;x=c[i+4>>2]|0;C=(c[k>>2]=c[i>>2]|0,+g[k>>2]);D=(c[k>>2]=x,+g[k>>2]);E=+g[m+(j*12&-1)+8>>2];F=+R(+w);G=+Q(+w);w=+R(+B);H=+Q(+B);B=+g[b+68>>2];I=B-(c[k>>2]=o,+g[k>>2]);B=+g[b+72>>2];J=B-(c[k>>2]=p,+g[k>>2]);B=G*I-F*J;K=F*I+G*J;p=b+112|0;o=(g[k>>2]=B,c[k>>2]|0);j=(g[k>>2]=K,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;J=+g[b+76>>2];G=J-(c[k>>2]=q,+g[k>>2]);J=+g[b+80>>2];I=J-(c[k>>2]=r,+g[k>>2]);J=H*G-w*I;F=w*G+H*I;r=b+120|0;q=(g[k>>2]=J,c[k>>2]|0);j=(g[k>>2]=F,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;I=s+t;H=I+K*u*K+F*v*F;G=v*J;w=K*B*(-0.0-u)-F*G;L=I+B*u*B+J*G;G=H*L-w*w;if(G!=0.0){M=1.0/G}else{M=G}G=w*(-0.0-M);g[b+160>>2]=L*M;g[b+164>>2]=G;g[b+168>>2]=G;g[b+172>>2]=H*M;M=u+v;if(M>0.0){N=1.0/M}else{N=M}g[b+176>>2]=N;j=b+84|0;if((a[d+20|0]&1)<<24>>24==0){g[j>>2]=0.0;g[b+88>>2]=0.0;g[b+92>>2]=0.0;O=A;P=E;S=C;T=D;U=y;V=z}else{r=d+8|0;N=+g[r>>2];d=j|0;M=N*+g[d>>2];g[d>>2]=M;d=b+88|0;H=N*+g[d>>2];g[d>>2]=H;d=b+92|0;N=+g[r>>2]*+g[d>>2];g[d>>2]=N;O=A-u*(N+(H*B-M*K));P=E+v*(N+(H*J-M*F));S=C+t*M;T=D+t*H;U=y-s*M;V=z-s*H}d=(c[e>>2]|0)+(f*12&-1)|0;f=(g[k>>2]=U,c[k>>2]|0);r=(g[k>>2]=V,c[k>>2]|0)|0;c[d>>2]=0|f;c[d+4>>2]=r;g[(c[e>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=O;h=(c[e>>2]|0)+((c[l>>2]|0)*12&-1)|0;r=(g[k>>2]=S,c[k>>2]|0);d=(g[k>>2]=T,c[k>>2]|0)|0;c[h>>2]=0|r;c[h+4>>2]=d;g[(c[e>>2]|0)+((c[l>>2]|0)*12&-1)+8>>2]=P;return}function ep(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0;d=a+104|0;e=c[d>>2]|0;f=b+28|0;h=c[f>>2]|0;i=h+(e*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[h+(e*12&-1)+8>>2];j=a+108|0;i=c[j>>2]|0;o=h+(i*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[h+(i*12&-1)+8>>2];t=+g[a+144>>2];u=+g[a+148>>2];v=+g[a+152>>2];w=+g[a+156>>2];x=+g[b>>2];b=a+92|0;y=+g[b>>2];z=x*+g[a+100>>2];A=y+(s-n)*(-0.0- +g[a+176>>2]);B=-0.0-z;C=A<z?A:z;z=C<B?B:C;g[b>>2]=z;C=z-y;y=n-v*C;n=s+w*C;C=+g[a+124>>2];s=+g[a+120>>2];z=+g[a+116>>2];B=+g[a+112>>2];A=q+C*(-0.0-n)-l-z*(-0.0-y);D=r+s*n-m-B*y;E=+g[a+168>>2]*D+ +g[a+160>>2]*A;F=+g[a+172>>2]*D+ +g[a+164>>2]*A;b=a+84|0;i=b;h=c[i+4>>2]|0;A=(c[k>>2]=c[i>>2]|0,+g[k>>2]);D=(c[k>>2]=h,+g[k>>2]);h=b|0;G=A-E;g[h>>2]=G;b=a+88|0;E=+g[b>>2]-F;g[b>>2]=E;F=x*+g[a+96>>2];x=G*G+E*E;if(x>F*F){H=+O(+x);if(H<1.1920928955078125e-7){I=G;J=E}else{x=1.0/H;H=G*x;g[h>>2]=H;K=E*x;g[b>>2]=K;I=H;J=K}K=F*I;g[h>>2]=K;I=F*J;g[b>>2]=I;L=K;M=I}else{L=G;M=E}E=L-A;A=M-D;b=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=l-t*E,c[k>>2]|0);h=(g[k>>2]=m-t*A,c[k>>2]|0)|0;c[b>>2]=0|e;c[b+4>>2]=h;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=y-v*(B*A-E*z);d=(c[f>>2]|0)+((c[j>>2]|0)*12&-1)|0;h=(g[k>>2]=q+u*E,c[k>>2]|0);b=(g[k>>2]=r+u*A,c[k>>2]|0)|0;c[d>>2]=0|h;c[d+4>>2]=b;g[(c[f>>2]|0)+((c[j>>2]|0)*12&-1)+8>>2]=n+w*(A*s-E*C);return}function eq(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;cB(5248004,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5251944,(t=i,i=i+4|0,c[t>>2]=e,t)|0);cB(5249608,(t=i,i=i+4|0,c[t>>2]=f,t)|0);cB(5247800,(t=i,i=i+4|0,c[t>>2]=a[b+61|0]&1,t)|0);j=+g[b+72>>2];cB(5247116,(t=i,i=i+16|0,h[k>>3]=+g[b+68>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);j=+g[b+80>>2];cB(5246692,(t=i,i=i+16|0,h[k>>3]=+g[b+76>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);cB(5245548,(t=i,i=i+8|0,h[k>>3]=+g[b+96>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5253288,(t=i,i=i+8|0,h[k>>3]=+g[b+100>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5252424,(t=i,i=i+4|0,c[t>>2]=c[b+56>>2]|0,t)|0);i=d;return}function er(a){a=a|0;pl(a);return}function es(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0;e=b|0;c[e>>2]=5259380;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){aH(5248204,173,5256164,5249852)}c[b+4>>2]=c[d>>2]|0;c[b+8>>2]=0;c[b+12>>2]=0;i=b+48|0;c[i>>2]=c[f>>2]|0;f=b+52|0;c[f>>2]=c[h>>2]|0;c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2]|0;pr(b+16|0,0,32);c[e>>2]=5260260;e=b+92|0;h=b+100|0;j=b+108|0;l=b+116|0;m=b+124|0;n=b+132|0;o=d+20|0;p=c[o>>2]|0;q=b+68|0;c[q>>2]=p;r=d+24|0;s=c[r>>2]|0;t=b+72|0;c[t>>2]=s;u=c[p+4>>2]|0;p=b+76|0;c[p>>2]=u;v=c[s+4>>2]|0;s=b+80|0;c[s>>2]=v;if((u-1|0)>>>0<2){w=v}else{aH(5248312,53,5258696,5252220);w=c[s>>2]|0}if((w-1|0)>>>0>=2){aH(5248312,54,5258696,5249940)}w=c[q>>2]|0;q=c[w+48>>2]|0;c[b+84>>2]=q;v=c[w+52>>2]|0;c[i>>2]=v;x=+g[v+20>>2];y=+g[v+24>>2];z=+g[q+20>>2];A=+g[q+24>>2];i=c[o>>2]|0;if((c[p>>2]|0)==1){B=+g[v+56>>2];C=+g[q+56>>2];p=i+68|0;o=j;w=c[p+4>>2]|0;c[o>>2]=c[p>>2]|0;c[o+4>>2]=w;w=i+76|0;o=e;p=c[w+4>>2]|0;c[o>>2]=c[w>>2]|0;c[o+4>>2]=p;D=+g[i+116>>2];g[b+140>>2]=D;g[m>>2]=0.0;g[b+128>>2]=0.0;E=B-C-D}else{D=+g[q+16>>2];C=+g[q+12>>2];B=+g[v+16>>2];F=+g[v+12>>2];v=i+68|0;q=j;j=c[v>>2]|0;p=c[v+4>>2]|0;c[q>>2]=j;c[q+4>>2]=p;q=i+76|0;v=e;e=c[q>>2]|0;o=c[q+4>>2]|0;c[v>>2]=e;c[v+4>>2]=o;g[b+140>>2]=+g[i+100>>2];v=i+84|0;i=m;m=c[v>>2]|0;q=c[v+4>>2]|0;c[i>>2]=m;c[i+4>>2]=q;G=(c[k>>2]=j,+g[k>>2]);H=(c[k>>2]=p,+g[k>>2]);I=(c[k>>2]=e,+g[k>>2]);J=(c[k>>2]=o,+g[k>>2]);K=F-C+(y*I-x*J);C=B-D+(x*I+y*J);J=(c[k>>2]=m,+g[k>>2])*(A*K+z*C-G);E=J+(c[k>>2]=q,+g[k>>2])*(K*(-0.0-z)+A*C-H)}q=c[t>>2]|0;t=c[q+48>>2]|0;c[b+88>>2]=t;m=c[q+52>>2]|0;c[f>>2]=m;H=+g[m+20>>2];C=+g[m+24>>2];A=+g[t+20>>2];z=+g[t+24>>2];f=c[r>>2]|0;if((c[s>>2]|0)==1){K=+g[m+56>>2];J=+g[t+56>>2];s=f+68|0;r=l;q=c[s+4>>2]|0;c[r>>2]=c[s>>2]|0;c[r+4>>2]=q;q=f+76|0;r=h;s=c[q+4>>2]|0;c[r>>2]=c[q>>2]|0;c[r+4>>2]=s;G=+g[f+116>>2];g[b+144>>2]=G;g[n>>2]=0.0;g[b+136>>2]=0.0;y=K-J-G;s=d+28|0;G=+g[s>>2];r=b+152|0;g[r>>2]=G;J=y*G;K=E+J;q=b+148|0;g[q>>2]=K;o=b+156|0;g[o>>2]=0.0;return}else{I=+g[t+16>>2];x=+g[t+12>>2];D=+g[m+16>>2];B=+g[m+12>>2];m=f+68|0;t=l;l=c[m>>2]|0;e=c[m+4>>2]|0;c[t>>2]=l;c[t+4>>2]=e;t=f+76|0;m=h;h=c[t>>2]|0;p=c[t+4>>2]|0;c[m>>2]=h;c[m+4>>2]=p;g[b+144>>2]=+g[f+100>>2];m=f+84|0;f=n;n=c[m>>2]|0;t=c[m+4>>2]|0;c[f>>2]=n;c[f+4>>2]=t;F=(c[k>>2]=l,+g[k>>2]);L=(c[k>>2]=e,+g[k>>2]);M=(c[k>>2]=h,+g[k>>2]);N=(c[k>>2]=p,+g[k>>2]);O=B-x+(C*M-H*N);x=D-I+(H*M+C*N);N=(c[k>>2]=n,+g[k>>2])*(z*O+A*x-F);y=N+(c[k>>2]=t,+g[k>>2])*(O*(-0.0-A)+z*x-L);s=d+28|0;G=+g[s>>2];r=b+152|0;g[r>>2]=G;J=y*G;K=E+J;q=b+148|0;g[q>>2]=K;o=b+156|0;g[o>>2]=0.0;return}}function et(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0.0,v=0.0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0;d=a+160|0;e=c[d>>2]|0;f=b+28|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];i=a+164|0;h=c[i>>2]|0;n=b+(h*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(h*12&-1)+8>>2];h=a+168|0;o=c[h>>2]|0;n=b+(o*12&-1)|0;s=c[n+4>>2]|0;t=(c[k>>2]=c[n>>2]|0,+g[k>>2]);u=(c[k>>2]=s,+g[k>>2]);v=+g[b+(o*12&-1)+8>>2];o=a+172|0;s=c[o>>2]|0;n=b+(s*12&-1)|0;w=c[n+4>>2]|0;x=(c[k>>2]=c[n>>2]|0,+g[k>>2]);y=(c[k>>2]=w,+g[k>>2]);z=+g[b+(s*12&-1)+8>>2];A=+g[a+240>>2];B=+g[a+244>>2];C=+g[a+248>>2];D=+g[a+252>>2];E=+g[a+256>>2];F=+g[a+264>>2];G=+g[a+260>>2];H=+g[a+268>>2];I=((j-t)*A+(l-u)*B+((p-x)*C+(q-y)*D)+(m*E-v*F+(r*G-z*H)))*(-0.0- +g[a+272>>2]);s=a+156|0;g[s>>2]=+g[s>>2]+I;J=+g[a+208>>2]*I;K=m+I*+g[a+224>>2]*E;E=I*+g[a+212>>2];m=r+I*+g[a+228>>2]*G;G=I*+g[a+216>>2];r=v-I*+g[a+232>>2]*F;F=I*+g[a+220>>2];v=z-I*+g[a+236>>2]*H;a=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=j+A*J,c[k>>2]|0);s=(g[k>>2]=l+B*J,c[k>>2]|0)|0;c[a>>2]=0|e;c[a+4>>2]=s;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=K;d=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;s=(g[k>>2]=p+C*E,c[k>>2]|0);a=(g[k>>2]=q+E*D,c[k>>2]|0)|0;c[d>>2]=0|s;c[d+4>>2]=a;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=m;i=(c[f>>2]|0)+((c[h>>2]|0)*12&-1)|0;a=(g[k>>2]=t-A*G,c[k>>2]|0);d=(g[k>>2]=u-B*G,c[k>>2]|0)|0;c[i>>2]=0|a;c[i+4>>2]=d;g[(c[f>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=r;h=(c[f>>2]|0)+((c[o>>2]|0)*12&-1)|0;d=(g[k>>2]=x-C*F,c[k>>2]|0);i=(g[k>>2]=y-D*F,c[k>>2]|0)|0;c[h>>2]=0|d;c[h+4>>2]=i;g[(c[f>>2]|0)+((c[o>>2]|0)*12&-1)+8>>2]=v;return}function eu(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0.0,am=0.0,an=0.0,ao=0.0,ap=0.0,aq=0.0,ar=0.0,as=0.0,at=0.0,au=0.0,av=0.0,aw=0.0,ax=0.0,ay=0.0,az=0.0,aA=0.0,aB=0.0,aC=0.0,aD=0.0,aE=0.0,aF=0.0,aG=0.0,aH=0.0,aI=0.0,aJ=0.0,aK=0.0,aL=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+160|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+164|0;c[l>>2]=j;m=c[b+84>>2]|0;n=c[m+8>>2]|0;o=b+168|0;c[o>>2]=n;p=c[b+88>>2]|0;q=c[p+8>>2]|0;r=b+172|0;c[r>>2]=q;s=e+28|0;t=b+176|0;u=c[s>>2]|0;v=c[s+4>>2]|0;c[t>>2]=u;c[t+4>>2]=v;t=i+28|0;s=b+184|0;w=c[t>>2]|0;x=c[t+4>>2]|0;c[s>>2]=w;c[s+4>>2]=x;s=m+28|0;t=b+192|0;y=c[s>>2]|0;z=c[s+4>>2]|0;c[t>>2]=y;c[t+4>>2]=z;t=p+28|0;s=b+200|0;A=c[t>>2]|0;B=c[t+4>>2]|0;c[s>>2]=A;c[s+4>>2]=B;C=+g[e+120>>2];g[b+208>>2]=C;D=+g[i+120>>2];g[b+212>>2]=D;E=+g[m+120>>2];g[b+216>>2]=E;F=+g[p+120>>2];g[b+220>>2]=F;G=+g[e+128>>2];g[b+224>>2]=G;H=+g[i+128>>2];g[b+228>>2]=H;I=+g[m+128>>2];g[b+232>>2]=I;J=+g[p+128>>2];g[b+236>>2]=J;p=c[d+24>>2]|0;K=+g[p+(f*12&-1)+8>>2];m=d+28|0;i=c[m>>2]|0;e=i+(f*12&-1)|0;s=c[e+4>>2]|0;L=(c[k>>2]=c[e>>2]|0,+g[k>>2]);M=(c[k>>2]=s,+g[k>>2]);N=+g[i+(f*12&-1)+8>>2];O=+g[p+(j*12&-1)+8>>2];s=i+(j*12&-1)|0;e=c[s+4>>2]|0;P=(c[k>>2]=c[s>>2]|0,+g[k>>2]);S=(c[k>>2]=e,+g[k>>2]);T=+g[i+(j*12&-1)+8>>2];U=+g[p+(n*12&-1)+8>>2];j=i+(n*12&-1)|0;e=c[j+4>>2]|0;V=(c[k>>2]=c[j>>2]|0,+g[k>>2]);W=(c[k>>2]=e,+g[k>>2]);X=+g[i+(n*12&-1)+8>>2];Y=+g[p+(q*12&-1)+8>>2];p=i+(q*12&-1)|0;n=c[p+4>>2]|0;Z=(c[k>>2]=c[p>>2]|0,+g[k>>2]);_=(c[k>>2]=n,+g[k>>2]);$=+g[i+(q*12&-1)+8>>2];aa=+R(+K);ab=+Q(+K);K=+R(+O);ac=+Q(+O);O=+R(+U);ad=+Q(+U);U=+R(+Y);ae=+Q(+Y);q=b+272|0;g[q>>2]=0.0;i=(c[b+76>>2]|0)==1;Y=(c[k>>2]=A,+g[k>>2]);af=(c[k>>2]=B,+g[k>>2]);ag=(c[k>>2]=w,+g[k>>2]);ah=(c[k>>2]=x,+g[k>>2]);if(i){g[b+240>>2]=0.0;g[b+244>>2]=0.0;g[b+256>>2]=1.0;g[b+264>>2]=1.0;ai=G+I;aj=0.0;ak=0.0;al=1.0;am=1.0}else{an=(c[k>>2]=v,+g[k>>2]);ao=(c[k>>2]=u,+g[k>>2]);ap=(c[k>>2]=z,+g[k>>2]);aq=+g[b+124>>2];ar=+g[b+128>>2];as=ad*aq-O*ar;at=O*aq+ad*ar;ar=+g[b+108>>2]-(c[k>>2]=y,+g[k>>2]);aq=+g[b+112>>2]-ap;ap=+g[b+92>>2]-ao;ao=+g[b+96>>2]-an;y=b+240|0;z=(g[k>>2]=as,c[k>>2]|0);u=(g[k>>2]=at,c[k>>2]|0)|0;c[y>>2]=0|z;c[y+4>>2]=u;an=at*(ad*ar-O*aq)-as*(O*ar+ad*aq);g[b+264>>2]=an;aq=at*(ab*ap-aa*ao)-as*(aa*ap+ab*ao);g[b+256>>2]=aq;ai=E+C+an*I*an+aq*G*aq;aj=as;ak=at;al=aq;am=an}an=ai+0.0;g[q>>2]=an;if((c[b+80>>2]|0)==1){g[b+248>>2]=0.0;g[b+252>>2]=0.0;ai=+g[b+152>>2];g[b+260>>2]=ai;g[b+268>>2]=ai;au=ai*ai*(H+J);av=0.0;aw=0.0;ax=ai;ay=ai}else{ai=+g[b+132>>2];aq=+g[b+136>>2];at=ae*ai-U*aq;as=U*ai+ae*aq;aq=+g[b+116>>2]-Y;Y=+g[b+120>>2]-af;af=+g[b+100>>2]-ag;ag=+g[b+104>>2]-ah;ah=+g[b+152>>2];ai=at*ah;ao=as*ah;u=b+248|0;y=(g[k>>2]=ai,c[k>>2]|0);z=(g[k>>2]=ao,c[k>>2]|0)|0;c[u>>2]=0|y;c[u+4>>2]=z;ab=(as*(ae*aq-U*Y)-at*(U*aq+ae*Y))*ah;g[b+268>>2]=ab;Y=ah*(as*(ac*af-K*ag)-at*(K*af+ac*ag));g[b+260>>2]=Y;au=ah*ah*(F+D)+ab*J*ab+Y*Y*H;av=ai;aw=ao;ax=Y;ay=ab}ab=an+au;g[q>>2]=ab;if(ab>0.0){az=1.0/ab}else{az=0.0}g[q>>2]=az;q=b+156|0;if((a[d+20|0]&1)<<24>>24==0){g[q>>2]=0.0;aA=$;aB=N;aC=X;aD=T;aE=Z;aF=_;aG=V;aH=W;aI=P;aJ=S;aK=L;aL=M}else{az=+g[q>>2];ab=C*az;C=az*D;D=az*E;E=az*F;aA=$-az*J*ay;aB=N+az*G*al;aC=X-az*I*am;aD=T+az*H*ax;aE=Z-av*E;aF=_-aw*E;aG=V-aj*D;aH=W-ak*D;aI=P+av*C;aJ=S+C*aw;aK=L+aj*ab;aL=M+ab*ak}q=(c[m>>2]|0)+(f*12&-1)|0;f=(g[k>>2]=aK,c[k>>2]|0);d=(g[k>>2]=aL,c[k>>2]|0)|0;c[q>>2]=0|f;c[q+4>>2]=d;g[(c[m>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=aB;h=(c[m>>2]|0)+((c[l>>2]|0)*12&-1)|0;d=(g[k>>2]=aI,c[k>>2]|0);q=(g[k>>2]=aJ,c[k>>2]|0)|0;c[h>>2]=0|d;c[h+4>>2]=q;g[(c[m>>2]|0)+((c[l>>2]|0)*12&-1)+8>>2]=aD;l=(c[m>>2]|0)+((c[o>>2]|0)*12&-1)|0;q=(g[k>>2]=aG,c[k>>2]|0);h=(g[k>>2]=aH,c[k>>2]|0)|0;c[l>>2]=0|q;c[l+4>>2]=h;g[(c[m>>2]|0)+((c[o>>2]|0)*12&-1)+8>>2]=aC;o=(c[m>>2]|0)+((c[r>>2]|0)*12&-1)|0;h=(g[k>>2]=aE,c[k>>2]|0);l=(g[k>>2]=aF,c[k>>2]|0)|0;c[o>>2]=0|h;c[o+4>>2]=l;g[(c[m>>2]|0)+((c[r>>2]|0)*12&-1)+8>>2]=aA;return}function ev(a){a=a|0;return}function ew(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+92>>2];h=+g[d+20>>2];i=+g[b+96>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function ex(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+100>>2];h=+g[d+20>>2];i=+g[b+104>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function ey(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0;d=+g[b+156>>2];e=d*+g[b+244>>2]*c;g[a>>2]=d*+g[b+240>>2]*c;g[a+4>>2]=e;return}function ez(a,b){a=a|0;b=+b;return+(+g[a+156>>2]*+g[a+256>>2]*b)}function eA(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0.0,v=0.0,w=0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0;d=a+160|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];e=a+164|0;i=c[e>>2]|0;n=b+(i*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(i*12&-1)+8>>2];i=a+168|0;o=c[i>>2]|0;n=b+(o*12&-1)|0;s=c[n+4>>2]|0;t=(c[k>>2]=c[n>>2]|0,+g[k>>2]);u=(c[k>>2]=s,+g[k>>2]);v=+g[b+(o*12&-1)+8>>2];o=a+172|0;s=c[o>>2]|0;n=b+(s*12&-1)|0;w=c[n+4>>2]|0;x=(c[k>>2]=c[n>>2]|0,+g[k>>2]);y=(c[k>>2]=w,+g[k>>2]);z=+g[b+(s*12&-1)+8>>2];A=+R(+m);B=+Q(+m);C=+R(+r);D=+Q(+r);E=+R(+v);F=+Q(+v);G=+R(+z);H=+Q(+z);if((c[a+76>>2]|0)==1){I=+g[a+224>>2];J=+g[a+232>>2];K=I+J;L=1.0;M=1.0;N=m-v- +g[a+140>>2];O=0.0;P=0.0;S=I;T=J}else{J=+g[a+124>>2];I=+g[a+128>>2];U=F*J-E*I;V=E*J+F*I;W=+g[a+108>>2]- +g[a+192>>2];X=+g[a+112>>2]- +g[a+196>>2];Y=+g[a+92>>2]- +g[a+176>>2];Z=+g[a+96>>2]- +g[a+180>>2];_=B*Y-A*Z;$=A*Y+B*Z;Z=V*(F*W-E*X)-U*(E*W+F*X);B=V*_-U*$;Y=+g[a+232>>2];A=+g[a+224>>2];aa=j-t+_;_=l-u+$;K=+g[a+216>>2]+ +g[a+208>>2]+Z*Z*Y+B*A*B;L=Z;M=B;N=J*(F*aa+E*_-W)+I*(aa*(-0.0-E)+F*_-X);O=U;P=V;S=A;T=Y}if((c[a+80>>2]|0)==1){Y=+g[a+152>>2];A=+g[a+228>>2];V=+g[a+236>>2];ab=Y*Y*(A+V);ac=Y;ad=Y;ae=r-z- +g[a+144>>2];af=0.0;ag=0.0;ah=Y;ai=A;aj=V}else{V=+g[a+132>>2];A=+g[a+136>>2];Y=H*V-G*A;U=G*V+H*A;X=+g[a+116>>2]- +g[a+200>>2];_=+g[a+120>>2]- +g[a+204>>2];F=+g[a+100>>2]- +g[a+184>>2];E=+g[a+104>>2]- +g[a+188>>2];aa=D*F-C*E;I=C*F+D*E;E=+g[a+152>>2];D=E*(U*(H*X-G*_)-Y*(G*X+H*_));F=E*(U*aa-Y*I);C=+g[a+236>>2];W=+g[a+228>>2];J=p-x+aa;aa=q-y+I;ab=E*E*(+g[a+220>>2]+ +g[a+212>>2])+D*D*C+F*W*F;ac=D;ad=F;ae=V*(H*J+G*aa-X)+A*(J*(-0.0-G)+H*aa-_);af=Y*E;ag=U*E;ah=E;ai=W;aj=C}C=K+0.0+ab;if(C>0.0){ak=(-0.0-(N+ae*ah- +g[a+148>>2]))/C}else{ak=0.0}C=ak*+g[a+208>>2];ah=ak*+g[a+212>>2];ae=ak*+g[a+216>>2];N=ak*+g[a+220>>2];a=(g[k>>2]=j+O*C,c[k>>2]|0);s=(g[k>>2]=l+P*C,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=s;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=m+M*ak*S;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;s=(g[k>>2]=p+af*ah,c[k>>2]|0);h=(g[k>>2]=q+ag*ah,c[k>>2]|0)|0;c[d>>2]=0|s;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=r+ad*ak*ai;e=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;h=(g[k>>2]=t-O*ae,c[k>>2]|0);d=(g[k>>2]=u-P*ae,c[k>>2]|0)|0;c[e>>2]=0|h;c[e+4>>2]=d;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=v-L*ak*T;i=(c[f>>2]|0)+((c[o>>2]|0)*12&-1)|0;d=(g[k>>2]=x-af*N,c[k>>2]|0);e=(g[k>>2]=y-ag*N,c[k>>2]|0)|0;c[i>>2]=0|d;c[i+4>>2]=e;g[(c[f>>2]|0)+((c[o>>2]|0)*12&-1)+8>>2]=z-ac*ak*aj;return 1}function eB(b){b=b|0;var d=0,e=0,f=0,j=0,l=0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;j=c[(c[b+68>>2]|0)+56>>2]|0;l=c[(c[b+72>>2]|0)+56>>2]|0;cB(5247220,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5251944,(t=i,i=i+4|0,c[t>>2]=e,t)|0);cB(5249608,(t=i,i=i+4|0,c[t>>2]=f,t)|0);cB(5247800,(t=i,i=i+4|0,c[t>>2]=a[b+61|0]&1,t)|0);cB(5245776,(t=i,i=i+4|0,c[t>>2]=j,t)|0);cB(5245520,(t=i,i=i+4|0,c[t>>2]=l,t)|0);cB(5252088,(t=i,i=i+8|0,h[k>>3]=+g[b+152>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5252424,(t=i,i=i+4|0,c[t>>2]=c[b+56>>2]|0,t)|0);i=d;return}function eC(a){a=a|0;pl(a);return}function eD(a){a=a|0;return}function eE(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;e=b|0;f=c[e>>2]|0;if((f|0)==8){h=cA(d,208)|0;if((h|0)==0){i=0}else{j=h;c[j>>2]=5259380;k=b+8|0;l=b+12|0;if((c[k>>2]|0)==(c[l>>2]|0)){aH(5248204,173,5256164,5249852)}c[h+4>>2]=c[e>>2]|0;c[h+8>>2]=0;c[h+12>>2]=0;c[h+48>>2]=c[k>>2]|0;c[h+52>>2]=c[l>>2]|0;c[h+56>>2]=0;a[h+61|0]=a[b+16|0]&1;a[h+60|0]=0;c[h+64>>2]=c[b+4>>2]|0;pr(h+16|0,0,32);c[j>>2]=5260156;j=b+20|0;l=h+80|0;k=c[j+4>>2]|0;c[l>>2]=c[j>>2]|0;c[l+4>>2]=k;k=b+28|0;l=h+88|0;j=c[k+4>>2]|0;c[l>>2]=c[k>>2]|0;c[l+4>>2]=j;g[h+96>>2]=+g[b+36>>2];g[h+68>>2]=+g[b+40>>2];g[h+72>>2]=+g[b+44>>2];g[h+104>>2]=0.0;g[h+108>>2]=0.0;g[h+112>>2]=0.0;i=h}h=i|0;return h|0}else if((f|0)==4){i=cA(d,196)|0;if((i|0)==0){m=0}else{j=i;e8(j,b);m=j}h=m|0;return h|0}else if((f|0)==2){m=cA(d,256)|0;if((m|0)==0){n=0}else{j=m;eT(j,b);n=j}h=n|0;return h|0}else if((f|0)==3){n=cA(d,176)|0;if((n|0)==0){o=0}else{j=n;c[j>>2]=5259380;m=b+8|0;i=b+12|0;if((c[m>>2]|0)==(c[i>>2]|0)){aH(5248204,173,5256164,5249852)}c[n+4>>2]=c[e>>2]|0;c[n+8>>2]=0;c[n+12>>2]=0;c[n+48>>2]=c[m>>2]|0;c[n+52>>2]=c[i>>2]|0;c[n+56>>2]=0;a[n+61|0]=a[b+16|0]&1;a[n+60|0]=0;c[n+64>>2]=c[b+4>>2]|0;pr(n+16|0,0,32);c[j>>2]=5259768;j=b+20|0;i=n+80|0;m=c[j+4>>2]|0;c[i>>2]=c[j>>2]|0;c[i+4>>2]=m;m=b+28|0;i=n+88|0;j=c[m+4>>2]|0;c[i>>2]=c[m>>2]|0;c[i+4>>2]=j;g[n+104>>2]=+g[b+36>>2];g[n+68>>2]=+g[b+40>>2];g[n+72>>2]=+g[b+44>>2];g[n+100>>2]=0.0;g[n+96>>2]=0.0;g[n+76>>2]=0.0;o=n}h=o|0;return h|0}else if((f|0)==5){o=cA(d,168)|0;if((o|0)==0){p=0}else{n=o;eO(n,b);p=n}h=p|0;return h|0}else if((f|0)==9){p=cA(d,180)|0;if((p|0)==0){q=0}else{n=p;c[n>>2]=5259380;o=b+8|0;j=b+12|0;if((c[o>>2]|0)==(c[j>>2]|0)){aH(5248204,173,5256164,5249852)}c[p+4>>2]=c[e>>2]|0;c[p+8>>2]=0;c[p+12>>2]=0;c[p+48>>2]=c[o>>2]|0;c[p+52>>2]=c[j>>2]|0;c[p+56>>2]=0;a[p+61|0]=a[b+16|0]&1;a[p+60|0]=0;c[p+64>>2]=c[b+4>>2]|0;pr(p+16|0,0,32);c[n>>2]=5259716;n=b+20|0;j=p+68|0;o=c[n+4>>2]|0;c[j>>2]=c[n>>2]|0;c[j+4>>2]=o;o=b+28|0;j=p+76|0;n=c[o+4>>2]|0;c[j>>2]=c[o>>2]|0;c[j+4>>2]=n;g[p+84>>2]=0.0;g[p+88>>2]=0.0;g[p+92>>2]=0.0;g[p+96>>2]=+g[b+36>>2];g[p+100>>2]=+g[b+40>>2];q=p}h=q|0;return h|0}else if((f|0)==10){q=cA(d,168)|0;if((q|0)==0){r=0}else{p=q;c[p>>2]=5259380;n=b+8|0;j=b+12|0;if((c[n>>2]|0)==(c[j>>2]|0)){aH(5248204,173,5256164,5249852)}c[q+4>>2]=c[e>>2]|0;c[q+8>>2]=0;c[q+12>>2]=0;c[q+48>>2]=c[n>>2]|0;c[q+52>>2]=c[j>>2]|0;c[q+56>>2]=0;a[q+61|0]=a[b+16|0]&1;a[q+60|0]=0;c[q+64>>2]=c[b+4>>2]|0;pr(q+16|0,0,32);c[p>>2]=5260208;p=b+20|0;j=q+68|0;n=c[p+4>>2]|0;c[j>>2]=c[p>>2]|0;c[j+4>>2]=n;n=b+28|0;j=q+76|0;p=c[n+4>>2]|0;c[j>>2]=c[n>>2]|0;c[j+4>>2]=p;g[q+84>>2]=+g[b+36>>2];g[q+160>>2]=0.0;g[q+92>>2]=0.0;c[q+164>>2]=0;g[q+88>>2]=0.0;r=q}h=r|0;return h|0}else if((f|0)==6){r=cA(d,276)|0;if((r|0)==0){s=0}else{q=r;es(q,b);s=q}h=s|0;return h|0}else if((f|0)==1){s=cA(d,228)|0;if((s|0)==0){t=0}else{q=s;c[q>>2]=5259380;r=b+8|0;p=b+12|0;if((c[r>>2]|0)==(c[p>>2]|0)){aH(5248204,173,5256164,5249852)}c[s+4>>2]=c[e>>2]|0;c[s+8>>2]=0;c[s+12>>2]=0;c[s+48>>2]=c[r>>2]|0;c[s+52>>2]=c[p>>2]|0;c[s+56>>2]=0;a[s+61|0]=a[b+16|0]&1;a[s+60|0]=0;c[s+64>>2]=c[b+4>>2]|0;pr(s+16|0,0,32);c[q>>2]=5259664;q=b+20|0;p=s+68|0;r=c[q+4>>2]|0;c[p>>2]=c[q>>2]|0;c[p+4>>2]=r;r=b+28|0;p=s+76|0;q=c[r+4>>2]|0;c[p>>2]=c[r>>2]|0;c[p+4>>2]=q;g[s+116>>2]=+g[b+36>>2];q=s+84|0;c[q>>2]=0;c[q+4>>2]=0;c[q+8>>2]=0;c[q+12>>2]=0;g[s+120>>2]=+g[b+44>>2];g[s+124>>2]=+g[b+48>>2];g[s+104>>2]=+g[b+60>>2];g[s+108>>2]=+g[b+56>>2];a[s+112|0]=a[b+40|0]&1;a[s+100|0]=a[b+52|0]&1;c[s+224>>2]=0;t=s}h=t|0;return h|0}else if((f|0)==7){f=cA(d,224)|0;if((f|0)==0){u=0}else{d=f;fI(d,b);u=d}h=u|0;return h|0}else{aH(5248204,113,5256264,5252172);h=0;return h|0}return 0}function eF(b,d){b=b|0;d=d|0;var e=0,f=0,g=0;aW[c[(c[b>>2]|0)+20>>2]&2047](b);e=c[b+4>>2]|0;if((e|0)==8){f=a[5261748]|0;if((f&255)>=14){aH(5246516,173,5257772,5247588)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else if((e|0)==9){g=a[5261720]|0;if((g&255)>=14){aH(5246516,173,5257772,5247588)}f=d+12+((g&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else if((e|0)==7){f=a[5261764]|0;if((f&255)>=14){aH(5246516,173,5257772,5247588)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else if((e|0)==5){g=a[5261708]|0;if((g&255)>=14){aH(5246516,173,5257772,5247588)}f=d+12+((g&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else if((e|0)==3){f=a[5261716]|0;if((f&255)>=14){aH(5246516,173,5257772,5247588)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else if((e|0)==2){g=a[5261796]|0;if((g&255)>=14){aH(5246516,173,5257772,5247588)}f=d+12+((g&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else if((e|0)==10){f=a[5261708]|0;if((f&255)>=14){aH(5246516,173,5257772,5247588)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else if((e|0)==4){g=a[5261736]|0;if((g&255)>=14){aH(5246516,173,5257772,5247588)}f=d+12+((g&255)<<2)|0;c[b>>2]=c[f>>2]|0;c[f>>2]=b;return}else if((e|0)==6){f=a[5261816]|0;if((f&255)>=14){aH(5246516,173,5257772,5247588)}g=d+12+((f&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else if((e|0)==1){e=a[5261768]|0;if((e&255)>=14){aH(5246516,173,5257772,5247588)}g=d+12+((e&255)<<2)|0;c[b>>2]=c[g>>2]|0;c[g>>2]=b;return}else{aH(5248204,166,5256204,5252172);return}}function eG(a){a=a|0;a=i;cB(5247916,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);i=a;return}function eH(a){a=a|0;pl(a);return}function eI(a,b){a=a|0;b=b|0;return 1}function eJ(a){a=a|0;return}function eK(a,b){a=a|0;b=+b;return+(b*0.0)}function eL(a,b){a=a|0;b=b|0;var d=0;d=b+76|0;b=a;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function eM(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function eN(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+100>>2]*c;g[a>>2]=+g[b+96>>2]*c;g[a+4>>2]=d;return}function eO(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0,n=0,o=0,p=0,r=0.0,s=0.0;e=b|0;c[e>>2]=5259380;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){aH(5248204,173,5256164,5249852)}c[b+4>>2]=c[d>>2]|0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[f>>2]|0;f=b+52|0;c[f>>2]=c[h>>2]|0;c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2]|0;pr(b+16|0,0,32);c[e>>2]=5260060;e=b+68|0;h=b+76|0;i=d+20|0;j=+g[i>>2];do{if(j==j&!(B=0.0,B!=B)&j>+-q&j<+q){l=+g[d+24>>2];if(l==l&!(B=0.0,B!=B)&l>+-q&l<+q){break}else{m=2690;break}}else{m=2690}}while(0);if((m|0)==2690){aH(5248032,34,5258456,5252112)}m=d+28|0;j=+g[m>>2];if(j<0.0|j==j&!(B=0.0,B!=B)&j>+-q&j<+q^1){aH(5248032,35,5258456,5249800)}n=d+32|0;j=+g[n>>2];if(j<0.0|j==j&!(B=0.0,B!=B)&j>+-q&j<+q^1){aH(5248032,36,5258456,5247860)}o=d+36|0;j=+g[o>>2];if(j<0.0|j==j&!(B=0.0,B!=B)&j>+-q&j<+q^1){aH(5248032,37,5258456,5247160)}d=i;i=h;h=c[d>>2]|0;p=c[d+4>>2]|0;c[i>>2]=h;c[i+4>>2]=p;i=c[f>>2]|0;j=(c[k>>2]=h,+g[k>>2])- +g[i+12>>2];l=(c[k>>2]=p,+g[k>>2])- +g[i+16>>2];r=+g[i+24>>2];s=+g[i+20>>2];i=e;e=(g[k>>2]=j*r+l*s,c[k>>2]|0);p=(g[k>>2]=r*l+j*(-0.0-s),c[k>>2]|0)|0;c[i>>2]=0|e;c[i+4>>2]=p;g[b+104>>2]=+g[m>>2];g[b+96>>2]=0.0;g[b+100>>2]=0.0;g[b+84>>2]=+g[n>>2];g[b+88>>2]=+g[o>>2];g[b+92>>2]=0.0;g[b+108>>2]=0.0;return}function eP(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,S=0;e=c[b+52>>2]|0;f=c[e+8>>2]|0;h=b+116|0;c[h>>2]=f;i=b+128|0;j=e+28|0;l=i;m=c[j+4>>2]|0;c[l>>2]=c[j>>2]|0;c[l+4>>2]=m;m=b+136|0;g[m>>2]=+g[e+120>>2];l=b+140|0;g[l>>2]=+g[e+128>>2];j=c[d+24>>2]|0;n=j+(f*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[j+(f*12&-1)+8>>2];j=d+28|0;o=c[j>>2]|0;n=o+(f*12&-1)|0;s=c[n+4>>2]|0;t=(c[k>>2]=c[n>>2]|0,+g[k>>2]);u=(c[k>>2]=s,+g[k>>2]);v=+g[o+(f*12&-1)+8>>2];w=+R(+r);x=+Q(+r);r=+g[e+116>>2];y=+g[b+84>>2]*6.2831854820251465;z=+g[d>>2];A=z*r*y*y;B=y*r*2.0*+g[b+88>>2]+A;if(B<=1.1920928955078125e-7){aH(5248032,125,5258508,5246760)}r=z*B;if(r!=0.0){C=1.0/r}else{C=r}g[b+108>>2]=C;r=A*C;g[b+92>>2]=r;A=+g[b+68>>2]- +g[i>>2];B=+g[b+72>>2]- +g[b+132>>2];z=x*A-w*B;y=w*A+x*B;i=b+120|0;e=(g[k>>2]=z,c[k>>2]|0);f=(g[k>>2]=y,c[k>>2]|0)|0;c[i>>2]=0|e;c[i+4>>2]=f;B=+g[m>>2];x=+g[l>>2];A=C+(B+y*x*y);w=y*z*(-0.0-x);D=C+(B+z*x*z);C=A*D-w*w;if(C!=0.0){E=1.0/C}else{E=C}C=w*(-0.0-E);g[b+144>>2]=D*E;g[b+148>>2]=C;g[b+152>>2]=C;g[b+156>>2]=A*E;l=b+160|0;E=p+z- +g[b+76>>2];p=q+y- +g[b+80>>2];m=l;f=(g[k>>2]=E,c[k>>2]|0);i=(g[k>>2]=p,c[k>>2]|0)|0;c[m>>2]=0|f;c[m+4>>2]=i;g[l>>2]=r*E;g[b+164>>2]=r*p;p=v*.9800000190734863;l=b+96|0;if((a[d+20|0]&1)<<24>>24==0){g[l>>2]=0.0;g[b+100>>2]=0.0;v=p;r=t;E=u;i=c[h>>2]|0;m=c[j>>2]|0;f=m+(i*12&-1)|0;e=f;o=(g[k>>2]=r,c[k>>2]|0);s=(g[k>>2]=E,c[k>>2]|0);n=s;F=0;G=0;H=n;I=o;J=0;K=G|I;L=H|J;M=e|0;c[M>>2]=K;N=e+4|0;c[N>>2]=L;O=c[h>>2]|0;P=c[j>>2]|0;S=P+(O*12&-1)+8|0;g[S>>2]=v;return}else{q=+g[d+8>>2];d=l|0;A=q*+g[d>>2];g[d>>2]=A;d=b+100|0;C=q*+g[d>>2];g[d>>2]=C;v=p+x*(C*z-A*y);r=t+B*A;E=u+C*B;i=c[h>>2]|0;m=c[j>>2]|0;f=m+(i*12&-1)|0;e=f;o=(g[k>>2]=r,c[k>>2]|0);s=(g[k>>2]=E,c[k>>2]|0);n=s;F=0;G=0;H=n;I=o;J=0;K=G|I;L=H|J;M=e|0;c[M>>2]=K;N=e+4|0;c[N>>2]=L;O=c[h>>2]|0;P=c[j>>2]|0;S=P+(O*12&-1)+8|0;g[S>>2]=v;return}}function eQ(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0,x=0.0,y=0.0,z=0.0;d=a+116|0;e=c[d>>2]|0;f=b+28|0;h=c[f>>2]|0;i=h+(e*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[h+(e*12&-1)+8>>2];o=+g[a+124>>2];p=+g[a+120>>2];q=+g[a+108>>2];h=a+96|0;j=h|0;r=+g[j>>2];i=a+100|0;s=+g[i>>2];t=-0.0-(l+o*(-0.0-n)+ +g[a+160>>2]+q*r);u=-0.0-(m+n*p+ +g[a+164>>2]+q*s);q=+g[a+144>>2]*t+ +g[a+152>>2]*u;v=+g[a+148>>2]*t+ +g[a+156>>2]*u;w=h;h=c[w+4>>2]|0;u=(c[k>>2]=c[w>>2]|0,+g[k>>2]);t=(c[k>>2]=h,+g[k>>2]);x=r+q;g[j>>2]=x;q=v+s;g[i>>2]=q;s=+g[b>>2]*+g[a+104>>2];v=q*q+x*x;if(v>s*s){r=s/+O(+v);v=x*r;g[j>>2]=v;s=r*q;g[i>>2]=s;y=v;z=s}else{y=x;z=q}q=y-u;u=z-t;t=+g[a+136>>2];z=n+ +g[a+140>>2]*(u*p-q*o);a=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=l+q*t,c[k>>2]|0);i=(g[k>>2]=m+u*t,c[k>>2]|0)|0;c[a>>2]=0|e;c[a+4>>2]=i;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=z;return}function eR(a){a=a|0;a=i;cB(5246312,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);i=a;return}function eS(a){a=a|0;pl(a);return}function eT(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0.0,q=0.0;e=b|0;c[e>>2]=5259380;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){aH(5248204,173,5256164,5249852)}c[b+4>>2]=c[d>>2]|0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[f>>2]|0;c[b+52>>2]=c[h>>2]|0;c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2]|0;pr(b+16|0,0,32);c[e>>2]=5259588;e=b+84|0;h=d+20|0;f=b+68|0;i=c[h+4>>2]|0;c[f>>2]=c[h>>2]|0;c[f+4>>2]=i;i=d+28|0;f=b+76|0;h=c[i+4>>2]|0;c[f>>2]=c[i>>2]|0;c[f+4>>2]=h;h=d+36|0;f=e;i=c[h>>2]|0;j=c[h+4>>2]|0;c[f>>2]=i;c[f+4>>2]=j;l=(c[k>>2]=i,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+O(+(l*l+m*m));if(n<1.1920928955078125e-7){o=m;p=l}else{q=1.0/n;n=l*q;g[e>>2]=n;l=m*q;g[b+88>>2]=l;o=l;p=n}e=b+92|0;j=(g[k>>2]=o*-1.0,c[k>>2]|0);i=(g[k>>2]=p,c[k>>2]|0)|0;c[e>>2]=0|j;c[e+4>>2]=i;g[b+100>>2]=+g[d+44>>2];g[b+252>>2]=0.0;i=b+104|0;c[i>>2]=0;c[i+4>>2]=0;c[i+8>>2]=0;c[i+12>>2]=0;g[b+120>>2]=+g[d+52>>2];g[b+124>>2]=+g[d+56>>2];g[b+128>>2]=+g[d+64>>2];g[b+132>>2]=+g[d+68>>2];a[b+136|0]=a[d+48|0]&1;a[b+137|0]=a[d+60|0]&1;c[b+140>>2]=0;d=b+184|0;c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;return}function eU(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+144|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+148|0;c[l>>2]=j;m=e+28|0;n=b+152|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+160|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+168>>2]=s;t=+g[i+120>>2];g[b+172>>2]=t;u=+g[e+128>>2];g[b+176>>2]=u;v=+g[i+128>>2];g[b+180>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;m=c[e+4>>2]|0;w=(c[k>>2]=c[e>>2]|0,+g[k>>2]);x=(c[k>>2]=m,+g[k>>2]);y=+g[i+(f*12&-1)+8>>2];m=d+28|0;e=c[m>>2]|0;n=e+(f*12&-1)|0;z=c[n+4>>2]|0;A=(c[k>>2]=c[n>>2]|0,+g[k>>2]);B=(c[k>>2]=z,+g[k>>2]);C=+g[e+(f*12&-1)+8>>2];z=i+(j*12&-1)|0;n=c[z+4>>2]|0;D=(c[k>>2]=c[z>>2]|0,+g[k>>2]);E=(c[k>>2]=n,+g[k>>2]);F=+g[i+(j*12&-1)+8>>2];i=e+(j*12&-1)|0;n=c[i+4>>2]|0;G=(c[k>>2]=c[i>>2]|0,+g[k>>2]);H=(c[k>>2]=n,+g[k>>2]);I=+g[e+(j*12&-1)+8>>2];J=+R(+y);K=+Q(+y);y=+R(+F);L=+Q(+F);F=+g[b+68>>2];M=F-(c[k>>2]=o,+g[k>>2]);F=+g[b+72>>2];N=F-(c[k>>2]=p,+g[k>>2]);F=K*M-J*N;O=J*M+K*N;N=+g[b+76>>2];M=N-(c[k>>2]=q,+g[k>>2]);N=+g[b+80>>2];P=N-(c[k>>2]=r,+g[k>>2]);N=L*M-y*P;S=y*M+L*P;P=D-w+N-F;w=E-x+S-O;x=+g[b+84>>2];E=+g[b+88>>2];D=K*x-J*E;L=J*x+K*E;r=b+184|0;q=(g[k>>2]=D,c[k>>2]|0);p=(g[k>>2]=L,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=p;E=F+P;F=O+w;O=E*L-F*D;g[b+208>>2]=O;x=N*L-S*D;g[b+212>>2]=x;M=s+t;y=u*O;T=v*x;U=M+O*y+x*T;if(U>0.0){V=1.0/U}else{V=U}g[b+252>>2]=V;V=+g[b+92>>2];W=+g[b+96>>2];X=K*V-J*W;Y=J*V+K*W;p=b+192|0;r=(g[k>>2]=X,c[k>>2]|0);q=(g[k>>2]=Y,c[k>>2]|0)|0;c[p>>2]=0|r;c[p+4>>2]=q;W=E*Y-F*X;g[b+200>>2]=W;F=N*Y-S*X;g[b+204>>2]=F;S=u*W;N=v*F;E=S+N;K=S*O+N*x;V=v+u;J=y+T;g[b+216>>2]=M+W*S+F*N;g[b+220>>2]=E;g[b+224>>2]=K;g[b+228>>2]=E;g[b+232>>2]=V==0.0?1.0:V;g[b+236>>2]=J;g[b+240>>2]=K;g[b+244>>2]=J;g[b+248>>2]=U;do{if((a[b+136|0]&1)<<24>>24==0){c[b+140>>2]=0;g[b+112>>2]=0.0}else{U=P*D+w*L;J=+g[b+124>>2];K=+g[b+120>>2];V=J-K;if(V>0.0){Z=V}else{Z=-0.0-V}if(Z<.009999999776482582){c[b+140>>2]=3;break}if(U<=K){q=b+140|0;if((c[q>>2]|0)==1){break}c[q>>2]=1;g[b+112>>2]=0.0;break}q=b+140|0;if(U<J){c[q>>2]=0;g[b+112>>2]=0.0;break}if((c[q>>2]|0)==2){break}c[q>>2]=2;g[b+112>>2]=0.0}}while(0);if((a[b+137|0]&1)<<24>>24==0){g[b+116>>2]=0.0}q=b+104|0;if((a[d+20|0]&1)<<24>>24==0){p=q;c[p>>2]=0;c[p+4>>2]=0;c[p+8>>2]=0;c[p+12>>2]=0;Z=C;w=I;P=G;J=H;U=A;K=B;p=c[m>>2]|0;r=p+(f*12&-1)|0;o=r;j=(g[k>>2]=U,c[k>>2]|0);e=(g[k>>2]=K,c[k>>2]|0);n=e;i=0;z=0;_=n;$=j;aa=0;ab=z|$;ac=_|aa;ad=o|0;c[ad>>2]=ab;ae=o+4|0;c[ae>>2]=ac;af=c[h>>2]|0;ag=c[m>>2]|0;ah=ag+(af*12&-1)+8|0;g[ah>>2]=Z;ai=c[l>>2]|0;aj=c[m>>2]|0;ak=aj+(ai*12&-1)|0;al=ak;am=(g[k>>2]=P,c[k>>2]|0);an=(g[k>>2]=J,c[k>>2]|0);ao=an;ap=0;aq=0;ar=ao;as=am;at=0;au=aq|as;av=ar|at;aw=al|0;c[aw>>2]=au;ax=al+4|0;c[ax>>2]=av;ay=c[l>>2]|0;az=c[m>>2]|0;aA=az+(ay*12&-1)+8|0;g[aA>>2]=w;return}else{aB=d+8|0;V=+g[aB>>2];d=q|0;E=V*+g[d>>2];g[d>>2]=E;d=b+108|0;N=V*+g[d>>2];g[d>>2]=N;d=b+112|0;S=V*+g[d>>2];g[d>>2]=S;d=b+116|0;V=+g[aB>>2]*+g[d>>2];g[d>>2]=V;M=V+S;S=E*X+D*M;D=E*Y+M*L;Z=C-u*(E*W+N+M*O);w=I+v*(N+E*F+M*x);P=G+t*S;J=H+t*D;U=A-s*S;K=B-s*D;p=c[m>>2]|0;r=p+(f*12&-1)|0;o=r;j=(g[k>>2]=U,c[k>>2]|0);e=(g[k>>2]=K,c[k>>2]|0);n=e;i=0;z=0;_=n;$=j;aa=0;ab=z|$;ac=_|aa;ad=o|0;c[ad>>2]=ab;ae=o+4|0;c[ae>>2]=ac;af=c[h>>2]|0;ag=c[m>>2]|0;ah=ag+(af*12&-1)+8|0;g[ah>>2]=Z;ai=c[l>>2]|0;aj=c[m>>2]|0;ak=aj+(ai*12&-1)|0;al=ak;am=(g[k>>2]=P,c[k>>2]|0);an=(g[k>>2]=J,c[k>>2]|0);ao=an;ap=0;aq=0;ar=ao;as=am;at=0;au=aq|as;av=ar|at;aw=al|0;c[aw>>2]=au;ax=al+4|0;c[ax>>2]=av;ay=c[l>>2]|0;az=c[m>>2]|0;aA=az+(ay*12&-1)+8|0;g[aA>>2]=w;return}}function eV(a){a=a|0;return}function eW(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function eX(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function eY(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0,f=0.0;d=+g[b+104>>2];e=+g[b+116>>2]+ +g[b+112>>2];f=(d*+g[b+196>>2]+e*+g[b+188>>2])*c;g[a>>2]=(d*+g[b+192>>2]+ +g[b+184>>2]*e)*c;g[a+4>>2]=f;return}function eZ(a,b){a=a|0;b=+b;return+(+g[a+108>>2]*b)}function e_(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,Q=0.0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0.0,ad=0.0,ae=0.0,af=0.0,ag=0.0,ah=0.0,ai=0.0,aj=0.0,ak=0.0,al=0,am=0.0;e=i;i=i+24|0;f=e|0;h=e+12|0;j=b+144|0;l=c[j>>2]|0;m=d+28|0;n=c[m>>2]|0;o=n+(l*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[n+(l*12&-1)+8>>2];p=b+148|0;o=c[p>>2]|0;t=n+(o*12&-1)|0;u=c[t+4>>2]|0;v=(c[k>>2]=c[t>>2]|0,+g[k>>2]);w=(c[k>>2]=u,+g[k>>2]);x=+g[n+(o*12&-1)+8>>2];y=+g[b+168>>2];z=+g[b+172>>2];A=+g[b+176>>2];B=+g[b+180>>2];do{if((a[b+137|0]&1)<<24>>24==0){C=s;D=x;E=v;F=w;G=q;H=r}else{if((c[b+140>>2]|0)==3){C=s;D=x;E=v;F=w;G=q;H=r;break}I=+g[b+184>>2];J=+g[b+188>>2];K=+g[b+212>>2];L=+g[b+208>>2];o=b+116|0;M=+g[o>>2];N=+g[d>>2]*+g[b+128>>2];O=M+ +g[b+252>>2]*(+g[b+132>>2]-((v-q)*I+(w-r)*J+x*K-s*L));P=-0.0-N;Q=O<N?O:N;N=Q<P?P:Q;g[o>>2]=N;Q=N-M;M=I*Q;I=J*Q;C=s-A*L*Q;D=x+B*K*Q;E=v+z*M;F=w+z*I;G=q-y*M;H=r-y*I}}while(0);r=E-G;q=F-H;d=b+192|0;w=+g[d>>2];o=b+196|0;v=+g[o>>2];n=b+204|0;x=+g[n>>2];u=b+200|0;s=+g[u>>2];I=r*w+q*v+D*x-C*s;M=D-C;do{if((a[b+136|0]&1)<<24>>24==0){R=17}else{t=b+140|0;if((c[t>>2]|0)==0){R=17;break}S=b+184|0;T=b+188|0;U=b+212|0;V=b+208|0;W=b+104|0;Q=+g[W>>2];X=b+108|0;K=+g[X>>2];Y=b+112|0;L=+g[Y>>2];Z=b+216|0;J=-0.0-I;N=-0.0-M;P=-0.0-(r*+g[S>>2]+q*+g[T>>2]+D*+g[U>>2]-C*+g[V>>2]);g[h>>2]=J;g[h+4>>2]=N;g[h+8>>2]=P;cv(f,Z,h);_=f|0;g[W>>2]=+g[_>>2]+ +g[W>>2];$=f+4|0;g[X>>2]=+g[$>>2]+ +g[X>>2];aa=f+8|0;P=+g[aa>>2]+ +g[Y>>2];g[Y>>2]=P;ab=c[t>>2]|0;if((ab|0)==1){O=P>0.0?P:0.0;g[Y>>2]=O;ac=O}else if((ab|0)==2){O=P<0.0?P:0.0;g[Y>>2]=O;ac=O}else{ac=P}P=ac-L;L=J- +g[b+240>>2]*P;J=N-P*+g[b+244>>2];N=+g[Z>>2];O=+g[b+228>>2];ad=+g[b+220>>2];ae=+g[b+232>>2];af=N*ae-O*ad;if(af!=0.0){ag=1.0/af}else{ag=af}af=Q+(L*ae-O*J)*ag;O=K+(N*J-L*ad)*ag;g[W>>2]=af;g[X>>2]=O;ad=af-Q;Q=O-K;g[_>>2]=ad;g[$>>2]=Q;g[aa>>2]=P;ah=Q+ad*+g[n>>2]+P*+g[U>>2];ai=ad*+g[u>>2]+Q+P*+g[V>>2];aj=ad*+g[o>>2]+P*+g[T>>2];ak=ad*+g[d>>2]+P*+g[S>>2];al=c[j>>2]|0;break}}while(0);if((R|0)==17){ag=-0.0-I;I=-0.0-M;M=+g[b+216>>2];ac=+g[b+228>>2];q=+g[b+220>>2];r=+g[b+232>>2];P=M*r-ac*q;if(P!=0.0){am=1.0/P}else{am=P}P=(r*ag-ac*I)*am;ac=(M*I-q*ag)*am;R=b+104|0;g[R>>2]=+g[R>>2]+P;R=b+108|0;g[R>>2]=ac+ +g[R>>2];ah=ac+P*x;ai=ac+P*s;aj=P*v;ak=P*w;al=l}l=(c[m>>2]|0)+(al*12&-1)|0;al=(g[k>>2]=G-y*ak,c[k>>2]|0);R=(g[k>>2]=H-y*aj,c[k>>2]|0)|0;c[l>>2]=0|al;c[l+4>>2]=R;g[(c[m>>2]|0)+((c[j>>2]|0)*12&-1)+8>>2]=C-A*ai;j=(c[m>>2]|0)+((c[p>>2]|0)*12&-1)|0;R=(g[k>>2]=E+z*ak,c[k>>2]|0);l=(g[k>>2]=F+z*aj,c[k>>2]|0)|0;c[j>>2]=0|R;c[j+4>>2]=l;g[(c[m>>2]|0)+((c[p>>2]|0)*12&-1)+8>>2]=D+B*ah;i=e;return}function e$(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,S=0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0;e=b+144|0;f=c[e>>2]|0;h=d+24|0;d=c[h>>2]|0;i=d+(f*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[d+(f*12&-1)+8>>2];f=b+148|0;j=c[f>>2]|0;o=d+(j*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[d+(j*12&-1)+8>>2];t=+R(+n);u=+Q(+n);v=+R(+s);w=+Q(+s);x=+g[b+168>>2];y=+g[b+172>>2];z=+g[b+176>>2];A=+g[b+180>>2];B=+g[b+68>>2]- +g[b+152>>2];C=+g[b+72>>2]- +g[b+156>>2];D=u*B-t*C;E=t*B+u*C;C=+g[b+76>>2]- +g[b+160>>2];B=+g[b+80>>2]- +g[b+164>>2];F=w*C-v*B;G=v*C+w*B;B=q+F-l-D;w=r+G-m-E;C=+g[b+84>>2];v=+g[b+88>>2];H=u*C-t*v;I=t*C+u*v;v=D+B;D=E+w;E=I*v-H*D;C=F*I-G*H;J=+g[b+92>>2];K=+g[b+96>>2];L=u*J-t*K;M=t*J+u*K;K=M*v-L*D;D=F*M-G*L;G=L*B+M*w;F=s-n- +g[b+100>>2];if(G>0.0){N=G}else{N=-0.0-G}if(F>0.0){O=F}else{O=-0.0-F}do{if((a[b+136|0]&1)<<24>>24==0){P=N;S=0;T=0.0}else{v=H*B+I*w;u=+g[b+124>>2];J=+g[b+120>>2];t=u-J;if(t>0.0){U=t}else{U=-0.0-t}if(U<.009999999776482582){t=v<.20000000298023224?v:.20000000298023224;if(v>0.0){V=v}else{V=-0.0-v}P=N>V?N:V;S=1;T=t<-.20000000298023224?-.20000000298023224:t;break}if(v<=J){t=v-J+.004999999888241291;W=t<0.0?t:0.0;t=J-v;P=N>t?N:t;S=1;T=W<-.20000000298023224?-.20000000298023224:W;break}if(v<u){P=N;S=0;T=0.0;break}W=v-u;u=W+-.004999999888241291;v=u<.20000000298023224?u:.20000000298023224;P=N>W?N:W;S=1;T=v<0.0?0.0:v}}while(0);N=x+y;V=z*K;U=A*D;w=D*U+(N+K*V);B=U+V;if(S){v=C*U+E*V;V=z+A;U=V==0.0?1.0:V;V=z*E;W=A*C;u=W+V;t=C*W+(N+E*V);V=-0.0-G;N=-0.0-F;W=-0.0-T;T=U*t-u*u;J=u*v-B*t;X=u*B-U*v;Y=v*X+(w*T+B*J);if(Y!=0.0){Z=1.0/Y}else{Z=Y}Y=u*V;_=(T*V+J*N+X*W)*Z;$=(v*(Y-v*N)+(w*(t*N-u*W)+B*(v*W-t*V)))*Z;aa=(v*(B*N-U*V)+(w*(U*W-u*N)+B*(Y-B*W)))*Z}else{Z=z+A;W=Z==0.0?1.0:Z;Z=-0.0-G;G=-0.0-F;F=W*w-B*B;if(F!=0.0){ab=1.0/F}else{ab=F}_=(W*Z-B*G)*ab;$=(w*G-B*Z)*ab;aa=0.0}ab=H*aa+L*_;L=I*aa+M*_;S=(g[k>>2]=l-x*ab,c[k>>2]|0);b=(g[k>>2]=m-x*L,c[k>>2]|0)|0;c[i>>2]=0|S;c[i+4>>2]=b;g[(c[h>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=n-z*(E*aa+($+K*_));e=(c[h>>2]|0)+((c[f>>2]|0)*12&-1)|0;b=(g[k>>2]=q+y*ab,c[k>>2]|0);i=(g[k>>2]=r+y*L,c[k>>2]|0)|0;c[e>>2]=0|b;c[e+4>>2]=i;g[(c[h>>2]|0)+((c[f>>2]|0)*12&-1)+8>>2]=s+A*(C*aa+($+D*_));if(P>.004999999888241291){ac=0;return ac|0}ac=O<=.03490658849477768;return ac|0}function e0(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;cB(5249772,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5251944,(t=i,i=i+4|0,c[t>>2]=e,t)|0);cB(5249608,(t=i,i=i+4|0,c[t>>2]=f,t)|0);cB(5247800,(t=i,i=i+4|0,c[t>>2]=a[b+61|0]&1,t)|0);j=+g[b+72>>2];cB(5247116,(t=i,i=i+16|0,h[k>>3]=+g[b+68>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);j=+g[b+80>>2];cB(5246692,(t=i,i=i+16|0,h[k>>3]=+g[b+76>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);j=+g[b+88>>2];cB(5246212,(t=i,i=i+16|0,h[k>>3]=+g[b+84>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);cB(5246252,(t=i,i=i+8|0,h[k>>3]=+g[b+100>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5245488,(t=i,i=i+4|0,c[t>>2]=a[b+136|0]&1,t)|0);cB(5253044,(t=i,i=i+8|0,h[k>>3]=+g[b+120>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5252496,(t=i,i=i+8|0,h[k>>3]=+g[b+124>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5245952,(t=i,i=i+4|0,c[t>>2]=a[b+137|0]&1,t)|0);cB(5245704,(t=i,i=i+8|0,h[k>>3]=+g[b+132>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5251692,(t=i,i=i+8|0,h[k>>3]=+g[b+128>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5252424,(t=i,i=i+4|0,c[t>>2]=c[b+56>>2]|0,t)|0);i=d;return}function e1(a){a=a|0;pl(a);return}function e2(a,b){a=a|0;b=+b;return+0.0}function e3(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0;d=a+120|0;e=c[d>>2]|0;f=b+28|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];i=a+124|0;h=c[i>>2]|0;n=b+(h*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(h*12&-1)+8>>2];s=+g[a+148>>2];t=+g[a+144>>2];u=+g[a+156>>2];v=+g[a+152>>2];w=+g[a+128>>2];x=+g[a+132>>2];y=+g[a+112>>2];z=+g[a+136>>2];A=+g[a+140>>2];B=(-0.0-((j+s*(-0.0-m))*w+(l+m*t)*x)-y*((p+u*(-0.0-r))*z+(q+r*v)*A))*(-0.0- +g[a+192>>2]);h=a+116|0;g[h>>2]=+g[h>>2]+B;C=-0.0-B;D=w*C;w=x*C;C=B*(-0.0-y);y=z*C;z=A*C;C=+g[a+176>>2];A=m+ +g[a+184>>2]*(w*t-D*s);s=+g[a+180>>2];t=r+ +g[a+188>>2]*(z*v-y*u);a=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=j+D*C,c[k>>2]|0);h=(g[k>>2]=l+w*C,c[k>>2]|0)|0;c[a>>2]=0|e;c[a+4>>2]=h;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=A;d=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;h=(g[k>>2]=p+y*s,c[k>>2]|0);a=(g[k>>2]=q+z*s,c[k>>2]|0)|0;c[d>>2]=0|h;c[d+4>>2]=a;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=t;return}function e4(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+92>>2];h=+g[d+20>>2];i=+g[b+96>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function e5(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+100>>2];h=+g[d+20>>2];i=+g[b+104>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function e6(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0;d=+g[b+116>>2];e=d*+g[b+140>>2]*c;g[a>>2]=d*+g[b+136>>2]*c;g[a+4>>2]=e;return}function e7(a,b,d,e,f,h,i,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;i=i|0;j=+j;var l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0.0;c[a+8>>2]=b;c[a+12>>2]=d;l=e;m=a+20|0;n=c[l+4>>2]|0;c[m>>2]=c[l>>2]|0;c[m+4>>2]=n;n=f;m=a+28|0;l=c[n+4>>2]|0;c[m>>2]=c[n>>2]|0;c[m+4>>2]=l;l=h|0;o=+g[l>>2]- +g[b+12>>2];m=h+4|0;p=+g[m>>2]- +g[b+16>>2];q=+g[b+24>>2];r=+g[b+20>>2];b=a+36|0;h=(g[k>>2]=o*q+p*r,c[k>>2]|0);n=(g[k>>2]=q*p+o*(-0.0-r),c[k>>2]|0)|0;c[b>>2]=0|h;c[b+4>>2]=n;n=i|0;r=+g[n>>2]- +g[d+12>>2];b=i+4|0;o=+g[b>>2]- +g[d+16>>2];p=+g[d+24>>2];q=+g[d+20>>2];d=a+44|0;i=(g[k>>2]=r*p+o*q,c[k>>2]|0);h=(g[k>>2]=p*o+r*(-0.0-q),c[k>>2]|0)|0;c[d>>2]=0|i;c[d+4>>2]=h;q=+g[l>>2]- +g[e>>2];r=+g[m>>2]- +g[e+4>>2];g[a+52>>2]=+O(+(q*q+r*r));r=+g[n>>2]- +g[f>>2];q=+g[b>>2]- +g[f+4>>2];g[a+56>>2]=+O(+(r*r+q*q));g[a+60>>2]=j;if(j>1.1920928955078125e-7){return}aH(5247668,51,5257500,5252064);return}function e8(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0.0,j=0.0,k=0,l=0.0,m=0.0,n=0.0,o=0.0,p=0,q=0;e=b|0;c[e>>2]=5259380;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){aH(5248204,173,5256164,5249852)}c[b+4>>2]=c[d>>2]|0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[f>>2]|0;c[b+52>>2]=c[h>>2]|0;c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2]|0;pr(b+16|0,0,32);c[e>>2]=5259912;e=d+20|0;h=b+68|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2]|0;c[h+4>>2]=f;f=d+28|0;h=b+76|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=e;e=d+36|0;h=b+92|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2]|0;c[h+4>>2]=f;f=d+44|0;h=b+100|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=e;e=d+52|0;g[b+84>>2]=+g[e>>2];h=d+56|0;g[b+88>>2]=+g[h>>2];f=d+60|0;i=+g[f>>2];if(i!=0.0){j=i;k=b+112|0;g[k>>2]=j;l=+g[e>>2];m=+g[h>>2];n=j*m;o=l+n;p=b+108|0;g[p>>2]=o;q=b+116|0;g[q>>2]=0.0;return}aH(5247668,65,5258140,5249752);j=+g[f>>2];k=b+112|0;g[k>>2]=j;l=+g[e>>2];m=+g[h>>2];n=j*m;o=l+n;p=b+108|0;g[p>>2]=o;q=b+116|0;g[q>>2]=0.0;return}function e9(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,P=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+120|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+124|0;c[l>>2]=j;m=e+28|0;n=b+160|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+168|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+176>>2]=s;t=+g[i+120>>2];g[b+180>>2]=t;u=+g[e+128>>2];g[b+184>>2]=u;v=+g[i+128>>2];g[b+188>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;m=c[e+4>>2]|0;w=(c[k>>2]=c[e>>2]|0,+g[k>>2]);x=(c[k>>2]=m,+g[k>>2]);y=+g[i+(f*12&-1)+8>>2];m=d+28|0;e=c[m>>2]|0;n=e+(f*12&-1)|0;z=c[n+4>>2]|0;A=(c[k>>2]=c[n>>2]|0,+g[k>>2]);B=(c[k>>2]=z,+g[k>>2]);C=+g[e+(f*12&-1)+8>>2];z=i+(j*12&-1)|0;n=c[z+4>>2]|0;D=(c[k>>2]=c[z>>2]|0,+g[k>>2]);E=(c[k>>2]=n,+g[k>>2]);F=+g[i+(j*12&-1)+8>>2];i=e+(j*12&-1)|0;n=c[i+4>>2]|0;G=(c[k>>2]=c[i>>2]|0,+g[k>>2]);H=(c[k>>2]=n,+g[k>>2]);I=+g[e+(j*12&-1)+8>>2];J=+R(+y);K=+Q(+y);y=+R(+F);L=+Q(+F);F=+g[b+92>>2];M=F-(c[k>>2]=o,+g[k>>2]);F=+g[b+96>>2];N=F-(c[k>>2]=p,+g[k>>2]);F=K*M-J*N;P=J*M+K*N;p=b+144|0;o=(g[k>>2]=F,c[k>>2]|0);j=(g[k>>2]=P,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;N=+g[b+100>>2];K=N-(c[k>>2]=q,+g[k>>2]);N=+g[b+104>>2];M=N-(c[k>>2]=r,+g[k>>2]);N=L*K-y*M;J=y*K+L*M;r=b+152|0;q=(g[k>>2]=N,c[k>>2]|0);j=(g[k>>2]=J,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;j=b+128|0;M=w+F- +g[b+68>>2];w=x+P- +g[b+72>>2];r=j;q=(g[k>>2]=M,c[k>>2]|0);p=(g[k>>2]=w,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=p;p=b+136|0;x=D+N- +g[b+76>>2];D=E+J- +g[b+80>>2];r=p;q=(g[k>>2]=x,c[k>>2]|0);o=(g[k>>2]=D,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=o;o=j|0;E=+O(+(M*M+w*w));j=p|0;L=+O(+(x*x+D*D));if(E>.04999999701976776){K=1.0/E;E=M*K;g[o>>2]=E;S=K*w;T=E}else{g[o>>2]=0.0;S=0.0;T=0.0}g[b+132>>2]=S;if(L>.04999999701976776){E=1.0/L;L=E*x;g[j>>2]=L;U=E*D;V=L}else{g[j>>2]=0.0;U=0.0;V=0.0}g[b+140>>2]=U;L=F*S-P*T;D=N*U-J*V;E=+g[b+112>>2];x=s+L*L*u+E*E*(t+D*D*v);if(x>0.0){W=1.0/x}else{W=x}g[b+192>>2]=W;if((a[d+20|0]&1)<<24>>24==0){g[b+116>>2]=0.0;W=C;x=I;D=G;L=H;w=A;K=B;j=c[m>>2]|0;o=j+(f*12&-1)|0;p=o;r=(g[k>>2]=w,c[k>>2]|0);q=(g[k>>2]=K,c[k>>2]|0);e=q;n=0;i=0;z=e;X=r;Y=0;Z=i|X;_=z|Y;$=p|0;c[$>>2]=Z;aa=p+4|0;c[aa>>2]=_;ab=c[h>>2]|0;ac=c[m>>2]|0;ad=ac+(ab*12&-1)+8|0;g[ad>>2]=W;ae=c[l>>2]|0;af=c[m>>2]|0;ag=af+(ae*12&-1)|0;ah=ag;ai=(g[k>>2]=D,c[k>>2]|0);aj=(g[k>>2]=L,c[k>>2]|0);ak=aj;al=0;am=0;an=ak;ao=ai;ap=0;aq=am|ao;ar=an|ap;as=ah|0;c[as>>2]=aq;at=ah+4|0;c[at>>2]=ar;au=c[l>>2]|0;av=c[m>>2]|0;aw=av+(au*12&-1)+8|0;g[aw>>2]=x;return}else{ax=b+116|0;M=+g[d+8>>2]*+g[ax>>2];g[ax>>2]=M;y=-0.0-M;ay=T*y;T=S*y;y=M*(-0.0-E);E=V*y;V=U*y;W=C+u*(T*F-ay*P);x=I+v*(V*N-E*J);D=G+E*t;L=H+V*t;w=A+ay*s;K=B+T*s;j=c[m>>2]|0;o=j+(f*12&-1)|0;p=o;r=(g[k>>2]=w,c[k>>2]|0);q=(g[k>>2]=K,c[k>>2]|0);e=q;n=0;i=0;z=e;X=r;Y=0;Z=i|X;_=z|Y;$=p|0;c[$>>2]=Z;aa=p+4|0;c[aa>>2]=_;ab=c[h>>2]|0;ac=c[m>>2]|0;ad=ac+(ab*12&-1)+8|0;g[ad>>2]=W;ae=c[l>>2]|0;af=c[m>>2]|0;ag=af+(ae*12&-1)|0;ah=ag;ai=(g[k>>2]=D,c[k>>2]|0);aj=(g[k>>2]=L,c[k>>2]|0);ak=aj;al=0;am=0;an=ak;ao=ai;ap=0;aq=am|ao;ar=an|ap;as=ah|0;c[as>>2]=aq;at=ah+4|0;c[at>>2]=ar;au=c[l>>2]|0;av=c[m>>2]|0;aw=av+(au*12&-1)+8|0;g[aw>>2]=x;return}}function fa(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0;d=a+120|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];e=a+124|0;i=c[e>>2]|0;n=b+(i*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(i*12&-1)+8>>2];s=+R(+m);t=+Q(+m);u=+R(+r);v=+Q(+r);w=+g[a+92>>2]- +g[a+160>>2];x=+g[a+96>>2]- +g[a+164>>2];y=t*w-s*x;z=s*w+t*x;x=+g[a+100>>2]- +g[a+168>>2];t=+g[a+104>>2]- +g[a+172>>2];w=v*x-u*t;s=u*x+v*t;t=j+y- +g[a+68>>2];v=l+z- +g[a+72>>2];x=p+w- +g[a+76>>2];u=q+s- +g[a+80>>2];A=+O(+(t*t+v*v));B=+O(+(x*x+u*u));if(A>.04999999701976776){C=1.0/A;D=t*C;E=v*C}else{D=0.0;E=0.0}if(B>.04999999701976776){C=1.0/B;F=x*C;G=u*C}else{F=0.0;G=0.0}C=y*E-z*D;u=w*G-s*F;x=+g[a+176>>2];v=+g[a+184>>2];t=+g[a+180>>2];H=+g[a+188>>2];I=+g[a+112>>2];J=x+C*C*v+I*I*(t+u*u*H);if(J>0.0){K=1.0/J}else{K=J}J=+g[a+108>>2]-A-B*I;if(J>0.0){L=J}else{L=-0.0-J}B=J*(-0.0-K);K=-0.0-B;J=D*K;D=E*K;K=B*(-0.0-I);I=F*K;F=G*K;a=(g[k>>2]=j+J*x,c[k>>2]|0);i=(g[k>>2]=l+D*x,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=i;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=m+(y*D-z*J)*v;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;i=(g[k>>2]=p+I*t,c[k>>2]|0);h=(g[k>>2]=q+F*t,c[k>>2]|0)|0;c[d>>2]=0|i;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=r+H*(w*F-s*I);return L<.004999999888241291|0}function fb(a){a=a|0;return}function fc(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;cB(5247836,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5251944,(t=i,i=i+4|0,c[t>>2]=e,t)|0);cB(5249608,(t=i,i=i+4|0,c[t>>2]=f,t)|0);cB(5247800,(t=i,i=i+4|0,c[t>>2]=a[b+61|0]&1,t)|0);j=+g[b+72>>2];cB(5245984,(t=i,i=i+16|0,h[k>>3]=+g[b+68>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);j=+g[b+80>>2];cB(5245732,(t=i,i=i+16|0,h[k>>3]=+g[b+76>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);j=+g[b+96>>2];cB(5247116,(t=i,i=i+16|0,h[k>>3]=+g[b+92>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);j=+g[b+104>>2];cB(5246692,(t=i,i=i+16|0,h[k>>3]=+g[b+100>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);cB(5253016,(t=i,i=i+8|0,h[k>>3]=+g[b+84>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5252468,(t=i,i=i+8|0,h[k>>3]=+g[b+88>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5252088,(t=i,i=i+8|0,h[k>>3]=+g[b+112>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5252424,(t=i,i=i+4|0,c[t>>2]=c[b+56>>2]|0,t)|0);i=d;return}function fd(a){a=a|0;pl(a);return}function fe(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+128|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+132|0;c[l>>2]=j;m=e+28|0;n=b+152|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+160|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+168>>2]=s;t=+g[i+120>>2];g[b+172>>2]=t;u=+g[e+128>>2];g[b+176>>2]=u;v=+g[i+128>>2];g[b+180>>2]=v;i=c[d+24>>2]|0;w=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;x=c[n+4>>2]|0;y=(c[k>>2]=c[n>>2]|0,+g[k>>2]);z=(c[k>>2]=x,+g[k>>2]);A=+g[m+(f*12&-1)+8>>2];B=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;x=c[i+4>>2]|0;C=(c[k>>2]=c[i>>2]|0,+g[k>>2]);D=(c[k>>2]=x,+g[k>>2]);E=+g[m+(j*12&-1)+8>>2];F=+R(+w);G=+Q(+w);H=+R(+B);I=+Q(+B);J=+g[b+68>>2];K=J-(c[k>>2]=o,+g[k>>2]);J=+g[b+72>>2];L=J-(c[k>>2]=p,+g[k>>2]);J=G*K-F*L;M=F*K+G*L;p=b+136|0;o=(g[k>>2]=J,c[k>>2]|0);j=(g[k>>2]=M,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;L=+g[b+76>>2];G=L-(c[k>>2]=q,+g[k>>2]);L=+g[b+80>>2];K=L-(c[k>>2]=r,+g[k>>2]);L=I*G-H*K;F=H*G+I*K;r=b+144|0;q=(g[k>>2]=L,c[k>>2]|0);j=(g[k>>2]=F,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;K=u+v;j=K==0.0;I=s+t;g[b+184>>2]=I+u*M*M+v*F*F;G=-0.0-M;H=u*J*G-v*F*L;g[b+196>>2]=H;N=u*G-v*F;g[b+208>>2]=N;g[b+188>>2]=H;g[b+200>>2]=I+u*J*J+v*L*L;I=u*J+v*L;g[b+212>>2]=I;g[b+192>>2]=N;g[b+204>>2]=I;g[b+216>>2]=K;if(K>0.0){O=1.0/K}else{O=K}g[b+220>>2]=O;if((a[b+100|0]&1)<<24>>24==0|j){g[b+96>>2]=0.0}do{if((a[b+112|0]&1)<<24>>24==0|j){c[b+224>>2]=0}else{O=B-w- +g[b+116>>2];K=+g[b+124>>2];I=+g[b+120>>2];N=K-I;if(N>0.0){P=N}else{P=-0.0-N}if(P<.06981317698955536){c[b+224>>2]=3;break}if(O<=I){r=b+224|0;if((c[r>>2]|0)!=1){g[b+92>>2]=0.0}c[r>>2]=1;break}r=b+224|0;if(O<K){c[r>>2]=0;g[b+92>>2]=0.0;break}if((c[r>>2]|0)!=2){g[b+92>>2]=0.0}c[r>>2]=2}}while(0);j=b+84|0;if((a[d+20|0]&1)<<24>>24==0){r=j;c[r>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;c[r+12>>2]=0;P=A;w=E;B=C;K=D;O=y;I=z;r=c[e>>2]|0;q=r+(f*12&-1)|0;p=q;o=(g[k>>2]=O,c[k>>2]|0);m=(g[k>>2]=I,c[k>>2]|0);x=m;i=0;n=0;S=x;T=o;U=0;V=n|T;W=S|U;X=p|0;c[X>>2]=V;Y=p+4|0;c[Y>>2]=W;Z=c[h>>2]|0;_=c[e>>2]|0;$=_+(Z*12&-1)+8|0;g[$>>2]=P;aa=c[l>>2]|0;ab=c[e>>2]|0;ac=ab+(aa*12&-1)|0;ad=ac;ae=(g[k>>2]=B,c[k>>2]|0);af=(g[k>>2]=K,c[k>>2]|0);ag=af;ah=0;ai=0;aj=ag;ak=ae;al=0;am=ai|ak;an=aj|al;ao=ad|0;c[ao>>2]=am;ap=ad+4|0;c[ap>>2]=an;aq=c[l>>2]|0;ar=c[e>>2]|0;as=ar+(aq*12&-1)+8|0;g[as>>2]=w;return}else{at=d+8|0;N=+g[at>>2];d=j|0;H=N*+g[d>>2];g[d>>2]=H;d=b+88|0;G=N*+g[d>>2];g[d>>2]=G;d=b+92|0;au=N*+g[d>>2];g[d>>2]=au;d=b+96|0;N=+g[at>>2]*+g[d>>2];g[d>>2]=N;P=A-u*(au+(N+(G*J-H*M)));w=E+v*(au+(N+(G*L-H*F)));B=C+t*H;K=D+t*G;O=y-s*H;I=z-s*G;r=c[e>>2]|0;q=r+(f*12&-1)|0;p=q;o=(g[k>>2]=O,c[k>>2]|0);m=(g[k>>2]=I,c[k>>2]|0);x=m;i=0;n=0;S=x;T=o;U=0;V=n|T;W=S|U;X=p|0;c[X>>2]=V;Y=p+4|0;c[Y>>2]=W;Z=c[h>>2]|0;_=c[e>>2]|0;$=_+(Z*12&-1)+8|0;g[$>>2]=P;aa=c[l>>2]|0;ab=c[e>>2]|0;ac=ab+(aa*12&-1)|0;ad=ac;ae=(g[k>>2]=B,c[k>>2]|0);af=(g[k>>2]=K,c[k>>2]|0);ag=af;ah=0;ai=0;aj=ag;ak=ae;al=0;am=ai|ak;an=aj|al;ao=ad|0;c[ao>>2]=am;ap=ad+4|0;c[ap>>2]=an;aq=c[l>>2]|0;ar=c[e>>2]|0;as=ar+(aq*12&-1)+8|0;g[as>>2]=w;return}}function ff(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0,u=0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0,K=0,L=0,M=0.0,N=0,O=0,P=0.0,Q=0.0,R=0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0.0,ab=0.0,ac=0.0,ad=0.0,ae=0.0,af=0,ag=0.0;e=i;i=i+24|0;f=e|0;h=e+12|0;j=b+128|0;l=c[j>>2]|0;m=d+28|0;n=c[m>>2]|0;o=n+(l*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[n+(l*12&-1)+8>>2];p=b+132|0;o=c[p>>2]|0;t=n+(o*12&-1)|0;u=c[t+4>>2]|0;v=(c[k>>2]=c[t>>2]|0,+g[k>>2]);w=(c[k>>2]=u,+g[k>>2]);x=+g[n+(o*12&-1)+8>>2];y=+g[b+168>>2];z=+g[b+172>>2];A=+g[b+176>>2];B=+g[b+180>>2];o=A+B==0.0;do{if((a[b+100|0]&1)<<24>>24==0){C=s;D=x}else{if((c[b+224>>2]|0)==3|o){C=s;D=x;break}n=b+96|0;E=+g[n>>2];F=+g[d>>2]*+g[b+104>>2];G=E+(x-s- +g[b+108>>2])*(-0.0- +g[b+220>>2]);H=-0.0-F;I=G<F?G:F;F=I<H?H:I;g[n>>2]=F;I=F-E;C=s-A*I;D=x+B*I}}while(0);do{if((a[b+112|0]&1)<<24>>24==0){J=136}else{d=b+224|0;if((c[d>>2]|0)==0|o){J=136;break}n=b+148|0;u=b+144|0;t=b+140|0;K=b+136|0;x=v+ +g[n>>2]*(-0.0-D)-q- +g[t>>2]*(-0.0-C);s=w+D*+g[u>>2]-r-C*+g[K>>2];g[f>>2]=x;g[f+4>>2]=s;g[f+8>>2]=D-C;L=b+184|0;cv(h,L,f);I=+g[h>>2];E=-0.0-I;F=+g[h+4>>2];H=-0.0-F;G=+g[h+8>>2];M=-0.0-G;N=c[d>>2]|0;do{if((N|0)==2){d=b+84|0;O=b+92|0;P=+g[O>>2];Q=P-G;if(Q<=0.0){R=d|0;g[R>>2]=+g[R>>2]-I;R=b+88|0;g[R>>2]=+g[R>>2]-F;g[O>>2]=Q;S=E;T=H;U=M;break}Q=P*+g[b+208>>2]-x;V=P*+g[b+212>>2]-s;W=+g[L>>2];X=+g[b+196>>2];Y=+g[b+188>>2];Z=+g[b+200>>2];_=W*Z-X*Y;if(_!=0.0){$=1.0/_}else{$=_}_=(Q*Z-X*V)*$;X=(W*V-Q*Y)*$;R=d|0;g[R>>2]=_+ +g[R>>2];R=b+88|0;g[R>>2]=X+ +g[R>>2];g[O>>2]=0.0;S=_;T=X;U=-0.0-P}else if((N|0)==3){O=b+84|0;g[O>>2]=+g[O>>2]-I;O=b+88|0;g[O>>2]=+g[O>>2]-F;O=b+92|0;g[O>>2]=+g[O>>2]-G;S=E;T=H;U=M}else if((N|0)==1){O=b+84|0;R=b+92|0;P=+g[R>>2];X=P-G;if(X>=0.0){d=O|0;g[d>>2]=+g[d>>2]-I;d=b+88|0;g[d>>2]=+g[d>>2]-F;g[R>>2]=X;S=E;T=H;U=M;break}X=P*+g[b+208>>2]-x;_=P*+g[b+212>>2]-s;Y=+g[L>>2];Q=+g[b+196>>2];V=+g[b+188>>2];W=+g[b+200>>2];Z=Y*W-Q*V;if(Z!=0.0){aa=1.0/Z}else{aa=Z}Z=(X*W-Q*_)*aa;Q=(Y*_-X*V)*aa;d=O|0;g[d>>2]=Z+ +g[d>>2];d=b+88|0;g[d>>2]=Q+ +g[d>>2];g[R>>2]=0.0;S=Z;T=Q;U=-0.0-P}else{S=E;T=H;U=M}}while(0);ab=U+(T*+g[K>>2]-S*+g[t>>2]);ac=U+(T*+g[u>>2]-S*+g[n>>2]);ad=S;ae=T;af=c[j>>2]|0;break}}while(0);if((J|0)==136){T=+g[b+148>>2];S=+g[b+144>>2];U=+g[b+140>>2];aa=+g[b+136>>2];$=-0.0-(v+T*(-0.0-D)-q-U*(-0.0-C));M=-0.0-(w+D*S-r-C*aa);H=+g[b+184>>2];E=+g[b+196>>2];s=+g[b+188>>2];x=+g[b+200>>2];F=H*x-E*s;if(F!=0.0){ag=1.0/F}else{ag=F}F=(x*$-E*M)*ag;E=(H*M-s*$)*ag;J=b+84|0;g[J>>2]=+g[J>>2]+F;J=b+88|0;g[J>>2]=E+ +g[J>>2];ab=E*aa-F*U;ac=E*S-F*T;ad=F;ae=E;af=l}l=(c[m>>2]|0)+(af*12&-1)|0;af=(g[k>>2]=q-y*ad,c[k>>2]|0);J=(g[k>>2]=r-y*ae,c[k>>2]|0)|0;c[l>>2]=0|af;c[l+4>>2]=J;g[(c[m>>2]|0)+((c[j>>2]|0)*12&-1)+8>>2]=C-A*ab;j=(c[m>>2]|0)+((c[p>>2]|0)*12&-1)|0;J=(g[k>>2]=v+z*ad,c[k>>2]|0);l=(g[k>>2]=w+z*ae,c[k>>2]|0)|0;c[j>>2]=0|J;c[j+4>>2]=l;g[(c[m>>2]|0)+((c[p>>2]|0)*12&-1)+8>>2]=D+B*ac;i=e;return}function fg(a){a=a|0;return}function fh(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fi(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fj(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+88>>2]*c;g[a>>2]=+g[b+84>>2]*c;g[a+4>>2]=d;return}function fk(a,b){a=a|0;b=+b;return+(+g[a+92>>2]*b)}function fl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0;d=a+96|0;e=c[d>>2]|0;f=b+28|0;h=c[f>>2]|0;i=h+(e*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[h+(e*12&-1)+8>>2];j=a+100|0;i=c[j>>2]|0;o=h+(i*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[h+(i*12&-1)+8>>2];t=+g[a+116>>2];u=+g[a+112>>2];v=+g[a+124>>2];w=+g[a+120>>2];x=+g[a+88>>2]- +g[a+84>>2];y=+g[a+104>>2];z=+g[a+108>>2];A=(q+v*(-0.0-s)-(l+t*(-0.0-n)))*y+(r+s*w-(m+n*u))*z;if(x<0.0){B=A+x*+g[b+4>>2]}else{B=A}b=a+92|0;A=+g[b>>2];x=A+B*(-0.0- +g[a+160>>2]);B=x>0.0?0.0:x;g[b>>2]=B;x=B-A;A=y*x;y=z*x;x=+g[a+144>>2];z=n- +g[a+152>>2]*(u*y-t*A);t=+g[a+148>>2];u=s+ +g[a+156>>2]*(y*w-A*v);a=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=l-x*A,c[k>>2]|0);b=(g[k>>2]=m-x*y,c[k>>2]|0)|0;c[a>>2]=0|e;c[a+4>>2]=b;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=z;d=(c[f>>2]|0)+((c[j>>2]|0)*12&-1)|0;b=(g[k>>2]=q+A*t,c[k>>2]|0);a=(g[k>>2]=r+y*t,c[k>>2]|0)|0;c[d>>2]=0|b;c[d+4>>2]=a;g[(c[f>>2]|0)+((c[j>>2]|0)*12&-1)+8>>2]=u;return}function fm(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0.0,m=0.0,n=0.0,o=0,p=0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0;e=b+128|0;f=c[e>>2]|0;h=d+24|0;d=c[h>>2]|0;i=d+(f*12&-1)|0;j=c[i+4>>2]|0;l=(c[k>>2]=c[i>>2]|0,+g[k>>2]);m=(c[k>>2]=j,+g[k>>2]);n=+g[d+(f*12&-1)+8>>2];f=b+132|0;j=c[f>>2]|0;o=d+(j*12&-1)|0;p=c[o+4>>2]|0;q=(c[k>>2]=c[o>>2]|0,+g[k>>2]);r=(c[k>>2]=p,+g[k>>2]);s=+g[d+(j*12&-1)+8>>2];j=b+176|0;d=b+180|0;do{if((a[b+112|0]&1)<<24>>24==0){t=n;u=s;v=0.0;w=+g[j>>2];x=+g[d>>2]}else{y=+g[d>>2];z=+g[j>>2];p=c[b+224>>2]|0;if((p|0)==0|y+z==0.0){t=n;u=s;v=0.0;w=z;x=y;break}A=s-n- +g[b+116>>2];do{if((p|0)==1){B=A- +g[b+120>>2];C=B+.03490658849477768;D=C<0.0?C:0.0;E=-0.0-B;F=(D<-.13962635397911072?-.13962635397911072:D)*(-0.0- +g[b+220>>2])}else if((p|0)==3){D=A- +g[b+120>>2];B=D<.13962635397911072?D:.13962635397911072;D=B<-.13962635397911072?-.13962635397911072:B;B=D*(-0.0- +g[b+220>>2]);if(D>0.0){E=D;F=B;break}E=-0.0-D;F=B}else if((p|0)==2){B=A- +g[b+124>>2];D=B+-.03490658849477768;C=D<.13962635397911072?D:.13962635397911072;E=B;F=(C<0.0?0.0:C)*(-0.0- +g[b+220>>2])}else{E=0.0;F=0.0}}while(0);t=n-F*z;u=s+F*y;v=E;w=z;x=y}}while(0);E=+R(+t);F=+Q(+t);s=+R(+u);n=+Q(+u);A=+g[b+68>>2]- +g[b+152>>2];C=+g[b+72>>2]- +g[b+156>>2];B=F*A-E*C;D=E*A+F*C;C=+g[b+76>>2]- +g[b+160>>2];F=+g[b+80>>2]- +g[b+164>>2];A=n*C-s*F;E=s*C+n*F;F=q+A-l-B;n=r+E-m-D;C=+O(+(F*F+n*n));s=+g[b+168>>2];G=+g[b+172>>2];H=s+G;I=H+D*D*w+E*E*x;J=A*x;K=D*B*(-0.0-w)-E*J;L=H+B*B*w+A*J;J=I*L-K*K;if(J!=0.0){M=1.0/J}else{M=J}J=-0.0-(F*L-n*K)*M;L=-0.0-(n*I-F*K)*M;b=(g[k>>2]=l-s*J,c[k>>2]|0);j=(g[k>>2]=m-s*L,c[k>>2]|0)|0;c[i>>2]=0|b;c[i+4>>2]=j;g[(c[h>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=t-w*(B*L-D*J);e=(c[h>>2]|0)+((c[f>>2]|0)*12&-1)|0;j=(g[k>>2]=q+G*J,c[k>>2]|0);i=(g[k>>2]=r+G*L,c[k>>2]|0)|0;c[e>>2]=0|j;c[e+4>>2]=i;g[(c[h>>2]|0)+((c[f>>2]|0)*12&-1)+8>>2]=u+x*(A*L-E*J);if(C>.004999999888241291){N=0;return N|0}N=v<=.03490658849477768;return N|0}function fn(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;cB(5249724,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5251944,(t=i,i=i+4|0,c[t>>2]=e,t)|0);cB(5249608,(t=i,i=i+4|0,c[t>>2]=f,t)|0);cB(5247800,(t=i,i=i+4|0,c[t>>2]=a[b+61|0]&1,t)|0);j=+g[b+72>>2];cB(5247116,(t=i,i=i+16|0,h[k>>3]=+g[b+68>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);j=+g[b+80>>2];cB(5246692,(t=i,i=i+16|0,h[k>>3]=+g[b+76>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);cB(5246252,(t=i,i=i+8|0,h[k>>3]=+g[b+116>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5245488,(t=i,i=i+4|0,c[t>>2]=a[b+112|0]&1,t)|0);cB(5253260,(t=i,i=i+8|0,h[k>>3]=+g[b+120>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5252988,(t=i,i=i+8|0,h[k>>3]=+g[b+124>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5245952,(t=i,i=i+4|0,c[t>>2]=a[b+100|0]&1,t)|0);cB(5245704,(t=i,i=i+8|0,h[k>>3]=+g[b+108>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5245456,(t=i,i=i+8|0,h[k>>3]=+g[b+104>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5252424,(t=i,i=i+4|0,c[t>>2]=c[b+56>>2]|0,t)|0);i=d;return}function fo(a){a=a|0;pl(a);return}function fp(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,P=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+96|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+100|0;c[l>>2]=j;m=e+28|0;n=b+128|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+136|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+144>>2]=s;t=+g[i+120>>2];g[b+148>>2]=t;u=+g[e+128>>2];g[b+152>>2]=u;v=+g[i+128>>2];g[b+156>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;m=c[e+4>>2]|0;w=(c[k>>2]=c[e>>2]|0,+g[k>>2]);x=(c[k>>2]=m,+g[k>>2]);y=+g[i+(f*12&-1)+8>>2];m=d+28|0;e=c[m>>2]|0;n=e+(f*12&-1)|0;z=c[n+4>>2]|0;A=(c[k>>2]=c[n>>2]|0,+g[k>>2]);B=(c[k>>2]=z,+g[k>>2]);C=+g[e+(f*12&-1)+8>>2];z=i+(j*12&-1)|0;n=c[z+4>>2]|0;D=(c[k>>2]=c[z>>2]|0,+g[k>>2]);E=(c[k>>2]=n,+g[k>>2]);F=+g[i+(j*12&-1)+8>>2];i=e+(j*12&-1)|0;n=c[i+4>>2]|0;G=(c[k>>2]=c[i>>2]|0,+g[k>>2]);H=(c[k>>2]=n,+g[k>>2]);I=+g[e+(j*12&-1)+8>>2];J=+R(+y);K=+Q(+y);y=+R(+F);L=+Q(+F);F=+g[b+68>>2];M=F-(c[k>>2]=o,+g[k>>2]);F=+g[b+72>>2];N=F-(c[k>>2]=p,+g[k>>2]);F=K*M-J*N;P=J*M+K*N;p=b+112|0;o=(g[k>>2]=F,c[k>>2]|0);j=(g[k>>2]=P,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;N=+g[b+76>>2];K=N-(c[k>>2]=q,+g[k>>2]);N=+g[b+80>>2];M=N-(c[k>>2]=r,+g[k>>2]);N=L*K-y*M;J=y*K+L*M;r=b+120|0;q=(g[k>>2]=N,c[k>>2]|0);j=(g[k>>2]=J,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;j=b+104|0;M=D+N-w-F;w=E+J-x-P;r=j;q=(g[k>>2]=M,c[k>>2]|0);p=(g[k>>2]=w,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=p;p=j|0;j=b+108|0;x=+O(+(M*M+w*w));g[b+88>>2]=x;c[b+164>>2]=x- +g[b+84>>2]>0.0?2:0;if(x<=.004999999888241291){g[p>>2]=0.0;g[j>>2]=0.0;g[b+160>>2]=0.0;g[b+92>>2]=0.0;return}E=1.0/x;x=E*M;g[p>>2]=x;M=E*w;g[j>>2]=M;w=F*M-P*x;E=M*N-x*J;D=t+(s+w*w*u)+E*E*v;if(D!=0.0){S=1.0/D}else{S=0.0}g[b+160>>2]=S;if((a[d+20|0]&1)<<24>>24==0){g[b+92>>2]=0.0;T=C;U=I;V=G;W=H;X=A;Y=B}else{j=b+92|0;S=+g[d+8>>2]*+g[j>>2];g[j>>2]=S;D=x*S;x=S*M;T=C-u*(x*F-D*P);U=I+v*(x*N-D*J);V=G+D*t;W=H+x*t;X=A-D*s;Y=B-x*s}j=(c[m>>2]|0)+(f*12&-1)|0;f=(g[k>>2]=X,c[k>>2]|0);d=(g[k>>2]=Y,c[k>>2]|0)|0;c[j>>2]=0|f;c[j+4>>2]=d;g[(c[m>>2]|0)+((c[h>>2]|0)*12&-1)+8>>2]=T;h=(c[m>>2]|0)+((c[l>>2]|0)*12&-1)|0;d=(g[k>>2]=V,c[k>>2]|0);j=(g[k>>2]=W,c[k>>2]|0)|0;c[h>>2]=0|d;c[h+4>>2]=j;g[(c[m>>2]|0)+((c[l>>2]|0)*12&-1)+8>>2]=U;return}function fq(a,b){a=a|0;b=+b;return+0.0}function fr(a){a=a|0;return}function fs(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+68>>2];h=+g[d+20>>2];i=+g[b+72>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function ft(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fu(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+92>>2]*c;c=d*+g[b+108>>2];g[a>>2]=+g[b+104>>2]*d;g[a+4>>2]=c;return}function fv(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0;d=a+116|0;e=c[d>>2]|0;f=b+28|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];i=a+120|0;h=c[i>>2]|0;n=b+(h*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(h*12&-1)+8>>2];s=+g[a+156>>2];t=+g[a+160>>2];u=+g[a+164>>2];v=+g[a+168>>2];if(+g[a+68>>2]>0.0){h=a+112|0;w=+g[h>>2];x=(r-m+ +g[a+76>>2]+ +g[a+100>>2]*w)*(-0.0- +g[a+204>>2]);g[h>>2]=w+x;w=m-u*x;y=r+v*x;x=+g[a+136>>2];z=+g[a+132>>2];A=+g[a+128>>2];B=+g[a+124>>2];C=p+x*(-0.0-y)-j-A*(-0.0-w);D=q+z*y-l-B*w;E=+g[a+184>>2]*D+ +g[a+172>>2]*C;F=+g[a+188>>2]*D+ +g[a+176>>2]*C;C=-0.0-E;D=-0.0-F;h=a+104|0;g[h>>2]=+g[h>>2]-E;h=a+108|0;g[h>>2]=+g[h>>2]-F;G=w-u*(B*D-A*C);H=y+v*(z*D-x*C);I=C;J=D}else{D=+g[a+136>>2];C=+g[a+132>>2];x=+g[a+128>>2];z=+g[a+124>>2];y=p+D*(-0.0-r)-j-x*(-0.0-m);A=q+r*C-l-m*z;B=r-m;w=y*+g[a+172>>2]+A*+g[a+184>>2]+B*+g[a+196>>2];F=y*+g[a+176>>2]+A*+g[a+188>>2]+B*+g[a+200>>2];E=y*+g[a+180>>2]+A*+g[a+192>>2]+B*+g[a+204>>2];B=-0.0-w;A=-0.0-F;h=a+104|0;g[h>>2]=+g[h>>2]-w;h=a+108|0;g[h>>2]=+g[h>>2]-F;h=a+112|0;g[h>>2]=+g[h>>2]-E;G=m-u*(z*A-x*B-E);H=r+v*(C*A-D*B-E);I=B;J=A}h=(c[f>>2]|0)+(e*12&-1)|0;e=(g[k>>2]=j-s*I,c[k>>2]|0);a=(g[k>>2]=l-s*J,c[k>>2]|0)|0;c[h>>2]=0|e;c[h+4>>2]=a;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=G;d=(c[f>>2]|0)+((c[i>>2]|0)*12&-1)|0;a=(g[k>>2]=p+t*I,c[k>>2]|0);h=(g[k>>2]=q+t*J,c[k>>2]|0)|0;c[d>>2]=0|a;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=H;return}function fw(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0;d=a+96|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];e=a+100|0;i=c[e>>2]|0;n=b+(i*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(i*12&-1)+8>>2];s=+R(+m);t=+Q(+m);u=+R(+r);v=+Q(+r);w=+g[a+68>>2]- +g[a+128>>2];x=+g[a+72>>2]- +g[a+132>>2];y=t*w-s*x;z=s*w+t*x;x=+g[a+76>>2]- +g[a+136>>2];t=+g[a+80>>2]- +g[a+140>>2];w=v*x-u*t;s=u*x+v*t;t=p+w-j-y;v=q+s-l-z;x=+O(+(t*t+v*v));if(x<1.1920928955078125e-7){A=0.0;B=t;C=v}else{u=1.0/x;A=x;B=t*u;C=v*u}i=a+84|0;u=A- +g[i>>2];v=u<.20000000298023224?u:.20000000298023224;u=(v<0.0?0.0:v)*(-0.0- +g[a+160>>2]);v=B*u;B=C*u;u=+g[a+144>>2];C=m- +g[a+152>>2]*(y*B-z*v);z=+g[a+148>>2];y=r+ +g[a+156>>2]*(w*B-s*v);a=(g[k>>2]=j-u*v,c[k>>2]|0);b=(g[k>>2]=l-u*B,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=b;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=C;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;b=(g[k>>2]=p+z*v,c[k>>2]|0);h=(g[k>>2]=q+z*B,c[k>>2]|0)|0;c[d>>2]=0|b;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=y;return A- +g[i>>2]<.004999999888241291|0}function fx(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;cB(5247504,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5251944,(t=i,i=i+4|0,c[t>>2]=e,t)|0);cB(5249608,(t=i,i=i+4|0,c[t>>2]=f,t)|0);cB(5247800,(t=i,i=i+4|0,c[t>>2]=a[b+61|0]&1,t)|0);j=+g[b+72>>2];cB(5247116,(t=i,i=i+16|0,h[k>>3]=+g[b+68>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);j=+g[b+80>>2];cB(5246692,(t=i,i=i+16|0,h[k>>3]=+g[b+76>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);cB(5246284,(t=i,i=i+8|0,h[k>>3]=+g[b+84>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5252424,(t=i,i=i+4|0,c[t>>2]=c[b+56>>2]|0,t)|0);i=d;return}function fy(a){a=a|0;pl(a);return}function fz(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+116|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+120|0;c[l>>2]=j;m=e+28|0;n=b+140|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+148|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+156>>2]=s;t=+g[i+120>>2];g[b+160>>2]=t;u=+g[e+128>>2];g[b+164>>2]=u;v=+g[i+128>>2];g[b+168>>2]=v;i=c[d+24>>2]|0;w=+g[i+(f*12&-1)+8>>2];e=d+28|0;m=c[e>>2]|0;n=m+(f*12&-1)|0;x=c[n+4>>2]|0;y=(c[k>>2]=c[n>>2]|0,+g[k>>2]);z=(c[k>>2]=x,+g[k>>2]);A=+g[m+(f*12&-1)+8>>2];B=+g[i+(j*12&-1)+8>>2];i=m+(j*12&-1)|0;x=c[i+4>>2]|0;C=(c[k>>2]=c[i>>2]|0,+g[k>>2]);D=(c[k>>2]=x,+g[k>>2]);E=+g[m+(j*12&-1)+8>>2];F=+R(+w);G=+Q(+w);H=+R(+B);I=+Q(+B);J=+g[b+80>>2];K=J-(c[k>>2]=o,+g[k>>2]);J=+g[b+84>>2];L=J-(c[k>>2]=p,+g[k>>2]);J=G*K-F*L;M=F*K+G*L;p=b+124|0;o=(g[k>>2]=J,c[k>>2]|0);j=(g[k>>2]=M,c[k>>2]|0)|0;c[p>>2]=0|o;c[p+4>>2]=j;L=+g[b+88>>2];G=L-(c[k>>2]=q,+g[k>>2]);L=+g[b+92>>2];K=L-(c[k>>2]=r,+g[k>>2]);L=I*G-H*K;F=H*G+I*K;r=b+132|0;q=(g[k>>2]=L,c[k>>2]|0);j=(g[k>>2]=F,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=j;K=s+t;I=K+u*M*M+v*F*F;G=-0.0-M;H=u*J*G-v*F*L;N=u*G-v*F;G=K+u*J*J+v*L*L;K=u*J+v*L;O=u+v;P=+g[b+68>>2];j=b+172|0;if(P>0.0){S=I*G-H*H;if(S!=0.0){T=1.0/S}else{T=S}g[j>>2]=G*T;S=H*(-0.0-T);g[b+184>>2]=S;g[b+180>>2]=0.0;g[b+176>>2]=S;g[b+188>>2]=I*T;r=b+192|0;c[r>>2]=0;c[r+4>>2]=0;c[r+8>>2]=0;c[r+12>>2]=0;if(O>0.0){U=1.0/O}else{U=0.0}T=B-w- +g[b+96>>2];w=P*6.2831854820251465;P=w*U*w;B=+g[d>>2];S=B*(w*U*2.0*+g[b+72>>2]+B*P);r=b+100|0;g[r>>2]=S;if(S!=0.0){V=1.0/S}else{V=0.0}g[r>>2]=V;g[b+76>>2]=T*B*P*V;P=O+V;if(P!=0.0){W=1.0/P}else{W=0.0}g[b+204>>2]=W}else{W=O*G-K*K;P=N*K-O*H;V=K*H-N*G;B=N*V+(I*W+H*P);if(B!=0.0){X=1.0/B}else{X=B}g[j>>2]=W*X;W=P*X;g[b+176>>2]=W;P=V*X;g[b+180>>2]=P;g[b+184>>2]=W;g[b+188>>2]=(O*I-N*N)*X;O=(N*H-I*K)*X;g[b+192>>2]=O;g[b+196>>2]=P;g[b+200>>2]=O;g[b+204>>2]=(I*G-H*H)*X;g[b+100>>2]=0.0;g[b+76>>2]=0.0}j=b+104|0;if((a[d+20|0]&1)<<24>>24==0){g[j>>2]=0.0;g[b+108>>2]=0.0;g[b+112>>2]=0.0;X=A;H=E;G=C;I=D;O=y;P=z;r=c[e>>2]|0;q=r+(f*12&-1)|0;p=q;o=(g[k>>2]=O,c[k>>2]|0);m=(g[k>>2]=P,c[k>>2]|0);x=m;i=0;n=0;Y=x;Z=o;_=0;$=n|Z;aa=Y|_;ab=p|0;c[ab>>2]=$;ac=p+4|0;c[ac>>2]=aa;ad=c[h>>2]|0;ae=c[e>>2]|0;af=ae+(ad*12&-1)+8|0;g[af>>2]=X;ag=c[l>>2]|0;ah=c[e>>2]|0;ai=ah+(ag*12&-1)|0;aj=ai;ak=(g[k>>2]=G,c[k>>2]|0);al=(g[k>>2]=I,c[k>>2]|0);am=al;an=0;ao=0;ap=am;aq=ak;ar=0;as=ao|aq;at=ap|ar;au=aj|0;c[au>>2]=as;av=aj+4|0;c[av>>2]=at;aw=c[l>>2]|0;ax=c[e>>2]|0;ay=ax+(aw*12&-1)+8|0;g[ay>>2]=H;return}else{K=+g[d+8>>2];d=j|0;N=K*+g[d>>2];g[d>>2]=N;d=b+108|0;W=K*+g[d>>2];g[d>>2]=W;d=b+112|0;V=K*+g[d>>2];g[d>>2]=V;X=A-u*(V+(W*J-N*M));H=E+v*(V+(W*L-N*F));G=C+t*N;I=D+t*W;O=y-s*N;P=z-s*W;r=c[e>>2]|0;q=r+(f*12&-1)|0;p=q;o=(g[k>>2]=O,c[k>>2]|0);m=(g[k>>2]=P,c[k>>2]|0);x=m;i=0;n=0;Y=x;Z=o;_=0;$=n|Z;aa=Y|_;ab=p|0;c[ab>>2]=$;ac=p+4|0;c[ac>>2]=aa;ad=c[h>>2]|0;ae=c[e>>2]|0;af=ae+(ad*12&-1)+8|0;g[af>>2]=X;ag=c[l>>2]|0;ah=c[e>>2]|0;ai=ah+(ag*12&-1)|0;aj=ai;ak=(g[k>>2]=G,c[k>>2]|0);al=(g[k>>2]=I,c[k>>2]|0);am=al;an=0;ao=0;ap=am;aq=ak;ar=0;as=ao|aq;at=ap|ar;au=aj|0;c[au>>2]=as;av=aj+4|0;c[av>>2]=at;aw=c[l>>2]|0;ax=c[e>>2]|0;ay=ax+(aw*12&-1)+8|0;g[ay>>2]=H;return}}function fA(a){a=a|0;return}function fB(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+80>>2];h=+g[d+20>>2];i=+g[b+84>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fC(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+88>>2];h=+g[d+20>>2];i=+g[b+92>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fD(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0;d=+g[b+108>>2]*c;g[a>>2]=+g[b+104>>2]*c;g[a+4>>2]=d;return}function fE(a,b){a=a|0;b=+b;return+(+g[a+112>>2]*b)}function fF(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,P=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0;d=a+116|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];e=a+120|0;i=c[e>>2]|0;n=b+(i*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(i*12&-1)+8>>2];s=+R(+m);t=+Q(+m);u=+R(+r);v=+Q(+r);w=+g[a+156>>2];x=+g[a+160>>2];y=+g[a+164>>2];z=+g[a+168>>2];A=+g[a+80>>2]- +g[a+140>>2];B=+g[a+84>>2]- +g[a+144>>2];C=t*A-s*B;D=s*A+t*B;B=+g[a+88>>2]- +g[a+148>>2];t=+g[a+92>>2]- +g[a+152>>2];A=v*B-u*t;s=u*B+v*t;t=w+x;v=t+y*D*D+z*s*s;B=-0.0-D;u=y*C*B-z*s*A;E=y*B-z*s;B=t+y*C*C+z*A*A;t=y*C+z*A;F=y+z;G=p+A-j-C;H=q+s-l-D;if(+g[a+68>>2]>0.0){I=+O(+(G*G+H*H));J=v*B-u*u;if(J!=0.0){K=1.0/J}else{K=J}J=-0.0-(B*G-u*H)*K;L=-0.0-(v*H-u*G)*K;M=C*L-D*J;N=0.0;P=I;S=A*L-s*J;T=J;U=L}else{L=r-m- +g[a+96>>2];J=+O(+(G*G+H*H));if(L>0.0){V=L}else{V=-0.0-L}I=F*B-t*t;K=t*E-F*u;W=t*u-E*B;X=E*W+(v*I+u*K);if(X!=0.0){Y=1.0/X}else{Y=X}X=t*G;Z=(E*(H*u-B*G)+(v*(B*L-t*H)+u*(X-u*L)))*Y;B=-0.0-(G*I+H*K+W*L)*Y;W=-0.0-(E*(X-E*H)+(v*(F*H-t*L)+u*(E*L-F*G)))*Y;M=C*W-D*B-Z;N=V;P=J;S=A*W-s*B-Z;T=B;U=W}a=(g[k>>2]=j-w*T,c[k>>2]|0);i=(g[k>>2]=l-w*U,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=i;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=m-y*M;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;i=(g[k>>2]=p+x*T,c[k>>2]|0);h=(g[k>>2]=q+x*U,c[k>>2]|0)|0;c[d>>2]=0|i;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=r+z*S;if(P>.004999999888241291){_=0;return _|0}_=N<=.03490658849477768;return _|0}function fG(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;cB(5247448,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5251944,(t=i,i=i+4|0,c[t>>2]=e,t)|0);cB(5249608,(t=i,i=i+4|0,c[t>>2]=f,t)|0);cB(5247800,(t=i,i=i+4|0,c[t>>2]=a[b+61|0]&1,t)|0);j=+g[b+84>>2];cB(5247116,(t=i,i=i+16|0,h[k>>3]=+g[b+80>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);j=+g[b+92>>2];cB(5246692,(t=i,i=i+16|0,h[k>>3]=+g[b+88>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);cB(5246252,(t=i,i=i+8|0,h[k>>3]=+g[b+96>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5253228,(t=i,i=i+8|0,h[k>>3]=+g[b+68>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5252956,(t=i,i=i+8|0,h[k>>3]=+g[b+72>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5252424,(t=i,i=i+4|0,c[t>>2]=c[b+56>>2]|0,t)|0);i=d;return}function fH(a){a=a|0;pl(a);return}function fI(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0;e=b|0;c[e>>2]=5259380;f=d+8|0;h=d+12|0;if((c[f>>2]|0)==(c[h>>2]|0)){aH(5248204,173,5256164,5249852)}c[b+4>>2]=c[d>>2]|0;c[b+8>>2]=0;c[b+12>>2]=0;c[b+48>>2]=c[f>>2]|0;c[b+52>>2]=c[h>>2]|0;c[b+56>>2]=0;a[b+61|0]=a[d+16|0]&1;a[b+60|0]=0;c[b+64>>2]=c[d+4>>2]|0;pr(b+16|0,0,32);c[e>>2]=5260008;e=d+20|0;h=b+76|0;f=c[e+4>>2]|0;c[h>>2]=c[e>>2]|0;c[h+4>>2]=f;f=d+28|0;h=b+84|0;e=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=e;e=d+36|0;h=b+92|0;f=c[e>>2]|0;i=c[e+4>>2]|0;c[h>>2]=f;c[h+4>>2]=i;h=b+100|0;c[h>>2]=0|(g[k>>2]=(c[k>>2]=i,+g[k>>2])*-1.0,c[k>>2]|0);c[h+4>>2]=f|0;g[b+204>>2]=0.0;g[b+108>>2]=0.0;g[b+208>>2]=0.0;g[b+112>>2]=0.0;g[b+212>>2]=0.0;g[b+116>>2]=0.0;g[b+120>>2]=+g[d+48>>2];g[b+124>>2]=+g[d+52>>2];a[b+128|0]=a[d+44|0]&1;g[b+68>>2]=+g[d+56>>2];g[b+72>>2]=+g[d+60>>2];g[b+216>>2]=0.0;g[b+220>>2]=0.0;d=b+172|0;c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;return}function fJ(b,d){b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0.0,L=0.0,M=0.0,N=0.0,O=0.0,P=0.0,S=0.0,T=0.0,U=0.0,V=0.0,W=0.0,X=0.0,Y=0.0,Z=0.0,_=0.0,$=0.0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aC=0;e=c[b+48>>2]|0;f=c[e+8>>2]|0;h=b+132|0;c[h>>2]=f;i=c[b+52>>2]|0;j=c[i+8>>2]|0;l=b+136|0;c[l>>2]=j;m=e+28|0;n=b+140|0;o=c[m>>2]|0;p=c[m+4>>2]|0;c[n>>2]=o;c[n+4>>2]=p;n=i+28|0;m=b+148|0;q=c[n>>2]|0;r=c[n+4>>2]|0;c[m>>2]=q;c[m+4>>2]=r;s=+g[e+120>>2];g[b+156>>2]=s;t=+g[i+120>>2];g[b+160>>2]=t;u=+g[e+128>>2];g[b+164>>2]=u;v=+g[i+128>>2];g[b+168>>2]=v;i=c[d+24>>2]|0;e=i+(f*12&-1)|0;m=c[e+4>>2]|0;w=(c[k>>2]=c[e>>2]|0,+g[k>>2]);x=(c[k>>2]=m,+g[k>>2]);y=+g[i+(f*12&-1)+8>>2];m=d+28|0;e=c[m>>2]|0;n=e+(f*12&-1)|0;z=c[n+4>>2]|0;A=(c[k>>2]=c[n>>2]|0,+g[k>>2]);B=(c[k>>2]=z,+g[k>>2]);C=+g[e+(f*12&-1)+8>>2];z=i+(j*12&-1)|0;n=c[z+4>>2]|0;D=(c[k>>2]=c[z>>2]|0,+g[k>>2]);E=(c[k>>2]=n,+g[k>>2]);F=+g[i+(j*12&-1)+8>>2];i=e+(j*12&-1)|0;n=c[i+4>>2]|0;G=(c[k>>2]=c[i>>2]|0,+g[k>>2]);H=(c[k>>2]=n,+g[k>>2]);I=+g[e+(j*12&-1)+8>>2];J=+R(+y);K=+Q(+y);y=+R(+F);L=+Q(+F);F=+g[b+76>>2];M=F-(c[k>>2]=o,+g[k>>2]);F=+g[b+80>>2];N=F-(c[k>>2]=p,+g[k>>2]);F=K*M-J*N;O=J*M+K*N;N=+g[b+84>>2];M=N-(c[k>>2]=q,+g[k>>2]);N=+g[b+88>>2];P=N-(c[k>>2]=r,+g[k>>2]);N=L*M-y*P;S=y*M+L*P;P=D+N-w-F;w=E+S-x-O;x=+g[b+100>>2];E=+g[b+104>>2];D=K*x-J*E;L=J*x+K*E;r=b+180|0;q=(g[k>>2]=D,c[k>>2]|0);p=(g[k>>2]=L,c[k>>2]|0)|0;c[r>>2]=0|q;c[r+4>>2]=p;E=F+P;F=O+w;O=L*E-D*F;g[b+196>>2]=O;x=N*L-S*D;g[b+200>>2]=x;M=s+t;y=M+O*u*O+x*v*x;if(y>0.0){T=1.0/y}else{T=y}g[b+204>>2]=T;p=b+212|0;g[p>>2]=0.0;r=b+216|0;g[r>>2]=0.0;q=b+220|0;g[q>>2]=0.0;T=+g[b+68>>2];do{if(T>0.0){y=+g[b+92>>2];U=+g[b+96>>2];V=K*y-J*U;W=J*y+K*U;o=b+172|0;j=(g[k>>2]=V,c[k>>2]|0);e=(g[k>>2]=W,c[k>>2]|0)|0;c[o>>2]=0|j;c[o+4>>2]=e;U=E*W-F*V;g[b+188>>2]=U;y=N*W-S*V;g[b+192>>2]=y;X=M+U*u*U+y*v*y;if(X<=0.0){break}y=1.0/X;g[p>>2]=y;U=T*6.2831854820251465;Y=U*y*U;Z=+g[d>>2];_=Z*(U*y*2.0*+g[b+72>>2]+Z*Y);if(_>0.0){$=1.0/_}else{$=_}g[q>>2]=$;g[r>>2]=(P*V+w*W)*Z*Y*$;Y=X+$;g[p>>2]=Y;if(Y<=0.0){break}g[p>>2]=1.0/Y}else{g[b+116>>2]=0.0}}while(0);do{if((a[b+128|0]&1)<<24>>24==0){g[b+208>>2]=0.0;g[b+112>>2]=0.0}else{$=v+u;p=b+208|0;g[p>>2]=$;if($<=0.0){break}g[p>>2]=1.0/$}}while(0);if((a[d+20|0]&1)<<24>>24==0){g[b+108>>2]=0.0;g[b+116>>2]=0.0;g[b+112>>2]=0.0;$=C;w=I;P=G;T=H;M=A;S=B;p=c[m>>2]|0;r=p+(f*12&-1)|0;q=r;e=(g[k>>2]=M,c[k>>2]|0);o=(g[k>>2]=S,c[k>>2]|0);j=o;n=0;i=0;z=j;aa=e;ab=0;ac=i|aa;ad=z|ab;ae=q|0;c[ae>>2]=ac;af=q+4|0;c[af>>2]=ad;ag=c[h>>2]|0;ah=c[m>>2]|0;ai=ah+(ag*12&-1)+8|0;g[ai>>2]=$;aj=c[l>>2]|0;ak=c[m>>2]|0;al=ak+(aj*12&-1)|0;am=al;an=(g[k>>2]=P,c[k>>2]|0);ao=(g[k>>2]=T,c[k>>2]|0);ap=ao;aq=0;ar=0;as=ap;at=an;au=0;av=ar|at;aw=as|au;ax=am|0;c[ax>>2]=av;ay=am+4|0;c[ay>>2]=aw;az=c[l>>2]|0;aA=c[m>>2]|0;aB=aA+(az*12&-1)+8|0;g[aB>>2]=w;return}else{aC=d+8|0;d=b+108|0;N=+g[aC>>2]*+g[d>>2];g[d>>2]=N;d=b+116|0;F=+g[aC>>2]*+g[d>>2];g[d>>2]=F;d=b+112|0;E=+g[aC>>2]*+g[d>>2];g[d>>2]=E;K=N*D+F*+g[b+172>>2];D=N*L+F*+g[b+176>>2];$=C-(E+(N*O+F*+g[b+188>>2]))*u;w=I+(E+(N*x+F*+g[b+192>>2]))*v;P=G+K*t;T=H+D*t;M=A-K*s;S=B-D*s;p=c[m>>2]|0;r=p+(f*12&-1)|0;q=r;e=(g[k>>2]=M,c[k>>2]|0);o=(g[k>>2]=S,c[k>>2]|0);j=o;n=0;i=0;z=j;aa=e;ab=0;ac=i|aa;ad=z|ab;ae=q|0;c[ae>>2]=ac;af=q+4|0;c[af>>2]=ad;ag=c[h>>2]|0;ah=c[m>>2]|0;ai=ah+(ag*12&-1)+8|0;g[ai>>2]=$;aj=c[l>>2]|0;ak=c[m>>2]|0;al=ak+(aj*12&-1)|0;am=al;an=(g[k>>2]=P,c[k>>2]|0);ao=(g[k>>2]=T,c[k>>2]|0);ap=ao;aq=0;ar=0;as=ap;at=an;au=0;av=ar|at;aw=as|au;ax=am|0;c[ax>>2]=av;ay=am+4|0;c[ay>>2]=aw;az=c[l>>2]|0;aA=c[m>>2]|0;aB=aA+(az*12&-1)+8|0;g[aB>>2]=w;return}}function fK(a){a=a|0;return}function fL(a,b){a=a|0;b=b|0;var d=0.0,e=0.0,f=0.0,h=0.0,i=0,j=0,l=0,m=0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0,t=0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0;d=+g[a+156>>2];e=+g[a+160>>2];f=+g[a+164>>2];h=+g[a+168>>2];i=a+132|0;j=c[i>>2]|0;l=b+28|0;m=c[l>>2]|0;n=m+(j*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[m+(j*12&-1)+8>>2];o=a+136|0;n=c[o>>2]|0;s=m+(n*12&-1)|0;t=c[s+4>>2]|0;u=(c[k>>2]=c[s>>2]|0,+g[k>>2]);v=(c[k>>2]=t,+g[k>>2]);w=+g[m+(n*12&-1)+8>>2];x=+g[a+172>>2];y=+g[a+176>>2];z=+g[a+192>>2];A=+g[a+188>>2];n=a+116|0;B=+g[n>>2];C=(+g[a+216>>2]+(w*z+(x*(u-p)+y*(v-q))-r*A)+ +g[a+220>>2]*B)*(-0.0- +g[a+212>>2]);g[n>>2]=B+C;B=x*C;x=y*C;y=p-d*B;p=q-d*x;q=r-f*C*A;A=u+e*B;B=v+e*x;x=w+h*C*z;n=a+112|0;z=+g[n>>2];C=+g[b>>2]*+g[a+120>>2];w=z+(x-q- +g[a+124>>2])*(-0.0- +g[a+208>>2]);v=-0.0-C;u=w<C?w:C;C=u<v?v:u;g[n>>2]=C;u=C-z;z=q-f*u;q=x+h*u;u=+g[a+180>>2];x=+g[a+184>>2];C=+g[a+200>>2];v=+g[a+196>>2];w=((A-y)*u+(B-p)*x+C*q-v*z)*(-0.0- +g[a+204>>2]);n=a+108|0;g[n>>2]=+g[n>>2]+w;r=u*w;u=x*w;n=(c[l>>2]|0)+(j*12&-1)|0;j=(g[k>>2]=y-d*r,c[k>>2]|0);a=(g[k>>2]=p-d*u,c[k>>2]|0)|0;c[n>>2]=0|j;c[n+4>>2]=a;g[(c[l>>2]|0)+((c[i>>2]|0)*12&-1)+8>>2]=z-f*v*w;i=(c[l>>2]|0)+((c[o>>2]|0)*12&-1)|0;a=(g[k>>2]=A+e*r,c[k>>2]|0);n=(g[k>>2]=B+e*u,c[k>>2]|0)|0;c[i>>2]=0|a;c[i+4>>2]=n;g[(c[l>>2]|0)+((c[o>>2]|0)*12&-1)+8>>2]=q+h*C*w;return}function fM(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+48>>2]|0;e=+g[d+24>>2];f=+g[b+76>>2];h=+g[d+20>>2];i=+g[b+80>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fN(a,b){a=a|0;b=b|0;var d=0,e=0.0,f=0.0,h=0.0,i=0.0,j=0.0;d=c[b+52>>2]|0;e=+g[d+24>>2];f=+g[b+84>>2];h=+g[d+20>>2];i=+g[b+88>>2];j=f*h+e*i+ +g[d+16>>2];g[a>>2]=+g[d+12>>2]+(e*f-h*i);g[a+4>>2]=j;return}function fO(a,b,c){a=a|0;b=b|0;c=+c;var d=0.0,e=0.0,f=0.0;d=+g[b+108>>2];e=+g[b+116>>2];f=(d*+g[b+184>>2]+e*+g[b+176>>2])*c;g[a>>2]=(d*+g[b+180>>2]+e*+g[b+172>>2])*c;g[a+4>>2]=f;return}function fP(a,b){a=a|0;b=+b;return+(+g[a+112>>2]*b)}function fQ(a){a=a|0;return c[a+68>>2]|0}function fR(a){a=a|0;return c[a+64>>2]|0}function fS(a,b){a=a|0;b=b|0;c[a+68>>2]=b;return}function fT(a,b){a=a|0;b=b|0;c[a+76>>2]=b;return}function fU(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function fV(a,b){a=a|0;b=b|0;c[a+60>>2]=b;return}function fW(a){a=a|0;return c[a+72>>2]|0}function fX(a,b){a=a|0;b=b|0;c[a+72>>2]=b;return}function fY(a){a=a|0;return a|0}function fZ(a){a=a|0;return c[a+60>>2]|0}function f_(a){a=a|0;return c[a+76>>2]|0}function f$(a){a=a|0;return+(+g[a+20>>2])}function f0(a,b){a=a|0;b=+b;g[a+16>>2]=b;return}function f1(a){a=a|0;return c[a+12>>2]|0}function f2(a,b){a=a|0;b=+b;g[a+20>>2]=b;return}function f3(a){a=a|0;return c[a+8>>2]|0}function f4(a){a=a|0;return c[a+4>>2]|0}function f5(a){a=a|0;return+(+g[a+16>>2])}function f6(a){a=a|0;return c[a+40>>2]|0}function f7(a,b){a=a|0;b=+b;g[a>>2]=b;return}function f8(d,e){d=d|0;e=e|0;var f=0,h=0,i=0;f=d+38|0;if((e&1|0)==(a[f]&1|0)){return}h=c[d+8>>2]|0;d=h+4|0;i=b[d>>1]|0;if((i&2)<<16>>16==0){b[d>>1]=i|2;g[h+144>>2]=0.0}a[f]=e&1;return}function f9(a,b){a=a|0;b=b|0;return(c[a+24>>2]|0)+(b*28&-1)|0}function ga(a,b){a=a|0;b=b|0;c[a+40>>2]=b;return}function gb(a){a=a|0;return a+32|0}function gc(b){b=b|0;return(a[b+38|0]&1)<<24>>24!=0|0}function gd(a){a=a|0;return c[(c[a+12>>2]|0)+4>>2]|0}function ge(a){a=a|0;return+(+g[a>>2])}function gf(a){a=a|0;var b=0,d=0.0,e=0,f=0.0,h=0.0,i=0.0,j=0,k=0.0;b=c[a>>2]|0;if((b|0)==-1){d=0.0;return+d}e=c[a+4>>2]|0;f=(+g[e+(b*36&-1)+8>>2]- +g[e+(b*36&-1)>>2]+(+g[e+(b*36&-1)+12>>2]- +g[e+(b*36&-1)+4>>2]))*2.0;b=c[a+12>>2]|0;L361:do{if((b|0)>0){h=0.0;a=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<0){i=h}else{i=h+(+g[e+(a*36&-1)+8>>2]- +g[e+(a*36&-1)>>2]+(+g[e+(a*36&-1)+12>>2]- +g[e+(a*36&-1)+4>>2]))*2.0}j=a+1|0;if((j|0)==(b|0)){k=i;break L361}else{h=i;a=j}}}else{k=0.0}}while(0);d=k/f;return+d}function gg(a){a=a|0;var b=0,d=0;b=c[a>>2]|0;if((b|0)==-1){d=0;return d|0}d=c[(c[a+4>>2]|0)+(b*36&-1)+32>>2]|0;return d|0}function gh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0,p=0.0,q=0.0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0.0,y=0.0,z=0.0,A=0.0,B=0.0,C=0.0,D=0.0,E=0.0,F=0.0,G=0.0,H=0.0,I=0.0,J=0.0,K=0;d=a+132|0;e=c[d>>2]|0;f=b+24|0;b=c[f>>2]|0;h=b+(e*12&-1)|0;i=c[h+4>>2]|0;j=(c[k>>2]=c[h>>2]|0,+g[k>>2]);l=(c[k>>2]=i,+g[k>>2]);m=+g[b+(e*12&-1)+8>>2];e=a+136|0;i=c[e>>2]|0;n=b+(i*12&-1)|0;o=c[n+4>>2]|0;p=(c[k>>2]=c[n>>2]|0,+g[k>>2]);q=(c[k>>2]=o,+g[k>>2]);r=+g[b+(i*12&-1)+8>>2];s=+R(+m);t=+Q(+m);u=+R(+r);v=+Q(+r);w=+g[a+76>>2]- +g[a+140>>2];x=+g[a+80>>2]- +g[a+144>>2];y=t*w-s*x;z=s*w+t*x;x=+g[a+84>>2]- +g[a+148>>2];w=+g[a+88>>2]- +g[a+152>>2];A=v*x-u*w;B=u*x+v*w;w=p-j+A-y;v=q-l+B-z;x=+g[a+100>>2];u=+g[a+104>>2];C=t*x-s*u;D=s*x+t*u;u=C*w+D*v;t=+g[a+156>>2];x=+g[a+160>>2];s=+g[a+164>>2];E=+g[a+196>>2];F=+g[a+168>>2];G=+g[a+200>>2];H=t+x+E*s*E+G*F*G;if(H!=0.0){I=(-0.0-u)/H}else{I=0.0}H=C*I;G=D*I;a=(g[k>>2]=j-H*t,c[k>>2]|0);i=(g[k>>2]=l-G*t,c[k>>2]|0)|0;c[h>>2]=0|a;c[h+4>>2]=i;g[(c[f>>2]|0)+((c[d>>2]|0)*12&-1)+8>>2]=m-(D*(y+w)-C*(z+v))*I*s;d=(c[f>>2]|0)+((c[e>>2]|0)*12&-1)|0;i=(g[k>>2]=p+H*x,c[k>>2]|0);h=(g[k>>2]=q+G*x,c[k>>2]|0)|0;c[d>>2]=0|i;c[d+4>>2]=h;g[(c[f>>2]|0)+((c[e>>2]|0)*12&-1)+8>>2]=r+(A*D-B*C)*I*F;if(u>0.0){J=u;K=J<=.004999999888241291;return K|0}J=-0.0-u;K=J<=.004999999888241291;return K|0}function gi(b){b=b|0;var d=0,e=0,f=0,j=0.0;d=i;e=c[(c[b+48>>2]|0)+8>>2]|0;f=c[(c[b+52>>2]|0)+8>>2]|0;cB(5247396,(t=i,i=i+1|0,i=i+3>>2<<2,c[t>>2]=0,t)|0);cB(5251944,(t=i,i=i+4|0,c[t>>2]=e,t)|0);cB(5249608,(t=i,i=i+4|0,c[t>>2]=f,t)|0);cB(5247800,(t=i,i=i+4|0,c[t>>2]=a[b+61|0]&1,t)|0);j=+g[b+80>>2];cB(5247116,(t=i,i=i+16|0,h[k>>3]=+g[b+76>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);j=+g[b+88>>2];cB(5246692,(t=i,i=i+16|0,h[k>>3]=+g[b+84>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);j=+g[b+96>>2];cB(5246212,(t=i,i=i+16|0,h[k>>3]=+g[b+92>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,h[k>>3]=j,c[t+8>>2]=c[k>>2]|0,c[t+12>>2]=c[k+4>>2]|0,t)|0);cB(5245952,(t=i,i=i+4|0,c[t>>2]=a[b+128|0]&1,t)|0);cB(5245704,(t=i,i=i+8|0,h[k>>3]=+g[b+124>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5245456,(t=i,i=i+8|0,h[k>>3]=+g[b+120>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5253228,(t=i,i=i+8|0,h[k>>3]=+g[b+68>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5252956,(t=i,i=i+8|0,h[k>>3]=+g[b+72>>2],c[t>>2]=c[k>>2]|0,c[t+4>>2]=c[k+4>>2]|0,t)|0);cB(5252424,(t=i,i=i+4|0,c[t>>2]=c[b+56>>2]|0,t)|0);i=d;return}function gj(a){a=a|0;pl(a);return}function gk(){var a=0;a=pp(80)|0;by(a);c[a+60>>2]=0;c[a+64>>2]=0;c[a+68>>2]=5245424;c[a+72>>2]=5245420;c[a+76>>2]=0;return a|0}function gl(a,b,c){a=a|0;b=b|0;c=c|0;cS(a,b,c);return}function gm(a){a=a|0;cQ(a);return}function gn(a){a=a|0;cR(a|0,a);return}function go(a){a=a|0;if((a|0)==0){return}pj(c[a+32>>2]|0);pj(c[a+44>>2]|0);pj(c[a+4>>2]|0);pl(a);return}function gp(a,b){a=a|0;b=b|0;cO(a,b);return}function gq(a,b){a=a|0;b=b|0;pq(a,b,60);return}function gr(a,c){a=a|0;c=c|0;var d=0,e=0;d=a+32|0;e=c;b[d>>1]=b[e>>1]|0;b[d+2>>1]=b[e+2>>1]|0;b[d+4>>1]=b[e+4>>1]|0;c2(a);return}function gs(){var a=0;a=pp(44)|0;b[a+32>>1]=1;b[a+34>>1]=-1;b[a+36>>1]=0;c[a+40>>2]=0;c[a+24>>2]=0;c[a+28>>2]=0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;return a|0}function gt(a,b){a=a|0;b=b|0;var d=0;d=c[a+12>>2]|0;bi[c[(c[d>>2]|0)+28>>2]&2047](d,b,+g[a>>2]);return}function gu(a,b){a=a|0;b=b|0;var d=0;d=c[a+12>>2]|0;return a0[c[(c[d>>2]|0)+16>>2]&2047](d,(c[a+8>>2]|0)+12|0,b)|0}function gv(a){a=a|0;if((a|0)==0){return}pl(a);return}function gw(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;f=c[a+12>>2]|0;return a$[c[(c[f>>2]|0)+20>>2]&2047](f,b,d,(c[a+8>>2]|0)+12|0,e)|0}function gx(a){a=a|0;c2(a);return}function gy(a,b){a=a|0;b=b|0;c3(a,b);return}function gz(a,b){a=a|0;b=b|0;var d=0;do{if((b|0)>-1){if((c[a+12>>2]|0)>(b|0)){break}else{d=340;break}}else{d=340}}while(0);if((d|0)==340){aH(5251020,159,5254912,5250596)}return(c[a+4>>2]|0)+(b*36&-1)|0}function gA(a,b){a=a|0;b=b|0;var d=0;do{if((b|0)>-1){if((c[a+12>>2]|0)>(b|0)){break}else{d=344;break}}else{d=344}}while(0);if((d|0)==344){aH(5251020,153,5254864,5250596)}return c[(c[a+4>>2]|0)+(b*36&-1)+16>>2]|0}function gB(a){a=a|0;if((a|0)==0){return}pj(c[a+32>>2]|0);pj(c[a+44>>2]|0);pj(c[a+4>>2]|0);pl(a);return}function gC(){var a=0;a=pp(60)|0;by(a);return a|0}function gD(a){a=a|0;return 1}function gE(a,b){a=a|0;b=b|0;return 0}function gF(a){a=a|0;return c[a+28>>2]|0}function gG(b,c){b=b|0;c=c|0;a[b+102994|0]=c&1;return}function gH(a){a=a|0;var b=0,d=0.0,e=0,f=0.0,h=0.0,i=0.0,j=0,k=0.0;b=c[a+102872>>2]|0;if((b|0)==-1){d=0.0;return+d}e=c[a+102876>>2]|0;f=(+g[e+(b*36&-1)+8>>2]- +g[e+(b*36&-1)>>2]+(+g[e+(b*36&-1)+12>>2]- +g[e+(b*36&-1)+4>>2]))*2.0;b=c[a+102884>>2]|0;L433:do{if((b|0)>0){h=0.0;a=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<0){i=h}else{i=h+(+g[e+(a*36&-1)+8>>2]- +g[e+(a*36&-1)>>2]+(+g[e+(a*36&-1)+12>>2]- +g[e+(a*36&-1)+4>>2]))*2.0}j=a+1|0;if((j|0)==(b|0)){k=i;break L433}else{h=i;a=j}}}else{k=0.0}}while(0);d=k/f;return+d}function gI(a){a=a|0;var b=0,d=0;b=c[a+102872>>2]|0;if((b|0)==-1){d=0;return d|0}d=c[(c[a+102876>>2]|0)+(b*36&-1)+32>>2]|0;return d|0}function gJ(a){a=a|0;return a+102996|0}function gK(b){b=b|0;return(a[b+102994|0]&1)<<24>>24!=0|0}function gL(a){a=a|0;return a+102872|0}function gM(a,b){a=a|0;b=b|0;c[a+102944>>2]=b;return}function gN(b,c){b=b|0;c=c|0;a[b+102993|0]=c&1;return}function gO(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+102968|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function gP(a){a=a|0;return c[a+102960>>2]|0}function gQ(a){a=a|0;return(c[a+102868>>2]&4|0)!=0|0}function gR(b){b=b|0;return(a[b+102993|0]&1)<<24>>24!=0|0}function gS(a){a=a|0;return c[a+102956>>2]|0}function gT(a){a=a|0;return c[a+102952>>2]|0}function gU(a,b){a=a|0;b=b|0;c[a+102980>>2]=b;return}function gV(a){a=a|0;return c[a+102964>>2]|0}function gW(a){a=a|0;var b=0,d=0;b=c[a+102952>>2]|0;if((b|0)==0){return}else{d=b}while(1){g[d+76>>2]=0.0;g[d+80>>2]=0.0;g[d+84>>2]=0.0;b=c[d+96>>2]|0;if((b|0)==0){break}else{d=b}}return}function gX(b){b=b|0;return(a[b+102992|0]&1)<<24>>24!=0|0}function gY(d,e){d=d|0;e=e|0;var f=0,h=0;f=d+102976|0;if((e&1|0)==(a[f]&1|0)){return}a[f]=e&1;if(e){return}e=c[d+102952>>2]|0;if((e|0)==0){return}else{h=e}while(1){e=h+4|0;d=b[e>>1]|0;if((d&2)<<16>>16==0){b[e>>1]=d|2;g[h+144>>2]=0.0}d=c[h+96>>2]|0;if((d|0)==0){break}else{h=d}}return}function gZ(b){b=b|0;return(a[b+102976|0]&1)<<24>>24!=0|0}function g_(a){a=a|0;return c[a+102900>>2]|0}function g$(a){a=a|0;return(c[a+102868>>2]&2|0)!=0|0}function g0(a){a=a|0;return c[a+102932>>2]|0}function g1(a,b){a=a|0;b=b|0;c[a+102984>>2]=b;return}function g2(a,b){a=a|0;b=b|0;var d=0;d=a+102868|0;a=c[d>>2]|0;c[d>>2]=b?a|4:a&-5;return}function g3(a){a=a|0;return c[a+102936>>2]|0}function g4(b,c){b=b|0;c=c|0;a[b+102992|0]=c&1;return}function g5(a,b){a=a|0;b=b|0;c[a+102940>>2]=b;return}function g6(a){a=a|0;return c[a+4>>2]|0}function g7(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function g8(a){a=a|0;return+(+g[a+8>>2])}function g9(a,b){a=a|0;b=b|0;return a+12|0}function ha(a,b){a=a|0;b=b|0;return a+12|0}function hb(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+12|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function hc(a){a=a|0;return a+12|0}function hd(a,b){a=a|0;b=b|0;var d=0;d=a+4|0;c[d>>2]=c[d>>2]|b;return}function he(a,b){a=a|0;b=b|0;var d=0;d=a+4|0;c[d>>2]=c[d>>2]&(b^-1);return}function hf(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function hg(a){a=a|0;return c[a+4>>2]|0}function hh(a){a=a|0;return c[a+12>>2]|0}function hi(a){a=a|0;return c[a+48>>2]|0}function hj(a){a=a|0;return c[a+52>>2]|0}function hk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;b=a+12|0;d=c[b>>2]|0;if((d|0)<=0){e=0;return e|0}f=a+4|0;a=0;g=0;h=c[f>>2]|0;i=d;while(1){if((c[h+(a*36&-1)+32>>2]|0)<2){j=g;k=h;l=i}else{d=h+(a*36&-1)+24|0;m=c[d>>2]|0;if((m|0)==-1){aH(5251996,686,5254772,5248288);n=c[d>>2]|0;o=c[f>>2]|0;p=c[b>>2]|0}else{n=m;o=h;p=i}m=(c[o+((c[h+(a*36&-1)+28>>2]|0)*36&-1)+32>>2]|0)-(c[o+(n*36&-1)+32>>2]|0)|0;d=(m|0)>0?m:-m|0;j=(g|0)>(d|0)?g:d;k=o;l=p}d=a+1|0;if((d|0)<(l|0)){a=d;g=j;h=k;i=l}else{e=j;break}}return e|0}function hl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0;do{if((b|0)>-1){if((c[a+12>>2]|0)>(b|0)){break}else{e=435;break}}else{e=435}}while(0);if((e|0)==435){aH(5251020,159,5254912,5250596)}f=a+4|0;h=c[f>>2]|0;do{if((d|0)>-1){if((c[a+12>>2]|0)>(d|0)){i=h;break}else{e=438;break}}else{e=438}}while(0);if((e|0)==438){aH(5251020,159,5254912,5250596);i=c[f>>2]|0}return(+g[i+(d*36&-1)>>2]- +g[h+(b*36&-1)+8>>2]>0.0|+g[i+(d*36&-1)+4>>2]- +g[h+(b*36&-1)+12>>2]>0.0|+g[h+(b*36&-1)>>2]- +g[i+(d*36&-1)+8>>2]>0.0|+g[h+(b*36&-1)+4>>2]- +g[i+(d*36&-1)+12>>2]>0.0)^1|0}function hm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0;d=a+40|0;e=c[d>>2]|0;f=a+36|0;g=a+32|0;if((e|0)==(c[f>>2]|0)){a=c[g>>2]|0;c[f>>2]=e<<1;f=pi(e<<3)|0;c[g>>2]=f;h=a;pq(f,h,c[d>>2]<<2);pj(h);i=c[d>>2]|0}else{i=e}c[(c[g>>2]|0)+(i<<2)>>2]=b;c[d>>2]=(c[d>>2]|0)+1|0;return}function hn(a,b,c){a=a|0;b=b|0;c=c|0;return bz(a,b,c)|0}function ho(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;if(!(bR(a|0,b,d,e)|0)){return}e=a+40|0;d=c[e>>2]|0;f=a+36|0;g=a+32|0;if((d|0)==(c[f>>2]|0)){a=c[g>>2]|0;c[f>>2]=d<<1;f=pi(d<<3)|0;c[g>>2]=f;h=a;pq(f,h,c[e>>2]<<2);pj(h);i=c[e>>2]|0}else{i=d}c[(c[g>>2]|0)+(i<<2)>>2]=b;c[e>>2]=(c[e>>2]|0)+1|0;return}function hp(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=c[a+40>>2]|0;e=a+32|0;f=0;while(1){if((f|0)>=(d|0)){break}g=(c[e>>2]|0)+(f<<2)|0;if((c[g>>2]|0)==(b|0)){h=454;break}else{f=f+1|0}}if((h|0)==454){c[g>>2]=-1}g=a+28|0;c[g>>2]=(c[g>>2]|0)-1|0;bP(a|0,b);return}function hq(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;g=a+102872|0;c[f>>2]=g;c[f+4>>2]=b;dp(g|0,f,d);i=e;return}function hr(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;b=a+102884|0;d=c[b>>2]|0;if((d|0)<=0){e=0;return e|0}f=a+102876|0;a=0;g=0;h=c[f>>2]|0;i=d;while(1){if((c[h+(a*36&-1)+32>>2]|0)<2){j=g;k=h;l=i}else{d=h+(a*36&-1)+24|0;m=c[d>>2]|0;if((m|0)==-1){aH(5251996,686,5254772,5248288);n=c[d>>2]|0;o=c[f>>2]|0;p=c[b>>2]|0}else{n=m;o=h;p=i}m=(c[o+((c[h+(a*36&-1)+28>>2]|0)*36&-1)+32>>2]|0)-(c[o+(n*36&-1)+32>>2]|0)|0;d=(m|0)>0?m:-m|0;j=(g|0)>(d|0)?g:d;k=o;l=p}d=a+1|0;if((d|0)<(l|0)){a=d;g=j;h=k;i=l}else{e=j;break}}return e|0}function hs(a){a=a|0;dh(a);return}function ht(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=a+102868|0;e=c[d>>2]|0;if((e&2|0)==0){f=e}else{aH(5251272,109,5256084,5252880);f=c[d>>2]|0}if((f&2|0)!=0){g=0;return g|0}f=cA(a|0,152)|0;if((f|0)==0){h=0}else{d=f;cD(d,b,a);h=d}c[h+92>>2]=0;d=a+102952|0;c[h+96>>2]=c[d>>2]|0;b=c[d>>2]|0;if((b|0)!=0){c[b+92>>2]=h}c[d>>2]=h;d=a+102960|0;c[d>>2]=(c[d>>2]|0)+1|0;g=h;return g|0}function hu(a,b){a=a|0;b=b|0;da(a,b);return}function hv(a){a=a|0;var b=0;b=pp(103028)|0;c6(b,a);return b|0}function hw(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;de(a,b,c,d);return}function hx(a,b){a=a|0;b=b|0;c7(a,b);return}function hy(a,b){a=a|0;b=b|0;return db(a,b)|0}function hz(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0,j=0,k=0;f=i;i=i+28|0;h=f|0;j=f+8|0;k=a+102872|0;c[h>>2]=k;c[h+4>>2]=b;g[j+16>>2]=1.0;b=d;d=j;a=c[b+4>>2]|0;c[d>>2]=c[b>>2]|0;c[d+4>>2]=a;a=e;e=j+8|0;d=c[a+4>>2]|0;c[e>>2]=c[a>>2]|0;c[e+4>>2]=d;dm(k|0,h,j);i=f;return}function hA(a){a=a|0;if((a|0)==0){return}c9(a);pl(a);return}function hB(a){a=a|0;di(a);return}function hC(b){b=b|0;var d=0,e=0;do{if(a[5262308]<<24>>24==0){if((aE(5262308)|0)==0){break}}}while(0);d=b+102968|0;b=c[d+4>>2]|0;e=5243004;c[e>>2]=c[d>>2]|0;c[e+4>>2]=b;return 5243004}function hD(a){a=a|0;if((a|0)==0){return}aW[c[(c[a>>2]|0)+4>>2]&2047](a);return}function hE(a,b,d){a=a|0;b=b|0;d=+d;bi[c[(c[a>>2]|0)+28>>2]&2047](a,b,d);return}function hF(a,b){a=a|0;b=b|0;return ba[c[(c[a>>2]|0)+8>>2]&2047](a,b)|0}function hG(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return a$[c[(c[a>>2]|0)+20>>2]&2047](a,b,d,e,f)|0}function hH(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bj[c[(c[a>>2]|0)+24>>2]&2047](a,b,d,e);return}function hI(a){a=a|0;return aY[c[(c[a>>2]|0)+12>>2]&2047](a)|0}function hJ(a,b,d){a=a|0;b=b|0;d=d|0;return a0[c[(c[a>>2]|0)+16>>2]&2047](a,b,d)|0}function hK(){var a=0,b=0;a=pp(20)|0;c[a>>2]=5259964;b=a+4|0;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;return a|0}function hL(a,b){a=a|0;b=b|0;aX[c[(c[a>>2]|0)+28>>2]&2047](a,b);return}function hM(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bj[c[(c[a>>2]|0)+8>>2]&2047](a,b,d,e);return}function hN(a,b,d,e,f){a=a|0;b=b|0;d=+d;e=e|0;f=f|0;aT[c[(c[a>>2]|0)+20>>2]&2047](a,b,d,e,f);return}function hO(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bj[c[(c[a>>2]|0)+12>>2]&2047](a,b,d,e);return}function hP(a,b,d,e){a=a|0;b=b|0;d=+d;e=e|0;aZ[c[(c[a>>2]|0)+16>>2]&2047](a,b,d,e);return}function hQ(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bj[c[(c[a>>2]|0)+24>>2]&2047](a,b,d,e);return}function hR(a,b){a=a|0;b=+b;return+(+a1[c[(c[a>>2]|0)+12>>2]&2047](a,b))}function hS(a){a=a|0;return}function hT(a){a=a|0;return+0.0}function hU(a){a=a|0;return c[a+64>>2]|0}function hV(a){a=a|0;return c[a+4>>2]|0}function hW(a,b){a=a|0;b=b|0;c[a+64>>2]=b;return}function hX(b){b=b|0;return(a[b+61|0]&1)<<24>>24!=0|0}function hY(a){a=a|0;var d=0;if((b[(c[a+48>>2]|0)+4>>1]&32)<<16>>16==0){d=0;return d|0}d=(b[(c[a+52>>2]|0)+4>>1]&32)<<16>>16!=0;return d|0}function hZ(a){a=a|0;var b=0,d=0;b=c[a>>2]|0;if((b|0)==-1){d=0;return d|0}d=c[(c[a+4>>2]|0)+(b*36&-1)+32>>2]|0;return d|0}function h_(a){a=a|0;var b=0,d=0.0,e=0,f=0.0,h=0.0,i=0.0,j=0,k=0.0;b=c[a>>2]|0;if((b|0)==-1){d=0.0;return+d}e=c[a+4>>2]|0;f=(+g[e+(b*36&-1)+8>>2]- +g[e+(b*36&-1)>>2]+(+g[e+(b*36&-1)+12>>2]- +g[e+(b*36&-1)+4>>2]))*2.0;b=c[a+12>>2]|0;L635:do{if((b|0)>0){h=0.0;a=0;while(1){if((c[e+(a*36&-1)+32>>2]|0)<0){i=h}else{i=h+(+g[e+(a*36&-1)+8>>2]- +g[e+(a*36&-1)>>2]+(+g[e+(a*36&-1)+12>>2]- +g[e+(a*36&-1)+4>>2]))*2.0}j=a+1|0;if((j|0)==(b|0)){k=i;break L635}else{h=i;a=j}}}else{k=0.0}}while(0);d=k/f;return+d}function h$(a){a=a|0;return c[a+4>>2]|0}function h0(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function h1(a){a=a|0;return+(+g[a+8>>2])}function h2(a){a=a|0;return c[a+12>>2]|0}function h3(a){a=a|0;return c[a+16>>2]|0}function h4(b,d){b=b|0;d=d|0;var e=0,f=0;e=d;d=b+20|0;f=c[e+4>>2]|0;c[d>>2]=c[e>>2]|0;c[d+4>>2]=f;a[b+36|0]=1;return}function h5(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function h6(b,d){b=b|0;d=d|0;var e=0,f=0;e=d;d=b+28|0;f=c[e+4>>2]|0;c[d>>2]=c[e>>2]|0;c[d+4>>2]=f;a[b+37|0]=1;return}function h7(a,b){a=a|0;b=b|0;c[a+16>>2]=b;return}function h8(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function h9(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;do{if(a[5262324]<<24>>24==0){if((aE(5262324)|0)==0){break}}}while(0);aX[c[c[b>>2]>>2]&2047](e,b);b=e;e=c[b+4>>2]|0;f=5242996;c[f>>2]=c[b>>2]|0;c[f+4>>2]=e;i=d;return 5242996}function ia(a){a=a|0;aW[c[(c[a>>2]|0)+16>>2]&2047](a);return}function ib(b){b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;e=d|0;do{if(a[5262316]<<24>>24==0){if((aE(5262316)|0)==0){break}}}while(0);aX[c[(c[b>>2]|0)+4>>2]&2047](e,b);b=e;e=c[b+4>>2]|0;f=5242936;c[f>>2]=c[b>>2]|0;c[f+4>>2]=e;i=d;return 5242936}function ic(b,d){b=b|0;d=+d;var e=0,f=0,g=0;e=i;i=i+8|0;f=e|0;do{if(a[5262260]<<24>>24==0){if((aE(5262260)|0)==0){break}}}while(0);bi[c[(c[b>>2]|0)+8>>2]&2047](f,b,d);b=f;f=c[b+4>>2]|0;g=5242928;c[g>>2]=c[b>>2]|0;c[g+4>>2]=f;i=e;return 5242928}function id(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=+f;return+(+bb[c[(c[a>>2]|0)+8>>2]&2047](a,b,d,e,f))}function ie(a){a=a|0;if((a|0)==0){return}pj(c[a+4>>2]|0);pl(a);return}function ig(){var a=0,b=0,d=0,e=0,f=0,g=0;a=pp(28)|0;b=a;c[a>>2]=-1;c[a+12>>2]=16;c[a+8>>2]=0;d=pi(576)|0;e=d;c[a+4>>2]=e;pr(d|0,0,576);f=0;while(1){g=f+1|0;c[e+(f*36&-1)+20>>2]=g;c[e+(f*36&-1)+32>>2]=-1;if((g|0)<15){f=g}else{break}}c[d+560>>2]=-1;c[d+572>>2]=-1;c[a+16>>2]=0;c[a+20>>2]=0;c[a+24>>2]=0;return b|0}function ih(a,b){a=a|0;b=b|0;var d=0;do{if((b|0)>-1){if((c[a+12>>2]|0)>(b|0)){break}else{d=577;break}}else{d=577}}while(0);if((d|0)==577){aH(5251020,159,5254912,5250596)}return(c[a+4>>2]|0)+(b*36&-1)|0}function ii(a,b){a=a|0;b=b|0;var d=0;do{if((b|0)>-1){if((c[a+12>>2]|0)>(b|0)){break}else{d=581;break}}else{d=581}}while(0);if((d|0)==581){aH(5251020,153,5254864,5250596)}return c[(c[a+4>>2]|0)+(b*36&-1)+16>>2]|0}function ij(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;b=a+12|0;d=c[b>>2]|0;if((d|0)<=0){e=0;return e|0}f=a+4|0;a=0;g=0;h=c[f>>2]|0;i=d;while(1){if((c[h+(a*36&-1)+32>>2]|0)<2){j=g;k=h;l=i}else{d=h+(a*36&-1)+24|0;m=c[d>>2]|0;if((m|0)==-1){aH(5251996,686,5254772,5248288);n=c[d>>2]|0;o=c[f>>2]|0;p=c[b>>2]|0}else{n=m;o=h;p=i}m=(c[o+((c[h+(a*36&-1)+28>>2]|0)*36&-1)+32>>2]|0)-(c[o+(n*36&-1)+32>>2]|0)|0;d=(m|0)>0?m:-m|0;j=(g|0)>(d|0)?g:d;k=o;l=p}d=a+1|0;if((d|0)<(l|0)){a=d;g=j;h=k;i=l}else{e=j;break}}return e|0}function ik(a){a=a|0;bX(a);return}function il(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0.0,i=0,j=0,l=0;e=bN(a)|0;f=a+4|0;h=+g[b+4>>2]+-.10000000149011612;i=(c[f>>2]|0)+(e*36&-1)|0;j=(g[k>>2]=+g[b>>2]+-.10000000149011612,c[k>>2]|0);l=(g[k>>2]=h,c[k>>2]|0)|0;c[i>>2]=0|j;c[i+4>>2]=l;h=+g[b+12>>2]+.10000000149011612;l=(c[f>>2]|0)+(e*36&-1)+8|0;i=(g[k>>2]=+g[b+8>>2]+.10000000149011612,c[k>>2]|0);b=(g[k>>2]=h,c[k>>2]|0)|0;c[l>>2]=0|i;c[l+4>>2]=b;c[(c[f>>2]|0)+(e*36&-1)+16>>2]=d;c[(c[f>>2]|0)+(e*36&-1)+32>>2]=0;bO(a,e);return e|0}function im(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return bR(a,b,c,d)|0}function io(a){a=a|0;bW(a);return}function ip(a,b){a=a|0;b=b|0;bP(a,b);return}function iq(){return pp(1)|0}function ir(a){a=a|0;if((a|0)==0){return}pl(a|0);return}function is(a){a=a|0;if((a|0)==0){return}aW[c[(c[a>>2]|0)+4>>2]&2047](a);return}function it(){var a=0;a=pp(4)|0;c[a>>2]=5259552;return a|0}function iu(a,b){a=a|0;b=b|0;aX[c[(c[a>>2]|0)+12>>2]&2047](a,b);return}function iv(a,b){a=a|0;b=b|0;aX[c[(c[a>>2]|0)+8>>2]&2047](a,b);return}function iw(a,b,d){a=a|0;b=b|0;d=d|0;bg[c[(c[a>>2]|0)+16>>2]&2047](a,b,d);return}function ix(a,b,d){a=a|0;b=b|0;d=d|0;bg[c[(c[a>>2]|0)+20>>2]&2047](a,b,d);return}function iy(a){a=a|0;if((a|0)==0){return}aW[c[(c[a>>2]|0)+4>>2]&2047](a);return}function iz(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+12|0;do{if((c[f>>2]|0)==0){if((c[b+16>>2]|0)==0){break}else{g=621;break}}else{g=621}}while(0);if((g|0)==621){aH(5247316,48,5258584,5251868)}if((e|0)<=1){aH(5247316,49,5258584,5247772)}g=b+16|0;c[g>>2]=e;h=pi(e<<3)|0;c[f>>2]=h;pq(h,d,c[g>>2]<<3);a[b+36|0]=0;a[b+37|0]=0;return}function iA(a,b,d){a=a|0;b=b|0;d=+d;bi[c[(c[a>>2]|0)+28>>2]&2047](a,b,d);return}function iB(a,b){a=a|0;b=b|0;return ba[c[(c[a>>2]|0)+8>>2]&2047](a,b)|0}function iC(a,b,c){a=a|0;b=b|0;c=c|0;cg(a,b,c);return}function iD(){var b=0;b=pp(40)|0;c[b>>2]=5260112;c[b+4>>2]=3;g[b+8>>2]=.009999999776482582;c[b+12>>2]=0;c[b+16>>2]=0;a[b+36|0]=0;a[b+37|0]=0;return b|0}function iE(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bj[c[(c[a>>2]|0)+24>>2]&2047](a,b,d,e);return}function iF(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return a$[c[(c[a>>2]|0)+20>>2]&2047](a,b,d,e,f)|0}function iG(a){a=a|0;return aY[c[(c[a>>2]|0)+12>>2]&2047](a)|0}function iH(a,b,d){a=a|0;b=b|0;d=d|0;return a0[c[(c[a>>2]|0)+16>>2]&2047](a,b,d)|0}function iI(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+12|0;do{if((c[f>>2]|0)==0){if((c[b+16>>2]|0)==0){break}else{g=635;break}}else{g=635}}while(0);if((g|0)==635){aH(5247316,34,5258640,5251868)}if((e|0)<=2){aH(5247316,35,5258640,5246200)}g=e+1|0;h=b+16|0;c[h>>2]=g;i=pi(g<<3)|0;c[f>>2]=i;pq(i,d,e<<3);d=c[f>>2]|0;i=d;g=d+(e<<3)|0;e=c[i+4>>2]|0;c[g>>2]=c[i>>2]|0;c[g+4>>2]=e;e=c[f>>2]|0;f=e+((c[h>>2]|0)-2<<3)|0;h=b+20|0;g=c[f+4>>2]|0;c[h>>2]=c[f>>2]|0;c[h+4>>2]=g;g=e+8|0;e=b+28|0;h=c[g+4>>2]|0;c[e>>2]=c[g>>2]|0;c[e+4>>2]=h;a[b+36|0]=1;a[b+37|0]=1;return}function iJ(a,b){a=a|0;b=b|0;return ba[c[(c[a>>2]|0)+8>>2]&2047](a,b)|0}function iK(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;if((a|0)==0){return}b=a+4|0;d=a|0;e=c[d>>2]|0;L761:do{if((c[b>>2]|0)>0){f=0;g=e;while(1){pj(c[g+(f<<3)+4>>2]|0);h=f+1|0;i=c[d>>2]|0;if((h|0)<(c[b>>2]|0)){f=h;g=i}else{j=i;break L761}}}else{j=e}}while(0);pj(j);pl(a);return}function iL(a){a=a|0;var b=0,d=0,e=0,f=0;b=a+4|0;d=a|0;L767:do{if((c[b>>2]|0)>0){e=0;while(1){pj(c[(c[d>>2]|0)+(e<<3)+4>>2]|0);f=e+1|0;if((f|0)<(c[b>>2]|0)){e=f}else{break L767}}}}while(0);c[b>>2]=0;pr(c[d>>2]|0,0,c[a+8>>2]<<3|0);pr(a+12|0,0,56);return}function iM(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)==0){return}do{if((e|0)>0){if((e|0)<=640){break}pj(d);return}else{aH(5246516,164,5257772,5249204)}}while(0);f=a[e+5261540|0]|0;if((f&255)>=14){aH(5246516,173,5257772,5247588)}e=b+12+((f&255)<<2)|0;c[d>>2]=c[e>>2]|0;c[e>>2]=d;return}function iN(a,b){a=a|0;b=b|0;return cA(a,b)|0}function iO(){var b=0,d=0,e=0,f=0,g=0,h=0;b=pp(68)|0;d=b;c[b+8>>2]=128;c[b+4>>2]=0;e=pi(1024)|0;c[b>>2]=e;pr(e|0,0,1024);pr(b+12|0,0,56);if((a[5261536]&1)<<24>>24==0){f=0;g=1}else{return d|0}while(1){if((f|0)>=14){aH(5246516,73,5257692,5251608)}if((g|0)>(c[5262184+(f<<2)>>2]|0)){b=f+1|0;a[g+5261540|0]=b&255;h=b}else{a[g+5261540|0]=f&255;h=f}b=g+1|0;if((b|0)==641){break}else{f=h;g=b}}a[5261536]=1;return d|0}function iP(a){a=a|0;if((a|0)==0){return}aW[c[(c[a>>2]|0)+4>>2]&2047](a);return}function iQ(a,b,c){a=a|0;b=b|0;c=c|0;cw(a,b,c);return}function iR(a,b,d){a=a|0;b=b|0;d=+d;bi[c[(c[a>>2]|0)+28>>2]&2047](a,b,d);return}function iS(a){a=a|0;return+(+g[a+8>>2])}function iT(a,b){a=a|0;b=b|0;return a+20+(b<<3)|0}function iU(a,b,d){a=a|0;b=+b;d=+d;var e=0.0,f=0.0;c[a+148>>2]=4;e=-0.0-b;f=-0.0-d;g[a+20>>2]=e;g[a+24>>2]=f;g[a+28>>2]=b;g[a+32>>2]=f;g[a+36>>2]=b;g[a+40>>2]=d;g[a+44>>2]=e;g[a+48>>2]=d;g[a+84>>2]=0.0;g[a+88>>2]=-1.0;g[a+92>>2]=1.0;g[a+96>>2]=0.0;g[a+100>>2]=0.0;g[a+104>>2]=1.0;g[a+108>>2]=-1.0;g[a+112>>2]=0.0;g[a+12>>2]=0.0;g[a+16>>2]=0.0;return}function iV(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+12|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function iW(a,b){a=a|0;b=b|0;c[a+148>>2]=b;return}function iX(a){a=a|0;return c[a+148>>2]|0}function iY(a){a=a|0;return c[a+4>>2]|0}function iZ(a){a=a|0;return c[a+148>>2]|0}function i_(a){a=a|0;return a+12|0}function i$(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;f=d;d=b+12|0;g=c[f+4>>2]|0;c[d>>2]=c[f>>2]|0;c[d+4>>2]=g;g=e;e=b+20|0;d=c[g+4>>2]|0;c[e>>2]=c[g>>2]|0;c[e+4>>2]=d;a[b+44|0]=0;a[b+45|0]=0;return}function i0(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function i1(a){a=a|0;return+(+g[a+8>>2])}function i2(a){a=a|0;return c[a+4>>2]|0}function i3(a){a=a|0;return c[a+12>>2]|0}function i4(a,b){a=a|0;b=b|0;var d=0;d=a+4|0;a=c[d>>2]|0;c[d>>2]=b?a|4:a&-5;return}function i5(a){a=a|0;return+(+g[a+140>>2])}function i6(a){a=a|0;return+(+g[a+136>>2])}function i7(a){a=a|0;return(c[a+4>>2]&2|0)!=0|0}function i8(a){a=a|0;return(c[a+4>>2]&4|0)!=0|0}function i9(a){a=a|0;return c[a+52>>2]|0}function ja(a,b){a=a|0;b=+b;g[a+136>>2]=b;return}function jb(a){a=a|0;return c[a+48>>2]|0}function jc(a){a=a|0;return c[a+56>>2]|0}function jd(a){a=a|0;return c[a+60>>2]|0}function je(a,b){a=a|0;b=+b;g[a+140>>2]=b;return}function jf(a){a=a|0;return a+64|0}function jg(a){a=a|0;var b=0.0,d=0.0;b=+g[(c[a+48>>2]|0)+20>>2];d=+g[(c[a+52>>2]|0)+20>>2];g[a+140>>2]=b>d?b:d;return}function jh(a){a=a|0;return+(+g[a+8>>2])}function ji(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function jj(a){a=a|0;return c[a+4>>2]|0}function jk(a){a=a|0;return+(+g[a+56>>2])}function jl(a){a=a|0;return c[a+148>>2]|0}function jm(a){a=a|0;return(b[a+4>>1]&4)<<16>>16!=0|0}function jn(a,b){a=a|0;b=+b;g[a+136>>2]=b;return}function jo(a,b){a=a|0;b=+b;g[a+140>>2]=b;return}function jp(a,b){a=a|0;b=b|0;c[a+148>>2]=b;return}function jq(a){a=a|0;return+(+g[a+72>>2])}function jr(a){a=a|0;return c[a+100>>2]|0}function js(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,h=0;if((c[a>>2]|0)!=2){return}f=a+4|0;h=b[f>>1]|0;if((h&2)<<16>>16==0){b[f>>1]=h|2;g[a+144>>2]=0.0}h=d|0;f=a+76|0;g[f>>2]=+g[h>>2]+ +g[f>>2];f=d+4|0;d=a+80|0;g[d>>2]=+g[f>>2]+ +g[d>>2];d=a+84|0;g[d>>2]=+g[d>>2]+((+g[e>>2]- +g[a+44>>2])*+g[f>>2]-(+g[e+4>>2]- +g[a+48>>2])*+g[h>>2]);return}function jt(a,d){a=a|0;d=d|0;var e=0.0,f=0.0,h=0,i=0;if((c[a>>2]|0)==0){return}e=+g[d>>2];f=+g[d+4>>2];do{if(e*e+f*f>0.0){h=a+4|0;i=b[h>>1]|0;if((i&2)<<16>>16!=0){break}b[h>>1]=i|2;g[a+144>>2]=0.0}}while(0);i=d;d=a+64|0;a=c[i+4>>2]|0;c[d>>2]=c[i>>2]|0;c[d+4>>2]=a;return}function ju(a){a=a|0;return c[a+108>>2]|0}function jv(a){a=a|0;return c[a+96>>2]|0}function jw(a,c){a=a|0;c=c|0;var d=0,e=0;d=a+4|0;e=b[d>>1]|0;if(c){b[d>>1]=e|4;return}c=e&-5;b[d>>1]=c;if((e&2)<<16>>16!=0){return}b[d>>1]=c|2;g[a+144>>2]=0.0;return}function jx(a){a=a|0;return+(+g[a+116>>2])}function jy(a,d){a=a|0;d=+d;var e=0,f=0;if((c[a>>2]|0)==0){return}do{if(d*d>0.0){e=a+4|0;f=b[e>>1]|0;if((f&2)<<16>>16!=0){break}b[e>>1]=f|2;g[a+144>>2]=0.0}}while(0);g[a+72>>2]=d;return}function jz(a,b){a=a|0;b=b|0;var d=0,e=0,f=0.0,h=0.0;d=a+116|0;g[b>>2]=+g[d>>2];e=a+28|0;f=+g[e>>2];h=+g[a+32>>2];g[b+12>>2]=+g[a+124>>2]+ +g[d>>2]*(f*f+h*h);d=e;e=b+4|0;b=c[d+4>>2]|0;c[e>>2]=c[d>>2]|0;c[e+4>>2]=b;return}function jA(a,d){a=a|0;d=d|0;var e=0,f=0;if((c[a>>2]|0)!=2){return}e=a+4|0;f=b[e>>1]|0;if((f&2)<<16>>16==0){b[e>>1]=f|2;g[a+144>>2]=0.0}f=a+76|0;g[f>>2]=+g[d>>2]+ +g[f>>2];f=a+80|0;g[f>>2]=+g[d+4>>2]+ +g[f>>2];return}function jB(a,d){a=a|0;d=+d;var e=0,f=0;if((c[a>>2]|0)!=2){return}e=a+4|0;f=b[e>>1]|0;if((f&2)<<16>>16==0){b[e>>1]=f|2;g[a+144>>2]=0.0}f=a+84|0;g[f>>2]=+g[f>>2]+d;return}function jC(a){a=a|0;return(b[a+4>>1]&2)<<16>>16!=0|0}function jD(a){a=a|0;return a+12|0}function jE(a){a=a|0;return a+44|0}function jF(a){a=a|0;return+(+g[a+136>>2])}function jG(a,b){a=a|0;b=b|0;return ba[c[(c[a>>2]|0)+8>>2]&2047](a,b)|0}function jH(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return a$[c[(c[a>>2]|0)+20>>2]&2047](a,b,d,e,f)|0}function jI(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;cr(a,b,c,d,e);return}function jJ(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bj[c[(c[a>>2]|0)+24>>2]&2047](a,b,d,e);return}function jK(a){a=a|0;return aY[c[(c[a>>2]|0)+12>>2]&2047](a)|0}function jL(a,b,d){a=a|0;b=b|0;d=d|0;return a0[c[(c[a>>2]|0)+16>>2]&2047](a,b,d)|0}function jM(){var a=0;a=pp(152)|0;c[a>>2]=5259868;c[a+4>>2]=2;g[a+8>>2]=.009999999776482582;c[a+148>>2]=0;g[a+12>>2]=0.0;g[a+16>>2]=0.0;return a|0}function jN(a){a=a|0;if((a|0)==0){return}aW[c[(c[a>>2]|0)+4>>2]&2047](a);return}function jO(a,b,d){a=a|0;b=b|0;d=+d;bi[c[(c[a>>2]|0)+28>>2]&2047](a,b,d);return}function jP(a,b){a=a|0;b=b|0;return ba[c[(c[a>>2]|0)+8>>2]&2047](a,b)|0}function jQ(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return a$[c[(c[a>>2]|0)+20>>2]&2047](a,b,d,e,f)|0}function jR(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bj[c[(c[a>>2]|0)+24>>2]&2047](a,b,d,e);return}function jS(a){a=a|0;return aY[c[(c[a>>2]|0)+12>>2]&2047](a)|0}function jT(a,b,d){a=a|0;b=b|0;d=d|0;return a0[c[(c[a>>2]|0)+16>>2]&2047](a,b,d)|0}function jU(){var a=0,d=0;a=pp(48)|0;c[a>>2]=5260312;c[a+4>>2]=1;g[a+8>>2]=.009999999776482582;d=a+28|0;c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;b[d+16>>1]=0;return a|0}function jV(a,b){a=a|0;b=b|0;var d=0,e=0;d=c[a+48>>2]|0;e=c[a+52>>2]|0;bH(b,a+64|0,(c[d+8>>2]|0)+12|0,+g[(c[d+12>>2]|0)+8>>2],(c[e+8>>2]|0)+12|0,+g[(c[e+12>>2]|0)+8>>2]);return}function jW(a){a=a|0;g[a+136>>2]=+O(+(+g[(c[a+48>>2]|0)+16>>2]*+g[(c[a+52>>2]|0)+16>>2]));return}function jX(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bj[c[c[a>>2]>>2]&2047](a,b,d,e);return}function jY(a,b,d){a=a|0;b=b|0;d=+d;bi[c[(c[a>>2]|0)+28>>2]&2047](a,b,d);return}function jZ(a,b){a=a|0;b=b|0;return ba[c[(c[a>>2]|0)+8>>2]&2047](a,b)|0}function j_(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;return a$[c[(c[a>>2]|0)+20>>2]&2047](a,b,d,e,f)|0}function j$(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;bj[c[(c[a>>2]|0)+24>>2]&2047](a,b,d,e);return}function j0(a){a=a|0;return aY[c[(c[a>>2]|0)+12>>2]&2047](a)|0}function j1(a,b,d){a=a|0;b=b|0;d=d|0;return a0[c[(c[a>>2]|0)+16>>2]&2047](a,b,d)|0}function j2(a,b){a=a|0;b=b|0;cM(a,b);return}function j3(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0;do{if(a[5262300]<<24>>24==0){if((aE(5262300)|0)==0){break}}}while(0);e=+g[d>>2]- +g[b+12>>2];f=+g[d+4>>2]- +g[b+16>>2];h=+g[b+24>>2];i=+g[b+20>>2];b=(g[k>>2]=e*h+f*i,c[k>>2]|0);d=(g[k>>2]=h*f+e*(-0.0-i),c[k>>2]|0)|0;j=5242920;c[j>>2]=0|b;c[j+4>>2]=d;return 5242920}function j4(b){b=b|0;var d=0,e=0;do{if(a[5262268]<<24>>24==0){if((aE(5262268)|0)==0){break}}}while(0);d=b+64|0;b=c[d+4>>2]|0;e=5242912;c[e>>2]=c[d>>2]|0;c[e+4>>2]=b;return 5242912}function j5(a,b,c){a=a|0;b=b|0;c=+c;cL(a,b,c);return}function j6(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0;do{if(a[5262244]<<24>>24==0){if((aE(5262244)|0)==0){break}}}while(0);e=+g[b+72>>2];f=e*(+g[d>>2]- +g[b+44>>2])+ +g[b+68>>2];h=(g[k>>2]=+g[b+64>>2]+(+g[d+4>>2]- +g[b+48>>2])*(-0.0-e),c[k>>2]|0);b=(g[k>>2]=f,c[k>>2]|0)|0;d=5242904;c[d>>2]=0|h;c[d+4>>2]=b;return 5242904}function j7(a){a=a|0;cF(a);return}function j8(a,b){a=a|0;b=b|0;cE(a,b);return}function j9(a,b){a=a|0;b=b|0;return cG(a,b)|0}function ka(d,e,f){d=d|0;e=e|0;f=+f;var h=0,j=0;h=i;i=i+28|0;j=h|0;b[j+22>>1]=1;b[j+24>>1]=-1;b[j+26>>1]=0;c[j+4>>2]=0;g[j+8>>2]=.20000000298023224;g[j+12>>2]=0.0;a[j+20|0]=0;c[j>>2]=e;g[j+16>>2]=f;e=cG(d,j)|0;i=h;return e|0}function kb(a,b){a=a|0;b=b|0;cK(a,b);return}function kc(a,d,e){a=a|0;d=d|0;e=e|0;var f=0,h=0,i=0.0,j=0.0;if((c[a>>2]|0)!=2){return}f=a+4|0;h=b[f>>1]|0;if((h&2)<<16>>16==0){b[f>>1]=h|2;g[a+144>>2]=0.0}i=+g[a+120>>2];h=d|0;f=d+4|0;j=i*+g[f>>2];d=a+64|0;g[d>>2]=i*+g[h>>2]+ +g[d>>2];d=a+68|0;g[d>>2]=j+ +g[d>>2];d=a+72|0;g[d>>2]=+g[d>>2]+ +g[a+128>>2]*((+g[e>>2]- +g[a+44>>2])*+g[f>>2]-(+g[e+4>>2]- +g[a+48>>2])*+g[h>>2]);return}function kd(a){a=a|0;return(b[a+4>>1]&16)<<16>>16!=0|0}function ke(a){a=a|0;return a+28|0}function kf(a){a=a|0;return c[a+112>>2]|0}function kg(a){a=a|0;return+(+g[a+132>>2])}function kh(a){a=a|0;return(b[a+4>>1]&8)<<16>>16!=0|0}function ki(a){a=a|0;return c[a+88>>2]|0}function kj(a,b){a=a|0;b=+b;g[a+132>>2]=b;return}function kk(a,c){a=a|0;c=c|0;var d=0;d=a+4|0;a=b[d>>1]|0;b[d>>1]=c?a|8:a&-9;return}function kl(a){a=a|0;return c[a>>2]|0}function km(a){a=a|0;return+(+g[a+140>>2])}function kn(a){a=a|0;var b=0.0,c=0.0;b=+g[a+28>>2];c=+g[a+32>>2];return+(+g[a+124>>2]+ +g[a+116>>2]*(b*b+c*c))}function ko(a){a=a|0;return(b[a+4>>1]&32)<<16>>16!=0|0}function kp(a,d){a=a|0;d=+d;var e=0,f=0;if((c[a>>2]|0)!=2){return}e=a+4|0;f=b[e>>1]|0;if((f&2)<<16>>16==0){b[e>>1]=f|2;g[a+144>>2]=0.0}f=a+72|0;g[f>>2]=+g[f>>2]+ +g[a+128>>2]*d;return}function kq(a){a=a|0;return a+12|0}function kr(a){a=a|0;return c[a+102408>>2]|0}function ks(a,c){a=a|0;c=c|0;b[a+2>>1]=c;return}function kt(a,c){a=a|0;c=c|0;b[a>>1]=c;return}function ku(a){a=a|0;return b[a+4>>1]|0}function kv(a,c){a=a|0;c=c|0;b[a+4>>1]=c;return}function kw(a){a=a|0;return b[a+2>>1]|0}function kx(a){a=a|0;return b[a>>1]|0}function ky(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function kz(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function kA(a){a=a|0;return+(+g[a+36>>2])}function kB(a){a=a|0;return a+20|0}function kC(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function kD(a){a=a|0;return a+28|0}function kE(a,b){a=a|0;b=+b;g[a+40>>2]=b;return}function kF(a){a=a|0;return+(+g[a+40>>2])}function kG(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0.0,i=0,j=0.0,l=0.0,m=0.0,n=0;c[a+8>>2]=b;c[a+12>>2]=d;f=e|0;h=+g[f>>2]- +g[b+12>>2];i=e+4|0;j=+g[i>>2]- +g[b+16>>2];l=+g[b+24>>2];m=+g[b+20>>2];b=a+20|0;e=(g[k>>2]=h*l+j*m,c[k>>2]|0);n=(g[k>>2]=l*j+h*(-0.0-m),c[k>>2]|0)|0;c[b>>2]=0|e;c[b+4>>2]=n;m=+g[f>>2]- +g[d+12>>2];h=+g[i>>2]- +g[d+16>>2];j=+g[d+24>>2];l=+g[d+20>>2];d=a+28|0;a=(g[k>>2]=m*j+h*l,c[k>>2]|0);i=(g[k>>2]=j*h+m*(-0.0-l),c[k>>2]|0)|0;c[d>>2]=0|a;c[d+4>>2]=i;return}function kH(a){a=a|0;return+(+g[a+28>>2])}function kI(b){b=b|0;return(a[b+37|0]&1)<<24>>24!=0|0}function kJ(a){a=a|0;return c[a>>2]|0}function kK(b){b=b|0;return(a[b+36|0]&1)<<24>>24!=0|0}function kL(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+4|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function kM(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+16|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function kN(b){b=b|0;return(a[b+39|0]&1)<<24>>24!=0|0}function kO(a){a=a|0;return c[a+44>>2]|0}function kP(a,b){a=a|0;b=+b;g[a+32>>2]=b;return}function kQ(b,c){b=b|0;c=c|0;a[b+38|0]=c&1;return}function kR(b,c){b=b|0;c=c|0;a[b+36|0]=c&1;return}function kS(a){a=a|0;return+(+g[a+48>>2])}function kT(a,b){a=a|0;b=+b;g[a+24>>2]=b;return}function kU(a,b){a=a|0;b=b|0;c[a+44>>2]=b;return}function kV(a){a=a|0;return a+4|0}function kW(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function kX(a,b){a=a|0;b=+b;g[a+48>>2]=b;return}function kY(a){a=a|0;return+(+g[a+32>>2])}function kZ(b,c){b=b|0;c=c|0;a[b+39|0]=c&1;return}function k_(b,c){b=b|0;c=c|0;a[b+40|0]=c&1;return}function k$(a,b){a=a|0;b=+b;g[a+12>>2]=b;return}function k0(a){a=a|0;return+(+g[a+12>>2])}function k1(a){a=a|0;return+(+g[a+24>>2])}function k2(a){a=a|0;return a+16|0}function k3(b){b=b|0;return(a[b+40|0]&1)<<24>>24!=0|0}function k4(a,b){a=a|0;b=+b;g[a+28>>2]=b;return}function k5(b){b=b|0;return(a[b+38|0]&1)<<24>>24!=0|0}function k6(b,c){b=b|0;c=c|0;a[b+37|0]=c&1;return}function k7(a,b){a=a|0;b=+b;g[a>>2]=b;return}function k8(a,b,c){a=a|0;b=+b;c=+c;g[a>>2]=b;g[a+4>>2]=c;return}function k9(a){a=a|0;return+(+g[a>>2])}function la(a){a=a|0;return+(+g[a+4>>2])}function lb(a,b){a=a|0;b=+b;g[a+4>>2]=b;return}function lc(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0;do{if(a[5262276]<<24>>24==0){if((aE(5262276)|0)==0){break}}}while(0);e=+g[b+24>>2];f=+g[d>>2];h=+g[b+20>>2];i=+g[d+4>>2];d=(g[k>>2]=e*f-h*i,c[k>>2]|0);b=(g[k>>2]=f*h+e*i,c[k>>2]|0)|0;j=5242896;c[j>>2]=0|d;c[j+4>>2]=b;return 5242896}function ld(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,l=0.0,m=0;do{if(a[5262252]<<24>>24==0){if((aE(5262252)|0)==0){break}}}while(0);e=+g[b+24>>2];f=+g[d>>2];h=+g[b+20>>2];i=+g[d+4>>2];j=+g[b+72>>2];l=j*(+g[b+12>>2]+(e*f-h*i)- +g[b+44>>2])+ +g[b+68>>2];d=(g[k>>2]=+g[b+64>>2]+(f*h+e*i+ +g[b+16>>2]- +g[b+48>>2])*(-0.0-j),c[k>>2]|0);b=(g[k>>2]=l,c[k>>2]|0)|0;m=5242888;c[m>>2]=0|d;c[m+4>>2]=b;return 5242888}function le(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0.0,l=0;do{if(a[5262292]<<24>>24==0){if((aE(5262292)|0)==0){break}}}while(0);e=+g[b+24>>2];f=+g[d>>2];h=+g[b+20>>2];i=+g[d+4>>2];j=f*h+e*i+ +g[b+16>>2];d=(g[k>>2]=+g[b+12>>2]+(e*f-h*i),c[k>>2]|0);b=(g[k>>2]=j,c[k>>2]|0)|0;l=5242880;c[l>>2]=0|d;c[l+4>>2]=b;return 5242880}function lf(a,d){a=a|0;d=d|0;var e=0,f=0;e=a+4|0;f=b[e>>1]|0;if(!d){b[e>>1]=f&-3;g[a+144>>2]=0.0;d=a+64|0;c[d>>2]=0;c[d+4>>2]=0;c[d+8>>2]=0;c[d+12>>2]=0;c[d+16>>2]=0;c[d+20>>2]=0;return}if((f&2)<<16>>16!=0){return}b[e>>1]=f|2;g[a+144>>2]=0.0;return}function lg(b,d){b=b|0;d=d|0;var e=0.0,f=0.0,h=0.0,i=0.0,j=0;do{if(a[5262284]<<24>>24==0){if((aE(5262284)|0)==0){break}}}while(0);e=+g[b+24>>2];f=+g[d>>2];h=+g[b+20>>2];i=+g[d+4>>2];d=(g[k>>2]=e*f+h*i,c[k>>2]|0);b=(g[k>>2]=f*(-0.0-h)+e*i,c[k>>2]|0)|0;j=5242988;c[j>>2]=0|d;c[j+4>>2]=b;return 5242988}function lh(a){a=a|0;cN(a);return}function li(a,b){a=a|0;b=b|0;cJ(a,b);return}function lj(a,c){a=a|0;c=c|0;var d=0,e=0;d=a+4|0;e=b[d>>1]|0;b[d>>1]=c?e|16:e&-17;cF(a);return}function lk(a){a=a|0;if((a|0)==0){return}if((c[a+102400>>2]|0)!=0){aH(5246028,32,5257384,5251312)}if((c[a+102796>>2]|0)!=0){aH(5246028,33,5257384,5248804)}pl(a|0);return}function ll(){var a=0;a=pp(102800)|0;c[a+102400>>2]=0;c[a+102404>>2]=0;c[a+102408>>2]=0;c[a+102796>>2]=0;return a|0}function lm(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=b+102796|0;f=c[e>>2]|0;if((f|0)<32){g=f}else{aH(5246028,38,5257424,5247552);g=c[e>>2]|0}f=b+102412+(g*12&-1)|0;c[b+102412+(g*12&-1)+4>>2]=d;h=b+102400|0;i=c[h>>2]|0;if((i+d|0)>102400){c[f>>2]=pi(d)|0;a[b+102412+(g*12&-1)+8|0]=1}else{c[f>>2]=b+i|0;a[b+102412+(g*12&-1)+8|0]=0;c[h>>2]=(c[h>>2]|0)+d|0}h=b+102404|0;g=(c[h>>2]|0)+d|0;c[h>>2]=g;h=b+102408|0;b=c[h>>2]|0;c[h>>2]=(b|0)>(g|0)?b:g;c[e>>2]=(c[e>>2]|0)+1|0;return c[f>>2]|0}function ln(a,b){a=a|0;b=b|0;cC(a,b);return}function lo(a,b){a=a|0;b=b|0;aX[c[(c[a>>2]|0)+8>>2]&2047](a,b);return}function lp(a){a=a|0;if((a|0)==0){return}pl(a);return}function lq(){var a=0;a=pp(6)|0;b[a>>1]=1;b[a+2>>1]=-1;b[a+4>>1]=0;return a|0}function lr(a){a=a|0;if((a|0)==0){return}pl(a);return}function ls(){var b=0,d=0,e=0;b=pp(44)|0;d=b;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;a[b+16|0]=0;c[b>>2]=9;e=b+20|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[e+20>>2]=0;return d|0}function lt(){var b=0;b=pp(52)|0;c[b+44>>2]=0;pr(b+4|0,0,32);a[b+36|0]=1;a[b+37|0]=1;a[b+38|0]=0;a[b+39|0]=0;c[b>>2]=0;a[b+40|0]=1;g[b+48>>2]=1.0;return b|0}function lu(a){a=a|0;if((a|0)==0){return}pl(a);return}function lv(a){a=a|0;var b=0,c=0.0,d=0,e=0.0,f=0.0,h=0.0,i=0.0;b=a|0;c=+g[b>>2];d=a+4|0;e=+g[d>>2];f=+O(+(c*c+e*e));if(f<1.1920928955078125e-7){h=0.0;return+h}i=1.0/f;g[b>>2]=c*i;g[d>>2]=e*i;h=f;return+h}function lw(){return pp(8)|0}function lx(a,b){a=+a;b=+b;var c=0;c=pp(8)|0;g[c>>2]=a;g[c+4>>2]=b;return c|0}function ly(a){a=a|0;var b=0.0,c=0;b=+g[a>>2];if(!(b==b&!(B=0.0,B!=B)&b>+-q&b<+q)){c=0;return c|0}b=+g[a+4>>2];if(!(b==b&!(B=0.0,B!=B)&b>+-q)){c=0;return c|0}c=b<+q;return c|0}function lz(a){a=a|0;var b=0.0,c=0.0;b=+g[a>>2];c=+g[a+4>>2];return+(b*b+c*c)}function lA(a,b){a=a|0;b=b|0;var c=0;c=a|0;g[c>>2]=+g[b>>2]+ +g[c>>2];c=a+4|0;g[c>>2]=+g[b+4>>2]+ +g[c>>2];return}function lB(a){a=a|0;g[a>>2]=0.0;g[a+4>>2]=0.0;return}function lC(a,b){a=a|0;b=+b;var c=0;c=a|0;g[c>>2]=+g[c>>2]*b;c=a+4|0;g[c>>2]=+g[c>>2]*b;return}function lD(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function lE(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;g[a>>2]=b;g[a+4>>2]=c;g[a+8>>2]=d;return}function lF(a){a=a|0;return+(+g[a+8>>2])}function lG(a,b){a=a|0;b=b|0;var c=0;c=a|0;g[c>>2]=+g[b>>2]+ +g[c>>2];c=a+4|0;g[c>>2]=+g[b+4>>2]+ +g[c>>2];c=a+8|0;g[c>>2]=+g[b+8>>2]+ +g[c>>2];return}function lH(a){a=a|0;g[a>>2]=0.0;g[a+4>>2]=0.0;g[a+8>>2]=0.0;return}function lI(a,b){a=a|0;b=+b;var c=0;c=a|0;g[c>>2]=+g[c>>2]*b;c=a+4|0;g[c>>2]=+g[c>>2]*b;c=a+8|0;g[c>>2]=+g[c>>2]*b;return}function lJ(a){a=a|0;return+(+g[a+24>>2])}function lK(a,b){a=a|0;b=+b;g[a+24>>2]=b;return}function lL(a){a=a|0;return c[a+16>>2]|0}function lM(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0,i=0.0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0;d=c[a+16>>2]|0;e=c[a+20>>2]|0;if((e|0)<=1){f=0;h=d+(f<<3)|0;return h|0}i=+g[b+4>>2];j=+g[b>>2];k=i*+g[d+4>>2]+j*+g[d>>2];b=1;a=0;while(1){l=j*+g[d+(b<<3)>>2]+i*+g[d+(b<<3)+4>>2];m=l>k;n=m?b:a;o=b+1|0;if((o|0)==(e|0)){f=n;break}else{k=m?l:k;b=o;a=n}}h=d+(f<<3)|0;return h|0}function lN(a){a=a|0;return c[a+20>>2]|0}function lO(a){a=a|0;return c[a+20>>2]|0}function lP(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,h=0.0,i=0.0,j=0.0,k=0.0,l=0,m=0,n=0;d=c[a+16>>2]|0;e=c[a+20>>2]|0;if((e|0)<=1){f=0;return f|0}h=+g[b+4>>2];i=+g[b>>2];j=h*+g[d+4>>2]+i*+g[d>>2];b=1;a=0;while(1){k=i*+g[d+(b<<3)>>2]+h*+g[d+(b<<3)+4>>2];l=k>j;m=l?b:a;n=b+1|0;if((n|0)==(e|0)){f=m;break}else{j=l?k:j;b=n;a=m}}return f|0}function lQ(a,b){a=a|0;b=b|0;c[a+16>>2]=b;return}function lR(a,b){a=a|0;b=b|0;c[a+20>>2]=b;return}function lS(b){b=b|0;return(a[b+20|0]&1)<<24>>24!=0|0}function lT(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function lU(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function lV(a){a=a|0;return+(+g[a+16>>2])}function lW(a){a=a|0;return c[a>>2]|0}function lX(a,b){a=a|0;b=+b;g[a+16>>2]=b;return}function lY(a,b){a=a|0;b=+b;g[a+12>>2]=b;return}function lZ(a){a=a|0;return+(+g[a+12>>2])}function l_(b,c){b=b|0;c=c|0;a[b+20|0]=c&1;return}function l$(a){a=a|0;return a+22|0}function l0(a){a=a|0;return+(+g[a+8>>2])}function l1(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function l2(a){a=a|0;return c[a+4>>2]|0}function l3(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function l4(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function l5(a){a=a|0;return+(+g[a+68>>2])}function l6(b){b=b|0;return(a[b+60|0]&1)<<24>>24!=0|0}function l7(a){a=a|0;return+(+g[a+44>>2])}function l8(b,c){b=b|0;c=c|0;a[b+48|0]=c&1;return}function l9(a,b){a=a|0;b=+b;g[a+68>>2]=b;return}function ma(a){a=a|0;return a+36|0}function mb(a,b){a=a|0;b=+b;g[a+56>>2]=b;return}function mc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0,l=0.0,m=0.0,n=0,o=0.0,p=0,q=0,r=0;c[a+8>>2]=b;c[a+12>>2]=d;h=e|0;i=+g[h>>2]- +g[b+12>>2];j=e+4|0;l=+g[j>>2]- +g[b+16>>2];e=b+24|0;m=+g[e>>2];n=b+20|0;o=+g[n>>2];p=a+20|0;q=(g[k>>2]=i*m+l*o,c[k>>2]|0);r=(g[k>>2]=m*l+i*(-0.0-o),c[k>>2]|0)|0;c[p>>2]=0|q;c[p+4>>2]=r;o=+g[h>>2]- +g[d+12>>2];i=+g[j>>2]- +g[d+16>>2];l=+g[d+24>>2];m=+g[d+20>>2];j=a+28|0;h=(g[k>>2]=o*l+i*m,c[k>>2]|0);r=(g[k>>2]=l*i+o*(-0.0-m),c[k>>2]|0)|0;c[j>>2]=0|h;c[j+4>>2]=r;m=+g[e>>2];o=+g[f>>2];i=+g[n>>2];l=+g[f+4>>2];f=a+36|0;n=(g[k>>2]=m*o+i*l,c[k>>2]|0);e=(g[k>>2]=o*(-0.0-i)+m*l,c[k>>2]|0)|0;c[f>>2]=0|n;c[f+4>>2]=e;g[a+44>>2]=+g[d+56>>2]- +g[b+56>>2];return}function md(a,b){a=a|0;b=+b;g[a+52>>2]=b;return}function me(a){a=a|0;return+(+g[a+56>>2])}function mf(b){b=b|0;return(a[b+48|0]&1)<<24>>24!=0|0}function mg(a,b){a=a|0;b=+b;g[a+44>>2]=b;return}function mh(a){a=a|0;return a+20|0}function mi(a){a=a|0;return a+28|0}function mj(a){a=a|0;return+(+g[a+64>>2])}function mk(a,b){a=a|0;b=+b;g[a+64>>2]=b;return}function ml(b,c){b=b|0;c=c|0;a[b+60|0]=c&1;return}function mm(a){a=a|0;return+(+g[a+52>>2])}function mn(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+36|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function mo(a,b){a=a|0;b=+b;g[a+4>>2]=b;return}function mp(a){a=a|0;g[a>>2]=0.0;g[a+4>>2]=1.0;return}function mq(a){a=a|0;return+(+g[a+4>>2])}function mr(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function ms(a,b){a=a|0;b=+b;g[a+52>>2]=b;return}function mt(a){a=a|0;return a+36|0}function mu(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function mv(a){a=a|0;return+(+g[a+56>>2])}function mw(a,b){a=a|0;b=+b;g[a+48>>2]=b;return}function mx(b){b=b|0;return(a[b+44|0]&1)<<24>>24!=0|0}function my(a){a=a|0;return a+20|0}function mz(a){a=a|0;return+(+g[a+48>>2])}function mA(b){b=b|0;var d=0.0,e=0,f=0;do{if(a[5262364]<<24>>24==0){if((aE(5262364)|0)==0){break}}}while(0);d=+g[b>>2];e=(g[k>>2]=-0.0- +g[b+4>>2],c[k>>2]|0);b=(g[k>>2]=d,c[k>>2]|0)|0;f=5242980;c[f>>2]=0|e;c[f+4>>2]=b;return 5242980}function mB(a){a=a|0;var b=0.0,c=0.0;b=+g[a>>2];c=+g[a+4>>2];return+(+O(+(b*b+c*c)))}function mC(a){a=a|0;if((a|0)==0){return}pl(a);return}function mD(b){b=b|0;var d=0.0,e=0,f=0;do{if(a[5262356]<<24>>24==0){if((aE(5262356)|0)==0){break}}}while(0);d=-0.0- +g[b+4>>2];e=(g[k>>2]=-0.0- +g[b>>2],c[k>>2]|0);b=(g[k>>2]=d,c[k>>2]|0)|0;f=5242972;c[f>>2]=0|e;c[f+4>>2]=b;return 5242972}function mE(a){a=a|0;if((a|0)==0){return}pl(a);return}function mF(){return pp(12)|0}function mG(a,b,c){a=+a;b=+b;c=+c;var d=0;d=pp(12)|0;g[d>>2]=a;g[d+4>>2]=b;g[d+8>>2]=c;return d|0}function mH(b){b=b|0;var c=0.0,d=0.0;do{if(a[5262348]<<24>>24==0){if((aE(5262348)|0)==0){break}}}while(0);c=-0.0- +g[b+4>>2];d=-0.0- +g[b+8>>2];g[1310740]=-0.0- +g[b>>2];g[1310741]=c;g[1310742]=d;return 5242960}function mI(a,b,c){a=a|0;b=b|0;c=c|0;bI(a,b,c);return}function mJ(){var a=0;a=pp(28)|0;c[a+16>>2]=0;c[a+20>>2]=0;g[a+24>>2]=0.0;return a|0}function mK(a){a=a|0;if((a|0)==0){return}pl(a);return}function mL(a,b){a=a|0;b=b|0;var d=0;do{if((b|0)>-1){if((c[a+20>>2]|0)>(b|0)){break}else{d=1083;break}}else{d=1083}}while(0);if((d|0)==1083){aH(5248456,103,5254292,5247472)}return(c[a+16>>2]|0)+(b<<3)|0}function mM(a){a=a|0;if((a|0)==0){return}pl(a);return}function mN(){var d=0;d=pp(28)|0;b[d+22>>1]=1;b[d+24>>1]=-1;b[d+26>>1]=0;c[d>>2]=0;c[d+4>>2]=0;g[d+8>>2]=.20000000298023224;g[d+12>>2]=0.0;g[d+16>>2]=0.0;a[d+20|0]=0;return d|0}function mO(a,c){a=a|0;c=c|0;var d=0;d=a+22|0;a=c;b[d>>1]=b[a>>1]|0;b[d+2>>1]=b[a+2>>1]|0;b[d+4>>1]=b[a+4>>1]|0;return}function mP(){var b=0,d=0,e=0;b=pp(72)|0;d=b;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;a[b+16|0]=0;c[b>>2]=2;e=b+20|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;g[b+36>>2]=1.0;g[b+40>>2]=0.0;g[b+44>>2]=0.0;a[b+48|0]=0;g[b+52>>2]=0.0;g[b+56>>2]=0.0;a[b+60|0]=0;g[b+64>>2]=0.0;g[b+68>>2]=0.0;return d|0}function mQ(a){a=a|0;if((a|0)==0){return}pl(a);return}function mR(a){a=a|0;if((a|0)==0){return}pl(a);return}function mS(a,b){a=a|0;b=+b;g[a>>2]=+R(+b);g[a+4>>2]=+Q(+b);return}function mT(a){a=a|0;return+(+W(+(+g[a>>2]),+(+g[a+4>>2])))}function mU(b){b=b|0;var d=0.0,e=0,f=0;do{if(a[5262332]<<24>>24==0){if((aE(5262332)|0)==0){break}}}while(0);d=+g[b+4>>2];e=(g[k>>2]=-0.0- +g[b>>2],c[k>>2]|0);b=(g[k>>2]=d,c[k>>2]|0)|0;f=5242952;c[f>>2]=0|e;c[f+4>>2]=b;return 5242952}function mV(b){b=b|0;var d=0.0,e=0,f=0;do{if(a[5262340]<<24>>24==0){if((aE(5262340)|0)==0){break}}}while(0);d=+g[b>>2];e=(g[k>>2]=+g[b+4>>2],c[k>>2]|0);b=(g[k>>2]=d,c[k>>2]|0)|0;f=5242944;c[f>>2]=0|e;c[f+4>>2]=b;return 5242944}function mW(){return pp(8)|0}function mX(a){a=+a;var b=0;b=pp(8)|0;g[b>>2]=+R(+a);g[b+4>>2]=+Q(+a);return b|0}function mY(a){a=a|0;if((a|0)==0){return}pl(a);return}function mZ(a){a=a|0;return a+28|0}function m_(a){a=a|0;return+(+g[a+60>>2])}function m$(b,c){b=b|0;c=c|0;a[b+44|0]=c&1;return}function m0(a,b){a=a|0;b=+b;g[a+56>>2]=b;return}function m1(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0,l=0.0,m=0.0,n=0,o=0.0,p=0,q=0;c[a+8>>2]=b;c[a+12>>2]=d;h=e|0;i=+g[h>>2]- +g[b+12>>2];j=e+4|0;l=+g[j>>2]- +g[b+16>>2];e=b+24|0;m=+g[e>>2];n=b+20|0;o=+g[n>>2];b=a+20|0;p=(g[k>>2]=i*m+l*o,c[k>>2]|0);q=(g[k>>2]=m*l+i*(-0.0-o),c[k>>2]|0)|0;c[b>>2]=0|p;c[b+4>>2]=q;o=+g[h>>2]- +g[d+12>>2];i=+g[j>>2]- +g[d+16>>2];l=+g[d+24>>2];m=+g[d+20>>2];d=a+28|0;j=(g[k>>2]=o*l+i*m,c[k>>2]|0);h=(g[k>>2]=l*i+o*(-0.0-m),c[k>>2]|0)|0;c[d>>2]=0|j;c[d+4>>2]=h;m=+g[e>>2];o=+g[f>>2];i=+g[n>>2];l=+g[f+4>>2];f=a+36|0;a=(g[k>>2]=m*o+i*l,c[k>>2]|0);n=(g[k>>2]=o*(-0.0-i)+m*l,c[k>>2]|0)|0;c[f>>2]=0|a;c[f+4>>2]=n;return}function m2(a,b){a=a|0;b=+b;g[a+60>>2]=b;return}function m3(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+36|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function m4(a){a=a|0;return+(+g[a+52>>2])}function m5(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function m6(a){a=a|0;return+(+g[a+44>>2])}function m7(a,b){a=a|0;b=+b;g[a+48>>2]=b;return}function m8(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function m9(b){b=b|0;return(a[b+40|0]&1)<<24>>24!=0|0}function na(a,b){a=a|0;b=+b;g[a+44>>2]=b;return}function nb(b){b=b|0;return(a[b+52|0]&1)<<24>>24!=0|0}function nc(a,b){a=a|0;b=+b;g[a+56>>2]=b;return}function nd(a){a=a|0;return+(+g[a+48>>2])}function ne(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function nf(a,b){a=a|0;b=+b;g[a+60>>2]=b;return}function ng(a){a=a|0;return a+20|0}function nh(a){a=a|0;return+(+g[a+36>>2])}function ni(a){a=a|0;return a+28|0}function nj(b,c){b=b|0;c=c|0;a[b+40|0]=c&1;return}function nk(b,c){b=b|0;c=c|0;a[b+52|0]=c&1;return}function nl(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0.0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0;c[a+8>>2]=b;c[a+12>>2]=d;f=e|0;h=+g[f>>2]- +g[b+12>>2];i=e+4|0;j=+g[i>>2]- +g[b+16>>2];l=+g[b+24>>2];m=+g[b+20>>2];e=a+20|0;n=(g[k>>2]=h*l+j*m,c[k>>2]|0);o=(g[k>>2]=l*j+h*(-0.0-m),c[k>>2]|0)|0;c[e>>2]=0|n;c[e+4>>2]=o;m=+g[f>>2]- +g[d+12>>2];h=+g[i>>2]- +g[d+16>>2];j=+g[d+24>>2];l=+g[d+20>>2];i=a+28|0;f=(g[k>>2]=m*j+h*l,c[k>>2]|0);o=(g[k>>2]=j*h+m*(-0.0-l),c[k>>2]|0)|0;c[i>>2]=0|f;c[i+4>>2]=o;g[a+36>>2]=+g[d+56>>2]- +g[b+56>>2];return}function nm(a){a=a|0;return+(+g[a+60>>2])}function nn(a){a=a|0;return+(+g[a+56>>2])}function no(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+36|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function np(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+44|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function nq(a){a=a|0;return+(+g[a+60>>2])}function nr(a){a=a|0;return+(+g[a+56>>2])}function ns(a){a=a|0;return+(+g[a+52>>2])}function nt(a){a=a|0;return a+36|0}function nu(a,b){a=a|0;b=+b;g[a+60>>2]=b;return}function nv(a){a=a|0;return a+44|0}function nw(a){a=a|0;return a+28|0}function nx(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function ny(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function nz(a,b){a=a|0;b=+b;g[a+56>>2]=b;return}function nA(a,b){a=a|0;b=+b;g[a+52>>2]=b;return}function nB(a){a=a|0;return a+20|0}function nC(a){a=a|0;return c[a+8>>2]|0}function nD(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function nE(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function nF(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function nG(a){a=a|0;return c[a+12>>2]|0}function nH(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function nI(b){b=b|0;return(a[b+16|0]&1)<<24>>24!=0|0}function nJ(a){a=a|0;return c[a>>2]|0}function nK(b,c){b=b|0;c=c|0;a[b+16|0]=c&1;return}function nL(a){a=a|0;return c[a+4>>2]|0}function nM(a,b){a=a|0;b=b|0;var d=0;d=b;b=a;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function nN(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+8|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function nO(a){a=a|0;return a|0}function nP(a){a=a|0;return a+8|0}function nQ(a){a=a|0;g[a>>2]=0.0;g[a+4>>2]=0.0;g[a+8>>2]=0.0;g[a+12>>2]=1.0;return}function nR(a,b){a=a|0;b=+b;g[a+8>>2]=b;return}function nS(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;g[a>>2]=b;g[a+4>>2]=c;g[a+8>>2]=d;return}function nT(a){a=a|0;return+(+g[a+8>>2])}function nU(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function nV(a){a=a|0;return+(+g[a+40>>2])}function nW(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function nX(a,b){a=a|0;b=+b;g[a+44>>2]=b;return}function nY(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function nZ(a){a=a|0;return a+20|0}function n_(a){a=a|0;return+(+g[a+36>>2])}function n$(a){a=a|0;return a+28|0}function n0(a){a=a|0;return+(+g[a+44>>2])}function n1(a,b){a=a|0;b=+b;g[a+40>>2]=b;return}function n2(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,h=0.0,i=0,j=0.0,l=0.0,m=0.0,n=0,o=0;c[a+8>>2]=b;c[a+12>>2]=d;f=e|0;h=+g[f>>2]- +g[b+12>>2];i=e+4|0;j=+g[i>>2]- +g[b+16>>2];l=+g[b+24>>2];m=+g[b+20>>2];e=a+20|0;n=(g[k>>2]=h*l+j*m,c[k>>2]|0);o=(g[k>>2]=l*j+h*(-0.0-m),c[k>>2]|0)|0;c[e>>2]=0|n;c[e+4>>2]=o;m=+g[f>>2]- +g[d+12>>2];h=+g[i>>2]- +g[d+16>>2];j=+g[d+24>>2];l=+g[d+20>>2];i=a+28|0;f=(g[k>>2]=m*j+h*l,c[k>>2]|0);o=(g[k>>2]=j*h+m*(-0.0-l),c[k>>2]|0)|0;c[i>>2]=0|f;c[i+4>>2]=o;g[a+36>>2]=+g[d+56>>2]- +g[b+56>>2];return}function n3(a){a=a|0;return+(+g[a+32>>2])}function n4(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function n5(a){a=a|0;return+(+g[a+28>>2])}function n6(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function n7(a,b){a=a|0;b=+b;g[a+28>>2]=b;return}function n8(a){a=a|0;return a+20|0}function n9(a,b){a=a|0;b=+b;g[a+32>>2]=b;return}function oa(a){a=a|0;return+(+g[a+36>>2])}function ob(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function oc(a){a=a|0;return+(+g[a+36>>2])}function od(a){a=a|0;return+(+g[a+40>>2])}function oe(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function of(a,b){a=a|0;b=+b;g[a+44>>2]=b;return}function og(a){a=a|0;return a+20|0}function oh(a){a=a|0;return a+28|0}function oi(a){a=a|0;return+(+g[a+44>>2])}function oj(){var b=0,d=0,e=0;b=pp(64)|0;d=b;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;a[b+16|0]=0;c[b>>2]=7;e=b+20|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;g[b+36>>2]=1.0;g[b+40>>2]=0.0;a[b+44|0]=0;g[b+48>>2]=0.0;g[b+52>>2]=0.0;g[b+56>>2]=2.0;g[b+60>>2]=.699999988079071;return d|0}function ok(a){a=a|0;if((a|0)==0){return}pl(a);return}function ol(){var b=0,d=0,e=0;b=pp(64)|0;d=b;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;a[b+16|0]=0;c[b>>2]=1;e=b+20|0;g[b+44>>2]=0.0;g[b+48>>2]=0.0;g[b+60>>2]=0.0;g[b+56>>2]=0.0;a[b+52|0]=0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;a[e+20|0]=0;return d|0}function om(a){a=a|0;if((a|0)==0){return}pl(a);return}function on(){var b=0;b=pp(64)|0;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;c[b>>2]=4;g[b+20>>2]=-1.0;g[b+24>>2]=1.0;g[b+28>>2]=1.0;g[b+32>>2]=1.0;g[b+36>>2]=-1.0;g[b+40>>2]=0.0;g[b+44>>2]=1.0;g[b+48>>2]=0.0;g[b+52>>2]=0.0;g[b+56>>2]=0.0;g[b+60>>2]=1.0;a[b+16|0]=1;return b|0}function oo(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;e7(a,b,c,d,e,f,g,h);return}function op(a){a=a|0;if((a|0)==0){return}pl(a);return}function oq(){var b=0,d=0;b=pp(20)|0;d=b;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;a[b+16|0]=0;return d|0}function or(a){a=a|0;if((a|0)==0){return}pl(a);return}function os(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0;e=b;b=a;f=c[e+4>>2]|0;c[b>>2]=c[e>>2]|0;c[b+4>>2]=f;g[a+8>>2]=+R(+d);g[a+12>>2]=+Q(+d);return}function ot(){return pp(16)|0}function ou(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=pp(16)|0;e=a;a=d;f=c[e+4>>2]|0;c[a>>2]=c[e>>2]|0;c[a+4>>2]=f;f=b;b=d+8|0;a=c[f+4>>2]|0;c[b>>2]=c[f>>2]|0;c[b+4>>2]=a;return d|0}function ov(a){a=a|0;if((a|0)==0){return}pl(a);return}function ow(){return pp(12)|0}function ox(a,b,c){a=+a;b=+b;c=+c;var d=0;d=pp(12)|0;g[d>>2]=a;g[d+4>>2]=b;g[d+8>>2]=c;return d|0}function oy(a){a=a|0;if((a|0)==0){return}pl(a);return}function oz(){var b=0,d=0,e=0;b=pp(48)|0;d=b;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;a[b+16|0]=0;c[b>>2]=8;e=b+20|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;c[e+16>>2]=0;c[e+20>>2]=0;c[e+24>>2]=0;return d|0}function oA(a){a=a|0;if((a|0)==0){return}pl(a);return}function oB(){var b=0,d=0;b=pp(40)|0;d=b;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;a[b+16|0]=0;c[b>>2]=5;g[b+20>>2]=0.0;g[b+24>>2]=0.0;g[b+28>>2]=0.0;g[b+32>>2]=5.0;g[b+36>>2]=.699999988079071;return d|0}function oC(a){a=a|0;if((a|0)==0){return}pl(a);return}function oD(){var b=0,d=0,e=0;b=pp(48)|0;d=b;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;a[b+16|0]=0;c[b>>2]=3;e=b+20|0;c[e>>2]=0;c[e+4>>2]=0;c[e+8>>2]=0;c[e+12>>2]=0;g[b+36>>2]=1.0;g[b+40>>2]=0.0;g[b+44>>2]=0.0;return d|0}function oE(a){a=a|0;return}function oF(a){a=a|0;return}function oG(a){a=a|0;return}function oH(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function oI(a,b){a=a|0;b=+b;g[a+40>>2]=b;return}function oJ(a,b){a=a|0;b=b|0;c[a+20>>2]=b;return}function oK(a,b){a=a|0;b=b|0;c[a+24>>2]=b;return}function oL(a,b){a=a|0;b=+b;g[a+28>>2]=b;return}function oM(a){a=a|0;return c[a+20>>2]|0}function oN(a){a=a|0;return c[a+24>>2]|0}function oO(a){a=a|0;return+(+g[a+28>>2])}function oP(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function oQ(a){a=a|0;return c[a+8>>2]|0}function oR(a){a=a|0;return c[a>>2]|0}function oS(a,b){a=a|0;b=b|0;c[a+8>>2]=b;return}function oT(a){a=a|0;return c[a+12>>2]|0}function oU(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function oV(a,b){a=a|0;b=b|0;c[a+12>>2]=b;return}function oW(a){a=a|0;return c[a+4>>2]|0}function oX(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+20|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function oY(a){a=a|0;return+(+g[a+36>>2])}function oZ(a,b){a=a|0;b=b|0;var d=0;d=b;b=a+28|0;a=c[d+4>>2]|0;c[b>>2]=c[d>>2]|0;c[b+4>>2]=a;return}function o_(a){a=a|0;return a+20|0}function o$(a){a=a|0;return a+28|0}function o0(a,b){a=a|0;b=+b;g[a+36>>2]=b;return}function o1(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((c[d+8>>2]|0)!=(b|0)){return}b=d+16|0;g=c[b>>2]|0;if((g|0)==0){c[b>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((g|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function o2(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;if((c[d+8>>2]|0)==(b|0)){if((c[d+4>>2]|0)!=(e|0)){return}g=d+28|0;if((c[g>>2]|0)==1){return}c[g>>2]=f;return}if((c[d>>2]|0)!=(b|0)){return}do{if((c[d+16>>2]|0)!=(e|0)){b=d+20|0;if((c[b>>2]|0)==(e|0)){break}c[d+32>>2]=f;c[b>>2]=e;b=d+40|0;c[b>>2]=(c[b>>2]|0)+1|0;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){break}a[d+54|0]=1}}while(0);c[d+44>>2]=4;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function o3(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0;if((c[d+8>>2]|0)!=(b|0)){return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;b=c[f>>2]|0;if((b|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;a[d+54|0]=1;return}e=d+24|0;b=c[e>>2]|0;if((b|0)==2){c[e>>2]=g;i=g}else{i=b}if(!((c[d+48>>2]|0)==1&(i|0)==1)){return}a[d+54|0]=1;return}function o4(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var h=0,i=0.0,j=0,l=0.0,m=0.0,n=0.0,o=0;c[a+8>>2]=b;c[a+12>>2]=d;h=e|0;i=+g[h>>2]- +g[b+12>>2];j=e+4|0;l=+g[j>>2]- +g[b+16>>2];m=+g[b+24>>2];n=+g[b+20>>2];b=a+20|0;e=(g[k>>2]=i*m+l*n,c[k>>2]|0);o=(g[k>>2]=m*l+i*(-0.0-n),c[k>>2]|0)|0;c[b>>2]=0|e;c[b+4>>2]=o;o=f|0;n=+g[o>>2]- +g[d+12>>2];b=f+4|0;i=+g[b>>2]- +g[d+16>>2];l=+g[d+24>>2];m=+g[d+20>>2];d=a+28|0;f=(g[k>>2]=n*l+i*m,c[k>>2]|0);e=(g[k>>2]=l*i+n*(-0.0-m),c[k>>2]|0)|0;c[d>>2]=0|f;c[d+4>>2]=e;m=+g[o>>2]- +g[h>>2];n=+g[b>>2]- +g[j>>2];g[a+36>>2]=+O(+(m*m+n*n));return}function o5(a){a=a|0;if((a|0)==0){return}pl(a);return}function o6(){var b=0,d=0;b=pp(32)|0;d=b;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;a[b+16|0]=0;c[b>>2]=6;c[b+20>>2]=0;c[b+24>>2]=0;g[b+28>>2]=1.0;return d|0}function o7(a){a=a|0;if((a|0)==0){return}pl(a);return}function o8(){return pp(16)|0}function o9(a){a=a|0;if((a|0)==0){return}pl(a);return}function pa(){var b=0,d=0;b=pp(40)|0;d=b;c[b>>2]=0;c[b+4>>2]=0;c[b+8>>2]=0;c[b+12>>2]=0;a[b+16|0]=0;c[b>>2]=10;g[b+20>>2]=-1.0;g[b+24>>2]=0.0;g[b+28>>2]=1.0;g[b+32>>2]=0.0;g[b+36>>2]=0.0;return d|0}function pb(a){a=a|0;pl(a);return}function pc(a){a=a|0;pl(a);return}function pd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;i=i+56|0;f=e|0;do{if((a|0)==(b|0)){g=1}else{if((b|0)==0){g=0;break}h=pf(b,5261036,5261024,-1)|0;j=h;if((h|0)==0){g=0;break}pr(f|0,0,56);c[f>>2]=j;c[f+8>>2]=a;c[f+12>>2]=-1;c[f+48>>2]=1;bj[c[(c[h>>2]|0)+28>>2]&2047](j,f,c[d>>2]|0,1);if((c[f+24>>2]|0)!=1){g=0;break}c[d>>2]=c[f+16>>2]|0;g=1}}while(0);i=e;return g|0}function pe(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;if((b|0)!=(c[d+8>>2]|0)){g=c[b+8>>2]|0;bj[c[(c[g>>2]|0)+28>>2]&2047](g,d,e,f);return}g=d+16|0;b=c[g>>2]|0;if((b|0)==0){c[g>>2]=e;c[d+24>>2]=f;c[d+36>>2]=1;return}if((b|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;c[d+24>>2]=2;a[d+54|0]=1;return}e=d+24|0;if((c[e>>2]|0)!=2){return}c[e>>2]=f;return}function pf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+56|0;g=f|0;h=c[a>>2]|0;j=a+(c[h-8>>2]|0)|0;k=c[h-4>>2]|0;h=k;c[g>>2]=d;c[g+4>>2]=a;c[g+8>>2]=b;c[g+12>>2]=e;e=g+16|0;b=g+20|0;a=g+24|0;l=g+28|0;m=g+32|0;n=g+40|0;pr(e|0,0,39);if((k|0)==(d|0)){c[g+48>>2]=1;a5[c[(c[k>>2]|0)+20>>2]&2047](h,g,j,j,1,0);i=f;return((c[a>>2]|0)==1?j:0)|0}aS[c[(c[k>>2]|0)+24>>2]&2047](h,g,j,1,0);j=c[g+36>>2]|0;do{if((j|0)==0){if((c[n>>2]|0)!=1){o=0;break}if((c[l>>2]|0)!=1){o=0;break}o=(c[m>>2]|0)==1?c[b>>2]|0:0}else if((j|0)==1){if((c[a>>2]|0)!=1){if((c[n>>2]|0)!=0){o=0;break}if((c[l>>2]|0)!=1){o=0;break}if((c[m>>2]|0)!=1){o=0;break}}o=c[e>>2]|0}else{o=0}}while(0);i=f;return o|0}function pg(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0;h=b|0;if((h|0)==(c[d+8>>2]|0)){if((c[d+4>>2]|0)!=(e|0)){return}i=d+28|0;if((c[i>>2]|0)==1){return}c[i>>2]=f;return}if((h|0)!=(c[d>>2]|0)){h=c[b+8>>2]|0;aS[c[(c[h>>2]|0)+24>>2]&2047](h,d,e,f,g);return}do{if((c[d+16>>2]|0)!=(e|0)){h=d+20|0;if((c[h>>2]|0)==(e|0)){break}c[d+32>>2]=f;i=d+44|0;if((c[i>>2]|0)==4){return}j=d+52|0;a[j]=0;k=d+53|0;a[k]=0;l=c[b+8>>2]|0;a5[c[(c[l>>2]|0)+20>>2]&2047](l,d,e,e,1,g);do{if((a[k]&1)<<24>>24==0){m=0;n=1402}else{if((a[j]&1)<<24>>24==0){m=1;n=1402;break}else{break}}}while(0);L1589:do{if((n|0)==1402){c[h>>2]=e;j=d+40|0;c[j>>2]=(c[j>>2]|0)+1|0;do{if((c[d+36>>2]|0)==1){if((c[d+24>>2]|0)!=2){n=1405;break}a[d+54|0]=1;if(m){break L1589}else{break}}else{n=1405}}while(0);if((n|0)==1405){if(m){break}}c[i>>2]=4;return}}while(0);c[i>>2]=3;return}}while(0);if((f|0)!=1){return}c[d+32>>2]=1;return}function ph(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0;if((b|0)!=(c[d+8>>2]|0)){i=c[b+8>>2]|0;a5[c[(c[i>>2]|0)+20>>2]&2047](i,d,e,f,g,h);return}a[d+53|0]=1;if((c[d+4>>2]|0)!=(f|0)){return}a[d+52|0]=1;f=d+16|0;h=c[f>>2]|0;if((h|0)==0){c[f>>2]=e;c[d+24>>2]=g;c[d+36>>2]=1;if(!((c[d+48>>2]|0)==1&(g|0)==1)){return}a[d+54|0]=1;return}if((h|0)!=(e|0)){e=d+36|0;c[e>>2]=(c[e>>2]|0)+1|0;a[d+54|0]=1;return}e=d+24|0;h=c[e>>2]|0;if((h|0)==2){c[e>>2]=g;j=g}else{j=h}if(!((c[d+48>>2]|0)==1&(j|0)==1)){return}a[d+54|0]=1;return}
function pi(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,al=0,am=0,an=0,ao=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[1313369]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=5253516+(h<<2)|0;j=5253516+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[1313369]=e&(1<<g^-1)}else{if(l>>>0<(c[1313373]|0)>>>0){ak();return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{ak();return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[1313371]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=5253516+(p<<2)|0;m=5253516+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[1313369]=e&(1<<r^-1)}else{if(l>>>0<(c[1313373]|0)>>>0){ak();return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{ak();return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[1313371]|0;if((l|0)!=0){q=c[1313374]|0;d=l>>>3;l=d<<1;f=5253516+(l<<2)|0;k=c[1313369]|0;h=1<<d;do{if((k&h|0)==0){c[1313369]=k|h;s=f;t=5253516+(l+2<<2)|0}else{d=5253516+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[1313373]|0)>>>0){s=g;t=d;break}ak();return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[1313371]=m;c[1313374]=e;n=i;return n|0}l=c[1313370]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[5253780+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[1313373]|0;if(r>>>0<i>>>0){ak();return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){ak();return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;L1687:do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;do{if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break L1687}else{w=l;x=k;break}}else{w=g;x=q}}while(0);while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){ak();return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){ak();return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){ak();return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{ak();return 0}}}while(0);L1709:do{if((e|0)!=0){f=d+28|0;i=5253780+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[1313370]=c[1313370]&(1<<c[f>>2]^-1);break L1709}else{if(e>>>0<(c[1313373]|0)>>>0){ak();return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L1709}}}while(0);if(v>>>0<(c[1313373]|0)>>>0){ak();return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[1313373]|0)>>>0){ak();return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[1313373]|0)>>>0){ak();return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4|0)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b|0)>>2]=p;f=c[1313371]|0;if((f|0)!=0){e=c[1313374]|0;i=f>>>3;f=i<<1;q=5253516+(f<<2)|0;k=c[1313369]|0;g=1<<i;do{if((k&g|0)==0){c[1313369]=k|g;y=q;z=5253516+(f+2<<2)|0}else{i=5253516+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[1313373]|0)>>>0){y=l;z=i;break}ak();return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[1313371]=p;c[1313374]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[1313370]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=(14-(h|f|l)|0)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[5253780+(A<<2)>>2]|0;L1757:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L1757}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break L1757}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[5253780+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}L1772:do{if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break L1772}else{p=r;m=i;q=e}}}}while(0);if((K|0)==0){o=g;break}if(J>>>0>=((c[1313371]|0)-g|0)>>>0){o=g;break}k=K;q=c[1313373]|0;if(k>>>0<q>>>0){ak();return 0}m=k+g|0;p=m;if(k>>>0>=m>>>0){ak();return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;L1785:do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;do{if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break L1785}else{M=B;N=j;break}}else{M=d;N=r}}while(0);while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<q>>>0){ak();return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<q>>>0){ak();return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){ak();return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{ak();return 0}}}while(0);L1807:do{if((e|0)!=0){i=K+28|0;q=5253780+(c[i>>2]<<2)|0;do{if((K|0)==(c[q>>2]|0)){c[q>>2]=L;if((L|0)!=0){break}c[1313370]=c[1313370]&(1<<c[i>>2]^-1);break L1807}else{if(e>>>0<(c[1313373]|0)>>>0){ak();return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L1807}}}while(0);if(L>>>0<(c[1313373]|0)>>>0){ak();return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[1313373]|0)>>>0){ak();return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[1313373]|0)>>>0){ak();return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=k+(e+4|0)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[k+(g|4)>>2]=J|1;c[k+(J+g|0)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;q=5253516+(e<<2)|0;r=c[1313369]|0;j=1<<i;do{if((r&j|0)==0){c[1313369]=r|j;O=q;P=5253516+(e+2<<2)|0}else{i=5253516+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[1313373]|0)>>>0){O=d;P=i;break}ak();return 0}}while(0);c[P>>2]=p;c[O+12>>2]=p;c[k+(g+8|0)>>2]=O;c[k+(g+12|0)>>2]=q;break}e=m;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=(14-(d|r|i)|0)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=5253780+(Q<<2)|0;c[k+(g+28|0)>>2]=Q;c[k+(g+20|0)>>2]=0;c[k+(g+16|0)>>2]=0;q=c[1313370]|0;l=1<<Q;if((q&l|0)==0){c[1313370]=q|l;c[j>>2]=e;c[k+(g+24|0)>>2]=j;c[k+(g+12|0)>>2]=e;c[k+(g+8|0)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;q=c[j>>2]|0;while(1){if((c[q+4>>2]&-8|0)==(J|0)){break}S=q+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=1589;break}else{l=l<<1;q=j}}if((T|0)==1589){if(S>>>0<(c[1313373]|0)>>>0){ak();return 0}else{c[S>>2]=e;c[k+(g+24|0)>>2]=q;c[k+(g+12|0)>>2]=e;c[k+(g+8|0)>>2]=e;break}}l=q+8|0;j=c[l>>2]|0;i=c[1313373]|0;if(q>>>0<i>>>0){ak();return 0}if(j>>>0<i>>>0){ak();return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[k+(g+8|0)>>2]=j;c[k+(g+12|0)>>2]=q;c[k+(g+24|0)>>2]=0;break}}}while(0);k=K+8|0;if((k|0)==0){o=g;break}else{n=k}return n|0}}while(0);K=c[1313371]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[1313374]|0;if(S>>>0>15){R=J;c[1313374]=R+o|0;c[1313371]=S;c[R+(o+4|0)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[1313371]=0;c[1313374]=0;c[J+4>>2]=K|3;S=J+(K+4|0)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[1313372]|0;if(o>>>0<J>>>0){S=J-o|0;c[1313372]=S;J=c[1313375]|0;K=J;c[1313375]=K+o|0;c[K+(o+4|0)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[1310753]|0)==0){J=ap(8)|0;if((J-1&J|0)==0){c[1310755]=J;c[1310754]=J;c[1310756]=-1;c[1310757]=2097152;c[1310758]=0;c[1313480]=0;c[1310753]=aB(0)&-16^1431655768;break}else{ak();return 0}}}while(0);J=o+48|0;S=c[1310755]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[1313479]|0;do{if((O|0)!=0){P=c[1313477]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L1899:do{if((c[1313480]&4|0)==0){O=c[1313375]|0;L1901:do{if((O|0)==0){T=1619}else{L=O;P=5253924;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=1619;break L1901}else{P=M}}if((P|0)==0){T=1619;break}L=R-(c[1313372]|0)&Q;if(L>>>0>=2147483647){W=0;break}q=aK(L|0)|0;e=(q|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?q:-1;Y=e?L:0;Z=q;_=L;T=1628;break}}while(0);do{if((T|0)==1619){O=aK(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[1310754]|0;q=L-1|0;if((q&g|0)==0){$=S}else{$=(S-g|0)+(q+g&-L)|0}L=c[1313477]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}q=c[1313479]|0;if((q|0)!=0){if(g>>>0<=L>>>0|g>>>0>q>>>0){W=0;break}}q=aK($|0)|0;g=(q|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=q;_=$;T=1628;break}}while(0);L1921:do{if((T|0)==1628){q=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=1639;break L1899}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[1310755]|0;O=(K-_|0)+g&-g;if(O>>>0>=2147483647){ac=_;break}if((aK(O|0)|0)==-1){aK(q|0);W=Y;break L1921}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=1639;break L1899}}}while(0);c[1313480]=c[1313480]|4;ad=W;T=1636;break}else{ad=0;T=1636}}while(0);do{if((T|0)==1636){if(S>>>0>=2147483647){break}W=aK(S|0)|0;Z=aK(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)==-1){break}else{aa=Z?ac:ad;ab=Y;T=1639;break}}}while(0);do{if((T|0)==1639){ad=(c[1313477]|0)+aa|0;c[1313477]=ad;if(ad>>>0>(c[1313478]|0)>>>0){c[1313478]=ad}ad=c[1313375]|0;L1941:do{if((ad|0)==0){S=c[1313373]|0;if((S|0)==0|ab>>>0<S>>>0){c[1313373]=ab}c[1313481]=ab;c[1313482]=aa;c[1313484]=0;c[1313378]=c[1310753]|0;c[1313377]=-1;S=0;while(1){Y=S<<1;ac=5253516+(Y<<2)|0;c[5253516+(Y+3<<2)>>2]=ac;c[5253516+(Y+2<<2)>>2]=ac;ac=S+1|0;if((ac|0)==32){break}else{S=ac}}S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=(aa-40|0)-ae|0;c[1313375]=ab+ae|0;c[1313372]=S;c[ab+(ae+4|0)>>2]=S|1;c[ab+(aa-36|0)>>2]=40;c[1313376]=c[1310757]|0}else{S=5253924;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=1651;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==1651){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa|0;ac=c[1313375]|0;Y=(c[1313372]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[1313375]=Z+ai|0;c[1313372]=W;c[Z+(ai+4|0)>>2]=W|1;c[Z+(Y+4|0)>>2]=40;c[1313376]=c[1310757]|0;break L1941}}while(0);if(ab>>>0<(c[1313373]|0)>>>0){c[1313373]=ab}S=ab+aa|0;Y=5253924;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=1661;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==1661){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa|0;S=ab+8|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(aa+8|0)|0;if((S&7|0)==0){am=0}else{am=-S&7}S=ab+(am+aa|0)|0;Z=S;W=al+o|0;ac=ab+W|0;_=ac;K=(S-(ab+al|0)|0)-o|0;c[ab+(al+4|0)>>2]=o|3;do{if((Z|0)==(c[1313375]|0)){J=(c[1313372]|0)+K|0;c[1313372]=J;c[1313375]=_;c[ab+(W+4|0)>>2]=J|1}else{if((Z|0)==(c[1313374]|0)){J=(c[1313371]|0)+K|0;c[1313371]=J;c[1313374]=_;c[ab+(W+4|0)>>2]=J|1;c[ab+(J+W|0)>>2]=J;break}J=aa+4|0;X=c[ab+(J+am|0)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L1986:do{if(X>>>0<256){U=c[ab+((am|8)+aa|0)>>2]|0;Q=c[ab+((aa+12|0)+am|0)>>2]|0;R=5253516+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[1313373]|0)>>>0){ak();return 0}if((c[U+12>>2]|0)==(Z|0)){break}ak();return 0}}while(0);if((Q|0)==(U|0)){c[1313369]=c[1313369]&(1<<V^-1);break}do{if((Q|0)==(R|0)){an=Q+8|0}else{if(Q>>>0<(c[1313373]|0)>>>0){ak();return 0}q=Q+8|0;if((c[q>>2]|0)==(Z|0)){an=q;break}ak();return 0}}while(0);c[U+12>>2]=Q;c[an>>2]=U}else{R=S;q=c[ab+((am|24)+aa|0)>>2]|0;P=c[ab+((aa+12|0)+am|0)>>2]|0;L2007:do{if((P|0)==(R|0)){O=am|16;g=ab+(J+O|0)|0;L=c[g>>2]|0;do{if((L|0)==0){e=ab+(O+aa|0)|0;M=c[e>>2]|0;if((M|0)==0){ao=0;break L2007}else{aq=M;ar=e;break}}else{aq=L;ar=g}}while(0);while(1){g=aq+20|0;L=c[g>>2]|0;if((L|0)!=0){aq=L;ar=g;continue}g=aq+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{aq=L;ar=g}}if(ar>>>0<(c[1313373]|0)>>>0){ak();return 0}else{c[ar>>2]=0;ao=aq;break}}else{g=c[ab+((am|8)+aa|0)>>2]|0;if(g>>>0<(c[1313373]|0)>>>0){ak();return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){ak();return 0}O=P+8|0;if((c[O>>2]|0)==(R|0)){c[L>>2]=P;c[O>>2]=g;ao=P;break}else{ak();return 0}}}while(0);if((q|0)==0){break}P=ab+((aa+28|0)+am|0)|0;U=5253780+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=ao;if((ao|0)!=0){break}c[1313370]=c[1313370]&(1<<c[P>>2]^-1);break L1986}else{if(q>>>0<(c[1313373]|0)>>>0){ak();return 0}Q=q+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=ao}else{c[q+20>>2]=ao}if((ao|0)==0){break L1986}}}while(0);if(ao>>>0<(c[1313373]|0)>>>0){ak();return 0}c[ao+24>>2]=q;R=am|16;P=c[ab+(R+aa|0)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[1313373]|0)>>>0){ak();return 0}else{c[ao+16>>2]=P;c[P+24>>2]=ao;break}}}while(0);P=c[ab+(J+R|0)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[1313373]|0)>>>0){ak();return 0}else{c[ao+20>>2]=P;c[P+24>>2]=ao;break}}}while(0);as=ab+(($|am)+aa|0)|0;at=$+K|0}else{as=Z;at=K}J=as+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4|0)>>2]=at|1;c[ab+(at+W|0)>>2]=at;J=at>>>3;if(at>>>0<256){V=J<<1;X=5253516+(V<<2)|0;P=c[1313369]|0;q=1<<J;do{if((P&q|0)==0){c[1313369]=P|q;au=X;av=5253516+(V+2<<2)|0}else{J=5253516+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[1313373]|0)>>>0){au=U;av=J;break}ak();return 0}}while(0);c[av>>2]=_;c[au+12>>2]=_;c[ab+(W+8|0)>>2]=au;c[ab+(W+12|0)>>2]=X;break}V=ac;q=at>>>8;do{if((q|0)==0){aw=0}else{if(at>>>0>16777215){aw=31;break}P=(q+1048320|0)>>>16&8;$=q<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=(14-(J|P|$)|0)+(U<<$>>>15)|0;aw=at>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);q=5253780+(aw<<2)|0;c[ab+(W+28|0)>>2]=aw;c[ab+(W+20|0)>>2]=0;c[ab+(W+16|0)>>2]=0;X=c[1313370]|0;Q=1<<aw;if((X&Q|0)==0){c[1313370]=X|Q;c[q>>2]=V;c[ab+(W+24|0)>>2]=q;c[ab+(W+12|0)>>2]=V;c[ab+(W+8|0)>>2]=V;break}if((aw|0)==31){ax=0}else{ax=25-(aw>>>1)|0}Q=at<<ax;X=c[q>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(at|0)){break}ay=X+16+(Q>>>31<<2)|0;q=c[ay>>2]|0;if((q|0)==0){T=1734;break}else{Q=Q<<1;X=q}}if((T|0)==1734){if(ay>>>0<(c[1313373]|0)>>>0){ak();return 0}else{c[ay>>2]=V;c[ab+(W+24|0)>>2]=X;c[ab+(W+12|0)>>2]=V;c[ab+(W+8|0)>>2]=V;break}}Q=X+8|0;q=c[Q>>2]|0;$=c[1313373]|0;if(X>>>0<$>>>0){ak();return 0}if(q>>>0<$>>>0){ak();return 0}else{c[q+12>>2]=V;c[Q>>2]=V;c[ab+(W+8|0)>>2]=q;c[ab+(W+12|0)>>2]=X;c[ab+(W+24|0)>>2]=0;break}}}while(0);n=ab+(al|8)|0;return n|0}}while(0);Y=ad;W=5253924;while(1){az=c[W>>2]|0;if(az>>>0<=Y>>>0){aA=c[W+4>>2]|0;aC=az+aA|0;if(aC>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=az+(aA-39|0)|0;if((W&7|0)==0){aD=0}else{aD=-W&7}W=az+((aA-47|0)+aD|0)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aE=0}else{aE=-_&7}_=(aa-40|0)-aE|0;c[1313375]=ab+aE|0;c[1313372]=_;c[ab+(aE+4|0)>>2]=_|1;c[ab+(aa-36|0)>>2]=40;c[1313376]=c[1310757]|0;c[ac+4>>2]=27;c[W>>2]=c[1313481]|0;c[W+4>>2]=c[5253928>>2]|0;c[W+8>>2]=c[5253932>>2]|0;c[W+12>>2]=c[5253936>>2]|0;c[1313481]=ab;c[1313482]=aa;c[1313484]=0;c[1313483]=W;W=ac+28|0;c[W>>2]=7;L2105:do{if((ac+32|0)>>>0<aC>>>0){_=W;while(1){K=_+4|0;c[K>>2]=7;if((_+8|0)>>>0<aC>>>0){_=K}else{break L2105}}}}while(0);if((ac|0)==(Y|0)){break}W=ac-ad|0;_=Y+(W+4|0)|0;c[_>>2]=c[_>>2]&-2;c[ad+4>>2]=W|1;c[Y+W>>2]=W;_=W>>>3;if(W>>>0<256){K=_<<1;Z=5253516+(K<<2)|0;S=c[1313369]|0;q=1<<_;do{if((S&q|0)==0){c[1313369]=S|q;aF=Z;aG=5253516+(K+2<<2)|0}else{_=5253516+(K+2<<2)|0;Q=c[_>>2]|0;if(Q>>>0>=(c[1313373]|0)>>>0){aF=Q;aG=_;break}ak();return 0}}while(0);c[aG>>2]=ad;c[aF+12>>2]=ad;c[ad+8>>2]=aF;c[ad+12>>2]=Z;break}K=ad;q=W>>>8;do{if((q|0)==0){aH=0}else{if(W>>>0>16777215){aH=31;break}S=(q+1048320|0)>>>16&8;Y=q<<S;ac=(Y+520192|0)>>>16&4;_=Y<<ac;Y=(_+245760|0)>>>16&2;Q=(14-(ac|S|Y)|0)+(_<<Y>>>15)|0;aH=W>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);q=5253780+(aH<<2)|0;c[ad+28>>2]=aH;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[1313370]|0;Q=1<<aH;if((Z&Q|0)==0){c[1313370]=Z|Q;c[q>>2]=K;c[ad+24>>2]=q;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aH|0)==31){aI=0}else{aI=25-(aH>>>1)|0}Q=W<<aI;Z=c[q>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(W|0)){break}aJ=Z+16+(Q>>>31<<2)|0;q=c[aJ>>2]|0;if((q|0)==0){T=1769;break}else{Q=Q<<1;Z=q}}if((T|0)==1769){if(aJ>>>0<(c[1313373]|0)>>>0){ak();return 0}else{c[aJ>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;W=c[Q>>2]|0;q=c[1313373]|0;if(Z>>>0<q>>>0){ak();return 0}if(W>>>0<q>>>0){ak();return 0}else{c[W+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=W;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[1313372]|0;if(ad>>>0<=o>>>0){break}W=ad-o|0;c[1313372]=W;ad=c[1313375]|0;Q=ad;c[1313375]=Q+o|0;c[Q+(o+4|0)>>2]=W|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[aN()>>2]=12;n=0;return n|0}function pj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[1313373]|0;if(b>>>0<e>>>0){ak()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){ak()}h=f&-8;i=a+(h-8|0)|0;j=i;L2158:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){ak()}if((n|0)==(c[1313374]|0)){p=a+(h-4|0)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[1313371]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4|0)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8|0)>>2]|0;s=c[a+(l+12|0)>>2]|0;t=5253516+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){ak()}if((c[k+12>>2]|0)==(n|0)){break}ak()}}while(0);if((s|0)==(k|0)){c[1313369]=c[1313369]&(1<<p^-1);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){ak()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}ak()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24|0)>>2]|0;v=c[a+(l+12|0)>>2]|0;L2192:do{if((v|0)==(t|0)){w=a+(l+20|0)|0;x=c[w>>2]|0;do{if((x|0)==0){y=a+(l+16|0)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break L2192}else{B=z;C=y;break}}else{B=x;C=w}}while(0);while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){ak()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8|0)>>2]|0;if(w>>>0<e>>>0){ak()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){ak()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{ak()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28|0)|0;m=5253780+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[1313370]=c[1313370]&(1<<c[v>>2]^-1);q=n;r=o;break L2158}else{if(p>>>0<(c[1313373]|0)>>>0){ak()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L2158}}}while(0);if(A>>>0<(c[1313373]|0)>>>0){ak()}c[A+24>>2]=p;t=c[a+(l+16|0)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[1313373]|0)>>>0){ak()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20|0)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[1313373]|0)>>>0){ak()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){ak()}A=a+(h-4|0)|0;e=c[A>>2]|0;if((e&1|0)==0){ak()}do{if((e&2|0)==0){if((j|0)==(c[1313375]|0)){B=(c[1313372]|0)+r|0;c[1313372]=B;c[1313375]=q;c[q+4>>2]=B|1;if((q|0)==(c[1313374]|0)){c[1313374]=0;c[1313371]=0}if(B>>>0<=(c[1313376]|0)>>>0){return}po(0);return}if((j|0)==(c[1313374]|0)){B=(c[1313371]|0)+r|0;c[1313371]=B;c[1313374]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L2263:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=5253516+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[1313373]|0)>>>0){ak()}if((c[u+12>>2]|0)==(j|0)){break}ak()}}while(0);if((g|0)==(u|0)){c[1313369]=c[1313369]&(1<<C^-1);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[1313373]|0)>>>0){ak()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}ak()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16|0)>>2]|0;t=c[a+(h|4)>>2]|0;L2265:do{if((t|0)==(b|0)){p=a+(h+12|0)|0;v=c[p>>2]|0;do{if((v|0)==0){m=a+(h+8|0)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break L2265}else{F=k;G=m;break}}else{F=v;G=p}}while(0);while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[1313373]|0)>>>0){ak()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[1313373]|0)>>>0){ak()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){ak()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{ak()}}}while(0);if((f|0)==0){break}t=a+(h+20|0)|0;u=5253780+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[1313370]=c[1313370]&(1<<c[t>>2]^-1);break L2263}else{if(f>>>0<(c[1313373]|0)>>>0){ak()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L2263}}}while(0);if(E>>>0<(c[1313373]|0)>>>0){ak()}c[E+24>>2]=f;b=c[a+(h+8|0)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[1313373]|0)>>>0){ak()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12|0)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[1313373]|0)>>>0){ak()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[1313374]|0)){H=B;break}c[1313371]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=5253516+(d<<2)|0;A=c[1313369]|0;E=1<<r;do{if((A&E|0)==0){c[1313369]=A|E;I=e;J=5253516+(d+2<<2)|0}else{r=5253516+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[1313373]|0)>>>0){I=h;J=r;break}ak()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=(14-(E|J|d)|0)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=5253780+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[1313370]|0;d=1<<K;do{if((r&d|0)==0){c[1313370]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=1948;break}else{A=A<<1;J=E}}if((N|0)==1948){if(M>>>0<(c[1313373]|0)>>>0){ak()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[1313373]|0;if(J>>>0<E>>>0){ak()}if(B>>>0<E>>>0){ak()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[1313377]|0)-1|0;c[1313377]=q;if((q|0)==0){O=5253932}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[1313377]=-1;return}function pk(a){a=a|0;return 5247784}function pl(a){a=a|0;if((a|0)!=0){pj(a)}return}function pm(a){a=a|0;pl(a);return}function pn(a){a=a|0;return}function po(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;do{if((c[1310753]|0)==0){b=ap(8)|0;if((b-1&b|0)==0){c[1310755]=b;c[1310754]=b;c[1310756]=-1;c[1310757]=2097152;c[1310758]=0;c[1313480]=0;c[1310753]=aB(0)&-16^1431655768;break}else{ak();return 0}}}while(0);if(a>>>0>=4294967232){d=0;e=d&1;return e|0}b=c[1313375]|0;if((b|0)==0){d=0;e=d&1;return e|0}f=c[1313372]|0;do{if(f>>>0>(a+40|0)>>>0){g=c[1310755]|0;h=_(((((((-40-a|0)-1|0)+f|0)+g|0)>>>0)/(g>>>0)>>>0)-1|0,g);i=b;j=5253924;while(1){k=c[j>>2]|0;if(k>>>0<=i>>>0){if((k+(c[j+4>>2]|0)|0)>>>0>i>>>0){l=j;break}}k=c[j+8>>2]|0;if((k|0)==0){l=0;break}else{j=k}}if((c[l+12>>2]&8|0)!=0){break}j=aK(0)|0;i=l+4|0;if((j|0)!=((c[l>>2]|0)+(c[i>>2]|0)|0)){break}k=aK(-(h>>>0>2147483646?-2147483648-g|0:h)|0)|0;m=aK(0)|0;if(!((k|0)!=-1&m>>>0<j>>>0)){break}k=j-m|0;if((j|0)==(m|0)){break}c[i>>2]=(c[i>>2]|0)-k|0;c[1313477]=(c[1313477]|0)-k|0;i=c[1313375]|0;n=(c[1313372]|0)-k|0;k=i;o=i+8|0;if((o&7|0)==0){p=0}else{p=-o&7}o=n-p|0;c[1313375]=k+p|0;c[1313372]=o;c[k+(p+4|0)>>2]=o|1;c[k+(n+4|0)>>2]=40;c[1313376]=c[1310757]|0;d=(j|0)!=(m|0);e=d&1;return e|0}}while(0);if((c[1313372]|0)>>>0<=(c[1313376]|0)>>>0){d=0;e=d&1;return e|0}c[1313376]=-1;d=0;e=d&1;return e|0}function pp(a){a=a|0;var b=0,d=0,e=0;b=(a|0)==0?1:a;while(1){d=pi(b)|0;if((d|0)!=0){e=2032;break}a=(A=c[1315560]|0,c[1315560]=A+0,A);if((a|0)==0){break}bh[a&2047]()}if((e|0)==2032){return d|0}d=aM(4)|0;c[d>>2]=5259332;aj(d|0,5261e3,136);return 0}function pq(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2]|0;b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function pr(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function ps(b){b=b|0;var c=0;c=b;while(a[c]|0!=0){c=c+1|0}return c-b|0}function pt(){az()}function pu(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;aS[a&2047](b|0,c|0,d|0,e|0,f|0)}function pv(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=+d;e=e|0;f=f|0;aT[a&2047](b|0,c|0,+d,e|0,f|0)}function pw(a,b,c){a=a|0;b=b|0;c=+c;aU[a&2047](b|0,+c)}function px(a,b,c,d,e,f){a=a|0;b=b|0;c=+c;d=+d;e=e|0;f=+f;aV[a&2047](b|0,+c,+d,e|0,+f)}function py(a,b){a=a|0;b=b|0;aW[a&2047](b|0)}function pz(a,b,c){a=a|0;b=b|0;c=c|0;aX[a&2047](b|0,c|0)}function pA(a,b){a=a|0;b=b|0;return aY[a&2047](b|0)|0}function pB(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=+d;e=e|0;aZ[a&2047](b|0,c|0,+d,e|0)}function pC(a,b){a=a|0;b=+b;return a_[a&2047](+b)|0}function pD(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return a$[a&2047](b|0,c|0,d|0,e|0,f|0)|0}function pE(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return a0[a&2047](b|0,c|0,d|0)|0}function pF(a,b,c){a=a|0;b=b|0;c=+c;return+a1[a&2047](b|0,+c)}function pG(a,b,c,d){a=a|0;b=b|0;c=+c;d=+d;a2[a&2047](b|0,+c,+d)}function pH(a,b,c,d,e,f,g,h,i){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;i=+i;a3[a&2047](b|0,c|0,d|0,e|0,f|0,g|0,h|0,+i)}function pI(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=+d;e=+e;a4[a&2047](b|0,+c,+d,+e)}function pJ(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;a5[a&2047](b|0,c|0,d|0,e|0,f|0,g|0)}function pK(a,b,c,d){a=a|0;b=b|0;c=c|0;d=+d;return a6[a&2047](b|0,c|0,+d)|0}function pL(a,b,c){a=a|0;b=b|0;c=+c;return a7[a&2047](b|0,+c)|0}function pM(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;a8[a&2047](b|0,+c,d|0,e|0)}function pN(a,b){a=a|0;b=b|0;return+a9[a&2047](b|0)}function pO(a,b,c){a=a|0;b=b|0;c=c|0;return ba[a&2047](b|0,c|0)|0}function pP(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=+f;return+bb[a&2047](b|0,c|0,d|0,e|0,+f)}function pQ(a){a=a|0;return bc[a&2047]()|0}function pR(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return bd[a&2047](b|0,c|0,d|0,e|0)|0}function pS(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;return be[a&2047](+b,+c,+d)|0}function pT(a,b,c){a=a|0;b=+b;c=+c;return bf[a&2047](+b,+c)|0}function pU(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;bg[a&2047](b|0,c|0,d|0)}function pV(a){a=a|0;bh[a&2047]()}function pW(a,b,c,d){a=a|0;b=b|0;c=c|0;d=+d;bi[a&2047](b|0,c|0,+d)}function pX(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;bj[a&2047](b|0,c|0,d|0,e|0)}function pY(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;$(0)}function pZ(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=d|0;e=e|0;$(1)}function p_(a,b){a=a|0;b=+b;$(2)}function p$(a,b,c,d,e){a=a|0;b=+b;c=+c;d=d|0;e=+e;$(3)}function p0(a){a=a|0;$(4)}function p1(a,b){a=a|0;b=b|0;$(5)}function p2(a){a=a|0;$(6);return 0}function p3(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;$(7)}function p4(a){a=+a;$(8);return 0}function p5(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;$(9);return 0}function p6(a,b,c){a=a|0;b=b|0;c=c|0;$(10);return 0}function p7(a,b){a=a|0;b=+b;$(11);return 0.0}function p8(a,b,c){a=a|0;b=+b;c=+c;$(12)}function p9(a,b,c,d,e,f,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=+h;$(13)}function qa(a,b,c,d){a=a|0;b=+b;c=+c;d=+d;$(14)}function qb(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;$(15)}function qc(a,b,c){a=a|0;b=b|0;c=+c;$(16);return 0}function qd(a,b){a=a|0;b=+b;$(17);return 0}function qe(a,b,c,d){a=a|0;b=+b;c=c|0;d=d|0;$(18)}function qf(a){a=a|0;$(19);return 0.0}function qg(a,b){a=a|0;b=b|0;$(20);return 0}function qh(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=+e;$(21);return 0.0}function qi(){$(22);return 0}function qj(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;$(23);return 0}function qk(a,b,c){a=+a;b=+b;c=+c;$(24);return 0}function ql(a,b){a=+a;b=+b;$(25);return 0}function qm(a,b,c){a=a|0;b=b|0;c=c|0;$(26)}function qn(){$(27)}function qo(a,b,c){a=a|0;b=b|0;c=+c;$(28)}function qp(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;$(29)}
// EMSCRIPTEN_END_FUNCS
var aS=[pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,m1,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,o4,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pg,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,o2,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,mc,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY,pY];var aT=[pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,hN,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ,pZ];var aU=[p_,p_,p_,p_,p_,p_,f2,p_,p_,p_,p_,p_,p_,p_,oI,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,m0,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,l9,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,jn,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,md,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,mo,p_,lI,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,nz,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,ja,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,mb,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,jB,p_,p_,p_,p_,p_,lX,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,kC,p_,p_,p_,je,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,mk,p_,p_,p_,p_,p_,lY,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,lK,p_,p_,p_,p_,p_,nu,p_,p_,p_,ne,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,h8,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,nY,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,nX,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,i0,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,na,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,mS,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,n9,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,mw,p_,p_,p_,p_,p_,p_,p_,nf,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,kE,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,jo,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,ms,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,n7,p_,p_,p_,p_,p_,lb,p_,p_,p_,p_,p_,p_,p_,p_,p_,oH,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,ji,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,kT,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,g7,p_,p_,p_,p_,p_,p_,p_,p_,p_,m7,p_,p_,p_,p_,p_,p_,p_,p_,p_,k4,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,of,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,nR,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,jy,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,lD,p_,n4,p_,p_,p_,p_,p_,p_,p_,p_,p_,n1,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,nA,p_,p_,p_,p_,p_,p_,p_,p_,p_,k7,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,kp,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,mg,p_,l1,p_,nc,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,h0,p_,p_,p_,p_,p_,p_,p_,p_,p_,f7,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,kj,p_,f0,p_,p_,p_,p_,p_,lC,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,m2,p_,kX,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,o0,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,oL,p_,p_,p_,p_,p_,k$,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,kP,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_,p_];var aV=[p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,jI,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$,p$];var aW=[p0,p0,fK,p0,p0,p0,p0,p0,iP,p0,p0,p0,p0,p0,p0,p0,p0,p0,e0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,eH,p0,p0,p0,iK,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,io,p0,fg,p0,p0,p0,p0,p0,cp,p0,eh,p0,o5,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,lk,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,fn,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,gB,p0,p0,p0,p0,p0,p0,p0,dQ,p0,p0,p0,pn,p0,p0,p0,b5,p0,p0,p0,fy,p0,p0,p0,p0,p0,p0,p0,hB,p0,ok,p0,p0,p0,p0,p0,p0,p0,p0,p0,ik,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,eG,p0,p0,p0,p0,p0,mE,p0,p0,p0,p0,p0,p0,p0,p0,p0,lh,p0,p0,p0,dk,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,ed,p0,p0,p0,p0,p0,p0,p0,fb,p0,fc,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,eq,p0,mp,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,eC,p0,b2,p0,p0,p0,p0,p0,p0,p0,p0,p0,cH,p0,p0,p0,p0,p0,cm,p0,p0,p0,go,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,is,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,fA,p0,p0,p0,p0,p0,p0,p0,oF,p0,p0,p0,p0,p0,lr,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,mK,p0,dy,p0,p0,p0,p0,p0,eV,p0,p0,p0,p0,p0,p0,p0,p0,p0,b7,p0,ir,p0,p0,p0,jg,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,mY,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,gW,p0,ie,p0,p0,p0,p0,p0,c$,p0,op,p0,dA,p0,p0,p0,p0,p0,p0,p0,p0,p0,fH,p0,er,p0,lu,p0,jN,p0,p0,p0,p0,p0,iL,p0,p0,p0,p0,p0,p0,p0,p0,p0,e1,p0,p0,p0,p0,p0,p0,p0,p0,p0,lB,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,mQ,p0,d_,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,cs,p0,cI,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,dI,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,hS,p0,p0,p0,dP,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,gj,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,iy,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,gx,p0,p0,p0,lH,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,pm,p0,eB,p0,p0,p0,p0,p0,p0,p0,p0,p0,eD,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,mC,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,cz,p0,p0,p0,p0,p0,p0,p0,p0,p0,hs,p0,pc,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,dW,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,oG,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,dz,p0,p0,p0,p0,p0,jW,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,dj,p0,p0,p0,p0,p0,p0,p0,nQ,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,ov,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,o9,p0,hD,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,lp,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,dq,p0,p0,p0,p0,p0,p0,p0,p0,p0,dE,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,o7,p0,du,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,fd,p0,b1,p0,p0,p0,p0,p0,p0,p0,p0,p0,gv,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,or,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,hA,p0,p0,p0,p0,p0,p0,p0,j7,p0,p0,p0,p0,p0,gn,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,oA,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,fr,p0,p0,p0,oE,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,eR,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,ia,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,oy,p0,p0,p0,p0,p0,d2,p0,p0,p0,p0,p0,p0,p0,p0,p0,ej,p0,p0,p0,p0,p0,p0,p0,p0,p0,d3,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,fG,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,eg,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,ev,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,mR,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,gi,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,om,p0,mM,p0,p0,p0,p0,p0,p0,p0,p0,p0,dO,p0,oC,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,eJ,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,pb,p0,p0,p0,d5,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,gm,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,fo,p0,fx,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,eS,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0,p0];var aX=[p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,eU,p1,p1,p1,ks,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,lA,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,ip,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,gy,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,nF,p1,p1,p1,hm,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,ga,p1,p1,p1,p1,p1,p1,p1,p1,p1,e9,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,eW,p1,p1,p1,p1,p1,ee,p1,p1,p1,p1,p1,oV,p1,p1,p1,ft,p1,p1,p1,nW,p1,p1,p1,p1,p1,p1,p1,iV,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,nE,p1,gt,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,g2,p1,i4,p1,p1,p1,nU,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,kM,p1,p1,p1,lf,p1,oZ,p1,p1,p1,p1,p1,p1,p1,lQ,p1,dU,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,kR,p1,p1,p1,p1,p1,p1,p1,oX,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,fp,p1,p1,p1,p1,p1,p1,p1,p1,p1,hd,p1,p1,p1,p1,p1,l4,p1,p1,p1,j2,p1,p1,p1,p1,p1,eL,p1,p1,p1,p1,p1,kL,p1,p1,p1,e5,p1,p1,p1,eo,p1,oS,p1,p1,p1,p1,p1,j8,p1,p1,p1,p1,p1,k6,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,oU,p1,jz,p1,p1,p1,p1,p1,kv,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,dD,p1,p1,p1,fz,p1,kb,p1,p1,p1,p1,p1,p1,p1,fi,p1,hu,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,jV,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,fN,p1,p1,p1,p1,p1,kW,p1,dw,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,hL,p1,p1,p1,p1,p1,p1,p1,p1,p1,fl,p1,hx,p1,gG,p1,p1,p1,p1,p1,p1,p1,p1,p1,e3,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,ln,p1,p1,p1,fT,p1,p1,p1,p1,p1,p1,p1,nD,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,h6,p1,hW,p1,p1,p1,p1,p1,nx,p1,p1,p1,ew,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,fJ,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,hf,p1,p1,p1,gY,p1,p1,p1,p1,p1,nN,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,fX,p1,p1,p1,el,p1,p1,p1,p1,p1,p1,p1,ds,p1,p1,p1,gp,p1,eX,p1,p1,p1,p1,p1,p1,p1,fB,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,iu,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,dY,p1,p1,p1,p1,p1,p1,p1,p1,p1,m$,p1,p1,p1,p1,p1,kQ,p1,p1,p1,p1,p1,p1,p1,k_,p1,p1,p1,p1,p1,p1,p1,p1,p1,g1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,kk,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,mO,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,fS,p1,m5,p1,nH,p1,p1,p1,p1,p1,gq,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,e_,p1,p1,p1,p1,p1,mr,p1,p1,p1,p1,p1,eP,p1,p1,p1,p1,p1,p1,p1,ex,p1,lT,p1,f8,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,np,p1,fs,p1,p1,p1,et,p1,p1,p1,p1,p1,h7,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,m8,p1,p1,p1,p1,p1,ky,p1,p1,p1,cX,p1,p1,p1,p1,p1,eb,p1,p1,p1,p1,p1,ny,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,jA,p1,p1,p1,p1,p1,lj,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,eu,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,n6,p1,p1,p1,fU,p1,mu,p1,p1,p1,e4,p1,p1,p1,p1,p1,fv,p1,l3,p1,p1,p1,p1,p1,lR,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,he,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,l_,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,eM,p1,p1,p1,p1,p1,p1,p1,kt,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,m3,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,gN,p1,p1,p1,p1,p1,p1,p1,p1,p1,gU,p1,p1,p1,p1,p1,iv,p1,ml,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,ek,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,ep,p1,p1,p1,p1,p1,p1,p1,p1,p1,h5,p1,fh,p1,p1,p1,p1,p1,fe,p1,p1,p1,h4,p1,d8,p1,p1,p1,eQ,p1,p1,p1,gO,p1,p1,p1,p1,p1,hp,p1,no,p1,p1,p1,p1,p1,p1,p1,p1,p1,oP,p1,p1,p1,p1,p1,gr,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,d0,p1,p1,p1,fL,p1,iW,p1,gM,p1,p1,p1,lU,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,cW,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,oK,p1,p1,p1,kU,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,kz,p1,mn,p1,p1,p1,nj,p1,p1,p1,ff,p1,p1,p1,p1,p1,p1,p1,oJ,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,lo,p1,hb,p1,p1,p1,g5,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,oe,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,jp,p1,fC,p1,p1,p1,p1,p1,p1,p1,p1,p1,jw,p1,jt,p1,p1,p1,kZ,p1,fV,p1,p1,p1,p1,p1,p1,p1,p1,p1,nK,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,d6,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,nk,p1,ob,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,d7,p1,nM,p1,p1,p1,p1,p1,g4,p1,p1,p1,p1,p1,fM,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,l8,p1,p1,p1,p1,p1,li,p1,p1,p1,p1,p1,p1,p1,p1,p1,lG,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1,p1];var aY=[p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,lL,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,jm,p2,p2,p2,p2,p2,nJ,p2,lW,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,hY,p2,p2,p2,p2,p2,p2,p2,p2,p2,ng,p2,p2,p2,p2,p2,mi,p2,gV,p2,p2,p2,ni,p2,p2,p2,p2,p2,gT,p2,gQ,p2,g0,p2,p2,p2,mA,p2,k2,p2,kq,p2,gI,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,gZ,p2,ca,p2,p2,p2,gX,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,n8,p2,p2,p2,p2,p2,p2,p2,kw,p2,p2,p2,p2,p2,p2,p2,kN,p2,p2,p2,p2,p2,p2,p2,gb,p2,p2,p2,kV,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,g_,p2,p2,p2,p2,p2,p2,p2,p2,p2,l6,p2,p2,p2,p2,p2,p2,p2,p2,p2,kK,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,kr,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,mD,p2,p2,p2,o$,p2,jd,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,kd,p2,p2,p2,p2,p2,p2,p2,p2,p2,hi,p2,nL,p2,p2,p2,p2,p2,fY,p2,p2,p2,p2,p2,jf,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,iZ,p2,p2,p2,p2,p2,g$,p2,oQ,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,j0,p2,p2,p2,p2,p2,p2,p2,lO,p2,p2,p2,p2,p2,p2,p2,l$,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,mx,p2,p2,p2,jK,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,ju,p2,p2,p2,p2,p2,ly,p2,p2,p2,hv,p2,p2,p2,p2,p2,nt,p2,p2,p2,p2,p2,p2,p2,p2,p2,jc,p2,f1,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,gP,p2,g6,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,hg,p2,p2,p2,p2,p2,kO,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,oT,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,jj,p2,p2,p2,j4,p2,f_,p2,p2,p2,mV,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,fQ,p2,p2,p2,iG,p2,p2,p2,p2,p2,gc,p2,p2,p2,p2,p2,p2,p2,p2,p2,mZ,p2,p2,p2,p2,p2,k3,p2,gD,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,oR,p2,gd,p2,p2,p2,p2,p2,p2,p2,p2,p2,i_,p2,kB,p2,p2,p2,p2,p2,p2,p2,p2,p2,i7,p2,p2,p2,p2,p2,k5,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,iY,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,hC,p2,p2,p2,p2,p2,hh,p2,p2,p2,gJ,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,kJ,p2,l2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,kD,p2,p2,p2,b_,p2,p2,p2,fZ,p2,p2,p2,p2,p2,p2,p2,p2,p2,jS,p2,p2,p2,p2,p2,h2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,hX,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,i3,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,my,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,gR,p2,p2,p2,p2,p2,p2,p2,p2,p2,hj,p2,p2,p2,p2,p2,p2,p2,p2,p2,nI,p2,p2,p2,p2,p2,kl,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,b6,p2,p2,p2,i8,p2,p2,p2,p2,p2,p2,p2,p2,p2,n$,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,f3,p2,p2,p2,p2,p2,p2,p2,jb,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,ma,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,nC,p2,g3,p2,p2,p2,p2,p2,pk,p2,p2,p2,nP,p2,p2,p2,p2,p2,p2,p2,p2,p2,f6,p2,p2,p2,o_,p2,p2,p2,p2,p2,p2,p2,gF,p2,p2,p2,p2,p2,jr,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,ib,p2,p2,p2,p2,p2,gL,p2,i9,p2,mU,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,hk,p2,mt,p2,p2,p2,p2,p2,p2,p2,nZ,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,ke,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,nG,p2,h3,p2,hV,p2,p2,p2,p2,p2,p2,p2,b8,p2,p2,p2,h9,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,ki,p2,p2,p2,p2,p2,p2,p2,hU,p2,p2,p2,p2,p2,p2,p2,p2,p2,og,p2,p2,p2,ij,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,oW,p2,nb,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,jD,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,h$,p2,p2,p2,p2,p2,p2,p2,p2,p2,hc,p2,kI,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,nv,p2,p2,p2,p2,p2,jE,p2,p2,p2,p2,p2,p2,p2,nO,p2,p2,p2,kh,p2,p2,p2,p2,p2,hI,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,mf,p2,p2,p2,p2,p2,oh,p2,nw,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,oN,p2,p2,p2,p2,p2,p2,p2,p2,p2,jC,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,gK,p2,p2,p2,p2,p2,ku,p2,lS,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,lN,p2,p2,p2,p2,p2,hr,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,nB,p2,p2,p2,jv,p2,gg,p2,p2,p2,p2,p2,ko,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,jl,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,iX,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,m9,p2,p2,p2,oM,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,kf,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,kx,p2,gS,p2,p2,p2,p2,p2,p2,p2,p2,p2,f4,p2,p2,p2,mH,p2,p2,p2,p2,p2,p2,p2,p2,p2,fW,p2,p2,p2,p2,p2,p2,p2,p2,p2,i2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,fR,p2,p2,p2,mh,p2,p2,p2,p2,p2,p2,p2,hZ,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2,p2];var aZ=[p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,hP,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3,p3];var a_=[p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,mX,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4,p4];var a$=[p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,cx,p5,p5,p5,jQ,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,hG,p5,d$,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,j_,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,ch,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,dr,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,jH,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,dT,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,dC,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,dX,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,iF,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,cl,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,co,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,ea,p5,p5,p5,p5,p5,p5,p5,p5,p5,dv,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5,p5];var a0=[p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,il,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,jL,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,jT,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,hn,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,hl,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,pd,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,cb,p6,hJ,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,dl,p6,p6,p6,p6,p6,p6,p6,iH,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,j1,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,b9,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,b4,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,ct,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6,p6];var a1=[p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,hR,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,eK,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,e2,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,d4,p7,p7,p7,p7,p7,ez,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,fE,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,fq,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,fk,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,eZ,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,fP,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,en,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7,p7];var a2=[p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,iU,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,k8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8,p8];var a3=[p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,oo,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9,p9];var a4=[qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,lE,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,nS,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa,qa];var a5=[qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,o3,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,ph,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb,qb];var a6=[qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,ka,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc,qc];var a7=[qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,ic,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd,qd];var a8=[qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,hw,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe,qe];var a9=[qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,kg,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,la,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,i1,qf,qf,qf,qf,qf,qf,qf,qf,qf,km,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,oa,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,n3,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,nn,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,iS,qf,qf,qf,qf,qf,qf,qf,kF,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,kH,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,kY,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,jx,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,oi,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,n_,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,mm,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,mj,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,f5,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,lJ,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,oO,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,nd,qf,qf,qf,qf,qf,qf,qf,qf,qf,mz,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,jq,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,lF,qf,lZ,qf,qf,qf,qf,qf,qf,qf,m4,qf,qf,qf,jF,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,hT,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,kn,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,h1,qf,qf,qf,mv,qf,qf,qf,qf,qf,qf,qf,n5,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,lv,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,oc,qf,qf,qf,qf,qf,qf,qf,qf,qf,jk,qf,qf,qf,od,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,nr,qf,l0,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,mB,qf,qf,qf,qf,qf,gf,qf,m_,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,i5,qf,qf,qf,qf,qf,qf,qf,ns,qf,qf,qf,qf,qf,jh,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,lz,qf,qf,qf,qf,qf,qf,qf,kA,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,f$,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,g8,qf,qf,qf,nT,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,l5,qf,qf,qf,qf,qf,qf,qf,lV,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,mq,qf,qf,qf,qf,qf,mT,qf,qf,qf,qf,qf,qf,qf,l7,qf,qf,qf,qf,qf,qf,qf,i6,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,m6,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,nV,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,oY,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,gH,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,nm,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,ge,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,k1,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,me,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,n0,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,kS,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,k9,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,nq,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,nh,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,h_,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,k0,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf,qf];var ba=[qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,mL,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,f9,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,ou,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,fm,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,gu,qg,qg,qg,qg,qg,iJ,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,fa,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,j3,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,ii,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,gz,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,ha,qg,qg,qg,qg,qg,lM,qg,qg,qg,qg,qg,qg,qg,qg,qg,ck,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,iT,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,lP,qg,e$,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,jG,qg,lc,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,eI,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,lg,qg,qg,qg,qg,qg,qg,qg,qg,qg,gE,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,ld,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,cq,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,ih,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,hF,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,cP,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,lm,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,jZ,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,gA,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,hy,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,ht,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,g9,qg,qg,qg,qg,qg,qg,qg,cn,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,gh,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,iB,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,ei,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,j6,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,j9,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,le,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,b3,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,jP,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,eA,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,iN,qg,qg,qg,qg,qg,fw,qg,qg,qg,qg,qg,ef,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,fF,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg,qg];var bb=[qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,id,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh,qh];var bc=[qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,ig,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,iD,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,mW,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,ll,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,oD,qi,qi,qi,iO,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,mN,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,ls,qi,qi,qi,qi,qi,qi,qi,oz,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,mP,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,hK,qi,qi,qi,qi,qi,qi,qi,qi,qi,lt,qi,gC,qi,qi,qi,qi,qi,qi,qi,lq,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,on,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,gs,qi,qi,qi,qi,qi,qi,qi,qi,qi,oB,qi,iq,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,ow,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,mJ,qi,qi,qi,qi,qi,qi,qi,qi,qi,ot,qi,qi,qi,qi,qi,jM,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,oj,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,gk,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,pa,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,jU,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,lw,qi,qi,qi,qi,qi,qi,qi,qi,qi,ol,qi,qi,qi,o6,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,it,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,o8,qi,qi,qi,mF,qi,oq,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi,qi];var bd=[qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,gw,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,im,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj,qj];var be=[qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,ox,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,mG,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk,qk];var bf=[ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,lx,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql,ql];var bg=[qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,iw,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,cY,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,iQ,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,ix,qm,qm,qm,qm,qm,qm,qm,qm,qm,iI,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,iz,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,iM,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,hq,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,js,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,gl,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,iC,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,mI,qm,i$,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,cZ,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,kc,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm,qm];var bh=[qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,pt,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn,qn];var bi=[qo,qo,qo,qo,cj,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,os,qo,qo,qo,qo,qo,ey,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,jO,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,cd,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,hE,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,fO,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,fj,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,eN,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,jY,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,fu,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,j5,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,iA,qo,qo,qo,qo,qo,qo,qo,eY,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,iR,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,em,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,cy,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,fD,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,d9,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,e6,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,cf,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo,qo];var bj=[qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,cc,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,ce,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,hM,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,hO,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,ci,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,dt,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,ho,qp,qp,qp,qp,qp,d1,qp,qp,qp,pe,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,dZ,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,jJ,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,iE,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,jR,qp,qp,qp,qp,qp,dx,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,jX,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,o1,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,hH,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,n2,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,dV,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,cu,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,dB,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,ec,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,kG,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,nl,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,j$,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,hz,qp,qp,qp,qp,qp,qp,qp,qp,qp,hQ,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp,qp];return{_emscripten_bind_b2Fixture__SetRestitution_p1:f2,_emscripten_bind_b2PolygonShape____destroy___p0:iP,_emscripten_bind_b2DistanceProxy__get_m_vertices_p0:lL,_emscripten_bind_b2WheelJointDef__Initialize_p4:m1,_emscripten_bind_b2DistanceJointDef__set_frequencyHz_p1:oI,_emscripten_bind_b2Body__IsSleepingAllowed_p0:jm,_emscripten_bind_b2Vec2__b2Vec2_p2:lx,_emscripten_bind_b2Body__GetLinearDamping_p0:kg,_emscripten_bind_b2JointDef__get_type_p0:nJ,_emscripten_bind_b2FixtureDef__get_shape_p0:lW,_emscripten_bind_b2WheelJointDef__set_frequencyHz_p1:m0,_emscripten_bind_b2BlockAllocator____destroy___p0:iK,_emscripten_bind_b2Vec2__op_add_p1:lA,_emscripten_bind_b2World__GetJointList_p0:gS,_emscripten_bind_b2Transform__Set_p2:os,_emscripten_bind_b2EdgeShape__RayCast_p4:jQ,_emscripten_bind_b2Vec2__get_y_p0:la,_emscripten_bind_b2DynamicTree__Validate_p0:io,_emscripten_bind_b2DynamicTree__DestroyProxy_p1:ip,_emscripten_bind_b2Joint__IsActive_p0:hY,_emscripten_bind_b2DynamicTree__b2DynamicTree_p0:ig,_emscripten_bind_b2RevoluteJointDef__get_localAnchorA_p0:ng,_emscripten_bind_b2DistanceProxy__GetVertex_p1:mL,_emscripten_bind_b2EdgeShape__get_m_radius_p0:i1,_emscripten_bind_b2PrismaticJointDef__get_localAnchorB_p0:mi,_emscripten_bind_b2World__GetJointCount_p0:gV,_emscripten_bind_b2DynamicTree__CreateProxy_p2:il,_emscripten_bind_b2RevoluteJointDef__get_localAnchorB_p0:ni,_emscripten_bind_b2Body__GetGravityScale_p0:km,_emscripten_bind_b2Fixture__Dump_p1:gy,_emscripten_bind_b2World__GetBodyList_p0:gT,_emscripten_bind_b2World__GetContactList_p0:g0,_emscripten_bind_b2StackAllocator____destroy___p0:lk,_emscripten_bind_b2Vec2__Skew_p0:mA,_emscripten_bind_b2BodyDef__get_linearVelocity_p0:k2,_emscripten_bind_b2Body__GetPosition_p0:kq,_emscripten_bind_b2World__GetTreeHeight_p0:gI,_emscripten_bind_b2PrismaticJointDef__set_motorSpeed_p1:l9,_emscripten_bind_b2ChainShape__b2ChainShape_p0:iD,_emscripten_bind_b2CircleShape__RayCast_p4:hG,_emscripten_bind_b2MouseJointDef__get_dampingRatio_p0:oa,_emscripten_bind_b2JointDef__set_bodyB_p1:nF,_malloc:pi,_emscripten_bind_b2Fixture__GetAABB_p1:f9,_emscripten_bind_b2BroadPhase__TouchProxy_p1:hm,_emscripten_bind_b2World__GetAllowSleeping_p0:gZ,_emscripten_bind_b2World__GetWarmStarting_p0:gX,_emscripten_bind_b2Rot__b2Rot_p1:mX,_emscripten_bind_b2Rot__b2Rot_p0:mW,_emscripten_bind_b2MouseJointDef__get_frequencyHz_p0:n3,_emscripten_bind_b2Fixture__SetUserData_p1:ga,_emscripten_bind_b2MouseJointDef__get_target_p0:n8,_emscripten_bind_b2ContactManager__set_m_contactFilter_p1:fS,_emscripten_bind_b2FrictionJointDef____destroy___p0:lr,_emscripten_bind_b2Filter__get_maskBits_p0:kw,_emscripten_bind_b2World__Dump_p0:hB,_emscripten_bind_b2RevoluteJointDef____destroy___p0:ok,_emscripten_bind_b2RevoluteJointDef__get_motorSpeed_p0:nn,_emscripten_bind_b2BodyDef__get_bullet_p0:kN,_emscripten_bind_b2Body__SetAngularDamping_p1:jn,_emscripten_bind_b2DynamicTree__RebuildBottomUp_p0:ik,_emscripten_bind_b2Fixture__GetFilterData_p0:gb,_emscripten_bind_b2BodyDef__get_position_p0:kV,_emscripten_bind_b2PolygonShape__get_m_radius_p0:iS,_emscripten_bind_b2ContactEdge__set_next_p1:oV,_emscripten_bind_b2Transform__b2Transform_p2:ou,_emscripten_bind_b2FrictionJointDef__get_maxTorque_p0:kF,_emscripten_bind_b2WeldJointDef__set_localAnchorB_p1:nW,_emscripten_bind_b2World__GetProxyCount_p0:g_,_emscripten_bind_b2PrismaticJointDef__set_lowerTranslation_p1:md,_emscripten_bind_b2PolygonShape__set_m_centroid_p1:iV,_emscripten_bind_b2Vec3____destroy___p0:mE,_emscripten_bind_b2PrismaticJointDef__get_enableMotor_p0:l6,_emscripten_bind_b2BodyDef__get_linearDamping_p0:kH,_emscripten_bind_b2RayCastCallback__ReportFixture_p4:id,_emscripten_bind_b2Body__Dump_p0:lh,_emscripten_bind_b2BodyDef__get_allowSleep_p0:kK,_emscripten_bind_b2JointDef__set_bodyA_p1:nE,_emscripten_bind_b2Fixture__GetMassData_p1:gt,_emscripten_bind_b2Joint__GetReactionTorque_p1:hR,_emscripten_bind_b2Rot__set_c_p1:mo,_emscripten_bind_b2Vec3__op_mul_p1:lI,_emscripten_bind_b2StackAllocator__GetMaxAllocation_p0:kr,_emscripten_bind_b2World__SetAutoClearForces_p1:g2,_emscripten_bind_b2Contact__SetEnabled_p1:i4,_emscripten_bind_b2BodyDef__get_angularDamping_p0:kY,_emscripten_bind_b2WeldJointDef__set_localAnchorA_p1:nU,_emscripten_bind_b2PulleyJointDef__set_lengthB_p1:nz,_emscripten_bind_b2Vec2__op_sub_p0:mD,_emscripten_bind_b2RopeJointDef__get_localAnchorB_p0:o$,_emscripten_bind_b2Contact__GetChildIndexB_p0:jd,_emscripten_bind_b2Fixture__TestPoint_p1:gu,_emscripten_bind_b2QueryCallback__ReportFixture_p1:iJ,_emscripten_bind_b2BodyDef__set_linearVelocity_p1:kM,_emscripten_bind_b2Body__GetMass_p0:jx,_emscripten_bind_b2World__QueryAABB_p2:hq,_emscripten_bind_b2RopeJointDef__set_localAnchorB_p1:oZ,_emscripten_bind_b2Body__IsFixedRotation_p0:kd,_emscripten_bind_b2Rot__SetIdentity_p0:mp,_emscripten_bind_b2DistanceProxy__set_m_vertices_p1:lQ,_emscripten_bind_b2Joint__GetBodyA_p0:hi,_emscripten_bind_b2JointDef__get_userData_p0:nL,_emscripten_bind_b2Draw__DrawPolygon_p3:hM,_emscripten_bind_b2DistanceJointDef__get_dampingRatio_p0:oi,_emscripten_bind_b2ContactManager__get_m_broadPhase_p0:fY,_emscripten_bind_b2Contact__GetManifold_p0:jf,_emscripten_bind_b2Contact__SetFriction_p1:ja,_emscripten_bind_b2BodyDef__set_allowSleep_p1:kR,_emscripten_bind_b2Fixture__RayCast_p3:gw,_emscripten_bind_b2WeldJointDef__get_referenceAngle_p0:n_,_emscripten_bind_b2RopeJointDef__set_localAnchorA_p1:oX,_emscripten_bind_b2Draw__DrawSolidPolygon_p3:hO,_emscripten_bind_b2ContactManager____destroy___p0:go,_emscripten_bind_b2PrismaticJointDef__get_lowerTranslation_p0:mm,_emscripten_bind_b2PolygonShape__get_m_vertexCount_p0:iZ,_emscripten_bind_b2DistanceJointDef__Initialize_p4:o4,_emscripten_bind_b2World__IsLocked_p0:g$,_emscripten_bind_b2ContactEdge__get_prev_p0:oQ,_emscripten_bind_b2Draw__AppendFlags_p1:hd,_emscripten_bind_b2PrismaticJointDef__get_maxMotorForce_p0:mj,_emscripten_bind_b2PrismaticJointDef__set_upperTranslation_p1:mb,_emscripten_bind_b2Shape__RayCast_p4:j_,_emscripten_bind_b2Body__SetActive_p1:j2,_emscripten_bind_b2Shape__GetChildCount_p0:j0,_emscripten_bind_b2ContactListener____destroy___p0:is,_emscripten_bind_b2Body__ApplyTorque_p1:jB,_emscripten_bind_b2DistanceProxy__GetVertexCount_p0:lO,_emscripten_bind_b2Fixture____destroy___p0:gv,_emscripten_bind_b2FixtureDef__set_density_p1:lX,_emscripten_bind_b2FixtureDef__get_filter_p0:l$,_emscripten_bind_b2ContactEdge__set_prev_p1:oS,_emscripten_bind_b2Fixture__GetFriction_p0:f5,_emscripten_bind_b2Body__SetType_p1:j8,_emscripten_bind_b2WheelJointDef__set_localAnchorA_p1:mr,_emscripten_bind_b2FrictionJointDef__set_maxForce_p1:kC,_emscripten_bind_b2Contact__SetRestitution_p1:je,_emscripten_bind_b2WheelJointDef__get_enableMotor_p0:mx,_emscripten_bind_b2DistanceJointDef__b2DistanceJointDef_p0:oD,_emscripten_bind_b2PolygonShape__GetChildCount_p0:jK,_emscripten_bind_b2BlockAllocator__b2BlockAllocator_p0:iO,_emscripten_bind_b2ContactEdge__set_other_p1:oU,_emscripten_bind_b2Body__GetMassData_p1:jz,_emscripten_bind_b2DistanceProxy____destroy___p0:mK,_emscripten_bind_b2RevoluteJointDef__get_lowerAngle_p0:m6,_emscripten_bind_b2Filter__set_groupIndex_p1:kv,_emscripten_bind_b2PrismaticJointDef__set_maxMotorForce_p1:mk,_emscripten_bind_b2FixtureDef__set_restitution_p1:lY,_emscripten_bind_b2Body__GetJointList_p0:ju,_emscripten_bind_b2Timer____destroy___p0:ir,_emscripten_bind_b2Contact__ResetRestitution_p0:jg,_emscripten_bind_b2DynamicTree__MoveProxy_p3:im,_emscripten_bind_b2PulleyJointDef__get_localAnchorA_p0:nt,_emscripten_bind_b2WheelJointDef____destroy___p0:mY,_emscripten_bind_b2Body__SetMassData_p1:kb,_emscripten_bind_b2Contact__GetChildIndexA_p0:jc,_emscripten_bind_b2Fixture__GetShape_p0:f1,_emscripten_bind_b2DistanceProxy__set_m_radius_p1:lK,_emscripten_bind_b2World__DestroyJoint_p1:hu,_emscripten_bind_b2PulleyJointDef__set_ratio_p1:nu,_emscripten_bind_b2Body__GetLocalPoint_p1:j3,_emscripten_bind_b2World__GetBodyCount_p0:gP,_emscripten_bind_b2CircleShape__GetType_p0:g6,_emscripten_bind_b2DistanceProxy__get_m_radius_p0:lJ,_emscripten_bind_b2World__ClearForces_p0:gW,_emscripten_bind_b2DynamicTree____destroy___p0:ie,_emscripten_bind_b2Contact__GetWorldManifold_p1:jV,_emscripten_bind_b2DynamicTree__GetUserData_p1:ii,_emscripten_bind_b2JointDef____destroy___p0:op,_emscripten_bind_b2Draw__GetFlags_p0:hg,_emscripten_bind_b2PolygonShape__Set_p2:iQ,_emscripten_bind_b2DestructionListener__SayGoodbye_p1:lo,_emscripten_bind_b2BodyDef____destroy___p0:lu,_emscripten_bind_b2EdgeShape____destroy___p0:jN,_emscripten_bind_b2GearJointDef__get_ratio_p0:oO,_emscripten_bind_b2BlockAllocator__Clear_p0:iL,_emscripten_bind_b2BodyDef__set_type_p1:kW,_emscripten_bind_b2ContactEdge__get_next_p0:oT,_free:pj,_emscripten_bind_b2RevoluteJointDef__get_upperAngle_p0:nd,_emscripten_bind_b2MouseJointDef__set_dampingRatio_p1:n4,_emscripten_bind_b2PolygonShape__set_m_radius_p1:h8,_emscripten_bind_b2FixtureDef__set_userData_p1:lT,_emscripten_bind_b2WheelJointDef__get_maxMotorTorque_p0:mz,_emscripten_bind_b2ChainShape__CreateLoop_p2:iI,_emscripten_bind_b2World__DestroyBody_p1:hx,_emscripten_bind_b2World__SetSubStepping_p1:gG,_emscripten_bind_b2PrismaticJointDef____destroy___p0:mQ,_emscripten_bind_b2BroadPhase__GetFatAABB_p1:gz,_emscripten_bind_b2ContactManager__set_m_contactCount_p1:fU,_emscripten_bind_b2Body__GetLinearVelocity_p0:j4,_emscripten_bind_b2ContactManager__get_m_allocator_p0:f_,_emscripten_bind_b2BlockAllocator__Free_p2:iM,_emscripten_bind_b2Body__GetAngularVelocity_p0:jq,_emscripten_bind_b2Rot__GetXAxis_p0:mV,_emscripten_bind_b2ContactManager__get_m_contactCount_p0:fR,_emscripten_bind_b2PolygonShape__GetVertexCount_p0:iX,_emscripten_bind_b2StackAllocator__Free_p1:ln,_emscripten_bind_b2CircleShape__GetSupportVertex_p1:ha,_emscripten_bind_b2DistanceProxy__GetSupportVertex_p1:lM,_emscripten_bind_b2JointDef__set_userData_p1:nD,_emscripten_bind_b2Vec3__get_z_p0:lF,_emscripten_bind_b2FixtureDef__get_restitution_p0:lZ,_emscripten_bind_b2FixtureDef__b2FixtureDef_p0:mN,_emscripten_bind_b2WheelJointDef__get_motorSpeed_p0:m4,_emscripten_bind_b2ContactManager__get_m_contactFilter_p0:fQ,_emscripten_bind_b2Body__GetAngularDamping_p0:jF,_emscripten_bind_b2ChainShape__GetChildCount_p0:iG,_emscripten_bind_b2ChainShape__SetNextVertex_p1:h6,_emscripten_bind_b2Joint__SetUserData_p1:hW,_emscripten_bind_b2Fixture__IsSensor_p0:gc,_emscripten_bind_b2DistanceJointDef__get_localAnchorA_p0:og,_emscripten_bind_b2PulleyJointDef__set_groundAnchorB_p1:nx,_emscripten_bind_b2ContactListener__PreSolve_p2:iw,_emscripten_bind_b2WheelJointDef__get_localAnchorB_p0:mZ,_emscripten_bind_b2BroadPhase__MoveProxy_p3:ho,_emscripten_bind_b2BodyDef__get_active_p0:k3,_emscripten_bind_b2CircleShape__GetVertexCount_p0:gD,_emscripten_bind_b2Timer__Reset_p0:hS,_emscripten_bind_b2World__b2World_p1:hv,_emscripten_bind_b2Vec3__Set_p3:lE,_emscripten_bind_b2RevoluteJointDef__set_referenceAngle_p1:ne,_emscripten_bind_b2ContactEdge__get_other_p0:oR,_emscripten_bind_b2Fixture__GetType_p0:gd,_emscripten_bind_b2ContactListener__PostSolve_p2:ix,_emscripten_bind_b2Body__GetInertia_p0:kn,_emscripten_bind_b2FrictionJointDef__b2FrictionJointDef_p0:ls,_emscripten_bind_b2PolygonShape__get_m_centroid_p0:i_,_emscripten_bind_b2FrictionJointDef__get_localAnchorA_p0:kB,_emscripten_bind_b2Draw__SetFlags_p1:hf,_emscripten_bind_b2WeldJointDef__b2WeldJointDef_p0:oz,_emscripten_bind_b2World__SetAllowSleeping_p1:gY,_emscripten_bind_b2BodyDef__set_gravityScale_p1:kX,_emscripten_bind_b2Contact__IsTouching_p0:i7,_emscripten_bind_b2Transform__set_q_p1:nN,_emscripten_bind_b2BodyDef__get_fixedRotation_p0:k5,_emscripten_bind_b2ChainShape____destroy___p0:iy,_emscripten_bind_b2ChainShape__get_m_radius_p0:h1,_emscripten_bind_b2EdgeShape__set_m_radius_p1:i0,_emscripten_bind_b2DistanceJointDef__get_length_p0:oc,_emscripten_bind_b2ContactManager__set_m_contactListener_p1:fX,_emscripten_bind_b2MouseJointDef__get_maxForce_p0:n5,_emscripten_bind_b2DistanceProxy__GetSupport_p1:lP,_emscripten_bind_b2World__GetGravity_p0:hC,_emscripten_bind_b2Joint__GetNext_p0:hh,_emscripten_bind_b2RevoluteJointDef__set_lowerAngle_p1:na,_emscripten_bind_b2World__GetProfile_p0:gJ,_emscripten_bind_b2PulleyJointDef__set_groundAnchorA_p1:ny,_emscripten_bind_b2PrismaticJointDef__get_localAxisA_p0:ma,_emscripten_bind_b2Body__GetWorldVector_p1:lc,_emscripten_bind_b2Fixture__Refilter_p0:gx,_emscripten_bind_b2Vec3__SetZero_p0:lH,_emscripten_bind_b2ContactListener__EndContact_p1:iu,_emscripten_bind_b2Vec2__Normalize_p0:lv,_emscripten_bind_b2Shape__ComputeMass_p2:jY,_emscripten_bind_b2BodyDef__get_type_p0:kJ,_emscripten_bind_b2FixtureDef__get_userData_p0:l2,_emscripten_bind_b2WeldJointDef__Initialize_p3:n2,_emscripten_bind_b2Rot__Set_p1:mS,_emscripten_bind_b2PrismaticJointDef__b2PrismaticJointDef_p0:mP,_emscripten_bind_b2FrictionJointDef__get_localAnchorB_p0:kD,_emscripten_bind_b2WheelJointDef__set_enableMotor_p1:m$,_emscripten_bind_b2ContactManager__get_m_contactList_p0:fZ,_emscripten_bind_b2PolygonShape__ComputeAABB_p3:jJ,_emscripten_bind_b2BodyDef__set_fixedRotation_p1:kQ,_emscripten_bind_b2CircleShape__b2CircleShape_p0:hK,_emscripten_bind_b2EdgeShape__GetChildCount_p0:jS,_emscripten_bind_b2BodyDef__set_active_p1:k_,_emscripten_bind_b2Vec2____destroy___p0:mC,_emscripten_bind_b2ChainShape__get_m_vertices_p0:h2,_emscripten_bind_b2BodyDef__b2BodyDef_p0:lt,_emscripten_bind_b2BroadPhase__b2BroadPhase_p0:gC,_emscripten_bind_b2World__SetDebugDraw_p1:g1,_emscripten_bind_b2MouseJointDef__set_frequencyHz_p1:n9,_emscripten_bind_b2WheelJointDef__get_frequencyHz_p0:mv,_emscripten_bind_b2Filter__b2Filter_p0:lq,_emscripten_bind_b2World____destroy___p0:hA,_emscripten_bind_b2Body__SetBullet_p1:kk,_emscripten_bind_b2Body__GetAngle_p0:jk,_emscripten_bind_b2DistanceJointDef__get_frequencyHz_p0:od,_emscripten_bind_b2Contact__GetNext_p0:i3,_emscripten_bind_b2World__DrawDebugData_p0:hs,_emscripten_bind_b2RevoluteJointDef__set_maxMotorTorque_p1:nf,_emscripten_bind_b2WheelJointDef__get_localAnchorA_p0:my,_emscripten_bind_b2PulleyJointDef__get_lengthB_p0:nr,_strlen:ps,_emscripten_bind_b2FixtureDef__set_filter_p1:mO,_emscripten_bind_b2ChainShape__CreateChain_p2:iz,_emscripten_bind_b2Body__GetLocalVector_p1:lg,_emscripten_bind_b2FrictionJointDef__set_maxTorque_p1:kE,_emscripten_bind_b2ChainShape__ComputeAABB_p3:iE,_emscripten_bind_b2CircleShape__GetSupport_p1:gE,_emscripten_bind_b2World__GetContinuousPhysics_p0:gR,_emscripten_bind_b2FrictionJointDef__get_maxForce_p0:kA,_emscripten_bind_b2RevoluteJointDef__set_localAnchorA_p1:m5,_emscripten_bind_b2JointDef__set_type_p1:nH,_emscripten_bind_b2Color__Set_p3:nS,_emscripten_bind_b2Joint__GetBodyB_p0:hj,_emscripten_bind_b2ContactManager__set_m_broadPhase_p1:gq,_emscripten_bind_b2Body__GetLinearVelocityFromLocalPoint_p1:ld,_emscripten_bind_b2Vec2__Length_p0:mB,_emscripten_bind_b2JointDef__get_collideConnected_p0:nI,_emscripten_bind_b2BroadPhase__GetTreeQuality_p0:gf,_emscripten_bind_b2WheelJointDef__get_dampingRatio_p0:m_,_emscripten_bind_b2Joint__GetCollideConnected_p0:hX,_emscripten_bind_b2FrictionJointDef__set_localAnchorB_p1:kz,_emscripten_bind_b2EdgeShape__ComputeAABB_p3:jR,_emscripten_bind_b2BodyDef__set_awake_p1:k6,_emscripten_bind_b2PolygonShape__RayCast_p4:jH,_emscripten_bind_b2CircleShape__ComputeMass_p2:hE,_emscripten_bind_b2Contact__IsEnabled_p0:i8,_emscripten_bind_b2Vec2__SetZero_p0:lB,_emscripten_bind_b2Fixture__SetSensor_p1:f8,_emscripten_bind_b2Shape__GetType_p0:jj,_emscripten_bind_b2WeldJointDef__get_localAnchorB_p0:n$,_emscripten_bind_b2ContactManager__set_m_allocator_p1:fT,_emscripten_bind_b2WheelJointDef__set_motorSpeed_p1:ms,_emscripten_bind_b2Contact__Evaluate_p3:jX,_emscripten_bind_b2PulleyJointDef__set_localAnchorB_p1:np,_emscripten_bind_b2PulleyJointDef__get_lengthA_p0:ns,_emscripten_bind_b2Shape__get_m_radius_p0:jh,_emscripten_bind_b2ChainShape__set_m_count_p1:h7,_emscripten_bind_b2Contact__ResetFriction_p0:jW,_emscripten_bind_b2DynamicTree__GetFatAABB_p1:ih,_emscripten_bind_b2PulleyJointDef__b2PulleyJointDef_p0:on,_emscripten_bind_b2Fixture__GetBody_p0:f3,_emscripten_bind_b2WheelJointDef__set_maxMotorTorque_p1:mw,_emscripten_bind_b2Vec2__LengthSquared_p0:lz,_emscripten_bind_b2Contact__GetFixtureA_p0:jb,_emscripten_bind_b2RevoluteJointDef__set_localAnchorB_p1:m8,_emscripten_bind_b2EdgeShape__ComputeMass_p2:jO,_emscripten_bind_b2Transform__SetIdentity_p0:nQ,_emscripten_bind_b2FrictionJointDef__set_localAnchorA_p1:ky,_emscripten_bind_b2Body__SetTransform_p2:j5,_emscripten_bind_b2StackAllocator__b2StackAllocator_p0:ll,_emscripten_bind_b2MouseJointDef__set_maxForce_p1:n7,_emscripten_bind_b2Vec2__set_y_p1:lb,_emscripten_bind_b2CircleShape__Clone_p1:hF,_emscripten_bind_b2Color____destroy___p0:ov,_emscripten_bind_b2Fixture__GetRestitution_p0:f$,_emscripten_bind_b2DistanceJointDef__set_length_p1:oH,_emscripten_bind_b2PolygonShape__Clone_p1:jG,_emscripten_bind_b2Color__b2Color_p3:ox,_emscripten_bind_b2Body__ApplyForceToCenter_p1:jA,_emscripten_bind_b2Joint__GetReactionForce_p1:ic,_emscripten_bind_b2Body__SetFixedRotation_p1:lj,_emscripten_bind_b2RopeJointDef____destroy___p0:o9,_emscripten_bind_b2CircleShape____destroy___p0:hD,_emscripten_bind_b2Shape__set_m_radius_p1:ji,_emscripten_bind_b2JointDef__get_bodyA_p0:nC,_emscripten_bind_b2World__GetContactCount_p0:g3,_emscripten_bind_b2Fixture__b2Fixture_p0:gs,_emscripten_bind_b2StackAllocator__Allocate_p1:lm,_emscripten_bind_b2Body__SetGravityScale_p1:jo,_emscripten_bind_b2BroadPhase__CreateProxy_p2:hn,_emscripten_bind_b2MouseJointDef__b2MouseJointDef_p0:oB,_emscripten_bind_b2PrismaticJointDef__set_localAnchorB_p1:l4,_emscripten_bind_b2Filter____destroy___p0:lp,_emscripten_bind_b2PrismaticJointDef__set_enableMotor_p1:ml,_emscripten_bind_b2Fixture__GetUserData_p0:f6,_emscripten_bind_b2RopeJointDef__get_localAnchorA_p0:o_,_emscripten_bind_b2CircleShape__get_m_radius_p0:g8,_emscripten_bind_b2BodyDef__set_angularVelocity_p1:kT,_emscripten_bind_b2Color__get_b_p0:nT,_emscripten_bind_b2BroadPhase__GetProxyCount_p0:gF,_emscripten_bind_b2MouseJointDef__set_target_p1:n6,_emscripten_bind_b2Body__GetFixtureList_p0:jr,_emscripten_bind_b2PolygonShape__TestPoint_p2:jL,_emscripten_bind_b2WheelJointDef__set_localAnchorB_p1:mu,_emscripten_bind_b2Vec2__IsValid_p0:ly,_emscripten_bind_b2Color__b2Color_p0:ow,_emscripten_bind_b2BroadPhase__TestOverlap_p2:hl,_emscripten_bind_b2PrismaticJointDef__set_localAnchorA_p1:l3,_emscripten_bind_b2Joint__GetAnchorB_p0:ib,_emscripten_bind_b2CircleShape__set_m_radius_p1:g7,_emscripten_bind_b2DistanceProxy__set_m_count_p1:lR,_emscripten_bind_b2World__GetContactManager_p0:gL,_emscripten_bind_b2Contact__GetFixtureB_p0:i9,_emscripten_bind_b2Rot__GetYAxis_p0:mU,_emscripten_bind_b2RevoluteJointDef__set_upperAngle_p1:m7,_emscripten_bind_b2Shape__Clone_p1:jZ,_emscripten_bind_b2ContactManager__Destroy_p1:gp,_emscripten_bind_b2PrismaticJointDef__get_motorSpeed_p0:l5,_emscripten_bind_b2BodyDef__set_linearDamping_p1:k4,_emscripten_bind_b2BroadPhase__GetTreeBalance_p0:hk,_emscripten_bind_b2WheelJointDef__get_localAxisA_p0:mt,_emscripten_bind_b2FixtureDef__get_density_p0:lV,_emscripten_bind_b2Draw__ClearFlags_p1:he,_emscripten_bind_b2WeldJointDef__get_localAnchorA_p0:nZ,_emscripten_bind_b2PolygonShape__GetType_p0:iY,_emscripten_bind_b2DistanceJointDef__set_dampingRatio_p1:of,_emscripten_bind_b2BroadPhase__GetUserData_p1:gA,_emscripten_bind_b2Rot__get_c_p0:mq,_emscripten_bind_b2World__GetAutoClearForces_p0:gQ,_emscripten_bind_b2Rot__GetAngle_p0:mT,_emscripten_bind_b2FixtureDef__set_isSensor_p1:l_,_emscripten_bind_b2World__CreateJoint_p1:hy,_emscripten_bind_b2Color__set_b_p1:nR,_emscripten_bind_b2PrismaticJointDef__get_referenceAngle_p0:l7,_emscripten_bind_b2Body__GetLocalCenter_p0:ke,_emscripten_bind_b2Body__SetAngularVelocity_p1:jy,_emscripten_bind_b2CircleShape__TestPoint_p2:hJ,_emscripten_bind_b2Body__SetAwake_p1:lf,_emscripten_bind_b2Filter__set_categoryBits_p1:kt,_emscripten_bind_b2ChainShape__ComputeMass_p2:iA,_emscripten_bind_b2World__CreateBody_p1:ht,_emscripten_bind_b2JointDef__get_bodyB_p0:nG,_emscripten_bind_b2ChainShape__get_m_count_p0:h3,_emscripten_bind_b2Joint__GetType_p0:hV,_emscripten_bind_b2BodyDef__set_position_p1:kL,_emscripten_bind_b2WheelJointDef__set_localAxisA_p1:m3,_emscripten_bind_b2CircleShape__GetVertex_p1:g9,_emscripten_bind_b2Timer__GetMilliseconds_p0:hT,_emscripten_bind_b2World__SetDestructionListener_p1:gU,_emscripten_bind_b2Joint__GetAnchorA_p0:h9,_emscripten_bind_b2DistanceProxy__b2DistanceProxy_p0:mJ,_emscripten_bind_b2Transform____destroy___p0:or,_emscripten_bind_b2PolygonShape__ComputeMass_p2:iR,_emscripten_bind_b2Draw__DrawTransform_p1:hL,_emscripten_bind_b2Transform__b2Transform_p0:ot,_emscripten_bind_b2Body__GetWorld_p0:ki,_emscripten_bind_b2PolygonShape__b2PolygonShape_p0:jM,_emscripten_bind_b2WeldJointDef__set_frequencyHz_p1:n1,_emscripten_bind_b2Joint__GetUserData_p0:hU,_emscripten_bind_b2Body__ResetMassData_p0:j7,_emscripten_bind_b2Timer__b2Timer_p0:iq,_emscripten_bind_b2World__SetContinuousPhysics_p1:gN,_emscripten_bind_b2ContactManager__FindNewContacts_p0:gn,_emscripten_bind_b2Filter__set_maskBits_p1:ks,_emscripten_bind_b2DynamicTree__GetMaxBalance_p0:ij,_emscripten_bind_b2PolygonShape__GetVertex_p1:iT,_emscripten_bind_b2WeldJointDef__get_frequencyHz_p0:nV,_emscripten_bind_b2ContactListener__BeginContact_p1:iv,_emscripten_bind_b2WeldJointDef__get_dampingRatio_p0:n0,_emscripten_bind_b2ChainShape__Clone_p1:iB,_emscripten_bind_b2GearJointDef__b2GearJointDef_p0:o6,_emscripten_bind_b2Body__ApplyForce_p2:js,_emscripten_bind_b2ContactEdge__get_contact_p0:oW,_emscripten_bind_b2RevoluteJointDef__get_enableMotor_p0:nb,_emscripten_bind_b2WheelJointDef__b2WheelJointDef_p0:oj,_emscripten_bind_b2PulleyJointDef__set_lengthA_p1:nA,_emscripten_bind_b2FixtureDef__get_friction_p0:l0,_emscripten_bind_b2Body__GetType_p0:kl,_emscripten_bind_b2World__Step_p3:hw,_emscripten_bind_b2Vec2__set_x_p1:k7,_emscripten_bind_b2ContactManager__b2ContactManager_p0:gk,_emscripten_bind_b2Contact__GetRestitution_p0:i5,_emscripten_bind_b2MouseJointDef____destroy___p0:oA,_emscripten_bind_b2Body__GetTransform_p0:jD,_emscripten_bind_b2RopeJointDef__get_maxLength_p0:oY,_emscripten_bind_b2ChainShape__set_m_vertices_p1:h5,_emscripten_bind_b2EdgeShape__TestPoint_p2:jT,_emscripten_bind_b2RopeJointDef__b2RopeJointDef_p0:pa,_emscripten_bind_b2ContactManager__AddPair_p2:gl,_emscripten_bind_b2Contact__GetFriction_p0:i6,_emscripten_bind_b2ChainShape__SetPrevVertex_p1:h4,_memcpy:pq,_emscripten_bind_b2Body__GetLinearVelocityFromWorldPoint_p1:j6,_emscripten_bind_b2DynamicTree__GetAreaRatio_p0:h_,_emscripten_bind_b2World__SetGravity_p1:gO,_emscripten_bind_b2PulleyJointDef__Initialize_p7:oo,_emscripten_bind_b2World__GetTreeQuality_p0:gH,_emscripten_bind_b2BroadPhase__DestroyProxy_p1:hp,_emscripten_bind_b2PulleyJointDef__set_localAnchorA_p1:no,_emscripten_bind_b2ChainShape__GetChildEdge_p2:iC,_emscripten_bind_b2EdgeShape__b2EdgeShape_p0:jU,_emscripten_bind_b2ContactEdge__set_contact_p1:oP,_emscripten_bind_b2ChainShape__GetType_p0:h$,_emscripten_bind_b2Fixture__SetFilterData_p1:gr,_emscripten_bind_b2Body__ApplyAngularImpulse_p1:kp,_emscripten_bind_b2ChainShape__TestPoint_p2:iH,_emscripten_bind_b2RevoluteJointDef__get_maxMotorTorque_p0:nm,_emscripten_bind_b2CircleShape__get_m_p_p0:hc,_emscripten_bind_b2BodyDef__get_awake_p0:kI,_emscripten_bind_b2Body__CreateFixture_p1:j9,_emscripten_bind_b2Body__CreateFixture_p2:ka,_emscripten_bind_b2GearJointDef____destroy___p0:o5,_emscripten_bind_b2Fixture__GetDensity_p0:ge,_emscripten_bind_b2PolygonShape__set_m_vertexCount_p1:iW,_emscripten_bind_b2World__SetContactListener_p1:gM,_emscripten_bind_b2PulleyJointDef__get_localAnchorB_p0:nv,_emscripten_bind_b2FixtureDef__set_shape_p1:lU,_emscripten_bind_b2Joint__Dump_p0:ia,_emscripten_bind_b2Shape__TestPoint_p2:j1,_emscripten_bind_b2ChainShape__RayCast_p4:iF,_emscripten_bind_b2Transform__get_p_p0:nO,_emscripten_bind_b2Body__IsBullet_p0:kh,_emscripten_bind_b2WeldJointDef____destroy___p0:oy,_emscripten_bind_b2CircleShape__GetChildCount_p0:hI,_emscripten_bind_b2Draw__DrawCircle_p3:hP,_emscripten_bind_b2Body__GetWorldPoint_p1:le,_emscripten_bind_b2PrismaticJointDef__set_referenceAngle_p1:mg,_emscripten_bind_b2RevoluteJointDef__set_motorSpeed_p1:nc,_emscripten_bind_b2BodyDef__set_bullet_p1:kZ,_emscripten_bind_b2BodyDef__get_angularVelocity_p0:k1,_emscripten_bind_b2PrismaticJointDef__get_enableLimit_p0:mf,_emscripten_bind_b2Vec2__b2Vec2_p0:lw,_emscripten_bind_b2DistanceJointDef__get_localAnchorB_p0:oh,_emscripten_bind_b2PulleyJointDef__get_groundAnchorB_p0:nw,_emscripten_bind_b2GearJointDef__set_joint2_p1:oK,_emscripten_bind_b2RevoluteJointDef__b2RevoluteJointDef_p0:ol,_emscripten_bind_b2BodyDef__set_userData_p1:kU,_emscripten_bind_b2BroadPhase____destroy___p0:gB,_emscripten_bind_b2PrismaticJointDef__get_upperTranslation_p0:me,_emscripten_bind_b2ChainShape__set_m_radius_p1:h0,_emscripten_bind_b2GearJointDef__get_joint2_p0:oN,_emscripten_bind_b2PrismaticJointDef__set_localAxisA_p1:mn,_emscripten_bind_b2Fixture__SetDensity_p1:f7,_emscripten_bind_b2RevoluteJointDef__set_enableLimit_p1:nj,_emscripten_bind_b2Body__IsAwake_p0:jC,_emscripten_bind_b2PolygonShape__SetAsBox_p4:jI,_emscripten_bind_b2PolygonShape__SetAsBox_p2:iU,_emscripten_bind_b2GearJointDef__set_joint1_p1:oJ,_emscripten_bind_b2Draw__DrawSolidCircle_p4:hN,_emscripten_bind_b2World__GetSubStepping_p0:gK,_emscripten_bind_b2Body__SetLinearDamping_p1:kj,_emscripten_bind_b2Fixture__SetFriction_p1:f0,_emscripten_bind_b2Filter__get_groupIndex_p0:ku,_emscripten_bind_b2FixtureDef__get_isSensor_p0:lS,_emscripten_bind_b2Vec2__op_mul_p1:lC,_emscripten_bind_b2DistanceProxy__Set_p2:mI,_emscripten_bind_b2EdgeShape__Set_p2:i$,_emscripten_bind_b2BodyDef__get_userData_p0:kO,_emscripten_bind_b2CircleShape__set_m_p_p1:hb,_emscripten_bind_b2World__SetContactFilter_p1:g5,_emscripten_bind_b2WheelJointDef__set_dampingRatio_p1:m2,_emscripten_bind_b2DistanceProxy__get_m_count_p0:lN,_emscripten_bind_b2WeldJointDef__set_dampingRatio_p1:nX,_emscripten_bind_b2DistanceJointDef__set_localAnchorB_p1:oe,_memset:pr,_emscripten_bind_b2World__GetTreeBalance_p0:hr,_emscripten_bind_b2ContactListener__b2ContactListener_p0:it,_emscripten_bind_b2Rot____destroy___p0:mR,_emscripten_bind_b2RopeJointDef__set_maxLength_p1:o0,_emscripten_bind_b2PulleyJointDef__get_groundAnchorA_p0:nB,_emscripten_bind_b2Body__GetNext_p0:jv,_emscripten_bind_b2BroadPhase__GetTreeHeight_p0:gg,_emscripten_bind_b2Draw__DrawSegment_p3:hQ,_emscripten_bind_b2Body__IsActive_p0:ko,_emscripten_bind_b2Vec2__Set_p2:k8,_emscripten_bind_b2ContactEdge__b2ContactEdge_p0:o8,_emscripten_bind_b2Vec3__b2Vec3_p3:mG,_emscripten_bind_b2Vec3__b2Vec3_p0:mF,_emscripten_bind_b2JointDef__b2JointDef_p0:oq,_emscripten_bind_b2Vec2__get_x_p0:k9,_emscripten_bind_b2PulleyJointDef____destroy___p0:om,_emscripten_bind_b2FixtureDef____destroy___p0:mM,_emscripten_bind_b2EdgeShape__Clone_p1:jP,_emscripten_bind_b2Body__GetUserData_p0:jl,_emscripten_bind_b2Body__SetUserData_p1:jp,_emscripten_bind_b2FixtureDef__set_friction_p1:l1,_emscripten_bind_b2DistanceJointDef____destroy___p0:oC,_emscripten_bind_b2FrictionJointDef__Initialize_p3:kG,_emscripten_bind_b2Body__SetSleepingAllowed_p1:jw,_emscripten_bind_b2Body__SetLinearVelocity_p1:jt,_emscripten_bind_b2Body__ApplyLinearImpulse_p2:kc,_emscripten_bind_b2ContactManager__set_m_contactList_p1:fV,_emscripten_bind_b2Transform__get_q_p0:nP,_emscripten_bind_b2JointDef__set_collideConnected_p1:nK,_emscripten_bind_b2CircleShape__ComputeAABB_p3:hH,_emscripten_bind_b2RevoluteJointDef__get_enableLimit_p0:m9,_emscripten_bind_b2BlockAllocator__Allocate_p1:iN,_emscripten_bind_b2GearJointDef__get_joint1_p0:oM,_emscripten_bind_b2GearJointDef__set_ratio_p1:oL,_emscripten_bind_b2ContactEdge____destroy___p0:o7,_emscripten_bind_b2RevoluteJointDef__Initialize_p3:nl,_emscripten_bind_b2BodyDef__set_angle_p1:k$,_emscripten_bind_b2PrismaticJointDef__Initialize_p4:mc,_emscripten_bind_b2Body__GetContactList_p0:kf,_emscripten_bind_b2PulleyJointDef__get_ratio_p0:nq,_emscripten_bind_b2Body__GetWorldCenter_p0:jE,_emscripten_bind_b2RevoluteJointDef__set_enableMotor_p1:nk,_emscripten_bind_b2DistanceJointDef__set_localAnchorA_p1:ob,_emscripten_bind_b2BodyDef__set_angularDamping_p1:kP,_emscripten_bind_b2Shape__ComputeAABB_p3:j$,_emscripten_bind_b2Filter__get_categoryBits_p0:kx,_emscripten_bind_b2Vec3__set_z_p1:lD,_emscripten_bind_b2Transform__set_p_p1:nM,_emscripten_bind_b2Fixture__GetNext_p0:f4,_emscripten_bind_b2World__SetWarmStarting_p1:g4,_emscripten_bind_b2Vec3__op_sub_p0:mH,_emscripten_bind_b2ContactManager__Collide_p0:gm,_emscripten_bind_b2RevoluteJointDef__get_referenceAngle_p0:nh,_emscripten_bind_b2ContactManager__get_m_contactListener_p0:fW,_emscripten_bind_b2World__RayCast_p3:hz,_emscripten_bind_b2PrismaticJointDef__set_enableLimit_p1:l8,_emscripten_bind_b2EdgeShape__GetType_p0:i2,_emscripten_bind_b2BodyDef__get_gravityScale_p0:kS,_emscripten_bind_b2Body__DestroyFixture_p1:li,_emscripten_bind_b2WeldJointDef__set_referenceAngle_p1:nY,_emscripten_bind_b2Vec3__op_add_p1:lG,_emscripten_bind_b2PrismaticJointDef__get_localAnchorA_p0:mh,_emscripten_bind_b2BodyDef__get_angle_p0:k0,_emscripten_bind_b2DynamicTree__GetHeight_p0:hZ,stackAlloc:bk,stackSave:bl,stackRestore:bm,setThrew:bn,setTempRet0:bo,setTempRet1:bp,setTempRet2:bq,setTempRet3:br,setTempRet4:bs,setTempRet5:bt,setTempRet6:bu,setTempRet7:bv,setTempRet8:bw,setTempRet9:bx,dynCall_viiiii:pu,dynCall_viifii:pv,dynCall_vif:pw,dynCall_viffif:px,dynCall_vi:py,dynCall_vii:pz,dynCall_ii:pA,dynCall_viifi:pB,dynCall_if:pC,dynCall_iiiiii:pD,dynCall_iiii:pE,dynCall_fif:pF,dynCall_viff:pG,dynCall_viiiiiiif:pH,dynCall_vifff:pI,dynCall_viiiiii:pJ,dynCall_iiif:pK,dynCall_iif:pL,dynCall_vifii:pM,dynCall_fi:pN,dynCall_iii:pO,dynCall_fiiiif:pP,dynCall_i:pQ,dynCall_iiiii:pR,dynCall_ifff:pS,dynCall_iff:pT,dynCall_viii:pU,dynCall_v:pV,dynCall_viif:pW,dynCall_viiii:pX}})
// EMSCRIPTEN_END_ASM
({ Math: Math, Int8Array: Int8Array, Int16Array: Int16Array, Int32Array: Int32Array, Uint8Array: Uint8Array, Uint16Array: Uint16Array, Uint32Array: Uint32Array, Float32Array: Float32Array, Float64Array: Float64Array }, { abort: abort, assert: assert, asmPrintInt: asmPrintInt, asmPrintFloat: asmPrintFloat, copyTempDouble: copyTempDouble, copyTempFloat: copyTempFloat, min: Math_min, _llvm_va_end: _llvm_va_end, _cosf: _cosf, _floorf: _floorf, ___cxa_throw: ___cxa_throw, _abort: _abort, _fprintf: _fprintf, _printf: _printf, __reallyNegative: __reallyNegative, _sqrtf: _sqrtf, _sysconf: _sysconf, _llvm_lifetime_start: _llvm_lifetime_start, ___setErrNo: ___setErrNo, _fwrite: _fwrite, _llvm_eh_exception: _llvm_eh_exception, _write: _write, _exit: _exit, _llvm_lifetime_end: _llvm_lifetime_end, ___cxa_find_matching_catch: ___cxa_find_matching_catch, _atan2f: _atan2f, ___cxa_pure_virtual: ___cxa_pure_virtual, ___cxa_is_number_type: ___cxa_is_number_type, _time: _time, __formatString: __formatString, ___cxa_does_inherit: ___cxa_does_inherit, ___cxa_guard_acquire: ___cxa_guard_acquire, __ZSt9terminatev: __ZSt9terminatev, _sinf: _sinf, ___assert_func: ___assert_func, __ZSt18uncaught_exceptionv: __ZSt18uncaught_exceptionv, _pwrite: _pwrite, _sbrk: _sbrk, __ZNSt9exceptionD2Ev: __ZNSt9exceptionD2Ev, ___cxa_allocate_exception: ___cxa_allocate_exception, ___errno_location: ___errno_location, ___gxx_personality_v0: ___gxx_personality_v0, ___cxa_call_unexpected: ___cxa_call_unexpected, ___cxa_guard_release: ___cxa_guard_release, __exit: __exit, STACKTOP: STACKTOP, STACK_MAX: STACK_MAX, tempDoublePtr: tempDoublePtr, ABORT: ABORT, NaN: NaN, Infinity: Infinity, __ZTVN10__cxxabiv120__si_class_type_infoE: __ZTVN10__cxxabiv120__si_class_type_infoE, __ZTVN10__cxxabiv117__class_type_infoE: __ZTVN10__cxxabiv117__class_type_infoE, __ZTISt9exception: __ZTISt9exception }, buffer);
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
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_STATIC) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_STATIC));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_STATIC);
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
    var ret = 0;
    calledRun = true;
    if (Module['_main']) {
      preMain();
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
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
if (shouldRunNow) {
  run();
}
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
