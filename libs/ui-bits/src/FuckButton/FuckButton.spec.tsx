import { render } from '@testing-library/react';

import { FuckButton } from './FuckButton';

describe('FuckButton', () => {
	it('should render successfully', () => {
		const { baseElement } = render(<FuckButton />);
		expect(baseElement).toBeTruthy();
	});
});
