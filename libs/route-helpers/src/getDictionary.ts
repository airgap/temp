import { getPhrasebook } from '@lyku/phrasebooks';
import { CompactedPhrasebook } from '@lyku/phrasebooks';
import { getCookie } from './getCookie';
import { en_US } from '@lyku/strings';

export const getDictionary = (req: Request): CompactedPhrasebook => {
	let lang = getCookie(req.headers.get('cookie') ?? '', 'lang');
	let dictionary;
	if (lang) dictionary = getPhrasebook(lang);
	else {
		const acceptableLanguages = (req.headers.get('accept-language') ?? '')
			.replace(/;q=[0-9.]{1,3}/g, '')
			.split(/, /g);
		for (lang of acceptableLanguages) {
			dictionary = getPhrasebook(lang);
			if (dictionary) break;
		}
	}
	if (!dictionary) dictionary = en_US;
	return dictionary;
};
