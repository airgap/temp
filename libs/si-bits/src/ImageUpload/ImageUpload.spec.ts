import { render } from '@testing-library/svelte';

import ImageUpload from './ImageUpload.svelte';

describe('Button', () => {
	it('should render successfully', () => {
		const { baseElement } = render(ImageUpload);
		expect(baseElement).toBeTruthy();
	});
});
