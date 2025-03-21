import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import prettier from 'eslint-plugin-prettier';
import tsParser from '@typescript-eslint/parser';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';

const eslintConfig: FlatConfig.Config = {
  files: ['**/*.{ts,mts}'],
  ignores: ['node_modules/**'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: tsParser,
    globals: {
      node: true,
      esnext: true,
    },
  },
  plugins: {
    '@typescript-eslint': typescriptEslintPlugin,
    prettier,
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        printWidth: 100,
        tabWidth: 2,
        useTabs: false,
        singleQuote: true,
        semi: true,
        quoteProps: 'as-needed',
        trailingComma: 'all',
        bracketSpacing: true,
        bracketSameLine: false,
        arrowParens: 'always',
        endOfLine: 'lf',
        proseWrap: 'preserve',
      },
    ],
  },
};

export default [eslintConfig];
