import { useState, useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { FocusSession } from '../../../shared/types'
import { saveSession } from '../storage/sessionStorage'
import { addSessionToQueue } from '../storage/pendingQueue'
import { updateFocusStats, addCoins } from '../storage/studentStorage'
import { generateId } from '../utils/uuid'
import { getDeviceId } from '../utils/deviceId'
import { STUDENT_ID, COINS_PER_SESSION, APP_BACKGROUND_GRACE_PERIOD_MS } from '../../../shared/constants'

export const useFocusSession = () => {
  const [session, setSession] = useState<FocusSession | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const backgroundTimeRef = useRef<number | null>(null)

  // Start a new focus session
  const startSession = async (targetMinutes: number) => {
    const deviceId = await getDeviceId()

    const newSession: FocusSession = {
      sessionId: generateId(),
      studentId: STUDENT_ID,
      deviceId,
      targetDuration: targetMinutes,
      actualDuration: 0,
      status: 'in_progress',
      failReason: null,
      startedAt: Date.now(),
      completedAt: null,
      rewardGranted: false,
      notificationSent: false,
      isSynced: false
    }

    setSession(newSession)
    setElapsedSeconds(0)
    setIsRunning(true)
    await saveSession(newSession)
  }

  // Complete session successfully
  const completeSession = async (finalSeconds?: number) => {
    if (!session) return

    const seconds = finalSeconds !== undefined ? finalSeconds : elapsedSeconds
    const completed: FocusSession = {
      ...session,
      status: 'success',
      actualDuration: Math.round(seconds / 60),
      completedAt: Date.now()
    }

    setSession(completed)
    setIsRunning(false)

    await saveSession(completed)
    await addSessionToQueue(completed)

    // Update local stats immediately — no need to wait for sync
    await addCoins(COINS_PER_SESSION)
    await updateFocusStats(completed.actualDuration)
  }

  // Abandon session
  const abandonSession = async (reason: 'give_up' | 'app_switch') => {
    if (!session) return

    const abandoned: FocusSession = {
      ...session,
      status: 'abandoned',
      failReason: reason,
      actualDuration: Math.round(elapsedSeconds / 60),
      completedAt: Date.now()
    }

    setSession(abandoned)
    setIsRunning(false)

    await saveSession(abandoned)
    await addSessionToQueue(abandoned)
  }

  // Timer tick — runs every second
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => {
          const newElapsed = prev + 1

          // Check if target duration reached
          if (session && newElapsed >= session.targetDuration * 60) {
            completeSession(newElapsed)
            return prev
          }

          return newElapsed
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, session])

  // Detect app backgrounding
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (!isRunning) return

        if (nextState === 'background' || nextState === 'inactive') {
          // Record when app went to background
          backgroundTimeRef.current = Date.now()
        } else if (nextState === 'active') {
          // App came back — check how long it was gone
          if (backgroundTimeRef.current) {
            const timeAway = Date.now() - backgroundTimeRef.current
            if (timeAway > APP_BACKGROUND_GRACE_PERIOD_MS) {
              abandonSession('app_switch')
            }
            backgroundTimeRef.current = null
          }
        }
      }
    )

    return () => subscription.remove()
  }, [isRunning])

  return {
    session,
    elapsedSeconds,
    isRunning,
    startSession,
    completeSession,
    abandonSession
  }
}