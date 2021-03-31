'use strict'
const { makeId, withId, creators } = require('./ws-action')
const isNode = require('is-node')
const getWebSocket = () => isNode
  ? require('ws')
  : window.WebSocket
const {
  timeMetric,
  cpuUsageMetric,
  memoryUsedMetric,
  memoryTotalMetric
} = require('./metrics')

class Benchmarker {
  constructor (ws) {
    this._ws = ws
    this._timeout = null

    this.id = makeId()
    this.info = {
      id: this.id,
      name: `benchmark-${this.id}`,
      env: isNode ? 'node' : 'web',
      metrics: []
    }
    this._interval = 1000 // record metrics every this many ms

    this.metrics = []
    this.addMetric(timeMetric)
    this.addMetric(memoryUsedMetric)
    this.addMetric(memoryTotalMetric)
    if (isNode) this.addMetric(cpuUsageMetric)
  }

  static async create (host) {
    const ws = await new Promise(resolve => {
      const ws = new (getWebSocket())(`ws://${host}`)
      ws.onopen = () => resolve(ws)
    })
    return new Benchmarker(ws)
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
    this._interval = interval
  }

  setBenchmarkName (name) {
    this.info.name = name.toString()
  }

  log (msg) {
    this._sendAction(creators.LOG(msg))
  }

  _sendAction (action) {
    this._ws.send(JSON.stringify(withId(this.id, action)))
  }

  _recordMetrics () {
    this._sendAction(creators.SEGMENT(this.metrics.map(({ get }) => get())))
  }

  startRecording () {
    if (!this._timeout) {
      this._sendAction(creators.INFO(this.info))
      const interval = this._interval
      const repeater = () => {
        this._recordMetrics()
        this._timeout = setTimeout(repeater.bind(this), interval)
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
