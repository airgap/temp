import { render } from '@testing-library/react';

import { LevelBadge } from './LevelBadge';

describe('Logo', () => {
	it('should render successfully', () => {
		const { baseElement } = render(<LevelBadge />);
		expect(baseElement).toBeTruthy();
	});
});
