import { getCookie } from 'monolith-ts-api';
import { CompactedPhrasebook, getPhrasebook } from 'phrasebooks';
import en_US from 'strings/en-US.json';

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
