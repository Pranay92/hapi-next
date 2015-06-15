var global = Function("return this;")();
/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011 (@ded @fat)
  * http://ender.no.de
  * License MIT
  */
!function (context) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // losely based on CommonJS Modules spec v1.1.1
  // ============================================

  var modules = {}
    , old = context.$

  function require (identifier) {
    // modules can be required from ender's build system, or found on the window
    var module = modules[identifier] || window[identifier]
    if (!module) throw new Error("Requested module '" + identifier + "' has not been defined.")
    return module
  }

  function provide (name, what) {
    return (modules[name] = what)
  }

  context['provide'] = provide
  context['require'] = require

  function aug(o, o2) {
    for (var k in o2) k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k])
    return o
  }

  function boosh(s, r, els) {
    // string || node || nodelist || window
    if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
      els = ender._select(s, r)
      els.selector = s
    } else els = isFinite(s.length) ? s : [s]
    return aug(els, boosh)
  }

  function ender(s, r) {
    return boosh(s, r)
  }

  aug(ender, {
      _VERSION: '0.3.6'
    , fn: boosh // for easy compat to jQuery plugins
    , ender: function (o, chain) {
        aug(chain ? boosh : ender, o)
      }
    , _select: function (s, r) {
        return (r || document).querySelectorAll(s)
      }
  })

  aug(boosh, {
    forEach: function (fn, scope, i) {
      // opt out of native forEach so we can intentionally call our own scope
      // defaulting to the current item and be able to return self
      for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(scope || this[i], this[i], i, this)
      // return self for chaining
      return this
    },
    $: ender // handy reference to self
  })

  ender.noConflict = function () {
    context.$ = old
    return this
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = ender
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = context['ender'] || ender

}(this);
// pakmanager:hoek/lib/escape
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  // Declare internals
    
    var internals = {};
    
    
    exports.escapeJavaScript = function (input) {
    
        if (!input) {
            return '';
        }
    
        var escaped = '';
    
        for (var i = 0, il = input.length; i < il; ++i) {
    
            var charCode = input.charCodeAt(i);
    
            if (internals.isSafe(charCode)) {
                escaped += input[i];
            }
            else {
                escaped += internals.escapeJavaScriptChar(charCode);
            }
        }
    
        return escaped;
    };
    
    
    exports.escapeHtml = function (input) {
    
        if (!input) {
            return '';
        }
    
        var escaped = '';
    
        for (var i = 0, il = input.length; i < il; ++i) {
    
            var charCode = input.charCodeAt(i);
    
            if (internals.isSafe(charCode)) {
                escaped += input[i];
            }
            else {
                escaped += internals.escapeHtmlChar(charCode);
            }
        }
    
        return escaped;
    };
    
    
    internals.escapeJavaScriptChar = function (charCode) {
    
        if (charCode >= 256) {
            return '\\u' + internals.padLeft('' + charCode, 4);
        }
    
        var hexValue = new Buffer(String.fromCharCode(charCode), 'ascii').toString('hex');
        return '\\x' + internals.padLeft(hexValue, 2);
    };
    
    
    internals.escapeHtmlChar = function (charCode) {
    
        var namedEscape = internals.namedHtml[charCode];
        if (typeof namedEscape !== 'undefined') {
            return namedEscape;
        }
    
        if (charCode >= 256) {
            return '&#' + charCode + ';';
        }
    
        var hexValue = new Buffer(String.fromCharCode(charCode), 'ascii').toString('hex');
        return '&#x' + internals.padLeft(hexValue, 2) + ';';
    };
    
    
    internals.padLeft = function (str, len) {
    
        while (str.length < len) {
            str = '0' + str;
        }
    
        return str;
    };
    
    
    internals.isSafe = function (charCode) {
    
        return (typeof internals.safeCharCodes[charCode] !== 'undefined');
    };
    
    
    internals.namedHtml = {
        '38': '&amp;',
        '60': '&lt;',
        '62': '&gt;',
        '34': '&quot;',
        '160': '&nbsp;',
        '162': '&cent;',
        '163': '&pound;',
        '164': '&curren;',
        '169': '&copy;',
        '174': '&reg;'
    };
    
    
    internals.safeCharCodes = (function () {
    
        var safe = {};
    
        for (var i = 32; i < 123; ++i) {
    
            if ((i >= 97) ||                    // a-z
                (i >= 65 && i <= 90) ||         // A-Z
                (i >= 48 && i <= 57) ||         // 0-9
                i === 32 ||                     // space
                i === 46 ||                     // .
                i === 44 ||                     // ,
                i === 45 ||                     // -
                i === 58 ||                     // :
                i === 95) {                     // _
    
                safe[i] = null;
            }
        }
    
        return safe;
    }());
    
  provide("hoek/lib/escape", module.exports);
}(global));

// pakmanager:hoek/lib
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  // Load modules
    
    var Crypto = require('crypto');
    var Path = require('path');
    var Util = require('util');
    var Escape =  require('hoek/lib/escape');
    
    
    // Declare internals
    
    var internals = {};
    
    
    // Clone object or array
    
    exports.clone = function (obj, seen) {
    
        if (typeof obj !== 'object' ||
            obj === null) {
    
            return obj;
        }
    
        seen = seen || { orig: [], copy: [] };
    
        var lookup = seen.orig.indexOf(obj);
        if (lookup !== -1) {
            return seen.copy[lookup];
        }
    
        var newObj;
        var cloneDeep = false;
    
        if (!Array.isArray(obj)) {
            if (Buffer.isBuffer(obj)) {
                newObj = new Buffer(obj);
            }
            else if (obj instanceof Date) {
                newObj = new Date(obj.getTime());
            }
            else if (obj instanceof RegExp) {
                newObj = new RegExp(obj);
            }
            else {
                var proto = Object.getPrototypeOf(obj);
                if (proto &&
                    proto.isImmutable) {
    
                    newObj = obj;
                }
                else {
                    newObj = Object.create(proto);
                    cloneDeep = true;
                }
            }
        }
        else {
            newObj = [];
            cloneDeep = true;
        }
    
        seen.orig.push(obj);
        seen.copy.push(newObj);
    
        if (cloneDeep) {
            var keys = Object.getOwnPropertyNames(obj);
            for (var i = 0, il = keys.length; i < il; ++i) {
                var key = keys[i];
                var descriptor = Object.getOwnPropertyDescriptor(obj, key);
                if (descriptor.get ||
                    descriptor.set) {
    
                    Object.defineProperty(newObj, key, descriptor);
                }
                else {
                    newObj[key] = exports.clone(obj[key], seen);
                }
            }
        }
    
        return newObj;
    };
    
    
    // Merge all the properties of source into target, source wins in conflict, and by default null and undefined from source are applied
    /*eslint-disable */
    exports.merge = function (target, source, isNullOverride /* = true */, isMergeArrays /* = true */) {
    /*eslint-enable */
        exports.assert(target && typeof target === 'object', 'Invalid target value: must be an object');
        exports.assert(source === null || source === undefined || typeof source === 'object', 'Invalid source value: must be null, undefined, or an object');
    
        if (!source) {
            return target;
        }
    
        if (Array.isArray(source)) {
            exports.assert(Array.isArray(target), 'Cannot merge array onto an object');
            if (isMergeArrays === false) {                                                  // isMergeArrays defaults to true
                target.length = 0;                                                          // Must not change target assignment
            }
    
            for (var i = 0, il = source.length; i < il; ++i) {
                target.push(exports.clone(source[i]));
            }
    
            return target;
        }
    
        var keys = Object.keys(source);
        for (var k = 0, kl = keys.length; k < kl; ++k) {
            var key = keys[k];
            var value = source[key];
            if (value &&
                typeof value === 'object') {
    
                if (!target[key] ||
                    typeof target[key] !== 'object' ||
                    (Array.isArray(target[key]) ^ Array.isArray(value)) ||
                    value instanceof Date ||
                    Buffer.isBuffer(value) ||
                    value instanceof RegExp) {
    
                    target[key] = exports.clone(value);
                }
                else {
                    exports.merge(target[key], value, isNullOverride, isMergeArrays);
                }
            }
            else {
                if (value !== null &&
                    value !== undefined) {                              // Explicit to preserve empty strings
    
                    target[key] = value;
                }
                else if (isNullOverride !== false) {                    // Defaults to true
                    target[key] = value;
                }
            }
        }
    
        return target;
    };
    
    
    // Apply options to a copy of the defaults
    
    exports.applyToDefaults = function (defaults, options, isNullOverride) {
    
        exports.assert(defaults && typeof defaults === 'object', 'Invalid defaults value: must be an object');
        exports.assert(!options || options === true || typeof options === 'object', 'Invalid options value: must be true, falsy or an object');
    
        if (!options) {                                                 // If no options, return null
            return null;
        }
    
        var copy = exports.clone(defaults);
    
        if (options === true) {                                         // If options is set to true, use defaults
            return copy;
        }
    
        return exports.merge(copy, options, isNullOverride === true, false);
    };
    
    
    // Clone an object except for the listed keys which are shallow copied
    
    exports.cloneWithShallow = function (source, keys) {
    
        if (!source ||
            typeof source !== 'object') {
    
            return source;
        }
    
        var storage = internals.store(source, keys);    // Move shallow copy items to storage
        var copy = exports.clone(source);               // Deep copy the rest
        internals.restore(copy, source, storage);       // Shallow copy the stored items and restore
        return copy;
    };
    
    
    internals.store = function (source, keys) {
    
        var storage = {};
        for (var i = 0, il = keys.length; i < il; ++i) {
            var key = keys[i];
            var value = exports.reach(source, key);
            if (value !== undefined) {
                storage[key] = value;
                internals.reachSet(source, key, undefined);
            }
        }
    
        return storage;
    };
    
    
    internals.restore = function (copy, source, storage) {
    
        var keys = Object.keys(storage);
        for (var i = 0, il = keys.length; i < il; ++i) {
            var key = keys[i];
            internals.reachSet(copy, key, storage[key]);
            internals.reachSet(source, key, storage[key]);
        }
    };
    
    
    internals.reachSet = function (obj, key, value) {
    
        var path = key.split('.');
        var ref = obj;
        for (var i = 0, il = path.length; i < il; ++i) {
            var segment = path[i];
            if (i + 1 === il) {
                ref[segment] = value;
            }
    
            ref = ref[segment];
        }
    };
    
    
    // Apply options to defaults except for the listed keys which are shallow copied from option without merging
    
    exports.applyToDefaultsWithShallow = function (defaults, options, keys) {
    
        exports.assert(defaults && typeof defaults === 'object', 'Invalid defaults value: must be an object');
        exports.assert(!options || options === true || typeof options === 'object', 'Invalid options value: must be true, falsy or an object');
        exports.assert(keys && Array.isArray(keys), 'Invalid keys');
    
        if (!options) {                                                 // If no options, return null
            return null;
        }
    
        var copy = exports.cloneWithShallow(defaults, keys);
    
        if (options === true) {                                         // If options is set to true, use defaults
            return copy;
        }
    
        var storage = internals.store(options, keys);   // Move shallow copy items to storage
        exports.merge(copy, options, false, false);     // Deep copy the rest
        internals.restore(copy, options, storage);      // Shallow copy the stored items and restore
        return copy;
    };
    
    
    // Deep object or array comparison
    
    exports.deepEqual = function (obj, ref, options, seen) {
    
        options = options || { prototype: true };
    
        var type = typeof obj;
    
        if (type !== typeof ref) {
            return false;
        }
    
        if (type !== 'object' ||
            obj === null ||
            ref === null) {
    
            if (obj === ref) {                                                      // Copied from Deep-eql, copyright(c) 2013 Jake Luer, jake@alogicalparadox.com, MIT Licensed, https://github.com/chaijs/deep-eql
                return obj !== 0 || 1 / obj === 1 / ref;        // -0 / +0
            }
    
            return obj !== obj && ref !== ref;                  // NaN
        }
    
        seen = seen || [];
        if (seen.indexOf(obj) !== -1) {
            return true;                            // If previous comparison failed, it would have stopped execution
        }
    
        seen.push(obj);
    
        if (Array.isArray(obj)) {
            if (!Array.isArray(ref)) {
                return false;
            }
    
            if (!options.part && obj.length !== ref.length) {
                return false;
            }
    
            for (var i = 0, il = obj.length; i < il; ++i) {
                if (options.part) {
                    var found = false;
                    for (var r = 0, rl = ref.length; r < rl; ++r) {
                        if (exports.deepEqual(obj[i], ref[r], options, seen)) {
                            found = true;
                            break;
                        }
                    }
    
                    return found;
                }
    
                if (!exports.deepEqual(obj[i], ref[i], options, seen)) {
                    return false;
                }
            }
    
            return true;
        }
    
        if (Buffer.isBuffer(obj)) {
            if (!Buffer.isBuffer(ref)) {
                return false;
            }
    
            if (obj.length !== ref.length) {
                return false;
            }
    
            for (var j = 0, jl = obj.length; j < jl; ++j) {
                if (obj[j] !== ref[j]) {
                    return false;
                }
            }
    
            return true;
        }
    
        if (obj instanceof Date) {
            return (ref instanceof Date && obj.getTime() === ref.getTime());
        }
    
        if (obj instanceof RegExp) {
            return (ref instanceof RegExp && obj.toString() === ref.toString());
        }
    
        if (options.prototype) {
            if (Object.getPrototypeOf(obj) !== Object.getPrototypeOf(ref)) {
                return false;
            }
        }
    
        var keys = Object.getOwnPropertyNames(obj);
    
        if (!options.part && keys.length !== Object.getOwnPropertyNames(ref).length) {
            return false;
        }
    
        for (var k = 0, kl = keys.length; k < kl; ++k) {
            var key = keys[k];
            var descriptor = Object.getOwnPropertyDescriptor(obj, key);
            if (descriptor.get) {
                if (!exports.deepEqual(descriptor, Object.getOwnPropertyDescriptor(ref, key), options, seen)) {
                    return false;
                }
            }
            else if (!exports.deepEqual(obj[key], ref[key], options, seen)) {
                return false;
            }
        }
    
        return true;
    };
    
    
    // Remove duplicate items from array
    
    exports.unique = function (array, key) {
    
        var index = {};
        var result = [];
    
        for (var i = 0, il = array.length; i < il; ++i) {
            var id = (key ? array[i][key] : array[i]);
            if (index[id] !== true) {
    
                result.push(array[i]);
                index[id] = true;
            }
        }
    
        return result;
    };
    
    
    // Convert array into object
    
    exports.mapToObject = function (array, key) {
    
        if (!array) {
            return null;
        }
    
        var obj = {};
        for (var i = 0, il = array.length; i < il; ++i) {
            if (key) {
                if (array[i][key]) {
                    obj[array[i][key]] = true;
                }
            }
            else {
                obj[array[i]] = true;
            }
        }
    
        return obj;
    };
    
    
    // Find the common unique items in two arrays
    
    exports.intersect = function (array1, array2, justFirst) {
    
        if (!array1 || !array2) {
            return [];
        }
    
        var common = [];
        var hash = (Array.isArray(array1) ? exports.mapToObject(array1) : array1);
        var found = {};
        for (var i = 0, il = array2.length; i < il; ++i) {
            if (hash[array2[i]] && !found[array2[i]]) {
                if (justFirst) {
                    return array2[i];
                }
    
                common.push(array2[i]);
                found[array2[i]] = true;
            }
        }
    
        return (justFirst ? null : common);
    };
    
    
    // Test if the reference contains the values
    
    exports.contain = function (ref, values, options) {
    
        /*
            string -> string(s)
            array -> item(s)
            object -> key(s)
            object -> object (key:value)
        */
    
        var valuePairs = null;
        if (typeof ref === 'object' &&
            typeof values === 'object' &&
            !Array.isArray(ref) &&
            !Array.isArray(values)) {
    
            valuePairs = values;
            values = Object.keys(values);
        }
        else {
            values = [].concat(values);
        }
    
        options = options || {};            // deep, once, only, part
    
        exports.assert(arguments.length >= 2, 'Insufficient arguments');
        exports.assert(typeof ref === 'string' || typeof ref === 'object', 'Reference must be string or an object');
        exports.assert(values.length, 'Values array cannot be empty');
    
        var compare, compareFlags;
        if (options.deep) {
            compare = exports.deepEqual;
    
            var hasOnly = options.hasOwnProperty('only'), hasPart = options.hasOwnProperty('part');
    
            compareFlags = {
                prototype: hasOnly ? options.only : hasPart ? !options.part : false,
                part: hasOnly ? !options.only : hasPart ? options.part : true
            };
        }
        else {
            compare = function (a, b) {
    
                return a === b;
            };
        }
    
        var misses = false;
        var matches = new Array(values.length);
        for (var i = 0, il = matches.length; i < il; ++i) {
            matches[i] = 0;
        }
    
        if (typeof ref === 'string') {
            var pattern = '(';
            for (i = 0, il = values.length; i < il; ++i) {
                var value = values[i];
                exports.assert(typeof value === 'string', 'Cannot compare string reference to non-string value');
                pattern += (i ? '|' : '') + exports.escapeRegex(value);
            }
    
            var regex = new RegExp(pattern + ')', 'g');
            var leftovers = ref.replace(regex, function ($0, $1) {
    
                var index = values.indexOf($1);
                ++matches[index];
                return '';          // Remove from string
            });
    
            misses = !!leftovers;
        }
        else if (Array.isArray(ref)) {
            for (i = 0, il = ref.length; i < il; ++i) {
                for (var j = 0, jl = values.length, matched = false; j < jl && matched === false; ++j) {
                    matched = compare(values[j], ref[i], compareFlags) && j;
                }
    
                if (matched !== false) {
                    ++matches[matched];
                }
                else {
                    misses = true;
                }
            }
        }
        else {
            var keys = Object.keys(ref);
            for (i = 0, il = keys.length; i < il; ++i) {
                var key = keys[i];
                var pos = values.indexOf(key);
                if (pos !== -1) {
                    if (valuePairs &&
                        !compare(valuePairs[key], ref[key], compareFlags)) {
    
                        return false;
                    }
    
                    ++matches[pos];
                }
                else {
                    misses = true;
                }
            }
        }
    
        var result = false;
        for (i = 0, il = matches.length; i < il; ++i) {
            result = result || !!matches[i];
            if ((options.once && matches[i] > 1) ||
                (!options.part && !matches[i])) {
    
                return false;
            }
        }
    
        if (options.only &&
            misses) {
    
            return false;
        }
    
        return result;
    };
    
    
    // Flatten array
    
    exports.flatten = function (array, target) {
    
        var result = target || [];
    
        for (var i = 0, il = array.length; i < il; ++i) {
            if (Array.isArray(array[i])) {
                exports.flatten(array[i], result);
            }
            else {
                result.push(array[i]);
            }
        }
    
        return result;
    };
    
    
    // Convert an object key chain string ('a.b.c') to reference (object[a][b][c])
    
    exports.reach = function (obj, chain, options) {
    
        options = options || {};
        if (typeof options === 'string') {
            options = { separator: options };
        }
    
        var path = chain.split(options.separator || '.');
        var ref = obj;
        for (var i = 0, il = path.length; i < il; ++i) {
            var key = path[i];
            if (key[0] === '-' && Array.isArray(ref)) {
                key = key.slice(1, key.length);
                key = ref.length - key;
            }
    
            if (!ref ||
                !ref.hasOwnProperty(key) ||
                (typeof ref !== 'object' && options.functions === false)) {         // Only object and function can have properties
    
                exports.assert(!options.strict || i + 1 === il, 'Missing segment', key, 'in reach path ', chain);
                exports.assert(typeof ref === 'object' || options.functions === true || typeof ref !== 'function', 'Invalid segment', key, 'in reach path ', chain);
                ref = options.default;
                break;
            }
    
            ref = ref[key];
        }
    
        return ref;
    };
    
    
    exports.reachTemplate = function (obj, template, options) {
    
        return template.replace(/{([^}]+)}/g, function ($0, chain) {
    
            var value = exports.reach(obj, chain, options);
            return (value === undefined || value === null ? '' : value);
        });
    };
    
    
    exports.formatStack = function (stack) {
    
        var trace = [];
        for (var i = 0, il = stack.length; i < il; ++i) {
            var item = stack[i];
            trace.push([item.getFileName(), item.getLineNumber(), item.getColumnNumber(), item.getFunctionName(), item.isConstructor()]);
        }
    
        return trace;
    };
    
    
    exports.formatTrace = function (trace) {
    
        var display = [];
    
        for (var i = 0, il = trace.length; i < il; ++i) {
            var row = trace[i];
            display.push((row[4] ? 'new ' : '') + row[3] + ' (' + row[0] + ':' + row[1] + ':' + row[2] + ')');
        }
    
        return display;
    };
    
    
    exports.callStack = function (slice) {
    
        // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
    
        var v8 = Error.prepareStackTrace;
        Error.prepareStackTrace = function (err, stack) {
    
            return stack;
        };
    
        var capture = {};
        Error.captureStackTrace(capture, arguments.callee);     /*eslint no-caller:0 */
        var stack = capture.stack;
    
        Error.prepareStackTrace = v8;
    
        var trace = exports.formatStack(stack);
    
        if (slice) {
            return trace.slice(slice);
        }
    
        return trace;
    };
    
    
    exports.displayStack = function (slice) {
    
        var trace = exports.callStack(slice === undefined ? 1 : slice + 1);
    
        return exports.formatTrace(trace);
    };
    
    
    exports.abortThrow = false;
    
    
    exports.abort = function (message, hideStack) {
    
        if (process.env.NODE_ENV === 'test' || exports.abortThrow === true) {
            throw new Error(message || 'Unknown error');
        }
    
        var stack = '';
        if (!hideStack) {
            stack = exports.displayStack(1).join('\n\t');
        }
        console.log('ABORT: ' + message + '\n\t' + stack);
        process.exit(1);
    };
    
    
    exports.assert = function (condition /*, msg1, msg2, msg3 */) {
    
        if (condition) {
            return;
        }
    
        if (arguments.length === 2 && arguments[1] instanceof Error) {
            throw arguments[1];
        }
    
        var msgs = [];
        for (var i = 1, il = arguments.length; i < il; ++i) {
            if (arguments[i] !== '') {
                msgs.push(arguments[i]);            // Avoids Array.slice arguments leak, allowing for V8 optimizations
            }
        }
    
        msgs = msgs.map(function (msg) {
    
            return typeof msg === 'string' ? msg : msg instanceof Error ? msg.message : exports.stringify(msg);
        });
        throw new Error(msgs.join(' ') || 'Unknown error');
    };
    
    
    exports.Timer = function () {
    
        this.ts = 0;
        this.reset();
    };
    
    
    exports.Timer.prototype.reset = function () {
    
        this.ts = Date.now();
    };
    
    
    exports.Timer.prototype.elapsed = function () {
    
        return Date.now() - this.ts;
    };
    
    
    exports.Bench = function () {
    
        this.ts = 0;
        this.reset();
    };
    
    
    exports.Bench.prototype.reset = function () {
    
        this.ts = exports.Bench.now();
    };
    
    
    exports.Bench.prototype.elapsed = function () {
    
        return exports.Bench.now() - this.ts;
    };
    
    
    exports.Bench.now = function () {
    
        var ts = process.hrtime();
        return (ts[0] * 1e3) + (ts[1] / 1e6);
    };
    
    
    // Escape string for Regex construction
    
    exports.escapeRegex = function (string) {
    
        // Escape ^$.*+-?=!:|\/()[]{},
        return string.replace(/[\^\$\.\*\+\-\?\=\!\:\|\\\/\(\)\[\]\{\}\,]/g, '\\$&');
    };
    
    
    // Base64url (RFC 4648) encode
    
    exports.base64urlEncode = function (value, encoding) {
    
        var buf = (Buffer.isBuffer(value) ? value : new Buffer(value, encoding || 'binary'));
        return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
    };
    
    
    // Base64url (RFC 4648) decode
    
    exports.base64urlDecode = function (value, encoding) {
    
        if (value &&
            !/^[\w\-]*$/.test(value)) {
    
            return new Error('Invalid character');
        }
    
        try {
            var buf = new Buffer(value, 'base64');
            return (encoding === 'buffer' ? buf : buf.toString(encoding || 'binary'));
        }
        catch (err) {
            return err;
        }
    };
    
    
    // Escape attribute value for use in HTTP header
    
    exports.escapeHeaderAttribute = function (attribute) {
    
        // Allowed value characters: !#$%&'()*+,-./:;<=>?@[]^_`{|}~ and space, a-z, A-Z, 0-9, \, "
    
        exports.assert(/^[ \w\!#\$%&'\(\)\*\+,\-\.\/\:;<\=>\?@\[\]\^`\{\|\}~\"\\]*$/.test(attribute), 'Bad attribute value (' + attribute + ')');
    
        return attribute.replace(/\\/g, '\\\\').replace(/\"/g, '\\"');                             // Escape quotes and slash
    };
    
    
    exports.escapeHtml = function (string) {
    
        return Escape.escapeHtml(string);
    };
    
    
    exports.escapeJavaScript = function (string) {
    
        return Escape.escapeJavaScript(string);
    };
    
    
    exports.nextTick = function (callback) {
    
        return function () {
    
            var args = arguments;
            process.nextTick(function () {
    
                callback.apply(null, args);
            });
        };
    };
    
    
    exports.once = function (method) {
    
        if (method._hoekOnce) {
            return method;
        }
    
        var once = false;
        var wrapped = function () {
    
            if (!once) {
                once = true;
                method.apply(null, arguments);
            }
        };
    
        wrapped._hoekOnce = true;
    
        return wrapped;
    };
    
    
    exports.isAbsolutePath = function (path, platform) {
    
        if (!path) {
            return false;
        }
    
        if (Path.isAbsolute) {                      // node >= 0.11
            return Path.isAbsolute(path);
        }
    
        platform = platform || process.platform;
    
        // Unix
    
        if (platform !== 'win32') {
            return path[0] === '/';
        }
    
        // Windows
    
        return !!/^(?:[a-zA-Z]:[\\\/])|(?:[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/])/.test(path);        // C:\ or \\something\something
    };
    
    
    exports.isInteger = function (value) {
    
        return (typeof value === 'number' &&
                parseFloat(value) === parseInt(value, 10) &&
                !isNaN(value));
    };
    
    
    exports.ignore = function () { };
    
    
    exports.inherits = Util.inherits;
    
    
    exports.format = Util.format;
    
    
    exports.transform = function (source, transform, options) {
    
        exports.assert(source === null || source === undefined || typeof source === 'object', 'Invalid source object: must be null, undefined, or an object');
    
        var result = {};
        var keys = Object.keys(transform);
    
        for (var k = 0, kl = keys.length; k < kl; ++k) {
            var key = keys[k];
            var path = key.split('.');
            var sourcePath = transform[key];
    
            exports.assert(typeof sourcePath === 'string', 'All mappings must be "." delineated strings');
    
            var segment;
            var res = result;
    
            while (path.length > 1) {
                segment = path.shift();
                if (!res[segment]) {
                    res[segment] = {};
                }
                res = res[segment];
            }
            segment = path.shift();
            res[segment] = exports.reach(source, sourcePath, options);
        }
    
        return result;
    };
    
    
    exports.uniqueFilename = function (path, extension) {
    
        if (extension) {
            extension = extension[0] !== '.' ? '.' + extension : extension;
        }
        else {
            extension = '';
        }
    
        path = Path.resolve(path);
        var name = [Date.now(), process.pid, Crypto.randomBytes(8).toString('hex')].join('-') + extension;
        return Path.join(path, name);
    };
    
    
    exports.stringify = function () {
    
        try {
            return JSON.stringify.apply(null, arguments);
        }
        catch (err) {
            return '[Cannot display object: ' + err.message + ']';
        }
    };
    
    
    exports.shallow = function (source) {
    
        var target = {};
        var keys = Object.keys(source);
        for (var i = 0, il = keys.length; i < il; ++i) {
            var key = keys[i];
            target[key] = source[key];
        }
    
        return target;
    };
    
  provide("hoek/lib", module.exports);
}(global));

// pakmanager:hoek
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  module.exports =  require('hoek/lib');
    
  provide("hoek", module.exports);
}(global));

// pakmanager:async
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  /*!
     * async
     * https://github.com/caolan/async
     *
     * Copyright 2010-2014 Caolan McMahon
     * Released under the MIT license
     */
    /*jshint onevar: false, indent:4 */
    /*global setImmediate: false, setTimeout: false, console: false */
    (function () {
    
        var async = {};
    
        // global on the server, window in the browser
        var root, previous_async;
    
        root = this;
        if (root != null) {
          previous_async = root.async;
        }
    
        async.noConflict = function () {
            root.async = previous_async;
            return async;
        };
    
        function only_once(fn) {
            var called = false;
            return function() {
                if (called) throw new Error("Callback was already called.");
                called = true;
                fn.apply(root, arguments);
            }
        }
    
        //// cross-browser compatiblity functions ////
    
        var _toString = Object.prototype.toString;
    
        var _isArray = Array.isArray || function (obj) {
            return _toString.call(obj) === '[object Array]';
        };
    
        var _each = function (arr, iterator) {
            for (var i = 0; i < arr.length; i += 1) {
                iterator(arr[i], i, arr);
            }
        };
    
        var _map = function (arr, iterator) {
            if (arr.map) {
                return arr.map(iterator);
            }
            var results = [];
            _each(arr, function (x, i, a) {
                results.push(iterator(x, i, a));
            });
            return results;
        };
    
        var _reduce = function (arr, iterator, memo) {
            if (arr.reduce) {
                return arr.reduce(iterator, memo);
            }
            _each(arr, function (x, i, a) {
                memo = iterator(memo, x, i, a);
            });
            return memo;
        };
    
        var _keys = function (obj) {
            if (Object.keys) {
                return Object.keys(obj);
            }
            var keys = [];
            for (var k in obj) {
                if (obj.hasOwnProperty(k)) {
                    keys.push(k);
                }
            }
            return keys;
        };
    
        //// exported async module functions ////
    
        //// nextTick implementation with browser-compatible fallback ////
        if (typeof process === 'undefined' || !(process.nextTick)) {
            if (typeof setImmediate === 'function') {
                async.nextTick = function (fn) {
                    // not a direct alias for IE10 compatibility
                    setImmediate(fn);
                };
                async.setImmediate = async.nextTick;
            }
            else {
                async.nextTick = function (fn) {
                    setTimeout(fn, 0);
                };
                async.setImmediate = async.nextTick;
            }
        }
        else {
            async.nextTick = process.nextTick;
            if (typeof setImmediate !== 'undefined') {
                async.setImmediate = function (fn) {
                  // not a direct alias for IE10 compatibility
                  setImmediate(fn);
                };
            }
            else {
                async.setImmediate = async.nextTick;
            }
        }
    
        async.each = function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length) {
                return callback();
            }
            var completed = 0;
            _each(arr, function (x) {
                iterator(x, only_once(done) );
            });
            function done(err) {
              if (err) {
                  callback(err);
                  callback = function () {};
              }
              else {
                  completed += 1;
                  if (completed >= arr.length) {
                      callback();
                  }
              }
            }
        };
        async.forEach = async.each;
    
        async.eachSeries = function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length) {
                return callback();
            }
            var completed = 0;
            var iterate = function () {
                iterator(arr[completed], function (err) {
                    if (err) {
                        callback(err);
                        callback = function () {};
                    }
                    else {
                        completed += 1;
                        if (completed >= arr.length) {
                            callback();
                        }
                        else {
                            iterate();
                        }
                    }
                });
            };
            iterate();
        };
        async.forEachSeries = async.eachSeries;
    
        async.eachLimit = function (arr, limit, iterator, callback) {
            var fn = _eachLimit(limit);
            fn.apply(null, [arr, iterator, callback]);
        };
        async.forEachLimit = async.eachLimit;
    
        var _eachLimit = function (limit) {
    
            return function (arr, iterator, callback) {
                callback = callback || function () {};
                if (!arr.length || limit <= 0) {
                    return callback();
                }
                var completed = 0;
                var started = 0;
                var running = 0;
    
                (function replenish () {
                    if (completed >= arr.length) {
                        return callback();
                    }
    
                    while (running < limit && started < arr.length) {
                        started += 1;
                        running += 1;
                        iterator(arr[started - 1], function (err) {
                            if (err) {
                                callback(err);
                                callback = function () {};
                            }
                            else {
                                completed += 1;
                                running -= 1;
                                if (completed >= arr.length) {
                                    callback();
                                }
                                else {
                                    replenish();
                                }
                            }
                        });
                    }
                })();
            };
        };
    
    
        var doParallel = function (fn) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [async.each].concat(args));
            };
        };
        var doParallelLimit = function(limit, fn) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [_eachLimit(limit)].concat(args));
            };
        };
        var doSeries = function (fn) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return fn.apply(null, [async.eachSeries].concat(args));
            };
        };
    
    
        var _asyncMap = function (eachfn, arr, iterator, callback) {
            arr = _map(arr, function (x, i) {
                return {index: i, value: x};
            });
            if (!callback) {
                eachfn(arr, function (x, callback) {
                    iterator(x.value, function (err) {
                        callback(err);
                    });
                });
            } else {
                var results = [];
                eachfn(arr, function (x, callback) {
                    iterator(x.value, function (err, v) {
                        results[x.index] = v;
                        callback(err);
                    });
                }, function (err) {
                    callback(err, results);
                });
            }
        };
        async.map = doParallel(_asyncMap);
        async.mapSeries = doSeries(_asyncMap);
        async.mapLimit = function (arr, limit, iterator, callback) {
            return _mapLimit(limit)(arr, iterator, callback);
        };
    
        var _mapLimit = function(limit) {
            return doParallelLimit(limit, _asyncMap);
        };
    
        // reduce only has a series version, as doing reduce in parallel won't
        // work in many situations.
        async.reduce = function (arr, memo, iterator, callback) {
            async.eachSeries(arr, function (x, callback) {
                iterator(memo, x, function (err, v) {
                    memo = v;
                    callback(err);
                });
            }, function (err) {
                callback(err, memo);
            });
        };
        // inject alias
        async.inject = async.reduce;
        // foldl alias
        async.foldl = async.reduce;
    
        async.reduceRight = function (arr, memo, iterator, callback) {
            var reversed = _map(arr, function (x) {
                return x;
            }).reverse();
            async.reduce(reversed, memo, iterator, callback);
        };
        // foldr alias
        async.foldr = async.reduceRight;
    
        var _filter = function (eachfn, arr, iterator, callback) {
            var results = [];
            arr = _map(arr, function (x, i) {
                return {index: i, value: x};
            });
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (v) {
                    if (v) {
                        results.push(x);
                    }
                    callback();
                });
            }, function (err) {
                callback(_map(results.sort(function (a, b) {
                    return a.index - b.index;
                }), function (x) {
                    return x.value;
                }));
            });
        };
        async.filter = doParallel(_filter);
        async.filterSeries = doSeries(_filter);
        // select alias
        async.select = async.filter;
        async.selectSeries = async.filterSeries;
    
        var _reject = function (eachfn, arr, iterator, callback) {
            var results = [];
            arr = _map(arr, function (x, i) {
                return {index: i, value: x};
            });
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (v) {
                    if (!v) {
                        results.push(x);
                    }
                    callback();
                });
            }, function (err) {
                callback(_map(results.sort(function (a, b) {
                    return a.index - b.index;
                }), function (x) {
                    return x.value;
                }));
            });
        };
        async.reject = doParallel(_reject);
        async.rejectSeries = doSeries(_reject);
    
        var _detect = function (eachfn, arr, iterator, main_callback) {
            eachfn(arr, function (x, callback) {
                iterator(x, function (result) {
                    if (result) {
                        main_callback(x);
                        main_callback = function () {};
                    }
                    else {
                        callback();
                    }
                });
            }, function (err) {
                main_callback();
            });
        };
        async.detect = doParallel(_detect);
        async.detectSeries = doSeries(_detect);
    
        async.some = function (arr, iterator, main_callback) {
            async.each(arr, function (x, callback) {
                iterator(x, function (v) {
                    if (v) {
                        main_callback(true);
                        main_callback = function () {};
                    }
                    callback();
                });
            }, function (err) {
                main_callback(false);
            });
        };
        // any alias
        async.any = async.some;
    
        async.every = function (arr, iterator, main_callback) {
            async.each(arr, function (x, callback) {
                iterator(x, function (v) {
                    if (!v) {
                        main_callback(false);
                        main_callback = function () {};
                    }
                    callback();
                });
            }, function (err) {
                main_callback(true);
            });
        };
        // all alias
        async.all = async.every;
    
        async.sortBy = function (arr, iterator, callback) {
            async.map(arr, function (x, callback) {
                iterator(x, function (err, criteria) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, {value: x, criteria: criteria});
                    }
                });
            }, function (err, results) {
                if (err) {
                    return callback(err);
                }
                else {
                    var fn = function (left, right) {
                        var a = left.criteria, b = right.criteria;
                        return a < b ? -1 : a > b ? 1 : 0;
                    };
                    callback(null, _map(results.sort(fn), function (x) {
                        return x.value;
                    }));
                }
            });
        };
    
        async.auto = function (tasks, callback) {
            callback = callback || function () {};
            var keys = _keys(tasks);
            var remainingTasks = keys.length
            if (!remainingTasks) {
                return callback();
            }
    
            var results = {};
    
            var listeners = [];
            var addListener = function (fn) {
                listeners.unshift(fn);
            };
            var removeListener = function (fn) {
                for (var i = 0; i < listeners.length; i += 1) {
                    if (listeners[i] === fn) {
                        listeners.splice(i, 1);
                        return;
                    }
                }
            };
            var taskComplete = function () {
                remainingTasks--
                _each(listeners.slice(0), function (fn) {
                    fn();
                });
            };
    
            addListener(function () {
                if (!remainingTasks) {
                    var theCallback = callback;
                    // prevent final callback from calling itself if it errors
                    callback = function () {};
    
                    theCallback(null, results);
                }
            });
    
            _each(keys, function (k) {
                var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
                var taskCallback = function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    if (err) {
                        var safeResults = {};
                        _each(_keys(results), function(rkey) {
                            safeResults[rkey] = results[rkey];
                        });
                        safeResults[k] = args;
                        callback(err, safeResults);
                        // stop subsequent errors hitting callback multiple times
                        callback = function () {};
                    }
                    else {
                        results[k] = args;
                        async.setImmediate(taskComplete);
                    }
                };
                var requires = task.slice(0, Math.abs(task.length - 1)) || [];
                var ready = function () {
                    return _reduce(requires, function (a, x) {
                        return (a && results.hasOwnProperty(x));
                    }, true) && !results.hasOwnProperty(k);
                };
                if (ready()) {
                    task[task.length - 1](taskCallback, results);
                }
                else {
                    var listener = function () {
                        if (ready()) {
                            removeListener(listener);
                            task[task.length - 1](taskCallback, results);
                        }
                    };
                    addListener(listener);
                }
            });
        };
    
        async.retry = function(times, task, callback) {
            var DEFAULT_TIMES = 5;
            var attempts = [];
            // Use defaults if times not passed
            if (typeof times === 'function') {
                callback = task;
                task = times;
                times = DEFAULT_TIMES;
            }
            // Make sure times is a number
            times = parseInt(times, 10) || DEFAULT_TIMES;
            var wrappedTask = function(wrappedCallback, wrappedResults) {
                var retryAttempt = function(task, finalAttempt) {
                    return function(seriesCallback) {
                        task(function(err, result){
                            seriesCallback(!err || finalAttempt, {err: err, result: result});
                        }, wrappedResults);
                    };
                };
                while (times) {
                    attempts.push(retryAttempt(task, !(times-=1)));
                }
                async.series(attempts, function(done, data){
                    data = data[data.length - 1];
                    (wrappedCallback || callback)(data.err, data.result);
                });
            }
            // If a callback is passed, run this as a controll flow
            return callback ? wrappedTask() : wrappedTask
        };
    
        async.waterfall = function (tasks, callback) {
            callback = callback || function () {};
            if (!_isArray(tasks)) {
              var err = new Error('First argument to waterfall must be an array of functions');
              return callback(err);
            }
            if (!tasks.length) {
                return callback();
            }
            var wrapIterator = function (iterator) {
                return function (err) {
                    if (err) {
                        callback.apply(null, arguments);
                        callback = function () {};
                    }
                    else {
                        var args = Array.prototype.slice.call(arguments, 1);
                        var next = iterator.next();
                        if (next) {
                            args.push(wrapIterator(next));
                        }
                        else {
                            args.push(callback);
                        }
                        async.setImmediate(function () {
                            iterator.apply(null, args);
                        });
                    }
                };
            };
            wrapIterator(async.iterator(tasks))();
        };
    
        var _parallel = function(eachfn, tasks, callback) {
            callback = callback || function () {};
            if (_isArray(tasks)) {
                eachfn.map(tasks, function (fn, callback) {
                    if (fn) {
                        fn(function (err) {
                            var args = Array.prototype.slice.call(arguments, 1);
                            if (args.length <= 1) {
                                args = args[0];
                            }
                            callback.call(null, err, args);
                        });
                    }
                }, callback);
            }
            else {
                var results = {};
                eachfn.each(_keys(tasks), function (k, callback) {
                    tasks[k](function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        results[k] = args;
                        callback(err);
                    });
                }, function (err) {
                    callback(err, results);
                });
            }
        };
    
        async.parallel = function (tasks, callback) {
            _parallel({ map: async.map, each: async.each }, tasks, callback);
        };
    
        async.parallelLimit = function(tasks, limit, callback) {
            _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
        };
    
        async.series = function (tasks, callback) {
            callback = callback || function () {};
            if (_isArray(tasks)) {
                async.mapSeries(tasks, function (fn, callback) {
                    if (fn) {
                        fn(function (err) {
                            var args = Array.prototype.slice.call(arguments, 1);
                            if (args.length <= 1) {
                                args = args[0];
                            }
                            callback.call(null, err, args);
                        });
                    }
                }, callback);
            }
            else {
                var results = {};
                async.eachSeries(_keys(tasks), function (k, callback) {
                    tasks[k](function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        results[k] = args;
                        callback(err);
                    });
                }, function (err) {
                    callback(err, results);
                });
            }
        };
    
        async.iterator = function (tasks) {
            var makeCallback = function (index) {
                var fn = function () {
                    if (tasks.length) {
                        tasks[index].apply(null, arguments);
                    }
                    return fn.next();
                };
                fn.next = function () {
                    return (index < tasks.length - 1) ? makeCallback(index + 1): null;
                };
                return fn;
            };
            return makeCallback(0);
        };
    
        async.apply = function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            return function () {
                return fn.apply(
                    null, args.concat(Array.prototype.slice.call(arguments))
                );
            };
        };
    
        var _concat = function (eachfn, arr, fn, callback) {
            var r = [];
            eachfn(arr, function (x, cb) {
                fn(x, function (err, y) {
                    r = r.concat(y || []);
                    cb(err);
                });
            }, function (err) {
                callback(err, r);
            });
        };
        async.concat = doParallel(_concat);
        async.concatSeries = doSeries(_concat);
    
        async.whilst = function (test, iterator, callback) {
            if (test()) {
                iterator(function (err) {
                    if (err) {
                        return callback(err);
                    }
                    async.whilst(test, iterator, callback);
                });
            }
            else {
                callback();
            }
        };
    
        async.doWhilst = function (iterator, test, callback) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                var args = Array.prototype.slice.call(arguments, 1);
                if (test.apply(null, args)) {
                    async.doWhilst(iterator, test, callback);
                }
                else {
                    callback();
                }
            });
        };
    
        async.until = function (test, iterator, callback) {
            if (!test()) {
                iterator(function (err) {
                    if (err) {
                        return callback(err);
                    }
                    async.until(test, iterator, callback);
                });
            }
            else {
                callback();
            }
        };
    
        async.doUntil = function (iterator, test, callback) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                var args = Array.prototype.slice.call(arguments, 1);
                if (!test.apply(null, args)) {
                    async.doUntil(iterator, test, callback);
                }
                else {
                    callback();
                }
            });
        };
    
        async.queue = function (worker, concurrency) {
            if (concurrency === undefined) {
                concurrency = 1;
            }
            function _insert(q, data, pos, callback) {
              if (!q.started){
                q.started = true;
              }
              if (!_isArray(data)) {
                  data = [data];
              }
              if(data.length == 0) {
                 // call drain immediately if there are no tasks
                 return async.setImmediate(function() {
                     if (q.drain) {
                         q.drain();
                     }
                 });
              }
              _each(data, function(task) {
                  var item = {
                      data: task,
                      callback: typeof callback === 'function' ? callback : null
                  };
    
                  if (pos) {
                    q.tasks.unshift(item);
                  } else {
                    q.tasks.push(item);
                  }
    
                  if (q.saturated && q.tasks.length === q.concurrency) {
                      q.saturated();
                  }
                  async.setImmediate(q.process);
              });
            }
    
            var workers = 0;
            var q = {
                tasks: [],
                concurrency: concurrency,
                saturated: null,
                empty: null,
                drain: null,
                started: false,
                paused: false,
                push: function (data, callback) {
                  _insert(q, data, false, callback);
                },
                kill: function () {
                  q.drain = null;
                  q.tasks = [];
                },
                unshift: function (data, callback) {
                  _insert(q, data, true, callback);
                },
                process: function () {
                    if (!q.paused && workers < q.concurrency && q.tasks.length) {
                        var task = q.tasks.shift();
                        if (q.empty && q.tasks.length === 0) {
                            q.empty();
                        }
                        workers += 1;
                        var next = function () {
                            workers -= 1;
                            if (task.callback) {
                                task.callback.apply(task, arguments);
                            }
                            if (q.drain && q.tasks.length + workers === 0) {
                                q.drain();
                            }
                            q.process();
                        };
                        var cb = only_once(next);
                        worker(task.data, cb);
                    }
                },
                length: function () {
                    return q.tasks.length;
                },
                running: function () {
                    return workers;
                },
                idle: function() {
                    return q.tasks.length + workers === 0;
                },
                pause: function () {
                    if (q.paused === true) { return; }
                    q.paused = true;
                },
                resume: function () {
                    if (q.paused === false) { return; }
                    q.paused = false;
                    // Need to call q.process once per concurrent
                    // worker to preserve full concurrency after pause
                    for (var w = 1; w <= q.concurrency; w++) {
                        async.setImmediate(q.process);
                    }
                }
            };
            return q;
        };
    
        async.priorityQueue = function (worker, concurrency) {
    
            function _compareTasks(a, b){
              return a.priority - b.priority;
            };
    
            function _binarySearch(sequence, item, compare) {
              var beg = -1,
                  end = sequence.length - 1;
              while (beg < end) {
                var mid = beg + ((end - beg + 1) >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                  beg = mid;
                } else {
                  end = mid - 1;
                }
              }
              return beg;
            }
    
            function _insert(q, data, priority, callback) {
              if (!q.started){
                q.started = true;
              }
              if (!_isArray(data)) {
                  data = [data];
              }
              if(data.length == 0) {
                 // call drain immediately if there are no tasks
                 return async.setImmediate(function() {
                     if (q.drain) {
                         q.drain();
                     }
                 });
              }
              _each(data, function(task) {
                  var item = {
                      data: task,
                      priority: priority,
                      callback: typeof callback === 'function' ? callback : null
                  };
    
                  q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);
    
                  if (q.saturated && q.tasks.length === q.concurrency) {
                      q.saturated();
                  }
                  async.setImmediate(q.process);
              });
            }
    
            // Start with a normal queue
            var q = async.queue(worker, concurrency);
    
            // Override push to accept second parameter representing priority
            q.push = function (data, priority, callback) {
              _insert(q, data, priority, callback);
            };
    
            // Remove unshift function
            delete q.unshift;
    
            return q;
        };
    
        async.cargo = function (worker, payload) {
            var working     = false,
                tasks       = [];
    
            var cargo = {
                tasks: tasks,
                payload: payload,
                saturated: null,
                empty: null,
                drain: null,
                drained: true,
                push: function (data, callback) {
                    if (!_isArray(data)) {
                        data = [data];
                    }
                    _each(data, function(task) {
                        tasks.push({
                            data: task,
                            callback: typeof callback === 'function' ? callback : null
                        });
                        cargo.drained = false;
                        if (cargo.saturated && tasks.length === payload) {
                            cargo.saturated();
                        }
                    });
                    async.setImmediate(cargo.process);
                },
                process: function process() {
                    if (working) return;
                    if (tasks.length === 0) {
                        if(cargo.drain && !cargo.drained) cargo.drain();
                        cargo.drained = true;
                        return;
                    }
    
                    var ts = typeof payload === 'number'
                                ? tasks.splice(0, payload)
                                : tasks.splice(0, tasks.length);
    
                    var ds = _map(ts, function (task) {
                        return task.data;
                    });
    
                    if(cargo.empty) cargo.empty();
                    working = true;
                    worker(ds, function () {
                        working = false;
    
                        var args = arguments;
                        _each(ts, function (data) {
                            if (data.callback) {
                                data.callback.apply(null, args);
                            }
                        });
    
                        process();
                    });
                },
                length: function () {
                    return tasks.length;
                },
                running: function () {
                    return working;
                }
            };
            return cargo;
        };
    
        var _console_fn = function (name) {
            return function (fn) {
                var args = Array.prototype.slice.call(arguments, 1);
                fn.apply(null, args.concat([function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (typeof console !== 'undefined') {
                        if (err) {
                            if (console.error) {
                                console.error(err);
                            }
                        }
                        else if (console[name]) {
                            _each(args, function (x) {
                                console[name](x);
                            });
                        }
                    }
                }]));
            };
        };
        async.log = _console_fn('log');
        async.dir = _console_fn('dir');
        /*async.info = _console_fn('info');
        async.warn = _console_fn('warn');
        async.error = _console_fn('error');*/
    
        async.memoize = function (fn, hasher) {
            var memo = {};
            var queues = {};
            hasher = hasher || function (x) {
                return x;
            };
            var memoized = function () {
                var args = Array.prototype.slice.call(arguments);
                var callback = args.pop();
                var key = hasher.apply(null, args);
                if (key in memo) {
                    async.nextTick(function () {
                        callback.apply(null, memo[key]);
                    });
                }
                else if (key in queues) {
                    queues[key].push(callback);
                }
                else {
                    queues[key] = [callback];
                    fn.apply(null, args.concat([function () {
                        memo[key] = arguments;
                        var q = queues[key];
                        delete queues[key];
                        for (var i = 0, l = q.length; i < l; i++) {
                          q[i].apply(null, arguments);
                        }
                    }]));
                }
            };
            memoized.memo = memo;
            memoized.unmemoized = fn;
            return memoized;
        };
    
        async.unmemoize = function (fn) {
          return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
          };
        };
    
        async.times = function (count, iterator, callback) {
            var counter = [];
            for (var i = 0; i < count; i++) {
                counter.push(i);
            }
            return async.map(counter, iterator, callback);
        };
    
        async.timesSeries = function (count, iterator, callback) {
            var counter = [];
            for (var i = 0; i < count; i++) {
                counter.push(i);
            }
            return async.mapSeries(counter, iterator, callback);
        };
    
        async.seq = function (/* functions... */) {
            var fns = arguments;
            return function () {
                var that = this;
                var args = Array.prototype.slice.call(arguments);
                var callback = args.pop();
                async.reduce(fns, args, function (newargs, fn, cb) {
                    fn.apply(that, newargs.concat([function () {
                        var err = arguments[0];
                        var nextargs = Array.prototype.slice.call(arguments, 1);
                        cb(err, nextargs);
                    }]))
                },
                function (err, results) {
                    callback.apply(that, [err].concat(results));
                });
            };
        };
    
        async.compose = function (/* functions... */) {
          return async.seq.apply(null, Array.prototype.reverse.call(arguments));
        };
    
        var _applyEach = function (eachfn, fns /*args...*/) {
            var go = function () {
                var that = this;
                var args = Array.prototype.slice.call(arguments);
                var callback = args.pop();
                return eachfn(fns, function (fn, cb) {
                    fn.apply(that, args.concat([cb]));
                },
                callback);
            };
            if (arguments.length > 2) {
                var args = Array.prototype.slice.call(arguments, 2);
                return go.apply(this, args);
            }
            else {
                return go;
            }
        };
        async.applyEach = doParallel(_applyEach);
        async.applyEachSeries = doSeries(_applyEach);
    
        async.forever = function (fn, callback) {
            function next(err) {
                if (err) {
                    if (callback) {
                        return callback(err);
                    }
                    throw err;
                }
                fn(next);
            }
            next();
        };
    
        // Node.js
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = async;
        }
        // AMD / RequireJS
        else if (typeof define !== 'undefined' && define.amd) {
            define([], function () {
                return async;
            });
        }
        // included directly via <script> tag
        else {
            root.async = async;
        }
    
    }());
    
  provide("async", module.exports);
}(global));

// pakmanager:boom
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  // Load modules
    
    var Http = require('http');
    var Hoek = require('hoek');
    
    
    // Declare internals
    
    var internals = {};
    
    
    exports.wrap = function (error, statusCode, message) {
    
        Hoek.assert(error instanceof Error, 'Cannot wrap non-Error object');
        return (error.isBoom ? error : internals.initialize(error, statusCode || 500, message));
    };
    
    
    exports.create = function (statusCode, message, data) {
    
        var error = new Error(message ? message : undefined);       // Avoids settings null message
        error.data = data || null;
        internals.initialize(error, statusCode);
        return error;
    };
    
    
    internals.initialize = function (error, statusCode, message) {
    
        var numberCode = parseInt(statusCode, 10);
        Hoek.assert(!isNaN(numberCode) && numberCode >= 400, 'First argument must be a number (400+):', statusCode);
    
        error.isBoom = true;
        error.isServer = numberCode >= 500;
    
        if (!error.hasOwnProperty('data')) {
            error.data = null;
        }
    
        error.output = {
            statusCode: numberCode,
            payload: {},
            headers: {}
        };
    
        error.reformat = internals.reformat;
        error.reformat();
    
        if (!message &&
            !error.message) {
    
            message = error.output.payload.error;
        }
    
        if (message) {
            error.message = (message + (error.message ? ': ' + error.message : ''));
        }
    
        return error;
    };
    
    
    internals.reformat = function () {
    
        this.output.payload.statusCode = this.output.statusCode;
        this.output.payload.error = Http.STATUS_CODES[this.output.statusCode] || 'Unknown';
    
        if (this.output.statusCode === 500) {
            this.output.payload.message = 'An internal server error occurred';              // Hide actual error from user
        }
        else if (this.message) {
            this.output.payload.message = this.message;
        }
    };
    
    
    // 4xx Client Errors
    
    exports.badRequest = function (message, data) {
    
        return exports.create(400, message, data);
    };
    
    
    exports.unauthorized = function (message, scheme, attributes) {          // Or function (message, wwwAuthenticate[])
    
        var err = exports.create(401, message);
    
        if (!scheme) {
            return err;
        }
    
        var wwwAuthenticate = '';
        var i = 0;
        var il = 0;
    
        if (typeof scheme === 'string') {
    
            // function (message, scheme, attributes)
    
            wwwAuthenticate = scheme;
    
            if (attributes || message) {
                err.output.payload.attributes = {};
            }
    
            if (attributes) {
                var names = Object.keys(attributes);
                for (i = 0, il = names.length; i < il; ++i) {
                    var name = names[i];
                    if (i) {
                        wwwAuthenticate += ',';
                    }
    
                    var value = attributes[name];
                    if (value === null ||
                        value === undefined) {              // Value can be zero
    
                        value = '';
                    }
                    wwwAuthenticate += ' ' + name + '="' + Hoek.escapeHeaderAttribute(value.toString()) + '"';
                    err.output.payload.attributes[name] = value;
                }
            }
    
            if (message) {
                if (attributes) {
                    wwwAuthenticate += ',';
                }
                wwwAuthenticate += ' error="' + Hoek.escapeHeaderAttribute(message) + '"';
                err.output.payload.attributes.error = message;
            }
            else {
                err.isMissing = true;
            }
        }
        else {
    
            // function (message, wwwAuthenticate[])
    
            var wwwArray = scheme;
            for (i = 0, il = wwwArray.length; i < il; ++i) {
                if (i) {
                    wwwAuthenticate += ', ';
                }
    
                wwwAuthenticate += wwwArray[i];
            }
        }
    
        err.output.headers['WWW-Authenticate'] = wwwAuthenticate;
    
        return err;
    };
    
    
    exports.forbidden = function (message, data) {
    
        return exports.create(403, message, data);
    };
    
    
    exports.notFound = function (message, data) {
    
        return exports.create(404, message, data);
    };
    
    
    exports.methodNotAllowed = function (message, data) {
    
        return exports.create(405, message, data);
    };
    
    
    exports.notAcceptable = function (message, data) {
    
        return exports.create(406, message, data);
    };
    
    
    exports.proxyAuthRequired = function (message, data) {
    
        return exports.create(407, message, data);
    };
    
    
    exports.clientTimeout = function (message, data) {
    
        return exports.create(408, message, data);
    };
    
    
    exports.conflict = function (message, data) {
    
        return exports.create(409, message, data);
    };
    
    
    exports.resourceGone = function (message, data) {
    
        return exports.create(410, message, data);
    };
    
    
    exports.lengthRequired = function (message, data) {
    
        return exports.create(411, message, data);
    };
    
    
    exports.preconditionFailed = function (message, data) {
    
        return exports.create(412, message, data);
    };
    
    
    exports.entityTooLarge = function (message, data) {
    
        return exports.create(413, message, data);
    };
    
    
    exports.uriTooLong = function (message, data) {
    
        return exports.create(414, message, data);
    };
    
    
    exports.unsupportedMediaType = function (message, data) {
    
        return exports.create(415, message, data);
    };
    
    
    exports.rangeNotSatisfiable = function (message, data) {
    
        return exports.create(416, message, data);
    };
    
    
    exports.expectationFailed = function (message, data) {
    
        return exports.create(417, message, data);
    };
    
    exports.badData = function (message, data) {
    
        return exports.create(422, message, data);
    };
    
    
    exports.tooManyRequests = function (message, data) {
    
        return exports.create(429, message, data);
    };
    
    
    // 5xx Server Errors
    
    exports.internal = function (message, data, statusCode) {
    
        var error = (data instanceof Error ? exports.wrap(data, statusCode, message) : exports.create(statusCode || 500, message));
    
        if (data instanceof Error === false) {
            error.data = data;
        }
    
        return error;
    };
    
    
    exports.notImplemented = function (message, data) {
    
        return exports.internal(message, data, 501);
    };
    
    
    exports.badGateway = function (message, data) {
    
        return exports.internal(message, data, 502);
    };
    
    
    exports.serverTimeout = function (message, data) {
    
        return exports.internal(message, data, 503);
    };
    
    
    exports.gatewayTimeout = function (message, data) {
    
        return exports.internal(message, data, 504);
    };
    
    
    exports.badImplementation = function (message, data) {
    
        var err = exports.internal(message, data, 500);
        err.isDeveloperError = true;
        return err;
    };
    
  provide("boom", module.exports);
}(global));

// pakmanager:hapi-next
(function (context) {
  
  var module = { exports: {} }, exports = module.exports
    , $ = require("ender")
    ;
  
  var async = require('async'),
    	boom = require('boom'),
    	defaultData = {'success' : true};
    
    function Series(arr) {
    	this.arr = arr;
    }
    
    function Validate(arr) {
    	var len = arr.length;
    	while(len--) {
    		if(typeof arr[len] !== 'function') {
    			throw new Error('')
    		}
    	}
    }
    
    Series.prototype.execute = function(request,reply) {
    	
    	if(!request) {
    		throw new Error('Request can\'t be empty.');
    		return;
    	}
    
    	if(!reply) {
    		throw new Error('Reply can\'t be empty.');
    		return;
    	}
    
    	var arr = this.arr;
    
    	async.series(arr.map(function(func) {
    		return function(cb) {
    
    			func.call({},request,reply,function(err) {
    				
    				if(err) {
    					return cb(err);
    				}
    
    				cb();
    			});
    
    		}
    	}),function(err,results) {
    		
    		if(err) {
    			reply(boom.badData(err));
    		}
    
    		reply.data = reply.data || defaultData;
    		reply(reply.data);
    	});
    };
    
    module.exports = Series;
  provide("hapi-next", module.exports);
}(global));