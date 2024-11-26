import { apiPorts } from '@lyku/defaults';
import { FromBsonSchema } from 'from-schema';
import { shortcode } from '@lyku/json-models';

const { hostname } = window.location;
export const local = ['localhost', '127.0.0.1'].includes(hostname);
const tunnel = hostname.endsWith('.use.devtunnels.ms');
const port = local ? apiPorts.http : 443;
const apiDomain = local
	? `localhost`
	: tunnel
		? hostname.replace(
				/[0-9]+\.use.devtunnels.ms/,
				'8444.use.devtunnels.ms',
			)
		: `api.${hostname}`;
export const apiHost = `${apiDomain}:${port}`;
export const socketPrefix = local ? 'ws' : 'wss';
console.log('apiHost', apiHost);
export const buildShortlink = (code: FromBsonSchema<typeof shortcode>) =>
	`//lyku.us/${code}`;
