import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import User from '../models/User.js'

const router = express.Router()

// Initialize Gemini
let gemini = null
const initGemini = () => {
  if (!gemini && process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    gemini = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.8,
        responseMimeType: "application/json"
      }
    })
  }
  return gemini
}

// Generate AI Battle with questions
router.post('/create', async (req, res) => {
  try {
    const { userId, topic, difficulty, questionCount = 5 } = req.body

    const geminiModel = initGemini()
    if (!geminiModel) {
      return res.status(503).json({ 
        success: false,
        message: 'AI service unavailable' 
      })
    }

    const prompt = `Generate ${questionCount} multiple choice questions for a coding quiz battle.
Topic: ${topic || 'JavaScript'}
Difficulty: ${difficulty || 'medium'}

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "What is the output of console.log(typeof null)?",
      "options": ["null", "object", "undefined", "number"],
      "correctAnswer": 1,
      "explanation": "typeof null returns 'object' due to a historical JavaScript bug"
    }
  ]
}

Make sure:
- Questions are clear and concise
- All 4 options are plausible
- correctAnswer is the index (0-3) of the correct option
- Include brief explanation for learning`

    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    let parsedData
    try {
      parsedData = JSON.parse(text)
    } catch (parseError) {
      // Clean up response if needed
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      parsedData = JSON.parse(cleanedText)
    }

    const battle = {
      _id: Date.now().toString(),
      userId,
      topic: topic || 'JavaScript',
      difficulty: difficulty || 'medium',
      questions: parsedData.questions,
      currentQuestion: 0,
      playerScore: 0,
      aiScore: 0,
      startTime: Date.now()
    }

    res.json({
      success: true,
      battle
    })
  } catch (error) {
    console.error('AI Battle creation error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
})

// Submit answer and get AI response
router.post('/:battleId/answer', async (req, res) => {
  try {
    const { userId, questionIndex, userAnswer, timeRemaining } = req.body
    const { battleId } = req.params

    // In a real app, you'd fetch the battle from database
    // For now, we'll just validate the answer and simulate AI
    
    // AI always gets the correct answer (simulated)
    const isUserCorrect = userAnswer !== null && userAnswer !== undefined
    const aiAnswered = timeRemaining <= 0 // AI answers if user times out
    
    let playerPoints = 0
    let aiPoints = 0

    if (isUserCorrect && timeRemaining > 0) {
      // User answered in time
      playerPoints = 10
    } else if (timeRemaining <= 0 || !isUserCorrect) {
      // User timed out or wrong - AI gets point
      aiPoints = 10
    }

    res.json({
      success: true,
      playerPoints,
      aiPoints,
      aiAnswered: true,
      message: playerPoints > 0 ? 'Correct! +10 XP' : 'Time up! AI scores this round'
    })
  } catch (error) {
    console.error('Answer submission error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
})

// Complete battle and award rewards
router.post('/:battleId/complete', async (req, res) => {
  try {
    const { userId, playerScore, aiScore } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      })
    }

    let xpAwarded = 0
    let coinsAwarded = 0
    let result = ''

    if (playerScore > aiScore) {
      // Win
      xpAwarded = playerScore * 1 // 10 XP per correct answer
      coinsAwarded = 10
      result = 'win'
    } else if (playerScore === aiScore) {
      // Draw
      xpAwarded = playerScore * 1
      coinsAwarded = 5
      result = 'draw'
    } else {
      // Lose
      xpAwarded = playerScore * 1 // Still get XP for correct answers
      coinsAwarded = 0
      result = 'lose'
    }

    user.xp += xpAwarded
    user.coins += coinsAwarded
    user.calculateLevel()
    await user.save()

    res.json({
      success: true,
      result,
      xpAwarded,
      coinsAwarded,
      newXP: user.xp,
      newCoins: user.coins,
      newLevel: user.level
    })
  } catch (error) {
    console.error('Battle completion error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message 
    })
  }
})

export default router
