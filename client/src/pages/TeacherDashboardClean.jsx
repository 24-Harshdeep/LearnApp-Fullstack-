import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { lmsClassAPI, lmsAssignmentAPI, lmsSubmissionAPI } from '../services/lmsAPI'
import { FaPlus, FaUsers, FaCopy, FaEdit, FaTrash, FaUserMinus, FaSyncAlt, FaClipboardList, FaCheckCircle, FaClock, FaLink, FaFile } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function TeacherDashboardClean() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [showRename, setShowRename] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  // form state
  const [className, setClassName] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [newClassName, setNewClassName] = useState('')

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('lms_user') || 'null')
    if (!u || u.role !== 'teacher') {
      navigate('/lms/login')
      return
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const res = await lmsClassAPI.getAll()
      setClasses(res.data)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  const createClass = async (e) => {
    e.preventDefault()
    try {
      const res = await lmsClassAPI.create({ className, subject, description })
      toast.success('Class created')
      setShowCreate(false)
      setClassName('')
      setSubject('')
      setDescription('')
      setClasses([res.data, ...classes])
      setSelectedClass(res.data)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create class')
    }
  }

  const renameClass = async (e) => {
    e.preventDefault()
    if (!selectedClass) return
    try {
      await lmsClassAPI.rename(selectedClass._id, newClassName)
      toast.success('Class renamed')
      setShowRename(false)
      setNewClassName('')
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to rename class')
    }
  }

  const deleteClass = async (classId) => {
    try {
      await lmsClassAPI.delete(classId)
      toast.success('Class deleted')
      setShowDeleteConfirm(null)
      setSelectedClass(null)
      setClasses(classes.filter(c => c._id !== classId))
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to delete class')
    }
  }

  const removeStudent = async (studentId) => {
    if (!selectedClass) return
    if (!confirm('Remove this student from the class?')) return
    try {
      await lmsClassAPI.removeStudent(selectedClass._id, studentId)
      toast.success('Student removed')
      // Reload to update student list
      const res = await lmsClassAPI.getOne(selectedClass._id)
      setSelectedClass(res.data)
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to remove student')
    }
  }

  const resetJoinCode = async (classId) => {
    if (!confirm('Generate a new join code? The old code will no longer work.')) return
    try {
      const res = await lmsClassAPI.resetCode(classId)
      toast.success('Join code reset')
      load()
      if (selectedClass && selectedClass._id === classId) {
        const updated = await lmsClassAPI.getOne(classId)
        setSelectedClass(updated.data)
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to reset code')
    }
  }

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Join code copied')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Classes</h1>
          <p className="text-gray-500">Create and manage your classes. Share join codes with students.</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <FaPlus /> Create New Class
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div key={cls._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{cls.className}</h3>
                {cls.subject && <p className="text-sm text-gray-500">{cls.subject}</p>}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <FaUsers /> {cls.students?.length || 0}
                </div>
                <button 
                  onClick={() => {
                    setSelectedClass(cls)
                    setShowDeleteConfirm(cls._id)
                  }}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Delete class"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            {cls.description && <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm">{cls.description}</p>}
            <div className="mt-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 rounded-lg px-4 py-2">
              <div>
                <p className="text-xs text-gray-500">Join Code</p>
                <p className="text-lg font-bold text-blue-600">{cls.joinCode}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copy(cls.joinCode)} className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm">
                  <FaCopy /> Copy
                </button>
                <button onClick={() => resetJoinCode(cls._id)} className="bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm" title="Reset code">
                  <FaSyncAlt />
                </button>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => navigate(`/lms/teacher/class/${cls._id}`)} className="text-blue-600 hover:underline text-sm font-medium">
                Open Classroom →
              </button>
              <button onClick={() => setSelectedClass(cls)} className="text-blue-600 hover:underline text-sm">
                View details
              </button>
              <button 
                onClick={() => {
                  setSelectedClass(cls)
                  setNewClassName(cls.className)
                  setShowRename(true)
                }} 
                className="text-green-600 hover:underline flex items-center gap-1 text-sm"
              >
                <FaEdit /> Rename
              </button>
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="p-8 bg-white dark:bg-gray-800 rounded-xl text-center text-gray-500">
          No classes yet. Click "Create New Class" to start.
        </div>
      )}

      {/* Create class modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Create New Class</h3>
            <form onSubmit={createClass}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Class Name</label>
                <input value={className} onChange={(e) => setClassName(e.target.value)} required placeholder="e.g., Web Development 101" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Subject (optional)</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., HTML/CSS" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Brief description of the class" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <p className="text-xs text-gray-500 mb-4">Note: A unique 6-character join code will be automatically generated for students to join this class.</p>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Create Class</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Rename modal */}
      {showRename && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Rename Class</h3>
            <form onSubmit={renameClass}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">New Class Name</label>
                <input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} required className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowRename(false)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white">Rename</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-red-600">Delete Class</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this class? This will remove all students, assignments, and submissions. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Cancel</button>
              <button onClick={() => deleteClass(showDeleteConfirm)} className="px-4 py-2 rounded-lg bg-red-600 text-white">Delete Class</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Class details */}
      {selectedClass && !showRename && !showDeleteConfirm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{selectedClass.className}</h2>
              {selectedClass.subject && <p className="text-sm text-gray-500">{selectedClass.subject}</p>}
            </div>
            <button onClick={() => setSelectedClass(null)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          {selectedClass.description && <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm mb-4">{selectedClass.description}</p>}
          <div className="mt-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 rounded-lg px-4 py-2 mb-6">
            <div>
              <p className="text-xs text-gray-500">Join Code</p>
              <p className="text-lg font-bold text-blue-600">{selectedClass.joinCode}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => copy(selectedClass.joinCode)} className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                <FaCopy /> Copy
              </button>
              <button onClick={() => resetJoinCode(selectedClass._id)} className="bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                <FaSyncAlt /> Reset
              </button>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FaUsers /> Enrolled Students ({selectedClass.students?.length || 0})
            </h3>
            {selectedClass.students?.length ? (
              <ul className="space-y-2">
                {selectedClass.students.map((s) => (
                  <li key={s._id || s} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2">
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      {s.name || s.email || 'Student'}
                    </span>
                    <button 
                      onClick={() => removeStudent(s._id || s)}
                      className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                      title="Remove student"
                    >
                      <FaUserMinus /> Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No students enrolled yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
