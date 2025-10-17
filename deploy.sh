#!/bin/bash

echo "🚀 Deploying Pudding mit Gabel to Vercel..."

# Check if user is logged in to Vercel
if ! npx vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please login first:"
    echo "   npm run vercel:login"
    exit 1
fi

# Deploy to Vercel from frontend directory
echo "📦 Deploying from frontend directory..."
cd frontend
npx vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Test your deployment:"
echo "   - Visit your Vercel URL"
echo "   - Try admin login: admin2@puddingmeetup.com / adminpudding2"
echo "   - Test all features: leaderboard, event creation, etc."
echo ""
echo "2. The app now runs on mock data - no backend required!"
echo ""
echo "🎉 Your Pudding mit Gabel app is now live!"
