import { render } from '@testing-library/react';

import { VideoList } from './VideoList';

describe(VideoList.name, () => {
	it('should render successfully', () => {
		const { baseElement } = render(<VideoList />);
		expect(baseElement).toBeTruthy();
	});
});
