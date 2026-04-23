$uri = 'http://192.168.0.188:8001/v1/chat/completions'

$prompts = @(
  'Write a TypeScript function to calculate BMI from weight and height.',
  'Write a TypeScript Zod schema for a meal log entry.',
  'Write a Hono route handler for GET /diary/:date that returns a DiaryDay.',
  'Write a TypeScript function to aggregate macro totals from an array of MealItems.',
  'Write a SQL query to get daily nutrition summary for a user.',
  'Write a TypeScript interface for a NutritionTarget with calories, protein, fat, carbs.',
  'Write a Hono middleware that validates a Supabase JWT token.',
  'Write a TypeScript function to calculate macro percentages from totals.',
  'Write a PostgreSQL RLS policy for a user_profiles table.',
  'Write a TypeScript function that converts grams of food to nutrition values using per-100g ratios.'
)

Write-Host '=== Spark B Parallel Test (10 concurrent requests) ==='
Write-Host 'Model: qwen3-coder-30b (Qwen3-Coder-30B-A3B-Instruct-FP8)'
Write-Host 'Starting all 10 requests simultaneously...'
Write-Host ''

$start = Get-Date

$jobs = $prompts | ForEach-Object {
  $prompt = $_
  Start-Job -ScriptBlock {
    param($uri, $prompt)
    $body = @{
      model    = 'qwen3-coder-30b'
      messages = @(@{ role = 'user'; content = $prompt })
      max_tokens = 200
    } | ConvertTo-Json -Depth 5
    $t = Get-Date
    try {
      $r = Invoke-RestMethod -Method POST -Uri $uri -ContentType 'application/json' -Body $body -TimeoutSec 120
      $elapsed = [math]::Round(((Get-Date) - $t).TotalSeconds, 2)
      [PSCustomObject]@{
        tokens  = $r.usage.completion_tokens
        elapsed = $elapsed
        tps     = [math]::Round($r.usage.completion_tokens / $elapsed, 1)
        preview = $r.choices[0].message.content.Substring(0, [Math]::Min(60, $r.choices[0].message.content.Length))
        ok      = $true
      }
    } catch {
      [PSCustomObject]@{ tokens = 0; elapsed = 0; tps = 0; preview = "ERROR: $_"; ok = $false }
    }
  } -ArgumentList $uri, $prompt
}

$results = $jobs | Wait-Job | Receive-Job
$jobs | Remove-Job

$wall        = [math]::Round(((Get-Date) - $start).TotalSeconds, 2)
$totalTokens = ($results | Measure-Object -Property tokens -Sum).Sum
$aggTps      = [math]::Round($totalTokens / $wall, 1)
$successful  = ($results | Where-Object { $_.ok }).Count

Write-Host 'Results per request:'
$i = 1
foreach ($r in $results) {
  if ($r.ok) {
    Write-Host "  Request $i`: $($r.tokens) tok / $($r.elapsed)s = $($r.tps) tok/s"
    Write-Host "    $($r.preview)..."
  } else {
    Write-Host "  Request $i`: FAILED"
  }
  $i++
}

Write-Host ''
Write-Host '=== Summary ==='
Write-Host "Successful:           $successful / 10"
Write-Host "Wall time:            $wall s"
Write-Host "Total tokens:         $totalTokens"
Write-Host "Aggregate throughput: $aggTps tok/s"
