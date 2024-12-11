import { DetailedHTMLProps, HTMLAttributes } from 'react';

export const Center = (
  props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
) => (
  <div
    {...props}
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      textAlign: 'center',
    }}
  ></div>
);
