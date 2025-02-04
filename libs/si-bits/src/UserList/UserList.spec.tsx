import { render } from '@testing-library/react';
import { UserList } from './UserList';

describe('Cards', () => {
	it('should render successfully', () => {
		const { baseElement } = render(<UserList users={[]} />);
		expect(baseElement).toBeTruthy();
	});
});
