import { IncomingMessage } from 'http';
import { isSessionId, isUuid } from './app/isSessionId';

export const hasBotHeaders = (msg: IncomingMessage) =>
	isUuid(msg.headers.botid) && isSessionId(msg.headers.token);
