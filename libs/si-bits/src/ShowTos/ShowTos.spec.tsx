import { render } from '@testing-library/react';

import { ShowTos } from './ShowTos';

describe('ShowTos', () => {
	it('should render successfully', () => {
		const { baseElement } = render(<ShowTos />);
		expect(baseElement).toBeTruthy();
	});
});
