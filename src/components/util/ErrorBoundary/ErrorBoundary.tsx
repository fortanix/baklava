/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { type ComponentProps, classNames as cx } from '../../../util/componentUtil.ts';

import {
  type FallbackProps as ErrorFallbackProps,
  type ErrorBoundaryProps as ReactErrorBoundaryProps,
  ErrorBoundary as ReactErrorBoundary,
  useErrorBoundary,
} from 'react-error-boundary';

import { Button } from '../../actions/Button/Button.tsx';

import cl from './ErrorBoundary.module.scss';


export type { ErrorFallbackProps };

const RetryButton = (props: Partial<React.ComponentProps<typeof Button>>) => {
  const { resetBoundary } = useErrorBoundary();
  
  const retry = React.useCallback(async () => {
    // Add a small sleep period to give the user clear feedback that we're attemping a retry. This is in case the
    // retry immediately fails again, which otherwise would provide no feedback to the user.
    await new Promise(resolve => window.setTimeout(resolve, 500));
    
    resetBoundary();
  }, [resetBoundary]);
  
  return (
    <Button label="Try again" {...props} onPress={retry}/>
  );
};

type ErrorLayoutProps = ComponentProps<'div'> & {
  fallbackProps: ErrorFallbackProps,
  //errorMessage: React.ReactNode,
  actions?: undefined | React.ReactNode,
};
export const ErrorLayout = (props: ErrorLayoutProps) => {
  const { children, fallbackProps, actions, ...propsRest } = props;
  
  const renderErrorMessage = () => {
    if (typeof children !== 'undefined') { return children; }
    
    const error = fallbackProps.error;
    if (error instanceof Error) { // In the future: use `Error.isError()` (once supported)
      return error.message;
    } else if (typeof error === 'string' || typeof error === 'number') {
      return String(error);
    } else {
      return 'An unknown error has occurred';
    }
  };
  
  return (
    <div role="alert" {...propsRest} className={cx(cl['bk-error-layout'], propsRest.className)}>
      <article>{renderErrorMessage()}</article>
      <div>
        {actions}
        
        <RetryButton kind="primary"/>
        
        {/* {retryCount.current >= 1 &&
          <Button kind="secondary" label="Refresh" onPress={() => { window.location.reload(); }}/>
        } */}
      </div>
    </div>
  );
};

type ErrorBoundaryProps = React.PropsWithChildren<ReactErrorBoundaryProps> & {
  /** Given an error, returns whether this error boundary should handle the error, or pass it through. */
  shouldHandleError?: undefined | ((error: Error, info: React.ErrorInfo, retryCount: number) => boolean),
};
export const ErrorBoundary = (props: ErrorBoundaryProps) => {
  const { children, shouldHandleError, ...errorBoundaryProps } = props;
  
  // The amount of times this error boundary has been retried recently
  // TODO: reset this to 0 after a certain (short) amount of time
  const [retryCount, setRetryCount] = React.useState(0);
  
  return (
    <ReactErrorBoundary
      {...errorBoundaryProps}
      onError={(error, info) => {
        if (typeof shouldHandleError === 'function' && !shouldHandleError(error, info, retryCount)) {
          throw error;
        }
      }}
      onReset={() => { setRetryCount(count => count + 1); }}
    >
      {children}
    </ReactErrorBoundary>
  );
};
