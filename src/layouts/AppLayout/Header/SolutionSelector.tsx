/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { Icon } from '../../../components/graphics/Icon/Icon.tsx';
import { Button } from '../../../components/actions/Button/Button.tsx';
import {
  type ItemDetails,
  DropdownMenuProvider,
} from '../../../components/overlays/DropdownMenu/DropdownMenuProvider.tsx';

import cl from './SolutionSelector.module.scss';


export { cl as SolutionSelectorClassNames };

export type SolutionSelectorProps = Omit<ComponentProps<typeof Button>, 'label'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The solutions list to be shown in the dropdown menu. */
  solutions: React.ReactNode,

  /** The selected solution. To access the selected solution, pass a render prop. */
  children?: undefined | ((selectedAccount: null | ItemDetails) => React.ReactNode),
};
export const SolutionSelector = Object.assign(
  (props: SolutionSelectorProps) => {
    const { unstyled = false, solutions, children, ...propsRest } = props;
    
    return (
      <DropdownMenuProvider
        label="Solution selector"
        placement="bottom-start"
        items={solutions}
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
            {typeof children === 'function' ? children(selectedOption ?? null) : <>Solutions</>}
            <Icon icon="caret-down" className={cl['bk-solution-selector__caret']}/>
          </Button>
        }
      </DropdownMenuProvider>
    );
  },
  {
    Header: DropdownMenuProvider.Header,
    Option: DropdownMenuProvider.Option,
    Action: DropdownMenuProvider.Action,
    FooterActions: DropdownMenuProvider.FooterActions,
  },
);
