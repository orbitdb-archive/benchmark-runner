#!/usr/bin/env node
import path from 'path'
import { workerData as opts } from 'worker_threads'
const basename = path.basename(opts.file)

export default async function main () {
  const { hook } = await import(opts.file)
  const { info, stop: stopHook } = (hook && await hook(opts)) || {}

  await (opts.browser
    ? await import('./exec-benchmark.browser.js')
    : await import('./exec-benchmark.node.js')
  )({ ...opts, basename, hook: info })

  if (stopHook) await stopHook()
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1) })
