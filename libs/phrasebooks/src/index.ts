import de_DE_fallback from 'strings/de-DE-fallback.json';
import en_AR from 'strings/en-AR.json';
import en_US from 'strings/en-US.json';
// import en_US_angry from 'strings/en-US-angry.json';
import fr_FR_fallback from 'strings/fr-FR-fallback.json';
import ru_RU from 'strings/ru-RU.json';
import wa_GH from 'strings/wa-GH.json';
import ru_RU_fallback from 'strings/ru-RU-fallback.json';
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
