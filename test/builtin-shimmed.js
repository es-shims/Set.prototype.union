'use strict';

require('../auto');

var test = require('tape');

var runTests = require('./builtin');

test('builtin shimmed', function (t) {
	runTests(t);

	t.end();
});
