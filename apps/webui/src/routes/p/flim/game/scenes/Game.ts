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
import { bitAngle } from '../bitAngle';
import { vectorToCoords } from '../vectorToCoords';
/* END-USER-IMPORTS */

type Sprite = Phaser.GameObjects.Sprite;
// const pressVelocity = 600;

const baseDropInterval = 500;
const maxLives = 2;
const comboMinimum = 8;
// const baseGravity =

export default class Game extends Phaser.Scene {
	lives = maxLives;
	speed = 300;
	extraDropInterval = 500;
	foods: Sprite[] = [];
	scoreText?: Phaser.GameObjects.Text;
	dropTimer?: NodeJS.Timeout;
	playerSprite?: Sprite;
	desiredAngle = 0;
	score = 0;
	combo = 1;
	streakText?: Phaser.GameObjects.Text;
	consecutive = 0;
	livesText?: Phaser.GameObjects.Text;
	lifeSprite?: Sprite;
	bitSprites: Sprite[] = [];
	playerContainer?: Phaser.GameObjects.Container;
	track?: Phaser.Sound.BaseSound;
	hitSounds: Phaser.Sound.BaseSound[] = [];
	comboHitSounds: Phaser.Sound.BaseSound[] = [];
	constructor() {
		super('Game');

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}
	showBits() {
		for (let b = this.bitSprites.length - 1; b >= 0; b--)
			this.tweens.add({
				targets: [this.bitSprites[b]],
				scale: Number(this.consecutive % comboMinimum > b) / 2,
				ease: 'Linear',
				duration: 250,
				yoyo: false,
				repeat: 0,
				callbackScope: this,
			});
	}
	eatFood(f: number) {
		this.foods.splice(f, 1)[0].destroy();
		this.score += this.combo;
		this.scoreText?.setText(
			`${this.score} point${this.score === 1 ? '' : 's'}`,
		);
		this.playerSprite?.anims.play('chomping');
		this.consecutive++;
		if (this.consecutive >= 4 && this.consecutive % comboMinimum === 0) {
			if (this.combo < 10) this.combo++;
			if (this.streakText) pop(this.streakText, this);
			this.comboHitSounds[
				Math.min(this.combo - 2, this.comboHitSounds.length - 1)
			].play();
		}
		this.hitSounds[(this.consecutive - 1) % comboMinimum].play();
		this.showBits();
		const maxed = this.combo === 10 ? 'MAX ' : '';
		this.streakText!.text =
			this.combo > 1 ? `X${this.combo} ${maxed}COMBO` : '';
		if (this.consecutive % 80 === 0 && this.consecutive > 3) {
			this.lives++;
			if (this.livesText) {
				this.livesText?.setText('X' + this.lives);
				pop(this.livesText, this);
			}
		}
	}
	tryEatingFood() {
		if (!this.playerSprite) return;
		for (let f = this.foods.length - 1; f >= 0; f--) {
			if (doesPlayerEatFood(this.playerSprite, this.foods[f])) {
				this.eatFood(f);
			}
		}
	}
	resetCombo() {
		this.combo = 1;
		this.consecutive = 0;
		this.streakText!.text = '';
		this.lives--;
		this.showBits();
		this.livesText?.setText('X' + this.lives);
		if (this.livesText) pop(this.livesText, this);
		if (this.lives < 0) this.endGame();
	}
	removeOldFood() {
		if (!this.foods.length) return;
		const food = this.foods[0];
		if (food.y > bounds.h) {
			food.destroy();
			this.foods.shift();
			this.resetCombo();
		}
	}
	moveBitsToPlayer() {
		if (!(this.playerContainer && this.playerSprite)) return;
		this.playerContainer.x =
			this.playerSprite.x + this.playerSprite.body!.velocity.x / 75;
		this.playerContainer.y =
			this.playerSprite.y + this.playerSprite.body!.velocity.y / 75;
		// this.playerContainer.copyPosition(this.playerSprite);
		this.playerContainer.angle = this.playerSprite.angle;
	}
	update(time: number, delta: number) {
		if (this.input.keyboard) handleKeyboard(this.input.keyboard);
		if (this.playerSprite) movePlayer(this.playerSprite, delta);
		this.tryEatingFood();
		this.removeOldFood();
		this.moveBitsToPlayer();
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
		const food = this.physics.add.sprite(random.x(50), -bounds.h / 4, '0001');
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

		this.playerSprite = createPlayer(this);
		this.playerContainer = this.add.container(
			center.x,
			mix(bounds.h, center.y, 0.3),
		);

		for (let i = 7; i >= 0; i--) {
			const a = (Math.PI / 8) * (i + 0.5);
			const { x, y } = vectorToCoords({ d: 80, a });
			const bit = this.add?.sprite(x, y, 'food-64x-000' + (i + 1));
			// bit.alpha = 0.5;
			bit.scale = 0;
			bit.blendMode = Phaser.BlendModes.ADD;
			// bit.scale = 0.5;
			bit.play('food-64x-0');
			this.bitSprites.push(bit);
		}
		this.playerContainer.add(this.bitSprites);
		this.track = this.sound.add('flack', { volume: 0.5 });
		for (let i = 1; i <= 10; i++) {
			this.hitSounds.push(this.sound.add(`hit-${i}`, { volume: 0.125 }));
			this.comboHitSounds.push(
				this.sound.add(`combo-hit-${i}`, { volume: 0.5 }),
			);
		}
		this.startGame();
		EventBus.emit('current-scene-ready', this);
	}

	startGame() {
		this.lifeSprite?.setScale(0.25);
		this.livesText?.setScale(1);
		this.track?.play();

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
