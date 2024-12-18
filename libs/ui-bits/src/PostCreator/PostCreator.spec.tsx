import { render } from '@testing-library/react';

import { PostCreator } from './PostCreator';

describe('SubmitButton', () => {
	it('should render successfully', () => {
		const { baseElement } = render(
			<PostCreator
				user={{
					id: 'a',
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
					points: 0,
					postCount: 0,
				}}
			/>,
		);
		expect(baseElement).toBeTruthy();
	});
});
