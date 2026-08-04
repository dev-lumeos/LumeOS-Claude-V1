import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { expectedOutputStatusesForWorkorder, parseSimpleYaml, validateWo, type LoadedWorkorder } from '../batch-loader'

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
  const schemaDir = path.join(tmpDir, 'system/workorders/schemas')
  fs.mkdirSync(schemaDir, { recursive: true })
  fs.writeFileSync(
    path.join(schemaDir, 'workorder.schema.json'),
    fs.readFileSync(path.join(realCwd, 'system/workorders/schemas/workorder.schema.json'), 'utf8'),
    'utf8',
  )
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

describe('parseSimpleYaml', () => {
  it('preserves nested source_refs maps used by source-chain workorders', () => {
    const parsed = parseSimpleYaml([
      'workorder_id: "WO-test"',
      'source_refs:',
      '  module_index: "docs/specs/Nutrition/INDEX.md"',
      '  current_specs:',
      '    - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"',
      '  reviews:',
      '    - "docs/project/p1-005/P1-005-schema-foundation-local-test-checklist.md"',
      '  raw_sources_allowed: false',
      'expected_outputs:',
      '  - "docs/project/test.md"',
    ].join('\n'))

    assert.deepEqual(parsed.source_refs, {
      module_index: 'docs/specs/Nutrition/INDEX.md',
      current_specs: ['docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md'],
      reviews: ['docs/project/p1-005/P1-005-schema-foundation-local-test-checklist.md'],
      raw_sources_allowed: false,
    })
    assert.deepEqual(parsed.expected_outputs, ['docs/project/test.md'])
  })

  it('preserves nested documentation_impact maps used by governed workorders', () => {
    const parsed = parseSimpleYaml([
      'workorder_id: "WO-test"',
      'documentation_impact:',
      '  required: true',
      '  domains:',
      '    - "workflow"',
      '  ssot_files:',
      '    - "docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md"',
      '  documentation_agent_required: true',
      '  na_reason: null',
    ].join('\n'))

    assert.deepEqual(parsed.documentation_impact, {
      required: true,
      domains: ['workflow'],
      ssot_files: ['docs/project/GOVERNANCE_OPERATOR_RUNBOOK.md'],
      documentation_agent_required: true,
      na_reason: null,
    })
  })
})

describe('validateWo documentation impact gate', () => {
  const baseWo = {
    workorder_id: 'WO-test-001',
    agent_id: 'docs-agent',
    task: 'Write a governed documentation output for the test workorder.',
    scope_files: ['docs/project/test.md'],
    acceptance_criteria: ['test output exists'],
    negative_constraints: ['no db', 'no supabase', 'no queue edit', 'no runtime edit'],
  }

  it('blocks workorders without documentation_impact', () => {
    const result = validateWo(baseWo)
    assert.equal(result.valid, false)
    assert.match(result.errors.join('\n'), /documentation_impact\.missing/)
  })

  it('allows product UI workorders with documentation_impact none and a specific N/A reason', () => {
    const result = validateWo({
      ...baseWo,
      documentation_impact: {
        required: false,
        domains: ['none'],
        ssot_files: [],
        documentation_agent_required: false,
        na_reason: 'Local-only UI affordance does not alter accepted behavior, SSOT runtime docs, gates, or TODO state.',
      },
    })
    assert.equal(result.valid, true, result.errors.join('\n'))
  })

  it('blocks runtime/governance domains when documentation agent is not configured', () => {
    const result = validateWo({
      ...baseWo,
      documentation_impact: {
        required: true,
        domains: ['runtime'],
        ssot_files: ['docs/project/STACK_REFERENCE.md'],
        documentation_agent_required: false,
        na_reason: null,
      },
    })
    assert.equal(result.valid, false)
    assert.match(result.errors.join('\n'), /documentation_agent\.required_not_configured/)
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
      { path: 'docs/project/p1-005/P1-005-additive-migration-candidate-plan.md', exists: false, valid: false, reason: 'missing' },
      { path: 'docs/project/p1-005/P1-005-rollback-and-validation-checklist.md', exists: false, valid: false, reason: 'missing' },
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
      { path: 'docs/project/p1-005/P1-005-additive-migration-candidate-plan.md', exists: true, valid: false, reason: 'markdown output has fewer than 2 headings' },
    ])
  })

  it('flags stub markdown outputs as invalid even when the file exists', () => {
    const outputPath = path.join(tmpDir, 'docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md')
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, '# Title\n\n## Purpose\n\nThis doc\n', 'utf8')

    const statuses = expectedOutputStatusesForWorkorder(makeLoadedWorkorder([
      'docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md',
    ]))

    assert.equal(statuses[0]?.exists, true)
    assert.equal(statuses[0]?.valid, false)
    assert.match(statuses[0]?.reason ?? '', /headings|meaningful body lines|body is too short|stub phrase/)
  })

  it('accepts meaningful markdown outputs as valid', () => {
    const outputPath = path.join(tmpDir, 'docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md')
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, [
      '# P1-005 Nutrient Definitions Seed Candidate',
      '',
      '## Purpose',
      '',
      'This document captures a review-only nutrient_defs seed candidate for local planning and later manual verification.',
      '',
      '## Expected Row Count',
      '',
      'The approved source chain expects 138 nutrient definition rows, while Thai values may remain empty strings during this blocked translation phase.',
      '',
      '## Validation Query',
      '',
      'Use a later local-only verification query to confirm the candidate row count before any seed execution boundary is opened.',
    ].join('\n'), 'utf8')

    const statuses = expectedOutputStatusesForWorkorder(makeLoadedWorkorder([
      'docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md',
    ]))

    assert.deepEqual(statuses, [
      { path: 'docs/project/p1-005/P1-005-nutrient-defs-seed-candidate.md', exists: true, valid: true, reason: undefined },
    ])
  })
})
