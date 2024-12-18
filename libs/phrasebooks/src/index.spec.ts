import { en_US, ru_RU } from '@lyku/strings';

import { getPhrasebook } from './index';

describe('getPhrasebooks', () => {
	it('en-US should return en-US', () => {
		expect(getPhrasebook('en-US')).toEqual(en_US);
	});
	it('en should return en-US', () => {
		expect(getPhrasebook('en')).toEqual(en_US);
	});
	it('en-US-aaa should return en-US', () => {
		expect(getPhrasebook('en-US-aaa')).toEqual(en_US);
	});
	it('en-US.channelNonexistent should return en-US.channelNonexistent', () => {
		expect(getPhrasebook('en-US')?.channelNonexistent).toEqual(
			en_US.channelNonexistent,
		);
	});
	it('en.channelNonexistent should return en-US.channelNonexistent', () => {
		expect(getPhrasebook('en')?.channelNonexistent).toEqual(
			en_US.channelNonexistent,
		);
	});
	it('ru-RU should return ru-RU', () => {
		expect(getPhrasebook('ru-RU')).toEqual(ru_RU);
	});
	it('ru should return ru-RU', () => {
		expect(getPhrasebook('ru')).toEqual(ru_RU);
	});
	it('ru-UK should return ru-RU', () => {
		expect(getPhrasebook('ru-UK')).toEqual(ru_RU);
	});
	it('en-GB should return en-US', () => {
		expect(getPhrasebook('en-GB')).toEqual(en_US);
	});
	// it('en-GB-oxendict.channelNonexistent should return en-GB-oxendict.channelNonexistent', () => {
	// 	expect(getPhrasebook('en-GB-oxendict')?.channelNonexistent).toEqual(
	// 		en_GB_oxendict.channelNonexistent,
	// 	);
	// });
	it('FFFF should return en-US', () => {
		expect(getPhrasebook('FFFF')).toEqual(en_US);
	});
	it('"" should return en-US', () => {
		expect(getPhrasebook('')).toEqual(en_US);
	});
});
