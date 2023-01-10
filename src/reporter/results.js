export default ({ results }) => {
  const code =
`export default ${JSON.stringify(results)}
`
  return { code }
}
