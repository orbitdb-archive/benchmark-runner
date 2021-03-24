'use strict'
const path = require('path')
const { fork } = require('child_process')
const puppeteer = require('puppeteer')
const getPort = require('./get-port')

async function spawnWebpackServer ({ file: f, host: h, basename: b, port: p }) {
  return new Promise(resolve => {
    const subprocess = fork(
      path.join(__dirname, 'webpack-server.js'),
      [`-f${f}`, `-h${h}`, `-b${b}`, `-p${p}`],
      { stdio: 'inherit' }
    )
    subprocess.on('message', m => m === 'listening' && resolve(subprocess))
  })
}

module.exports = async function (opts) {
  const port = await getPort()
  const webpackServer = await spawnWebpackServer({ port, ...opts })
  const browser = await puppeteer.launch({ args: ['--enable-precise-memory-info'] })
  const [page] = await browser.pages()
  page.on('error', e => process.stderr.write(e.toString()))
  page.on('pageerror', e => process.stderr.write(e.toString()))
  await new Promise(resolve => {
    page.exposeFunction('benchmarkerFinished', () => resolve())
    page.goto(`http://localhost:${port}`)
  })
  await browser.close()
  webpackServer.kill('SIGINT')
}
