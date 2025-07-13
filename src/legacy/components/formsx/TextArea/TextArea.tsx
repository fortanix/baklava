/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, ClassNameArgument } from '../../../util/component_util';

import TextAreaAutosize, { TextareaAutosizeProps } from 'react-textarea-autosize';

import './TextArea.scss';


export type TextAreaProps = Omit<TextareaAutosizeProps, 'className' | 'onFocus' | 'onBlur'> & {
  className?: ClassNameArgument,
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void,
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void,
  maxRows?: number,
  minRows?: number,
  primary?: boolean,
  fixedHeight?: boolean,
};
export const TextArea = (props: TextAreaProps): React.ReactElement => {
  const ref = React.useRef<HTMLTextAreaElement>(null);
  
  const {
    className = '',
    onFocus = () => {},
    onBlur = () => {},
    maxRows,
    minRows,
    primary = false,
    fixedHeight = false,
    ...propsRest
  } = props;
  
  const [isActive, setIsActive] = React.useState(false);
  
  React.useEffect(() => {
    if (ref && ref.current && isActive) {
      ref.current.focus();
    }
  }, [isActive]);
  
  const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsActive(true);
    if (onFocus) {
      onFocus(event);
    }
  };
  
  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsActive(false);
    if (onBlur) {
      onBlur(event);
    }
  };
  
  return (
    <div
      className={cx('bkl-textarea', className, {
        'bkl-textarea--primary': primary,
        'bkl-textarea--fixed-height': fixedHeight,
      })}
    >
      <TextAreaAutosize
        {...propsRest}
        ref={ref}
        className={cx('bkl-textarea__textarea', className)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        maxRows={maxRows}
        minRows={minRows}
      />
    </div>
  );
};
TextArea.displayName = 'TextArea';

export default TextArea;
