import { render } from '@testing-library/svelte';

import Static from './Static.svelte';

describe('Static', () => {
	it('should render successfully', () => {
		const { baseElement } = render(Static);
		expect(baseElement).toBeTruthy();
	});
});
