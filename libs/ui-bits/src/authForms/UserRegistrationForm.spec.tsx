import { render } from '@testing-library/react';

import { UserRegistrationForm } from './UserRegistrationForm';

describe('UserRegistrationForm', () => {
	it('should render successfully', () => {
		const { baseElement } = render(<UserRegistrationForm />);
		expect(baseElement).toBeTruthy();
	});
});
