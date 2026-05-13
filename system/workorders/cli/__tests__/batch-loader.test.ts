import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { expectedOutputStatusesForWorkorder, type LoadedWorkorder } from '../batch-loader'

const batchLoaderSourcePath = path.resolve(
  process.cwd(),
  'system/workorders/cli/batch-loader.ts',
)

function readBatchLoaderSource(): string {
  return fs.readFileSync(batchLoaderSourcePath, 'utf8')
}

let tmpDir = ''
const realCwd = process.cwd()

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-batch-loader-'))
  process.chdir(tmpDir)
})

afterEach(() => {
  process.chdir(realCwd)
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
})

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

  it('runDispatch downgrades completed/done dispatcher results to failed when expected outputs are missing', () => {
    const source = readBatchLoaderSource()

    assert.match(
      source,
      /expectedOutputStatusesForWorkorder\(w\)/,
      'runDispatch must inspect expected output existence after dispatcher completion',
    )
    assert.match(
      source,
      /updateActiveWorkorderStatusByRun\(id,\s*result\.run_id,\s*'failed'\)/,
      'runDispatch must mark the active workorder failed when expected outputs are missing',
    )
    assert.match(
      source,
      /Dispatcher reported .*expected outputs are missing/,
      'runDispatch must surface a specific missing-output failure detail',
    )
  })
})

describe('expectedOutputStatusesForWorkorder', () => {
  function makeLoadedWorkorder(expectedOutputs: string[]): LoadedWorkorder {
    return {
      filename: 'WO-test.md',
      filepath: path.join(tmpDir, 'WO-test.md'),
      validationErrors: [],
      needsApproval: false,
      parsed: {
        workorder_id: 'WO-test-008',
        expected_outputs: expectedOutputs,
      },
    }
  }

  it('reports missing expected outputs as exists=false', () => {
    const statuses = expectedOutputStatusesForWorkorder(makeLoadedWorkorder([
      'docs/project/p1-005/P1-005-additive-migration-candidate-plan.md',
      'docs/project/p1-005/P1-005-rollback-and-validation-checklist.md',
    ]))

    assert.deepEqual(statuses, [
      { path: 'docs/project/p1-005/P1-005-additive-migration-candidate-plan.md', exists: false },
      { path: 'docs/project/p1-005/P1-005-rollback-and-validation-checklist.md', exists: false },
    ])
  })

  it('reports existing expected outputs as exists=true', () => {
    const outputPath = path.join(tmpDir, 'docs/project/p1-005/P1-005-additive-migration-candidate-plan.md')
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, '# plan\n', 'utf8')

    const statuses = expectedOutputStatusesForWorkorder(makeLoadedWorkorder([
      'docs/project/p1-005/P1-005-additive-migration-candidate-plan.md',
    ]))

    assert.deepEqual(statuses, [
      { path: 'docs/project/p1-005/P1-005-additive-migration-candidate-plan.md', exists: true },
    ])
  })
})
