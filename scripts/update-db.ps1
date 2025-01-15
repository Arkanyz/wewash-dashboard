# Vérifier si Supabase CLI est installé
$supabaseVersion = supabase --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installation de Supabase CLI..."
    winget install Supabase.CLI
}

# Se placer dans le répertoire du projet
Set-Location $PSScriptRoot/..

# Lancer la migration
Write-Host "Application des migrations..."
supabase db reset

Write-Host "Migrations appliquées avec succès!"
