'use strict'
const BenchmarkerClient = require('./benchmarker/client.js')
// browser import
// const { benchmark } = require(%)

async function run ({ host, file, basename, dir }) {
  // node import
  const { benchmark } = require(file)
  const benchmarker = await BenchmarkerClient.create(host, dir)
  benchmarker.setBenchmarkName(basename)
  // run benchmark
  benchmarker.log(`starting benchmark: ${basename}`)
  try {
    benchmarker.log('benchmarking...')
    await benchmark(benchmarker)
  } catch (e) {
    benchmarker.log(`error running benchmark: ${basename}`)
    benchmarker.log(e.toString())
  }
  benchmarker.log(`benchmark complete: ${basename}`)
  await benchmarker.close()
}

module.exports = run
