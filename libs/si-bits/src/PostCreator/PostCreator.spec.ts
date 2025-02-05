import { render } from '@testing-library/svelte';

import PostCreator from './PostCreator.svelte';

describe('SubmitButton', () => {
	it('should render successfully', () => {
		const { baseElement } = render(PostCreator, {
			user: {
				id: 1n,
				username: 'fuck',
				live: true,
				chatColor: '#ff0099',
					gameStats: {
						total: {
							time: 0,
							edges: 0,
							corners: 0,
						},
						current: {
							time: 0,
							edges: 0,
							corners: 0,
						},
						highest: {
							time: 0,
							edges: 0,
							corners: 0,
						},
						sessionCount: 0,
					},
					points: 0n,
				postCount: 0n,
			},
		});
		expect(baseElement).toBeTruthy();
	});
});
