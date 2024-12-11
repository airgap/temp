import { imageAndVideoMimes } from '@lyku/defaults';
import { useState } from 'react';

import { phrasebook } from '../phrasebook';
import upload from '../assets/plus.svg';
import styles from './UploadButton.module.sass';

export const UploadButton = ({
  onChange,
}: {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}) => {
  const [id] = useState(Math.random().toString());
  return (
    <>
      <input
        type="file"
        className={styles.file}
        id={id}
        name="avatar"
        accept={imageAndVideoMimes}
        multiple={true}
        onChange={onChange}
      />
      <label htmlFor={id}>
        <img
          src={upload}
          className={styles.UploadButton}
          alt={phrasebook.upload}
        />
      </label>
    </>
  );
};
