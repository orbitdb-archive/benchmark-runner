/* eslint-disable no-unused-expressions */

const yargs = require('yargs')
const path = require('path')
const fs = require('fs-extra')
const cli = require('../src/cli')
const expect = require('chai').expect
const { start } = require('../src/index')

const benchmarks = require(process.cwd() + '/test/benchmarks')

describe('CLI Compare', function () {
  this.timeout(6000)

  it('should compare results to file', async () => {
    const yargsCmd = yargs.command(cli)
    const tmpFile = path.join(__dirname, 'tmp/benchmark.json')
    const yargsResult1 = yargsCmd.parse(
      `cli --baseline -s ${tmpFile}`, {}
    )

    await start(benchmarks, yargsResult1)

    const yargsResult2 = yargsCmd.parse(
      `cli --baseline -r -c ${tmpFile}`, {}
    )
    await start(benchmarks, yargsResult2)

    // TODO - test reporter output
  })
})
