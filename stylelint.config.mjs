
import { dedent } from 'ts-dedent';


/** @type {import('stylelint').Config} */
export default {
  extends: 'stylelint-config-standard-scss',
  
  ignoreFiles: [
    'node_modules/**/*',
    'dist/**/*',
  ],
  
  plugins: [
    'stylelint-use-logical',
  ],
  
  // Override `stylelint-config-standard-scss` rules
  rules: {
    // Modules
    'scss/load-partial-extension': 'always', // Must include the file extension
    
    // Formatting
    'comment-empty-line-before': null,
    'comment-whitespace-inside': null,
    'scss/comment-no-empty': null,
    'scss/double-slash-comment-empty-line-before': null,
    'scss/double-slash-comment-whitespace-inside': null,
    'custom-property-empty-line-before': null,
    'rule-empty-line-before': null,
    'scss/operator-no-newline-before': null,
    'declaration-empty-line-before': null,
    'at-rule-empty-line-before': null,
    'value-keyword-case': [
      'lower',
      { camelCaseSvgKeywords: true },
    ],
    'font-family-name-quotes': 'always-unless-keyword',
    'number-max-precision': null,
    'color-hex-length': null,
    'scss/operator-no-unspaced': null,
    'scss/dollar-variable-empty-line-before': null,
    
    // Selectors
    'selector-class-pattern': [
			'^([a-z][a-z0-9]*)((-|--|_|__)[a-z0-9]+)*$',
			{ message: (selector) => `Expected class selector "${selector}" to be in BEM format` },
		],
		'selector-id-pattern': [
			'^([a-z][a-z0-9]*)((-|--|_|__)[a-z0-9]+)*$',
			{ message: (selector) => `Expected id selector "${selector}" to be in BEM format` },
		],
    'selector-no-vendor-prefix': [
      true,
      { ignoreSelectors: ['::-webkit-input-placeholder', '/-moz-.*/'] },
    ],
    // Disallow `&` selector concatenation to be forward-compatible with native CSS
    'selector-disallowed-list': [
      ['/&__/', '/&--/'],
      {
        message: (selector) => dedent`
          Do not use '&'-concatenation in selectors, this conflicts with native CSS. Found: ${selector}.
        `,
      },
    ],
    
    // Properties
    'csstools/use-logical': ['always', { except: [/width/, /height/] }], // FIXME: width/height
    //'declaration-no-important': true, // No !important
    'declaration-property-value-disallowed-list': [
      {
        // Disallow auto/scroll. This requires a tabindex="0" for accessibility, which should be handled through the
        // `useScroller()` hook instead.
        '/^overflow(-x|-y)?/': ['auto', 'scroll'],
      },
      {
        message: (selector, value) => {
          if (selector.match(/overflow/)) {
            return `Do not declare '${selector}: ${value}' directly, use the useScroller() hook instead.`;
          }
          return `The rule '${selector}: ${value}' is disallowed, see stylelint config for more information.`;
        },
      },
    ],
    
    // Expressions
    'scss/no-global-function-names': null,
    
    // CSS extensions (e.g. CSS modules, or future CSS)
    //'property-no-unknown': [true, { ignoreProperties: [] }],
    //'scss/at-rule-no-unknown': [true, { ignoreAtRules: [] }],
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global', 'local'] }],
    'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: [] }],
    
    'no-descending-specificity': null, // Does not work properly with a lot of nesting (see docs page also)
  },
  
  overrides: [
    {
      files: ['*.scss', '**/*.scss'],
      
      // Rules to apply only to Sass and not to CSS
      rules: {
        'at-rule-disallowed-list': [
          'import', // @import in Sass is deprecated (in vanilla CSS this is still fine)
        ],
      }
    }
  ]
};
