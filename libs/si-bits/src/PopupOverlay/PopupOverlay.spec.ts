import { render } from '@testing-library/svelte';

import PopupOverlay from './PopupOverlay.svelte';

describe('PopupOverlay', () => {
	it('should render successfully', () => {
		const { baseElement } = render(PopupOverlay);
		expect(baseElement).toBeTruthy();
	});
});
