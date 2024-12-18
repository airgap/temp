import { sessionId, SessionId, uuid } from 'models';

const sessionPattern = new RegExp(sessionId.pattern);

export const isSessionId = (thing: unknown): thing is SessionId =>
	typeof thing === 'string' && sessionPattern.test(thing);

const uuidPattern = new RegExp(uuid.pattern);

export const isUuid = (thing: unknown): boolean =>
	typeof thing === 'string' && uuidPattern.test(thing);
