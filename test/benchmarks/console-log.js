const base = {
  prepare: async function () {
  },
  cycle: async function () {
    const date = new Date() // eslint-disable-line
  },
  teardown: async function () {
  }
}

const baseline = {
  while: ({ stats, startTime, baselineLimit }) => {
    return stats.count < baselineLimit
  }
}

const stress = {
  while: ({ stats, startTime, stressLimit }) => {
    return process.hrtime(startTime)[0] < stressLimit
  }
}

module.exports = [
  { name: 'console-baseline', ...base, ...baseline },
  { name: 'console-stress', ...base, ...stress }
]
