/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { DummyLink } from '../../util/storybook/StorybookLink.tsx';

import { Button } from '../../components/actions/Button/Button.tsx';
import { SegmentedControl } from '../../components/forms/controls/SegmentedControl/SegmentedControl.tsx';
import { Panel } from '../../components/containers/Panel/Panel.tsx';

import { Prose } from './Prose.tsx';


type ProseArgs = React.ComponentProps<typeof Prose>;
type Story = StoryObj<typeof Prose>;

export default {
  component: Prose,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
  render: (args) => <Prose {...args}/>,
} satisfies Meta<ProseArgs>;


const SampleProse = () => {
  const id = React.useId();
  return (
    <>
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
      
      <p>
        <b>This text is bold.</b>
        {' '}<i>This text is italic.</i>
        {' '}<u>This text is underlined.</u>
      </p>
      
      <hr/>
      
      <p>
        Lorem ipsum dolor sit amet, <DummyLink>consectetur</DummyLink> adipiscing elit. Pellentesque eget sem ut neque lobortis pharetra nec vel quam. Etiam sem neque, gravida sed pharetra ut, vehicula quis lectus. Donec ac rhoncus purus. Proin ultricies augue vitae purus feugiat, in ultrices lorem aliquet. Donec eleifend ac dolor a auctor. Cras ac suscipit nibh. Fusce tincidunt iaculis dapibus. Vivamus sit amet neque eu velit tincidunt semper. Donec at magna aliquam mi consectetur imperdiet. Donec pretium placerat quam, in sodales purus porta vitae. Phasellus nisl justo, luctus vel mi vel, sollicitudin euismod neque.
      </p>
      <p>
        Duis mollis, justo vel pretium luctus, risus sem eleifend lectus, ac convallis dolor nibh id sapien. Donec vestibulum tellus non rutrum convallis. Aenean venenatis enim in egestas lobortis. Donec mollis elit in turpis imperdiet congue vel at magna. Vestibulum bibendum, ipsum quis lobortis lobortis, lorem libero mollis sapien, sed tempus lacus nibh a nunc. Vivamus sed sem eleifend, rutrum erat eget, ultricies neque. Morbi condimentum dolor vel ipsum consectetur iaculis. Donec ornare diam at orci luctus, sed placerat quam dictum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Curabitur condimentum molestie augue. Ut vel nisl a augue ornare volutpat. Phasellus et enim in mi maximus ultricies. Integer dignissim ipsum mauris, id bibendum eros euismod et.
      </p>
      <p>An unordered list:</p>
      <ul>
        <li>List item 1</li>
        <li>List item 2</li>
        <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eget sem ut neque lobortis pharetra nec vel quam. Etiam sem neque, gravida sed pharetra ut, vehicula quis lectus. Donec ac rhoncus purus. Proin ultricies augue vitae purus feugiat, in ultrices lorem aliquet. Donec eleifend ac dolor a auctor. Cras ac suscipit nibh. Fusce tincidunt iaculis dapibus. Vivamus sit amet neque eu velit tincidunt semper. Donec at magna aliquam mi consectetur imperdiet. Donec pretium placerat quam, in sodales purus porta vitae. Phasellus nisl justo, luctus vel mi vel, sollicitudin euismod neque.</li>
        <li> Nested unordered list:
          <ul>
            <li>Nested list item 1</li>
            <li>Nested list item 2</li>
          </ul>
        </li>
        <li> Nested ordered list:
          <ol>
            <li>Nested list item 1</li>
            <li>Nested list item 2</li>
            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eget sem ut neque lobortis pharetra nec vel quam. Etiam sem neque, gravida sed pharetra ut, vehicula quis lectus. Donec ac rhoncus purus. Proin ultricies augue vitae purus feugiat, in ultrices lorem aliquet. Donec eleifend ac dolor a auctor. Cras ac suscipit nibh. Fusce tincidunt iaculis dapibus. Vivamus sit amet neque eu velit tincidunt semper. Donec at magna aliquam mi consectetur imperdiet. Donec pretium placerat quam, in sodales purus porta vitae. Phasellus nisl justo, luctus vel mi vel, sollicitudin euismod neque.</li>
          </ol>
        </li>
      </ul>
      <p>An ordered list:</p>
      <ol>
        <li>List item 1</li>
        <li>List item 2</li>
        <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eget sem ut neque lobortis pharetra nec vel quam. Etiam sem neque, gravida sed pharetra ut, vehicula quis lectus. Donec ac rhoncus purus. Proin ultricies augue vitae purus feugiat, in ultrices lorem aliquet. Donec eleifend ac dolor a auctor. Cras ac suscipit nibh. Fusce tincidunt iaculis dapibus. Vivamus sit amet neque eu velit tincidunt semper. Donec at magna aliquam mi consectetur imperdiet. Donec pretium placerat quam, in sodales purus porta vitae. Phasellus nisl justo, luctus vel mi vel, sollicitudin euismod neque.</li>
        <li> Nested unordered list:
          <ul>
            <li>Nested list item 1</li>
            <li>Nested list item 2</li>
          </ul>
        </li>
        <li> Nested ordered list:
          <ol>
            <li>Nested list item 1</li>
            <li>Nested list item 2</li>
            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eget sem ut neque lobortis pharetra nec vel quam. Etiam sem neque, gravida sed pharetra ut, vehicula quis lectus. Donec ac rhoncus purus. Proin ultricies augue vitae purus feugiat, in ultrices lorem aliquet. Donec eleifend ac dolor a auctor. Cras ac suscipit nibh. Fusce tincidunt iaculis dapibus. Vivamus sit amet neque eu velit tincidunt semper. Donec at magna aliquam mi consectetur imperdiet. Donec pretium placerat quam, in sodales purus porta vitae. Phasellus nisl justo, luctus vel mi vel, sollicitudin euismod neque.</li>
          </ol>
        </li>
      </ol>
      
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Contact</th>
            <th>Country</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Alfreds Futterkiste</td>
            <td>Maria Anders</td>
            <td>Germany</td>
            <td>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et 
              dolore magna aliqua.
            </td>
          </tr>
          <tr>
            <td>Centro comercial Moctezuma</td>
            <td>Francisco Chang</td>
            <td>Mexico</td>
            <td>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et 
              dolore magna aliqua.
            </td>
          </tr>
        </tbody>
      </table>
      
      {/*
      <hr/>
      
      <h2>Forms</h2>
      
      <form>
        <fieldset>
          <legend>Test</legend>
          
          <label htmlFor={`${id}-input-1`}>Text input:</label>
          <input id={`${id}-input-1`} type="text"/>
        </fieldset>
      </form>
      */}
    </>
  );
};

export const Standard: Story = {
  args: {
    children: <SampleProse/>,
  },
};

export const WithComponents: Story = {
  args: {
    children: (
      <>
        <h1>Prose with embedded components</h1>
        <p>
          Prose can include Baklava components. Those components should not be affected by any styling inherited
          from the prose styling.
        </p>
        <p>Here is a button component:</p>
        <Button kind="primary" label="Button"/>
        
        <Panel>
          <Panel.Heading>This panel contains a nested a bk-prose</Panel.Heading>
          
          <div className="bk-prose">
            <p>The following should be bold and underlined:</p>
            <p><strong><u>This is prose embedded within a component.</u></strong></p>
          </div>
        </Panel>
        
        <SegmentedControl size="small" defaultSelected="test-1" aria-label="Test segmented control">
          <SegmentedControl.Button buttonKey="test-1" label="Test 1"/>
          <SegmentedControl.Button buttonKey="test-2" label="Test 2"/>
          <SegmentedControl.Button buttonKey="test-3" label="Test 3"/>
        </SegmentedControl>
      </>
    ),
  },
};
