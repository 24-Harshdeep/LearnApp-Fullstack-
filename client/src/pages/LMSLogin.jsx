import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { lmsAuthAPI } from '../services/lmsAPI'
import { FaChalkboardTeacher, FaUserGraduate, FaEye, FaEyeSlash, FaArrowLeft, FaGoogle } from 'react-icons/fa'
import { initGoogleAuth } from '../services/firebase'
import toast from 'react-hot-toast'

const LMSLogin = () => {
  const [view, setView] = useState('select') // 'select', 'login', 'register'
  const [selectedRole, setSelectedRole] = useState(null) // 'teacher', 'student'
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Initialize Google Auth on component mount
  useEffect(() => {
    initGoogleAuth().catch(console.error)
  }, [])

  // Initialize Google button when view changes to login or register
  useEffect(() => {
    if (view === 'login' || view === 'register') {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        handleGoogleAuth(view)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [view])

  const handleGoogleAuth = async (authView) => {
    try {
      // Check if role is selected for registration
      if (authView === 'register' && !selectedRole) {
        toast.error('Please select a role first')
        return
      }

      // Check if Google library is loaded
      if (!window.google || !window.google.accounts) {
        toast.error('Google Sign-In is loading... Please try again in a moment.')
        return
      }

      setLoading(true)

      // Initialize Google Sign-In with proper callback
      window.google.accounts.id.initialize({
        client_id: '330221998455-l5920jjq016cubbl4pajd8oqits37hgm.apps.googleusercontent.com',
        callback: async (response) => {
          try {
            console.log('✅ Google credential received')
            
            // Send token to backend
            const res = await lmsAuthAPI.googleLogin({
              token: response.credential,
              role: authView === 'register' ? selectedRole : undefined
            })

            console.log('✅ Backend authentication successful:', res.data.user)

            // Store token and user data
            localStorage.setItem('lms_token', res.data.token)
            localStorage.setItem('lms_user', JSON.stringify(res.data.user))

            // Navigate based on role
            const role = res.data.user?.role
            toast.success(`Welcome ${res.data.user?.name}! 🎉`)
            
            setLoading(false)
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
              if (role === 'teacher') navigate('/lms/teacher')
              else if (role === 'student') navigate('/lms/student')
              else navigate('/')
            }, 500)
          } catch (error) {
            console.error('❌ Google auth backend error:', error)
            toast.error(error.response?.data?.error || 'Google authentication failed')
            setLoading(false)
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true
      })

      // Render the sign-in button in a container
      const buttonDiv = document.getElementById('google-signin-button')
      if (buttonDiv) {
        // Clear any existing button
        buttonDiv.innerHTML = ''
        
        // Render button
        window.google.accounts.id.renderButton(buttonDiv, {
          theme: 'outline',
          size: 'large',
          text: authView === 'login' ? 'signin_with' : 'signup_with',
          width: 320
        })
      }

      // Also try One Tap for login (not registration)
      if (authView === 'login') {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log('⚠️ One Tap not displayed:', notification.getNotDisplayedReason())
          }
          if (notification.isSkippedMoment()) {
            console.log('⚠️ One Tap skipped:', notification.getSkippedReason())
          }
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('❌ Google auth initialization error:', error)
      toast.error('Failed to initialize Google Sign-In')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = view === 'login' ? 'login' : 'register'
      const payload = view === 'login'
        ? { email, password }
        : { name, email, password, role: selectedRole }

      const response = await lmsAuthAPI[endpoint](payload)

      if (view === 'register') {
        // After registration, redirect to login page
        toast.success('Registration successful! Please log in with your credentials.')
        setView('login')
        setName('')
        setPassword('')
        // Keep email filled for convenience
      } else {
        // After login, store token and navigate to dashboard
        localStorage.setItem('lms_token', response.data.token)
        localStorage.setItem('lms_user', JSON.stringify(response.data.user))

        // Navigate to role-specific dashboard
        const role = response.data.user?.role
        toast.success(`Welcome back!`)
        
        if (role === 'teacher') navigate('/lms/teacher')
        else if (role === 'student') navigate('/lms/student')
        else navigate('/')
      }
    } catch (error) {
      toast.error(error.response?.data?.error || `${view === 'login' ? 'Login' : 'Registration'} failed`)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setView('register')
  }

  const resetForm = () => {
    setView('select')
    setSelectedRole(null)
    setName('')
    setEmail('')
    setPassword('')
    setShowPassword(false)
  }

  // Role Selection View
  if (view === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">AI Learning Portal</h1>
            <p className="text-blue-100">Choose your role to continue</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Teacher Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('teacher')}
              className="bg-white rounded-2xl p-8 cursor-pointer hover:shadow-2xl transition-all"
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
              onClick={() => handleRoleSelect('student')}
              className="bg-white rounded-2xl p-8 cursor-pointer hover:shadow-2xl transition-all"
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

          <div className="text-center mt-6">
            <p className="text-white">Already have an account?</p>
            <button
              onClick={() => setView('login')}
              className="text-yellow-300 hover:text-yellow-200 font-semibold underline mt-2"
            >
              Login Here
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Login/Register Form View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      {view === 'login' ? (
        // Login Form
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
        >
          <button
            onClick={resetForm}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>

          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
            <p className="text-gray-600">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="text-center mb-4">
              <button
                type="button"
                onClick={() => setView('select')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Don't have an account? Register
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In Button Container */}
            <div className="flex justify-center">
              <div id="google-signin-button"></div>
            </div>
          </form>
        </motion.div>
      ) : (
        // Register Form
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
        >
          <button
            onClick={resetForm}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>

          <div className="text-center mb-6">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              selectedRole === 'teacher' 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                : 'bg-gradient-to-br from-blue-400 to-purple-500'
            }`}>
              {selectedRole === 'teacher' ? (
                <FaChalkboardTeacher className="text-3xl text-white" />
              ) : (
                <FaUserGraduate className="text-3xl text-white" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Register as {selectedRole === 'teacher' ? 'Teacher' : 'Student'}
            </h2>
            <p className="text-gray-600">Create your account to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="text-center mb-4">
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Already have an account? Login
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In Button Container */}
            <div className="flex justify-center">
              <div id="google-signin-button"></div>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  )
}

export default LMSLogin
