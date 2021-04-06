#!/usr/bin/env node
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const middleware = require('webpack-dev-middleware')
const express = require('express')
const webpackEntry = path.join(__dirname, 'webpack-entry.js')

module.exports = async function ({ port, ...options }) {
  const compiler = webpack({
    mode: 'production',
    entry: webpackEntry,
    output: { filename: 'bundle.js' },
    module: {
      rules: [
        {
          test: webpackEntry,
          use: [{ loader: 'val-loader', options }]
        }
      ]
    },
    plugins: [new HtmlWebpackPlugin({ filename: 'index.html' })]
  })

  const app = express()
  const instance = middleware(compiler)
  console.log('bundling...')
  // after bundling turn off file watching
  instance.waitUntilValid(() => instance.close())
  app.use(instance)
  try {
    app.listen(port)
  } catch (e) {
    console.error(e)
  }
}
