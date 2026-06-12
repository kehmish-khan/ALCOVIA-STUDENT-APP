import { getPendingQueue, clearPendingQueue } from '../storage/pendingQueue'
import { saveManyTasks, getAllTasks } from '../storage/taskStorage'
import { saveManySession, getAllSessions } from '../storage/sessionStorage'
import { saveStudentState, getStudentState } from '../storage/studentStorage'
import { loadData, saveData, STORAGE_KEYS } from '../storage/database'
import { sendSyncRequest } from './syncClient'
import { mergeIncomingTasks, mergeIncomingSessions } from './conflictResolver'
import { STUDENT_ID } from '../../../shared/constants'
import { getDeviceId } from '../utils/deviceId'

// Run a full sync cycle
// 1. Read pending queue
// 2. Send to server
// 3. Merge response
// 4. Clear queue
export const runSync = async (): Promise<void> => {
  try {
    const deviceId = await getDeviceId()

    // Get last seen clock — what this device has already received
    const lastSeenClock = await loadData<number>(
      STORAGE_KEYS.LAST_SEEN_CLOCK
    ) ?? 0

    // Get all pending changes
    const queue = await getPendingQueue()

    // Build sync request
    const syncRequest = {
      studentId: STUDENT_ID,
      deviceId,
      lastSeenClock,
      pendingTasks: queue.tasks,
      pendingSessions: queue.sessions
    }

    // Send to server and get response
    const response = await sendSyncRequest(syncRequest)

    // Get current local data
    const localTasks = await getAllTasks()
    const localSessions = await getAllSessions()

    // Merge incoming tasks with local tasks
    const mergedTasks = mergeIncomingTasks(
      localTasks,
      response.tasks
    )

    // Merge incoming sessions with local sessions
    const mergedSessions = mergeIncomingSessions(
      localSessions,
      response.sessions
    )

    // Save merged data back to storage
    await saveManyTasks(mergedTasks)
    await saveManySession(mergedSessions)

    // Update student state from server
    // Server is source of truth for coins and streak
    await saveStudentState(response.studentState)

    // Save new last seen clock
    await saveData(
      STORAGE_KEYS.LAST_SEEN_CLOCK,
      response.newLastSeenClock
    )

    // Clear pending queue — everything synced successfully
    await clearPendingQueue()

    console.log('Sync completed successfully')

  } catch (error) {
    // Sync failed — keep pending queue intact for next attempt
    console.log('Sync failed, will retry:', error)
  }
}