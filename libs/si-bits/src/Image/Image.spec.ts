import { render } from '@testing-library/svelte';

import { Image } from './Image.svelte';

describe('Image', () => {
	it('should render successfully', () => {
		const { baseElement } = render(Image);
		expect(baseElement).toBeTruthy();
	});
});
