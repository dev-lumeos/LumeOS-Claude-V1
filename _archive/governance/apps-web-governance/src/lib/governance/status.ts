export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export type StatusTone = 'pass' | 'attention' | 'blocked' | 'info' | 'idle'

export type SummaryLike = {
  critical?: number
  high?: number
  medium?: number
  low?: number
  info?: number
}

export type CommandResultClass = {
  label: 'PASS' | 'BLOCKED' | 'NEEDS_FIX' | 'NEEDS_APPROVAL' | 'API_ERROR'
  tone: StatusTone
  description: string
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

function stringField(value: unknown, key: string): string {
  if (!value || typeof value !== 'object') return ''
  const field = (value as Record<string, unknown>)[key]
  return typeof field === 'string' ? field : ''
}

export function classifyCommandResult(result: {
  exitCode: number
  stderr?: string
  parsedJson?: unknown | null
} | null | undefined): CommandResultClass {
  if (!result) {
    return {
      label: 'PASS',
      tone: 'idle',
      description: 'No command has been run yet.',
    }
  }

  const finalState = stringField(result.parsedJson, 'final_state')
    || stringField(result.parsedJson, 'final_diagnosis')
    || stringField(result.parsedJson, 'decision')

  if (result.parsedJson && result.exitCode !== 0) {
    if (/approval/i.test(finalState)) {
      return {
        label: 'NEEDS_APPROVAL',
        tone: 'attention',
        description: 'The API returned structured governance output and the next step requires approval review.',
      }
    }
    if (/fix|required|blocked|stop|not_ready/i.test(finalState)) {
      return {
        label: 'NEEDS_FIX',
        tone: 'blocked',
        description: 'The API call succeeded, but governance reported a blocker or fix-required state.',
      }
    }
    return {
      label: 'BLOCKED',
      tone: 'attention',
      description: 'The API call succeeded, but the CLI returned a non-zero governance result.',
    }
  }

  if (result.exitCode === 0) {
    return {
      label: 'PASS',
      tone: 'pass',
      description: 'The API and CLI completed successfully.',
    }
  }

  return {
    label: 'API_ERROR',
    tone: 'blocked',
    description: result.stderr ? 'The CLI failed before producing structured governance JSON.' : 'The command failed without structured governance output.',
  }
}
