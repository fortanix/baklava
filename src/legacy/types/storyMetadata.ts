/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { addDecorator } from '@storybook/react';

type DecoratorFunction = Parameters<typeof addDecorator>[0];

export type StoryMetadata = {
  component: React.ReactNode,
  title: string,
  decorators?: Array<DecoratorFunction>,
};
