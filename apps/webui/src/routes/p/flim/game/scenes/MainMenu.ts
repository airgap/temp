// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
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
		this.add.image(510.53014273067794, 399.45174983847244, 'screw13a');

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
		const food0 = this.add.sprite(288, 195, '0001');
		food0.play('food0');

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
		this.scene.start('Game');
	}
	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
export { MainMenu };
