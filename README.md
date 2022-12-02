# set.prototype.union <sup>[![Version Badge][npm-version-svg]][package-url]</sup>

[![github actions][actions-image]][actions-url]
[![coverage][codecov-image]][codecov-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![npm badge][npm-badge-png]][package-url]

ES Proposal spec-compliant shim for Set.prototype.union. Invoke its "shim" method to shim `Set.prototype.union` if it is unavailable or noncompliant.

This package implements the [es-shim API](https://github.com/es-shims/api) interface. It works in an ES3-supported environment, and complies with the [proposed spec](https://github.com/tc39/proposal-set-methods). When shimmed, it uses [`es-set`](https://npmjs.com/es-set) to shim the `Set` implementation itself if needed.

Most common usage:
```js
var assert = require('assert');
var union = require('set.prototype.union');

var set1 = new Set([1, 2]);
var set2 = new Set([2, 3]);
var result = union(set1, set2);

assert.deepEqual(result, new Set([1, 2, 3]));

union.shim();

var shimmedResult = set1.union(set2);
assert.deepEqual(shimmedResult, new Set([1, 2, 3]));
```

## Tests
Simply clone the repo, `npm install`, and run `npm test`

[package-url]: https://npmjs.com/package/set.prototype.union
[npm-version-svg]: http://versionbadg.es/es-shims/Set.prototype.union.svg
[deps-svg]: https://david-dm.org/es-shims/Set.prototype.union.svg
[deps-url]: https://david-dm.org/es-shims/Set.prototype.union
[dev-deps-svg]: https://david-dm.org/es-shims/Set.prototype.union/dev-status.svg
[dev-deps-url]: https://david-dm.org/es-shims/Set.prototype.union#info=devDependencies
[testling-svg]: https://ci.testling.com/es-shims/Set.prototype.union.png
[testling-url]: https://ci.testling.com/es-shims/Set.prototype.union
[npm-badge-png]: https://nodei.co/npm/set.prototype.union.png?downloads=true&stars=true
[license-image]: http://img.shields.io/npm/l/set.prototype.union.svg
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/set.prototype.union.svg
[downloads-url]: http://npm-stat.com/charts.html?package=set.prototype.union
[codecov-image]: https://codecov.io/gh/es-shims/Set.prototype.union/branch/main/graphs/badge.svg
[codecov-url]: https://app.codecov.io/gh/es-shims/Set.prototype.union/
[actions-image]: https://img.shields.io/endpoint?url=https://github-actions-badge-u3jn4tfpocch.runkit.sh/es-shims/Set.prototype.union
[actions-url]: https://github.com/es-shims/Set.prototype.union/actions
