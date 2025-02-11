import { apiPorts } from '@lyku/defaults';
import type { FromBsonSchema } from 'from-schema';
import { shortcode } from '@lyku/json-models';

// Default to server-side behavior
let currentHostname = 'localhost';

// Update hostname when platform changes
export const updateHostname = (hostname: string) => {
	currentHostname = hostname;
};

const getHostname = () => currentHostname;

export const local = ['localhost', '127.0.0.1'].includes(getHostname());
const tunnel = getHostname().endsWith('.use.devtunnels.ms');
const port = local ? apiPorts.http : 443;
const apiDomain = local
	? `localhost`
	: tunnel
	? getHostname().replace(/[0-9]+\.use.devtunnels.ms/, '8444.use.devtunnels.ms')
	: `api.${getHostname()}`;
// export const apiHost = `${apiDomain}:${port}`;
export const socketPrefix = local ? 'ws' : 'wss';
// console.log('apiHost', apiHost);
export const buildShortlink = (code: FromBsonSchema<typeof shortcode>) =>
	`//lyku.us/${code}`;
