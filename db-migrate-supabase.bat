@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo Prisma Generate...
call npx prisma generate
if errorlevel 1 (
    echo prisma generate failed.
    pause
    exit /b 1
)

echo.
echo Applying migration to Supabase (PostgreSQL)...
call npx prisma migrate dev --name init
if errorlevel 1 (
    echo.
    echo If this is the first time, try instead:
    echo   npx prisma db push
    echo.
    pause
    exit /b 1
)

echo.
echo Done.
pause
