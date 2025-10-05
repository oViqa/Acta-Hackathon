# 🚀 Deployment Guide - Pudding mit Gabel

This guide will help you deploy the Pudding mit Gabel meetup platform to Vercel.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier available)
- Node.js 20+ (for local testing)

## 🎯 Deployment Options

### Option 1: One-Click Deploy (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/oViqa/global-hackathon-v1&env=NEXT_PUBLIC_API_URL,JWT_SECRET,MONGODB_URI)

### Option 2: Manual Deploy via Vercel Dashboard

1. **Fork the Repository**
   - Go to [https://github.com/oViqa/global-hackathon-v1](https://github.com/oViqa/global-hackathon-v1)
   - Click "Fork" to create your own copy

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your forked repository

3. **Configure Project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: Leave default or use `npm run build`
   - **Install Command**: Leave default or use `npm install`

4. **Set Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-project-name.vercel.app
   JWT_SECRET=your-super-secret-jwt-key-here
   MONGODB_URI=mongodb+srv://... (optional)
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

### Option 3: CLI Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   vercel env add JWT_SECRET
   vercel env add MONGODB_URI
   ```

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Your deployed app URL | `https://pudding-gabel.vercel.app` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-key-123` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `MONGODB_DB` | Database name | `puddingmeetup` |
| `NODE_ENV` | Environment | `production` |

## 🗄️ Database Setup (Optional)

The app works perfectly **without a database** using mock data. For full functionality:

### MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier
   - Select region closest to your users
   - Click "Create Cluster"

3. **Setup Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username/password
   - Set permissions to "Read and write to any database"

4. **Get Connection String**
   - Go to "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

5. **Set Environment Variable**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/puddingmeetup?retryWrites=true&w=majority
   ```

### Without Database
- App runs in **mock mode**
- All features work except data persistence
- Perfect for demos and testing

## 🎮 Testing Your Deployment

### 1. **Basic Functionality**
- Visit your deployed URL
- Check if map loads correctly
- Try creating an account

### 2. **Admin Features**
- Login with: `admin2@puddingmeetup.com` / `adminpudding2`
- Access admin dashboard
- Create test events

### 3. **Location Features**
- Click "Events Around Me"
- Allow location access
- See radius circle on map

### 4. **Theme & Language**
- Toggle dark/light mode
- Switch between English/German
- Check if preferences persist

### 5. **Event Management**
- Create events with floating button
- Join events with test account
- Manage attendances in dashboard

## 🔍 Troubleshooting

### Common Issues

#### 1. **Build Fails**
```bash
# Check for TypeScript errors
npm run build

# Fix any linting issues
npm run lint
```

#### 2. **Map Not Loading**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for errors
- Ensure Leaflet CSS is imported

#### 3. **Authentication Issues**
- Verify `JWT_SECRET` is set
- Check environment variables in Vercel dashboard
- Clear browser cache/localStorage

#### 4. **API Errors**
- Check Vercel function logs
- Verify CORS settings
- Test API endpoints directly

#### 5. **Database Connection**
- Verify `MONGODB_URI` format
- Check MongoDB Atlas IP whitelist
- Ensure database user has correct permissions

### Debug Steps

1. **Check Vercel Logs**
   ```bash
   vercel logs your-deployment-url
   ```

2. **Test API Endpoints**
   ```bash
   curl https://your-app.vercel.app/api/events
   ```

3. **Browser Console**
   - Open Developer Tools
   - Check Console and Network tabs
   - Look for error messages

## 📊 Performance Optimization

### Vercel Configuration

Create `vercel.json` in project root:
```json
{
  "functions": {
    "frontend/src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### Image Optimization
- Use Next.js Image component
- Optimize pudding photos
- Consider CDN for static assets

## 🔒 Security Considerations

### Environment Variables
- Never commit secrets to Git
- Use Vercel's environment variable system
- Rotate JWT secrets regularly

### API Security
- Implement rate limiting
- Validate all inputs
- Use HTTPS only

### Database Security
- Use MongoDB Atlas security features
- Enable IP whitelisting
- Regular security updates

## 📈 Monitoring & Analytics

### Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor performance metrics
- Track user behavior

### Error Tracking
- Consider Sentry for error monitoring
- Set up alerts for critical issues
- Monitor API response times

## 🚀 Scaling Considerations

### Database
- Upgrade MongoDB Atlas plan as needed
- Implement caching strategies
- Consider read replicas for high traffic

### CDN
- Vercel provides global CDN automatically
- Optimize static assets
- Consider additional CDN for images

### Performance
- Monitor Core Web Vitals
- Optimize bundle size
- Implement lazy loading

## 📞 Support

### Getting Help
- Check [GitHub Issues](https://github.com/oViqa/global-hackathon-v1/issues)
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- MongoDB Atlas Support: [support.mongodb.com](https://support.mongodb.com)

### Community
- GitHub Discussions
- Discord/Slack channels
- Stack Overflow with `pudding-gabel` tag

---

**Happy Deploying! 🍮✨**

Your pudding meetup platform is ready to connect food enthusiasts across Germany!