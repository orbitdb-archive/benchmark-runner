'use strict'
const assert = require('assert')
const path = require('path')
const { exec } = require('child_process')
const cli = path.resolve(__dirname, '../src/cli.js')
const benchmarks = path.resolve(__dirname, 'fixtures/benchmarks')
const benchmark = path.resolve(__dirname, 'fixtures/benchmarks/test.benchmark.js')

const execOptions = { cwd: path.join(__dirname, 'fixtures') }
const execCallback = (error, stdout, stderr) => {
  if (error) {
    console.error(error)
  }
  console.error(stderr)
}
const handleSubprocess = (cmd, options = execOptions, cb = execCallback) =>
  new Promise((resolve, reject) => {
    const subprocess = exec(cmd, options, cb)
    subprocess.once('exit', (code) => code !== 0 ? reject(code) : resolve())
    subprocess.once('error', (e) => { console.error(e); reject(e) })
  })

describe('benchmarker cli', function () {
  it('default options', async function () {
    await assert.doesNotReject(() =>
      handleSubprocess(`node ${cli}`)
    )
  })

  it('benchmarks at dir path', async function () {
    await assert.doesNotReject(() =>
      handleSubprocess(`node ${cli} -b ${benchmarks}`)
    )
  })

  it('benchmark at file path', async function () {
    await assert.doesNotReject(() =>
      handleSubprocess(`node ${cli} -b ${benchmark}`)
    )
  })

  it('writes .json output', async function () {
    await assert.doesNotReject(() =>
      handleSubprocess(`node ${cli} -o ./report.json`)
    )
  })

  it('writes .html output', async function () {
    await assert.doesNotReject(() =>
      handleSubprocess(`node ${cli} -o ./report.html`)
    )
  })

  it('compare baselines', async function () {
    await handleSubprocess(`node ${cli} -i ./report.fixture.json`)
  })

  it('no node benchmarks', async function () {
    await assert.doesNotReject(() =>
      handleSubprocess(`node ${cli} --no-node`)
    )
  })

  it('no browser benchmarks', async function () {
    await assert.doesNotReject(() =>
      handleSubprocess(`node ${cli} --no-browser`)
    )
  })

  it('fails with non-existing benchmarks path', async function () {
    await assert.rejects(() =>
      handleSubprocess(`node ${cli} -b ./no-exist-path`)
    )
  })

  it('fails with non-existing baselines path', async function () {
    await assert.rejects(() =>
      handleSubprocess(`node ${cli} -i ./no-exist-path`)
    )
  })
})
