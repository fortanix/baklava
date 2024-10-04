/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { H4 } from '../../../typography/Heading/Heading.tsx';

import cl from './Panel.module.scss';


export { cl as PanelClassNames };


export type PanelHeadingProps = React.PropsWithChildren<ComponentProps<typeof H4>>;
export const PanelHeading = (props: PanelHeadingProps) => {
  return <H4 {...props} className={cx(cl['bk-panel__heading'], props.className)}/>;
};

export type PanelProps = React.PropsWithChildren<ComponentProps<'section'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
/**
 * Panel component.
 */
export const Panel = Object.assign(
  (props: PanelProps) => {
    const { children, unstyled = false, ...propsRest } = props;
    
    return (
      <section
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-panel']]: !unstyled },
          propsRest.className,
        )}
      >
        {children}
      </section>
    );
  },
  {
    Heading: PanelHeading,
  },
);
