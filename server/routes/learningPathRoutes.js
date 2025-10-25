import express from 'express'
import LearningPath from '../models/LearningPath.js'

const router = express.Router()

// Get all modules in learning path
router.get('/', async (req, res) => {
  try {
    const modules = await LearningPath.find().sort({ order: 1 })
    res.json(modules)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get specific module
router.get('/:id', async (req, res) => {
  try {
    const module = await LearningPath.findById(req.params.id)
    if (!module) {
      return res.status(404).json({ message: 'Module not found' })
    }
    res.json(module)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create new module (admin)
router.post('/', async (req, res) => {
  try {
    const module = await LearningPath.create(req.body)
    res.status(201).json(module)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
