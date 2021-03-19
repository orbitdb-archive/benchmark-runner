'use strict'

const action = {}

action.types = {
  LOG: 'LOG',
  INFO: 'INFO',
  SEGMENT: 'SEGMENT',
  STOP: 'STOP'
}

action.creators = {
  [action.types.LOG]: (msg) =>
    ({ type: action.types.LOG, msg }),
  [action.types.INFO]: (msg) =>
    ({ type: action.types.INFO, msg }),
  [action.types.SEGMENT]: (msg) =>
    ({ type: action.types.SEGMENT, msg }),
  [action.types.STOP]: () =>
    ({ type: action.types.STOP })
}

action.makeId = () => Date.now()
action.withId = (id, action) => ({ ...action, id })

action.parse = (action) => JSON.parse(action)

module.exports = action
