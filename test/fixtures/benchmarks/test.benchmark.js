'use strict'
module.exports = {
  benchmark: async function (benchmarker) {
    // a time metric is automatically recorded

    benchmarker.trackMemory() // tracks memory usage
    benchmarker.trackCpu() // only records the metric when running in node

    /*
      use benchmarker.addMetric when you want to track a unique metric.
      as you can see metrics are an object with a name and a get method.
      the name is used for reference and displaying the metric data.
      the get method returns what value to record for that interval sample.
    */
    let i = 0
    benchmarker.addMetric({
      name: 'increment',
      get: () => i++
    })

    // sets the interval to record samples on metrics (default: 1000 aka 1 second)
    benchmarker.setInterval(1000)

    benchmarker.startRecording()
    // run only what you want to benchmark here
    benchmarker.stopRecording()
  },
  /**
   * hook - used to set up external systems for the benchmark. hook methods are ran in a nodejs env by the runner.
   *
   * @param {string} host the address:port of the benchmarker server
   * @param {string} file the path of the benchmark file to be ran
   * @param {bool} browser is the benchmark environment the browser
   * @param {string} dir the path of the tmpdir used by the benchmarker
   *
   * @return {object} contains two optional properties. 'info' which is passed to the benchmarker at benchmarker.info.hook, and 'stop' which is ran after the benchmark and used to cleanup the hook.
   */
  hook: async function ({ host, file, browser, dir }) {
    const path = require('path')

    // hooks can return an object for the runner to use
    return {
      info: path.join(__dirname, 'example'), // info to be passed to the benchmarker
      stop: async () => {} // for the runner to cleanup the hook
    }
  }
}
