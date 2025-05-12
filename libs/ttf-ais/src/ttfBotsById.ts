import { ttfBots } from './ttfBots';
export const ttfBotsById = new Map<
	bigint,
	(typeof ttfBots)[keyof typeof ttfBots]
>(Object.values(ttfBots).map((b) => [b.user.id, b]));
