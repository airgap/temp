import { render } from '@testing-library/svelte';

import Cards from './Cards.svelte';

describe('Cards', () => {
	it('should render successfully', () => {
		const { baseElement } = render(Cards);
		expect(baseElement).toBeTruthy();
	});
});
