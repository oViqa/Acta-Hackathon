# 🍮 Pudding mit Gabel - Find Your Pudding People

A modern, interactive meetup platform for pudding enthusiasts around the World! Built with Next.js, TypeScript, and MongoDB with automatic fallback to mock data.

## ✨ Features

### 🎯 Live Map with Advanced Features
- **Pulsing markers** for new events with custom pudding icons
- **HOT badges** 🔥 for events created in the last 10 minutes
- **Ripple effects** on marker clicks
- **Location circle** showing search radius
- **"Events Around Me"** button with visual radius display

### 🌙 Dark/Light Mode & Language Support
- **Theme toggle** with persistent storage
- **English/German** language switching
- **Smooth transitions** and animations
- **Responsive design** for all devices

### 🎮 Gamification & Discovery
- **Floating action button** for easy event creation
- **Live leaderboard** with points system
- **Event dashboard** for organizers to manage attendances
- **Admin dashboard** with full analytics

### 🎨 Modern UI/UX
- **Hover animations** and smooth transitions
- **Loading skeletons** instead of spinners
- **Pudding-themed** color scheme and gradients
- **Kleinanzeigen-style** header design

### 🔐 Admin Features
- **Multiple admin accounts** for testing
  - `admin2@puddingmeetup.com` / `adminpudding2`
  - `puddingdummy@puddingmeetup.com` / `dummytest`
- **Event management** dashboard for organizers
- **Attendance approval** system
- **Live statistics** and activity monitoring

## 🛠️ Local Development

### Prerequisites
- Node.js 20+
- npm 10+

### Setup
```bash
# Clone the repository
git clone https://github.com/oViqa/global-hackathon-v1.git
cd global-hackathon-v1

# Install dependencies
npm run install:all

# Start development servers
npm run dev
```

### Access Points
- **Frontend**: http://localhost:3002
- **MongoDB Connected**: ✅ Real database with existing events and users
- **Test Accounts** (Mock Mode):
  - `admin2@puddingmeetup.com` / `adminpudding2`
  - `puddingdummy@puddingmeetup.com` / `dummytest`
  - `test@example.com` / `testpass`
- **Real Database**: Register new accounts or use existing ones in MongoDB

## 🏗️ Project Structure

```
/
├── frontend/                 # Next.js 14 app
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   │   ├── map/         # Map components
│   │   │   ├── admin/       # Admin dashboard
│   │   │   ├── leaderboard/ # Leaderboard
│   │   │   ├── events/      # Event management
│   │   │   └── ui/          # UI components
│   │   ├── store/           # Zustand stores
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities
├── vercel.json              # Vercel configuration
└── deploy.sh                # Deployment script
```

## 🎮 Testing Features

### 1. **Map Interactions**
- Click pudding markers for ripple effects
- Use "Events Around Me" for location-based filtering
- Adjust radius to see location circle change size
- Watch for HOT badges on recent events

### 2. **Event Management**
- Create events with floating action button
- Manage attendances in event dashboard
- Approve/reject join requests
- View pudding photos from attendees

### 3. **Theme & Language**
- Toggle dark/light mode in header
- Switch between English/German
- All text updates automatically

### 4. **Admin Dashboard**
- Login with admin accounts
- View analytics and statistics
- Manage users and events

### 5. **Leaderboard**
- Click the 🏆 trophy button
- See live rankings with points
- Animated badges for top users

## 🗄️ Database & Mock Data

The app supports **both MongoDB and mock data** for maximum flexibility:

### With MongoDB (Recommended for Production)
- **Full persistence** - all data is saved and retrieved from database
- **Real user accounts** with secure authentication
- **Event management** with real-time updates
- **Complete functionality** including chat, attendance, etc.

### Without MongoDB (Mock Mode)
- **No database required** - everything works out of the box
- **Sample events** with realistic data across German cities
- **Mock authentication** with predefined test accounts
- **All features work** including admin dashboard and leaderboard
- **Perfect for demos** and quick deployment

## 🔧 Environment Variables

### For MongoDB Setup (Optional)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/puddingmeetup
MONGODB_DB=puddingmeetup
JWT_SECRET=your-super-secret-jwt-key
```

### Without Environment Variables
The app automatically falls back to mock data mode if no MongoDB URI is provided.

## 🚀 Deployment Options

### Vercel (Recommended)
- **Zero config** deployment
- **Automatic HTTPS**
- **Global CDN**
- **Built-in API routes** for database operations

### Other Platforms
- **Netlify**: Static site deployment
- **GitHub Pages**: Free hosting
- **Railway**: Full-stack deployment
- **AWS**: S3 + CloudFront

## 🐛 Troubleshooting

### Common Issues

1. **Map not loading**
   - Check Leaflet CSS import
   - Verify browser console for errors

2. **Admin login fails**
   - Use exact credentials from README
   - Try: `admin2@puddingmeetup.com` / `adminpudding2`

3. **Build fails**
   - Ensure all dependencies installed
   - Check TypeScript errors

4. **Database connection issues**
   - App automatically falls back to mock data
   - Check MongoDB URI in environment variables
   - Verify network connectivity to MongoDB Atlas

### Getting Help
- Check the [Issues](https://github.com/oViqa/global-hackathon-v1/issues) page
- Create a new issue with details
- Include browser console logs

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Leaflet** for map functionality
- **Next.js** for the amazing framework
- **Tailwind CSS** for styling
- **MongoDB** for data persistence
- **Vercel** for hosting

---

**Made with 🍮 by pudding enthusiasts, for pudding enthusiasts!**
