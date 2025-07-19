/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { bounds, center, random } from '../defs';
import { EventBus } from '../EventBus';
/* END-USER-IMPORTS */

type Sprite = Phaser.GameObjects.Sprite;

export default class Game extends Phaser.Scene {
	speed = 300;
	frequency = 3000;
	foods: Sprite[] = [];
	dropTimer?: NodeJS.Timeout;
	constructor() {
		super('Game');

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}
	dropFood() {
		this.frequency *= 0.99;
		this.dropTimer = setTimeout(() => this.dropFood(), this.frequency);
		this.physics.config.gravity!.y *= 1.01;
		const food = this.physics.add.sprite(random.x(50), -100, '0001');
		food.blendMode = Phaser.BlendModes.ADD;
		food.scale = 0.5;
		food.body.setAccelerationY(200);
		food.play('food0');
		// food.body!.setVelocityY(this.speed);
	}

	editorCreate(): void {
		// screw13a
		const bg = this.add.image(center.x, center.y, 'screw13a');
		bg.alpha = 0.5;

		// score
		const score = this.add.text(center.x, bounds.h * 0.1, '', {});
		score.setOrigin(0.5, 0.5);
		score.text = '0';
		score.setStyle({
			align: 'center',
			color: '#ffffff',
			fontFamily: 'Arial Black',
			fontSize: '38px',
			stroke: '#000000',
			strokeThickness: 8,
		});

		this.dropFood();

		this.events.emit('scene-awake');
	}

	/* START-USER-CODE */

	// Write your code here

	create() {
		this.editorCreate();

		this.cameras.main.setBackgroundColor(0x000000);

		EventBus.emit('current-scene-ready', this);
	}

	changeScene() {
		this.scene.start('GameOver');
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
