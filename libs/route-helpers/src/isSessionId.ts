import { sessionId } from 'bson-models';

const sessionPattern = new RegExp(sessionId.pattern);

export const isSessionId = (thing: unknown): thing is string =>
	typeof thing === 'string' && sessionPattern.test(thing);
