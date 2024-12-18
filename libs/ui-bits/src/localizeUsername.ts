import { phrasebook } from './phrasebook';

export const localizeUsername = (username?: string) => {
	if (!username?.startsWith('lyku')) return username;
	return username in phrasebook
		? phrasebook[username as keyof typeof phrasebook]
		: username;
};
