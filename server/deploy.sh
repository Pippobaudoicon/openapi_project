#!/bin/bash
cd /root/openapi_vicsam

# Pull the latest changes
git pull origin main

# Install dependencies
cd client
npm install
npm run build

cd ../server
npm install

# Restart the application (assuming you're using PM2)
pm2 restart all
