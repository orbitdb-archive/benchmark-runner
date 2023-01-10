import BenchmarkerClient from './benchmarker/client.js'
// browser import
// const { benchmark } = require(%)

export default async function ({ host, file, basename, dir, hook }) {
  // node import
  const { benchmark } = require(file)
  const benchmarker = await BenchmarkerClient.create(host, dir)
  benchmarker.setBenchmarkName(basename)
  if (hook) benchmarker.setHookInfo(hook)
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
