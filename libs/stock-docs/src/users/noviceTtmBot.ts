import type { User } from '@lyku/json-models';
import { defaultDate } from '../defaultDate';
export const noviceTtmBot = {
	bot: true,
	chatColor: 'FFFFFF',
	id: 20n,
	joined: defaultDate,
	lastLogin: defaultDate,
	live: false,
	postCount: 0n,
	username: 'lykuNoviceTtmBot',
	profilePicture: '/bots/cute-zoom.png',
	points: 0n,
	slug: 'lykunovicettmbot',
	staff: true,
	groupLimit: 0,
	lastSuper: defaultDate,
	created: defaultDate,
} as const satisfies User;
