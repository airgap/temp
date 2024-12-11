import { Link, LinkProps } from './Link';
import styles from './CoolLink.module.sass';
import classNames from 'classnames';

export const CoolLink = (props: LinkProps) => (
  <Link
    className={classNames(styles.CoolLink, {
      [styles.depressed]:
        props.href && window.location.pathname.startsWith(props.href),
    })}
    {...props}
  />
);
