import classnames from 'classnames';

import { Link } from '../Link';
import { getHomepage } from '../getHomepage';
import styles from './NavLogo.module.sass';
import logo from './gifmaker_me.gif';
import { useId } from 'react';

export const NavLogo = ({ className }: { className?: string }) => {
  const maskId = useId();
  return (
    <Link
      href={getHomepage()}
      className={classnames(className, styles.NavLogo)}
    >
      <svg width="30px" height="30px">
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
          >
            <image xlinkHref={logo} width={'100%'} />
          </mask>
        </defs>
        <g mask={`url(#${maskId})`}>
          <rect
            width="100%"
            height="100%"
            x="0"
            y="0"
            fill="white"
            className={styles.rainbow}
          />
        </g>
      </svg>
    </Link>
  );
};
