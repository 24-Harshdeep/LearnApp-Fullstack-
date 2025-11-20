import mongoose from 'mongoose'
import Hackathon from './models/Hackathon.js'
import LMSUser from './models/LMSUser.js'

const MONGO_URI = 'mongodb+srv://Harshdeep_24:Harshdeep24@cluster0.m1lrv3n.mongodb.net/?appName=Cluster0'

async function fixTeamLeaders() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    const hackathons = await Hackathon.find()
    console.log(`Found ${hackathons.length} hackathons`)
    
    for (const hackathon of hackathons) {
      console.log(`\n📋 Hackathon: ${hackathon.title}`)
      console.log(`   Teams count: ${hackathon.teams.length}`)
      
      let updated = false
      
      for (const team of hackathon.teams) {
        console.log(`\n   🔍 Team: ${team.teamName}`)
        console.log(`      teamLeader: ${team.teamLeader}`)
        console.log(`      memberIds: ${JSON.stringify(team.memberIds)}`)
        console.log(`      memberIds length: ${team.memberIds?.length}`)
        
        // If teamLeader is null or missing, set it to the first memberIds
        if (!team.teamLeader && team.memberIds && team.memberIds.length > 0) {
          console.log(`   🔧 Fixing team: ${team.teamName}`)
          console.log(`      Setting leader to: ${team.memberIds[0]}`)
          
          team.teamLeader = team.memberIds[0]
          updated = true
        }
      }
      
      if (updated) {
        await hackathon.save()
        console.log(`✅ Updated hackathon: ${hackathon.title}`)
      }
    }
    
    console.log('\n🎉 All team leaders fixed!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixTeamLeaders()
