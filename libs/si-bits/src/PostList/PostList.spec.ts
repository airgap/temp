import { render } from '@testing-library/svelte';

import PostList from './PostList.svelte';

describe('SubmitButton', () => {
	it('should render successfully', () => {
		const { baseElement } = render(PostList, {
			posts: [],
		});
		expect(baseElement).toBeTruthy();
	});
});
