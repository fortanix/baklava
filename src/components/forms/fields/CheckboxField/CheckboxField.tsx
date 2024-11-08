/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps, type ClassNameArgument } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import { Checkbox } from '../../controls/Checkbox/Checkbox.tsx';
import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { TooltipProvider } from '../../../overlays/Tooltip/TooltipProvider.tsx';

import cl from './CheckboxField.module.scss';


export { cl as CheckboxFieldClassNames };

export type CheckboxFieldTitleProps = React.PropsWithChildren<{
  className?: ClassNameArgument;

  /** Whether to display the optional observation on title. */
  titleOptional?: undefined | boolean,

  /** An optional tooltip to be displayed on an info icon next to the title. */
  titleTooltip?: undefined | string,
}>;

export const CheckboxFieldTitle = ({ className, children, titleOptional, titleTooltip }: CheckboxFieldTitleProps) => (
  <h1 className={cx(
    'bk',
    cl['bk-checkbox-field__title'],
    className,
  )}>
    {children}
    {titleTooltip && (
      <TooltipProvider tooltip={titleTooltip}>
        <Icon icon="info" className={cl['bk-checkbox-field__title__icon']}/>
      </TooltipProvider>
    )}
    {titleOptional && (
      <small className={cl['bk-checkbox-field__title__optional']}>(Optional)</small>
    )}
  </h1>
);

export type CheckboxFieldProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** A label to be displayed after the checkbox. */
  label: string,

  /** An optional supporting copy to be displayed under the label. */
  sublabel?: undefined | string,

  /** An optional title. */
  title?: undefined | string,

  /** An optional tooltip to be displayed on an info icon next to the title. */
  titleTooltip?: undefined | string,

  /** Whether to display the optional observation on title. */
  titleOptional?: undefined | boolean,

  /** Whether the checkbox is checked by default. Passed down to Checkbox component. */
  defaultChecked?: undefined | boolean,

  /** Whether the checkbox is checked. Passed down to Checkbox component. */
  checked?: undefined | boolean,

  /** Whether the checkbox is disabled. Passed down to Checkbox component. */
  disabled?: undefined | boolean,
};

/**
 * A full-fledged Checkbox field, with optional label, title, icon etc.
 */
export const CheckboxField = (props: CheckboxFieldProps) => {
  const {
    unstyled = false,
    label = '',
    sublabel,
    title,
    titleOptional,
    titleTooltip,
    className,
  } = props;

  return (
    <div className={cx(
      'bk',
      { [cl['bk-checkbox-field']]: !unstyled },
      className,
    )}>
      {title && (
        <CheckboxFieldTitle
          titleOptional={titleOptional}
          titleTooltip={titleTooltip}
        >
          {title}
        </CheckboxFieldTitle>
      )}
      {/* biome ignore lint/a11y/noLabelWithoutControl: the `<Checkbox>` will resolve to an `<input>` */}
      <label className={cl['bk-checkbox-field__label']}>
        <Checkbox
          checked={props.checked}
          defaultChecked={props.defaultChecked}
          disabled={props.disabled}
        />
        <div className={cl['bk-checkbox-field__label__content']}>
          {label}
          {sublabel && (
            <div className={cl['bk-checkbox-field__label__sublabel']}>{sublabel}</div>
          )}
        </div>
      </label>
    </div>
  );
};
