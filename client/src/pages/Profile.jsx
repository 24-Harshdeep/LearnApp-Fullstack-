import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  User, Mail, Shield, Calendar, Award, Target, 
  TrendingUp, BookOpen, Edit2, Save, X, Camera,
  Zap, Star, Clock, Users, Flame
} from 'lucide-react'
import { useAuthStore, useAppStore } from '../store/store'
import axios from 'axios'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [profileData, setProfileData] = useState(null)
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    learningGoal: 'full-stack'
  })

  useEffect(() => {
    const fetchProfile = async () => {
      setFetchingData(true)
      try {
        const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
        
        if (!token) {
          // Use local storage data as fallback
          const lmsUser = localStorage.getItem('lms_user')
          if (lmsUser) {
            const userData = JSON.parse(lmsUser)
            setProfileData(userData)
            setFormData({
              name: userData.name || '',
              email: userData.email || '',
              learningGoal: userData.preferences?.learningGoal || 'full-stack'
            })
          }
          setFetchingData(false)
          return
        }

        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.data.success) {
          const userData = response.data.user
          console.log('📊 Fetched Profile Data:', {
            name: userData.name,
            loginStreak: userData.loginStreak,
            progress: userData.progress,
            xp: userData.xp
          })
          
          setProfileData(userData)

          // Compute & sync badges so profile shows auto-earned badges immediately
          try {
            const allBadgesList = [
              'First Steps','Week Warrior','Code Master','Night Owl','Speed Demon',
              'Perfectionist','Marathon Runner','Full Stack','Quick Learner',
              'Consistency King','Problem Solver','Team Player'
            ]

            const badgeCriteria = {
              'First Steps': (u) => (u.completedTasks || u.tasksCompleted || 0) >= 1 || (u.xp || 0) >= 10,
              'Week Warrior': (u) => (u.loginStreak || 0) >= 7,
              'Code Master': (u) => (u.completedTasks || u.tasksCompleted || 0) >= 50,
              'Night Owl': (u) => (u.nightSessions || 0) >= 1 || !!u.completedLate,
              'Speed Demon': (u) => (u.fastCompletions || 0) >= 1 || (u.maxDailyCompleted || 0) >= 10,
              'Perfectionist': (u) => (u.perfectRuns || 0) >= 20 || (u.accuracy || 0) >= 100,
              'Marathon Runner': (u) => (u.loginStreak || 0) >= 30,
              'Full Stack': (u) => (u.completedTopics || 0) >= 10,
              'Quick Learner': (u) => (u.avgCompletionTime || Infinity) <= 10,
              'Consistency King': (u) => (u.loginStreak || 0) >= 14 || (u.weeksActive || 0) >= 8,
              'Problem Solver': (u) => (u.hardTasksCompleted || 0) >= 1,
              'Team Player': (u) => (u.collaborations || 0) >= 1
            }

            const explicitBadges = (userData.badges || []).map(b => ({ id: b.badgeId || b._id || b.name, name: b.name, earnedAt: b.earnedAt }))
            const autoBadges = allBadgesList.map(name => {
              const already = explicitBadges.some(b => b.name === name)
              const meets = !already && (badgeCriteria[name] ? badgeCriteria[name](userData) : false)
              if (!meets && !already) return null
              const explicit = explicitBadges.find(b => b.name === name)
              return { id: explicit ? explicit.id : name, name, earnedAt: explicit ? explicit.earnedAt : new Date().toISOString() }
            }).filter(Boolean)
            const merged = [...explicitBadges, ...autoBadges.filter(a => !explicitBadges.some(e => e.name === a.name))]

            // Sync to global stores and localStorage
            try {
              const setBadges = useAppStore.getState().setBadges
              if (typeof setBadges === 'function') setBadges(merged)
              const authUpd = useAuthStore.getState().updateUser
              if (typeof authUpd === 'function') authUpd({ badges: merged })
              const stored = { ...userData, badges: merged }
              localStorage.setItem('lms_user', JSON.stringify(stored))
              // also update profileData to include badges
              setProfileData(stored)
            } catch (e) {
              console.error('Badge sync error in profile:', e)
            }
          } catch (e) {
            console.error('Failed to compute badges for profile:', e)
          }

          // Update local storage and store
          localStorage.setItem('lms_user', JSON.stringify(userData))
          updateUser(userData)
          
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            learningGoal: userData.preferences?.learningGoal || 'full-stack'
          })
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        
        // Fallback to local storage
        const lmsUser = localStorage.getItem('lms_user')
        if (lmsUser) {
          try {
            const userData = JSON.parse(lmsUser)
            setProfileData(userData)
            setFormData({
              name: userData.name || '',
              email: userData.email || '',
              learningGoal: userData.preferences?.learningGoal || 'full-stack'
            })
          } catch (parseError) {
            console.error('Error parsing user data:', parseError)
          }
        }
      } finally {
        setFetchingData(false)
      }
    }

    // Fetch once on mount and set up interval to refresh every 30 seconds
    fetchProfile()
    const interval = setInterval(fetchProfile, 30000)
    
    return () => clearInterval(interval)
  }, [updateUser])

  // Separate function for manual refresh
  const fetchFullProfile = async () => {
    try {
      const token = localStorage.getItem('lms_token')
      if (!token) return

      const response = await axios.get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        const userData = response.data.user
        
        // DEBUG: Log received progress data
        console.log('🔍 Profile.jsx received progress data:', {
          html: userData.progress?.html,
          css: userData.progress?.css,
          javascript: userData.progress?.javascript,
          react: userData.progress?.react,
          nodejs: userData.progress?.nodejs,
          typescript: userData.progress?.typescript,
          average: Math.round((
            (userData.progress?.html || 0) +
            (userData.progress?.css || 0) +
            (userData.progress?.javascript || 0) +
            (userData.progress?.react || 0) +
            (userData.progress?.nodejs || 0) +
            (userData.progress?.typescript || 0)
          ) / 6)
        })
        
        setProfileData(userData)
        localStorage.setItem('lms_user', JSON.stringify(userData))
        updateUser(userData)
        
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          learningGoal: userData.preferences?.learningGoal || 'full-stack'
        })
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error)
    }
  }

  // Get user data (prioritize profileData, fallback to store)
  const appBadges = useAppStore(state => state.badges)
  const userData = profileData || user
  // When profileData exists it will be used; otherwise fall back to auth store.
  // For badges, prefer profileData.badges -> auth user badges -> global app badges
  const badgesToShow = (profileData?.badges && profileData.badges.length > 0)
    ? profileData.badges
    : (user?.badges && user.badges.length > 0)
      ? user.badges
      : appBadges || []

  const handleSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('lms_token')
      
      // Update both in memory and local storage
      const updatedUser = { ...userData, ...formData }
      setProfileData(updatedUser)
      localStorage.setItem('lms_user', JSON.stringify(updatedUser))
      updateUser(updatedUser)
      
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      
      // Re-fetch to get latest data
      await fetchFullProfile()
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      learningGoal: userData.preferences?.learningGoal || 'full-stack'
    })
    setIsEditing(false)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No user data found</p>
          <Link to="/lms/login" className="text-blue-600 hover:underline">
            Please login
          </Link>
        </div>
      </div>
    )
  }

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`${bgColor} rounded-xl p-6 shadow-lg`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <div className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300">{label}</div>
    </motion.div>
  )

  const ProgressBar = ({ label, value, color }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-3 rounded-full ${color}`}
        />
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          My Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and view your progress
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            {/* Profile Picture */}
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                {userData?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button className="absolute bottom-0 right-1/2 translate-x-16 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {userData?.name || 'Guest User'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 capitalize flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                {userData?.role || 'Student'}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">XP Points</span>
                </div>
                <span className="font-bold text-purple-600">{userData?.points || userData?.xp || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Level</span>
                </div>
                <span className="font-bold text-yellow-600">
                  {Math.floor((userData?.points || userData?.xp || 0) / 100) + 1}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Login Streak</span>
                </div>
                <span className="font-bold text-orange-600">
                  {userData?.loginStreak || 0} days 🔥
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activity Streak</span>
                </div>
                <span className="font-bold text-blue-600">
                  {typeof userData?.streak === 'object' 
                    ? userData.streak.currentStreak 
                    : userData?.streak || 0} days
                </span>
              </div>

              {userData?.role === 'student' && (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Classes</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {userData?.classesJoined?.length || 0}
                  </span>
                </div>
              )}

              {userData?.role === 'teacher' && (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Classes Created</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {userData?.classesCreated?.length || 0}
                  </span>
                </div>
              )}
            </div>

            {/* Edit Profile Button */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Personal Information
            </h3>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg font-medium">
                    {userData?.name || 'Not set'}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg font-medium">
                  {userData?.email || 'Not set'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Account Type
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg font-medium capitalize">
                  {userData?.role || 'Student'}
                </div>
              </div>

              {/* Learning Goal (Students only) */}
              {userData?.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Learning Goal
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.learningGoal}
                      onChange={(e) => setFormData({ ...formData, learningGoal: e.target.value })}
                      className="w-full border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="full-stack">Full-Stack Developer</option>
                      <option value="frontend">Frontend Developer</option>
                      <option value="backend">Backend Developer</option>
                      <option value="mobile">Mobile Developer</option>
                      <option value="devops">DevOps Engineer</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg font-medium capitalize">
                      {formData.learningGoal.replace('-', ' ')}
                    </div>
                  )}
                </div>
              )}

              {/* Account Created */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg font-medium">
                  {formatDate(userData?.createdAt)}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Progress Overview (Students only) */}
          {userData?.role === 'student' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  Learning Progress
                </h3>
                <button
                  onClick={fetchFullProfile}
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition text-sm font-medium"
                >
                  🔄 Refresh
                </button>
              </div>

              {/* OVERALL PROGRESS - SUPER VISIBLE WITH DEBUG INFO */}
              <div className="mb-6 p-8 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl shadow-2xl border-4 border-white dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-3xl font-bold text-white mb-2">📚 Overall Learning Progress</h4>
                    <p className="text-indigo-100 text-base">
                      {Math.round((
                        (userData.progress?.html || 0) +
                        (userData.progress?.css || 0) +
                        (userData.progress?.javascript || 0) +
                        (userData.progress?.react || 0) +
                        (userData.progress?.nodejs || 0) +
                        (userData.progress?.typescript || 0)
                      ) / 6) === 0 
                        ? '🚀 Start learning to track your progress!' 
                        : '🎯 Great job! Keep learning to increase your progress!'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-8xl font-black text-white drop-shadow-2xl animate-pulse">
                      {Math.round(
                        (
                          (userData.progress?.html || 0) +
                          (userData.progress?.css || 0) +
                          (userData.progress?.javascript || 0) +
                          (userData.progress?.react || 0) +
                          (userData.progress?.nodejs || 0) +
                          (userData.progress?.typescript || 0)
                        ) / 6
                      )}%
                    </div>
                    <p className="text-base text-white font-bold mt-2 bg-white/20 px-4 py-2 rounded-full">
                      Average Progress
                    </p>
                  </div>
                </div>
                
                {/* Individual Course Progress - HUGE AND VISIBLE */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/30 backdrop-blur-md rounded-xl p-5 text-center border-2 border-white/50 shadow-xl hover:scale-105 transition-transform">
                    <div className="text-5xl font-black text-white drop-shadow-lg mb-2">
                      {userData.progress?.html || 0}%
                    </div>
                    <p className="text-base text-white font-bold">🟠 HTML</p>
                  </div>
                  <div className="bg-white/30 backdrop-blur-md rounded-xl p-5 text-center border-2 border-white/50 shadow-xl hover:scale-105 transition-transform">
                    <div className="text-5xl font-black text-white drop-shadow-lg mb-2">
                      {userData.progress?.css || 0}%
                    </div>
                    <p className="text-base text-white font-bold">🔵 CSS</p>
                  </div>
                  <div className="bg-white/30 backdrop-blur-md rounded-xl p-5 text-center border-2 border-white/50 shadow-xl hover:scale-105 transition-transform">
                    <div className="text-5xl font-black text-white drop-shadow-lg mb-2">
                      {userData.progress?.javascript || 0}%
                    </div>
                    <p className="text-base text-white font-bold">🟡 JavaScript</p>
                  </div>
                  <div className="bg-white/30 backdrop-blur-md rounded-xl p-5 text-center border-2 border-white/50 shadow-xl hover:scale-105 transition-transform">
                    <div className="text-5xl font-black text-white drop-shadow-lg mb-2">
                      {userData.progress?.react || 0}%
                    </div>
                    <p className="text-base text-white font-bold">🔷 React</p>
                  </div>
                  <div className="bg-white/30 backdrop-blur-md rounded-xl p-5 text-center border-2 border-white/50 shadow-xl hover:scale-105 transition-transform">
                    <div className="text-5xl font-black text-white drop-shadow-lg mb-2">
                      {userData.progress?.nodejs || 0}%
                    </div>
                    <p className="text-base text-white font-bold">🟢 Node.js</p>
                  </div>
                  <div className="bg-white/30 backdrop-blur-md rounded-xl p-5 text-center border-2 border-white/50 shadow-xl hover:scale-105 transition-transform">
                    <div className="text-5xl font-black text-white drop-shadow-lg mb-2">
                      {userData.progress?.typescript || 0}%
                    </div>
                    <p className="text-base text-white font-bold">🔹 TypeScript</p>
                  </div>
                </div>
                
                {/* DEBUG INFO - Shows raw data */}
                <div className="mt-5 p-4 bg-black/30 rounded-lg border-2 border-white/20">
                  <p className="text-sm text-white font-bold mb-1">📊 Debug Data (Raw Values):</p>
                  <p className="text-xs text-white font-mono">
                    HTML: {userData.progress?.html || 0}% | 
                    CSS: {userData.progress?.css || 0}% | 
                    JS: {userData.progress?.javascript || 0}% | 
                    React: {userData.progress?.react || 0}% | 
                    Node: {userData.progress?.nodejs || 0}% | 
                    TS: {userData.progress?.typescript || 0}%
                  </p>
                  <p className="text-xs text-yellow-200 mt-2">
                    💡 If you see 0% but completed lessons, try refreshing the page or clicking the Refresh button above.
                  </p>
                </div>
              </div>

              {/* Detailed Progress Bars */}
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📚 Course-by-Course Progress</h4>
              </div>

              <div className="space-y-4">
                <ProgressBar 
                  label="HTML" 
                  value={Math.round(userData.progress?.html || 0)} 
                  color="bg-orange-500" 
                />
                <ProgressBar 
                  label="CSS" 
                  value={Math.round(userData.progress?.css || 0)} 
                  color="bg-blue-500" 
                />
                <ProgressBar 
                  label="JavaScript" 
                  value={Math.round(userData.progress?.javascript || 0)} 
                  color="bg-yellow-500" 
                />
                <ProgressBar 
                  label="React" 
                  value={Math.round(userData.progress?.react || 0)} 
                  color="bg-cyan-500" 
                />
                <ProgressBar 
                  label="Node.js" 
                  value={Math.round(userData.progress?.nodejs || 0)} 
                  color="bg-green-500" 
                />
                <ProgressBar 
                  label="TypeScript" 
                  value={Math.round(userData.progress?.typescript || 0)} 
                  color="bg-blue-600" 
                />
              </div>

              {/* Confidence Index */}
              <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Confidence Index
                  </h4>
                  <span className="text-3xl font-bold text-purple-600">
                    {userData.confidenceIndex || 50}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${userData.confidenceIndex || 50}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Achievements - Only for Students */}
          {userData?.role !== 'teacher' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Award className="w-6 h-6" />
                Achievements & Badges
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {badgesToShow && badgesToShow.length > 0 ? (
                  badgesToShow.map((badge, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="p-4 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg text-center cursor-pointer"
                    >
                      <Award className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {badge.name || badge.badgeId || 'Achievement'}
                      </p>
                      {badge.earnedAt && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatDate(badge.earnedAt)}
                        </p>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                    <Award className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p>No badges earned yet. Keep learning!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
