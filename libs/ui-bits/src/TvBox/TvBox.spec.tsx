import { render } from '@testing-library/react';

import { TvBox } from './TvBox';

describe('TvBox', () => {
	it('should render successfully', () => {
		const { baseElement } = render(<TvBox />);
		expect(baseElement).toBeTruthy();
	});
});
