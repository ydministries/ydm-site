/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 55:
/***/ (() => {



/* Gutenberg Scripts */
wp.domReady(function () {
  wp.blocks.unregisterBlockStyle('core/quote', ['default', 'large']);
  wp.blocks.unregisterBlockStyle('core/table', ['default', 'stripes']);
});

/***/ }),

/***/ 688:
/***/ (() => {



/* Check layout */
jQuery('.acf-field-select[data-name="cmsmasters_layout"] select').on('change', function () {
  var value = jQuery(this).val(),
    $el = jQuery('body');
  $el.removeClass(function (index, classes) {
    return (classes.match(/cmsmasters-layout-\S+/g) || []).join(' ');
  });
  $el.addClass(function (index, classes) {
    if ('default' === value) {
      var def = classes.match(/cmsmasters-def-layout-(\S+)\s+/);
      return classes + ' cmsmasters-layout-' + def[1];
    }
    return classes + ' cmsmasters-layout-' + value;
  });
});

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


/* Gutenberg Script */
jQuery(document).ready(function () {
  __webpack_require__(688);
});
__webpack_require__(55);
/******/ })()
;
//# sourceMappingURL=gutenberg.js.map