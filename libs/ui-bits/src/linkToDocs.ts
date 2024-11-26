import routemap from 'stats/route-map.json';
export const docsBase = '/docs/functions/libs_ui_bits_src.';
export const getDocsPage = () =>
	docsBase +
	Object.entries(routemap).find(([k]) =>
		new RegExp(k).test(window.location.pathname),
	)?.[1];
export const linkToDocs = () => window.open(getDocsPage(), '_blank');
