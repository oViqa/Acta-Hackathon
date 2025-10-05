# 🍮 Pudding Mit Gabel Meetup Platform

**Find your pudding people.**

A web-first, location-based social platform for organizing and discovering "pudding with fork" meetup events across Germany. Built during a 24-hour hackathon, this demo showcases real-time community interaction, instant event creation, and gamified food culture trends.

![Pudding Gabel Banner](https://via.placeholder.com/1200x400/FF6B9D/FFFFFF?text=Pudding+Gabel+Meetup)

---

## 🎯 Overview

Pudding Gabel connects food enthusiasts through quirky, hyperlocal meetup events centered around Germany's beloved pudding-with-fork culture. Whether you're organizing a spontaneous dessert gathering or looking for your next food adventure, our platform makes it instant, visual, and community-driven.

---

## ✨ Features

### Core Functionality
- **🗺️ Interactive Germany Map** – Custom pudding event markers with real-time updates
- **⚡ Instant Event Creation** – Pin location, set details (title, time, attendee limit), upload pudding photo
- **📸 Photo-First Joining** – Upload your pudding photo to join events; organizers approve attendees
- **💬 Real-Time Group Chat** – Approved attendees get instant messaging with image support via Socket.io
- **🔍 Smart Discovery** – Filter events by radius and date, with visual distance indicators
- **🎨 Instagram-Worthy UI** – Smooth animations, responsive design built with TailwindCSS & shadcn/ui

### Ready for Growth
- Authentication system (JWT-based)
- Moderation tools for organizers
- Notification infrastructure
- Gamification-ready architecture

---

## 👥 Target Audience

**Young adults (18-35)** who love food trends, community connections, and social experiences.

### Example Personas
- **Lisa (Berlin)** – Craves quirky local meetups and authentic connections
- **Max (Munich)** – Passionate about organizing community food events
- **Sarah (Hamburg)** – Social media enthusiast seeking shareable experiences

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (TypeScript)
- **Styling:** TailwindCSS
- **Mapping:** Leaflet.js
- **State Management:** Zustand

### Backend
- **Runtime:** Node.js 20
- **Database:** MongoDB
- **Authentication:** Session-based

### DevOps
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Railway / Render
- **Database:** Supabase
- **CI/CD:** GitHub Actions

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/oViqa/global-hackathon-v1.git
   cd global-hackathon-v1
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. **Environment setup**
   ```bash
   # Frontend
   cp .env.example .env.local
   
   # Backend
   cp .env.example .env
   ```
   
   Fill in required environment variables (see [Environment Variables](#environment-variables) section).

4. **Database setup**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed  # Optional: seed with example data
   ```

5. **Run development servers**
   ```bash
   # Frontend (from /frontend directory)
   npm run dev
   # Runs on http://localhost:3000

   # Backend (from /backend directory)
   npm run dev
   # Runs on http://localhost:5000
   ```

---

## 📱 Core User Flows

### For Attendees
1. **Discover** – Browse interactive map or list view with filters
2. **Join** – Select event → Upload pudding photo → Wait for approval
3. **Connect** – Get approved → Access group chat → Meet your people!

### For Organizers
1. **Create** – Pin map location → Set event details → Publish instantly
2. **Manage** – Review join requests with photos → Approve/reject attendees
3. **Moderate** – Edit event details, manage chat, cancel if needed

### Discovery Features
- **Radius Filter** – Find events within 5km, 10km, 25km, or 50km
- **Date Filter** – Today, this week, this month, or custom range
- **Map/List Toggle** – Visual exploration or detailed list view
- **Distance Indicators** – Know exactly how far each event is

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Branch Naming
- `feature/your-feature-name`
- `bugfix/issue-description`
- `refactor/component-name`

### Pull Request Process
1. Fork the repository
2. Create your feature branch
3. Write/update tests for new features
4. Run test suites: `npm test` (both frontend and backend)
5. Ensure code follows existing style (run `npm run lint`)
6. Submit PR with clear description

### Code Standards
- TypeScript for type safety
- Component-based architecture
- Meaningful commit messages
- Documentation for new features


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with ❤️ during [Hackathon Name] 2025. Special thanks to:
- The hackathon organizers
- Open-source community for amazing tools
- Germany's pudding enthusiasts for inspiration

---

## 📞 Contact & Support

- **Repository:** [github.com/oViqa/global-hackathon-v1](https://github.com/oViqa/global-hackathon-v1)
- **Issues:** Report bugs or request features via GitHub Issues
- **Discussions:** Join our community discussions on GitHub

---

**Made with 🍮 and ⚡ in 24 hours**
