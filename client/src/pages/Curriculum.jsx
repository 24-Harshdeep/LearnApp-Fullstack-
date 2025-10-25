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

const Curriculum = () => {
  const { user } = useAuthStore()
  const [curriculums, setCurriculums] = useState([])
  const [selectedCurriculum, setSelectedCurriculum] = useState(null)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [completedLessons, setCompletedLessons] = useState(() => {
    // Load completed lessons from localStorage
    const saved = localStorage.getItem('completedLessons')
    return saved ? JSON.parse(saved) : []
  })
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(null)
  const [playgroundCode, setPlaygroundCode] = useState('')

  // Save completed lessons to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('completedLessons', JSON.stringify(completedLessons))
  }, [completedLessons])

  useEffect(() => {
    fetchCurriculums()
  }, [])

  // Clear playground when lesson changes
  useEffect(() => {
    setPlaygroundCode('')
  }, [currentLessonIndex, selectedCurriculum])

  const fetchCurriculums = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/learning-path')
      // Filter only curriculum-based learning paths (those with subtopics)
      const curriculumPaths = data.filter(path => path.subtopics && path.subtopics.length > 0)
      setCurriculums(curriculumPaths)
      if (curriculumPaths.length > 0) {
        setSelectedCurriculum(curriculumPaths[0])
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

  const handleCompleteLesson = () => {
    const lessonId = `${selectedCurriculum._id}-${currentLessonIndex}`
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId])
      // Here you can also send to backend to track progress
    }
    handleNext()
  }

  const isLessonCompleted = (index) => {
    const lessonId = `${selectedCurriculum?._id}-${index}`
    return completedLessons.includes(lessonId)
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
                  <div className="font-medium text-sm text-gray-900">{curriculum.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{curriculum.subtopics?.length || 0} lessons</div>
                  <div className="text-xs text-indigo-600 mt-1">{curriculum.xpReward} XP</div>
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
                      <span className="text-xs font-medium line-clamp-2">{lesson.lesson_title}</span>
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
                  <h2 className="text-2xl font-bold text-gray-900">{currentLesson.lesson_title}</h2>
                </div>

                {/* Explanation */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Play className="h-5 w-5 text-indigo-600" />
                    What you'll learn
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{currentLesson.explanation}</p>
                </div>

                {/* Code Examples */}
                {currentLesson.code_examples && currentLesson.code_examples.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Code className="h-5 w-5 text-indigo-600" />
                      Code Examples
                    </h3>
                    <div className="space-y-4">
                      {currentLesson.code_examples.map((code, index) => (
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
                          onClick={() => setPlaygroundCode(currentLesson.code_examples[0] || '')}
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
                {currentLesson.practical_tasks && currentLesson.practical_tasks.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5 text-indigo-600" />
                      Practice Tasks
                    </h3>
                    <div className="space-y-4">
                      {currentLesson.practical_tasks.map((task, index) => (
                        <div key={index} className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                          <div className="font-medium text-indigo-900 mb-2">Task {index + 1}:</div>
                          <p className="text-indigo-800 mb-3">{task.task}</p>
                          {task.expected_output && (
                            <div className="mt-3">
                              <div className="text-xs font-semibold text-indigo-700 mb-1">Expected Output:</div>
                              <pre className="bg-white border border-indigo-200 p-3 rounded text-xs text-gray-800 overflow-x-auto">
                                <code>{task.expected_output}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bonus Tips */}
                {currentLesson.bonus_tips && (
                  <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      Pro Tip
                    </h3>
                    <p className="text-yellow-800">{currentLesson.bonus_tips}</p>
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
                      {currentLesson.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="text-sm">{resource}</span>
                        </a>
                      ))}
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
