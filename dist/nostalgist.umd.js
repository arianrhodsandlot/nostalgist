(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.Nostalgist = factory());
})(this, (function() {
  "use strict";
  const systemCoreMap = {
    gb: "mgba",
    gba: "mgba",
    gbc: "mgba",
    megadrive: "genesis_plus_gx",
    nes: "fceumm",
    snes: "snes9x"
  };
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var ini$3;
  var hasRequiredIni;
  function requireIni() {
    if (hasRequiredIni) return ini$3;
    hasRequiredIni = 1;
    const { hasOwnProperty } = Object.prototype;
    const encode = (obj, opt = {}) => {
      if (typeof opt === "string") {
        opt = { section: opt };
      }
      opt.align = opt.align === true;
      opt.newline = opt.newline === true;
      opt.sort = opt.sort === true;
      opt.whitespace = opt.whitespace === true || opt.align === true;
      opt.platform = opt.platform || typeof process !== "undefined" && process.platform;
      opt.bracketedArray = opt.bracketedArray !== false;
      const eol = opt.platform === "win32" ? "\r\n" : "\n";
      const separator = opt.whitespace ? " = " : "=";
      const children = [];
      const keys = opt.sort ? Object.keys(obj).sort() : Object.keys(obj);
      let padToChars = 0;
      if (opt.align) {
        padToChars = safe(
          keys.filter((k) => obj[k] === null || Array.isArray(obj[k]) || typeof obj[k] !== "object").map((k) => Array.isArray(obj[k]) ? `${k}[]` : k).concat([""]).reduce((a, b) => safe(a).length >= safe(b).length ? a : b)
        ).length;
      }
      let out = "";
      const arraySuffix = opt.bracketedArray ? "[]" : "";
      for (const k of keys) {
        const val = obj[k];
        if (val && Array.isArray(val)) {
          for (const item of val) {
            out += safe(`${k}${arraySuffix}`).padEnd(padToChars, " ") + separator + safe(item) + eol;
          }
        } else if (val && typeof val === "object") {
          children.push(k);
        } else {
          out += safe(k).padEnd(padToChars, " ") + separator + safe(val) + eol;
        }
      }
      if (opt.section && out.length) {
        out = "[" + safe(opt.section) + "]" + (opt.newline ? eol + eol : eol) + out;
      }
      for (const k of children) {
        const nk = splitSections(k, ".").join("\\.");
        const section = (opt.section ? opt.section + "." : "") + nk;
        const child = encode(obj[k], {
          ...opt,
          section
        });
        if (out.length && child.length) {
          out += eol;
        }
        out += child;
      }
      return out;
    };
    function splitSections(str, separator) {
      var lastMatchIndex = 0;
      var lastSeparatorIndex = 0;
      var nextIndex = 0;
      var sections = [];
      do {
        nextIndex = str.indexOf(separator, lastMatchIndex);
        if (nextIndex !== -1) {
          lastMatchIndex = nextIndex + separator.length;
          if (nextIndex > 0 && str[nextIndex - 1] === "\\") {
            continue;
          }
          sections.push(str.slice(lastSeparatorIndex, nextIndex));
          lastSeparatorIndex = nextIndex + separator.length;
        }
      } while (nextIndex !== -1);
      sections.push(str.slice(lastSeparatorIndex));
      return sections;
    }
    const decode = (str, opt = {}) => {
      opt.bracketedArray = opt.bracketedArray !== false;
      const out = /* @__PURE__ */ Object.create(null);
      let p = out;
      let section = null;
      const re = /^\[([^\]]*)\]\s*$|^([^=]+)(=(.*))?$/i;
      const lines = str.split(/[\r\n]+/g);
      const duplicates = {};
      for (const line of lines) {
        if (!line || line.match(/^\s*[;#]/) || line.match(/^\s*$/)) {
          continue;
        }
        const match = line.match(re);
        if (!match) {
          continue;
        }
        if (match[1] !== void 0) {
          section = unsafe(match[1]);
          if (section === "__proto__") {
            p = /* @__PURE__ */ Object.create(null);
            continue;
          }
          p = out[section] = out[section] || /* @__PURE__ */ Object.create(null);
          continue;
        }
        const keyRaw = unsafe(match[2]);
        let isArray;
        if (opt.bracketedArray) {
          isArray = keyRaw.length > 2 && keyRaw.slice(-2) === "[]";
        } else {
          duplicates[keyRaw] = (duplicates?.[keyRaw] || 0) + 1;
          isArray = duplicates[keyRaw] > 1;
        }
        const key = isArray && keyRaw.endsWith("[]") ? keyRaw.slice(0, -2) : keyRaw;
        if (key === "__proto__") {
          continue;
        }
        const valueRaw = match[3] ? unsafe(match[4]) : true;
        const value = valueRaw === "true" || valueRaw === "false" || valueRaw === "null" ? JSON.parse(valueRaw) : valueRaw;
        if (isArray) {
          if (!hasOwnProperty.call(p, key)) {
            p[key] = [];
          } else if (!Array.isArray(p[key])) {
            p[key] = [p[key]];
          }
        }
        if (Array.isArray(p[key])) {
          p[key].push(value);
        } else {
          p[key] = value;
        }
      }
      const remove = [];
      for (const k of Object.keys(out)) {
        if (!hasOwnProperty.call(out, k) || typeof out[k] !== "object" || Array.isArray(out[k])) {
          continue;
        }
        const parts = splitSections(k, ".");
        p = out;
        const l = parts.pop();
        const nl = l.replace(/\\\./g, ".");
        for (const part of parts) {
          if (part === "__proto__") {
            continue;
          }
          if (!hasOwnProperty.call(p, part) || typeof p[part] !== "object") {
            p[part] = /* @__PURE__ */ Object.create(null);
          }
          p = p[part];
        }
        if (p === out && nl === l) {
          continue;
        }
        p[nl] = out[k];
        remove.push(k);
      }
      for (const del of remove) {
        delete out[del];
      }
      return out;
    };
    const isQuoted = (val) => {
      return val.startsWith('"') && val.endsWith('"') || val.startsWith("'") && val.endsWith("'");
    };
    const safe = (val) => {
      if (typeof val !== "string" || val.match(/[=\r\n]/) || val.match(/^\[/) || val.length > 1 && isQuoted(val) || val !== val.trim()) {
        return JSON.stringify(val);
      }
      return val.split(";").join("\\;").split("#").join("\\#");
    };
    const unsafe = (val) => {
      val = (val || "").trim();
      if (isQuoted(val)) {
        if (val.charAt(0) === "'") {
          val = val.slice(1, -1);
        }
        try {
          val = JSON.parse(val);
        } catch {
        }
      } else {
        let esc = false;
        let unesc = "";
        for (let i2 = 0, l = val.length; i2 < l; i2++) {
          const c = val.charAt(i2);
          if (esc) {
            if ("\\;#".indexOf(c) !== -1) {
              unesc += c;
            } else {
              unesc += "\\" + c;
            }
            esc = false;
          } else if (";#".indexOf(c) !== -1) {
            break;
          } else if (c === "\\") {
            esc = true;
          } else {
            unesc += c;
          }
        }
        if (esc) {
          unesc += "\\";
        }
        return unesc.trim();
      }
      return val;
    };
    ini$3 = {
      parse: decode,
      decode,
      stringify: encode,
      encode,
      safe,
      unsafe
    };
    return ini$3;
  }
  var iniExports = requireIni();
  const ini$2 = /* @__PURE__ */ getDefaultExportFromCjs(iniExports);
  var pathBrowserify;
  var hasRequiredPathBrowserify;
  function requirePathBrowserify() {
    if (hasRequiredPathBrowserify) return pathBrowserify;
    hasRequiredPathBrowserify = 1;
    function assertPath(path2) {
      if (typeof path2 !== "string") {
        throw new TypeError("Path must be a string. Received " + JSON.stringify(path2));
      }
    }
    function normalizeStringPosix(path2, allowAboveRoot) {
      var res = "";
      var lastSegmentLength = 0;
      var lastSlash = -1;
      var dots = 0;
      var code;
      for (var i2 = 0; i2 <= path2.length; ++i2) {
        if (i2 < path2.length)
          code = path2.charCodeAt(i2);
        else if (code === 47)
          break;
        else
          code = 47;
        if (code === 47) {
          if (lastSlash === i2 - 1 || dots === 1) ;
          else if (lastSlash !== i2 - 1 && dots === 2) {
            if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
              if (res.length > 2) {
                var lastSlashIndex = res.lastIndexOf("/");
                if (lastSlashIndex !== res.length - 1) {
                  if (lastSlashIndex === -1) {
                    res = "";
                    lastSegmentLength = 0;
                  } else {
                    res = res.slice(0, lastSlashIndex);
                    lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
                  }
                  lastSlash = i2;
                  dots = 0;
                  continue;
                }
              } else if (res.length === 2 || res.length === 1) {
                res = "";
                lastSegmentLength = 0;
                lastSlash = i2;
                dots = 0;
                continue;
              }
            }
            if (allowAboveRoot) {
              if (res.length > 0)
                res += "/..";
              else
                res = "..";
              lastSegmentLength = 2;
            }
          } else {
            if (res.length > 0)
              res += "/" + path2.slice(lastSlash + 1, i2);
            else
              res = path2.slice(lastSlash + 1, i2);
            lastSegmentLength = i2 - lastSlash - 1;
          }
          lastSlash = i2;
          dots = 0;
        } else if (code === 46 && dots !== -1) {
          ++dots;
        } else {
          dots = -1;
        }
      }
      return res;
    }
    function _format(sep, pathObject) {
      var dir = pathObject.dir || pathObject.root;
      var base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
      if (!dir) {
        return base;
      }
      if (dir === pathObject.root) {
        return dir + base;
      }
      return dir + sep + base;
    }
    var posix = {
      // path.resolve([from ...], to)
      resolve: function resolve() {
        var resolvedPath = "";
        var resolvedAbsolute = false;
        var cwd;
        for (var i2 = arguments.length - 1; i2 >= -1 && !resolvedAbsolute; i2--) {
          var path2;
          if (i2 >= 0)
            path2 = arguments[i2];
          else {
            if (cwd === void 0)
              cwd = process.cwd();
            path2 = cwd;
          }
          assertPath(path2);
          if (path2.length === 0) {
            continue;
          }
          resolvedPath = path2 + "/" + resolvedPath;
          resolvedAbsolute = path2.charCodeAt(0) === 47;
        }
        resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
        if (resolvedAbsolute) {
          if (resolvedPath.length > 0)
            return "/" + resolvedPath;
          else
            return "/";
        } else if (resolvedPath.length > 0) {
          return resolvedPath;
        } else {
          return ".";
        }
      },
      normalize: function normalize(path2) {
        assertPath(path2);
        if (path2.length === 0) return ".";
        var isAbsolute = path2.charCodeAt(0) === 47;
        var trailingSeparator = path2.charCodeAt(path2.length - 1) === 47;
        path2 = normalizeStringPosix(path2, !isAbsolute);
        if (path2.length === 0 && !isAbsolute) path2 = ".";
        if (path2.length > 0 && trailingSeparator) path2 += "/";
        if (isAbsolute) return "/" + path2;
        return path2;
      },
      isAbsolute: function isAbsolute(path2) {
        assertPath(path2);
        return path2.length > 0 && path2.charCodeAt(0) === 47;
      },
      join: function join() {
        if (arguments.length === 0)
          return ".";
        var joined;
        for (var i2 = 0; i2 < arguments.length; ++i2) {
          var arg = arguments[i2];
          assertPath(arg);
          if (arg.length > 0) {
            if (joined === void 0)
              joined = arg;
            else
              joined += "/" + arg;
          }
        }
        if (joined === void 0)
          return ".";
        return posix.normalize(joined);
      },
      relative: function relative(from, to) {
        assertPath(from);
        assertPath(to);
        if (from === to) return "";
        from = posix.resolve(from);
        to = posix.resolve(to);
        if (from === to) return "";
        var fromStart = 1;
        for (; fromStart < from.length; ++fromStart) {
          if (from.charCodeAt(fromStart) !== 47)
            break;
        }
        var fromEnd = from.length;
        var fromLen = fromEnd - fromStart;
        var toStart = 1;
        for (; toStart < to.length; ++toStart) {
          if (to.charCodeAt(toStart) !== 47)
            break;
        }
        var toEnd = to.length;
        var toLen = toEnd - toStart;
        var length = fromLen < toLen ? fromLen : toLen;
        var lastCommonSep = -1;
        var i2 = 0;
        for (; i2 <= length; ++i2) {
          if (i2 === length) {
            if (toLen > length) {
              if (to.charCodeAt(toStart + i2) === 47) {
                return to.slice(toStart + i2 + 1);
              } else if (i2 === 0) {
                return to.slice(toStart + i2);
              }
            } else if (fromLen > length) {
              if (from.charCodeAt(fromStart + i2) === 47) {
                lastCommonSep = i2;
              } else if (i2 === 0) {
                lastCommonSep = 0;
              }
            }
            break;
          }
          var fromCode = from.charCodeAt(fromStart + i2);
          var toCode = to.charCodeAt(toStart + i2);
          if (fromCode !== toCode)
            break;
          else if (fromCode === 47)
            lastCommonSep = i2;
        }
        var out = "";
        for (i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2) {
          if (i2 === fromEnd || from.charCodeAt(i2) === 47) {
            if (out.length === 0)
              out += "..";
            else
              out += "/..";
          }
        }
        if (out.length > 0)
          return out + to.slice(toStart + lastCommonSep);
        else {
          toStart += lastCommonSep;
          if (to.charCodeAt(toStart) === 47)
            ++toStart;
          return to.slice(toStart);
        }
      },
      _makeLong: function _makeLong(path2) {
        return path2;
      },
      dirname: function dirname(path2) {
        assertPath(path2);
        if (path2.length === 0) return ".";
        var code = path2.charCodeAt(0);
        var hasRoot = code === 47;
        var end = -1;
        var matchedSlash = true;
        for (var i2 = path2.length - 1; i2 >= 1; --i2) {
          code = path2.charCodeAt(i2);
          if (code === 47) {
            if (!matchedSlash) {
              end = i2;
              break;
            }
          } else {
            matchedSlash = false;
          }
        }
        if (end === -1) return hasRoot ? "/" : ".";
        if (hasRoot && end === 1) return "//";
        return path2.slice(0, end);
      },
      basename: function basename(path2, ext) {
        if (ext !== void 0 && typeof ext !== "string") throw new TypeError('"ext" argument must be a string');
        assertPath(path2);
        var start = 0;
        var end = -1;
        var matchedSlash = true;
        var i2;
        if (ext !== void 0 && ext.length > 0 && ext.length <= path2.length) {
          if (ext.length === path2.length && ext === path2) return "";
          var extIdx = ext.length - 1;
          var firstNonSlashEnd = -1;
          for (i2 = path2.length - 1; i2 >= 0; --i2) {
            var code = path2.charCodeAt(i2);
            if (code === 47) {
              if (!matchedSlash) {
                start = i2 + 1;
                break;
              }
            } else {
              if (firstNonSlashEnd === -1) {
                matchedSlash = false;
                firstNonSlashEnd = i2 + 1;
              }
              if (extIdx >= 0) {
                if (code === ext.charCodeAt(extIdx)) {
                  if (--extIdx === -1) {
                    end = i2;
                  }
                } else {
                  extIdx = -1;
                  end = firstNonSlashEnd;
                }
              }
            }
          }
          if (start === end) end = firstNonSlashEnd;
          else if (end === -1) end = path2.length;
          return path2.slice(start, end);
        } else {
          for (i2 = path2.length - 1; i2 >= 0; --i2) {
            if (path2.charCodeAt(i2) === 47) {
              if (!matchedSlash) {
                start = i2 + 1;
                break;
              }
            } else if (end === -1) {
              matchedSlash = false;
              end = i2 + 1;
            }
          }
          if (end === -1) return "";
          return path2.slice(start, end);
        }
      },
      extname: function extname(path2) {
        assertPath(path2);
        var startDot = -1;
        var startPart = 0;
        var end = -1;
        var matchedSlash = true;
        var preDotState = 0;
        for (var i2 = path2.length - 1; i2 >= 0; --i2) {
          var code = path2.charCodeAt(i2);
          if (code === 47) {
            if (!matchedSlash) {
              startPart = i2 + 1;
              break;
            }
            continue;
          }
          if (end === -1) {
            matchedSlash = false;
            end = i2 + 1;
          }
          if (code === 46) {
            if (startDot === -1)
              startDot = i2;
            else if (preDotState !== 1)
              preDotState = 1;
          } else if (startDot !== -1) {
            preDotState = -1;
          }
        }
        if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
        preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
          return "";
        }
        return path2.slice(startDot, end);
      },
      format: function format(pathObject) {
        if (pathObject === null || typeof pathObject !== "object") {
          throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
        }
        return _format("/", pathObject);
      },
      parse: function parse(path2) {
        assertPath(path2);
        var ret = { root: "", dir: "", base: "", ext: "", name: "" };
        if (path2.length === 0) return ret;
        var code = path2.charCodeAt(0);
        var isAbsolute = code === 47;
        var start;
        if (isAbsolute) {
          ret.root = "/";
          start = 1;
        } else {
          start = 0;
        }
        var startDot = -1;
        var startPart = 0;
        var end = -1;
        var matchedSlash = true;
        var i2 = path2.length - 1;
        var preDotState = 0;
        for (; i2 >= start; --i2) {
          code = path2.charCodeAt(i2);
          if (code === 47) {
            if (!matchedSlash) {
              startPart = i2 + 1;
              break;
            }
            continue;
          }
          if (end === -1) {
            matchedSlash = false;
            end = i2 + 1;
          }
          if (code === 46) {
            if (startDot === -1) startDot = i2;
            else if (preDotState !== 1) preDotState = 1;
          } else if (startDot !== -1) {
            preDotState = -1;
          }
        }
        if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
        preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
          if (end !== -1) {
            if (startPart === 0 && isAbsolute) ret.base = ret.name = path2.slice(1, end);
            else ret.base = ret.name = path2.slice(startPart, end);
          }
        } else {
          if (startPart === 0 && isAbsolute) {
            ret.name = path2.slice(1, startDot);
            ret.base = path2.slice(1, end);
          } else {
            ret.name = path2.slice(startPart, startDot);
            ret.base = path2.slice(startPart, end);
          }
          ret.ext = path2.slice(startDot, end);
        }
        if (startPart > 0) ret.dir = path2.slice(0, startPart - 1);
        else if (isAbsolute) ret.dir = "/";
        return ret;
      },
      sep: "/",
      delimiter: ":",
      win32: null,
      posix: null
    };
    posix.posix = posix;
    pathBrowserify = posix;
    return pathBrowserify;
  }
  var pathBrowserifyExports = requirePathBrowserify();
  const path$5 = /* @__PURE__ */ getDefaultExportFromCjs(pathBrowserifyExports);
  const vendors = {
    ini: ini$2,
    path: path$5
  };
  const { path: path$4 } = vendors;
  const fileNameHeaderRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
  const urlSegmentSeparator = /[?/#]/;
  function isURLStringLike(value) {
    if (typeof value !== "string") {
      return false;
    }
    const prefixes = ["http://", "https://", "data:", "blob:", "./", "../"];
    if (prefixes.some((absolutePrefix) => value.startsWith(absolutePrefix))) {
      return true;
    }
    if (["#", "{"].some((char) => value.startsWith(char))) {
      return false;
    }
    if (value.includes("\n")) {
      return false;
    }
    const segments = value.split(urlSegmentSeparator);
    if (segments.length < 2) {
      return false;
    }
    return segments.every((segment) => segment.length < 100);
  }
  function isURL(value) {
    return typeof globalThis.URL === "function" && value instanceof globalThis.URL;
  }
  function isRequest(value) {
    return typeof globalThis.Request === "function" && value instanceof globalThis.Request;
  }
  function isResponse(value) {
    return typeof globalThis.Response === "function" && value instanceof globalThis.Response;
  }
  function isArrayBuffer(value) {
    return typeof globalThis.ArrayBuffer === "function" && value instanceof globalThis.ArrayBuffer;
  }
  function isUint8Array(value) {
    return typeof globalThis.Uint8Array === "function" && value instanceof globalThis.Uint8Array;
  }
  function isBlob(value) {
    return typeof globalThis.Blob === "function" && value instanceof globalThis.Blob;
  }
  function isFileSystemFileHandle(value) {
    return typeof globalThis.FileSystemFileHandle === "function" && value instanceof globalThis.FileSystemFileHandle;
  }
  function isFetchable(value) {
    return isURLStringLike(value) || isURL(value) || isRequest(value);
  }
  class ResolvableFile {
    name = "";
    /** The base name of the file, without its extension. */
    get baseName() {
      return path$4.parse(this.name).name;
    }
    /** The extension name of the file, with a leading ".". */
    get extension() {
      return path$4.parse(this.name).ext;
    }
    arrayBuffer;
    blob;
    blobType = "application/octet-stream";
    objectUrl;
    raw;
    signal;
    text;
    uint8Array;
    urlResolver;
    constructor({ blobType, name, raw, signal, urlResolver }) {
      this.raw = raw;
      if (signal) {
        this.signal = signal;
      }
      if (urlResolver) {
        this.urlResolver = urlResolver;
      }
      if (blobType) {
        this.blobType = blobType;
      }
      if (name) {
        this.name = extractValidFileName(name);
      }
    }
    static async create(rawOrOption) {
      if (isNil(rawOrOption)) {
        throw new Error("parameter is not valid");
      }
      if (rawOrOption instanceof ResolvableFile) {
        return rawOrOption;
      }
      const option = typeof rawOrOption === "object" && "raw" in rawOrOption ? rawOrOption : { raw: rawOrOption };
      const resolvableFile = new ResolvableFile(option);
      await resolvableFile.load();
      return resolvableFile;
    }
    dispose() {
      if (typeof this.objectUrl === "string") {
        URL.revokeObjectURL(this.objectUrl);
      }
    }
    async getArrayBuffer() {
      if (this.arrayBuffer) {
        return this.arrayBuffer;
      }
      this.arrayBuffer = await this.getBlob().arrayBuffer();
      return this.arrayBuffer;
    }
    getBlob() {
      if (!this.blob) {
        throw new Error("blob is not available");
      }
      return this.blob;
    }
    getObjectUrl() {
      if (this.objectUrl) {
        return this.objectUrl;
      }
      this.objectUrl = URL.createObjectURL(this.getBlob());
      return this.objectUrl;
    }
    async getText() {
      if (this.text !== void 0) {
        return this.text;
      }
      this.text = await this.getBlob().text();
      return this.text;
    }
    async getUint8Array() {
      if (this.uint8Array) {
        return this.uint8Array;
      }
      const arrayBuffer = await this.getArrayBuffer();
      this.uint8Array = new Uint8Array(arrayBuffer);
      return this.uint8Array;
    }
    async load() {
      const result = await getResult(this.urlResolver ? this.urlResolver(this) : this.raw);
      if (typeof result === "object" && "fileContent" in result && "fileName" in result) {
        const [fileName, fileContent] = await Promise.all([getResult(result.fileName), getResult(result.fileContent)]);
        await this.loadContent({ fileContent, fileName });
      } else {
        await this.loadContent(result);
      }
    }
    loadArrayBuffer(arrayBuffer) {
      this.arrayBuffer = arrayBuffer;
      this.blob = new Blob([arrayBuffer], { type: this.blobType });
    }
    async loadContent(content) {
      if (isBlob(content)) {
        this.blob = content;
      } else if (isFetchable(content)) {
        await this.loadFetchable(content);
      } else if (typeof content === "string") {
        this.loadPlainText(content);
      } else if (isResolvableFileContent(content?.fileContent)) {
        await this.loadObject(content);
      } else if (isArrayBuffer(content)) {
        this.loadArrayBuffer(content);
      } else if (isUint8Array(content)) {
        this.loadUint8Array(content);
      } else if (isResponse(content)) {
        await this.loadResponse(content);
      } else if (isFileSystemFileHandle(content)) {
        await this.loadFileSystemFileHandle(content);
      } else {
        throw new TypeError("failed to resolve the file, file content:", content);
      }
      const uint8Array = await this.getUint8Array();
      const extention = isZip(uint8Array) ? "zip" : "bin";
      this.name ||= generateValidFileName(extention);
    }
    async loadFetchable(fetchable) {
      if (isRequest(fetchable)) {
        this.name ||= extractValidFileName(fetchable.url);
      } else if (isURL(fetchable)) {
        this.name ||= extractValidFileName(fetchable.href);
      } else {
        this.name ||= extractValidFileName(fetchable);
      }
      const response = await fetch(fetchable, { signal: this.signal || null });
      await this.loadResponse(response);
    }
    async loadFileSystemFileHandle(fileSystemFileHandle) {
      const file = await fileSystemFileHandle.getFile();
      this.blob = file;
      this.name = extractValidFileName(file.name);
    }
    async loadObject(object) {
      let { fileContent, fileName } = object;
      [fileName, fileContent] = await Promise.all([getResult(fileName), getResult(fileContent)]);
      this.name ||= extractValidFileName(fileName);
      await this.loadContent(fileContent);
    }
    loadPlainText(text) {
      this.blob = new Blob([text], { type: this.blobType });
    }
    async loadResponse(response) {
      const header = response.headers.get("Content-Disposition");
      if (header) {
        const extracted = fileNameHeaderRegex.exec(header)?.[1]?.replaceAll(/['"]/g, "");
        if (extracted) {
          this.name ||= extractValidFileName(extracted);
        }
      }
      if (!response.ok) {
        throw new Error("Failed to load response", { cause: response });
      }
      this.blob = await response.blob();
      this.name ||= extractValidFileName(response.url);
    }
    loadUint8Array(uint8Array) {
      this.uint8Array = uint8Array;
      this.blob = new Blob([uint8Array], { type: this.blobType });
    }
  }
  const { path: path$3 } = vendors;
  const textEncoder = new TextEncoder();
  function urlBaseName(url) {
    let pathname = url;
    try {
      pathname = new URL(url).pathname;
    } catch {
    }
    const name = path$3.basename(pathname);
    try {
      return decodeURIComponent(name);
    } catch {
      return name;
    }
  }
  let i = 0;
  function id() {
    i += 1;
    return i;
  }
  function generateValidFileName(extension = "bin") {
    return `data${id()}.${extension}`;
  }
  function extractValidFileName(url) {
    let baseName = urlBaseName(url) || "";
    baseName = baseName.replaceAll(/["%*/:<>?\\|]/g, "-");
    const extractedExtension = path$3.parse(baseName).ext;
    if (extractedExtension) {
      return baseName;
    }
    return "";
  }
  function isAbsoluteUrl(string) {
    if (!string) {
      return false;
    }
    if (typeof string !== "string") {
      return false;
    }
    const absolutePrefixes = ["http://", "https://", "//", "data:", "blob:"];
    return absolutePrefixes.some((absolutePrefix) => string.startsWith(absolutePrefix));
  }
  function updateStyle(element, style) {
    if (!element) {
      return;
    }
    for (const rule in style) {
      const value = style[rule];
      element.style[rule] = value || null;
    }
  }
  function delay(time) {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }
  function isGlobalScript(js) {
    return js.startsWith("var Module");
  }
  function isEsmScript(js) {
    return js.includes("import.meta.url");
  }
  async function patchCoreJs({ js, name }) {
    let jsContent = await js.getText();
    if (isGlobalScript(jsContent)) {
      jsContent = `export function getEmscripten({ Module }) {
        ${jsContent};
        Module.FS = FS;
        Module.PATH = PATH;
        Module.ERRNO_CODES = ERRNO_CODES;
        return {
          AL: typeof AL === 'undefined' ? null: AL,
          Browser: typeof Browser === 'undefined' ? null: Browser,
          JSEvents,
          Module,
          exit: _emscripten_force_exit
         }
      }`;
    } else if (isEsmScript(jsContent)) {
      jsContent = `${jsContent.replace("var setImmediate", "").replace(
        "readyPromiseResolve(Module)",
        `readyPromiseResolve({
        AL: typeof AL === 'undefined' ? null: AL,
        Browser: typeof Browser === 'undefined' ? null: Browser,
        JSEvents,
        Module,
        exit: _emscripten_force_exit
      })`
      )};
    export function getEmscripten({ Module }) {
      const fnA = (typeof libretro_${name} === "function") ? libretro_${name} : null;
      const fnB = (typeof ${name} === "function") ? ${name} : null;

      const factory = fnA || fnB;

      return factory ? factory(Module) : null;
    }
    `;
    }
    return jsContent;
  }
  async function importCoreJsAsESM({ js, name }) {
    const jsContent = await patchCoreJs({ js, name });
    const jsResolvable = await ResolvableFile.create({ blobType: "application/javascript", raw: jsContent });
    const jsObjectUrl = jsResolvable.getObjectUrl();
    try {
      return await import(
        /* @vite-ignore */
        /* webpackIgnore: true */
        jsObjectUrl
      );
    } catch {
      return await new Function(`return import('${jsObjectUrl}')`)();
    } finally {
      jsResolvable.dispose();
    }
  }
  function isNil(obj) {
    return obj === void 0 || obj === null;
  }
  function isPlainObject$1(obj) {
    if (isNil(obj)) {
      return false;
    }
    return obj.constructor === Object || !obj.constructor;
  }
  function mergeProperty(target, source, key) {
    const targetValue = target[key];
    const sourceValue = source[key];
    if (isNil(targetValue)) {
      target[key] = sourceValue;
    } else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      target[key] = [...targetValue, ...sourceValue];
    } else if (isPlainObject$1(targetValue) && isPlainObject$1(sourceValue)) {
      target[key] = isPlainObject$1(targetValue) ? target[key] : {};
      merge(target[key], sourceValue);
    } else {
      target[key] = sourceValue;
    }
  }
  function merge(target, ...sources) {
    if (sources.length === 1) {
      const [source] = sources;
      for (const key in source) {
        mergeProperty(target, source, key);
      }
    } else {
      for (const source of sources) {
        merge(target, source);
      }
    }
  }
  function checkIsAborted(signal) {
    if (signal?.aborted) {
      uninstallSetImmediatePolyfill();
      throw new Error("Launch aborted");
    }
  }
  function padZero(number) {
    return (number < 10 ? "0" : "") + number;
  }
  async function getResult(value) {
    if (!value) {
      return value;
    }
    if (typeof value?.then === "function") {
      return getResult(await value);
    }
    if (typeof value === "function") {
      return getResult(value());
    }
    return value;
  }
  function isResolvableFileContent(value) {
    if (typeof value === "string") {
      return true;
    }
    const resolvableClasses = [
      globalThis.Response,
      globalThis.Uint8Array,
      globalThis.URL,
      globalThis.Request,
      globalThis.Response,
      globalThis.FileSystemFileHandle,
      globalThis.Blob
    ];
    return resolvableClasses.some((clazz) => clazz && value instanceof clazz);
  }
  function isResolvableFileInput(value) {
    if (typeof value === "string") {
      return true;
    }
    if ("fileContent" in value) {
      return true;
    }
    if (Array.isArray(value)) {
      return value.every((item) => isResolvableFileInput(item));
    }
    return isResolvableFileContent(value);
  }
  function isZip(uint8Array) {
    return uint8Array[0] === 80 && // eslint-disable-next-line unicorn/number-literal-case
    uint8Array[1] === 75 && (uint8Array[2] === 3 || uint8Array[2] === 5 || uint8Array[2] === 7) && (uint8Array[3] === 4 || uint8Array[3] === 6 || uint8Array[3] === 8);
  }
  const originalSetImmediate = globalThis.setImmediate;
  function setImmediate(callback) {
    return originalSetImmediate ? originalSetImmediate(callback) : setTimeout(callback, 0);
  }
  function installSetImmediatePolyfill() {
    if (typeof globalThis.setImmediate === "function") {
      return;
    }
    globalThis.setImmediate = setImmediate;
  }
  function uninstallSetImmediatePolyfill() {
    if (globalThis.setImmediate === setImmediate) {
      delete globalThis.setImmediate;
    }
  }
  const { path: path$2 } = vendors;
  function getDefaultRetroarchConfig() {
    const defaultRetroarchConfig = {
      menu_driver: "rgui",
      menu_navigation_browser_filter_supported_extensions_enable: false,
      notification_show_when_menu_is_alive: true,
      savestate_auto_load: true,
      savestate_thumbnail_enable: true,
      stdin_cmd_enable: true,
      video_shader_enable: true,
      input_audio_mute: "nul",
      // override default 'f9'
      input_cheat_index_minus: "nul",
      // override default 't',
      input_cheat_index_plus: "nul",
      // override default 'y',
      input_cheat_toggle: "nul",
      // override default 'u',
      input_desktop_menu_toggle: "nul",
      // override default 'f5'
      input_exit_emulator: "nul",
      // override default 'esc',
      input_fps_toggle: "nul",
      // override default 'f3'
      input_frame_advance: "nul",
      // override default 'k',
      input_game_focus_toggle: "nul",
      // override default 'scroll_lock'
      input_grab_mouse_toggle: "nul",
      // override default 'f11'
      input_hold_fast_forward: "nul",
      // override default 'l',
      input_hold_slowmotion: "nul",
      // override default 'e',
      input_load_state: "nul",
      // override default 'f4'
      input_netplay_game_watch: "nul",
      // override default 'i',
      input_netplay_player_chat: "nul",
      // override default 'tilde'
      input_pause_toggle: "nul",
      // override default 'p',
      input_reset: "nul",
      // override default 'h',
      input_rewind: "nul",
      // override default 'r',
      input_save_state: "nul",
      // override default 'f2'
      input_screenshot: "nul",
      // override default 'f8'
      input_shader_next: "nul",
      // override default 'm',
      input_shader_prev: "nul",
      // override default 'n',
      input_shader_toggle: "nul",
      // override default 'comma'
      input_state_slot_decrease: "nul",
      // override default 'f6'
      input_state_slot_increase: "nul",
      // override default 'f7'
      input_toggle_fast_forward: "nul",
      // override default 'space'
      input_toggle_fullscreen: "nul",
      // override default 'f',
      input_volume_down: "nul",
      // override default 'subtract'
      input_volume_up: "nul",
      // override default 'add'
      input_player1_analog_dpad_mode: 1,
      input_player2_analog_dpad_mode: 1,
      input_player3_analog_dpad_mode: 1,
      input_player4_analog_dpad_mode: 1
    };
    return defaultRetroarchConfig;
  }
  const cdnBaseUrl = "https://cdn.jsdelivr.net/gh";
  const coreRepo = "arianrhodsandlot/retroarch-emscripten-build";
  const coreVersion = "v1.22.2";
  const coreDirectory = "retroarch";
  const shaderRepo = "libretro/glsl-shaders";
  const shaderVersion = "468f67b6f6788e2719d1dd28dfb2c9b7c3db3cc7";
  const zipjsURL = "https://cdn.jsdelivr.net/npm/@zip.js/zip.js@2.8.10/+esm";
  const extractCache = /* @__PURE__ */ new Map();
  async function extractCore(core) {
    const url = `${cdnBaseUrl}/${coreRepo}@${coreVersion}/${coreDirectory}/${core}_libretro.zip`;
    const [{ BlobReader, BlobWriter, ZipReader }, response] = await Promise.all([
      import(
        /* @vite-ignore */
        /* webpackIgnore: true */
        zipjsURL
      ),
      fetch(url)
    ]);
    const blob = await response.blob();
    const zipFileReader = new BlobReader(blob);
    const zipReader = new ZipReader(zipFileReader);
    const entries = await zipReader.getEntries();
    const result = {};
    await Promise.all(
      entries.map(async (entry) => {
        if (entry && !entry.directory) {
          if (entry.filename.endsWith(".js")) {
            result.js = await entry.getData?.(new BlobWriter("application/octet-stream"));
          } else if (entry.filename.endsWith(".wasm")) {
            result.wasm = await entry.getData?.(new BlobWriter("application/octet-stream"));
          }
        }
      })
    );
    if (!result.js || !result.wasm) {
      throw new Error(`Failed to extract core files for ${core}`);
    }
    return result;
  }
  async function extractCoreWithCache(core) {
    if (extractCache.has(core)) {
      return extractCache.get(core);
    }
    const promise = extractCore(core);
    extractCache.set(core, promise);
    const result = await promise;
    extractCache.delete(core);
    return result;
  }
  function getDefaultOptions() {
    const defaultOptions = {
      element: "",
      retroarchConfig: getDefaultRetroarchConfig(),
      retroarchCoreConfig: {},
      runEmulatorManually: false,
      setupEmulatorManually: false,
      async resolveCoreJs(core) {
        if (typeof core !== "string") {
          throw new TypeError("the core name must be a string");
        }
        const { js } = await extractCoreWithCache(core);
        if (!js) {
          throw new Error(`Failed to load core JS for ${core}`);
        }
        return js;
      },
      async resolveCoreWasm(core) {
        if (typeof core !== "string") {
          throw new TypeError("the core name must be a string");
        }
        const { wasm } = await extractCoreWithCache(core);
        if (!wasm) {
          throw new Error(`failed to load core WASM for ${core}`);
        }
        return wasm;
      },
      resolveRom(file) {
        if (typeof file !== "string") {
          return file || [];
        }
        if (isAbsoluteUrl(file)) {
          return file;
        }
        const extension = path$2.extname(file);
        const romRepo = {
          ".bin": "retrobrews/md-games",
          ".gb": "retrobrews/gbc-games",
          ".gba": "retrobrews/gba-games",
          ".gbc": "retrobrews/gbc-games",
          ".md": "retrobrews/md-games",
          ".nes": "retrobrews/nes-games",
          ".sfc": "retrobrews/snes-games",
          ".sms": "retrobrews/sms-games"
        }[extension];
        if (romRepo) {
          const encodedFile = encodeURIComponent(file);
          return `${cdnBaseUrl}/${romRepo}@master/${encodedFile}`;
        }
        return file;
      },
      resolveBios(file) {
        return file;
      },
      resolveShader(name) {
        if (!name) {
          return [];
        }
        const preset = `${cdnBaseUrl}/${shaderRepo}@${shaderVersion}/${name}.glslp`;
        const segments = name.split(path$2.sep);
        segments.splice(-1, 0, "shaders");
        const shader = `${cdnBaseUrl}/${shaderRepo}@${shaderVersion}/${segments.join(path$2.sep)}.glsl`;
        return [preset, shader];
      }
    };
    return defaultOptions;
  }
  let globalOptions = getDefaultOptions();
  function getGlobalOptions() {
    return globalOptions;
  }
  function updateGlobalOptions(options) {
    merge(globalOptions, options);
  }
  function resetGlobalOptions() {
    globalOptions = getDefaultOptions();
  }
  function isPlainObject(value) {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
  }
  function isValidCacheKey(cacheKey) {
    return typeof cacheKey === "string" || isPlainObject(cacheKey);
  }
  function getCacheStore() {
    return {
      bios: /* @__PURE__ */ new Map(),
      core: /* @__PURE__ */ new Map(),
      rom: /* @__PURE__ */ new Map(),
      shader: /* @__PURE__ */ new Map(),
      sram: /* @__PURE__ */ new Map(),
      state: /* @__PURE__ */ new Map()
    };
  }
  class EmulatorOptions {
    static cacheStorage = getCacheStore();
    beforeLaunch;
    bios = [];
    cache = { bios: false, core: false, rom: false, shader: false, sram: false, state: false };
    core = {};
    element;
    /**
     * An option to override the `Module` object for Emscripten. See [Module object](https://emscripten.org/docs/api_reference/module.html).
     *
     * This is a low level option and not well tested, so use it at your own risk.
     */
    emscriptenModule;
    respondToGlobalEvents;
    rom = [];
    shader = [];
    signal;
    /**
     *
     * The size of the canvas element.
     * If it's `'auto'`, the canvas element will keep its original size, or it's width and height will be updated as specified.
     */
    size;
    sram;
    state;
    waitForInteraction;
    /**
     * RetroArch config.
     * Not all options can make effects in browser.
     */
    get retroarchConfig() {
      const options = {};
      merge(options, getGlobalOptions().retroarchConfig, this.nostalgistOptions.retroarchConfig);
      return options;
    }
    /**
     * RetroArch core config.
     * Not all options can make effects in browser.
     */
    get retroarchCoreConfig() {
      const options = {};
      merge(options, getGlobalOptions().retroarchCoreConfig, this.nostalgistOptions.retroarchCoreConfig);
      return options;
    }
    get style() {
      const { element, style } = this.nostalgistOptions;
      const defaultAppearanceStyle = {
        backgroundColor: "black",
        imageRendering: "pixelated"
      };
      if (element) {
        merge(defaultAppearanceStyle, style);
        return defaultAppearanceStyle;
      }
      const defaultLayoutStyle = {
        height: "100%",
        left: "0",
        position: "fixed",
        top: "0",
        width: "100%",
        zIndex: "1"
      };
      merge(defaultLayoutStyle, defaultAppearanceStyle, style);
      return defaultLayoutStyle;
    }
    loadPromises = [];
    nostalgistOptions;
    constructor(options) {
      this.nostalgistOptions = options;
      this.emscriptenModule = options.emscriptenModule ?? {};
      this.respondToGlobalEvents = options.respondToGlobalEvents ?? true;
      this.signal = options.signal;
      this.size = options.size ?? "auto";
      this.waitForInteraction = options.waitForInteraction;
      this.element = this.getElement();
      if (typeof options.cache === "boolean") {
        for (const key in this.cache) {
          this.cache[key] = options.cache;
        }
      } else {
        Object.assign(this.cache, options.cache);
      }
    }
    static async create(options) {
      const emulatorOptions = new EmulatorOptions(options);
      await emulatorOptions.load();
      return emulatorOptions;
    }
    static resetCacheStore() {
      Object.assign(EmulatorOptions.cacheStorage, getCacheStore());
    }
    async load() {
      this.loadFromCache();
      await Promise.all(this.loadPromises);
      this.saveToCache();
    }
    loadFromCache() {
      const loadPromises = [];
      const loadMethodMap = {
        bios: this.updateBios,
        core: this.updateCore,
        rom: this.updateRom,
        shader: this.updateShader,
        sram: this.updateSRAM,
        state: this.updateState
      };
      for (const key in this.cache) {
        const field = key;
        if (this.cache[field]) {
          const cache = EmulatorOptions.cacheStorage[field];
          const cacheKey = this.nostalgistOptions[field];
          if (isValidCacheKey(cacheKey)) {
            const cacheValue = cache.get(cacheKey);
            if (cacheValue) {
              this[field] = cacheValue;
              continue;
            }
          }
        }
        const method = loadMethodMap[field];
        const promise = method.call(this);
        loadPromises.push(promise);
      }
      this.loadPromises = loadPromises;
    }
    saveToCache() {
      for (const key in this.cache) {
        const field = key;
        if (this.cache[field]) {
          const cache = EmulatorOptions.cacheStorage[field];
          const cacheKey = this.nostalgistOptions[field];
          const cacheValue = this[field];
          if (isValidCacheKey(cacheKey) && cacheValue) {
            cache.set(cacheKey, cacheValue);
          }
        }
      }
    }
    async updateSRAM() {
      if (this.nostalgistOptions.sram) {
        this.sram = await ResolvableFile.create(this.nostalgistOptions.sram);
      }
    }
    async updateState() {
      if (this.nostalgistOptions.state) {
        this.state = await ResolvableFile.create(this.nostalgistOptions.state);
      }
    }
    getElement() {
      if (typeof document !== "object") {
        throw new TypeError("document must be an object");
      }
      let { element } = this.nostalgistOptions;
      if (typeof element === "string" && element) {
        const canvas = document.body.querySelector(element);
        if (!canvas) {
          throw new Error(`can not find element "${element}"`);
        }
        if (!(canvas instanceof HTMLCanvasElement)) {
          throw new TypeError(`element "${element}" is not a canvas element`);
        }
        element = canvas;
      }
      if (!element) {
        element = document.createElement("canvas");
      }
      if (element instanceof HTMLCanvasElement) {
        element.id = "canvas";
        return element;
      }
      throw new TypeError("invalid element");
    }
    async updateBios() {
      let { bios, resolveBios } = this.nostalgistOptions;
      if (!bios) {
        return;
      }
      bios = await getResult(bios);
      if (!bios) {
        return;
      }
      const biosFiles = Array.isArray(bios) ? bios : [bios];
      this.bios = await Promise.all(
        biosFiles.map(
          (raw) => ResolvableFile.create(
            typeof raw === "string" ? { raw, signal: this.signal, urlResolver: () => resolveBios(raw, this.nostalgistOptions) } : { raw, signal: this.signal }
          )
        )
      );
    }
    async updateCore() {
      const { core, resolveCoreJs, resolveCoreWasm } = this.nostalgistOptions;
      if (typeof core === "object" && "js" in core && "name" in core && "wasm" in core) {
        const [js, wasm] = await Promise.all([ResolvableFile.create(core.js), ResolvableFile.create(core.wasm)]);
        this.core = { js, name: core.name, wasm };
        return;
      }
      const [coreResolvable, coreWasmResolvable] = await Promise.all(
        [resolveCoreJs, resolveCoreWasm].map(
          (resolver) => ResolvableFile.create({
            raw: core,
            signal: this.signal,
            urlResolver: () => resolver(core, this.nostalgistOptions)
          })
        )
      );
      const name = typeof core === "string" ? core : coreResolvable.name;
      this.core = { js: coreResolvable, name, wasm: coreWasmResolvable };
    }
    async updateRom() {
      let { resolveRom, rom } = this.nostalgistOptions;
      if (!rom) {
        return;
      }
      rom = await getResult(rom);
      if (!rom) {
        return;
      }
      const romFiles = Array.isArray(rom) ? rom : [rom];
      this.rom = await Promise.all(
        romFiles.map(
          (romFile) => ResolvableFile.create(
            typeof romFile === "string" ? { raw: romFile, signal: this.signal, urlResolver: () => resolveRom(romFile, this.nostalgistOptions) } : { raw: romFile, signal: this.signal }
          )
        )
      );
      for (const resolvable of this.rom) {
        resolvable.name ||= generateValidFileName();
      }
    }
    async updateShader() {
      let { resolveShader, shader } = this.nostalgistOptions;
      if (!shader) {
        return;
      }
      shader = await getResult(shader);
      if (!shader) {
        return;
      }
      let rawShaderFile = await resolveShader(shader, this.nostalgistOptions);
      if (!rawShaderFile) {
        return;
      }
      rawShaderFile = await getResult(rawShaderFile);
      if (!rawShaderFile) {
        return;
      }
      const rawShaderFiles = Array.isArray(rawShaderFile) ? rawShaderFile : [rawShaderFile];
      this.shader = await Promise.all(
        rawShaderFiles.map((rawShaderFile2) => ResolvableFile.create({ raw: rawShaderFile2, signal: this.signal }))
      );
    }
  }
  const coreInfoMap = {
    "2048": { savestate: true, supportsNoGame: true },
    "3dengine": { corename: "3DEngine" },
    "4do": { corename: "4DO", savestate: true },
    "81": { savestate: true },
    a5200: { savestate: true },
    advanced_tests: { corename: "Advanced Test", supportsNoGame: true },
    ardens: { corename: "Ardens", savestate: true },
    arduous: { corename: "Arduous" },
    atari800: { corename: "Atari800", savestate: true },
    bk: { savestate: true },
    blastem: { corename: "BlastEm", savestate: true },
    bluemsx: { corename: "blueMSX", savestate: true },
    bnes: { corename: "bnes/higan", savestate: true },
    boom3: {},
    boom3_xp: {},
    bsnes: { savestate: true },
    bsnes_cplusplus98: { cheats: true, corename: "bsnes C++98 (v085)", savestate: true },
    bsnes_hd_beta: { corename: "bsnes-hd beta", savestate: true },
    bsnes_mercury_accuracy: { cheats: true, corename: "bsnes-mercury Accuracy", savestate: true },
    bsnes_mercury_balanced: { cheats: true, corename: "bsnes-mercury Balanced", savestate: true },
    bsnes_mercury_performance: { cheats: true, corename: "bsnes-mercury Performance", savestate: true },
    bsnes2014_accuracy: { cheats: true, corename: "bsnes 2014 Accuracy", savestate: true },
    bsnes2014_balanced: { cheats: true, corename: "bsnes 2014 Balanced", savestate: true },
    bsnes2014_performance: { cheats: true, corename: "bsnes 2014 Performance", savestate: true },
    cannonball: { corename: "Cannonball", supportsNoGame: true },
    cap32: { corename: "Caprice32", savestate: true, supportsNoGame: true },
    cdi2015: { corename: "Philips CDi 2015" },
    chailove: { cheats: true, corename: "ChaiLove", savestate: true },
    chimerasnes: { cheats: true, corename: "ChimeraSNES", savestate: true },
    citra: { corename: "Citra", savestate: true },
    citra_canary: { corename: "Citra Canary/Experimental" },
    citra2018: { corename: "Citra 2018" },
    craft: { corename: "Craft", supportsNoGame: true },
    crocods: { corename: "CrocoDS", savestate: true },
    cruzes: { corename: "Cruzes", supportsNoGame: true },
    daphne: { corename: "Daphne" },
    desmume: { cheats: true, corename: "DeSmuME", savestate: true },
    desmume2015: { cheats: true, corename: "DeSmuME 2015", savestate: true },
    dinothawr: { corename: "Dinothawr", supportsNoGame: true },
    directxbox: { corename: "DirectXBox" },
    dirksimple: { corename: "DirkSimple", savestate: true },
    dolphin: { corename: "Dolphin", savestate: true },
    dolphin_launcher: { corename: "Dolphin Launcher", supportsNoGame: true },
    dosbox: { corename: "DOSBox", supportsNoGame: true },
    dosbox_core: { corename: "DOSBox-core", supportsNoGame: true },
    dosbox_pure: { cheats: true, corename: "DOSBox-pure", savestate: true, supportsNoGame: true },
    dosbox_svn: { corename: "DOSBox-SVN", supportsNoGame: true },
    dosbox_svn_ce: { corename: "DOSBox-SVN CE", supportsNoGame: true },
    duckstation: { corename: "DuckStation", savestate: true },
    easyrpg: { corename: "EasyRPG Player" },
    ecwolf: { corename: "ECWolf", savestate: true },
    emuscv: { corename: "EmuSCV", supportsNoGame: true },
    emux_chip8: { corename: "Emux CHIP-8" },
    emux_gb: { corename: "Emux GB" },
    emux_nes: { corename: "Emux NES" },
    emux_sms: { corename: "Emux SMS" },
    ep128emu_core: { cheats: true, corename: "ep128emu-core", savestate: true, supportsNoGame: true },
    fake08: { corename: "FAKE-08", savestate: true },
    fbalpha2012: { corename: "FB Alpha 2012", savestate: true },
    fbalpha2012_cps1: { corename: "FB Alpha 2012 CPS-1", savestate: true },
    fbalpha2012_cps2: { corename: "FB Alpha 2012 CPS-2", savestate: true },
    fbalpha2012_cps3: { corename: "FB Alpha 2012 CPS-3", savestate: true },
    fbalpha2012_neogeo: { corename: "FB Alpha 2012 Neo Geo", savestate: true },
    fbneo: { cheats: true, corename: "FinalBurn Neo", savestate: true },
    fceumm: { cheats: true, corename: "FCEUmm", savestate: true },
    ffmpeg: { corename: "FFmpeg" },
    fixgb: { corename: "fixGB" },
    fixnes: { corename: "fixNES" },
    flycast: { corename: "Flycast", savestate: true },
    flycast_gles2: { corename: "Flycast GLES2", savestate: true },
    fmsx: { corename: "fMSX" },
    freechaf: { corename: "FreeChaF" },
    freeintv: { corename: "FreeIntv" },
    freej2me: { corename: "FreeJ2ME" },
    frodo: { corename: "Frodo" },
    fsuae: { corename: "FS-UAE" },
    fuse: { corename: "Fuse" },
    galaksija: { supportsNoGame: true },
    gambatte: { corename: "Gambatte", savestate: true },
    gearboy: { corename: "Gearboy" },
    gearcoleco: { corename: "Gearcoleco" },
    gearsystem: { corename: "Gearsystem" },
    genesis_plus_gx: { cheats: true, corename: "Genesis Plus GX", savestate: true },
    genesis_plus_gx_wide: { cheats: true, corename: "Genesis Plus GX Wide", savestate: true },
    gme: { corename: "Game Music Emu" },
    gong: { corename: "Gong", savestate: true, supportsNoGame: true },
    gpsp: { corename: "gpSP", savestate: true },
    gw: { corename: "GW" },
    handy: { corename: "Handy", savestate: true },
    hatari: { corename: "Hatari", savestate: true },
    hbmame: { corename: "HBMAME (Git)" },
    higan_sfc: { corename: "nSide (Super Famicom Accuracy)", savestate: true },
    higan_sfc_balanced: { corename: "nSide (Super Famicom Balanced)", savestate: true },
    imageviewer: { corename: "Imageviewer" },
    ishiiruka: { corename: "Ishiiruka", savestate: true },
    jaxe: { corename: "JAXE" },
    jumpnbump: { corename: "jumpnbump" },
    kronos: { cheats: true, corename: "Kronos", savestate: true },
    lowresnx: { corename: "lowresnx" },
    lutro: { corename: "Lutro" },
    mame: { corename: "MAME", savestate: true },
    mame2000: { corename: "MAME 2000 (0.37b5)", savestate: true },
    mame2003: { corename: "MAME 2003 (0.78)", savestate: true },
    mame2003_midway: { corename: "MAME 2003 Midway (0.78)", savestate: true },
    mame2003_plus: { corename: "MAME 2003-Plus", savestate: true },
    mame2009: { corename: "MAME 2009 (0.135u4)" },
    mame2010: { corename: "MAME 2010 (0.139)" },
    mame2015: { corename: "MAME 2015 (0.160)" },
    mame2016: { corename: "MAME 2016 (0.174)" },
    mamearcade: { corename: "MAME (Git)" },
    mamemess: { corename: "MESS (Git)", savestate: true },
    mednafen_gba: { corename: "Beetle GBA" },
    mednafen_lynx: { corename: "Beetle Lynx" },
    mednafen_ngp: { corename: "Beetle NeoPop", savestate: true },
    mednafen_pce: { corename: "Beetle PCE", savestate: true },
    mednafen_pce_fast: { corename: "Beetle PCE Fast", savestate: true },
    mednafen_pcfx: { corename: "Beetle PC-FX" },
    mednafen_psx: { cheats: true, corename: "Beetle PSX", savestate: true },
    mednafen_psx_hw: { cheats: true, corename: "Beetle PSX HW", savestate: true },
    mednafen_saturn: { cheats: true, corename: "Beetle Saturn", savestate: true },
    mednafen_snes: { corename: "Beetle bsnes", savestate: true },
    mednafen_supafaust: { cheats: true, corename: "Beetle Supafaust", savestate: true },
    mednafen_supergrafx: { cheats: true, corename: "Beetle SuperGrafx", savestate: true },
    mednafen_vb: { corename: "Beetle VB" },
    mednafen_wswan: { corename: "Beetle WonderSwan", savestate: true },
    melonds: { corename: "melonDS" },
    mesen: { cheats: true, corename: "Mesen", savestate: true },
    "mesen-s": { corename: "Mesen-S" },
    mess2015: { corename: "MESS 2015 (0.160)" },
    meteor: { corename: "Meteor" },
    mgba: { cheats: true, corename: "mGBA", savestate: true },
    minivmac: { corename: "MinivmacII" },
    mojozork: { corename: "mojozork", savestate: true },
    moonlight: { corename: "Moonlight", supportsNoGame: true },
    mpv: { corename: "MPV" },
    mrboom: { corename: "Mr.Boom", savestate: true, supportsNoGame: true },
    mu: { corename: "Mu", supportsNoGame: true },
    mupen64plus_next: { cheats: true, corename: "Mupen64Plus-Next", savestate: true },
    mupen64plus_next_develop: { cheats: true, corename: "Mupen64Plus-Next", savestate: true },
    mupen64plus_next_gles2: { cheats: true, corename: "Mupen64Plus-Next", savestate: true },
    mupen64plus_next_gles3: { cheats: true, corename: "Mupen64Plus-Next", savestate: true },
    nekop2: { corename: "Neko Project II", savestate: true },
    neocd: { corename: "NeoCD" },
    nes: { savestate: true },
    nestopia: { cheats: true, corename: "Nestopia", savestate: true },
    np2kai: { corename: "Neko Project II Kai", savestate: true },
    numero: { corename: "Numero", savestate: true, supportsNoGame: true },
    nxengine: { corename: "NXEngine", supportsNoGame: true },
    o2em: { corename: "O2EM", savestate: true },
    oberon: { corename: "Oberon" },
    openlara: { corename: "OpenLara" },
    opentyrian: { corename: "OpenTyrian", supportsNoGame: true },
    opera: { corename: "Opera", savestate: true, supportsNoGame: true },
    parallel_n64: { corename: "ParaLLEl N64", savestate: true },
    parallel_n64_debug: { corename: "ParaLLEl (Debug)", savestate: true },
    pascal_pong: { corename: "PascalPong", supportsNoGame: true },
    pcem: { corename: "PCem", supportsNoGame: true },
    pcsx_rearmed: { cheats: true, corename: "PCSX-ReARMed", savestate: true },
    pcsx_rearmed_interpreter: { cheats: true, corename: "PCSX ReARMed [Interpreter]", savestate: true },
    pcsx_rearmed_neon: { cheats: true, corename: "PCSX ReARMed [NEON]", savestate: true },
    pcsx1: { corename: "PCSX1" },
    pcsx2: { corename: "LRPS2", savestate: true },
    picodrive: { cheats: true, corename: "PicoDrive", savestate: true },
    play: { corename: "Play!", savestate: true },
    pocketcdg: { corename: "PocketCDG" },
    pokemini: { corename: "PokeMini", savestate: true },
    potator: { corename: "Potator", savestate: true },
    ppsspp: { corename: "PPSSPP", savestate: true },
    prboom: { cheats: true, corename: "PrBoom", savestate: true },
    prosystem: { corename: "ProSystem", savestate: true },
    puae: { cheats: true, corename: "PUAE", savestate: true, supportsNoGame: true },
    puae2021: { cheats: true, corename: "PUAE 2021", savestate: true, supportsNoGame: true },
    puzzlescript: { corename: "puzzlescript", savestate: true },
    px68k: { corename: "PX68k", supportsNoGame: true },
    quasi88: { cheats: true, corename: "QUASI88", savestate: true, supportsNoGame: true },
    quicknes: { corename: "QuickNES", savestate: true },
    race: { corename: "RACE", savestate: true },
    redbook: { corename: "Redbook" },
    reminiscence: { corename: "REminiscence", savestate: true },
    remotejoy: { corename: "RemoteJoy", supportsNoGame: true },
    retro8: { corename: "Retro8" },
    retrodream: { corename: "RetroDream" },
    rustation: { corename: "Rustation" },
    same_cdi: { corename: "SAME CDi (Git)" },
    sameboy: { corename: "SameBoy" },
    sameduck: { corename: "SameDuck", savestate: true },
    scummvm: { corename: "ScummVM", supportsNoGame: true },
    simcp: { corename: "SimCoupe" },
    smsplus: { corename: "SMS Plus GX" },
    snes9x: { cheats: true, corename: "Snes9x", savestate: true },
    snes9x2002: { cheats: true, corename: "Snes9x 2002", savestate: true },
    snes9x2005: { cheats: true, corename: "Snes9x 2005", savestate: true },
    snes9x2005_plus: { cheats: true, corename: "Snes9x 2005 Plus", savestate: true },
    snes9x2010: { cheats: true, corename: "Snes9x 2010", savestate: true },
    squirreljme: { corename: "SquirrelJME", supportsNoGame: true },
    stella: { corename: "Stella", savestate: true },
    stella2014: { corename: "Stella 2014", savestate: true },
    stonesoup: { corename: "Dungeon Crawl Stone Soup" },
    superbroswar: { corename: "superbroswar" },
    swanstation: { corename: "SwanStation", savestate: true },
    tempgba: { corename: "TempGBA" },
    test: { corename: "Test", supportsNoGame: true },
    test_netplay: { corename: "netplay-test", supportsNoGame: true },
    testaudio_callback: { corename: "TestAudio Callback", supportsNoGame: true },
    testaudio_no_callback: { corename: "TestAudio NoCallback", supportsNoGame: true },
    testaudio_playback_wav: { corename: "TestAudio Playback Wav", supportsNoGame: true },
    testgl: { corename: "TestGL", supportsNoGame: true },
    testgl_compute_shaders: { corename: "TestGL ComputeShaders", supportsNoGame: true },
    testgl_ff: { corename: "TestGL (FF)", supportsNoGame: true },
    testinput_buttontest: { corename: "Button Test", supportsNoGame: true },
    testretroluxury: { corename: "Test RetroLuxury", supportsNoGame: true },
    testsw: { corename: "TestSW", supportsNoGame: true },
    testsw_vram: { corename: "TestSW VRAM", supportsNoGame: true },
    testvulkan: { corename: "TestVulkan", supportsNoGame: true },
    testvulkan_async_compute: { corename: "TestVulkan AsyncCompute", supportsNoGame: true },
    tgbdual: { corename: "TGB Dual", savestate: true },
    theodore: { corename: "theodore", savestate: true, supportsNoGame: true },
    thepowdertoy: { corename: "ThePowderToy", savestate: true, supportsNoGame: true },
    tic80: { cheats: true, corename: "TIC-80", savestate: true },
    tyrquake: { cheats: true, corename: "TyrQuake" },
    uae4arm: { corename: "UAE4ARM", savestate: true },
    ume2015: { corename: "UME 2015 (0.160)" },
    uw8: { corename: "MicroW8", savestate: true },
    uzem: { savestate: true },
    vaporspec: { corename: "VaporSpec", savestate: true },
    vba_next: { corename: "VBA Next", savestate: true },
    vbam: { cheats: true, corename: "VBA-M", savestate: true },
    vecx: { savestate: true },
    vemulator: { corename: "VeMUlator" },
    vice_x128: { cheats: true, corename: "VICE x128", savestate: true, supportsNoGame: true },
    vice_x64: { cheats: true, corename: "VICE x64", savestate: true, supportsNoGame: true },
    vice_x64dtv: { cheats: true, corename: "VICE x64dtv", savestate: true, supportsNoGame: true },
    vice_x64sc: { cheats: true, corename: "VICE x64sc", savestate: true, supportsNoGame: true },
    vice_xcbm2: { cheats: true, corename: "VICE xcbm2", savestate: true, supportsNoGame: true },
    vice_xcbm5x0: { cheats: true, corename: "VICE xcbm5x0", savestate: true, supportsNoGame: true },
    vice_xpet: { cheats: true, corename: "VICE xpet", savestate: true, supportsNoGame: true },
    vice_xplus4: { cheats: true, corename: "VICE xplus4", savestate: true, supportsNoGame: true },
    vice_xscpu64: { cheats: true, corename: "VICE xscpu64", savestate: true, supportsNoGame: true },
    vice_xvic: { cheats: true, corename: "VICE xvic", savestate: true, supportsNoGame: true },
    vircon32: { corename: "Vircon32", supportsNoGame: true },
    virtualjaguar: { corename: "Virtual Jaguar" },
    virtualxt: {},
    vitaquake2: { corename: "vitaQuake 2" },
    "vitaquake2-rogue": { corename: "vitaQuake 2 [Rogue]" },
    "vitaquake2-xatrix": { corename: "vitaQuake 2 [Xatrix]" },
    "vitaquake2-zaero": { corename: "vitaQuake 2 [Zaero]" },
    vitaquake3: { corename: "vitaQuake 3" },
    vitavoyager: { corename: "vitaVoyager" },
    wasm4: { corename: "WASM-4", savestate: true },
    x1: {},
    x64sdl: { corename: "VICE SDL" },
    xrick: { corename: "XRick", supportsNoGame: true },
    yabasanshiro: { cheats: true, corename: "YabaSanshiro", savestate: true },
    yabause: { cheats: true, corename: "Yabause", savestate: true }
  };
  const keyboardCodeMap = {
    add: "NumpadAdd",
    // is this right?
    alt: "AltLeft",
    backquote: "Backquote",
    backslash: "",
    // what's this?
    backspace: "Backspace",
    capslock: "CapsLock",
    comma: "Comma",
    ctrl: "ControlLeft",
    del: "Delete",
    divide: "NumpadDivide",
    down: "ArrowDown",
    end: "End",
    enter: "Enter",
    equals: "Equal",
    escape: "Escape",
    home: "Home",
    insert: "Insert",
    kp_enter: "NumpadEnter",
    kp_equals: "NumpadEquals",
    // is this right?
    kp_minus: "NumpadSubtract",
    kp_period: "NumpadDecimal",
    kp_plus: "NumpadAdd",
    left: "ArrowLeft",
    leftbracket: "BracketLeft",
    // is this right?
    minus: "Minus",
    multiply: "NumpadMultiply",
    numlock: "NumLock",
    pagedown: "PageDown",
    pageup: "PageUp",
    pause: "Pause",
    period: "Period",
    print_screen: "PrintScreen",
    quote: "Quote",
    ralt: "AltRight",
    rctrl: "ControlRight",
    right: "ArrowRight",
    rightbracket: "BracketRight",
    // is this right?
    rshift: "ShiftRight",
    scroll_lock: "ScrollLock",
    semicolon: "Semicolon",
    shift: "ShiftLeft",
    slash: "Slash",
    space: "Space",
    subtract: "NumpadSubtract",
    // is this right?
    tab: "Tab",
    tilde: "",
    // what's this?
    up: "ArrowUp"
  };
  function getEmscriptenModuleOverrides(overrides) {
    let resolveRunDependenciesPromise;
    const runDependenciesPromise = new Promise((resolve) => {
      resolveRunDependenciesPromise = resolve;
    });
    const emscriptenModuleOverrides = {
      noExitRuntime: false,
      noInitialRun: true,
      locateFile(file) {
        return file;
      },
      // the return value of `monitorRunDependencies` seems to be misused here, but it works for now
      async monitorRunDependencies(left) {
        if (left === 0) {
          resolveRunDependenciesPromise();
        }
        return await runDependenciesPromise;
      },
      print(...args) {
        console.info(...args);
      },
      printErr(...args) {
        console.error(...args);
      },
      // @ts-expect-error do not throw error when exit
      quit(status, toThrow) {
        if (status) {
          console.info(status, toThrow);
        }
      },
      ...overrides
    };
    return emscriptenModuleOverrides;
  }
  const { ini: ini$1, path: path$1 } = vendors;
  const userdataDirectory = "/home/web_user/retroarch/userdata";
  const bundleDirectory = "/home/web_user/retroarch/bundle";
  const contentDirectory = path$1.join(userdataDirectory, "content");
  const systemDirectory = path$1.join(userdataDirectory, "system");
  const configDirectory = path$1.join(userdataDirectory, "config");
  const screenshotsDirectory = path$1.join(userdataDirectory, "screenshots");
  const shaderDirectory = path$1.join(bundleDirectory, "shaders", "shaders_glsl");
  const shaderAssetsDirectory = path$1.join(shaderDirectory, "shaders");
  const configPath = path$1.join(userdataDirectory, "retroarch.cfg");
  const coreConfigPath = path$1.join(userdataDirectory, "retroarch-core-options.cfg");
  class EmulatorFileSystem {
    static bundleDirectory = bundleDirectory;
    static configDirectory = configDirectory;
    static configPath = configPath;
    static contentDirectory = contentDirectory;
    static coreConfigPath = coreConfigPath;
    static screenshotsDirectory = screenshotsDirectory;
    static shaderDirectory = shaderDirectory;
    static systemDirectory = systemDirectory;
    static userdataDirectory = userdataDirectory;
    emscriptenModule;
    signal;
    get FS() {
      return this.emscriptenModule.FS;
    }
    constructor({
      emscriptenModule,
      signal
    }) {
      this.emscriptenModule = emscriptenModule;
      this.signal = signal;
    }
    static async create(...args) {
      const emulatorFileSystem = new EmulatorFileSystem(...args);
      await emulatorFileSystem.prepare();
      return emulatorFileSystem;
    }
    mkdirTree(directory) {
      const { FS } = this;
      FS.mkdirTree(directory);
    }
    readFile(path2, encoding = "utf8") {
      const { FS } = this;
      return FS.readFile(path2, { encoding });
    }
    unlink(path2) {
      const { FS } = this;
      try {
        FS.unlink(path2);
      } catch {
      }
    }
    async waitForFile(fileName) {
      const maxRetries = 30;
      let buffer;
      let isFinished = false;
      let retryTimes = 0;
      while (retryTimes <= maxRetries && !isFinished) {
        const delayTime = Math.min(100 * 2 ** retryTimes, 1e3);
        await delay(delayTime);
        checkIsAborted(this.signal);
        try {
          const newBuffer = this.readFile(fileName, "binary").buffer;
          if (buffer) {
            isFinished = buffer.byteLength > 0 && buffer.byteLength === newBuffer.byteLength;
          }
          buffer = newBuffer;
        } catch (error) {
          console.warn(error);
        }
        retryTimes += 1;
      }
      if (!(isFinished && buffer)) {
        throw new Error("fs timeout");
      }
      return buffer;
    }
    async writeFile(filePath, fileContent) {
      const { FS } = this;
      const directory = path$1.dirname(filePath);
      const fileName = path$1.basename(filePath);
      const resolvable = await ResolvableFile.create(fileContent);
      const buffer = await resolvable.getUint8Array();
      FS.createDataFile("/", fileName, buffer, true, false);
      const encoding = "binary";
      const data = this.readFile(fileName, encoding);
      this.mkdirTree(directory);
      FS.writeFile(filePath, data, { encoding });
      this.unlink(fileName);
    }
    async writeIni(path2, config) {
      if (!config) {
        return;
      }
      const clonedConfig = {};
      for (const key in config) {
        clonedConfig[key] = `__${config[key]}__`;
      }
      const fileContent = ini$1.stringify(clonedConfig, { platform: "linux", whitespace: true }).replaceAll("__", '"');
      await this.writeFile(path2, fileContent);
    }
    async prepare() {
      const directories = [configDirectory, contentDirectory, shaderDirectory, shaderAssetsDirectory, systemDirectory];
      for (const directory of directories) {
        this.mkdirTree(directory);
      }
      const maxWaitTime = 100;
      let waitTime = 0;
      while (!this.emscriptenModule.asm && waitTime < maxWaitTime) {
        await delay(10);
        checkIsAborted(this.signal);
        waitTime += 5;
      }
    }
  }
  const { ini, path } = vendors;
  const interactableElements = [
    globalThis.HTMLAnchorElement,
    globalThis.HTMLButtonElement,
    globalThis.HTMLDetailsElement,
    globalThis.HTMLInputElement,
    globalThis.HTMLSelectElement,
    globalThis.HTMLTextAreaElement
  ].filter(Boolean);
  function isInteractable(element) {
    return element && interactableElements.some((clazz) => element instanceof clazz);
  }
  class Emulator {
    canvasInitialSize = { height: 0, width: 0 };
    emscripten;
    eventListeners = {
      beforeLaunch: [],
      onLaunch: []
    };
    fileSystem;
    gameStatus = "initial";
    globalDOMEventListeners = /* @__PURE__ */ new Map();
    messageQueue = [];
    options;
    get coreFullName() {
      const { core } = this.options;
      const coreFullName = coreInfoMap[core.name].corename || core.name;
      if (!coreFullName) {
        throw new Error(`invalid core name: ${core.name}`);
      }
      return coreFullName;
    }
    get fs() {
      if (!this.fileSystem) {
        throw new Error("fileSystem is not ready");
      }
      return this.fileSystem;
    }
    get romBaseName() {
      const {
        rom: [{ baseName }]
      } = this.options;
      return baseName;
    }
    get sramFileDirectory() {
      return path.join(EmulatorFileSystem.userdataDirectory, "saves", this.coreFullName);
    }
    get sramFilePath() {
      return path.join(this.sramFileDirectory, `${this.romBaseName}.srm`);
    }
    get stateFileDirectory() {
      return path.join(EmulatorFileSystem.userdataDirectory, "states", this.coreFullName);
    }
    get stateFilePath() {
      return path.join(this.stateFileDirectory, `${this.romBaseName}.state`);
    }
    get stateThumbnailFilePath() {
      return `${this.stateFilePath}.png`;
    }
    constructor(options) {
      this.options = options;
    }
    callCommand(command) {
      const { Module } = this.getEmscripten();
      Module[command]?.();
    }
    exit(statusCode = 0) {
      const { exit, JSEvents } = this.getEmscripten();
      try {
        exit(statusCode);
      } catch {
      }
      JSEvents.removeAllEventListeners();
      this.removeGlobalDOMEventListeners();
      uninstallSetImmediatePolyfill();
      this.gameStatus = "terminated";
    }
    getEmscripten() {
      if (!this.emscripten) {
        throw new Error("emulator is not ready");
      }
      return this.emscripten;
    }
    getOptions() {
      return this.options;
    }
    getStatus() {
      return this.gameStatus;
    }
    async launch() {
      const { element, respondToGlobalEvents, signal, style, waitForInteraction } = this.options;
      updateStyle(element, style);
      const removeProperty = element.style.removeProperty.bind(element.style);
      element.style.removeProperty = (property) => {
        if (property !== "width" && property !== "height") {
          return removeProperty(property);
        }
        return element.style[property];
      };
      if (!element.isConnected) {
        document.body.append(element);
        signal?.addEventListener("abort", () => {
          element?.remove();
        });
      }
      this.canvasInitialSize = this.getElementSize();
      if (respondToGlobalEvents === false) {
        if (!element.tabIndex || element.tabIndex === -1) {
          element.tabIndex = 0;
        }
        const { activeElement } = document;
        element.focus();
        signal?.addEventListener("abort", () => {
          if (activeElement instanceof HTMLElement) {
            activeElement.focus();
          }
        });
      }
      await this.runEventListeners("beforeLaunch");
      if (waitForInteraction) {
        waitForInteraction({
          done: async () => {
            this.runMain();
            await this.runEventListeners("onLaunch");
          }
        });
      } else {
        this.runMain();
        await this.runEventListeners("onLaunch");
      }
    }
    async loadState(state) {
      this.clearStateFile();
      await this.fs.writeFile(this.stateFilePath, state);
      await this.fs.waitForFile(this.stateFilePath);
      this.sendCommand("LOAD_STATE");
    }
    on(event, callback) {
      this.eventListeners[event].push(callback);
      return this;
    }
    pause() {
      if (this.gameStatus === "running") {
        this.sendCommand("PAUSE_TOGGLE");
      }
      this.gameStatus = "paused";
    }
    async press(button, player = 1, time = 100) {
      const code = this.getKeyboardCode(button, player);
      if (code) {
        await this.keyboardPress(code, time);
      }
    }
    pressDown(button, player = 1) {
      const code = this.getKeyboardCode(button, player);
      if (code) {
        this.keyboardDown(code);
      }
    }
    pressUp(button, player = 1) {
      const code = this.getKeyboardCode(button, player);
      if (code) {
        this.keyboardUp(code);
      }
    }
    resize({ height, width }) {
      const { Module } = this.getEmscripten();
      if (typeof width === "number" && typeof height === "number") {
        Module.setCanvasSize(width, height);
      }
    }
    restart() {
      this.sendCommand("RESET");
      this.resume();
    }
    resume() {
      if (this.gameStatus === "paused") {
        this.sendCommand("PAUSE_TOGGLE");
      }
      this.gameStatus = "running";
    }
    async saveSRAM() {
      this.fs.unlink(this.sramFilePath);
      this.callCommand("_cmd_savefiles");
      const buffer = await this.fs.waitForFile(this.sramFilePath);
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      return blob;
    }
    async saveState() {
      this.clearStateFile();
      this.sendCommand("SAVE_STATE");
      const savestateThumbnailEnable = this.options.retroarchConfig.savestate_thumbnail_enable;
      let stateBuffer;
      let stateThumbnailBuffer;
      if (savestateThumbnailEnable) {
        [stateBuffer, stateThumbnailBuffer] = await Promise.all([
          this.fs.waitForFile(this.stateFilePath),
          this.fs.waitForFile(this.stateThumbnailFilePath)
        ]);
      } else {
        stateBuffer = await this.fs.waitForFile(this.stateFilePath);
      }
      this.clearStateFile();
      const state = new Blob([stateBuffer], { type: "application/octet-stream" });
      const thumbnail = stateThumbnailBuffer ? new Blob([stateThumbnailBuffer], { type: "image/png" }) : void 0;
      return { state, thumbnail };
    }
    async screenshot() {
      this.sendCommand("SCREENSHOT");
      const screenshotFileName = this.guessScreenshotFileName();
      const screenshotPath = path.join(EmulatorFileSystem.screenshotsDirectory, screenshotFileName);
      const buffer = await this.fs.waitForFile(screenshotPath);
      this.fs.unlink(screenshotPath);
      return new Blob([buffer], { type: "image/png" });
    }
    sendCommand(msg) {
      const exportedCommand = {
        LOAD_STATE: "_cmd_load_state",
        PAUSE_TOGGLE: "_cmd_toggle_pause",
        RESET: "_cmd_reset",
        SAVE_STATE: "_cmd_save_state",
        SCREENSHOT: "_cmd_take_screenshot"
      };
      const { Module } = this.getEmscripten();
      if (exportedCommand[msg] && exportedCommand[msg] in Module) {
        this.callCommand(exportedCommand[msg]);
      } else {
        const bytes = textEncoder.encode(`${msg}
`);
        this.messageQueue.push([bytes, 0]);
      }
    }
    async setup() {
      await this.setupEmscripten();
      await this.setupFileSystem();
    }
    clearStateFile() {
      try {
        this.fs.unlink(this.stateFilePath);
        this.fs.unlink(this.stateThumbnailFilePath);
      } catch {
      }
    }
    fireKeyboardEvent(type, code) {
      const { JSEvents } = this.getEmscripten();
      for (const { eventListenerFunc, eventTypeString } of JSEvents.eventHandlers) {
        if (eventTypeString === type) {
          try {
            eventListenerFunc({ code, target: this.options.element });
          } catch {
          }
        }
      }
    }
    getCurrentRetroarchConfig() {
      const configContent = this.fs.readFile(EmulatorFileSystem.configPath);
      return ini.parse(configContent);
    }
    getElementSize() {
      const { element, size } = this.options;
      return !size || size === "auto" ? { height: element.offsetHeight, width: element.offsetWidth } : size;
    }
    getKeyboardCode(button, player = 1) {
      const config = this.getCurrentRetroarchConfig();
      const configName = `input_player${player}_${button}`;
      const key = config[configName];
      if (!key || key === "nul") {
        return;
      }
      const { length } = key;
      if (length === 1) {
        return `Key${key.toUpperCase()}`;
      }
      if (key[0] === "f" && (length === 2 || length === 3)) {
        return key.toUpperCase();
      }
      if (length === 4 && key.startsWith("num")) {
        return `Numpad${key.at(-1)}`;
      }
      if (length === 7 && key.startsWith("keypad")) {
        return `Digit${key.at(-1)}`;
      }
      return keyboardCodeMap[key] || "";
    }
    guessScreenshotFileName() {
      const date = /* @__PURE__ */ new Date();
      const year = date.getFullYear() % 1e3;
      const month = padZero(date.getMonth() + 1);
      const day = padZero(date.getDate());
      const hour = padZero(date.getHours());
      const minute = padZero(date.getMinutes());
      const second = padZero(date.getSeconds());
      const dateString = `${year}${month}${day}-${hour}${minute}${second}`;
      const baseName = this.romBaseName;
      return `${baseName}-${dateString}.png`;
    }
    keyboardDown(code) {
      this.fireKeyboardEvent("keydown", code);
    }
    async keyboardPress(code, time = 100) {
      this.keyboardDown(code);
      await delay(time);
      this.keyboardUp(code);
    }
    keyboardUp(code) {
      this.fireKeyboardEvent("keyup", code);
    }
    postRun() {
      this.resize(this.canvasInitialSize);
      for (const gamepad of navigator.getGamepads?.() ?? []) {
        if (gamepad) {
          globalThis.dispatchEvent(new GamepadEvent("gamepadconnected", { gamepad }));
        }
      }
      this.updateKeyboardEventHandlers();
    }
    recordGlobalDOMEventListeners() {
      for (const eventTarget of [globalThis, document]) {
        eventTarget.addEventListener = (...args) => {
          const [type, listener] = args;
          const value = this.globalDOMEventListeners.get(eventTarget) || {};
          value[type] = listener;
          this.globalDOMEventListeners.set(eventTarget, value);
          return EventTarget.prototype.addEventListener.apply(eventTarget, args);
        };
      }
    }
    removeGlobalDOMEventListeners() {
      for (const [eventTarget, eventListeners] of this.globalDOMEventListeners) {
        for (const eventType in eventListeners) {
          const listener = eventListeners[eventType];
          eventTarget.removeEventListener(eventType, listener);
        }
      }
    }
    async runEventListeners(event) {
      const { [event]: eventListeners } = this.eventListeners;
      for (const eventListener of eventListeners) {
        await eventListener();
      }
    }
    runMain() {
      checkIsAborted(this.options.signal);
      const { Module } = this.getEmscripten();
      const { arguments: raArgs = [] } = Module;
      const { rom, signal } = this.options;
      if (!Module.arguments && rom.length > 0) {
        const [{ name }] = rom;
        raArgs.push(path.join(EmulatorFileSystem.contentDirectory, name));
      }
      raArgs.push("-c", EmulatorFileSystem.configPath);
      installSetImmediatePolyfill();
      this.recordGlobalDOMEventListeners();
      Module.callMain(raArgs);
      for (const [eventTarget] of this.globalDOMEventListeners) {
        delete eventTarget.addEventListener;
      }
      signal?.addEventListener("abort", () => {
        this.exit();
      });
      this.gameStatus = "running";
      this.postRun();
    }
    async setupEmscripten() {
      const { core, element, emscriptenModule } = this.options;
      const { wasm } = core;
      const moduleOptions = { canvas: element, preRun: [], wasmBinary: await wasm.getArrayBuffer(), ...emscriptenModule };
      const initialModule = getEmscriptenModuleOverrides(moduleOptions);
      initialModule.preRun?.push(() => initialModule.FS.init(() => this.stdin()));
      const { getEmscripten } = await importCoreJsAsESM(core);
      checkIsAborted(this.options.signal);
      const emscripten = await getEmscripten({ Module: initialModule });
      checkIsAborted(this.options.signal);
      this.emscripten = emscripten;
      const { Module } = emscripten;
      await Module.monitorRunDependencies();
      checkIsAborted(this.options.signal);
    }
    async setupFileSystem() {
      const { Module } = this.getEmscripten();
      const { bios, rom, signal, sram, state } = this.options;
      for (const { name } of bios) {
        if (!name) {
          throw new Error("file name is required for bios");
        }
      }
      const fileSystem = await EmulatorFileSystem.create({ emscriptenModule: Module, signal });
      this.fileSystem = fileSystem;
      if (state) {
        this.fs.mkdirTree(this.stateFileDirectory);
      }
      if (sram) {
        this.fs.mkdirTree(this.sramFileDirectory);
      }
      const filePromises = [];
      filePromises.push(
        ...rom.map((file) => this.fs.writeFile(path.join(EmulatorFileSystem.contentDirectory, file.name), file)),
        ...bios.map((file) => this.fs.writeFile(path.join(EmulatorFileSystem.systemDirectory, file.name), file))
      );
      if (state) {
        filePromises.push(this.fs.writeFile(`${this.stateFilePath}.auto`, state));
      }
      if (sram) {
        filePromises.push(this.fs.writeFile(this.sramFilePath, sram));
      }
      await Promise.all(filePromises);
      checkIsAborted(signal);
      await this.setupRaConfigFiles();
      checkIsAborted(this.options.signal);
    }
    async setupRaConfigFiles() {
      await this.fs.writeIni(EmulatorFileSystem.configPath, this.options.retroarchConfig);
      await this.fs.writeIni(EmulatorFileSystem.coreConfigPath, this.options.retroarchCoreConfig);
      await this.setupRaShaderFiles();
    }
    async setupRaShaderFiles() {
      const { shader } = this.options;
      if (shader.length === 0) {
        return;
      }
      const glslpFiles = shader.filter((file) => file.name.endsWith(".glslp"));
      if (glslpFiles.length === 0) {
        return;
      }
      for (const { name } of shader) {
        if (!name) {
          throw new Error("file name is required for shader");
        }
      }
      const globalGlslpContent = glslpFiles.map((file) => `#reference "${path.join(EmulatorFileSystem.shaderDirectory, file.name)}"`).join("\n");
      await this.fs.writeFile(path.join(EmulatorFileSystem.configDirectory, "global.glslp"), globalGlslpContent);
      await Promise.all(
        shader.map(async (resolvable) => {
          const directory = resolvable.extension === ".glslp" ? EmulatorFileSystem.shaderDirectory : path.join(EmulatorFileSystem.shaderDirectory, "shaders");
          await this.fs.writeFile(path.join(directory, resolvable.name), resolvable);
        })
      );
    }
    // copied from https://github.com/libretro/RetroArch/pull/15017
    stdin() {
      const { messageQueue } = this;
      while (messageQueue.length > 0) {
        const msg = messageQueue[0][0];
        const index = messageQueue[0][1];
        if (index >= msg.length) {
          messageQueue.shift();
        } else {
          messageQueue[0][1] = index + 1;
          return msg[index];
        }
      }
      return null;
    }
    updateKeyboardEventHandlers() {
      const { JSEvents } = this.getEmscripten();
      const { element, respondToGlobalEvents } = this.options;
      if (!respondToGlobalEvents) {
        if (!element.getAttribute("tabindex")) {
          element.tabIndex = -1;
        }
        element.focus();
        element.addEventListener("click", () => {
          element.focus();
        });
      }
      const keyboardEvents = /* @__PURE__ */ new Set(["keydown", "keypress", "keyup"]);
      const globalKeyboardEventHandlers = JSEvents.eventHandlers.filter(
        ({ eventTypeString, target }) => keyboardEvents.has(eventTypeString) && (target === document || target === element)
      );
      for (const globalKeyboardEventHandler of globalKeyboardEventHandlers) {
        const { eventTypeString, handlerFunc, target } = globalKeyboardEventHandler;
        JSEvents.registerOrRemoveHandler({ eventTypeString, target });
        JSEvents.registerOrRemoveHandler({
          ...globalKeyboardEventHandler,
          handlerFunc: (...args) => {
            const [event] = args;
            const target2 = event?.target;
            const isValidEmulatorInput = respondToGlobalEvents ? !isInteractable(target2) : target2 === element;
            if (isValidEmulatorInput) {
              handlerFunc(...args);
            }
          },
          target: respondToGlobalEvents ? document : element
        });
      }
    }
  }
  class Nostalgist {
    static Nostalgist = Nostalgist;
    static vendors = vendors;
    emulator;
    emulatorOptions;
    options;
    constructor(options) {
      const mergedOptions = {};
      merge(mergedOptions, getGlobalOptions(), options);
      this.options = mergedOptions;
    }
    static clearCache() {
      EmulatorOptions.resetCacheStore();
    }
    /**
     * Update the global options for `Nostalgist`, so everytime the `Nostalgist.launch` method or shortcuts like `Nostalgist.nes` is called, the default options specified here will be used.
     *
     * You may want to specify how to resolve ROMs and RetroArch cores here.
     *
     * @see {@link https://nostalgist.js.org/apis/configure/}
     *
     * @example
     * ```js
     * Nostalgist.configure({
     *   resolveRom({ file }) {
     *     return `https://example.com/roms/${file}`
     *   },
     *   // other configuation can also be specified here
     * })
     * ```
     */
    static configure(options) {
      updateGlobalOptions(options);
    }
    /**
     * A shortcut method for Nostalgist.launch method, with some additional default options for GB emulation.
     *
     * It will use mgba as the default core for emulation.
     *
     * @see {@link https://nostalgist.js.org/apis/gb/}
     */
    static async gb(options) {
      return await Nostalgist.launchSystem("gb", options);
    }
    /**
     * A shortcut method for Nostalgist.launch method, with some additional default options for GBA emulation.
     *
     * It will use mgba as the default core for emulation.
     *
     * @see {@link https://nostalgist.js.org/apis/gba/}
     */
    static async gba(options) {
      return await Nostalgist.launchSystem("gba", options);
    }
    /**
     * A shortcut method for Nostalgist.launch method, with some additional default options for GBC emulation.
     *
     * It will use mgba as the default core for emulation.
     *
     * @see {@link https://nostalgist.js.org/apis/gbc/}
     */
    static async gbc(options) {
      return await Nostalgist.launchSystem("gbc", options);
    }
    /**
     * Launch an emulator and return a `Promise` of the instance of the emulator.
     *
     * @see {@link https://nostalgist.js.org/apis/launch/}
     *
     * @example
     * A simple example:
     * ```js
     * const nostalgist = await Nostalgist.launch({
     *   core: 'fceumm',
     *   rom: 'flappybird.nes',
     * })
     * ```
     *
     * @example
     * A more complex one:
     * ```js
     * const nostalgist = await Nostalgist.launch({
     *   element: document.querySelector('.emulator-canvas'),
     *   core: 'fbneo',
     *   rom: ['mslug.zip'],
     *   bios: ['neogeo.zip'],
     *   retroarchConfig: {
     *     rewind_enable: true,
     *     savestate_thumbnail_enable: true,
     *   }
     *   runEmulatorManually: false,
     *   resolveCoreJs(core) {
     *     return `https://example.com/core/${core}_libretro.js`
     *   },
     *   resolveCoreWasm(core) {
     *     return `https://example.com/core/${core}_libretro.wasm`
     *   },
     *   resolveRom(file) {
     *     return `https://example.com/roms/${file}`
     *   },
     *   resolveBios(bios) {
     *     return `https://example.com/system/${bios}`
     *   },
     * })
     * ```
     */
    static async launch(options) {
      const nostalgist = new Nostalgist(options);
      await nostalgist.load();
      return nostalgist;
    }
    /**
     * A shortcut method for Nostalgist.launch method, with some additional default options for Sega Genesis / Megadrive emulation.
     *
     * It will use genesis_plus_gx as the default core for emulation.
     *
     * @see {@link https://nostalgist.js.org/apis/megadrive/}
     */
    static async megadrive(options) {
      return await Nostalgist.launchSystem("megadrive", options);
    }
    /**
     * A shortcut method for Nostalgist.launch method, with some additional default options for NES emulation.
     *
     * It will use fceumm as the default core for emulation.
     *
     * @see {@link https://nostalgist.js.org/apis/nes/}
     */
    static async nes(options) {
      return await Nostalgist.launchSystem("nes", options);
    }
    static async prepare(options) {
      const nostalgist = new Nostalgist({ ...options, runEmulatorManually: true });
      await nostalgist.load();
      return nostalgist;
    }
    /**
     * Reset the global configuation set by `Nostalgist.configure` to default.
     *
     * @see {@link https://nostalgist.js.org/apis/reset-to-default/}
     */
    static resetToDefault() {
      resetGlobalOptions();
    }
    /**
     * A shortcut method for Nostalgist.launch method, with some additional default options for SNES emulation.
     *
     * It will use snes9x as the default core for emulation.
     *
     * @see {@link https://nostalgist.js.org/apis/snes/}
     */
    static async snes(options) {
      return await Nostalgist.launchSystem("snes", options);
    }
    static async launchSystem(system, options) {
      const optionsResult = await getResult(options);
      const launchOptions = isResolvableFileInput(optionsResult) ? { rom: optionsResult } : optionsResult;
      return await Nostalgist.launch({ ...launchOptions, core: systemCoreMap[system] });
    }
    /**
     * Exit the current running game and the emulator. Remove the canvas element used by the emulator if needed.
     *
     * @see {@link https://nostalgist.js.org/apis/exit/}
     *
     * @example
     * ```js
     * const nostalgist = await Nostalgist.nes('flappybird.nes')
     *
     * nostalgist.exit()
     * ```
     * ```js
     * const nostalgist = await Nostalgist.nes('flappybird.nes')
     *
     * // the canvas element will not be removed
     * nostalgist.exit({ removeCanvas: false })
     * ```
     */
    exit({ removeCanvas = true } = {}) {
      this.getEmulator().exit();
      if (removeCanvas) {
        this.getCanvas().remove();
      }
    }
    /**
     * Get the canvas DOM element that the current emulator is using.
     *
     * @see {@link https://nostalgist.js.org/apis/get-canvas/}
     */
    getCanvas() {
      return this.getEmulatorOptions().element;
    }
    /**
     * Get the Emscripten object exposed by RetroArch.
     *
     * @see {@link https://nostalgist.js.org/apis/get-emscripten-module/}
     */
    getEmscripten() {
      const emulator = this.getEmulator();
      return emulator.getEmscripten();
    }
    /**
     * Get the Emscripten AL object exposed by RetroArch.
     *
     * @see {@link https://nostalgist.js.org/apis/get-emscripten-module/}
     */
    getEmscriptenAL() {
      const emulator = this.getEmulator();
      return emulator.getEmscripten().AL;
    }
    /**
     * Get the Emscripten FS object of the current running emulator.
     *
     * @see {@link https://nostalgist.js.org/apis/get-emscripten-fs/}
     */
    getEmscriptenFS() {
      const emulator = this.getEmulator();
      const emscripten = emulator.getEmscripten();
      return emscripten.Module.FS;
    }
    /**
     * Get the Emscripten Module object of the current running emulator.
     *
     * @see {@link https://nostalgist.js.org/apis/get-emscripten-module/}
     */
    getEmscriptenModule() {
      const emulator = this.getEmulator();
      const emscripten = emulator.getEmscripten();
      return emscripten.Module;
    }
    getEmulator() {
      const { emulator } = this;
      if (!emulator) {
        throw new Error("emulator is not ready");
      }
      return emulator;
    }
    getEmulatorOptions() {
      if (!this.emulatorOptions) {
        throw new Error("emulator options are not ready");
      }
      return this.emulatorOptions;
    }
    getOptions() {
      return this.options;
    }
    /**
       * Get the status of current emulation.
       *
       * @see {@link https://nostalgist.js.org/apis/get-status/}
       *
       * @returns One of 'initial' | 'paused' | 'running' | 'terminated'
       * @example
       * ```js
       * const nostalgist = await Nostalgist.prepare('flappybird.nes')
       * console.log(nostalgist.getStatus()) // 'initial'
    
       * await nostalgist.launch()
       * console.log(nostalgist.getStatus()) // 'running'
    
       * await nostalgist.pause()
       * console.log(nostalgist.getStatus()) // 'paused'
    
       * nostalgist.exit()
       * console.log(nostalgist.getStatus()) // 'terminated'
       * ```
       */
    getStatus() {
      return this.getEmulator().getStatus();
    }
    /**
     * Launch the emulator, if it's not launched, because of the launch option `runEmulatorManually` being set to `true`.
     * @deprecated Use the `start` method instead.
     * @see {@link https://nostalgist.js.org/apis/launch-emulator/}
     */
    async launchEmulator() {
      return await this.start();
    }
    /**
     * Load a state for the current running emulator and game.
     *
     * @see {@link https://nostalgist.js.org/apis/load-state/}
     *
     * @example
     * ```js
     * const nostalgist = await Nostalgist.nes('flappybird.nes')
     *
     * // save the state
     * const { state } = await nostalgist.saveState()
     *
     * // load the state
     * await nostalgist.loadState(state)
     * ```
     */
    async loadState(state) {
      const resolvable = await ResolvableFile.create(state);
      await this.getEmulator().loadState(resolvable);
    }
    /**
     * Pause the current running game.
     *
     * @see {@link https://nostalgist.js.org/apis/pause/}
     *
     * @example
     * ```js
     * const nostalgist = await Nostalgist.nes('flappybird.nes')
     *
     * nostalgist.pause()
     * ```
     */
    pause() {
      this.getEmulator().pause();
    }
    /**
     * Press a button and then release it programmatically. Analog Joysticks are not supported by now.
     *
     * @see {@link https://nostalgist.js.org/apis/press/}
     *
     * @example
     * ```js
     * const nostalgist = await Nostalgist.nes('flappybird.nes')
     *
     * await nostalgist.press('start')
     * ```
     */
    async press(options) {
      const emulator = this.getEmulator();
      await (typeof options === "string" ? emulator.press(options) : emulator.press(options.button, options.player, options.time));
    }
    /**
     * Press a button programmatically. Analog Joysticks are not supported by now.
     *
     * @see {@link https://nostalgist.js.org/apis/press-down/}
     *
     * @example
     * ```js
     * const nostalgist = await Nostalgist.nes('flappybird.nes')
     *
     * nostalgist.pressDown('start')
     * ```
     */
    pressDown(options) {
      const emulator = this.getEmulator();
      if (typeof options === "string") {
        return emulator.pressDown(options);
      }
      return emulator.pressDown(options.button, options.player);
    }
    /**
     * Release it programmatically. Analog Joysticks are not supported by now.
     *
     * @see {@link https://nostalgist.js.org/apis/press-up/}
     *
     * @example
     * ```js
     * const nostalgist = await Nostalgist.nes('flappybird.nes')
     *
     * nostalgist.pressUp('start')
     * ```
     */
    pressUp(options) {
      const emulator = this.getEmulator();
      if (typeof options === "string") {
        return emulator.pressUp(options);
      }
      return emulator.pressUp(options.button, options.player);
    }
    /**
     * Resize the canvas element of the emulator.
     *
     * @see {@link https://nostalgist.js.org/apis/resize/}
     *
     * @example
     * ```js
     * const nostalgist = await Nostalgist.nes('flappybird.nes')
     *
     * nostalgist.resize({ width: 1000, height: 800 })
     * ```
     */
    resize(size) {
      return this.getEmulator().resize(size);
    }
    /**
     * Restart the current running game.
     *
     * @see {@link https://nostalgist.js.org/apis/restart/}
     *
     * @example
     * ```js
     * const nostalgist = await Nostalgist.nes('flappybird.nes')
     *
     * nostalgist.restart()
     * ```
     */
    restart() {
      this.getEmulator().restart();
    }
    /**
     * Resume the current running game, if it has been paused by `pause`.
     *
     * @see {@link https://nostalgist.js.org/apis/resume/}
     *
     * @example
     * ```js
     * const nostalgist = await Nostalgist.nes('flappybird.nes')
     *
     * nostalgist.pause()
     * await new Promise(resolve => setTimeout(resolve, 1000))
     * nostalgist.resume()
     * ```
     */
    resume() {
      this.getEmulator().resume();
    }
    /**
     * Save the SRAM of the current running game.
     *
     * @see {@link https://nostalgist.js.org/apis/save-sram/}
     *
     * @example
     * ```js
     * const nostalgist = await Nostalgist.nes('flappybird.nes')
     *
     * const sram = await nostalgist.saveSRAM()
     * ```
     */
    async saveSRAM() {
      const emulator = this.getEmulator();
      return await emulator.saveSRAM();
    }
    /**
     * Save the state of the current running game.
     *
     * @see {@link https://nostalgist.js.org/apis/save-state/}
     *
     * @example
     * ```js
     * const nostalgist = await Nostalgist.nes('flappybird.nes')
     *
     * // save the state
     * const { state } = await nostalgist.saveState()
     *
     * // load the state
     * await nostalgist.loadState(state)
     * ```
     * @returns
     * A Promise of the state of the current running game.
     *
     * Its type is like `Promise<{ state: Blob, thumbnail: Blob | undefined }>`.
     *
     * If RetroArch is launched with the option `savestate_thumbnail_enable` set to `true`, which is the default value inside Nostalgist.js, then the `thumbnail` will be a `Blob`. Otherwise the `thumbnail` will be `undefined`.
     */
    async saveState() {
      return await this.getEmulator().saveState();
    }
    /**
     * Take a screenshot for the current running game.
     *
     * @see {@link https://nostalgist.js.org/apis/screenshot/}
     *
     * @example
     * ```js
     * const nostalgist = await Nostalgist.nes('flappybird.nes')
     *
     * const blob = await nostalgist.screenshot()
     * ```
     */
    async screenshot() {
      const emulator = this.getEmulator();
      return await emulator.screenshot();
    }
    /**
     * Send a command to RetroArch.
     * The commands are listed here: https://docs.libretro.com/development/retroarch/network-control-interface/#commands .
     * But not all of them are supported inside a browser.
     *
     * @see {@link https://nostalgist.js.org/apis/send-command/}
     *
     * @example
     * ```js
     * const nostalgist = await Nostalgist.nes('flappybird.nes')
     *
     * nostalgist.sendCommand('FAST_FORWARD')
     * ```
     */
    sendCommand(command) {
      const emulator = this.getEmulator();
      return emulator.sendCommand(command);
    }
    /**
     * Start the emulator if it's not started because of the instance is returned by `Nostalgist.prepare` rather than `Nostalgist.launch`, or the option `runEmulatorManually` for `Nostalgist.launch` being set to `true`.
     *
     * @see {@link https://nostalgist.js.org/apis/start/}
     */
    async start() {
      return await this.getEmulator().launch();
    }
    /**
     * Load options and then launch corresponding emulator if should
     */
    async load() {
      this.emulatorOptions = await EmulatorOptions.create(this.options);
      checkIsAborted(this.options.signal);
      if (this.options.setupEmulatorManually) {
        return;
      }
      await this.setupEmulator();
      if (this.options.runEmulatorManually) {
        return;
      }
      await this.start();
    }
    async setupEmulator() {
      const emulatorOptions = this.getEmulatorOptions();
      this.emulator = new Emulator(emulatorOptions);
      this.emulator.on("onLaunch", () => this.options.onLaunch?.(this)).on("beforeLaunch", () => this.options.beforeLaunch?.(this));
      await this.emulator.setup();
    }
  }
  return Nostalgist;
}));
