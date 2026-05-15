import Link from 'next/link'

import { getNutritionCurationData } from '../../../lib/nutrition/curation'

export const dynamic = 'force-dynamic'

type NutritionCurationPageProps = {
  searchParams?: {
    unassigned?: string
    category?: string
    tag?: string
    alias?: string
    sort?: string
  }
}

function curationHref(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }
  const query = search.toString()
  return query ? `/nutrition/curation?${query}` : '/nutrition/curation'
}

export default async function NutritionCurationPage({ searchParams }: NutritionCurationPageProps) {
  const unassigned = searchParams?.unassigned ?? 'true'
  const category = searchParams?.category ?? ''
  const tag = searchParams?.tag ?? ''
  const alias = searchParams?.alias ?? ''
  const sort = searchParams?.sort ?? 'category_missing_first'
  const payload = await getNutritionCurationData({
    unassignedOnly: unassigned !== 'false',
    category,
    tag,
    aliasState: alias === 'has' || alias === 'missing' ? alias : '',
    sort: ['sort_weight_desc', 'name_asc', 'macro_relevance', 'category_missing_first'].includes(sort)
      ? sort as 'sort_weight_desc' | 'name_asc' | 'macro_relevance' | 'category_missing_first'
      : 'category_missing_first',
  })

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

        <section className="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Curation Persistence Foundation</h2>
              <p className="mt-1 text-sm text-slate-400">
                Local-only tables are for future auditable review decisions. This page still performs no writes.
              </p>
            </div>
            <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300">
              write UI disabled
            </span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-5">
            <Metric label="Candidates table" value={payload.candidate_tables.candidates_table_exists ? 1 : 0} />
            <Metric label="Decisions table" value={payload.candidate_tables.decisions_table_exists ? 1 : 0} />
            <Metric label="Candidates" value={payload.candidate_tables.candidates} />
            <Metric label="Pending" value={payload.candidate_tables.pending_candidates} />
            <Metric label="Decisions" value={payload.candidate_tables.decisions} />
          </div>
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
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Link className={`rounded-full border px-2.5 py-1 ${unassigned !== 'false' ? 'border-emerald-400 bg-emerald-400 text-emerald-950' : 'border-slate-700 text-slate-300'}`} href={curationHref({ unassigned: 'true', sort })}>
              Unassigned only
            </Link>
            <Link className={`rounded-full border px-2.5 py-1 ${unassigned === 'false' ? 'border-emerald-400 bg-emerald-400 text-emerald-950' : 'border-slate-700 text-slate-300'}`} href={curationHref({ unassigned: 'false', sort })}>
              Include categorized
            </Link>
            <Link className={`rounded-full border px-2.5 py-1 ${alias === 'has' ? 'border-emerald-400 bg-emerald-400 text-emerald-950' : 'border-slate-700 text-slate-300'}`} href={curationHref({ unassigned, alias: 'has', sort })}>
              Has aliases
            </Link>
            <Link className={`rounded-full border px-2.5 py-1 ${alias === 'missing' ? 'border-emerald-400 bg-emerald-400 text-emerald-950' : 'border-slate-700 text-slate-300'}`} href={curationHref({ unassigned, alias: 'missing', sort })}>
              Missing aliases
            </Link>
            <Link className={`rounded-full border px-2.5 py-1 ${sort === 'sort_weight_desc' ? 'border-emerald-400 bg-emerald-400 text-emerald-950' : 'border-slate-700 text-slate-300'}`} href={curationHref({ unassigned, alias, sort: 'sort_weight_desc' })}>
              Sort weight
            </Link>
            <Link className={`rounded-full border px-2.5 py-1 ${sort === 'macro_relevance' ? 'border-emerald-400 bg-emerald-400 text-emerald-950' : 'border-slate-700 text-slate-300'}`} href={curationHref({ unassigned, alias, sort: 'macro_relevance' })}>
              Macro relevance
            </Link>
            <Link className={`rounded-full border px-2.5 py-1 ${sort === 'name_asc' ? 'border-emerald-400 bg-emerald-400 text-emerald-950' : 'border-slate-700 text-slate-300'}`} href={curationHref({ unassigned, alias, sort: 'name_asc' })}>
              Name
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto rounded-md border border-slate-800">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-left text-slate-400">
                  <th className="px-3 py-2 font-medium">BLS code</th>
                  <th className="px-3 py-2 font-medium">Source label</th>
                  <th className="px-3 py-2 font-medium">Macros</th>
                  <th className="px-3 py-2 font-medium">Aliases</th>
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
                    <td className="px-3 py-2 text-xs text-slate-300">{food.alias_count}</td>
                    <td className="px-3 py-2 text-xs text-slate-300">{food.tags.length ? food.tags.join(', ') : 'none'}</td>
                    <td className="px-3 py-2 text-xs text-amber-200">
                      {food.curation_status === 'categorized' ? food.current_category_name_de : food.unresolved_reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">Preference Mapping Workbench</h2>
          <p className="mt-1 text-sm text-slate-400">
            Read-only mapping status for old-platform preference groups and items. No food-id mapping is guessed.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <Metric label="Mapped groups" value={payload.preference_mapping.food_preference_groups.mapped} />
            <Metric label="Unresolved groups" value={payload.preference_mapping.food_preference_groups.unresolved} />
            <Metric label="Mapped exclusions" value={payload.preference_mapping.general_exclusions.mapped} />
            <Metric label="Unresolved exclusions" value={payload.preference_mapping.general_exclusions.unresolved} />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {payload.preference_mapping.groups.map(group => (
              <div className="rounded border border-slate-800 bg-slate-950 p-3" key={group.code}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-100">{group.label_de}</div>
                    <div className="mt-1 font-mono text-xs text-slate-500">{group.code}</div>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${group.mapping_status === 'mapped' ? 'border-emerald-700 text-emerald-200' : 'border-amber-700 text-amber-200'}`}>
                    {group.mapping_status}
                  </span>
                </div>
                <div className="mt-2 text-xs leading-5 text-slate-400">{group.mapping_note}</div>
                <div className="mt-2 text-xs text-slate-300">
                  Target: {group.mapped_target_type || group.target_type}
                  {group.mapped_codes.length ? ` / ${group.mapped_codes.join(', ')}` : ''}
                </div>
                <div className="mt-2 text-xs text-slate-500">{group.unresolved_items} unresolved item-level mappings</div>
              </div>
            ))}
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
