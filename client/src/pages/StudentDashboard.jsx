import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { lmsClassAPI, lmsAssignmentAPI, lmsSubmissionAPI } from '../services/lmsAPI'
import { FaPlus, FaTrophy, FaCode, FaSignOutAlt, FaClock } from 'react-icons/fa'
import { signOut, auth } from '../services/firebase'
import CodeEditor from '../components/CodeEditor'

const StudentDashboard = () => {
  const [user, setUser] = useState(null)
  const [classes, setClasses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [mySubmissions, setMySubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('classes')
  const navigate = useNavigate()

  // Modals
  const [showJoinClass, setShowJoinClass] = useState(false)
  const [showSubmitAssignment, setShowSubmitAssignment] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [code, setCode] = useState('// Write your code here')

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('lms_user'))
    if (!userData || userData.role !== 'student') {
      navigate('/lms/login')
      return
    }
    setUser(userData)
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [classesRes, submissionsRes] = await Promise.all([
        lmsClassAPI.getAll(),
        lmsSubmissionAPI.getMy()
      ])
      
      setClasses(classesRes.data)
      setMySubmissions(submissionsRes.data)
      
      // Load assignments from all classes
      const allAssignments = []
      for (const cls of classesRes.data) {
        const assignmentsRes = await lmsAssignmentAPI.getByClass(cls._id)
        allAssignments.push(...assignmentsRes.data)
      }
      setAssignments(allAssignments)
    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinClass = async (e) => {
    e.preventDefault()
    try {
      await lmsClassAPI.join(joinCode.toUpperCase())
      setShowJoinClass(false)
      setJoinCode('')
      alert('Successfully joined class!')
      loadData()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to join class')
    }
  }

  const handleSubmitAssignment = async (e) => {
    e.preventDefault()
    try {
      await lmsSubmissionAPI.submit({
        assignmentId: selectedAssignment._id,
        code
      })
      setShowSubmitAssignment(false)
      setCode('// Write your code here')
      alert('Assignment submitted successfully!')
      loadData()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit assignment')
    }
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
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="text-blue-100">Welcome back, {user?.name}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-100">Total Points</p>
              <div className="flex items-center space-x-2">
                <FaTrophy className="text-yellow-300" />
                <p className="text-2xl font-bold">{user?.points || 0}</p>
              </div>
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
            onClick={() => setActiveTab('classes')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'classes' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            My Classes
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'assignments' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'progress' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            My Progress
          </button>
        </div>

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">My Classes</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowJoinClass(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <FaPlus />
                <span>Join Class</span>
              </motion.button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <motion.div
                  key={cls._id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{cls.className}</h3>
                  <p className="text-gray-600 text-sm mb-4">{cls.description || 'No description'}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Teacher: {cls.teacherId?.name || 'Unknown'}
                    </span>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <FaCode />
                      <span className="text-sm">{cls.assignments?.length || 0} tasks</span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {classes.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 mb-4">You haven't joined any classes yet.</p>
                  <button
                    onClick={() => setShowJoinClass(true)}
                    className="text-purple-600 hover:underline font-semibold"
                  >
                    Join your first class now!
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Assignments</h2>
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const submission = mySubmissions.find(s => s.assignmentId?._id === assignment._id)
                const isSubmitted = !!submission
                
                return (
                  <div key={assignment._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">{assignment.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{assignment.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 flex items-center space-x-1">
                          <FaClock />
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </p>
                        {isSubmitted && (
                          <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            submission.status === 'reviewed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {submission.status === 'reviewed' ? `Graded: ${submission.points}/100` : 'Submitted'}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSubmitted && submission.feedback && (
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <p className="text-xs text-gray-600 mb-1">Teacher Feedback:</p>
                        <p className="text-sm text-gray-800">{submission.feedback}</p>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment)
                        if (submission) {
                          setCode(submission.code)
                        } else {
                          setCode('// Write your code here\n\n')
                        }
                        setShowSubmitAssignment(true)
                      }}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full"
                    >
                      {isSubmitted ? 'Resubmit Assignment' : 'Submit Assignment'}
                    </button>
                  </div>
                )
              })}

              {assignments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No assignments available. Join a class to see assignments!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Progress</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">{user?.points || 0}</div>
                <p className="text-gray-600">Total Points</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{mySubmissions.length}</div>
                <p className="text-gray-600">Submissions</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {mySubmissions.filter(s => s.status === 'reviewed').length}
                </div>
                <p className="text-gray-600">Graded</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Submissions</h3>
              <div className="space-y-4">
                {mySubmissions.slice(0, 5).map((submission) => (
                  <div key={submission._id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {submission.assignmentId?.title || 'Unknown Assignment'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Class: {submission.assignmentId?.classId?.className || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {submission.status === 'reviewed' ? (
                          <div>
                            <div className="text-2xl font-bold text-green-600">{submission.points}</div>
                            <p className="text-xs text-gray-600">points</p>
                          </div>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {mySubmissions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No submissions yet. Start completing assignments!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Join Class Modal */}
      {showJoinClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4">Join a Class</h3>
            <p className="text-gray-600 mb-6">Enter the 6-character code provided by your teacher</p>
            <form onSubmit={handleJoinClass}>
              <div className="mb-6">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full border-2 border-gray-300 rounded-lg px-6 py-4 text-2xl font-bold text-center uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="ABC123"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowJoinClass(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Join Class
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Submit Assignment Modal */}
      {showSubmitAssignment && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-4xl w-full my-8"
          >
            <h3 className="text-2xl font-bold mb-2">{selectedAssignment.title}</h3>
            <p className="text-gray-600 mb-4">{selectedAssignment.description}</p>
            
            <form onSubmit={handleSubmitAssignment}>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Your Code</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[300px]"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowSubmitAssignment(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Submit Assignment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard
