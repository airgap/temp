import { render } from '@testing-library/react';

import { Texticle } from './Texticle';

describe('Texticle', () => {
	it('should render successfully', () => {
		const { baseElement } = render(<Texticle />);
		expect(baseElement).toBeTruthy();
	});
});
