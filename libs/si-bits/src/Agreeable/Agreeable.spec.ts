import { render } from '@testing-library/svelte';

import Agreeable from './Agreeable.svelte';

describe('Agreeable', () => {
	it('should render successfully', () => {
		const { baseElement } = render(Agreeable);
		expect(baseElement).toBeTruthy();
	});
});
