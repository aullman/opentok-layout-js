const path = require('path');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

module.exports = {
  entry: {
    'opentok-layout': './src/index.ts',
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
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      // all files with a `.ts`, `.cts`, `.mts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.([cm]?ts|tsx)$/,
        loader: 'ts-loader',
      },
    ],
  },
};
