
export default {
  'extends': 'stylelint-config-standard-scss',
  
  'rules': {
    // Override `stylelint-config-standard-scss` rules
    'scss/load-partial-extension': 'always',
    'scss/at-import-partial-extension': 'always',
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
    'scss/dollar-variable-empty-line-before': null,
    
    'scss/at-rule-no-unknown': [
      true,
      { ignoreAtRules: ['scope', 'position-try'] },
    ],
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['modal', 'global', 'local'] },
    ],
    
    // Disallow `&` selector concatenation to be forward-compatible with native CSS
    'selector-disallowed-list': [
      ['/&__/', '/&--/'],
      { message: (selector) => `Do not use '&'-concatenation in selectors, this conflicts with native CSS` },
    ],
    
    'no-descending-specificity': null, // Does not work properly with a lot of nesting (see docs page also)
  },
};
