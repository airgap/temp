import { render } from '@testing-library/react';

import { PopupBox } from './PopupBox';

describe('PopupBox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PopupBox overlay={'no idea lol'} />);
    expect(baseElement).toBeTruthy();
  });
});
