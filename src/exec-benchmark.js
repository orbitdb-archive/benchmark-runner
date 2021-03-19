#!/usr/bin/env node
const BenchmarkerClient = require('./benchmarker.client.js')
const execBenchmarkNode = require('./exec-benchmark.node.js')
const execBenchmarkBrowser = require('./exec-benchmark.browser.js')
const { program } = require('commander')
program
  .requiredOption('-f, --file <path>', 'the benchmark file to run')
  .requiredOption('-h, --host <addr:port>', 'the address and port of the benchmarker server')
  .option('-b, --browser', 'run the benchmark in the browser', false)
program.parse()

const opts = program.opts()

let main
if (opts.browser) {
  main = execBenchmarkBrowser
} else {
  main = execBenchmarkNode
}

main(BenchmarkerClient, opts).then(() => process.exit(0))
