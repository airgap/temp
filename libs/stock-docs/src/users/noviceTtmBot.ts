import { User } from '@lyku/json-models';
import { defaultDate } from '../defaultDate';
export const noviceTtmBot = {
	banned: false,
	bot: true,
	chatColor: 'FFFFFF',
	confirmed: false,
	id: 20n,
	joined: defaultDate,
	lastLogin: defaultDate,
	live: false,
	postCount: 0n,
	username: 'lykuNoviceTtmBot',
	profilePicture: '/bots/cute-zoom.png',
	points: 0,
	slug: 'lykunovicettmbot',
	staff: true,
	groupLimit: 0,
	lastSuper: defaultDate,
} as const satisfies User;
