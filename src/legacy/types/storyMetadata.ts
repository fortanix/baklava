import { addDecorator } from '@storybook/react';

type DecoratorFunction = Parameters<typeof addDecorator>[0];

export type StoryMetadata = {
  component: React.ReactNode,
  title: string,
  decorators?: Array<DecoratorFunction>,
};
