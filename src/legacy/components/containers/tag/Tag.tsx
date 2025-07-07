/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, ComponentPropsWithoutRef } from '../../../util/component_util.tsx';
import { CloseButton } from '../../internal/CloseButton.tsx';

import './Tag.scss';


type TagProps = ComponentPropsWithoutRef<'div'> & {
  primary?: undefined | boolean,
  dashedBorder?: undefined | boolean,
  small?: undefined | boolean,
  onClose?: undefined | (() => void),
};
export const Tag = (props: TagProps) => {
  const {
    className = '',
    children,
    primary = false,
    dashedBorder = false,
    small = false,
    onClose,
    ...rest
  } = props;
  
  return (
    <div
      className={cx(
        'bkl',
        'bkl-tag',
        className,
        {
          'bkl-tag--primary': primary,
          'bkl-tag--dashed-border': dashedBorder,
          'bkl-tag--closable': onClose,
          'bkl-tag--small': small,
        },
      )}
      {...rest}
    >
      {children}
      {onClose && <CloseButton onClose={onClose} small/>}
    </div>
  );
};
