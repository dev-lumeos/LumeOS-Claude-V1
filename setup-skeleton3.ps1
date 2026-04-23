$base = "D:\GitHub\LumeOS-Claude-V1"

# .claude structure for Claude Code
$claudeDirs = @(
  ".claude\skills\spec-analyst",
  ".claude\skills\wo-writer",
  ".claude\skills\supabase-specialist",
  ".claude\skills\frontend-specialist",
  ".claude\skills\backend-specialist",
  ".claude\skills\github-specialist",
  ".claude\skills\typescript-specialist",
  ".claude\skills\security-specialist",
  ".claude\skills\test-specialist",
  ".claude\skills\doc-specialist",
  ".claude\skills\nutrition-specialist",
  ".claude\skills\training-specialist",
  ".claude\skills\recovery-specialist",
  ".claude\skills\coach-specialist",
  ".claude\skills\medical-specialist",
  ".claude\skills\marketplace-specialist",
  ".claude\skills\gsd-v2",
  ".claude\skills\chat-to-rawdata",
  ".claude\skills\rawdata-to-spec",
  ".claude\skills\spec-to-decomposition",
  ".claude\skills\decomposition-to-workorders",
  ".claude\skills\review-wo-batch",
  ".claude\rules",
  ".claude\agents"
)

foreach ($d in $claudeDirs) {
  New-Item -ItemType Directory -Force -Path "$base\$d" | Out-Null
}

# .gitkeep in all leaf dirs
Get-ChildItem -Path $base -Recurse -Directory | Where-Object {
  (Get-ChildItem -Path $_.FullName).Count -eq 0
} | ForEach-Object {
  New-Item -ItemType File -Force -Path "$($_.FullName)\.gitkeep" | Out-Null
}

Write-Host "Phase 3 done: .claude structure + .gitkeep in all empty dirs"
