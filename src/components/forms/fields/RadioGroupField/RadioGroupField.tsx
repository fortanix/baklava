/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps, type ClassNameArgument } from '../../../../util/componentUtil.ts';

import { Radio } from '../../controls/Radio/Radio.tsx';
import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { TooltipProvider } from '../../../overlays/Tooltip/TooltipProvider.tsx';

import cl from './RadioGroupField.module.scss';


export { cl as RadioGroupFieldClassNames };

export type RadioGroupTitleProps = React.PropsWithChildren<{
  className?: ClassNameArgument,
  
  /** Whether to display the optional observation on title. */
  optional?: undefined | boolean,
  
  /** An optional tooltip to be displayed on an info icon next to the title. */
  titleTooltip?: undefined | string,
}>;

export const RadioGroupFieldTitle = ({ className, children, optional, titleTooltip }: RadioGroupTitleProps) => (
  <h1
    className={cx(
      'bk',
      cl['bk-radio-group-field__title'],
      className,
    )}
  >
    {children}
    {titleTooltip && (
      <TooltipProvider tooltip={titleTooltip}>
        <Icon icon="info" className={cl['bk-radio-group-field__title__icon']}/>
      </TooltipProvider>
    )}
    {optional && (
      <small className={cl['bk-radio-group-field__title__optional']}>(Optional)</small>
    )}
  </h1>
);

export type RadioGroupFieldProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A label to be displayed after the radio button. */
  label: string,
  
  /** Additional supporting text to be displayed under the label. Optional. */
  description?: undefined | string,
  
  /** An optional title. */
  title?: undefined | string,
  
  /** An optional tooltip to be displayed on an info icon next to the title. */
  titleTooltip?: undefined | string,
  
  /** Whether to display the optional observation on title. */
  optional?: undefined | boolean,
  
  /** Whether the radio is selected by default. Passed down to Radio component. */
  defaultChecked?: undefined | boolean,
  
  /** Whether the radio is selected. Passed down to Radio component. */
  checked?: undefined | boolean,
  
  /** Whether the radio is disabled. Passed down to Radio component. */
  disabled?: undefined | boolean,
  
  /** The onChange event for the radio. Passed down to Radio component. */
  onChange?: undefined | ((event: React.FormEvent) => void),
};

/**
 * A full-fledged Radio field, with optional label, title, icon etc.
 */
export const RadioGroupField = (props: RadioGroupFieldProps) => {
  const {
    unstyled = false,
    label = '',
    description,
    title,
    optional,
    titleTooltip,
    ...propsRest
  } = props;
  
  return (
    <div
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-radio-group-field']]: !unstyled },
        propsRest.className,
      )}
    >
      {title && (
        <RadioGroupFieldTitle
          optional={optional}
          titleTooltip={titleTooltip}
        >
          {title}
        </RadioGroupFieldTitle>
      )}
      {/* biome-ignore lint/a11y/noLabelWithoutControl: the `<Radio>` will resolve to an `<input>` */}
      <label className={cl['bk-radio-group-field__label']}>
        <Radio
          checked={props.checked}
          defaultChecked={props.defaultChecked}
          disabled={props.disabled}
          onChange={props.onChange}
        />
        <span className={cl['bk-radio-group-field__label__content']}>
          {label}
        </span>
      </label>
      {description &&
        <div className={cl['bk-radio-group-field__description']}>{description}</div>
      }
    </div>
  );
};
