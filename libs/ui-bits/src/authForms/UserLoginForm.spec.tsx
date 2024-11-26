import { render } from '@testing-library/react';

import { UserLoginForm } from './UserLoginForm';

describe('UserLoginForm', () => {
	it('should render successfully', () => {
		const { baseElement } = render(<UserLoginForm />);
		expect(baseElement).toBeTruthy();
	});
});
