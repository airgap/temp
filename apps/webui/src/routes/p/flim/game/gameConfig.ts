import Boot from './scenes/Boot';
import GameOver from './scenes/GameOver';
import MainGame from './scenes/Game';
import MainMenu from './scenes/MainMenu';
import Preloader from './scenes/Preloader';
import { AUTO } from 'phaser';
// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
export const config: Phaser.Types.Core.GameConfig = {
	type: AUTO,
	width: 768,
	height: 1024,
	parent: 'game-container',
	backgroundColor: '#100010',
	scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
	scale: {
		mode: Phaser.Scale.FIT,
	},
	loader: {
		baseURL: '/flim/',
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {
				x: 0,
				y: 200,
			},
		},
	},
	// scale: { min: { width: 400, height: 600 } },
};
