'use strict';

function Dialog(dialogEl, overlayEl) {

	this.dialogEl = dialogEl;
	this.overlayEl = overlayEl;
	this.focusedElBeforeOpen;

	var focusableEls = this.dialogEl.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]');
	this.focusableEls = Array.prototype.slice.call(focusableEls);

	this.firstFocusableEl = this.focusableEls[0];
	this.lastFocusableEl = this.focusableEls[this.focusableEls.length - 1];

	this.close();
}

Dialog.prototype.open = function () {

	var Dialog = this;

	this.dialogEl.removeAttribute('aria-hidden');
	this.overlayEl.removeAttribute('aria-hidden');

	this.focusedElBeforeOpen = document.activeElement;

	this.dialogEl.addEventListener('keydown', function (e) {
		Dialog._handleKeyDown(e);
	});

	this.overlayEl.addEventListener('click', function () {
		Dialog.close();
	});

	this.firstFocusableEl.focus();
};

Dialog.prototype.close = function () {

	this.dialogEl.setAttribute('aria-hidden', true);
	this.overlayEl.setAttribute('aria-hidden', true);

	if (this.focusedElBeforeOpen) {
		this.focusedElBeforeOpen.focus();
	}
};

Dialog.prototype._handleKeyDown = function (e) {

	var Dialog = this;
	var KEY_TAB = 9;
	var KEY_ESC = 27;

	function handleBackwardTab() {
		if (document.activeElement === Dialog.firstFocusableEl) {
			e.preventDefault();
			Dialog.lastFocusableEl.focus();
		}
	}
	function handleForwardTab() {
		if (document.activeElement === Dialog.lastFocusableEl) {
			e.preventDefault();
			Dialog.firstFocusableEl.focus();
		}
	}

	switch (e.keyCode) {
		case KEY_TAB:
			if (Dialog.focusableEls.length === 1) {
				e.preventDefault();
				break;
			}
			if (e.shiftKey) {
				handleBackwardTab();
			} else {
				handleForwardTab();
			}
			break;
		case KEY_ESC:
			Dialog.close();
			break;
		default:
			break;
	}
};

Dialog.prototype.addEventListeners = function (openDialogSel, closeDialogSel) {

	var Dialog = this;

	var openDialogEls = document.querySelectorAll(openDialogSel);
	for (var i = 0; i < openDialogEls.length; i++) {
		openDialogEls[i].addEventListener('click', function () {
			Dialog.open();
		});
	}

	var closeDialogEls = document.querySelectorAll(closeDialogSel);
	for (var i = 0; i < closeDialogEls.length; i++) {
		closeDialogEls[i].addEventListener('click', function () {
			Dialog.close();
		});
	}
};
'use strict';

(function (self) {
  'use strict';

  if (self.fetch) {
    return;
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && function () {
      try {
        new Blob();
        return true;
      } catch (e) {
        return false;
      }
    }(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name');
    }
    return name.toLowerCase();
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value;
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function next() {
        var value = items.shift();
        return { done: value === undefined, value: value };
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function () {
        return iterator;
      };
    }

    return iterator;
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function (value, name) {
        this.append(name, value);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function (name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function (name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var list = this.map[name];
    if (!list) {
      list = [];
      this.map[name] = list;
    }
    list.push(value);
  };

  Headers.prototype['delete'] = function (name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function (name) {
    var values = this.map[normalizeName(name)];
    return values ? values[0] : null;
  };

  Headers.prototype.getAll = function (name) {
    return this.map[normalizeName(name)] || [];
  };

  Headers.prototype.has = function (name) {
    return this.map.hasOwnProperty(normalizeName(name));
  };

  Headers.prototype.set = function (name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)];
  };

  Headers.prototype.forEach = function (callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function (name) {
      this.map[name].forEach(function (value) {
        callback.call(thisArg, value, name, this);
      }, this);
    }, this);
  };

  Headers.prototype.keys = function () {
    var items = [];
    this.forEach(function (value, name) {
      items.push(name);
    });
    return iteratorFor(items);
  };

  Headers.prototype.values = function () {
    var items = [];
    this.forEach(function (value) {
      items.push(value);
    });
    return iteratorFor(items);
  };

  Headers.prototype.entries = function () {
    var items = [];
    this.forEach(function (value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items);
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'));
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function (resolve, reject) {
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(reader.error);
      };
    });
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    return fileReaderReady(reader);
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    reader.readAsText(blob);
    return fileReaderReady(reader);
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function (body) {
      this._bodyInit = body;
      if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (!body) {
        this._bodyText = '';
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type');
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function () {
        var rejected = consumed(this);
        if (rejected) {
          return rejected;
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob);
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob');
        } else {
          return Promise.resolve(new Blob([this._bodyText]));
        }
      };

      this.arrayBuffer = function () {
        return this.blob().then(readBlobAsArrayBuffer);
      };

      this.text = function () {
        var rejected = consumed(this);
        if (rejected) {
          return rejected;
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob);
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text');
        } else {
          return Promise.resolve(this._bodyText);
        }
      };
    } else {
      this.text = function () {
        var rejected = consumed(this);
        return rejected ? rejected : Promise.resolve(this._bodyText);
      };
    }

    if (support.formData) {
      this.formData = function () {
        return this.text().then(decode);
      };
    }

    this.json = function () {
      return this.text().then(JSON.parse);
    };

    return this;
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method;
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read');
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      if (!body) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = input;
    }

    this.credentials = options.credentials || this.credentials || 'omit';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests');
    }
    this._initBody(body);
  }

  Request.prototype.clone = function () {
    return new Request(this);
  };

  function decode(body) {
    var form = new FormData();
    body.trim().split('&').forEach(function (bytes) {
      if (bytes) {
        var split = bytes.split('=');
        var name = split.shift().replace(/\+/g, ' ');
        var value = split.join('=').replace(/\+/g, ' ');
        form.append(decodeURIComponent(name), decodeURIComponent(value));
      }
    });
    return form;
  }

  function headers(xhr) {
    var head = new Headers();
    var pairs = (xhr.getAllResponseHeaders() || '').trim().split('\n');
    pairs.forEach(function (header) {
      var split = header.trim().split(':');
      var key = split.shift().trim();
      var value = split.join(':').trim();
      head.append(key, value);
    });
    return head;
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = options.statusText;
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function () {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    });
  };

  Response.error = function () {
    var response = new Response(null, { status: 0, statusText: '' });
    response.type = 'error';
    return response;
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function (url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code');
    }

    return new Response(null, { status: status, headers: { location: url } });
  };

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function (input, init) {
    return new Promise(function (resolve, reject) {
      var request;
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input;
      } else {
        request = new Request(input, init);
      }

      var xhr = new XMLHttpRequest();

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL;
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL');
        }

        return;
      }

      xhr.onload = function () {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        };
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function () {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function () {
        reject(new TypeError('Network request failed'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function (value, name) {
        xhr.setRequestHeader(name, value);
      });

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    });
  };
  self.fetch.polyfill = true;
})(typeof self !== 'undefined' ? self : undefined);
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/*!

 handlebars v2.0.0-beta.1

Copyright (C) 2011-2014 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@license
*/
!function (a, b) {
  "function" == typeof define && define.amd ? define([], b) : "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) ? module.exports = b() : a.Handlebars = a.Handlebars || b();
}(undefined, function () {
  var a = function () {
    "use strict";
    function a(a) {
      this.string = a;
    }var b;return a.prototype.toString = function () {
      return "" + this.string;
    }, b = a;
  }(),
      b = function (a) {
    "use strict";
    function b(a) {
      return i[a];
    }function c(a) {
      for (var b = 1; b < arguments.length; b++) {
        for (var c in arguments[b]) {
          Object.prototype.hasOwnProperty.call(arguments[b], c) && (a[c] = arguments[b][c]);
        }
      }return a;
    }function d(a) {
      return a instanceof h ? a.toString() : null == a ? "" : a ? (a = "" + a, k.test(a) ? a.replace(j, b) : a) : a + "";
    }function e(a) {
      return a || 0 === a ? n(a) && 0 === a.length ? !0 : !1 : !0;
    }function f(a, b) {
      return (a ? a + "." : "") + b;
    }var g = {},
        h = a,
        i = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "`": "&#x60;" },
        j = /[&<>"'`]/g,
        k = /[&<>"'`]/;g.extend = c;var l = Object.prototype.toString;g.toString = l;var m = function m(a) {
      return "function" == typeof a;
    };m(/x/) && (m = function m(a) {
      return "function" == typeof a && "[object Function]" === l.call(a);
    });var m;g.isFunction = m;var n = Array.isArray || function (a) {
      return a && "object" == (typeof a === "undefined" ? "undefined" : _typeof(a)) ? "[object Array]" === l.call(a) : !1;
    };return g.isArray = n, g.escapeExpression = d, g.isEmpty = e, g.appendContextPath = f, g;
  }(a),
      c = function () {
    "use strict";
    function a(a, b) {
      var d;b && b.firstLine && (d = b.firstLine, a += " - " + d + ":" + b.firstColumn);for (var e = Error.prototype.constructor.call(this, a), f = 0; f < c.length; f++) {
        this[c[f]] = e[c[f]];
      }d && (this.lineNumber = d, this.column = b.firstColumn);
    }var b,
        c = ["description", "fileName", "lineNumber", "message", "name", "number", "stack"];return a.prototype = new Error(), b = a;
  }(),
      d = function (a, b) {
    "use strict";
    function c(a, b) {
      this.helpers = a || {}, this.partials = b || {}, d(this);
    }function d(a) {
      a.registerHelper("helperMissing", function () {
        if (1 === arguments.length) return void 0;throw new g("Missing helper: '" + arguments[arguments.length - 1].name + "'");
      }), a.registerHelper("blockHelperMissing", function (b, c) {
        var d = c.inverse,
            e = c.fn;if (b === !0) return e(this);if (b === !1 || null == b) return d(this);if (k(b)) return b.length > 0 ? (c.ids && (c.ids = [c.name]), a.helpers.each(b, c)) : d(this);if (c.data && c.ids) {
          var g = q(c.data);g.contextPath = f.appendContextPath(c.data.contextPath, c.name), c = { data: g };
        }return e(b, c);
      }), a.registerHelper("each", function (a, b) {
        if (!b) throw new g("Must pass iterator to #each");var c,
            d,
            e = b.fn,
            h = b.inverse,
            i = 0,
            j = "";if (b.data && b.ids && (d = f.appendContextPath(b.data.contextPath, b.ids[0]) + "."), l(a) && (a = a.call(this)), b.data && (c = q(b.data)), a && "object" == (typeof a === "undefined" ? "undefined" : _typeof(a))) if (k(a)) for (var m = a.length; m > i; i++) {
          c && (c.index = i, c.first = 0 === i, c.last = i === a.length - 1, d && (c.contextPath = d + i)), j += e(a[i], { data: c });
        } else for (var n in a) {
          a.hasOwnProperty(n) && (c && (c.key = n, c.index = i, c.first = 0 === i, d && (c.contextPath = d + n)), j += e(a[n], { data: c }), i++);
        }return 0 === i && (j = h(this)), j;
      }), a.registerHelper("if", function (a, b) {
        return l(a) && (a = a.call(this)), !b.hash.includeZero && !a || f.isEmpty(a) ? b.inverse(this) : b.fn(this);
      }), a.registerHelper("unless", function (b, c) {
        return a.helpers["if"].call(this, b, { fn: c.inverse, inverse: c.fn, hash: c.hash });
      }), a.registerHelper("with", function (a, b) {
        l(a) && (a = a.call(this));var c = b.fn;if (f.isEmpty(a)) return b.inverse(this);if (b.data && b.ids) {
          var d = q(b.data);d.contextPath = f.appendContextPath(b.data.contextPath, b.ids[0]), b = { data: d };
        }return c(a, b);
      }), a.registerHelper("log", function (b, c) {
        var d = c.data && null != c.data.level ? parseInt(c.data.level, 10) : 1;a.log(d, b);
      }), a.registerHelper("lookup", function (a, b) {
        return a && a[b];
      });
    }var e = {},
        f = a,
        g = b,
        h = "2.0.0-beta.1";e.VERSION = h;var i = 6;e.COMPILER_REVISION = i;var j = { 1: "<= 1.0.rc.2", 2: "== 1.0.0-rc.3", 3: "== 1.0.0-rc.4", 4: "== 1.x.x", 5: "== 2.0.0-alpha.x", 6: ">= 2.0.0-beta.1" };e.REVISION_CHANGES = j;var k = f.isArray,
        l = f.isFunction,
        m = f.toString,
        n = "[object Object]";e.HandlebarsEnvironment = c, c.prototype = { constructor: c, logger: o, log: p, registerHelper: function registerHelper(a, b) {
        if (m.call(a) === n) {
          if (b) throw new g("Arg not supported with multiple helpers");f.extend(this.helpers, a);
        } else this.helpers[a] = b;
      }, unregisterHelper: function unregisterHelper(a) {
        delete this.helpers[a];
      }, registerPartial: function registerPartial(a, b) {
        m.call(a) === n ? f.extend(this.partials, a) : this.partials[a] = b;
      }, unregisterPartial: function unregisterPartial(a) {
        delete this.partials[a];
      } };var o = { methodMap: { 0: "debug", 1: "info", 2: "warn", 3: "error" }, DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3, log: function log(a, b) {
        if (o.level <= a) {
          var c = o.methodMap[a];"undefined" != typeof console && console[c] && console[c].call(console, b);
        }
      } };e.logger = o;var p = o.log;e.log = p;var q = function q(a) {
      var b = f.extend({}, a);return b._parent = a, b;
    };return e.createFrame = q, e;
  }(b, c),
      e = function (a, b, c) {
    "use strict";
    function d(a) {
      var b = a && a[0] || 1,
          c = m;if (b !== c) {
        if (c > b) {
          var d = n[c],
              e = n[b];throw new l("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version (" + d + ") or downgrade your runtime to an older version (" + e + ").");
        }throw new l("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version (" + a[1] + ").");
      }
    }function e(a, b) {
      if (!b) throw new l("No environment passed to template");if (!a || !a.main) throw new l("Unknown template object: " + (typeof a === "undefined" ? "undefined" : _typeof(a)));b.VM.checkRevision(a.compiler);var c = function c(_c, d, e, f, g, h, i, j, m) {
        g && (f = k.extend({}, f, g));var n = b.VM.invokePartial.call(this, _c, e, f, h, i, j, m);if (null == n && b.compile) {
          var o = { helpers: h, partials: i, data: j, depths: m };i[e] = b.compile(_c, { data: void 0 !== j, compat: a.compat }, b), n = i[e](f, o);
        }if (null != n) {
          if (d) {
            for (var p = n.split("\n"), q = 0, r = p.length; r > q && (p[q] || q + 1 !== r); q++) {
              p[q] = d + p[q];
            }n = p.join("\n");
          }return n;
        }throw new l("The partial " + e + " could not be compiled when running in runtime-only mode");
      },
          d = { lookup: function lookup(a, b) {
          for (var c = a.length, d = 0; c > d; d++) {
            if (a[d] && null != a[d][b]) return a[d][b];
          }
        }, lambda: function lambda(a, b) {
          return "function" == typeof a ? a.call(b) : a;
        }, escapeExpression: k.escapeExpression, invokePartial: c, fn: function fn(b) {
          return a[b];
        }, programs: [], program: function program(a, b, c) {
          var d = this.programs[a],
              e = this.fn(a);return b || c ? d = f(this, a, e, b, c) : d || (d = this.programs[a] = f(this, a, e)), d;
        }, data: function data(a, b) {
          for (; a && b--;) {
            a = a._parent;
          }return a;
        }, merge: function merge(a, b) {
          var c = a || b;return a && b && a !== b && (c = k.extend({}, b, a)), c;
        }, noop: b.VM.noop, compilerInfo: a.compiler },
          e = function e(b, c) {
        c = c || {};var f = c.data;e._setup(c), !c.partial && a.useData && (f = i(b, f));var g;return a.useDepths && (g = c.depths ? [b].concat(c.depths) : [b]), a.main.call(d, b, d.helpers, d.partials, f, g);
      };return e.isTop = !0, e._setup = function (c) {
        c.partial ? (d.helpers = c.helpers, d.partials = c.partials) : (d.helpers = d.merge(c.helpers, b.helpers), a.usePartial && (d.partials = d.merge(c.partials, b.partials)));
      }, e._child = function (b, c, e) {
        if (a.useDepths && !e) throw new l("must pass parent depths");return f(d, b, a[b], c, e);
      }, e;
    }function f(a, b, c, d, e) {
      var f = function f(b, _f) {
        return _f = _f || {}, c.call(a, b, a.helpers, a.partials, _f.data || d, e && [b].concat(e));
      };return f.program = b, f.depth = e ? e.length : 0, f;
    }function g(a, b, c, d, e, f, g) {
      var h = { partial: !0, helpers: d, partials: e, data: f, depths: g };if (void 0 === a) throw new l("The partial " + b + " could not be found");return a instanceof Function ? a(c, h) : void 0;
    }function h() {
      return "";
    }function i(a, b) {
      return b && "root" in b || (b = b ? o(b) : {}, b.root = a), b;
    }var j = {},
        k = a,
        l = b,
        m = c.COMPILER_REVISION,
        n = c.REVISION_CHANGES,
        o = c.createFrame;return j.checkRevision = d, j.template = e, j.program = f, j.invokePartial = g, j.noop = h, j;
  }(b, c, d),
      f = function (a, b, c, d, e) {
    "use strict";
    var f,
        g = a,
        h = b,
        i = c,
        j = d,
        k = e,
        l = function l() {
      var a = new g.HandlebarsEnvironment();return j.extend(a, g), a.SafeString = h, a.Exception = i, a.Utils = j, a.escapeExpression = j.escapeExpression, a.VM = k, a.template = function (b) {
        return k.template(b, a);
      }, a;
    },
        m = l();return m.create = l, m["default"] = m, f = m;
  }(d, a, c, b, e),
      g = function (a) {
    "use strict";
    function b(a) {
      a = a || {}, this.firstLine = a.first_line, this.firstColumn = a.first_column, this.lastColumn = a.last_column, this.lastLine = a.last_line;
    }var c,
        d = a,
        e = { ProgramNode: function ProgramNode(a, c, d) {
        b.call(this, d), this.type = "program", this.statements = a, this.strip = c;
      }, MustacheNode: function MustacheNode(a, c, d, f, g) {
        if (b.call(this, g), this.type = "mustache", this.strip = f, null != d && d.charAt) {
          var h = d.charAt(3) || d.charAt(2);this.escaped = "{" !== h && "&" !== h;
        } else this.escaped = !!d;this.sexpr = a instanceof e.SexprNode ? a : new e.SexprNode(a, c), this.id = this.sexpr.id, this.params = this.sexpr.params, this.hash = this.sexpr.hash, this.eligibleHelper = this.sexpr.eligibleHelper, this.isHelper = this.sexpr.isHelper;
      }, SexprNode: function SexprNode(a, c, d) {
        b.call(this, d), this.type = "sexpr", this.hash = c;var e = this.id = a[0],
            f = this.params = a.slice(1);this.isHelper = !(!f.length && !c), this.eligibleHelper = this.isHelper || e.isSimple;
      }, PartialNode: function PartialNode(a, c, d, e, f) {
        b.call(this, f), this.type = "partial", this.partialName = a, this.context = c, this.hash = d, this.strip = e, this.strip.inlineStandalone = !0;
      }, BlockNode: function BlockNode(a, c, d, e, f) {
        b.call(this, f), this.type = "block", this.mustache = a, this.program = c, this.inverse = d, this.strip = e, d && !c && (this.isInverse = !0);
      }, RawBlockNode: function RawBlockNode(a, c, f, g) {
        if (b.call(this, g), a.sexpr.id.original !== f) throw new d(a.sexpr.id.original + " doesn't match " + f, this);c = new e.ContentNode(c, g), this.type = "block", this.mustache = a, this.program = new e.ProgramNode([c], {}, g);
      }, ContentNode: function ContentNode(a, c) {
        b.call(this, c), this.type = "content", this.original = this.string = a;
      }, HashNode: function HashNode(a, c) {
        b.call(this, c), this.type = "hash", this.pairs = a;
      }, IdNode: function IdNode(a, c) {
        b.call(this, c), this.type = "ID";for (var e = "", f = [], g = 0, h = "", i = 0, j = a.length; j > i; i++) {
          var k = a[i].part;if (e += (a[i].separator || "") + k, ".." === k || "." === k || "this" === k) {
            if (f.length > 0) throw new d("Invalid path: " + e, this);".." === k ? (g++, h += "../") : this.isScoped = !0;
          } else f.push(k);
        }this.original = e, this.parts = f, this.string = f.join("."), this.depth = g, this.idName = h + this.string, this.isSimple = 1 === a.length && !this.isScoped && 0 === g, this.stringModeValue = this.string;
      }, PartialNameNode: function PartialNameNode(a, c) {
        b.call(this, c), this.type = "PARTIAL_NAME", this.name = a.original;
      }, DataNode: function DataNode(a, c) {
        b.call(this, c), this.type = "DATA", this.id = a, this.stringModeValue = a.stringModeValue, this.idName = "@" + a.stringModeValue;
      }, StringNode: function StringNode(a, c) {
        b.call(this, c), this.type = "STRING", this.original = this.string = this.stringModeValue = a;
      }, NumberNode: function NumberNode(a, c) {
        b.call(this, c), this.type = "NUMBER", this.original = this.number = a, this.stringModeValue = Number(a);
      }, BooleanNode: function BooleanNode(a, c) {
        b.call(this, c), this.type = "BOOLEAN", this.bool = a, this.stringModeValue = "true" === a;
      }, CommentNode: function CommentNode(a, c) {
        b.call(this, c), this.type = "comment", this.comment = a, this.strip = { inlineStandalone: !0 };
      } };return c = e;
  }(c),
      h = function () {
    "use strict";
    var a,
        b = function () {
      function a() {
        this.yy = {};
      }var b = { trace: function trace() {}, yy: {}, symbols_: { error: 2, root: 3, program: 4, EOF: 5, program_repetition0: 6, statement: 7, mustache: 8, block: 9, rawBlock: 10, partial: 11, CONTENT: 12, COMMENT: 13, openRawBlock: 14, END_RAW_BLOCK: 15, OPEN_RAW_BLOCK: 16, sexpr: 17, CLOSE_RAW_BLOCK: 18, openBlock: 19, block_option0: 20, closeBlock: 21, openInverse: 22, block_option1: 23, OPEN_BLOCK: 24, CLOSE: 25, OPEN_INVERSE: 26, inverseAndProgram: 27, INVERSE: 28, OPEN_ENDBLOCK: 29, path: 30, OPEN: 31, OPEN_UNESCAPED: 32, CLOSE_UNESCAPED: 33, OPEN_PARTIAL: 34, partialName: 35, param: 36, partial_option0: 37, partial_option1: 38, sexpr_repetition0: 39, sexpr_option0: 40, dataName: 41, STRING: 42, NUMBER: 43, BOOLEAN: 44, OPEN_SEXPR: 45, CLOSE_SEXPR: 46, hash: 47, hash_repetition_plus0: 48, hashSegment: 49, ID: 50, EQUALS: 51, DATA: 52, pathSegments: 53, SEP: 54, $accept: 0, $end: 1 }, terminals_: { 2: "error", 5: "EOF", 12: "CONTENT", 13: "COMMENT", 15: "END_RAW_BLOCK", 16: "OPEN_RAW_BLOCK", 18: "CLOSE_RAW_BLOCK", 24: "OPEN_BLOCK", 25: "CLOSE", 26: "OPEN_INVERSE", 28: "INVERSE", 29: "OPEN_ENDBLOCK", 31: "OPEN", 32: "OPEN_UNESCAPED", 33: "CLOSE_UNESCAPED", 34: "OPEN_PARTIAL", 42: "STRING", 43: "NUMBER", 44: "BOOLEAN", 45: "OPEN_SEXPR", 46: "CLOSE_SEXPR", 50: "ID", 51: "EQUALS", 52: "DATA", 54: "SEP" }, productions_: [0, [3, 2], [4, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [10, 3], [14, 3], [9, 4], [9, 4], [19, 3], [22, 3], [27, 2], [21, 3], [8, 3], [8, 3], [11, 5], [11, 4], [17, 3], [17, 1], [36, 1], [36, 1], [36, 1], [36, 1], [36, 1], [36, 3], [47, 1], [49, 3], [35, 1], [35, 1], [35, 1], [41, 2], [30, 1], [53, 3], [53, 1], [6, 0], [6, 2], [20, 0], [20, 1], [23, 0], [23, 1], [37, 0], [37, 1], [38, 0], [38, 1], [39, 0], [39, 2], [40, 0], [40, 1], [48, 1], [48, 2]], performAction: function performAction(a, b, c, d, e, f) {
          var g = f.length - 1;switch (e) {case 1:
              return d.prepareProgram(f[g - 1].statements, !0), f[g - 1];case 2:
              this.$ = new d.ProgramNode(d.prepareProgram(f[g]), {}, this._$);break;case 3:
              this.$ = f[g];break;case 4:
              this.$ = f[g];break;case 5:
              this.$ = f[g];break;case 6:
              this.$ = f[g];break;case 7:
              this.$ = new d.ContentNode(f[g], this._$);break;case 8:
              this.$ = new d.CommentNode(f[g], this._$);break;case 9:
              this.$ = new d.RawBlockNode(f[g - 2], f[g - 1], f[g], this._$);break;case 10:
              this.$ = new d.MustacheNode(f[g - 1], null, "", "", this._$);break;case 11:
              this.$ = d.prepareBlock(f[g - 3], f[g - 2], f[g - 1], f[g], !1, this._$);break;case 12:
              this.$ = d.prepareBlock(f[g - 3], f[g - 2], f[g - 1], f[g], !0, this._$);break;case 13:
              this.$ = new d.MustacheNode(f[g - 1], null, f[g - 2], d.stripFlags(f[g - 2], f[g]), this._$);break;case 14:
              this.$ = new d.MustacheNode(f[g - 1], null, f[g - 2], d.stripFlags(f[g - 2], f[g]), this._$);break;case 15:
              this.$ = { strip: d.stripFlags(f[g - 1], f[g - 1]), program: f[g] };break;case 16:
              this.$ = { path: f[g - 1], strip: d.stripFlags(f[g - 2], f[g]) };break;case 17:
              this.$ = new d.MustacheNode(f[g - 1], null, f[g - 2], d.stripFlags(f[g - 2], f[g]), this._$);break;case 18:
              this.$ = new d.MustacheNode(f[g - 1], null, f[g - 2], d.stripFlags(f[g - 2], f[g]), this._$);break;case 19:
              this.$ = new d.PartialNode(f[g - 3], f[g - 2], f[g - 1], d.stripFlags(f[g - 4], f[g]), this._$);break;case 20:
              this.$ = new d.PartialNode(f[g - 2], void 0, f[g - 1], d.stripFlags(f[g - 3], f[g]), this._$);break;case 21:
              this.$ = new d.SexprNode([f[g - 2]].concat(f[g - 1]), f[g], this._$);break;case 22:
              this.$ = new d.SexprNode([f[g]], null, this._$);break;case 23:
              this.$ = f[g];break;case 24:
              this.$ = new d.StringNode(f[g], this._$);break;case 25:
              this.$ = new d.NumberNode(f[g], this._$);break;case 26:
              this.$ = new d.BooleanNode(f[g], this._$);break;case 27:
              this.$ = f[g];break;case 28:
              f[g - 1].isHelper = !0, this.$ = f[g - 1];break;case 29:
              this.$ = new d.HashNode(f[g], this._$);break;case 30:
              this.$ = [f[g - 2], f[g]];break;case 31:
              this.$ = new d.PartialNameNode(f[g], this._$);break;case 32:
              this.$ = new d.PartialNameNode(new d.StringNode(f[g], this._$), this._$);break;case 33:
              this.$ = new d.PartialNameNode(new d.NumberNode(f[g], this._$));break;case 34:
              this.$ = new d.DataNode(f[g], this._$);break;case 35:
              this.$ = new d.IdNode(f[g], this._$);break;case 36:
              f[g - 2].push({ part: f[g], separator: f[g - 1] }), this.$ = f[g - 2];break;case 37:
              this.$ = [{ part: f[g] }];break;case 38:
              this.$ = [];break;case 39:
              f[g - 1].push(f[g]);break;case 48:
              this.$ = [];break;case 49:
              f[g - 1].push(f[g]);break;case 52:
              this.$ = [f[g]];break;case 53:
              f[g - 1].push(f[g]);}
        }, table: [{ 3: 1, 4: 2, 5: [2, 38], 6: 3, 12: [2, 38], 13: [2, 38], 16: [2, 38], 24: [2, 38], 26: [2, 38], 31: [2, 38], 32: [2, 38], 34: [2, 38] }, { 1: [3] }, { 5: [1, 4] }, { 5: [2, 2], 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: [1, 10], 13: [1, 11], 14: 16, 16: [1, 20], 19: 14, 22: 15, 24: [1, 18], 26: [1, 19], 28: [2, 2], 29: [2, 2], 31: [1, 12], 32: [1, 13], 34: [1, 17] }, { 1: [2, 1] }, { 5: [2, 39], 12: [2, 39], 13: [2, 39], 16: [2, 39], 24: [2, 39], 26: [2, 39], 28: [2, 39], 29: [2, 39], 31: [2, 39], 32: [2, 39], 34: [2, 39] }, { 5: [2, 3], 12: [2, 3], 13: [2, 3], 16: [2, 3], 24: [2, 3], 26: [2, 3], 28: [2, 3], 29: [2, 3], 31: [2, 3], 32: [2, 3], 34: [2, 3] }, { 5: [2, 4], 12: [2, 4], 13: [2, 4], 16: [2, 4], 24: [2, 4], 26: [2, 4], 28: [2, 4], 29: [2, 4], 31: [2, 4], 32: [2, 4], 34: [2, 4] }, { 5: [2, 5], 12: [2, 5], 13: [2, 5], 16: [2, 5], 24: [2, 5], 26: [2, 5], 28: [2, 5], 29: [2, 5], 31: [2, 5], 32: [2, 5], 34: [2, 5] }, { 5: [2, 6], 12: [2, 6], 13: [2, 6], 16: [2, 6], 24: [2, 6], 26: [2, 6], 28: [2, 6], 29: [2, 6], 31: [2, 6], 32: [2, 6], 34: [2, 6] }, { 5: [2, 7], 12: [2, 7], 13: [2, 7], 16: [2, 7], 24: [2, 7], 26: [2, 7], 28: [2, 7], 29: [2, 7], 31: [2, 7], 32: [2, 7], 34: [2, 7] }, { 5: [2, 8], 12: [2, 8], 13: [2, 8], 16: [2, 8], 24: [2, 8], 26: [2, 8], 28: [2, 8], 29: [2, 8], 31: [2, 8], 32: [2, 8], 34: [2, 8] }, { 17: 21, 30: 22, 41: 23, 50: [1, 26], 52: [1, 25], 53: 24 }, { 17: 27, 30: 22, 41: 23, 50: [1, 26], 52: [1, 25], 53: 24 }, { 4: 28, 6: 3, 12: [2, 38], 13: [2, 38], 16: [2, 38], 24: [2, 38], 26: [2, 38], 28: [2, 38], 29: [2, 38], 31: [2, 38], 32: [2, 38], 34: [2, 38] }, { 4: 29, 6: 3, 12: [2, 38], 13: [2, 38], 16: [2, 38], 24: [2, 38], 26: [2, 38], 28: [2, 38], 29: [2, 38], 31: [2, 38], 32: [2, 38], 34: [2, 38] }, { 12: [1, 30] }, { 30: 32, 35: 31, 42: [1, 33], 43: [1, 34], 50: [1, 26], 53: 24 }, { 17: 35, 30: 22, 41: 23, 50: [1, 26], 52: [1, 25], 53: 24 }, { 17: 36, 30: 22, 41: 23, 50: [1, 26], 52: [1, 25], 53: 24 }, { 17: 37, 30: 22, 41: 23, 50: [1, 26], 52: [1, 25], 53: 24 }, { 25: [1, 38] }, { 18: [2, 48], 25: [2, 48], 33: [2, 48], 39: 39, 42: [2, 48], 43: [2, 48], 44: [2, 48], 45: [2, 48], 46: [2, 48], 50: [2, 48], 52: [2, 48] }, { 18: [2, 22], 25: [2, 22], 33: [2, 22], 46: [2, 22] }, { 18: [2, 35], 25: [2, 35], 33: [2, 35], 42: [2, 35], 43: [2, 35], 44: [2, 35], 45: [2, 35], 46: [2, 35], 50: [2, 35], 52: [2, 35], 54: [1, 40] }, { 30: 41, 50: [1, 26], 53: 24 }, { 18: [2, 37], 25: [2, 37], 33: [2, 37], 42: [2, 37], 43: [2, 37], 44: [2, 37], 45: [2, 37], 46: [2, 37], 50: [2, 37], 52: [2, 37], 54: [2, 37] }, { 33: [1, 42] }, { 20: 43, 27: 44, 28: [1, 45], 29: [2, 40] }, { 23: 46, 27: 47, 28: [1, 45], 29: [2, 42] }, { 15: [1, 48] }, { 25: [2, 46], 30: 51, 36: 49, 38: 50, 41: 55, 42: [1, 52], 43: [1, 53], 44: [1, 54], 45: [1, 56], 47: 57, 48: 58, 49: 60, 50: [1, 59], 52: [1, 25], 53: 24 }, { 25: [2, 31], 42: [2, 31], 43: [2, 31], 44: [2, 31], 45: [2, 31], 50: [2, 31], 52: [2, 31] }, { 25: [2, 32], 42: [2, 32], 43: [2, 32], 44: [2, 32], 45: [2, 32], 50: [2, 32], 52: [2, 32] }, { 25: [2, 33], 42: [2, 33], 43: [2, 33], 44: [2, 33], 45: [2, 33], 50: [2, 33], 52: [2, 33] }, { 25: [1, 61] }, { 25: [1, 62] }, { 18: [1, 63] }, { 5: [2, 17], 12: [2, 17], 13: [2, 17], 16: [2, 17], 24: [2, 17], 26: [2, 17], 28: [2, 17], 29: [2, 17], 31: [2, 17], 32: [2, 17], 34: [2, 17] }, { 18: [2, 50], 25: [2, 50], 30: 51, 33: [2, 50], 36: 65, 40: 64, 41: 55, 42: [1, 52], 43: [1, 53], 44: [1, 54], 45: [1, 56], 46: [2, 50], 47: 66, 48: 58, 49: 60, 50: [1, 59], 52: [1, 25], 53: 24 }, { 50: [1, 67] }, { 18: [2, 34], 25: [2, 34], 33: [2, 34], 42: [2, 34], 43: [2, 34], 44: [2, 34], 45: [2, 34], 46: [2, 34], 50: [2, 34], 52: [2, 34] }, { 5: [2, 18], 12: [2, 18], 13: [2, 18], 16: [2, 18], 24: [2, 18], 26: [2, 18], 28: [2, 18], 29: [2, 18], 31: [2, 18], 32: [2, 18], 34: [2, 18] }, { 21: 68, 29: [1, 69] }, { 29: [2, 41] }, { 4: 70, 6: 3, 12: [2, 38], 13: [2, 38], 16: [2, 38], 24: [2, 38], 26: [2, 38], 29: [2, 38], 31: [2, 38], 32: [2, 38], 34: [2, 38] }, { 21: 71, 29: [1, 69] }, { 29: [2, 43] }, { 5: [2, 9], 12: [2, 9], 13: [2, 9], 16: [2, 9], 24: [2, 9], 26: [2, 9], 28: [2, 9], 29: [2, 9], 31: [2, 9], 32: [2, 9], 34: [2, 9] }, { 25: [2, 44], 37: 72, 47: 73, 48: 58, 49: 60, 50: [1, 74] }, { 25: [1, 75] }, { 18: [2, 23], 25: [2, 23], 33: [2, 23], 42: [2, 23], 43: [2, 23], 44: [2, 23], 45: [2, 23], 46: [2, 23], 50: [2, 23], 52: [2, 23] }, { 18: [2, 24], 25: [2, 24], 33: [2, 24], 42: [2, 24], 43: [2, 24], 44: [2, 24], 45: [2, 24], 46: [2, 24], 50: [2, 24], 52: [2, 24] }, { 18: [2, 25], 25: [2, 25], 33: [2, 25], 42: [2, 25], 43: [2, 25], 44: [2, 25], 45: [2, 25], 46: [2, 25], 50: [2, 25], 52: [2, 25] }, { 18: [2, 26], 25: [2, 26], 33: [2, 26], 42: [2, 26], 43: [2, 26], 44: [2, 26], 45: [2, 26], 46: [2, 26], 50: [2, 26], 52: [2, 26] }, { 18: [2, 27], 25: [2, 27], 33: [2, 27], 42: [2, 27], 43: [2, 27], 44: [2, 27], 45: [2, 27], 46: [2, 27], 50: [2, 27], 52: [2, 27] }, { 17: 76, 30: 22, 41: 23, 50: [1, 26], 52: [1, 25], 53: 24 }, { 25: [2, 47] }, { 18: [2, 29], 25: [2, 29], 33: [2, 29], 46: [2, 29], 49: 77, 50: [1, 74] }, { 18: [2, 37], 25: [2, 37], 33: [2, 37], 42: [2, 37], 43: [2, 37], 44: [2, 37], 45: [2, 37], 46: [2, 37], 50: [2, 37], 51: [1, 78], 52: [2, 37], 54: [2, 37] }, { 18: [2, 52], 25: [2, 52], 33: [2, 52], 46: [2, 52], 50: [2, 52] }, { 12: [2, 13], 13: [2, 13], 16: [2, 13], 24: [2, 13], 26: [2, 13], 28: [2, 13], 29: [2, 13], 31: [2, 13], 32: [2, 13], 34: [2, 13] }, { 12: [2, 14], 13: [2, 14], 16: [2, 14], 24: [2, 14], 26: [2, 14], 28: [2, 14], 29: [2, 14], 31: [2, 14], 32: [2, 14], 34: [2, 14] }, { 12: [2, 10] }, { 18: [2, 21], 25: [2, 21], 33: [2, 21], 46: [2, 21] }, { 18: [2, 49], 25: [2, 49], 33: [2, 49], 42: [2, 49], 43: [2, 49], 44: [2, 49], 45: [2, 49], 46: [2, 49], 50: [2, 49], 52: [2, 49] }, { 18: [2, 51], 25: [2, 51], 33: [2, 51], 46: [2, 51] }, { 18: [2, 36], 25: [2, 36], 33: [2, 36], 42: [2, 36], 43: [2, 36], 44: [2, 36], 45: [2, 36], 46: [2, 36], 50: [2, 36], 52: [2, 36], 54: [2, 36] }, { 5: [2, 11], 12: [2, 11], 13: [2, 11], 16: [2, 11], 24: [2, 11], 26: [2, 11], 28: [2, 11], 29: [2, 11], 31: [2, 11], 32: [2, 11], 34: [2, 11] }, { 30: 79, 50: [1, 26], 53: 24 }, { 29: [2, 15] }, { 5: [2, 12], 12: [2, 12], 13: [2, 12], 16: [2, 12], 24: [2, 12], 26: [2, 12], 28: [2, 12], 29: [2, 12], 31: [2, 12], 32: [2, 12], 34: [2, 12] }, { 25: [1, 80] }, { 25: [2, 45] }, { 51: [1, 78] }, { 5: [2, 20], 12: [2, 20], 13: [2, 20], 16: [2, 20], 24: [2, 20], 26: [2, 20], 28: [2, 20], 29: [2, 20], 31: [2, 20], 32: [2, 20], 34: [2, 20] }, { 46: [1, 81] }, { 18: [2, 53], 25: [2, 53], 33: [2, 53], 46: [2, 53], 50: [2, 53] }, { 30: 51, 36: 82, 41: 55, 42: [1, 52], 43: [1, 53], 44: [1, 54], 45: [1, 56], 50: [1, 26], 52: [1, 25], 53: 24 }, { 25: [1, 83] }, { 5: [2, 19], 12: [2, 19], 13: [2, 19], 16: [2, 19], 24: [2, 19], 26: [2, 19], 28: [2, 19], 29: [2, 19], 31: [2, 19], 32: [2, 19], 34: [2, 19] }, { 18: [2, 28], 25: [2, 28], 33: [2, 28], 42: [2, 28], 43: [2, 28], 44: [2, 28], 45: [2, 28], 46: [2, 28], 50: [2, 28], 52: [2, 28] }, { 18: [2, 30], 25: [2, 30], 33: [2, 30], 46: [2, 30], 50: [2, 30] }, { 5: [2, 16], 12: [2, 16], 13: [2, 16], 16: [2, 16], 24: [2, 16], 26: [2, 16], 28: [2, 16], 29: [2, 16], 31: [2, 16], 32: [2, 16], 34: [2, 16] }], defaultActions: { 4: [2, 1], 44: [2, 41], 47: [2, 43], 57: [2, 47], 63: [2, 10], 70: [2, 15], 73: [2, 45] }, parseError: function parseError(a) {
          throw new Error(a);
        }, parse: function parse(a) {
          function b() {
            var a;return a = c.lexer.lex() || 1, "number" != typeof a && (a = c.symbols_[a] || a), a;
          }var c = this,
              d = [0],
              e = [null],
              f = [],
              g = this.table,
              h = "",
              i = 0,
              j = 0,
              k = 0;this.lexer.setInput(a), this.lexer.yy = this.yy, this.yy.lexer = this.lexer, this.yy.parser = this, "undefined" == typeof this.lexer.yylloc && (this.lexer.yylloc = {});var l = this.lexer.yylloc;f.push(l);var m = this.lexer.options && this.lexer.options.ranges;"function" == typeof this.yy.parseError && (this.parseError = this.yy.parseError);for (var n, o, p, q, r, s, t, u, v, w = {};;) {
            if (p = d[d.length - 1], this.defaultActions[p] ? q = this.defaultActions[p] : ((null === n || "undefined" == typeof n) && (n = b()), q = g[p] && g[p][n]), "undefined" == typeof q || !q.length || !q[0]) {
              var x = "";if (!k) {
                v = [];for (s in g[p]) {
                  this.terminals_[s] && s > 2 && v.push("'" + this.terminals_[s] + "'");
                }x = this.lexer.showPosition ? "Parse error on line " + (i + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + v.join(", ") + ", got '" + (this.terminals_[n] || n) + "'" : "Parse error on line " + (i + 1) + ": Unexpected " + (1 == n ? "end of input" : "'" + (this.terminals_[n] || n) + "'"), this.parseError(x, { text: this.lexer.match, token: this.terminals_[n] || n, line: this.lexer.yylineno, loc: l, expected: v });
              }
            }if (q[0] instanceof Array && q.length > 1) throw new Error("Parse Error: multiple actions possible at state: " + p + ", token: " + n);switch (q[0]) {case 1:
                d.push(n), e.push(this.lexer.yytext), f.push(this.lexer.yylloc), d.push(q[1]), n = null, o ? (n = o, o = null) : (j = this.lexer.yyleng, h = this.lexer.yytext, i = this.lexer.yylineno, l = this.lexer.yylloc, k > 0 && k--);break;case 2:
                if (t = this.productions_[q[1]][1], w.$ = e[e.length - t], w._$ = { first_line: f[f.length - (t || 1)].first_line, last_line: f[f.length - 1].last_line, first_column: f[f.length - (t || 1)].first_column, last_column: f[f.length - 1].last_column }, m && (w._$.range = [f[f.length - (t || 1)].range[0], f[f.length - 1].range[1]]), r = this.performAction.call(w, h, j, i, this.yy, q[1], e, f), "undefined" != typeof r) return r;t && (d = d.slice(0, -1 * t * 2), e = e.slice(0, -1 * t), f = f.slice(0, -1 * t)), d.push(this.productions_[q[1]][0]), e.push(w.$), f.push(w._$), u = g[d[d.length - 2]][d[d.length - 1]], d.push(u);break;case 3:
                return !0;}
          }return !0;
        } },
          c = function () {
        var a = { EOF: 1, parseError: function parseError(a, b) {
            if (!this.yy.parser) throw new Error(a);this.yy.parser.parseError(a, b);
          }, setInput: function setInput(a) {
            return this._input = a, this._more = this._less = this.done = !1, this.yylineno = this.yyleng = 0, this.yytext = this.matched = this.match = "", this.conditionStack = ["INITIAL"], this.yylloc = { first_line: 1, first_column: 0, last_line: 1, last_column: 0 }, this.options.ranges && (this.yylloc.range = [0, 0]), this.offset = 0, this;
          }, input: function input() {
            var a = this._input[0];this.yytext += a, this.yyleng++, this.offset++, this.match += a, this.matched += a;var b = a.match(/(?:\r\n?|\n).*/g);return b ? (this.yylineno++, this.yylloc.last_line++) : this.yylloc.last_column++, this.options.ranges && this.yylloc.range[1]++, this._input = this._input.slice(1), a;
          }, unput: function unput(a) {
            var b = a.length,
                c = a.split(/(?:\r\n?|\n)/g);this._input = a + this._input, this.yytext = this.yytext.substr(0, this.yytext.length - b - 1), this.offset -= b;var d = this.match.split(/(?:\r\n?|\n)/g);this.match = this.match.substr(0, this.match.length - 1), this.matched = this.matched.substr(0, this.matched.length - 1), c.length - 1 && (this.yylineno -= c.length - 1);var e = this.yylloc.range;return this.yylloc = { first_line: this.yylloc.first_line, last_line: this.yylineno + 1, first_column: this.yylloc.first_column, last_column: c ? (c.length === d.length ? this.yylloc.first_column : 0) + d[d.length - c.length].length - c[0].length : this.yylloc.first_column - b }, this.options.ranges && (this.yylloc.range = [e[0], e[0] + this.yyleng - b]), this;
          }, more: function more() {
            return this._more = !0, this;
          }, less: function less(a) {
            this.unput(this.match.slice(a));
          }, pastInput: function pastInput() {
            var a = this.matched.substr(0, this.matched.length - this.match.length);return (a.length > 20 ? "..." : "") + a.substr(-20).replace(/\n/g, "");
          }, upcomingInput: function upcomingInput() {
            var a = this.match;return a.length < 20 && (a += this._input.substr(0, 20 - a.length)), (a.substr(0, 20) + (a.length > 20 ? "..." : "")).replace(/\n/g, "");
          }, showPosition: function showPosition() {
            var a = this.pastInput(),
                b = new Array(a.length + 1).join("-");return a + this.upcomingInput() + "\n" + b + "^";
          }, next: function next() {
            if (this.done) return this.EOF;this._input || (this.done = !0);var a, b, c, d, e;this._more || (this.yytext = "", this.match = "");for (var f = this._currentRules(), g = 0; g < f.length && (c = this._input.match(this.rules[f[g]]), !c || b && !(c[0].length > b[0].length) || (b = c, d = g, this.options.flex)); g++) {}return b ? (e = b[0].match(/(?:\r\n?|\n).*/g), e && (this.yylineno += e.length), this.yylloc = { first_line: this.yylloc.last_line, last_line: this.yylineno + 1, first_column: this.yylloc.last_column, last_column: e ? e[e.length - 1].length - e[e.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + b[0].length }, this.yytext += b[0], this.match += b[0], this.matches = b, this.yyleng = this.yytext.length, this.options.ranges && (this.yylloc.range = [this.offset, this.offset += this.yyleng]), this._more = !1, this._input = this._input.slice(b[0].length), this.matched += b[0], a = this.performAction.call(this, this.yy, this, f[d], this.conditionStack[this.conditionStack.length - 1]), this.done && this._input && (this.done = !1), a ? a : void 0) : "" === this._input ? this.EOF : this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), { text: "", token: null, line: this.yylineno });
          }, lex: function lex() {
            var a = this.next();return "undefined" != typeof a ? a : this.lex();
          }, begin: function begin(a) {
            this.conditionStack.push(a);
          }, popState: function popState() {
            return this.conditionStack.pop();
          }, _currentRules: function _currentRules() {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
          }, topState: function topState() {
            return this.conditionStack[this.conditionStack.length - 2];
          }, pushState: function pushState(a) {
            this.begin(a);
          } };return a.options = {}, a.performAction = function (a, b, c, d) {
          function e(a, c) {
            return b.yytext = b.yytext.substr(a, b.yyleng - c);
          }switch (c) {case 0:
              if ("\\\\" === b.yytext.slice(-2) ? (e(0, 1), this.begin("mu")) : "\\" === b.yytext.slice(-1) ? (e(0, 1), this.begin("emu")) : this.begin("mu"), b.yytext) return 12;break;case 1:
              return 12;case 2:
              return this.popState(), 12;case 3:
              return b.yytext = b.yytext.substr(5, b.yyleng - 9), this.popState(), 15;case 4:
              return 12;case 5:
              return e(0, 4), this.popState(), 13;case 6:
              return 45;case 7:
              return 46;case 8:
              return 16;case 9:
              return this.popState(), this.begin("raw"), 18;case 10:
              return 34;case 11:
              return 24;case 12:
              return 29;case 13:
              return this.popState(), 28;case 14:
              return this.popState(), 28;case 15:
              return 26;case 16:
              return 26;case 17:
              return 32;case 18:
              return 31;case 19:
              this.popState(), this.begin("com");break;case 20:
              return e(3, 5), this.popState(), 13;case 21:
              return 31;case 22:
              return 51;case 23:
              return 50;case 24:
              return 50;case 25:
              return 54;case 26:
              break;case 27:
              return this.popState(), 33;case 28:
              return this.popState(), 25;case 29:
              return b.yytext = e(1, 2).replace(/\\"/g, '"'), 42;case 30:
              return b.yytext = e(1, 2).replace(/\\'/g, "'"), 42;case 31:
              return 52;case 32:
              return 44;case 33:
              return 44;case 34:
              return 43;case 35:
              return 50;case 36:
              return b.yytext = e(1, 2), 50;case 37:
              return "INVALID";case 38:
              return 5;}
        }, a.rules = [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/, /^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/, /^(?:[^\x00]*?(?=(\{\{\{\{\/)))/, /^(?:[\s\S]*?--\}\})/, /^(?:\()/, /^(?:\))/, /^(?:\{\{\{\{)/, /^(?:\}\}\}\})/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^\s*(~)?\}\})/, /^(?:\{\{(~)?\s*else\s*(~)?\}\})/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{!--)/, /^(?:\{\{![\s\S]*?\}\})/, /^(?:\{\{(~)?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.)])))/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s)])))/, /^(?:false(?=([~}\s)])))/, /^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)]))))/, /^(?:\[[^\]]*\])/, /^(?:.)/, /^(?:$)/], a.conditions = { mu: { rules: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38], inclusive: !1 }, emu: { rules: [2], inclusive: !1 }, com: { rules: [5], inclusive: !1 }, raw: { rules: [3, 4], inclusive: !1 }, INITIAL: { rules: [0, 1, 38], inclusive: !0 } }, a;
      }();return b.lexer = c, a.prototype = b, b.Parser = a, new a();
    }();return a = b;
  }(),
      i = function (a) {
    "use strict";
    function b(a, b) {
      return { left: "~" === a.charAt(2), right: "~" === b.charAt(b.length - 3) };
    }function c(a, b, c, d, i, k) {
      if (a.sexpr.id.original !== d.path.original) throw new j(a.sexpr.id.original + " doesn't match " + d.path.original, a);var l = c && c.program,
          m = { left: a.strip.left, right: d.strip.right, openStandalone: f(b.statements), closeStandalone: e((l || b).statements) };if (a.strip.right && g(b.statements, null, !0), l) {
        var n = c.strip;n.left && h(b.statements, null, !0), n.right && g(l.statements, null, !0), d.strip.left && h(l.statements, null, !0), e(b.statements) && f(l.statements) && (h(b.statements), g(l.statements));
      } else d.strip.left && h(b.statements, null, !0);return i ? new this.BlockNode(a, l, b, m, k) : new this.BlockNode(a, b, l, m, k);
    }function d(a, b) {
      for (var c = 0, d = a.length; d > c; c++) {
        var i = a[c],
            j = i.strip;if (j) {
          var k = e(a, c, b, "partial" === i.type),
              l = f(a, c, b),
              m = j.openStandalone && k,
              n = j.closeStandalone && l,
              o = j.inlineStandalone && k && l;j.right && g(a, c, !0), j.left && h(a, c, !0), o && (g(a, c), h(a, c) && "partial" === i.type && (i.indent = /([ \t]+$)/.exec(a[c - 1].original) ? RegExp.$1 : "")), m && (g((i.program || i.inverse).statements), h(a, c)), n && (g(a, c), h((i.inverse || i.program).statements));
        }
      }return a;
    }function e(a, b, c) {
      void 0 === b && (b = a.length);var d = a[b - 1],
          e = a[b - 2];return d ? "content" === d.type ? (e || !c ? /\r?\n\s*?$/ : /(^|\r?\n)\s*?$/).test(d.original) : void 0 : c;
    }function f(a, b, c) {
      void 0 === b && (b = -1);var d = a[b + 1],
          e = a[b + 2];return d ? "content" === d.type ? (e || !c ? /^\s*?\r?\n/ : /^\s*?(\r?\n|$)/).test(d.original) : void 0 : c;
    }function g(a, b, c) {
      var d = a[null == b ? 0 : b + 1];if (d && "content" === d.type && (c || !d.rightStripped)) {
        var e = d.string;d.string = d.string.replace(c ? /^\s+/ : /^[ \t]*\r?\n?/, ""), d.rightStripped = d.string !== e;
      }
    }function h(a, b, c) {
      var d = a[null == b ? a.length - 1 : b - 1];if (d && "content" === d.type && (c || !d.leftStripped)) {
        var e = d.string;return d.string = d.string.replace(c ? /\s+$/ : /[ \t]+$/, ""), d.leftStripped = d.string !== e, d.leftStripped;
      }
    }var i = {},
        j = a;return i.stripFlags = b, i.prepareBlock = c, i.prepareProgram = d, i;
  }(c),
      j = function (a, b, c, d) {
    "use strict";
    function e(a) {
      return a.constructor === h.ProgramNode ? a : (g.yy = k, g.parse(a));
    }var f = {},
        g = a,
        h = b,
        i = c,
        j = d.extend;f.parser = g;var k = {};return j(k, i, h), f.parse = e, f;
  }(h, g, i, b),
      k = function (a, b) {
    "use strict";
    function c() {}function d(a, b, c) {
      if (null == a || "string" != typeof a && a.constructor !== c.AST.ProgramNode) throw new h("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + a);b = b || {}, "data" in b || (b.data = !0), b.compat && (b.useDepths = !0);var d = c.parse(a),
          e = new c.Compiler().compile(d, b);return new c.JavaScriptCompiler().compile(e, b);
    }function e(a, b, c) {
      function d() {
        var d = c.parse(a),
            e = new c.Compiler().compile(d, b),
            f = new c.JavaScriptCompiler().compile(e, b, void 0, !0);return c.template(f);
      }if (null == a || "string" != typeof a && a.constructor !== c.AST.ProgramNode) throw new h("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + a);b = b || {}, "data" in b || (b.data = !0), b.compat && (b.useDepths = !0);var e,
          f = function f(a, b) {
        return e || (e = d()), e.call(this, a, b);
      };return f._setup = function (a) {
        return e || (e = d()), e._setup(a);
      }, f._child = function (a, b, c) {
        return e || (e = d()), e._child(a, b, c);
      }, f;
    }function f(a, b) {
      if (a === b) return !0;if (i(a) && i(b) && a.length === b.length) {
        for (var c = 0; c < a.length; c++) {
          if (!f(a[c], b[c])) return !1;
        }return !0;
      }
    }var g = {},
        h = a,
        i = b.isArray,
        j = [].slice;return g.Compiler = c, c.prototype = { compiler: c, equals: function equals(a) {
        var b = this.opcodes.length;if (a.opcodes.length !== b) return !1;for (var c = 0; b > c; c++) {
          var d = this.opcodes[c],
              e = a.opcodes[c];if (d.opcode !== e.opcode || !f(d.args, e.args)) return !1;
        }for (b = this.children.length, c = 0; b > c; c++) {
          if (!this.children[c].equals(a.children[c])) return !1;
        }return !0;
      }, guid: 0, compile: function compile(a, b) {
        this.opcodes = [], this.children = [], this.depths = { list: [] }, this.options = b, this.stringParams = b.stringParams, this.trackIds = b.trackIds;var c = this.options.knownHelpers;if (this.options.knownHelpers = { helperMissing: !0, blockHelperMissing: !0, each: !0, "if": !0, unless: !0, "with": !0, log: !0, lookup: !0 }, c) for (var d in c) {
          this.options.knownHelpers[d] = c[d];
        }return this.accept(a);
      }, accept: function accept(a) {
        return this[a.type](a);
      }, program: function program(a) {
        for (var b = a.statements, c = 0, d = b.length; d > c; c++) {
          this.accept(b[c]);
        }return this.isSimple = 1 === d, this.depths.list = this.depths.list.sort(function (a, b) {
          return a - b;
        }), this;
      }, compileProgram: function compileProgram(a) {
        var b,
            c = new this.compiler().compile(a, this.options),
            d = this.guid++;
        this.usePartial = this.usePartial || c.usePartial, this.children[d] = c;for (var e = 0, f = c.depths.list.length; f > e; e++) {
          b = c.depths.list[e], 2 > b || this.addDepth(b - 1);
        }return d;
      }, block: function block(a) {
        var b = a.mustache,
            c = a.program,
            d = a.inverse;c && (c = this.compileProgram(c)), d && (d = this.compileProgram(d));var e = b.sexpr,
            f = this.classifySexpr(e);"helper" === f ? this.helperSexpr(e, c, d) : "simple" === f ? (this.simpleSexpr(e), this.opcode("pushProgram", c), this.opcode("pushProgram", d), this.opcode("emptyHash"), this.opcode("blockValue", e.id.original)) : (this.ambiguousSexpr(e, c, d), this.opcode("pushProgram", c), this.opcode("pushProgram", d), this.opcode("emptyHash"), this.opcode("ambiguousBlockValue")), this.opcode("append");
      }, hash: function hash(a) {
        var b,
            c,
            d = a.pairs;for (this.opcode("pushHash"), b = 0, c = d.length; c > b; b++) {
          this.pushParam(d[b][1]);
        }for (; b--;) {
          this.opcode("assignToHash", d[b][0]);
        }this.opcode("popHash");
      }, partial: function partial(a) {
        var b = a.partialName;this.usePartial = !0, a.hash ? this.accept(a.hash) : this.opcode("push", "undefined"), a.context ? this.accept(a.context) : (this.opcode("getContext", 0), this.opcode("pushContext")), this.opcode("invokePartial", b.name, a.indent || ""), this.opcode("append");
      }, content: function content(a) {
        a.string && this.opcode("appendContent", a.string);
      }, mustache: function mustache(a) {
        this.sexpr(a.sexpr), a.escaped && !this.options.noEscape ? this.opcode("appendEscaped") : this.opcode("append");
      }, ambiguousSexpr: function ambiguousSexpr(a, b, c) {
        var d = a.id,
            e = d.parts[0],
            f = null != b || null != c;this.opcode("getContext", d.depth), this.opcode("pushProgram", b), this.opcode("pushProgram", c), this.ID(d), this.opcode("invokeAmbiguous", e, f);
      }, simpleSexpr: function simpleSexpr(a) {
        var b = a.id;"DATA" === b.type ? this.DATA(b) : b.parts.length ? this.ID(b) : (this.addDepth(b.depth), this.opcode("getContext", b.depth), this.opcode("pushContext")), this.opcode("resolvePossibleLambda");
      }, helperSexpr: function helperSexpr(a, b, c) {
        var d = this.setupFullMustacheParams(a, b, c),
            e = a.id,
            f = e.parts[0];if (this.options.knownHelpers[f]) this.opcode("invokeKnownHelper", d.length, f);else {
          if (this.options.knownHelpersOnly) throw new h("You specified knownHelpersOnly, but used the unknown helper " + f, a);e.falsy = !0, this.ID(e), this.opcode("invokeHelper", d.length, e.original, e.isSimple);
        }
      }, sexpr: function sexpr(a) {
        var b = this.classifySexpr(a);"simple" === b ? this.simpleSexpr(a) : "helper" === b ? this.helperSexpr(a) : this.ambiguousSexpr(a);
      }, ID: function ID(a) {
        this.addDepth(a.depth), this.opcode("getContext", a.depth);var b = a.parts[0];b ? this.opcode("lookupOnContext", a.parts, a.falsy, a.isScoped) : this.opcode("pushContext");
      }, DATA: function DATA(a) {
        this.options.data = !0, this.opcode("lookupData", a.id.depth, a.id.parts);
      }, STRING: function STRING(a) {
        this.opcode("pushString", a.string);
      }, NUMBER: function NUMBER(a) {
        this.opcode("pushLiteral", a.number);
      }, BOOLEAN: function BOOLEAN(a) {
        this.opcode("pushLiteral", a.bool);
      }, comment: function comment() {}, opcode: function opcode(a) {
        this.opcodes.push({ opcode: a, args: j.call(arguments, 1) });
      }, addDepth: function addDepth(a) {
        0 !== a && (this.depths[a] || (this.depths[a] = !0, this.depths.list.push(a)));
      }, classifySexpr: function classifySexpr(a) {
        var b = a.isHelper,
            c = a.eligibleHelper,
            d = this.options;if (c && !b) {
          var e = a.id.parts[0];d.knownHelpers[e] ? b = !0 : d.knownHelpersOnly && (c = !1);
        }return b ? "helper" : c ? "ambiguous" : "simple";
      }, pushParams: function pushParams(a) {
        for (var b = 0, c = a.length; c > b; b++) {
          this.pushParam(a[b]);
        }
      }, pushParam: function pushParam(a) {
        this.stringParams ? (a.depth && this.addDepth(a.depth), this.opcode("getContext", a.depth || 0), this.opcode("pushStringParam", a.stringModeValue, a.type), "sexpr" === a.type && this.sexpr(a)) : (this.trackIds && this.opcode("pushId", a.type, a.idName || a.stringModeValue), this.accept(a));
      }, setupFullMustacheParams: function setupFullMustacheParams(a, b, c) {
        var d = a.params;return this.pushParams(d), this.opcode("pushProgram", b), this.opcode("pushProgram", c), a.hash ? this.hash(a.hash) : this.opcode("emptyHash"), d;
      } }, g.precompile = d, g.compile = e, g;
  }(c, b),
      l = function (a, b) {
    "use strict";
    function c(a) {
      this.value = a;
    }function d() {}var e,
        f = a.COMPILER_REVISION,
        g = a.REVISION_CHANGES,
        h = b;d.prototype = { nameLookup: function nameLookup(a, b) {
        return d.isValidJavaScriptVariableName(b) ? a + "." + b : a + "['" + b + "']";
      }, depthedLookup: function depthedLookup(a) {
        return this.aliases.lookup = "this.lookup", 'lookup(depths, "' + a + '")';
      }, compilerInfo: function compilerInfo() {
        var a = f,
            b = g[a];return [a, b];
      }, appendToBuffer: function appendToBuffer(a) {
        return this.environment.isSimple ? "return " + a + ";" : { appendToBuffer: !0, content: a, toString: function toString() {
            return "buffer += " + a + ";";
          } };
      }, initializeBuffer: function initializeBuffer() {
        return this.quotedString("");
      }, namespace: "Handlebars", compile: function compile(a, b, c, d) {
        this.environment = a, this.options = b, this.stringParams = this.options.stringParams, this.trackIds = this.options.trackIds, this.precompile = !d, this.name = this.environment.name, this.isChild = !!c, this.context = c || { programs: [], environments: [] }, this.preamble(), this.stackSlot = 0, this.stackVars = [], this.aliases = {}, this.registers = { list: [] }, this.hashes = [], this.compileStack = [], this.inlineStack = [], this.compileChildren(a, b), this.useDepths = this.useDepths || a.depths.list.length || this.options.compat;var e,
            f,
            g,
            i = a.opcodes;for (f = 0, g = i.length; g > f; f++) {
          e = i[f], this[e.opcode].apply(this, e.args);
        }if (this.pushSource(""), this.stackSlot || this.inlineStack.length || this.compileStack.length) throw new h("Compile completed with content left on stack");var j = this.createFunctionContext(d);if (this.isChild) return j;var k = { compiler: this.compilerInfo(), main: j },
            l = this.context.programs;for (f = 0, g = l.length; g > f; f++) {
          l[f] && (k[f] = l[f]);
        }return this.environment.usePartial && (k.usePartial = !0), this.options.data && (k.useData = !0), this.useDepths && (k.useDepths = !0), this.options.compat && (k.compat = !0), d || (k.compiler = JSON.stringify(k.compiler), k = this.objectLiteral(k)), k;
      }, preamble: function preamble() {
        this.lastContext = 0, this.source = [];
      }, createFunctionContext: function createFunctionContext(a) {
        var b = "",
            c = this.stackVars.concat(this.registers.list);c.length > 0 && (b += ", " + c.join(", "));for (var d in this.aliases) {
          this.aliases.hasOwnProperty(d) && (b += ", " + d + "=" + this.aliases[d]);
        }var e = ["depth0", "helpers", "partials", "data"];this.useDepths && e.push("depths");var f = this.mergeSource(b);return a ? (e.push(f), Function.apply(this, e)) : "function(" + e.join(",") + ") {\n  " + f + "}";
      }, mergeSource: function mergeSource(a) {
        for (var b, c, d = "", e = !this.forceBuffer, f = 0, g = this.source.length; g > f; f++) {
          var h = this.source[f];h.appendToBuffer ? b = b ? b + "\n    + " + h.content : h.content : (b && (d ? d += "buffer += " + b + ";\n  " : (c = !0, d = b + ";\n  "), b = void 0), d += h + "\n  ", this.environment.isSimple || (e = !1));
        }return e ? (b || !d) && (d += "return " + (b || '""') + ";\n") : (a += ", buffer = " + (c ? "" : this.initializeBuffer()), d += b ? "return buffer + " + b + ";\n" : "return buffer;\n"), a && (d = "var " + a.substring(2) + (c ? "" : ";\n  ") + d), d;
      }, blockValue: function blockValue(a) {
        this.aliases.blockHelperMissing = "helpers.blockHelperMissing";var b = [this.contextName(0)];this.setupParams(a, 0, b);var c = this.popStack();b.splice(1, 0, c), this.push("blockHelperMissing.call(" + b.join(", ") + ")");
      }, ambiguousBlockValue: function ambiguousBlockValue() {
        this.aliases.blockHelperMissing = "helpers.blockHelperMissing";var a = [this.contextName(0)];this.setupParams("", 0, a, !0), this.flushInline();var b = this.topStack();a.splice(1, 0, b), this.pushSource("if (!" + this.lastHelper + ") { " + b + " = blockHelperMissing.call(" + a.join(", ") + "); }");
      }, appendContent: function appendContent(a) {
        this.pendingContent && (a = this.pendingContent + a), this.pendingContent = a;
      }, append: function append() {
        this.flushInline();var a = this.popStack();this.pushSource("if (" + a + " != null) { " + this.appendToBuffer(a) + " }"), this.environment.isSimple && this.pushSource("else { " + this.appendToBuffer("''") + " }");
      }, appendEscaped: function appendEscaped() {
        this.aliases.escapeExpression = "this.escapeExpression", this.pushSource(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"));
      }, getContext: function getContext(a) {
        this.lastContext = a;
      }, pushContext: function pushContext() {
        this.pushStackLiteral(this.contextName(this.lastContext));
      }, lookupOnContext: function lookupOnContext(a, b, c) {
        var d = 0,
            e = a.length;for (c || !this.options.compat || this.lastContext ? this.pushContext() : this.push(this.depthedLookup(a[d++])); e > d; d++) {
          this.replaceStack(function (c) {
            var e = this.nameLookup(c, a[d], "context");return b ? " && " + e : " != null ? " + e + " : " + c;
          });
        }
      }, lookupData: function lookupData(a, b) {
        a ? this.pushStackLiteral("this.data(data, " + a + ")") : this.pushStackLiteral("data");for (var c = b.length, d = 0; c > d; d++) {
          this.replaceStack(function (a) {
            return " && " + this.nameLookup(a, b[d], "data");
          });
        }
      }, resolvePossibleLambda: function resolvePossibleLambda() {
        this.aliases.lambda = "this.lambda", this.push("lambda(" + this.popStack() + ", " + this.contextName(0) + ")");
      }, pushStringParam: function pushStringParam(a, b) {
        this.pushContext(), this.pushString(b), "sexpr" !== b && ("string" == typeof a ? this.pushString(a) : this.pushStackLiteral(a));
      }, emptyHash: function emptyHash() {
        this.pushStackLiteral("{}"), this.trackIds && this.push("{}"), this.stringParams && (this.push("{}"), this.push("{}"));
      }, pushHash: function pushHash() {
        this.hash && this.hashes.push(this.hash), this.hash = { values: [], types: [], contexts: [], ids: [] };
      }, popHash: function popHash() {
        var a = this.hash;this.hash = this.hashes.pop(), this.trackIds && this.push("{" + a.ids.join(",") + "}"), this.stringParams && (this.push("{" + a.contexts.join(",") + "}"), this.push("{" + a.types.join(",") + "}")), this.push("{\n    " + a.values.join(",\n    ") + "\n  }");
      }, pushString: function pushString(a) {
        this.pushStackLiteral(this.quotedString(a));
      }, push: function push(a) {
        return this.inlineStack.push(a), a;
      }, pushLiteral: function pushLiteral(a) {
        this.pushStackLiteral(a);
      }, pushProgram: function pushProgram(a) {
        null != a ? this.pushStackLiteral(this.programExpression(a)) : this.pushStackLiteral(null);
      }, invokeHelper: function invokeHelper(a, b, c) {
        this.aliases.helperMissing = "helpers.helperMissing";var d = this.popStack(),
            e = this.setupHelper(a, b),
            f = (c ? e.name + " || " : "") + d + " || helperMissing";this.push("((" + f + ").call(" + e.callParams + "))");
      }, invokeKnownHelper: function invokeKnownHelper(a, b) {
        var c = this.setupHelper(a, b);this.push(c.name + ".call(" + c.callParams + ")");
      }, invokeAmbiguous: function invokeAmbiguous(a, b) {
        this.aliases.functionType = '"function"', this.aliases.helperMissing = "helpers.helperMissing", this.useRegister("helper");var c = this.popStack();this.emptyHash();var d = this.setupHelper(0, a, b),
            e = this.lastHelper = this.nameLookup("helpers", a, "helper");this.push("((helper = (helper = " + e + " || " + c + ") != null ? helper : helperMissing" + (d.paramsInit ? "),(" + d.paramsInit : "") + "),(typeof helper === functionType ? helper.call(" + d.callParams + ") : helper))");
      }, invokePartial: function invokePartial(a, b) {
        var c = [this.nameLookup("partials", a, "partial"), "'" + b + "'", "'" + a + "'", this.popStack(), this.popStack(), "helpers", "partials"];this.options.data ? c.push("data") : this.options.compat && c.push("undefined"), this.options.compat && c.push("depths"), this.push("this.invokePartial(" + c.join(", ") + ")");
      }, assignToHash: function assignToHash(a) {
        var b,
            c,
            d,
            e = this.popStack();this.trackIds && (d = this.popStack()), this.stringParams && (c = this.popStack(), b = this.popStack());var f = this.hash;b && f.contexts.push("'" + a + "': " + b), c && f.types.push("'" + a + "': " + c), d && f.ids.push("'" + a + "': " + d), f.values.push("'" + a + "': (" + e + ")");
      }, pushId: function pushId(a, b) {
        "ID" === a || "DATA" === a ? this.pushString(b) : "sexpr" === a ? this.pushStackLiteral("true") : this.pushStackLiteral("null");
      }, compiler: d, compileChildren: function compileChildren(a, b) {
        for (var c, d, e = a.children, f = 0, g = e.length; g > f; f++) {
          c = e[f], d = new this.compiler();var h = this.matchExistingProgram(c);null == h ? (this.context.programs.push(""), h = this.context.programs.length, c.index = h, c.name = "program" + h, this.context.programs[h] = d.compile(c, b, this.context, !this.precompile), this.context.environments[h] = c, this.useDepths = this.useDepths || d.useDepths) : (c.index = h, c.name = "program" + h);
        }
      }, matchExistingProgram: function matchExistingProgram(a) {
        for (var b = 0, c = this.context.environments.length; c > b; b++) {
          var d = this.context.environments[b];if (d && d.equals(a)) return b;
        }
      }, programExpression: function programExpression(a) {
        var b = this.environment.children[a],
            c = (b.depths.list, this.useDepths),
            d = [b.index, "data"];return c && d.push("depths"), "this.program(" + d.join(", ") + ")";
      }, useRegister: function useRegister(a) {
        this.registers[a] || (this.registers[a] = !0, this.registers.list.push(a));
      }, pushStackLiteral: function pushStackLiteral(a) {
        return this.push(new c(a));
      }, pushSource: function pushSource(a) {
        this.pendingContent && (this.source.push(this.appendToBuffer(this.quotedString(this.pendingContent))), this.pendingContent = void 0), a && this.source.push(a);
      }, pushStack: function pushStack(a) {
        this.flushInline();var b = this.incrStack();return this.pushSource(b + " = " + a + ";"), this.compileStack.push(b), b;
      }, replaceStack: function replaceStack(a) {
        {
          var b,
              d,
              e,
              f = "";this.isInline();
        }if (!this.isInline()) throw new h("replaceStack on non-inline");var g = this.popStack(!0);if (g instanceof c) f = b = g.value, e = !0;else {
          d = !this.stackSlot;var i = d ? this.incrStack() : this.topStackName();f = "(" + this.push(i) + " = " + g + ")", b = this.topStack();
        }var j = a.call(this, b);e || this.popStack(), d && this.stackSlot--, this.push("(" + f + j + ")");
      }, incrStack: function incrStack() {
        return this.stackSlot++, this.stackSlot > this.stackVars.length && this.stackVars.push("stack" + this.stackSlot), this.topStackName();
      }, topStackName: function topStackName() {
        return "stack" + this.stackSlot;
      }, flushInline: function flushInline() {
        var a = this.inlineStack;if (a.length) {
          this.inlineStack = [];for (var b = 0, d = a.length; d > b; b++) {
            var e = a[b];e instanceof c ? this.compileStack.push(e) : this.pushStack(e);
          }
        }
      }, isInline: function isInline() {
        return this.inlineStack.length;
      }, popStack: function popStack(a) {
        var b = this.isInline(),
            d = (b ? this.inlineStack : this.compileStack).pop();if (!a && d instanceof c) return d.value;if (!b) {
          if (!this.stackSlot) throw new h("Invalid stack pop");this.stackSlot--;
        }return d;
      }, topStack: function topStack() {
        var a = this.isInline() ? this.inlineStack : this.compileStack,
            b = a[a.length - 1];return b instanceof c ? b.value : b;
      }, contextName: function contextName(a) {
        return this.useDepths && a ? "depths[" + a + "]" : "depth" + a;
      }, quotedString: function quotedString(a) {
        return '"' + a.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") + '"';
      }, objectLiteral: function objectLiteral(a) {
        var b = [];for (var c in a) {
          a.hasOwnProperty(c) && b.push(this.quotedString(c) + ":" + a[c]);
        }return "{" + b.join(",") + "}";
      }, setupHelper: function setupHelper(a, b, c) {
        var d = [],
            e = this.setupParams(b, a, d, c),
            f = this.nameLookup("helpers", b, "helper");return { params: d, paramsInit: e, name: f, callParams: [this.contextName(0)].concat(d).join(", ") };
      }, setupOptions: function setupOptions(a, b, c) {
        var d,
            e,
            f,
            g = {},
            h = [],
            i = [],
            j = [];g.name = this.quotedString(a), g.hash = this.popStack(), this.trackIds && (g.hashIds = this.popStack()), this.stringParams && (g.hashTypes = this.popStack(), g.hashContexts = this.popStack()), e = this.popStack(), f = this.popStack(), (f || e) && (f || (f = "this.noop"), e || (e = "this.noop"), g.fn = f, g.inverse = e);for (var k = b; k--;) {
          d = this.popStack(), c[k] = d, this.trackIds && (j[k] = this.popStack()), this.stringParams && (i[k] = this.popStack(), h[k] = this.popStack());
        }return this.trackIds && (g.ids = "[" + j.join(",") + "]"), this.stringParams && (g.types = "[" + i.join(",") + "]", g.contexts = "[" + h.join(",") + "]"), this.options.data && (g.data = "data"), g;
      }, setupParams: function setupParams(a, b, c, d) {
        var e = this.objectLiteral(this.setupOptions(a, b, c));return d ? (this.useRegister("options"), c.push("options"), "options=" + e) : (c.push(e), "");
      } };for (var i = "break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield".split(" "), j = d.RESERVED_WORDS = {}, k = 0, l = i.length; l > k; k++) {
      j[i[k]] = !0;
    }return d.isValidJavaScriptVariableName = function (a) {
      return !d.RESERVED_WORDS[a] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(a);
    }, e = d;
  }(d, c),
      m = function (a, b, c, d, e) {
    "use strict";
    var f,
        g = a,
        h = b,
        i = c.parser,
        j = c.parse,
        k = d.Compiler,
        l = d.compile,
        m = d.precompile,
        n = e,
        o = g.create,
        p = function p() {
      var a = o();return a.compile = function (b, c) {
        return l(b, c, a);
      }, a.precompile = function (b, c) {
        return m(b, c, a);
      }, a.AST = h, a.Compiler = k, a.JavaScriptCompiler = n, a.Parser = i, a.parse = j, a;
    };return g = p(), g.create = p, g["default"] = g, f = g;
  }(f, g, j, k, l);return m;
});
'use strict';

function IDB() {
    this._dbPromise = this._setupDB();
}

IDB.prototype._setupDB = function () {
    if (!navigator.serviceWorker) {
        return Promise.reject();
    }

    return idb.open('bitsofcode', 1, function (upgradeDb) {

        var ArticlesStore = upgradeDb.createObjectStore('Articles', {
            keyPath: 'guid'
        });
        ArticlesStore.createIndex('guid', 'guid');
        ArticlesStore.createIndex('pubDate', 'pubDate');

        var BookmarksStore = upgradeDb.createObjectStore('Bookmarks', {
            keyPath: 'guid'
        });
        BookmarksStore.createIndex('guid', 'guid');
        BookmarksStore.createIndex('pubDate', 'pubDate');

        var SettingsStore = upgradeDb.createObjectStore('Settings', {
            keyPath: 'setting'
        });
    });
};

IDB.prototype.add = function (dbStore, data) {
    return this._dbPromise.then(function (db) {
        var tx = db.transaction(dbStore, 'readwrite');
        var store = tx.objectStore(dbStore);
        store.put(data);
        return tx.complete;
    });
};

IDB.prototype.search = function (dbStore, dbIndex, searchKey, searchValue) {
    var results = [];
    return this._dbPromise.then(function (db) {
        var tx = db.transaction(dbStore, 'readwrite');
        var store = tx.objectStore(dbStore);

        if (!dbIndex) {
            return store.openCursor();
        }
        var index = store.index(dbIndex);
        return index.openCursor();
    }).then(function findItem(cursor) {
        if (!cursor) return;
        if (cursor.value[searchKey] == searchValue) {
            results.push(cursor.value);
        }
        return cursor.continue().then(findItem);
    }).then(function () {
        return results;
    });
};

IDB.prototype.remove = function (dbStore, dbIndex, searchKey, searchValue) {
    return this._dbPromise.then(function (db) {
        var tx = db.transaction(dbStore, 'readwrite');
        var store = tx.objectStore(dbStore);

        if (!dbIndex) {
            return store.openCursor();
        }
        var index = store.index(dbIndex);
        return index.openCursor();
    }).then(function deleteItem(cursor) {
        if (!cursor) return;
        if (cursor.value[searchKey] == searchValue) {
            cursor.delete();
        }
        return cursor.continue().then(deleteItem);
    }).then(function () {
        return true;
    });
};

IDB.prototype.retrieve = function (dbStore, dbIndex, check) {
    return this._dbPromise.then(function (db) {
        var tx = db.transaction(dbStore);
        var store = tx.objectStore(dbStore);

        if (!check) {
            return store.getAll();
        }

        var index = store.index(dbIndex);
        return index.getAll(check);
    });
};
"use strict";
!function () {
  function e(e) {
    return Array.prototype.slice.call(e);
  }function t(e) {
    return new Promise(function (t, n) {
      e.onsuccess = function () {
        t(e.result);
      }, e.onerror = function () {
        n(e.error);
      };
    });
  }function n(e, n, o) {
    var r,
        i = new Promise(function (i, u) {
      r = e[n].apply(e, o), t(r).then(i, u);
    });return i.request = r, i;
  }function o(e, t, o) {
    var r = n(e, t, o);return r.then(function (e) {
      return e ? new a(e, r.request) : void 0;
    });
  }function r(e, t, n) {
    n.forEach(function (n) {
      Object.defineProperty(e.prototype, n, { get: function get() {
          return this[t][n];
        } });
    });
  }function i(e, t, o, r) {
    r.forEach(function (r) {
      r in o.prototype && (e.prototype[r] = function () {
        return n(this[t], r, arguments);
      });
    });
  }function u(e, t, n, o) {
    o.forEach(function (o) {
      o in n.prototype && (e.prototype[o] = function () {
        return this[t][o].apply(this[t], arguments);
      });
    });
  }function s(e, t, n, r) {
    r.forEach(function (r) {
      r in n.prototype && (e.prototype[r] = function () {
        return o(this[t], r, arguments);
      });
    });
  }function c(e) {
    this._index = e;
  }function a(e, t) {
    this._cursor = e, this._request = t;
  }function p(e) {
    this._store = e;
  }function f(e) {
    this._tx = e, this.complete = new Promise(function (t, n) {
      e.oncomplete = function () {
        t();
      }, e.onerror = function () {
        n(e.error);
      };
    });
  }function d(e, t, n) {
    this._db = e, this.oldVersion = t, this.transaction = new f(n);
  }function l(e) {
    this._db = e;
  }r(c, "_index", ["name", "keyPath", "multiEntry", "unique"]), i(c, "_index", IDBIndex, ["get", "getKey", "getAll", "getAllKeys", "count"]), s(c, "_index", IDBIndex, ["openCursor", "openKeyCursor"]), r(a, "_cursor", ["direction", "key", "primaryKey", "value"]), i(a, "_cursor", IDBCursor, ["update", "delete"]), ["advance", "continue", "continuePrimaryKey"].forEach(function (e) {
    e in IDBCursor.prototype && (a.prototype[e] = function () {
      var n = this,
          o = arguments;return Promise.resolve().then(function () {
        return n._cursor[e].apply(n._cursor, o), t(n._request).then(function (e) {
          return e ? new a(e, n._request) : void 0;
        });
      });
    });
  }), p.prototype.createIndex = function () {
    return new c(this._store.createIndex.apply(this._store, arguments));
  }, p.prototype.index = function () {
    return new c(this._store.index.apply(this._store, arguments));
  }, r(p, "_store", ["name", "keyPath", "indexNames", "autoIncrement"]), i(p, "_store", IDBObjectStore, ["put", "add", "delete", "clear", "get", "getAll", "getAllKeys", "count"]), s(p, "_store", IDBObjectStore, ["openCursor", "openKeyCursor"]), u(p, "_store", IDBObjectStore, ["deleteIndex"]), f.prototype.objectStore = function () {
    return new p(this._tx.objectStore.apply(this._tx, arguments));
  }, r(f, "_tx", ["objectStoreNames", "mode"]), u(f, "_tx", IDBTransaction, ["abort"]), d.prototype.createObjectStore = function () {
    return new p(this._db.createObjectStore.apply(this._db, arguments));
  }, r(d, "_db", ["name", "version", "objectStoreNames"]), u(d, "_db", IDBDatabase, ["deleteObjectStore", "close"]), l.prototype.transaction = function () {
    return new f(this._db.transaction.apply(this._db, arguments));
  }, r(l, "_db", ["name", "version", "objectStoreNames"]), u(l, "_db", IDBDatabase, ["close"]), ["openCursor", "openKeyCursor"].forEach(function (t) {
    [p, c].forEach(function (n) {
      n.prototype[t.replace("open", "iterate")] = function () {
        var n = e(arguments),
            o = n[n.length - 1],
            r = (this._store || this._index)[t].apply(this._store, n.slice(0, -1));r.onsuccess = function () {
          o(r.result);
        };
      };
    });
  }), [c, p].forEach(function (e) {
    e.prototype.getAll || (e.prototype.getAll = function (e, t) {
      var n = this,
          o = [];return new Promise(function (r) {
        n.iterateCursor(e, function (e) {
          return e ? (o.push(e.value), void 0 !== t && o.length == t ? void r(o) : void e["continue"]()) : void r(o);
        });
      });
    });
  });var h = { open: function open(e, t, o) {
      var r = n(indexedDB, "open", [e, t]),
          i = r.request;return i.onupgradeneeded = function (e) {
        o && o(new d(i.result, e.oldVersion, i.transaction));
      }, r.then(function (e) {
        return new l(e);
      });
    }, "delete": function _delete(e) {
      return n(indexedDB, "deleteDatabase", [e]);
    } };"undefined" != typeof module ? module.exports = h : self.idb = h;
}();
'use strict';

var bitsofcode_rss_to_api_url = 'https://rss2json.com/api.json?rss_url=https://bitsofco.de/rss/';
var Database = new IDB();
var myNotificationsService = void 0;

/* **************

    Bookmark Article

 *************** */
function toggleBookmark(buttonElement) {
    var guid = buttonElement.getAttribute('data-guid');

    function toggleButtonClass() {
        buttonElement.classList.toggle('btn-bookmark--bookmarked');
    }

    function addArticleToBookmarks() {
        Database.retrieve('Articles', 'guid', guid).then(function (articles) {
            var article = articles[0];
            article.isBookmarked = true;
            Database.add('Articles', article);
            Database.add('Bookmarks', article).then(function () {
                return toggleButtonClass();
            });
        });
    }

    function removeArticleFromBookmarks() {
        Database.remove('Bookmarks', false, 'guid', guid).then(function () {
            return toggleButtonClass();
        });
    }

    Database.retrieve('Bookmarks', 'guid', guid).then(function (articles) {
        console.log(articles);
        if (articles.length === 0) return addArticleToBookmarks();
        removeArticleFromBookmarks();
    });
}

/* **************

  General Helper Functions

 *************** */

function sortedArticles(unsortedArticles) {
    return unsortedArticles.sort(function (a, b) {
        return new Date(b.pubDate) - new Date(a.pubDate);
    });
}

/* **************

Handlebars Helpers

 *************** */

Handlebars.registerHelper('excerpt', function (excerpt, options) {

    var lastParagraphIndex = excerpt.lastIndexOf("</p>");

    excerpt = excerpt.slice(0, lastParagraphIndex) + '....' + excerpt.slice(lastParagraphIndex);

    return excerpt;
});

Handlebars.registerHelper('moment', function (value, options) {
    var rawDate = value;
    var m = moment(rawDate).calendar(null, {
        sameDay: '[Today]',
        lastDay: '[Yesterday]',
        lastWeek: '[Last] dddd',
        sameElse: 'MMM Do, YYYY'
    });
    return m;
});

/* **************

    UI Stuff

 *************** */

var navigation = document.querySelector('.site-nav');

function displayNavigationTemplate(option) {
    navigation.innerHTML = MyApp.templates.nav(option);
}

var lastScrollPosition = 0;
window.onscroll = function () {
    var newScrollPosition = window.scrollY;
    var difference = lastScrollPosition - newScrollPosition;
    var differenceIsSignificant = difference > 10 | difference < -10;
    var scrollingUp = newScrollPosition < lastScrollPosition;
    var scrollingDown = newScrollPosition > lastScrollPosition;

    if (differenceIsSignificant) {
        if (scrollingUp) {
            navigation.classList.remove('hidden');
        } else if (scrollingDown) {
            navigation.classList.add('hidden');
        }
    }

    lastScrollPosition = newScrollPosition;
};

/* **************

 Service Worker

 *************** */

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').then(function (reg) {
        console.log('Service Worker Registered', reg);
        myNotificationsService = new NotificationsService(reg);
    }).catch(function (err) {
        console.log('Service Worker Failed to Register', err);
    });
}
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

//! moment.js
//! version : 2.13.0
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
!function (a, b) {
  "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "undefined" != typeof module ? module.exports = b() : "function" == typeof define && define.amd ? define(b) : a.moment = b();
}(undefined, function () {
  "use strict";
  function a() {
    return fd.apply(null, arguments);
  }function b(a) {
    fd = a;
  }function c(a) {
    return a instanceof Array || "[object Array]" === Object.prototype.toString.call(a);
  }function d(a) {
    return a instanceof Date || "[object Date]" === Object.prototype.toString.call(a);
  }function e(a, b) {
    var c,
        d = [];for (c = 0; c < a.length; ++c) {
      d.push(b(a[c], c));
    }return d;
  }function f(a, b) {
    return Object.prototype.hasOwnProperty.call(a, b);
  }function g(a, b) {
    for (var c in b) {
      f(b, c) && (a[c] = b[c]);
    }return f(b, "toString") && (a.toString = b.toString), f(b, "valueOf") && (a.valueOf = b.valueOf), a;
  }function h(a, b, c, d) {
    return Ja(a, b, c, d, !0).utc();
  }function i() {
    return { empty: !1, unusedTokens: [], unusedInput: [], overflow: -2, charsLeftOver: 0, nullInput: !1, invalidMonth: null, invalidFormat: !1, userInvalidated: !1, iso: !1, parsedDateParts: [], meridiem: null };
  }function j(a) {
    return null == a._pf && (a._pf = i()), a._pf;
  }function k(a) {
    if (null == a._isValid) {
      var b = j(a),
          c = gd.call(b.parsedDateParts, function (a) {
        return null != a;
      });a._isValid = !isNaN(a._d.getTime()) && b.overflow < 0 && !b.empty && !b.invalidMonth && !b.invalidWeekday && !b.nullInput && !b.invalidFormat && !b.userInvalidated && (!b.meridiem || b.meridiem && c), a._strict && (a._isValid = a._isValid && 0 === b.charsLeftOver && 0 === b.unusedTokens.length && void 0 === b.bigHour);
    }return a._isValid;
  }function l(a) {
    var b = h(NaN);return null != a ? g(j(b), a) : j(b).userInvalidated = !0, b;
  }function m(a) {
    return void 0 === a;
  }function n(a, b) {
    var c, d, e;if (m(b._isAMomentObject) || (a._isAMomentObject = b._isAMomentObject), m(b._i) || (a._i = b._i), m(b._f) || (a._f = b._f), m(b._l) || (a._l = b._l), m(b._strict) || (a._strict = b._strict), m(b._tzm) || (a._tzm = b._tzm), m(b._isUTC) || (a._isUTC = b._isUTC), m(b._offset) || (a._offset = b._offset), m(b._pf) || (a._pf = j(b)), m(b._locale) || (a._locale = b._locale), hd.length > 0) for (c in hd) {
      d = hd[c], e = b[d], m(e) || (a[d] = e);
    }return a;
  }function o(b) {
    n(this, b), this._d = new Date(null != b._d ? b._d.getTime() : NaN), id === !1 && (id = !0, a.updateOffset(this), id = !1);
  }function p(a) {
    return a instanceof o || null != a && null != a._isAMomentObject;
  }function q(a) {
    return 0 > a ? Math.ceil(a) : Math.floor(a);
  }function r(a) {
    var b = +a,
        c = 0;return 0 !== b && isFinite(b) && (c = q(b)), c;
  }function s(a, b, c) {
    var d,
        e = Math.min(a.length, b.length),
        f = Math.abs(a.length - b.length),
        g = 0;for (d = 0; e > d; d++) {
      (c && a[d] !== b[d] || !c && r(a[d]) !== r(b[d])) && g++;
    }return g + f;
  }function t(b) {
    a.suppressDeprecationWarnings === !1 && "undefined" != typeof console && console.warn && console.warn("Deprecation warning: " + b);
  }function u(b, c) {
    var d = !0;return g(function () {
      return null != a.deprecationHandler && a.deprecationHandler(null, b), d && (t(b + "\nArguments: " + Array.prototype.slice.call(arguments).join(", ") + "\n" + new Error().stack), d = !1), c.apply(this, arguments);
    }, c);
  }function v(b, c) {
    null != a.deprecationHandler && a.deprecationHandler(b, c), jd[b] || (t(c), jd[b] = !0);
  }function w(a) {
    return a instanceof Function || "[object Function]" === Object.prototype.toString.call(a);
  }function x(a) {
    return "[object Object]" === Object.prototype.toString.call(a);
  }function y(a) {
    var b, c;for (c in a) {
      b = a[c], w(b) ? this[c] = b : this["_" + c] = b;
    }this._config = a, this._ordinalParseLenient = new RegExp(this._ordinalParse.source + "|" + /\d{1,2}/.source);
  }function z(a, b) {
    var c,
        d = g({}, a);for (c in b) {
      f(b, c) && (x(a[c]) && x(b[c]) ? (d[c] = {}, g(d[c], a[c]), g(d[c], b[c])) : null != b[c] ? d[c] = b[c] : delete d[c]);
    }return d;
  }function A(a) {
    null != a && this.set(a);
  }function B(a) {
    return a ? a.toLowerCase().replace("_", "-") : a;
  }function C(a) {
    for (var b, c, d, e, f = 0; f < a.length;) {
      for (e = B(a[f]).split("-"), b = e.length, c = B(a[f + 1]), c = c ? c.split("-") : null; b > 0;) {
        if (d = D(e.slice(0, b).join("-"))) return d;if (c && c.length >= b && s(e, c, !0) >= b - 1) break;b--;
      }f++;
    }return null;
  }function D(a) {
    var b = null;if (!nd[a] && "undefined" != typeof module && module && module.exports) try {
      b = ld._abbr, require("./locale/" + a), E(b);
    } catch (c) {}return nd[a];
  }function E(a, b) {
    var c;return a && (c = m(b) ? H(a) : F(a, b), c && (ld = c)), ld._abbr;
  }function F(a, b) {
    return null !== b ? (b.abbr = a, null != nd[a] ? (v("defineLocaleOverride", "use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale"), b = z(nd[a]._config, b)) : null != b.parentLocale && (null != nd[b.parentLocale] ? b = z(nd[b.parentLocale]._config, b) : v("parentLocaleUndefined", "specified parentLocale is not defined yet")), nd[a] = new A(b), E(a), nd[a]) : (delete nd[a], null);
  }function G(a, b) {
    if (null != b) {
      var c;null != nd[a] && (b = z(nd[a]._config, b)), c = new A(b), c.parentLocale = nd[a], nd[a] = c, E(a);
    } else null != nd[a] && (null != nd[a].parentLocale ? nd[a] = nd[a].parentLocale : null != nd[a] && delete nd[a]);return nd[a];
  }function H(a) {
    var b;if (a && a._locale && a._locale._abbr && (a = a._locale._abbr), !a) return ld;if (!c(a)) {
      if (b = D(a)) return b;a = [a];
    }return C(a);
  }function I() {
    return kd(nd);
  }function J(a, b) {
    var c = a.toLowerCase();od[c] = od[c + "s"] = od[b] = a;
  }function K(a) {
    return "string" == typeof a ? od[a] || od[a.toLowerCase()] : void 0;
  }function L(a) {
    var b,
        c,
        d = {};for (c in a) {
      f(a, c) && (b = K(c), b && (d[b] = a[c]));
    }return d;
  }function M(b, c) {
    return function (d) {
      return null != d ? (O(this, b, d), a.updateOffset(this, c), this) : N(this, b);
    };
  }function N(a, b) {
    return a.isValid() ? a._d["get" + (a._isUTC ? "UTC" : "") + b]() : NaN;
  }function O(a, b, c) {
    a.isValid() && a._d["set" + (a._isUTC ? "UTC" : "") + b](c);
  }function P(a, b) {
    var c;if ("object" == (typeof a === "undefined" ? "undefined" : _typeof(a))) for (c in a) {
      this.set(c, a[c]);
    } else if (a = K(a), w(this[a])) return this[a](b);return this;
  }function Q(a, b, c) {
    var d = "" + Math.abs(a),
        e = b - d.length,
        f = a >= 0;return (f ? c ? "+" : "" : "-") + Math.pow(10, Math.max(0, e)).toString().substr(1) + d;
  }function R(a, b, c, d) {
    var e = d;"string" == typeof d && (e = function e() {
      return this[d]();
    }), a && (sd[a] = e), b && (sd[b[0]] = function () {
      return Q(e.apply(this, arguments), b[1], b[2]);
    }), c && (sd[c] = function () {
      return this.localeData().ordinal(e.apply(this, arguments), a);
    });
  }function S(a) {
    return a.match(/\[[\s\S]/) ? a.replace(/^\[|\]$/g, "") : a.replace(/\\/g, "");
  }function T(a) {
    var b,
        c,
        d = a.match(pd);for (b = 0, c = d.length; c > b; b++) {
      sd[d[b]] ? d[b] = sd[d[b]] : d[b] = S(d[b]);
    }return function (b) {
      var e,
          f = "";for (e = 0; c > e; e++) {
        f += d[e] instanceof Function ? d[e].call(b, a) : d[e];
      }return f;
    };
  }function U(a, b) {
    return a.isValid() ? (b = V(b, a.localeData()), rd[b] = rd[b] || T(b), rd[b](a)) : a.localeData().invalidDate();
  }function V(a, b) {
    function c(a) {
      return b.longDateFormat(a) || a;
    }var d = 5;for (qd.lastIndex = 0; d >= 0 && qd.test(a);) {
      a = a.replace(qd, c), qd.lastIndex = 0, d -= 1;
    }return a;
  }function W(a, b, c) {
    Kd[a] = w(b) ? b : function (a, d) {
      return a && c ? c : b;
    };
  }function X(a, b) {
    return f(Kd, a) ? Kd[a](b._strict, b._locale) : new RegExp(Y(a));
  }function Y(a) {
    return Z(a.replace("\\", "").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (a, b, c, d, e) {
      return b || c || d || e;
    }));
  }function Z(a) {
    return a.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  }function $(a, b) {
    var c,
        d = b;for ("string" == typeof a && (a = [a]), "number" == typeof b && (d = function d(a, c) {
      c[b] = r(a);
    }), c = 0; c < a.length; c++) {
      Ld[a[c]] = d;
    }
  }function _(a, b) {
    $(a, function (a, c, d, e) {
      d._w = d._w || {}, b(a, d._w, d, e);
    });
  }function aa(a, b, c) {
    null != b && f(Ld, a) && Ld[a](b, c._a, c, a);
  }function ba(a, b) {
    return new Date(Date.UTC(a, b + 1, 0)).getUTCDate();
  }function ca(a, b) {
    return c(this._months) ? this._months[a.month()] : this._months[Vd.test(b) ? "format" : "standalone"][a.month()];
  }function da(a, b) {
    return c(this._monthsShort) ? this._monthsShort[a.month()] : this._monthsShort[Vd.test(b) ? "format" : "standalone"][a.month()];
  }function ea(a, b, c) {
    var d,
        e,
        f,
        g = a.toLocaleLowerCase();if (!this._monthsParse) for (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = [], d = 0; 12 > d; ++d) {
      f = h([2e3, d]), this._shortMonthsParse[d] = this.monthsShort(f, "").toLocaleLowerCase(), this._longMonthsParse[d] = this.months(f, "").toLocaleLowerCase();
    }return c ? "MMM" === b ? (e = md.call(this._shortMonthsParse, g), -1 !== e ? e : null) : (e = md.call(this._longMonthsParse, g), -1 !== e ? e : null) : "MMM" === b ? (e = md.call(this._shortMonthsParse, g), -1 !== e ? e : (e = md.call(this._longMonthsParse, g), -1 !== e ? e : null)) : (e = md.call(this._longMonthsParse, g), -1 !== e ? e : (e = md.call(this._shortMonthsParse, g), -1 !== e ? e : null));
  }function fa(a, b, c) {
    var d, e, f;if (this._monthsParseExact) return ea.call(this, a, b, c);for (this._monthsParse || (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = []), d = 0; 12 > d; d++) {
      if (e = h([2e3, d]), c && !this._longMonthsParse[d] && (this._longMonthsParse[d] = new RegExp("^" + this.months(e, "").replace(".", "") + "$", "i"), this._shortMonthsParse[d] = new RegExp("^" + this.monthsShort(e, "").replace(".", "") + "$", "i")), c || this._monthsParse[d] || (f = "^" + this.months(e, "") + "|^" + this.monthsShort(e, ""), this._monthsParse[d] = new RegExp(f.replace(".", ""), "i")), c && "MMMM" === b && this._longMonthsParse[d].test(a)) return d;if (c && "MMM" === b && this._shortMonthsParse[d].test(a)) return d;if (!c && this._monthsParse[d].test(a)) return d;
    }
  }function ga(a, b) {
    var c;if (!a.isValid()) return a;if ("string" == typeof b) if (/^\d+$/.test(b)) b = r(b);else if (b = a.localeData().monthsParse(b), "number" != typeof b) return a;return c = Math.min(a.date(), ba(a.year(), b)), a._d["set" + (a._isUTC ? "UTC" : "") + "Month"](b, c), a;
  }function ha(b) {
    return null != b ? (ga(this, b), a.updateOffset(this, !0), this) : N(this, "Month");
  }function ia() {
    return ba(this.year(), this.month());
  }function ja(a) {
    return this._monthsParseExact ? (f(this, "_monthsRegex") || la.call(this), a ? this._monthsShortStrictRegex : this._monthsShortRegex) : this._monthsShortStrictRegex && a ? this._monthsShortStrictRegex : this._monthsShortRegex;
  }function ka(a) {
    return this._monthsParseExact ? (f(this, "_monthsRegex") || la.call(this), a ? this._monthsStrictRegex : this._monthsRegex) : this._monthsStrictRegex && a ? this._monthsStrictRegex : this._monthsRegex;
  }function la() {
    function a(a, b) {
      return b.length - a.length;
    }var b,
        c,
        d = [],
        e = [],
        f = [];for (b = 0; 12 > b; b++) {
      c = h([2e3, b]), d.push(this.monthsShort(c, "")), e.push(this.months(c, "")), f.push(this.months(c, "")), f.push(this.monthsShort(c, ""));
    }for (d.sort(a), e.sort(a), f.sort(a), b = 0; 12 > b; b++) {
      d[b] = Z(d[b]), e[b] = Z(e[b]), f[b] = Z(f[b]);
    }this._monthsRegex = new RegExp("^(" + f.join("|") + ")", "i"), this._monthsShortRegex = this._monthsRegex, this._monthsStrictRegex = new RegExp("^(" + e.join("|") + ")", "i"), this._monthsShortStrictRegex = new RegExp("^(" + d.join("|") + ")", "i");
  }function ma(a) {
    var b,
        c = a._a;return c && -2 === j(a).overflow && (b = c[Nd] < 0 || c[Nd] > 11 ? Nd : c[Od] < 1 || c[Od] > ba(c[Md], c[Nd]) ? Od : c[Pd] < 0 || c[Pd] > 24 || 24 === c[Pd] && (0 !== c[Qd] || 0 !== c[Rd] || 0 !== c[Sd]) ? Pd : c[Qd] < 0 || c[Qd] > 59 ? Qd : c[Rd] < 0 || c[Rd] > 59 ? Rd : c[Sd] < 0 || c[Sd] > 999 ? Sd : -1, j(a)._overflowDayOfYear && (Md > b || b > Od) && (b = Od), j(a)._overflowWeeks && -1 === b && (b = Td), j(a)._overflowWeekday && -1 === b && (b = Ud), j(a).overflow = b), a;
  }function na(a) {
    var b,
        c,
        d,
        e,
        f,
        g,
        h = a._i,
        i = $d.exec(h) || _d.exec(h);if (i) {
      for (j(a).iso = !0, b = 0, c = be.length; c > b; b++) {
        if (be[b][1].exec(i[1])) {
          e = be[b][0], d = be[b][2] !== !1;break;
        }
      }if (null == e) return void (a._isValid = !1);if (i[3]) {
        for (b = 0, c = ce.length; c > b; b++) {
          if (ce[b][1].exec(i[3])) {
            f = (i[2] || " ") + ce[b][0];break;
          }
        }if (null == f) return void (a._isValid = !1);
      }if (!d && null != f) return void (a._isValid = !1);if (i[4]) {
        if (!ae.exec(i[4])) return void (a._isValid = !1);g = "Z";
      }a._f = e + (f || "") + (g || ""), Ca(a);
    } else a._isValid = !1;
  }function oa(b) {
    var c = de.exec(b._i);return null !== c ? void (b._d = new Date(+c[1])) : (na(b), void (b._isValid === !1 && (delete b._isValid, a.createFromInputFallback(b))));
  }function pa(a, b, c, d, e, f, g) {
    var h = new Date(a, b, c, d, e, f, g);return 100 > a && a >= 0 && isFinite(h.getFullYear()) && h.setFullYear(a), h;
  }function qa(a) {
    var b = new Date(Date.UTC.apply(null, arguments));return 100 > a && a >= 0 && isFinite(b.getUTCFullYear()) && b.setUTCFullYear(a), b;
  }function ra(a) {
    return sa(a) ? 366 : 365;
  }function sa(a) {
    return a % 4 === 0 && a % 100 !== 0 || a % 400 === 0;
  }function ta() {
    return sa(this.year());
  }function ua(a, b, c) {
    var d = 7 + b - c,
        e = (7 + qa(a, 0, d).getUTCDay() - b) % 7;return -e + d - 1;
  }function va(a, b, c, d, e) {
    var f,
        g,
        h = (7 + c - d) % 7,
        i = ua(a, d, e),
        j = 1 + 7 * (b - 1) + h + i;return 0 >= j ? (f = a - 1, g = ra(f) + j) : j > ra(a) ? (f = a + 1, g = j - ra(a)) : (f = a, g = j), { year: f, dayOfYear: g };
  }function wa(a, b, c) {
    var d,
        e,
        f = ua(a.year(), b, c),
        g = Math.floor((a.dayOfYear() - f - 1) / 7) + 1;return 1 > g ? (e = a.year() - 1, d = g + xa(e, b, c)) : g > xa(a.year(), b, c) ? (d = g - xa(a.year(), b, c), e = a.year() + 1) : (e = a.year(), d = g), { week: d, year: e };
  }function xa(a, b, c) {
    var d = ua(a, b, c),
        e = ua(a + 1, b, c);return (ra(a) - d + e) / 7;
  }function ya(a, b, c) {
    return null != a ? a : null != b ? b : c;
  }function za(b) {
    var c = new Date(a.now());return b._useUTC ? [c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate()] : [c.getFullYear(), c.getMonth(), c.getDate()];
  }function Aa(a) {
    var b,
        c,
        d,
        e,
        f = [];if (!a._d) {
      for (d = za(a), a._w && null == a._a[Od] && null == a._a[Nd] && Ba(a), a._dayOfYear && (e = ya(a._a[Md], d[Md]), a._dayOfYear > ra(e) && (j(a)._overflowDayOfYear = !0), c = qa(e, 0, a._dayOfYear), a._a[Nd] = c.getUTCMonth(), a._a[Od] = c.getUTCDate()), b = 0; 3 > b && null == a._a[b]; ++b) {
        a._a[b] = f[b] = d[b];
      }for (; 7 > b; b++) {
        a._a[b] = f[b] = null == a._a[b] ? 2 === b ? 1 : 0 : a._a[b];
      }24 === a._a[Pd] && 0 === a._a[Qd] && 0 === a._a[Rd] && 0 === a._a[Sd] && (a._nextDay = !0, a._a[Pd] = 0), a._d = (a._useUTC ? qa : pa).apply(null, f), null != a._tzm && a._d.setUTCMinutes(a._d.getUTCMinutes() - a._tzm), a._nextDay && (a._a[Pd] = 24);
    }
  }function Ba(a) {
    var b, c, d, e, f, g, h, i;b = a._w, null != b.GG || null != b.W || null != b.E ? (f = 1, g = 4, c = ya(b.GG, a._a[Md], wa(Ka(), 1, 4).year), d = ya(b.W, 1), e = ya(b.E, 1), (1 > e || e > 7) && (i = !0)) : (f = a._locale._week.dow, g = a._locale._week.doy, c = ya(b.gg, a._a[Md], wa(Ka(), f, g).year), d = ya(b.w, 1), null != b.d ? (e = b.d, (0 > e || e > 6) && (i = !0)) : null != b.e ? (e = b.e + f, (b.e < 0 || b.e > 6) && (i = !0)) : e = f), 1 > d || d > xa(c, f, g) ? j(a)._overflowWeeks = !0 : null != i ? j(a)._overflowWeekday = !0 : (h = va(c, d, e, f, g), a._a[Md] = h.year, a._dayOfYear = h.dayOfYear);
  }function Ca(b) {
    if (b._f === a.ISO_8601) return void na(b);b._a = [], j(b).empty = !0;var c,
        d,
        e,
        f,
        g,
        h = "" + b._i,
        i = h.length,
        k = 0;for (e = V(b._f, b._locale).match(pd) || [], c = 0; c < e.length; c++) {
      f = e[c], d = (h.match(X(f, b)) || [])[0], d && (g = h.substr(0, h.indexOf(d)), g.length > 0 && j(b).unusedInput.push(g), h = h.slice(h.indexOf(d) + d.length), k += d.length), sd[f] ? (d ? j(b).empty = !1 : j(b).unusedTokens.push(f), aa(f, d, b)) : b._strict && !d && j(b).unusedTokens.push(f);
    }j(b).charsLeftOver = i - k, h.length > 0 && j(b).unusedInput.push(h), j(b).bigHour === !0 && b._a[Pd] <= 12 && b._a[Pd] > 0 && (j(b).bigHour = void 0), j(b).parsedDateParts = b._a.slice(0), j(b).meridiem = b._meridiem, b._a[Pd] = Da(b._locale, b._a[Pd], b._meridiem), Aa(b), ma(b);
  }function Da(a, b, c) {
    var d;return null == c ? b : null != a.meridiemHour ? a.meridiemHour(b, c) : null != a.isPM ? (d = a.isPM(c), d && 12 > b && (b += 12), d || 12 !== b || (b = 0), b) : b;
  }function Ea(a) {
    var b, c, d, e, f;if (0 === a._f.length) return j(a).invalidFormat = !0, void (a._d = new Date(NaN));for (e = 0; e < a._f.length; e++) {
      f = 0, b = n({}, a), null != a._useUTC && (b._useUTC = a._useUTC), b._f = a._f[e], Ca(b), k(b) && (f += j(b).charsLeftOver, f += 10 * j(b).unusedTokens.length, j(b).score = f, (null == d || d > f) && (d = f, c = b));
    }g(a, c || b);
  }function Fa(a) {
    if (!a._d) {
      var b = L(a._i);a._a = e([b.year, b.month, b.day || b.date, b.hour, b.minute, b.second, b.millisecond], function (a) {
        return a && parseInt(a, 10);
      }), Aa(a);
    }
  }function Ga(a) {
    var b = new o(ma(Ha(a)));return b._nextDay && (b.add(1, "d"), b._nextDay = void 0), b;
  }function Ha(a) {
    var b = a._i,
        e = a._f;return a._locale = a._locale || H(a._l), null === b || void 0 === e && "" === b ? l({ nullInput: !0 }) : ("string" == typeof b && (a._i = b = a._locale.preparse(b)), p(b) ? new o(ma(b)) : (c(e) ? Ea(a) : e ? Ca(a) : d(b) ? a._d = b : Ia(a), k(a) || (a._d = null), a));
  }function Ia(b) {
    var f = b._i;void 0 === f ? b._d = new Date(a.now()) : d(f) ? b._d = new Date(f.valueOf()) : "string" == typeof f ? oa(b) : c(f) ? (b._a = e(f.slice(0), function (a) {
      return parseInt(a, 10);
    }), Aa(b)) : "object" == (typeof f === "undefined" ? "undefined" : _typeof(f)) ? Fa(b) : "number" == typeof f ? b._d = new Date(f) : a.createFromInputFallback(b);
  }function Ja(a, b, c, d, e) {
    var f = {};return "boolean" == typeof c && (d = c, c = void 0), f._isAMomentObject = !0, f._useUTC = f._isUTC = e, f._l = c, f._i = a, f._f = b, f._strict = d, Ga(f);
  }function Ka(a, b, c, d) {
    return Ja(a, b, c, d, !1);
  }function La(a, b) {
    var d, e;if (1 === b.length && c(b[0]) && (b = b[0]), !b.length) return Ka();for (d = b[0], e = 1; e < b.length; ++e) {
      (!b[e].isValid() || b[e][a](d)) && (d = b[e]);
    }return d;
  }function Ma() {
    var a = [].slice.call(arguments, 0);return La("isBefore", a);
  }function Na() {
    var a = [].slice.call(arguments, 0);return La("isAfter", a);
  }function Oa(a) {
    var b = L(a),
        c = b.year || 0,
        d = b.quarter || 0,
        e = b.month || 0,
        f = b.week || 0,
        g = b.day || 0,
        h = b.hour || 0,
        i = b.minute || 0,
        j = b.second || 0,
        k = b.millisecond || 0;this._milliseconds = +k + 1e3 * j + 6e4 * i + 1e3 * h * 60 * 60, this._days = +g + 7 * f, this._months = +e + 3 * d + 12 * c, this._data = {}, this._locale = H(), this._bubble();
  }function Pa(a) {
    return a instanceof Oa;
  }function Qa(a, b) {
    R(a, 0, 0, function () {
      var a = this.utcOffset(),
          c = "+";return 0 > a && (a = -a, c = "-"), c + Q(~~(a / 60), 2) + b + Q(~~a % 60, 2);
    });
  }function Ra(a, b) {
    var c = (b || "").match(a) || [],
        d = c[c.length - 1] || [],
        e = (d + "").match(ie) || ["-", 0, 0],
        f = +(60 * e[1]) + r(e[2]);return "+" === e[0] ? f : -f;
  }function Sa(b, c) {
    var e, f;return c._isUTC ? (e = c.clone(), f = (p(b) || d(b) ? b.valueOf() : Ka(b).valueOf()) - e.valueOf(), e._d.setTime(e._d.valueOf() + f), a.updateOffset(e, !1), e) : Ka(b).local();
  }function Ta(a) {
    return 15 * -Math.round(a._d.getTimezoneOffset() / 15);
  }function Ua(b, c) {
    var d,
        e = this._offset || 0;return this.isValid() ? null != b ? ("string" == typeof b ? b = Ra(Hd, b) : Math.abs(b) < 16 && (b = 60 * b), !this._isUTC && c && (d = Ta(this)), this._offset = b, this._isUTC = !0, null != d && this.add(d, "m"), e !== b && (!c || this._changeInProgress ? jb(this, db(b - e, "m"), 1, !1) : this._changeInProgress || (this._changeInProgress = !0, a.updateOffset(this, !0), this._changeInProgress = null)), this) : this._isUTC ? e : Ta(this) : null != b ? this : NaN;
  }function Va(a, b) {
    return null != a ? ("string" != typeof a && (a = -a), this.utcOffset(a, b), this) : -this.utcOffset();
  }function Wa(a) {
    return this.utcOffset(0, a);
  }function Xa(a) {
    return this._isUTC && (this.utcOffset(0, a), this._isUTC = !1, a && this.subtract(Ta(this), "m")), this;
  }function Ya() {
    return this._tzm ? this.utcOffset(this._tzm) : "string" == typeof this._i && this.utcOffset(Ra(Gd, this._i)), this;
  }function Za(a) {
    return this.isValid() ? (a = a ? Ka(a).utcOffset() : 0, (this.utcOffset() - a) % 60 === 0) : !1;
  }function $a() {
    return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
  }function _a() {
    if (!m(this._isDSTShifted)) return this._isDSTShifted;var a = {};if (n(a, this), a = Ha(a), a._a) {
      var b = a._isUTC ? h(a._a) : Ka(a._a);this._isDSTShifted = this.isValid() && s(a._a, b.toArray()) > 0;
    } else this._isDSTShifted = !1;return this._isDSTShifted;
  }function ab() {
    return this.isValid() ? !this._isUTC : !1;
  }function bb() {
    return this.isValid() ? this._isUTC : !1;
  }function cb() {
    return this.isValid() ? this._isUTC && 0 === this._offset : !1;
  }function db(a, b) {
    var c,
        d,
        e,
        g = a,
        h = null;return Pa(a) ? g = { ms: a._milliseconds, d: a._days, M: a._months } : "number" == typeof a ? (g = {}, b ? g[b] = a : g.milliseconds = a) : (h = je.exec(a)) ? (c = "-" === h[1] ? -1 : 1, g = { y: 0, d: r(h[Od]) * c, h: r(h[Pd]) * c, m: r(h[Qd]) * c, s: r(h[Rd]) * c, ms: r(h[Sd]) * c }) : (h = ke.exec(a)) ? (c = "-" === h[1] ? -1 : 1, g = { y: eb(h[2], c), M: eb(h[3], c), w: eb(h[4], c), d: eb(h[5], c), h: eb(h[6], c), m: eb(h[7], c), s: eb(h[8], c) }) : null == g ? g = {} : "object" == (typeof g === "undefined" ? "undefined" : _typeof(g)) && ("from" in g || "to" in g) && (e = gb(Ka(g.from), Ka(g.to)), g = {}, g.ms = e.milliseconds, g.M = e.months), d = new Oa(g), Pa(a) && f(a, "_locale") && (d._locale = a._locale), d;
  }function eb(a, b) {
    var c = a && parseFloat(a.replace(",", "."));return (isNaN(c) ? 0 : c) * b;
  }function fb(a, b) {
    var c = { milliseconds: 0, months: 0 };return c.months = b.month() - a.month() + 12 * (b.year() - a.year()), a.clone().add(c.months, "M").isAfter(b) && --c.months, c.milliseconds = +b - +a.clone().add(c.months, "M"), c;
  }function gb(a, b) {
    var c;return a.isValid() && b.isValid() ? (b = Sa(b, a), a.isBefore(b) ? c = fb(a, b) : (c = fb(b, a), c.milliseconds = -c.milliseconds, c.months = -c.months), c) : { milliseconds: 0, months: 0 };
  }function hb(a) {
    return 0 > a ? -1 * Math.round(-1 * a) : Math.round(a);
  }function ib(a, b) {
    return function (c, d) {
      var e, f;return null === d || isNaN(+d) || (v(b, "moment()." + b + "(period, number) is deprecated. Please use moment()." + b + "(number, period)."), f = c, c = d, d = f), c = "string" == typeof c ? +c : c, e = db(c, d), jb(this, e, a), this;
    };
  }function jb(b, c, d, e) {
    var f = c._milliseconds,
        g = hb(c._days),
        h = hb(c._months);b.isValid() && (e = null == e ? !0 : e, f && b._d.setTime(b._d.valueOf() + f * d), g && O(b, "Date", N(b, "Date") + g * d), h && ga(b, N(b, "Month") + h * d), e && a.updateOffset(b, g || h));
  }function kb(a, b) {
    var c = a || Ka(),
        d = Sa(c, this).startOf("day"),
        e = this.diff(d, "days", !0),
        f = -6 > e ? "sameElse" : -1 > e ? "lastWeek" : 0 > e ? "lastDay" : 1 > e ? "sameDay" : 2 > e ? "nextDay" : 7 > e ? "nextWeek" : "sameElse",
        g = b && (w(b[f]) ? b[f]() : b[f]);return this.format(g || this.localeData().calendar(f, this, Ka(c)));
  }function lb() {
    return new o(this);
  }function mb(a, b) {
    var c = p(a) ? a : Ka(a);return this.isValid() && c.isValid() ? (b = K(m(b) ? "millisecond" : b), "millisecond" === b ? this.valueOf() > c.valueOf() : c.valueOf() < this.clone().startOf(b).valueOf()) : !1;
  }function nb(a, b) {
    var c = p(a) ? a : Ka(a);return this.isValid() && c.isValid() ? (b = K(m(b) ? "millisecond" : b), "millisecond" === b ? this.valueOf() < c.valueOf() : this.clone().endOf(b).valueOf() < c.valueOf()) : !1;
  }function ob(a, b, c, d) {
    return d = d || "()", ("(" === d[0] ? this.isAfter(a, c) : !this.isBefore(a, c)) && (")" === d[1] ? this.isBefore(b, c) : !this.isAfter(b, c));
  }function pb(a, b) {
    var c,
        d = p(a) ? a : Ka(a);return this.isValid() && d.isValid() ? (b = K(b || "millisecond"), "millisecond" === b ? this.valueOf() === d.valueOf() : (c = d.valueOf(), this.clone().startOf(b).valueOf() <= c && c <= this.clone().endOf(b).valueOf())) : !1;
  }function qb(a, b) {
    return this.isSame(a, b) || this.isAfter(a, b);
  }function rb(a, b) {
    return this.isSame(a, b) || this.isBefore(a, b);
  }function sb(a, b, c) {
    var d, e, f, g;return this.isValid() ? (d = Sa(a, this), d.isValid() ? (e = 6e4 * (d.utcOffset() - this.utcOffset()), b = K(b), "year" === b || "month" === b || "quarter" === b ? (g = tb(this, d), "quarter" === b ? g /= 3 : "year" === b && (g /= 12)) : (f = this - d, g = "second" === b ? f / 1e3 : "minute" === b ? f / 6e4 : "hour" === b ? f / 36e5 : "day" === b ? (f - e) / 864e5 : "week" === b ? (f - e) / 6048e5 : f), c ? g : q(g)) : NaN) : NaN;
  }function tb(a, b) {
    var c,
        d,
        e = 12 * (b.year() - a.year()) + (b.month() - a.month()),
        f = a.clone().add(e, "months");return 0 > b - f ? (c = a.clone().add(e - 1, "months"), d = (b - f) / (f - c)) : (c = a.clone().add(e + 1, "months"), d = (b - f) / (c - f)), -(e + d) || 0;
  }function ub() {
    return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
  }function vb() {
    var a = this.clone().utc();return 0 < a.year() && a.year() <= 9999 ? w(Date.prototype.toISOString) ? this.toDate().toISOString() : U(a, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]") : U(a, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
  }function wb(b) {
    b || (b = this.isUtc() ? a.defaultFormatUtc : a.defaultFormat);var c = U(this, b);return this.localeData().postformat(c);
  }function xb(a, b) {
    return this.isValid() && (p(a) && a.isValid() || Ka(a).isValid()) ? db({ to: this, from: a }).locale(this.locale()).humanize(!b) : this.localeData().invalidDate();
  }function yb(a) {
    return this.from(Ka(), a);
  }function zb(a, b) {
    return this.isValid() && (p(a) && a.isValid() || Ka(a).isValid()) ? db({ from: this, to: a }).locale(this.locale()).humanize(!b) : this.localeData().invalidDate();
  }function Ab(a) {
    return this.to(Ka(), a);
  }function Bb(a) {
    var b;return void 0 === a ? this._locale._abbr : (b = H(a), null != b && (this._locale = b), this);
  }function Cb() {
    return this._locale;
  }function Db(a) {
    switch (a = K(a)) {case "year":
        this.month(0);case "quarter":case "month":
        this.date(1);case "week":case "isoWeek":case "day":case "date":
        this.hours(0);case "hour":
        this.minutes(0);case "minute":
        this.seconds(0);case "second":
        this.milliseconds(0);}return "week" === a && this.weekday(0), "isoWeek" === a && this.isoWeekday(1), "quarter" === a && this.month(3 * Math.floor(this.month() / 3)), this;
  }function Eb(a) {
    return a = K(a), void 0 === a || "millisecond" === a ? this : ("date" === a && (a = "day"), this.startOf(a).add(1, "isoWeek" === a ? "week" : a).subtract(1, "ms"));
  }function Fb() {
    return this._d.valueOf() - 6e4 * (this._offset || 0);
  }function Gb() {
    return Math.floor(this.valueOf() / 1e3);
  }function Hb() {
    return this._offset ? new Date(this.valueOf()) : this._d;
  }function Ib() {
    var a = this;return [a.year(), a.month(), a.date(), a.hour(), a.minute(), a.second(), a.millisecond()];
  }function Jb() {
    var a = this;return { years: a.year(), months: a.month(), date: a.date(), hours: a.hours(), minutes: a.minutes(), seconds: a.seconds(), milliseconds: a.milliseconds() };
  }function Kb() {
    return this.isValid() ? this.toISOString() : null;
  }function Lb() {
    return k(this);
  }function Mb() {
    return g({}, j(this));
  }function Nb() {
    return j(this).overflow;
  }function Ob() {
    return { input: this._i, format: this._f, locale: this._locale, isUTC: this._isUTC, strict: this._strict };
  }function Pb(a, b) {
    R(0, [a, a.length], 0, b);
  }function Qb(a) {
    return Ub.call(this, a, this.week(), this.weekday(), this.localeData()._week.dow, this.localeData()._week.doy);
  }function Rb(a) {
    return Ub.call(this, a, this.isoWeek(), this.isoWeekday(), 1, 4);
  }function Sb() {
    return xa(this.year(), 1, 4);
  }function Tb() {
    var a = this.localeData()._week;return xa(this.year(), a.dow, a.doy);
  }function Ub(a, b, c, d, e) {
    var f;return null == a ? wa(this, d, e).year : (f = xa(a, d, e), b > f && (b = f), Vb.call(this, a, b, c, d, e));
  }function Vb(a, b, c, d, e) {
    var f = va(a, b, c, d, e),
        g = qa(f.year, 0, f.dayOfYear);return this.year(g.getUTCFullYear()), this.month(g.getUTCMonth()), this.date(g.getUTCDate()), this;
  }function Wb(a) {
    return null == a ? Math.ceil((this.month() + 1) / 3) : this.month(3 * (a - 1) + this.month() % 3);
  }function Xb(a) {
    return wa(a, this._week.dow, this._week.doy).week;
  }function Yb() {
    return this._week.dow;
  }function Zb() {
    return this._week.doy;
  }function $b(a) {
    var b = this.localeData().week(this);return null == a ? b : this.add(7 * (a - b), "d");
  }function _b(a) {
    var b = wa(this, 1, 4).week;return null == a ? b : this.add(7 * (a - b), "d");
  }function ac(a, b) {
    return "string" != typeof a ? a : isNaN(a) ? (a = b.weekdaysParse(a), "number" == typeof a ? a : null) : parseInt(a, 10);
  }function bc(a, b) {
    return c(this._weekdays) ? this._weekdays[a.day()] : this._weekdays[this._weekdays.isFormat.test(b) ? "format" : "standalone"][a.day()];
  }function cc(a) {
    return this._weekdaysShort[a.day()];
  }function dc(a) {
    return this._weekdaysMin[a.day()];
  }function ec(a, b, c) {
    var d,
        e,
        f,
        g = a.toLocaleLowerCase();if (!this._weekdaysParse) for (this._weekdaysParse = [], this._shortWeekdaysParse = [], this._minWeekdaysParse = [], d = 0; 7 > d; ++d) {
      f = h([2e3, 1]).day(d), this._minWeekdaysParse[d] = this.weekdaysMin(f, "").toLocaleLowerCase(), this._shortWeekdaysParse[d] = this.weekdaysShort(f, "").toLocaleLowerCase(), this._weekdaysParse[d] = this.weekdays(f, "").toLocaleLowerCase();
    }return c ? "dddd" === b ? (e = md.call(this._weekdaysParse, g), -1 !== e ? e : null) : "ddd" === b ? (e = md.call(this._shortWeekdaysParse, g), -1 !== e ? e : null) : (e = md.call(this._minWeekdaysParse, g), -1 !== e ? e : null) : "dddd" === b ? (e = md.call(this._weekdaysParse, g), -1 !== e ? e : (e = md.call(this._shortWeekdaysParse, g), -1 !== e ? e : (e = md.call(this._minWeekdaysParse, g), -1 !== e ? e : null))) : "ddd" === b ? (e = md.call(this._shortWeekdaysParse, g), -1 !== e ? e : (e = md.call(this._weekdaysParse, g), -1 !== e ? e : (e = md.call(this._minWeekdaysParse, g), -1 !== e ? e : null))) : (e = md.call(this._minWeekdaysParse, g), -1 !== e ? e : (e = md.call(this._weekdaysParse, g), -1 !== e ? e : (e = md.call(this._shortWeekdaysParse, g), -1 !== e ? e : null)));
  }function fc(a, b, c) {
    var d, e, f;if (this._weekdaysParseExact) return ec.call(this, a, b, c);for (this._weekdaysParse || (this._weekdaysParse = [], this._minWeekdaysParse = [], this._shortWeekdaysParse = [], this._fullWeekdaysParse = []), d = 0; 7 > d; d++) {
      if (e = h([2e3, 1]).day(d), c && !this._fullWeekdaysParse[d] && (this._fullWeekdaysParse[d] = new RegExp("^" + this.weekdays(e, "").replace(".", ".?") + "$", "i"), this._shortWeekdaysParse[d] = new RegExp("^" + this.weekdaysShort(e, "").replace(".", ".?") + "$", "i"), this._minWeekdaysParse[d] = new RegExp("^" + this.weekdaysMin(e, "").replace(".", ".?") + "$", "i")), this._weekdaysParse[d] || (f = "^" + this.weekdays(e, "") + "|^" + this.weekdaysShort(e, "") + "|^" + this.weekdaysMin(e, ""), this._weekdaysParse[d] = new RegExp(f.replace(".", ""), "i")), c && "dddd" === b && this._fullWeekdaysParse[d].test(a)) return d;if (c && "ddd" === b && this._shortWeekdaysParse[d].test(a)) return d;if (c && "dd" === b && this._minWeekdaysParse[d].test(a)) return d;if (!c && this._weekdaysParse[d].test(a)) return d;
    }
  }function gc(a) {
    if (!this.isValid()) return null != a ? this : NaN;var b = this._isUTC ? this._d.getUTCDay() : this._d.getDay();return null != a ? (a = ac(a, this.localeData()), this.add(a - b, "d")) : b;
  }function hc(a) {
    if (!this.isValid()) return null != a ? this : NaN;var b = (this.day() + 7 - this.localeData()._week.dow) % 7;return null == a ? b : this.add(a - b, "d");
  }function ic(a) {
    return this.isValid() ? null == a ? this.day() || 7 : this.day(this.day() % 7 ? a : a - 7) : null != a ? this : NaN;
  }function jc(a) {
    return this._weekdaysParseExact ? (f(this, "_weekdaysRegex") || mc.call(this), a ? this._weekdaysStrictRegex : this._weekdaysRegex) : this._weekdaysStrictRegex && a ? this._weekdaysStrictRegex : this._weekdaysRegex;
  }function kc(a) {
    return this._weekdaysParseExact ? (f(this, "_weekdaysRegex") || mc.call(this), a ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex) : this._weekdaysShortStrictRegex && a ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
  }function lc(a) {
    return this._weekdaysParseExact ? (f(this, "_weekdaysRegex") || mc.call(this), a ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex) : this._weekdaysMinStrictRegex && a ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
  }function mc() {
    function a(a, b) {
      return b.length - a.length;
    }var b,
        c,
        d,
        e,
        f,
        g = [],
        i = [],
        j = [],
        k = [];for (b = 0; 7 > b; b++) {
      c = h([2e3, 1]).day(b), d = this.weekdaysMin(c, ""), e = this.weekdaysShort(c, ""), f = this.weekdays(c, ""), g.push(d), i.push(e), j.push(f), k.push(d), k.push(e), k.push(f);
    }for (g.sort(a), i.sort(a), j.sort(a), k.sort(a), b = 0; 7 > b; b++) {
      i[b] = Z(i[b]), j[b] = Z(j[b]), k[b] = Z(k[b]);
    }this._weekdaysRegex = new RegExp("^(" + k.join("|") + ")", "i"), this._weekdaysShortRegex = this._weekdaysRegex, this._weekdaysMinRegex = this._weekdaysRegex, this._weekdaysStrictRegex = new RegExp("^(" + j.join("|") + ")", "i"), this._weekdaysShortStrictRegex = new RegExp("^(" + i.join("|") + ")", "i"), this._weekdaysMinStrictRegex = new RegExp("^(" + g.join("|") + ")", "i");
  }function nc(a) {
    var b = Math.round((this.clone().startOf("day") - this.clone().startOf("year")) / 864e5) + 1;return null == a ? b : this.add(a - b, "d");
  }function oc() {
    return this.hours() % 12 || 12;
  }function pc() {
    return this.hours() || 24;
  }function qc(a, b) {
    R(a, 0, 0, function () {
      return this.localeData().meridiem(this.hours(), this.minutes(), b);
    });
  }function rc(a, b) {
    return b._meridiemParse;
  }function sc(a) {
    return "p" === (a + "").toLowerCase().charAt(0);
  }function tc(a, b, c) {
    return a > 11 ? c ? "pm" : "PM" : c ? "am" : "AM";
  }function uc(a, b) {
    b[Sd] = r(1e3 * ("0." + a));
  }function vc() {
    return this._isUTC ? "UTC" : "";
  }function wc() {
    return this._isUTC ? "Coordinated Universal Time" : "";
  }function xc(a) {
    return Ka(1e3 * a);
  }function yc() {
    return Ka.apply(null, arguments).parseZone();
  }function zc(a, b, c) {
    var d = this._calendar[a];return w(d) ? d.call(b, c) : d;
  }function Ac(a) {
    var b = this._longDateFormat[a],
        c = this._longDateFormat[a.toUpperCase()];return b || !c ? b : (this._longDateFormat[a] = c.replace(/MMMM|MM|DD|dddd/g, function (a) {
      return a.slice(1);
    }), this._longDateFormat[a]);
  }function Bc() {
    return this._invalidDate;
  }function Cc(a) {
    return this._ordinal.replace("%d", a);
  }function Dc(a) {
    return a;
  }function Ec(a, b, c, d) {
    var e = this._relativeTime[c];return w(e) ? e(a, b, c, d) : e.replace(/%d/i, a);
  }function Fc(a, b) {
    var c = this._relativeTime[a > 0 ? "future" : "past"];return w(c) ? c(b) : c.replace(/%s/i, b);
  }function Gc(a, b, c, d) {
    var e = H(),
        f = h().set(d, b);return e[c](f, a);
  }function Hc(a, b, c) {
    if ("number" == typeof a && (b = a, a = void 0), a = a || "", null != b) return Gc(a, b, c, "month");var d,
        e = [];for (d = 0; 12 > d; d++) {
      e[d] = Gc(a, d, c, "month");
    }return e;
  }function Ic(a, b, c, d) {
    "boolean" == typeof a ? ("number" == typeof b && (c = b, b = void 0), b = b || "") : (b = a, c = b, a = !1, "number" == typeof b && (c = b, b = void 0), b = b || "");var e = H(),
        f = a ? e._week.dow : 0;if (null != c) return Gc(b, (c + f) % 7, d, "day");var g,
        h = [];for (g = 0; 7 > g; g++) {
      h[g] = Gc(b, (g + f) % 7, d, "day");
    }return h;
  }function Jc(a, b) {
    return Hc(a, b, "months");
  }function Kc(a, b) {
    return Hc(a, b, "monthsShort");
  }function Lc(a, b, c) {
    return Ic(a, b, c, "weekdays");
  }function Mc(a, b, c) {
    return Ic(a, b, c, "weekdaysShort");
  }function Nc(a, b, c) {
    return Ic(a, b, c, "weekdaysMin");
  }function Oc() {
    var a = this._data;return this._milliseconds = Le(this._milliseconds), this._days = Le(this._days), this._months = Le(this._months), a.milliseconds = Le(a.milliseconds), a.seconds = Le(a.seconds), a.minutes = Le(a.minutes), a.hours = Le(a.hours), a.months = Le(a.months), a.years = Le(a.years), this;
  }function Pc(a, b, c, d) {
    var e = db(b, c);return a._milliseconds += d * e._milliseconds, a._days += d * e._days, a._months += d * e._months, a._bubble();
  }function Qc(a, b) {
    return Pc(this, a, b, 1);
  }function Rc(a, b) {
    return Pc(this, a, b, -1);
  }function Sc(a) {
    return 0 > a ? Math.floor(a) : Math.ceil(a);
  }function Tc() {
    var a,
        b,
        c,
        d,
        e,
        f = this._milliseconds,
        g = this._days,
        h = this._months,
        i = this._data;return f >= 0 && g >= 0 && h >= 0 || 0 >= f && 0 >= g && 0 >= h || (f += 864e5 * Sc(Vc(h) + g), g = 0, h = 0), i.milliseconds = f % 1e3, a = q(f / 1e3), i.seconds = a % 60, b = q(a / 60), i.minutes = b % 60, c = q(b / 60), i.hours = c % 24, g += q(c / 24), e = q(Uc(g)), h += e, g -= Sc(Vc(e)), d = q(h / 12), h %= 12, i.days = g, i.months = h, i.years = d, this;
  }function Uc(a) {
    return 4800 * a / 146097;
  }function Vc(a) {
    return 146097 * a / 4800;
  }function Wc(a) {
    var b,
        c,
        d = this._milliseconds;if (a = K(a), "month" === a || "year" === a) return b = this._days + d / 864e5, c = this._months + Uc(b), "month" === a ? c : c / 12;switch (b = this._days + Math.round(Vc(this._months)), a) {case "week":
        return b / 7 + d / 6048e5;case "day":
        return b + d / 864e5;case "hour":
        return 24 * b + d / 36e5;case "minute":
        return 1440 * b + d / 6e4;case "second":
        return 86400 * b + d / 1e3;case "millisecond":
        return Math.floor(864e5 * b) + d;default:
        throw new Error("Unknown unit " + a);}
  }function Xc() {
    return this._milliseconds + 864e5 * this._days + this._months % 12 * 2592e6 + 31536e6 * r(this._months / 12);
  }function Yc(a) {
    return function () {
      return this.as(a);
    };
  }function Zc(a) {
    return a = K(a), this[a + "s"]();
  }function $c(a) {
    return function () {
      return this._data[a];
    };
  }function _c() {
    return q(this.days() / 7);
  }function ad(a, b, c, d, e) {
    return e.relativeTime(b || 1, !!c, a, d);
  }function bd(a, b, c) {
    var d = db(a).abs(),
        e = _e(d.as("s")),
        f = _e(d.as("m")),
        g = _e(d.as("h")),
        h = _e(d.as("d")),
        i = _e(d.as("M")),
        j = _e(d.as("y")),
        k = e < af.s && ["s", e] || 1 >= f && ["m"] || f < af.m && ["mm", f] || 1 >= g && ["h"] || g < af.h && ["hh", g] || 1 >= h && ["d"] || h < af.d && ["dd", h] || 1 >= i && ["M"] || i < af.M && ["MM", i] || 1 >= j && ["y"] || ["yy", j];return k[2] = b, k[3] = +a > 0, k[4] = c, ad.apply(null, k);
  }function cd(a, b) {
    return void 0 === af[a] ? !1 : void 0 === b ? af[a] : (af[a] = b, !0);
  }function dd(a) {
    var b = this.localeData(),
        c = bd(this, !a, b);return a && (c = b.pastFuture(+this, c)), b.postformat(c);
  }function ed() {
    var a,
        b,
        c,
        d = bf(this._milliseconds) / 1e3,
        e = bf(this._days),
        f = bf(this._months);a = q(d / 60), b = q(a / 60), d %= 60, a %= 60, c = q(f / 12), f %= 12;var g = c,
        h = f,
        i = e,
        j = b,
        k = a,
        l = d,
        m = this.asSeconds();return m ? (0 > m ? "-" : "") + "P" + (g ? g + "Y" : "") + (h ? h + "M" : "") + (i ? i + "D" : "") + (j || k || l ? "T" : "") + (j ? j + "H" : "") + (k ? k + "M" : "") + (l ? l + "S" : "") : "P0D";
  }var fd, gd;gd = Array.prototype.some ? Array.prototype.some : function (a) {
    for (var b = Object(this), c = b.length >>> 0, d = 0; c > d; d++) {
      if (d in b && a.call(this, b[d], d, b)) return !0;
    }return !1;
  };var hd = a.momentProperties = [],
      id = !1,
      jd = {};a.suppressDeprecationWarnings = !1, a.deprecationHandler = null;var kd;kd = Object.keys ? Object.keys : function (a) {
    var b,
        c = [];for (b in a) {
      f(a, b) && c.push(b);
    }return c;
  };var ld,
      md,
      nd = {},
      od = {},
      pd = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
      qd = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
      rd = {},
      sd = {},
      td = /\d/,
      ud = /\d\d/,
      vd = /\d{3}/,
      wd = /\d{4}/,
      xd = /[+-]?\d{6}/,
      yd = /\d\d?/,
      zd = /\d\d\d\d?/,
      Ad = /\d\d\d\d\d\d?/,
      Bd = /\d{1,3}/,
      Cd = /\d{1,4}/,
      Dd = /[+-]?\d{1,6}/,
      Ed = /\d+/,
      Fd = /[+-]?\d+/,
      Gd = /Z|[+-]\d\d:?\d\d/gi,
      Hd = /Z|[+-]\d\d(?::?\d\d)?/gi,
      Id = /[+-]?\d+(\.\d{1,3})?/,
      Jd = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,
      Kd = {},
      Ld = {},
      Md = 0,
      Nd = 1,
      Od = 2,
      Pd = 3,
      Qd = 4,
      Rd = 5,
      Sd = 6,
      Td = 7,
      Ud = 8;md = Array.prototype.indexOf ? Array.prototype.indexOf : function (a) {
    var b;for (b = 0; b < this.length; ++b) {
      if (this[b] === a) return b;
    }return -1;
  }, R("M", ["MM", 2], "Mo", function () {
    return this.month() + 1;
  }), R("MMM", 0, 0, function (a) {
    return this.localeData().monthsShort(this, a);
  }), R("MMMM", 0, 0, function (a) {
    return this.localeData().months(this, a);
  }), J("month", "M"), W("M", yd), W("MM", yd, ud), W("MMM", function (a, b) {
    return b.monthsShortRegex(a);
  }), W("MMMM", function (a, b) {
    return b.monthsRegex(a);
  }), $(["M", "MM"], function (a, b) {
    b[Nd] = r(a) - 1;
  }), $(["MMM", "MMMM"], function (a, b, c, d) {
    var e = c._locale.monthsParse(a, d, c._strict);null != e ? b[Nd] = e : j(c).invalidMonth = a;
  });var Vd = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/,
      Wd = "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
      Xd = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
      Yd = Jd,
      Zd = Jd,
      $d = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/,
      _d = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/,
      ae = /Z|[+-]\d\d(?::?\d\d)?/,
      be = [["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/], ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/], ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/], ["GGGG-[W]WW", /\d{4}-W\d\d/, !1], ["YYYY-DDD", /\d{4}-\d{3}/], ["YYYY-MM", /\d{4}-\d\d/, !1], ["YYYYYYMMDD", /[+-]\d{10}/], ["YYYYMMDD", /\d{8}/], ["GGGG[W]WWE", /\d{4}W\d{3}/], ["GGGG[W]WW", /\d{4}W\d{2}/, !1], ["YYYYDDD", /\d{7}/]],
      ce = [["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/], ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/], ["HH:mm:ss", /\d\d:\d\d:\d\d/], ["HH:mm", /\d\d:\d\d/], ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/], ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/], ["HHmmss", /\d\d\d\d\d\d/], ["HHmm", /\d\d\d\d/], ["HH", /\d\d/]],
      de = /^\/?Date\((\-?\d+)/i;a.createFromInputFallback = u("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.", function (a) {
    a._d = new Date(a._i + (a._useUTC ? " UTC" : ""));
  }), R("Y", 0, 0, function () {
    var a = this.year();return 9999 >= a ? "" + a : "+" + a;
  }), R(0, ["YY", 2], 0, function () {
    return this.year() % 100;
  }), R(0, ["YYYY", 4], 0, "year"), R(0, ["YYYYY", 5], 0, "year"), R(0, ["YYYYYY", 6, !0], 0, "year"), J("year", "y"), W("Y", Fd), W("YY", yd, ud), W("YYYY", Cd, wd), W("YYYYY", Dd, xd), W("YYYYYY", Dd, xd), $(["YYYYY", "YYYYYY"], Md), $("YYYY", function (b, c) {
    c[Md] = 2 === b.length ? a.parseTwoDigitYear(b) : r(b);
  }), $("YY", function (b, c) {
    c[Md] = a.parseTwoDigitYear(b);
  }), $("Y", function (a, b) {
    b[Md] = parseInt(a, 10);
  }), a.parseTwoDigitYear = function (a) {
    return r(a) + (r(a) > 68 ? 1900 : 2e3);
  };var ee = M("FullYear", !0);a.ISO_8601 = function () {};var fe = u("moment().min is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548", function () {
    var a = Ka.apply(null, arguments);return this.isValid() && a.isValid() ? this > a ? this : a : l();
  }),
      ge = u("moment().max is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548", function () {
    var a = Ka.apply(null, arguments);return this.isValid() && a.isValid() ? a > this ? this : a : l();
  }),
      he = function he() {
    return Date.now ? Date.now() : +new Date();
  };Qa("Z", ":"), Qa("ZZ", ""), W("Z", Hd), W("ZZ", Hd), $(["Z", "ZZ"], function (a, b, c) {
    c._useUTC = !0, c._tzm = Ra(Hd, a);
  });var ie = /([\+\-]|\d\d)/gi;a.updateOffset = function () {};var je = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?\d*)?$/,
      ke = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;db.fn = Oa.prototype;var le = ib(1, "add"),
      me = ib(-1, "subtract");a.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ", a.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]";var ne = u("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.", function (a) {
    return void 0 === a ? this.localeData() : this.locale(a);
  });R(0, ["gg", 2], 0, function () {
    return this.weekYear() % 100;
  }), R(0, ["GG", 2], 0, function () {
    return this.isoWeekYear() % 100;
  }), Pb("gggg", "weekYear"), Pb("ggggg", "weekYear"), Pb("GGGG", "isoWeekYear"), Pb("GGGGG", "isoWeekYear"), J("weekYear", "gg"), J("isoWeekYear", "GG"), W("G", Fd), W("g", Fd), W("GG", yd, ud), W("gg", yd, ud), W("GGGG", Cd, wd), W("gggg", Cd, wd), W("GGGGG", Dd, xd), W("ggggg", Dd, xd), _(["gggg", "ggggg", "GGGG", "GGGGG"], function (a, b, c, d) {
    b[d.substr(0, 2)] = r(a);
  }), _(["gg", "GG"], function (b, c, d, e) {
    c[e] = a.parseTwoDigitYear(b);
  }), R("Q", 0, "Qo", "quarter"), J("quarter", "Q"), W("Q", td), $("Q", function (a, b) {
    b[Nd] = 3 * (r(a) - 1);
  }), R("w", ["ww", 2], "wo", "week"), R("W", ["WW", 2], "Wo", "isoWeek"), J("week", "w"), J("isoWeek", "W"), W("w", yd), W("ww", yd, ud), W("W", yd), W("WW", yd, ud), _(["w", "ww", "W", "WW"], function (a, b, c, d) {
    b[d.substr(0, 1)] = r(a);
  });var oe = { dow: 0, doy: 6 };R("D", ["DD", 2], "Do", "date"), J("date", "D"), W("D", yd), W("DD", yd, ud), W("Do", function (a, b) {
    return a ? b._ordinalParse : b._ordinalParseLenient;
  }), $(["D", "DD"], Od), $("Do", function (a, b) {
    b[Od] = r(a.match(yd)[0], 10);
  });var pe = M("Date", !0);R("d", 0, "do", "day"), R("dd", 0, 0, function (a) {
    return this.localeData().weekdaysMin(this, a);
  }), R("ddd", 0, 0, function (a) {
    return this.localeData().weekdaysShort(this, a);
  }), R("dddd", 0, 0, function (a) {
    return this.localeData().weekdays(this, a);
  }), R("e", 0, 0, "weekday"), R("E", 0, 0, "isoWeekday"), J("day", "d"), J("weekday", "e"), J("isoWeekday", "E"), W("d", yd), W("e", yd), W("E", yd), W("dd", function (a, b) {
    return b.weekdaysMinRegex(a);
  }), W("ddd", function (a, b) {
    return b.weekdaysShortRegex(a);
  }), W("dddd", function (a, b) {
    return b.weekdaysRegex(a);
  }), _(["dd", "ddd", "dddd"], function (a, b, c, d) {
    var e = c._locale.weekdaysParse(a, d, c._strict);null != e ? b.d = e : j(c).invalidWeekday = a;
  }), _(["d", "e", "E"], function (a, b, c, d) {
    b[d] = r(a);
  });var qe = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
      re = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
      se = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
      te = Jd,
      ue = Jd,
      ve = Jd;R("DDD", ["DDDD", 3], "DDDo", "dayOfYear"), J("dayOfYear", "DDD"), W("DDD", Bd), W("DDDD", vd), $(["DDD", "DDDD"], function (a, b, c) {
    c._dayOfYear = r(a);
  }), R("H", ["HH", 2], 0, "hour"), R("h", ["hh", 2], 0, oc), R("k", ["kk", 2], 0, pc), R("hmm", 0, 0, function () {
    return "" + oc.apply(this) + Q(this.minutes(), 2);
  }), R("hmmss", 0, 0, function () {
    return "" + oc.apply(this) + Q(this.minutes(), 2) + Q(this.seconds(), 2);
  }), R("Hmm", 0, 0, function () {
    return "" + this.hours() + Q(this.minutes(), 2);
  }), R("Hmmss", 0, 0, function () {
    return "" + this.hours() + Q(this.minutes(), 2) + Q(this.seconds(), 2);
  }), qc("a", !0), qc("A", !1), J("hour", "h"), W("a", rc), W("A", rc), W("H", yd), W("h", yd), W("HH", yd, ud), W("hh", yd, ud), W("hmm", zd), W("hmmss", Ad), W("Hmm", zd), W("Hmmss", Ad), $(["H", "HH"], Pd), $(["a", "A"], function (a, b, c) {
    c._isPm = c._locale.isPM(a), c._meridiem = a;
  }), $(["h", "hh"], function (a, b, c) {
    b[Pd] = r(a), j(c).bigHour = !0;
  }), $("hmm", function (a, b, c) {
    var d = a.length - 2;b[Pd] = r(a.substr(0, d)), b[Qd] = r(a.substr(d)), j(c).bigHour = !0;
  }), $("hmmss", function (a, b, c) {
    var d = a.length - 4,
        e = a.length - 2;b[Pd] = r(a.substr(0, d)), b[Qd] = r(a.substr(d, 2)), b[Rd] = r(a.substr(e)), j(c).bigHour = !0;
  }), $("Hmm", function (a, b, c) {
    var d = a.length - 2;b[Pd] = r(a.substr(0, d)), b[Qd] = r(a.substr(d));
  }), $("Hmmss", function (a, b, c) {
    var d = a.length - 4,
        e = a.length - 2;b[Pd] = r(a.substr(0, d)), b[Qd] = r(a.substr(d, 2)), b[Rd] = r(a.substr(e));
  });var we = /[ap]\.?m?\.?/i,
      xe = M("Hours", !0);R("m", ["mm", 2], 0, "minute"), J("minute", "m"), W("m", yd), W("mm", yd, ud), $(["m", "mm"], Qd);var ye = M("Minutes", !1);R("s", ["ss", 2], 0, "second"), J("second", "s"), W("s", yd), W("ss", yd, ud), $(["s", "ss"], Rd);var ze = M("Seconds", !1);R("S", 0, 0, function () {
    return ~~(this.millisecond() / 100);
  }), R(0, ["SS", 2], 0, function () {
    return ~~(this.millisecond() / 10);
  }), R(0, ["SSS", 3], 0, "millisecond"), R(0, ["SSSS", 4], 0, function () {
    return 10 * this.millisecond();
  }), R(0, ["SSSSS", 5], 0, function () {
    return 100 * this.millisecond();
  }), R(0, ["SSSSSS", 6], 0, function () {
    return 1e3 * this.millisecond();
  }), R(0, ["SSSSSSS", 7], 0, function () {
    return 1e4 * this.millisecond();
  }), R(0, ["SSSSSSSS", 8], 0, function () {
    return 1e5 * this.millisecond();
  }), R(0, ["SSSSSSSSS", 9], 0, function () {
    return 1e6 * this.millisecond();
  }), J("millisecond", "ms"), W("S", Bd, td), W("SS", Bd, ud), W("SSS", Bd, vd);var Ae;for (Ae = "SSSS"; Ae.length <= 9; Ae += "S") {
    W(Ae, Ed);
  }for (Ae = "S"; Ae.length <= 9; Ae += "S") {
    $(Ae, uc);
  }var Be = M("Milliseconds", !1);R("z", 0, 0, "zoneAbbr"), R("zz", 0, 0, "zoneName");var Ce = o.prototype;Ce.add = le, Ce.calendar = kb, Ce.clone = lb, Ce.diff = sb, Ce.endOf = Eb, Ce.format = wb, Ce.from = xb, Ce.fromNow = yb, Ce.to = zb, Ce.toNow = Ab, Ce.get = P, Ce.invalidAt = Nb, Ce.isAfter = mb, Ce.isBefore = nb, Ce.isBetween = ob, Ce.isSame = pb, Ce.isSameOrAfter = qb, Ce.isSameOrBefore = rb, Ce.isValid = Lb, Ce.lang = ne, Ce.locale = Bb, Ce.localeData = Cb, Ce.max = ge, Ce.min = fe, Ce.parsingFlags = Mb, Ce.set = P, Ce.startOf = Db, Ce.subtract = me, Ce.toArray = Ib, Ce.toObject = Jb, Ce.toDate = Hb, Ce.toISOString = vb, Ce.toJSON = Kb, Ce.toString = ub, Ce.unix = Gb, Ce.valueOf = Fb, Ce.creationData = Ob, Ce.year = ee, Ce.isLeapYear = ta, Ce.weekYear = Qb, Ce.isoWeekYear = Rb, Ce.quarter = Ce.quarters = Wb, Ce.month = ha, Ce.daysInMonth = ia, Ce.week = Ce.weeks = $b, Ce.isoWeek = Ce.isoWeeks = _b, Ce.weeksInYear = Tb, Ce.isoWeeksInYear = Sb, Ce.date = pe, Ce.day = Ce.days = gc, Ce.weekday = hc, Ce.isoWeekday = ic, Ce.dayOfYear = nc, Ce.hour = Ce.hours = xe, Ce.minute = Ce.minutes = ye, Ce.second = Ce.seconds = ze, Ce.millisecond = Ce.milliseconds = Be, Ce.utcOffset = Ua, Ce.utc = Wa, Ce.local = Xa, Ce.parseZone = Ya, Ce.hasAlignedHourOffset = Za, Ce.isDST = $a, Ce.isDSTShifted = _a, Ce.isLocal = ab, Ce.isUtcOffset = bb, Ce.isUtc = cb, Ce.isUTC = cb, Ce.zoneAbbr = vc, Ce.zoneName = wc, Ce.dates = u("dates accessor is deprecated. Use date instead.", pe), Ce.months = u("months accessor is deprecated. Use month instead", ha), Ce.years = u("years accessor is deprecated. Use year instead", ee), Ce.zone = u("moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779", Va);var De = Ce,
      Ee = { sameDay: "[Today at] LT", nextDay: "[Tomorrow at] LT", nextWeek: "dddd [at] LT", lastDay: "[Yesterday at] LT", lastWeek: "[Last] dddd [at] LT", sameElse: "L" },
      Fe = { LTS: "h:mm:ss A", LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D, YYYY", LLL: "MMMM D, YYYY h:mm A", LLLL: "dddd, MMMM D, YYYY h:mm A" },
      Ge = "Invalid date",
      He = "%d",
      Ie = /\d{1,2}/,
      Je = { future: "in %s", past: "%s ago", s: "a few seconds", m: "a minute", mm: "%d minutes", h: "an hour", hh: "%d hours", d: "a day", dd: "%d days", M: "a month", MM: "%d months", y: "a year", yy: "%d years" },
      Ke = A.prototype;Ke._calendar = Ee, Ke.calendar = zc, Ke._longDateFormat = Fe, Ke.longDateFormat = Ac, Ke._invalidDate = Ge, Ke.invalidDate = Bc, Ke._ordinal = He, Ke.ordinal = Cc, Ke._ordinalParse = Ie, Ke.preparse = Dc, Ke.postformat = Dc, Ke._relativeTime = Je, Ke.relativeTime = Ec, Ke.pastFuture = Fc, Ke.set = y, Ke.months = ca, Ke._months = Wd, Ke.monthsShort = da, Ke._monthsShort = Xd, Ke.monthsParse = fa, Ke._monthsRegex = Zd, Ke.monthsRegex = ka, Ke._monthsShortRegex = Yd, Ke.monthsShortRegex = ja, Ke.week = Xb, Ke._week = oe, Ke.firstDayOfYear = Zb, Ke.firstDayOfWeek = Yb, Ke.weekdays = bc, Ke._weekdays = qe, Ke.weekdaysMin = dc, Ke._weekdaysMin = se, Ke.weekdaysShort = cc, Ke._weekdaysShort = re, Ke.weekdaysParse = fc, Ke._weekdaysRegex = te, Ke.weekdaysRegex = jc, Ke._weekdaysShortRegex = ue, Ke.weekdaysShortRegex = kc, Ke._weekdaysMinRegex = ve, Ke.weekdaysMinRegex = lc, Ke.isPM = sc, Ke._meridiemParse = we, Ke.meridiem = tc, E("en", { ordinalParse: /\d{1,2}(th|st|nd|rd)/, ordinal: function ordinal(a) {
      var b = a % 10,
          c = 1 === r(a % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th";return a + c;
    } }), a.lang = u("moment.lang is deprecated. Use moment.locale instead.", E), a.langData = u("moment.langData is deprecated. Use moment.localeData instead.", H);var Le = Math.abs,
      Me = Yc("ms"),
      Ne = Yc("s"),
      Oe = Yc("m"),
      Pe = Yc("h"),
      Qe = Yc("d"),
      Re = Yc("w"),
      Se = Yc("M"),
      Te = Yc("y"),
      Ue = $c("milliseconds"),
      Ve = $c("seconds"),
      We = $c("minutes"),
      Xe = $c("hours"),
      Ye = $c("days"),
      Ze = $c("months"),
      $e = $c("years"),
      _e = Math.round,
      af = { s: 45, m: 45, h: 22, d: 26, M: 11 },
      bf = Math.abs,
      cf = Oa.prototype;cf.abs = Oc, cf.add = Qc, cf.subtract = Rc, cf.as = Wc, cf.asMilliseconds = Me, cf.asSeconds = Ne, cf.asMinutes = Oe, cf.asHours = Pe, cf.asDays = Qe, cf.asWeeks = Re, cf.asMonths = Se, cf.asYears = Te, cf.valueOf = Xc, cf._bubble = Tc, cf.get = Zc, cf.milliseconds = Ue, cf.seconds = Ve, cf.minutes = We, cf.hours = Xe, cf.days = Ye, cf.weeks = _c, cf.months = Ze, cf.years = $e, cf.humanize = dd, cf.toISOString = ed, cf.toString = ed, cf.toJSON = ed, cf.locale = Bb, cf.localeData = Cb, cf.toIsoString = u("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", ed), cf.lang = ne, R("X", 0, 0, "unix"), R("x", 0, 0, "valueOf"), W("x", Fd), W("X", Id), $("X", function (a, b, c) {
    c._d = new Date(1e3 * parseFloat(a, 10));
  }), $("x", function (a, b, c) {
    c._d = new Date(r(a));
  }), a.version = "2.13.0", b(Ka), a.fn = De, a.min = Ma, a.max = Na, a.now = he, a.utc = h, a.unix = xc, a.months = Jc, a.isDate = d, a.locale = E, a.invalid = l, a.duration = db, a.isMoment = p, a.weekdays = Lc, a.parseZone = yc, a.localeData = H, a.isDuration = Pa, a.monthsShort = Kc, a.weekdaysMin = Nc, a.defineLocale = F, a.updateLocale = G, a.locales = I, a.weekdaysShort = Mc, a.normalizeUnits = K, a.relativeTimeThreshold = cd, a.prototype = De;var df = a;return df;
});
'use strict';

function NotificationsService(serviceWorkerReg) {
    this.serviceWorkerReg = serviceWorkerReg;
    this.sub;
    this.uid;
}
NotificationsService.prototype.subscribe = function () {
    var _this = this;

    if (this.isSubscribed) {
        return;
    }
    this.serviceWorkerReg.pushManager.subscribe({ userVisibleOnly: true }).then(function (pushSubscription) {
        _this.sub = pushSubscription;
        _this.isSubscribed = true;
        _this._sendUIDToAPI();
    });
};
NotificationsService.prototype.unsubscribe = function () {
    var _this2 = this;

    if (!this.isSubscribed) {
        return;
    }
    this.sub.unsubscribe().then(function (event) {
        _this2.isSubscribed = false;
        console.log('Unsubscribed!', event);
    }).catch(function (error) {
        console.log('Error unsubscribing', error);
    });
};

NotificationsService.prototype._sendUIDToAPI = function () {
    this.uid = this.sub.endpoint.split('gcm/send/')[1];

    var info = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            uid: this.uid
        }
    };

    console.log(info);

    fetch('https://timigod-notify.herokuapp.com/uid', info).then(function (res) {
        return res.json();
    }).then(function (res) {
        console.log(res);
        if (res.errors) {
            return;
        }
        console.log("Succesfully added uid");
    });
};
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

undefined["MyApp"] = undefined["MyApp"] || {};
undefined["MyApp"]["templates"] = undefined["MyApp"]["templates"] || {};
undefined["MyApp"]["templates"]["article"] = Handlebars.template({ "1": function _(depth0, helpers, partials, data) {
        return " <span class=\"article__meta__category\">" + this.escapeExpression(this.lambda(depth0, depth0)) + "</span> ";
    }, "3": function _(depth0, helpers, partials, data) {
        return "btn-bookmark--bookmarked";
    }, "compiler": [6, ">= 2.0.0-beta.1"], "main": function main(depth0, helpers, partials, data) {
        var stack1,
            helper,
            alias1 = helpers.helperMissing,
            alias2 = "function",
            alias3 = this.escapeExpression;

        return "<div class=\"wrapper\">\n    <header class=\"article__header\">\n        <h2 class=\"article__title\">" + alias3((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1, (typeof helper === "undefined" ? "undefined" : _typeof(helper)) === alias2 ? helper.call(depth0, { "name": "title", "hash": {}, "data": data }) : helper)) + "</h2>\n\n        <i class=\"fa fa-clock-o\"></i>\n        <date class=\"article__meta\">" + alias3((helpers.moment || depth0 && depth0.moment || alias1).call(depth0, depth0 != null ? depth0.pubDate : depth0, { "name": "moment", "hash": {}, "data": data })) + "</date>\n        <br>\n        <i class=\"fa fa-tags\"></i>\n        <span class=\"article__meta\">\n            " + ((stack1 = helpers.each.call(depth0, depth0 != null ? depth0.categories : depth0, { "name": "each", "hash": {}, "fn": this.program(1, data, 0), "inverse": this.noop, "data": data })) != null ? stack1 : "") + "\n        </span>\n    </header>\n    <div class=\"article__content\">\n        " + ((stack1 = (helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : alias1, (typeof helper === "undefined" ? "undefined" : _typeof(helper)) === alias2 ? helper.call(depth0, { "name": "content", "hash": {}, "data": data }) : helper)) != null ? stack1 : "") + "\n    </div>\n    <footer class=\"article__footer\">\n\n        <a href=\"https://twitter.com/intent/tweet/?text='" + alias3((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1, (typeof helper === "undefined" ? "undefined" : _typeof(helper)) === alias2 ? helper.call(depth0, { "name": "title", "hash": {}, "data": data }) : helper)) + "'%20from%20bitsofco.de&url=" + alias3((helper = (helper = helpers.link || (depth0 != null ? depth0.link : depth0)) != null ? helper : alias1, (typeof helper === "undefined" ? "undefined" : _typeof(helper)) === alias2 ? helper.call(depth0, { "name": "link", "hash": {}, "data": data }) : helper)) + "&via=IreAderinokun\"\n           class=\"btn btn-large btn-share-twitter\"\n           target=\"_blank\">\n            <i class=\"fa fa-twitter\"></i>\n            <span>Share on Twitter</span>\n        </a>\n\n        <button class=\"btn btn-white btn-large btn-bookmark " + ((stack1 = helpers['if'].call(depth0, depth0 != null ? depth0.isBookmarked : depth0, { "name": "if", "hash": {}, "fn": this.program(3, data, 0), "inverse": this.noop, "data": data })) != null ? stack1 : "") + "\"\n                data-guid=\"" + alias3((helper = (helper = helpers.guid || (depth0 != null ? depth0.guid : depth0)) != null ? helper : alias1, (typeof helper === "undefined" ? "undefined" : _typeof(helper)) === alias2 ? helper.call(depth0, { "name": "guid", "hash": {}, "data": data }) : helper)) + "\"\n                onclick=\"toggleBookmark(this)\">\n            <span class=\"isBookmarked\">\n                <i class=\"fa fa-check-circle\"></i>\n                <span>Bookmarked</span>\n            </span>\n            <span class=\"isNotBookmarked\">\n                <i class=\"fa fa-bookmark\"></i>\n                <span>Bookmark Article</span>\n            </span>\n        </button>\n\n        <!--<button class=\"btn btn-white btn-large btn-bookmark " + ((stack1 = helpers['if'].call(depth0, depth0 != null ? depth0.isBookmarked : depth0, { "name": "if", "hash": {}, "fn": this.program(3, data, 0), "inverse": this.noop, "data": data })) != null ? stack1 : "") + "\"-->\n                <!--data-guid=\"" + alias3((helper = (helper = helpers.guid || (depth0 != null ? depth0.guid : depth0)) != null ? helper : alias1, (typeof helper === "undefined" ? "undefined" : _typeof(helper)) === alias2 ? helper.call(depth0, { "name": "guid", "hash": {}, "data": data }) : helper)) + "\"-->\n                <!--onclick=\"toggleBookmark(this)\">-->\n            <!--<span class=\"isBookmarked\">-->\n                <!--<i class=\"fa fa-check-circle\"></i>-->\n                <!--<span>Bookmarked</span>-->\n            <!--</span>-->\n            <!--<span class=\"isNotBookmarked\">-->\n                <!--<i class=\"fa fa-bookmark\"></i>-->\n                <!--<span>Bookmark Article</span>-->\n            <!--</span>-->\n        <!--</button>-->\n\n    </footer>\n</div>\n\n";
    }, "useData": true });
undefined["MyApp"]["templates"]["excerpt"] = Handlebars.template({ "1": function _(depth0, helpers, partials, data) {
        var stack1,
            helper,
            alias1 = helpers.helperMissing,
            alias2 = "function",
            alias3 = this.escapeExpression;

        return "<article class=\"excerpt\">\n    <header class=\"excerpt__header\">\n        <h3 class=\"excerpt__title\">\n            <a href=\"article.html?guid=" + alias3((helper = (helper = helpers.guid || (depth0 != null ? depth0.guid : depth0)) != null ? helper : alias1, (typeof helper === "undefined" ? "undefined" : _typeof(helper)) === alias2 ? helper.call(depth0, { "name": "guid", "hash": {}, "data": data }) : helper)) + "\">" + alias3((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1, (typeof helper === "undefined" ? "undefined" : _typeof(helper)) === alias2 ? helper.call(depth0, { "name": "title", "hash": {}, "data": data }) : helper)) + "</a>\n        </h3>\n        <i class=\"fa fa-clock-o\"></i>\n        <date class=\"excerpt__meta\">" + alias3((helpers.moment || depth0 && depth0.moment || alias1).call(depth0, depth0 != null ? depth0.pubDate : depth0, { "name": "moment", "hash": {}, "data": data })) + "</date>\n        <i class=\"fa fa-tags\"></i>\n        <span class=\"excerpt__meta\">\n            " + ((stack1 = helpers.each.call(depth0, depth0 != null ? depth0.categories : depth0, { "name": "each", "hash": {}, "fn": this.program(2, data, 0), "inverse": this.noop, "data": data })) != null ? stack1 : "") + "\n        </span>\n    </header>\n\n    <div class=\"excerpt__content\">\n        " + ((stack1 = (helpers.excerpt || depth0 && depth0.excerpt || alias1).call(depth0, depth0 != null ? depth0.description : depth0, { "name": "excerpt", "hash": {}, "data": data })) != null ? stack1 : "") + "\n    </div>\n    <div class=\"excerpt__footer\">\n        <a href=\"article.html?guid=" + alias3((helper = (helper = helpers.guid || (depth0 != null ? depth0.guid : depth0)) != null ? helper : alias1, (typeof helper === "undefined" ? "undefined" : _typeof(helper)) === alias2 ? helper.call(depth0, { "name": "guid", "hash": {}, "data": data }) : helper)) + "\" class=\"btn btn-default\">\n            <i class=\"fa fa-ellipsis-h\"></i>\n            <span>Read</span>\n        </a>\n\n\n        <button class=\"btn btn-default btn-bookmark " + ((stack1 = helpers['if'].call(depth0, depth0 != null ? depth0.isBookmarked : depth0, { "name": "if", "hash": {}, "fn": this.program(4, data, 0), "inverse": this.noop, "data": data })) != null ? stack1 : "") + "\"\n                data-guid=\"" + alias3((helper = (helper = helpers.guid || (depth0 != null ? depth0.guid : depth0)) != null ? helper : alias1, (typeof helper === "undefined" ? "undefined" : _typeof(helper)) === alias2 ? helper.call(depth0, { "name": "guid", "hash": {}, "data": data }) : helper)) + "\"\n                onclick=\"toggleBookmark(this)\">\n            <span class=\"isBookmarked\">\n                <i class=\"fa fa-check-circle\"></i>\n                <span>Bookmarked</span>\n            </span>\n            <span class=\"isNotBookmarked\">\n                <i class=\"fa fa-bookmark\"></i>\n                <span>Bookmark</span>\n            </span>\n        </button>\n\n    </div>\n</article>\n";
    }, "2": function _(depth0, helpers, partials, data) {
        return " <span class=\"excerpt__meta__category\">" + this.escapeExpression(this.lambda(depth0, depth0)) + "</span> ";
    }, "4": function _(depth0, helpers, partials, data) {
        return "btn-bookmark--bookmarked";
    }, "compiler": [6, ">= 2.0.0-beta.1"], "main": function main(depth0, helpers, partials, data) {
        var stack1;

        return (stack1 = helpers.each.call(depth0, depth0 != null ? depth0.items : depth0, { "name": "each", "hash": {}, "fn": this.program(1, data, 0), "inverse": this.noop, "data": data })) != null ? stack1 : "";
    }, "useData": true });
undefined["MyApp"]["templates"]["nav"] = Handlebars.template({ "1": function _(depth0, helpers, partials, data) {
        return "class=\"active\"";
    }, "compiler": [6, ">= 2.0.0-beta.1"], "main": function main(depth0, helpers, partials, data) {
        var stack1;

        return "<ul>\n    <li " + ((stack1 = helpers['if'].call(depth0, depth0 != null ? depth0.isLatest : depth0, { "name": "if", "hash": {}, "fn": this.program(1, data, 0), "inverse": this.noop, "data": data })) != null ? stack1 : "") + ">\n        <a href=\"latest.html\">\n            <i class=\"fa fa-plus\"></i>\n            <span>Latest</span>\n        </a>\n    </li>\n    <li " + ((stack1 = helpers['if'].call(depth0, depth0 != null ? depth0.isHome : depth0, { "name": "if", "hash": {}, "fn": this.program(1, data, 0), "inverse": this.noop, "data": data })) != null ? stack1 : "") + ">\n        <a href=\"index.html\">\n            <i class=\"fa fa-home\"></i>\n            <span>Home</span>\n        </a>\n    </li>\n    <li " + ((stack1 = helpers['if'].call(depth0, depth0 != null ? depth0.isSaved : depth0, { "name": "if", "hash": {}, "fn": this.program(1, data, 0), "inverse": this.noop, "data": data })) != null ? stack1 : "") + ">\n        <a href=\"saved.html\">\n            <i class=\"fa fa-bookmark\"></i>\n            <span>Bookmarks</span>\n        </a>\n    </li>\n</ul>";
    }, "useData": true });
'use strict';

function Toast(type, message) {
    this.toastContainerEl = document.querySelector('.toast-container');
    this.toastEl = document.querySelector('.toast');
    this._open(type, message);
}

Toast.prototype._close = function () {
    this.toastContainerEl.classList.remove('open');
};

Toast.prototype._open = function (type, message) {
    this.toastEl.classList.remove('success', 'warning', 'danger');
    this.toastEl.classList.add(type);
    this.toastContainerEl.classList.add('open');
    this.toastEl.innerHTML = '\n        <p>' + message + '</p>\n        <button type="button" aria-label="Close Message" class="close-toast btn-bare"> Close </button>\n    ';
    this._addEventListeners();
};

Toast.prototype._addEventListeners = function () {
    var _this = this;

    document.querySelector('.close-toast').addEventListener('click', function () {
        _this._close();
    });
};