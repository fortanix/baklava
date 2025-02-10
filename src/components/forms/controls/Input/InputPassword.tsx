/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { Input } from './Input.tsx';


type InputPasswordRef = undefined | (React.ComponentRef<typeof Input> & {
  bkToggleVisibility: () => void,
});
type InputPasswordProps = Omit<React.ComponentProps<typeof Input>, 'ref'> & {
  ref?: undefined | React.Ref<InputPasswordRef>,
};
/** A password input control. */
export const InputPassword = ({ ref, ...propsRest }: InputPasswordProps) => {
  const inputRef = React.useRef<React.ComponentRef<typeof Input>>(null);
  
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = React.useCallback(() => { setIsVisible(visible => !visible); }, []);
  
  React.useImperativeHandle(
    ref,
    () => inputRef.current ? ({ ...inputRef.current, bkToggleVisibility: toggleVisibility }) : undefined,
    [toggleVisibility],
  );
  
  // Note: this would be easier if this were always a controlled component, but this component is designed to be
  // used as either controlled or uncontrolled.
  const [showIcon, setShowIcon] = React.useState(false);
  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const isEmpty = event.target.value === '';
    setShowIcon(!isEmpty);
  }, []);
  
  return (
    <Input
      ref={inputRef}
      type={isVisible ? 'text' : 'password'}
      placeholder="Password"
      actions={
        <Input.Action
          hidden={!showIcon}
          icon={isVisible ? 'eye-open' : 'eye-closed'}
          label={isVisible ? 'Password is visible' : 'Password is hidden'}
          onPress={toggleVisibility}
        />
      }
      onChange={handleChange}
      {...propsRest}
    />
  );
};
