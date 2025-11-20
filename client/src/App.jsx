import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Curriculum from './pages/Curriculum'
import LearningPath from './pages/LearningPath'
import Tasks from './pages/Tasks'
import Progress from './pages/Progress'
import Rewards from './pages/Rewards'
import Store from './pages/Store'
import Social from './pages/Social'
import AIChallenges from './pages/AIChallenges'
import AICoachChat from './components/AICoachChat'
import { useAuthStore } from './store/store'
// LMS Pages
import LMSLogin from './pages/LMSLogin'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'

function App() {
  const { setAuth } = useAuthStore()

  useEffect(() => {
    // Auto-login demo user for testing
    const demoUser = {
      _id: 'demo123',
      name: 'Demo Learner',
      email: 'demo@idlelearn.com',
      xp: 250,
      coins: 150,
      level: 2,
      streak: {
        currentStreak: 7,
        longestStreak: 14
      },
      unlockedRewards: []
    }
    setAuth(demoUser, 'demo-token')
  }, [setAuth])

  return (
    <Router>
      <Toaster position="top-right" />
      <AICoachChat />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="curriculum" element={<Curriculum />} />
          <Route path="learning-path" element={<LearningPath />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="social" element={<Social />} />
          <Route path="ai-challenges" element={<AIChallenges />} />
          <Route path="progress" element={<Progress />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="store" element={<Store />} />
        </Route>
        {/* LMS Routes - separate from main layout */}
        <Route path="/lms/login" element={<LMSLogin />} />
        <Route path="/lms/teacher" element={<TeacherDashboard />} />
        <Route path="/lms/student" element={<StudentDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
