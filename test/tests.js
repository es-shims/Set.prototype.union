'use strict';

var $Set = require('es-set/polyfill')();
var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var has = function () {}; // `union` needs `other` to have a `has`, even though it never uses it

var setEqual = function compareSetLikes(t, actual, expected, msg) {
	t.test('setlikes: ' + msg, function (st) {
		st.ok(actual instanceof expected.constructor, 'actual is an instance of the expected constructor');
		st.ok(expected instanceof actual.constructor, 'expected is an instance of the actual constructor');
		st.equal(actual.size, expected.size, 'they have the same size');

		actual.forEach(function (x) {
			st.ok(expected.has(x), debug(x) + ' (in actual) is in the expected set');
		});

		expected.forEach(function (x) {
			st.ok(actual.has(x), debug(x) + ' (in expected) is in the actual set');
		});

		st.end();
	});
};

module.exports = function (union, t) {
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
		var set2 = new $Set([4, 5, 6]);
		var result = union(set1, set2);

		st.ok(result instanceof $Set, 'returns a Set');
		setEqual(
			st,
			result,
			new $Set([1, 2, 3, 4, 5, 6]),
			'returns the union of the two sets'
		);

		var set3 = new $Set([1, 2, 3]);
		var set4 = new $Set([3, 4, 5]);
		var result2 = union(set3, set4);

		st.ok(result2 instanceof $Set, 'returns a Set when sets have overlapping elements');
		setEqual(
			st,
			result2,
			new $Set([1, 2, 3, 4, 5]),
			'returns the union of the two sets with overlapping elements'
		);

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

		var result3 = union(set1, setLikeIter);
		st.ok(result3 instanceof $Set, 'returns a Set when `other` is a Set-like with a manual iterator');
		setEqual(
			st,
			result3,
			new $Set([1, 2, 3, 0, 4, 6, 8]),
			'returns the union of the two sets with a manual iterator'
		);

		st.end();
	});

	return t.comment('tests completed');
};
