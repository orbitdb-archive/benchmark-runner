#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { program } = require('commander')
const pkg = require('../package.json')
const BenchmarkerServer = require('./benchmarker.http-server.js')

process.on('SIGINT', function () {
  console.log('canceling benchmark/s')
  process.exit(0)
})

program
  .version(pkg.version)
  .requiredOption('-b, --benchmark', 'benchmark/s file or folder to run')
  .requiredOption('-r, --results', 'where to write the results file')
  .option('-p, --port', 'benchmark http service port', 7777)
  // .option('-b, --browser', 'run the benchmarks in the browser', false)

program.parse()
let { benchmark: bPath, results: rPath, port } = program.opts()
bPath = path.resolve(bPath)
rPath = path.resolve(rPath)
const url = `http://127.0.0.1:${program.port}`

const bPathExists = fs.existsSync(bPath)
if (!bPathExists) throw new Error('given benchmark path does not exit')

const bPathIsDirectory = bPathExists && fs.lstatSync(bPath).isDirectory()
const benchmarkPaths = bPathIsDirectory
  ? execSync('ls *.benchmark.js', { cwd: bPath })
    .split('\n')
    .filter(a => a)
  : [bPath]

const server = new BenchmarkerServer({ bPaths: benchmarkPaths, rPath, port }).create()
server.onResults = function (results) {
  console.log(results)
}

for (const b of benchmarkPaths) {
  execSync(`node ${path.join(__dirname, 'exec-benchmark.node.js')} -b ${b} -u ${url}`)
}

console.log('benchmark/s complete')
process.exit(0)
