import * as React from 'react';
import * as TL from '@testing-library/react';

import { Accordion } from './Accordion';

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
    TL.fireEvent.click(secondAccordionItem.querySelector('.bkl-accordion-item__button'));
    expect(secondAccordionItem).toHaveClass('active');
  });
});
