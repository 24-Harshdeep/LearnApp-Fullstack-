import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBrain, FaCheckCircle, FaTimesCircle, FaTrophy, 
  FaSpinner, FaLightbulb, FaChartLine, FaRedo 
} from 'react-icons/fa'
import { generateQuiz, validateQuizAnswer, getAdaptiveDifficulty } from '../services/unifiedAIAPI'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'

const AIQuizMaster = () => {
  const [quizState, setQuizState] = useState('setup') // setup, loading, active, results
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [questionCount, setQuestionCount] = useState(5)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [score, setScore] = useState(0)
  const [isValidating, setIsValidating] = useState(false)

  const topics = [
    'JavaScript Fundamentals',
    'React Basics',
    'HTML & CSS',
    'ES6 Features',
    'Async JavaScript',
    'React Hooks',
    'API Integration',
    'Git & GitHub'
  ]

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'hard', label: 'Hard', color: 'orange' },
    { value: 'expert', label: 'Expert', color: 'red' }
  ]

  const handleStartQuiz = async () => {
    if (!topic) {
      toast.error('Please select a topic')
      return
    }

    setQuizState('loading')

    try {
      const result = await generateQuiz(topic, difficulty, questionCount)

      if (result.success && result.questions && result.questions.length > 0) {
        // Ensure questions have the proper structure with options as array
        const formattedQuestions = result.questions.map((q, index) => ({
          ...q,
          id: q.id || index + 1,
          options: Array.isArray(q.options) ? q.options : Object.values(q.options || {}),
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 
                        Array.isArray(q.options) ? q.options.indexOf(q.correctAnswer) : 0,
          explanation: q.explanation || 'Check the correct answer for details.'
        }))
        
        setQuestions(formattedQuestions)
        setQuizState('active')
        setCurrentQuestionIndex(0)
        setAnswers([])
        setScore(0)
        toast.success('Quiz generated! Good luck! 🎯')
      } else {
        throw new Error('No questions generated')
      }

    } catch (error) {
      console.error('Quiz generation error:', error)
      toast.error('Using fallback questions')
      
      // Use fallback questions based on topic and difficulty
      const fallbackQuestions = generateFallbackQuiz(topic, difficulty, questionCount)
      setQuestions(fallbackQuestions)
      setQuizState('active')
      setCurrentQuestionIndex(0)
      setAnswers([])
      setScore(0)
    }
  }

  const generateFallbackQuiz = (topic, difficulty, count) => {
    // Fallback quiz questions for JavaScript
    const jsQuestions = [
      {
        id: 1,
        question: "What does the 'typeof' operator return for an array?",
        options: ["object", "array", "undefined", "null"],
        correctAnswer: 0,
        explanation: "In JavaScript, arrays are actually objects, so typeof returns 'object'. Use Array.isArray() to check for arrays."
      },
      {
        id: 2,
        question: "Which method is used to add an element to the end of an array?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correctAnswer: 0,
        explanation: "The push() method adds one or more elements to the end of an array and returns the new length."
      },
      {
        id: 3,
        question: "What is the result of '5' + 3 in JavaScript?",
        options: ["53", "8", "Error", "undefined"],
        correctAnswer: 0,
        explanation: "JavaScript converts the number 3 to a string and concatenates, resulting in '53'. Use parseInt() or Number() for numeric addition."
      },
      {
        id: 4,
        question: "Which keyword is used to define a constant?",
        options: ["const", "let", "var", "constant"],
        correctAnswer: 0,
        explanation: "The 'const' keyword declares constants that cannot be reassigned. However, objects and arrays declared with const can still be mutated."
      },
      {
        id: 5,
        question: "What is a closure in JavaScript?",
        options: [
          "A function with access to its outer scope",
          "A way to close browser windows",
          "A method to end loops",
          "A type of object"
        ],
        correctAnswer: 0,
        explanation: "A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned."
      },
      {
        id: 6,
        question: "What does '===' check in JavaScript?",
        options: [
          "Value and type equality",
          "Only value equality",
          "Reference equality",
          "Assignment"
        ],
        correctAnswer: 0,
        explanation: "'===' is the strict equality operator that checks both value and type without performing type coercion, unlike '=='."
      },
      {
        id: 7,
        question: "Which Array method removes the last element?",
        options: ["pop()", "push()", "shift()", "splice()"],
        correctAnswer: 0,
        explanation: "The pop() method removes the last element from an array and returns that element. This method changes the length of the array."
      },
      {
        id: 8,
        question: "What is the purpose of the 'async' keyword?",
        options: [
          "Declares an asynchronous function",
          "Waits for a promise",
          "Creates a callback",
          "Defines a class"
        ],
        correctAnswer: 0,
        explanation: "The 'async' keyword before a function makes it return a Promise and allows the use of 'await' inside it."
      },
      {
        id: 9,
        question: "What does 'this' refer to in a regular function?",
        options: [
          "The calling context",
          "Always the global object",
          "The function itself",
          "Undefined"
        ],
        correctAnswer: 0,
        explanation: "In a regular function, 'this' refers to the object that called the function. In arrow functions, 'this' is lexically bound."
      },
      {
        id: 10,
        question: "Which method creates a new array with results of calling a function?",
        options: ["map()", "filter()", "reduce()", "forEach()"],
        correctAnswer: 0,
        explanation: "The map() method creates a new array with the results of calling a provided function on every element in the calling array."
      }
    ]

    // Return requested number of questions
    return jsQuestions.slice(0, Math.min(count, jsQuestions.length))
  }

  const handleAnswerSelect = (answerIndex) => {
    if (showFeedback) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer')
      return
    }

    setIsValidating(true)
    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer

    try {
      const result = await validateQuizAnswer(
        currentQuestion.question,
        selectedAnswer,
        currentQuestion.correctAnswer,
        currentQuestion.options
      )

      // Use AI feedback if available, otherwise use built-in explanation
      const explanationText = result.feedback || currentQuestion.explanation || 
        (isCorrect ? '✅ Correct! Well done!' : `❌ Incorrect. The correct answer is: ${currentQuestion.options[currentQuestion.correctAnswer]}`)
      
      setFeedback(explanationText)
      setShowFeedback(true)

      if (isCorrect) {
        setScore(prev => prev + 1)
      }

      setAnswers(prev => [...prev, {
        question: currentQuestion.question,
        userAnswer: selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        feedback: explanationText,
        explanation: currentQuestion.explanation
      }])

    } catch (error) {
      console.error('Answer validation error:', error)
      
      // Use built-in explanation on error
      const explanationText = currentQuestion.explanation || 
        (isCorrect ? '✅ Correct! Well done!' : `❌ Incorrect. The correct answer is: ${currentQuestion.options[currentQuestion.correctAnswer]}`)
      
      setFeedback(explanationText)
      setShowFeedback(true)

      if (isCorrect) {
        setScore(prev => prev + 1)
      }

      setAnswers(prev => [...prev, {
        question: currentQuestion.question,
        userAnswer: selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        explanation: currentQuestion.explanation
      }])
    } finally {
      setIsValidating(false)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
      setFeedback('')
    } else {
      handleFinishQuiz()
    }
  }

  const handleFinishQuiz = async () => {
    setQuizState('results')

    // Check for adaptive difficulty
    try {
      const adaptiveResult = await getAdaptiveDifficulty(difficulty, score, questions.length)
      
      if (adaptiveResult.success && adaptiveResult.shouldAdjust) {
        toast.success(adaptiveResult.message, { duration: 5000 })
      }
    } catch (error) {
      console.error('Adaptive difficulty error:', error)
    }
  }

  const handleRestartQuiz = () => {
    setQuizState('setup')
    setTopic('')
    setDifficulty('medium')
    setQuestionCount(5)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setAnswers([])
    setShowFeedback(false)
    setFeedback('')
    setScore(0)
  }

  const currentQuestion = questions[currentQuestionIndex]
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full mb-4">
              <FaBrain size={24} />
              <h1 className="text-2xl font-bold">AI Quiz Master</h1>
            </div>
            <p className="text-gray-400">Powered by Gemini 2.5 • Adaptive Learning</p>
          </motion.div>

          {/* Quiz Setup */}
          {quizState === 'setup' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-2xl p-8 border border-gray-700"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Configure Your Quiz</h2>

              {/* Topic Selection */}
              <div className="mb-6">
                <label className="text-gray-300 font-semibold mb-3 block">Select Topic</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {topics.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopic(t)}
                      className={`p-4 rounded-xl border-2 transition ${
                        topic === t
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="mb-6">
                <label className="text-gray-300 font-semibold mb-3 block">Difficulty Level</label>
                <div className="grid grid-cols-4 gap-3">
                  {difficulties.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={`p-3 rounded-xl border-2 transition ${
                        difficulty === d.value
                          ? `bg-${d.color}-600 border-${d.color}-500 text-white`
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div className="mb-8">
                <label className="text-gray-300 font-semibold mb-3 block">
                  Number of Questions: {questionCount}
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3</span>
                  <span>10</span>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartQuiz}
                disabled={!topic}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Quiz with AI 🚀
              </button>
            </motion.div>
          )}

          {/* Loading State */}
          {quizState === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800 rounded-2xl p-12 border border-gray-700 text-center"
            >
              <FaSpinner className="animate-spin text-purple-500 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">Generating Quiz...</h3>
              <p className="text-gray-400">AI is creating {questionCount} questions about {topic}</p>
            </motion.div>
          )}

          {/* Active Quiz */}
          {quizState === 'active' && currentQuestion && (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-2xl p-8 border border-gray-700"
            >
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <span>Score: {score}/{questions.length}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <h3 className="text-xl font-bold text-white mb-6">{currentQuestion.question}</h3>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index
                  const isCorrect = index === currentQuestion.correctAnswer
                  const showResult = showFeedback

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showFeedback}
                      className={`w-full p-4 rounded-xl border-2 text-left transition ${
                        showResult
                          ? isCorrect
                            ? 'bg-green-600/20 border-green-500 text-green-300'
                            : isSelected
                            ? 'bg-red-600/20 border-red-500 text-red-300'
                            : 'bg-gray-700 border-gray-600 text-gray-400'
                          : isSelected
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                      } disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{String.fromCharCode(65 + index)}.</span>
                        <span>{option}</span>
                        {showResult && isCorrect && <FaCheckCircle className="ml-auto text-green-500" />}
                        {showResult && isSelected && !isCorrect && <FaTimesCircle className="ml-auto text-red-500" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {showFeedback && feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-blue-600/20 border border-blue-500 rounded-xl p-4 mb-6"
                  >
                    <div className="flex items-start gap-3">
                      <FaLightbulb className="text-blue-400 flex-shrink-0 mt-1" />
                      <p className="text-blue-200 text-sm whitespace-pre-wrap">{feedback}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!showFeedback ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null || isValidating}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50"
                  >
                    {isValidating ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaSpinner className="animate-spin" /> Validating...
                      </span>
                    ) : (
                      'Submit Answer'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'Finish Quiz 🎉'}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Results */}
          {quizState === 'results' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-2xl p-8 border border-gray-700"
            >
              <div className="text-center mb-8">
                <FaTrophy className={`mx-auto mb-4 ${
                  percentage >= 80 ? 'text-yellow-500' : percentage >= 60 ? 'text-blue-500' : 'text-gray-500'
                }`} size={64} />
                <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
                <p className="text-gray-400">Here's how you did:</p>
              </div>

              {/* Score Card */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-6 text-center">
                <div className="text-6xl font-bold text-white mb-2">{percentage}%</div>
                <p className="text-white/80">Score: {score} / {questions.length}</p>
              </div>

              {/* Performance */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700 rounded-xl p-4 text-center">
                  <FaCheckCircle className="text-green-500 mx-auto mb-2" size={24} />
                  <div className="text-2xl font-bold text-white">{score}</div>
                  <p className="text-gray-400 text-sm">Correct</p>
                </div>
                <div className="bg-gray-700 rounded-xl p-4 text-center">
                  <FaTimesCircle className="text-red-500 mx-auto mb-2" size={24} />
                  <div className="text-2xl font-bold text-white">{questions.length - score}</div>
                  <p className="text-gray-400 text-sm">Incorrect</p>
                </div>
                <div className="bg-gray-700 rounded-xl p-4 text-center">
                  <FaChartLine className="text-blue-500 mx-auto mb-2" size={24} />
                  <div className="text-2xl font-bold text-white">{difficulty}</div>
                  <p className="text-gray-400 text-sm">Difficulty</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleRestartQuiz}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <FaRedo /> New Quiz
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </Layout>
  )
}

export default AIQuizMaster
