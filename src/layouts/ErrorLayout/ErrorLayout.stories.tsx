/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../components/actions/Button/Button.tsx';
import { ErrorLayout } from './ErrorLayout.tsx';

type ErrorLayoutArgs = React.ComponentProps<typeof ErrorLayout>;
type Story = StoryObj<ErrorLayoutArgs>;

export default {
  tags: ['autodocs'],
  component: ErrorLayout,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<ErrorLayoutArgs>;

export const ErrorApp: Story = {
  render: () => {
    return (
      <ErrorLayout
        title="Error"
        description="In case there is a secondary text to be added withIn case there is a secondary text to be added with"
        icon="badge-dashboard"
        redirectLinkLabel="Link"
        redirectTo="#"
      >
        <ErrorLayout.Actions>
          <Button kind ='secondary'>
            Back
          </Button>
          <Button kind ='primary'>
            Refresh
          </Button>
        </ErrorLayout.Actions>
      </ErrorLayout>
    );
  },
};
