'use strict'
const { makeId, withId, creators } = require('./ws-action')
const isNode = require('is-node')
const getWebSocket = () => isNode
  ? require('ws')
  : window.WebSocket

const timeMetric = {
  name: 'time',
  get: () => Date.now()
}
const cpuMetric = {
  name: 'cpu',
  get: () => {
    const cpuUsage = process.cpuUsage()
    return Math.round((cpuUsage.user + cpuUsage.system) / 1000)
  }
}
const memoryMetric = {
  name: 'memory',
  get: () => {
    const memorySample = isNode
      ? process.memoryUsage()
      : window.performance.memory
    const memory = {
      total: null,
      used: null
    }
    if (isNode) {
      memory.total = memorySample.heapTotal
      memory.used = memorySample.heapUsed
    } else {
      memory.total = memorySample.totalJSHeapSize
      memory.used = memorySample.usedJSHeapSize
    }
    return memory
  }
}

class Benchmarker {
  constructor (host, ws) {
    this._host = host
    this.id = makeId()
    this.info = {
      name: `benchmark-${this.id}`,
      env: isNode ? 'node' : 'web',
      metrics: []
    }
    this.interval = 1000 // record metrics every this many ms

    this.metrics = [
      timeMetric,
      memoryMetric
    ]
    if (isNode) this.addMetric(cpuMetric)

    this._ws = ws
    this._timeout = null
  }

  static async create (host) {
    const ws = await new Promise(resolve => {
      const ws = new (getWebSocket())(`ws://${host}`)
      ws.onopen = () => resolve(ws)
    })
    return new Benchmarker(host, ws)
  }

  async close () {
    if (this._ws.readyState !== 3) {
      await new Promise(resolve => {
        this._ws.onclose = () => resolve()
        this._ws.close()
      })
    }
  }

  addMetric ({ name, get }) {
    if (this.info.metrics.includes(name)) {
      throw new Error('a metric with that name already exists')
    }
    if (this._timeout) {
      throw new Error('metrics have already started being recorded')
    }
    this.metrics.push({ name, get })
    this.info.metrics = this.metrics.map(m => m.name)
  }

  setInterval (interval) {
    if (typeof interval !== 'number') {
      throw new Error('interval must be a number')
    }
    if (this._timeout) {
      throw new Error('metrics have already started being recorded')
    }
    this.interval = interval
  }

  setBenchmarkName (name) {
    this.info.name = name.toString()
  }

  _sendAction (action) {
    this._ws.send(JSON.stringify(withId(this.id, action)))
  }

  log (msg) {
    this._sendAction(creators.LOG(msg))
  }

  _recordMetrics () {
    this._sendAction(creators.SEGMENT(this.metrics.map(({ get }) => get())))
  }

  startRecording () {
    if (!this._timeout) {
      this._sendAction(creators.INFO(this.info))
      const repeater = () => {
        this._recordMetrics()
        this._timeout = setTimeout(repeater.bind(this), this.interval)
      }
      repeater()
    }
  }

  stopRecording () {
    clearTimeout(this._timeout)
    this._timeout = null
    this._recordMetrics()
    this._sendAction(creators.STOP())
  }
}

module.exports = Benchmarker
