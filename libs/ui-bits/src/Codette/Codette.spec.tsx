import { render } from '@testing-library/react';

import { Codette } from './Codette';

describe('Card', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Codette />);
    expect(baseElement).toBeTruthy();
  });
});
