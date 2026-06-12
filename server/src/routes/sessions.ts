import { Router, Request, Response } from 'express'
import { query } from '../db/database'
import { FocusSession } from '../../../shared/types'

const router = Router()

// GET /sessions/:studentId — get all sessions for a student
router.get('/:studentId', (req: Request, res: Response) => {
  try {
    const { studentId } = req.params

    const sessions = query<FocusSession>(
      'SELECT * FROM focus_sessions WHERE studentId = ? ORDER BY startedAt DESC',
      [studentId]
    )

    res.json(sessions)

  } catch (error) {
    console.error('Sessions error:', error)
    res.status(500).json({ error: 'Failed to get sessions' })
  }
})

export default router