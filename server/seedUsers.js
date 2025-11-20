import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'
import LMSUser from './models/LMSUser.js'
import bcrypt from 'bcryptjs'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnapp'

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if users already exist
    const existingUsers = await User.countDocuments()
    const existingLMSUsers = await LMSUser.countDocuments()

    console.log(`Found ${existingUsers} regular users and ${existingLMSUsers} LMS users`)

    // If there are already users, just update them with new fields
    if (existingUsers > 0) {
      const users = await User.find()
      for (const user of users) {
        if (!user.progress) {
          user.progress = {
            html: Math.floor(Math.random() * 100),
            css: Math.floor(Math.random() * 100),
            javascript: Math.floor(Math.random() * 100),
            react: Math.floor(Math.random() * 100),
            nodejs: Math.floor(Math.random() * 100),
            typescript: Math.floor(Math.random() * 100)
          }
        }
        if (!user.confidenceIndex) {
          user.confidenceIndex = Math.floor(Math.random() * 50) + 40
        }
        if (!user.role) {
          user.role = 'student'
        }
        if (!user.lastActive) {
          user.lastActive = new Date()
        }
        await user.save()
      }
      console.log(`✅ Updated ${users.length} existing users with new fields`)
    }

    // Sync LMS users with regular users
    if (existingLMSUsers > 0) {
      const lmsUsers = await LMSUser.find()
      for (const lmsUser of lmsUsers) {
        let regularUser = await User.findOne({ email: lmsUser.email })
        
        if (!regularUser) {
          // Create a regular user from LMS user
          regularUser = new User({
            name: lmsUser.name,
            email: lmsUser.email,
            password: lmsUser.password, // Already hashed
            xp: lmsUser.points || 0,
            level: Math.floor((lmsUser.points || 0) / 100) + 1,
            role: lmsUser.role || 'student',
            progress: {
              html: Math.floor(Math.random() * 100),
              css: Math.floor(Math.random() * 100),
              javascript: Math.floor(Math.random() * 100),
              react: Math.floor(Math.random() * 100),
              nodejs: Math.floor(Math.random() * 100),
              typescript: Math.floor(Math.random() * 100)
            },
            confidenceIndex: Math.floor(Math.random() * 50) + 40,
            lastActive: new Date()
          })
          await regularUser.save()
          console.log(`✅ Created regular user for ${lmsUser.email}`)
        } else {
          // Sync XP from LMS points
          regularUser.xp = lmsUser.points || regularUser.xp
          regularUser.level = Math.floor((lmsUser.points || 0) / 100) + 1
          regularUser.role = lmsUser.role || regularUser.role
          regularUser.lastActive = new Date()
          await regularUser.save()
          console.log(`✅ Synced ${lmsUser.email}`)
        }
      }
    }

    // Create sample users if none exist
    if (existingUsers === 0 && existingLMSUsers === 0) {
      console.log('Creating sample users...')
      
      const hashedPassword = await bcrypt.hash('password123', 10)
      
      const sampleUsers = [
        {
          name: 'Alex Johnson',
          email: 'alex@example.com',
          password: hashedPassword,
          xp: 1250,
          level: 13,
          role: 'student',
          streak: { currentStreak: 7, longestStreak: 15 },
          progress: { html: 95, css: 88, javascript: 92, react: 75, nodejs: 60, typescript: 55 },
          confidenceIndex: 85,
          badges: [
            { name: 'First Steps', icon: '👣', earned: true },
            { name: 'Week Warrior', icon: '🔥', earned: true }
          ],
          lastActive: new Date()
        },
        {
          name: 'Sarah Chen',
          email: 'sarah@example.com',
          password: hashedPassword,
          xp: 1180,
          level: 12,
          role: 'student',
          streak: { currentStreak: 12, longestStreak: 20 },
          progress: { html: 100, css: 95, javascript: 88, react: 80, nodejs: 70, typescript: 65 },
          confidenceIndex: 90,
          badges: [
            { name: 'First Steps', icon: '👣', earned: true },
            { name: 'Code Master', icon: '⚡', earned: true }
          ],
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          name: 'Mike Rodriguez',
          email: 'mike@example.com',
          password: hashedPassword,
          xp: 980,
          level: 10,
          role: 'student',
          streak: { currentStreak: 3, longestStreak: 8 },
          progress: { html: 80, css: 75, javascript: 70, react: 50, nodejs: 45, typescript: 30 },
          confidenceIndex: 65,
          badges: [{ name: 'First Steps', icon: '👣', earned: true }],
          lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
        },
        {
          name: 'Emma Davis',
          email: 'emma@example.com',
          password: hashedPassword,
          xp: 920,
          level: 9,
          role: 'student',
          streak: { currentStreak: 5, longestStreak: 10 },
          progress: { html: 85, css: 80, javascript: 75, react: 60, nodejs: 55, typescript: 40 },
          confidenceIndex: 70,
          badges: [
            { name: 'First Steps', icon: '👣', earned: true },
            { name: 'Night Owl', icon: '🦉', earned: true }
          ],
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          name: 'Teacher One',
          email: 'teacher@example.com',
          password: hashedPassword,
          xp: 500,
          level: 5,
          role: 'teacher',
          streak: { currentStreak: 1, longestStreak: 5 },
          progress: { html: 100, css: 100, javascript: 100, react: 100, nodejs: 100, typescript: 90 },
          confidenceIndex: 95,
          badges: [{ name: 'Mentor', icon: '👨‍🏫', earned: true }],
          lastActive: new Date()
        }
      ]

      for (const userData of sampleUsers) {
        const user = new User(userData)
        await user.save()
        console.log(`✅ Created user: ${user.name}`)
      }

      console.log(`\n✅ Successfully seeded ${sampleUsers.length} users!`)
    }

    const finalCount = await User.countDocuments()
    console.log(`\n📊 Total users in database: ${finalCount}`)
    
    mongoose.connection.close()
  } catch (error) {
    console.error('Error seeding users:', error)
    process.exit(1)
  }
}

seedUsers()
