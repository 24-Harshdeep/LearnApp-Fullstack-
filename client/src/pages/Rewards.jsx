import { motion } from 'framer-motion'
import { Trophy, Star, Gift, Lock, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuthStore, useAppStore } from '../store/store'
import axios from 'axios'
import toast from 'react-hot-toast'

const defaultRewards = [
  { id: 1, name: 'Custom Theme', xpRequired: 500, unlocked: false, icon: '🎨', description: 'Unlock custom color themes for your dashboard' },
  { id: 2, name: 'AI Mentor Voice', xpRequired: 1000, unlocked: false, icon: '🤖', description: 'Get personalized AI coaching assistance' },
  { id: 3, name: 'Pro Dashboard', xpRequired: 1500, unlocked: false, icon: '📊', description: 'Access advanced analytics and insights' },
  { id: 4, name: 'Certificate Generator', xpRequired: 2000, unlocked: false, icon: '🎓', description: 'Generate completion certificates' },
  { id: 5, name: 'Priority Support', xpRequired: 2500, unlocked: false, icon: '💬', description: 'Get priority help from instructors' },
  { id: 6, name: 'Exclusive Content', xpRequired: 3000, unlocked: false, icon: '🔥', description: 'Access premium learning materials' },
]

export default function Rewards() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)
  const [badges, setBadges] = useState([])
  const [rewards, setRewards] = useState(defaultRewards)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('lms_token')
      if (!token) {
        // Use local storage as fallback
        const lmsUser = localStorage.getItem('lms_user')
        if (lmsUser) {
          const data = JSON.parse(lmsUser)
          setUserData(data)
          processUserData(data)
        }
        setLoading(false)
        return
      }

      const response = await axios.get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        const data = response.data.user
        setUserData(data)
        processUserData(data)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      
      // Fallback to local storage
      const lmsUser = localStorage.getItem('lms_user')
      if (lmsUser) {
        const data = JSON.parse(lmsUser)
        setUserData(data)
        processUserData(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const processUserData = (data) => {
    // Badge unlock criteria (try safe reads from user data; server-provided badges take precedence)
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

    // Build explicit badges from server data (if present)
    const explicitBadges = (data.badges || []).map(badge => ({
      id: badge.badgeId || badge._id || badge.name,
      name: badge.name,
      icon: getBadgeIcon(badge.name),
      earned: true,
      earnedAt: badge.earnedAt,
      description: getBadgeDescription(badge.name)
    }))

    // Compute auto-earned badges based on criteria and available user fields
    const autoBadges = allBadgesList.map(name => {
      const already = explicitBadges.some(b => b.name === name)
      const meets = !already && (badgeCriteria[name] ? badgeCriteria[name](data) : false)
      if (!meets && !already) return null
      const explicit = explicitBadges.find(b => b.name === name)
      return {
        id: explicit ? explicit.id : name,
        name,
        icon: getBadgeIcon(name),
        earned: true,
        earnedAt: explicit ? explicit.earnedAt : new Date().toISOString(),
        description: getBadgeDescription(name)
      }
    }).filter(Boolean)

    // Merge explicit and auto badges, favor explicit (server) data
    const merged = [
      ...explicitBadges,
      ...autoBadges.filter(a => !explicitBadges.some(e => e.name === a.name))
    ]
    setBadges(merged)

    // Sync badges globally so Profile and other components update dynamically
    try {
      const appSetBadges = useAppStore.getState().setBadges
      if (typeof appSetBadges === 'function') appSetBadges(merged)

      // Also update auth store user object and localStorage so Profile.jsx picks up changes
      const authUpdate = useAuthStore.getState().updateUser
      if (typeof authUpdate === 'function') authUpdate({ badges: merged })

      const lmsUserRaw = localStorage.getItem('lms_user')
      if (lmsUserRaw) {
        try {
          const parsed = JSON.parse(lmsUserRaw)
          const updated = { ...parsed, badges: merged }
          localStorage.setItem('lms_user', JSON.stringify(updated))
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      console.error('Failed to sync badges to global stores:', e)
    }

  // Process unlockable rewards based on XP
    const userXP = data.xp || data.points || 0
    const unlockedRewards = data.unlockedRewards || []
    
    const updatedRewards = defaultRewards.map(reward => ({
      ...reward,
      unlocked: userXP >= reward.xpRequired || unlockedRewards.includes(reward.name)
    }))
    
    setRewards(updatedRewards)
  }

  const getBadgeIcon = (name) => {
    const iconMap = {
      'First Steps': '�',
      'Week Warrior': '🔥',
      'Code Master': '⚡',
      'Night Owl': '🦉',
      'Speed Demon': '🚀',
      'Perfectionist': '💎',
      'Marathon Runner': '🏃',
      'Full Stack': '🎯',
      'Quick Learner': '⚡',
      'Consistency King': '👑',
      'Problem Solver': '🧩',
      'Team Player': '🤝'
    }
    return iconMap[name] || '�'
  }

  const getBadgeDescription = (name) => {
    const descMap = {
      'First Steps': 'Complete your first task',
      'Week Warrior': '7-day learning streak',
      'Code Master': 'Complete 50 tasks',
      'Night Owl': 'Study after midnight',
      'Speed Demon': 'Complete 10 tasks in one day',
      'Perfectionist': '100% accuracy on 20 tasks',
      'Marathon Runner': '30-day learning streak',
      'Full Stack': 'Master all core topics',
      'Quick Learner': 'Complete tasks quickly',
      'Consistency King': 'Maintain regular study habits',
      'Problem Solver': 'Solve complex challenges',
      'Team Player': 'Collaborate with peers'
    }
    return descMap[name] || 'Achievement unlocked'
  }

  // Canonical list of all badges available in the app
  const allBadgesList = [
    'First Steps',
    'Week Warrior',
    'Code Master',
    'Night Owl',
    'Speed Demon',
    'Perfectionist',
    'Marathon Runner',
    'Full Stack',
    'Quick Learner',
    'Consistency King',
    'Problem Solver',
    'Team Player'
  ]

  const calculateLevel = (xp) => {
    return Math.floor(xp / 100) + 1
  }

  const getXPToNextLevel = (xp) => {
    const currentLevel = calculateLevel(xp)
    const xpForNextLevel = currentLevel * 100
    return xpForNextLevel - xp
  }

  const getProgressPercentage = (xp) => {
    const currentLevelXP = (calculateLevel(xp) - 1) * 100
    const xpInCurrentLevel = xp - currentLevelXP
    return (xpInCurrentLevel / 100) * 100
  }

  const handleUseReward = (rewardName) => {
    toast.success(`${rewardName} activated!`)
    // Implement actual reward activation logic here
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading rewards...</p>
        </div>
      </div>
    )
  }

  const userXP = userData?.xp || userData?.points || 0
  const userLevel = calculateLevel(userXP)
  const xpToNext = getXPToNextLevel(userXP)
  const progressPercent = getProgressPercentage(userXP)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Rewards & Achievements 🏆
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Celebrate your progress and unlock special features
        </p>
      </div>

      {/* XP Summary */}
      <div className="card bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">{userXP.toLocaleString()} XP</h2>
            <p className="text-yellow-100">Level {userLevel} • {xpToNext} XP to Level {userLevel + 1}</p>
          </div>
          <Trophy className="w-16 h-16 opacity-50" />
        </div>
        <div className="mt-4 bg-white bg-opacity-30 rounded-full h-3">
          <div 
            className="bg-white rounded-full h-3 transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Star className="w-6 h-6 text-yellow-500" />
          <span>Badges Collection</span>
          <span className="text-sm font-normal text-gray-500">({badges.length} earned)</span>
        </h2>
        {badges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg text-center bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900"
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                  {badge.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {badge.description}
                </p>
                {badge.earnedAt && (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Earned
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Star className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No badges earned yet</p>
            <p className="text-sm">Complete tasks and challenges to earn your first badge!</p>
          </div>
        )}
      </div>

      {/* Badges to Earn (available badges, show locked/earned state) */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Star className="w-6 h-6 text-yellow-500" />
          <span>Badges to Earn</span>
          <span className="text-sm font-normal text-gray-500">({allBadgesList.length} total)</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {allBadgesList.map((bName, idx) => {
            const owned = badges.some(b => b.name === bName)
            return (
              <motion.div
                key={bName}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                className={`p-4 rounded-lg text-center border ${owned ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
              >
                <div className="text-4xl mb-2">{getBadgeIcon(bName)}</div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">{bName}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{getBadgeDescription(bName)}</p>
                {owned ? (
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium">Earned</span>
                ) : (
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full font-medium">Locked</span>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
