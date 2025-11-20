import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Unified Gemini AI Service
 * Supports multiple AI modules: Chatbot, Quiz Master, Debug Duel
 * Uses context-aware prompting for different modes
 */

class GeminiAIService {
  constructor() {
    this.genAI = null
    this.model = null
    this.initialized = false
    this.requestLog = []
    this.tokenUsage = {
      total: 0,
      byMode: {
        chatbot: 0,
        quiz: 0,
        debug: 0,
        general: 0
      }
    }
  }

  /**
   * Initialize Gemini API with API key
   */
  initialize() {
    if (this.initialized) {
      return true
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.error('❌ Gemini API key not configured')
      return false
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey)
      
      // Use Gemini 2.0 Flash for faster responses
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash', // Stable Gemini 2.0 model
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })

      this.initialized = true
      console.log('✅ Gemini AI Service initialized successfully')
      return true
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI Service:', error.message)
      return false
    }
  }

  /**
   * Get context-specific system prompt based on mode
   */
  getSystemPrompt(mode, context = {}) {
    const prompts = {
      chatbot: `You are IdleLearn AI Coach, a friendly and knowledgeable programming mentor. 

**Your Role:**
- Help students learn web development (HTML, CSS, JavaScript, React)
- Provide clear, encouraging, and actionable guidance
- Break down complex concepts into simple explanations
- Suggest practical exercises and next steps

**Student Context:**
- Level: ${context.level || 1}
- XP: ${context.xp || 0}
- Current Topics: ${context.topics?.join(', ') || 'Getting started'}
- Streak: ${context.streak || 0} days
- Role: ${context.role || 'student'}

**Guidelines:**
- Be encouraging and supportive 🌟
- Keep responses concise (under 200 words)
- Use emojis sparingly but effectively
- Provide code examples when relevant
- Always suggest next learning steps
- Adapt difficulty to student's level`,

      quiz: `You are Quiz Master AI, an expert at creating educational programming quizzes.

**Your Role:**
- Generate high-quality multiple-choice questions
- Validate student answers with detailed explanations
- Adjust difficulty based on performance
- Track learning progress through questions

**Quiz Context:**
- Topic: ${context.topic || 'General Programming'}
- Difficulty: ${context.difficulty || 'medium'}
- Student Level: ${context.level || 1}
- Previous Performance: ${context.score || 'Unknown'}

**Guidelines:**
- Create 4 options (1 correct, 3 plausible distractors)
- Provide detailed explanations for correct answers
- Explain why wrong answers are incorrect
- Include code snippets when relevant
- Progressive difficulty adjustment
- Educational feedback over mere correctness`,

      debug: `You are Debug Duel AI, a code analysis and debugging expert.

**Your Role:**
- Analyze code for logic errors, syntax issues, and bugs
- Provide detailed, educational feedback
- Suggest optimized solutions with explanations
- Help students understand debugging methodology

**Code Context:**
- Language: ${context.language || 'JavaScript'}
- Difficulty: ${context.difficulty || 'medium'}
- Student Level: ${context.level || 1}
- Challenge Type: ${context.challengeType || 'Bug Hunt'}

**Guidelines:**
- Identify all errors (syntax, logic, runtime)
- Explain WHY each error occurs
- Provide corrected code with annotations
- Suggest best practices and optimizations
- Teach debugging techniques
- Be encouraging - errors are learning opportunities`,

      general: `You are an AI assistant for the IdleLearn educational platform.

**Your Role:**
- Assist with various learning tasks
- Provide accurate, helpful information
- Support student learning journey

**Guidelines:**
- Be clear and concise
- Provide accurate information
- Be encouraging and supportive`
    }

    return prompts[mode] || prompts.general
  }

  /**
   * Get generation config based on mode
   */
  getGenerationConfig(mode) {
    const configs = {
      chatbot: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500,
      },
      quiz: {
        temperature: 0.6, // More focused for quiz generation
        topK: 30,
        topP: 0.9,
        maxOutputTokens: 1500,
      },
      debug: {
        temperature: 0.4, // Low temperature for precise code analysis
        topK: 20,
        topP: 0.85,
        maxOutputTokens: 2000,
      },
      general: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      }
    }

    return configs[mode] || configs.general
  }

  /**
   * Generate AI response with context awareness
   */
  async generate(options) {
    if (!this.initialize()) {
      throw new Error('Gemini AI Service not initialized')
    }

    const {
      mode = 'general',
      prompt,
      context = {},
      userRole = 'student',
      expectJSON = false,
      metadata = {}
    } = options

    try {
      // Build full prompt with system context
      const systemPrompt = this.getSystemPrompt(mode, context)
      const fullPrompt = `${systemPrompt}\n\n${expectJSON ? 'Respond with valid JSON only (no markdown, no code blocks):\n' : ''}${prompt}`

      // Get mode-specific generation config
      const generationConfig = this.getGenerationConfig(mode)

      // Create model instance with specific config
      const modelWithConfig = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig
      })

      // Generate content
      const startTime = Date.now()
      const result = await modelWithConfig.generateContent(fullPrompt)
      const response = await result.response
      const responseText = response.text()
      const duration = Date.now() - startTime

      // Estimate token usage (rough estimation)
      const estimatedTokens = Math.ceil((fullPrompt.length + responseText.length) / 4)
      this.tokenUsage.total += estimatedTokens
      this.tokenUsage.byMode[mode] = (this.tokenUsage.byMode[mode] || 0) + estimatedTokens

      // Log request
      this.logRequest({
        mode,
        userRole,
        promptLength: prompt.length,
        responseLength: responseText.length,
        duration,
        estimatedTokens,
        timestamp: new Date(),
        metadata
      })

      // Parse JSON if expected
      if (expectJSON) {
        const cleanedResponse = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()
        
        try {
          return {
            success: true,
            data: JSON.parse(cleanedResponse),
            raw: responseText,
            metadata: { duration, estimatedTokens, mode }
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError.message)
          return {
            success: false,
            error: 'Invalid JSON response',
            raw: responseText,
            metadata: { duration, estimatedTokens, mode }
          }
        }
      }

      return {
        success: true,
        data: responseText,
        metadata: { duration, estimatedTokens, mode }
      }

    } catch (error) {
      console.error(`❌ Gemini AI Error (${mode}):`, error.message)
      
      this.logRequest({
        mode,
        userRole,
        error: error.message,
        timestamp: new Date(),
        metadata
      })

      return {
        success: false,
        error: error.message,
        mode
      }
    }
  }

  /**
   * Generate chat response
   */
  async chat(message, context = {}) {
    return this.generate({
      mode: 'chatbot',
      prompt: `Student: ${message}`,
      context,
      userRole: context.role || 'student',
      metadata: { type: 'chat' }
    })
  }

  /**
   * Generate quiz questions
   */
  async generateQuiz(options) {
    const { topic, difficulty, questionCount = 5, level = 1 } = options

    const prompt = `Generate EXACTLY ${questionCount} multiple-choice questions about "${topic}" at ${difficulty} difficulty level.

IMPORTANT: Return a JSON array with EXACTLY ${questionCount} question objects. Each question must have:

{
  "question": "Clear, specific question text",
  "options": ["Option 1 text", "Option 2 text", "Option 3 text", "Option 4 text"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation of why the answer is correct",
  "difficulty": "${difficulty}",
  "topic": "${topic}"
}

Requirements:
- Generate ${questionCount} complete questions (not less, not more)
- Options array MUST have 4 strings with actual answer text
- correctAnswer is the index (0-3) of the correct option
- Make options realistic and educational
- Explanation should be 2-3 sentences

Example format:
[
  {
    "question": "What does the JavaScript 'typeof' operator return for arrays?",
    "options": ["object", "array", "undefined", "list"],
    "correctAnswer": 0,
    "explanation": "In JavaScript, arrays are actually objects. The typeof operator returns 'object' for arrays. Use Array.isArray() to check if a value is specifically an array.",
    "difficulty": "${difficulty}",
    "topic": "${topic}"
  }
]

Generate ${questionCount} questions now:`

    return this.generate({
      mode: 'quiz',
      prompt,
      context: { topic, difficulty, level, questionCount },
      expectJSON: true,
      metadata: { type: 'quiz_generation', questionCount }
    })
  }

  /**
   * Validate quiz answer and provide feedback
   */
  async validateQuizAnswer(question, userAnswer, correctAnswer, options) {
    const prompt = `Question: ${question}
Options: ${options.join(', ')}
User's answer: ${options[userAnswer]}
Correct answer: ${options[correctAnswer]}

Provide detailed feedback:
1. Is the answer correct? (yes/no)
2. Explain why the correct answer is right
3. If wrong, explain the misconception
4. Provide a learning tip

Keep feedback under 100 words, be encouraging.`

    return this.generate({
      mode: 'quiz',
      prompt,
      context: { question, userAnswer, correctAnswer },
      metadata: { type: 'answer_validation' }
    })
  }

  /**
   * Analyze code for debugging
   */
  async analyzeCode(code, context = {}) {
    const { language = 'JavaScript', description = '', challengeType = 'Debug' } = context

    const prompt = `Analyze this ${language} code and identify all issues:

${description ? `**Challenge:** ${description}\n\n` : ''}**Code:**
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Provide:
1. **Issues Found:** List all errors (syntax, logic, runtime)
2. **Explanations:** Why each error occurs
3. **Corrected Code:** Fixed version with comments
4. **Best Practices:** Optimization suggestions
5. **Learning Points:** Key takeaways for improvement

Format clearly with sections.`

    return this.generate({
      mode: 'debug',
      prompt,
      context: { language, challengeType, ...context },
      metadata: { type: 'code_analysis', language }
    })
  }

  /**
   * Generate debugging challenge
   */
  async generateDebugChallenge(topic, difficulty, level) {
    const prompt = `Generate a debugging challenge about ${topic} at ${difficulty} difficulty.

Provide:
1. title: Challenge title
2. description: What the code should do
3. buggyCode: Code with 2-3 intentional bugs
4. bugs: Array of bug descriptions
5. hints: Array of progressive hints
6. solution: Corrected code with explanations
7. difficulty: ${difficulty}
8. topic: ${topic}

Return as JSON object.`

    return this.generate({
      mode: 'debug',
      prompt,
      context: { topic, difficulty, level },
      expectJSON: true,
      metadata: { type: 'challenge_generation' }
    })
  }

  /**
   * Get AI recommendation for next learning step
   */
  async getRecommendation(userProfile) {
    const { level, completedTopics = [], weakAreas = [], xp, streak } = userProfile

    const prompt = `Based on this student profile, recommend the next learning topic:

- Level: ${level}
- XP: ${xp}
- Streak: ${streak} days
- Completed: ${completedTopics.join(', ') || 'None yet'}
- Weak Areas: ${weakAreas.join(', ') || 'None identified'}

Provide:
1. Recommended topic
2. Why this topic (2-3 sentences)
3. Prerequisites check
4. Estimated time to learn
5. First practical exercise

Be encouraging and specific.`

    return this.generate({
      mode: 'chatbot',
      prompt,
      context: userProfile,
      metadata: { type: 'recommendation' }
    })
  }

  /**
   * Log request for analytics
   */
  logRequest(logEntry) {
    this.requestLog.push(logEntry)
    
    // Keep only last 100 requests
    if (this.requestLog.length > 100) {
      this.requestLog = this.requestLog.slice(-100)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 AI Request [${logEntry.mode}]:`, {
        duration: `${logEntry.duration}ms`,
        tokens: logEntry.estimatedTokens,
        error: logEntry.error || 'none'
      })
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      initialized: this.initialized,
      totalRequests: this.requestLog.length,
      tokenUsage: this.tokenUsage,
      recentRequests: this.requestLog.slice(-10),
      averageResponseTime: this.requestLog.length > 0
        ? this.requestLog.reduce((sum, log) => sum + (log.duration || 0), 0) / this.requestLog.length
        : 0
    }
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.requestLog = []
    this.tokenUsage = {
      total: 0,
      byMode: {
        chatbot: 0,
        quiz: 0,
        debug: 0,
        general: 0
      }
    }
  }
}

// Export singleton instance
export default new GeminiAIService()
