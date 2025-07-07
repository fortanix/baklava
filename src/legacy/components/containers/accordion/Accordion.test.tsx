/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { describe, test, expect, beforeEach } from 'vitest';
import * as TL from '@testing-library/react';

import { Accordion } from './Accordion.tsx';

const accordionItems = [
  {
    title: 'First Accordion Title',
    content: 'First Accordion Content',
    openByDefault: true,
  },
  {
    title: 'Second Accordion Title',
    content: 'Second Accordion Content',
  },
];

describe('Accordion', () => {
  beforeEach(TL.cleanup);
  
  test('should render accordion with the first accordion item open', () => {
    const { container, ...queries } = TL.render(
      <Accordion
        data-label="accordion"
        items={accordionItems}
      />,
    );
    
    const element = queries.getByTestId('accordion');
    expect(element).toBeInstanceOf(HTMLUListElement);
    const firstAccordionItem = element.querySelector('[data-accordion-item="accordion-item-0"]');
    expect(firstAccordionItem).toHaveClass('active');
  });
  
  test('should switch accordion when clicking on an accordion item', () => {
    const { container, ...queries } = TL.render(
      <Accordion
        data-label="accordion"
        items={accordionItems}
      />,
    );
    
    const element = queries.getByTestId('accordion');
    const secondAccordionItem = element.querySelector('[data-accordion-item="accordion-item-1"]');
    const secondAccordionItemButton = secondAccordionItem?.querySelector('.bkl-accordion-item__button');
    
    if (!secondAccordionItem || !secondAccordionItemButton) { throw new Error(`Could not locate element`); }
    
    TL.fireEvent.click(secondAccordionItemButton);
    expect(secondAccordionItem).toHaveClass('active');
  });
});
