import { FocusSession } from '../../../shared/types'
import { saveData, loadData, STORAGE_KEYS } from './database'

// Load all sessions from storage
export const getAllSessions = async (): Promise<FocusSession[]> => {
  const sessions = await loadData<FocusSession[]>(STORAGE_KEYS.SESSIONS)
  return sessions ?? []
}

// Save a single session — adds or updates it
export const saveSession = async (session: FocusSession): Promise<void> => {
  const sessions = await getAllSessions()

  const existingIndex = sessions.findIndex(
    s => s.sessionId === session.sessionId
  )

  if (existingIndex >= 0) {
    sessions[existingIndex] = session
  } else {
    sessions.push(session)
  }

  await saveData(STORAGE_KEYS.SESSIONS, sessions)
}

// Save multiple sessions at once — used during sync
export const saveManySession = async (incomingSessions: FocusSession[]): Promise<void> => {
  for (const session of incomingSessions) {
    await saveSession(session)
  }
}

// Get all sessions that haven't been synced yet
export const getPendingSessions = async (): Promise<FocusSession[]> => {
  const sessions = await getAllSessions()
  return sessions.filter(s => !s.isSynced)
}

// Mark a session as synced after successful sync
export const markSessionSynced = async (sessionId: string): Promise<void> => {
  const sessions = await getAllSessions()

  const existingIndex = sessions.findIndex(s => s.sessionId === sessionId)

  if (existingIndex >= 0) {
    sessions[existingIndex] = {
      ...sessions[existingIndex],
      isSynced: true
    }
  }

  await saveData(STORAGE_KEYS.SESSIONS, sessions)
}