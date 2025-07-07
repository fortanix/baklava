/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../util/component_util.tsx';

import { Button } from '../buttons/Button.tsx';

import './CloseButton.scss';


export type CloseButtonProps = Omit<ComponentProps<typeof Button>, 'children'> & {
  small?: undefined | boolean,
  neutral?: undefined | boolean,
  onClose?: undefined | (() => void),
};
export const CloseButton = (props: CloseButtonProps) => {
  const { small = false, neutral = false, onClose, ...propsRest } = props;
  
  return (
    <Button
      plain
      aria-label="Close"
      className={cx(
        'bkl-close-button',
        {
          'bkl-close-button--small': small,
          'bkl-close-button--neutral': neutral,
        },
        propsRest.className,
      )}
      onClick={onClose}
    >
      <span
        aria-hidden="true"
        className="bkl-close-button__icon"
      />
    </Button>
  );
};
