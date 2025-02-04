import { render } from '@testing-library/svelte';

import Banner from './Banner.svelte';

describe('Banner', () => {
	it('should render successfully', () => {
		const { baseElement } = render(Banner);
		expect(baseElement).toBeTruthy();
	});
});
