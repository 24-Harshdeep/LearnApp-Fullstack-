import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { lmsClassAPI, lmsAssignmentAPI, lmsSubmissionAPI } from '../services/lmsAPI'
import { FaArrowLeft, FaPlus, FaClipboardList, FaUsers, FaCopy, FaLink, FaFile, FaCheckCircle, FaClock, FaEdit, FaTrash } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function TeacherClassroom() {
  const { classId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [classData, setClassData] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [showCreateAssignment, setShowCreateAssignment] = useState(false)
  const [showSubmissions, setShowSubmissions] = useState(false)
  const [showGrading, setShowGrading] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [attachmentLink, setAttachmentLink] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [maxPoints, setMaxPoints] = useState(100)
  const [feedback, setFeedback] = useState('')
  const [points, setPoints] = useState(0)

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('lms_user') || 'null')
    if (!u || u.role !== 'teacher') {
      navigate('/lms/login')
      return
    }
    loadClassroom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId])

  const loadClassroom = async () => {
    try {
      setLoading(true)
      const [classRes, assignmentsRes] = await Promise.all([
        lmsClassAPI.getOne(classId),
        lmsAssignmentAPI.getByClass(classId)
      ])
      setClassData(classRes.data)
      setAssignments(assignmentsRes.data)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to load classroom')
      navigate('/lms/teacher')
    } finally {
      setLoading(false)
    }
  }

  const createAssignment = async (e) => {
    e.preventDefault()
    try {
      await lmsAssignmentAPI.create({
        classId,
        title,
        description,
        attachmentLink,
        dueDate,
        maxPoints
      })
      toast.success('Assignment created')
      setShowCreateAssignment(false)
      setTitle('')
      setDescription('')
      setAttachmentLink('')
      setDueDate('')
      setMaxPoints(100)
      loadClassroom()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create assignment')
    }
  }

  const deleteAssignment = async (assignmentId) => {
    if (!confirm('Delete this assignment? This will remove all submissions.')) return
    try {
      await lmsAssignmentAPI.delete(assignmentId)
      toast.success('Assignment deleted')
      loadClassroom()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to delete assignment')
    }
  }

  const viewSubmissions = async (assignment) => {
    try {
      setSelectedAssignment(assignment)
      const res = await lmsSubmissionAPI.getByAssignment(assignment._id)
      setSubmissions(res.data)
      setShowSubmissions(true)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to load submissions')
    }
  }

  const gradeSubmission = async (e) => {
    e.preventDefault()
    try {
      await lmsSubmissionAPI.grade(selectedSubmission._id, {
        feedback,
        points,
        status: 'reviewed'
      })
      toast.success('Submission graded')
      setShowGrading(false)
      setFeedback('')
      setPoints(0)
      viewSubmissions(selectedAssignment)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to grade submission')
    }
  }

  const markComplete = async (submissionId) => {
    try {
      await lmsSubmissionAPI.grade(submissionId, {
        status: 'completed'
      })
      toast.success('Marked as complete')
      viewSubmissions(selectedAssignment)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to update status')
    }
  }

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Failed to copy')
    }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/lms/teacher')} className="text-gray-600 hover:text-gray-800">
            <FaArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{classData?.className}</h1>
            <p className="text-sm text-gray-500">{classData?.subject || 'No subject'}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateAssignment(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaPlus /> Post Assignment
        </motion.button>
      </div>

      {/* Class Info Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Join Code</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">{classData?.joinCode}</p>
              <button onClick={() => copy(classData?.joinCode)} className="bg-white/20 hover:bg-white/30 p-2 rounded">
                <FaCopy />
              </button>
            </div>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Students Enrolled</p>
            <p className="text-2xl font-bold">{classData?.students?.length || 0}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Assignments Posted</p>
            <p className="text-2xl font-bold">{assignments.length}</p>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div>
        <h2 className="text-xl font-bold mb-4">Assignments</h2>
        {assignments.length === 0 ? (
          <div className="p-12 bg-white dark:bg-gray-800 rounded-xl text-center">
            <FaClipboardList className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No assignments posted yet</p>
            <button
              onClick={() => setShowCreateAssignment(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post Your First Assignment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {assignments.map((assignment) => (
              <motion.div
                key={assignment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{assignment.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{assignment.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
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
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => viewSubmissions(assignment)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <FaClipboardList /> View Submissions ({assignment.submissions?.length || 0})
                    </button>
                    <button
                      onClick={() => deleteAssignment(assignment._id)}
                      className="text-red-600 hover:text-red-700 p-2"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showCreateAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold mb-4">Post New Assignment</h3>
            <form onSubmit={createAssignment}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g., HTML Basic Structure"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe the assignment requirements..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Attachment Link (optional)</label>
                <input
                  type="url"
                  value={attachmentLink}
                  onChange={(e) => setAttachmentLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Max Points</label>
                <input
                  type="number"
                  value={maxPoints}
                  onChange={(e) => setMaxPoints(e.target.value)}
                  min="1"
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateAssignment(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">
                  Post Assignment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Submissions: {selectedAssignment?.title}</h3>
              <button onClick={() => setShowSubmissions(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            {submissions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No submissions yet</p>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold">{submission.studentId?.name}</p>
                          <span className={`px-2 py-1 rounded text-xs ${
                            submission.status === 'completed' ? 'bg-green-100 text-green-800' :
                            submission.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{submission.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                          {submission.attachmentLink && (
                            <a href={submission.attachmentLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                              <FaLink /> Link
                            </a>
                          )}
                        </div>
                        {submission.feedback && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded">
                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Feedback:</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission)
                            setFeedback(submission.feedback || '')
                            setPoints(submission.points || 0)
                            setShowGrading(true)
                          }}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <FaEdit /> Grade
                        </button>
                        {submission.status !== 'completed' && (
                          <button
                            onClick={() => markComplete(submission._id)}
                            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
                          >
                            <FaCheckCircle /> Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Grading Modal */}
      {showGrading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4">Grade Submission</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Student: {selectedSubmission?.studentId?.name}</p>
            <form onSubmit={gradeSubmission}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Points</label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  min="0"
                  max={selectedAssignment?.maxPoints || 100}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  placeholder="Provide feedback to the student..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowGrading(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">
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
