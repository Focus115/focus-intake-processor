@echo off
echo Starting Focus Intake Processor...
echo.
echo Backend will run on: http://localhost:3001
echo Frontend will run on: http://localhost:5173
echo.
echo Opening browser in 5 seconds...
echo Press Ctrl+C to stop the servers
echo.

cd /d "%~dp0"

REM Start the dev server in the background
start "Focus Intake Processor" npm run dev

REM Wait for servers to start
timeout /t 5 /nobreak >nul

REM Open browser
start http://localhost:5173

REM Keep window open
echo.
echo App is running! Close this window to stop the servers.
pause >nul
