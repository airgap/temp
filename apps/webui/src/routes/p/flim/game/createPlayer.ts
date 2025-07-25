import type { Scene } from 'phaser';
import { bounds, center } from './defs';
import { mix } from '@lyku/helpers';

export const createPlayer = (that: Scene) => {
	const player = that.physics.add.sprite(
		center.x,
		mix(bounds.h, center.y, 0.3),
		'chomping',
	);
	(player?.body as any)!.allowGravity = false;
	player.scale = 0.5;
	// Animation set
	player.anims.create({
		key: 'chomping',
		frames: that.anims.generateFrameNumbers('chomping', {
			start: 0,
			end: 8,
		}),
		frameRate: 60,
		repeat: 1,
		yoyo: true,
	});
	return player;
};
export const desiredAngles = new Map<Phaser.GameObjects.Sprite, number>();
