import { motion } from 'framer-motion'
import { ShoppingBag, Sparkles, Palette, Volume2, Star, Lock } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/store'
import toast from 'react-hot-toast'

const storeItems = [
  {
    id: 1,
    name: 'Dark Theme',
    icon: '🌙',
    description: 'Unlock the sleek dark mode',
    cost: 50,
    type: 'theme',
    category: 'Themes'
  },
  {
    id: 2,
    name: 'Ocean Theme',
    icon: '🌊',
    description: 'Beautiful ocean-inspired colors',
    cost: 75,
    type: 'theme',
    category: 'Themes'
  },
  {
    id: 3,
    name: 'AI Voice Pack',
    icon: '🤖',
    description: 'Get AI coach voice guidance',
    cost: 100,
    type: 'feature',
    category: 'Features'
  },
  {
    id: 4,
    name: 'Custom Avatar',
    icon: '👤',
    description: 'Upload your own profile picture',
    cost: 30,
    type: 'avatar',
    category: 'Avatars'
  },
  {
    id: 5,
    name: 'Pro Dashboard',
    icon: '📊',
    description: 'Advanced analytics and insights',
    cost: 150,
    type: 'feature',
    category: 'Features'
  },
  {
    id: 6,
    name: 'Coding Mentor',
    icon: '👨‍🏫',
    description: '1 hour with a coding mentor',
    cost: 500,
    type: 'service',
    category: 'Services'
  },
  {
    id: 7,
    name: 'Double XP Boost',
    icon: '⚡',
    description: '24 hours of 2x XP earning',
    cost: 200,
    type: 'boost',
    category: 'Boosts'
  },
  {
    id: 8,
    name: 'Certificate',
    icon: '🎓',
    description: 'Custom completion certificate',
    cost: 300,
    type: 'certificate',
    category: 'Certificates'
  }
]

export default function Store() {
  const { user, updateUser } = useAuthStore()
  const [filter, setFilter] = useState('all')
  const [purchased, setPurchased] = useState(user?.unlockedRewards || [])

  const categories = ['all', ...new Set(storeItems.map(item => item.category))]

  const handlePurchase = (item) => {
    const userCoins = user?.coins || 0

    if (userCoins < item.cost) {
      toast.error(`Not enough coins! You need ${item.cost - userCoins} more coins.`)
      return
    }

    if (purchased.includes(item.id.toString())) {
      toast.error('You already own this item!')
      return
    }

    // Deduct coins and add to purchased
    updateUser({
      coins: userCoins - item.cost,
      unlockedRewards: [...purchased, item.id.toString()]
    })
    
    setPurchased([...purchased, item.id.toString()])
    toast.success(`🎉 ${item.name} purchased successfully!`)
  }

  const filteredItems = filter === 'all' 
    ? storeItems 
    : storeItems.filter(item => item.category === filter)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Rewards Store 🛍️
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Spend your hard-earned coins on awesome rewards!
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">Your Balance</p>
          <p className="text-3xl font-bold text-amber-600">{user?.coins || 0} Coins</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {category === 'all' ? 'All Items' : category}
          </button>
        ))}
      </div>

      {/* Store Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => {
          const isOwned = purchased.includes(item.id.toString())
          const canAfford = (user?.coins || 0) >= item.cost

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`card ${isOwned ? 'border-2 border-green-500' : ''}`}
            >
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{item.icon}</div>
                {isOwned && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    <Star className="w-4 h-4" />
                    <span>Owned</span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                {item.name}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-center">
                {item.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Price:
                </span>
                <span className="text-xl font-bold text-amber-600">
                  {item.cost} Coins
                </span>
              </div>

              <button
                onClick={() => handlePurchase(item)}
                disabled={isOwned || !canAfford}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                  isOwned
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : canAfford
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-red-100 text-red-600 cursor-not-allowed'
                }`}
              >
                {isOwned ? 'Already Owned' : canAfford ? 'Purchase' : 'Not Enough Coins'}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* How to Earn Coins */}
      <div className="card bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <h3 className="text-xl font-bold mb-3">💰 How to Earn More Coins</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <p className="font-semibold mb-1">Complete Tasks</p>
            <p className="text-sm opacity-90">Earn coins for completing learning tasks</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <p className="font-semibold mb-1">Play Games</p>
            <p className="text-sm opacity-90">Convert game points to coins (100:1 ratio)</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <p className="font-semibold mb-1">Daily Streaks</p>
            <p className="text-sm opacity-90">Maintain your streak for bonus coins</p>
          </div>
        </div>
      </div>
    </div>
  )
}
