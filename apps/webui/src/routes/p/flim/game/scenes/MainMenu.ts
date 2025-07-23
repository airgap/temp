// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { center } from '../defs';
import { EventBus } from '../EventBus';
import { nothing } from '@lyku/helpers';
/* END-USER-IMPORTS */

export default class MainMenu extends Phaser.Scene {
	constructor() {
		super('MainMenu');

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	playButton?: Phaser.GameObjects.Sprite;

	editorCreate(): void {
		this.events.emit('scene-awake');
	}

	// Write your code here

	preload() {
		this.load.pack('section1', 'asset-pack.json');
	}
	create() {
		this.editorCreate();
		this.cameras.main.setBackgroundColor(0x000000);
		// screw13a
		const bg = this.add.image(center.x, center.y, 'screw13a');
		bg.alpha = 0.5;

		// text
		const text = this.add.text(center.x, center.y / 2, '', {});
		text.setOrigin(0.5, 0.5);
		text.text = 'Grabba Byte';
		text.setStyle({
			align: 'center',
			color: '#ffffff',
			fontFamily: 'Futura',
			fontSize: '68px',
			stroke: '#000000',
			strokeThickness: 8,
		});

		// food0
		// const food0 = this.add.sprite(288, 195, '0001');
		// food0.play('food0');

		this.playButton = this.add.sprite(center.x, center.y, 'planim');
		this.playButton.setInteractive();
		this.playButton.on('pointerup', () => this.changeScene());
		this.playButton.scale = 0.5;

		// Animation set
		this.playButton.anims.create({
			key: 'planimation',
			frames: this.anims.generateFrameNumbers('planim', { start: 0, end: 17 }),
			frameRate: 60,
			repeat: 0,
		});

		EventBus.emit('current-scene-ready', this);
	}

	async changeScene() {
		this.playButton?.anims.startAnimation('planimation');
		await nothing((18 / 60) * 1000);
		console.log('Changing scene to Game');
		this.scene.start('Game');
	}
	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
export { MainMenu };
