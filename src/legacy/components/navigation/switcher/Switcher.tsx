
import * as React from 'react';

import { classNames as cx, ComponentPropsWithRef } from '../../../util/component_util';
import { handleTabKeyDown } from '../../../util/keyboardHandlers';

import { Button } from '../../buttons/Button';

import './Switcher.scss';

export type SwitcherOptionKey = string;

type SwitcherButtonProps = ComponentPropsWithRef<'button'> & {
  switcherIndex: number,
  optionKey: SwitcherOptionKey,
  children: React.ReactNode,
  active: boolean,
  onSelect: () => void,
  switchersRef: HTMLButtonElement | null[],
  tabIndex?: number,
};

const SwitcherButton = React.forwardRef<HTMLButtonElement, SwitcherButtonProps>((props, ref) => {
  const {
    className,
    optionKey,
    children,
    active,
    onSelect,
    onClick,
    disabled = false,
    switchersRef,
    switcherIndex,
    tabIndex,
    ...propsRest
  } = props;

  return (
    <Button
      plain
      role="radio"
      tabIndex={tabIndex ?? (active ? 0 : -1)}
      {...propsRest}
      disabled={disabled}
      aria-selected={active}
      ref={el => (switchersRef.current[switcherIndex] = ref || el)}
      className={cx('bkl-switcher-button', className, { 'active': active, 'disabled': disabled })}
      onClick={evt => {
        onSelect();
        if (onClick) {
          onClick(evt);
        }
      }}
      onKeyDown={(evt: React.KeyboardEvent<HTMLButtonElement>) => {
        handleTabKeyDown({
          evt,
          index: switcherIndex,
          tabs: switchersRef.current,
        });
      }}
    >
      {children}
    </Button>
  );
});

export type SwitcherButtonsProps<O extends SwitcherOptionKey> = Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> & {
  children: React.ReactNode,
  selected: O,
  onChange: (optionKey: O) => void,
};

export const SwitcherButtons = <O extends SwitcherOptionKey>(props: SwitcherButtonsProps<O>) => {
  const { children, selected, onChange, ...propsRest } = props;
  const switchersRef = React.useRef<HTMLButtonElement[]>([]);

  const buttons = React.Children.map(children, button => {
    const optionKey = button.props.optionKey;
    return React.cloneElement(button, {
      switcherIndex: children.findIndex(child => child.props.optionKey === optionKey),
      active: optionKey === selected,
      onSelect: () => { onChange(optionKey); },
      switchersRef,
    });
  });

  return (
    <div {...propsRest} role="radiogroup" className={cx('switcher-buttons', props.className)}>
      {buttons}
    </div>
  );
};

SwitcherButtons.Button = SwitcherButton as React.FC<Omit<SwitcherButtonProps, 'active' | 'onSelect'>>;
