'use strict'
const path = require('path')
const puppeteer = require('puppeteer')
const webpackServer = require('./webpack-server')
const webpackPort = 37373

module.exports = async function (opts) {
  await webpackServer({ port: webpackPort, ...opts })
  const browser = await puppeteer.launch({
    args: ['--enable-precise-memory-info'],
    userDataDir: path.join(opts.fixtures, 'puppeteer')
  })
  const [page] = await browser.pages()
  page.on('error', e => process.stderr.write(e.toString()))
  page.on('pageerror', e => process.stderr.write(e.toString()))
  await new Promise(resolve => {
    // page.exposeFunction('benchmarkFinished', () => resolve())
    page.exposeFunction('benchmarkFinished', resolve)
      .then(() => page.goto(`http://localhost:${webpackPort}`))
  })
  await browser.close()
}
