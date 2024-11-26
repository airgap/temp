import { render } from '@testing-library/react';

import { ImageUpload } from './ImageUpload';

describe('Button', () => {
	it('should render successfully', () => {
		const { baseElement } = render(<ImageUpload />);
		expect(baseElement).toBeTruthy();
	});
});
