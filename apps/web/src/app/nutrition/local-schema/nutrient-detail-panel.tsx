'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import type { NutritionNutrientPreviewRow } from '../../../lib/nutrition/local-schema-debug'
import { buildNutrientDetailLink } from '../../../lib/nutrition/nutrient-detail-link'
import {
  buildNutrientDetailUrl,
  formatNutrientDetailValue,
  resolveNutrientDetailCode,
  selectNutrientDetailRow,
} from '../../../lib/nutrition/nutrient-detail-selection'
import {
  buildNutrientPinCompareRows,
  buildNutrientPinUrl,
  clearNutrientPinUrl,
  resolvePinnedNutrientRow,
} from '../../../lib/nutrition/nutrient-pin-compare'

type Props = {
  rows: NutritionNutrientPreviewRow[]
}

type DetailItem = {
  label: string
  value: string | number | boolean | null
}

export function NutrientDetailPanel({ rows }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [copyStatus, setCopyStatus] = useState<string | null>(null)
  const selectedCode = resolveNutrientDetailCode(rows, searchParams.get('nutrient'))
  const selectedRow = useMemo(
    () => selectNutrientDetailRow(rows, selectedCode),
    [rows, selectedCode],
  )
  const pinnedRow = useMemo(
    () => resolvePinnedNutrientRow(rows, searchParams.get('pinned')),
    [rows, searchParams],
  )
  const compareRows = useMemo(
    () => buildNutrientPinCompareRows(selectedRow, pinnedRow),
    [selectedRow, pinnedRow],
  )
  const nutrientLink = selectedRow
    ? buildNutrientDetailLink(searchParams.toString(), selectedRow.code, pinnedRow?.code ?? null)
    : ''

  useEffect(() => {
    setCopyStatus(null)
  }, [nutrientLink])

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
        <div className="flex flex-wrap items-end gap-2">
          <label className="block min-w-64">
            <span className="text-xs uppercase tracking-[0.16em] text-slate-500">Nutrient</span>
            <select
              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-blue-400"
              value={selectedRow.code}
              onChange={(event) => {
                router.replace(buildNutrientDetailUrl(pathname, searchParams.toString(), event.target.value), { scroll: false })
              }}
            >
              {rows.map((row) => (
                <option key={row.code} value={row.code}>
                  {row.code} - {row.name_de || row.name_en}
                </option>
              ))}
            </select>
          </label>
          <button
            className="rounded-md border border-blue-500/60 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-100 hover:bg-blue-500/20"
            type="button"
            onClick={() => {
              router.replace(buildNutrientPinUrl(pathname, searchParams.toString(), selectedRow.code), { scroll: false })
            }}
          >
            Pin selected
          </button>
          {pinnedRow ? (
            <button
              className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
              type="button"
              onClick={() => {
                router.replace(clearNutrientPinUrl(pathname, searchParams.toString()), { scroll: false })
              }}
            >
              Clear pin
            </button>
          ) : null}
        </div>
      </div>

      <div className="mb-4 rounded-md border border-slate-800 bg-slate-900/70 p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Nutrient Link</h4>
            <p className="mt-1 text-xs text-slate-400">Read-only local deep link for the selected nutrient.</p>
          </div>
          <button
            className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
            type="button"
            onClick={async () => {
              if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
                setCopyStatus('Clipboard unavailable. Copy the exposed link manually.')
                return
              }

              try {
                await navigator.clipboard.writeText(nutrientLink)
                setCopyStatus('Copied.')
              } catch {
                setCopyStatus('Clipboard unavailable. Copy the exposed link manually.')
              }
            }}
          >
            Copy nutrient link
          </button>
        </div>
        <input
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 outline-none"
          readOnly
          type="text"
          value={nutrientLink}
          onFocus={(event) => event.currentTarget.select()}
        />
        {copyStatus ? <p className="mt-2 text-xs text-slate-400">{copyStatus}</p> : null}
      </div>

      {pinnedRow ? (
        <div className="mb-4 rounded-md border border-blue-500/30 bg-blue-500/5 p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-blue-100">Pinned Compare</h4>
              <p className="mt-1 text-xs text-slate-400">
                Comparing selected `{selectedRow.code}` against pinned `{pinnedRow.code}`.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-2 py-2 font-medium">Field</th>
                  <th className="whitespace-nowrap px-2 py-2 font-medium">Selected</th>
                  <th className="whitespace-nowrap px-2 py-2 font-medium">Pinned</th>
                  <th className="whitespace-nowrap px-2 py-2 font-medium">Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {compareRows.map((row) => (
                  <tr key={row.key}>
                    <td className="whitespace-nowrap px-2 py-2 font-mono text-slate-400">{row.label}</td>
                    <td className="px-2 py-2 font-mono text-slate-100">{row.selected}</td>
                    <td className="px-2 py-2 font-mono text-slate-100">{row.pinned}</td>
                    <td className={row.matches ? 'px-2 py-2 text-emerald-300' : 'px-2 py-2 text-amber-300'}>
                      {row.matches ? 'yes' : 'no'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

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
