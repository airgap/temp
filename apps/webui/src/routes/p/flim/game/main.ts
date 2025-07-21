import { Game } from 'phaser';
import { config } from './gameConfig';

const StartGame = (parent: string) => {
	return new Game({ ...config, parent });
};

export default StartGame;
