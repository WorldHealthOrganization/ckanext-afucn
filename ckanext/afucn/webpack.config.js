const path = require('path');
const dotenv = require('dotenv');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Load environment variables from .env file
dotenv.config();

module.exports = {
    entry: {
        main: path.resolve(__dirname, process.env.JS_SRC, 'main.js'), // Adjust as per your JS entry file
        styles: path.resolve(__dirname, process.env.SASS_SRC, 'styles.scss') // Adjust as per your SASS entry file
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, process.env.EXTENSION_OUTPUT),
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
            filename: 'styles.css',
        }),
    ],
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.jsx', '.scss'],
    },
};

// Copy compiled files to additional output path
const fs = require('fs');
const copyPlugin = {
    apply: (compiler) => {
        compiler.hooks.afterEmit.tap('CopyPlugin', () => {
            const srcFolder = process.env.EXTENSION_OUTPUT;
            const destFolder = process.env.CORE_CKAN_OUTPUT;

            if (!fs.existsSync(destFolder)) {
                fs.mkdirSync(destFolder, { recursive: true });
            }

            fs.readdirSync(srcFolder).forEach((file) => {
                const srcFile = path.join(srcFolder, file);
                const destFile = path.join(destFolder, file);
                fs.copyFileSync(srcFile, destFile);
            });
        });
    },
};

module.exports.plugins.push(copyPlugin);
