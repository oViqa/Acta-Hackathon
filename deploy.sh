#!/bin/bash

echo "🚀 Deploying Pudding mit Gabel to Vercel..."

# Check if user is logged in to Vercel
if ! npx vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please login first:"
    echo "   npm run vercel:login"
    exit 1
fi

# Deploy to Vercel
echo "📦 Deploying..."
npx vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Set environment variables in Vercel dashboard:"
echo "   - NEXT_PUBLIC_API_URL = https://your-project.vercel.app"
echo "   - JWT_SECRET = your-secret-key"
echo "   - MONGODB_URI = mongodb+srv://... (optional)"
echo ""
echo "2. Test your deployment:"
echo "   - Visit your Vercel URL"
echo "   - Try admin login: admin/adminpudding"
echo "   - Test all features: leaderboard, surprise me, etc."
echo ""
echo "🎉 Your Pudding mit Gabel app is now live!"
