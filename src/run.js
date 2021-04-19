'use strict'
const BenchmarkerClient = require('./benchmarker/client.js')
// browser import
// const { benchmark } = require(%)

const runPlace = (place) =>
  async function (benchmarker, basename, placehold) {
    benchmarker.log(`starting ${place}: ${basename}`)
    try {
      benchmarker.log('benchmarking...')
      await placehold(benchmarker)
    } catch (e) {
      benchmarker.log(`error running ${place}`)
      benchmarker.log(e.toString())
    }
    benchmarker.log(`${place} complete: ${basename}`)
  }

async function run ({ host, file, basename, dir }) {
  // node import
  const { benchmark } = require(file)
  const benchmarker = await BenchmarkerClient.create(host, dir)
  benchmarker.setBenchmarkName(basename)
  // run benchmark
  await runPlace('benchmark')(benchmarker, basename, benchmark)
  await benchmarker.close()
}

module.exports = run
