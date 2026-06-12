-- Students state table
CREATE TABLE IF NOT EXISTS student_state (
  studentId TEXT PRIMARY KEY,
  coins INTEGER DEFAULT 0,
  focusStreak INTEGER DEFAULT 0,
  lastFocusDate TEXT DEFAULT '',
  todayFocusMinutes INTEGER DEFAULT 0
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  taskId TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  subjectId TEXT NOT NULL,
  chapterId TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'not_started',
  deviceId TEXT NOT NULL,
  logicalClock INTEGER DEFAULT 0,
  updatedAt INTEGER DEFAULT 0,
  isDeleted INTEGER DEFAULT 0,
  isSynced INTEGER DEFAULT 1
);

-- Focus sessions table
CREATE TABLE IF NOT EXISTS focus_sessions (
  sessionId TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  deviceId TEXT NOT NULL,
  targetDuration INTEGER NOT NULL,
  actualDuration INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress',
  failReason TEXT,
  startedAt INTEGER NOT NULL,
  completedAt INTEGER,
  rewardGranted INTEGER DEFAULT 0,
  notificationSent INTEGER DEFAULT 0,
  isSynced INTEGER DEFAULT 1
);

-- Device sync state table
CREATE TABLE IF NOT EXISTS device_sync_state (
  deviceId TEXT NOT NULL,
  studentId TEXT NOT NULL,
  lastSeenClock INTEGER DEFAULT 0,
  PRIMARY KEY (deviceId, studentId)
);