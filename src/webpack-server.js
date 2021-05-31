#!/usr/bin/env node
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const middleware = require('webpack-dev-middleware')
const express = require('express')
const webpackEntry = path.join(__dirname, 'webpack-entry.js')
const webpackPort = 8000

module.exports = async function (options) {
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
  await new Promise(resolve => instance.waitUntilValid(() => {
    instance.close() // after bundling turn off file watching
    resolve()
  }))
  app.use(instance)
  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(webpackPort, '127.0.0.1')
      server.once('listening', () => resolve(webpackPort))
      server.on('error', reject)
    } catch (e) {
      console.error(`benchmark bundle host failed to listen on port ${webpackPort}`)
      throw e
    }
  })
}
