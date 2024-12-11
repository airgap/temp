import classnames from 'classnames';
import { MouseEventHandler, ReactNode } from 'react';

import styles from './Link.module.sass';

export type LinkProps = {
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  href?: string;
  target?: string;
};

/**
 * @noInheritDoc
 */
export const Link = (props: LinkProps) => {
  const pps = {
    ...props,
    className: classnames(styles.Link, props.className),
  };
  return 'href' in props ? (
    <a {...pps}>{pps.children}</a>
  ) : (
    <button {...pps}>{pps.children}</button>
  );
};
