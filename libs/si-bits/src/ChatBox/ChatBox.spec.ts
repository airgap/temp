import { render } from '@testing-library/svelte';

import ChatBox from './ChatBox.svelte';

describe('ChatBox', () => {
	it('should render successfully', () => {
		const { baseElement } = render(ChatBox);
		expect(baseElement).toBeTruthy();
	});
});
