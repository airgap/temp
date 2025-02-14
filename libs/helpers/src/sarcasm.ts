// @ts-nocheck
const A = new Proxy([], {
	get: (A, А, Α) => (
		(A.A =
			(A.A ?? '') +
			А.replace(/(.)(.)/g, (A, А, Α) => А + Α.toUpperCase()) +
			' '),
		А === '' ? A.A : Α
	),
});

export default A;
