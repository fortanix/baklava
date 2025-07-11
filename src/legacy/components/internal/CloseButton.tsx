/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../util/component_util.tsx';

import { Button } from '../buttons/Button.tsx';

import './CloseButton.scss';


export type CloseButtonProps = ComponentProps<'div'> & {
  onClose?: undefined | (() => void),
  small?: undefined | boolean,
  dark?: undefined | boolean,
  neutral?: undefined | boolean,
};
export const CloseButton = (props: CloseButtonProps) => {
  const { onClose = () => {}, className = '', small = false, dark = false, neutral = false } = props;
  
  return (
    <Button plain className={className} onClick={onClose} aria-label="Close">
      <span
        aria-hidden="true"
        className={cx(
          'bkl',
          'bkl-close',
          {
            'bkl-close--small': small,
            'bkl-close--dark': dark,
            'bkl-close--neutral': neutral,       
          }
        )}
      />
    </Button>
  );
};
