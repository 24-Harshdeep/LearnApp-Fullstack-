import mongoose from 'mongoose'
import dotenv from 'dotenv'
import LearningPath from './models/LearningPath.js'
import Task from './models/Task.js'
import { sampleModules, sampleTasks } from './seedData.js'

dotenv.config()

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing data
    await LearningPath.deleteMany({})
    await Task.deleteMany({})
    console.log('Cleared existing data')

    // Insert sample modules
    const modules = await LearningPath.insertMany(sampleModules)
    console.log(`Inserted ${modules.length} learning modules`)

    // Insert sample tasks
    const tasks = await Task.insertMany(sampleTasks)
    console.log(`Inserted ${tasks.length} tasks`)

    console.log('✅ Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
