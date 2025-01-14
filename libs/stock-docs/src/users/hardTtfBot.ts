import { User } from '@lyku/json-models';
import { defaultDate } from '../defaultDate';
export const hardTtfBot = {
	banned: false,
	bot: true,
	chatColor: 'FFFFFF',
	confirmed: false,
	id: 13n,
	joined: defaultDate,
	lastLogin: defaultDate,
	live: false,
	postCount: 0n,
	username: 'lykuHardTtfBot',
	profilePicture: '/bots/anger-zoom.png',
	points: 0,
	slug: 'lykuhardttfbot',
	staff: true,
	groupLimit: 0,
	lastSuper: defaultDate,
} as const satisfies User;
