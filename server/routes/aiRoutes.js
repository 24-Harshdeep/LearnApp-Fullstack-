import express from 'express'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const router = express.Router()

// Lazy initialization of AI services
let openai = null
let gemini = null
let openaiInitialized = false
let geminiInitialized = false

const getOpenAI = () => {
  if (!openaiInitialized) {
    const apiKey = process.env.OPENAI_API_KEY
    
    console.log('🔍 Initializing OpenAI with key:', apiKey ? `Found (${apiKey.substring(0, 15)}...)` : 'Not found')
    
    if (apiKey && apiKey !== 'your_openai_api_key_here' && apiKey.startsWith('sk-')) {
      try {
        openai = new OpenAI({ apiKey })
        console.log('✅ OpenAI API initialized successfully')
      } catch (error) {
        console.error('❌ Failed to initialize OpenAI:', error.message)
        openai = null
      }
    } else {
      console.log('⚠️  OpenAI API key not valid - checking Gemini...')
    }
    openaiInitialized = true
  }
  return openai
}

const getGemini = () => {
  if (!geminiInitialized) {
    const apiKey = process.env.GEMINI_API_KEY
    
    console.log('🔍 Initializing Gemini with key:', apiKey ? `Found (${apiKey.substring(0, 15)}...)` : 'Not found')
    
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey)
        // Use Gemini 2.5 Flash for faster real-time responses
        gemini = genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "text/plain"
          }
        })
        console.log('✅ Gemini 2.5 Flash API initialized successfully')
      } catch (error) {
        console.error('❌ Failed to initialize Gemini:', error.message)
        gemini = null
      }
    } else {
      console.log('⚠️  Gemini API key not valid')
    }
    geminiInitialized = true
  }
  return gemini
}

// Helper function to check if any AI is available
const isAIAvailable = () => {
  return getOpenAI() !== null || getGemini() !== null
}

// Generate task using AI
router.post('/generate-task', async (req, res) => {
  try {
    const { topic, difficulty, userLevel } = req.body

    if (!isAIAvailable()) {
      // Fallback response
      return res.json({
        title: `Build a ${topic} Component`,
        description: `Create a functional ${topic} component with ${difficulty} level complexity`,
        difficulty,
        xpReward: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 50 : 80,
        topic,
        instructions: `1. Create the component structure\n2. Implement the functionality\n3. Add proper styling`,
        starterCode: `// Your code here`,
        aiGenerated: true
      })
    }

    const prompt = `Generate a coding task for learning ${topic} at ${difficulty} level for a learner at level ${userLevel}. 
    Return ONLY valid JSON with this exact structure (no markdown, no additional text):
    {
      "title": "Task title here",
      "description": "Brief description",
      "difficulty": "${difficulty}",
      "xpReward": ${difficulty === 'easy' ? 30 : difficulty === 'medium' ? 50 : 80},
      "topic": "${topic}",
      "instructions": "Step 1\\nStep 2\\nStep 3",
      "starterCode": "// Your code here",
      "aiGenerated": true
    }`

    let generatedTask = null

    // Try Gemini first
    const geminiClient = getGemini()
    if (geminiClient) {
      try {
        const result = await geminiClient.generateContent(prompt)
        const response = await result.response
        const responseText = response.text().trim()
        
        // Remove markdown code blocks if present
        const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        generatedTask = JSON.parse(cleanedResponse)
        console.log('✅ Gemini task generation successful')
      } catch (geminiError) {
        console.log('⚠️ Gemini failed, trying OpenAI:', geminiError.message)
      }
    }

    // Try OpenAI if Gemini failed
    if (!generatedTask) {
      const openaiClient = getOpenAI()
      if (openaiClient) {
        try {
          const completion = await openaiClient.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are a programming tutor creating coding tasks. Always respond with valid JSON only, no markdown formatting."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            max_tokens: 400,
            temperature: 0.8,
          })

          const responseText = completion.choices[0].message.content.trim()
          const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
          generatedTask = JSON.parse(cleanedResponse)
          console.log('✅ OpenAI task generation successful')
        } catch (openaiError) {
          console.log('⚠️ OpenAI also failed:', openaiError.message)
        }
      }
    }

    // Use fallback if both failed
    if (!generatedTask) {
      generatedTask = {
        title: `Build a ${topic} Component`,
        description: `Create a functional ${topic} component with ${difficulty} level complexity`,
        difficulty,
        xpReward: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 50 : 80,
        topic,
        instructions: `1. Create the component structure\n2. Implement the functionality\n3. Add proper styling`,
        starterCode: `// Your code here`,
        aiGenerated: true
      }
    }

    res.json(generatedTask)
  } catch (error) {
    console.error('AI Generate Task Error:', error.message)
    
    // Fallback response
    res.json({
      title: `Build a ${req.body.topic} Component`,
      description: `Create a functional component with ${req.body.difficulty} level complexity`,
      difficulty: req.body.difficulty,
      xpReward: req.body.difficulty === 'easy' ? 30 : req.body.difficulty === 'medium' ? 50 : 80,
      topic: req.body.topic,
      instructions: `1. Create the component structure\n2. Implement the functionality\n3. Add proper styling`,
      starterCode: `// Your code here`,
      aiGenerated: true
    })
  }
})

// Get AI recommendation
router.post('/recommend', async (req, res) => {
  try {
    const { userId, completedTopics, weakAreas, currentLevel } = req.body

    if (!isAIAvailable()) {
      return res.json({
        nextTopic: 'React Hooks',
        reason: 'Based on your progress, learning Hooks will help you write cleaner components',
        suggestedTasks: [
          { title: 'Build a Counter with useState', difficulty: 'easy' },
          { title: 'Fetch Data with useEffect', difficulty: 'medium' }
        ],
        estimatedTime: '2-3 days'
      })
    }

    const prompt = `User is at level ${currentLevel}, has completed: ${completedTopics?.join(', ') || 'no topics yet'}. Weak areas: ${weakAreas?.join(', ') || 'none identified'}. Recommend the next topic to study and why. Be encouraging and specific.`

    let aiResponse = null

    // Try Gemini first
    const geminiClient = getGemini()
    if (geminiClient) {
      try {
        const result = await geminiClient.generateContent(prompt)
        const response = await result.response
        aiResponse = response.text()
        console.log('✅ Gemini recommendation successful')
      } catch (geminiError) {
        console.log('⚠️ Gemini failed, trying OpenAI:', geminiError.message)
      }
    }

    // Try OpenAI if Gemini failed
    if (!aiResponse) {
      const openaiClient = getOpenAI()
      if (openaiClient) {
        try {
          const completion = await openaiClient.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are IdleLearn AI Coach. Provide personalized learning recommendations based on the user's progress. Be encouraging and specific."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            max_tokens: 200,
            temperature: 0.7,
          })
          aiResponse = completion.choices[0].message.content
          console.log('✅ OpenAI recommendation successful')
        } catch (openaiError) {
          console.log('⚠️ OpenAI also failed:', openaiError.message)
        }
      }
    }

    res.json({
      nextTopic: 'React Hooks',
      reason: aiResponse || 'Based on your progress, learning Hooks will help you write cleaner components',
      suggestedTasks: [
        { title: 'Build a Counter with useState', difficulty: 'easy' },
        { title: 'Fetch Data with useEffect', difficulty: 'medium' }
      ],
      estimatedTime: '2-3 days'
    })
  } catch (error) {
    console.error('AI Recommend Error:', error.message)
    
    res.json({
      nextTopic: 'React Hooks',
      reason: 'Based on your progress, learning Hooks will help you write cleaner components',
      suggestedTasks: [
        { title: 'Build a Counter with useState', difficulty: 'easy' },
        { title: 'Fetch Data with useEffect', difficulty: 'medium' }
      ],
      estimatedTime: '2-3 days'
    })
  }
})

// Get personalized hint
router.post('/hint', async (req, res) => {
  try {
    const { taskId, taskTitle, taskDescription, userCode, attemptNumber } = req.body

    const hintLevel = attemptNumber <= 2 ? 'gentle nudge' : 'detailed guidance'

    if (!isAIAvailable()) {
      return res.json({
        level: attemptNumber <= 2 ? 'gentle' : 'detailed',
        message: '💡 Try breaking down the problem into smaller steps. Start with the basic structure first, then add functionality piece by piece.',
        codeExample: attemptNumber > 3 ? '// Example: Start with a function that returns a simple value' : null
      })
    }

    const prompt = `You are an AI programming tutor. Provide a ${hintLevel} hint without giving away the full solution. Be encouraging.

Task: ${taskTitle}
Description: ${taskDescription}
User's attempt ${attemptNumber}.

User's code:
${userCode || 'No code yet'}

Provide a helpful hint.`

    let hintMessage = null

    // Try Gemini first
    const geminiClient = getGemini()
    if (geminiClient) {
      try {
        const result = await geminiClient.generateContent(prompt)
        const response = await result.response
        hintMessage = response.text()
        console.log('✅ Gemini hint generation successful')
      } catch (geminiError) {
        console.log('⚠️ Gemini failed, trying OpenAI:', geminiError.message)
      }
    }

    // Try OpenAI if Gemini failed
    if (!hintMessage) {
      const openaiClient = getOpenAI()
      if (openaiClient) {
        try {
          const completion = await openaiClient.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `You are an AI programming tutor. Provide a ${hintLevel} hint without giving away the full solution. Be encouraging.`
              },
              {
                role: "user",
                content: `Task: ${taskTitle}\nDescription: ${taskDescription}\nUser's attempt ${attemptNumber}.\n\nUser's code:\n${userCode || 'No code yet'}\n\nProvide a helpful hint.`
              }
            ],
            max_tokens: 150,
            temperature: 0.7,
          })
          hintMessage = completion.choices[0].message.content
          console.log('✅ OpenAI hint generation successful')
        } catch (openaiError) {
          console.log('⚠️ OpenAI also failed:', openaiError.message)
        }
      }
    }

    const hint = {
      level: attemptNumber <= 2 ? 'gentle' : 'detailed',
      message: hintMessage || '💡 Try breaking down the problem into smaller steps. Start with the basic structure first, then add functionality piece by piece.',
      codeExample: attemptNumber > 3 ? '// Consider this pattern: function example() { return result; }' : null
    }

    res.json(hint)
  } catch (error) {
    console.error('AI Hint Error:', error.message)
    
    res.json({
      level: req.body.attemptNumber <= 2 ? 'gentle' : 'detailed',
      message: '💡 Try breaking down the problem into smaller steps. Start with the basic structure first, then add functionality piece by piece.',
      codeExample: req.body.attemptNumber > 3 ? '// Example: Start with a function that returns a simple value' : null
    })
  }
})

// Chat with AI Coach
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    if (!isAIAvailable()) {
      // Enhanced smart fallback responses based on keywords
      const lowerMessage = message.toLowerCase()
      let response = ""
      
      // React/Hooks
      if (lowerMessage.includes('react') && lowerMessage.includes('hook')) {
        response = "React Hooks revolutionized functional components! 🎣\n\n**Start with these:**\n• **useState** - Manage component state\n• **useEffect** - Handle side effects (data fetching, subscriptions)\n• **useContext** - Share data without props drilling\n\nPractice tip: Build a todo app using useState and useEffect. This solidifies the concepts perfectly! 💪"
      } else if (lowerMessage.includes('react')) {
        response = `Hey Level ${context?.level || 1} learner! React is all about components and data flow. 🚀\n\n**Key concepts:**\n1. Components (functional preferred)\n2. Props for passing data\n3. State for managing changes\n4. JSX syntax\n\nStart small - build a greeting card component, then level up to dynamic lists. You've got ${context?.xp || 0} XP, keep going!`
      }
      // JavaScript
      else if (lowerMessage.includes('javascript') || lowerMessage.includes(' js ')) {
        response = "JavaScript powers the web! 💻\n\n**Master these fundamentals:**\n• Variables (let, const)\n• Functions & arrow functions\n• Arrays & Objects\n• Async/Await for promises\n• DOM manipulation\n\nDaily practice: Solve one coding challenge on freeCodeCamp. Your ${context?.streak || 0}-day streak is impressive! 🔥"
      }
      // CSS/Styling
      else if (lowerMessage.includes('css') || lowerMessage.includes('style') || lowerMessage.includes('design')) {
        response = "CSS makes websites beautiful! 🎨\n\n**Focus areas:**\n• Flexbox for 1D layouts\n• Grid for 2D layouts\n• Responsive design (media queries)\n• Animations & transitions\n\nPro tip: Recreate designs from Dribbble. It's the fastest way to level up your CSS skills!"
      }
      // Learning/Starting
      else if (lowerMessage.includes('learn') || lowerMessage.includes('start') || lowerMessage.includes('begin')) {
        response = `Perfect! Here's your roadmap: �️\n\n**Phase 1:** HTML/CSS basics (2 weeks)\n**Phase 2:** JavaScript fundamentals (3 weeks)\n**Phase 3:** React basics (2 weeks)\n**Phase 4:** Build projects! (ongoing)\n\nWith your ${context?.coins || 0} coins, unlock advanced tutorials in the Store. Consistency > Intensity! 📈`
      }
      // Help/Stuck
      else if (lowerMessage.includes('help') || lowerMessage.includes('stuck') || lowerMessage.includes('error')) {
        response = "Debugging is a superpower! 🦸\n\n**Try these steps:**\n1. Read the error message carefully\n2. console.log() everything\n3. Check syntax (missing brackets, semicolons)\n4. Google the exact error\n5. Take a 5-min break\n\nRemember: Every error teaches you something. You're at ${context?.xp || 0} XP - you've solved harder problems! 💪"
      }
      // Project ideas
      else if (lowerMessage.includes('project') || lowerMessage.includes('build') || lowerMessage.includes('create')) {
        response = "Let's build something cool! 🛠️\n\n**Project ideas for Level " + (context?.level || 1) + ":**\n• Todo App with local storage\n• Weather Dashboard (API integration)\n• Portfolio website\n• Quiz app with timer\n• Expense tracker\n\nPick what excites you! Passion = Better learning. Start coding now! 🚀"
      }
      // Specific topics
      else if (lowerMessage.includes('array') || lowerMessage.includes('loop')) {
        response = "Arrays & loops are fundamental! 📚\n\n**Master these:**\n• .map() - Transform arrays\n• .filter() - Select items\n• .reduce() - Combine values\n• for...of loops\n\nPractice: Take an array of numbers, filter evens, multiply by 2, sum them. One liner challenge! 😎"
      } else if (lowerMessage.includes('async') || lowerMessage.includes('promise') || lowerMessage.includes('api')) {
        response = "Async JavaScript unlocks real power! ⚡\n\n**Key concepts:**\n• Promises (then/catch)\n• async/await syntax\n• fetch() for APIs\n• Error handling\n\nPractice: Fetch data from JSONPlaceholder API and display it. This is essential for React! 🎯"
      } else if (lowerMessage.includes('component')) {
        response = "Components are React's building blocks! 🧱\n\n**Best practices:**\n• One component = One responsibility\n• Props for data in\n• State for data changes\n• Reusable & composable\n\nThink of components like LEGO blocks - small, reusable pieces that build something amazing! 🎨"
      }
      // General encouragement
      else {
        response = `Great question! 🌟\n\nYou're on a ${context?.streak || 0}-day streak with ${context?.xp || 0} XP - that's awesome! Keep that momentum going.\n\n**Quick tips:**\n• Code 30 min daily\n• Build projects, not just tutorials\n• Join coding communities\n• Debug = Learn faster\n\nCheck the Tasks page for challenges or Learning Paths for structured content. You've got this! 💪`
      }
      
      return res.json({
        response: response,
        timestamp: new Date(),
        fallback: true
      })
    }

    const systemPrompt = `You are IdleLearn AI Coach, a friendly and encouraging programming tutor. 

Context about the user:
- Current Level: ${context?.level || 1}
- XP: ${context?.xp || 0}
- Coins: ${context?.coins || 0}
- Streak: ${context?.streak || 0} days
- Current Topics: ${context?.topics?.join(', ') || 'Getting started'}

Guidelines:
- Be encouraging and supportive 🌟
- Provide clear, concise explanations
- Keep responses under 150 words
- Focus on practical, actionable advice
- Use emojis sparingly but effectively
- Suggest next steps for learning`

    let aiResponse = null

    // Try OpenAI first
    const openaiClient = getOpenAI()
    if (openaiClient) {
      try {
        const completion = await openaiClient.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          max_tokens: 200,
          temperature: 0.7,
        })
        aiResponse = completion.choices[0].message.content
        console.log('✅ OpenAI response successful')
      } catch (openaiError) {
        console.log('⚠️ OpenAI failed, trying Gemini:', openaiError.message)
      }
    }

    // Try Gemini if OpenAI failed
    if (!aiResponse) {
      const geminiClient = getGemini()
      if (geminiClient) {
        try {
          const prompt = `${systemPrompt}\n\nUser question: ${message}\n\nProvide a helpful, encouraging response in under 150 words.`
          const result = await geminiClient.generateContent(prompt)
          const response = await result.response
          aiResponse = response.text()
          console.log('✅ Gemini response successful')
        } catch (geminiError) {
          console.log('⚠️ Gemini also failed:', geminiError.message)
        }
      }
    }

    if (aiResponse) {
      return res.json({
        response: aiResponse,
        timestamp: new Date()
      })
    } else {
      throw new Error('No AI service available')
    }

  } catch (error) {
    console.error('AI Chat Error:', error.message)
    
    // Return smart fallback based on keywords even on error
    const lowerMessage = req.body.message?.toLowerCase() || ''
    let response = "I'm here to help! 🤖"
    
    if (lowerMessage.includes('react') || lowerMessage.includes('hook')) {
      response = "React Hooks are powerful! 🎣 Start with useState for managing state and useEffect for side effects. Practice by building a counter or todo app. Would you like me to suggest a specific hook to learn?"
    } else if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
      response = "JavaScript is the foundation of web development! 💻 Focus on: variables, functions, arrays, objects, and async/await. Try solving small coding challenges daily to build muscle memory."
    } else if (lowerMessage.includes('css') || lowerMessage.includes('style')) {
      response = "CSS brings your designs to life! 🎨 Master Flexbox and Grid for layouts, then explore animations. Recreate designs you like - it's the best way to learn!"
    } else if (lowerMessage.includes('learn') || lowerMessage.includes('start')) {
      response = "Start with the basics and build projects! 🚀 Follow this path: HTML/CSS → JavaScript fundamentals → React basics → Build a portfolio project. Consistency beats intensity!"
    } else if (lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
      response = "Feeling stuck is part of learning! 💪 Try: 1) Break the problem into smaller pieces 2) Console.log everything 3) Check the docs 4) Take a break and come back fresh. You've got this!"
    } else {
      response = "Great question! 🌟 Keep exploring and practicing. Check out the Tasks page for hands-on challenges. What specific topic would you like to dive into?"
    }
    
    res.json({
      response: response,
      timestamp: new Date(),
      fallback: true
    })
  }
})

// Get code feedback
router.post('/feedback', async (req, res) => {
  try {
    const { code, task } = req.body

    if (!isAIAvailable()) {
      return res.json({
        feedback: "Great effort on your code! 🌟 Focus on code readability and consider edge cases. Keep practicing - you're doing well!",
        timestamp: new Date(),
        fallback: true
      })
    }

    const prompt = `You are an AI code reviewer. Provide constructive feedback on: correctness, best practices, and improvements. Be encouraging and specific.

Task: ${task}

User's code:
${code}

Provide helpful feedback.`

    let feedback = null

    // Try Gemini first
    const geminiClient = getGemini()
    if (geminiClient) {
      try {
        const result = await geminiClient.generateContent(prompt)
        const response = await result.response
        feedback = response.text()
        console.log('✅ Gemini feedback generation successful')
      } catch (geminiError) {
        console.log('⚠️ Gemini failed, trying OpenAI:', geminiError.message)
      }
    }

    // Try OpenAI if Gemini failed
    if (!feedback) {
      const openaiClient = getOpenAI()
      if (openaiClient) {
        try {
          const completion = await openaiClient.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are an AI code reviewer. Provide constructive feedback on: correctness, best practices, and improvements. Be encouraging and specific."
              },
              {
                role: "user",
                content: `Task: ${task}\n\nUser's code:\n${code}\n\nProvide helpful feedback.`
              }
            ],
            max_tokens: 250,
            temperature: 0.7,
          })
          feedback = completion.choices[0].message.content
          console.log('✅ OpenAI feedback generation successful')
        } catch (openaiError) {
          console.log('⚠️ OpenAI also failed:', openaiError.message)
        }
      }
    }

    res.json({
      feedback: feedback || "Great effort on your code! 🌟 Focus on code readability and consider edge cases. Keep practicing - you're doing well!",
      timestamp: new Date()
    })

  } catch (error) {
    console.error('AI Feedback Error:', error.message)
    
    res.json({
      feedback: "Great effort on your code! 🌟 Focus on code readability and consider edge cases. Keep practicing - you're doing well!",
      timestamp: new Date(),
      fallback: true
    })
  }
})

export default router
