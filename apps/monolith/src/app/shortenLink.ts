import phin from 'phin';

import { linkShortenerEndpoint } from './env';
import { FromSchema } from 'from-schema';
import { shortlinkRow } from 'models';
import { newShortlink } from 'models/apis/link-shortener';

console.log('end', linkShortenerEndpoint);
const linkShortenerLocal = ['127.0.0.1:8787', 'localhost'].includes(
	linkShortenerEndpoint,
);
console.log('local', linkShortenerLocal);
const protocol = linkShortenerLocal ? 'http:' : 'https:';
export const basepath = `${protocol}//${linkShortenerEndpoint}`;
const newShortlinkPath = `${basepath}/api/new`;
console.log('newShortlinkPath', newShortlinkPath);
export const shortenLink = (data: FromSchema<typeof shortlinkRow>) =>
	phin({
		url: newShortlinkPath,
		method: 'post',
		data,
	}).then((ok) => {
		const body = ok.body.toString();
		console.log('body', body);
		return JSON.parse(body) as FromSchema<typeof newShortlink.response>;
	});
