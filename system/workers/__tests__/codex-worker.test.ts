import assert from 'node:assert/strict'
import { describe, it, beforeEach, afterEach } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  buildCodexCommand,
  buildPromptFromWorkorder,
  loadWorkorderInput,
  parseCodexWorkerArgs,
  parseFinalState,
  runCodexWorker,
  spawnProcessWithTimeout,
  validatePromptPath,
  validateWorkorderPath,
  type CodexSpawn,
} from '../codex-worker'

let tmpDir = ''
const realCwd = process.cwd()
const expectedCodexJs = path.join(process.env.APPDATA ?? '', 'npm', 'node_modules', '@openai', 'codex', 'bin', 'codex.js')
const expectedUsesNodeEntrypoint = process.platform === 'win32' && fs.existsSync(expectedCodexJs)
const expectedCodexCommand = expectedUsesNodeEntrypoint ? process.execPath : 'codex'
const expectedExecIndex = expectedUsesNodeEntrypoint ? 1 : 0

function setup(): void {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumeos-codex-worker-'))
  process.chdir(tmpDir)
  write('system/workorders/test/drafts/WO-test-001.md', `# Test Workorder

\`\`\`yaml
workorder_id: WO-test-001
agent_id: senior-coding-agent
risk_category: standard
task: |
  Implement a small governance helper.
scope_files:
  - system/example/helper.ts
files_blocked:
  - system/state/**
  - system/approval/**
  - supabase/**
expected_outputs:
  - system/example/helper.ts
acceptance_criteria:
  - Helper is implemented.
  - Tests pass.
source_refs:
  - docs/project/GOVERNANCE_SYSTEM_COMPLETION_PLAN.md
validation_commands:
  - cmd.exe /c node node_modules\\typescript\\bin\\tsc --noEmit
\`\`\`
`)
  write('docs/project/prompt.md', 'Use the repo rules and produce DONE when finished.\n')
}

function cleanup(): void {
  process.chdir(realCwd)
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })
}

beforeEach(setup)
afterEach(cleanup)

function write(relativePath: string, content: string): void {
  const fullPath = path.join(tmpDir, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, content, 'utf8')
}

function fixtureWo(): string {
  return 'system/workorders/test/drafts/WO-test-001.md'
}

describe('codex worker bridge', () => {
  it('dry-run does not call codex or write runtime reports', async () => {
    let calls = 0
    const spawn: CodexSpawn = async () => {
      calls++
      return { exitCode: 0, stdout: 'DONE', stderr: '' }
    }

    const result = await runCodexWorker(
      parseCodexWorkerArgs(['--workorder', fixtureWo(), '--dry-run']),
      { repoRoot: tmpDir, spawn },
    )

    assert.equal(result.mode, 'dry-run')
    assert.equal(calls, 0)
    assert.equal(result.exitCode, 0)
    assert.equal(fs.existsSync(path.join(tmpDir, 'system/reports/codex-worker')), false)
  })

  it('prompt includes scope files, blocked files, and forbidden commands', () => {
    const input = loadWorkorderInput(tmpDir, fixtureWo())
    const prompt = buildPromptFromWorkorder(input)

    assert.match(prompt, /system\/example\/helper\.ts/)
    assert.match(prompt, /system\/state\/\*\*/)
    assert.match(prompt, /No Supabase db push/)
    assert.match(prompt, /No approval grants/)
    assert.match(prompt, /STOP conditions/)
  })

  it('missing workorder fails before execution', async () => {
    await assert.rejects(
      () => runCodexWorker(parseCodexWorkerArgs(['--workorder', 'system/workorders/missing.md']), { repoRoot: tmpDir }),
      /Workorder file not found/,
    )
  })

  it('disallowed workorder path fails', () => {
    assert.throws(
      () => validateWorkorderPath(tmpDir, 'docs/project/prompt.md'),
      /Workorder path must be under system\/workorders/,
    )
  })

  it('disallowed prompt path fails', () => {
    write('system/state/prompt.md', 'unsafe')

    assert.throws(
      () => validatePromptPath(tmpDir, 'system/state/prompt.md'),
      /Prompt path is blocked/,
    )
  })

  it('execute builds a codex exec command using the mock spawn', async () => {
    const calls: Array<{ command: string; args: string[] }> = []
    const spawn: CodexSpawn = async (command, args) => {
      calls.push({ command, args })
      return { exitCode: 0, stdout: '# Report\n\nFinal State: DONE\n', stderr: '' }
    }

    const result = await runCodexWorker(
      parseCodexWorkerArgs(['--workorder', fixtureWo(), '--execute']),
      { repoRoot: tmpDir, spawn },
    )

    assert.equal(result.mode, 'execute')
    assert.equal(calls.length, 1)
    assert.equal(calls[0].command, expectedCodexCommand)
    assert.equal(calls[0].args[expectedExecIndex], 'exec')
    assert.match(calls[0].args[expectedExecIndex + 1], /WO-test-001/)
    assert.equal(result.finalState, 'DONE')
    assert.ok(result.promptPath?.includes('system/reports/codex-worker'))
    assert.ok(result.reportPath?.includes('system/reports/codex-worker'))
  })

  it('resume builds a codex exec resume command using the mock spawn', async () => {
    const calls: Array<{ command: string; args: string[] }> = []
    const spawn: CodexSpawn = async (command, args) => {
      calls.push({ command, args })
      return { exitCode: 0, stdout: 'Final State: FIX_REQUIRED', stderr: '' }
    }

    await runCodexWorker(
      parseCodexWorkerArgs(['--workorder', fixtureWo(), '--execute', '--resume', 'session-123']),
      { repoRoot: tmpDir, spawn },
    )

    assert.deepEqual(calls[0].args.slice(expectedExecIndex, expectedExecIndex + 3), ['exec', 'resume', 'session-123'])
  })

  it('execute times out a hanging codex process without retrying', async () => {
    let calls = 0
    const spawn: CodexSpawn = async () => {
      calls++
      return new Promise(() => {
        // Intentionally never resolves; runCodexWorker must enforce the timeout.
      })
    }

    const result = await runCodexWorker(
      parseCodexWorkerArgs(['--workorder', fixtureWo(), '--execute', '--timeout-ms', '25']),
      { repoRoot: tmpDir, spawn },
    )

    assert.equal(calls, 1)
    assert.equal(result.timedOut, true)
    assert.equal(result.finalState, 'FIX_REQUIRED')
    assert.equal(result.exitCode, 1)
    assert.match(result.stderr, /timed out after 25ms/)
    assert.ok(result.reportPath?.includes('system/reports/codex-worker'))
  })

  it('spawnProcessWithTimeout closes stdin for non-interactive child processes', async () => {
    const script = [
      'process.stdin.resume();',
      'process.stdin.on("end", () => { console.log("STDIN_CLOSED"); });',
    ].join('')

    const result = await spawnProcessWithTimeout(process.execPath, ['-e', script], {
      cwd: tmpDir,
      timeoutMs: 1000,
    })

    assert.equal(result.exitCode, 0)
    assert.equal(result.timedOut, undefined)
    assert.match(result.stdout, /STDIN_CLOSED/)
  })

  it('can build command arrays directly', () => {
    assert.deepEqual(buildCodexCommand('prompt text'), {
      command: expectedCodexCommand,
      args: expectedUsesNodeEntrypoint
        ? [expectedCodexJs, 'exec', 'prompt text']
        : ['exec', 'prompt text'],
    })
    assert.deepEqual(buildCodexCommand('prompt text', 'abc'), {
      command: expectedCodexCommand,
      args: expectedUsesNodeEntrypoint
        ? [expectedCodexJs, 'exec', 'resume', 'abc', 'prompt text']
        : ['exec', 'resume', 'abc', 'prompt text'],
    })
  })

  it('parses final states from worker output', () => {
    assert.equal(parseFinalState('Final State: DONE'), 'DONE')
    assert.equal(parseFinalState('status=NEEDS_TOM_APPROVAL'), 'NEEDS_TOM_APPROVAL')
    assert.equal(parseFinalState('The result is FIX_REQUIRED.'), 'FIX_REQUIRED')
    assert.equal(parseFinalState('No terminal state here'), 'UNKNOWN')
  })

  it('prompt-file dry-run is read-only by default', async () => {
    const result = await runCodexWorker(
      parseCodexWorkerArgs(['--prompt-file', 'docs/project/prompt.md']),
      { repoRoot: tmpDir },
    )

    assert.equal(result.mode, 'dry-run')
    assert.equal(result.exitCode, 0)
    assert.match(result.prompt, /Use the repo rules/)
  })
})
