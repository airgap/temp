import { render } from '@testing-library/svelte';

import MessageItem from './MessageItem.svelte';

describe('MessageItem', () => {
	it('should render successfully', () => {
		const { baseElement } = render(MessageItem, {
			src: {
				id: 1n,
				content: 'Hello World!',
				author: 1n,
				channel: 1n,
				created: new Date(),
				}}
		);
		expect(baseElement).toBeTruthy();
	});
});
