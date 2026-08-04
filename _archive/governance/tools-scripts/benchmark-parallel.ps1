$uri = 'http://192.168.0.128:8001/v1/chat/completions'

$prompts = @(
  'Explain how neural networks learn. Write 200 words.',
  'What is the difference between SQL and NoSQL? Write 200 words.',
  'How does Docker containerization work? Write 200 words.',
  'Explain REST API design principles. Write 200 words.'
)

Write-Host "=== Spark A Parallel Test (4 concurrent requests) ==="
Write-Host "Starting all 4 requests simultaneously..."
Write-Host ""

$start = Get-Date

$jobs = $prompts | ForEach-Object {
  $prompt = $_
  Start-Job -ScriptBlock {
    param($uri, $prompt)
    $body = @{
      model = 'qwen3.6-35b-fp8'
      messages = @(@{ role = 'user'; content = $prompt })
      max_tokens = 250
      chat_template_kwargs = @{ enable_thinking = $false }
    } | ConvertTo-Json -Depth 5
    $t = Get-Date
    $r = Invoke-RestMethod -Method POST -Uri $uri -ContentType 'application/json' -Body $body
    $elapsed = ((Get-Date) - $t).TotalSeconds
    [PSCustomObject]@{
      tokens    = $r.usage.completion_tokens
      elapsed   = [math]::Round($elapsed, 2)
      tps       = [math]::Round($r.usage.completion_tokens / $elapsed, 1)
      preview   = $r.choices[0].message.content.Substring(0, [Math]::Min(80, $r.choices[0].message.content.Length))
    }
  } -ArgumentList $uri, $prompt
}

$results = $jobs | Wait-Job | Receive-Job
$jobs | Remove-Job

$totalElapsed = [math]::Round(((Get-Date) - $start).TotalSeconds, 2)
$totalTokens  = ($results | Measure-Object -Property tokens -Sum).Sum
$aggTps       = [math]::Round($totalTokens / $totalElapsed, 1)

Write-Host "Results per request:"
$i = 1
foreach ($r in $results) {
  Write-Host "  Request $i`: $($r.tokens) tokens / $($r.elapsed)s = $($r.tps) tok/s"
  Write-Host "    Preview: $($r.preview)..."
  $i++
}
Write-Host ""
Write-Host "=== Summary ==="
Write-Host "Total wall time:      $totalElapsed s"
Write-Host "Total tokens:         $totalTokens"
Write-Host "Aggregate throughput: $aggTps tok/s"
Write-Host "(Single was: 50.4 tok/s)"
