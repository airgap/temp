import { render } from '@testing-library/svelte';

import DesktopNav from './DesktopNav.svelte';

describe('Nav', () => {
	it('should render successfully', () => {
		const { baseElement } = render(DesktopNav);
		expect(baseElement).toBeTruthy();
	});
});
