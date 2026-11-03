@echo off
setlocal enabledelayedexpansion
title Green Eco Organization - GeoHub Local Dev Server

echo ===================================================
echo   Green Eco Organization - GeoHub Local Dev Server
echo ===================================================
echo.

cd /d "%~dp0frontend"

:: Check if node is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] First time run detected. Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b %ERRORLEVEL%
    )
)

echo [INFO] Starting Vite development server...
echo [INFO] GeoHub will open at http://localhost:5173/
echo.

:: Automatically open browser in 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5173/"

:: Start Vite dev server
call npm run dev

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Development server stopped with an error.
    pause
)

