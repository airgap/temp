export const deceleratePlayer = (
	player: Phaser.GameObjects.Sprite,
	delta: number,
) => {
	if (!player?.body) return;
	const baseRatioReduction = 0.003;
	const accountingForDelta = baseRatioReduction * delta;
	const vMultiplier = 1 - accountingForDelta;
	const oldV = player.body.velocity.x;
	const newV = Math.abs(oldV) > 1 ? oldV * vMultiplier : 0;
	player.body.velocity.x = newV;
};
