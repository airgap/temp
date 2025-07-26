import { mix } from '@lyku/helpers';
import { heldKeys, heldKeyVelocity } from './heldKeys';
import { wrapPlayer } from './wrapPlayer';
import { deceleratePlayer } from './deceleratePlayer';

const { A, LEFT, D, RIGHT, DOWN, S } = Phaser.Input.Keyboard.KeyCodes;

export const movePlayer = (
	player: Phaser.GameObjects.Sprite,
	delta: number,
) => {
	if (!player?.body) return;
	const leftHeld = Number(heldKeys.has(LEFT) || heldKeys.has(A));
	const rightHeld = Number(heldKeys.has(RIGHT) || heldKeys.has(D));
	const downHeld = Number(heldKeys.has(DOWN) || heldKeys.has(S));
	const dir = (rightHeld - leftHeld) * heldKeyVelocity * (1 - downHeld);
	if (dir) player.body.velocity.x = dir;
	else deceleratePlayer(player, delta);
	if (downHeld) {
		player.body.velocity.x *= 0.85;
		player.angle *= 0.85;
	}

	wrapPlayer(player);
	const desiredAngle = (player.body.velocity.x / heldKeyVelocity) * 90;
	player.angle = mix(desiredAngle, player.angle, 0.9);
};
