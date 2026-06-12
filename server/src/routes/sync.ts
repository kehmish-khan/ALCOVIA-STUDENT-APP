import { Router, Request, Response } from 'express'
import { processSyncRequest } from '../services/syncService'
import { SyncRequest } from '../../../shared/types'

const router = Router()

// POST /sync — main sync endpoint
router.post('/', async (req: Request, res: Response) => {
  try {
    const syncRequest: SyncRequest = req.body


    // Validate request
    if (!syncRequest.studentId || !syncRequest.deviceId) {
      res.status(400).json({ error: 'Missing studentId or deviceId' })
      return
    }

    // Process sync
    const response = await processSyncRequest(syncRequest)

    res.json(response)

  } catch (error) {
    console.error('Sync error:', error)
    res.status(500).json({ error: 'Sync failed' })
  }
})

export default router