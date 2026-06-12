import AsyncStorage from '@react-native-async-storage/async-storage'
import { Task, FocusSession, StudentState } from '../types'
import { STUDENT_ID, DEVICE_ID } from '../utils/constants'

// ─── Storage Keys ─────────────────────────────────────────────────────────────
// Namespaced by DEVICE_ID so two browser tabs don't share storage (as per spec)

const key = (suffix: string) => `alcovia_${DEVICE_ID}_${suffix}`

const KEYS = {
  tasks:         key('tasks'),
  sessions:      key('sessions'),
  studentState:  key('student_state'),
  logicalClock:  key('logical_clock'),
  lastSeenClock: key('last_seen_clock'),
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const loadTasks = async (): Promise<Task[]> => {
  // TODO: read from AsyncStorage, parse JSON, return array
  return []
}

export const saveTasks = async (tasks: Task[]): Promise<void> => {
  // TODO: JSON.stringify and write to AsyncStorage
}

export const upsertTask = async (task: Task): Promise<void> => {
  // TODO: load tasks, find by taskId, replace or append, save
}

// ─── Focus Sessions ───────────────────────────────────────────────────────────

export const loadSessions = async (): Promise<FocusSession[]> => {
  // TODO: read from AsyncStorage
  return []
}

export const saveSessions = async (sessions: FocusSession[]): Promise<void> => {
  // TODO: write to AsyncStorage
}

export const upsertSession = async (session: FocusSession): Promise<void> => {
  // TODO: load sessions, find by sessionId, replace or append, save
}

// ─── Student State ────────────────────────────────────────────────────────────

export const loadStudentState = async (): Promise<StudentState> => {
  // TODO: read from AsyncStorage, return default if not found
  return {
    studentId: STUDENT_ID,
    coins: 0,
    focusStreak: 0,
    lastFocusDate: '',
    todayFocusMinutes: 0,
  }
}

export const saveStudentState = async (state: StudentState): Promise<void> => {
  // TODO: write to AsyncStorage
}

// ─── Logical Clock ────────────────────────────────────────────────────────────

export const loadLogicalClock = async (): Promise<number> => {
  // TODO: read saved clock value, return 0 if not found
  return 0
}

export const saveLogicalClock = async (clock: number): Promise<void> => {
  // TODO: persist current clock value
}

// ─── Last Seen Clock ──────────────────────────────────────────────────────────
// Tracks the highest server clock this device has already received

export const loadLastSeenClock = async (): Promise<number> => {
  return 0
}

export const saveLastSeenClock = async (clock: number): Promise<void> => {
  // TODO: persist
}
