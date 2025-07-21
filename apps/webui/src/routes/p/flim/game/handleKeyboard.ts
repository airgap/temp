import { heldKeys } from './heldKeys';

export const handleKeyboard = (
	keyboard: Phaser.Input.Keyboard.KeyboardPlugin,
) => {
	for (const key of ['A', 'LEFT', 'D', 'RIGHT'] as const) {
		keyboard.on('keydown-' + key, () =>
			heldKeys.add(Phaser.Input.Keyboard.KeyCodes[key]),
		);
		keyboard.on('keyup-' + key, () =>
			heldKeys.delete(Phaser.Input.Keyboard.KeyCodes[key]),
		);
	}
};
