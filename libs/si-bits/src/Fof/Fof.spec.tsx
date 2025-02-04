import { render } from '@testing-library/react';

import { Fof } from './Fof';

describe('ChatBox', () => {
	it('should render successfully', () => {
		const { baseElement } = render(<Fof />);
		expect(baseElement).toBeTruthy();
	});
});
