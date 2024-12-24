import { uuidToBase62 } from './uuidToBase62';

describe('helpers', () => {
	it('should work', () => {
		expect(uuidToBase62('3d6b7e8f-2e15-4A9C-B54d-63e8d3A7726a')).toEqual(
			'qmZ1H5oO7sh9zvhgyJETR1'
		);
	});
});
