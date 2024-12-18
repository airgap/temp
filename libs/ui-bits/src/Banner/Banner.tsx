import classnames from 'classnames';
import { FC, ReactNode } from 'react';

import bannerStyles from './Banner.module.sass';

type BannerProps = { children?: ReactNode };

/**
 * @noInheritDoc
 */
export const Banner: FC<BannerProps> = (props) => (
	<div className={classnames(bannerStyles.Banner)}>{props.children}</div>
);
