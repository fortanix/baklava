/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, ComponentProps } from '../../util/component_util.tsx';

import './Progress.scss';


type ProgressBarProps = ComponentProps<'div'> & {
  percent: number,
  info?: undefined | React.ReactNode,
  infoMinWidth?: undefined | string,
};
export const ProgressBar = ({
  percent,
  info,
  infoMinWidth = '100px',
  className,
}: ProgressBarProps) => {
  const innerClassName = cx(
    'bkl',
    'bkl-progress-bar__inner',
    {
      'bkl-progress-bar--low': percent < 70,
      'bkl-progress-bar--medium': percent >= 70 && percent < 90,
      'bkl-progress-bar--high': percent >= 90,
    },
  );
  
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
