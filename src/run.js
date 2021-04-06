'use strict'
const BenchmarkerClient = require('./benchmarker/client.js')
// browser import
// const { fixture, benchmark } = require(%)

const runPlace = (place) =>
  async function (benchmarker, basename, placehold) {
    benchmarker.log(`starting ${place}: ${basename}`)
    try {
      await placehold(benchmarker)
    } catch (e) {
      benchmarker.log(`error running ${place}`)
      benchmarker.log(e.toString())
    }
    benchmarker.log(`${place} complete: ${basename}`)
  }

async function run ({ host, file, basename, onlyFixtures, existFixtures, fixtures }) {
  // node import
  const { fixture, benchmark } = require(file)
  const benchmarker = await BenchmarkerClient.create(host, fixtures)
  benchmarker.setBenchmarkName(basename)
  // run fixture
  if (fixture && (onlyFixtures || !existFixtures)) {
    await runPlace('fixture')(benchmarker, basename, fixture)
  }
  // run benchmark
  if (!onlyFixtures) {
    await runPlace('benchmark')(benchmarker, basename, benchmark)
  }
  await benchmarker.close()
}

module.exports = run
