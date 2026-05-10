'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  COMMAND_DEFINITIONS,
  DEFAULT_BATCH_PATH,
  FORBIDDEN_COMMAND_TEXT,
  getCommandDefinition,
  type GovernanceAction,
} from '../../lib/governance/command-allowlist'
import { classifyCommandResult, isMealCamOptionalOfflineNonBlocking } from '../../lib/governance/status'

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
  projectProfile?: {
    project_id: string
    display_name: string
    repo_root?: string
    specs_root?: string
    workorders_root?: string
    raw_data_paths?: string[]
    forbidden_commands?: string[]
    product_gate?: { status: string; reason: string }
    codex_worker_policy?: {
      enabled?: boolean
      allowed_agents?: string[]
      require_explicit_workorder_flag?: boolean
      default_timeout_ms?: number
    }
  }
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
  pass: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  attention: 'border-amber-200 bg-amber-50 text-amber-950',
  blocked: 'border-red-200 bg-red-50 text-red-950',
  info: 'border-blue-200 bg-blue-50 text-blue-950',
  idle: 'border-slate-200 bg-slate-50 text-slate-700',
}

const badgeClass: Record<string, string> = {
  pass: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  attention: 'bg-amber-100 text-amber-800 ring-amber-200',
  blocked: 'bg-red-100 text-red-800 ring-red-200',
  info: 'bg-blue-100 text-blue-800 ring-blue-200',
  idle: 'bg-slate-100 text-slate-700 ring-slate-200',
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

function arrayRecords(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter(item => item && typeof item === 'object') as Array<Record<string, unknown>>
    : []
}

function stringValue(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return fallback
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(item => stringValue(item)).filter(Boolean) : []
}

function toneForState(value: unknown): string {
  const normalized = stringValue(value, 'unknown').toLowerCase()
  if (/done|complete|completed|pass|ok|ready|granted/.test(normalized)) return 'pass'
  if (/blocked|fail|fix|required|stop|denied|error/.test(normalized)) return 'blocked'
  if (/pending|approval|cleanup|warn|partial|medium/.test(normalized)) return 'attention'
  if (/optional|info|not_checked|not checked/.test(normalized)) return 'info'
  return 'idle'
}

function findingsOf(value: unknown): Array<Record<string, unknown>> {
  const findings = jsonRecord(value).findings
  return arrayRecords(findings)
}

function summaryLine(value: unknown): string {
  const summary = jsonRecord(value).summary as Record<string, unknown> | undefined
  if (!summary) return 'No structured summary.'
  return `critical ${summary.critical ?? 0} / high ${summary.high ?? 0} / medium ${summary.medium ?? 0} / low ${summary.low ?? 0} / info ${summary.info ?? 0}`
}

function commandBlock(command: string): JSX.Element {
  return <code className="gov-code">{command}</code>
}

async function copyText(value: string) {
  if (!value) return
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(value)
  }
}

export function GovernanceConsole({ page }: Props) {
  const [batchPath, setBatchPath] = useState(DEFAULT_BATCH_PATH)
  const [branch, setBranch] = useState('main')
  const [snapshot, setSnapshot] = useState<GovernanceSnapshot | null>(null)
  const [selectedAction, setSelectedAction] = useState<GovernanceAction>('operator.status')
  const [result, setResult] = useState<CommandExecution | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const selectedDefinition = getCommandDefinition(selectedAction) ?? COMMAND_DEFINITIONS['operator.status']
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

  async function runAction(action: unknown = selectedAction) {
    const definition = getCommandDefinition(action)
    if (!definition) {
      setError(`Unknown governance action: ${typeof action === 'string' ? action : 'invalid UI event'}. No command was executed.`)
      return
    }
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
          action: definition.action,
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
    <main className="gov-shell">
      <div className="gov-shell-grid">
        <aside className="gov-sidebar">
          <div className="border-b border-slate-700/60 p-5">
            <div className="text-lg font-semibold text-white">Governance Console</div>
            <div className="mt-1 text-xs text-slate-400">Local operator control plane</div>
            <div className="mt-4 flex items-center gap-2">
              <StatusBadge tone="blocked" label="Product gate closed" />
            </div>
          </div>
          <nav className="space-y-1 p-3">
            {navigation.map(item => (
              <a
                key={item.page}
                href={item.href}
                className={`gov-nav-item ${page === item.page ? 'gov-nav-item-active' : ''}`}
              >
                <span>{item.label}</span>
                {page === item.page ? <span className="text-xs">Active</span> : null}
              </a>
            ))}
          </nav>
          <div className="mx-3 mt-3 rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-xs leading-5 text-red-100">
            No Supabase push/reset, migrations, approval auto-grants, or product batches are exposed here.
          </div>
        </aside>

        <section className="gov-content">
          <Header page={page} loading={loading} onRefresh={refreshSnapshot} />
          {error ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              <div className="mb-1"><StatusBadge tone="blocked" label="API_ERROR" /></div>
              {error}
            </div>
          ) : null}

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
          {page === 'settings' && <Settings repoRoot={snapshot?.repoRoot ?? ''} projectProfile={snapshot?.projectProfile} />}
        </section>
      </div>
    </main>
  )
}

function Header({ page, loading, onRefresh }: { page: PageKind; loading: boolean; onRefresh: () => void }) {
  const label = navigation.find(item => item.page === page)?.label ?? 'Dashboard'
  return (
    <header className="gov-topbar mb-5 flex-col sm:flex-row">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{label}</h1>
          <StatusBadge tone="info" label="Local only" />
        </div>
        <p className="mt-1 text-sm text-slate-600">Inspect governance state and run allowlisted operator commands through existing CLI gates.</p>
      </div>
      <button onClick={onRefresh} className="gov-button gov-button-dark w-fit disabled:opacity-50" disabled={loading}>
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
          <div key={card.id} className={`gov-card ${toneClass[card.tone] ?? toneClass.idle}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-wide opacity-70">{card.label}</div>
              <StatusBadge tone={card.tone} label={card.tone} />
            </div>
            <div className="mt-4 text-sm font-semibold leading-6">{card.value}</div>
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
      <Panel title="Operator Actions" subtitle="Read-only actions are grouped first. Controlled actions require typed confirmation and still use CLI gates.">
        <div className="grid gap-3 md:grid-cols-2">
          {batchActions.map(action => (
            <button
              key={action}
              onClick={() => props.setSelectedAction(action)}
              className={`rounded-lg border p-4 text-left text-sm shadow-sm transition ${props.selectedAction === action ? 'border-blue-700 bg-blue-700 text-white shadow-blue-700/20' : COMMAND_DEFINITIONS[action].controlled ? 'border-amber-200 bg-amber-50 text-amber-950 hover:border-amber-300' : 'border-slate-200 bg-white text-slate-900 hover:border-blue-200 hover:bg-blue-50'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">{COMMAND_DEFINITIONS[action].label}</div>
                <StatusBadge tone={COMMAND_DEFINITIONS[action].controlled ? 'attention' : 'info'} label={COMMAND_DEFINITIONS[action].mode} />
              </div>
              <div className="mt-1 text-xs opacity-75">{COMMAND_DEFINITIONS[action].description}</div>
            </button>
          ))}
        </div>
        <ControlledConfirm required={props.requiresTypedConfirmation} value={props.confirmation} onChange={props.setConfirmation} />
        <button onClick={() => props.runAction()} className="gov-button gov-button-primary mt-4">Run selected action</button>
      </Panel>
      <ResultPanel result={props.result} />
    </div>
  )
}

function DoctorPanel({ result, runDoctor, batchPath, setBatchPath }: { result: CommandExecution | null; runDoctor: () => void; batchPath: string; setBatchPath: (value: string) => void }) {
  const data = jsonRecord(result?.parsedJson)
  const blockers = arrayRecords(data.blockers)
  const cleanups = arrayRecords(data.cleanups)
  const approvals = arrayRecords(data.approvals)
  const checkers = jsonRecord(data.checkers)
  const runtime = findingsOf(result?.parsedJson).filter(item => /model|runtime|endpoint/i.test(stringValue(item.layer) + stringValue(item.id) + stringValue(item.message)))
  return (
    <div className="space-y-4">
      <BatchInput value={batchPath} onChange={setBatchPath} />
      <button onClick={runDoctor} className="gov-button gov-button-primary">Run doctor</button>
      <Panel title="Doctor Diagnosis" subtitle="Doctor is read-only and must produce exactly one safe next action.">
        <div className="grid gap-3 md:grid-cols-3">
          <Info label="Diagnosis" value={stringValue(data.final_diagnosis, 'not run')} />
          <Info label="Blockers" value={String(blockers.length)} />
          <Info label="Approvals" value={String(approvals.length)} />
        </div>
        <NextActionCard action={stringValue(data.next_action, 'Run doctor for one safe next action.')} />
        <CheckerPills checkers={checkers} />
      </Panel>
      <div className="grid gap-4 xl:grid-cols-3">
        <ListPanel title="Blockers" items={blockers} empty="No blockers reported." />
        <ListPanel title="Cleanup Candidates" items={cleanups} empty="No safe cleanup candidates reported." />
        <ListPanel title="Runtime Findings" items={runtime} empty="No runtime blockers reported." />
      </div>
      <RawOutputDetails result={result} />
    </div>
  )
}

function ApprovalCenter({ result, runAll, runPending }: { result: CommandExecution | null; runAll: () => void; runPending: () => void }) {
  const approvals = [
    ...arrayRecords(jsonRecord(result?.parsedJson).approvals),
    ...arrayRecords(jsonRecord(result?.parsedJson).items),
    ...arrayRecords(result?.parsedJson),
  ]
  const byStatus = ['pending', 'granted', 'denied', 'consumed', 'expired'].map(status => ({
    status,
    items: approvals.filter(item => stringValue(item.status, 'pending').toLowerCase() === status),
  }))
  return (
    <div className="space-y-4">
      <Panel title="Approval Controls">
        <div className="flex flex-wrap gap-2">
          <button onClick={runPending} className="gov-button gov-button-dark">List pending</button>
          <button onClick={runAll} className="gov-button gov-button-secondary">List all</button>
        </div>
        <p className="mt-3 text-sm text-slate-600">Grant and deny are intentionally not executable in V1. The console may display commands for review, but no approval is auto-granted.</p>
      </Panel>
      <div className="grid gap-4 xl:grid-cols-5">
        {byStatus.map(group => (
          <ApprovalColumn key={group.status} status={group.status} approvals={group.items} />
        ))}
      </div>
      <RawOutputDetails result={result} />
    </div>
  )
}

function DossierViewer({ result, runDossier, batchPath, setBatchPath }: { result: CommandExecution | null; runDossier: () => void; batchPath: string; setBatchPath: (value: string) => void }) {
  return (
    <div className="space-y-4">
      <BatchInput value={batchPath} onChange={setBatchPath} />
      <button onClick={runDossier} className="gov-button gov-button-primary">Generate dossier JSON</button>
      <DossierTimeline result={result} />
      <RawOutputDetails result={result} />
    </div>
  )
}

function WorkorderView({ result, runDossier }: { result: CommandExecution | null; runDossier: () => void }) {
  const data = jsonRecord(result?.parsedJson)
  const workorders = arrayRecords(data.workorders)
  return (
    <div className="space-y-4">
      <Panel title="Workorder Graph" subtitle="A lightweight dependency graph fed by batch dossier JSON. The table remains available for dense review.">
        <button onClick={runDossier} className="gov-button gov-button-primary mb-3">Load from dossier</button>
        <WorkorderGraph data={data} />
      </Panel>
      <Panel title="Workorder Table">
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="gov-table">
            <thead>
              <tr><th className="p-3">Workorder</th><th className="p-3">Agent</th><th className="p-3">Status</th><th className="p-3">Risk</th><th className="p-3">Outputs</th></tr>
            </thead>
            <tbody>
              {workorders.length === 0 ? <tr><td className="p-3 text-slate-500" colSpan={5}>Run a dossier to populate workorders and graph data.</td></tr> : null}
              {workorders.map((wo, index) => (
                <tr key={index}>
                  <td className="p-3 font-medium">{stringValue(wo.workorder_id ?? wo.id, 'unknown')}</td>
                  <td className="p-3">{stringValue(wo.agent_id ?? wo.agent, 'unknown')}</td>
                  <td className="p-3"><StatusBadge tone={toneForState(wo.status)} label={stringValue(wo.status, 'not run')} /></td>
                  <td className="p-3">{stringValue(wo.risk_category, 'unknown')}</td>
                  <td className="p-3">{stringArray(wo.expected_outputs).length}</td>
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
        <input className="gov-input mt-1" value={props.branch} onChange={event => props.setBranch(event.target.value)} />
        {props.branch.trim() === 'main' ? (
          <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            Promotion review is for feature branches. `main` has no branch diff to review, so a `main..main` NEEDS_FIX result is expected and not an API failure.
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => props.runAction('promotion.review')} className="gov-button gov-button-dark">Review branch</button>
          <button onClick={() => props.runAction('promotion.merge')} className="gov-button gov-button-warning">Merge branch</button>
          <button onClick={() => props.runAction('promotion.pushMain')} className="gov-button gov-button-warning">Push main</button>
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
      <button onClick={runLearning} className="gov-button gov-button-primary">Run learning check</button>
      <Panel title="Current Governance Handover"><MarkdownText text={snapshot?.docs.handover ?? ''} /></Panel>
      <Panel title="Current Learning Status"><MarkdownText text={snapshot?.docs.learningStatus ?? ''} /></Panel>
      <ResultPanel result={result} />
    </div>
  )
}

function RuntimeCenter({ result, runStatic, runEndpoints, mealcamOptionalOk }: { result: CommandExecution | null; runStatic: () => void; runEndpoints: () => void; mealcamOptionalOk: boolean }) {
  const data = result?.parsedJson
  const parsed = jsonRecord(data)
  const routes = arrayRecords(parsed.routes)
  const summary = jsonRecord(parsed.summary)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={runStatic} className="gov-button gov-button-dark">Run static check</button>
        <button onClick={runEndpoints} className="gov-button gov-button-secondary">Check endpoints</button>
      </div>
      {mealcamOptionalOk ? <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">MealCam runtime is optional/on-demand and offline is not a governance blocker.</div> : null}
      <div className="grid gap-3 md:grid-cols-5">
        {['critical', 'high', 'medium', 'low', 'info'].map(key => <Info key={key} label={key} value={String(summary[key] ?? 0)} />)}
      </div>
      <Panel title="Runtime Routes">
        <div className="grid gap-3 xl:grid-cols-2">
          {routes.length === 0 ? <EmptyState text="Run a runtime check to load routes." /> : null}
          {routes.map((route, index) => <RuntimeRouteCard key={index} route={route} />)}
        </div>
      </Panel>
      <RawOutputDetails result={result} />
    </div>
  )
}

function Settings({ repoRoot, projectProfile }: { repoRoot: string; projectProfile?: GovernanceSnapshot['projectProfile'] }) {
  const forbiddenCommands = Array.from(new Set([...FORBIDDEN_COMMAND_TEXT, ...(projectProfile?.forbidden_commands ?? [])]))
  return (
    <div className="space-y-4">
      <Panel title="Safety Rules">
        <div className="grid gap-3 md:grid-cols-2">
          <Info label="Project Profile" value={projectProfile ? `${projectProfile.display_name} (${projectProfile.project_id})` : 'LumeOS (lumeos)'} />
          <Info label="Repository" value={repoRoot || 'unknown'} />
          <Info label="Profile Repo Root" value={projectProfile?.repo_root ?? repoRoot ?? 'unknown'} />
          <Info label="Specs Root" value={projectProfile?.specs_root ?? 'docs/specs'} />
          <Info label="Workorders Root" value={projectProfile?.workorders_root ?? 'system/workorders'} />
          <Info label="Product Gate Profile" value={projectProfile?.product_gate ? `${projectProfile.product_gate.status}: ${projectProfile.product_gate.reason}` : 'closed'} />
          <Info label="Raw Data Paths" value={(projectProfile?.raw_data_paths ?? ['docs/specs/Nutrition/00_raw/']).join(', ')} />
          <Info label="Codex Worker Policy" value={projectProfile?.codex_worker_policy ? `enabled=${projectProfile.codex_worker_policy.enabled} agents=${projectProfile.codex_worker_policy.allowed_agents?.join(', ') ?? '(none)'}` : 'LumeOS default'} />
          <Info label="Raw BLS Policy" value="Local-only and ignored." />
          <Info label="DB Reset" value="Forbidden." />
          <Info label="Product Gate" value="Blocked unless Tom explicitly opens it." />
        </div>
      </Panel>
      <Panel title="Forbidden Commands">
        <ul className="grid gap-2 text-sm md:grid-cols-2">
          {forbiddenCommands.map(item => <li key={item} className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-900">{item}</li>)}
        </ul>
      </Panel>
      <Panel title="Allowlisted Actions">
        <div className="grid gap-2 md:grid-cols-2">
          {Object.values(COMMAND_DEFINITIONS).map(def => (
            <div key={def.action} className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm">
              <div className="font-semibold">{def.label}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500"><span>{def.action}</span><StatusBadge tone={def.controlled ? 'attention' : 'info'} label={def.mode} /></div>
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
      <input className="gov-input" value={value} onChange={event => onChange(event.target.value)} />
      <p className="mt-2 text-xs text-slate-500">Select an existing batch under system/workorders. The default is a safe governance batch, not a product import batch.</p>
    </Panel>
  )
}

function ControlledConfirm({ required, value, onChange }: { required: boolean; value: string; onChange: (value: string) => void }) {
  if (!required) return null
  return (
    <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
      <label className="block text-sm font-medium text-amber-950">Controlled action confirmation</label>
      <p className="mt-1 text-xs text-amber-900">Type CONFIRM to run this action. This does not allow forbidden commands or auto-approvals.</p>
      <input className="gov-input mt-2 border-amber-300" value={value} onChange={event => onChange(event.target.value)} />
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
  const classification = classifyCommandResult(result)
  const parsed = jsonRecord(result.parsedJson)
  const summary = summaryLine(result.parsedJson)
  const finalState = String(parsed.final_state ?? parsed.final_diagnosis ?? parsed.decision ?? 'n/a')
  const nextAction = String(parsed.next_action ?? parsed.nextAction ?? 'n/a')
  return (
    <div className="space-y-3">
      <div className={`rounded-md border p-3 text-sm ${toneClass[classification.tone] ?? toneClass.idle}`}>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={classification.tone} label={classification.label} />
          <span className="font-medium">{classification.description}</span>
        </div>
      </div>
      {result.parsedJson ? (
        <div className="grid gap-3 md:grid-cols-3">
          <Info label="Governance State" value={finalState} />
          <Info label="Summary" value={summary} />
          <Info label="Next Action" value={nextAction} />
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-3">
        <Info label="Exit Code" value={String(result.exitCode)} />
        <Info label="Timestamp" value={result.timestamp} />
        <Info label="Action" value={result.action} />
      </div>
      {commandBlock(result.command)}
      {result.parsedJson ? (
        <details className="rounded-md border border-slate-200 bg-white p-3">
          <summary className="cursor-pointer text-sm font-medium">Parsed JSON</summary>
          <pre className="mt-3 max-h-96 overflow-auto text-xs">{JSON.stringify(result.parsedJson, null, 2)}</pre>
        </details>
      ) : null}
      <details className="rounded-md border border-slate-200 bg-white p-3">
        <summary className="cursor-pointer text-sm font-medium">Raw CLI output</summary>
        <p className="mt-2 text-xs text-slate-500">Raw output is retained for audit/debugging. Prefer the parsed summary above when JSON is available.</p>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <pre className="max-h-96 overflow-auto rounded-md bg-white p-3 text-xs text-slate-800">{result.stdout || '(no stdout)'}</pre>
          <pre className="max-h-96 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-red-900">{result.stderr || '(no stderr)'}</pre>
        </div>
      </details>
    </div>
  )
}

function RawOutputDetails({ result }: { result: CommandExecution | null }) {
  if (!result) return null
  return (
    <details className="gov-panel">
      <summary className="cursor-pointer text-sm font-semibold text-slate-900">Raw command output</summary>
      <p className="mt-2 text-xs text-slate-500">Raw output is retained for audit/debugging. Prefer the structured view when JSON is available.</p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <pre className="max-h-96 overflow-auto rounded-md bg-white p-3 text-xs text-slate-800">{result.stdout || '(no stdout)'}</pre>
        <pre className="max-h-96 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-red-900">{result.stderr || '(no stderr)'}</pre>
      </div>
    </details>
  )
}

function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  return (
    <button type="button" onClick={() => copyText(value)} className="gov-button gov-button-secondary px-2 py-1 text-xs">
      {label}
    </button>
  )
}

function NextActionCard({ action, command }: { action: string; command?: string }) {
  return (
    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <StatusBadge tone="info" label="Next action" />
        <CopyButton value={command ?? action} />
      </div>
      <div className="text-sm font-semibold text-blue-950">{action}</div>
      {command ? <div className="mt-3">{commandBlock(command)}</div> : null}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">{text}</div>
}

function CheckerPills({ checkers }: { checkers: Record<string, unknown> }) {
  const entries = Object.entries(checkers)
  if (entries.length === 0) return null
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {entries.map(([name, value]) => {
        const record = jsonRecord(value)
        const status = stringValue(record.status ?? record.final_diagnosis ?? record.result, 'unknown')
        return <StatusBadge key={name} tone={toneForState(status)} label={`${name}: ${status}`} />
      })}
    </div>
  )
}

function ListPanel({ title, items, empty }: { title: string; items: Array<Record<string, unknown>>; empty: string }) {
  return (
    <Panel title={title}>
      <div className="space-y-2">
        {items.length === 0 ? <EmptyState text={empty} /> : null}
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge tone={toneForState(item.severity ?? item.status ?? item.type)} label={stringValue(item.severity ?? item.status ?? item.type, 'item')} />
              <span className="font-semibold">{stringValue(item.id ?? item.workorder_id ?? item.run_id ?? item.message, `item ${index + 1}`)}</span>
            </div>
            <p className="text-slate-600">{stringValue(item.message ?? item.reason ?? item.suggested_action, JSON.stringify(item))}</p>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function ApprovalColumn({ status, approvals }: { status: string; approvals: Array<Record<string, unknown>> }) {
  return (
    <Panel title={status}>
      <div className="space-y-2">
        {approvals.length === 0 ? <EmptyState text={`No ${status} approvals.`} /> : null}
        {approvals.map((approval, index) => {
          const grantCommand = stringValue(approval.grant_command)
          const denyCommand = stringValue(approval.deny_command)
          return (
            <div key={index} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold">{stringValue(approval.approval_id ?? approval.id, 'approval')}</div>
                <StatusBadge tone={toneForState(approval.status ?? status)} label={status} />
              </div>
              <div className="mt-2 grid gap-1 text-xs text-slate-600">
                <span>WO: {stringValue(approval.workorder_id, 'n/a')}</span>
                <span>Run: {stringValue(approval.run_id, 'n/a')}</span>
                <span>Agent: {stringValue(approval.agent_id, 'n/a')}</span>
                <span>Risk: {stringValue(approval.risk_category ?? approval.risk, 'n/a')}</span>
                <span>Tool: {stringValue(approval.tool ?? approval.operation, 'n/a')}</span>
              </div>
              <div className="mt-3 rounded-md bg-slate-50 p-2 text-xs text-slate-700">
                {stringValue(approval.reason ?? approval.scope ?? approval.suggested_review, 'Tom decision required.')}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {grantCommand ? <CopyButton value={grantCommand} label="Copy grant" /> : null}
                {denyCommand ? <CopyButton value={denyCommand} label="Copy deny" /> : null}
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

function DossierTimeline({ result }: { result: CommandExecution | null }) {
  const data = jsonRecord(result?.parsedJson)
  if (!result) return <Panel title="Dossier Timeline"><EmptyState text="Generate a dossier to view the structured timeline." /></Panel>
  const nextAction = stringValue(data.next_action, 'Review dossier output.')
  return (
    <div className="space-y-4">
      <Panel title="Dossier Summary">
        <div className="grid gap-3 md:grid-cols-4">
          <Info label="Final State" value={stringValue(data.final_state, 'unknown')} />
          <Info label="Batch" value={stringValue(data.batch_id ?? data.batch_file, 'unknown')} />
          <Info label="Runs" value={String(arrayRecords(data.runs).length)} />
          <Info label="Approvals" value={String(arrayRecords(data.approvals).length)} />
        </div>
        <NextActionCard action={nextAction} command={nextAction.includes('cmd.exe') ? nextAction : undefined} />
      </Panel>
      <div className="grid gap-4 xl:grid-cols-2">
        <TimelineSection title="Runs" items={arrayRecords(data.runs)} />
        <TimelineSection title="Approvals" items={arrayRecords(data.approvals)} />
        <TimelineSection title="Reviews" items={arrayRecords(data.reviews)} />
        <TimelineSection title="Cleanups" items={arrayRecords(data.cleanups)} />
      </div>
      <Panel title="Checker Results"><CheckerPills checkers={jsonRecord(data.checkers)} /></Panel>
      <OutputsTable outputs={arrayRecords(data.outputs)} />
      <GitStateSummary git={jsonRecord(data.git_status)} />
    </div>
  )
}

function TimelineSection({ title, items }: { title: string; items: Array<Record<string, unknown>> }) {
  return (
    <Panel title={title}>
      <div className="space-y-3">
        {items.length === 0 ? <EmptyState text={`No ${title.toLowerCase()} recorded.`} /> : null}
        {items.map((item, index) => (
          <div key={index} className="border-l-2 border-blue-200 pl-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={toneForState(item.status ?? item.event ?? item.final_state)} label={stringValue(item.status ?? item.event ?? item.final_state, 'event')} />
              <span className="font-semibold text-sm">{stringValue(item.workorder_id ?? item.run_id ?? item.approval_id ?? item.event, `${title} ${index + 1}`)}</span>
            </div>
            <div className="mt-1 text-xs leading-5 text-slate-600">
              {stringValue(item.agent_id ?? item.tier ?? item.reason ?? item.report_path ?? item.started_at ?? item.ts, JSON.stringify(item))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function OutputsTable({ outputs }: { outputs: Array<Record<string, unknown>> }) {
  return (
    <Panel title="Outputs">
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="gov-table">
          <thead><tr><th>Path</th><th>Expected</th><th>Exists</th><th>Category</th><th>Safe</th></tr></thead>
          <tbody>
            {outputs.length === 0 ? <tr><td colSpan={5} className="text-slate-500">No outputs recorded.</td></tr> : null}
            {outputs.map((output, index) => (
              <tr key={index}>
                <td className="font-medium">{stringValue(output.path, 'unknown')}</td>
                <td><StatusBadge tone={output.expected ? 'info' : 'idle'} label={String(Boolean(output.expected))} /></td>
                <td><StatusBadge tone={output.exists ? 'pass' : 'attention'} label={String(Boolean(output.exists))} /></td>
                <td>{stringValue(output.category, 'unknown')}</td>
                <td><StatusBadge tone={output.safe_to_commit ? 'pass' : 'blocked'} label={String(Boolean(output.safe_to_commit))} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function GitStateSummary({ git }: { git: Record<string, unknown> }) {
  return (
    <Panel title="Git State">
      <div className="grid gap-3 md:grid-cols-3">
        <Info label="Branch" value={stringValue(git.branch, 'unknown')} />
        <Info label="Dirty" value={String(Boolean(git.dirty))} />
        <Info label="Changes" value={String(arrayRecords(git.entries).length)} />
      </div>
    </Panel>
  )
}

function WorkorderGraph({ data }: { data: Record<string, unknown> }) {
  const workorders = arrayRecords(data.workorders)
  const runs = arrayRecords(data.runs)
  const approvals = arrayRecords(data.approvals)
  const outputs = arrayRecords(data.outputs)
  const [selectedId, setSelectedId] = useState('')

  const selected = workorders.find(item => stringValue(item.workorder_id) === selectedId) ?? workorders[0]
  if (workorders.length === 0) return <EmptyState text="No graph data available. Generate a dossier first." />

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex min-w-max items-stretch gap-4">
          {workorders.map((wo, index) => {
            const id = stringValue(wo.workorder_id, `WO-${index + 1}`)
            const run = runs.find(item => stringValue(item.workorder_id) === id)
            const approval = approvals.find(item => stringValue(item.workorder_id) === id)
            const expected = stringArray(wo.expected_outputs)
            const complete = expected.length === 0 ? 0 : expected.filter(path => outputs.some(output => stringValue(output.path) === path && output.exists)).length
            return (
              <button key={id} type="button" onClick={() => setSelectedId(id)} className={`w-72 rounded-lg border bg-white p-4 text-left shadow-sm transition hover:border-blue-300 ${selectedId === id || (!selectedId && index === 0) ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold text-slate-950">{id}</div>
                  <StatusBadge tone={toneForState(run?.status ?? wo.status)} label={stringValue(run?.status ?? wo.status, 'not run')} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge tone={toneForState(wo.risk_category)} label={stringValue(wo.risk_category, 'risk n/a')} />
                  <StatusBadge tone={approval ? toneForState(approval.status) : 'idle'} label={approval ? stringValue(approval.status, 'approval') : 'no approval'} />
                  <StatusBadge tone={complete === expected.length ? 'pass' : 'attention'} label={`outputs ${complete}/${expected.length}`} />
                </div>
                <div className="mt-3 text-xs text-slate-500">Agent: {stringValue(wo.agent_id, 'unknown')}</div>
                <DependencyChips blockedBy={stringArray(wo.blocked_by)} />
              </button>
            )
          })}
        </div>
      </div>
      <WorkorderDetails workorder={selected} runs={runs} approvals={approvals} />
    </div>
  )
}

function DependencyChips({ blockedBy }: { blockedBy: string[] }) {
  if (blockedBy.length === 0) return <div className="mt-3 text-xs text-slate-400">No upstream dependencies.</div>
  return (
    <div className="mt-3 flex flex-wrap gap-1">
      {blockedBy.map(item => <span key={item} className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600">depends on {item}</span>)}
    </div>
  )
}

function WorkorderDetails({ workorder, runs, approvals }: { workorder?: Record<string, unknown>; runs: Array<Record<string, unknown>>; approvals: Array<Record<string, unknown>> }) {
  if (!workorder) return <EmptyState text="Select a workorder to inspect details." />
  const id = stringValue(workorder.workorder_id)
  const latestRun = runs.find(item => stringValue(item.workorder_id) === id)
  const approval = approvals.find(item => stringValue(item.workorder_id) === id)
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-semibold">{id || 'Workorder'}</h3>
        <StatusBadge tone={toneForState(latestRun?.status ?? workorder.status)} label={stringValue(latestRun?.status ?? workorder.status, 'not run')} />
      </div>
      <DetailList title="Source refs" items={stringArray(workorder.source_refs)} />
      <DetailList title="Scope files" items={stringArray(workorder.scope_files)} />
      <DetailList title="Files blocked" items={stringArray(workorder.files_blocked)} />
      <DetailList title="Expected outputs" items={stringArray(workorder.expected_outputs)} />
      <div className="mt-3 grid gap-2 text-xs">
        <span>Latest run: {stringValue(latestRun?.run_id, 'none')}</span>
        <span>Approval: {approval ? stringValue(approval.status, 'unknown') : 'none'}</span>
      </div>
    </div>
  )
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      {items.length === 0 ? <div className="mt-1 text-xs text-slate-400">None recorded.</div> : (
        <ul className="mt-1 space-y-1 text-xs text-slate-700">
          {items.slice(0, 8).map(item => <li key={item} className="break-words rounded bg-slate-50 px-2 py-1">{item}</li>)}
        </ul>
      )}
    </div>
  )
}

function RuntimeRouteCard({ route }: { route: Record<string, unknown> }) {
  const optional = Boolean(route.optional_runtime)
  const runtimeType = stringValue(route.runtime_type, 'http/vllm')
  const status = stringValue(route.endpoint_status ?? route.status, runtimeType.includes('codex') ? 'external_ok' : 'not checked')
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-semibold">{stringValue(route.agent, 'unknown agent')}</div>
          <div className="mt-1 text-xs text-slate-500">{stringValue(route.model, 'unknown model')}</div>
        </div>
        <StatusBadge tone={toneForState(status)} label={status} />
      </div>
      <div className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
        <span>Runtime: {runtimeType}</span>
        <span>Endpoint: {stringValue(route.endpoint, 'n/a')}</span>
        <span>JSON mode: {stringValue(route.json_mode ?? route.requires_json, 'n/a')}</span>
        <span>Thinking: {stringValue(route.enable_thinking ?? route.thinking_policy, 'n/a')}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <StatusBadge tone={optional ? 'info' : 'pass'} label={optional ? 'optional/on-demand' : 'required'} />
        {stringValue(route.agent) === 'mealcam-agent' ? <StatusBadge tone="info" label="MealCam optional" /> : null}
        {runtimeType.includes('codex') ? <StatusBadge tone="info" label="Codex external" /> : null}
      </div>
    </div>
  )
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="gov-panel">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 break-words text-sm font-medium text-slate-900">{value}</div>
    </div>
  )
}

function StatusBadge({ tone, label }: { tone: string; label: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ${badgeClass[tone] ?? badgeClass.idle}`}>
      {label}
    </span>
  )
}

function MarkdownText({ text }: { text: string }) {
  return <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-800">{text || 'Not loaded.'}</pre>
}
