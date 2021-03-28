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
        '@commands': './src/commands',
        '@events': './src/events',
        '@services': './src/services',
        '@model': './src/model',
        '@database': './src/database',
      }
    }],
    'babel-plugin-transform-typescript-metadata',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['transform-remove-console', { exclude: ['error', 'warn'] }]
  ],
};
