import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPaperPlane, FaRobot, FaUser, FaTimes, FaSpinner } from 'react-icons/fa'
import { sendChatMessage } from '../services/unifiedAIAPI'
import toast from 'react-hot-toast'

const AIEnhancedChatbot = ({ userContext = {} }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hi! I'm your AI Learning Coach! 🌟 I'm here to help you learn programming. Ask me anything about web development, React, JavaScript, or get personalized learning advice!`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await sendChatMessage(input, userContext)

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.response,
        fallback: response.fallback,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])

      if (response.fallback) {
        console.log('Using fallback response')
      }

    } catch (error) {
      console.error('Chat error:', error)
      
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I'm having trouble connecting right now. Try asking about React, JavaScript, CSS, or learning tips! 🤖",
        error: true,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickPrompts = [
    "What should I learn next?",
    "Explain React Hooks",
    "Help me with async/await",
    "CSS Flexbox tips"
  ]

  const handleQuickPrompt = (prompt) => {
    setInput(prompt)
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110"
        >
          <FaRobot size={24} />
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 w-96 h-[600px] bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-700"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <FaRobot className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold">AI Coach</h3>
            <p className="text-white/80 text-xs">Powered by Gemini 2.5</p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-white hover:bg-white/20 p-2 rounded-lg transition"
        >
          <FaTimes />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-green-500 to-teal-500' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500'
                }`}>
                  {message.sender === 'user' ? (
                    <FaUser className="text-white" size={14} />
                  ) : (
                    <FaRobot className="text-white" size={14} />
                  )}
                </div>

                {/* Message bubble */}
                <div className={`rounded-2xl p-3 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white'
                    : message.error
                    ? 'bg-red-600/20 text-red-300 border border-red-500/30'
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  {message.fallback && (
                    <span className="text-xs opacity-60 mt-1 block">⚡ Quick response</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <FaRobot className="text-white" size={14} />
              </div>
              <div className="bg-gray-800 rounded-2xl p-3 border border-gray-700">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-gray-400 text-xs mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(prompt)}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 transition disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <FaSpinner className="animate-spin" size={20} />
            ) : (
              <FaPaperPlane size={20} />
            )}
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-2 text-center">
          Level {userContext.level || 1} • {userContext.xp || 0} XP • {userContext.streak || 0} day streak
        </p>
      </div>
    </motion.div>
  )
}

export default AIEnhancedChatbot
