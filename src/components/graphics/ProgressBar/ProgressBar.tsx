/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import cl from './ProgressBar.module.scss';


export { cl as ProgressBarClassNames };

export type ProgressBarProps = React.PropsWithChildren<ComponentProps<'progress'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The progress, as a percentage ranging from 0 to 100. */
  progress: number,
  
  /** An optional label, displayed as the progress bar title. */
  label?: undefined | string,
  
  /** An optional hint text, displayed below the progress bar. */
  hintText?: undefined | string,
}>;
/**
 * A way to display progress to complete a task or the time remaining.
 */
export const ProgressBar = (props: ProgressBarProps) => {
  const {
    unstyled = false,
    progress = 0,
    label = undefined,
    hintText = undefined,
    ...propsRest
  } = props;
  return (
    <div>
      {label && (
        <div className={cl['bk-progress-bar__label']}>{label}</div>
      )}
      <progress
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-progress-bar']]: !unstyled },
          propsRest.className,
        )}
        max={100}
        value={progress}
      >
        {progress}%
      </progress>
      {hintText && (
        <div className={cl['bk-progress-bar__hint-text']}>{hintText}</div>
      )}
    </div>
  );
};
