import { render } from '@testing-library/react';

import { Aerial } from './Aerial';

describe('Aerial', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Aerial loading={true} />);
    expect(baseElement).toBeTruthy();
  });
});
