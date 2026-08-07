import { LocalSchemaDebugError, getLocalNutritionSchemaDebug } from '../../../lib/nutrition/local-schema-debug'
import { NutrientPreviewFilter } from './nutrient-preview-filter'

export const dynamic = 'force-dynamic'

/** Erwartete Zahl der Nährstoffdefinitionen nach dem 015-Katalog-Seed. */
const EXPECTED_NUTRIENT_DEFS = 138

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
    // C-10 (2026-08-06): Diese 138 ist KEINE Anzeigezahl, sondern eine
    // Erwartung — sie beantwortet „entspricht der lokale Seed dem
    // Katalog?". Sie gehört deshalb hart und darf NICHT aus derselben
    // Tabelle geladen werden, die sie prüft; sonst stimmt sie immer und
    // die Diagnose ist wertlos.
    // Soll: 138 Nährstoffdefinitionen aus
    // `_pipeline/015_kataloge/015_nutrient_defs_seed.sql`.
    // `[cmd]` 2026-08-06 gegen die laufende Instanz geprüft: 138 — stimmt.
    const hasLocalSeedRows = snapshot.table_exists && snapshot.row_count === EXPECTED_NUTRIENT_DEFS
    const foodFoundation = snapshot.food_foundation
    const foodFoundationReady = foodFoundation.foods_table_exists
      && foodFoundation.food_nutrients_table_exists
      && foodFoundation.food_nutrients_nutrient_fk_exists

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
                {hasLocalSeedRows ? 'Expected after local-only nutrient_defs seed apply.' : 'Local row count only.'}
              </div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Columns</div>
              <div className="mt-3 text-3xl font-semibold text-slate-100">{snapshot.columns.length}</div>
              <div className="mt-2 text-xs text-slate-400">Expected target shape: 16 columns, including Thai i18n columns.</div>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Food Foundation</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Local food foundation status for future food search. This view does not provide food search,
                  broad BLS import, raw BLS storage, or editable food data.
                </p>
              </div>
              <StatusBadge tone={foodFoundationReady ? 'pass' : 'attention'} label={foodFoundationReady ? 'Schema ready' : 'Schema pending'} />
            </div>
            <div className="grid gap-3 md:grid-cols-5">
              <div className="rounded-md border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">foods</div>
                <div className="mt-2">
                  <StatusBadge tone={foodFoundation.foods_table_exists ? 'pass' : 'attention'} label={foodFoundation.foods_table_exists ? 'Present' : 'Missing'} />
                </div>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">food_nutrients</div>
                <div className="mt-2">
                  <StatusBadge tone={foodFoundation.food_nutrients_table_exists ? 'pass' : 'attention'} label={foodFoundation.food_nutrients_table_exists ? 'Present' : 'Missing'} />
                </div>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">food rows</div>
                <div className="mt-2 font-mono text-2xl text-slate-100">{foodFoundation.foods_row_count}</div>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">nutrient rows</div>
                <div className="mt-2 font-mono text-2xl text-slate-100">{foodFoundation.food_nutrients_row_count}</div>
              </div>
              <div className="rounded-md border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">nutrient FK</div>
                <div className="mt-2">
                  <StatusBadge tone={foodFoundation.food_nutrients_nutrient_fk_exists ? 'pass' : 'blocked'} label={foodFoundation.food_nutrients_nutrient_fk_exists ? 'Present' : 'Missing'} />
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Row counts reflect local-only governed staging boundaries. They are source-backed local samples only,
              not a broad BLS import or production dataset.
            </p>
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
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">RDA Fields</h2>
                  <StatusBadge tone="attention" label="Partial by design" />
                </div>
                <dl className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">Male</dt>
                    <dd className="mt-1 font-mono text-slate-100">{snapshot.rda_summary.rda_male_populated}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">Female</dt>
                    <dd className="mt-1 font-mono text-slate-100">{snapshot.rda_summary.rda_female_populated}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">Units</dt>
                    <dd className="mt-1 font-mono text-slate-100">{snapshot.rda_summary.rda_unit_populated}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs leading-5 text-slate-400">
                  Missing RDA/reference values are expected until a separate verified source candidate defines the model,
                  source priority, sex and age groups, and units.
                </p>
              </div>

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

          <section className="mt-8 rounded-lg border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Grouped Counts</h2>
                <p className="mt-1 text-xs text-slate-400">Rows grouped by German and English nutrient group labels.</p>
              </div>
              <StatusBadge tone={snapshot.group_counts.length > 0 ? 'pass' : 'attention'} label={`${snapshot.group_counts.length} groups`} />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-slate-400">
                    <th className="px-3 py-2 font-medium">group_de</th>
                    <th className="px-3 py-2 font-medium">group_en</th>
                    <th className="px-3 py-2 text-right font-medium">Rows</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.group_counts.map((group) => (
                    <tr key={`${group.group_de}:${group.group_en}`} className="border-b border-slate-900/80">
                      <td className="px-3 py-2 text-slate-100">{group.group_de}</td>
                      <td className="px-3 py-2 text-slate-300">{group.group_en}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-100">{group.row_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <NutrientPreviewFilter
            groups={snapshot.group_counts}
            hasLocalSeedRows={hasLocalSeedRows}
            rows={snapshot.nutrient_preview}
          />
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
