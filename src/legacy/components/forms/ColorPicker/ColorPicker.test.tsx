/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { vi, describe, test, beforeEach, expect } from 'vitest';

import { useState as useStateMock } from 'react';
import * as TL from '@testing-library/react';

import { ColorPicker } from './ColorPicker.tsx';

// Mock state.
vi.mock('react', async () => ({
  // Returns the actual module instead of a mock,
  // bypassing all checks on whether the module should receive 
  // a mock implementation or not.
  ...await vi.importActual('react'),
  useState: vi.fn(),
}));
const setState = vi.fn();

const defaultPreset = {
  'accentColor': '#007A8D',
  'neutralColor': '#7B5BA5',
  'brandColor': '#039ADC',
  'statusColor': '#f6a623',
};

describe('ColorPicker component', () => {
  beforeEach(() => {
    // @ts-ignore
    // Accepts a function that will be used as an implementation of the mock for one call to the mocked function. 
    // Can be chained so that multiple function calls produce different results.
    useStateMock.mockImplementation(init => [init, setState]);
    TL.cleanup();
  });
  
  test('should render multiple colors', () => {
    const handleOnChange = vi.fn();
    const { container, ...queries } = TL.render(
      <ColorPicker.Group
        colorPreset={defaultPreset}
        data-label="colorPicker"
        selectedColor="#007A8D"
        onChange={handleOnChange}
      />,
    );
    const element = queries.getByTestId('colorPicker');
    
    expect(element).toBeInstanceOf(HTMLDivElement);
    const colorPicker = queries.getAllByRole('radio');

    expect(colorPicker).toHaveLength(4);
    expect(colorPicker[0]).toHaveProperty('checked', true);
  });

  test('should be able to select other colors', () => {
    const handleOnChange = vi.fn();
    const { container, ...queries } = TL.render(
      <ColorPicker.Group
        colorPreset={defaultPreset}
        data-label="colorPicker"
        selectedColor="#007A8D"
        onChange={handleOnChange}
      />,
    );
    const element = queries.getByTestId('colorPicker');
    
    expect(element).toBeInstanceOf(HTMLDivElement);
    const colorPicker = queries.getAllByRole('radio');

    expect(colorPicker).toHaveLength(4);
    TL.fireEvent.click(colorPicker[2]);
    TL.waitFor(() => {
      expect(handleOnChange).toBeCalled();
      expect(colorPicker[2]).toHaveProperty('checked', true);
      expect(colorPicker[0]).not.toHaveProperty('checked', true);
    });
  });

  test('should render multi color picker', () => {
    const handleOnChange = vi.fn();
    const { container, ...queries } = TL.render(
      <ColorPicker.Group
        colorPreset={defaultPreset}
        data-label="colorPicker"
        selectedColor="#007A8D"
        onChange={handleOnChange}
        onCustomPickerChange={handleOnChange}
      />,
    );
    const element = queries.getByTestId('colorPicker');
    const colorInputElement = queries.getByTestId('color-picker');
    
    expect(element).toBeInstanceOf(HTMLDivElement);
    const pickerImg = element.querySelectorAll('svg');
    expect(pickerImg.length).toEqual(1);

    TL.fireEvent.input(colorInputElement, { target: { value: '#333333' } });
    TL.waitFor(() => {
      expect(handleOnChange).toBeCalled();
      const pickerImg = element.querySelectorAll('svg');
      expect(pickerImg.length).toEqual(0);
      const colorPickerRadio = queries.getAllByRole('radio');
      expect(colorPickerRadio.length).toEqual(5);
    });
  });

  test('should select multi color picker by default', async () => {
    const handleOnChange = vi.fn();
    useStateMock.mockImplementation(() => ['#000', setState]);

    const { container, ...queries } = TL.render(
      <ColorPicker.Group
        colorPreset={defaultPreset}
        data-label="colorPicker"
        selectedColor="#000"
        onChange={handleOnChange}
        onCustomPickerChange={handleOnChange}
      />,
    );
    const element = await queries.getByTestId('colorPicker');
    expect(element).toBeInstanceOf(HTMLDivElement);
    const colorPicker = queries.getAllByRole('radio');
    expect(colorPicker.length).toEqual(5);
    expect(colorPicker[4]).toHaveProperty('checked', true);
  });
});
