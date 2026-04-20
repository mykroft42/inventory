#!/usr/bin/env bash

# Production build script for Household Inventory Application

set -e

echo "🏗️  Building Household Inventory Application..."

# Build backend
echo "📦 Building .NET backend..."
cd backend
dotnet publish -c Release -o ../dist/backend --self-contained false

# Build frontend
echo "⚛️  Building React frontend..."
cd ../frontend
npm run build:prod

# Copy frontend build to dist
echo "📋 Copying frontend build..."
mkdir -p ../dist/frontend
cp -r build/* ../dist/frontend/

# Create deployment package
echo "📦 Creating deployment package..."
cd ..
tar -czf household-inventory-$(date +%Y%m%d-%H%M%S).tar.gz -C dist .

echo "✅ Build complete! Deployment package created."
echo "🚀 To deploy:"
echo "   1. Extract the tar.gz file on your server"
echo "   2. Configure your web server to serve the frontend/ directory"
echo "   3. Run the backend executable with proper environment variables"