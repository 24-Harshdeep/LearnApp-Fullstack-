import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { lmsClassAPI, lmsAssignmentAPI, lmsSubmissionAPI } from '../services/lmsAPI'
import { FaArrowLeft, FaClipboardList, FaClock, FaLink, FaFile, FaCheckCircle, FaPaperPlane, FaExclamationCircle } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function StudentClassroom() {
  const { classId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [classData, setClassData] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [mySubmissions, setMySubmissions] = useState({})
  const [showSubmit, setShowSubmit] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)

  // Form state
  const [description, setDescription] = useState('')
  const [attachmentLink, setAttachmentLink] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('lms_user') || 'null')
    if (!u || u.role !== 'student') {
      navigate('/lms/login')
      return
    }
    loadClassroom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId])

  const loadClassroom = async () => {
    try {
      setLoading(true)
      const [classRes, assignmentsRes, mySubRes] = await Promise.all([
        lmsClassAPI.getOne(classId),
        lmsAssignmentAPI.getByClass(classId),
        lmsSubmissionAPI.getMy()
      ])
      setClassData(classRes.data)
      setAssignments(assignmentsRes.data)
      
      // Create map of my submissions by assignment ID
      const submissionsMap = {}
      mySubRes.data.forEach(sub => {
        if (sub.assignmentId?._id || sub.assignmentId) {
          const assignId = sub.assignmentId?._id || sub.assignmentId
          submissionsMap[assignId] = sub
        }
      })
      setMySubmissions(submissionsMap)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to load classroom')
      navigate('/lms/student')
    } finally {
      setLoading(false)
    }
  }

  const submitAssignment = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await lmsSubmissionAPI.submit({
        assignmentId: selectedAssignment._id,
        description,
        attachmentLink
      })
      toast.success('Assignment submitted successfully!')
      setShowSubmit(false)
      setDescription('')
      setAttachmentLink('')
      loadClassroom()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to submit assignment')
    } finally {
      setSubmitting(false)
    }
  }

  const getSubmissionStatus = (assignment) => {
    const submission = mySubmissions[assignment._id]
    if (!submission) return { status: 'not_submitted', color: 'gray', icon: FaExclamationCircle }
    if (submission.status === 'completed') return { status: 'Completed', color: 'green', icon: FaCheckCircle }
    if (submission.status === 'reviewed') return { status: 'Reviewed', color: 'blue', icon: FaCheckCircle }
    return { status: 'Submitted', color: 'yellow', icon: FaClock }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/lms/student')} className="text-gray-600 hover:text-gray-800">
          <FaArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{classData?.className}</h1>
          <p className="text-sm text-gray-500">
            Teacher: {classData?.teacherId?.name} • {classData?.subject || 'No subject'}
          </p>
        </div>
      </div>

      {/* Class Info Card */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-purple-100 text-sm">Students Enrolled</p>
            <p className="text-2xl font-bold">{classData?.students?.length || 0}</p>
          </div>
          <div>
            <p className="text-purple-100 text-sm">Total Assignments</p>
            <p className="text-2xl font-bold">{assignments.length}</p>
          </div>
          <div>
            <p className="text-purple-100 text-sm">Submitted</p>
            <p className="text-2xl font-bold">{Object.keys(mySubmissions).length}</p>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div>
        <h2 className="text-xl font-bold mb-4">Assignments</h2>
        {assignments.length === 0 ? (
          <div className="p-12 bg-white dark:bg-gray-800 rounded-xl text-center">
            <FaClipboardList className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No assignments posted yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {assignments.map((assignment) => {
              const status = getSubmissionStatus(assignment)
              const submission = mySubmissions[assignment._id]
              const StatusIcon = status.icon

              return (
                <motion.div
                  key={assignment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{assignment.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 bg-${status.color}-100 text-${status.color}-800`}>
                          <StatusIcon /> {status.status}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{assignment.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <FaClock /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                        <span>Max Points: {assignment.maxPoints}</span>
                        {assignment.attachmentLink && (
                          <a href={assignment.attachmentLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                            <FaLink /> Attachment
                          </a>
                        )}
                      </div>

                      {/* My Submission Status */}
                      {submission && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Submission:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{submission.description}</p>
                          {submission.attachmentLink && (
                            <a href={submission.attachmentLink} target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-1 text-blue-600 hover:underline mb-2">
                              <FaLink /> Your Link
                            </a>
                          )}
                          <p className="text-xs text-gray-500">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
                          {submission.feedback && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded">
                              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Teacher Feedback:</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{submission.feedback}</p>
                              {submission.points > 0 && (
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-2">
                                  Points: {submission.points}/{assignment.maxPoints}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment)
                          if (submission) {
                            setDescription(submission.description)
                            setAttachmentLink(submission.attachmentLink || '')
                          } else {
                            setDescription('')
                            setAttachmentLink('')
                          }
                          setShowSubmit(true)
                        }}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          submission ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                        } text-white`}
                      >
                        <FaPaperPlane /> {submission ? 'Resubmit' : 'Submit Work'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Submit Assignment Modal */}
      {showSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg"
          >
            <h3 className="text-xl font-bold mb-4">Submit: {selectedAssignment?.title}</h3>
            <form onSubmit={submitAssignment}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe your work and approach..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Attachment Link (optional)</label>
                <input
                  type="url"
                  value={attachmentLink}
                  onChange={(e) => setAttachmentLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add a link to your code (GitHub, CodePen, etc.) or other resources
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowSubmit(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 flex items-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane /> Submit Work
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
