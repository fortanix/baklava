
import { isPromise } from '../../util/types.ts';

import * as React from 'react';
import { classNames as cx, ComponentProps } from '../../util/component_util.tsx';

import './Button.scss';


type ButtonProps = Omit<ComponentProps<'button'>, 'onClick'> & {
  renderAs?: undefined | string | React.ComponentType<React.ComponentProps<'button'>>,
  children: React.ReactNode,
  disabled?: undefined | boolean,
  unstyled?: undefined | boolean, // Render without any styling
  plain?: undefined | boolean, // Render without any default styling
  primary?: undefined | boolean,
  light?: undefined | boolean,
  large?: undefined | boolean,
  block?: undefined | boolean,
  label?: undefined | string,
  onClick?: undefined | ((event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>),
};
/**
 * Standard button component.
 */
export const Button = (props: ButtonProps) => {
  const {
    renderAs = 'button', // Duplicated with `defaultProps`, because TS doesn't read `defaultProps`
    children,
    className,
    disabled,
    block,
    unstyled,
    plain,
    primary,
    large,
    light,
    label,
    onClick,
    ...propsRest
  } = props;
  
  const [isDisabled, setIsDisabled] = React.useState(false);
  
  const handleClick = async (evt: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    if (!onClick) {
      return;
    }
    
    evt.preventDefault();
    
    if (isDisabled) {
      return;
    }
    
    const result = onClick(evt);
    
    if (isPromise(result)) {
      setIsDisabled(true);
      
      try {
        await result;
      } catch (error: unknown) {
        // Ignore
      } finally {
        setIsDisabled(false);
      }
    }
  };
  
  const CustomTag = renderAs;
  
  const buttonProps: React.ComponentPropsWithoutRef<'button'> = CustomTag !== 'button' ? {} : {
    type: 'button', // Prevent type="submit" behavior
  };
  
  // If both children and label are specified, use the `label` as the accessible name by default
  const accessibleName = typeof children !== 'undefined' && label ? label : undefined;
  
  return (
    <CustomTag
      aria-label={accessibleName}
      disabled={disabled || isDisabled}
      onClick={handleClick}
      className={cx(
        'bkl',
        {
          'bkl-button': !unstyled,
          'bkl-button--plain': plain,
          'bkl-button--primary': primary,
          'bkl-button--large': large,
          'bkl-button--block': block,
          'bkl-button--light': light,
        },
        className,
      )}
      {...buttonProps}
      {...propsRest}
    >
      {children}
    </CustomTag>
  );
};
Button.defaultProps = {
  renderAs: 'button',
  plain: false,
  primary: false,
  light: false,
  large: false,
  block: false,
  disabled: false,
};
