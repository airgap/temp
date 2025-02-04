import { ReactNode, useEffect, useState, useSyncExternalStore } from 'react';
import { User } from '@lyku/json-models';
import { sessionId } from 'monolith-ts-api';

const subscribers = new Set<() => void>();

let currentUser: User | undefined = undefined;

export const getCurrentUser = () => currentUser;

export const setCurrentUser = (user?: User) => {
	currentUser = user;
	if (user) {
		localStorage.setItem('currentUser', JSON.stringify(user));
	} else {
		localStorage.removeItem('currentUser');
	}
	subscribers.forEach((callback) => callback());
};

export const subscribeToCurrentUser = (callback: () => void) => {
	subscribers.add(callback);
	return () => {
		subscribers.delete(callback);
	};
};

export const useCurrentUser = () =>
	useSyncExternalStore(subscribeToCurrentUser, getCurrentUser);

export const useCurrentUserStatus = () => {
	const [user, setUser] = useState<User | undefined>(undefined);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const storedUser = localStorage.getItem('currentUser');
				if (storedUser) {
					setUser(JSON.parse(storedUser));
				}
				setLoading(false);
			} catch (error) {
				setError(error as Error);
				setLoading(false);
			}
		};

		const unsubscribe = subscribeToCurrentUser(() => {
			setUser(getCurrentUser());
		});

		fetchUser();

		return () => {
			unsubscribe();
		};
	}, []);

	return { user, loading, error };
};

interface MaybeUserProps {
	loggedIn?: (user: User) => ReactNode;
	loggedOut?: () => ReactNode;
	failed?: (error: Error) => ReactNode;
	meanwhile?: () => ReactNode;
	catchall?: (props: {
		user: User | undefined;
		loading: boolean;
		error: Error | null;
	}) => ReactNode;
}

export const MaybeUser = ({
	loggedIn,
	loggedOut,
	failed,
	meanwhile,
	catchall,
}: MaybeUserProps) => {
	const status = useCurrentUserStatus();

	if (status.loading && meanwhile) {
		return meanwhile();
	}

	if (status.error && failed) {
		return failed(status.error);
	}

	if (status.user && loggedIn && sessionId) {
		return loggedIn(status.user);
	}
	if (!sessionId && loggedOut) return loggedOut();
	return catchall?.(status);
};
// Load currentUser from localStorage on initial load
const storedUser = localStorage.getItem('currentUser');
if (storedUser) {
	currentUser = JSON.parse(storedUser);
}
