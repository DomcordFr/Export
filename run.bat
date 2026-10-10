@echo off
title Export — JanitorAI Backup Suite
cd /d "%~dp0"

echo ========================================================
echo  Starting Export — JanitorAI Backup Suite ^& CSS Studio
echo ========================================================

python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    python server.py
    pause
    exit /b
)

py --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    py server.py
    pause
    exit /b
)

echo Error: Python 3 was not found on your system.
echo Please install Python 3 from https://python.org or open index.html directly.
pause
