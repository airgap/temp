import { Post } from '@lyku/json-models';
import echo from './assets/repeat.svg';
import { shout } from './Sonic';
import { ReactionButton } from './ReactionButton';

export const EchoButton = ({ post }: { post: Post }) => (
  <ReactionButton glyph={echo} onClick={() => shout('echo', post)} />
);
