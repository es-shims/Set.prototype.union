'use strict';

var $TypeError = require('es-errors/type');

var $Set = require('es-set/polyfill')();

var GetIteratorFromMethod = require('./aos/GetIteratorFromMethod');
var GetSetRecord = require('./aos/GetSetRecord');
var IteratorStepValue = require('es-abstract/2024/IteratorStepValue');

var isSet = require('is-set');

var tools = require('es-set/tools');
var $setForEach = tools.forEach;
var $setHas = tools.has;
var $setAdd = tools.add;

module.exports = function union(other) {
	var O = this; // step 1

	// RequireInternalSlot(O, [[SetData]]); // step 2
	if (!isSet(O) && !(O instanceof $Set)) {
		throw new $TypeError('Method Set.prototype.union called on incompatible receiver ' + O);
	}

	var otherRec = GetSetRecord(other); // step 3

	var keysIter = GetIteratorFromMethod(otherRec['[[Set]]'], otherRec['[[Keys]]']); // step 4

	// 5. Let resultSetData be a copy of O.[[SetData]]; // step 5
	var result = new $Set();
	$setForEach(O, function (value) {
		$setAdd(result, value);
	});

	var next; // step 6
	while (!keysIter['[[Done]]']) { // step 7
		next = IteratorStepValue(keysIter); // step 7.a
		if (!keysIter['[[Done]]']) { // step 7.b
			if (next === 0) { // step 7.b.i
				next = +0;
			}

			// if (!SetDataHas(resultSetData, next)) { // step 7.b.ii
			if (!$setHas(O, next)) { // step 7.b.ii
				// Append next to resultSetData. // step 7.b.ii.1
				$setAdd(result, next);
			}
		}
	}

	// var result = OrdinaryObjectCreate(%Set.prototype%, « [[SetData]] »); // step 8

	// result.[[SetData]] = resultSetData; // step 9

	return result; // step 10

};
