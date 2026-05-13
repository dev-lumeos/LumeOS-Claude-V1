'use client'

import { useMemo, useState } from 'react'

import type { NutritionNutrientPreviewRow } from '../../../lib/nutrition/local-schema-debug'
import { formatNutrientDetailValue, selectNutrientDetailRow } from '../../../lib/nutrition/nutrient-detail-selection'

type Props = {
  rows: NutritionNutrientPreviewRow[]
}

type DetailItem = {
  label: string
  value: string | number | boolean | null
}

export function NutrientDetailPanel({ rows }: Props) {
  const [selectedCode, setSelectedCode] = useState(rows[0]?.code ?? '')
  const selectedRow = useMemo(
    () => selectNutrientDetailRow(rows, selectedCode),
    [rows, selectedCode],
  )

  if (rows.length === 0 || !selectedRow) {
    return (
      <div className="mb-5 rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
        No local nutrient row is available for detail inspection.
      </div>
    )
  }

  const details: DetailItem[] = [
    { label: 'code', value: selectedRow.code },
    { label: 'name_de', value: selectedRow.name_de },
    { label: 'name_en', value: selectedRow.name_en },
    { label: 'name_th', value: selectedRow.name_th },
    { label: 'unit', value: selectedRow.unit },
    { label: 'group_de', value: selectedRow.group_de },
    { label: 'group_en', value: selectedRow.group_en },
    { label: 'group_th', value: selectedRow.group_th },
    { label: 'sort_index', value: selectedRow.sort_index },
    { label: 'display_tier', value: selectedRow.display_tier },
    { label: 'is_always_computed', value: selectedRow.is_always_computed },
    { label: 'is_partly_computed', value: selectedRow.is_partly_computed },
    { label: 'formula', value: selectedRow.formula },
    { label: 'rda_male', value: selectedRow.rda_male },
    { label: 'rda_female', value: selectedRow.rda_female },
    { label: 'rda_unit', value: selectedRow.rda_unit },
  ]

  return (
    <div className="mb-5 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-100">Selected Nutrient Detail</h3>
          <p className="mt-1 text-xs text-slate-400">
            Read-only local row view. Empty Thai fields and missing RDA/reference values are shown explicitly.
          </p>
        </div>
        <label className="block min-w-64">
          <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Nutrient</span>
          <select
            className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-blue-400"
            value={selectedRow.code}
            onChange={(event) => setSelectedCode(event.target.value)}
          >
            {rows.map((row) => (
              <option key={row.code} value={row.code}>
                {row.code} - {row.name_de || row.name_en}
              </option>
            ))}
          </select>
        </label>
      </div>

      <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {details.map((item) => (
          <div key={item.label} className="rounded-md border border-slate-800 bg-slate-900/80 p-3">
            <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">{item.label}</dt>
            <dd className="mt-2 break-words font-mono text-sm text-slate-100">
              {formatNutrientDetailValue(item.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
