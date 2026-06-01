/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { useScroller } from '../../../layouts/util/Scroller.tsx';

import { H4 } from '../../../typography/Heading/Heading.tsx';
import { Spinner } from '../../graphics/Spinner/Spinner.tsx';

import cl from './Panel.module.scss';


export { cl as PanelClassNames };


export type PanelHeadingProps = React.PropsWithChildren<ComponentProps<typeof H4>>;
export const PanelHeading = (props: PanelHeadingProps) => {
  return <H4 {...props} className={cx(cl['bk-panel__heading'], props.className)}/>;
};

export type PanelProps = React.PropsWithChildren<ComponentProps<'section'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Whether the panel should be edgeless. */
  edgeless?: undefined | boolean,
  
  /** Whether the panel display a loading indicator, instead of it's children */
  status?: undefined | 'ready' | 'loading',
}>;
/**
 * Panel component.
 */
export const Panel = Object.assign(
  (props: PanelProps) => {
    const {
      children,
      unstyled = false,
      edgeless = false,
      status = 'ready',
      ...propsRest
    } = props;
    const scrollerProps = useScroller();
    
    return (
      <section
        {...scrollerProps}
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-panel']]: !unstyled },
          { [cl['bk-panel--edgeless']]: !!edgeless },
          { [cl['bk-panel--loading--empty']]: status === 'loading' && !children },
          scrollerProps.className,
          propsRest.className,
        )}
        inert={status === 'loading'}
      >
        {status === 'loading' && (
          <div className={cl['bk-panel__loading']}>
            <Spinner className={cl['bk-panel__loading__spinner']}/>
          </div>
        )}
        {children}
      </section>
    );
  },
  {
    Heading: PanelHeading,
  },
);
