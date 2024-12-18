import { init } from './init';
import { stop } from './close';

describe('init', () => {
	it('should work', async () => {
		console.log('Initting');
		await init();
		console.log('Initted');
		await stop();
	});
});
