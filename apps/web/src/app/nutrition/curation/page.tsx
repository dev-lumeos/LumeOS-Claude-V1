import Link from 'next/link'

import { getNutritionCurationData } from '../../../lib/nutrition/curation'

export const dynamic = 'force-dynamic'

export default async function NutritionCurationPage() {
  const payload = await getNutritionCurationData()

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-300">LumeOS Nutrition Local</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Human Layer Curation</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Read-only local curation dashboard for unassigned foods, category coverage, source-backed aliases,
              preference mapping gaps, and V1 tag coverage.
            </p>
          </div>
          <div className="flex gap-2">
            <Link className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-100 hover:border-slate-500" href="/nutrition">
              Food Search
            </Link>
            <Link className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-100 hover:border-slate-500" href="/api/nutrition/curation">
              Curation API
            </Link>
          </div>
        </div>

        <section className="mb-6 rounded-lg border border-amber-700/50 bg-amber-950/30 p-4 text-sm text-amber-100">
          <div className="font-semibold">Read-only curation foundation.</div>
          <p className="mt-1 leading-6">
            This page does not create human-friendly names, aliases, categories, or preference mappings. It exposes the
            source-backed state and unresolved work that needs explicit curation.
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Foods" value={payload.counts.foods} />
          <Metric label="Categorized foods" value={payload.counts.assigned_foods} />
          <Metric label="Unassigned foods" value={payload.counts.unassigned_foods} />
          <Metric label="Aliases" value={payload.counts.food_aliases} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Category Coverage</h2>
            <div className="mt-4 grid gap-2">
              {payload.category_levels.map(level => (
                <div className="flex items-center justify-between rounded border border-slate-800 bg-slate-950 px-3 py-2 text-sm" key={level.level}>
                  <span className="text-slate-300">Level {level.level}</span>
                  <span className="font-mono text-slate-100">{level.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Preference Mapping Status</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label="Mapped exclusions" value={payload.preference_mapping.general_exclusions.mapped} />
              <Metric label="Unresolved exclusions" value={payload.preference_mapping.general_exclusions.unresolved} />
              <Metric label="Unresolved items" value={payload.preference_mapping.food_preference_items.unresolved} />
            </div>
            <div className="mt-4 text-sm text-slate-300">
              <div className="font-medium text-slate-100">Unresolved exclusion presets</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {payload.preference_mapping.general_exclusions.unresolved_codes.map(code => (
                  <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300" key={code}>{code}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Unassigned Foods</h2>
              <p className="mt-1 text-sm text-slate-400">First examples requiring human or deterministic curation.</p>
            </div>
            <span className="rounded-full border border-slate-700 px-2.5 py-1 font-mono text-xs text-slate-300">
              {payload.counts.unassigned_foods} total
            </span>
          </div>
          <div className="mt-4 overflow-x-auto rounded-md border border-slate-800">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-left text-slate-400">
                  <th className="px-3 py-2 font-medium">BLS code</th>
                  <th className="px-3 py-2 font-medium">Source label</th>
                  <th className="px-3 py-2 font-medium">Macros</th>
                  <th className="px-3 py-2 font-medium">Tags</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payload.unassigned_examples.map(food => (
                  <tr className="border-b border-slate-900/80" key={food.id}>
                    <td className="px-3 py-2 font-mono text-slate-100">{food.bls_code}</td>
                    <td className="px-3 py-2 text-slate-200">{food.source_label}</td>
                    <td className="px-3 py-2 text-xs text-slate-300">
                      {food.enercc ? `${Number(food.enercc).toFixed(0)} kcal` : 'kcal n/a'}
                      {' / '}
                      {food.prot625 ? `${Number(food.prot625).toFixed(1)} g protein` : 'protein n/a'}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-300">{food.tags.length ? food.tags.join(', ') : 'none'}</td>
                    <td className="px-3 py-2 text-xs text-amber-200">needs curation</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">V1 Tag Coverage</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {payload.tag_coverage.map(tag => (
              <div className="rounded border border-slate-800 bg-slate-950 p-3" key={tag.code}>
                <div className="font-mono text-xs text-slate-500">{tag.code}</div>
                <div className="mt-1 text-sm text-slate-200">{tag.name_de}</div>
                <div className="mt-2 text-lg font-semibold text-slate-100">{tag.food_count}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-100">{value}</div>
    </div>
  )
}
