/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../componentUtil.ts';

import cl from './LayoutDecorator.module.scss';


/**
 * Utility component to wrap around storybook stories to provide a nicer base layout.
 */
export type LayoutDecoratorProps = ComponentProps<'div'> & {
  size?: undefined | 'x-small' | 'small' | 'medium' | 'large' | 'x-large',
  resize?: undefined | 'none' | 'inline' | 'block' | 'both',
};
export const LayoutDecorator = (props: LayoutDecoratorProps) => {
  const {
    children,
    size = 'medium',
    resize = 'none',
    ...propsRest
  } = props;
  
  return (
    <div
      {...propsRest}
      className={cx(
        { [cl['util-layout-decorator']]: true },
        { [cl['util-layout-decorator--x-small']]: size === 'x-small' },
        { [cl['util-layout-decorator--small']]: size === 'small' },
        { [cl['util-layout-decorator--medium']]: size === 'medium' },
        { [cl['util-layout-decorator--large']]: size === 'large' },
        { [cl['util-layout-decorator--x-large']]: size === 'x-large' },
        { [cl['util-layout-decorator--resizable']]: resize !== 'none' },
        propsRest.className,
      )}
      style={{ resize, ...(propsRest.style ?? {}) }}
    >
      {children}
    </div>
  );
};
