import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, Code, CheckCircle, Circle, ChevronRight, 
  ChevronLeft, Award, Lightbulb, ExternalLink, Play,
  Copy, Check 
} from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/store'
import CodeEditor from '../components/CodeEditor'
import Certificate from '../components/Certificate'
import toast from 'react-hot-toast'

const Curriculum = () => {
  const { user, updateUser } = useAuthStore()
  const [curriculums, setCurriculums] = useState([])
  const [selectedCurriculum, setSelectedCurriculum] = useState(null)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [completedLessons, setCompletedLessons] = useState(() => {
    // Load completed lessons from localStorage
    const saved = localStorage.getItem('completedLessons')
    return saved ? JSON.parse(saved) : []
  })
  const [earnedCertificates, setEarnedCertificates] = useState(() => {
    const saved = localStorage.getItem('earnedCertificates')
    return saved ? JSON.parse(saved) : []
  })
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(null)
  const [playgroundCode, setPlaygroundCode] = useState('')
  const [showCertificate, setShowCertificate] = useState(false)
  const [certificateData, setCertificateData] = useState(null)

  // Save completed lessons to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('completedLessons', JSON.stringify(completedLessons))
  }, [completedLessons])

  // Save earned certificates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('earnedCertificates', JSON.stringify(earnedCertificates))
  }, [earnedCertificates])

  useEffect(() => {
    fetchCurriculums()
  }, [])

  // Clear playground when lesson changes
  useEffect(() => {
    setPlaygroundCode('')
  }, [currentLessonIndex, selectedCurriculum])

  const fetchCurriculums = async () => {
    try {
      // Fetch from both endpoints and combine
      const [curriculumRes, learningPathRes] = await Promise.all([
        axios.get('http://localhost:5000/api/curriculum'),
        axios.get('http://localhost:5000/api/learning-path')
      ])
      
      // Get curriculum data (new format)
      const curriculumData = curriculumRes.data || []
      
      // Get learning path data (old format) that have subtopics
      const learningPathData = learningPathRes.data.filter(path => path.subtopics && path.subtopics.length > 0)
      
      // Combine both sources
      const allCurriculums = [...curriculumData, ...learningPathData]
      
      setCurriculums(allCurriculums)
      if (allCurriculums.length > 0) {
        setSelectedCurriculum(allCurriculums[0])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching curriculums:', error)
      setLoading(false)
    }
  }

  const currentLesson = selectedCurriculum?.subtopics?.[currentLessonIndex]

  const handleNext = () => {
    if (currentLessonIndex < selectedCurriculum.subtopics.length - 1) {
      setCurrentLessonIndex(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleCompleteLesson = async () => {
    const lessonId = `${selectedCurriculum._id}-${currentLessonIndex}`
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId])
      
      // Sync progress to backend
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('lms_token')
        const userEmail = user?.email
        
        console.log('🔍 Syncing progress to backend:', {
          email: userEmail,
          topic: selectedCurriculum.topic || selectedCurriculum.title,
          lessonIndex: currentLessonIndex,
          hasToken: !!token
        })
        
        if (token && userEmail) {
          const response = await axios.post('http://localhost:5000/api/curriculum/sync-progress', {
            email: userEmail,
            curriculumId: selectedCurriculum._id,
            topic: selectedCurriculum.topic || selectedCurriculum.title,
            lessonIndex: currentLessonIndex,
            lessonId: lessonId
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          console.log('✅ Progress synced to backend:', response.data)
          
          // Award 10 XP for completing the lesson
          try {
            // Use email to find user (works with both User and LMSUser models)
            const xpResponse = await axios.post(
              'http://localhost:5000/api/users/award-xp',
              { 
                email: userEmail,
                xpToAdd: 10,
                reason: 'Completed lesson'
              },
              { headers: { Authorization: `Bearer ${token}` } }
            )
            
            console.log('🎁 XP awarded:', xpResponse.data)
            toast.success('🎁 +10 XP earned!', { duration: 2000 })
          } catch (xpError) {
            console.error('⚠️ Failed to award XP:', xpError)
          }
          
          // Show progress update toast
          if (response.data.totalProgress) {
            toast.success(`📊 Progress: ${response.data.totalProgress}% complete in ${response.data.topicKey || 'this course'}`, {
              duration: 3000
            })
          }
          
          // Force refresh user profile data immediately
          if (token) {
            try {
              const profileResponse = await axios.get('http://localhost:5000/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
              })
              if (profileResponse.data.success) {
                console.log('🔄 Profile refreshed immediately after sync:', profileResponse.data.user.progress)
                updateUser(profileResponse.data.user)
                localStorage.setItem('lms_user', JSON.stringify(profileResponse.data.user))
              }
            } catch (profileError) {
              console.error('⚠️ Failed to refresh profile:', profileError)
            }
          }
        } else {
          console.warn('⚠️ Cannot sync progress - Missing token or email:', {
            hasToken: !!token,
            hasEmail: !!userEmail
          })
        }
      } catch (error) {
        console.error('❌ Failed to sync progress:', error)
        if (error.response) {
          console.error('Error response:', error.response.data)
        }
        toast.error('Failed to sync progress to server. Your local progress is saved.')
      }
    }

    // Check if this is the last lesson and section is completed
    if (currentLessonIndex === selectedCurriculum.subtopics.length - 1) {
      const sectionName = selectedCurriculum.topic || selectedCurriculum.title
      const certificateId = `cert-${selectedCurriculum._id}`
      
      // Check if certificate already earned
      if (!earnedCertificates.includes(certificateId)) {
        // Mark certificate as earned
        setEarnedCertificates([...earnedCertificates, certificateId])
        
        // Show success toast
        toast.success(`🎉 Congratulations! You've completed ${sectionName}!`, {
          duration: 5000
        })

        // Check if certificate feature is unlocked
        if (hasCertificateUnlocked()) {
          // Calculate stats
          const completedCount = completedLessons.filter(id => 
            id.startsWith(selectedCurriculum._id)
          ).length + 1 // +1 for current lesson
          
          const totalLessons = selectedCurriculum.subtopics.length
          const score = Math.round((completedCount / totalLessons) * 100)
          const timeSpent = Math.ceil(totalLessons * 0.5) // Estimate 30 mins per lesson

          // Show certificate
          setCertificateData({
            userName: user?.name || 'Developer',
            section: sectionName,
            completionDate: new Date().toISOString(),
            score: score,
            totalLessons: totalLessons,
            timeSpent: timeSpent
          })
          setShowCertificate(true)
        } else {
          // Show locked message
          toast('🔒 Certificate earned! Purchase Certificate Template Upgrade in Store (300 coins) to view and download it.', {
            duration: 6000,
            icon: '🎓'
          })
        }
      }
    } else {
      handleNext()
    }
  }

  const isLessonCompleted = (index) => {
    const lessonId = `${selectedCurriculum?._id}-${index}`
    return completedLessons.includes(lessonId)
  }

  const isSectionCompleted = () => {
    if (!selectedCurriculum) return false
    const certificateId = `cert-${selectedCurriculum._id}`
    return earnedCertificates.includes(certificateId)
  }

  const hasCertificateUnlocked = () => {
    return user?.unlockedRewards?.includes('certificate') || false
  }

  const viewCertificate = () => {
    if (!selectedCurriculum || !isSectionCompleted()) return
    
    if (!hasCertificateUnlocked()) {
      toast.error('🔒 Certificate feature locked! Purchase Certificate Template Upgrade in Store (300 coins) to unlock.')
      return
    }
    
    const sectionName = selectedCurriculum.topic || selectedCurriculum.title
    const completedCount = completedLessons.filter(id => 
      id.startsWith(selectedCurriculum._id)
    ).length
    const totalLessons = selectedCurriculum.subtopics.length
    const score = Math.round((completedCount / totalLessons) * 100)
    const timeSpent = Math.ceil(totalLessons * 0.5)

    setCertificateData({
      userName: user?.name || 'Developer',
      section: sectionName,
      completionDate: new Date().toISOString(),
      score: score,
      totalLessons: totalLessons,
      timeSpent: timeSpent
    })
    setShowCertificate(true)
  }

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(index)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const progressPercentage = selectedCurriculum 
    ? (completedLessons.filter(id => id.startsWith(selectedCurriculum._id)).length / selectedCurriculum.subtopics.length) * 100
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (curriculums.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No curriculum available</h3>
          <p className="mt-1 text-sm text-gray-500">Check back later for structured learning paths.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Certificate Modal */}
      <Certificate 
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        certificateData={certificateData}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Curriculum Learning</h1>
        <p className="text-gray-600">Step-by-step guided learning with practical examples</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Curriculum Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Available Courses</h2>
            <div className="space-y-2">
              {curriculums.map((curriculum) => (
                <button
                  key={curriculum._id}
                  onClick={() => {
                    setSelectedCurriculum(curriculum)
                    setCurrentLessonIndex(0)
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCurriculum?._id === curriculum._id
                      ? 'bg-indigo-50 border-2 border-indigo-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900">
                    {curriculum.topic || curriculum.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {curriculum.subtopics?.length || 0} lessons
                  </div>
                  <div className="text-xs text-indigo-600 mt-1">
                    {curriculum.totalXP || curriculum.xpReward || 0} XP
                  </div>
                </button>
              ))}
            </div>

            {/* Progress */}
            {selectedCurriculum && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-indigo-600">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                
                {/* Certificate Button */}
                {isSectionCompleted() && (
                  <div className="mt-4">
                    {hasCertificateUnlocked() ? (
                      <button
                        onClick={viewCertificate}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg"
                      >
                        <Award className="h-5 w-5" />
                        View Certificate
                      </button>
                    ) : (
                      <button
                        onClick={() => toast.error('🔒 Purchase Certificate Template Upgrade in Store to unlock! (300 coins)')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-400 text-white rounded-lg font-semibold cursor-not-allowed relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg opacity-20"></div>
                        <Award className="h-5 w-5 relative z-10" />
                        <span className="relative z-10 flex items-center gap-2">
                          Certificate Earned
                          <span className="text-2xl">🔒</span>
                        </span>
                      </button>
                    )}
                    {!hasCertificateUnlocked() && (
                      <p className="text-xs text-center text-gray-500 mt-2">
                        💎 Unlock in Store for 300 coins
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Lesson List */}
            {selectedCurriculum && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Lessons</h3>
                <div className="space-y-2">
                  {selectedCurriculum.subtopics.map((lesson, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentLessonIndex(index)}
                      className={`w-full text-left p-2 rounded-lg transition-colors flex items-center gap-2 ${
                        currentLessonIndex === index
                          ? 'bg-indigo-100 text-indigo-900'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {isLessonCompleted(index) ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium line-clamp-2">
                        {lesson.lessonTitle || lesson.lesson_title || lesson.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {currentLesson && (
              <motion.div
                key={currentLessonIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
              >
                {/* Lesson Header */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Lesson {currentLessonIndex + 1} of {selectedCurriculum.subtopics.length}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentLesson.lessonTitle || currentLesson.lesson_title || currentLesson.title}
                  </h2>
                </div>

                {/* Explanation */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 rounded-lg">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                    What You'll Learn
                  </h3>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                    <div className="prose prose-sm max-w-none">
                      {currentLesson.explanation.split('\n\n').map((section, idx) => {
                        const trimmedSection = section.trim()
                        
                        // Check if section starts with ** (heading)
                        const headingMatch = trimmedSection.match(/^\*\*(.+?)\*\*/)
                        if (headingMatch) {
                          const heading = headingMatch[1].trim()
                          const content = trimmedSection.substring(headingMatch[0].length).trim()
                          const lines = content.split('\n').filter(line => line.trim())
                          const hasBullets = lines.some(line => line.trim().startsWith('-'))
                          
                          return (
                            <div key={idx} className="mb-4">
                              <h6 className="font-bold text-base text-blue-800 mb-2.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                                {heading}
                              </h6>
                              {hasBullets ? (
                                <ul className="space-y-2 ml-1">
                                  {lines.filter(line => line.trim().startsWith('-')).map((item, i) => {
                                    const text = item.replace(/^[-•]\s*/, '').trim()
                                    const colonMatch = text.match(/^(.+?)\s*-\s*(.+)$/)
                                    
                                    if (colonMatch) {
                                      return (
                                        <li key={i} className="flex items-start gap-2.5 text-sm">
                                          <span className="text-blue-600 mt-1 flex-shrink-0">▸</span>
                                          <div>
                                            <code className="px-1.5 py-0.5 bg-gray-800 text-blue-400 rounded text-xs font-mono">
                                              {colonMatch[1].trim()}
                                            </code>
                                            <span className="text-gray-700 ml-2">
                                              {colonMatch[2].trim()}
                                            </span>
                                          </div>
                                        </li>
                                      )
                                    } else if (text.includes(':')) {
                                      const [label, ...rest] = text.split(':')
                                      return (
                                        <li key={i} className="flex items-start gap-2.5 text-sm">
                                          <span className="text-blue-600 mt-1 flex-shrink-0">▸</span>
                                          <div>
                                            <strong className="text-gray-900 font-semibold">
                                              {label.trim()}:
                                            </strong>
                                            <span className="text-gray-700 ml-1">
                                              {rest.join(':').trim()}
                                            </span>
                                          </div>
                                        </li>
                                      )
                                    } else {
                                      return (
                                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                                          <span className="text-blue-600 mt-1 flex-shrink-0">▸</span>
                                          <span>{text}</span>
                                        </li>
                                      )
                                    }
                                  })}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-700 leading-relaxed ml-4">
                                  {content}
                                </p>
                              )}
                            </div>
                          )
                        }
                        
                        // Regular paragraph (no heading)
                        const lines = trimmedSection.split('\n')
                        const hasBullets = lines.some(line => line.trim().startsWith('-'))
                        
                        if (hasBullets) {
                          const beforeBullets = lines.filter(line => !line.trim().startsWith('-')).join(' ').trim()
                          const bulletItems = lines.filter(line => line.trim().startsWith('-'))
                          
                          return (
                            <div key={idx} className="mb-3">
                              {beforeBullets && (
                                <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                                  {beforeBullets}
                                </p>
                              )}
                              <ul className="space-y-2 ml-1">
                                {bulletItems.map((item, i) => {
                                  const text = item.replace(/^[-•]\s*/, '').trim()
                                  return (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                                      <span className="text-blue-600 mt-1 flex-shrink-0">▸</span>
                                      <span>{text}</span>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          )
                        }
                        
                        // Plain paragraph
                        return (
                          <p key={idx} className="text-sm text-gray-700 mb-3 leading-relaxed">
                            {trimmedSection}
                          </p>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Code Examples */}
                {(currentLesson.codeExamples || currentLesson.code_examples) && 
                 (currentLesson.codeExamples || currentLesson.code_examples).length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Code className="h-5 w-5 text-indigo-600" />
                      Code Examples
                    </h3>
                    <div className="space-y-4">
                      {(currentLesson.codeExamples || currentLesson.code_examples).map((code, index) => (
                        <div key={index} className="relative">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{code}</code>
                          </pre>
                          <button
                            onClick={() => handleCopyCode(code, index)}
                            className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {copiedCode === index ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Interactive Code Playground */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Play className="h-5 w-5 text-green-600" />
                          Try it yourself - Interactive Playground
                        </h4>
                        <button
                          onClick={() => setPlaygroundCode((currentLesson.codeExamples || currentLesson.code_examples)?.[0] || '')}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Load Example
                        </button>
                      </div>
                      <CodeEditor
                        value={playgroundCode}
                        onChange={setPlaygroundCode}
                        language="auto"
                        height="300px"
                        placeholder="// Try modifying the code examples above or write your own code here..."
                        showRunButton={true}
                      />
                    </div>
                  </div>
                )}

                {/* Practical Tasks */}
                {(currentLesson.practicalTasks || currentLesson.practical_tasks) && 
                 (currentLesson.practicalTasks || currentLesson.practical_tasks).length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5 text-indigo-600" />
                      Practice Tasks
                    </h3>
                    <div className="space-y-4">
                      {(currentLesson.practicalTasks || currentLesson.practical_tasks).map((task, index) => (
                        <div key={index} className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                          <div className="font-medium text-indigo-900 mb-2">Task {index + 1}:</div>
                          <p className="text-indigo-800 mb-3">{task.task}</p>
                          {(task.expectedOutput || task.expected_output) && (
                            <div className="mt-3">
                              <div className="text-xs font-semibold text-indigo-700 mb-1">Expected Output:</div>
                              <pre className="bg-white border border-indigo-200 p-3 rounded text-xs text-gray-800 overflow-x-auto">
                                <code>{task.expectedOutput || task.expected_output}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bonus Tips */}
                {(currentLesson.bonusTips || currentLesson.bonus_tips) && (
                  <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      Pro Tip
                    </h3>
                    <p className="text-yellow-800">{currentLesson.bonusTips || currentLesson.bonus_tips}</p>
                  </div>
                )}

                {/* Resources */}
                {currentLesson.resources && currentLesson.resources.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <ExternalLink className="h-5 w-5 text-indigo-600" />
                      Additional Resources
                    </h3>
                    <div className="space-y-2">
                      {currentLesson.resources.map((resource, index) => {
                        // Handle both "Title: URL" format and plain URL format
                        const parts = resource.includes(': http') ? resource.split(': http') : [resource, resource]
                        const title = parts[0]
                        const url = parts.length > 1 ? 'http' + parts[1] : parts[0]
                        
                        return (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 hover:underline"
                          >
                            <ExternalLink className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm">{title}</span>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={handlePrevious}
                    disabled={currentLessonIndex === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentLessonIndex === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Previous
                  </button>

                  <button
                    onClick={handleCompleteLesson}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    {currentLessonIndex === selectedCurriculum.subtopics.length - 1 ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Complete Course
                      </>
                    ) : (
                      <>
                        Complete & Next
                        <ChevronRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Curriculum
