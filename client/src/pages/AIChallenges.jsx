import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Brain, Award, Play, RotateCcw, CheckCircle, Lightbulb,
  XCircle, Clock
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/store'
import { generateQuiz, validateQuizAnswer } from '../services/unifiedAIAPI'

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
  const [quizSetup, setQuizSetup] = useState({
    topic: 'JavaScript Basics',
    difficulty: 'medium',
    questionCount: 5,
    marksPerQuestion: 2
  })
  const [showQuizSetup, setShowQuizSetup] = useState(true)
  const [totalMarks, setTotalMarks] = useState(0)

  // Debug + Adaptive states (placeholders for future expansion)
  const [adaptiveChallenge, setAdaptiveChallenge] = useState(null)
  const [adaptiveCode, setAdaptiveCode] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const loadQuiz = async (setup) => {
    setLoading(true)
    setQuizQuestions([])
    setCurrentQuestion(0)
    setScore(0)
    setQuizCompleted(false)
    setSelectedAnswer(null)
    setShowExplanation(false)

    try {
      const res = await generateQuiz(setup.topic, setup.difficulty, setup.questionCount)
      if (!res || !res.questions) throw new Error('Invalid AI response')
      const validated = res.questions.map((q, idx) => ({
        id: idx + 1,
        question: q.question,
        options: q.options || [],
        correctAnswerIndex: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        correctAnswer: Array.isArray(q.options)
          ? q.options[q.correctAnswer]
          : q.correctAnswer,
        explanation: q.explanation || ''
      }))
      setQuizQuestions(validated)
      setShowQuizSetup(false)
      setTotalMarks(setup.questionCount * setup.marksPerQuestion)
      setQuizSetup(setup)
      toast.success(`AI generated ${validated.length} questions on ${setup.topic}`)
    } catch (err) {
      console.error('Quiz load error', err)
      toast.error('Failed to generate quiz from AI')
      setShowQuizSetup(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = async (answer) => {
    if (showExplanation) return
    setSelectedAnswer(answer)
    const currentQ = quizQuestions[currentQuestion]
    const isCorrect = answer === currentQ.correctAnswer
    if (isCorrect) setScore(s => s + 1)

    try {
      const res = await validateQuizAnswer(
        currentQ.question,
        currentQ.options.indexOf(answer),
        currentQ.correctAnswerIndex,
        currentQ.options
      )
      if (res?.feedback) currentQ.aiFeedback = res.feedback
    } catch (e) {
      console.warn('AI validation failed', e)
    }

    setShowExplanation(true)
    if (isCorrect) toast.success('Correct!')
    else toast.error('Incorrect')
  }

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(c => c + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setQuizCompleted(true)
      toast.success('Quiz complete')
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800 dark:text-white">
          <Zap className="w-8 h-8 text-purple-600" /> AI Challenges
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Powered by Gemini 2.5 Flash
        </p>
      </motion.div>

      {/* Mode Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setActiveMode('quiz')}
          className={`p-4 rounded-xl shadow flex flex-col items-center gap-2 font-semibold transition-all ${
            activeMode === 'quiz'
              ? 'bg-purple-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
          }`}
        >
          <Brain className="w-6 h-6" />
          AI Quiz Master
        </button>

        <button
          onClick={() => setActiveMode('adaptive')}
          className={`p-4 rounded-xl shadow flex flex-col items-center gap-2 font-semibold transition-all ${
            activeMode === 'adaptive'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
          }`}
        >
          <Award className="w-6 h-6" />
          Adaptive Mode
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeMode === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow"
          >
            {showQuizSetup ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.target)
                  const setup = {
                    topic: fd.get('topic') || 'JavaScript Basics',
                    difficulty: fd.get('difficulty') || 'medium',
                    questionCount: parseInt(fd.get('questionCount') || '5', 10),
                    marksPerQuestion: parseInt(fd.get('marksPerQuestion') || '2', 10)
                  }
                  loadQuiz(setup)
                }}
                className="space-y-4 max-w-xl"
              >
                <div>
                  <label className="block text-sm font-semibold">Topic</label>
                  <input
                    name="topic"
                    defaultValue={quizSetup.topic}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Difficulty</label>
                  <select
                    name="difficulty"
                    defaultValue={quizSetup.difficulty}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="easy">easy</option>
                    <option value="medium">medium</option>
                    <option value="hard">hard</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-semibold">Questions</label>
                    <input
                      type="number"
                      name="questionCount"
                      defaultValue={quizSetup.questionCount}
                      min="1"
                      max="20"
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">Marks / Q</label>
                    <input
                      type="number"
                      name="marksPerQuestion"
                      defaultValue={quizSetup.marksPerQuestion}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                  {loading ? 'Generating...' : 'Generate AI Quiz'}
                </button>
              </form>
            ) : quizQuestions.length === 0 ? (
              <div className="text-center py-8">No questions available</div>
            ) : !quizCompleted ? (
              <div>
                <div className="mb-4 font-semibold">
                  Question {currentQuestion + 1} / {quizQuestions.length}
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded mb-4">
                  {quizQuestions[currentQuestion].question}
                </div>
                <div className="space-y-2 mb-4">
                  {quizQuestions[currentQuestion].options.map((opt, i) => {
                    const isSelected = selectedAnswer === opt
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswerSelect(opt)}
                        disabled={showExplanation}
                        className={`w-full text-left p-3 rounded transition-all ${
                          isSelected
                            ? 'bg-purple-500 text-white'
                            : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
                {showExplanation && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded">
                    <div className="font-semibold mb-1">AI Explanation</div>
                    <div className="text-sm">
                      {quizQuestions[currentQuestion].aiFeedback ||
                        quizQuestions[currentQuestion].explanation}
                    </div>
                  </div>
                )}
                {showExplanation && (
                  <button
                    onClick={handleNextQuestion}
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                  >
                    {currentQuestion < quizQuestions.length - 1
                      ? 'Next Question'
                      : 'Finish Quiz'}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-2xl font-bold mb-2">Quiz Complete</div>
                <div className="mb-4">
                  Score: {score} / {quizQuestions.length}
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setShowQuizSetup(true)
                      setQuizQuestions([])
                      setScore(0)
                      setQuizCompleted(false)
                    }}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    New Quiz
                  </button>
                  <button
                    onClick={() => loadQuiz(quizSetup)}
                    className="px-4 py-2 bg-purple-600 text-white rounded"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Adaptive Mode */}
        {activeMode === 'adaptive' && (
          <motion.div
            key="adaptive"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl text-center"
          >
            <Award className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Adaptive Difficulty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              AI analyzes your performance and generates challenges perfectly matched to your skill level!
            </p>
            <motion.button
              disabled={loading}
              onClick={() => toast('Adaptive Mode Coming Soon')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 mx-auto"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AIChallenges
