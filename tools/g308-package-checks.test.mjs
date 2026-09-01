import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import test from 'node:test'

const packages = ['ui', 'shared']

async function json(path) {
  return JSON.parse(await readFile(resolve(path), 'utf8'))
}

async function exists(path) {
  try {
    await access(resolve(path))
    return true
  } catch {
    return false
  }
}

test('G-308: UI und Shared haben eigenstaendige Compilervertraege', async () => {
  for (const name of packages) {
    const packageJson = await json(`packages/${name}/package.json`)
    assert.equal(await exists(`packages/${name}/tsconfig.json`), true, `${name} braucht ein eigenes tsconfig`)
    const tsconfig = await json(`packages/${name}/tsconfig.json`)

    assert.equal(packageJson.scripts?.typecheck, 'tsc --noEmit --project tsconfig.json')
    assert.equal(packageJson.scripts?.build, 'tsc --noEmit --project tsconfig.json')
    assert.deepEqual(tsconfig.include, ['src/**/*.ts', 'src/**/*.tsx'])
    assert.equal(tsconfig.compilerOptions?.strict, true)
    assert.equal(tsconfig.compilerOptions?.noEmit, true)
  }

  const uiTsconfig = await json('packages/ui/tsconfig.json')
  assert.equal(uiTsconfig.compilerOptions?.jsx, 'preserve')

  const rootTsconfig = await json('tsconfig.json')
  assert.equal(rootTsconfig.compilerOptions?.jsx, 'preserve')
})
