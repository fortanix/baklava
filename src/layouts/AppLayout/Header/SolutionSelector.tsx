/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { Icon } from '../../../components/graphics/Icon/Icon.tsx';
import { Button } from '../../../components/actions/Button/Button.tsx';
import { DropdownMenuProvider } from '../../../components/overlays/DropdownMenu/DropdownMenuProvider.tsx';

import cl from './SolutionSelector.module.scss';


export { cl as SolutionSelectorClassNames };

const SolutionSelectorOption = (props: React.ComponentProps<typeof DropdownMenuProvider.Option>) => {
  return <DropdownMenuProvider.Option {...props}/>;
};

export type SolutionSelectorProps = Omit<ComponentProps<typeof Button>, 'label'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
};
export const SolutionSelector = Object.assign(
  (props: SolutionSelectorProps) => {
    const { unstyled = false, children, ...propsRest } = props;
    
    return (
      <DropdownMenuProvider
        label="Solution selector"
        placement="bottom-start"
        items={children}
      >
        {({ props }) =>
          <Button unstyled
            {...props({
              ...propsRest,
              className: cx('bk', { [cl['bk-solution-selector']]: !unstyled }, propsRest.className),
            })}
          >
            <Icon icon="solutions" className={cl['bk-solution-selector__icon']}
              decoration={{ type: 'background-circle' }}
            />
            Solutions
            <Icon icon="caret-down" className={cl['bk-solution-selector__caret']}/>
          </Button>
        }
      </DropdownMenuProvider>
    );
  },
  {
    Option: SolutionSelectorOption,
  },
);
