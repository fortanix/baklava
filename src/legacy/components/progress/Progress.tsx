import * as React from 'react';
import { classNames as cx, ComponentPropsWithoutRef } from '../../util/component_util';

import './Progress.scss';

type ProgressBarProps = ComponentPropsWithoutRef<'div'> & {
  percent: number,
  info?: React.ReactNode,
  infoMinWidth?: string,
};

export const ProgressBar = ({
  percent,
  info,
  infoMinWidth = '100px',
  className,
}: ProgressBarProps) => {
  const innerClassName = cx('bkl-progress-bar__inner', {
    'bkl-progress-bar--low': percent < 70,
    'bkl-progress-bar--medium': percent >= 70 && percent < 90,
    'bkl-progress-bar--high': percent >= 90,
  });
  
  return (
    <div className={cx('bkl-progress-bar', className)}>
      <span className="bkl-progress-bar__outer">
        <span className={innerClassName} style={{ width: `${percent}%` }} />
      </span>
      {info &&
        <span className="bkl-progress-bar__info" style={{ width: infoMinWidth }}>
          {info}
        </span>
      }
    </div>
  );
};
ProgressBar.displayName = 'ProgressBar';
