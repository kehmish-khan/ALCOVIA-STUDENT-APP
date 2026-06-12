// ─── Shared Types ─────────────────────────────────────────────────────────────
// Used by both the React Native app and the Express server

export type TaskStatus = 'not_started' | 'in_progress' | 'done'
export type SessionStatus = 'in_progress' | 'success' | 'abandoned'
export type FailReason = 'give_up' | 'app_switch' | null

// ─── Syllabus ─────────────────────────────────────────────────────────────────

export interface Subject {
  subjectId: string
  studentId: string
  title: string
}

export interface Chapter {
  chapterId: string
  subjectId: string
  title: string
}

export interface Task {
  taskId: string
  studentId: string
  subjectId: string
  chapterId: string
  title: string
  status: TaskStatus

  // Sync fields
  deviceId: string        // which device last edited this
  logicalClock: number    // increments per change on that device
  updatedAt: number       // unix timestamp — display only, not for conflict resolution
  isDeleted: boolean      // soft delete — never hard delete

  // Local only (not sent to server as a conflict field)
  isSynced: boolean
}

// ─── Focus Sessions ───────────────────────────────────────────────────────────

export interface FocusSession {
  sessionId: string
  studentId: string
  deviceId: string
  targetDuration: number    // minutes
  actualDuration: number    // minutes elapsed
  status: SessionStatus
  failReason: FailReason
  startedAt: number         // unix timestamp
  completedAt: number | null

  // Local only
  isSynced: boolean
}

// ─── Student State ────────────────────────────────────────────────────────────

export interface StudentState {
  studentId: string
  coins: number
  focusStreak: number
  lastFocusDate: string       // "YYYY-MM-DD"
  todayFocusMinutes: number
}

// ─── Sync Protocol ────────────────────────────────────────────────────────────

export interface SyncPayload {
  deviceId: string
  studentId: string
  lastSeenClock: number         // highest clock this device has already received
  tasks: Task[]                 // pending unsynced task changes
  sessions: FocusSession[]      // pending unsynced sessions
}

export interface SyncResponse {
  serverClock: number           // updated lastSeenClock for this device
  tasks: Task[]                 // changes the device hasn't seen yet
  sessions: FocusSession[]      // sessions the device hasn't seen yet
  studentState: StudentState    // latest student state after processing
}

// ─── Device Sync State (server only) ─────────────────────────────────────────

export interface DeviceSyncState {
  deviceId: string
  studentId: string
  lastSeenClock: number
}
