/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Popper from 'react-popper';
import * as PopperJS from '@popperjs/core';
import FocusTrap from 'focus-trap-react';

import { useOutsideClickHandler } from '../../../util/hooks/useOutsideClickHandler.ts';
import { classNames as cx, ClassNameArgument, type ComponentProps } from '../../../util/component_util.tsx';
import { handleOptionKeyDown, handleTriggerKeyDown } from '../../../util/keyboardHandlers.tsx';

import { Button } from '../../buttons/Button.tsx';
import { Checkbox } from '../../../components/forms/Checkbox/Checkbox.tsx';

import './Dropdown.scss';


export type DropdownDividerProps = ComponentProps<'div'>;

export const Divider = (props: DropdownDividerProps) => {
  const { className = '' } = props;
  
  return (
    <div className={cx('bkl-dropdown__menu-divider', className)} />
  );
};

// Check component has Dropdown.Item
const hasItemComponent = (children: React.ReactNode): boolean => {
  let found = false;

  const checkComponent = (node: React.ReactNode) => {
    if (found) return;

    if (typeof node === 'function') {
      const result = node({ close: () => {} });
      checkComponent(result);
      return;
    }
    
    if (Array.isArray(node)) {
      node.forEach(checkComponent);
      return;
    }
    
    if (!React.isValidElement(node)) return;
    
    if (node.type === Dropdown.Item) {
      found = true;
      return;
    }
    
    if (node.props?.children) {
      checkComponent(node.props.children);
    }
  };
  
  checkComponent(children);
  return found;
};

type DropdownItemType = 'button' | 'checkbox' | 'text';
export type DropdownItemProps<T> = Omit<ComponentProps<'input' | 'button' | 'li' >, 'value'> & {
  type: DropdownItemType,
  disabled?: undefined | boolean,
  onActivate?: undefined | ((value?: undefined | T) => void),
  onClose?: undefined | (() => void),
  onClick?: undefined | (() => void),
  onChange?: undefined | (() => void),
  value?: undefined | T,
  isSelected?: undefined | boolean,
  checked?: undefined | boolean,
  optionIndex: number,
};
type ItemRefs = {
  optionsRef: React.Ref<HTMLElement>,
  triggerRef: React.Ref<HTMLElement>,
};
export type ItemWithForwardRef = <T>(
  props: DropdownItemProps<T>,
  ref?: ItemRefs,
) => ReturnType<React.FC<DropdownItemProps<T>>>;
export const Item: ItemWithForwardRef = React.forwardRef((props, ref) => {
  const {
    type,
    children,
    className = '',
    disabled = false,
    onActivate,
    onClose,
    onClick,
    onChange,
    value,
    isSelected = false,
    optionIndex,
    checked = false,
    ...propsRest
  } = props;
  const { optionsRef, triggerRef } = ref || {};
  
  const handleClose = () => {
    if (onClose && !disabled) {
      onClose();
    }
  };
  
  if (type === 'checkbox') {
    return (
      <li role="presentation">
        <Checkbox.Item
          id={value}
          ref={(el) => {
            if (ref) {
              optionsRef.current[optionIndex] = el;
            }
          }}
          role="option"
          disabled={disabled}
          checked={checked}
          tabIndex={checked ? 0 : -1}
          className={cx(
            'bkl-dropdown__menu-item', className, { 'bkl-dropdown__menu-item--disabled': disabled },
          )}
          onChange={onChange}
          onKeyDown={(evt) => {
            handleOptionKeyDown({
              evt,
              index: optionIndex,
              options: optionsRef.current,
              triggerElement: triggerRef.current,
              onClose: handleClose,
            });
          }}
          {...propsRest}
        >
          {children}
        </Checkbox.Item>
      </li>
    );
  }
  
  if (type === 'button' || onActivate || onClick) {
    const handleClick = () => {
      if (onActivate) {
        onActivate(value);
      }
      
      if (onClick) {
        onClick();
      }
      
      handleClose();
    };
    
    return (
      <li role="presentation">
        <Button
          plain
          id={value}
          ref={(el) => {
            if (ref) {
              optionsRef.current[optionIndex] = el;
            }
          }}
          role="option"
          aria-selected={isSelected}
          disabled={disabled}
          tabIndex={isSelected ? 0 : -1}
          className={cx(
            'bkl-dropdown__menu-item', className, { 'bkl-dropdown__menu-item--disabled': disabled },
          )}
          onClick={handleClick}
          onKeyDown={(evt) => {
            handleOptionKeyDown({
              evt,
              index: optionIndex,
              options: optionsRef.current,
              triggerElement: triggerRef.current,
              onSelect: handleClick,
              onClose: handleClose,
            });
          }}
          {...propsRest}
        >
          {children}
        </Button>
      </li>
    );
  }
  
  const onKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key === 'Escape') {
      handleClose();
    }
  };
  
  return (
    <li
      id={value}
      ref={(el) => {
        if (ref) {
          optionsRef.current[optionIndex] = el;
        }
      }}
      role="presentation"
      aria-selected={isSelected}
      aria-disabled={disabled}
      className={cx(
        'bkl-dropdown__menu-item', className, { 'bkl-dropdown__menu-item--disabled': disabled },
      )}
      onKeyDown={onKeyDown}
      {...propsRest}
    >
      {children}
    </li>
  );
});

export type PopperOptions = Partial<PopperJS.Options> & {
  createPopper?: typeof PopperJS.createPopper;
};

export type DropdownProps = Omit<ComponentProps<'div'>, 'className'|'children'> & {
  children: React.ReactNode | ((props: { close: () => void }) => React.ReactNode),
  toggle: React.ReactElement,
  active?: boolean,
  className?: ClassNameArgument,
  withArrow?: boolean,
  primary?: boolean,
  secondary?: boolean,
  basic?: boolean,
  placement?: PopperOptions['placement'],
  offset?: [number, number],
  popperOptions?: PopperOptions,
  onClose?: () => void,
  label?: string,
  isFocusTrapActive?: boolean,
};

export const Dropdown = Object.assign(
    (props: DropdownProps) => {
    const {
      active = false,
      className = '',
      withArrow = false,
      primary = false,
      secondary = false,
      basic = false,
      children = '',
      toggle: Toggle,
      placement = 'bottom',
      offset = [],
      popperOptions = {},
      onClose: onDropdownClose,
      label,
      isFocusTrapActive,
    } = props;
    
    const optionsRef = React.useRef<HTMLButtonElement[]>([]);
    const [isActive, setIsActive] = React.useState(false);
    const [referenceElement, setReferenceElement] = React.useState<HTMLElement | null>(null);
    const [popperElement, setPopperElement] = React.useState<HTMLElement | null>(null);
    const [arrowElement, setArrowElement] = React.useState<HTMLElement | null>(null);
    const popper = Popper.usePopper(referenceElement, popperElement, {
      modifiers: [
        { name: 'arrow', options: { element: arrowElement } },
        { name: 'preventOverflow', enabled: true },
        { name: 'offset', options: { offset } },
        ...(popperOptions.modifiers || []),
      ],
      placement,
    });
    
    const onReferenceClick = () => {
      setIsActive(isActive => !isActive);
      typeof Toggle?.props?.onClick === 'function' && Toggle?.props?.onClick();
    };
    
    const onClose = () => {
      setIsActive(false);
      typeof onDropdownClose === 'function' && onDropdownClose();
    };
    
    const dropdownRef = { current: popperElement };
    const triggerRef = { current: referenceElement };
    useOutsideClickHandler([dropdownRef, triggerRef], onClose);
    
    const isDropdownActive = isActive || active;
    
    const renderDropdownItems = () => {
      const renderChildren = typeof children === 'function' ? children({ close: onClose }) : children;
      const dropdownChildren = renderChildren.type === React.Fragment
        ? renderChildren.props.children
        : renderChildren;
      
      return React.Children.map(dropdownChildren, (child: React.ReactElement, index: number) => {
        const { onActivate: childOnActivate, onClose: childOnClose } = child?.props || {};
        
        return child?.type !== Item
          ? child
          : React.cloneElement(child, {
            ...childOnActivate
              ? { onActivate: (value: string | number) => childOnActivate(value) }
              : {},
            onClose: childOnClose ?? onClose,
            ref: { optionsRef, triggerRef },
            optionIndex: index,
          });
      });
    };
    
    const renderDropdown = () => {
      return (
        <FocusTrap
          // NOTE: due to test failure, add 'displayCheck' option
          // https://github.com/focus-trap/focus-trap-react?tab=readme-ov-file#testing-in-jsdom
          focusTrapOptions={{
            tabbableOptions: {
              displayCheck: 'none',
            },
            // Receives focus if no other tabbable element found
            fallbackFocus: <div tabIndex={-1} />,
          }}
          // Use FocusTrap when dropdown does not have Item component like YearMonthPicker for keyboard accessibility
          active={isFocusTrapActive ?? !hasItemComponent(children)}
        >
          <div
            id="bkl-dropdown" // FIXME: this is a non-unique ID (but one of the downstream tests relies on it)
            className={cx('bkl-dropdown', className, {
              'bkl-dropdown--primary': primary,
              'bkl-dropdown--secondary': secondary,
              'bkl-dropdown--basic': basic,
              'bkl-dropdown--with-arrow': withArrow,
            })}
            role="listbox"
            ref={setPopperElement}
            style={popper.styles.popper}
            {...popper.attributes.popper}
          >
            <ul className="bkl-dropdown__menu" aria-label={label}>
              {renderDropdownItems()}
            </ul>
            {withArrow && <div className="bkl-dropdown__arrow" ref={setArrowElement} style={popper.styles.arrow}/>}
          </div>
        </FocusTrap>
      );
    };
    
    return (
      <>
        {React.cloneElement(Toggle, {
          ref: setReferenceElement,
          onClick: onReferenceClick,
          onKeyDown: (evt) => handleTriggerKeyDown({
            evt,
            options: optionsRef?.current,
            onOpen: onReferenceClick,
            onClose,
          }),
          role: 'combobox',
          'aria-haspopup': 'listbox',
          'aria-expanded': isDropdownActive,
          'aria-controls': 'bkl-dropdown',
        })}
        {isDropdownActive && ReactDOM.createPortal(renderDropdown(), document.body)}
      </>
    );
  },
  {
    Item,
    Divider,
  },
);
