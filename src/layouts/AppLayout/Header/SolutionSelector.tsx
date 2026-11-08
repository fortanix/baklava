/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { Icon } from '../../../components/graphics/Icon/Icon.tsx';
import { Button } from '../../../components/actions/Button/Button.tsx';
import { type ItemKey, MenuProvider } from '../../../components/overlays/MenuProvider/MenuProvider.tsx';

import cl from './SolutionSelector.module.scss';


export { cl as SolutionSelectorClassNames };

export type { ItemKey };

type PropsOmit = 'label' | 'children' | 'selected' | 'onSelect' | 'wrap';
export type SolutionSelectorProps = Omit<ComponentProps<typeof Button>, PropsOmit> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The solutions list to be shown in the dropdown menu. */
  solutions: React.ComponentProps<typeof MenuProvider>['items'],

  /** The selected solution. To access the selected solution, pass a render prop. */
  children?: undefined | ((selectedSolution: null | ItemKey) => React.ReactNode),
  
  /** The selected solution. If given, this will be a controlled component. */
  selected?: undefined | React.ComponentProps<typeof MenuProvider>['selected'],
  
  /** Callback which is called when the selected state changes. */
  onSelectedChange?: undefined | React.ComponentProps<typeof MenuProvider>['onSelectedChange'],
  
  /** Additional props to pass to the `MenuProvider`. Optional. */
  menuProviderProps?: undefined | React.ComponentProps<typeof MenuProvider>,
};
export const SolutionSelector = Object.assign(
  (props: SolutionSelectorProps) => {
    const {
      unstyled = false,
      children,
      solutions,
      selected,
      onSelectedChange,
      menuProviderProps = {},
      ...propsRest
    } = props;
    
    return (
      <MenuProvider
        label="Solution selector"
        placement="bottom-start"
        items={solutions}
        offset={12} // Compensate for header padding
        selected={selected}
        onSelectedChange={onSelectedChange}
        {...menuProviderProps}
      >
        {({ props, selectedOption }) =>
          <Button unstyled
            {...props({
              ...propsRest,
              className: cx('bk', { [cl['bk-solution-selector']]: !unstyled }, propsRest.className),
            })}
          >
            <Icon icon="solutions" className={cl['bk-solution-selector__icon']}
              decoration={{ type: 'background-circle' }}
            />
            {typeof children === 'function' ? children(selectedOption ?? null) : 'Solutions'}
            <Icon icon="caret-down" className={cl['bk-solution-selector__caret']}/>
          </Button>
        }
      </MenuProvider>
    );
  },
  {
    Option: MenuProvider.Option,
    Static: MenuProvider.Static,
    Action: MenuProvider.Action,
    Link: MenuProvider.Link,
    Segment: MenuProvider.Segment,
    Group: MenuProvider.Group,
    Footer: MenuProvider.Footer,
  },
);
