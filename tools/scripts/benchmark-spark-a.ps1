$uri = 'http://192.168.0.128:8001/v1/chat/completions'
$body = '{"model":"qwen3.6-35b-fp8","messages":[{"role":"user","content":"Explain in detail how transformers work in machine learning. Write at least 300 words."}],"max_tokens":400,"chat_template_kwargs":{"enable_thinking":false}}'

$start = Get-Date
$r = Invoke-RestMethod -Method POST -Uri $uri -ContentType 'application/json' -Body $body
$end = Get-Date

$elapsed = ($end - $start).TotalSeconds
$tokens = $r.usage.completion_tokens
$prompt = $r.usage.prompt_tokens
$tps = [math]::Round($tokens / $elapsed, 1)

Write-Host "=== Spark A Throughput Test ==="
Write-Host "Model:             qwen3.6-35b-fp8"
Write-Host "Prompt tokens:     $prompt"
Write-Host "Completion tokens: $tokens"
Write-Host "Time:              $([math]::Round($elapsed,2))s"
Write-Host "Tokens/sec:        $tps tok/s"
Write-Host ""
Write-Host "=== Response ==="
Write-Host $r.choices[0].message.content
