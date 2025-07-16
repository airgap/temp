/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import { EventBus } from '../EventBus';
/* END-USER-IMPORTS */

export default class Game extends Phaser.Scene {
	constructor() {
		super('Game');

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {
		// screw13a
		const bg = this.add.image(378, 512, 'screw13a');
		bg.alpha = 0.5;

		// score
		const score = this.add.text(384, 133, '', {});
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

		// food0
		const food0 = this.add.sprite(353, 339, '0001');
		food0.play('food0');

		this.events.emit('scene-awake');
	}

	/* START-USER-CODE */

	// Write your code here

	create() {
		this.editorCreate();

		this.cameras.main.setBackgroundColor(0x00ff00);

		EventBus.emit('current-scene-ready', this);
	}

	changeScene() {
		this.scene.start('GameOver');
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
