const path = require('path');
const dotenv = require('dotenv');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const fs = require('fs');

// Load environment variables from .env file
dotenv.config();

module.exports = {
  entry: {
    main: path.resolve(__dirname, process.env.JS_SRC, 'main.js'),
    styles: path.resolve(__dirname, process.env.SASS_SRC, 'styles.scss'),
  },
  output: {
    filename: process.env.JS_OUTPUT_FILENAME || '[name].js',
    path: path.resolve(__dirname, process.env.EXTENSION_OUTPUT), // e.g. './assets/dist'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: path.join(
        process.env.CSS_OUTPUT_SUBFOLDER || '',
        process.env.CSS_OUTPUT_FILENAME || 'styles.css'
      ),
    }),
  ],
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.scss'],
  },
};

// Copy plugin with directory-skip logic
const copyPlugin = {
  apply: (compiler) => {
    compiler.hooks.afterEmit.tap('CopyPlugin', () => {
      const srcFolder = path.resolve(__dirname, process.env.EXTENSION_OUTPUT);
      const destFolder = path.resolve(__dirname, process.env.CORE_CKAN_OUTPUT);

      // Ensure dest folder exists
      if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder, { recursive: true });
      }

      // Copy only top-level files (skip directories)
      fs.readdirSync(srcFolder).forEach((fileOrDir) => {
        const srcPath = path.join(srcFolder, fileOrDir);
        if (fs.lstatSync(srcPath).isDirectory()) {
          return; // Skip directories (or handle them recursively)
        }

        const destPath = path.join(destFolder, fileOrDir);
        fs.copyFileSync(srcPath, destPath);
      });
    });
  },
};

module.exports.plugins.push(copyPlugin);
