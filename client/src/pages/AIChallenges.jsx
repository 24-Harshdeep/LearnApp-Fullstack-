import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Target, Award, Brain, Clock, CheckCircle, XCircle, Lightbulb, Play, RotateCcw, ChevronRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useAuthStore } from '../store/store'
import CodeEditor from '../components/CodeEditor'
import { generateQuiz, validateQuizAnswer, getAdaptiveDifficulty, generateDebugChallenge, analyzeCode } from '../services/unifiedAIAPI'

const API_URL = 'http://localhost:5000/api/social'

const AIChallenges = () => {
  const { user } = useAuthStore()
  const [activeMode, setActiveMode] = useState('quiz')
  const [loading, setLoading] = useState(false)
  
  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizSetup, setQuizSetup] = useState(null) // Store user preferences
  const [showQuizSetup, setShowQuizSetup] = useState(true)
  const [totalMarks, setTotalMarks] = useState(0)
  
  // Debug state
  const [debugChallenge, setDebugChallenge] = useState(null)
  const [userCode, setUserCode] = useState('')
  const [showHints, setShowHints] = useState(false)
  const [hintsRevealed, setHintsRevealed] = useState(0)
  const [debugSolved, setDebugSolved] = useState(false)
  const [showDebugSetup, setShowDebugSetup] = useState(true)
  const [debugSetup, setDebugSetup] = useState({ topic: 'JavaScript', difficulty: 'easy' })
  const [debugStartTime, setDebugStartTime] = useState(null)
  const [debugEndTime, setDebugEndTime] = useState(null)
  
  // Adaptive state
  const [adaptiveChallenge, setAdaptiveChallenge] = useState(null)
  const [adaptiveCode, setAdaptiveCode] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Load AI Quiz - Now using Unified Gemini API
  const loadQuiz = async (setup) => {
    setLoading(true)
    setQuizQuestions([]) // Reset questions
    setCurrentQuestion(0)
    setScore(0)
    setQuizCompleted(false)
    setSelectedAnswer(null)
    setShowExplanation(false)
    
    try {
      console.log('🎯 Requesting AI quiz with:', setup)
      
      // Call Unified Gemini API
      const result = await generateQuiz(setup.topic, setup.difficulty, setup.questionCount)
      
      console.log('✅ Gemini AI Response:', result)
      
      // Validate response has questions
      if (!result.success || !result.questions || result.questions.length === 0) {
        throw new Error('No questions received from Gemini AI')
      }
      
      // Map questions to match our format
      const validatedQuestions = result.questions.map((q, index) => ({
        id: index + 1,
        question: q.question,
        options: q.options, // Already an array from Gemini
        correctAnswer: q.options[q.correctAnswer], // Convert index to actual answer string
        correctAnswerIndex: q.correctAnswer, // Store index for validation
        explanation: q.explanation,
        difficulty: q.difficulty,
        topic: q.topic
      }))
      
      console.log('✅ AI-generated questions:', validatedQuestions)
      
      setQuizQuestions(validatedQuestions)
      setShowQuizSetup(false)
      setTotalMarks(setup.questionCount * setup.marksPerQuestion)
      toast.success(`🤖 AI generated ${validatedQuestions.length} questions about ${setup.topic}!`)
    } catch (error) {
      console.error('❌ Quiz load error:', error)
      toast.error('Failed to generate AI quiz. Please try again!')
      // Reset to setup form on error
      setShowQuizSetup(true)
    } finally {
      setLoading(false)
    }
  }

  // Load Debug Challenge - Now using Unified Gemini API
  const loadDebugChallenge = async (setup) => {
    setLoading(true)
    try {
      console.log('🐛 Requesting debug challenge with:', setup)
      
      // Call Unified Gemini API
      const result = await generateDebugChallenge(setup.topic, setup.difficulty)
      
      console.log('✅ Gemini Debug Challenge:', result)
      
      if (!result.success || !result.challenge) {
        throw new Error('No challenge received from Gemini AI')
      }
      
      setDebugChallenge(result.challenge)
      setUserCode(result.challenge.buggyCode)
      setShowHints(false)
      setHintsRevealed(0)
      setDebugSolved(false)
      setShowDebugSetup(false)
      setDebugStartTime(Date.now())
      toast.success('🤖 AI Debug Challenge loaded! 🐛')
    } catch (error) {
      console.error('❌ Debug load error:', error)
      toast.error('Failed to generate debug challenge')
      setShowDebugSetup(true)
    } finally {
      setLoading(false)
    }
  }

  // Load Adaptive Challenge
  const loadAdaptiveChallenge = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/ai/adaptive`, {
        userId: user?._id,
        userLevel: user?.level || 1,
        weakTopics: ['React Hooks', 'State Management']
      })
      
      setAdaptiveChallenge(response.data.challenge)
      setAdaptiveCode(response.data.challenge.starterCode || '// Start coding here...')
      setSubmitted(false)
      toast.success('Adaptive challenge generated! ⚡')
    } catch (error) {
      console.error('Adaptive load error:', error)
      toast.error('Failed to load adaptive challenge')
    } finally {
      setLoading(false)
    }
  }

  // Handle Quiz Answer - Now with AI validation
  const handleAnswerSelect = async (answer) => {
    if (showExplanation) return
    
    setSelectedAnswer(answer)
    const currentQ = quizQuestions[currentQuestion]
    const isCorrect = answer === currentQ.correctAnswer
    
    if (isCorrect) {
      setScore(prev => prev + 1)
    }
    
    console.log('📝 Selected answer:', answer)
    console.log('✅ Correct answer:', currentQ.correctAnswer)
    console.log('📊 Is correct:', isCorrect)
    
    // Get AI-powered feedback
    try {
      const result = await validateQuizAnswer(
        currentQ.question,
        currentQ.options.indexOf(answer), // Convert answer to index
        currentQ.correctAnswerIndex,
        currentQ.options
      )
      
      console.log('🤖 AI Validation result:', result)
      
      if (result.success && result.feedback) {
        // Use AI-generated feedback
        currentQ.aiFeedback = result.feedback
        console.log('💬 AI Feedback:', result.feedback)
      }
    } catch (error) {
      console.error('AI validation error:', error)
      // Will use default explanation
    }
    
    setShowExplanation(true)
    console.log('📖 Show explanation set to:', true)
    console.log('📚 Current question data:', currentQ)
    
    if (isCorrect) {
      toast.success('Correct! 🎉')
    } else {
      toast.error('Wrong answer 😅')
    }
  }

  // Next Question
  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setQuizCompleted(true)
      toast.success(`Quiz completed! Score: ${score + 1}/${quizQuestions.length}`)
    }
  }

  // Check Debug Solution with AI Analysis
  const checkDebugSolution = async () => {
    setLoading(true)
    
    try {
      // Use AI to analyze the user's code
      const result = await analyzeCode(
        userCode,
        'JavaScript',
        debugChallenge.description
      )
      
      if (result.success) {
        // Check if AI analysis indicates the code is correct
        const analysis = result.analysis.toLowerCase()
        const isCorrect = 
          analysis.includes('correct') ||
          analysis.includes('fixed') ||
          analysis.includes('looks good') ||
          analysis.includes('no bugs') ||
          analysis.includes('well done') ||
          (!analysis.includes('bug') && !analysis.includes('error') && !analysis.includes('issue'))
        
        if (isCorrect) {
          setDebugSolved(true)
          setDebugEndTime(Date.now())
          const timeTaken = Math.floor((Date.now() - debugStartTime) / 1000)
          toast.success(`Bug fixed in ${timeTaken}s! Great debugging! 🎉`)
        } else {
          toast.error('Not quite right. AI found issues: ' + result.analysis.substring(0, 100) + '...')
        }
      } else {
        // Fallback: Compare with solution (more lenient)
        const solutionClean = debugChallenge.solution
          .replace(/\s+/g, '')
          .replace(/['"]/g, '')
          .toLowerCase()
        const userClean = userCode
          .replace(/\s+/g, '')
          .replace(/['"]/g, '')
          .toLowerCase()
        
        // Check if key parts are present (more lenient than exact match)
        const similarity = solutionClean.includes(userClean) || 
                          userClean.includes(solutionClean) ||
                          solutionClean === userClean
        
        if (similarity) {
          setDebugSolved(true)
          setDebugEndTime(Date.now())
          const timeTaken = Math.floor((Date.now() - debugStartTime) / 1000)
          toast.success(`Bug fixed in ${timeTaken}s! Great debugging! 🎉`)
        } else {
          toast.error('Not quite right. Try again or reveal a hint! 💡')
        }
      }
    } catch (error) {
      console.error('Debug check error:', error)
      // Fallback to simple comparison if AI fails
      const solutionClean = debugChallenge.solution.replace(/\s+/g, '').toLowerCase()
      const userClean = userCode.replace(/\s+/g, '').toLowerCase()
      
      if (solutionClean === userClean || userClean.includes(solutionClean)) {
        setDebugSolved(true)
        setDebugEndTime(Date.now())
        const timeTaken = Math.floor((Date.now() - debugStartTime) / 1000)
        toast.success(`Bug fixed in ${timeTaken}s! Great debugging! 🎉`)
      } else {
        toast.error('Not quite right. Try again or reveal a hint! 💡')
      }
    } finally {
      setLoading(false)
    }
  }

  // Submit Adaptive Challenge
  const submitAdaptiveChallenge = () => {
    setSubmitted(true)
    const xpEarned = adaptiveChallenge.xpReward || 50
    toast.success(`Challenge submitted! Earned ${xpEarned} XP! 🏆`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
          <Zap className="w-10 h-10 text-purple-600" />
          AI Challenges
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Powered by Gemini 2.5 Flash • Adaptive difficulty • Real-time feedback
        </p>
      </motion.div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.button
          onClick={() => setActiveMode('quiz')}
          className={`p-6 rounded-2xl font-semibold transition-all ${
            activeMode === 'quiz'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          whileHover={{ scale: activeMode === 'quiz' ? 1.05 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Brain className="w-8 h-8 mx-auto mb-2" />
          <div className="text-lg font-bold">AI Quiz Master</div>
          <div className="text-sm opacity-90 mt-1">Dynamic Q&A</div>
        </motion.button>

        <motion.button
          onClick={() => setActiveMode('debug')}
          className={`p-6 rounded-2xl font-semibold transition-all ${
            activeMode === 'debug'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          whileHover={{ scale: activeMode === 'debug' ? 1.05 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Target className="w-8 h-8 mx-auto mb-2" />
          <div className="text-lg font-bold">Debug Duel</div>
          <div className="text-sm opacity-90 mt-1">Fix the bugs</div>
        </motion.button>

        <motion.button
          onClick={() => setActiveMode('adaptive')}
          className={`p-6 rounded-2xl font-semibold transition-all ${
            activeMode === 'adaptive'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          whileHover={{ scale: activeMode === 'adaptive' ? 1.05 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Award className="w-8 h-8 mx-auto mb-2" />
          <div className="text-lg font-bold">Adaptive Mode</div>
          <div className="text-sm opacity-90 mt-1">Perfect difficulty</div>
        </motion.button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* AI Quiz Master */}
        {activeMode === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
          >
            {showQuizSetup ? (
              // Quiz Setup Form
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <Brain className="w-20 h-20 text-purple-500 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                    Setup Your AI Quiz
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Customize your quiz experience
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.target)
                    const setup = {
                      topic: formData.get('topic'),
                      difficulty: formData.get('difficulty'),
                      questionCount: parseInt(formData.get('questionCount')),
                      marksPerQuestion: parseInt(formData.get('marksPerQuestion'))
                    }
                    setQuizSetup(setup)
                    loadQuiz(setup)
                  }}
                  className="space-y-6"
                >
                  {/* Topic Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Select Topic
                    </label>
                    <select
                      name="topic"
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="JavaScript Fundamentals">JavaScript Fundamentals</option>
                      <option value="React Basics">React Basics</option>
                      <option value="HTML & CSS">HTML & CSS</option>
                      <option value="ES6 Features">ES6 Features</option>
                      <option value="Async JavaScript">Async JavaScript</option>
                      <option value="React Hooks">React Hooks</option>
                      <option value="API Integration">API Integration</option>
                      <option value="Git & GitHub">Git & GitHub</option>
                      <option value="TypeScript">TypeScript</option>
                      <option value="Node.js">Node.js</option>
                    </select>
                  </div>

                  {/* Difficulty Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {['easy', 'medium', 'hard', 'expert'].map((diff) => (
                        <label
                          key={diff}
                          className="relative flex items-center justify-center cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="difficulty"
                            value={diff}
                            defaultChecked={diff === 'medium'}
                            className="peer sr-only"
                          />
                          <div className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 peer-checked:border-purple-500 peer-checked:bg-purple-50 dark:peer-checked:bg-purple-900/30 transition-all text-center font-semibold capitalize">
                            {diff}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Number of Questions */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Number of Questions
                    </label>
                    <input
                      type="number"
                      name="questionCount"
                      min="1"
                      max="20"
                      defaultValue="5"
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Marks Per Question */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Marks Per Question
                    </label>
                    <input
                      type="number"
                      name="marksPerQuestion"
                      min="1"
                      max="10"
                      defaultValue="2"
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating with AI...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Generate AI Quiz 🤖
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            ) : quizQuestions.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="w-20 h-20 text-purple-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  AI Quiz Master
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Get personalized quiz questions powered by Gemini 2.5 Flash AI! All questions generated dynamically based on your selection.
                </p>
                <motion.button
                  onClick={() => setShowQuizSetup(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5" />
                  Setup Quiz
                </motion.button>
              </div>
            ) : !quizCompleted ? (
              <div>
                {/* Progress */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Question {currentQuestion + 1} of {quizQuestions.length}
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    Score: {score}/{quizQuestions.length}
                  </div>
                </div>

                {/* Question */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    {quizQuestions[currentQuestion]?.question}
                  </h3>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {quizQuestions[currentQuestion]?.options.map((option, idx) => {
                    const isSelected = selectedAnswer === option
                    const isCorrect = option === quizQuestions[currentQuestion].correctAnswer
                    const showCorrectness = showExplanation
                    
                    return (
                      <motion.button
                        key={idx}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={showExplanation}
                        className={`w-full p-4 rounded-xl text-left font-semibold transition-all ${
                          showCorrectness && isCorrect
                            ? 'bg-green-500 text-white'
                            : showCorrectness && isSelected && !isCorrect
                            ? 'bg-red-500 text-white'
                            : isSelected
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        whileHover={{ scale: showExplanation ? 1 : 1.02 }}
                        whileTap={{ scale: showExplanation ? 1 : 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showCorrectness && isCorrect && <CheckCircle className="w-5 h-5" />}
                          {showCorrectness && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6"
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="w-full">
                        <div className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          AI Explanation
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                          {quizQuestions[currentQuestion]?.aiFeedback || 
                           quizQuestions[currentQuestion]?.explanation || 
                           'Explanation not available. The AI is analyzing your answer...'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Next Button */}
                {showExplanation && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleNextQuestion}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {currentQuestion < quizQuestions.length - 1 ? (
                      <>
                        Next Question
                        <ChevronRight className="w-5 h-5" />
                      </>
                    ) : (
                      'Finish Quiz'
                    )}
                  </motion.button>
                )}
              </div>
            ) : (
              // Quiz Results
              <div className="text-center py-12">
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  score / quizQuestions.length >= 0.8 ? 'bg-green-100' : 
                  score / quizQuestions.length >= 0.5 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Award className={`w-12 h-12 ${
                    score / quizQuestions.length >= 0.8 ? 'text-green-600' : 
                    score / quizQuestions.length >= 0.5 ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  Quiz Complete!
                </h2>
                
                {/* Score Display */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 mb-6 max-w-md mx-auto">
                  <div className="text-6xl font-bold text-purple-600 mb-2">
                    {score}/{quizQuestions.length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 mb-4">
                    Questions Correct
                  </div>
                  
                  <div className="flex items-center justify-center gap-8 mb-4">
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        {score * quizSetup.marksPerQuestion}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Marks Obtained
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-400">/</div>
                    <div>
                      <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                        {totalMarks}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Marks
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {Math.round((score / quizQuestions.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Percentage
                  </div>
                </div>
                
                {/* Performance Message */}
                <div className="mb-8">
                  {score / quizQuestions.length >= 0.8 ? (
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 max-w-md mx-auto">
                      <p className="text-green-800 dark:text-green-200 font-semibold">
                        🎉 Excellent work! You're mastering {quizSetup.topic}!
                      </p>
                    </div>
                  ) : score / quizQuestions.length >= 0.5 ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 max-w-md mx-auto">
                      <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                        👍 Good effort! Keep practicing {quizSetup.topic}!
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 max-w-md mx-auto">
                      <p className="text-blue-800 dark:text-blue-200 font-semibold">
                        💪 Don't give up! Review {quizSetup.topic} and try again!
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={() => {
                      setShowQuizSetup(true)
                      setQuizQuestions([])
                      setScore(0)
                      setQuizCompleted(false)
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-5 h-5" />
                    New Quiz
                  </motion.button>
                  
                  <motion.button
                    onClick={() => loadQuiz(quizSetup)}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-5 h-5" />
                    Retry Same Quiz
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Debug Duel */}
        {activeMode === 'debug' && (
          <motion.div
            key="debug"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
          >
            {showDebugSetup ? (
              // Debug Setup Form
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <Target className="w-20 h-20 text-orange-500 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                    Configure Debug Challenge
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose your topic and difficulty level
                  </p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  const setup = {
                    topic: formData.get('topic'),
                    difficulty: formData.get('difficulty')
                  }
                  setDebugSetup(setup)
                  loadDebugChallenge(setup)
                }} className="space-y-6">
                  {/* Topic Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Select Topic
                    </label>
                    <select
                      name="topic"
                      defaultValue="JavaScript"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-orange-500 dark:focus:border-orange-500 focus:outline-none transition-colors"
                    >
                      <option value="JavaScript">JavaScript</option>
                      <option value="React">React</option>
                      <option value="HTML">HTML</option>
                      <option value="CSS">CSS</option>
                      <option value="Python">Python</option>
                      <option value="Node.js">Node.js</option>
                      <option value="TypeScript">TypeScript</option>
                      <option value="Data Structures">Data Structures</option>
                      <option value="Algorithms">Algorithms</option>
                    </select>
                  </div>

                  {/* Difficulty Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {['easy', 'medium', 'hard'].map((level) => (
                        <label
                          key={level}
                          className="relative flex items-center justify-center cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="difficulty"
                            value={level}
                            defaultChecked={level === 'easy'}
                            className="peer sr-only"
                          />
                          <div className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 peer-checked:border-orange-500 peer-checked:bg-orange-50 dark:peer-checked:bg-orange-900/30 transition-all text-center font-semibold capitalize text-gray-700 dark:text-gray-300 peer-checked:text-orange-700 dark:peer-checked:text-orange-300">
                            {level}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating Challenge...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Start Debug Challenge
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            ) : !debugChallenge ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading challenge...</p>
              </div>
            ) : !debugSolved ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {debugChallenge.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {debugChallenge.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-3 py-1 rounded-full font-semibold ${
                      debugChallenge.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      debugChallenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {debugChallenge.difficulty}
                    </span>
                  </div>
                </div>

                <CodeEditor
                  value={userCode}
                  onChange={setUserCode}
                  language="javascript"
                  height="300px"
                />

                <div className="mt-6 space-y-4">
                  {/* Hints */}
                  {showHints && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="font-semibold text-yellow-900 dark:text-yellow-100">
                          Hints
                        </div>
                      </div>
                      <div className="space-y-2">
                        {debugChallenge.hints.slice(0, hintsRevealed).map((hint, idx) => (
                          <div key={idx} className="text-sm text-yellow-800 dark:text-yellow-200">
                            {idx + 1}. {hint}
                          </div>
                        ))}
                      </div>
                      {hintsRevealed < debugChallenge.hints.length && (
                        <button
                          onClick={() => setHintsRevealed(prev => prev + 1)}
                          className="mt-3 text-sm text-yellow-700 dark:text-yellow-300 hover:underline"
                        >
                          Reveal next hint
                        </button>
                      )}
                    </motion.div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={checkDebugSolution}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Check Solution
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      onClick={() => setShowHints(!showHints)}
                      disabled={loading}
                      className="px-6 bg-yellow-500 text-white py-3 rounded-xl font-bold hover:bg-yellow-600 transition-all flex items-center gap-2 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Lightbulb className="w-5 h-5" />
                      {showHints ? 'Hide' : 'Show'} Hints
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              // Debug Solved - Results Screen
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  Bug Fixed! 🎉
                </h2>
                
                {/* Performance Stats */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-8 mb-6 max-w-md mx-auto">
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                      <div className="text-3xl font-bold text-orange-600">
                        {Math.floor((debugEndTime - debugStartTime) / 1000)}s
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Time Taken
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-yellow-600">
                        {hintsRevealed}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Hints Used
                      </div>
                    </div>
                  </div>
                  
                  {/* Performance Rating */}
                  <div className="pt-4 border-t border-orange-200 dark:border-orange-800">
                    <div className="text-xl font-bold text-orange-600 mb-2">
                      {hintsRevealed === 0 && debugEndTime - debugStartTime < 60000 ? '⭐⭐⭐ Perfect!' :
                       hintsRevealed <= 1 && debugEndTime - debugStartTime < 120000 ? '⭐⭐ Great!' :
                       '⭐ Good Job!'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {hintsRevealed === 0 ? 'Solved without hints!' :
                       hintsRevealed === 1 ? 'Used 1 hint' :
                       `Used ${hintsRevealed} hints`}
                    </div>
                  </div>
                </div>
                
                {/* Topic and Difficulty */}
                <div className="flex justify-center gap-3 mb-6">
                  <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold">
                    {debugSetup.topic}
                  </span>
                  <span className={`px-4 py-2 rounded-lg font-semibold ${
                    debugSetup.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    debugSetup.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {debugSetup.difficulty}
                  </span>
                </div>
                
                {/* Explanation */}
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8 max-w-2xl mx-auto text-left">
                  <div className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Explanation
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {debugChallenge.explanation}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={() => {
                      setShowDebugSetup(true)
                      setDebugChallenge(null)
                      setDebugSolved(false)
                      setHintsRevealed(0)
                      setShowHints(false)
                    }}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-5 h-5" />
                    New Challenge
                  </motion.button>
                  
                  <motion.button
                    onClick={() => loadDebugChallenge(debugSetup)}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-5 h-5" />
                    Retry Same Level
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Adaptive Challenge */}
        {activeMode === 'adaptive' && (
          <motion.div
            key="adaptive"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
          >
            {!adaptiveChallenge ? (
              <div className="text-center py-12">
                <Award className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  Adaptive Difficulty
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  AI analyzes your performance and generates challenges perfectly matched to your skill level!
                </p>
                <motion.button
                  onClick={loadAdaptiveChallenge}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Generate Challenge
                    </>
                  )}
                </motion.button>
              </div>
            ) : !submitted ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {adaptiveChallenge.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {adaptiveChallenge.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm mb-4">
                    <span className={`px-3 py-1 rounded-full font-semibold ${
                      adaptiveChallenge.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      adaptiveChallenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {adaptiveChallenge.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      {adaptiveChallenge.estimatedTime}
                    </span>
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                      <Award className="w-4 h-4" />
                      {adaptiveChallenge.xpReward} XP
                    </span>
                  </div>
                  
                  {adaptiveChallenge.requirements && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                      <div className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Requirements
                      </div>
                      <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                        {adaptiveChallenge.requirements.map((req, idx) => (
                          <li key={idx}>• {req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <CodeEditor
                  value={adaptiveCode}
                  onChange={setAdaptiveCode}
                  language="javascript"
                  height="400px"
                  showRunButton={true}
                />

                <div className="mt-6">
                  <motion.button
                    onClick={submitAdaptiveChallenge}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Submit Solution
                  </motion.button>
                </div>
              </div>
            ) : (
              // Challenge Submitted
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  Challenge Complete! 🏆
                </h2>
                <div className="text-5xl font-bold text-green-600 mb-8">
                  +{adaptiveChallenge.xpReward} XP
                </div>
                <motion.button
                  onClick={loadAdaptiveChallenge}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw className="w-5 h-5" />
                  Next Challenge
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AIChallenges
