import { ServerResponse } from 'http';

export const addBasicHeaders = (
	res: ServerResponse,
	// TODO: use this
	// secure = false
) => {
	// const allowed = `${secure ? 'https' : 'http'}://${webuiDomain}`;
	// console.log('allowed', allowed);
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('WWW-Authenticate', 'bearer');
	res.setHeader('Content-Type', 'application/json; charset=utf-8');
	res.setHeader('Access-Control-Allow-Methods', 'POST');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Sessionid, Set-Cookie, sessionid, sessionId, Authorization',
	);
	res.setHeader('Access-Control-Allow-Credentials', 'true');
};
