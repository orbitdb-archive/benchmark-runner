'use strict'
module.exports = async function (benchmarker, benchmark, basename) {
  benchmarker.setBenchmarkName(basename)
  benchmarker.log(`starting benchmark: ${basename}`)
  try {
    await benchmark(benchmarker)
  } catch (e) {
    benchmarker.log('error during benchmark')
    benchmarker.log(e.toString())
  }
  await benchmarker.close()
  benchmarker.log(`benchmark complete: ${basename}`)
}
