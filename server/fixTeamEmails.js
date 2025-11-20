import mongoose from 'mongoose'
import Hackathon from './models/Hackathon.js'
import LMSUser from './models/LMSUser.js'
import User from './models/User.js'

const MONGO_URI = 'mongodb+srv://Harshdeep_24:Harshdeep24@cluster0.m1lrv3n.mongodb.net/?appName=Cluster0'

async function fixTeamEmails() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    const hackathons = await Hackathon.find()
    
    for (const hackathon of hackathons) {
      let updated = false
      
      for (const team of hackathon.teams) {
        // If memberEmails is empty or missing, populate it from memberIds
        if (!team.memberEmails || team.memberEmails.length === 0) {
          console.log(`\n🔧 Fixing team: ${team.teamName}`)
          console.log(`   Team has ${team.memberIds.length} members but ${team.memberEmails?.length || 0} emails`)
          
          // Fetch user emails for each memberIds
          const emails = []
          for (const memberId of team.memberIds) {
            // Try LMSUser first
            let user = await LMSUser.findById(memberId)
            if (!user) {
              // Try regular User
              user = await User.findById(memberId)
            }
            
            if (user && user.email) {
              emails.push(user.email)
              console.log(`   ✓ Added email: ${user.email}`)
            }
          }
          
          team.memberEmails = emails
          updated = true
        }
      }
      
      if (updated) {
        await hackathon.save()
        console.log(`✅ Updated hackathon: ${hackathon.title}`)
      }
    }
    
    console.log('\n🎉 All teams fixed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixTeamEmails()
