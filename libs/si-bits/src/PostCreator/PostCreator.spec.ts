import { render } from '@testing-library/svelte';

import PostCreator from './PostCreator.svelte';

describe('SubmitButton', () => {
	it('should render successfully', () => {
		const { baseElement } = render(PostCreator, {
			user: {
				id: 1n,
				username: 'a',
				live: true,
				chatColor: '#ff0099',
				points: 100n,
			},
		});
		expect(baseElement).toBeTruthy();
	});
});
