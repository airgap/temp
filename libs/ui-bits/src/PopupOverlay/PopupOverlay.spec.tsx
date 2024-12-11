import { render } from '@testing-library/react';

import { PopupOverlay } from './PopupOverlay';

describe('PopupOverlay', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PopupOverlay />);
    expect(baseElement).toBeTruthy();
  });
});
