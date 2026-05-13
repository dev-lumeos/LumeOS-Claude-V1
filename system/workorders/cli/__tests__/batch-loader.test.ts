import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import fs from 'node:fs'
import path from 'node:path'

const batchLoaderSourcePath = path.resolve(
  process.cwd(),
  'system/workorders/cli/batch-loader.ts',
)

function readBatchLoaderSource(): string {
  return fs.readFileSync(batchLoaderSourcePath, 'utf8')
}

describe('batch-loader dispatcher dependency injection', () => {
  it('runDispatch passes callModel and executeTool to dispatcher dependencies', () => {
    const source = readBatchLoaderSource()

    assert.match(
      source,
      /defaultCallModel/,
      'batch-loader must import defaultCallModel from the dispatcher module',
    )

    const dispatchCall = source.match(
      /dispatchWorkorder\(\s*w\.parsed as unknown as Workorder,\s*\{(?<deps>[\s\S]*?)\}\s*as never,\s*\)/,
    )
    assert.ok(dispatchCall?.groups?.deps, 'runDispatch must pass an explicit dispatcher deps object')

    const deps = dispatchCall.groups.deps
    assert.match(
      deps,
      /callModel\s*:\s*defaultCallModel/,
      'runDispatch must provide callModel when it passes explicit dispatcher deps',
    )
    assert.match(
      deps,
      /executeTool\s*:\s*defaultExecuteTool/,
      'runDispatch must continue to provide executeTool when it passes explicit dispatcher deps',
    )
    assert.doesNotMatch(
      deps,
      /callModel\s*:\s*(undefined|null)/,
      'runDispatch must not pass an empty callModel dependency',
    )
  })

  it('runDispatch performs a completion health preflight before dispatch', () => {
    const source = readBatchLoaderSource()

    assert.match(
      source,
      /runModelRuntimeCheck/,
      'batch-loader must import the runtime checker for execution preflight',
    )
    assert.match(
      source,
      /checkEndpoints:\s*true/,
      'runtime preflight must perform an endpoint health check',
    )
    assert.match(
      source,
      /probeMode:\s*'completion'/,
      'runtime preflight must use a tiny completion probe, not just /v1/models',
    )
    assert.match(
      source,
      /RUNTIME_UNHEALTHY:/,
      'runtime preflight failures must be surfaced as RUNTIME_UNHEALTHY blocks',
    )
  })
})
