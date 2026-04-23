/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 27:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(784);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(805));
var _createClass2 = _interopRequireDefault(__webpack_require__(989));
var cmsmastersAssetsLoader = exports["default"] = /*#__PURE__*/function () {
  function cmsmastersAssetsLoader() {
    (0, _classCallCheck2.default)(this, cmsmastersAssetsLoader);
  }
  return (0, _createClass2.default)(cmsmastersAssetsLoader, [{
    key: "getScriptElement",
    value: function getScriptElement(src) {
      var scriptElement = document.createElement('script');
      scriptElement.src = src;
      return scriptElement;
    }
  }, {
    key: "getStyleElement",
    value: function getStyleElement(src) {
      var styleElement = document.createElement('link');
      styleElement.rel = 'stylesheet';
      styleElement.href = src;
      return styleElement;
    }
  }, {
    key: "load",
    value: function load(type, key) {
      var _this = this;
      var assetData = cmsmasters_localize_vars.assets_data[type][key];
      if (!assetData.loader) {
        assetData.loader = new Promise(function (resolve) {
          var element = 'style' === type ? _this.getStyleElement(assetData.src) : _this.getScriptElement(assetData.src);
          element.onload = function () {
            return resolve(true);
          };
          var parent = 'head' === assetData.parent ? assetData.parent : 'body';
          document[parent].appendChild(element);
        });
      }
      return assetData.loader;
    }
  }]);
}();

/***/ }),

/***/ 51:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(564)["default"]);
function _regeneratorRuntime() {
  "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
  module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
    return r;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  var t,
    r = {},
    e = Object.prototype,
    n = e.hasOwnProperty,
    o = "function" == typeof Symbol ? Symbol : {},
    i = o.iterator || "@@iterator",
    a = o.asyncIterator || "@@asyncIterator",
    u = o.toStringTag || "@@toStringTag";
  function c(t, r, e, n) {
    Object.defineProperty(t, r, {
      value: e,
      enumerable: !n,
      configurable: !n,
      writable: !n
    });
  }
  try {
    c({}, "");
  } catch (t) {
    c = function c(t, r, e) {
      return t[r] = e;
    };
  }
  function h(r, e, n, o) {
    var i = e && e.prototype instanceof Generator ? e : Generator,
      a = Object.create(i.prototype);
    return c(a, "_invoke", function (r, e, n) {
      var o = 1;
      return function (i, a) {
        if (3 === o) throw Error("Generator is already running");
        if (4 === o) {
          if ("throw" === i) throw a;
          return {
            value: t,
            done: !0
          };
        }
        for (n.method = i, n.arg = a;;) {
          var u = n.delegate;
          if (u) {
            var c = d(u, n);
            if (c) {
              if (c === f) continue;
              return c;
            }
          }
          if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
            if (1 === o) throw o = 4, n.arg;
            n.dispatchException(n.arg);
          } else "return" === n.method && n.abrupt("return", n.arg);
          o = 3;
          var h = s(r, e, n);
          if ("normal" === h.type) {
            if (o = n.done ? 4 : 2, h.arg === f) continue;
            return {
              value: h.arg,
              done: n.done
            };
          }
          "throw" === h.type && (o = 4, n.method = "throw", n.arg = h.arg);
        }
      };
    }(r, n, new Context(o || [])), !0), a;
  }
  function s(t, r, e) {
    try {
      return {
        type: "normal",
        arg: t.call(r, e)
      };
    } catch (t) {
      return {
        type: "throw",
        arg: t
      };
    }
  }
  r.wrap = h;
  var f = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var l = {};
  c(l, i, function () {
    return this;
  });
  var p = Object.getPrototypeOf,
    y = p && p(p(x([])));
  y && y !== e && n.call(y, i) && (l = y);
  var v = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(l);
  function g(t) {
    ["next", "throw", "return"].forEach(function (r) {
      c(t, r, function (t) {
        return this._invoke(r, t);
      });
    });
  }
  function AsyncIterator(t, r) {
    function e(o, i, a, u) {
      var c = s(t[o], t, i);
      if ("throw" !== c.type) {
        var h = c.arg,
          f = h.value;
        return f && "object" == _typeof(f) && n.call(f, "__await") ? r.resolve(f.__await).then(function (t) {
          e("next", t, a, u);
        }, function (t) {
          e("throw", t, a, u);
        }) : r.resolve(f).then(function (t) {
          h.value = t, a(h);
        }, function (t) {
          return e("throw", t, a, u);
        });
      }
      u(c.arg);
    }
    var o;
    c(this, "_invoke", function (t, n) {
      function i() {
        return new r(function (r, o) {
          e(t, n, r, o);
        });
      }
      return o = o ? o.then(i, i) : i();
    }, !0);
  }
  function d(r, e) {
    var n = e.method,
      o = r.i[n];
    if (o === t) return e.delegate = null, "throw" === n && r.i["return"] && (e.method = "return", e.arg = t, d(r, e), "throw" === e.method) || "return" !== n && (e.method = "throw", e.arg = new TypeError("The iterator does not provide a '" + n + "' method")), f;
    var i = s(o, r.i, e.arg);
    if ("throw" === i.type) return e.method = "throw", e.arg = i.arg, e.delegate = null, f;
    var a = i.arg;
    return a ? a.done ? (e[r.r] = a.value, e.next = r.n, "return" !== e.method && (e.method = "next", e.arg = t), e.delegate = null, f) : a : (e.method = "throw", e.arg = new TypeError("iterator result is not an object"), e.delegate = null, f);
  }
  function w(t) {
    this.tryEntries.push(t);
  }
  function m(r) {
    var e = r[4] || {};
    e.type = "normal", e.arg = t, r[4] = e;
  }
  function Context(t) {
    this.tryEntries = [[-1]], t.forEach(w, this), this.reset(!0);
  }
  function x(r) {
    if (null != r) {
      var e = r[i];
      if (e) return e.call(r);
      if ("function" == typeof r.next) return r;
      if (!isNaN(r.length)) {
        var o = -1,
          a = function e() {
            for (; ++o < r.length;) if (n.call(r, o)) return e.value = r[o], e.done = !1, e;
            return e.value = t, e.done = !0, e;
          };
        return a.next = a;
      }
    }
    throw new TypeError(_typeof(r) + " is not iterable");
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, c(v, "constructor", GeneratorFunctionPrototype), c(GeneratorFunctionPrototype, "constructor", GeneratorFunction), c(GeneratorFunctionPrototype, u, GeneratorFunction.displayName = "GeneratorFunction"), r.isGeneratorFunction = function (t) {
    var r = "function" == typeof t && t.constructor;
    return !!r && (r === GeneratorFunction || "GeneratorFunction" === (r.displayName || r.name));
  }, r.mark = function (t) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, c(t, u, "GeneratorFunction")), t.prototype = Object.create(v), t;
  }, r.awrap = function (t) {
    return {
      __await: t
    };
  }, g(AsyncIterator.prototype), c(AsyncIterator.prototype, a, function () {
    return this;
  }), r.AsyncIterator = AsyncIterator, r.async = function (t, e, n, o, i) {
    void 0 === i && (i = Promise);
    var a = new AsyncIterator(h(t, e, n, o), i);
    return r.isGeneratorFunction(e) ? a : a.next().then(function (t) {
      return t.done ? t.value : a.next();
    });
  }, g(v), c(v, u, "Generator"), c(v, i, function () {
    return this;
  }), c(v, "toString", function () {
    return "[object Generator]";
  }), r.keys = function (t) {
    var r = Object(t),
      e = [];
    for (var n in r) e.unshift(n);
    return function t() {
      for (; e.length;) if ((n = e.pop()) in r) return t.value = n, t.done = !1, t;
      return t.done = !0, t;
    };
  }, r.values = x, Context.prototype = {
    constructor: Context,
    reset: function reset(r) {
      if (this.prev = this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(m), !r) for (var e in this) "t" === e.charAt(0) && n.call(this, e) && !isNaN(+e.slice(1)) && (this[e] = t);
    },
    stop: function stop() {
      this.done = !0;
      var t = this.tryEntries[0][4];
      if ("throw" === t.type) throw t.arg;
      return this.rval;
    },
    dispatchException: function dispatchException(r) {
      if (this.done) throw r;
      var e = this;
      function n(t) {
        a.type = "throw", a.arg = r, e.next = t;
      }
      for (var o = e.tryEntries.length - 1; o >= 0; --o) {
        var i = this.tryEntries[o],
          a = i[4],
          u = this.prev,
          c = i[1],
          h = i[2];
        if (-1 === i[0]) return n("end"), !1;
        if (!c && !h) throw Error("try statement without catch or finally");
        if (null != i[0] && i[0] <= u) {
          if (u < c) return this.method = "next", this.arg = t, n(c), !0;
          if (u < h) return n(h), !1;
        }
      }
    },
    abrupt: function abrupt(t, r) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var n = this.tryEntries[e];
        if (n[0] > -1 && n[0] <= this.prev && this.prev < n[2]) {
          var o = n;
          break;
        }
      }
      o && ("break" === t || "continue" === t) && o[0] <= r && r <= o[2] && (o = null);
      var i = o ? o[4] : {};
      return i.type = t, i.arg = r, o ? (this.method = "next", this.next = o[2], f) : this.complete(i);
    },
    complete: function complete(t, r) {
      if ("throw" === t.type) throw t.arg;
      return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && r && (this.next = r), f;
    },
    finish: function finish(t) {
      for (var r = this.tryEntries.length - 1; r >= 0; --r) {
        var e = this.tryEntries[r];
        if (e[2] === t) return this.complete(e[4], e[3]), m(e), f;
      }
    },
    "catch": function _catch(t) {
      for (var r = this.tryEntries.length - 1; r >= 0; --r) {
        var e = this.tryEntries[r];
        if (e[0] === t) {
          var n = e[4];
          if ("throw" === n.type) {
            var o = n.arg;
            m(e);
          }
          return o;
        }
      }
      throw Error("illegal catch attempt");
    },
    delegateYield: function delegateYield(r, e, n) {
      return this.delegate = {
        i: x(r),
        r: e,
        n: n
      }, "next" === this.method && (this.arg = t), f;
    }
  }, r;
}
module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 155:
/***/ ((module) => {

function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}
module.exports = _asyncToGenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 327:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(564)["default"]);
function toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
module.exports = toPrimitive, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 471:
/***/ (() => {

"use strict";


// Detect Touch Device
(function () {
  var isTouchDevice = 'ontouchstart' in document.documentElement;
  if (isTouchDevice) {
    jQuery('body').addClass('cmsmasters-is-touch');
  }
})();

/***/ }),

/***/ 498:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(564)["default"]);
var toPrimitive = __webpack_require__(327);
function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
module.exports = toPropertyKey, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 564:
/***/ ((module) => {

function _typeof(o) {
  "@babel/helpers - typeof";

  return module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof(o);
}
module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 586:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(784);
var _regenerator = _interopRequireDefault(__webpack_require__(790));
var _asyncToGenerator2 = _interopRequireDefault(__webpack_require__(155));
var _assetsLoader = _interopRequireDefault(__webpack_require__(27));
// Swiper Slider Run

jQuery.fn.cmsmastersSwiperSlider = function () {
  var el = this,
    parentClass = '.cmsmasters-swiper',
    defaults = {
      loop: false,
      pagination: {
        clickable: true
      },
      autoHeight: true
    };
  var obj = {};
  obj = {
    init: function () {
      var _init = (0, _asyncToGenerator2.default)(/*#__PURE__*/_regenerator.default.mark(function _callee() {
        var assetsLoader;
        return _regenerator.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              obj.container = "#".concat(el.attr('id'), " ").concat(parentClass, "__container");
              obj.options = jQuery(el).data('options');
              if ('none' !== obj.options.pagination) {
                defaults.pagination.el = jQuery(el).find("".concat(parentClass, "__pagination-items")).get(0);
                defaults.pagination.type = obj.options.pagination;
                if ('bullets' === obj.options.pagination) {
                  if ('dynamic' === obj.options.bullets_type) {
                    defaults.pagination.dynamicBullets = true;
                  } else if ('numbered' === obj.options.bullets_type) {
                    defaults.pagination.renderBullet = function (index, className) {
                      return "<span class=\"".concat(className, "\">").concat(index + 1, "</span>");
                    };
                  }
                }
              }
              if (true === obj.options.arrows) {
                defaults.navigation = {
                  nextEl: jQuery(el).find("".concat(parentClass, "__button.cmsmasters-next")).get(0),
                  prevEl: jQuery(el).find("".concat(parentClass, "__button.cmsmasters-prev")).get(0)
                };
              }
              obj.settings = jQuery.extend({}, defaults, el.data('settings'));
              if (window.Swiper) {
                _context.next = 9;
                break;
              }
              assetsLoader = new _assetsLoader.default();
              _context.next = 9;
              return assetsLoader.load('script', 'swiper');
            case 9:
              obj.run_slider();
            case 10:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      function init() {
        return _init.apply(this, arguments);
      }
      return init;
    }(),
    run_slider: function run_slider() {
      var swiper = new Swiper(obj.container, obj.settings);
      if (true === obj.options.pause_on_hover) {
        jQuery(obj.container).on('mouseenter', function () {
          swiper.autoplay.stop();
        }).on('mouseleave', function () {
          swiper.autoplay.start();
        });
      }
      document.addEventListener('cmsmasters_customize_change_css_var', function () {
        setTimeout(function () {
          swiper.update();
        });
      });
    }
  };
  obj.init();
};
jQuery('.cmsmasters-swiper').each(function () {
  jQuery(this).cmsmastersSwiperSlider();
});

/***/ }),

/***/ 640:
/***/ (() => {

"use strict";


jQuery.fn.cmsmastersMasonryGrid = function (args) {
  var container = this;
  if (container.length < 1) {
    return;
  }
  var defaults = {
    itemClass: '.cmsmasters-archive-post'
  };
  var obj = {};
  obj = {
    init: function init() {
      obj.options = jQuery.extend({}, defaults, args);
      obj.container = container;
      obj.items = obj.container.find(obj.options.itemClass);
      document.addEventListener('cmsmasters_customize_change_css_var', function () {
        setTimeout(function () {
          obj.run();
        });
      });
      obj.container.imagesLoaded(function () {
        obj.run();
      });
      jQuery(window).on('resize', function () {
        setTimeout(function () {
          obj.run();
        }, 300);
      });
    },
    getColumns: function getColumns() {
      var stringSearch = ' ',
        str = obj.container.css('grid-template-columns');
      var count = 1;
      for (var i = 0; i < str.length; count += +(stringSearch === str[i++])) {
        void 0;
      }
      return count;
    },
    run: function run() {
      var heights = [],
        distanceFromTop = obj.container.position().top + parseInt(obj.container.css('margin-top'), 10),
        columns = obj.getColumns(),
        space = parseInt(obj.container.css('grid-row-gap'), 10);
      obj.items.removeAttr('style');
      obj.items.each(function (index) {
        var row = Math.floor(index / columns),
          $item = jQuery(this),
          itemHeight = $item[0].getBoundingClientRect().height + space;
        if (row) {
          var itemPosition = $item.position(),
            indexAtRow = index % columns;
          var pullHeight = itemPosition.top - distanceFromTop - heights[indexAtRow];
          pullHeight -= parseInt($item.css('margin-top'), 10);
          pullHeight *= -1;
          $item.css('margin-top', pullHeight + 'px');
          heights[indexAtRow] += itemHeight;
        } else {
          heights.push(itemHeight);
        }
      });
    }
  };
  obj.init();
};
jQuery('.cmsmasters-archive.cmsmasters-grid.cmsmasters-masonry').cmsmastersMasonryGrid();

/***/ }),

/***/ 668:
/***/ (() => {

"use strict";


// Header Search
jQuery('.cmsmasters-header-search-button-toggle').on('click', function () {
  jQuery('.cmsmasters-header-search-form').addClass('cmsmasters-show');
  jQuery('.cmsmasters-header-search-form').find('input[type=search]').focus();
});
jQuery('.cmsmasters-header-search-form__close').on('click', function () {
  jQuery('.cmsmasters-header-search-form').removeClass('cmsmasters-show');
});

/***/ }),

/***/ 711:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(784);
var _mediaWidth = _interopRequireDefault(__webpack_require__(809));
// Responsive Navigation
jQuery.fn.cmsmastersResponsiveNav = function (args) {
  var defaults = {
      submenu: 'ul.sub-menu, ul.children',
      respButton: '.cmsmasters-burger-menu-button__toggle',
      startWidth: cmsmasters_localize_vars.tablet_breakpoint
    },
    el = this;
  var obj = {
    init: function init() {
      obj.options = jQuery.extend({}, defaults, args);
      obj.el = el;
      obj.params = {};
      obj.params.subLinkToggle = void 0;
      obj.setVars();
      obj.restartNav();
    },
    setVars: function setVars() {
      obj.params.parentNav = obj.el.closest('.cmsmasters-menu');
      obj.params.submenu = obj.el.find(obj.options.submenu);
      obj.params.subLink = obj.params.submenu.closest('li').find('> a');
      obj.params.subText = obj.params.submenu.closest('li').find('> a:not([href])');
      obj.params.respButton = jQuery(obj.options.respButton);
      obj.params.startWidth = obj.options.startWidth;
      obj.params.win = jQuery(window);
      obj.params.trigger = false;
      obj.params.counter = 0;
      obj.startEvent();
      obj.params.subLink.each(function () {
        jQuery(this).addClass('cmsmasters-has-child-indicator').find('.cmsmasters-menu__item').append('<span class="cmsmasters-child-indicator cmsmasters-theme-icon-nav-arrow"></span>');
      });
    },
    buildNav: function buildNav() {
      obj.params.trigger = true;
      obj.params.counter = 1;
      obj.params.subLinkToggle = obj.params.subLink.find('.cmsmasters-child-indicator');
      obj.params.submenu.hide();
      obj.attachEvents();
    },
    restartNav: function restartNav() {
      if (!obj.params.trigger && (0, _mediaWidth.default)() < obj.params.startWidth) {
        obj.buildNav();
      } else if (obj.params.trigger && (0, _mediaWidth.default)() >= obj.params.startWidth) {
        obj.destroyNav();
      }
    },
    resetNav: function resetNav() {
      obj.params.subLinkToggle.removeClass('cmsmasters-active');
      obj.params.submenu.hide();
    },
    destroyNav: function destroyNav() {
      obj.params.subLink.each(function () {
        jQuery(this).find('.cmsmasters-menu__item').find('.cmsmasters-child-indicator').removeClass('cmsmasters-active');
      });
      obj.params.submenu.css('display', '');
      obj.params.respButton.removeClass('cmsmasters-active');
      obj.params.parentNav.css('display', '');
      obj.params.trigger = false;
      obj.detachEvents();
    },
    startEvent: function startEvent() {
      obj.params.win.on('resize', function () {
        obj.restartNav();
      });
    },
    attachEvents: function attachEvents() {
      obj.params.subLinkToggle.on('click', function () {
        if (jQuery(this).hasClass('cmsmasters-active')) {
          jQuery(this).removeClass('cmsmasters-active').closest('li').find('ul.sub-menu, ul.children').hide();
          jQuery(this).closest('li').find('span.cmsmasters-child-indicator').removeClass('cmsmasters-active');
        } else {
          jQuery(this).addClass('cmsmasters-active');
          jQuery(this).closest('li').find('> ul.sub-menu, > ul.children').show();
        }
        return false;
      });
      obj.params.subText.on('click', function () {
        jQuery(this).find('span.cmsmasters-child-indicator').trigger('click');
      });
      obj.params.respButton.on('click', function () {
        if (obj.params.trigger && jQuery(this).hasClass('cmsmasters-active')) {
          obj.resetNav();
        }
        if (jQuery(this).is(':not(.cmsmasters-active)')) {
          obj.params.parentNav.css({
            display: 'block'
          });
          jQuery(this).addClass('cmsmasters-active');
        } else {
          obj.params.parentNav.css({
            display: 'none'
          });
          jQuery(this).removeClass('cmsmasters-active');
        }
        return false;
      });
    },
    detachEvents: function detachEvents() {
      obj.params.subLinkToggle.off('click');
      obj.params.respButton.off('click');
    }
  };
  obj.init();
};
jQuery('.cmsmasters-header-top-menu__list').cmsmastersResponsiveNav({
  respButton: '.cmsmasters-header-top-burger-menu-button__toggle'
});
jQuery('.cmsmasters-header-mid-menu__list').cmsmastersResponsiveNav({
  respButton: '.cmsmasters-header-mid-burger-menu-button__toggle'
});
jQuery('.cmsmasters-header-bot-menu__list').cmsmastersResponsiveNav({
  respButton: '.cmsmasters-header-bot-burger-menu-button__toggle'
});

/***/ }),

/***/ 784:
/***/ ((module) => {

function _interopRequireDefault(e) {
  return e && e.__esModule ? e : {
    "default": e
  };
}
module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 790:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// TODO(Babel 8): Remove this file.

var runtime = __webpack_require__(51)();
module.exports = runtime;

// Copied from https://github.com/facebook/regenerator/blob/main/packages/runtime/runtime.js#L736=
try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}


/***/ }),

/***/ 802:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(784);
var _mediaWidth = _interopRequireDefault(__webpack_require__(809));
// Header Top Toggle
jQuery('.cmsmasters-header-top-toggle__inner').on('click', function () {
  var headerTopBut = jQuery(this),
    headerTopOuter = jQuery('.cmsmasters-header-top__outer');
  if (headerTopBut.hasClass('cmsmasters-active')) {
    headerTopOuter.slideUp();
    headerTopBut.removeClass('cmsmasters-active');
  } else {
    headerTopOuter.slideDown();
    headerTopBut.addClass('cmsmasters-active');
  }
});
jQuery(window).on('resize', function () {
  if ((0, _mediaWidth.default)() > cmsmasters_localize_vars.mobile_max_breakpoint) {
    jQuery('.cmsmasters-header-top-toggle__inner').removeClass('cmsmasters-active');
    jQuery('.cmsmasters-header-top__outer').css('display', '');
  }
});

/***/ }),

/***/ 805:
/***/ ((module) => {

function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 809:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = cmsmastersMediaWidth;
// Media Width
function cmsmastersMediaWidth() {
  var mediaWidth = parseInt(jQuery('.cmsmasters-responsive-width').css('width'));
  return mediaWidth;
}

/***/ }),

/***/ 950:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(784);
Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(805));
var _createClass2 = _interopRequireDefault(__webpack_require__(989));
var cmsmastersPagePreloader = exports["default"] = /*#__PURE__*/function () {
  function cmsmastersPagePreloader() {
    (0, _classCallCheck2.default)(this, cmsmastersPagePreloader);
    this.$container = document.querySelector('.cmsmasters-page-preloader');
    if (!this.$container) {
      return;
    }
    this.classes = this.getClasses();
    this.bindEvents();
  }
  return (0, _createClass2.default)(cmsmastersPagePreloader, [{
    key: "getClasses",
    value: function getClasses() {
      return {
        entering: 'cmsmasters-page-preloader--entering',
        entered: 'cmsmasters-page-preloader--entered',
        exiting: 'cmsmasters-page-preloader--exiting',
        preview: 'cmsmasters-page-preloader--preview'
      };
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      window.addEventListener('pageshow', this.onPageShow.bind(this));
      window.addEventListener('beforeunload', this.onPageBeforeUnload.bind(this));
      // window.addEventListener( 'pagehide', this.onPageBeforeUnload.bind( this ) );
      // window.addEventListener( 'unload', this.onPageUnload.bind( this ) );
    }
  }, {
    key: "onPageShow",
    value: function onPageShow() {
      var _this = this;
      // To disable animation on back / forward click.
      if (this.$container.classList.contains(this.classes.exiting)) {
        this.$container.classList.add(this.classes.entered);
        this.$container.classList.remove(this.classes.exiting);
      }

      // Animate the loader on page load.
      this.animateState('entering').then(function () {
        _this.$container.classList.add(_this.classes.entered);
      });
    }
  }, {
    key: "onPageBeforeUnload",
    value: function onPageBeforeUnload() {
      var _this2 = this;
      this.$container.classList.remove(this.classes.entered);
      this.animateState('exiting').then(function () {
        _this2.$container.classList.add(_this2.classes.exiting);
      });
    }
  }, {
    key: "animateState",
    value: function animateState(state) {
      var _this$classes,
        _this3 = this;
      var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var className = (_this$classes = this.classes) === null || _this$classes === void 0 ? void 0 : _this$classes[state];
      if (!className) {
        return new Promise(function (resolve, reject) {
          reject(state);
        });
      }

      // Remove and add the class again to force the animation, since it's using `animation-fill-mode: forwards`.
      this.$container.classList.remove(className);
      this.$container.classList.add(className);
      var animationDuration = parseInt(this.getCssVar('--cmsmasters-page-preloader-animation-duration')) || 0;
      return new Promise(function (resolve) {
        setTimeout(function () {
          _this3.$container.classList.remove(className);
          resolve(state);
        }, animationDuration + delay);
      });
    }
  }, {
    key: "getCssVar",
    value: function getCssVar(variable) {
      return window.getComputedStyle(document.documentElement).getPropertyValue(variable);
    }
  }]);
}();
new cmsmastersPagePreloader();

/***/ }),

/***/ 989:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toPropertyKey = __webpack_require__(498);
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}
module.exports = _createClass, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";


/* Frontend Script */
__webpack_require__(27);
__webpack_require__(471);
__webpack_require__(809);
__webpack_require__(950);
__webpack_require__(640);
__webpack_require__(711);
__webpack_require__(802);
__webpack_require__(668);
__webpack_require__(586);
})();

/******/ })()
;
//# sourceMappingURL=frontend.js.map