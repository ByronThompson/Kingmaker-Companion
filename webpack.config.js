const path = require('path');
const webpack = require("webpack");

module.exports = {
    entry: './public/App/Application/KingmakerCompanion.ts', // The entry point of your app
    output: {
        filename: 'dist.js', // The output bundle file
        path: path.resolve(__dirname, './public/js'), // The output directory
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'], // Add .ts and .tsx as resolvable extensions
    },
    mode: 'development', // Use 'development' for non-minified code
    devtool: 'source-map', // Source maps for better debugging
    module: {
        rules: [
            {
                test: /\.tsx?$/, // Target .ts and .tsx files
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/, // Apply this rule to CSS files
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.js$/, // Apply this rule to JS files
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader', // Transpile JS code (optional)
                },
            },
            // Add other rules for other file types if needed
        ],
    },
};
