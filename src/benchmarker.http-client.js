'use strict'
const isNode = require('is-node')
const getFetch = () => isNode
  ? require('node-fetch')
  : window.fetch

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
  constructor (url) {
    this._url = url
    this.metrics = {
      [timeMetric.name]: timeMetric,
      [memoryMetric.name]: memoryMetric
    }
    if (isNode) this.metrics[cpuMetric.name] = cpuMetric
    this.interval = 1000 // record metrics every this many ms
    this.name = `benchmark-${Date.now()}`

    this._fetch = getFetch()
    this._timeout = null
    this.recorded = {}
  }

  addMetric ({ name, get }) {
    if (this.metrics[name]) {
      throw new Error('a metric with that name already exists')
    }
    if (Object.keys(this.recorded).length !== 0) {
      throw new Error('metrics have already started being recorded')
    }
    this.metrics[name] = { name, get }
  }

  setInterval (interval) {
    if (typeof interval !== 'number') {
      throw new Error('interval must be a number')
    }
    if (Object.keys(this.recorded).length !== 0) {
      throw new Error('metrics have already started being recorded')
    }
    this.interval = interval
  }

  setBenchmarkName (name) {
    this.name = name.toString()
  }

  _recordMetrics () {
    Object.values(this.metrics).map(({ name, get }) => {
      this.recorded[name]
        ? this.recorded[name].push(get())
        : this.recorded[name] = [get()]
    })
  }

  startRecording () {
    this._recordMetrics()
    this._timeout = setTimeout(this.startRecording.bind(this), this.interval)
  }

  stopRecording () {
    this._recordMetrics()
    clearTimeout(this._timeout)
    this._timeout = null
    return this.recorded
  }

  async putResults (recorded = this.recorded) {
    if (this._timeout) throw new Error('benchmarker is still recording')
    const results = {
      name: this.name,
      env: isNode ? 'node' : 'web',
      recorded: this.recorded
    }
    return this._fetch(`${this._url}/api/results`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(results)
    })
  }
}

module.exports = Benchmarker
