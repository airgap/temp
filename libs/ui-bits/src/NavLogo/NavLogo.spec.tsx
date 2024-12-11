import { render } from '@testing-library/react';

import { NavLogo } from './NavLogo';

describe('Nav', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NavLogo />);
    expect(baseElement).toBeTruthy();
  });
});
