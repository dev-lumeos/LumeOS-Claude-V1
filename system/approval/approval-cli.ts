/**
 * LUMEOS Approval Queue CLI
 * system/approval/approval-cli.ts
 * Commands: list | all | show <id> | grant <id> | deny <id> [reason] | expire
 */
import {
  getPendingApprovals, getAllApprovals, getApproval,
  grantApprovalForDispatch, denyApproval, expireStaleApprovals,
  type ApprovalQueueItem,
} from './approval-queue'

const STATUS_ICON: Record<string, string> = {
  pending: '[pending]',
  granted: '[granted]',
  denied: '[denied]',
  expired: '[expired]',
  consumed: '[consumed]',
}

function fmt(item: ApprovalQueueItem): string {
  const icon = STATUS_ICON[item.status] ?? '[unknown]'
  const lines = [
    `${icon} ${item.approval_id}  [${item.status.toUpperCase()}]`,
    `   WO:      ${item.workorder_id}`,
    `   Run:     ${item.run_id}`,
    `   Agent:   ${item.agent_id}`,
    `   Risk:    ${item.risk_category}`,
    `   Reason:  ${item.reason}`,
    `   Action:  ${item.proposed_action}`,
  ]
  if (item.affected_files.length > 0)
    lines.push(`   Files:   ${item.affected_files.join(', ')}`)
  lines.push(`   Created: ${item.requested_at}`)
  lines.push(`   Expires: ${item.expires_at}`)
  if (item.decided_at) lines.push(`   Decided: ${item.decided_at} by ${item.decided_by}`)
  if (item.deny_reason) lines.push(`   Deny:    ${item.deny_reason}`)
  return lines.join('\n')
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const cmd  = args[0]

  if (!cmd || cmd === 'help') {
    console.log('Usage: list | all | show <id> | grant <id> | deny <id> [reason] | expire')
  } else if (cmd === 'list') {
    const items = getPendingApprovals()
    console.log(`\n-- Pending Approvals (${items.length}) --`)
    if (items.length === 0) console.log('  (keine)')
    else items.forEach(i => console.log('\n' + fmt(i)))
    console.log()
  } else if (cmd === 'all') {
    const items = getAllApprovals()
    console.log(`\n-- All Approvals (${items.length}) --`)
    items.forEach(i => console.log('\n' + fmt(i)))
    console.log()
  } else if (cmd === 'show') {
    const item = getApproval(args[1])
    if (!item) { console.error(`Nicht gefunden: ${args[1]}`); process.exit(1) }
    console.log('\n' + fmt(item) + '\n')
  } else if (cmd === 'grant') {
    const r = await grantApprovalForDispatch(args[1], 'tom-cli')
    if (!r.ok) { console.error(`FEHLER: ${r.reason}`); process.exit(1) }
    console.log(`\nGranted: ${args[1]}\n${fmt(r.item)}\n`)
  } else if (cmd === 'deny') {
    const r = denyApproval(args[1], 'tom-cli', args.slice(2).join(' ') || undefined)
    if (!r.ok) { console.error(`FEHLER: ${r.reason}`); process.exit(1) }
    console.log(`\nDenied: ${args[1]}\n${fmt(r.item)}\n`)
  } else if (cmd === 'expire') {
    const n = expireStaleApprovals()
    console.log(`\n${n} abgelaufene Approvals bereinigt.\n`)
  } else {
    console.error(`Unbekannter Command: ${cmd}`)
    process.exit(1)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
