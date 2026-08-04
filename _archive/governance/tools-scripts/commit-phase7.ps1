cd D:\GitHub\LumeOS-Claude-V1
$nulPath = 'D:\GitHub\LumeOS-Claude-V1\nul'
if (Test-Path $nulPath) {
    [System.IO.File]::Delete($nulPath)
    Write-Host 'nul removed'
}
git add services/governance-compiler system/prompts/governance tools/scripts/test-first-real-wo.ts
git commit -m 'feat: Phase 7 — Governance Compiler Port 9003, first real WO E2E, governance prompts'
git push
Write-Host 'Phase 7 committed'
