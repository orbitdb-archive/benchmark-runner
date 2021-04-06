'use strict'
module.exports = ({ results }) => {
  const code =
`export default ${JSON.stringify(results)}
`
  return { code }
}
