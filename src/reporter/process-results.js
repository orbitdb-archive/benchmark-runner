import { benchmarks, envs, getMetric } from './util.js'
const processMetric = (nums) => {
  let total = 0
  let max = 0
  for (const n of nums) {
    total += n
    if (max < n) max = n
  }
  return { max: max, avg: (total / nums.length) }
}
const percent = (numerator, denominator) => {
  const number = (numerator / denominator - 1) * 100
  const sign = number >= 0 ? '+' : '-'
  return `${sign}${Math.abs(number.toFixed(2))}%`
}

// for each benchmark result in each environment, add .processed and .stats properties
export default (results, baselines) => benchmarks(results)
  .flatMap(b => envs(results)(b).map(e => [b, e]))
  .forEach(([b, e]) => {
    // get the benchmark result for benchmark b and environment e
    const result = results[b][e]
    // true if a baseline for this benchmark and environment exists
    const baseline = baselines && baselines[b] && baselines[b][e]
    // elapsed time of benchmark in seconds
    result.elapsed = getMetric(result)('time').pop() / 1000
    // the processed property contains the max/avg of all metrics besides time
    result.processed = {
      ...result.metrics
        .filter(m => m !== 'time')
        .reduce((o, m) => {
          const { max, avg } = processMetric(getMetric(result)(m))
          return { ...o, [m]: { max, avg } }
        }, {})
    }
    // the stats property uses the processed property to make arrays used for displaying results as text
    // e.g.: result.stats = [['<metric name>:', '<metric value>'], ...]; if a baseline was provided a '<metric change>' will be appended
    const timeStat = ['elapsed time: ', `${result.elapsed} seconds`]
    if (baseline && baseline.elapsed) {
      timeStat.push(percent(result.elapsed, baseline.elapsed))
    }
    result.stats = [
      timeStat,
      ...Object.keys(result.processed)
        .flatMap(m =>
          // split max and avg metric results into their own metrics for display
          Object.keys(result.processed[m]).map(p => {
            // metric value of metric m and processed p, p is 'max' or 'avg' in this case
            const pro = result.processed[m][p]
            const label = m.includes('heap') ? ' mb' : ''
            // metric name and value
            const columns = [`${p} ${m}: `, `${pro.toFixed(2)}${label}`]
            // append metric change if baseline provided
            if (baseline && baseline.processed[m] && baseline.processed[m][p]) {
              columns.push(percent(pro, baseline.processed[m][p]))
            }
            return columns
          })
        )
    ]
  })
