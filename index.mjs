import callBind from 'call-bind';
import RequireObjectCoercible from 'es-object-atoms/RequireObjectCoercible';

import getPolyfill from 'set.prototype.union/polyfill';

const bound = callBind(getPolyfill());

export default function union(set, other) {
	RequireObjectCoercible(set);
	return bound(set, other);
}

export { default as getPolyfill } from 'set.prototype.union/polyfill';
export { default as implementation } from 'set.prototype.union/implementation';
export { default as shim } from 'set.prototype.union/shim';
