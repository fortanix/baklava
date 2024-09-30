
import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import cl from './ProgressBar.module.scss';


export { cl as ProgressBarClassNames };

export type ProgressBarProps = React.PropsWithChildren<ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The progress it should be displaying as in percent, ranging from 0 to 100. */
  progress: number,

  /** An optional label, displayed as the progress bar title. */
  label?: string | undefined,

  /** An optional hint text, displayed after the progress bar. */
  hintText?: string | undefined,
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
        <div className={cl['bk-progress-bar--label']}>{label}</div>
      )}
      <progress
        {...propsRest}
        className={cx({
          bk: true,
          [cl['bk-progress-bar']]: !unstyled,
        }, propsRest.className)}
        max="100"
        value={progress}
      >
        {progress}%
      </progress>
      {hintText && (
        <div className={cl['bk-progress-bar--hint-text']}>{hintText}</div>
      )}
    </div>
  );
};
