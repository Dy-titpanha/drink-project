# Vat' Milktea - Start Backend (Laravel / PHP 8.4) + Frontend (React/Vite)
$ErrorActionPreference = 'Stop'

$root     = $PSScriptRoot
$backend  = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'
$php84    = 'C:\wamp\bin\php\php8.4.0\php.exe'

if (-not (Test-Path $php84)) {
    Write-Host "PHP 8.4 not found at $php84. Install it in WAMP or edit this script." -ForegroundColor Red
    exit 1
}

Write-Host "Starting Laravel backend (port 8000) using $php84 ..." -ForegroundColor Cyan
Start-Process -FilePath $php84 -ArgumentList 'artisan','serve','--host=127.0.0.1','--port=8000' -WorkingDirectory $backend -WindowStyle Normal

Write-Host "Starting React frontend (port 5173) ..." -ForegroundColor Cyan
Start-Process -FilePath 'cmd.exe' -ArgumentList '/k','npm run dev' -WorkingDirectory $frontend -WindowStyle Normal

Write-Host ""
Write-Host "Backend API:  http://localhost:8000/api"  -ForegroundColor Green
Write-Host "Frontend app: http://localhost:5173"      -ForegroundColor Green
Write-Host "Login: admin@cafe.com / password123"      -ForegroundColor Yellow
