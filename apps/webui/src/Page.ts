import type { Channel, User } from '@lyku/json-models';

export interface PageProps {
	user?: User;
	channel?: Channel;
}
export interface Page {
	Props: PageProps;
}
