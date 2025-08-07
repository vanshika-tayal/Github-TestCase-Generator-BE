#!/bin/bash

# GitForge.AI Backend Deployment Script
# This script helps deploy the backend to Vercel

echo "🚀 GitForge.AI Backend Deployment Script"
echo "========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing now..."
    npm install -g vercel
    echo "✅ Vercel CLI installed successfully!"
fi

# Check if user is logged in to Vercel
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please login:"
    vercel login
fi

echo "✅ Authenticated with Vercel!"

# Deploy to production
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Update frontend API URL to use your new backend URL" 
echo "3. Test the deployment with /health endpoint"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🔗 Useful Commands:"
echo "  vercel env add VARIABLE_NAME    - Add environment variable"
echo "  vercel logs                     - View deployment logs"  
echo "  vercel list                     - List deployments"
echo ""