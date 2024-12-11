import { render } from '@testing-library/react';

import { ChatBox } from './ChatBox';

describe('ChatBox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ChatBox />);
    expect(baseElement).toBeTruthy();
  });
});
