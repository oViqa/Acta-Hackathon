# 🚀 Vercel Deployment Guide

## Quick Deploy to Vercel

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Project Root
```bash
cd /home/viqa/Desktop/global-hackathon-v1
vercel
```

### 4. Set Environment Variables
After deployment, go to your Vercel dashboard and set these environment variables:

#### Frontend Variables:
- `NEXT_PUBLIC_API_URL` = `https://your-project.vercel.app`

#### Backend Variables:
- `MONGODB_URI` = `mongodb+srv://username:password@cluster.mongodb.net/puddingmeetup`
- `JWT_SECRET` = `your-super-secret-jwt-key-change-in-production`
- `NODE_ENV` = `production`
- `FRONTEND_URL` = `https://your-project.vercel.app`

### 5. Redeploy
After setting environment variables:
```bash
vercel --prod
```

## Project Structure for Vercel

```
/
├── frontend/                 # Next.js app (auto-detected)
├── backend/
│   └── api/
│       ├── index.ts         # Vercel serverless function
│       └── package.json     # API dependencies
├── vercel.json              # Vercel configuration
└── env.example              # Environment variables template
```

## Features Included

✅ **Live Map with Pulse Animations**
✅ **HOT Badges for Recent Events**
✅ **SURPRISE ME Random Event Button**
✅ **Live Leaderboard**
✅ **Admin Dashboard** (admin/adminpudding)
✅ **Hover Animations & Loading Skeletons**
✅ **MongoDB Integration** (with mock fallback)
✅ **Responsive Design**
✅ **Error Boundaries**

## Testing the Deployment

1. **Main App**: Visit your Vercel URL
2. **Admin Access**: Click shield icon → admin/adminpudding
3. **Leaderboard**: Click 🏆 trophy button
4. **Surprise Me**: Click purple "SURPRISE ME" button
5. **Map Features**: Click pudding markers for ripple effects

## MongoDB Setup (Optional)

For full functionality, set up MongoDB Atlas:

1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Set `MONGODB_URI` in Vercel environment variables

Without MongoDB, the app runs in mock mode with sample data.

## Troubleshooting

- **Build fails**: Check that all dependencies are in package.json
- **API not working**: Verify environment variables are set
- **Map not loading**: Check if Leaflet CSS is imported
- **Admin login fails**: Use username: `admin`, password: `adminpudding`

## Custom Domain (Optional)

1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update `NEXT_PUBLIC_API_URL` and `FRONTEND_URL` to your domain
