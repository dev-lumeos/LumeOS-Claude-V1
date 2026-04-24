$creds = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes('admin:lumeos2026'))
$headers = @{ Authorization = "Basic $creds" }

Write-Host "=== Datasources ==="
$ds = Invoke-RestMethod -Uri 'http://localhost:3001/api/datasources' -Headers $headers
$ds | ConvertTo-Json

Write-Host ""
Write-Host "=== Test Datasource Connection ==="
if ($ds.Count -gt 0) {
    $dsId = $ds[0].id
    $test = Invoke-RestMethod -Uri "http://localhost:3001/api/datasources/$dsId/health" -Headers $headers
    $test | ConvertTo-Json
}
