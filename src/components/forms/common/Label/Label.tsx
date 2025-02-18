/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import cl from './Label.module.scss';


export { cl as LabelClassNames };

export type LabelPosition = 'inline-start' | 'inline-end';

export type LabelProps = React.PropsWithChildren<ComponentProps<'label'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The label text */
  label: React.ReactNode,
  
  /** The position of the label relative to the control. Default: 'inline-start'. */
  position?: undefined | LabelPosition,
}>;
/**
 * Wrapper around a control to add inline label text.
 */
export const Label = (props: LabelProps) => {
  const { unstyled = false, children, label, position = 'inline-start', ...propsRest } = props;
  
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: The control is nested inside the label.
    <label
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-label']]: !unstyled },
        propsRest.className,
      )}
    >
      {position === 'inline-start' && <span className={cl['bk-label__text']}>{label}</span>}
      {children}
      {position === 'inline-end' && <span className={cl['bk-label__text']}>{label}</span>}
    </label>
  );
};
