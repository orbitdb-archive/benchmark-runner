const repeatStr = (str, len) => {
  return Array.apply(null, { length: len + 1 }).join(str).slice(0, len)
}

const padStr = (str, max) => {
  str = String(str)
  const length = max - str.length
  if (length <= 0) return str
  return str + repeatStr(' ', length)
}

const reporter = (results) => {
  let reports = [{
    name: 'Benchmark Name',
    ops: 'Ops / ms',
    totalMs: 'Total ms',
    mem: 'Used Mem (MB)'
  }]
  let maxNameWidth = 0
  let maxOpsWidth = reports[0].ops.length
  let maxTotalWidth = reports[0].totalMs.length
  let maxMemWidth = reports[0].mem.length

  for (const benchmark of results) {
    const nameWidth = benchmark.name.length
    if (maxNameWidth < nameWidth) {
      maxNameWidth = nameWidth
    }

    const totalMs = (benchmark.elapsed / 1000000).toFixed(4)
    const opsPerMs = (benchmark.stats.count / totalMs).toFixed(4)
    const memUsed = benchmark.memory.after.heapUsed - benchmark.memory.before.heapUsed
    const memUsedMb = (memUsed / 1024 / 1024).toFixed(2)

    const opsWidth = opsPerMs.toString().length
    if (maxOpsWidth < opsWidth) {
      maxOpsWidth = opsWidth
    }
    const totalWidth = totalMs.toString().length
    if (maxTotalWidth < totalWidth) {
      maxTotalWidth = totalWidth
    }
    const memWidth = memUsedMb.toString().length
    if (maxMemWidth < memWidth) {
      maxMemWidth = memWidth
    }

    reports.push({
      name: benchmark.name,
      ops: opsPerMs,
      totalMs: totalMs,
      mem: memUsedMb
    })
  }

  process.stdout.write('\n')

  const colSpacing = '     '
  for (const report of reports) {
    let output = `\n${padStr(report.name, maxNameWidth)}`
    output += `${colSpacing}${padStr(report.ops, maxOpsWidth)}`
    output += `${colSpacing}${padStr(report.mem, maxMemWidth)}`
    output += `${colSpacing}${padStr(report.totalMs, maxTotalWidth)}`

    process.stdout.write(output)
  }
}

module.exports = reporter
