import { mix } from '@lyku/helpers';
import { heldKeys, heldKeyVelocity } from './heldKeys';
import { wrapPlayer } from './wrapPlayer';
import { deceleratePlayer } from './deceleratePlayer';

const { A, LEFT, D, RIGHT } = Phaser.Input.Keyboard.KeyCodes;

export const movePlayer = (
	player: Phaser.GameObjects.Sprite,
	delta: number,
) => {
	if (!player?.body) return;
	const leftHeld = Number(heldKeys.has(LEFT) || heldKeys.has(A));
	const rightHeld = Number(heldKeys.has(RIGHT) || heldKeys.has(D));
	const dir = (rightHeld - leftHeld) * heldKeyVelocity;
	if (dir) player.body.velocity.x = dir;
	else deceleratePlayer(player, delta);

	wrapPlayer(player);
	const desiredAngle = (player.body.velocity.x / heldKeyVelocity) * 90;
	player.angle = mix(desiredAngle, player.angle, 0.9);
};
