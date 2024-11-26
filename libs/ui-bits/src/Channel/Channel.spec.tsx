import { render } from '@testing-library/react';

import { Channel } from './Channel';

describe('Channel', () => {
	it('should render successfully', () => {
		const { baseElement } = render(
			<Channel channel={1} selected={false} />,
		);
		expect(baseElement).toBeTruthy();
	});
});
