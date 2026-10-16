@echo off
cd /d "%~dp0"
echo Installing (first time only, takes a minute)...
call npm install
echo Building the Windows installer...
call npm run dist:win
echo.
echo Done! Opening the dist folder...
start "" "%~dp0dist"
pause
