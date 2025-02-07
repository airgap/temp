import { render } from '@testing-library/svelte';

import LevelBadge from './LevelBadge.svelte';

describe('Logo', () => {
	it('should render successfully', () => {
		const { baseElement } = render(LevelBadge);
		expect(baseElement).toBeTruthy();
	});
});
