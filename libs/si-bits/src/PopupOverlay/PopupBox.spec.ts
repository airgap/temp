import { render } from '@testing-library/svelte';

import PopupBox from './PopupBox.svelte';

describe('PopupBox', () => {
	it('should render successfully', () => {
		const { baseElement } = render(PopupBox, { overlay: 'no idea lol' });
		expect(baseElement).toBeTruthy();
	});
});
