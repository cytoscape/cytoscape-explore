const path = require('path');
const DotEnvPlugin = require('dotenv-webpack');
const { env } = require('process');
const nodeEnv = env.NODE.ENV || 'development';
const isProd = env.NODE_ENV === 'production';
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const isNonNil = x => x != null;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const isProfile = env.PROFILE == 'true';
const minify = env.MINIFY == 'true' || isProd;

let conf = {
  mode: nodeEnv,

  devtool: isProd ? false : 'inline-source-map',

  entry: './src/client/index.js',

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },

  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        deps: {
          test: /[\\/]node_modules[\\/]/,
          name: 'deps',
          chunks: 'all',
        },
        default: {
          name: 'main',
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },

  plugins: [
    new DotEnvPlugin(),

    isProfile ? new BundleAnalyzerPlugin() : null,

    minify ? new UglifyJSPlugin() : null
  ].filter( isNonNil )
};

module.exports = conf;
