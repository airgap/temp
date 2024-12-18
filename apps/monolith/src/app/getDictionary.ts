import { IncomingMessage } from 'http';
import { CompactedPhrasebook, getPhrasebook } from '@lyku/phrasebooks';
import { en_US } from '@lyku/strings';

import { getCookie } from './getCookie';

export const getDictionary = (msg: IncomingMessage): CompactedPhrasebook => {
	let lang = getCookie(msg.headers.cookie ?? '', 'lang');
	let dictionary;
	if (lang) dictionary = getPhrasebook(lang);
	else {
		const acceptableLanguages =
			msg.headers['accept-language'] ??
			''.replace(/;q=[0-9.]{1,3}/g, '').split(/, /g);
		for (lang of acceptableLanguages) {
			dictionary = getPhrasebook(lang);
			if (dictionary) break;
		}
	}
	if (!dictionary) dictionary = en_US;
	return dictionary;
};
