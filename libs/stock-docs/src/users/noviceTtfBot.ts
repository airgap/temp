import type { User } from '@lyku/json-models';
import { defaultDate } from '../defaultDate';
export const noviceTtfBot = {
	banned: false,
	bot: true,
	chatColor: 'FFFFFF',
	confirmed: false,
	id: 10n,
	joined: defaultDate,
	lastLogin: defaultDate,
	live: false,
	postCount: 0n,
	username: 'lykuNoviceTtfBot',
	profilePicture: '/bots/cute-zoom.png',
	points: 0n,
	slug: 'lykunovicettfbot',
	staff: true,
	groupLimit: 0,
	lastSuper: defaultDate,
} as const satisfies User;
