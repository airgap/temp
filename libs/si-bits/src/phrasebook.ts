import { type CompactedPhrasebook, getPhrasebook } from '@lyku/phrasebooks';
import { en_US } from '@lyku/strings';
import { getCookie } from 'monolith-ts-api';

export let language = getCookie('lang');
let pb: CompactedPhrasebook | undefined;
if (language) pb = getPhrasebook(language);
else {
	for (language of navigator.languages) {
		pb = getPhrasebook(language);
		if (pb) break;
	}
}
if (!pb) pb = en_US;

type Rule = [RegExp, (match: RegExpExecArray) => string];

const rules: Rule[] = [
	// Header rules
	[/^#{6}\s?(.+)/gm, (match) => `<h6>${match[1]}</h6>`],
	[/^#{5}\s?(.+)/gm, (match) => `<h5>${match[1]}</h5>`],
	[/^#{4}\s?(.+)/gm, (match) => `<h4>${match[1]}</h4>`],
	[/^#{3}\s?(.+)/gm, (match) => `<h3>${match[1]}</h3>`],
	[/^#{2}\s?(.+)/gm, (match) => `<h2>${match[1]}</h2>`],
	[/^#{1}\s?(.+)/gm, (match) => `<h1>${match[1]}</h1>`],

	// Bold and italics rules
	[/\*\*(.+?)\*\*/g, (match) => `<strong>${match[1]}</strong>`],
	[/\*(.+?)\*/g, (match) => `<em>${match[1]}</em>`],
	[/__(.+?)__/g, (match) => `<strong>${match[1]}</strong>`],
	[/(.+?)_/g, (match) => `<em>${match[1]}</em>`],

	// Link rules
	[
		/\[([^\]]+)\]\(([^)]+)\)/g,
		(match) => `<a href="${match[2]}">${match[1]}</a>`,
	],
	[/\[([^\][]+)\][^(]/g, (match) => `<a href="${match[1]}">${match[1]}</a>`],

	// Highlight rule
	[/`(.+?)`/g, (match) => `<span class="highlight">${match[1]}</span>`],

	// List rules
	[/^\+(.+)/gm, (match) => `<ul><li>${match[1]}</li></ul>`],
	[/^\*(.+)/gm, (match) => `<ul><li>${match[1]}</li></ul>`],

	// Image rule
	[
		/!\[([^\]]+)\]\(([^)]+)\s"([^"]+)"\)/g,
		(match) =>
			`<img src="${match[2]}" alt="${match[1]}" title="${match[3]}" />`,
	],
];

const convertTextToHtml = (text: string): string => {
	let result = text;

	rules.forEach(([regex, replaceFn]) => {
		result = result.replace(regex, (match, ...args) => {
			const regexExec = regex.exec(match);
			return regexExec ? replaceFn(regexExec) : match;
		});
	});

	return result;
};

const hydrate = (book: CompactedPhrasebook) =>
	Object.fromEntries(
		Object.entries(book).map(([k, v]) => [
			k,
			typeof v === 'string' ? v : convertTextToHtml(v.md),
		])
	);

export type HydratedPhrasebook = {
	[K in keyof CompactedPhrasebook]: string;
};

export const phrasebook = hydrate(pb) as HydratedPhrasebook;
