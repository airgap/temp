import { render } from '@testing-library/react';

import { LoadingOverlay } from './LoadingOverlay';

describe('Loading overlay', () => {
	it('should render successfully', () => {
		const { baseElement } = render(<LoadingOverlay />);
		expect(baseElement).toBeTruthy();
	});
});
