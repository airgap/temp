import { render } from '@testing-library/react';

import { ChannelList } from './ChannelList';

describe('Cards', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ChannelList channels={[]} />);
    expect(baseElement).toBeTruthy();
  });
});
