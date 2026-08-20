// Datums- und Wertformatierung des Portals — eine Stelle, deutsch.
export function datum(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function zeitpunkt(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

export function wert(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? 'ja' : 'nein'
  return String(v)
}
