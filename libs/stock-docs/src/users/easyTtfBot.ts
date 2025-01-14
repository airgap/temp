import { User } from '@lyku/json-models';
import { defaultDate } from '../defaultDate';
export const easyTtfBot = {
	banned: false,
	bot: true,
	chatColor: 'FFFFFF',
	confirmed: false,
	id: 11n,
	joined: defaultDate,
	lastLogin: defaultDate,
	live: false,
	postCount: 0n,
	username: 'lykuEasyTtfBot',
	profilePicture: '/bots/smile-zoom.png',
	points: 0,
	slug: 'lykueasyttfbot',
	groupLimit: 0,
	lastSuper: defaultDate,
	staff: true,
	// channelLimit: 0,
} as const satisfies User;
