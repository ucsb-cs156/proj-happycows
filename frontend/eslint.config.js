import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import storybookPlugin from 'eslint-plugin-storybook';

export default [
  // Base JavaScript recommended rules
  js.configs.recommended,
  
  // React plugin configuration for all JS/JSX files
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        alert: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        localStorage: 'readonly',
        Storage: 'readonly',
        URL: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      
      // Custom no-unused-vars rule from original config
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_|^React$',
          args: 'all',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      
      // Disable prop-types since this project doesn't use them consistently
      'react/prop-types': 'off',
      
      // Allow unescaped entities (common in React apps)
      'react/no-unescaped-entities': 'off',
      
      // Allow missing keys in simple cases (downgrade to off)
      'react/jsx-key': 'off',
      
      // Allow extra boolean cast (downgrade to off)
      'no-extra-boolean-cast': 'off',
    },
  },
  
  // Configuration for test files
  {
    files: ['src/test/**/*.{js,jsx}', 'src/tests/**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        global: 'readonly',
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        localStorage: 'readonly',
        Storage: 'readonly',
        URL: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      
      // Disable anonymous default export rule for tests
      'import/no-anonymous-default-export': 'off',
      
      // Custom no-unused-vars rule
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_|^React$',
          args: 'all',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      
      // Disable prop-types since this project doesn't use them consistently
      'react/prop-types': 'off',
      
      // Allow unescaped entities
      'react/no-unescaped-entities': 'off',
      
      // Disable undefined testing library rules
      'testing-library/no-node-access': 'off',
    },
  },
  
  // Configuration for stories
  {
    files: ['src/stories/**/*.{js,jsx}', '.storybook/**/*.js'],
    plugins: {
      react: reactPlugin,
      storybook: storybookPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        require: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      
      // Disable anonymous default export rule for stories
      'import/no-anonymous-default-export': 'off',
      
      // Custom no-unused-vars rule
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_|^React$',
          args: 'all',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      
      // Disable prop-types since this project doesn't use them consistently
      'react/prop-types': 'off',
      
      // Allow unescaped entities
      'react/no-unescaped-entities': 'off',
    },
  },
  
  // Configuration for config files (Node.js environment)
  {
    files: ['vite.config.js', 'vitest.setup.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        global: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        require: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      // Allow unused vars in config files
      'no-unused-vars': 'off',
    },
  },
  
  // Ignore patterns (replacing .eslintignore)
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'dist/**',
      'coverage/**',
      '.storybook/public/**',
      'storybook-static/**',
    ],
  },
];