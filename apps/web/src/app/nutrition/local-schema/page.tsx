import { LocalSchemaDebugError, getLocalNutritionSchemaDebug } from '../../../lib/nutrition/local-schema-debug'

export const dynamic = 'force-dynamic'

function StatusBadge({ tone, label }: { tone: 'pass' | 'attention' | 'blocked'; label: string }) {
  const toneClass = tone === 'pass'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
    : tone === 'attention'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-red-200 bg-red-50 text-red-900'

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass}`}>
      {label}
    </span>
  )
}

export default async function LocalNutritionSchemaPage() {
  try {
    const snapshot = await getLocalNutritionSchemaDebug()
    const isExpectedEmpty = snapshot.table_exists && snapshot.row_count === 0

    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-300">LumeOS Nutrition Local Debug</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">nutrition.nutrient_defs</h1>
              <p className="mt-3 max-w-3xl text-sm text-slate-300">
                Local-only, read-only schema visibility for the first Nutrition database slice. This view never applies migrations,
                seeds, or import steps. It only inspects the local Supabase/Test DB container.
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              <div>Container: <span className="font-mono text-slate-100">{snapshot.container}</span></div>
              <div className="mt-1">Checked: <span className="font-mono text-slate-100">{snapshot.checkedAt}</span></div>
              <div className="mt-1">API: <span className="font-mono text-slate-100">/api/nutrition/local-schema</span></div>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Schema</div>
              <div className="mt-3">
                <StatusBadge tone={snapshot.schema_exists ? 'pass' : 'blocked'} label={snapshot.schema_exists ? 'Present' : 'Missing'} />
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Table</div>
              <div className="mt-3">
                <StatusBadge tone={snapshot.table_exists ? 'pass' : 'blocked'} label={snapshot.table_exists ? 'Present' : 'Missing'} />
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Rows</div>
              <div className="mt-3 text-3xl font-semibold text-slate-100">{snapshot.row_count}</div>
              <div className="mt-2 text-xs text-slate-400">
                {isExpectedEmpty ? 'Expected while seed payload remains blocked.' : 'Local row count only.'}
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Columns</div>
              <div className="mt-3 text-3xl font-semibold text-slate-100">{snapshot.columns.length}</div>
              <div className="mt-2 text-xs text-slate-400">Expected target shape: 16 columns, including Thai i18n columns.</div>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Column Shape</h2>
                <StatusBadge tone={snapshot.columns.length === 16 ? 'pass' : 'attention'} label={snapshot.columns.length === 16 ? 'Expected count' : 'Review count'} />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-slate-400">
                      <th className="px-3 py-2 font-medium">Column</th>
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">Nullable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.columns.map((column) => (
                      <tr key={column.name} className="border-b border-slate-900/80">
                        <td className="px-3 py-2 font-mono text-slate-100">{column.name}</td>
                        <td className="px-3 py-2 text-slate-300">{column.data_type}</td>
                        <td className="px-3 py-2 text-slate-300">{column.is_nullable ? 'yes' : 'no'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-xs text-slate-400">
                Current target i18n columns: <span className="font-mono text-slate-200">name_de</span>, <span className="font-mono text-slate-200">name_en</span>, <span className="font-mono text-slate-200">name_th</span>, <span className="font-mono text-slate-200">group_de</span>, <span className="font-mono text-slate-200">group_en</span>, <span className="font-mono text-slate-200">group_th</span>.
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Indexes</h2>
                  <StatusBadge tone={snapshot.indexes.some((item) => item.name === 'nutrient_defs_group_sort_idx') ? 'pass' : 'attention'} label="Local" />
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                  {snapshot.indexes.map((item) => (
                    <li key={item.name} className="rounded-md border border-slate-800 bg-slate-950/70 p-3">
                      <div className="font-mono text-slate-100">{item.name}</div>
                      <div className="mt-2 break-words text-xs text-slate-400">{item.definition}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Constraints</h2>
                  <StatusBadge tone={snapshot.constraints.some((item) => item.name === 'nutrient_defs_display_tier_check') ? 'pass' : 'attention'} label="Local" />
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                  {snapshot.constraints.map((item) => (
                    <li key={item.name} className="rounded-md border border-slate-800 bg-slate-950/70 p-3">
                      <div className="font-mono text-slate-100">{item.name}</div>
                      <div className="mt-2 break-words text-xs text-slate-400">{item.definition}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    )
  } catch (error) {
    const message = error instanceof LocalSchemaDebugError
      ? `${error.code}: ${error.message}`
      : error instanceof Error
        ? error.message
        : String(error)

    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="rounded-xl border border-red-900/70 bg-red-950/40 p-6">
            <StatusBadge tone="blocked" label="Local debug unavailable" />
            <h1 className="mt-4 text-2xl font-semibold">nutrition.nutrient_defs debug view failed</h1>
            <p className="mt-3 text-sm text-red-100/85">
              The local-only schema debug view could not query the local Supabase/Test DB container.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-red-100">{message}</pre>
          </div>
        </div>
      </main>
    )
  }
}
