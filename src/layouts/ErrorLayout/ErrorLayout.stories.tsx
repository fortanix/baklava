/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../../components/graphics/Icon/Icon.tsx';
import { Button } from '../../components/actions/Button/Button.tsx';
import { ErrorLayout } from './ErrorLayout.tsx';
import { Card } from '../../components/containers/Card/Card.tsx';
import { Link } from '../../components/actions/Link/Link.tsx';

type ErrorLayoutArgs = React.ComponentProps<typeof ErrorLayout>;
type Story = StoryObj<ErrorLayoutArgs>;

export default {
  tags: ['autodocs'],
  component: ErrorLayout,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<ErrorLayoutArgs>;

export const ErrorLayoutStandard : Story = {
  args: {
    children: (
      <ErrorLayout
        icon={<Icon icon="badge-dashboard"/>}
        title="Error"
        description={<>
          In case there is a secondary text to be added with. In case there is a secondary text to be added with
          <Link href="#" label="link"/>
        </>}
      >
        <ErrorLayout.Actions>
          <Button kind="secondary">
            Back
          </Button>
          <Button kind="primary">
            Refresh
          </Button>
        </ErrorLayout.Actions>
      </ErrorLayout>
    )
  }
};

export const ErrorLayoutInCard : Story = {
  decorators: [Story => <Card><Story/></Card>],
  args: {
    children: (
      <>
        <ErrorLayout
          icon={<Icon icon="audit-log"/>}
          title="Error"
          description={<>
            In case there is a secondary text to be added with. In case there is a secondary text to be added with
            <Link href="#" label="link"/>
          </>}
        >
          <ErrorLayout.Actions>
            <Button kind="secondary">
              Back
            </Button>
            <Button kind="primary">
              Refresh
            </Button>
          </ErrorLayout.Actions>
        </ErrorLayout>
      </>
    ),
  },
};
