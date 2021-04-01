#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { fork, execSync } = require('child_process')
const { program } = require('commander')
const pkg = require('../package.json')
const BenchmarkerServer = require('./benchmarker.server.js')
const defaultFixtures = path.join(require('os').tmpdir(), 'benchmarker-fixtures')

process.on('SIGINT', function () {
  console.log('canceling benchmark/s')
  process.exit(0)
})

program
  .version(pkg.version)
  .requiredOption('-b, --benchmark <path>', 'benchmark/s file or folder to run')
  .requiredOption('-r, --results <path>', 'where to make the results folder')
  .option('--browser', 'run the benchmarks in the browser', false)
  .option('--fixtures <path>', 'the path to benchmark fixtures directory', defaultFixtures)
program.parse()

let { benchmark: bPath, results: rPath, browser, fixtures: iPath } = program.opts()
bPath = path.resolve(bPath)
rPath = path.resolve(rPath)
iPath = path.resolve(iPath)

const bPathExists = fs.existsSync(bPath)
if (!bPathExists) throw new Error('given benchmark path does not exit')
const iPathExists = fs.existsSync(iPath)
if (!iPathExists) fs.mkdirSync(iPath, { recursive: true })

const bPathIsDirectory = bPathExists && fs.lstatSync(bPath).isDirectory()
const benchmarkPaths = bPathIsDirectory
  ? execSync('ls -1 *.benchmark.js', { cwd: bPath })
    .toString()
    .split('\n')
    .filter(a => a)
    .map(p => path.join(bPath, p))
  : [bPath]

async function runBenchmarks () {
  const server = BenchmarkerServer.create({ bPaths: benchmarkPaths, rPath })
  const host = `127.0.0.1:${server.address().port}`
  for (const p of benchmarkPaths) {
    const subprocess = fork(
      path.join(__dirname, 'exec-benchmark.js'),
      [`-f${p}`, `-h${host}`, browser ? '--browser' : '', `-i${iPath}`],
      { stdio: 'inherit' }
    )
    await new Promise(resolve => subprocess.on('exit', resolve))
  }
}

runBenchmarks().then(() => {
  console.log('benchmark/s complete')
  process.exit(0)
})
