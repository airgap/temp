import { render } from '@testing-library/react';

import { Tv } from './Tv';

describe('Tv', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Tv />);
    expect(baseElement).toBeTruthy();
  });
});
