import { motion } from 'framer-motion'
import { Gamepad2, Target, Zap, Brain, Trophy, Clock, Coins } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/store'
import toast from 'react-hot-toast'

const games = [
  {
    id: 1,
    name: 'Bubble Shooter',
    icon: '🎯',
    description: 'Pop colorful bubbles and earn points',
    pointsPerPlay: 50,
    color: 'from-blue-400 to-cyan-500'
  },
  {
    id: 2,
    name: 'Match-3 Puzzle',
    icon: '💎',
    description: 'Match three gems to score',
    pointsPerPlay: 75,
    color: 'from-purple-400 to-pink-500'
  },
  {
    id: 3,
    name: 'Memory Cards',
    icon: '🃏',
    description: 'Find matching pairs',
    pointsPerPlay: 60,
    color: 'from-green-400 to-emerald-500'
  },
  {
    id: 4,
    name: 'Quick Tap',
    icon: '⚡',
    description: 'Test your reaction speed',
    pointsPerPlay: 40,
    color: 'from-orange-400 to-red-500'
  },
  {
    id: 5,
    name: 'Coding Quiz',
    icon: '💻',
    description: 'Answer programming questions',
    pointsPerPlay: 100,
    color: 'from-indigo-400 to-blue-500'
  }
]

export default function GameZone() {
  const { user, updateUser } = useAuthStore()
  const [gamePoints, setGamePoints] = useState(user?.gamePoints || 0)
  const [canSpin, setCanSpin] = useState(true)
  const [spinning, setSpinning] = useState(false)

  const handlePlayGame = (game) => {
    toast.success(`Starting ${game.name}! 🎮`)
    // Simulate game completion
    setTimeout(() => {
      const earnedPoints = Math.floor(Math.random() * game.pointsPerPlay) + 20
      setGamePoints(prev => prev + earnedPoints)
      toast.success(`You earned ${earnedPoints} game points! 🎉`)
    }, 2000)
  }

  const handleConvertPoints = () => {
    if (gamePoints < 100) {
      toast.error('You need at least 100 game points to convert!')
      return
    }

    const coinsToAdd = Math.floor(gamePoints / 100)
    const newCoins = (user?.coins || 0) + coinsToAdd
    const remainingPoints = gamePoints % 100

    updateUser({ 
      coins: newCoins,
      gamePoints: remainingPoints
    })
    setGamePoints(remainingPoints)
    
    toast.success(`Converted to ${coinsToAdd} coins! 💰`)
  }

  const handleSpinWheel = () => {
    if (!canSpin) {
      toast.error('You can only spin once per day!')
      return
    }

    setSpinning(true)
    
    setTimeout(() => {
      const rewards = [
        { type: 'coins', amount: 5, label: '5 Coins' },
        { type: 'coins', amount: 10, label: '10 Coins' },
        { type: 'coins', amount: 25, label: '25 Coins' },
        { type: 'xp', amount: 50, label: '50 XP' },
        { type: 'points', amount: 200, label: '200 Game Points' }
      ]
      
      const reward = rewards[Math.floor(Math.random() * rewards.length)]
      
      if (reward.type === 'coins') {
        updateUser({ coins: (user?.coins || 0) + reward.amount })
      } else if (reward.type === 'xp') {
        updateUser({ xp: (user?.xp || 0) + reward.amount })
      } else {
        setGamePoints(prev => prev + reward.amount)
      }
      
      toast.success(`🎉 You won ${reward.label}!`)
      setSpinning(false)
      setCanSpin(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Game Zone 🎮
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Play games, earn points, and convert them to coins!
        </p>
      </div>

      {/* Game Points Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="card bg-gradient-to-r from-purple-500 to-pink-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Your Game Points</p>
              <p className="text-3xl font-bold">{gamePoints}</p>
            </div>
            <Gamepad2 className="w-12 h-12 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="card bg-gradient-to-r from-amber-500 to-orange-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Coins</p>
              <p className="text-3xl font-bold">{user?.coins || 0}</p>
            </div>
            <Coins className="w-12 h-12 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="card bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
        >
          <button
            onClick={handleConvertPoints}
            disabled={gamePoints < 100}
            className={`w-full h-full text-left ${gamePoints < 100 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <p className="text-sm opacity-90 mb-1">Convert Points</p>
            <p className="text-xl font-bold">100 Points = 1 Coin</p>
            <p className="text-xs mt-2">Click to convert!</p>
          </button>
        </motion.div>
      </div>

      {/* Daily Spin Wheel */}
      <div className="card bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">🎰 Daily Spin Wheel</h3>
            <p className="mb-4">Spin once per day for random rewards!</p>
            <button
              onClick={handleSpinWheel}
              disabled={!canSpin || spinning}
              className={`bg-white text-orange-600 px-6 py-3 rounded-lg font-bold ${
                !canSpin || spinning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
            >
              {spinning ? 'Spinning...' : canSpin ? 'Spin Now! 🎯' : 'Come Back Tomorrow'}
            </button>
          </div>
          <div className="text-9xl animate-spin-slow">🎡</div>
        </div>
      </div>

      {/* Mini Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${game.color} p-6 -m-6 mb-4 text-white`}>
              <div className="text-6xl mb-2 text-center">{game.icon}</div>
              <h3 className="text-xl font-bold text-center">{game.name}</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
              {game.description}
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Earn up to
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {game.pointsPerPlay} points
              </span>
            </div>
            
            <button
              onClick={() => handlePlayGame(game)}
              className="w-full btn-primary"
            >
              Play Now
            </button>
          </motion.div>
        ))}
      </div>

      {/* Conversion Info */}
      <div className="card bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <h3 className="text-xl font-bold mb-3">💡 How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold mb-1">1. Play Games</p>
            <p className="opacity-90">Earn game points by playing mini-games</p>
          </div>
          <div>
            <p className="font-semibold mb-1">2. Convert Points</p>
            <p className="opacity-90">100 game points = 1 shopping coin</p>
          </div>
          <div>
            <p className="font-semibold mb-1">3. Spend Coins</p>
            <p className="opacity-90">Use coins in the store for rewards!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
