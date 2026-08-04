$sparkA = 'http://192.168.0.128:8001'   # Qwen3.6-35B-FP8 (Generalist)
$sparkB = 'http://192.168.0.188:8001'   # Qwen3-Coder-30B-A3B (Coder-Spezialist)

$codingPrompt = @'
Write a TypeScript function that takes an array of meal items with the following type:
interface MealItem { food_id: string; amount_g: number; calories: number; protein_g: number; fat_g: number; carbs_g: number }
The function should return a DailyNutritionSummary with totals for calories, protein_g, fat_g, carbs_g.
Include proper TypeScript types and a pure function implementation.
'@

function Test-Model($uri, $modelName, $label, $prompt) {
  Write-Host "[$label] $modelName"
  $body = @{
    model = $modelName
    messages = @(@{ role = 'user'; content = $prompt })
    max_tokens = 350
    chat_template_kwargs = @{ enable_thinking = $false }
  } | ConvertTo-Json -Depth 5

  $start = Get-Date
  try {
    $r = Invoke-RestMethod -Method POST -Uri "$uri/v1/chat/completions" `
      -ContentType 'application/json' -Body $body -TimeoutSec 60
    $elapsed = [math]::Round(((Get-Date) - $start).TotalSeconds, 2)
    $tokens = $r.usage.completion_tokens
    $tps = [math]::Round($tokens / $elapsed, 1)
    Write-Host "Tokens:  $tokens in $elapsed s = $tps tok/s"
    Write-Host "Output:"
    Write-Host $r.choices[0].message.content
  } catch {
    Write-Host "ERROR: $_"
  }
  Write-Host "---"
}

Write-Host "=== LumeOS Coder Benchmark ==="
Write-Host "Task: TypeScript nutrition aggregation function"
Write-Host ""

Write-Host "[Spark A] Generalist"
Test-Model $sparkA 'qwen3.6-35b-fp8' 'Spark A' $codingPrompt

Write-Host ""
Write-Host "[Spark B] Coder-Spezialist"
Test-Model $sparkB 'qwen3-coder-30b' 'Spark B' $codingPrompt

Write-Host ""
Write-Host "=== Parallel Test ==="
Write-Host "Starte 4 parallele Requests auf Spark B..."

$start = Get-Date
$jobs = 1..4 | ForEach-Object {
  $i = $_
  Start-Job -ScriptBlock {
    param($uri, $prompt, $i)
    $body = @{
      model = 'qwen3-coder-30b'
      messages = @(@{ role = 'user'; content = $prompt })
      max_tokens = 250
      chat_template_kwargs = @{ enable_thinking = $false }
    } | ConvertTo-Json -Depth 5
    $t = Get-Date
    $r = Invoke-RestMethod -Method POST -Uri "$uri/v1/chat/completions" `
      -ContentType 'application/json' -Body $body -TimeoutSec 60
    $elapsed = [math]::Round(((Get-Date) - $t).TotalSeconds, 2)
    [PSCustomObject]@{
      request = $i
      tokens  = $r.usage.completion_tokens
      elapsed = $elapsed
      tps     = [math]::Round($r.usage.completion_tokens / $elapsed, 1)
    }
  } -ArgumentList $sparkB, $codingPrompt, $i
}
$results = $jobs | Wait-Job | Receive-Job
$jobs | Remove-Job
$wall = [math]::Round(((Get-Date) - $start).TotalSeconds, 2)
$total = ($results | Measure-Object -Property tokens -Sum).Sum
$agg = [math]::Round($total / $wall, 1)

foreach ($r in $results) {
  Write-Host "  Request $($r.request): $($r.tokens) tok / $($r.elapsed)s = $($r.tps) tok/s"
}
Write-Host ""
Write-Host "Wall: $wall s | Total: $total tok | Aggregate: $agg tok/s"
