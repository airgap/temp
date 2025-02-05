import { render } from '@testing-library/svelte';

import NavLogo from './NavLogo.svelte';

describe('Nav', () => {
	it('should render successfully', () => {
		const { baseElement } = render(NavLogo);
		expect(baseElement).toBeTruthy();
	});
});
