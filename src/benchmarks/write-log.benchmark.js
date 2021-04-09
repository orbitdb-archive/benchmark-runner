'use strict'
const Ipfs = require('ipfs')
const OrbitDb = require('orbit-db')
const { ipfsOrbitDb, shutdown } = require('./util')
const height = 5000

const options = { replicate: false, overwrite: true }
const openLog = (orbitDb) => orbitDb.create('write-log', 'eventlog', options)

async function benchmark (benchmarker) {
  const [ipfs, orbitDb] = await ipfsOrbitDb(Ipfs, OrbitDb, benchmarker.fixtures)
  const log = await openLog(orbitDb)

  let i = 0
  let entries = 0
  benchmarker.addMetric({
    name: 'writes',
    get: () => i
  })
  benchmarker.addMetric({
    name: 'writes per second',
    get: () => {
      const perSecond = i - entries
      entries = i
      benchmarker.log(
`entries in last second:  ${perSecond}
entry height:            ${entries}
`
      )
      return perSecond
    }
  })

  benchmarker.startRecording()
  for (; i < height; i++) {
    await log.add(Date.now().toString(), { pin: false })
  }
  benchmarker.stopRecording()

  await shutdown(ipfs, orbitDb, log)
}

module.exports = {
  fixture: null,
  benchmark
}
