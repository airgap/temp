import type { Post, SessionId } from '@lyku/json-models';

export type ShowAuthEvent = 'login' | 'register';
export type SubmitClicked = Record<string, never>;
export type ShowTosEvent = Record<string, never>;
export type ProfilePictureChanged = string;
export type PulledScores = {
	edges: number;
	corners: number;
};
export type SonicEvents = {
	showAuth: ShowAuthEvent;
	showTos: ShowTosEvent;
	submitClicked: SubmitClicked;
	formReplied: SessionId;
	pulledScores: PulledScores;
	profilePictureChanged: ProfilePictureChanged;
	showAchievement: string;
	echo?: Post;
};
export type SonicKey = keyof SonicEvents;
type SonicEvent = SonicEvents[SonicKey];
export type SonicListener = {
	event: SonicKey;
	listener: (v: SonicEvent) => void;
};

const listeners: SonicListener[] = [];

export const listen = <K extends SonicKey>(
	event: K,
	listener: (v: SonicEvents[K]) => void,
): SonicListener => {
	const listenerObj = {
		event,
		listener: listener as (v: SonicEvent) => void,
	};
	listeners.push(listenerObj);
	return listenerObj;
};

export const shout = <K extends SonicKey>(
	eventName: K,
	props: SonicEvents[K],
) => {
	for (const listenerObj of listeners) {
		if (listenerObj.event === eventName) {
			(listenerObj.listener as (v: SonicEvents[K]) => void)(props);
		}
	}
};

export const silence = (listenerToRemove: SonicListener) => {
	const index = listeners.indexOf(listenerToRemove);
	if (index === -1) return false;
	listeners.splice(index, 1);
	return true;
};
