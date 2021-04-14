'use strict'
const Ipfs = require('ipfs')
const OrbitDb = require('orbit-db')
const { ipfsOrbitDb, shutdown } = require('./util')

const options = { replicate: false, overwrite: true }
const openLog = async (orbitDb, name, opts = options) => {
  const address = await orbitDb.determineAddress(name, 'eventlog', opts)
  return orbitDb.open(address, opts)
}

async function benchmark (benchmarker) {
  const [ipfs, orbitDb] = await ipfsOrbitDb(Ipfs, OrbitDb, benchmarker.dir)
  const log = await openLog(orbitDb, 'log', { ...options, overwrite: false })

  let i = 0
  let entries = 0
  benchmarker.addMetric({
    name: 'loaded entries',
    get: () => { i = i + log._oplog.length; return i }
  })
  benchmarker.addMetric({
    name: 'loaded entries per second',
    get: () => {
      const perSecond = i - entries
      entries = i
      benchmarker.log(
`entries loaded in last second:  ${perSecond}
entries loaded:                 ${entries}
`
      )
      return perSecond
    }
  })

  benchmarker.startRecording()
  await log.load()
  benchmarker.stopRecording()

  await shutdown(ipfs, orbitDb, log)
}

module.exports = {
  // fixture,
  benchmark
}
