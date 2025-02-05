import { render } from '@testing-library/svelte';
import UserList from './UserList.svelte';

describe('Cards', () => {
	it('should render successfully', () => {
		const { baseElement } = render(UserList, { users: [] });
		expect(baseElement).toBeTruthy();
	});
});
