/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { type DisclosureProps, Disclosure } from '../Disclosure/Disclosure.tsx';

import cl from './Accordion.module.scss';


export { cl as AccordionClassNames };

type AccordionContext = { name?: undefined | string };
const AccordionContext = React.createContext<AccordionContext>({});

type AccordionItemProps = Omit<DisclosureProps, 'name'>;
const AccordionItem = (props: AccordionItemProps) => {
  const context = React.use(AccordionContext);
  return (
    <Disclosure
      {...props}
      name={context.name}
      className={cx(cl['bk-accordion__item'], props.className)}
    />
  );
};

export type AccordionProps = React.PropsWithChildren<ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** If true, only one accordion may be open at a given time */
  exclusive?: undefined | boolean,
}>;
/**
 * Accordion component: a sequence of disclosure components that can be opened individually (exclusive by default).
 */
export const Accordion = Object.assign(
  (props: AccordionProps) => {
    const { unstyled = false, exclusive = true, ...propsRest } = props;
    
    const name = `bk-accordion-${React.useId()}`;
    const context: AccordionContext = React.useMemo(() => {
      if (exclusive) {
        return { name };
      }
      return {};
    }, [exclusive, name]);
    
    return (
      <AccordionContext value={context}>
        <div
          {...propsRest}
          className={cx({
            bk: true,
            [cl['bk-accordion']]: !unstyled,
          }, propsRest.className)}
        />
      </AccordionContext>
    );
  },
  { Item: AccordionItem },
);
