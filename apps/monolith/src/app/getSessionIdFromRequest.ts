import { getCookie } from './getCookie';
import { Messagish } from './Messagish';

export const getSessionIdFromRequest = ({
	headers: { authorization, cookie },
}: Messagish) =>
	authorization?.substring(7) ?? (cookie && getCookie(cookie, 'sessionId'));
