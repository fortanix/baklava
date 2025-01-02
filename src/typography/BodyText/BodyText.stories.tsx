/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../../components/actions/Button/Button.tsx';
import { Panel } from '../../components/containers/Panel/Panel.tsx';
import { SegmentedControl } from '../../components/forms/controls/SegmentedControl/SegmentedControl.tsx';

import { BodyText } from './BodyText.tsx';


type BodyTextArgs = React.ComponentProps<typeof BodyText>;
type Story = StoryObj<typeof BodyText>;

export default {
  component: BodyText,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
  render: (args) => <BodyText {...args}/>,
} satisfies Meta<BodyTextArgs>;


const SampleBodyText = () => {
  const id = React.useId();
  return (
    <>
      <h1>Example of body text</h1>
      <h2>Example of body text</h2>
      <p>
        Lorem ipsum dolor sit amet, <a href="/" onClick={event => { event.preventDefault(); }}>consectetur</a> adipiscing elit. Pellentesque eget sem ut neque lobortis pharetra nec vel quam. Etiam sem neque, gravida sed pharetra ut, vehicula quis lectus. Donec ac rhoncus purus. Proin ultricies augue vitae purus feugiat, in ultrices lorem aliquet. Donec eleifend ac dolor a auctor. Cras ac suscipit nibh. Fusce tincidunt iaculis dapibus. Vivamus sit amet neque eu velit tincidunt semper. Donec at magna aliquam mi consectetur imperdiet. Donec pretium placerat quam, in sodales purus porta vitae. Phasellus nisl justo, luctus vel mi vel, sollicitudin euismod neque.
      </p>
      <p>
        Duis mollis, justo vel pretium luctus, risus sem eleifend lectus, ac convallis dolor nibh id sapien. Donec vestibulum tellus non rutrum convallis. Aenean venenatis enim in egestas lobortis. Donec mollis elit in turpis imperdiet congue vel at magna. Vestibulum bibendum, ipsum quis lobortis lobortis, lorem libero mollis sapien, sed tempus lacus nibh a nunc. Vivamus sed sem eleifend, rutrum erat eget, ultricies neque. Morbi condimentum dolor vel ipsum consectetur iaculis. Donec ornare diam at orci luctus, sed placerat quam dictum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur condimentum molestie augue. Ut vel nisl a augue ornare volutpat. Phasellus et enim in mi maximus ultricies. Integer dignissim ipsum mauris, id bibendum eros euismod et.
      </p>
      <p>An unordered list:</p>
      <ul>
        <li>List item 1</li>
        <li>List item 2</li>
        <li> Nested list:
          <ol>
            <li>Nested list item 1</li>
            <li>Nested list item 2</li>
          </ol>
        </li>
      </ul>
      <p>An ordered list:</p>
      <ol>
        <li>List item 1</li>
        <li>List item 2</li>
        <li> Nested list:
          <ul>
            <li>Nested list item 1</li>
            <li>Nested list item 2</li>
          </ul>
        </li>
      </ol>
      <hr/>
      <h2>Forms</h2>
      
      <form>
        <fieldset>
          <legend>Test</legend>
          
          <label htmlFor={`${id}-input-1`}>Text input:</label>
          <input id={`${id}-input-1`} type="text"/>
        </fieldset>
      </form>
    </>
  );
};

export const Standard: Story = {
  args: {
    children: <SampleBodyText/>,
  },
};

export const WithComponents: Story = {
  args: {
    children: (
      <>
        <h1>Body text with embedded components</h1>
        <p>
          Body text can include Baklava components. Those components should not be affected by any styling inherited
          from the body text styling.
        </p>
        <p>Here is a button component:</p>
        <Button variant="primary" label="Button"/>
        
        <Panel>
          <Panel.Heading>This panel contains a nested a bk-body-text</Panel.Heading>
          
          <div className="bk-body-text">
            <p>The following should be bold and underlined:</p>
            <p><strong><u>This is body text embedded within a component.</u></strong></p>
          </div>
        </Panel>
        
        <SegmentedControl
          options={['Test 1', 'Test 2']}
          defaultValue="Test 1"
        />
      </>
    ),
  },
};
