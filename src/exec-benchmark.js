#!/usr/bin/env node
const path = require('path')
const { workerData: opts } = require('worker_threads')
const basename = path.basename(opts.file)

async function main () {
  const { hook } = require(opts.file)
  const { info, stop: stopHook } = (hook && await hook(opts)) || {}

  await (opts.browser
    ? require('./exec-benchmark.browser.js')
    : require('./exec-benchmark.node.js')
  )({ ...opts, basename, hook: info })

  if (stopHook) await stopHook()
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1) })
