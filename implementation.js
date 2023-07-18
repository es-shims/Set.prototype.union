'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

var $Set = require('es-set/polyfill')();

var GetKeysIterator = require('./aos/GetKeysIterator');
var GetSetRecord = require('./aos/GetSetRecord');
var IteratorStep = require('es-abstract/2023/IteratorStep');
var IteratorValue = require('es-abstract/2023/IteratorValue');

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

	var keysIter = GetKeysIterator(otherRec); // step 4

	// 5. Let resultSetData be a copy of O.[[SetData]]; // step 5
	var result = new $Set();
	$setForEach(O, function (value) {
		$setAdd(result, value);
	});

	var next = true; // step 6
	while (next) { // step 7
		next = IteratorStep(keysIter); // step 7.a
		if (next) { // step 7.b
			var nextValue = IteratorValue(next); // step 7.b.i
			if (nextValue === 0) { // step 7.b.ii
				nextValue = +0;
			}

			// if (!SetDataHas(resultSetData, nextValue)) { // step 7.b.iii
			if (!$setHas(O, nextValue)) { // step 7.b.iii
				// Append nextValue to resultSetData. // step 7.b.iii.1
				$setAdd(result, nextValue);
			}
		}
	}

	// var result = OrdinaryObjectCreate(%Set.prototype%, « [[SetData]] »); // step 8

	// result.[[SetData]] = resultSetData; // step 9

	return result; // step 10

};
