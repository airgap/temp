import Boot from './scenes/Boot';
import GameOver from './scenes/GameOver';
import MainGame from './scenes/Game';
import MainMenu from './scenes/MainMenu';
import Preloader from './scenes/Preloader';
import { AUTO, Game } from 'phaser';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
	type: AUTO,
	width: 768,
	height: 1024,
	parent: 'game-container',
	backgroundColor: '#028af8',
	scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
	scale: .5
};

const StartGame = (parent: string) => {
	return new Game({ ...config, parent });
};

export default StartGame;
