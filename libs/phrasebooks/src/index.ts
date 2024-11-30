import {de_DE_fallback,en_AR,en_US,fr_FR_fallback,ru_RU,ru_RU_fallback,wa_GH} from '@lyku/strings';
import { blaze } from 'blazebook';
import { PhrasebookMap } from 'blazebook/dist/Phrasebook';

export const phrasebooks = {
	'de-DE': de_DE_fallback,
	'en-AR': en_AR,
	'en-US': en_US,
	// 'en-US-angry': en_US_angry,
	'fr-FR': fr_FR_fallback,
	'ru-RU': ru_RU,
	'ru-RU-fallback': ru_RU_fallback,
	'wa-GH': wa_GH,
} as const satisfies PhrasebookMap;
export const { getPhrasebook, compactedPhrasebooks } = blaze(
	phrasebooks,
	'en-US',
);
export type CompactedPhrasebooks = typeof compactedPhrasebooks;
export type Lang = keyof CompactedPhrasebooks;
export type CompactedPhrasebook = CompactedPhrasebooks[Lang];
