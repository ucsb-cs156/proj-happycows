export default {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: [
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  docs: {
    autodocs: 'tag',
  },
};
