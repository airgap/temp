import { getCookie } from 'monolith-ts-api';
import { CompactedPhrasebook, getPhrasebook } from '@lyku/phrasebooks';
import {en_US} from '@lyku/strings';

export const getDictionary = (): CompactedPhrasebook => {
	let lang = getCookie('lang');
	let dictionary;
	if (lang) dictionary = getPhrasebook(lang);
	else {
		for (lang of navigator.languages) {
			dictionary = getPhrasebook(lang);
			if (dictionary) break;
		}
	}
	if (!dictionary) dictionary = en_US;
	return dictionary;
};
