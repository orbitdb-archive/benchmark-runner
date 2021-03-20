'use strict'
const BenchmarkerClient = require('./benchmarker.client.js')
const runBenchmark = require('./run-benchmark')

module.exports = async function ({ file, host, basename }) {
  const benchmarker = await BenchmarkerClient.create(host)
  const benchmark = require(file)
  await runBenchmark(benchmarker, benchmark, basename)
}
