/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { timeout } from '../../../../util/time.ts';

import { type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';
import { useFormStatus } from 'react-dom';

import { useFormContext } from '../Form/Form.tsx';
import { internalSubmitSymbol, Button } from '../../../actions/Button/Button.tsx';
import { Spinner } from '../../../graphics/Spinner/Spinner.tsx';

import cl from './SubmitButton.module.scss';


export { cl as SubmitButtonClassNames };

export type SubmitButtonProps = ComponentProps<typeof Button> & {
  /** Time (in ms) after which async actions will trigger a failure */
  asyncTimeout?: number,
  
  /** Event handler for button press events. */
  onPress?: undefined | (() => void | Promise<void>),
};


/**
 * Button to submit the current form.
 */
export const SubmitButton = (props: SubmitButtonProps) => {
  const {
    onPress,
    asyncTimeout = 30_000,
    ...propsButton
  } = props;
  
  const formContext = useFormContext();
  const formStatus = useFormStatus();
  const [isPressPending, startPressTransition] = React.useTransition();
  
  const isPending = isPressPending || formStatus.pending;
  const isInteractive = !propsButton.disabled && !propsButton.nonactive && !isPending;
  const isDisabled = !isInteractive;
  const isNonactive = propsButton.nonactive || isPending;
  
  const handlePress = React.useCallback(() => {
    if (typeof onPress !== 'function') { return; }
    
    startPressTransition(async () => {
      await Promise.race([onPress(), timeout(asyncTimeout)]);
    });
  }, [onPress, asyncTimeout]);
  
  const handleClick = React.useCallback(async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // `onClick` should not be used in most cases, only if the consumer needs low level control over click events.
    // Instead, use `onPress` or a `<form>` component with `action`.
    props.onClick?.(event); // Call this first, to allow cancellation
    
    if (!isInteractive) { return; }
    
    if (typeof onPress === 'function') {
      event.preventDefault();
      handlePress();
    }
    
    // Fallback: trigger default browser action (e.g. form submit)
  }, [props.onClick, isInteractive, onPress, handlePress]);
  
  const renderContent = (): React.ReactNode => {
    // If `children` is specified, that overrides the button content
    if (propsButton.children) {
      return propsButton.children;
    }
    
    return (
      <>
        {isPending && <Spinner className="icon" inline/>}
        {propsButton.label ?? 'Submit'}
      </>
    );
  };
  
  return (
    <Button
      variant="primary" // Primary by default
      form={formContext.formId}
      {...propsButton}
      // @ts-ignore We're using an invalid `type` on purpose here, this is meant to be used internally only.
      type={internalSubmitSymbol}
      disabled={isDisabled}
      onClick={handleClick}
    >
      {renderContent()}
    </Button>
  );
};
