import { heldKeys } from './heldKeys';

export const handleKeyboard = (
	keyboard: Phaser.Input.Keyboard.KeyboardPlugin,
) => {
	for (const key of ['A', 'LEFT', 'D', 'RIGHT', 'DOWN', 'S'] as const) {
		keyboard.on('keydown-' + key, (e) => {
			e.preventDefault();
			heldKeys.add(Phaser.Input.Keyboard.KeyCodes[key]);
		});
		keyboard.on('keyup-' + key, (e) => {
			e.preventDefault();
			heldKeys.delete(Phaser.Input.Keyboard.KeyCodes[key]);
		});
	}
};
