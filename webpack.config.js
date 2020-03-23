const path = require('path');
const DotEnvPlugin = require('dotenv-webpack');
const { env } = require('process');
const nodeEnv = env.NODE_ENV || 'development';
const isProd = env.NODE_ENV === 'production';
const isNonNil = x => x != null;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const isProfile = env.PROFILE == 'true';
const minify = env.MINIFY == 'true' || isProd;

let conf = {
  mode: nodeEnv,

  devtool: isProd ? false : 'inline-source-map',

  entry: {
    main: './src/client/index.js',
    polyfills: './src/client/polyfills.js'
  },

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
        vendors: {
          name: 'deps',
          test: (mod, chunks) => {
            let context = mod.context || '';

            return context.indexOf('node_modules') >= 0 && !chunks.some(chunk => chunk.name === 'polyfills');
          }
        },
        default: {
          name: 'main',
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
          test: (mod) => {
            let context = mod.context || '';

            return context.indexOf('node_modules') < 0;
          }
        }
      }
    },
    usedExports: minify
  },

  plugins: [
    new DotEnvPlugin(),

    isProfile ? new BundleAnalyzerPlugin() : null
  ].filter( isNonNil )
};

module.exports = conf;
