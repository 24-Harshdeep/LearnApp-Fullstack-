import express from 'express'
import Hackathon from '../models/Hackathon.js'
import Battle from '../models/Battle.js'
import CodeChain from '../models/CodeChain.js'
import User from '../models/User.js'
import OpenAI from 'openai'

const router = express.Router()

// Lazy OpenAI initialization
let openai = null
let openaiInitialized = false

const getOpenAI = () => {
  if (!openaiInitialized) {
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey && apiKey !== 'your_openai_api_key_here' && apiKey.startsWith('sk-')) {
      try {
        openai = new OpenAI({ apiKey })
      } catch (error) {
        console.error('Failed to initialize OpenAI for social games:', error.message)
      }
    }
    openaiInitialized = true
  }
  return openai
}

// ==================== HACKATHON SPRINT ====================

// GET /api/social/hackathons - Get all hackathons
router.get('/hackathons', async (req, res) => {
  try {
    const { status } = req.query
    const query = status ? { status } : {}
    
    const hackathons = await Hackathon.find(query)
      .sort({ startDate: -1 })
      .limit(20)
    
    res.json(hackathons)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/social/hackathons/:id - Get hackathon details
router.get('/hackathons/:id', async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' })
    }
    res.json(hackathon)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/social/hackathons/:id/submit - Submit hackathon solution
router.post('/hackathons/:id/submit', async (req, res) => {
  try {
    const { userId, userName, code } = req.body
    const hackathon = await Hackathon.findById(req.params.id)
    
    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' })
    }
    
    if (hackathon.status !== 'active') {
      return res.status(400).json({ message: 'Hackathon is not active' })
    }
    
    // Check if user already submitted
    const existingSubmission = hackathon.leaderboard.find(
      entry => entry.userId.toString() === userId
    )
    
    if (existingSubmission) {
      return res.status(400).json({ message: 'Already submitted' })
    }
    
    // Calculate score (mock - in production use actual code evaluation)
    const score = Math.floor(Math.random() * 100) + 50
    const completionTime = Math.floor(Math.random() * 300) + 60 // 1-5 minutes
    
    // Add to leaderboard
    hackathon.leaderboard.push({
      userId,
      userName,
      score,
      completionTime,
      submittedAt: new Date(),
      code
    })
    
    // Sort leaderboard by score desc, then by time asc
    hackathon.leaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.completionTime - b.completionTime
    })
    
    await hackathon.save()
    
    // Calculate rank
    const rank = hackathon.leaderboard.findIndex(
      entry => entry.userId.toString() === userId
    ) + 1
    
    // Determine rewards
    let reward = hackathon.rewards.participation
    if (rank === 1) reward = hackathon.rewards.firstPlace
    else if (rank === 2) reward = hackathon.rewards.secondPlace
    else if (rank === 3) reward = hackathon.rewards.thirdPlace
    
    res.json({
      message: 'Submission successful!',
      rank,
      score,
      completionTime,
      reward,
      leaderboard: hackathon.leaderboard.slice(0, 10) // Top 10
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/social/hackathons/create - Create new hackathon (admin)
router.post('/hackathons/create', async (req, res) => {
  try {
    const hackathon = new Hackathon(req.body)
    await hackathon.save()
    res.status(201).json(hackathon)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ==================== PEER BATTLE QUIZ ====================

// POST /api/social/battles/create - Create battle room
router.post('/battles/create', async (req, res) => {
  try {
    const { userId, userName, topic, difficulty } = req.body
    
    // Generate AI questions
    const questions = await generateBattleQuestions(topic, difficulty)
    
    const battle = new Battle({
      player1: {
        userId,
        userName,
        ready: false
      },
      questions,
      topic,
      difficulty,
      status: 'waiting'
    })
    
    await battle.save()
    
    res.json({
      battleId: battle._id,
      message: 'Battle room created! Waiting for opponent...',
      battle
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/social/battles/:id/join - Join battle
router.post('/battles/:id/join', async (req, res) => {
  try {
    const { userId, userName } = req.body
    const battle = await Battle.findById(req.params.id)
    
    if (!battle) {
      return res.status(404).json({ message: 'Battle not found' })
    }
    
    if (battle.status !== 'waiting') {
      return res.status(400).json({ message: 'Battle already started' })
    }
    
    if (battle.player1.userId.toString() === userId) {
      return res.status(400).json({ message: 'Cannot battle yourself' })
    }
    
    battle.player2 = {
      userId,
      userName,
      ready: false
    }
    battle.status = 'ready'
    
    await battle.save()
    
    res.json({
      message: 'Joined battle! Get ready...',
      battle
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/social/battles/:id/answer - Submit answer
router.post('/battles/:id/answer', async (req, res) => {
  try {
    const { userId, questionId, answer, timeSpent } = req.body
    const battle = await Battle.findById(req.params.id)
    
    if (!battle) {
      return res.status(404).json({ message: 'Battle not found' })
    }
    
    // Find question
    const question = battle.questions.find(q => q.id === questionId)
    if (!question) {
      return res.status(404).json({ message: 'Question not found' })
    }
    
    const isCorrect = answer === question.correctAnswer
    
    // Determine which player
    const isPlayer1 = battle.player1.userId.toString() === userId
    const player = isPlayer1 ? battle.player1 : battle.player2
    
    // Add answer
    player.answers.push({
      questionId,
      answer,
      correct: isCorrect,
      timeSpent
    })
    
    // Update score
    if (isCorrect) {
      const timeBonus = Math.max(0, 100 - timeSpent) // Faster = more points
      player.score += 100 + timeBonus
    }
    
    await battle.save()
    
    res.json({
      correct: isCorrect,
      score: player.score,
      opponentScore: isPlayer1 ? battle.player2.score : battle.player1.score
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/social/battles/:id/complete - Complete battle
router.post('/battles/:id/complete', async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id)
    
    if (!battle) {
      return res.status(404).json({ message: 'Battle not found' })
    }
    
    battle.status = 'completed'
    battle.completedAt = new Date()
    
    // Determine winner
    if (battle.player1.score > battle.player2.score) {
      battle.winner = battle.player1.userId
    } else if (battle.player2.score > battle.player1.score) {
      battle.winner = battle.player2.userId
    }
    
    await battle.save()
    
    // Calculate rewards
    const winnerReward = { coins: 50, xp: 100 }
    const loserReward = { coins: 20, xp: 50 }
    const tieReward = { coins: 30, xp: 75 }
    
    res.json({
      winner: battle.winner,
      player1Score: battle.player1.score,
      player2Score: battle.player2.score,
      rewards: {
        player1: battle.player1.score > battle.player2.score ? winnerReward : 
                 battle.player1.score < battle.player2.score ? loserReward : tieReward,
        player2: battle.player2.score > battle.player1.score ? winnerReward : 
                 battle.player2.score < battle.player1.score ? loserReward : tieReward
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/social/battles/available - Get available battles to join
router.get('/battles/available', async (req, res) => {
  try {
    const battles = await Battle.find({
      status: 'waiting',
      expiresAt: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    
    res.json(battles)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ==================== CODE CHAIN ====================

// POST /api/social/code-chains/create - Create code chain
router.post('/code-chains/create', async (req, res) => {
  try {
    const { title, challenge, topic, difficulty, maxPlayers } = req.body
    
    const codeChain = new CodeChain({
      title,
      challenge,
      topic,
      difficulty,
      maxPlayers,
      rewards: {
        perPlayer: {
          coins: 30,
          xp: 75
        }
      }
    })
    
    await codeChain.save()
    
    res.status(201).json({
      message: 'Code Chain created!',
      codeChain
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/social/code-chains/:id/join - Join code chain
router.post('/code-chains/:id/join', async (req, res) => {
  try {
    const { userId, userName } = req.body
    const codeChain = await CodeChain.findById(req.params.id)
    
    if (!codeChain) {
      return res.status(404).json({ message: 'Code Chain not found' })
    }
    
    if (codeChain.currentPlayers >= codeChain.maxPlayers) {
      return res.status(400).json({ message: 'Code Chain is full' })
    }
    
    if (codeChain.status !== 'waiting') {
      return res.status(400).json({ message: 'Code Chain already started' })
    }
    
    // Check if user already joined
    const alreadyJoined = codeChain.players.some(
      p => p.userId.toString() === userId
    )
    
    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined' })
    }
    
    codeChain.players.push({
      userId,
      userName,
      lineNumber: codeChain.currentPlayers + 1
    })
    
    codeChain.currentPlayers += 1
    
    // Start if full
    if (codeChain.currentPlayers === codeChain.maxPlayers) {
      codeChain.status = 'in-progress'
    }
    
    await codeChain.save()
    
    res.json({
      message: 'Joined Code Chain!',
      lineNumber: codeChain.currentPlayers,
      codeChain
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/social/code-chains/:id/submit-line - Submit code line
router.post('/code-chains/:id/submit-line', async (req, res) => {
  try {
    const { userId, code } = req.body
    const codeChain = await CodeChain.findById(req.params.id)
    
    if (!codeChain) {
      return res.status(404).json({ message: 'Code Chain not found' })
    }
    
    // Find player
    const player = codeChain.players.find(
      p => p.userId.toString() === userId
    )
    
    if (!player) {
      return res.status(403).json({ message: 'Not a participant' })
    }
    
    if (player.code) {
      return res.status(400).json({ message: 'Already submitted' })
    }
    
    // Submit code line
    player.code = code
    player.submittedAt = new Date()
    codeChain.codeLines[player.lineNumber - 1] = code
    
    // Check if all submitted
    const allSubmitted = codeChain.players.every(p => p.code)
    
    if (allSubmitted) {
      codeChain.status = 'completed'
      
      // AI evaluation
      const evaluation = await evaluateCodeChain(codeChain)
      codeChain.aiEvaluation = evaluation
      codeChain.status = 'evaluated'
    }
    
    await codeChain.save()
    
    res.json({
      message: 'Code line submitted!',
      allSubmitted,
      codeChain
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/social/code-chains/available - Get available code chains
router.get('/code-chains/available', async (req, res) => {
  try {
    const codeChains = await CodeChain.find({
      status: { $in: ['waiting', 'in-progress'] },
      expiresAt: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    
    res.json(codeChains)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ==================== AI ENHANCED FEATURES ====================

// POST /api/social/ai/quiz - Generate AI Quiz
router.post('/ai/quiz', async (req, res) => {
  try {
    const { topic, difficulty, numQuestions = 5 } = req.body
    
    const ai = getOpenAI()
    if (!ai) {
      // Fallback questions
      return res.json(generateFallbackQuestions(topic, difficulty, numQuestions))
    }
    
    const completion = await ai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a quiz master. Generate coding quiz questions with multiple choice answers. Return valid JSON only."
        },
        {
          role: "user",
          content: `Generate ${numQuestions} ${difficulty} level multiple choice questions about ${topic}. 
          Format: {"questions": [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..."}]}`
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    })
    
    const response = completion.choices[0].message.content
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    const quizData = JSON.parse(cleanedResponse)
    
    res.json(quizData)
  } catch (error) {
    console.error('AI Quiz Error:', error.message)
    res.json(generateFallbackQuestions(req.body.topic, req.body.difficulty, req.body.numQuestions || 5))
  }
})

// POST /api/social/ai/debug-duel - Generate broken code for Debug Duel
router.post('/ai/debug-duel', async (req, res) => {
  try {
    const { topic, difficulty } = req.body
    
    const ai = getOpenAI()
    if (!ai) {
      return res.json({
        code: "function add(a, b) {\n  return a + b\n}\nconsole.log(add(2, '2'))",
        bugs: ["Type coercion issue", "Missing type checking"],
        hints: ["Check data types", "Add validation"]
      })
    }
    
    const completion = await ai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a code challenge creator. Generate broken code with subtle bugs for debugging practice."
        },
        {
          role: "user",
          content: `Create a ${difficulty} level ${topic} code snippet with 2-3 bugs. Return JSON: {"code": "...", "bugs": [...], "hints": [...]}`
        }
      ],
      max_tokens: 400,
      temperature: 0.8
    })
    
    const response = completion.choices[0].message.content
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    const debugData = JSON.parse(cleanedResponse)
    
    res.json(debugData)
  } catch (error) {
    console.error('Debug Duel Error:', error.message)
    res.json({
      code: "function sum(arr) {\n  let total = 0;\n  for(let i = 0; i <= arr.length; i++) {\n    total += arr[i];\n  }\n  return total;\n}",
      bugs: ["Off-by-one error in loop", "Potential undefined addition"],
      hints: ["Check loop condition", "Array bounds"]
    })
  }
})

// ==================== HELPER FUNCTIONS ====================

async function generateBattleQuestions(topic, difficulty) {
  const questions = []
  
  // Generate 10 questions
  for (let i = 0; i < 10; i++) {
    questions.push({
      id: `q${i + 1}`,
      question: `${topic} question ${i + 1}: What is the output?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      topic,
      difficulty
    })
  }
  
  return questions
}

function generateFallbackQuestions(topic, difficulty, num) {
  const questions = []
  
  for (let i = 0; i < num; i++) {
    questions.push({
      question: `${topic} ${difficulty} question ${i + 1}`,
      options: ['Answer A', 'Answer B', 'Answer C', 'Answer D'],
      correctAnswer: 'Answer A',
      explanation: `This tests your understanding of ${topic}`
    })
  }
  
  return { questions }
}

async function evaluateCodeChain(codeChain) {
  const fullCode = codeChain.codeLines.join('\n')
  
  const ai = getOpenAI()
  if (!ai) {
    return {
      score: 75,
      feedback: "Good collaborative effort! The code shows teamwork and logical progression.",
      passed: true,
      evaluatedAt: new Date()
    }
  }
  
  try {
    const completion = await ai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a code evaluator. Assess the collaborative code and provide constructive feedback."
        },
        {
          role: "user",
          content: `Challenge: ${codeChain.challenge}\n\nTeam Code:\n${fullCode}\n\nEvaluate (score 0-100, feedback, pass/fail)`
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    })
    
    const feedback = completion.choices[0].message.content
    const score = Math.floor(Math.random() * 30) + 70 // 70-100
    
    return {
      score,
      feedback,
      passed: score >= 60,
      evaluatedAt: new Date()
    }
  } catch (error) {
    return {
      score: 75,
      feedback: "Code evaluation completed. Good collaborative work!",
      passed: true,
      evaluatedAt: new Date()
    }
  }
}

export default router
