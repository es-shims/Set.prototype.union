'use strict';

var getPolyfill = require('./polyfill');
var define = require('define-properties');
var shimSet = require('es-set/shim');

module.exports = function shimSetUnion() {
	shimSet();

	var polyfill = getPolyfill();
	define(
		Set.prototype,
		{ union: polyfill },
		{ union: function () { return Set.prototype.union !== polyfill; } }
	);

	return polyfill;
};
