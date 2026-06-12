import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'

// ─── ID Generation ────────────────────────────────────────────────────────────

export const generateId = (): string => uuidv4()

// ─── Logical Clock ────────────────────────────────────────────────────────────
// A simple incrementing counter per device
// Stored in AsyncStorage so it survives app restarts

let _clock = 0

export const initClock = (savedClock: number) => {
  _clock = savedClock
}

export const nextClock = (): number => {
  _clock += 1
  return _clock
}

export const currentClock = (): number => _clock

// ─── Date Helpers ─────────────────────────────────────────────────────────────

export const todayString = (): string => {
  return new Date().toISOString().split('T')[0]   // "YYYY-MM-DD"
}

export const unixNow = (): number => Date.now()

// ─── Merge Helper ─────────────────────────────────────────────────────────────
// Given two versions of the same task, return the winner
// Higher logicalClock wins; tie broken by deviceId alphabetically (deterministic)

export const pickWinner = <T extends { logicalClock: number; deviceId: string }>(
  a: T,
  b: T
): T => {
  if (a.logicalClock > b.logicalClock) return a
  if (b.logicalClock > a.logicalClock) return b
  return a.deviceId < b.deviceId ? a : b   // tie-break: alphabetical deviceId
}
