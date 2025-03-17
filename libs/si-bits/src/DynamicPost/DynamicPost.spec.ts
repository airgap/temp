import { render } from '@testing-library/svelte';

import { PostWithAuthor } from '@lyku/json-models';

import DynamicPost from '../DynamicPost.svelte';

describe('SubmitButton', () => {
	it('should render successfully', () => {
		const { baseElement } = render(DynamicPost, {
			post: {
				title: 'Title lorem',
				body: 'Body ipsum dolor sit amet ',
				id: 'aaa',
				userId: '000',
				publish: new Date().toDateString(),
				attachments: [],
				author: {
					username: 'AdaBanana',
					live: true,
					chatColor: '#FFFFFF',
					id: 'f',
					gameStats: {
						total: { time: 10, edges: 7, corners: 3 },
						current: { time: 4, edges: 3, corners: 2 },
						highest: { time: 4, edges: 3, corners: 2 },
						sessionCount: 5,
					},
				},
				echoes: 27,
				authorId: '0',
				likes: 33,
				replies: 666,
			} as PostWithAuthor,
		});
		expect(baseElement).toBeTruthy();
	});
});
