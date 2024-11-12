/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps, type ClassNameArgument } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import { RadioButton } from '../../controls/RadioButton/RadioButton.tsx';
import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { TooltipProvider } from '../../../overlays/Tooltip/TooltipProvider.tsx';

import cl from './RadioButtonField.module.scss';


export { cl as RadioButtonFieldClassNames };

export type RadioButtonFieldTitleProps = React.PropsWithChildren<{
  className?: ClassNameArgument;

  /** Whether to display the optional observation on title. */
  titleOptional?: undefined | boolean,

  /** An optional tooltip to be displayed on an info icon next to the title. */
  titleTooltip?: undefined | string,
}>;

export const RadioButtonFieldTitle = ({ className, children, titleOptional, titleTooltip }: RadioButtonFieldTitleProps) => (
  <h1 className={cx(
    'bk',
    cl['bk-radio-button-field__title'],
    className,
  )}>
    {children}
    {titleTooltip && (
      <TooltipProvider tooltip={titleTooltip}>
        <Icon icon="info" className={cl['bk-radio-button-field__title__icon']}/>
      </TooltipProvider>
    )}
    {titleOptional && (
      <small className={cl['bk-radio-button-field__title__optional']}>(Optional)</small>
    )}
  </h1>
);

export type RadioButtonFieldProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** A label to be displayed after the radio button. */
  label: string,

  /** An optional supporting copy to be displayed under the label. */
  sublabel?: undefined | string,

  /** An optional title. */
  title?: undefined | string,

  /** An optional tooltip to be displayed on an info icon next to the title. */
  titleTooltip?: undefined | string,

  /** Whether to display the optional observation on title. */
  titleOptional?: undefined | boolean,

  /** Whether the radio button is selected by default. Passed down to Radio Button component. */
  defaultChecked?: undefined | boolean,

  /** Whether the radio button is selected. Passed down to Radio Button component. */
  checked?: undefined | boolean,

  /** Whether the radio button is disabled. Passed down to Radio Button component. */
  disabled?: undefined | boolean,
};

/**
 * A full-fledged Radio Button field, with optional label, title, icon etc.
 */
export const RadioButtonField = (props: RadioButtonFieldProps) => {
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
      { [cl['bk-radio-button-field']]: !unstyled },
      className,
    )}>
      {title && (
        <RadioButtonFieldTitle
          titleOptional={titleOptional}
          titleTooltip={titleTooltip}
        >
          {title}
        </RadioButtonFieldTitle>
      )}
      {/* biome ignore lint/a11y/noLabelWithoutControl: the `<Checkbox>` will resolve to an `<input>` */}
      <label className={cl['bk-radio-button-field__label']}>
        <RadioButton
          checked={props.checked}
          defaultChecked={props.defaultChecked}
          disabled={props.disabled}
          onChange={props.onChange}
        />
        <span className={cl['bk-radio-button-field__label__content']}>
          {label}
        </span>
      </label>
      {sublabel && (
        <div className={cl['bk-radio-button-field__sublabel']}>{sublabel}</div>
      )}
    </div>
  );
};
