const path = require('path');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

module.exports = {
  entry: {
    'opentok-layout': './src/index.js',
  },
  devtool: 'source-map',
  plugins: [
    new UnminifiedWebpackPlugin()
  ],
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, ''),
    library: 'initLayoutContainer',
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['babel-preset-env']
        }
      }
    }]
  }
};