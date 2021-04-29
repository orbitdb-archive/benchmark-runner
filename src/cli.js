#!/usr/bin/env node
const path = require('path')
const net = require('net')
const { existsSync, statSync } = require('fs')
const reporter = require('./reporter')
const execBenchmarkPath = path.join(__dirname, 'exec-benchmark.js')

// program cli
const { program } = require('commander')
const { version } = require('../package.json')
program.version(version)
program
  // .option('-i, --ipfs <go or js>', 'ipfs implementation for orbitdb', 'js')
  .option('-b, --benchmarks <path>', 'benchmark folder or file', './benchmarks')
  .option('-o, --output <file path>', 'report output path (.html or .json)')
  .option('-i, --baselines <path>', 'baselines to use for comparison (.json output)')
  .option('--no-node', 'skip nodejs benchmarks')
  .option('--no-browser', 'skip browser benchmarks')
program.parse()

let { benchmarks, output, node, browser, baselines } = program.opts()

benchmarks = path.resolve(benchmarks)
if (!existsSync(benchmarks)) throw new Error(`benchmarks path does not exist: ${benchmarks}`)

if (output) output = path.resolve(output)
if (baselines) baselines = path.resolve(baselines)

const { mkdtempSync } = require('fs')
const os = require('os')
const tmpdir = mkdtempSync(path.join(os.tmpdir(), 'orbit-db-benchmark_'))

// get benchmark file paths
const { execSync } = require('child_process')
const benchmarkPaths = statSync(benchmarks).isDirectory()
  ? execSync('ls -1 *.benchmark.js', { cwd: benchmarks })
    .toString()
    .split('\n')
    .filter(a => a)
    .map(p => path.join(benchmarks, p))
  : [benchmarks]

// benchmarker server, collects logs and results
const benchmarkerServer = require('./benchmarker/server.js').create()

// webpack port; reuse same port for all benchmarks to keep IndexedDB same
let webpackPort = null
const getPort = () => new Promise((resolve, reject) => {
  const server = net.createServer()
  server.unref()
  server.on('error', reject)
  server.listen(0, () => {
    const { port } = server.address()
    server.close(() => resolve(port))
  })
})

// const getBenchmarkHook = require('./get-benchmark-hook')
const { Worker } = require('worker_threads')

async function execBenchmarks ({ browser } = {}) {
  const host = `127.0.0.1:${benchmarkerServer.address().port}`
  if (browser && !webpackPort) webpackPort = await getPort()
  const env = browser ? 'browser' : 'node'
  console.log(`running ${env} benchmark/s`)
  for (const p of benchmarkPaths) {
    const data = { host, file: p, browser, dir: tmpdir, webpackPort }
    const worker = new Worker(execBenchmarkPath, { workerData: data })
    await new Promise((resolve, reject) => worker.on('exit', resolve))
  }
  console.log(`${env} benchmark/s complete`)
}

async function main () {
  // run benchmarks
  if (node) await execBenchmarks()
  if (browser) await execBenchmarks({ browser })
  // write report
  const results = benchmarkerServer.results
  await reporter(output, results, baselines)
}

main().then(() => process.exit(0))
