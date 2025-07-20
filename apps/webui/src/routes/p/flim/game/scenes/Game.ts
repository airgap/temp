/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { mix } from '@lyku/helpers';
import { bounds, center, random } from '../defs';
import { EventBus } from '../EventBus';
/* END-USER-IMPORTS */

type Sprite = Phaser.GameObjects.Sprite;
// const pressVelocity = 600;

const heldKeys = new Set<number>();
const { A, LEFT, D, RIGHT } = Phaser.Input.Keyboard.KeyCodes;
const heldKeyVelocity = 800;
const baseDropInterval = 500;
// const baseGravity =

export default class Game extends Phaser.Scene {
	speed = 300;
	extraDropInterval = 2500;
	foods: Sprite[] = [];
	scoreText?: Phaser.GameObjects.Text;
	dropTimer?: NodeJS.Timeout;
	player?: Sprite;
	desiredAngle = 0;
	score = 0;
	combo = 1;
	streakText?: Phaser.GameObjects.Text;
	consecutive = 0;
	constructor() {
		super('Game');

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}
	update(time: number, delta: number) {
		if (this.player?.body) {
			const leftHeld = Number(heldKeys.has(LEFT) || heldKeys.has(A));
			const rightHeld = Number(heldKeys.has(RIGHT) || heldKeys.has(D));
			const dir = (rightHeld - leftHeld) * heldKeyVelocity;
			if (dir) this.player.body.velocity.x = dir;
			else {
				const baseRatioReduction = 0.003;
				const accountingForDelta = baseRatioReduction * delta;
				const vMultiplier = 1 - accountingForDelta;
				const oldV = this.player.body.velocity.x;
				const newV = Math.abs(oldV) > 1 ? oldV * vMultiplier : 0;
				this.player.body.velocity.x = newV;
			}
			if (this.player.x > bounds.w + 128) this.player.x = -128;
			else if (this.player.x < -128) this.player.x = bounds.w + 128;
			this.desiredAngle = (this.player.body.velocity.x / heldKeyVelocity) * 90;
			this.player.angle = mix(this.desiredAngle, this.player.angle, 0.9);
			for (let f = this.foods.length - 1; f >= 0; f--) {
				const food = this.foods[f];
				const r1 = food.displayWidth / 4;
				const r2 = this.player.displayWidth / 2;
				const distance = Math.sqrt(
					Math.pow(this.player.x - food.x, 2) +
						Math.pow(this.player.y - food.y, 2),
				);
				console.log('distance', distance);
				if (distance < r1 + r2) {
					food.destroy();
					this.foods.splice(f, 1);
					this.score += this.combo;
					this.scoreText?.setText(
						`${this.score} point${this.score === 1 ? '' : 's'}`,
					);
					this.player.anims.play('chomping');
					this.consecutive++;
					if (this.consecutive >= 10 && this.consecutive % 10 === 0)
						this.combo++;
					this.streakText!.text = this.combo > 1 ? `X${this.combo} COMBO` : '';
				}
			}
			if (Math.round(time) % 10 === 0)
				for (let i = this.foods.length - 1; i >= 0; i--) {
					const food = this.foods[i];
					if (food.y > bounds.h) {
						food.destroy();
						this.foods.splice(i, 1);
						this.combo = 1;
						this.consecutive = 0;
						this.streakText!.text = '';
					}
				}
			// this.player.body.velocity.x = this.player.body.velocity.x % bounds.w;
			// console.log(
			// 	'x',
			// 	this.player?.body?.velocity.x,
			// 	'vm',
			// 	vMultiplier,
			// 	'oldV',
			// 	oldV,
			// 	'newV',
			// 	newV,
			// );
		}
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

		this.dropFood();

		this.player = this.physics.add.sprite(
			center.x,
			mix(bounds.h, center.y, 0.25),
			'chomping',
		);
		this.player.setInteractive();
		this.player.on('pointerup', () => this.changeScene());
		this.player.scale = 0.5;
		(this.player.body as any)!.allowGravity = false;
		const { keyboard } = this.input;
		if (keyboard) {
			for (const key of ['A', 'LEFT', 'D', 'RIGHT'] as const) {
				keyboard.on('keydown-' + key, () =>
					heldKeys.add(Phaser.Input.Keyboard.KeyCodes[key]),
				);
				keyboard.on('keyup-' + key, () =>
					heldKeys.delete(Phaser.Input.Keyboard.KeyCodes[key]),
				);
			}
		}
		// Animation set
		this.player.anims.create({
			key: 'chomping',
			frames: this.anims.generateFrameNumbers('chomping', {
				start: 0,
				end: 8,
			}),
			frameRate: 60,
			repeat: 1,
			yoyo: true,
		});

		EventBus.emit('current-scene-ready', this);
	}

	changeScene() {
		this.scene.start('GameOver');
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
