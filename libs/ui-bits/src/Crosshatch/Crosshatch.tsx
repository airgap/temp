import classnames from 'classnames';
import { CSSProperties } from 'react';

import styles from './Crosshatch.module.sass';

export const Crosshatch = ({
  width,
  height,
  style,
  bright,
}: {
  width?: string;
  height?: string;
  style?: CSSProperties;
  bright?: boolean;
}) => (
  <div
    className={classnames(styles.Crosshatch, { [styles.bright]: bright })}
    style={{ ...style, width, height }}
  />
);
