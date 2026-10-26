param (
    [string]$Server = "(localdb)\MSSQLLocalDB",
    [string]$Database = "master",
    [string]$ScriptPath = "$PSScriptRoot\..\database\schema.sql"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  LEXICON DATABASE MIGRATION SCRIPT RUNNER" -ForegroundColor Cyan
Write-Host "  Target Server: $Server" -ForegroundColor Yellow
Write-Host "  Script File:   $ScriptPath" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Test-Path $ScriptPath)) {
    Write-Error "Script file not found at: $ScriptPath"
    exit 1
}

try {
    Write-Host "Executing idempotent schema script..." -ForegroundColor Green
    sqlcmd -S $Server -d $Database -E -i $ScriptPath -b
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n[SUCCESS] LexiconDb schema and seed script executed successfully!" -ForegroundColor Green
    } else {
        Write-Warning "`n[NOTE] Execution finished with exit code $LASTEXITCODE. If connection failed, verify your server instance name (e.g. localhost, .\SQLEXPRESS, or (localdb)\mssqllocaldb)."
    }
} catch {
    Write-Error "Error executing sqlcmd: $_"
}
