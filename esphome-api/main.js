var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@protobuf-ts/runtime/build/commonjs/json-typings.js
var require_json_typings = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/json-typings.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isJsonObject = exports2.typeofJsonValue = void 0;
    function typeofJsonValue(value) {
      let t = typeof value;
      if (t == "object") {
        if (Array.isArray(value))
          return "array";
        if (value === null)
          return "null";
      }
      return t;
    }
    exports2.typeofJsonValue = typeofJsonValue;
    function isJsonObject(value) {
      return value !== null && typeof value == "object" && !Array.isArray(value);
    }
    exports2.isJsonObject = isJsonObject;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/base64.js
var require_base64 = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/base64.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.base64encode = exports2.base64decode = void 0;
    var encTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
    var decTable = [];
    for (let i = 0; i < encTable.length; i++)
      decTable[encTable[i].charCodeAt(0)] = i;
    decTable["-".charCodeAt(0)] = encTable.indexOf("+");
    decTable["_".charCodeAt(0)] = encTable.indexOf("/");
    function base64decode(base64Str) {
      let es = base64Str.length * 3 / 4;
      if (base64Str[base64Str.length - 2] == "=")
        es -= 2;
      else if (base64Str[base64Str.length - 1] == "=")
        es -= 1;
      let bytes = new Uint8Array(es), bytePos = 0, groupPos = 0, b, p = 0;
      for (let i = 0; i < base64Str.length; i++) {
        b = decTable[base64Str.charCodeAt(i)];
        if (b === void 0) {
          switch (base64Str[i]) {
            case "=":
              groupPos = 0;
            // reset state when padding found
            case "\n":
            case "\r":
            case "	":
            case " ":
              continue;
            // skip white-space, and padding
            default:
              throw Error(`invalid base64 string.`);
          }
        }
        switch (groupPos) {
          case 0:
            p = b;
            groupPos = 1;
            break;
          case 1:
            bytes[bytePos++] = p << 2 | (b & 48) >> 4;
            p = b;
            groupPos = 2;
            break;
          case 2:
            bytes[bytePos++] = (p & 15) << 4 | (b & 60) >> 2;
            p = b;
            groupPos = 3;
            break;
          case 3:
            bytes[bytePos++] = (p & 3) << 6 | b;
            groupPos = 0;
            break;
        }
      }
      if (groupPos == 1)
        throw Error(`invalid base64 string.`);
      return bytes.subarray(0, bytePos);
    }
    exports2.base64decode = base64decode;
    function base64encode(bytes) {
      let base64 = "", groupPos = 0, b, p = 0;
      for (let i = 0; i < bytes.length; i++) {
        b = bytes[i];
        switch (groupPos) {
          case 0:
            base64 += encTable[b >> 2];
            p = (b & 3) << 4;
            groupPos = 1;
            break;
          case 1:
            base64 += encTable[p | b >> 4];
            p = (b & 15) << 2;
            groupPos = 2;
            break;
          case 2:
            base64 += encTable[p | b >> 6];
            base64 += encTable[b & 63];
            groupPos = 0;
            break;
        }
      }
      if (groupPos) {
        base64 += encTable[p];
        base64 += "=";
        if (groupPos == 1)
          base64 += "=";
      }
      return base64;
    }
    exports2.base64encode = base64encode;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/protobufjs-utf8.js
var require_protobufjs_utf8 = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/protobufjs-utf8.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.utf8read = void 0;
    var fromCharCodes = (chunk) => String.fromCharCode.apply(String, chunk);
    function utf8read(bytes) {
      if (bytes.length < 1)
        return "";
      let pos = 0, parts = [], chunk = [], i = 0, t;
      let len = bytes.length;
      while (pos < len) {
        t = bytes[pos++];
        if (t < 128)
          chunk[i++] = t;
        else if (t > 191 && t < 224)
          chunk[i++] = (t & 31) << 6 | bytes[pos++] & 63;
        else if (t > 239 && t < 365) {
          t = ((t & 7) << 18 | (bytes[pos++] & 63) << 12 | (bytes[pos++] & 63) << 6 | bytes[pos++] & 63) - 65536;
          chunk[i++] = 55296 + (t >> 10);
          chunk[i++] = 56320 + (t & 1023);
        } else
          chunk[i++] = (t & 15) << 12 | (bytes[pos++] & 63) << 6 | bytes[pos++] & 63;
        if (i > 8191) {
          parts.push(fromCharCodes(chunk));
          i = 0;
        }
      }
      if (parts.length) {
        if (i)
          parts.push(fromCharCodes(chunk.slice(0, i)));
        return parts.join("");
      }
      return fromCharCodes(chunk.slice(0, i));
    }
    exports2.utf8read = utf8read;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/binary-format-contract.js
var require_binary_format_contract = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/binary-format-contract.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WireType = exports2.mergeBinaryOptions = exports2.UnknownFieldHandler = void 0;
    var UnknownFieldHandler3;
    (function(UnknownFieldHandler4) {
      UnknownFieldHandler4.symbol = /* @__PURE__ */ Symbol.for("protobuf-ts/unknown");
      UnknownFieldHandler4.onRead = (typeName, message, fieldNo, wireType, data) => {
        let container = is(message) ? message[UnknownFieldHandler4.symbol] : message[UnknownFieldHandler4.symbol] = [];
        container.push({ no: fieldNo, wireType, data });
      };
      UnknownFieldHandler4.onWrite = (typeName, message, writer) => {
        for (let { no, wireType, data } of UnknownFieldHandler4.list(message))
          writer.tag(no, wireType).raw(data);
      };
      UnknownFieldHandler4.list = (message, fieldNo) => {
        if (is(message)) {
          let all = message[UnknownFieldHandler4.symbol];
          return fieldNo ? all.filter((uf) => uf.no == fieldNo) : all;
        }
        return [];
      };
      UnknownFieldHandler4.last = (message, fieldNo) => UnknownFieldHandler4.list(message, fieldNo).slice(-1)[0];
      const is = (message) => message && Array.isArray(message[UnknownFieldHandler4.symbol]);
    })(UnknownFieldHandler3 = exports2.UnknownFieldHandler || (exports2.UnknownFieldHandler = {}));
    function mergeBinaryOptions(a, b) {
      return Object.assign(Object.assign({}, a), b);
    }
    exports2.mergeBinaryOptions = mergeBinaryOptions;
    var WireType2;
    (function(WireType3) {
      WireType3[WireType3["Varint"] = 0] = "Varint";
      WireType3[WireType3["Bit64"] = 1] = "Bit64";
      WireType3[WireType3["LengthDelimited"] = 2] = "LengthDelimited";
      WireType3[WireType3["StartGroup"] = 3] = "StartGroup";
      WireType3[WireType3["EndGroup"] = 4] = "EndGroup";
      WireType3[WireType3["Bit32"] = 5] = "Bit32";
    })(WireType2 = exports2.WireType || (exports2.WireType = {}));
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/goog-varint.js
var require_goog_varint = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/goog-varint.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.varint32read = exports2.varint32write = exports2.int64toString = exports2.int64fromString = exports2.varint64write = exports2.varint64read = void 0;
    function varint64read() {
      let lowBits = 0;
      let highBits = 0;
      for (let shift = 0; shift < 28; shift += 7) {
        let b = this.buf[this.pos++];
        lowBits |= (b & 127) << shift;
        if ((b & 128) == 0) {
          this.assertBounds();
          return [lowBits, highBits];
        }
      }
      let middleByte = this.buf[this.pos++];
      lowBits |= (middleByte & 15) << 28;
      highBits = (middleByte & 112) >> 4;
      if ((middleByte & 128) == 0) {
        this.assertBounds();
        return [lowBits, highBits];
      }
      for (let shift = 3; shift <= 31; shift += 7) {
        let b = this.buf[this.pos++];
        highBits |= (b & 127) << shift;
        if ((b & 128) == 0) {
          this.assertBounds();
          return [lowBits, highBits];
        }
      }
      throw new Error("invalid varint");
    }
    exports2.varint64read = varint64read;
    function varint64write(lo, hi, bytes) {
      for (let i = 0; i < 28; i = i + 7) {
        const shift = lo >>> i;
        const hasNext = !(shift >>> 7 == 0 && hi == 0);
        const byte = (hasNext ? shift | 128 : shift) & 255;
        bytes.push(byte);
        if (!hasNext) {
          return;
        }
      }
      const splitBits = lo >>> 28 & 15 | (hi & 7) << 4;
      const hasMoreBits = !(hi >> 3 == 0);
      bytes.push((hasMoreBits ? splitBits | 128 : splitBits) & 255);
      if (!hasMoreBits) {
        return;
      }
      for (let i = 3; i < 31; i = i + 7) {
        const shift = hi >>> i;
        const hasNext = !(shift >>> 7 == 0);
        const byte = (hasNext ? shift | 128 : shift) & 255;
        bytes.push(byte);
        if (!hasNext) {
          return;
        }
      }
      bytes.push(hi >>> 31 & 1);
    }
    exports2.varint64write = varint64write;
    var TWO_PWR_32_DBL = (1 << 16) * (1 << 16);
    function int64fromString(dec) {
      let minus = dec[0] == "-";
      if (minus)
        dec = dec.slice(1);
      const base = 1e6;
      let lowBits = 0;
      let highBits = 0;
      function add1e6digit(begin, end) {
        const digit1e6 = Number(dec.slice(begin, end));
        highBits *= base;
        lowBits = lowBits * base + digit1e6;
        if (lowBits >= TWO_PWR_32_DBL) {
          highBits = highBits + (lowBits / TWO_PWR_32_DBL | 0);
          lowBits = lowBits % TWO_PWR_32_DBL;
        }
      }
      add1e6digit(-24, -18);
      add1e6digit(-18, -12);
      add1e6digit(-12, -6);
      add1e6digit(-6);
      return [minus, lowBits, highBits];
    }
    exports2.int64fromString = int64fromString;
    function int64toString(bitsLow, bitsHigh) {
      if (bitsHigh <= 2097151) {
        return "" + (TWO_PWR_32_DBL * bitsHigh + (bitsLow >>> 0));
      }
      let low = bitsLow & 16777215;
      let mid = (bitsLow >>> 24 | bitsHigh << 8) >>> 0 & 16777215;
      let high = bitsHigh >> 16 & 65535;
      let digitA = low + mid * 6777216 + high * 6710656;
      let digitB = mid + high * 8147497;
      let digitC = high * 2;
      let base = 1e7;
      if (digitA >= base) {
        digitB += Math.floor(digitA / base);
        digitA %= base;
      }
      if (digitB >= base) {
        digitC += Math.floor(digitB / base);
        digitB %= base;
      }
      function decimalFrom1e7(digit1e7, needLeadingZeros) {
        let partial = digit1e7 ? String(digit1e7) : "";
        if (needLeadingZeros) {
          return "0000000".slice(partial.length) + partial;
        }
        return partial;
      }
      return decimalFrom1e7(
        digitC,
        /*needLeadingZeros=*/
        0
      ) + decimalFrom1e7(
        digitB,
        /*needLeadingZeros=*/
        digitC
      ) + // If the final 1e7 digit didn't need leading zeros, we would have
      // returned via the trivial code path at the top.
      decimalFrom1e7(
        digitA,
        /*needLeadingZeros=*/
        1
      );
    }
    exports2.int64toString = int64toString;
    function varint32write(value, bytes) {
      if (value >= 0) {
        while (value > 127) {
          bytes.push(value & 127 | 128);
          value = value >>> 7;
        }
        bytes.push(value);
      } else {
        for (let i = 0; i < 9; i++) {
          bytes.push(value & 127 | 128);
          value = value >> 7;
        }
        bytes.push(1);
      }
    }
    exports2.varint32write = varint32write;
    function varint32read() {
      let b = this.buf[this.pos++];
      let result = b & 127;
      if ((b & 128) == 0) {
        this.assertBounds();
        return result;
      }
      b = this.buf[this.pos++];
      result |= (b & 127) << 7;
      if ((b & 128) == 0) {
        this.assertBounds();
        return result;
      }
      b = this.buf[this.pos++];
      result |= (b & 127) << 14;
      if ((b & 128) == 0) {
        this.assertBounds();
        return result;
      }
      b = this.buf[this.pos++];
      result |= (b & 127) << 21;
      if ((b & 128) == 0) {
        this.assertBounds();
        return result;
      }
      b = this.buf[this.pos++];
      result |= (b & 15) << 28;
      for (let readBytes = 5; (b & 128) !== 0 && readBytes < 10; readBytes++)
        b = this.buf[this.pos++];
      if ((b & 128) != 0)
        throw new Error("invalid varint");
      this.assertBounds();
      return result >>> 0;
    }
    exports2.varint32read = varint32read;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/pb-long.js
var require_pb_long = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/pb-long.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PbLong = exports2.PbULong = void 0;
    var goog_varint_1 = require_goog_varint();
    function detectBi() {
      const dv = new DataView(new ArrayBuffer(8));
      const ok = globalThis.BigInt !== void 0 && typeof dv.getBigInt64 === "function" && typeof dv.getBigUint64 === "function" && typeof dv.setBigInt64 === "function" && typeof dv.setBigUint64 === "function";
      return ok ? {
        MIN: BigInt("-9223372036854775808"),
        MAX: BigInt("9223372036854775807"),
        UMIN: BigInt("0"),
        UMAX: BigInt("18446744073709551615"),
        C: BigInt,
        V: dv
      } : void 0;
    }
    var BI = detectBi();
    function assertBi(bi) {
      if (!bi)
        throw new Error("BigInt unavailable, see https://github.com/timostamm/protobuf-ts/blob/v1.0.8/MANUAL.md#bigint-support");
    }
    var RE_DECIMAL_STR = /^-?[0-9]+$/;
    var TWO_PWR_32_DBL = (1 << 16) * (1 << 16);
    var SharedPbLong = class {
      /**
       * Create a new instance with the given bits.
       */
      constructor(lo, hi) {
        this.lo = lo | 0;
        this.hi = hi | 0;
      }
      /**
       * Is this instance equal to 0?
       */
      isZero() {
        return this.lo == 0 && this.hi == 0;
      }
      /**
       * Convert to a native number.
       */
      toNumber() {
        let result = this.hi * TWO_PWR_32_DBL + (this.lo >>> 0);
        if (!Number.isSafeInteger(result))
          throw new Error("cannot convert to safe number");
        return result;
      }
    };
    var PbULong = class _PbULong extends SharedPbLong {
      /**
       * Create instance from a `string`, `number` or `bigint`.
       */
      static from(value) {
        if (BI)
          switch (typeof value) {
            case "string":
              if (value == "0")
                return this.ZERO;
              if (value == "")
                throw new Error("string is no integer");
              value = BI.C(value);
            case "number":
              if (value === 0)
                return this.ZERO;
              value = BI.C(value);
            case "bigint":
              if (!value)
                return this.ZERO;
              if (value < BI.UMIN)
                throw new Error("signed value for ulong");
              if (value > BI.UMAX)
                throw new Error("ulong too large");
              BI.V.setBigUint64(0, value, true);
              return new _PbULong(BI.V.getInt32(0, true), BI.V.getInt32(4, true));
          }
        else
          switch (typeof value) {
            case "string":
              if (value == "0")
                return this.ZERO;
              value = value.trim();
              if (!RE_DECIMAL_STR.test(value))
                throw new Error("string is no integer");
              let [minus, lo, hi] = goog_varint_1.int64fromString(value);
              if (minus)
                throw new Error("signed value");
              return new _PbULong(lo, hi);
            case "number":
              if (value == 0)
                return this.ZERO;
              if (!Number.isSafeInteger(value))
                throw new Error("number is no integer");
              if (value < 0)
                throw new Error("signed value for ulong");
              return new _PbULong(value, value / TWO_PWR_32_DBL);
          }
        throw new Error("unknown value " + typeof value);
      }
      /**
       * Convert to decimal string.
       */
      toString() {
        return BI ? this.toBigInt().toString() : goog_varint_1.int64toString(this.lo, this.hi);
      }
      /**
       * Convert to native bigint.
       */
      toBigInt() {
        assertBi(BI);
        BI.V.setInt32(0, this.lo, true);
        BI.V.setInt32(4, this.hi, true);
        return BI.V.getBigUint64(0, true);
      }
    };
    exports2.PbULong = PbULong;
    PbULong.ZERO = new PbULong(0, 0);
    var PbLong = class _PbLong extends SharedPbLong {
      /**
       * Create instance from a `string`, `number` or `bigint`.
       */
      static from(value) {
        if (BI)
          switch (typeof value) {
            case "string":
              if (value == "0")
                return this.ZERO;
              if (value == "")
                throw new Error("string is no integer");
              value = BI.C(value);
            case "number":
              if (value === 0)
                return this.ZERO;
              value = BI.C(value);
            case "bigint":
              if (!value)
                return this.ZERO;
              if (value < BI.MIN)
                throw new Error("ulong too small");
              if (value > BI.MAX)
                throw new Error("ulong too large");
              BI.V.setBigInt64(0, value, true);
              return new _PbLong(BI.V.getInt32(0, true), BI.V.getInt32(4, true));
          }
        else
          switch (typeof value) {
            case "string":
              if (value == "0")
                return this.ZERO;
              value = value.trim();
              if (!RE_DECIMAL_STR.test(value))
                throw new Error("string is no integer");
              let [minus, lo, hi] = goog_varint_1.int64fromString(value);
              let pbl = new _PbLong(lo, hi);
              return minus ? pbl.negate() : pbl;
            case "number":
              if (value == 0)
                return this.ZERO;
              if (!Number.isSafeInteger(value))
                throw new Error("number is no integer");
              return value > 0 ? new _PbLong(value, value / TWO_PWR_32_DBL) : new _PbLong(-value, -value / TWO_PWR_32_DBL).negate();
          }
        throw new Error("unknown value " + typeof value);
      }
      /**
       * Do we have a minus sign?
       */
      isNegative() {
        return (this.hi & 2147483648) !== 0;
      }
      /**
       * Negate two's complement.
       * Invert all the bits and add one to the result.
       */
      negate() {
        let hi = ~this.hi, lo = this.lo;
        if (lo)
          lo = ~lo + 1;
        else
          hi += 1;
        return new _PbLong(lo, hi);
      }
      /**
       * Convert to decimal string.
       */
      toString() {
        if (BI)
          return this.toBigInt().toString();
        if (this.isNegative()) {
          let n = this.negate();
          return "-" + goog_varint_1.int64toString(n.lo, n.hi);
        }
        return goog_varint_1.int64toString(this.lo, this.hi);
      }
      /**
       * Convert to native bigint.
       */
      toBigInt() {
        assertBi(BI);
        BI.V.setInt32(0, this.lo, true);
        BI.V.setInt32(4, this.hi, true);
        return BI.V.getBigInt64(0, true);
      }
    };
    exports2.PbLong = PbLong;
    PbLong.ZERO = new PbLong(0, 0);
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/binary-reader.js
var require_binary_reader = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/binary-reader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BinaryReader = exports2.binaryReadOptions = void 0;
    var binary_format_contract_1 = require_binary_format_contract();
    var pb_long_1 = require_pb_long();
    var goog_varint_1 = require_goog_varint();
    var defaultsRead = {
      readUnknownField: true,
      readerFactory: (bytes) => new BinaryReader(bytes)
    };
    function binaryReadOptions(options) {
      return options ? Object.assign(Object.assign({}, defaultsRead), options) : defaultsRead;
    }
    exports2.binaryReadOptions = binaryReadOptions;
    var BinaryReader = class {
      constructor(buf, textDecoder) {
        this.varint64 = goog_varint_1.varint64read;
        this.uint32 = goog_varint_1.varint32read;
        this.buf = buf;
        this.len = buf.length;
        this.pos = 0;
        this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
        this.textDecoder = textDecoder !== null && textDecoder !== void 0 ? textDecoder : new TextDecoder("utf-8", {
          fatal: true,
          ignoreBOM: true
        });
      }
      /**
       * Reads a tag - field number and wire type.
       */
      tag() {
        let tag = this.uint32(), fieldNo = tag >>> 3, wireType = tag & 7;
        if (fieldNo <= 0 || wireType < 0 || wireType > 5)
          throw new Error("illegal tag: field no " + fieldNo + " wire type " + wireType);
        return [fieldNo, wireType];
      }
      /**
       * Skip one element on the wire and return the skipped data.
       * Supports WireType.StartGroup since v2.0.0-alpha.23.
       */
      skip(wireType) {
        let start = this.pos;
        switch (wireType) {
          case binary_format_contract_1.WireType.Varint:
            while (this.buf[this.pos++] & 128) {
            }
            break;
          case binary_format_contract_1.WireType.Bit64:
            this.pos += 4;
          case binary_format_contract_1.WireType.Bit32:
            this.pos += 4;
            break;
          case binary_format_contract_1.WireType.LengthDelimited:
            let len = this.uint32();
            this.pos += len;
            break;
          case binary_format_contract_1.WireType.StartGroup:
            let t;
            while ((t = this.tag()[1]) !== binary_format_contract_1.WireType.EndGroup) {
              this.skip(t);
            }
            break;
          default:
            throw new Error("cant skip wire type " + wireType);
        }
        this.assertBounds();
        return this.buf.subarray(start, this.pos);
      }
      /**
       * Throws error if position in byte array is out of range.
       */
      assertBounds() {
        if (this.pos > this.len)
          throw new RangeError("premature EOF");
      }
      /**
       * Read a `int32` field, a signed 32 bit varint.
       */
      int32() {
        return this.uint32() | 0;
      }
      /**
       * Read a `sint32` field, a signed, zigzag-encoded 32-bit varint.
       */
      sint32() {
        let zze = this.uint32();
        return zze >>> 1 ^ -(zze & 1);
      }
      /**
       * Read a `int64` field, a signed 64-bit varint.
       */
      int64() {
        return new pb_long_1.PbLong(...this.varint64());
      }
      /**
       * Read a `uint64` field, an unsigned 64-bit varint.
       */
      uint64() {
        return new pb_long_1.PbULong(...this.varint64());
      }
      /**
       * Read a `sint64` field, a signed, zig-zag-encoded 64-bit varint.
       */
      sint64() {
        let [lo, hi] = this.varint64();
        let s = -(lo & 1);
        lo = (lo >>> 1 | (hi & 1) << 31) ^ s;
        hi = hi >>> 1 ^ s;
        return new pb_long_1.PbLong(lo, hi);
      }
      /**
       * Read a `bool` field, a variant.
       */
      bool() {
        let [lo, hi] = this.varint64();
        return lo !== 0 || hi !== 0;
      }
      /**
       * Read a `fixed32` field, an unsigned, fixed-length 32-bit integer.
       */
      fixed32() {
        return this.view.getUint32((this.pos += 4) - 4, true);
      }
      /**
       * Read a `sfixed32` field, a signed, fixed-length 32-bit integer.
       */
      sfixed32() {
        return this.view.getInt32((this.pos += 4) - 4, true);
      }
      /**
       * Read a `fixed64` field, an unsigned, fixed-length 64 bit integer.
       */
      fixed64() {
        return new pb_long_1.PbULong(this.sfixed32(), this.sfixed32());
      }
      /**
       * Read a `fixed64` field, a signed, fixed-length 64-bit integer.
       */
      sfixed64() {
        return new pb_long_1.PbLong(this.sfixed32(), this.sfixed32());
      }
      /**
       * Read a `float` field, 32-bit floating point number.
       */
      float() {
        return this.view.getFloat32((this.pos += 4) - 4, true);
      }
      /**
       * Read a `double` field, a 64-bit floating point number.
       */
      double() {
        return this.view.getFloat64((this.pos += 8) - 8, true);
      }
      /**
       * Read a `bytes` field, length-delimited arbitrary data.
       */
      bytes() {
        let len = this.uint32();
        let start = this.pos;
        this.pos += len;
        this.assertBounds();
        return this.buf.subarray(start, start + len);
      }
      /**
       * Read a `string` field, length-delimited data converted to UTF-8 text.
       */
      string() {
        return this.textDecoder.decode(this.bytes());
      }
    };
    exports2.BinaryReader = BinaryReader;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/assert.js
var require_assert = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/assert.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.assertFloat32 = exports2.assertUInt32 = exports2.assertInt32 = exports2.assertNever = exports2.assert = void 0;
    function assert(condition, msg) {
      if (!condition) {
        throw new Error(msg);
      }
    }
    exports2.assert = assert;
    function assertNever(value, msg) {
      throw new Error(msg !== null && msg !== void 0 ? msg : "Unexpected object: " + value);
    }
    exports2.assertNever = assertNever;
    var FLOAT32_MAX = 34028234663852886e22;
    var FLOAT32_MIN = -34028234663852886e22;
    var UINT32_MAX = 4294967295;
    var INT32_MAX = 2147483647;
    var INT32_MIN = -2147483648;
    function assertInt32(arg) {
      if (typeof arg !== "number")
        throw new Error("invalid int 32: " + typeof arg);
      if (!Number.isInteger(arg) || arg > INT32_MAX || arg < INT32_MIN)
        throw new Error("invalid int 32: " + arg);
    }
    exports2.assertInt32 = assertInt32;
    function assertUInt32(arg) {
      if (typeof arg !== "number")
        throw new Error("invalid uint 32: " + typeof arg);
      if (!Number.isInteger(arg) || arg > UINT32_MAX || arg < 0)
        throw new Error("invalid uint 32: " + arg);
    }
    exports2.assertUInt32 = assertUInt32;
    function assertFloat32(arg) {
      if (typeof arg !== "number")
        throw new Error("invalid float 32: " + typeof arg);
      if (!Number.isFinite(arg))
        return;
      if (arg > FLOAT32_MAX || arg < FLOAT32_MIN)
        throw new Error("invalid float 32: " + arg);
    }
    exports2.assertFloat32 = assertFloat32;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/binary-writer.js
var require_binary_writer = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/binary-writer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BinaryWriter = exports2.binaryWriteOptions = void 0;
    var pb_long_1 = require_pb_long();
    var goog_varint_1 = require_goog_varint();
    var assert_1 = require_assert();
    var defaultsWrite = {
      writeUnknownFields: true,
      writerFactory: () => new BinaryWriter()
    };
    function binaryWriteOptions(options) {
      return options ? Object.assign(Object.assign({}, defaultsWrite), options) : defaultsWrite;
    }
    exports2.binaryWriteOptions = binaryWriteOptions;
    var BinaryWriter = class {
      constructor(textEncoder) {
        this.stack = [];
        this.textEncoder = textEncoder !== null && textEncoder !== void 0 ? textEncoder : new TextEncoder();
        this.chunks = [];
        this.buf = [];
      }
      /**
       * Return all bytes written and reset this writer.
       */
      finish() {
        this.chunks.push(new Uint8Array(this.buf));
        let len = 0;
        for (let i = 0; i < this.chunks.length; i++)
          len += this.chunks[i].length;
        let bytes = new Uint8Array(len);
        let offset = 0;
        for (let i = 0; i < this.chunks.length; i++) {
          bytes.set(this.chunks[i], offset);
          offset += this.chunks[i].length;
        }
        this.chunks = [];
        return bytes;
      }
      /**
       * Start a new fork for length-delimited data like a message
       * or a packed repeated field.
       *
       * Must be joined later with `join()`.
       */
      fork() {
        this.stack.push({ chunks: this.chunks, buf: this.buf });
        this.chunks = [];
        this.buf = [];
        return this;
      }
      /**
       * Join the last fork. Write its length and bytes, then
       * return to the previous state.
       */
      join() {
        let chunk = this.finish();
        let prev = this.stack.pop();
        if (!prev)
          throw new Error("invalid state, fork stack empty");
        this.chunks = prev.chunks;
        this.buf = prev.buf;
        this.uint32(chunk.byteLength);
        return this.raw(chunk);
      }
      /**
       * Writes a tag (field number and wire type).
       *
       * Equivalent to `uint32( (fieldNo << 3 | type) >>> 0 )`.
       *
       * Generated code should compute the tag ahead of time and call `uint32()`.
       */
      tag(fieldNo, type) {
        return this.uint32((fieldNo << 3 | type) >>> 0);
      }
      /**
       * Write a chunk of raw bytes.
       */
      raw(chunk) {
        if (this.buf.length) {
          this.chunks.push(new Uint8Array(this.buf));
          this.buf = [];
        }
        this.chunks.push(chunk);
        return this;
      }
      /**
       * Write a `uint32` value, an unsigned 32 bit varint.
       */
      uint32(value) {
        assert_1.assertUInt32(value);
        while (value > 127) {
          this.buf.push(value & 127 | 128);
          value = value >>> 7;
        }
        this.buf.push(value);
        return this;
      }
      /**
       * Write a `int32` value, a signed 32 bit varint.
       */
      int32(value) {
        assert_1.assertInt32(value);
        goog_varint_1.varint32write(value, this.buf);
        return this;
      }
      /**
       * Write a `bool` value, a variant.
       */
      bool(value) {
        this.buf.push(value ? 1 : 0);
        return this;
      }
      /**
       * Write a `bytes` value, length-delimited arbitrary data.
       */
      bytes(value) {
        this.uint32(value.byteLength);
        return this.raw(value);
      }
      /**
       * Write a `string` value, length-delimited data converted to UTF-8 text.
       */
      string(value) {
        let chunk = this.textEncoder.encode(value);
        this.uint32(chunk.byteLength);
        return this.raw(chunk);
      }
      /**
       * Write a `float` value, 32-bit floating point number.
       */
      float(value) {
        assert_1.assertFloat32(value);
        let chunk = new Uint8Array(4);
        new DataView(chunk.buffer).setFloat32(0, value, true);
        return this.raw(chunk);
      }
      /**
       * Write a `double` value, a 64-bit floating point number.
       */
      double(value) {
        let chunk = new Uint8Array(8);
        new DataView(chunk.buffer).setFloat64(0, value, true);
        return this.raw(chunk);
      }
      /**
       * Write a `fixed32` value, an unsigned, fixed-length 32-bit integer.
       */
      fixed32(value) {
        assert_1.assertUInt32(value);
        let chunk = new Uint8Array(4);
        new DataView(chunk.buffer).setUint32(0, value, true);
        return this.raw(chunk);
      }
      /**
       * Write a `sfixed32` value, a signed, fixed-length 32-bit integer.
       */
      sfixed32(value) {
        assert_1.assertInt32(value);
        let chunk = new Uint8Array(4);
        new DataView(chunk.buffer).setInt32(0, value, true);
        return this.raw(chunk);
      }
      /**
       * Write a `sint32` value, a signed, zigzag-encoded 32-bit varint.
       */
      sint32(value) {
        assert_1.assertInt32(value);
        value = (value << 1 ^ value >> 31) >>> 0;
        goog_varint_1.varint32write(value, this.buf);
        return this;
      }
      /**
       * Write a `fixed64` value, a signed, fixed-length 64-bit integer.
       */
      sfixed64(value) {
        let chunk = new Uint8Array(8);
        let view = new DataView(chunk.buffer);
        let long = pb_long_1.PbLong.from(value);
        view.setInt32(0, long.lo, true);
        view.setInt32(4, long.hi, true);
        return this.raw(chunk);
      }
      /**
       * Write a `fixed64` value, an unsigned, fixed-length 64 bit integer.
       */
      fixed64(value) {
        let chunk = new Uint8Array(8);
        let view = new DataView(chunk.buffer);
        let long = pb_long_1.PbULong.from(value);
        view.setInt32(0, long.lo, true);
        view.setInt32(4, long.hi, true);
        return this.raw(chunk);
      }
      /**
       * Write a `int64` value, a signed 64-bit varint.
       */
      int64(value) {
        let long = pb_long_1.PbLong.from(value);
        goog_varint_1.varint64write(long.lo, long.hi, this.buf);
        return this;
      }
      /**
       * Write a `sint64` value, a signed, zig-zag-encoded 64-bit varint.
       */
      sint64(value) {
        let long = pb_long_1.PbLong.from(value), sign = long.hi >> 31, lo = long.lo << 1 ^ sign, hi = (long.hi << 1 | long.lo >>> 31) ^ sign;
        goog_varint_1.varint64write(lo, hi, this.buf);
        return this;
      }
      /**
       * Write a `uint64` value, an unsigned 64-bit varint.
       */
      uint64(value) {
        let long = pb_long_1.PbULong.from(value);
        goog_varint_1.varint64write(long.lo, long.hi, this.buf);
        return this;
      }
    };
    exports2.BinaryWriter = BinaryWriter;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/json-format-contract.js
var require_json_format_contract = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/json-format-contract.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.mergeJsonOptions = exports2.jsonWriteOptions = exports2.jsonReadOptions = void 0;
    var defaultsWrite = {
      emitDefaultValues: false,
      enumAsInteger: false,
      useProtoFieldName: false,
      prettySpaces: 0
    };
    var defaultsRead = {
      ignoreUnknownFields: false
    };
    function jsonReadOptions(options) {
      return options ? Object.assign(Object.assign({}, defaultsRead), options) : defaultsRead;
    }
    exports2.jsonReadOptions = jsonReadOptions;
    function jsonWriteOptions(options) {
      return options ? Object.assign(Object.assign({}, defaultsWrite), options) : defaultsWrite;
    }
    exports2.jsonWriteOptions = jsonWriteOptions;
    function mergeJsonOptions(a, b) {
      var _a, _b;
      let c = Object.assign(Object.assign({}, a), b);
      c.typeRegistry = [...(_a = a === null || a === void 0 ? void 0 : a.typeRegistry) !== null && _a !== void 0 ? _a : [], ...(_b = b === null || b === void 0 ? void 0 : b.typeRegistry) !== null && _b !== void 0 ? _b : []];
      return c;
    }
    exports2.mergeJsonOptions = mergeJsonOptions;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/message-type-contract.js
var require_message_type_contract = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/message-type-contract.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MESSAGE_TYPE = void 0;
    exports2.MESSAGE_TYPE = /* @__PURE__ */ Symbol.for("protobuf-ts/message-type");
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/lower-camel-case.js
var require_lower_camel_case = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/lower-camel-case.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.lowerCamelCase = void 0;
    function lowerCamelCase(snakeCase) {
      let capNext = false;
      const sb = [];
      for (let i = 0; i < snakeCase.length; i++) {
        let next = snakeCase.charAt(i);
        if (next == "_") {
          capNext = true;
        } else if (/\d/.test(next)) {
          sb.push(next);
          capNext = true;
        } else if (capNext) {
          sb.push(next.toUpperCase());
          capNext = false;
        } else if (i == 0) {
          sb.push(next.toLowerCase());
        } else {
          sb.push(next);
        }
      }
      return sb.join("");
    }
    exports2.lowerCamelCase = lowerCamelCase;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-info.js
var require_reflection_info = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-info.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readMessageOption = exports2.readFieldOption = exports2.readFieldOptions = exports2.normalizeFieldInfo = exports2.RepeatType = exports2.LongType = exports2.ScalarType = void 0;
    var lower_camel_case_1 = require_lower_camel_case();
    var ScalarType;
    (function(ScalarType2) {
      ScalarType2[ScalarType2["DOUBLE"] = 1] = "DOUBLE";
      ScalarType2[ScalarType2["FLOAT"] = 2] = "FLOAT";
      ScalarType2[ScalarType2["INT64"] = 3] = "INT64";
      ScalarType2[ScalarType2["UINT64"] = 4] = "UINT64";
      ScalarType2[ScalarType2["INT32"] = 5] = "INT32";
      ScalarType2[ScalarType2["FIXED64"] = 6] = "FIXED64";
      ScalarType2[ScalarType2["FIXED32"] = 7] = "FIXED32";
      ScalarType2[ScalarType2["BOOL"] = 8] = "BOOL";
      ScalarType2[ScalarType2["STRING"] = 9] = "STRING";
      ScalarType2[ScalarType2["BYTES"] = 12] = "BYTES";
      ScalarType2[ScalarType2["UINT32"] = 13] = "UINT32";
      ScalarType2[ScalarType2["SFIXED32"] = 15] = "SFIXED32";
      ScalarType2[ScalarType2["SFIXED64"] = 16] = "SFIXED64";
      ScalarType2[ScalarType2["SINT32"] = 17] = "SINT32";
      ScalarType2[ScalarType2["SINT64"] = 18] = "SINT64";
    })(ScalarType = exports2.ScalarType || (exports2.ScalarType = {}));
    var LongType;
    (function(LongType2) {
      LongType2[LongType2["BIGINT"] = 0] = "BIGINT";
      LongType2[LongType2["STRING"] = 1] = "STRING";
      LongType2[LongType2["NUMBER"] = 2] = "NUMBER";
    })(LongType = exports2.LongType || (exports2.LongType = {}));
    var RepeatType;
    (function(RepeatType2) {
      RepeatType2[RepeatType2["NO"] = 0] = "NO";
      RepeatType2[RepeatType2["PACKED"] = 1] = "PACKED";
      RepeatType2[RepeatType2["UNPACKED"] = 2] = "UNPACKED";
    })(RepeatType = exports2.RepeatType || (exports2.RepeatType = {}));
    function normalizeFieldInfo(field) {
      var _a, _b, _c, _d;
      field.localName = (_a = field.localName) !== null && _a !== void 0 ? _a : lower_camel_case_1.lowerCamelCase(field.name);
      field.jsonName = (_b = field.jsonName) !== null && _b !== void 0 ? _b : lower_camel_case_1.lowerCamelCase(field.name);
      field.repeat = (_c = field.repeat) !== null && _c !== void 0 ? _c : RepeatType.NO;
      field.opt = (_d = field.opt) !== null && _d !== void 0 ? _d : field.repeat ? false : field.oneof ? false : field.kind == "message";
      return field;
    }
    exports2.normalizeFieldInfo = normalizeFieldInfo;
    function readFieldOptions(messageType, fieldName, extensionName, extensionType) {
      var _a;
      const options = (_a = messageType.fields.find((m, i) => m.localName == fieldName || i == fieldName)) === null || _a === void 0 ? void 0 : _a.options;
      return options && options[extensionName] ? extensionType.fromJson(options[extensionName]) : void 0;
    }
    exports2.readFieldOptions = readFieldOptions;
    function readFieldOption(messageType, fieldName, extensionName, extensionType) {
      var _a;
      const options = (_a = messageType.fields.find((m, i) => m.localName == fieldName || i == fieldName)) === null || _a === void 0 ? void 0 : _a.options;
      if (!options) {
        return void 0;
      }
      const optionVal = options[extensionName];
      if (optionVal === void 0) {
        return optionVal;
      }
      return extensionType ? extensionType.fromJson(optionVal) : optionVal;
    }
    exports2.readFieldOption = readFieldOption;
    function readMessageOption(messageType, extensionName, extensionType) {
      const options = messageType.options;
      const optionVal = options[extensionName];
      if (optionVal === void 0) {
        return optionVal;
      }
      return extensionType ? extensionType.fromJson(optionVal) : optionVal;
    }
    exports2.readMessageOption = readMessageOption;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/oneof.js
var require_oneof = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/oneof.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getSelectedOneofValue = exports2.clearOneofValue = exports2.setUnknownOneofValue = exports2.setOneofValue = exports2.getOneofValue = exports2.isOneofGroup = void 0;
    function isOneofGroup(any) {
      if (typeof any != "object" || any === null || !any.hasOwnProperty("oneofKind")) {
        return false;
      }
      switch (typeof any.oneofKind) {
        case "string":
          if (any[any.oneofKind] === void 0)
            return false;
          return Object.keys(any).length == 2;
        case "undefined":
          return Object.keys(any).length == 1;
        default:
          return false;
      }
    }
    exports2.isOneofGroup = isOneofGroup;
    function getOneofValue(oneof, kind) {
      return oneof[kind];
    }
    exports2.getOneofValue = getOneofValue;
    function setOneofValue(oneof, kind, value) {
      if (oneof.oneofKind !== void 0) {
        delete oneof[oneof.oneofKind];
      }
      oneof.oneofKind = kind;
      if (value !== void 0) {
        oneof[kind] = value;
      }
    }
    exports2.setOneofValue = setOneofValue;
    function setUnknownOneofValue(oneof, kind, value) {
      if (oneof.oneofKind !== void 0) {
        delete oneof[oneof.oneofKind];
      }
      oneof.oneofKind = kind;
      if (value !== void 0 && kind !== void 0) {
        oneof[kind] = value;
      }
    }
    exports2.setUnknownOneofValue = setUnknownOneofValue;
    function clearOneofValue(oneof) {
      if (oneof.oneofKind !== void 0) {
        delete oneof[oneof.oneofKind];
      }
      oneof.oneofKind = void 0;
    }
    exports2.clearOneofValue = clearOneofValue;
    function getSelectedOneofValue(oneof) {
      if (oneof.oneofKind === void 0) {
        return void 0;
      }
      return oneof[oneof.oneofKind];
    }
    exports2.getSelectedOneofValue = getSelectedOneofValue;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-type-check.js
var require_reflection_type_check = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-type-check.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReflectionTypeCheck = void 0;
    var reflection_info_1 = require_reflection_info();
    var oneof_1 = require_oneof();
    var ReflectionTypeCheck = class {
      constructor(info) {
        var _a;
        this.fields = (_a = info.fields) !== null && _a !== void 0 ? _a : [];
      }
      prepare() {
        if (this.data)
          return;
        const req = [], known = [], oneofs = [];
        for (let field of this.fields) {
          if (field.oneof) {
            if (!oneofs.includes(field.oneof)) {
              oneofs.push(field.oneof);
              req.push(field.oneof);
              known.push(field.oneof);
            }
          } else {
            known.push(field.localName);
            switch (field.kind) {
              case "scalar":
              case "enum":
                if (!field.opt || field.repeat)
                  req.push(field.localName);
                break;
              case "message":
                if (field.repeat)
                  req.push(field.localName);
                break;
              case "map":
                req.push(field.localName);
                break;
            }
          }
        }
        this.data = { req, known, oneofs: Object.values(oneofs) };
      }
      /**
       * Is the argument a valid message as specified by the
       * reflection information?
       *
       * Checks all field types recursively. The `depth`
       * specifies how deep into the structure the check will be.
       *
       * With a depth of 0, only the presence of fields
       * is checked.
       *
       * With a depth of 1 or more, the field types are checked.
       *
       * With a depth of 2 or more, the members of map, repeated
       * and message fields are checked.
       *
       * Message fields will be checked recursively with depth - 1.
       *
       * The number of map entries / repeated values being checked
       * is < depth.
       */
      is(message, depth, allowExcessProperties = false) {
        if (depth < 0)
          return true;
        if (message === null || message === void 0 || typeof message != "object")
          return false;
        this.prepare();
        let keys = Object.keys(message), data = this.data;
        if (keys.length < data.req.length || data.req.some((n) => !keys.includes(n)))
          return false;
        if (!allowExcessProperties) {
          if (keys.some((k) => !data.known.includes(k)))
            return false;
        }
        if (depth < 1) {
          return true;
        }
        for (const name of data.oneofs) {
          const group = message[name];
          if (!oneof_1.isOneofGroup(group))
            return false;
          if (group.oneofKind === void 0)
            continue;
          const field = this.fields.find((f) => f.localName === group.oneofKind);
          if (!field)
            return false;
          if (!this.field(group[group.oneofKind], field, allowExcessProperties, depth))
            return false;
        }
        for (const field of this.fields) {
          if (field.oneof !== void 0)
            continue;
          if (!this.field(message[field.localName], field, allowExcessProperties, depth))
            return false;
        }
        return true;
      }
      field(arg, field, allowExcessProperties, depth) {
        let repeated = field.repeat;
        switch (field.kind) {
          case "scalar":
            if (arg === void 0)
              return field.opt;
            if (repeated)
              return this.scalars(arg, field.T, depth, field.L);
            return this.scalar(arg, field.T, field.L);
          case "enum":
            if (arg === void 0)
              return field.opt;
            if (repeated)
              return this.scalars(arg, reflection_info_1.ScalarType.INT32, depth);
            return this.scalar(arg, reflection_info_1.ScalarType.INT32);
          case "message":
            if (arg === void 0)
              return true;
            if (repeated)
              return this.messages(arg, field.T(), allowExcessProperties, depth);
            return this.message(arg, field.T(), allowExcessProperties, depth);
          case "map":
            if (typeof arg != "object" || arg === null)
              return false;
            if (depth < 2)
              return true;
            if (!this.mapKeys(arg, field.K, depth))
              return false;
            switch (field.V.kind) {
              case "scalar":
                return this.scalars(Object.values(arg), field.V.T, depth, field.V.L);
              case "enum":
                return this.scalars(Object.values(arg), reflection_info_1.ScalarType.INT32, depth);
              case "message":
                return this.messages(Object.values(arg), field.V.T(), allowExcessProperties, depth);
            }
            break;
        }
        return true;
      }
      message(arg, type, allowExcessProperties, depth) {
        if (allowExcessProperties) {
          return type.isAssignable(arg, depth);
        }
        return type.is(arg, depth);
      }
      messages(arg, type, allowExcessProperties, depth) {
        if (!Array.isArray(arg))
          return false;
        if (depth < 2)
          return true;
        if (allowExcessProperties) {
          for (let i = 0; i < arg.length && i < depth; i++)
            if (!type.isAssignable(arg[i], depth - 1))
              return false;
        } else {
          for (let i = 0; i < arg.length && i < depth; i++)
            if (!type.is(arg[i], depth - 1))
              return false;
        }
        return true;
      }
      scalar(arg, type, longType) {
        let argType = typeof arg;
        switch (type) {
          case reflection_info_1.ScalarType.UINT64:
          case reflection_info_1.ScalarType.FIXED64:
          case reflection_info_1.ScalarType.INT64:
          case reflection_info_1.ScalarType.SFIXED64:
          case reflection_info_1.ScalarType.SINT64:
            switch (longType) {
              case reflection_info_1.LongType.BIGINT:
                return argType == "bigint";
              case reflection_info_1.LongType.NUMBER:
                return argType == "number" && !isNaN(arg);
              default:
                return argType == "string";
            }
          case reflection_info_1.ScalarType.BOOL:
            return argType == "boolean";
          case reflection_info_1.ScalarType.STRING:
            return argType == "string";
          case reflection_info_1.ScalarType.BYTES:
            return arg instanceof Uint8Array;
          case reflection_info_1.ScalarType.DOUBLE:
          case reflection_info_1.ScalarType.FLOAT:
            return argType == "number" && !isNaN(arg);
          default:
            return argType == "number" && Number.isInteger(arg);
        }
      }
      scalars(arg, type, depth, longType) {
        if (!Array.isArray(arg))
          return false;
        if (depth < 2)
          return true;
        if (Array.isArray(arg)) {
          for (let i = 0; i < arg.length && i < depth; i++)
            if (!this.scalar(arg[i], type, longType))
              return false;
        }
        return true;
      }
      mapKeys(map, type, depth) {
        let keys = Object.keys(map);
        switch (type) {
          case reflection_info_1.ScalarType.INT32:
          case reflection_info_1.ScalarType.FIXED32:
          case reflection_info_1.ScalarType.SFIXED32:
          case reflection_info_1.ScalarType.SINT32:
          case reflection_info_1.ScalarType.UINT32:
            return this.scalars(keys.slice(0, depth).map((k) => parseInt(k)), type, depth);
          case reflection_info_1.ScalarType.BOOL:
            return this.scalars(keys.slice(0, depth).map((k) => k == "true" ? true : k == "false" ? false : k), type, depth);
          default:
            return this.scalars(keys, type, depth, reflection_info_1.LongType.STRING);
        }
      }
    };
    exports2.ReflectionTypeCheck = ReflectionTypeCheck;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-long-convert.js
var require_reflection_long_convert = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-long-convert.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.reflectionLongConvert = void 0;
    var reflection_info_1 = require_reflection_info();
    function reflectionLongConvert(long, type) {
      switch (type) {
        case reflection_info_1.LongType.BIGINT:
          return long.toBigInt();
        case reflection_info_1.LongType.NUMBER:
          return long.toNumber();
        default:
          return long.toString();
      }
    }
    exports2.reflectionLongConvert = reflectionLongConvert;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-json-reader.js
var require_reflection_json_reader = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-json-reader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReflectionJsonReader = void 0;
    var json_typings_1 = require_json_typings();
    var base64_1 = require_base64();
    var reflection_info_1 = require_reflection_info();
    var pb_long_1 = require_pb_long();
    var assert_1 = require_assert();
    var reflection_long_convert_1 = require_reflection_long_convert();
    var ReflectionJsonReader = class {
      constructor(info) {
        this.info = info;
      }
      prepare() {
        var _a;
        if (this.fMap === void 0) {
          this.fMap = {};
          const fieldsInput = (_a = this.info.fields) !== null && _a !== void 0 ? _a : [];
          for (const field of fieldsInput) {
            this.fMap[field.name] = field;
            this.fMap[field.jsonName] = field;
            this.fMap[field.localName] = field;
          }
        }
      }
      // Cannot parse JSON <type of jsonValue> for <type name>#<fieldName>.
      assert(condition, fieldName, jsonValue) {
        if (!condition) {
          let what = json_typings_1.typeofJsonValue(jsonValue);
          if (what == "number" || what == "boolean")
            what = jsonValue.toString();
          throw new Error(`Cannot parse JSON ${what} for ${this.info.typeName}#${fieldName}`);
        }
      }
      /**
       * Reads a message from canonical JSON format into the target message.
       *
       * Repeated fields are appended. Map entries are added, overwriting
       * existing keys.
       *
       * If a message field is already present, it will be merged with the
       * new data.
       */
      read(input, message, options) {
        this.prepare();
        const oneofsHandled = [];
        for (const [jsonKey, jsonValue] of Object.entries(input)) {
          const field = this.fMap[jsonKey];
          if (!field) {
            if (!options.ignoreUnknownFields)
              throw new Error(`Found unknown field while reading ${this.info.typeName} from JSON format. JSON key: ${jsonKey}`);
            continue;
          }
          const localName = field.localName;
          let target;
          if (field.oneof) {
            if (oneofsHandled.includes(field.oneof))
              throw new Error(`Multiple members of the oneof group "${field.oneof}" of ${this.info.typeName} are present in JSON.`);
            oneofsHandled.push(field.oneof);
            target = message[field.oneof] = {
              oneofKind: localName
            };
          } else {
            target = message;
          }
          if (field.kind == "map") {
            if (jsonValue === null) {
              continue;
            }
            this.assert(json_typings_1.isJsonObject(jsonValue), field.name, jsonValue);
            const fieldObj = target[localName];
            for (const [jsonObjKey, jsonObjValue] of Object.entries(jsonValue)) {
              this.assert(jsonObjValue !== null, field.name + " map value", null);
              let val;
              switch (field.V.kind) {
                case "message":
                  val = field.V.T().internalJsonRead(jsonObjValue, options);
                  break;
                case "enum":
                  val = this.enum(field.V.T(), jsonObjValue, field.name, options.ignoreUnknownFields);
                  if (val === false)
                    continue;
                  break;
                case "scalar":
                  val = this.scalar(jsonObjValue, field.V.T, field.V.L, field.name);
                  break;
              }
              this.assert(val !== void 0, field.name + " map value", jsonObjValue);
              let key = jsonObjKey;
              if (field.K == reflection_info_1.ScalarType.BOOL)
                key = key == "true" ? true : key == "false" ? false : key;
              key = this.scalar(key, field.K, reflection_info_1.LongType.STRING, field.name).toString();
              fieldObj[key] = val;
            }
          } else if (field.repeat) {
            if (jsonValue === null)
              continue;
            this.assert(Array.isArray(jsonValue), field.name, jsonValue);
            const fieldArr = target[localName];
            for (const jsonItem of jsonValue) {
              this.assert(jsonItem !== null, field.name, null);
              let val;
              switch (field.kind) {
                case "message":
                  val = field.T().internalJsonRead(jsonItem, options);
                  break;
                case "enum":
                  val = this.enum(field.T(), jsonItem, field.name, options.ignoreUnknownFields);
                  if (val === false)
                    continue;
                  break;
                case "scalar":
                  val = this.scalar(jsonItem, field.T, field.L, field.name);
                  break;
              }
              this.assert(val !== void 0, field.name, jsonValue);
              fieldArr.push(val);
            }
          } else {
            switch (field.kind) {
              case "message":
                if (jsonValue === null && field.T().typeName != "google.protobuf.Value") {
                  this.assert(field.oneof === void 0, field.name + " (oneof member)", null);
                  continue;
                }
                target[localName] = field.T().internalJsonRead(jsonValue, options, target[localName]);
                break;
              case "enum":
                let val = this.enum(field.T(), jsonValue, field.name, options.ignoreUnknownFields);
                if (val === false)
                  continue;
                target[localName] = val;
                break;
              case "scalar":
                target[localName] = this.scalar(jsonValue, field.T, field.L, field.name);
                break;
            }
          }
        }
      }
      /**
       * Returns `false` for unrecognized string representations.
       *
       * google.protobuf.NullValue accepts only JSON `null`.
       */
      enum(type, json, fieldName, ignoreUnknownFields) {
        if (type[0] == "google.protobuf.NullValue")
          assert_1.assert(json === null, `Unable to parse field ${this.info.typeName}#${fieldName}, enum ${type[0]} only accepts null.`);
        if (json === null)
          return 0;
        switch (typeof json) {
          case "number":
            assert_1.assert(Number.isInteger(json), `Unable to parse field ${this.info.typeName}#${fieldName}, enum can only be integral number, got ${json}.`);
            return json;
          case "string":
            let localEnumName = json;
            if (type[2] && json.substring(0, type[2].length) === type[2])
              localEnumName = json.substring(type[2].length);
            let enumNumber = type[1][localEnumName];
            if (typeof enumNumber === "undefined" && ignoreUnknownFields) {
              return false;
            }
            assert_1.assert(typeof enumNumber == "number", `Unable to parse field ${this.info.typeName}#${fieldName}, enum ${type[0]} has no value for "${json}".`);
            return enumNumber;
        }
        assert_1.assert(false, `Unable to parse field ${this.info.typeName}#${fieldName}, cannot parse enum value from ${typeof json}".`);
      }
      scalar(json, type, longType, fieldName) {
        let e;
        try {
          switch (type) {
            // float, double: JSON value will be a number or one of the special string values "NaN", "Infinity", and "-Infinity".
            // Either numbers or strings are accepted. Exponent notation is also accepted.
            case reflection_info_1.ScalarType.DOUBLE:
            case reflection_info_1.ScalarType.FLOAT:
              if (json === null)
                return 0;
              if (json === "NaN")
                return Number.NaN;
              if (json === "Infinity")
                return Number.POSITIVE_INFINITY;
              if (json === "-Infinity")
                return Number.NEGATIVE_INFINITY;
              if (json === "") {
                e = "empty string";
                break;
              }
              if (typeof json == "string" && json.trim().length !== json.length) {
                e = "extra whitespace";
                break;
              }
              if (typeof json != "string" && typeof json != "number") {
                break;
              }
              let float = Number(json);
              if (Number.isNaN(float)) {
                e = "not a number";
                break;
              }
              if (!Number.isFinite(float)) {
                e = "too large or small";
                break;
              }
              if (type == reflection_info_1.ScalarType.FLOAT)
                assert_1.assertFloat32(float);
              return float;
            // int32, fixed32, uint32: JSON value will be a decimal number. Either numbers or strings are accepted.
            case reflection_info_1.ScalarType.INT32:
            case reflection_info_1.ScalarType.FIXED32:
            case reflection_info_1.ScalarType.SFIXED32:
            case reflection_info_1.ScalarType.SINT32:
            case reflection_info_1.ScalarType.UINT32:
              if (json === null)
                return 0;
              let int32;
              if (typeof json == "number")
                int32 = json;
              else if (json === "")
                e = "empty string";
              else if (typeof json == "string") {
                if (json.trim().length !== json.length)
                  e = "extra whitespace";
                else
                  int32 = Number(json);
              }
              if (int32 === void 0)
                break;
              if (type == reflection_info_1.ScalarType.UINT32)
                assert_1.assertUInt32(int32);
              else
                assert_1.assertInt32(int32);
              return int32;
            // int64, fixed64, uint64: JSON value will be a decimal string. Either numbers or strings are accepted.
            case reflection_info_1.ScalarType.INT64:
            case reflection_info_1.ScalarType.SFIXED64:
            case reflection_info_1.ScalarType.SINT64:
              if (json === null)
                return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbLong.ZERO, longType);
              if (typeof json != "number" && typeof json != "string")
                break;
              return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbLong.from(json), longType);
            case reflection_info_1.ScalarType.FIXED64:
            case reflection_info_1.ScalarType.UINT64:
              if (json === null)
                return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbULong.ZERO, longType);
              if (typeof json != "number" && typeof json != "string")
                break;
              return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbULong.from(json), longType);
            // bool:
            case reflection_info_1.ScalarType.BOOL:
              if (json === null)
                return false;
              if (typeof json !== "boolean")
                break;
              return json;
            // string:
            case reflection_info_1.ScalarType.STRING:
              if (json === null)
                return "";
              if (typeof json !== "string") {
                e = "extra whitespace";
                break;
              }
              try {
                encodeURIComponent(json);
              } catch (e2) {
                e2 = "invalid UTF8";
                break;
              }
              return json;
            // bytes: JSON value will be the data encoded as a string using standard base64 encoding with paddings.
            // Either standard or URL-safe base64 encoding with/without paddings are accepted.
            case reflection_info_1.ScalarType.BYTES:
              if (json === null || json === "")
                return new Uint8Array(0);
              if (typeof json !== "string")
                break;
              return base64_1.base64decode(json);
          }
        } catch (error) {
          e = error.message;
        }
        this.assert(false, fieldName + (e ? " - " + e : ""), json);
      }
    };
    exports2.ReflectionJsonReader = ReflectionJsonReader;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-json-writer.js
var require_reflection_json_writer = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-json-writer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReflectionJsonWriter = void 0;
    var base64_1 = require_base64();
    var pb_long_1 = require_pb_long();
    var reflection_info_1 = require_reflection_info();
    var assert_1 = require_assert();
    var ReflectionJsonWriter = class {
      constructor(info) {
        var _a;
        this.fields = (_a = info.fields) !== null && _a !== void 0 ? _a : [];
      }
      /**
       * Converts the message to a JSON object, based on the field descriptors.
       */
      write(message, options) {
        const json = {}, source = message;
        for (const field of this.fields) {
          if (!field.oneof) {
            let jsonValue2 = this.field(field, source[field.localName], options);
            if (jsonValue2 !== void 0)
              json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue2;
            continue;
          }
          const group = source[field.oneof];
          if (group.oneofKind !== field.localName)
            continue;
          const opt = field.kind == "scalar" || field.kind == "enum" ? Object.assign(Object.assign({}, options), { emitDefaultValues: true }) : options;
          let jsonValue = this.field(field, group[field.localName], opt);
          assert_1.assert(jsonValue !== void 0);
          json[options.useProtoFieldName ? field.name : field.jsonName] = jsonValue;
        }
        return json;
      }
      field(field, value, options) {
        let jsonValue = void 0;
        if (field.kind == "map") {
          assert_1.assert(typeof value == "object" && value !== null);
          const jsonObj = {};
          switch (field.V.kind) {
            case "scalar":
              for (const [entryKey, entryValue] of Object.entries(value)) {
                const val = this.scalar(field.V.T, entryValue, field.name, false, true);
                assert_1.assert(val !== void 0);
                jsonObj[entryKey.toString()] = val;
              }
              break;
            case "message":
              const messageType = field.V.T();
              for (const [entryKey, entryValue] of Object.entries(value)) {
                const val = this.message(messageType, entryValue, field.name, options);
                assert_1.assert(val !== void 0);
                jsonObj[entryKey.toString()] = val;
              }
              break;
            case "enum":
              const enumInfo = field.V.T();
              for (const [entryKey, entryValue] of Object.entries(value)) {
                assert_1.assert(entryValue === void 0 || typeof entryValue == "number");
                const val = this.enum(enumInfo, entryValue, field.name, false, true, options.enumAsInteger);
                assert_1.assert(val !== void 0);
                jsonObj[entryKey.toString()] = val;
              }
              break;
          }
          if (options.emitDefaultValues || Object.keys(jsonObj).length > 0)
            jsonValue = jsonObj;
        } else if (field.repeat) {
          assert_1.assert(Array.isArray(value));
          const jsonArr = [];
          switch (field.kind) {
            case "scalar":
              for (let i = 0; i < value.length; i++) {
                const val = this.scalar(field.T, value[i], field.name, field.opt, true);
                assert_1.assert(val !== void 0);
                jsonArr.push(val);
              }
              break;
            case "enum":
              const enumInfo = field.T();
              for (let i = 0; i < value.length; i++) {
                assert_1.assert(value[i] === void 0 || typeof value[i] == "number");
                const val = this.enum(enumInfo, value[i], field.name, field.opt, true, options.enumAsInteger);
                assert_1.assert(val !== void 0);
                jsonArr.push(val);
              }
              break;
            case "message":
              const messageType = field.T();
              for (let i = 0; i < value.length; i++) {
                const val = this.message(messageType, value[i], field.name, options);
                assert_1.assert(val !== void 0);
                jsonArr.push(val);
              }
              break;
          }
          if (options.emitDefaultValues || jsonArr.length > 0 || options.emitDefaultValues)
            jsonValue = jsonArr;
        } else {
          switch (field.kind) {
            case "scalar":
              jsonValue = this.scalar(field.T, value, field.name, field.opt, options.emitDefaultValues);
              break;
            case "enum":
              jsonValue = this.enum(field.T(), value, field.name, field.opt, options.emitDefaultValues, options.enumAsInteger);
              break;
            case "message":
              jsonValue = this.message(field.T(), value, field.name, options);
              break;
          }
        }
        return jsonValue;
      }
      /**
       * Returns `null` for google.protobuf.NullValue.
       */
      enum(type, value, fieldName, optional, emitDefaultValues, enumAsInteger) {
        if (type[0] == "google.protobuf.NullValue")
          return null;
        if (value === void 0) {
          assert_1.assert(optional);
          return void 0;
        }
        if (value === 0 && !emitDefaultValues && !optional)
          return void 0;
        assert_1.assert(typeof value == "number");
        assert_1.assert(Number.isInteger(value));
        if (enumAsInteger || !type[1].hasOwnProperty(value))
          return value;
        if (type[2])
          return type[2] + type[1][value];
        return type[1][value];
      }
      message(type, value, fieldName, options) {
        if (value === void 0)
          return options.emitDefaultValues ? null : void 0;
        return type.internalJsonWrite(value, options);
      }
      scalar(type, value, fieldName, optional, emitDefaultValues) {
        if (value === void 0) {
          assert_1.assert(optional);
          return void 0;
        }
        const ed = emitDefaultValues || optional;
        switch (type) {
          // int32, fixed32, uint32: JSON value will be a decimal number. Either numbers or strings are accepted.
          case reflection_info_1.ScalarType.INT32:
          case reflection_info_1.ScalarType.SFIXED32:
          case reflection_info_1.ScalarType.SINT32:
            if (value === 0)
              return ed ? 0 : void 0;
            assert_1.assertInt32(value);
            return value;
          case reflection_info_1.ScalarType.FIXED32:
          case reflection_info_1.ScalarType.UINT32:
            if (value === 0)
              return ed ? 0 : void 0;
            assert_1.assertUInt32(value);
            return value;
          // float, double: JSON value will be a number or one of the special string values "NaN", "Infinity", and "-Infinity".
          // Either numbers or strings are accepted. Exponent notation is also accepted.
          case reflection_info_1.ScalarType.FLOAT:
            assert_1.assertFloat32(value);
          case reflection_info_1.ScalarType.DOUBLE:
            if (value === 0)
              return ed ? 0 : void 0;
            assert_1.assert(typeof value == "number");
            if (Number.isNaN(value))
              return "NaN";
            if (value === Number.POSITIVE_INFINITY)
              return "Infinity";
            if (value === Number.NEGATIVE_INFINITY)
              return "-Infinity";
            return value;
          // string:
          case reflection_info_1.ScalarType.STRING:
            if (value === "")
              return ed ? "" : void 0;
            assert_1.assert(typeof value == "string");
            return value;
          // bool:
          case reflection_info_1.ScalarType.BOOL:
            if (value === false)
              return ed ? false : void 0;
            assert_1.assert(typeof value == "boolean");
            return value;
          // JSON value will be a decimal string. Either numbers or strings are accepted.
          case reflection_info_1.ScalarType.UINT64:
          case reflection_info_1.ScalarType.FIXED64:
            assert_1.assert(typeof value == "number" || typeof value == "string" || typeof value == "bigint");
            let ulong = pb_long_1.PbULong.from(value);
            if (ulong.isZero() && !ed)
              return void 0;
            return ulong.toString();
          // JSON value will be a decimal string. Either numbers or strings are accepted.
          case reflection_info_1.ScalarType.INT64:
          case reflection_info_1.ScalarType.SFIXED64:
          case reflection_info_1.ScalarType.SINT64:
            assert_1.assert(typeof value == "number" || typeof value == "string" || typeof value == "bigint");
            let long = pb_long_1.PbLong.from(value);
            if (long.isZero() && !ed)
              return void 0;
            return long.toString();
          // bytes: JSON value will be the data encoded as a string using standard base64 encoding with paddings.
          // Either standard or URL-safe base64 encoding with/without paddings are accepted.
          case reflection_info_1.ScalarType.BYTES:
            assert_1.assert(value instanceof Uint8Array);
            if (!value.byteLength)
              return ed ? "" : void 0;
            return base64_1.base64encode(value);
        }
      }
    };
    exports2.ReflectionJsonWriter = ReflectionJsonWriter;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-scalar-default.js
var require_reflection_scalar_default = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-scalar-default.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.reflectionScalarDefault = void 0;
    var reflection_info_1 = require_reflection_info();
    var reflection_long_convert_1 = require_reflection_long_convert();
    var pb_long_1 = require_pb_long();
    function reflectionScalarDefault(type, longType = reflection_info_1.LongType.STRING) {
      switch (type) {
        case reflection_info_1.ScalarType.BOOL:
          return false;
        case reflection_info_1.ScalarType.UINT64:
        case reflection_info_1.ScalarType.FIXED64:
          return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbULong.ZERO, longType);
        case reflection_info_1.ScalarType.INT64:
        case reflection_info_1.ScalarType.SFIXED64:
        case reflection_info_1.ScalarType.SINT64:
          return reflection_long_convert_1.reflectionLongConvert(pb_long_1.PbLong.ZERO, longType);
        case reflection_info_1.ScalarType.DOUBLE:
        case reflection_info_1.ScalarType.FLOAT:
          return 0;
        case reflection_info_1.ScalarType.BYTES:
          return new Uint8Array(0);
        case reflection_info_1.ScalarType.STRING:
          return "";
        default:
          return 0;
      }
    }
    exports2.reflectionScalarDefault = reflectionScalarDefault;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-binary-reader.js
var require_reflection_binary_reader = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-binary-reader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReflectionBinaryReader = void 0;
    var binary_format_contract_1 = require_binary_format_contract();
    var reflection_info_1 = require_reflection_info();
    var reflection_long_convert_1 = require_reflection_long_convert();
    var reflection_scalar_default_1 = require_reflection_scalar_default();
    var ReflectionBinaryReader = class {
      constructor(info) {
        this.info = info;
      }
      prepare() {
        var _a;
        if (!this.fieldNoToField) {
          const fieldsInput = (_a = this.info.fields) !== null && _a !== void 0 ? _a : [];
          this.fieldNoToField = new Map(fieldsInput.map((field) => [field.no, field]));
        }
      }
      /**
       * Reads a message from binary format into the target message.
       *
       * Repeated fields are appended. Map entries are added, overwriting
       * existing keys.
       *
       * If a message field is already present, it will be merged with the
       * new data.
       */
      read(reader, message, options, length) {
        this.prepare();
        const end = length === void 0 ? reader.len : reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag(), field = this.fieldNoToField.get(fieldNo);
          if (!field) {
            let u = options.readUnknownField;
            if (u == "throw")
              throw new Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.info.typeName}`);
            let d = reader.skip(wireType);
            if (u !== false)
              (u === true ? binary_format_contract_1.UnknownFieldHandler.onRead : u)(this.info.typeName, message, fieldNo, wireType, d);
            continue;
          }
          let target = message, repeated = field.repeat, localName = field.localName;
          if (field.oneof) {
            target = target[field.oneof];
            if (target.oneofKind !== localName)
              target = message[field.oneof] = {
                oneofKind: localName
              };
          }
          switch (field.kind) {
            case "scalar":
            case "enum":
              let T = field.kind == "enum" ? reflection_info_1.ScalarType.INT32 : field.T;
              let L = field.kind == "scalar" ? field.L : void 0;
              if (repeated) {
                let arr = target[localName];
                if (wireType == binary_format_contract_1.WireType.LengthDelimited && T != reflection_info_1.ScalarType.STRING && T != reflection_info_1.ScalarType.BYTES) {
                  let e = reader.uint32() + reader.pos;
                  while (reader.pos < e)
                    arr.push(this.scalar(reader, T, L));
                } else
                  arr.push(this.scalar(reader, T, L));
              } else
                target[localName] = this.scalar(reader, T, L);
              break;
            case "message":
              if (repeated) {
                let arr = target[localName];
                let msg = field.T().internalBinaryRead(reader, reader.uint32(), options);
                arr.push(msg);
              } else
                target[localName] = field.T().internalBinaryRead(reader, reader.uint32(), options, target[localName]);
              break;
            case "map":
              let [mapKey, mapVal] = this.mapEntry(field, reader, options);
              target[localName][mapKey] = mapVal;
              break;
          }
        }
      }
      /**
       * Read a map field, expecting key field = 1, value field = 2
       */
      mapEntry(field, reader, options) {
        let length = reader.uint32();
        let end = reader.pos + length;
        let key = void 0;
        let val = void 0;
        while (reader.pos < end) {
          let [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case 1:
              if (field.K == reflection_info_1.ScalarType.BOOL)
                key = reader.bool().toString();
              else
                key = this.scalar(reader, field.K, reflection_info_1.LongType.STRING);
              break;
            case 2:
              switch (field.V.kind) {
                case "scalar":
                  val = this.scalar(reader, field.V.T, field.V.L);
                  break;
                case "enum":
                  val = reader.int32();
                  break;
                case "message":
                  val = field.V.T().internalBinaryRead(reader, reader.uint32(), options);
                  break;
              }
              break;
            default:
              throw new Error(`Unknown field ${fieldNo} (wire type ${wireType}) in map entry for ${this.info.typeName}#${field.name}`);
          }
        }
        if (key === void 0) {
          let keyRaw = reflection_scalar_default_1.reflectionScalarDefault(field.K);
          key = field.K == reflection_info_1.ScalarType.BOOL ? keyRaw.toString() : keyRaw;
        }
        if (val === void 0)
          switch (field.V.kind) {
            case "scalar":
              val = reflection_scalar_default_1.reflectionScalarDefault(field.V.T, field.V.L);
              break;
            case "enum":
              val = 0;
              break;
            case "message":
              val = field.V.T().create();
              break;
          }
        return [key, val];
      }
      scalar(reader, type, longType) {
        switch (type) {
          case reflection_info_1.ScalarType.INT32:
            return reader.int32();
          case reflection_info_1.ScalarType.STRING:
            return reader.string();
          case reflection_info_1.ScalarType.BOOL:
            return reader.bool();
          case reflection_info_1.ScalarType.DOUBLE:
            return reader.double();
          case reflection_info_1.ScalarType.FLOAT:
            return reader.float();
          case reflection_info_1.ScalarType.INT64:
            return reflection_long_convert_1.reflectionLongConvert(reader.int64(), longType);
          case reflection_info_1.ScalarType.UINT64:
            return reflection_long_convert_1.reflectionLongConvert(reader.uint64(), longType);
          case reflection_info_1.ScalarType.FIXED64:
            return reflection_long_convert_1.reflectionLongConvert(reader.fixed64(), longType);
          case reflection_info_1.ScalarType.FIXED32:
            return reader.fixed32();
          case reflection_info_1.ScalarType.BYTES:
            return reader.bytes();
          case reflection_info_1.ScalarType.UINT32:
            return reader.uint32();
          case reflection_info_1.ScalarType.SFIXED32:
            return reader.sfixed32();
          case reflection_info_1.ScalarType.SFIXED64:
            return reflection_long_convert_1.reflectionLongConvert(reader.sfixed64(), longType);
          case reflection_info_1.ScalarType.SINT32:
            return reader.sint32();
          case reflection_info_1.ScalarType.SINT64:
            return reflection_long_convert_1.reflectionLongConvert(reader.sint64(), longType);
        }
      }
    };
    exports2.ReflectionBinaryReader = ReflectionBinaryReader;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-binary-writer.js
var require_reflection_binary_writer = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-binary-writer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReflectionBinaryWriter = void 0;
    var binary_format_contract_1 = require_binary_format_contract();
    var reflection_info_1 = require_reflection_info();
    var assert_1 = require_assert();
    var pb_long_1 = require_pb_long();
    var ReflectionBinaryWriter = class {
      constructor(info) {
        this.info = info;
      }
      prepare() {
        if (!this.fields) {
          const fieldsInput = this.info.fields ? this.info.fields.concat() : [];
          this.fields = fieldsInput.sort((a, b) => a.no - b.no);
        }
      }
      /**
       * Writes the message to binary format.
       */
      write(message, writer, options) {
        this.prepare();
        for (const field of this.fields) {
          let value, emitDefault, repeated = field.repeat, localName = field.localName;
          if (field.oneof) {
            const group = message[field.oneof];
            if (group.oneofKind !== localName)
              continue;
            value = group[localName];
            emitDefault = true;
          } else {
            value = message[localName];
            emitDefault = false;
          }
          switch (field.kind) {
            case "scalar":
            case "enum":
              let T = field.kind == "enum" ? reflection_info_1.ScalarType.INT32 : field.T;
              if (repeated) {
                assert_1.assert(Array.isArray(value));
                if (repeated == reflection_info_1.RepeatType.PACKED)
                  this.packed(writer, T, field.no, value);
                else
                  for (const item of value)
                    this.scalar(writer, T, field.no, item, true);
              } else if (value === void 0)
                assert_1.assert(field.opt);
              else
                this.scalar(writer, T, field.no, value, emitDefault || field.opt);
              break;
            case "message":
              if (repeated) {
                assert_1.assert(Array.isArray(value));
                for (const item of value)
                  this.message(writer, options, field.T(), field.no, item);
              } else {
                this.message(writer, options, field.T(), field.no, value);
              }
              break;
            case "map":
              assert_1.assert(typeof value == "object" && value !== null);
              for (const [key, val] of Object.entries(value))
                this.mapEntry(writer, options, field, key, val);
              break;
          }
        }
        let u = options.writeUnknownFields;
        if (u !== false)
          (u === true ? binary_format_contract_1.UnknownFieldHandler.onWrite : u)(this.info.typeName, message, writer);
      }
      mapEntry(writer, options, field, key, value) {
        writer.tag(field.no, binary_format_contract_1.WireType.LengthDelimited);
        writer.fork();
        let keyValue = key;
        switch (field.K) {
          case reflection_info_1.ScalarType.INT32:
          case reflection_info_1.ScalarType.FIXED32:
          case reflection_info_1.ScalarType.UINT32:
          case reflection_info_1.ScalarType.SFIXED32:
          case reflection_info_1.ScalarType.SINT32:
            keyValue = Number.parseInt(key);
            break;
          case reflection_info_1.ScalarType.BOOL:
            assert_1.assert(key == "true" || key == "false");
            keyValue = key == "true";
            break;
        }
        this.scalar(writer, field.K, 1, keyValue, true);
        switch (field.V.kind) {
          case "scalar":
            this.scalar(writer, field.V.T, 2, value, true);
            break;
          case "enum":
            this.scalar(writer, reflection_info_1.ScalarType.INT32, 2, value, true);
            break;
          case "message":
            this.message(writer, options, field.V.T(), 2, value);
            break;
        }
        writer.join();
      }
      message(writer, options, handler, fieldNo, value) {
        if (value === void 0)
          return;
        handler.internalBinaryWrite(value, writer.tag(fieldNo, binary_format_contract_1.WireType.LengthDelimited).fork(), options);
        writer.join();
      }
      /**
       * Write a single scalar value.
       */
      scalar(writer, type, fieldNo, value, emitDefault) {
        let [wireType, method, isDefault] = this.scalarInfo(type, value);
        if (!isDefault || emitDefault) {
          writer.tag(fieldNo, wireType);
          writer[method](value);
        }
      }
      /**
       * Write an array of scalar values in packed format.
       */
      packed(writer, type, fieldNo, value) {
        if (!value.length)
          return;
        assert_1.assert(type !== reflection_info_1.ScalarType.BYTES && type !== reflection_info_1.ScalarType.STRING);
        writer.tag(fieldNo, binary_format_contract_1.WireType.LengthDelimited);
        writer.fork();
        let [, method] = this.scalarInfo(type);
        for (let i = 0; i < value.length; i++)
          writer[method](value[i]);
        writer.join();
      }
      /**
       * Get information for writing a scalar value.
       *
       * Returns tuple:
       * [0]: appropriate WireType
       * [1]: name of the appropriate method of IBinaryWriter
       * [2]: whether the given value is a default value
       *
       * If argument `value` is omitted, [2] is always false.
       */
      scalarInfo(type, value) {
        let t = binary_format_contract_1.WireType.Varint;
        let m;
        let i = value === void 0;
        let d = value === 0;
        switch (type) {
          case reflection_info_1.ScalarType.INT32:
            m = "int32";
            break;
          case reflection_info_1.ScalarType.STRING:
            d = i || !value.length;
            t = binary_format_contract_1.WireType.LengthDelimited;
            m = "string";
            break;
          case reflection_info_1.ScalarType.BOOL:
            d = value === false;
            m = "bool";
            break;
          case reflection_info_1.ScalarType.UINT32:
            m = "uint32";
            break;
          case reflection_info_1.ScalarType.DOUBLE:
            t = binary_format_contract_1.WireType.Bit64;
            m = "double";
            break;
          case reflection_info_1.ScalarType.FLOAT:
            t = binary_format_contract_1.WireType.Bit32;
            m = "float";
            break;
          case reflection_info_1.ScalarType.INT64:
            d = i || pb_long_1.PbLong.from(value).isZero();
            m = "int64";
            break;
          case reflection_info_1.ScalarType.UINT64:
            d = i || pb_long_1.PbULong.from(value).isZero();
            m = "uint64";
            break;
          case reflection_info_1.ScalarType.FIXED64:
            d = i || pb_long_1.PbULong.from(value).isZero();
            t = binary_format_contract_1.WireType.Bit64;
            m = "fixed64";
            break;
          case reflection_info_1.ScalarType.BYTES:
            d = i || !value.byteLength;
            t = binary_format_contract_1.WireType.LengthDelimited;
            m = "bytes";
            break;
          case reflection_info_1.ScalarType.FIXED32:
            t = binary_format_contract_1.WireType.Bit32;
            m = "fixed32";
            break;
          case reflection_info_1.ScalarType.SFIXED32:
            t = binary_format_contract_1.WireType.Bit32;
            m = "sfixed32";
            break;
          case reflection_info_1.ScalarType.SFIXED64:
            d = i || pb_long_1.PbLong.from(value).isZero();
            t = binary_format_contract_1.WireType.Bit64;
            m = "sfixed64";
            break;
          case reflection_info_1.ScalarType.SINT32:
            m = "sint32";
            break;
          case reflection_info_1.ScalarType.SINT64:
            d = i || pb_long_1.PbLong.from(value).isZero();
            m = "sint64";
            break;
        }
        return [t, m, i || d];
      }
    };
    exports2.ReflectionBinaryWriter = ReflectionBinaryWriter;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-create.js
var require_reflection_create = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-create.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.reflectionCreate = void 0;
    var reflection_scalar_default_1 = require_reflection_scalar_default();
    var message_type_contract_1 = require_message_type_contract();
    function reflectionCreate(type) {
      const msg = {};
      Object.defineProperty(msg, message_type_contract_1.MESSAGE_TYPE, { enumerable: false, value: type });
      for (let field of type.fields) {
        let name = field.localName;
        if (field.opt)
          continue;
        if (field.oneof)
          msg[field.oneof] = { oneofKind: void 0 };
        else if (field.repeat)
          msg[name] = [];
        else
          switch (field.kind) {
            case "scalar":
              msg[name] = reflection_scalar_default_1.reflectionScalarDefault(field.T, field.L);
              break;
            case "enum":
              msg[name] = 0;
              break;
            case "map":
              msg[name] = {};
              break;
          }
      }
      return msg;
    }
    exports2.reflectionCreate = reflectionCreate;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-merge-partial.js
var require_reflection_merge_partial = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-merge-partial.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.reflectionMergePartial = void 0;
    function reflectionMergePartial3(info, target, source) {
      let fieldValue, input = source, output;
      for (let field of info.fields) {
        let name = field.localName;
        if (field.oneof) {
          const group = input[field.oneof];
          if ((group === null || group === void 0 ? void 0 : group.oneofKind) == void 0) {
            continue;
          }
          fieldValue = group[name];
          output = target[field.oneof];
          output.oneofKind = group.oneofKind;
          if (fieldValue == void 0) {
            delete output[name];
            continue;
          }
        } else {
          fieldValue = input[name];
          output = target;
          if (fieldValue == void 0) {
            continue;
          }
        }
        if (field.repeat)
          output[name].length = fieldValue.length;
        switch (field.kind) {
          case "scalar":
          case "enum":
            if (field.repeat)
              for (let i = 0; i < fieldValue.length; i++)
                output[name][i] = fieldValue[i];
            else
              output[name] = fieldValue;
            break;
          case "message":
            let T = field.T();
            if (field.repeat)
              for (let i = 0; i < fieldValue.length; i++)
                output[name][i] = T.create(fieldValue[i]);
            else if (output[name] === void 0)
              output[name] = T.create(fieldValue);
            else
              T.mergePartial(output[name], fieldValue);
            break;
          case "map":
            switch (field.V.kind) {
              case "scalar":
              case "enum":
                Object.assign(output[name], fieldValue);
                break;
              case "message":
                let T2 = field.V.T();
                for (let k of Object.keys(fieldValue))
                  output[name][k] = T2.create(fieldValue[k]);
                break;
            }
            break;
        }
      }
    }
    exports2.reflectionMergePartial = reflectionMergePartial3;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-equals.js
var require_reflection_equals = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-equals.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.reflectionEquals = void 0;
    var reflection_info_1 = require_reflection_info();
    function reflectionEquals(info, a, b) {
      if (a === b)
        return true;
      if (!a || !b)
        return false;
      for (let field of info.fields) {
        let localName = field.localName;
        let val_a = field.oneof ? a[field.oneof][localName] : a[localName];
        let val_b = field.oneof ? b[field.oneof][localName] : b[localName];
        switch (field.kind) {
          case "enum":
          case "scalar":
            let t = field.kind == "enum" ? reflection_info_1.ScalarType.INT32 : field.T;
            if (!(field.repeat ? repeatedPrimitiveEq(t, val_a, val_b) : primitiveEq(t, val_a, val_b)))
              return false;
            break;
          case "map":
            if (!(field.V.kind == "message" ? repeatedMsgEq(field.V.T(), objectValues(val_a), objectValues(val_b)) : repeatedPrimitiveEq(field.V.kind == "enum" ? reflection_info_1.ScalarType.INT32 : field.V.T, objectValues(val_a), objectValues(val_b))))
              return false;
            break;
          case "message":
            let T = field.T();
            if (!(field.repeat ? repeatedMsgEq(T, val_a, val_b) : T.equals(val_a, val_b)))
              return false;
            break;
        }
      }
      return true;
    }
    exports2.reflectionEquals = reflectionEquals;
    var objectValues = Object.values;
    function primitiveEq(type, a, b) {
      if (a === b)
        return true;
      if (type !== reflection_info_1.ScalarType.BYTES)
        return false;
      let ba = a;
      let bb = b;
      if (ba.length !== bb.length)
        return false;
      for (let i = 0; i < ba.length; i++)
        if (ba[i] != bb[i])
          return false;
      return true;
    }
    function repeatedPrimitiveEq(type, a, b) {
      if (a.length !== b.length)
        return false;
      for (let i = 0; i < a.length; i++)
        if (!primitiveEq(type, a[i], b[i]))
          return false;
      return true;
    }
    function repeatedMsgEq(type, a, b) {
      if (a.length !== b.length)
        return false;
      for (let i = 0; i < a.length; i++)
        if (!type.equals(a[i], b[i]))
          return false;
      return true;
    }
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/message-type.js
var require_message_type = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/message-type.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MessageType = void 0;
    var reflection_info_1 = require_reflection_info();
    var reflection_type_check_1 = require_reflection_type_check();
    var reflection_json_reader_1 = require_reflection_json_reader();
    var reflection_json_writer_1 = require_reflection_json_writer();
    var reflection_binary_reader_1 = require_reflection_binary_reader();
    var reflection_binary_writer_1 = require_reflection_binary_writer();
    var reflection_create_1 = require_reflection_create();
    var reflection_merge_partial_1 = require_reflection_merge_partial();
    var json_typings_1 = require_json_typings();
    var json_format_contract_1 = require_json_format_contract();
    var reflection_equals_1 = require_reflection_equals();
    var binary_writer_1 = require_binary_writer();
    var binary_reader_1 = require_binary_reader();
    var MessageType3 = class {
      constructor(name, fields, options) {
        this.defaultCheckDepth = 16;
        this.typeName = name;
        this.fields = fields.map(reflection_info_1.normalizeFieldInfo);
        this.options = options !== null && options !== void 0 ? options : {};
        this.refTypeCheck = new reflection_type_check_1.ReflectionTypeCheck(this);
        this.refJsonReader = new reflection_json_reader_1.ReflectionJsonReader(this);
        this.refJsonWriter = new reflection_json_writer_1.ReflectionJsonWriter(this);
        this.refBinReader = new reflection_binary_reader_1.ReflectionBinaryReader(this);
        this.refBinWriter = new reflection_binary_writer_1.ReflectionBinaryWriter(this);
      }
      create(value) {
        let message = reflection_create_1.reflectionCreate(this);
        if (value !== void 0) {
          reflection_merge_partial_1.reflectionMergePartial(this, message, value);
        }
        return message;
      }
      /**
       * Clone the message.
       *
       * Unknown fields are discarded.
       */
      clone(message) {
        let copy = this.create();
        reflection_merge_partial_1.reflectionMergePartial(this, copy, message);
        return copy;
      }
      /**
       * Determines whether two message of the same type have the same field values.
       * Checks for deep equality, traversing repeated fields, oneof groups, maps
       * and messages recursively.
       * Will also return true if both messages are `undefined`.
       */
      equals(a, b) {
        return reflection_equals_1.reflectionEquals(this, a, b);
      }
      /**
       * Is the given value assignable to our message type
       * and contains no [excess properties](https://www.typescriptlang.org/docs/handbook/interfaces.html#excess-property-checks)?
       */
      is(arg, depth = this.defaultCheckDepth) {
        return this.refTypeCheck.is(arg, depth, false);
      }
      /**
       * Is the given value assignable to our message type,
       * regardless of [excess properties](https://www.typescriptlang.org/docs/handbook/interfaces.html#excess-property-checks)?
       */
      isAssignable(arg, depth = this.defaultCheckDepth) {
        return this.refTypeCheck.is(arg, depth, true);
      }
      /**
       * Copy partial data into the target message.
       */
      mergePartial(target, source) {
        reflection_merge_partial_1.reflectionMergePartial(this, target, source);
      }
      /**
       * Create a new message from binary format.
       */
      fromBinary(data, options) {
        let opt = binary_reader_1.binaryReadOptions(options);
        return this.internalBinaryRead(opt.readerFactory(data), data.byteLength, opt);
      }
      /**
       * Read a new message from a JSON value.
       */
      fromJson(json, options) {
        return this.internalJsonRead(json, json_format_contract_1.jsonReadOptions(options));
      }
      /**
       * Read a new message from a JSON string.
       * This is equivalent to `T.fromJson(JSON.parse(json))`.
       */
      fromJsonString(json, options) {
        let value = JSON.parse(json);
        return this.fromJson(value, options);
      }
      /**
       * Write the message to canonical JSON value.
       */
      toJson(message, options) {
        return this.internalJsonWrite(message, json_format_contract_1.jsonWriteOptions(options));
      }
      /**
       * Convert the message to canonical JSON string.
       * This is equivalent to `JSON.stringify(T.toJson(t))`
       */
      toJsonString(message, options) {
        var _a;
        let value = this.toJson(message, options);
        return JSON.stringify(value, null, (_a = options === null || options === void 0 ? void 0 : options.prettySpaces) !== null && _a !== void 0 ? _a : 0);
      }
      /**
       * Write the message to binary format.
       */
      toBinary(message, options) {
        let opt = binary_writer_1.binaryWriteOptions(options);
        return this.internalBinaryWrite(message, opt.writerFactory(), opt).finish();
      }
      /**
       * This is an internal method. If you just want to read a message from
       * JSON, use `fromJson()` or `fromJsonString()`.
       *
       * Reads JSON value and merges the fields into the target
       * according to protobuf rules. If the target is omitted,
       * a new instance is created first.
       */
      internalJsonRead(json, options, target) {
        if (json !== null && typeof json == "object" && !Array.isArray(json)) {
          let message = target !== null && target !== void 0 ? target : this.create();
          this.refJsonReader.read(json, message, options);
          return message;
        }
        throw new Error(`Unable to parse message ${this.typeName} from JSON ${json_typings_1.typeofJsonValue(json)}.`);
      }
      /**
       * This is an internal method. If you just want to write a message
       * to JSON, use `toJson()` or `toJsonString().
       *
       * Writes JSON value and returns it.
       */
      internalJsonWrite(message, options) {
        return this.refJsonWriter.write(message, options);
      }
      /**
       * This is an internal method. If you just want to write a message
       * in binary format, use `toBinary()`.
       *
       * Serializes the message in binary format and appends it to the given
       * writer. Returns passed writer.
       */
      internalBinaryWrite(message, writer, options) {
        this.refBinWriter.write(message, writer, options);
        return writer;
      }
      /**
       * This is an internal method. If you just want to read a message from
       * binary data, use `fromBinary()`.
       *
       * Reads data from binary format and merges the fields into
       * the target according to protobuf rules. If the target is
       * omitted, a new instance is created first.
       */
      internalBinaryRead(reader, length, options, target) {
        let message = target !== null && target !== void 0 ? target : this.create();
        this.refBinReader.read(reader, message, options, length);
        return message;
      }
    };
    exports2.MessageType = MessageType3;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/reflection-contains-message-type.js
var require_reflection_contains_message_type = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/reflection-contains-message-type.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.containsMessageType = void 0;
    var message_type_contract_1 = require_message_type_contract();
    function containsMessageType(msg) {
      return msg[message_type_contract_1.MESSAGE_TYPE] != null;
    }
    exports2.containsMessageType = containsMessageType;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/enum-object.js
var require_enum_object = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/enum-object.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.listEnumNumbers = exports2.listEnumNames = exports2.listEnumValues = exports2.isEnumObject = void 0;
    function isEnumObject(arg) {
      if (typeof arg != "object" || arg === null) {
        return false;
      }
      if (!arg.hasOwnProperty(0)) {
        return false;
      }
      for (let k of Object.keys(arg)) {
        let num = parseInt(k);
        if (!Number.isNaN(num)) {
          let nam = arg[num];
          if (nam === void 0)
            return false;
          if (arg[nam] !== num)
            return false;
        } else {
          let num2 = arg[k];
          if (num2 === void 0)
            return false;
          if (typeof num2 !== "number")
            return false;
          if (arg[num2] === void 0)
            return false;
        }
      }
      return true;
    }
    exports2.isEnumObject = isEnumObject;
    function listEnumValues(enumObject) {
      if (!isEnumObject(enumObject))
        throw new Error("not a typescript enum object");
      let values = [];
      for (let [name, number] of Object.entries(enumObject))
        if (typeof number == "number")
          values.push({ name, number });
      return values;
    }
    exports2.listEnumValues = listEnumValues;
    function listEnumNames(enumObject) {
      return listEnumValues(enumObject).map((val) => val.name);
    }
    exports2.listEnumNames = listEnumNames;
    function listEnumNumbers(enumObject) {
      return listEnumValues(enumObject).map((val) => val.number).filter((num, index, arr) => arr.indexOf(num) == index);
    }
    exports2.listEnumNumbers = listEnumNumbers;
  }
});

// node_modules/@protobuf-ts/runtime/build/commonjs/index.js
var require_commonjs = __commonJS({
  "node_modules/@protobuf-ts/runtime/build/commonjs/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var json_typings_1 = require_json_typings();
    Object.defineProperty(exports2, "typeofJsonValue", { enumerable: true, get: function() {
      return json_typings_1.typeofJsonValue;
    } });
    Object.defineProperty(exports2, "isJsonObject", { enumerable: true, get: function() {
      return json_typings_1.isJsonObject;
    } });
    var base64_1 = require_base64();
    Object.defineProperty(exports2, "base64decode", { enumerable: true, get: function() {
      return base64_1.base64decode;
    } });
    Object.defineProperty(exports2, "base64encode", { enumerable: true, get: function() {
      return base64_1.base64encode;
    } });
    var protobufjs_utf8_1 = require_protobufjs_utf8();
    Object.defineProperty(exports2, "utf8read", { enumerable: true, get: function() {
      return protobufjs_utf8_1.utf8read;
    } });
    var binary_format_contract_1 = require_binary_format_contract();
    Object.defineProperty(exports2, "WireType", { enumerable: true, get: function() {
      return binary_format_contract_1.WireType;
    } });
    Object.defineProperty(exports2, "mergeBinaryOptions", { enumerable: true, get: function() {
      return binary_format_contract_1.mergeBinaryOptions;
    } });
    Object.defineProperty(exports2, "UnknownFieldHandler", { enumerable: true, get: function() {
      return binary_format_contract_1.UnknownFieldHandler;
    } });
    var binary_reader_1 = require_binary_reader();
    Object.defineProperty(exports2, "BinaryReader", { enumerable: true, get: function() {
      return binary_reader_1.BinaryReader;
    } });
    Object.defineProperty(exports2, "binaryReadOptions", { enumerable: true, get: function() {
      return binary_reader_1.binaryReadOptions;
    } });
    var binary_writer_1 = require_binary_writer();
    Object.defineProperty(exports2, "BinaryWriter", { enumerable: true, get: function() {
      return binary_writer_1.BinaryWriter;
    } });
    Object.defineProperty(exports2, "binaryWriteOptions", { enumerable: true, get: function() {
      return binary_writer_1.binaryWriteOptions;
    } });
    var pb_long_1 = require_pb_long();
    Object.defineProperty(exports2, "PbLong", { enumerable: true, get: function() {
      return pb_long_1.PbLong;
    } });
    Object.defineProperty(exports2, "PbULong", { enumerable: true, get: function() {
      return pb_long_1.PbULong;
    } });
    var json_format_contract_1 = require_json_format_contract();
    Object.defineProperty(exports2, "jsonReadOptions", { enumerable: true, get: function() {
      return json_format_contract_1.jsonReadOptions;
    } });
    Object.defineProperty(exports2, "jsonWriteOptions", { enumerable: true, get: function() {
      return json_format_contract_1.jsonWriteOptions;
    } });
    Object.defineProperty(exports2, "mergeJsonOptions", { enumerable: true, get: function() {
      return json_format_contract_1.mergeJsonOptions;
    } });
    var message_type_contract_1 = require_message_type_contract();
    Object.defineProperty(exports2, "MESSAGE_TYPE", { enumerable: true, get: function() {
      return message_type_contract_1.MESSAGE_TYPE;
    } });
    var message_type_1 = require_message_type();
    Object.defineProperty(exports2, "MessageType", { enumerable: true, get: function() {
      return message_type_1.MessageType;
    } });
    var reflection_info_1 = require_reflection_info();
    Object.defineProperty(exports2, "ScalarType", { enumerable: true, get: function() {
      return reflection_info_1.ScalarType;
    } });
    Object.defineProperty(exports2, "LongType", { enumerable: true, get: function() {
      return reflection_info_1.LongType;
    } });
    Object.defineProperty(exports2, "RepeatType", { enumerable: true, get: function() {
      return reflection_info_1.RepeatType;
    } });
    Object.defineProperty(exports2, "normalizeFieldInfo", { enumerable: true, get: function() {
      return reflection_info_1.normalizeFieldInfo;
    } });
    Object.defineProperty(exports2, "readFieldOptions", { enumerable: true, get: function() {
      return reflection_info_1.readFieldOptions;
    } });
    Object.defineProperty(exports2, "readFieldOption", { enumerable: true, get: function() {
      return reflection_info_1.readFieldOption;
    } });
    Object.defineProperty(exports2, "readMessageOption", { enumerable: true, get: function() {
      return reflection_info_1.readMessageOption;
    } });
    var reflection_type_check_1 = require_reflection_type_check();
    Object.defineProperty(exports2, "ReflectionTypeCheck", { enumerable: true, get: function() {
      return reflection_type_check_1.ReflectionTypeCheck;
    } });
    var reflection_create_1 = require_reflection_create();
    Object.defineProperty(exports2, "reflectionCreate", { enumerable: true, get: function() {
      return reflection_create_1.reflectionCreate;
    } });
    var reflection_scalar_default_1 = require_reflection_scalar_default();
    Object.defineProperty(exports2, "reflectionScalarDefault", { enumerable: true, get: function() {
      return reflection_scalar_default_1.reflectionScalarDefault;
    } });
    var reflection_merge_partial_1 = require_reflection_merge_partial();
    Object.defineProperty(exports2, "reflectionMergePartial", { enumerable: true, get: function() {
      return reflection_merge_partial_1.reflectionMergePartial;
    } });
    var reflection_equals_1 = require_reflection_equals();
    Object.defineProperty(exports2, "reflectionEquals", { enumerable: true, get: function() {
      return reflection_equals_1.reflectionEquals;
    } });
    var reflection_binary_reader_1 = require_reflection_binary_reader();
    Object.defineProperty(exports2, "ReflectionBinaryReader", { enumerable: true, get: function() {
      return reflection_binary_reader_1.ReflectionBinaryReader;
    } });
    var reflection_binary_writer_1 = require_reflection_binary_writer();
    Object.defineProperty(exports2, "ReflectionBinaryWriter", { enumerable: true, get: function() {
      return reflection_binary_writer_1.ReflectionBinaryWriter;
    } });
    var reflection_json_reader_1 = require_reflection_json_reader();
    Object.defineProperty(exports2, "ReflectionJsonReader", { enumerable: true, get: function() {
      return reflection_json_reader_1.ReflectionJsonReader;
    } });
    var reflection_json_writer_1 = require_reflection_json_writer();
    Object.defineProperty(exports2, "ReflectionJsonWriter", { enumerable: true, get: function() {
      return reflection_json_writer_1.ReflectionJsonWriter;
    } });
    var reflection_contains_message_type_1 = require_reflection_contains_message_type();
    Object.defineProperty(exports2, "containsMessageType", { enumerable: true, get: function() {
      return reflection_contains_message_type_1.containsMessageType;
    } });
    var oneof_1 = require_oneof();
    Object.defineProperty(exports2, "isOneofGroup", { enumerable: true, get: function() {
      return oneof_1.isOneofGroup;
    } });
    Object.defineProperty(exports2, "setOneofValue", { enumerable: true, get: function() {
      return oneof_1.setOneofValue;
    } });
    Object.defineProperty(exports2, "getOneofValue", { enumerable: true, get: function() {
      return oneof_1.getOneofValue;
    } });
    Object.defineProperty(exports2, "clearOneofValue", { enumerable: true, get: function() {
      return oneof_1.clearOneofValue;
    } });
    Object.defineProperty(exports2, "getSelectedOneofValue", { enumerable: true, get: function() {
      return oneof_1.getSelectedOneofValue;
    } });
    var enum_object_1 = require_enum_object();
    Object.defineProperty(exports2, "listEnumValues", { enumerable: true, get: function() {
      return enum_object_1.listEnumValues;
    } });
    Object.defineProperty(exports2, "listEnumNames", { enumerable: true, get: function() {
      return enum_object_1.listEnumNames;
    } });
    Object.defineProperty(exports2, "listEnumNumbers", { enumerable: true, get: function() {
      return enum_object_1.listEnumNumbers;
    } });
    Object.defineProperty(exports2, "isEnumObject", { enumerable: true, get: function() {
      return enum_object_1.isEnumObject;
    } });
    var lower_camel_case_1 = require_lower_camel_case();
    Object.defineProperty(exports2, "lowerCamelCase", { enumerable: true, get: function() {
      return lower_camel_case_1.lowerCamelCase;
    } });
    var assert_1 = require_assert();
    Object.defineProperty(exports2, "assert", { enumerable: true, get: function() {
      return assert_1.assert;
    } });
    Object.defineProperty(exports2, "assertNever", { enumerable: true, get: function() {
      return assert_1.assertNever;
    } });
    Object.defineProperty(exports2, "assertInt32", { enumerable: true, get: function() {
      return assert_1.assertInt32;
    } });
    Object.defineProperty(exports2, "assertUInt32", { enumerable: true, get: function() {
      return assert_1.assertUInt32;
    } });
    Object.defineProperty(exports2, "assertFloat32", { enumerable: true, get: function() {
      return assert_1.assertFloat32;
    } });
  }
});

// src/proto/api_options.ts
var import_runtime, import_runtime2, import_runtime3, import_runtime4, void$$Type, void$;
var init_api_options = __esm({
  "src/proto/api_options.ts"() {
    import_runtime = __toESM(require_commonjs());
    import_runtime2 = __toESM(require_commonjs());
    import_runtime3 = __toESM(require_commonjs());
    import_runtime4 = __toESM(require_commonjs());
    void$$Type = class extends import_runtime4.MessageType {
      constructor() {
        super("void", []);
      }
      create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, import_runtime3.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime2.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        return target ?? this.create();
      }
      internalBinaryWrite(message, writer, options) {
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    void$ = new void$$Type();
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/reflection-info.js
var require_reflection_info2 = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/reflection-info.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readServiceOption = exports2.readMethodOption = exports2.readMethodOptions = exports2.normalizeMethodInfo = void 0;
    var runtime_1 = require_commonjs();
    function normalizeMethodInfo(method, service) {
      var _a, _b, _c;
      let m = method;
      m.service = service;
      m.localName = (_a = m.localName) !== null && _a !== void 0 ? _a : runtime_1.lowerCamelCase(m.name);
      m.serverStreaming = !!m.serverStreaming;
      m.clientStreaming = !!m.clientStreaming;
      m.options = (_b = m.options) !== null && _b !== void 0 ? _b : {};
      m.idempotency = (_c = m.idempotency) !== null && _c !== void 0 ? _c : void 0;
      return m;
    }
    exports2.normalizeMethodInfo = normalizeMethodInfo;
    function readMethodOptions(service, methodName, extensionName, extensionType) {
      var _a;
      const options = (_a = service.methods.find((m, i) => m.localName === methodName || i === methodName)) === null || _a === void 0 ? void 0 : _a.options;
      return options && options[extensionName] ? extensionType.fromJson(options[extensionName]) : void 0;
    }
    exports2.readMethodOptions = readMethodOptions;
    function readMethodOption(service, methodName, extensionName, extensionType) {
      var _a;
      const options = (_a = service.methods.find((m, i) => m.localName === methodName || i === methodName)) === null || _a === void 0 ? void 0 : _a.options;
      if (!options) {
        return void 0;
      }
      const optionVal = options[extensionName];
      if (optionVal === void 0) {
        return optionVal;
      }
      return extensionType ? extensionType.fromJson(optionVal) : optionVal;
    }
    exports2.readMethodOption = readMethodOption;
    function readServiceOption(service, extensionName, extensionType) {
      const options = service.options;
      if (!options) {
        return void 0;
      }
      const optionVal = options[extensionName];
      if (optionVal === void 0) {
        return optionVal;
      }
      return extensionType ? extensionType.fromJson(optionVal) : optionVal;
    }
    exports2.readServiceOption = readServiceOption;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/service-type.js
var require_service_type = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/service-type.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ServiceType = void 0;
    var reflection_info_1 = require_reflection_info2();
    var ServiceType2 = class {
      constructor(typeName, methods, options) {
        this.typeName = typeName;
        this.methods = methods.map((i) => reflection_info_1.normalizeMethodInfo(i, this));
        this.options = options !== null && options !== void 0 ? options : {};
      }
    };
    exports2.ServiceType = ServiceType2;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/rpc-error.js
var require_rpc_error = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/rpc-error.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RpcError = void 0;
    var RpcError = class extends Error {
      constructor(message, code = "UNKNOWN", meta) {
        super(message);
        this.name = "RpcError";
        Object.setPrototypeOf(this, new.target.prototype);
        this.code = code;
        this.meta = meta !== null && meta !== void 0 ? meta : {};
      }
      toString() {
        const l = [this.name + ": " + this.message];
        if (this.code) {
          l.push("");
          l.push("Code: " + this.code);
        }
        if (this.serviceName && this.methodName) {
          l.push("Method: " + this.serviceName + "/" + this.methodName);
        }
        let m = Object.entries(this.meta);
        if (m.length) {
          l.push("");
          l.push("Meta:");
          for (let [k, v] of m) {
            l.push(`  ${k}: ${v}`);
          }
        }
        return l.join("\n");
      }
    };
    exports2.RpcError = RpcError;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/rpc-options.js
var require_rpc_options = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/rpc-options.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.mergeRpcOptions = void 0;
    var runtime_1 = require_commonjs();
    function mergeRpcOptions(defaults, options) {
      if (!options)
        return defaults;
      let o = {};
      copy(defaults, o);
      copy(options, o);
      for (let key of Object.keys(options)) {
        let val = options[key];
        switch (key) {
          case "jsonOptions":
            o.jsonOptions = runtime_1.mergeJsonOptions(defaults.jsonOptions, o.jsonOptions);
            break;
          case "binaryOptions":
            o.binaryOptions = runtime_1.mergeBinaryOptions(defaults.binaryOptions, o.binaryOptions);
            break;
          case "meta":
            o.meta = {};
            copy(defaults.meta, o.meta);
            copy(options.meta, o.meta);
            break;
          case "interceptors":
            o.interceptors = defaults.interceptors ? defaults.interceptors.concat(val) : val.concat();
            break;
        }
      }
      return o;
    }
    exports2.mergeRpcOptions = mergeRpcOptions;
    function copy(a, into) {
      if (!a)
        return;
      let c = into;
      for (let [k, v] of Object.entries(a)) {
        if (v instanceof Date)
          c[k] = new Date(v.getTime());
        else if (Array.isArray(v))
          c[k] = v.concat();
        else
          c[k] = v;
      }
    }
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/deferred.js
var require_deferred = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/deferred.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Deferred = exports2.DeferredState = void 0;
    var DeferredState;
    (function(DeferredState2) {
      DeferredState2[DeferredState2["PENDING"] = 0] = "PENDING";
      DeferredState2[DeferredState2["REJECTED"] = 1] = "REJECTED";
      DeferredState2[DeferredState2["RESOLVED"] = 2] = "RESOLVED";
    })(DeferredState = exports2.DeferredState || (exports2.DeferredState = {}));
    var Deferred = class {
      /**
       * @param preventUnhandledRejectionWarning - prevents the warning
       * "Unhandled Promise rejection" by adding a noop rejection handler.
       * Working with calls returned from the runtime-rpc package in an
       * async function usually means awaiting one call property after
       * the other. This means that the "status" is not being awaited when
       * an earlier await for the "headers" is rejected. This causes the
       * "unhandled promise reject" warning. A more correct behaviour for
       * calls might be to become aware whether at least one of the
       * promises is handled and swallow the rejection warning for the
       * others.
       */
      constructor(preventUnhandledRejectionWarning = true) {
        this._state = DeferredState.PENDING;
        this._promise = new Promise((resolve, reject) => {
          this._resolve = resolve;
          this._reject = reject;
        });
        if (preventUnhandledRejectionWarning) {
          this._promise.catch((_) => {
          });
        }
      }
      /**
       * Get the current state of the promise.
       */
      get state() {
        return this._state;
      }
      /**
       * Get the deferred promise.
       */
      get promise() {
        return this._promise;
      }
      /**
       * Resolve the promise. Throws if the promise is already resolved or rejected.
       */
      resolve(value) {
        if (this.state !== DeferredState.PENDING)
          throw new Error(`cannot resolve ${DeferredState[this.state].toLowerCase()}`);
        this._resolve(value);
        this._state = DeferredState.RESOLVED;
      }
      /**
       * Reject the promise. Throws if the promise is already resolved or rejected.
       */
      reject(reason) {
        if (this.state !== DeferredState.PENDING)
          throw new Error(`cannot reject ${DeferredState[this.state].toLowerCase()}`);
        this._reject(reason);
        this._state = DeferredState.REJECTED;
      }
      /**
       * Resolve the promise. Ignore if not pending.
       */
      resolvePending(val) {
        if (this._state === DeferredState.PENDING)
          this.resolve(val);
      }
      /**
       * Reject the promise. Ignore if not pending.
       */
      rejectPending(reason) {
        if (this._state === DeferredState.PENDING)
          this.reject(reason);
      }
    };
    exports2.Deferred = Deferred;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/rpc-output-stream.js
var require_rpc_output_stream = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/rpc-output-stream.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RpcOutputStreamController = void 0;
    var deferred_1 = require_deferred();
    var runtime_1 = require_commonjs();
    var RpcOutputStreamController = class {
      constructor() {
        this._lis = {
          nxt: [],
          msg: [],
          err: [],
          cmp: []
        };
        this._closed = false;
      }
      // --- RpcOutputStream callback API
      onNext(callback) {
        return this.addLis(callback, this._lis.nxt);
      }
      onMessage(callback) {
        return this.addLis(callback, this._lis.msg);
      }
      onError(callback) {
        return this.addLis(callback, this._lis.err);
      }
      onComplete(callback) {
        return this.addLis(callback, this._lis.cmp);
      }
      addLis(callback, list) {
        list.push(callback);
        return () => {
          let i = list.indexOf(callback);
          if (i >= 0)
            list.splice(i, 1);
        };
      }
      // remove all listeners
      clearLis() {
        for (let l of Object.values(this._lis))
          l.splice(0, l.length);
      }
      // --- Controller API
      /**
       * Is this stream already closed by a completion or error?
       */
      get closed() {
        return this._closed !== false;
      }
      /**
       * Emit message, close with error, or close successfully, but only one
       * at a time.
       * Can be used to wrap a stream by using the other stream's `onNext`.
       */
      notifyNext(message, error, complete) {
        runtime_1.assert((message ? 1 : 0) + (error ? 1 : 0) + (complete ? 1 : 0) <= 1, "only one emission at a time");
        if (message)
          this.notifyMessage(message);
        if (error)
          this.notifyError(error);
        if (complete)
          this.notifyComplete();
      }
      /**
       * Emits a new message. Throws if stream is closed.
       *
       * Triggers onNext and onMessage callbacks.
       */
      notifyMessage(message) {
        runtime_1.assert(!this.closed, "stream is closed");
        this.pushIt({ value: message, done: false });
        this._lis.msg.forEach((l) => l(message));
        this._lis.nxt.forEach((l) => l(message, void 0, false));
      }
      /**
       * Closes the stream with an error. Throws if stream is closed.
       *
       * Triggers onNext and onError callbacks.
       */
      notifyError(error) {
        runtime_1.assert(!this.closed, "stream is closed");
        this._closed = error;
        this.pushIt(error);
        this._lis.err.forEach((l) => l(error));
        this._lis.nxt.forEach((l) => l(void 0, error, false));
        this.clearLis();
      }
      /**
       * Closes the stream successfully. Throws if stream is closed.
       *
       * Triggers onNext and onComplete callbacks.
       */
      notifyComplete() {
        runtime_1.assert(!this.closed, "stream is closed");
        this._closed = true;
        this.pushIt({ value: null, done: true });
        this._lis.cmp.forEach((l) => l());
        this._lis.nxt.forEach((l) => l(void 0, void 0, true));
        this.clearLis();
      }
      /**
       * Creates an async iterator (that can be used with `for await {...}`)
       * to consume the stream.
       *
       * Some things to note:
       * - If an error occurs, the `for await` will throw it.
       * - If an error occurred before the `for await` was started, `for await`
       *   will re-throw it.
       * - If the stream is already complete, the `for await` will be empty.
       * - If your `for await` consumes slower than the stream produces,
       *   for example because you are relaying messages in a slow operation,
       *   messages are queued.
       */
      [Symbol.asyncIterator]() {
        if (!this._itState) {
          this._itState = { q: [] };
        }
        if (this._closed === true)
          this.pushIt({ value: null, done: true });
        else if (this._closed !== false)
          this.pushIt(this._closed);
        return {
          next: () => {
            let state = this._itState;
            runtime_1.assert(state, "bad state");
            runtime_1.assert(!state.p, "iterator contract broken");
            let first = state.q.shift();
            if (first)
              return "value" in first ? Promise.resolve(first) : Promise.reject(first);
            state.p = new deferred_1.Deferred();
            return state.p.promise;
          }
        };
      }
      // "push" a new iterator result.
      // this either resolves a pending promise, or enqueues the result.
      pushIt(result) {
        let state = this._itState;
        if (!state)
          return;
        if (state.p) {
          const p = state.p;
          runtime_1.assert(p.state == deferred_1.DeferredState.PENDING, "iterator contract broken");
          "value" in result ? p.resolve(result) : p.reject(result);
          delete state.p;
        } else {
          state.q.push(result);
        }
      }
    };
    exports2.RpcOutputStreamController = RpcOutputStreamController;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/unary-call.js
var require_unary_call = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/unary-call.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UnaryCall = void 0;
    var UnaryCall = class {
      constructor(method, requestHeaders, request, headers, response, status, trailers) {
        this.method = method;
        this.requestHeaders = requestHeaders;
        this.request = request;
        this.headers = headers;
        this.response = response;
        this.status = status;
        this.trailers = trailers;
      }
      /**
       * If you are only interested in the final outcome of this call,
       * you can await it to receive a `FinishedUnaryCall`.
       */
      then(onfulfilled, onrejected) {
        return this.promiseFinished().then((value) => onfulfilled ? Promise.resolve(onfulfilled(value)) : value, (reason) => onrejected ? Promise.resolve(onrejected(reason)) : Promise.reject(reason));
      }
      promiseFinished() {
        return __awaiter(this, void 0, void 0, function* () {
          let [headers, response, status, trailers] = yield Promise.all([this.headers, this.response, this.status, this.trailers]);
          return {
            method: this.method,
            requestHeaders: this.requestHeaders,
            request: this.request,
            headers,
            response,
            status,
            trailers
          };
        });
      }
    };
    exports2.UnaryCall = UnaryCall;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/server-streaming-call.js
var require_server_streaming_call = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/server-streaming-call.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ServerStreamingCall = void 0;
    var ServerStreamingCall = class {
      constructor(method, requestHeaders, request, headers, response, status, trailers) {
        this.method = method;
        this.requestHeaders = requestHeaders;
        this.request = request;
        this.headers = headers;
        this.responses = response;
        this.status = status;
        this.trailers = trailers;
      }
      /**
       * Instead of awaiting the response status and trailers, you can
       * just as well await this call itself to receive the server outcome.
       * You should first setup some listeners to the `request` to
       * see the actual messages the server replied with.
       */
      then(onfulfilled, onrejected) {
        return this.promiseFinished().then((value) => onfulfilled ? Promise.resolve(onfulfilled(value)) : value, (reason) => onrejected ? Promise.resolve(onrejected(reason)) : Promise.reject(reason));
      }
      promiseFinished() {
        return __awaiter(this, void 0, void 0, function* () {
          let [headers, status, trailers] = yield Promise.all([this.headers, this.status, this.trailers]);
          return {
            method: this.method,
            requestHeaders: this.requestHeaders,
            request: this.request,
            headers,
            status,
            trailers
          };
        });
      }
    };
    exports2.ServerStreamingCall = ServerStreamingCall;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/client-streaming-call.js
var require_client_streaming_call = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/client-streaming-call.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ClientStreamingCall = void 0;
    var ClientStreamingCall = class {
      constructor(method, requestHeaders, request, headers, response, status, trailers) {
        this.method = method;
        this.requestHeaders = requestHeaders;
        this.requests = request;
        this.headers = headers;
        this.response = response;
        this.status = status;
        this.trailers = trailers;
      }
      /**
       * Instead of awaiting the response status and trailers, you can
       * just as well await this call itself to receive the server outcome.
       * Note that it may still be valid to send more request messages.
       */
      then(onfulfilled, onrejected) {
        return this.promiseFinished().then((value) => onfulfilled ? Promise.resolve(onfulfilled(value)) : value, (reason) => onrejected ? Promise.resolve(onrejected(reason)) : Promise.reject(reason));
      }
      promiseFinished() {
        return __awaiter(this, void 0, void 0, function* () {
          let [headers, response, status, trailers] = yield Promise.all([this.headers, this.response, this.status, this.trailers]);
          return {
            method: this.method,
            requestHeaders: this.requestHeaders,
            headers,
            response,
            status,
            trailers
          };
        });
      }
    };
    exports2.ClientStreamingCall = ClientStreamingCall;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/duplex-streaming-call.js
var require_duplex_streaming_call = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/duplex-streaming-call.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DuplexStreamingCall = void 0;
    var DuplexStreamingCall = class {
      constructor(method, requestHeaders, request, headers, response, status, trailers) {
        this.method = method;
        this.requestHeaders = requestHeaders;
        this.requests = request;
        this.headers = headers;
        this.responses = response;
        this.status = status;
        this.trailers = trailers;
      }
      /**
       * Instead of awaiting the response status and trailers, you can
       * just as well await this call itself to receive the server outcome.
       * Note that it may still be valid to send more request messages.
       */
      then(onfulfilled, onrejected) {
        return this.promiseFinished().then((value) => onfulfilled ? Promise.resolve(onfulfilled(value)) : value, (reason) => onrejected ? Promise.resolve(onrejected(reason)) : Promise.reject(reason));
      }
      promiseFinished() {
        return __awaiter(this, void 0, void 0, function* () {
          let [headers, status, trailers] = yield Promise.all([this.headers, this.status, this.trailers]);
          return {
            method: this.method,
            requestHeaders: this.requestHeaders,
            headers,
            status,
            trailers
          };
        });
      }
    };
    exports2.DuplexStreamingCall = DuplexStreamingCall;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/test-transport.js
var require_test_transport = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/test-transport.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TestTransport = void 0;
    var rpc_error_1 = require_rpc_error();
    var runtime_1 = require_commonjs();
    var rpc_output_stream_1 = require_rpc_output_stream();
    var rpc_options_1 = require_rpc_options();
    var unary_call_1 = require_unary_call();
    var server_streaming_call_1 = require_server_streaming_call();
    var client_streaming_call_1 = require_client_streaming_call();
    var duplex_streaming_call_1 = require_duplex_streaming_call();
    var TestTransport = class _TestTransport {
      /**
       * Initialize with mock data. Omitted fields have default value.
       */
      constructor(data) {
        this.suppressUncaughtRejections = true;
        this.headerDelay = 10;
        this.responseDelay = 50;
        this.betweenResponseDelay = 10;
        this.afterResponseDelay = 10;
        this.data = data !== null && data !== void 0 ? data : {};
      }
      /**
       * Sent message(s) during the last operation.
       */
      get sentMessages() {
        if (this.lastInput instanceof TestInputStream) {
          return this.lastInput.sent;
        } else if (typeof this.lastInput == "object") {
          return [this.lastInput.single];
        }
        return [];
      }
      /**
       * Sending message(s) completed?
       */
      get sendComplete() {
        if (this.lastInput instanceof TestInputStream) {
          return this.lastInput.completed;
        } else if (typeof this.lastInput == "object") {
          return true;
        }
        return false;
      }
      // Creates a promise for response headers from the mock data.
      promiseHeaders() {
        var _a;
        const headers = (_a = this.data.headers) !== null && _a !== void 0 ? _a : _TestTransport.defaultHeaders;
        return headers instanceof rpc_error_1.RpcError ? Promise.reject(headers) : Promise.resolve(headers);
      }
      // Creates a promise for a single, valid, message from the mock data.
      promiseSingleResponse(method) {
        if (this.data.response instanceof rpc_error_1.RpcError) {
          return Promise.reject(this.data.response);
        }
        let r;
        if (Array.isArray(this.data.response)) {
          runtime_1.assert(this.data.response.length > 0);
          r = this.data.response[0];
        } else if (this.data.response !== void 0) {
          r = this.data.response;
        } else {
          r = method.O.create();
        }
        runtime_1.assert(method.O.is(r));
        return Promise.resolve(r);
      }
      /**
       * Pushes response messages from the mock data to the output stream.
       * If an error response, status or trailers are mocked, the stream is
       * closed with the respective error.
       * Otherwise, stream is completed successfully.
       *
       * The returned promise resolves when the stream is closed. It should
       * not reject. If it does, code is broken.
       */
      streamResponses(method, stream, abort) {
        return __awaiter(this, void 0, void 0, function* () {
          const messages = [];
          if (this.data.response === void 0) {
            messages.push(method.O.create());
          } else if (Array.isArray(this.data.response)) {
            for (let msg of this.data.response) {
              runtime_1.assert(method.O.is(msg));
              messages.push(msg);
            }
          } else if (!(this.data.response instanceof rpc_error_1.RpcError)) {
            runtime_1.assert(method.O.is(this.data.response));
            messages.push(this.data.response);
          }
          try {
            yield delay(this.responseDelay, abort)(void 0);
          } catch (error) {
            stream.notifyError(error);
            return;
          }
          if (this.data.response instanceof rpc_error_1.RpcError) {
            stream.notifyError(this.data.response);
            return;
          }
          for (let msg of messages) {
            stream.notifyMessage(msg);
            try {
              yield delay(this.betweenResponseDelay, abort)(void 0);
            } catch (error) {
              stream.notifyError(error);
              return;
            }
          }
          if (this.data.status instanceof rpc_error_1.RpcError) {
            stream.notifyError(this.data.status);
            return;
          }
          if (this.data.trailers instanceof rpc_error_1.RpcError) {
            stream.notifyError(this.data.trailers);
            return;
          }
          stream.notifyComplete();
        });
      }
      // Creates a promise for response status from the mock data.
      promiseStatus() {
        var _a;
        const status = (_a = this.data.status) !== null && _a !== void 0 ? _a : _TestTransport.defaultStatus;
        return status instanceof rpc_error_1.RpcError ? Promise.reject(status) : Promise.resolve(status);
      }
      // Creates a promise for response trailers from the mock data.
      promiseTrailers() {
        var _a;
        const trailers = (_a = this.data.trailers) !== null && _a !== void 0 ? _a : _TestTransport.defaultTrailers;
        return trailers instanceof rpc_error_1.RpcError ? Promise.reject(trailers) : Promise.resolve(trailers);
      }
      maybeSuppressUncaught(...promise) {
        if (this.suppressUncaughtRejections) {
          for (let p of promise) {
            p.catch(() => {
            });
          }
        }
      }
      mergeOptions(options) {
        return rpc_options_1.mergeRpcOptions({}, options);
      }
      unary(method, input, options) {
        var _a;
        const requestHeaders = (_a = options.meta) !== null && _a !== void 0 ? _a : {}, headersPromise = this.promiseHeaders().then(delay(this.headerDelay, options.abort)), responsePromise = headersPromise.catch((_) => {
        }).then(delay(this.responseDelay, options.abort)).then((_) => this.promiseSingleResponse(method)), statusPromise = responsePromise.catch((_) => {
        }).then(delay(this.afterResponseDelay, options.abort)).then((_) => this.promiseStatus()), trailersPromise = responsePromise.catch((_) => {
        }).then(delay(this.afterResponseDelay, options.abort)).then((_) => this.promiseTrailers());
        this.maybeSuppressUncaught(statusPromise, trailersPromise);
        this.lastInput = { single: input };
        return new unary_call_1.UnaryCall(method, requestHeaders, input, headersPromise, responsePromise, statusPromise, trailersPromise);
      }
      serverStreaming(method, input, options) {
        var _a;
        const requestHeaders = (_a = options.meta) !== null && _a !== void 0 ? _a : {}, headersPromise = this.promiseHeaders().then(delay(this.headerDelay, options.abort)), outputStream = new rpc_output_stream_1.RpcOutputStreamController(), responseStreamClosedPromise = headersPromise.then(delay(this.responseDelay, options.abort)).catch(() => {
        }).then(() => this.streamResponses(method, outputStream, options.abort)).then(delay(this.afterResponseDelay, options.abort)), statusPromise = responseStreamClosedPromise.then(() => this.promiseStatus()), trailersPromise = responseStreamClosedPromise.then(() => this.promiseTrailers());
        this.maybeSuppressUncaught(statusPromise, trailersPromise);
        this.lastInput = { single: input };
        return new server_streaming_call_1.ServerStreamingCall(method, requestHeaders, input, headersPromise, outputStream, statusPromise, trailersPromise);
      }
      clientStreaming(method, options) {
        var _a;
        const requestHeaders = (_a = options.meta) !== null && _a !== void 0 ? _a : {}, headersPromise = this.promiseHeaders().then(delay(this.headerDelay, options.abort)), responsePromise = headersPromise.catch((_) => {
        }).then(delay(this.responseDelay, options.abort)).then((_) => this.promiseSingleResponse(method)), statusPromise = responsePromise.catch((_) => {
        }).then(delay(this.afterResponseDelay, options.abort)).then((_) => this.promiseStatus()), trailersPromise = responsePromise.catch((_) => {
        }).then(delay(this.afterResponseDelay, options.abort)).then((_) => this.promiseTrailers());
        this.maybeSuppressUncaught(statusPromise, trailersPromise);
        this.lastInput = new TestInputStream(this.data, options.abort);
        return new client_streaming_call_1.ClientStreamingCall(method, requestHeaders, this.lastInput, headersPromise, responsePromise, statusPromise, trailersPromise);
      }
      duplex(method, options) {
        var _a;
        const requestHeaders = (_a = options.meta) !== null && _a !== void 0 ? _a : {}, headersPromise = this.promiseHeaders().then(delay(this.headerDelay, options.abort)), outputStream = new rpc_output_stream_1.RpcOutputStreamController(), responseStreamClosedPromise = headersPromise.then(delay(this.responseDelay, options.abort)).catch(() => {
        }).then(() => this.streamResponses(method, outputStream, options.abort)).then(delay(this.afterResponseDelay, options.abort)), statusPromise = responseStreamClosedPromise.then(() => this.promiseStatus()), trailersPromise = responseStreamClosedPromise.then(() => this.promiseTrailers());
        this.maybeSuppressUncaught(statusPromise, trailersPromise);
        this.lastInput = new TestInputStream(this.data, options.abort);
        return new duplex_streaming_call_1.DuplexStreamingCall(method, requestHeaders, this.lastInput, headersPromise, outputStream, statusPromise, trailersPromise);
      }
    };
    exports2.TestTransport = TestTransport;
    TestTransport.defaultHeaders = {
      responseHeader: "test"
    };
    TestTransport.defaultStatus = {
      code: "OK",
      detail: "all good"
    };
    TestTransport.defaultTrailers = {
      responseTrailer: "test"
    };
    function delay(ms, abort) {
      return (v) => new Promise((resolve, reject) => {
        if (abort === null || abort === void 0 ? void 0 : abort.aborted) {
          reject(new rpc_error_1.RpcError("user cancel", "CANCELLED"));
        } else {
          const id = setTimeout(() => resolve(v), ms);
          if (abort) {
            abort.addEventListener("abort", (ev) => {
              clearTimeout(id);
              reject(new rpc_error_1.RpcError("user cancel", "CANCELLED"));
            });
          }
        }
      });
    }
    var TestInputStream = class {
      constructor(data, abort) {
        this._completed = false;
        this._sent = [];
        this.data = data;
        this.abort = abort;
      }
      get sent() {
        return this._sent;
      }
      get completed() {
        return this._completed;
      }
      send(message) {
        if (this.data.inputMessage instanceof rpc_error_1.RpcError) {
          return Promise.reject(this.data.inputMessage);
        }
        const delayMs = this.data.inputMessage === void 0 ? 10 : this.data.inputMessage;
        return Promise.resolve(void 0).then(() => {
          this._sent.push(message);
        }).then(delay(delayMs, this.abort));
      }
      complete() {
        if (this.data.inputComplete instanceof rpc_error_1.RpcError) {
          return Promise.reject(this.data.inputComplete);
        }
        const delayMs = this.data.inputComplete === void 0 ? 10 : this.data.inputComplete;
        return Promise.resolve(void 0).then(() => {
          this._completed = true;
        }).then(delay(delayMs, this.abort));
      }
    };
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/rpc-interceptor.js
var require_rpc_interceptor = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/rpc-interceptor.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.stackDuplexStreamingInterceptors = exports2.stackClientStreamingInterceptors = exports2.stackServerStreamingInterceptors = exports2.stackUnaryInterceptors = exports2.stackIntercept = void 0;
    var runtime_1 = require_commonjs();
    function stackIntercept(kind, transport, method, options, input) {
      var _a, _b, _c, _d;
      if (kind == "unary") {
        let tail = (mtd, inp, opt) => transport.unary(mtd, inp, opt);
        for (const curr of ((_a = options.interceptors) !== null && _a !== void 0 ? _a : []).filter((i) => i.interceptUnary).reverse()) {
          const next = tail;
          tail = (mtd, inp, opt) => curr.interceptUnary(next, mtd, inp, opt);
        }
        return tail(method, input, options);
      }
      if (kind == "serverStreaming") {
        let tail = (mtd, inp, opt) => transport.serverStreaming(mtd, inp, opt);
        for (const curr of ((_b = options.interceptors) !== null && _b !== void 0 ? _b : []).filter((i) => i.interceptServerStreaming).reverse()) {
          const next = tail;
          tail = (mtd, inp, opt) => curr.interceptServerStreaming(next, mtd, inp, opt);
        }
        return tail(method, input, options);
      }
      if (kind == "clientStreaming") {
        let tail = (mtd, opt) => transport.clientStreaming(mtd, opt);
        for (const curr of ((_c = options.interceptors) !== null && _c !== void 0 ? _c : []).filter((i) => i.interceptClientStreaming).reverse()) {
          const next = tail;
          tail = (mtd, opt) => curr.interceptClientStreaming(next, mtd, opt);
        }
        return tail(method, options);
      }
      if (kind == "duplex") {
        let tail = (mtd, opt) => transport.duplex(mtd, opt);
        for (const curr of ((_d = options.interceptors) !== null && _d !== void 0 ? _d : []).filter((i) => i.interceptDuplex).reverse()) {
          const next = tail;
          tail = (mtd, opt) => curr.interceptDuplex(next, mtd, opt);
        }
        return tail(method, options);
      }
      runtime_1.assertNever(kind);
    }
    exports2.stackIntercept = stackIntercept;
    function stackUnaryInterceptors(transport, method, input, options) {
      return stackIntercept("unary", transport, method, options, input);
    }
    exports2.stackUnaryInterceptors = stackUnaryInterceptors;
    function stackServerStreamingInterceptors(transport, method, input, options) {
      return stackIntercept("serverStreaming", transport, method, options, input);
    }
    exports2.stackServerStreamingInterceptors = stackServerStreamingInterceptors;
    function stackClientStreamingInterceptors(transport, method, options) {
      return stackIntercept("clientStreaming", transport, method, options);
    }
    exports2.stackClientStreamingInterceptors = stackClientStreamingInterceptors;
    function stackDuplexStreamingInterceptors(transport, method, options) {
      return stackIntercept("duplex", transport, method, options);
    }
    exports2.stackDuplexStreamingInterceptors = stackDuplexStreamingInterceptors;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/server-call-context.js
var require_server_call_context = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/server-call-context.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ServerCallContextController = void 0;
    var ServerCallContextController = class {
      constructor(method, headers, deadline, sendResponseHeadersFn, defaultStatus = { code: "OK", detail: "" }) {
        this._cancelled = false;
        this._listeners = [];
        this.method = method;
        this.headers = headers;
        this.deadline = deadline;
        this.trailers = {};
        this._sendRH = sendResponseHeadersFn;
        this.status = defaultStatus;
      }
      /**
       * Set the call cancelled.
       *
       * Invokes all callbacks registered with onCancel() and
       * sets `cancelled = true`.
       */
      notifyCancelled() {
        if (!this._cancelled) {
          this._cancelled = true;
          for (let l of this._listeners) {
            l();
          }
        }
      }
      /**
       * Send response headers.
       */
      sendResponseHeaders(data) {
        this._sendRH(data);
      }
      /**
       * Is the call cancelled?
       *
       * When the client closes the connection before the server
       * is done, the call is cancelled.
       *
       * If you want to cancel a request on the server, throw a
       * RpcError with the CANCELLED status code.
       */
      get cancelled() {
        return this._cancelled;
      }
      /**
       * Add a callback for cancellation.
       */
      onCancel(callback) {
        const l = this._listeners;
        l.push(callback);
        return () => {
          let i = l.indexOf(callback);
          if (i >= 0)
            l.splice(i, 1);
        };
      }
    };
    exports2.ServerCallContextController = ServerCallContextController;
  }
});

// node_modules/@protobuf-ts/runtime-rpc/build/commonjs/index.js
var require_commonjs2 = __commonJS({
  "node_modules/@protobuf-ts/runtime-rpc/build/commonjs/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var service_type_1 = require_service_type();
    Object.defineProperty(exports2, "ServiceType", { enumerable: true, get: function() {
      return service_type_1.ServiceType;
    } });
    var reflection_info_1 = require_reflection_info2();
    Object.defineProperty(exports2, "readMethodOptions", { enumerable: true, get: function() {
      return reflection_info_1.readMethodOptions;
    } });
    Object.defineProperty(exports2, "readMethodOption", { enumerable: true, get: function() {
      return reflection_info_1.readMethodOption;
    } });
    Object.defineProperty(exports2, "readServiceOption", { enumerable: true, get: function() {
      return reflection_info_1.readServiceOption;
    } });
    var rpc_error_1 = require_rpc_error();
    Object.defineProperty(exports2, "RpcError", { enumerable: true, get: function() {
      return rpc_error_1.RpcError;
    } });
    var rpc_options_1 = require_rpc_options();
    Object.defineProperty(exports2, "mergeRpcOptions", { enumerable: true, get: function() {
      return rpc_options_1.mergeRpcOptions;
    } });
    var rpc_output_stream_1 = require_rpc_output_stream();
    Object.defineProperty(exports2, "RpcOutputStreamController", { enumerable: true, get: function() {
      return rpc_output_stream_1.RpcOutputStreamController;
    } });
    var test_transport_1 = require_test_transport();
    Object.defineProperty(exports2, "TestTransport", { enumerable: true, get: function() {
      return test_transport_1.TestTransport;
    } });
    var deferred_1 = require_deferred();
    Object.defineProperty(exports2, "Deferred", { enumerable: true, get: function() {
      return deferred_1.Deferred;
    } });
    Object.defineProperty(exports2, "DeferredState", { enumerable: true, get: function() {
      return deferred_1.DeferredState;
    } });
    var duplex_streaming_call_1 = require_duplex_streaming_call();
    Object.defineProperty(exports2, "DuplexStreamingCall", { enumerable: true, get: function() {
      return duplex_streaming_call_1.DuplexStreamingCall;
    } });
    var client_streaming_call_1 = require_client_streaming_call();
    Object.defineProperty(exports2, "ClientStreamingCall", { enumerable: true, get: function() {
      return client_streaming_call_1.ClientStreamingCall;
    } });
    var server_streaming_call_1 = require_server_streaming_call();
    Object.defineProperty(exports2, "ServerStreamingCall", { enumerable: true, get: function() {
      return server_streaming_call_1.ServerStreamingCall;
    } });
    var unary_call_1 = require_unary_call();
    Object.defineProperty(exports2, "UnaryCall", { enumerable: true, get: function() {
      return unary_call_1.UnaryCall;
    } });
    var rpc_interceptor_1 = require_rpc_interceptor();
    Object.defineProperty(exports2, "stackIntercept", { enumerable: true, get: function() {
      return rpc_interceptor_1.stackIntercept;
    } });
    Object.defineProperty(exports2, "stackDuplexStreamingInterceptors", { enumerable: true, get: function() {
      return rpc_interceptor_1.stackDuplexStreamingInterceptors;
    } });
    Object.defineProperty(exports2, "stackClientStreamingInterceptors", { enumerable: true, get: function() {
      return rpc_interceptor_1.stackClientStreamingInterceptors;
    } });
    Object.defineProperty(exports2, "stackServerStreamingInterceptors", { enumerable: true, get: function() {
      return rpc_interceptor_1.stackServerStreamingInterceptors;
    } });
    Object.defineProperty(exports2, "stackUnaryInterceptors", { enumerable: true, get: function() {
      return rpc_interceptor_1.stackUnaryInterceptors;
    } });
    var server_call_context_1 = require_server_call_context();
    Object.defineProperty(exports2, "ServerCallContextController", { enumerable: true, get: function() {
      return server_call_context_1.ServerCallContextController;
    } });
  }
});

// src/proto/api.ts
var api_exports = {};
__export(api_exports, {
  APIConnection: () => APIConnection,
  BinarySensorStateResponse: () => BinarySensorStateResponse,
  ButtonCommandRequest: () => ButtonCommandRequest,
  CameraImageRequest: () => CameraImageRequest,
  CameraImageResponse: () => CameraImageResponse,
  ClimateAction: () => ClimateAction,
  ClimateCommandRequest: () => ClimateCommandRequest,
  ClimateFanMode: () => ClimateFanMode,
  ClimateMode: () => ClimateMode,
  ClimatePreset: () => ClimatePreset,
  ClimateStateResponse: () => ClimateStateResponse,
  ClimateSwingMode: () => ClimateSwingMode,
  ColorMode: () => ColorMode,
  ConnectRequest: () => ConnectRequest,
  ConnectResponse: () => ConnectResponse,
  CoverCommandRequest: () => CoverCommandRequest,
  CoverOperation: () => CoverOperation,
  CoverStateResponse: () => CoverStateResponse,
  DeviceInfoRequest: () => DeviceInfoRequest,
  DeviceInfoResponse: () => DeviceInfoResponse,
  DisconnectRequest: () => DisconnectRequest,
  DisconnectResponse: () => DisconnectResponse,
  EntityCategory: () => EntityCategory,
  ExecuteServiceArgument: () => ExecuteServiceArgument,
  ExecuteServiceRequest: () => ExecuteServiceRequest,
  FanCommandRequest: () => FanCommandRequest,
  FanDirection: () => FanDirection,
  FanSpeed: () => FanSpeed,
  FanStateResponse: () => FanStateResponse,
  GetTimeRequest: () => GetTimeRequest,
  GetTimeResponse: () => GetTimeResponse,
  HelloRequest: () => HelloRequest,
  HelloResponse: () => HelloResponse,
  HomeAssistantStateResponse: () => HomeAssistantStateResponse,
  HomeassistantServiceMap: () => HomeassistantServiceMap,
  HomeassistantServiceResponse: () => HomeassistantServiceResponse,
  LegacyCoverCommand: () => LegacyCoverCommand,
  LegacyCoverState: () => LegacyCoverState,
  LightCommandRequest: () => LightCommandRequest,
  LightStateResponse: () => LightStateResponse,
  ListEntitiesBinarySensorResponse: () => ListEntitiesBinarySensorResponse,
  ListEntitiesButtonResponse: () => ListEntitiesButtonResponse,
  ListEntitiesCameraResponse: () => ListEntitiesCameraResponse,
  ListEntitiesClimateResponse: () => ListEntitiesClimateResponse,
  ListEntitiesCoverResponse: () => ListEntitiesCoverResponse,
  ListEntitiesDoneResponse: () => ListEntitiesDoneResponse,
  ListEntitiesFanResponse: () => ListEntitiesFanResponse,
  ListEntitiesLightResponse: () => ListEntitiesLightResponse,
  ListEntitiesLockResponse: () => ListEntitiesLockResponse,
  ListEntitiesNumberResponse: () => ListEntitiesNumberResponse,
  ListEntitiesRequest: () => ListEntitiesRequest,
  ListEntitiesSelectResponse: () => ListEntitiesSelectResponse,
  ListEntitiesSensorResponse: () => ListEntitiesSensorResponse,
  ListEntitiesServicesArgument: () => ListEntitiesServicesArgument,
  ListEntitiesServicesResponse: () => ListEntitiesServicesResponse,
  ListEntitiesSwitchResponse: () => ListEntitiesSwitchResponse,
  ListEntitiesTextSensorResponse: () => ListEntitiesTextSensorResponse,
  LockCommand: () => LockCommand,
  LockCommandRequest: () => LockCommandRequest,
  LockState: () => LockState,
  LockStateResponse: () => LockStateResponse,
  LogLevel: () => LogLevel,
  NumberCommandRequest: () => NumberCommandRequest,
  NumberMode: () => NumberMode,
  NumberStateResponse: () => NumberStateResponse,
  PingRequest: () => PingRequest,
  PingResponse: () => PingResponse,
  SelectCommandRequest: () => SelectCommandRequest,
  SelectStateResponse: () => SelectStateResponse,
  SensorLastResetType: () => SensorLastResetType,
  SensorStateClass: () => SensorStateClass,
  SensorStateResponse: () => SensorStateResponse,
  ServiceArgType: () => ServiceArgType,
  SubscribeHomeAssistantStateResponse: () => SubscribeHomeAssistantStateResponse,
  SubscribeHomeAssistantStatesRequest: () => SubscribeHomeAssistantStatesRequest,
  SubscribeHomeassistantServicesRequest: () => SubscribeHomeassistantServicesRequest,
  SubscribeLogsRequest: () => SubscribeLogsRequest,
  SubscribeLogsResponse: () => SubscribeLogsResponse,
  SubscribeStatesRequest: () => SubscribeStatesRequest,
  SwitchCommandRequest: () => SwitchCommandRequest,
  SwitchStateResponse: () => SwitchStateResponse,
  TextSensorStateResponse: () => TextSensorStateResponse
});
var import_runtime_rpc, import_runtime5, import_runtime6, import_runtime7, import_runtime8, import_runtime9, EntityCategory, LegacyCoverState, CoverOperation, LegacyCoverCommand, FanSpeed, FanDirection, ColorMode, SensorStateClass, SensorLastResetType, LogLevel, ServiceArgType, ClimateMode, ClimateFanMode, ClimateSwingMode, ClimateAction, ClimatePreset, NumberMode, LockState, LockCommand, HelloRequest$Type, HelloRequest, HelloResponse$Type, HelloResponse, ConnectRequest$Type, ConnectRequest, ConnectResponse$Type, ConnectResponse, DisconnectRequest$Type, DisconnectRequest, DisconnectResponse$Type, DisconnectResponse, PingRequest$Type, PingRequest, PingResponse$Type, PingResponse, DeviceInfoRequest$Type, DeviceInfoRequest, DeviceInfoResponse$Type, DeviceInfoResponse, ListEntitiesRequest$Type, ListEntitiesRequest, ListEntitiesDoneResponse$Type, ListEntitiesDoneResponse, SubscribeStatesRequest$Type, SubscribeStatesRequest, ListEntitiesBinarySensorResponse$Type, ListEntitiesBinarySensorResponse, BinarySensorStateResponse$Type, BinarySensorStateResponse, ListEntitiesCoverResponse$Type, ListEntitiesCoverResponse, CoverStateResponse$Type, CoverStateResponse, CoverCommandRequest$Type, CoverCommandRequest, ListEntitiesFanResponse$Type, ListEntitiesFanResponse, FanStateResponse$Type, FanStateResponse, FanCommandRequest$Type, FanCommandRequest, ListEntitiesLightResponse$Type, ListEntitiesLightResponse, LightStateResponse$Type, LightStateResponse, LightCommandRequest$Type, LightCommandRequest, ListEntitiesSensorResponse$Type, ListEntitiesSensorResponse, SensorStateResponse$Type, SensorStateResponse, ListEntitiesSwitchResponse$Type, ListEntitiesSwitchResponse, SwitchStateResponse$Type, SwitchStateResponse, SwitchCommandRequest$Type, SwitchCommandRequest, ListEntitiesTextSensorResponse$Type, ListEntitiesTextSensorResponse, TextSensorStateResponse$Type, TextSensorStateResponse, SubscribeLogsRequest$Type, SubscribeLogsRequest, SubscribeLogsResponse$Type, SubscribeLogsResponse, SubscribeHomeassistantServicesRequest$Type, SubscribeHomeassistantServicesRequest, HomeassistantServiceMap$Type, HomeassistantServiceMap, HomeassistantServiceResponse$Type, HomeassistantServiceResponse, SubscribeHomeAssistantStatesRequest$Type, SubscribeHomeAssistantStatesRequest, SubscribeHomeAssistantStateResponse$Type, SubscribeHomeAssistantStateResponse, HomeAssistantStateResponse$Type, HomeAssistantStateResponse, GetTimeRequest$Type, GetTimeRequest, GetTimeResponse$Type, GetTimeResponse, ListEntitiesServicesArgument$Type, ListEntitiesServicesArgument, ListEntitiesServicesResponse$Type, ListEntitiesServicesResponse, ExecuteServiceArgument$Type, ExecuteServiceArgument, ExecuteServiceRequest$Type, ExecuteServiceRequest, ListEntitiesCameraResponse$Type, ListEntitiesCameraResponse, CameraImageResponse$Type, CameraImageResponse, CameraImageRequest$Type, CameraImageRequest, ListEntitiesClimateResponse$Type, ListEntitiesClimateResponse, ClimateStateResponse$Type, ClimateStateResponse, ClimateCommandRequest$Type, ClimateCommandRequest, ListEntitiesNumberResponse$Type, ListEntitiesNumberResponse, NumberStateResponse$Type, NumberStateResponse, NumberCommandRequest$Type, NumberCommandRequest, ListEntitiesSelectResponse$Type, ListEntitiesSelectResponse, SelectStateResponse$Type, SelectStateResponse, SelectCommandRequest$Type, SelectCommandRequest, ListEntitiesLockResponse$Type, ListEntitiesLockResponse, LockStateResponse$Type, LockStateResponse, LockCommandRequest$Type, LockCommandRequest, ListEntitiesButtonResponse$Type, ListEntitiesButtonResponse, ButtonCommandRequest$Type, ButtonCommandRequest, APIConnection;
var init_api = __esm({
  "src/proto/api.ts"() {
    init_api_options();
    import_runtime_rpc = __toESM(require_commonjs2());
    import_runtime5 = __toESM(require_commonjs());
    import_runtime6 = __toESM(require_commonjs());
    import_runtime7 = __toESM(require_commonjs());
    import_runtime8 = __toESM(require_commonjs());
    import_runtime9 = __toESM(require_commonjs());
    EntityCategory = /* @__PURE__ */ ((EntityCategory2) => {
      EntityCategory2[EntityCategory2["NONE"] = 0] = "NONE";
      EntityCategory2[EntityCategory2["CONFIG"] = 1] = "CONFIG";
      EntityCategory2[EntityCategory2["DIAGNOSTIC"] = 2] = "DIAGNOSTIC";
      return EntityCategory2;
    })(EntityCategory || {});
    LegacyCoverState = /* @__PURE__ */ ((LegacyCoverState2) => {
      LegacyCoverState2[LegacyCoverState2["OPEN"] = 0] = "OPEN";
      LegacyCoverState2[LegacyCoverState2["CLOSED"] = 1] = "CLOSED";
      return LegacyCoverState2;
    })(LegacyCoverState || {});
    CoverOperation = /* @__PURE__ */ ((CoverOperation2) => {
      CoverOperation2[CoverOperation2["IDLE"] = 0] = "IDLE";
      CoverOperation2[CoverOperation2["IS_OPENING"] = 1] = "IS_OPENING";
      CoverOperation2[CoverOperation2["IS_CLOSING"] = 2] = "IS_CLOSING";
      return CoverOperation2;
    })(CoverOperation || {});
    LegacyCoverCommand = /* @__PURE__ */ ((LegacyCoverCommand2) => {
      LegacyCoverCommand2[LegacyCoverCommand2["OPEN"] = 0] = "OPEN";
      LegacyCoverCommand2[LegacyCoverCommand2["CLOSE"] = 1] = "CLOSE";
      LegacyCoverCommand2[LegacyCoverCommand2["STOP"] = 2] = "STOP";
      return LegacyCoverCommand2;
    })(LegacyCoverCommand || {});
    FanSpeed = /* @__PURE__ */ ((FanSpeed2) => {
      FanSpeed2[FanSpeed2["LOW"] = 0] = "LOW";
      FanSpeed2[FanSpeed2["MEDIUM"] = 1] = "MEDIUM";
      FanSpeed2[FanSpeed2["HIGH"] = 2] = "HIGH";
      return FanSpeed2;
    })(FanSpeed || {});
    FanDirection = /* @__PURE__ */ ((FanDirection2) => {
      FanDirection2[FanDirection2["FORWARD"] = 0] = "FORWARD";
      FanDirection2[FanDirection2["REVERSE"] = 1] = "REVERSE";
      return FanDirection2;
    })(FanDirection || {});
    ColorMode = /* @__PURE__ */ ((ColorMode2) => {
      ColorMode2[ColorMode2["UNKNOWN"] = 0] = "UNKNOWN";
      ColorMode2[ColorMode2["ON_OFF"] = 1] = "ON_OFF";
      ColorMode2[ColorMode2["BRIGHTNESS"] = 2] = "BRIGHTNESS";
      ColorMode2[ColorMode2["WHITE"] = 7] = "WHITE";
      ColorMode2[ColorMode2["COLOR_TEMPERATURE"] = 11] = "COLOR_TEMPERATURE";
      ColorMode2[ColorMode2["COLD_WARM_WHITE"] = 19] = "COLD_WARM_WHITE";
      ColorMode2[ColorMode2["RGB"] = 35] = "RGB";
      ColorMode2[ColorMode2["RGB_WHITE"] = 39] = "RGB_WHITE";
      ColorMode2[ColorMode2["RGB_COLOR_TEMPERATURE"] = 47] = "RGB_COLOR_TEMPERATURE";
      ColorMode2[ColorMode2["RGB_COLD_WARM_WHITE"] = 51] = "RGB_COLD_WARM_WHITE";
      return ColorMode2;
    })(ColorMode || {});
    SensorStateClass = /* @__PURE__ */ ((SensorStateClass2) => {
      SensorStateClass2[SensorStateClass2["STATE_CLASS_NONE"] = 0] = "STATE_CLASS_NONE";
      SensorStateClass2[SensorStateClass2["STATE_CLASS_MEASUREMENT"] = 1] = "STATE_CLASS_MEASUREMENT";
      SensorStateClass2[SensorStateClass2["STATE_CLASS_TOTAL_INCREASING"] = 2] = "STATE_CLASS_TOTAL_INCREASING";
      return SensorStateClass2;
    })(SensorStateClass || {});
    SensorLastResetType = /* @__PURE__ */ ((SensorLastResetType2) => {
      SensorLastResetType2[SensorLastResetType2["LAST_RESET_NONE"] = 0] = "LAST_RESET_NONE";
      SensorLastResetType2[SensorLastResetType2["LAST_RESET_NEVER"] = 1] = "LAST_RESET_NEVER";
      SensorLastResetType2[SensorLastResetType2["LAST_RESET_AUTO"] = 2] = "LAST_RESET_AUTO";
      return SensorLastResetType2;
    })(SensorLastResetType || {});
    LogLevel = /* @__PURE__ */ ((LogLevel2) => {
      LogLevel2[LogLevel2["NONE"] = 0] = "NONE";
      LogLevel2[LogLevel2["ERROR"] = 1] = "ERROR";
      LogLevel2[LogLevel2["WARN"] = 2] = "WARN";
      LogLevel2[LogLevel2["INFO"] = 3] = "INFO";
      LogLevel2[LogLevel2["CONFIG"] = 4] = "CONFIG";
      LogLevel2[LogLevel2["DEBUG"] = 5] = "DEBUG";
      LogLevel2[LogLevel2["VERBOSE"] = 6] = "VERBOSE";
      LogLevel2[LogLevel2["VERY_VERBOSE"] = 7] = "VERY_VERBOSE";
      return LogLevel2;
    })(LogLevel || {});
    ServiceArgType = /* @__PURE__ */ ((ServiceArgType2) => {
      ServiceArgType2[ServiceArgType2["BOOL"] = 0] = "BOOL";
      ServiceArgType2[ServiceArgType2["INT"] = 1] = "INT";
      ServiceArgType2[ServiceArgType2["FLOAT"] = 2] = "FLOAT";
      ServiceArgType2[ServiceArgType2["STRING"] = 3] = "STRING";
      ServiceArgType2[ServiceArgType2["BOOL_ARRAY"] = 4] = "BOOL_ARRAY";
      ServiceArgType2[ServiceArgType2["INT_ARRAY"] = 5] = "INT_ARRAY";
      ServiceArgType2[ServiceArgType2["FLOAT_ARRAY"] = 6] = "FLOAT_ARRAY";
      ServiceArgType2[ServiceArgType2["STRING_ARRAY"] = 7] = "STRING_ARRAY";
      return ServiceArgType2;
    })(ServiceArgType || {});
    ClimateMode = /* @__PURE__ */ ((ClimateMode3) => {
      ClimateMode3[ClimateMode3["OFF"] = 0] = "OFF";
      ClimateMode3[ClimateMode3["HEAT_COOL"] = 1] = "HEAT_COOL";
      ClimateMode3[ClimateMode3["COOL"] = 2] = "COOL";
      ClimateMode3[ClimateMode3["HEAT"] = 3] = "HEAT";
      ClimateMode3[ClimateMode3["FAN_ONLY"] = 4] = "FAN_ONLY";
      ClimateMode3[ClimateMode3["DRY"] = 5] = "DRY";
      ClimateMode3[ClimateMode3["AUTO"] = 6] = "AUTO";
      return ClimateMode3;
    })(ClimateMode || {});
    ClimateFanMode = /* @__PURE__ */ ((ClimateFanMode2) => {
      ClimateFanMode2[ClimateFanMode2["CLIMATE_FAN_ON"] = 0] = "CLIMATE_FAN_ON";
      ClimateFanMode2[ClimateFanMode2["CLIMATE_FAN_OFF"] = 1] = "CLIMATE_FAN_OFF";
      ClimateFanMode2[ClimateFanMode2["CLIMATE_FAN_AUTO"] = 2] = "CLIMATE_FAN_AUTO";
      ClimateFanMode2[ClimateFanMode2["CLIMATE_FAN_LOW"] = 3] = "CLIMATE_FAN_LOW";
      ClimateFanMode2[ClimateFanMode2["CLIMATE_FAN_MEDIUM"] = 4] = "CLIMATE_FAN_MEDIUM";
      ClimateFanMode2[ClimateFanMode2["CLIMATE_FAN_HIGH"] = 5] = "CLIMATE_FAN_HIGH";
      ClimateFanMode2[ClimateFanMode2["CLIMATE_FAN_MIDDLE"] = 6] = "CLIMATE_FAN_MIDDLE";
      ClimateFanMode2[ClimateFanMode2["CLIMATE_FAN_FOCUS"] = 7] = "CLIMATE_FAN_FOCUS";
      ClimateFanMode2[ClimateFanMode2["CLIMATE_FAN_DIFFUSE"] = 8] = "CLIMATE_FAN_DIFFUSE";
      return ClimateFanMode2;
    })(ClimateFanMode || {});
    ClimateSwingMode = /* @__PURE__ */ ((ClimateSwingMode2) => {
      ClimateSwingMode2[ClimateSwingMode2["CLIMATE_SWING_OFF"] = 0] = "CLIMATE_SWING_OFF";
      ClimateSwingMode2[ClimateSwingMode2["CLIMATE_SWING_BOTH"] = 1] = "CLIMATE_SWING_BOTH";
      ClimateSwingMode2[ClimateSwingMode2["CLIMATE_SWING_VERTICAL"] = 2] = "CLIMATE_SWING_VERTICAL";
      ClimateSwingMode2[ClimateSwingMode2["CLIMATE_SWING_HORIZONTAL"] = 3] = "CLIMATE_SWING_HORIZONTAL";
      return ClimateSwingMode2;
    })(ClimateSwingMode || {});
    ClimateAction = /* @__PURE__ */ ((ClimateAction2) => {
      ClimateAction2[ClimateAction2["OFF"] = 0] = "OFF";
      ClimateAction2[ClimateAction2["COOLING"] = 2] = "COOLING";
      ClimateAction2[ClimateAction2["HEATING"] = 3] = "HEATING";
      ClimateAction2[ClimateAction2["IDLE"] = 4] = "IDLE";
      ClimateAction2[ClimateAction2["DRYING"] = 5] = "DRYING";
      ClimateAction2[ClimateAction2["FAN"] = 6] = "FAN";
      return ClimateAction2;
    })(ClimateAction || {});
    ClimatePreset = /* @__PURE__ */ ((ClimatePreset2) => {
      ClimatePreset2[ClimatePreset2["NONE"] = 0] = "NONE";
      ClimatePreset2[ClimatePreset2["HOME"] = 1] = "HOME";
      ClimatePreset2[ClimatePreset2["AWAY"] = 2] = "AWAY";
      ClimatePreset2[ClimatePreset2["BOOST"] = 3] = "BOOST";
      ClimatePreset2[ClimatePreset2["COMFORT"] = 4] = "COMFORT";
      ClimatePreset2[ClimatePreset2["ECO"] = 5] = "ECO";
      ClimatePreset2[ClimatePreset2["SLEEP"] = 6] = "SLEEP";
      ClimatePreset2[ClimatePreset2["ACTIVITY"] = 7] = "ACTIVITY";
      return ClimatePreset2;
    })(ClimatePreset || {});
    NumberMode = /* @__PURE__ */ ((NumberMode2) => {
      NumberMode2[NumberMode2["AUTO"] = 0] = "AUTO";
      NumberMode2[NumberMode2["BOX"] = 1] = "BOX";
      NumberMode2[NumberMode2["SLIDER"] = 2] = "SLIDER";
      return NumberMode2;
    })(NumberMode || {});
    LockState = /* @__PURE__ */ ((LockState3) => {
      LockState3[LockState3["NONE"] = 0] = "NONE";
      LockState3[LockState3["LOCKED"] = 1] = "LOCKED";
      LockState3[LockState3["UNLOCKED"] = 2] = "UNLOCKED";
      LockState3[LockState3["JAMMED"] = 3] = "JAMMED";
      LockState3[LockState3["LOCKING"] = 4] = "LOCKING";
      LockState3[LockState3["UNLOCKING"] = 5] = "UNLOCKING";
      return LockState3;
    })(LockState || {});
    LockCommand = /* @__PURE__ */ ((LockCommand3) => {
      LockCommand3[LockCommand3["LOCK_UNLOCK"] = 0] = "LOCK_UNLOCK";
      LockCommand3[LockCommand3["LOCK_LOCK"] = 1] = "LOCK_LOCK";
      LockCommand3[LockCommand3["LOCK_OPEN"] = 2] = "LOCK_OPEN";
      return LockCommand3;
    })(LockCommand || {});
    HelloRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("HelloRequest", [
          {
            no: 1,
            name: "client_info",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          }
        ], { id: 1, source: "SOURCE_CLIENT", no_delay: true });
      }
      create(value) {
        const message = { clientInfo: "" };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string client_info */
            1:
              message.clientInfo = reader.string();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.clientInfo !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.clientInfo);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    HelloRequest = new HelloRequest$Type();
    HelloResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("HelloResponse", [
          {
            no: 1,
            name: "api_version_major",
            kind: "scalar",
            T: 13
            /*ScalarType.UINT32*/
          },
          {
            no: 2,
            name: "api_version_minor",
            kind: "scalar",
            T: 13
            /*ScalarType.UINT32*/
          },
          {
            no: 3,
            name: "server_info",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 4,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          }
        ], { id: 2, source: "SOURCE_SERVER", no_delay: true });
      }
      create(value) {
        const message = { apiVersionMajor: 0, apiVersionMinor: 0, serverInfo: "", name: "" };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* uint32 api_version_major */
            1:
              message.apiVersionMajor = reader.uint32();
              break;
            case /* uint32 api_version_minor */
            2:
              message.apiVersionMinor = reader.uint32();
              break;
            case /* string server_info */
            3:
              message.serverInfo = reader.string();
              break;
            case /* string name */
            4:
              message.name = reader.string();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.apiVersionMajor !== 0)
          writer.tag(1, import_runtime5.WireType.Varint).uint32(message.apiVersionMajor);
        if (message.apiVersionMinor !== 0)
          writer.tag(2, import_runtime5.WireType.Varint).uint32(message.apiVersionMinor);
        if (message.serverInfo !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.serverInfo);
        if (message.name !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.name);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    HelloResponse = new HelloResponse$Type();
    ConnectRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ConnectRequest", [
          {
            no: 1,
            name: "password",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          }
        ], { id: 3, source: "SOURCE_CLIENT", no_delay: true });
      }
      create(value) {
        const message = { password: "" };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string password */
            1:
              message.password = reader.string();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.password !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.password);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ConnectRequest = new ConnectRequest$Type();
    ConnectResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ConnectResponse", [
          {
            no: 1,
            name: "invalid_password",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          }
        ], { id: 4, source: "SOURCE_SERVER", no_delay: true });
      }
      create(value) {
        const message = { invalidPassword: false };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* bool invalid_password */
            1:
              message.invalidPassword = reader.bool();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.invalidPassword !== false)
          writer.tag(1, import_runtime5.WireType.Varint).bool(message.invalidPassword);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ConnectResponse = new ConnectResponse$Type();
    DisconnectRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("DisconnectRequest", [], { id: 5, source: "SOURCE_BOTH", no_delay: true });
      }
      create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        return target ?? this.create();
      }
      internalBinaryWrite(message, writer, options) {
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    DisconnectRequest = new DisconnectRequest$Type();
    DisconnectResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("DisconnectResponse", [], { id: 6, source: "SOURCE_BOTH", no_delay: true });
      }
      create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        return target ?? this.create();
      }
      internalBinaryWrite(message, writer, options) {
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    DisconnectResponse = new DisconnectResponse$Type();
    PingRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("PingRequest", [], { id: 7, source: "SOURCE_BOTH" });
      }
      create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        return target ?? this.create();
      }
      internalBinaryWrite(message, writer, options) {
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    PingRequest = new PingRequest$Type();
    PingResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("PingResponse", [], { id: 8, source: "SOURCE_BOTH" });
      }
      create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        return target ?? this.create();
      }
      internalBinaryWrite(message, writer, options) {
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    PingResponse = new PingResponse$Type();
    DeviceInfoRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("DeviceInfoRequest", [], { id: 9, source: "SOURCE_CLIENT" });
      }
      create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        return target ?? this.create();
      }
      internalBinaryWrite(message, writer, options) {
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    DeviceInfoRequest = new DeviceInfoRequest$Type();
    DeviceInfoResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("DeviceInfoResponse", [
          {
            no: 1,
            name: "uses_password",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 2,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 3,
            name: "mac_address",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 4,
            name: "esphome_version",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 5,
            name: "compilation_time",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 6,
            name: "model",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 7,
            name: "has_deep_sleep",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 8,
            name: "project_name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 9,
            name: "project_version",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 10,
            name: "webserver_port",
            kind: "scalar",
            T: 13
            /*ScalarType.UINT32*/
          }
        ], { id: 10, source: "SOURCE_SERVER" });
      }
      create(value) {
        const message = { usesPassword: false, name: "", macAddress: "", esphomeVersion: "", compilationTime: "", model: "", hasDeepSleep: false, projectName: "", projectVersion: "", webserverPort: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* bool uses_password */
            1:
              message.usesPassword = reader.bool();
              break;
            case /* string name */
            2:
              message.name = reader.string();
              break;
            case /* string mac_address */
            3:
              message.macAddress = reader.string();
              break;
            case /* string esphome_version */
            4:
              message.esphomeVersion = reader.string();
              break;
            case /* string compilation_time */
            5:
              message.compilationTime = reader.string();
              break;
            case /* string model */
            6:
              message.model = reader.string();
              break;
            case /* bool has_deep_sleep */
            7:
              message.hasDeepSleep = reader.bool();
              break;
            case /* string project_name */
            8:
              message.projectName = reader.string();
              break;
            case /* string project_version */
            9:
              message.projectVersion = reader.string();
              break;
            case /* uint32 webserver_port */
            10:
              message.webserverPort = reader.uint32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.usesPassword !== false)
          writer.tag(1, import_runtime5.WireType.Varint).bool(message.usesPassword);
        if (message.name !== "")
          writer.tag(2, import_runtime5.WireType.LengthDelimited).string(message.name);
        if (message.macAddress !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.macAddress);
        if (message.esphomeVersion !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.esphomeVersion);
        if (message.compilationTime !== "")
          writer.tag(5, import_runtime5.WireType.LengthDelimited).string(message.compilationTime);
        if (message.model !== "")
          writer.tag(6, import_runtime5.WireType.LengthDelimited).string(message.model);
        if (message.hasDeepSleep !== false)
          writer.tag(7, import_runtime5.WireType.Varint).bool(message.hasDeepSleep);
        if (message.projectName !== "")
          writer.tag(8, import_runtime5.WireType.LengthDelimited).string(message.projectName);
        if (message.projectVersion !== "")
          writer.tag(9, import_runtime5.WireType.LengthDelimited).string(message.projectVersion);
        if (message.webserverPort !== 0)
          writer.tag(10, import_runtime5.WireType.Varint).uint32(message.webserverPort);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    DeviceInfoResponse = new DeviceInfoResponse$Type();
    ListEntitiesRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesRequest", [], { id: 11, source: "SOURCE_CLIENT" });
      }
      create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        return target ?? this.create();
      }
      internalBinaryWrite(message, writer, options) {
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesRequest = new ListEntitiesRequest$Type();
    ListEntitiesDoneResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesDoneResponse", [], { id: 19, source: "SOURCE_SERVER", no_delay: true });
      }
      create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        return target ?? this.create();
      }
      internalBinaryWrite(message, writer, options) {
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesDoneResponse = new ListEntitiesDoneResponse$Type();
    SubscribeStatesRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("SubscribeStatesRequest", [], { id: 20, source: "SOURCE_CLIENT" });
      }
      create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        return target ?? this.create();
      }
      internalBinaryWrite(message, writer, options) {
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    SubscribeStatesRequest = new SubscribeStatesRequest$Type();
    ListEntitiesBinarySensorResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesBinarySensorResponse", [
          {
            no: 1,
            name: "object_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 3,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 4,
            name: "unique_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 5,
            name: "device_class",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 6,
            name: "is_status_binary_sensor",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 7,
            name: "disabled_by_default",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 8,
            name: "icon",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          { no: 9, name: "entity_category", kind: "enum", T: () => ["EntityCategory", EntityCategory, "ENTITY_CATEGORY_"] }
        ], { id: 12, source: "SOURCE_SERVER", ifdef: "USE_BINARY_SENSOR" });
      }
      create(value) {
        const message = { objectId: "", key: 0, name: "", uniqueId: "", deviceClass: "", isStatusBinarySensor: false, disabledByDefault: false, icon: "", entityCategory: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string object_id */
            1:
              message.objectId = reader.string();
              break;
            case /* fixed32 key */
            2:
              message.key = reader.fixed32();
              break;
            case /* string name */
            3:
              message.name = reader.string();
              break;
            case /* string unique_id */
            4:
              message.uniqueId = reader.string();
              break;
            case /* string device_class */
            5:
              message.deviceClass = reader.string();
              break;
            case /* bool is_status_binary_sensor */
            6:
              message.isStatusBinarySensor = reader.bool();
              break;
            case /* bool disabled_by_default */
            7:
              message.disabledByDefault = reader.bool();
              break;
            case /* string icon */
            8:
              message.icon = reader.string();
              break;
            case /* EntityCategory entity_category */
            9:
              message.entityCategory = reader.int32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.objectId !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.objectId);
        if (message.key !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.name !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.name);
        if (message.uniqueId !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.uniqueId);
        if (message.deviceClass !== "")
          writer.tag(5, import_runtime5.WireType.LengthDelimited).string(message.deviceClass);
        if (message.isStatusBinarySensor !== false)
          writer.tag(6, import_runtime5.WireType.Varint).bool(message.isStatusBinarySensor);
        if (message.disabledByDefault !== false)
          writer.tag(7, import_runtime5.WireType.Varint).bool(message.disabledByDefault);
        if (message.icon !== "")
          writer.tag(8, import_runtime5.WireType.LengthDelimited).string(message.icon);
        if (message.entityCategory !== 0)
          writer.tag(9, import_runtime5.WireType.Varint).int32(message.entityCategory);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesBinarySensorResponse = new ListEntitiesBinarySensorResponse$Type();
    BinarySensorStateResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("BinarySensorStateResponse", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 2,
            name: "state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 3,
            name: "missing_state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          }
        ], { id: 21, source: "SOURCE_SERVER", ifdef: "USE_BINARY_SENSOR", no_delay: true });
      }
      create(value) {
        const message = { key: 0, state: false, missingState: false };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* bool state */
            2:
              message.state = reader.bool();
              break;
            case /* bool missing_state */
            3:
              message.missingState = reader.bool();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.state !== false)
          writer.tag(2, import_runtime5.WireType.Varint).bool(message.state);
        if (message.missingState !== false)
          writer.tag(3, import_runtime5.WireType.Varint).bool(message.missingState);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    BinarySensorStateResponse = new BinarySensorStateResponse$Type();
    ListEntitiesCoverResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesCoverResponse", [
          {
            no: 1,
            name: "object_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 3,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 4,
            name: "unique_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 5,
            name: "assumed_state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 6,
            name: "supports_position",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 7,
            name: "supports_tilt",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 8,
            name: "device_class",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 9,
            name: "disabled_by_default",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 10,
            name: "icon",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          { no: 11, name: "entity_category", kind: "enum", T: () => ["EntityCategory", EntityCategory, "ENTITY_CATEGORY_"] }
        ], { id: 13, source: "SOURCE_SERVER", ifdef: "USE_COVER" });
      }
      create(value) {
        const message = { objectId: "", key: 0, name: "", uniqueId: "", assumedState: false, supportsPosition: false, supportsTilt: false, deviceClass: "", disabledByDefault: false, icon: "", entityCategory: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string object_id */
            1:
              message.objectId = reader.string();
              break;
            case /* fixed32 key */
            2:
              message.key = reader.fixed32();
              break;
            case /* string name */
            3:
              message.name = reader.string();
              break;
            case /* string unique_id */
            4:
              message.uniqueId = reader.string();
              break;
            case /* bool assumed_state */
            5:
              message.assumedState = reader.bool();
              break;
            case /* bool supports_position */
            6:
              message.supportsPosition = reader.bool();
              break;
            case /* bool supports_tilt */
            7:
              message.supportsTilt = reader.bool();
              break;
            case /* string device_class */
            8:
              message.deviceClass = reader.string();
              break;
            case /* bool disabled_by_default */
            9:
              message.disabledByDefault = reader.bool();
              break;
            case /* string icon */
            10:
              message.icon = reader.string();
              break;
            case /* EntityCategory entity_category */
            11:
              message.entityCategory = reader.int32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.objectId !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.objectId);
        if (message.key !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.name !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.name);
        if (message.uniqueId !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.uniqueId);
        if (message.assumedState !== false)
          writer.tag(5, import_runtime5.WireType.Varint).bool(message.assumedState);
        if (message.supportsPosition !== false)
          writer.tag(6, import_runtime5.WireType.Varint).bool(message.supportsPosition);
        if (message.supportsTilt !== false)
          writer.tag(7, import_runtime5.WireType.Varint).bool(message.supportsTilt);
        if (message.deviceClass !== "")
          writer.tag(8, import_runtime5.WireType.LengthDelimited).string(message.deviceClass);
        if (message.disabledByDefault !== false)
          writer.tag(9, import_runtime5.WireType.Varint).bool(message.disabledByDefault);
        if (message.icon !== "")
          writer.tag(10, import_runtime5.WireType.LengthDelimited).string(message.icon);
        if (message.entityCategory !== 0)
          writer.tag(11, import_runtime5.WireType.Varint).int32(message.entityCategory);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesCoverResponse = new ListEntitiesCoverResponse$Type();
    CoverStateResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("CoverStateResponse", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          { no: 2, name: "legacy_state", kind: "enum", T: () => ["LegacyCoverState", LegacyCoverState, "LEGACY_COVER_STATE_"] },
          {
            no: 3,
            name: "position",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 4,
            name: "tilt",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          { no: 5, name: "current_operation", kind: "enum", T: () => ["CoverOperation", CoverOperation, "COVER_OPERATION_"] }
        ], { id: 22, source: "SOURCE_SERVER", ifdef: "USE_COVER", no_delay: true });
      }
      create(value) {
        const message = { key: 0, legacyState: 0, position: 0, tilt: 0, currentOperation: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* LegacyCoverState legacy_state */
            2:
              message.legacyState = reader.int32();
              break;
            case /* float position */
            3:
              message.position = reader.float();
              break;
            case /* float tilt */
            4:
              message.tilt = reader.float();
              break;
            case /* CoverOperation current_operation */
            5:
              message.currentOperation = reader.int32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.legacyState !== 0)
          writer.tag(2, import_runtime5.WireType.Varint).int32(message.legacyState);
        if (message.position !== 0)
          writer.tag(3, import_runtime5.WireType.Bit32).float(message.position);
        if (message.tilt !== 0)
          writer.tag(4, import_runtime5.WireType.Bit32).float(message.tilt);
        if (message.currentOperation !== 0)
          writer.tag(5, import_runtime5.WireType.Varint).int32(message.currentOperation);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    CoverStateResponse = new CoverStateResponse$Type();
    CoverCommandRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("CoverCommandRequest", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 2,
            name: "has_legacy_command",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 3, name: "legacy_command", kind: "enum", T: () => ["LegacyCoverCommand", LegacyCoverCommand, "LEGACY_COVER_COMMAND_"] },
          {
            no: 4,
            name: "has_position",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 5,
            name: "position",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 6,
            name: "has_tilt",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 7,
            name: "tilt",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 8,
            name: "stop",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          }
        ], { id: 30, source: "SOURCE_CLIENT", ifdef: "USE_COVER", no_delay: true });
      }
      create(value) {
        const message = { key: 0, hasLegacyCommand: false, legacyCommand: 0, hasPosition: false, position: 0, hasTilt: false, tilt: 0, stop: false };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* bool has_legacy_command */
            2:
              message.hasLegacyCommand = reader.bool();
              break;
            case /* LegacyCoverCommand legacy_command */
            3:
              message.legacyCommand = reader.int32();
              break;
            case /* bool has_position */
            4:
              message.hasPosition = reader.bool();
              break;
            case /* float position */
            5:
              message.position = reader.float();
              break;
            case /* bool has_tilt */
            6:
              message.hasTilt = reader.bool();
              break;
            case /* float tilt */
            7:
              message.tilt = reader.float();
              break;
            case /* bool stop */
            8:
              message.stop = reader.bool();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.hasLegacyCommand !== false)
          writer.tag(2, import_runtime5.WireType.Varint).bool(message.hasLegacyCommand);
        if (message.legacyCommand !== 0)
          writer.tag(3, import_runtime5.WireType.Varint).int32(message.legacyCommand);
        if (message.hasPosition !== false)
          writer.tag(4, import_runtime5.WireType.Varint).bool(message.hasPosition);
        if (message.position !== 0)
          writer.tag(5, import_runtime5.WireType.Bit32).float(message.position);
        if (message.hasTilt !== false)
          writer.tag(6, import_runtime5.WireType.Varint).bool(message.hasTilt);
        if (message.tilt !== 0)
          writer.tag(7, import_runtime5.WireType.Bit32).float(message.tilt);
        if (message.stop !== false)
          writer.tag(8, import_runtime5.WireType.Varint).bool(message.stop);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    CoverCommandRequest = new CoverCommandRequest$Type();
    ListEntitiesFanResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesFanResponse", [
          {
            no: 1,
            name: "object_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 3,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 4,
            name: "unique_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 5,
            name: "supports_oscillation",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 6,
            name: "supports_speed",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 7,
            name: "supports_direction",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 8,
            name: "supported_speed_count",
            kind: "scalar",
            T: 5
            /*ScalarType.INT32*/
          },
          {
            no: 9,
            name: "disabled_by_default",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 10,
            name: "icon",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          { no: 11, name: "entity_category", kind: "enum", T: () => ["EntityCategory", EntityCategory, "ENTITY_CATEGORY_"] }
        ], { id: 14, source: "SOURCE_SERVER", ifdef: "USE_FAN" });
      }
      create(value) {
        const message = { objectId: "", key: 0, name: "", uniqueId: "", supportsOscillation: false, supportsSpeed: false, supportsDirection: false, supportedSpeedCount: 0, disabledByDefault: false, icon: "", entityCategory: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string object_id */
            1:
              message.objectId = reader.string();
              break;
            case /* fixed32 key */
            2:
              message.key = reader.fixed32();
              break;
            case /* string name */
            3:
              message.name = reader.string();
              break;
            case /* string unique_id */
            4:
              message.uniqueId = reader.string();
              break;
            case /* bool supports_oscillation */
            5:
              message.supportsOscillation = reader.bool();
              break;
            case /* bool supports_speed */
            6:
              message.supportsSpeed = reader.bool();
              break;
            case /* bool supports_direction */
            7:
              message.supportsDirection = reader.bool();
              break;
            case /* int32 supported_speed_count */
            8:
              message.supportedSpeedCount = reader.int32();
              break;
            case /* bool disabled_by_default */
            9:
              message.disabledByDefault = reader.bool();
              break;
            case /* string icon */
            10:
              message.icon = reader.string();
              break;
            case /* EntityCategory entity_category */
            11:
              message.entityCategory = reader.int32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.objectId !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.objectId);
        if (message.key !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.name !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.name);
        if (message.uniqueId !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.uniqueId);
        if (message.supportsOscillation !== false)
          writer.tag(5, import_runtime5.WireType.Varint).bool(message.supportsOscillation);
        if (message.supportsSpeed !== false)
          writer.tag(6, import_runtime5.WireType.Varint).bool(message.supportsSpeed);
        if (message.supportsDirection !== false)
          writer.tag(7, import_runtime5.WireType.Varint).bool(message.supportsDirection);
        if (message.supportedSpeedCount !== 0)
          writer.tag(8, import_runtime5.WireType.Varint).int32(message.supportedSpeedCount);
        if (message.disabledByDefault !== false)
          writer.tag(9, import_runtime5.WireType.Varint).bool(message.disabledByDefault);
        if (message.icon !== "")
          writer.tag(10, import_runtime5.WireType.LengthDelimited).string(message.icon);
        if (message.entityCategory !== 0)
          writer.tag(11, import_runtime5.WireType.Varint).int32(message.entityCategory);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesFanResponse = new ListEntitiesFanResponse$Type();
    FanStateResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("FanStateResponse", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 2,
            name: "state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 3,
            name: "oscillating",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 4, name: "speed", kind: "enum", T: () => ["FanSpeed", FanSpeed, "FAN_SPEED_"] },
          { no: 5, name: "direction", kind: "enum", T: () => ["FanDirection", FanDirection, "FAN_DIRECTION_"] },
          {
            no: 6,
            name: "speed_level",
            kind: "scalar",
            T: 5
            /*ScalarType.INT32*/
          }
        ], { id: 23, source: "SOURCE_SERVER", ifdef: "USE_FAN", no_delay: true });
      }
      create(value) {
        const message = { key: 0, state: false, oscillating: false, speed: 0, direction: 0, speedLevel: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* bool state */
            2:
              message.state = reader.bool();
              break;
            case /* bool oscillating */
            3:
              message.oscillating = reader.bool();
              break;
            case /* FanSpeed speed = 4 [deprecated = true];*/
            4:
              message.speed = reader.int32();
              break;
            case /* FanDirection direction */
            5:
              message.direction = reader.int32();
              break;
            case /* int32 speed_level */
            6:
              message.speedLevel = reader.int32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.state !== false)
          writer.tag(2, import_runtime5.WireType.Varint).bool(message.state);
        if (message.oscillating !== false)
          writer.tag(3, import_runtime5.WireType.Varint).bool(message.oscillating);
        if (message.speed !== 0)
          writer.tag(4, import_runtime5.WireType.Varint).int32(message.speed);
        if (message.direction !== 0)
          writer.tag(5, import_runtime5.WireType.Varint).int32(message.direction);
        if (message.speedLevel !== 0)
          writer.tag(6, import_runtime5.WireType.Varint).int32(message.speedLevel);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    FanStateResponse = new FanStateResponse$Type();
    FanCommandRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("FanCommandRequest", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 2,
            name: "has_state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 3,
            name: "state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 4,
            name: "has_speed",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 5, name: "speed", kind: "enum", T: () => ["FanSpeed", FanSpeed, "FAN_SPEED_"] },
          {
            no: 6,
            name: "has_oscillating",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 7,
            name: "oscillating",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 8,
            name: "has_direction",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 9, name: "direction", kind: "enum", T: () => ["FanDirection", FanDirection, "FAN_DIRECTION_"] },
          {
            no: 10,
            name: "has_speed_level",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 11,
            name: "speed_level",
            kind: "scalar",
            T: 5
            /*ScalarType.INT32*/
          }
        ], { id: 31, source: "SOURCE_CLIENT", ifdef: "USE_FAN", no_delay: true });
      }
      create(value) {
        const message = { key: 0, hasState: false, state: false, hasSpeed: false, speed: 0, hasOscillating: false, oscillating: false, hasDirection: false, direction: 0, hasSpeedLevel: false, speedLevel: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* bool has_state */
            2:
              message.hasState = reader.bool();
              break;
            case /* bool state */
            3:
              message.state = reader.bool();
              break;
            case /* bool has_speed = 4 [deprecated = true];*/
            4:
              message.hasSpeed = reader.bool();
              break;
            case /* FanSpeed speed = 5 [deprecated = true];*/
            5:
              message.speed = reader.int32();
              break;
            case /* bool has_oscillating */
            6:
              message.hasOscillating = reader.bool();
              break;
            case /* bool oscillating */
            7:
              message.oscillating = reader.bool();
              break;
            case /* bool has_direction */
            8:
              message.hasDirection = reader.bool();
              break;
            case /* FanDirection direction */
            9:
              message.direction = reader.int32();
              break;
            case /* bool has_speed_level */
            10:
              message.hasSpeedLevel = reader.bool();
              break;
            case /* int32 speed_level */
            11:
              message.speedLevel = reader.int32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.hasState !== false)
          writer.tag(2, import_runtime5.WireType.Varint).bool(message.hasState);
        if (message.state !== false)
          writer.tag(3, import_runtime5.WireType.Varint).bool(message.state);
        if (message.hasSpeed !== false)
          writer.tag(4, import_runtime5.WireType.Varint).bool(message.hasSpeed);
        if (message.speed !== 0)
          writer.tag(5, import_runtime5.WireType.Varint).int32(message.speed);
        if (message.hasOscillating !== false)
          writer.tag(6, import_runtime5.WireType.Varint).bool(message.hasOscillating);
        if (message.oscillating !== false)
          writer.tag(7, import_runtime5.WireType.Varint).bool(message.oscillating);
        if (message.hasDirection !== false)
          writer.tag(8, import_runtime5.WireType.Varint).bool(message.hasDirection);
        if (message.direction !== 0)
          writer.tag(9, import_runtime5.WireType.Varint).int32(message.direction);
        if (message.hasSpeedLevel !== false)
          writer.tag(10, import_runtime5.WireType.Varint).bool(message.hasSpeedLevel);
        if (message.speedLevel !== 0)
          writer.tag(11, import_runtime5.WireType.Varint).int32(message.speedLevel);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    FanCommandRequest = new FanCommandRequest$Type();
    ListEntitiesLightResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesLightResponse", [
          {
            no: 1,
            name: "object_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 3,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 4,
            name: "unique_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          { no: 12, name: "supported_color_modes", kind: "enum", repeat: 1, T: () => ["ColorMode", ColorMode, "COLOR_MODE_"] },
          {
            no: 5,
            name: "legacy_supports_brightness",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 6,
            name: "legacy_supports_rgb",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 7,
            name: "legacy_supports_white_value",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 8,
            name: "legacy_supports_color_temperature",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 9,
            name: "min_mireds",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 10,
            name: "max_mireds",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 11,
            name: "effects",
            kind: "scalar",
            repeat: 2,
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 13,
            name: "disabled_by_default",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 14,
            name: "icon",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          { no: 15, name: "entity_category", kind: "enum", T: () => ["EntityCategory", EntityCategory, "ENTITY_CATEGORY_"] }
        ], { id: 15, source: "SOURCE_SERVER", ifdef: "USE_LIGHT" });
      }
      create(value) {
        const message = { objectId: "", key: 0, name: "", uniqueId: "", supportedColorModes: [], legacySupportsBrightness: false, legacySupportsRgb: false, legacySupportsWhiteValue: false, legacySupportsColorTemperature: false, minMireds: 0, maxMireds: 0, effects: [], disabledByDefault: false, icon: "", entityCategory: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string object_id */
            1:
              message.objectId = reader.string();
              break;
            case /* fixed32 key */
            2:
              message.key = reader.fixed32();
              break;
            case /* string name */
            3:
              message.name = reader.string();
              break;
            case /* string unique_id */
            4:
              message.uniqueId = reader.string();
              break;
            case /* repeated ColorMode supported_color_modes */
            12:
              if (wireType === import_runtime5.WireType.LengthDelimited)
                for (let e = reader.int32() + reader.pos; reader.pos < e; )
                  message.supportedColorModes.push(reader.int32());
              else
                message.supportedColorModes.push(reader.int32());
              break;
            case /* bool legacy_supports_brightness = 5 [deprecated = true];*/
            5:
              message.legacySupportsBrightness = reader.bool();
              break;
            case /* bool legacy_supports_rgb = 6 [deprecated = true];*/
            6:
              message.legacySupportsRgb = reader.bool();
              break;
            case /* bool legacy_supports_white_value = 7 [deprecated = true];*/
            7:
              message.legacySupportsWhiteValue = reader.bool();
              break;
            case /* bool legacy_supports_color_temperature = 8 [deprecated = true];*/
            8:
              message.legacySupportsColorTemperature = reader.bool();
              break;
            case /* float min_mireds */
            9:
              message.minMireds = reader.float();
              break;
            case /* float max_mireds */
            10:
              message.maxMireds = reader.float();
              break;
            case /* repeated string effects */
            11:
              message.effects.push(reader.string());
              break;
            case /* bool disabled_by_default */
            13:
              message.disabledByDefault = reader.bool();
              break;
            case /* string icon */
            14:
              message.icon = reader.string();
              break;
            case /* EntityCategory entity_category */
            15:
              message.entityCategory = reader.int32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.objectId !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.objectId);
        if (message.key !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.name !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.name);
        if (message.uniqueId !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.uniqueId);
        if (message.supportedColorModes.length) {
          writer.tag(12, import_runtime5.WireType.LengthDelimited).fork();
          for (let i = 0; i < message.supportedColorModes.length; i++)
            writer.int32(message.supportedColorModes[i]);
          writer.join();
        }
        if (message.legacySupportsBrightness !== false)
          writer.tag(5, import_runtime5.WireType.Varint).bool(message.legacySupportsBrightness);
        if (message.legacySupportsRgb !== false)
          writer.tag(6, import_runtime5.WireType.Varint).bool(message.legacySupportsRgb);
        if (message.legacySupportsWhiteValue !== false)
          writer.tag(7, import_runtime5.WireType.Varint).bool(message.legacySupportsWhiteValue);
        if (message.legacySupportsColorTemperature !== false)
          writer.tag(8, import_runtime5.WireType.Varint).bool(message.legacySupportsColorTemperature);
        if (message.minMireds !== 0)
          writer.tag(9, import_runtime5.WireType.Bit32).float(message.minMireds);
        if (message.maxMireds !== 0)
          writer.tag(10, import_runtime5.WireType.Bit32).float(message.maxMireds);
        for (let i = 0; i < message.effects.length; i++)
          writer.tag(11, import_runtime5.WireType.LengthDelimited).string(message.effects[i]);
        if (message.disabledByDefault !== false)
          writer.tag(13, import_runtime5.WireType.Varint).bool(message.disabledByDefault);
        if (message.icon !== "")
          writer.tag(14, import_runtime5.WireType.LengthDelimited).string(message.icon);
        if (message.entityCategory !== 0)
          writer.tag(15, import_runtime5.WireType.Varint).int32(message.entityCategory);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesLightResponse = new ListEntitiesLightResponse$Type();
    LightStateResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("LightStateResponse", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 2,
            name: "state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 3,
            name: "brightness",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          { no: 11, name: "color_mode", kind: "enum", T: () => ["ColorMode", ColorMode, "COLOR_MODE_"] },
          {
            no: 10,
            name: "color_brightness",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 4,
            name: "red",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 5,
            name: "green",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 6,
            name: "blue",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 7,
            name: "white",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 8,
            name: "color_temperature",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 12,
            name: "cold_white",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 13,
            name: "warm_white",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 9,
            name: "effect",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          }
        ], { id: 24, source: "SOURCE_SERVER", ifdef: "USE_LIGHT", no_delay: true });
      }
      create(value) {
        const message = { key: 0, state: false, brightness: 0, colorMode: 0, colorBrightness: 0, red: 0, green: 0, blue: 0, white: 0, colorTemperature: 0, coldWhite: 0, warmWhite: 0, effect: "" };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* bool state */
            2:
              message.state = reader.bool();
              break;
            case /* float brightness */
            3:
              message.brightness = reader.float();
              break;
            case /* ColorMode color_mode */
            11:
              message.colorMode = reader.int32();
              break;
            case /* float color_brightness */
            10:
              message.colorBrightness = reader.float();
              break;
            case /* float red */
            4:
              message.red = reader.float();
              break;
            case /* float green */
            5:
              message.green = reader.float();
              break;
            case /* float blue */
            6:
              message.blue = reader.float();
              break;
            case /* float white */
            7:
              message.white = reader.float();
              break;
            case /* float color_temperature */
            8:
              message.colorTemperature = reader.float();
              break;
            case /* float cold_white */
            12:
              message.coldWhite = reader.float();
              break;
            case /* float warm_white */
            13:
              message.warmWhite = reader.float();
              break;
            case /* string effect */
            9:
              message.effect = reader.string();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.state !== false)
          writer.tag(2, import_runtime5.WireType.Varint).bool(message.state);
        if (message.brightness !== 0)
          writer.tag(3, import_runtime5.WireType.Bit32).float(message.brightness);
        if (message.colorMode !== 0)
          writer.tag(11, import_runtime5.WireType.Varint).int32(message.colorMode);
        if (message.colorBrightness !== 0)
          writer.tag(10, import_runtime5.WireType.Bit32).float(message.colorBrightness);
        if (message.red !== 0)
          writer.tag(4, import_runtime5.WireType.Bit32).float(message.red);
        if (message.green !== 0)
          writer.tag(5, import_runtime5.WireType.Bit32).float(message.green);
        if (message.blue !== 0)
          writer.tag(6, import_runtime5.WireType.Bit32).float(message.blue);
        if (message.white !== 0)
          writer.tag(7, import_runtime5.WireType.Bit32).float(message.white);
        if (message.colorTemperature !== 0)
          writer.tag(8, import_runtime5.WireType.Bit32).float(message.colorTemperature);
        if (message.coldWhite !== 0)
          writer.tag(12, import_runtime5.WireType.Bit32).float(message.coldWhite);
        if (message.warmWhite !== 0)
          writer.tag(13, import_runtime5.WireType.Bit32).float(message.warmWhite);
        if (message.effect !== "")
          writer.tag(9, import_runtime5.WireType.LengthDelimited).string(message.effect);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    LightStateResponse = new LightStateResponse$Type();
    LightCommandRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("LightCommandRequest", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 2,
            name: "has_state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 3,
            name: "state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 4,
            name: "has_brightness",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 5,
            name: "brightness",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 22,
            name: "has_color_mode",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 23, name: "color_mode", kind: "enum", T: () => ["ColorMode", ColorMode, "COLOR_MODE_"] },
          {
            no: 20,
            name: "has_color_brightness",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 21,
            name: "color_brightness",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 6,
            name: "has_rgb",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 7,
            name: "red",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 8,
            name: "green",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 9,
            name: "blue",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 10,
            name: "has_white",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 11,
            name: "white",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 12,
            name: "has_color_temperature",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 13,
            name: "color_temperature",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 24,
            name: "has_cold_white",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 25,
            name: "cold_white",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 26,
            name: "has_warm_white",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 27,
            name: "warm_white",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 14,
            name: "has_transition_length",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 15,
            name: "transition_length",
            kind: "scalar",
            T: 13
            /*ScalarType.UINT32*/
          },
          {
            no: 16,
            name: "has_flash_length",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 17,
            name: "flash_length",
            kind: "scalar",
            T: 13
            /*ScalarType.UINT32*/
          },
          {
            no: 18,
            name: "has_effect",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 19,
            name: "effect",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          }
        ], { id: 32, source: "SOURCE_CLIENT", ifdef: "USE_LIGHT", no_delay: true });
      }
      create(value) {
        const message = { key: 0, hasState: false, state: false, hasBrightness: false, brightness: 0, hasColorMode: false, colorMode: 0, hasColorBrightness: false, colorBrightness: 0, hasRgb: false, red: 0, green: 0, blue: 0, hasWhite: false, white: 0, hasColorTemperature: false, colorTemperature: 0, hasColdWhite: false, coldWhite: 0, hasWarmWhite: false, warmWhite: 0, hasTransitionLength: false, transitionLength: 0, hasFlashLength: false, flashLength: 0, hasEffect: false, effect: "" };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* bool has_state */
            2:
              message.hasState = reader.bool();
              break;
            case /* bool state */
            3:
              message.state = reader.bool();
              break;
            case /* bool has_brightness */
            4:
              message.hasBrightness = reader.bool();
              break;
            case /* float brightness */
            5:
              message.brightness = reader.float();
              break;
            case /* bool has_color_mode */
            22:
              message.hasColorMode = reader.bool();
              break;
            case /* ColorMode color_mode */
            23:
              message.colorMode = reader.int32();
              break;
            case /* bool has_color_brightness */
            20:
              message.hasColorBrightness = reader.bool();
              break;
            case /* float color_brightness */
            21:
              message.colorBrightness = reader.float();
              break;
            case /* bool has_rgb */
            6:
              message.hasRgb = reader.bool();
              break;
            case /* float red */
            7:
              message.red = reader.float();
              break;
            case /* float green */
            8:
              message.green = reader.float();
              break;
            case /* float blue */
            9:
              message.blue = reader.float();
              break;
            case /* bool has_white */
            10:
              message.hasWhite = reader.bool();
              break;
            case /* float white */
            11:
              message.white = reader.float();
              break;
            case /* bool has_color_temperature */
            12:
              message.hasColorTemperature = reader.bool();
              break;
            case /* float color_temperature */
            13:
              message.colorTemperature = reader.float();
              break;
            case /* bool has_cold_white */
            24:
              message.hasColdWhite = reader.bool();
              break;
            case /* float cold_white */
            25:
              message.coldWhite = reader.float();
              break;
            case /* bool has_warm_white */
            26:
              message.hasWarmWhite = reader.bool();
              break;
            case /* float warm_white */
            27:
              message.warmWhite = reader.float();
              break;
            case /* bool has_transition_length */
            14:
              message.hasTransitionLength = reader.bool();
              break;
            case /* uint32 transition_length */
            15:
              message.transitionLength = reader.uint32();
              break;
            case /* bool has_flash_length */
            16:
              message.hasFlashLength = reader.bool();
              break;
            case /* uint32 flash_length */
            17:
              message.flashLength = reader.uint32();
              break;
            case /* bool has_effect */
            18:
              message.hasEffect = reader.bool();
              break;
            case /* string effect */
            19:
              message.effect = reader.string();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.hasState !== false)
          writer.tag(2, import_runtime5.WireType.Varint).bool(message.hasState);
        if (message.state !== false)
          writer.tag(3, import_runtime5.WireType.Varint).bool(message.state);
        if (message.hasBrightness !== false)
          writer.tag(4, import_runtime5.WireType.Varint).bool(message.hasBrightness);
        if (message.brightness !== 0)
          writer.tag(5, import_runtime5.WireType.Bit32).float(message.brightness);
        if (message.hasColorMode !== false)
          writer.tag(22, import_runtime5.WireType.Varint).bool(message.hasColorMode);
        if (message.colorMode !== 0)
          writer.tag(23, import_runtime5.WireType.Varint).int32(message.colorMode);
        if (message.hasColorBrightness !== false)
          writer.tag(20, import_runtime5.WireType.Varint).bool(message.hasColorBrightness);
        if (message.colorBrightness !== 0)
          writer.tag(21, import_runtime5.WireType.Bit32).float(message.colorBrightness);
        if (message.hasRgb !== false)
          writer.tag(6, import_runtime5.WireType.Varint).bool(message.hasRgb);
        if (message.red !== 0)
          writer.tag(7, import_runtime5.WireType.Bit32).float(message.red);
        if (message.green !== 0)
          writer.tag(8, import_runtime5.WireType.Bit32).float(message.green);
        if (message.blue !== 0)
          writer.tag(9, import_runtime5.WireType.Bit32).float(message.blue);
        if (message.hasWhite !== false)
          writer.tag(10, import_runtime5.WireType.Varint).bool(message.hasWhite);
        if (message.white !== 0)
          writer.tag(11, import_runtime5.WireType.Bit32).float(message.white);
        if (message.hasColorTemperature !== false)
          writer.tag(12, import_runtime5.WireType.Varint).bool(message.hasColorTemperature);
        if (message.colorTemperature !== 0)
          writer.tag(13, import_runtime5.WireType.Bit32).float(message.colorTemperature);
        if (message.hasColdWhite !== false)
          writer.tag(24, import_runtime5.WireType.Varint).bool(message.hasColdWhite);
        if (message.coldWhite !== 0)
          writer.tag(25, import_runtime5.WireType.Bit32).float(message.coldWhite);
        if (message.hasWarmWhite !== false)
          writer.tag(26, import_runtime5.WireType.Varint).bool(message.hasWarmWhite);
        if (message.warmWhite !== 0)
          writer.tag(27, import_runtime5.WireType.Bit32).float(message.warmWhite);
        if (message.hasTransitionLength !== false)
          writer.tag(14, import_runtime5.WireType.Varint).bool(message.hasTransitionLength);
        if (message.transitionLength !== 0)
          writer.tag(15, import_runtime5.WireType.Varint).uint32(message.transitionLength);
        if (message.hasFlashLength !== false)
          writer.tag(16, import_runtime5.WireType.Varint).bool(message.hasFlashLength);
        if (message.flashLength !== 0)
          writer.tag(17, import_runtime5.WireType.Varint).uint32(message.flashLength);
        if (message.hasEffect !== false)
          writer.tag(18, import_runtime5.WireType.Varint).bool(message.hasEffect);
        if (message.effect !== "")
          writer.tag(19, import_runtime5.WireType.LengthDelimited).string(message.effect);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    LightCommandRequest = new LightCommandRequest$Type();
    ListEntitiesSensorResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesSensorResponse", [
          {
            no: 1,
            name: "object_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 3,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 4,
            name: "unique_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 5,
            name: "icon",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 6,
            name: "unit_of_measurement",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 7,
            name: "accuracy_decimals",
            kind: "scalar",
            T: 5
            /*ScalarType.INT32*/
          },
          {
            no: 8,
            name: "force_update",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 9,
            name: "device_class",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          { no: 10, name: "state_class", kind: "enum", T: () => ["SensorStateClass", SensorStateClass] },
          { no: 11, name: "legacy_last_reset_type", kind: "enum", T: () => ["SensorLastResetType", SensorLastResetType] },
          {
            no: 12,
            name: "disabled_by_default",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 13, name: "entity_category", kind: "enum", T: () => ["EntityCategory", EntityCategory, "ENTITY_CATEGORY_"] }
        ], { id: 16, source: "SOURCE_SERVER", ifdef: "USE_SENSOR" });
      }
      create(value) {
        const message = { objectId: "", key: 0, name: "", uniqueId: "", icon: "", unitOfMeasurement: "", accuracyDecimals: 0, forceUpdate: false, deviceClass: "", stateClass: 0, legacyLastResetType: 0, disabledByDefault: false, entityCategory: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string object_id */
            1:
              message.objectId = reader.string();
              break;
            case /* fixed32 key */
            2:
              message.key = reader.fixed32();
              break;
            case /* string name */
            3:
              message.name = reader.string();
              break;
            case /* string unique_id */
            4:
              message.uniqueId = reader.string();
              break;
            case /* string icon */
            5:
              message.icon = reader.string();
              break;
            case /* string unit_of_measurement */
            6:
              message.unitOfMeasurement = reader.string();
              break;
            case /* int32 accuracy_decimals */
            7:
              message.accuracyDecimals = reader.int32();
              break;
            case /* bool force_update */
            8:
              message.forceUpdate = reader.bool();
              break;
            case /* string device_class */
            9:
              message.deviceClass = reader.string();
              break;
            case /* SensorStateClass state_class */
            10:
              message.stateClass = reader.int32();
              break;
            case /* SensorLastResetType legacy_last_reset_type */
            11:
              message.legacyLastResetType = reader.int32();
              break;
            case /* bool disabled_by_default */
            12:
              message.disabledByDefault = reader.bool();
              break;
            case /* EntityCategory entity_category */
            13:
              message.entityCategory = reader.int32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.objectId !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.objectId);
        if (message.key !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.name !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.name);
        if (message.uniqueId !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.uniqueId);
        if (message.icon !== "")
          writer.tag(5, import_runtime5.WireType.LengthDelimited).string(message.icon);
        if (message.unitOfMeasurement !== "")
          writer.tag(6, import_runtime5.WireType.LengthDelimited).string(message.unitOfMeasurement);
        if (message.accuracyDecimals !== 0)
          writer.tag(7, import_runtime5.WireType.Varint).int32(message.accuracyDecimals);
        if (message.forceUpdate !== false)
          writer.tag(8, import_runtime5.WireType.Varint).bool(message.forceUpdate);
        if (message.deviceClass !== "")
          writer.tag(9, import_runtime5.WireType.LengthDelimited).string(message.deviceClass);
        if (message.stateClass !== 0)
          writer.tag(10, import_runtime5.WireType.Varint).int32(message.stateClass);
        if (message.legacyLastResetType !== 0)
          writer.tag(11, import_runtime5.WireType.Varint).int32(message.legacyLastResetType);
        if (message.disabledByDefault !== false)
          writer.tag(12, import_runtime5.WireType.Varint).bool(message.disabledByDefault);
        if (message.entityCategory !== 0)
          writer.tag(13, import_runtime5.WireType.Varint).int32(message.entityCategory);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesSensorResponse = new ListEntitiesSensorResponse$Type();
    SensorStateResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("SensorStateResponse", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 2,
            name: "state",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 3,
            name: "missing_state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          }
        ], { id: 25, source: "SOURCE_SERVER", ifdef: "USE_SENSOR", no_delay: true });
      }
      create(value) {
        const message = { key: 0, state: 0, missingState: false };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* float state */
            2:
              message.state = reader.float();
              break;
            case /* bool missing_state */
            3:
              message.missingState = reader.bool();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.state !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).float(message.state);
        if (message.missingState !== false)
          writer.tag(3, import_runtime5.WireType.Varint).bool(message.missingState);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    SensorStateResponse = new SensorStateResponse$Type();
    ListEntitiesSwitchResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesSwitchResponse", [
          {
            no: 1,
            name: "object_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 3,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 4,
            name: "unique_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 5,
            name: "icon",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 6,
            name: "assumed_state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 7,
            name: "disabled_by_default",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 8, name: "entity_category", kind: "enum", T: () => ["EntityCategory", EntityCategory, "ENTITY_CATEGORY_"] },
          {
            no: 9,
            name: "device_class",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          }
        ], { id: 17, source: "SOURCE_SERVER", ifdef: "USE_SWITCH" });
      }
      create(value) {
        const message = { objectId: "", key: 0, name: "", uniqueId: "", icon: "", assumedState: false, disabledByDefault: false, entityCategory: 0, deviceClass: "" };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string object_id */
            1:
              message.objectId = reader.string();
              break;
            case /* fixed32 key */
            2:
              message.key = reader.fixed32();
              break;
            case /* string name */
            3:
              message.name = reader.string();
              break;
            case /* string unique_id */
            4:
              message.uniqueId = reader.string();
              break;
            case /* string icon */
            5:
              message.icon = reader.string();
              break;
            case /* bool assumed_state */
            6:
              message.assumedState = reader.bool();
              break;
            case /* bool disabled_by_default */
            7:
              message.disabledByDefault = reader.bool();
              break;
            case /* EntityCategory entity_category */
            8:
              message.entityCategory = reader.int32();
              break;
            case /* string device_class */
            9:
              message.deviceClass = reader.string();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.objectId !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.objectId);
        if (message.key !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.name !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.name);
        if (message.uniqueId !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.uniqueId);
        if (message.icon !== "")
          writer.tag(5, import_runtime5.WireType.LengthDelimited).string(message.icon);
        if (message.assumedState !== false)
          writer.tag(6, import_runtime5.WireType.Varint).bool(message.assumedState);
        if (message.disabledByDefault !== false)
          writer.tag(7, import_runtime5.WireType.Varint).bool(message.disabledByDefault);
        if (message.entityCategory !== 0)
          writer.tag(8, import_runtime5.WireType.Varint).int32(message.entityCategory);
        if (message.deviceClass !== "")
          writer.tag(9, import_runtime5.WireType.LengthDelimited).string(message.deviceClass);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesSwitchResponse = new ListEntitiesSwitchResponse$Type();
    SwitchStateResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("SwitchStateResponse", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 2,
            name: "state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          }
        ], { id: 26, source: "SOURCE_SERVER", ifdef: "USE_SWITCH", no_delay: true });
      }
      create(value) {
        const message = { key: 0, state: false };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* bool state */
            2:
              message.state = reader.bool();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.state !== false)
          writer.tag(2, import_runtime5.WireType.Varint).bool(message.state);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    SwitchStateResponse = new SwitchStateResponse$Type();
    SwitchCommandRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("SwitchCommandRequest", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 2,
            name: "state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          }
        ], { id: 33, source: "SOURCE_CLIENT", ifdef: "USE_SWITCH", no_delay: true });
      }
      create(value) {
        const message = { key: 0, state: false };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* bool state */
            2:
              message.state = reader.bool();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.state !== false)
          writer.tag(2, import_runtime5.WireType.Varint).bool(message.state);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    SwitchCommandRequest = new SwitchCommandRequest$Type();
    ListEntitiesTextSensorResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesTextSensorResponse", [
          {
            no: 1,
            name: "object_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 3,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 4,
            name: "unique_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 5,
            name: "icon",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 6,
            name: "disabled_by_default",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 7, name: "entity_category", kind: "enum", T: () => ["EntityCategory", EntityCategory, "ENTITY_CATEGORY_"] }
        ], { id: 18, source: "SOURCE_SERVER", ifdef: "USE_TEXT_SENSOR" });
      }
      create(value) {
        const message = { objectId: "", key: 0, name: "", uniqueId: "", icon: "", disabledByDefault: false, entityCategory: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string object_id */
            1:
              message.objectId = reader.string();
              break;
            case /* fixed32 key */
            2:
              message.key = reader.fixed32();
              break;
            case /* string name */
            3:
              message.name = reader.string();
              break;
            case /* string unique_id */
            4:
              message.uniqueId = reader.string();
              break;
            case /* string icon */
            5:
              message.icon = reader.string();
              break;
            case /* bool disabled_by_default */
            6:
              message.disabledByDefault = reader.bool();
              break;
            case /* EntityCategory entity_category */
            7:
              message.entityCategory = reader.int32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.objectId !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.objectId);
        if (message.key !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.name !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.name);
        if (message.uniqueId !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.uniqueId);
        if (message.icon !== "")
          writer.tag(5, import_runtime5.WireType.LengthDelimited).string(message.icon);
        if (message.disabledByDefault !== false)
          writer.tag(6, import_runtime5.WireType.Varint).bool(message.disabledByDefault);
        if (message.entityCategory !== 0)
          writer.tag(7, import_runtime5.WireType.Varint).int32(message.entityCategory);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesTextSensorResponse = new ListEntitiesTextSensorResponse$Type();
    TextSensorStateResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("TextSensorStateResponse", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 2,
            name: "state",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 3,
            name: "missing_state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          }
        ], { id: 27, source: "SOURCE_SERVER", ifdef: "USE_TEXT_SENSOR", no_delay: true });
      }
      create(value) {
        const message = { key: 0, state: "", missingState: false };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* string state */
            2:
              message.state = reader.string();
              break;
            case /* bool missing_state */
            3:
              message.missingState = reader.bool();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.state !== "")
          writer.tag(2, import_runtime5.WireType.LengthDelimited).string(message.state);
        if (message.missingState !== false)
          writer.tag(3, import_runtime5.WireType.Varint).bool(message.missingState);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    TextSensorStateResponse = new TextSensorStateResponse$Type();
    SubscribeLogsRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("SubscribeLogsRequest", [
          { no: 1, name: "level", kind: "enum", T: () => ["LogLevel", LogLevel, "LOG_LEVEL_"] },
          {
            no: 2,
            name: "dump_config",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          }
        ], { id: 28, source: "SOURCE_CLIENT" });
      }
      create(value) {
        const message = { level: 0, dumpConfig: false };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* LogLevel level */
            1:
              message.level = reader.int32();
              break;
            case /* bool dump_config */
            2:
              message.dumpConfig = reader.bool();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.level !== 0)
          writer.tag(1, import_runtime5.WireType.Varint).int32(message.level);
        if (message.dumpConfig !== false)
          writer.tag(2, import_runtime5.WireType.Varint).bool(message.dumpConfig);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    SubscribeLogsRequest = new SubscribeLogsRequest$Type();
    SubscribeLogsResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("SubscribeLogsResponse", [
          { no: 1, name: "level", kind: "enum", T: () => ["LogLevel", LogLevel, "LOG_LEVEL_"] },
          {
            no: 3,
            name: "message",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 4,
            name: "send_failed",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          }
        ], { id: 29, source: "SOURCE_SERVER", log: false, no_delay: false });
      }
      create(value) {
        const message = { level: 0, message: "", sendFailed: false };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* LogLevel level */
            1:
              message.level = reader.int32();
              break;
            case /* string message */
            3:
              message.message = reader.string();
              break;
            case /* bool send_failed */
            4:
              message.sendFailed = reader.bool();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.level !== 0)
          writer.tag(1, import_runtime5.WireType.Varint).int32(message.level);
        if (message.message !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.message);
        if (message.sendFailed !== false)
          writer.tag(4, import_runtime5.WireType.Varint).bool(message.sendFailed);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    SubscribeLogsResponse = new SubscribeLogsResponse$Type();
    SubscribeHomeassistantServicesRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("SubscribeHomeassistantServicesRequest", [], { id: 34, source: "SOURCE_CLIENT" });
      }
      create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        return target ?? this.create();
      }
      internalBinaryWrite(message, writer, options) {
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    SubscribeHomeassistantServicesRequest = new SubscribeHomeassistantServicesRequest$Type();
    HomeassistantServiceMap$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("HomeassistantServiceMap", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "value",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          }
        ]);
      }
      create(value) {
        const message = { key: "", value: "" };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string key */
            1:
              message.key = reader.string();
              break;
            case /* string value */
            2:
              message.value = reader.string();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.key);
        if (message.value !== "")
          writer.tag(2, import_runtime5.WireType.LengthDelimited).string(message.value);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    HomeassistantServiceMap = new HomeassistantServiceMap$Type();
    HomeassistantServiceResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("HomeassistantServiceResponse", [
          {
            no: 1,
            name: "service",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          { no: 2, name: "data", kind: "message", repeat: 1, T: () => HomeassistantServiceMap },
          { no: 3, name: "data_template", kind: "message", repeat: 1, T: () => HomeassistantServiceMap },
          { no: 4, name: "variables", kind: "message", repeat: 1, T: () => HomeassistantServiceMap },
          {
            no: 5,
            name: "is_event",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          }
        ], { id: 35, source: "SOURCE_SERVER", no_delay: true });
      }
      create(value) {
        const message = { service: "", data: [], dataTemplate: [], variables: [], isEvent: false };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string service */
            1:
              message.service = reader.string();
              break;
            case /* repeated HomeassistantServiceMap data */
            2:
              message.data.push(HomeassistantServiceMap.internalBinaryRead(reader, reader.uint32(), options));
              break;
            case /* repeated HomeassistantServiceMap data_template */
            3:
              message.dataTemplate.push(HomeassistantServiceMap.internalBinaryRead(reader, reader.uint32(), options));
              break;
            case /* repeated HomeassistantServiceMap variables */
            4:
              message.variables.push(HomeassistantServiceMap.internalBinaryRead(reader, reader.uint32(), options));
              break;
            case /* bool is_event */
            5:
              message.isEvent = reader.bool();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.service !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.service);
        for (let i = 0; i < message.data.length; i++)
          HomeassistantServiceMap.internalBinaryWrite(message.data[i], writer.tag(2, import_runtime5.WireType.LengthDelimited).fork(), options).join();
        for (let i = 0; i < message.dataTemplate.length; i++)
          HomeassistantServiceMap.internalBinaryWrite(message.dataTemplate[i], writer.tag(3, import_runtime5.WireType.LengthDelimited).fork(), options).join();
        for (let i = 0; i < message.variables.length; i++)
          HomeassistantServiceMap.internalBinaryWrite(message.variables[i], writer.tag(4, import_runtime5.WireType.LengthDelimited).fork(), options).join();
        if (message.isEvent !== false)
          writer.tag(5, import_runtime5.WireType.Varint).bool(message.isEvent);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    HomeassistantServiceResponse = new HomeassistantServiceResponse$Type();
    SubscribeHomeAssistantStatesRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("SubscribeHomeAssistantStatesRequest", [], { id: 38, source: "SOURCE_CLIENT" });
      }
      create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        return target ?? this.create();
      }
      internalBinaryWrite(message, writer, options) {
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    SubscribeHomeAssistantStatesRequest = new SubscribeHomeAssistantStatesRequest$Type();
    SubscribeHomeAssistantStateResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("SubscribeHomeAssistantStateResponse", [
          {
            no: 1,
            name: "entity_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "attribute",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          }
        ], { id: 39, source: "SOURCE_SERVER" });
      }
      create(value) {
        const message = { entityId: "", attribute: "" };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string entity_id */
            1:
              message.entityId = reader.string();
              break;
            case /* string attribute */
            2:
              message.attribute = reader.string();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.entityId !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.entityId);
        if (message.attribute !== "")
          writer.tag(2, import_runtime5.WireType.LengthDelimited).string(message.attribute);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    SubscribeHomeAssistantStateResponse = new SubscribeHomeAssistantStateResponse$Type();
    HomeAssistantStateResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("HomeAssistantStateResponse", [
          {
            no: 1,
            name: "entity_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "state",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 3,
            name: "attribute",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          }
        ], { id: 40, source: "SOURCE_CLIENT", no_delay: true });
      }
      create(value) {
        const message = { entityId: "", state: "", attribute: "" };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string entity_id */
            1:
              message.entityId = reader.string();
              break;
            case /* string state */
            2:
              message.state = reader.string();
              break;
            case /* string attribute */
            3:
              message.attribute = reader.string();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.entityId !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.entityId);
        if (message.state !== "")
          writer.tag(2, import_runtime5.WireType.LengthDelimited).string(message.state);
        if (message.attribute !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.attribute);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    HomeAssistantStateResponse = new HomeAssistantStateResponse$Type();
    GetTimeRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("GetTimeRequest", [], { id: 36, source: "SOURCE_BOTH" });
      }
      create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        return target ?? this.create();
      }
      internalBinaryWrite(message, writer, options) {
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    GetTimeRequest = new GetTimeRequest$Type();
    GetTimeResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("GetTimeResponse", [
          {
            no: 1,
            name: "epoch_seconds",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          }
        ], { id: 37, source: "SOURCE_BOTH", no_delay: true });
      }
      create(value) {
        const message = { epochSeconds: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 epoch_seconds */
            1:
              message.epochSeconds = reader.fixed32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.epochSeconds !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.epochSeconds);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    GetTimeResponse = new GetTimeResponse$Type();
    ListEntitiesServicesArgument$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesServicesArgument", [
          {
            no: 1,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          { no: 2, name: "type", kind: "enum", T: () => ["ServiceArgType", ServiceArgType, "SERVICE_ARG_TYPE_"] }
        ]);
      }
      create(value) {
        const message = { name: "", type: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string name */
            1:
              message.name = reader.string();
              break;
            case /* ServiceArgType type */
            2:
              message.type = reader.int32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.name !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.name);
        if (message.type !== 0)
          writer.tag(2, import_runtime5.WireType.Varint).int32(message.type);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesServicesArgument = new ListEntitiesServicesArgument$Type();
    ListEntitiesServicesResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesServicesResponse", [
          {
            no: 1,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          { no: 3, name: "args", kind: "message", repeat: 1, T: () => ListEntitiesServicesArgument }
        ], { id: 41, source: "SOURCE_SERVER" });
      }
      create(value) {
        const message = { name: "", key: 0, args: [] };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string name */
            1:
              message.name = reader.string();
              break;
            case /* fixed32 key */
            2:
              message.key = reader.fixed32();
              break;
            case /* repeated ListEntitiesServicesArgument args */
            3:
              message.args.push(ListEntitiesServicesArgument.internalBinaryRead(reader, reader.uint32(), options));
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.name !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.name);
        if (message.key !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).fixed32(message.key);
        for (let i = 0; i < message.args.length; i++)
          ListEntitiesServicesArgument.internalBinaryWrite(message.args[i], writer.tag(3, import_runtime5.WireType.LengthDelimited).fork(), options).join();
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesServicesResponse = new ListEntitiesServicesResponse$Type();
    ExecuteServiceArgument$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ExecuteServiceArgument", [
          {
            no: 1,
            name: "bool_",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 2,
            name: "legacy_int",
            kind: "scalar",
            T: 5
            /*ScalarType.INT32*/
          },
          {
            no: 3,
            name: "float_",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 4,
            name: "string_",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 5,
            name: "int_",
            kind: "scalar",
            T: 17
            /*ScalarType.SINT32*/
          },
          {
            no: 6,
            name: "bool_array",
            kind: "scalar",
            repeat: 2,
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 7,
            name: "int_array",
            kind: "scalar",
            repeat: 2,
            T: 17
            /*ScalarType.SINT32*/
          },
          {
            no: 8,
            name: "float_array",
            kind: "scalar",
            repeat: 2,
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 9,
            name: "string_array",
            kind: "scalar",
            repeat: 2,
            T: 9
            /*ScalarType.STRING*/
          }
        ]);
      }
      create(value) {
        const message = { bool: false, legacyInt: 0, float: 0, string: "", int: 0, boolArray: [], intArray: [], floatArray: [], stringArray: [] };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* bool bool_ */
            1:
              message.bool = reader.bool();
              break;
            case /* int32 legacy_int */
            2:
              message.legacyInt = reader.int32();
              break;
            case /* float float_ */
            3:
              message.float = reader.float();
              break;
            case /* string string_ */
            4:
              message.string = reader.string();
              break;
            case /* sint32 int_ */
            5:
              message.int = reader.sint32();
              break;
            case /* repeated bool bool_array = 6 [packed = false];*/
            6:
              if (wireType === import_runtime5.WireType.LengthDelimited)
                for (let e = reader.int32() + reader.pos; reader.pos < e; )
                  message.boolArray.push(reader.bool());
              else
                message.boolArray.push(reader.bool());
              break;
            case /* repeated sint32 int_array = 7 [packed = false];*/
            7:
              if (wireType === import_runtime5.WireType.LengthDelimited)
                for (let e = reader.int32() + reader.pos; reader.pos < e; )
                  message.intArray.push(reader.sint32());
              else
                message.intArray.push(reader.sint32());
              break;
            case /* repeated float float_array = 8 [packed = false];*/
            8:
              if (wireType === import_runtime5.WireType.LengthDelimited)
                for (let e = reader.int32() + reader.pos; reader.pos < e; )
                  message.floatArray.push(reader.float());
              else
                message.floatArray.push(reader.float());
              break;
            case /* repeated string string_array */
            9:
              message.stringArray.push(reader.string());
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.bool !== false)
          writer.tag(1, import_runtime5.WireType.Varint).bool(message.bool);
        if (message.legacyInt !== 0)
          writer.tag(2, import_runtime5.WireType.Varint).int32(message.legacyInt);
        if (message.float !== 0)
          writer.tag(3, import_runtime5.WireType.Bit32).float(message.float);
        if (message.string !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.string);
        if (message.int !== 0)
          writer.tag(5, import_runtime5.WireType.Varint).sint32(message.int);
        for (let i = 0; i < message.boolArray.length; i++)
          writer.tag(6, import_runtime5.WireType.Varint).bool(message.boolArray[i]);
        for (let i = 0; i < message.intArray.length; i++)
          writer.tag(7, import_runtime5.WireType.Varint).sint32(message.intArray[i]);
        for (let i = 0; i < message.floatArray.length; i++)
          writer.tag(8, import_runtime5.WireType.Bit32).float(message.floatArray[i]);
        for (let i = 0; i < message.stringArray.length; i++)
          writer.tag(9, import_runtime5.WireType.LengthDelimited).string(message.stringArray[i]);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ExecuteServiceArgument = new ExecuteServiceArgument$Type();
    ExecuteServiceRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ExecuteServiceRequest", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          { no: 2, name: "args", kind: "message", repeat: 1, T: () => ExecuteServiceArgument }
        ], { id: 42, source: "SOURCE_CLIENT", no_delay: true });
      }
      create(value) {
        const message = { key: 0, args: [] };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* repeated ExecuteServiceArgument args */
            2:
              message.args.push(ExecuteServiceArgument.internalBinaryRead(reader, reader.uint32(), options));
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        for (let i = 0; i < message.args.length; i++)
          ExecuteServiceArgument.internalBinaryWrite(message.args[i], writer.tag(2, import_runtime5.WireType.LengthDelimited).fork(), options).join();
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ExecuteServiceRequest = new ExecuteServiceRequest$Type();
    ListEntitiesCameraResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesCameraResponse", [
          {
            no: 1,
            name: "object_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 3,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 4,
            name: "unique_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 5,
            name: "disabled_by_default",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 6,
            name: "icon",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          { no: 7, name: "entity_category", kind: "enum", T: () => ["EntityCategory", EntityCategory, "ENTITY_CATEGORY_"] }
        ], { id: 43, source: "SOURCE_SERVER", ifdef: "USE_ESP32_CAMERA" });
      }
      create(value) {
        const message = { objectId: "", key: 0, name: "", uniqueId: "", disabledByDefault: false, icon: "", entityCategory: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string object_id */
            1:
              message.objectId = reader.string();
              break;
            case /* fixed32 key */
            2:
              message.key = reader.fixed32();
              break;
            case /* string name */
            3:
              message.name = reader.string();
              break;
            case /* string unique_id */
            4:
              message.uniqueId = reader.string();
              break;
            case /* bool disabled_by_default */
            5:
              message.disabledByDefault = reader.bool();
              break;
            case /* string icon */
            6:
              message.icon = reader.string();
              break;
            case /* EntityCategory entity_category */
            7:
              message.entityCategory = reader.int32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.objectId !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.objectId);
        if (message.key !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.name !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.name);
        if (message.uniqueId !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.uniqueId);
        if (message.disabledByDefault !== false)
          writer.tag(5, import_runtime5.WireType.Varint).bool(message.disabledByDefault);
        if (message.icon !== "")
          writer.tag(6, import_runtime5.WireType.LengthDelimited).string(message.icon);
        if (message.entityCategory !== 0)
          writer.tag(7, import_runtime5.WireType.Varint).int32(message.entityCategory);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesCameraResponse = new ListEntitiesCameraResponse$Type();
    CameraImageResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("CameraImageResponse", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 2,
            name: "data",
            kind: "scalar",
            T: 12
            /*ScalarType.BYTES*/
          },
          {
            no: 3,
            name: "done",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          }
        ], { id: 44, source: "SOURCE_SERVER", ifdef: "USE_ESP32_CAMERA" });
      }
      create(value) {
        const message = { key: 0, data: new Uint8Array(0), done: false };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* bytes data */
            2:
              message.data = reader.bytes();
              break;
            case /* bool done */
            3:
              message.done = reader.bool();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.data.length)
          writer.tag(2, import_runtime5.WireType.LengthDelimited).bytes(message.data);
        if (message.done !== false)
          writer.tag(3, import_runtime5.WireType.Varint).bool(message.done);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    CameraImageResponse = new CameraImageResponse$Type();
    CameraImageRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("CameraImageRequest", [
          {
            no: 1,
            name: "single",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 2,
            name: "stream",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          }
        ], { id: 45, source: "SOURCE_CLIENT", ifdef: "USE_ESP32_CAMERA", no_delay: true });
      }
      create(value) {
        const message = { single: false, stream: false };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* bool single */
            1:
              message.single = reader.bool();
              break;
            case /* bool stream */
            2:
              message.stream = reader.bool();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.single !== false)
          writer.tag(1, import_runtime5.WireType.Varint).bool(message.single);
        if (message.stream !== false)
          writer.tag(2, import_runtime5.WireType.Varint).bool(message.stream);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    CameraImageRequest = new CameraImageRequest$Type();
    ListEntitiesClimateResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesClimateResponse", [
          {
            no: 1,
            name: "object_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 3,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 4,
            name: "unique_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 5,
            name: "supports_current_temperature",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 6,
            name: "supports_two_point_target_temperature",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 7, name: "supported_modes", kind: "enum", repeat: 1, T: () => ["ClimateMode", ClimateMode, "CLIMATE_MODE_"] },
          {
            no: 8,
            name: "visual_min_temperature",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 9,
            name: "visual_max_temperature",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 10,
            name: "visual_temperature_step",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 11,
            name: "legacy_supports_away",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 12,
            name: "supports_action",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 13, name: "supported_fan_modes", kind: "enum", repeat: 1, T: () => ["ClimateFanMode", ClimateFanMode] },
          { no: 14, name: "supported_swing_modes", kind: "enum", repeat: 1, T: () => ["ClimateSwingMode", ClimateSwingMode] },
          {
            no: 15,
            name: "supported_custom_fan_modes",
            kind: "scalar",
            repeat: 2,
            T: 9
            /*ScalarType.STRING*/
          },
          { no: 16, name: "supported_presets", kind: "enum", repeat: 1, T: () => ["ClimatePreset", ClimatePreset, "CLIMATE_PRESET_"] },
          {
            no: 17,
            name: "supported_custom_presets",
            kind: "scalar",
            repeat: 2,
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 18,
            name: "disabled_by_default",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 19,
            name: "icon",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          { no: 20, name: "entity_category", kind: "enum", T: () => ["EntityCategory", EntityCategory, "ENTITY_CATEGORY_"] }
        ], { id: 46, source: "SOURCE_SERVER", ifdef: "USE_CLIMATE" });
      }
      create(value) {
        const message = { objectId: "", key: 0, name: "", uniqueId: "", supportsCurrentTemperature: false, supportsTwoPointTargetTemperature: false, supportedModes: [], visualMinTemperature: 0, visualMaxTemperature: 0, visualTemperatureStep: 0, legacySupportsAway: false, supportsAction: false, supportedFanModes: [], supportedSwingModes: [], supportedCustomFanModes: [], supportedPresets: [], supportedCustomPresets: [], disabledByDefault: false, icon: "", entityCategory: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string object_id */
            1:
              message.objectId = reader.string();
              break;
            case /* fixed32 key */
            2:
              message.key = reader.fixed32();
              break;
            case /* string name */
            3:
              message.name = reader.string();
              break;
            case /* string unique_id */
            4:
              message.uniqueId = reader.string();
              break;
            case /* bool supports_current_temperature */
            5:
              message.supportsCurrentTemperature = reader.bool();
              break;
            case /* bool supports_two_point_target_temperature */
            6:
              message.supportsTwoPointTargetTemperature = reader.bool();
              break;
            case /* repeated ClimateMode supported_modes */
            7:
              if (wireType === import_runtime5.WireType.LengthDelimited)
                for (let e = reader.int32() + reader.pos; reader.pos < e; )
                  message.supportedModes.push(reader.int32());
              else
                message.supportedModes.push(reader.int32());
              break;
            case /* float visual_min_temperature */
            8:
              message.visualMinTemperature = reader.float();
              break;
            case /* float visual_max_temperature */
            9:
              message.visualMaxTemperature = reader.float();
              break;
            case /* float visual_temperature_step */
            10:
              message.visualTemperatureStep = reader.float();
              break;
            case /* bool legacy_supports_away */
            11:
              message.legacySupportsAway = reader.bool();
              break;
            case /* bool supports_action */
            12:
              message.supportsAction = reader.bool();
              break;
            case /* repeated ClimateFanMode supported_fan_modes */
            13:
              if (wireType === import_runtime5.WireType.LengthDelimited)
                for (let e = reader.int32() + reader.pos; reader.pos < e; )
                  message.supportedFanModes.push(reader.int32());
              else
                message.supportedFanModes.push(reader.int32());
              break;
            case /* repeated ClimateSwingMode supported_swing_modes */
            14:
              if (wireType === import_runtime5.WireType.LengthDelimited)
                for (let e = reader.int32() + reader.pos; reader.pos < e; )
                  message.supportedSwingModes.push(reader.int32());
              else
                message.supportedSwingModes.push(reader.int32());
              break;
            case /* repeated string supported_custom_fan_modes */
            15:
              message.supportedCustomFanModes.push(reader.string());
              break;
            case /* repeated ClimatePreset supported_presets */
            16:
              if (wireType === import_runtime5.WireType.LengthDelimited)
                for (let e = reader.int32() + reader.pos; reader.pos < e; )
                  message.supportedPresets.push(reader.int32());
              else
                message.supportedPresets.push(reader.int32());
              break;
            case /* repeated string supported_custom_presets */
            17:
              message.supportedCustomPresets.push(reader.string());
              break;
            case /* bool disabled_by_default */
            18:
              message.disabledByDefault = reader.bool();
              break;
            case /* string icon */
            19:
              message.icon = reader.string();
              break;
            case /* EntityCategory entity_category */
            20:
              message.entityCategory = reader.int32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.objectId !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.objectId);
        if (message.key !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.name !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.name);
        if (message.uniqueId !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.uniqueId);
        if (message.supportsCurrentTemperature !== false)
          writer.tag(5, import_runtime5.WireType.Varint).bool(message.supportsCurrentTemperature);
        if (message.supportsTwoPointTargetTemperature !== false)
          writer.tag(6, import_runtime5.WireType.Varint).bool(message.supportsTwoPointTargetTemperature);
        if (message.supportedModes.length) {
          writer.tag(7, import_runtime5.WireType.LengthDelimited).fork();
          for (let i = 0; i < message.supportedModes.length; i++)
            writer.int32(message.supportedModes[i]);
          writer.join();
        }
        if (message.visualMinTemperature !== 0)
          writer.tag(8, import_runtime5.WireType.Bit32).float(message.visualMinTemperature);
        if (message.visualMaxTemperature !== 0)
          writer.tag(9, import_runtime5.WireType.Bit32).float(message.visualMaxTemperature);
        if (message.visualTemperatureStep !== 0)
          writer.tag(10, import_runtime5.WireType.Bit32).float(message.visualTemperatureStep);
        if (message.legacySupportsAway !== false)
          writer.tag(11, import_runtime5.WireType.Varint).bool(message.legacySupportsAway);
        if (message.supportsAction !== false)
          writer.tag(12, import_runtime5.WireType.Varint).bool(message.supportsAction);
        if (message.supportedFanModes.length) {
          writer.tag(13, import_runtime5.WireType.LengthDelimited).fork();
          for (let i = 0; i < message.supportedFanModes.length; i++)
            writer.int32(message.supportedFanModes[i]);
          writer.join();
        }
        if (message.supportedSwingModes.length) {
          writer.tag(14, import_runtime5.WireType.LengthDelimited).fork();
          for (let i = 0; i < message.supportedSwingModes.length; i++)
            writer.int32(message.supportedSwingModes[i]);
          writer.join();
        }
        for (let i = 0; i < message.supportedCustomFanModes.length; i++)
          writer.tag(15, import_runtime5.WireType.LengthDelimited).string(message.supportedCustomFanModes[i]);
        if (message.supportedPresets.length) {
          writer.tag(16, import_runtime5.WireType.LengthDelimited).fork();
          for (let i = 0; i < message.supportedPresets.length; i++)
            writer.int32(message.supportedPresets[i]);
          writer.join();
        }
        for (let i = 0; i < message.supportedCustomPresets.length; i++)
          writer.tag(17, import_runtime5.WireType.LengthDelimited).string(message.supportedCustomPresets[i]);
        if (message.disabledByDefault !== false)
          writer.tag(18, import_runtime5.WireType.Varint).bool(message.disabledByDefault);
        if (message.icon !== "")
          writer.tag(19, import_runtime5.WireType.LengthDelimited).string(message.icon);
        if (message.entityCategory !== 0)
          writer.tag(20, import_runtime5.WireType.Varint).int32(message.entityCategory);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesClimateResponse = new ListEntitiesClimateResponse$Type();
    ClimateStateResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ClimateStateResponse", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          { no: 2, name: "mode", kind: "enum", T: () => ["ClimateMode", ClimateMode, "CLIMATE_MODE_"] },
          {
            no: 3,
            name: "current_temperature",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 4,
            name: "target_temperature",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 5,
            name: "target_temperature_low",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 6,
            name: "target_temperature_high",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 7,
            name: "legacy_away",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 8, name: "action", kind: "enum", T: () => ["ClimateAction", ClimateAction, "CLIMATE_ACTION_"] },
          { no: 9, name: "fan_mode", kind: "enum", T: () => ["ClimateFanMode", ClimateFanMode] },
          { no: 10, name: "swing_mode", kind: "enum", T: () => ["ClimateSwingMode", ClimateSwingMode] },
          {
            no: 11,
            name: "custom_fan_mode",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          { no: 12, name: "preset", kind: "enum", T: () => ["ClimatePreset", ClimatePreset, "CLIMATE_PRESET_"] },
          {
            no: 13,
            name: "custom_preset",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          }
        ], { id: 47, source: "SOURCE_SERVER", ifdef: "USE_CLIMATE", no_delay: true });
      }
      create(value) {
        const message = { key: 0, mode: 0, currentTemperature: 0, targetTemperature: 0, targetTemperatureLow: 0, targetTemperatureHigh: 0, legacyAway: false, action: 0, fanMode: 0, swingMode: 0, customFanMode: "", preset: 0, customPreset: "" };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* ClimateMode mode */
            2:
              message.mode = reader.int32();
              break;
            case /* float current_temperature */
            3:
              message.currentTemperature = reader.float();
              break;
            case /* float target_temperature */
            4:
              message.targetTemperature = reader.float();
              break;
            case /* float target_temperature_low */
            5:
              message.targetTemperatureLow = reader.float();
              break;
            case /* float target_temperature_high */
            6:
              message.targetTemperatureHigh = reader.float();
              break;
            case /* bool legacy_away */
            7:
              message.legacyAway = reader.bool();
              break;
            case /* ClimateAction action */
            8:
              message.action = reader.int32();
              break;
            case /* ClimateFanMode fan_mode */
            9:
              message.fanMode = reader.int32();
              break;
            case /* ClimateSwingMode swing_mode */
            10:
              message.swingMode = reader.int32();
              break;
            case /* string custom_fan_mode */
            11:
              message.customFanMode = reader.string();
              break;
            case /* ClimatePreset preset */
            12:
              message.preset = reader.int32();
              break;
            case /* string custom_preset */
            13:
              message.customPreset = reader.string();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.mode !== 0)
          writer.tag(2, import_runtime5.WireType.Varint).int32(message.mode);
        if (message.currentTemperature !== 0)
          writer.tag(3, import_runtime5.WireType.Bit32).float(message.currentTemperature);
        if (message.targetTemperature !== 0)
          writer.tag(4, import_runtime5.WireType.Bit32).float(message.targetTemperature);
        if (message.targetTemperatureLow !== 0)
          writer.tag(5, import_runtime5.WireType.Bit32).float(message.targetTemperatureLow);
        if (message.targetTemperatureHigh !== 0)
          writer.tag(6, import_runtime5.WireType.Bit32).float(message.targetTemperatureHigh);
        if (message.legacyAway !== false)
          writer.tag(7, import_runtime5.WireType.Varint).bool(message.legacyAway);
        if (message.action !== 0)
          writer.tag(8, import_runtime5.WireType.Varint).int32(message.action);
        if (message.fanMode !== 0)
          writer.tag(9, import_runtime5.WireType.Varint).int32(message.fanMode);
        if (message.swingMode !== 0)
          writer.tag(10, import_runtime5.WireType.Varint).int32(message.swingMode);
        if (message.customFanMode !== "")
          writer.tag(11, import_runtime5.WireType.LengthDelimited).string(message.customFanMode);
        if (message.preset !== 0)
          writer.tag(12, import_runtime5.WireType.Varint).int32(message.preset);
        if (message.customPreset !== "")
          writer.tag(13, import_runtime5.WireType.LengthDelimited).string(message.customPreset);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ClimateStateResponse = new ClimateStateResponse$Type();
    ClimateCommandRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ClimateCommandRequest", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 2,
            name: "has_mode",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 3, name: "mode", kind: "enum", T: () => ["ClimateMode", ClimateMode, "CLIMATE_MODE_"] },
          {
            no: 4,
            name: "has_target_temperature",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 5,
            name: "target_temperature",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 6,
            name: "has_target_temperature_low",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 7,
            name: "target_temperature_low",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 8,
            name: "has_target_temperature_high",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 9,
            name: "target_temperature_high",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 10,
            name: "has_legacy_away",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 11,
            name: "legacy_away",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 12,
            name: "has_fan_mode",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 13, name: "fan_mode", kind: "enum", T: () => ["ClimateFanMode", ClimateFanMode] },
          {
            no: 14,
            name: "has_swing_mode",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 15, name: "swing_mode", kind: "enum", T: () => ["ClimateSwingMode", ClimateSwingMode] },
          {
            no: 16,
            name: "has_custom_fan_mode",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 17,
            name: "custom_fan_mode",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 18,
            name: "has_preset",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 19, name: "preset", kind: "enum", T: () => ["ClimatePreset", ClimatePreset, "CLIMATE_PRESET_"] },
          {
            no: 20,
            name: "has_custom_preset",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 21,
            name: "custom_preset",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          }
        ], { id: 48, source: "SOURCE_CLIENT", ifdef: "USE_CLIMATE", no_delay: true });
      }
      create(value) {
        const message = { key: 0, hasMode: false, mode: 0, hasTargetTemperature: false, targetTemperature: 0, hasTargetTemperatureLow: false, targetTemperatureLow: 0, hasTargetTemperatureHigh: false, targetTemperatureHigh: 0, hasLegacyAway: false, legacyAway: false, hasFanMode: false, fanMode: 0, hasSwingMode: false, swingMode: 0, hasCustomFanMode: false, customFanMode: "", hasPreset: false, preset: 0, hasCustomPreset: false, customPreset: "" };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* bool has_mode */
            2:
              message.hasMode = reader.bool();
              break;
            case /* ClimateMode mode */
            3:
              message.mode = reader.int32();
              break;
            case /* bool has_target_temperature */
            4:
              message.hasTargetTemperature = reader.bool();
              break;
            case /* float target_temperature */
            5:
              message.targetTemperature = reader.float();
              break;
            case /* bool has_target_temperature_low */
            6:
              message.hasTargetTemperatureLow = reader.bool();
              break;
            case /* float target_temperature_low */
            7:
              message.targetTemperatureLow = reader.float();
              break;
            case /* bool has_target_temperature_high */
            8:
              message.hasTargetTemperatureHigh = reader.bool();
              break;
            case /* float target_temperature_high */
            9:
              message.targetTemperatureHigh = reader.float();
              break;
            case /* bool has_legacy_away */
            10:
              message.hasLegacyAway = reader.bool();
              break;
            case /* bool legacy_away */
            11:
              message.legacyAway = reader.bool();
              break;
            case /* bool has_fan_mode */
            12:
              message.hasFanMode = reader.bool();
              break;
            case /* ClimateFanMode fan_mode */
            13:
              message.fanMode = reader.int32();
              break;
            case /* bool has_swing_mode */
            14:
              message.hasSwingMode = reader.bool();
              break;
            case /* ClimateSwingMode swing_mode */
            15:
              message.swingMode = reader.int32();
              break;
            case /* bool has_custom_fan_mode */
            16:
              message.hasCustomFanMode = reader.bool();
              break;
            case /* string custom_fan_mode */
            17:
              message.customFanMode = reader.string();
              break;
            case /* bool has_preset */
            18:
              message.hasPreset = reader.bool();
              break;
            case /* ClimatePreset preset */
            19:
              message.preset = reader.int32();
              break;
            case /* bool has_custom_preset */
            20:
              message.hasCustomPreset = reader.bool();
              break;
            case /* string custom_preset */
            21:
              message.customPreset = reader.string();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.hasMode !== false)
          writer.tag(2, import_runtime5.WireType.Varint).bool(message.hasMode);
        if (message.mode !== 0)
          writer.tag(3, import_runtime5.WireType.Varint).int32(message.mode);
        if (message.hasTargetTemperature !== false)
          writer.tag(4, import_runtime5.WireType.Varint).bool(message.hasTargetTemperature);
        if (message.targetTemperature !== 0)
          writer.tag(5, import_runtime5.WireType.Bit32).float(message.targetTemperature);
        if (message.hasTargetTemperatureLow !== false)
          writer.tag(6, import_runtime5.WireType.Varint).bool(message.hasTargetTemperatureLow);
        if (message.targetTemperatureLow !== 0)
          writer.tag(7, import_runtime5.WireType.Bit32).float(message.targetTemperatureLow);
        if (message.hasTargetTemperatureHigh !== false)
          writer.tag(8, import_runtime5.WireType.Varint).bool(message.hasTargetTemperatureHigh);
        if (message.targetTemperatureHigh !== 0)
          writer.tag(9, import_runtime5.WireType.Bit32).float(message.targetTemperatureHigh);
        if (message.hasLegacyAway !== false)
          writer.tag(10, import_runtime5.WireType.Varint).bool(message.hasLegacyAway);
        if (message.legacyAway !== false)
          writer.tag(11, import_runtime5.WireType.Varint).bool(message.legacyAway);
        if (message.hasFanMode !== false)
          writer.tag(12, import_runtime5.WireType.Varint).bool(message.hasFanMode);
        if (message.fanMode !== 0)
          writer.tag(13, import_runtime5.WireType.Varint).int32(message.fanMode);
        if (message.hasSwingMode !== false)
          writer.tag(14, import_runtime5.WireType.Varint).bool(message.hasSwingMode);
        if (message.swingMode !== 0)
          writer.tag(15, import_runtime5.WireType.Varint).int32(message.swingMode);
        if (message.hasCustomFanMode !== false)
          writer.tag(16, import_runtime5.WireType.Varint).bool(message.hasCustomFanMode);
        if (message.customFanMode !== "")
          writer.tag(17, import_runtime5.WireType.LengthDelimited).string(message.customFanMode);
        if (message.hasPreset !== false)
          writer.tag(18, import_runtime5.WireType.Varint).bool(message.hasPreset);
        if (message.preset !== 0)
          writer.tag(19, import_runtime5.WireType.Varint).int32(message.preset);
        if (message.hasCustomPreset !== false)
          writer.tag(20, import_runtime5.WireType.Varint).bool(message.hasCustomPreset);
        if (message.customPreset !== "")
          writer.tag(21, import_runtime5.WireType.LengthDelimited).string(message.customPreset);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ClimateCommandRequest = new ClimateCommandRequest$Type();
    ListEntitiesNumberResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesNumberResponse", [
          {
            no: 1,
            name: "object_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 3,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 4,
            name: "unique_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 5,
            name: "icon",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 6,
            name: "min_value",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 7,
            name: "max_value",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 8,
            name: "step",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 9,
            name: "disabled_by_default",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 10, name: "entity_category", kind: "enum", T: () => ["EntityCategory", EntityCategory, "ENTITY_CATEGORY_"] },
          {
            no: 11,
            name: "unit_of_measurement",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          { no: 12, name: "mode", kind: "enum", T: () => ["NumberMode", NumberMode, "NUMBER_MODE_"] }
        ], { id: 49, source: "SOURCE_SERVER", ifdef: "USE_NUMBER" });
      }
      create(value) {
        const message = { objectId: "", key: 0, name: "", uniqueId: "", icon: "", minValue: 0, maxValue: 0, step: 0, disabledByDefault: false, entityCategory: 0, unitOfMeasurement: "", mode: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string object_id */
            1:
              message.objectId = reader.string();
              break;
            case /* fixed32 key */
            2:
              message.key = reader.fixed32();
              break;
            case /* string name */
            3:
              message.name = reader.string();
              break;
            case /* string unique_id */
            4:
              message.uniqueId = reader.string();
              break;
            case /* string icon */
            5:
              message.icon = reader.string();
              break;
            case /* float min_value */
            6:
              message.minValue = reader.float();
              break;
            case /* float max_value */
            7:
              message.maxValue = reader.float();
              break;
            case /* float step */
            8:
              message.step = reader.float();
              break;
            case /* bool disabled_by_default */
            9:
              message.disabledByDefault = reader.bool();
              break;
            case /* EntityCategory entity_category */
            10:
              message.entityCategory = reader.int32();
              break;
            case /* string unit_of_measurement */
            11:
              message.unitOfMeasurement = reader.string();
              break;
            case /* NumberMode mode */
            12:
              message.mode = reader.int32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.objectId !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.objectId);
        if (message.key !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.name !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.name);
        if (message.uniqueId !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.uniqueId);
        if (message.icon !== "")
          writer.tag(5, import_runtime5.WireType.LengthDelimited).string(message.icon);
        if (message.minValue !== 0)
          writer.tag(6, import_runtime5.WireType.Bit32).float(message.minValue);
        if (message.maxValue !== 0)
          writer.tag(7, import_runtime5.WireType.Bit32).float(message.maxValue);
        if (message.step !== 0)
          writer.tag(8, import_runtime5.WireType.Bit32).float(message.step);
        if (message.disabledByDefault !== false)
          writer.tag(9, import_runtime5.WireType.Varint).bool(message.disabledByDefault);
        if (message.entityCategory !== 0)
          writer.tag(10, import_runtime5.WireType.Varint).int32(message.entityCategory);
        if (message.unitOfMeasurement !== "")
          writer.tag(11, import_runtime5.WireType.LengthDelimited).string(message.unitOfMeasurement);
        if (message.mode !== 0)
          writer.tag(12, import_runtime5.WireType.Varint).int32(message.mode);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesNumberResponse = new ListEntitiesNumberResponse$Type();
    NumberStateResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("NumberStateResponse", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 2,
            name: "state",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          },
          {
            no: 3,
            name: "missing_state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          }
        ], { id: 50, source: "SOURCE_SERVER", ifdef: "USE_NUMBER", no_delay: true });
      }
      create(value) {
        const message = { key: 0, state: 0, missingState: false };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* float state */
            2:
              message.state = reader.float();
              break;
            case /* bool missing_state */
            3:
              message.missingState = reader.bool();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.state !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).float(message.state);
        if (message.missingState !== false)
          writer.tag(3, import_runtime5.WireType.Varint).bool(message.missingState);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    NumberStateResponse = new NumberStateResponse$Type();
    NumberCommandRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("NumberCommandRequest", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 2,
            name: "state",
            kind: "scalar",
            T: 2
            /*ScalarType.FLOAT*/
          }
        ], { id: 51, source: "SOURCE_CLIENT", ifdef: "USE_NUMBER", no_delay: true });
      }
      create(value) {
        const message = { key: 0, state: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* float state */
            2:
              message.state = reader.float();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.state !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).float(message.state);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    NumberCommandRequest = new NumberCommandRequest$Type();
    ListEntitiesSelectResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesSelectResponse", [
          {
            no: 1,
            name: "object_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 3,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 4,
            name: "unique_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 5,
            name: "icon",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 6,
            name: "options",
            kind: "scalar",
            repeat: 2,
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 7,
            name: "disabled_by_default",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 8, name: "entity_category", kind: "enum", T: () => ["EntityCategory", EntityCategory, "ENTITY_CATEGORY_"] }
        ], { id: 52, source: "SOURCE_SERVER", ifdef: "USE_SELECT" });
      }
      create(value) {
        const message = { objectId: "", key: 0, name: "", uniqueId: "", icon: "", options: [], disabledByDefault: false, entityCategory: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string object_id */
            1:
              message.objectId = reader.string();
              break;
            case /* fixed32 key */
            2:
              message.key = reader.fixed32();
              break;
            case /* string name */
            3:
              message.name = reader.string();
              break;
            case /* string unique_id */
            4:
              message.uniqueId = reader.string();
              break;
            case /* string icon */
            5:
              message.icon = reader.string();
              break;
            case /* repeated string options */
            6:
              message.options.push(reader.string());
              break;
            case /* bool disabled_by_default */
            7:
              message.disabledByDefault = reader.bool();
              break;
            case /* EntityCategory entity_category */
            8:
              message.entityCategory = reader.int32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.objectId !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.objectId);
        if (message.key !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.name !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.name);
        if (message.uniqueId !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.uniqueId);
        if (message.icon !== "")
          writer.tag(5, import_runtime5.WireType.LengthDelimited).string(message.icon);
        for (let i = 0; i < message.options.length; i++)
          writer.tag(6, import_runtime5.WireType.LengthDelimited).string(message.options[i]);
        if (message.disabledByDefault !== false)
          writer.tag(7, import_runtime5.WireType.Varint).bool(message.disabledByDefault);
        if (message.entityCategory !== 0)
          writer.tag(8, import_runtime5.WireType.Varint).int32(message.entityCategory);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesSelectResponse = new ListEntitiesSelectResponse$Type();
    SelectStateResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("SelectStateResponse", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 2,
            name: "state",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 3,
            name: "missing_state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          }
        ], { id: 53, source: "SOURCE_SERVER", ifdef: "USE_SELECT", no_delay: true });
      }
      create(value) {
        const message = { key: 0, state: "", missingState: false };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* string state */
            2:
              message.state = reader.string();
              break;
            case /* bool missing_state */
            3:
              message.missingState = reader.bool();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.state !== "")
          writer.tag(2, import_runtime5.WireType.LengthDelimited).string(message.state);
        if (message.missingState !== false)
          writer.tag(3, import_runtime5.WireType.Varint).bool(message.missingState);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    SelectStateResponse = new SelectStateResponse$Type();
    SelectCommandRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("SelectCommandRequest", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 2,
            name: "state",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          }
        ], { id: 54, source: "SOURCE_CLIENT", ifdef: "USE_SELECT", no_delay: true });
      }
      create(value) {
        const message = { key: 0, state: "" };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* string state */
            2:
              message.state = reader.string();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.state !== "")
          writer.tag(2, import_runtime5.WireType.LengthDelimited).string(message.state);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    SelectCommandRequest = new SelectCommandRequest$Type();
    ListEntitiesLockResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesLockResponse", [
          {
            no: 1,
            name: "object_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 3,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 4,
            name: "unique_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 5,
            name: "icon",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 6,
            name: "disabled_by_default",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 7, name: "entity_category", kind: "enum", T: () => ["EntityCategory", EntityCategory, "ENTITY_CATEGORY_"] },
          {
            no: 8,
            name: "assumed_state",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 9,
            name: "supports_open",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 10,
            name: "requires_code",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 11,
            name: "code_format",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          }
        ], { id: 58, source: "SOURCE_SERVER", ifdef: "USE_LOCK" });
      }
      create(value) {
        const message = { objectId: "", key: 0, name: "", uniqueId: "", icon: "", disabledByDefault: false, entityCategory: 0, assumedState: false, supportsOpen: false, requiresCode: false, codeFormat: "" };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string object_id */
            1:
              message.objectId = reader.string();
              break;
            case /* fixed32 key */
            2:
              message.key = reader.fixed32();
              break;
            case /* string name */
            3:
              message.name = reader.string();
              break;
            case /* string unique_id */
            4:
              message.uniqueId = reader.string();
              break;
            case /* string icon */
            5:
              message.icon = reader.string();
              break;
            case /* bool disabled_by_default */
            6:
              message.disabledByDefault = reader.bool();
              break;
            case /* EntityCategory entity_category */
            7:
              message.entityCategory = reader.int32();
              break;
            case /* bool assumed_state */
            8:
              message.assumedState = reader.bool();
              break;
            case /* bool supports_open */
            9:
              message.supportsOpen = reader.bool();
              break;
            case /* bool requires_code */
            10:
              message.requiresCode = reader.bool();
              break;
            case /* string code_format */
            11:
              message.codeFormat = reader.string();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.objectId !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.objectId);
        if (message.key !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.name !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.name);
        if (message.uniqueId !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.uniqueId);
        if (message.icon !== "")
          writer.tag(5, import_runtime5.WireType.LengthDelimited).string(message.icon);
        if (message.disabledByDefault !== false)
          writer.tag(6, import_runtime5.WireType.Varint).bool(message.disabledByDefault);
        if (message.entityCategory !== 0)
          writer.tag(7, import_runtime5.WireType.Varint).int32(message.entityCategory);
        if (message.assumedState !== false)
          writer.tag(8, import_runtime5.WireType.Varint).bool(message.assumedState);
        if (message.supportsOpen !== false)
          writer.tag(9, import_runtime5.WireType.Varint).bool(message.supportsOpen);
        if (message.requiresCode !== false)
          writer.tag(10, import_runtime5.WireType.Varint).bool(message.requiresCode);
        if (message.codeFormat !== "")
          writer.tag(11, import_runtime5.WireType.LengthDelimited).string(message.codeFormat);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesLockResponse = new ListEntitiesLockResponse$Type();
    LockStateResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("LockStateResponse", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          { no: 2, name: "state", kind: "enum", T: () => ["LockState", LockState, "LOCK_STATE_"] }
        ], { id: 59, source: "SOURCE_SERVER", ifdef: "USE_LOCK", no_delay: true });
      }
      create(value) {
        const message = { key: 0, state: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* LockState state */
            2:
              message.state = reader.int32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.state !== 0)
          writer.tag(2, import_runtime5.WireType.Varint).int32(message.state);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    LockStateResponse = new LockStateResponse$Type();
    LockCommandRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("LockCommandRequest", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          { no: 2, name: "command", kind: "enum", T: () => ["LockCommand", LockCommand] },
          {
            no: 3,
            name: "has_code",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          {
            no: 4,
            name: "code",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          }
        ], { id: 60, source: "SOURCE_CLIENT", ifdef: "USE_LOCK", no_delay: true });
      }
      create(value) {
        const message = { key: 0, command: 0, hasCode: false, code: "" };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            case /* LockCommand command */
            2:
              message.command = reader.int32();
              break;
            case /* bool has_code */
            3:
              message.hasCode = reader.bool();
              break;
            case /* string code */
            4:
              message.code = reader.string();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.command !== 0)
          writer.tag(2, import_runtime5.WireType.Varint).int32(message.command);
        if (message.hasCode !== false)
          writer.tag(3, import_runtime5.WireType.Varint).bool(message.hasCode);
        if (message.code !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.code);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    LockCommandRequest = new LockCommandRequest$Type();
    ListEntitiesButtonResponse$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ListEntitiesButtonResponse", [
          {
            no: 1,
            name: "object_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 2,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          },
          {
            no: 3,
            name: "name",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 4,
            name: "unique_id",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 5,
            name: "icon",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          },
          {
            no: 6,
            name: "disabled_by_default",
            kind: "scalar",
            T: 8
            /*ScalarType.BOOL*/
          },
          { no: 7, name: "entity_category", kind: "enum", T: () => ["EntityCategory", EntityCategory, "ENTITY_CATEGORY_"] },
          {
            no: 8,
            name: "device_class",
            kind: "scalar",
            T: 9
            /*ScalarType.STRING*/
          }
        ], { id: 61, source: "SOURCE_SERVER", ifdef: "USE_BUTTON" });
      }
      create(value) {
        const message = { objectId: "", key: 0, name: "", uniqueId: "", icon: "", disabledByDefault: false, entityCategory: 0, deviceClass: "" };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* string object_id */
            1:
              message.objectId = reader.string();
              break;
            case /* fixed32 key */
            2:
              message.key = reader.fixed32();
              break;
            case /* string name */
            3:
              message.name = reader.string();
              break;
            case /* string unique_id */
            4:
              message.uniqueId = reader.string();
              break;
            case /* string icon */
            5:
              message.icon = reader.string();
              break;
            case /* bool disabled_by_default */
            6:
              message.disabledByDefault = reader.bool();
              break;
            case /* EntityCategory entity_category */
            7:
              message.entityCategory = reader.int32();
              break;
            case /* string device_class */
            8:
              message.deviceClass = reader.string();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.objectId !== "")
          writer.tag(1, import_runtime5.WireType.LengthDelimited).string(message.objectId);
        if (message.key !== 0)
          writer.tag(2, import_runtime5.WireType.Bit32).fixed32(message.key);
        if (message.name !== "")
          writer.tag(3, import_runtime5.WireType.LengthDelimited).string(message.name);
        if (message.uniqueId !== "")
          writer.tag(4, import_runtime5.WireType.LengthDelimited).string(message.uniqueId);
        if (message.icon !== "")
          writer.tag(5, import_runtime5.WireType.LengthDelimited).string(message.icon);
        if (message.disabledByDefault !== false)
          writer.tag(6, import_runtime5.WireType.Varint).bool(message.disabledByDefault);
        if (message.entityCategory !== 0)
          writer.tag(7, import_runtime5.WireType.Varint).int32(message.entityCategory);
        if (message.deviceClass !== "")
          writer.tag(8, import_runtime5.WireType.LengthDelimited).string(message.deviceClass);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ListEntitiesButtonResponse = new ListEntitiesButtonResponse$Type();
    ButtonCommandRequest$Type = class extends import_runtime9.MessageType {
      constructor() {
        super("ButtonCommandRequest", [
          {
            no: 1,
            name: "key",
            kind: "scalar",
            T: 7
            /*ScalarType.FIXED32*/
          }
        ], { id: 62, source: "SOURCE_CLIENT", ifdef: "USE_BUTTON", no_delay: true });
      }
      create(value) {
        const message = { key: 0 };
        globalThis.Object.defineProperty(message, import_runtime8.MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== void 0)
          (0, import_runtime7.reflectionMergePartial)(this, message, value);
        return message;
      }
      internalBinaryRead(reader, length, options, target) {
        const message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
          const [fieldNo, wireType] = reader.tag();
          switch (fieldNo) {
            case /* fixed32 key */
            1:
              message.key = reader.fixed32();
              break;
            default:
              const u = options.readUnknownField;
              if (u === "throw")
                throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
              const d = reader.skip(wireType);
              if (u !== false)
                (u === true ? import_runtime6.UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
          }
        }
        return message;
      }
      internalBinaryWrite(message, writer, options) {
        if (message.key !== 0)
          writer.tag(1, import_runtime5.WireType.Bit32).fixed32(message.key);
        const u = options.writeUnknownFields;
        if (u !== false)
          (u == true ? import_runtime6.UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
      }
    };
    ButtonCommandRequest = new ButtonCommandRequest$Type();
    APIConnection = new import_runtime_rpc.ServiceType("APIConnection", [
      { name: "hello", options: { needs_setup_connection: false, needs_authentication: false }, I: HelloRequest, O: HelloResponse },
      { name: "connect", options: { needs_setup_connection: false, needs_authentication: false }, I: ConnectRequest, O: ConnectResponse },
      { name: "disconnect", options: { needs_setup_connection: false, needs_authentication: false }, I: DisconnectRequest, O: DisconnectResponse },
      { name: "ping", options: { needs_setup_connection: false, needs_authentication: false }, I: PingRequest, O: PingResponse },
      { name: "device_info", options: { needs_authentication: false }, I: DeviceInfoRequest, O: DeviceInfoResponse },
      { name: "list_entities", options: {}, I: ListEntitiesRequest, O: void$ },
      { name: "subscribe_states", options: {}, I: SubscribeStatesRequest, O: void$ },
      { name: "subscribe_logs", options: {}, I: SubscribeLogsRequest, O: void$ },
      { name: "subscribe_homeassistant_services", options: {}, I: SubscribeHomeassistantServicesRequest, O: void$ },
      { name: "subscribe_home_assistant_states", options: {}, I: SubscribeHomeAssistantStatesRequest, O: void$ },
      { name: "get_time", options: { needs_authentication: false }, I: GetTimeRequest, O: GetTimeResponse },
      { name: "execute_service", options: {}, I: ExecuteServiceRequest, O: void$ },
      { name: "cover_command", options: {}, I: CoverCommandRequest, O: void$ },
      { name: "fan_command", options: {}, I: FanCommandRequest, O: void$ },
      { name: "light_command", options: {}, I: LightCommandRequest, O: void$ },
      { name: "switch_command", options: {}, I: SwitchCommandRequest, O: void$ },
      { name: "camera_image", options: {}, I: CameraImageRequest, O: void$ },
      { name: "climate_command", options: {}, I: ClimateCommandRequest, O: void$ },
      { name: "number_command", options: {}, I: NumberCommandRequest, O: void$ },
      { name: "select_command", options: {}, I: SelectCommandRequest, O: void$ },
      { name: "button_command", options: {}, I: ButtonCommandRequest, O: void$ },
      { name: "lock_command", options: {}, I: LockCommandRequest, O: void$ }
    ]);
  }
});

// src/index.ts
var import_base26 = require("@companion-module/base");

// src/esphomeClient.ts
var import_events3 = require("events");

// src/entities/base.ts
var import_events = require("events");
var BaseEntity = class extends import_events.EventEmitter {
  constructor(socket, config) {
    super();
    this.socket = socket;
    this.config = config;
    if (!config) throw new Error("config is required");
  }
  socket;
  config;
  type = this.constructor.name;
  destroy() {
    this.removeAllListeners();
  }
  get key() {
    return this.config.key;
  }
  get id() {
    return this.config.objectId;
  }
  get name() {
    return this.config.name;
  }
};
var StatefulEntity = class extends BaseEntity {
  constructor(socket, config, StateResponseType) {
    super(socket, config);
    this.StateResponseType = StateResponseType;
    this._state = StateResponseType.create({});
    this.socket.addMessageListener(this.StateResponseType, this.onStateMessage);
  }
  StateResponseType;
  _state;
  destroy() {
    super.destroy();
    this.socket.removeMessageListener(this.StateResponseType, this.onStateMessage);
  }
  onStateMessage = (newState) => {
    if (newState.key != this.key) return;
    this._state = newState;
    this.emit("state", this, newState);
  };
};

// src/entities/BinarySensorEntity.ts
init_api();
var BinarySensor = class _BinarySensor extends StatefulEntity {
  static subscribe(socket, newEntityCallback) {
    socket.addMessageListener(ListEntitiesBinarySensorResponse, (config) => {
      const instance = new _BinarySensor(socket, config);
      newEntityCallback(instance);
    });
  }
  constructor(socket, config) {
    super(socket, config, BinarySensorStateResponse);
  }
  get isOn() {
    return this._state.state;
  }
};

// src/entities/ButtonEntity.ts
init_api();
var Button = class _Button extends BaseEntity {
  static subscribe(socket, newEntityCallback) {
    socket.addMessageListener(ListEntitiesButtonResponse, (config) => {
      const instance = new _Button(socket, config);
      newEntityCallback(instance);
    });
  }
  constructor(socket, config) {
    super(socket, config);
  }
  command(data) {
    this.socket.writeRequest(ButtonCommandRequest, { ...data, key: this.config.key });
  }
  push() {
    this.command({});
  }
};

// src/entities/ClimateEntity.ts
init_api();
var Climate = class _Climate extends StatefulEntity {
  static subscribe(socket, newEntityCallback) {
    socket.addMessageListener(ListEntitiesClimateResponse, (config) => {
      const instance = new _Climate(socket, config);
      newEntityCallback(instance);
    });
  }
  get supportedModes() {
    return this.config.supportedModes;
  }
  get mode() {
    return this._state.mode;
  }
  constructor(socket, config) {
    super(socket, config, ClimateStateResponse);
  }
  command(data) {
    this.socket.writeRequest(ClimateCommandRequest, { ...data, key: this.config.key });
  }
  setMode(mode) {
    this.command({ mode, hasMode: true });
  }
};

// src/entities/CoverEntity.ts
init_api();
var Cover = class _Cover extends StatefulEntity {
  static subscribe(socket, newEntityCallback) {
    socket.addMessageListener(ListEntitiesCoverResponse, (config) => {
      const instance = new _Cover(socket, config);
      newEntityCallback(instance);
    });
  }
  constructor(socket, config) {
    super(socket, config, CoverStateResponse);
  }
  get supportsPosition() {
    return this.config.supportsPosition;
  }
  get isOpen() {
    return this._state.position > 0;
  }
  command(data) {
    this.socket.writeRequest(CoverCommandRequest, { ...data, key: this.config.key });
  }
  setPosition(position) {
    this.command({ position, hasPosition: true });
  }
};

// src/entities/FanEntity.ts
init_api();
var Fan = class _Fan extends StatefulEntity {
  static subscribe(socket, newEntityCallback) {
    socket.addMessageListener(ListEntitiesFanResponse, (config) => {
      const instance = new _Fan(socket, config);
      newEntityCallback(instance);
    });
  }
  get isOn() {
    return this._state.state;
  }
  constructor(socket, config) {
    super(socket, config, FanStateResponse);
  }
  command(data) {
    this.socket.writeRequest(FanCommandRequest, { ...data, key: this.config.key });
  }
  setState(state) {
    this.command({ state, hasState: true });
  }
};

// src/entities/LightEntity.ts
init_api();
var Light = class _Light extends StatefulEntity {
  static subscribe(socket, newEntityCallback) {
    socket.addMessageListener(ListEntitiesLightResponse, (config) => {
      const instance = new _Light(socket, config);
      newEntityCallback(instance);
    });
  }
  constructor(socket, config) {
    super(socket, config, LightStateResponse);
  }
  get supportsBrightness() {
    return this.config.supportedColorModes.includes(2 /* BRIGHTNESS */) || this.config.legacySupportsBrightness;
  }
  get isOn() {
    return this._state.state;
  }
  command(data) {
    this.socket.writeRequest(LightCommandRequest, { ...data, key: this.config.key });
  }
  setState(state) {
    this.command({ state, hasState: true });
  }
  setBrightness(brightness) {
    this.command({
      colorMode: 2 /* BRIGHTNESS */,
      hasColorMode: true,
      brightness,
      hasBrightness: true,
      state: true,
      hasState: true
    });
  }
};

// src/entities/LockEntity.ts
init_api();
var Lock = class _Lock extends StatefulEntity {
  static subscribe(socket, newEntityCallback) {
    socket.addMessageListener(ListEntitiesLockResponse, (config) => {
      const instance = new _Lock(socket, config);
      newEntityCallback(instance);
    });
  }
  constructor(socket, config) {
    super(socket, config, LockStateResponse);
  }
  get supportsOpen() {
    return this.config.supportsOpen;
  }
  isState(state) {
    return this._state.state == state;
  }
  command(data) {
    this.socket.writeRequest(LockCommandRequest, { ...data, key: this.config.key });
  }
  setLockCommand(command) {
    this.command({ command });
  }
};

// src/entities/NumberEntity.ts
init_api();
var NumberEntity = class _NumberEntity extends StatefulEntity {
  static subscribe(socket, newEntityCallback) {
    socket.addMessageListener(ListEntitiesNumberResponse, (config) => {
      const instance = new _NumberEntity(socket, config);
      newEntityCallback(instance);
    });
  }
  constructor(socket, config) {
    super(socket, config, NumberStateResponse);
  }
  get minValue() {
    return this.config.minValue;
  }
  get maxValue() {
    return this.config.maxValue;
  }
  get step() {
    return this.config.step;
  }
  get state() {
    return this._state.state;
  }
  command(data) {
    this.socket.writeRequest(NumberCommandRequest, { ...data, key: this.config.key });
  }
  setState(state) {
    this.command({ state });
  }
};

// src/entities/SelectEntity.ts
init_api();
var Select = class _Select extends StatefulEntity {
  static subscribe(socket, newEntityCallback) {
    socket.addMessageListener(ListEntitiesSelectResponse, (config) => {
      const instance = new _Select(socket, config);
      newEntityCallback(instance);
    });
  }
  constructor(socket, config) {
    super(socket, config, SelectStateResponse);
  }
  get options() {
    return this.config.options;
  }
  isState(state) {
    return state === this._state.state;
  }
  command(data) {
    this.socket.writeRequest(SelectCommandRequest, { ...data, key: this.config.key });
  }
  setState(state) {
    this.command({ state });
  }
};

// src/entities/SensorEntity.ts
init_api();
var Sensor = class _Sensor extends StatefulEntity {
  static subscribe(socket, newEntityCallback) {
    socket.addMessageListener(ListEntitiesSensorResponse, (config) => {
      const instance = new _Sensor(socket, config);
      newEntityCallback(instance);
    });
  }
  constructor(socket, config) {
    super(socket, config, SensorStateResponse);
  }
  get state() {
    return this._state.state;
  }
};

// src/entities/SwitchEntity.ts
init_api();
var Switch = class _Switch extends StatefulEntity {
  static subscribe(socket, newEntityCallback) {
    socket.addMessageListener(ListEntitiesSwitchResponse, (config) => {
      const instance = new _Switch(socket, config);
      newEntityCallback(instance);
    });
  }
  constructor(socket, config) {
    super(socket, config, SwitchStateResponse);
  }
  get isOn() {
    return this._state.state;
  }
  command(data) {
    this.socket.writeRequest(SwitchCommandRequest, { ...data, key: this.config.key });
  }
  setState(state) {
    this.command({ state });
  }
};

// src/entities/TextSensorEntity.ts
init_api();
var TextSensor = class _TextSensor extends StatefulEntity {
  static subscribe(socket, newEntityCallback) {
    socket.addMessageListener(ListEntitiesTextSensorResponse, (config) => {
      const instance = new _TextSensor(socket, config);
      newEntityCallback(instance);
    });
  }
  constructor(socket, config) {
    super(socket, config, TextSensorStateResponse);
  }
  get state() {
    return this._state.state;
  }
};

// src/entities/index.ts
var Entities = {
  BinarySensor,
  Button,
  Climate,
  Cover,
  Fan,
  Light,
  Lock,
  Number: NumberEntity,
  Select,
  Sensor,
  Switch,
  TextSensor
};

// src/esphomeClient.ts
var import_esphome_client = require("esphome-client");

// src/connection/e2eSocketAdapter.ts
var import_events2 = require("events");
init_api();
var E2ESocketAdapter = class extends import_events2.EventEmitter {
  constructor(client) {
    super();
    this.client = client;
    this.setupClientListeners();
  }
  client;
  messageSubscriptions = /* @__PURE__ */ new Map();
  entityCache = /* @__PURE__ */ new Map();
  stateCache = /* @__PURE__ */ new Map();
  setupClientListeners() {
    ;
    this.client.on("entities", (entities) => {
      this.handleEntitiesDiscovered(entities);
    });
    this.client.on("state", (state) => {
      this.handleStateUpdate(state);
    });
    this.client.on("error", (error) => {
      this.emit("error", error);
    });
  }
  getMessageTypeName(type) {
    return type.typeName || type.constructor.name || "unknown";
  }
  handleEntitiesDiscovered(entities) {
    if (!entities || !Array.isArray(entities)) return;
    entities.forEach((entity) => {
      try {
        const key = entity.key;
        const type = entity.type?.toLowerCase() || "";
        this.entityCache.set(key, entity);
        const typeMap = {
          binary_sensor: ListEntitiesBinarySensorResponse,
          button: ListEntitiesButtonResponse,
          climate: ListEntitiesClimateResponse,
          cover: ListEntitiesCoverResponse,
          fan: ListEntitiesFanResponse,
          light: ListEntitiesLightResponse,
          lock: ListEntitiesLockResponse,
          number: ListEntitiesNumberResponse,
          select: ListEntitiesSelectResponse,
          sensor: ListEntitiesSensorResponse,
          switch: ListEntitiesSwitchResponse,
          text_sensor: ListEntitiesTextSensorResponse
        };
        const messageType = typeMap[type];
        if (messageType) {
          const typeName = this.getMessageTypeName(messageType);
          const subscription = this.messageSubscriptions.get(typeName);
          if (subscription) {
            const msg = this.translateEntity(type, entity);
            subscription.listeners.forEach((listener) => listener(msg));
          }
        }
      } catch (error) {
        this.emit("error", error);
      }
    });
    const doneName = this.getMessageTypeName(ListEntitiesDoneResponse);
    const doneSubscription = this.messageSubscriptions.get(doneName);
    if (doneSubscription) {
      doneSubscription.listeners.forEach((listener) => listener({}));
    }
    this.emit("listEntitiesDone");
  }
  handleStateUpdate(stateUpdate) {
    try {
      const key = stateUpdate.key;
      const entity = this.entityCache.get(key);
      if (!entity) return;
      this.stateCache.set(key, stateUpdate);
      const type = entity.type?.toLowerCase() || "";
      const stateTypeMap = {
        binary_sensor: BinarySensorStateResponse,
        climate: ClimateStateResponse,
        cover: CoverStateResponse,
        fan: FanStateResponse,
        light: LightStateResponse,
        lock: LockStateResponse,
        number: NumberStateResponse,
        select: SelectStateResponse,
        sensor: SensorStateResponse,
        switch: SwitchStateResponse,
        text_sensor: TextSensorStateResponse
      };
      const messageType = stateTypeMap[type];
      if (messageType) {
        const typeName = this.getMessageTypeName(messageType);
        const subscription = this.messageSubscriptions.get(typeName);
        if (subscription) {
          const msg = this.translateState(type, key, stateUpdate);
          subscription.listeners.forEach((listener) => listener(msg));
        }
      }
    } catch (error) {
      this.emit("error", error);
    }
  }
  translateEntity(type, entity) {
    const base = {
      key: entity.key,
      name: entity.name,
      objectId: entity.objectId,
      uniqueId: entity.uniqueId
    };
    switch (type) {
      case "light":
        return {
          ...base,
          supportedColorModes: entity.supportedColorModes || [],
          legacySupportsBrightness: entity.legacySupportsBrightness || false
        };
      case "number":
        return {
          ...base,
          minValue: entity.minValue || 0,
          maxValue: entity.maxValue || 100,
          step: entity.step || 1
        };
      case "select":
        return {
          ...base,
          options: entity.options || []
        };
      case "sensor":
        return {
          ...base,
          unitOfMeasurement: entity.unitOfMeasurement || ""
        };
      default:
        return base;
    }
  }
  translateState(type, key, state) {
    const base = { key };
    switch (type) {
      case "binary_sensor":
        return { ...base, state: state.state || false };
      case "climate":
        return { ...base, mode: state.mode || 0 };
      case "cover":
        return { ...base, position: state.position || 0 };
      case "fan":
        return { ...base, state: state.state || false };
      case "light":
        return {
          ...base,
          state: state.state || false,
          brightness: state.brightness || 255,
          colorMode: state.colorMode || 0,
          rgb: state.rgb || { r: 0, g: 0, b: 0 }
        };
      case "lock":
        return { ...base, state: state.state || 0 };
      case "number":
        return { ...base, state: state.state || 0 };
      case "select":
        return { ...base, state: state.state || "" };
      case "sensor":
        return { ...base, state: state.state?.toString() || "" };
      case "switch":
        return { ...base, state: state.state || false };
      case "text_sensor":
        return { ...base, state: state.state || "" };
      default:
        return base;
    }
  }
  // Socket-like interface for entities
  addMessageListener(type, listener) {
    const typeName = this.getMessageTypeName(type);
    if (!this.messageSubscriptions.has(typeName)) {
      this.messageSubscriptions.set(typeName, { type, listeners: [] });
    }
    const subscription = this.messageSubscriptions.get(typeName);
    subscription.listeners.push(listener);
  }
  removeMessageListener(type, listener) {
    const typeName = this.getMessageTypeName(type);
    const subscription = this.messageSubscriptions.get(typeName);
    if (subscription) {
      const index = subscription.listeners.indexOf(listener);
      if (index >= 0) {
        subscription.listeners.splice(index, 1);
      }
    }
  }
  writeRequest(requestType, data) {
    const typeName = this.getMessageTypeName(requestType);
    const requestTypeMap = {
      [this.getMessageTypeName(ListEntitiesRequest)]: "listEntities",
      [this.getMessageTypeName(SubscribeStatesRequest)]: "subscribeStates",
      [this.getMessageTypeName(SwitchCommandRequest)]: "switchCommand",
      [this.getMessageTypeName(LightCommandRequest)]: "lightCommand",
      [this.getMessageTypeName(NumberCommandRequest)]: "numberCommand",
      [this.getMessageTypeName(SelectCommandRequest)]: "selectCommand",
      [this.getMessageTypeName(ClimateCommandRequest)]: "climateCommand",
      [this.getMessageTypeName(CoverCommandRequest)]: "coverCommand",
      [this.getMessageTypeName(LockCommandRequest)]: "lockCommand",
      [this.getMessageTypeName(ButtonCommandRequest)]: "buttonCommand"
    };
    const commandType = requestTypeMap[typeName];
    if (!commandType) return;
    const cmd = data;
    switch (commandType) {
      case "switchCommand":
        this.client.sendSwitchCommand?.(cmd.key, cmd.state);
        break;
      case "lightCommand":
        this.client.sendLightCommand?.(cmd.key, cmd);
        break;
      case "numberCommand":
        this.client.sendNumberCommand?.(cmd.key, cmd.state);
        break;
      case "selectCommand":
        this.client.sendSelectCommand?.(cmd.key, cmd.state);
        break;
      case "climateCommand":
        this.client.sendClimateCommand?.(cmd.key, cmd);
        break;
      case "coverCommand":
        this.client.sendCoverCommand?.(cmd.key, cmd);
        break;
      case "lockCommand":
        this.client.sendLockCommand?.(cmd.key, cmd.command);
        break;
      case "buttonCommand":
        this.client.sendButtonCommand?.(cmd.key);
        break;
    }
  }
  emitListEntitiesStart() {
  }
  destroy() {
    this.messageSubscriptions.clear();
    this.entityCache.clear();
    this.stateCache.clear();
    this.removeAllListeners();
  }
};

// src/esphomeClient.ts
var EsphomeClient = class extends import_events3.EventEmitter {
  adapter = null;
  client = null;
  entities = {};
  constructor() {
    super();
  }
  removeAllEntities() {
    for (const id in this.entities) {
      this.entities[id].destroy();
      delete this.entities[id];
    }
  }
  connect(host, port, password, encryptionKey) {
    this.disconnect();
    const clientConfig = {
      host,
      port: port || 6053
    };
    if (encryptionKey) {
      clientConfig.psk = encryptionKey;
    }
    this.client = new import_esphome_client.EspHomeClient(clientConfig);
    this.adapter = new E2ESocketAdapter(this.client);
    const adapter = this.adapter;
    Object.values(Entities).forEach((entity) => {
      entity.subscribe(adapter, (e) => this.addEntity(e));
    });
    this.adapter.on("listEntitiesDone", () => {
      if (this.adapter) {
        const SubscribeStatesRequest2 = (init_api(), __toCommonJS(api_exports)).SubscribeStatesRequest;
        this.adapter.writeRequest(SubscribeStatesRequest2, {});
        this.emit("refreshEntities");
      }
    });
    this.client.on("connect", () => {
      this.removeAllEntities();
      if (this.adapter) {
        this.adapter.emitListEntitiesStart();
      }
    });
    this.client.on("disconnect", () => {
      this.emit("disconnected");
    });
    this.client.on("error", (error) => {
      this.emit("error", error);
    });
    this.adapter.on("error", (error) => {
      this.emit("error", error);
    });
    this.adapter.on("warn", (message) => {
      this.emit("warn", message);
    });
    this.client.connect();
    this.emit("connected");
  }
  addEntity(instance) {
    const id = instance.id;
    if (this.entities[id]) {
      this.emit("warn", `Ignoring Duplicate Entity Id: ${id}`);
    } else {
      this.entities[id] = instance;
      instance.on("state", (entity) => this.onEntityStateChanged(entity));
    }
  }
  onEntityStateChanged(entity) {
    this.emit("state", entity);
  }
  disconnect() {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
    if (this.adapter) {
      this.adapter.destroy();
      this.adapter = null;
    }
    this.removeAllEntities();
  }
  getAll(entityClass) {
    return Object.values(this.entities).filter(entityClass.is);
  }
  getEntity(id, entityClass) {
    const entity = this.entities[id];
    if (entity && entityClass.is(entity)) {
      return entity;
    }
    return void 0;
  }
};

// src/config.ts
var import_base14 = require("@companion-module/base");

// src/connection/esphomeSocket.ts
init_api();
var import_base13 = require("@companion-module/base");

// src/connection/util.ts
function extractMessageId(messageType) {
  const idField = messageType.options.id;
  if (!idField || typeof idField !== "number") {
    throw new Error("messageType does not contain an id");
  }
  return idField;
}

// src/connection/esphomeSocket.ts
var DEFAULT_PORT = 6053;
var HelloResponseId = extractMessageId(HelloResponse);
var ConnectResponseId = extractMessageId(ConnectResponse);
var PingRequestId = extractMessageId(PingRequest);

// src/config.ts
function GetConfigFields() {
  return [
    {
      type: "textinput",
      id: "host",
      label: "Host",
      width: 8,
      regex: import_base14.Regex.SOMETHING
    },
    {
      type: "number",
      id: "port",
      label: "Port",
      width: 4,
      min: 1,
      max: 65535,
      default: DEFAULT_PORT
    },
    {
      type: "textinput",
      id: "password",
      label: "Password",
      width: 12
    },
    {
      type: "textinput",
      id: "encryptionKey",
      label: "Encryption Key (base64)",
      width: 12
    }
  ];
}

// src/entityAdapters/BinarySensorAdapter.ts
var import_base15 = require("@companion-module/base");

// src/choices.ts
function OnOffTogglePicker() {
  const options = [
    { id: "on" /* On */, label: "On" },
    { id: "off" /* Off */, label: "Off" },
    { id: "toggle" /* Toggle */, label: "Toggle" }
  ];
  return {
    type: "dropdown",
    label: "State",
    id: "state",
    default: "on" /* On */,
    choices: options
  };
}
function OnOffPicker() {
  return {
    type: "checkbox",
    label: "State",
    id: "state",
    default: true
  };
}
function EntityPicker(entities) {
  return {
    type: "dropdown",
    label: "Entity",
    id: "entity_id",
    default: entities[0] ? entities[0].id : "",
    choices: entities.map((ent) => ({
      id: ent.id,
      label: ent.name || `${ent.id}`
    })).sort((a, b) => {
      const a2 = a.label.toLowerCase();
      const b2 = b.label.toLowerCase();
      return a2 === b2 ? 0 : a2 < b2 ? -1 : 1;
    })
  };
}
function NumberValuePicker() {
  return {
    type: "number",
    label: "Value",
    id: "value",
    default: 0
  };
}
function NumberComparitorPicker() {
  const options = [
    { id: "eq" /* Equal */, label: "Equal" },
    { id: "ne" /* NotEqual */, label: "Not Equal" },
    { id: "gt" /* GreaterThan */, label: "Greater than" },
    { id: "gte" /* GreaterThanEqual */, label: "Greater than or equal" },
    { id: "lt" /* LessThan */, label: "Less than" },
    { id: "lte" /* LessThanEqual */, label: "Less than or equal" }
  ];
  return {
    type: "dropdown",
    label: "Comparitor",
    id: "comparitor",
    default: "eq" /* Equal */,
    choices: options
  };
}
function compareNumber(target, comparitor, currentValue) {
  const targetValue = Number(target);
  if (isNaN(targetValue)) {
    return false;
  }
  switch (comparitor) {
    case "gt" /* GreaterThan */:
      return currentValue > targetValue;
    case "gte" /* GreaterThanEqual */:
      return currentValue >= targetValue;
    case "lt" /* LessThan */:
      return currentValue < targetValue;
    case "lte" /* LessThanEqual */:
      return currentValue <= targetValue;
    case "ne" /* NotEqual */:
      return currentValue != targetValue;
    default:
      return currentValue === targetValue;
  }
}

// src/entityAdapters/BinarySensorAdapter.ts
var BinarySensorAdapter = {
  is: (instance) => {
    return instance instanceof BinarySensor;
  },
  createActions: (_client) => {
    return {};
  },
  createFeedbacks: (client) => {
    const feedbacks = {};
    const entities = client.getAll(BinarySensorAdapter);
    if (entities.length) {
      feedbacks["binary_sensor_state" /* BinarySensorState */] = {
        type: "boolean",
        name: "Change from binary sensor state",
        description: "If the binary sensor state matches the rule, change style of the bank",
        options: [EntityPicker(entities), OnOffPicker()],
        defaultStyle: {
          color: (0, import_base15.combineRgb)(0, 0, 0),
          bgcolor: (0, import_base15.combineRgb)(0, 255, 0)
        },
        callback: (feedback) => {
          const entity = client.getEntity(String(feedback.options.entity_id), BinarySensorAdapter);
          if (entity) {
            return entity.isOn === !!feedback.options.state;
          }
          return false;
        }
      };
    }
    return feedbacks;
  }
};

// src/entityAdapters/ButtonAdapter.ts
var ButtonAdapter = {
  is: (instance) => {
    return instance instanceof Button;
  },
  createActions: (client) => {
    const actions = {};
    const buttonEntities = client.getAll(ButtonAdapter);
    if (buttonEntities.length) {
      actions["button_push" /* ButtonPush */] = {
        name: "Push Button",
        options: [EntityPicker(buttonEntities)],
        callback: (evt) => {
          const id = evt.options.entity_id;
          client.getEntity(id, ButtonAdapter)?.push();
        }
      };
    }
    return actions;
  },
  createFeedbacks: (_client) => {
    return {};
  }
};

// src/entityAdapters/ClimateAdapter.ts
var import_base16 = require("@companion-module/base");
init_api();
var ClimateAdapter = {
  is: (instance) => {
    return instance instanceof Climate;
  },
  createActions: (client) => {
    const actions = {};
    client.getAll(ClimateAdapter).forEach((climate) => {
      actions["climate_mode_id_" /* ClimateMode */ + climate.id] = {
        name: `${climate.name}: Set climate mode`,
        options: [ClimateModePicker(climate.supportedModes)],
        callback: (evt) => {
          if (typeof evt.options.mode === "number") {
            climate.setMode(evt.options.mode);
          }
        }
      };
    });
    return actions;
  },
  createFeedbacks: (client) => {
    const feedbacks = {};
    const entities = client.getAll(ClimateAdapter);
    if (entities.length) {
      feedbacks["climate_mode" /* ClimateMode */] = {
        type: "boolean",
        name: "Change from climate mode",
        description: "If the climate mode matches the rule, change style of the bank",
        options: [EntityPicker(entities), ClimateModePicker(AllClimateModes)],
        defaultStyle: {
          color: (0, import_base16.combineRgb)(0, 0, 0),
          bgcolor: (0, import_base16.combineRgb)(0, 255, 0)
        },
        callback: (feedback) => {
          const entity = client.getEntity(String(feedback.options.entity_id), ClimateAdapter);
          if (entity) {
            return entity.mode === feedback.options.mode;
          }
          return false;
        }
      };
    }
    return feedbacks;
  }
};
var ClimateModeLabels = {
  [0 /* OFF */]: "Off",
  [1 /* HEAT_COOL */]: "Heat/Cool",
  [2 /* COOL */]: "Cool",
  [3 /* HEAT */]: "Heat",
  [4 /* FAN_ONLY */]: "Fan Only",
  [5 /* DRY */]: "Dry",
  [6 /* AUTO */]: "Auto"
};
var AllClimateModes = Object.values(ClimateMode).filter((v) => typeof v !== "string");
function ClimateModePicker(supportedModes) {
  return {
    type: "dropdown",
    label: "Mode",
    id: "mode",
    default: supportedModes[0],
    choices: supportedModes.map((mode) => {
      return {
        id: mode,
        label: ClimateModeLabels[mode]
      };
    })
  };
}

// src/entityAdapters/CoverAdapter.ts
var import_base17 = require("@companion-module/base");
var CoverAdapter = {
  is: (instance) => {
    return instance instanceof Cover;
  },
  createActions: (client) => {
    const actions = {};
    client.getAll(CoverAdapter).forEach((cover) => {
      actions["cover_position_id_" /* CoverPosition */ + cover.id] = {
        name: `${cover.name}: Set cover position`,
        options: [
          {
            type: "number",
            label: "Position (0=Closed, 1=Open)",
            id: "value",
            default: 0,
            min: 0,
            max: 1,
            step: cover.supportsPosition ? 0.01 : 1,
            range: true
          }
        ],
        callback: (evt) => {
          cover.setPosition(Number(evt.options.value));
        }
      };
    });
    return actions;
  },
  createFeedbacks: (client) => {
    const feedbacks = {};
    const entities = client.getAll(CoverAdapter);
    if (entities.length) {
      feedbacks["cover_open" /* CoverOpen */] = {
        type: "boolean",
        name: "Change from cover open",
        description: "If the cover open matches the rule, change style of the bank",
        options: [
          EntityPicker(entities),
          {
            type: "checkbox",
            label: "Open",
            id: "open",
            default: true
          }
        ],
        defaultStyle: {
          color: (0, import_base17.combineRgb)(0, 0, 0),
          bgcolor: (0, import_base17.combineRgb)(0, 255, 0)
        },
        callback: (feedback) => {
          const entity = client.getEntity(String(feedback.options.entity_id), CoverAdapter);
          if (entity) {
            return entity.isOpen === !!feedback.options.open;
          }
          return false;
        }
      };
    }
    return feedbacks;
  }
};

// src/entityAdapters/FanAdapter.ts
var import_base18 = require("@companion-module/base");
var FanAdapter = {
  is: (instance) => {
    return instance instanceof Fan;
  },
  createActions: (client) => {
    const actions = {};
    const fanEntities = client.getAll(FanAdapter);
    if (fanEntities.length) {
      actions["fan_state" /* FanState */] = {
        name: "Set fan state",
        options: [EntityPicker(fanEntities), OnOffTogglePicker()],
        callback: (evt) => {
          const id = evt.options.entity_id;
          const e = client.getEntity(id, FanAdapter);
          if (!e) return;
          let newState;
          switch (evt.options.state) {
            case "off" /* Off */:
              newState = false;
              break;
            case "toggle" /* Toggle */:
              newState = !e.isOn;
              break;
            default:
              newState = true;
              break;
          }
          e.setState(newState);
        }
      };
    }
    return actions;
  },
  createFeedbacks: (client) => {
    const feedbacks = {};
    const entities = client.getAll(FanAdapter);
    if (entities.length) {
      feedbacks["fan_state" /* FanState */] = {
        type: "boolean",
        name: "Change from fan state",
        description: "If the fan state matches the rule, change style of the bank",
        options: [EntityPicker(entities), OnOffPicker()],
        defaultStyle: {
          color: (0, import_base18.combineRgb)(0, 0, 0),
          bgcolor: (0, import_base18.combineRgb)(0, 255, 0)
        },
        callback: (feedback) => {
          const entity = client.getEntity(String(feedback.options.entity_id), FanAdapter);
          if (entity) {
            return entity.isOn === !!feedback.options.state;
          }
          return false;
        }
      };
    }
    return feedbacks;
  }
};

// src/entityAdapters/LightAdapter.ts
var import_base19 = require("@companion-module/base");
var LightAdapter = {
  is: (instance) => {
    return instance instanceof Light;
  },
  createActions: (client) => {
    const actions = {};
    const lightEntities = client.getAll(LightAdapter);
    if (lightEntities.length) {
      actions["light_state" /* LightState */] = {
        name: "Set light state",
        options: [EntityPicker(lightEntities), OnOffTogglePicker()],
        callback: (evt) => {
          const id = evt.options.entity_id;
          const e = client.getEntity(id, LightAdapter);
          if (!e) return;
          let newState;
          switch (evt.options.state) {
            case "off" /* Off */:
              newState = false;
              break;
            case "toggle" /* Toggle */:
              newState = !e.isOn;
              break;
            default:
              newState = true;
              break;
          }
          e.setState(newState);
        }
      };
      actions["light_brightness" /* LightBrightness */] = {
        name: "Set light brightness (percentage)",
        options: [
          EntityPicker(lightEntities.filter((light) => light.supportsBrightness)),
          {
            type: "number",
            label: "Brightness",
            id: "brightness",
            default: 50,
            min: 0,
            max: 100,
            step: 1,
            range: true
          }
        ],
        callback: (evt) => {
          const id = evt.options.entity_id;
          const e = client.getEntity(id, LightAdapter);
          e?.setBrightness(Number(evt.options.brightness) / 100);
        }
      };
    }
    return actions;
  },
  createFeedbacks: (client) => {
    const feedbacks = {};
    const entities = client.getAll(LightAdapter);
    if (entities.length) {
      feedbacks["light_on_state" /* LightState */] = {
        type: "boolean",
        name: "Change from light state",
        description: "If the light state matches the rule, change style of the bank",
        options: [EntityPicker(entities), OnOffPicker()],
        defaultStyle: {
          color: (0, import_base19.combineRgb)(0, 0, 0),
          bgcolor: (0, import_base19.combineRgb)(0, 255, 0)
        },
        callback: (feedback) => {
          const entity = client.getEntity(String(feedback.options.entity_id), LightAdapter);
          if (entity) {
            return entity.isOn === !!feedback.options.state;
          }
          return false;
        }
      };
    }
    return feedbacks;
  }
};

// src/entityAdapters/LockAdapter.ts
var import_base20 = require("@companion-module/base");
init_api();
var LockAdapter = {
  is: (instance) => {
    return instance instanceof Lock;
  },
  createActions: (client) => {
    const actions = {};
    client.getAll(LockAdapter).forEach((lock) => {
      const options = [
        { id: 1 /* LOCK_LOCK */, label: "Lock" },
        { id: 0 /* LOCK_UNLOCK */, label: "Unlock" }
      ];
      if (lock.supportsOpen) {
        options.push({ id: 2 /* LOCK_OPEN */, label: "Open" });
      }
      actions["lock_command_id_" /* LockCommand */ + lock.id] = {
        name: `${lock.name}: Set lock state`,
        options: [
          {
            type: "dropdown",
            label: "State",
            id: "state",
            default: 1 /* LOCK_LOCK */,
            choices: options
          }
        ],
        callback: (evt) => {
          lock.setLockCommand(evt.options.value);
        }
      };
    });
    return actions;
  },
  createFeedbacks: (client) => {
    const feedbacks = {};
    const entities = client.getAll(LockAdapter);
    if (entities.length) {
      feedbacks["lock_state" /* LockState */] = {
        type: "boolean",
        name: "Change from lock state",
        description: "If the lock state matches the rule, change style of the bank",
        options: [
          EntityPicker(entities),
          {
            type: "dropdown",
            label: "State",
            id: "state",
            default: 1 /* LOCKED */,
            choices: [
              { id: 1 /* LOCKED */, label: "Locked" },
              { id: 2 /* UNLOCKED */, label: "Unocked" },
              { id: 4 /* LOCKING */, label: "Locking" },
              { id: 5 /* UNLOCKING */, label: "Unlocking" },
              { id: 3 /* JAMMED */, label: "Jammed" },
              { id: 0 /* NONE */, label: "None" }
            ]
          }
        ],
        defaultStyle: {
          color: (0, import_base20.combineRgb)(0, 0, 0),
          bgcolor: (0, import_base20.combineRgb)(0, 255, 0)
        },
        callback: (feedback) => {
          const entity = client.getEntity(String(feedback.options.entity_id), LockAdapter);
          if (entity) {
            return entity.isState(feedback.options.state);
          }
          return false;
        }
      };
    }
    return feedbacks;
  }
};

// src/entityAdapters/NumberAdapter.ts
var import_base21 = require("@companion-module/base");
var NumberAdapter = {
  is: (instance) => {
    return instance instanceof NumberEntity;
  },
  createActions: (client) => {
    const actions = {};
    client.getAll(NumberAdapter).forEach((numberEntity) => {
      actions["number_state_id_" /* NumberState */ + numberEntity.id] = {
        name: `${numberEntity.name}: Set number state`,
        options: [
          {
            type: "number",
            label: "Value",
            id: "value",
            default: numberEntity.minValue,
            min: numberEntity.minValue,
            max: numberEntity.maxValue,
            step: numberEntity.step,
            range: true
          }
        ],
        callback: (evt) => {
          numberEntity.setState(Number(evt.options.value));
        }
      };
    });
    return actions;
  },
  createFeedbacks: (client) => {
    const feedbacks = {};
    const entities = client.getAll(NumberAdapter);
    if (entities.length) {
      feedbacks["number_state" /* NumberState */] = {
        type: "boolean",
        name: "Change from number state",
        description: "If the number state matches the rule, change style of the bank",
        options: [
          EntityPicker(entities),
          NumberComparitorPicker(),
          NumberValuePicker()
        ],
        defaultStyle: {
          color: (0, import_base21.combineRgb)(0, 0, 0),
          bgcolor: (0, import_base21.combineRgb)(0, 255, 0)
        },
        callback: (feedback) => {
          const entity = client.getEntity(String(feedback.options.entity_id), NumberAdapter);
          if (entity) {
            return compareNumber(feedback.options.value, feedback.options.comparitor, entity.state);
          }
          return false;
        }
      };
    }
    return feedbacks;
  }
};

// src/entityAdapters/SelectAdapter.ts
var import_base22 = require("@companion-module/base");
var SelectAdapter = {
  is: (instance) => {
    return instance instanceof Select;
  },
  createActions: (client) => {
    const actions = {};
    client.getAll(SelectAdapter).forEach((select) => {
      const options = select.options.map((o) => ({ id: o, label: o }));
      actions["select_state_id_" /* SelectState */ + select.id] = {
        name: `${select.name}: Set select state`,
        options: [
          {
            type: "dropdown",
            label: "State",
            id: "state",
            default: options[0].id,
            choices: options
          }
        ],
        callback: (evt) => {
          if (typeof evt.options.state === "string") {
            select.setState(evt.options.state);
          }
        }
      };
    });
    return actions;
  },
  createFeedbacks: (client) => {
    const feedbacks = {};
    client.getAll(SelectAdapter).forEach((select) => {
      const options = select.options.map((o) => ({ id: o, label: o }));
      feedbacks["select_state_id_" /* SelectState */ + select.id] = {
        type: "boolean",
        name: `${select.name}: Change from select state`,
        description: "If the select state matches the rule, change style of the bank",
        options: [
          {
            type: "dropdown",
            label: "State",
            id: "state",
            default: options[0] && options[0].id,
            choices: options
          }
        ],
        defaultStyle: {
          color: (0, import_base22.combineRgb)(0, 0, 0),
          bgcolor: (0, import_base22.combineRgb)(0, 255, 0)
        },
        callback: (feedback) => select.isState(String(feedback.options.state))
      };
    });
    return feedbacks;
  }
};

// src/entityAdapters/SensorAdapter.ts
var import_base23 = require("@companion-module/base");
var SensorAdapter = {
  is: (instance) => {
    return instance instanceof Sensor;
  },
  createActions: (_client) => {
    return {};
  },
  createFeedbacks: (client) => {
    const feedbacks = {};
    const entities = client.getAll(SensorAdapter);
    if (entities.length) {
      feedbacks["sensor_state" /* SensorState */] = {
        type: "boolean",
        name: "Change from sensor state",
        description: "If the sensor state matches the rule, change style of the bank",
        options: [EntityPicker(entities), NumberComparitorPicker(), NumberValuePicker()],
        defaultStyle: {
          color: (0, import_base23.combineRgb)(0, 0, 0),
          bgcolor: (0, import_base23.combineRgb)(0, 255, 0)
        },
        callback: (feedback) => {
          const entity = client.getEntity(String(feedback.options.entity_id), SensorAdapter);
          if (entity) {
            return compareNumber(feedback.options.value, feedback.options.comparitor, entity.state);
          }
          return false;
        }
      };
    }
    return feedbacks;
  }
};

// src/entityAdapters/SwitchAdapter.ts
var import_base24 = require("@companion-module/base");
var SwitchAdapter = {
  is: (instance) => {
    return instance instanceof Switch;
  },
  createActions: (client) => {
    const actions = {};
    const switchEntities = client.getAll(SwitchAdapter);
    if (switchEntities.length) {
      actions["switch_state" /* SwitchState */] = {
        name: "Set switch state",
        options: [EntityPicker(switchEntities), OnOffTogglePicker()],
        callback: (evt) => {
          const id = evt.options.entity_id;
          const e = client.getEntity(id, SwitchAdapter);
          if (!e) return;
          let newState;
          switch (evt.options.state) {
            case "off" /* Off */:
              newState = false;
              break;
            case "toggle" /* Toggle */:
              newState = !e.isOn;
              break;
            default:
              newState = true;
              break;
          }
          e.setState(newState);
        }
      };
    }
    return actions;
  },
  createFeedbacks: (client) => {
    const feedbacks = {};
    const entities = client.getAll(SwitchAdapter);
    if (entities.length) {
      feedbacks["switch_state" /* SwitchState */] = {
        type: "boolean",
        name: "Change from switch state",
        description: "If the switch state matches the rule, change style of the bank",
        options: [EntityPicker(entities), OnOffPicker()],
        defaultStyle: {
          color: (0, import_base24.combineRgb)(0, 0, 0),
          bgcolor: (0, import_base24.combineRgb)(0, 255, 0)
        },
        callback: (feedback) => {
          const entity = client.getEntity(String(feedback.options.entity_id), SwitchAdapter);
          if (entity) {
            return entity.isOn === !!feedback.options.state;
          }
          return false;
        }
      };
    }
    return feedbacks;
  }
};

// src/entityAdapters/TextSensorAdapter.ts
var import_base25 = require("@companion-module/base");
var TextSensorAdapter = {
  is: (instance) => {
    return instance instanceof TextSensor;
  },
  createActions: (_client) => {
    return {};
  },
  createFeedbacks: (client) => {
    const feedbacks = {};
    const entities = client.getAll(TextSensorAdapter);
    if (entities.length) {
      feedbacks["text_sensor_value" /* TextSensorValue */] = {
        type: "boolean",
        name: "Change from text sensor state",
        description: "If the text sensor state matches the rule, change style of the bank",
        options: [
          EntityPicker(entities),
          {
            type: "textinput",
            id: "state",
            label: "State Value",
            required: true,
            regex: import_base25.Regex.SOMETHING
          }
        ],
        defaultStyle: {
          color: (0, import_base25.combineRgb)(0, 0, 0),
          bgcolor: (0, import_base25.combineRgb)(0, 255, 0)
        },
        callback: (feedback) => {
          const entity = client.getEntity(String(feedback.options.entity_id), TextSensorAdapter);
          if (entity) {
            return entity.state == feedback.options.state;
          }
          return false;
        }
      };
    }
    return feedbacks;
  }
};

// src/entityAdapters/index.ts
var EntityAdapters = {
  BinarySensor: BinarySensorAdapter,
  Button: ButtonAdapter,
  Climate: ClimateAdapter,
  Cover: CoverAdapter,
  Fan: FanAdapter,
  Light: LightAdapter,
  Lock: LockAdapter,
  Number: NumberAdapter,
  Select: SelectAdapter,
  Sensor: SensorAdapter,
  Switch: SwitchAdapter,
  TextSensor: TextSensorAdapter
};

// src/actions.ts
function GetActionsList(client) {
  const actions = {};
  Object.values(EntityAdapters).forEach((adapter) => {
    Object.assign(actions, adapter.createActions(client));
  });
  return actions;
}

// src/feedback.ts
function GetFeedbacksList(client) {
  const feedbacks = {};
  Object.values(EntityAdapters).forEach((adapter) => {
    Object.assign(feedbacks, adapter.createFeedbacks(client));
  });
  return feedbacks;
}

// src/index.ts
var ESPHomeInstance = class extends import_base26.InstanceBase {
  client = new EsphomeClient();
  config;
  constructor(internal) {
    super(internal);
    this.client.on("connected", () => {
      this.updateStatus(import_base26.InstanceStatus.Ok);
    });
    this.client.on("disconnected", () => {
      this.updateStatus(import_base26.InstanceStatus.Disconnected);
    });
    this.client.on("refreshEntities", () => {
      this.refreshCompanionInstances();
    });
    this.client.on("state", (_entity) => {
      this.checkFeedbacks();
    });
    this.client.on("warn", (msg) => {
      this.log("warn", msg);
    });
    this.client.on("error", (err) => {
      this.updateStatus(import_base26.InstanceStatus.UnknownError, err.message);
      this.log("error", "ESPHome client error: " + err.message);
    });
  }
  getConfigFields() {
    return GetConfigFields();
  }
  async init(config) {
    this.config = config;
    this.initClient(config);
  }
  initClient(config) {
    if (config.host) {
      this.client.connect(config.host, config.port, config.password, config.encryptionKey);
    } else {
      this.client.disconnect();
    }
  }
  refreshCompanionInstances() {
    this.setActionDefinitions(GetActionsList(this.client));
    this.setFeedbackDefinitions(GetFeedbacksList(this.client));
  }
  async configUpdated(config) {
    let resetConnection = false;
    if (!this.config || this.config.host != config.host || this.config.port != config.port || this.config.password != config.password || this.config.encryptionKey != config.encryptionKey) {
      resetConnection = true;
    }
    this.config = config;
    if (resetConnection === true) {
      this.initClient(config);
    }
  }
  async destroy() {
    this.client.disconnect();
    this.log("debug", "destroy");
  }
};
(0, import_base26.runEntrypoint)(ESPHomeInstance, []);
