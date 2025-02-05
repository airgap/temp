import { render } from '@testing-library/svelte';

import Logo from './Logo.svelte';

describe('Logo', () => {
	it('should render successfully', () => {
		const { baseElement } = render(Logo);
		expect(baseElement).toBeTruthy();
	});
});
