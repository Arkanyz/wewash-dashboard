$url = "https://wewash-dashboard-git-master-arkanyzs-projects.vercel.app/api/webhooks/rounded"

$body = @{
    type = "call.transcript.ready"
    id = "call_123456"
    from = "+33123456789"
    to = "your_service_number"
    startTime = "2025-01-18T19:43:10+01:00"
    endTime = "2025-01-18T19:45:10+01:00"
    duration = 120
    status = "completed"
    direction = "inbound"
    transcript = "Bonjour, je vous appelle car la machine numéro 5 à la laverie de Paris ne démarre pas. J'ai inséré 8 euros mais rien ne se passe."
    recordingUrl = "https://api.rounded.com/recordings/123456"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "x-rounded-signature" = "test-signature"
}

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -Headers $headers
    Write-Host "Success: $response"
} catch {
    Write-Host "Error: $_"
}
