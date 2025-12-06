/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx } from '../../../../util/componentUtil.ts';
import { mergeCallbacks } from '../../../../util/reactUtil.ts';

import { Input } from './Input.tsx';

import cl from './InputSensitive.module.scss';


type InputSensitiveRef = undefined | (React.ComponentRef<typeof Input> & {
  bkRevealed: boolean,
  bkToggleRevealed: () => void,
});
type InputSensitiveProps = Omit<React.ComponentProps<typeof Input>, 'ref'> & {
  ref?: undefined | React.Ref<InputSensitiveRef>,
  
  /** Whether to allow the user to reveal the value of the input. Default: true. */
  allowReveal?: undefined | boolean,
};
/**
 * An input for sensitive text. By default, the input will be masked and copying to the clipboard will not work. If
 * `allowReveal` is set to true, the user will be able to reveal the contents of the input.
 * 
 * Note: this is not meant for passwords, use `InputPassword` for that instead. The `InputSensitive` does not integrate
 * with password managers.
 */
export const InputSensitive = (props: InputSensitiveProps) => {
  const { ref, allowReveal = true, ...propsRest } = props;
  
  const inputRef = React.useRef<React.ComponentRef<typeof Input>>(null);
  
  const [isRevealed, setIsRevealed] = React.useState(false);
  const toggleRevealed = React.useCallback(() => { setIsRevealed(revealed => !revealed); }, []);
  
  React.useImperativeHandle(
    ref,
    () => inputRef.current
      ? ({ ...inputRef.current, bkRevealed: isRevealed, bkToggleRevealed: toggleRevealed })
      : undefined,
    [isRevealed, toggleRevealed],
  );
  
  // On blur, turn off the reveal
  const handleBlur = React.useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    // Check if the `relatedTarget` (where the focus moves to) is outside of this component
    if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget)) {
      setIsRevealed(false);
    }
  }, []);
  
  // Determine the kind of the content based on the `type` prop.
  // Note: if we need more granularity in the future we could consider an explicit `contentType` prop.
  const contentLabel = ((): string => {
    switch (propsRest.type) {
      case 'password': return 'password';
      default: return 'input';
    }
  })();
  
  // Since `-webkit-text-security` is not supported for `type="password"`, we will need to switch to `type="text"`
  // instead to reveal the content.
  // https://css-tricks.com/the-options-for-password-revealing-inputs
  const inputType = propsRest.type === 'password'
    ? (isRevealed ? 'text' : 'password')
    : propsRest.type;
  
  return (
    <Input
      ref={inputRef}
      {...propsRest}
      className={cx(
        cl['bk-sensitive-input'],
        // Note: this class triggers `-webkit-text-security`, but that does not have any effect for `type="password"`
        { [cl['bk-sensitive-input--revealed']]: isRevealed },
        propsRest.className,
      )}
      type={inputType}
      onBlur={mergeCallbacks([handleBlur, propsRest.onBlur])}
      actions={
        <>
          <Input.Action
            hidden={!allowReveal}
            icon={isRevealed ? 'eye-open' : 'eye-closed'}
            label={isRevealed
              ? `Hide ${contentLabel}`
              : `Reveal ${contentLabel}`
            }
            onPress={toggleRevealed}
          />
          {propsRest.actions}
        </>
      }
    />
  );
};
