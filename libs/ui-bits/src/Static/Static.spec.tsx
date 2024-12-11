import { render } from '@testing-library/react';

import { Static } from './Static';

describe('Static', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Static />);
    expect(baseElement).toBeTruthy();
  });
});
