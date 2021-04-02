module.exports = {
  comments: false,
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ],
  plugins: [
    ['module-resolver', {
      alias: {
        '@config': './src/config',
        '@discord': './src/discord',
        '@services': './src/services',
        '@providers': './src/providers',
        '@model': './src/model',
        '@database': './src/database',
        '@util': './src/util',
      }
    }],
    'babel-plugin-transform-typescript-metadata',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['transform-remove-console', { exclude: ['error', 'warn'] }]
  ],
};
