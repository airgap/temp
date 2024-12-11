import { render } from '@testing-library/react';

import { TvFrame } from './TvFrame';

describe('Tv', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TvFrame />);
    expect(baseElement).toBeTruthy();
  });
});
