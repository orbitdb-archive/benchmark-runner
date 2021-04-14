'use strict'
const path = require('path')
const puppeteer = require('puppeteer')
const webpackServer = require('./webpack-server')

module.exports = async function (opts) {
  const webpackPort = await webpackServer(opts)
  const browser = await puppeteer.launch({
    args: ['--enable-precise-memory-info'],
    userDataDir: path.join(opts.dir, 'browser')
  })
  const [page] = await browser.pages()
  page.on('error', e => process.stderr.write(e.toString()))
  page.on('pageerror', e => process.stderr.write(e.toString()))
  // await benchmarks to complete
  await new Promise(resolve => {
    page.exposeFunction('benchmarkComplete', resolve)
      .then(() => page.goto(`http://localhost:${webpackPort}`))
  })
  await browser.close()
}
