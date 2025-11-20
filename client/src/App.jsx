import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import axios from 'axios'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Curriculum from './pages/Curriculum'
import LearningPath from './pages/LearningPath'
import Tasks from './pages/Tasks'
import Progress from './pages/Progress'
import Rewards from './pages/Rewards'
import Store from './pages/Store'
import Social from './pages/Social'
import Leaderboard from './pages/Leaderboard'
import AIChallenges from './pages/AIChallenges'
import AIQuiz from './pages/AIQuiz'
import Profile from './pages/Profile'
import AICoachChat from './components/AICoachChat'
import { useAuthStore } from './store/store'
import AIDebugDuel from './pages/AIDebugDuel'
// LMS Pages
import LMSLogin from './pages/LMSLogin'
import TeacherDashboard from './pages/TeacherDashboard'
import TeacherDashboardClean from './pages/TeacherDashboardClean'
import StudentDashboard from './pages/StudentDashboard'
import TeacherClassroom from './pages/TeacherClassroom'
import StudentClassroom from './pages/StudentClassroom'
// Hackathon Pages
import TeacherHackathon from './pages/TeacherHackathon'
import StudentHackathon from './pages/StudentHackathon'
// Dev Tools
import DevUserSwitcher from './pages/DevUserSwitcher'

function App() {
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const fetchUserData = async () => {
      const lmsToken = localStorage.getItem('lms_token')
      const lmsUser = localStorage.getItem('lms_user')
      
      if (lmsToken && lmsUser) {
        try {
          // Fetch real-time user data from server
          const response = await axios.get('http://localhost:5000/api/users/me', {
            headers: { Authorization: `Bearer ${lmsToken}` }
          })

          if (response.data.success) {
            const userData = response.data.user
            
            // Update local storage with fresh data
            localStorage.setItem('lms_user', JSON.stringify(userData))
            
            // Sync with app store
            setAuth(userData, lmsToken)
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error)
          
          // Fallback to local storage data
          const user = JSON.parse(lmsUser)
          const appUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            xp: user.xp || user.points || 0,
            coins: user.coins || Math.floor((user.points || 0) / 10),
            level: user.level || Math.floor((user.points || 0) / 100) + 1,
            streak: user.streak || { currentStreak: 0, longestStreak: 0 },
            progress: user.progress || {},
            badges: user.badges || [],
            unlockedRewards: user.unlockedRewards || [],
            role: user.role
          }
          setAuth(appUser, lmsToken)
        }
      }
    }

    fetchUserData()
  }, [setAuth])

  return (
    <Router>
      <Toaster position="top-right" />
      <AICoachChat />
      <Routes>
        {/* LMS Login Route - standalone */}
        <Route path="/lms/login" element={<LMSLogin />} />
        
        {/* Dev Tools - standalone (no layout) */}
        <Route path="/dev/users" element={<DevUserSwitcher />} />
        
        {/* Main App Routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          {/* LMS role dashboards */}
          <Route path="lms/teacher" element={<TeacherDashboardClean />} />
          <Route path="lms/teacher/students" element={<TeacherDashboard />} />
          <Route path="lms/teacher/class/:classId" element={<TeacherClassroom />} />
          <Route path="lms/student" element={<StudentDashboard />} />
          <Route path="lms/student/class/:classId" element={<StudentClassroom />} />
          {/* Hackathon Routes */}
          <Route path="hackathon/teacher" element={<TeacherHackathon />} />
          <Route path="hackathon/student" element={<StudentHackathon />} />
          <Route path="curriculum" element={<Curriculum />} />
          <Route path="learning-path" element={<LearningPath />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="social" element={<Social />} />
          <Route path="ai-quiz" element={<AIQuiz />} />
          <Route path="ai-debug-duel" element={<AIDebugDuel />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="ai-challenges" element={<AIChallenges />} />
          <Route path="progress" element={<Progress />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="store" element={<Store />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
