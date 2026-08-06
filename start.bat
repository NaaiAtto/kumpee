@chcp 65001 >nul
@echo off
setlocal

cd /d "%~dp0"

title Kumpee AI - Tipitaka AI Server

REM Determine Node.js path
set NODE_EXE=node
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set NODE_EXE="C:\Program Files\nodejs\node.exe"
    ) else if exist "%LOCALAPPDATA%\Programs\node\node.exe" (
        set NODE_EXE="%LOCALAPPDATA%\Programs\node\node.exe"
    ) else (
        echo.
        echo [ERROR] Node.js is not found!
        echo Please install Node.js from https://nodejs.org/
        echo.
        pause
        exit /b 1
    )
)

echo.
echo   ================================
echo   Kumpee AI - Tipitaka AI Server
echo   ================================
echo   Server URL: http://localhost:8080
echo.

REM Launch browser in 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8080"

REM Run Node server
%NODE_EXE% server.js

pause
