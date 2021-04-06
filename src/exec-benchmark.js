#!/usr/bin/env node
const path = require('path')
const { workerData: opts } = require('worker_threads')
const basename = path.basename(opts.file)

const main = opts.browser
  ? require('./exec-benchmark.browser.js')
  : require('./exec-benchmark.node.js')

main({ ...opts, basename })
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1) })
