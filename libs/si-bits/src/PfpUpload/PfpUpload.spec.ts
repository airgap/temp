import { render } from '@testing-library/svelte';

import PfpUpload from './PfpUpload.svelte';

describe('Button', () => {
	it('should render successfully', () => {
		const { baseElement } = render(PfpUpload);
		expect(baseElement).toBeTruthy();
	});
});
