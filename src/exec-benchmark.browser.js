'use strict'
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const middleware = require('webpack-dev-middleware')
const express = require('express')
// const puppeteer = require('puppeteer')
const webpackEntry = path.resolve(__dirname, 'webpack-entry.js')

module.exports = async function ({ file, host, basename }) {
  const compiler = webpack({
    mode: 'production',
    entry: webpackEntry,
    output: {
      filename: 'bundle.js',
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: webpackEntry,
          use: [{ loader: 'val-loader', options: { file, host, basename } }]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({ filename: 'index.html' })
    ]
  })
  const app = express()
  const instance = middleware(compiler)
  instance.waitUntilValid(() => instance.close()) // turns off file watching
  app.use(instance)
  await new Promise(resolve => app.listen(3000, resolve))
  await new Promise(() => {})
}
