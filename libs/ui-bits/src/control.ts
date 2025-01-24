import { useEffect, useSyncExternalStore } from 'react';

const validKeys = [
	'ArrowUp',
	'ArrowDown',
	'ArrowLeft',
	'ArrowRight',
	'Space',
] as const;
type ValidKeys = typeof validKeys;
type ValidKey = ValidKeys[number];
const isValidKey = (key: string): key is ValidKey =>
	validKeys.includes(key as ValidKey);
type KeyMap = Record<ValidKey, boolean>;

const createPressedKeysStore = () => {
	let pressedKeys: KeyMap = {
		ArrowDown: false,
		ArrowLeft: false,
		ArrowRight: false,
		Space: false,
		ArrowUp: false,
	};

	const subscribers = new Set<() => void>();

	const subscribe = (callback: () => void) => {
		subscribers.add(callback);
		return () => subscribers.delete(callback);
	};

	const setPressedKeys = (
		newPressedKeysOrCallback: KeyMap | ((prevPressedKeys: KeyMap) => KeyMap),
	) => {
		if (typeof newPressedKeysOrCallback === 'function') {
			pressedKeys = newPressedKeysOrCallback(pressedKeys);
		} else {
			pressedKeys = newPressedKeysOrCallback;
		}
		subscribers.forEach((callback) => callback());
	};

	const getPressedKeys = () => pressedKeys;

	return {
		subscribe,
		setPressedKeys,
		getPressedKeys,
	};
};

const pressedKeysStore = createPressedKeysStore();
export const usePressedKeys = () => {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isValidKey(e.key)) return;
			pressedKeysStore.setPressedKeys((pk) => ({ ...pk, [e.key]: true }));
			e.preventDefault();
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (!isValidKey(e.key)) return;
			pressedKeysStore.setPressedKeys((pk) => ({ ...pk, [e.key]: false }));
			e.preventDefault();
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, []);
	return useSyncExternalStore(
		pressedKeysStore.subscribe,
		pressedKeysStore.getPressedKeys,
	);
};
