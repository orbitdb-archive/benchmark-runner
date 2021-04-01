'use strict'
const BenchmarkerClient = require('./benchmarker.client.js')
const runBenchmark = require('./run-benchmark')

module.exports = async function ({ file, host, basename, fixtures }) {
  const benchmarker = await BenchmarkerClient.create(host, fixtures)
  const { fixture, benchmark } = require(file)
  await runBenchmark(benchmarker, benchmark, basename)
}
