'use strict'
const { benchmarks, envs, getMetric } = require('./util')
const processMetric = (nums, elapsed) => {
  let total = 0
  let max = 0
  for (const n of nums) {
    total += n
    if (max < n) max = n
  }
  return { max: max, avg: (total / elapsed) }
}
const getLabel = (key) => {
  if (key.includes('time')) return ' seconds'
  if (key.includes('heap')) return ' mb'
  return ''
}

module.exports = (results, baselines) => benchmarks(results)
  .flatMap(b => envs(results)(b).map(e => [b, e]))
  .forEach(([b, e]) => {
    const result = results[b][e]
    const baseline = baselines && baselines[b] && baselines[b][e]
    const elapsed = getMetric(result)('time').pop() / 1000
    result.processed = {
      time: elapsed,
      ...result.metrics
        .filter(m => m !== 'time')
        .reduce((o, m) => {
          const { max, avg } = processMetric(getMetric(result)(m), elapsed)
          return { ...o, [m]: { max, avg } }
        }, {})
    }
    console.log(result.processed)
    result.stats = [
      ['elapsed time:', `${elapsed} seconds`],
      ...Object.keys(result.processed)
        .filter(m => m !== 'time')
        .flatMap(m =>
          Object.keys(result.processed[m]).map(p => {
            const pro = result.processed[m][p]
            const columns = [`${p} ${m}: `, `${pro.toFixed(2)}${getLabel(m)}`]
            if (baseline && baseline.processed[m] && baseline.processed[m][p]) {
              const basePro = baseline.processed[m][p]
              const change = (pro / basePro - 1) * 100
              columns.push(`${change >= 0 ? '+' : ''}${change.toFixed(2)}%`)
            }
            return columns
          })
        )
    ]
  })
