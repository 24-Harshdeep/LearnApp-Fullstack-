import express from 'express'
import Task from '../models/Task.js'

const router = express.Router()

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const { topic, difficulty } = req.query
    const filter = {}
    
    if (topic) filter.topic = topic
    if (difficulty) filter.difficulty = difficulty

    const tasks = await Task.find(filter)
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get specific task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create new task
router.post('/', async (req, res) => {
  try {
    const task = await Task.create(req.body)
    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get task hints
router.get('/:id/hints', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).select('hints')
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    res.json({ hints: task.hints })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
