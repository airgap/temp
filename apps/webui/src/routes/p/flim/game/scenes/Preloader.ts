// You can write more code here

import { bounds, center } from '../defs';

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Preloader extends Phaser.Scene {
	constructor() {
		super('Preloader');

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {
		// background
		// this.add.image(512, 384, 'background');

		// progressBar
		const progressBar = this.add.rectangle(
			center.x,
			center.y,
			bounds.w / 2,
			bounds.w / 25,
		);
		progressBar.isFilled = true;
		progressBar.fillColor = 55;
		progressBar.isStroked = true;

		this.progressBar = progressBar;

		this.events.emit('scene-awake');
	}

	private progressBar!: Phaser.GameObjects.Rectangle;

	/* START-USER-CODE */

	// Write your code here
	init() {
		this.editorCreate();

		//  This is the progress bar itself. It will increase in size from the left based on the % of progress.
		const bar = this.add.rectangle(
			this.progressBar.x - this.progressBar.width / 2 + 4,
			this.progressBar.y,
			4,
			28,
			0xffffff,
		);

		//  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
		this.load.on('progress', (progress: number) => {
			//  Update the progress bar (our bar is 464px wide, so 100% = 464px)
			bar.width = (bounds.w / 2) * progress;
		});
	}

	preload() {
		// Use the 'pack' file to load in any assets you need for this scene
		this.load.pack('section1', 'asset-pack.json');
		// this.load.pack('preload', 'assets/preload-asset-pack.json');
	}

	create() {
		//  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
		//  For example, you can define global animations here, so we can use them in other scenes.

		//  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
		this.scene.start('Game');
	}
	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
