const action = {}

action.types = {
  LOG: 'LOG',
  SEGMENT: 'SEGMENT'
}

action.creators = {
  [action.types.LOG]: (msg) =>
    ({ type: action.types.LOG, msg }),
  [action.types.SEGMENT]: (msg) =>
    ({ type: action.types.SEGMENT, msg })
}

action.makeId = () => Date.now()
action.withInfo = (info) => (action) => ({ info, ...action })

action.parse = (action) => JSON.parse(action)

export default action
