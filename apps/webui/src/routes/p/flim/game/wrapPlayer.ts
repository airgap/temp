import { bounds } from './defs';

export const wrapPlayer = (player: Phaser.GameObjects.Sprite) => {
	if (player.x > bounds.w) player.x = 0;
	else if (player.x < 0) player.x = bounds.w;
};
