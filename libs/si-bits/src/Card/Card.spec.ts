import { render } from '@testing-library/svelte';

import Card from './Card.svelte';

describe('Card', () => {
	it('should render successfully', () => {
		const { baseElement } = render(Card);
		expect(baseElement).toBeTruthy();
	});
});
