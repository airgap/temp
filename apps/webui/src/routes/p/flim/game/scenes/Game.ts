/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { mix } from '@lyku/helpers';
import { bounds, center, random } from '../defs';
import { EventBus } from '../EventBus';
import { createPlayer } from '../createPlayer';
import { movePlayer } from '../movePlayer';
import { heldKeys } from '../heldKeys';
import { handleKeyboard } from '../handleKeyboard';
import { doesPlayerEatFood } from '../doesPlayerEatFood';
import { pop } from '../pop';
/* END-USER-IMPORTS */

type Sprite = Phaser.GameObjects.Sprite;
// const pressVelocity = 600;

const baseDropInterval = 500;
const maxLives = 2;
// const baseGravity =

export default class Game extends Phaser.Scene {
	lives = maxLives;
	speed = 300;
	extraDropInterval = 500;
	foods: Sprite[] = [];
	scoreText?: Phaser.GameObjects.Text;
	dropTimer?: NodeJS.Timeout;
	player?: Sprite;
	desiredAngle = 0;
	score = 0;
	combo = 1;
	streakText?: Phaser.GameObjects.Text;
	consecutive = 0;
	livesText?: Phaser.GameObjects.Text;
	lifeSprite?: Sprite;
	constructor() {
		super('Game');

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}
	eatFood(f: number) {
		this.foods.splice(f, 1)[0].destroy();
		this.score += this.combo;
		this.scoreText?.setText(
			`${this.score} point${this.score === 1 ? '' : 's'}`,
		);
		this.player?.anims.play('chomping');
		this.consecutive++;
		if (this.consecutive >= 10 && this.consecutive % 10 === 0) {
			this.combo++;
			if (this.streakText) pop(this.streakText, this);
		}
		this.streakText!.text = this.combo > 1 ? `X${this.combo} MULT` : '';
	}
	tryEatingFood() {
		if (!this.player) return;
		for (let f = this.foods.length - 1; f >= 0; f--) {
			if (doesPlayerEatFood(this.player, this.foods[f])) {
				this.eatFood(f);
			}
		}
	}
	removeOldFood() {
		if (!this.foods.length) return;
		const food = this.foods[0];
		if (food.y > bounds.h) {
			food.destroy();
			this.foods.shift();
			this.combo = 1;
			this.consecutive = 0;
			this.streakText!.text = '';
			this.lives--;
			this.livesText?.setText('X' + this.lives);
			if (this.livesText) pop(this.livesText, this);
			if (this.lives < 0) this.endGame();
		}
	}
	update(time: number, delta: number) {
		if (this.input.keyboard) handleKeyboard(this.input.keyboard);
		if (this.player) movePlayer(this.player, delta);
		this.tryEatingFood();
		this.removeOldFood();
	}
	increaseGravity() {
		const { gravity } = this.physics.config;
		if (!gravity) return;
		gravity.y = Math.min(gravity.y * 1.02, 600);
	}
	dropFood() {
		this.extraDropInterval *= 0.99;
		this.dropTimer = setTimeout(
			() => this.dropFood(),
			baseDropInterval + this.extraDropInterval,
		);
		this.increaseGravity();
		const food = this.physics.add.sprite(random.x(50), -100, '0001');
		food.blendMode = Phaser.BlendModes.ADD;
		food.scale = 0.5;
		food.body.setAccelerationY(200);
		food.play('food0');
		this.foods.push(food);
		// food.body!.setVelocityY(this.speed);
	}

	editorCreate(): void {
		this.events.emit('scene-awake');
	}

	/* START-USER-CODE */

	// Write your code here

	create() {
		this.editorCreate();

		this.cameras.main.setBackgroundColor(0x000000);
		// screw13a
		const bg = this.add.image(center.x, center.y, 'screw13a');
		bg.alpha = 0.5;

		// score
		this.scoreText = this.add.text(center.x, bounds.h * 0.1, '', {});
		this.scoreText.setOrigin(0.5, 0.5);
		this.scoreText.text = '';
		this.scoreText.setStyle({
			align: 'center',
			color: '#ffffff',
			fontFamily: 'Futura',
			fontSize: '68px',
			stroke: '#000000',
			strokeThickness: 8,
		});

		// score
		this.streakText = this.add.text(center.x, bounds.h * 0.2, '', {});
		this.streakText.setOrigin(0.5, 0.5);
		this.streakText.text = '';
		this.streakText.setStyle({
			align: 'center',
			color: '#ffffff',
			fontFamily: 'Futura',
			fontSize: '38px',
			stroke: '#000000',
			strokeThickness: 8,
		});

		const lifeCounterY = bounds.h - 40;

		this.lifeSprite = this.add.sprite(40, lifeCounterY, 'chomping');
		this.lifeSprite.scale = 0.25;
		// life count
		this.livesText = this.add.text(70, lifeCounterY, 'X2', {});
		this.livesText.setOrigin(0, 0.5);
		this.livesText.text = 'X' + this.lives;
		this.livesText.setStyle({
			align: 'left',
			color: '#ffffff',
			fontFamily: 'Futura',
			fontSize: '35px',
			stroke: '#000000',
			strokeThickness: 8,
		});

		this.player = createPlayer(this);
		this.startGame();
		EventBus.emit('current-scene-ready', this);
	}

	startGame() {
		this.lifeSprite?.setScale(0.25);
		this.livesText?.setScale(1);

		this.dropFood();
	}

	endGame() {
		clearTimeout(this.dropTimer);
		this.dropTimer = undefined;
		for (const food of this.foods) {
			food.destroy();
		}
		this.foods = [];
		this.lifeSprite?.setScale(0);
		this.livesText?.setScale(0);
		// this.scene.start('GameOver');
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
