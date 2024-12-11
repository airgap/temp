import { render } from '@testing-library/react';

import { PostList } from './PostList';

describe('SubmitButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PostList posts={[]} />);
    expect(baseElement).toBeTruthy();
  });
});
