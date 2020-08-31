/* eslint-disable no-unused-expressions */

const yargs = require('yargs')
const cli = require('../src/cli')
const expect = require('chai').expect
const { start } = require('../src/index')

const benchmarks = require(process.cwd() + '/test/benchmarks')

describe('CLI Test', () => {
  it('should return help output', async () => {
    const parser = yargs.command(cli).help()
    const output = await new Promise((resolve) => {
      parser.parse('--help', (err, argv, output) => {
        if (err) throw new Error(err)

        resolve(output)
      })
    })
    expect(output).to.contain('baseline')
    expect(output).to.contain('report')
    expect(output).to.contain('list')
    expect(output).to.contain('grep')
    expect(output).to.contain('stressLimit')
    expect(output).to.contain('baselineLimit')
    expect(output).to.contain('logLimit')
  })

  describe('baseline', () => {
    it('should parse baseline value', () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli --baseline', {}
      )
      expect(yargsResult.baseline).to.be.true
      expect(yargsResult.b).to.be.true
    })

    it('should parse baseline value when using alias', () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli -b', {}
      )
      expect(yargsResult.baseline).to.be.true
      expect(yargsResult.b).to.be.true
    })

    it('should run a baseline test', async () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli --baseline', {}
      )

      await start(benchmarks, yargsResult)
    })
  })

  describe('report', function () {
    this.timeout(6000)

    it('should parse report value', () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli --report', {}
      )
      expect(yargsResult.report).to.be.true
      expect(yargsResult.r).to.be.true
    })

    it('should parse report value when using alias', () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli -r', {}
      )
      expect(yargsResult.report).to.be.true
      expect(yargsResult.r).to.be.true
    })

    it('should generate report', async () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli -r', {}
      )

      await start(benchmarks, yargsResult)
    })
  })

  describe('list', function () {
    it('should parse list value', () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli --list', {}
      )
      expect(yargsResult.list).to.be.true
      expect(yargsResult.l).to.be.true
    })

    it('should parse report value when using alias', () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli -l', {}
      )
      expect(yargsResult.list).to.be.true
      expect(yargsResult.l).to.be.true
    })

    it('should list benchmarks', async () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli -l', {}
      )

      await start(benchmarks, yargsResult)
    })
  })

  describe('grep', () => {
    it('should parse grep value', () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli --grep append-baseline', {}
      )
      expect(yargsResult.grep).to.equal('append-baseline')
      expect(yargsResult.g).to.equal('append-baseline')
    })

    it('should parse grep value when using alias', () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli -g append-baseline', {}
      )
      expect(yargsResult.grep).to.equal('append-baseline')
      expect(yargsResult.g).to.equal('append-baseline')
    })

    it('should show help msg when arg not passed to grep', async () => {
      const yargsCmd = yargs.command(cli)
      const output = await new Promise((resolve) => {
        yargsCmd.parse('cli -g', (_, argv, output) => {
          resolve(output)
        })
      })
      expect(output).to.contain('baseline')
      expect(output).to.contain('report')
      expect(output).to.contain('list')
      expect(output).to.contain('grep')
      expect(output).to.contain('stressLimit')
      expect(output).to.contain('baselineLimit')
      expect(output).to.contain('logLimit')
    })

    it('should properly apply grep value to benchmarks', async () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli --grep console-baseline', {}
      )

      await start(benchmarks, yargsResult)
    })
  })

  describe('stressLimit', function () {
    this.timeout(11000)

    it('should parse stressLimit value', () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli --stressLimit 10', {}
      )
      expect(yargsResult.stressLimit).to.equal(10)
    })

    it('should show help msg when arg not passed to stressLimit', async () => {
      const yargsCmd = yargs.command(cli)
      const output = await new Promise((resolve) => {
        yargsCmd.parse('cli --stressLimit', (_, argv, output) => {
          resolve(output)
        })
      })
      expect(output).to.contain('baseline')
      expect(output).to.contain('report')
      expect(output).to.contain('list')
      expect(output).to.contain('grep')
      expect(output).to.contain('stressLimit')
      expect(output).to.contain('baselineLimit')
      expect(output).to.contain('logLimit')
    })

    it('should apply stressLimit arg', async () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli --stressLimit 10', {}
      )

      await start(benchmarks, yargsResult)
    })
  })

  describe('baselineLimit', function () {
    this.timeout(6000)

    it('should parse baselineLimit value', () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli --baselineLimit 1000', {}
      )
      expect(yargsResult.baselineLimit).to.equal(1000)
    })

    it('should show help msg when arg not passed to baselineLimit', async () => {
      const yargsCmd = yargs.command(cli)
      const output = await new Promise((resolve) => {
        yargsCmd.parse('cli --baselineLimit', (_, argv, output) => {
          resolve(output)
        })
      })
      expect(output).to.contain('baseline')
      expect(output).to.contain('report')
      expect(output).to.contain('list')
      expect(output).to.contain('grep')
      expect(output).to.contain('stressLimit')
      expect(output).to.contain('baselineLimit')
      expect(output).to.contain('logLimit')
    })

    it('should apply baseLineLimit arg', async () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli --baselineLimit 1000', {}
      )

      await start(benchmarks, yargsResult)
    })
  })

  describe('logLimit', function () {
    this.timeout(6000)

    it('should parse logLimit value', () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli --logLimit 1000', {}
      )
      expect(yargsResult.logLimit).to.equal(1000)
    })

    it('should show help msg when arg not passed to logLimit', async () => {
      const yargsCmd = yargs.command(cli)
      const output = await new Promise((resolve) => {
        yargsCmd.parse('cli --logLimit', (_, argv, output) => {
          resolve(output)
        })
      })
      expect(output).to.contain('baseline')
      expect(output).to.contain('report')
      expect(output).to.contain('list')
      expect(output).to.contain('grep')
      expect(output).to.contain('stressLimit')
      expect(output).to.contain('baselineLimit')
      expect(output).to.contain('logLimit')
    })

    it('should apply logLimit arg', async () => {
      const yargsCmd = yargs.command(cli)
      const yargsResult = yargsCmd.parse(
        'cli --logLimit 50', {}
      )

      await start(benchmarks, yargsResult)
    })
  })
})
