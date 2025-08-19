module.exports = {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  docs: {
    autodocs: 'tag',
  },
}
