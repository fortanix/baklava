/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import { Icon } from '../../../graphics/Icon/Icon.tsx';
import { TooltipProvider } from '../../../overlays/Tooltip/TooltipProvider.tsx';
import { useFormContext } from '../../context/Form/Form.tsx';
import { Input as InputDefault } from '../../controls/Input/Input.tsx';

import cl from './InputField.module.scss';


export { cl as InputFieldClassNames };

type InputFieldInputProps = Omit<React.ComponentProps<typeof InputDefault>, 'ref'>;

export type InputFieldProps = InputFieldInputProps & {
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
  
  /** Props for the container element. */
  containerProps?: undefined | ComponentProps<'div'>,
  
  /** A custom `Input` element. */
  Input?: undefined | React.ComponentType<InputFieldInputProps>,
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
    containerProps = {},
    Input = InputDefault,
    ...inputProps
  } = props;
  
  const controlId = `input-field-${React.useId()}`;
  const formContext = useFormContext();
  
  return (
    <div
      {...containerProps}
      className={cx(
        'bk',
        { [cl['bk-input-field']]: !unstyled },
        containerProps.className,
      )}
    >
      {label &&
        <label
          {...labelProps}
          htmlFor={controlId}
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
        form={formContext.formId}
        {...inputProps}
        inputProps={{
          ...inputProps.inputProps,
          id: controlId,
        }}
        className={cx(cl['bk-input-field__control'], inputProps.className)}
      />
      {description &&
        <div className={cl['bk-input-field__description']}>{description}</div>
      }
    </div>
  );
};
