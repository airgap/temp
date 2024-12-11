import { render } from '@testing-library/react';

import { AuthOverlay } from './AuthOverlay';

describe('AuthOverlay', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<AuthOverlay />);
    expect(baseElement).toBeTruthy();
  });
});
