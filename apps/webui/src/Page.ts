import { Channel, User } from 'models';

export interface PageProps {
	user?: User;
	channel?: Channel;
}
export interface Page {
	Props: PageProps;
}
