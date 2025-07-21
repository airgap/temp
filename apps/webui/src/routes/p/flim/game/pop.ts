export const pop = (
	o: Phaser.GameObjects.Sprite | Phaser.GameObjects.Text,
	scene: Phaser.Scene,
) => {
	o.setScale(1.2);
	scene.tweens.add({
		targets: [o],
		scale: 1,
		ease: 'Linear',
		duration: 500,
		yoyo: false,
		repeat: 0,
		callbackScope: this,
	});
};
