import { render } from '@testing-library/react';

import { MessageItem } from './MessageItem';

describe('MessageItem', () => {
	it('should render successfully', () => {
		const { baseElement } = render(
			<MessageItem
				src={{
					id: 'asdf',
					content: 'Hello World!',
					author: 'asdf',
					channel: 'asdf',
					sent: true,
				}}
			/>,
		);
		expect(baseElement).toBeTruthy();
	});
});
