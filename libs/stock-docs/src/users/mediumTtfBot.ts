import type { User } from '@lyku/json-models';
import { defaultDate } from '../defaultDate';
export const mediumTtfBot = {
	banned: false,
	bot: true,
	chatColor: 'FFFFFF',
	confirmed: false,
	id: 12n,
	joined: defaultDate,
	lastLogin: defaultDate,
	live: false,
	postCount: 0n,
	username: 'lykuMediumTtfBot',
	profilePicture: '/bots/nonplussed-zoom.png',
	points: 0n,
	slug: 'lykumediumttfbot',
	staff: true,
	groupLimit: 0,
	lastSuper: defaultDate,
} as const satisfies User;
