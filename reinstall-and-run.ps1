# PowerShell: node_modules 삭제 후 재설치 및 실행
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Removing node_modules and lock file..."
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }

Write-Host "Installing dependencies..."
npm install
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Starting dev server..."
npm run dev
