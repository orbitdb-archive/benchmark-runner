/* eslint-disable no-unused-expressions */

const yargs = require('yargs')
const path = require('path')
const fs = require('fs-extra')
const cli = require('../src/cli')
const expect = require('chai').expect
const { start } = require('../src/index')

const benchmarks = require(process.cwd() + '/test/benchmarks')

describe('CLI Save', function () {
  this.timeout(6000)

  it('should save results to file', async () => {
    const yargsCmd = yargs.command(cli)
    const tmpFile = path.join(__dirname, 'tmp/benchmark.json')
    const yargsResult = yargsCmd.parse(
      `cli --baseline -s ${tmpFile}`, {}
    )

    await start(benchmarks, yargsResult)

    const results = fs.readJsonSync(tmpFile)
    expect(results).to.be.an('array')
    expect(results.length).to.be.equal(1)

    const benchmark = results[0]
    expect(benchmark).to.have.property('name')
    expect(benchmark).to.have.property('cpus')
    expect(benchmark).to.have.property('loadavg')
    expect(benchmark).to.have.property('elapsed')
    expect(benchmark).to.have.property('stats')
    expect(benchmark).to.have.property('memory')

    expect(benchmark.name).to.be.equal('console-baseline')
    expect(benchmark.memory).to.have.property('before')
    expect(benchmark.memory).to.have.property('after')
    expect(benchmark.stats).to.have.property('count')
  })
})
