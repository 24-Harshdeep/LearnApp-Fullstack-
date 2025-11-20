import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { lmsClassAPI, lmsAssignmentAPI, lmsSubmissionAPI } from '../services/lmsAPI'
import { FaPlus, FaUsers, FaCopy, FaChartLine, FaSignOutAlt, FaCode } from 'react-icons/fa'
import { signOut, auth } from '../services/firebase'

const TeacherDashboard = () => {
  const [user, setUser] = useState(null)
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()

  // Modals
  const [showCreateClass, setShowCreateClass] = useState(false)
  const [showCreateAssignment, setShowCreateAssignment] = useState(false)
  const [showGrading, setShowGrading] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)

  // Form states
  const [className, setClassName] = useState('')
  const [classDescription, setClassDescription] = useState('')
  const [assignmentTitle, setAssignmentTitle] = useState('')
  const [assignmentDescription, setAssignmentDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [feedback, setFeedback] = useState('')
  const [points, setPoints] = useState(0)

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('lms_user'))
    if (!userData || userData.role !== 'teacher') {
      navigate('/lms/login')
      return
    }
    setUser(userData)
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      const response = await lmsClassAPI.getAll()
      setClasses(response.data)
    } catch (error) {
      console.error('Load classes error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClass = async (e) => {
    e.preventDefault()
    try {
      await lmsClassAPI.create({
        className,
        description: classDescription
      })
      setShowCreateClass(false)
      setClassName('')
      setClassDescription('')
      loadClasses()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create class')
    }
  }

  const handleSelectClass = async (classId) => {
    try {
      const classResponse = await lmsClassAPI.getOne(classId)
      setSelectedClass(classResponse.data)
      
      const assignmentsResponse = await lmsAssignmentAPI.getByClass(classId)
      setAssignments(assignmentsResponse.data)
      
      setActiveTab('details')
    } catch (error) {
      console.error('Load class error:', error)
    }
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    if (!selectedClass) return
    
    try {
      await lmsAssignmentAPI.create({
        classId: selectedClass._id,
        title: assignmentTitle,
        description: assignmentDescription,
        dueDate: new Date(dueDate)
      })
      setShowCreateAssignment(false)
      setAssignmentTitle('')
      setAssignmentDescription('')
      setDueDate('')
      handleSelectClass(selectedClass._id)
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create assignment')
    }
  }

  const handleViewSubmissions = async (assignmentId) => {
    try {
      const response = await lmsSubmissionAPI.getByAssignment(assignmentId)
      setSubmissions(response.data)
      setActiveTab('feedback')
    } catch (error) {
      console.error('Load submissions error:', error)
    }
  }

  const handleGradeSubmission = async (submission) => {
    setSelectedSubmission(submission)
    setFeedback(submission.feedback || '')
    setPoints(submission.points || 0)
    setShowGrading(true)
  }

  const submitGrade = async (e) => {
    e.preventDefault()
    try {
      await lmsSubmissionAPI.grade(selectedSubmission._id, {
        feedback,
        points: Number(points)
      })
      setShowGrading(false)
      alert('Grade submitted successfully!')
      // Reload submissions
      if (selectedClass) {
        handleSelectClass(selectedClass._id)
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit grade')
    }
  }

  const copyJoinCode = (code) => {
    navigator.clipboard.writeText(code)
    alert(`Join code ${code} copied to clipboard!`)
  }

  const handleLogout = async () => {
    await signOut(auth)
    localStorage.removeItem('lms_token')
    localStorage.removeItem('lms_user')
    navigate('/lms/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
            <p className="text-blue-100">Welcome back, {user?.name}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-100">Total Classes</p>
              <p className="text-2xl font-bold">{classes.length}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-4 flex space-x-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          {selectedClass && (
            <>
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Class Details
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === 'feedback' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Feedback Panel
              </button>
            </>
          )}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">My Classes</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateClass(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FaPlus />
                <span>Create New Class</span>
              </motion.button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <motion.div
                  key={cls._id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer"
                  onClick={() => handleSelectClass(cls._id)}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{cls.className}</h3>
                  <p className="text-gray-600 text-sm mb-4">{cls.description || 'No description'}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <FaUsers />
                      <span>{cls.students?.length || 0} students</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <FaCode />
                      <span>{cls.assignments?.length || 0} tasks</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Join Code</p>
                      <p className="text-xl font-bold text-blue-600">{cls.joinCode}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyJoinCode(cls.joinCode)
                      }}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </motion.div>
              ))}

              {classes.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 mb-4">No classes yet. Create your first class to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Class Details Tab */}
        {activeTab === 'details' && selectedClass && (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedClass.className}</h2>
              <p className="text-gray-600 mb-4">{selectedClass.description}</p>
              <div className="flex space-x-6">
                <div className="flex items-center space-x-2 text-gray-700">
                  <FaUsers className="text-blue-600" />
                  <span>{selectedClass.students?.length || 0} Students</span>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-sm text-gray-600">Join Code: </span>
                  <span className="text-lg font-bold text-blue-600">{selectedClass.joinCode}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Assignments</h3>
              <button
                onClick={() => setShowCreateAssignment(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FaPlus />
                <span>New Assignment</span>
              </button>
            </div>

            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{assignment.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{assignment.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {assignment.submissions?.length || 0} submissions
                    </span>
                    <button
                      onClick={() => handleViewSubmissions(assignment._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Submissions
                    </button>
                  </div>
                </div>
              ))}

              {assignments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No assignments yet. Create one to get started!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback Panel Tab */}
        {activeTab === 'feedback' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Submissions</h2>
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">
                        {submission.studentId?.name || 'Unknown Student'}
                      </h4>
                      <p className="text-sm text-gray-600">{submission.studentId?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        submission.status === 'reviewed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {submission.status === 'reviewed' ? `Graded: ${submission.points}/100` : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-60 overflow-y-auto">
                    <p className="text-xs text-gray-600 mb-2">Submitted Code:</p>
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                      {submission.code}
                    </pre>
                  </div>

                  {submission.feedback && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="text-xs text-gray-600 mb-2">Feedback:</p>
                      <p className="text-sm text-gray-800">{submission.feedback}</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleGradeSubmission(submission)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
                  >
                    {submission.status === 'reviewed' ? 'Update Grade' : 'Grade Submission'}
                  </button>
                </div>
              ))}

              {submissions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No submissions yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {showCreateClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4">Create New Class</h3>
            <form onSubmit={handleCreateClass}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Class Name</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateClass(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4">Create Assignment</h3>
            <form onSubmit={handleCreateAssignment}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateAssignment(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Grading Modal */}
      {showGrading && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold mb-4">Grade Submission</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2">Student: {selectedSubmission.studentId?.name}</p>
              <p className="text-xs text-gray-500 mb-4">
                Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
              </p>
              <div className="bg-white p-3 rounded border border-gray-200 max-h-60 overflow-y-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap">{selectedSubmission.code}</pre>
              </div>
            </div>

            <form onSubmit={submitGrade}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Points (out of 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Provide constructive feedback..."
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowGrading(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Grade
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard
