import { render } from '@testing-library/svelte';

import SubmitButton from './SubmitButton.svelte';

describe('SubmitButton', () => {
	it('should render successfully', () => {
		const { baseElement } = render(SubmitButton);
		expect(baseElement).toBeTruthy();
	});
});
