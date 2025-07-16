// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { center } from '../defs';
import { EventBus } from '../EventBus';
/* END-USER-IMPORTS */

export default class MainMenu extends Phaser.Scene {
	constructor() {
		super('MainMenu');

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {
		// screw13a
		const bg = this.add.image(378, 512, 'screw13a');
		bg.alpha = 0.5;

		// text
		const text = this.add.text(512, 460, '', {});
		text.setOrigin(0.5, 0.5);
		text.text = 'Main Menu';
		text.setStyle({
			align: 'center',
			color: '#ffffff',
			fontFamily: 'Arial Black',
			fontSize: '38px',
			stroke: '#000000',
			strokeThickness: 8,
		});

		// food0
		// const food0 = this.add.sprite(288, 195, '0001');
		// food0.play('food0');
		const button = this.add.sprite(center.x, center.y, 'button');
		button.setInteractive();
		button.on('pointerdown', () => this.changeScene());
		const play = this.add.sprite(center.x + 10, center.y, 'tri');
		button.scale = 0.5;
		play.scale = 0.5;

		this.events.emit('scene-awake');
	}

	// Write your code here

	preload() {
		this.load.pack('preload', 'asset-pack.json');
	}
	create() {
		this.editorCreate();

		EventBus.emit('current-scene-ready', this);
	}

	changeScene() {
		console.log('Changing scene to Game');
		this.scene.start('Game');
	}
	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
export { MainMenu };
