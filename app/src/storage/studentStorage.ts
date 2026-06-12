import { StudentState } from '../../../shared/types'
import { saveData, loadData, STORAGE_KEYS } from './database'
import { STUDENT_ID } from '../../../shared/constants'

// Default state for a brand new student
const defaultStudentState: StudentState = {
  studentId: STUDENT_ID,
  coins: 0,
  focusStreak: 0,
  lastFocusDate: '',
  todayFocusMinutes: 0
}

// Load student state from storage
export const getStudentState = async (): Promise<StudentState> => {
  const state = await loadData<StudentState>(STORAGE_KEYS.STUDENT_STATE)

  // Return default state if nothing stored yet
  return state ?? defaultStudentState
}

// Save updated student state
export const saveStudentState = async (state: StudentState): Promise<void> => {
  await saveData(STORAGE_KEYS.STUDENT_STATE, state)
}

// Update coins after successful session
export const addCoins = async (amount: number): Promise<void> => {
  const state = await getStudentState()
  await saveStudentState({
    ...state,
    coins: state.coins + amount
  })
}

// Update streak and today's focus minutes after successful session
export const updateFocusStats = async (minutesAdded: number): Promise<void> => {
  const state = await getStudentState()

  // Get today's date as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]

  // Check if student focused yesterday — if not streak resets
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let newStreak = state.focusStreak
  let newTodayMinutes = state.todayFocusMinutes

  if (state.lastFocusDate === today) {
    // Already focused today — just add minutes
    newTodayMinutes = state.todayFocusMinutes + minutesAdded
  } else if (state.lastFocusDate === yesterdayStr) {
    // Focused yesterday — streak continues
    newStreak = state.focusStreak + 1
    newTodayMinutes = minutesAdded
  } else {
    // Missed a day — streak resets to 1
    newStreak = 1
    newTodayMinutes = minutesAdded
  }

  await saveStudentState({
    ...state,
    focusStreak: newStreak,
    todayFocusMinutes: newTodayMinutes,
    lastFocusDate: today
  })
}