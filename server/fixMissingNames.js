import mongoose from 'mongoose'
import User from './models/User.js'
import LMSUser from './models/LMSUser.js'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kamaljangid:Kamal%40123@cluster0.m1lrv3n.mongodb.net/learnflow?retryWrites=true&w=majority'

async function fixMissingNames() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB Connected')

    // Find all Users with missing names
    const usersWithoutNames = await User.find({ 
      $or: [
        { name: { $exists: false } },
        { name: null },
        { name: '' }
      ]
    })

    console.log(`\n📊 Found ${usersWithoutNames.length} users with missing names\n`)

    let fixed = 0
    let failed = 0

    for (const user of usersWithoutNames) {
      try {
        // Try to find corresponding LMSUser
        const lmsUser = await LMSUser.findOne({ email: user.email })
        
        if (lmsUser && lmsUser.name) {
          // Update with LMSUser name
          user.name = lmsUser.name
          await user.save()
          console.log(`✅ Fixed: ${user.email} -> ${lmsUser.name}`)
          fixed++
        } else if (user.email) {
          // Use email prefix as fallback name
          const fallbackName = user.email.split('@')[0].replace(/[._-]/g, ' ')
          user.name = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1)
          await user.save()
          console.log(`⚠️  Fallback: ${user.email} -> ${user.name}`)
          fixed++
        } else {
          console.log(`❌ Cannot fix: ${user._id} (no email or LMSUser)`)
          failed++
        }
      } catch (error) {
        console.error(`❌ Error fixing ${user.email}:`, error.message)
        failed++
      }
    }

    console.log(`\n📈 Summary:`)
    console.log(`   ✅ Fixed: ${fixed}`)
    console.log(`   ❌ Failed: ${failed}`)
    console.log(`   📊 Total: ${usersWithoutNames.length}\n`)

  } catch (error) {
    console.error('❌ Migration error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
    process.exit(0)
  }
}

fixMissingNames()
