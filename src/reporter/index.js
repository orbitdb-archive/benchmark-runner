'use strict'
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const InlineAssetsHtmlPlugin = require('inline-assets-html-plugin')
const webpackEntry = path.join(__dirname, 'app.js')

module.exports = (output, results) => new Promise((resolve, reject) => {
  webpack(
    {
      mode: 'production',
      entry: webpackEntry,
      output: {
        path: path.dirname(output)
      },
      module: {
        rules: [
          {
            test: path.join(__dirname, 'results.js'),
            use: [{ loader: 'val-loader', options: { results } }]
          },
          {
            test: /\.js$/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react']
              }
            },
            exclude: /node_modules/
          },
          {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader']
          }
        ]
      },
      plugins: [
        new HtmlWebpackPlugin({
          filename: path.basename(output)
        }),
        new InlineAssetsHtmlPlugin({
          test: /\.(css|js)$/, // Required: regexp test of files to inline
          emit: false
        })
      ]
    },
    (err, stats) => {
      if (err) {
        reject(err)
      } else if (stats.hasErrors()) {
        reject(stats.compilation.errors)
      } else {
        console.log(output)
        resolve()
      }
    }
  )
})
