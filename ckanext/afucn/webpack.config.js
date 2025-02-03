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
      // CSS files
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      // Sass files
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader', // Compiles Sass to CSS
        ],
      },
      // JavaScript files (transpiling if needed)
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',  // Use Babel to transpile JS if necessary
      },
      // Images (file handling and optimization via image-webpack-loader)
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]',
              outputPath: 'img/', // Output images to public/img/
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: { progressive: true, quality: 70 }, // Optimize JPEG images
              optipng: { optimizationLevel: 5 }, // Optimize PNG images
              pngquant: { quality: [0.65, 0.90], speed: 4 }, // PNG optimization
              gifsicle: { interlaced: false }, // Optimize GIFs
            },
          },
        ],
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
