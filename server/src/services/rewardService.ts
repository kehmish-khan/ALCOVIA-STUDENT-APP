import { FocusSession, StudentState } from '../../../shared/types'
import { query, queryOne, run } from '../db/database'
import { STUDENT_ID, COINS_PER_SESSION } from '../../../shared/constants'

// Get or create student state
export const getOrCreateStudentState = (): StudentState => {
  const existing = queryOne<StudentState>(
    'SELECT * FROM student_state WHERE studentId = ?',
    [STUDENT_ID]
  )

  if (existing) return existing

  // Create default state
  run(
    `INSERT INTO student_state 
      (studentId, coins, focusStreak, lastFocusDate, todayFocusMinutes)
     VALUES (?, 0, 0, '', 0)`,
    [STUDENT_ID]
  )

  return {
    studentId: STUDENT_ID,
    coins: 0,
    focusStreak: 0,
    lastFocusDate: '',
    todayFocusMinutes: 0
  }
}

// Award coins and update streak for a successful session
// Idempotent — checks rewardGranted flag first
export const grantReward = (session: FocusSession): boolean => {

  // Check if reward already granted — idempotency check
  const existing = queryOne<{ rewardGranted: number }>(
    'SELECT rewardGranted FROM focus_sessions WHERE sessionId = ?',
    [session.sessionId]
  )

  if (existing && existing.rewardGranted === 1) {
    // Already rewarded — skip
    console.log(`Reward already granted for session ${session.sessionId}`)
    return false
  }

  // Get current student state
  const state = getOrCreateStudentState()

  // Calculate new streak
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let newStreak = state.focusStreak
  let newTodayMinutes = state.todayFocusMinutes

  if (state.lastFocusDate === today) {
    newTodayMinutes = state.todayFocusMinutes + session.actualDuration
  } else if (state.lastFocusDate === yesterdayStr) {
    newStreak = state.focusStreak + 1
    newTodayMinutes = session.actualDuration
  } else {
    newStreak = 1
    newTodayMinutes = session.actualDuration
  }

  const newCoins = state.coins + COINS_PER_SESSION

  // Update student state
  run(
    `UPDATE student_state SET 
      coins = ?, focusStreak = ?, lastFocusDate = ?, todayFocusMinutes = ?
     WHERE studentId = ?`,
    [newCoins, newStreak, today, newTodayMinutes, STUDENT_ID]
  )

  // Mark reward as granted — prevents double rewards
  run(
    'UPDATE focus_sessions SET rewardGranted = 1 WHERE sessionId = ?',
    [session.sessionId]
  )

  console.log(`Reward granted for session ${session.sessionId}`)
  return true
}