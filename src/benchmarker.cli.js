#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const util = require('util')
const { exec: stdExec, execSync } = require('child_process')
const exec = util.promisify(stdExec)
const { program } = require('commander')
const pkg = require('../package.json')
const BenchmarkerServer = require('./benchmarker.server.js')

process.on('SIGINT', function () {
  process.stdout.write('canceling benchmark/s')
  process.exit(0)
})

program
  .version(pkg.version)
  .requiredOption('-b, --benchmark <path>', 'benchmark/s file or folder to run')
  .requiredOption('-r, --results <path>', 'where to make the results folder')
  .option('-p, --port <port number>', 'benchmark http service port', 7777)
  // .option('-b, --browser', 'run the benchmarks in the browser', false)

program.parse()
let { benchmark: bPath, results: rPath, port } = program.opts()
bPath = path.resolve(bPath)
rPath = path.resolve(rPath)
const host = `127.0.0.1:${port}`

const bPathExists = fs.existsSync(bPath)
if (!bPathExists) throw new Error('given benchmark path does not exit')
const rPathExists = fs.existsSync(rPath)
if (!rPathExists) fs.mkdirSync(rPath, { recursive: true })

const bPathIsDirectory = bPathExists && fs.lstatSync(bPath).isDirectory()
const benchmarkPaths = bPathIsDirectory
  ? execSync('ls *.benchmark.js', { cwd: bPath })
    .toString()
    .split('\n')
    .filter(a => a)
    .map(p => path.join(bPath, p))
  : [bPath]

BenchmarkerServer.create({ bPaths: benchmarkPaths, rPath, port })

async function runBenchmarks () {
  for (const b of benchmarkPaths) {
    const subprocess = exec(`node ${path.join(__dirname, 'exec-benchmark.node.js')} -b ${b} -h ${host}`)
    subprocess.child.stderr.on('data', (chunk) => process.stderr.write(chunk))
    await subprocess
  }
}

runBenchmarks().then(() => {
  process.stdout.write('benchmark/s complete')
  process.exit(0)
})
