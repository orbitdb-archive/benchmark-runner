#!/usr/bin/env node

/* global process */
const { start } = require('./index')

const yargs = require('yargs')
const argv = yargs
  .usage('OrbitDB benchmark runner\n\nUsage: node --expose-gc $0 [options]')
  .version(false)
  .help('help').alias('help', 'h')
  .options({
    baseline: {
      alias: 'b',
      description: 'Run baseline benchmarks only',
      boolean: true,
      requiresArg: false,
      required: false
    },
    report: {
      alias: 'r',
      description: 'Output report (Default: false)',
      requiresArg: false,
      boolean: true,
      required: false
    },
    list: {
      alias: 'l',
      description: 'List all benchmarks',
      requiresArg: false,
      required: false,
      boolean: true
    },
    grep: {
      alias: 'g',
      description: '<regexp> Regular expression used to match benchmarks (Default: /.*/)',
      requiresArg: true,
      required: false
    },
    stressLimit: {
      description: '<Int or Infinity> seconds to run a stress benchmark (Default: 300)',
      requiresArg: true,
      required: false
    },
    baselineLimit: {
      description: '<Int> benchmark cycle limit for baseline benchmarks (Default: 1000)',
      requiresArg: true,
      required: false
    },
    logLimit: {
      description: '<Int> max log size used for baseline benchmarks (inclusive) (Default: 10000)',
      requiresArg: true,
      required: false
    }
  })
  .example('$0 -r -g append-baseline', 'Run a single benchmark (append-baseline)')
  .example('$0 -r -g values-.*-baseline', 'Run all of the values baseline benchmarks')
  .argv

// Was this called directly from the CLI?
// For mocha tests - maybe we can mitigate this but for now it works
if (require.main === module) {
  try {
    const benchmarks = require(process.cwd() + '/benchmarks')
    start(benchmarks, argv)
  } catch (e) {
    throw new Error(e.message)
  }
}
