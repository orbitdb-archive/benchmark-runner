'use strict'
module.exports = function ({ file, host, basename, fixtures }) {
  const code =
`'use strict'
const BenchmarkerClient = require('./benchmarker.client.js')
const runBenchmark = require('./run-benchmark')
const { fixture, benchmark } = require('${file}')

async function main () {
  const benchmarker = await BenchmarkerClient.create('${host}', '${fixtures}')
  await runBenchmark(benchmarker, benchmark, '${basename}')
}
main().then(() => window.benchmarkerFinished())
`
  return { code }
}
