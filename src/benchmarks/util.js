'use strict'
async function ipfsOrbitDb (Ipfs, OrbitDb, fixturesPath) {
  const ipfs = await Ipfs.create({ repo: fixturesPath + '/ipfs' })
  const orbitDb = await OrbitDb.createInstance(ipfs, { directory: fixturesPath + '/orbitDb' })
  return [ipfs, orbitDb]
}

async function shutdown (ipfs, orbitDb, db) {
  if (db) await db.drop()
  await orbitDb.stop()
  await ipfs.stop()
}

module.exports = {
  ipfsOrbitDb,
  shutdown
}
