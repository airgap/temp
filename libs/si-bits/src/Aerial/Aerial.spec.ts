import { render } from '@testing-library/svelte';
import Aerial from './Aerial.svelte';

describe('Aerial', () => {
	it('should render successfully', () => {
		const { container } = render(Aerial, { props: { loading: true } });
		expect(container).toBeTruthy();
	});
});
