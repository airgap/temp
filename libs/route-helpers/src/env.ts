import { apiPorts } from '@lyku/defaults';

const { env } = process;
export const originCertificate = env['ORIGIN_CERTIFICATE'];
export const privateKey = env['PRIVATE_KEY'];
export const servicePort = env['SERVICE_PORT'] || apiPorts.http;
export const cfAccountId = env['CLOUDFLARE_ACCOUNT_ID'];
export const cfApiToken = env['CLOUDFLARE_API_TOKEN'];

export const webuiDomain = env['WEBUI_DOMAIN'] || 'localhost';
export const dev = process.env['DOPPLER_ENVIRONMENT'] === 'dev';
export const shortlinkDomain = env['SHORTLINK_DOMAIN'] || 'localhost';
export const shortlinkProtocol =
	shortlinkDomain === 'localhost' ? 'http' : 'https';
export const shortlinkBasepath =
	shortlinkProtocol + '://' + shortlinkDomain + '/';
export const natsPort = env['NATS_PORT'] || 'nats://localhost:4222';
export const dbConnectionString =
	env['PG_CONNECTION_STRING'] || 'postgresql://localhost:5434/Lyku';
console.log('dbConnectionString', dbConnectionString);
