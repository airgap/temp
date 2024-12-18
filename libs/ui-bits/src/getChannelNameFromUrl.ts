/**
 * @function getChannelNameFromUrl
 */
export const getChannelNameFromUrl = () =>
	window.location.pathname.match(/^\/([a-z0-9]+)\/?/i)?.[1] ?? '';
