import Link from 'next/link'

import {
  LocalFoodSearchError,
  buildFoodSearchFilterHref,
  getLocalFoodSearch,
  normalizeFoodSearchText,
} from '../../lib/nutrition/food-search'
import { deterministicExclusionOptions, getPreferenceSearchPreview } from '../../lib/nutrition/preference-search-preview'
import { getNutritionPreferenceCatalog, summarizePreferenceCatalog } from '../../lib/nutrition/preferences-catalog'

export const dynamic = 'force-dynamic'

type NutritionPageProps = {
  searchParams?: {
    q?: string
    food?: string
    category?: string
    tag?: string
    sort?: string
    offset?: string
    exclusions?: string
    liked_categories?: string
    liked_tags?: string
  }
}

const COMMON_NUTRIENTS = new Set(['ENERCJ', 'ENERCC', 'PROT625', 'FAT', 'CHO', 'FIBT', 'SUGAR', 'NA'])

function buildFoodHref(query: string, category: string, tag: string, sort: string, offset: number, foodId: string): string {
  return buildFoodSearchFilterHref({ query, category, tag, sort, offset, food: foodId })
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

type FacetItem = {
  key: string
  label: string
  count: number
  href: string
}

function FacetSection({ active, clearHref, items, title }: { active: string; clearHref: string; items: FacetItem[]; title: string }) {
  if (items.length === 0) return null

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</h3>
        {active ? (
          <Link className="text-xs text-emerald-300 hover:text-emerald-200" href={clearHref}>
            Clear
          </Link>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 18).map(item => {
          const selected = active === item.key
          return (
            <Link
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                selected
                  ? 'border-emerald-400 bg-emerald-400 text-emerald-950'
                  : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'
              }`}
              href={item.href}
              key={item.key}
            >
              {item.label} <span className={selected ? 'text-emerald-950/70' : 'text-slate-500'}>{item.count}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default async function NutritionPage({ searchParams }: NutritionPageProps) {
  const query = searchParams?.q ?? ''
  const selectedFoodId = searchParams?.food
  const category = searchParams?.category ?? ''
  const tag = searchParams?.tag ?? ''
  const sort = searchParams?.sort ?? 'relevance'
  const offset = Number.parseInt(searchParams?.offset ?? '0', 10)
  const exclusions = searchParams?.exclusions ?? ''
  const likedCategories = searchParams?.liked_categories ?? ''
  const likedTags = searchParams?.liked_tags ?? ''

  try {
    const payload = await getLocalFoodSearch(query, selectedFoodId, { category, tag, sort, offset })
    const preferencePreview = await getPreferenceSearchPreview({
      query,
      exclusions,
      likedCategories,
      likedTags,
      limit: 5,
      sort,
    })
    const exclusionOptions = deterministicExclusionOptions()
    const preferenceCatalog = getNutritionPreferenceCatalog()
    const preferenceSummary = summarizePreferenceCatalog(preferenceCatalog)
    const commonNutrients = payload.nutrients.filter(item => COMMON_NUTRIENTS.has(item.nutrient_code))
    const otherNutrients = payload.nutrients.filter(item => !COMMON_NUTRIENTS.has(item.nutrient_code))
    const nextOffset = payload.offset + payload.limit
    const hasMore = nextOffset < payload.total

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
              Human-friendly names remain future work. Category and tag filters are local Human Layer foundations seeded
              from current specs and deterministic BLS-backed rules. This page does not invent display names, aliases,
              categories, or nutrient values.
            </p>
          </section>

          <section className="mb-6 rounded-lg border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Preferences foundation</div>
                <p className="mt-2 max-w-3xl leading-6">
                  Read-only local catalog for diet type, allergies, exclusions, cuisines, cooking constraints, and
                  like/dislike curation. User persistence and Smart Search application remain a separate governed step.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-100 hover:border-slate-500" href="/api/nutrition/preferences/catalog">
                  Catalog API
                </Link>
                <Link className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-100 hover:border-slate-500" href="/nutrition/curation">
                  Curation
                </Link>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded border border-slate-800 bg-slate-950 p-3">
                <div className="text-slate-500">Diet types</div>
                <div className="mt-1 text-lg font-semibold text-slate-100">{preferenceSummary.diet_types}</div>
              </div>
              <div className="rounded border border-slate-800 bg-slate-950 p-3">
                <div className="text-slate-500">Allergies / intolerances</div>
                <div className="mt-1 text-lg font-semibold text-slate-100">{preferenceSummary.allergies_intolerances}</div>
              </div>
              <div className="rounded border border-slate-800 bg-slate-950 p-3">
                <div className="text-slate-500">Food preference items</div>
                <div className="mt-1 text-lg font-semibold text-slate-100">{preferenceSummary.food_preference_items}</div>
              </div>
              <div className="rounded border border-slate-800 bg-slate-950 p-3">
                <div className="text-slate-500">Mapped exclusions</div>
                <div className="mt-1 text-lg font-semibold text-slate-100">
                  {preferenceSummary.mapped_general_exclusions}/{preferenceSummary.general_exclusions}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-6 rounded-lg border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Preference-aware preview</div>
                <p className="mt-2 max-w-3xl leading-6">
                  Local-only preview mode. Deterministic hard exclusions remove matching categories; category/tag likes
                  boost ranking. Unsupported exclusions stay unresolved and are not applied.
                </p>
              </div>
              <Link
                className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-100 hover:border-slate-500"
                href={`/api/nutrition/foods/smart-preview?q=${encodeURIComponent(query)}&exclusions=${encodeURIComponent(exclusions)}&liked_categories=${encodeURIComponent(likedCategories)}&liked_tags=${encodeURIComponent(likedTags)}`}
              >
                Preview API
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {exclusionOptions.map(option => {
                const selected = exclusions.split(',').includes(option.code)
                const href = selected
                  ? buildFoodSearchFilterHref({ query, category, tag, sort, offset }, { food: null })
                  : `${buildFoodSearchFilterHref({ query, category, tag, sort, offset }, { food: null })}&exclusions=${encodeURIComponent(option.code)}`
                return (
                  <Link
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      selected
                        ? 'border-amber-300 bg-amber-300 text-amber-950'
                        : option.mapping_status === 'mapped'
                          ? 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'
                          : 'border-slate-800 bg-slate-950 text-slate-500'
                    }`}
                    href={href}
                    key={option.code}
                  >
                    {option.label_de} {option.mapping_status !== 'mapped' ? '(unresolved)' : null}
                  </Link>
                )
              })}
            </div>
            <div className="mt-4 grid gap-2 text-xs sm:grid-cols-4">
              <div className="rounded border border-slate-800 bg-slate-950 p-3">
                <div className="text-slate-500">Preview matches</div>
                <div className="mt-1 text-lg font-semibold text-slate-100">{preferencePreview.total}</div>
              </div>
              <div className="rounded border border-slate-800 bg-slate-950 p-3">
                <div className="text-slate-500">Excluded</div>
                <div className="mt-1 text-lg font-semibold text-slate-100">{preferencePreview.excluded_count}</div>
              </div>
              <div className="rounded border border-slate-800 bg-slate-950 p-3">
                <div className="text-slate-500">Boosted</div>
                <div className="mt-1 text-lg font-semibold text-slate-100">{preferencePreview.boosted_count}</div>
              </div>
              <div className="rounded border border-slate-800 bg-slate-950 p-3">
                <div className="text-slate-500">Unresolved</div>
                <div className="mt-1 text-lg font-semibold text-slate-100">{preferencePreview.unresolved_preferences.length}</div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
              <form action="/nutrition" className="flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
                  defaultValue={query}
                  name="q"
                  placeholder="Search BLS source labels, e.g. kuerbis, oel, brot"
                />
                {payload.category ? <input name="category" type="hidden" value={payload.category} /> : null}
                {payload.tag ? <input name="tag" type="hidden" value={payload.tag} /> : null}
                {payload.sort !== 'relevance' ? <input name="sort" type="hidden" value={payload.sort} /> : null}
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

              <div className="mt-5">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400" htmlFor="nutrition-sort">
                  Sort
                </label>
                <select
                  className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  defaultValue={payload.sort}
                  id="nutrition-sort"
                  name="sort"
                  form="sort-form"
                >
                  <option value="relevance">Relevance</option>
                  <option value="protein_desc">Protein</option>
                  <option value="kcal_asc">Calories</option>
                  <option value="name_asc">Name</option>
                </select>
                <form action="/nutrition" className="mt-2 flex gap-2" id="sort-form">
                  <input name="q" type="hidden" value={query} />
                  {payload.category ? <input name="category" type="hidden" value={payload.category} /> : null}
                  {payload.tag ? <input name="tag" type="hidden" value={payload.tag} /> : null}
                  <button className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-slate-500" type="submit">
                    Apply sort
                  </button>
                </form>
              </div>

              <FacetSection
                active={payload.category}
                clearHref={buildFoodSearchFilterHref({ query, tag, sort: payload.sort })}
                items={payload.categories.map(item => ({
                  key: item.slug,
                  label: item.name_de || item.slug,
                  count: item.count,
                  href: buildFoodSearchFilterHref({ query, tag, sort: payload.sort }, { category: item.slug, food: null, offset: 0 }),
                }))}
                title="Category filters"
              />

              <FacetSection
                active={payload.tag}
                clearHref={buildFoodSearchFilterHref({ query, category, sort: payload.sort })}
                items={payload.tags.map(item => ({
                  key: item.code,
                  label: item.name_de || item.code,
                  count: item.count,
                  href: buildFoodSearchFilterHref({ query, category, sort: payload.sort }, { tag: item.code, food: null, offset: 0 }),
                }))}
                title="V1 tag filters"
              />

              <div className="mt-5 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Matches</h2>
                <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-300">
                  {payload.total} total
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
                        href={buildFoodHref(query, payload.category, payload.tag, payload.sort, payload.offset, food.id)}
                        key={food.id}
                      >
                        <div className="font-mono text-xs text-slate-400">{food.bls_code}</div>
                        <div className="mt-1 font-medium text-slate-100">{food.source_label}</div>
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-300">
                          {food.enercc ? <span className="rounded border border-slate-700 px-1.5 py-0.5">{Number(food.enercc).toFixed(0)} kcal</span> : null}
                          {food.prot625 ? <span className="rounded border border-slate-700 px-1.5 py-0.5">{Number(food.prot625).toFixed(1)} g protein</span> : null}
                          {food.fat ? <span className="rounded border border-slate-700 px-1.5 py-0.5">{Number(food.fat).toFixed(1)} g fat</span> : null}
                          {food.cho ? <span className="rounded border border-slate-700 px-1.5 py-0.5">{Number(food.cho).toFixed(1)} g carbs</span> : null}
                        </div>
                        {food.category_name_de ? (
                          <div className="mt-1 text-xs text-emerald-200/80">{food.category_name_de}</div>
                        ) : null}
                        {food.tags.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {food.tags.slice(0, 4).map(tagCode => (
                              <span className="rounded-full border border-slate-700 px-1.5 py-0.5 text-[11px] text-slate-400" key={tagCode}>{tagCode}</span>
                            ))}
                          </div>
                        ) : null}
                        <div className="mt-1 text-xs text-slate-500">BLS source label, not final product copy</div>
                      </Link>
                    )
                  })}
                </div>
              )}
              {payload.foods.length > 0 ? (
                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-400">
                  <span>
                    Showing {payload.offset + 1}-{payload.offset + payload.foods.length} of {payload.total}
                  </span>
                  <div className="flex gap-2">
                    {payload.offset > 0 ? (
                      <Link
                        className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-200 hover:border-slate-500"
                        href={buildFoodSearchFilterHref({ query, category: payload.category, tag: payload.tag, sort: payload.sort }, { offset: Math.max(0, payload.offset - payload.limit), food: null })}
                      >
                        Previous
                      </Link>
                    ) : null}
                    {hasMore ? (
                      <Link
                        className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-200 hover:border-slate-500"
                        href={buildFoodSearchFilterHref({ query, category: payload.category, tag: payload.tag, sort: payload.sort }, { offset: nextOffset, food: null })}
                      >
                        Load more
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : null}
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
                    {payload.selected_food.category_name_de ? (
                      <div className="mt-3 inline-flex rounded-full border border-emerald-700/70 px-2.5 py-1 text-xs text-emerald-100">
                        Category: {payload.selected_food.category_name_de}
                      </div>
                    ) : null}
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
