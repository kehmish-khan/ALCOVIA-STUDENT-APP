import { Router, Request, Response } from 'express'
import { getOrCreateStudentState } from '../services/rewardService'

const router = Router()

// GET /student/:id — get student state
router.get('/:id', (req: Request, res: Response) => {
  try {
    const studentState = getOrCreateStudentState()
    res.json(studentState)
  } catch (error) {
    console.error('Student state error:', error)
    res.status(500).json({ error: 'Failed to get student state' })
  }
})

export default router