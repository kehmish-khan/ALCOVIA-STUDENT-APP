import axios from 'axios'
import { FocusSession } from '../../../shared/types'
import { queryOne, run } from '../db/database'
import { getOrCreateStudentState } from './rewardService'

// Fire n8n webhook for any session outcome
// Idempotent — fires exactly once per session
export const sendSessionNotification = async (
  session: FocusSession
): Promise<void> => {
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/alcovia'

  // Idempotency check — has notification already been sent?
  const existing = queryOne<{ notificationSent: number }>(
    'SELECT notificationSent FROM focus_sessions WHERE sessionId = ?',
    [session.sessionId]
  )

  if (existing && existing.notificationSent === 1) {
    console.log(`Notification already sent for session ${session.sessionId}`)
    return
  }

  // Get latest student state for notification message
  const studentState = getOrCreateStudentState()

  const isSuccess = session.status === 'success'

  // Build webhook payload
  const payload = {
    sessionId: session.sessionId,
    studentId: session.studentId,
    deviceId: session.deviceId,
    status: session.status,
    actualDuration: session.actualDuration,
    focusStreak: studentState.focusStreak,
    coinsEarned: isSuccess ? 50 : 0,
    totalCoins: studentState.coins,
    message: isSuccess
      ? `Session complete! Streak now ${studentState.focusStreak} days, +50 coins`
      : `Session abandoned (${session.failReason ?? 'unknown reason'})`
  }

  try {
    const response = await axios.post(N8N_WEBHOOK_URL, payload)
    console.log(`Notification sent for session ${session.sessionId} — n8n response: ${JSON.stringify(response.data)}`)

    run(
      'UPDATE focus_sessions SET notificationSent = 1 WHERE sessionId = ?',
      [session.sessionId]
    )

  } catch (error) {
    console.log('Notification webhook failed:', error)
  }
}

// Keep old name as alias for backwards compatibility
export const sendSuccessNotification = sendSessionNotification