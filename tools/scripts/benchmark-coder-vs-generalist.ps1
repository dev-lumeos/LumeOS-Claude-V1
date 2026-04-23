# Coder Test — Benchmark Script
# Vergleich Qwen3-Coder-Next vs Qwen3.6-35B-FP8

$sparkA = 'http://192.168.0.128:8001'   # Qwen3.6-35B-FP8
$sparkB = 'http://192.168.0.129:8001'   # Qwen3-Coder-Next (IP anpassen!)

$codingPrompt = 'Write a TypeScript function that takes an array of meal items with calories, protein_g, fat_g, carbs_g fields and returns the daily nutrition summary totals. Include proper types.'

function Test-Model($uri, $modelName, $prompt) {
  $body = @{
    model = $modelName
    messages = @(@{ role = 'user'; content = $prompt })
    max_tokens = 300
    chat_template_kwargs = @{ enable_thinking = $false }
  } | ConvertTo-Json -Depth 5

  $start = Get-Date
  $r = Invoke-RestMethod -Method POST -Uri "$uri/v1/chat/completions" `
    -ContentType 'application/json' -Body $body
  $elapsed = [math]::Round(((Get-Date) - $start).TotalSeconds, 2)
  $tokens = $r.usage.completion_tokens
  $tps = [math]::Round($tokens / $elapsed, 1)

  Write-Host "Model:   $modelName"
  Write-Host "Tokens:  $tokens in $elapsed s = $tps tok/s"
  Write-Host "Output:"
  Write-Host $r.choices[0].message.content
  Write-Host "---"
}

Write-Host "=== LumeOS Coder Benchmark ==="
Write-Host "Prompt: TypeScript nutrition aggregation function"
Write-Host ""

Write-Host "[Spark A] Qwen3.6-35B-FP8 (Generalist)"
Test-Model $sparkA 'qwen3.6-35b-fp8' $codingPrompt

Write-Host ""
Write-Host "[Spark B] Qwen3-Coder-Next (Coder-Spezialist)"
Test-Model $sparkB 'qwen3-coder-next' $codingPrompt
