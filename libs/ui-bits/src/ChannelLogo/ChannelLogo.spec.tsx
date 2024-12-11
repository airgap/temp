import { render } from '@testing-library/react';

import { ChannelLogo } from './ChannelLogo';

describe('ChannelLogo', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ChannelLogo />);
    expect(baseElement).toBeTruthy();
  });
});
