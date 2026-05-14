import Link from 'next/link'

import { LocalFoodSearchError, getLocalFoodSearch, normalizeFoodSearchText } from '../../lib/nutrition/food-search'

export const dynamic = 'force-dynamic'

type NutritionPageProps = {
  searchParams?: {
    q?: string
    food?: string
  }
}

const COMMON_NUTRIENTS = new Set(['ENERCJ', 'ENERCC', 'PROT625', 'FAT', 'CHO', 'FIBC', 'SUGAR', 'NA'])

function buildFoodHref(query: string, foodId: string): string {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  params.set('food', foodId)
  return `/nutrition?${params.toString()}`
}

function FoodSearchErrorView({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-lg border border-red-900/70 bg-red-950/40 p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-red-200">Local food search unavailable</div>
          <h1 className="mt-4 text-2xl font-semibold">Nutrition Food Search</h1>
          <p className="mt-3 text-sm text-red-100/85">{message}</p>
        </div>
      </div>
    </main>
  )
}

export default async function NutritionPage({ searchParams }: NutritionPageProps) {
  const query = searchParams?.q ?? ''
  const selectedFoodId = searchParams?.food

  try {
    const payload = await getLocalFoodSearch(query, selectedFoodId)
    const commonNutrients = payload.nutrients.filter(item => COMMON_NUTRIENTS.has(item.nutrient_code))
    const otherNutrients = payload.nutrients.filter(item => !COMMON_NUTRIENTS.has(item.nutrient_code))

    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-emerald-300">LumeOS Nutrition Local</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Food Search</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Read-only local search over the BLS-backed food foundation. Food names shown here are source labels from BLS,
                not final human-friendly product labels.
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              <div>Container: <span className="font-mono text-slate-100">{payload.container}</span></div>
              <div className="mt-1">API: <span className="font-mono text-slate-100">/api/nutrition/foods</span></div>
              <div className="mt-1">Mode: <span className="font-mono text-slate-100">read-only local</span></div>
            </div>
          </div>

          <section className="mb-6 rounded-lg border border-amber-700/50 bg-amber-950/30 p-4 text-sm text-amber-100">
            <div className="font-semibold">Source label from BLS.</div>
            <p className="mt-1 leading-6">
              Human-friendly names, aliases, categories, and search normalization are future work. This page does not invent
              display names, aliases, categories, or nutrient values.
            </p>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
              <form action="/nutrition" className="flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
                  defaultValue={query}
                  name="q"
                  placeholder="Search BLS source labels, e.g. kuerbis, öl, brot"
                />
                <button
                  className="rounded-md border border-emerald-400 bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-300"
                  type="submit"
                >
                  Search
                </button>
              </form>
              <div className="mt-3 text-xs text-slate-400">
                Normalized query: <span className="font-mono text-slate-200">{normalizeFoodSearchText(query) || '(all local foods)'}</span>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Matches</h2>
                <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300">
                  {payload.result_count} shown
                </span>
              </div>

              {payload.foods.length === 0 ? (
                <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                  No local BLS-backed food matched this search.
                </div>
              ) : (
                <div className="mt-4 max-h-[620px] space-y-2 overflow-auto pr-1">
                  {payload.foods.map((food) => {
                    const selected = payload.selected_food?.id === food.id
                    return (
                      <Link
                        className={`block rounded-md border p-3 text-sm transition ${
                          selected
                            ? 'border-emerald-400 bg-emerald-950/40'
                            : 'border-slate-800 bg-slate-950/70 hover:border-slate-600'
                        }`}
                        href={buildFoodHref(query, food.id)}
                        key={food.id}
                      >
                        <div className="font-mono text-xs text-slate-400">{food.bls_code}</div>
                        <div className="mt-1 font-medium text-slate-100">{food.source_label}</div>
                        <div className="mt-1 text-xs text-slate-500">BLS source label, not final product copy</div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Food Detail</h2>
                  <p className="mt-1 text-xs text-slate-400">Per 100 g values from local BLS-backed nutrient rows.</p>
                </div>
                {payload.selected_food ? (
                  <span className="rounded-full border border-slate-700 px-2.5 py-1 font-mono text-xs text-slate-300">
                    {payload.selected_food.bls_code}
                  </span>
                ) : null}
              </div>

              {!payload.selected_food ? (
                <div className="rounded-md border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                  Select a matching food to inspect linked nutrients.
                </div>
              ) : (
                <>
                  <div className="rounded-md border border-slate-800 bg-slate-950/70 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Source label</div>
                    <div className="mt-2 text-xl font-semibold text-slate-100">{payload.selected_food.source_label}</div>
                    <div className="mt-2 text-sm text-slate-400">{payload.selected_food.name_en || 'No English source label available.'}</div>
                    <div className="mt-3 text-xs text-amber-200">
                      This is the BLS technical source label. Human-friendly naming and aliases are intentionally not present yet.
                    </div>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">Priority nutrients</h3>
                    <NutrientTable rows={commonNutrients} />
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">All linked nutrients</h3>
                    <NutrientTable rows={otherNutrients} />
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    )
  } catch (error) {
    const message = error instanceof LocalFoodSearchError
      ? `${error.code}: ${error.message}`
      : error instanceof Error
        ? error.message
        : String(error)
    return <FoodSearchErrorView message={message} />
  }
}

function NutrientTable({ rows }: { rows: Array<{ nutrient_code: string; name_de: string; name_en: string; unit: string; value: string }> }) {
  if (rows.length === 0) {
    return (
      <div className="mt-3 rounded-md border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
        No linked nutrient values are available for this section.
      </div>
    )
  }

  return (
    <div className="mt-3 overflow-x-auto rounded-md border border-slate-800">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950 text-left text-slate-400">
            <th className="px-3 py-2 font-medium">Code</th>
            <th className="px-3 py-2 font-medium">DE name</th>
            <th className="px-3 py-2 font-medium">EN name</th>
            <th className="px-3 py-2 font-medium">Unit</th>
            <th className="px-3 py-2 text-right font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-slate-900/80" key={row.nutrient_code}>
              <td className="px-3 py-2 font-mono text-slate-100">{row.nutrient_code}</td>
              <td className="px-3 py-2 text-slate-200">{row.name_de}</td>
              <td className="px-3 py-2 text-slate-300">{row.name_en}</td>
              <td className="px-3 py-2 text-slate-300">{row.unit}</td>
              <td className="px-3 py-2 text-right font-mono text-slate-100">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
