import { render } from '@testing-library/react';

import Loading from './Loading.svelte';

describe('Loading animation', () => {
	it('should render successfully', () => {
		const { baseElement } = render(Loading);
		expect(baseElement).toBeTruthy();
	});
});
