import share from './assets/net.svg';
import { ReactionButton } from './ReactionButton';
import { Post } from '@lyku/json-models';

export const ShareButton = ({ post }: { post: Post }) => (
  <ReactionButton glyph={share} />
);
