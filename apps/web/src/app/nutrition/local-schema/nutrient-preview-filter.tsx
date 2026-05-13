'use client'

import { useMemo, useState } from 'react'

import type { NutritionGroupCount, NutritionNutrientPreviewRow } from '../../../lib/nutrition/local-schema-debug'
import { filterNutrientPreviewRows } from '../../../lib/nutrition/nutrient-preview-filter'

type Props = {
  rows: NutritionNutrientPreviewRow[]
  groups: NutritionGroupCount[]
  hasLocalSeedRows: boolean
}

function PreviewBadge({ label, tone }: { label: string; tone: 'pass' | 'attention' }) {
  const toneClass = tone === 'pass'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
    : 'border-amber-200 bg-amber-50 text-amber-900'

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass}`}>
      {label}
    </span>
  )
}

export function NutrientPreviewFilter({ rows, groups, hasLocalSeedRows }: Props) {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('')
  const filteredRows = useMemo(
    () => filterNutrientPreviewRows(rows, { query, group }),
    [group, query, rows],
  )

  return (
    <section className="mt-8 rounded-lg border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Nutrient Preview</h2>
          <p className="mt-1 text-xs text-slate-400">
            Local rows ordered by sort index. Thai fields are intentionally empty at this boundary.
          </p>
        </div>
        <PreviewBadge tone={hasLocalSeedRows ? 'pass' : 'attention'} label={hasLocalSeedRows ? 'Seeded locally' : 'Local preview'} />
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_18rem_auto]">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Search</span>
          <input
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-600 focus:border-blue-400"
            placeholder="code, name, group, unit"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Group</span>
          <select
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-blue-400"
            value={group}
            onChange={(event) => setGroup(event.target.value)}
          >
            <option value="">All groups</option>
            {groups.map((item) => (
              <option key={`${item.group_de}:${item.group_en}`} value={`${item.group_de}::${item.group_en}`}>
                {item.group_de} / {item.group_en}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
            type="button"
            onClick={() => {
              setQuery('')
              setGroup('')
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mb-3 text-xs text-slate-400">
        Showing <span className="font-mono text-slate-100">{filteredRows.length}</span> of{' '}
        <span className="font-mono text-slate-100">{rows.length}</span> local rows.
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-slate-400">
              <th className="px-3 py-2 font-medium">code</th>
              <th className="px-3 py-2 font-medium">name_de</th>
              <th className="px-3 py-2 font-medium">name_en</th>
              <th className="px-3 py-2 font-medium">name_th</th>
              <th className="px-3 py-2 font-medium">unit</th>
              <th className="px-3 py-2 font-medium">group_de</th>
              <th className="px-3 py-2 font-medium">group_en</th>
              <th className="px-3 py-2 font-medium">group_th</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.code} className="border-b border-slate-900/80 align-top">
                <td className="px-3 py-2 font-mono text-slate-100">{row.code}</td>
                <td className="min-w-52 px-3 py-2 text-slate-100">{row.name_de}</td>
                <td className="min-w-52 px-3 py-2 text-slate-300">{row.name_en}</td>
                <td className="px-3 py-2 font-mono text-slate-500">{row.name_th || "''"}</td>
                <td className="px-3 py-2 font-mono text-slate-100">{row.unit}</td>
                <td className="min-w-44 px-3 py-2 text-slate-300">{row.group_de}</td>
                <td className="min-w-44 px-3 py-2 text-slate-300">{row.group_en}</td>
                <td className="px-3 py-2 font-mono text-slate-500">{row.group_th || "''"}</td>
              </tr>
            ))}
            {filteredRows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={8}>
                  No local nutrient rows match the current filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
