import fs from 'node:fs'
import path from 'node:path'

export function findRepoRoot(start = process.cwd()): string {
  let current = path.resolve(start)
  for (;;) {
    if (
      fs.existsSync(path.join(current, 'system'))
      && fs.existsSync(path.join(current, 'apps'))
      && fs.existsSync(path.join(current, 'package.json'))
    ) {
      return current
    }
    const parent = path.dirname(current)
    if (parent === current) return path.resolve(start)
    current = parent
  }
}
