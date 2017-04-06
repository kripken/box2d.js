var Box2D = function(Box2D) {
  Box2D = Box2D || {};
  var Module = Box2D;

var b;
b || (b = eval("(function() { try { return Box2D || {} } catch(e) { return {} } })()"));
var aa = {}, ba;
for (ba in b) {
  b.hasOwnProperty(ba) && (aa[ba] = b[ba]);
}
var da = !1, ea = !1, fa = !1, ga = !1;
if (b.ENVIRONMENT) {
  if ("WEB" === b.ENVIRONMENT) {
    da = !0;
  } else {
    if ("WORKER" === b.ENVIRONMENT) {
      ea = !0;
    } else {
      if ("NODE" === b.ENVIRONMENT) {
        fa = !0;
      } else {
        if ("SHELL" === b.ENVIRONMENT) {
          ga = !0;
        } else {
          throw Error("The provided Module['ENVIRONMENT'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL.");
        }
      }
    }
  }
} else {
  da = "object" === typeof window, ea = "function" === typeof importScripts, fa = "object" === typeof process && "function" === typeof require && !da && !ea, ga = !da && !fa && !ea;
}
if (fa) {
  b.print || (b.print = console.log);
  b.printErr || (b.printErr = console.warn);
  var ha, ia;
  b.read = function(a, c) {
    ha || (ha = require("fs"));
    ia || (ia = require("path"));
    a = ia.normalize(a);
    var d = ha.readFileSync(a);
    return c ? d : d.toString();
  };
  b.readBinary = function(a) {
    a = b.read(a, !0);
    a.buffer || (a = new Uint8Array(a));
    assert(a.buffer);
    return a;
  };
  b.load = function(a) {
    ja(read(a));
  };
  b.thisProgram || (b.thisProgram = 1 < process.argv.length ? process.argv[1].replace(/\\/g, "/") : "unknown-program");
  b.arguments = process.argv.slice(2);
  "undefined" !== typeof module && (module.exports = b);
  process.on("uncaughtException", function(a) {
    if (!(a instanceof la)) {
      throw a;
    }
  });
  b.inspect = function() {
    return "[Emscripten Module object]";
  };
} else {
  if (ga) {
    b.print || (b.print = print), "undefined" != typeof printErr && (b.printErr = printErr), b.read = "undefined" != typeof read ? read : function() {
      throw "no read() available";
    }, b.readBinary = function(a) {
      if ("function" === typeof readbuffer) {
        return new Uint8Array(readbuffer(a));
      }
      a = read(a, "binary");
      assert("object" === typeof a);
      return a;
    }, "undefined" != typeof scriptArgs ? b.arguments = scriptArgs : "undefined" != typeof arguments && (b.arguments = arguments), "function" === typeof quit && (b.quit = function(a) {
      quit(a);
    }), eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined");
  } else {
    if (da || ea) {
      b.read = function(a) {
        var c = new XMLHttpRequest;
        c.open("GET", a, !1);
        c.send(null);
        return c.responseText;
      }, ea && (b.readBinary = function(a) {
        var c = new XMLHttpRequest;
        c.open("GET", a, !1);
        c.responseType = "arraybuffer";
        c.send(null);
        return c.response;
      }), b.readAsync = function(a, c, d) {
        var e = new XMLHttpRequest;
        e.open("GET", a, !0);
        e.responseType = "arraybuffer";
        e.onload = function() {
          200 == e.status || 0 == e.status && e.response ? c(e.response) : d();
        };
        e.onerror = d;
        e.send(null);
      }, "undefined" != typeof arguments && (b.arguments = arguments), "undefined" !== typeof console ? (b.print || (b.print = function(a) {
        console.log(a);
      }), b.printErr || (b.printErr = function(a) {
        console.warn(a);
      })) : b.print || (b.print = function() {
      }), ea && (b.load = importScripts), "undefined" === typeof b.setWindowTitle && (b.setWindowTitle = function(a) {
        document.title = a;
      });
    } else {
      throw "Unknown runtime environment. Where are we?";
    }
  }
}
function ja(a) {
  eval.call(null, a);
}
!b.load && b.read && (b.load = function(a) {
  ja(b.read(a));
});
b.print || (b.print = function() {
});
b.printErr || (b.printErr = b.print);
b.arguments || (b.arguments = []);
b.thisProgram || (b.thisProgram = "./this.program");
b.quit || (b.quit = function(a, c) {
  throw c;
});
b.print = b.print;
b.h = b.printErr;
b.preRun = [];
b.postRun = [];
for (ba in aa) {
  aa.hasOwnProperty(ba) && (b[ba] = aa[ba]);
}
var aa = void 0, f = {g:function(a) {
  return tempRet0 = a;
}, J:function() {
  return tempRet0;
}, p:function() {
  return na;
}, j:function(a) {
  na = a;
}, A:function(a) {
  switch(a) {
    case "i1":
    ;
    case "i8":
      return 1;
    case "i16":
      return 2;
    case "i32":
      return 4;
    case "i64":
      return 8;
    case "float":
      return 4;
    case "double":
      return 8;
    default:
      return "*" === a[a.length - 1] ? f.k : "i" === a[0] ? (a = parseInt(a.substr(1)), assert(0 === a % 8), a / 8) : 0;
  }
}, H:function(a) {
  return Math.max(f.A(a), f.k);
}, M:16, ea:function(a, c) {
  "double" === c || "i64" === c ? a & 7 && (assert(4 === (a & 7)), a += 4) : assert(0 === (a & 3));
  return a;
}, V:function(a, c, d) {
  return d || "i64" != a && "double" != a ? a ? Math.min(c || (a ? f.H(a) : 0), f.k) : Math.min(c, 8) : 8;
}, m:function(a, c, d) {
  return d && d.length ? b["dynCall_" + a].apply(null, [c].concat(d)) : b["dynCall_" + a].call(null, c);
}, d:[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], B:function(a) {
  for (var c = 0;c < f.d.length;c++) {
    if (!f.d[c]) {
      return f.d[c] = a, 2 * (1 + c);
    }
  }
  throw "Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.";
}, L:function(a) {
  f.d[(a - 2) / 2] = null;
}, f:function(a) {
  f.f.o || (f.f.o = {});
  f.f.o[a] || (f.f.o[a] = 1, b.h(a));
}, n:{}, X:function(a, c) {
  assert(c);
  f.n[c] || (f.n[c] = {});
  var d = f.n[c];
  d[a] || (d[a] = 1 === c.length ? function() {
    return f.m(c, a);
  } : 2 === c.length ? function(d) {
    return f.m(c, a, [d]);
  } : function() {
    return f.m(c, a, Array.prototype.slice.call(arguments));
  });
  return d[a];
}, W:function() {
  throw "You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work";
}, i:function(a) {
  var c = na;
  na = na + a | 0;
  na = na + 15 & -16;
  return c;
}, q:function(a) {
  var c = oa;
  oa = oa + a | 0;
  oa = oa + 15 & -16;
  return c;
}, v:function(a) {
  var c = pa[ra >> 2];
  a = (c + a + 15 | 0) & -16;
  pa[ra >> 2] = a;
  if (a = a >= sa) {
    ua(), a = !0;
  }
  return a ? (pa[ra >> 2] = c, 0) : c;
}, t:function(a, c) {
  return Math.ceil(a / (c ? c : 16)) * (c ? c : 16);
}, da:function(a, c, d) {
  return d ? +(a >>> 0) + 4294967296 * +(c >>> 0) : +(a >>> 0) + 4294967296 * +(c | 0);
}, s:1024, k:4, N:0};
b.Runtime = f;
f.addFunction = f.B;
f.removeFunction = f.L;
var wa = 0;
function assert(a, c) {
  a || xa("Assertion failed: " + c);
}
function za(a) {
  var c = b["_" + a];
  if (!c) {
    try {
      c = eval("_" + a);
    } catch (d) {
    }
  }
  assert(c, "Cannot call unknown function " + a + " (perhaps LLVM optimizations or closure removed it?)");
  return c;
}
var Aa, Ba;
(function() {
  function a(a) {
    a = a.toString().match(g).slice(1);
    return {arguments:a[0], body:a[1], returnValue:a[2]};
  }
  function c() {
    if (!m) {
      m = {};
      for (var c in d) {
        d.hasOwnProperty(c) && (m[c] = a(d[c]));
      }
    }
  }
  var d = {stackSave:function() {
    f.p();
  }, stackRestore:function() {
    f.j();
  }, arrayToC:function(a) {
    var c = f.i(a.length);
    Ca(a, c);
    return c;
  }, stringToC:function(a) {
    var c = 0;
    if (null !== a && void 0 !== a && 0 !== a) {
      var d = (a.length << 2) + 1, c = f.i(d);
      Da(a, c, d);
    }
    return c;
  }}, e = {string:d.stringToC, array:d.arrayToC};
  Ba = function(a, c, d, g, m) {
    a = za(a);
    var ma = [], ya = 0;
    if (g) {
      for (var Q = 0;Q < g.length;Q++) {
        var rb = e[d[Q]];
        rb ? (0 === ya && (ya = f.p()), ma[Q] = rb(g[Q])) : ma[Q] = g[Q];
      }
    }
    d = a.apply(null, ma);
    "string" === c && (d = Ea(d));
    if (0 !== ya) {
      if (m && m.async) {
        EmterpreterAsync.P.push(function() {
          f.j(ya);
        });
        return;
      }
      f.j(ya);
    }
    return d;
  };
  var g = /^function\s*[a-zA-Z$_0-9]*\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/, m = null;
  Aa = function(d, e, g) {
    g = g || [];
    var ka = za(d);
    d = g.every(function(a) {
      return "number" === a;
    });
    var Pa = "string" !== e;
    if (Pa && d) {
      return ka;
    }
    var ma = g.map(function(a, c) {
      return "$" + c;
    });
    e = "(function(" + ma.join(",") + ") {";
    var ya = g.length;
    if (!d) {
      c();
      e += "var stack = " + m.stackSave.body + ";";
      for (var Q = 0;Q < ya;Q++) {
        var rb = ma[Q], jb = g[Q];
        "number" !== jb && (jb = m[jb + "ToC"], e += "var " + jb.arguments + " = " + rb + ";", e += jb.body + ";", e += rb + "=(" + jb.returnValue + ");");
      }
    }
    g = a(function() {
      return ka;
    }).returnValue;
    e += "var ret = " + g + "(" + ma.join(",") + ");";
    Pa || (g = a(function() {
      return Ea;
    }).returnValue, e += "ret = " + g + "(ret);");
    d || (c(), e += m.stackRestore.body.replace("()", "(stack)") + ";");
    return eval(e + "return ret})");
  };
})();
b.ccall = Ba;
b.cwrap = Aa;
function Fa(a, c, d) {
  d = d || "i8";
  "*" === d.charAt(d.length - 1) && (d = "i32");
  switch(d) {
    case "i1":
      Ga[a >> 0] = c;
      break;
    case "i8":
      Ga[a >> 0] = c;
      break;
    case "i16":
      Ha[a >> 1] = c;
      break;
    case "i32":
      pa[a >> 2] = c;
      break;
    case "i64":
      tempI64 = [c >>> 0, (tempDouble = c, 1 <= +Ia(tempDouble) ? 0 < tempDouble ? (Ja(+La(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Ma((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)];
      pa[a >> 2] = tempI64[0];
      pa[a + 4 >> 2] = tempI64[1];
      break;
    case "float":
      Na[a >> 2] = c;
      break;
    case "double":
      Oa[a >> 3] = c;
      break;
    default:
      xa("invalid type for setValue: " + d);
  }
}
b.setValue = Fa;
function Qa(a, c) {
  c = c || "i8";
  "*" === c.charAt(c.length - 1) && (c = "i32");
  switch(c) {
    case "i1":
      return Ga[a >> 0];
    case "i8":
      return Ga[a >> 0];
    case "i16":
      return Ha[a >> 1];
    case "i32":
      return pa[a >> 2];
    case "i64":
      return pa[a >> 2];
    case "float":
      return Na[a >> 2];
    case "double":
      return Oa[a >> 3];
    default:
      xa("invalid type for setValue: " + c);
  }
  return null;
}
b.getValue = Qa;
b.ALLOC_NORMAL = 0;
b.ALLOC_STACK = 1;
b.ALLOC_STATIC = 2;
b.ALLOC_DYNAMIC = 3;
b.ALLOC_NONE = 4;
function Ra(a, c, d, e) {
  var g, m;
  "number" === typeof a ? (g = !0, m = a) : (g = !1, m = a.length);
  var l = "string" === typeof c ? c : null;
  d = 4 == d ? e : ["function" === typeof Sa ? Sa : f.q, f.i, f.q, f.v][void 0 === d ? 2 : d](Math.max(m, l ? 1 : c.length));
  if (g) {
    e = d;
    assert(0 == (d & 3));
    for (a = d + (m & -4);e < a;e += 4) {
      pa[e >> 2] = 0;
    }
    for (a = d + m;e < a;) {
      Ga[e++ >> 0] = 0;
    }
    return d;
  }
  if ("i8" === l) {
    return a.subarray || a.slice ? Ta.set(a, d) : Ta.set(new Uint8Array(a), d), d;
  }
  e = 0;
  for (var O, ta;e < m;) {
    var ka = a[e];
    "function" === typeof ka && (ka = f.Y(ka));
    g = l || c[e];
    0 === g ? e++ : ("i64" == g && (g = "i32"), Fa(d + e, ka, g), ta !== g && (O = f.A(g), ta = g), e += O);
  }
  return d;
}
b.allocate = Ra;
b.getMemory = function(a) {
  return Ua ? Va ? Sa(a) : f.v(a) : f.q(a);
};
function Ea(a, c) {
  if (0 === c || !a) {
    return "";
  }
  for (var d = 0, e, g = 0;;) {
    e = Ta[a + g >> 0];
    d |= e;
    if (0 == e && !c) {
      break;
    }
    g++;
    if (c && g == c) {
      break;
    }
  }
  c || (c = g);
  e = "";
  if (128 > d) {
    for (;0 < c;) {
      d = String.fromCharCode.apply(String, Ta.subarray(a, a + Math.min(c, 1024))), e = e ? e + d : d, a += 1024, c -= 1024;
    }
    return e;
  }
  return b.UTF8ToString(a);
}
b.Pointer_stringify = Ea;
b.AsciiToString = function(a) {
  for (var c = "";;) {
    var d = Ga[a++ >> 0];
    if (!d) {
      return c;
    }
    c += String.fromCharCode(d);
  }
};
b.stringToAscii = function(a, c) {
  return Wa(a, c, !1);
};
var Ya = "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0;
function Za(a, c) {
  for (var d = c;a[d];) {
    ++d;
  }
  if (16 < d - c && a.subarray && Ya) {
    return Ya.decode(a.subarray(c, d));
  }
  for (var e, g, m, l, O, ta, d = "";;) {
    e = a[c++];
    if (!e) {
      return d;
    }
    e & 128 ? (g = a[c++] & 63, 192 == (e & 224) ? d += String.fromCharCode((e & 31) << 6 | g) : (m = a[c++] & 63, 224 == (e & 240) ? e = (e & 15) << 12 | g << 6 | m : (l = a[c++] & 63, 240 == (e & 248) ? e = (e & 7) << 18 | g << 12 | m << 6 | l : (O = a[c++] & 63, 248 == (e & 252) ? e = (e & 3) << 24 | g << 18 | m << 12 | l << 6 | O : (ta = a[c++] & 63, e = (e & 1) << 30 | g << 24 | m << 18 | l << 12 | O << 6 | ta))), 65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | 
    e >> 10, 56320 | e & 1023)))) : d += String.fromCharCode(e);
  }
}
b.UTF8ArrayToString = Za;
b.UTF8ToString = function(a) {
  return Za(Ta, a);
};
function $a(a, c, d, e) {
  if (!(0 < e)) {
    return 0;
  }
  var g = d;
  e = d + e - 1;
  for (var m = 0;m < a.length;++m) {
    var l = a.charCodeAt(m);
    55296 <= l && 57343 >= l && (l = 65536 + ((l & 1023) << 10) | a.charCodeAt(++m) & 1023);
    if (127 >= l) {
      if (d >= e) {
        break;
      }
      c[d++] = l;
    } else {
      if (2047 >= l) {
        if (d + 1 >= e) {
          break;
        }
        c[d++] = 192 | l >> 6;
      } else {
        if (65535 >= l) {
          if (d + 2 >= e) {
            break;
          }
          c[d++] = 224 | l >> 12;
        } else {
          if (2097151 >= l) {
            if (d + 3 >= e) {
              break;
            }
            c[d++] = 240 | l >> 18;
          } else {
            if (67108863 >= l) {
              if (d + 4 >= e) {
                break;
              }
              c[d++] = 248 | l >> 24;
            } else {
              if (d + 5 >= e) {
                break;
              }
              c[d++] = 252 | l >> 30;
              c[d++] = 128 | l >> 24 & 63;
            }
            c[d++] = 128 | l >> 18 & 63;
          }
          c[d++] = 128 | l >> 12 & 63;
        }
        c[d++] = 128 | l >> 6 & 63;
      }
      c[d++] = 128 | l & 63;
    }
  }
  c[d] = 0;
  return d - g;
}
b.stringToUTF8Array = $a;
function Da(a, c, d) {
  return $a(a, Ta, c, d);
}
b.stringToUTF8 = Da;
function ab(a) {
  for (var c = 0, d = 0;d < a.length;++d) {
    var e = a.charCodeAt(d);
    55296 <= e && 57343 >= e && (e = 65536 + ((e & 1023) << 10) | a.charCodeAt(++d) & 1023);
    127 >= e ? ++c : c = 2047 >= e ? c + 2 : 65535 >= e ? c + 3 : 2097151 >= e ? c + 4 : 67108863 >= e ? c + 5 : c + 6;
  }
  return c;
}
b.lengthBytesUTF8 = ab;
"undefined" !== typeof TextDecoder && new TextDecoder("utf-16le");
function bb(a) {
  return a.replace(/__Z[\w\d_]+/g, function(a) {
    var d;
    a: {
      var e = b.___cxa_demangle || b.__cxa_demangle;
      if (e) {
        try {
          var g = a.substr(1), m = ab(g) + 1, l = Sa(m);
          Da(g, l, m);
          var O = Sa(4), ta = e(l, 0, 0, O);
          if (0 === Qa(O, "i32") && ta) {
            d = Ea(ta);
            break a;
          }
        } catch (ka) {
        } finally {
          l && cb(l), O && cb(O), ta && cb(ta);
        }
      } else {
        f.f("warning: build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling");
      }
      d = a;
    }
    return a === d ? a : a + " [" + d + "]";
  });
}
function db() {
  var a;
  a: {
    a = Error();
    if (!a.stack) {
      try {
        throw Error(0);
      } catch (c) {
        a = c;
      }
      if (!a.stack) {
        a = "(no stack trace available)";
        break a;
      }
    }
    a = a.stack.toString();
  }
  b.extraStackTrace && (a += "\n" + b.extraStackTrace());
  return bb(a);
}
b.stackTrace = db;
var buffer, Ga, Ta, Ha, eb, pa, fb, Na, Oa;
function gb() {
  b.HEAP8 = Ga = new Int8Array(buffer);
  b.HEAP16 = Ha = new Int16Array(buffer);
  b.HEAP32 = pa = new Int32Array(buffer);
  b.HEAPU8 = Ta = new Uint8Array(buffer);
  b.HEAPU16 = eb = new Uint16Array(buffer);
  b.HEAPU32 = fb = new Uint32Array(buffer);
  b.HEAPF32 = Na = new Float32Array(buffer);
  b.HEAPF64 = Oa = new Float64Array(buffer);
}
var hb, oa, Ua, ib, na, kb, lb, ra;
hb = oa = ib = na = kb = lb = ra = 0;
Ua = !1;
function ua() {
  xa("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + sa + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ");
}
var nb = b.TOTAL_STACK || 5242880, sa = b.TOTAL_MEMORY || 16777216;
sa < nb && b.h("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + sa + "! (TOTAL_STACK=" + nb + ")");
b.buffer ? buffer = b.buffer : "object" === typeof WebAssembly && "function" === typeof WebAssembly.Memory ? (b.wasmMemory = new WebAssembly.Memory({initial:sa / 65536, maximum:sa / 65536}), buffer = b.wasmMemory.buffer) : buffer = new ArrayBuffer(sa);
gb();
pa[0] = 1668509029;
Ha[1] = 25459;
if (115 !== Ta[2] || 99 !== Ta[3]) {
  throw "Runtime error: expected the system to be little-endian!";
}
b.HEAP = void 0;
b.buffer = buffer;
b.HEAP8 = Ga;
b.HEAP16 = Ha;
b.HEAP32 = pa;
b.HEAPU8 = Ta;
b.HEAPU16 = eb;
b.HEAPU32 = fb;
b.HEAPF32 = Na;
b.HEAPF64 = Oa;
function ob(a) {
  for (;0 < a.length;) {
    var c = a.shift();
    if ("function" == typeof c) {
      c();
    } else {
      var d = c.U;
      "number" === typeof d ? void 0 === c.l ? b.dynCall_v(d) : b.dynCall_vi(d, c.l) : d(void 0 === c.l ? null : c.l);
    }
  }
}
var pb = [], qb = [], sb = [], tb = [], ub = [], Va = !1;
function vb(a) {
  pb.unshift(a);
}
b.addOnPreRun = vb;
b.addOnInit = function(a) {
  qb.unshift(a);
};
function wb(a) {
  sb.unshift(a);
}
b.addOnPreMain = wb;
b.addOnExit = function(a) {
  tb.unshift(a);
};
function xb(a) {
  ub.unshift(a);
}
b.addOnPostRun = xb;
function yb(a, c, d) {
  d = Array(0 < d ? d : ab(a) + 1);
  a = $a(a, d, 0, d.length);
  c && (d.length = a);
  return d;
}
b.intArrayFromString = yb;
b.intArrayToString = function(a) {
  for (var c = [], d = 0;d < a.length;d++) {
    var e = a[d];
    255 < e && (e &= 255);
    c.push(String.fromCharCode(e));
  }
  return c.join("");
};
b.writeStringToMemory = function(a, c, d) {
  f.f("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!");
  var e, g;
  d && (g = c + ab(a), e = Ga[g]);
  Da(a, c, Infinity);
  d && (Ga[g] = e);
};
function Ca(a, c) {
  Ga.set(a, c);
}
b.writeArrayToMemory = Ca;
function Wa(a, c, d) {
  for (var e = 0;e < a.length;++e) {
    Ga[c++ >> 0] = a.charCodeAt(e);
  }
  d || (Ga[c >> 0] = 0);
}
b.writeAsciiToMemory = Wa;
Math.imul && -5 === Math.imul(4294967295, 5) || (Math.imul = function(a, c) {
  var d = a & 65535, e = c & 65535;
  return d * e + ((a >>> 16) * e + d * (c >>> 16) << 16) | 0;
});
Math.$ = Math.imul;
if (!Math.fround) {
  var zb = new Float32Array(1);
  Math.fround = function(a) {
    zb[0] = a;
    return zb[0];
  };
}
Math.T = Math.fround;
Math.clz32 || (Math.clz32 = function(a) {
  a = a >>> 0;
  for (var c = 0;32 > c;c++) {
    if (a & 1 << 31 - c) {
      return c;
    }
  }
  return 32;
});
Math.R = Math.clz32;
Math.trunc || (Math.trunc = function(a) {
  return 0 > a ? Math.ceil(a) : Math.floor(a);
});
Math.trunc = Math.trunc;
var Ia = Math.abs, Ma = Math.ceil, La = Math.floor, Ja = Math.min, Ab = 0, Bb = null, Cb = null;
function Db() {
  Ab++;
  b.monitorRunDependencies && b.monitorRunDependencies(Ab);
}
b.addRunDependency = Db;
function Eb() {
  Ab--;
  b.monitorRunDependencies && b.monitorRunDependencies(Ab);
  if (0 == Ab && (null !== Bb && (clearInterval(Bb), Bb = null), Cb)) {
    var a = Cb;
    Cb = null;
    a();
  }
}
b.removeRunDependency = Eb;
b.preloadedImages = {};
b.preloadedAudios = {};
var Fb = null;
(function(a) {
  function c(a, c) {
    var d = ma;
    if (0 > a.indexOf(".")) {
      d = (d || {})[a];
    } else {
      var e = a.split("."), d = (d || {})[e[0]], d = (d || {})[e[1]]
    }
    c && (d = (d || {})[c]);
    void 0 === d && xa("bad lookupImport to (" + a + ")." + c);
    return d;
  }
  function d(c) {
    var d = a.buffer;
    c.byteLength < d.byteLength && a.printErr("the new buffer in mergeMemory is smaller than the previous one. in native wasm, we should grow memory here");
    var d = new Int8Array(d), e = new Int8Array(c);
    Fb || d.set(e.subarray(a.STATIC_BASE, a.STATIC_BASE + a.STATIC_BUMP), a.STATIC_BASE);
    e.set(d);
    b.buffer = buffer = c;
    gb();
  }
  function e() {
    var c;
    if (a.wasmBinary) {
      c = a.wasmBinary, c = new Uint8Array(c);
    } else {
      if (a.readBinary) {
        c = a.readBinary(ka);
      } else {
        throw "on the web, we need the wasm binary to be preloaded and set on Module['wasmBinary']. emcc.py will do that for you when generating HTML (but not JS)";
      }
    }
    return c;
  }
  function g() {
    return a.wasmBinary || "function" !== typeof fetch ? new Promise(function(a) {
      a(e());
    }) : fetch(ka).then(function(a) {
      return a.O();
    });
  }
  function m(c, d, e) {
    if ("function" !== typeof a.asm || a.asm === Q) {
      a.asmPreload ? a.asm = a.asmPreload : eval(a.read(Pa));
    }
    return "function" !== typeof a.asm ? (a.printErr("asm evalling did not set the module properly"), !1) : a.asm(c, d, e);
  }
  function l(c, e) {
    function l(c) {
      ya = c.exports;
      ya.memory && d(ya.memory);
      a.asm = ya;
      a.usingWasm = !0;
      Eb();
    }
    if ("object" !== typeof WebAssembly) {
      return a.printErr("no native wasm support detected"), !1;
    }
    if (!(a.wasmMemory instanceof WebAssembly.Memory)) {
      return a.printErr("no native wasm Memory in use"), !1;
    }
    e.memory = a.wasmMemory;
    ma.global = {NaN:NaN, Infinity:Infinity};
    ma["global.Math"] = c.Math;
    ma.env = e;
    Db();
    if (a.instantiateWasm) {
      try {
        return a.instantiateWasm(ma, l);
      } catch (m) {
        return a.printErr("Module.instantiateWasm callback failed with error: " + m), !1;
      }
    }
    a.printErr("asynchronously preparing wasm");
    g().then(function(a) {
      return WebAssembly.instantiate(a, ma);
    }).then(function(a) {
      l(a.aa);
    }).catch(function(c) {
      a.printErr("failed to asynchronously prepare wasm: " + c);
      a.quit(1, c);
    });
    return {};
  }
  var O = a.wasmJSMethod || "native-wasm";
  a.wasmJSMethod = O;
  var ta = a.wasmTextFile || "Box2D_v2.2.1_min.wasm.wast", ka = a.wasmBinaryFile || "Box2D_v2.2.1_min.wasm.wasm", Pa = a.asmjsCodeFile || "Box2D_v2.2.1_min.wasm.temp.asm.js", ma = {global:null, env:null, asm2wasm:{"f64-rem":function(a, c) {
    return a % c;
  }, "f64-to-int":function(a) {
    return a | 0;
  }, "i32s-div":function(a, c) {
    return (a | 0) / (c | 0) | 0;
  }, "i32u-div":function(a, c) {
    return (a >>> 0) / (c >>> 0) >>> 0;
  }, "i32s-rem":function(a, c) {
    return (a | 0) % (c | 0) | 0;
  }, "i32u-rem":function(a, c) {
    return (a >>> 0) % (c >>> 0) >>> 0;
  }, "debugger":function() {
    debugger;
  }}, parent:a}, ya = null;
  a.asmPreload = a.asm;
  a.reallocBuffer = function(c) {
    var d = a.usingWasm ? 65536 : 16777216;
    0 < c % d && (c += d - c % d);
    var d = a.buffer, e = d.byteLength;
    if (a.usingWasm) {
      try {
        return -1 !== a.wasmMemory.Z((c - e) / 65536) ? a.buffer = a.wasmMemory.buffer : null;
      } catch (g) {
        return null;
      }
    } else {
      return ya.__growWasmMemory((c - e) / 65536), a.buffer !== d ? a.buffer : null;
    }
  };
  a.asm = function(g, Q, ka) {
    if (!Q.table) {
      var Xa = a.wasmTableSize;
      void 0 === Xa && (Xa = 1024);
      var mb = a.wasmMaxTableSize;
      Q.table = "object" === typeof WebAssembly && "function" === typeof WebAssembly.Table ? void 0 !== mb ? new WebAssembly.Table({initial:Xa, maximum:mb, element:"anyfunc"}) : new WebAssembly.Table({initial:Xa, element:"anyfunc"}) : Array(Xa);
      a.wasmTable = Q.table;
    }
    Q.memoryBase || (Q.memoryBase = a.STATIC_BASE);
    Q.tableBase || (Q.tableBase = 0);
    for (var ca, Xa = O.split(","), mb = 0;mb < Xa.length;mb++) {
      if (ca = Xa[mb], a.printErr("trying binaryen method: " + ca), "native-wasm" === ca) {
        if (ca = l(g, Q)) {
          break;
        }
      } else {
        if ("asmjs" === ca) {
          if (ca = m(g, Q, ka)) {
            break;
          }
        } else {
          if ("interpret-asm2wasm" === ca || "interpret-s-expr" === ca || "interpret-binary" === ca) {
            var Ka = g, va = Q, Xb = ka;
            if ("function" !== typeof WasmJS) {
              a.printErr("WasmJS not detected - polyfill not bundled?"), ca = !1;
            } else {
              var qa = WasmJS({});
              qa.outside = a;
              qa.info = ma;
              qa.lookupImport = c;
              assert(Xb === a.buffer);
              ma.global = Ka;
              ma.env = va;
              assert(Xb === a.buffer);
              va.memory = Xb;
              assert(va.memory instanceof ArrayBuffer);
              qa.providedTotalMemory = a.buffer.byteLength;
              Ka = void 0;
              Ka = "interpret-binary" === ca ? e() : a.read("interpret-asm2wasm" == ca ? Pa : ta);
              va = void 0;
              if ("interpret-asm2wasm" == ca) {
                va = qa._malloc(Ka.length + 1), qa.writeAsciiToMemory(Ka, va), qa._load_asm2wasm(va);
              } else {
                if ("interpret-s-expr" === ca) {
                  va = qa._malloc(Ka.length + 1), qa.writeAsciiToMemory(Ka, va), qa._load_s_expr2wasm(va);
                } else {
                  if ("interpret-binary" === ca) {
                    va = qa._malloc(Ka.length), qa.HEAPU8.set(Ka, va), qa._load_binary2wasm(va, Ka.length);
                  } else {
                    throw "what? " + ca;
                  }
                }
              }
              qa._free(va);
              qa._instantiate(va);
              a.newBuffer && (d(a.newBuffer), a.newBuffer = null);
              ca = ya = qa.asmExports;
            }
            if (ca) {
              break;
            }
          } else {
            throw "bad method: " + ca;
          }
        }
      }
    }
    if (!ca) {
      throw "no binaryen method succeeded. consider enabling more options, like interpreting, if you want that: https://github.com/kripken/emscripten/wiki/WebAssembly#binaryen-methods";
    }
    a.printErr("binaryen method succeeded.");
    return ca;
  };
  var Q = a.asm;
})(b);
var Gb = [function(a, c) {
  var d = b.getCache(b.JSDestructionListener)[a];
  if (!d.hasOwnProperty("SayGoodbyeJoint")) {
    throw "a JSImplementation must implement all functions, you forgot JSDestructionListener::SayGoodbyeJoint.";
  }
  d.SayGoodbyeJoint(c);
}, function(a, c) {
  var d = b.getCache(b.JSDestructionListener)[a];
  if (!d.hasOwnProperty("SayGoodbyeFixture")) {
    throw "a JSImplementation must implement all functions, you forgot JSDestructionListener::SayGoodbyeFixture.";
  }
  d.SayGoodbyeFixture(c);
}, function(a, c) {
  var d = b.getCache(b.JSQueryCallback)[a];
  if (!d.hasOwnProperty("ReportFixture")) {
    throw "a JSImplementation must implement all functions, you forgot JSQueryCallback::ReportFixture.";
  }
  return d.ReportFixture(c);
}, function(a, c, d, e, g) {
  a = b.getCache(b.JSRayCastCallback)[a];
  if (!a.hasOwnProperty("ReportFixture")) {
    throw "a JSImplementation must implement all functions, you forgot JSRayCastCallback::ReportFixture.";
  }
  return a.ReportFixture(c, d, e, g);
}, function(a, c) {
  var d = b.getCache(b.JSContactListener)[a];
  if (!d.hasOwnProperty("BeginContact")) {
    throw "a JSImplementation must implement all functions, you forgot JSContactListener::BeginContact.";
  }
  d.BeginContact(c);
}, function(a, c) {
  var d = b.getCache(b.JSContactListener)[a];
  if (!d.hasOwnProperty("EndContact")) {
    throw "a JSImplementation must implement all functions, you forgot JSContactListener::EndContact.";
  }
  d.EndContact(c);
}, function(a, c, d) {
  a = b.getCache(b.JSContactListener)[a];
  if (!a.hasOwnProperty("PreSolve")) {
    throw "a JSImplementation must implement all functions, you forgot JSContactListener::PreSolve.";
  }
  a.PreSolve(c, d);
}, function(a, c, d) {
  a = b.getCache(b.JSContactListener)[a];
  if (!a.hasOwnProperty("PostSolve")) {
    throw "a JSImplementation must implement all functions, you forgot JSContactListener::PostSolve.";
  }
  a.PostSolve(c, d);
}, function(a, c, d) {
  a = b.getCache(b.JSContactFilter)[a];
  if (!a.hasOwnProperty("ShouldCollide")) {
    throw "a JSImplementation must implement all functions, you forgot JSContactFilter::ShouldCollide.";
  }
  return a.ShouldCollide(c, d);
}, function(a, c, d, e) {
  a = b.getCache(b.JSDraw)[a];
  if (!a.hasOwnProperty("DrawPolygon")) {
    throw "a JSImplementation must implement all functions, you forgot JSDraw::DrawPolygon.";
  }
  a.DrawPolygon(c, d, e);
}, function(a, c, d, e) {
  a = b.getCache(b.JSDraw)[a];
  if (!a.hasOwnProperty("DrawSolidPolygon")) {
    throw "a JSImplementation must implement all functions, you forgot JSDraw::DrawSolidPolygon.";
  }
  a.DrawSolidPolygon(c, d, e);
}, function(a, c, d, e) {
  a = b.getCache(b.JSDraw)[a];
  if (!a.hasOwnProperty("DrawCircle")) {
    throw "a JSImplementation must implement all functions, you forgot JSDraw::DrawCircle.";
  }
  a.DrawCircle(c, d, e);
}, function(a, c, d, e, g) {
  a = b.getCache(b.JSDraw)[a];
  if (!a.hasOwnProperty("DrawSolidCircle")) {
    throw "a JSImplementation must implement all functions, you forgot JSDraw::DrawSolidCircle.";
  }
  a.DrawSolidCircle(c, d, e, g);
}, function(a, c, d, e) {
  a = b.getCache(b.JSDraw)[a];
  if (!a.hasOwnProperty("DrawSegment")) {
    throw "a JSImplementation must implement all functions, you forgot JSDraw::DrawSegment.";
  }
  a.DrawSegment(c, d, e);
}, function(a, c) {
  var d = b.getCache(b.JSDraw)[a];
  if (!d.hasOwnProperty("DrawTransform")) {
    throw "a JSImplementation must implement all functions, you forgot JSDraw::DrawTransform.";
  }
  d.DrawTransform(c);
}];
hb = 1024;
oa = hb + 22992;
qb.push();
Fb = 0 <= b.wasmJSMethod.indexOf("asmjs") || 0 <= b.wasmJSMethod.indexOf("interpret-asm2wasm") ? "Box2D_v2.2.1_min.wasm.js.mem" : null;
b.STATIC_BASE = hb;
b.STATIC_BUMP = 22992;
var Hb = oa;
oa += 16;
b._memset = Ib;
function Jb() {
  return !!Jb.e;
}
var Kb = 0, Lb = [], Mb = {};
function Nb(a, c) {
  Nb.e || (Nb.e = {});
  a in Nb.e || (b.dynCall_v(c), Nb.e[a] = 1);
}
b._memcpy = Ob;
var Pb = 0;
function Qb() {
  Pb += 4;
  return pa[Pb - 4 >> 2];
}
var Rb = {}, Sb = {};
b._sbrk = Tb;
var Ub = 1;
function Vb() {
  var a = Kb;
  if (!a) {
    return (f.g(0), 0) | 0;
  }
  var c = Mb[a], d = c.type;
  if (!d) {
    return (f.g(0), a) | 0;
  }
  var e = Array.prototype.slice.call(arguments);
  b.___cxa_is_pointer_type(d);
  Vb.buffer || (Vb.buffer = Sa(4));
  pa[Vb.buffer >> 2] = a;
  for (var a = Vb.buffer, g = 0;g < e.length;g++) {
    if (e[g] && b.___cxa_can_catch(e[g], d, a)) {
      return a = pa[a >> 2], c.C = a, (f.g(e[g]), a) | 0;
    }
  }
  a = pa[a >> 2];
  return (f.g(d), a) | 0;
}
b._llvm_bswap_i32 = Wb;
function Yb(a, c) {
  Pb = c;
  try {
    var d = Qb(), e = Qb(), g = Qb(), m = 0;
    Yb.buffer || (Yb.e = [null, [], []], Yb.u = function(a, c) {
      var d = Yb.e[a];
      assert(d);
      0 === c || 10 === c ? ((1 === a ? b.print : b.printErr)(Za(d, 0)), d.length = 0) : d.push(c);
    });
    for (var l = 0;l < g;l++) {
      for (var O = pa[e + 8 * l >> 2], ta = pa[e + (8 * l + 4) >> 2], ka = 0;ka < ta;ka++) {
        Yb.u(d, Ta[O + ka]);
      }
      m += ta;
    }
    return m;
  } catch (Pa) {
    return "undefined" !== typeof FS && Pa instanceof FS.r || xa(Pa), -Pa.w;
  }
}
tb.push(function() {
  var a = b._fflush;
  a && a(0);
  if (a = Yb.u) {
    var c = Yb.e;
    c[1].length && a(1, 10);
    c[2].length && a(2, 10);
  }
});
ra = Ra(1, "i32", 2);
ib = na = f.t(oa);
kb = ib + nb;
lb = f.t(kb);
pa[ra >> 2] = lb;
Ua = !0;
b.wasmTableSize = 1152;
b.wasmMaxTableSize = 1152;
b.D = {Math:Math, Int8Array:Int8Array, Int16Array:Int16Array, Int32Array:Int32Array, Uint8Array:Uint8Array, Uint16Array:Uint16Array, Uint32Array:Uint32Array, Float32Array:Float32Array, Float64Array:Float64Array, NaN:NaN, Infinity:Infinity};
b.F = {abort:xa, assert:assert, enlargeMemory:function() {
  ua();
}, getTotalMemory:function() {
  return sa;
}, abortOnCannotGrowMemory:ua, invoke_iiii:function(a, c, d, e) {
  try {
    return b.dynCall_iiii(a, c, d, e);
  } catch (g) {
    if ("number" !== typeof g && "longjmp" !== g) {
      throw g;
    }
    b.setThrew(1, 0);
  }
}, jsCall_iiii:function(a, c, d, e) {
  return f.d[a](c, d, e);
}, invoke_viifii:function(a, c, d, e, g, m) {
  try {
    b.dynCall_viifii(a, c, d, e, g, m);
  } catch (l) {
    if ("number" !== typeof l && "longjmp" !== l) {
      throw l;
    }
    b.setThrew(1, 0);
  }
}, jsCall_viifii:function(a, c, d, e, g, m) {
  f.d[a](c, d, e, g, m);
}, invoke_viiiii:function(a, c, d, e, g, m) {
  try {
    b.dynCall_viiiii(a, c, d, e, g, m);
  } catch (l) {
    if ("number" !== typeof l && "longjmp" !== l) {
      throw l;
    }
    b.setThrew(1, 0);
  }
}, jsCall_viiiii:function(a, c, d, e, g, m) {
  f.d[a](c, d, e, g, m);
}, invoke_vi:function(a, c) {
  try {
    b.dynCall_vi(a, c);
  } catch (d) {
    if ("number" !== typeof d && "longjmp" !== d) {
      throw d;
    }
    b.setThrew(1, 0);
  }
}, jsCall_vi:function(a, c) {
  f.d[a](c);
}, invoke_vii:function(a, c, d) {
  try {
    b.dynCall_vii(a, c, d);
  } catch (e) {
    if ("number" !== typeof e && "longjmp" !== e) {
      throw e;
    }
    b.setThrew(1, 0);
  }
}, jsCall_vii:function(a, c, d) {
  f.d[a](c, d);
}, invoke_ii:function(a, c) {
  try {
    return b.dynCall_ii(a, c);
  } catch (d) {
    if ("number" !== typeof d && "longjmp" !== d) {
      throw d;
    }
    b.setThrew(1, 0);
  }
}, jsCall_ii:function(a, c) {
  return f.d[a](c);
}, invoke_fif:function(a, c, d) {
  try {
    return b.dynCall_fif(a, c, d);
  } catch (e) {
    if ("number" !== typeof e && "longjmp" !== e) {
      throw e;
    }
    b.setThrew(1, 0);
  }
}, jsCall_fif:function(a, c, d) {
  return f.d[a](c, d);
}, invoke_viii:function(a, c, d, e) {
  try {
    b.dynCall_viii(a, c, d, e);
  } catch (g) {
    if ("number" !== typeof g && "longjmp" !== g) {
      throw g;
    }
    b.setThrew(1, 0);
  }
}, jsCall_viii:function(a, c, d, e) {
  f.d[a](c, d, e);
}, invoke_viifi:function(a, c, d, e, g) {
  try {
    b.dynCall_viifi(a, c, d, e, g);
  } catch (m) {
    if ("number" !== typeof m && "longjmp" !== m) {
      throw m;
    }
    b.setThrew(1, 0);
  }
}, jsCall_viifi:function(a, c, d, e, g) {
  f.d[a](c, d, e, g);
}, invoke_v:function(a) {
  try {
    b.dynCall_v(a);
  } catch (c) {
    if ("number" !== typeof c && "longjmp" !== c) {
      throw c;
    }
    b.setThrew(1, 0);
  }
}, jsCall_v:function(a) {
  f.d[a]();
}, invoke_viif:function(a, c, d, e) {
  try {
    b.dynCall_viif(a, c, d, e);
  } catch (g) {
    if ("number" !== typeof g && "longjmp" !== g) {
      throw g;
    }
    b.setThrew(1, 0);
  }
}, jsCall_viif:function(a, c, d, e) {
  f.d[a](c, d, e);
}, invoke_viiiiii:function(a, c, d, e, g, m, l) {
  try {
    b.dynCall_viiiiii(a, c, d, e, g, m, l);
  } catch (O) {
    if ("number" !== typeof O && "longjmp" !== O) {
      throw O;
    }
    b.setThrew(1, 0);
  }
}, jsCall_viiiiii:function(a, c, d, e, g, m, l) {
  f.d[a](c, d, e, g, m, l);
}, invoke_iii:function(a, c, d) {
  try {
    return b.dynCall_iii(a, c, d);
  } catch (e) {
    if ("number" !== typeof e && "longjmp" !== e) {
      throw e;
    }
    b.setThrew(1, 0);
  }
}, jsCall_iii:function(a, c, d) {
  return f.d[a](c, d);
}, invoke_iiiiii:function(a, c, d, e, g, m) {
  try {
    return b.dynCall_iiiiii(a, c, d, e, g, m);
  } catch (l) {
    if ("number" !== typeof l && "longjmp" !== l) {
      throw l;
    }
    b.setThrew(1, 0);
  }
}, jsCall_iiiiii:function(a, c, d, e, g, m) {
  return f.d[a](c, d, e, g, m);
}, invoke_fiiiif:function(a, c, d, e, g, m) {
  try {
    return b.dynCall_fiiiif(a, c, d, e, g, m);
  } catch (l) {
    if ("number" !== typeof l && "longjmp" !== l) {
      throw l;
    }
    b.setThrew(1, 0);
  }
}, jsCall_fiiiif:function(a, c, d, e, g, m) {
  return f.d[a](c, d, e, g, m);
}, invoke_viiii:function(a, c, d, e, g) {
  try {
    b.dynCall_viiii(a, c, d, e, g);
  } catch (m) {
    if ("number" !== typeof m && "longjmp" !== m) {
      throw m;
    }
    b.setThrew(1, 0);
  }
}, jsCall_viiii:function(a, c, d, e, g) {
  f.d[a](c, d, e, g);
}, _emscripten_asm_const_iiiii:function(a, c, d, e, g) {
  return Gb[a](c, d, e, g);
}, _emscripten_asm_const_diiiid:function(a, c, d, e, g, m) {
  return Gb[a](c, d, e, g, m);
}, _pthread_key_create:function(a) {
  if (0 == a) {
    return 22;
  }
  pa[a >> 2] = Ub;
  Sb[Ub] = 0;
  Ub++;
  return 0;
}, _abort:function() {
  b.abort();
}, ___gxx_personality_v0:function() {
}, _emscripten_asm_const_iiidii:function(a, c, d, e, g, m) {
  return Gb[a](c, d, e, g, m);
}, ___assert_fail:function(a, c, d, e) {
  wa = !0;
  throw "Assertion failed: " + Ea(a) + ", at: " + [c ? Ea(c) : "unknown filename", d, e ? Ea(e) : "unknown function"] + " at " + db();
}, __ZSt18uncaught_exceptionv:Jb, ___setErrNo:function(a) {
  b.___errno_location && (pa[b.___errno_location() >> 2] = a);
  return a;
}, ___cxa_begin_catch:function(a) {
  var c = Mb[a];
  c && !c.G && (c.G = !0, Jb.e--);
  c && (c.ga = !1);
  Lb.push(a);
  a: {
    if (a && !Mb[a]) {
      for (var d in Mb) {
        if (Mb[d].C === a) {
          c = d;
          break a;
        }
      }
    }
    c = a;
  }
  c && Mb[c].fa++;
  return a;
}, _emscripten_memcpy_big:function(a, c, d) {
  Ta.set(Ta.subarray(c, c + d), a);
  return a;
}, ___resumeException:function(a) {
  Kb || (Kb = a);
  throw a + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";
}, ___cxa_find_matching_catch:Vb, _pthread_getspecific:function(a) {
  return Sb[a] || 0;
}, _pthread_once:Nb, ___syscall54:function(a, c) {
  Pb = c;
  return 0;
}, _emscripten_asm_const_iii:function(a, c, d) {
  return Gb[a](c, d);
}, _emscripten_asm_const_iiidi:function(a, c, d, e, g) {
  return Gb[a](c, d, e, g);
}, _pthread_setspecific:function(a, c) {
  if (!(a in Sb)) {
    return 22;
  }
  Sb[a] = c;
  return 0;
}, _emscripten_asm_const_iiii:function(a, c, d, e) {
  return Gb[a](c, d, e);
}, ___syscall6:function(a, c) {
  Pb = c;
  try {
    var d = Rb.I();
    FS.close(d);
    return 0;
  } catch (e) {
    return "undefined" !== typeof FS && e instanceof FS.r || xa(e), -e.w;
  }
}, ___syscall140:function(a, c) {
  Pb = c;
  try {
    var d = Rb.I(), e = Qb(), g = Qb(), m = Qb(), l = Qb();
    assert(0 === e);
    FS.ba(d, g, l);
    pa[m >> 2] = d.position;
    d.K && 0 === g && 0 === l && (d.K = null);
    return 0;
  } catch (O) {
    return "undefined" !== typeof FS && O instanceof FS.r || xa(O), -O.w;
  }
}, ___cxa_pure_virtual:function() {
  wa = !0;
  throw "Pure virtual function called!";
}, ___syscall146:Yb, DYNAMICTOP_PTR:ra, tempDoublePtr:Hb, ABORT:wa, STACKTOP:na, STACK_MAX:kb};
var Zb = b.asm(b.D, b.F, buffer);
b.asm = Zb;
var $b = b._emscripten_bind_b2WheelJoint_GetSpringDampingRatio_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetSpringDampingRatio_0.apply(null, arguments);
}, ac = b._emscripten_bind_b2ContactEdge_set_next_1 = function() {
  return b.asm._emscripten_bind_b2ContactEdge_set_next_1.apply(null, arguments);
}, bc = b._emscripten_bind_b2ChainShape_get_m_count_0 = function() {
  return b.asm._emscripten_bind_b2ChainShape_get_m_count_0.apply(null, arguments);
}, cc = b._emscripten_bind_b2PrismaticJointDef_get_motorSpeed_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_get_motorSpeed_0.apply(null, arguments);
}, dc = b._emscripten_bind_b2PulleyJoint_SetUserData_1 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_SetUserData_1.apply(null, arguments);
}, ec = b._emscripten_bind_b2Shape_ComputeAABB_3 = function() {
  return b.asm._emscripten_bind_b2Shape_ComputeAABB_3.apply(null, arguments);
}, fc = b._emscripten_bind_b2FrictionJointDef_set_userData_1 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_set_userData_1.apply(null, arguments);
}, gc = b._emscripten_bind_b2MouseJoint_IsActive_0 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_IsActive_0.apply(null, arguments);
}, hc = b._emscripten_bind_b2World_IsLocked_0 = function() {
  return b.asm._emscripten_bind_b2World_IsLocked_0.apply(null, arguments);
}, ic = b._emscripten_bind_b2Draw_GetFlags_0 = function() {
  return b.asm._emscripten_bind_b2Draw_GetFlags_0.apply(null, arguments);
}, jc = b._emscripten_bind_b2FrictionJoint_IsActive_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_IsActive_0.apply(null, arguments);
}, kc = b._emscripten_bind_b2Color_set_g_1 = function() {
  return b.asm._emscripten_bind_b2Color_set_g_1.apply(null, arguments);
}, lc = b._emscripten_bind_b2PolygonShape_RayCast_4 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_RayCast_4.apply(null, arguments);
}, mc = b._emscripten_bind_b2World_GetTreeBalance_0 = function() {
  return b.asm._emscripten_bind_b2World_GetTreeBalance_0.apply(null, arguments);
}, nc = b._emscripten_bind_b2ChainShape_get_m_vertices_0 = function() {
  return b.asm._emscripten_bind_b2ChainShape_get_m_vertices_0.apply(null, arguments);
}, oc = b._emscripten_bind_JSDraw_DrawSolidCircle_4 = function() {
  return b.asm._emscripten_bind_JSDraw_DrawSolidCircle_4.apply(null, arguments);
}, pc = b._emscripten_bind_b2RevoluteJoint_GetLocalAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetLocalAnchorA_0.apply(null, arguments);
}, qc = b._emscripten_bind_b2FixtureDef_get_filter_0 = function() {
  return b.asm._emscripten_bind_b2FixtureDef_get_filter_0.apply(null, arguments);
}, rc = b._emscripten_bind_b2FrictionJointDef_get_type_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_get_type_0.apply(null, arguments);
}, sc = b._emscripten_bind_b2FixtureDef_set_userData_1 = function() {
  return b.asm._emscripten_bind_b2FixtureDef_set_userData_1.apply(null, arguments);
}, tc = b._emscripten_bind_b2EdgeShape_set_m_hasVertex3_1 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_set_m_hasVertex3_1.apply(null, arguments);
}, uc = b._emscripten_bind_b2JointEdge_set_joint_1 = function() {
  return b.asm._emscripten_bind_b2JointEdge_set_joint_1.apply(null, arguments);
}, vc = b._emscripten_bind_b2Fixture___destroy___0 = function() {
  return b.asm._emscripten_bind_b2Fixture___destroy___0.apply(null, arguments);
}, wc = b._emscripten_bind_b2World_SetWarmStarting_1 = function() {
  return b.asm._emscripten_bind_b2World_SetWarmStarting_1.apply(null, arguments);
}, xc = b._emscripten_bind_JSDraw_DrawCircle_3 = function() {
  return b.asm._emscripten_bind_JSDraw_DrawCircle_3.apply(null, arguments);
}, yc = b._emscripten_bind_b2WeldJoint_IsActive_0 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_IsActive_0.apply(null, arguments);
}, zc = b._emscripten_bind_b2DestructionListener___destroy___0 = function() {
  return b.asm._emscripten_bind_b2DestructionListener___destroy___0.apply(null, arguments);
}, Ac = b._emscripten_bind_b2BodyDef_set_type_1 = function() {
  return b.asm._emscripten_bind_b2BodyDef_set_type_1.apply(null, arguments);
}, Bc = b._emscripten_bind_b2ChainShape_ComputeAABB_3 = function() {
  return b.asm._emscripten_bind_b2ChainShape_ComputeAABB_3.apply(null, arguments);
}, Cc = b._emscripten_bind_b2PulleyJoint_GetUserData_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_GetUserData_0.apply(null, arguments);
}, Dc = b._emscripten_bind_b2WeldJoint_GetReactionTorque_1 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_GetReactionTorque_1.apply(null, arguments);
}, Ec = b._emscripten_bind_b2DistanceJointDef_get_userData_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_get_userData_0.apply(null, arguments);
}, Fc = b._emscripten_bind_b2BodyDef_get_position_0 = function() {
  return b.asm._emscripten_bind_b2BodyDef_get_position_0.apply(null, arguments);
}, Gc = b._emscripten_bind_b2RevoluteJointDef_set_userData_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_set_userData_1.apply(null, arguments);
}, Hc = b._emscripten_bind_b2World_SetContactFilter_1 = function() {
  return b.asm._emscripten_bind_b2World_SetContactFilter_1.apply(null, arguments);
}, Ic = b._emscripten_bind_b2WheelJointDef_get_collideConnected_0 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_get_collideConnected_0.apply(null, arguments);
}, Jc = b._emscripten_bind_b2MouseJointDef_set_userData_1 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_set_userData_1.apply(null, arguments);
};
b.stackSave = function() {
  return b.asm.stackSave.apply(null, arguments);
};
var Kc = b._emscripten_bind_b2FixtureDef_set_restitution_1 = function() {
  return b.asm._emscripten_bind_b2FixtureDef_set_restitution_1.apply(null, arguments);
}, Lc = b._emscripten_bind_b2RevoluteJoint_GetUserData_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetUserData_0.apply(null, arguments);
}, Mc = b._emscripten_bind_b2Mat33_get_ey_0 = function() {
  return b.asm._emscripten_bind_b2Mat33_get_ey_0.apply(null, arguments);
}, Nc = b._emscripten_bind_b2MouseJoint_GetCollideConnected_0 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_GetCollideConnected_0.apply(null, arguments);
}, Oc = b._emscripten_bind_b2World_GetGravity_0 = function() {
  return b.asm._emscripten_bind_b2World_GetGravity_0.apply(null, arguments);
}, Pc = b._emscripten_bind_b2Mat33_set_ey_1 = function() {
  return b.asm._emscripten_bind_b2Mat33_set_ey_1.apply(null, arguments);
}, Qc = b._emscripten_bind_b2Profile_get_broadphase_0 = function() {
  return b.asm._emscripten_bind_b2Profile_get_broadphase_0.apply(null, arguments);
}, Rc = b._emscripten_bind_b2PulleyJointDef_get_bodyA_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_get_bodyA_0.apply(null, arguments);
}, Sc = b._emscripten_bind_b2PrismaticJoint_SetLimits_2 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_SetLimits_2.apply(null, arguments);
}, Tc = b._emscripten_bind_b2PulleyJointDef_get_localAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_get_localAnchorA_0.apply(null, arguments);
}, Uc = b._emscripten_bind_b2DistanceJoint_GetAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_GetAnchorA_0.apply(null, arguments);
}, Vc = b._emscripten_bind_b2DistanceJointDef_set_userData_1 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_set_userData_1.apply(null, arguments);
}, Wc = b._emscripten_bind_b2DistanceJointDef_set_dampingRatio_1 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_set_dampingRatio_1.apply(null, arguments);
}, Xc = b._emscripten_bind_b2RopeJointDef_set_collideConnected_1 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_set_collideConnected_1.apply(null, arguments);
}, Yc = b._emscripten_bind_b2ChainShape_set_m_nextVertex_1 = function() {
  return b.asm._emscripten_bind_b2ChainShape_set_m_nextVertex_1.apply(null, arguments);
}, Zc = b._emscripten_bind_JSContactListener_EndContact_1 = function() {
  return b.asm._emscripten_bind_JSContactListener_EndContact_1.apply(null, arguments);
}, $c = b._emscripten_bind_b2MassData_set_mass_1 = function() {
  return b.asm._emscripten_bind_b2MassData_set_mass_1.apply(null, arguments);
}, ad = b._emscripten_bind_b2Vec3_get_x_0 = function() {
  return b.asm._emscripten_bind_b2Vec3_get_x_0.apply(null, arguments);
}, bd = b._emscripten_bind_b2ChainShape_CreateChain_2 = function() {
  return b.asm._emscripten_bind_b2ChainShape_CreateChain_2.apply(null, arguments);
}, cd = b._emscripten_bind_b2RopeJoint_GetUserData_0 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_GetUserData_0.apply(null, arguments);
}, dd = b._emscripten_bind_b2World_DestroyBody_1 = function() {
  return b.asm._emscripten_bind_b2World_DestroyBody_1.apply(null, arguments);
}, ed = b._emscripten_bind_b2Profile_get_solvePosition_0 = function() {
  return b.asm._emscripten_bind_b2Profile_get_solvePosition_0.apply(null, arguments);
}, fd = b._emscripten_bind_b2Shape_RayCast_4 = function() {
  return b.asm._emscripten_bind_b2Shape_RayCast_4.apply(null, arguments);
}, gd = b._emscripten_bind_b2PulleyJoint_GetGroundAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_GetGroundAnchorA_0.apply(null, arguments);
}, hd = b._emscripten_bind_b2Mat33___destroy___0 = function() {
  return b.asm._emscripten_bind_b2Mat33___destroy___0.apply(null, arguments);
}, id = b._emscripten_bind_b2GearJoint_GetReactionTorque_1 = function() {
  return b.asm._emscripten_bind_b2GearJoint_GetReactionTorque_1.apply(null, arguments);
}, jd = b._emscripten_bind_b2WeldJointDef_set_collideConnected_1 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_set_collideConnected_1.apply(null, arguments);
}, kd = b._emscripten_bind_b2JointDef_get_collideConnected_0 = function() {
  return b.asm._emscripten_bind_b2JointDef_get_collideConnected_0.apply(null, arguments);
};
b.getTempRet0 = function() {
  return b.asm.getTempRet0.apply(null, arguments);
};
var ld = b._emscripten_bind_b2FrictionJointDef_get_maxTorque_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_get_maxTorque_0.apply(null, arguments);
}, md = b._emscripten_bind_JSQueryCallback_JSQueryCallback_0 = function() {
  return b.asm._emscripten_bind_JSQueryCallback_JSQueryCallback_0.apply(null, arguments);
}, nd = b._emscripten_bind_b2World_SetAutoClearForces_1 = function() {
  return b.asm._emscripten_bind_b2World_SetAutoClearForces_1.apply(null, arguments);
}, od = b._emscripten_bind_b2PrismaticJointDef_set_lowerTranslation_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_set_lowerTranslation_1.apply(null, arguments);
}, pd = b._emscripten_bind_b2BodyDef_set_position_1 = function() {
  return b.asm._emscripten_bind_b2BodyDef_set_position_1.apply(null, arguments);
}, qd = b._emscripten_bind_b2Transform_get_q_0 = function() {
  return b.asm._emscripten_bind_b2Transform_get_q_0.apply(null, arguments);
}, rd = b._emscripten_bind_b2ChainShape_GetChildCount_0 = function() {
  return b.asm._emscripten_bind_b2ChainShape_GetChildCount_0.apply(null, arguments);
}, sd = b._emscripten_bind_b2Contact_GetNext_0 = function() {
  return b.asm._emscripten_bind_b2Contact_GetNext_0.apply(null, arguments);
}, td = b._emscripten_bind_b2GearJoint_GetJoint1_0 = function() {
  return b.asm._emscripten_bind_b2GearJoint_GetJoint1_0.apply(null, arguments);
}, ud = b._emscripten_bind_b2World_GetProxyCount_0 = function() {
  return b.asm._emscripten_bind_b2World_GetProxyCount_0.apply(null, arguments);
}, vd = b._emscripten_enum_b2ContactFeatureType_e_face = function() {
  return b.asm._emscripten_enum_b2ContactFeatureType_e_face.apply(null, arguments);
}, wd = b._emscripten_bind_b2GearJoint_GetAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2GearJoint_GetAnchorA_0.apply(null, arguments);
}, xd = b._emscripten_bind_b2MouseJointDef_set_bodyA_1 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_set_bodyA_1.apply(null, arguments);
}, yd = b._emscripten_bind_b2World_SetContactListener_1 = function() {
  return b.asm._emscripten_bind_b2World_SetContactListener_1.apply(null, arguments);
}, zd = b._emscripten_bind_b2Body_IsAwake_0 = function() {
  return b.asm._emscripten_bind_b2Body_IsAwake_0.apply(null, arguments);
}, Ad = b._emscripten_bind_b2JointEdge_set_other_1 = function() {
  return b.asm._emscripten_bind_b2JointEdge_set_other_1.apply(null, arguments);
}, Bd = b._emscripten_bind_b2MouseJointDef_set_target_1 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_set_target_1.apply(null, arguments);
}, Cd = b._emscripten_bind_b2FrictionJoint_GetLocalAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_GetLocalAnchorB_0.apply(null, arguments);
}, Dd = b._emscripten_bind_b2RopeJointDef___destroy___0 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef___destroy___0.apply(null, arguments);
}, Ed = b._emscripten_bind_b2GearJoint_GetRatio_0 = function() {
  return b.asm._emscripten_bind_b2GearJoint_GetRatio_0.apply(null, arguments);
}, Fd = b._emscripten_bind_b2PrismaticJointDef_get_upperTranslation_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_get_upperTranslation_0.apply(null, arguments);
}, Gd = b._emscripten_bind_b2RevoluteJoint_GetReferenceAngle_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetReferenceAngle_0.apply(null, arguments);
}, Hd = b._emscripten_enum_b2ManifoldType_e_circles = function() {
  return b.asm._emscripten_enum_b2ManifoldType_e_circles.apply(null, arguments);
}, Id = b._emscripten_bind_b2PulleyJointDef_set_localAnchorB_1 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_set_localAnchorB_1.apply(null, arguments);
}, Jd = b._emscripten_bind_b2FixtureDef_get_userData_0 = function() {
  return b.asm._emscripten_bind_b2FixtureDef_get_userData_0.apply(null, arguments);
}, Kd = b._emscripten_bind_b2DistanceJoint_GetUserData_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_GetUserData_0.apply(null, arguments);
}, Ld = b._emscripten_bind_b2FrictionJointDef_set_collideConnected_1 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_set_collideConnected_1.apply(null, arguments);
}, Md = b._emscripten_bind_b2PrismaticJointDef_get_lowerTranslation_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_get_lowerTranslation_0.apply(null, arguments);
}, Nd = b._emscripten_bind_b2GearJoint_GetCollideConnected_0 = function() {
  return b.asm._emscripten_bind_b2GearJoint_GetCollideConnected_0.apply(null, arguments);
}, Od = b._emscripten_bind_b2Filter_b2Filter_0 = function() {
  return b.asm._emscripten_bind_b2Filter_b2Filter_0.apply(null, arguments);
}, Pd = b._emscripten_bind_b2MouseJointDef_set_type_1 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_set_type_1.apply(null, arguments);
}, Qd = b._emscripten_enum_b2JointType_e_frictionJoint = function() {
  return b.asm._emscripten_enum_b2JointType_e_frictionJoint.apply(null, arguments);
}, Rd = b._emscripten_bind_b2Body_ApplyAngularImpulse_1 = function() {
  return b.asm._emscripten_bind_b2Body_ApplyAngularImpulse_1.apply(null, arguments);
}, Sd = b._emscripten_bind_b2Color_set_r_1 = function() {
  return b.asm._emscripten_bind_b2Color_set_r_1.apply(null, arguments);
}, Td = b._emscripten_bind_b2DistanceJointDef_set_collideConnected_1 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_set_collideConnected_1.apply(null, arguments);
}, Ud = b._emscripten_bind_b2PulleyJoint_GetBodyB_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_GetBodyB_0.apply(null, arguments);
}, Vd = b._emscripten_bind_b2WheelJointDef_set_type_1 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_set_type_1.apply(null, arguments);
}, Wd = b._emscripten_bind_b2World_GetTreeQuality_0 = function() {
  return b.asm._emscripten_bind_b2World_GetTreeQuality_0.apply(null, arguments);
}, Xd = b._emscripten_bind_b2BodyDef_set_gravityScale_1 = function() {
  return b.asm._emscripten_bind_b2BodyDef_set_gravityScale_1.apply(null, arguments);
}, Yd = b._emscripten_bind_b2RopeJointDef_set_bodyB_1 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_set_bodyB_1.apply(null, arguments);
}, Zd = b._emscripten_bind_b2PrismaticJoint_GetLowerLimit_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetLowerLimit_0.apply(null, arguments);
}, $d = b._emscripten_bind_b2AABB_get_lowerBound_0 = function() {
  return b.asm._emscripten_bind_b2AABB_get_lowerBound_0.apply(null, arguments);
}, ae = b._emscripten_bind_b2WheelJoint_SetMotorSpeed_1 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_SetMotorSpeed_1.apply(null, arguments);
}, be = b._emscripten_bind_b2MouseJoint_GetMaxForce_0 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_GetMaxForce_0.apply(null, arguments);
}, ce = b._emscripten_bind_b2Body_SetMassData_1 = function() {
  return b.asm._emscripten_bind_b2Body_SetMassData_1.apply(null, arguments);
}, de = b._emscripten_bind_b2BodyDef_get_angularVelocity_0 = function() {
  return b.asm._emscripten_bind_b2BodyDef_get_angularVelocity_0.apply(null, arguments);
}, ee = b._emscripten_bind_b2WeldJoint_SetDampingRatio_1 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_SetDampingRatio_1.apply(null, arguments);
}, fe = b._emscripten_bind_b2PrismaticJointDef___destroy___0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef___destroy___0.apply(null, arguments);
}, ge = b._emscripten_bind_b2Contact_IsTouching_0 = function() {
  return b.asm._emscripten_bind_b2Contact_IsTouching_0.apply(null, arguments);
}, he = b._emscripten_bind_b2Draw_SetFlags_1 = function() {
  return b.asm._emscripten_bind_b2Draw_SetFlags_1.apply(null, arguments);
}, ie = b._emscripten_bind_b2AABB_Contains_1 = function() {
  return b.asm._emscripten_bind_b2AABB_Contains_1.apply(null, arguments);
}, je = b._emscripten_bind_b2DistanceJoint_GetNext_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_GetNext_0.apply(null, arguments);
}, ke = b._emscripten_bind_b2EdgeShape_set_m_radius_1 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_set_m_radius_1.apply(null, arguments);
}, le = b._emscripten_bind_b2DistanceJointDef_get_dampingRatio_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_get_dampingRatio_0.apply(null, arguments);
}, me = b._emscripten_bind_b2DistanceJoint_GetLocalAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_GetLocalAnchorA_0.apply(null, arguments);
}, ne = b._emscripten_bind_b2PrismaticJoint_GetType_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetType_0.apply(null, arguments);
}, oe = b._emscripten_bind_b2Fixture_GetRestitution_0 = function() {
  return b.asm._emscripten_bind_b2Fixture_GetRestitution_0.apply(null, arguments);
}, pe = b._emscripten_bind_b2Transform_set_q_1 = function() {
  return b.asm._emscripten_bind_b2Transform_set_q_1.apply(null, arguments);
}, qe = b._emscripten_bind_b2PolygonShape___destroy___0 = function() {
  return b.asm._emscripten_bind_b2PolygonShape___destroy___0.apply(null, arguments);
}, re = b._emscripten_bind_b2AABB_get_upperBound_0 = function() {
  return b.asm._emscripten_bind_b2AABB_get_upperBound_0.apply(null, arguments);
}, se = b._emscripten_bind_b2Transform___destroy___0 = function() {
  return b.asm._emscripten_bind_b2Transform___destroy___0.apply(null, arguments);
}, te = b._emscripten_bind_b2Body_GetLinearVelocity_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetLinearVelocity_0.apply(null, arguments);
}, ue = b._emscripten_bind_b2CircleShape_set_m_radius_1 = function() {
  return b.asm._emscripten_bind_b2CircleShape_set_m_radius_1.apply(null, arguments);
}, ve = b._emscripten_bind_b2EdgeShape_set_m_hasVertex0_1 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_set_m_hasVertex0_1.apply(null, arguments);
}, we = b._emscripten_bind_b2RopeJoint_GetMaxLength_0 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_GetMaxLength_0.apply(null, arguments);
}, xe = b._emscripten_bind_b2GearJoint_GetUserData_0 = function() {
  return b.asm._emscripten_bind_b2GearJoint_GetUserData_0.apply(null, arguments);
}, ye = b._emscripten_bind_b2GearJointDef_set_type_1 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_set_type_1.apply(null, arguments);
}, ze = b._emscripten_bind_b2DistanceJoint_SetDampingRatio_1 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_SetDampingRatio_1.apply(null, arguments);
}, Ae = b._emscripten_bind_b2Contact_GetFixtureA_0 = function() {
  return b.asm._emscripten_bind_b2Contact_GetFixtureA_0.apply(null, arguments);
}, Be = b._emscripten_bind_b2PulleyJointDef_get_ratio_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_get_ratio_0.apply(null, arguments);
}, Ce = b._emscripten_bind_b2PrismaticJointDef_get_localAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_get_localAnchorB_0.apply(null, arguments);
}, De = b._emscripten_bind_b2CircleShape_set_m_type_1 = function() {
  return b.asm._emscripten_bind_b2CircleShape_set_m_type_1.apply(null, arguments);
}, Ee = b._emscripten_bind_b2DistanceJointDef_set_localAnchorA_1 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_set_localAnchorA_1.apply(null, arguments);
}, Fe = b._emscripten_bind_b2RopeJoint_GetAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_GetAnchorB_0.apply(null, arguments);
}, Ge = b._emscripten_bind_b2AABB_set_upperBound_1 = function() {
  return b.asm._emscripten_bind_b2AABB_set_upperBound_1.apply(null, arguments);
}, He = b._emscripten_bind_JSRayCastCallback_ReportFixture_4 = function() {
  return b.asm._emscripten_bind_JSRayCastCallback_ReportFixture_4.apply(null, arguments);
}, Ie = b._emscripten_bind_b2ContactImpulse___destroy___0 = function() {
  return b.asm._emscripten_bind_b2ContactImpulse___destroy___0.apply(null, arguments);
}, Je = b._emscripten_bind_b2FrictionJointDef_get_localAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_get_localAnchorB_0.apply(null, arguments);
}, Ke = b._emscripten_bind_b2PulleyJointDef_set_lengthB_1 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_set_lengthB_1.apply(null, arguments);
}, Le = b._emscripten_bind_b2RayCastInput___destroy___0 = function() {
  return b.asm._emscripten_bind_b2RayCastInput___destroy___0.apply(null, arguments);
}, Me = b._emscripten_bind_b2Body_ApplyForceToCenter_1 = function() {
  return b.asm._emscripten_bind_b2Body_ApplyForceToCenter_1.apply(null, arguments);
}, Ne = b._emscripten_bind_b2WheelJointDef_set_localAnchorA_1 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_set_localAnchorA_1.apply(null, arguments);
}, Oe = b._emscripten_bind_b2FrictionJoint_GetBodyB_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_GetBodyB_0.apply(null, arguments);
}, Pe = b._emscripten_bind_b2WeldJointDef_set_bodyA_1 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_set_bodyA_1.apply(null, arguments);
}, Qe = b._emscripten_bind_b2DistanceJoint_GetBodyB_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_GetBodyB_0.apply(null, arguments);
}, Re = b._emscripten_enum_b2JointType_e_wheelJoint = function() {
  return b.asm._emscripten_enum_b2JointType_e_wheelJoint.apply(null, arguments);
}, Se = b._emscripten_bind_b2JointDef___destroy___0 = function() {
  return b.asm._emscripten_bind_b2JointDef___destroy___0.apply(null, arguments);
}, Te = b._emscripten_bind_b2ContactEdge___destroy___0 = function() {
  return b.asm._emscripten_bind_b2ContactEdge___destroy___0.apply(null, arguments);
}, Ue = b._emscripten_bind_b2Filter_get_groupIndex_0 = function() {
  return b.asm._emscripten_bind_b2Filter_get_groupIndex_0.apply(null, arguments);
}, Ve = b._emscripten_bind_b2FrictionJointDef_get_localAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_get_localAnchorA_0.apply(null, arguments);
}, We = b._emscripten_bind_b2CircleShape_GetChildCount_0 = function() {
  return b.asm._emscripten_bind_b2CircleShape_GetChildCount_0.apply(null, arguments);
}, Xe = b._emscripten_bind_b2BodyDef_get_bullet_0 = function() {
  return b.asm._emscripten_bind_b2BodyDef_get_bullet_0.apply(null, arguments);
}, Ye = b._emscripten_bind_b2Color_set_b_1 = function() {
  return b.asm._emscripten_bind_b2Color_set_b_1.apply(null, arguments);
}, Ze = b._emscripten_bind_b2Mat33_get_ez_0 = function() {
  return b.asm._emscripten_bind_b2Mat33_get_ez_0.apply(null, arguments);
}, $e = b._emscripten_bind_b2MassData_get_center_0 = function() {
  return b.asm._emscripten_bind_b2MassData_get_center_0.apply(null, arguments);
}, af = b._emscripten_bind_b2WeldJoint_GetBodyB_0 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_GetBodyB_0.apply(null, arguments);
}, bf = b._emscripten_bind_b2WheelJoint_GetReactionForce_1 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetReactionForce_1.apply(null, arguments);
}, cf = b._emscripten_bind_b2World_SetSubStepping_1 = function() {
  return b.asm._emscripten_bind_b2World_SetSubStepping_1.apply(null, arguments);
}, df = b._emscripten_bind_b2Vec2_op_add_1 = function() {
  return b.asm._emscripten_bind_b2Vec2_op_add_1.apply(null, arguments);
}, ef = b._emscripten_bind_JSDraw_DrawSegment_3 = function() {
  return b.asm._emscripten_bind_JSDraw_DrawSegment_3.apply(null, arguments);
}, ff = b._emscripten_bind_b2Joint_GetCollideConnected_0 = function() {
  return b.asm._emscripten_bind_b2Joint_GetCollideConnected_0.apply(null, arguments);
}, gf = b._emscripten_bind_b2FrictionJointDef_get_bodyB_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_get_bodyB_0.apply(null, arguments);
}, hf = b._emscripten_bind_b2WheelJointDef___destroy___0 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef___destroy___0.apply(null, arguments);
}, jf = b._emscripten_bind_b2BodyDef_get_gravityScale_0 = function() {
  return b.asm._emscripten_bind_b2BodyDef_get_gravityScale_0.apply(null, arguments);
}, kf = b._emscripten_bind_b2Vec3_SetZero_0 = function() {
  return b.asm._emscripten_bind_b2Vec3_SetZero_0.apply(null, arguments);
}, lf = b._emscripten_enum_b2JointType_e_pulleyJoint = function() {
  return b.asm._emscripten_enum_b2JointType_e_pulleyJoint.apply(null, arguments);
}, mf = b._emscripten_bind_b2ChainShape_get_m_nextVertex_0 = function() {
  return b.asm._emscripten_bind_b2ChainShape_get_m_nextVertex_0.apply(null, arguments);
}, nf = b._emscripten_bind_b2Contact_SetEnabled_1 = function() {
  return b.asm._emscripten_bind_b2Contact_SetEnabled_1.apply(null, arguments);
}, of = b._emscripten_bind_b2Shape_set_m_radius_1 = function() {
  return b.asm._emscripten_bind_b2Shape_set_m_radius_1.apply(null, arguments);
}, pf = b._emscripten_bind_b2World_SetDebugDraw_1 = function() {
  return b.asm._emscripten_bind_b2World_SetDebugDraw_1.apply(null, arguments);
}, qf = b._emscripten_bind_b2ContactID_set_key_1 = function() {
  return b.asm._emscripten_bind_b2ContactID_set_key_1.apply(null, arguments);
}, Sa = b._malloc = function() {
  return b.asm._malloc.apply(null, arguments);
}, rf = b._emscripten_bind_b2WheelJoint_GetMaxMotorTorque_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetMaxMotorTorque_0.apply(null, arguments);
}, sf = b._emscripten_bind_b2Vec2_Normalize_0 = function() {
  return b.asm._emscripten_bind_b2Vec2_Normalize_0.apply(null, arguments);
}, tf = b._emscripten_bind_b2WheelJoint_GetJointSpeed_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetJointSpeed_0.apply(null, arguments);
}, uf = b._emscripten_bind_b2FrictionJointDef_set_localAnchorA_1 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_set_localAnchorA_1.apply(null, arguments);
}, vf = b._emscripten_bind_b2ChainShape_set_m_vertices_1 = function() {
  return b.asm._emscripten_bind_b2ChainShape_set_m_vertices_1.apply(null, arguments);
}, wf = b._emscripten_bind_JSRayCastCallback_JSRayCastCallback_0 = function() {
  return b.asm._emscripten_bind_JSRayCastCallback_JSRayCastCallback_0.apply(null, arguments);
}, xf = b._emscripten_bind_b2RayCastInput_set_p2_1 = function() {
  return b.asm._emscripten_bind_b2RayCastInput_set_p2_1.apply(null, arguments);
}, yf = b._emscripten_bind_b2RevoluteJointDef_get_motorSpeed_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_get_motorSpeed_0.apply(null, arguments);
}, zf = b._emscripten_bind_b2Manifold_get_pointCount_0 = function() {
  return b.asm._emscripten_bind_b2Manifold_get_pointCount_0.apply(null, arguments);
}, Af = b._emscripten_bind_b2RayCastOutput_get_normal_0 = function() {
  return b.asm._emscripten_bind_b2RayCastOutput_get_normal_0.apply(null, arguments);
}, Bf = b._emscripten_bind_b2WeldJoint_GetBodyA_0 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_GetBodyA_0.apply(null, arguments);
}, Cf = b._emscripten_enum_b2DrawFlag_e_jointBit = function() {
  return b.asm._emscripten_enum_b2DrawFlag_e_jointBit.apply(null, arguments);
}, Df = b._emscripten_bind_b2FixtureDef_get_isSensor_0 = function() {
  return b.asm._emscripten_bind_b2FixtureDef_get_isSensor_0.apply(null, arguments);
}, Ef = b._emscripten_bind_b2PrismaticJointDef_Initialize_4 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_Initialize_4.apply(null, arguments);
}, Ff = b._emscripten_bind_b2Fixture_TestPoint_1 = function() {
  return b.asm._emscripten_bind_b2Fixture_TestPoint_1.apply(null, arguments);
}, Gf = b._emscripten_bind_b2PulleyJointDef_set_bodyB_1 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_set_bodyB_1.apply(null, arguments);
}, Hf = b._emscripten_bind_b2WheelJoint_EnableMotor_1 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_EnableMotor_1.apply(null, arguments);
}, If = b._emscripten_bind_b2RevoluteJoint_GetJointSpeed_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetJointSpeed_0.apply(null, arguments);
}, Jf = b._emscripten_bind_JSDraw_DrawSolidPolygon_3 = function() {
  return b.asm._emscripten_bind_JSDraw_DrawSolidPolygon_3.apply(null, arguments);
}, Kf = b._emscripten_bind_b2Rot_Set_1 = function() {
  return b.asm._emscripten_bind_b2Rot_Set_1.apply(null, arguments);
}, Lf = b._emscripten_bind_b2RevoluteJoint_GetJointAngle_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetJointAngle_0.apply(null, arguments);
}, Mf = b._emscripten_bind_JSDraw___destroy___0 = function() {
  return b.asm._emscripten_bind_JSDraw___destroy___0.apply(null, arguments);
}, Nf = b._emscripten_bind_b2MouseJointDef___destroy___0 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef___destroy___0.apply(null, arguments);
}, Of = b._emscripten_bind_b2Mat33_Solve22_1 = function() {
  return b.asm._emscripten_bind_b2Mat33_Solve22_1.apply(null, arguments);
}, Pf = b._emscripten_bind_b2Profile_set_solvePosition_1 = function() {
  return b.asm._emscripten_bind_b2Profile_set_solvePosition_1.apply(null, arguments);
}, Qf = b._emscripten_bind_b2ContactFilter___destroy___0 = function() {
  return b.asm._emscripten_bind_b2ContactFilter___destroy___0.apply(null, arguments);
}, Rf = b._emscripten_bind_b2WheelJoint_GetLocalAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetLocalAnchorA_0.apply(null, arguments);
}, Sf = b._emscripten_bind_b2ChainShape_set_m_hasPrevVertex_1 = function() {
  return b.asm._emscripten_bind_b2ChainShape_set_m_hasPrevVertex_1.apply(null, arguments);
}, Tf = b._emscripten_bind_b2DistanceJoint_SetUserData_1 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_SetUserData_1.apply(null, arguments);
}, Uf = b._emscripten_bind_b2PrismaticJoint___destroy___0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint___destroy___0.apply(null, arguments);
}, Vf = b._emscripten_bind_b2RopeJointDef_set_bodyA_1 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_set_bodyA_1.apply(null, arguments);
}, Wf = b._emscripten_bind_b2GearJoint___destroy___0 = function() {
  return b.asm._emscripten_bind_b2GearJoint___destroy___0.apply(null, arguments);
}, Xf = b._emscripten_bind_b2PrismaticJoint_GetJointTranslation_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetJointTranslation_0.apply(null, arguments);
}, Yf = b._emscripten_bind_b2ManifoldPoint_get_id_0 = function() {
  return b.asm._emscripten_bind_b2ManifoldPoint_get_id_0.apply(null, arguments);
}, Zf = b._emscripten_bind_b2CircleShape_get_m_radius_0 = function() {
  return b.asm._emscripten_bind_b2CircleShape_get_m_radius_0.apply(null, arguments);
}, $f = b._emscripten_bind_b2PrismaticJoint_GetMotorSpeed_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetMotorSpeed_0.apply(null, arguments);
}, ag = b._emscripten_bind_b2PulleyJoint_GetGroundAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_GetGroundAnchorB_0.apply(null, arguments);
}, bg = b._emscripten_bind_b2Vec3_op_add_1 = function() {
  return b.asm._emscripten_bind_b2Vec3_op_add_1.apply(null, arguments);
}, cg = b._emscripten_bind_b2FrictionJoint_GetType_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_GetType_0.apply(null, arguments);
}, dg = b._emscripten_bind_b2ContactFeature_get_indexB_0 = function() {
  return b.asm._emscripten_bind_b2ContactFeature_get_indexB_0.apply(null, arguments);
}, eg = b._emscripten_bind_b2MouseJoint_SetTarget_1 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_SetTarget_1.apply(null, arguments);
}, fg = b._emscripten_bind_b2MouseJointDef_get_dampingRatio_0 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_get_dampingRatio_0.apply(null, arguments);
}, gg = b._emscripten_bind_b2RevoluteJoint_GetMotorSpeed_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetMotorSpeed_0.apply(null, arguments);
}, hg = b._emscripten_bind_b2ChainShape_set_m_type_1 = function() {
  return b.asm._emscripten_bind_b2ChainShape_set_m_type_1.apply(null, arguments);
}, ig = b._emscripten_bind_b2Contact_GetFriction_0 = function() {
  return b.asm._emscripten_bind_b2Contact_GetFriction_0.apply(null, arguments);
}, jg = b._emscripten_bind_b2Rot_GetXAxis_0 = function() {
  return b.asm._emscripten_bind_b2Rot_GetXAxis_0.apply(null, arguments);
}, kg = b._emscripten_bind_b2Mat33_b2Mat33_0 = function() {
  return b.asm._emscripten_bind_b2Mat33_b2Mat33_0.apply(null, arguments);
}, lg = b._emscripten_bind_b2MouseJointDef_get_bodyB_0 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_get_bodyB_0.apply(null, arguments);
}, mg = b._emscripten_bind_b2Body_GetWorldVector_1 = function() {
  return b.asm._emscripten_bind_b2Body_GetWorldVector_1.apply(null, arguments);
}, ng = b._emscripten_bind_b2WeldJointDef_get_frequencyHz_0 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_get_frequencyHz_0.apply(null, arguments);
}, og = b._emscripten_bind_b2GearJointDef_set_ratio_1 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_set_ratio_1.apply(null, arguments);
}, pg = b._emscripten_bind_b2Manifold___destroy___0 = function() {
  return b.asm._emscripten_bind_b2Manifold___destroy___0.apply(null, arguments);
}, qg = b._emscripten_bind_b2PulleyJointDef_set_lengthA_1 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_set_lengthA_1.apply(null, arguments);
}, rg = b._emscripten_bind_b2Contact_IsEnabled_0 = function() {
  return b.asm._emscripten_bind_b2Contact_IsEnabled_0.apply(null, arguments);
};
b.stackRestore = function() {
  return b.asm.stackRestore.apply(null, arguments);
};
var sg = b._emscripten_bind_b2World_CreateJoint_1 = function() {
  return b.asm._emscripten_bind_b2World_CreateJoint_1.apply(null, arguments);
}, tg = b._emscripten_bind_b2PulleyJointDef_set_ratio_1 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_set_ratio_1.apply(null, arguments);
}, ug = b._emscripten_bind_b2JointEdge_set_prev_1 = function() {
  return b.asm._emscripten_bind_b2JointEdge_set_prev_1.apply(null, arguments);
}, vg = b._emscripten_bind_b2PrismaticJoint_GetReactionTorque_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetReactionTorque_1.apply(null, arguments);
}, wg = b._emscripten_bind_b2Body_GetLocalPoint_1 = function() {
  return b.asm._emscripten_bind_b2Body_GetLocalPoint_1.apply(null, arguments);
}, xg = b._emscripten_bind_b2PrismaticJoint_GetCollideConnected_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetCollideConnected_0.apply(null, arguments);
}, yg = b._emscripten_bind_b2DistanceJoint_IsActive_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_IsActive_0.apply(null, arguments);
}, zg = b._emscripten_bind_b2RopeJoint_GetLimitState_0 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_GetLimitState_0.apply(null, arguments);
}, Ag = b._emscripten_bind_b2Profile_get_solveTOI_0 = function() {
  return b.asm._emscripten_bind_b2Profile_get_solveTOI_0.apply(null, arguments);
}, Bg = b._emscripten_bind_b2Vec2_b2Vec2_0 = function() {
  return b.asm._emscripten_bind_b2Vec2_b2Vec2_0.apply(null, arguments);
}, Cg = b._emscripten_bind_b2DistanceJoint_GetAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_GetAnchorB_0.apply(null, arguments);
}, Dg = b._emscripten_bind_b2WheelJointDef_get_maxMotorTorque_0 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_get_maxMotorTorque_0.apply(null, arguments);
}, Eg = b._emscripten_bind_b2Vec2_op_sub_1 = function() {
  return b.asm._emscripten_bind_b2Vec2_op_sub_1.apply(null, arguments);
}, Fg = b._emscripten_bind_b2CircleShape_get_m_p_0 = function() {
  return b.asm._emscripten_bind_b2CircleShape_get_m_p_0.apply(null, arguments);
}, Gg = b._emscripten_bind_b2ContactFeature_get_indexA_0 = function() {
  return b.asm._emscripten_bind_b2ContactFeature_get_indexA_0.apply(null, arguments);
}, Hg = b._emscripten_bind_b2RevoluteJoint_EnableLimit_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_EnableLimit_1.apply(null, arguments);
}, Ig = b._emscripten_bind_b2ContactEdge_get_next_0 = function() {
  return b.asm._emscripten_bind_b2ContactEdge_get_next_0.apply(null, arguments);
}, Jg = b._emscripten_bind_b2AABB_GetPerimeter_0 = function() {
  return b.asm._emscripten_bind_b2AABB_GetPerimeter_0.apply(null, arguments);
}, Kg = b._emscripten_bind_b2RevoluteJoint_GetCollideConnected_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetCollideConnected_0.apply(null, arguments);
}, Lg = b._emscripten_bind_b2Mat33_get_ex_0 = function() {
  return b.asm._emscripten_bind_b2Mat33_get_ex_0.apply(null, arguments);
}, Mg = b._emscripten_bind_b2Body_GetPosition_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetPosition_0.apply(null, arguments);
}, Ng = b._emscripten_bind_b2Profile___destroy___0 = function() {
  return b.asm._emscripten_bind_b2Profile___destroy___0.apply(null, arguments);
}, Og = b._emscripten_bind_b2ContactEdge_get_prev_0 = function() {
  return b.asm._emscripten_bind_b2ContactEdge_get_prev_0.apply(null, arguments);
}, Pg = b._emscripten_bind_b2DistanceJoint_SetFrequency_1 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_SetFrequency_1.apply(null, arguments);
}, Qg = b._emscripten_bind_b2Fixture_GetBody_0 = function() {
  return b.asm._emscripten_bind_b2Fixture_GetBody_0.apply(null, arguments);
}, Rg = b._emscripten_bind_b2ContactImpulse_set_count_1 = function() {
  return b.asm._emscripten_bind_b2ContactImpulse_set_count_1.apply(null, arguments);
}, Sg = b._emscripten_bind_b2FixtureDef_set_shape_1 = function() {
  return b.asm._emscripten_bind_b2FixtureDef_set_shape_1.apply(null, arguments);
}, Tg = b._emscripten_bind_b2PulleyJointDef_get_bodyB_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_get_bodyB_0.apply(null, arguments);
}, Ug = b._emscripten_bind_b2CircleShape_b2CircleShape_0 = function() {
  return b.asm._emscripten_bind_b2CircleShape_b2CircleShape_0.apply(null, arguments);
}, Vg = b._emscripten_bind_b2RevoluteJoint_GetReactionTorque_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetReactionTorque_1.apply(null, arguments);
}, Wg = b._emscripten_bind_b2Fixture_SetDensity_1 = function() {
  return b.asm._emscripten_bind_b2Fixture_SetDensity_1.apply(null, arguments);
}, Xg = b._emscripten_bind_b2ChainShape_get_m_prevVertex_0 = function() {
  return b.asm._emscripten_bind_b2ChainShape_get_m_prevVertex_0.apply(null, arguments);
}, Yg = b._emscripten_bind_b2AABB_GetExtents_0 = function() {
  return b.asm._emscripten_bind_b2AABB_GetExtents_0.apply(null, arguments);
}, Zg = b._emscripten_bind_b2World_ClearForces_0 = function() {
  return b.asm._emscripten_bind_b2World_ClearForces_0.apply(null, arguments);
}, $g = b._emscripten_bind_b2Vec3___destroy___0 = function() {
  return b.asm._emscripten_bind_b2Vec3___destroy___0.apply(null, arguments);
}, ah = b._emscripten_bind_b2WheelJointDef_set_userData_1 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_set_userData_1.apply(null, arguments);
}, bh = b._emscripten_bind_b2WeldJoint_SetFrequency_1 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_SetFrequency_1.apply(null, arguments);
}, ch = b._emscripten_bind_JSContactListener_PreSolve_2 = function() {
  return b.asm._emscripten_bind_JSContactListener_PreSolve_2.apply(null, arguments);
}, dh = b._emscripten_bind_b2Body_SetFixedRotation_1 = function() {
  return b.asm._emscripten_bind_b2Body_SetFixedRotation_1.apply(null, arguments);
}, eh = b._emscripten_bind_b2RayCastOutput_set_normal_1 = function() {
  return b.asm._emscripten_bind_b2RayCastOutput_set_normal_1.apply(null, arguments);
}, fh = b._emscripten_bind_b2DistanceJoint_GetDampingRatio_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_GetDampingRatio_0.apply(null, arguments);
}, gh = b._emscripten_bind_b2RevoluteJoint_SetMaxMotorTorque_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_SetMaxMotorTorque_1.apply(null, arguments);
}, hh = b._emscripten_bind_b2RevoluteJoint_EnableMotor_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_EnableMotor_1.apply(null, arguments);
}, ih = b._emscripten_bind_b2Contact_GetChildIndexB_0 = function() {
  return b.asm._emscripten_bind_b2Contact_GetChildIndexB_0.apply(null, arguments);
}, jh = b._emscripten_bind_b2MouseJointDef_set_bodyB_1 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_set_bodyB_1.apply(null, arguments);
}, kh = b._emscripten_bind_b2CircleShape_GetType_0 = function() {
  return b.asm._emscripten_bind_b2CircleShape_GetType_0.apply(null, arguments);
}, lh = b._emscripten_bind_b2PolygonShape_GetType_0 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_GetType_0.apply(null, arguments);
}, mh = b._emscripten_bind_b2PrismaticJointDef_set_referenceAngle_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_set_referenceAngle_1.apply(null, arguments);
}, nh = b._emscripten_bind_b2RopeJointDef_get_collideConnected_0 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_get_collideConnected_0.apply(null, arguments);
}, oh = b._emscripten_bind_b2FixtureDef_set_filter_1 = function() {
  return b.asm._emscripten_bind_b2FixtureDef_set_filter_1.apply(null, arguments);
}, ph = b._emscripten_bind_b2PulleyJointDef_get_groundAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_get_groundAnchorA_0.apply(null, arguments);
}, qh = b._emscripten_bind_b2RevoluteJoint___destroy___0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint___destroy___0.apply(null, arguments);
}, rh = b._emscripten_bind_b2FrictionJointDef_get_userData_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_get_userData_0.apply(null, arguments);
}, sh = b._emscripten_bind_b2RayCastCallback___destroy___0 = function() {
  return b.asm._emscripten_bind_b2RayCastCallback___destroy___0.apply(null, arguments);
}, th = b._emscripten_bind_b2RevoluteJointDef_set_bodyA_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_set_bodyA_1.apply(null, arguments);
}, uh = b._emscripten_bind_b2WheelJointDef_set_bodyA_1 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_set_bodyA_1.apply(null, arguments);
}, vh = b._emscripten_bind_b2PrismaticJoint_GetLocalAxisA_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetLocalAxisA_0.apply(null, arguments);
}, wh = b._emscripten_bind_b2WheelJoint_GetAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetAnchorA_0.apply(null, arguments);
}, xh = b._emscripten_bind_b2Transform_Set_2 = function() {
  return b.asm._emscripten_bind_b2Transform_Set_2.apply(null, arguments);
};
b.stackAlloc = function() {
  return b.asm.stackAlloc.apply(null, arguments);
};
var yh = b._emscripten_bind_b2Draw_AppendFlags_1 = function() {
  return b.asm._emscripten_bind_b2Draw_AppendFlags_1.apply(null, arguments);
}, zh = b._emscripten_bind_b2EdgeShape_GetChildCount_0 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_GetChildCount_0.apply(null, arguments);
}, Ah = b._emscripten_bind_b2Contact_ResetFriction_0 = function() {
  return b.asm._emscripten_bind_b2Contact_ResetFriction_0.apply(null, arguments);
}, Bh = b._emscripten_bind_b2Profile_set_solveTOI_1 = function() {
  return b.asm._emscripten_bind_b2Profile_set_solveTOI_1.apply(null, arguments);
}, Ch = b._emscripten_bind_b2PrismaticJointDef_set_type_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_set_type_1.apply(null, arguments);
}, Dh = b._emscripten_bind_b2AABB_GetCenter_0 = function() {
  return b.asm._emscripten_bind_b2AABB_GetCenter_0.apply(null, arguments);
}, Eh = b._emscripten_bind_b2WheelJoint_SetSpringFrequencyHz_1 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_SetSpringFrequencyHz_1.apply(null, arguments);
}, Fh = b._emscripten_bind_b2FrictionJointDef___destroy___0 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef___destroy___0.apply(null, arguments);
}, Gh = b._emscripten_bind_b2PrismaticJoint_GetReactionForce_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetReactionForce_1.apply(null, arguments);
}, Hh = b._emscripten_bind_b2Transform_b2Transform_0 = function() {
  return b.asm._emscripten_bind_b2Transform_b2Transform_0.apply(null, arguments);
}, Ih = b._emscripten_enum_b2LimitState_e_equalLimits = function() {
  return b.asm._emscripten_enum_b2LimitState_e_equalLimits.apply(null, arguments);
}, Jh = b._emscripten_bind_b2ManifoldPoint_set_normalImpulse_1 = function() {
  return b.asm._emscripten_bind_b2ManifoldPoint_set_normalImpulse_1.apply(null, arguments);
}, Kh = b._emscripten_bind_b2Body_IsFixedRotation_0 = function() {
  return b.asm._emscripten_bind_b2Body_IsFixedRotation_0.apply(null, arguments);
}, Lh = b._emscripten_enum_b2DrawFlag_e_shapeBit = function() {
  return b.asm._emscripten_enum_b2DrawFlag_e_shapeBit.apply(null, arguments);
}, Mh = b._emscripten_bind_b2RevoluteJointDef_set_bodyB_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_set_bodyB_1.apply(null, arguments);
}, Nh = b._emscripten_bind_b2Body_GetContactList_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetContactList_0.apply(null, arguments);
}, Oh = b._emscripten_bind_b2DistanceJointDef_set_length_1 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_set_length_1.apply(null, arguments);
}, Ph = b._emscripten_bind_b2DistanceJoint_GetLocalAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_GetLocalAnchorB_0.apply(null, arguments);
}, Qh = b._emscripten_bind_b2World_b2World_1 = function() {
  return b.asm._emscripten_bind_b2World_b2World_1.apply(null, arguments);
}, Rh = b._emscripten_bind_b2PrismaticJoint_IsLimitEnabled_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_IsLimitEnabled_0.apply(null, arguments);
}, Sh = b._emscripten_bind_b2DistanceJointDef_get_type_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_get_type_0.apply(null, arguments);
}, Th = b._emscripten_bind_b2Draw_ClearFlags_1 = function() {
  return b.asm._emscripten_bind_b2Draw_ClearFlags_1.apply(null, arguments);
}, Uh = b._emscripten_bind_b2Body_IsActive_0 = function() {
  return b.asm._emscripten_bind_b2Body_IsActive_0.apply(null, arguments);
}, Vh = b._emscripten_bind_b2Contact_ResetRestitution_0 = function() {
  return b.asm._emscripten_bind_b2Contact_ResetRestitution_0.apply(null, arguments);
}, Wh = b._emscripten_bind_b2World_GetAllowSleeping_0 = function() {
  return b.asm._emscripten_bind_b2World_GetAllowSleeping_0.apply(null, arguments);
}, Xh = b._emscripten_bind_b2ManifoldPoint_b2ManifoldPoint_0 = function() {
  return b.asm._emscripten_bind_b2ManifoldPoint_b2ManifoldPoint_0.apply(null, arguments);
}, Yh = b._emscripten_bind_b2EdgeShape_set_m_type_1 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_set_m_type_1.apply(null, arguments);
}, Zh = b._emscripten_enum_b2JointType_e_unknownJoint = function() {
  return b.asm._emscripten_enum_b2JointType_e_unknownJoint.apply(null, arguments);
}, $h = b._emscripten_bind_b2RevoluteJointDef_set_enableMotor_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_set_enableMotor_1.apply(null, arguments);
}, ai = b._emscripten_bind_b2PulleyJoint_IsActive_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_IsActive_0.apply(null, arguments);
}, bi = b._emscripten_bind_b2MouseJoint_GetNext_0 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_GetNext_0.apply(null, arguments);
}, ci = b._emscripten_bind_b2RevoluteJoint_SetUserData_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_SetUserData_1.apply(null, arguments);
}, di = b._emscripten_bind_b2RopeJointDef_get_localAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_get_localAnchorB_0.apply(null, arguments);
}, ei = b._emscripten_bind_b2PulleyJointDef_get_lengthB_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_get_lengthB_0.apply(null, arguments);
}, fi = b._emscripten_bind_b2WeldJoint_SetUserData_1 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_SetUserData_1.apply(null, arguments);
}, gi = b._emscripten_bind_b2ChainShape_CreateLoop_2 = function() {
  return b.asm._emscripten_bind_b2ChainShape_CreateLoop_2.apply(null, arguments);
}, hi = b._emscripten_bind_b2GearJointDef_get_joint1_0 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_get_joint1_0.apply(null, arguments);
}, ii = b._emscripten_bind_b2PrismaticJoint_GetMotorForce_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetMotorForce_1.apply(null, arguments);
}, ji = b._emscripten_bind_b2Body_SetUserData_1 = function() {
  return b.asm._emscripten_bind_b2Body_SetUserData_1.apply(null, arguments);
}, ki = b._emscripten_bind_b2GearJoint_IsActive_0 = function() {
  return b.asm._emscripten_bind_b2GearJoint_IsActive_0.apply(null, arguments);
}, li = b._emscripten_bind_b2EdgeShape_get_m_vertex0_0 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_get_m_vertex0_0.apply(null, arguments);
}, mi = b._emscripten_enum_b2JointType_e_revoluteJoint = function() {
  return b.asm._emscripten_enum_b2JointType_e_revoluteJoint.apply(null, arguments);
}, ni = b._emscripten_bind_b2Vec2_get_x_0 = function() {
  return b.asm._emscripten_bind_b2Vec2_get_x_0.apply(null, arguments);
}, oi = b._emscripten_bind_b2WeldJointDef_get_collideConnected_0 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_get_collideConnected_0.apply(null, arguments);
}, pi = b._emscripten_bind_b2FrictionJoint_GetMaxTorque_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_GetMaxTorque_0.apply(null, arguments);
}, qi = b._emscripten_bind_b2EdgeShape_RayCast_4 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_RayCast_4.apply(null, arguments);
}, ri = b._emscripten_bind_b2BodyDef_set_allowSleep_1 = function() {
  return b.asm._emscripten_bind_b2BodyDef_set_allowSleep_1.apply(null, arguments);
}, si = b._emscripten_bind_b2PulleyJoint_GetType_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_GetType_0.apply(null, arguments);
}, ti = b._emscripten_bind_b2WeldJointDef_set_localAnchorA_1 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_set_localAnchorA_1.apply(null, arguments);
}, ui = b._emscripten_bind_b2Profile_set_step_1 = function() {
  return b.asm._emscripten_bind_b2Profile_set_step_1.apply(null, arguments);
}, vi = b._emscripten_bind_b2ContactEdge_set_other_1 = function() {
  return b.asm._emscripten_bind_b2ContactEdge_set_other_1.apply(null, arguments);
}, wi = b._emscripten_bind_b2Vec2_op_mul_1 = function() {
  return b.asm._emscripten_bind_b2Vec2_op_mul_1.apply(null, arguments);
}, xi = b._emscripten_bind_b2PrismaticJointDef_get_localAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_get_localAnchorA_0.apply(null, arguments);
}, yi = b._emscripten_bind_b2RopeJoint_GetAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_GetAnchorA_0.apply(null, arguments);
}, zi = b._emscripten_bind_b2DistanceJointDef_get_bodyA_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_get_bodyA_0.apply(null, arguments);
}, Ai = b._emscripten_bind_b2AABB_Combine_2 = function() {
  return b.asm._emscripten_bind_b2AABB_Combine_2.apply(null, arguments);
}, Bi = b._emscripten_bind_b2ManifoldPoint_set_tangentImpulse_1 = function() {
  return b.asm._emscripten_bind_b2ManifoldPoint_set_tangentImpulse_1.apply(null, arguments);
}, Ci = b._emscripten_bind_b2BodyDef_get_allowSleep_0 = function() {
  return b.asm._emscripten_bind_b2BodyDef_get_allowSleep_0.apply(null, arguments);
}, Di = b._emscripten_bind_b2ContactEdge_get_other_0 = function() {
  return b.asm._emscripten_bind_b2ContactEdge_get_other_0.apply(null, arguments);
}, Ei = b._emscripten_bind_b2RopeJoint_GetLocalAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_GetLocalAnchorB_0.apply(null, arguments);
}, Fi = b._emscripten_bind_b2PulleyJointDef___destroy___0 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef___destroy___0.apply(null, arguments);
}, Gi = b._emscripten_bind_b2MouseJoint_GetBodyB_0 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_GetBodyB_0.apply(null, arguments);
}, Hi = b._emscripten_bind_b2PolygonShape_TestPoint_2 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_TestPoint_2.apply(null, arguments);
}, Ii = b._emscripten_bind_b2BodyDef_set_userData_1 = function() {
  return b.asm._emscripten_bind_b2BodyDef_set_userData_1.apply(null, arguments);
}, Ji = b._emscripten_bind_b2PolygonShape_b2PolygonShape_0 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_b2PolygonShape_0.apply(null, arguments);
}, Ki = b._emscripten_bind_b2PolygonShape_Set_2 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_Set_2.apply(null, arguments);
}, Li = b._emscripten_bind_b2GearJoint_GetReactionForce_1 = function() {
  return b.asm._emscripten_bind_b2GearJoint_GetReactionForce_1.apply(null, arguments);
}, Mi = b._emscripten_bind_b2DistanceJointDef_get_localAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_get_localAnchorA_0.apply(null, arguments);
}, Ni = b._emscripten_bind_b2Fixture_SetUserData_1 = function() {
  return b.asm._emscripten_bind_b2Fixture_SetUserData_1.apply(null, arguments);
}, Oi = b._emscripten_bind_b2PrismaticJointDef_b2PrismaticJointDef_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_b2PrismaticJointDef_0.apply(null, arguments);
}, Pi = b._emscripten_bind_b2BodyDef_get_active_0 = function() {
  return b.asm._emscripten_bind_b2BodyDef_get_active_0.apply(null, arguments);
}, Qi = b._emscripten_bind_b2Body_GetAngularVelocity_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetAngularVelocity_0.apply(null, arguments);
}, Ri = b._emscripten_bind_b2CircleShape_set_m_p_1 = function() {
  return b.asm._emscripten_bind_b2CircleShape_set_m_p_1.apply(null, arguments);
}, Si = b._emscripten_bind_b2WheelJointDef_Initialize_4 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_Initialize_4.apply(null, arguments);
}, Ti = b._emscripten_bind_b2WeldJointDef_set_dampingRatio_1 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_set_dampingRatio_1.apply(null, arguments);
}, Ui = b._emscripten_bind_b2ChainShape_b2ChainShape_0 = function() {
  return b.asm._emscripten_bind_b2ChainShape_b2ChainShape_0.apply(null, arguments);
}, Vi = b._emscripten_bind_b2Joint_GetAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2Joint_GetAnchorB_0.apply(null, arguments);
}, Wi = b._emscripten_bind_b2PrismaticJointDef_get_userData_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_get_userData_0.apply(null, arguments);
}, Xi = b._emscripten_bind_b2ContactFeature_set_typeB_1 = function() {
  return b.asm._emscripten_bind_b2ContactFeature_set_typeB_1.apply(null, arguments);
}, Yi = b._emscripten_bind_b2RevoluteJoint_GetBodyA_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetBodyA_0.apply(null, arguments);
}, Zi = b._emscripten_bind_b2ContactID_set_cf_1 = function() {
  return b.asm._emscripten_bind_b2ContactID_set_cf_1.apply(null, arguments);
}, $i = b._emscripten_bind_b2Body_GetGravityScale_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetGravityScale_0.apply(null, arguments);
}, aj = b._emscripten_bind_b2Vec3_Set_3 = function() {
  return b.asm._emscripten_bind_b2Vec3_Set_3.apply(null, arguments);
}, bj = b._emscripten_bind_b2RevoluteJointDef_set_localAnchorA_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_set_localAnchorA_1.apply(null, arguments);
}, cj = b._emscripten_bind_b2FrictionJointDef_set_localAnchorB_1 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_set_localAnchorB_1.apply(null, arguments);
}, dj = b._emscripten_bind_b2PulleyJoint_GetNext_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_GetNext_0.apply(null, arguments);
}, ej = b._emscripten_bind_b2ChainShape_get_m_type_0 = function() {
  return b.asm._emscripten_bind_b2ChainShape_get_m_type_0.apply(null, arguments);
}, fj = b._emscripten_bind_b2PulleyJointDef_get_groundAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_get_groundAnchorB_0.apply(null, arguments);
}, gj = b._emscripten_bind_JSDraw_DrawTransform_1 = function() {
  return b.asm._emscripten_bind_JSDraw_DrawTransform_1.apply(null, arguments);
}, hj = b._emscripten_bind_b2GearJointDef_get_bodyA_0 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_get_bodyA_0.apply(null, arguments);
}, ij = b._emscripten_bind_b2DistanceJointDef_set_frequencyHz_1 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_set_frequencyHz_1.apply(null, arguments);
}, jj = b._emscripten_bind_b2RevoluteJointDef_get_localAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_get_localAnchorB_0.apply(null, arguments);
}, kj = b._emscripten_bind_b2RevoluteJointDef_get_referenceAngle_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_get_referenceAngle_0.apply(null, arguments);
}, lj = b._emscripten_bind_JSContactFilter___destroy___0 = function() {
  return b.asm._emscripten_bind_JSContactFilter___destroy___0.apply(null, arguments);
}, mj = b._emscripten_bind_b2RevoluteJointDef_get_enableMotor_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_get_enableMotor_0.apply(null, arguments);
}, Ib = b._memset = function() {
  return b.asm._memset.apply(null, arguments);
}, nj = b._emscripten_bind_b2PolygonShape_get_m_radius_0 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_get_m_radius_0.apply(null, arguments);
}, oj = b._emscripten_enum_b2BodyType_b2_kinematicBody = function() {
  return b.asm._emscripten_enum_b2BodyType_b2_kinematicBody.apply(null, arguments);
}, pj = b._emscripten_bind_b2RevoluteJointDef_Initialize_3 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_Initialize_3.apply(null, arguments);
}, qj = b._emscripten_enum_b2ManifoldType_e_faceA = function() {
  return b.asm._emscripten_enum_b2ManifoldType_e_faceA.apply(null, arguments);
}, rj = b._emscripten_enum_b2ManifoldType_e_faceB = function() {
  return b.asm._emscripten_enum_b2ManifoldType_e_faceB.apply(null, arguments);
}, sj = b._emscripten_bind_b2RevoluteJointDef_get_bodyB_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_get_bodyB_0.apply(null, arguments);
}, tj = b._emscripten_bind_b2FixtureDef_b2FixtureDef_0 = function() {
  return b.asm._emscripten_bind_b2FixtureDef_b2FixtureDef_0.apply(null, arguments);
}, uj = b._emscripten_bind_b2PrismaticJoint_SetUserData_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_SetUserData_1.apply(null, arguments);
}, vj = b._emscripten_bind_b2EdgeShape_get_m_hasVertex3_0 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_get_m_hasVertex3_0.apply(null, arguments);
}, wj = b._emscripten_enum_b2ShapeType_e_edge = function() {
  return b.asm._emscripten_enum_b2ShapeType_e_edge.apply(null, arguments);
}, xj = b._emscripten_bind_b2RevoluteJoint_GetMaxMotorTorque_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetMaxMotorTorque_0.apply(null, arguments);
}, yj = b._emscripten_bind_b2BodyDef_set_active_1 = function() {
  return b.asm._emscripten_bind_b2BodyDef_set_active_1.apply(null, arguments);
}, zj = b._emscripten_bind_b2EdgeShape_Set_2 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_Set_2.apply(null, arguments);
}, Aj = b._emscripten_bind_b2FixtureDef_set_isSensor_1 = function() {
  return b.asm._emscripten_bind_b2FixtureDef_set_isSensor_1.apply(null, arguments);
}, Bj = b._emscripten_bind_b2Body_GetWorldPoint_1 = function() {
  return b.asm._emscripten_bind_b2Body_GetWorldPoint_1.apply(null, arguments);
}, Cj = b._emscripten_bind_b2ManifoldPoint_get_normalImpulse_0 = function() {
  return b.asm._emscripten_bind_b2ManifoldPoint_get_normalImpulse_0.apply(null, arguments);
}, Dj = b._emscripten_bind_JSContactFilter_ShouldCollide_2 = function() {
  return b.asm._emscripten_bind_JSContactFilter_ShouldCollide_2.apply(null, arguments);
}, Ej = b._emscripten_bind_b2Joint_GetReactionTorque_1 = function() {
  return b.asm._emscripten_bind_b2Joint_GetReactionTorque_1.apply(null, arguments);
}, Fj = b._emscripten_bind_b2RevoluteJointDef_set_type_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_set_type_1.apply(null, arguments);
}, Gj = b._emscripten_bind_b2RayCastInput_set_p1_1 = function() {
  return b.asm._emscripten_bind_b2RayCastInput_set_p1_1.apply(null, arguments);
}, Hj = b._emscripten_bind_b2RopeJointDef_b2RopeJointDef_0 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_b2RopeJointDef_0.apply(null, arguments);
}, Ij = b._emscripten_bind_b2BodyDef_get_linearDamping_0 = function() {
  return b.asm._emscripten_bind_b2BodyDef_get_linearDamping_0.apply(null, arguments);
}, Jj = b._emscripten_bind_b2World_Step_3 = function() {
  return b.asm._emscripten_bind_b2World_Step_3.apply(null, arguments);
}, Kj = b._emscripten_bind_b2CircleShape_RayCast_4 = function() {
  return b.asm._emscripten_bind_b2CircleShape_RayCast_4.apply(null, arguments);
}, Lj = b._emscripten_bind_b2Profile_get_step_0 = function() {
  return b.asm._emscripten_bind_b2Profile_get_step_0.apply(null, arguments);
}, Mj = b._emscripten_bind_b2AABB_RayCast_2 = function() {
  return b.asm._emscripten_bind_b2AABB_RayCast_2.apply(null, arguments);
}, Nj = b._emscripten_bind_b2Mat22_SetZero_0 = function() {
  return b.asm._emscripten_bind_b2Mat22_SetZero_0.apply(null, arguments);
};
b.setTempRet0 = function() {
  return b.asm.setTempRet0.apply(null, arguments);
};
var Oj = b._emscripten_bind_b2DistanceJoint_GetLength_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_GetLength_0.apply(null, arguments);
}, Pj = b._emscripten_bind_b2PulleyJoint_GetLengthB_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_GetLengthB_0.apply(null, arguments);
}, Qj = b._emscripten_bind_b2PrismaticJoint_GetUpperLimit_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetUpperLimit_0.apply(null, arguments);
}, Rj = b._emscripten_bind_b2WheelJoint_SetMaxMotorTorque_1 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_SetMaxMotorTorque_1.apply(null, arguments);
}, Sj = b._emscripten_bind_b2FrictionJoint_GetReactionTorque_1 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_GetReactionTorque_1.apply(null, arguments);
}, Tj = b._emscripten_bind_b2Shape_get_m_type_0 = function() {
  return b.asm._emscripten_bind_b2Shape_get_m_type_0.apply(null, arguments);
}, Uj = b._emscripten_bind_b2MouseJoint_SetDampingRatio_1 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_SetDampingRatio_1.apply(null, arguments);
}, Vj = b._emscripten_bind_b2World_GetAutoClearForces_0 = function() {
  return b.asm._emscripten_bind_b2World_GetAutoClearForces_0.apply(null, arguments);
}, Wj = b._emscripten_bind_b2Fixture_SetFilterData_1 = function() {
  return b.asm._emscripten_bind_b2Fixture_SetFilterData_1.apply(null, arguments);
}, Xj = b._emscripten_enum_b2ShapeType_e_circle = function() {
  return b.asm._emscripten_enum_b2ShapeType_e_circle.apply(null, arguments);
}, Yj = b._emscripten_bind_b2BodyDef_set_fixedRotation_1 = function() {
  return b.asm._emscripten_bind_b2BodyDef_set_fixedRotation_1.apply(null, arguments);
}, Zj = b._emscripten_bind_b2Vec2_b2Vec2_2 = function() {
  return b.asm._emscripten_bind_b2Vec2_b2Vec2_2.apply(null, arguments);
}, ak = b._emscripten_bind_b2Manifold_get_type_0 = function() {
  return b.asm._emscripten_bind_b2Manifold_get_type_0.apply(null, arguments);
}, bk = b._emscripten_bind_b2Body_Dump_0 = function() {
  return b.asm._emscripten_bind_b2Body_Dump_0.apply(null, arguments);
}, ck = b._emscripten_bind_b2RevoluteJoint_GetLowerLimit_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetLowerLimit_0.apply(null, arguments);
}, dk = b._emscripten_bind_b2Body_GetWorldCenter_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetWorldCenter_0.apply(null, arguments);
}, ek = b._emscripten_bind_b2WheelJointDef_set_maxMotorTorque_1 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_set_maxMotorTorque_1.apply(null, arguments);
}, fk = b._emscripten_bind_b2BodyDef_set_linearVelocity_1 = function() {
  return b.asm._emscripten_bind_b2BodyDef_set_linearVelocity_1.apply(null, arguments);
}, gk = b._emscripten_bind_b2JointDef_set_collideConnected_1 = function() {
  return b.asm._emscripten_bind_b2JointDef_set_collideConnected_1.apply(null, arguments);
}, hk = b._emscripten_bind_b2Body_GetUserData_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetUserData_0.apply(null, arguments);
}, ik = b._emscripten_bind_b2Body_GetAngularDamping_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetAngularDamping_0.apply(null, arguments);
}, jk = b._emscripten_bind_b2Fixture_RayCast_3 = function() {
  return b.asm._emscripten_bind_b2Fixture_RayCast_3.apply(null, arguments);
}, kk = b._emscripten_bind_b2JointDef_set_bodyA_1 = function() {
  return b.asm._emscripten_bind_b2JointDef_set_bodyA_1.apply(null, arguments);
}, lk = b._emscripten_bind_b2GearJointDef_get_collideConnected_0 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_get_collideConnected_0.apply(null, arguments);
}, mk = b._emscripten_bind_b2RopeJointDef_get_maxLength_0 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_get_maxLength_0.apply(null, arguments);
}, nk = b._emscripten_bind_b2MouseJointDef_get_bodyA_0 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_get_bodyA_0.apply(null, arguments);
}, ok = b._emscripten_bind_b2Body_SetBullet_1 = function() {
  return b.asm._emscripten_bind_b2Body_SetBullet_1.apply(null, arguments);
}, pk = b._emscripten_bind_b2DistanceJoint_GetType_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_GetType_0.apply(null, arguments);
}, qk = b._emscripten_bind_b2FixtureDef_get_restitution_0 = function() {
  return b.asm._emscripten_bind_b2FixtureDef_get_restitution_0.apply(null, arguments);
}, rk = b._emscripten_bind_b2Fixture_GetType_0 = function() {
  return b.asm._emscripten_bind_b2Fixture_GetType_0.apply(null, arguments);
}, sk = b._emscripten_bind_b2WheelJointDef_set_enableMotor_1 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_set_enableMotor_1.apply(null, arguments);
}, tk = b._emscripten_bind_b2RevoluteJoint_GetBodyB_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetBodyB_0.apply(null, arguments);
}, uk = b._emscripten_bind_b2Profile_set_solveInit_1 = function() {
  return b.asm._emscripten_bind_b2Profile_set_solveInit_1.apply(null, arguments);
}, vk = b._emscripten_bind_b2RopeJointDef_set_type_1 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_set_type_1.apply(null, arguments);
}, wk = b._emscripten_bind_b2PrismaticJointDef_get_bodyB_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_get_bodyB_0.apply(null, arguments);
}, xk = b._emscripten_bind_b2GearJoint_GetJoint2_0 = function() {
  return b.asm._emscripten_bind_b2GearJoint_GetJoint2_0.apply(null, arguments);
}, yk = b._emscripten_bind_b2PulleyJointDef_get_userData_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_get_userData_0.apply(null, arguments);
}, zk = b._emscripten_bind_b2PrismaticJointDef_set_bodyB_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_set_bodyB_1.apply(null, arguments);
}, Ak = b._emscripten_bind_b2FrictionJointDef_b2FrictionJointDef_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_b2FrictionJointDef_0.apply(null, arguments);
}, Bk = b._emscripten_bind_b2MouseJoint_GetFrequency_0 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_GetFrequency_0.apply(null, arguments);
}, Ck = b._emscripten_bind_b2Manifold_get_localNormal_0 = function() {
  return b.asm._emscripten_bind_b2Manifold_get_localNormal_0.apply(null, arguments);
}, Dk = b._emscripten_bind_b2Vec3_b2Vec3_0 = function() {
  return b.asm._emscripten_bind_b2Vec3_b2Vec3_0.apply(null, arguments);
}, Ek = b._emscripten_bind_b2Body_SetSleepingAllowed_1 = function() {
  return b.asm._emscripten_bind_b2Body_SetSleepingAllowed_1.apply(null, arguments);
}, Fk = b._emscripten_bind_b2DistanceJoint___destroy___0 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint___destroy___0.apply(null, arguments);
}, Gk = b._emscripten_bind_b2PrismaticJoint_GetAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetAnchorA_0.apply(null, arguments);
}, Hk = b._emscripten_bind_b2Manifold_set_pointCount_1 = function() {
  return b.asm._emscripten_bind_b2Manifold_set_pointCount_1.apply(null, arguments);
}, Ik = b._emscripten_bind_b2PrismaticJoint_IsMotorEnabled_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_IsMotorEnabled_0.apply(null, arguments);
}, Jk = b._emscripten_bind_b2WeldJoint_GetFrequency_0 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_GetFrequency_0.apply(null, arguments);
}, Kk = b._emscripten_bind_b2Joint_GetUserData_0 = function() {
  return b.asm._emscripten_bind_b2Joint_GetUserData_0.apply(null, arguments);
}, Lk = b._emscripten_bind_b2RevoluteJointDef_get_lowerAngle_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_get_lowerAngle_0.apply(null, arguments);
}, Mk = b._emscripten_bind_b2Manifold_set_type_1 = function() {
  return b.asm._emscripten_bind_b2Manifold_set_type_1.apply(null, arguments);
}, Nk = b._emscripten_bind_b2Vec3_b2Vec3_3 = function() {
  return b.asm._emscripten_bind_b2Vec3_b2Vec3_3.apply(null, arguments);
}, Ok = b._emscripten_bind_b2RopeJointDef_set_maxLength_1 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_set_maxLength_1.apply(null, arguments);
}, Pk = b._emscripten_bind_b2ChainShape_TestPoint_2 = function() {
  return b.asm._emscripten_bind_b2ChainShape_TestPoint_2.apply(null, arguments);
}, Qk = b._emscripten_bind_b2PrismaticJoint_GetReferenceAngle_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetReferenceAngle_0.apply(null, arguments);
}, Rk = b._emscripten_bind_b2RayCastInput_get_p2_0 = function() {
  return b.asm._emscripten_bind_b2RayCastInput_get_p2_0.apply(null, arguments);
}, Sk = b._emscripten_bind_b2BodyDef_set_angle_1 = function() {
  return b.asm._emscripten_bind_b2BodyDef_set_angle_1.apply(null, arguments);
}, Tk = b._emscripten_bind_b2WeldJoint_GetUserData_0 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_GetUserData_0.apply(null, arguments);
}, Uk = b._emscripten_bind_b2WheelJointDef_get_localAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_get_localAnchorA_0.apply(null, arguments);
}, Vk = b._emscripten_bind_b2PulleyJointDef_set_type_1 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_set_type_1.apply(null, arguments);
}, Wk = b._emscripten_bind_b2Body_IsBullet_0 = function() {
  return b.asm._emscripten_bind_b2Body_IsBullet_0.apply(null, arguments);
}, Xk = b._emscripten_bind_b2Body_ApplyLinearImpulse_2 = function() {
  return b.asm._emscripten_bind_b2Body_ApplyLinearImpulse_2.apply(null, arguments);
}, Yk = b._emscripten_bind_b2Mat33_GetSymInverse33_1 = function() {
  return b.asm._emscripten_bind_b2Mat33_GetSymInverse33_1.apply(null, arguments);
}, Zk = b._emscripten_bind_b2PolygonShape_ComputeMass_2 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_ComputeMass_2.apply(null, arguments);
}, $k = b._emscripten_bind_b2PrismaticJointDef_set_upperTranslation_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_set_upperTranslation_1.apply(null, arguments);
}, al = b._emscripten_bind_b2MouseJoint_SetFrequency_1 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_SetFrequency_1.apply(null, arguments);
}, bl = b._emscripten_bind_b2EdgeShape_get_m_vertex1_0 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_get_m_vertex1_0.apply(null, arguments);
}, cl = b._emscripten_bind_b2BodyDef_set_awake_1 = function() {
  return b.asm._emscripten_bind_b2BodyDef_set_awake_1.apply(null, arguments);
}, dl = b._emscripten_bind_b2Vec2_get_y_0 = function() {
  return b.asm._emscripten_bind_b2Vec2_get_y_0.apply(null, arguments);
}, el = b._emscripten_bind_b2Filter_set_categoryBits_1 = function() {
  return b.asm._emscripten_bind_b2Filter_set_categoryBits_1.apply(null, arguments);
}, fl = b._emscripten_bind_b2Body_CreateFixture_2 = function() {
  return b.asm._emscripten_bind_b2Body_CreateFixture_2.apply(null, arguments);
}, gl = b._emscripten_bind_b2Body_SetActive_1 = function() {
  return b.asm._emscripten_bind_b2Body_SetActive_1.apply(null, arguments);
}, hl = b._emscripten_bind_b2Fixture_GetUserData_0 = function() {
  return b.asm._emscripten_bind_b2Fixture_GetUserData_0.apply(null, arguments);
}, il = b._emscripten_bind_b2PolygonShape_ComputeAABB_3 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_ComputeAABB_3.apply(null, arguments);
}, jl = b._emscripten_bind_b2ContactFeature_get_typeA_0 = function() {
  return b.asm._emscripten_bind_b2ContactFeature_get_typeA_0.apply(null, arguments);
}, kl = b._emscripten_bind_b2MouseJointDef_set_maxForce_1 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_set_maxForce_1.apply(null, arguments);
}, ll = b._emscripten_bind_b2PrismaticJoint_GetLocalAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetLocalAnchorA_0.apply(null, arguments);
}, ml = b._emscripten_bind_b2EdgeShape_TestPoint_2 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_TestPoint_2.apply(null, arguments);
}, nl = b._emscripten_bind_b2PolygonShape_get_m_centroid_0 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_get_m_centroid_0.apply(null, arguments);
}, ol = b._emscripten_bind_b2ChainShape___destroy___0 = function() {
  return b.asm._emscripten_bind_b2ChainShape___destroy___0.apply(null, arguments);
}, pl = b._emscripten_bind_b2GearJoint_SetUserData_1 = function() {
  return b.asm._emscripten_bind_b2GearJoint_SetUserData_1.apply(null, arguments);
}, ql = b._emscripten_bind_b2Vec3_set_z_1 = function() {
  return b.asm._emscripten_bind_b2Vec3_set_z_1.apply(null, arguments);
}, rl = b._emscripten_bind_b2PrismaticJointDef_set_enableLimit_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_set_enableLimit_1.apply(null, arguments);
}, sl = b._emscripten_bind_b2DistanceJoint_GetFrequency_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_GetFrequency_0.apply(null, arguments);
}, tl = b._emscripten_bind_b2PrismaticJointDef_get_collideConnected_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_get_collideConnected_0.apply(null, arguments);
}, ul = b._emscripten_bind_b2Body_SetGravityScale_1 = function() {
  return b.asm._emscripten_bind_b2Body_SetGravityScale_1.apply(null, arguments);
}, vl = b._emscripten_bind_b2RevoluteJoint_GetUpperLimit_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetUpperLimit_0.apply(null, arguments);
}, wl = b._emscripten_bind_b2PulleyJointDef_get_lengthA_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_get_lengthA_0.apply(null, arguments);
}, xl = b._emscripten_bind_b2Vec3_set_x_1 = function() {
  return b.asm._emscripten_bind_b2Vec3_set_x_1.apply(null, arguments);
}, yl = b._emscripten_bind_b2PulleyJointDef_get_type_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_get_type_0.apply(null, arguments);
}, zl = b._emscripten_bind_JSDestructionListener_SayGoodbyeJoint_1 = function() {
  return b.asm._emscripten_bind_JSDestructionListener_SayGoodbyeJoint_1.apply(null, arguments);
}, Al = b._emscripten_bind_b2Shape___destroy___0 = function() {
  return b.asm._emscripten_bind_b2Shape___destroy___0.apply(null, arguments);
}, Bl = b._emscripten_bind_b2DistanceJointDef_get_length_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_get_length_0.apply(null, arguments);
}, Cl = b._emscripten_bind_b2Joint_GetReactionForce_1 = function() {
  return b.asm._emscripten_bind_b2Joint_GetReactionForce_1.apply(null, arguments);
}, Dl = b._emscripten_bind_b2FixtureDef_set_friction_1 = function() {
  return b.asm._emscripten_bind_b2FixtureDef_set_friction_1.apply(null, arguments);
}, El = b._emscripten_bind_b2ContactID___destroy___0 = function() {
  return b.asm._emscripten_bind_b2ContactID___destroy___0.apply(null, arguments);
}, Fl = b._emscripten_bind_b2EdgeShape_get_m_hasVertex0_0 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_get_m_hasVertex0_0.apply(null, arguments);
}, Gl = b._emscripten_bind_b2World_GetBodyCount_0 = function() {
  return b.asm._emscripten_bind_b2World_GetBodyCount_0.apply(null, arguments);
}, Hl = b._emscripten_bind_b2JointEdge_get_prev_0 = function() {
  return b.asm._emscripten_bind_b2JointEdge_get_prev_0.apply(null, arguments);
}, Il = b._emscripten_bind_b2Draw___destroy___0 = function() {
  return b.asm._emscripten_bind_b2Draw___destroy___0.apply(null, arguments);
}, Jl = b._emscripten_bind_b2PrismaticJoint_GetAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetAnchorB_0.apply(null, arguments);
}, Kl = b._emscripten_bind_b2Body_SetLinearVelocity_1 = function() {
  return b.asm._emscripten_bind_b2Body_SetLinearVelocity_1.apply(null, arguments);
}, Ll = b._emscripten_enum_b2BodyType_b2_staticBody = function() {
  return b.asm._emscripten_enum_b2BodyType_b2_staticBody.apply(null, arguments);
}, Ml = b._emscripten_bind_b2RevoluteJointDef_set_upperAngle_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_set_upperAngle_1.apply(null, arguments);
}, Nl = b._emscripten_bind_b2RevoluteJointDef_get_type_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_get_type_0.apply(null, arguments);
}, Ol = b._emscripten_bind_b2GearJointDef_get_type_0 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_get_type_0.apply(null, arguments);
}, Pl = b._emscripten_bind_b2ChainShape_GetType_0 = function() {
  return b.asm._emscripten_bind_b2ChainShape_GetType_0.apply(null, arguments);
}, Ql = b._emscripten_bind_b2RayCastInput_get_maxFraction_0 = function() {
  return b.asm._emscripten_bind_b2RayCastInput_get_maxFraction_0.apply(null, arguments);
}, Rl = b._emscripten_bind_b2GearJoint_GetBodyA_0 = function() {
  return b.asm._emscripten_bind_b2GearJoint_GetBodyA_0.apply(null, arguments);
}, Sl = b._emscripten_bind_b2Body_GetLocalVector_1 = function() {
  return b.asm._emscripten_bind_b2Body_GetLocalVector_1.apply(null, arguments);
}, Tl = b._emscripten_bind_b2PrismaticJoint_EnableLimit_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_EnableLimit_1.apply(null, arguments);
}, Ul = b._emscripten_bind_b2FrictionJointDef_get_maxForce_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_get_maxForce_0.apply(null, arguments);
}, Vl = b._emscripten_bind_b2BodyDef_set_angularVelocity_1 = function() {
  return b.asm._emscripten_bind_b2BodyDef_set_angularVelocity_1.apply(null, arguments);
}, Wl = b._emscripten_bind_b2Body_SetLinearDamping_1 = function() {
  return b.asm._emscripten_bind_b2Body_SetLinearDamping_1.apply(null, arguments);
}, Xl = b._emscripten_bind_b2WheelJoint_GetBodyB_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetBodyB_0.apply(null, arguments);
}, Yl = b._emscripten_bind_b2GearJointDef_get_joint2_0 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_get_joint2_0.apply(null, arguments);
}, Zl = b._emscripten_bind_b2PrismaticJoint_IsActive_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_IsActive_0.apply(null, arguments);
}, $l = b._emscripten_bind_b2Vec3_get_z_0 = function() {
  return b.asm._emscripten_bind_b2Vec3_get_z_0.apply(null, arguments);
}, am = b._emscripten_enum_b2JointType_e_weldJoint = function() {
  return b.asm._emscripten_enum_b2JointType_e_weldJoint.apply(null, arguments);
}, bm = b._emscripten_bind_b2World_SetContinuousPhysics_1 = function() {
  return b.asm._emscripten_bind_b2World_SetContinuousPhysics_1.apply(null, arguments);
}, cm = b._emscripten_bind_b2MouseJointDef_get_target_0 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_get_target_0.apply(null, arguments);
}, dm = b._emscripten_bind_b2Body_SetTransform_2 = function() {
  return b.asm._emscripten_bind_b2Body_SetTransform_2.apply(null, arguments);
}, em = b._emscripten_bind_b2PulleyJointDef_set_userData_1 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_set_userData_1.apply(null, arguments);
}, fm = b._emscripten_bind_b2FrictionJointDef_set_maxForce_1 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_set_maxForce_1.apply(null, arguments);
}, gm = b._emscripten_bind_b2DistanceJointDef_b2DistanceJointDef_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_b2DistanceJointDef_0.apply(null, arguments);
}, hm = b._emscripten_bind_b2BodyDef_get_type_0 = function() {
  return b.asm._emscripten_bind_b2BodyDef_get_type_0.apply(null, arguments);
}, im = b._emscripten_bind_b2Mat33_GetInverse22_1 = function() {
  return b.asm._emscripten_bind_b2Mat33_GetInverse22_1.apply(null, arguments);
}, jm = b._emscripten_bind_b2DistanceJointDef_get_localAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_get_localAnchorB_0.apply(null, arguments);
}, km = b._emscripten_bind_b2PulleyJoint_GetAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_GetAnchorB_0.apply(null, arguments);
}, lm = b._emscripten_bind_b2WheelJoint_GetReactionTorque_1 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetReactionTorque_1.apply(null, arguments);
}, mm = b._emscripten_bind_b2RevoluteJointDef_b2RevoluteJointDef_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_b2RevoluteJointDef_0.apply(null, arguments);
}, nm = b._emscripten_bind_b2ContactFeature_set_typeA_1 = function() {
  return b.asm._emscripten_bind_b2ContactFeature_set_typeA_1.apply(null, arguments);
}, om = b._emscripten_bind_b2Fixture_Dump_1 = function() {
  return b.asm._emscripten_bind_b2Fixture_Dump_1.apply(null, arguments);
}, pm = b._emscripten_bind_b2RevoluteJointDef_get_enableLimit_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_get_enableLimit_0.apply(null, arguments);
}, qm = b._emscripten_bind_b2Manifold_set_localPoint_1 = function() {
  return b.asm._emscripten_bind_b2Manifold_set_localPoint_1.apply(null, arguments);
}, rm = b._emscripten_bind_b2JointDef_get_userData_0 = function() {
  return b.asm._emscripten_bind_b2JointDef_get_userData_0.apply(null, arguments);
}, sm = b._emscripten_bind_b2BodyDef_set_bullet_1 = function() {
  return b.asm._emscripten_bind_b2BodyDef_set_bullet_1.apply(null, arguments);
}, tm = b._emscripten_bind_b2RayCastOutput___destroy___0 = function() {
  return b.asm._emscripten_bind_b2RayCastOutput___destroy___0.apply(null, arguments);
}, um = b._emscripten_bind_JSContactListener___destroy___0 = function() {
  return b.asm._emscripten_bind_JSContactListener___destroy___0.apply(null, arguments);
}, wm = b._emscripten_bind_b2World_DrawDebugData_0 = function() {
  return b.asm._emscripten_bind_b2World_DrawDebugData_0.apply(null, arguments);
};
b.___cxa_can_catch = function() {
  return b.asm.___cxa_can_catch.apply(null, arguments);
};
var xm = b._emscripten_bind_b2RopeJointDef_get_localAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_get_localAnchorA_0.apply(null, arguments);
}, ym = b._emscripten_bind_b2Profile_set_solveVelocity_1 = function() {
  return b.asm._emscripten_bind_b2Profile_set_solveVelocity_1.apply(null, arguments);
}, zm = b._emscripten_bind_b2GearJointDef_get_userData_0 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_get_userData_0.apply(null, arguments);
}, Am = b._emscripten_bind_b2Filter_set_groupIndex_1 = function() {
  return b.asm._emscripten_bind_b2Filter_set_groupIndex_1.apply(null, arguments);
}, Bm = b._emscripten_bind_b2JointDef_b2JointDef_0 = function() {
  return b.asm._emscripten_bind_b2JointDef_b2JointDef_0.apply(null, arguments);
}, Cm = b._emscripten_bind_b2Rot_set_c_1 = function() {
  return b.asm._emscripten_bind_b2Rot_set_c_1.apply(null, arguments);
}, Dm = b._emscripten_bind_b2GearJointDef_b2GearJointDef_0 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_b2GearJointDef_0.apply(null, arguments);
}, Em = b._emscripten_bind_b2JointDef_get_bodyB_0 = function() {
  return b.asm._emscripten_bind_b2JointDef_get_bodyB_0.apply(null, arguments);
}, Fm = b._emscripten_bind_b2DistanceJoint_GetReactionForce_1 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_GetReactionForce_1.apply(null, arguments);
}, Gm = b._emscripten_bind_b2PrismaticJoint_GetJointSpeed_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetJointSpeed_0.apply(null, arguments);
}, Hm = b._emscripten_bind_b2FixtureDef_get_density_0 = function() {
  return b.asm._emscripten_bind_b2FixtureDef_get_density_0.apply(null, arguments);
}, Im = b._emscripten_bind_b2Joint_GetAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2Joint_GetAnchorA_0.apply(null, arguments);
}, Jm = b._emscripten_bind_b2Contact_GetRestitution_0 = function() {
  return b.asm._emscripten_bind_b2Contact_GetRestitution_0.apply(null, arguments);
}, Km = b._emscripten_bind_b2ContactEdge_get_contact_0 = function() {
  return b.asm._emscripten_bind_b2ContactEdge_get_contact_0.apply(null, arguments);
}, Lm = b._emscripten_bind_b2RevoluteJointDef_get_userData_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_get_userData_0.apply(null, arguments);
}, Mm = b._emscripten_bind_b2Fixture_GetAABB_1 = function() {
  return b.asm._emscripten_bind_b2Fixture_GetAABB_1.apply(null, arguments);
}, Nm = b._emscripten_bind_b2PrismaticJointDef_set_collideConnected_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_set_collideConnected_1.apply(null, arguments);
}, Om = b._emscripten_bind_b2Body_GetMassData_1 = function() {
  return b.asm._emscripten_bind_b2Body_GetMassData_1.apply(null, arguments);
}, Pm = b._emscripten_bind_b2RevoluteJointDef_get_localAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_get_localAnchorA_0.apply(null, arguments);
}, Qm = b._emscripten_bind_b2EdgeShape_ComputeMass_2 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_ComputeMass_2.apply(null, arguments);
}, Rm = b._emscripten_bind_b2GearJointDef_get_bodyB_0 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_get_bodyB_0.apply(null, arguments);
}, Sm = b._emscripten_bind_b2WheelJointDef_get_bodyB_0 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_get_bodyB_0.apply(null, arguments);
}, Tm = b._emscripten_bind_b2Rot_set_s_1 = function() {
  return b.asm._emscripten_bind_b2Rot_set_s_1.apply(null, arguments);
}, Um = b._emscripten_bind_b2RevoluteJointDef_set_localAnchorB_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_set_localAnchorB_1.apply(null, arguments);
}, Vm = b._emscripten_bind_b2Body_DestroyFixture_1 = function() {
  return b.asm._emscripten_bind_b2Body_DestroyFixture_1.apply(null, arguments);
}, Wm = b._emscripten_bind_b2Profile_set_broadphase_1 = function() {
  return b.asm._emscripten_bind_b2Profile_set_broadphase_1.apply(null, arguments);
}, Xm = b._emscripten_bind_b2WheelJointDef_get_localAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_get_localAnchorB_0.apply(null, arguments);
}, Ym = b._emscripten_bind_b2ContactImpulse_get_count_0 = function() {
  return b.asm._emscripten_bind_b2ContactImpulse_get_count_0.apply(null, arguments);
}, Zm = b._emscripten_bind_b2World_GetJointCount_0 = function() {
  return b.asm._emscripten_bind_b2World_GetJointCount_0.apply(null, arguments);
}, $m = b._emscripten_bind_b2WheelJoint_GetMotorSpeed_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetMotorSpeed_0.apply(null, arguments);
}, an = b._emscripten_bind_b2WheelJointDef_get_dampingRatio_0 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_get_dampingRatio_0.apply(null, arguments);
}, bn = b._emscripten_bind_b2RayCastOutput_get_fraction_0 = function() {
  return b.asm._emscripten_bind_b2RayCastOutput_get_fraction_0.apply(null, arguments);
}, cn = b._emscripten_bind_b2AABB___destroy___0 = function() {
  return b.asm._emscripten_bind_b2AABB___destroy___0.apply(null, arguments);
}, dn = b._emscripten_bind_b2GearJoint_SetRatio_1 = function() {
  return b.asm._emscripten_bind_b2GearJoint_SetRatio_1.apply(null, arguments);
}, en = b._emscripten_bind_JSDraw_DrawPolygon_3 = function() {
  return b.asm._emscripten_bind_JSDraw_DrawPolygon_3.apply(null, arguments);
}, fn = b._emscripten_bind_b2Filter___destroy___0 = function() {
  return b.asm._emscripten_bind_b2Filter___destroy___0.apply(null, arguments);
}, gn = b._emscripten_bind_b2RopeJointDef_get_userData_0 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_get_userData_0.apply(null, arguments);
};
b.___cxa_is_pointer_type = function() {
  return b.asm.___cxa_is_pointer_type.apply(null, arguments);
};
var hn = b._emscripten_bind_b2BodyDef_get_fixedRotation_0 = function() {
  return b.asm._emscripten_bind_b2BodyDef_get_fixedRotation_0.apply(null, arguments);
}, jn = b._emscripten_bind_b2PrismaticJointDef_set_motorSpeed_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_set_motorSpeed_1.apply(null, arguments);
}, kn = b._emscripten_bind_b2ChainShape_SetPrevVertex_1 = function() {
  return b.asm._emscripten_bind_b2ChainShape_SetPrevVertex_1.apply(null, arguments);
}, ln = b._emscripten_bind_b2Filter_get_categoryBits_0 = function() {
  return b.asm._emscripten_bind_b2Filter_get_categoryBits_0.apply(null, arguments);
}, mn = b._emscripten_bind_b2MouseJoint_GetReactionTorque_1 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_GetReactionTorque_1.apply(null, arguments);
}, nn = b._emscripten_bind_b2MouseJoint_GetUserData_0 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_GetUserData_0.apply(null, arguments);
}, on = b._emscripten_bind_b2WheelJoint_GetUserData_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetUserData_0.apply(null, arguments);
}, pn = b._emscripten_bind_b2Vec3_op_sub_1 = function() {
  return b.asm._emscripten_bind_b2Vec3_op_sub_1.apply(null, arguments);
}, qn = b._emscripten_bind_b2WheelJoint_GetNext_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetNext_0.apply(null, arguments);
}, rn = b._emscripten_bind_b2Shape_GetType_0 = function() {
  return b.asm._emscripten_bind_b2Shape_GetType_0.apply(null, arguments);
}, sn = b._emscripten_bind_b2AABB_IsValid_0 = function() {
  return b.asm._emscripten_bind_b2AABB_IsValid_0.apply(null, arguments);
}, tn = b._emscripten_bind_b2WheelJoint_GetBodyA_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetBodyA_0.apply(null, arguments);
}, un = b._emscripten_enum_b2ShapeType_e_chain = function() {
  return b.asm._emscripten_enum_b2ShapeType_e_chain.apply(null, arguments);
}, vn = b._emscripten_bind_b2PulleyJoint_GetLengthA_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_GetLengthA_0.apply(null, arguments);
}, wn = b._emscripten_bind_b2DistanceJointDef_get_frequencyHz_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_get_frequencyHz_0.apply(null, arguments);
}, xn = b._emscripten_bind_b2RevoluteJoint_SetMotorSpeed_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_SetMotorSpeed_1.apply(null, arguments);
}, yn = b._emscripten_bind_b2World___destroy___0 = function() {
  return b.asm._emscripten_bind_b2World___destroy___0.apply(null, arguments);
}, zn = b._emscripten_bind_b2ChainShape_get_m_hasNextVertex_0 = function() {
  return b.asm._emscripten_bind_b2ChainShape_get_m_hasNextVertex_0.apply(null, arguments);
}, An = b._emscripten_bind_b2ChainShape_SetNextVertex_1 = function() {
  return b.asm._emscripten_bind_b2ChainShape_SetNextVertex_1.apply(null, arguments);
}, Bn = b._emscripten_bind_b2Body_SetType_1 = function() {
  return b.asm._emscripten_bind_b2Body_SetType_1.apply(null, arguments);
}, Cn = b._emscripten_bind_b2Body_GetMass_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetMass_0.apply(null, arguments);
}, Dn = b._emscripten_bind_b2Rot_b2Rot_0 = function() {
  return b.asm._emscripten_bind_b2Rot_b2Rot_0.apply(null, arguments);
}, En = b._emscripten_bind_b2Rot_b2Rot_1 = function() {
  return b.asm._emscripten_bind_b2Rot_b2Rot_1.apply(null, arguments);
}, Fn = b._emscripten_enum_b2JointType_e_distanceJoint = function() {
  return b.asm._emscripten_enum_b2JointType_e_distanceJoint.apply(null, arguments);
}, Gn = b._emscripten_bind_b2WheelJoint_SetSpringDampingRatio_1 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_SetSpringDampingRatio_1.apply(null, arguments);
}, Hn = b._emscripten_bind_b2MouseJoint_GetType_0 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_GetType_0.apply(null, arguments);
}, In = b._emscripten_bind_b2MouseJoint_GetTarget_0 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_GetTarget_0.apply(null, arguments);
}, Jn = b._emscripten_bind_JSQueryCallback___destroy___0 = function() {
  return b.asm._emscripten_bind_JSQueryCallback___destroy___0.apply(null, arguments);
}, Kn = b._emscripten_bind_b2Fixture_Refilter_0 = function() {
  return b.asm._emscripten_bind_b2Fixture_Refilter_0.apply(null, arguments);
}, Ln = b._emscripten_bind_b2RevoluteJointDef_set_lowerAngle_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_set_lowerAngle_1.apply(null, arguments);
}, Mn = b._emscripten_bind_b2JointEdge___destroy___0 = function() {
  return b.asm._emscripten_bind_b2JointEdge___destroy___0.apply(null, arguments);
}, Nn = b._emscripten_bind_b2PulleyJoint_GetRatio_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_GetRatio_0.apply(null, arguments);
}, On = b._emscripten_bind_JSContactListener_BeginContact_1 = function() {
  return b.asm._emscripten_bind_JSContactListener_BeginContact_1.apply(null, arguments);
}, Pn = b._emscripten_bind_b2EdgeShape_get_m_vertex2_0 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_get_m_vertex2_0.apply(null, arguments);
}, Qn = b._emscripten_bind_b2JointEdge_get_next_0 = function() {
  return b.asm._emscripten_bind_b2JointEdge_get_next_0.apply(null, arguments);
}, Rn = b._emscripten_bind_b2RayCastInput_set_maxFraction_1 = function() {
  return b.asm._emscripten_bind_b2RayCastInput_set_maxFraction_1.apply(null, arguments);
}, Sn = b._emscripten_bind_b2MouseJoint_GetBodyA_0 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_GetBodyA_0.apply(null, arguments);
}, Tn = b._emscripten_bind_b2BodyDef_get_awake_0 = function() {
  return b.asm._emscripten_bind_b2BodyDef_get_awake_0.apply(null, arguments);
}, Un = b._emscripten_bind_b2AABB_b2AABB_0 = function() {
  return b.asm._emscripten_bind_b2AABB_b2AABB_0.apply(null, arguments);
}, Vn = b._emscripten_bind_b2Fixture_SetFriction_1 = function() {
  return b.asm._emscripten_bind_b2Fixture_SetFriction_1.apply(null, arguments);
}, Wn = b._emscripten_bind_b2WeldJointDef_get_referenceAngle_0 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_get_referenceAngle_0.apply(null, arguments);
}, Xn = b._emscripten_bind_b2RopeJointDef_set_userData_1 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_set_userData_1.apply(null, arguments);
}, Yn = b._emscripten_bind_b2WeldJoint_GetNext_0 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_GetNext_0.apply(null, arguments);
}, Zn = b._emscripten_bind_b2WeldJoint_GetType_0 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_GetType_0.apply(null, arguments);
}, $n = b._emscripten_enum_b2ContactFeatureType_e_vertex = function() {
  return b.asm._emscripten_enum_b2ContactFeatureType_e_vertex.apply(null, arguments);
}, ao = b._emscripten_bind_b2Rot___destroy___0 = function() {
  return b.asm._emscripten_bind_b2Rot___destroy___0.apply(null, arguments);
}, bo = b._emscripten_bind_b2Filter_get_maskBits_0 = function() {
  return b.asm._emscripten_bind_b2Filter_get_maskBits_0.apply(null, arguments);
}, co = b._emscripten_bind_b2Body_GetFixtureList_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetFixtureList_0.apply(null, arguments);
}, eo = b._emscripten_bind_b2PulleyJoint___destroy___0 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint___destroy___0.apply(null, arguments);
}, fo = b._emscripten_bind_b2MouseJointDef_set_dampingRatio_1 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_set_dampingRatio_1.apply(null, arguments);
}, go = b._emscripten_bind_JSRayCastCallback___destroy___0 = function() {
  return b.asm._emscripten_bind_JSRayCastCallback___destroy___0.apply(null, arguments);
}, ho = b._emscripten_bind_b2ContactListener___destroy___0 = function() {
  return b.asm._emscripten_bind_b2ContactListener___destroy___0.apply(null, arguments);
}, io = b._emscripten_bind_b2PrismaticJointDef_set_localAnchorB_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_set_localAnchorB_1.apply(null, arguments);
};
b.establishStackSpace = function() {
  return b.asm.establishStackSpace.apply(null, arguments);
};
var jo = b._emscripten_bind_b2FrictionJoint___destroy___0 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint___destroy___0.apply(null, arguments);
}, ko = b._emscripten_bind_b2WeldJoint_Dump_0 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_Dump_0.apply(null, arguments);
}, lo = b._emscripten_enum_b2LimitState_e_atLowerLimit = function() {
  return b.asm._emscripten_enum_b2LimitState_e_atLowerLimit.apply(null, arguments);
}, mo = b._emscripten_bind_b2FrictionJoint_GetLocalAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_GetLocalAnchorA_0.apply(null, arguments);
}, no = b._emscripten_bind_b2JointEdge_get_other_0 = function() {
  return b.asm._emscripten_bind_b2JointEdge_get_other_0.apply(null, arguments);
}, oo = b._emscripten_bind_b2GearJointDef_set_collideConnected_1 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_set_collideConnected_1.apply(null, arguments);
}, po = b._emscripten_bind_b2RayCastOutput_set_fraction_1 = function() {
  return b.asm._emscripten_bind_b2RayCastOutput_set_fraction_1.apply(null, arguments);
}, qo = b._emscripten_bind_b2PrismaticJointDef_set_bodyA_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_set_bodyA_1.apply(null, arguments);
}, ro = b._emscripten_bind_b2World_GetWarmStarting_0 = function() {
  return b.asm._emscripten_bind_b2World_GetWarmStarting_0.apply(null, arguments);
}, so = b._emscripten_bind_b2RevoluteJointDef_set_enableLimit_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_set_enableLimit_1.apply(null, arguments);
}, to = b._emscripten_bind_b2WeldJointDef___destroy___0 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef___destroy___0.apply(null, arguments);
}, uo = b._emscripten_bind_b2Mat22_Solve_1 = function() {
  return b.asm._emscripten_bind_b2Mat22_Solve_1.apply(null, arguments);
}, vo = b._emscripten_bind_b2Color_get_g_0 = function() {
  return b.asm._emscripten_bind_b2Color_get_g_0.apply(null, arguments);
}, wo = b._emscripten_bind_VoidPtr___destroy___0 = function() {
  return b.asm._emscripten_bind_VoidPtr___destroy___0.apply(null, arguments);
}, xo = b._emscripten_bind_b2RopeJoint_GetNext_0 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_GetNext_0.apply(null, arguments);
}, yo = b._emscripten_bind_b2EdgeShape_get_m_type_0 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_get_m_type_0.apply(null, arguments);
}, zo = b._emscripten_bind_b2PolygonShape_GetChildCount_0 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_GetChildCount_0.apply(null, arguments);
}, Ao = b._emscripten_bind_b2GearJointDef_get_ratio_0 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_get_ratio_0.apply(null, arguments);
}, Bo = b._emscripten_bind_b2Mat33_Solve33_1 = function() {
  return b.asm._emscripten_bind_b2Mat33_Solve33_1.apply(null, arguments);
}, Co = b._emscripten_bind_b2WeldJointDef_set_userData_1 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_set_userData_1.apply(null, arguments);
}, Do = b._emscripten_bind_b2PrismaticJoint_GetLocalAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetLocalAnchorB_0.apply(null, arguments);
}, Eo = b._emscripten_bind_b2RevoluteJointDef___destroy___0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef___destroy___0.apply(null, arguments);
}, Fo = b._emscripten_bind_b2MouseJointDef_get_maxForce_0 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_get_maxForce_0.apply(null, arguments);
}, Go = b._emscripten_bind_b2ContactFeature_get_typeB_0 = function() {
  return b.asm._emscripten_bind_b2ContactFeature_get_typeB_0.apply(null, arguments);
}, Ho = b._emscripten_bind_b2ContactID_get_key_0 = function() {
  return b.asm._emscripten_bind_b2ContactID_get_key_0.apply(null, arguments);
}, Io = b._emscripten_bind_b2Rot_GetAngle_0 = function() {
  return b.asm._emscripten_bind_b2Rot_GetAngle_0.apply(null, arguments);
}, Jo = b._emscripten_bind_b2World_SetAllowSleeping_1 = function() {
  return b.asm._emscripten_bind_b2World_SetAllowSleeping_1.apply(null, arguments);
}, Ko = b._emscripten_bind_b2RopeJoint_GetType_0 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_GetType_0.apply(null, arguments);
}, Lo = b._emscripten_enum_b2DrawFlag_e_centerOfMassBit = function() {
  return b.asm._emscripten_enum_b2DrawFlag_e_centerOfMassBit.apply(null, arguments);
}, Mo = b._emscripten_bind_b2ManifoldPoint_set_id_1 = function() {
  return b.asm._emscripten_bind_b2ManifoldPoint_set_id_1.apply(null, arguments);
}, No = b._emscripten_bind_b2FrictionJoint_GetCollideConnected_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_GetCollideConnected_0.apply(null, arguments);
}, Oo = b._emscripten_bind_b2WheelJointDef_set_motorSpeed_1 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_set_motorSpeed_1.apply(null, arguments);
}, Po = b._emscripten_bind_b2Mat22_get_ex_0 = function() {
  return b.asm._emscripten_bind_b2Mat22_get_ex_0.apply(null, arguments);
}, Qo = b._emscripten_bind_b2Fixture_GetDensity_0 = function() {
  return b.asm._emscripten_bind_b2Fixture_GetDensity_0.apply(null, arguments);
}, Ro = b._emscripten_bind_b2MouseJointDef_get_type_0 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_get_type_0.apply(null, arguments);
}, So = b._emscripten_bind_b2Vec2_Set_2 = function() {
  return b.asm._emscripten_bind_b2Vec2_Set_2.apply(null, arguments);
}, To = b._emscripten_bind_b2WeldJointDef_get_type_0 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_get_type_0.apply(null, arguments);
}, Uo = b._emscripten_bind_b2MouseJointDef_b2MouseJointDef_0 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_b2MouseJointDef_0.apply(null, arguments);
}, Vo = b._emscripten_bind_b2Rot_get_s_0 = function() {
  return b.asm._emscripten_bind_b2Rot_get_s_0.apply(null, arguments);
}, Wo = b._emscripten_bind_b2FrictionJoint_SetMaxTorque_1 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_SetMaxTorque_1.apply(null, arguments);
}, Xo = b._emscripten_bind_b2MouseJointDef_get_frequencyHz_0 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_get_frequencyHz_0.apply(null, arguments);
}, Yo = b._emscripten_bind_b2FrictionJoint_SetUserData_1 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_SetUserData_1.apply(null, arguments);
}, Zo = b._emscripten_bind_b2RayCastInput_get_p1_0 = function() {
  return b.asm._emscripten_bind_b2RayCastInput_get_p1_0.apply(null, arguments);
}, $o = b._emscripten_bind_b2DistanceJointDef_get_collideConnected_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_get_collideConnected_0.apply(null, arguments);
}, ap = b._emscripten_bind_b2RevoluteJointDef_set_referenceAngle_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_set_referenceAngle_1.apply(null, arguments);
}, bp = b._emscripten_bind_b2ContactFeature___destroy___0 = function() {
  return b.asm._emscripten_bind_b2ContactFeature___destroy___0.apply(null, arguments);
}, cp = b._emscripten_bind_b2Color___destroy___0 = function() {
  return b.asm._emscripten_bind_b2Color___destroy___0.apply(null, arguments);
}, dp = b._emscripten_bind_b2DistanceJointDef_set_bodyB_1 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_set_bodyB_1.apply(null, arguments);
}, ep = b._emscripten_bind_b2PulleyJointDef_b2PulleyJointDef_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_b2PulleyJointDef_0.apply(null, arguments);
}, fp = b._emscripten_bind_b2RevoluteJoint_GetType_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetType_0.apply(null, arguments);
}, gp = b._emscripten_bind_b2MassData_b2MassData_0 = function() {
  return b.asm._emscripten_bind_b2MassData_b2MassData_0.apply(null, arguments);
}, hp = b._emscripten_bind_b2Vec3_set_y_1 = function() {
  return b.asm._emscripten_bind_b2Vec3_set_y_1.apply(null, arguments);
}, ip = b._emscripten_bind_b2BodyDef_set_angularDamping_1 = function() {
  return b.asm._emscripten_bind_b2BodyDef_set_angularDamping_1.apply(null, arguments);
}, jp = b._emscripten_bind_b2AABB_Combine_1 = function() {
  return b.asm._emscripten_bind_b2AABB_Combine_1.apply(null, arguments);
}, kp = b._emscripten_bind_b2WheelJointDef_set_bodyB_1 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_set_bodyB_1.apply(null, arguments);
}, lp = b._emscripten_bind_b2PrismaticJoint_GetBodyA_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetBodyA_0.apply(null, arguments);
}, mp = b._emscripten_bind_b2PrismaticJoint_GetMaxMotorForce_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetMaxMotorForce_0.apply(null, arguments);
}, np = b._emscripten_bind_b2RevoluteJointDef_get_upperAngle_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_get_upperAngle_0.apply(null, arguments);
}, op = b._emscripten_bind_b2Body_IsSleepingAllowed_0 = function() {
  return b.asm._emscripten_bind_b2Body_IsSleepingAllowed_0.apply(null, arguments);
}, pp = b._emscripten_bind_b2Profile_get_solve_0 = function() {
  return b.asm._emscripten_bind_b2Profile_get_solve_0.apply(null, arguments);
}, qp = b._emscripten_bind_JSDestructionListener_SayGoodbyeFixture_1 = function() {
  return b.asm._emscripten_bind_JSDestructionListener_SayGoodbyeFixture_1.apply(null, arguments);
}, rp = b._emscripten_bind_b2PolygonShape_GetVertexCount_0 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_GetVertexCount_0.apply(null, arguments);
}, sp = b._emscripten_bind_b2Rot_get_c_0 = function() {
  return b.asm._emscripten_bind_b2Rot_get_c_0.apply(null, arguments);
}, tp = b._emscripten_bind_b2Vec2_IsValid_0 = function() {
  return b.asm._emscripten_bind_b2Vec2_IsValid_0.apply(null, arguments);
}, up = b._emscripten_bind_b2AABB_set_lowerBound_1 = function() {
  return b.asm._emscripten_bind_b2AABB_set_lowerBound_1.apply(null, arguments);
}, vp = b._emscripten_bind_b2Body_ApplyTorque_1 = function() {
  return b.asm._emscripten_bind_b2Body_ApplyTorque_1.apply(null, arguments);
}, wp = b._emscripten_bind_b2MouseJoint_SetMaxForce_1 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_SetMaxForce_1.apply(null, arguments);
}, xp = b._emscripten_bind_b2WheelJoint_IsMotorEnabled_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_IsMotorEnabled_0.apply(null, arguments);
}, yp = b._emscripten_bind_b2JointDef_set_userData_1 = function() {
  return b.asm._emscripten_bind_b2JointDef_set_userData_1.apply(null, arguments);
}, zp = b._emscripten_bind_b2ManifoldPoint_get_tangentImpulse_0 = function() {
  return b.asm._emscripten_bind_b2ManifoldPoint_get_tangentImpulse_0.apply(null, arguments);
}, Ap = b._emscripten_bind_b2RevoluteJointDef_get_maxMotorTorque_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_get_maxMotorTorque_0.apply(null, arguments);
}, Bp = b._emscripten_bind_b2WeldJointDef_get_dampingRatio_0 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_get_dampingRatio_0.apply(null, arguments);
}, Cp = b._emscripten_bind_b2Rot_SetIdentity_0 = function() {
  return b.asm._emscripten_bind_b2Rot_SetIdentity_0.apply(null, arguments);
}, Dp = b._emscripten_bind_b2EdgeShape_b2EdgeShape_0 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_b2EdgeShape_0.apply(null, arguments);
}, Ep = b._emscripten_bind_b2FrictionJoint_GetReactionForce_1 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_GetReactionForce_1.apply(null, arguments);
}, Fp = b._emscripten_bind_b2DistanceJointDef_set_type_1 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_set_type_1.apply(null, arguments);
}, Gp = b._emscripten_bind_b2WeldJoint_GetAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_GetAnchorA_0.apply(null, arguments);
}, Hp = b._emscripten_bind_b2WeldJoint___destroy___0 = function() {
  return b.asm._emscripten_bind_b2WeldJoint___destroy___0.apply(null, arguments);
}, Ip = b._emscripten_bind_b2Manifold_b2Manifold_0 = function() {
  return b.asm._emscripten_bind_b2Manifold_b2Manifold_0.apply(null, arguments);
}, Jp = b._emscripten_bind_JSContactListener_PostSolve_2 = function() {
  return b.asm._emscripten_bind_JSContactListener_PostSolve_2.apply(null, arguments);
}, Kp = b._emscripten_bind_b2PulleyJoint_GetBodyA_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_GetBodyA_0.apply(null, arguments);
}, Lp = b._emscripten_bind_b2RopeJointDef_get_type_0 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_get_type_0.apply(null, arguments);
}, Mp = b._emscripten_bind_b2CircleShape_ComputeMass_2 = function() {
  return b.asm._emscripten_bind_b2CircleShape_ComputeMass_2.apply(null, arguments);
}, Np = b._emscripten_bind_b2PrismaticJointDef_get_referenceAngle_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_get_referenceAngle_0.apply(null, arguments);
}, Op = b._emscripten_bind_b2GearJointDef___destroy___0 = function() {
  return b.asm._emscripten_bind_b2GearJointDef___destroy___0.apply(null, arguments);
}, Pp = b._emscripten_bind_b2PulleyJointDef_set_localAnchorA_1 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_set_localAnchorA_1.apply(null, arguments);
}, Qp = b._emscripten_bind_b2CircleShape_TestPoint_2 = function() {
  return b.asm._emscripten_bind_b2CircleShape_TestPoint_2.apply(null, arguments);
}, Rp = b._emscripten_bind_b2Body_GetLinearVelocityFromLocalPoint_1 = function() {
  return b.asm._emscripten_bind_b2Body_GetLinearVelocityFromLocalPoint_1.apply(null, arguments);
}, Sp = b._emscripten_bind_b2FrictionJointDef_set_bodyB_1 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_set_bodyB_1.apply(null, arguments);
}, Tp = b._emscripten_bind_b2MouseJoint_GetAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_GetAnchorB_0.apply(null, arguments);
}, Up = b._emscripten_bind_b2Manifold_get_localPoint_0 = function() {
  return b.asm._emscripten_bind_b2Manifold_get_localPoint_0.apply(null, arguments);
}, Vp = b._emscripten_bind_b2GearJoint_GetBodyB_0 = function() {
  return b.asm._emscripten_bind_b2GearJoint_GetBodyB_0.apply(null, arguments);
}, Wp = b._emscripten_bind_b2WeldJoint_GetLocalAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_GetLocalAnchorB_0.apply(null, arguments);
}, Xp = b._emscripten_bind_b2CircleShape___destroy___0 = function() {
  return b.asm._emscripten_bind_b2CircleShape___destroy___0.apply(null, arguments);
}, Yp = b._emscripten_bind_b2EdgeShape___destroy___0 = function() {
  return b.asm._emscripten_bind_b2EdgeShape___destroy___0.apply(null, arguments);
}, Zp = b._emscripten_bind_b2World_GetContactCount_0 = function() {
  return b.asm._emscripten_bind_b2World_GetContactCount_0.apply(null, arguments);
}, $p = b._emscripten_bind_b2Contact_SetRestitution_1 = function() {
  return b.asm._emscripten_bind_b2Contact_SetRestitution_1.apply(null, arguments);
}, aq = b._emscripten_bind_b2BodyDef_get_angularDamping_0 = function() {
  return b.asm._emscripten_bind_b2BodyDef_get_angularDamping_0.apply(null, arguments);
}, bq = b._emscripten_bind_b2EdgeShape_get_m_vertex3_0 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_get_m_vertex3_0.apply(null, arguments);
}, cq = b._emscripten_bind_b2MassData_set_center_1 = function() {
  return b.asm._emscripten_bind_b2MassData_set_center_1.apply(null, arguments);
}, dq = b._emscripten_bind_b2Transform_SetIdentity_0 = function() {
  return b.asm._emscripten_bind_b2Transform_SetIdentity_0.apply(null, arguments);
}, eq = b._emscripten_bind_b2GearJointDef_set_joint1_1 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_set_joint1_1.apply(null, arguments);
}, fq = b._emscripten_bind_b2EdgeShape_set_m_vertex2_1 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_set_m_vertex2_1.apply(null, arguments);
}, gq = b._emscripten_bind_b2Contact_SetFriction_1 = function() {
  return b.asm._emscripten_bind_b2Contact_SetFriction_1.apply(null, arguments);
}, hq = b._emscripten_bind_b2MouseJointDef_set_collideConnected_1 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_set_collideConnected_1.apply(null, arguments);
}, iq = b._emscripten_bind_b2ContactFeature_set_indexB_1 = function() {
  return b.asm._emscripten_bind_b2ContactFeature_set_indexB_1.apply(null, arguments);
}, jq = b._emscripten_bind_b2Body_GetLinearVelocityFromWorldPoint_1 = function() {
  return b.asm._emscripten_bind_b2Body_GetLinearVelocityFromWorldPoint_1.apply(null, arguments);
}, kq = b._emscripten_bind_b2WeldJoint_GetCollideConnected_0 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_GetCollideConnected_0.apply(null, arguments);
}, lq = b._emscripten_bind_b2WeldJointDef_get_bodyA_0 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_get_bodyA_0.apply(null, arguments);
}, mq = b._emscripten_bind_b2Mat22_GetInverse_0 = function() {
  return b.asm._emscripten_bind_b2Mat22_GetInverse_0.apply(null, arguments);
}, nq = b._emscripten_bind_b2WheelJointDef_set_frequencyHz_1 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_set_frequencyHz_1.apply(null, arguments);
}, oq = b._emscripten_bind_b2World_GetSubStepping_0 = function() {
  return b.asm._emscripten_bind_b2World_GetSubStepping_0.apply(null, arguments);
}, pq = b._emscripten_bind_b2Rot_GetYAxis_0 = function() {
  return b.asm._emscripten_bind_b2Rot_GetYAxis_0.apply(null, arguments);
}, qq = b._emscripten_bind_b2PrismaticJoint_EnableMotor_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_EnableMotor_1.apply(null, arguments);
}, rq = b._emscripten_bind_b2WheelJointDef_get_localAxisA_0 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_get_localAxisA_0.apply(null, arguments);
}, sq = b._emscripten_bind_b2RopeJoint_GetBodyB_0 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_GetBodyB_0.apply(null, arguments);
}, tq = b._emscripten_bind_b2EdgeShape_GetType_0 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_GetType_0.apply(null, arguments);
}, uq = b._emscripten_bind_b2Mat22_set_ex_1 = function() {
  return b.asm._emscripten_bind_b2Mat22_set_ex_1.apply(null, arguments);
}, vq = b._emscripten_bind_b2ManifoldPoint___destroy___0 = function() {
  return b.asm._emscripten_bind_b2ManifoldPoint___destroy___0.apply(null, arguments);
}, wq = b._emscripten_enum_b2JointType_e_prismaticJoint = function() {
  return b.asm._emscripten_enum_b2JointType_e_prismaticJoint.apply(null, arguments);
}, xq = b._emscripten_bind_b2World_CreateBody_1 = function() {
  return b.asm._emscripten_bind_b2World_CreateBody_1.apply(null, arguments);
}, yq = b._emscripten_bind_b2Vec2_Length_0 = function() {
  return b.asm._emscripten_bind_b2Vec2_Length_0.apply(null, arguments);
}, zq = b._emscripten_bind_b2Vec2_SetZero_0 = function() {
  return b.asm._emscripten_bind_b2Vec2_SetZero_0.apply(null, arguments);
}, Aq = b._emscripten_bind_b2RopeJoint___destroy___0 = function() {
  return b.asm._emscripten_bind_b2RopeJoint___destroy___0.apply(null, arguments);
}, Bq = b._emscripten_bind_b2World_DestroyJoint_1 = function() {
  return b.asm._emscripten_bind_b2World_DestroyJoint_1.apply(null, arguments);
}, Cq = b._emscripten_bind_b2JointDef_set_bodyB_1 = function() {
  return b.asm._emscripten_bind_b2JointDef_set_bodyB_1.apply(null, arguments);
}, Dq = b._emscripten_bind_b2Mat22_Set_2 = function() {
  return b.asm._emscripten_bind_b2Mat22_Set_2.apply(null, arguments);
}, Eq = b._emscripten_bind_b2JointEdge_set_next_1 = function() {
  return b.asm._emscripten_bind_b2JointEdge_set_next_1.apply(null, arguments);
}, Fq = b._emscripten_bind_b2WeldJoint_GetAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_GetAnchorB_0.apply(null, arguments);
}, Gq = b._emscripten_enum_b2DrawFlag_e_aabbBit = function() {
  return b.asm._emscripten_enum_b2DrawFlag_e_aabbBit.apply(null, arguments);
}, Hq = b._emscripten_bind_b2EdgeShape_ComputeAABB_3 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_ComputeAABB_3.apply(null, arguments);
}, Iq = b._emscripten_bind_b2PolygonShape_set_m_centroid_1 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_set_m_centroid_1.apply(null, arguments);
}, Jq = b._emscripten_bind_b2WheelJointDef_set_collideConnected_1 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_set_collideConnected_1.apply(null, arguments);
}, Kq = b._emscripten_bind_b2World_GetJointList_0 = function() {
  return b.asm._emscripten_bind_b2World_GetJointList_0.apply(null, arguments);
}, Lq = b._emscripten_bind_b2RopeJoint_GetLocalAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_GetLocalAnchorA_0.apply(null, arguments);
}, Mq = b._emscripten_bind_b2BodyDef_set_linearDamping_1 = function() {
  return b.asm._emscripten_bind_b2BodyDef_set_linearDamping_1.apply(null, arguments);
}, Nq = b._emscripten_bind_b2FrictionJoint_GetUserData_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_GetUserData_0.apply(null, arguments);
}, Oq = b._emscripten_bind_b2Shape_TestPoint_2 = function() {
  return b.asm._emscripten_bind_b2Shape_TestPoint_2.apply(null, arguments);
}, Pq = b._emscripten_bind_b2Manifold_set_localNormal_1 = function() {
  return b.asm._emscripten_bind_b2Manifold_set_localNormal_1.apply(null, arguments);
}, Qq = b._emscripten_bind_b2JointDef_get_bodyA_0 = function() {
  return b.asm._emscripten_bind_b2JointDef_get_bodyA_0.apply(null, arguments);
}, Rq = b._emscripten_bind_b2Body_GetLinearDamping_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetLinearDamping_0.apply(null, arguments);
}, Sq = b._emscripten_bind_b2WeldJointDef_set_frequencyHz_1 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_set_frequencyHz_1.apply(null, arguments);
}, Tq = b._emscripten_bind_b2Body_ResetMassData_0 = function() {
  return b.asm._emscripten_bind_b2Body_ResetMassData_0.apply(null, arguments);
}, Uq = b._emscripten_bind_b2PrismaticJointDef_set_enableMotor_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_set_enableMotor_1.apply(null, arguments);
}, Vq = b._emscripten_bind_b2Vec2_Skew_0 = function() {
  return b.asm._emscripten_bind_b2Vec2_Skew_0.apply(null, arguments);
}, Wq = b._emscripten_bind_b2MouseJoint_GetDampingRatio_0 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_GetDampingRatio_0.apply(null, arguments);
}, Xq = b._emscripten_bind_b2RevoluteJoint_GetAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetAnchorA_0.apply(null, arguments);
}, Yq = b._emscripten_bind_b2ChainShape_set_m_prevVertex_1 = function() {
  return b.asm._emscripten_bind_b2ChainShape_set_m_prevVertex_1.apply(null, arguments);
}, Zq = b._emscripten_bind_b2ManifoldPoint_get_localPoint_0 = function() {
  return b.asm._emscripten_bind_b2ManifoldPoint_get_localPoint_0.apply(null, arguments);
}, $q = b._emscripten_bind_b2ChainShape_get_m_hasPrevVertex_0 = function() {
  return b.asm._emscripten_bind_b2ChainShape_get_m_hasPrevVertex_0.apply(null, arguments);
};
b.setThrew = function() {
  return b.asm.setThrew.apply(null, arguments);
};
var ar = b._emscripten_bind_b2PrismaticJointDef_set_userData_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_set_userData_1.apply(null, arguments);
}, br = b._emscripten_bind_b2FrictionJointDef_set_type_1 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_set_type_1.apply(null, arguments);
}, cr = b._emscripten_bind_b2FrictionJointDef_Initialize_3 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_Initialize_3.apply(null, arguments);
}, Tb = b._sbrk = function() {
  return b.asm._sbrk.apply(null, arguments);
}, dr = b._emscripten_bind_b2FrictionJointDef_get_collideConnected_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_get_collideConnected_0.apply(null, arguments);
}, Ob = b._memcpy = function() {
  return b.asm._memcpy.apply(null, arguments);
}, er = b._emscripten_bind_b2FrictionJoint_GetAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_GetAnchorA_0.apply(null, arguments);
}, fr = b._emscripten_enum_b2DrawFlag_e_pairBit = function() {
  return b.asm._emscripten_enum_b2DrawFlag_e_pairBit.apply(null, arguments);
}, gr = b._emscripten_bind_b2MassData_get_I_0 = function() {
  return b.asm._emscripten_bind_b2MassData_get_I_0.apply(null, arguments);
}, hr = b._emscripten_bind_b2WheelJointDef_get_motorSpeed_0 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_get_motorSpeed_0.apply(null, arguments);
}, ir = b._emscripten_bind_b2Filter_set_maskBits_1 = function() {
  return b.asm._emscripten_bind_b2Filter_set_maskBits_1.apply(null, arguments);
}, jr = b._emscripten_bind_b2WheelJoint_GetCollideConnected_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetCollideConnected_0.apply(null, arguments);
}, kr = b._emscripten_bind_b2World_GetTreeHeight_0 = function() {
  return b.asm._emscripten_bind_b2World_GetTreeHeight_0.apply(null, arguments);
}, lr = b._emscripten_bind_b2Mat22_b2Mat22_2 = function() {
  return b.asm._emscripten_bind_b2Mat22_b2Mat22_2.apply(null, arguments);
}, mr = b._emscripten_bind_b2PrismaticJoint_GetNext_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetNext_0.apply(null, arguments);
}, nr = b._emscripten_bind_b2Mat22_b2Mat22_0 = function() {
  return b.asm._emscripten_bind_b2Mat22_b2Mat22_0.apply(null, arguments);
}, or = b._emscripten_bind_b2PrismaticJointDef_get_bodyA_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_get_bodyA_0.apply(null, arguments);
}, pr = b._emscripten_bind_b2RopeJointDef_set_localAnchorA_1 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_set_localAnchorA_1.apply(null, arguments);
}, qr = b._emscripten_bind_b2ChainShape_set_m_hasNextVertex_1 = function() {
  return b.asm._emscripten_bind_b2ChainShape_set_m_hasNextVertex_1.apply(null, arguments);
}, rr = b._emscripten_bind_b2Mat22_set_ey_1 = function() {
  return b.asm._emscripten_bind_b2Mat22_set_ey_1.apply(null, arguments);
};
b._emscripten_get_global_libc = function() {
  return b.asm._emscripten_get_global_libc.apply(null, arguments);
};
var sr = b._emscripten_bind_b2CircleShape_get_m_type_0 = function() {
  return b.asm._emscripten_bind_b2CircleShape_get_m_type_0.apply(null, arguments);
}, tr = b._emscripten_bind_b2Body_GetType_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetType_0.apply(null, arguments);
}, ur = b._emscripten_bind_b2ContactEdge_b2ContactEdge_0 = function() {
  return b.asm._emscripten_bind_b2ContactEdge_b2ContactEdge_0.apply(null, arguments);
}, vr = b._emscripten_bind_b2BodyDef___destroy___0 = function() {
  return b.asm._emscripten_bind_b2BodyDef___destroy___0.apply(null, arguments);
}, wr = b._emscripten_bind_b2FrictionJointDef_set_maxTorque_1 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_set_maxTorque_1.apply(null, arguments);
}, cb = b._free = function() {
  return b.asm._free.apply(null, arguments);
}, xr = b._emscripten_bind_b2PulleyJointDef_set_groundAnchorB_1 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_set_groundAnchorB_1.apply(null, arguments);
}, yr = b._emscripten_bind_b2RevoluteJointDef_get_collideConnected_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_get_collideConnected_0.apply(null, arguments);
}, zr = b._emscripten_bind_b2DistanceJointDef_set_bodyA_1 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_set_bodyA_1.apply(null, arguments);
};
b.runPostSets = function() {
  return b.asm.runPostSets.apply(null, arguments);
};
var Ar = b._emscripten_bind_b2RevoluteJoint_SetLimits_2 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_SetLimits_2.apply(null, arguments);
}, Br = b._emscripten_bind_b2WeldJointDef_set_type_1 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_set_type_1.apply(null, arguments);
}, Cr = b._emscripten_bind_b2FrictionJoint_GetNext_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_GetNext_0.apply(null, arguments);
}, Dr = b._emscripten_bind_b2Shape_set_m_type_1 = function() {
  return b.asm._emscripten_bind_b2Shape_set_m_type_1.apply(null, arguments);
}, Er = b._emscripten_bind_b2WheelJoint_GetJointTranslation_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetJointTranslation_0.apply(null, arguments);
}, Fr = b._emscripten_bind_b2WheelJoint_GetMotorTorque_1 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetMotorTorque_1.apply(null, arguments);
}, Gr = b._emscripten_bind_b2RopeJoint_SetUserData_1 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_SetUserData_1.apply(null, arguments);
}, Hr = b._emscripten_bind_b2WheelJoint_IsActive_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_IsActive_0.apply(null, arguments);
}, Ir = b._emscripten_bind_b2PrismaticJointDef_get_enableMotor_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_get_enableMotor_0.apply(null, arguments);
}, Jr = b._emscripten_bind_JSDestructionListener___destroy___0 = function() {
  return b.asm._emscripten_bind_JSDestructionListener___destroy___0.apply(null, arguments);
}, Kr = b._emscripten_bind_b2Transform_b2Transform_2 = function() {
  return b.asm._emscripten_bind_b2Transform_b2Transform_2.apply(null, arguments);
}, Lr = b._emscripten_bind_b2WeldJoint_GetReactionForce_1 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_GetReactionForce_1.apply(null, arguments);
}, Mr = b._emscripten_bind_b2ChainShape_RayCast_4 = function() {
  return b.asm._emscripten_bind_b2ChainShape_RayCast_4.apply(null, arguments);
}, Nr = b._emscripten_bind_b2Vec2_set_y_1 = function() {
  return b.asm._emscripten_bind_b2Vec2_set_y_1.apply(null, arguments);
}, Or = b._emscripten_bind_b2PrismaticJoint_SetMotorSpeed_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_SetMotorSpeed_1.apply(null, arguments);
}, Pr = b._emscripten_bind_b2ContactID_get_cf_0 = function() {
  return b.asm._emscripten_bind_b2ContactID_get_cf_0.apply(null, arguments);
}, Qr = b._emscripten_bind_b2MouseJointDef_set_frequencyHz_1 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_set_frequencyHz_1.apply(null, arguments);
}, Rr = b._emscripten_bind_b2ChainShape_get_m_radius_0 = function() {
  return b.asm._emscripten_bind_b2ChainShape_get_m_radius_0.apply(null, arguments);
}, Sr = b._emscripten_bind_b2WeldJointDef_set_localAnchorB_1 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_set_localAnchorB_1.apply(null, arguments);
}, Tr = b._emscripten_bind_b2ChainShape_set_m_radius_1 = function() {
  return b.asm._emscripten_bind_b2ChainShape_set_m_radius_1.apply(null, arguments);
}, Ur = b._emscripten_bind_b2DistanceJoint_GetReactionTorque_1 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_GetReactionTorque_1.apply(null, arguments);
}, Vr = b._emscripten_bind_b2World_Dump_0 = function() {
  return b.asm._emscripten_bind_b2World_Dump_0.apply(null, arguments);
}, Wr = b._emscripten_bind_b2RevoluteJoint_GetLocalAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetLocalAnchorB_0.apply(null, arguments);
}, Xr = b._emscripten_bind_JSContactFilter_JSContactFilter_0 = function() {
  return b.asm._emscripten_bind_JSContactFilter_JSContactFilter_0.apply(null, arguments);
}, Yr = b._emscripten_bind_b2Profile_set_solve_1 = function() {
  return b.asm._emscripten_bind_b2Profile_set_solve_1.apply(null, arguments);
}, Zr = b._emscripten_bind_b2FixtureDef_set_density_1 = function() {
  return b.asm._emscripten_bind_b2FixtureDef_set_density_1.apply(null, arguments);
}, $r = b._emscripten_bind_b2WeldJoint_GetDampingRatio_0 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_GetDampingRatio_0.apply(null, arguments);
}, as = b._emscripten_bind_b2Color_get_b_0 = function() {
  return b.asm._emscripten_bind_b2Color_get_b_0.apply(null, arguments);
}, bs = b._emscripten_bind_b2MouseJointDef_get_userData_0 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_get_userData_0.apply(null, arguments);
}, cs = b._emscripten_bind_b2CircleShape_ComputeAABB_3 = function() {
  return b.asm._emscripten_bind_b2CircleShape_ComputeAABB_3.apply(null, arguments);
}, ds = b._emscripten_bind_b2RopeJoint_GetReactionForce_1 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_GetReactionForce_1.apply(null, arguments);
}, es = b._emscripten_bind_b2PrismaticJointDef_get_enableLimit_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_get_enableLimit_0.apply(null, arguments);
}, gs = b._emscripten_bind_b2ManifoldPoint_set_localPoint_1 = function() {
  return b.asm._emscripten_bind_b2ManifoldPoint_set_localPoint_1.apply(null, arguments);
}, hs = b._emscripten_bind_b2Fixture_GetFilterData_0 = function() {
  return b.asm._emscripten_bind_b2Fixture_GetFilterData_0.apply(null, arguments);
}, is = b._emscripten_bind_b2World_GetBodyList_0 = function() {
  return b.asm._emscripten_bind_b2World_GetBodyList_0.apply(null, arguments);
}, js = b._emscripten_bind_b2Body_GetJointList_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetJointList_0.apply(null, arguments);
}, ks = b._emscripten_bind_b2Joint_GetNext_0 = function() {
  return b.asm._emscripten_bind_b2Joint_GetNext_0.apply(null, arguments);
}, ls = b._emscripten_bind_b2Joint_GetType_0 = function() {
  return b.asm._emscripten_bind_b2Joint_GetType_0.apply(null, arguments);
}, ms = b._emscripten_bind_b2World_RayCast_3 = function() {
  return b.asm._emscripten_bind_b2World_RayCast_3.apply(null, arguments);
}, ns = b._emscripten_bind_b2MassData_set_I_1 = function() {
  return b.asm._emscripten_bind_b2MassData_set_I_1.apply(null, arguments);
}, ps = b._emscripten_bind_b2MassData___destroy___0 = function() {
  return b.asm._emscripten_bind_b2MassData___destroy___0.apply(null, arguments);
}, qs = b._emscripten_bind_b2Profile_get_collide_0 = function() {
  return b.asm._emscripten_bind_b2Profile_get_collide_0.apply(null, arguments);
}, rs = b._emscripten_bind_b2Color_b2Color_3 = function() {
  return b.asm._emscripten_bind_b2Color_b2Color_3.apply(null, arguments);
}, ss = b._emscripten_bind_b2Color_b2Color_0 = function() {
  return b.asm._emscripten_bind_b2Color_b2Color_0.apply(null, arguments);
}, ts = b._emscripten_bind_b2WheelJointDef_get_frequencyHz_0 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_get_frequencyHz_0.apply(null, arguments);
}, us = b._emscripten_bind_b2WeldJointDef_Initialize_3 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_Initialize_3.apply(null, arguments);
}, vs = b._emscripten_bind_b2RevoluteJoint_GetMotorTorque_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetMotorTorque_1.apply(null, arguments);
}, xs = b._emscripten_enum_b2JointType_e_gearJoint = function() {
  return b.asm._emscripten_enum_b2JointType_e_gearJoint.apply(null, arguments);
}, ys = b._emscripten_bind_b2FixtureDef_get_friction_0 = function() {
  return b.asm._emscripten_bind_b2FixtureDef_get_friction_0.apply(null, arguments);
}, zs = b._emscripten_bind_b2PrismaticJointDef_set_localAnchorA_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_set_localAnchorA_1.apply(null, arguments);
}, As = b._emscripten_bind_b2Contact_GetManifold_0 = function() {
  return b.asm._emscripten_bind_b2Contact_GetManifold_0.apply(null, arguments);
}, Bs = b._emscripten_bind_b2QueryCallback___destroy___0 = function() {
  return b.asm._emscripten_bind_b2QueryCallback___destroy___0.apply(null, arguments);
}, Cs = b._emscripten_bind_b2WeldJointDef_get_localAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_get_localAnchorA_0.apply(null, arguments);
}, Ds = b._emscripten_bind_b2MouseJoint_SetUserData_1 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_SetUserData_1.apply(null, arguments);
}, Es = b._emscripten_bind_b2RevoluteJointDef_set_collideConnected_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_set_collideConnected_1.apply(null, arguments);
}, Fs = b._emscripten_bind_b2ChainShape_GetChildEdge_2 = function() {
  return b.asm._emscripten_bind_b2ChainShape_GetChildEdge_2.apply(null, arguments);
}, Gs = b._emscripten_enum_b2JointType_e_mouseJoint = function() {
  return b.asm._emscripten_enum_b2JointType_e_mouseJoint.apply(null, arguments);
}, Hs = b._emscripten_bind_b2WheelJoint_SetUserData_1 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_SetUserData_1.apply(null, arguments);
}, Is = b._emscripten_bind_b2ChainShape_set_m_count_1 = function() {
  return b.asm._emscripten_bind_b2ChainShape_set_m_count_1.apply(null, arguments);
}, Js = b._emscripten_bind_b2DistanceJoint_GetCollideConnected_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_GetCollideConnected_0.apply(null, arguments);
}, Ks = b._emscripten_bind_b2RevoluteJoint_IsMotorEnabled_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_IsMotorEnabled_0.apply(null, arguments);
}, Ls = b._emscripten_bind_b2PolygonShape_GetVertex_1 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_GetVertex_1.apply(null, arguments);
}, Ms = b._emscripten_bind_b2World_SetGravity_1 = function() {
  return b.asm._emscripten_bind_b2World_SetGravity_1.apply(null, arguments);
}, Ns = b._emscripten_bind_b2MouseJointDef_get_collideConnected_0 = function() {
  return b.asm._emscripten_bind_b2MouseJointDef_get_collideConnected_0.apply(null, arguments);
}, Wb = b._llvm_bswap_i32 = function() {
  return b.asm._llvm_bswap_i32.apply(null, arguments);
}, Os = b._emscripten_bind_b2Fixture_SetRestitution_1 = function() {
  return b.asm._emscripten_bind_b2Fixture_SetRestitution_1.apply(null, arguments);
}, Ps = b._emscripten_bind_b2Body_GetTransform_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetTransform_0.apply(null, arguments);
}, Qs = b._emscripten_enum_b2ShapeType_e_typeCount = function() {
  return b.asm._emscripten_enum_b2ShapeType_e_typeCount.apply(null, arguments);
}, Rs = b._emscripten_bind_b2Mat33_set_ex_1 = function() {
  return b.asm._emscripten_bind_b2Mat33_set_ex_1.apply(null, arguments);
}, Ss = b._emscripten_bind_b2PulleyJointDef_get_localAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_get_localAnchorB_0.apply(null, arguments);
}, Ts = b._emscripten_bind_b2RevoluteJointDef_get_bodyA_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_get_bodyA_0.apply(null, arguments);
}, Us = b._emscripten_bind_b2PrismaticJoint_GetBodyB_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetBodyB_0.apply(null, arguments);
}, Vs = b._emscripten_bind_b2DistanceJointDef_Initialize_4 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_Initialize_4.apply(null, arguments);
}, Ws = b._emscripten_bind_b2BodyDef_get_angle_0 = function() {
  return b.asm._emscripten_bind_b2BodyDef_get_angle_0.apply(null, arguments);
}, Xs = b._emscripten_bind_b2FixtureDef_get_shape_0 = function() {
  return b.asm._emscripten_bind_b2FixtureDef_get_shape_0.apply(null, arguments);
}, Ys = b._emscripten_bind_b2Body_SetAngularVelocity_1 = function() {
  return b.asm._emscripten_bind_b2Body_SetAngularVelocity_1.apply(null, arguments);
}, Zs = b._emscripten_bind_b2WeldJointDef_get_userData_0 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_get_userData_0.apply(null, arguments);
}, $s = b._emscripten_bind_b2FrictionJoint_SetMaxForce_1 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_SetMaxForce_1.apply(null, arguments);
}, at = b._emscripten_bind_b2Mat33_b2Mat33_3 = function() {
  return b.asm._emscripten_bind_b2Mat33_b2Mat33_3.apply(null, arguments);
}, bt = b._emscripten_bind_b2Vec3_get_y_0 = function() {
  return b.asm._emscripten_bind_b2Vec3_get_y_0.apply(null, arguments);
}, ct = b._emscripten_bind_b2JointDef_get_type_0 = function() {
  return b.asm._emscripten_bind_b2JointDef_get_type_0.apply(null, arguments);
}, dt = b._emscripten_bind_JSQueryCallback_ReportFixture_1 = function() {
  return b.asm._emscripten_bind_JSQueryCallback_ReportFixture_1.apply(null, arguments);
}, et = b._emscripten_bind_b2PulleyJoint_GetCollideConnected_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_GetCollideConnected_0.apply(null, arguments);
}, ft = b._emscripten_bind_b2Body_CreateFixture_1 = function() {
  return b.asm._emscripten_bind_b2Body_CreateFixture_1.apply(null, arguments);
}, gt = b._emscripten_bind_JSDraw_JSDraw_0 = function() {
  return b.asm._emscripten_bind_JSDraw_JSDraw_0.apply(null, arguments);
}, ht = b._emscripten_bind_b2MouseJoint_GetAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_GetAnchorA_0.apply(null, arguments);
}, it = b._emscripten_bind_b2Transform_get_p_0 = function() {
  return b.asm._emscripten_bind_b2Transform_get_p_0.apply(null, arguments);
}, jt = b._emscripten_enum_b2BodyType_b2_dynamicBody = function() {
  return b.asm._emscripten_enum_b2BodyType_b2_dynamicBody.apply(null, arguments);
}, kt = b._emscripten_bind_b2World_GetProfile_0 = function() {
  return b.asm._emscripten_bind_b2World_GetProfile_0.apply(null, arguments);
}, lt = b._emscripten_bind_b2DistanceJointDef___destroy___0 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef___destroy___0.apply(null, arguments);
}, mt = b._emscripten_bind_b2GearJointDef_set_bodyA_1 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_set_bodyA_1.apply(null, arguments);
}, nt = b._emscripten_bind_b2JointDef_set_type_1 = function() {
  return b.asm._emscripten_bind_b2JointDef_set_type_1.apply(null, arguments);
}, ot = b._emscripten_bind_b2ContactEdge_set_contact_1 = function() {
  return b.asm._emscripten_bind_b2ContactEdge_set_contact_1.apply(null, arguments);
}, pt = b._emscripten_bind_b2World_GetContactList_0 = function() {
  return b.asm._emscripten_bind_b2World_GetContactList_0.apply(null, arguments);
}, qt = b._emscripten_bind_b2Mat33_set_ez_1 = function() {
  return b.asm._emscripten_bind_b2Mat33_set_ez_1.apply(null, arguments);
}, rt = b._emscripten_bind_b2JointEdge_b2JointEdge_0 = function() {
  return b.asm._emscripten_bind_b2JointEdge_b2JointEdge_0.apply(null, arguments);
}, st = b._emscripten_bind_b2FrictionJointDef_get_bodyA_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_get_bodyA_0.apply(null, arguments);
}, tt = b._emscripten_bind_b2Body_ApplyForce_2 = function() {
  return b.asm._emscripten_bind_b2Body_ApplyForce_2.apply(null, arguments);
}, ut = b._emscripten_bind_b2WheelJointDef_get_type_0 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_get_type_0.apply(null, arguments);
}, vt = b._emscripten_bind_b2RevoluteJoint_GetReactionForce_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetReactionForce_1.apply(null, arguments);
}, wt = b._emscripten_bind_b2PulleyJointDef_set_collideConnected_1 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_set_collideConnected_1.apply(null, arguments);
}, xt = b._emscripten_bind_b2RopeJoint_GetCollideConnected_0 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_GetCollideConnected_0.apply(null, arguments);
}, yt = b._emscripten_bind_b2GearJointDef_set_joint2_1 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_set_joint2_1.apply(null, arguments);
}, zt = b._emscripten_bind_b2EdgeShape_set_m_vertex3_1 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_set_m_vertex3_1.apply(null, arguments);
}, At = b._emscripten_bind_b2GearJoint_GetAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2GearJoint_GetAnchorB_0.apply(null, arguments);
}, Bt = b._emscripten_bind_b2RopeJoint_IsActive_0 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_IsActive_0.apply(null, arguments);
}, Ct = b._emscripten_bind_b2Fixture_GetFriction_0 = function() {
  return b.asm._emscripten_bind_b2Fixture_GetFriction_0.apply(null, arguments);
}, Dt = b._emscripten_bind_b2Fixture_GetNext_0 = function() {
  return b.asm._emscripten_bind_b2Fixture_GetNext_0.apply(null, arguments);
}, Et = b._emscripten_bind_b2RopeJointDef_get_bodyA_0 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_get_bodyA_0.apply(null, arguments);
}, Ft = b._emscripten_bind_b2WeldJointDef_get_localAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_get_localAnchorB_0.apply(null, arguments);
}, Gt = b._emscripten_bind_b2WeldJointDef_set_referenceAngle_1 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_set_referenceAngle_1.apply(null, arguments);
}, Ht = b._emscripten_bind_b2DistanceJointDef_set_localAnchorB_1 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_set_localAnchorB_1.apply(null, arguments);
}, It = b._emscripten_bind_b2Mat33_SetZero_0 = function() {
  return b.asm._emscripten_bind_b2Mat33_SetZero_0.apply(null, arguments);
}, Jt = b._emscripten_bind_b2WheelJointDef_b2WheelJointDef_0 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_b2WheelJointDef_0.apply(null, arguments);
}, Kt = b._emscripten_bind_b2PrismaticJointDef_get_localAxisA_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_get_localAxisA_0.apply(null, arguments);
}, Lt = b._emscripten_bind_b2Mat22_get_ey_0 = function() {
  return b.asm._emscripten_bind_b2Mat22_get_ey_0.apply(null, arguments);
}, Mt = b._emscripten_bind_b2Mat22_SetIdentity_0 = function() {
  return b.asm._emscripten_bind_b2Mat22_SetIdentity_0.apply(null, arguments);
}, Nt = b._emscripten_bind_b2Joint_IsActive_0 = function() {
  return b.asm._emscripten_bind_b2Joint_IsActive_0.apply(null, arguments);
}, Ot = b._emscripten_bind_b2PulleyJoint_GetReactionForce_1 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_GetReactionForce_1.apply(null, arguments);
}, Pt = b._emscripten_bind_b2Shape_get_m_radius_0 = function() {
  return b.asm._emscripten_bind_b2Shape_get_m_radius_0.apply(null, arguments);
}, Qt = b._emscripten_bind_b2Mat22_b2Mat22_4 = function() {
  return b.asm._emscripten_bind_b2Mat22_b2Mat22_4.apply(null, arguments);
}, Rt = b._emscripten_bind_b2PrismaticJointDef_set_localAxisA_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_set_localAxisA_1.apply(null, arguments);
}, St = b._emscripten_bind_b2PolygonShape_SetAsBox_4 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_SetAsBox_4.apply(null, arguments);
}, Tt = b._emscripten_bind_b2EdgeShape_set_m_vertex1_1 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_set_m_vertex1_1.apply(null, arguments);
}, Ut = b._emscripten_bind_b2Body_GetWorld_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetWorld_0.apply(null, arguments);
}, Vt = b._emscripten_enum_b2LimitState_e_inactiveLimit = function() {
  return b.asm._emscripten_enum_b2LimitState_e_inactiveLimit.apply(null, arguments);
}, Wt = b._emscripten_bind_b2Vec2_set_x_1 = function() {
  return b.asm._emscripten_bind_b2Vec2_set_x_1.apply(null, arguments);
}, Xt = b._emscripten_bind_b2Body_SetAwake_1 = function() {
  return b.asm._emscripten_bind_b2Body_SetAwake_1.apply(null, arguments);
}, Yt = b._emscripten_bind_b2WeldJoint_GetLocalAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2WeldJoint_GetLocalAnchorA_0.apply(null, arguments);
}, Zt = b._emscripten_bind_b2Vec2___destroy___0 = function() {
  return b.asm._emscripten_bind_b2Vec2___destroy___0.apply(null, arguments);
}, $t = b._emscripten_enum_b2ShapeType_e_polygon = function() {
  return b.asm._emscripten_enum_b2ShapeType_e_polygon.apply(null, arguments);
}, au = b._emscripten_bind_b2Body_GetInertia_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetInertia_0.apply(null, arguments);
}, bu = b._emscripten_bind_b2PulleyJoint_GetAnchorA_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_GetAnchorA_0.apply(null, arguments);
}, cu = b._emscripten_bind_b2BodyDef_get_linearVelocity_0 = function() {
  return b.asm._emscripten_bind_b2BodyDef_get_linearVelocity_0.apply(null, arguments);
}, du = b._emscripten_bind_b2DistanceJointDef_get_bodyB_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJointDef_get_bodyB_0.apply(null, arguments);
}, eu = b._emscripten_bind_b2Mat22___destroy___0 = function() {
  return b.asm._emscripten_bind_b2Mat22___destroy___0.apply(null, arguments);
}, fu = b._emscripten_bind_b2RevoluteJoint_GetNext_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetNext_0.apply(null, arguments);
}, gu = b._emscripten_bind_JSDestructionListener_JSDestructionListener_0 = function() {
  return b.asm._emscripten_bind_JSDestructionListener_JSDestructionListener_0.apply(null, arguments);
}, hu = b._emscripten_bind_b2Fixture_GetShape_0 = function() {
  return b.asm._emscripten_bind_b2Fixture_GetShape_0.apply(null, arguments);
}, iu = b._emscripten_bind_b2PulleyJoint_GetReactionTorque_1 = function() {
  return b.asm._emscripten_bind_b2PulleyJoint_GetReactionTorque_1.apply(null, arguments);
}, ju = b._emscripten_bind_b2Vec3_op_mul_1 = function() {
  return b.asm._emscripten_bind_b2Vec3_op_mul_1.apply(null, arguments);
}, ku = b._emscripten_bind_b2PolygonShape_set_m_type_1 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_set_m_type_1.apply(null, arguments);
}, lu = b._emscripten_bind_b2PolygonShape_get_m_vertexCount_0 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_get_m_vertexCount_0.apply(null, arguments);
}, mu = b._emscripten_bind_b2WheelJoint_GetType_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetType_0.apply(null, arguments);
}, nu = b._emscripten_bind_b2RevoluteJoint_IsActive_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_IsActive_0.apply(null, arguments);
}, ou = b._emscripten_bind_b2GearJoint_GetNext_0 = function() {
  return b.asm._emscripten_bind_b2GearJoint_GetNext_0.apply(null, arguments);
}, pu = b._emscripten_bind_b2PolygonShape_set_m_vertexCount_1 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_set_m_vertexCount_1.apply(null, arguments);
}, qu = b._emscripten_bind_b2DestructionListenerWrapper___destroy___0 = function() {
  return b.asm._emscripten_bind_b2DestructionListenerWrapper___destroy___0.apply(null, arguments);
}, ru = b._emscripten_bind_b2PrismaticJointDef_set_maxMotorForce_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_set_maxMotorForce_1.apply(null, arguments);
}, su = b._emscripten_bind_b2WheelJoint_GetLocalAxisA_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetLocalAxisA_0.apply(null, arguments);
}, tu = b._emscripten_bind_b2Body_GetNext_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetNext_0.apply(null, arguments);
}, uu = b._emscripten_bind_b2MouseJoint_GetReactionForce_1 = function() {
  return b.asm._emscripten_bind_b2MouseJoint_GetReactionForce_1.apply(null, arguments);
}, vu = b._emscripten_bind_b2RopeJoint_GetBodyA_0 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_GetBodyA_0.apply(null, arguments);
}, wu = b._emscripten_bind_b2ContactFeature_set_indexA_1 = function() {
  return b.asm._emscripten_bind_b2ContactFeature_set_indexA_1.apply(null, arguments);
}, xu = b._emscripten_bind_b2Profile_get_solveInit_0 = function() {
  return b.asm._emscripten_bind_b2Profile_get_solveInit_0.apply(null, arguments);
}, yu = b._emscripten_bind_b2Fixture_IsSensor_0 = function() {
  return b.asm._emscripten_bind_b2Fixture_IsSensor_0.apply(null, arguments);
}, zu = b._emscripten_bind_b2FrictionJoint_GetAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_GetAnchorB_0.apply(null, arguments);
}, Au = b._emscripten_bind_b2World_QueryAABB_2 = function() {
  return b.asm._emscripten_bind_b2World_QueryAABB_2.apply(null, arguments);
}, Bu = b._emscripten_bind_b2Profile_set_collide_1 = function() {
  return b.asm._emscripten_bind_b2Profile_set_collide_1.apply(null, arguments);
}, Cu = b._emscripten_bind_b2BodyDef_get_userData_0 = function() {
  return b.asm._emscripten_bind_b2BodyDef_get_userData_0.apply(null, arguments);
}, Du = b._emscripten_bind_b2FrictionJoint_GetMaxForce_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_GetMaxForce_0.apply(null, arguments);
}, Eu = b._emscripten_bind_b2WheelJointDef_get_userData_0 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_get_userData_0.apply(null, arguments);
}, Fu = b._emscripten_bind_b2RevoluteJoint_IsLimitEnabled_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_IsLimitEnabled_0.apply(null, arguments);
}, Gu = b._emscripten_bind_b2World_SetDestructionListener_1 = function() {
  return b.asm._emscripten_bind_b2World_SetDestructionListener_1.apply(null, arguments);
}, Hu = b._emscripten_bind_b2RevoluteJointDef_set_maxMotorTorque_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_set_maxMotorTorque_1.apply(null, arguments);
}, Iu = b._emscripten_bind_b2WeldJointDef_set_bodyB_1 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_set_bodyB_1.apply(null, arguments);
}, Ju = b._emscripten_bind_b2Transform_set_p_1 = function() {
  return b.asm._emscripten_bind_b2Transform_set_p_1.apply(null, arguments);
}, Ku = b._emscripten_bind_b2DistanceJoint_SetLength_1 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_SetLength_1.apply(null, arguments);
}, Lu = b._emscripten_bind_b2JointEdge_get_joint_0 = function() {
  return b.asm._emscripten_bind_b2JointEdge_get_joint_0.apply(null, arguments);
}, Mu = b._emscripten_bind_b2Body_GetLocalCenter_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetLocalCenter_0.apply(null, arguments);
}, Nu = b._emscripten_bind_b2FixtureDef___destroy___0 = function() {
  return b.asm._emscripten_bind_b2FixtureDef___destroy___0.apply(null, arguments);
}, Ou = b._emscripten_bind_b2MouseJoint___destroy___0 = function() {
  return b.asm._emscripten_bind_b2MouseJoint___destroy___0.apply(null, arguments);
}, Pu = b._emscripten_enum_b2JointType_e_ropeJoint = function() {
  return b.asm._emscripten_enum_b2JointType_e_ropeJoint.apply(null, arguments);
}, Qu = b._emscripten_bind_b2Profile_get_solveVelocity_0 = function() {
  return b.asm._emscripten_bind_b2Profile_get_solveVelocity_0.apply(null, arguments);
}, Ru = b._emscripten_bind_b2WeldJointDef_get_bodyB_0 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_get_bodyB_0.apply(null, arguments);
}, Su = b._emscripten_bind_b2World_GetContinuousPhysics_0 = function() {
  return b.asm._emscripten_bind_b2World_GetContinuousPhysics_0.apply(null, arguments);
}, Tu = b._emscripten_bind_b2Joint_GetBodyA_0 = function() {
  return b.asm._emscripten_bind_b2Joint_GetBodyA_0.apply(null, arguments);
}, Uu = b._emscripten_bind_b2Body_SetAngularDamping_1 = function() {
  return b.asm._emscripten_bind_b2Body_SetAngularDamping_1.apply(null, arguments);
}, Vu = b._emscripten_bind_b2PulleyJointDef_Initialize_7 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_Initialize_7.apply(null, arguments);
}, Wu = b._emscripten_bind_b2GearJointDef_set_bodyB_1 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_set_bodyB_1.apply(null, arguments);
}, Xu = b._emscripten_bind_b2RopeJoint_GetReactionTorque_1 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_GetReactionTorque_1.apply(null, arguments);
}, Yu = b._emscripten_bind_b2WheelJointDef_set_dampingRatio_1 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_set_dampingRatio_1.apply(null, arguments);
}, Zu = b._emscripten_bind_b2GearJoint_GetType_0 = function() {
  return b.asm._emscripten_bind_b2GearJoint_GetType_0.apply(null, arguments);
}, $u = b._emscripten_bind_b2EdgeShape_set_m_vertex0_1 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_set_m_vertex0_1.apply(null, arguments);
}, av = b._emscripten_bind_b2RevoluteJoint_GetAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2RevoluteJoint_GetAnchorB_0.apply(null, arguments);
}, bv = b._emscripten_bind_b2RopeJointDef_set_localAnchorB_1 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_set_localAnchorB_1.apply(null, arguments);
}, cv = b._emscripten_bind_b2PrismaticJoint_GetUserData_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_GetUserData_0.apply(null, arguments);
}, dv = b._emscripten_bind_b2GearJointDef_set_userData_1 = function() {
  return b.asm._emscripten_bind_b2GearJointDef_set_userData_1.apply(null, arguments);
}, ev = b._emscripten_bind_b2Fixture_SetSensor_1 = function() {
  return b.asm._emscripten_bind_b2Fixture_SetSensor_1.apply(null, arguments);
}, fv = b._emscripten_bind_b2EdgeShape_get_m_radius_0 = function() {
  return b.asm._emscripten_bind_b2EdgeShape_get_m_radius_0.apply(null, arguments);
}, gv = b._emscripten_bind_b2Contact_GetFixtureB_0 = function() {
  return b.asm._emscripten_bind_b2Contact_GetFixtureB_0.apply(null, arguments);
}, hv = b._emscripten_bind_b2ChainShape_ComputeMass_2 = function() {
  return b.asm._emscripten_bind_b2ChainShape_ComputeMass_2.apply(null, arguments);
}, iv = b._emscripten_bind_b2WeldJointDef_b2WeldJointDef_0 = function() {
  return b.asm._emscripten_bind_b2WeldJointDef_b2WeldJointDef_0.apply(null, arguments);
}, jv = b._emscripten_bind_b2Contact_GetChildIndexA_0 = function() {
  return b.asm._emscripten_bind_b2Contact_GetChildIndexA_0.apply(null, arguments);
}, kv = b._emscripten_bind_b2RopeJointDef_get_bodyB_0 = function() {
  return b.asm._emscripten_bind_b2RopeJointDef_get_bodyB_0.apply(null, arguments);
}, lv = b._emscripten_bind_b2BodyDef_b2BodyDef_0 = function() {
  return b.asm._emscripten_bind_b2BodyDef_b2BodyDef_0.apply(null, arguments);
}, mv = b._emscripten_bind_b2MassData_get_mass_0 = function() {
  return b.asm._emscripten_bind_b2MassData_get_mass_0.apply(null, arguments);
}, nv = b._emscripten_bind_b2Joint_SetUserData_1 = function() {
  return b.asm._emscripten_bind_b2Joint_SetUserData_1.apply(null, arguments);
}, ov = b._emscripten_bind_b2Joint_GetBodyB_0 = function() {
  return b.asm._emscripten_bind_b2Joint_GetBodyB_0.apply(null, arguments);
}, pv = b._emscripten_bind_b2Shape_GetChildCount_0 = function() {
  return b.asm._emscripten_bind_b2Shape_GetChildCount_0.apply(null, arguments);
}, qv = b._emscripten_bind_b2WheelJointDef_set_localAxisA_1 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_set_localAxisA_1.apply(null, arguments);
}, rv = b._emscripten_bind_b2Joint_Dump_0 = function() {
  return b.asm._emscripten_bind_b2Joint_Dump_0.apply(null, arguments);
}, sv = b._emscripten_bind_b2Color_get_r_0 = function() {
  return b.asm._emscripten_bind_b2Color_get_r_0.apply(null, arguments);
}, tv = b._emscripten_bind_b2RevoluteJointDef_set_motorSpeed_1 = function() {
  return b.asm._emscripten_bind_b2RevoluteJointDef_set_motorSpeed_1.apply(null, arguments);
}, uv = b._emscripten_bind_b2WheelJointDef_get_enableMotor_0 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_get_enableMotor_0.apply(null, arguments);
}, vv = b._emscripten_bind_b2Vec2_LengthSquared_0 = function() {
  return b.asm._emscripten_bind_b2Vec2_LengthSquared_0.apply(null, arguments);
}, wv = b._emscripten_bind_b2FrictionJointDef_set_bodyA_1 = function() {
  return b.asm._emscripten_bind_b2FrictionJointDef_set_bodyA_1.apply(null, arguments);
}, xv = b._emscripten_bind_b2WheelJoint_GetSpringFrequencyHz_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetSpringFrequencyHz_0.apply(null, arguments);
}, yv = b._emscripten_bind_b2ContactEdge_set_prev_1 = function() {
  return b.asm._emscripten_bind_b2ContactEdge_set_prev_1.apply(null, arguments);
}, zv = b._emscripten_bind_b2Shape_ComputeMass_2 = function() {
  return b.asm._emscripten_bind_b2Shape_ComputeMass_2.apply(null, arguments);
}, Av = b._emscripten_bind_b2FrictionJoint_GetBodyA_0 = function() {
  return b.asm._emscripten_bind_b2FrictionJoint_GetBodyA_0.apply(null, arguments);
}, Bv = b._emscripten_bind_b2WheelJointDef_set_localAnchorB_1 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_set_localAnchorB_1.apply(null, arguments);
}, Cv = b._emscripten_bind_b2Body_GetAngle_0 = function() {
  return b.asm._emscripten_bind_b2Body_GetAngle_0.apply(null, arguments);
}, Dv = b._emscripten_bind_b2PrismaticJointDef_get_maxMotorForce_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_get_maxMotorForce_0.apply(null, arguments);
}, Ev = b._emscripten_bind_b2DistanceJoint_GetBodyA_0 = function() {
  return b.asm._emscripten_bind_b2DistanceJoint_GetBodyA_0.apply(null, arguments);
}, Fv = b._emscripten_bind_b2WheelJoint_GetLocalAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetLocalAnchorB_0.apply(null, arguments);
}, Gv = b._emscripten_bind_b2PulleyJointDef_set_bodyA_1 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_set_bodyA_1.apply(null, arguments);
}, Hv = b._emscripten_bind_b2WheelJoint_GetAnchorB_0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint_GetAnchorB_0.apply(null, arguments);
}, Iv = b._emscripten_bind_b2PolygonShape_SetAsBox_2 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_SetAsBox_2.apply(null, arguments);
}, Jv = b._emscripten_bind_b2PrismaticJointDef_get_type_0 = function() {
  return b.asm._emscripten_bind_b2PrismaticJointDef_get_type_0.apply(null, arguments);
}, Kv = b._emscripten_bind_b2Color_Set_3 = function() {
  return b.asm._emscripten_bind_b2Color_Set_3.apply(null, arguments);
}, Lv = b._emscripten_bind_b2WheelJointDef_get_bodyA_0 = function() {
  return b.asm._emscripten_bind_b2WheelJointDef_get_bodyA_0.apply(null, arguments);
}, Mv = b._emscripten_enum_b2LimitState_e_atUpperLimit = function() {
  return b.asm._emscripten_enum_b2LimitState_e_atUpperLimit.apply(null, arguments);
}, Nv = b._emscripten_bind_b2PulleyJointDef_set_groundAnchorA_1 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_set_groundAnchorA_1.apply(null, arguments);
}, Ov = b._emscripten_bind_b2PolygonShape_get_m_type_0 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_get_m_type_0.apply(null, arguments);
}, Pv = b._emscripten_bind_b2PrismaticJoint_SetMaxMotorForce_1 = function() {
  return b.asm._emscripten_bind_b2PrismaticJoint_SetMaxMotorForce_1.apply(null, arguments);
}, Qv = b._emscripten_bind_b2PulleyJointDef_get_collideConnected_0 = function() {
  return b.asm._emscripten_bind_b2PulleyJointDef_get_collideConnected_0.apply(null, arguments);
}, Rv = b._emscripten_bind_JSContactListener_JSContactListener_0 = function() {
  return b.asm._emscripten_bind_JSContactListener_JSContactListener_0.apply(null, arguments);
}, Sv = b._emscripten_bind_b2WheelJoint___destroy___0 = function() {
  return b.asm._emscripten_bind_b2WheelJoint___destroy___0.apply(null, arguments);
}, Tv = b._emscripten_bind_b2PolygonShape_set_m_radius_1 = function() {
  return b.asm._emscripten_bind_b2PolygonShape_set_m_radius_1.apply(null, arguments);
}, Uv = b._emscripten_bind_b2Fixture_GetMassData_1 = function() {
  return b.asm._emscripten_bind_b2Fixture_GetMassData_1.apply(null, arguments);
}, Vv = b._emscripten_bind_b2RopeJoint_SetMaxLength_1 = function() {
  return b.asm._emscripten_bind_b2RopeJoint_SetMaxLength_1.apply(null, arguments);
};
b.dynCall_iiii = function() {
  return b.asm.dynCall_iiii.apply(null, arguments);
};
b.dynCall_viifii = function() {
  return b.asm.dynCall_viifii.apply(null, arguments);
};
b.dynCall_viiiii = function() {
  return b.asm.dynCall_viiiii.apply(null, arguments);
};
b.dynCall_vi = function() {
  return b.asm.dynCall_vi.apply(null, arguments);
};
b.dynCall_vii = function() {
  return b.asm.dynCall_vii.apply(null, arguments);
};
b.dynCall_ii = function() {
  return b.asm.dynCall_ii.apply(null, arguments);
};
b.dynCall_fif = function() {
  return b.asm.dynCall_fif.apply(null, arguments);
};
b.dynCall_viii = function() {
  return b.asm.dynCall_viii.apply(null, arguments);
};
b.dynCall_viifi = function() {
  return b.asm.dynCall_viifi.apply(null, arguments);
};
b.dynCall_v = function() {
  return b.asm.dynCall_v.apply(null, arguments);
};
b.dynCall_viif = function() {
  return b.asm.dynCall_viif.apply(null, arguments);
};
b.dynCall_viiiiii = function() {
  return b.asm.dynCall_viiiiii.apply(null, arguments);
};
b.dynCall_iii = function() {
  return b.asm.dynCall_iii.apply(null, arguments);
};
b.dynCall_iiiiii = function() {
  return b.asm.dynCall_iiiiii.apply(null, arguments);
};
b.dynCall_fiiiif = function() {
  return b.asm.dynCall_fiiiif.apply(null, arguments);
};
b.dynCall_viiii = function() {
  return b.asm.dynCall_viiii.apply(null, arguments);
};
f.i = b.stackAlloc;
f.p = b.stackSave;
f.j = b.stackRestore;
f.S = b.establishStackSpace;
f.g = b.setTempRet0;
f.J = b.getTempRet0;
b.asm = Zb;
if (Fb) {
  if ("function" === typeof b.locateFile ? Fb = b.locateFile(Fb) : b.memoryInitializerPrefixURL && (Fb = b.memoryInitializerPrefixURL + Fb), fa || ga) {
    var Wv = b.readBinary(Fb);
    Ta.set(Wv, f.s);
  } else {
    var Yv = function() {
      b.readAsync(Fb, Xv, function() {
        throw "could not load memory initializer " + Fb;
      });
    };
    Db();
    var Xv = function(a) {
      a.byteLength && (a = new Uint8Array(a));
      Ta.set(a, f.s);
      b.memoryInitializerRequest && delete b.memoryInitializerRequest.response;
      Eb();
    };
    if (b.memoryInitializerRequest) {
      var Zv = function() {
        var a = b.memoryInitializerRequest;
        200 !== a.status && 0 !== a.status ? (console.warn("a problem seems to have happened with Module.memoryInitializerRequest, status: " + a.status + ", retrying " + Fb), Yv()) : Xv(a.response);
      };
      b.memoryInitializerRequest.response ? setTimeout(Zv, 0) : b.memoryInitializerRequest.addEventListener("load", Zv);
    } else {
      Yv();
    }
  }
}
b.then = function(a) {
  if (b.calledRun) {
    a(b);
  } else {
    var c = b.onRuntimeInitialized;
    b.onRuntimeInitialized = function() {
      a(b);
      c && c();
    };
  }
  return b;
};
function la(a) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + a + ")";
  this.status = a;
}
la.prototype = Error();
la.prototype.constructor = la;
var $v = null, Cb = function aw() {
  b.calledRun || bw();
  b.calledRun || (Cb = aw);
};
b.callMain = b.Q = function(a) {
  function c() {
    for (var a = 0;3 > a;a++) {
      e.push(0);
    }
  }
  a = a || [];
  Va || (Va = !0, ob(qb));
  var d = a.length + 1, e = [Ra(yb(b.thisProgram), "i8", 0)];
  c();
  for (var g = 0;g < d - 1;g += 1) {
    e.push(Ra(yb(a[g]), "i8", 0)), c();
  }
  e.push(0);
  e = Ra(e, "i32", 0);
  try {
    var m = b._main(d, e, 0);
    cw(m, !0);
  } catch (l) {
    l instanceof la || ("SimulateInfiniteLoop" == l ? b.noExitRuntime = !0 : ((a = l) && "object" === typeof l && l.stack && (a = [l, l.stack]), b.h("exception thrown: " + a), b.quit(1, l)));
  } finally {
  }
};
function bw(a) {
  function c() {
    if (!b.calledRun && (b.calledRun = !0, !wa)) {
      Va || (Va = !0, ob(qb));
      ob(sb);
      if (b.onRuntimeInitialized) {
        b.onRuntimeInitialized();
      }
      b._main && dw && b.callMain(a);
      if (b.postRun) {
        for ("function" == typeof b.postRun && (b.postRun = [b.postRun]);b.postRun.length;) {
          xb(b.postRun.shift());
        }
      }
      ob(ub);
    }
  }
  a = a || b.arguments;
  null === $v && ($v = Date.now());
  if (!(0 < Ab)) {
    if (b.preRun) {
      for ("function" == typeof b.preRun && (b.preRun = [b.preRun]);b.preRun.length;) {
        vb(b.preRun.shift());
      }
    }
    ob(pb);
    0 < Ab || b.calledRun || (b.setStatus ? (b.setStatus("Running..."), setTimeout(function() {
      setTimeout(function() {
        b.setStatus("");
      }, 1);
      c();
    }, 1)) : c());
  }
}
b.run = b.run = bw;
function cw(a, c) {
  if (!c || !b.noExitRuntime) {
    if (!b.noExitRuntime && (wa = !0, na = void 0, ob(tb), b.onExit)) {
      b.onExit(a);
    }
    fa && process.exit(a);
    b.quit(a, new la(a));
  }
}
b.exit = b.exit = cw;
var ew = [];
function xa(a) {
  void 0 !== a ? (b.print(a), b.h(a), a = JSON.stringify(a)) : a = "";
  wa = !0;
  var c = "abort(" + a + ") at " + db() + "\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";
  ew && ew.forEach(function(d) {
    c = d(c, a);
  });
  throw c;
}
b.abort = b.abort = xa;
if (b.preInit) {
  for ("function" == typeof b.preInit && (b.preInit = [b.preInit]);0 < b.preInit.length;) {
    b.preInit.pop()();
  }
}
var dw = !0;
b.noInitialRun && (dw = !1);
b.noExitRuntime = !0;
bw();
function h() {
}
h.prototype = Object.create(h.prototype);
h.prototype.constructor = h;
h.prototype.b = h;
h.c = {};
b.WrapperObject = h;
function k(a) {
  return (a || h).c;
}
b.getCache = k;
function n(a, c) {
  var d = k(c), e = d[a];
  if (e) {
    return e;
  }
  e = Object.create((c || h).prototype);
  e.a = a;
  return d[a] = e;
}
b.wrapPointer = n;
b.castObject = function(a, c) {
  return n(a.a, c);
};
b.NULL = n(0);
b.destroy = function(a) {
  if (!a.__destroy__) {
    throw "Error: Cannot destroy object. (Did you create it yourself?)";
  }
  a.__destroy__();
  delete k(a.b)[a.a];
};
b.compare = function(a, c) {
  return a.a === c.a;
};
b.getPointer = function(a) {
  return a.a;
};
b.getClass = function(a) {
  return a.b;
};
function fw() {
  throw "cannot construct a b2DestructionListenerWrapper, no constructor in IDL";
}
fw.prototype = Object.create(h.prototype);
fw.prototype.constructor = fw;
fw.prototype.b = fw;
fw.c = {};
b.b2DestructionListenerWrapper = fw;
fw.prototype.__destroy__ = function() {
  qu(this.a);
};
function gw() {
  throw "cannot construct a b2Draw, no constructor in IDL";
}
gw.prototype = Object.create(h.prototype);
gw.prototype.constructor = gw;
gw.prototype.b = gw;
gw.c = {};
b.b2Draw = gw;
gw.prototype.SetFlags = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  he(c, a);
};
gw.prototype.GetFlags = function() {
  return ic(this.a);
};
gw.prototype.AppendFlags = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  yh(c, a);
};
gw.prototype.ClearFlags = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Th(c, a);
};
gw.prototype.__destroy__ = function() {
  Il(this.a);
};
function p() {
  throw "cannot construct a b2Joint, no constructor in IDL";
}
p.prototype = Object.create(h.prototype);
p.prototype.constructor = p;
p.prototype.b = p;
p.c = {};
b.b2Joint = p;
p.prototype.GetType = function() {
  return ls(this.a);
};
p.prototype.GetBodyA = function() {
  return n(Tu(this.a), q);
};
p.prototype.GetBodyB = function() {
  return n(ov(this.a), q);
};
p.prototype.GetAnchorA = function() {
  return n(Im(this.a), r);
};
p.prototype.GetAnchorB = function() {
  return n(Vi(this.a), r);
};
p.prototype.GetReactionForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(Cl(c, a), r);
};
p.prototype.GetReactionTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return Ej(c, a);
};
p.prototype.GetNext = function() {
  return n(ks(this.a), p);
};
p.prototype.GetUserData = function() {
  return Kk(this.a);
};
p.prototype.SetUserData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  nv(c, a);
};
p.prototype.IsActive = function() {
  return !!Nt(this.a);
};
p.prototype.GetCollideConnected = function() {
  return !!ff(this.a);
};
p.prototype.Dump = function() {
  rv(this.a);
};
function hw() {
  throw "cannot construct a b2RayCastCallback, no constructor in IDL";
}
hw.prototype = Object.create(h.prototype);
hw.prototype.constructor = hw;
hw.prototype.b = hw;
hw.c = {};
b.b2RayCastCallback = hw;
hw.prototype.__destroy__ = function() {
  sh(this.a);
};
function iw() {
  throw "cannot construct a b2ContactListener, no constructor in IDL";
}
iw.prototype = Object.create(h.prototype);
iw.prototype.constructor = iw;
iw.prototype.b = iw;
iw.c = {};
b.b2ContactListener = iw;
iw.prototype.__destroy__ = function() {
  ho(this.a);
};
function jw() {
  throw "cannot construct a b2QueryCallback, no constructor in IDL";
}
jw.prototype = Object.create(h.prototype);
jw.prototype.constructor = jw;
jw.prototype.b = jw;
jw.c = {};
b.b2QueryCallback = jw;
jw.prototype.__destroy__ = function() {
  Bs(this.a);
};
function t() {
  this.a = Bm();
  k(t)[this.a] = this;
}
t.prototype = Object.create(h.prototype);
t.prototype.constructor = t;
t.prototype.b = t;
t.c = {};
b.b2JointDef = t;
t.prototype.get_type = function() {
  return ct(this.a);
};
t.prototype.set_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  nt(c, a);
};
t.prototype.get_userData = function() {
  return rm(this.a);
};
t.prototype.set_userData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  yp(c, a);
};
t.prototype.get_bodyA = function() {
  return n(Qq(this.a), q);
};
t.prototype.set_bodyA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  kk(c, a);
};
t.prototype.get_bodyB = function() {
  return n(Em(this.a), q);
};
t.prototype.set_bodyB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Cq(c, a);
};
t.prototype.get_collideConnected = function() {
  return !!kd(this.a);
};
t.prototype.set_collideConnected = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  gk(c, a);
};
t.prototype.__destroy__ = function() {
  Se(this.a);
};
function u() {
  throw "cannot construct a b2Shape, no constructor in IDL";
}
u.prototype = Object.create(h.prototype);
u.prototype.constructor = u;
u.prototype.b = u;
u.c = {};
b.b2Shape = u;
u.prototype.GetType = function() {
  return rn(this.a);
};
u.prototype.GetChildCount = function() {
  return pv(this.a);
};
u.prototype.TestPoint = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  return !!Oq(d, a, c);
};
u.prototype.RayCast = function(a, c, d, e) {
  var g = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  e && "object" === typeof e && (e = e.a);
  return !!fd(g, a, c, d, e);
};
u.prototype.ComputeAABB = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  ec(e, a, c, d);
};
u.prototype.ComputeMass = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  zv(d, a, c);
};
u.prototype.get_m_type = function() {
  return Tj(this.a);
};
u.prototype.set_m_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Dr(c, a);
};
u.prototype.get_m_radius = function() {
  return Pt(this.a);
};
u.prototype.set_m_radius = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  of(c, a);
};
u.prototype.__destroy__ = function() {
  Al(this.a);
};
function kw() {
  throw "cannot construct a b2ContactFilter, no constructor in IDL";
}
kw.prototype = Object.create(h.prototype);
kw.prototype.constructor = kw;
kw.prototype.b = kw;
kw.c = {};
b.b2ContactFilter = kw;
kw.prototype.__destroy__ = function() {
  Qf(this.a);
};
function lw() {
  this.a = gu();
  k(lw)[this.a] = this;
}
lw.prototype = Object.create(fw.prototype);
lw.prototype.constructor = lw;
lw.prototype.b = lw;
lw.c = {};
b.JSDestructionListener = lw;
lw.prototype.SayGoodbyeJoint = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  zl(c, a);
};
lw.prototype.SayGoodbyeFixture = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  qp(c, a);
};
lw.prototype.__destroy__ = function() {
  Jr(this.a);
};
function mw() {
  throw "cannot construct a b2ContactImpulse, no constructor in IDL";
}
mw.prototype = Object.create(h.prototype);
mw.prototype.constructor = mw;
mw.prototype.b = mw;
mw.c = {};
b.b2ContactImpulse = mw;
mw.prototype.get_count = function() {
  return Ym(this.a);
};
mw.prototype.set_count = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Rg(c, a);
};
mw.prototype.__destroy__ = function() {
  Ie(this.a);
};
function v() {
  throw "cannot construct a b2DistanceJoint, no constructor in IDL";
}
v.prototype = Object.create(p.prototype);
v.prototype.constructor = v;
v.prototype.b = v;
v.c = {};
b.b2DistanceJoint = v;
v.prototype.GetLocalAnchorA = function() {
  return n(me(this.a), r);
};
v.prototype.GetLocalAnchorB = function() {
  return n(Ph(this.a), r);
};
v.prototype.SetLength = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ku(c, a);
};
v.prototype.GetLength = function() {
  return Oj(this.a);
};
v.prototype.SetFrequency = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Pg(c, a);
};
v.prototype.GetFrequency = function() {
  return sl(this.a);
};
v.prototype.SetDampingRatio = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ze(c, a);
};
v.prototype.GetDampingRatio = function() {
  return fh(this.a);
};
v.prototype.GetType = function() {
  return pk(this.a);
};
v.prototype.GetBodyA = function() {
  return n(Ev(this.a), q);
};
v.prototype.GetBodyB = function() {
  return n(Qe(this.a), q);
};
v.prototype.GetAnchorA = function() {
  return n(Uc(this.a), r);
};
v.prototype.GetAnchorB = function() {
  return n(Cg(this.a), r);
};
v.prototype.GetReactionForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(Fm(c, a), r);
};
v.prototype.GetReactionTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return Ur(c, a);
};
v.prototype.GetNext = function() {
  return n(je(this.a), p);
};
v.prototype.GetUserData = function() {
  return Kd(this.a);
};
v.prototype.SetUserData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Tf(c, a);
};
v.prototype.IsActive = function() {
  return !!yg(this.a);
};
v.prototype.GetCollideConnected = function() {
  return !!Js(this.a);
};
v.prototype.__destroy__ = function() {
  Fk(this.a);
};
function nw(a, c, d) {
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  this.a = void 0 === a ? kg() : void 0 === c ? _emscripten_bind_b2Mat33_b2Mat33_1(a) : void 0 === d ? _emscripten_bind_b2Mat33_b2Mat33_2(a, c) : at(a, c, d);
  k(nw)[this.a] = this;
}
nw.prototype = Object.create(h.prototype);
nw.prototype.constructor = nw;
nw.prototype.b = nw;
nw.c = {};
b.b2Mat33 = nw;
nw.prototype.SetZero = function() {
  It(this.a);
};
nw.prototype.Solve33 = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(Bo(c, a), w);
};
nw.prototype.Solve22 = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(Of(c, a), r);
};
nw.prototype.GetInverse22 = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  im(c, a);
};
nw.prototype.GetSymInverse33 = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Yk(c, a);
};
nw.prototype.get_ex = function() {
  return n(Lg(this.a), w);
};
nw.prototype.set_ex = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Rs(c, a);
};
nw.prototype.get_ey = function() {
  return n(Mc(this.a), w);
};
nw.prototype.set_ey = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Pc(c, a);
};
nw.prototype.get_ez = function() {
  return n(Ze(this.a), w);
};
nw.prototype.set_ez = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  qt(c, a);
};
nw.prototype.__destroy__ = function() {
  hd(this.a);
};
function x() {
  throw "cannot construct a b2Fixture, no constructor in IDL";
}
x.prototype = Object.create(h.prototype);
x.prototype.constructor = x;
x.prototype.b = x;
x.c = {};
b.b2Fixture = x;
x.prototype.GetType = function() {
  return rk(this.a);
};
x.prototype.GetShape = function() {
  return n(hu(this.a), u);
};
x.prototype.SetSensor = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ev(c, a);
};
x.prototype.IsSensor = function() {
  return !!yu(this.a);
};
x.prototype.SetFilterData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Wj(c, a);
};
x.prototype.GetFilterData = function() {
  return n(hs(this.a), ow);
};
x.prototype.Refilter = function() {
  Kn(this.a);
};
x.prototype.GetBody = function() {
  return n(Qg(this.a), q);
};
x.prototype.GetNext = function() {
  return n(Dt(this.a), x);
};
x.prototype.GetUserData = function() {
  return hl(this.a);
};
x.prototype.SetUserData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ni(c, a);
};
x.prototype.TestPoint = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return !!Ff(c, a);
};
x.prototype.RayCast = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  return !!jk(e, a, c, d);
};
x.prototype.GetMassData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Uv(c, a);
};
x.prototype.SetDensity = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Wg(c, a);
};
x.prototype.GetDensity = function() {
  return Qo(this.a);
};
x.prototype.GetFriction = function() {
  return Ct(this.a);
};
x.prototype.SetFriction = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Vn(c, a);
};
x.prototype.GetRestitution = function() {
  return oe(this.a);
};
x.prototype.SetRestitution = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Os(c, a);
};
x.prototype.GetAABB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(Mm(c, a), pw);
};
x.prototype.Dump = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  om(c, a);
};
x.prototype.__destroy__ = function() {
  vc(this.a);
};
function ow() {
  this.a = Od();
  k(ow)[this.a] = this;
}
ow.prototype = Object.create(h.prototype);
ow.prototype.constructor = ow;
ow.prototype.b = ow;
ow.c = {};
b.b2Filter = ow;
ow.prototype.get_categoryBits = function() {
  return ln(this.a);
};
ow.prototype.set_categoryBits = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  el(c, a);
};
ow.prototype.get_maskBits = function() {
  return bo(this.a);
};
ow.prototype.set_maskBits = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ir(c, a);
};
ow.prototype.get_groupIndex = function() {
  return Ue(this.a);
};
ow.prototype.set_groupIndex = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Am(c, a);
};
ow.prototype.__destroy__ = function() {
  fn(this.a);
};
function qw() {
  this.a = md();
  k(qw)[this.a] = this;
}
qw.prototype = Object.create(jw.prototype);
qw.prototype.constructor = qw;
qw.prototype.b = qw;
qw.c = {};
b.JSQueryCallback = qw;
qw.prototype.ReportFixture = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return !!dt(c, a);
};
qw.prototype.__destroy__ = function() {
  Jn(this.a);
};
function y() {
  throw "cannot construct a b2MouseJoint, no constructor in IDL";
}
y.prototype = Object.create(p.prototype);
y.prototype.constructor = y;
y.prototype.b = y;
y.c = {};
b.b2MouseJoint = y;
y.prototype.SetTarget = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  eg(c, a);
};
y.prototype.GetTarget = function() {
  return n(In(this.a), r);
};
y.prototype.SetMaxForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  wp(c, a);
};
y.prototype.GetMaxForce = function() {
  return be(this.a);
};
y.prototype.SetFrequency = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  al(c, a);
};
y.prototype.GetFrequency = function() {
  return Bk(this.a);
};
y.prototype.SetDampingRatio = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Uj(c, a);
};
y.prototype.GetDampingRatio = function() {
  return Wq(this.a);
};
y.prototype.GetType = function() {
  return Hn(this.a);
};
y.prototype.GetBodyA = function() {
  return n(Sn(this.a), q);
};
y.prototype.GetBodyB = function() {
  return n(Gi(this.a), q);
};
y.prototype.GetAnchorA = function() {
  return n(ht(this.a), r);
};
y.prototype.GetAnchorB = function() {
  return n(Tp(this.a), r);
};
y.prototype.GetReactionForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(uu(c, a), r);
};
y.prototype.GetReactionTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return mn(c, a);
};
y.prototype.GetNext = function() {
  return n(bi(this.a), p);
};
y.prototype.GetUserData = function() {
  return nn(this.a);
};
y.prototype.SetUserData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ds(c, a);
};
y.prototype.IsActive = function() {
  return !!gc(this.a);
};
y.prototype.GetCollideConnected = function() {
  return !!Nc(this.a);
};
y.prototype.__destroy__ = function() {
  Ou(this.a);
};
function rw(a) {
  a && "object" === typeof a && (a = a.a);
  this.a = void 0 === a ? Dn() : En(a);
  k(rw)[this.a] = this;
}
rw.prototype = Object.create(h.prototype);
rw.prototype.constructor = rw;
rw.prototype.b = rw;
rw.c = {};
b.b2Rot = rw;
rw.prototype.Set = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Kf(c, a);
};
rw.prototype.SetIdentity = function() {
  Cp(this.a);
};
rw.prototype.GetAngle = function() {
  return Io(this.a);
};
rw.prototype.GetXAxis = function() {
  return n(jg(this.a), r);
};
rw.prototype.GetYAxis = function() {
  return n(pq(this.a), r);
};
rw.prototype.get_s = function() {
  return Vo(this.a);
};
rw.prototype.set_s = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Tm(c, a);
};
rw.prototype.get_c = function() {
  return sp(this.a);
};
rw.prototype.set_c = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Cm(c, a);
};
rw.prototype.__destroy__ = function() {
  ao(this.a);
};
function z() {
  throw "cannot construct a b2Profile, no constructor in IDL";
}
z.prototype = Object.create(h.prototype);
z.prototype.constructor = z;
z.prototype.b = z;
z.c = {};
b.b2Profile = z;
z.prototype.get_step = function() {
  return Lj(this.a);
};
z.prototype.set_step = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ui(c, a);
};
z.prototype.get_collide = function() {
  return qs(this.a);
};
z.prototype.set_collide = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Bu(c, a);
};
z.prototype.get_solve = function() {
  return pp(this.a);
};
z.prototype.set_solve = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Yr(c, a);
};
z.prototype.get_solveInit = function() {
  return xu(this.a);
};
z.prototype.set_solveInit = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  uk(c, a);
};
z.prototype.get_solveVelocity = function() {
  return Qu(this.a);
};
z.prototype.set_solveVelocity = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ym(c, a);
};
z.prototype.get_solvePosition = function() {
  return ed(this.a);
};
z.prototype.set_solvePosition = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Pf(c, a);
};
z.prototype.get_broadphase = function() {
  return Qc(this.a);
};
z.prototype.set_broadphase = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Wm(c, a);
};
z.prototype.get_solveTOI = function() {
  return Ag(this.a);
};
z.prototype.set_solveTOI = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Bh(c, a);
};
z.prototype.__destroy__ = function() {
  Ng(this.a);
};
function sw() {
  throw "cannot construct a VoidPtr, no constructor in IDL";
}
sw.prototype = Object.create(h.prototype);
sw.prototype.constructor = sw;
sw.prototype.b = sw;
sw.c = {};
b.VoidPtr = sw;
sw.prototype.__destroy__ = function() {
  wo(this.a);
};
function A() {
  this.a = lv();
  k(A)[this.a] = this;
}
A.prototype = Object.create(h.prototype);
A.prototype.constructor = A;
A.prototype.b = A;
A.c = {};
b.b2BodyDef = A;
A.prototype.get_type = function() {
  return hm(this.a);
};
A.prototype.set_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ac(c, a);
};
A.prototype.get_position = function() {
  return n(Fc(this.a), r);
};
A.prototype.set_position = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  pd(c, a);
};
A.prototype.get_angle = function() {
  return Ws(this.a);
};
A.prototype.set_angle = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Sk(c, a);
};
A.prototype.get_linearVelocity = function() {
  return n(cu(this.a), r);
};
A.prototype.set_linearVelocity = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  fk(c, a);
};
A.prototype.get_angularVelocity = function() {
  return de(this.a);
};
A.prototype.set_angularVelocity = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Vl(c, a);
};
A.prototype.get_linearDamping = function() {
  return Ij(this.a);
};
A.prototype.set_linearDamping = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Mq(c, a);
};
A.prototype.get_angularDamping = function() {
  return aq(this.a);
};
A.prototype.set_angularDamping = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ip(c, a);
};
A.prototype.get_allowSleep = function() {
  return !!Ci(this.a);
};
A.prototype.set_allowSleep = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ri(c, a);
};
A.prototype.get_awake = function() {
  return !!Tn(this.a);
};
A.prototype.set_awake = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  cl(c, a);
};
A.prototype.get_fixedRotation = function() {
  return !!hn(this.a);
};
A.prototype.set_fixedRotation = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Yj(c, a);
};
A.prototype.get_bullet = function() {
  return !!Xe(this.a);
};
A.prototype.set_bullet = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  sm(c, a);
};
A.prototype.get_active = function() {
  return !!Pi(this.a);
};
A.prototype.set_active = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  yj(c, a);
};
A.prototype.get_userData = function() {
  return Cu(this.a);
};
A.prototype.set_userData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ii(c, a);
};
A.prototype.get_gravityScale = function() {
  return jf(this.a);
};
A.prototype.set_gravityScale = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Xd(c, a);
};
A.prototype.__destroy__ = function() {
  vr(this.a);
};
function tw() {
  this.a = wf();
  k(tw)[this.a] = this;
}
tw.prototype = Object.create(hw.prototype);
tw.prototype.constructor = tw;
tw.prototype.b = tw;
tw.c = {};
b.JSRayCastCallback = tw;
tw.prototype.ReportFixture = function(a, c, d, e) {
  var g = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  e && "object" === typeof e && (e = e.a);
  return He(g, a, c, d, e);
};
tw.prototype.__destroy__ = function() {
  go(this.a);
};
function uw() {
  throw "cannot construct a b2ContactFeature, no constructor in IDL";
}
uw.prototype = Object.create(h.prototype);
uw.prototype.constructor = uw;
uw.prototype.b = uw;
uw.c = {};
b.b2ContactFeature = uw;
uw.prototype.get_indexA = function() {
  return Gg(this.a);
};
uw.prototype.set_indexA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  wu(c, a);
};
uw.prototype.get_indexB = function() {
  return dg(this.a);
};
uw.prototype.set_indexB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  iq(c, a);
};
uw.prototype.get_typeA = function() {
  return jl(this.a);
};
uw.prototype.set_typeA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  nm(c, a);
};
uw.prototype.get_typeB = function() {
  return Go(this.a);
};
uw.prototype.set_typeB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Xi(c, a);
};
uw.prototype.__destroy__ = function() {
  bp(this.a);
};
function r(a, c) {
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  this.a = void 0 === a ? Bg() : void 0 === c ? _emscripten_bind_b2Vec2_b2Vec2_1(a) : Zj(a, c);
  k(r)[this.a] = this;
}
r.prototype = Object.create(h.prototype);
r.prototype.constructor = r;
r.prototype.b = r;
r.c = {};
b.b2Vec2 = r;
r.prototype.SetZero = function() {
  zq(this.a);
};
r.prototype.Set = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  So(d, a, c);
};
r.prototype.op_add = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  df(c, a);
};
r.prototype.op_sub = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Eg(c, a);
};
r.prototype.op_mul = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  wi(c, a);
};
r.prototype.Length = function() {
  return yq(this.a);
};
r.prototype.LengthSquared = function() {
  return vv(this.a);
};
r.prototype.Normalize = function() {
  return sf(this.a);
};
r.prototype.IsValid = function() {
  return !!tp(this.a);
};
r.prototype.Skew = function() {
  return n(Vq(this.a), r);
};
r.prototype.get_x = function() {
  return ni(this.a);
};
r.prototype.set_x = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Wt(c, a);
};
r.prototype.get_y = function() {
  return dl(this.a);
};
r.prototype.set_y = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Nr(c, a);
};
r.prototype.__destroy__ = function() {
  Zt(this.a);
};
function w(a, c, d) {
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  this.a = void 0 === a ? Dk() : void 0 === c ? _emscripten_bind_b2Vec3_b2Vec3_1(a) : void 0 === d ? _emscripten_bind_b2Vec3_b2Vec3_2(a, c) : Nk(a, c, d);
  k(w)[this.a] = this;
}
w.prototype = Object.create(h.prototype);
w.prototype.constructor = w;
w.prototype.b = w;
w.c = {};
b.b2Vec3 = w;
w.prototype.SetZero = function() {
  kf(this.a);
};
w.prototype.Set = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  aj(e, a, c, d);
};
w.prototype.op_add = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  bg(c, a);
};
w.prototype.op_sub = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  pn(c, a);
};
w.prototype.op_mul = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ju(c, a);
};
w.prototype.get_x = function() {
  return ad(this.a);
};
w.prototype.set_x = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  xl(c, a);
};
w.prototype.get_y = function() {
  return bt(this.a);
};
w.prototype.set_y = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  hp(c, a);
};
w.prototype.get_z = function() {
  return $l(this.a);
};
w.prototype.set_z = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ql(c, a);
};
w.prototype.__destroy__ = function() {
  $g(this.a);
};
function pw() {
  this.a = Un();
  k(pw)[this.a] = this;
}
pw.prototype = Object.create(h.prototype);
pw.prototype.constructor = pw;
pw.prototype.b = pw;
pw.c = {};
b.b2AABB = pw;
pw.prototype.IsValid = function() {
  return !!sn(this.a);
};
pw.prototype.GetCenter = function() {
  return n(Dh(this.a), r);
};
pw.prototype.GetExtents = function() {
  return n(Yg(this.a), r);
};
pw.prototype.GetPerimeter = function() {
  return Jg(this.a);
};
pw.prototype.Combine = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  void 0 === c ? jp(d, a) : Ai(d, a, c);
};
pw.prototype.Contains = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return !!ie(c, a);
};
pw.prototype.RayCast = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  return !!Mj(d, a, c);
};
pw.prototype.get_lowerBound = function() {
  return n($d(this.a), r);
};
pw.prototype.set_lowerBound = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  up(c, a);
};
pw.prototype.get_upperBound = function() {
  return n(re(this.a), r);
};
pw.prototype.set_upperBound = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ge(c, a);
};
pw.prototype.__destroy__ = function() {
  cn(this.a);
};
function vw() {
  this.a = tj();
  k(vw)[this.a] = this;
}
vw.prototype = Object.create(h.prototype);
vw.prototype.constructor = vw;
vw.prototype.b = vw;
vw.c = {};
b.b2FixtureDef = vw;
vw.prototype.get_shape = function() {
  return n(Xs(this.a), u);
};
vw.prototype.set_shape = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Sg(c, a);
};
vw.prototype.get_userData = function() {
  return Jd(this.a);
};
vw.prototype.set_userData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  sc(c, a);
};
vw.prototype.get_friction = function() {
  return ys(this.a);
};
vw.prototype.set_friction = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Dl(c, a);
};
vw.prototype.get_restitution = function() {
  return qk(this.a);
};
vw.prototype.set_restitution = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Kc(c, a);
};
vw.prototype.get_density = function() {
  return Hm(this.a);
};
vw.prototype.set_density = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Zr(c, a);
};
vw.prototype.get_isSensor = function() {
  return !!Df(this.a);
};
vw.prototype.set_isSensor = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Aj(c, a);
};
vw.prototype.get_filter = function() {
  return n(qc(this.a), ow);
};
vw.prototype.set_filter = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  oh(c, a);
};
vw.prototype.__destroy__ = function() {
  Nu(this.a);
};
function B() {
  this.a = Ak();
  k(B)[this.a] = this;
}
B.prototype = Object.create(t.prototype);
B.prototype.constructor = B;
B.prototype.b = B;
B.c = {};
b.b2FrictionJointDef = B;
B.prototype.Initialize = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  cr(e, a, c, d);
};
B.prototype.get_localAnchorA = function() {
  return n(Ve(this.a), r);
};
B.prototype.set_localAnchorA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  uf(c, a);
};
B.prototype.get_localAnchorB = function() {
  return n(Je(this.a), r);
};
B.prototype.set_localAnchorB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  cj(c, a);
};
B.prototype.get_maxForce = function() {
  return Ul(this.a);
};
B.prototype.set_maxForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  fm(c, a);
};
B.prototype.get_maxTorque = function() {
  return ld(this.a);
};
B.prototype.set_maxTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  wr(c, a);
};
B.prototype.get_type = function() {
  return rc(this.a);
};
B.prototype.set_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  br(c, a);
};
B.prototype.get_userData = function() {
  return rh(this.a);
};
B.prototype.set_userData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  fc(c, a);
};
B.prototype.get_bodyA = function() {
  return n(st(this.a), q);
};
B.prototype.set_bodyA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  wv(c, a);
};
B.prototype.get_bodyB = function() {
  return n(gf(this.a), q);
};
B.prototype.set_bodyB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Sp(c, a);
};
B.prototype.get_collideConnected = function() {
  return !!dr(this.a);
};
B.prototype.set_collideConnected = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ld(c, a);
};
B.prototype.__destroy__ = function() {
  Fh(this.a);
};
function ww() {
  this.a = Ip();
  k(ww)[this.a] = this;
}
ww.prototype = Object.create(h.prototype);
ww.prototype.constructor = ww;
ww.prototype.b = ww;
ww.c = {};
b.b2Manifold = ww;
ww.prototype.get_localNormal = function() {
  return n(Ck(this.a), r);
};
ww.prototype.set_localNormal = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Pq(c, a);
};
ww.prototype.get_localPoint = function() {
  return n(Up(this.a), r);
};
ww.prototype.set_localPoint = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  qm(c, a);
};
ww.prototype.get_type = function() {
  return ak(this.a);
};
ww.prototype.set_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Mk(c, a);
};
ww.prototype.get_pointCount = function() {
  return zf(this.a);
};
ww.prototype.set_pointCount = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Hk(c, a);
};
ww.prototype.__destroy__ = function() {
  pg(this.a);
};
function C() {
  this.a = Oi();
  k(C)[this.a] = this;
}
C.prototype = Object.create(t.prototype);
C.prototype.constructor = C;
C.prototype.b = C;
C.c = {};
b.b2PrismaticJointDef = C;
C.prototype.Initialize = function(a, c, d, e) {
  var g = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  e && "object" === typeof e && (e = e.a);
  Ef(g, a, c, d, e);
};
C.prototype.get_localAnchorA = function() {
  return n(xi(this.a), r);
};
C.prototype.set_localAnchorA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  zs(c, a);
};
C.prototype.get_localAnchorB = function() {
  return n(Ce(this.a), r);
};
C.prototype.set_localAnchorB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  io(c, a);
};
C.prototype.get_localAxisA = function() {
  return n(Kt(this.a), r);
};
C.prototype.set_localAxisA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Rt(c, a);
};
C.prototype.get_referenceAngle = function() {
  return Np(this.a);
};
C.prototype.set_referenceAngle = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  mh(c, a);
};
C.prototype.get_enableLimit = function() {
  return !!es(this.a);
};
C.prototype.set_enableLimit = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  rl(c, a);
};
C.prototype.get_lowerTranslation = function() {
  return Md(this.a);
};
C.prototype.set_lowerTranslation = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  od(c, a);
};
C.prototype.get_upperTranslation = function() {
  return Fd(this.a);
};
C.prototype.set_upperTranslation = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  $k(c, a);
};
C.prototype.get_enableMotor = function() {
  return !!Ir(this.a);
};
C.prototype.set_enableMotor = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Uq(c, a);
};
C.prototype.get_maxMotorForce = function() {
  return Dv(this.a);
};
C.prototype.set_maxMotorForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ru(c, a);
};
C.prototype.get_motorSpeed = function() {
  return cc(this.a);
};
C.prototype.set_motorSpeed = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  jn(c, a);
};
C.prototype.get_type = function() {
  return Jv(this.a);
};
C.prototype.set_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ch(c, a);
};
C.prototype.get_userData = function() {
  return Wi(this.a);
};
C.prototype.set_userData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ar(c, a);
};
C.prototype.get_bodyA = function() {
  return n(or(this.a), q);
};
C.prototype.set_bodyA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  qo(c, a);
};
C.prototype.get_bodyB = function() {
  return n(wk(this.a), q);
};
C.prototype.set_bodyB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  zk(c, a);
};
C.prototype.get_collideConnected = function() {
  return !!tl(this.a);
};
C.prototype.set_collideConnected = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Nm(c, a);
};
C.prototype.__destroy__ = function() {
  fe(this.a);
};
function D(a) {
  a && "object" === typeof a && (a = a.a);
  this.a = Qh(a);
  k(D)[this.a] = this;
}
D.prototype = Object.create(h.prototype);
D.prototype.constructor = D;
D.prototype.b = D;
D.c = {};
b.b2World = D;
D.prototype.SetDestructionListener = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Gu(c, a);
};
D.prototype.SetContactFilter = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Hc(c, a);
};
D.prototype.SetContactListener = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  yd(c, a);
};
D.prototype.SetDebugDraw = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  pf(c, a);
};
D.prototype.CreateBody = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(xq(c, a), q);
};
D.prototype.DestroyBody = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  dd(c, a);
};
D.prototype.CreateJoint = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(sg(c, a), p);
};
D.prototype.DestroyJoint = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Bq(c, a);
};
D.prototype.Step = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  Jj(e, a, c, d);
};
D.prototype.ClearForces = function() {
  Zg(this.a);
};
D.prototype.DrawDebugData = function() {
  wm(this.a);
};
D.prototype.QueryAABB = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  Au(d, a, c);
};
D.prototype.RayCast = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  ms(e, a, c, d);
};
D.prototype.GetBodyList = function() {
  return n(is(this.a), q);
};
D.prototype.GetJointList = function() {
  return n(Kq(this.a), p);
};
D.prototype.GetContactList = function() {
  return n(pt(this.a), E);
};
D.prototype.SetAllowSleeping = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Jo(c, a);
};
D.prototype.GetAllowSleeping = function() {
  return !!Wh(this.a);
};
D.prototype.SetWarmStarting = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  wc(c, a);
};
D.prototype.GetWarmStarting = function() {
  return !!ro(this.a);
};
D.prototype.SetContinuousPhysics = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  bm(c, a);
};
D.prototype.GetContinuousPhysics = function() {
  return !!Su(this.a);
};
D.prototype.SetSubStepping = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  cf(c, a);
};
D.prototype.GetSubStepping = function() {
  return !!oq(this.a);
};
D.prototype.GetProxyCount = function() {
  return ud(this.a);
};
D.prototype.GetBodyCount = function() {
  return Gl(this.a);
};
D.prototype.GetJointCount = function() {
  return Zm(this.a);
};
D.prototype.GetContactCount = function() {
  return Zp(this.a);
};
D.prototype.GetTreeHeight = function() {
  return kr(this.a);
};
D.prototype.GetTreeBalance = function() {
  return mc(this.a);
};
D.prototype.GetTreeQuality = function() {
  return Wd(this.a);
};
D.prototype.SetGravity = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ms(c, a);
};
D.prototype.GetGravity = function() {
  return n(Oc(this.a), r);
};
D.prototype.IsLocked = function() {
  return !!hc(this.a);
};
D.prototype.SetAutoClearForces = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  nd(c, a);
};
D.prototype.GetAutoClearForces = function() {
  return !!Vj(this.a);
};
D.prototype.GetProfile = function() {
  return n(kt(this.a), z);
};
D.prototype.Dump = function() {
  Vr(this.a);
};
D.prototype.__destroy__ = function() {
  yn(this.a);
};
function F() {
  throw "cannot construct a b2PrismaticJoint, no constructor in IDL";
}
F.prototype = Object.create(p.prototype);
F.prototype.constructor = F;
F.prototype.b = F;
F.c = {};
b.b2PrismaticJoint = F;
F.prototype.GetLocalAnchorA = function() {
  return n(ll(this.a), r);
};
F.prototype.GetLocalAnchorB = function() {
  return n(Do(this.a), r);
};
F.prototype.GetLocalAxisA = function() {
  return n(vh(this.a), r);
};
F.prototype.GetReferenceAngle = function() {
  return Qk(this.a);
};
F.prototype.GetJointTranslation = function() {
  return Xf(this.a);
};
F.prototype.GetJointSpeed = function() {
  return Gm(this.a);
};
F.prototype.IsLimitEnabled = function() {
  return !!Rh(this.a);
};
F.prototype.EnableLimit = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Tl(c, a);
};
F.prototype.GetLowerLimit = function() {
  return Zd(this.a);
};
F.prototype.GetUpperLimit = function() {
  return Qj(this.a);
};
F.prototype.SetLimits = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  Sc(d, a, c);
};
F.prototype.IsMotorEnabled = function() {
  return !!Ik(this.a);
};
F.prototype.EnableMotor = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  qq(c, a);
};
F.prototype.SetMotorSpeed = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Or(c, a);
};
F.prototype.GetMotorSpeed = function() {
  return $f(this.a);
};
F.prototype.SetMaxMotorForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Pv(c, a);
};
F.prototype.GetMaxMotorForce = function() {
  return mp(this.a);
};
F.prototype.GetMotorForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return ii(c, a);
};
F.prototype.GetType = function() {
  return ne(this.a);
};
F.prototype.GetBodyA = function() {
  return n(lp(this.a), q);
};
F.prototype.GetBodyB = function() {
  return n(Us(this.a), q);
};
F.prototype.GetAnchorA = function() {
  return n(Gk(this.a), r);
};
F.prototype.GetAnchorB = function() {
  return n(Jl(this.a), r);
};
F.prototype.GetReactionForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(Gh(c, a), r);
};
F.prototype.GetReactionTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return vg(c, a);
};
F.prototype.GetNext = function() {
  return n(mr(this.a), p);
};
F.prototype.GetUserData = function() {
  return cv(this.a);
};
F.prototype.SetUserData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  uj(c, a);
};
F.prototype.IsActive = function() {
  return !!Zl(this.a);
};
F.prototype.GetCollideConnected = function() {
  return !!xg(this.a);
};
F.prototype.__destroy__ = function() {
  Uf(this.a);
};
function xw() {
  throw "cannot construct a b2RayCastOutput, no constructor in IDL";
}
xw.prototype = Object.create(h.prototype);
xw.prototype.constructor = xw;
xw.prototype.b = xw;
xw.c = {};
b.b2RayCastOutput = xw;
xw.prototype.get_normal = function() {
  return n(Af(this.a), r);
};
xw.prototype.set_normal = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  eh(c, a);
};
xw.prototype.get_fraction = function() {
  return bn(this.a);
};
xw.prototype.set_fraction = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  po(c, a);
};
xw.prototype.__destroy__ = function() {
  tm(this.a);
};
function yw() {
  throw "cannot construct a b2ContactID, no constructor in IDL";
}
yw.prototype = Object.create(h.prototype);
yw.prototype.constructor = yw;
yw.prototype.b = yw;
yw.c = {};
b.b2ContactID = yw;
yw.prototype.get_cf = function() {
  return n(Pr(this.a), uw);
};
yw.prototype.set_cf = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Zi(c, a);
};
yw.prototype.get_key = function() {
  return Ho(this.a);
};
yw.prototype.set_key = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  qf(c, a);
};
yw.prototype.__destroy__ = function() {
  El(this.a);
};
function zw() {
  this.a = Rv();
  k(zw)[this.a] = this;
}
zw.prototype = Object.create(iw.prototype);
zw.prototype.constructor = zw;
zw.prototype.b = zw;
zw.c = {};
b.JSContactListener = zw;
zw.prototype.BeginContact = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  On(c, a);
};
zw.prototype.EndContact = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Zc(c, a);
};
zw.prototype.PreSolve = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  ch(d, a, c);
};
zw.prototype.PostSolve = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  Jp(d, a, c);
};
zw.prototype.__destroy__ = function() {
  um(this.a);
};
function Aw(a, c, d, e) {
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  e && "object" === typeof e && (e = e.a);
  this.a = void 0 === a ? nr() : void 0 === c ? _emscripten_bind_b2Mat22_b2Mat22_1(a) : void 0 === d ? lr(a, c) : void 0 === e ? _emscripten_bind_b2Mat22_b2Mat22_3(a, c, d) : Qt(a, c, d, e);
  k(Aw)[this.a] = this;
}
Aw.prototype = Object.create(h.prototype);
Aw.prototype.constructor = Aw;
Aw.prototype.b = Aw;
Aw.c = {};
b.b2Mat22 = Aw;
Aw.prototype.Set = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  Dq(d, a, c);
};
Aw.prototype.SetIdentity = function() {
  Mt(this.a);
};
Aw.prototype.SetZero = function() {
  Nj(this.a);
};
Aw.prototype.GetInverse = function() {
  return n(mq(this.a), Aw);
};
Aw.prototype.Solve = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(uo(c, a), r);
};
Aw.prototype.get_ex = function() {
  return n(Po(this.a), r);
};
Aw.prototype.set_ex = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  uq(c, a);
};
Aw.prototype.get_ey = function() {
  return n(Lt(this.a), r);
};
Aw.prototype.set_ey = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  rr(c, a);
};
Aw.prototype.__destroy__ = function() {
  eu(this.a);
};
function G() {
  this.a = Jt();
  k(G)[this.a] = this;
}
G.prototype = Object.create(t.prototype);
G.prototype.constructor = G;
G.prototype.b = G;
G.c = {};
b.b2WheelJointDef = G;
G.prototype.Initialize = function(a, c, d, e) {
  var g = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  e && "object" === typeof e && (e = e.a);
  Si(g, a, c, d, e);
};
G.prototype.get_localAnchorA = function() {
  return n(Uk(this.a), r);
};
G.prototype.set_localAnchorA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ne(c, a);
};
G.prototype.get_localAnchorB = function() {
  return n(Xm(this.a), r);
};
G.prototype.set_localAnchorB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Bv(c, a);
};
G.prototype.get_localAxisA = function() {
  return n(rq(this.a), r);
};
G.prototype.set_localAxisA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  qv(c, a);
};
G.prototype.get_enableMotor = function() {
  return !!uv(this.a);
};
G.prototype.set_enableMotor = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  sk(c, a);
};
G.prototype.get_maxMotorTorque = function() {
  return Dg(this.a);
};
G.prototype.set_maxMotorTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ek(c, a);
};
G.prototype.get_motorSpeed = function() {
  return hr(this.a);
};
G.prototype.set_motorSpeed = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Oo(c, a);
};
G.prototype.get_frequencyHz = function() {
  return ts(this.a);
};
G.prototype.set_frequencyHz = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  nq(c, a);
};
G.prototype.get_dampingRatio = function() {
  return an(this.a);
};
G.prototype.set_dampingRatio = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Yu(c, a);
};
G.prototype.get_type = function() {
  return ut(this.a);
};
G.prototype.set_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Vd(c, a);
};
G.prototype.get_userData = function() {
  return Eu(this.a);
};
G.prototype.set_userData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ah(c, a);
};
G.prototype.get_bodyA = function() {
  return n(Lv(this.a), q);
};
G.prototype.set_bodyA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  uh(c, a);
};
G.prototype.get_bodyB = function() {
  return n(Sm(this.a), q);
};
G.prototype.set_bodyB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  kp(c, a);
};
G.prototype.get_collideConnected = function() {
  return !!Ic(this.a);
};
G.prototype.set_collideConnected = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Jq(c, a);
};
G.prototype.__destroy__ = function() {
  hf(this.a);
};
function Bw() {
  this.a = Ug();
  k(Bw)[this.a] = this;
}
Bw.prototype = Object.create(u.prototype);
Bw.prototype.constructor = Bw;
Bw.prototype.b = Bw;
Bw.c = {};
b.b2CircleShape = Bw;
Bw.prototype.GetType = function() {
  return kh(this.a);
};
Bw.prototype.GetChildCount = function() {
  return We(this.a);
};
Bw.prototype.TestPoint = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  return !!Qp(d, a, c);
};
Bw.prototype.RayCast = function(a, c, d, e) {
  var g = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  e && "object" === typeof e && (e = e.a);
  return !!Kj(g, a, c, d, e);
};
Bw.prototype.ComputeAABB = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  cs(e, a, c, d);
};
Bw.prototype.ComputeMass = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  Mp(d, a, c);
};
Bw.prototype.get_m_p = function() {
  return n(Fg(this.a), r);
};
Bw.prototype.set_m_p = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ri(c, a);
};
Bw.prototype.get_m_type = function() {
  return sr(this.a);
};
Bw.prototype.set_m_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  De(c, a);
};
Bw.prototype.get_m_radius = function() {
  return Zf(this.a);
};
Bw.prototype.set_m_radius = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ue(c, a);
};
Bw.prototype.__destroy__ = function() {
  Xp(this.a);
};
function H() {
  this.a = iv();
  k(H)[this.a] = this;
}
H.prototype = Object.create(t.prototype);
H.prototype.constructor = H;
H.prototype.b = H;
H.c = {};
b.b2WeldJointDef = H;
H.prototype.Initialize = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  us(e, a, c, d);
};
H.prototype.get_localAnchorA = function() {
  return n(Cs(this.a), r);
};
H.prototype.set_localAnchorA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ti(c, a);
};
H.prototype.get_localAnchorB = function() {
  return n(Ft(this.a), r);
};
H.prototype.set_localAnchorB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Sr(c, a);
};
H.prototype.get_referenceAngle = function() {
  return Wn(this.a);
};
H.prototype.set_referenceAngle = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Gt(c, a);
};
H.prototype.get_frequencyHz = function() {
  return ng(this.a);
};
H.prototype.set_frequencyHz = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Sq(c, a);
};
H.prototype.get_dampingRatio = function() {
  return Bp(this.a);
};
H.prototype.set_dampingRatio = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ti(c, a);
};
H.prototype.get_type = function() {
  return To(this.a);
};
H.prototype.set_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Br(c, a);
};
H.prototype.get_userData = function() {
  return Zs(this.a);
};
H.prototype.set_userData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Co(c, a);
};
H.prototype.get_bodyA = function() {
  return n(lq(this.a), q);
};
H.prototype.set_bodyA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Pe(c, a);
};
H.prototype.get_bodyB = function() {
  return n(Ru(this.a), q);
};
H.prototype.set_bodyB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Iu(c, a);
};
H.prototype.get_collideConnected = function() {
  return !!oi(this.a);
};
H.prototype.set_collideConnected = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  jd(c, a);
};
H.prototype.__destroy__ = function() {
  to(this.a);
};
function Cw() {
  this.a = gp();
  k(Cw)[this.a] = this;
}
Cw.prototype = Object.create(h.prototype);
Cw.prototype.constructor = Cw;
Cw.prototype.b = Cw;
Cw.c = {};
b.b2MassData = Cw;
Cw.prototype.get_mass = function() {
  return mv(this.a);
};
Cw.prototype.set_mass = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  $c(c, a);
};
Cw.prototype.get_center = function() {
  return n($e(this.a), r);
};
Cw.prototype.set_center = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  cq(c, a);
};
Cw.prototype.get_I = function() {
  return gr(this.a);
};
Cw.prototype.set_I = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ns(c, a);
};
Cw.prototype.__destroy__ = function() {
  ps(this.a);
};
function I() {
  throw "cannot construct a b2GearJoint, no constructor in IDL";
}
I.prototype = Object.create(p.prototype);
I.prototype.constructor = I;
I.prototype.b = I;
I.c = {};
b.b2GearJoint = I;
I.prototype.GetJoint1 = function() {
  return n(td(this.a), p);
};
I.prototype.GetJoint2 = function() {
  return n(xk(this.a), p);
};
I.prototype.SetRatio = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  dn(c, a);
};
I.prototype.GetRatio = function() {
  return Ed(this.a);
};
I.prototype.GetType = function() {
  return Zu(this.a);
};
I.prototype.GetBodyA = function() {
  return n(Rl(this.a), q);
};
I.prototype.GetBodyB = function() {
  return n(Vp(this.a), q);
};
I.prototype.GetAnchorA = function() {
  return n(wd(this.a), r);
};
I.prototype.GetAnchorB = function() {
  return n(At(this.a), r);
};
I.prototype.GetReactionForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(Li(c, a), r);
};
I.prototype.GetReactionTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return id(c, a);
};
I.prototype.GetNext = function() {
  return n(ou(this.a), p);
};
I.prototype.GetUserData = function() {
  return xe(this.a);
};
I.prototype.SetUserData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  pl(c, a);
};
I.prototype.IsActive = function() {
  return !!ki(this.a);
};
I.prototype.GetCollideConnected = function() {
  return !!Nd(this.a);
};
I.prototype.__destroy__ = function() {
  Wf(this.a);
};
function J() {
  throw "cannot construct a b2WeldJoint, no constructor in IDL";
}
J.prototype = Object.create(p.prototype);
J.prototype.constructor = J;
J.prototype.b = J;
J.c = {};
b.b2WeldJoint = J;
J.prototype.GetLocalAnchorA = function() {
  return n(Yt(this.a), r);
};
J.prototype.GetLocalAnchorB = function() {
  return n(Wp(this.a), r);
};
J.prototype.SetFrequency = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  bh(c, a);
};
J.prototype.GetFrequency = function() {
  return Jk(this.a);
};
J.prototype.SetDampingRatio = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ee(c, a);
};
J.prototype.GetDampingRatio = function() {
  return $r(this.a);
};
J.prototype.Dump = function() {
  ko(this.a);
};
J.prototype.GetType = function() {
  return Zn(this.a);
};
J.prototype.GetBodyA = function() {
  return n(Bf(this.a), q);
};
J.prototype.GetBodyB = function() {
  return n(af(this.a), q);
};
J.prototype.GetAnchorA = function() {
  return n(Gp(this.a), r);
};
J.prototype.GetAnchorB = function() {
  return n(Fq(this.a), r);
};
J.prototype.GetReactionForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(Lr(c, a), r);
};
J.prototype.GetReactionTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return Dc(c, a);
};
J.prototype.GetNext = function() {
  return n(Yn(this.a), p);
};
J.prototype.GetUserData = function() {
  return Tk(this.a);
};
J.prototype.SetUserData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  fi(c, a);
};
J.prototype.IsActive = function() {
  return !!yc(this.a);
};
J.prototype.GetCollideConnected = function() {
  return !!kq(this.a);
};
J.prototype.__destroy__ = function() {
  Hp(this.a);
};
function Dw() {
  this.a = rt();
  k(Dw)[this.a] = this;
}
Dw.prototype = Object.create(h.prototype);
Dw.prototype.constructor = Dw;
Dw.prototype.b = Dw;
Dw.c = {};
b.b2JointEdge = Dw;
Dw.prototype.get_other = function() {
  return n(no(this.a), q);
};
Dw.prototype.set_other = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ad(c, a);
};
Dw.prototype.get_joint = function() {
  return n(Lu(this.a), p);
};
Dw.prototype.set_joint = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  uc(c, a);
};
Dw.prototype.get_prev = function() {
  return n(Hl(this.a), Dw);
};
Dw.prototype.set_prev = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ug(c, a);
};
Dw.prototype.get_next = function() {
  return n(Qn(this.a), Dw);
};
Dw.prototype.set_next = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Eq(c, a);
};
Dw.prototype.__destroy__ = function() {
  Mn(this.a);
};
function K() {
  this.a = ep();
  k(K)[this.a] = this;
}
K.prototype = Object.create(t.prototype);
K.prototype.constructor = K;
K.prototype.b = K;
K.c = {};
b.b2PulleyJointDef = K;
K.prototype.Initialize = function(a, c, d, e, g, m, l) {
  var O = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  e && "object" === typeof e && (e = e.a);
  g && "object" === typeof g && (g = g.a);
  m && "object" === typeof m && (m = m.a);
  l && "object" === typeof l && (l = l.a);
  Vu(O, a, c, d, e, g, m, l);
};
K.prototype.get_groundAnchorA = function() {
  return n(ph(this.a), r);
};
K.prototype.set_groundAnchorA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Nv(c, a);
};
K.prototype.get_groundAnchorB = function() {
  return n(fj(this.a), r);
};
K.prototype.set_groundAnchorB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  xr(c, a);
};
K.prototype.get_localAnchorA = function() {
  return n(Tc(this.a), r);
};
K.prototype.set_localAnchorA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Pp(c, a);
};
K.prototype.get_localAnchorB = function() {
  return n(Ss(this.a), r);
};
K.prototype.set_localAnchorB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Id(c, a);
};
K.prototype.get_lengthA = function() {
  return wl(this.a);
};
K.prototype.set_lengthA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  qg(c, a);
};
K.prototype.get_lengthB = function() {
  return ei(this.a);
};
K.prototype.set_lengthB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ke(c, a);
};
K.prototype.get_ratio = function() {
  return Be(this.a);
};
K.prototype.set_ratio = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  tg(c, a);
};
K.prototype.get_type = function() {
  return yl(this.a);
};
K.prototype.set_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Vk(c, a);
};
K.prototype.get_userData = function() {
  return yk(this.a);
};
K.prototype.set_userData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  em(c, a);
};
K.prototype.get_bodyA = function() {
  return n(Rc(this.a), q);
};
K.prototype.set_bodyA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Gv(c, a);
};
K.prototype.get_bodyB = function() {
  return n(Tg(this.a), q);
};
K.prototype.set_bodyB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Gf(c, a);
};
K.prototype.get_collideConnected = function() {
  return !!Qv(this.a);
};
K.prototype.set_collideConnected = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  wt(c, a);
};
K.prototype.__destroy__ = function() {
  Fi(this.a);
};
function Ew() {
  this.a = Xh();
  k(Ew)[this.a] = this;
}
Ew.prototype = Object.create(h.prototype);
Ew.prototype.constructor = Ew;
Ew.prototype.b = Ew;
Ew.c = {};
b.b2ManifoldPoint = Ew;
Ew.prototype.get_localPoint = function() {
  return n(Zq(this.a), r);
};
Ew.prototype.set_localPoint = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  gs(c, a);
};
Ew.prototype.get_normalImpulse = function() {
  return Cj(this.a);
};
Ew.prototype.set_normalImpulse = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Jh(c, a);
};
Ew.prototype.get_tangentImpulse = function() {
  return zp(this.a);
};
Ew.prototype.set_tangentImpulse = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Bi(c, a);
};
Ew.prototype.get_id = function() {
  return n(Yf(this.a), yw);
};
Ew.prototype.set_id = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Mo(c, a);
};
Ew.prototype.__destroy__ = function() {
  vq(this.a);
};
function Fw(a, c) {
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  this.a = void 0 === a ? Hh() : void 0 === c ? _emscripten_bind_b2Transform_b2Transform_1(a) : Kr(a, c);
  k(Fw)[this.a] = this;
}
Fw.prototype = Object.create(h.prototype);
Fw.prototype.constructor = Fw;
Fw.prototype.b = Fw;
Fw.c = {};
b.b2Transform = Fw;
Fw.prototype.SetIdentity = function() {
  dq(this.a);
};
Fw.prototype.Set = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  xh(d, a, c);
};
Fw.prototype.get_p = function() {
  return n(it(this.a), r);
};
Fw.prototype.set_p = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ju(c, a);
};
Fw.prototype.get_q = function() {
  return n(qd(this.a), rw);
};
Fw.prototype.set_q = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  pe(c, a);
};
Fw.prototype.__destroy__ = function() {
  se(this.a);
};
function L() {
  this.a = Ui();
  k(L)[this.a] = this;
}
L.prototype = Object.create(u.prototype);
L.prototype.constructor = L;
L.prototype.b = L;
L.c = {};
b.b2ChainShape = L;
L.prototype.CreateLoop = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  gi(d, a, c);
};
L.prototype.CreateChain = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  bd(d, a, c);
};
L.prototype.SetPrevVertex = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  kn(c, a);
};
L.prototype.SetNextVertex = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  An(c, a);
};
L.prototype.GetChildEdge = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  Fs(d, a, c);
};
L.prototype.GetType = function() {
  return Pl(this.a);
};
L.prototype.GetChildCount = function() {
  return rd(this.a);
};
L.prototype.TestPoint = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  return !!Pk(d, a, c);
};
L.prototype.RayCast = function(a, c, d, e) {
  var g = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  e && "object" === typeof e && (e = e.a);
  return !!Mr(g, a, c, d, e);
};
L.prototype.ComputeAABB = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  Bc(e, a, c, d);
};
L.prototype.ComputeMass = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  hv(d, a, c);
};
L.prototype.get_m_vertices = function() {
  return n(nc(this.a), r);
};
L.prototype.set_m_vertices = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  vf(c, a);
};
L.prototype.get_m_count = function() {
  return bc(this.a);
};
L.prototype.set_m_count = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Is(c, a);
};
L.prototype.get_m_prevVertex = function() {
  return n(Xg(this.a), r);
};
L.prototype.set_m_prevVertex = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Yq(c, a);
};
L.prototype.get_m_nextVertex = function() {
  return n(mf(this.a), r);
};
L.prototype.set_m_nextVertex = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Yc(c, a);
};
L.prototype.get_m_hasPrevVertex = function() {
  return !!$q(this.a);
};
L.prototype.set_m_hasPrevVertex = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Sf(c, a);
};
L.prototype.get_m_hasNextVertex = function() {
  return !!zn(this.a);
};
L.prototype.set_m_hasNextVertex = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  qr(c, a);
};
L.prototype.get_m_type = function() {
  return ej(this.a);
};
L.prototype.set_m_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  hg(c, a);
};
L.prototype.get_m_radius = function() {
  return Rr(this.a);
};
L.prototype.set_m_radius = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Tr(c, a);
};
L.prototype.__destroy__ = function() {
  ol(this.a);
};
function Gw(a, c, d) {
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  this.a = void 0 === a ? ss() : void 0 === c ? _emscripten_bind_b2Color_b2Color_1(a) : void 0 === d ? _emscripten_bind_b2Color_b2Color_2(a, c) : rs(a, c, d);
  k(Gw)[this.a] = this;
}
Gw.prototype = Object.create(h.prototype);
Gw.prototype.constructor = Gw;
Gw.prototype.b = Gw;
Gw.c = {};
b.b2Color = Gw;
Gw.prototype.Set = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  Kv(e, a, c, d);
};
Gw.prototype.get_r = function() {
  return sv(this.a);
};
Gw.prototype.set_r = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Sd(c, a);
};
Gw.prototype.get_g = function() {
  return vo(this.a);
};
Gw.prototype.set_g = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  kc(c, a);
};
Gw.prototype.get_b = function() {
  return as(this.a);
};
Gw.prototype.set_b = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ye(c, a);
};
Gw.prototype.__destroy__ = function() {
  cp(this.a);
};
function M() {
  throw "cannot construct a b2RopeJoint, no constructor in IDL";
}
M.prototype = Object.create(p.prototype);
M.prototype.constructor = M;
M.prototype.b = M;
M.c = {};
b.b2RopeJoint = M;
M.prototype.GetLocalAnchorA = function() {
  return n(Lq(this.a), r);
};
M.prototype.GetLocalAnchorB = function() {
  return n(Ei(this.a), r);
};
M.prototype.SetMaxLength = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Vv(c, a);
};
M.prototype.GetMaxLength = function() {
  return we(this.a);
};
M.prototype.GetLimitState = function() {
  return zg(this.a);
};
M.prototype.GetType = function() {
  return Ko(this.a);
};
M.prototype.GetBodyA = function() {
  return n(vu(this.a), q);
};
M.prototype.GetBodyB = function() {
  return n(sq(this.a), q);
};
M.prototype.GetAnchorA = function() {
  return n(yi(this.a), r);
};
M.prototype.GetAnchorB = function() {
  return n(Fe(this.a), r);
};
M.prototype.GetReactionForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(ds(c, a), r);
};
M.prototype.GetReactionTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return Xu(c, a);
};
M.prototype.GetNext = function() {
  return n(xo(this.a), p);
};
M.prototype.GetUserData = function() {
  return cd(this.a);
};
M.prototype.SetUserData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Gr(c, a);
};
M.prototype.IsActive = function() {
  return !!Bt(this.a);
};
M.prototype.GetCollideConnected = function() {
  return !!xt(this.a);
};
M.prototype.__destroy__ = function() {
  Aq(this.a);
};
function Hw() {
  throw "cannot construct a b2RayCastInput, no constructor in IDL";
}
Hw.prototype = Object.create(h.prototype);
Hw.prototype.constructor = Hw;
Hw.prototype.b = Hw;
Hw.c = {};
b.b2RayCastInput = Hw;
Hw.prototype.get_p1 = function() {
  return n(Zo(this.a), r);
};
Hw.prototype.set_p1 = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Gj(c, a);
};
Hw.prototype.get_p2 = function() {
  return n(Rk(this.a), r);
};
Hw.prototype.set_p2 = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  xf(c, a);
};
Hw.prototype.get_maxFraction = function() {
  return Ql(this.a);
};
Hw.prototype.set_maxFraction = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Rn(c, a);
};
Hw.prototype.__destroy__ = function() {
  Le(this.a);
};
function N() {
  this.a = Ji();
  k(N)[this.a] = this;
}
N.prototype = Object.create(u.prototype);
N.prototype.constructor = N;
N.prototype.b = N;
N.c = {};
b.b2PolygonShape = N;
N.prototype.Set = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  Ki(d, a, c);
};
N.prototype.SetAsBox = function(a, c, d, e) {
  var g = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  e && "object" === typeof e && (e = e.a);
  void 0 === d ? Iv(g, a, c) : void 0 === e ? _emscripten_bind_b2PolygonShape_SetAsBox_3(g, a, c, d) : St(g, a, c, d, e);
};
N.prototype.GetVertexCount = function() {
  return rp(this.a);
};
N.prototype.GetVertex = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(Ls(c, a), r);
};
N.prototype.GetType = function() {
  return lh(this.a);
};
N.prototype.GetChildCount = function() {
  return zo(this.a);
};
N.prototype.TestPoint = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  return !!Hi(d, a, c);
};
N.prototype.RayCast = function(a, c, d, e) {
  var g = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  e && "object" === typeof e && (e = e.a);
  return !!lc(g, a, c, d, e);
};
N.prototype.ComputeAABB = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  il(e, a, c, d);
};
N.prototype.ComputeMass = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  Zk(d, a, c);
};
N.prototype.get_m_centroid = function() {
  return n(nl(this.a), r);
};
N.prototype.set_m_centroid = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Iq(c, a);
};
N.prototype.get_m_vertexCount = function() {
  return lu(this.a);
};
N.prototype.set_m_vertexCount = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  pu(c, a);
};
N.prototype.get_m_type = function() {
  return Ov(this.a);
};
N.prototype.set_m_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ku(c, a);
};
N.prototype.get_m_radius = function() {
  return nj(this.a);
};
N.prototype.set_m_radius = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Tv(c, a);
};
N.prototype.__destroy__ = function() {
  qe(this.a);
};
function P() {
  this.a = Dp();
  k(P)[this.a] = this;
}
P.prototype = Object.create(u.prototype);
P.prototype.constructor = P;
P.prototype.b = P;
P.c = {};
b.b2EdgeShape = P;
P.prototype.Set = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  zj(d, a, c);
};
P.prototype.GetType = function() {
  return tq(this.a);
};
P.prototype.GetChildCount = function() {
  return zh(this.a);
};
P.prototype.TestPoint = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  return !!ml(d, a, c);
};
P.prototype.RayCast = function(a, c, d, e) {
  var g = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  e && "object" === typeof e && (e = e.a);
  return !!qi(g, a, c, d, e);
};
P.prototype.ComputeAABB = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  Hq(e, a, c, d);
};
P.prototype.ComputeMass = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  Qm(d, a, c);
};
P.prototype.get_m_vertex1 = function() {
  return n(bl(this.a), r);
};
P.prototype.set_m_vertex1 = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Tt(c, a);
};
P.prototype.get_m_vertex2 = function() {
  return n(Pn(this.a), r);
};
P.prototype.set_m_vertex2 = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  fq(c, a);
};
P.prototype.get_m_vertex0 = function() {
  return n(li(this.a), r);
};
P.prototype.set_m_vertex0 = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  $u(c, a);
};
P.prototype.get_m_vertex3 = function() {
  return n(bq(this.a), r);
};
P.prototype.set_m_vertex3 = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  zt(c, a);
};
P.prototype.get_m_hasVertex0 = function() {
  return !!Fl(this.a);
};
P.prototype.set_m_hasVertex0 = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ve(c, a);
};
P.prototype.get_m_hasVertex3 = function() {
  return !!vj(this.a);
};
P.prototype.set_m_hasVertex3 = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  tc(c, a);
};
P.prototype.get_m_type = function() {
  return yo(this.a);
};
P.prototype.set_m_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Yh(c, a);
};
P.prototype.get_m_radius = function() {
  return fv(this.a);
};
P.prototype.set_m_radius = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ke(c, a);
};
P.prototype.__destroy__ = function() {
  Yp(this.a);
};
function Iw() {
  this.a = Xr();
  k(Iw)[this.a] = this;
}
Iw.prototype = Object.create(kw.prototype);
Iw.prototype.constructor = Iw;
Iw.prototype.b = Iw;
Iw.c = {};
b.JSContactFilter = Iw;
Iw.prototype.ShouldCollide = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  return !!Dj(d, a, c);
};
Iw.prototype.__destroy__ = function() {
  lj(this.a);
};
function R() {
  this.a = mm();
  k(R)[this.a] = this;
}
R.prototype = Object.create(t.prototype);
R.prototype.constructor = R;
R.prototype.b = R;
R.c = {};
b.b2RevoluteJointDef = R;
R.prototype.Initialize = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  pj(e, a, c, d);
};
R.prototype.get_localAnchorA = function() {
  return n(Pm(this.a), r);
};
R.prototype.set_localAnchorA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  bj(c, a);
};
R.prototype.get_localAnchorB = function() {
  return n(jj(this.a), r);
};
R.prototype.set_localAnchorB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Um(c, a);
};
R.prototype.get_referenceAngle = function() {
  return kj(this.a);
};
R.prototype.set_referenceAngle = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ap(c, a);
};
R.prototype.get_enableLimit = function() {
  return !!pm(this.a);
};
R.prototype.set_enableLimit = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  so(c, a);
};
R.prototype.get_lowerAngle = function() {
  return Lk(this.a);
};
R.prototype.set_lowerAngle = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ln(c, a);
};
R.prototype.get_upperAngle = function() {
  return np(this.a);
};
R.prototype.set_upperAngle = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ml(c, a);
};
R.prototype.get_enableMotor = function() {
  return !!mj(this.a);
};
R.prototype.set_enableMotor = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  $h(c, a);
};
R.prototype.get_motorSpeed = function() {
  return yf(this.a);
};
R.prototype.set_motorSpeed = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  tv(c, a);
};
R.prototype.get_maxMotorTorque = function() {
  return Ap(this.a);
};
R.prototype.set_maxMotorTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Hu(c, a);
};
R.prototype.get_type = function() {
  return Nl(this.a);
};
R.prototype.set_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Fj(c, a);
};
R.prototype.get_userData = function() {
  return Lm(this.a);
};
R.prototype.set_userData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Gc(c, a);
};
R.prototype.get_bodyA = function() {
  return n(Ts(this.a), q);
};
R.prototype.set_bodyA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  th(c, a);
};
R.prototype.get_bodyB = function() {
  return n(sj(this.a), q);
};
R.prototype.set_bodyB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Mh(c, a);
};
R.prototype.get_collideConnected = function() {
  return !!yr(this.a);
};
R.prototype.set_collideConnected = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Es(c, a);
};
R.prototype.__destroy__ = function() {
  Eo(this.a);
};
function Jw() {
  this.a = gt();
  k(Jw)[this.a] = this;
}
Jw.prototype = Object.create(gw.prototype);
Jw.prototype.constructor = Jw;
Jw.prototype.b = Jw;
Jw.c = {};
b.JSDraw = Jw;
Jw.prototype.DrawPolygon = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  en(e, a, c, d);
};
Jw.prototype.DrawSolidPolygon = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  Jf(e, a, c, d);
};
Jw.prototype.DrawCircle = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  xc(e, a, c, d);
};
Jw.prototype.DrawSolidCircle = function(a, c, d, e) {
  var g = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  e && "object" === typeof e && (e = e.a);
  oc(g, a, c, d, e);
};
Jw.prototype.DrawSegment = function(a, c, d) {
  var e = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  ef(e, a, c, d);
};
Jw.prototype.DrawTransform = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  gj(c, a);
};
Jw.prototype.__destroy__ = function() {
  Mf(this.a);
};
function S() {
  throw "cannot construct a b2WheelJoint, no constructor in IDL";
}
S.prototype = Object.create(p.prototype);
S.prototype.constructor = S;
S.prototype.b = S;
S.c = {};
b.b2WheelJoint = S;
S.prototype.GetLocalAnchorA = function() {
  return n(Rf(this.a), r);
};
S.prototype.GetLocalAnchorB = function() {
  return n(Fv(this.a), r);
};
S.prototype.GetLocalAxisA = function() {
  return n(su(this.a), r);
};
S.prototype.GetJointTranslation = function() {
  return Er(this.a);
};
S.prototype.GetJointSpeed = function() {
  return tf(this.a);
};
S.prototype.IsMotorEnabled = function() {
  return !!xp(this.a);
};
S.prototype.EnableMotor = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Hf(c, a);
};
S.prototype.SetMotorSpeed = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ae(c, a);
};
S.prototype.GetMotorSpeed = function() {
  return $m(this.a);
};
S.prototype.SetMaxMotorTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Rj(c, a);
};
S.prototype.GetMaxMotorTorque = function() {
  return rf(this.a);
};
S.prototype.GetMotorTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return Fr(c, a);
};
S.prototype.SetSpringFrequencyHz = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Eh(c, a);
};
S.prototype.GetSpringFrequencyHz = function() {
  return xv(this.a);
};
S.prototype.SetSpringDampingRatio = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Gn(c, a);
};
S.prototype.GetSpringDampingRatio = function() {
  return $b(this.a);
};
S.prototype.GetType = function() {
  return mu(this.a);
};
S.prototype.GetBodyA = function() {
  return n(tn(this.a), q);
};
S.prototype.GetBodyB = function() {
  return n(Xl(this.a), q);
};
S.prototype.GetAnchorA = function() {
  return n(wh(this.a), r);
};
S.prototype.GetAnchorB = function() {
  return n(Hv(this.a), r);
};
S.prototype.GetReactionForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(bf(c, a), r);
};
S.prototype.GetReactionTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return lm(c, a);
};
S.prototype.GetNext = function() {
  return n(qn(this.a), p);
};
S.prototype.GetUserData = function() {
  return on(this.a);
};
S.prototype.SetUserData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Hs(c, a);
};
S.prototype.IsActive = function() {
  return !!Hr(this.a);
};
S.prototype.GetCollideConnected = function() {
  return !!jr(this.a);
};
S.prototype.__destroy__ = function() {
  Sv(this.a);
};
function T() {
  throw "cannot construct a b2PulleyJoint, no constructor in IDL";
}
T.prototype = Object.create(p.prototype);
T.prototype.constructor = T;
T.prototype.b = T;
T.c = {};
b.b2PulleyJoint = T;
T.prototype.GetGroundAnchorA = function() {
  return n(gd(this.a), r);
};
T.prototype.GetGroundAnchorB = function() {
  return n(ag(this.a), r);
};
T.prototype.GetLengthA = function() {
  return vn(this.a);
};
T.prototype.GetLengthB = function() {
  return Pj(this.a);
};
T.prototype.GetRatio = function() {
  return Nn(this.a);
};
T.prototype.GetType = function() {
  return si(this.a);
};
T.prototype.GetBodyA = function() {
  return n(Kp(this.a), q);
};
T.prototype.GetBodyB = function() {
  return n(Ud(this.a), q);
};
T.prototype.GetAnchorA = function() {
  return n(bu(this.a), r);
};
T.prototype.GetAnchorB = function() {
  return n(km(this.a), r);
};
T.prototype.GetReactionForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(Ot(c, a), r);
};
T.prototype.GetReactionTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return iu(c, a);
};
T.prototype.GetNext = function() {
  return n(dj(this.a), p);
};
T.prototype.GetUserData = function() {
  return Cc(this.a);
};
T.prototype.SetUserData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  dc(c, a);
};
T.prototype.IsActive = function() {
  return !!ai(this.a);
};
T.prototype.GetCollideConnected = function() {
  return !!et(this.a);
};
T.prototype.__destroy__ = function() {
  eo(this.a);
};
function U() {
  this.a = Uo();
  k(U)[this.a] = this;
}
U.prototype = Object.create(t.prototype);
U.prototype.constructor = U;
U.prototype.b = U;
U.c = {};
b.b2MouseJointDef = U;
U.prototype.get_target = function() {
  return n(cm(this.a), r);
};
U.prototype.set_target = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Bd(c, a);
};
U.prototype.get_maxForce = function() {
  return Fo(this.a);
};
U.prototype.set_maxForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  kl(c, a);
};
U.prototype.get_frequencyHz = function() {
  return Xo(this.a);
};
U.prototype.set_frequencyHz = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Qr(c, a);
};
U.prototype.get_dampingRatio = function() {
  return fg(this.a);
};
U.prototype.set_dampingRatio = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  fo(c, a);
};
U.prototype.get_type = function() {
  return Ro(this.a);
};
U.prototype.set_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Pd(c, a);
};
U.prototype.get_userData = function() {
  return bs(this.a);
};
U.prototype.set_userData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Jc(c, a);
};
U.prototype.get_bodyA = function() {
  return n(nk(this.a), q);
};
U.prototype.set_bodyA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  xd(c, a);
};
U.prototype.get_bodyB = function() {
  return n(lg(this.a), q);
};
U.prototype.set_bodyB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  jh(c, a);
};
U.prototype.get_collideConnected = function() {
  return !!Ns(this.a);
};
U.prototype.set_collideConnected = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  hq(c, a);
};
U.prototype.__destroy__ = function() {
  Nf(this.a);
};
function E() {
  throw "cannot construct a b2Contact, no constructor in IDL";
}
E.prototype = Object.create(h.prototype);
E.prototype.constructor = E;
E.prototype.b = E;
E.c = {};
b.b2Contact = E;
E.prototype.GetManifold = function() {
  return n(As(this.a), ww);
};
E.prototype.IsTouching = function() {
  return !!ge(this.a);
};
E.prototype.SetEnabled = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  nf(c, a);
};
E.prototype.IsEnabled = function() {
  return !!rg(this.a);
};
E.prototype.GetNext = function() {
  return n(sd(this.a), E);
};
E.prototype.GetFixtureA = function() {
  return n(Ae(this.a), x);
};
E.prototype.GetChildIndexA = function() {
  return jv(this.a);
};
E.prototype.GetFixtureB = function() {
  return n(gv(this.a), x);
};
E.prototype.GetChildIndexB = function() {
  return ih(this.a);
};
E.prototype.SetFriction = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  gq(c, a);
};
E.prototype.GetFriction = function() {
  return ig(this.a);
};
E.prototype.ResetFriction = function() {
  Ah(this.a);
};
E.prototype.SetRestitution = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  $p(c, a);
};
E.prototype.GetRestitution = function() {
  return Jm(this.a);
};
E.prototype.ResetRestitution = function() {
  Vh(this.a);
};
function V() {
  this.a = gm();
  k(V)[this.a] = this;
}
V.prototype = Object.create(t.prototype);
V.prototype.constructor = V;
V.prototype.b = V;
V.c = {};
b.b2DistanceJointDef = V;
V.prototype.Initialize = function(a, c, d, e) {
  var g = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  d && "object" === typeof d && (d = d.a);
  e && "object" === typeof e && (e = e.a);
  Vs(g, a, c, d, e);
};
V.prototype.get_localAnchorA = function() {
  return n(Mi(this.a), r);
};
V.prototype.set_localAnchorA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ee(c, a);
};
V.prototype.get_localAnchorB = function() {
  return n(jm(this.a), r);
};
V.prototype.set_localAnchorB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ht(c, a);
};
V.prototype.get_length = function() {
  return Bl(this.a);
};
V.prototype.set_length = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Oh(c, a);
};
V.prototype.get_frequencyHz = function() {
  return wn(this.a);
};
V.prototype.set_frequencyHz = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ij(c, a);
};
V.prototype.get_dampingRatio = function() {
  return le(this.a);
};
V.prototype.set_dampingRatio = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Wc(c, a);
};
V.prototype.get_type = function() {
  return Sh(this.a);
};
V.prototype.set_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Fp(c, a);
};
V.prototype.get_userData = function() {
  return Ec(this.a);
};
V.prototype.set_userData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Vc(c, a);
};
V.prototype.get_bodyA = function() {
  return n(zi(this.a), q);
};
V.prototype.set_bodyA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  zr(c, a);
};
V.prototype.get_bodyB = function() {
  return n(du(this.a), q);
};
V.prototype.set_bodyB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  dp(c, a);
};
V.prototype.get_collideConnected = function() {
  return !!$o(this.a);
};
V.prototype.set_collideConnected = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Td(c, a);
};
V.prototype.__destroy__ = function() {
  lt(this.a);
};
function q() {
  throw "cannot construct a b2Body, no constructor in IDL";
}
q.prototype = Object.create(h.prototype);
q.prototype.constructor = q;
q.prototype.b = q;
q.c = {};
b.b2Body = q;
q.prototype.CreateFixture = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  return void 0 === c ? n(ft(d, a), x) : n(fl(d, a, c), x);
};
q.prototype.DestroyFixture = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Vm(c, a);
};
q.prototype.SetTransform = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  dm(d, a, c);
};
q.prototype.GetTransform = function() {
  return n(Ps(this.a), Fw);
};
q.prototype.GetPosition = function() {
  return n(Mg(this.a), r);
};
q.prototype.GetAngle = function() {
  return Cv(this.a);
};
q.prototype.GetWorldCenter = function() {
  return n(dk(this.a), r);
};
q.prototype.GetLocalCenter = function() {
  return n(Mu(this.a), r);
};
q.prototype.SetLinearVelocity = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Kl(c, a);
};
q.prototype.GetLinearVelocity = function() {
  return n(te(this.a), r);
};
q.prototype.SetAngularVelocity = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ys(c, a);
};
q.prototype.GetAngularVelocity = function() {
  return Qi(this.a);
};
q.prototype.ApplyForce = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  tt(d, a, c);
};
q.prototype.ApplyForceToCenter = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Me(c, a);
};
q.prototype.ApplyTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  vp(c, a);
};
q.prototype.ApplyLinearImpulse = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  Xk(d, a, c);
};
q.prototype.ApplyAngularImpulse = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Rd(c, a);
};
q.prototype.GetMass = function() {
  return Cn(this.a);
};
q.prototype.GetInertia = function() {
  return au(this.a);
};
q.prototype.GetMassData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Om(c, a);
};
q.prototype.SetMassData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ce(c, a);
};
q.prototype.ResetMassData = function() {
  Tq(this.a);
};
q.prototype.GetWorldPoint = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(Bj(c, a), r);
};
q.prototype.GetWorldVector = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(mg(c, a), r);
};
q.prototype.GetLocalPoint = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(wg(c, a), r);
};
q.prototype.GetLocalVector = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(Sl(c, a), r);
};
q.prototype.GetLinearVelocityFromWorldPoint = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(jq(c, a), r);
};
q.prototype.GetLinearVelocityFromLocalPoint = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(Rp(c, a), r);
};
q.prototype.GetLinearDamping = function() {
  return Rq(this.a);
};
q.prototype.SetLinearDamping = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Wl(c, a);
};
q.prototype.GetAngularDamping = function() {
  return ik(this.a);
};
q.prototype.SetAngularDamping = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Uu(c, a);
};
q.prototype.GetGravityScale = function() {
  return $i(this.a);
};
q.prototype.SetGravityScale = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ul(c, a);
};
q.prototype.SetType = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Bn(c, a);
};
q.prototype.GetType = function() {
  return tr(this.a);
};
q.prototype.SetBullet = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ok(c, a);
};
q.prototype.IsBullet = function() {
  return !!Wk(this.a);
};
q.prototype.SetSleepingAllowed = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ek(c, a);
};
q.prototype.IsSleepingAllowed = function() {
  return !!op(this.a);
};
q.prototype.SetAwake = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Xt(c, a);
};
q.prototype.IsAwake = function() {
  return !!zd(this.a);
};
q.prototype.SetActive = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  gl(c, a);
};
q.prototype.IsActive = function() {
  return !!Uh(this.a);
};
q.prototype.SetFixedRotation = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  dh(c, a);
};
q.prototype.IsFixedRotation = function() {
  return !!Kh(this.a);
};
q.prototype.GetFixtureList = function() {
  return n(co(this.a), x);
};
q.prototype.GetJointList = function() {
  return n(js(this.a), Dw);
};
q.prototype.GetContactList = function() {
  return n(Nh(this.a), Kw);
};
q.prototype.GetNext = function() {
  return n(tu(this.a), q);
};
q.prototype.GetUserData = function() {
  return hk(this.a);
};
q.prototype.SetUserData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ji(c, a);
};
q.prototype.GetWorld = function() {
  return n(Ut(this.a), D);
};
q.prototype.Dump = function() {
  bk(this.a);
};
function W() {
  throw "cannot construct a b2FrictionJoint, no constructor in IDL";
}
W.prototype = Object.create(p.prototype);
W.prototype.constructor = W;
W.prototype.b = W;
W.c = {};
b.b2FrictionJoint = W;
W.prototype.GetLocalAnchorA = function() {
  return n(mo(this.a), r);
};
W.prototype.GetLocalAnchorB = function() {
  return n(Cd(this.a), r);
};
W.prototype.SetMaxForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  $s(c, a);
};
W.prototype.GetMaxForce = function() {
  return Du(this.a);
};
W.prototype.SetMaxTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Wo(c, a);
};
W.prototype.GetMaxTorque = function() {
  return pi(this.a);
};
W.prototype.GetType = function() {
  return cg(this.a);
};
W.prototype.GetBodyA = function() {
  return n(Av(this.a), q);
};
W.prototype.GetBodyB = function() {
  return n(Oe(this.a), q);
};
W.prototype.GetAnchorA = function() {
  return n(er(this.a), r);
};
W.prototype.GetAnchorB = function() {
  return n(zu(this.a), r);
};
W.prototype.GetReactionForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(Ep(c, a), r);
};
W.prototype.GetReactionTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return Sj(c, a);
};
W.prototype.GetNext = function() {
  return n(Cr(this.a), p);
};
W.prototype.GetUserData = function() {
  return Nq(this.a);
};
W.prototype.SetUserData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Yo(c, a);
};
W.prototype.IsActive = function() {
  return !!jc(this.a);
};
W.prototype.GetCollideConnected = function() {
  return !!No(this.a);
};
W.prototype.__destroy__ = function() {
  jo(this.a);
};
function Lw() {
  throw "cannot construct a b2DestructionListener, no constructor in IDL";
}
Lw.prototype = Object.create(h.prototype);
Lw.prototype.constructor = Lw;
Lw.prototype.b = Lw;
Lw.c = {};
b.b2DestructionListener = Lw;
Lw.prototype.__destroy__ = function() {
  zc(this.a);
};
function X() {
  this.a = Dm();
  k(X)[this.a] = this;
}
X.prototype = Object.create(t.prototype);
X.prototype.constructor = X;
X.prototype.b = X;
X.c = {};
b.b2GearJointDef = X;
X.prototype.get_joint1 = function() {
  return n(hi(this.a), p);
};
X.prototype.set_joint1 = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  eq(c, a);
};
X.prototype.get_joint2 = function() {
  return n(Yl(this.a), p);
};
X.prototype.set_joint2 = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  yt(c, a);
};
X.prototype.get_ratio = function() {
  return Ao(this.a);
};
X.prototype.set_ratio = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  og(c, a);
};
X.prototype.get_type = function() {
  return Ol(this.a);
};
X.prototype.set_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ye(c, a);
};
X.prototype.get_userData = function() {
  return zm(this.a);
};
X.prototype.set_userData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  dv(c, a);
};
X.prototype.get_bodyA = function() {
  return n(hj(this.a), q);
};
X.prototype.set_bodyA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  mt(c, a);
};
X.prototype.get_bodyB = function() {
  return n(Rm(this.a), q);
};
X.prototype.set_bodyB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Wu(c, a);
};
X.prototype.get_collideConnected = function() {
  return !!lk(this.a);
};
X.prototype.set_collideConnected = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  oo(c, a);
};
X.prototype.__destroy__ = function() {
  Op(this.a);
};
function Y() {
  throw "cannot construct a b2RevoluteJoint, no constructor in IDL";
}
Y.prototype = Object.create(p.prototype);
Y.prototype.constructor = Y;
Y.prototype.b = Y;
Y.c = {};
b.b2RevoluteJoint = Y;
Y.prototype.GetLocalAnchorA = function() {
  return n(pc(this.a), r);
};
Y.prototype.GetLocalAnchorB = function() {
  return n(Wr(this.a), r);
};
Y.prototype.GetReferenceAngle = function() {
  return Gd(this.a);
};
Y.prototype.GetJointAngle = function() {
  return Lf(this.a);
};
Y.prototype.GetJointSpeed = function() {
  return If(this.a);
};
Y.prototype.IsLimitEnabled = function() {
  return !!Fu(this.a);
};
Y.prototype.EnableLimit = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Hg(c, a);
};
Y.prototype.GetLowerLimit = function() {
  return ck(this.a);
};
Y.prototype.GetUpperLimit = function() {
  return vl(this.a);
};
Y.prototype.SetLimits = function(a, c) {
  var d = this.a;
  a && "object" === typeof a && (a = a.a);
  c && "object" === typeof c && (c = c.a);
  Ar(d, a, c);
};
Y.prototype.IsMotorEnabled = function() {
  return !!Ks(this.a);
};
Y.prototype.EnableMotor = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  hh(c, a);
};
Y.prototype.SetMotorSpeed = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  xn(c, a);
};
Y.prototype.GetMotorSpeed = function() {
  return gg(this.a);
};
Y.prototype.SetMaxMotorTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  gh(c, a);
};
Y.prototype.GetMaxMotorTorque = function() {
  return xj(this.a);
};
Y.prototype.GetMotorTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return vs(c, a);
};
Y.prototype.GetType = function() {
  return fp(this.a);
};
Y.prototype.GetBodyA = function() {
  return n(Yi(this.a), q);
};
Y.prototype.GetBodyB = function() {
  return n(tk(this.a), q);
};
Y.prototype.GetAnchorA = function() {
  return n(Xq(this.a), r);
};
Y.prototype.GetAnchorB = function() {
  return n(av(this.a), r);
};
Y.prototype.GetReactionForce = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return n(vt(c, a), r);
};
Y.prototype.GetReactionTorque = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  return Vg(c, a);
};
Y.prototype.GetNext = function() {
  return n(fu(this.a), p);
};
Y.prototype.GetUserData = function() {
  return Lc(this.a);
};
Y.prototype.SetUserData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ci(c, a);
};
Y.prototype.IsActive = function() {
  return !!nu(this.a);
};
Y.prototype.GetCollideConnected = function() {
  return !!Kg(this.a);
};
Y.prototype.__destroy__ = function() {
  qh(this.a);
};
function Kw() {
  this.a = ur();
  k(Kw)[this.a] = this;
}
Kw.prototype = Object.create(h.prototype);
Kw.prototype.constructor = Kw;
Kw.prototype.b = Kw;
Kw.c = {};
b.b2ContactEdge = Kw;
Kw.prototype.get_other = function() {
  return n(Di(this.a), q);
};
Kw.prototype.set_other = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  vi(c, a);
};
Kw.prototype.get_contact = function() {
  return n(Km(this.a), E);
};
Kw.prototype.set_contact = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ot(c, a);
};
Kw.prototype.get_prev = function() {
  return n(Og(this.a), Kw);
};
Kw.prototype.set_prev = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  yv(c, a);
};
Kw.prototype.get_next = function() {
  return n(Ig(this.a), Kw);
};
Kw.prototype.set_next = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  ac(c, a);
};
Kw.prototype.__destroy__ = function() {
  Te(this.a);
};
function Z() {
  this.a = Hj();
  k(Z)[this.a] = this;
}
Z.prototype = Object.create(t.prototype);
Z.prototype.constructor = Z;
Z.prototype.b = Z;
Z.c = {};
b.b2RopeJointDef = Z;
Z.prototype.get_localAnchorA = function() {
  return n(xm(this.a), r);
};
Z.prototype.set_localAnchorA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  pr(c, a);
};
Z.prototype.get_localAnchorB = function() {
  return n(di(this.a), r);
};
Z.prototype.set_localAnchorB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  bv(c, a);
};
Z.prototype.get_maxLength = function() {
  return mk(this.a);
};
Z.prototype.set_maxLength = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Ok(c, a);
};
Z.prototype.get_type = function() {
  return Lp(this.a);
};
Z.prototype.set_type = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  vk(c, a);
};
Z.prototype.get_userData = function() {
  return gn(this.a);
};
Z.prototype.set_userData = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Xn(c, a);
};
Z.prototype.get_bodyA = function() {
  return n(Et(this.a), q);
};
Z.prototype.set_bodyA = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Vf(c, a);
};
Z.prototype.get_bodyB = function() {
  return n(kv(this.a), q);
};
Z.prototype.set_bodyB = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Yd(c, a);
};
Z.prototype.get_collideConnected = function() {
  return !!nh(this.a);
};
Z.prototype.set_collideConnected = function(a) {
  var c = this.a;
  a && "object" === typeof a && (a = a.a);
  Xc(c, a);
};
Z.prototype.__destroy__ = function() {
  Dd(this.a);
};
(function() {
  function a() {
    b.b2Shape.e_circle = Xj();
    b.b2Shape.e_edge = wj();
    b.b2Shape.e_polygon = $t();
    b.b2Shape.e_chain = un();
    b.b2Shape.e_typeCount = Qs();
    b.e_unknownJoint = Zh();
    b.e_revoluteJoint = mi();
    b.e_prismaticJoint = wq();
    b.e_distanceJoint = Fn();
    b.e_pulleyJoint = lf();
    b.e_mouseJoint = Gs();
    b.e_gearJoint = xs();
    b.e_wheelJoint = Re();
    b.e_weldJoint = am();
    b.e_frictionJoint = Qd();
    b.e_ropeJoint = Pu();
    b.e_inactiveLimit = Vt();
    b.e_atLowerLimit = lo();
    b.e_atUpperLimit = Mv();
    b.e_equalLimits = Ih();
    b.b2Manifold.e_circles = Hd();
    b.b2Manifold.e_faceA = qj();
    b.b2Manifold.e_faceB = rj();
    b.b2_staticBody = Ll();
    b.b2_kinematicBody = oj();
    b.b2_dynamicBody = jt();
    b.b2Draw.e_shapeBit = Lh();
    b.b2Draw.e_jointBit = Cf();
    b.b2Draw.e_aabbBit = Gq();
    b.b2Draw.e_pairBit = fr();
    b.b2Draw.e_centerOfMassBit = Lo();
    b.b2ContactFeature.e_vertex = $n();
    b.b2ContactFeature.e_face = vd();
  }
  b.calledRun ? a() : wb(a);
})();


  return Box2D;
};
