import { render } from '@testing-library/react';

import { Agreeable } from './Agreeable';

describe('Agreeable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Agreeable />);
    expect(baseElement).toBeTruthy();
  });
});
