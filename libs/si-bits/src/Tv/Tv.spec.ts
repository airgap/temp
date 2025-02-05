import { render } from '@testing-library/svelte';

import Tv from './Tv.svelte';

describe('Tv', () => {
	it('should render successfully', () => {
		const { baseElement } = render(Tv);
		expect(baseElement).toBeTruthy();
	});
});
