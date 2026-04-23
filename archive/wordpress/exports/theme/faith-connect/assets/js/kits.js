/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 118:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(564)["default"]);
var assertThisInitialized = __webpack_require__(417);
function _possibleConstructorReturn(t, e) {
  if (e && ("object" == _typeof(e) || "function" == typeof e)) return e;
  if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
  return assertThisInitialized(t);
}
module.exports = _possibleConstructorReturn, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 270:
/***/ ((module) => {

function _setPrototypeOf(t, e) {
  return module.exports = _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _setPrototypeOf(t, e);
}
module.exports = _setPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

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

/***/ 402:
/***/ ((module) => {

function _getPrototypeOf(t) {
  return module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _getPrototypeOf(t);
}
module.exports = _getPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 417:
/***/ ((module) => {

function _assertThisInitialized(e) {
  if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}
module.exports = _assertThisInitialized, module.exports.__esModule = true, module.exports["default"] = module.exports;

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

/***/ 784:
/***/ ((module) => {

function _interopRequireDefault(e) {
  return e && e.__esModule ? e : {
    "default": e
  };
}
module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 805:
/***/ ((module) => {

function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 861:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var setPrototypeOf = __webpack_require__(270);
function _inherits(t, e) {
  if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
  t.prototype = Object.create(e && e.prototype, {
    constructor: {
      value: t,
      writable: !0,
      configurable: !0
    }
  }), Object.defineProperty(t, "prototype", {
    writable: !1
  }), e && setPrototypeOf(t, e);
}
module.exports = _inherits, module.exports.__esModule = true, module.exports["default"] = module.exports;

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
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";


var _interopRequireDefault = __webpack_require__(784);
var _classCallCheck2 = _interopRequireDefault(__webpack_require__(805));
var _createClass2 = _interopRequireDefault(__webpack_require__(989));
var _possibleConstructorReturn2 = _interopRequireDefault(__webpack_require__(118));
var _getPrototypeOf2 = _interopRequireDefault(__webpack_require__(402));
var _inherits2 = _interopRequireDefault(__webpack_require__(861));
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var Kits = /*#__PURE__*/function (_elementorModules$edi) {
  function Kits() {
    (0, _classCallCheck2.default)(this, Kits);
    return _callSuper(this, Kits, arguments);
  }
  (0, _inherits2.default)(Kits, _elementorModules$edi);
  return (0, _createClass2.default)(Kits, [{
    key: "onElementorLoaded",
    value: function onElementorLoaded() {
      elementor.on('document:loaded', this.initGroups.bind(this));
      $e.routes.on('run:after', function (component, route) {
        var $pagePreloader = elementor.$previewContents[0].body.querySelector('.cmsmasters-page-preloader');
        if (!$pagePreloader) {
          return;
        }
        $pagePreloader.classList.remove('cmsmasters-page-preloader--preview');
        if ('panel/global/cmsmasters-theme-page-preloader' === route) {
          $pagePreloader.classList.add('cmsmasters-page-preloader--preview');
        }
      });
    }
  }, {
    key: "initGroups",
    value: function initGroups() {
      this.kitPanelMenu = elementor.getPanelView().getPages().kit_menu.view;
      this.kitTabs = $e.components.get('panel/global').tabs;
      if (!Object.keys(this.kitTabs).length) {
        return;
      }
      this.groupsCollectionArgs = [];
      this.addKitGroup('global', 'design_system');

      // this.addKitGroup( 'theme-style' );

      this.addKitGroup('cmsmasters-theme', false, true);
      this.initSettingsGroup();
      this.kitPanelMenu.groups = new Backbone.Collection(this.groupsCollectionArgs);
    }
  }, {
    key: "addKitGroup",
    value: function addKitGroup(group) {
      var customName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var addonGroup = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var customItems = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var name = customName ? customName : group.split('-').join('_');
      var title = elementor.translate(name);
      if (addonGroup) {
        title += ' <i class="elementor-panel-menu-group-title-icon cmsms-logo"></i>';
      }
      var items = customItems ? customItems : this.getKitGroupTabs(group);
      this.groupsCollectionArgs.push({
        name: name,
        title: title,
        items: items
      });
    }
  }, {
    key: "getKitGroupTabs",
    value: function getKitGroupTabs(group) {
      return this.kitPanelMenu.createGroupItems(group);
    }
  }, {
    key: "initSettingsGroup",
    value: function initSettingsGroup() {
      var settingsTabs = this.getKitGroupTabs('settings');
      settingsTabs.push({
        name: 'settings-additional-settings',
        icon: 'eicon-tools',
        title: elementor.translate('additional_settings'),
        type: 'link',
        link: elementor.config.admin_settings_url,
        newTab: true
      });
      for (var index in settingsTabs) {
        if ('settings-background' === settingsTabs[index].name) {
          settingsTabs.splice(index, 1);
        }
      }
      this.addKitGroup('settings', false, false, settingsTabs);
    }
  }]);
}(elementorModules.editor.utils.Module);
new Kits();
})();

/******/ })()
;
//# sourceMappingURL=kits.js.map