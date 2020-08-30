const fs = require('fs')
const os = require('os')


const report = require('./report')

const BASELINE_GREP = /[\d\w-]*-baseline/
const DEFAULT_GREP = /.*/

// TODO: Remove all OS-specific bindings here
const start = async (benchmarks, argv) => {
  if (argv.list) {
    benchmarks.forEach(b => console.log(b.name))
    return
  }

  const grep = argv.grep ? new RegExp(argv.grep) : DEFAULT_GREP
  const stressLimit = argv.stressLimit || 5
  const logLimit = argv.logLimit || 10000
  const baselineLimit = argv.baselineLimit || 1000
  const results = []
  const baselineOnly = argv.baseline
  const runnerStartTime = process.hrtime()

  // process.stdout.write(`Running ${baselineOnly ? 'baseline ' : ''}benchmarks matching: ${grep}`)
  // process.stdout.write('\n')

  if (!global.gc) {
    console.warn('start with --expose-gc')
  }

  try {
    for (const benchmark of benchmarks) {
      benchmark.stressLimit = stressLimit
      benchmark.baselineLimit = baselineLimit

      if (baselineOnly && !BASELINE_GREP.test(benchmark.name)) {
        continue
      }

      if (!grep.test(benchmark.name)) {
        continue
      }

      console.log(benchmark.count)
      if (benchmark.count && benchmark.count > logLimit) {
        continue
      }

      const result = await runOne(benchmark)
      results.push(result)
    }

    const runnerElapsed = getElapsed(process.hrtime(runnerStartTime))
    let output = `\rCompleted ${results.length} benchmark${results.length > 1 ? 's' : ''}`
    output += ` in ${(runnerElapsed / 1000000000).toFixed(2)} seconds`
    // process.stdout.write(output)

    if (argv.report) {
      report(results)
    }
  } catch (e) {
    console.log(e)
  }
}

const getElapsed = (time) => {
  return +time[0] * 1e9 + +time[1]
}

const runOne = async (benchmark) => {
  const { stressLimit, baselineLimit } = benchmark

  const stats = {
    count: 0
  }

  if (global.gc) {
    global.gc()
  }

  const memory = {
    before: process.memoryUsage()
  }

  // process.stdout.write(`\r${benchmark.name} / Preparing`)
  const params = await benchmark.prepare()

  process.stdout.clearLine()
  const startTime = process.hrtime() // eventually convert to hrtime.bigint
  while (benchmark.while({ stats, startTime, stressLimit, baselineLimit })) {
    const elapsed = getElapsed(process.hrtime(startTime))
    const totalSeconds = (elapsed / 1000000000).toFixed(4)
    const opsPerSec = (stats.count / totalSeconds).toFixed(4)
    // process.stdout.write(`\r${benchmark.name} / Cycles: ${stats.count} (${opsPerSec.toString()} ops/sec)`)
    await benchmark.cycle(params)
    stats.count++
  }

  const elapsed = getElapsed(process.hrtime(startTime))
  memory.after = process.memoryUsage()

  // process.stdout.write(`\r${benchmark.name} / Finishing`)
  await benchmark.teardown(params)
  process.stdout.clearLine()

  return {
    name: benchmark.name,
    cpus: os.cpus(),
    loadavg: os.loadavg(),
    elapsed,
    stats,
    memory
  }
}

module.exports = {
  start
}
