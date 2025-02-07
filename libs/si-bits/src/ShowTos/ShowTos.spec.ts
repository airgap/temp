import { render } from '@testing-library/svelte';

import ShowTos from './ShowTos.svelte';

describe('ShowTos', () => {
	it('should render successfully', () => {
		const { baseElement } = render(ShowTos);
		expect(baseElement).toBeTruthy();
	});
});
