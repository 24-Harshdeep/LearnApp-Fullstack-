import { motion } from 'framer-motion'
import { CheckCircle, Circle, ChevronDown, ChevronUp, BookOpen, Code, Award, Lightbulb } from 'lucide-react'
import { useEffect, useState } from 'react'
import { learningPathAPI, progressAPI } from '../services/api'
import { huggingFaceAPI } from '../services/huggingFaceAPI'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
}

export default function LearningPath() {
  const [modules, setModules] = useState([])
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState([])
  const [generatedTheory, setGeneratedTheory] = useState({})
  const [generatingLesson, setGeneratingLesson] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      setLoading(true)
      const modulesRes = await learningPathAPI.getAll()
      setModules(modulesRes.data)
      setProgress([]) // Initialize with empty progress for now
      setLoading(false)
    } catch (error) {
      console.error('Error fetching modules:', error)
      toast.error('Failed to load learning path')
      setLoading(false)
    }
  }

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading learning path...</div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Your Learning Path 🎯
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Adaptive curriculum designed for your programming journey
        </p>
      </div>

      <div className="space-y-4">
        {modules.map((module, index) => {
          // Get real progress for this module
          const userProgress = progress.find(p => p.learningPathId === module._id)
          const progressPercent = userProgress?.totalProgress || 0
          const status = progressPercent === 100 ? 'completed' : progressPercent > 0 ? 'in-progress' : 'not-started'
          const isExpanded = expandedModules.includes(module._id)
          const hasCurriculum = module.subtopics && module.subtopics.length > 0
          
          return (
            <motion.div
              key={module._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="mt-1">
                    {status === 'completed' && (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    )}
                    {status === 'in-progress' && (
                      <Circle className="w-8 h-8 text-blue-500 fill-blue-100" />
                    )}
                    {status === 'not-started' && (
                      <Circle className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {module.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyColors[module.difficulty]}`}>
                        {module.difficulty}
                      </span>
                      {hasCurriculum && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                          📚 {module.subtopics.length} Lessons
                        </span>
                      )}
                    </div>
                    
                    {module.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">
                        {module.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {module.topics.map((topic, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ⏱️ {module.estimatedTime}
                      </div>
                      <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        🏆 {module.xpReward} XP
                      </div>
                    </div>
                    
                    {status !== 'not-started' && (
                      <div className="flex items-center space-x-4">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 flex-1">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full h-2 transition-all"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          {progressPercent}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  {hasCurriculum && (
                    <button
                      onClick={() => toggleModule(module._id)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide Lessons
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          View Lessons
                        </>
                      )}
                    </button>
                  )}
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      if (hasCurriculum) {
                        navigate('/curriculum')
                        toast.success(`Opening ${module.title} curriculum!`)
                      } else {
                        toast.success(`Starting ${module.title}!`)
                      }
                    }}
                  >
                    {status === 'completed' ? 'Review' : 'Continue'}
                  </button>
                </div>
              </div>

              {/* Expanded Curriculum Lessons */}
              {isExpanded && hasCurriculum && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Course Curriculum
                  </h4>
                  <div className="space-y-3">
                    {module.subtopics.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-750 transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold text-sm">
                            {lessonIndex + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                              {lesson.lesson_title}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {lesson.explanation}
                            </p>
                            <button
                              className="mb-2 px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition"
                              disabled={generatingLesson === `${module._id}-${lessonIndex}`}
                              onClick={async () => {
                                setGeneratingLesson(`${module._id}-${lessonIndex}`)
                                const prompt = `Generate a concise backend theory for: ${lesson.lesson_title}.`
                                const theory = await huggingFaceAPI.generateTheory(prompt)
                                setGeneratedTheory(prev => ({ ...prev, [`${module._id}-${lessonIndex}`]: theory }))
                                setGeneratingLesson(null)
                              }}
                            >
                              {generatingLesson === `${module._id}-${lessonIndex}` ? 'Generating...' : 'Generate Theory (AI)'}
                            </button>
                            {generatedTheory[`${module._id}-${lessonIndex}`] && (
                              <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded p-2 text-xs text-indigo-800 dark:text-indigo-300 mt-2">
                                <strong>AI Theory:</strong> {generatedTheory[`${module._id}-${lessonIndex}`]}
                              </div>
                            )}
                            
                            {/* Code Examples Preview */}
                            {lesson.code_examples && lesson.code_examples.length > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                  <Code className="w-3 h-3" />
                                  {lesson.code_examples.length} Code Example{lesson.code_examples.length > 1 ? 's' : ''}
                                </div>
                                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                                  <code>{lesson.code_examples[0]}</code>
                                </pre>
                                {lesson.code_examples.length > 1 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    + {lesson.code_examples.length - 1} more example{lesson.code_examples.length - 1 > 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Practice Tasks */}
                            {lesson.practical_tasks && lesson.practical_tasks.length > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                  <Award className="w-3 h-3" />
                                  {lesson.practical_tasks.length} Practice Task{lesson.practical_tasks.length > 1 ? 's' : ''}
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded p-2 text-xs text-indigo-800 dark:text-indigo-300">
                                  {lesson.practical_tasks[0].task}
                                </div>
                              </div>
                            )}

                            {/* Bonus Tips */}
                            {lesson.bonus_tips && (
                              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded p-2 flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                                  {lesson.bonus_tips}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => {
                      navigate('/curriculum')
                      toast.success(`Opening ${module.title} in Curriculum!`)
                    }}
                    className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    Start Learning in Curriculum View
                  </button>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Curriculum Quick Access */}
      <div className="card bg-gradient-to-r from-purple-500 to-pink-600 text-white">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          📚 Structured Curriculum Available
        </h3>
        <p className="mb-4">
          We have <strong>structured step-by-step curriculums</strong> ready for you! 
          Learn HTML, CSS, and JavaScript with detailed lessons, code examples, practice tasks, and pro tips.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <div className="font-bold mb-1">HTML Fundamentals</div>
            <div className="text-sm opacity-90">5 lessons • 500 XP</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <div className="font-bold mb-1">CSS Styling Basics</div>
            <div className="text-sm opacity-90">3 lessons • 600 XP</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <div className="font-bold mb-1">JavaScript Fundamentals</div>
            <div className="text-sm opacity-90">3 lessons • 800 XP</div>
          </div>
        </div>
        <button 
          onClick={() => {
            navigate('/curriculum')
            toast.success('Opening Curriculum!')
          }}
          className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Start Structured Learning
        </button>
      </div>
    </div>
  )
}
