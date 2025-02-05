import { render } from '@testing-library/svelte';

import VideoList from './VideoList.svelte';

describe(VideoList.name, () => {
	it('should render successfully', () => {
		const { baseElement } = render(VideoList);
		expect(baseElement).toBeTruthy();
	});
});
