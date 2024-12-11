import classnames from 'classnames';

import { formImageUrl } from '../formImageUrl';
import styles from './Image.module.sass';
import face from './face.png';
export type Shape = 'circle' | 'square' | 'squircle' | 'rounded';
export type ImageProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
> & {
  size?: 'l' | 'm' | 's' | 'full-post';
  bot?: boolean;
  shape?: Shape;
  url?: string;
  // CLOUDFLARE UPLOAD ID
  // NOOOOOOOOT HTML ID
  id?: string;
};

export const Image = (props: ImageProps) => (
  <span
    className={classnames(
      styles.Image,
      props.className,
      props.size && styles[props.size],
      {
        [styles.bot]: props.bot,
        [styles.squircle]: props.shape === 'squircle',
        [styles.circle]: props.shape === 'circle',
      },
    )}
  >
    <img
      src={
        'id' in props
          ? props.id?.startsWith('/')
            ? props.id
            : formImageUrl(props.id)
          : 'url' in props
            ? props.url
            : face
      }
      alt={'Profile'}
    />
  </span>
);
