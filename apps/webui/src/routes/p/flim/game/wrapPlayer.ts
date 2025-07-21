import { bounds } from './defs';

export const wrapPlayer = (player: Phaser.GameObjects.Sprite) => {
	if (player.x > bounds.w + 128) player.x = -128;
	else if (player.x < -128) player.x = bounds.w + 128;
};
