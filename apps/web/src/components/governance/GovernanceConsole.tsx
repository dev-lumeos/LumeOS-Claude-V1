'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  COMMAND_DEFINITIONS,
  DEFAULT_BATCH_PATH,
  FORBIDDEN_COMMAND_TEXT,
  type GovernanceAction,
} from '../../lib/governance/command-allowlist'
import { isMealCamOptionalOfflineNonBlocking } from '../../lib/governance/status'

type CommandExecution = {
  action: GovernanceAction
  command: string
  exitCode: number
  stdout: string
  stderr: string
  parsedJson: unknown | null
  timestamp: string
}

type GovernanceSnapshot = {
  generatedAt: string
  repoRoot: string
  batchPath: string
  commands: Partial<Record<GovernanceAction, CommandExecution>>
  cards: Array<{ id: string; label: string; value: string; tone: string }>
  docs: { handover: string; learningStatus: string }
}

type PageKind =
  | 'dashboard'
  | 'batches'
  | 'doctor'
  | 'approvals'
  | 'dossiers'
  | 'workorders'
  | 'promotion'
  | 'learning'
  | 'runtime'
  | 'settings'

type Props = {
  page: PageKind
}

const navigation: Array<{ page: PageKind; label: string; href: string }> = [
  { page: 'dashboard', label: 'Dashboard', href: '/governance' },
  { page: 'batches', label: 'Batches', href: '/governance/batches' },
  { page: 'doctor', label: 'Doctor', href: '/governance/doctor' },
  { page: 'approvals', label: 'Approvals', href: '/governance/approvals' },
  { page: 'dossiers', label: 'Dossiers', href: '/governance/dossiers' },
  { page: 'workorders', label: 'Workorders', href: '/governance/workorders' },
  { page: 'promotion', label: 'Promotion', href: '/governance/promotion' },
  { page: 'learning', label: 'Learning', href: '/governance/learning' },
  { page: 'runtime', label: 'Runtime', href: '/governance/runtime' },
  { page: 'settings', label: 'Settings', href: '/governance/settings' },
]

const toneClass: Record<string, string> = {
  pass: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  attention: 'border-amber-200 bg-amber-50 text-amber-900',
  blocked: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  idle: 'border-slate-200 bg-slate-50 text-slate-700',
}

const batchActions: GovernanceAction[] = [
  'operator.status',
  'operator.dryRun',
  'operator.doctor',
  'operator.continue',
  'operator.continueSafeCleanups',
]

function jsonRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function findingsOf(value: unknown): Array<Record<string, unknown>> {
  const findings = jsonRecord(value).findings
  return Array.isArray(findings) ? findings.filter(item => item && typeof item === 'object') as Array<Record<string, unknown>> : []
}

function summaryLine(value: unknown): string {
  const summary = jsonRecord(value).summary as Record<string, unknown> | undefined
  if (!summary) return 'No structured summary.'
  return `critical ${summary.critical ?? 0} / high ${summary.high ?? 0} / medium ${summary.medium ?? 0} / low ${summary.low ?? 0} / info ${summary.info ?? 0}`
}

function commandBlock(command: string): JSX.Element {
  return <code className="block overflow-x-auto rounded-md bg-slate-950 px-3 py-2 text-xs text-slate-100">{command}</code>
}

export function GovernanceConsole({ page }: Props) {
  const [batchPath, setBatchPath] = useState(DEFAULT_BATCH_PATH)
  const [branch, setBranch] = useState('goal/governance-ui-v1')
  const [snapshot, setSnapshot] = useState<GovernanceSnapshot | null>(null)
  const [selectedAction, setSelectedAction] = useState<GovernanceAction>('operator.status')
  const [result, setResult] = useState<CommandExecution | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const selectedDefinition = COMMAND_DEFINITIONS[selectedAction]
  const requiresTypedConfirmation = selectedDefinition.controlled

  async function refreshSnapshot() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/governance/snapshot?batch=${encodeURIComponent(batchPath)}`, { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? 'Snapshot failed')
      setSnapshot(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function runAction(action = selectedAction) {
    const definition = COMMAND_DEFINITIONS[action]
    if (definition.controlled && confirmation !== 'CONFIRM') {
      setError('Controlled actions require typing CONFIRM.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/governance/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          batchPath,
          branch,
          confirmed: definition.controlled && confirmation === 'CONFIRM',
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? 'Command failed')
      setResult(payload)
      if (!definition.controlled) setConfirmation('')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshSnapshot()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runtimeJson = result?.action?.startsWith('modelRuntime')
    ? result.parsedJson
    : snapshot?.commands['modelRuntime.check']?.parsedJson
  const mealcamOptionalOk = useMemo(() => isMealCamOptionalOfflineNonBlocking(runtimeJson), [runtimeJson])

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 rounded-md border border-slate-200 bg-white p-4 shadow-sm lg:block">
          <div className="mb-5">
            <div className="text-lg font-semibold">Governance Console</div>
            <div className="mt-1 text-xs text-slate-500">Local operator UI</div>
          </div>
          <nav className="space-y-1">
            {navigation.map(item => (
              <a
                key={item.page}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm ${page === item.page ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-900">
            Product work remains blocked unless Tom explicitly opens it.
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <Header page={page} loading={loading} onRefresh={refreshSnapshot} />
          {error ? <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</div> : null}

          {page === 'dashboard' && <Dashboard snapshot={snapshot} />}
          {page === 'batches' && (
            <BatchConsole
              batchPath={batchPath}
              setBatchPath={setBatchPath}
              selectedAction={selectedAction}
              setSelectedAction={setSelectedAction}
              confirmation={confirmation}
              setConfirmation={setConfirmation}
              runAction={runAction}
              result={result}
              requiresTypedConfirmation={requiresTypedConfirmation}
            />
          )}
          {page === 'doctor' && <DoctorPanel result={result} runDoctor={() => runAction('operator.doctor')} batchPath={batchPath} setBatchPath={setBatchPath} />}
          {page === 'approvals' && <ApprovalCenter result={result} runAll={() => runAction('approvals.all')} runPending={() => runAction('approvals.list')} />}
          {page === 'dossiers' && <DossierViewer result={result} runDossier={() => runAction('dossier.batch')} batchPath={batchPath} setBatchPath={setBatchPath} />}
          {page === 'workorders' && <WorkorderView result={result} runDossier={() => runAction('dossier.batch')} />}
          {page === 'promotion' && <PromotionCenter branch={branch} setBranch={setBranch} result={result} setAction={setSelectedAction} runAction={runAction} confirmation={confirmation} setConfirmation={setConfirmation} />}
          {page === 'learning' && <LearningCenter snapshot={snapshot} result={result} runLearning={() => runAction('learning.check')} />}
          {page === 'runtime' && <RuntimeCenter result={result} runStatic={() => runAction('modelRuntime.check')} runEndpoints={() => runAction('modelRuntime.checkEndpoints')} mealcamOptionalOk={mealcamOptionalOk} />}
          {page === 'settings' && <Settings repoRoot={snapshot?.repoRoot ?? ''} />}
        </section>
      </div>
    </main>
  )
}

function Header({ page, loading, onRefresh }: { page: PageKind; loading: boolean; onRefresh: () => void }) {
  const label = navigation.find(item => item.page === page)?.label ?? 'Dashboard'
  return (
    <header className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{label}</h1>
        <p className="mt-1 text-sm text-slate-600">Inspect and operate governance through existing CLI gates.</p>
      </div>
      <button onClick={onRefresh} className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" disabled={loading}>
        {loading ? 'Running...' : 'Refresh'}
      </button>
    </header>
  )
}

function Dashboard({ snapshot }: { snapshot: GovernanceSnapshot | null }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {(snapshot?.cards ?? []).map(card => (
          <div key={card.id} className={`rounded-md border p-4 shadow-sm ${toneClass[card.tone] ?? toneClass.idle}`}>
            <div className="text-xs font-medium uppercase tracking-wide opacity-70">{card.label}</div>
            <div className="mt-3 text-sm font-semibold">{card.value}</div>
          </div>
        ))}
      </div>
      <Panel title="Current Git / Runtime Snapshot">
        <ResultPreview result={snapshot?.commands['git.status'] ?? null} />
      </Panel>
    </div>
  )
}

function BatchConsole(props: {
  batchPath: string
  setBatchPath: (value: string) => void
  selectedAction: GovernanceAction
  setSelectedAction: (value: GovernanceAction) => void
  confirmation: string
  setConfirmation: (value: string) => void
  runAction: () => void
  result: CommandExecution | null
  requiresTypedConfirmation: boolean
}) {
  return (
    <div className="space-y-4">
      <BatchInput value={props.batchPath} onChange={props.setBatchPath} />
      <Panel title="Operator Actions">
        <div className="grid gap-3 md:grid-cols-2">
          {batchActions.map(action => (
            <button
              key={action}
              onClick={() => props.setSelectedAction(action)}
              className={`rounded-md border p-3 text-left text-sm ${props.selectedAction === action ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
            >
              <div className="font-semibold">{COMMAND_DEFINITIONS[action].label}</div>
              <div className="mt-1 text-xs opacity-75">{COMMAND_DEFINITIONS[action].description}</div>
            </button>
          ))}
        </div>
        <ControlledConfirm required={props.requiresTypedConfirmation} value={props.confirmation} onChange={props.setConfirmation} />
        <button onClick={props.runAction} className="mt-4 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white">Run selected action</button>
      </Panel>
      <ResultPanel result={props.result} />
    </div>
  )
}

function DoctorPanel({ result, runDoctor, batchPath, setBatchPath }: { result: CommandExecution | null; runDoctor: () => void; batchPath: string; setBatchPath: (value: string) => void }) {
  const data = jsonRecord(result?.parsedJson)
  return (
    <div className="space-y-4">
      <BatchInput value={batchPath} onChange={setBatchPath} />
      <button onClick={runDoctor} className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white">Run doctor</button>
      <Panel title="Doctor Diagnosis">
        <div className="grid gap-3 md:grid-cols-3">
          <Info label="Diagnosis" value={String(data.final_diagnosis ?? 'not run')} />
          <Info label="Next Action" value={String(data.next_action ?? 'Run doctor for one safe next action.')} />
          <Info label="Blockers" value={String(Array.isArray(data.blockers) ? data.blockers.length : 0)} />
        </div>
      </Panel>
      <ResultPanel result={result} />
    </div>
  )
}

function ApprovalCenter({ result, runAll, runPending }: { result: CommandExecution | null; runAll: () => void; runPending: () => void }) {
  return (
    <div className="space-y-4">
      <Panel title="Approval Controls">
        <div className="flex flex-wrap gap-2">
          <button onClick={runPending} className="rounded-md bg-slate-950 px-4 py-2 text-sm text-white">List pending</button>
          <button onClick={runAll} className="rounded-md border border-slate-300 px-4 py-2 text-sm">List all</button>
        </div>
        <p className="mt-3 text-sm text-slate-600">Grant and deny are intentionally not executable in V1. The console may display commands for review, but no approval is auto-granted.</p>
      </Panel>
      <ResultPanel result={result} />
    </div>
  )
}

function DossierViewer({ result, runDossier, batchPath, setBatchPath }: { result: CommandExecution | null; runDossier: () => void; batchPath: string; setBatchPath: (value: string) => void }) {
  return (
    <div className="space-y-4">
      <BatchInput value={batchPath} onChange={setBatchPath} />
      <button onClick={runDossier} className="rounded-md bg-blue-700 px-4 py-2 text-sm text-white">Generate dossier JSON</button>
      <ResultPanel result={result} />
    </div>
  )
}

function WorkorderView({ result, runDossier }: { result: CommandExecution | null; runDossier: () => void }) {
  const data = jsonRecord(result?.parsedJson)
  const workorders = Array.isArray(data.workorders) ? data.workorders as Array<Record<string, unknown>> : []
  return (
    <div className="space-y-4">
      <Panel title="Workorder Table">
        <button onClick={runDossier} className="mb-3 rounded-md bg-blue-700 px-4 py-2 text-sm text-white">Load from dossier</button>
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="p-3">Workorder</th><th className="p-3">Status</th><th className="p-3">Risk</th><th className="p-3">Outputs</th></tr>
            </thead>
            <tbody>
              {workorders.length === 0 ? <tr><td className="p-3 text-slate-500" colSpan={4}>Run a dossier to populate workorders. Graph rendering is planned after V1 table confidence.</td></tr> : null}
              {workorders.map((wo, index) => (
                <tr key={index} className="border-t border-slate-100">
                  <td className="p-3 font-medium">{String(wo.workorder_id ?? wo.id ?? 'unknown')}</td>
                  <td className="p-3">{String(wo.status ?? 'unknown')}</td>
                  <td className="p-3">{String(wo.risk_category ?? 'unknown')}</td>
                  <td className="p-3">{Array.isArray(wo.expected_outputs) ? wo.expected_outputs.length : 'unknown'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function PromotionCenter(props: {
  branch: string
  setBranch: (value: string) => void
  result: CommandExecution | null
  setAction: (value: GovernanceAction) => void
  runAction: (action?: GovernanceAction) => void
  confirmation: string
  setConfirmation: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <Panel title="Promotion Review">
        <label className="block text-sm font-medium">Branch</label>
        <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={props.branch} onChange={event => props.setBranch(event.target.value)} />
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => props.runAction('promotion.review')} className="rounded-md bg-slate-950 px-4 py-2 text-sm text-white">Review branch</button>
          <button onClick={() => props.runAction('promotion.merge')} className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">Merge branch</button>
          <button onClick={() => props.runAction('promotion.pushMain')} className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900">Push main</button>
        </div>
        <ControlledConfirm required value={props.confirmation} onChange={props.setConfirmation} />
      </Panel>
      <ResultPanel result={props.result} />
    </div>
  )
}

function LearningCenter({ snapshot, result, runLearning }: { snapshot: GovernanceSnapshot | null; result: CommandExecution | null; runLearning: () => void }) {
  return (
    <div className="space-y-4">
      <button onClick={runLearning} className="rounded-md bg-blue-700 px-4 py-2 text-sm text-white">Run learning check</button>
      <Panel title="Current Governance Handover"><MarkdownText text={snapshot?.docs.handover ?? ''} /></Panel>
      <Panel title="Current Learning Status"><MarkdownText text={snapshot?.docs.learningStatus ?? ''} /></Panel>
      <ResultPanel result={result} />
    </div>
  )
}

function RuntimeCenter({ result, runStatic, runEndpoints, mealcamOptionalOk }: { result: CommandExecution | null; runStatic: () => void; runEndpoints: () => void; mealcamOptionalOk: boolean }) {
  const data = result?.parsedJson
  const routes = Array.isArray(jsonRecord(data).routes) ? jsonRecord(data).routes as Array<Record<string, unknown>> : []
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={runStatic} className="rounded-md bg-slate-950 px-4 py-2 text-sm text-white">Run static check</button>
        <button onClick={runEndpoints} className="rounded-md border border-slate-300 px-4 py-2 text-sm">Check endpoints</button>
      </div>
      {mealcamOptionalOk ? <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">MealCam runtime is optional/on-demand and offline is not a governance blocker.</div> : null}
      <Panel title="Runtime Routes">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="p-3">Agent</th><th className="p-3">Model</th><th className="p-3">Endpoint</th><th className="p-3">Status</th><th className="p-3">Policy</th></tr>
            </thead>
            <tbody>
              {routes.map((route, index) => (
                <tr key={index} className="border-t border-slate-100">
                  <td className="p-3 font-medium">{String(route.agent ?? '')}</td>
                  <td className="p-3">{String(route.model ?? '')}</td>
                  <td className="p-3">{String(route.endpoint ?? 'n/a')}</td>
                  <td className="p-3">{String(route.endpoint_status ?? 'not checked')}</td>
                  <td className="p-3">{route.optional_runtime ? 'optional/on-demand' : 'required'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <ResultPanel result={result} />
    </div>
  )
}

function Settings({ repoRoot }: { repoRoot: string }) {
  return (
    <div className="space-y-4">
      <Panel title="Safety Rules">
        <div className="grid gap-3 md:grid-cols-2">
          <Info label="Repository" value={repoRoot || 'unknown'} />
          <Info label="Raw BLS Policy" value="Local-only and ignored." />
          <Info label="DB Reset" value="Forbidden." />
          <Info label="Product Gate" value="Blocked unless Tom explicitly opens it." />
        </div>
      </Panel>
      <Panel title="Forbidden Commands">
        <ul className="grid gap-2 text-sm md:grid-cols-2">
          {FORBIDDEN_COMMAND_TEXT.map(item => <li key={item} className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-900">{item}</li>)}
        </ul>
      </Panel>
      <Panel title="Allowlisted Actions">
        <div className="grid gap-2 md:grid-cols-2">
          {Object.values(COMMAND_DEFINITIONS).map(def => (
            <div key={def.action} className="rounded-md border border-slate-200 bg-white p-3 text-sm">
              <div className="font-semibold">{def.label}</div>
              <div className="text-xs text-slate-500">{def.action} - {def.mode}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function BatchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Panel title="Batch File">
      <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={value} onChange={event => onChange(event.target.value)} />
      <p className="mt-2 text-xs text-slate-500">Must be repo-relative and under system/workorders.</p>
    </Panel>
  )
}

function ControlledConfirm({ required, value, onChange }: { required: boolean; value: string; onChange: (value: string) => void }) {
  if (!required) return null
  return (
    <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
      <label className="block text-sm font-medium text-amber-950">Controlled action confirmation</label>
      <p className="mt-1 text-xs text-amber-900">Type CONFIRM to run this action. This does not allow forbidden commands or auto-approvals.</p>
      <input className="mt-2 w-full rounded-md border border-amber-300 px-3 py-2 text-sm" value={value} onChange={event => onChange(event.target.value)} />
    </div>
  )
}

function ResultPanel({ result }: { result: CommandExecution | null }) {
  return (
    <Panel title="Command Result">
      <ResultPreview result={result} />
    </Panel>
  )
}

function ResultPreview({ result }: { result: CommandExecution | null | undefined }) {
  if (!result) return <p className="text-sm text-slate-500">No command run yet.</p>
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <Info label="Exit Code" value={String(result.exitCode)} />
        <Info label="Timestamp" value={result.timestamp} />
        <Info label="Action" value={result.action} />
      </div>
      {commandBlock(result.command)}
      <div className="grid gap-3 lg:grid-cols-2">
        <pre className="max-h-96 overflow-auto rounded-md bg-white p-3 text-xs text-slate-800">{result.stdout || '(no stdout)'}</pre>
        <pre className="max-h-96 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-red-900">{result.stderr || '(no stderr)'}</pre>
      </div>
      {result.parsedJson ? (
        <details className="rounded-md border border-slate-200 bg-white p-3">
          <summary className="cursor-pointer text-sm font-medium">Parsed JSON</summary>
          <pre className="mt-3 max-h-96 overflow-auto text-xs">{JSON.stringify(result.parsedJson, null, 2)}</pre>
        </details>
      ) : null}
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 break-words text-sm font-medium text-slate-900">{value}</div>
    </div>
  )
}

function MarkdownText({ text }: { text: string }) {
  return <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-800">{text || 'Not loaded.'}</pre>
}

