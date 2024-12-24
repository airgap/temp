import { load } from 'cheerio';
import { flagAttributes, flagUnsafeTags } from '@lyku/helpers';

function validateHtml(html: string): boolean {
	try {
		load(html);
		return false;
	} catch (e) {
		console.error('Invalid HTML submitted as post body', e);
		return true;
	}
}

export const flagUnsafeHtml = (inputHtml: string): boolean =>
	[flagUnsafeTags, flagAttributes, validateHtml].some((f) => f(inputHtml));
