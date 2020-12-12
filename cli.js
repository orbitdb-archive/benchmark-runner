#!/usr/bin/env node

require('expose-gc')

/* global process */
const os = require('os')
const fs = require('fs')
const yargs = require('yargs')
const argv = yargs
  .usage('IPFS Log benchmark runner\n\nUsage: node --expose-gc $0 [options]')
  .version(false)
  .help('help').alias('help', 'h')
  .options({
    baseline: {
      alias: 'b',
      description: 'Run baseline benchmarks only',
      boolean: true,
      requiresArg: false,
      required: false
    },
    report: {
      alias: 'r',
      description: 'Output report (Default: false)',
      requiresArg: false,
      boolean: true,
      required: false
    },
    list: {
      alias: 'l',
      description: 'List all benchmarks',
      requiresArg: false,
      required: false,
      boolean: true
    },
    grep: {
      alias: 'g',
      description: '<regexp> Regular expression used to match benchmarks (Default: /.*/)',
      requiresArg: true,
      required: false
    },
    stressLimit: {
      description: '<Int or Infinity> seconds to run a stress benchmark (Default: 300)',
      requiresArg: true,
      required: false
    },
    baselineLimit: {
      description: '<Int> benchmark cycle limit for baseline benchmarks (Default: 1000)',
      requiresArg: true,
      required: false
    },
    logLimit: {
      description: '<Int> max log size used for baseline benchmarks (inclusive) (Default: 10000)',
      requiresArg: true,
      required: false
    }
  })
  .example('$0 -r -g append-baseline', 'Run a single benchmark (append-baseline)')
  .example('$0 -r -g values-.*-baseline', 'Run all of the values baseline benchmarks')
  .argv

const BASELINE_GREP = /[\d\w-]*-baseline/
const DEFAULT_GREP = /.*/
const grep = argv.grep ? new RegExp(argv.grep) : DEFAULT_GREP
const stressLimit = argv.stressLimit || 300
const baselineLimit = argv.baselineLimit || 1000
const logLimit = argv.logLimit || 10000

const benchmarks = require(process.cwd() + '/benchmarks')
const report = require('./report')

if (argv.list) {
  benchmarks.forEach(b => console.log(b.name))
  process.exit()
}

const getElapsed = (time) => {
  return +time[0] * 1e9 + +time[1]
}

const rimraf = (path) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file, index) => {
      const curPath = `${path}/${file}`
      if (fs.lstatSync(curPath).isDirectory()) {
        rimraf(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

const runOne = async (benchmark) => {
  const stats = {
    count: 0
  }

  if (global.gc) {
    global.gc()
  }

  const memory = {
    before: process.memoryUsage()
  }

  process.stdout.write(`\r${benchmark.name} / Preparing`)
  const params = await benchmark.prepare()

  process.stdout.clearLine()
  const startTime = process.hrtime() // eventually convert to hrtime.bigint
  while (benchmark.while({ stats, startTime, stressLimit, baselineLimit })) {
    const elapsed = getElapsed(process.hrtime(startTime))
    const totalSeconds = (elapsed / 1000000000).toFixed(4)
    const opsPerSec = (stats.count / totalSeconds).toFixed(4)
    process.stdout.write(`\r${benchmark.name} / Cycles: ${stats.count} (${opsPerSec.toString()} ops/sec)`)
    await benchmark.cycle(params)
    stats.count++
  }

  const elapsed = getElapsed(process.hrtime(startTime))
  memory.after = process.memoryUsage()

  process.stdout.write(`\r${benchmark.name} / Finishing`)
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

const start = async () => {
  const results = []
  const baselineOnly = argv.baseline
  const runnerStartTime = process.hrtime()

  process.stdout.write(`Running ${baselineOnly ? 'baseline ' : ''}benchmarks matching: ${grep}`)
  process.stdout.write('\n')

  if (!global.gc) {
    console.warn('start with --expose-gc')
  }

  try {
    for (const benchmark of benchmarks) {
      if (baselineOnly && !BASELINE_GREP.test(benchmark.name)) {
        continue
      }

      if (!grep.test(benchmark.name)) {
        continue
      }

      if (benchmark.count && benchmark.count > logLimit) {
        continue
      }

      const result = await runOne(benchmark)
      results.push(result)
    }

    const runnerElapsed = getElapsed(process.hrtime(runnerStartTime))
    let output = `\rCompleted ${results.length} benchmark${results.length > 1 ? 's' : ''}`
    output += ` in ${(runnerElapsed / 1000000000).toFixed(2)} seconds`
    process.stdout.write(output)

    if (argv.report) {
      report(results)
    }
  } catch (e) {
    console.log(e)
  }

  // TODO: compare/delta to cached version
  rimraf('./ipfs-log-benchmarks')
}

start()
