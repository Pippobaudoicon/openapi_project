#!/bin/bash
set -e  # Exit on error

cd /app

# Pull the latest changes
git pull origin main

# Install dependencies
cd client
npm install
npm run build

cd ../server
npm install

# Install PM2 globally if not already installed
npm install -g pm2

# Start the application with PM2
pm2 start npm --name "openapi_vicsam" -- start

# Save PM2 process list and configure to start on system boot
pm2 save
pm2 startup

# Keep container running and monitor logs
pm2 logs
