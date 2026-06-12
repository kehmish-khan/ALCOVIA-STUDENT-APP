import { db } from '../db/database'
import { StudentState } from '../../../app/src/types'

const DEFAULT_STATE: StudentState = {
  studentId: '',
  coins: 0,
  focusStreak: 0,
  lastFocusDate: '',
  todayFocusMinutes: 0,
}

export const getStudentState = async (studentId: string): Promise<StudentState> => {
  // TODO: SELECT from student_state WHERE studentId = ?
  // If not found: INSERT default and return it
  return { ...DEFAULT_STATE, studentId }
}

export const upsertStudentState = async (state: StudentState): Promise<void> => {
  // TODO: INSERT OR REPLACE into student_state
}
