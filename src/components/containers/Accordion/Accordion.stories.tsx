/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { Accordion } from './Accordion.tsx';


type AccordionArgs = React.ComponentProps<typeof Accordion>;
type Story = StoryObj<AccordionArgs>;

export default {
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => <div style={{ width: 400, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}><Story/></div>
  ],
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    children: (
      <article className="bk-body-text">
        <p>
          Lorem ipsum odor amet, consectetuer adipiscing elit. Pretium eget risus suspendisse, inceptos aliquet dolor. Parturient nunc euismod montes neque fames accumsan. Litora litora nisi porta tempus elit. Mus per nascetur amet nascetur convallis nibh. Rhoncus adipiscing velit praesent quisque eu torquent. Blandit dignissim malesuada senectus finibus potenti bibendum mattis. Sem habitasse tellus inceptos habitant pretium parturient parturient sociosqu. Leo tempor lorem mus consectetur justo.
        </p>
        <p>
          Iaculis augue nec turpis tortor praesent eu. Leo convallis aliquam placerat elementum justo nam. Cursus neque viverra erat ante; rhoncus maximus fringilla. Quis gravida vulputate suspendisse sem nullam ipsum ut duis. Duis mollis consequat augue amet hac iaculis. Ridiculus curabitur magna duis velit netus. Habitasse metus molestie potenti vitae ullamcorper habitant potenti montes. Ullamcorper nulla curae orci; metus ultricies malesuada pretium.
        </p>
        <p>
          Tempus enim congue mus erat tempus ex inceptos per praesent. Augue conubia parturient volutpat convallis efficitur?
        </p>
      </article>
    ),
    title: 'My Accordion',
  },
  render: (args) => <Accordion {...args}/>,
} satisfies Meta<AccordionArgs>;


export const Standard: Story = {
  name: 'Accordion',
};
