import { render } from '@testing-library/react';

import { ReactionButton } from './ReactionButton';

describe('SubmitButton', () => {
	it('should render successfully', () => {
		const { baseElement } = render(<ReactionButton type="like" />);
		expect(baseElement).toBeTruthy();
	});
});
