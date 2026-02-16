@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 exit /b 1
)

if not exist "prisma\dev.db" (
    echo Setting up database...
    call npx prisma db push
)

echo Starting dev server...
call npm run dev

pause
