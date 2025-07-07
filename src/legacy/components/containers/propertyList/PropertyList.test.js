import * as React from 'react';
import * as TL from '@testing-library/react';

import { PropertyList } from './PropertyList';

describe('PropertyList', () => {
  beforeEach(TL.cleanup);

  test('should render a property list', () => {
    const { container, ...queries } = TL.render(
      <PropertyList>
        <PropertyList.Property
          label="label-test"
          value="value-test"
        />
      </PropertyList>
    );
    const element = queries.getByTestId('bkl-property-list');

    expect(element).toBeInstanceOf(HTMLDListElement);
    expect(element.querySelector('dt')).toHaveTextContent('label-test');
    expect(element.querySelector('dd')).toHaveTextContent('value-test');
  });

  test('should accept a custom class name', () => {
    const { container, ...queries } = TL.render(
      <PropertyList>
        <PropertyList.Property
          label="label-test"
          value="value-test"
          data-label="property-list-property"
          className="foo"
        />
      </PropertyList>
    );

    const element = queries.getByTestId('property-list-property');
    expect(element).toHaveClass('bkl-property-list__property foo');
  });
});
