const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// Removed: const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: {
    app: './assets/js/main.js',  // Your custom JS entry point
    vendor: './assets/js/vendor.js',  // Entry for third-party libraries
  },
  output: {
    path: path.resolve(__dirname, '../public'), // Output directory (public folder)
    filename: 'js/[name].bundle.js', // Output JS bundles (e.g., public/js/app.bundle.js)
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader', // Parses CSS files
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader', // Compiles SCSS to CSS
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/, // Font files
        type: 'asset/css/',
        generator: {
          filename: 'fonts/[name].[hash][ext]', // Output to fonts folder
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json', '.css', '.scss'], // Resolve file extensions
  },
  optimization: {
    minimize: true,  // Minimize the output (production builds)
    minimizer: [
      new TerserWebpackPlugin(),  // Minify JavaScript
      // Removed ImageMinimizerPlugin instance
    ],
  },
  stats: {
    errorDetails: true,
  },
  plugins: [
    new CleanWebpackPlugin(),  // Clean the output folder before each build
    new MiniCssExtractPlugin({
      filename: 'css/[name].bundle.css',  // Output CSS files (e.g., public/css/app.bundle.css)
    }),
  ],
  mode: 'production',  // Set to 'production' for optimized build
};
