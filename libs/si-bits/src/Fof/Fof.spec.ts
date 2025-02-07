import { render } from '@testing-library/svelte';

import Fof from './Fof.svelte';

describe('ChatBox', () => {
	it('should render successfully', () => {
		const { baseElement } = render(Fof);
		expect(baseElement).toBeTruthy();
	});
});
