import { SyncRequest, SyncResponse, FocusSession } from '../../../shared/types'
import { mergeTasks, getTasksAfterClock } from './mergeService'
import { grantReward, getOrCreateStudentState } from './rewardService'
import { sendSessionNotification } from './notificationService'
import { query, queryOne, run } from '../db/database'
import { STUDENT_ID } from '../../../shared/constants'

// Process a full sync request from a device
export const processSyncRequest = async (
  request: SyncRequest
): Promise<SyncResponse> => {

  // Step 1 — Merge incoming tasks
  mergeTasks(request.pendingTasks)

  // Step 2 — Process incoming sessions
  for (const session of request.pendingSessions) {
    await processSession(session)
  }

  // Step 3 — Update device last seen clock
  updateDeviceSyncState(request.deviceId, request.lastSeenClock)

  // Step 4 — Get tasks device hasn't seen yet
  const newTasks = getTasksAfterClock(
    request.studentId,
    request.lastSeenClock
  )

  // Step 5 — Get sessions device hasn't seen yet
  const newSessions = getSessionsAfterClock(
    request.studentId,
    request.lastSeenClock
  )

  // Step 6 — Get latest student state
  const studentState = getOrCreateStudentState()

  // Step 7 — Calculate new last seen clock
  const newLastSeenClock = getCurrentMaxClock(request.studentId)

  return {
    tasks: newTasks,
    sessions: newSessions,
    studentState,
    newLastSeenClock
  }
}

// Process a single focus session
const processSession = async (session: FocusSession): Promise<void> => {

  // Check if session already exists — idempotency
  const existing = queryOne<FocusSession>(
    'SELECT * FROM focus_sessions WHERE sessionId = ?',
    [session.sessionId]
  )

  if (!existing) {
    // Insert new session
    run(
      `INSERT INTO focus_sessions
        (sessionId, studentId, deviceId, targetDuration, actualDuration,
         status, failReason, startedAt, completedAt, rewardGranted, notificationSent, isSynced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 1)`,
      [
        session.sessionId,
        session.studentId,
        session.deviceId,
        session.targetDuration,
        session.actualDuration,
        session.status,
        session.failReason,
        session.startedAt,
        session.completedAt
      ]
    )
  }

  // Grant reward if session was successful
  if (session.status === 'success') {
    const rewardGranted = grantReward(session)
    if (rewardGranted) {
      await sendSessionNotification(session)
    }
  } else if (session.status === 'abandoned') {
    // Notify n8n of abandoned session too — fires once only
    await sendSessionNotification(session)
  }
}

// Update what clock a device has seen
const updateDeviceSyncState = (
  deviceId: string,
  lastSeenClock: number
): void => {
  run(
    `INSERT OR REPLACE INTO device_sync_state 
      (deviceId, studentId, lastSeenClock)
     VALUES (?, ?, ?)`,
    [deviceId, STUDENT_ID, lastSeenClock]
  )
}

// Get sessions after a certain clock
const getSessionsAfterClock = (
  studentId: string,
  lastSeenClock: number
): FocusSession[] => {
  return query<FocusSession>(
    'SELECT * FROM focus_sessions WHERE studentId = ? AND startedAt > ?',
    [studentId, lastSeenClock]
  )
}

// Get current highest logical clock
const getCurrentMaxClock = (studentId: string): number => {
  const result = queryOne<{ maxClock: number }>(
    'SELECT MAX(logicalClock) as maxClock FROM tasks WHERE studentId = ?',
    [studentId]
  )
  return result?.maxClock ?? 0
}