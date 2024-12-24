import { apiPorts } from 'defaults';

const { env } = process;
export const originCertificate = env['ORIGIN_CERTIFICATE'];
export const privateKey = env['PRIVATE_KEY'];
export const servicePort = env['SERVICE_PORT'] || apiPorts.http;
export const cfAccountId = env['CF_ACCOUNT_ID'];
export const cfApiToken = env['CF_API_TOKEN'];
export const linkShortenerEndpoint =
	env['LINK_SHORTENER_ENDPOINT'] || '127.0.0.1';
export const linkShortenerToken = env['LINK_SHORTENER_TOKEN'] || 'dicknballs';

export const webuiDomain = env['WEBUI_DOMAIN'] || 'localhost';
export const dev = process.env['DOPPLER_ENVIRONMENT'] === 'dev';
export const shortlinkDomain = env['SHORTLINK_DOMAIN'] || 'localhost';
export const shortlinkProtocol =
	shortlinkDomain === 'localhost' ? 'http' : 'https';
export const shortlinkBasepath =
	shortlinkProtocol + '://' + shortlinkDomain + '/';
