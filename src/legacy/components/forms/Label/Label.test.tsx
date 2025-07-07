/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { describe, test, beforeEach, expect } from 'vitest';

import * as TL from '@testing-library/react';

import { Label } from './Label.tsx';


describe('Label', () => {
  beforeEach(TL.cleanup);
  
  test('should render a label list', () => {
    const { container, ...queries } = TL.render(
      <Label.List
        data-label="label-list"
        labels={{ test1: '122', test2: '234' }}
      />,
    );
    const element = queries.getByTestId('label-list');
    
    expect(element).toBeInstanceOf(HTMLDivElement);
    const label = element.getElementsByClassName('bkl-label');
    expect(label.length).toEqual(2);
  });

  test('should render a label list with dark mode', () => {
    const { container, ...queries } = TL.render(
      <Label.List
        data-label="label-list"
        labels={{ test1: '122', test2: '234' }}
      />,
    );
    const element = queries.getByTestId('label-list');
    
    expect(element).toBeInstanceOf(HTMLDivElement);
    expect(element).toHaveClass('bkl-labels-list--dark');
  });

  test('should render compact label list', () => {
    const { container, ...queries } = TL.render(
      <Label.List
        data-label="label-list"
        compact
        labels={{ test1: '122', test2: '234' }}
      />,
    );
    const element = queries.getByTestId('label-list');
    
    expect(element).toBeInstanceOf(HTMLDivElement);
    expect(element).toHaveClass('bkl-labels-list--compact');
  });

  test('should render compact label list with empty value', () => {
    const { container, ...queries } = TL.render(
      <Label.List
        data-label="label-list"
        compact
        labels={{ test1: '122', test2: '' }}
      />,
    );
    const element = queries.getByTestId('label-list');
    
    expect(element).toBeInstanceOf(HTMLDivElement);
    expect(element).toHaveClass('bkl-labels-list--compact');
    const emptyLabelValue = element.getElementsByClassName('bkl-label__empty');
    expect(emptyLabelValue.length).toEqual(1);
  });

  test('should render label list with tooltip', async () => {
    const { container, ...queries } = TL.render(
      <Label.List
        data-label="label-list"
        showTooltip
        labels={{ test1: '122', test2: '234' }}
      />,
    );
    const element = queries.getByTestId('label-list');
    
    expect(element).toBeInstanceOf(HTMLDivElement);
    
    const label = element.getElementsByClassName('bkl-label')[0];
    if (typeof label === 'undefined') { throw new Error(`Could not find bkl-label element`); }
    
    TL.fireEvent.mouseOver(label);
    await TL.waitFor(() => {
      const tooltipElements = document.getElementsByClassName('bkl-tooltip__content');
      expect(tooltipElements.length).toEqual(1);
    });
  });

  test('should render label item in dark mode', () => {
    const { container, ...queries } = TL.render(
      <Label.Item
        data-label="label-item"
        labelValue="sit.smartkey.io"
      />,
    );
    const element = queries.getByTestId('label-item');
    expect(element).toBeInstanceOf(HTMLSpanElement);
    expect(element).toHaveClass('bkl-label--dark');
    expect(element).toHaveTextContent('sit.smartkey.io');
  });
});
