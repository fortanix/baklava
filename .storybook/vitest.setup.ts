import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';
import { vi } from 'vitest';

const ignoreList: ((error: any) => boolean)[] = [
  // in case you want to ignore specific errors which you can't do anything about
  (error: any) => error.message.includes('This will render a read-only field'),
  (error: any) => error.message.includes('Missing prop'),
  (error: any) => error.message.includes('Failed'),
];
const throwMessage = (type: any, message: any) => {
  const error = new Error(`${type}${message}`);
  if (!ignoreList.reduce((acc, item) => acc || item(error), false)) {
    throw error;
  }
};

// The following code will make vitest fail on browser console errors
const throwError = (message: any) => throwMessage('Console error: ', message);
vi.spyOn(console, 'error').mockImplementation(throwError);

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
