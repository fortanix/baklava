
import * as React from 'react';
import * as TL from '@testing-library/react';

import Checkbox from './Checkbox';


describe('Checkbox', () => {
  beforeEach(TL.cleanup);
  
  test('should render a checkbox', () => {
    const handleOnChange = jest.fn();
    const { container, ...queries } = TL.render(
      <Checkbox.Item
        data-label="checkbox"
        value="value"
        label="Option"
        onChange={handleOnChange}
      />,
    );
    const element = queries.getByTestId('checkbox');
    
    expect(element).toBeInstanceOf(HTMLLabelElement);
    expect(element).toHaveTextContent('Option');
    element.click();
    expect(handleOnChange).toHaveBeenCalledTimes(1);
    element.querySelector('input').click();
    expect(handleOnChange).toHaveBeenCalledTimes(2);
  });

  test('should render a checkbox group', () => {
    const handleOnChange = jest.fn();
    const { container, ...queries } = TL.render(
      <Checkbox.Group data-label="checkbox-group" onChange={handleOnChange}>
        <Checkbox.Item data-label="checkbox-item-1" value="value1" label="Option 1"/>
        <Checkbox.Item data-label="checkbox-item-2" value="value2" label="Option 2"/>
      </Checkbox.Group>,
    );
    const checkboxGroup = queries.getByTestId('checkbox-group');
    const checkbox1 = queries.getByTestId('checkbox-item-1');
    const checkbox2 = queries.getByTestId('checkbox-item-2');
    
    expect(checkboxGroup).toBeInstanceOf(HTMLDivElement);
    expect(checkboxGroup).toHaveTextContent('Option 1');
    expect(checkboxGroup).toHaveTextContent('Option 2');
    checkbox1.click();
    expect(handleOnChange).toHaveBeenCalledTimes(1);
    checkbox2.querySelector('input').click();
    expect(handleOnChange).toHaveBeenCalledTimes(2);
  });
});
