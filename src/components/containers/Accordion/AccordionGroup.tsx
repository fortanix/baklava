/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { type AccordionProps, Accordion } from './Accordion.tsx';

import cl from './AccordionGroup.module.scss';


export { cl as AccordionGroupClassNames };

type AccordionGroupContext = { name?: undefined | string };
const AccordionGroupContext = React.createContext<AccordionGroupContext>({});

const AccordionWithContext = (props: AccordionProps) => {
  const context = React.use(AccordionGroupContext);
  return <Accordion name={context.name} {...props}/>;
};

export type AccordionGroupProps = React.PropsWithChildren<ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** If true, only one accordion may be open at a given time */
  exclusive?: undefined | boolean,
}>;
/**
 * A group of accordions.
 */
export const AccordionGroup = Object.assign(
  (props: AccordionGroupProps) => {
    const { unstyled = false, exclusive = true, ...propsRest } = props;
    
    const name = `bk-accordion-${React.useId()}`;
    const context: AccordionGroupContext = React.useMemo(() => {
      if (exclusive) {
        return { name };
      }
      return {};
    }, [exclusive, name]);
    
    return (
      <AccordionGroupContext.Provider value={context}>
        <div
          {...propsRest}
          className={cx({
            bk: true,
            [cl['bk-accordion-group']]: !unstyled,
          }, propsRest.className)}
        />
      </AccordionGroupContext.Provider>
    );
  },
  { Accordion: AccordionWithContext },
);
