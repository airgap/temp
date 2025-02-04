import { render } from '@testing-library/react';

import { Screensaver } from './Screensaver';

describe('Screensaver', () => {
	it('should render successfully', () => {
		const { baseElement } = render(<Screensaver ready={true} />);
		expect(baseElement).toBeTruthy();
	});
});
