'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

var $Set = require('es-set/polyfill')();

var IteratorStep = require('es-abstract/2022/IteratorStep');
var IteratorValue = require('es-abstract/2022/IteratorValue');

var GetSetRecord = require('./aos/GetSetRecord');
var GetKeysIterator = require('./aos/GetKeysIterator');

var isSet = require('is-set');

var callBind = require('call-bind');
var callBound = require('call-bind/callBound');
var iterate = require('iterate-value');

var $nativeSetForEach = callBound('Set.prototype.forEach', true);
var $polyfillSetForEach = $Set.prototype.forEach && callBind($Set.prototype.forEach);
var $setForEach = function (set, callback) {
	if ($nativeSetForEach) {
		try {
			return $nativeSetForEach(set, callback);
		} catch (e) { /**/ }
	}
	if ($polyfillSetForEach) {
		return $polyfillSetForEach(set, callback);
	}
	iterate(set, callback);
	return void undefined;
};

var $nativeSetHas = callBound('Set.prototype.has', true);
var $polyfillSetHas = $Set.prototype.has && callBind($Set.prototype.has);
var $setHas = function (set, key) {
	if ($nativeSetHas) {
		try {
			return $nativeSetHas(set, key);
		} catch (e) { /**/ }
	}
	return $polyfillSetHas(set, key);
};

var $nativeSetAdd = callBound('Set.prototype.add', true);
var $polyfillSetAdd = $Set.prototype.add && callBind($Set.prototype.add);
var $setAdd = function (S, v) {
	if ($nativeSetAdd) {
		try {
			return $nativeSetAdd(S, v);
		} catch (e) { /**/ }
	}
	return $polyfillSetAdd(S, v);
};

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
		next = IteratorStep(keysIter['[[Iterator]]']); // step 7.a
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
