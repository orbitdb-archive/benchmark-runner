'use strict'
const benchmarks = results => Object.keys(results)
const envs = results => benchmark => Object.keys(results[benchmark])
const getMetric = result => metric => {
  const metricIndex = result.metrics.indexOf(metric)
  return result.recorded.map(x => x[metricIndex])
}

module.exports = {
  benchmarks,
  envs,
  getMetric
}
