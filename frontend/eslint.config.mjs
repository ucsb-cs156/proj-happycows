import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import reactPlugin from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";

// Import the vitest plugin
import vitest from "@vitest/eslint-plugin";
import plugin from "eslint-plugin-testing-library";

export default defineConfig([
  globalIgnores([
    "dist",
    ".stryker-tmp/",
    ".storybook/",
    "build",
    "coverage",
    "node_modules",
    "public/mockServiceWorker.js",
    "storybook-static/",
  ]),
  {
    files: ["src/**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      reactPlugin.configs.flat.recommended,
    ],
    // Add settings to avoid "React version not specified" warning
    settings: {
      react: {
        version: "detect",
      },
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": [
        "error",
        { varsIgnorePattern: "^[A-Z_].*", argsIgnorePattern: "^_" },
      ],
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/no-unescaped-entities": "off",
      // eslint-plugin-react-hooks 7 adds React Compiler rules that flag
      // pre-existing patterns in this codebase; turned off rather than
      // refactoring in a dependency-update PR (same decision as proj-courses).
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
    },
  },
  {
    ...plugin.configs["flat/react"],
    // Apply this configuration only to test files
    files: ["**/*.test.{js,jsx}", "**/*.spec.{js,jsx}"],
    plugins: {
      vitest,
    },
    languageOptions: {
      globals: vitest.environments.env.globals, // Use vitest's globals
    },
    rules: {
      // Vitest recommended rules
      ...vitest.configs.recommended.rules,
      "vitest/expect-expect": "off",
    },
  },
]);
