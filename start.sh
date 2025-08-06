#!/bin/bash

echo "Starting RTPM Dumaguete Science High School Interactive Game System"
echo "================================================================"

echo "Checking if Node.js is installed..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download and install Node.js from https://nodejs.org/"
    echo "After installation, please restart your terminal and run this script again."
    exit 1
fi

echo "Node.js is installed!"

echo "Installing required packages (this may take a few minutes)..."
npm install

echo "Setting up database..."
npm run db:push

echo "Starting the application..."
echo "Please wait for the 'ready - started server' message..."
echo ""
echo "Once started, open your web browser and go to: http://localhost:3000"
echo ""
npm run dev