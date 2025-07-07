
import * as React from 'react';
import { BaklavaIcon } from '../../icons/icon-pack-baklava/BaklavaIcon';

import { classNames as cx, ComponentPropsWithoutRef } from '../../../util/component_util';

import { Button } from '../../buttons/Button';

import './Input.scss';


export type InputProps = ComponentPropsWithoutRef<'input'> & {
  toggleVisibility?: boolean, // Whether to display a toggle to show/hide the content (e.g. for password fields)
};
export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    className = '',
    toggleVisibility = false,
    type = 'text',
    ...restProps
  } = props;
  
  const [isTextVisible, setIsTextVisible] = React.useState(!toggleVisibility);
  
  const toggleSecretVisible = () => {
    setIsTextVisible(!isTextVisible);
  };

  return (
    <div className={cx('bkl-input', className)}>
      <input
        ref={ref}
        type={isTextVisible ? type : 'password'}
        {...restProps}
        className={cx('bkl-input__input', {
          'bkl-input__input--toggle-visibility': toggleVisibility,
        })}
      />
      {toggleVisibility &&
        <Button
          plain
          onClick={toggleSecretVisible}
          className="bkl-input__input--toggle-visibility-button"
          aria-label="Toggle input visibility"
        >
          <BaklavaIcon
            className="password-toggle-icon"
            icon={isTextVisible ? 'eye' : 'eye-closed'}
          />
        </Button>
      }
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
