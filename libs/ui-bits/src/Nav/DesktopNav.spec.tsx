import { render } from '@testing-library/react';

import { DesktopNav } from './DesktopNav';

describe('Nav', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DesktopNav />);
    expect(baseElement).toBeTruthy();
  });
});
