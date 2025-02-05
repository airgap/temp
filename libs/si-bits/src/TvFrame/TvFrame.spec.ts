import { render } from '@testing-library/svelte';

import TvFrame from './TvFrame.svelte';

describe('TvFrame', () => {
	it('should render successfully', () => {
		const { baseElement } = render(TvFrame);
		expect(baseElement).toBeTruthy();
	});
});
