/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/component_util.tsx';

import { BaklavaIcon } from '../../icons/icon-pack-baklava/BaklavaIcon.tsx';
import { Tooltip } from '../../overlays/tooltip/Tooltip.tsx';
import { Button } from '../../buttons/Button.tsx';
import { Input } from '../Input/Input.tsx';

import './MaskedInput.scss';


type MaskedInputPropsType = ComponentProps<typeof Input>;
export const MaskedInput = (props: MaskedInputPropsType) => {
  const [secretVisible, setSecretVisible] = React.useState(false);
  
  return (
    <div className="bkl-masked-input">
      <Input
        autoComplete="new-password"
        {...props}
        type={secretVisible ? 'text' : 'password'}
        className={cx('bkl-masked-input__input', props.className)}
      />
      <Tooltip content={secretVisible ? 'Hide input' : 'Show input'}>
        <Button
          plain
          className="bkl-masked-input__visibility-button"
          onClick={() => { setSecretVisible(!secretVisible); }}
          aria-label="Toggle input visibility"
        >
          <BaklavaIcon
            className="bkl-masked-input__visibility-icon"
            icon={secretVisible ? 'eye' : 'eye-closed'}
          />
        </Button>
      </Tooltip>
    </div>
  );
};
