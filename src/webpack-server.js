#!/usr/bin/env node
const path = require('path')
const { program } = require('commander')
program
  .requiredOption('-f, --file <path>', 'the benchmark file to run')
  .requiredOption('-h, --host <addr:port>', 'the address and port of the benchmarker server')
  .requiredOption('-b, --basename <basename>', 'the file\'s name')
  .requiredOption('-p, --port <port>', 'the port to host the bundled  at')
program.parse()

const { file, host, basename, port } = program.opts()

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const middleware = require('webpack-dev-middleware')
const express = require('express')
const webpackEntry = path.join(__dirname, 'webpack-entry.js')

const compiler = webpack({
  mode: 'production',
  entry: webpackEntry,
  output: { filename: 'bundle.js' },
  module: {
    rules: [
      {
        test: webpackEntry,
        use: [{ loader: 'val-loader', options: { file, host, basename } }]
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin({ filename: 'index.html' })]
})

const app = express()
const instance = middleware(compiler)
instance.waitUntilValid(() => instance.close()) // after bundling turn off file watching
app.use(instance)
app.listen(port, () => process.send && process.send('listening'))
