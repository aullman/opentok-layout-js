const path = require('path');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

module.exports = {
  entry: {
    'opentok-layout': './src/index.js',
  },
  devtool: 'source-map',
  plugins: [
    new UnminifiedWebpackPlugin(),
  ],
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, ''),
    library: 'initLayoutContainer',
    libraryTarget: 'umd',
    globalObject: 'typeof self !== \'undefined\' ? self : this',
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['babel-preset-env'],
        },
      },
    }],
  },
};
