#!/usr/bin/env node
const path = require('path')
const reporter = require('./reporter')
const benchmarksDir = path.join(__dirname, './benchmarks')
const reportsDir = path.join(__dirname, '../reports')
const defaultOutputPath = path.join(reportsDir, 'benchmark-report.html')
const execBenchmarkPath = path.join(__dirname, 'exec-benchmark.js')

// program cli
const { program } = require('commander')
const { version } = require('../package.json')
program.version(version)
program
  // .option('-i, --ipfs <go or js>', 'ipfs implementation for orbitdb', 'js')
  .option('-o, --output [file path]', 'report output path (.html or .json)', defaultOutputPath)
  .option('--no-output', 'no output file')
  .option('--no-node', 'skip benchmarks in nodejs')
  .option('--no-browser', 'skip benchmarks in the browser')
  .option('-b, --baselines <path>', 'baselines to use for comparison')
program.parse()

let { output, node, browser, baselines } = program.opts()

// output stays true if no path is in arg
if (output !== false) {
  output = output === path.basename(output)
    ? path.join(reportsDir, output)
    : path.resolve(output)
}
if (baselines) baselines = path.resolve(baselines)

const { mkdtempSync } = require('fs')
const os = require('os')
const tmpdir = mkdtempSync(path.join(os.tmpdir(), 'orbit-db-benchmark_'))

// get benchmark file paths
const { execSync } = require('child_process')
const benchmarkPaths = execSync('ls -1 *.benchmark.js', { cwd: benchmarksDir })
  .toString()
  .split('\n')
  .filter(a => a)
  .map(p => path.join(benchmarksDir, p))

// benchmarker server, collects logs and results
const server = require('./benchmarker/server.js').create()

// const getBenchmarkHook = require('./get-benchmark-hook')
const { Worker } = require('worker_threads')

async function execBenchmarks (browser) {
  const env = browser ? 'browser' : 'node'
  const host = `127.0.0.1:${server.address().port}`
  console.log(`running ${env} benchmark/s`)
  for (const p of benchmarkPaths) {
    const data = { host, file: p, browser, dir: tmpdir }
    const worker = new Worker(execBenchmarkPath, { workerData: data })
    await new Promise((resolve, reject) => worker.on('exit', resolve))
  }
  console.log(`${env} benchmark/s complete`)
}

async function main () {
  // run benchmarks
  if (node) await execBenchmarks(false)
  if (browser) await execBenchmarks(true)
  // write report
  const results = server.results
  await reporter(output, results, baselines)
}

main().then(() => process.exit(0))
