#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { fork, execSync } = require('child_process')
const { program } = require('commander')
const pkg = require('../package.json')
const BenchmarkerServer = require('./benchmarker.server.js')

process.on('SIGINT', function () {
  process.stdout.write('canceling benchmark/s\n')
  process.exit(0)
})

program
  .version(pkg.version)
  .requiredOption('-b, --benchmark <path>', 'benchmark/s file or folder to run')
  .requiredOption('-r, --results <path>', 'where to make the results folder')
  .option('--browser', 'run the benchmarks in the browser', false)

program.parse()
let { benchmark: bPath, results: rPath, browser } = program.opts()
bPath = path.resolve(bPath)
rPath = path.resolve(rPath)

const bPathExists = fs.existsSync(bPath)
if (!bPathExists) throw new Error('given benchmark path does not exit')
const rPathExists = fs.existsSync(rPath)
if (!rPathExists) fs.mkdirSync(rPath, { recursive: true })

const bPathIsDirectory = bPathExists && fs.lstatSync(bPath).isDirectory()
const benchmarkPaths = bPathIsDirectory
  ? execSync('ls -1 *.benchmark.js', { cwd: bPath })
    .toString()
    .split('\n')
    .filter(a => a)
    .map(p => path.join(bPath, p))
  : [bPath]

const server = BenchmarkerServer.create({ bPaths: benchmarkPaths, rPath })

async function runBenchmarks () {
  const host = `127.0.0.1:${server.address().port}`
  for (const p of benchmarkPaths) {
    const subprocess = fork(
      path.join(__dirname, 'exec-benchmark.js'),
      [`-f${p}`, `-h${host}`, browser ? '--browser' : ''],
      { stdio: 'inherit' }
    )
    await new Promise(resolve => subprocess.on('exit', resolve))
  }
}

runBenchmarks().then(() => {
  process.stdout.write('benchmark/s complete\n')
  process.exit(0)
})
