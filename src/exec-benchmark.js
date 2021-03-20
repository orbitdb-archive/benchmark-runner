#!/usr/bin/env node
const path = require('path')
const { program } = require('commander')
program
  .requiredOption('-f, --file <path>', 'the benchmark file to run')
  .requiredOption('-h, --host <addr:port>', 'the address and port of the benchmarker server')
  .option('--browser', 'run the benchmark in the browser', false)
program.parse()

const opts = program.opts()
const basename = path.basename(opts.file)

const main = opts.browser
  ? require('./exec-benchmark.browser.js')
  : require('./exec-benchmark.node.js')

main({ ...opts, basename }).then(() => process.exit(0))
