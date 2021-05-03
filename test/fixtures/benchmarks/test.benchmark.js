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
  }
}
