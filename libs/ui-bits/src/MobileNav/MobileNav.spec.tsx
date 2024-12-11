import { render } from '@testing-library/react';

import { MobileNav } from './MobileNav';

describe('MobileNav', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MobileNav />);
    expect(baseElement).toBeTruthy();
  });
});
