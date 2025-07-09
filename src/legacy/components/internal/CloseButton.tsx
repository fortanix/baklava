/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cx from 'classnames';
import * as React from 'react';

import { Button } from '../buttons/Button';

import './CloseButton.scss';

export type CloseButtonProps = Omit<JSX.IntrinsicElements['div'], 'className'> & {
  className?: string,
  onClose?: (() => void),
  small?: boolean,
  dark?: boolean,
  neutral?: boolean,
};

const CloseButton = (props: CloseButtonProps): React.ReactElement => {
  const { onClose = () => {}, className = '', small = false, dark = false, neutral = false } = props;
  return (
    <Button plain className={className} onClick={onClose} aria-label="Close">
      <span
        className={cx('bkl-close',
          { 
            'bkl-close--small': small,
            'bkl-close--dark': dark,
            'bkl-close--neutral': neutral,       
          })
        }
        aria-hidden="true"
      />
    </Button>
  );
};

export default CloseButton;
