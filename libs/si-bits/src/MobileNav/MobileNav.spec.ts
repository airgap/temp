import { render } from '@testing-library/svelte';

import MobileNav from './MobileNav.svelte';

describe('MobileNav', () => {
	it('should render successfully', () => {
		const { baseElement } = render(MobileNav);
		expect(baseElement).toBeTruthy();
	});
});
