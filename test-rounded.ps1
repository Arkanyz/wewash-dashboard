$url = "https://wewash-dashboard-git-master-arkanyzs-projects.vercel.app/api/rounded-webhook"

$body = @{
    id = "0ba22e09-cfbf-4477-a533-b87fb11fad4c"  # ID réel de l'appel
    type = "call.completed"
    from = "+33684282335"  # Numéro appelant réel
    to = "+33974993428"    # Numéro de la laverie
    startTime = "2025-01-20T08:54:32.086653Z"
    endTime = "2025-01-20T08:56:35.086653Z"
    duration = 123
    status = "completed"
    direction = "inbound"
    machine_number = "M001"
    laundry_name = "Esteban Rodriguez"
    issue_type = "information"
    issue_description = "Demande d'information sur les horaires"
    machine_type = "washer"
    machine_location = "Zone A"
}

$headers = @{
    "Content-Type" = "application/json"
    "x-rounded-signature" = "test-signature"
}

$jsonBody = $body | ConvertTo-Json -Depth 10

Write-Host "Envoi de la requête de test..."
Write-Host "URL: $url"
Write-Host "Corps de la requête:"
Write-Host $jsonBody

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $jsonBody -Headers $headers
    Write-Host "`nRéponse reçue:"
    $response | ConvertTo-Json
} catch {
    Write-Host "`nErreur lors de l'envoi:"
    Write-Host $_.Exception.Message
    Write-Host "`nRéponse d'erreur:"
    Write-Host $_.ErrorDetails.Message
}
