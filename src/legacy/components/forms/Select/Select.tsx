/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { createPortal } from 'react-dom';
import * as Popper from 'react-popper';
import * as PopperJS from '@popperjs/core';

import { classNames as cx, type ComponentProps } from '../../../util/component_util.tsx';
import { useOutsideClickHandler } from '../../../util/hooks/useOutsideClickHandler.ts';
import { useCombinedRefs } from '../../../util/hooks/useCombinedRefs.ts';
import { findFirstFocusableIndex, handleOptionKeyDown, handleTriggerKeyDown } from '../../../util/keyboardHandlers.tsx';

import { useScroller } from '../../util/Scroller.tsx';
import { Button } from '../../buttons/Button.tsx';

import './Select.scss';


export type PopperOptions = Partial<PopperJS.Options> & {
  createPopper?: typeof PopperJS.createPopper,
};

export type SelectOption = {
  label: React.ReactNode,
  disabled?: undefined | boolean,
};

export type SelectProps = Omit<ComponentProps<'div'>, 'onSelect'> & {
  onSelect: (value: string) => void,
  options: { [key: string]: SelectOption },
  value?: undefined | string,
  disabled?: undefined | boolean,
  defaultOption?: undefined | SelectOption,
  placeholder?: undefined | string,
  ariaLabel?: undefined | string,
  placement?: undefined | PopperOptions['placement'],
  offset?: undefined | [number, number],
  popperOptions?: undefined | PopperOptions,
  dropdownReference?: undefined | React.RefObject<HTMLUListElement>,
};
export const Select = (props: SelectProps) => {
  const {
    onSelect,
    options,
    className = '',
    value = '',
    disabled = false,
    defaultOption = { label: '' },
    placeholder = 'Select',
    ariaLabel,
    placement = 'bottom',
    offset = [],
    popperOptions = {},
    dropdownReference = null,
    ...propsRest
  } = props;
  
  const scrollerProps = useScroller();
  const optionsRef = React.useRef<Array<HTMLButtonElement>>([]);
  const [isActive, setIsActive] = React.useState(false);
  const [isOptionSelected, setIsOptionSelected] = React.useState(false);
  const [referenceElement, setReferenceElement] = React.useState<null | HTMLElement>(null);
  const [popperElement, setPopperElement] = React.useState<null | HTMLElement>(null);
  
  const widthModifiers = React.useMemo(() => [
    {
      name: 'width',
      enabled: true,
      fn: ({ state }: { state: PopperJS.State }) => {
        state.styles.popper.width = `${state.rects.reference.width}px`;
      },
      effect: ({ state }: { state: PopperJS.State }) => {
        state.elements.popper.style.width = `${state.elements.reference.offsetWidth}px`;
      },
      phase: 'beforeWrite',
      requires: ['computeStyles'],
    },
  ], []);
  
  const popper = Popper.usePopper(referenceElement, popperElement, {
    modifiers: [
      { name: 'preventOverflow', enabled: true },
      { name: 'offset', options: offset },
      ...(widthModifiers || []),
      ...(popperOptions.modifiers || []),
    ],
    placement,
  });
  
  const dropdownRef = { current: popperElement };
  const toggleRef = { current: referenceElement };
  const combinedRef = useCombinedRefs(setPopperElement, dropdownReference);
  
  useOutsideClickHandler([dropdownRef, toggleRef], () => {
    setIsActive(false);
  });
  
  // Scroll to selected item when select item is opened
  React.useEffect(() => {
    if (isActive && optionsRef.current.length > 0) {
      const selectedItem = optionsRef.current.find(item => item?.getAttribute('aria-selected') === 'true');
      setTimeout(() => selectedItem?.scrollIntoView({ block: 'nearest' }), 0);
    }
  }, [isActive]);
  
  const onContainerClick = () => {
    if (!disabled) {
      setIsActive(active => !active);
    }
  };
  
  const onOptionClick = (selectedKey: string) => {
    onSelect(selectedKey);
    setIsActive(false);
    setIsOptionSelected(true);
  };
  
  const renderOptions = () => {
    return Object.entries(options).map(([key, { label, disabled: optionDisabled }], index) =>
      <li key={key} role="presentation">
        <Button
          plain
          id={key}
          ref={el => {
            if (optionsRef.current && el) {
              optionsRef.current[index] = el;
            }
          }}
          // biome-ignore lint/a11y/useSemanticElements: Cannot use `<option>`
          role="option"
          aria-selected={value === key}
          disabled={optionDisabled}
          tabIndex={value === key ? 0 : -1}
          className={cx(
            'bkl',
            'bkl-select__option',
            {
              'bkl-select__option--default': typeof label === 'string',
              'bkl-select__option--disabled': optionDisabled,
            },
          )}
          data-label="bkl-select-option"
          onClick={() => {
            if (!optionDisabled) {
              onOptionClick(key);
            }
          }}
          onKeyDown={evt => {
            handleOptionKeyDown({
              evt,
              index,
              options: optionsRef.current,
              triggerElement: referenceElement,
              onSelect: () => onOptionClick(key),
              onClose: () => setIsActive(false),
            });
          }}
        >
          {label}
        </Button>
      </li>);
  };

  const renderDropdown = () => {
    return (
      <ul
        ref={combinedRef}
        id="select-listbox"
        // biome-ignore lint/a11y/useSemanticElements: Cannot use `<select>`
        // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: Cannot use `<select>`
        role="listbox"
        className={cx('bkl bkl-select__dropdown', scrollerProps.className)}
        style={popper.styles.popper}
        {...popper.attributes.popper}
      >
        {defaultOption.label &&
          <li key={defaultOption.label} role="presentation">
            <Button
              plain
              // biome-ignore lint/a11y/useSemanticElements: Cannot use `<option>`
              role="option"
              className={cx(
                'bkl-select__option',
                'bkl-select__option--disabled',
                {
                  'bkl-select__option--default': typeof defaultOption.label === 'string',
                },
              )}
              onKeyDown={(evt: React.KeyboardEvent) => {
                if (evt.key === 'Escape') {
                  setIsActive(false);
                }
              }}
            >
              {defaultOption.label}
            </Button>
          </li>
        }
        {renderOptions()}
      </ul>
    );
  };

  const formatSelected = (key: string) => {
    if (key === '') {
      return placeholder;
    }
    
    if (!Object.hasOwn(options, key)) {
      console.error(`Invalid key: ${key}`);
      return '(Unknown)';
    }
    
    const label = options[key].label;
    if (typeof label === 'string' || typeof label === 'number') {
      return String(label);
    }
    
    return key;
  };
  
  return (
    <div {...propsRest} className={cx('bkl-select', className)}>
      <Button
        plain
        className="bkl-select__container"
        aria-haspopup="listbox"
        aria-expanded={isActive}
        aria-controls="select-listbox"
        aria-activedescendant={value}
        // biome-ignore lint/a11y/useSemanticElements: Cannot use `<select>`
        role="combobox"
        onClick={onContainerClick}
        ref={setReferenceElement}
        onKeyDown={evt => {
          handleTriggerKeyDown({
            evt,
            options: optionsRef?.current,
            onOpen: () => setIsActive(true),
            onClose: () => setIsActive(false),
          });
        }}
      >
        <i // FIXME: replace with <Icon/>
          className={cx(
            'bkl-select__caret bkl-caret bkl-caret--down', { 'bkl-select__caret--disabled': disabled },
          )}
        />
        <input
          type="text"
          className={cx(
            'bkl-select__input', {
              'bkl-select__input--changed': isOptionSelected || value,
              'bkl-select__input--disabled': disabled,
              'bkl-select__input--active': isActive,
            },
          )}
          placeholder={placeholder}
          readOnly
          tabIndex={-1}
          value={formatSelected(value)}
          disabled={disabled}
          aria-label={ariaLabel}
        />
      </Button>
      {isActive && createPortal(renderDropdown(), document.body)}
    </div>
  );
};
