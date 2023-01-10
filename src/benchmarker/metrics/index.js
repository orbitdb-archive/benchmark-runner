import isNode from 'is-node'
const useMetricState = (state, get) => () => {
  const { newState, next } = get(state)
  state = newState
  return next
}

const timeMetric = {
  name: 'time',
  get: useMetricState(0, (state) => {
    const now = Date.now()
    return {
      newState: state || now,
      next: now - (state || now) // on first metric sample: now - now, aka 0
    }
  })
}

const ns2ms = (ms) => ms / 1000
const cpuUsageMetric = {
  name: 'cpu usage',
  get: useMetricState(undefined, (state) => {
    const time = Date.now()
    const { user, system } = process.cpuUsage()
    const total = ns2ms(user) + ns2ms(system)
    return {
      newState: { total, time },
      next: state
        // cpu usage to percent
        ? Math.round(100 * ((total - state.total) / (time - state.time)))
        : 0
    }
  })
}

const memorySample = () => {
  const sample = isNode
    ? process.memoryUsage()
    : window.performance.memory
  const memory = {
    total: null,
    used: null
  }
  // denominated in bytes
  if (isNode) {
    memory.total = sample.heapTotal
    memory.used = sample.heapUsed
  } else {
    memory.total = sample.totalJSHeapSize
    memory.used = sample.usedJSHeapSize
  }
  return memory
}
const toMegabytes = (bytes) => bytes / 1000000
const memoryUsedMetric = {
  name: 'heap used',
  get: () => toMegabytes(memorySample().used)
}
const memoryTotalMetric = {
  name: 'heap total',
  get: () => toMegabytes(memorySample().total)
}

export {
  useMetricState,
  timeMetric,
  cpuUsageMetric,
  memoryUsedMetric,
  memoryTotalMetric
}
