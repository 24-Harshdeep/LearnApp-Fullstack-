# 🚀 Adaptive Learning Platform - LearnFlow

**An AI-powered, gamified learning platform designed to help you master full-stack programming through adaptive learning paths, personalized challenges, and engaging progress tracking.**

---

## 🎯 What Problem Does This Solve?

This platform addresses common programming learning challenges:

- ⚡ **Retention Issues**: Interactive tasks and spaced repetition help you remember concepts
- 🧩 **Scattered Learning**: Unified platform for theory, practice, and progress tracking
- 📊 **No Clear Progress**: Visual dashboards show exactly what you've learned
- 😴 **Lack of Motivation**: Gamification with XP, badges, and streaks keeps you engaged
- 🎲 **Generic Content**: AI adapts to YOUR learning pace and weak areas

---

## ✨ Core Features

### 📚 Adaptive Learning Path
- Structured curriculum: HTML/CSS → JavaScript → React → Node.js → MongoDB → Full-Stack
- AI-powered topic recommendations based on your progress
- Visual progress tracking with completion percentages
- Unlock system - complete prerequisites before advancing

### 💻 Dynamic Practice Tasks
- AI-generated coding challenges tailored to your level
- Difficulty levels: Easy, Medium, Hard
- Time estimates and XP rewards
- Hints system that adapts to your attempt count
- View solutions after completion

### 📊 Progress Tracking
- **Visual Analytics**: Pie charts, bar charts, line graphs, radar charts
- **Key Metrics**: Total XP, accuracy rate, study time, streak tracking
- **Weekly Activity**: See your daily task completion and learning hours
- **Skills Assessment**: Radar chart showing proficiency across all topics
- **Learning Insights**: AI analyzes your patterns and suggests optimal study times

### 🏆 Gamification System
- **XP & Levels**: Earn 30-80 XP per task, level up every 200 XP
- **Badges**: Earn achievements like "7-Day Streak", "Night Owl", "Speed Demon"
- **Streaks**: Track current and longest learning streaks
- **Unlockable Rewards**: Custom themes, AI mentor voice, pro features
- **Leaderboard**: Compete with others (optional)

### 🤖 AI Integration
- Generate personalized coding tasks
- Smart recommendations for next topics
- Contextual hints based on your code
- Adaptive difficulty adjustment

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Beautiful data visualizations
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### AI Features (Optional)
- **OpenAI API** - Task generation and recommendations

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

\`\`\`bash
cd Project2

# Install all dependencies (root, client, server)
npm run install-all
\`\`\`

### 2. Configure Environment Variables

**Server Configuration:**
\`\`\`bash
cd server
cp .env.example .env
\`\`\`

Edit `server/.env`:
\`\`\`env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/adaptive-learning
JWT_SECRET=your_secure_secret_key_here
OPENAI_API_KEY=your_openai_key_here  # Optional
NODE_ENV=development
\`\`\`

### 3. Start MongoDB

**Local MongoDB:**
\`\`\`bash
mongod
\`\`\`

**Or use MongoDB Atlas** (cloud) and update MONGODB_URI in .env

### 4. Run the Application

**Option A: Run both servers concurrently (recommended):**
\`\`\`bash
# From root directory
npm run dev
\`\`\`

**Option B: Run separately:**
\`\`\`bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
\`\`\`

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 📂 Project Structure

\`\`\`
Project2/
├── client/                    # React Frontend (Vite)
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/           # Main pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LearningPath.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── Progress.jsx
│   │   │   └── Rewards.jsx
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                   # Express Backend
│   ├── config/
│   │   └── db.js            # MongoDB connection
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── LearningPath.js
│   │   ├── Task.js
│   │   └── UserProgress.js
│   ├── routes/              # API endpoints
│   │   ├── userRoutes.js
│   │   ├── learningPathRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── rewardRoutes.js
│   │   └── aiRoutes.js
│   ├── server.js            # Entry point
│   ├── .env.example
│   └── package.json
│
├── package.json             # Root package
├── .gitignore
└── README.md
\`\`\`

---

## 🎮 How to Use

### 1. **Dashboard**
   - View your current learning stats
   - See weekly activity charts
   - Check topic progress pie chart
   - Continue from where you left off

### 2. **Learning Path**
   - Browse structured modules
   - See prerequisites and topics
   - Track completion percentages
   - Get AI recommendations

### 3. **Tasks**
   - Filter by status: available, in-progress, completed
   - Start new challenges
   - View difficulty and XP rewards
   - Generate AI tasks

### 4. **Progress**
   - Visualize your growth over time
   - Check skill levels with radar charts
   - View recent achievements
   - Get learning insights

### 5. **Rewards**
   - Track your XP and level
   - Collect badges
   - Unlock special features
   - Compete on leaderboards

---

## 🔌 API Endpoints

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile/:id` - Get user profile
- `PATCH /api/users/:id/xp` - Update user XP

### Learning Path
- `GET /api/learning-path` - Get all modules
- `GET /api/learning-path/:id` - Get specific module
- `POST /api/learning-path` - Create module

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id/hints` - Get task hints

### Progress
- `GET /api/progress/user/:userId` - Get user progress
- `POST /api/progress/update` - Update progress
- `GET /api/progress/stats/:userId` - Get statistics

### Rewards
- `GET /api/rewards/badges/:userId` - Get badges
- `POST /api/rewards/badges/:userId` - Award badge
- `GET /api/rewards/leaderboard` - Get leaderboard

### AI Features
- `POST /api/ai/generate-task` - Generate AI task
- `POST /api/ai/recommend` - Get AI recommendation
- `POST /api/ai/hint` - Get contextual hint

---

## 🎨 Customization

### Change Theme Colors
Edit `client/tailwind.config.js`:
\`\`\`javascript
colors: {
  primary: {
    500: '#your-color',
    600: '#your-darker-color',
  },
}
\`\`\`

### Add New Learning Topics
Edit learning path data in `LearningPath.jsx` or create via API

### Modify XP Rewards
Update XP values in task creation or `Task.js` model

---

## 🚀 MVP Roadmap

### ✅ Phase 1 (Completed)
- [x] Project setup with MERN + Vite
- [x] Basic UI with Tailwind CSS
- [x] Dashboard with charts
- [x] Learning path structure
- [x] Task management
- [x] Progress tracking
- [x] Gamification system
- [x] Backend API
- [x] Database models

### 🔄 Phase 2 (Next Steps)
- [ ] User authentication implementation
- [ ] Connect frontend to backend API
- [ ] Add state management with Zustand
- [ ] Implement task code editor
- [ ] Add code execution/validation
- [ ] Real-time streak tracking

### 🎯 Phase 3 (Future)
- [ ] OpenAI integration for task generation
- [ ] AI-powered code review
- [ ] Video tutorial integration
- [ ] Social features (optional)
- [ ] Mobile responsive optimization
- [ ] Dark mode toggle
- [ ] Export progress as PDF/certificate

---

## 💡 Learning Tips

1. **Consistency > Intensity**: Study 30 minutes daily rather than 5 hours once a week
2. **Practice Immediately**: Complete tasks right after learning concepts
3. **Review Mistakes**: Check solutions to understand where you went wrong
4. **Track Progress**: Use charts to identify weak areas
5. **Maintain Streaks**: Daily practice builds long-term retention

---

## 🐛 Troubleshooting

### MongoDB Connection Error
\`\`\`bash
# Make sure MongoDB is running
mongod

# Or check your connection string in .env
\`\`\`

### Port Already in Use
\`\`\`bash
# Change PORT in server/.env
# Or kill process: lsof -ti:5000 | xargs kill -9
\`\`\`

### Vite Build Errors
\`\`\`bash
# Clear cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
\`\`\`

---

## 🤝 Contributing

This is a personal learning project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT License - feel free to use this for your own learning!

---

## 🎓 Author

Built by someone who struggled with programming and decided to build the solution.

**Good luck on your learning journey! 🚀**

---

## 📞 Support

If you have questions or need help:
- Open an issue on GitHub
- Check the troubleshooting section
- Review the API documentation above

---

*Remember: The goal isn't to rush through topics—it's to genuinely understand them. Take your time, practice consistently, and watch your skills grow!* 🌱
# Study
