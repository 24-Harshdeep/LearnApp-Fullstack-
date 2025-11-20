import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBug, FaCode, FaLightbulb, FaCheckCircle, 
  FaSpinner, FaPlay, FaRedo, FaTrophy 
} from 'react-icons/fa'
import { analyzeCode, generateDebugChallenge, getDebugHint } from '../services/unifiedAIAPI'
import toast from 'react-hot-toast'
// Page rendered inside the app Layout (do not re-wrap with Layout)

const AIDebugDuel = () => {
  const [mode, setMode] = useState('challenge') // challenge, analyze
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [challenge, setChallenge] = useState(null)
  const [userCode, setUserCode] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [hintLevel, setHintLevel] = useState(1)
  const [hints, setHints] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [challengeCompleted, setChallengeCompleted] = useState(false)

  const topics = [
    'JavaScript Basics',
    'Array Methods',
    'Objects & Classes',
    'Async/Await',
    'React Components',
    'Event Handling',
    'DOM Manipulation',
    'ES6 Features'
  ]

  const handleGenerateChallenge = async () => {
    if (!topic) {
      toast.error('Please select a topic')
      return
    }

    setIsLoading(true)

    try {
      const result = await generateDebugChallenge(topic, difficulty)

      if (result.success && result.challenge) {
        setChallenge(result.challenge)
        setUserCode(result.challenge.buggyCode || '')
        setHints([])
        setHintLevel(1)
        setShowSolution(false)
        setChallengeCompleted(false)
        setAnalysis(null)
        toast.success('Challenge generated! Find the bugs! 🐛')
      } else {
        throw new Error('Failed to generate challenge')
      }

    } catch (error) {
      console.error('Challenge generation error:', error)
      toast.info('Using fallback challenge')
      
      // Use topic-specific fallback challenges
      const fallbackChallenge = getFallbackChallenge(topic, difficulty)
      setChallenge(fallbackChallenge)
      setUserCode(fallbackChallenge.buggyCode)
      setHints([])
      setHintLevel(1)
      setShowSolution(false)
      setChallengeCompleted(false)
      setAnalysis(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getFallbackChallenge = (topic, difficulty) => {
    const challenges = {
      'JavaScript Basics': {
        title: 'Fix the Loop Bug',
        description: 'This function has a bug that causes an array out-of-bounds error. Find and fix it!',
        buggyCode: `// Calculate the sum of prices
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price;
  }
  return total;
}

const cart = [
  { name: 'Apple', price: 1.5 },
  { name: 'Banana', price: 0.8 }
];

console.log(calculateTotal(cart));`,
        bugs: ['Off-by-one error: i <= items.length should be i < items.length'],
        hints: [
          'Check the loop condition carefully',
          'Array indices start at 0 but what about the end?',
          'When i equals items.length, what happens?'
        ],
        solution: `// Fixed code
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) { // Changed <= to <
    total += items[i].price;
  }
  return total;
}

const cart = [
  { name: 'Apple', price: 1.5 },
  { name: 'Banana', price: 0.8 }
];

console.log(calculateTotal(cart)); // Output: 2.3`,
        difficulty,
        topic
      },
      'Array Methods': {
        title: 'Array Filter Bug',
        description: 'This filter function is not working correctly. Debug it!',
        buggyCode: `// Filter even numbers
function getEvenNumbers(numbers) {
  return numbers.filter(num => {
    num % 2 === 0;
  });
}

const nums = [1, 2, 3, 4, 5, 6];
console.log(getEvenNumbers(nums)); // Expected: [2, 4, 6]`,
        bugs: ['Missing return statement in arrow function'],
        hints: [
          'Check the arrow function syntax',
          'What happens when you don\'t return from a filter callback?',
          'Add the return keyword or use implicit return'
        ],
        solution: `// Fixed code - Option 1: Explicit return
function getEvenNumbers(numbers) {
  return numbers.filter(num => {
    return num % 2 === 0; // Added return
  });
}

// Fixed code - Option 2: Implicit return
function getEvenNumbers(numbers) {
  return numbers.filter(num => num % 2 === 0); // Remove braces for implicit return
}

const nums = [1, 2, 3, 4, 5, 6];
console.log(getEvenNumbers(nums)); // Output: [2, 4, 6]`,
        difficulty,
        topic
      },
      'Async/Await': {
        title: 'Async Bug Hunt',
        description: 'This async function has issues. Can you fix them?',
        buggyCode: `// Fetch user data
function getUserData(userId) {
  const response = await fetch(\`/api/users/\${userId}\`);
  const data = await response.json();
  return data;
}

// Usage
getUserData(123).then(user => console.log(user));`,
        bugs: ['Missing async keyword on function'],
        hints: [
          'Check the function declaration',
          'Can you use await without something?',
          'The function needs to be async'
        ],
        solution: `// Fixed code
async function getUserData(userId) { // Added async keyword
  const response = await fetch(\`/api/users/\${userId}\`);
  const data = await response.json();
  return data;
}

// Usage
getUserData(123).then(user => console.log(user));`,
        difficulty,
        topic
      }
    }

    // Return challenge for the topic, or default to JavaScript Basics
    return challenges[topic] || challenges['JavaScript Basics']
  }

  const handleAnalyzeCode = async () => {
    if (!userCode.trim()) {
      toast.error('Please write some code to analyze')
      return
    }

    setIsLoading(true)
    setAnalysis(null)

    try {
      const result = await analyzeCode(userCode, {
        language: 'JavaScript',
        description: challenge?.description || 'Code analysis',
        challengeType: mode === 'challenge' ? 'Debug Challenge' : 'Free Analysis'
      })

      if (result.success) {
        setAnalysis(result.analysis)
        toast.success('Code analyzed! 🔍')
      } else {
        throw new Error('Analysis failed')
      }

    } catch (error) {
      console.error('Code analysis error:', error)
      toast.error('Failed to analyze code')
      setAnalysis('Unable to analyze code at this time. Please check your syntax and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetHint = async () => {
    if (!challenge) return

    setIsLoading(true)

    try {
      const result = await getDebugHint(
        userCode,
        challenge.description,
        hintLevel
      )

      if (result.success) {
        const newHint = {
          level: hintLevel,
          text: result.hint
        }
        setHints(prev => [...prev, newHint])
        setHintLevel(prev => Math.min(prev + 1, 4))
        toast.success(`Hint ${hintLevel} unlocked! 💡`)
      } else {
        throw new Error('Hint generation failed')
      }

    } catch (error) {
      console.error('Hint error:', error)
      
      // Fallback hint
      if (challenge.hints && challenge.hints[hintLevel - 1]) {
        const newHint = {
          level: hintLevel,
          text: challenge.hints[hintLevel - 1]
        }
        setHints(prev => [...prev, newHint])
        setHintLevel(prev => Math.min(prev + 1, 4))
        toast.success(`Hint ${hintLevel} unlocked! 💡`)
      } else {
        toast.error('No more hints available')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckSolution = () => {
    setShowSolution(true)
    setChallengeCompleted(true)
    toast.success('Solution revealed! Study it carefully. 📚')
  }

  const handleReset = () => {
    setChallenge(null)
    setUserCode('')
    setAnalysis(null)
    setHints([])
    setHintLevel(1)
    setShowSolution(false)
    setChallengeCompleted(false)
    setTopic('')
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-purple-50/20 via-pink-50/20 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-300 text-white px-6 py-3 rounded-full mb-4">
              <FaBug size={24} />
              <h1 className="text-2xl font-bold">AI Debug Duel</h1>
            </div>
            <p className="text-gray-500">Powered by Gemini 2.5 • Code Analysis & Debugging</p>
          </motion.div>

          {/* Mode Selection */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setMode('challenge')}
                className={`px-6 py-3 rounded-xl font-bold transition ${
                mode === 'challenge'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-300 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              🎯 Challenge Mode
            </button>
            <button
              onClick={() => setMode('analyze')}
              className={`px-6 py-3 rounded-xl font-bold transition ${
                  mode === 'analyze'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-300 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
            >
              🔍 Free Analysis
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Panel - Setup/Code Editor */}
            <div className="space-y-6">
              
              {/* Challenge Setup */}
              {mode === 'challenge' && !challenge && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Generate Challenge</h3>
                  
                  <div className="mb-4">
                    <label className="text-gray-300 font-semibold mb-2 block">Topic</label>
                    <div className="grid grid-cols-2 gap-2">
                      {topics.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTopic(t)}
                          className={`p-3 rounded-lg text-sm transition ${
                            topic === t
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-gray-300 font-semibold mb-2 block">Difficulty</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['easy', 'medium', 'hard'].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={`p-3 rounded-lg capitalize transition ${
                            difficulty === d
                              ? 'bg-pink-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateChallenge}
                    disabled={!topic || isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-300 text-white py-3 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <FaPlay /> Generate Challenge
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* Code Editor */}
              {(challenge || mode === 'analyze') && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
                >
                  {challenge && (
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">{challenge.description}</p>
                      {challenge.bugs && (
                        <div className="bg-pink-100/40 border border-pink-200/30 rounded-lg p-3">
                          <p className="text-pink-600 text-sm font-bold mb-1">
                            🐛 {challenge.bugs.length} bug(s) to find
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <label className="text-gray-300 font-semibold mb-2 block flex items-center gap-2">
                    <FaCode /> Your Code
                  </label>
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    placeholder="Write or paste your code here..."
                    className="w-full h-96 bg-gray-900 text-purple-300 font-mono text-sm p-4 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 transition resize-none"
                    spellCheck={false}
                  />

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleAnalyzeCode}
                      disabled={!userCode.trim() || isLoading}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-300 text-white py-3 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin" /> Analyzing...
                        </>
                      ) : (
                        <>
                          <FaBug /> Analyze Code
                        </>
                      )}
                    </button>
                    
                    {challenge && !showSolution && (
                      <button
                        onClick={handleGetHint}
                        disabled={isLoading || hintLevel > 4}
                        className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold transition disabled:opacity-50"
                      >
                        <FaLightbulb /> Hint {hintLevel}
                      </button>
                    )}
                  </div>

                  {challenge && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleCheckSolution}
                        disabled={showSolution}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-xl text-sm transition disabled:opacity-50"
                      >
                        Show Solution
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm transition"
                      >
                        <FaRedo /> Reset
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Right Panel - Analysis/Hints/Solution */}
            <div className="space-y-6">
              
              {/* Hints */}
              {hints.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FaLightbulb className="text-pink-500" /> Hints
                  </h3>
                  <div className="space-y-3">
                    {hints.map((hint, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-pink-100/60 border border-pink-200/40 rounded-lg p-4"
                      >
                        <p className="text-pink-600 text-sm font-bold mb-1">Hint {hint.level}</p>
                        <p className="text-pink-700 text-sm">{hint.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Analysis */}
              {analysis && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FaBug className="text-pink-500" /> AI Analysis
                  </h3>
                  <div className="prose prose-invert max-w-none">
                    <pre className="bg-gray-900 p-4 rounded-lg text-gray-300 text-sm whitespace-pre-wrap overflow-x-auto">
                      {analysis}
                    </pre>
                  </div>
                </motion.div>
              )}

              {/* Solution */}
              {showSolution && challenge?.solution && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800 rounded-2xl p-6 border border-purple-300"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FaCheckCircle className="text-purple-400" /> Solution
                  </h3>
                    <pre className="bg-gray-900 p-4 rounded-lg text-purple-300 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                    {challenge.solution}
                  </pre>
                </motion.div>
              )}

              {/* Completion */}
              {challengeCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-purple-500 to-pink-300 rounded-2xl p-6 text-center"
                >
                    <FaTrophy className="text-pink-200 mx-auto mb-3" size={48} />
                  <h3 className="text-2xl font-bold text-white mb-2">Challenge Complete!</h3>
                  <p className="text-white/80">Great job debugging! Keep practicing to improve your skills.</p>
                </motion.div>
              )}

              {/* Instructions */}
              {!challenge && !analysis && mode === 'analyze' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
                >
                  <h3 className="text-xl font-bold text-white mb-4">How it Works</h3>
                  <div className="space-y-3 text-gray-300 text-sm">
                    <p>✅ Paste any JavaScript code</p>
                    <p>✅ AI analyzes for bugs and issues</p>
                    <p>✅ Get detailed explanations</p>
                    <p>✅ Receive optimized solutions</p>
                    <p>✅ Learn best practices</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </div>
  </>
  )
}

export default AIDebugDuel
