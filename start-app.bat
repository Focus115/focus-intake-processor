@echo off
echo Starting Focus Intake Processor...
echo.
echo Backend will run on: http://localhost:3001
echo Frontend will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop the servers
echo.
cd /d "%~dp0"
npm run dev
