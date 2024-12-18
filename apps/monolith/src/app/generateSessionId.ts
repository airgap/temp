import { randomBytes } from 'crypto';
import { SessionId } from 'models';

export const generateSessionId = (): SessionId =>
	randomBytes(32).toString('base64');
