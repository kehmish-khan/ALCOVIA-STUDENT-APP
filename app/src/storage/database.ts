import AsyncStorage from '@react-native-async-storage/async-storage'

// ─── Storage Keys ──────────────────────────────────────────
// All keys in one place — no typos across files
export const STORAGE_KEYS = {
  TASKS: 'tasks',
  SESSIONS: 'sessions',
  STUDENT_STATE: 'student_state',
  PENDING_QUEUE: 'pending_queue',
  LAST_SEEN_CLOCK: 'last_seen_clock',
  DEVICE_ID: 'device_id',
  SUBJECTS: 'subjects',
  CHAPTERS: 'chapters',
}

// ─── Generic Helpers ───────────────────────────────────────

// Save any data to storage — converts to JSON string
export const saveData = async (key: string, data: unknown): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(data))
}

// Read any data from storage — parses JSON string back to object
export const loadData = async <T>(key: string): Promise<T | null> => {
  const raw = await AsyncStorage.getItem(key)

  // Nothing stored yet — return null
  if (!raw) return null

  // Parse and return as the expected type
  return JSON.parse(raw) as T
}

// Delete a specific key from storage
export const removeData = async (key: string): Promise<void> => {
  await AsyncStorage.removeItem(key)
}

// Clear ALL storage — used for testing/reset only
export const clearAllData = async (): Promise<void> => {
  await AsyncStorage.clear()
}