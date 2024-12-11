import { render } from '@testing-library/react';

import { Close } from './Close';

describe('Button', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Close />);
    expect(baseElement).toBeTruthy();
  });
});
