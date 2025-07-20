/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/component_util.tsx';

import { BaklavaIcon } from '../../icons/icon-pack-baklava/BaklavaIcon.tsx';
import { Button } from '../../buttons/Button.tsx';

import './Input.scss';


export type InputProps = ComponentProps<'input'> & {
  /** Whether to display a toggle to show/hide the content (e.g. for password fields). */
  toggleVisibility?: undefined | boolean,
};
export const Input = (props: InputProps) => {
  const {
    ref,
    className,
    toggleVisibility = false,
    type = 'text',
    ...propsRest
  } = props;
  
  const [isTextVisible, setIsTextVisible] = React.useState(!toggleVisibility);
  
  const toggleSecretVisible = () => {
    setIsTextVisible(!isTextVisible);
  };
  
  return (
    <div className={cx('bkl bkl-input', className)}>
      <input
        ref={ref}
        type={isTextVisible ? type : 'password'}
        {...propsRest}
        className={cx('bkl-input__input', {
          'bkl-input__input--toggle-visibility': toggleVisibility,
        })}
      />
      {toggleVisibility &&
        <Button
          plain
          onClick={toggleSecretVisible}
          className="bkl-input__input--toggle-visibility-button"
          aria-label="Toggle input visibility"
        >
          <BaklavaIcon
            className="password-toggle-icon"
            icon={isTextVisible ? 'eye' : 'eye-closed'}
          />
        </Button>
      }
    </div>
  );
};
