import { render } from '@testing-library/svelte';

import Link from './Link.svelte';

describe('Button', () => {
	it('should render successfully', () => {
		const { baseElement } = render(Link);
		expect(baseElement).toBeTruthy();
	});
});
