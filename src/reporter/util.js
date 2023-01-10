const benchmarks = results => Object.keys(results)
const envs = results => benchmark => Object.keys(results[benchmark])
const getMetric = result => metric => {
  const metricIndex = result.metrics.indexOf(metric)
  return result.recorded.map(x => x[metricIndex])
}

export {
  benchmarks,
  envs,
  getMetric
}
