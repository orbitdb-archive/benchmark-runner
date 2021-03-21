'use strict'
const path = require('path')
const { fork } = require('child_process')
const puppeteer = require('puppeteer')

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
  const webpackServer = await spawnWebpackServer({ port: 3000, ...opts })
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  page.on('error', e => process.stderr.write(e.toString()))
  page.on('pageerror', e => process.stderr.write(e.toString()))
  await new Promise(resolve => {
    page.exposeFunction('benchmarkerFinished', () => resolve())
    page.goto('http://localhost:3000')
  })
  await browser.close()
  webpackServer.kill('SIGINT')
}
