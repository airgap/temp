export const doesPlayerEatFood = (
	player: Phaser.GameObjects.Sprite,
	food: Phaser.GameObjects.Sprite,
) => {
	const foodRadius = food.displayWidth / 4;
	const playerRadius = player.displayWidth / 2;
	const distance = Math.sqrt(
		Math.pow(player.x - food.x, 2) + Math.pow(player.y - food.y, 2),
	);
	return distance < foodRadius + playerRadius;
};
