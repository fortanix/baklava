import type { TestRunnerConfig } from '@storybook/test-runner';
import { injectAxe, checkA11y } from 'axe-playwright';
 
/*
 * See https://storybook.js.org/docs/writing-tests/test-runner#test-hook-api
 * to learn more about the test-runner hooks API.
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page) {
    await checkA11y(
      page,
      '#storybook-root',
      {
        detailedReport: true,
        detailedReportOptions: {
          html: true,
        },
      },
      // true,
      // 'html',
      // {
      //   outputDirPath: 'results',
      //   outputDir: 'accessibility',
      //   reportFileName: 'accessibility-audit.html',
      // },
    );
  },
};
 
export default config;
