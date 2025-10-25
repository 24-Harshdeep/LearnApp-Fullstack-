import { motion } from 'framer-motion'
import { Trophy, Star, Gift, Zap } from 'lucide-react'

const badges = [
  { id: 1, name: 'First Steps', icon: '👣', earned: true, description: 'Complete your first task' },
  { id: 2, name: 'Week Warrior', icon: '🔥', earned: true, description: '7-day learning streak' },
  { id: 3, name: 'Code Master', icon: '⚡', earned: true, description: 'Complete 50 tasks' },
  { id: 4, name: 'Night Owl', icon: '🦉', earned: true, description: 'Study after midnight' },
  { id: 5, name: 'Speed Demon', icon: '🚀', earned: false, description: 'Complete 10 tasks in one day' },
  { id: 6, name: 'Perfectionist', icon: '💎', earned: false, description: '100% accuracy on 20 tasks' },
  { id: 7, name: 'Marathon Runner', icon: '🏃', earned: false, description: '30-day learning streak' },
  { id: 8, name: 'Full Stack', icon: '🎯', earned: false, description: 'Master all core topics' },
]

const rewards = [
  { id: 1, name: 'Custom Theme', xp: 500, unlocked: true, icon: '🎨' },
  { id: 2, name: 'AI Mentor Voice', xp: 1000, unlocked: true, icon: '🤖' },
  { id: 3, name: 'Pro Dashboard', xp: 1500, unlocked: false, icon: '📊' },
  { id: 4, name: 'Certificate Generator', xp: 2000, unlocked: false, icon: '🎓' },
]

const leaderboard = [
  { rank: 1, name: 'You', xp: 1250, avatar: '👤' },
  { rank: 2, name: 'Alex', xp: 1180, avatar: '👨‍💻' },
  { rank: 3, name: 'Sarah', xp: 1050, avatar: '👩‍💻' },
  { rank: 4, name: 'Mike', xp: 980, avatar: '👨‍🎓' },
  { rank: 5, name: 'Emma', xp: 920, avatar: '👩‍🎓' },
]

export default function Rewards() {
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
            <h2 className="text-3xl font-bold mb-2">1,250 XP</h2>
            <p className="text-yellow-100">Level 8 • 250 XP to Level 9</p>
          </div>
          <Trophy className="w-16 h-16 opacity-50" />
        </div>
        <div className="mt-4 bg-white bg-opacity-30 rounded-full h-3">
          <div className="bg-white rounded-full h-3" style={{ width: '60%' }}></div>
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Star className="w-6 h-6 text-yellow-500" />
          <span>Badges Collection</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg text-center ${
                badge.earned
                  ? 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900'
                  : 'bg-gray-100 dark:bg-gray-700 opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                {badge.name}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {badge.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Unlockable Rewards */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Gift className="w-6 h-6 text-purple-500" />
          <span>Unlockable Features</span>
        </h2>
        <div className="space-y-4">
          {rewards.map((reward) => (
            <motion.div
              key={reward.id}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center justify-between p-4 rounded-lg ${
                reward.unlocked
                  ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700'
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{reward.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {reward.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {reward.unlocked ? 'Unlocked!' : `${reward.xp} XP required`}
                  </p>
                </div>
              </div>
              {reward.unlocked ? (
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">
                  Use Now
                </button>
              ) : (
                <button className="bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg font-semibold cursor-not-allowed">
                  Locked
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Zap className="w-6 h-6 text-blue-500" />
          <span>Weekly Leaderboard</span>
        </h2>
        <div className="space-y-2">
          {leaderboard.map((user) => (
            <motion.div
              key={user.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: user.rank * 0.1 }}
              className={`flex items-center justify-between p-4 rounded-lg ${
                user.name === 'You'
                  ? 'bg-blue-50 dark:bg-blue-900 border-2 border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  user.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                  user.rank === 2 ? 'bg-gray-300 text-gray-700' :
                  user.rank === 3 ? 'bg-orange-400 text-orange-900' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {user.rank}
                </div>
                <div className="text-2xl">{user.avatar}</div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {user.name}
                </span>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">{user.xp} XP</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">This week</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
