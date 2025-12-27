import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api, { BACKEND_ORIGIN } from '../services/api'
import toast from 'react-hot-toast'
import { 
  Calendar, 
  Users, 
  FileText, 
  Upload, 
  Plus, 
  X, 
  Save,
  Eye,
  Trash2,
  Award,
  CheckCircle,
  Clock
} from 'lucide-react'

// Use shared api instance (interceptor attaches Authorization)
const API_URL = BACKEND_ORIGIN + '/api'

export default function TeacherHackathon() {
  const [activeTab, setActiveTab] = useState('create') // 'create', 'manage', 'teams', 'submissions'
  const [hackathons, setHackathons] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedHackathon, setSelectedHackathon] = useState(null)
  const [allTeams, setAllTeams] = useState([])
  

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

  // Create hackathon form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemStatement: '',
    challenge: '',
    detailedInstructions: '',
    difficulty: 'medium',
    topic: '',
    startDate: '',
    endDate: '',
    deadline: '',
    maxParticipants: 100,
    maxTeamSize: 4,
    minTeamSize: 1,
    submissionRequirements: '',
    allowedFileTypes: ['pdf', 'zip', 'jpg', 'png', 'doc', 'docx']
  })

  const [tasks, setTasks] = useState([])
  const [resources, setResources] = useState([])
  const [attachments, setAttachments] = useState([])
  const [newTask, setNewTask] = useState({ taskTitle: '', taskDescription: '', points: 0, isRequired: true })
  const [newResource, setNewResource] = useState({ title: '', url: '', description: '' })

  useEffect(() => {
    if (activeTab === 'manage' || activeTab === 'submissions' || activeTab === 'teams') {
      fetchHackathons()
    }
  }, [activeTab])

  const fetchHackathons = async () => {
    try {
      setLoading(true)
      // Try both token types
      const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
      
      if (!token) {
        toast.error('Please login to view hackathons')
        return
      }
      
      const response = await api.get('/hackathons', { headers: { 'Content-Type': 'application/json' } })
      setHackathons(response.data.hackathons || [])
    } catch (error) {
      console.error('Error fetching hackathons:', error)
      toast.error(error.response?.data?.message || 'Failed to load hackathons')
    } finally {
      setLoading(false)
    }
  }

  const viewAllTeams = async (hackathon) => {
    try {
      const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
      const resp = await api.get(`/hackathons/${hackathon._id}`)
      const full = resp.data.hackathon || hackathon
      setSelectedHackathon(full)
      setAllTeams(full.teams || [])
      setActiveTab('teams')
    } catch (error) {
      console.error('Error fetching hackathon details for teams view:', error)
      // fallback to shallow data
      setSelectedHackathon(hackathon)
      setAllTeams(hackathon.teams || [])
      setActiveTab('teams')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const addTask = () => {
    if (newTask.taskTitle && newTask.taskDescription) {
      setTasks(prev => [...prev, { ...newTask }])
      setNewTask({ taskTitle: '', taskDescription: '', points: 0, isRequired: true })
    } else {
      toast.error('Task title and description are required')
    }
  }

  const removeTask = (index) => {
    setTasks(prev => prev.filter((_, i) => i !== index))
  }

  const addResource = () => {
    if (newResource.title && newResource.url) {
      setResources(prev => [...prev, { ...newResource }])
      setNewResource({ title: '', url: '', description: '' })
    } else {
      toast.error('Resource title and URL are required')
    }
  }

  const removeResource = (index) => {
    setResources(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.problemStatement || !formData.challenge || !formData.deadline) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      // Try both token types
      const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
      
      if (!token) {
        toast.error('Please login to create hackathon')
        return
      }

      const submitFormData = new FormData()
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key === 'allowedFileTypes') {
          submitFormData.append(key, JSON.stringify(formData[key]))
        } else {
          submitFormData.append(key, formData[key])
        }
      })

      // Add tasks and resources as JSON
      submitFormData.append('tasks', JSON.stringify(tasks))
      submitFormData.append('resources', JSON.stringify(resources))

      // Add file attachments
      attachments.forEach(file => {
        submitFormData.append('attachments', file)
      })

      console.log('📤 Submitting hackathon with token:', token ? 'Token exists' : 'No token')

      const response = await api.post('/hackathons/create', submitFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        toast.success('Hackathon created successfully! 🎉')
        // Reset form
        setFormData({
          title: '',
          description: '',
          problemStatement: '',
          challenge: '',
          detailedInstructions: '',
          difficulty: 'medium',
          topic: '',
          startDate: '',
          endDate: '',
          deadline: '',
          maxParticipants: 100,
          maxTeamSize: 4,
          minTeamSize: 1,
          submissionRequirements: '',
          allowedFileTypes: ['pdf', 'zip', 'jpg', 'png', 'doc', 'docx']
        })
        setTasks([])
        setResources([])
        setAttachments([])
        setActiveTab('manage')
      }
    } catch (error) {
      console.error('❌ Error creating hackathon:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to create hackathon. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  const viewSubmissions = async (hackathon) => {
    try {
      const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
      const response = await api.get(`/hackathons/${hackathon._id}/submissions`)
      // also fetch full hackathon details so teams have populated member info
      let fullHackathon = hackathon
      try {
  const det = await api.get(`/hackathons/${hackathon._id}`)
        fullHackathon = det.data.hackathon || hackathon
      } catch (err) {
        console.warn('Failed to fetch full hackathon details, continuing with shallow data')
      }

      setSelectedHackathon({ ...fullHackathon, submissions: response.data.submissions })
      setActiveTab('submissions')
    } catch (error) {
      console.error('Error fetching submissions:', error)
      toast.error('Failed to load submissions')
    }
  }



  const gradeSubmission = async (hackathonId, teamId, score, feedback) => {
    try {
      const token = localStorage.getItem('lms_token') || localStorage.getItem('token')
      await api.post(`/hackathons/${hackathonId}/team/${teamId}/grade`, { score, feedback })
      toast.success('Graded successfully!')
      viewSubmissions(selectedHackathon)
    } catch (error) {
      console.error('Error grading:', error)
      toast.error('Failed to grade submission')
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
            Create and manage hackathons for your students
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          {['create', 'manage', 'teams', 'submissions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'create' && '➕ Create'}
              {tab === 'manage' && '📋 Manage'}
              {tab === 'teams' && '👥 View Teams'}
              {tab === 'submissions' && '📝 Submissions'}
            </button>
          ))}
        </div>

        {/* Create Tab */}
        {activeTab === 'create' && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Create New Hackathon
            </h2>

            {/* Basic Info */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Topic
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Web Development, AI, Mobile Apps"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief overview of the hackathon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Problem Statement *
                </label>
                <textarea
                  name="problemStatement"
                  value={formData.problemStatement}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="What problem should students solve?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Challenge/Requirements *
                </label>
                <textarea
                  name="challenge"
                  value={formData.challenge}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Specific requirements and constraints"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detailed Instructions
                </label>
                <textarea
                  name="detailedInstructions"
                  value={formData.detailedInstructions}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Step-by-step instructions, expectations, grading criteria..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Submission Requirements
                </label>
                <textarea
                  name="submissionRequirements"
                  value={formData.submissionRequirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="What should students submit? (files, links, documentation...)"
                />
              </div>

              {/* Tasks Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tasks/Checklist
                </h3>
                <div className="space-y-4 mb-4">
                  {tasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">{task.taskTitle}</span>
                          <span className="text-sm text-gray-500">({task.points} points)</span>
                          {task.isRequired && (
                            <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">Required</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{task.taskDescription}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <input
                    type="text"
                    value={newTask.taskTitle}
                    onChange={(e) => setNewTask(prev => ({ ...prev, taskTitle: e.target.value }))}
                    placeholder="Task title"
                    className="md:col-span-4 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={newTask.taskDescription}
                    onChange={(e) => setNewTask(prev => ({ ...prev, taskDescription: e.target.value }))}
                    placeholder="Task description"
                    className="md:col-span-5 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="number"
                    value={newTask.points}
                    onChange={(e) => setNewTask(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    placeholder="Points"
                    className="md:col-span-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addTask}
                    className="md:col-span-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Resources Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Learning Resources
                </h3>
                <div className="space-y-3 mb-4">
                  {resources.map((resource, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex-1">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                          {resource.title}
                        </a>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{resource.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeResource(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <input
                    type="text"
                    value={newResource.title}
                    onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Resource title"
                    className="md:col-span-4 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="url"
                    value={newResource.url}
                    onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="URL"
                    className="md:col-span-4 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={newResource.description}
                    onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description"
                    className="md:col-span-3 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addResource}
                    className="md:col-span-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* File Attachments */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Upload className="w-5 h-5 inline mr-2" />
                  Attachments (PDFs, images, documents, etc.)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Team Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Team Size
                  </label>
                  <input
                    type="number"
                    name="minTeamSize"
                    value={formData.minTeamSize}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Team Size
                  </label>
                  <input
                    type="number"
                    name="maxTeamSize"
                    value={formData.maxTeamSize}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Creating...' : 'Create Hackathon'}
              </motion.button>
            </div>
          </motion.form>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : hackathons.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
                <p className="text-gray-500 dark:text-gray-400">No hackathons yet. Create one to get started!</p>
              </div>
            ) : (
              hackathons.map((hackathon) => (
                <div key={hackathon._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {hackathon.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">{hackathon.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(hackathon.deadline).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          {hackathon.teams?.length || 0} teams
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          hackathon.status === 'active' ? 'bg-green-100 text-green-700' :
                          hackathon.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {hackathon.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => viewAllTeams(hackathon)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        View Teams
                      </button>
                      <button
                        onClick={() => viewSubmissions(hackathon)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Submissions
                      </button>
                    </div>
                  </div>

                  {hackathon.tasks && hackathon.tasks.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tasks:</h4>
                      <ul className="space-y-1">
                        {hackathon.tasks.map((task, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                            • {task.taskTitle} ({task.points} points)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && selectedHackathon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Teams for: {selectedHackathon.title}
              </h2>
              <button
                onClick={() => setActiveTab('manage')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                ← Back to Manage
              </button>
            </div>

            {allTeams.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No teams registered yet
              </p>
            ) : (
              <div className="space-y-6">
                {allTeams.map((team) => (
                  <div key={team._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {team.teamName}
                        </h3>
                        
                        {team.problemStatement && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <span className="font-semibold">Problem Focus:</span> {team.problemStatement}
                          </p>
                        )}

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Team Members ({(team.memberIds?.length || team.memberEmails?.length || team.members?.length || 0)}):
                          </p>
                          <ul className="space-y-1">
                            {(() => {
                              const names = getDisplayNamesForTeam(team)
                              return names.map((displayName, idx) => (
                                <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  <span className="font-medium">{displayName}</span>
                                  {team.memberEmails && team.memberEmails[idx] && (
                                    <span className="text-gray-500">({team.memberEmails[idx]})</span>
                                  )}
                                </li>
                              ))
                            })()}
                          </ul>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            Created: {new Date(team.createdAt).toLocaleDateString()}
                          </span>
                          {team.leader && (
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <Award className="w-4 h-4" />
                              Leader: {team.leader.username || team.leader.email}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        team.status === 'submitted' ? 'bg-green-100 text-green-700' :
                        team.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        team.status === 'graded' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {team.status?.replace('_', ' ').toUpperCase() || 'REGISTERED'}
                      </span>
                    </div>

                    {team.submissionText && (
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Submission Preview:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{team.submissionText}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && selectedHackathon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Submissions for: {selectedHackathon.title}
            </h2>

            {selectedHackathon.submissions?.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No submissions yet
              </p>
            ) : (
              <div className="space-y-6">
                {selectedHackathon.submissions?.map((team) => (
                  <div key={team._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {team.teamName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Members: {getDisplayNamesForTeam(team).join(', ')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Submitted: {new Date(team.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        team.status === 'graded' ? 'bg-green-100 text-green-700' :
                        team.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {team.status}
                      </span>
                    </div>

                    {/* Submission preview (teachers: read-only presentation) */}
                    <>
                      {team.submissionText && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Submission:</p>
                          <p className="text-gray-600 dark:text-gray-400">{team.submissionText}</p>
                        </div>
                      )}

                      {team.submissionLink && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link:</p>
                          <a href={team.submissionLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                            {team.submissionLink}
                          </a>
                        </div>
                      )}

                      {team.submittedFiles && team.submittedFiles.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Files:</p>
                          <div className="space-y-2">
                            {team.submittedFiles.map((file, idx) => (
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

                      {team.status === 'graded' && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Score: {team.score}/100
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Feedback: {team.feedback}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        {/* Teachers can grade here; editing submissions moved to student dashboard */}
                        {team.status !== 'graded' && (
                          <div className="flex gap-4">
                            <input
                              type="number"
                              placeholder="Score (0-100)"
                              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              id={`score-${team._id}`}
                              min="0"
                              max="100"
                            />
                            <input
                              type="text"
                              placeholder="Feedback"
                              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              id={`feedback-${team._id}`}
                            />
                            <button
                              onClick={() => {
                                const score = document.getElementById(`score-${team._id}`).value
                                const feedback = document.getElementById(`feedback-${team._id}`).value
                                if (score && feedback) {
                                  gradeSubmission(selectedHackathon._id, team._id, parseInt(score), feedback)
                                } else {
                                  toast.error('Please provide score and feedback')
                                }
                              }}
                              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                            >
                              <Award className="w-4 h-4" />
                              Grade
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
