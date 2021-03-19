'use strict'
const path = require('path')

module.exports = async function (BenchmarkerClient, { file, host }) {
  try {
    const benchmarkPath = path.resolve(file)
    const benchmark = require(benchmarkPath)
    const benchmarker = await BenchmarkerClient.create(host)
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
