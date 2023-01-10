#!/usr/bin/env node
import path from 'path'
import { workerData as opts } from 'worker_threads'
import BrowserBenchmark from './exec-benchmark.browser.js'
import NodeBenchmark from './exec-benchmark.node.js'

const basename = path.basename(opts.file)

export default async function main () {
  const { hook } = await import(opts.file)
  const { info, stop: stopHook } = (hook && await hook(opts)) || {}

  await (opts.browser ? BrowserBenchmark : NodeBenchmark
  )({ ...opts, basename, hook: info })

  if (stopHook) await stopHook()
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1) })
