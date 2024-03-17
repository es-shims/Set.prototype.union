'use strict';

var $TypeError = require('es-errors/type');

var Call = require('es-abstract/2024/Call');
var Get = require('es-abstract/2024/Get');
var Type = require('es-abstract/2024/Type');

// https://tc39.es/ecma262/#sec-getiteratorfrommethod

module.exports = function GetIteratorFromMethod(obj, method) {
	var iterator = Call(method, obj); // step 1

	if (Type(iterator) !== 'Object') {
		throw new $TypeError('iterator must return an object'); // step 2
	}

	var nextMethod = Get(iterator, 'next'); // step 3

	var iteratorRecord = { '[[Iterator]]': iterator, '[[NextMethod]]': nextMethod, '[[Done]]': false }; // step 4

	return iteratorRecord; // step 5
};
