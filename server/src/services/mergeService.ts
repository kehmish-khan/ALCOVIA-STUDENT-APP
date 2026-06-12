import { Task, FocusSession } from '../../../shared/types'
import { query, queryOne, run } from '../db/database'

// Resolve and save incoming task from device
export const mergeTask = (incomingTask: Task): void => {

  // Check if task exists on server
  const existing = queryOne<Task>(
    'SELECT * FROM tasks WHERE taskId = ?',
    [incomingTask.taskId]
  )

  if (!existing) {
    // New task — insert it
    run(
      `INSERT INTO tasks 
        (taskId, studentId, subjectId, chapterId, title, status, deviceId, logicalClock, updatedAt, isDeleted, isSynced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        incomingTask.taskId,
        incomingTask.studentId,
        incomingTask.subjectId,
        incomingTask.chapterId,
        incomingTask.title,
        incomingTask.status,
        incomingTask.deviceId,
        incomingTask.logicalClock,
        incomingTask.updatedAt,
        incomingTask.isDeleted ? 1 : 0
      ]
    )
    return
  }

  // Task exists — check deletion
  if (incomingTask.isDeleted) {
    run(
      'UPDATE tasks SET isDeleted = 1, deviceId = ?, logicalClock = ? WHERE taskId = ?',
      [incomingTask.deviceId, incomingTask.logicalClock, incomingTask.taskId]
    )
    return
  }

  // Compare logical clocks
  const incomingWins = incomingTask.logicalClock > existing.logicalClock ||
    (incomingTask.logicalClock === existing.logicalClock &&
      incomingTask.deviceId > existing.deviceId)

  if (incomingWins) {
    run(
      `UPDATE tasks SET 
        status = ?, deviceId = ?, logicalClock = ?, updatedAt = ?, isDeleted = ?
       WHERE taskId = ?`,
      [
        incomingTask.status,
        incomingTask.deviceId,
        incomingTask.logicalClock,
        incomingTask.updatedAt,
        incomingTask.isDeleted ? 1 : 0,
        incomingTask.taskId
      ]
    )
  }
}

// Merge all incoming tasks
export const mergeTasks = (tasks: Task[]): void => {
  for (const task of tasks) {
    mergeTask(task)
  }
}

// Get all tasks after a certain clock — for sending back to device
export const getTasksAfterClock = (
  studentId: string,
  lastSeenClock: number
): Task[] => {
  return query<Task>(
    'SELECT * FROM tasks WHERE studentId = ? AND logicalClock > ?',
    [studentId, lastSeenClock]
  )
}