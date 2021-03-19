#!/usr/bin/env node
const path = require('path')
const BenchmarkerClient = require('./benchmarker.client.js')
const { program } = require('commander')
program
  .requiredOption('-b, --benchmark <path>', 'the benchmark file to run')
  .requiredOption('-h, --host <addr:port>', 'the address and port of the benchmarker server')
program.parse()

const opts = program.opts()

async function main () {
  try {
    const benchmarkPath = path.resolve(opts.benchmark)
    const benchmark = require(benchmarkPath)
    const benchmarker = await BenchmarkerClient.create(opts.host)
    benchmarker.log(`starting benchmark: ${path.basename(benchmarkPath)}`)
    try {
      await benchmark(benchmarker)
    } catch (e) {
      process.stderr.write('error during benchmark')
      process.stderr.write(e.toString())
    }
    await benchmarker.close()
    benchmarker.log(`benchmark complete: ${path.basename(benchmarkPath)}`)
  } catch (e) {
    process.stderr.write('benchmarker errored')
    process.stderr.write(e.toString())
  }
}

main().then(() => process.exit(0))
