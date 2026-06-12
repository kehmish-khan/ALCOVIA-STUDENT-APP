import { Router, Request, Response } from 'express'

const router = Router()

// POST /webhook/n8n-mock — mock notification sink
// Logs the payload so we can verify n8n fired exactly once
router.post('/n8n-mock', (req: Request, res: Response) => {
  const payload = req.body

  console.log('─────────────────────────────────────')
  console.log('n8n NOTIFICATION RECEIVED')
  console.log('Session ID:', payload.sessionId)
  console.log('Message:', payload.message)
  console.log('Streak:', payload.focusStreak)
  console.log('Coins earned:', payload.coinsEarned)
  console.log('Total coins:', payload.totalCoins)
  console.log('─────────────────────────────────────')

  res.json({ received: true })
})

export { router as webhookRouter }
