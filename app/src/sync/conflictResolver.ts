import { Task, FocusSession } from '../../../shared/types'
import { shouldUpdate } from '../utils/logicalClock'

// Resolve conflict between local task and incoming task from server
// Returns the task that should be kept
export const resolveTaskConflict = (
  localTask: Task,
  incomingTask: Task
): Task => {

  // Incoming task was deleted — deletion always wins
  if (incomingTask.isDeleted && !localTask.isDeleted) {
    return incomingTask
  }

  // Local task was deleted — keep deletion
  if (localTask.isDeleted && !incomingTask.isDeleted) {
    return localTask
  }

  // Both exist — compare logical clocks
  const incomingWins = shouldUpdate(
    incomingTask.logicalClock,
    incomingTask.deviceId,
    localTask.logicalClock,
    localTask.deviceId
  )

  return incomingWins ? incomingTask : localTask
}

// Merge incoming tasks from server with local tasks
// Returns final list of tasks after conflict resolution
export const mergeIncomingTasks = (
  localTasks: Task[],
  incomingTasks: Task[]
): Task[] => {

  // Start with a copy of local tasks
  const merged = [...localTasks]

  for (const incomingTask of incomingTasks) {
    const localIndex = merged.findIndex(
      t => t.taskId === incomingTask.taskId
    )

    if (localIndex >= 0) {
      // Task exists locally — resolve conflict
      merged[localIndex] = resolveTaskConflict(
        merged[localIndex],
        incomingTask
      )
    } else {
      // New task from server — just add it
      merged.push(incomingTask)
    }
  }

  return merged
}

// Merge incoming sessions — simpler, no conflicts
// Sessions are created on one device only
// Just add any sessions we don't have yet
export const mergeIncomingSessions = (
  localSessions: FocusSession[],
  incomingSessions: FocusSession[]
): FocusSession[] => {

  const merged = [...localSessions]

  for (const incomingSession of incomingSessions) {
    const exists = merged.some(
      s => s.sessionId === incomingSession.sessionId
    )

    if (!exists) {
      merged.push(incomingSession)
    }
  }

  return merged
}