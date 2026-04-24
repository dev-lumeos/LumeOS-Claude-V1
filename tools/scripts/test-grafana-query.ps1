$creds = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes('admin:lumeos2026'))
$headers = @{ Authorization = "Basic $creds"; 'Content-Type' = 'application/json' }

$query = @{
    queries = @(@{
        refId = "A"
        datasourceId = 1
        rawSql = "SELECT COUNT(*) as count FROM workorders"
        format = "table"
    })
    from = "now-1h"
    to = "now"
} | ConvertTo-Json -Depth 5

$result = Invoke-RestMethod -Method POST -Uri 'http://localhost:3001/api/ds/query' -Headers $headers -Body $query
$result | ConvertTo-Json -Depth 10
