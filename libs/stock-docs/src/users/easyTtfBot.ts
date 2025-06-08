import type { User } from '@lyku/json-models';
import { defaultDate } from '../defaultDate';
export const easyTtfBot = {
	bot: true,
	chatColor: 'FFFFFF',
	id: 11n,
	joined: defaultDate,
	lastLogin: defaultDate,
	live: false,
	postCount: 0n,
	username: 'lykuEasyTtfBot',
	profilePicture: '/bots/smile-zoom.png',
	points: 0n,
	slug: 'lykueasyttfbot',
	groupLimit: 0,
	lastSuper: defaultDate,
	staff: true,
	created: defaultDate,
	// channelLimit: 0,
} as const satisfies User;
