import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Hackathon from './models/Hackathon.js'
import CodeChain from './models/CodeChain.js'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from the correct path
dotenv.config({ path: join(__dirname, '.env') })

// Sample hackathons
const sampleHackathons = [
  {
    title: "React Component Challenge",
    description: "Build a responsive card component with animations",
    challenge: "Create a Card component that displays user information with hover animations and responsive design. Must include: avatar, name, bio, and social links.",
    difficulty: "medium",
    topic: "React",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    status: "active",
    maxParticipants: 50,
    rewards: {
      firstPlace: { coins: 200, xp: 500, badge: "React Master" },
      secondPlace: { coins: 150, xp: 350 },
      thirdPlace: { coins: 100, xp: 250 },
      participation: { coins: 50, xp: 100 }
    }
  },
  {
    title: "Algorithm Sprint: Array Masters",
    description: "Solve complex array manipulation problems",
    challenge: "Implement a function that rotates a 2D array 90 degrees clockwise without using extra space. Optimize for O(n) time complexity.",
    difficulty: "hard",
    topic: "Algorithms",
    startDate: new Date(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    status: "active",
    maxParticipants: 100,
    rewards: {
      firstPlace: { coins: 300, xp: 750, badge: "Algorithm Wizard" },
      secondPlace: { coins: 200, xp: 500 },
      thirdPlace: { coins: 150, xp: 350 },
      participation: { coins: 75, xp: 150 }
    }
  },
  {
    title: "CSS Art Challenge",
    description: "Create stunning visuals using only CSS",
    challenge: "Build a pure CSS animated logo for 'IdleLearn' without using images. Must be responsive and include smooth animations.",
    difficulty: "easy",
    topic: "CSS",
    startDate: new Date(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    status: "active",
    maxParticipants: 75,
    rewards: {
      firstPlace: { coins: 150, xp: 400, badge: "CSS Artist" },
      secondPlace: { coins: 100, xp: 250 },
      thirdPlace: { coins: 75, xp: 175 },
      participation: { coins: 40, xp: 80 }
    }
  }
]

// Sample code chains
const sampleCodeChains = [
  {
    title: "Build a Todo List Together",
    challenge: "Collaborate to create a functional Todo List application",
    description: "Each player adds one line of code to build the app",
    topic: "JavaScript",
    difficulty: "easy",
    maxPlayers: 5,
    rewards: {
      perPlayer: { coins: 40, xp: 100 }
    },
    status: "waiting"
  },
  {
    title: "API Endpoint Chain",
    challenge: "Create a REST API endpoint for user authentication",
    description: "Team up to build Express.js authentication logic",
    topic: "Node.js",
    difficulty: "medium",
    maxPlayers: 4,
    rewards: {
      perPlayer: { coins: 60, xp: 150 }
    },
    status: "waiting"
  },
  {
    title: "React Hook Collaboration",
    challenge: "Build a custom React Hook together",
    description: "Each player contributes to a useLocalStorage custom hook",
    topic: "React",
    difficulty: "medium",
    maxPlayers: 3,
    rewards: {
      perPlayer: { coins: 50, xp: 125 }
    },
    status: "waiting"
  }
]

async function seedSocialGames() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('📦 Connected to MongoDB')

    // Clear existing data
    await Hackathon.deleteMany({})
    await CodeChain.deleteMany({})
    console.log('🗑️  Cleared existing social gaming data')

    // Insert hackathons
    const hackathons = await Hackathon.insertMany(sampleHackathons)
    console.log(`✅ Added ${hackathons.length} hackathons`)

    // Insert code chains
    const codeChains = await CodeChain.insertMany(sampleCodeChains)
    console.log(`✅ Added ${codeChains.length} code chains`)

    console.log('\n🎉 Social gaming data seeded successfully!')
    console.log('\nData Summary:')
    console.log(`📊 Hackathons: ${hackathons.length}`)
    console.log(`🔗 Code Chains: ${codeChains.length}`)
    
    mongoose.connection.close()
    console.log('\n✅ Database connection closed')
    
  } catch (error) {
    console.error('❌ Error seeding social games:', error)
    process.exit(1)
  }
}

// Run seeder
seedSocialGames()
