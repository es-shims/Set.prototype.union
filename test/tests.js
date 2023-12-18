'use strict';

var $Set = require('es-set/polyfill')();
var $Map = require('es-map/polyfill')();
var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var has = function () {
	throw new EvalError('`union` needs `other` to have a `has`, even though it never uses it');
};

var setEqual = function compareSetLikes(t, actual, expected, msg) {
	t.test('setlikes: ' + msg, function (st) {
		st.ok(actual instanceof expected.constructor, 'actual is an instance of the expected constructor');
		st.ok(expected instanceof actual.constructor, 'expected is an instance of the actual constructor');
		st.equal(actual.size, expected.size, 'they have the same size');

		if (actual.forEach) {
			actual.forEach(function (x) {
				st.ok(expected.has(x), debug(x) + ' (in actual) is in the expected set');
			});
		}

		if (expected.forEach) {
			expected.forEach(function (x) {
				st.ok(actual.has(x), debug(x) + ' (in expected) is in the actual set');
			});
		}

		st.end();
	});
};

module.exports = function (union, t) {
	var testUnion = function testSetUnion(ut, set1, set2, expected, msg) {
		var result = union(set1, set2);
		ut.ok(result instanceof $Set, 'returns a Set');
		setEqual(
			ut,
			result,
			new $Set(expected),
			msg
		);
	};

	t.test('throws on non-set receivers', function (st) {
		forEach(v.primitives.concat(v.objects), function (nonSet) {
			st['throws'](
				function () { union(nonSet, {}); },
				TypeError,
				debug(nonSet) + ' is not a Set'
			);
		});

		st.end();
	});

	t.test('non-Setlike `other`', function (st) {
		var set = new $Set([1, 2]);

		forEach(v.primitives, function (primitive) {
			st['throws'](
				function () { union(set, primitive); },
				TypeError,
				debug(primitive) + ' is not a Set-like'
			);
		});

		st.test('unable to get a Set Record', function (s2t) {
			forEach(v.objects, function (nonSetlike) {
				s2t['throws'](
					function () { union(set, nonSetlike); },
					TypeError,
					debug(nonSetlike) + ' is an Object, but is not Set-like'
				);
			});

			forEach(v.nonNumbers, function (nonNumber) {
				var nanSizedSetlike = {
					has: has,
					keys: function () {},
					size: nonNumber
				};
				s2t['throws'](
					function () { union(set, nanSizedSetlike); },
					TypeError,
					debug(nanSizedSetlike) + ' has a NaN `.size`'
				);
			});

			forEach(v.nonFunctions, function (nonFunction) {
				var badHas = {
					has: nonFunction,
					keys: function () {},
					size: 0
				};
				var badKeys = {
					has: has,
					keys: nonFunction,
					size: 0
				};

				s2t['throws'](
					function () { union(set, badHas); },
					TypeError,
					debug(badHas) + ' has a non-callable `.has`'
				);
				s2t['throws'](
					function () { union(set, badKeys); },
					TypeError,
					debug(badKeys) + ' has a non-callable `.keys`'
				);
			});

			s2t.end();
		});

		st.test('misbehaving `.keys`', function (s2t) {
			var setlikeThrows = {
				has: has,
				keys: function () { throw new SyntaxError('keys error'); },
				size: 0
			};

			s2t['throws'](
				function () { union(set, setlikeThrows); },
				SyntaxError,
				debug(setlikeThrows) + ' throws when `.keys` is called, on purpose'
			);

			forEach(v.primitives, function (primitive) {
				var primitiveIter = {
					has: has,
					keys: function () { return primitive; },
					size: 0
				};
				s2t['throws'](
					function () { union(set, primitiveIter); },
					TypeError,
					'setlike `.keys` returning ' + debug(primitive) + ' throws'
				);
			});

			forEach(v.nonFunctions, function (nonFunction) {
				var badIter = {
					has: has,
					keys: function () { return { next: nonFunction }; },
					size: 0
				};
				s2t['throws'](
					function () { union(set, badIter); },
					TypeError,
					debug(badIter) + ' has a non-callable `.next`'
				);
			});

			s2t.end();
		});

		st.end();
	});

	t.test('unions', function (st) {
		var set1 = new $Set([1, 2, 3]);
		testUnion(st, set1, set1, [1, 2, 3], 'returns the union of itself');

		var set2 = new $Set([4, 5, 6]);
		testUnion(st, set1, set2, [1, 2, 3, 4, 5, 6], 'returns the union of the two sets');

		var set3 = new $Set([1, 2, 3]);
		testUnion(st, set1, set3, [1, 2, 3], 'returns the union of two similar sets');

		var set4 = new $Set([3, 4, 5]);
		testUnion(st, set3, set4, [1, 2, 3, 4, 5], 'returns the union of the two sets with overlapping elements');

		var setLikeIter = {
			has: has,
			keys: function () {
				var i = 0;
				return {
					next: function fakeNext() {
						try {
							return {
								done: i >= 10,
								value: i
							};
						} finally {
							i += 2;
						}
					}
				};
			},
			size: 4
		};

		testUnion(st, set1, setLikeIter, [1, 2, 3, 0, 4, 6, 8], 'returns the union of the two sets when `other` is a Set-like with a manual iterator');

		st.end();
	});

	t.test('with a Map', { skip: typeof $Map !== 'function' }, function (st) {
		var s1 = new $Set([1, 2]);
		var m1 = new $Map([
			[2, 'two'],
			[3, 'three']
		]);
		testUnion(st, s1, m1, [1, 2, 3], 'returns the union of the two sets when `other` is a Map');

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/union/combines-itself', function (st) {
		var s1 = new $Set([1, 2]);
		var expected = new $Set([1, 2]);
		var combined = union(s1, s1);

		st.deepEqual(combined, expected);
		st.ok(combined instanceof $Set, 'returns a Set');
		st.notEqual(combined, s1, 'The returned object is a new object');

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/union/combines-same-sets', function (st) {
		var s1 = new $Set([1, 2]);
		var s2 = new $Set([1, 2]);
		var expected = new $Set([1, 2]);
		var combined = union(s1, s2);

		st.deepEqual(combined, expected);
		st.ok(combined instanceof $Set, 'returns a Set');
		st.notEqual(combined, s1, 'The returned object is a new object');
		st.notEqual(combined, s2, 'The returned object is a new object');

		st.end();
	});

	t.test('test262: test/built-ins/Set/prototype/union/result-order', function (st) {
		var s1 = new $Set([1, 2]);
		var s2 = new $Set([2, 3]);

		st.deepEqual(union(s1, s2), new $Set([1, 2, 3]));

		var s3 = new $Set([2, 3]);
		var s4 = new $Set([1, 2]);

		st.deepEqual(union(s3, s4), new $Set([2, 3, 1]));

		var s5 = new $Set([1, 2]);
		var s6 = new $Set([3]);

		st.deepEqual(union(s5, s6), new $Set([1, 2, 3]));

		var s7 = new $Set([3]);
		var s8 = new $Set([1, 2]);

		st.deepEqual(union(s7, s8), new $Set([3, 1, 2]));

		st.end();
	});

	return t.comment('tests completed');
};
