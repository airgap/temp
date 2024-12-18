import { render } from '@testing-library/react';

import { Link } from './Link';

describe('Button', () => {
	it('should render successfully', () => {
		const { baseElement } = render(<Link />);
		expect(baseElement).toBeTruthy();
	});
});
