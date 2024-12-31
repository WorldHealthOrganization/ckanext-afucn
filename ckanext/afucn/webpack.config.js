const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = {
  entry: {
    styles: './assets/sass/styles.scss', // Entry point for Sass
    afucn: './assets/js/afucn.js', // Entry point for custom JavaScript
    'afucn.bundle': './assets/js/afucn.bundle.js', // Entry point for libraries
  },
  output: {
    path: path.resolve(__dirname, 'public'), // Output directory
    filename: '[name].js', // Output file name ([name] = entry point name)
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader, // Extracts CSS into a file
          'css-loader', // Translates CSS into CommonJS
          {
            loader: 'sass-loader', // Compiles Sass to CSS
            options: {
              sourceMap: true, // Enable source maps
            },
          },
        ],
      },
      {
        test: /\.js$/, // Process JavaScript files
        exclude: /node_modules/, // Exclude node_modules
        use: {
          loader: 'babel-loader', // Transpile JavaScript using Babel
          options: {
            presets: ['@babel/preset-env'], // Use modern JavaScript features
          },
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'afucn.css', // Output CSS file name
    }),
    new BrowserSyncPlugin({
      proxy: 'https://localhost:8443', // Proxy your Docker app
      files: ['public/afucn.css'], // Watch the compiled CSS file
      serveStatic: ['./public'], // Serve the public folder locally
      injectCss: true, // Inject CSS changes without reloading
      https: true, // Enable HTTPS for BrowserSync
    }),
  ],
  devtool: 'source-map', // Generate source maps
  mode: 'development', // No minification
};