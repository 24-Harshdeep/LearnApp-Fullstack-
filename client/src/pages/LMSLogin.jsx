import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { auth, googleProvider, signInWithPopup } from '../services/firebase'
import { lmsAuthAPI } from '../services/lmsAPI'
import { FaGoogle, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa'

const LMSLogin = () => {
  const [loading, setLoading] = useState(false)
  const [showRoleSelect, setShowRoleSelect] = useState(false)
  const [userData, setUserData] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const navigate = useNavigate()

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      // Get ID token
      const idToken = await user.getIdToken()

      // Try to login/register
      const response = await lmsAuthAPI.login({
        idToken,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      })

      if (response.data.needsRole) {
        // New user - show role selection
        setUserData({
          idToken,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        })
        setShowRoleSelect(true)
      } else {
        // Existing user - login complete
        localStorage.setItem('lms_token', response.data.token)
        localStorage.setItem('lms_user', JSON.stringify(response.data.user))
        
        // Navigate based on role
        if (response.data.user.role === 'teacher') {
          navigate('/lms/teacher')
        } else {
          navigate('/lms/student')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      alert(error.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSelection = async (role) => {
    try {
      setLoading(true)
      setSelectedRole(role)

      const response = await lmsAuthAPI.login({
        ...userData,
        role
      })

      localStorage.setItem('lms_token', response.data.token)
      localStorage.setItem('lms_user', JSON.stringify(response.data.user))

      // Navigate based on selected role
      if (role === 'teacher') {
        navigate('/lms/teacher')
      } else {
        navigate('/lms/student')
      }
    } catch (error) {
      console.error('Role selection error:', error)
      alert(error.response?.data?.error || 'Failed to set role')
    } finally {
      setLoading(false)
    }
  }

  if (showRoleSelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome, {userData?.name}! 👋</h1>
            <p className="text-blue-100">Choose your role to get started</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Teacher Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !loading && handleRoleSelection('teacher')}
              className={`bg-white rounded-2xl p-8 cursor-pointer transition-all ${
                selectedRole === 'teacher' ? 'ring-4 ring-yellow-400' : 'hover:shadow-2xl'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaChalkboardTeacher className="text-4xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Teacher</h3>
                <p className="text-gray-600 mb-4">Create classes, assign tasks, and grade submissions</p>
                <ul className="text-sm text-gray-700 space-y-2 text-left">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Create & manage classes
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Assign coding tasks
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Review & grade submissions
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Track student progress
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Student Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !loading && handleRoleSelection('student')}
              className={`bg-white rounded-2xl p-8 cursor-pointer transition-all ${
                selectedRole === 'student' ? 'ring-4 ring-blue-400' : 'hover:shadow-2xl'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUserGraduate className="text-4xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Student</h3>
                <p className="text-gray-600 mb-4">Join classes, complete assignments, and track progress</p>
                <ul className="text-sm text-gray-700 space-y-2 text-left">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Join classes with code
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Submit assignments
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    View feedback & grades
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Track your progress
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>

          {loading && (
            <div className="text-center mt-6">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="text-white mt-2">Setting up your account...</p>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Learning Portal</h1>
          <p className="text-gray-600">Teacher-Student Learning Management System</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <FaGoogle className="text-xl text-red-500" />
              <span>Continue with Google</span>
            </>
          )}
        </motion.button>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Features:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="text-blue-500 mr-2">✓</span>
              Create & join classes with unique codes
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-2">✓</span>
              Submit assignments with code editor
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-2">✓</span>
              Real-time feedback & grading
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-2">✓</span>
              Progress tracking & points system
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}

export default LMSLogin
