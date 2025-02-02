/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { type TestRunnerConfig, getStoryContext } from '@storybook/test-runner';
import { injectAxe, configureAxe, checkA11y } from 'axe-playwright';
 
/*
 * See https://storybook.js.org/docs/writing-tests/test-runner#test-hook-api
 * to learn more about the test-runner hooks API.
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    // Workaround for https://github.com/dequelabs/axe-core/issues/3426
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Get the entire context of a story, including parameters, args, argTypes, etc.
    const storyContext = await getStoryContext(page, context);
    
    // Apply story-level a11y rules
    await configureAxe(page, {
      rules: storyContext.parameters?.a11y?.config?.rules,
    });
    
    const element = storyContext.parameters?.a11y?.element ?? '#storybook-root';
    await checkA11y(page, element, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  },
};
 
export default config;
