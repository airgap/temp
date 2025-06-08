import { apiPorts } from '@lyku/defaults';

const { env } = process;
export const originCertificate = Buffer.from(
	env['ORIGIN_CERTIFICATE'] ?? '',
	'base64',
).toString();
export const privateKey = Buffer.from(
	env['PRIVATE_KEY'] ?? '',
	'base64',
).toString();
// console.log('originCertificate', originCertificate);
// console.log('privateKey', privateKey);
export const servicePort = env['SERVICE_PORT'] || apiPorts.http;
export const cfAccountId = env['CF_ID'];
export const cfApiToken = env['CF_API_TOKEN'];

export const webuiDomain = env['WEBUI_DOMAIN'] || 'localhost';
export const dev = process.env['DOPPLER_ENVIRONMENT'] === 'dev';
export const shortlinkDomain = env['SHORTLINK_DOMAIN'] || 'localhost';
export const shortlinkProtocol =
	shortlinkDomain === 'localhost' ? 'http' : 'https';
export const shortlinkBasepath =
	shortlinkProtocol + '://' + shortlinkDomain + '/';
export const dbConnectionString =
	env['PG_CONNECTION_STRING'] || 'postgresql://localhost:5434/Lyku';
console.log('dbConnectionString', dbConnectionString);
