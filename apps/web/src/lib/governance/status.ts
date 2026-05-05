export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export type StatusTone = 'pass' | 'attention' | 'blocked' | 'info' | 'idle'

export type SummaryLike = {
  critical?: number
  high?: number
  medium?: number
  low?: number
  info?: number
}

export function toneFromSummary(summary?: SummaryLike | null): StatusTone {
  if (!summary) return 'idle'
  if ((summary.critical ?? 0) > 0 || (summary.high ?? 0) > 0) return 'blocked'
  if ((summary.medium ?? 0) > 0) return 'attention'
  if ((summary.low ?? 0) > 0 || (summary.info ?? 0) > 0) return 'info'
  return 'pass'
}

export function summaryFromJson(value: unknown): SummaryLike | null {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const summary = record.summary
  if (summary && typeof summary === 'object') return summary as SummaryLike
  if ('critical' in record || 'high' in record || 'medium' in record) return record as SummaryLike
  return null
}

export function productGateText(value: unknown): string {
  if (value && typeof value === 'object') {
    const gate = (value as Record<string, unknown>).product_work_gate
    if (gate && typeof gate === 'object') {
      const status = String((gate as Record<string, unknown>).status ?? 'unknown')
      const reason = String((gate as Record<string, unknown>).reason ?? '')
      return `${status}${reason ? ` - ${reason}` : ''}`
    }
  }
  return 'blocked - Product work remains blocked unless Tom explicitly opens it.'
}

export function isMealCamOptionalOfflineNonBlocking(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const findings = (value as Record<string, unknown>).findings
  if (!Array.isArray(findings)) return false
  return findings.some(item => {
    if (!item || typeof item !== 'object') return false
    const record = item as Record<string, unknown>
    return record.id === 'model_runtime.optional_endpoint_offline'
      && record.agent === 'mealcam-agent'
      && record.severity === 'info'
      && record.blocks_operator === false
  })
}
