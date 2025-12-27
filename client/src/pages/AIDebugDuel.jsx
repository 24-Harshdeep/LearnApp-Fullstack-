import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaBug } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const AIDebugDuel = () => {
  const [mode, setMode] = useState('challenge')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-300 text-white px-6 py-3 rounded-full mb-4 shadow-md">
          <FaBug size={24} />
          <h1 className="text-2xl font-bold">AI Debug Duel</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Powered by Gemini 2.5 • Code Analysis & Debugging
        </p>
      </motion.div>

      {/* Mode Selection */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setMode('challenge')}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            mode === 'challenge'
              ? 'bg-purple-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
          }`}
        >
          Challenge Mode
        </button>
        <button
          onClick={() => setMode('practice')}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            mode === 'practice'
              ? 'bg-pink-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
          }`}
        >
          Practice Mode
        </button>
      </div>

      {/* Removed Feature Fallback */}
      <div className="max-w-xl text-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          AI Debug Duel (Removed)
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          The Debug Duel feature has been deprecated and removed from the UI.
          For AI-powered quizzes and adaptive challenges, please use the{" "}
          <span className="font-semibold text-purple-600">AI Challenges</span> page instead.
        </p>
        <Link
          to="/ai-challenges"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
        >
          Go to AI Challenges
        </Link>
      </div>
    </div>
  )
}

export default AIDebugDuel
