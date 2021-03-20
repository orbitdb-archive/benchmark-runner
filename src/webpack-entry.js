'use strict'
module.exports = function ({ file, host, basename }) {
  const code =
`'use strict'
const BenchmarkerClient = require('./benchmarker.client.js')
const runBenchmark = require('./run-benchmark')
const benchmark = require('${file}')

async function main () {
  const benchmarker = await BenchmarkerClient.create('${host}')
  await runBenchmark(benchmarker, benchmark, '${basename}')
}
main().then(() => window.benchmarkerFinished())
`
  return { code }
}
