#!/usr/bin/env node
const path = require('path')
const { program } = require('commander')
const BenchmarkerClient = require('./benchmarker.http-client.js')
program
  .requiredOption('-b, --benchmark <path>', 'the benchmark file to run')
  .requiredOption('-u, --url <url>', 'the benchmarker server url')
program.parse()

const opts = program.opts()

async function main () {
  const benchmark = require(path.resolve(opts.benchmark))
  const benchmarker = new BenchmarkerClient(opts.url)
  await benchmark(benchmarker)
}

main().then(() => process.exit(0))
