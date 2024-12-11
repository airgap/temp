import classnames from 'classnames';
import { FormEventHandler, useEffect, useState } from 'react';

import styles from './Texticle.module.sass';
import { StringJsonSchema } from 'from-schema';

export type OnInput = (text: string) => void;
export type OnValidation = (valid: boolean) => void | boolean;
type Type = 'text' | 'email' | 'password';
export type TexticleProps = {
  schema?: StringJsonSchema;
  empty?: string;
  valid?: string;
  invalid?: string;
  onInput?: OnInput;
  onValidation?: OnValidation;
  pattern?: string;
  type?: Type;
  minLength?: number;
  maxLength?: number;
  multiline?: boolean;
  value?: string;
};

/**
 * @noInheritDoc
 */
export const Texticle = (props: TexticleProps) => {
  const [label, setLabel] = useState(props.empty ?? '');
  const [valid, setValid] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [value, setValue] = useState('');
  const id = Math.random().toString().substring(2);
  const validate: (text: string) => boolean = (text: string) => {
    const pattern = props.pattern ?? props.schema?.pattern;
    if (pattern && !RegExp(pattern).test(text)) return false;
    const minlen = props.minLength ?? props.schema?.minLength;
    if (minlen && text.length < minlen) return false;
    const maxlen = props.maxLength ?? props.schema?.maxLength;
    if (maxlen && text.length > maxlen) return false;
    return true;
  };
  const onInput: FormEventHandler<HTMLInputElement | HTMLTextAreaElement> = (
    ev,
  ) => {
    const { value } = ev.currentTarget;
    setValue(value);
    props.onInput?.(value);
    doPlaceholder();
  };
  const doPlaceholder = () => {
    const isValid = validate(value);
    setValid(isValid);
    setInvalid(!isValid);
    const label = value
      ? isValid
        ? (props.valid ?? props.empty)
        : (props.invalid ?? props.empty)
      : props.empty;
    setLabel(label ?? props.empty ?? ' ');
  };
  useEffect(doPlaceholder, [props.empty, value, doPlaceholder]);
  useEffect(() => void props.onValidation?.(valid), [props, valid]);
  return (
    <div
      className={classnames(styles.Texticle, {
        valid: valid,
        invalid: invalid,
      })}
    >
      {props.multiline ? (
        <textarea id={id} onChange={onInput} placeholder={'-'}>
          {props.value}
        </textarea>
      ) : (
        <input
          id={id}
          onChange={onInput}
          placeholder={'-'}
          type={props.type ?? 'text'}
          defaultValue={props.value}
        />
      )}
      <label htmlFor={id}>{label}</label>
    </div>
  );
};
