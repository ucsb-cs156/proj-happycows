module.exports = {
  core: {
    builder: 'webpack5',
  },
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/preset-create-react-app",
    "@storybook/addon-docs"
  ],
 framework: '@storybook/react-webpack5',
 staticDirs: ['../public'],
}
