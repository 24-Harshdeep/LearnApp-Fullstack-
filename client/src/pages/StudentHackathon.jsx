import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  Calendar, 
  Users, 
  FileText, 
  Upload, 
  Plus, 
  X, 
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  Link as LinkIcon,
  Download,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react'

const API_URL = 'http://localhost:5000/api'

export default function StudentHackathon() {
  const [hackathons, setHackathons] = useState([])
  const [selectedHackathon, setSelectedHackathon] = useState(null)
  const [myTeam, setMyTeam] = useState(null)
  const [allTeams, setAllTeams] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)
  const [showTeamsView, setShowTeamsView] = useState(false)
  const [showEditTeam, setShowEditTeam] = useState(false)

  // Team creation state
  const [teamData, setTeamData] = useState({
    teamName: '',
    problemStatement: '',
    members: [''],
    memberEmails: ['']
  })

  // Submission state
  const [submissionData, setSubmissionData] = useState({
    submissionLink: '',
    submissionText: '',
    files: []
  })
  const [editingSubmission, setEditingSubmission] = useState(false)

  useEffect(() => {
    fetchHackathons()
  }, [])

  useEffect(() => {
    if (selectedHackathon) {
      // fetch teams first then authoritative my-team to avoid fallback race conditions
      ;(async () => {
        try {
          await fetchAllTeams()
          await fetchMyTeam()
        } catch (e) {
          console.error('Error syncing teams/myTeam on hackathon select:', e)
        }
      })()
    }
  }, [selectedHackathon])

  // Robust current user id parsing (support multiple shapes stored in localStorage)
  const getCurrentUserId = () => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem('lms_user') || localStorage.getItem('user') || localStorage.getItem('user_data')
      if (!raw) return null
      const parsed = JSON.parse(raw)
      // possible shapes: { _id }, { id }, { user: { _id } }, or just an id string
      const maybeId = parsed && (parsed._id || parsed.id || (parsed.user && (parsed.user._id || parsed.user.id)))
      if (maybeId) return maybeId.toString()
      if (typeof parsed === 'string') return parsed
      return null
    } catch (e) {
      console.error('❌ Error parsing current user id from localStorage:', e)
      return null
    }
  }

  const currentUserId = getCurrentUserId()

  console.log('🔍 DEBUG currentUserId:', currentUserId)
  console.log('🔍 DEBUG myTeam:', myTeam)
  console.log('🔍 DEBUG myTeam.teamLeader:', myTeam?.teamLeader)
  // current user email (used as a fallback when ids don't match due to mixed user models)
  const getCurrentUserEmail = () => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem('lms_user') || localStorage.getItem('user') || localStorage.getItem('user_data')
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return parsed?.email || (parsed?.user && parsed.user.email) || null
    } catch (e) {
      return null
    }
  }

  const currentUserEmail = getCurrentUserEmail()
  console.log('🔍 DEBUG currentUserEmail:', currentUserEmail)

  // whether current user is the team leader (robust to different leader shapes)
  const isLeader = (() => {
    try {
      if (!myTeam) return false
      const leader = myTeam.teamLeader
      const leaderEmailField = myTeam.teamLeaderEmail || myTeam.teamLeaderEmail === '' ? myTeam.teamLeaderEmail : null
      if (!leader) return false
      let leaderId = null
      if (typeof leader === 'string') leaderId = leader
      else if (leader._id) leaderId = leader._id
      else if (leader.id) leaderId = leader.id
      else if (leader.toString) leaderId = leader.toString()
      // If we have a leader id and currentUserId, compare by id
      if (leaderId && currentUserId) {
        const match = leaderId.toString() === currentUserId.toString()
        console.log('🔍 DEBUG leaderId:', leaderId, 'currentUserId:', currentUserId, 'match:', match)
        if (match) return true
      }

      // Fallback: compare by leader email field if available
      if (myTeam.teamLeaderEmail && currentUserEmail) {
        const emailMatch = myTeam.teamLeaderEmail.toLowerCase() === currentUserEmail.toLowerCase()
        console.log('🔍 DEBUG leaderEmail:', myTeam.teamLeaderEmail, 'currentUserEmail:', currentUserEmail, 'emailMatch:', emailMatch)
        return emailMatch
      }

      return false
    } catch (e) {
      console.error('❌ Error computing isLeader:', e)
      return false
    }
  })()

  console.log('🔍 DEBUG isLeader result:', isLeader)

  // whether current user is a member of the team (allow members to edit per new requirement)
  const isMember = (() => {
    try {
      if (!myTeam) return false
      // Check by memberIds (may be populated objects or raw ids)
      const memberIds = myTeam.memberIds || []
      if (memberIds && memberIds.length && currentUserId) {
        const found = memberIds.some(m => {
          if (!m) return false
          if (typeof m === 'string') return m.toString() === currentUserId.toString()
          if (m._id) return m._id.toString() === currentUserId.toString()
          if (m.id) return m.id.toString() === currentUserId.toString()
          return false
        })
        if (found) return true
      }

      // Fallback: check by memberEmails
      const emails = myTeam.memberEmails || []
      if (emails && emails.length && currentUserEmail) {
        const foundByEmail = emails.some(e => e && e.toLowerCase() === currentUserEmail.toLowerCase())
        if (foundByEmail) return true
      }

      return false
    } catch (e) {
      console.error('❌ Error computing isMember:', e)
      return false
    }
  })()

  console.log('🔍 DEBUG isMember result:', isMember)

  // Helper: compute display names for a team (handles memberIds populated/raw, memberEmails, or members)
  const getDisplayNamesForTeam = (team) => {
    try {
      if (!team) return []
      const displayNames = []

      if (team.memberIds && team.memberIds.length) {
        for (const m of team.memberIds) {
          if (!m) { displayNames.push('—'); continue }
          if (typeof m === 'string') {
            displayNames.push(m.includes('@') ? m.split('@')[0] : m)
          } else if (m.name) {
            displayNames.push(m.name)
          } else if (m.email) {
            displayNames.push(m.email.split('@')[0])
          } else {
            displayNames.push('—')
          }
        }
        return displayNames
      }

      if (team.memberEmails && team.memberEmails.length) {
        for (const e of team.memberEmails) displayNames.push(e ? e.split('@')[0] : '—')
        return displayNames
      }

      if (team.members && team.members.length) {
        for (const m of team.members) displayNames.push(m || '—')
        return displayNames
      }

      return []
    } catch (e) {
      console.error('Error building display names for team:', e)
      return []
    }
  }

  const fetchHackathons = async () => {
    try {
      setLoading(true)
  const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/hackathons?status=active`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHackathons(response.data.hackathons || [])
    } catch (error) {
      console.error('Error fetching hackathons:', error)
      toast.error('Failed to load hackathons')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyTeam = async () => {
    try {
      const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
      const response = await axios.get(
        `${API_URL}/hackathons/${selectedHackathon._id}/my-team`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      console.log('🔍 My team response:', response.data)
      // If backend returns a team use it
      if (response.data && response.data.team) {
        setMyTeam(response.data.team)
        return
      }

      // If backend says not in a team, try to find by email in allTeams (fallback)
      const lmsUser = localStorage.getItem('lms_user')
      const currentUserEmail = lmsUser ? JSON.parse(lmsUser).email : null
      if (currentUserEmail && allTeams && allTeams.length) {
        const userTeam = allTeams.find(t => t.memberEmails?.some(e => e?.toLowerCase() === currentUserEmail.toLowerCase()))
        if (userTeam) {
          console.log('✅ Fallback: found myTeam from allTeams by email:', userTeam.teamName)
          setMyTeam(userTeam)
          return
        }
      }

      // nothing found
      setMyTeam(null)
    } catch (error) {
      console.error('Error fetching team:', error)
      // If the backend call fails, try to find myTeam from allTeams (fallback)
      const lmsUser = localStorage.getItem('lms_user')
      if (lmsUser) {
        const currentUserEmail = JSON.parse(lmsUser).email
        const userTeam = allTeams.find(team => team.memberEmails?.some(e => e?.toLowerCase() === currentUserEmail.toLowerCase()))
        if (userTeam) {
          console.log('✅ Found user team from allTeams (on error):', userTeam)
          setMyTeam(userTeam)
        }
      }
    }
  }

  const fetchAllTeams = async () => {
    try {
      const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
      const lmsUser = localStorage.getItem('lms_user')
      const currentUserEmail = lmsUser ? JSON.parse(lmsUser).email : null
      
      console.log('🔍 Current user email:', currentUserEmail)
      
      const response = await axios.get(
        `${API_URL}/hackathons/${selectedHackathon._id}/teams`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      )
      
      console.log('📋 Raw teams from backend:', response.data.teams)
      
      // Mark which teams belong to the current user
      const teamsWithFlag = (response.data.teams || []).map(team => {
        const isMyTeam = currentUserEmail && team.memberEmails?.includes(currentUserEmail)
        console.log(`Team "${team.teamName}":`, {
          memberEmails: team.memberEmails,
          currentUserEmail,
          isMyTeam
        })
        return { ...team, isMyTeam }
      })
      
      setAllTeams(teamsWithFlag)

      // Also set myTeam if we find the user's team
      const userTeam = teamsWithFlag.find(team => team.isMyTeam)
      if (userTeam) {
        console.log('✅ Setting myTeam from allTeams:', userTeam.teamName)
        setMyTeam(userTeam)
      } else {
        console.log('❌ No team found for user')
        // don't aggressively clear myTeam here; leave it as-is so authoritative fetchMyTeam can decide
        // setMyTeam(null)
      }

      console.log('📋 All teams loaded with isMyTeam flags:', teamsWithFlag)

      return teamsWithFlag
    } catch (error) {
      console.error('Error fetching all teams:', error)
      return []
    }
  }

  const handleJoinHackathon = async (hackathon) => {
    try {
      const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
      await axios.post(
        `${API_URL}/hackathons/${hackathon._id}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      toast.success('Joined hackathon!')
      setSelectedHackathon(hackathon)
    } catch (error) {
      console.error('Error joining:', error)
      toast.error(error.response?.data?.message || 'Failed to join')
    }
  }

  const addMemberField = () => {
    setTeamData(prev => ({
      ...prev,
      members: [...prev.members, ''],
      memberEmails: [...prev.memberEmails, '']
    }))
  }

  const updateMember = (index, field, value) => {
    setTeamData(prev => {
      const newData = { ...prev }
      newData[field][index] = value
      return newData
    })
  }

  const removeMember = (index) => {
    setTeamData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
      memberEmails: prev.memberEmails.filter((_, i) => i !== index)
    }))
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault()

    if (!teamData.teamName) {
      toast.error('Team name is required')
      return
    }

    // Filter out empty member fields
    const validMembers = teamData.members.filter(m => m.trim())
    const validEmails = teamData.memberEmails.filter(e => e.trim())

    if (validMembers.length < selectedHackathon.minTeamSize) {
      toast.error(`Team must have at least ${selectedHackathon.minTeamSize} members`)
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/hackathons/${selectedHackathon._id}/team`,
        {
          teamName: teamData.teamName,
          problemStatement: teamData.problemStatement,
          members: validMembers,
          memberEmails: validEmails
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        toast.success('Team created successfully! 🎉')
        setShowCreateTeam(false)
        setTeamData({
          teamName: '',
          problemStatement: '',
          members: [''],
          memberEmails: ['']
        })
        fetchMyTeam()
        fetchAllTeams() // Refresh all teams list
      }
    } catch (error) {
      console.error('Error creating team:', error)
      console.error('Error details:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to create team')
    } finally {
      setLoading(false)
    }
  }

  const handleEditTeam = async () => {
    // Check if myTeam exists
    if (!myTeam) {
      // Try to re-sync teams from server before deciding
      toast('Syncing team data...')
      try {
        await fetchAllTeams()
        await fetchMyTeam()
      } catch (e) {
        console.error('Error syncing before edit:', e)
      }

      if (!myTeam) {
        toast.error('You need to create a team first!')
        return
      }
    }
    // Revalidate by fetching authoritative my-team from server. Allow members to edit (isMember) per new requirement.
    if (!isMember && !isLeader) {
      toast('Verifying leader status...')
      // Query authoritative endpoint directly to re-check leader (avoid relying on stale state)
      (async () => {
        try {
          const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
          const resp = await axios.get(`${API_URL}/hackathons/${selectedHackathon._id}/my-team`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const refreshedTeam = resp.data?.team || null

          const refreshedLeader = refreshedTeam?.teamLeader || null
          const refreshedLeaderEmailField = refreshedTeam?.teamLeaderEmail || null
          let refreshedLeaderId = null
          if (refreshedLeader) {
            if (typeof refreshedLeader === 'string') refreshedLeaderId = refreshedLeader
            else if (refreshedLeader._id) refreshedLeaderId = refreshedLeader._id
            else if (refreshedLeader.id) refreshedLeaderId = refreshedLeader.id
          }

          const idMatch = refreshedLeaderId && currentUserId && refreshedLeaderId.toString() === currentUserId.toString()
          const emailMatch = (refreshedLeader && refreshedLeader.email && currentUserEmail && refreshedLeader.email.toLowerCase() === currentUserEmail.toLowerCase()) || (refreshedLeaderEmailField && currentUserEmail && refreshedLeaderEmailField.toLowerCase() === currentUserEmail.toLowerCase())

          // Also allow if the refreshed team shows current user as a member
          const refreshedMemberIds = refreshedTeam?.memberIds || []
          const refreshedIsMember = refreshedMemberIds && refreshedMemberIds.some(m => {
            if (!m) return false
            if (typeof m === 'string') return m.toString() === currentUserId
            if (m._id) return m._id.toString() === currentUserId
            if (m.id) return m.id.toString() === currentUserId
            return false
          }) || (refreshedTeam?.memberEmails && currentUserEmail && refreshedTeam.memberEmails.some(e => e && e.toLowerCase() === currentUserEmail.toLowerCase()))

          if (idMatch || emailMatch || refreshedIsMember) {
            // populate form and open modal using refreshedTeam
            setTeamData({
              teamName: refreshedTeam.teamName,
              problemStatement: refreshedTeam.problemStatement,
              members: refreshedTeam.members || [''],
              memberEmails: refreshedTeam.memberEmails || ['']
            })
            setShowEditTeam(true)
            // update local myTeam state too
            setMyTeam(refreshedTeam)
            return
          }

          toast.error('Only a team member can edit this team')
        } catch (err) {
          console.error('Error re-validating leader status:', err)
          toast.error('Only a team member can edit this team')
        }
      })()
      return
    }
    
    // Populate form with existing team data
    setTeamData({
      teamName: myTeam.teamName,
      problemStatement: myTeam.problemStatement,
      members: myTeam.members || [''],
      memberEmails: myTeam.memberEmails || ['']
    })
    setShowEditTeam(true)
  }

  const handleUpdateTeam = async (e) => {
    e.preventDefault()

    if (!teamData.teamName) {
      toast.error('Team name is required')
      return
    }

    // Filter out empty member fields
    const validMembers = teamData.members.filter(m => m.trim())
    const validEmails = teamData.memberEmails.filter(e => e.trim())

    try {
      setLoading(true)
      const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
      const payload = {
        teamName: teamData.teamName,
        problemStatement: teamData.problemStatement,
        members: validMembers,
        memberEmails: validEmails
      }
      console.log('✏️ Updating team payload:', payload)
      const response = await axios.patch(
        `${API_URL}/hackathons/${selectedHackathon._id}/team/${myTeam._id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        toast.success('Team updated successfully! ✅')
        setShowEditTeam(false)
        fetchMyTeam()
        fetchAllTeams()
      }
    } catch (error) {
      console.error('Error updating team:', error)
      console.error('Error response:', error.response?.data)
      if (error.response?.status === 403) {
        toast.error(error.response?.data?.message || 'Only team leader can edit the team')
      } else {
        toast.error(error.response?.data?.message || 'Failed to update team')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
  const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
      const response = await axios.delete(
        `${API_URL}/hackathons/${selectedHackathon._id}/team/${myTeam._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        toast.success('Team deleted successfully')
        setMyTeam(null)
        fetchAllTeams()
      }
    } catch (error) {
      console.error('Error deleting team:', error)
      toast.error(error.response?.data?.message || 'Failed to delete team')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSubmissionData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }))
  }

  const removeFile = (index) => {
    setSubmissionData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!submissionData.submissionText && !submissionData.submissionLink && submissionData.files.length === 0) {
      toast.error('Please provide at least one: submission text, link, or file')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('lms_token') || localStorage.getItem('token')

      const formData = new FormData()
      formData.append('submissionLink', submissionData.submissionLink)
      formData.append('submissionText', submissionData.submissionText)

      submissionData.files.forEach(file => {
        formData.append('submissionFiles', file)
      })

      let response
      if (editingSubmission) {
        // Update existing submission (members allowed by backend)
        response = await axios.patch(
          `${API_URL}/hackathons/${selectedHackathon._id}/team/${myTeam._id}/submission`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        )
      } else {
        response = await axios.post(
          `${API_URL}/hackathons/${selectedHackathon._id}/team/${myTeam._id}/submit`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        )
      }

      if (response.data.success) {
        toast.success(editingSubmission ? 'Submission updated! ✅' : 'Submission successful! 🎉')
        setShowSubmit(false)
        setEditingSubmission(false)
        setSubmissionData({
          submissionLink: '',
          submissionText: '',
          files: []
        })
        fetchMyTeam()
        fetchAllTeams() // Refresh teams to show submission status
      }
    } catch (error) {
      console.error('Error submitting:', error)
      toast.error(error.response?.data?.message || 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Hackathon Sprint 🚀
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Join hackathons, form teams, and submit your innovative solutions
          </p>
        </motion.div>

        {!selectedHackathon ? (
          /* Hackathon List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : hackathons.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
                <p className="text-gray-500 dark:text-gray-400">No active hackathons available</p>
              </div>
            ) : (
              hackathons.map((hackathon) => (
                <motion.div
                  key={hackathon._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 cursor-pointer"
                  onClick={() => setSelectedHackathon(hackathon)}
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {hackathon.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        hackathon.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        hackathon.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {hackathon.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {hackathon.description}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline: {new Date(hackathon.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>Team: {hackathon.minTeamSize}-{hackathon.maxTeamSize} members</span>
                    </div>
                    {hackathon.topic && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <FileText className="w-4 h-4" />
                        <span>{hackathon.topic}</span>
                      </div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg"
                  >
                    View Details
                  </motion.button>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          /* Hackathon Details */
          <div className="space-y-6">
            <button
              onClick={() => {
                setSelectedHackathon(null)
                setMyTeam(null)
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline mb-4"
            >
              ← Back to Hackathons
            </button>

            {/* Hackathon Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedHackathon.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {selectedHackathon.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      Deadline: {new Date(selectedHackathon.deadline).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      Team: {selectedHackathon.minTeamSize}-{selectedHackathon.maxTeamSize} members
                    </span>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedHackathon.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  selectedHackathon.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedHackathon.difficulty}
                </span>
              </div>

              {/* Problem Statement */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Problem Statement
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedHackathon.problemStatement}
                </p>
              </div>

              {/* Challenge/Requirements */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Challenge & Requirements
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedHackathon.challenge}
                </p>
              </div>

              {/* Detailed Instructions */}
              {selectedHackathon.detailedInstructions && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Instructions
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedHackathon.detailedInstructions}
                  </p>
                </div>
              )}

              {/* Tasks */}
              {selectedHackathon.tasks && selectedHackathon.tasks.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Tasks Checklist
                  </h3>
                  <div className="space-y-3">
                    {selectedHackathon.tasks.map((task, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {task.taskTitle}
                            </span>
                            <span className="text-sm text-gray-500">({task.points} points)</span>
                            {task.isRequired && (
                              <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {task.taskDescription}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {selectedHackathon.resources && selectedHackathon.resources.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Learning Resources
                  </h3>
                  <div className="space-y-2">
                    {selectedHackathon.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="font-medium text-blue-600 dark:text-blue-400">
                            {resource.title}
                          </p>
                          {resource.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {resource.description}
                            </p>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {selectedHackathon.attachments && selectedHackathon.attachments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Attachments
                  </h3>
                  <div className="space-y-2">
                    {selectedHackathon.attachments.map((file, index) => (
                      <a
                        key={index}
                        href={`http://localhost:5000${file.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{file.fileName}</span>
                        <span className="text-xs text-gray-500">({file.fileType})</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission Requirements */}
              {selectedHackathon.submissionRequirements && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Submission Requirements
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedHackathon.submissionRequirements}
                  </p>
                </div>
              )}
            </motion.div>

            {/* All Teams/Groups Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  📋 All Teams ({allTeams.length})
                </h3>
                <div className="flex items-center gap-3">
                  {myTeam ? (
                    isMember ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEditTeam}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition shadow-lg flex items-center gap-2 font-bold"
                      >
                        <Edit className="w-5 h-5" />
                        EDIT MY TEAM
                      </motion.button>
                        ) : (
                      // Show a disabled-styled Edit button to communicate the action, but show a toast on click
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toast('Only a team member can edit this team')}
                        aria-disabled={true}
                        className="px-6 py-3 bg-gray-300 text-gray-600 rounded-lg transition shadow-inner flex items-center gap-2 font-semibold cursor-not-allowed"
                      >
                        <Edit className="w-5 h-5" />
                        EDIT MY TEAM
                      </motion.button>
                    )
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowCreateTeam(true)}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition shadow-lg flex items-center gap-2 font-bold"
                    >
                      <Plus className="w-5 h-5" />
                      CREATE TEAM
                    </motion.button>
                  )}
                  <button
                    onClick={fetchAllTeams}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>
              
              {allTeams.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No teams created yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allTeams.map((team) => (
                    <motion.div
                      key={team._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`relative p-6 rounded-xl border-2 transition-all ${
                        team.isMyTeam 
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-xl' 
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg'
                      }`}
                    >
                      {/* Your Team Badge */}
                      {team.isMyTeam && (
                        <div className="absolute -top-3 -right-3 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                          ⭐ YOUR TEAM
                        </div>
                      )}
                      
                      {/* Team Name */}
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 pr-8">
                        {team.teamName}
                      </h4>
                      
                      {/* Problem Statement */}
                      {team.problemStatement && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {team.problemStatement}
                        </p>
                      )}
                      
                      {/* Members */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Team Members ({(team.memberIds?.length || team.memberEmails?.length || team.members?.length || 0)})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {
                            (() => {
                              // build a list of display names from available fields
                              const displayNames = []
                              if (team.memberIds && team.memberIds.length) {
                                for (const m of team.memberIds) {
                                  if (!m) { displayNames.push('') ; continue }
                                  if (typeof m === 'string') {
                                    // string could be an email or id, try to show local part if email-like
                                    displayNames.push(m.includes('@') ? m.split('@')[0] : m)
                                  } else if (m.name) {
                                    displayNames.push(m.name)
                                  } else if (m.email) {
                                    displayNames.push(m.email.split('@')[0])
                                  } else {
                                    displayNames.push('')
                                  }
                                }
                              } else if (team.memberEmails && team.memberEmails.length) {
                                for (const e of team.memberEmails) {
                                  displayNames.push(e ? e.split('@')[0] : '')
                                }
                              } else if (team.members && team.members.length) {
                                for (const m of team.members) displayNames.push(m)
                              }

                              const toShow = displayNames.slice(0, 3)
                              return (
                                <>
                                  {toShow.map((name, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-md font-medium">
                                      {name || '—'}
                                    </span>
                                  ))}
                                  {displayNames.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-md font-medium">
                                      +{displayNames.length - 3} more
                                    </span>
                                  )}
                                </>
                              )
                            })()
                          }
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          team.status === 'graded' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          team.status === 'submitted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          team.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                        }`}>
                          {team.status === 'graded' ? '✅ Graded' :
                           team.status === 'submitted' ? '📤 Submitted' :
                           team.status === 'in_progress' ? '⏳ In Progress' :
                           '🆕 Not Started'}
                        </span>
                        
                        {team.status === 'graded' && team.score !== undefined && (
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {team.score}/100
                          </span>
                        )}
                      </div>
                      
                      {/* Edit Button - ONLY FOR YOUR TEAM IF LEADER */}
                      {team.isMyTeam && (() => {
                        const leader = team.teamLeader
                        const leaderId = leader && (leader._id ? leader._id : leader)
                        const teamIsLeader = leaderId && currentUserId && leaderId.toString() === currentUserId.toString()
                        // determine if current user is a member (allow members to edit)
                        const memberIds = team.memberIds || []
                        const teamIsMember = memberIds && memberIds.some(m => {
                          if (!m) return false
                          if (typeof m === 'string') return m.toString() === currentUserId
                          if (m._id) return m._id.toString() === currentUserId
                          if (m.id) return m.id.toString() === currentUserId
                          return false
                        }) || (team.memberEmails && currentUserEmail && team.memberEmails.some(e => e && e.toLowerCase() === currentUserEmail.toLowerCase()))
                        return (teamIsLeader || teamIsMember) ? (
                          <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditTeam()
                            }}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition shadow-lg flex items-center justify-center gap-3 text-base font-bold border-2 border-blue-400"
                          >
                            <Edit className="w-5 h-5" />
                            <span>EDIT TEAM</span>
                          </motion.button>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              toast('Only a team member can edit this team')
                            }}
                            aria-disabled={true}
                            className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center gap-2 text-sm font-medium cursor-not-allowed"
                          >
                            <Edit className="w-4 h-4" />
                            <span>EDIT TEAM</span>
                          </motion.button>
                        )
                      })()}
                      
                      {/* Submission Info */}
                      {(team.submittedFiles?.length > 0 || team.submissionLink) && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Submission received
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* My Team Status */}
            {myTeam ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {myTeam.teamName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {myTeam.problemStatement}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      myTeam.status === 'graded' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      myTeam.status === 'submitted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      myTeam.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                    }`}>
                      {myTeam.status.replace('_', ' ').toUpperCase()}
                    </span>
                    
                    {/* Edit and Delete buttons - allow any team member (not only leader) to edit/delete */}
                    {isMember ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleEditTeam}
                          className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition shadow-lg flex items-center gap-2"
                          title="Edit Team"
                        >
                          <Edit className="w-5 h-5" />
                          <span className="font-semibold">Edit</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleDeleteTeam}
                          className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition shadow-lg flex items-center gap-2"
                          title="Delete Team"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span className="font-semibold">Delete</span>
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => toast('Only a team member can edit this team')}
                          aria-disabled={true}
                          className="p-3 bg-gray-200 text-gray-600 rounded-lg transition shadow-inner flex items-center gap-2 cursor-not-allowed"
                          title="Edit Team (members only)"
                        >
                          <Edit className="w-5 h-5" />
                          <span className="font-semibold">Edit</span>
                        </button>
                        <button
                          onClick={() => toast('Only a team member can delete this team')}
                          aria-disabled={true}
                          className="p-3 bg-gray-200 text-gray-600 rounded-lg transition shadow-inner flex items-center gap-2 cursor-not-allowed"
                          title="Delete Team (members only)"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span className="font-semibold">Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Team Members */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Team Members
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {
                      (() => {
                        const names = getDisplayNamesForTeam(myTeam)
                        if (!names || names.length === 0) return <div className="text-sm text-gray-500">No members listed</div>
                        return names.map((displayName, idx) => (
                          <div key={idx} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                            {displayName}
                            {myTeam.memberEmails && myTeam.memberEmails[idx] && (
                              <span className="text-xs ml-2 opacity-75">({myTeam.memberEmails[idx]})</span>
                            )}
                          </div>
                        ))
                      })()
                    }
                  </div>
                </div>

                {/* Submission Status */}
                {myTeam.status === 'submitted' || myTeam.status === 'graded' ? (
                  <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Submission Received
                      </h4>
                    </div>
                    
                    {myTeam.submissionText && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description:
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">{myTeam.submissionText}</p>
                      </div>
                    )}

                    {myTeam.submissionLink && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Link:
                        </p>
                        <a
                          href={myTeam.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {myTeam.submissionLink}
                        </a>
                      </div>
                    )}

                    {myTeam.submittedFiles && myTeam.submittedFiles.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Submitted Files:
                        </p>
                        <div className="space-y-1">
                          {myTeam.submittedFiles.map((file, idx) => (
                            <a
                              key={idx}
                              href={`http://localhost:5000${file.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <FileText className="w-4 h-4" />
                              {file.fileName}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {myTeam.status === 'graded' && (
                      <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-4 mb-2">
                          <Award className="w-6 h-6 text-yellow-500" />
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            Score: {myTeam.score}/100
                          </span>
                        </div>
                        {myTeam.feedback && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Feedback:
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">{myTeam.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setEditingSubmission(false)
                        setShowSubmit(true)
                      }}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Submit Your Work
                    </motion.button>

                    {/* Allow members to edit their existing submission via the student UI */}
                    {isMember && myTeam.status === 'submitted' && (
                      <button
                        onClick={() => {
                          // Prefill submission modal with current submission data
                          setSubmissionData({
                            submissionLink: myTeam.submissionLink || '',
                            submissionText: myTeam.submissionText || '',
                            files: [] // existing files cannot be removed by students here; teacher retains that ability
                          })
                          setEditingSubmission(true)
                          setShowSubmit(true)
                        }}
                        className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition shadow-md flex items-center justify-center gap-2"
                      >
                        <Edit className="w-5 h-5" />
                        Edit Submission
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              /* Create Team */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
              >
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  You're Not in a Team Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Create or join a team to participate in this hackathon
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateTeam(true)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                >
                  <Users className="w-5 h-5" />
                  Create Team
                </motion.button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      <AnimatePresence>
        {showCreateTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateTeam(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Create Team
              </h3>

              <form onSubmit={handleCreateTeam} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={teamData.teamName}
                    onChange={(e) => setTeamData(prev => ({ ...prev, teamName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Problem Statement (Optional)
                  </label>
                  <textarea
                    value={teamData.problemStatement}
                    onChange={(e) => setTeamData(prev => ({ ...prev, problemStatement: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Your team's approach or specific problem focus"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Members
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Required: {selectedHackathon?.minTeamSize}-{selectedHackathon?.maxTeamSize} members
                  </p>
                  
                  <div className="space-y-3">
                    {teamData.members.map((member, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={member}
                          onChange={(e) => updateMember(index, 'members', e.target.value)}
                          placeholder="Member name"
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="email"
                          value={teamData.memberEmails[index]}
                          onChange={(e) => updateMember(index, 'memberEmails', e.target.value)}
                          placeholder="Member email"
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                        {teamData.members.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMember(index)}
                            className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {teamData.members.length < (selectedHackathon?.maxTeamSize || 4) && (
                    <button
                      type="button"
                      onClick={addMemberField}
                      className="mt-3 w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Member
                    </button>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateTeam(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Team'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Team Modal */}
      <AnimatePresence>
        {showEditTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditTeam(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Edit Team
              </h3>

              <form onSubmit={handleUpdateTeam} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={teamData.teamName}
                    onChange={(e) => setTeamData(prev => ({ ...prev, teamName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Problem Statement (Optional)
                  </label>
                  <textarea
                    value={teamData.problemStatement}
                    onChange={(e) => setTeamData(prev => ({ ...prev, problemStatement: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Your team's approach or specific problem focus"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Members
                  </label>
                  
                  <div className="space-y-3">
                    {teamData.members.map((member, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={member}
                          onChange={(e) => updateMember(index, 'members', e.target.value)}
                          placeholder="Member name"
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="email"
                          value={teamData.memberEmails[index]}
                          onChange={(e) => updateMember(index, 'memberEmails', e.target.value)}
                          placeholder="Member email"
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                        {teamData.members.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMember(index)}
                            className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {teamData.members.length < (selectedHackathon?.maxTeamSize || 4) && (
                    <button
                      type="button"
                      onClick={addMemberField}
                      className="mt-3 w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Member
                    </button>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditTeam(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Team'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSubmit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Submit Your Work
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Link (GitHub, Demo, etc.)
                  </label>
                  <input
                    type="url"
                    value={submissionData.submissionLink}
                    onChange={(e) => setSubmissionData(prev => ({ ...prev, submissionLink: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={submissionData.submissionText}
                    onChange={(e) => setSubmissionData(prev => ({ ...prev, submissionText: e.target.value }))}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your solution, approach, challenges faced, and outcomes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Upload className="w-5 h-5 inline mr-2" />
                    Upload Files
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  {submissionData.files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {submissionData.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSubmit(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    {loading ? (editingSubmission ? 'Updating...' : 'Submitting...') : (editingSubmission ? 'Update Submission' : 'Submit Work')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
