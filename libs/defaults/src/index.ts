type PortSet = {
	http?: number;
	ws?: number;
};
export const apiPorts: PortSet = {
	http: 8444,
	ws: 1337,
};

export const cfAccountHash = 'oBC98tw9WOLImQw1TK-Qwg';

export const placeholderLogo = 'bbce90da-abe2-4970-4b54-6c9034496d00';

export const imageMimeList = [
	'image/png',
	'image/jpg',
	'image/jpeg',
	'image/gif',
	'image/webp',
] as const;
export const videoMimeList = ['video/mov', 'video/mp4'] as const;
export const audioMimeList = [
	'audio/mpeg',
	'audio/mp3',
	'audio/aac',
	'audio/wav',
	'audio/ogg',
	'audio/webm',
] as const;
export const imageMimes = imageMimeList.join(', ');
export const videoMimes = videoMimeList.join(', ');
export const audioMimes = audioMimeList.join(', ');

export const imageAndVideoMimes = `${imageMimes}, ${videoMimes}`;
