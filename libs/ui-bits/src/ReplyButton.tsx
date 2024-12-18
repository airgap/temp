import reply from './assets/comment.svg';
import { ReactionButton } from './ReactionButton';

export const ReplyButton = ({ onClick }: { onClick: () => void }) => (
	<ReactionButton glyph={reply} onClick={onClick} />
);
