/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { mix, nothing } from '@lyku/helpers';
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
import { api, getSessionId } from 'monolith-ts-api';
import type { Score } from '@lyku/json-models';
/* END-USER-IMPORTS */

type Sprite = Phaser.GameObjects.Sprite;
type Text = Phaser.GameObjects.Text;
type Container = Phaser.GameObjects.Container;
type BaseSound = Phaser.Sound.BaseSound;
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
	scoreText?: Text;
	dropTimer?: NodeJS.Timeout;
	playerSprite?: Sprite;
	desiredAngle = 0;
	score = 0;
	combo = 1;
	streakText?: Text;
	consecutive = 0;
	livesText?: Text;
	lifeSprite?: Sprite;
	bitSprites: Sprite[] = [];
	playerContainer?: Container;
	track?: BaseSound;
	hitSounds: BaseSound[] = [];
	comboHitSounds: BaseSound[] = [];
	dropHand?: Sprite;
	heldFood?: Sprite;
	dropHandContainer?: Container;
	duplicateSprite?: Sprite;
	dupeSprites: Sprite[] = [];
	duplicateContainer?: Container;
	microTimeout?: NodeJS.Timeout;
	microfoods: Sprite[] = [];
	bits = 0;
	bytes = 0;
	startTime?: Date;
	playing = false;
	playButton?: Sprite;
	blackFlash?: Phaser.GameObjects.Rectangle;
	greenFlash?: Phaser.GameObjects.Rectangle;
	redFlash?: Phaser.GameObjects.Rectangle;
	myHighScore?: Score;
	myHighScoreText?: Text;
	constructor() {
		super('Game');

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}
	showBits() {
		for (const bitSprites of [this.bitSprites, this.dupeSprites])
			for (let b = bitSprites.length - 1; b >= 0; b--) {
				const shown = Number(this.consecutive % comboMinimum > b);
				const a = (Math.PI / 6) * (6 - b);
				const { x, y } = vectorToCoords({ d: shown * 80, a });
				this.tweens.add({
					targets: [bitSprites[b]],
					scale: shown / 2,
					x,
					y,
					ease: 'Linear',
					duration: 250,
					yoyo: false,
					repeat: 0,
					callbackScope: this,
				});
			}
	}
	eatFood(f: number) {
		this.bits++;
		this.foods.splice(f, 1)[0].destroy();
		this.score += this.combo;
		this.scoreText?.setText(
			`${this.score} point${this.score === 1 ? ' ' : 's'}`,
		);
		this.playerSprite?.anims.play('chomping');
		this.consecutive++;
		if (this.consecutive >= 4 && this.consecutive % comboMinimum === 0) {
			this.bytes++;
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

			this.flash(this.greenFlash);
			if (this.livesText) {
				this.livesText?.setText('X' + this.lives);
				pop(this.livesText, this);
			}
		}
	}
	tryEatingFood() {
		if (!(this.playerSprite && this.duplicateSprite)) return;
		for (let f = this.foods.length - 1; f >= 0; f--) {
			if (
				doesPlayerEatFood(this.playerSprite, this.foods[f]) ||
				doesPlayerEatFood(this.duplicateSprite, this.foods[f])
			) {
				this.eatFood(f);
			}
		}
	}
	flash(item?: Phaser.GameObjects.Rectangle) {
		if (!item) return;
		item.setAlpha(0.25);
		this.tweens.add({
			targets: [item],
			alpha: 0,
			ease: 'Linear',
			duration: 250,
			yoyo: false,
			repeat: 0,
			callbackScope: this,
		});
	}
	resetCombo() {
		this.combo = 1;
		this.consecutive = 0;
		this.streakText!.text = '';
		this.lives--;

		this.flash(this.redFlash);

		if (this.lives < 0) return;
		this.showBits();
		this.livesText?.setText('X' + this.lives);
		if (this.livesText) pop(this.livesText, this);
	}
	removeOldMicrofood() {
		if (!this.microfoods.length) return;
		const food = this.microfoods[0];
		if (food.y > bounds.h) {
			food.destroy();
			this.microfoods.shift();
		}
	}
	removeOldFood() {
		if (!this.foods.length) return;
		const food = this.foods[0];
		if (food.y > bounds.h) {
			food.destroy();
			this.foods.shift();
			this.resetCombo();
			if (this.lives < 0) this.endGame();
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
		if (!this.duplicateContainer) return;

		this.duplicateContainer.x =
			this.playerContainer.x +
			(this.playerContainer.x > bounds.w / 2 ? -bounds.w : bounds.w);
		this.duplicateContainer.y = this.playerContainer.y;
		this.duplicateContainer.angle = this.playerSprite.angle;
		if (!this.duplicateSprite) return;
		this.duplicateSprite.angle = this.playerSprite.angle;
		this.duplicateSprite.x = this.duplicateContainer.x;
		this.duplicateSprite.y = this.duplicateContainer.y;
	}
	update(time: number, delta: number) {
		if (this.input.keyboard) handleKeyboard(this.input.keyboard);
		if (this.playerSprite) movePlayer(this.playerSprite, delta);
		this.tryEatingFood();
		this.removeOldFood();
		this.removeOldMicrofood();
		this.moveBitsToPlayer();
	}
	increaseGravity() {
		const { gravity } = this.physics.config;
		if (!gravity) return;
		// gravity.y = Math.min(gravity.y * 1.02, 600);
	}
	async moveHand() {
		if (!this.heldFood) return;
		const d = 250;
		this.tweens.add({
			targets: [this.dropHandContainer],
			x: random.x(50),
			ease: 'Linear',
			duration: d,
			yoyo: false,
			repeat: 0,
			callbackScope: this,
		});
		this.heldFood?.setY(bounds.h / 18);
		this.heldFood?.setScale(0);
		this.tweens.add({
			targets: [this.heldFood],
			y: bounds.h / 18,
			scale: 0.5,
			ease: 'Linear',
			duration: d,
			yoyo: false,
			repeat: 0,
			callbackScope: this,
			onComplete: () => {
				if (!(this.playing && this.heldFood && this.dropHandContainer)) return;
				this.dropFood(
					this.dropHandContainer.x + this.heldFood.x,
					this.dropHandContainer.y + this.heldFood.y,
				);
				this.heldFood.setScale(0);
			},
		});
		setTimeout(() => {
			this.dropHand?.anims.play('unpinch0');
		}, d / 2);
		this.extraDropInterval *= 0.99;
		this.dropTimer = setTimeout(
			() => this.moveHand(),
			baseDropInterval + this.extraDropInterval,
		);
		this.increaseGravity();
	}
	dropFood(x = random.x(50), y = -bounds.h / 4) {
		const food = this.physics.add.sprite(x, y, '0001');
		food.blendMode = Phaser.BlendModes.ADD;
		food.scale = 0.5;
		food.body.setAccelerationY(200);
		food.play('food0');
		this.foods.push(food);

		this.tweens.add({
			targets: [food],
			scale: 0.4,
			alpha: 0.75,
			ease: 'Linear',
			duration: 250,
			yoyo: true,
			repeat: -1,
			callbackScope: this,
			onComplete: () => {},
		});
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

		this.dropHand = this.add.sprite(0, 0, 'pinch');
		this.dropHand.blendMode = Phaser.BlendModes.SCREEN;
		this.heldFood = this.add.sprite(-bounds.w / 128, 0, '0001');
		this.heldFood.blendMode = Phaser.BlendModes.ADD;
		this.heldFood.scale = 0;
		this.heldFood.play('food0');
		this.dropHandContainer = this.add.container(center.x, -center.y / 4);
		this.dropHandContainer.add([this.dropHand, this.heldFood]);

		// score
		this.scoreText = this.add.text(center.x, bounds.h * 0.1, 'GRABBA BYTE', {});
		this.scoreText.setOrigin(0.5, 0.5);
		this.scoreText.setStyle({
			align: 'center',
			color: '#ffffff',
			fontFamily: 'Silkscreen, Futura',
			fontSize: '68px',
			stroke: '#000000',
			strokeThickness: 8,
		});

		// score
		this.streakText = this.add.text(center.x, bounds.h * 0.2, '', {});
		this.streakText.setOrigin(0.5, 0.5);
		this.streakText.setStyle({
			align: 'center',
			color: '#ffffff',
			fontFamily: 'Silkscreen, Futura',
			fontSize: '38px',
			stroke: '#000000',
			strokeThickness: 8,
		});

		const lifeCounterY = bounds.h - 40;

		this.lifeSprite = this.add.sprite(40, lifeCounterY, 'chomping');
		this.lifeSprite.scale = 0;
		// life count
		this.livesText = this.add.text(70, lifeCounterY, 'X2', {});
		this.livesText.setOrigin(0, 0.5);
		this.livesText.text = 'X' + this.lives;
		this.livesText.setStyle({
			align: 'left',
			color: '#ffffff',
			fontFamily: 'Silkscreen, Futura',
			fontSize: '35px',
			stroke: '#000000',
			strokeThickness: 8,
		});
		this.livesText.scale = 0;

		this.playerSprite = createPlayer(this);
		this.duplicateSprite = createPlayer(this);
		this.playerContainer = this.add.container(
			center.x,
			mix(bounds.h, center.y, 0.3),
		);
		this.duplicateContainer = this.add.container(
			center.x,
			mix(bounds.h, center.y, 0.3),
		);
		for (const bitSprites of [this.bitSprites, this.dupeSprites])
			for (let i = 7; i >= 0; i--) {
				const a = (Math.PI / 6) * (6 - i);
				const { x, y } = vectorToCoords({ d: 80, a });
				const bit = this.add.sprite(x, y, 'food-64x-000' + (i + 1));
				// bit.alpha = 0.5;
				bit.scale = 0;
				bit.blendMode = Phaser.BlendModes.ADD;
				// bit.scale = 0.5;
				bit.play('food-64x-0');
				bitSprites.push(bit);
			}
		this.playerContainer.add(this.bitSprites);
		this.duplicateContainer.add(this.dupeSprites);
		this.track = this.sound.add('flack', { volume: 0.5 });
		for (let i = 1; i <= 10; i++) {
			this.hitSounds.push(this.sound.add(`hit-${i}`, { volume: 0.125 }));
			this.comboHitSounds.push(
				this.sound.add(`combo-hit-${i}`, { volume: 0.5 }),
			);
		}

		// Add play button
		this.playButton = this.add.sprite(center.x, center.y, 'planim');
		this.playButton.setInteractive();
		this.playButton.on('pointerup', () => this.startGame());
		this.playButton.scale = 0.5;

		// Animation set
		this.playButton.anims.create({
			key: 'planimation',
			frames: this.anims.generateFrameNumbers('planim', { start: 0, end: 17 }),
			frameRate: 60,
			repeat: 0,
		});
		// this.sound.setVolume(0.1);
		// score
		this.myHighScoreText = this.add.text(center.x, bounds.h * 0.2, '', {});
		this.myHighScoreText.setOrigin(0.5, 0.5);
		this.myHighScoreText.setStyle({
			align: 'center',
			color: '#ffffff',
			fontFamily: 'Silkscreen, Futura',
			fontSize: '38px',
			stroke: '#000000',
			strokeThickness: 8,
		});

		this.dropMicrofood();

		this.greenFlash = this.add.rectangle(
			center.x,
			center.y,
			bounds.w,
			bounds.h,
			new Phaser.Display.Color(0, 255, 0).color,
		);
		this.greenFlash.alpha = 0;

		this.redFlash = this.add.rectangle(
			center.x,
			center.y,
			bounds.w,
			bounds.h,
			new Phaser.Display.Color(255, 0, 0).color,
		);
		this.redFlash.alpha = 0;

		this.blackFlash = this.add.rectangle(
			center.x,
			center.y,
			bounds.w,
			bounds.h,
			new Phaser.Display.Color(0, 0, 0).color,
		);
		this.blackFlash.alpha = 0;

		void this.loadHighScore();

		// setTimeout(() => this.startGame(), 1000);
		// this.startGame();
		EventBus.emit('current-scene-ready', this);
	}

	async loadHighScore() {
		const score = (await api.getMyHighScore(1n)) as unknown as Score;
		if (!score) return;
		this.myHighScore = score;
		this.myHighScoreText?.setText('Personal best: ' + score.columns[0]);
	}

	dropMicrofood() {
		const food = this.physics.add.sprite(random.x(), -bounds.h / 4, '0001');
		food.blendMode = Phaser.BlendModes.ADD;
		food.scale = 0.05;
		food.body.setAccelerationY(200);
		food.play('food0');
		this.microfoods.push(food);

		this.tweens.add({
			targets: [food],
			scale: 0.04,
			alpha: 0.75,
			ease: 'Linear',
			duration: 250,
			yoyo: true,
			repeat: -1,
			callbackScope: this,
			onComplete: () => {},
		});
		this.microTimeout = setTimeout(() => this.dropMicrofood(), 100);
	}

	startGame() {
		this.playing = true;
		this.score = 0;
		this.scoreText?.setText('0 points');
		this.lives = maxLives;
		this.livesText?.setText('X' + this.lives);
		this.myHighScoreText?.setScale(0);
		this.startTime = new Date();
		this.tweens.add({
			targets: [this.lifeSprite],
			scale: 0.25,
			ease: 'Linear',
			duration: 250,
			repeat: 0,
			callbackScope: this,
		});
		this.tweens.add({
			targets: [this.livesText],
			scale: 1,
			ease: 'Linear',
			duration: 250,
			repeat: 0,
			callbackScope: this,
		});
		this.tweens.add({
			targets: [this.playButton],
			scale: 0,
			ease: 'Linear',
			duration: 250,
			repeat: 0,
			callbackScope: this,
			angle: 180,
		});
		this.track?.play();
		this.track?.once(Phaser.Sound.Events.COMPLETE, () => this.phase2());
		this.moveHand();
		// this.dropFood();
	}
	slowlyLowerHand() {
		this.tweens.add({
			targets: [this.dropHandContainer],
			y: bounds.h * 0.65,
			ease: 'Out',
			duration: 120000,
			yoyo: false,
			repeat: 0,
			callbackScope: this,
			onComplete: () => {},
		});
	}
	// lowerHandToTop() {
	// 	this.tweens.add({
	// 		targets: [this.dropHandContainer],
	// 		y: bounds.h / 8,
	// 		ease: 'Linear',
	// 		duration: 2000,
	// 		yoyo: false,
	// 		repeat: 0,
	// 		callbackScope: this,
	// 		onComplete: () => this.slowlyLowerHand(),
	// 	});
	// }

	phase2() {
		this.slowlyLowerHand();
		// this.lowerHandToTop();
	}

	endGame() {
		if (!this.startTime) throw new Error('Game not started');
		if (this.scoreText)
			this.scoreText.text = 'GAME OVER\n' + this.scoreText.text;
		this.myHighScoreText?.setScale(1);
		this.playing = false;
		const finish = new Date();
		clearTimeout(this.dropTimer);
		this.dropTimer = undefined;
		this.tweens.add({
			targets: [this.lifeSprite, this.livesText],
			scale: 0,
			ease: 'Linear',
			duration: 250,
			repeat: 0,
			callbackScope: this,
		});
		this.track?.stop();
		this.tweens.add({
			targets: [this.playButton],
			scale: 0.5,
			ease: 'Linear',
			duration: 250,
			repeat: 0,
			callbackScope: this,
			angle: 0,
		});
		for (const p of this.foods) p.destroy();
		this.foods = [];

		api.reportGrabbaScore({
			score: this.score,
			bits: this.bits,
			bytes: this.bytes,
			start: this.startTime,
			finish,
			time: finish.getTime() - this.startTime.getTime(),
		});

		if (!this.blackFlash) return;
		this.blackFlash.setAlpha(1);
		this.tweens.add({
			targets: [this.blackFlash],
			alpha: 0,
			ease: 'Linear',
			duration: 2500,
			yoyo: false,
			repeat: 0,
			callbackScope: this,
		});
		// this.scene.start('GameOver');
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
