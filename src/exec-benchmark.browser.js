'use strict'
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const middleware = require('webpack-dev-middleware')
const express = require('express')
const puppeteer = require('puppeteer')
const webpackEntry = path.resolve(__dirname, 'webpack-entry.js')
const defer = () => {
  const d = {}
  d.promise = new Promise(resolve => { d.resolve = resolve })
  return d
}

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

  const deferred = defer()
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  page.on('error', e => process.stderr.write(e.toString()))
  page.on('pageerror', e => process.stderr.write(e.toString()))
  await page.exposeFunction('benchmarkerFinished', () => deferred.resolve())
  await page.goto('http://localhost:3000')
  await deferred.promise
  await browser.close()
}
