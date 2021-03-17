#!/usr/bin/env node
const path = require('path')
const { program } = require('commander')
const BenchmarkerClient = require('./benchmarker.http-client.js')
program
  .requiredOption('-f, --benchmark', 'the benchmark file to run')
  .requireOptions('-u, --url', 'the benchmarker server url')
program.parse()

async function main () {
  const benchmark = require(path.resolve(program.benchmark))
  const benchmarker = new BenchmarkerClient(program.url)
  await benchmark(benchmarker)
}

main().then(() => process.exit(0))
