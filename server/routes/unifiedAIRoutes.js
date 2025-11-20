import express from 'express'
import geminiAI from '../services/geminiAIService.js'
import DebugAttempt from '../models/DebugAttempt.js'
import { protect } from '../middleware/lmsAuth.js'
import { optionalAuth } from '../middleware/optionalAuth.js'

const router = express.Router()

/**
 * Unified AI Routes
 * All AI features use the same Gemini API service with different contexts
 */

// ==================== AI CHATBOT ROUTES ====================

/**
 * POST /api/unified-ai/chat
 * AI Chatbot - Conversational learning assistant
 */
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, context } = req.body

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      })
    }

    // Add user info to context (if authenticated)
    const userContext = {
      ...context,
      userId: req.user?._id,
      role: req.user?.role || 'guest',
      level: req.user?.level || context?.level || 1,
      xp: req.user?.xp || context?.xp || 0,
      streak: req.user?.streak || context?.streak || 0
    }

    const result = await geminiAI.chat(message, userContext)

    if (!result.success) {
      // Return intelligent fallback
      return res.json({
        success: true,
        response: getFallbackChatResponse(message, userContext),
        fallback: true,
        timestamp: new Date()
      })
    }

    res.json({
      success: true,
      response: result.data,
      metadata: result.metadata,
      timestamp: new Date()
    })

  } catch (error) {
    console.error('Chat Error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

/**
 * POST /api/unified-ai/chat/recommendation
 * Get personalized learning recommendation
 */
router.post('/chat/recommendation', optionalAuth, async (req, res) => {
  try {
    const userProfile = {
      level: req.user?.level || 1,
      xp: req.user?.xp || 0,
      streak: req.user?.streak || 0,
      completedTopics: req.body.completedTopics || [],
      weakAreas: req.body.weakAreas || []
    }

    const result = await geminiAI.getRecommendation(userProfile)

    if (!result.success) {
      return res.json({
        success: true,
        recommendation: 'Focus on JavaScript fundamentals and build small projects to solidify your knowledge.',
        fallback: true
      })
    }

    res.json({
      success: true,
      recommendation: result.data,
      metadata: result.metadata
    })

  } catch (error) {
    console.error('Recommendation Error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

// ==================== QUIZ MASTER ROUTES ====================

/**
 * POST /api/unified-ai/quiz/generate
 * Generate quiz questions dynamically
 */
router.post('/quiz/generate', optionalAuth, async (req, res) => {
  try {
    const { topic, difficulty = 'medium', questionCount = 5 } = req.body

    if (!topic) {
      return res.status(400).json({ 
        success: false, 
        error: 'Topic is required' 
      })
    }

    const result = await geminiAI.generateQuiz({
      topic,
      difficulty,
      questionCount,
      level: req.user?.level || 1
    })

    if (!result.success) {
      // Return fallback quiz
      return res.json({
        success: true,
        questions: getFallbackQuiz(topic, difficulty, questionCount),
        fallback: true
      })
    }

    res.json({
      success: true,
      questions: result.data,
      metadata: result.metadata
    })

  } catch (error) {
    console.error('Quiz Generation Error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

/**
 * POST /api/unified-ai/quiz/validate
 * Validate answer and provide detailed feedback
 */
router.post('/quiz/validate', optionalAuth, async (req, res) => {
  try {
    const { question, userAnswer, correctAnswer, options } = req.body

    if (question === undefined || userAnswer === undefined || correctAnswer === undefined || !options) {
      return res.status(400).json({ 
        success: false, 
        error: 'Question, answers, and options are required' 
      })
    }

    const isCorrect = userAnswer === correctAnswer

    const result = await geminiAI.validateQuizAnswer(
      question,
      userAnswer,
      correctAnswer,
      options
    )

    if (!result.success) {
      return res.json({
        success: true,
        isCorrect,
        feedback: isCorrect 
          ? '✅ Correct! Well done!' 
          : `❌ Incorrect. The correct answer is: ${options[correctAnswer]}`,
        fallback: true
      })
    }

    res.json({
      success: true,
      isCorrect,
      feedback: result.data,
      metadata: result.metadata
    })

  } catch (error) {
    console.error('Quiz Validation Error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

/**
 * POST /api/unified-ai/quiz/adaptive-difficulty
 * Adjust quiz difficulty based on performance
 */
router.post('/quiz/adaptive-difficulty', optionalAuth, async (req, res) => {
  try {
    const { currentDifficulty, score, totalQuestions } = req.body

    const percentage = (score / totalQuestions) * 100
    let newDifficulty = currentDifficulty

    // Adaptive difficulty logic
    if (percentage >= 80) {
      const levels = ['easy', 'medium', 'hard', 'expert']
      const currentIndex = levels.indexOf(currentDifficulty)
      if (currentIndex < levels.length - 1) {
        newDifficulty = levels[currentIndex + 1]
      }
    } else if (percentage < 50) {
      const levels = ['easy', 'medium', 'hard', 'expert']
      const currentIndex = levels.indexOf(currentDifficulty)
      if (currentIndex > 0) {
        newDifficulty = levels[currentIndex - 1]
      }
    }

    res.json({
      success: true,
      currentDifficulty,
      newDifficulty,
      shouldAdjust: newDifficulty !== currentDifficulty,
      performance: percentage >= 80 ? 'excellent' : percentage >= 60 ? 'good' : 'needs-improvement',
      message: newDifficulty !== currentDifficulty 
        ? `Great job! Moving to ${newDifficulty} difficulty.` 
        : 'Keep practicing at this level.'
    })

  } catch (error) {
    console.error('Adaptive Difficulty Error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

// ==================== DEBUG DUEL ROUTES ====================

/**
 * POST /api/unified-ai/debug/analyze
 * Analyze code and identify bugs
 */
router.post('/debug/analyze', optionalAuth, async (req, res) => {
  try {
    const { code, language = 'JavaScript', description, challengeType } = req.body

    if (!code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Code is required' 
      })
    }

    const result = await geminiAI.analyzeCode(code, {
      language,
      description,
      challengeType,
      level: req.user?.level || 1
    })

    if (!result.success) {
      return res.json({
        success: true,
        analysis: 'Unable to analyze code at this time. Please check syntax and try again.',
        fallback: true
      })
    }

    res.json({
      success: true,
      analysis: result.data,
      metadata: result.metadata
    })

  } catch (error) {
    console.error('Debug Analyze Error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

/**
 * POST /api/unified-ai/debug/generate-challenge
 * Generate debugging challenge
 */
router.post('/debug/generate-challenge', optionalAuth, async (req, res) => {
  try {
    const { topic, difficulty = 'medium' } = req.body

    if (!topic) {
      return res.status(400).json({ 
        success: false, 
        error: 'Topic is required' 
      })
    }

    const result = await geminiAI.generateDebugChallenge(
      topic,
      difficulty,
      req.user?.level || 1
    )

    if (!result.success) {
      return res.json({
        success: true,
        challenge: getFallbackDebugChallenge(topic, difficulty),
        fallback: true
      })
    }

    res.json({
      success: true,
      challenge: result.data,
      metadata: result.metadata
    })

  } catch (error) {
    console.error('Debug Challenge Generation Error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

/**
 * POST /api/unified-ai/debug/hint
 * Get progressive hint for debugging
 */
router.post('/debug/hint', optionalAuth, async (req, res) => {
  try {
    const { code, description, hintLevel = 1 } = req.body

    const hintPrompts = {
      1: 'Provide a gentle hint about where to look for the bug (no solution)',
      2: 'Explain what type of error this is and general approach to fix',
      3: 'Show the specific line with the bug and explain the issue',
      4: 'Provide the corrected code with full explanation'
    }

    const prompt = `${hintPrompts[hintLevel]}

Challenge: ${description}

Code:
\`\`\`javascript
${code}
\`\`\`

Provide hint level ${hintLevel} (1=subtle, 4=detailed).`

    const result = await geminiAI.generate({
      mode: 'debug',
      prompt,
      context: { hintLevel, level: req.user?.level || 1 },
      metadata: { type: 'hint', hintLevel }
    })

    if (!result.success) {
      return res.json({
        success: true,
        hint: 'Check your syntax carefully, especially brackets and semicolons.',
        fallback: true
      })
    }

    res.json({
      success: true,
      hint: result.data,
      hintLevel,
      metadata: result.metadata
    })

  } catch (error) {
    console.error('Debug Hint Error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

// ==================== ADMIN & STATS ROUTES ====================

/**
 * POST /api/unified-ai/debug/attempt
 * Save a debug duel attempt (optionalAuth) - stores solved state and metadata
 */
router.post('/debug/attempt', optionalAuth, async (req, res) => {
  try {
    const {
      topic,
      difficulty,
      title,
      buggyCode,
      solution,
      solved = false,
      timeTaken,
      hintsUsed = 0,
      metadata = {},
      userEmail
    } = req.body

    if (!topic || !difficulty) {
      return res.status(400).json({ success: false, error: 'Topic and difficulty are required' })
    }

    const attempt = new DebugAttempt({
      userId: req.user?._id,
      userEmail: req.user?.email || userEmail,
      topic,
      difficulty,
      title,
      buggyCode,
      solution,
      solved,
      timeTaken,
      hintsUsed,
      metadata
    })

    await attempt.save()

    res.json({ success: true, attempt })
  } catch (error) {
    console.error('Save Debug Attempt Error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * GET /api/unified-ai/debug/attempts
 * Query attempts for the current user (optional filters)
 */
router.get('/debug/attempts', optionalAuth, async (req, res) => {
  try {
    const { topic, difficulty, title, userEmail } = req.query
    const query = {}

    if (req.user?._id) query.userId = req.user._id
    else if (userEmail) query.userEmail = userEmail

    if (topic) query.topic = topic
    if (difficulty) query.difficulty = difficulty
    if (title) query.title = title

    const attempts = await DebugAttempt.find(query).sort({ createdAt: -1 }).limit(100)
    res.json({ success: true, attempts })
  } catch (error) {
    console.error('Get Debug Attempts Error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * GET /api/unified-ai/stats
 * Get AI service statistics (admin only)
 */
router.get('/stats', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      })
    }

    const stats = geminiAI.getStats()

    res.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Stats Error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

/**
 * POST /api/unified-ai/stats/reset
 * Reset AI statistics (admin only)
 */
router.post('/stats/reset', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      })
    }

    geminiAI.resetStats()

    res.json({
      success: true,
      message: 'Statistics reset successfully'
    })

  } catch (error) {
    console.error('Reset Stats Error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

// ==================== FALLBACK FUNCTIONS ====================

function getFallbackChatResponse(message, context) {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('react') && lowerMessage.includes('hook')) {
    return "React Hooks are powerful! 🎣 Start with useState for state management and useEffect for side effects. Try building a counter app to practice!"
  } else if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
    return "JavaScript is the foundation of web development! 💻 Focus on variables, functions, arrays, and async/await. Practice with small coding challenges daily."
  } else if (lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
    return "Feeling stuck is part of learning! 💪 Break the problem into smaller pieces, use console.log(), and take breaks. You're doing great!"
  } else {
    return `Great question! Keep exploring and practicing. You're at Level ${context.level} with ${context.xp} XP - keep up the momentum! 🌟`
  }
}

function getFallbackQuiz(topic, difficulty, count = 5) {
  // Topic-specific question bank
  const questionBanks = {
    javascript: [
      {
        question: "What is the difference between '==' and '===' in JavaScript?",
        options: ["'==' checks value only, '===' checks value and type", "'==' is faster than '==='", "'===' is deprecated", "They are exactly the same"],
        correctAnswer: 0,
        explanation: "The '==' operator performs type coercion before comparison, while '===' (strict equality) checks both value and type without coercion."
      },
      {
        question: "What does 'typeof null' return in JavaScript?",
        options: ["object", "null", "undefined", "boolean"],
        correctAnswer: 0,
        explanation: "This is a known JavaScript quirk. 'typeof null' returns 'object' due to a bug in the original JavaScript implementation that was never fixed for backward compatibility."
      },
      {
        question: "Which method is used to add elements to the end of an array?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correctAnswer: 0,
        explanation: "The push() method adds one or more elements to the end of an array and returns the new length. pop() removes from end, shift() removes from start, unshift() adds to start."
      },
      {
        question: "What is a closure in JavaScript?",
        options: ["A function with access to its outer scope", "A way to close browser windows", "A method to end loops", "A type of object"],
        correctAnswer: 0,
        explanation: "A closure is a function that has access to variables in its outer (enclosing) scope, even after the outer function has returned. Closures are created every time a function is created."
      },
      {
        question: "Which keyword is used to declare a block-scoped variable?",
        options: ["let", "var", "const", "Both let and const"],
        correctAnswer: 3,
        explanation: "Both 'let' and 'const' declare block-scoped variables. The difference is that 'let' allows reassignment while 'const' does not. 'var' is function-scoped, not block-scoped."
      },
      {
        question: "What does the 'map()' method do?",
        options: ["Creates a new array by transforming each element", "Filters array elements", "Reduces array to single value", "Sorts the array"],
        correctAnswer: 0,
        explanation: "The map() method creates a new array by calling a provided function on every element in the calling array. It transforms each element and returns a new array with the results."
      },
      {
        question: "What is the purpose of 'async/await'?",
        options: ["To write asynchronous code that looks synchronous", "To make code run faster", "To create infinite loops", "To define classes"],
        correctAnswer: 0,
        explanation: "async/await is syntactic sugar over Promises that allows you to write asynchronous code in a more synchronous-looking style, making it easier to read and maintain."
      },
      {
        question: "What does 'this' keyword refer to in JavaScript?",
        options: ["The context in which a function is executed", "The previous function", "The global window", "The parent element"],
        correctAnswer: 0,
        explanation: "The 'this' keyword refers to the context in which a function is executed. Its value depends on how the function is called: method call, function call, constructor, or arrow function."
      },
      {
        question: "Which method converts a JSON string to a JavaScript object?",
        options: ["JSON.parse()", "JSON.stringify()", "JSON.convert()", "JSON.toObject()"],
        correctAnswer: 0,
        explanation: "JSON.parse() parses a JSON string and returns a JavaScript object. JSON.stringify() does the opposite - it converts a JavaScript object into a JSON string."
      },
      {
        question: "What is event bubbling in JavaScript?",
        options: ["Events propagate from child to parent elements", "Events propagate from parent to child", "Events are duplicated", "Events are canceled"],
        correctAnswer: 0,
        explanation: "Event bubbling is when an event starts from the target element and bubbles up through its ancestors in the DOM tree. This allows parent elements to handle events from their children."
      }
    ],
    css: [
      {
        question: "What does 'flexbox' allow you to do?",
        options: ["Create flexible layouts with easy alignment", "Add animations", "Style text", "Create gradients"],
        correctAnswer: 0,
        explanation: "Flexbox (Flexible Box Layout) is a CSS layout model that allows you to design flexible and responsive layouts with easy alignment and distribution of space among items."
      },
      {
        question: "What is the difference between 'margin' and 'padding'?",
        options: ["Margin is outside, padding is inside the border", "They are the same", "Margin is inside, padding is outside", "Padding only works on divs"],
        correctAnswer: 0,
        explanation: "Margin is the space outside an element's border, creating distance from other elements. Padding is the space inside the border, creating distance between the border and content."
      },
      {
        question: "What does 'position: absolute' do?",
        options: ["Positions element relative to nearest positioned ancestor", "Positions element at top of page", "Removes element from page", "Centers the element"],
        correctAnswer: 0,
        explanation: "position: absolute removes the element from normal document flow and positions it relative to its nearest positioned (non-static) ancestor, or the initial containing block if none exists."
      },
      {
        question: "Which property controls text color in CSS?",
        options: ["color", "text-color", "font-color", "text"],
        correctAnswer: 0,
        explanation: "The 'color' property sets the color of text content in CSS. It accepts color names, hex codes, RGB, RGBA, HSL, and HSLA values."
      },
      {
        question: "What is the CSS box model?",
        options: ["Content, padding, border, and margin layers", "A way to create boxes", "A grid system", "A flexbox alternative"],
        correctAnswer: 0,
        explanation: "The CSS box model describes how elements are rendered as rectangular boxes with four layers: content (innermost), padding, border, and margin (outermost)."
      }
    ],
    html: [
      {
        question: "What does HTML stand for?",
        options: ["HyperText Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
        correctAnswer: 0,
        explanation: "HTML stands for HyperText Markup Language. It's the standard markup language for creating web pages and web applications."
      },
      {
        question: "Which tag is used for the largest heading?",
        options: ["<h1>", "<h6>", "<heading>", "<head>"],
        correctAnswer: 0,
        explanation: "The <h1> tag represents the largest and most important heading. HTML provides six heading levels from <h1> (largest) to <h6> (smallest)."
      },
      {
        question: "What is the purpose of the <meta> tag?",
        options: ["Provide metadata about the HTML document", "Create paragraphs", "Add images", "Link stylesheets"],
        correctAnswer: 0,
        explanation: "The <meta> tag provides metadata about the HTML document, such as character encoding, viewport settings, description, keywords, and author information."
      },
      {
        question: "Which attribute specifies the URL of an image?",
        options: ["src", "href", "url", "link"],
        correctAnswer: 0,
        explanation: "The 'src' attribute specifies the URL or path of the image file for the <img> tag. 'href' is used for links, not images."
      },
      {
        question: "What does the <a> tag create?",
        options: ["A hyperlink", "An image", "A paragraph", "A heading"],
        correctAnswer: 0,
        explanation: "The <a> (anchor) tag creates hyperlinks that allow users to navigate to other pages or sections. The 'href' attribute specifies the link destination."
      }
    ]
  }

  // Normalize topic to lowercase for matching
  const normalizedTopic = topic.toLowerCase()
  let questions = []

  // Find matching question bank
  if (normalizedTopic.includes('javascript') || normalizedTopic.includes('js')) {
    questions = questionBanks.javascript
  } else if (normalizedTopic.includes('css') || normalizedTopic.includes('style')) {
    questions = questionBanks.css
  } else if (normalizedTopic.includes('html')) {
    questions = questionBanks.html
  } else {
    // Default to JavaScript questions for unknown topics
    questions = questionBanks.javascript
  }

  // Shuffle and select the requested number of questions
  const shuffled = questions.sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count, questions.length))

  // Add difficulty and topic to each question
  return selected.map((q, index) => ({
    ...q,
    id: index + 1,
    difficulty,
    topic
  }))
}

function getFallbackDebugChallenge(topic, difficulty) {
  return {
    title: `Debug ${topic} Challenge`,
    description: `Find and fix the bugs in this ${topic} code.`,
    buggyCode: `// Buggy code here
function example() {
  // TODO: Fix this
  return undefined
}`,
    bugs: ['Bug 1: Check the logic', 'Bug 2: Check the syntax'],
    hints: ['Look at the return statement', 'Check variable names'],
    solution: `// Fixed code
function example() {
  return 'Fixed!'
}`,
    difficulty,
    topic
  }
}

export default router
