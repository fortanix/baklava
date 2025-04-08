/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import { useFormContext } from '../../context/Form/Form.tsx';
import { Input } from '../../controls/Input/Input.tsx';
import { TooltipProvider } from '../../../overlays/Tooltip/TooltipProvider.tsx';
import { Icon } from '../../../graphics/Icon/Icon.tsx';

import cl from './InputField.module.scss';


export { cl as InputFieldClassNames };

export type InputFieldProps = Omit<ComponentProps<'input'>, 'value'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** Label for the input. */
  label?: undefined | React.ReactNode,

  /** Props for the `<label>` element, if `label` is defined. */
  labelProps?: undefined | ComponentProps<'label'>,

  /** An optional tooltip to be displayed on an info icon next to the label. */
  labelTooltip?: undefined | string,

  /** Whether to display the optional observation on the label. */
  labelOptional?: undefined | boolean,

  /** Additional optional supporting text to be displayed under the input. */
  description?: undefined | string,

  /** Props for the wrapper element. */
  wrapperProps?: undefined | ComponentProps<'div'>,
};
/**
 * Input field.
 */
export const InputField = (props: InputFieldProps) => {
  const {
    unstyled = false,
    label,
    labelTooltip,
    labelOptional,
    labelProps = {},
    description,
    wrapperProps = {},
    ...inputProps
  } = props;

  const controlId = React.useId();
  const formContext = useFormContext();

  return (
    <div
      {...wrapperProps}
      className={cx(
        'bk',
        { [cl['bk-input-field']]: !unstyled },
        wrapperProps.className,
      )}
    >
      {label &&
        <label
          htmlFor={controlId}
          {...labelProps}
          className={cx(cl['bk-input-field__label'], labelProps.className)}
        >
          {label}
          {labelTooltip &&
            <TooltipProvider tooltip={labelTooltip}>
              <Icon icon="info" className={cl['bk-input-field__label__icon']}/>
            </TooltipProvider>
          }
          {labelOptional &&
            <small className={cl['bk-input-field__label__optional']}>(Optional)</small>
          }
        </label>
      }
      <Input
        {...inputProps}
        id={controlId}
        form={formContext.formId}
        className={cx(cl['bk-input-field__control'], inputProps.className)}
      />
      {description &&
        <div className={cl['bk-input-field__description']}>{description}</div>
      }
    </div>
  );
};
