@echo off
echo Starting RTPM Dumaguete Science High School Interactive Game System
echo ================================================================

echo Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    echo After installation, please restart your computer and run this script again.
    pause
    exit /b 1
)

echo Node.js is installed!

echo Installing required packages (this may take a few minutes)...
call npm install

echo Setting up database...
call npm run db:push

echo Starting the application...
echo Please wait for the "ready - started server" message...
echo.
echo Once started, open your web browser and go to: http://localhost:3000
echo.
call npm run dev

pause