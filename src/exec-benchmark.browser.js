'use strict'
const path = require('path')
const { fork } = require('child_process')
const puppeteer = require('puppeteer')
const webpackPort = 37373

async function spawnWebpackServer ({ file: f, host: h, basename: b, port: p, fixtures: i }) {
  return new Promise((resolve, reject) => {
    const subprocess = fork(
      path.join(__dirname, 'webpack-server.js'),
      [`-f${f}`, `-h${h}`, `-b${b}`, `-p${p}`, `-i${i}`],
      { stdio: 'inherit' }
    )
    subprocess.on('exit', code =>
      code === 1 && reject(new Error('webpack-server port already in use'))
    )
    subprocess.on('message', m => m === 'listening' && resolve(subprocess))
  })
}

module.exports = async function (opts) {
  const webpackServer = await spawnWebpackServer({ port: webpackPort, ...opts })
  const browser = await puppeteer.launch({
    args: ['--enable-precise-memory-info'],
    userDataDir: path.join(opts.fixtures, 'puppeteer')
  })
  const [page] = await browser.pages()
  page.on('error', e => process.stderr.write(e.toString()))
  page.on('pageerror', e => process.stderr.write(e.toString()))
  await new Promise(resolve => {
    page.exposeFunction('benchmarkerFinished', () => resolve())
    page.goto(`http://localhost:${webpackPort}`)
  })
  await browser.close()
  webpackServer.kill('SIGINT')
}
