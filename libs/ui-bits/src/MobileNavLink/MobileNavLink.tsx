import { Link, LinkProps } from '../Link';
import classNames from 'classnames';
import styles from './MobileNavLink.module.sass';

export const MobileNavLink = (props: LinkProps) => (
	<Link
		{...props}
		className={classNames({
			[styles.depressed]:
				props.href && window.location.pathname.startsWith(props.href),
		})}
	/>
);
