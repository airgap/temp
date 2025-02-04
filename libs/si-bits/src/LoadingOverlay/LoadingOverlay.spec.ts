import { render } from '@testing-library/svelte';

import LoadingOverlay from './LoadingOverlay.svelte';

describe('Loading overlay', () => {
	it('should render successfully', () => {
		const { baseElement } = render(LoadingOverlay);
		expect(baseElement).toBeTruthy();
	});
});
