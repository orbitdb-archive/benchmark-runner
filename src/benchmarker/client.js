import isNode from 'is-node'
import path from 'path'
import ws from 'ws'
import WsAction from './ws-action.js'
import {
  timeMetric,
  cpuUsageMetric,
  memoryUsedMetric,
  memoryTotalMetric
} from './metrics/index.js'

const nodeDir = (dir) => path.join(dir, 'node')
const getWebSocket = () => isNode
  ? ws
  : window.WebSocket

export default class Benchmarker {
  constructor (ws, dir) {
    this._ws = ws
    this.dir = isNode ? nodeDir(dir) : dir
    this._timeout = null

    this.isNode = isNode
    this.id = WsAction.makeId()
    this.info = {
      id: this.id,
      name: `benchmark-${this.id}`,
      env: isNode ? 'node' : 'browser',
      metrics: []
    }
    this._interval = 1000 // record metrics every this many ms

    this.metrics = []
    this.addMetric(timeMetric)
  }

  static async create (host, dir) {
    const ws = await new Promise(resolve => {
      const ws = new (getWebSocket())(`ws://${host}`)
      ws.onopen = () => resolve(ws)
    })
    return new Benchmarker(ws, dir)
  }

  async close () {
    if (this._ws.readyState !== 3) {
      await new Promise(resolve => {
        this._ws.onclose = () => resolve()
        this._ws.close()
      })
    }
  }

  trackMemory () {
    this.addMetric(memoryUsedMetric)
    this.addMetric(memoryTotalMetric)
  }

  trackCpu () {
    if (isNode) this.addMetric(cpuUsageMetric)
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

  setHookInfo (info) {
    this.info.hook = info
  }

  log (msg) {
    this._sendAction(WsAction.creators.LOG(msg))
  }

  _sendAction (action) {
    this._ws.send(JSON.stringify(WsAction.withInfo(this.info)(action)))
  }

  _recordMetrics () {
    this._sendAction(WsAction.creators.SEGMENT(this.metrics.map(({ get }) => get())))
  }

  startRecording () {
    if (!this._timeout) {
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
  }
}
