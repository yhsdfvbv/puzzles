// --pre-js code for compiled games
Module.reexport_all_to_c(this);
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
  Module['read'] = function(filename) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename).toString();
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename).toString();
    }
    return ret;
  };
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
  // Polyfill over SpiderMonkey/V8 differences
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function(f) { snarf(f) };
  }
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
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      return FUNCTION_TABLE[ptr]();
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
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0; return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+3)>>2)<<2); return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 4))*(quantum ? quantum : 4); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? (((low)>>>(0))+(((high)>>>(0))*4294967296)) : (((low)>>>(0))+(((high)|(0))*4294967296))); return ret; },
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
      case 'i1': HEAP[ptr]=value; break;
      case 'i8': HEAP[ptr]=value; break;
      case 'i16': HEAP[ptr]=value; break;
      case 'i32': HEAP[ptr]=value; break;
      case 'i64': HEAP[ptr]=value; break;
      case 'float': HEAP[ptr]=value; break;
      case 'double': HEAP[ptr]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP[ptr];
      case 'i8': return HEAP[ptr];
      case 'i16': return HEAP[ptr];
      case 'i32': return HEAP[ptr];
      case 'i64': return HEAP[ptr];
      case 'float': return HEAP[ptr];
      case 'double': return HEAP[ptr];
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
    stop = ret + size;
    while (ptr < stop) {
      HEAP[ptr++]=0;
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
    t = HEAP[(ptr)+(i)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAP[(ptr)+(i)];
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
var STACK_ROOT, STACKTOP, STACK_MAX;
var STATICTOP;
var TOTAL_STACK = Module['TOTAL_STACK'] || 65536;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 786432;
var FAST_MEMORY = Module['FAST_MEMORY'] || 786432;
// Initialize the runtime's memory
// Make sure that our HEAP is implemented as a flat array.
HEAP = []; // Hinting at the size with |new Array(TOTAL_MEMORY)| should help in theory but makes v8 much slower
for (var i = 0; i < FAST_MEMORY; i++) {
  HEAP[i] = 0; // XXX We do *not* use {{| makeSetValue(0, 'i', 0, 'null') |}} here, since this is done just to optimize runtime speed
}
Module['HEAP'] = HEAP;
STACK_ROOT = STACKTOP = Runtime.alignMemory(1);
STACK_MAX = TOTAL_STACK; // we lose a little stack here, but TOTAL_STACK is nice and round so use that as the max
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
function initRuntime() {
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
    HEAP[(buffer)+(i)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP[(buffer)+(i)]=array[i];
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
var calledRun = false;
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
// === Body ===
assert(STATICTOP == STACK_MAX); assert(STACK_MAX == TOTAL_STACK);
STATICTOP += 2520;
assert(STATICTOP < TOTAL_MEMORY);
var _stderr;
allocate([0,0,0,0,0,0,0,0,0,0,0,0,54,0,0,0,68,0,0,0,36,0,0,0,72,0,0,0,42,0,0,0,64,0,0,0,1,0,0,0,66,0,0,0,38,0,0,0,6,0,0,0,98,0,0,0,30,0,0,0,104,0,0,0,10,0,0,0,2,0,0,0,1,0,0,0,24,0,0,0,1,0,0,0,88,0,0,0,8,0,0,0,60,0,0,0,62,0,0,0,16,0,0,0,40,0,0,0,12,0,0,0,96,0,0,0,100,0,0,0,24,0,0,0,44,0,0,0,22,0,0,0,86,0,0,0,48,0,0,0,4,0,0,0,52,0,0,0,18,0,0,0,82,0,0,0,70,0,0,0,1,0,0,0,0,0,0,0,92,0,0,0,26,0,0,0,1,0,0,0,0,0,0,0,76,0,0,0,0,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0], ALLOC_NONE, 65536);
allocate([10,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,10000,0,0,0,0,0,0,0,100000000,0,0,0,0,0,0,0,10000000000000000,0,0,0,0,0,0,0,1e+32,0,0,0,0,0,0,0,1e+64,0,0,0,0,0,0,0,1e+128,0,0,0,0,0,0,0,1e+256,0,0,0,0,0,0,0], ["double",0,0,0,0,0,0,0,"double",0,0,0,0,0,0,0,"double",0,0,0,0,0,0,0,"double",0,0,0,0,0,0,0,"double",0,0,0,0,0,0,0,"double",0,0,0,0,0,0,0,"double",0,0,0,0,0,0,0,"double",0,0,0,0,0,0,0,"double",0,0,0,0,0,0,0], ALLOC_NONE, 65728);
allocate(24, "i32", ALLOC_NONE, 65800);
allocate([-1], ["i32",0,0,0], ALLOC_NONE, 65824);
allocate([74,0,0,0,28,0,0,0,20,0,0,0,102,0,0,0,106,0,0,0,14,0,0,0,50,0,0,0,32,0,0,0,46,0,0,0,58,0,0,0,94,0,0,0,80,0,0,0,84,0,0,0,90,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,0,0,0,34,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 65828);
allocate([109,101,45,62,115,116,97,116,101,112,111,115,32,62,61,32,49,0] /* me-_statepos _= 1\00 */, "i8", ALLOC_NONE, 65928);
allocate([114,101,99,116,46,99,0] /* rect.c\00 */, "i8", ALLOC_NONE, 65948);
allocate([82,117,110,110,105,110,103,32,115,111,108,118,101,114,32,115,111,97,107,32,116,101,115,116,115,10,0] /* Running solver soak  */, "i8", ALLOC_NONE, 65956);
allocate([37,115,95,68,69,70,65,85,76,84,0] /* %s_DEFAULT\00 */, "i8", ALLOC_NONE, 65984);
allocate([37,100,44,37,100,0] /* %d,%d\00 */, "i8", ALLOC_NONE, 65996);
allocate([37,115,95,84,69,83,84,83,79,76,86,69,0] /* %s_TESTSOLVE\00 */, "i8", ALLOC_NONE, 66004);
allocate([109,111,118,101,115,116,114,32,33,61,32,78,85,76,76,0] /* movestr != NULL\00 */, "i8", ALLOC_NONE, 66020);
allocate([115,32,33,61,32,78,85,76,76,0] /* s != NULL\00 */, "i8", ALLOC_NONE, 66036);
allocate([111,117,116,32,111,102,32,109,101,109,111,114,121,0] /* out of memory\00 */, "i8", ALLOC_NONE, 66048);
allocate([102,97,116,97,108,32,101,114,114,111,114,58,32,0] /* fatal error: \00 */, "i8", ALLOC_NONE, 66064);
allocate([37,100,44,37,100,44,37,100,44,37,100,0] /* %d,%d,%d,%d\00 */, "i8", ALLOC_NONE, 66080);
allocate([115,0] /* s\00 */, "i8", ALLOC_NONE, 66092);
allocate([67,79,77,80,76,69,84,69,68,33,0] /* COMPLETED!\00 */, "i8", ALLOC_NONE, 66096);
allocate([109,111,118,101,115,116,114,32,38,38,32,33,109,115,103,0] /* movestr && !msg\00 */, "i8", ALLOC_NONE, 66108);
allocate([100,114,97,119,105,110,103,46,99,0] /* drawing.c\00 */, "i8", ALLOC_NONE, 66124);
allocate([97,0] /* a\00 */, "i8", ALLOC_NONE, 66136);
allocate([101,37,103,0] /* e%g\00 */, "i8", ALLOC_NONE, 66140);
allocate([37,100,120,37,100,0] /* %dx%d\00 */, "i8", ALLOC_NONE, 66144);
allocate([69,110,115,117,114,101,32,117,110,105,113,117,101,32,115,111,108,117,116,105,111,110,0] /* Ensure unique soluti */, "i8", ALLOC_NONE, 66152);
allocate([37,103,0] /* %g\00 */, "i8", ALLOC_NONE, 66176);
allocate([65,117,116,111,45,115,111,108,118,101,100,46,0] /* Auto-solved.\00 */, "i8", ALLOC_NONE, 66180);
allocate([69,120,112,97,110,115,105,111,110,32,102,97,99,116,111,114,0] /* Expansion factor\00 */, "i8", ALLOC_NONE, 66196);
allocate([109,101,45,62,110,115,116,97,116,101,115,32,61,61,32,48,0] /* me-_nstates == 0\00 */, "i8", ALLOC_NONE, 66216);
allocate([72,101,105,103,104,116,0] /* Height\00 */, "i8", ALLOC_NONE, 66236);
allocate([87,105,100,116,104,0] /* Width\00 */, "i8", ALLOC_NONE, 66244);
allocate([69,120,112,97,110,115,105,111,110,32,102,97,99,116,111,114,32,109,97,121,32,110,111,116,32,98,101,32,110,101,103,97,116,105,118,101,0] /* Expansion factor may */, "i8", ALLOC_NONE, 66252);
allocate([71,114,105,100,32,97,114,101,97,32,109,117,115,116,32,98,101,32,103,114,101,97,116,101,114,32,116,104,97,110,32,111,110,101,0] /* Grid area must be gr */, "i8", ALLOC_NONE, 66292);
allocate([87,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,109,117,115,116,32,98,111,116,104,32,98,101,32,103,114,101,97,116,101,114,32,116,104,97,110,32,122,101,114,111,0] /* Width and height mus */, "i8", ALLOC_NONE, 66328);
allocate([33,114,0] /* !r\00 */, "i8", ALLOC_NONE, 66376);
allocate([112,32,45,32,97,105,32,61,61,32,108,101,110,45,49,0] /* p - ai == len-1\00 */, "i8", ALLOC_NONE, 66380);
allocate([109,32,61,61,32,110,100,91,105,93,46,110,112,111,105,110,116,115,0] /* m == nd[i].npoints\0 */, "i8", ALLOC_NONE, 66396);
allocate([114,46,121,43,114,46,104,45,49,32,60,61,32,121,43,49,0] /* r.y+r.h-1 _= y+1\00 */, "i8", ALLOC_NONE, 66416);
allocate([37,100,120,37,100,32,0] /* %dx%d \00 */, "i8", ALLOC_NONE, 66436);
allocate([114,46,120,43,114,46,119,45,49,32,60,61,32,120,43,49,0] /* r.x+r.w-1 _= x+1\00 */, "i8", ALLOC_NONE, 66444);
allocate([109,105,100,101,110,100,46,99,0] /* midend.c\00 */, "i8", ALLOC_NONE, 66464);
allocate([114,46,121,32,62,61,32,121,45,49,0] /* r.y _= y-1\00 */, "i8", ALLOC_NONE, 66476);
allocate([114,46,120,32,62,61,32,120,45,49,0] /* r.x _= x-1\00 */, "i8", ALLOC_NONE, 66488);
allocate([121,32,62,32,48,32,38,38,32,121,32,60,32,112,97,114,97,109,115,50,45,62,104,45,49,0] /* y _ 0 && y _ params2 */, "i8", ALLOC_NONE, 66500);
allocate([120,32,62,32,48,32,38,38,32,120,32,60,32,112,97,114,97,109,115,50,45,62,119,45,49,0] /* x _ 0 && x _ params2 */, "i8", ALLOC_NONE, 66528);
allocate([33,34,105,110,118,97,108,105,100,32,100,105,114,101,99,116,105,111,110,34,0] /* !\22invalid directio */, "i8", ALLOC_NONE, 66556);
allocate([121,32,60,32,112,97,114,97,109,115,50,45,62,104,43,49,0] /* y _ params2-_h+1\00 */, "i8", ALLOC_NONE, 66580);
allocate([91,37,100,58,37,48,50,100,93,32,0] /* [%d:%02d] \00 */, "i8", ALLOC_NONE, 66600);
allocate([120,32,62,32,48,0] /* x _ 0\00 */, "i8", ALLOC_NONE, 66612);
allocate([83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,32,102,97,105,108,101,100,0] /* Solve operation fail */, "i8", ALLOC_NONE, 66620);
allocate([121,32,62,32,48,0] /* y _ 0\00 */, "i8", ALLOC_NONE, 66644);
allocate([78,111,32,103,97,109,101,32,115,101,116,32,117,112,32,116,111,32,115,111,108,118,101,0] /* No game set up to so */, "i8", ALLOC_NONE, 66652);
allocate([120,32,60,32,112,97,114,97,109,115,50,45,62,119,43,49,0] /* x _ params2-_w+1\00 */, "i8", ALLOC_NONE, 66676);
allocate([84,104,105,115,32,103,97,109,101,32,100,111,101,115,32,110,111,116,32,115,117,112,112,111,114,116,32,116,104,101,32,83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,0] /* This game does not s */, "i8", ALLOC_NONE, 66696);
allocate([120,32,60,32,112,97,114,97,109,115,50,45,62,119,32,38,38,32,121,32,60,32,112,97,114,97,109,115,50,45,62,104,0] /* x _ params2-_w && y  */, "i8", ALLOC_NONE, 66744);
allocate([37,100,0] /* %d\00 */, "i8", ALLOC_NONE, 66780);
allocate([84,111,111,32,109,117,99,104,32,100,97,116,97,32,116,111,32,102,105,116,32,105,110,32,103,114,105,100,0] /* Too much data to fit */, "i8", ALLOC_NONE, 66784);
allocate([78,111,116,32,101,110,111,117,103,104,32,100,97,116,97,32,116,111,32,102,105,108,108,32,103,114,105,100,0] /* Not enough data to f */, "i8", ALLOC_NONE, 66816);
allocate([73,110,118,97,108,105,100,32,99,104,97,114,97,99,116,101,114,32,105,110,32,103,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Invalid character in */, "i8", ALLOC_NONE, 66848);
allocate([100,114,45,62,109,101,0] /* dr-_me\00 */, "i8", ALLOC_NONE, 66888);
allocate([105,32,61,61,32,97,114,101,97,0] /* i == area\00 */, "i8", ALLOC_NONE, 66896);
allocate([33,34,87,101,32,99,97,110,39,116,32,103,101,116,32,104,101,114,101,34,0] /* !\22We can't get her */, "i8", ALLOC_NONE, 66908);
allocate([114,97,110,100,111,109,46,99,0] /* random.c\00 */, "i8", ALLOC_NONE, 66932);
allocate([105,32,60,32,97,114,101,97,0] /* i _ area\00 */, "i8", ALLOC_NONE, 66944);
allocate([105,32,43,32,114,117,110,32,60,61,32,97,114,101,97,0] /* i + run _= area\00 */, "i8", ALLOC_NONE, 66956);
allocate([111,118,101,114,108,97,112,115,91,40,114,101,99,116,110,117,109,32,42,32,104,32,43,32,121,41,32,42,32,119,32,43,32,120,93,32,33,61,32,48,0] /* overlaps[(rectnum _  */, "i8", ALLOC_NONE, 66972);
allocate([114,101,99,116,98,121,112,108,97,99,101,91,121,32,42,32,119,32,43,32,120,93,32,61,61,32,45,49,0] /* rectbyplace[y _ w +  */, "i8", ALLOC_NONE, 67016);
allocate([114,101,99,116,97,110,103,108,101,115,0] /* rectangles\00 */, "i8", ALLOC_NONE, 67048);
allocate([112,32,45,32,114,101,116,32,61,61,32,108,101,110,0] /* p - ret == len\00 */, "i8", ALLOC_NONE, 67060);
allocate([37,115,95,84,73,76,69,83,73,90,69,0] /* %s_TILESIZE\00 */, "i8", ALLOC_NONE, 67076);
allocate([106,32,61,61,32,110,0] /* j == n\00 */, "i8", ALLOC_NONE, 67088);
allocate([112,32,45,32,114,101,116,32,61,61,32,109,97,120,108,101,110,0] /* p - ret == maxlen\00 */, "i8", ALLOC_NONE, 67096);
allocate([110,32,62,61,32,48,32,38,38,32,110,32,60,32,109,101,45,62,110,112,114,101,115,101,116,115,0] /* n _= 0 && n _ me-_np */, "i8", ALLOC_NONE, 67116);
allocate([37,42,115,0] /* %_s\00 */, "i8", ALLOC_NONE, 67144);
allocate([37,115,95,80,82,69,83,69,84,83,0] /* %s_PRESETS\00 */, "i8", ALLOC_NONE, 67148);
allocate([37,42,100,0] /* %_d\00 */, "i8", ALLOC_NONE, 67160);
allocate([37,50,120,37,50,120,37,50,120,0] /* %2x%2x%2x\00 */, "i8", ALLOC_NONE, 67164);
allocate([86,37,100,44,37,100,0] /* V%d,%d\00 */, "i8", ALLOC_NONE, 67176);
allocate([37,115,95,67,79,76,79,85,82,95,37,100,0] /* %s_COLOUR_%d\00 */, "i8", ALLOC_NONE, 67184);
allocate([72,37,100,44,37,100,0] /* H%d,%d\00 */, "i8", ALLOC_NONE, 67200);
allocate(1, "i8", ALLOC_NONE, 67208);
allocate([98,105,116,115,32,60,32,51,50,0] /* bits _ 32\00 */, "i8", ALLOC_NONE, 67212);
allocate([37,99,37,100,44,37,100,44,37,100,44,37,100,0] /* %c%d,%d,%d,%d\00 */, "i8", ALLOC_NONE, 67224);
allocate([109,101,45,62,100,105,114,32,33,61,32,48,0] /* me-_dir != 0\00 */, "i8", ALLOC_NONE, 67240);
allocate([109,101,45,62,100,114,97,119,105,110,103,0] /* me-_drawing\00 */, "i8", ALLOC_NONE, 67256);
allocate([33,117,105,45,62,99,117,114,95,100,114,97,103,103,105,110,103,0] /* !ui-_cur_dragging\00 */, "i8", ALLOC_NONE, 67268);
allocate([103,97,109,101,115,46,114,101,99,116,97,110,103,108,101,115,0] /* games.rectangles\00 */, "i8", ALLOC_NONE, 67288);
allocate([82,101,99,116,97,110,103,108,101,115,0] /* Rectangles\00 */, "i8", ALLOC_NONE, 67308);
allocate(472, ["i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0], ALLOC_NONE, 67320);
allocate([115,116,97,116,117,115,95,98,97,114,0] /* status_bar\00 */, "i8", ALLOC_NONE, 67792);
allocate([115,111,108,118,101,95,103,97,109,101,0] /* solve_game\00 */, "i8", ALLOC_NONE, 67804);
allocate([114,101,109,111,118,101,95,114,101,99,116,95,112,108,97,99,101,109,101,110,116,0] /* remove_rect_placemen */, "i8", ALLOC_NONE, 67816);
allocate([114,101,99,116,95,115,111,108,118,101,114,0] /* rect_solver\00 */, "i8", ALLOC_NONE, 67840);
allocate([114,97,110,100,111,109,95,117,112,116,111,0] /* random_upto\00 */, "i8", ALLOC_NONE, 67852);
allocate([110,101,119,95,103,97,109,101,95,100,101,115,99,0] /* new_game_desc\00 */, "i8", ALLOC_NONE, 67864);
allocate([110,101,119,95,103,97,109,101,0] /* new_game\00 */, "i8", ALLOC_NONE, 67880);
allocate([109,105,100,101,110,100,95,115,111,108,118,101,0] /* midend_solve\00 */, "i8", ALLOC_NONE, 67892);
allocate([109,105,100,101,110,100,95,114,101,115,116,97,114,116,95,103,97,109,101,0] /* midend_restart_game\ */, "i8", ALLOC_NONE, 67908);
allocate([109,105,100,101,110,100,95,114,101,100,114,97,119,0] /* midend_redraw\00 */, "i8", ALLOC_NONE, 67928);
allocate([109,105,100,101,110,100,95,114,101,97,108,108,121,95,112,114,111,99,101,115,115,95,107,101,121,0] /* midend_really_proces */, "i8", ALLOC_NONE, 67944);
allocate([109,105,100,101,110,100,95,110,101,119,95,103,97,109,101,0] /* midend_new_game\00 */, "i8", ALLOC_NONE, 67972);
allocate([109,105,100,101,110,100,95,102,101,116,99,104,95,112,114,101,115,101,116,0] /* midend_fetch_preset\ */, "i8", ALLOC_NONE, 67988);
allocate([105,110,116,101,114,112,114,101,116,95,109,111,118,101,0] /* interpret_move\00 */, "i8", ALLOC_NONE, 68008);
allocate([103,97,109,101,95,116,101,120,116,95,102,111,114,109,97,116,0] /* game_text_format\00 */, "i8", ALLOC_NONE, 68024);
allocate([101,110,117,109,95,114,101,99,116,115,0] /* enum_rects\00 */, "i8", ALLOC_NONE, 68044);
HEAP[65536]=((67308)|0);
HEAP[65540]=((67288)|0);
HEAP[65544]=((67048)|0);
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP[curr]|0 != 0) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }
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
          ret = HEAP[(varargs)+(argIndex)];
        } else if (type == 'i64') {
          ret = HEAP[(varargs)+(argIndex)];
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP[(varargs)+(argIndex)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP[textIndex];
        if (curr === 0) break;
        next = HEAP[textIndex+1];
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
            next = HEAP[textIndex+1];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP[textIndex+1];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP[textIndex+1];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP[textIndex+1];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP[textIndex+1];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP[textIndex+1];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP[textIndex+2];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP[textIndex+2];
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
          next = HEAP[textIndex+1];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
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
                ret.push(HEAP[arg++]);
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
              HEAP[ptr]=ret.length
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
                ret.push(HEAP[i]);
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
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP[s]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP[(s)+(i)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP[(s)+(i)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP[dest]=HEAP[src];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP[dest]=HEAP[src];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP[dest]=HEAP[src];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function _memset(ptr, value, num) {
      for (var $$dest = ptr, $$stop = $$dest + num; $$dest < $$stop; $$dest++) {
  HEAP[$$dest]=value
  };
    }var _llvm_memset_p0i8_i32=_memset;
  function _strcat(pdest, psrc) {
      pdest = pdest|0; psrc = psrc|0;
      var i = 0;
      pdest = (pdest + _strlen(pdest))|0;
      do {
        HEAP[pdest+i]=HEAP[psrc+i];
        i = (i+1)|0;
      } while (HEAP[(psrc)+(i-1)] != 0);
      return pdest|0;
    }
var _frontend_default_colour; // stub for _frontend_default_colour
  function __isFloat(text) {
      return !!(/^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?$/.exec(text));
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[' '] = 1;
        __scanString.whiteSpace['\t'] = 1;
        __scanString.whiteSpace['\n'] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP[(varargs)+(argIndex)];
          argIndex += Runtime.getNativeFieldSize('void*');
          HEAP[argPtr]=soFar;
          formatIndex += 2;
          continue;
        }
        // TODO: Support strings like "%5c" etc.
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'c') {
          var argPtr = HEAP[(varargs)+(argIndex)];
          argIndex += Runtime.getNativeFieldSize('void*');
          fields++;
          next = get();
          HEAP[argPtr]=next
          formatIndex += 2;
          continue;
        }
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
        if (format[formatIndex] === '%') {
          formatIndex++;
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if(format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' || type == 'E') {
            var last = 0;
            next = get();
            while (next > 0) {
              buffer.push(String.fromCharCode(next));
              if (__isFloat(buffer.join(''))) {
                last = buffer.length;
              }
              next = get();
            }
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   (type === 'x' && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          var text = buffer.join('');
          var argPtr = HEAP[(varargs)+(argIndex)];
          argIndex += Runtime.getNativeFieldSize('void*');
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP[argPtr]=parseInt(text, 10);
              } else if(longLong) {
                HEAP[argPtr]=parseInt(text, 10);
              } else {
                HEAP[argPtr]=parseInt(text, 10);
              }
              break;
            case 'x':
              HEAP[argPtr]=parseInt(text, 16)
              break;
            case 'f':
            case 'e':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAP[argPtr]=parseFloat(text)
              } else {
                HEAP[argPtr]=parseFloat(text)
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP[(argPtr)+(j)]=array[j]
              }
              break;
          }
          fields++;
        } else if (format[formatIndex] in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      var get = function() { return HEAP[(s)+(index++)]; };
      var unget = function() { index--; };
      return __scanString(format, get, unget, varargs);
    }
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  function _isspace(chr) {
      return chr in { 32: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 };
    }
  function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      if (!___setErrNo.ret) ___setErrNo.ret = allocate([0], 'i32', ALLOC_STATIC);
      HEAP[___setErrNo.ret]=value
      return value;
    }
  var ERRNO_CODES={E2BIG:7,EACCES:13,EADDRINUSE:98,EADDRNOTAVAIL:99,EAFNOSUPPORT:97,EAGAIN:11,EALREADY:114,EBADF:9,EBADMSG:74,EBUSY:16,ECANCELED:125,ECHILD:10,ECONNABORTED:103,ECONNREFUSED:111,ECONNRESET:104,EDEADLK:35,EDESTADDRREQ:89,EDOM:33,EDQUOT:122,EEXIST:17,EFAULT:14,EFBIG:27,EHOSTUNREACH:113,EIDRM:43,EILSEQ:84,EINPROGRESS:115,EINTR:4,EINVAL:22,EIO:5,EISCONN:106,EISDIR:21,ELOOP:40,EMFILE:24,EMLINK:31,EMSGSIZE:90,EMULTIHOP:72,ENAMETOOLONG:36,ENETDOWN:100,ENETRESET:102,ENETUNREACH:101,ENFILE:23,ENOBUFS:105,ENODATA:61,ENODEV:19,ENOENT:2,ENOEXEC:8,ENOLCK:37,ENOLINK:67,ENOMEM:12,ENOMSG:42,ENOPROTOOPT:92,ENOSPC:28,ENOSR:63,ENOSTR:60,ENOSYS:38,ENOTCONN:107,ENOTDIR:20,ENOTEMPTY:39,ENOTRECOVERABLE:131,ENOTSOCK:88,ENOTSUP:95,ENOTTY:25,ENXIO:6,EOVERFLOW:75,EOWNERDEAD:130,EPERM:1,EPIPE:32,EPROTO:71,EPROTONOSUPPORT:93,EPROTOTYPE:91,ERANGE:34,EROFS:30,ESPIPE:29,ESRCH:3,ESTALE:116,ETIME:62,ETIMEDOUT:110,ETXTBSY:26,EWOULDBLOCK:11,EXDEV:18};function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP[str])) str++;
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP[str] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP[str] == 43) {
        str++;
      }
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP[str] == 48) {
          if (HEAP[str+1] == 120 ||
              HEAP[str+1] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP[str]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
      // Apply sign.
      ret *= multiplier;
      // Set end pointer.
      if (endptr) {
        HEAP[endptr]=str
      }
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }function _atoi(ptr) {
      return _strtol(ptr, null, 10);
    }
  var _sqrt=Math.sqrt;
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAP[(px)+(i)];
        var y = HEAP[(py)+(i)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }function _strcmp(px, py) {
      return _strncmp(px, py, TOTAL_MEMORY);
    }
  function _gettimeofday(ptr) {
      // %struct.timeval = type { i32, i32 }
      var now = Date.now();
      HEAP[ptr]=Math.floor(now/1000); // seconds
      HEAP[(ptr)+(4)]=Math.floor((now-1000*Math.floor(now/1000))*1000); // microseconds
      return 0;
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
        HEAP[_stdin]=1;
        HEAP[_stdout]=2;
        HEAP[_stderr]=3;
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
          contents[offset + i] = HEAP[(buf)+(i)];
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
                stream.object.output(HEAP[(buf)+(i)]);
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
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }var _vfprintf=_fprintf;
  function _llvm_va_end() {}
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
    }
var _canvas_draw_text; // stub for _canvas_draw_text
var _canvas_draw_rect; // stub for _canvas_draw_rect
var _canvas_draw_line; // stub for _canvas_draw_line
var _canvas_draw_poly; // stub for _canvas_draw_poly
var _canvas_draw_circle; // stub for _canvas_draw_circle
var _canvas_draw_update; // stub for _canvas_draw_update
var _canvas_clip; // stub for _canvas_clip
var _canvas_unclip; // stub for _canvas_unclip
var _canvas_start_draw; // stub for _canvas_start_draw
var _canvas_end_draw; // stub for _canvas_end_draw
var _canvas_status_bar; // stub for _canvas_status_bar
var _canvas_blitter_new; // stub for _canvas_blitter_new
var _canvas_blitter_free; // stub for _canvas_blitter_free
var _canvas_blitter_save; // stub for _canvas_blitter_save
var _canvas_blitter_load; // stub for _canvas_blitter_load
var _canvas_draw_thick_line; // stub for _canvas_draw_thick_line
var _frontend_set_game_info; // stub for _frontend_set_game_info
var _frontend_add_preset; // stub for _frontend_add_preset
var _canvas_set_palette_entry; // stub for _canvas_set_palette_entry
  function _strcpy(pdest, psrc) {
      pdest = pdest|0; psrc = psrc|0;
      var i = 0;
      do {
        HEAP[(pdest+i)|0]=HEAP[(psrc+i)|0];
        i = (i+1)|0;
      } while ((HEAP[(psrc)+(i-1)])|0 != 0);
      return pdest|0;
    }
  function _toupper(chr) {
      if (chr >= 97 && chr <= 122) {
        return chr - 97 + 65;
      } else {
        return chr;
      }
    }
  var _environ=allocate(1, "i32*", ALLOC_STACK);var ___environ=_environ;function ___buildEnvironment(env) {
      // WARNING: Arbitrary limit!
      var MAX_ENV_VALUES = 64;
      var TOTAL_ENV_SIZE = 1024;
      // Statically allocate memory for the environment.
      var poolPtr;
      var envPtr;
      if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        // Set default values. Use string keys for Closure Compiler compatibility.
        ENV['USER'] = 'root';
        ENV['PATH'] = '/';
        ENV['PWD'] = '/';
        ENV['HOME'] = '/home/emscripten';
        ENV['LANG'] = 'en_US.UTF-8';
        ENV['_'] = './this.program';
        // Allocate memory.
        poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC);
        envPtr = allocate(MAX_ENV_VALUES * 4,
                          'i8*', ALLOC_STATIC);
        HEAP[envPtr]=poolPtr
        HEAP[_environ]=envPtr;
      } else {
        envPtr = HEAP[_environ];
        poolPtr = HEAP[envPtr];
      }
      // Collect key=value lines.
      var strings = [];
      var totalSize = 0;
      for (var key in env) {
        if (typeof env[key] === 'string') {
          var line = key + '=' + env[key];
          strings.push(line);
          totalSize += line.length;
        }
      }
      if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error('Environment size exceeded TOTAL_ENV_SIZE!');
      }
      // Make new.
      var ptrSize = 4;
      for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        for (var j = 0; j < line.length; j++) {
          HEAP[(poolPtr)+(j)]=line.charCodeAt(j);
        }
        HEAP[(poolPtr)+(j)]=0;
        HEAP[(envPtr)+(i * ptrSize)]=poolPtr;
        poolPtr += line.length + 1;
      }
      HEAP[(envPtr)+(strings.length * ptrSize)]=0;
    }var ENV={};function _getenv(name) {
      // char *getenv(const char *name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/getenv.html
      if (name === 0) return 0;
      name = Pointer_stringify(name);
      if (!ENV.hasOwnProperty(name)) return 0;
      if (_getenv.ret) _free(_getenv.ret);
      _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL);
      return _getenv.ret;
    }
var _deactivate_timer; // stub for _deactivate_timer
var _activate_timer; // stub for _activate_timer
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
        HEAP[ptr]=ret
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
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP[_fputc.ret]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return -1;
      } else {
        return chr;
      }
    }
  var _floorf=Math.floor;
  var _fabsf=Math.abs;
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
          }[name.substr(-3)];
          return ret;
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
          if (xhr.status == 200) {
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
        var flags = HEAP[SDL.screen+Runtime.QUANTUM_SIZE*0];
        flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        HEAP[SDL.screen+Runtime.QUANTUM_SIZE*0]=flags
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        var flags = HEAP[SDL.screen+Runtime.QUANTUM_SIZE*0];
        flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        HEAP[SDL.screen+Runtime.QUANTUM_SIZE*0]=flags
        Browser.updateResizeListeners();
      }};
___setErrNo(0);
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___buildEnvironment(ENV);
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
var FUNCTION_TABLE = [0,0,_free_game,0,_game_free_drawstate,0,_validate_params,0,_game_text_format,0,_dup_game
,0,_game_changed_state,0,_canvas_draw_update,0,_encode_ui,0,_game_anim_length,0,_canvas_draw_line
,0,_game_set_size,0,_solve_game,0,_game_print,0,_canvas_draw_rect,0,_validate_desc
,0,_canvas_unclip,0,_canvas_draw_thick_line,0,_decode_params,0,_custom_params,0,_decode_ui
,0,_free_params,0,_game_compute_size,0,_canvas_start_draw,0,_game_new_drawstate,0,_canvas_clip
,0,_game_redraw,0,_default_params,0,_canvas_text_fallback,0,_canvas_end_draw,0,_new_ui
,0,_free_ui,0,_dup_params,0,_game_configure,0,_game_fetch_preset,0,_game_status
,0,_encode_params,0,_canvas_draw_text,0,_game_timing_state,0,_canvas_blitter_load,0,_canvas_blitter_new
,0,_game_flash_length,0,_canvas_blitter_free,0,_game_colours,0,_game_can_format_as_text_now,0,_canvas_blitter_save
,0,_game_print_size,0,_canvas_status_bar,0,_interpret_move,0,_new_game_desc,0,_execute_move,0,_canvas_draw_poly,0,_new_game,0,_canvas_draw_circle,0];
// EMSCRIPTEN_START_FUNCS
function _validate_params(r1,r2){var r3,r4;r2=r1;do{if(!((HEAP[r2|0]|0)<=0)){if((HEAP[r2+4|0]|0)<=0){break}if((Math.imul(HEAP[r2+4|0],HEAP[r2|0])|0)<2){r3=66292;r4=r3;return r4}if(HEAP[r2+8|0]<0){r3=66252;r4=r3;return r4}else{r3=0;r4=r3;return r4}}}while(0);r3=66328;r4=r3;return r4}function _decode_params(r1,r2){var r3,r4,r5,r6;r3=r1;r1=r2;r2=_atoi(r1);HEAP[r3+4|0]=r2;HEAP[r3|0]=r2;r2=r1;L16:do{if((HEAP[r1]<<24>>24|0)!=0){r4=r2;while(1){r5=r1;if((((HEAP[r4]&255)-48|0)>>>0<10&1|0)==0){r6=r5;break L16}r1=r5+1|0;r5=r1;if((HEAP[r1]<<24>>24|0)!=0){r4=r5}else{r6=r5;break L16}}}else{r6=r2}}while(0);L21:do{if((HEAP[r6]<<24>>24|0)==120){r1=r1+1|0;r2=_atoi(r1);HEAP[r3+4|0]=r2;if((HEAP[r1]<<24>>24|0)==0){break}while(1){if((((HEAP[r1]&255)-48|0)>>>0<10&1|0)==0){break L21}r1=r1+1|0;if((HEAP[r1]<<24>>24|0)==0){break L21}}}}while(0);L27:do{if((HEAP[r1]<<24>>24|0)==101){r1=r1+1|0;r6=_atof(r1);HEAP[r3+8|0]=r6;if((HEAP[r1]<<24>>24|0)==0){break}while(1){if((HEAP[r1]<<24>>24|0)!=46){if((((HEAP[r1]&255)-48|0)>>>0<10&1|0)==0){break L27}}r1=r1+1|0;if((HEAP[r1]<<24>>24|0)==0){break L27}}}}while(0);if((HEAP[r1]<<24>>24|0)!=97){return}r1=r1+1|0;HEAP[r3+12|0]=0;return}function _encode_params(r1,r2){var r3,r4,r5;r3=STACKTOP;STACKTOP=STACKTOP+256|0;r4=r3;r5=r1;r1=r2;r2=HEAP[r5+4|0];_sprintf(r4|0,66144,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=HEAP[r5|0],HEAP[tempInt+4]=r2,tempInt));do{if((r1|0)!=0){if(HEAP[r5+8|0]!=0){_sprintf(r4+_strlen(r4|0)|0,66140,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=HEAP[r5+8|0],tempInt))}if((r1|0)==0){break}if((HEAP[r5+12|0]|0)!=0){break}_strcat(r4|0,66136)}}while(0);r5=_dupstr(r4|0);STACKTOP=r3;return r5}function _free_params(r1){var r2,r3;r2=STACKTOP;STACKTOP=STACKTOP+4|0;r3=r2;HEAP[r3]=r1;if((HEAP[r3]|0)!=0){_free(HEAP[r3])}STACKTOP=r2;return}function _default_params(){var r1,r2,r3,r4;r1=STACKTOP;STACKTOP=STACKTOP+8|0;r2=r1;r3=r1+4;HEAP[r2]=16;r4=_malloc(HEAP[r2]);HEAP[r3]=r4;if((HEAP[r3]|0)!=0){r4=HEAP[r3];HEAP[r4+4|0]=7;HEAP[r4|0]=7;HEAP[r4+8|0]=0;HEAP[r4+12|0]=1;STACKTOP=r1;return r4}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _game_fetch_preset(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12;r4=STACKTOP;STACKTOP=STACKTOP+88|0;r5=r4;r6=r4+4;r7=r4+8;r8=r2;r2=r3;r3=r1;if((r3|0)==0){r9=7;r10=7}else if((r3|0)==1){r9=9;r10=9}else if((r3|0)==2){r9=11;r10=11}else if((r3|0)==3){r9=13;r10=13}else if((r3|0)==4){r9=15;r10=15}else{r11=0;r12=r11;STACKTOP=r4;return r12}_sprintf(r7|0,66144,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=r9,HEAP[tempInt+4]=r10,tempInt));r3=_dupstr(r7|0);HEAP[r8]=r3;HEAP[r5]=16;r3=_malloc(HEAP[r5]);HEAP[r6]=r3;if((r3|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r3=HEAP[r6];r6=r3;HEAP[r2]=r3;HEAP[r6|0]=r9;HEAP[r6+4|0]=r10;HEAP[r6+8|0]=0;HEAP[r6+12|0]=1;r11=1;r12=r11;STACKTOP=r4;return r12}function _dup_params(r1){var r2,r3,r4,r5,r6,r7;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=r2+4;HEAP[r3]=16;r5=_malloc(HEAP[r3]);HEAP[r4]=r5;if((HEAP[r4]|0)!=0){r5=HEAP[r4];r4=r5;r3=r1;for(r1=r3,r6=r4,r7=r1+16;r1<r7;r1++,r6++){HEAP[r6]=HEAP[r1]}STACKTOP=r2;return r5}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _game_configure(r1){var r2,r3,r4,r5,r6;r2=STACKTOP;STACKTOP=STACKTOP+88|0;r3=r2;r4=r2+4;r5=r2+8;r6=r1;HEAP[r3]=80;r1=_malloc(HEAP[r3]);HEAP[r4]=r1;if((HEAP[r4]|0)!=0){r1=HEAP[r4];HEAP[r1|0]=66244;HEAP[r1+4|0]=0;_sprintf(r5|0,66780,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[r6|0],tempInt));r4=_dupstr(r5|0);HEAP[r1+8|0]=r4;HEAP[r1+12|0]=0;HEAP[r1+16|0]=66236;HEAP[r1+20|0]=0;_sprintf(r5|0,66780,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[r6+4|0],tempInt));r4=_dupstr(r5|0);HEAP[r1+24|0]=r4;HEAP[r1+28|0]=0;HEAP[r1+32|0]=66196;HEAP[r1+36|0]=0;_sprintf(r5|0,66176,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=HEAP[r6+8|0],tempInt));r4=_dupstr(r5|0);HEAP[r1+40|0]=r4;HEAP[r1+44|0]=0;HEAP[r1+48|0]=66152;HEAP[r1+52|0]=2;HEAP[r1+56|0]=0;HEAP[r1+60|0]=HEAP[r6+12|0];HEAP[r1+64|0]=0;HEAP[r1+68|0]=3;HEAP[r1+72|0]=0;HEAP[r1+76|0]=0;STACKTOP=r2;return r1}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _custom_params(r1){var r2,r3,r4,r5;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=r2+4;r5=r1;HEAP[r3]=16;r1=_malloc(HEAP[r3]);HEAP[r4]=r1;if((HEAP[r4]|0)!=0){r1=HEAP[r4];r4=_atoi(HEAP[r5+8|0]);HEAP[r1|0]=r4;r4=_atoi(HEAP[r5+24|0]);HEAP[r1+4|0]=r4;r4=_atof(HEAP[r5+40|0]);HEAP[r1+8|0]=r4;HEAP[r1+12|0]=HEAP[r5+60|0];STACKTOP=r2;return r1}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _new_game_desc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+404|0;r6=r5;r7=r5+4;r8=r5+8;r9=r5+12;r10=r5+16;r11=r5+20;r12=r5+24;r13=r5+28;r14=r5+32;r15=r5+36;r16=r5+40;r17=r5+44;r18=r5+48;r19=r5+52;r20=r5+56;r21=r5+60;r22=r5+64;r23=r5+68;r24=r5+72;r25=r5+76;r26=r5+80;r27=r5+84;r28=r5+88;r29=r5+92;r30=r5+96;r31=r5+100;r32=r5+104;r33=r5+108;r34=r5+112;r35=r5+116;r36=r5+120;r37=r5+124;r38=r5+144;r39=r5+148;r40=r5+164;r41=r5+180;r42=r5+196;r43=r5+212;r44=r5+228;r45=r5+244;r46=r5+260;r47=r5+276;r48=r5+292;r49=r5+308;r50=r5+324;r51=r5+340;r52=r5+356;r53=r5+372;r54=r5+388;r55=r1;r1=r2;r2=r3;r3=0;r56=r5+128;r57=r54+8|0;r58=r54+12|0;r59=r54+12|0;r60=r54+8|0;r61=r54|0;r62=r54+4|0;r63=r41+8|0;r64=r41+12|0;r65=r41+4|0;r66=r41+4|0;r67=r41+12|0;r68=r42+8|0;r69=r42+12|0;r70=r42|0;r71=r42|0;r72=r42+8|0;r73=r43+8|0;r74=r43+12|0;r75=r43+4|0;r76=r43+4|0;r77=r43+12|0;r78=r44+8|0;r79=r44+12|0;r80=r44|0;r81=r44|0;r82=r44+8|0;r83=r45+12|0;r84=r45+8|0;r85=r45|0;r86=r45+4|0;r87=r45+8|0;r88=r45+12|0;r89=r46|0;r90=r46+4|0;r91=r46+8|0;r92=r46+12|0;r93=r45;r94=r47;r95=r46|0;r96=r46+4|0;r97=r45+8|0;r98=r46+8|0;r99=r46+12|0;r100=r45+4|0;r101=r45+4|0;r102=r45+12|0;r103=r45;r104=r48;r105=r46|0;r106=r45+4|0;r107=r46+4|0;r108=r46+8|0;r109=r45+12|0;r110=r46+12|0;r111=r45|0;r112=r45|0;r113=r45+8|0;r114=r45;r115=r49;r116=r45|0;r117=r46|0;r118=r46+4|0;r119=r45+8|0;r120=r46+8|0;r121=r46+12|0;r122=r45+4|0;r123=r45+4|0;r124=r45+12|0;r125=r45;r126=r50;r127=r46|0;r128=r46+4|0;r129=r46+8|0;r130=r45+12|0;r131=r46+12|0;r46=r45|0;r132=r45|0;r133=r45+8|0;r45=r52|0;r134=r52+4|0;r135=r52+12|0;r136=r52+8|0;r137=r52|0;r138=r52+4|0;r139=r52+8|0;r140=r52+12|0;r52=r51|0;r141=r51+4|0;r142=r51|0;r143=r51+8|0;r144=r51+4|0;r145=r51+12|0;r146=r39|0;r147=r39+4|0;r148=r39+8|0;r149=r39+12|0;r150=r39+8|0;r151=r39+12|0;L83:while(1){HEAP[r56|0]=(HEAP[r55|0]|0)/(HEAP[r55+8|0]+1)&-1;do{if((HEAP[r56|0]|0)<2){if(!((HEAP[r55|0]|0)>=2)){break}HEAP[r56|0]=2}}while(0);HEAP[r56+4|0]=(HEAP[r55+4|0]|0)/(HEAP[r55+8|0]+1)&-1;do{if((HEAP[r56+4|0]|0)<2){if(!((HEAP[r55+4|0]|0)>=2)){break}HEAP[r56+4|0]=2}}while(0);r152=Math.imul(HEAP[r56|0]<<2,HEAP[r56+4|0]);HEAP[r36]=r152;r152=_malloc(HEAP[r36]);HEAP[r37]=r152;if((r152|0)==0){r4=74;break}r153=HEAP[r37];HEAP[r34]=HEAP[r56|0]<<3;r152=_malloc(HEAP[r34]);HEAP[r35]=r152;if((HEAP[r35]|0)==0){r4=76;break}r152=HEAP[r35];r154=0;r155=0;L95:do{if((r155|0)<(HEAP[r56+4|0]|0)){while(1){r156=0;r157=r155;L98:do{if((r156|0)<(HEAP[r56|0]|0)){r158=r157;while(1){r159=(Math.imul(HEAP[r56|0],r158)+r156<<2)+r153|0;HEAP[r159]=-1;r154=r154+1|0;r156=r156+1|0;r159=r155;if((r156|0)<(HEAP[r56|0]|0)){r158=r159}else{r160=r159;break L98}}}else{r160=r157}}while(0);r155=r160+1|0;if((r155|0)>=(HEAP[r56+4|0]|0)){break L95}}}}while(0);L103:do{if((r154|0)>0){while(1){r157=_random_upto(r1,r154);r156=HEAP[r56|0];r155=0;L106:do{if((r155|0)<(HEAP[r56+4|0]|0)){while(1){r156=0;L109:do{if((r156|0)<(HEAP[r56|0]|0)){while(1){r158=(Math.imul(HEAP[r56|0],r155)+r156<<2)+r153|0;if((HEAP[r158]|0)==-1){r158=r157;r157=r158-1|0;if((r158|0)==0){break L109}}r156=r156+1|0;if((r156|0)>=(HEAP[r56|0]|0)){break L109}}}}while(0);if((r156|0)<(HEAP[r56|0]|0)){break L106}r155=r155+1|0;if((r155|0)>=(HEAP[r56+4|0]|0)){break L106}}}}while(0);do{if((r156|0)<(HEAP[r56|0]|0)){if((r155|0)<(HEAP[r56+4|0]|0)){break}else{r4=91;break}}else{r4=91}}while(0);if(r4==91){r4=0;___assert_func(65948,1200,67864,66744)}_enum_rects(r56,r153,0,r38,r156,r155,r152);if((HEAP[r38]|0)!=0){r157=_random_upto(r1,HEAP[r38]);HEAP[r38]=r157;_enum_rects(r56,r153,r39,r38,r156,r155,r152);_place_rect(r56,r153,HEAP[r146],HEAP[r147],HEAP[r148],HEAP[r149]);r157=r154-Math.imul(HEAP[r151],HEAP[r150])|0;r154=r157;r161=r157}else{r157=(Math.imul(HEAP[r56|0],r155)+r156<<2)+r153|0;HEAP[r157]=-2;r157=r154-1|0;r154=r157;r161=r157}if((r161|0)<=0){break L103}}}}while(0);r154=r152;HEAP[r33]=r154;if((r154|0)!=0){_free(HEAP[r33])}r156=0;L131:do{if((r156|0)<(HEAP[r56|0]|0)){while(1){r155=0;L134:do{if((r155|0)<(HEAP[r56+4|0]|0)){while(1){r154=(Math.imul(HEAP[r56|0],r155)+r156<<2)+r153|0;do{if((HEAP[r154]|0)<0){r157=0;do{if((r156|0)<(HEAP[r56|0]-1|0)){_find_rect(r41,r56,r153,r156+1|0,r155);r158=HEAP[r64];do{if((Math.imul(r158,HEAP[r63])|0)>2){if((HEAP[r65]|0)==(r155|0)){break}r159=HEAP[r67];if((HEAP[r66]-1+r159|0)==(r155|0)){break}else{r162=r159;r4=105;break}}else{r162=r158;r4=105}}while(0);if(r4==105){r4=0;if((r162|0)!=1){break}}r158=r157;r157=r158+1|0;HEAP[(r158<<2)+r40|0]=1}}while(0);do{if((r155|0)>0){_find_rect(r42,r56,r153,r156,r155-1|0);r158=HEAP[r68];do{if((Math.imul(HEAP[r69],r158)|0)>2){if((HEAP[r70]|0)==(r156|0)){break}r159=HEAP[r72];if((HEAP[r71]-1+r159|0)==(r156|0)){break}else{r163=r159;r4=111;break}}else{r163=r158;r4=111}}while(0);if(r4==111){r4=0;if((r163|0)!=1){break}}r158=r157;r157=r158+1|0;HEAP[(r158<<2)+r40|0]=2}}while(0);do{if((r156|0)>0){_find_rect(r43,r56,r153,r156-1|0,r155);r158=HEAP[r74];do{if((Math.imul(r158,HEAP[r73])|0)>2){if((HEAP[r75]|0)==(r155|0)){break}r159=HEAP[r77];if((HEAP[r76]-1+r159|0)==(r155|0)){break}else{r164=r159;r4=117;break}}else{r164=r158;r4=117}}while(0);if(r4==117){r4=0;if((r164|0)!=1){break}}r158=r157;r157=r158+1|0;HEAP[(r158<<2)+r40|0]=4}}while(0);do{if((r155|0)<(HEAP[r56+4|0]-1|0)){_find_rect(r44,r56,r153,r156,r155+1|0);r158=HEAP[r78];do{if((Math.imul(HEAP[r79],r158)|0)>2){if((HEAP[r80]|0)==(r156|0)){break}r159=HEAP[r82];if((HEAP[r81]-1+r159|0)==(r156|0)){break}else{r165=r159;r4=123;break}}else{r165=r158;r4=123}}while(0);if(r4==123){r4=0;if((r165|0)!=1){break}}r158=r157;r157=r158+1|0;HEAP[(r158<<2)+r40|0]=8}}while(0);if((r157|0)<=0){do{if((r156|0)>0){if((r156|0)<(HEAP[r56|0]-1|0)){break}else{r4=155;break}}else{r4=155}}while(0);if(r4==155){r4=0;___assert_func(65948,1395,67864,66528)}do{if((r155|0)>0){if((r155|0)<(HEAP[r56+4|0]-1|0)){break}else{r4=158;break}}else{r4=158}}while(0);if(r4==158){r4=0;___assert_func(65948,1396,67864,66500)}r158=r156-1|0;L187:do{if((r158|0)<=(r156+1|0)){while(1){r159=r155-1|0;L190:do{if((r159|0)<=(r155+1|0)){while(1){_find_rect(r51,r56,r153,r158,r159);if(!((HEAP[r52]|0)>=(r156-1|0))){___assert_func(65948,1401,67864,66488)}if(!((HEAP[r141]|0)>=(r155-1|0))){___assert_func(65948,1402,67864,66476)}if(!((HEAP[r142]-1+HEAP[r143]|0)<=(r156+1|0))){___assert_func(65948,1403,67864,66444)}if(!((HEAP[r144]-1+HEAP[r145]|0)<=(r155+1|0))){___assert_func(65948,1404,67864,66416)}r159=r159+1|0;if(!((r159|0)<=(r155+1|0))){break L190}}}}while(0);r158=r158+1|0;if(!((r158|0)<=(r156+1|0))){break L187}}}}while(0);HEAP[r45]=r156-1|0;HEAP[r134]=r155-1|0;HEAP[r135]=3;HEAP[r136]=3;_place_rect(r56,r153,HEAP[r137],HEAP[r138],HEAP[r139],HEAP[r140]);break}r158=(_random_upto(r1,r157)<<2)+r40|0;r159=HEAP[r158];do{if((r159|0)==1){if((r156|0)>=(HEAP[r56|0]+1|0)){___assert_func(65948,1324,67864,66676)}_find_rect(r47,r56,r153,r156+1|0,r155);for(r166=r94,r167=r93,r168=r166+16;r166<r168;r166++,r167++){HEAP[r167]=HEAP[r166]}HEAP[r95]=r156;HEAP[r96]=r155;HEAP[r98]=HEAP[r97]+1|0;HEAP[r99]=1;if((HEAP[r100]|0)==(r155|0)){HEAP[r101]=HEAP[r101]+1|0}r158=HEAP[r102]-1|0;HEAP[r102]=r158;r169=r158;break}else if((r159|0)==2){if((r155|0)<=0){___assert_func(65948,1338,67864,66644)}_find_rect(r48,r56,r153,r156,r155-1|0);for(r166=r104,r167=r103,r168=r166+16;r166<r168;r166++,r167++){HEAP[r167]=HEAP[r166]}HEAP[r105]=r156;HEAP[r107]=HEAP[r106];HEAP[r108]=1;HEAP[r110]=HEAP[r109]+1|0;if((HEAP[r111]|0)==(r156|0)){HEAP[r112]=HEAP[r112]+1|0}HEAP[r113]=HEAP[r113]-1|0;r4=148;break}else if((r159|0)==4){if((r156|0)<=0){___assert_func(65948,1352,67864,66612)}_find_rect(r49,r56,r153,r156-1|0,r155);for(r166=r115,r167=r114,r168=r166+16;r166<r168;r166++,r167++){HEAP[r167]=HEAP[r166]}HEAP[r117]=HEAP[r116];HEAP[r118]=r155;HEAP[r120]=HEAP[r119]+1|0;HEAP[r121]=1;if((HEAP[r122]|0)==(r155|0)){HEAP[r123]=HEAP[r123]+1|0}r158=HEAP[r124]-1|0;HEAP[r124]=r158;r169=r158;break}else if((r159|0)==8){if((r155|0)>=(HEAP[r56+4|0]+1|0)){___assert_func(65948,1366,67864,66580)}_find_rect(r50,r56,r153,r156,r155+1|0);for(r166=r126,r167=r125,r168=r166+16;r166<r168;r166++,r167++){HEAP[r167]=HEAP[r166]}HEAP[r127]=r156;HEAP[r128]=r155;HEAP[r129]=1;HEAP[r131]=HEAP[r130]+1|0;if((HEAP[r46]|0)==(r156|0)){HEAP[r132]=HEAP[r132]+1|0}HEAP[r133]=HEAP[r133]-1|0;r4=148;break}else{___assert_func(65948,1380,67864,66556);r4=148;break}}while(0);if(r4==148){r4=0;r169=HEAP[r83]}do{if((r169|0)>0){if((HEAP[r84]|0)<=0){break}_place_rect(r56,r153,HEAP[r85],HEAP[r86],HEAP[r87],HEAP[r88])}}while(0);_place_rect(r56,r153,HEAP[r89],HEAP[r90],HEAP[r91],HEAP[r92])}}while(0);r155=r155+1|0;if((r155|0)>=(HEAP[r56+4|0]|0)){break L134}}}}while(0);r156=r156+1|0;if((r156|0)>=(HEAP[r56|0]|0)){break L131}}}}while(0);r170=0;while(1){r152=r53;r154=Math.imul(HEAP[r56|0]<<2,HEAP[r55+4|0]);HEAP[r31]=r154;r154=_malloc(HEAP[r31]);HEAP[r32]=r154;if((r154|0)==0){r4=176;break L83}r154=HEAP[r32];HEAP[r29]=HEAP[r56+4|0]-1<<2;r159=_malloc(HEAP[r29]);HEAP[r30]=r159;if((HEAP[r30]|0)==0){r4=178;break L83}r159=HEAP[r30];HEAP[r27]=HEAP[r56|0]<<2;r157=_malloc(HEAP[r27]);HEAP[r28]=r157;if((HEAP[r28]|0)==0){r4=180;break L83}r157=HEAP[r28];HEAP[r152|0]=HEAP[r56|0];HEAP[r152+4|0]=HEAP[r55+4|0];r155=0;L253:do{if((r155|0)<(HEAP[r56+4|0]-1|0)){while(1){HEAP[(r155<<2)+r159|0]=0;r155=r155+1|0;if((r155|0)>=(HEAP[r56+4|0]-1|0)){break L253}}}}while(0);r155=HEAP[r56+4|0];L257:do{if((r155|0)<(HEAP[r55+4|0]|0)){while(1){r156=_random_upto(r1,HEAP[r56+4|0]-1|0);r158=(r156<<2)+r159|0;HEAP[r158]=HEAP[r158]+1|0;r155=r155+1|0;if((r155|0)>=(HEAP[r55+4|0]|0)){break L257}}}}while(0);r158=0;r171=0;r155=0;L261:do{if((r155|0)<(HEAP[r56+4|0]|0)){while(1){r156=0;L264:do{if((r156|0)<(HEAP[r56|0]|0)){while(1){r172=(Math.imul(HEAP[r56|0],r155)+r156<<2)+r153|0;r173=HEAP[r172];do{if(((r173|0)/(HEAP[r56|0]|0)&-1|0)==(r155|0)){if((r171|0)!=0){r172=(Math.imul(HEAP[r152|0],r171-1|0)+r156<<2)+r154|0;if(((HEAP[r172]|0)/(HEAP[r152|0]|0)&-1|0)>=(r158|0)){r4=191;break}}r172=Math.imul(HEAP[r152|0],r171)+(r173|0)%(HEAP[r56|0]|0)|0;r174=(Math.imul(HEAP[r152|0],r171)+r156<<2)+r154|0;HEAP[r174]=r172;break}else{r4=191}}while(0);if(r4==191){r4=0;r173=(Math.imul(HEAP[r152|0],r171-1|0)+r156<<2)+r154|0;r172=HEAP[r173];r173=(Math.imul(HEAP[r152|0],r171)+r156<<2)+r154|0;HEAP[r173]=r172}r156=r156+1|0;if((r156|0)>=(HEAP[r56|0]|0)){break L264}}}}while(0);r172=r171+1|0;r171=r172;if((r172|0)==(HEAP[r152+4|0]|0)){break L261}r158=r171;r172=-1;r156=0;L277:do{if((r156|0)<(HEAP[r56|0]|0)){while(1){r173=(Math.imul(HEAP[r56|0],r155)+r156<<2)+r153|0;r174=HEAP[r173];r173=(Math.imul(HEAP[r56|0],r155+1|0)+r156<<2)+r153|0;do{if((r174|0)!=(HEAP[r173]|0)){if((r156|0)!=0){r175=(r156-1+Math.imul(HEAP[r56|0],r155)<<2)+r153|0;r176=HEAP[r175];r175=(Math.imul(HEAP[r56|0],r155)+r156<<2)+r153|0;if((r176|0)==(HEAP[r175]|0)){break}r175=(r156-1+Math.imul(HEAP[r56|0],r155+1|0)<<2)+r153|0;r176=HEAP[r175];r175=(Math.imul(HEAP[r56|0],r155+1|0)+r156<<2)+r153|0;if((r176|0)==(HEAP[r175]|0)){break}}r172=_random_upto(r1,HEAP[(r155<<2)+r159|0]+1|0)}else{r172=-1}}while(0);HEAP[(r156<<2)+r157|0]=r172;r156=r156+1|0;if((r156|0)>=(HEAP[r56|0]|0)){break L277}}}}while(0);r172=0;L289:do{if((r172|0)<(HEAP[(r155<<2)+r159|0]|0)){while(1){r156=0;L292:do{if((r156|0)<(HEAP[r56|0]|0)){while(1){if((r172|0)==(HEAP[(r156<<2)+r157|0]|0)){r173=(Math.imul(HEAP[r56|0],r155+1|0)+r156<<2)+r153|0;r174=HEAP[r173];r174=(r174|0)%(HEAP[r56|0]|0);r174=Math.imul(HEAP[r152|0],r171)+r174|0;r173=(Math.imul(HEAP[r152|0],r171)+r156<<2)+r154|0;HEAP[r173]=r174}else{r174=(Math.imul(HEAP[r152|0],r171-1|0)+r156<<2)+r154|0;r173=HEAP[r174];r174=(Math.imul(HEAP[r152|0],r171)+r156<<2)+r154|0;HEAP[r174]=r173}r156=r156+1|0;if((r156|0)>=(HEAP[r56|0]|0)){break L292}}}}while(0);r171=r171+1|0;r172=r172+1|0;if((r172|0)>=(HEAP[(r155<<2)+r159|0]|0)){break L289}}}}while(0);r155=r155+1|0;if((r155|0)>=(HEAP[r56+4|0]|0)){break L261}}}}while(0);r171=r159;HEAP[r26]=r171;if((r171|0)!=0){_free(HEAP[r26])}r171=r157;HEAP[r25]=r171;if((r171|0)!=0){_free(HEAP[r25])}HEAP[r56|0]=HEAP[r152+4|0];HEAP[r56+4|0]=HEAP[r152|0];r171=r153;HEAP[r24]=r171;if((r171|0)!=0){_free(HEAP[r24])}r171=Math.imul(HEAP[r56|0]<<2,HEAP[r56+4|0]);HEAP[r22]=r171;r171=_malloc(HEAP[r22]);HEAP[r23]=r171;if((r171|0)==0){r4=217;break L83}r153=HEAP[r23];r156=0;L312:do{if((r156|0)<(HEAP[r56|0]|0)){while(1){r155=0;L315:do{if((r155|0)<(HEAP[r56+4|0]|0)){while(1){r171=Math.imul(HEAP[r56|0],r155)+r156|0;r158=(Math.imul(HEAP[r152|0],r156)+r155<<2)+r154|0;r172=HEAP[r158];r172=Math.imul(HEAP[r56|0],(r172|0)%(HEAP[r152|0]|0))+((r172|0)/(HEAP[r152|0]|0)&-1)|0;HEAP[(r171<<2)+r153|0]=r172;r155=r155+1|0;if((r155|0)>=(HEAP[r56+4|0]|0)){break L315}}}}while(0);r156=r156+1|0;if((r156|0)>=(HEAP[r56|0]|0)){break L312}}}}while(0);r152=r154;HEAP[r21]=r152;if((r152|0)!=0){_free(HEAP[r21])}r152=HEAP[r55|0];HEAP[r55|0]=HEAP[r55+4|0];HEAP[r55+4|0]=r152;r152=r170+1|0;r170=r152;if((r152|0)>=2){break}}r152=0;r155=0;L324:do{if((r155|0)<(HEAP[r55+4|0]|0)){while(1){r156=0;r157=r155;L327:do{if((r156|0)<(HEAP[r55|0]|0)){r159=r157;while(1){r172=Math.imul(HEAP[r55|0],r159)+r156|0;r171=(Math.imul(HEAP[r55|0],r155)+r156<<2)+r153|0;if((HEAP[r171]|0)==(r172|0)){r152=r152+1|0}r156=r156+1|0;r172=r155;if((r156|0)<(HEAP[r55|0]|0)){r159=r172}else{r177=r172;break L327}}}else{r177=r157}}while(0);r155=r177+1|0;if((r155|0)>=(HEAP[r55+4|0]|0)){break L324}}}}while(0);HEAP[r19]=r152*12&-1;r154=_malloc(HEAP[r19]);HEAP[r20]=r154;if((r154|0)==0){r4=232;break}r154=HEAP[r20];r157=0;r155=0;L336:do{if((r155|0)<(HEAP[r55+4|0]|0)){while(1){r156=0;r159=r155;L339:do{if((r156|0)<(HEAP[r55|0]|0)){r172=r159;while(1){r171=Math.imul(HEAP[r55|0],r172)+r156|0;r158=(Math.imul(HEAP[r55|0],r155)+r156<<2)+r153|0;if((HEAP[r158]|0)==(r171|0)){_find_rect(r54,r55,r153,r156,r155);r171=Math.imul(HEAP[r58],HEAP[r57]);HEAP[r154+(r157*12&-1)|0]=r171;HEAP[r154+(r157*12&-1)+4|0]=HEAP[r154+(r157*12&-1)|0];HEAP[r17]=HEAP[r154+(r157*12&-1)+4|0]<<3;r171=_malloc(HEAP[r17]);HEAP[r18]=r171;if((HEAP[r18]|0)==0){r4=237;break L83}HEAP[r154+(r157*12&-1)+8|0]=HEAP[r18];r171=0;r158=0;L345:do{if((r158|0)<(HEAP[r59]|0)){while(1){r173=0;L348:do{if((r173|0)<(HEAP[r60]|0)){while(1){HEAP[(r171<<3)+HEAP[r154+(r157*12&-1)+8|0]|0]=HEAP[r61]+r173|0;HEAP[(r171<<3)+HEAP[r154+(r157*12&-1)+8|0]+4|0]=HEAP[r62]+r158|0;r171=r171+1|0;r173=r173+1|0;if((r173|0)>=(HEAP[r60]|0)){break L348}}}}while(0);r158=r158+1|0;if((r158|0)>=(HEAP[r59]|0)){break L345}}}}while(0);if((r171|0)!=(HEAP[r154+(r157*12&-1)+4|0]|0)){___assert_func(65948,1653,67864,66396)}r157=r157+1|0}r156=r156+1|0;r158=r155;if((r156|0)<(HEAP[r55|0]|0)){r172=r158}else{r178=r158;break L339}}}else{r178=r159}}while(0);r155=r178+1|0;if((r155|0)>=(HEAP[r55+4|0]|0)){break L336}}}}while(0);do{if((HEAP[r55+12|0]|0)!=0){r159=_rect_solver(HEAP[r55|0],HEAP[r55+4|0],r152,r154,0,0,r1);r179=r159;if((r159|0)==1){r4=250;break}else{break}}else{r179=1;r4=250;break}}while(0);L362:do{if(r4==250){r4=0;r159=Math.imul(HEAP[r55|0]<<2,HEAP[r55+4|0]);HEAP[r15]=r159;r159=_malloc(HEAP[r15]);HEAP[r16]=r159;if((r159|0)==0){r4=251;break L83}r3=HEAP[r16];r155=0;L365:do{if((r155|0)<(HEAP[r55+4|0]|0)){while(1){r156=0;r159=r155;L368:do{if((r156|0)<(HEAP[r55|0]|0)){r172=r159;while(1){r158=(Math.imul(HEAP[r55|0],r172)+r156<<2)+r3|0;HEAP[r158]=0;r156=r156+1|0;r158=r155;if((r156|0)<(HEAP[r55|0]|0)){r172=r158}else{r180=r158;break L368}}}else{r180=r159}}while(0);r155=r180+1|0;if((r155|0)>=(HEAP[r55+4|0]|0)){break L365}}}}while(0);r157=0;if((r157|0)>=(r152|0)){break}while(1){r159=_random_upto(r1,HEAP[r154+(r157*12&-1)+4|0]);r172=HEAP[r154+(r157*12&-1)|0];r171=(HEAP[(r159<<3)+HEAP[r154+(r157*12&-1)+8|0]|0]+Math.imul(HEAP[r55|0],HEAP[(r159<<3)+HEAP[r154+(r157*12&-1)+8|0]+4|0])<<2)+r3|0;HEAP[r171]=r172;r157=r157+1|0;if((r157|0)>=(r152|0)){break L362}}}}while(0);r157=0;L376:do{if((r157|0)<(r152|0)){while(1){r172=HEAP[r154+(r157*12&-1)+8|0];HEAP[r14]=r172;if((r172|0)!=0){_free(HEAP[r14])}r157=r157+1|0;if((r157|0)>=(r152|0)){break L376}}}}while(0);r152=r154;HEAP[r13]=r152;if((r152|0)!=0){_free(HEAP[r13])}if((r179|0)==1){r4=267;break}HEAP[r12]=r153;if((HEAP[r12]|0)==0){continue}_free(HEAP[r12])}if(r4==74){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==76){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==176){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==178){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==180){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==217){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==232){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==237){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==251){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==267){r12=(Math.imul(HEAP[r55+4|0],HEAP[r55|0]-1|0)+2|0)+Math.imul(HEAP[r55|0],HEAP[r55+4|0]-1|0)|0;HEAP[r10]=r12;r179=_malloc(HEAP[r10]);HEAP[r11]=r179;if((HEAP[r11]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r179=HEAP[r11];HEAP[r179|0]=83;r11=r179+1|0;r155=0;L402:do{if((r155|0)<(HEAP[r55+4|0]|0)){while(1){r156=1;r10=r155;L405:do{if((r156|0)<(HEAP[r55|0]|0)){r13=r10;while(1){r14=(Math.imul(HEAP[r55|0],r13)+r156<<2)+r153|0;r1=HEAP[r14];r14=(r156-1+Math.imul(HEAP[r55|0],r155)<<2)+r153|0;r180=r11;r11=r180+1|0;HEAP[r180]=((r1|0)!=(HEAP[r14]|0)?49:48)&255;r156=r156+1|0;r14=r155;if((r156|0)<(HEAP[r55|0]|0)){r13=r14}else{r181=r14;break L405}}}else{r181=r10}}while(0);r155=r181+1|0;if((r155|0)>=(HEAP[r55+4|0]|0)){break L402}}}}while(0);r155=1;L410:do{if((r155|0)<(HEAP[r55+4|0]|0)){while(1){r156=0;r181=r155;L413:do{if((r156|0)<(HEAP[r55|0]|0)){r154=r181;while(1){r10=(Math.imul(HEAP[r55|0],r154)+r156<<2)+r153|0;r13=HEAP[r10];r10=(Math.imul(HEAP[r55|0],r155-1|0)+r156<<2)+r153|0;r14=r11;r11=r14+1|0;HEAP[r14]=((r13|0)!=(HEAP[r10]|0)?49:48)&255;r156=r156+1|0;r10=r155;if((r156|0)<(HEAP[r55|0]|0)){r154=r10}else{r182=r10;break L413}}}else{r182=r181}}while(0);r155=r182+1|0;if((r155|0)>=(HEAP[r55+4|0]|0)){break L410}}}}while(0);if((r11-r179|0)!=(r12-1|0)){___assert_func(65948,1730,67864,66380)}HEAP[r11]=0;HEAP[r2]=r179;r179=Math.imul(HEAP[r55|0]*11&-1,HEAP[r55+4|0]);HEAP[r8]=r179;r179=_malloc(HEAP[r8]);HEAP[r9]=r179;if((r179|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r179=HEAP[r9];r11=r179;r9=0;r170=0;L424:do{if((r170|0)<=(Math.imul(HEAP[r55+4|0],HEAP[r55|0])|0)){while(1){do{if((r170|0)<(Math.imul(HEAP[r55+4|0],HEAP[r55|0])|0)){r8=HEAP[(r170<<2)+r3|0];r183=r8;r2=r9;if((r8|0)!=0){r184=r2;r4=286;break}r9=r2+1|0;break}else{r183=-1;r184=r9;r4=286;break}}while(0);if(r4==286){r4=0;L433:do{if((r184|0)!=0){r2=r9;if((r2|0)>0){r185=r2}else{r4=294;break}while(1){r2=r185+96|0;if((r185|0)>26){r2=122}r8=r11;r11=r8+1|0;HEAP[r8]=r2&255;r8=r9+ -(r2-96|0)|0;r9=r8;if((r8|0)>0){r185=r8}else{r4=294;break L433}}}else{if(r11>>>0<=r179>>>0){r4=294;break}if((r183|0)<=0){break}r8=r11;r11=r8+1|0;HEAP[r8]=95;r4=294;break}}while(0);do{if(r4==294){r4=0;if((r183|0)<=0){break}r11=r11+_sprintf(r11,66780,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=r183,tempInt))|0}}while(0);r9=0}r170=r170+1|0;if(!((r170|0)<=(Math.imul(HEAP[r55+4|0],HEAP[r55|0])|0))){break L424}}}}while(0);HEAP[r11]=0;r11=r153;HEAP[r7]=r11;if((r11|0)!=0){_free(HEAP[r7])}r7=r3;HEAP[r6]=r7;if((r7|0)==0){r186=r6;r187=r179;STACKTOP=r5;return r187}_free(HEAP[r6]);r186=r6;r187=r179;STACKTOP=r5;return r187}}function _validate_desc(r1,r2){var r3,r4,r5,r6,r7;r3=r1;r1=r2;r2=Math.imul(HEAP[r3+4|0],HEAP[r3|0]);r3=0;L457:do{if(HEAP[r1]<<24>>24!=0){L458:while(1){r4=r1;r1=r4+1|0;r5=HEAP[r4]<<24>>24;r4=r5;L460:do{if((r5|0)>=97&(r5|0)<=122){r3=r5-96+r3|0}else{if((r5|0)==95){break}if(!((r4|0)>48&(r4|0)<=57)){break L458}r3=r3+1|0;if(!((HEAP[r1]<<24>>24|0)>=48)){break}while(1){if(!((HEAP[r1]<<24>>24|0)<=57)){break L460}r1=r1+1|0;if(!((HEAP[r1]<<24>>24|0)>=48)){break L460}}}}while(0);if(HEAP[r1]<<24>>24==0){break L457}}r6=66848;r7=r6;return r7}}while(0);if((r3|0)<(r2|0)){r6=66816;r7=r6;return r7}if((r3|0)>(r2|0)){r6=66784;r7=r6;return r7}else{r6=0;r7=r6;return r7}}function _free_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=STACKTOP;STACKTOP=STACKTOP+20|0;r3=r2;r4=r2+4;r5=r2+8;r6=r2+12;r7=r2+16;r8=r1;HEAP[r7]=HEAP[r8+8|0];if((HEAP[r7]|0)!=0){_free(HEAP[r7])}r7=HEAP[r8+12|0];HEAP[r6]=r7;if((r7|0)!=0){_free(HEAP[r6])}r6=HEAP[r8+16|0];HEAP[r5]=r6;if((r6|0)!=0){_free(HEAP[r5])}r5=HEAP[r8+28|0];HEAP[r4]=r5;if((r5|0)!=0){_free(HEAP[r4])}r4=r8;HEAP[r3]=r4;if((r4|0)==0){r9=r3;STACKTOP=r2;return}_free(HEAP[r3]);r9=r3;STACKTOP=r2;return}function _new_game(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r1=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r2;r2=r3;HEAP[r11]=32;r3=_malloc(HEAP[r11]);HEAP[r12]=r3;if((HEAP[r12]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r3=HEAP[r12];HEAP[r3|0]=HEAP[r13|0];HEAP[r3+4|0]=HEAP[r13+4|0];r13=Math.imul(HEAP[r3+4|0],HEAP[r3|0]);HEAP[r9]=r13<<2;r12=_malloc(HEAP[r9]);HEAP[r10]=r12;if((HEAP[r10]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r3+8|0]=HEAP[r10];HEAP[r7]=r13;r10=_malloc(HEAP[r7]);HEAP[r8]=r10;if((HEAP[r8]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r3+12|0]=HEAP[r8];HEAP[r5]=r13;r8=_malloc(HEAP[r5]);HEAP[r6]=r8;if((HEAP[r6]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r3+16|0]=HEAP[r6];HEAP[r3+24|0]=0;HEAP[r3+20|0]=0;r6=0;L511:do{if(HEAP[r2]<<24>>24!=0){while(1){r8=r2;r2=r8+1|0;r5=HEAP[r8]<<24>>24;r8=r5;L514:do{if((r5|0)>=97&(r5|0)<=122){r10=r5-96|0;r7=r10;do{if((r7+r6|0)<=(r13|0)){r14=r7}else{___assert_func(65948,1920,67880,66956);r1=350;break}}while(0);while(1){if(r1==350){r1=0;r14=r10}r10=r14-1|0;if((r14|0)<=0){break L514}r7=r6;r6=r7+1|0;HEAP[(r7<<2)+HEAP[r3+8|0]|0]=0;r1=350;continue}}else{if((r5|0)==95){break}if(!((r8|0)>48&(r8|0)<=57)){___assert_func(65948,1931,67880,66908);break}if((r6|0)>=(r13|0)){___assert_func(65948,1926,67880,66944)}r10=_atoi(r2-1|0);r7=r6;r6=r7+1|0;HEAP[(r7<<2)+HEAP[r3+8|0]|0]=r10;if(!((HEAP[r2]<<24>>24|0)>=48)){break}while(1){if(!((HEAP[r2]<<24>>24|0)<=57)){break L514}r2=r2+1|0;if(!((HEAP[r2]<<24>>24|0)>=48)){break L514}}}}while(0);if(HEAP[r2]<<24>>24==0){break L511}}}}while(0);if((r6|0)!=(r13|0)){___assert_func(65948,1934,67880,66896)}r13=0;if((r13|0)>=(HEAP[r3+4|0]|0)){r15=r3;r16=_get_correct(r15);r17=r3;r18=r17+28|0;HEAP[r18]=r16;r19=r3;STACKTOP=r4;return r19}while(1){r6=0;r2=r13;L543:do{if((r6|0)<(HEAP[r3|0]|0)){r1=r2;while(1){r14=Math.imul(HEAP[r3|0],r1)+r6|0;HEAP[HEAP[r3+16|0]+r14|0]=0;r14=Math.imul(HEAP[r3|0],r13)+r6|0;HEAP[HEAP[r3+12|0]+r14|0]=0;r6=r6+1|0;r14=r13;if((r6|0)<(HEAP[r3|0]|0)){r1=r14}else{r20=r14;break L543}}}else{r20=r2}}while(0);r13=r20+1|0;if((r13|0)>=(HEAP[r3+4|0]|0)){break}}r15=r3;r16=_get_correct(r15);r17=r3;r18=r17+28|0;HEAP[r18]=r16;r19=r3;STACKTOP=r4;return r19}function _dup_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r2=STACKTOP;STACKTOP=STACKTOP+40|0;r3=r2;r4=r2+4;r5=r2+8;r6=r2+12;r7=r2+16;r8=r2+20;r9=r2+24;r10=r2+28;r11=r2+32;r12=r2+36;r13=r1;HEAP[r11]=32;r1=_malloc(HEAP[r11]);HEAP[r12]=r1;if((HEAP[r12]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r1=HEAP[r12];HEAP[r1|0]=HEAP[r13|0];HEAP[r1+4|0]=HEAP[r13+4|0];r12=Math.imul(HEAP[r13+4|0],HEAP[r13|0]);HEAP[r9]=r12;r12=_malloc(HEAP[r9]);HEAP[r10]=r12;if((HEAP[r10]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r1+12|0]=HEAP[r10];r10=Math.imul(HEAP[r13+4|0],HEAP[r13|0]);HEAP[r7]=r10;r10=_malloc(HEAP[r7]);HEAP[r8]=r10;if((HEAP[r8]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r1+16|0]=HEAP[r8];r8=Math.imul(HEAP[r13|0]<<2,HEAP[r13+4|0]);HEAP[r5]=r8;r8=_malloc(HEAP[r5]);HEAP[r6]=r8;if((HEAP[r6]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r1+8|0]=HEAP[r6];r6=Math.imul(HEAP[r1+4|0],HEAP[r1|0]);HEAP[r3]=r6;r6=_malloc(HEAP[r3]);HEAP[r4]=r6;if((HEAP[r4]|0)!=0){HEAP[r1+28|0]=HEAP[r4];HEAP[r1+20|0]=HEAP[r13+20|0];HEAP[r1+24|0]=HEAP[r13+24|0];r4=HEAP[r1+8|0];r6=HEAP[r13+8|0];r3=Math.imul(HEAP[r13|0]<<2,HEAP[r13+4|0]);for(r14=r6,r15=r4,r16=r14+r3;r14<r16;r14++,r15++){HEAP[r15]=HEAP[r14]}r3=HEAP[r1+12|0];r4=HEAP[r13+12|0];r6=Math.imul(HEAP[r13+4|0],HEAP[r13|0]);for(r14=r4,r15=r3,r16=r14+r6;r14<r16;r14++,r15++){HEAP[r15]=HEAP[r14]}r6=HEAP[r1+16|0];r3=HEAP[r13+16|0];r4=Math.imul(HEAP[r13+4|0],HEAP[r13|0]);for(r14=r3,r15=r6,r16=r14+r4;r14<r16;r14++,r15++){HEAP[r15]=HEAP[r14]}r4=HEAP[r1+28|0];r6=HEAP[r13+28|0];r3=Math.imul(HEAP[r13+4|0],HEAP[r13|0]);for(r14=r6,r15=r4,r16=r14+r3;r14<r16;r14++,r15++){HEAP[r15]=HEAP[r14]}STACKTOP=r2;return r1}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _game_can_format_as_text_now(r1){return 1}function _solve_game(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r4=STACKTOP;STACKTOP=STACKTOP+56|0;r2=r4;r5=r4+4;r6=r4+8;r7=r4+12;r8=r4+16;r9=r4+20;r10=r4+24;r11=r4+28;r12=r4+32;r13=r4+36;r14=r4+40;r15=r4+44;r16=r4+48;r17=r4+52;r18=r1;r1=r3;if((r1|0)!=0){r19=_dupstr(r1);r20=r19;STACKTOP=r4;return r20}r1=0;r3=0;L570:do{if((r3|0)<(Math.imul(HEAP[r18|0],HEAP[r18+4|0])|0)){while(1){if((HEAP[(r3<<2)+HEAP[r18+8|0]|0]|0)!=0){r1=r1+1|0}r3=r3+1|0;if((r3|0)>=(Math.imul(HEAP[r18|0],HEAP[r18+4|0])|0)){break L570}}}}while(0);HEAP[r16]=r1*12&-1;r21=_malloc(HEAP[r16]);HEAP[r17]=r21;if((r21|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r21=HEAP[r17];r17=0;r3=0;L580:do{if((r3|0)<(Math.imul(HEAP[r18|0],HEAP[r18+4|0])|0)){while(1){if((HEAP[(r3<<2)+HEAP[r18+8|0]|0]|0)!=0){HEAP[r21+(r17*12&-1)|0]=HEAP[(r3<<2)+HEAP[r18+8|0]|0];HEAP[r21+(r17*12&-1)+4|0]=1;HEAP[r14]=8;r16=_malloc(HEAP[r14]);HEAP[r15]=r16;if((HEAP[r15]|0)==0){break}HEAP[r21+(r17*12&-1)+8|0]=HEAP[r15];HEAP[HEAP[r21+(r17*12&-1)+8|0]|0]=(r3|0)%(HEAP[r18|0]|0);HEAP[HEAP[r21+(r17*12&-1)+8|0]+4|0]=(r3|0)/(HEAP[r18|0]|0)&-1;r17=r17+1|0}r3=r3+1|0;if((r3|0)>=(Math.imul(HEAP[r18|0],HEAP[r18+4|0])|0)){break L580}}_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}while(0);if((r17|0)!=(r1|0)){___assert_func(65948,2011,67804,67088)}r17=Math.imul(HEAP[r18+4|0],HEAP[r18|0]);HEAP[r12]=r17;r17=_malloc(HEAP[r12]);HEAP[r13]=r17;if((r17|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r17=HEAP[r13];r13=Math.imul(HEAP[r18+4|0],HEAP[r18|0]);HEAP[r10]=r13;r13=_malloc(HEAP[r10]);HEAP[r11]=r13;if((HEAP[r11]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r13=HEAP[r11];r11=r17;r10=Math.imul(HEAP[r18+4|0],HEAP[r18|0]);for(r22=r11,r23=r22+r10;r22<r23;r22++){HEAP[r22]=0}r10=r13;r11=Math.imul(HEAP[r18+4|0],HEAP[r18|0]);for(r22=r10,r23=r22+r11;r22<r23;r22++){HEAP[r22]=0}_rect_solver(HEAP[r18|0],HEAP[r18+4|0],r1,r21,r13,r17,0);r3=0;L599:do{if((r3|0)<(r1|0)){while(1){r22=HEAP[r21+(r3*12&-1)+8|0];HEAP[r9]=r22;if((r22|0)!=0){_free(HEAP[r9])}r3=r3+1|0;if((r3|0)>=(r1|0)){break L599}}}}while(0);r1=r21;HEAP[r8]=r1;if((r1|0)!=0){_free(HEAP[r8])}r8=(Math.imul(HEAP[r18+4|0],HEAP[r18|0]-1|0)+2|0)+Math.imul(HEAP[r18|0],HEAP[r18+4|0]-1|0)|0;HEAP[r6]=r8;r1=_malloc(HEAP[r6]);HEAP[r7]=r1;if((r1|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r1=HEAP[r7];r7=r1;r6=r7;r7=r6+1|0;HEAP[r6]=83;r6=0;L613:do{if((r6|0)<(HEAP[r18+4|0]|0)){while(1){r24=1;r21=r6;L616:do{if((r24|0)<(HEAP[r18|0]|0)){r3=r21;while(1){r9=r17+Math.imul(HEAP[r18|0],r3)+r24|0;r22=r7;r7=r22+1|0;HEAP[r22]=((HEAP[r9]&255|0)!=0?49:48)&255;r24=r24+1|0;r9=r6;if((r24|0)<(HEAP[r18|0]|0)){r3=r9}else{r25=r9;break L616}}}else{r25=r21}}while(0);r6=r25+1|0;if((r6|0)>=(HEAP[r18+4|0]|0)){break L613}}}}while(0);r6=1;L621:do{if((r6|0)<(HEAP[r18+4|0]|0)){while(1){r24=0;r25=r6;L624:do{if((r24|0)<(HEAP[r18|0]|0)){r21=r25;while(1){r3=r13+Math.imul(HEAP[r18|0],r21)+r24|0;r9=r7;r7=r9+1|0;HEAP[r9]=((HEAP[r3]&255|0)!=0?49:48)&255;r24=r24+1|0;r3=r6;if((r24|0)<(HEAP[r18|0]|0)){r21=r3}else{r26=r3;break L624}}}else{r26=r25}}while(0);r6=r26+1|0;if((r6|0)>=(HEAP[r18+4|0]|0)){break L621}}}}while(0);r18=r7;r7=r18+1|0;HEAP[r18]=0;if((r7-r1|0)!=(r8|0)){___assert_func(65948,2039,67804,67060)}r8=r17;HEAP[r5]=r8;if((r8|0)!=0){_free(HEAP[r5])}r5=r13;HEAP[r2]=r5;if((r5|0)!=0){_free(HEAP[r2])}r19=r1;r20=r19;STACKTOP=r4;return r20}function _encode_ui(r1){return 0}function _decode_ui(r1,r2){return}function _game_changed_state(r1,r2,r3){return}function _free_ui(r1){var r2,r3;r2=STACKTOP;STACKTOP=STACKTOP+4|0;r3=r2;HEAP[r3]=r1;if((HEAP[r3]|0)!=0){_free(HEAP[r3])}STACKTOP=r2;return}function _game_text_format(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+88|0;r4=r3;r5=r3+4;r6=r3+8;r7=r1;r1=2;r8=0;L647:do{if((r8|0)<(Math.imul(HEAP[r7+4|0],HEAP[r7|0])|0)){r9=r6|0;while(1){r10=_sprintf(r9,66780,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[(r8<<2)+HEAP[r7+8|0]|0],tempInt));if((r1|0)<(r10|0)){r1=r10}r8=r8+1|0;if((r8|0)>=(Math.imul(HEAP[r7+4|0],HEAP[r7|0])|0)){break L647}}}}while(0);r8=(HEAP[r7+4|0]<<1)+1|0;r9=Math.imul(Math.imul(r1+1|0,HEAP[r7|0])+2|0,r8);HEAP[r4]=r9+1|0;r8=_malloc(HEAP[r4]);HEAP[r5]=r8;if((r8|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r8=HEAP[r5];r5=r8;r4=0;L658:do{if((r4|0)<=(HEAP[r7+4|0]<<1|0)){r11=r6|0;r12=r6;while(1){r10=0;L662:do{if((r10|0)<=(HEAP[r7|0]<<1|0)){while(1){L665:do{if((r10&1&r4|0)!=0){r13=((r10|0)/2&-1)+Math.imul(HEAP[r7|0],(r4|0)/2&-1)|0;r14=HEAP[(r13<<2)+HEAP[r7+8|0]|0];r13=r1;if((r14|0)!=0){_sprintf(r11,67160,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=r13,HEAP[tempInt+4]=r14,tempInt))}else{_sprintf(r11,67144,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=r13,HEAP[tempInt+4]=67208,tempInt))}r13=r5;r14=r1;for(r15=r12,r16=r13,r17=r15+r14;r15<r17;r15++,r16++){HEAP[r16]=HEAP[r15]}r5=r5+r1|0}else{r14=r4;if((r10&1|0)!=0){do{if((r14|0)==0){r2=460}else{if((r4|0)==(HEAP[r7+4|0]<<1|0)){r2=460;break}do{if(((r10|0)/2&-1|0)>=0){if(((r10|0)/2&-1|0)>=(HEAP[r7|0]|0)){r18=0;break}if(!(((r4|0)/2&-1|0)>=1)){r18=0;break}if(((r4|0)/2&-1|0)>=(HEAP[r7+4|0]|0)){r18=0;break}r13=((r10|0)/2&-1)+Math.imul(HEAP[r7|0],(r4|0)/2&-1)|0;r18=(HEAP[HEAP[r7+16|0]+r13|0]&255|0)!=0}else{r18=0}}while(0);r13=r18&1;r19=r13;if((r13|0)!=0){r2=462;break}r19=32;break}}while(0);do{if(r2==460){r2=0;r19=1;r2=462;break}}while(0);if(r2==462){r2=0;r19=45}r13=0;if((r13|0)>=(r1|0)){break}while(1){r15=r5;r5=r15+1|0;HEAP[r15]=r19&255;r13=r13+1|0;if((r13|0)>=(r1|0)){break L665}}}if((r14&1|0)!=0){do{if((r10|0)==0){r2=474}else{if((r10|0)==(HEAP[r7|0]<<1|0)){r2=474;break}do{if(((r10|0)/2&-1|0)>=1){if(((r10|0)/2&-1|0)>=(HEAP[r7|0]|0)){r20=0;break}if(!(((r4|0)/2&-1|0)>=0)){r20=0;break}if(((r4|0)/2&-1|0)>=(HEAP[r7+4|0]|0)){r20=0;break}r13=((r10|0)/2&-1)+Math.imul(HEAP[r7|0],(r4|0)/2&-1)|0;r20=(HEAP[HEAP[r7+12|0]+r13|0]&255|0)!=0}else{r20=0}}while(0);r13=r20&1;r21=r13;r15=r5;r5=r15+1|0;if((r13|0)!=0){r22=r15;break}HEAP[r15]=32;break L665}}while(0);if(r2==474){r2=0;r21=1;r14=r5;r5=r14+1|0;r22=r14}HEAP[r22]=124;break}do{if((r4|0)==0){r23=1;r24=1}else{if((r4|0)==(HEAP[r7+4|0]<<1|0)){r25=1}else{do{if(((r10-1|0)/2&-1|0)>=0){if(((r10-1|0)/2&-1|0)>=(HEAP[r7|0]|0)){r26=0;break}if(!(((r4|0)/2&-1|0)>=1)){r26=0;break}if(((r4|0)/2&-1|0)>=(HEAP[r7+4|0]|0)){r26=0;break}r14=((r10-1|0)/2&-1)+Math.imul(HEAP[r7|0],(r4|0)/2&-1)|0;r26=(HEAP[HEAP[r7+16|0]+r14|0]&255|0)!=0}else{r26=0}}while(0);r25=r26&1}r23=r25;if((r4|0)==0){r24=1;break}if((r4|0)==(HEAP[r7+4|0]<<1|0)){r24=1;break}do{if(((r10+1|0)/2&-1|0)>=0){if(((r10+1|0)/2&-1|0)>=(HEAP[r7|0]|0)){r27=0;break}if(!(((r4|0)/2&-1|0)>=1)){r27=0;break}if(((r4|0)/2&-1|0)>=(HEAP[r7+4|0]|0)){r27=0;break}r14=((r10+1|0)/2&-1)+Math.imul(HEAP[r7|0],(r4|0)/2&-1)|0;r27=(HEAP[HEAP[r7+16|0]+r14|0]&255|0)!=0}else{r27=0}}while(0);r24=r27&1}}while(0);r14=r24;do{if((r10|0)==0){r28=1;r29=1}else{if((r10|0)==(HEAP[r7|0]<<1|0)){r30=1}else{do{if(((r10|0)/2&-1|0)>=1){if(((r10|0)/2&-1|0)>=(HEAP[r7|0]|0)){r31=0;break}if(!(((r4-1|0)/2&-1|0)>=0)){r31=0;break}if(((r4-1|0)/2&-1|0)>=(HEAP[r7+4|0]|0)){r31=0;break}r15=((r10|0)/2&-1)+Math.imul(HEAP[r7|0],(r4-1|0)/2&-1)|0;r31=(HEAP[HEAP[r7+12|0]+r15|0]&255|0)!=0}else{r31=0}}while(0);r30=r31&1}r28=r30;if((r10|0)==0){r29=1;break}if((r10|0)==(HEAP[r7|0]<<1|0)){r29=1;break}do{if(((r10|0)/2&-1|0)>=1){if(((r10|0)/2&-1|0)>=(HEAP[r7|0]|0)){r32=0;break}if(!(((r4+1|0)/2&-1|0)>=0)){r32=0;break}if(((r4+1|0)/2&-1|0)>=(HEAP[r7+4|0]|0)){r32=0;break}r15=((r10|0)/2&-1)+Math.imul(HEAP[r7|0],(r4+1|0)/2&-1)|0;r32=(HEAP[HEAP[r7+12|0]+r15|0]&255|0)!=0}else{r32=0}}while(0);r29=r32&1}}while(0);r15=r29;do{if((r23|0)!=0){r2=518}else{do{if((r14|0)==0){if((r28|0)!=0){break}if((r15|0)!=0){break}r13=r5;r5=r13+1|0;HEAP[r13]=32;break L665}}while(0);if((r23|0)!=0){r2=518;break}else{r2=523;break}}}while(0);do{if(r2==518){r2=0;do{if((r14|0)!=0){if((r28|0)!=0){break}if((r15|0)!=0){break}r13=r5;r5=r13+1|0;HEAP[r13]=45;break L665}}while(0);if((r23|0)!=0){break}else{r2=523;break}}}while(0);do{if(r2==523){r2=0;if((r14|0)!=0){break}if((r28|0)==0){break}if((r15|0)==0){break}r13=r5;r5=r13+1|0;HEAP[r13]=124;break L665}}while(0);r15=r5;r5=r15+1|0;HEAP[r15]=43}}while(0);r10=r10+1|0;if(!((r10|0)<=(HEAP[r7|0]<<1|0))){break L662}}}}while(0);r15=r5;r5=r15+1|0;HEAP[r15]=10;r4=r4+1|0;if(!((r4|0)<=(HEAP[r7+4|0]<<1|0))){break L658}}}}while(0);if((r5-r8|0)==(r9|0)){r33=r5;HEAP[r33]=0;r34=r8;STACKTOP=r3;return r34}___assert_func(65948,2140,68024,67096);r33=r5;HEAP[r33]=0;r34=r8;STACKTOP=r3;return r34}function _new_ui(r1){var r2,r3,r4;r1=STACKTOP;STACKTOP=STACKTOP+8|0;r2=r1;r3=r1+4;HEAP[r2]=56;r4=_malloc(HEAP[r2]);HEAP[r3]=r4;if((HEAP[r3]|0)!=0){r4=HEAP[r3];HEAP[r4|0]=-1;HEAP[r4+4|0]=-1;HEAP[r4+8|0]=-1;HEAP[r4+12|0]=-1;HEAP[r4+20|0]=0;HEAP[r4+16|0]=0;HEAP[r4+24|0]=-1;HEAP[r4+28|0]=-1;HEAP[r4+32|0]=-1;HEAP[r4+36|0]=-1;HEAP[r4+52|0]=0;HEAP[r4+48|0]=0;HEAP[r4+44|0]=0;HEAP[r4+40|0]=0;STACKTOP=r1;return r4}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _interpret_move(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+148|0;r9=r8;r10=r8+4;r11=r8+8;r12=r8+12;r13=r8+16;r14=r8+20;r15=r8+24;r16=r8+28;r17=r8+32;r18=r8+36;r19=r8+40;r20=r8+44;r21=r8+48;r22=r8+52;r23=r8+56;r24=r8+60;r25=r8+64;r26=r8+68;r27=r1;r1=r2;r2=r3;r3=r6;r6=0;r28=0;r29=0;r30=0;r3=r3&-28673;_coord_round(((r4|0)-2)/(HEAP[r2+12|0]|0),((r5|0)-2)/(HEAP[r2+12|0]|0),r24,r25);do{if((r3|0)==512|(r3|0)==514){do{if((HEAP[r1|0]|0)>=0){if((HEAP[r1+52|0]|0)==0){break}HEAP[r1|0]=-1;HEAP[r1+4|0]=-1;HEAP[r1+8|0]=-1;HEAP[r1+12|0]=-1;HEAP[r1+24|0]=-1;HEAP[r1+28|0]=-1;HEAP[r1+32|0]=-1;HEAP[r1+36|0]=-1;HEAP[r1+16|0]=0}}while(0);r6=1;HEAP[r1+52|0]=0;HEAP[r1+48|0]=0;r29=1;r30=(r3|0)==514&1;r7=586;break}else{if((r3|0)==518|(r3|0)==520){if((HEAP[r1+48|0]|0)!=0){HEAP[r1+48|0]=0;r29=1}if((HEAP[r1+52|0]|0)!=0){___assert_func(65948,2405,68008,67268)}r28=1;r30=(r3|0)==520&1;r7=586;break}r2=r3;if(!((r3|0)==521|(r3|0)==522|(r3|0)==524|(r3|0)==523)){if(!((r2|0)==525|(r3|0)==526)){if(!((r3|0)!=515&(r3|0)!=517)){r7=586;break}r31=0;r32=r31;STACKTOP=r8;return r32}do{if((HEAP[r1|0]|0)>=0){if((HEAP[r1+52|0]|0)!=0){break}r31=0;r32=r31;STACKTOP=r8;return r32}}while(0);r5=r1;if((HEAP[r1+48|0]|0)!=0){_coord_round((HEAP[r5+40|0]|0)+.5,(HEAP[r1+44|0]|0)+.5,r24,r25);r30=(r3|0)==526&1;r4=r1+52|0;if((HEAP[r1+52|0]|0)!=0){HEAP[r4]=0;r28=1;r29=1;r7=586;break}else{HEAP[r4]=1;r6=1;r29=1;r7=587;break}}if((HEAP[r5+52|0]|0)!=0){___assert_func(65948,2423,68008,67268)}HEAP[r1+48|0]=1;r31=67208;r32=r31;STACKTOP=r8;return r32}r5=HEAP[r27|0];r4=HEAP[r27+4|0];HEAP[r16]=r2;HEAP[r17]=r1+40|0;HEAP[r18]=r1+44|0;HEAP[r19]=r5;HEAP[r20]=r4;HEAP[r21]=0;HEAP[r22]=0;HEAP[r23]=0;r4=HEAP[r16];do{if((r4|0)==521){HEAP[r23]=-1;r7=555;break}else if((r4|0)==522){HEAP[r23]=1;r7=555;break}else if((r4|0)==524){HEAP[r22]=1;r7=555;break}else if((r4|0)==523){HEAP[r22]=-1;r7=555;break}}while(0);do{if(r7==555){r4=HEAP[r22]+HEAP[HEAP[r17]]|0;if((HEAP[r21]|0)!=0){HEAP[HEAP[r17]]=(HEAP[r19]+r4|0)%(HEAP[r19]|0);HEAP[HEAP[r18]]=(HEAP[r23]+HEAP[HEAP[r18]]+HEAP[r20]|0)%(HEAP[r20]|0);break}if((r4|0)>0){r33=HEAP[r22]+HEAP[HEAP[r17]]|0}else{r33=0}do{if((r33|0)<(HEAP[r19]-1|0)){if((HEAP[r22]+HEAP[HEAP[r17]]|0)<=0){r34=0;break}r34=HEAP[r22]+HEAP[HEAP[r17]]|0}else{r34=HEAP[r19]-1|0}}while(0);HEAP[HEAP[r17]]=r34;if((HEAP[r23]+HEAP[HEAP[r18]]|0)>0){r35=HEAP[r23]+HEAP[HEAP[r18]]|0}else{r35=0}do{if((r35|0)<(HEAP[r20]-1|0)){if((HEAP[r23]+HEAP[HEAP[r18]]|0)<=0){r36=0;break}r36=HEAP[r23]+HEAP[HEAP[r18]]|0}else{r36=HEAP[r20]-1|0}}while(0);HEAP[HEAP[r18]]=r36}}while(0);HEAP[r1+48|0]=1;r29=1;if((HEAP[r1+52|0]|0)!=0){_coord_round((HEAP[r1+40|0]|0)+.5,(HEAP[r1+44|0]|0)+.5,r24,r25);r7=586;break}r31=67208;r32=r31;STACKTOP=r8;return r32}}while(0);do{if(r7==586){if((r6|0)!=0){r7=587;break}else{break}}}while(0);do{if(r7==587){if(!((HEAP[r24]|0)>=0)){break}if(!((HEAP[r24]|0)<=(HEAP[r27|0]<<1|0))){break}if(!((HEAP[r25]|0)>=0)){break}if(!((HEAP[r25]|0)<=(HEAP[r27+4|0]<<1|0))){break}HEAP[r1|0]=HEAP[r24];HEAP[r1+4|0]=HEAP[r25];HEAP[r1+8|0]=-1;HEAP[r1+12|0]=-1;HEAP[r1+16|0]=0;HEAP[r1+20|0]=r30;r29=1}}while(0);L861:do{if((HEAP[r1|0]|0)>=0){if((HEAP[r24]|0)==(HEAP[r1+8|0]|0)){if((HEAP[r25]|0)==(HEAP[r1+12|0]|0)){break}}do{if((HEAP[r1+8|0]|0)!=-1){if((HEAP[r1+12|0]|0)==-1){break}HEAP[r1+16|0]=1}}while(0);HEAP[r1+8|0]=HEAP[r24];HEAP[r1+12|0]=HEAP[r25];r29=1;do{if((HEAP[r24]|0)>=0){if(!((HEAP[r24]|0)<=(HEAP[r27|0]<<1|0))){break}if(!((HEAP[r25]|0)>=0)){break}if(!((HEAP[r25]|0)<=(HEAP[r27+4|0]<<1|0))){break}HEAP[r1+24|0]=HEAP[r1|0];HEAP[r1+32|0]=HEAP[r1+8|0];if((HEAP[r1+32|0]|0)<(HEAP[r1+24|0]|0)){r37=HEAP[r1+24|0];HEAP[r1+24|0]=HEAP[r1+32|0];HEAP[r1+32|0]=r37}HEAP[r1+28|0]=HEAP[r1+4|0];HEAP[r1+36|0]=HEAP[r1+12|0];if((HEAP[r1+36|0]|0)<(HEAP[r1+28|0]|0)){r37=HEAP[r1+28|0];HEAP[r1+28|0]=HEAP[r1+36|0];HEAP[r1+36|0]=r37}HEAP[r1+24|0]=(HEAP[r1+24|0]|0)/2&-1;HEAP[r1+32|0]=(HEAP[r1+32|0]+1|0)/2&-1;HEAP[r1+28|0]=(HEAP[r1+28|0]|0)/2&-1;HEAP[r1+36|0]=(HEAP[r1+36|0]+1|0)/2&-1;break L861}}while(0);HEAP[r1+24|0]=-1;HEAP[r1+28|0]=-1;HEAP[r1+32|0]=-1;HEAP[r1+36|0]=-1}}while(0);r37=0;do{if((r28|0)!=0){if((HEAP[r1|0]|0)>=0){do{if((HEAP[r24]|0)>=0){if(!((HEAP[r24]|0)<=(HEAP[r27|0]<<1|0))){break}if(!((HEAP[r25]|0)>=0)){break}if(!((HEAP[r25]|0)<=(HEAP[r27+4|0]<<1|0))){break}if((r30|0)!=(HEAP[r1+20|0]|0)){break}if((HEAP[r1+16|0]|0)!=0){r7=HEAP[r27+16|0];r6=HEAP[r27+12|0];r36=((HEAP[r1+20|0]|0)!=0^1)&1;HEAP[r9]=r27;HEAP[r10]=r1;HEAP[r11]=r7;HEAP[r12]=r6;HEAP[r13]=1;HEAP[r14]=0;HEAP[r15]=r36;if((_grid_draw_rect(HEAP[r9],HEAP[r11],HEAP[r12],HEAP[r13],HEAP[r14],HEAP[r15],HEAP[HEAP[r10]+24|0],HEAP[HEAP[r10]+28|0],HEAP[HEAP[r10]+32|0],HEAP[HEAP[r10]+36|0])|0)==0){break}r36=HEAP[r1+24|0];r6=HEAP[r1+28|0];r7=HEAP[r1+32|0]-HEAP[r1+24|0]|0;r18=HEAP[r1+36|0]-HEAP[r1+28|0]|0;_sprintf(r26|0,67224,(tempInt=STACKTOP,STACKTOP=STACKTOP+20|0,HEAP[tempInt]=(HEAP[r1+20|0]|0)!=0?69:82,HEAP[tempInt+4]=r36,HEAP[tempInt+8]=r6,HEAP[tempInt+12]=r7,HEAP[tempInt+16]=r18,tempInt));r37=_dupstr(r26|0);break}do{if((HEAP[r24]&1|0)!=0){if((HEAP[r25]&1|0)!=0){break}if(!(((HEAP[r24]|0)/2&-1|0)>=0)){break}if(((HEAP[r24]|0)/2&-1|0)>=(HEAP[r27|0]|0)){break}if(!(((HEAP[r25]|0)/2&-1|0)>=1)){break}if(((HEAP[r25]|0)/2&-1|0)>=(HEAP[r27+4|0]|0)){break}r18=(HEAP[r25]|0)/2&-1;_sprintf(r26|0,67200,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=(HEAP[r24]|0)/2&-1,HEAP[tempInt+4]=r18,tempInt));r37=_dupstr(r26|0)}}while(0);if((HEAP[r25]&1|0)==0){break}if((HEAP[r24]&1|0)!=0){break}if(!(((HEAP[r24]|0)/2&-1|0)>=1)){break}if(((HEAP[r24]|0)/2&-1|0)>=(HEAP[r27|0]|0)){break}if(!(((HEAP[r25]|0)/2&-1|0)>=0)){break}if(((HEAP[r25]|0)/2&-1|0)>=(HEAP[r27+4|0]|0)){break}r18=(HEAP[r25]|0)/2&-1;_sprintf(r26|0,67176,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=(HEAP[r24]|0)/2&-1,HEAP[tempInt+4]=r18,tempInt));r37=_dupstr(r26|0)}}while(0);HEAP[r1|0]=-1;HEAP[r1+4|0]=-1;HEAP[r1+8|0]=-1;HEAP[r1+12|0]=-1;HEAP[r1+24|0]=-1;HEAP[r1+28|0]=-1;HEAP[r1+32|0]=-1;HEAP[r1+36|0]=-1;HEAP[r1+16|0]=0;r29=1}if((r37|0)==0){break}r31=r37;r32=r31;STACKTOP=r8;return r32}}while(0);if((r29|0)!=0){r31=67208;r32=r31;STACKTOP=r8;return r32}else{r31=0;r32=r31;STACKTOP=r8;return r32}}function _game_compute_size(r1,r2,r3,r4){var r5,r6,r7;r5=STACKTOP;STACKTOP=STACKTOP+4|0;r6=r5;r7=r1;r1=r6;HEAP[r6|0]=r2;r2=Math.imul(HEAP[r1|0],HEAP[r7|0])+5|0;HEAP[r3]=r2;r2=Math.imul(HEAP[r1|0],HEAP[r7+4|0])+5|0;HEAP[r4]=r2;STACKTOP=r5;return}function _game_set_size(r1,r2,r3,r4){HEAP[r2+12|0]=r4;return}function _execute_move(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+24|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r1;r1=r2;r2=r1;if((HEAP[r1|0]<<24>>24|0)==83){r12=r2+1|0;r13=_dup_game(r11);HEAP[r13+24|0]=1;r14=0;L926:do{if((r14|0)<(HEAP[r13+4|0]|0)){while(1){r15=1;L929:do{if((r15|0)<(HEAP[r13|0]|0)){while(1){r16=(HEAP[r12]<<24>>24|0)==49&1;r17=Math.imul(HEAP[r13|0],r14)+r15|0;HEAP[HEAP[r13+12|0]+r17|0]=r16;if(HEAP[r12]<<24>>24!=0){r12=r12+1|0}r15=r15+1|0;if((r15|0)>=(HEAP[r13|0]|0)){break L929}}}}while(0);r14=r14+1|0;if((r14|0)>=(HEAP[r13+4|0]|0)){break L926}}}}while(0);r14=1;L937:do{if((r14|0)<(HEAP[r13+4|0]|0)){while(1){r15=0;L940:do{if((r15|0)<(HEAP[r13|0]|0)){while(1){r16=(HEAP[r12]<<24>>24|0)==49&1;r17=Math.imul(HEAP[r13|0],r14)+r15|0;HEAP[HEAP[r13+16|0]+r17|0]=r16;if(HEAP[r12]<<24>>24!=0){r12=r12+1|0}r15=r15+1|0;if((r15|0)>=(HEAP[r13|0]|0)){break L940}}}}while(0);r14=r14+1|0;if((r14|0)>=(HEAP[r13+4|0]|0)){break L937}}}}while(0);r14=HEAP[r13+28|0];HEAP[r6]=r14;if((r14|0)!=0){_free(HEAP[r6])}r6=_get_correct(r13);HEAP[r13+28|0]=r6;r18=r13;r19=r18;STACKTOP=r4;return r19}do{if((HEAP[r2|0]<<24>>24|0)==82){r3=666}else{if((HEAP[r1|0]<<24>>24|0)==69){r3=666;break}else{r3=672;break}}}while(0);do{if(r3==666){if(!((_sscanf(r1+1|0,66080,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP[tempInt]=r7,HEAP[tempInt+4]=r8,HEAP[tempInt+8]=r9,HEAP[tempInt+12]=r10,tempInt))|0)==4&(HEAP[r7]|0)>=0&(HEAP[r9]|0)>=0)){r3=672;break}if(!((HEAP[r9]+HEAP[r7]|0)<=(HEAP[r11|0]|0))){r3=672;break}if(!((HEAP[r8]|0)>=0)){r3=672;break}if(!((HEAP[r10]|0)>=0)){r3=672;break}if(!((HEAP[r10]+HEAP[r8]|0)<=(HEAP[r11+4|0]|0))){r3=672;break}HEAP[r9]=HEAP[r9]+HEAP[r7]|0;HEAP[r10]=HEAP[r10]+HEAP[r8]|0;r20=HEAP[r1|0]<<24>>24;break}}while(0);L962:do{if(r3==672){do{if((HEAP[r1|0]<<24>>24|0)==72){r3=674}else{if((HEAP[r1|0]<<24>>24|0)==86){r3=674;break}else{break}}}while(0);do{if(r3==674){if((_sscanf(r1+1|0,65996,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=r7,HEAP[tempInt+4]=r8,tempInt))|0)!=2){break}r2=HEAP[r7];if((HEAP[r1|0]<<24>>24|0)==72){if(!((r2|0)>=0)){break}if((HEAP[r7]|0)>=(HEAP[r11|0]|0)){break}if(!((HEAP[r8]|0)>=1)){break}if((HEAP[r8]|0)>=(HEAP[r11+4|0]|0)){break}}else{if(!((r2|0)>=1)){break}if((HEAP[r7]|0)>=(HEAP[r11|0]|0)){break}if(!((HEAP[r8]|0)>=0)){break}if((HEAP[r8]|0)>=(HEAP[r11+4|0]|0)){break}}r20=HEAP[r1|0]<<24>>24;break L962}}while(0);r18=0;r19=r18;STACKTOP=r4;return r19}}while(0);r13=_dup_game(r11);do{if((r20|0)==82|(r20|0)==69){_grid_draw_rect(r13,HEAP[r13+16|0],HEAP[r13+12|0],1,1,(r20|0)==82&1,HEAP[r7],HEAP[r8],HEAP[r9],HEAP[r10])}else{if((r20|0)==72){r11=Math.imul(HEAP[r13|0],HEAP[r8]);r1=(HEAP[HEAP[r13+16|0]+r11+HEAP[r7]|0]<<24>>24!=0^1)&1;r11=Math.imul(HEAP[r13|0],HEAP[r8]);HEAP[HEAP[r13+16|0]+r11+HEAP[r7]|0]=r1;break}if((r20|0)!=86){break}r1=Math.imul(HEAP[r13|0],HEAP[r8]);r11=(HEAP[HEAP[r13+12|0]+r1+HEAP[r7]|0]<<24>>24!=0^1)&1;r1=Math.imul(HEAP[r13|0],HEAP[r8]);HEAP[HEAP[r13+12|0]+r1+HEAP[r7]|0]=r11}}while(0);r7=HEAP[r13+28|0];HEAP[r5]=r7;if((r7|0)!=0){_free(HEAP[r5])}r5=_get_correct(r13);HEAP[r13+28|0]=r5;do{if((HEAP[r13+20|0]|0)==0){r5=1;r7=0;L995:do{if((r7|0)<(HEAP[r13|0]|0)){while(1){r8=0;L998:do{if((r8|0)<(HEAP[r13+4|0]|0)){while(1){r20=Math.imul(HEAP[r13|0],r8)+r7|0;if(HEAP[HEAP[r13+28|0]+r20|0]<<24>>24==0){r5=0}r8=r8+1|0;if((r8|0)>=(HEAP[r13+4|0]|0)){break L998}}}}while(0);r7=r7+1|0;if((r7|0)>=(HEAP[r13|0]|0)){break L995}}}}while(0);if((r5|0)==0){break}HEAP[r13+20|0]=1}}while(0);r18=r13;r19=r18;STACKTOP=r4;return r19}function _game_free_drawstate(r1,r2){var r3,r4,r5,r6;r1=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r1;r4=r1+4;r5=r2;HEAP[r4]=HEAP[r5+16|0];if((HEAP[r4]|0)!=0){_free(HEAP[r4])}r4=r5;HEAP[r3]=r4;if((r4|0)==0){r6=r3;STACKTOP=r1;return}_free(HEAP[r3]);r6=r3;STACKTOP=r1;return}function _game_colours(r1,r2){var r3,r4,r5,r6;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;HEAP[r4]=96;r6=_malloc(HEAP[r4]);HEAP[r5]=r6;if((HEAP[r5]|0)!=0){r6=HEAP[r5];_frontend_default_colour(r1,r6|0);HEAP[r6+48|0]=HEAP[r6|0]*.5;HEAP[r6+52|0]=HEAP[r6+4|0]*.5;HEAP[r6+56|0]=HEAP[r6+8|0]*.5;HEAP[r6+60|0]=1;HEAP[r6+64|0]=0;HEAP[r6+68|0]=0;HEAP[r6+72|0]=.20000000298023224;HEAP[r6+76|0]=.20000000298023224;HEAP[r6+80|0]=1;HEAP[r6+12|0]=HEAP[r6|0]*.75;HEAP[r6+16|0]=HEAP[r6+4|0]*.75;HEAP[r6+20|0]=HEAP[r6+8|0]*.75;HEAP[r6+24|0]=0;HEAP[r6+28|0]=0;HEAP[r6+32|0]=0;HEAP[r6+36|0]=0;HEAP[r6+40|0]=0;HEAP[r6+44|0]=0;HEAP[r6+84|0]=1;HEAP[r6+88|0]=.5;HEAP[r6+92|0]=.5;HEAP[r2]=8;STACKTOP=r3;return r6}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _game_new_drawstate(r1,r2){var r3,r4,r5,r6,r7,r8;r1=STACKTOP;STACKTOP=STACKTOP+16|0;r3=r1;r4=r1+4;r5=r1+8;r6=r1+12;r7=r2;HEAP[r5]=20;r2=_malloc(HEAP[r5]);HEAP[r6]=r2;if((HEAP[r6]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r2=HEAP[r6];HEAP[r2|0]=0;HEAP[r2+4|0]=HEAP[r7|0];HEAP[r2+8|0]=HEAP[r7+4|0];r7=Math.imul(HEAP[r2+4|0]<<2,HEAP[r2+8|0]);HEAP[r3]=r7;r7=_malloc(HEAP[r3]);HEAP[r4]=r7;if((HEAP[r4]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r2+16|0]=HEAP[r4];HEAP[r2+12|0]=0;r4=0;if((r4|0)>=(Math.imul(HEAP[r2+8|0],HEAP[r2+4|0])|0)){r8=r2;STACKTOP=r1;return r8}while(1){HEAP[(r4<<2)+HEAP[r2+16|0]|0]=65535;r4=r4+1|0;if((r4|0)>=(Math.imul(HEAP[r2+8|0],HEAP[r2+4|0])|0)){break}}r8=r2;STACKTOP=r1;return r8}function _game_redraw(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149;r7=0;r5=STACKTOP;STACKTOP=STACKTOP+804|0;r3=r5;r9=r5+4;r10=r5+8;r11=r5+12;r12=r5+16;r13=r5+20;r14=r5+24;r15=r5+28;r16=r5+32;r17=r5+36;r18=r5+40;r19=r5+44;r20=r5+48;r21=r5+52;r22=r5+56;r23=r5+60;r24=r5+64;r25=r5+68;r26=r5+72;r27=r5+76;r28=r5+80;r29=r5+84;r30=r5+88;r31=r5+92;r32=r5+96;r33=r5+100;r34=r5+104;r35=r5+108;r36=r5+112;r37=r5+116;r38=r5+120;r39=r5+124;r40=r5+128;r41=r5+132;r42=r5+136;r43=r5+140;r44=r5+144;r45=r5+148;r46=r5+152;r47=r5+156;r48=r5+160;r49=r5+164;r50=r5+168;r51=r5+172;r52=r5+176;r53=r5+180;r54=r5+184;r55=r5+188;r56=r5+192;r57=r5+196;r58=r5+200;r59=r5+204;r60=r5+208;r61=r5+212;r62=r5+216;r63=r5+220;r64=r5+224;r65=r5+228;r66=r5+232;r67=r5+236;r68=r5+240;r69=r5+244;r70=r5+248;r71=r5+252;r72=r5+256;r73=r5+260;r74=r5+264;r75=r5+268;r76=r5+272;r77=r5+276;r78=r5+280;r79=r5+284;r80=r5+288;r81=r5+292;r82=r5+296;r83=r5+300;r84=r5+304;r85=r5+308;r86=r5+312;r87=r5+316;r88=r5+320;r89=r5+324;r90=r5+328;r91=r5+332;r92=r5+336;r93=r5+340;r94=r5+344;r95=r5+348;r96=r5+428;r97=r5+432;r98=r5+436;r99=r5+440;r100=r5+444;r101=r5+448;r102=r5+452;r103=r5+456;r104=r5+460;r105=r5+464;r106=r5+468;r107=r5+472;r108=r5+476;r109=r5+480;r110=r5+484;r111=r5+488;r112=r5+492;r113=r5+496;r114=r5+500;r115=r5+504;r116=r5+508;r117=r5+512;r118=r5+516;r119=r5+520;r120=r5+524;r121=r5+528;r122=r5+532;r123=r5+536;r124=r5+540;r125=r5+544;r126=r5+548;r127=r1;r1=r2;r2=r4;r4=r6;r6=r8;r8=r2;do{if((HEAP[r4+16|0]|0)!=0){r128=Math.imul(HEAP[r2+4|0],HEAP[r8|0]);HEAP[r124]=r128;r128=_malloc(HEAP[r124]);HEAP[r125]=r128;if((HEAP[r125]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r129=HEAP[r125];r128=Math.imul(HEAP[r2+4|0],HEAP[r2|0]);HEAP[r122]=r128;r128=_malloc(HEAP[r122]);HEAP[r123]=r128;if((HEAP[r123]|0)!=0){r130=HEAP[r123];r128=r129;r131=HEAP[r2+16|0];r132=Math.imul(HEAP[r2+4|0],HEAP[r2|0]);for(r133=r131,r134=r128,r135=r133+r132;r133<r135;r133++,r134++){HEAP[r134]=HEAP[r133]}r132=r130;r128=HEAP[r2+12|0];r131=Math.imul(HEAP[r2+4|0],HEAP[r2|0]);for(r133=r128,r134=r132,r135=r133+r131;r133<r135;r133++,r134++){HEAP[r134]=HEAP[r133]}r131=(HEAP[r4+20|0]|0)!=0?3:2;HEAP[r115]=r2;HEAP[r116]=r4;HEAP[r117]=r129;HEAP[r118]=r130;HEAP[r119]=r131;HEAP[r120]=1;HEAP[r121]=1;_grid_draw_rect(HEAP[r115],HEAP[r117],HEAP[r118],HEAP[r119],HEAP[r120],HEAP[r121],HEAP[HEAP[r116]+24|0],HEAP[HEAP[r116]+28|0],HEAP[HEAP[r116]+32|0],HEAP[HEAP[r116]+36|0]);break}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}else{r129=HEAP[r8+16|0];r130=HEAP[r2+12|0]}}while(0);r8=Math.imul(HEAP[r2+4|0],HEAP[r2|0]);HEAP[r113]=r8;r8=_malloc(HEAP[r113]);HEAP[r114]=r8;if((r8|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r8=HEAP[r114];r114=r8;r113=Math.imul(HEAP[r2+4|0],HEAP[r2|0]);for(r134=r114,r135=r134+r113;r134<r135;r134++){HEAP[r134]=0}r134=0;L1047:do{if((r134|0)<(HEAP[r2|0]|0)){while(1){r136=0;r135=r134;L1050:do{if((r136|0)<(HEAP[r2+4|0]|0)){r113=r135;while(1){do{if((r113|0)>0){r114=r130+Math.imul(HEAP[r2|0],r136)+r134|0;r116=HEAP[r114]&255;r114=r8+Math.imul(HEAP[r2|0],r136)+r134|0;if((HEAP[r114]&255|0)<(r116|0)){r114=r8+Math.imul(HEAP[r2|0],r136)+r134|0;HEAP[r114]=r116&255}if((r136+1|0)>=(HEAP[r2+4|0]|0)){break}r114=r8+Math.imul(HEAP[r2|0],r136+1|0)+r134|0;if((HEAP[r114]&255|0)>=(r116|0)){break}r114=r8+Math.imul(HEAP[r2|0],r136+1|0)+r134|0;HEAP[r114]=r116&255}}while(0);do{if((r136|0)>0){r116=r129+Math.imul(HEAP[r2|0],r136)+r134|0;r114=HEAP[r116]&255;r116=r8+Math.imul(HEAP[r2|0],r136)+r134|0;if((HEAP[r116]&255|0)<(r114|0)){r116=r8+Math.imul(HEAP[r2|0],r136)+r134|0;HEAP[r116]=r114&255}if((r134+1|0)>=(HEAP[r2|0]|0)){break}r116=r8+r134+Math.imul(HEAP[r2|0],r136)+1|0;if((HEAP[r116]&255|0)>=(r114|0)){break}r116=r8+r134+Math.imul(HEAP[r2|0],r136)+1|0;HEAP[r116]=r114&255}}while(0);r136=r136+1|0;r114=r134;if((r136|0)<(HEAP[r2+4|0]|0)){r113=r114}else{r137=r114;break L1050}}}else{r137=r135}}while(0);r134=r137+1|0;if((r134|0)>=(HEAP[r2|0]|0)){break L1047}}}}while(0);if((HEAP[r1|0]|0)==0){r137=Math.imul(HEAP[r1+12|0],HEAP[r2|0])+5|0;r135=Math.imul(HEAP[r1+12|0],HEAP[r2+4|0])+5|0;HEAP[r107]=r127;HEAP[r108]=0;HEAP[r109]=0;HEAP[r110]=r137;HEAP[r111]=r135;HEAP[r112]=0;FUNCTION_TABLE[HEAP[HEAP[HEAP[r107]|0]+4|0]](HEAP[HEAP[r107]+4|0],HEAP[r108],HEAP[r109],HEAP[r110],HEAP[r111],HEAP[r112]);r112=Math.imul(HEAP[r1+12|0],HEAP[r1+4|0])+3|0;r111=Math.imul(HEAP[r1+12|0],HEAP[r1+8|0])+3|0;HEAP[r101]=r127;HEAP[r102]=1;HEAP[r103]=1;HEAP[r104]=r112;HEAP[r105]=r111;HEAP[r106]=2;FUNCTION_TABLE[HEAP[HEAP[HEAP[r101]|0]+4|0]](HEAP[HEAP[r101]+4|0],HEAP[r102],HEAP[r103],HEAP[r104],HEAP[r105],HEAP[r106]);HEAP[r1|0]=1;r106=Math.imul(HEAP[r1+12|0],HEAP[r2|0])+5|0;r105=Math.imul(HEAP[r1+12|0],HEAP[r2+4|0])+5|0;HEAP[r96]=r127;HEAP[r97]=0;HEAP[r98]=0;HEAP[r99]=r106;HEAP[r100]=r105;if((HEAP[HEAP[HEAP[r96]|0]+20|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r96]|0]+20|0]](HEAP[HEAP[r96]+4|0],HEAP[r97],HEAP[r98],HEAP[r99],HEAP[r100])}}r134=0;L1077:do{if((r134|0)<(HEAP[r2|0]|0)){r100=r95|0;r99=r95|0;while(1){r136=0;L1081:do{if((r136|0)<(HEAP[r2+4|0]|0)){while(1){r98=0;do{if((r134|0)>=0){r97=r134;if((r97|0)<(HEAP[r2|0]|0)){do{if((r136|0)>=1){if((r136|0)>=(HEAP[r2+4|0]|0)){break}r96=r129+Math.imul(HEAP[r2|0],r136)+r134|0;r98=r98|HEAP[r96]&255}}while(0);r138=r134}else{r138=r97}if(!((r138|0)>=0)){r7=770;break}r96=r134;if((r96|0)>=(HEAP[r2|0]|0)){r139=r96;break}if(!((r136+1|0)>=1)){r7=770;break}if((r136+1|0)>=(HEAP[r2+4|0]|0)){r7=770;break}r96=r129+Math.imul(HEAP[r2|0],r136+1|0)+r134|0;r98=(HEAP[r96]&255)<<2|r98;r7=770;break}else{r7=770}}while(0);if(r7==770){r7=0;r139=r134}do{if((r139|0)>=1){if((r134|0)>=(HEAP[r2|0]|0)){break}if(!((r136|0)>=0)){break}if((r136|0)>=(HEAP[r2+4|0]|0)){break}r96=r130+Math.imul(HEAP[r2|0],r136)+r134|0;r98=(HEAP[r96]&255)<<4|r98}}while(0);do{if((r134+1|0)>=1){if((r134+1|0)>=(HEAP[r2|0]|0)){break}if(!((r136|0)>=0)){break}if((r136|0)>=(HEAP[r2+4|0]|0)){break}r96=r130+r134+Math.imul(HEAP[r2|0],r136)+1|0;r98=(HEAP[r96]&255)<<6|r98}}while(0);r96=r8+Math.imul(HEAP[r2|0],r136)+r134|0;r98=(HEAP[r96]&255)<<8|r98;if((r134+1|0)<(HEAP[r2|0]|0)){r96=r8+r134+Math.imul(HEAP[r2|0],r136)+1|0;r98=(HEAP[r96]&255)<<10|r98}if((r136+1|0)<(HEAP[r2+4|0]|0)){r96=r8+Math.imul(HEAP[r2|0],r136+1|0)+r134|0;r98=(HEAP[r96]&255)<<12|r98}do{if((r134+1|0)<(HEAP[r2|0]|0)){if((r136+1|0)>=(HEAP[r2+4|0]|0)){break}r96=r8+r134+Math.imul(HEAP[r2|0],r136+1|0)+1|0;r98=(HEAP[r96]&255)<<14|r98}}while(0);r96=Math.imul(HEAP[r2|0],r136)+r134|0;do{if((HEAP[HEAP[r2+28|0]+r96|0]&255|0)!=0){if(r6!=0){break}r98=r98|65536}}while(0);do{if((HEAP[r4+48|0]|0)!=0){if((HEAP[r4+40|0]|0)!=(r134|0)){break}if((HEAP[r4+44|0]|0)!=(r136|0)){break}r98=r98|131072}}while(0);r96=Math.imul(HEAP[r1+4|0],r136)+r134|0;if((HEAP[(r96<<2)+HEAP[r1+16|0]|0]|0)!=(r98|0)){HEAP[r84]=r127;HEAP[r85]=r1;HEAP[r86]=r2;HEAP[r87]=r134;HEAP[r88]=r136;HEAP[r89]=r129;HEAP[r90]=r130;HEAP[r91]=r8;HEAP[r92]=r98&196608;r96=Math.imul(HEAP[HEAP[r85]+12|0],HEAP[r87])+2|0;HEAP[r93]=r96;r96=Math.imul(HEAP[HEAP[r85]+12|0],HEAP[r88])+2|0;HEAP[r94]=r96;r96=HEAP[r93];r105=HEAP[r94];r106=HEAP[HEAP[r85]+12|0]+1|0;r104=HEAP[HEAP[r85]+12|0]+1|0;HEAP[r78]=HEAP[r84];HEAP[r79]=r96;HEAP[r80]=r105;HEAP[r81]=r106;HEAP[r82]=r104;HEAP[r83]=4;FUNCTION_TABLE[HEAP[HEAP[HEAP[r78]|0]+4|0]](HEAP[HEAP[r78]+4|0],HEAP[r79],HEAP[r80],HEAP[r81],HEAP[r82],HEAP[r83]);r104=HEAP[r93]+1|0;r106=HEAP[r94]+1|0;r105=HEAP[HEAP[r85]+12|0]-1|0;r96=HEAP[HEAP[r85]+12|0]-1|0;if((HEAP[r92]&131072|0)!=0){r140=7}else{r140=(HEAP[r92]&65536|0)!=0?1:0}HEAP[r72]=HEAP[r84];HEAP[r73]=r104;HEAP[r74]=r106;HEAP[r75]=r105;HEAP[r76]=r96;HEAP[r77]=r140;FUNCTION_TABLE[HEAP[HEAP[HEAP[r72]|0]+4|0]](HEAP[HEAP[r72]+4|0],HEAP[r73],HEAP[r74],HEAP[r75],HEAP[r76],HEAP[r77]);r96=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);if((HEAP[(r96+HEAP[r87]<<2)+HEAP[HEAP[r86]+8|0]|0]|0)!=0){r96=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);_sprintf(r100,66780,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[(r96+HEAP[r87]<<2)+HEAP[HEAP[r86]+8|0]|0],tempInt));r96=((HEAP[HEAP[r85]+12|0]|0)/2&-1)+HEAP[r93]|0;r105=((HEAP[HEAP[r85]+12|0]|0)/2&-1)+HEAP[r94]|0;r106=(HEAP[HEAP[r85]+12|0]|0)/2&-1;HEAP[r64]=HEAP[r84];HEAP[r65]=r96;HEAP[r66]=r105;HEAP[r67]=1;HEAP[r68]=r106;HEAP[r69]=257;HEAP[r70]=3;HEAP[r71]=r99;FUNCTION_TABLE[HEAP[HEAP[HEAP[r64]|0]|0]](HEAP[HEAP[r64]+4|0],HEAP[r65],HEAP[r66],HEAP[r67],HEAP[r68],HEAP[r69],HEAP[r70],HEAP[r71])}do{if((HEAP[r87]|0)>=0){if((HEAP[r87]|0)>=(HEAP[HEAP[r86]|0]|0)){r7=805;break}if(!((HEAP[r88]|0)>=1)){r7=805;break}if((HEAP[r88]|0)>=(HEAP[HEAP[r86]+4|0]|0)){r7=805;break}r106=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);if((HEAP[HEAP[r89]+r106+HEAP[r87]|0]&255|0)!=0){r7=805;break}else{break}}else{r7=805}}while(0);if(r7==805){r7=0;r106=HEAP[r84];r105=HEAP[r93];r96=HEAP[r94];r104=HEAP[HEAP[r85]+12|0]+1|0;do{if((HEAP[r87]|0)>=0){if((HEAP[r87]|0)>=(HEAP[HEAP[r86]|0]|0)){r141=2;break}if(!((HEAP[r88]|0)>=1)){r141=2;break}if((HEAP[r88]|0)>=(HEAP[HEAP[r86]+4|0]|0)){r141=2;break}r103=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);if((HEAP[HEAP[r89]+r103+HEAP[r87]|0]&255|0)==1){r141=2;break}r103=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);r141=(HEAP[HEAP[r89]+r103+HEAP[r87]|0]&255|0)==2?5:6}else{r141=2}}while(0);HEAP[r58]=r106;HEAP[r59]=r105;HEAP[r60]=r96;HEAP[r61]=r104;HEAP[r62]=2;HEAP[r63]=r141;FUNCTION_TABLE[HEAP[HEAP[HEAP[r58]|0]+4|0]](HEAP[HEAP[r58]+4|0],HEAP[r59],HEAP[r60],HEAP[r61],HEAP[r62],HEAP[r63])}do{if((HEAP[r87]|0)>=0){if((HEAP[r87]|0)>=(HEAP[HEAP[r86]|0]|0)){r7=817;break}if(!((HEAP[r88]+1|0)>=1)){r7=817;break}if((HEAP[r88]+1|0)>=(HEAP[HEAP[r86]+4|0]|0)){r7=817;break}r103=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]+1|0);if((HEAP[HEAP[r89]+r103+HEAP[r87]|0]&255|0)!=0){r7=817;break}else{break}}else{r7=817}}while(0);if(r7==817){r7=0;r104=HEAP[r84];r96=HEAP[r93];r105=HEAP[r94]-1+HEAP[HEAP[r85]+12|0]|0;r106=HEAP[HEAP[r85]+12|0]+1|0;do{if((HEAP[r87]|0)>=0){if((HEAP[r87]|0)>=(HEAP[HEAP[r86]|0]|0)){r142=2;break}if(!((HEAP[r88]+1|0)>=1)){r142=2;break}if((HEAP[r88]+1|0)>=(HEAP[HEAP[r86]+4|0]|0)){r142=2;break}r103=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]+1|0);if((HEAP[HEAP[r89]+r103+HEAP[r87]|0]&255|0)==1){r142=2;break}r103=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]+1|0);r142=(HEAP[HEAP[r89]+r103+HEAP[r87]|0]&255|0)==2?5:6}else{r142=2}}while(0);HEAP[r52]=r104;HEAP[r53]=r96;HEAP[r54]=r105;HEAP[r55]=r106;HEAP[r56]=2;HEAP[r57]=r142;FUNCTION_TABLE[HEAP[HEAP[HEAP[r52]|0]+4|0]](HEAP[HEAP[r52]+4|0],HEAP[r53],HEAP[r54],HEAP[r55],HEAP[r56],HEAP[r57])}do{if((HEAP[r87]|0)>=1){if((HEAP[r87]|0)>=(HEAP[HEAP[r86]|0]|0)){r7=829;break}if(!((HEAP[r88]|0)>=0)){r7=829;break}if((HEAP[r88]|0)>=(HEAP[HEAP[r86]+4|0]|0)){r7=829;break}r103=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);if((HEAP[HEAP[r90]+r103+HEAP[r87]|0]&255|0)!=0){r7=829;break}else{break}}else{r7=829}}while(0);if(r7==829){r7=0;r106=HEAP[r84];r105=HEAP[r93];r96=HEAP[r94];r104=HEAP[HEAP[r85]+12|0]+1|0;do{if((HEAP[r87]|0)>=1){if((HEAP[r87]|0)>=(HEAP[HEAP[r86]|0]|0)){r143=2;break}if(!((HEAP[r88]|0)>=0)){r143=2;break}if((HEAP[r88]|0)>=(HEAP[HEAP[r86]+4|0]|0)){r143=2;break}r103=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);if((HEAP[HEAP[r90]+r103+HEAP[r87]|0]&255|0)==1){r143=2;break}r103=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);r143=(HEAP[HEAP[r90]+r103+HEAP[r87]|0]&255|0)==2?5:6}else{r143=2}}while(0);HEAP[r46]=r106;HEAP[r47]=r105;HEAP[r48]=r96;HEAP[r49]=2;HEAP[r50]=r104;HEAP[r51]=r143;FUNCTION_TABLE[HEAP[HEAP[HEAP[r46]|0]+4|0]](HEAP[HEAP[r46]+4|0],HEAP[r47],HEAP[r48],HEAP[r49],HEAP[r50],HEAP[r51])}do{if((HEAP[r87]+1|0)>=1){if((HEAP[r87]+1|0)>=(HEAP[HEAP[r86]|0]|0)){r7=841;break}if(!((HEAP[r88]|0)>=0)){r7=841;break}if((HEAP[r88]|0)>=(HEAP[HEAP[r86]+4|0]|0)){r7=841;break}r103=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);if((HEAP[HEAP[r90]+HEAP[r87]+r103+1|0]&255|0)!=0){r7=841;break}else{break}}else{r7=841}}while(0);if(r7==841){r7=0;r104=HEAP[r84];r96=HEAP[r93]-1+HEAP[HEAP[r85]+12|0]|0;r105=HEAP[r94];r106=HEAP[HEAP[r85]+12|0]+1|0;do{if((HEAP[r87]+1|0)>=1){if((HEAP[r87]+1|0)>=(HEAP[HEAP[r86]|0]|0)){r144=2;break}if(!((HEAP[r88]|0)>=0)){r144=2;break}if((HEAP[r88]|0)>=(HEAP[HEAP[r86]+4|0]|0)){r144=2;break}r103=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);if((HEAP[HEAP[r90]+HEAP[r87]+r103+1|0]&255|0)==1){r144=2;break}r103=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);r144=(HEAP[HEAP[r90]+HEAP[r87]+r103+1|0]&255|0)==2?5:6}else{r144=2}}while(0);HEAP[r40]=r104;HEAP[r41]=r96;HEAP[r42]=r105;HEAP[r43]=2;HEAP[r44]=r106;HEAP[r45]=r144;FUNCTION_TABLE[HEAP[HEAP[HEAP[r40]|0]+4|0]](HEAP[HEAP[r40]+4|0],HEAP[r41],HEAP[r42],HEAP[r43],HEAP[r44],HEAP[r45])}r103=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);if(HEAP[HEAP[r91]+r103+HEAP[r87]|0]<<24>>24!=0){r103=HEAP[r84];r102=HEAP[r93];r101=HEAP[r94];r111=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);if((HEAP[HEAP[r91]+r111+HEAP[r87]|0]&255|0)==1){r145=2}else{r111=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);r145=(HEAP[HEAP[r91]+r111+HEAP[r87]|0]&255|0)==2?5:6}HEAP[r34]=r103;HEAP[r35]=r102;HEAP[r36]=r101;HEAP[r37]=2;HEAP[r38]=2;HEAP[r39]=r145;FUNCTION_TABLE[HEAP[HEAP[HEAP[r34]|0]+4|0]](HEAP[HEAP[r34]+4|0],HEAP[r35],HEAP[r36],HEAP[r37],HEAP[r38],HEAP[r39])}do{if((HEAP[r87]+1|0)<(HEAP[HEAP[r86]|0]|0)){r101=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);if((HEAP[HEAP[r91]+HEAP[r87]+r101+1|0]&255|0)==0){break}r101=HEAP[r84];r102=HEAP[r93]-1+HEAP[HEAP[r85]+12|0]|0;r103=HEAP[r94];r111=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);if((HEAP[HEAP[r91]+HEAP[r87]+r111+1|0]&255|0)==1){r146=2}else{r111=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]);r146=(HEAP[HEAP[r91]+HEAP[r87]+r111+1|0]&255|0)==2?5:6}HEAP[r28]=r101;HEAP[r29]=r102;HEAP[r30]=r103;HEAP[r31]=2;HEAP[r32]=2;HEAP[r33]=r146;FUNCTION_TABLE[HEAP[HEAP[HEAP[r28]|0]+4|0]](HEAP[HEAP[r28]+4|0],HEAP[r29],HEAP[r30],HEAP[r31],HEAP[r32],HEAP[r33])}}while(0);do{if((HEAP[r88]+1|0)<(HEAP[HEAP[r86]+4|0]|0)){r106=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]+1|0);if((HEAP[HEAP[r91]+r106+HEAP[r87]|0]&255|0)==0){break}r106=HEAP[r84];r105=HEAP[r93];r96=HEAP[r94]-1+HEAP[HEAP[r85]+12|0]|0;r104=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]+1|0);if((HEAP[HEAP[r91]+r104+HEAP[r87]|0]&255|0)==1){r147=2}else{r104=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]+1|0);r147=(HEAP[HEAP[r91]+r104+HEAP[r87]|0]&255|0)==2?5:6}HEAP[r22]=r106;HEAP[r23]=r105;HEAP[r24]=r96;HEAP[r25]=2;HEAP[r26]=2;HEAP[r27]=r147;FUNCTION_TABLE[HEAP[HEAP[HEAP[r22]|0]+4|0]](HEAP[HEAP[r22]+4|0],HEAP[r23],HEAP[r24],HEAP[r25],HEAP[r26],HEAP[r27])}}while(0);do{if((HEAP[r87]+1|0)<(HEAP[HEAP[r86]|0]|0)){if((HEAP[r88]+1|0)>=(HEAP[HEAP[r86]+4|0]|0)){break}r96=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]+1|0);if((HEAP[HEAP[r91]+HEAP[r87]+r96+1|0]&255|0)==0){break}r96=HEAP[r84];r105=HEAP[r93]-1+HEAP[HEAP[r85]+12|0]|0;r106=HEAP[r94]-1+HEAP[HEAP[r85]+12|0]|0;r104=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]+1|0);if((HEAP[HEAP[r91]+HEAP[r87]+r104+1|0]&255|0)==1){r148=2}else{r104=Math.imul(HEAP[HEAP[r86]|0],HEAP[r88]+1|0);r148=(HEAP[HEAP[r91]+HEAP[r87]+r104+1|0]&255|0)==2?5:6}HEAP[r16]=r96;HEAP[r17]=r105;HEAP[r18]=r106;HEAP[r19]=2;HEAP[r20]=2;HEAP[r21]=r148;FUNCTION_TABLE[HEAP[HEAP[HEAP[r16]|0]+4|0]](HEAP[HEAP[r16]+4|0],HEAP[r17],HEAP[r18],HEAP[r19],HEAP[r20],HEAP[r21])}}while(0);r106=HEAP[r93];r105=HEAP[r94];r96=HEAP[HEAP[r85]+12|0]+1|0;r104=HEAP[HEAP[r85]+12|0]+1|0;HEAP[r11]=HEAP[r84];HEAP[r12]=r106;HEAP[r13]=r105;HEAP[r14]=r96;HEAP[r15]=r104;if((HEAP[HEAP[HEAP[r11]|0]+20|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r11]|0]+20|0]](HEAP[HEAP[r11]+4|0],HEAP[r12],HEAP[r13],HEAP[r14],HEAP[r15])}r104=Math.imul(HEAP[r1+4|0],r136)+r134|0;HEAP[(r104<<2)+HEAP[r1+16|0]|0]=r98}r136=r136+1|0;if((r136|0)>=(HEAP[r2+4|0]|0)){break L1081}}}}while(0);r134=r134+1|0;if((r134|0)>=(HEAP[r2|0]|0)){break L1077}}}}while(0);do{if((HEAP[r4+16|0]|0)!=0){if(!((HEAP[r4+24|0]|0)>=0)){r7=879;break}if(!((HEAP[r4+28|0]|0)>=0)){r7=879;break}if(!((HEAP[r4+32|0]|0)>=0)){r7=879;break}if(!((HEAP[r4+36|0]|0)>=0)){r7=879;break}r134=HEAP[r4+36|0]-HEAP[r4+28|0]|0;_sprintf(r126|0,66436,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=HEAP[r4+32|0]-HEAP[r4+24|0]|0,HEAP[tempInt+4]=r134,tempInt));break}else{r7=879}}while(0);if(r7==879){HEAP[r126|0]=0}do{if((HEAP[r2+24|0]|0)!=0){_strcat(r126|0,66180)}else{if((HEAP[r2+20|0]|0)==0){break}_strcat(r126|0,66096)}}while(0);_status_bar(r127,r126|0);if((r129|0)!=(HEAP[r2+16|0]|0)){HEAP[r10]=r129;if((HEAP[r10]|0)!=0){_free(HEAP[r10])}r10=r130;HEAP[r9]=r10;if((r10|0)!=0){_free(HEAP[r9])}}r9=r8;HEAP[r3]=r9;if((r9|0)==0){r149=r3;STACKTOP=r5;return}_free(HEAP[r3]);r149=r3;STACKTOP=r5;return}function _game_anim_length(r1,r2,r3,r4){return 0}function _game_flash_length(r1,r2,r3,r4){var r5,r6;r4=r1;r1=r2;do{if((HEAP[r4+20|0]|0)==0){if((HEAP[r1+20|0]|0)==0){break}if((HEAP[r4+24|0]|0)!=0){break}if((HEAP[r1+24|0]|0)!=0){break}r5=.12999999523162842;r6=r5;return r6}}while(0);r5=0;r6=r5;return r6}function _game_status(r1){return(HEAP[r1+20|0]|0)!=0?1:0}function _game_print_size(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;HEAP[r5]=r1;HEAP[r6]=500;HEAP[r7]=r11;HEAP[r8]=r12;HEAP[r10]=r9;HEAP[r9|0]=HEAP[r6];r6=Math.imul(HEAP[HEAP[r10]|0],HEAP[HEAP[r5]|0])+5|0;HEAP[HEAP[r7]]=r6;r6=Math.imul(HEAP[HEAP[r10]|0],HEAP[HEAP[r5]+4|0])+5|0;HEAP[HEAP[r8]]=r6;HEAP[r2]=(HEAP[r11]|0)/100;HEAP[r3]=(HEAP[r12]|0)/100;STACKTOP=r4;return}function _game_print(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80;r4=STACKTOP;STACKTOP=STACKTOP+396|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r4+32;r14=r4+36;r15=r4+40;r16=r4+44;r17=r4+48;r18=r4+52;r19=r4+56;r20=r4+60;r21=r4+64;r22=r4+68;r23=r4+72;r24=r4+76;r25=r4+80;r26=r4+84;r27=r4+88;r28=r4+92;r29=r4+96;r30=r4+100;r31=r4+104;r32=r4+108;r33=r4+112;r34=r4+116;r35=r4+120;r36=r4+124;r37=r4+128;r38=r4+132;r39=r4+136;r40=r4+140;r41=r4+144;r42=r4+148;r43=r4+152;r44=r4+156;r45=r4+160;r46=r4+164;r47=r4+168;r48=r4+172;r49=r4+204;r50=r4+208;r51=r4+212;r52=r4+216;r53=r4+220;r54=r4+224;r55=r4+228;r56=r4+232;r57=r4+236;r58=r4+240;r59=r4+248;r60=r4+256;r61=r4+260;r62=r4+264;r63=r4+268;r64=r4+272;r65=r4+276;r66=r4+280;r67=r4+284;r68=r4+288;r69=r4+292;r70=r4+316;r71=r1;r1=r2;r2=HEAP[r1|0];r72=HEAP[r1+4|0];HEAP[r68]=r71;HEAP[r69]=0;r73=HEAP[r69]|0;r74=HEAP[r69]|0;r75=HEAP[r69]|0;r76=HEAP[r69]|0;HEAP[r61]=HEAP[r68];HEAP[r62]=r73;HEAP[r63]=r74;HEAP[r64]=r75;HEAP[r65]=r76;HEAP[r66]=-1;HEAP[r67]=0;if((HEAP[HEAP[r61]+12|0]|0)>=(HEAP[HEAP[r61]+16|0]|0)){HEAP[HEAP[r61]+16|0]=HEAP[HEAP[r61]+12|0]+16|0;r76=_srealloc(HEAP[HEAP[r61]+8|0],HEAP[HEAP[r61]+16|0]*24&-1);HEAP[HEAP[r61]+8|0]=r76}HEAP[HEAP[HEAP[r61]+8|0]+(HEAP[HEAP[r61]+12|0]*24&-1)|0]=HEAP[r66];HEAP[HEAP[HEAP[r61]+8|0]+(HEAP[HEAP[r61]+12|0]*24&-1)+4|0]=HEAP[r67];HEAP[HEAP[HEAP[r61]+8|0]+(HEAP[HEAP[r61]+12|0]*24&-1)+8|0]=HEAP[r62];HEAP[HEAP[HEAP[r61]+8|0]+(HEAP[HEAP[r61]+12|0]*24&-1)+12|0]=HEAP[r63];HEAP[HEAP[HEAP[r61]+8|0]+(HEAP[HEAP[r61]+12|0]*24&-1)+16|0]=HEAP[r64];HEAP[HEAP[HEAP[r61]+8|0]+(HEAP[HEAP[r61]+12|0]*24&-1)+20|0]=HEAP[r65];r65=HEAP[r61]+12|0;r61=HEAP[r65];HEAP[r65]=r61+1|0;r65=r61;r61=r4+296;HEAP[r4+244]=r71;HEAP[r59]=r61;HEAP[r4+252]=0;HEAP[r60]=r3;HEAP[HEAP[r59]+12|0]=HEAP[r60];r60=(HEAP[r61+12|0]|0)/10&-1;HEAP[r49]=r71;HEAP[r50]=r60;r60=HEAP[HEAP[HEAP[r49]|0]+84|0];r59=HEAP[HEAP[r49]+4|0];r3=Math.sqrt(HEAP[HEAP[r49]+20|0]);FUNCTION_TABLE[r60](r59,r3*(HEAP[r50]|0));r50=Math.imul(HEAP[r61+12|0],r2);r3=Math.imul(HEAP[r61+12|0],r72);HEAP[r38]=r71;HEAP[r39]=2;HEAP[r40]=2;HEAP[r41]=r50;HEAP[r42]=r3;HEAP[r43]=r65;HEAP[r44]=HEAP[r39];HEAP[r45]=HEAP[r39]-1+HEAP[r41]|0;HEAP[r46]=HEAP[r40];HEAP[r47]=HEAP[r40]-1+HEAP[r42]|0;HEAP[r48|0]=HEAP[r44];HEAP[r48+4|0]=HEAP[r46];HEAP[r48+8|0]=HEAP[r44];HEAP[r48+12|0]=HEAP[r47];HEAP[r48+16|0]=HEAP[r45];HEAP[r48+20|0]=HEAP[r47];HEAP[r48+24|0]=HEAP[r45];HEAP[r48+28|0]=HEAP[r46];r46=HEAP[r43];HEAP[r33]=HEAP[r38];HEAP[r34]=r48|0;HEAP[r35]=4;HEAP[r36]=-1;HEAP[r37]=r46;FUNCTION_TABLE[HEAP[HEAP[HEAP[r33]|0]+12|0]](HEAP[HEAP[r33]+4|0],HEAP[r34],HEAP[r35],HEAP[r36],HEAP[r37]);r37=(HEAP[r61+12|0]|0)/256&-1;HEAP[r31]=r71;HEAP[r32]=r37;r37=HEAP[HEAP[HEAP[r31]|0]+84|0];r36=HEAP[HEAP[r31]+4|0];r35=Math.sqrt(HEAP[HEAP[r31]+20|0]);FUNCTION_TABLE[r37](r36,r35*(HEAP[r32]|0));r32=1;L1276:do{if((r32|0)<(r2|0)){while(1){r35=Math.imul(HEAP[r61+12|0],r32)+2|0;r36=Math.imul(HEAP[r61+12|0],r32)+2|0;r37=Math.imul(HEAP[r61+12|0],r72)+2|0;HEAP[r25]=r71;HEAP[r26]=r35;HEAP[r27]=2;HEAP[r28]=r36;HEAP[r29]=r37;HEAP[r30]=r65;FUNCTION_TABLE[HEAP[HEAP[HEAP[r25]|0]+8|0]](HEAP[HEAP[r25]+4|0],HEAP[r26],HEAP[r27],HEAP[r28],HEAP[r29],HEAP[r30]);r32=r32+1|0;if((r32|0)>=(r2|0)){break L1276}}}}while(0);r30=1;r29=r71;r28=HEAP[r61+12|0];L1281:do{if((r30|0)<(r72|0)){r27=r29;while(1){r26=Math.imul(HEAP[r61+12|0],r30)+2|0;r25=Math.imul(HEAP[r61+12|0],r2)+2|0;r37=Math.imul(HEAP[r61+12|0],r30)+2|0;HEAP[r19]=r27;HEAP[r20]=2;HEAP[r21]=r26;HEAP[r22]=r25;HEAP[r23]=r37;HEAP[r24]=r65;FUNCTION_TABLE[HEAP[HEAP[HEAP[r19]|0]+8|0]](HEAP[HEAP[r19]+4|0],HEAP[r20],HEAP[r21],HEAP[r22],HEAP[r23],HEAP[r24]);r30=r30+1|0;r37=r71;if((r30|0)<(r72|0)){r27=r37}else{r77=r37;r78=HEAP[r61+12|0];break L1281}}}else{r77=r29;r78=r28}}while(0);HEAP[r17]=r77;HEAP[r18]=(r78|0)/10&-1;r78=HEAP[HEAP[HEAP[r17]|0]+84|0];r77=HEAP[HEAP[r17]+4|0];r28=Math.sqrt(HEAP[HEAP[r17]+20|0]);FUNCTION_TABLE[r78](r77,r28*(HEAP[r18]|0));r30=0;L1286:do{if((r30|0)<=(r72|0)){while(1){r32=0;r18=r32;L1290:do{if((r18|0)<=(r2|0)){r28=r18;while(1){do{if((r28|0)>=0){r77=r32;if((r77|0)<(HEAP[r1|0]|0)){do{if((r30|0)>=1){if((r30|0)>=(HEAP[r1+4|0]|0)){break}r78=Math.imul(HEAP[r1|0],r30)+r32|0;if((HEAP[HEAP[r1+16|0]+r78|0]&255|0)==0){break}r78=Math.imul(HEAP[r61+12|0],r32)+2|0;r17=Math.imul(HEAP[r61+12|0],r30)+2|0;r29=Math.imul(HEAP[r61+12|0],r32+1|0)+2|0;r24=Math.imul(HEAP[r61+12|0],r30)+2|0;HEAP[r11]=r71;HEAP[r12]=r78;HEAP[r13]=r17;HEAP[r14]=r29;HEAP[r15]=r24;HEAP[r16]=r65;FUNCTION_TABLE[HEAP[HEAP[HEAP[r11]|0]+8|0]](HEAP[HEAP[r11]+4|0],HEAP[r12],HEAP[r13],HEAP[r14],HEAP[r15],HEAP[r16])}}while(0);r79=r32}else{r79=r77}if(!((r79|0)>=1)){break}if((r32|0)>=(HEAP[r1|0]|0)){break}if(!((r30|0)>=0)){break}if((r30|0)>=(HEAP[r1+4|0]|0)){break}r24=Math.imul(HEAP[r1|0],r30)+r32|0;if((HEAP[HEAP[r1+12|0]+r24|0]&255|0)==0){break}r24=Math.imul(HEAP[r61+12|0],r32)+2|0;r29=Math.imul(HEAP[r61+12|0],r30)+2|0;r17=Math.imul(HEAP[r61+12|0],r32)+2|0;r78=Math.imul(HEAP[r61+12|0],r30+1|0)+2|0;HEAP[r5]=r71;HEAP[r6]=r24;HEAP[r7]=r29;HEAP[r8]=r17;HEAP[r9]=r78;HEAP[r10]=r65;FUNCTION_TABLE[HEAP[HEAP[HEAP[r5]|0]+8|0]](HEAP[HEAP[r5]+4|0],HEAP[r6],HEAP[r7],HEAP[r8],HEAP[r9],HEAP[r10])}}while(0);r32=r32+1|0;r78=r32;if((r78|0)<=(r2|0)){r28=r78}else{break L1290}}}}while(0);r30=r30+1|0;if(!((r30|0)<=(r72|0))){break L1286}}}}while(0);r30=0;if((r30|0)>=(r72|0)){STACKTOP=r4;return}r10=r70|0;r9=r70|0;while(1){r32=0;r70=r30;L1316:do{if((r32|0)<(r2|0)){r8=r70;while(1){r7=Math.imul(HEAP[r1|0],r8)+r32|0;if((HEAP[(r7<<2)+HEAP[r1+8|0]|0]|0)!=0){r7=Math.imul(HEAP[r1|0],r30)+r32|0;_sprintf(r10,66780,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[(r7<<2)+HEAP[r1+8|0]|0],tempInt));r7=(Math.imul(HEAP[r61+12|0],r32)+2|0)+((HEAP[r61+12|0]|0)/2&-1)|0;r6=(Math.imul(HEAP[r61+12|0],r30)+2|0)+((HEAP[r61+12|0]|0)/2&-1)|0;r5=(HEAP[r61+12|0]|0)/2&-1;HEAP[r51]=r71;HEAP[r52]=r7;HEAP[r53]=r6;HEAP[r54]=1;HEAP[r55]=r5;HEAP[r56]=257;HEAP[r57]=r65;HEAP[r58]=r9;FUNCTION_TABLE[HEAP[HEAP[HEAP[r51]|0]|0]](HEAP[HEAP[r51]+4|0],HEAP[r52],HEAP[r53],HEAP[r54],HEAP[r55],HEAP[r56],HEAP[r57],HEAP[r58])}r32=r32+1|0;r5=r30;if((r32|0)<(r2|0)){r8=r5}else{r80=r5;break L1316}}}else{r80=r70}}while(0);r30=r80+1|0;if((r30|0)>=(r72|0)){break}}STACKTOP=r4;return}function _game_timing_state(r1,r2){return 1}function _grid_draw_rect(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r11=0;r12=r1;r1=r2;r2=r3;r3=r4;r4=r5;r5=r6;r6=r7;r7=r8;r8=r9;r9=r10;r10=0;r13=r6;r14=r13;r15=r7;L1326:do{if((r14|0)<(r8|0)){r16=r14;while(1){L1329:do{if((r15|0)<=(r9|0)){r17=r16;while(1){do{if((r17|0)>=0){if((r13|0)>=(HEAP[r12|0]|0)){break}if(!((r15|0)>=1)){break}if((r15|0)>=(HEAP[r12+4|0]|0)){break}r18=r1+Math.imul(HEAP[r12|0],r15)+r13|0;r19=HEAP[r18]&255;do{if((r15|0)==(r7|0)){r11=953}else{if((r15|0)==(r9|0)){r11=953;break}if((r3|0)!=1){break}r19=0;break}}while(0);if(r11==953){r11=0;if((r5|0)==0){break}r19=r3}if((r10|0)!=0){r20=1}else{r18=r1+Math.imul(HEAP[r12|0],r15)+r13|0;r20=(HEAP[r18]&255|0)!=(r19|0)}r10=r20&1;if((r4|0)==0){break}r18=r1+Math.imul(HEAP[r12|0],r15)+r13|0;HEAP[r18]=r19&255}}while(0);r15=r15+1|0;r18=r13;if((r15|0)<=(r9|0)){r17=r18}else{r21=r18;break L1329}}}else{r21=r16}}while(0);r13=r21+1|0;r17=r13;r15=r7;if((r17|0)<(r8|0)){r16=r17}else{break L1326}}}}while(0);if((r15|0)>=(r9|0)){r22=r10;return r22}while(1){r13=r6;r7=r13;L1356:do{if((r7|0)<=(r8|0)){r21=r7;while(1){do{if((r21|0)>=1){if((r13|0)>=(HEAP[r12|0]|0)){break}if(!((r15|0)>=0)){break}if((r15|0)>=(HEAP[r12+4|0]|0)){break}r1=r2+Math.imul(HEAP[r12|0],r15)+r13|0;r20=HEAP[r1]&255;do{if((r13|0)==(r6|0)){r11=970}else{if((r13|0)==(r8|0)){r11=970;break}if((r3|0)!=1){break}r20=0;break}}while(0);if(r11==970){r11=0;if((r5|0)==0){break}r20=r3}if((r10|0)!=0){r23=1}else{r1=r2+Math.imul(HEAP[r12|0],r15)+r13|0;r23=(HEAP[r1]&255|0)!=(r20|0)}r10=r23&1;if((r4|0)==0){break}r1=r2+Math.imul(HEAP[r12|0],r15)+r13|0;HEAP[r1]=r20&255}}while(0);r13=r13+1|0;r1=r13;if((r1|0)<=(r8|0)){r21=r1}else{break L1356}}}}while(0);r15=r15+1|0;if((r15|0)>=(r9|0)){break}}r22=r10;return r22}function _get_correct(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=r2+4;r5=r1;r1=Math.imul(HEAP[r5+4|0],HEAP[r5|0]);HEAP[r3]=r1;r1=_malloc(HEAP[r3]);HEAP[r4]=r1;if((HEAP[r4]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r1=HEAP[r4];r4=r1;r3=Math.imul(HEAP[r5+4|0],HEAP[r5|0]);for(r6=r4,r7=r6+r3;r6<r7;r6++){HEAP[r6]=-1}r3=0;if((r3|0)>=(HEAP[r5|0]|0)){r8=r1;STACKTOP=r2;return r8}while(1){r4=0;L1387:do{if((r4|0)<(HEAP[r5+4|0]|0)){while(1){r6=r1+Math.imul(HEAP[r5|0],r4)+r3|0;L1390:do{if((HEAP[r6]&255|0)==255){r7=1;L1392:do{if((r7+r3|0)<(HEAP[r5|0]|0)){while(1){r9=Math.imul(HEAP[r5|0],r4)+r3+r7|0;if(!(HEAP[HEAP[r5+12|0]+r9|0]<<24>>24!=0^1)){break L1392}r7=r7+1|0;if((r7+r3|0)>=(HEAP[r5|0]|0)){break L1392}}}}while(0);r9=1;L1397:do{if((r9+r4|0)<(HEAP[r5+4|0]|0)){while(1){r10=Math.imul(HEAP[r5|0],r9+r4|0)+r3|0;if(!(HEAP[HEAP[r5+16|0]+r10|0]<<24>>24!=0^1)){break L1397}r9=r9+1|0;if((r9+r4|0)>=(HEAP[r5+4|0]|0)){break L1397}}}}while(0);r10=1;r11=r3;r12=r4;L1402:do{if((r11|0)<(r7+r3|0)){while(1){r13=r11;L1405:do{if((r12|0)<=(r9+r4|0)){r14=r13;while(1){do{if((r14|0)>=0){if((r11|0)>=(HEAP[r5|0]|0)){r15=1;break}if(!((r12|0)>=1)){r15=1;break}if((r12|0)>=(HEAP[r5+4|0]|0)){r15=1;break}r16=Math.imul(HEAP[r5|0],r12)+r11|0;r15=(HEAP[HEAP[r5+16|0]+r16|0]&255|0)!=0}else{r15=1}}while(0);if((r12|0)==(r4|0)){r17=1}else{r17=(r12|0)==(r9+r4|0)}if((r15&1|0)!=(r17&1|0)){r10=0}r12=r12+1|0;r16=r11;if((r12|0)<=(r9+r4|0)){r14=r16}else{r18=r16;break L1405}}}else{r18=r13}}while(0);r11=r18+1|0;r12=r4;if((r11|0)>=(r7+r3|0)){break L1402}}}}while(0);L1422:do{if((r12|0)<(r9+r4|0)){while(1){r11=r3;r13=r11;L1425:do{if((r13|0)<=(r7+r3|0)){r14=r13;while(1){do{if((r14|0)>=1){if((r11|0)>=(HEAP[r5|0]|0)){r19=1;break}if(!((r12|0)>=0)){r19=1;break}if((r12|0)>=(HEAP[r5+4|0]|0)){r19=1;break}r16=Math.imul(HEAP[r5|0],r12)+r11|0;r19=(HEAP[HEAP[r5+12|0]+r16|0]&255|0)!=0}else{r19=1}}while(0);if((r11|0)==(r3|0)){r20=1}else{r20=(r11|0)==(r7+r3|0)}if((r19&1|0)!=(r20&1|0)){r10=0}r11=r11+1|0;r16=r11;if((r16|0)<=(r7+r3|0)){r14=r16}else{break L1425}}}}while(0);r12=r12+1|0;if((r12|0)>=(r9+r4|0)){break L1422}}}}while(0);if((r10|0)==0){r13=r1+Math.imul(HEAP[r5|0],r4)+r3|0;HEAP[r13]=0;break}r13=0;r14=0;r11=r3;L1445:do{if((r11|0)<(r7+r3|0)){while(1){r12=r4;L1448:do{if((r12|0)<(r9+r4|0)){while(1){r14=r14+1|0;r16=Math.imul(HEAP[r5|0],r12)+r11|0;if((HEAP[(r16<<2)+HEAP[r5+8|0]|0]|0)!=0){if((r13|0)>0){r10=0}r16=Math.imul(HEAP[r5|0],r12)+r11|0;r13=HEAP[(r16<<2)+HEAP[r5+8|0]|0]}r12=r12+1|0;if((r12|0)>=(r9+r4|0)){break L1448}}}}while(0);r11=r11+1|0;if((r11|0)>=(r7+r3|0)){break L1445}}}}while(0);if((r13|0)!=(r14|0)){r10=0}r11=r3;if((r11|0)>=(r7+r3|0)){break}while(1){r12=r4;L1464:do{if((r12|0)<(r9+r4|0)){while(1){r16=r1+Math.imul(HEAP[r5|0],r12)+r11|0;HEAP[r16]=r10&255;r12=r12+1|0;if((r12|0)>=(r9+r4|0)){break L1464}}}}while(0);r11=r11+1|0;if((r11|0)>=(r7+r3|0)){break L1390}}}}while(0);r4=r4+1|0;if((r4|0)>=(HEAP[r5+4|0]|0)){break L1387}}}}while(0);r3=r3+1|0;if((r3|0)>=(HEAP[r5|0]|0)){break}}r8=r1;STACKTOP=r2;return r8}function _coord_round(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11;r5=r1;r1=r2;r2=r3;r3=r4;r4=Math.floor(r5)+.5;r6=Math.floor(r1)+.5;r7=Math.floor(r5+.5);r8=Math.floor(r1+.5);r9=Math.abs(r5-r7);r10=Math.abs(r1-r8);r11=r9>r10?r9:r10;if(r11<.15000000596046448){HEAP[r2]=(r7&-1)<<1;HEAP[r3]=(r8&-1)<<1;return}r9=Math.abs(r5-r4);r10=Math.abs(r1-r6);r11=r9>r10?r9:r10;if(r11<.15000000596046448){HEAP[r2]=((r4&-1)<<1)+1|0;HEAP[r3]=((r6&-1)<<1)+1|0;return}if(r9>r10){HEAP[r2]=(r7&-1)<<1;r7=((Math.floor(r6)&-1)<<1)+1|0;HEAP[r3]=r7;return}else{r7=((Math.floor(r4)&-1)<<1)+1|0;HEAP[r2]=r7;HEAP[r3]=(r8&-1)<<1;return}}function _rect_solver(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58;r8=0;r9=STACKTOP;STACKTOP=STACKTOP+112|0;r10=r9;r11=r9+4;r12=r9+8;r13=r9+12;r14=r9+16;r15=r9+20;r16=r9+24;r17=r9+28;r18=r9+32;r19=r9+36;r20=r9+40;r21=r9+48;r22=r9+52;r23=r9+56;r24=r9+60;r25=r9+64;r26=r9+68;r27=r9+72;r28=r9+76;r29=r9+80;r30=r9+84;r31=r9+96;r32=r1;r1=r2;r2=r3;r3=r4;r4=r5;r5=r6;r6=r7;HEAP[r28]=r2<<3;r7=_malloc(HEAP[r28]);HEAP[r29]=r7;if((HEAP[r29]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r7=HEAP[r29];r29=0;L1489:do{if((r29|0)<(r2|0)){while(1){r28=HEAP[r3+(r29*12&-1)|0];r33=-1;r34=-1;r35=r32;r36=r1;r37=0;L1492:do{if((r37|0)<(HEAP[r3+(r29*12&-1)+4|0]|0)){while(1){if((r35|0)>(HEAP[(r37<<3)+HEAP[r3+(r29*12&-1)+8|0]|0]|0)){r35=HEAP[(r37<<3)+HEAP[r3+(r29*12&-1)+8|0]|0]}if((r36|0)>(HEAP[(r37<<3)+HEAP[r3+(r29*12&-1)+8|0]+4|0]|0)){r36=HEAP[(r37<<3)+HEAP[r3+(r29*12&-1)+8|0]+4|0]}if((r34|0)<(HEAP[(r37<<3)+HEAP[r3+(r29*12&-1)+8|0]|0]|0)){r34=HEAP[(r37<<3)+HEAP[r3+(r29*12&-1)+8|0]|0]}if((r33|0)<(HEAP[(r37<<3)+HEAP[r3+(r29*12&-1)+8|0]+4|0]|0)){r33=HEAP[(r37<<3)+HEAP[r3+(r29*12&-1)+8|0]+4|0]}r37=r37+1|0;if((r37|0)>=(HEAP[r3+(r29*12&-1)+4|0]|0)){break L1492}}}}while(0);r38=0;r39=0;r40=0;r41=1;L1508:do{if((r41|0)<=(r28|0)){while(1){if(!((r41|0)<=(r32|0))){break L1508}L1512:do{if(((r28|0)%(r41|0)|0)==0){r42=(r28|0)/(r41|0)&-1;if((r42|0)>(r1|0)){break}r43=r36+ -r42+1|0;r44=r43;if((r44|0)<=(r33|0)){r45=r44}else{break}while(1){L1517:do{if((r45|0)>=0){if((r42+r43|0)>(r1|0)){break}r44=r35+ -r41+1|0;r46=r44;if((r46|0)<=(r34|0)){r47=r46}else{break}while(1){do{if((r47|0)>=0){if((r41+r44|0)>(r32|0)){break}r37=0;L1525:do{if((r37|0)<(HEAP[r3+(r29*12&-1)+4|0]|0)){while(1){do{if((HEAP[(r37<<3)+HEAP[r3+(r29*12&-1)+8|0]|0]|0)>=(r44|0)){if((HEAP[(r37<<3)+HEAP[r3+(r29*12&-1)+8|0]|0]|0)>=(r41+r44|0)){break}if(!((HEAP[(r37<<3)+HEAP[r3+(r29*12&-1)+8|0]+4|0]|0)>=(r43|0))){break}if((HEAP[(r37<<3)+HEAP[r3+(r29*12&-1)+8|0]+4|0]|0)<(r42+r43|0)){break L1525}}}while(0);r37=r37+1|0;if((r37|0)>=(HEAP[r3+(r29*12&-1)+4|0]|0)){break L1525}}}}while(0);if((r37|0)>=(HEAP[r3+(r29*12&-1)+4|0]|0)){break}if((r40|0)>=(r39|0)){r39=r40+32|0;r38=_srealloc(r38,r39<<4)}HEAP[(r40<<4)+r38|0]=r44;HEAP[(r40<<4)+r38+4|0]=r43;HEAP[(r40<<4)+r38+8|0]=r41;HEAP[(r40<<4)+r38+12|0]=r42;r40=r40+1|0}}while(0);r44=r44+1|0;r46=r44;if((r46|0)<=(r34|0)){r47=r46}else{break L1517}}}}while(0);r43=r43+1|0;r44=r43;if((r44|0)<=(r33|0)){r45=r44}else{break L1512}}}}while(0);r41=r41+1|0;if(!((r41|0)<=(r28|0))){break L1508}}}}while(0);HEAP[(r29<<3)+r7|0]=r38;HEAP[(r29<<3)+r7+4|0]=r40;r29=r29+1|0;if((r29|0)>=(r2|0)){break L1489}}}}while(0);r45=Math.imul(Math.imul(r2<<2,r32),r1);HEAP[r26]=r45;r45=_malloc(HEAP[r26]);HEAP[r27]=r45;if((r45|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r45=HEAP[r27];r27=r45;r26=Math.imul(Math.imul(r2<<2,r32),r1);for(r48=r27,r49=r48+r26;r48<r49;r48++){HEAP[r48]=0}r29=0;L1546:do{if((r29|0)<(r2|0)){while(1){r26=0;L1549:do{if((r26|0)<(HEAP[(r29<<3)+r7+4|0]|0)){while(1){r27=0;L1552:do{if((r27|0)<(HEAP[(r26<<4)+HEAP[(r29<<3)+r7|0]+12|0]|0)){while(1){r47=0;L1555:do{if((r47|0)<(HEAP[(r26<<4)+HEAP[(r29<<3)+r7|0]+8|0]|0)){while(1){r28=((Math.imul((Math.imul(r1,r29)+r27|0)+HEAP[(r26<<4)+HEAP[(r29<<3)+r7|0]+4|0]|0,r32)+r47|0)+HEAP[(r26<<4)+HEAP[(r29<<3)+r7|0]|0]<<2)+r45|0;HEAP[r28]=HEAP[r28]+1|0;r47=r47+1|0;if((r47|0)>=(HEAP[(r26<<4)+HEAP[(r29<<3)+r7|0]+8|0]|0)){break L1555}}}}while(0);r27=r27+1|0;if((r27|0)>=(HEAP[(r26<<4)+HEAP[(r29<<3)+r7|0]+12|0]|0)){break L1552}}}}while(0);r26=r26+1|0;if((r26|0)>=(HEAP[(r29<<3)+r7+4|0]|0)){break L1549}}}}while(0);r29=r29+1|0;if((r29|0)>=(r2|0)){break L1546}}}}while(0);r26=Math.imul(r32<<2,r1);HEAP[r24]=r26;r26=_malloc(HEAP[r24]);HEAP[r25]=r26;if((r26|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r26=HEAP[r25];r29=0;L1565:do{if((r29|0)<(Math.imul(r1,r32)|0)){while(1){HEAP[(r29<<2)+r26|0]=-1;r29=r29+1|0;if((r29|0)>=(Math.imul(r1,r32)|0)){break L1565}}}}while(0);r29=0;L1569:do{if((r29|0)<(r2|0)){while(1){r25=0;L1572:do{if((r25|0)<(HEAP[r3+(r29*12&-1)+4|0]|0)){while(1){r24=HEAP[(r25<<3)+HEAP[r3+(r29*12&-1)+8|0]|0];r40=HEAP[(r25<<3)+HEAP[r3+(r29*12&-1)+8|0]+4|0];r38=(Math.imul(r32,r40)+r24<<2)+r26|0;if((HEAP[r38]|0)!=-1){___assert_func(65948,491,67840,67016)}r38=(Math.imul(r32,r40)+r24<<2)+r26|0;HEAP[r38]=r29;r25=r25+1|0;if((r25|0)>=(HEAP[r3+(r29*12&-1)+4|0]|0)){break L1572}}}}while(0);r29=r29+1|0;if((r29|0)>=(r2|0)){break L1569}}}}while(0);HEAP[r22]=r2<<2;r25=_malloc(HEAP[r22]);HEAP[r23]=r25;if((r25|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r25=HEAP[r23];r23=r30;r22=r30|0;r38=r30+4|0;r24=r30+8|0;r30=r31;r40=r31|0;r27=r20;r47=r20;r20=r31|0;r28=r31+8|0;r41=r31+4|0;r33=r31+4|0;r34=r31+12|0;L1583:while(1){r31=0;r29=0;L1585:do{if((r29|0)<(r2|0)){while(1){do{if((HEAP[r3+(r29*12&-1)+4|0]|0)==1){r39=HEAP[HEAP[r3+(r29*12&-1)+8|0]|0];r37=HEAP[HEAP[r3+(r29*12&-1)+8|0]+4|0];r35=(Math.imul(Math.imul(r1,r29)+r37|0,r32)+r39<<2)+r45|0;if(!((HEAP[r35]|0)>=-1)){break}r35=(Math.imul(Math.imul(r1,r29)+r37|0,r32)+r39<<2)+r45|0;if((HEAP[r35]|0)<=0){r8=1117;break L1583}r35=0;L1592:do{if((r35|0)<(r2|0)){while(1){r36=(Math.imul(Math.imul(r1,r35)+r37|0,r32)+r39<<2)+r45|0;HEAP[r36]=-1;r35=r35+1|0;if((r35|0)>=(r2|0)){break L1592}}}}while(0);r35=(Math.imul(Math.imul(r1,r29)+r37|0,r32)+r39<<2)+r45|0;HEAP[r35]=-2}}while(0);r29=r29+1|0;if((r29|0)>=(r2|0)){break L1585}}}}while(0);r29=0;L1598:do{if((r29|0)<(r2|0)){while(1){r35=0;r36=0;r43=r32;r42=r1;r44=0;L1601:do{if((r44|0)<(HEAP[(r29<<3)+r7+4|0]|0)){while(1){r46=HEAP[(r44<<4)+HEAP[(r29<<3)+r7|0]|0];r50=HEAP[(r44<<4)+HEAP[(r29<<3)+r7|0]+4|0];r51=HEAP[(r44<<4)+HEAP[(r29<<3)+r7|0]+8|0];r52=HEAP[(r44<<4)+HEAP[(r29<<3)+r7|0]+12|0];if((r36|0)<(r46|0)){r36=r46}if((r35|0)<(r50|0)){r35=r50}if((r43|0)>(r51+r46|0)){r43=r51+r46|0}if((r42|0)>(r52+r50|0)){r42=r52+r50|0}r44=r44+1|0;if((r44|0)>=(HEAP[(r29<<3)+r7+4|0]|0)){break L1601}}}}while(0);r39=r35;L1617:do{if((r39|0)<(r42|0)){while(1){r37=r36;L1620:do{if((r37|0)<(r43|0)){while(1){r50=(Math.imul(Math.imul(r1,r29)+r39|0,r32)+r37<<2)+r45|0;if((HEAP[r50]|0)>=-1){r50=(Math.imul(Math.imul(r1,r29)+r39|0,r32)+r37<<2)+r45|0;if((HEAP[r50]|0)<=0){r8=1137;break L1583}r44=0;L1626:do{if((r44|0)<(r2|0)){while(1){r50=(Math.imul(Math.imul(r1,r44)+r39|0,r32)+r37<<2)+r45|0;HEAP[r50]=-1;r44=r44+1|0;if((r44|0)>=(r2|0)){break L1626}}}}while(0);r50=(Math.imul(Math.imul(r1,r29)+r39|0,r32)+r37<<2)+r45|0;HEAP[r50]=-2}r37=r37+1|0;if((r37|0)>=(r43|0)){break L1620}}}}while(0);r39=r39+1|0;if((r39|0)>=(r42|0)){break L1617}}}}while(0);r29=r29+1|0;if((r29|0)>=(r2|0)){break L1598}}}}while(0);r29=0;L1634:do{if((r29|0)<(r2|0)){while(1){r42=0;L1637:do{if((r42|0)<(HEAP[(r29<<3)+r7+4|0]|0)){while(1){r39=0;r43=0;L1640:do{if((r43|0)<(r2|0)){while(1){HEAP[(r43<<2)+r25|0]=0;r43=r43+1|0;if((r43|0)>=(r2|0)){break L1640}}}}while(0);r44=0;L1644:do{if((r44|0)<(HEAP[(r42<<4)+HEAP[(r29<<3)+r7|0]+12|0]|0)){while(1){r36=HEAP[(r42<<4)+HEAP[(r29<<3)+r7|0]+4|0]+r44|0;r35=0;L1647:do{if((r35|0)<(HEAP[(r42<<4)+HEAP[(r29<<3)+r7|0]+8|0]|0)){while(1){r37=HEAP[(r42<<4)+HEAP[(r29<<3)+r7|0]|0]+r35|0;r50=(Math.imul(Math.imul(r1,r29)+r36|0,r32)+r37<<2)+r45|0;if((HEAP[r50]|0)==-1){r39=1}r50=(Math.imul(r32,r36)+r37<<2)+r26|0;if((HEAP[r50]|0)!=-1){r50=(Math.imul(r32,r36)+r37<<2)+r26|0;r37=(HEAP[r50]<<2)+r25|0;HEAP[r37]=HEAP[r37]+1|0}r35=r35+1|0;if((r35|0)>=(HEAP[(r42<<4)+HEAP[(r29<<3)+r7|0]+8|0]|0)){break L1647}}}}while(0);r44=r44+1|0;if((r44|0)>=(HEAP[(r42<<4)+HEAP[(r29<<3)+r7|0]+12|0]|0)){break L1644}}}}while(0);L1658:do{if((r39|0)!=0){r8=1166}else{r43=0;L1660:do{if((r43|0)<(r2|0)){while(1){if((r43|0)!=(r29|0)){if((HEAP[(r43<<2)+r25|0]|0)==(HEAP[r3+(r43*12&-1)+4|0]|0)){break}}r43=r43+1|0;if((r43|0)>=(r2|0)){break L1660}}r39=1;r8=1166;break L1658}}while(0);if((r39|0)!=0){r8=1166;break}if((HEAP[(r29<<2)+r25|0]|0)==0){r39=1;r8=1166;break}else{if((r39|0)!=0){r8=1166;break}else{break}}}}while(0);if(r8==1166){r8=0;_remove_rect_placement(r32,r1,r7,r45,r29,r42);r42=r42-1|0;r31=1}r42=r42+1|0;if((r42|0)>=(HEAP[(r29<<3)+r7+4|0]|0)){break L1637}}}}while(0);r29=r29+1|0;if((r29|0)>=(r2|0)){break L1634}}}}while(0);r42=0;L1677:do{if((r42|0)<(r1|0)){while(1){r39=0;r43=r42;L1680:do{if((r39|0)<(r32|0)){r44=r43;while(1){r35=(Math.imul(r32,r44)+r39<<2)+r45|0;L1683:do{if((HEAP[r35]|0)>=0){r36=0;r37=-1;r29=0;L1685:do{if((r29|0)<(r2|0)){while(1){r50=(Math.imul(Math.imul(r1,r29)+r42|0,r32)+r39<<2)+r45|0;if((HEAP[r50]|0)>0){r36=r36+1|0;r37=r29}r29=r29+1|0;if((r29|0)>=(r2|0)){break L1685}}}}while(0);if((r36|0)!=1){break}r50=0;if((r50|0)>=(HEAP[(r37<<3)+r7+4|0]|0)){break}while(1){r52=(r50<<4)+HEAP[(r37<<3)+r7|0]|0;do{if((r39|0)>=(HEAP[r52|0]|0)){if((r39|0)>=(HEAP[r52+8|0]+HEAP[r52|0]|0)){r8=1182;break}if(!((r42|0)>=(HEAP[r52+4|0]|0))){r8=1182;break}if((r42|0)<(HEAP[r52+12|0]+HEAP[r52+4|0]|0)){break}else{r8=1182;break}}else{r8=1182}}while(0);if(r8==1182){r8=0;_remove_rect_placement(r32,r1,r7,r45,r37,r50);r50=r50-1|0;r31=1}r50=r50+1|0;if((r50|0)>=(HEAP[(r37<<3)+r7+4|0]|0)){break L1683}}}}while(0);r39=r39+1|0;r35=r42;if((r39|0)<(r32|0)){r44=r35}else{r53=r35;break L1680}}}else{r53=r43}}while(0);r42=r53+1|0;if((r42|0)>=(r1|0)){break L1677}}}}while(0);if((r31|0)!=0){continue}L1706:do{if((r6|0)!=0){r42=0;r43=0;r39=0;r29=0;L1708:do{if((r29|0)<(r2|0)){while(1){r54=0;L1711:do{if((r54|0)<(HEAP[(r29<<3)+r7+4|0]|0)){while(1){r44=0;L1714:do{if((r44|0)<(HEAP[(r54<<4)+HEAP[(r29<<3)+r7|0]+12|0]|0)){while(1){r35=HEAP[(r54<<4)+HEAP[(r29<<3)+r7|0]+4|0]+r44|0;r37=0;L1717:do{if((r37|0)<(HEAP[(r54<<4)+HEAP[(r29<<3)+r7|0]+8|0]|0)){while(1){r50=HEAP[(r54<<4)+HEAP[(r29<<3)+r7|0]|0]+r37|0;r36=(Math.imul(r32,r35)+r50<<2)+r26|0;do{if((HEAP[r36]|0)>=0){r52=(Math.imul(r32,r35)+r50<<2)+r26|0;if((HEAP[r52]|0)==(r29|0)){break}if(r43>>>0>=r39>>>0){r39=Math.floor(((r39*3&-1)>>>0)/2)+32|0;r42=_srealloc(r42,r39*12&-1)}HEAP[r42+(r43*12&-1)|0]=r29;HEAP[r42+(r43*12&-1)+4|0]=r54;r52=(Math.imul(r32,r35)+r50<<2)+r26|0;HEAP[r42+(r43*12&-1)+8|0]=HEAP[r52];r43=r43+1|0}}while(0);r37=r37+1|0;if((r37|0)>=(HEAP[(r54<<4)+HEAP[(r29<<3)+r7|0]+8|0]|0)){break L1717}}}}while(0);r44=r44+1|0;if((r44|0)>=(HEAP[(r54<<4)+HEAP[(r29<<3)+r7|0]+12|0]|0)){break L1714}}}}while(0);r54=r54+1|0;if((r54|0)>=(HEAP[(r29<<3)+r7+4|0]|0)){break L1711}}}}while(0);r29=r29+1|0;if((r29|0)>=(r2|0)){break L1708}}}}while(0);if(r43>>>0<=0){break}r39=r42+(_random_upto(r6,r43)*12&-1)|0;for(r55=r39,r48=r23,r49=r55+12;r55<r49;r55++,r48++){HEAP[r48]=HEAP[r55]}HEAP[r21]=r42;if((HEAP[r21]|0)!=0){_free(HEAP[r21])}r29=HEAP[r22];r54=HEAP[r38];r39=HEAP[r24];r43=(r54<<4)+HEAP[(r29<<3)+r7|0]|0;for(r55=r43,r48=r30,r49=r55+16;r55<r49;r55++,r48++){HEAP[r48]=HEAP[r55]}r43=0;if((r43|0)>=(HEAP[r3+(r39*12&-1)+4|0]|0)){break}while(1){r42=HEAP[(r43<<3)+HEAP[r3+(r39*12&-1)+8|0]|0];r44=HEAP[(r43<<3)+HEAP[r3+(r39*12&-1)+8|0]+4|0];do{if((r42|0)<(HEAP[r40]|0)){r8=1209}else{if((r42|0)>=(HEAP[r28]+HEAP[r20]|0)){r8=1209;break}if((r44|0)<(HEAP[r41]|0)){r8=1209;break}if((r44|0)>=(HEAP[r34]+HEAP[r33]|0)){r8=1209;break}else{break}}}while(0);if(r8==1209){r8=0;HEAP[r15]=r32;HEAP[r16]=r1;HEAP[r17]=r3+(r39*12&-1)|0;HEAP[r18]=r43;HEAP[r19]=r26;r44=Math.imul(HEAP[r15],HEAP[(HEAP[r18]<<3)+HEAP[HEAP[r17]+8|0]+4|0]);HEAP[(HEAP[(HEAP[r18]<<3)+HEAP[HEAP[r17]+8|0]|0]+r44<<2)+HEAP[r19]|0]=-1;if((HEAP[r18]|0)<(HEAP[HEAP[r17]+4|0]-1|0)){r44=(HEAP[HEAP[r17]+4|0]-1<<3)+HEAP[HEAP[r17]+8|0]|0;HEAP[r27]=HEAP[r44];HEAP[r27+1]=HEAP[r44+1];HEAP[r27+2]=HEAP[r44+2];HEAP[r27+3]=HEAP[r44+3];HEAP[r27+4]=HEAP[r44+4];HEAP[r27+5]=HEAP[r44+5];HEAP[r27+6]=HEAP[r44+6];HEAP[r27+7]=HEAP[r44+7];r44=(HEAP[HEAP[r17]+4|0]-1<<3)+HEAP[HEAP[r17]+8|0]|0;r42=(HEAP[r18]<<3)+HEAP[HEAP[r17]+8|0]|0;HEAP[r44]=HEAP[r42];HEAP[r44+1]=HEAP[r42+1];HEAP[r44+2]=HEAP[r42+2];HEAP[r44+3]=HEAP[r42+3];HEAP[r44+4]=HEAP[r42+4];HEAP[r44+5]=HEAP[r42+5];HEAP[r44+6]=HEAP[r42+6];HEAP[r44+7]=HEAP[r42+7];r42=(HEAP[r18]<<3)+HEAP[HEAP[r17]+8|0]|0;HEAP[r42]=HEAP[r47];HEAP[r42+1]=HEAP[r47+1];HEAP[r42+2]=HEAP[r47+2];HEAP[r42+3]=HEAP[r47+3];HEAP[r42+4]=HEAP[r47+4];HEAP[r42+5]=HEAP[r47+5];HEAP[r42+6]=HEAP[r47+6];HEAP[r42+7]=HEAP[r47+7]}r42=HEAP[r17]+4|0;HEAP[r42]=HEAP[r42]-1|0;r43=r43-1|0;r31=1}r43=r43+1|0;if((r43|0)>=(HEAP[r3+(r39*12&-1)+4|0]|0)){break L1706}}}}while(0);if((r31|0)==0){break}}if(r8==1117){r56=0}else if(r8==1137){r56=0}r56=1;r29=0;L1752:do{if((r29|0)<(r2|0)){while(1){L1755:do{if((HEAP[(r29<<3)+r7+4|0]|0)<=0){r56=0}else{if((HEAP[(r29<<3)+r7+4|0]|0)>1){r56=2;break}if((r4|0)==0){break}if((r5|0)==0){break}r8=HEAP[(r29<<3)+r7|0]|0;r3=0;L1762:do{if((r3|0)<(HEAP[r8+12|0]|0)){while(1){if((HEAP[r8|0]|0)>0){r17=Math.imul(r3+HEAP[r8+4|0]|0,r32);HEAP[r5+HEAP[r8|0]+r17|0]=1}if((HEAP[r8+8|0]+HEAP[r8|0]|0)<(r32|0)){r17=Math.imul(r3+HEAP[r8+4|0]|0,r32);HEAP[r5+HEAP[r8|0]+r17+HEAP[r8+8|0]|0]=1}r3=r3+1|0;if((r3|0)>=(HEAP[r8+12|0]|0)){break L1762}}}}while(0);r3=0;if((r3|0)>=(HEAP[r8+8|0]|0)){break}while(1){if((HEAP[r8+4|0]|0)>0){r17=Math.imul(r32,HEAP[r8+4|0]);HEAP[r4+HEAP[r8|0]+r17+r3|0]=1}if((HEAP[r8+12|0]+HEAP[r8+4|0]|0)<(r1|0)){r17=Math.imul(HEAP[r8+12|0]+HEAP[r8+4|0]|0,r32);HEAP[r4+HEAP[r8|0]+r17+r3|0]=1}r3=r3+1|0;if((r3|0)>=(HEAP[r8+8|0]|0)){break L1755}}}}while(0);r29=r29+1|0;if((r29|0)>=(r2|0)){break L1752}}}}while(0);r4=r25;HEAP[r14]=r4;if((r4|0)!=0){_free(HEAP[r14])}r14=r26;HEAP[r13]=r14;if((r14|0)!=0){_free(HEAP[r13])}r13=r45;HEAP[r12]=r13;if((r13|0)!=0){_free(HEAP[r12])}r29=0;L1792:do{if((r29|0)<(r2|0)){while(1){r12=HEAP[(r29<<3)+r7|0];HEAP[r11]=r12;if((r12|0)!=0){_free(HEAP[r11])}r29=r29+1|0;if((r29|0)>=(r2|0)){break L1792}}}}while(0);r2=r7;HEAP[r10]=r2;if((r2|0)==0){r57=r10;r58=r56;STACKTOP=r9;return r58}_free(HEAP[r10]);r57=r10;r58=r56;STACKTOP=r9;return r58}function _place_rect(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12;r7=STACKTOP;STACKTOP=STACKTOP+16|0;r8=r7;r9=r1;r1=r2;HEAP[r8|0]=r3;HEAP[r8+4|0]=r4;HEAP[r8+8|0]=r5;HEAP[r8+12|0]=r6;r6=Math.imul(HEAP[r9|0],HEAP[r8+4|0])+HEAP[r8|0]|0;r5=HEAP[r8|0];r4=r8|0;r3=r8+8|0;if((r5|0)>=(HEAP[r3]+HEAP[r4]|0)){STACKTOP=r7;return}r2=r8+4|0;r10=r8+4|0;r11=r8+12|0;while(1){r8=HEAP[r2];L1810:do{if((r8|0)<(HEAP[r11]+HEAP[r10]|0)){while(1){r12=(Math.imul(HEAP[r9|0],r8)+r5<<2)+r1|0;HEAP[r12]=r6;r8=r8+1|0;if((r8|0)>=(HEAP[r11]+HEAP[r10]|0)){break L1810}}}}while(0);r5=r5+1|0;if((r5|0)>=(HEAP[r3]+HEAP[r4]|0)){break}}STACKTOP=r7;return}function _remove_rect_placement(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r7=STACKTOP;STACKTOP=STACKTOP+16|0;r8=r7;r9=r1;r1=r2;r2=r3;r3=r4;r4=r5;r5=r6;r6=0;L1816:do{if((r6|0)<(HEAP[(r5<<4)+HEAP[(r4<<3)+r2|0]+12|0]|0)){while(1){r10=HEAP[(r5<<4)+HEAP[(r4<<3)+r2|0]+4|0]+r6|0;r11=0;L1819:do{if((r11|0)<(HEAP[(r5<<4)+HEAP[(r4<<3)+r2|0]+8|0]|0)){while(1){r12=HEAP[(r5<<4)+HEAP[(r4<<3)+r2|0]|0]+r11|0;r13=(Math.imul(Math.imul(r1,r4)+r10|0,r9)+r12<<2)+r3|0;if((HEAP[r13]|0)==0){___assert_func(65948,289,67816,66972)}r13=(Math.imul(Math.imul(r1,r4)+r10|0,r9)+r12<<2)+r3|0;if((HEAP[r13]|0)>0){r13=(Math.imul(Math.imul(r1,r4)+r10|0,r9)+r12<<2)+r3|0;HEAP[r13]=HEAP[r13]-1|0}r11=r11+1|0;if((r11|0)>=(HEAP[(r5<<4)+HEAP[(r4<<3)+r2|0]+8|0]|0)){break L1819}}}}while(0);r6=r6+1|0;if((r6|0)>=(HEAP[(r5<<4)+HEAP[(r4<<3)+r2|0]+12|0]|0)){break L1816}}}}while(0);if((r5|0)>=(HEAP[(r4<<3)+r2+4|0]-1|0)){r14=r4;r15=r2;r16=(r14<<3)+r15|0;r17=r16+4|0;r18=HEAP[r17];r19=r18-1|0;HEAP[r17]=r19;STACKTOP=r7;return}r6=r8;r3=(HEAP[(r4<<3)+r2+4|0]-1<<4)+HEAP[(r4<<3)+r2|0]|0;for(r20=r3,r21=r6,r22=r20+16;r20<r22;r20++,r21++){HEAP[r21]=HEAP[r20]}r6=(HEAP[(r4<<3)+r2+4|0]-1<<4)+HEAP[(r4<<3)+r2|0]|0;r3=(r5<<4)+HEAP[(r4<<3)+r2|0]|0;for(r20=r3,r21=r6,r22=r20+16;r20<r22;r20++,r21++){HEAP[r21]=HEAP[r20]}r6=(r5<<4)+HEAP[(r4<<3)+r2|0]|0;r5=r8;for(r20=r5,r21=r6,r22=r20+16;r20<r22;r20++,r21++){HEAP[r21]=HEAP[r20]}r14=r4;r15=r2;r16=(r14<<3)+r15|0;r17=r16+4|0;r18=HEAP[r17];r19=r18-1|0;HEAP[r17]=r19;STACKTOP=r7;return}function _enum_rects(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r8=r1;r1=r2;r2=r3;r3=r4;r4=r5;r5=r6;r6=r7;r7=0;r9=(Math.imul(HEAP[r8+4|0],HEAP[r8|0])|0)/6&-1;if((r9|0)<2){r9=2}r10=r6;r11=(HEAP[r8|0]<<2)+r6|0;r6=-1;while(1){r12=(r6|0)==-1?r10:r11;r13=-1;while(1){r14=r4;r15=r14;L1842:do{if((r14|0)>=0){while(1){if((r15|0)>=(HEAP[r8|0]|0)){break L1842}r16=Math.imul(HEAP[r8+4|0]*-2&-1,r6);HEAP[(r15<<2)+r12|0]=r16;r16=r5;r17=r16;L1846:do{if((r16|0)>=0){while(1){if((r17|0)>=(HEAP[r8+4|0]|0)){break L1846}r18=(Math.imul(HEAP[r8|0],r17)+r15<<2)+r1|0;if((HEAP[r18]|0)!=-1){break L1846}if((r15|0)!=(r4|0)){if(!((Math.imul(r17,r6)|0)<=(Math.imul(HEAP[(r15-r13<<2)+r12|0],r6)|0))){break L1846}}HEAP[(r15<<2)+r12|0]=r17;r18=r17+r6|0;r17=r18;if(!((r18|0)>=0)){break L1846}}}}while(0);r16=r15+r13|0;r15=r16;if(!((r16|0)>=0)){break L1842}}}}while(0);r14=r13+2|0;r13=r14;if(!((r14|0)<=1)){break}}r12=r6+2|0;r6=r12;if(!((r12|0)<=1)){break}}r6=0;r15=0;L1858:do{if((r15|0)<(HEAP[r8|0]|0)){while(1){r1=HEAP[(r15<<2)+r11|0]+ -HEAP[(r15<<2)+r10|0]+1|0;r19=r1;do{if(!((r1|0)<=0)){r13=(r15|0)>(r4|0)?-1:1;r12=r15;r14=r12;L1863:do{if((r12|0)>=0){while(1){if((r14|0)>=(HEAP[r8|0]|0)){break L1863}if((HEAP[(r14<<2)+r11|0]|0)<(HEAP[(r15<<2)+r11|0]|0)){break L1863}if((HEAP[(r14<<2)+r10|0]|0)>(HEAP[(r15<<2)+r10|0]|0)){break L1863}r16=r14+r13|0;r14=r16;if(!((r16|0)>=0)){break L1863}}}}while(0);r12=r14-r15|0;r20=(r12|0)>-1?r12:-r12|0;if((r6|0)>=(Math.imul(r19,r20)|0)){break}r6=Math.imul(r19,r20)}}while(0);r15=r15+1|0;if((r15|0)>=(HEAP[r8|0]|0)){break L1858}}}}while(0);if((r6|0)>(r9|0)){r6=r9}r9=HEAP[r8|0]-1|0;r13=r9;if((r9|0)<3){r13=r13+1|0}r9=HEAP[r8+4|0]-1|0;r1=r9;if((r9|0)<3){r1=r1+1|0}r20=1;L1882:do{if((r20|0)<=(r13|0)){L1883:while(1){r19=1;r9=r20;L1885:do{if((r19|0)<=(r1|0)){r12=r9;while(1){L1888:do{if((Math.imul(r19,r12)|0)<=(r6|0)){if((Math.imul(r19,r20)|0)==1){break}if((r4+ -r20+1|0)>0){r21=r4+ -r20+1|0}else{r21=0}r15=r21;while(1){if((r4|0)<(HEAP[r8|0]-r20|0)){r22=r4}else{r22=HEAP[r8|0]-r20|0}if(!((r15|0)<=(r22|0))){break L1888}if((r5+ -r19+1|0)>0){r23=r5+ -r19+1|0}else{r23=0}r17=r23;while(1){if((r5|0)<(HEAP[r8+4|0]-r19|0)){r24=r5}else{r24=HEAP[r8+4|0]-r19|0}r25=r15;if(!((r17|0)<=(r24|0))){break}do{if((HEAP[(r25<<2)+r10|0]|0)<=(r17|0)){if(!((HEAP[(r15-1+r20<<2)+r10|0]|0)<=(r17|0))){break}if(!((HEAP[(r15<<2)+r11|0]|0)>=(r17-1+r19|0))){break}if(!((HEAP[(r15-1+r20<<2)+r11|0]|0)>=(r17-1+r19|0))){break}if((r2|0)!=0){if((r7|0)==(HEAP[r3]|0)){break L1883}}r7=r7+1|0}}while(0);r17=r17+1|0}r15=r25+1|0}}}while(0);r19=r19+1|0;r16=r20;if((r19|0)<=(r1|0)){r12=r16}else{r26=r16;break L1885}}}else{r26=r9}}while(0);r20=r26+1|0;if(!((r20|0)<=(r13|0))){break L1882}}HEAP[r2|0]=r15;HEAP[r2+4|0]=r17;HEAP[r2+8|0]=r20;HEAP[r2+12|0]=r19;return}}while(0);if((r2|0)!=0){___assert_func(65948,1039,68044,66376)}HEAP[r3]=r7;return}function _find_rect(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14;r6=STACKTOP;STACKTOP=STACKTOP+16|0;r7=r6;r8=r2;r2=r3;r3=r4;r4=r5;r5=(Math.imul(HEAP[r8|0],r4)+r3<<2)+r2|0;r9=HEAP[r5];if((r9|0)<0){HEAP[r7|0]=r3;HEAP[r7+4|0]=r4;HEAP[r7+12|0]=1;HEAP[r7+8|0]=1;r5=r1;r10=r7;for(r11=r10,r12=r5,r13=r11+16;r11<r13;r11++,r12++){HEAP[r12]=HEAP[r11]}STACKTOP=r6;return}r4=(r9|0)/(HEAP[r8|0]|0)&-1;r3=(r9|0)%(HEAP[r8|0]|0);r5=1;L1935:do{if((r5+r3|0)<(HEAP[r8|0]|0)){while(1){r10=(Math.imul(HEAP[r8|0],r4)+r3+r5<<2)+r2|0;if((HEAP[r10]|0)!=(r9|0)){break L1935}r5=r5+1|0;if((r5+r3|0)>=(HEAP[r8|0]|0)){break L1935}}}}while(0);r10=1;L1940:do{if((r10+r4|0)<(HEAP[r8+4|0]|0)){while(1){r14=(Math.imul(HEAP[r8|0],r10+r4|0)+r3<<2)+r2|0;if((HEAP[r14]|0)!=(r9|0)){break L1940}r10=r10+1|0;if((r10+r4|0)>=(HEAP[r8+4|0]|0)){break L1940}}}}while(0);HEAP[r7|0]=r3;HEAP[r7+4|0]=r4;HEAP[r7+8|0]=r5;HEAP[r7+12|0]=r10;r10=r1;r1=r7;for(r11=r1,r12=r10,r13=r11+16;r11<r13;r11++,r12++){HEAP[r12]=HEAP[r11]}STACKTOP=r6;return}function _canvas_text_fallback(r1,r2,r3){return _dupstr(HEAP[r2|0])}function _status_bar(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r3=STACKTOP;STACKTOP=STACKTOP+144|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+132;r14=r3+136;r15=r3+140;r16=r1;if((HEAP[HEAP[r16|0]+40|0]|0)==0){STACKTOP=r3;return}if((HEAP[r16+24|0]|0)==0){___assert_func(66124,198,67792,66888)}HEAP[r10]=HEAP[r16+24|0];HEAP[r11]=r2;if((HEAP[HEAP[r10]+116|0]|0)!=(HEAP[r11]|0)){HEAP[r8]=HEAP[HEAP[r10]+116|0];if((HEAP[r8]|0)!=0){_free(HEAP[r8])}r8=_dupstr(HEAP[r11]);HEAP[HEAP[r10]+116|0]=r8}do{if((HEAP[HEAP[HEAP[r10]+8|0]+180|0]|0)!=0){HEAP[r15]=HEAP[HEAP[r10]+112|0]&-1;HEAP[r14]=(HEAP[r15]|0)/60&-1;HEAP[r15]=(HEAP[r15]|0)%60;r8=HEAP[r15];_sprintf(r12|0,66600,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=HEAP[r14],HEAP[tempInt+4]=r8,tempInt));r8=_strlen(r12|0)+_strlen(HEAP[r11])+1|0;HEAP[r6]=r8;r8=_malloc(HEAP[r6]);HEAP[r7]=r8;if((HEAP[r7]|0)!=0){HEAP[r13]=HEAP[r7];_strcpy(HEAP[r13],r12|0);_strcat(HEAP[r13],HEAP[r11]);HEAP[r9]=HEAP[r13];break}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}else{r8=_dupstr(HEAP[r11]);HEAP[r9]=r8}}while(0);r11=HEAP[r9];do{if((HEAP[r16+28|0]|0)!=0){if((_strcmp(r11,HEAP[r16+28|0])|0)!=0){break}HEAP[r4]=r11;if((HEAP[r4]|0)!=0){_free(HEAP[r4])}STACKTOP=r3;return}}while(0);FUNCTION_TABLE[HEAP[HEAP[r16|0]+40|0]](HEAP[r16+4|0],r11);r4=HEAP[r16+28|0];HEAP[r5]=r4;if((r4|0)!=0){_free(HEAP[r5])}HEAP[r16+28|0]=r11;STACKTOP=r3;return}function _fatal(r1){var r2,r3;r2=STACKTOP;STACKTOP=STACKTOP+4|0;r3=r2;_fwrite(66064,13,1,HEAP[_stderr]);HEAP[r3]=r1;_fprintf(HEAP[_stderr],66048,HEAP[r3]);_fputc(10,HEAP[_stderr]);_exit(1)}function _init_game(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+384|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r4+32;r14=r4+36;r15=r4+40;r16=r4+44;r17=r4+48;r18=r4+52;r19=r4+56;r20=r4+60;r21=r4+64;r22=r4+68;r23=r4+72;r24=r4+76;r25=r4+80;r26=r4+84;r27=r4+88;r28=r4+92;r29=r4+96;r30=r4+100;r31=r4+104;r32=r4+108;r33=r4+112;r34=r4+116;r35=r4+120;r36=r4+124;r37=r4+128;r38=r4+132;r39=r4+136;r40=r4+140;r41=r4+144;r42=r4+148;r43=r4+152;r44=r4+156;r45=r4+160;r46=r4+164;r47=r4+168;r48=r4+172;r49=r4+176;r50=r4+180;r51=r4+184;r52=r4+264;r53=r4+268;r54=r4+272;r55=r4+276;r56=r4+356;r57=r4+360;r58=r4+364;r59=r4+368;r60=r4+372;r61=r4+376;r62=r4+380;r63=r1;r1=r2;HEAP[r44]=r63;HEAP[r45]=65536;HEAP[r46]=65828;HEAP[r47]=r1;HEAP[r42]=144;r2=_malloc(HEAP[r42]);HEAP[r43]=r2;if((HEAP[r43]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r48]=HEAP[r43];HEAP[r39]=r49;HEAP[r40]=r50;HEAP[r37]=8;r43=_malloc(HEAP[r37]);HEAP[r38]=r43;if((HEAP[r38]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r41]=HEAP[r38];_gettimeofday(HEAP[r41],0);HEAP[HEAP[r39]]=HEAP[r41];HEAP[HEAP[r40]]=8;HEAP[HEAP[r48]|0]=HEAP[r44];HEAP[HEAP[r48]+8|0]=HEAP[r45];r44=_random_new(HEAP[r49],HEAP[r50]);HEAP[HEAP[r48]+4|0]=r44;HEAP[HEAP[r48]+60|0]=0;HEAP[HEAP[r48]+56|0]=0;HEAP[HEAP[r48]+52|0]=0;HEAP[HEAP[r48]+64|0]=0;r44=FUNCTION_TABLE[HEAP[HEAP[r45]+12|0]]();HEAP[HEAP[r48]+68|0]=r44;_sprintf(r51|0,65984,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[HEAP[HEAP[r48]+8|0]|0],tempInt));HEAP[r54]=0;HEAP[r53]=0;L1987:do{if(HEAP[r51+HEAP[r53]|0]<<24>>24!=0){while(1){if((_isspace(HEAP[r51+HEAP[r53]|0]&255)|0)==0){r44=_toupper(HEAP[r51+HEAP[r53]|0]&255)&255;r50=HEAP[r54];HEAP[r54]=r50+1|0;HEAP[r51+r50|0]=r44}HEAP[r53]=HEAP[r53]+1|0;if(HEAP[r51+HEAP[r53]|0]<<24>>24==0){break L1987}}}}while(0);HEAP[r51+HEAP[r54]|0]=0;r54=_getenv(r51|0);HEAP[r52]=r54;if((r54|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r48]+8|0]+20|0]](HEAP[HEAP[r48]+68|0],HEAP[r52])}HEAP[HEAP[r48]+72|0]=0;HEAP[HEAP[r48]+36|0]=0;HEAP[HEAP[r48]+32|0]=0;HEAP[HEAP[r48]+40|0]=0;HEAP[HEAP[r48]+44|0]=0;HEAP[HEAP[r48]+48|0]=2;HEAP[HEAP[r48]+76|0]=0;HEAP[HEAP[r48]+84|0]=0;HEAP[HEAP[r48]+12|0]=0;HEAP[HEAP[r48]+16|0]=0;HEAP[HEAP[r48]+20|0]=0;HEAP[HEAP[r48]+28|0]=0;HEAP[HEAP[r48]+24|0]=0;HEAP[HEAP[r48]+92|0]=0;HEAP[HEAP[r48]+88|0]=0;HEAP[HEAP[r48]+100|0]=0;HEAP[HEAP[r48]+96|0]=0;HEAP[HEAP[r48]+104|0]=0;HEAP[HEAP[r48]+80|0]=0;HEAP[HEAP[r48]+124|0]=0;HEAP[HEAP[r48]+116|0]=0;HEAP[HEAP[r48]+108|0]=0;HEAP[HEAP[r48]+112|0]=0;HEAP[HEAP[r48]+140|0]=0;HEAP[HEAP[r48]+136|0]=0;HEAP[HEAP[r48]+132|0]=0;do{if((HEAP[r46]|0)!=0){r52=HEAP[r48];r54=HEAP[r47];HEAP[r33]=HEAP[r46];HEAP[r34]=r52;HEAP[r35]=r54;HEAP[r31]=32;r54=_malloc(HEAP[r31]);HEAP[r32]=r54;if((HEAP[r32]|0)!=0){HEAP[r36]=HEAP[r32];HEAP[HEAP[r36]|0]=HEAP[r33];HEAP[HEAP[r36]+4|0]=HEAP[r35];HEAP[HEAP[r36]+8|0]=0;HEAP[HEAP[r36]+16|0]=0;HEAP[HEAP[r36]+12|0]=0;HEAP[HEAP[r36]+20|0]=1;HEAP[HEAP[r36]+24|0]=HEAP[r34];HEAP[HEAP[r36]+28|0]=0;HEAP[HEAP[r48]+120|0]=HEAP[r36];break}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}else{HEAP[HEAP[r48]+120|0]=0}}while(0);HEAP[HEAP[r48]+128|0]=HEAP[HEAP[r45]+120|0];_sprintf(r55|0,67076,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[HEAP[HEAP[r48]+8|0]|0],tempInt));HEAP[r58]=0;HEAP[r57]=0;L2004:do{if(HEAP[r55+HEAP[r57]|0]<<24>>24!=0){while(1){if((_isspace(HEAP[r55+HEAP[r57]|0]&255)|0)==0){r45=_toupper(HEAP[r55+HEAP[r57]|0]&255)&255;r36=HEAP[r58];HEAP[r58]=r36+1|0;HEAP[r55+r36|0]=r45}HEAP[r57]=HEAP[r57]+1|0;if(HEAP[r55+HEAP[r57]|0]<<24>>24==0){break L2004}}}}while(0);HEAP[r55+HEAP[r58]|0]=0;r58=_getenv(r55|0);HEAP[r56]=r58;do{if((r58|0)!=0){if(!((_sscanf(HEAP[r56],66780,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=r59,tempInt))|0)==1&(HEAP[r59]|0)>0)){break}HEAP[HEAP[r48]+128|0]=HEAP[r59]}}while(0);r59=HEAP[r49];HEAP[r30]=r59;if((r59|0)!=0){_free(HEAP[r30])}r30=HEAP[r48];_frontend_set_game_info(r63,r30,67308,1,1,1,1,0,0,0);HEAP[r20]=r30;L2018:do{if((HEAP[HEAP[r20]+24|0]|0)==0){if((FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+16|0]](HEAP[HEAP[r20]+24|0],r21,r22)|0)==0){break}while(1){if((HEAP[HEAP[r20]+28|0]|0)<=(HEAP[HEAP[r20]+24|0]|0)){HEAP[HEAP[r20]+28|0]=HEAP[HEAP[r20]+24|0]+10|0;r48=_srealloc(HEAP[HEAP[r20]+12|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+12|0]=r48;r48=_srealloc(HEAP[HEAP[r20]+16|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+16|0]=r48;r48=_srealloc(HEAP[HEAP[r20]+20|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+20|0]=r48}HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+12|0]|0]=HEAP[r22];HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+16|0]|0]=HEAP[r21];r48=FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+24|0]](HEAP[r22],1);HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+20|0]|0]=r48;r48=HEAP[r20]+24|0;HEAP[r48]=HEAP[r48]+1|0;if((FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+16|0]](HEAP[HEAP[r20]+24|0],r21,r22)|0)==0){break L2018}}}}while(0);_sprintf(r51|0,67148,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[HEAP[HEAP[r20]+8|0]|0],tempInt));HEAP[r26]=0;HEAP[r25]=0;L2026:do{if(HEAP[r51+HEAP[r25]|0]<<24>>24!=0){while(1){if((_isspace(HEAP[r51+HEAP[r25]|0]&255)|0)==0){r22=_toupper(HEAP[r51+HEAP[r25]|0]&255)&255;r21=HEAP[r26];HEAP[r26]=r21+1|0;HEAP[r51+r21|0]=r22}HEAP[r25]=HEAP[r25]+1|0;if(HEAP[r51+HEAP[r25]|0]<<24>>24==0){break L2026}}}}while(0);HEAP[r51+HEAP[r26]|0]=0;r26=_getenv(r51|0);HEAP[r23]=r26;if((r26|0)!=0){r26=_dupstr(HEAP[r23]);HEAP[r23]=r26;HEAP[r24]=r26;if(HEAP[HEAP[r24]]<<24>>24!=0){while(1){HEAP[r27]=HEAP[r24];r25=HEAP[r24];L2038:do{if((HEAP[HEAP[r24]]<<24>>24|0)!=0){r22=r25;while(1){r21=HEAP[r24];if((HEAP[r22]<<24>>24|0)==58){r64=r21;break L2038}HEAP[r24]=r21+1|0;r21=HEAP[r24];if((HEAP[HEAP[r24]]<<24>>24|0)!=0){r22=r21}else{r64=r21;break L2038}}}else{r64=r25}}while(0);if(HEAP[r64]<<24>>24!=0){r25=HEAP[r24];HEAP[r24]=r25+1|0;HEAP[r25]=0}HEAP[r28]=HEAP[r24];r25=HEAP[r24];L2046:do{if((HEAP[HEAP[r24]]<<24>>24|0)!=0){r22=r25;while(1){r21=HEAP[r24];if((HEAP[r22]<<24>>24|0)==58){r65=r21;break L2046}HEAP[r24]=r21+1|0;r21=HEAP[r24];if((HEAP[HEAP[r24]]<<24>>24|0)!=0){r22=r21}else{r65=r21;break L2046}}}else{r65=r25}}while(0);if(HEAP[r65]<<24>>24!=0){r25=HEAP[r24];HEAP[r24]=r25+1|0;HEAP[r25]=0}r25=FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+12|0]]();HEAP[r29]=r25;FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+20|0]](HEAP[r29],HEAP[r28]);r25=(FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+48|0]](HEAP[r29],1)|0)!=0;r22=HEAP[r20];if(r25){FUNCTION_TABLE[HEAP[HEAP[r22+8|0]+28|0]](HEAP[r29])}else{if((HEAP[r22+28|0]|0)<=(HEAP[HEAP[r20]+24|0]|0)){HEAP[HEAP[r20]+28|0]=HEAP[HEAP[r20]+24|0]+10|0;r22=_srealloc(HEAP[HEAP[r20]+12|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+12|0]=r22;r22=_srealloc(HEAP[HEAP[r20]+16|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+16|0]=r22;r22=_srealloc(HEAP[HEAP[r20]+20|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+20|0]=r22}HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+12|0]|0]=HEAP[r29];r22=_dupstr(HEAP[r27]);HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+16|0]|0]=r22;r22=FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+24|0]](HEAP[r29],1);HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+20|0]|0]=r22;r22=HEAP[r20]+24|0;HEAP[r22]=HEAP[r22]+1|0}if(HEAP[HEAP[r24]]<<24>>24==0){break}}r66=HEAP[r23]}else{r66=r26}HEAP[r19]=r66;if((r66|0)!=0){_free(HEAP[r19])}}r19=HEAP[HEAP[r20]+24|0];HEAP[r60]=r19;L2067:do{if((r19|0)>0){r67=0;if((r67|0)>=(HEAP[r60]|0)){break}r20=r67;while(1){HEAP[r15]=r30;HEAP[r16]=r20;HEAP[r17]=r61;HEAP[r18]=r62;do{if((r20|0)>=0){if((HEAP[r16]|0)<(HEAP[HEAP[r15]+24|0]|0)){break}else{r3=1436;break}}else{r3=1436}}while(0);if(r3==1436){r3=0;___assert_func(66464,1056,67988,67116)}HEAP[HEAP[r17]]=HEAP[(HEAP[r16]<<2)+HEAP[HEAP[r15]+16|0]|0];HEAP[HEAP[r18]]=HEAP[(HEAP[r16]<<2)+HEAP[HEAP[r15]+12|0]|0];_frontend_add_preset(r63,HEAP[r61],HEAP[r62]);r67=r67+1|0;r66=r67;if((r66|0)<(HEAP[r60]|0)){r20=r66}else{break L2067}}}}while(0);HEAP[r5]=r30;HEAP[r6]=r60;r30=FUNCTION_TABLE[HEAP[HEAP[HEAP[r5]+8|0]+132|0]](HEAP[HEAP[r5]|0],HEAP[r6]);HEAP[r7]=r30;HEAP[r8]=0;L2078:do{if((HEAP[r8]|0)<(HEAP[HEAP[r6]]|0)){r30=r51|0;r62=r51|0;while(1){r61=HEAP[r8];_sprintf(r30,67184,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=HEAP[HEAP[HEAP[r5]+8|0]|0],HEAP[tempInt+4]=r61,tempInt));HEAP[r14]=0;HEAP[r13]=0;L2082:do{if(HEAP[r51+HEAP[r13]|0]<<24>>24!=0){while(1){if((_isspace(HEAP[r51+HEAP[r13]|0]&255)|0)==0){r61=_toupper(HEAP[r51+HEAP[r13]|0]&255)&255;r63=HEAP[r14];HEAP[r14]=r63+1|0;HEAP[r51+r63|0]=r61}HEAP[r13]=HEAP[r13]+1|0;if(HEAP[r51+HEAP[r13]|0]<<24>>24==0){break L2082}}}}while(0);HEAP[r51+HEAP[r14]|0]=0;r61=_getenv(r62);HEAP[r9]=r61;do{if((r61|0)!=0){if((_sscanf(HEAP[r9],67164,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP[tempInt]=r10,HEAP[tempInt+4]=r11,HEAP[tempInt+8]=r12,tempInt))|0)!=3){break}HEAP[((HEAP[r8]*3&-1)<<2)+HEAP[r7]|0]=(HEAP[r10]>>>0)/255;HEAP[((HEAP[r8]*3&-1)+1<<2)+HEAP[r7]|0]=(HEAP[r11]>>>0)/255;HEAP[((HEAP[r8]*3&-1)+2<<2)+HEAP[r7]|0]=(HEAP[r12]>>>0)/255}}while(0);HEAP[r8]=HEAP[r8]+1|0;if((HEAP[r8]|0)>=(HEAP[HEAP[r6]]|0)){break L2078}}}}while(0);r6=HEAP[r7];r67=0;if((r67|0)>=(HEAP[r60]|0)){STACKTOP=r4;return}while(1){_canvas_set_palette_entry(r1,r67,HEAP[((r67*3&-1)<<2)+r6|0]*255&-1,HEAP[((r67*3&-1)+1<<2)+r6|0]*255&-1,HEAP[((r67*3&-1)+2<<2)+r6|0]*255&-1);r67=r67+1|0;if((r67|0)>=(HEAP[r60]|0)){break}}STACKTOP=r4;return}function _sfree(r1){var r2;r2=r1;if((r2|0)==0){return}_free(r2);return}function _srealloc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68;r3=STACKTOP;STACKTOP=STACKTOP+204|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r3+100;r30=r3+104;r31=r3+108;r32=r3+112;r33=r3+116;r34=r3+120;r35=r3+124;r36=r3+128;r37=r3+132;r38=r3+136;r39=r3+140;r40=r3+144;r41=r3+148;r42=r3+152;r43=r3+156;r44=r3+160;r45=r3+164;r46=r3+168;r47=r3+172;r48=r3+176;r49=r3+180;r50=r3+184;r51=r3+188;r52=r3+192;r53=r3+196;r54=r3+200;r55=r1;r1=r2;if((r55|0)!=0){HEAP[r47]=r55;HEAP[r48]=r1;HEAP[r49]=0;r55=HEAP[r48];do{if((HEAP[r47]|0)==0){r2=_malloc(r55);HEAP[r49]=r2}else{if(r55>>>0>=4294967232){r2=___errno_location();HEAP[r2]=12;break}if(HEAP[r48]>>>0<11){r56=16}else{r56=HEAP[r48]+11&-8}HEAP[r50]=r56;HEAP[r51]=HEAP[r47]-8|0;HEAP[r52]=67320;r2=HEAP[r51];r57=HEAP[r50];HEAP[r14]=HEAP[r52];HEAP[r15]=r2;HEAP[r16]=r57;HEAP[r17]=1;HEAP[r18]=0;HEAP[r19]=HEAP[HEAP[r15]+4|0]&-8;HEAP[r20]=HEAP[r15]+HEAP[r19]|0;do{if(HEAP[r15]>>>0>=HEAP[HEAP[r14]+16|0]>>>0){if((HEAP[HEAP[r15]+4|0]&3|0)==1){r58=0;break}if(HEAP[r15]>>>0>=HEAP[r20]>>>0){r58=0;break}r58=(HEAP[HEAP[r20]+4|0]&1|0)!=0}else{r58=0}}while(0);if((r58&1|0)==0){_abort()}L2125:do{if((HEAP[HEAP[r15]+4|0]&3|0)==0){r57=HEAP[r15];r2=HEAP[r16];r59=HEAP[r17];HEAP[r5]=HEAP[r14];HEAP[r6]=r57;HEAP[r7]=r2;HEAP[r8]=r59;HEAP[r9]=HEAP[HEAP[r6]+4|0]&-8;L2127:do{if(HEAP[r7]>>>3>>>0<32){HEAP[r4]=0}else{do{if(HEAP[r9]>>>0>=(HEAP[r7]+4|0)>>>0){if(!((HEAP[r9]-HEAP[r7]|0)>>>0<=HEAP[65808]<<1>>>0)){break}HEAP[r4]=HEAP[r6];break L2127}}while(0);HEAP[r10]=HEAP[HEAP[r6]|0];HEAP[r11]=HEAP[r9]+HEAP[r10]+16|0;HEAP[r12]=(HEAP[65804]-1^-1)&HEAP[r7]+HEAP[65804]+30;HEAP[r13]=-1;HEAP[r4]=0}}while(0);r59=HEAP[r4];HEAP[r18]=r59;r60=r59}else{if(HEAP[r19]>>>0>=HEAP[r16]>>>0){HEAP[r21]=HEAP[r19]-HEAP[r16]|0;if(HEAP[r21]>>>0>=16){HEAP[r22]=HEAP[r15]+HEAP[r16]|0;HEAP[HEAP[r15]+4|0]=HEAP[r16]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r16]+4|0;HEAP[r59]=HEAP[r59]|1;HEAP[HEAP[r22]+4|0]=HEAP[r21]|2|HEAP[HEAP[r22]+4|0]&1;r59=HEAP[r22]+HEAP[r21]+4|0;HEAP[r59]=HEAP[r59]|1;_dispose_chunk(HEAP[r14],HEAP[r22],HEAP[r21])}r59=HEAP[r15];HEAP[r18]=r59;r60=r59;break}do{if((HEAP[r20]|0)==(HEAP[HEAP[r14]+24|0]|0)){if((HEAP[HEAP[r14]+12|0]+HEAP[r19]|0)>>>0<=HEAP[r16]>>>0){break}HEAP[r23]=HEAP[HEAP[r14]+12|0]+HEAP[r19]|0;HEAP[r24]=HEAP[r23]-HEAP[r16]|0;HEAP[r25]=HEAP[r15]+HEAP[r16]|0;HEAP[HEAP[r15]+4|0]=HEAP[r16]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r16]+4|0;HEAP[r59]=HEAP[r59]|1;HEAP[HEAP[r25]+4|0]=HEAP[r24]|1;HEAP[HEAP[r14]+24|0]=HEAP[r25];HEAP[HEAP[r14]+12|0]=HEAP[r24];r59=HEAP[r15];HEAP[r18]=r59;r60=r59;break L2125}else{if((HEAP[r20]|0)==(HEAP[HEAP[r14]+20|0]|0)){HEAP[r26]=HEAP[HEAP[r14]+8|0];if(!((HEAP[r26]+HEAP[r19]|0)>>>0>=HEAP[r16]>>>0)){break}HEAP[r27]=HEAP[r26]+HEAP[r19]+ -HEAP[r16]|0;if(HEAP[r27]>>>0>=16){HEAP[r28]=HEAP[r15]+HEAP[r16]|0;HEAP[r29]=HEAP[r28]+HEAP[r27]|0;HEAP[HEAP[r15]+4|0]=HEAP[r16]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r16]+4|0;HEAP[r59]=HEAP[r59]|1;HEAP[HEAP[r28]+4|0]=HEAP[r27]|1;HEAP[HEAP[r28]+HEAP[r27]|0]=HEAP[r27];r59=HEAP[r29]+4|0;HEAP[r59]=HEAP[r59]&-2;HEAP[HEAP[r14]+8|0]=HEAP[r27];HEAP[HEAP[r14]+20|0]=HEAP[r28]}else{HEAP[r30]=HEAP[r26]+HEAP[r19]|0;HEAP[HEAP[r15]+4|0]=HEAP[r30]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r30]+4|0;HEAP[r59]=HEAP[r59]|1;HEAP[HEAP[r14]+8|0]=0;HEAP[HEAP[r14]+20|0]=0}r59=HEAP[r15];HEAP[r18]=r59;r60=r59;break L2125}if((HEAP[HEAP[r20]+4|0]&2|0)!=0){break}HEAP[r31]=HEAP[HEAP[r20]+4|0]&-8;if(!((HEAP[r31]+HEAP[r19]|0)>>>0>=HEAP[r16]>>>0)){break}HEAP[r32]=HEAP[r31]+HEAP[r19]+ -HEAP[r16]|0;r59=HEAP[r20];do{if(HEAP[r31]>>>3>>>0<32){HEAP[r33]=HEAP[r59+8|0];HEAP[r34]=HEAP[HEAP[r20]+12|0];HEAP[r35]=HEAP[r31]>>>3;do{if((HEAP[r33]|0)==((HEAP[r35]<<3)+HEAP[r14]+40|0)){r61=1}else{if(!(HEAP[r33]>>>0>=HEAP[HEAP[r14]+16|0]>>>0)){r61=0;break}r61=(HEAP[HEAP[r33]+12|0]|0)==(HEAP[r20]|0)}}while(0);if((r61&1|0)==0){_abort()}if((HEAP[r34]|0)==(HEAP[r33]|0)){r2=HEAP[r14]|0;HEAP[r2]=HEAP[r2]&(1<<HEAP[r35]^-1);break}do{if((HEAP[r34]|0)==((HEAP[r35]<<3)+HEAP[r14]+40|0)){r62=1}else{if(!(HEAP[r34]>>>0>=HEAP[HEAP[r14]+16|0]>>>0)){r62=0;break}r62=(HEAP[HEAP[r34]+8|0]|0)==(HEAP[r20]|0)}}while(0);if((r62&1|0)!=0){HEAP[HEAP[r33]+12|0]=HEAP[r34];HEAP[HEAP[r34]+8|0]=HEAP[r33];break}else{_abort()}}else{HEAP[r36]=r59;HEAP[r37]=HEAP[HEAP[r36]+24|0];r2=HEAP[r36];L2156:do{if((HEAP[HEAP[r36]+12|0]|0)!=(HEAP[r36]|0)){HEAP[r39]=HEAP[r2+8|0];HEAP[r38]=HEAP[HEAP[r36]+12|0];do{if(HEAP[r39]>>>0>=HEAP[HEAP[r14]+16|0]>>>0){if((HEAP[HEAP[r39]+12|0]|0)!=(HEAP[r36]|0)){r63=0;break}r63=(HEAP[HEAP[r38]+8|0]|0)==(HEAP[r36]|0)}else{r63=0}}while(0);if((r63&1|0)!=0){HEAP[HEAP[r39]+12|0]=HEAP[r38];HEAP[HEAP[r38]+8|0]=HEAP[r39];break}else{_abort()}}else{r57=r2+20|0;HEAP[r40]=r57;r64=HEAP[r57];HEAP[r38]=r64;do{if((r64|0)==0){r57=HEAP[r36]+16|0;HEAP[r40]=r57;r65=HEAP[r57];HEAP[r38]=r65;if((r65|0)!=0){break}else{break L2156}}}while(0);while(1){r64=HEAP[r38]+20|0;HEAP[r41]=r64;if((HEAP[r64]|0)==0){r64=HEAP[r38]+16|0;HEAP[r41]=r64;if((HEAP[r64]|0)==0){break}}r64=HEAP[r41];HEAP[r40]=r64;HEAP[r38]=HEAP[r64]}if((HEAP[r40]>>>0>=HEAP[HEAP[r14]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r40]]=0;break}else{_abort()}}}while(0);if((HEAP[r37]|0)==0){break}HEAP[r42]=(HEAP[HEAP[r36]+28|0]<<2)+HEAP[r14]+304|0;do{if((HEAP[r36]|0)==(HEAP[HEAP[r42]]|0)){r2=HEAP[r38];HEAP[HEAP[r42]]=r2;if((r2|0)!=0){break}r2=HEAP[r14]+4|0;HEAP[r2]=HEAP[r2]&(1<<HEAP[HEAP[r36]+28|0]^-1)}else{if((HEAP[r37]>>>0>=HEAP[HEAP[r14]+16|0]>>>0&1|0)==0){_abort()}r2=HEAP[r38];r64=HEAP[r37]+16|0;if((HEAP[HEAP[r37]+16|0]|0)==(HEAP[r36]|0)){HEAP[r64|0]=r2;break}else{HEAP[r64+4|0]=r2;break}}}while(0);if((HEAP[r38]|0)==0){break}if((HEAP[r38]>>>0>=HEAP[HEAP[r14]+16|0]>>>0&1|0)==0){_abort()}HEAP[HEAP[r38]+24|0]=HEAP[r37];r2=HEAP[HEAP[r36]+16|0];HEAP[r43]=r2;do{if((r2|0)!=0){if((HEAP[r43]>>>0>=HEAP[HEAP[r14]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r38]+16|0]=HEAP[r43];HEAP[HEAP[r43]+24|0]=HEAP[r38];break}else{_abort()}}}while(0);r2=HEAP[HEAP[r36]+20|0];HEAP[r44]=r2;if((r2|0)==0){break}if((HEAP[r44]>>>0>=HEAP[HEAP[r14]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r38]+20|0]=HEAP[r44];HEAP[HEAP[r44]+24|0]=HEAP[r38];break}else{_abort()}}}while(0);if(HEAP[r32]>>>0<16){HEAP[r45]=HEAP[r31]+HEAP[r19]|0;HEAP[HEAP[r15]+4|0]=HEAP[r45]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r45]+4|0;HEAP[r59]=HEAP[r59]|1}else{HEAP[r46]=HEAP[r15]+HEAP[r16]|0;HEAP[HEAP[r15]+4|0]=HEAP[r16]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r16]+4|0;HEAP[r59]=HEAP[r59]|1;HEAP[HEAP[r46]+4|0]=HEAP[r32]|2|HEAP[HEAP[r46]+4|0]&1;r59=HEAP[r46]+HEAP[r32]+4|0;HEAP[r59]=HEAP[r59]|1;_dispose_chunk(HEAP[r14],HEAP[r46],HEAP[r32])}r59=HEAP[r15];HEAP[r18]=r59;r60=r59;break L2125}}while(0);r60=HEAP[r18]}}while(0);HEAP[r53]=r60;if((r60|0)!=0){HEAP[r49]=HEAP[r53]+8|0;break}r59=_malloc(HEAP[r48]);HEAP[r49]=r59;if((HEAP[r49]|0)==0){break}HEAP[r54]=(HEAP[HEAP[r51]+4|0]&-8)-((HEAP[HEAP[r51]+4|0]&3|0)==0?8:4)|0;r59=HEAP[r49];r2=HEAP[r47];r64=HEAP[r54]>>>0<HEAP[r48]>>>0?HEAP[r54]:HEAP[r48];for(r65=r2,r57=r59,r66=r65+r64;r65<r66;r65++,r57++){HEAP[r57]=HEAP[r65]}_free(HEAP[r47])}}while(0);r47=HEAP[r49];r67=r47;r68=r47}else{r47=_malloc(r1);r67=r47;r68=r47}if((r68|0)!=0){STACKTOP=r3;return r67}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _midend_size(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+12|0;r7=r6;r8=r6+4;r9=r6+8;r10=r1;r1=r2;r2=r3;r3=r4;if((HEAP[r10+76|0]|0)!=0){if((HEAP[r10+132|0]|0)>0){FUNCTION_TABLE[HEAP[HEAP[r10+8|0]+140|0]](HEAP[r10+120|0],HEAP[r10+76|0]);r11=FUNCTION_TABLE[HEAP[HEAP[r10+8|0]+136|0]](HEAP[r10+120|0],HEAP[HEAP[r10+64|0]|0]);HEAP[r10+76|0]=r11}r12=r3}else{r12=r4}L2247:do{if((r12|0)!=0){r13=1;while(1){r13=r13<<1;FUNCTION_TABLE[HEAP[HEAP[r10+8|0]+124|0]](HEAP[r10+68|0],r13,r8,r9);if(!((HEAP[r8]|0)<=(HEAP[r1]|0))){break L2247}if(!((HEAP[r9]|0)<=(HEAP[r2]|0))){break L2247}}}else{r13=HEAP[r10+128|0]+1|0}}while(0);r12=1;L2254:do{if((r13-r12|0)>1){while(1){r4=(r12+r13|0)/2&-1;FUNCTION_TABLE[HEAP[HEAP[r10+8|0]+124|0]](HEAP[r10+68|0],r4,r8,r9);do{if((HEAP[r8]|0)<=(HEAP[r1]|0)){if(!((HEAP[r9]|0)<=(HEAP[r2]|0))){r5=1570;break}r12=r4;break}else{r5=1570}}while(0);if(r5==1570){r5=0;r13=r4}if((r13-r12|0)<=1){break L2254}}}}while(0);HEAP[r10+132|0]=r12;if((r3|0)!=0){HEAP[r10+128|0]=HEAP[r10+132|0]}HEAP[r7]=r10;if((HEAP[HEAP[r7]+132|0]|0)<=0){r14=r7;r15=r10;r16=r15+136|0;r17=HEAP[r16];r18=r1;HEAP[r18]=r17;r19=r10;r20=r19+140|0;r21=HEAP[r20];r22=r2;HEAP[r22]=r21;STACKTOP=r6;return}FUNCTION_TABLE[HEAP[HEAP[HEAP[r7]+8|0]+124|0]](HEAP[HEAP[r7]+68|0],HEAP[HEAP[r7]+132|0],HEAP[r7]+136|0,HEAP[r7]+140|0);FUNCTION_TABLE[HEAP[HEAP[HEAP[r7]+8|0]+128|0]](HEAP[HEAP[r7]+120|0],HEAP[HEAP[r7]+76|0],HEAP[HEAP[r7]+68|0],HEAP[HEAP[r7]+132|0]);r14=r7;r15=r10;r16=r15+136|0;r17=HEAP[r16];r18=r1;HEAP[r18]=r17;r19=r10;r20=r19+140|0;r21=HEAP[r20];r22=r2;HEAP[r22]=r21;STACKTOP=r6;return}function _midend_set_params(r1,r2){var r3;r3=r1;FUNCTION_TABLE[HEAP[HEAP[r3+8|0]+28|0]](HEAP[r3+68|0]);r1=FUNCTION_TABLE[HEAP[HEAP[r3+8|0]+32|0]](r2);HEAP[r3+68|0]=r1;return}function _midend_get_params(r1){var r2;r2=r1;return FUNCTION_TABLE[HEAP[HEAP[r2+8|0]+32|0]](HEAP[r2+68|0])}function _midend_force_redraw(r1){var r2,r3,r4,r5,r6;r2=STACKTOP;STACKTOP=STACKTOP+4|0;r3=r2;r4=r1;if((HEAP[r4+76|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[r4+8|0]+140|0]](HEAP[r4+120|0],HEAP[r4+76|0])}r1=FUNCTION_TABLE[HEAP[HEAP[r4+8|0]+136|0]](HEAP[r4+120|0],HEAP[HEAP[r4+64|0]|0]);HEAP[r4+76|0]=r1;HEAP[r3]=r4;if((HEAP[HEAP[r3]+132|0]|0)<=0){r5=r3;r6=r4;_midend_redraw(r6);STACKTOP=r2;return}FUNCTION_TABLE[HEAP[HEAP[HEAP[r3]+8|0]+124|0]](HEAP[HEAP[r3]+68|0],HEAP[HEAP[r3]+132|0],HEAP[r3]+136|0,HEAP[r3]+140|0);FUNCTION_TABLE[HEAP[HEAP[HEAP[r3]+8|0]+128|0]](HEAP[HEAP[r3]+120|0],HEAP[HEAP[r3]+76|0],HEAP[HEAP[r3]+68|0],HEAP[HEAP[r3]+132|0]);r5=r3;r6=r4;_midend_redraw(r6);STACKTOP=r2;return}function _midend_redraw(r1){var r2,r3,r4,r5,r6;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;r6=r1;if((HEAP[r6+120|0]|0)==0){___assert_func(66464,869,67928,67256)}if((HEAP[r6+60|0]|0)<=0){STACKTOP=r3;return}if((HEAP[r6+76|0]|0)==0){STACKTOP=r3;return}HEAP[r5]=HEAP[r6+120|0];FUNCTION_TABLE[HEAP[HEAP[HEAP[r5]|0]+32|0]](HEAP[HEAP[r5]+4|0]);do{if((HEAP[r6+84|0]|0)!=0){if(HEAP[r6+88|0]<=0){r2=1598;break}if(HEAP[r6+92|0]>=HEAP[r6+88|0]){r2=1598;break}if((HEAP[r6+104|0]|0)==0){___assert_func(66464,875,67928,67240)}FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+144|0]](HEAP[r6+120|0],HEAP[r6+76|0],HEAP[r6+84|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0],HEAP[r6+104|0],HEAP[r6+80|0],HEAP[r6+92|0],HEAP[r6+100|0]);break}else{r2=1598}}while(0);if(r2==1598){FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+144|0]](HEAP[r6+120|0],HEAP[r6+76|0],0,HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0],1,HEAP[r6+80|0],0,HEAP[r6+100|0])}HEAP[r4]=HEAP[r6+120|0];FUNCTION_TABLE[HEAP[HEAP[HEAP[r4]|0]+36|0]](HEAP[HEAP[r4]+4|0]);STACKTOP=r3;return}function _dupstr(r1){var r2,r3,r4,r5;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=r2+4;r5=r1;r1=_strlen(r5)+1|0;HEAP[r3]=r1;r1=_malloc(HEAP[r3]);HEAP[r4]=r1;if((HEAP[r4]|0)!=0){r1=HEAP[r4];_strcpy(r1,r5);STACKTOP=r2;return r1}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _midend_can_undo(r1){return(HEAP[r1+60|0]|0)>1&1}function _midend_can_redo(r1){var r2;r2=r1;return(HEAP[r2+60|0]|0)<(HEAP[r2+52|0]|0)&1}function _midend_new_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+148|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+60;r17=r3+64;r18=r3+144;r19=r1;HEAP[r14]=r19;r1=HEAP[r14];L2309:do{if((HEAP[HEAP[r14]+52|0]|0)>0){r20=r1;while(1){r21=r20+52|0;HEAP[r21]=HEAP[r21]-1|0;FUNCTION_TABLE[HEAP[HEAP[HEAP[r14]+8|0]+68|0]](HEAP[HEAP[HEAP[r14]+64|0]+(HEAP[HEAP[r14]+52|0]*12&-1)|0]);r21=HEAP[HEAP[HEAP[r14]+64|0]+(HEAP[HEAP[r14]+52|0]*12&-1)+4|0];HEAP[r13]=r21;if((r21|0)!=0){_free(HEAP[r13])}r21=HEAP[r14];if((HEAP[HEAP[r14]+52|0]|0)>0){r20=r21}else{r22=r21;break L2309}}}else{r22=r1}}while(0);if((HEAP[r22+76|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r14]+8|0]+140|0]](HEAP[HEAP[r14]+120|0],HEAP[HEAP[r14]+76|0])}if((HEAP[r19+52|0]|0)!=0){___assert_func(66464,349,67972,66216)}r14=r19+48|0;if((HEAP[r19+48|0]|0)==1){HEAP[r14]=2}else{if((HEAP[r14]|0)==0){HEAP[r19+48|0]=2}else{HEAP[r15+15|0]=0;r14=((_random_upto(HEAP[r19+4|0],9)&255)<<24>>24)+49&255;HEAP[r15|0]=r14;r14=1;r22=r19;while(1){r1=((_random_upto(HEAP[r22+4|0],10)&255)<<24>>24)+48&255;HEAP[r15+r14|0]=r1;r1=r14+1|0;r14=r1;r23=r19;if((r1|0)<15){r22=r23}else{break}}HEAP[r12]=HEAP[r23+40|0];if((HEAP[r12]|0)!=0){_free(HEAP[r12])}r12=_dupstr(r15|0);HEAP[r19+40|0]=r12;if((HEAP[r19+72|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+28|0]](HEAP[r19+72|0])}r12=FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+32|0]](HEAP[r19+68|0]);HEAP[r19+72|0]=r12}r12=HEAP[r19+32|0];HEAP[r11]=r12;if((r12|0)!=0){_free(HEAP[r11])}r11=HEAP[r19+36|0];HEAP[r10]=r11;if((r11|0)!=0){_free(HEAP[r10])}r10=HEAP[r19+44|0];HEAP[r9]=r10;if((r10|0)!=0){_free(HEAP[r9])}HEAP[r19+44|0]=0;r9=_random_new(HEAP[r19+40|0],_strlen(HEAP[r19+40|0]));r10=FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+52|0]](HEAP[r19+72|0],r9,r19+44|0,(HEAP[r19+120|0]|0)!=0&1);HEAP[r19+32|0]=r10;HEAP[r19+36|0]=0;HEAP[r8]=r9;r9=HEAP[r8];HEAP[r7]=r9;if((r9|0)!=0){_free(HEAP[r7])}}if((HEAP[r19+52|0]|0)>=(HEAP[r19+56|0]|0)){HEAP[r19+56|0]=HEAP[r19+52|0]+128|0;r7=_srealloc(HEAP[r19+64|0],HEAP[r19+56|0]*12&-1);HEAP[r19+64|0]=r7}r7=FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+60|0]](r19,HEAP[r19+68|0],HEAP[r19+32|0]);HEAP[HEAP[r19+64|0]+(HEAP[r19+52|0]*12&-1)|0]=r7;do{if((HEAP[HEAP[r19+8|0]+72|0]|0)!=0){if((HEAP[r19+44|0]|0)==0){break}HEAP[r16]=0;r7=FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+76|0]](HEAP[HEAP[r19+64|0]|0],HEAP[HEAP[r19+64|0]|0],HEAP[r19+44|0],r16);do{if((r7|0)!=0){if((HEAP[r16]|0)!=0){r2=1644;break}else{break}}else{r2=1644}}while(0);if(r2==1644){___assert_func(66464,430,67972,66108)}r9=FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+116|0]](HEAP[HEAP[r19+64|0]|0],r7);if((r9|0)==0){___assert_func(66464,432,67972,66092)}FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+68|0]](r9);r9=r7;HEAP[r6]=r9;if((r9|0)!=0){_free(HEAP[r6])}}}while(0);r6=HEAP[65824];do{if((r6|0)<0){_sprintf(r17|0,66004,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[HEAP[r19+8|0]|0],tempInt));r16=0;r9=0;L2373:do{if(HEAP[r17+r9|0]<<24>>24!=0){while(1){if((_isspace(HEAP[r17+r9|0]&255)|0)==0){r8=_toupper(HEAP[r17+r9|0]&255)&255;r10=r16;r16=r10+1|0;HEAP[r17+r10|0]=r8}r9=r9+1|0;if(HEAP[r17+r9|0]<<24>>24==0){break L2373}}}}while(0);HEAP[r17+r16|0]=0;if((_getenv(r17|0)|0)!=0){_fwrite(65956,26,1,HEAP[_stderr]);HEAP[65824]=1;r2=1659;break}else{HEAP[65824]=0;break}}else{if((r6|0)!=0){r2=1659;break}else{break}}}while(0);if(r2==1659){HEAP[r18]=0;r2=FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+76|0]](HEAP[HEAP[r19+64|0]|0],HEAP[HEAP[r19+64|0]|0],0,r18);r6=r2;if((r2|0)==0|(HEAP[r18]|0)!=0){___assert_func(66464,478,67972,66108)}r18=FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+116|0]](HEAP[HEAP[r19+64|0]|0],r6);if((r18|0)==0){___assert_func(66464,480,67972,66092)}FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+68|0]](r18);r18=r6;HEAP[r5]=r18;if((r18|0)!=0){_free(HEAP[r5])}}HEAP[HEAP[r19+64|0]+(HEAP[r19+52|0]*12&-1)+4|0]=0;HEAP[HEAP[r19+64|0]+(HEAP[r19+52|0]*12&-1)+8|0]=0;r5=r19+52|0;HEAP[r5]=HEAP[r5]+1|0;HEAP[r19+60|0]=1;r5=FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+136|0]](HEAP[r19+120|0],HEAP[HEAP[r19+64|0]|0]);HEAP[r19+76|0]=r5;HEAP[r4]=r19;if((HEAP[HEAP[r4]+132|0]|0)>0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r4]+8|0]+124|0]](HEAP[HEAP[r4]+68|0],HEAP[HEAP[r4]+132|0],HEAP[r4]+136|0,HEAP[r4]+140|0);FUNCTION_TABLE[HEAP[HEAP[HEAP[r4]+8|0]+128|0]](HEAP[HEAP[r4]+120|0],HEAP[HEAP[r4]+76|0],HEAP[HEAP[r4]+68|0],HEAP[HEAP[r4]+132|0])}HEAP[r19+112|0]=0;if((HEAP[r19+80|0]|0)==0){r24=r19;r25=r24+8|0;r26=HEAP[r25];r27=r26+92|0;r28=HEAP[r27];r29=r19;r30=r29+64|0;r31=HEAP[r30];r32=r31|0;r33=r32|0;r34=HEAP[r33];r35=FUNCTION_TABLE[r28](r34);r36=r19;r37=r36+80|0;HEAP[r37]=r35;r38=r19;_midend_set_timer(r38);r39=r19;r40=r39+124|0;HEAP[r40]=0;STACKTOP=r3;return}FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+96|0]](HEAP[r19+80|0]);r24=r19;r25=r24+8|0;r26=HEAP[r25];r27=r26+92|0;r28=HEAP[r27];r29=r19;r30=r29+64|0;r31=HEAP[r30];r32=r31|0;r33=r32|0;r34=HEAP[r33];r35=FUNCTION_TABLE[r28](r34);r36=r19;r37=r36+80|0;HEAP[r37]=r35;r38=r19;_midend_set_timer(r38);r39=r19;r40=r39+124|0;HEAP[r40]=0;STACKTOP=r3;return}function _midend_set_timer(r1){var r2,r3;r2=r1;if((HEAP[HEAP[r2+8|0]+180|0]|0)!=0){r3=(FUNCTION_TABLE[HEAP[HEAP[r2+8|0]+184|0]](HEAP[HEAP[r2+64|0]+((HEAP[r2+60|0]-1)*12&-1)|0],HEAP[r2+80|0])|0)!=0}else{r3=0}HEAP[r2+108|0]=r3&1;do{if((HEAP[r2+108|0]|0)==0){if(HEAP[r2+96|0]!=0){break}if(HEAP[r2+88|0]!=0){break}_deactivate_timer(HEAP[r2|0]);return}}while(0);_activate_timer(HEAP[r2|0]);return}function _midend_finish_move(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r2=0;r3=r1;do{if((HEAP[r3+84|0]|0)!=0){r2=1685}else{if((HEAP[r3+60|0]|0)>1){r2=1685;break}else{break}}}while(0);do{if(r2==1685){do{if((HEAP[r3+104|0]|0)>0){if((HEAP[HEAP[r3+64|0]+((HEAP[r3+60|0]-1)*12&-1)+8|0]|0)!=1){r2=1687;break}else{break}}else{r2=1687}}while(0);if(r2==1687){if((HEAP[r3+104|0]|0)>=0){break}if((HEAP[r3+60|0]|0)>=(HEAP[r3+52|0]|0)){break}if((HEAP[HEAP[r3+64|0]+(HEAP[r3+60|0]*12&-1)+8|0]|0)!=1){break}}r1=r3;if((HEAP[r3+84|0]|0)!=0){r4=HEAP[r1+84|0]}else{r4=HEAP[HEAP[r3+64|0]+((HEAP[r1+60|0]-2)*12&-1)|0]}if((HEAP[r3+84|0]|0)!=0){r5=HEAP[r3+104|0]}else{r5=1}r1=FUNCTION_TABLE[HEAP[HEAP[r3+8|0]+152|0]](r4,HEAP[HEAP[r3+64|0]+((HEAP[r3+60|0]-1)*12&-1)|0],r5,HEAP[r3+80|0]);if(r1<=0){break}HEAP[r3+100|0]=0;HEAP[r3+96|0]=r1}}while(0);if((HEAP[r3+84|0]|0)==0){r6=r3;r7=r6+84|0;HEAP[r7]=0;r8=r3;r9=r8+88|0;HEAP[r9]=0;r10=r3;r11=r10+92|0;HEAP[r11]=0;r12=r3;r13=r12+104|0;HEAP[r13]=0;r14=r3;_midend_set_timer(r14);return}FUNCTION_TABLE[HEAP[HEAP[r3+8|0]+68|0]](HEAP[r3+84|0]);r6=r3;r7=r6+84|0;HEAP[r7]=0;r8=r3;r9=r8+88|0;HEAP[r9]=0;r10=r3;r11=r10+92|0;HEAP[r11]=0;r12=r3;r13=r12+104|0;HEAP[r13]=0;r14=r3;_midend_set_timer(r14);return}function _midend_restart_game(r1){var r2,r3,r4,r5,r6;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;r6=r1;HEAP[r5]=r6;do{if((HEAP[HEAP[r5]+84|0]|0)!=0){r2=1704}else{if(HEAP[HEAP[r5]+88|0]!=0){r2=1704;break}else{break}}}while(0);if(r2==1704){_midend_finish_move(HEAP[r5]);_midend_redraw(HEAP[r5])}if(!((HEAP[r6+60|0]|0)>=1)){___assert_func(66464,586,67908,65928)}if((HEAP[r6+60|0]|0)==1){STACKTOP=r3;return}r5=FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+60|0]](r6,HEAP[r6+68|0],HEAP[r6+32|0]);HEAP[r4]=r6;do{if((HEAP[HEAP[r4]+84|0]|0)!=0){r2=1710}else{if(HEAP[HEAP[r4]+88|0]!=0){r2=1710;break}else{break}}}while(0);if(r2==1710){_midend_finish_move(HEAP[r4]);_midend_redraw(HEAP[r4])}_midend_purge_states(r6);if((HEAP[r6+52|0]|0)>=(HEAP[r6+56|0]|0)){HEAP[r6+56|0]=HEAP[r6+52|0]+128|0;r4=_srealloc(HEAP[r6+64|0],HEAP[r6+56|0]*12&-1);HEAP[r6+64|0]=r4}HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)|0]=r5;r5=_dupstr(HEAP[r6+32|0]);HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)+4|0]=r5;HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)+8|0]=3;r5=r6+52|0;r4=HEAP[r5]+1|0;HEAP[r5]=r4;HEAP[r6+60|0]=r4;if((HEAP[r6+80|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+108|0]](HEAP[r6+80|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-2)*12&-1)|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0])}HEAP[r6+88|0]=0;_midend_finish_move(r6);_midend_redraw(r6);_midend_set_timer(r6);STACKTOP=r3;return}function _midend_purge_states(r1){var r2,r3,r4;r2=r1;if((HEAP[r2+52|0]|0)<=(HEAP[r2+60|0]|0)){return}while(1){r1=HEAP[HEAP[r2+8|0]+68|0];r3=r2+52|0;r4=HEAP[r3]-1|0;HEAP[r3]=r4;FUNCTION_TABLE[r1](HEAP[HEAP[r2+64|0]+(r4*12&-1)|0]);if((HEAP[HEAP[r2+64|0]+(HEAP[r2+52|0]*12&-1)+4|0]|0)!=0){_sfree(HEAP[HEAP[r2+64|0]+(HEAP[r2+52|0]*12&-1)+4|0])}if((HEAP[r2+52|0]|0)<=(HEAP[r2+60|0]|0)){break}}return}function _midend_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11;r5=0;r6=r1;r1=r2;r2=r3;r3=r4;r4=1;do{if((r3-515|0)>>>0<=2){r5=1728}else{if((r3-518|0)>>>0<=2){r5=1728;break}if(!((r3-512|0)>>>0<=2)){break}if((HEAP[r6+124|0]|0)==0){break}r7=r4;if((1<<r3-512+((HEAP[r6+124|0]-512)*3&-1)&HEAP[HEAP[r6+8|0]+188|0]|0)!=0){r8=r7;r9=r8;return r9}if((r7|0)!=0){r10=(_midend_really_process_key(r6,r1,r2,HEAP[r6+124|0]+6|0)|0)!=0}else{r10=0}r4=r10&1;break}}while(0);do{if(r5==1728){if((HEAP[r6+124|0]|0)==0){r8=r4;r9=r8;return r9}r10=HEAP[r6+124|0];if((r3-515|0)>>>0<=2){r3=r10+3|0;break}else{r3=r10+6|0;break}}}while(0);r5=r3;do{if((r3|0)==10|(r5|0)==13){r3=525}else{if((r5|0)==32){r3=526;break}if((r3|0)!=127){break}r3=8}}while(0);if((r4|0)!=0){r11=(_midend_really_process_key(r6,r1,r2,r3)|0)!=0}else{r11=0}r4=r11&1;do{if((r3-518|0)>>>0<=2){HEAP[r6+124|0]=0}else{if(!((r3-512|0)>>>0<=2)){break}HEAP[r6+124|0]=r3}}while(0);r8=r4;r9=r8;return r9}function _midend_wants_statusbar(r1){return HEAP[HEAP[r1+8|0]+176|0]}function _midend_really_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+32|0;r7=r6;r8=r6+4;r9=r6+8;r10=r6+12;r11=r6+16;r12=r6+20;r13=r6+24;r14=r6+28;r15=r1;r1=r4;r4=FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+64|0]](HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0]);r16=1;r17=0;r18=1;r19=FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+112|0]](HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0],HEAP[r15+80|0],HEAP[r15+76|0],r2,r3,r1);L2513:do{if((r19|0)!=0){r3=r15;do{if(HEAP[r19]<<24>>24!=0){r20=FUNCTION_TABLE[HEAP[HEAP[r3+8|0]+116|0]](HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0],r19);if((r20|0)!=0){break}___assert_func(66464,664,67944,66036)}else{r20=HEAP[HEAP[r15+64|0]+((HEAP[r3+60|0]-1)*12&-1)|0]}}while(0);if((r20|0)==(HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0]|0)){_midend_redraw(r15);_midend_set_timer(r15);break}if((r20|0)==0){break}HEAP[r7]=r15;do{if((HEAP[HEAP[r7]+84|0]|0)!=0){r5=1796}else{if(HEAP[HEAP[r7]+88|0]!=0){r5=1796;break}else{break}}}while(0);if(r5==1796){_midend_finish_move(HEAP[r7]);_midend_redraw(HEAP[r7])}_midend_purge_states(r15);if((HEAP[r15+52|0]|0)>=(HEAP[r15+56|0]|0)){HEAP[r15+56|0]=HEAP[r15+52|0]+128|0;r3=_srealloc(HEAP[r15+64|0],HEAP[r15+56|0]*12&-1);HEAP[r15+64|0]=r3}if((r19|0)==0){___assert_func(66464,680,67944,66020)}HEAP[HEAP[r15+64|0]+(HEAP[r15+52|0]*12&-1)|0]=r20;HEAP[HEAP[r15+64|0]+(HEAP[r15+52|0]*12&-1)+4|0]=r19;HEAP[HEAP[r15+64|0]+(HEAP[r15+52|0]*12&-1)+8|0]=1;r3=r15+52|0;r2=HEAP[r3]+1|0;HEAP[r3]=r2;HEAP[r15+60|0]=r2;HEAP[r15+104|0]=1;if((HEAP[r15+80|0]|0)==0){r5=1803;break}FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+108|0]](HEAP[r15+80|0],HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-2)*12&-1)|0],HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0]);r5=1803;break}else{if((r1|0)==110|(r1|0)==78|(r1|0)==14){HEAP[r14]=r15;do{if((HEAP[HEAP[r14]+84|0]|0)!=0){r5=1762}else{if(HEAP[HEAP[r14]+88|0]!=0){r5=1762;break}else{break}}}while(0);if(r5==1762){_midend_finish_move(HEAP[r14]);_midend_redraw(HEAP[r14])}_midend_new_game(r15);_midend_redraw(r15);break}if((r1|0)==117|(r1|0)==85|(r1|0)==26|(r1|0)==31){HEAP[r13]=r15;do{if((HEAP[HEAP[r13]+84|0]|0)!=0){r5=1767}else{if(HEAP[HEAP[r13]+88|0]!=0){r5=1767;break}else{break}}}while(0);if(r5==1767){_midend_finish_move(HEAP[r13]);_midend_redraw(HEAP[r13])}r16=HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)+8|0];r17=1;HEAP[r12]=r15;if((HEAP[HEAP[r12]+60|0]|0)<=1){HEAP[r11]=0;break}if((HEAP[HEAP[r12]+80|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r12]+8|0]+108|0]](HEAP[HEAP[r12]+80|0],HEAP[HEAP[HEAP[r12]+64|0]+((HEAP[HEAP[r12]+60|0]-1)*12&-1)|0],HEAP[HEAP[HEAP[r12]+64|0]+((HEAP[HEAP[r12]+60|0]-2)*12&-1)|0])}r2=HEAP[r12]+60|0;HEAP[r2]=HEAP[r2]-1|0;HEAP[HEAP[r12]+104|0]=-1;HEAP[r11]=1;r5=1803;break}if(!((r1|0)==114|(r1|0)==82|(r1|0)==18|(r1|0)==25)){do{if((r1|0)==19){if((HEAP[HEAP[r15+8|0]+72|0]|0)==0){break}if((_midend_solve(r15)|0)!=0){break L2513}else{r5=1803;break L2513}}}while(0);if(!((r1|0)==113|(r1|0)==81|(r1|0)==17)){break}r18=0;break}HEAP[r10]=r15;do{if((HEAP[HEAP[r10]+84|0]|0)!=0){r5=1776}else{if(HEAP[HEAP[r10]+88|0]!=0){r5=1776;break}else{break}}}while(0);if(r5==1776){_midend_finish_move(HEAP[r10]);_midend_redraw(HEAP[r10])}HEAP[r9]=r15;if((HEAP[HEAP[r9]+60|0]|0)>=(HEAP[HEAP[r9]+52|0]|0)){HEAP[r8]=0;break}if((HEAP[HEAP[r9]+80|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r9]+8|0]+108|0]](HEAP[HEAP[r9]+80|0],HEAP[HEAP[HEAP[r9]+64|0]+((HEAP[HEAP[r9]+60|0]-1)*12&-1)|0],HEAP[HEAP[HEAP[r9]+64|0]+(HEAP[HEAP[r9]+60|0]*12&-1)|0])}r2=HEAP[r9]+60|0;HEAP[r2]=HEAP[r2]+1|0;HEAP[HEAP[r9]+104|0]=1;HEAP[r8]=1;r5=1803;break}}while(0);if(r5==1803){if((r17|0)!=0){r21=r16}else{r17=HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)+8|0];r16=r17;r21=r17}do{if((r21|0)!=1){if((r16|0)==2){if((HEAP[HEAP[r15+8|0]+188|0]&512|0)!=0){r5=1810;break}}r22=0;break}else{r5=1810}}while(0);if(r5==1810){r22=FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+148|0]](r4,HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0],HEAP[r15+104|0],HEAP[r15+80|0])}HEAP[r15+84|0]=r4;r4=0;if(r22>0){HEAP[r15+88|0]=r22}else{HEAP[r15+88|0]=0;_midend_finish_move(r15)}HEAP[r15+92|0]=0;_midend_redraw(r15);_midend_set_timer(r15)}if((r4|0)==0){r23=r18;STACKTOP=r6;return r23}FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+68|0]](r4);r23=r18;STACKTOP=r6;return r23}function _midend_timer(r1,r2){var r3,r4,r5,r6,r7;r3=0;r4=r1;r1=r2;if(HEAP[r4+88|0]>0){r5=1}else{r5=HEAP[r4+96|0]>0}r2=r5&1;r5=r4+92|0;HEAP[r5]=r1+HEAP[r5];do{if(HEAP[r4+92|0]>=HEAP[r4+88|0]){r3=1825}else{if(HEAP[r4+88|0]==0){r3=1825;break}if((HEAP[r4+84|0]|0)!=0){break}else{r3=1825;break}}}while(0);do{if(r3==1825){if(HEAP[r4+88|0]<=0){break}_midend_finish_move(r4)}}while(0);r5=r4+100|0;HEAP[r5]=r1+HEAP[r5];do{if(HEAP[r4+100|0]>=HEAP[r4+96|0]){r3=1829}else{if(HEAP[r4+96|0]==0){r3=1829;break}else{break}}}while(0);if(r3==1829){HEAP[r4+96|0]=0;HEAP[r4+100|0]=0}if((r2|0)!=0){_midend_redraw(r4)}if((HEAP[r4+108|0]|0)==0){r6=r4;_midend_set_timer(r6);return}r2=HEAP[r4+112|0];r3=r4+112|0;HEAP[r3]=r1+HEAP[r3];if((r2&-1|0)==(HEAP[r4+112|0]&-1|0)){r6=r4;_midend_set_timer(r6);return}if((HEAP[r4+116|0]|0)!=0){r7=HEAP[r4+116|0]}else{r7=67208}_status_bar(HEAP[r4+120|0],r7);r6=r4;_midend_set_timer(r6);return}function _midend_which_preset(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=STACKTOP;STACKTOP=STACKTOP+4|0;r3=r2;r4=r1;r1=FUNCTION_TABLE[HEAP[HEAP[r4+8|0]+24|0]](HEAP[r4+68|0],1);r5=-1;r6=0;L2631:do{if((r6|0)<(HEAP[r4+24|0]|0)){while(1){r7=r6;if((_strcmp(r1,HEAP[(r6<<2)+HEAP[r4+20|0]|0])|0)==0){break}r6=r7+1|0;if((r6|0)>=(HEAP[r4+24|0]|0)){break L2631}}r5=r7}}while(0);r7=r1;HEAP[r3]=r7;if((r7|0)==0){r8=r3;r9=r5;STACKTOP=r2;return r9}_free(HEAP[r3]);r8=r3;r9=r5;STACKTOP=r2;return r9}function _midend_solve(r1){var r2,r3,r4,r5,r6,r7,r8;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;r6=r1;if((HEAP[HEAP[r6+8|0]+72|0]|0)==0){r7=66696;r8=r7;STACKTOP=r3;return r8}if((HEAP[r6+60|0]|0)<1){r7=66652;r8=r7;STACKTOP=r3;return r8}HEAP[r5]=0;r1=FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+76|0]](HEAP[HEAP[r6+64|0]|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0],HEAP[r6+44|0],r5);if((r1|0)==0){if((HEAP[r5]|0)==0){HEAP[r5]=66620}r7=HEAP[r5];r8=r7;STACKTOP=r3;return r8}r5=FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+116|0]](HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0],r1);if((r5|0)==0){___assert_func(66464,1376,67892,66092)}HEAP[r4]=r6;do{if((HEAP[HEAP[r4]+84|0]|0)!=0){r2=1862}else{if(HEAP[HEAP[r4]+88|0]!=0){r2=1862;break}else{break}}}while(0);if(r2==1862){_midend_finish_move(HEAP[r4]);_midend_redraw(HEAP[r4])}_midend_purge_states(r6);if((HEAP[r6+52|0]|0)>=(HEAP[r6+56|0]|0)){HEAP[r6+56|0]=HEAP[r6+52|0]+128|0;r4=_srealloc(HEAP[r6+64|0],HEAP[r6+56|0]*12&-1);HEAP[r6+64|0]=r4}HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)|0]=r5;HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)+4|0]=r1;HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)+8|0]=2;r1=r6+52|0;r5=HEAP[r1]+1|0;HEAP[r1]=r5;HEAP[r6+60|0]=r5;if((HEAP[r6+80|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+108|0]](HEAP[r6+80|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-2)*12&-1)|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0])}HEAP[r6+104|0]=1;r5=r6;if((HEAP[HEAP[r6+8|0]+188|0]&512|0)!=0){r1=FUNCTION_TABLE[HEAP[HEAP[r5+8|0]+64|0]](HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-2)*12&-1)|0]);HEAP[r6+84|0]=r1;r1=FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+148|0]](HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-2)*12&-1)|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0],1,HEAP[r6+80|0]);HEAP[r6+88|0]=r1;HEAP[r6+92|0]=0}else{HEAP[r5+88|0]=0;_midend_finish_move(r6)}if((HEAP[r6+120|0]|0)!=0){_midend_redraw(r6)}_midend_set_timer(r6);r7=0;r8=r7;STACKTOP=r3;return r8}function _midend_status(r1){var r2,r3;r2=r1;if((HEAP[r2+60|0]|0)==0){r1=1;r3=r1;return r3}else{r1=FUNCTION_TABLE[HEAP[HEAP[r2+8|0]+156|0]](HEAP[HEAP[r2+64|0]+((HEAP[r2+60|0]-1)*12&-1)|0]);r3=r1;return r3}}function _SHA_Bytes(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r4=STACKTOP;STACKTOP=STACKTOP+436|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+328;r9=r4+332;r10=r4+336;r11=r4+340;r12=r4+344;r13=r4+348;r14=r4+352;r15=r4+356;r16=r4+360;r17=r4+364;r18=r4+368;r19=r4+372;r20=r1;r1=r3;r3=r2;r2=r1;r21=r20+92|0;HEAP[r21]=HEAP[r21]+r2|0;r21=r20+88|0;HEAP[r21]=HEAP[r21]+(HEAP[r20+92|0]>>>0<r2>>>0&1)|0;do{if((HEAP[r20+84|0]|0)!=0){if((r1+HEAP[r20+84|0]|0)>=64){break}r2=r20+HEAP[r20+84|0]+20|0;r21=r3;r22=r1;for(r23=r21,r24=r2,r25=r23+r22;r23<r25;r23++,r24++){HEAP[r24]=HEAP[r23]}r22=r20+84|0;HEAP[r22]=HEAP[r22]+r1|0;STACKTOP=r4;return}}while(0);r22=r20+20|0;L2691:do{if((r1+HEAP[r20+84|0]|0)>=64){r2=r19|0;r21=r22;while(1){r26=r21+HEAP[r20+84|0]|0;r27=r3;r28=64-HEAP[r20+84|0]|0;for(r23=r27,r24=r26,r25=r23+r28;r23<r25;r23++,r24++){HEAP[r24]=HEAP[r23]}r3=r3+(64-HEAP[r20+84|0])|0;r1=-(-HEAP[r20+84|0]|0)-64+r1|0;r28=0;while(1){HEAP[(r28<<2)+r19|0]=(HEAP[(r28<<2)+r20+21|0]&255)<<16|(HEAP[(r28<<2)+r20+20|0]&255)<<24|(HEAP[(r28<<2)+r20+22|0]&255)<<8|(HEAP[(r28<<2)+r20+23|0]&255)<<0;r26=r28+1|0;r28=r26;if((r26|0)>=16){break}}HEAP[r5]=r20|0;HEAP[r6]=r2;HEAP[r13]=0;while(1){HEAP[(HEAP[r13]<<2)+r7|0]=HEAP[(HEAP[r13]<<2)+HEAP[r6]|0];r28=HEAP[r13]+1|0;HEAP[r13]=r28;if((r28|0)>=16){break}}HEAP[r13]=16;while(1){HEAP[r14]=HEAP[(HEAP[r13]-8<<2)+r7|0]^HEAP[(HEAP[r13]-3<<2)+r7|0]^HEAP[(HEAP[r13]-14<<2)+r7|0]^HEAP[(HEAP[r13]-16<<2)+r7|0];HEAP[(HEAP[r13]<<2)+r7|0]=HEAP[r14]>>>31|HEAP[r14]<<1;r28=HEAP[r13]+1|0;HEAP[r13]=r28;if((r28|0)>=80){break}}HEAP[r8]=HEAP[HEAP[r5]];HEAP[r9]=HEAP[HEAP[r5]+4|0];HEAP[r10]=HEAP[HEAP[r5]+8|0];HEAP[r11]=HEAP[HEAP[r5]+12|0];HEAP[r12]=HEAP[HEAP[r5]+16|0];HEAP[r13]=0;while(1){HEAP[r15]=(HEAP[r8]>>>27|HEAP[r8]<<5)+HEAP[r12]+((HEAP[r9]^-1)&HEAP[r11]|HEAP[r10]&HEAP[r9])+HEAP[(HEAP[r13]<<2)+r7|0]+1518500249|0;HEAP[r12]=HEAP[r11];HEAP[r11]=HEAP[r10];HEAP[r10]=HEAP[r9]>>>2|HEAP[r9]<<30;HEAP[r9]=HEAP[r8];HEAP[r8]=HEAP[r15];r28=HEAP[r13]+1|0;HEAP[r13]=r28;if((r28|0)>=20){break}}HEAP[r13]=20;while(1){HEAP[r16]=(HEAP[r8]>>>27|HEAP[r8]<<5)+(HEAP[r10]^HEAP[r9]^HEAP[r11])+HEAP[r12]+HEAP[(HEAP[r13]<<2)+r7|0]+1859775393|0;HEAP[r12]=HEAP[r11];HEAP[r11]=HEAP[r10];HEAP[r10]=HEAP[r9]>>>2|HEAP[r9]<<30;HEAP[r9]=HEAP[r8];HEAP[r8]=HEAP[r16];r28=HEAP[r13]+1|0;HEAP[r13]=r28;if((r28|0)>=40){break}}HEAP[r13]=40;while(1){HEAP[r17]=(HEAP[r8]>>>27|HEAP[r8]<<5)-1894007588+HEAP[r12]+(HEAP[r11]&HEAP[r9]|HEAP[r10]&HEAP[r9]|HEAP[r11]&HEAP[r10])+HEAP[(HEAP[r13]<<2)+r7|0]|0;HEAP[r12]=HEAP[r11];HEAP[r11]=HEAP[r10];HEAP[r10]=HEAP[r9]>>>2|HEAP[r9]<<30;HEAP[r9]=HEAP[r8];HEAP[r8]=HEAP[r17];r28=HEAP[r13]+1|0;HEAP[r13]=r28;if((r28|0)>=60){break}}HEAP[r13]=60;r28=HEAP[r8];while(1){HEAP[r18]=(HEAP[r8]>>>27|r28<<5)-899497514+(HEAP[r10]^HEAP[r9]^HEAP[r11])+HEAP[r12]+HEAP[(HEAP[r13]<<2)+r7|0]|0;HEAP[r12]=HEAP[r11];HEAP[r11]=HEAP[r10];HEAP[r10]=HEAP[r9]>>>2|HEAP[r9]<<30;HEAP[r9]=HEAP[r8];HEAP[r8]=HEAP[r18];r26=HEAP[r13]+1|0;HEAP[r13]=r26;r29=HEAP[r8];if((r26|0)<80){r28=r29}else{break}}r28=HEAP[r5];HEAP[r28]=HEAP[r28]+r29|0;r28=HEAP[r5]+4|0;HEAP[r28]=HEAP[r28]+HEAP[r9]|0;r28=HEAP[r5]+8|0;HEAP[r28]=HEAP[r28]+HEAP[r10]|0;r28=HEAP[r5]+12|0;HEAP[r28]=HEAP[r28]+HEAP[r11]|0;r28=HEAP[r5]+16|0;HEAP[r28]=HEAP[r28]+HEAP[r12]|0;HEAP[r20+84|0]=0;r28=r20+20|0;if((r1+HEAP[r20+84|0]|0)>=64){r21=r28}else{r30=r28;break L2691}}}else{r30=r22}}while(0);r22=r30;r30=r3;r3=r1;for(r23=r30,r24=r22,r25=r23+r3;r23<r25;r23++,r24++){HEAP[r24]=HEAP[r23]}HEAP[r20+84|0]=r1;STACKTOP=r4;return}function _SHA_Simple(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r4=STACKTOP;STACKTOP=STACKTOP+192|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+80;r11=r4+84;r12=r4+88;r13=r4+92;r14=r4+96;HEAP[r13]=r14;HEAP[r12]=HEAP[r13]|0;HEAP[HEAP[r12]]=1732584193;HEAP[HEAP[r12]+4|0]=-271733879;HEAP[HEAP[r12]+8|0]=-1732584194;HEAP[HEAP[r12]+12|0]=271733878;HEAP[HEAP[r12]+16|0]=-1009589776;HEAP[HEAP[r13]+84|0]=0;HEAP[HEAP[r13]+92|0]=0;HEAP[HEAP[r13]+88|0]=0;_SHA_Bytes(r14,r1,r2);HEAP[r5]=r14;HEAP[r6]=r3;r3=HEAP[HEAP[r5]+84|0];if((HEAP[HEAP[r5]+84|0]|0)>=56){HEAP[r8]=120-r3|0}else{HEAP[r8]=56-r3|0}HEAP[r10]=HEAP[HEAP[r5]+92|0]>>>29|HEAP[HEAP[r5]+88|0]<<3;HEAP[r11]=HEAP[HEAP[r5]+92|0]<<3;r3=r9;r14=HEAP[r8];for(r2=r3,r1=r2+r14;r2<r1;r2++){HEAP[r2]=0}HEAP[r9|0]=-128;_SHA_Bytes(HEAP[r5],r9,HEAP[r8]);HEAP[r9|0]=HEAP[r10]>>>24&255;HEAP[r9+1|0]=HEAP[r10]>>>16&255;HEAP[r9+2|0]=HEAP[r10]>>>8&255;HEAP[r9+3|0]=HEAP[r10]&255;HEAP[r9+4|0]=HEAP[r11]>>>24&255;HEAP[r9+5|0]=HEAP[r11]>>>16&255;HEAP[r9+6|0]=HEAP[r11]>>>8&255;HEAP[r9+7|0]=HEAP[r11]&255;_SHA_Bytes(HEAP[r5],r9,8);HEAP[r7]=0;while(1){HEAP[(HEAP[r7]<<2)+HEAP[r6]|0]=HEAP[(HEAP[r7]<<2)+HEAP[r5]|0]>>>24&255;HEAP[(HEAP[r7]<<2)+HEAP[r6]+1|0]=HEAP[(HEAP[r7]<<2)+HEAP[r5]|0]>>>16&255;HEAP[(HEAP[r7]<<2)+HEAP[r6]+2|0]=HEAP[(HEAP[r7]<<2)+HEAP[r5]|0]>>>8&255;HEAP[(HEAP[r7]<<2)+HEAP[r6]+3|0]=HEAP[(HEAP[r7]<<2)+HEAP[r5]|0]&255;r9=HEAP[r7]+1|0;HEAP[r7]=r9;if((r9|0)>=5){break}}STACKTOP=r4;return}function _random_upto(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+20|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r1;r1=r2;r2=0;r11=r2;L2727:do{if((r1>>>(r2>>>0)|0)!=0){r12=r11;while(1){r2=r12+1|0;r13=r2;if((r1>>>(r2>>>0)|0)!=0){r12=r13}else{r14=r13;break L2727}}}else{r14=r11}}while(0);r11=r14+3|0;r2=r11;if((r11|0)>=32){___assert_func(66932,275,67852,67212)}r11=1<<r2;r14=Math.floor((r11>>>0)/(r1>>>0));r11=Math.imul(r14,r1);while(1){HEAP[r5]=r10;HEAP[r6]=r2;HEAP[r7]=0;HEAP[r8]=0;L2736:do{if((HEAP[r8]|0)<(HEAP[r6]|0)){while(1){if((HEAP[HEAP[r5]+60|0]|0)>=20){HEAP[r9]=0;while(1){r15=HEAP[r5]+HEAP[r9]|0;if((HEAP[HEAP[r5]+HEAP[r9]|0]&255|0)!=255){r3=1923;break}HEAP[r15]=0;r1=HEAP[r9]+1|0;HEAP[r9]=r1;if((r1|0)>=20){break}}if(r3==1923){r3=0;HEAP[r15]=HEAP[r15]+1&255}_SHA_Simple(HEAP[r5]|0,40,HEAP[r5]+40|0);HEAP[HEAP[r5]+60|0]=0}r1=HEAP[r7]<<8;r12=HEAP[r5]+60|0;r13=HEAP[r12];HEAP[r12]=r13+1|0;HEAP[r7]=HEAP[HEAP[r5]+r13+40|0]&255|r1;HEAP[r8]=HEAP[r8]+8|0;if((HEAP[r8]|0)>=(HEAP[r6]|0)){break L2736}}}}while(0);HEAP[r7]=(1<<HEAP[r6]-1<<1)-1&HEAP[r7];r16=HEAP[r7];if(!(r16>>>0>=r11>>>0)){break}}r11=Math.floor((r16>>>0)/(r14>>>0));STACKTOP=r4;return r11}function _random_new(r1,r2){var r3,r4,r5,r6;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;HEAP[r4]=64;r6=_malloc(HEAP[r4]);HEAP[r5]=r6;if((HEAP[r5]|0)!=0){r6=HEAP[r5];_SHA_Simple(r1,r2,r6|0);_SHA_Simple(r6|0,20,r6+20|0);_SHA_Simple(r6|0,40,r6+40|0);HEAP[r6+60|0]=0;STACKTOP=r3;return r6}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _malloc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189,r190,r191,r192,r193,r194,r195,r196,r197,r198,r199,r200,r201,r202,r203,r204,r205,r206,r207,r208,r209,r210,r211,r212,r213,r214,r215,r216,r217,r218,r219,r220,r221,r222,r223,r224,r225,r226,r227,r228,r229,r230,r231,r232,r233,r234,r235,r236,r237,r238,r239,r240,r241,r242,r243,r244,r245,r246;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+776|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r3+100;r30=r3+104;r31=r3+108;r32=r3+112;r33=r3+116;r34=r3+120;r35=r3+124;r36=r3+128;r37=r3+132;r38=r3+136;r39=r3+140;r40=r3+144;r41=r3+148;r42=r3+152;r43=r3+156;r44=r3+160;r45=r3+164;r46=r3+168;r47=r3+172;r48=r3+176;r49=r3+180;r50=r3+184;r51=r3+188;r52=r3+192;r53=r3+196;r54=r3+200;r55=r3+204;r56=r3+208;r57=r3+212;r58=r3+216;r59=r3+220;r60=r3+224;r61=r3+228;r62=r3+232;r63=r3+236;r64=r3+240;r65=r3+244;r66=r3+248;r67=r3+252;r68=r3+256;r69=r3+260;r70=r3+264;r71=r3+268;r72=r3+272;r73=r3+276;r74=r3+280;r75=r3+284;r76=r3+288;r77=r3+292;r78=r3+296;r79=r3+300;r80=r3+304;r81=r3+308;r82=r3+312;r83=r3+316;r84=r3+320;r85=r3+324;r86=r3+328;r87=r3+332;r88=r3+336;r89=r3+340;r90=r3+344;r91=r3+348;r92=r3+352;r93=r3+356;r94=r3+360;r95=r3+364;r96=r3+368;r97=r3+372;r98=r3+376;r99=r3+380;r100=r3+384;r101=r3+388;r102=r3+392;r103=r3+396;r104=r3+400;r105=r3+404;r106=r3+408;r107=r3+412;r108=r3+416;r109=r3+420;r110=r3+424;r111=r3+428;r112=r3+432;r113=r3+436;r114=r3+440;r115=r3+444;r116=r3+448;r117=r3+452;r118=r3+456;r119=r3+460;r120=r3+464;r121=r3+468;r122=r3+472;r123=r3+476;r124=r3+480;r125=r3+484;r126=r3+488;r127=r3+492;r128=r3+496;r129=r3+500;r130=r3+504;r131=r3+508;r132=r3+512;r133=r3+516;r134=r3+520;r135=r3+524;r136=r3+528;r137=r3+532;r138=r3+536;r139=r3+540;r140=r3+544;r141=r3+548;r142=r3+552;r143=r3+556;r144=r3+560;r145=r3+564;r146=r3+568;r147=r3+572;r148=r3+576;r149=r3+580;r150=r3+584;r151=r3+588;r152=r3+592;r153=r3+596;r154=r3+600;r155=r3+604;r156=r3+608;r157=r3+612;r158=r3+616;r159=r3+620;r160=r3+624;r161=r3+628;r162=r3+632;r163=r3+636;r164=r3+640;r165=r3+644;r166=r3+648;r167=r3+652;r168=r3+656;r169=r3+660;r170=r3+664;r171=r3+668;r172=r3+672;r173=r3+676;r174=r3+680;r175=r3+684;r176=r3+688;r177=r3+692;r178=r3+696;r179=r3+700;r180=r3+704;r181=r3+708;r182=r3+712;r183=r3+716;r184=r3+720;r185=r3+724;r186=r3+728;r187=r3+732;r188=r3+736;r189=r3+740;r190=r3+744;r191=r3+748;r192=r3+752;r193=r3+756;r194=r3+760;r195=r3+764;r196=r3+768;r197=r3+772;r198=r1;r1=r198;do{if(r198>>>0<=244){if(r1>>>0<11){r199=16}else{r199=r198+11&-8}r200=r199;r201=r200>>>3;r202=HEAP[67320]>>>(r201>>>0);if((r202&3|0)!=0){r201=r201+((r202^-1)&1)|0;r203=(r201<<3)+67360|0;r204=HEAP[r203+8|0];r205=HEAP[r204+8|0];do{if((r203|0)==(r205|0)){HEAP[67320]=HEAP[67320]&(1<<r201^-1)}else{if(r205>>>0>=HEAP[67336]>>>0){r206=(HEAP[r205+12|0]|0)==(r204|0)}else{r206=0}if((r206&1|0)!=0){HEAP[r205+12|0]=r203;HEAP[r203+8|0]=r205;break}else{_abort()}}}while(0);HEAP[r204+4|0]=r201<<3|3;r205=(r201<<3)+r204+4|0;HEAP[r205]=HEAP[r205]|1;r207=r204+8|0;r208=r207;STACKTOP=r3;return r208}if(r200>>>0<=HEAP[67328]>>>0){break}if((r202|0)!=0){r205=(-(1<<r201<<1)|1<<r201<<1)&r202<<r201;r203=(-r205&r205)-1|0;r205=r203>>>12&16;r209=r205;r203=r203>>>(r205>>>0);r210=r203>>>5&8;r205=r210;r209=r210+r209|0;r203=r203>>>(r205>>>0);r210=r203>>>2&4;r205=r210;r209=r210+r209|0;r203=r203>>>(r205>>>0);r210=r203>>>1&2;r205=r210;r209=r210+r209|0;r203=r203>>>(r205>>>0);r210=r203>>>1&1;r205=r210;r209=r210+r209|0;r203=r203>>>(r205>>>0);r205=r203+r209|0;r209=(r205<<3)+67360|0;r203=HEAP[r209+8|0];r210=HEAP[r203+8|0];do{if((r209|0)==(r210|0)){HEAP[67320]=HEAP[67320]&(1<<r205^-1)}else{if(r210>>>0>=HEAP[67336]>>>0){r211=(HEAP[r210+12|0]|0)==(r203|0)}else{r211=0}if((r211&1|0)!=0){HEAP[r210+12|0]=r209;HEAP[r209+8|0]=r210;break}else{_abort()}}}while(0);r210=(r205<<3)-r200|0;HEAP[r203+4|0]=r200|3;r209=r203+r200|0;HEAP[r209+4|0]=r210|1;HEAP[r209+r210|0]=r210;r201=HEAP[67328];if((r201|0)!=0){r202=HEAP[67340];r204=r201>>>3;r201=(r204<<3)+67360|0;r212=r201;do{if((1<<r204&HEAP[67320]|0)!=0){if((HEAP[r201+8|0]>>>0>=HEAP[67336]>>>0&1|0)!=0){r212=HEAP[r201+8|0];break}else{_abort()}}else{HEAP[67320]=HEAP[67320]|1<<r204}}while(0);HEAP[r201+8|0]=r202;HEAP[r212+12|0]=r202;HEAP[r202+8|0]=r212;HEAP[r202+12|0]=r201}HEAP[67328]=r210;HEAP[67340]=r209;r207=r203+8|0;r208=r207;STACKTOP=r3;return r208}if((HEAP[67324]|0)==0){break}HEAP[r173]=67320;HEAP[r174]=r200;HEAP[r179]=-HEAP[HEAP[r173]+4|0]&HEAP[HEAP[r173]+4|0];HEAP[r180]=HEAP[r179]-1|0;HEAP[r181]=HEAP[r180]>>>12&16;HEAP[r182]=HEAP[r181];HEAP[r180]=HEAP[r180]>>>(HEAP[r181]>>>0);r204=HEAP[r180]>>>5&8;HEAP[r181]=r204;HEAP[r182]=r204+HEAP[r182]|0;HEAP[r180]=HEAP[r180]>>>(HEAP[r181]>>>0);r204=HEAP[r180]>>>2&4;HEAP[r181]=r204;HEAP[r182]=r204+HEAP[r182]|0;HEAP[r180]=HEAP[r180]>>>(HEAP[r181]>>>0);r204=HEAP[r180]>>>1&2;HEAP[r181]=r204;HEAP[r182]=r204+HEAP[r182]|0;HEAP[r180]=HEAP[r180]>>>(HEAP[r181]>>>0);r204=HEAP[r180]>>>1&1;HEAP[r181]=r204;HEAP[r182]=r204+HEAP[r182]|0;HEAP[r180]=HEAP[r180]>>>(HEAP[r181]>>>0);HEAP[r178]=HEAP[r180]+HEAP[r182]|0;r204=HEAP[(HEAP[r178]<<2)+HEAP[r173]+304|0];HEAP[r175]=r204;HEAP[r176]=r204;HEAP[r177]=(HEAP[HEAP[r175]+4|0]&-8)-HEAP[r174]|0;while(1){r204=HEAP[r175]+16|0;if((HEAP[HEAP[r175]+16|0]|0)!=0){r213=HEAP[r204|0]}else{r213=HEAP[r204+4|0]}HEAP[r175]=r213;if((r213|0)==0){break}HEAP[r183]=(HEAP[HEAP[r175]+4|0]&-8)-HEAP[r174]|0;if(HEAP[r183]>>>0>=HEAP[r177]>>>0){continue}HEAP[r177]=HEAP[r183];HEAP[r176]=HEAP[r175]}if((HEAP[r176]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)==0){_abort()}HEAP[r184]=HEAP[r176]+HEAP[r174]|0;if((HEAP[r176]>>>0<HEAP[r184]>>>0&1|0)==0){_abort()}HEAP[r185]=HEAP[HEAP[r176]+24|0];r203=HEAP[r176];L61:do{if((HEAP[HEAP[r176]+12|0]|0)!=(HEAP[r176]|0)){HEAP[r187]=HEAP[r203+8|0];HEAP[r186]=HEAP[HEAP[r176]+12|0];do{if(HEAP[r187]>>>0>=HEAP[HEAP[r173]+16|0]>>>0){if((HEAP[HEAP[r187]+12|0]|0)!=(HEAP[r176]|0)){r214=0;break}r214=(HEAP[HEAP[r186]+8|0]|0)==(HEAP[r176]|0)}else{r214=0}}while(0);if((r214&1|0)!=0){HEAP[HEAP[r187]+12|0]=HEAP[r186];HEAP[HEAP[r186]+8|0]=HEAP[r187];break}else{_abort()}}else{r209=r203+20|0;HEAP[r188]=r209;r210=HEAP[r209];HEAP[r186]=r210;do{if((r210|0)==0){r209=HEAP[r176]+16|0;HEAP[r188]=r209;r201=HEAP[r209];HEAP[r186]=r201;if((r201|0)!=0){break}else{break L61}}}while(0);while(1){r210=HEAP[r186]+20|0;HEAP[r189]=r210;if((HEAP[r210]|0)==0){r210=HEAP[r186]+16|0;HEAP[r189]=r210;if((HEAP[r210]|0)==0){break}}r210=HEAP[r189];HEAP[r188]=r210;HEAP[r186]=HEAP[r210]}if((HEAP[r188]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r188]]=0;break}else{_abort()}}}while(0);do{if((HEAP[r185]|0)!=0){HEAP[r190]=(HEAP[HEAP[r176]+28|0]<<2)+HEAP[r173]+304|0;do{if((HEAP[r176]|0)==(HEAP[HEAP[r190]]|0)){r203=HEAP[r186];HEAP[HEAP[r190]]=r203;if((r203|0)!=0){break}r203=HEAP[r173]+4|0;HEAP[r203]=HEAP[r203]&(1<<HEAP[HEAP[r176]+28|0]^-1)}else{if((HEAP[r185]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)==0){_abort()}r203=HEAP[r186];r210=HEAP[r185]+16|0;if((HEAP[HEAP[r185]+16|0]|0)==(HEAP[r176]|0)){HEAP[r210|0]=r203;break}else{HEAP[r210+4|0]=r203;break}}}while(0);if((HEAP[r186]|0)==0){break}if((HEAP[r186]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)==0){_abort()}HEAP[HEAP[r186]+24|0]=HEAP[r185];r203=HEAP[HEAP[r176]+16|0];HEAP[r191]=r203;do{if((r203|0)!=0){if((HEAP[r191]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r186]+16|0]=HEAP[r191];HEAP[HEAP[r191]+24|0]=HEAP[r186];break}else{_abort()}}}while(0);r203=HEAP[HEAP[r176]+20|0];HEAP[r192]=r203;if((r203|0)==0){break}if((HEAP[r192]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r186]+20|0]=HEAP[r192];HEAP[HEAP[r192]+24|0]=HEAP[r186];break}else{_abort()}}}while(0);if(HEAP[r177]>>>0<16){HEAP[HEAP[r176]+4|0]=HEAP[r174]+HEAP[r177]|3;r203=HEAP[r176]+HEAP[r174]+HEAP[r177]+4|0;HEAP[r203]=HEAP[r203]|1}else{HEAP[HEAP[r176]+4|0]=HEAP[r174]|3;HEAP[HEAP[r184]+4|0]=HEAP[r177]|1;HEAP[HEAP[r184]+HEAP[r177]|0]=HEAP[r177];HEAP[r193]=HEAP[HEAP[r173]+8|0];if((HEAP[r193]|0)!=0){HEAP[r194]=HEAP[HEAP[r173]+20|0];HEAP[r195]=HEAP[r193]>>>3;HEAP[r196]=(HEAP[r195]<<3)+HEAP[r173]+40|0;HEAP[r197]=HEAP[r196];do{if((1<<HEAP[r195]&HEAP[HEAP[r173]|0]|0)!=0){if((HEAP[HEAP[r196]+8|0]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)!=0){HEAP[r197]=HEAP[HEAP[r196]+8|0];break}else{_abort()}}else{r203=HEAP[r173]|0;HEAP[r203]=HEAP[r203]|1<<HEAP[r195]}}while(0);HEAP[HEAP[r196]+8|0]=HEAP[r194];HEAP[HEAP[r197]+12|0]=HEAP[r194];HEAP[HEAP[r194]+8|0]=HEAP[r197];HEAP[HEAP[r194]+12|0]=HEAP[r196]}HEAP[HEAP[r173]+8|0]=HEAP[r177];HEAP[HEAP[r173]+20|0]=HEAP[r184]}r203=HEAP[r176]+8|0;r207=r203;if((r203|0)==0){break}r208=r207;STACKTOP=r3;return r208}else{if(r1>>>0>=4294967232){r200=-1;break}r200=r198+11&-8;if((HEAP[67324]|0)==0){break}HEAP[r129]=67320;HEAP[r130]=r200;HEAP[r131]=0;HEAP[r132]=-HEAP[r130]|0;HEAP[r135]=HEAP[r130]>>>8;do{if((HEAP[r135]|0)==0){HEAP[r134]=0}else{if(HEAP[r135]>>>0>65535){HEAP[r134]=31;break}else{HEAP[r136]=HEAP[r135];HEAP[r137]=(HEAP[r136]-256|0)>>>16&8;r203=HEAP[r136]<<HEAP[r137];HEAP[r136]=r203;HEAP[r138]=(r203-4096|0)>>>16&4;HEAP[r137]=HEAP[r137]+HEAP[r138]|0;r203=HEAP[r136]<<HEAP[r138];HEAP[r136]=r203;r210=(r203-16384|0)>>>16&2;HEAP[r138]=r210;HEAP[r137]=r210+HEAP[r137]|0;r210=-HEAP[r137]+14|0;r203=HEAP[r136]<<HEAP[r138];HEAP[r136]=r203;HEAP[r138]=r210+(r203>>>15)|0;HEAP[r134]=(HEAP[r138]<<1)+(HEAP[r130]>>>((HEAP[r138]+7|0)>>>0)&1)|0;break}}}while(0);r203=HEAP[(HEAP[r134]<<2)+HEAP[r129]+304|0];HEAP[r133]=r203;do{if((r203|0)!=0){if((HEAP[r134]|0)==31){r215=0}else{r215=-(HEAP[r134]>>>1)+25|0}HEAP[r139]=HEAP[r130]<<r215;HEAP[r140]=0;while(1){HEAP[r142]=(HEAP[HEAP[r133]+4|0]&-8)-HEAP[r130]|0;if(HEAP[r142]>>>0<HEAP[r132]>>>0){r210=HEAP[r133];HEAP[r131]=r210;r201=HEAP[r142];HEAP[r132]=r201;if((r201|0)==0){r216=r210;break}}HEAP[r141]=HEAP[HEAP[r133]+20|0];r210=HEAP[((HEAP[r139]>>>31&1)<<2)+HEAP[r133]+16|0];HEAP[r133]=r210;do{if((HEAP[r141]|0)!=0){r201=HEAP[r133];if((HEAP[r141]|0)==(r201|0)){r217=r201;break}HEAP[r140]=HEAP[r141];r217=HEAP[r133]}else{r217=r210}}while(0);if((r217|0)==0){r2=105;break}HEAP[r139]=HEAP[r139]<<1}if(r2==105){r210=HEAP[r140];HEAP[r133]=r210;r216=r210}if((r216|0)==0){r2=108;break}else{r2=111;break}}else{r2=108}}while(0);do{if(r2==108){if((HEAP[r131]|0)!=0){r2=111;break}HEAP[r143]=(-(1<<HEAP[r134]<<1)|1<<HEAP[r134]<<1)&HEAP[HEAP[r129]+4|0];if((HEAP[r143]|0)==0){r2=111;break}HEAP[r145]=-HEAP[r143]&HEAP[r143];HEAP[r146]=HEAP[r145]-1|0;HEAP[r147]=HEAP[r146]>>>12&16;HEAP[r148]=HEAP[r147];HEAP[r146]=HEAP[r146]>>>(HEAP[r147]>>>0);r203=HEAP[r146]>>>5&8;HEAP[r147]=r203;HEAP[r148]=r203+HEAP[r148]|0;HEAP[r146]=HEAP[r146]>>>(HEAP[r147]>>>0);r203=HEAP[r146]>>>2&4;HEAP[r147]=r203;HEAP[r148]=r203+HEAP[r148]|0;HEAP[r146]=HEAP[r146]>>>(HEAP[r147]>>>0);r203=HEAP[r146]>>>1&2;HEAP[r147]=r203;HEAP[r148]=r203+HEAP[r148]|0;HEAP[r146]=HEAP[r146]>>>(HEAP[r147]>>>0);r203=HEAP[r146]>>>1&1;HEAP[r147]=r203;HEAP[r148]=r203+HEAP[r148]|0;HEAP[r146]=HEAP[r146]>>>(HEAP[r147]>>>0);HEAP[r144]=HEAP[r146]+HEAP[r148]|0;r203=HEAP[(HEAP[r144]<<2)+HEAP[r129]+304|0];HEAP[r133]=r203;r218=r203;break}}while(0);if(r2==111){r218=HEAP[r133]}L163:do{if((r218|0)!=0){while(1){HEAP[r149]=(HEAP[HEAP[r133]+4|0]&-8)-HEAP[r130]|0;if(HEAP[r149]>>>0<HEAP[r132]>>>0){HEAP[r132]=HEAP[r149];HEAP[r131]=HEAP[r133]}r203=HEAP[r133]+16|0;if((HEAP[HEAP[r133]+16|0]|0)!=0){r219=HEAP[r203|0]}else{r219=HEAP[r203+4|0]}HEAP[r133]=r219;if((r219|0)==0){break L163}}}}while(0);do{if((HEAP[r131]|0)!=0){if(HEAP[r132]>>>0>=(HEAP[HEAP[r129]+8|0]-HEAP[r130]|0)>>>0){r2=189;break}if((HEAP[r131]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)==0){_abort()}HEAP[r150]=HEAP[r131]+HEAP[r130]|0;if((HEAP[r131]>>>0<HEAP[r150]>>>0&1|0)==0){_abort()}HEAP[r151]=HEAP[HEAP[r131]+24|0];r203=HEAP[r131];L183:do{if((HEAP[HEAP[r131]+12|0]|0)!=(HEAP[r131]|0)){HEAP[r153]=HEAP[r203+8|0];HEAP[r152]=HEAP[HEAP[r131]+12|0];do{if(HEAP[r153]>>>0>=HEAP[HEAP[r129]+16|0]>>>0){if((HEAP[HEAP[r153]+12|0]|0)!=(HEAP[r131]|0)){r220=0;break}r220=(HEAP[HEAP[r152]+8|0]|0)==(HEAP[r131]|0)}else{r220=0}}while(0);if((r220&1|0)!=0){HEAP[HEAP[r153]+12|0]=HEAP[r152];HEAP[HEAP[r152]+8|0]=HEAP[r153];break}else{_abort()}}else{r210=r203+20|0;HEAP[r154]=r210;r201=HEAP[r210];HEAP[r152]=r201;do{if((r201|0)==0){r210=HEAP[r131]+16|0;HEAP[r154]=r210;r209=HEAP[r210];HEAP[r152]=r209;if((r209|0)!=0){break}else{break L183}}}while(0);while(1){r201=HEAP[r152]+20|0;HEAP[r155]=r201;if((HEAP[r201]|0)==0){r201=HEAP[r152]+16|0;HEAP[r155]=r201;if((HEAP[r201]|0)==0){break}}r201=HEAP[r155];HEAP[r154]=r201;HEAP[r152]=HEAP[r201]}if((HEAP[r154]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r154]]=0;break}else{_abort()}}}while(0);do{if((HEAP[r151]|0)!=0){HEAP[r156]=(HEAP[HEAP[r131]+28|0]<<2)+HEAP[r129]+304|0;do{if((HEAP[r131]|0)==(HEAP[HEAP[r156]]|0)){r203=HEAP[r152];HEAP[HEAP[r156]]=r203;if((r203|0)!=0){break}r203=HEAP[r129]+4|0;HEAP[r203]=HEAP[r203]&(1<<HEAP[HEAP[r131]+28|0]^-1)}else{if((HEAP[r151]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)==0){_abort()}r203=HEAP[r152];r201=HEAP[r151]+16|0;if((HEAP[HEAP[r151]+16|0]|0)==(HEAP[r131]|0)){HEAP[r201|0]=r203;break}else{HEAP[r201+4|0]=r203;break}}}while(0);if((HEAP[r152]|0)==0){break}if((HEAP[r152]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)==0){_abort()}HEAP[HEAP[r152]+24|0]=HEAP[r151];r203=HEAP[HEAP[r131]+16|0];HEAP[r157]=r203;do{if((r203|0)!=0){if((HEAP[r157]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r152]+16|0]=HEAP[r157];HEAP[HEAP[r157]+24|0]=HEAP[r152];break}else{_abort()}}}while(0);r203=HEAP[HEAP[r131]+20|0];HEAP[r158]=r203;if((r203|0)==0){break}if((HEAP[r158]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r152]+20|0]=HEAP[r158];HEAP[HEAP[r158]+24|0]=HEAP[r152];break}else{_abort()}}}while(0);L233:do{if(HEAP[r132]>>>0<16){HEAP[HEAP[r131]+4|0]=HEAP[r130]+HEAP[r132]|3;r203=HEAP[r131]+HEAP[r130]+HEAP[r132]+4|0;HEAP[r203]=HEAP[r203]|1}else{HEAP[HEAP[r131]+4|0]=HEAP[r130]|3;HEAP[HEAP[r150]+4|0]=HEAP[r132]|1;HEAP[HEAP[r150]+HEAP[r132]|0]=HEAP[r132];if(HEAP[r132]>>>3>>>0<32){HEAP[r159]=HEAP[r132]>>>3;HEAP[r160]=(HEAP[r159]<<3)+HEAP[r129]+40|0;HEAP[r161]=HEAP[r160];do{if((1<<HEAP[r159]&HEAP[HEAP[r129]|0]|0)!=0){if((HEAP[HEAP[r160]+8|0]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)!=0){HEAP[r161]=HEAP[HEAP[r160]+8|0];break}else{_abort()}}else{r203=HEAP[r129]|0;HEAP[r203]=HEAP[r203]|1<<HEAP[r159]}}while(0);HEAP[HEAP[r160]+8|0]=HEAP[r150];HEAP[HEAP[r161]+12|0]=HEAP[r150];HEAP[HEAP[r150]+8|0]=HEAP[r161];HEAP[HEAP[r150]+12|0]=HEAP[r160];break}HEAP[r162]=HEAP[r150];HEAP[r165]=HEAP[r132]>>>8;do{if((HEAP[r165]|0)==0){HEAP[r164]=0}else{if(HEAP[r165]>>>0>65535){HEAP[r164]=31;break}else{HEAP[r166]=HEAP[r165];HEAP[r167]=(HEAP[r166]-256|0)>>>16&8;r203=HEAP[r166]<<HEAP[r167];HEAP[r166]=r203;HEAP[r168]=(r203-4096|0)>>>16&4;HEAP[r167]=HEAP[r167]+HEAP[r168]|0;r203=HEAP[r166]<<HEAP[r168];HEAP[r166]=r203;r201=(r203-16384|0)>>>16&2;HEAP[r168]=r201;HEAP[r167]=r201+HEAP[r167]|0;r201=-HEAP[r167]+14|0;r203=HEAP[r166]<<HEAP[r168];HEAP[r166]=r203;HEAP[r168]=r201+(r203>>>15)|0;HEAP[r164]=(HEAP[r168]<<1)+(HEAP[r132]>>>((HEAP[r168]+7|0)>>>0)&1)|0;break}}}while(0);HEAP[r163]=(HEAP[r164]<<2)+HEAP[r129]+304|0;HEAP[HEAP[r162]+28|0]=HEAP[r164];HEAP[HEAP[r162]+20|0]=0;HEAP[HEAP[r162]+16|0]=0;if((1<<HEAP[r164]&HEAP[HEAP[r129]+4|0]|0)==0){r203=HEAP[r129]+4|0;HEAP[r203]=HEAP[r203]|1<<HEAP[r164];HEAP[HEAP[r163]]=HEAP[r162];HEAP[HEAP[r162]+24|0]=HEAP[r163];r203=HEAP[r162];HEAP[HEAP[r162]+12|0]=r203;HEAP[HEAP[r162]+8|0]=r203;break}HEAP[r169]=HEAP[HEAP[r163]];if((HEAP[r164]|0)==31){r221=0}else{r221=-(HEAP[r164]>>>1)+25|0}HEAP[r170]=HEAP[r132]<<r221;L259:do{if((HEAP[HEAP[r169]+4|0]&-8|0)!=(HEAP[r132]|0)){while(1){HEAP[r171]=((HEAP[r170]>>>31&1)<<2)+HEAP[r169]+16|0;HEAP[r170]=HEAP[r170]<<1;r222=HEAP[r171];if((HEAP[HEAP[r171]]|0)==0){break}HEAP[r169]=HEAP[r222];if((HEAP[HEAP[r169]+4|0]&-8|0)==(HEAP[r132]|0)){break L259}}if((r222>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r171]]=HEAP[r162];HEAP[HEAP[r162]+24|0]=HEAP[r169];r203=HEAP[r162];HEAP[HEAP[r162]+12|0]=r203;HEAP[HEAP[r162]+8|0]=r203;break L233}else{_abort()}}}while(0);HEAP[r172]=HEAP[HEAP[r169]+8|0];if(HEAP[r169]>>>0>=HEAP[HEAP[r129]+16|0]>>>0){r223=HEAP[r172]>>>0>=HEAP[HEAP[r129]+16|0]>>>0}else{r223=0}if((r223&1|0)!=0){r203=HEAP[r162];HEAP[HEAP[r172]+12|0]=r203;HEAP[HEAP[r169]+8|0]=r203;HEAP[HEAP[r162]+8|0]=HEAP[r172];HEAP[HEAP[r162]+12|0]=HEAP[r169];HEAP[HEAP[r162]+24|0]=0;break}else{_abort()}}}while(0);r203=HEAP[r131]+8|0;HEAP[r128]=r203;r224=r203;break}else{r2=189}}while(0);if(r2==189){HEAP[r128]=0;r224=0}r207=r224;if((r224|0)==0){break}r208=r207;STACKTOP=r3;return r208}}while(0);if(r200>>>0<=HEAP[67328]>>>0){r224=HEAP[67328]-r200|0;r128=HEAP[67340];if(r224>>>0>=16){r131=r128+r200|0;HEAP[67340]=r131;r162=r131;HEAP[67328]=r224;HEAP[r162+4|0]=r224|1;HEAP[r162+r224|0]=r224;HEAP[r128+4|0]=r200|3}else{r224=HEAP[67328];HEAP[67328]=0;HEAP[67340]=0;HEAP[r128+4|0]=r224|3;r162=r224+(r128+4)|0;HEAP[r162]=HEAP[r162]|1}r207=r128+8|0;r208=r207;STACKTOP=r3;return r208}r128=r200;if(r200>>>0<HEAP[67332]>>>0){r162=HEAP[67332]-r128|0;HEAP[67332]=r162;r224=HEAP[67344];r131=r224+r200|0;HEAP[67344]=r131;HEAP[r131+4|0]=r162|1;HEAP[r224+4|0]=r200|3;r207=r224+8|0;r208=r207;STACKTOP=r3;return r208}HEAP[r105]=67320;HEAP[r106]=r128;HEAP[r107]=-1;HEAP[r108]=0;HEAP[r109]=0;if((HEAP[65800]|0)==0){_init_mparams()}HEAP[r110]=(HEAP[65808]-1^-1)&HEAP[r106]+HEAP[65808]+47;L295:do{if(HEAP[r110]>>>0<=HEAP[r106]>>>0){HEAP[r104]=0}else{do{if((HEAP[HEAP[r105]+440|0]|0)!=0){HEAP[r111]=HEAP[r110]+HEAP[HEAP[r105]+432|0]|0;if(!(HEAP[r111]>>>0<=HEAP[HEAP[r105]+432|0]>>>0)){if(HEAP[r111]>>>0<=HEAP[HEAP[r105]+440|0]>>>0){break}}HEAP[r104]=0;break L295}}while(0);L304:do{if((HEAP[HEAP[r105]+444|0]&4|0)!=0){r2=240}else{HEAP[r112]=-1;HEAP[r113]=HEAP[r110];do{if((HEAP[HEAP[r105]+24|0]|0)==0){HEAP[r114]=0;r2=216;break}else{r128=HEAP[HEAP[r105]+24|0];HEAP[r101]=HEAP[r105];HEAP[r102]=r128;HEAP[r103]=HEAP[r101]+448|0;while(1){if(HEAP[r102]>>>0>=HEAP[HEAP[r103]|0]>>>0){if(HEAP[r102]>>>0<(HEAP[HEAP[r103]|0]+HEAP[HEAP[r103]+4|0]|0)>>>0){r2=212;break}}r128=HEAP[HEAP[r103]+8|0];HEAP[r103]=r128;if((r128|0)==0){r2=214;break}}if(r2==212){r128=HEAP[r103];HEAP[r100]=r128;r225=r128}else if(r2==214){HEAP[r100]=0;r225=0}HEAP[r114]=r225;if((r225|0)==0){r2=216;break}HEAP[r113]=(HEAP[65808]-1^-1)&HEAP[r106]+ -HEAP[HEAP[r105]+12|0]+HEAP[65808]+47;if(HEAP[r113]>>>0>=2147483647){r2=228;break}r128=_sbrk(HEAP[r113]);HEAP[r112]=r128;if((r128|0)!=(HEAP[HEAP[r114]|0]+HEAP[HEAP[r114]+4|0]|0)){r2=228;break}r128=HEAP[r112];HEAP[r107]=r128;HEAP[r108]=HEAP[r113];r226=r128;break}}while(0);do{if(r2==216){r128=_sbrk(0);HEAP[r115]=r128;if((r128|0)==-1){r2=228;break}if((HEAP[65804]-1&HEAP[r115]|0)!=0){HEAP[r113]=(HEAP[65804]-1+HEAP[r115]&(HEAP[65804]-1^-1))+ -HEAP[r115]+HEAP[r113]|0}HEAP[r116]=HEAP[r113]+HEAP[HEAP[r105]+432|0]|0;if(!(HEAP[r113]>>>0>HEAP[r106]>>>0&HEAP[r113]>>>0<2147483647)){r2=228;break}if((HEAP[HEAP[r105]+440|0]|0)!=0){if(HEAP[r116]>>>0<=HEAP[HEAP[r105]+432|0]>>>0){r2=228;break}if(!(HEAP[r116]>>>0<=HEAP[HEAP[r105]+440|0]>>>0)){r2=228;break}}r128=_sbrk(HEAP[r113]);HEAP[r112]=r128;if((r128|0)!=(HEAP[r115]|0)){r2=228;break}r128=HEAP[r115];HEAP[r107]=r128;HEAP[r108]=HEAP[r113];r226=r128;break}}while(0);if(r2==228){r226=HEAP[r107]}if((r226|0)!=-1){r2=240;break}L337:do{if((HEAP[r112]|0)!=-1){do{if(HEAP[r113]>>>0<2147483647){if(HEAP[r113]>>>0>=(HEAP[r106]+48|0)>>>0){break}HEAP[r117]=(HEAP[65808]-1^-1)&HEAP[r106]+ -HEAP[r113]+HEAP[65808]+47;if(HEAP[r117]>>>0>=2147483647){break}r128=_sbrk(HEAP[r117]);HEAP[r118]=r128;if((HEAP[r118]|0)!=-1){HEAP[r113]=HEAP[r113]+HEAP[r117]|0;break}else{_sbrk(-HEAP[r113]|0);HEAP[r112]=-1;break L337}}}while(0);if((HEAP[r112]|0)==-1){break}r128=HEAP[r112];HEAP[r107]=r128;HEAP[r108]=HEAP[r113];r227=r128;break L304}}while(0);r128=HEAP[r105]+444|0;HEAP[r128]=HEAP[r128]|4;r2=240;break}}while(0);if(r2==240){r227=HEAP[r107]}do{if((r227|0)==-1){if(HEAP[r110]>>>0>=2147483647){r2=248;break}HEAP[r119]=-1;HEAP[r120]=-1;r128=_sbrk(HEAP[r110]);HEAP[r119]=r128;r128=_sbrk(0);HEAP[r120]=r128;if((HEAP[r119]|0)==-1){r2=248;break}if((HEAP[r120]|0)==-1){r2=248;break}if(HEAP[r119]>>>0>=HEAP[r120]>>>0){r2=248;break}HEAP[r121]=HEAP[r120]-HEAP[r119]|0;if(HEAP[r121]>>>0<=(HEAP[r106]+40|0)>>>0){r2=248;break}r128=HEAP[r119];HEAP[r107]=r128;HEAP[r108]=HEAP[r121];r228=r128;break}else{r2=248}}while(0);if(r2==248){r228=HEAP[r107]}do{if((r228|0)!=-1){r128=HEAP[r105]+432|0;r224=HEAP[r128]+HEAP[r108]|0;HEAP[r128]=r224;if(r224>>>0>HEAP[HEAP[r105]+436|0]>>>0){HEAP[HEAP[r105]+436|0]=HEAP[HEAP[r105]+432|0]}r224=HEAP[r105];L367:do{if((HEAP[HEAP[r105]+24|0]|0)!=0){r128=r224+448|0;HEAP[r123]=r128;L387:do{if((r128|0)!=0){while(1){r200=HEAP[r123];if((HEAP[r107]|0)==(HEAP[HEAP[r123]|0]+HEAP[HEAP[r123]+4|0]|0)){r229=r200;break L387}r162=HEAP[r200+8|0];HEAP[r123]=r162;if((r162|0)==0){r2=266;break L387}}}else{r2=266}}while(0);if(r2==266){r229=HEAP[r123]}do{if((r229|0)!=0){if((HEAP[HEAP[r123]+12|0]&8|0)!=0){break}if(0!=(HEAP[r109]|0)){break}if(!(HEAP[HEAP[r105]+24|0]>>>0>=HEAP[HEAP[r123]|0]>>>0)){break}if(HEAP[HEAP[r105]+24|0]>>>0>=(HEAP[HEAP[r123]|0]+HEAP[HEAP[r123]+4|0]|0)>>>0){break}r128=HEAP[r123]+4|0;HEAP[r128]=HEAP[r128]+HEAP[r108]|0;r128=HEAP[HEAP[r105]+24|0];r162=HEAP[r108]+HEAP[HEAP[r105]+12|0]|0;HEAP[r4]=HEAP[r105];HEAP[r5]=r128;HEAP[r6]=r162;if((HEAP[r5]+8&7|0)==0){r230=0}else{r230=8-(HEAP[r5]+8&7)&7}HEAP[r7]=r230;HEAP[r5]=HEAP[r5]+HEAP[r7]|0;HEAP[r6]=HEAP[r6]-HEAP[r7]|0;HEAP[HEAP[r4]+24|0]=HEAP[r5];HEAP[HEAP[r4]+12|0]=HEAP[r6];HEAP[HEAP[r5]+4|0]=HEAP[r6]|1;HEAP[HEAP[r5]+HEAP[r6]+4|0]=40;HEAP[HEAP[r4]+28|0]=HEAP[65816];break L367}}while(0);if(HEAP[r107]>>>0<HEAP[HEAP[r105]+16|0]>>>0){HEAP[HEAP[r105]+16|0]=HEAP[r107]}r162=HEAP[r105]+448|0;HEAP[r123]=r162;r128=HEAP[r123];L407:do{if((r162|0)!=0){r200=r128;while(1){r131=HEAP[r123];if((HEAP[r200|0]|0)==(HEAP[r107]+HEAP[r108]|0)){r231=r131;break L407}r169=HEAP[r131+8|0];HEAP[r123]=r169;r131=HEAP[r123];if((r169|0)!=0){r200=r131}else{r231=r131;break L407}}}else{r231=r128}}while(0);do{if((r231|0)!=0){if((HEAP[HEAP[r123]+12|0]&8|0)!=0){break}if(0!=(HEAP[r109]|0)){break}HEAP[r124]=HEAP[HEAP[r123]|0];HEAP[HEAP[r123]|0]=HEAP[r107];r128=HEAP[r123]+4|0;HEAP[r128]=HEAP[r128]+HEAP[r108]|0;r128=HEAP[r107];r162=HEAP[r124];r200=HEAP[r106];HEAP[r8]=HEAP[r105];HEAP[r9]=r128;HEAP[r10]=r162;HEAP[r11]=r200;if((HEAP[r9]+8&7|0)==0){r232=0}else{r232=8-(HEAP[r9]+8&7)&7}HEAP[r12]=HEAP[r9]+r232|0;if((HEAP[r10]+8&7|0)==0){r233=0}else{r233=8-(HEAP[r10]+8&7)&7}HEAP[r13]=HEAP[r10]+r233|0;HEAP[r14]=HEAP[r13]-HEAP[r12]|0;HEAP[r15]=HEAP[r12]+HEAP[r11]|0;HEAP[r16]=HEAP[r14]-HEAP[r11]|0;HEAP[HEAP[r12]+4|0]=HEAP[r11]|3;L422:do{if((HEAP[r13]|0)==(HEAP[HEAP[r8]+24|0]|0)){r200=HEAP[r8]+12|0;r162=HEAP[r200]+HEAP[r16]|0;HEAP[r200]=r162;HEAP[r17]=r162;HEAP[HEAP[r8]+24|0]=HEAP[r15];HEAP[HEAP[r15]+4|0]=HEAP[r17]|1}else{if((HEAP[r13]|0)==(HEAP[HEAP[r8]+20|0]|0)){r162=HEAP[r8]+8|0;r200=HEAP[r162]+HEAP[r16]|0;HEAP[r162]=r200;HEAP[r18]=r200;HEAP[HEAP[r8]+20|0]=HEAP[r15];HEAP[HEAP[r15]+4|0]=HEAP[r18]|1;HEAP[HEAP[r15]+HEAP[r18]|0]=HEAP[r18];break}if((HEAP[HEAP[r13]+4|0]&3|0)==1){HEAP[r19]=HEAP[HEAP[r13]+4|0]&-8;r200=HEAP[r13];do{if(HEAP[r19]>>>3>>>0<32){HEAP[r20]=HEAP[r200+8|0];HEAP[r21]=HEAP[HEAP[r13]+12|0];HEAP[r22]=HEAP[r19]>>>3;do{if((HEAP[r20]|0)==((HEAP[r22]<<3)+HEAP[r8]+40|0)){r234=1}else{if(!(HEAP[r20]>>>0>=HEAP[HEAP[r8]+16|0]>>>0)){r234=0;break}r234=(HEAP[HEAP[r20]+12|0]|0)==(HEAP[r13]|0)}}while(0);if((r234&1|0)==0){_abort()}if((HEAP[r21]|0)==(HEAP[r20]|0)){r162=HEAP[r8]|0;HEAP[r162]=HEAP[r162]&(1<<HEAP[r22]^-1);break}do{if((HEAP[r21]|0)==((HEAP[r22]<<3)+HEAP[r8]+40|0)){r235=1}else{if(!(HEAP[r21]>>>0>=HEAP[HEAP[r8]+16|0]>>>0)){r235=0;break}r235=(HEAP[HEAP[r21]+8|0]|0)==(HEAP[r13]|0)}}while(0);if((r235&1|0)!=0){HEAP[HEAP[r20]+12|0]=HEAP[r21];HEAP[HEAP[r21]+8|0]=HEAP[r20];break}else{_abort()}}else{HEAP[r23]=r200;HEAP[r24]=HEAP[HEAP[r23]+24|0];r162=HEAP[r23];L450:do{if((HEAP[HEAP[r23]+12|0]|0)!=(HEAP[r23]|0)){HEAP[r26]=HEAP[r162+8|0];HEAP[r25]=HEAP[HEAP[r23]+12|0];do{if(HEAP[r26]>>>0>=HEAP[HEAP[r8]+16|0]>>>0){if((HEAP[HEAP[r26]+12|0]|0)!=(HEAP[r23]|0)){r236=0;break}r236=(HEAP[HEAP[r25]+8|0]|0)==(HEAP[r23]|0)}else{r236=0}}while(0);if((r236&1|0)!=0){HEAP[HEAP[r26]+12|0]=HEAP[r25];HEAP[HEAP[r25]+8|0]=HEAP[r26];break}else{_abort()}}else{r128=r162+20|0;HEAP[r27]=r128;r131=HEAP[r128];HEAP[r25]=r131;do{if((r131|0)==0){r128=HEAP[r23]+16|0;HEAP[r27]=r128;r169=HEAP[r128];HEAP[r25]=r169;if((r169|0)!=0){break}else{break L450}}}while(0);while(1){r131=HEAP[r25]+20|0;HEAP[r28]=r131;if((HEAP[r131]|0)==0){r131=HEAP[r25]+16|0;HEAP[r28]=r131;if((HEAP[r131]|0)==0){break}}r131=HEAP[r28];HEAP[r27]=r131;HEAP[r25]=HEAP[r131]}if((HEAP[r27]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r27]]=0;break}else{_abort()}}}while(0);if((HEAP[r24]|0)==0){break}HEAP[r29]=(HEAP[HEAP[r23]+28|0]<<2)+HEAP[r8]+304|0;do{if((HEAP[r23]|0)==(HEAP[HEAP[r29]]|0)){r162=HEAP[r25];HEAP[HEAP[r29]]=r162;if((r162|0)!=0){break}r162=HEAP[r8]+4|0;HEAP[r162]=HEAP[r162]&(1<<HEAP[HEAP[r23]+28|0]^-1)}else{if((HEAP[r24]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)==0){_abort()}r162=HEAP[r25];r131=HEAP[r24]+16|0;if((HEAP[HEAP[r24]+16|0]|0)==(HEAP[r23]|0)){HEAP[r131|0]=r162;break}else{HEAP[r131+4|0]=r162;break}}}while(0);if((HEAP[r25]|0)==0){break}if((HEAP[r25]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)==0){_abort()}HEAP[HEAP[r25]+24|0]=HEAP[r24];r162=HEAP[HEAP[r23]+16|0];HEAP[r30]=r162;do{if((r162|0)!=0){if((HEAP[r30]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r25]+16|0]=HEAP[r30];HEAP[HEAP[r30]+24|0]=HEAP[r25];break}else{_abort()}}}while(0);r162=HEAP[HEAP[r23]+20|0];HEAP[r31]=r162;if((r162|0)==0){break}if((HEAP[r31]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r25]+20|0]=HEAP[r31];HEAP[HEAP[r31]+24|0]=HEAP[r25];break}else{_abort()}}}while(0);HEAP[r13]=HEAP[r13]+HEAP[r19]|0;HEAP[r16]=HEAP[r16]+HEAP[r19]|0}r200=HEAP[r13]+4|0;HEAP[r200]=HEAP[r200]&-2;HEAP[HEAP[r15]+4|0]=HEAP[r16]|1;HEAP[HEAP[r15]+HEAP[r16]|0]=HEAP[r16];if(HEAP[r16]>>>3>>>0<32){HEAP[r32]=HEAP[r16]>>>3;HEAP[r33]=(HEAP[r32]<<3)+HEAP[r8]+40|0;HEAP[r34]=HEAP[r33];do{if((1<<HEAP[r32]&HEAP[HEAP[r8]|0]|0)!=0){if((HEAP[HEAP[r33]+8|0]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)!=0){HEAP[r34]=HEAP[HEAP[r33]+8|0];break}else{_abort()}}else{r200=HEAP[r8]|0;HEAP[r200]=HEAP[r200]|1<<HEAP[r32]}}while(0);HEAP[HEAP[r33]+8|0]=HEAP[r15];HEAP[HEAP[r34]+12|0]=HEAP[r15];HEAP[HEAP[r15]+8|0]=HEAP[r34];HEAP[HEAP[r15]+12|0]=HEAP[r33];break}HEAP[r35]=HEAP[r15];HEAP[r38]=HEAP[r16]>>>8;do{if((HEAP[r38]|0)==0){HEAP[r37]=0}else{if(HEAP[r38]>>>0>65535){HEAP[r37]=31;break}else{HEAP[r39]=HEAP[r38];HEAP[r40]=(HEAP[r39]-256|0)>>>16&8;r200=HEAP[r39]<<HEAP[r40];HEAP[r39]=r200;HEAP[r41]=(r200-4096|0)>>>16&4;HEAP[r40]=HEAP[r40]+HEAP[r41]|0;r200=HEAP[r39]<<HEAP[r41];HEAP[r39]=r200;r162=(r200-16384|0)>>>16&2;HEAP[r41]=r162;HEAP[r40]=r162+HEAP[r40]|0;r162=-HEAP[r40]+14|0;r200=HEAP[r39]<<HEAP[r41];HEAP[r39]=r200;HEAP[r41]=r162+(r200>>>15)|0;HEAP[r37]=(HEAP[r41]<<1)+(HEAP[r16]>>>((HEAP[r41]+7|0)>>>0)&1)|0;break}}}while(0);HEAP[r36]=(HEAP[r37]<<2)+HEAP[r8]+304|0;HEAP[HEAP[r35]+28|0]=HEAP[r37];HEAP[HEAP[r35]+20|0]=0;HEAP[HEAP[r35]+16|0]=0;if((1<<HEAP[r37]&HEAP[HEAP[r8]+4|0]|0)==0){r200=HEAP[r8]+4|0;HEAP[r200]=HEAP[r200]|1<<HEAP[r37];HEAP[HEAP[r36]]=HEAP[r35];HEAP[HEAP[r35]+24|0]=HEAP[r36];r200=HEAP[r35];HEAP[HEAP[r35]+12|0]=r200;HEAP[HEAP[r35]+8|0]=r200;break}HEAP[r42]=HEAP[HEAP[r36]];if((HEAP[r37]|0)==31){r237=0}else{r237=-(HEAP[r37]>>>1)+25|0}HEAP[r43]=HEAP[r16]<<r237;L523:do{if((HEAP[HEAP[r42]+4|0]&-8|0)!=(HEAP[r16]|0)){while(1){HEAP[r44]=((HEAP[r43]>>>31&1)<<2)+HEAP[r42]+16|0;HEAP[r43]=HEAP[r43]<<1;r238=HEAP[r44];if((HEAP[HEAP[r44]]|0)==0){break}HEAP[r42]=HEAP[r238];if((HEAP[HEAP[r42]+4|0]&-8|0)==(HEAP[r16]|0)){break L523}}if((r238>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r44]]=HEAP[r35];HEAP[HEAP[r35]+24|0]=HEAP[r42];r200=HEAP[r35];HEAP[HEAP[r35]+12|0]=r200;HEAP[HEAP[r35]+8|0]=r200;break L422}else{_abort()}}}while(0);HEAP[r45]=HEAP[HEAP[r42]+8|0];if(HEAP[r42]>>>0>=HEAP[HEAP[r8]+16|0]>>>0){r239=HEAP[r45]>>>0>=HEAP[HEAP[r8]+16|0]>>>0}else{r239=0}if((r239&1|0)!=0){r200=HEAP[r35];HEAP[HEAP[r45]+12|0]=r200;HEAP[HEAP[r42]+8|0]=r200;HEAP[HEAP[r35]+8|0]=HEAP[r45];HEAP[HEAP[r35]+12|0]=HEAP[r42];HEAP[HEAP[r35]+24|0]=0;break}else{_abort()}}}while(0);HEAP[r104]=HEAP[r12]+8|0;break L295}}while(0);r200=HEAP[r107];r162=HEAP[r108];r131=HEAP[r109];HEAP[r65]=HEAP[r105];HEAP[r66]=r200;HEAP[r67]=r162;HEAP[r68]=r131;HEAP[r69]=HEAP[HEAP[r65]+24|0];r131=HEAP[r69];HEAP[r62]=HEAP[r65];HEAP[r63]=r131;HEAP[r64]=HEAP[r62]+448|0;while(1){if(HEAP[r63]>>>0>=HEAP[HEAP[r64]|0]>>>0){if(HEAP[r63]>>>0<(HEAP[HEAP[r64]|0]+HEAP[HEAP[r64]+4|0]|0)>>>0){r2=375;break}}r131=HEAP[HEAP[r64]+8|0];HEAP[r64]=r131;if((r131|0)==0){r2=377;break}}if(r2==375){HEAP[r61]=HEAP[r64]}else if(r2==377){HEAP[r61]=0}HEAP[r70]=HEAP[r61];HEAP[r71]=HEAP[HEAP[r70]|0]+HEAP[HEAP[r70]+4|0]|0;HEAP[r72]=24;HEAP[r73]=HEAP[r71]+ -(HEAP[r72]+23|0)|0;if((HEAP[r73]+8&7|0)==0){r240=0}else{r240=8-(HEAP[r73]+8&7)&7}HEAP[r74]=r240;HEAP[r75]=HEAP[r73]+HEAP[r74]|0;HEAP[r76]=HEAP[r75]>>>0<(HEAP[r69]+16|0)>>>0?HEAP[r69]:HEAP[r75];HEAP[r77]=HEAP[r76];HEAP[r78]=HEAP[r77]+8|0;HEAP[r79]=HEAP[r77]+HEAP[r72]|0;HEAP[r80]=HEAP[r79];HEAP[r81]=0;r131=HEAP[r66];r162=HEAP[r67]-40|0;HEAP[r57]=HEAP[r65];HEAP[r58]=r131;HEAP[r59]=r162;if((HEAP[r58]+8&7|0)==0){r241=0}else{r241=8-(HEAP[r58]+8&7)&7}HEAP[r60]=r241;HEAP[r58]=HEAP[r58]+HEAP[r60]|0;HEAP[r59]=HEAP[r59]-HEAP[r60]|0;HEAP[HEAP[r57]+24|0]=HEAP[r58];HEAP[HEAP[r57]+12|0]=HEAP[r59];HEAP[HEAP[r58]+4|0]=HEAP[r59]|1;HEAP[HEAP[r58]+HEAP[r59]+4|0]=40;HEAP[HEAP[r57]+28|0]=HEAP[65816];HEAP[HEAP[r77]+4|0]=HEAP[r72]|3;r162=HEAP[r78];r131=HEAP[r65]+448|0;for(r200=r131,r169=r162,r128=r200+16;r200<r128;r200++,r169++){HEAP[r169]=HEAP[r200]}HEAP[HEAP[r65]+448|0]=HEAP[r66];HEAP[HEAP[r65]+452|0]=HEAP[r67];HEAP[HEAP[r65]+460|0]=HEAP[r68];HEAP[HEAP[r65]+456|0]=HEAP[r78];HEAP[r82]=HEAP[r80]+4|0;HEAP[HEAP[r80]+4|0]=7;HEAP[r81]=HEAP[r81]+1|0;L555:do{if((HEAP[r82]+4|0)>>>0<HEAP[r71]>>>0){while(1){HEAP[r80]=HEAP[r82];HEAP[r82]=HEAP[r80]+4|0;HEAP[HEAP[r80]+4|0]=7;HEAP[r81]=HEAP[r81]+1|0;if((HEAP[r82]+4|0)>>>0>=HEAP[r71]>>>0){break L555}}}}while(0);L559:do{if((HEAP[r76]|0)!=(HEAP[r69]|0)){HEAP[r83]=HEAP[r69];HEAP[r84]=HEAP[r76]-HEAP[r69]|0;HEAP[r85]=HEAP[r83]+HEAP[r84]|0;r162=HEAP[r85]+4|0;HEAP[r162]=HEAP[r162]&-2;HEAP[HEAP[r83]+4|0]=HEAP[r84]|1;HEAP[HEAP[r83]+HEAP[r84]|0]=HEAP[r84];if(HEAP[r84]>>>3>>>0<32){HEAP[r86]=HEAP[r84]>>>3;HEAP[r87]=(HEAP[r86]<<3)+HEAP[r65]+40|0;HEAP[r88]=HEAP[r87];do{if((1<<HEAP[r86]&HEAP[HEAP[r65]|0]|0)!=0){if((HEAP[HEAP[r87]+8|0]>>>0>=HEAP[HEAP[r65]+16|0]>>>0&1|0)!=0){HEAP[r88]=HEAP[HEAP[r87]+8|0];break}else{_abort()}}else{r162=HEAP[r65]|0;HEAP[r162]=HEAP[r162]|1<<HEAP[r86]}}while(0);HEAP[HEAP[r87]+8|0]=HEAP[r83];HEAP[HEAP[r88]+12|0]=HEAP[r83];HEAP[HEAP[r83]+8|0]=HEAP[r88];HEAP[HEAP[r83]+12|0]=HEAP[r87];break}HEAP[r89]=HEAP[r83];HEAP[r92]=HEAP[r84]>>>8;do{if((HEAP[r92]|0)==0){HEAP[r91]=0}else{if(HEAP[r92]>>>0>65535){HEAP[r91]=31;break}else{HEAP[r93]=HEAP[r92];HEAP[r94]=(HEAP[r93]-256|0)>>>16&8;r162=HEAP[r93]<<HEAP[r94];HEAP[r93]=r162;HEAP[r95]=(r162-4096|0)>>>16&4;HEAP[r94]=HEAP[r94]+HEAP[r95]|0;r162=HEAP[r93]<<HEAP[r95];HEAP[r93]=r162;r131=(r162-16384|0)>>>16&2;HEAP[r95]=r131;HEAP[r94]=r131+HEAP[r94]|0;r131=-HEAP[r94]+14|0;r162=HEAP[r93]<<HEAP[r95];HEAP[r93]=r162;HEAP[r95]=r131+(r162>>>15)|0;HEAP[r91]=(HEAP[r95]<<1)+(HEAP[r84]>>>((HEAP[r95]+7|0)>>>0)&1)|0;break}}}while(0);HEAP[r90]=(HEAP[r91]<<2)+HEAP[r65]+304|0;HEAP[HEAP[r89]+28|0]=HEAP[r91];HEAP[HEAP[r89]+20|0]=0;HEAP[HEAP[r89]+16|0]=0;if((1<<HEAP[r91]&HEAP[HEAP[r65]+4|0]|0)==0){r162=HEAP[r65]+4|0;HEAP[r162]=HEAP[r162]|1<<HEAP[r91];HEAP[HEAP[r90]]=HEAP[r89];HEAP[HEAP[r89]+24|0]=HEAP[r90];r162=HEAP[r89];HEAP[HEAP[r89]+12|0]=r162;HEAP[HEAP[r89]+8|0]=r162;break}HEAP[r96]=HEAP[HEAP[r90]];if((HEAP[r91]|0)==31){r242=0}else{r242=-(HEAP[r91]>>>1)+25|0}HEAP[r97]=HEAP[r84]<<r242;L584:do{if((HEAP[HEAP[r96]+4|0]&-8|0)!=(HEAP[r84]|0)){while(1){HEAP[r98]=((HEAP[r97]>>>31&1)<<2)+HEAP[r96]+16|0;HEAP[r97]=HEAP[r97]<<1;r243=HEAP[r98];if((HEAP[HEAP[r98]]|0)==0){break}HEAP[r96]=HEAP[r243];if((HEAP[HEAP[r96]+4|0]&-8|0)==(HEAP[r84]|0)){break L584}}if((r243>>>0>=HEAP[HEAP[r65]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r98]]=HEAP[r89];HEAP[HEAP[r89]+24|0]=HEAP[r96];r162=HEAP[r89];HEAP[HEAP[r89]+12|0]=r162;HEAP[HEAP[r89]+8|0]=r162;break L559}else{_abort()}}}while(0);HEAP[r99]=HEAP[HEAP[r96]+8|0];if(HEAP[r96]>>>0>=HEAP[HEAP[r65]+16|0]>>>0){r244=HEAP[r99]>>>0>=HEAP[HEAP[r65]+16|0]>>>0}else{r244=0}if((r244&1|0)!=0){r162=HEAP[r89];HEAP[HEAP[r99]+12|0]=r162;HEAP[HEAP[r96]+8|0]=r162;HEAP[HEAP[r89]+8|0]=HEAP[r99];HEAP[HEAP[r89]+12|0]=HEAP[r96];HEAP[HEAP[r89]+24|0]=0;break}else{_abort()}}}while(0)}else{do{if((HEAP[r224+16|0]|0)==0){r2=255}else{if(HEAP[r107]>>>0<HEAP[HEAP[r105]+16|0]>>>0){r2=255;break}else{break}}}while(0);if(r2==255){HEAP[HEAP[r105]+16|0]=HEAP[r107]}HEAP[HEAP[r105]+448|0]=HEAP[r107];HEAP[HEAP[r105]+452|0]=HEAP[r108];HEAP[HEAP[r105]+460|0]=HEAP[r109];HEAP[HEAP[r105]+36|0]=HEAP[65800];HEAP[HEAP[r105]+32|0]=-1;HEAP[r54]=HEAP[r105];HEAP[r55]=0;while(1){HEAP[r56]=(HEAP[r55]<<3)+HEAP[r54]+40|0;r162=HEAP[r56];HEAP[HEAP[r56]+12|0]=r162;HEAP[HEAP[r56]+8|0]=r162;r162=HEAP[r55]+1|0;HEAP[r55]=r162;if(r162>>>0>=32){break}}r162=HEAP[r105];if((HEAP[r105]|0)==67320){r131=HEAP[r107];r200=HEAP[r108]-40|0;HEAP[r50]=r162;HEAP[r51]=r131;HEAP[r52]=r200;if((HEAP[r51]+8&7|0)==0){r245=0}else{r245=8-(HEAP[r51]+8&7)&7}HEAP[r53]=r245;HEAP[r51]=HEAP[r51]+HEAP[r53]|0;HEAP[r52]=HEAP[r52]-HEAP[r53]|0;HEAP[HEAP[r50]+24|0]=HEAP[r51];HEAP[HEAP[r50]+12|0]=HEAP[r52];HEAP[HEAP[r51]+4|0]=HEAP[r52]|1;HEAP[HEAP[r51]+HEAP[r52]+4|0]=40;HEAP[HEAP[r50]+28|0]=HEAP[65816];break}else{HEAP[r122]=r162-8+(HEAP[HEAP[r105]-8+4|0]&-8)|0;r162=HEAP[r122];r200=HEAP[r107]+HEAP[r108]-40+ -HEAP[r122]|0;HEAP[r46]=HEAP[r105];HEAP[r47]=r162;HEAP[r48]=r200;if((HEAP[r47]+8&7|0)==0){r246=0}else{r246=8-(HEAP[r47]+8&7)&7}HEAP[r49]=r246;HEAP[r47]=HEAP[r47]+HEAP[r49]|0;HEAP[r48]=HEAP[r48]-HEAP[r49]|0;HEAP[HEAP[r46]+24|0]=HEAP[r47];HEAP[HEAP[r46]+12|0]=HEAP[r48];HEAP[HEAP[r47]+4|0]=HEAP[r48]|1;HEAP[HEAP[r47]+HEAP[r48]+4|0]=40;HEAP[HEAP[r46]+28|0]=HEAP[65816];break}}}while(0);if(HEAP[r106]>>>0>=HEAP[HEAP[r105]+12|0]>>>0){break}r224=HEAP[r105]+12|0;r200=HEAP[r224]-HEAP[r106]|0;HEAP[r224]=r200;HEAP[r125]=r200;HEAP[r126]=HEAP[HEAP[r105]+24|0];r200=HEAP[r126]+HEAP[r106]|0;HEAP[HEAP[r105]+24|0]=r200;HEAP[r127]=r200;HEAP[HEAP[r127]+4|0]=HEAP[r125]|1;HEAP[HEAP[r126]+4|0]=HEAP[r106]|3;HEAP[r104]=HEAP[r126]+8|0;break L295}}while(0);r200=___errno_location();HEAP[r200]=12;HEAP[r104]=0}}while(0);r207=HEAP[r104];r208=r207;STACKTOP=r3;return r208}function _free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+100|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r1;if((r29|0)==0){STACKTOP=r3;return}r1=r29-8|0;if(r1>>>0>=HEAP[67336]>>>0){r30=(HEAP[r1+4|0]&3|0)!=1}else{r30=0}if((r30&1|0)==0){_abort()}r30=HEAP[r1+4|0]&-8;r29=r1+r30|0;do{if((HEAP[r1+4|0]&1|0)==0){r31=HEAP[r1|0];if((HEAP[r1+4|0]&3|0)==0){r30=r30+(r31+16)|0;STACKTOP=r3;return}r32=r1+ -r31|0;r30=r30+r31|0;r1=r32;if((r32>>>0>=HEAP[67336]>>>0&1|0)==0){_abort()}if((r1|0)==(HEAP[67340]|0)){if((HEAP[r29+4|0]&3|0)!=3){break}HEAP[67328]=r30;r32=r29+4|0;HEAP[r32]=HEAP[r32]&-2;HEAP[r1+4|0]=r30|1;HEAP[r1+r30|0]=r30;STACKTOP=r3;return}r32=r1;if(r31>>>3>>>0<32){r33=HEAP[r32+8|0];r34=HEAP[r1+12|0];r35=r31>>>3;do{if((r33|0)==((r35<<3)+67360|0)){r36=1}else{if(!(r33>>>0>=HEAP[67336]>>>0)){r36=0;break}r36=(HEAP[r33+12|0]|0)==(r1|0)}}while(0);if((r36&1|0)==0){_abort()}if((r34|0)==(r33|0)){HEAP[67320]=HEAP[67320]&(1<<r35^-1);break}do{if((r34|0)==((r35<<3)+67360|0)){r37=1}else{if(!(r34>>>0>=HEAP[67336]>>>0)){r37=0;break}r37=(HEAP[r34+8|0]|0)==(r1|0)}}while(0);if((r37&1|0)!=0){HEAP[r33+12|0]=r34;HEAP[r34+8|0]=r33;break}else{_abort()}}r35=r32;r31=HEAP[r35+24|0];r38=r35;L649:do{if((HEAP[r35+12|0]|0)!=(r35|0)){r39=HEAP[r38+8|0];r40=HEAP[r35+12|0];do{if(r39>>>0>=HEAP[67336]>>>0){if((HEAP[r39+12|0]|0)!=(r35|0)){r41=0;break}r41=(HEAP[r40+8|0]|0)==(r35|0)}else{r41=0}}while(0);if((r41&1|0)!=0){HEAP[r39+12|0]=r40;HEAP[r40+8|0]=r39;break}else{_abort()}}else{r42=r38+20|0;r43=r42;r44=HEAP[r42];r40=r44;do{if((r44|0)==0){r42=r35+16|0;r43=r42;r45=HEAP[r42];r40=r45;if((r45|0)!=0){break}else{break L649}}}while(0);while(1){r44=r40+20|0;r39=r44;if((HEAP[r44]|0)==0){r44=r40+16|0;r39=r44;if((HEAP[r44]|0)==0){break}}r44=r39;r43=r44;r40=HEAP[r44]}if((r43>>>0>=HEAP[67336]>>>0&1|0)!=0){HEAP[r43]=0;break}else{_abort()}}}while(0);if((r31|0)==0){break}r38=(HEAP[r35+28|0]<<2)+67624|0;do{if((r35|0)==(HEAP[r38]|0)){r32=r40;HEAP[r38]=r32;if((r32|0)!=0){break}HEAP[67324]=HEAP[67324]&(1<<HEAP[r35+28|0]^-1)}else{if((r31>>>0>=HEAP[67336]>>>0&1|0)==0){_abort()}r32=r40;r33=r31+16|0;if((HEAP[r31+16|0]|0)==(r35|0)){HEAP[r33|0]=r32;break}else{HEAP[r33+4|0]=r32;break}}}while(0);if((r40|0)==0){break}if((r40>>>0>=HEAP[67336]>>>0&1|0)==0){_abort()}HEAP[r40+24|0]=r31;r38=HEAP[r35+16|0];r32=r38;do{if((r38|0)!=0){if((r32>>>0>=HEAP[67336]>>>0&1|0)!=0){HEAP[r40+16|0]=r32;HEAP[r32+24|0]=r40;break}else{_abort()}}}while(0);r32=HEAP[r35+20|0];r38=r32;if((r32|0)==0){break}if((r38>>>0>=HEAP[67336]>>>0&1|0)!=0){HEAP[r40+20|0]=r38;HEAP[r38+24|0]=r40;break}else{_abort()}}}while(0);if(r1>>>0<r29>>>0){r46=(HEAP[r29+4|0]&1|0)!=0}else{r46=0}if((r46&1|0)==0){_abort()}r46=r29;do{if((HEAP[r29+4|0]&2|0)!=0){r40=r46+4|0;HEAP[r40]=HEAP[r40]&-2;HEAP[r1+4|0]=r30|1;HEAP[r1+r30|0]=r30}else{if((r46|0)==(HEAP[67344]|0)){r40=HEAP[67332]+r30|0;HEAP[67332]=r40;r41=r40;HEAP[67344]=r1;HEAP[r1+4|0]=r41|1;if((r1|0)==(HEAP[67340]|0)){HEAP[67340]=0;HEAP[67328]=0}if(r41>>>0<=HEAP[67348]>>>0){STACKTOP=r3;return}HEAP[r20]=67320;HEAP[r21]=0;HEAP[r22]=0;do{if((HEAP[65800]|0)!=0){r2=499}else{_init_mparams();if(HEAP[r21]>>>0<4294967232){r2=499;break}else{break}}}while(0);do{if(r2==499){if((HEAP[HEAP[r20]+24|0]|0)==0){break}HEAP[r21]=HEAP[r21]+40|0;do{if(HEAP[HEAP[r20]+12|0]>>>0>HEAP[r21]>>>0){HEAP[r23]=HEAP[65808];r35=Math.imul(Math.floor(((HEAP[HEAP[r20]+12|0]-1+ -HEAP[r21]+HEAP[r23]|0)>>>0)/(HEAP[r23]>>>0))-1|0,HEAP[r23]);HEAP[r24]=r35;r35=HEAP[HEAP[r20]+24|0];HEAP[r17]=HEAP[r20];HEAP[r18]=r35;HEAP[r19]=HEAP[r17]+448|0;while(1){if(HEAP[r18]>>>0>=HEAP[HEAP[r19]|0]>>>0){if(HEAP[r18]>>>0<(HEAP[HEAP[r19]|0]+HEAP[HEAP[r19]+4|0]|0)>>>0){r2=504;break}}r35=HEAP[HEAP[r19]+8|0];HEAP[r19]=r35;if((r35|0)==0){r2=506;break}}if(r2==506){HEAP[r16]=0}else if(r2==504){HEAP[r16]=HEAP[r19]}HEAP[r25]=HEAP[r16];do{if((HEAP[HEAP[r25]+12|0]&8|0)!=0){r2=514}else{if(HEAP[r24]>>>0>=2147483647){HEAP[r24]=-2147483648-HEAP[r23]|0}r35=_sbrk(0);HEAP[r26]=r35;if((HEAP[r26]|0)!=(HEAP[HEAP[r25]|0]+HEAP[HEAP[r25]+4|0]|0)){r2=514;break}r35=_sbrk(-HEAP[r24]|0);HEAP[r27]=r35;r35=_sbrk(0);HEAP[r28]=r35;if((HEAP[r27]|0)==-1){r2=514;break}if(HEAP[r28]>>>0>=HEAP[r26]>>>0){r2=514;break}r35=HEAP[r26]-HEAP[r28]|0;HEAP[r22]=r35;r47=r35;break}}while(0);if(r2==514){r47=HEAP[r22]}if((r47|0)==0){break}r35=HEAP[r25]+4|0;HEAP[r35]=HEAP[r35]-HEAP[r22]|0;r35=HEAP[r20]+432|0;HEAP[r35]=HEAP[r35]-HEAP[r22]|0;r35=HEAP[HEAP[r20]+24|0];r41=HEAP[HEAP[r20]+12|0]-HEAP[r22]|0;HEAP[r12]=HEAP[r20];HEAP[r13]=r35;HEAP[r14]=r41;if((HEAP[r13]+8&7|0)==0){r48=0}else{r48=8-(HEAP[r13]+8&7)&7}HEAP[r15]=r48;HEAP[r13]=HEAP[r13]+HEAP[r15]|0;HEAP[r14]=HEAP[r14]-HEAP[r15]|0;HEAP[HEAP[r12]+24|0]=HEAP[r13];HEAP[HEAP[r12]+12|0]=HEAP[r14];HEAP[HEAP[r13]+4|0]=HEAP[r14]|1;HEAP[HEAP[r13]+HEAP[r14]+4|0]=40;HEAP[HEAP[r12]+28|0]=HEAP[65816]}}while(0);if((HEAP[r22]|0)!=0){break}if(HEAP[HEAP[r20]+12|0]>>>0<=HEAP[HEAP[r20]+28|0]>>>0){break}HEAP[HEAP[r20]+28|0]=-1}}while(0);STACKTOP=r3;return}if((r29|0)==(HEAP[67340]|0)){r43=HEAP[67328]+r30|0;HEAP[67328]=r43;r41=r43;HEAP[67340]=r1;HEAP[r1+4|0]=r41|1;HEAP[r1+r41|0]=r41;STACKTOP=r3;return}r41=HEAP[r29+4|0]&-8;r30=r30+r41|0;r43=r29;do{if(r41>>>3>>>0<32){r35=HEAP[r43+8|0];r40=HEAP[r29+12|0];r37=r41>>>3;do{if((r35|0)==((r37<<3)+67360|0)){r49=1}else{if(!(r35>>>0>=HEAP[67336]>>>0)){r49=0;break}r49=(HEAP[r35+12|0]|0)==(r29|0)}}while(0);if((r49&1|0)==0){_abort()}if((r40|0)==(r35|0)){HEAP[67320]=HEAP[67320]&(1<<r37^-1);break}do{if((r40|0)==((r37<<3)+67360|0)){r50=1}else{if(!(r40>>>0>=HEAP[67336]>>>0)){r50=0;break}r50=(HEAP[r40+8|0]|0)==(r29|0)}}while(0);if((r50&1|0)!=0){HEAP[r35+12|0]=r40;HEAP[r40+8|0]=r35;break}else{_abort()}}else{r37=r43;r36=HEAP[r37+24|0];r38=r37;L775:do{if((HEAP[r37+12|0]|0)!=(r37|0)){r32=HEAP[r38+8|0];r51=HEAP[r37+12|0];do{if(r32>>>0>=HEAP[67336]>>>0){if((HEAP[r32+12|0]|0)!=(r37|0)){r52=0;break}r52=(HEAP[r51+8|0]|0)==(r37|0)}else{r52=0}}while(0);if((r52&1|0)!=0){HEAP[r32+12|0]=r51;HEAP[r51+8|0]=r32;break}else{_abort()}}else{r31=r38+20|0;r33=r31;r34=HEAP[r31];r51=r34;do{if((r34|0)==0){r31=r37+16|0;r33=r31;r44=HEAP[r31];r51=r44;if((r44|0)!=0){break}else{break L775}}}while(0);while(1){r34=r51+20|0;r32=r34;if((HEAP[r34]|0)==0){r34=r51+16|0;r32=r34;if((HEAP[r34]|0)==0){break}}r34=r32;r33=r34;r51=HEAP[r34]}if((r33>>>0>=HEAP[67336]>>>0&1|0)!=0){HEAP[r33]=0;break}else{_abort()}}}while(0);if((r36|0)==0){break}r38=(HEAP[r37+28|0]<<2)+67624|0;do{if((r37|0)==(HEAP[r38]|0)){r35=r51;HEAP[r38]=r35;if((r35|0)!=0){break}HEAP[67324]=HEAP[67324]&(1<<HEAP[r37+28|0]^-1)}else{if((r36>>>0>=HEAP[67336]>>>0&1|0)==0){_abort()}r35=r51;r40=r36+16|0;if((HEAP[r36+16|0]|0)==(r37|0)){HEAP[r40|0]=r35;break}else{HEAP[r40+4|0]=r35;break}}}while(0);if((r51|0)==0){break}if((r51>>>0>=HEAP[67336]>>>0&1|0)==0){_abort()}HEAP[r51+24|0]=r36;r38=HEAP[r37+16|0];r35=r38;do{if((r38|0)!=0){if((r35>>>0>=HEAP[67336]>>>0&1|0)!=0){HEAP[r51+16|0]=r35;HEAP[r35+24|0]=r51;break}else{_abort()}}}while(0);r35=HEAP[r37+20|0];r38=r35;if((r35|0)==0){break}if((r38>>>0>=HEAP[67336]>>>0&1|0)!=0){HEAP[r51+20|0]=r38;HEAP[r38+24|0]=r51;break}else{_abort()}}}while(0);HEAP[r1+4|0]=r30|1;HEAP[r1+r30|0]=r30;if((r1|0)!=(HEAP[67340]|0)){break}HEAP[67328]=r30;STACKTOP=r3;return}}while(0);if(r30>>>3>>>0<32){r51=r30>>>3;r52=(r51<<3)+67360|0;r50=r52;do{if((1<<r51&HEAP[67320]|0)!=0){if((HEAP[r52+8|0]>>>0>=HEAP[67336]>>>0&1|0)!=0){r50=HEAP[r52+8|0];break}else{_abort()}}else{HEAP[67320]=HEAP[67320]|1<<r51}}while(0);HEAP[r52+8|0]=r1;HEAP[r50+12|0]=r1;HEAP[r1+8|0]=r50;HEAP[r1+12|0]=r52;STACKTOP=r3;return}r52=r1;r1=r30>>>8;do{if((r1|0)==0){r53=0}else{if(r1>>>0>65535){r53=31;break}else{r50=r1;r51=(r50-256|0)>>>16&8;r29=r50<<r51;r50=r29;r49=(r29-4096|0)>>>16&4;r51=r51+r49|0;r29=r50<<r49;r50=r29;r20=(r29-16384|0)>>>16&2;r49=r20;r51=r20+r51|0;r20=r50<<r49;r50=r20;r49=-r51+(r20>>>15)+14|0;r53=(r49<<1)+(r30>>>((r49+7|0)>>>0)&1)|0;break}}}while(0);r1=(r53<<2)+67624|0;HEAP[r52+28|0]=r53;HEAP[r52+20|0]=0;HEAP[r52+16|0]=0;L846:do{if((1<<r53&HEAP[67324]|0)!=0){r49=HEAP[r1];if((r53|0)==31){r54=0}else{r54=-(r53>>>1)+25|0}r20=r30<<r54;L852:do{if((HEAP[r49+4|0]&-8|0)!=(r30|0)){while(1){r55=((r20>>>31&1)<<2)+r49+16|0;r20=r20<<1;r56=r55;if((HEAP[r55]|0)==0){break}r49=HEAP[r56];if((HEAP[r49+4|0]&-8|0)==(r30|0)){break L852}}if((r56>>>0>=HEAP[67336]>>>0&1|0)!=0){HEAP[r55]=r52;HEAP[r52+24|0]=r49;r37=r52;HEAP[r52+12|0]=r37;HEAP[r52+8|0]=r37;break L846}else{_abort()}}}while(0);r20=HEAP[r49+8|0];if(r49>>>0>=HEAP[67336]>>>0){r57=r20>>>0>=HEAP[67336]>>>0}else{r57=0}if((r57&1|0)!=0){r37=r52;HEAP[r20+12|0]=r37;HEAP[r49+8|0]=r37;HEAP[r52+8|0]=r20;HEAP[r52+12|0]=r49;HEAP[r52+24|0]=0;break}else{_abort()}}else{HEAP[67324]=HEAP[67324]|1<<r53;HEAP[r1]=r52;HEAP[r52+24|0]=r1;r20=r52;HEAP[r52+12|0]=r20;HEAP[r52+8|0]=r20}}while(0);r52=HEAP[67352]-1|0;HEAP[67352]=r52;if((r52|0)!=0){STACKTOP=r3;return}HEAP[r4]=67320;HEAP[r5]=0;HEAP[r6]=0;HEAP[r7]=HEAP[r4]+448|0;r5=HEAP[HEAP[r7]+8|0];HEAP[r8]=r5;L871:do{if((r5|0)!=0){while(1){HEAP[r9]=HEAP[HEAP[r8]|0];HEAP[r10]=HEAP[HEAP[r8]+4|0];r52=HEAP[HEAP[r8]+8|0];HEAP[r11]=r52;HEAP[r6]=HEAP[r6]+1|0;HEAP[r7]=HEAP[r8];HEAP[r8]=r52;if((r52|0)==0){break L871}}}}while(0);HEAP[HEAP[r4]+32|0]=-1;STACKTOP=r3;return}function _init_mparams(){var r1,r2;if((HEAP[65800]|0)!=0){return}r1=_sysconf(8);r2=r1;if((r2-1&r2|0)!=0){_abort()}if((r1-1&r1|0)!=0){_abort()}HEAP[65808]=r2;HEAP[65804]=r1;HEAP[65812]=-1;HEAP[65816]=2097152;HEAP[65820]=0;HEAP[67764]=HEAP[65820];r1=_time(0)^1431655765;r1=r1|8;r1=r1&-8;HEAP[65800]=r1;return}function _dispose_chunk(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28;r4=r1;r1=r2;r2=r3;r3=r1+r2|0;do{if((HEAP[r1+4|0]&1|0)==0){r5=HEAP[r1|0];if((HEAP[r1+4|0]&3|0)==0){r2=r2+(r5+16)|0;return}r6=r1+ -r5|0;r2=r2+r5|0;r1=r6;if((r6>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}if((r1|0)==(HEAP[r4+20|0]|0)){if((HEAP[r3+4|0]&3|0)!=3){break}HEAP[r4+8|0]=r2;r6=r3+4|0;HEAP[r6]=HEAP[r6]&-2;HEAP[r1+4|0]=r2|1;HEAP[r1+r2|0]=r2;return}r6=r1;if(r5>>>3>>>0<32){r7=HEAP[r6+8|0];r8=HEAP[r1+12|0];r9=r5>>>3;do{if((r7|0)==((r9<<3)+r4+40|0)){r10=1}else{if(!(r7>>>0>=HEAP[r4+16|0]>>>0)){r10=0;break}r10=(HEAP[r7+12|0]|0)==(r1|0)}}while(0);if((r10&1|0)==0){_abort()}if((r8|0)==(r7|0)){r5=r4|0;HEAP[r5]=HEAP[r5]&(1<<r9^-1);break}do{if((r8|0)==((r9<<3)+r4+40|0)){r11=1}else{if(!(r8>>>0>=HEAP[r4+16|0]>>>0)){r11=0;break}r11=(HEAP[r8+8|0]|0)==(r1|0)}}while(0);if((r11&1|0)!=0){HEAP[r7+12|0]=r8;HEAP[r8+8|0]=r7;break}else{_abort()}}r9=r6;r5=HEAP[r9+24|0];r12=r9;L922:do{if((HEAP[r9+12|0]|0)!=(r9|0)){r13=HEAP[r12+8|0];r14=HEAP[r9+12|0];do{if(r13>>>0>=HEAP[r4+16|0]>>>0){if((HEAP[r13+12|0]|0)!=(r9|0)){r15=0;break}r15=(HEAP[r14+8|0]|0)==(r9|0)}else{r15=0}}while(0);if((r15&1|0)!=0){HEAP[r13+12|0]=r14;HEAP[r14+8|0]=r13;break}else{_abort()}}else{r16=r12+20|0;r17=r16;r18=HEAP[r16];r14=r18;do{if((r18|0)==0){r16=r9+16|0;r17=r16;r19=HEAP[r16];r14=r19;if((r19|0)!=0){break}else{break L922}}}while(0);while(1){r18=r14+20|0;r13=r18;if((HEAP[r18]|0)==0){r18=r14+16|0;r13=r18;if((HEAP[r18]|0)==0){break}}r18=r13;r17=r18;r14=HEAP[r18]}if((r17>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r17]=0;break}else{_abort()}}}while(0);if((r5|0)==0){break}r12=(HEAP[r9+28|0]<<2)+r4+304|0;do{if((r9|0)==(HEAP[r12]|0)){r6=r14;HEAP[r12]=r6;if((r6|0)!=0){break}r6=r4+4|0;HEAP[r6]=HEAP[r6]&(1<<HEAP[r9+28|0]^-1)}else{if((r5>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}r6=r14;r7=r5+16|0;if((HEAP[r5+16|0]|0)==(r9|0)){HEAP[r7|0]=r6;break}else{HEAP[r7+4|0]=r6;break}}}while(0);if((r14|0)==0){break}if((r14>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}HEAP[r14+24|0]=r5;r12=HEAP[r9+16|0];r6=r12;do{if((r12|0)!=0){if((r6>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r14+16|0]=r6;HEAP[r6+24|0]=r14;break}else{_abort()}}}while(0);r6=HEAP[r9+20|0];r12=r6;if((r6|0)==0){break}if((r12>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r14+20|0]=r12;HEAP[r12+24|0]=r14;break}else{_abort()}}}while(0);if((r3>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}r14=r3;do{if((HEAP[r3+4|0]&2|0)!=0){r15=r14+4|0;HEAP[r15]=HEAP[r15]&-2;HEAP[r1+4|0]=r2|1;HEAP[r1+r2|0]=r2}else{if((r14|0)==(HEAP[r4+24|0]|0)){r15=r4+12|0;r11=HEAP[r15]+r2|0;HEAP[r15]=r11;HEAP[r4+24|0]=r1;HEAP[r1+4|0]=r11|1;if((r1|0)!=(HEAP[r4+20|0]|0)){return}HEAP[r4+20|0]=0;HEAP[r4+8|0]=0;return}if((r3|0)==(HEAP[r4+20|0]|0)){r11=r4+8|0;r15=HEAP[r11]+r2|0;HEAP[r11]=r15;r11=r15;HEAP[r4+20|0]=r1;HEAP[r1+4|0]=r11|1;HEAP[r1+r11|0]=r11;return}r11=HEAP[r3+4|0]&-8;r2=r2+r11|0;r15=r3;do{if(r11>>>3>>>0<32){r10=HEAP[r15+8|0];r12=HEAP[r3+12|0];r6=r11>>>3;do{if((r10|0)==((r6<<3)+r4+40|0)){r20=1}else{if(!(r10>>>0>=HEAP[r4+16|0]>>>0)){r20=0;break}r20=(HEAP[r10+12|0]|0)==(r3|0)}}while(0);if((r20&1|0)==0){_abort()}if((r12|0)==(r10|0)){r17=r4|0;HEAP[r17]=HEAP[r17]&(1<<r6^-1);break}do{if((r12|0)==((r6<<3)+r4+40|0)){r21=1}else{if(!(r12>>>0>=HEAP[r4+16|0]>>>0)){r21=0;break}r21=(HEAP[r12+8|0]|0)==(r3|0)}}while(0);if((r21&1|0)!=0){HEAP[r10+12|0]=r12;HEAP[r12+8|0]=r10;break}else{_abort()}}else{r6=r15;r17=HEAP[r6+24|0];r5=r6;L1007:do{if((HEAP[r6+12|0]|0)!=(r6|0)){r7=HEAP[r5+8|0];r22=HEAP[r6+12|0];do{if(r7>>>0>=HEAP[r4+16|0]>>>0){if((HEAP[r7+12|0]|0)!=(r6|0)){r23=0;break}r23=(HEAP[r22+8|0]|0)==(r6|0)}else{r23=0}}while(0);if((r23&1|0)!=0){HEAP[r7+12|0]=r22;HEAP[r22+8|0]=r7;break}else{_abort()}}else{r8=r5+20|0;r18=r8;r13=HEAP[r8];r22=r13;do{if((r13|0)==0){r8=r6+16|0;r18=r8;r19=HEAP[r8];r22=r19;if((r19|0)!=0){break}else{break L1007}}}while(0);while(1){r13=r22+20|0;r7=r13;if((HEAP[r13]|0)==0){r13=r22+16|0;r7=r13;if((HEAP[r13]|0)==0){break}}r13=r7;r18=r13;r22=HEAP[r13]}if((r18>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r18]=0;break}else{_abort()}}}while(0);if((r17|0)==0){break}r5=(HEAP[r6+28|0]<<2)+r4+304|0;do{if((r6|0)==(HEAP[r5]|0)){r10=r22;HEAP[r5]=r10;if((r10|0)!=0){break}r10=r4+4|0;HEAP[r10]=HEAP[r10]&(1<<HEAP[r6+28|0]^-1)}else{if((r17>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}r10=r22;r12=r17+16|0;if((HEAP[r17+16|0]|0)==(r6|0)){HEAP[r12|0]=r10;break}else{HEAP[r12+4|0]=r10;break}}}while(0);if((r22|0)==0){break}if((r22>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}HEAP[r22+24|0]=r17;r5=HEAP[r6+16|0];r10=r5;do{if((r5|0)!=0){if((r10>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r22+16|0]=r10;HEAP[r10+24|0]=r22;break}else{_abort()}}}while(0);r10=HEAP[r6+20|0];r5=r10;if((r10|0)==0){break}if((r5>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r22+20|0]=r5;HEAP[r5+24|0]=r22;break}else{_abort()}}}while(0);HEAP[r1+4|0]=r2|1;HEAP[r1+r2|0]=r2;if((r1|0)!=(HEAP[r4+20|0]|0)){break}HEAP[r4+8|0]=r2;return}}while(0);if(r2>>>3>>>0<32){r22=r2>>>3;r23=(r22<<3)+r4+40|0;r21=r23;do{if((1<<r22&HEAP[r4|0]|0)!=0){if((HEAP[r23+8|0]>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){r21=HEAP[r23+8|0];break}else{_abort()}}else{r3=r4|0;HEAP[r3]=HEAP[r3]|1<<r22}}while(0);HEAP[r23+8|0]=r1;HEAP[r21+12|0]=r1;HEAP[r1+8|0]=r21;HEAP[r1+12|0]=r23;return}r23=r1;r1=r2>>>8;do{if((r1|0)==0){r24=0}else{if(r1>>>0>65535){r24=31;break}else{r21=r1;r22=(r21-256|0)>>>16&8;r3=r21<<r22;r21=r3;r20=(r3-4096|0)>>>16&4;r22=r22+r20|0;r3=r21<<r20;r21=r3;r14=(r3-16384|0)>>>16&2;r20=r14;r22=r14+r22|0;r14=r21<<r20;r21=r14;r20=-r22+(r14>>>15)+14|0;r24=(r20<<1)+(r2>>>((r20+7|0)>>>0)&1)|0;break}}}while(0);r1=(r24<<2)+r4+304|0;HEAP[r23+28|0]=r24;HEAP[r23+20|0]=0;HEAP[r23+16|0]=0;if((1<<r24&HEAP[r4+4|0]|0)==0){r20=r4+4|0;HEAP[r20]=HEAP[r20]|1<<r24;HEAP[r1]=r23;HEAP[r23+24|0]=r1;r20=r23;HEAP[r23+12|0]=r20;HEAP[r23+8|0]=r20;return}r20=HEAP[r1];if((r24|0)==31){r25=0}else{r25=-(r24>>>1)+25|0}r24=r2<<r25;L1085:do{if((HEAP[r20+4|0]&-8|0)!=(r2|0)){while(1){r26=((r24>>>31&1)<<2)+r20+16|0;r24=r24<<1;r27=r26;if((HEAP[r26]|0)==0){break}r20=HEAP[r27];if((HEAP[r20+4|0]&-8|0)==(r2|0)){break L1085}}if((r27>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}HEAP[r26]=r23;HEAP[r23+24|0]=r20;r25=r23;HEAP[r23+12|0]=r25;HEAP[r23+8|0]=r25;return}}while(0);r26=HEAP[r20+8|0];if(r20>>>0>=HEAP[r4+16|0]>>>0){r28=r26>>>0>=HEAP[r4+16|0]>>>0}else{r28=0}if((r28&1|0)==0){_abort()}r28=r23;HEAP[r26+12|0]=r28;HEAP[r20+8|0]=r28;HEAP[r23+8|0]=r26;HEAP[r23+12|0]=r20;HEAP[r23+24|0]=0;return}function _atof(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+80|0;r4=r3;r5=r3+8;r6=r3+12;r7=r3+16;r8=r3+20;r9=r3+24;r10=r3+32;r11=r3+40;r12=r3+44;r13=r3+48;r14=r3+52;r15=r3+56;r16=r3+60;r17=r3+64;r18=r3+68;r19=r3+72;r20=r3+76;HEAP[r5]=r1;HEAP[r6]=0;HEAP[r8]=0;HEAP[r14]=0;HEAP[r15]=0;HEAP[r12]=HEAP[r5];r1=(_isspace(HEAP[HEAP[r12]]<<24>>24)|0)!=0;r21=HEAP[r12];L1103:do{if(r1){r22=r21;while(1){HEAP[r12]=r22+1|0;r23=(_isspace(HEAP[HEAP[r12]]<<24>>24)|0)!=0;r24=HEAP[r12];if(r23){r22=r24}else{r25=r24;break L1103}}}else{r25=r21}}while(0);if((HEAP[r25]<<24>>24|0)==45){HEAP[r7]=1;HEAP[r12]=HEAP[r12]+1|0}else{if((HEAP[HEAP[r12]]<<24>>24|0)==43){HEAP[r12]=HEAP[r12]+1|0}HEAP[r7]=0}HEAP[r17]=-1;HEAP[r16]=0;while(1){HEAP[r13]=HEAP[HEAP[r12]]<<24>>24;if((HEAP[r13]-48|0)>>>0>=10){if((HEAP[r13]|0)!=46){break}if((HEAP[r17]|0)>=0){break}HEAP[r17]=HEAP[r16]}HEAP[r12]=HEAP[r12]+1|0;HEAP[r16]=HEAP[r16]+1|0}HEAP[r18]=HEAP[r12];HEAP[r12]=HEAP[r12]+ -HEAP[r16]|0;r25=HEAP[r16];if((HEAP[r17]|0)<0){HEAP[r17]=r25;r26=HEAP[r16]}else{r21=r25-1|0;HEAP[r16]=r21;r26=r21}r21=HEAP[r17];do{if((r26|0)>18){HEAP[r15]=r21-18|0;HEAP[r16]=18;HEAP[r19]=0;r2=809;break}else{r25=HEAP[r16];HEAP[r15]=r21-r25|0;if((r25|0)==0){HEAP[r9]=0;HEAP[r12]=HEAP[r5];break}HEAP[r19]=0;if((r25|0)>9){r2=809;break}r27=HEAP[r16];r2=813;break}}while(0);L1133:do{if(r2==809){while(1){r2=0;r21=HEAP[HEAP[r12]]<<24>>24;HEAP[r13]=r21;HEAP[r12]=HEAP[r12]+1|0;if((r21|0)==46){HEAP[r13]=HEAP[HEAP[r12]]<<24>>24;HEAP[r12]=HEAP[r12]+1|0}HEAP[r19]=HEAP[r13]-48+(HEAP[r19]*10&-1)|0;r21=HEAP[r16]-1|0;HEAP[r16]=r21;if((r21|0)>9){r2=809}else{r27=r21;r2=813;break L1133}}}}while(0);do{if(r2==813){HEAP[r20]=0;L1141:do{if((r27|0)>0){while(1){r21=HEAP[HEAP[r12]]<<24>>24;HEAP[r13]=r21;HEAP[r12]=HEAP[r12]+1|0;if((r21|0)==46){HEAP[r13]=HEAP[HEAP[r12]]<<24>>24;HEAP[r12]=HEAP[r12]+1|0}HEAP[r20]=HEAP[r13]-48+(HEAP[r20]*10&-1)|0;r21=HEAP[r16]-1|0;HEAP[r16]=r21;if((r21|0)<=0){break L1141}}}}while(0);HEAP[r9]=(HEAP[r19]|0)*1e9+(HEAP[r20]|0);HEAP[r12]=HEAP[r18];do{if((HEAP[HEAP[r12]]<<24>>24|0)==69){r2=819}else{if((HEAP[HEAP[r12]]<<24>>24|0)==101){r2=819;break}else{break}}}while(0);L1150:do{if(r2==819){HEAP[r12]=HEAP[r12]+1|0;if((HEAP[HEAP[r12]]<<24>>24|0)==45){HEAP[r8]=1;HEAP[r12]=HEAP[r12]+1|0}else{if((HEAP[HEAP[r12]]<<24>>24|0)==43){HEAP[r12]=HEAP[r12]+1|0}HEAP[r8]=0}if(((HEAP[HEAP[r12]]<<24>>24)-48|0)>>>0>=10){break}while(1){HEAP[r14]=(HEAP[HEAP[r12]]<<24>>24)+((HEAP[r14]*10&-1)-48)|0;HEAP[r12]=HEAP[r12]+1|0;if(((HEAP[HEAP[r12]]<<24>>24)-48|0)>>>0>=10){break L1150}}}}while(0);r21=HEAP[r15];r26=HEAP[r14];if((HEAP[r8]|0)!=0){r25=r21-r26|0;HEAP[r14]=r25;r28=r25}else{r25=r26+r21|0;HEAP[r14]=r25;r28=r25}if((r28|0)<0){HEAP[r8]=1;r25=-HEAP[r14]|0;HEAP[r14]=r25;r29=r25}else{HEAP[r8]=0;r29=HEAP[r14]}if((r29|0)>511){HEAP[r14]=511;r25=___errno_location();HEAP[r25]=34}HEAP[r10]=1;HEAP[r11]=65728;L1173:do{if((HEAP[r14]|0)!=0){while(1){if((HEAP[r14]&1|0)!=0){HEAP[r10]=HEAP[HEAP[r11]]*HEAP[r10]}r25=HEAP[r14]>>1;HEAP[r14]=r25;HEAP[r11]=HEAP[r11]+8|0;if((r25|0)==0){break L1173}}}}while(0);r25=HEAP[r10];r21=HEAP[r9];if((HEAP[r8]|0)!=0){HEAP[r9]=r21/r25;break}else{HEAP[r9]=r25*r21;break}}}while(0);if((HEAP[r6]|0)!=0){HEAP[HEAP[r6]]=HEAP[r12]}r29=HEAP[r9];if((HEAP[r7]|0)!=0){HEAP[r4]=-r29;r28=HEAP[r4];r2=r4;r27=r5;r21=r6;r25=r7;r26=r8;r1=r9;r22=r10;r24=r11;r23=r12;r30=r13;r31=r14;r32=r15;r33=r16;r34=r17;r35=r18;r36=r19;r37=r20;STACKTOP=r3;return r28}else{HEAP[r4]=r29;r28=HEAP[r4];r2=r4;r27=r5;r21=r6;r25=r7;r26=r8;r1=r9;r22=r10;r24=r11;r23=r12;r30=r13;r31=r14;r32=r15;r33=r16;r34=r17;r35=r18;r36=r19;r37=r20;STACKTOP=r3;return r28}}
// EMSCRIPTEN_END_FUNCS
Module["_init_game"] = _init_game;
Module["_midend_size"] = _midend_size;
Module["_midend_set_params"] = _midend_set_params;
Module["_midend_get_params"] = _midend_get_params;
Module["_midend_force_redraw"] = _midend_force_redraw;
Module["_midend_redraw"] = _midend_redraw;
Module["_midend_can_undo"] = _midend_can_undo;
Module["_midend_can_redo"] = _midend_can_redo;
Module["_midend_new_game"] = _midend_new_game;
Module["_midend_restart_game"] = _midend_restart_game;
Module["_midend_process_key"] = _midend_process_key;
Module["_midend_wants_statusbar"] = _midend_wants_statusbar;
Module["_midend_timer"] = _midend_timer;
Module["_midend_which_preset"] = _midend_which_preset;
Module["_midend_solve"] = _midend_solve;
Module["_midend_status"] = _midend_status;
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
Module.callMain = function callMain(args) {
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
initRuntime();
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
if (shouldRunNow) {
  run();
}
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}
// --post-js code for compiled games
game_script_loaded();
