import { Platform } from 'react-native'
import * as Application from 'expo-application'

// Hardcoded single student as per spec
export const STUDENT_ID = 'student_001'

// Each device gets a stable unique ID
// In Expo we derive it from the install ID
export const DEVICE_ID = Application.applicationId ?? 'device_web'

// Server URL — change to your local IP when testing on a real device
export const SERVER_URL = 'http://localhost:3001'

// Focus session config
export const APP_SWITCH_GRACE_PERIOD_MS = 5000   // 5 seconds
export const MIN_FOCUS_MINUTES = 25
export const MAX_FOCUS_MINUTES = 120

// Rewards
export const COINS_PER_SESSION = 50

// Sync
export const SYNC_INTERVAL_MS = 10000   // try to sync every 10 seconds when online
