#!/usr/bin/env node
const fs = require('fs')
const { writeFile } = fs.promises
const path = require('path')
const util = require('util')
const { exec: stdExec, execSync } = require('child_process')
const exec = util.promisify(stdExec)
const { program } = require('commander')
const pkg = require('../package.json')
const BenchmarkerServer = require('./benchmarker.server.js')

process.on('SIGINT', function () {
  console.log('canceling benchmark/s')
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

const server = new BenchmarkerServer({ bPaths: benchmarkPaths, rPath, port }).create()
server.onResults = async function (results) {
  const parsed = JSON.parse(results)
  await writeFile(path.join(rPath, `${parsed.name}.json`), results)
}

async function runBenchmarks () {
  for (const b of benchmarkPaths) {
    await exec(`node ${path.join(__dirname, 'exec-benchmark.node.js')} -b ${b} -h ${host}`)
  }
}

runBenchmarks().then(() => {
  console.log('benchmark/s complete')
  process.exit(0)
})
