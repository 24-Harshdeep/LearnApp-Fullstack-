import { motion } from 'framer-motion'
import { TrendingUp, Target, Clock, Calendar } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

const weeklyXP = [
  { date: 'Jan 15', xp: 120 },
  { date: 'Jan 16', xp: 180 },
  { date: 'Jan 17', xp: 150 },
  { date: 'Jan 18', xp: 220 },
  { date: 'Jan 19', xp: 190 },
  { date: 'Jan 20', xp: 160 },
  { date: 'Jan 21', xp: 240 },
]

const skillsData = [
  { skill: 'HTML', level: 85 },
  { skill: 'CSS', level: 80 },
  { skill: 'JavaScript', level: 65 },
  { skill: 'React', level: 55 },
  { skill: 'Node.js', level: 35 },
  { skill: 'Database', level: 25 },
]

const achievements = [
  { title: '7-Day Streak', date: 'Jan 21, 2025', icon: '🔥' },
  { title: '50 Tasks Completed', date: 'Jan 20, 2025', icon: '✅' },
  { title: 'JavaScript Master', date: 'Jan 18, 2025', icon: '⚡' },
  { title: 'Early Bird', date: 'Jan 15, 2025', icon: '🌅' },
]

export default function Progress() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Your Progress 📊
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your learning journey and celebrate milestones
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ProgressCard
          icon={TrendingUp}
          title="Total XP"
          value="1,250"
          change="+15% this week"
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <ProgressCard
          icon={Target}
          title="Accuracy Rate"
          value="87%"
          change="+3% improvement"
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <ProgressCard
          icon={Clock}
          title="Study Time"
          value="42h"
          change="This month"
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <ProgressCard
          icon={Calendar}
          title="Longest Streak"
          value="14 days"
          change="Personal best"
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* XP Progress Line Chart */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Weekly XP Progress
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyXP}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="xp" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Radar Chart */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Skills Assessment
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={skillsData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Your Level" dataKey="level" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Recent Achievements 🏆
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="text-4xl">{achievement.icon}</div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {achievement.date}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Learning Insights */}
      <div className="card bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
        <h2 className="text-xl font-bold mb-3">💡 Learning Insights</h2>
        <div className="space-y-2">
          <p>✅ You're most productive in the <strong>evening hours</strong></p>
          <p>🎯 Your strongest area is <strong>HTML/CSS</strong></p>
          <p>📈 You've improved <strong>JavaScript</strong> by 15% this week</p>
          <p>💪 Consider focusing on <strong>React Hooks</strong> to maximize learning efficiency</p>
        </div>
      </div>
    </div>
  )
}

function ProgressCard({ icon: Icon, title, value, change, color, bgColor }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="card"
    >
      <div className={`${bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-500">{change}</p>
    </motion.div>
  )
}
