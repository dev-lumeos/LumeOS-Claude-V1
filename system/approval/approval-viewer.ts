#!/usr/bin/env npx tsx
/**
 * LUMEOS Approval Viewer — C.2
 * system/approval/approval-viewer.ts
 *
 * Zeigt alle pending Approvals aus runtime_state.approvals[].
 *
 * Run:
 *   npx tsx system/approval/approval-viewer.ts
 *   npx tsx system/approval/approval-viewer.ts --all    # alle Statuses
 */

import { getPendingApprovals, getAllApprovalItems, expireStaleApprovals } from '../state/state-manager'
import type { ApprovalItem } from '../state/state-manager'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length)
}

function fmtDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC')
}

function fmtFiles(files?: string[]): string {
  if (!files || files.length === 0) return '—'
  if (files.length === 1) return files[0]
  return `${files[0]} (+${files.length - 1} more)`
}

function statusColor(status: string): string {
  switch (status) {
    case 'pending':  return `\x1b[33m${status}\x1b[0m`   // yellow
    case 'granted':  return `\x1b[32m${status}\x1b[0m`   // green
    case 'denied':   return `\x1b[31m${status}\x1b[0m`   // red
    case 'expired':  return `\x1b[90m${status}\x1b[0m`   // gray
    case 'consumed': return `\x1b[36m${status}\x1b[0m`   // cyan
    default:         return status
  }
}

function printItem(item: ApprovalItem, idx: number): void {
  console.log(`\n  [${ idx + 1 }] ${item.approval_id}  [${statusColor(item.status)}]`)
  console.log(`      run_id:         ${item.run_id ?? '—'}`)
  console.log(`      wo_id:          ${item.workorder_id}`)
  console.log(`      reason:         ${item.reason ?? '—'}`)
  console.log(`      risk_category:  ${item.risk_category ?? '—'}`)
  console.log(`      affected_files: ${fmtFiles(item.affected_files)}`)
  console.log(`      proposed:       ${item.proposed_action ?? '—'}`)
  console.log(`      requested_by:   ${item.requested_by ?? '—'}`)
  console.log(`      requested_at:   ${fmtDate(item.requested_at)}`)
  console.log(`      expires_at:     ${fmtDate(item.expires_at)}`)
  if (item.decided_at) console.log(`      decided_at:     ${fmtDate(item.decided_at)}  by ${item.decided_by ?? '—'}`)
  if (item.deny_reason) console.log(`      deny_reason:    ${item.deny_reason}`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const showAll = process.argv.includes('--all')

  // Expire stale items first
  const expired = await expireStaleApprovals()
  if (expired > 0) {
    console.log(`\x1b[90m[approval-viewer] ${expired} stale approval(s) marked as expired.\x1b[0m`)
  }

  const items = showAll ? getAllApprovalItems() : getPendingApprovals()

  console.log('\n══════════════════════════════════════════════════════════════════')
  console.log(showAll
    ? `LUMEOS Approval Queue — All (${items.length} items)`
    : `LUMEOS Approval Queue — Pending (${items.length} items)`)
  console.log('══════════════════════════════════════════════════════════════════')

  if (items.length === 0) {
    console.log('  (no items)')
    console.log('')
    return
  }

  // Header row
  console.log(`\n  ${pad('APPROVAL_ID', 28)} ${pad('STATUS', 10)} ${pad('WO_ID', 24)} ${pad('RISK', 14)} ${pad('EXPIRES_AT', 24)} REASON`)
  console.log('  ' + '─'.repeat(120))

  for (const item of items) {
    const expires = item.expires_at ? new Date(item.expires_at).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : '—'
    const reason  = (item.reason ?? '—').slice(0, 48)
    console.log(`  ${pad(item.approval_id, 28)} ${pad(item.status, 10)} ${pad(item.workorder_id, 24)} ${pad(item.risk_category ?? '—', 14)} ${pad(expires, 24)} ${reason}`)
  }

  if (!showAll) {
    console.log('\n  Use --all to show all statuses.')
  }

  console.log('\n══════════════════════════════════════════════════════════════════')

  // Detail view for pending
  if (!showAll && items.length > 0) {
    console.log('\nDetail:')
    items.forEach(printItem)
  }

  console.log('')
}

main().catch(err => { console.error('\x1b[31m[approval-viewer] Error:\x1b[0m', err.message); process.exit(1) })
