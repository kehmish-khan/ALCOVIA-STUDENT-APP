import { Task, FocusSession } from '../../../shared/types'
import { saveData, loadData, STORAGE_KEYS } from './database'

// Shape of the pending queue
interface PendingQueue {
  tasks: Task[]
  sessions: FocusSession[]
}

// Empty queue — default state
const emptyQueue: PendingQueue = {
  tasks: [],
  sessions: []
}

// Load the entire pending queue
export const getPendingQueue = async (): Promise<PendingQueue> => {
  const queue = await loadData<PendingQueue>(STORAGE_KEYS.PENDING_QUEUE)
  return queue ?? emptyQueue
}

// Add a task change to the queue
export const addTaskToQueue = async (task: Task): Promise<void> => {
  const queue = await getPendingQueue()

  // Replace if already in queue — keep only latest change
  const existingIndex = queue.tasks.findIndex(t => t.taskId === task.taskId)

  if (existingIndex >= 0) {
    queue.tasks[existingIndex] = task
  } else {
    queue.tasks.push(task)
  }

  await saveData(STORAGE_KEYS.PENDING_QUEUE, queue)
}

// Add a session to the queue
export const addSessionToQueue = async (session: FocusSession): Promise<void> => {
  const queue = await getPendingQueue()

  // Replace if already in queue
  const existingIndex = queue.sessions.findIndex(
    s => s.sessionId === session.sessionId
  )

  if (existingIndex >= 0) {
    queue.sessions[existingIndex] = session
  } else {
    queue.sessions.push(session)
  }

  await saveData(STORAGE_KEYS.PENDING_QUEUE, queue)
}

// Clear the queue after successful sync
export const clearPendingQueue = async (): Promise<void> => {
  await saveData(STORAGE_KEYS.PENDING_QUEUE, emptyQueue)
}