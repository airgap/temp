export const safeTags = [
	'br',
	'p',
	's',
	'strong',
	'b',
	'i',
	'em',
	'u',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'table',
	'tr',
	'th',
	'td',
	'ul',
	'ol',
	'li',
];
export const fullSafeTags = safeTags.flatMap((tag) => [
	`<${tag}>`,
	`</${tag}>`,
]);

const tagReg = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
export const flagUnsafeTags = (inputHtml: string): boolean =>
	Boolean(
		inputHtml.match(tagReg)?.find((tag) => {
			const res = !fullSafeTags.includes(tag.toLowerCase());
			console.log('tag', tag, 'res', res);
			return res;
		}),
	);
export const flagAttributes = (inputHtml: string): boolean =>
	/<[a-z][a-z0-9]*\s+[^>]+>/i.test(inputHtml);
