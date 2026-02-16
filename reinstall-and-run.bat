@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo Removing node_modules and lock file...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del "package-lock.json"

echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo Install failed.
    pause
    exit /b 1
)

echo Setting up database...
call npx prisma db push
if errorlevel 1 (
    echo Database setup failed. Check .env and DATABASE_URL.
    pause
    exit /b 1
)

echo Starting dev server...
call npm run dev

pause
