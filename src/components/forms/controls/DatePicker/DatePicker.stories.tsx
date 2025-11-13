/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { LayoutDecorator } from '../../../../util/storybook/LayoutDecorator.tsx';

import { DatePicker, DatePickerInline, DatePickerInput } from './DatePicker.tsx';


type DatePickerArgs = React.ComponentProps<typeof DatePicker>;
type Story = StoryObj<DatePickerArgs>;

const DatePickerInlineControlled = (props: React.ComponentProps<typeof DatePicker>) => {
  const [selectedDate, setSelectedDate] = React.useState<null | Date>(props.selected);
  return (
    <DatePickerInline {...props} selected={new Date()} onChange={() => {}}/>
  );
};

const meta: Meta<DatePickerArgs> = {
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  decorators: [
    Story => (
      <form onSubmit={event => { event.preventDefault(); }}>
        <LayoutDecorator size="x-small">
          <style>{`
            @scope {
              display: flex;
              flexDirection: column;
              align-items: center;
              gap: 0.5lh;
            }
          `}</style>
          <Story/>
        </LayoutDecorator>
      </form>
    ),
  ],
};
export default meta;

export const DatePickerStandard: Story = {
  render: () => <DatePickerInline selected={new Date()} onChange={() => {}}/>,
};

export const DatePickerWithInput: Story = {
  render: (args) => {
    const [startDate, setStartDate] = React.useState<Date | null>(new Date(2024, 10, 12, 9, 41));
    
    return (
      // with a fixed height to avoid hiding the bottom part of the calendar
      <div style={{ blockSize: 500 }}>
        <DatePicker
          {...args}
          selected={startDate}
          onChange={(date: Date | null) => { setStartDate(date) }}
        />
        <p>Date selected: {startDate?.toDateString()}</p>
      </div>
    );
  },
};

export const DateNotSet: Story = {
  render: (args) => {
    const [startDate, setStartDate] = React.useState<Date | null>(null);
    
    return (
      // Fixed height to avoid hiding the bottom part of the calendar
      <div style={{ blockSize: 500 }}>
        <DatePicker
          {...args}
          selected={startDate}
          onChange={(date: Date | null) => { setStartDate(date) }}
        />
        <p>Date selected: {startDate?.toDateString()}</p>
      </div>
    );
  },
};

export const DatePickerInputStandard: Story = {
  render: (args) => {
    const [startDate, setStartDate] = React.useState<Date | null>(new Date(2024, 10, 12, 9, 41));
    
    return (
      <>
        <DatePickerInput
          {...args}
          selected={startDate}
          onChange={(date: Date | null) => { setStartDate(date) }}
        />
        <p>Date selected: {startDate?.toDateString()}</p>
      </>
    );
  },
};

export const DatePickerInputEmpty: Story = {
  render: (args) => {
    const [startDate, setStartDate] = React.useState<Date | null>(null);
    
    return (
      <>
        <DatePickerInput
          {...args}
          selected={startDate}
          onChange={(date: Date | null) => { setStartDate(date) }}
        />
        <p>Date selected: {startDate?.toDateString() || 'None'}</p>
      </>
    );
  },
};

/**
 * For accessibility, the date picker should be associated with a `<label>` element that provides an accessible name.
 */
export const DateWithLabel: Story = {
  render: (args) => {
    const [startDate, setStartDate] = React.useState<Date | null>(null);
    
    return (
      <>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: There is an input inside `DatePicker` */}
        <label style={{ blockSize: 500 }}>
          Date input:
          <DatePicker
            {...args}
            selected={startDate}
            onChange={(date: Date | null) => { setStartDate(date) }}
          />
        </label>
        <p>Date selected: {startDate?.toDateString()}</p>
      </>
    );
  }
};

/**
 * The label may be visually hidden if you don't want to display it to non-assistive technology users.
 */
export const DateWithVisuallyHiddenLabel: Story = {
  render: (args) => {
    const [startDate, setStartDate] = React.useState<Date | null>(null);
    
    return (
      <>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: There is an input inside `DatePicker` */}
        <label style={{ blockSize: 500 }}>
          <span className="visually-hidden">Date input:</span>
          <DatePicker
            {...args}
            selected={startDate}
            onChange={(date: Date | null) => { setStartDate(date) }}
          />
        </label>
        <p>Date selected: {startDate?.toDateString()}</p>
      </>
    );
  }
};
